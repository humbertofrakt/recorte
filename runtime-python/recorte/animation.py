# SPDX-License-Identifier: Apache-2.0
"""Timelines, curves, event firing and the `Pose` function.

Sections 8 and 9 of the specification. A timeline touches one property of one
target; a property with no timeline stays in the setup pose. Before the first
key the first key holds, after the last key the last key holds.
"""

from __future__ import annotations

import math
from typing import Any

from .loader import (
    AnimationData,
    DriverTarget,
    Key,
    MeshAttachment,
    ParameterData,
    Sequence,
    Timeline,
)
from .skeleton import Skeleton, clamp, order_from_offsets

_BONE_FIELDS = {
    "x": "x", "y": "y", "rotation": "rotation",
    "scaleX": "scale_x", "scaleY": "scale_y",
    "shearX": "shear_x", "shearY": "shear_y",
    "inheritRotation": "inherit_rotation",
    "inheritScale": "inherit_scale",
    "inheritReflection": "inherit_reflection",
}


# ---------------------------------------------------------------------------
# Curves (9.3)
# ---------------------------------------------------------------------------


def _cubic(p0: float, p1: float, p2: float, p3: float, s: float) -> float:
    u = 1 - s
    return (u * u * u * p0 + 3 * u * u * s * p1 + 3 * u * s * s * p2 + s * s * s * p3)


def bezier_param(t0: float, cx1: float, cx2: float, t1: float, t: float) -> float:
    """Solve x(s) == t for s in [0, 1] (9.3).

    The stop condition is on ``s``, not on ``x``. Stopping at
    ``|x(s) - t| <= 1e-6 * span`` is not enough: the error carried into the
    value is multiplied by ``|v'(s)| / |x'(s)|``, which has no upper bound.
    """
    span = t1 - t0
    if span <= 0:
        return 0.0
    epsilon = 1e-12
    low, high, s = 0.0, 1.0, 0.5
    for _ in range(64):
        s = (low + high) / 2
        x = _cubic(t0, cx1, cx2, t1, s)
        if x < t:
            low = s
        else:
            high = s
        if high - low <= epsilon:
            break
    return clamp(s, 0.0, 1.0)


def _clamped_handles(curve: list[float], j: int, t0: float, t1: float) -> tuple[float, float, float, float]:
    cx1, cy1, cx2, cy2 = curve[4 * j:4 * j + 4]
    cx1 = clamp(cx1, t0, t1)
    cx2 = clamp(cx2, cx1, t1)
    return (cx1, cy1, cx2, cy2)


def _interpolable(value: Any) -> bool:
    if isinstance(value, bool) or value is None:
        return False
    if isinstance(value, (int, float)):
        return True
    if isinstance(value, list):
        return bool(value) and all(isinstance(v, (int, float)) and not isinstance(v, bool)
                                   for v in value)
    return False


def _sample_component(k, n, t: float, j: int, v0: float, v1: float, t0: float, t1: float) -> float:
    curve = k.curve
    if curve == "stepped":
        return v0
    if not isinstance(curve, list):
        if t1 == t0:
            return v0
        return v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    cx1, cy1, cx2, cy2 = _clamped_handles(curve, j, t0, t1)
    s = bezier_param(t0, cx1, cx2, t1, t)
    return _cubic(v0, cy1, cy2, v1, s)


def _key_value(key, deform: bool):
    """The value of one key: the widened array on a deform key, else `value`."""
    if deform and getattr(key, "expanded", None) is not None:
        return key.expanded
    return key.value


def expand_deform_keys(keys: list, length: int) -> None:
    """Widens every deform key to the 7.4 layout, once (9.6).

    The spec expands at load time. The layout length is only known once the
    attachment is resolved, so this runs the first time the timeline is used
    and caches the answer on the key.
    """
    if length <= 0:
        return
    for key in keys:
        if key.expanded is None or len(key.expanded) != length:
            key.expanded = _expand_deform(key.value, key.offset, length)


