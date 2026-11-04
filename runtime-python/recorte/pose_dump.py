# SPDX-License-Identifier: Apache-2.0
"""The pose dump of section 12.4.

A probe says what to measure; the dump answers with one sample per requested
time. Angles come out reduced to (-180, 180], as the section demands.
"""

from __future__ import annotations

import math
from typing import Any

from .actor import Actor, nested_events
from .animation import fire_events
from .draw_list import draw_list
from .loader import (
    BoundingBoxAttachment,
    ClippingAttachment,
    MeshAttachment,
    ParticleAttachment,
    PathAttachment,
    PointAttachment,
    RegionAttachment,
    SkeletonData,
)
from .particles import particulas_do_slot

# The attachment types the `vertices` channel of 12.4 reports.
VERTEX_ATTACHMENTS = (RegionAttachment, MeshAttachment, ClippingAttachment, PathAttachment)
from .skeleton import Skeleton, normalized

DEFAULT_MEASURE = ["bones", "slots", "drawOrder", "vertices", "uvs", "events"]

# Tolerances of 3.6, by channel.
TOLERANCES = {
    "position": 1e-3,
    "vertex": 1e-3,
    "angle": 1e-2,
    "matrix": 1e-4,
    "color": 1e-3,
    "uv": 1e-6,
    # 14.1 of `BONE_particles`: a channel of its OWN, on purpose. It used to
    # borrow `position`, and `position` is one of the three that physics
    # loosens below — so a particle case with `physicsDt` would have measured
    # the particles with 1e-2 without anyone asking. A ruler that moves because
    # of an unrelated field is the same family as the green that was never
    # measured.
    "particle": 1e-3,
}

# 3.6: physics is stepped, so its three channels get slack. `particle` is NOT
# among them — a particle is a closed form of the age, with nothing to
# accumulate, whatever the physics of the bone it hangs from does.
PHYSICS_TOLERANCES = dict(TOLERANCES, position=1e-2, vertex=1e-2, matrix=1e-2)

_ANGLE_FIELDS = {"arotation", "ashearX", "ashearY", "rotation"}
_MATRIX_FIELDS = {"a", "b", "c", "d"}


def _round(value: float) -> float:
    if not math.isfinite(value):
        return 0.0
    return float(value)


def _children(skeleton: Skeleton, prefix: str):
    """12.4: the objects of a nested child enter the same channels, keyed with
    the parent's slot name in front — prefix inside prefix."""
    for slot in skeleton.slots:
        instance = skeleton.nested_pool.get(slot.name)
        if instance is None:
            continue
        attachment, _skin = skeleton.attachment_for(slot)
        if getattr(attachment, "resolved", None) != instance.resolved:
            continue
        yield (instance.skeleton, f"{prefix}{slot.name}/")


def _bones_sample(skeleton: Skeleton, prefix: str = "",
                  out: dict | None = None) -> dict[str, dict[str, float]]:
    out = {} if out is None else out
    for bone in skeleton.bones:
        pose = bone.applied
        out[prefix + bone.name] = {
            "a": _round(bone.a), "b": _round(bone.b),
            "c": _round(bone.c), "d": _round(bone.d),
            "worldX": _round(bone.world_x), "worldY": _round(bone.world_y),
            "ax": _round(pose.x), "ay": _round(pose.y),
            "arotation": _round(normalized(pose.rotation)),
            "ascaleX": _round(pose.scale_x), "ascaleY": _round(pose.scale_y),
            "ashearX": _round(normalized(pose.shear_x)),
            "ashearY": _round(normalized(pose.shear_y)),
        }
    for child, child_prefix in _children(skeleton, prefix):
        _bones_sample(child, child_prefix, out)
    return out


def _slots_sample(skeleton: Skeleton, prefix: str = "",
                  out: dict | None = None) -> dict[str, dict[str, Any]]:
    out = {} if out is None else out
    for slot in skeleton.slots:
        attachment, _skin = skeleton.attachment_for(slot)
        entry: dict[str, Any] = {
            "attachment": slot.attachment_name if attachment is not None else None,
            "color": [_round(c) for c in slot.color],
            "visible": bool(slot.visible),
        }
        # 12.4: every field of the slot table is always present, even when
        # empty. A missing field would never fail a case (the harness only
        # compares what the expected file names), yet two runtimes would
        # silently disagree.
        entry["darkColor"] = (
            [_round(c) for c in slot.dark_color] if slot.dark_color is not None else None
        )
        sequence = getattr(attachment, "sequence", None)
        if sequence is None:
            entry["sequenceIndex"] = -1
        else:
            index = slot.sequence_index
            entry["sequenceIndex"] = sequence.setup if index is None else int(index)
        # 9.5: the APPLIED bone of the slot.
        entry["bone"] = slot.bone.name
        out[prefix + slot.name] = entry
    for child, child_prefix in _children(skeleton, prefix):
        _slots_sample(child, child_prefix, out)
    return out


