# SPDX-License-Identifier: Apache-2.0
"""Setup pose, world transforms and attachment geometry.

Sections 3, 5 and 7 of the specification. Every bone carries three states:
local (written by the setup pose and by animations), applied (a copy of local
at the start of each frame, then written by constraints) and world (always
computed from applied).
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from typing import Any

from .loader import (
    Attachment,
    BoneData,
    BoundingBoxAttachment,
    ClippingAttachment,
    MeshAttachment,
    PathAttachment,
    PointAttachment,
    RegionAttachment,
    SkeletonData,
    SlotData,
)

DEG2RAD = math.pi / 180.0
RAD2DEG = 180.0 / math.pi

MODE_NORMAL = "normal"
MODE_ONLY_TRANSLATION = "onlyTranslation"
MODE_NO_ROTATION_OR_REFLECTION = "noRotationOrReflection"
MODE_NO_SCALE = "noScale"
MODE_NO_SCALE_OR_REFLECTION = "noScaleOrReflection"
# F3: built on the Spine formulas above; section 5.4.
MODE_NO_ROTATION = "noRotation"
MODE_NO_REFLECTION = "noReflection"
MODE_ONLY_REFLECTION = "onlyReflection"

# Section 5.3. Since F3 the eight combinations have a mode of their own.
_MODES = {
    (True, True, True): MODE_NORMAL,
    (False, False, False): MODE_ONLY_TRANSLATION,
    (False, True, False): MODE_NO_ROTATION_OR_REFLECTION,
    (True, False, True): MODE_NO_SCALE,
    (True, False, False): MODE_NO_SCALE_OR_REFLECTION,
    (False, True, True): MODE_NO_ROTATION,
    (True, True, False): MODE_NO_REFLECTION,
    (False, False, True): MODE_ONLY_REFLECTION,
}


def cosd(degrees: float) -> float:
    return math.cos(degrees * DEG2RAD)


def sind(degrees: float) -> float:
    return math.sin(degrees * DEG2RAD)


def atan2d(y: float, x: float) -> float:
    """atan2 in degrees, with atan2(0, 0) defined as 0 (spec 3.6)."""
    if y == 0.0 and x == 0.0:
        return 0.0
    return math.atan2(y, x) * RAD2DEG


def atan2r(y: float, x: float) -> float:
    if y == 0.0 and x == 0.0:
        return 0.0
    return math.atan2(y, x)


def normalized(degrees: float) -> float:
    """Reduce degrees to (-180, 180]."""
    if not math.isfinite(degrees):
        return 0.0
    value = math.fmod(degrees, 360.0)
    if value > 180.0:
        value -= 360.0
    elif value <= -180.0:
        value += 360.0
    return value


def normalize(radians: float) -> float:
    """Reduce radians to (-pi, pi]."""
    if not math.isfinite(radians):
        return 0.0
    value = math.fmod(radians, math.tau)
    if value > math.pi:
        value -= math.tau
    elif value <= -math.pi:
        value += math.tau
    return value


def safe(value: float) -> float:
    """Section 5.5: anything that would be NaN or infinite enters the pose as 0."""
    return value if math.isfinite(value) else 0.0


def clamp(value: float, low: float, high: float) -> float:
    return low if value < low else (high if value > high else value)


@dataclass
class Pose:
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

    def copy_from(self, other: "Pose") -> None:
        self.x = other.x
        self.y = other.y
        self.rotation = other.rotation
        self.scale_x = other.scale_x
        self.scale_y = other.scale_y
        self.shear_x = other.shear_x
        self.shear_y = other.shear_y
        self.inherit_rotation = other.inherit_rotation
        self.inherit_scale = other.inherit_scale
        self.inherit_reflection = other.inherit_reflection


class Frame:
    """A bare world matrix: what the root of a nested skeleton gets as its
    parent (7.11, `P = M x T.R.S`)."""

    def __init__(self, a: float = 1.0, b: float = 0.0, c: float = 0.0, d: float = 1.0,
                 world_x: float = 0.0, world_y: float = 0.0) -> None:
        self.a = a
        self.b = b
        self.c = c
        self.d = d
        self.world_x = world_x
        self.world_y = world_y

    def local_to_world(self, lx: float, ly: float) -> tuple[float, float]:
        return (self.a * lx + self.b * ly + self.world_x,
                self.c * lx + self.d * ly + self.world_y)

    def times_trs(self, x: float, y: float, rotation: float,
                  scale_x: float, scale_y: float) -> "Frame":
        """self x T(x, y) . R(rotation) . S(scaleX, scaleY) — T first, then R
        (9.5, the order case C-295 pins down)."""
        cos = cosd(rotation)
        sin = sind(rotation)
        la, lb = cos * scale_x, -sin * scale_y
        lc, ld = sin * scale_x, cos * scale_y
        wx, wy = self.local_to_world(x, y)
        return Frame(self.a * la + self.b * lc, self.a * lb + self.b * ld,
                     self.c * la + self.d * lc, self.c * lb + self.d * ld, wx, wy)


def frame_of(bone) -> Frame:
    return Frame(bone.a, bone.b, bone.c, bone.d, bone.world_x, bone.world_y)


class Bone:
    """A bone instance: local pose, applied pose and world matrix."""

    def __init__(self, data: BoneData, skeleton: "Skeleton", parent: "Bone | None") -> None:
        self.data = data
        self.name = data.name
        self.skeleton = skeleton
        self.parent = parent
        # The parent written in the file (5.1); a `parent` key (9.4) moves `parent`.
        self.setup_parent = parent
        self.children: list[Bone] = []
        self.local = Pose()
        self.applied = Pose()
        self.a = 1.0
        self.b = 0.0
        self.c = 0.0
        self.d = 1.0
        self.world_x = 0.0
        self.world_y = 0.0
        # Dirt cache of 5.6: a bone whose world a constraint already wrote is
        # NOT recomputed from the applied pose, and its descendants are.
        self.dirty = True
        if parent is not None:
            parent.children.append(self)

    @property
    def length(self) -> float:
        return self.data.length

    def set_parent(self, parent: "Bone | None") -> bool:
        """9.4 `parent` key. Refuses a cycle (the new parent is this bone or
        a descendant) and returns False; the caller warns once (L2
        PARENT_CYCLE). Nothing is converted: from now on the local values
        are measured from the new parent, as in Spriter."""
        if parent is self.parent:
            return True
        p = parent
        while p is not None:
            if p is self:
                return False
            p = p.parent
        if self.parent is not None and self in self.parent.children:
            self.parent.children.remove(self)
        self.parent = parent
        if parent is not None:
            parent.children.append(self)
        self.dirty = True
        self.skeleton.order_dirty = True
        return True

    def set_to_setup_pose(self) -> None:
        if self.parent is not self.setup_parent:
            self.set_parent(self.setup_parent)
        data = self.data
        pose = self.local
        pose.x = data.x
        pose.y = data.y
        pose.rotation = data.rotation
        pose.scale_x = data.scale_x
        pose.scale_y = data.scale_y
        pose.shear_x = data.shear_x
        pose.shear_y = data.shear_y
        pose.inherit_rotation = data.inherit_rotation
        pose.inherit_scale = data.inherit_scale
        pose.inherit_reflection = data.inherit_reflection

    def mode(self) -> str:
        if self.parent is None and self.skeleton.parent_frame is not None:
            # 7.11: the root of a nested skeleton is computed as `normal`.
            return MODE_NORMAL
        pose = self.applied
        return _MODES[(pose.inherit_rotation, pose.inherit_scale, pose.inherit_reflection)]

    # -- section 5.4 ------------------------------------------------------

    def mark_clean(self) -> None:
        """This bone's world matrix is authoritative; its children are not."""
        self.dirty = False
        for child in self.children:
            child.dirty = True

    def update_world(self) -> None:
        self.mark_clean()
        pose = self.applied
        skeleton = self.skeleton
        sx, sy = skeleton.scale_x, skeleton.scale_y

        rot_y = pose.rotation + 90 + pose.shear_y
        la = cosd(pose.rotation + pose.shear_x) * pose.scale_x
        lb = cosd(rot_y) * pose.scale_y
        lc = sind(pose.rotation + pose.shear_x) * pose.scale_x
        ld = sind(rot_y) * pose.scale_y

        parent = self.parent or skeleton.parent_frame
        if parent is None:
            self.world_x = pose.x * sx + skeleton.x
            self.world_y = pose.y * sy + skeleton.y
            self.a = la * sx
            self.b = lb * sx
            self.c = lc * sy
            self.d = ld * sy
            return

        pa, pb, pc, pd = parent.a, parent.b, parent.c, parent.d
        self.world_x = pa * pose.x + pb * pose.y + parent.world_x
        self.world_y = pc * pose.x + pd * pose.y + parent.world_y

        mode = self.mode()
        # F3: the reflection of the chain, without the whole skeleton's flip
        # (the same test noScale makes).
        flip = (pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))
        if mode in (MODE_NORMAL, MODE_NO_REFLECTION):
            if mode == MODE_NO_REFLECTION and flip:
                pb = -pb
                pd = -pd
            self.a = pa * la + pb * lc
            self.b = pa * lb + pb * ld
            self.c = pc * la + pd * lc
            self.d = pc * lb + pd * ld
            return

        if mode in (MODE_ONLY_TRANSLATION, MODE_ONLY_REFLECTION):
            if mode == MODE_ONLY_REFLECTION and flip:
                lb = -lb
                ld = -ld
            self.a, self.b, self.c, self.d = la, lb, lc, ld
        elif mode in (MODE_NO_ROTATION_OR_REFLECTION, MODE_NO_ROTATION):
            s = pa * pa + pc * pc
            if s > 0.0001:
                s = abs(pa * pd - pb * pc) / s
                if mode == MODE_NO_ROTATION and flip:
                    s = -s
                pa = pa / sx
                pc = pc / sy
                pb = pc * s
                pd = pa * s
                prx = atan2d(pc, pa)
            else:
                pa = 0.0
                pc = 0.0
                prx = 90 - atan2d(pd, pb)
            rx = pose.rotation + pose.shear_x - prx
            ry = pose.rotation + pose.shear_y - prx + 90
            la = cosd(rx) * pose.scale_x
            lb = cosd(ry) * pose.scale_y
            lc = sind(rx) * pose.scale_x
            ld = sind(ry) * pose.scale_y
            self.a = pa * la - pb * lc
            self.b = pa * lb - pb * ld
            self.c = pc * la + pd * lc
            self.d = pc * lb + pd * ld
        else:  # noScale and noScaleOrReflection
            cos = cosd(pose.rotation)
            sin = sind(pose.rotation)
            za = (pa * cos + pb * sin) / sx
            zc = (pc * cos + pd * sin) / sy
            s = math.sqrt(za * za + zc * zc)
            if s > 0.00001:
                s = 1 / s
            za *= s
            zc *= s
            s = math.sqrt(za * za + zc * zc)
            if mode == MODE_NO_SCALE and ((pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))):
                s = -s
            r = atan2r(zc, za) + math.pi / 2
            zb = math.cos(r) * s
            zd = math.sin(r) * s
            la = cosd(pose.shear_x) * pose.scale_x
            lb = cosd(90 + pose.shear_y) * pose.scale_y
            lc = sind(pose.shear_x) * pose.scale_x
            ld = sind(90 + pose.shear_y) * pose.scale_y
            self.a = za * la + zb * lc
            self.b = za * lb + zb * ld
            self.c = zc * la + zd * lc
            self.d = zc * lb + zd * ld

        self.a *= sx
        self.b *= sx
        self.c *= sy
        self.d *= sy

    # -- section 5.5 ------------------------------------------------------

    def world_to_local(self, wx: float, wy: float) -> tuple[float, float]:
        det = self.a * self.d - self.b * self.c
        if abs(det) <= 0.0001:
            return (0.0, 0.0)
        x = wx - self.world_x
        y = wy - self.world_y
        return ((x * self.d - y * self.b) / det, (y * self.a - x * self.c) / det)

    def local_to_world(self, lx: float, ly: float) -> tuple[float, float]:
        return (self.a * lx + self.b * ly + self.world_x,
                self.c * lx + self.d * ly + self.world_y)

    def applied_from_world(self) -> None:
        self.mark_clean()
        pose = self.applied
        skeleton = self.skeleton
        parent = self.parent or skeleton.parent_frame
        sx, sy = skeleton.scale_x, skeleton.scale_y

        if parent is None:
            pose.x = safe((self.world_x - skeleton.x) / sx)
            pose.y = safe((self.world_y - skeleton.y) / sy)
            pose.rotation = atan2d(self.c, self.a)
            pose.scale_x = math.sqrt(self.a * self.a + self.c * self.c)
            pose.scale_y = math.sqrt(self.b * self.b + self.d * self.d)
            pose.shear_x = 0.0
            # The sign here is the opposite of the branch with a parent. It is
            # written this way in 5.5 on purpose, with an open decision noted.
            pose.shear_y = atan2d(self.a * self.b + self.c * self.d,
                                  self.a * self.d - self.b * self.c)
            return

        pa, pb, pc, pd = parent.a, parent.b, parent.c, parent.d
        det = pa * pd - pb * pc
        pid = 0.0 if abs(det) <= 0.0001 else 1 / det
        ia = pd * pid
        ib = pb * pid
        ic = pc * pid
        idd = pa * pid
        dx = self.world_x - parent.world_x
        dy = self.world_y - parent.world_y
        pose.x = safe(dx * ia - dy * ib)
        pose.y = safe(dy * idd - dx * ic)

        mode = self.mode()
        flip = (pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))
        if mode in (MODE_ONLY_TRANSLATION, MODE_ONLY_REFLECTION):
            ra, rb, rc, rd = self.a, self.b, self.c, self.d
            if mode == MODE_ONLY_REFLECTION and flip:
                rb = -rb
                rd = -rd
        else:
            if mode == MODE_NO_REFLECTION:
                if flip:
                    pb = -pb
                    pd = -pd
                    det = pa * pd - pb * pc
                    pid = 0.0 if abs(det) <= 0.0001 else 1 / det
                    ia = pd * pid
                    ib = pb * pid
                    ic = pc * pid
                    idd = pa * pid
            elif mode in (MODE_NO_ROTATION_OR_REFLECTION, MODE_NO_ROTATION):
                denominator = pa * pa + pc * pc
                s = 0.0 if denominator <= 0.0001 else abs(pa * pd - pb * pc) / denominator
                if mode == MODE_NO_ROTATION and flip:
                    s = -s
                sa = pa / sx
                sc = pc / sy
                pb = -sc * s * sx
                pd = sa * s * sy
                det = pa * pd - pb * pc
                pid = 0.0 if det == 0 else 1 / det
                ia = pd * pid
                ib = pb * pid
            elif mode in (MODE_NO_SCALE, MODE_NO_SCALE_OR_REFLECTION):
                cos = cosd(pose.rotation)
                sin = sind(pose.rotation)
                pa = (pa * cos + pb * sin) / sx
                pc = (pc * cos + pd * sin) / sy
                s = math.sqrt(pa * pa + pc * pc)
                if s > 0.00001:
                    s = 1 / s
                pa *= s
                pc *= s
                s = math.sqrt(pa * pa + pc * pc)
                if mode == MODE_NO_SCALE and ((pid < 0) != ((sx < 0) != (sy < 0))):
                    s = -s
                r = math.pi / 2 + atan2r(pc, pa)
                pb = math.cos(r) * s
                pd = math.sin(r) * s
                det = pa * pd - pb * pc
                pid = 0.0 if det == 0 else 1 / det
                ia = pd * pid
                ib = pb * pid
                ic = pc * pid
                idd = pa * pid
            ra = ia * self.a - ib * self.c
            rb = ia * self.b - ib * self.d
            rc = idd * self.c - ic * self.a
            rd = idd * self.d - ic * self.b

        pose.shear_x = 0.0
        pose.scale_x = math.sqrt(ra * ra + rc * rc)
        if pose.scale_x > 0.0001:
            det = ra * rd - rb * rc
            pose.scale_y = safe(det / pose.scale_x)
            pose.shear_y = -atan2d(ra * rb + rc * rd, det)
            pose.rotation = atan2d(rc, ra)
        else:
            pose.scale_x = 0.0
            pose.scale_y = math.sqrt(rb * rb + rd * rd)
            pose.shear_y = 0.0
            pose.rotation = 90 - atan2d(rd, rb)


