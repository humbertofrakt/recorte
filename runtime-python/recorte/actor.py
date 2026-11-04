# SPDX-License-Identifier: Apache-2.0
"""The actor of a project (9.10, 9.13) and the nested skeleton (7.11).

`Pose` receives the PROJECT, not a skeleton: the animation says, at each `t`,
which body is alive. Every body a `body` key cites is assembled once, at load
time (`SkeletonData.bodies`), and the turn only swaps which one is posed.

A `skeleton` attachment — the entity — is a whole skeleton inside a slot. Its
root takes `M_boneOfTheSlot x T.R.S` of the attachment as parent, and its pose
comes in two layers: `baseAnimation` underneath, then the animation chosen by
the precedence table of 7.11 on top.
"""

from __future__ import annotations

from typing import Any

from .animation import apply_animation, evaluate_keys, fire_events, fire_physics_resets
from .loader import AnimationData, Key, SkeletonAttachment, SkeletonData
from .skeleton import Frame, Skeleton, frame_of


def _wrapped(animation: AnimationData, t: float, loop: bool) -> float:
    duration = animation.duration
    if loop and duration > 0:
        return t % duration
    return t


def _run_start(keys: list[Key], t: float, same=None) -> float:
    """When the value that holds at `t` started holding.

    Walks back over keys with the same value (or that `same(previous, now)`
    calls the same). A run that reaches the first key holds since the start of
    the animation (9.10: before the first key, the first key), so it starts
    at 0."""
    index = -1
    for i, key in enumerate(keys):
        if key.time <= t:
            index = i
        else:
            break
    if index <= 0:
        return 0.0
    value = keys[index].value
    while index > 0 and (keys[index - 1].value == value
                         or (same is not None and same(keys[index - 1].value, value))):
        index -= 1
    return 0.0 if index == 0 else keys[index].time


def _same_entity(skeleton: Skeleton, slot_name: str):
    """Appendix C, 1 (since 05/10/2026): a key that shows, in the skins of the
    instant, a `skeleton` attachment with the same resolved `uri` as the one in
    force does not restart the child — even under another placeholder name."""
    def same(previous: Any, current: Any) -> bool:
        if not isinstance(previous, str) or not isinstance(current, str):
            return False
        before, _skin = skeleton.resolve_attachment(slot_name, previous)
        after, _skin = skeleton.resolve_attachment(slot_name, current)
        return (isinstance(before, SkeletonAttachment) and isinstance(after, SkeletonAttachment)
                and before.child is not None and after.child is not None
                and before.resolved == after.resolved)
    return same


class NestedInstance:
    """One live entity: the child skeleton, and what each layer is playing."""

    def __init__(self, attachment: SkeletonAttachment) -> None:
        self.resolved = attachment.resolved
        self.skeleton = Skeleton(attachment.child)
        if attachment.skins:
            self.skeleton.set_skins(list(attachment.skins))
        # layer name -> (animation, child time before wrapping, loop, scale)
        self.layers: dict[str, tuple[AnimationData, float, bool, float]] = {}
        # layer name -> (animation, child time) at the last event sample
        self.event_clock: dict[str, tuple[AnimationData, float]] = {}
        # layer name -> (animation, child time) at the last pose: where the
        # `reset` keys of 9.8 were last looked for, on the child's own clock
        self.reset_clock: dict[str, tuple[AnimationData, float]] = {}


def pose_nested(skeleton: Skeleton, animation: AnimationData | None,
                anim_time: float, now: float, loop: bool) -> None:
    """Poses every entity shown by `skeleton`, after its world is ready."""
    pool = skeleton.nested_pool
    used: set[str] = set()
    for slot in skeleton.slots:
        attachment, _skin = skeleton.attachment_for(slot)
        if not isinstance(attachment, SkeletonAttachment) or attachment.child is None:
            continue
        instance = pool.get(slot.name)
        if instance is None or instance.resolved != attachment.resolved:
            if instance is not None:
                skeleton.warn_once(
                    f'NESTED_REPLACED: o slot "{slot.name}" trocou de entidade; '
                    "a nova começa em 0 (7.11)")
            instance = NestedInstance(attachment)
            pool[slot.name] = instance
        used.add(slot.name)
        _pose_instance(skeleton, slot, attachment, instance, animation, anim_time, now, loop)
    for name in list(pool):
        if name not in used:
            skeleton.warn_once(
                f'NESTED_GONE: a entidade do slot "{name}" sumiu (o corpo ou o anexo '
                "não a mostram mais) (7.11, 9.13)")
            del pool[name]