def evaluate_keys(keys: list, t: float, components: int = 1,
                  key_field: str = "time", deform: bool = False) -> Any:
    """Section 9.10 `evaluate`, also used by drivers with `input` for time."""
    if not keys:
        return None
    first = getattr(keys[0], key_field)
    if t <= first:
        return _key_value(keys[0], deform)
    last = getattr(keys[-1], key_field)
    if t >= last:
        return _key_value(keys[-1], deform)

    low, high = 0, len(keys) - 1
    while low < high:
        middle = (low + high + 1) // 2
        if getattr(keys[middle], key_field) <= t:
            low = middle
        else:
            high = middle - 1
    k = keys[low]
    n = keys[low + 1]
    t0 = getattr(k, key_field)
    t1 = getattr(n, key_field)
    if k.curve == "stepped":
        return _key_value(k, deform)
    # A deform key is always interpolable once widened: `value: []` means "no
    # deform", which is a row of zeros (9.6), not an uninterpolable value.
    # Judging the RAW slice instead makes an empty key freeze the whole
    # timeline, and the movement never leaves the first key.
    if not deform and (not _interpolable(k.value) or not _interpolable(n.value)):
        return k.value

    if deform:
        # One curve for every vertex: it interpolates a factor s (9.6).
        if k.curve == "stepped":
            return k.value
        if isinstance(k.curve, list):
            cx1, cy1, cx2, cy2 = _clamped_handles(k.curve, 0, t0, t1)
            s = bezier_param(t0, cx1, cx2, t1, t)
            factor = _cubic(0.0, cy1, cy2, 1.0, s)
        else:
            factor = (t - t0) / (t1 - t0) if t1 != t0 else 0.0
        # 9.6 expands each key to the full 7.4 layout FIRST, each with its own
        # `offset`, and only then interpolates element by element. Interpolating
        # the raw slices instead lines up index 0 of one key with index 0 of the
        # other, and a pair of keys with different offsets then writes the
        # movement to the WRONG vertices. Measured on `heroi.bone`: the `idle`
        # deform of `head/face` runs from an empty key to one at `offset: 4`,
        # and the two runtimes put the same movement on different corners of
        # the face. `_expanded_value` is filled in by the caller, which is the
        # only place that knows the layout length.
        left = getattr(k, "expanded", None)
        right = getattr(n, "expanded", None)
        if left is None or right is None:
            left = k.value if isinstance(k.value, list) else []
            right = n.value if isinstance(n.value, list) else []
        size = max(len(left), len(right))
        out = []
        for i in range(size):
            a = left[i] if i < len(left) else 0.0
            b = right[i] if i < len(right) else 0.0
            out.append(a + (b - a) * factor)
        return out

    if isinstance(k.value, list):
        out = []
        for j in range(len(k.value)):
            v1 = n.value[j] if j < len(n.value) else k.value[j]
            out.append(_sample_component(k, n, t, min(j, components - 1), k.value[j], v1, t0, t1))
        return out
    return _sample_component(k, n, t, 0, float(k.value), float(n.value), t0, t1)


# ---------------------------------------------------------------------------
# Draw order (9.5)
# ---------------------------------------------------------------------------


def apply_parent_key(skeleton: Skeleton, bone: Any, value: Any) -> None:
    """A `parent` key (9.4): None = the parent of the file. A cycle is refused
    by `Bone.set_parent` and the skeleton warns once (L2 PARENT_CYCLE)."""
    if value is None:
        parent = bone.setup_parent
    else:
        parent = skeleton.bone_by_name.get(str(value))
        if parent is None:
            return
    if not bone.set_parent(parent):
        name = parent.name if parent is not None else ""
        skeleton.warn_once(
            f'PARENT_CYCLE: "{bone.name}" não pode virar filho de "{name}" (9.4); chave ignorada')