class Slot:
    """A slot instance: what is shown, in what colour, and its sequence frame."""

    def __init__(self, data: SlotData, bone: Bone) -> None:
        self.data = data
        self.name = data.name
        self.index = data.index
        self.bone = bone
        self.attachment_name: str | None = data.attachment
        self.color = list(data.color)
        self.dark_color = list(data.dark_color) if data.dark_color else None
        self.blend = data.blend
        self.visible = data.visible
        self.sequence_index: int | None = None
        self.sequence_key: Any = None
        self.sequence_time: float = 0.0
        # 9.5: the bone of the file, and the `transform` of an active
        # `slot/bone` key, or None.
        self.setup_bone = bone
        self.bone_transform: tuple[float, float, float, float, float] | None = None

    def frame(self) -> "Bone | Frame":
        """The matrix an unweighted attachment of this slot is measured from:
        the applied bone, times the key's `transform` (9.5)."""
        if self.bone_transform is None:
            return self.bone
        return frame_of(self.bone).times_trs(*self.bone_transform)

    def set_to_setup_pose(self) -> None:
        self.bone = self.setup_bone
        self.bone_transform = None
        data = self.data
        self.attachment_name = data.attachment
        self.color = list(data.color)
        self.dark_color = list(data.dark_color) if data.dark_color else None
        self.blend = data.blend
        self.visible = data.visible
        self.sequence_index = None
        self.sequence_key = None
        self.sequence_time = 0.0