def _pose_instance(skeleton: Skeleton, slot, attachment: SkeletonAttachment,
                   instance: NestedInstance, animation: AnimationData | None,
                   anim_time: float, now: float, loop: bool) -> None:
    child_data: SkeletonData = attachment.child
    child = instance.skeleton
    clock = anim_time if animation is not None else now

    # The child's clock starts at 0 when the attachment becomes active: the
    # `slot/attachment` key that shows it, or the start of the animation.
    activation = 0.0
    nested: dict[str, Any] = {}
    if animation is not None:
        for timeline in animation.timelines:
            if (timeline.type == "slot" and timeline.target == slot.name
                    and timeline.property == "attachment"):
                activation = _run_start(timeline.keys, anim_time,
                                        _same_entity(skeleton, slot.name))
            elif timeline.type == "nested" and timeline.target == slot.name:
                nested[timeline.property or ""] = timeline
    elapsed = max(0.0, clock - activation)

    scale = attachment.time_scale
    if "timeScale" in nested:
        value = evaluate_keys(nested["timeScale"].keys, anim_time)
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            scale = float(value)

    # Which animation plays on top: 7.11, strongest source first.
    top: tuple[AnimationData, float, bool, float] | None = None
    if "animation" in nested:
        timeline = nested["animation"]
        name = evaluate_keys(timeline.keys, anim_time)
        if isinstance(name, str):
            found = child_data.find_animation(name)
            if found is None:
                skeleton.warn_once(
                    f'NESTED_ANIMATION_MISSING: "{name}" não existe no filho do slot "{slot.name}"')
            else:
                start = max(activation, _run_start(timeline.keys, anim_time))
                top = (found, max(0.0, clock - start) * scale, attachment.loop, scale)
        # `null` also wins: no animation on top, and no fallback (9.9).
    elif (attachment.inherit_animation and animation is not None
          and child_data.find_animation(animation.name) is not None):
        top = (child_data.find_animation(animation.name), anim_time * scale, loop, scale)
    elif attachment.animation is not None:
        found = child_data.find_animation(attachment.animation)
        if found is None:
            skeleton.warn_once(
                f'NESTED_ANIMATION_MISSING: "{attachment.animation}" não existe no filho '
                f'do slot "{slot.name}"')
        else:
            top = (found, elapsed * scale, attachment.loop, scale)
    if top is not None and "time" in nested:
        value = evaluate_keys(nested["time"].keys, anim_time)
        if isinstance(value, (int, float)) and not isinstance(value, bool):
            top = (top[0], float(value), top[2], 1.0)

    base: tuple[AnimationData, float, bool, float] | None = None
    if attachment.base_animation is not None:
        found = child_data.find_animation(attachment.base_animation)
        if found is None:
            skeleton.warn_once(
                f'NESTED_ANIMATION_MISSING: baseAnimation "{attachment.base_animation}" '
                f'não existe no filho do slot "{slot.name}"')
        else:
            # Its own clock, looping; untouched by the three `nested` properties.
            base = (found, elapsed * attachment.time_scale, True, attachment.time_scale)

    # Two layers, fixed order (7.11).
    child.set_to_setup_pose()
    if base is not None:
        apply_animation(child, base[0], _wrapped(base[0], base[1], True), reset=False)
    top_time = 0.0
    if top is not None:
        top_time = _wrapped(top[0], top[1], top[2])
        apply_animation(child, top[0], top_time, reset=False)
    instance.layers = {}
    if base is not None:
        instance.layers["base"] = base
    if top is not None:
        instance.layers["top"] = top

    # 7.11: the child's animation counts WHOLE — its `reset` keys too (9.8).
    # They fire on the child's clock, before the `physicsApply` of this same
    # frame (the `update_pose` below), as at the top level (C-262, C-326).
    for layer, (layer_animation, time, layer_loop, _scale) in instance.layers.items():
        previous = instance.reset_clock.get(layer)
        previous_time = float("-inf")
        if previous is not None and previous[0] is layer_animation and previous[1] <= time:
            previous_time = previous[1]
        fire_physics_resets(child, layer_animation, previous_time, time, layer_loop)
        instance.reset_clock[layer] = (layer_animation, time)
    for layer in list(instance.reset_clock):
        if layer not in instance.layers:
            del instance.reset_clock[layer]

    # P = M x T(x, y) . R(rotation) . S(scaleX, scaleY). M is the frame of the
    # slot: its applied bone, with the `transform` of a `slot/bone` key (9.5).
    frame = slot.frame()
    if not isinstance(frame, Frame):
        frame = frame_of(frame)
    child.parent_frame = frame.times_trs(attachment.x, attachment.y, attachment.rotation,
                                         attachment.scale_x, attachment.scale_y)
    child.update_pose(now)
    pose_nested(child, top[0] if top is not None else None, top_time, now,
                top[2] if top is not None else False)