def draw_order_from_offsets(skeleton: Skeleton, entries: Any) -> list[int]:
    """A `drawOrder` key over the BASE order of 4.4 (array order plus the
    active skins' `drawOrder`), not over the array order. `[]` = base order.
    Case C-280."""
    pairs: list[tuple[int, int]] = []
    if isinstance(entries, list):
        for entry in entries:
            if not isinstance(entry, dict):
                continue
            slot = skeleton.slot_by_name.get(entry.get("slot"))
            if slot is None:
                continue
            offset = entry.get("offset", 0)
            if not isinstance(offset, (int, float)) or isinstance(offset, bool):
                offset = 0
            pairs.append((slot.index, int(offset)))
    return order_from_offsets(list(skeleton.base_draw_order), pairs)


# ---------------------------------------------------------------------------
# Sequences (9.6)
# ---------------------------------------------------------------------------


def sequence_frame(sequence: Sequence, mode: str, index: int, delay: float,
                   key_time: float, t: float) -> int:
    n = sequence.count
    if mode not in ("hold", "once", "loop", "pingpong",
                    "onceReverse", "loopReverse", "pingpongReverse"):
        mode = "hold"
    if mode == "hold" or delay == 0:
        return index
    k = math.floor((t - key_time) / delay + 0.00001)
    if k < 0:
        k = 0
    if mode == "once":
        return min(index + k, n - 1)
    if mode == "loop":
        return (index + k) % n
    if mode == "pingpong":
        p = 2 * n - 2
        if p == 0:
            return 0
        frame = (index + k) % p
        return p - frame if frame >= n else frame
    if mode == "onceReverse":
        return max(n - 1 - (index + k), 0)
    if mode == "loopReverse":
        return n - 1 - ((index + k) % n)
    p = 2 * n - 2
    if p == 0:
        return 0
    frame = (index + k + n - 1) % p
    return p - frame if frame >= n else frame


# ---------------------------------------------------------------------------
# Applying one animation (9.10)
# ---------------------------------------------------------------------------


def _deform_layout(skeleton: Skeleton, slot_name: str, skin_name: str,
                   attachment_name: str) -> int:
    slot = skeleton.slot_by_name.get(slot_name)
    if slot is None:
        return 0
    attachment, _skin = skeleton.resolve_attachment(slot_name, attachment_name)
    if attachment is None:
        return 0
    binding = getattr(attachment, "binding", None)
    if binding is not None:
        return 2 * binding.total
    return 2 * getattr(attachment, "vertex_count", 0)


def _expand_deform(value: Any, offset: int, length: int) -> list[float]:
    out = [0.0] * length
    if isinstance(value, list):
        for i, number in enumerate(value):
            index = offset + i
            if 0 <= index < length:
                out[index] = float(number)
    return out


# Timelines whose `target` must exist in the skeleton being posed (9.10,
# `acharPorNome`). `drawOrder` and `tag` have no target and pass straight.
_TARGETED = {
    "bone": "bone", "slot": "slot", "deform": "slot", "weights": "slot",
    "sequence": "slot", "nested": "slot", "constraint": "constraint",
}


def _target_exists(skeleton: Skeleton, timeline: Timeline) -> bool:
    kind = _TARGETED.get(timeline.type)
    if kind is None:
        return True
    name = timeline.target or ""
    if kind == "bone":
        return name in skeleton.bone_by_name
    if kind == "slot":
        return name in skeleton.slot_by_name
    return any(c.data.name == name for c in skeleton.constraints)