def order_from_offsets(base: list[int], entries: list[tuple[int, int]]) -> list[int]:
    """The draw-order algorithm of 9.5 over an arbitrary base order.

    ``base`` lists slot indices in the order the offsets are measured from
    (the ``slots`` array order, or the base order of 4.4). Holes are filled
    in base order with the slots nobody cited; targets are clamped and a
    later entry wins a collision.
    """
    count = len(base)
    order = [-1] * count
    position = {slot: i for i, slot in enumerate(base)}
    named: set[int] = set()
    for slot, offset in entries:
        if slot not in position:
            continue
        index = int(clamp(position[slot] + offset, 0, count - 1))
        if order[index] != -1:
            named.discard(order[index])
        order[index] = slot
        named.add(slot)
    j = 0
    for i in range(count):
        if order[i] == -1:
            while j < count and base[j] in named:
                j += 1
            order[i] = base[j]
            j += 1
    return order


class Skeleton:
    """A posable instance of a `SkeletonData`."""

    def __init__(self, data: SkeletonData) -> None:
        self.data = data
        self.scale_x = 1.0
        self.scale_y = 1.0
        self.x = 0.0
        self.y = 0.0
        self.time = 0.0
        # 7.11: set on a nested skeleton; its root bone takes it as parent.
        self.parent_frame: Frame | None = None

        self.bones: list[Bone] = []
        # Calculation order of 5.6 (parents before children); rebuilt when a
        # `parent` key (9.4) moves a bone. Set before the bones exist because
        # `Bone.set_parent` writes `order_dirty`.
        self.order_dirty = False
        self.warnings: list[str] = []
        by_data: dict[int, Bone] = {}
        for bone_data in data.bones:
            parent = by_data.get(id(bone_data.parent)) if bone_data.parent else None
            bone = Bone(bone_data, self, parent)
            by_data[id(bone_data)] = bone
            self.bones.append(bone)
        self.bone_by_name = {bone.name: bone for bone in self.bones}
        self.update_order: list[Bone] = list(self.bones)

        self.slots: list[Slot] = []
        for slot_data in data.slots:
            bone = self.bone_by_name.get(slot_data.bone.name if slot_data.bone else "")
            self.slots.append(Slot(slot_data, bone or self.bones[0]))
        self.slot_by_name = {slot.name: slot for slot in self.slots}

        # 4.4: a skeleton is born with the stack ["default"]; nothing is implicit.
        self.skin_names: list[str] = ["default"]
        self._attachment_cache: dict[tuple[str, str], tuple[Attachment | None, str]] = {}
        # Base order of 4.4: array order plus the `drawOrder` of the active skins.
        self.base_draw_order: list[int] = list(range(len(self.slots)))
        self.draw_order: list[int] = list(self.base_draw_order)

        # Animated state that does not live on bones or slots.
        self.deform: dict[tuple[str, str, str], list[float]] = {}
        # 9.6 `weights`: the weights of the frame, by (slot, skin, placeholder).
        self.weights: dict[tuple[str, str, str], list[float]] = {}
        self.morph_weights: dict[str, float] = {}
        self.parameters: dict[str, float] = {}
        self.variables: dict[str, Any] = {}
        self.tags: list[str] = []
        self.constraint_values: dict[str, dict[str, Any]] = {}
        self.nested_state: dict[str, dict[str, Any]] = {}
        # 7.11: the live entities this skeleton shows, by slot name. An actor
        # shares one dict among its bodies (9.13).
        self.nested_pool: dict[str, Any] = {}

        from .constraints import build_constraints  # local import: cycle

        self.constraints = build_constraints(self)
        self.set_to_setup_pose()

    # -- setup pose (5.1) -------------------------------------------------

    def set_skins(self, names: list[str]) -> None:
        self.skin_names = list(names)
        self._attachment_cache.clear()
        self._rebuild_base_draw_order()
        self.draw_order = list(self.base_draw_order)

    def _rebuild_base_draw_order(self) -> None:
        """4.4: the array order, then each active skin's `drawOrder` in the
        resolution order (`default`, includes, the skin), each applied over
        the order the previous ones left."""
        order = list(range(len(self.slots)))
        for skin_name in self._skin_chain():
            skin = self.data.find_skin(skin_name)
            if skin is None or not skin.draw_order:
                continue
            entries = [(self.slot_by_name[name].index, offset)
                       for name, offset in skin.draw_order if name in self.slot_by_name]
            order = order_from_offsets(order, entries)
        self.base_draw_order = order

    def set_to_setup_pose(self) -> None:
        for bone in self.bones:
            bone.set_to_setup_pose()
        for slot in self.slots:
            slot.set_to_setup_pose()
        self.draw_order = list(self.base_draw_order)
        self.deform = {}
        self.weights = {}
        self.morph_weights = {m.name: m.weight for m in self.data.morphs}
        self.parameters = {p.name: p.default for p in self.data.parameters}
        self.variables = {v.name: v.default for v in self.data.variables}
        self.tags = list(self.data.tags)
        self.constraint_values = {}
        for constraint in self.constraints:
            constraint.set_to_setup_pose()
        self.nested_state = {}

    # -- attachment resolution (4.4) --------------------------------------

    def _skin_chain(self) -> list[str]:
        """4.4: each skin of the stack, bottom to top, with its includes
        expanded before it. No `default` unless the stack lists it."""
        chain: list[str] = []
        seen: set[str] = set()

        def expand(name: str) -> None:
            if name in seen:
                return
            seen.add(name)
            skin = self.data.find_skin(name)
            if skin is None:
                return
            for included in skin.includes:
                expand(included)
            chain.append(name)

        for name in self.skin_names:
            expand(name)
        return chain

    def resolve_attachment(self, slot_name: str, placeholder: str) -> tuple[Attachment | None, str]:
        cached = self._attachment_cache.get((slot_name, placeholder))
        if cached is not None:
            return cached
        result: tuple[Attachment | None, str] = (None, "default")
        for skin_name in reversed(self._skin_chain()):
            skin = self.data.find_skin(skin_name)
            if skin is None:
                continue
            bucket = skin.attachments.get(slot_name)
            if bucket is not None and placeholder in bucket:
                result = (bucket[placeholder], skin_name)
                break
        self._attachment_cache[(slot_name, placeholder)] = result
        return result

    def attachment_for(self, slot: Slot) -> tuple[Attachment | None, str]:
        if slot.attachment_name is None:
            return (None, "default")
        return self.resolve_attachment(slot.name, slot.attachment_name)

    def active_skin_bones(self) -> set[str]:
        names: set[str] = set()
        for skin_name in self._skin_chain():
            skin = self.data.find_skin(skin_name)
            if skin is not None:
                names.update(skin.bones)
        return names

    def active_skin_constraints(self) -> set[str]:
        names: set[str] = set()
        for skin_name in self._skin_chain():
            skin = self.data.find_skin(skin_name)
            if skin is not None:
                names.update(skin.constraints)
        return names

    # -- frame update (5.6) -----------------------------------------------

    def warn_once(self, message: str) -> None:
        """12.2, item 9: a runtime notice, once."""
        if message not in self.warnings:
            self.warnings.append(message)

    def _rebuild_update_order(self) -> None:
        """5.6: parents before children, file order among siblings, walked
        from the roots through the CURRENT children lists."""
        out: list[Bone] = []

        def visit(bone: Bone) -> None:
            out.append(bone)
            for child in bone.children:
                visit(child)

        for bone in self.bones:
            if bone.parent is None:
                visit(bone)
        if len(out) != len(self.bones):
            for bone in self.bones:
                if bone not in out:
                    out.append(bone)
        self.update_order = out
        self.order_dirty = False

    def update_world_transforms(self) -> None:
        if self.order_dirty:
            self._rebuild_update_order()
        for bone in self.update_order:
            if bone.dirty:
                bone.update_world()

    def update_pose(self, now: float) -> None:
        if self.order_dirty:
            self._rebuild_update_order()
        for bone in self.update_order:
            bone.applied.copy_from(bone.local)
            bone.dirty = True
        active = self.active_skin_constraints()
        for constraint in self.constraints:
            if constraint.data.skin_required and constraint.data.name not in active:
                continue
            if constraint.mix() == 0:
                continue
            self.update_world_transforms()
            constraint.apply(now)
        self.update_world_transforms()

    # -- deform and morphs (7.4, 8.3) -------------------------------------

    def morph_sum(self, slot_name: str, skin_name: str, attachment_name: str,
                  length: int) -> list[float] | None:
        total: list[float] | None = None
        for morph in self.data.morphs:
            weight = clamp(self.morph_weights.get(morph.name, morph.weight), morph.min, morph.max)
            if weight == 0:
                continue
            for target in morph.targets:
                if target.slot != slot_name or target.attachment != attachment_name:
                    continue
                if total is None:
                    total = [0.0] * length
                for i, offset in enumerate(target.offsets[:length]):
                    total[i] += weight * offset
        return total

    def deform_for(self, slot_name: str, skin_name: str, attachment_name: str) -> list[float] | None:
        return self._by_address(self.deform, slot_name, skin_name, attachment_name)

    def weights_for(self, slot_name: str, skin_name: str, attachment_name: str) -> list[float] | None:
        """9.6: the same three-part address, and the same search, as `deform`."""
        return self._by_address(self.weights, slot_name, skin_name, attachment_name)

    def _by_address(self, table: dict, slot_name: str, skin_name: str,
                    attachment_name: str) -> list[float] | None:
        found = table.get((slot_name, skin_name, attachment_name))
        if found is None and skin_name != "default":
            found = table.get((slot_name, "default", attachment_name))
        if found is None:
            # A timeline may name a skin the attachment did not come from:
            # the first in the order of the `skins` array (9.6).
            order = {skin.name: i for i, skin in enumerate(self.data.skins)}
            candidates = [(order.get(skin, len(order)), value)
                          for (slot, skin, name), value in table.items()
                          if slot == slot_name and name == attachment_name]
            if candidates:
                candidates.sort(key=lambda entry: entry[0])
                return candidates[0][1]
        return found

    def world_vertices(self, slot: Slot, attachment: Attachment,
                       skin_name: str = "default") -> list[float]:
        """Section 7.4, plus the four corners of a region (7.3)."""
        if isinstance(attachment, RegionAttachment):
            return self._region_vertices(slot, attachment)
        vertices = getattr(attachment, "vertices", None)
        binding = getattr(attachment, "binding", None)
        count = getattr(attachment, "vertex_count", 0)
        if count == 0:
            return []
        source = attachment
        if isinstance(attachment, MeshAttachment) and attachment.deform_source is not None:
            source = attachment.deform_source
        layout = 2 * binding.total if binding is not None else 2 * count
        deform = self.deform_for(slot.name, skin_name, source.name)
        frame_weights = self.weights_for(slot.name, skin_name, source.name) if binding else None
        morph = self.morph_sum(slot.name, skin_name, source.name, layout)

        def delta(index: int) -> float:
            value = 0.0
            if deform is not None and index < len(deform):
                value += deform[index]
            if morph is not None and index < len(morph):
                value += morph[index]
            return value

        out: list[float] = []
        if binding is None:
            bone = slot.frame()
            for v in range(count):
                lx = vertices[2 * v] + delta(2 * v)
                ly = vertices[2 * v + 1] + delta(2 * v + 1)
                wx, wy = bone.local_to_world(lx, ly)
                out.extend((wx, wy))
            return out

        j = 0
        for v in range(count):
            wx = 0.0
            wy = 0.0
            for _ in range(binding.counts[v]):
                bone = self.bones[binding.bones[j]]
                px = binding.positions[2 * j] + delta(2 * j)
                py = binding.positions[2 * j + 1] + delta(2 * j + 1)
                weight = (frame_weights[j] if frame_weights is not None
                          and j < len(frame_weights) else binding.weights[j])
                wx += (bone.a * px + bone.b * py + bone.world_x) * weight
                wy += (bone.c * px + bone.d * py + bone.world_y) * weight
                j += 1
            out.extend((wx, wy))
        return out

    def _region_vertices(self, slot: Slot, attachment: RegionAttachment) -> list[float]:
        bone = slot.frame()
        cos = cosd(attachment.rotation)
        sin = sind(attachment.rotation)
        corners = attachment.local_corners
        out: list[float] = []
        for i in range(0, 8, 2):
            px, py = corners[i], corners[i + 1]
            lx = px * attachment.scale_x * cos - py * attachment.scale_y * sin + attachment.x
            ly = px * attachment.scale_x * sin + py * attachment.scale_y * cos + attachment.y
            wx, wy = bone.local_to_world(lx, ly)
            out.extend((wx, wy))
        return out

    def point_world(self, slot: Slot, attachment: PointAttachment) -> tuple[float, float, float]:
        bone = slot.frame()
        x, y = bone.local_to_world(attachment.x, attachment.y)
        cos = cosd(attachment.rotation)
        sin = sind(attachment.rotation)
        rotation = atan2d(cos * bone.c + sin * bone.d, cos * bone.a + sin * bone.b)
        return (x, y, rotation)

    # -- draw order and clipping (7.7, 7.13) -------------------------------

    def ordered_slots(self) -> list[Slot]:
        return [self.slots[i] for i in self.draw_order]

    def visible_attachments(self) -> list[tuple[Slot, Attachment, str]]:
        """Slots to draw, in order, skipping clipping and non-drawing types."""
        out: list[tuple[Slot, Attachment, str]] = []
        for slot in self.ordered_slots():
            attachment, skin_name = self.attachment_for(slot)
            if attachment is None or not slot.visible:
                continue
            if isinstance(attachment, (RegionAttachment, MeshAttachment)):
                out.append((slot, attachment, skin_name))
        return out

    def collision_shapes(self) -> dict[str, list[float]]:
        """Bounding boxes in world space (7.6), for point and segment tests."""
        out: dict[str, list[float]] = {}
        for slot in self.ordered_slots():
            attachment, skin_name = self.attachment_for(slot)
            if not isinstance(attachment, BoundingBoxAttachment):
                continue
            out[f"{slot.name}/{attachment.name}"] = self.bounding_box_world(slot, attachment)
        return out

    def bounding_box_world(self, slot: Slot, attachment: BoundingBoxAttachment) -> list[float]:
        bone = slot.frame()
        if attachment.shape == "rectangle":
            half_w = attachment.width / 2
            half_h = attachment.height / 2
            cos = cosd(attachment.rotation)
            sin = sind(attachment.rotation)
            out: list[float] = []
            for px, py in ((-half_w, -half_h), (half_w, -half_h), (half_w, half_h), (-half_w, half_h)):
                lx = px * cos - py * sin + attachment.x
                ly = px * sin + py * cos + attachment.y
                out.extend(bone.local_to_world(lx, ly))
            return out
        if attachment.shape == "ellipse":
            half_w = attachment.width / 2
            half_h = attachment.height / 2
            cos = cosd(attachment.rotation)
            sin = sind(attachment.rotation)
            out = []
            for step in range(16):
                angle = math.tau * step / 16
                px = math.cos(angle) * half_w
                py = math.sin(angle) * half_h
                lx = px * cos - py * sin + attachment.x
                ly = px * sin + py * cos + attachment.y
                out.extend(bone.local_to_world(lx, ly))
            return out
        return self.world_vertices(slot, attachment)

    def clipping_for(self, slot_name: str) -> ClippingAttachment | None:
        """The clipping mask in force at `slot_name`, following 7.7."""
        clip: ClippingAttachment | None = None
        end_reached = False
        for slot in self.ordered_slots():
            attachment, _skin = self.attachment_for(slot)
            if attachment is None or not slot.visible:
                if slot.name == slot_name:
                    return None
                continue
            if isinstance(attachment, ClippingAttachment):
                clip = attachment
                end_reached = False
                continue
            if slot.name == slot_name:
                if clip is None or end_reached:
                    return None
                if clip.slots is not None and slot.name not in clip.slots:
                    return None
                return clip
            if clip is not None and clip.slots is None and slot.name == clip.end:
                clip = None
        return None

    def path_positions(self, attachment: PathAttachment, slot: Slot) -> list[float]:
        return self.world_vertices(slot, attachment)