def _frame_uvs(slot, attachment) -> list[float]:
    """Page UVs of the frame this slot is showing (7.10 + 10.4).

    A `sequence` puts each frame in its own rectangle of the page, so the page
    UVs change with the frame even though the stored `uvs` do not. Reading
    `attachment.page_uvs` alone always answers with the setup frame, and an
    attachment whose `path` is only a prefix (`"hand_"`) has no region under
    that name at all: the answer then degrades to the literal corners and every
    texture error in the sequence goes unseen.
    """
    frames = getattr(attachment, "frames", None)
    if not frames or attachment.sequence is None:
        return list(attachment.page_uvs)
    index = slot.sequence_index
    if index is None:
        index = attachment.sequence.setup
    if not 0 <= index < len(frames):
        index = 0
    return list(frames[index][-1])


def _geometry_sample(skeleton: Skeleton, prefix: str = "",
                     channels: tuple[dict, dict, dict, dict] | None = None
                     ) -> tuple[dict, dict, dict, dict]:
    if channels is None:
        channels = ({}, {}, {}, {})
    vertices, uvs, points, boxes = channels
    for slot in skeleton.slots:
        attachment, skin_name = skeleton.attachment_for(slot)
        if attachment is None:
            continue
        key = f"{prefix}{slot.name}/{attachment.name}"
        if isinstance(attachment, BoundingBoxAttachment):
            # A bounding box has a channel of its own (12.4); it never doubles
            # into `vertices`.
            boxes[key] = [_round(v) for v in skeleton.bounding_box_world(slot, attachment)]
        elif isinstance(attachment, PointAttachment):
            x, y, rotation = skeleton.point_world(slot, attachment)
            points[key] = {"x": _round(x), "y": _round(y),
                           "rotation": _round(normalized(rotation))}
        elif isinstance(attachment, VERTEX_ATTACHMENTS):
            # 7.4 gives world vertices to `mesh`, `clipping` and `path` alike,
            # and 7.3 to a `region`. Leaving clipping and path out hides every
            # error in the shape that decides what is drawn and where a path
            # constraint puts its bones.
            vertices[key] = [_round(v) for v in
                             skeleton.world_vertices(slot, attachment, skin_name)]
            if isinstance(attachment, (RegionAttachment, MeshAttachment)):
                uvs[key] = [_round(v) for v in _frame_uvs(slot, attachment)]
    for child, child_prefix in _children(skeleton, prefix):
        _geometry_sample(child, child_prefix, channels)
    return channels


def _particles_sample(skeleton: Skeleton, t: float, animation, duration: float,
                      loop: bool, pose_em, prefix: str = "",
                      out: dict | None = None) -> dict:
    """14.1 of `BONE_particles`: `measure: "particles"`.

    One entry per emitter, keyed `<slot>/<placeholder>`, holding the living
    particles in drawing order, already cut by `maxParticles`. An emitter with
    nobody alive comes out as an EMPTY list and does not disappear from the
    key: disappearing would confuse "there is no particle" with "this reader
    does not implement P".
    """
    out = {} if out is None else out
    for slot in skeleton.ordered_slots():
        attachment, skin_name = skeleton.attachment_for(slot)
        if not isinstance(attachment, ParticleAttachment):
            continue
        key = f"{prefix}{slot.name}/{attachment.name}"
        out[key] = [
            {"flow": p.flow, "index": p.index,
             "birth": _round6(p.birth), "life": _round6(p.life),
             "age": _round6(p.age),
             "x": _round6(p.x), "y": _round6(p.y),
             # 14.1: the angle comes out AS IT IS, never folded into
             # -180..180. `251.145834`, not `-108.854166`.
             "angle": _round6(p.angle), "scale": _round6(p.scale)}
            for p in particulas_do_slot(skeleton, slot, attachment, skin_name,
                                        t, animation, duration, loop, pose_em)
        ]
    for child, child_prefix in _children(skeleton, prefix):
        slot_name = child_prefix[len(prefix):-1]
        _particles_sample(child, t, None, 0.0, False,
                          _pose_em_do_filho(pose_em, slot_name), child_prefix, out)
    return out