def apply_animation(skeleton: Skeleton, animation: AnimationData, t: float,
                    reset: bool = True, body: str | None = None) -> None:
    """`Pose` of 9.10, without the constraint pass — see `Skeleton.update_pose`.

    With `reset=False` the timelines are written over whatever pose is there:
    the second layer of a nested skeleton (7.11), which only writes the
    properties it has keys for. `body` names the body being posed, for the
    once-only notice of 9.13."""
    if reset:
        skeleton.set_to_setup_pose()
    if animation is None:
        return
    skeleton.tags = list(animation.tags)
    for timeline in animation.timelines:
        if timeline.type in ("event", "body") or timeline.property == "reset":
            continue
        if not _target_exists(skeleton, timeline):
            # 9.10 / 9.13: ignored in this instant, with a notice once per
            # (body, target). 4.7 / 4.8: an external animation whose target the
            # host does not have is the same situation.
            turns = any(tl.type == "body" for tl in animation.timelines)
            code = "BODY_UNMET" if turns else "TARGET_MISSING"
            skeleton.warn_once(
                f"{code}: o corpo {body or '(o arquivo)'} não tem {timeline.type} "
                f"{timeline.target}; timeline ignorada")
            continue
        deform = timeline.type == "deform"
        if deform:
            expand_deform_keys(timeline.keys, _deform_layout(
                skeleton, timeline.target or "", timeline.skin, timeline.attachment or ""))
        if timeline.type == "weights":
            keys = _weights_keys(skeleton, timeline)
            if not keys:
                continue
            value = evaluate_keys(keys, t, 1, deform=True)
        else:
            value = evaluate_keys(timeline.keys, t, timeline.components, deform=deform)
        _write(skeleton, timeline, value, t, animation)


def _write(skeleton: Skeleton, timeline: Timeline, value: Any, t: float,
           animation: AnimationData) -> None:
    kind = timeline.type
    if kind == "bone":
        bone = skeleton.bone_by_name.get(timeline.target)
        if bone is None:
            return
        if timeline.property == "parent":
            apply_parent_key(skeleton, bone, value)
            return
        field = _BONE_FIELDS.get(timeline.property or "")
        if field is not None:
            setattr(bone.local, field, value)
        return
    if kind == "slot":
        slot = skeleton.slot_by_name.get(timeline.target)
        if slot is None:
            return
        prop = timeline.property
        if prop == "bone":
            _write_slot_bone(skeleton, slot, timeline, value, t)
        elif prop == "attachment":
            slot.attachment_name = value if isinstance(value, str) else None
        elif prop == "color" and isinstance(value, list):
            slot.color = [float(v) for v in value]
        elif prop == "darkColor":
            slot.dark_color = [float(v) for v in value] if isinstance(value, list) else None
        elif prop == "visible":
            slot.visible = bool(value)
        return
    if kind == "drawOrder":
        skeleton.draw_order = draw_order_from_offsets(skeleton, value)
        return
    if kind == "deform":
        slot_name = timeline.target or ""
        attachment_name = timeline.attachment or ""
        length = _deform_layout(skeleton, slot_name, timeline.skin, attachment_name)
        if length > 0 and isinstance(value, list) and len(value) == length:
            # Already widened by `expand_deform_keys`, each key with its own
            # `offset`. Widening again here would shift it a second time.
            expanded = [float(v) for v in value]
        else:
            key = _active_key(timeline.keys, t)
            offset = key.offset if key is not None else 0
            expanded = _expand_deform(
                value, offset, length or (len(value) if isinstance(value, list) else 0))
        skeleton.deform[(slot_name, timeline.skin, attachment_name)] = expanded
        return
    if kind == "weights":
        if isinstance(value, list):
            skeleton.weights[(timeline.target or "", timeline.skin,
                              timeline.attachment or "")] = [float(v) for v in value]
        return
    if kind == "sequence":
        slot = skeleton.slot_by_name.get(timeline.target)
        if slot is None or not isinstance(value, dict):
            return
        attachment, _skin = skeleton.resolve_attachment(slot.name, timeline.attachment or "")
        sequence = getattr(attachment, "sequence", None)
        if sequence is None:
            return
        key = _active_key(timeline.keys, t)
        if key is None or t < timeline.keys[0].time:
            slot.sequence_index = sequence.setup
            return
        mode = value.get("mode", "hold")
        index = int(value.get("index", 0) or 0)
        delay = float(value.get("delay", 0) or 0)
        slot.sequence_index = sequence_frame(sequence, str(mode), index, delay, key.time, t)
        return
    if kind == "constraint":
        for constraint in skeleton.constraints:
            if constraint.data.name == timeline.target:
                constraint.set_property(timeline.property or "", value)
        return
    if kind == "parameter":
        skeleton.parameters[timeline.target or ""] = value
        return
    if kind == "morph":
        skeleton.morph_weights[timeline.target or ""] = value
        return
    if kind == "variable":
        variable = skeleton.data.find_variable(timeline.target or "")
        if variable is None:
            return
        if variable.type == "int" and isinstance(value, (int, float)) and not isinstance(value, bool):
            value = int(value)
        skeleton.variables[variable.name] = value
        return
    if kind == "tag":
        tags = list(animation.tags)
        if isinstance(value, list):
            for tag in value:
                if tag not in tags:
                    tags.append(str(tag))
        skeleton.tags = tags
        return
    if kind == "nested":
        state = skeleton.nested_state.setdefault(timeline.target or "", {})
        state[timeline.property or ""] = value


