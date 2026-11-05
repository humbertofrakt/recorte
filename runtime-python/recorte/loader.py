# SPDX-License-Identifier: Apache-2.0
"""Reading a `.bone`, `.boneb` or `.bonez` file into the data model.

Sections 2 and 4 of the specification: file rules, header, versioning,
extensions, path resolution and the structural objects. Unknown values follow
the fallback table of section 2.5 — the file always opens, except when
`extensionsRequired` names an extension this reader does not implement (2.7).
"""

from __future__ import annotations

import json
import posixpath
import zipfile
from dataclasses import dataclass, field
from io import BytesIO
from pathlib import Path
from typing import Any, Callable

from . import binary
from .atlas import Atlas, Region, find_region, load_atlas

# 1.1: its only property is `skeleton.around` (7.11), read below.
READER_VERSION = (1, 1)

# Extensions this reader implements. Every extension is optional in 1.0, and
# `extensionsRequired` with anything outside this set is refused (2.7).
# `BONE_particles` is module P: the rate switches on and off (4.1), and since
# the 2nd phase it is also animated by integral (4.2, the `linear` branch).
SUPPORTED_EXTENSIONS: set[str] = {"BONE_particles"}

BONE_PROPERTIES = ("x", "y", "rotation", "scaleX", "scaleY", "shearX", "shearY")
INHERIT_PROPERTIES = ("inheritRotation", "inheritScale", "inheritReflection")

TIMELINE_TYPES = {
    "bone", "slot", "drawOrder", "deform", "weights", "sequence", "event",
    "constraint", "parameter", "morph", "variable", "tag", "nested", "body",
    # The timeline type of the `BONE_particles` extension (9 of its spec). It
    # is prefixed too, so a reader without the extension ignores it by the
    # `timeline.type` fallback of 2.5.
    "BONE_particle",
}

# 9 of the extension: the animable fields of an emitter, and how many
# components each one animates. A `[min, max]` range animates as a value of 2
# components (9.3 of the main spec).
# Every one of them is marked **N** in 9: read at the BIRTH instant and frozen
# on the particle. `lifetime` is deliberately absent — 9.2 forbids animating
# it, because `lifetime.max` is what bounds the search window of 5.
PARTICLE_PROPERTIES = {
    "emitting": 1, "rate": 1, "speed": 2, "direction": 1,
    "spread": 1, "radius": 1, "radiusThickness": 1, "arc": 1, "size": 2,
    "edge": 4, "gravity": 2, "drag": 1, "angle": 2, "angularVelocity": 2,
    "scale": 2, "startColor": 8, "startFrame": 2,
}

# 12.6: an entity inside an entity inside ... at most this deep (7.11).
MAX_NESTING = 8

CONSTRAINT_PROPERTIES = {
    "ik": {"mix", "softness", "bendPositive", "compress", "stretch", "uniform"},
    "transform": {"mix", "mixRotation", "mixX", "mixY", "mixScaleX", "mixScaleY", "mixShearY"},
    "path": {"mix", "mixRotation", "mixX", "mixY", "position", "spacing"},
    "physics": {"mix", "inertia", "strength", "damping", "mass", "wind", "gravity", "reset"},
    "driver": {"mix"},
}


class BoneError(Exception):
    """The file cannot be loaded at all."""


class Warnings:
    """Collects the once-per-file notices the spec asks the reader to give."""

    def __init__(self) -> None:
        self.messages: list[str] = []
        self._seen: set[str] = set()

    def add(self, message: str) -> None:
        if message not in self._seen:
            self._seen.add(message)
            self.messages.append(message)


# ---------------------------------------------------------------------------
# Structural objects (section 4)
# ---------------------------------------------------------------------------


@dataclass
class BoneData:
    name: str
    index: int = 0
    parent: "BoneData | None" = None
    length: float = 0.0
    x: float = 0.0
    y: float = 0.0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    shear_x: float = 0.0
    shear_y: float = 0.0
    inherit_rotation: bool = True
    inherit_scale: bool = True
    inherit_reflection: bool = True
    skin_required: bool = False


@dataclass
class SlotData:
    name: str
    index: int = 0
    bone: BoneData | None = None
    attachment: str | None = None
    color: list[float] = field(default_factory=lambda: [1.0, 1.0, 1.0, 1.0])
    dark_color: list[float] | None = None
    blend: str = "normal"
    visible: bool = True


@dataclass
class SkinData:
    name: str
    includes: list[str] = field(default_factory=list)
    bones: list[str] = field(default_factory=list)
    constraints: list[str] = field(default_factory=list)
    attachments: dict[str, dict[str, Any]] = field(default_factory=dict)
    # `(slot name, offset)` applied while the skin is active (4.4).
    draw_order: list[tuple[str, int]] = field(default_factory=list)


@dataclass
class Sequence:
    count: int = 1
    frames: list[str] | None = None
    start: int = 1
    digits: int = 0
    setup: int = 0

    def frame_name(self, path: str, index: int) -> str:
        if self.frames is not None:
            if 0 <= index < len(self.frames):
                return self.frames[index]
            return path
        number = self.start + index
        return path + (str(number).zfill(self.digits) if self.digits > 0 else str(number))


@dataclass
class Attachment:
    type: str = ""
    name: str = ""
    path: str = ""
    color: list[float] = field(default_factory=lambda: [1.0, 1.0, 1.0, 1.0])
    sequence: Sequence | None = None


@dataclass
class Binding:
    counts: list[int] = field(default_factory=list)
    bones: list[int] = field(default_factory=list)
    positions: list[float] = field(default_factory=list)
    weights: list[float] = field(default_factory=list)

    @property
    def total(self) -> int:
        return len(self.weights)


@dataclass
class RegionAttachment(Attachment):
    x: float = 0.0
    y: float = 0.0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    width: float = 0.0
    height: float = 0.0
    region: Region | None = None
    # Four local corners and their page UVs, precomputed at load time (7.3).
    local_corners: list[float] = field(default_factory=list)
    page_uvs: list[float] = field(default_factory=list)
    # One entry per sequence frame (7.10): (region, local_corners, page_uvs).
    # Without a sequence the list has a single entry, the one above.
    frames: list[tuple[Region | None, list[float], list[float]]] = field(default_factory=list)


@dataclass
class MeshAttachment(Attachment):
    vertices: list[float] = field(default_factory=list)
    binding: Binding | None = None
    uvs: list[float] = field(default_factory=list)
    triangles: list[int] = field(default_factory=list)
    hull: int = 0
    edges: list[int] = field(default_factory=list)
    width: float = 0.0
    height: float = 0.0
    vertex_count: int = 0
    region: Region | None = None
    page_uvs: list[float] = field(default_factory=list)
    # One entry per sequence frame (7.10): (region, page_uvs).
    frames: list[tuple[Region | None, list[float]]] = field(default_factory=list)
    # Set on a linked mesh so deform and morph can find the parent's arrays.
    deform_source: "MeshAttachment | None" = None


@dataclass
class BoundingBoxAttachment(Attachment):
    shape: str = "polygon"
    vertices: list[float] = field(default_factory=list)
    binding: Binding | None = None
    x: float = 0.0
    y: float = 0.0
    width: float = 0.0
    height: float = 0.0
    rotation: float = 0.0
    vertex_count: int = 0


@dataclass
class ClippingAttachment(Attachment):
    end: str | None = None
    slots: list[str] | None = None
    invert: bool = False
    vertices: list[float] = field(default_factory=list)
    binding: Binding | None = None
    vertex_count: int = 0


@dataclass
class PathAttachment(Attachment):
    closed: bool = False
    constant_speed: bool = True
    lengths: list[float] = field(default_factory=list)
    vertices: list[float] = field(default_factory=list)
    binding: Binding | None = None
    vertex_count: int = 0


@dataclass
class PointAttachment(Attachment):
    x: float = 0.0
    y: float = 0.0
    rotation: float = 0.0


@dataclass
class Burst:
    """One burst of a particle emitter (`BONE_particles` 4.3)."""
    time: float = 0.0
    count: int = 1
    cycles: int = 1
    interval: float = 1.0
    probability: float = 1.0