def nested_events(skeleton: Skeleton, sample_time: float, prefix: str = "") -> list[dict]:
    """Events of every entity since the previous sample, named `<slot>/<event>`.

    The child fires on its own clock; the time written in the dump is the
    parent's, mapped back through the child's scale."""
    out: list[dict] = []
    for slot_name, instance in skeleton.nested_pool.items():
        for layer, (animation, time, loop, scale) in instance.layers.items():
            previous = instance.event_clock.get(layer)
            previous_time = float("-inf")
            if previous is not None and previous[0] is animation and previous[1] <= time:
                previous_time = previous[1]
            for event in fire_events(instance.skeleton, animation, previous_time, time, loop):
                event = dict(event)
                event["time"] = sample_time - (time - event["time"]) / (scale or 1.0)
                event["event"] = f"{prefix}{slot_name}/{event['event']}"
                out.append(event)
            instance.event_clock[layer] = (animation, time)
        out.extend(nested_events(instance.skeleton, sample_time, f"{prefix}{slot_name}/"))
    return out


class Actor:
    """A project in motion: one skeleton per body, built once (9.13)."""

    def __init__(self, data: SkeletonData) -> None:
        self.data = data
        self.pool: dict[str, NestedInstance] = {}
        self.skeletons: dict[str | None, Skeleton] = {None: Skeleton(data)}
        for uri, body in data.bodies.items():
            self.skeletons[uri] = Skeleton(body)
        for skeleton in self.skeletons.values():
            # 9.13: an entity continues in the slot of the same name, whatever
            # the body; the instances live with the actor, not the body.
            skeleton.nested_pool = self.pool
        self.stack: list[str] = ["default"]
        self.body: str | None = None
        self.current: Skeleton = self.skeletons[None]
        self._posed: set[str | None] = set()
        self.warnings: list[str] = []

    @property
    def file_skeleton(self) -> Skeleton:
        return self.skeletons[None]

    def warn_once(self, message: str) -> None:
        if message not in self.warnings:
            self.warnings.append(message)

    def set_skins(self, names: list[str]) -> None:
        self.stack = list(names)

    def body_at(self, animation: AnimationData | None, t: float) -> tuple[str | None, list[str]]:
        """`corpoEm` of 9.13, and the skin stack the keys crossed leave."""
        body: str | None = None
        stack = list(self.stack)
        if animation is None:
            return (body, stack)
        for timeline in animation.timelines:
            if timeline.type != "body":
                continue
            for key in timeline.keys:
                if key.time > t:
                    break
                value = key.value if isinstance(key.value, str) else None
                if value is not None and value not in self.skeletons:
                    self.warn_once(f"BODY_MISSING: corpo {value} não carregado; fica o de antes")
                    continue
                body = value
                if not key.keep_skins:
                    stack = ["default"]
        return (body, stack)

    def pose(self, animation: AnimationData | None, anim_time: float, now: float,
             loop: bool, previous_now: float) -> Skeleton:
        body, stack = self.body_at(animation, anim_time)
        skeleton = self.skeletons[body]
        if skeleton.skin_names != stack:
            known = {skin.name for skin in skeleton.data.skins}
            for name in stack:
                if name not in known:
                    self.warn_once(f"BODY_SKIN_MISSING: o corpo {body or '(o arquivo)'} "
                                   f"não tem a pele {name}; ignorada")
            skeleton.set_skins(stack)
        if body != self.body and body in self._posed:
            # 9.13: the skeleton that comes in starts as in its first updatePose.
            for constraint in skeleton.constraints:
                if hasattr(constraint, "physics_reset"):
                    constraint.physics_reset(now)
        self.body = body
        self.current = skeleton
        self._posed.add(body)
        if animation is not None:
            apply_animation(skeleton, animation, anim_time, body=body)
            fire_physics_resets(skeleton, animation, previous_now, now, loop)
        else:
            skeleton.set_to_setup_pose()
        skeleton.update_pose(now)
        pose_nested(skeleton, animation, anim_time, now, loop)
        return skeleton