def _write_slot_bone(skeleton: Skeleton, slot, timeline: Timeline, value: Any,
                     t: float) -> None:
    """9.5: the drawing changes bone. `null` = the bone of the file; the key's
    `transform` places the attachment in the new bone; nothing is converted."""
    if value is None:
        slot.bone = slot.setup_bone
        slot.bone_transform = None
        return
    bone = skeleton.bone_by_name.get(str(value))
    if bone is None:
        skeleton.warn_once(
            f'SLOT_BONE_UNMET: o slot "{slot.name}" pede o osso "{value}", que este corpo '
            "não tem; vale o osso de antes (9.5)")
        return
    key = _active_key(timeline.keys, t) or timeline.keys[0]
    slot.bone = bone
    slot.bone_transform = key.transform


def _weights_keys(skeleton: Skeleton, timeline: Timeline) -> list[Key]:
    """9.6: a `weights` key whose size is not the sum of `counts` is ignored."""
    attachment, _skin = skeleton.resolve_attachment(timeline.target or "",
                                                    timeline.attachment or "")
    source = getattr(attachment, "deform_source", None) or attachment
    binding = getattr(source, "binding", None)
    if binding is None:
        skeleton.warn_once(
            f"ORDER_TIMELINE_TARGET: weights em {timeline.target}/{timeline.attachment} "
            "sem binding; timeline ignorada (9.6)")
        return []
    total = binding.total
    keys = [k for k in timeline.keys if isinstance(k.value, list) and len(k.value) == total]
    if len(keys) != len(timeline.keys):
        skeleton.warn_once(
            f"RANGE_WEIGHTS_SIZE: chave de weights em {timeline.target}/{timeline.attachment} "
            f"com tamanho diferente de {total}; chave ignorada (9.6)")
    return keys


def _active_key(keys: list[Key], t: float) -> Key | None:
    active = None
    for key in keys:
        if key.time <= t:
            active = key
        else:
            break
    return active


# ---------------------------------------------------------------------------
# Events (8.6)
# ---------------------------------------------------------------------------


def fire_events(skeleton: Skeleton, animation: AnimationData, previous: float,
                now: float, loop: bool) -> list[dict]:
    fired: list[tuple[float, int, dict]] = []
    duration = animation.duration
    order = 0
    for timeline in animation.timelines:
        if timeline.type != "event":
            continue
        for key in timeline.keys:
            order += 1
            definition = skeleton.data.find_event(key.event or "")
            payload = {
                "int": definition.int_value if definition else 0,
                "float": definition.float_value if definition else 0.0,
                "string": definition.string_value if definition else "",
                "volume": definition.volume if definition else 1.0,
                "balance": definition.balance if definition else 0.0,
            }
            payload.update(key.payload)
            if not loop or duration == 0:
                if previous < key.time <= now:
                    fired.append((key.time, order, {"time": key.time, "event": key.event, **payload}))
                continue
            n = 0
            while True:
                time = key.time + n * duration
                if time > now:
                    break
                if previous < time:
                    fired.append((time, order, {"time": time, "event": key.event, **payload}))
                n += 1
                if n > 100000:
                    break
    fired.sort(key=lambda entry: (entry[0], entry[1]))
    return [entry[2] for entry in fired]