@dataclass
class ParticleAttachment(Attachment):
    """The `"type": "BONE_particle"` attachment of the `BONE_particles`
    extension — an emitter in a slot, tied to the slot's bone, like a `region`.

    The field names and defaults are 9 of the extension, one for one. `shape_ok`
    carries the one fallback that is NOT a default: an unknown `shape` means the
    emitter is not drawn at all (7.4), because inventing a point at the origin
    would be a silent guess the user cannot notice.
    """
    # 9.1 emission
    emitting: bool = True
    rate: float = 10.0
    bursts: list[Burst] = field(default_factory=list)
    explosiveness: float = 0.0
    duration: float = 1.0
    randomness: float = 0.0
    start_delay: float = 0.0
    # 9.2 life and ceiling
    lifetime: list[float] = field(default_factory=lambda: [1.0, 1.0])
    max_particles: int = 1000
    # 9.3 speed, direction, spread
    speed: list[float] = field(default_factory=lambda: [100.0, 100.0])
    direction: float = 90.0
    spread: float = 0.0
    spherize_direction: float = 0.0
    align_to_velocity: bool = False
    # 9.4 shape
    shape: str = "point"
    shape_ok: bool = True
    radius: float = 0.0
    radius_thickness: float = 1.0
    arc: float = 360.0
    size: list[float] = field(default_factory=lambda: [0.0, 0.0])
    edge: list[float] = field(default_factory=lambda: [0.0, 0.0, 0.0, 0.0])
    mesh: str | None = None
    mesh_mode: str = "vertex"
    # 9.4.2 (1.1): `shape: "path"` reads `"<slot>/<placeholder>"`. The name is
    # `curve` and not `path`, because `path` is already the particle's image.
    curve: str | None = None
    # 9.5 forces
    gravity: list[float] = field(default_factory=lambda: [0.0, 0.0])
    drag: float = 0.0
    # 9.6 rotation and size
    angle: list[float] = field(default_factory=lambda: [0.0, 0.0])
    angular_velocity: list[float] = field(default_factory=lambda: [0.0, 0.0])
    scale: list[float] = field(default_factory=lambda: [1.0, 1.0])
    scale_over_lifetime: list[Key] | None = None
    # 9.7 colour
    start_color: list[list[float]] = field(
        default_factory=lambda: [[1.0, 1.0, 1.0, 1.0], [1.0, 1.0, 1.0, 1.0]])
    color_over_lifetime: list[Key] | None = None
    alpha_over_lifetime: list[Key] | None = None
    # 9.8 image and frame sheet
    frame_mode: str = "lifetime"
    cycles: float = 1.0
    fps: float = 12.0
    start_frame: list[float] = field(default_factory=lambda: [0.0, 0.0])
    # 9.9 space, seed, loop, order
    space: str = "local"
    seed: int = 0
    looping: bool = True
    prewarm: float = 0.0
    sort_mode: str = "youngestInFront"
    # 9.10 where the emitter is: `M_emissor = M_osso x T(x, y) . R(rotation)`,
    # the order of a `region`, without scale. Not animable.
    x: float = 0.0
    y: float = 0.0
    rotation: float = 0.0


@dataclass
class SkeletonAttachment(Attachment):
    uri: str = ""
    skins: list[str] = field(default_factory=list)
    animation: str | None = None
    loop: bool = True
    time_scale: float = 1.0
    x: float = 0.0
    y: float = 0.0
    rotation: float = 0.0
    scale_x: float = 1.0
    scale_y: float = 1.0
    inherit_color: bool = True
    inherit_animation: bool = False
    base_animation: str | None = None
    # 7.11, since 1.1: the slot OF THE CHILD that marks the middle. What comes
    # before it is drawn behind whoever receives it; what comes after, in front.
    around: str | None = None
    # The loaded child (7.11), and the path it was resolved to from the file
    # that was opened first. Two attachments with the same `resolved` show the
    # same entity: that is how 9.13 decides whether an instance continues.
    child: "SkeletonData | None" = None
    resolved: str = ""


@dataclass
class EventDef:
    name: str
    int_value: int = 0
    float_value: float = 0.0
    string_value: str = ""
    audio: str | None = None
    volume: float = 1.0
    balance: float = 0.0


@dataclass
class ParameterSource:
    bone: str = ""
    property: str = ""
    from_value: float = 0.0
    to_value: float = 1.0


@dataclass
class ParameterData:
    name: str
    min: float = 0.0
    max: float = 1.0
    default: float = 0.0
    repeat: bool = False
    source: ParameterSource | None = None


@dataclass
class MorphTarget:
    slot: str = ""
    attachment: str = ""
    skin: str = "default"
    offsets: list[float] = field(default_factory=list)


@dataclass
class MorphData:
    name: str
    weight: float = 0.0
    min: float = 0.0
    max: float = 1.0
    targets: list[MorphTarget] = field(default_factory=list)


@dataclass
class VariableData:
    name: str
    type: str = "float"
    default: Any = 0.0


# ---------------------------------------------------------------------------
# Constraints (sections 6 and 8)
# ---------------------------------------------------------------------------


@dataclass
class ConstraintData:
    type: str = ""
    name: str = ""
    mix: float = 1.0
    skin_required: bool = False


@dataclass
class IkConstraintData(ConstraintData):
    bones: list[str] = field(default_factory=list)
    target: str = ""
    bend_positive: bool = True
    compress: bool = False
    stretch: bool = False
    uniform: bool = False
    softness: float = 0.0


@dataclass
class TransformConstraintData(ConstraintData):
    bones: list[str] = field(default_factory=list)
    target: str = ""
    local: bool = False
    relative: bool = False
    offset_rotation: float = 0.0
    offset_x: float = 0.0
    offset_y: float = 0.0
    offset_scale_x: float = 0.0
    offset_scale_y: float = 0.0
    offset_shear_y: float = 0.0
    mix_rotation: float = 1.0
    mix_x: float = 1.0
    mix_y: float = 1.0
    mix_scale_x: float = 1.0
    mix_scale_y: float = 1.0
    mix_shear_y: float = 1.0


@dataclass
class PathConstraintData(ConstraintData):
    bones: list[str] = field(default_factory=list)
    target: str = ""
    position_mode: str = "percent"
    spacing_mode: str = "length"
    rotate_mode: str = "tangent"
    offset_rotation: float = 0.0
    position: float = 0.0
    spacing: float = 0.0
    mix_rotation: float = 1.0
    mix_x: float = 1.0
    mix_y: float = 1.0


@dataclass
class PhysicsConstraintData(ConstraintData):
    bone: str = ""
    x: float = 0.0
    y: float = 0.0
    rotation: float = 0.0
    scale_x: float = 0.0
    shear_x: float = 0.0
    inertia: float = 0.5
    strength: float = 100.0
    damping: float = 1.0
    mass: float = 1.0
    wind: float = 0.0
    gravity: float = 0.0
    limit: float = 5000.0
    fps: float = 60.0


@dataclass
class DriverKey:
    input: float = 0.0
    value: Any = None
    curve: Any = "linear"
    offset: int = 0


@dataclass
class DriverTarget:
    type: str = ""
    target: str | None = None
    property: str | None = None
    skin: str = "default"
    attachment: str | None = None
    mode: str = "replace"
    keys: list[DriverKey] = field(default_factory=list)


@dataclass
class DriverConstraintData(ConstraintData):
    parameter: str = ""
    targets: list[DriverTarget] | None = None
    animation: str | None = None
    from_value: float | None = None
    to_value: float | None = None
    time_from: float = 0.0
    time_to: float | None = None
    mode: str = "replace"


# ---------------------------------------------------------------------------
# Animations (section 9)
# ---------------------------------------------------------------------------


@dataclass
class Key:
    time: float = 0.0
    value: Any = None
    curve: Any = "linear"
    offset: int = 0
    event: str | None = None
    payload: dict[str, Any] = field(default_factory=dict)
    # Only on a `slot` / `bone` key (9.5): (x, y, rotation, scaleX, scaleY).
    transform: tuple[float, float, float, float, float] | None = None
    # Only on a `body` key (9.13).
    keep_skins: bool = True
    # Only on a `deform` key: `value` widened to the full 7.4 layout, with the
    # slice put at `offset` and zeros around it (9.6). Filled in the first time
    # the timeline runs, when the layout length is known. `None` until then.
    expanded: list[float] | None = None


@dataclass
class Timeline:
    type: str = ""
    target: str | None = None
    property: str | None = None
    skin: str = "default"
    attachment: str | None = None
    keys: list[Key] = field(default_factory=list)
    components: int = 1


@dataclass
class AnimationData:
    name: str
    duration: float = 0.0
    loop: bool = False
    blend: str = "replace"
    default_mix: float | None = None
    tags: list[str] = field(default_factory=list)
    timelines: list[Timeline] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Skeleton data
# ---------------------------------------------------------------------------


@dataclass
class SkeletonData:
    name: str = ""
    fps: float = 30.0
    reference_scale: float = 100.0
    pixel_art: bool = False
    bones: list[BoneData] = field(default_factory=list)
    slots: list[SlotData] = field(default_factory=list)
    skins: list[SkinData] = field(default_factory=list)
    constraints: list[ConstraintData] = field(default_factory=list)
    events: list[EventDef] = field(default_factory=list)
    parameters: list[ParameterData] = field(default_factory=list)
    morphs: list[MorphData] = field(default_factory=list)
    variables: list[VariableData] = field(default_factory=list)
    tags: list[str] = field(default_factory=list)
    animations: list[AnimationData] = field(default_factory=list)
    atlases: list[Atlas] = field(default_factory=list)
    warnings: Warnings = field(default_factory=Warnings)
    # 2.8: `assets.skeletonsBase`, the `rig` block (4.8), the bodies a `body`
    # key cites (9.13) by the `value` written in the key, and the list of
    # files that were asked for and not found (2.8: the runtime MUST expose it).
    skeletons_base: str = ""
    rig: dict[str, Any] = field(default_factory=dict)
    bodies: dict[str, "SkeletonData"] = field(default_factory=dict)
    missing: list[str] = field(default_factory=list)

    def find_bone(self, name: str) -> BoneData | None:
        for bone in self.bones:
            if bone.name == name:
                return bone
        return None

    def find_slot(self, name: str) -> SlotData | None:
        for slot in self.slots:
            if slot.name == name:
                return slot
        return None

    def find_skin(self, name: str) -> SkinData | None:
        for skin in self.skins:
            if skin.name == name:
                return skin
        return None

    def find_animation(self, name: str) -> AnimationData | None:
        for animation in self.animations:
            if animation.name == name:
                return animation
        return None

    def find_constraint(self, name: str) -> ConstraintData | None:
        for constraint in self.constraints:
            if constraint.name == name:
                return constraint
        return None

    def find_event(self, name: str) -> EventDef | None:
        for event in self.events:
            if event.name == name:
                return event
        return None

    def find_parameter(self, name: str) -> ParameterData | None:
        for parameter in self.parameters:
            if parameter.name == name:
                return parameter
        return None

    def find_morph(self, name: str) -> MorphData | None:
        for morph in self.morphs:
            if morph.name == name:
                return morph
        return None

    def find_variable(self, name: str) -> VariableData | None:
        for variable in self.variables:
            if variable.name == name:
                return variable
        return None