def _pose_em_do_filho(pose_em, slot_name: str):
    """The same `pose_em`, aimed at the entity living in `slot_name` (7.11)."""
    if pose_em is None:
        return None

    def dentro(birth: float):
        instance = pose_em(birth).nested_pool.get(slot_name)
        # `None` when the entity was not in that slot at the birth instant.
        # `vivas` then warns and draws nothing, instead of guessing a matrix.
        return None if instance is None else instance.skeleton

    return dentro


def _round6(value: float) -> float:
    """14.1: six places, like the rest of the pose dump."""
    if not math.isfinite(value):
        return 0.0
    return round(float(value), 6)


def build_pose_dump(data: SkeletonData, probe: dict) -> dict:
    """Run the probe against this runtime and return the pose dump."""
    actor = Actor(data)
    if isinstance(probe.get("skins"), list):
        actor.set_skins([str(s) for s in probe["skins"]])

    animation = None
    name = probe.get("animation")
    if isinstance(name, str):
        animation = data.find_animation(name)
    loop = bool(probe.get("loop", False))
    measure = probe.get("measure") or DEFAULT_MEASURE
    physics_dt = float(probe.get("physicsDt") or 0)
    times = [float(t) for t in (probe.get("times") or [0])]

    clock = {"previous": float("-inf")}

    # 7.2: `space: "world"` and `shape: "mesh"` need the bone posed at the
    # BIRTH instant. A second actor answers that, and it is a pure function of
    # `t_i` — the cache only saves work, it never changes an answer.
    poses: dict[float, Skeleton] = {}

    def pose_em(birth: float) -> Skeleton:
        posed = poses.get(birth)
        if posed is None:
            outro = Actor(data)
            if isinstance(probe.get("skins"), list):
                outro.set_skins([str(s) for s in probe["skins"]])
            tempo = birth
            if animation is not None and loop and animation.duration > 0:
                tempo = birth % animation.duration
            outro.pose(animation, tempo, birth, loop, float("-inf"))
            posed = outro.current
            poses[birth] = posed
        return posed

    def pose_at(now: float) -> None:
        animation_time = now
        if animation is not None:
            duration = animation.duration
            animation_time = now % duration if (loop and duration > 0) else now
        actor.pose(animation, animation_time, now, loop, clock["previous"])
        if animation is not None:
            clock["previous"] = now

    samples: list[dict] = []
    previous_time = float("-inf")
    steps = 0
    started = False
    for time in times:
        if physics_dt > 0:
            if not started:
                pose_at(0.0)
                started = True
            target = int(round(time / physics_dt))
            while steps < target:
                steps += 1
                pose_at(steps * physics_dt)
        else:
            pose_at(time)

        skeleton = actor.current
        # 12.4: always present; `null` is the body of the file.
        sample: dict[str, Any] = {"time": time, "body": actor.body}
        if "bones" in measure:
            sample["bones"] = _bones_sample(skeleton)
        if "slots" in measure:
            sample["slots"] = _slots_sample(skeleton)
        if "drawOrder" in measure:
            sample["drawOrder"] = [slot.name for slot in skeleton.ordered_slots()]
        if "drawList" in measure:
            # 12.4: the list of 7.13 already opened, child by child.
            sample["drawList"] = [{"piece": name, "clips": list(masks)}
                                  for name, masks in draw_list(skeleton)]
        if any(channel in measure for channel in ("vertices", "uvs", "points", "boundingBoxes")):
            vertices, uvs, points, boxes = _geometry_sample(skeleton)
            if "vertices" in measure:
                sample["vertices"] = vertices
            if "uvs" in measure:
                sample["uvs"] = uvs
            if "points" in measure:
                sample["points"] = points
            if "boundingBoxes" in measure:
                sample["boundingBoxes"] = boxes
        # The children fire on every sample, measured or not, so their event
        # clock follows the samples (12.4: the window is since the last one).
        child_events = nested_events(skeleton, time)
        if "events" in measure:
            events = (fire_events(actor.file_skeleton, animation, previous_time, time, loop)
                      if animation is not None else [])
            events.extend(child_events)
            events.sort(key=lambda entry: entry["time"])
            sample["events"] = events
        if "particles" in measure:
            # The measure of 14.1 of `BONE_particles`. The particle system
            # works in ANIMATION time: with a loop, `t` and `t + D` are the
            # same instant and give the same frame (6, and case P-003).
            tempo = now_animation_time(animation, time, loop)
            sample["particles"] = _particles_sample(
                skeleton, tempo, animation,
                animation.duration if animation is not None else 0.0,
                loop, pose_em)
        if "tags" in measure:
            sample["tags"] = list(skeleton.tags)
        if "variables" in measure:
            sample["variables"] = dict(skeleton.variables)
        if "parameters" in measure:
            from .animation import parameter_value
            sample["parameters"] = {
                p.name: _round(parameter_value(skeleton, p)) for p in skeleton.data.parameters
            }
        samples.append(sample)
        previous_time = time

    return {"version": "1.0", "samples": samples}