def fire_physics_resets(skeleton: Skeleton, animation: AnimationData, previous: float,
                        now: float, loop: bool) -> int:
    """Timeline `reset` of 9.8: crossing a key calls `physicsReset` (6.5)."""
    fired = 0
    duration = animation.duration
    for timeline in animation.timelines:
        if timeline.type != "constraint" or timeline.property != "reset":
            continue
        constraints = [c for c in skeleton.constraints if c.data.name == timeline.target]
        if not constraints:
            continue
        for key in timeline.keys:
            crossed = False
            if not loop or duration == 0:
                crossed = previous < key.time <= now
            else:
                n = 0
                while True:
                    time = key.time + n * duration
                    if time > now:
                        break
                    if previous < time:
                        crossed = True
                        break
                    n += 1
                    if n > 100000:
                        break
            if crossed:
                for constraint in constraints:
                    if hasattr(constraint, "physics_reset"):
                        constraint.physics_reset(now)
                        fired += 1
    return fired


def active_tags(skeleton: Skeleton, animation: AnimationData, t: float) -> list[str]:
    tags = list(animation.tags)
    for timeline in animation.timelines:
        if timeline.type != "tag":
            continue
        value = evaluate_keys(timeline.keys, t)
        if isinstance(value, list) and t >= timeline.keys[0].time:
            for tag in value:
                if tag not in tags:
                    tags.append(str(tag))
    return tags


# ---------------------------------------------------------------------------
# Parameters and drivers (8.1, 8.2)
# ---------------------------------------------------------------------------


def _wrap(value: float, low: float, high: float) -> float:
    span = high - low
    if span <= 0:
        return low
    return low + ((value - low) % span + span) % span


def parameter_value(skeleton: Skeleton, parameter: ParameterData) -> float:
    if parameter.source is not None:
        bone = skeleton.bone_by_name.get(parameter.source.bone)
        if bone is None:
            return parameter.default
        field = _BONE_FIELDS.get(parameter.source.property)
        if field is None:
            return parameter.default
        raw = float(getattr(bone.applied, field))
        span = parameter.source.to_value - parameter.source.from_value
        if span == 0:
            return parameter.default
        value = parameter.min + (raw - parameter.source.from_value) / span * (parameter.max - parameter.min)
    else:
        value = float(skeleton.parameters.get(parameter.name, parameter.default))
    if parameter.repeat:
        return _wrap(value, parameter.min, parameter.max)
    return clamp(value, parameter.min, parameter.max)


def _setup_of(skeleton: Skeleton, target: DriverTarget) -> Any:
    kind = target.type
    if kind == "bone":
        bone = skeleton.bone_by_name.get(target.target or "")
        field = _BONE_FIELDS.get(target.property or "")
        if bone is None or field is None:
            return 0.0
        return getattr(bone.data, {
            "x": "x", "y": "y", "rotation": "rotation", "scale_x": "scale_x",
            "scale_y": "scale_y", "shear_x": "shear_x", "shear_y": "shear_y",
        }.get(field, field), 0.0)
    if kind == "morph":
        morph = skeleton.data.find_morph(target.target or "")
        return morph.weight if morph else 0.0
    if kind == "parameter":
        parameter = skeleton.data.find_parameter(target.target or "")
        return parameter.default if parameter else 0.0
    if kind == "constraint":
        constraint = skeleton.data.find_constraint(target.target or "")
        return getattr(constraint, "mix", 0.0) if constraint else 0.0
    return 0.0


def apply_driver_target(skeleton: Skeleton, target: DriverTarget, value: Any,
                        mode: str, mix: float) -> None:
    kind = target.type
    if not _interpolable(value):
        if mix < 0.5:
            return
        _write_driver(skeleton, target, value)
        return
    current = _read_driver(skeleton, target)
    if isinstance(value, list):
        if not isinstance(current, list) or len(current) != len(value):
            current = [0.0] * len(value)
        if mode == "replace":
            new = [c + (v - c) * mix for c, v in zip(current, value)]
        else:
            new = [c + v * mix for c, v in zip(current, value)]
    else:
        current = float(current) if isinstance(current, (int, float)) else 0.0
        if mode == "replace":
            new = current + (float(value) - current) * mix
        else:
            new = current + (float(value) - float(_setup_of(skeleton, target))) * mix
    _write_driver(skeleton, target, new)