# ---------------------------------------------------------------------------
# Small readers
# ---------------------------------------------------------------------------


def _number(source: dict, key: str, default: float) -> float:
    value = source.get(key, default)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return float(default)
    return float(value)


def _integer(source: dict, key: str, default: int) -> int:
    value = source.get(key, default)
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        return int(default)
    return int(value)


def _flag(source: dict, key: str, default: bool) -> bool:
    value = source.get(key, default)
    return bool(value) if isinstance(value, bool) else bool(default)


def _text(source: dict, key: str, default):
    value = source.get(key, default)
    return value if isinstance(value, str) else default


def _color(source: dict, key: str, default):
    value = source.get(key)
    if isinstance(value, list) and all(isinstance(v, (int, float)) for v in value):
        return [float(v) for v in value]
    return default


def _floats(value: Any) -> list[float]:
    if not isinstance(value, list):
        return []
    return [float(v) for v in value if isinstance(v, (int, float))]


def _ints(value: Any) -> list[int]:
    if not isinstance(value, list):
        return []
    return [int(v) for v in value if isinstance(v, (int, float))]


def _parse_version(text: Any) -> tuple[int, int]:
    if not isinstance(text, str):
        return (0, 0)
    parts = text.split(".")
    try:
        return (int(parts[0]), int(parts[1]) if len(parts) > 1 else 0)
    except ValueError:
        return (0, 0)


def _binding(raw: Any) -> Binding | None:
    if not isinstance(raw, dict):
        return None
    return Binding(
        counts=_ints(raw.get("counts")),
        bones=_ints(raw.get("bones")),
        positions=_floats(raw.get("positions")),
        weights=_floats(raw.get("weights")),
    )


def _sequence(raw: Any) -> Sequence | None:
    if not isinstance(raw, dict):
        return None
    frames = raw.get("frames")
    frame_list = [str(f) for f in frames] if isinstance(frames, list) else None
    count = len(frame_list) if frame_list is not None else _integer(raw, "count", 1)
    return Sequence(
        count=max(1, count),
        frames=frame_list,
        start=_integer(raw, "start", 1),
        digits=_integer(raw, "digits", 0),
        setup=_integer(raw, "setup", 0),
    )


# ---------------------------------------------------------------------------
# Attachments (section 7)
# ---------------------------------------------------------------------------


def _vertex_count(vertices: list[float], binding: Binding | None) -> int:
    if binding is not None:
        return len(binding.counts)
    return len(vertices) // 2


def _load_attachment(name: str, raw: dict, warnings: Warnings) -> Attachment | None:
    kind = _text(raw, "type", "")
    common = {
        "type": kind,
        "name": name,
        "path": _text(raw, "path", name) or name,
        "color": _color(raw, "color", [1.0, 1.0, 1.0, 1.0]),
        "sequence": _sequence(raw.get("sequence")),
    }
    if kind == "region":
        return RegionAttachment(
            **common,
            x=_number(raw, "x", 0), y=_number(raw, "y", 0),
            rotation=_number(raw, "rotation", 0),
            scale_x=_number(raw, "scaleX", 1), scale_y=_number(raw, "scaleY", 1),
            width=_number(raw, "width", 0), height=_number(raw, "height", 0),
        )
    if kind in ("mesh", "linkedmesh"):
        vertices = _floats(raw.get("vertices"))
        binding = _binding(raw.get("binding"))
        mesh = MeshAttachment(
            **common,
            vertices=vertices, binding=binding,
            uvs=_floats(raw.get("uvs")), triangles=_ints(raw.get("triangles")),
            hull=_integer(raw, "hull", 0), edges=_ints(raw.get("edges")),
            width=_number(raw, "width", 0), height=_number(raw, "height", 0),
            vertex_count=_vertex_count(vertices, binding),
        )
        if kind == "linkedmesh":
            # `parent`, `skin` and `inheritDeform` are kept for the link pass.
            mesh.link_parent = _text(raw, "parent", "")       # type: ignore[attr-defined]
            mesh.link_skin = _text(raw, "skin", "default")    # type: ignore[attr-defined]
            mesh.inherit_deform = _flag(raw, "inheritDeform", True)  # type: ignore[attr-defined]
        return mesh
    if kind == "boundingbox":
        shape = _text(raw, "shape", "polygon")
        if shape not in ("polygon", "rectangle", "ellipse"):
            warnings.add(f"boundingbox com shape desconhecido: {shape}")
            return None
        vertices = _floats(raw.get("vertices"))
        binding = _binding(raw.get("binding"))
        return BoundingBoxAttachment(
            **common, shape=shape, vertices=vertices, binding=binding,
            x=_number(raw, "x", 0), y=_number(raw, "y", 0),
            width=_number(raw, "width", 0), height=_number(raw, "height", 0),
            rotation=_number(raw, "rotation", 0),
            vertex_count=_vertex_count(vertices, binding),
        )
    if kind == "clipping":
        vertices = _floats(raw.get("vertices"))
        binding = _binding(raw.get("binding"))
        slots = raw.get("slots")
        return ClippingAttachment(
            **common, end=_text(raw, "end", None),
            slots=[str(s) for s in slots] if isinstance(slots, list) else None,
            invert=_flag(raw, "invert", False),
            vertices=vertices, binding=binding,
            vertex_count=_vertex_count(vertices, binding),
        )
    if kind == "path":
        vertices = _floats(raw.get("vertices"))
        binding = _binding(raw.get("binding"))
        return PathAttachment(
            **common, closed=_flag(raw, "closed", False),
            constant_speed=_flag(raw, "constantSpeed", True),
            lengths=_floats(raw.get("lengths")),
            vertices=vertices, binding=binding,
            vertex_count=_vertex_count(vertices, binding),
        )
    if kind == "point":
        return PointAttachment(
            **common, x=_number(raw, "x", 0), y=_number(raw, "y", 0),
            rotation=_number(raw, "rotation", 0),
        )
    if kind == "skeleton":
        return SkeletonAttachment(
            **common, uri=_text(raw, "uri", "") or "",
            skins=[str(s) for s in (raw.get("skins") or [])],
            animation=_text(raw, "animation", None),
            loop=_flag(raw, "loop", True),
            time_scale=_number(raw, "timeScale", 1),
            x=_number(raw, "x", 0), y=_number(raw, "y", 0),
            rotation=_number(raw, "rotation", 0),
            scale_x=_number(raw, "scaleX", 1), scale_y=_number(raw, "scaleY", 1),
            inherit_color=_flag(raw, "inheritColor", True),
            inherit_animation=_flag(raw, "inheritAnimation", False),
            base_animation=_text(raw, "baseAnimation", None),
            around=_text(raw, "around", None),
        )
    if kind == "BONE_particle":
        return _load_particle(common, raw, warnings)
    # Section 2.5: unknown attachment type leaves the placeholder empty.
    warnings.add(f"tipo de attachment desconhecido, placeholder vazio: {kind}")
    return None


def _range(source: dict, key: str, default: list[float]) -> list[float]:
    value = source.get(key)
    if (isinstance(value, list) and len(value) >= 2
            and all(isinstance(v, (int, float)) and not isinstance(v, bool)
                    for v in value[:2])):
        return [float(value[0]), float(value[1])]
    return list(default)


def _vector(source: dict, key: str, default: list[float]) -> list[float]:
    value = source.get(key)
    size = len(default)
    if (isinstance(value, list) and len(value) >= size
            and all(isinstance(v, (int, float)) and not isinstance(v, bool)
                    for v in value[:size])):
        return [float(v) for v in value[:size]]
    return list(default)


def _enum(source: dict, key: str, allowed: tuple[str, ...], default: str,
          warnings: Warnings, where: str) -> str:
    """2.5 of the extension (7.4): an unknown value falls to the declared
    default AND warns. Silence would be a guess the user cannot notice."""
    value = source.get(key)
    if value is None:
        return default
    text = str(value)
    if text in allowed:
        return text
    warnings.add(f"{where} desconhecido, usando {default}: {text}")
    return default


def _lifetime_keys(raw: Any, components: int) -> list[Key] | None:
    """`scaleOverLifetime`, `colorOverLifetime`, `alphaOverLifetime` (9.6, 9.7):
    the key format of 9.2-9.3 of the main spec, with `time` in 0..1 of the life
    instead of seconds."""
    if not isinstance(raw, list) or not raw:
        return None
    keys = [_load_key(k, "BONE_particle", components) for k in raw if isinstance(k, dict)]
    if not keys:
        return None
    keys.sort(key=lambda k: k.time)
    return keys