# ---------------------------------------------------------------------------
# Comparing two dumps
# ---------------------------------------------------------------------------


def now_animation_time(animation, t: float, loop: bool) -> float:
    """The animation clock at `t` — what the particle system reads (6)."""
    if animation is not None and loop and animation.duration > 0:
        return t % animation.duration
    return t


def _tolerance_for(pointer: str, field: str, tolerances: dict) -> float:
    if "/particles/" in pointer:
        # 14.1 of `BONE_particles`. TWO rules against TWO different errors, and
        # they are not the same rule said twice:
        #
        #   * the PLAIN difference (never the circular distance a few lines
        #     below) is what catches the 360-degree error — a reader that folds
        #     the angle into -180..180, which the leiame of P-001 says has to
        #     fail. No tolerance ever hid that one: 360 is tens of thousands of
        #     times any sane slack;
        #   * the 1e-3, tighter than the 1e-2 of 3.6, is what catches the small
        #     constant error nobody goes looking for. Both runtimes hit the six
        #     places exactly, so the wider slack buys nothing today and would
        #     only cover a drift tomorrow.
        return tolerances.get("particle", 1e-3)
    if "/uvs/" in pointer:
        return tolerances["uv"]
    if "/vertices/" in pointer or "/boundingBoxes/" in pointer:
        return tolerances["vertex"]
    if field in _ANGLE_FIELDS:
        return tolerances["angle"]
    if field in _MATRIX_FIELDS:
        return tolerances["matrix"]
    if "/color" in pointer or "darkColor" in pointer:
        return tolerances["color"]
    return tolerances["position"]


def _angle_distance(expected: float, actual: float) -> float:
    return abs(((actual - expected + 180) % 360) - 180)


class Difference:
    def __init__(self, pointer: str, expected: Any, actual: Any,
                 delta: float, tolerance: float) -> None:
        self.pointer = pointer
        self.expected = expected
        self.actual = actual
        self.delta = delta
        self.tolerance = tolerance


def compare_pose_dump(expected: dict, actual: dict, tolerances: dict | None = None) -> tuple[bool, list, float]:
    """Compare only what the expected dump names, as the harness of 12.4 does."""
    tolerances = tolerances or TOLERANCES
    differences: list[Difference] = []
    worst = 0.0

    def note(pointer: str, want: Any, got: Any, delta: float, tolerance: float) -> None:
        nonlocal worst
        if math.isfinite(delta):
            worst = max(worst, delta)
        differences.append(Difference(pointer, want, got, delta, tolerance))

    def walk(pointer: str, want: Any, got: Any, field: str) -> None:
        nonlocal worst
        if isinstance(want, dict):
            if not isinstance(got, dict):
                note(pointer, want, got, float("inf"), 0.0)
                return
            for key, value in want.items():
                if key not in got:
                    note(f"{pointer}/{key}", value, None, float("inf"), 0.0)
                    continue
                walk(f"{pointer}/{key}", value, got[key], key)
            return
        if isinstance(want, list):
            if not isinstance(got, list) or len(got) != len(want):
                note(pointer, want, got, float("inf"), 0.0)
                return
            for index, value in enumerate(want):
                walk(f"{pointer}/{index}", value, got[index], field)
            return
        if isinstance(want, bool) or want is None or isinstance(want, str):
            if want != got:
                note(pointer, want, got, float("inf"), 0.0)
            return
        if isinstance(want, (int, float)):
            if not isinstance(got, (int, float)) or isinstance(got, bool):
                note(pointer, want, got, float("inf"), 0.0)
                return
            tolerance = _tolerance_for(pointer, field, tolerances)
            if field in _ANGLE_FIELDS:
                delta = _angle_distance(float(want), float(got))
            else:
                delta = abs(float(want) - float(got))
            if delta > tolerance:
                note(pointer, want, got, delta, tolerance)
            else:
                worst = max(worst, delta)
            return
        if want != got:
            note(pointer, want, got, float("inf"), 0.0)

    want_samples = expected.get("samples") or []
    got_samples = actual.get("samples") or []
    if len(want_samples) != len(got_samples):
        note("/samples", len(want_samples), len(got_samples), float("inf"), 0.0)
        return (False, differences, worst)
    for index, want in enumerate(want_samples):
        got = got_samples[index]
        for channel, value in want.items():
            if channel == "time":
                continue
            walk(f"/samples/{index}/{channel}", value, got.get(channel), channel)
    return (not differences, differences, worst)