def _read_driver(skeleton: Skeleton, target: DriverTarget) -> Any:
    kind = target.type
    if kind == "bone":
        bone = skeleton.bone_by_name.get(target.target or "")
        field = _BONE_FIELDS.get(target.property or "")
        if bone is None or field is None:
            return 0.0
        return getattr(bone.applied, field)
    if kind == "slot":
        slot = skeleton.slot_by_name.get(target.target or "")
        if slot is None:
            return 0.0
        if target.property == "color":
            return slot.color
        if target.property == "darkColor":
            return slot.dark_color
        if target.property == "visible":
            return slot.visible
        return slot.attachment_name
    if kind == "constraint":
        for constraint in skeleton.constraints:
            if constraint.data.name == target.target:
                return constraint.values.get(target.property or "", 0.0)
        return 0.0
    if kind == "parameter":
        parameter = skeleton.data.find_parameter(target.target or "")
        if parameter is None:
            return 0.0
        return skeleton.parameters.get(parameter.name, parameter.default)
    if kind == "morph":
        return skeleton.morph_weights.get(target.target or "", 0.0)
    if kind == "variable":
        return skeleton.variables.get(target.target or "", 0.0)
    if kind == "deform":
        return skeleton.deform.get((target.target or "", target.skin, target.attachment or ""))
    return 0.0


def _write_driver(skeleton: Skeleton, target: DriverTarget, value: Any) -> None:
    kind = target.type
    if kind == "bone":
        bone = skeleton.bone_by_name.get(target.target or "")
        if bone is None:
            return
        if target.property == "parent":
            apply_parent_key(skeleton, bone, value)
            bone.update_world()
            _update_descendants(bone)
            return
        field = _BONE_FIELDS.get(target.property or "")
        if field is not None:
            setattr(bone.applied, field, value)
            bone.update_world()
            _update_descendants(bone)
        return
    if kind == "slot":
        slot = skeleton.slot_by_name.get(target.target or "")
        if slot is None:
            return
        if target.property == "color" and isinstance(value, list):
            slot.color = [float(v) for v in value]
        elif target.property == "darkColor":
            slot.dark_color = [float(v) for v in value] if isinstance(value, list) else None
        elif target.property == "visible":
            slot.visible = bool(value)
        elif target.property == "attachment":
            slot.attachment_name = value if isinstance(value, str) else None
        return
    if kind == "drawOrder":
        skeleton.draw_order = draw_order_from_offsets(skeleton, value)
        return
    if kind == "constraint":
        for constraint in skeleton.constraints:
            if constraint.data.name == target.target:
                constraint.set_property(target.property or "", value)
        return
    if kind == "parameter":
        skeleton.parameters[target.target or ""] = value
        return
    if kind == "morph":
        skeleton.morph_weights[target.target or ""] = value
        return
    if kind == "variable":
        variable = skeleton.data.find_variable(target.target or "")
        if variable is None:
            return
        if variable.type == "int" and isinstance(value, (int, float)) and not isinstance(value, bool):
            value = int(value)
        skeleton.variables[variable.name] = value
        return
    if kind == "deform":
        slot_name = target.target or ""
        attachment_name = target.attachment or ""
        length = _deform_layout(skeleton, slot_name, target.skin, attachment_name)
        skeleton.deform[(slot_name, target.skin, attachment_name)] = _expand_deform(
            value, 0, length or (len(value) if isinstance(value, list) else 0))
        return
    if kind == "nested":
        state = skeleton.nested_state.setdefault(target.target or "", {})
        state[target.property or ""] = value


def _update_descendants(bone) -> None:
    for child in bone.children:
        child.update_world()
        _update_descendants(child)