def _load_particle(common: dict, raw: dict, warnings: Warnings) -> "ParticleAttachment":
    """The `BONE_particle` attachment of the `BONE_particles` extension, 9."""
    bursts: list[Burst] = []
    for entry in raw.get("bursts") or []:
        if not isinstance(entry, dict):
            continue
        bursts.append(Burst(
            time=_number(entry, "time", 0),
            count=max(1, _integer(entry, "count", 1)),
            cycles=max(1, _integer(entry, "cycles", 1)),
            interval=_number(entry, "interval", 1),
            probability=_number(entry, "probability", 1),
        ))

    shape = _text(raw, "shape", "point") or "point"
    # `path` is 1.1 of the extension (9.4.2): the shape "along a path".
    shape_ok = shape in ("point", "circle", "rectangle", "edge", "bone", "mesh",
                         "path")
    if not shape_ok:
        # 7.4: the ONLY fallback that does not pick a default. An unknown shape
        # would change the whole drawing, so the emitter is not drawn.
        warnings.add(f"forma de emissor desconhecida, emissor nao desenhado: {shape}")

    start_colors = raw.get("startColor")
    if (isinstance(start_colors, list) and len(start_colors) >= 2
            and all(isinstance(c, list) and len(c) >= 4 for c in start_colors[:2])):
        start_color = [[float(v) for v in c[:4]] for c in start_colors[:2]]
    else:
        start_color = [[1.0, 1.0, 1.0, 1.0], [1.0, 1.0, 1.0, 1.0]]

    if _flag(raw, "looping", True) and _number(raw, "prewarm", 0) > 0:
        # 6: with a loop the laps already fill the emitter, so `prewarm` is
        # ignored — and saying so beats letting the author think it worked.
        warnings.add("prewarm ignorado: so vale com looping false")

    return ParticleAttachment(
        **common,
        emitting=_flag(raw, "emitting", True),
        rate=_number(raw, "rate", 10),
        bursts=bursts,
        explosiveness=_number(raw, "explosiveness", 0),
        duration=_number(raw, "duration", 1),
        randomness=_number(raw, "randomness", 0),
        start_delay=_number(raw, "startDelay", 0),
        lifetime=_range(raw, "lifetime", [1.0, 1.0]),
        max_particles=max(1, _integer(raw, "maxParticles", 1000)),
        speed=_range(raw, "speed", [100.0, 100.0]),
        direction=_number(raw, "direction", 90),
        spread=_number(raw, "spread", 0),
        x=_number(raw, "x", 0),
        y=_number(raw, "y", 0),
        rotation=_number(raw, "rotation", 0),
        spherize_direction=_number(raw, "spherizeDirection", 0),
        align_to_velocity=_flag(raw, "alignToVelocity", False),
        shape=shape, shape_ok=shape_ok,
        radius=_number(raw, "radius", 0),
        radius_thickness=_number(raw, "radiusThickness", 1),
        arc=_number(raw, "arc", 360),
        size=_vector(raw, "size", [0.0, 0.0]),
        edge=_vector(raw, "edge", [0.0, 0.0, 0.0, 0.0]),
        mesh=_text(raw, "mesh", None),
        curve=_text(raw, "curve", None),
        mesh_mode=_enum(raw, "meshMode", ("vertex", "edge", "triangle"), "vertex",
                        warnings, "meshMode de emissor"),
        gravity=_vector(raw, "gravity", [0.0, 0.0]),
        drag=_number(raw, "drag", 0),
        angle=_range(raw, "angle", [0.0, 0.0]),
        angular_velocity=_range(raw, "angularVelocity", [0.0, 0.0]),
        scale=_range(raw, "scale", [1.0, 1.0]),
        scale_over_lifetime=_lifetime_keys(raw.get("scaleOverLifetime"), 1),
        start_color=start_color,
        color_over_lifetime=_lifetime_keys(raw.get("colorOverLifetime"), 4),
        alpha_over_lifetime=_lifetime_keys(raw.get("alphaOverLifetime"), 1),
        frame_mode=_enum(raw, "frameMode", ("lifetime", "fps"), "lifetime",
                         warnings, "frameMode de emissor"),
        cycles=_number(raw, "cycles", 1),
        fps=_number(raw, "fps", 12),
        start_frame=_range(raw, "startFrame", [0.0, 0.0]),
        space=_enum(raw, "space", ("local", "world"), "local",
                    warnings, "space de emissor"),
        seed=_integer(raw, "seed", 0),
        looping=_flag(raw, "looping", True),
        prewarm=_number(raw, "prewarm", 0),
        sort_mode=_enum(raw, "sortMode", ("youngestInFront", "oldestInFront"),
                        "youngestInFront", warnings, "sortMode de emissor"),
    )


# ---------------------------------------------------------------------------
# Region corners and UVs (7.3 + 10.4)
# ---------------------------------------------------------------------------


def _frame_names(attachment: Attachment) -> list[str]:
    """Region names this attachment can show, in frame order (7.10).

    Without a `sequence` there is one name, the attachment `path`. With one,
    there is a name per frame: `frames[i]`, or `path` plus the number. The
    frames of a sequence live in DIFFERENT rectangles of the page, so each one
    has its own page UVs — 7.10 keeps the stored `uvs`, not the mapping of
    10.4. Resolving only `path` leaves a sequence with no region at all when
    `path` is a prefix such as `"hand_"`, and the whole animation then draws
    with the literal corners.
    """
    sequence = attachment.sequence
    if sequence is None:
        return [attachment.path]
    return [sequence.frame_name(attachment.path, i) for i in range(sequence.count)]


def _setup_frame(attachment: Attachment, total: int) -> int:
    sequence = attachment.sequence
    if sequence is None:
        return 0
    return sequence.setup if 0 <= sequence.setup < total else 0


def _prepare_region(attachment: RegionAttachment, atlases: list[Atlas]) -> None:
    names = _frame_names(attachment)
    frames = [_region_frame(attachment, find_region(atlases, name)) for name in names]
    attachment.frames = frames
    index = _setup_frame(attachment, len(frames))
    attachment.region, attachment.local_corners, attachment.page_uvs = frames[index]


def _region_frame(
    attachment: RegionAttachment, region: Region | None,
) -> tuple[Region | None, list[float], list[float]]:
    """The corners and page UVs of one frame (7.3 + 10.4)."""
    if region is not None and region.page is not None:
        scale = region.scale or 1.0
        original_w = region.original_width / scale
        original_h = region.original_height / scale
        width = attachment.width or original_w
        height = attachment.height or original_h
        rw = region.width / scale
        rh = region.height / scale
        ox = region.offset_x / scale
        oy = region.offset_y / scale
        kx = width / original_w if original_w else 1.0
        ky = height / original_h if original_h else 1.0
        x0 = (-original_w / 2 + ox) * kx
        y0 = (-original_h / 2 + oy) * ky
        x1 = x0 + rw * kx
        y1 = y0 + rh * ky
        ow, oh = region.original_width, region.original_height
        u0 = region.offset_x / ow if ow else 0.0
        u1 = (region.offset_x + region.width) / ow if ow else 1.0
        v1 = 1 - (region.offset_y / oh) if oh else 1.0
        v0 = 1 - ((region.offset_y + region.height) / oh) if oh else 0.0
        uv_corners = [(u0, v1), (u1, v1), (u1, v0), (u0, v0)]
        page_uvs = [c for uv in uv_corners for c in region.uv(*uv)]
    else:
        # No atlas: the whole image is the region, with no offsets (7.3).
        width = attachment.width
        height = attachment.height
        x0, y0 = -width / 2, -height / 2
        x1, y1 = width / 2, height / 2
        page_uvs = [0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0]
    return (region, [x0, y0, x1, y0, x1, y1, x0, y1], page_uvs)


def _prepare_mesh(attachment: MeshAttachment, atlases: list[Atlas]) -> None:
    names = _frame_names(attachment)
    frames = [_mesh_frame(attachment, find_region(atlases, name)) for name in names]
    attachment.frames = frames
    index = _setup_frame(attachment, len(frames))
    attachment.region, attachment.page_uvs = frames[index]


def _mesh_frame(
    attachment: MeshAttachment, region: Region | None,
) -> tuple[Region | None, list[float]]:
    """The page UVs of one frame of a mesh (10.4)."""
    uvs = attachment.uvs
    if region is not None and region.page is not None:
        out: list[float] = []
        for i in range(0, len(uvs) - 1, 2):
            u, v = region.uv(uvs[i], uvs[i + 1])
            out.extend((u, v))
        return (region, out)
    return (region, list(uvs))


# ---------------------------------------------------------------------------
# Timelines
# ---------------------------------------------------------------------------

_COMPONENTS = {"color": 4, "darkColor": 3}

_EVENT_FIELDS = ("int", "float", "string", "volume", "balance")


def _curve(raw: dict, components: int, value: Any) -> Any:
    curve = raw.get("curve")
    interpolable = isinstance(value, (int, float)) and not isinstance(value, bool)
    # An EMPTY list counts. On a `deform` key `value: []` means "no deform"
    # (9.6), which is a row of zeros — a number, and interpolable. Treating it
    # as a non-number made its curve `stepped`, and a deform that starts from
    # an empty key then never moved at all: measured on the `idle` animation of
    # `heroi.bone`, where the face stayed frozen while the other runtime
    # animated it.
    interpolable = interpolable or (isinstance(value, list) and
                                    all(isinstance(v, (int, float)) and not isinstance(v, bool)
                                        for v in value))
    if curve is None:
        return "stepped" if not interpolable else "linear"
    if isinstance(curve, str):
        if curve == "stepped":
            return "stepped"
        if curve == "linear":
            return "stepped" if not interpolable else "linear"
        # Section 2.5: unknown curve name is linear, or stepped for non-numbers.
        return "linear" if interpolable else "stepped"
    if isinstance(curve, list) and len(curve) == 4 * components and interpolable:
        return [float(v) for v in curve]
    return "linear" if interpolable else "stepped"


def _load_key(raw: dict, kind: str, components: int) -> Key:
    key = Key(time=_number(raw, "time", 0), offset=_integer(raw, "offset", 0))
    if kind == "event":
        key.event = _text(raw, "event", None)
        for name in _EVENT_FIELDS:
            if name in raw:
                key.payload[name] = raw[name]
        key.curve = "stepped"
        return key
    key.value = raw.get("value")
    key.curve = _curve(raw, components, key.value)
    if kind == "slot/bone":
        # 9.5: stepped always; `transform` defaults to the identity.
        key.curve = "stepped"
        raw_transform = raw.get("transform")
        if isinstance(raw_transform, dict) and key.value is not None:
            key.transform = (
                _number(raw_transform, "x", 0), _number(raw_transform, "y", 0),
                _number(raw_transform, "rotation", 0),
                _number(raw_transform, "scaleX", 1), _number(raw_transform, "scaleY", 1),
            )
    elif kind == "body":
        # 9.13: stepped only; `keepSkins` defaults to true.
        key.curve = "stepped"
        key.keep_skins = _flag(raw, "keepSkins", True)
    return key


def _load_timeline(raw: dict, data: SkeletonData, warnings: Warnings) -> Timeline | None:
    kind = _text(raw, "type", "")
    if kind not in TIMELINE_TYPES:
        warnings.add(f"tipo de timeline desconhecido, ignorada: {kind}")
        return None
    prop = _text(raw, "property", None)
    target = _text(raw, "target", None)

    if kind == "bone":
        if prop not in BONE_PROPERTIES and prop not in INHERIT_PROPERTIES and prop != "parent":
            warnings.add(f"propriedade de osso desconhecida, timeline ignorada: {prop}")
            return None
        if prop == "parent":
            # 9.4: a bone name or null, stepped; an unknown name is L1 and the
            # timeline is ignored (4.7).
            for raw_key in raw.get("keys") or []:
                value = raw_key.get("value") if isinstance(raw_key, dict) else None
                if value is not None and data.find_bone(str(value)) is None:
                    warnings.add(f"chave parent aponta para osso inexistente, timeline ignorada: {value}")
                    return None
    elif kind == "slot":
        if prop not in ("attachment", "color", "darkColor", "visible", "bone"):
            warnings.add(f"propriedade de slot desconhecida, timeline ignorada: {prop}")
            return None
    elif kind == "constraint":
        constraint = data.find_constraint(target or "")
        if constraint is None:
            return None
        allowed = CONSTRAINT_PROPERTIES.get(constraint.type, set())
        if prop not in allowed:
            warnings.add(f"propriedade fora do tipo da constraint, ignorada: {prop}")
            return None
    elif kind in ("parameter", "morph"):
        if prop not in ("value", "weight"):
            return None
    elif kind == "nested":
        if prop not in ("animation", "time", "timeScale"):
            return None
    elif kind == "BONE_particle":
        if prop not in PARTICLE_PROPERTIES:
            warnings.add(
                f"propriedade de emissor desconhecida, timeline ignorada: {prop}")
            return None
        if prop == "rate":
            # 4.2, the `linear` branch (2nd phase): `rate` animated by integral.
            # A negative key is 0 (L1 RANGE_PARTICLE_RATE) and a Bezier is
            # `linear` (L2 RANGE_PARTICLE_RATE_CURVE); both are said here, and
            # the swap itself is made where the emitter integrates.
            for key in raw.get("keys") or []:
                if not isinstance(key, dict):
                    continue
                valor = key.get("value")
                if isinstance(valor, (int, float)) and valor < 0:
                    warnings.add("RANGE_PARTICLE_RATE: taxa negativa na chave, fica 0")
                if isinstance(key.get("curve"), list):
                    warnings.add("RANGE_PARTICLE_RATE_CURVE: Bezier na taxa, fica linear")

    if kind == "BONE_particle":
        components = PARTICLE_PROPERTIES[prop or ""]
    else:
        components = _COMPONENTS.get(prop or "", 1)
    keys_raw = raw.get("keys")
    if not isinstance(keys_raw, list) or not keys_raw:
        return None
    key_kind = "slot/bone" if (kind == "slot" and prop == "bone") else kind
    keys = [_load_key(k, key_kind, components) for k in keys_raw if isinstance(k, dict)]
    if not keys:
        return None
    keys.sort(key=lambda k: k.time)
    return Timeline(
        type=kind, target=target, property=prop,
        skin=_text(raw, "skin", "default") or "default",
        attachment=_text(raw, "attachment", None),
        keys=keys, components=components,
    )


def _load_animation(raw: dict, data: SkeletonData, warnings: Warnings) -> AnimationData:
    animation = AnimationData(
        name=_text(raw, "name", "") or "",
        loop=_flag(raw, "loop", False),
        blend=_text(raw, "blend", "replace") or "replace",
        tags=[str(t) for t in (raw.get("tags") or [])],
    )
    if "defaultMix" in raw:
        animation.default_mix = _number(raw, "defaultMix", 0)
    for raw_timeline in raw.get("timelines", []) or []:
        if not isinstance(raw_timeline, dict):
            continue
        timeline = _load_timeline(raw_timeline, data, warnings)
        if timeline is not None:
            animation.timelines.append(timeline)
    longest = 0.0
    for timeline in animation.timelines:
        for key in timeline.keys:
            longest = max(longest, key.time)
    animation.duration = _number(raw, "duration", longest) if "duration" in raw else longest
    return animation


# ---------------------------------------------------------------------------
# Constraints
# ---------------------------------------------------------------------------


def _load_driver_key(raw: dict) -> DriverKey:
    key = DriverKey(input=_number(raw, "input", 0), offset=_integer(raw, "offset", 0))
    key.value = raw.get("value")
    key.curve = _curve(raw, 1, key.value)
    return key


def _load_constraint(raw: dict, warnings: Warnings) -> ConstraintData | None:
    kind = _text(raw, "type", "")
    common = {
        "type": kind,
        "name": _text(raw, "name", "") or "",
        "mix": _number(raw, "mix", 1),
        "skin_required": _flag(raw, "skinRequired", False),
    }
    names = [str(b) for b in (raw.get("bones") or [])]
    if kind == "ik":
        return IkConstraintData(
            **common, bones=names, target=_text(raw, "target", "") or "",
            bend_positive=_flag(raw, "bendPositive", True),
            compress=_flag(raw, "compress", False),
            stretch=_flag(raw, "stretch", False),
            uniform=_flag(raw, "uniform", False),
            softness=_number(raw, "softness", 0),
        )
    if kind == "transform":
        return TransformConstraintData(
            **common, bones=names, target=_text(raw, "target", "") or "",
            local=_flag(raw, "local", False), relative=_flag(raw, "relative", False),
            offset_rotation=_number(raw, "offsetRotation", 0),
            offset_x=_number(raw, "offsetX", 0), offset_y=_number(raw, "offsetY", 0),
            offset_scale_x=_number(raw, "offsetScaleX", 0),
            offset_scale_y=_number(raw, "offsetScaleY", 0),
            offset_shear_y=_number(raw, "offsetShearY", 0),
            mix_rotation=_number(raw, "mixRotation", 1),
            mix_x=_number(raw, "mixX", 1), mix_y=_number(raw, "mixY", 1),
            mix_scale_x=_number(raw, "mixScaleX", 1),
            mix_scale_y=_number(raw, "mixScaleY", 1),
            mix_shear_y=_number(raw, "mixShearY", 1),
        )
    if kind == "path":
        position_mode = _text(raw, "positionMode", "percent")
        spacing_mode = _text(raw, "spacingMode", "length")
        rotate_mode = _text(raw, "rotateMode", "tangent")
        if position_mode not in ("fixed", "percent"):
            position_mode = "percent"
        if spacing_mode not in ("length", "fixed", "percent", "proportional"):
            spacing_mode = "length"
        if rotate_mode not in ("tangent", "chain", "chainScale"):
            rotate_mode = "tangent"
        return PathConstraintData(
            **common, bones=names, target=_text(raw, "target", "") or "",
            position_mode=position_mode, spacing_mode=spacing_mode, rotate_mode=rotate_mode,
            offset_rotation=_number(raw, "offsetRotation", 0),
            position=_number(raw, "position", 0), spacing=_number(raw, "spacing", 0),
            mix_rotation=_number(raw, "mixRotation", 1),
            mix_x=_number(raw, "mixX", 1), mix_y=_number(raw, "mixY", 1),
        )
    if kind == "physics":
        return PhysicsConstraintData(
            **common, bone=_text(raw, "bone", "") or "",
            x=_number(raw, "x", 0), y=_number(raw, "y", 0),
            rotation=_number(raw, "rotation", 0),
            scale_x=_number(raw, "scaleX", 0), shear_x=_number(raw, "shearX", 0),
            inertia=_number(raw, "inertia", 0.5), strength=_number(raw, "strength", 100),
            damping=_number(raw, "damping", 1), mass=_number(raw, "mass", 1),
            wind=_number(raw, "wind", 0), gravity=_number(raw, "gravity", 0),
            limit=_number(raw, "limit", 5000), fps=_number(raw, "fps", 60),
        )
    if kind == "driver":
        targets_raw = raw.get("targets")
        targets = None
        if isinstance(targets_raw, list):
            targets = []
            for entry in targets_raw:
                if not isinstance(entry, dict):
                    continue
                keys = [_load_driver_key(k) for k in (entry.get("keys") or []) if isinstance(k, dict)]
                keys.sort(key=lambda k: k.input)
                mode = _text(entry, "mode", "replace")
                targets.append(DriverTarget(
                    type=_text(entry, "type", "") or "",
                    target=_text(entry, "target", None),
                    property=_text(entry, "property", None),
                    skin=_text(entry, "skin", "default") or "default",
                    attachment=_text(entry, "attachment", None),
                    mode=mode if mode in ("replace", "add") else "replace",
                    keys=keys,
                ))
        mode = _text(raw, "mode", "replace")
        return DriverConstraintData(
            **common, parameter=_text(raw, "parameter", "") or "",
            targets=targets, animation=_text(raw, "animation", None),
            from_value=_number(raw, "from", 0) if "from" in raw else None,
            to_value=_number(raw, "to", 1) if "to" in raw else None,
            time_from=_number(raw, "timeFrom", 0),
            time_to=_number(raw, "timeTo", 0) if "timeTo" in raw else None,
            mode=mode if mode in ("replace", "add") else "replace",
        )
    # Section 2.5: unknown constraint type is ignored.
    warnings.add(f"tipo de constraint desconhecido, ignorada: {kind}")
    return None


# ---------------------------------------------------------------------------
# The main document reader
# ---------------------------------------------------------------------------


def _link_meshes(data: SkeletonData, warnings: Warnings) -> None:
    """Resolve every `linkedmesh` to the arrays of its parent mesh (7.5)."""
    for skin in data.skins:
        for slot_name, placeholders in skin.attachments.items():
            for name, attachment in placeholders.items():
                if not isinstance(attachment, MeshAttachment) or attachment.type != "linkedmesh":
                    continue
                parent_skin_name = getattr(attachment, "link_skin", "default")
                parent_name = getattr(attachment, "link_parent", "")
                parent_skin = data.find_skin(parent_skin_name) or data.find_skin("default")
                parent = None
                if parent_skin is not None:
                    parent = parent_skin.attachments.get(slot_name, {}).get(parent_name)
                if not isinstance(parent, MeshAttachment) or parent.type != "mesh":
                    warnings.add(f"linkedmesh sem parent valido: {name}")
                    continue
                attachment.vertices = parent.vertices
                attachment.binding = parent.binding
                attachment.uvs = parent.uvs
                attachment.triangles = parent.triangles
                attachment.hull = parent.hull
                attachment.edges = parent.edges
                attachment.vertex_count = parent.vertex_count
                if getattr(attachment, "inherit_deform", True):
                    attachment.deform_source = parent


def load_skeleton_document(doc: dict, atlases: list[Atlas] | None = None) -> SkeletonData:
    """Build the data model from an already parsed `.bone` document."""
    if not isinstance(doc, dict):
        raise BoneError("o arquivo nao traz um objeto raiz")
    warnings = Warnings()

    header = doc.get("bone")
    if not isinstance(header, dict):
        raise BoneError("cabecalho `bone` ausente (2.3)")
    file_version = _parse_version(header.get("version"))
    min_version = _parse_version(header.get("minVersion"))
    if file_version[0] > READER_VERSION[0]:
        raise BoneError(
            f"arquivo major {file_version[0]}.{file_version[1]}, "
            f"leitor {READER_VERSION[0]}.{READER_VERSION[1]}"
        )
    if file_version[0] == READER_VERSION[0] and file_version > READER_VERSION:
        if min_version <= READER_VERSION:
            warnings.add("arquivo mais novo, leitura parcial")
        else:
            warnings.add("arquivo mais novo que o leitor: leitura em melhor esforco")

    # Section 2.7: an unknown required extension stops the load.
    required = [str(e) for e in (doc.get("extensionsRequired") or [])]
    missing = [e for e in required if e not in SUPPORTED_EXTENSIONS]
    if missing:
        raise BoneError(
            "extensao exigida e nao suportada (2.7): " + ", ".join(missing)
        )

    meta = doc.get("skeleton") if isinstance(doc.get("skeleton"), dict) else {}
    data = SkeletonData(
        name=_text(meta, "name", "") or "",
        fps=_number(meta, "fps", 30),
        reference_scale=_number(meta, "referenceScale", 100),
        pixel_art=_flag(meta, "pixelArt", False),
        atlases=list(atlases or []),
        warnings=warnings,
    )

    raw_bones = doc.get("bones")
    if not isinstance(raw_bones, list) or not raw_bones:
        raise BoneError("o arquivo precisa de pelo menos um osso (2.2)")
    by_name: dict[str, BoneData] = {}
    for index, raw in enumerate(raw_bones):
        if not isinstance(raw, dict):
            continue
        bone = BoneData(
            name=_text(raw, "name", f"bone{index}") or f"bone{index}",
            index=len(data.bones),
            length=_number(raw, "length", 0),
            x=_number(raw, "x", 0), y=_number(raw, "y", 0),
            rotation=_number(raw, "rotation", 0),
            scale_x=_number(raw, "scaleX", 1), scale_y=_number(raw, "scaleY", 1),
            shear_x=_number(raw, "shearX", 0), shear_y=_number(raw, "shearY", 0),
            inherit_rotation=_flag(raw, "inheritRotation", True),
            inherit_scale=_flag(raw, "inheritScale", True),
            inherit_reflection=_flag(raw, "inheritReflection", True),
            skin_required=_flag(raw, "skinRequired", False),
        )
        parent_name = _text(raw, "parent", None)
        if parent_name is not None:
            parent = by_name.get(parent_name)
            if parent is None:
                # Section 4.7: a broken or forward parent falls back to bones[0].
                warnings.add(f"osso com pai invalido, preso a raiz: {bone.name}")
                parent = data.bones[0] if data.bones else None
            bone.parent = parent
        elif data.bones:
            bone.parent = data.bones[0]
        data.bones.append(bone)
        by_name[bone.name] = bone

    for index, raw in enumerate(doc.get("slots") or []):
        if not isinstance(raw, dict):
            continue
        bone = by_name.get(_text(raw, "bone", "") or "")
        if bone is None:
            warnings.add(f"slot com osso invalido, preso a raiz: {raw.get('name')}")
            bone = data.bones[0]
        blend = _text(raw, "blend", "normal")
        if blend not in ("normal", "additive", "multiply", "screen"):
            warnings.add(f"blend desconhecido, usando normal: {blend}")
            blend = "normal"
        data.slots.append(SlotData(
            name=_text(raw, "name", f"slot{index}") or f"slot{index}",
            index=len(data.slots), bone=bone,
            attachment=_text(raw, "attachment", None),
            color=_color(raw, "color", [1.0, 1.0, 1.0, 1.0]),
            dark_color=_color(raw, "darkColor", None),
            blend=blend, visible=_flag(raw, "visible", True),
        ))

    for raw in doc.get("skins") or []:
        if not isinstance(raw, dict):
            continue
        skin = SkinData(
            name=_text(raw, "name", "") or "",
            includes=[str(s) for s in (raw.get("includes") or [])],
            bones=[str(s) for s in (raw.get("bones") or [])],
            constraints=[str(s) for s in (raw.get("constraints") or [])],
        )
        for entry in raw.get("drawOrder") or []:
            if not isinstance(entry, dict) or not isinstance(entry.get("slot"), str):
                continue
            offset = entry.get("offset", 0)
            if isinstance(offset, bool) or not isinstance(offset, (int, float)):
                offset = 0
            skin.draw_order.append((entry["slot"], int(offset)))
        raw_attachments = raw.get("attachments")
        if isinstance(raw_attachments, dict):
            for slot_name, placeholders in raw_attachments.items():
                if not isinstance(placeholders, dict):
                    continue
                bucket: dict[str, Any] = {}
                for name, raw_attachment in placeholders.items():
                    if raw_attachment is None:
                        bucket[name] = None       # explicit hide (4.4)
                    elif isinstance(raw_attachment, dict):
                        bucket[name] = _load_attachment(name, raw_attachment, warnings)
                skin.attachments[slot_name] = bucket
        data.skins.append(skin)

    _link_meshes(data, warnings)
    for skin in data.skins:
        for placeholders in skin.attachments.values():
            for attachment in placeholders.values():
                if isinstance(attachment, RegionAttachment):
                    _prepare_region(attachment, data.atlases)
                elif isinstance(attachment, MeshAttachment):
                    _prepare_mesh(attachment, data.atlases)

    for raw in doc.get("constraints") or []:
        if not isinstance(raw, dict):
            continue
        constraint = _load_constraint(raw, warnings)
        if constraint is not None:
            data.constraints.append(constraint)

    for raw in doc.get("events") or []:
        if not isinstance(raw, dict):
            continue
        data.events.append(EventDef(
            name=_text(raw, "name", "") or "",
            int_value=_integer(raw, "int", 0),
            float_value=_number(raw, "float", 0),
            string_value=_text(raw, "string", "") or "",
            audio=_text(raw, "audio", None),
            volume=_number(raw, "volume", 1),
            balance=_number(raw, "balance", 0),
        ))

    for raw in doc.get("parameters") or []:
        if not isinstance(raw, dict):
            continue
        source = None
        raw_source = raw.get("source")
        if isinstance(raw_source, dict):
            prop = _text(raw_source, "property", "")
            if prop in BONE_PROPERTIES:
                source = ParameterSource(
                    bone=_text(raw_source, "bone", "") or "", property=prop,
                    from_value=_number(raw_source, "from", 0),
                    to_value=_number(raw_source, "to", 1),
                )
            else:
                warnings.add(f"source com propriedade desconhecida, ignorada: {prop}")
        data.parameters.append(ParameterData(
            name=_text(raw, "name", "") or "",
            min=_number(raw, "min", 0), max=_number(raw, "max", 1),
            default=_number(raw, "default", 0),
            repeat=_flag(raw, "repeat", False), source=source,
        ))

    for raw in doc.get("morphs") or []:
        if not isinstance(raw, dict):
            continue
        targets = []
        for entry in raw.get("targets") or []:
            if not isinstance(entry, dict):
                continue
            targets.append(MorphTarget(
                slot=_text(entry, "slot", "") or "",
                attachment=_text(entry, "attachment", "") or "",
                skin=_text(entry, "skin", "default") or "default",
                offsets=_floats(entry.get("offsets")),
            ))
        data.morphs.append(MorphData(
            name=_text(raw, "name", "") or "",
            weight=_number(raw, "weight", 0),
            min=_number(raw, "min", 0), max=_number(raw, "max", 1),
            targets=targets,
        ))

    for raw in doc.get("variables") or []:
        if not isinstance(raw, dict):
            continue
        kind = _text(raw, "type", "float")
        if kind not in ("float", "int", "string", "bool"):
            warnings.add(f"tipo de variavel desconhecido, ignorada: {kind}")
            continue
        default = raw.get("default")
        if default is None:
            default = {"float": 0.0, "int": 0, "string": "", "bool": False}[kind]
        data.variables.append(VariableData(
            name=_text(raw, "name", "") or "", type=kind, default=default,
        ))

    data.tags = [str(t) for t in (doc.get("tags") or [])]

    for raw in doc.get("animations") or []:
        if isinstance(raw, dict):
            data.animations.append(_load_animation(raw, data, warnings))

    return data


# ---------------------------------------------------------------------------
# Packaging (2.9) and file entry points
# ---------------------------------------------------------------------------


def _parse_text(data: bytes) -> Any:
    text = data.decode("utf-8-sig")
    return json.loads(text)


def _join(base: str, name: str) -> str:
    if not base:
        return name
    if not base.endswith("/"):
        base += "/"
    return base + name


def load_skeleton_bytes(
    data: bytes,
    resolve: Callable[[str], bytes | None] | None = None,
) -> SkeletonData:
    """Load any of the three packagings from bytes.

    `resolve` receives a uri relative to the file and returns its bytes, or
    None when the file is missing (2.8: a missing file is never fatal).
    """
    doc, resolve = _doc_and_resolver(data, resolve)
    return _finish(doc, resolve, _Context(), (), "", load_bodies=True)


class _Context:
    """One load of a project: every file read once, shared by whoever cites it."""

    def __init__(self) -> None:
        self.cache: dict[tuple[str, bool], SkeletonData] = {}


def _doc_and_resolver(
    data: bytes, resolve: Callable[[str], bytes | None] | None,
) -> tuple[dict, Callable[[str], bytes | None] | None]:
    """The document inside any of the three packagings, and the resolver that
    answers for ITS folder (2.8: inside a `.bonez`, the folder of `main`)."""
    if binary.is_boneb(data):
        return (binary.parse_boneb(data), resolve)
    if data[:4] == b"PK\x03\x04":
        return _open_bonez(data)
    return (_parse_text(data), resolve)


def _sub_resolver(resolve, path: str):
    """A resolver for the file at `path`: its uris resolve against ITS folder."""
    folder = posixpath.dirname(path)
    if resolve is None:
        return None
    if not folder:
        return resolve
    return lambda uri: resolve(folder + "/" + uri)


def _full(where: str, path: str) -> str:
    """The path of `path`, cited by the file at `where`, from the first file."""
    folder = posixpath.dirname(where)
    return posixpath.normpath(posixpath.join(folder, path)) if folder else path


def _assets(doc: dict) -> dict:
    return doc.get("assets") if isinstance(doc.get("assets"), dict) else {}


def _uri_list(assets: dict, key: str) -> list[str]:
    raw = assets.get(key)
    return [str(u) for u in raw] if isinstance(raw, list) else []


def _finish(doc: dict, resolve: Callable[[str], bytes | None] | None,
            ctx: "_Context | None" = None, chain: tuple[str, ...] = (),
            where: str = "", load_bodies: bool = True) -> SkeletonData:
    ctx = ctx or _Context()
    atlases: list[Atlas] = []
    assets = _assets(doc)
    missing: list[str] = []
    if resolve is not None:
        for uri in assets.get("atlases", []) or []:
            raw = resolve(str(uri))
            if raw is not None:
                atlases.append(load_atlas(_parse_text(raw)))
            else:
                missing.append(str(uri))
    base = _text(assets, "skeletonsBase", "") or ""

    # 2.8: external skins bring bones, slots and constraints INTO this body,
    # at the end of the arrays. That has to happen before the body is built:
    # the body is assembled once, with those bones inside.
    skin_files = _read_external(doc, "skins", base, resolve, missing)
    doc, notes = _merge_skin_structure(doc, skin_files)

    data = load_skeleton_document(doc, atlases)
    data.skeletons_base = base
    data.rig = doc.get("rig") if isinstance(doc.get("rig"), dict) else {}
    data.missing.extend(missing)
    for note in notes:
        data.warnings.add(note)

    for path, raw_doc, sub in skin_files:
        _import_skins(data, path, raw_doc, sub, ctx, chain, _full(where, path))
    for path, raw_doc, _sub in _read_external(doc, "animations", base, resolve, data.missing):
        _import_animations(data, path, raw_doc)

    _load_children(data, resolve, ctx, chain, where)
    if load_bodies:
        _load_bodies(data, resolve, ctx, chain, where)
    return data


def _read_file(path: str, resolve) -> "tuple[dict, Callable | None] | None":
    if resolve is None:
        return None
    raw = resolve(path)
    if raw is None:
        return None
    try:
        doc, sub = _doc_and_resolver(raw, _sub_resolver(resolve, path))
    except Exception:  # noqa: BLE001 — a broken external file counts as missing
        return None
    if not isinstance(doc, dict):
        return None
    return (doc, sub)


def _read_external(doc: dict, key: str, base: str, resolve,
                   missing: list[str]) -> list:
    out = []
    for uri in _uri_list(_assets(doc), key):
        path = _join(base, uri)
        found = _read_file(path, resolve)
        if found is None:
            missing.append(path)
            continue
        out.append((path, found[0], found[1]))
    return out


def _rig_check(host: SkeletonData, raw_doc: dict, path: str) -> dict:
    warnings = host.warnings
    rig = raw_doc.get("rig") if isinstance(raw_doc.get("rig"), dict) else {}
    for name in rig.get("bones") or []:
        if host.find_bone(str(name)) is None:
            warnings.add(f"RIG_UNMET: {path} exige o osso {name}")
    for name in rig.get("slots") or []:
        if host.find_slot(str(name)) is None:
            warnings.add(f"RIG_UNMET: {path} exige o slot {name}")
    ext = _assets(raw_doc)
    if ext.get("animations") or ext.get("skins"):
        # 2.8: depth is always 1; the lists of an external file are ignored.
        warnings.add(f"EXTERNAL_CHAIN: {path} tem assets.animations/skins próprios, ignorados")
    return rig


def _merge_skin_structure(doc: dict, skin_files) -> tuple[dict, list[str]]:
    """2.8 (F23): what an external skin brings into the body besides skins."""
    notes: list[str] = []
    if not skin_files:
        return (doc, notes)
    doc = dict(doc)
    bones = list(doc.get("bones") or [])
    slots = list(doc.get("slots") or [])
    constraints = list(doc.get("constraints") or [])
    local_bones = {b.get("name") for b in bones if isinstance(b, dict)}
    local_slots = {s.get("name") for s in slots if isinstance(s, dict)}
    local_constraints = {c.get("name") for c in constraints if isinstance(c, dict)}
    for path, raw_doc, _sub in skin_files:
        rig = raw_doc.get("rig") if isinstance(raw_doc.get("rig"), dict) else {}
        rig_bones = {str(b) for b in (rig.get("bones") or [])}
        raw_bones = [b for b in (raw_doc.get("bones") or []) if isinstance(b, dict)]
        brought = {b.get("name") for b in raw_bones if b.get("skinRequired") is True}
        for index, raw in enumerate(raw_bones):
            name = raw.get("name")
            if raw.get("skinRequired") is not True:
                if index != 0:
                    notes.append(f"EXTERNAL_BONE_NOT_SKIN: {path} osso {name} ignorado")
                continue
            if name in local_bones:
                notes.append(f"EXTERNAL_DUPLICATE: {path} osso {name}; vale o local")
                continue
            parent = raw.get("parent")
            if parent is not None and parent not in rig_bones and parent not in brought:
                notes.append(f"REF_BONE_MISSING: {path} osso {name} com pai {parent} fora do rig")
            bones.append(dict(raw))
            local_bones.add(name)
        for raw in raw_doc.get("slots") or []:
            if not isinstance(raw, dict):
                continue
            if raw.get("name") in local_slots:
                notes.append(f"EXTERNAL_DUPLICATE: {path} slot {raw.get('name')}; vale o local")
                continue
            slots.append(dict(raw))
            local_slots.add(raw.get("name"))
        for raw in raw_doc.get("constraints") or []:
            if not isinstance(raw, dict):
                continue
            if raw.get("skinRequired") is not True:
                notes.append(f"EXTERNAL_BONE_NOT_SKIN: {path} regra {raw.get('name')} ignorada")
                continue
            if raw.get("name") in local_constraints:
                notes.append(f"EXTERNAL_DUPLICATE: {path} regra {raw.get('name')}; vale a local")
                continue
            constraints.append(dict(raw))
            local_constraints.add(raw.get("name"))
    doc["bones"] = bones
    doc["slots"] = slots
    doc["constraints"] = constraints
    return (doc, notes)


def _import_skins(data: SkeletonData, path: str, raw_doc: dict, sub, ctx: "_Context",
                  chain: tuple[str, ...], full: str) -> None:
    warnings = data.warnings
    _rig_check(data, raw_doc, path)
    # The skin's assets resolve against ITS file (2.8), so it is loaded as a
    # file of its own; only its skins are kept.
    shell = {key: value for key, value in raw_doc.items() if key != "animations"}
    ext_assets = {key: value for key, value in _assets(raw_doc).items()
                  if key not in ("animations", "skins")}
    shell["assets"] = ext_assets
    try:
        external = _finish(shell, sub, ctx, chain + (full,), full, load_bodies=False)
    except BoneError:
        data.missing.append(path)
        return
    for skin in external.skins:
        if data.find_skin(skin.name) is not None:
            warnings.add(f"EXTERNAL_DUPLICATE: skin {skin.name} de {path}; vale a primeira")
            continue
        # A `binding` counts bones by INDEX in the file that wrote it (4.7).
        # Moved into this body, the index is translated through the bone name.
        remap = {i: data.find_bone(b.name) for i, b in enumerate(external.bones)}
        for placeholders in skin.attachments.values():
            for attachment in placeholders.values():
                binding = getattr(attachment, "binding", None)
                if binding is None:
                    continue
                translated = []
                for i in binding.bones:
                    bone = remap.get(i)
                    if bone is None:
                        warnings.add(f"RIG_UNMET: {path} binding cita um osso que o corpo não tem")
                    translated.append(bone.index if bone is not None else 0)
                binding.bones = translated
        data.skins.append(skin)


def _scaled_animation(raw: dict, k: float) -> dict:
    """2.8 (F24): `bone/x` and `bone/y` values, and the `cy` of their Bézier
    curves, multiplied by k while copying."""
    if k == 1:
        return raw
    out = dict(raw)
    timelines = []
    for timeline in raw.get("timelines") or []:
        if (isinstance(timeline, dict) and timeline.get("type") == "bone"
                and timeline.get("property") in ("x", "y")):
            timeline = dict(timeline)
            keys = []
            for key in timeline.get("keys") or []:
                if isinstance(key, dict):
                    key = dict(key)
                    value = key.get("value")
                    if isinstance(value, (int, float)) and not isinstance(value, bool):
                        key["value"] = value * k
                    curve = key.get("curve")
                    if isinstance(curve, list) and len(curve) == 4:
                        key["curve"] = [curve[0], curve[1] * k, curve[2], curve[3] * k]
                keys.append(key)
            timeline["keys"] = keys
        timelines.append(timeline)
    out["timelines"] = timelines
    return out


def _import_animations(data: SkeletonData, path: str, raw_doc: dict) -> None:
    warnings = data.warnings
    rig = _rig_check(data, raw_doc, path)
    k = 1.0
    reference = rig.get("reference")
    if isinstance(reference, dict):
        bone = data.find_bone(str(reference.get("bone", "")))
        length = reference.get("length")
        if not isinstance(length, (int, float)) or isinstance(length, bool) or length <= 0:
            warnings.add(f"RIG_REFERENCE: {path} reference.length inválido; k = 1")
        elif bone is None or bone.length == 0:
            warnings.add(f"RIG_UNMET: {path} reference.bone {reference.get('bone')}; k = 1")
        else:
            k = bone.length / float(length)
    for raw in raw_doc.get("animations") or []:
        if not isinstance(raw, dict):
            continue
        name = raw.get("name")
        if data.find_animation(str(name)) is not None:
            warnings.add(f"EXTERNAL_DUPLICATE: animação {name} de {path}; vale a primeira")
            continue
        data.animations.append(_load_animation(_scaled_animation(raw, k), data, warnings))


def _load_child_file(path: str, resolve, ctx: "_Context", chain: tuple[str, ...],
                     where: str, warnings: Warnings) -> SkeletonData | None:
    full = _full(where, path)
    if full in chain or (not chain and full == where):
        warnings.add(f"NESTED_CYCLE: {full} contém a si mesmo (7.11); parado")
        return None
    if len(chain) >= MAX_NESTING:
        warnings.add(f"NESTED_DEPTH: {full} passa da profundidade {MAX_NESTING} (12.6)")
        return None
    if (full, False) in ctx.cache:
        return ctx.cache[(full, False)]
    found = _read_file(path, resolve)
    if found is None:
        return None
    try:
        child = _finish(found[0], found[1], ctx, chain + (full,), full, load_bodies=False)
    except BoneError as error:
        warnings.add(f"arquivo externo recusado, fica invisível: {full}: {error}")
        return None
    ctx.cache[(full, False)] = child
    return child


def _load_children(data: SkeletonData, resolve, ctx: "_Context", chain: tuple[str, ...],
                   where: str) -> None:
    """7.11: every `skeleton` attachment gets its child loaded, once per file."""
    for skin in data.skins:
        for placeholders in skin.attachments.values():
            for attachment in placeholders.values():
                if not isinstance(attachment, SkeletonAttachment) or attachment.child is not None:
                    continue
                path = _join(data.skeletons_base, attachment.uri)
                attachment.resolved = _full(where, path)
                child = _load_child_file(path, resolve, ctx, chain, where, data.warnings)
                if child is None:
                    if path not in data.missing:
                        data.missing.append(path)
                    data.warnings.add(f"esqueleto aninhado faltando, placeholder vazio: {path}")
                    continue
                attachment.child = child


def _load_bodies(data: SkeletonData, resolve, ctx: "_Context", chain: tuple[str, ...],
                 where: str) -> None:
    """9.13: every body a `body` key cites is assembled ONCE, at load time."""
    for animation in data.animations:
        for timeline in animation.timelines:
            if timeline.type != "body":
                continue
            for key in timeline.keys:
                value = key.value
                if not isinstance(value, str) or value in data.bodies:
                    continue
                path = _join(data.skeletons_base, value)
                body = _load_child_file(path, resolve, ctx, chain, where, data.warnings)
                if body is None:
                    data.warnings.add(f"BODY_MISSING: corpo {value} não carregou; fica o de antes")
                    if path not in data.missing:
                        data.missing.append(path)
                    continue
                data.bodies[value] = body


def _open_bonez(data: bytes) -> "tuple[dict, Callable[[str], bytes | None]]":
    archive = zipfile.ZipFile(BytesIO(data))
    names = archive.namelist()
    if not names or names[0] != "mimetype":
        raise BoneError("a primeira entrada do .bonez deve ser `mimetype` (2.9)")
    mimetype = archive.read("mimetype").decode("ascii", "replace")
    if mimetype != "application/vnd.bone+zip":
        raise BoneError(f"mimetype inesperado no .bonez: {mimetype}")
    manifest = json.loads(archive.read("manifest.json").decode("utf-8-sig"))
    main = manifest.get("main")
    if not isinstance(main, str):
        raise BoneError("manifest.json sem `main` (2.9)")
    base = posixpath.dirname(main)

    def resolve(uri: str) -> bytes | None:
        candidate = posixpath.normpath(posixpath.join(base, uri)) if base else uri
        try:
            return archive.read(candidate)
        except KeyError:
            return None

    raw_main = archive.read(main)
    if binary.is_boneb(raw_main):
        doc = binary.parse_boneb(raw_main)
    else:
        doc = _parse_text(raw_main)
    return (doc, resolve)


def _load_bonez(data: bytes) -> SkeletonData:
    doc, resolve = _open_bonez(data)
    return _finish(doc, resolve)


def load_skeleton_file(path: str | Path) -> SkeletonData:
    """Load a `.bone`, `.boneb` or `.bonez` from disk, with its atlases."""
    path = Path(path)
    data = path.read_bytes()
    folder = path.parent

    def resolve(uri: str) -> bytes | None:
        candidate = folder / uri
        return candidate.read_bytes() if candidate.is_file() else None

    return load_skeleton_bytes(data, resolve)
