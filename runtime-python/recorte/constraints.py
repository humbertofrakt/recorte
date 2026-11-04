# SPDX-License-Identifier: Apache-2.0
"""The five constraints: ik, transform, path, physics and driver.

Sections 6 and 8.2 of the specification. Every constraint writes to the applied
pose and to the world matrix of the bones it changes, never to the local pose,
and reads the state exactly as it stands when the array reaches it.
"""

from __future__ import annotations

import math
from typing import Any

from .loader import (
    ConstraintData,
    DriverConstraintData,
    DriverTarget,
    IkConstraintData,
    PathAttachment,
    PathConstraintData,
    PhysicsConstraintData,
    TransformConstraintData,
)
from .skeleton import (
    DEG2RAD,
    MODE_NO_REFLECTION,
    MODE_NO_ROTATION,
    MODE_NO_ROTATION_OR_REFLECTION,
    MODE_NO_SCALE,
    MODE_NO_SCALE_OR_REFLECTION,
    MODE_ONLY_REFLECTION,
    MODE_ONLY_TRANSLATION,
    RAD2DEG,
    Bone,
    atan2d,
    atan2r,
    clamp,
    normalize,
    normalized,
)


def _sign(value: float) -> float:
    return -1.0 if value < 0 else 1.0


class Constraint:
    """Common behaviour: the animatable values live on the instance."""

    ANIMATABLE: tuple[str, ...] = ("mix",)

    def __init__(self, data: ConstraintData, skeleton) -> None:
        self.data = data
        self.skeleton = skeleton
        self.values: dict[str, Any] = {}
        self.set_to_setup_pose()

    def set_to_setup_pose(self) -> None:
        self.values = {name: self._setup_value(name) for name in self.ANIMATABLE}

    def _setup_value(self, name: str) -> Any:
        mapping = {
            "mix": "mix", "softness": "softness", "bendPositive": "bend_positive",
            "compress": "compress", "stretch": "stretch", "uniform": "uniform",
            "mixRotation": "mix_rotation", "mixX": "mix_x", "mixY": "mix_y",
            "mixScaleX": "mix_scale_x", "mixScaleY": "mix_scale_y",
            "mixShearY": "mix_shear_y", "position": "position", "spacing": "spacing",
            "inertia": "inertia", "strength": "strength", "damping": "damping",
            "mass": "mass", "wind": "wind", "gravity": "gravity",
        }
        return getattr(self.data, mapping[name])

    def set_property(self, name: str, value: Any) -> None:
        if name in self.values:
            self.values[name] = value

    def mix(self) -> float:
        return float(self.values.get("mix", 1.0))

    def apply(self, now: float) -> None:
        raise NotImplementedError


# ---------------------------------------------------------------------------
# 6.2 ik
# ---------------------------------------------------------------------------


def ik1(bone: Bone, tx: float, ty: float, compress: bool, stretch: bool,
        uniform: bool, mix: float) -> None:
    skeleton = bone.skeleton
    sx, sy = skeleton.scale_x, skeleton.scale_y
    parent = bone.parent
    if parent is None:
        return
    pa, pb, pc, pd = parent.a, parent.b, parent.c, parent.d
    applied = bone.applied
    rot = -applied.shear_x - applied.rotation
    mode = bone.mode()

    lx = 0.0
    ly = 0.0
    # F3: the reflection of the chain, without the whole skeleton's flip.
    flip = (pa * pd - pb * pc < 0) != ((sx < 0) != (sy < 0))
    if mode in (MODE_ONLY_TRANSLATION, MODE_ONLY_REFLECTION):
        # onlyReflection flips only the Y axis; the X axis the aim uses is
        # the onlyTranslation one.
        lx = (tx - bone.world_x) * _sign(sx)
        ly = (ty - bone.world_y) * _sign(sy)
    elif mode == MODE_NO_REFLECTION:
        if flip:
            pb = -pb
            pd = -pd
        x = tx - bone.world_x
        y = ty - bone.world_y
        det = pa * pd - pb * pc
        if abs(det) <= 0.0001:
            lx = 0.0
            ly = 0.0
        else:
            lx = (x * pd - y * pb) / det
            ly = (y * pa - x * pc) / det
    else:
        if mode in (MODE_NO_ROTATION_OR_REFLECTION, MODE_NO_ROTATION):
            s = abs(pa * pd - pb * pc) / max(0.0001, pa * pa + pc * pc)
            if mode == MODE_NO_ROTATION and flip:
                s = -s
            sa = pa / sx
            sc = pc / sy
            pb = -sc * s * sx
            pd = sa * s * sy
            rot += atan2d(sc, sa)
        x = tx - parent.world_x
        y = ty - parent.world_y
        det = pa * pd - pb * pc
        if abs(det) <= 0.0001:
            lx = 0.0
            ly = 0.0
        else:
            lx = (x * pd - y * pb) / det - applied.x
            ly = (y * pa - x * pc) / det - applied.y

    rot += atan2d(ly, lx)
    if applied.scale_x < 0:
        rot += 180
    rot = normalized(rot)

    scale_x = applied.scale_x
    scale_y = applied.scale_y
    if compress or stretch:
        if mode in (MODE_NO_SCALE, MODE_NO_SCALE_OR_REFLECTION):
            lx = tx - bone.world_x
            ly = ty - bone.world_y
        b = bone.length * scale_x
        if b > 0.0001:
            dd = lx * lx + ly * ly
            if (compress and dd < b * b) or (stretch and dd > b * b):
                s = (math.sqrt(dd) / b - 1) * mix + 1
                scale_x *= s
                if uniform:
                    scale_y *= s

    applied.rotation += rot * mix
    applied.scale_x = scale_x
    applied.scale_y = scale_y
    bone.update_world()


def ik2(parent_bone: Bone, child_bone: Bone, tx: float, ty: float, bend_positive: bool,
        stretch: bool, uniform: bool, softness: float, mix: float) -> None:
    P = parent_bone
    C = child_bone
    bend_dir = 1.0 if bend_positive else -1.0
    px = P.applied.x
    py = P.applied.y
    psx = P.applied.scale_x
    psy = P.applied.scale_y
    csx = C.applied.scale_x
    sx_p = psx
    sy_p = psy
    os1 = 0.0
    s2 = 1.0
    os2 = 0.0
    if psx < 0:
        psx = -psx
        os1 = 180.0
        s2 = -1.0
    if psy < 0:
        psy = -psy
        s2 = -s2
    if csx < 0:
        csx = -csx
        os2 = 180.0

    cx = C.applied.x
    u = abs(psx - psy) <= 0.0001
    if not u or stretch:
        cy = 0.0
        cwx = P.a * cx + P.world_x
        cwy = P.c * cx + P.world_y
    else:
        cy = C.applied.y
        cwx = P.a * cx + P.b * cy + P.world_x
        cwy = P.c * cx + P.d * cy + P.world_y

    pp = P.parent
    if pp is not None:
        a, b, c, d = pp.a, pp.b, pp.c, pp.d
        ppx, ppy = pp.world_x, pp.world_y
    else:
        a, b, c, d = 1.0, 0.0, 0.0, 1.0
        ppx, ppy = 0.0, 0.0
    det = a * d - b * c
    inv = 0.0 if abs(det) <= 0.0001 else 1 / det
    x = cwx - ppx
    y = cwy - ppy
    dx = (x * d - y * b) * inv - px
    dy = (y * a - x * c) * inv - py
    l1 = math.sqrt(dx * dx + dy * dy)
    l2 = C.length * csx

    if l1 < 0.0001:
        ik1(P, tx, ty, False, stretch, False, mix)
        C.applied.rotation = 0.0
        C.update_world()
        return

    x = tx - ppx
    y = ty - ppy
    ttx = (x * d - y * b) * inv - px
    tty = (y * a - x * c) * inv - py
    dd = ttx * ttx + tty * tty

    if softness != 0:
        softness = softness * psx * (csx + 1) / 2
        td = math.sqrt(dd)
        sd = td - l1 - l2 * psx + softness
        if sd > 0:
            pz = min(1.0, sd / (softness * 2)) - 1
            pz = (sd - softness * (1 - pz * pz)) / td
            ttx -= pz * ttx
            tty -= pz * tty
            dd = ttx * ttx + tty * tty

    a1 = 0.0
    a2 = 0.0
    if u:
        l2 = l2 * psx
        cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2) if l1 * l2 != 0 else 0.0
        if cos < -1:
            cos = -1.0
            a2 = math.pi * bend_dir
        elif cos > 1:
            cos = 1.0
            a2 = 0.0
            if stretch:
                k = (math.sqrt(dd) / (l1 + l2) - 1) * mix + 1
                sx_p *= k
                if uniform:
                    sy_p *= k
        else:
            a2 = math.acos(cos) * bend_dir
        aa = l1 + l2 * cos
        bb = l2 * math.sin(a2)
        a1 = atan2r(tty * aa - ttx * bb, ttx * aa + tty * bb)
    else:
        a = psx * l2
        b = psy * l2
        aa = a * a
        bb = b * b
        ta = atan2r(tty, ttx)
        c = bb * l1 * l1 + aa * dd - aa * bb
        c1 = -2 * bb * l1
        c2 = bb - aa
        d = c1 * c1 - 4 * c2 * c
        solved = False
        if d >= 0:
            q = math.sqrt(d)
            if c1 < 0:
                q = -q
            q = -(c1 + q) / 2
            r0 = q / c2 if c2 != 0 else 0.0
            r1 = c / q if q != 0 else 0.0
            r = r0 if abs(r0) < abs(r1) else r1
            r0 = dd - r * r
            if r0 >= 0:
                y = math.sqrt(r0) * bend_dir
                a1 = ta - atan2r(y, r)
                a2 = atan2r(y / psy, (r - l1) / psx)
                solved = True
        if not solved:
            min_angle = math.pi
            min_x = l1 - a
            min_dist = min_x * min_x
            min_y = 0.0
            max_angle = 0.0
            max_x = l1 + a
            max_dist = max_x * max_x
            max_y = 0.0
            c = -a * l1 / (aa - bb) if aa != bb else 2.0
            if -1 <= c <= 1:
                c = math.acos(c)
                x = a * math.cos(c) + l1
                y = b * math.sin(c)
                d = x * x + y * y
                if d < min_dist:
                    min_angle, min_dist, min_x, min_y = c, d, x, y
                if d > max_dist:
                    max_angle, max_dist, max_x, max_y = c, d, x, y
            if dd <= (min_dist + max_dist) / 2:
                a1 = ta - atan2r(min_y * bend_dir, min_x)
                a2 = min_angle * bend_dir
            else:
                a1 = ta - atan2r(max_y * bend_dir, max_x)
                a2 = max_angle * bend_dir

    os = atan2r(cy, cx) * s2
    r1 = normalized((a1 - os) * RAD2DEG + os1 - P.applied.rotation)
    P.applied.rotation += r1 * mix
    P.applied.scale_x = sx_p
    P.applied.scale_y = sy_p
    P.applied.shear_x = 0.0
    P.applied.shear_y = 0.0
    P.update_world()

    r2 = normalized(((a2 + os) * RAD2DEG - C.applied.shear_x) * s2 + os2 - C.applied.rotation)
    C.applied.rotation += r2 * mix
    C.update_world()


class IkConstraint(Constraint):
    ANIMATABLE = ("mix", "softness", "bendPositive", "compress", "stretch", "uniform")

    def __init__(self, data: IkConstraintData, skeleton) -> None:
        super().__init__(data, skeleton)
        self.bones = [skeleton.bone_by_name[name] for name in data.bones
                      if name in skeleton.bone_by_name]
        self.target = skeleton.bone_by_name.get(data.target)
        self.broken = len(self.bones) != len(data.bones) or self.target is None

    def apply(self, now: float) -> None:
        if self.broken or not self.bones:
            return
        mix = self.mix()
        tx, ty = self.target.world_x, self.target.world_y
        values = self.values
        if len(self.bones) == 1:
            ik1(self.bones[0], tx, ty, bool(values["compress"]), bool(values["stretch"]),
                bool(values["uniform"]), mix)
        else:
            ik2(self.bones[0], self.bones[1], tx, ty, bool(values["bendPositive"]),
                bool(values["stretch"]), bool(values["uniform"]),
                float(values["softness"]), mix)


# ---------------------------------------------------------------------------
# 6.3 transform
# ---------------------------------------------------------------------------


class TransformConstraint(Constraint):
    ANIMATABLE = ("mix", "mixRotation", "mixX", "mixY", "mixScaleX", "mixScaleY", "mixShearY")

    def __init__(self, data: TransformConstraintData, skeleton) -> None:
        super().__init__(data, skeleton)
        self.bones = [skeleton.bone_by_name[name] for name in data.bones
                      if name in skeleton.bone_by_name]
        self.target = skeleton.bone_by_name.get(data.target)
        self.broken = len(self.bones) != len(data.bones) or self.target is None

    def _mixes(self) -> tuple[float, float, float, float, float, float]:
        mix = self.mix()
        v = self.values
        return (mix * v["mixRotation"], mix * v["mixX"], mix * v["mixY"],
                mix * v["mixScaleX"], mix * v["mixScaleY"], mix * v["mixShearY"])

    def apply(self, now: float) -> None:
        if self.broken:
            return
        data: TransformConstraintData = self.data  # type: ignore[assignment]
        m_rot, m_x, m_y, m_sx, m_sy, m_sh = self._mixes()
        if m_rot == 0 and m_x == 0 and m_y == 0 and m_sx == 0 and m_sy == 0 and m_sh == 0:
            return
        if data.local:
            self._apply_local(data, m_rot, m_x, m_y, m_sx, m_sy, m_sh)
        elif data.relative:
            self._apply_world_relative(data, m_rot, m_x, m_y, m_sx, m_sy, m_sh)
        else:
            self._apply_world_absolute(data, m_rot, m_x, m_y, m_sx, m_sy, m_sh)

    def _apply_world_absolute(self, data, m_rot, m_x, m_y, m_sx, m_sy, m_sh) -> None:
        t = self.target
        ta, tb, tc, td = t.a, t.b, t.c, t.d
        reflect = DEG2RAD if (ta * td - tb * tc > 0) else -DEG2RAD
        off_r = data.offset_rotation * reflect
        off_sh = data.offset_shear_y * reflect
        for bone in self.bones:
            if m_rot != 0:
                a, b, cc, d = bone.a, bone.b, bone.c, bone.d
                r = normalize(atan2r(tc, ta) - atan2r(cc, a) + off_r) * m_rot
                cos = math.cos(r)
                sin = math.sin(r)
                bone.a = cos * a - sin * cc
                bone.b = cos * b - sin * d
                bone.c = sin * a + cos * cc
                bone.d = sin * b + cos * d
            if m_x != 0 or m_y != 0:
                wx, wy = t.local_to_world(data.offset_x, data.offset_y)
                bone.world_x += (wx - bone.world_x) * m_x
                bone.world_y += (wy - bone.world_y) * m_y
            if m_sx != 0:
                s = math.sqrt(bone.a * bone.a + bone.c * bone.c)
                if s != 0:
                    s = (s + (math.sqrt(ta * ta + tc * tc) - s + data.offset_scale_x) * m_sx) / s
                bone.a *= s
                bone.c *= s
            if m_sy != 0:
                s = math.sqrt(bone.b * bone.b + bone.d * bone.d)
                if s != 0:
                    s = (s + (math.sqrt(tb * tb + td * td) - s + data.offset_scale_y) * m_sy) / s
                bone.b *= s
                bone.d *= s
            if m_sh > 0:
                b, d = bone.b, bone.d
                by = atan2r(d, b)
                r = normalize(atan2r(td, tb) - atan2r(tc, ta) - (by - atan2r(bone.c, bone.a)))
                r = by + (r + off_sh) * m_sh
                s = math.sqrt(b * b + d * d)
                bone.b = math.cos(r) * s
                bone.d = math.sin(r) * s
            bone.applied_from_world()

    def _apply_world_relative(self, data, m_rot, m_x, m_y, m_sx, m_sy, m_sh) -> None:
        t = self.target
        ta, tb, tc, td = t.a, t.b, t.c, t.d
        reflect = DEG2RAD if (ta * td - tb * tc > 0) else -DEG2RAD
        off_r = data.offset_rotation * reflect
        off_sh = data.offset_shear_y * reflect
        for bone in self.bones:
            if m_rot != 0:
                a, b, cc, d = bone.a, bone.b, bone.c, bone.d
                r = normalize(atan2r(tc, ta) + off_r) * m_rot
                cos = math.cos(r)
                sin = math.sin(r)
                bone.a = cos * a - sin * cc
                bone.b = cos * b - sin * d
                bone.c = sin * a + cos * cc
                bone.d = sin * b + cos * d
            if m_x != 0 or m_y != 0:
                wx, wy = t.local_to_world(data.offset_x, data.offset_y)
                bone.world_x += wx * m_x
                bone.world_y += wy * m_y
            if m_sx != 0:
                s = (math.sqrt(ta * ta + tc * tc) - 1 + data.offset_scale_x) * m_sx + 1
                bone.a *= s
                bone.c *= s
            if m_sy != 0:
                s = (math.sqrt(tb * tb + td * td) - 1 + data.offset_scale_y) * m_sy + 1
                bone.b *= s
                bone.d *= s
            if m_sh > 0:
                b, d = bone.b, bone.d
                r = normalize(atan2r(td, tb) - atan2r(tc, ta))
                r = atan2r(d, b) + (r - math.pi / 2 + off_sh) * m_sh
                s = math.sqrt(b * b + d * d)
                bone.b = math.cos(r) * s
                bone.d = math.sin(r) * s
            bone.applied_from_world()

    def _apply_local(self, data, m_rot, m_x, m_y, m_sx, m_sy, m_sh) -> None:
        tq = self.target.applied
        for bone in self.bones:
            q = bone.applied
            if data.relative:
                q.rotation += (tq.rotation + data.offset_rotation) * m_rot
                q.x += (tq.x + data.offset_x) * m_x
                q.y += (tq.y + data.offset_y) * m_y
                q.scale_x *= (tq.scale_x - 1 + data.offset_scale_x) * m_sx + 1
                q.scale_y *= (tq.scale_y - 1 + data.offset_scale_y) * m_sy + 1
                q.shear_y += (tq.shear_y + data.offset_shear_y) * m_sh
            else:
                q.rotation += (tq.rotation - q.rotation + data.offset_rotation) * m_rot
                q.x += (tq.x - q.x + data.offset_x) * m_x
                q.y += (tq.y - q.y + data.offset_y) * m_y
                q.scale_x += (tq.scale_x - q.scale_x + data.offset_scale_x) * m_sx
                q.scale_y += (tq.scale_y - q.scale_y + data.offset_scale_y) * m_sy
                q.shear_y += (tq.shear_y - q.shear_y + data.offset_shear_y) * m_sh
            bone.update_world()


# ---------------------------------------------------------------------------
# 6.4 path — curve geometry
# ---------------------------------------------------------------------------

SEGMENTS = 10


def _bezier_point(points: list[float], t: float) -> tuple[float, float]:
    ax, ay, h1x, h1y, h2x, h2y, bx, by = points
    u = 1 - t
    uu = u * u
    tt = t * t
    w0 = uu * u
    w1 = 3 * uu * t
    w2 = 3 * u * tt
    w3 = tt * t
    return (w0 * ax + w1 * h1x + w2 * h2x + w3 * bx,
            w0 * ay + w1 * h1y + w2 * h2y + w3 * by)


def _bezier_tangent(points: list[float], t: float) -> float:
    ax, ay, h1x, h1y, h2x, h2y, bx, by = points
    u = 1 - t
    dx = 3 * u * u * (h1x - ax) + 6 * u * t * (h2x - h1x) + 3 * t * t * (bx - h2x)
    dy = 3 * u * u * (h1y - ay) + 6 * u * t * (h2y - h1y) + 3 * t * t * (by - h2y)
    if dx == 0 and dy == 0:
        ax2, ay2 = _bezier_point(points, min(1.0, t + 1e-4))
        bx2, by2 = _bezier_point(points, max(0.0, t - 1e-4))
        dx, dy = ax2 - bx2, ay2 - by2
    return atan2r(dy, dx)


class _PathGeometry:
    """World-space curves of a `path` attachment, with the length table (6.4)."""

    def __init__(self, world: list[float], closed: bool, constant_speed: bool,
                 setup_lengths: list[float]) -> None:
        self.points = world
        self.anchors = len(world) // 6
        self.closed = closed
        self.constant_speed = constant_speed
        self.curve_count = self.anchors if closed else max(0, self.anchors - 1)
        self.segment_lengths: list[list[float]] = []
        self.prefix: list[float] = [0.0]
        for k in range(self.curve_count):
            control = self.control_points(k)
            cumulative = []
            total = 0.0
            px, py = control[0], control[1]
            for step in range(1, SEGMENTS + 1):
                qx, qy = _bezier_point(control, step / SEGMENTS)
                total += math.hypot(qx - px, qy - py)
                cumulative.append(total)
                px, py = qx, qy
            self.segment_lengths.append(cumulative)
            self.prefix.append(self.prefix[-1] + total)
        if constant_speed or not setup_lengths:
            self.total = self.prefix[-1]
            self.setup_lengths = self.prefix[1:]
        else:
            self.setup_lengths = list(setup_lengths)
            self.total = setup_lengths[-1] if setup_lengths else 0.0

    def control_points(self, k: int) -> list[float]:
        points = self.points
        anchor = 3 * k + 1
        out_handle = 3 * k + 2
        nxt = (k + 1) % self.anchors
        in_handle = 3 * nxt
        next_anchor = 3 * nxt + 1
        return [points[2 * anchor], points[2 * anchor + 1],
                points[2 * out_handle], points[2 * out_handle + 1],
                points[2 * in_handle], points[2 * in_handle + 1],
                points[2 * next_anchor], points[2 * next_anchor + 1]]

    def locate(self, q: float) -> tuple[int, float]:
        """Curve index and t for the distance q along the path."""
        if self.curve_count == 0:
            return (0, 0.0)
        if self.constant_speed:
            for k in range(self.curve_count):
                if q <= self.prefix[k + 1] or k == self.curve_count - 1:
                    local = q - self.prefix[k]
                    cumulative = self.segment_lengths[k]
                    previous = 0.0
                    for j, value in enumerate(cumulative):
                        if local <= value or j == SEGMENTS - 1:
                            span = value - previous
                            fraction = 0.0 if span <= 0 else (local - previous) / span
                            fraction = clamp(fraction, 0.0, 1.0)
                            return (k, (j + fraction) / SEGMENTS)
                        previous = value
            return (self.curve_count - 1, 1.0)
        previous = 0.0
        for k in range(self.curve_count):
            end = self.setup_lengths[k] if k < len(self.setup_lengths) else previous
            if q <= end or k == self.curve_count - 1:
                span = end - previous
                return (k, 0.0 if span <= 0 else clamp((q - previous) / span, 0.0, 1.0))
            previous = end
        return (self.curve_count - 1, 1.0)

    def sample(self, q: float) -> tuple[float, float, float]:
        """Point and tangent angle at the distance q, with extrapolation."""
        total = self.total
        if self.closed and total > 0:
            q = math.fmod(q, total)
            if q < 0:
                q += total
        elif q < 0:
            return self._extrapolate_before(q)
        elif q > total:
            return self._extrapolate_after(q - total)
        k, t = self.locate(q)
        if self.curve_count == 0:
            return (self.points[2], self.points[3], 0.0)
        control = self.control_points(k)
        x, y = _bezier_point(control, t)
        return (x, y, _bezier_tangent(control, t))

    def _direction(self, from_x, from_y, to_x, to_y) -> tuple[float, float]:
        dx, dy = to_x - from_x, to_y - from_y
        length = math.hypot(dx, dy)
        if length == 0:
            return (1.0, 0.0)
        return (dx / length, dy / length)

    def _extrapolate_before(self, q: float) -> tuple[float, float, float]:
        points = self.points
        ax, ay = points[2], points[3]
        hx, hy = points[4], points[5]
        dx, dy = self._direction(ax, ay, hx, hy)
        return (ax + dx * q, ay + dy * q, atan2r(dy, dx))

    def _extrapolate_after(self, excess: float) -> tuple[float, float, float]:
        points = self.points
        last = self.anchors - 1
        ax, ay = points[2 * (3 * last + 1)], points[2 * (3 * last + 1) + 1]
        hx, hy = points[2 * (3 * last)], points[2 * (3 * last) + 1]
        dx, dy = self._direction(hx, hy, ax, ay)
        return (ax + dx * excess, ay + dy * excess, atan2r(dy, dx))


class PathConstraint(Constraint):
    ANIMATABLE = ("mix", "mixRotation", "mixX", "mixY", "position", "spacing")

    def __init__(self, data: PathConstraintData, skeleton) -> None:
        super().__init__(data, skeleton)
        self.bones = [skeleton.bone_by_name[name] for name in data.bones
                      if name in skeleton.bone_by_name]
        self.slot = skeleton.slot_by_name.get(data.target)
        self.broken = len(self.bones) != len(data.bones) or self.slot is None

    def apply(self, now: float) -> None:
        if self.broken or not self.bones:
            return
        data: PathConstraintData = self.data  # type: ignore[assignment]
        skeleton = self.skeleton
        attachment, skin_name = skeleton.attachment_for(self.slot)
        if not isinstance(attachment, PathAttachment):
            return
        mix = self.mix()
        m_rot = mix * self.values["mixRotation"]
        m_x = mix * self.values["mixX"]
        m_y = mix * self.values["mixY"]
        if m_rot == 0 and m_x == 0 and m_y == 0:
            return

        n = len(self.bones)
        scale = data.rotate_mode == "chainScale"
        tangents = data.rotate_mode == "tangent"
        spaces = [0.0] * (n + 1)
        lengths = [0.0] * n
        spacing = float(self.values["spacing"])

        for i, bone in enumerate(self.bones):
            setup_length = bone.length
            world_len = setup_length * math.sqrt(bone.a * bone.a + bone.c * bone.c)
            if scale:
                lengths[i] = 0.0 if setup_length < 0.00001 else world_len
            if data.spacing_mode == "percent":
                spaces[i + 1] = spacing
            elif data.spacing_mode == "fixed":
                spaces[i + 1] = spacing if setup_length < 0.00001 else spacing * world_len / setup_length
            elif data.spacing_mode == "length":
                spaces[i + 1] = (spacing if setup_length < 0.00001
                                 else (setup_length + spacing) * world_len / setup_length)
            else:  # proportional
                spaces[i + 1] = spacing if setup_length < 0.00001 else world_len
        if data.spacing_mode == "proportional":
            m = n if tangents else n + 1
            total = sum(spaces[1:n + 1])
            if total > 0:
                k = m / total * spacing
                for i in range(1, n + 1):
                    spaces[i] *= k

        world = skeleton.world_vertices(self.slot, attachment, skin_name)
        geometry = _PathGeometry(world, attachment.closed, attachment.constant_speed,
                                 attachment.lengths)
        total = geometry.total
        position = float(self.values["position"])
        if data.position_mode == "percent":
            position *= total
        if data.spacing_mode == "percent":
            for i in range(1, n + 1):
                spaces[i] *= total

        points: list[tuple[float, float]] = []
        angles: list[float] = []
        pos = position
        for i in range(n + 1):
            pos += spaces[i]
            x, y, angle = geometry.sample(pos)
            points.append((x, y))
            angles.append(angle)

        bx, by = points[0]
        off_r = data.offset_rotation
        tip = False
        if off_r == 0:
            tip = data.rotate_mode == "chain"
        else:
            pb = self.slot.bone
            off_r = off_r * (DEG2RAD if (pb.a * pb.d - pb.b * pb.c > 0) else -DEG2RAD)

        for i, bone in enumerate(self.bones):
            bone.world_x += (bx - bone.world_x) * m_x
            bone.world_y += (by - bone.world_y) * m_y
            x, y = points[i + 1]
            dx = x - bx
            dy = y - by
            if scale and lengths[i] != 0:
                s = (math.hypot(dx, dy) / lengths[i] - 1) * m_rot + 1
                bone.a *= s
                bone.c *= s
            bx, by = x, y
            if m_rot > 0:
                a, b, cc, d = bone.a, bone.b, bone.c, bone.d
                if tangents:
                    r = angles[i]
                elif spaces[i + 1] == 0:
                    r = angles[i + 1]
                else:
                    r = atan2r(dy, dx)
                r -= atan2r(cc, a)
                if tip:
                    cos = math.cos(r)
                    sin = math.sin(r)
                    length = bone.length
                    bx += (length * (cos * a - sin * cc) - dx) * m_rot
                    by += (length * (sin * a + cos * cc) - dy) * m_rot
                else:
                    r += off_r
                r = normalize(r) * m_rot
                cos = math.cos(r)
                sin = math.sin(r)
                bone.a = cos * a - sin * cc
                bone.b = cos * b - sin * d
                bone.c = sin * a + cos * cc
                bone.d = sin * b + cos * d
            bone.applied_from_world()


# ---------------------------------------------------------------------------
# 6.5 physics
# ---------------------------------------------------------------------------


class PhysicsConstraint(Constraint):
    ANIMATABLE = ("mix", "inertia", "strength", "damping", "mass", "wind", "gravity")

    def __init__(self, data: PhysicsConstraintData, skeleton) -> None:
        super().__init__(data, skeleton)
        self.bone = skeleton.bone_by_name.get(data.bone)
        self.broken = self.bone is None
        self.reset_state()

    def reset_state(self) -> None:
        self.x_offset = 0.0
        self.x_velocity = 0.0
        self.y_offset = 0.0
        self.y_velocity = 0.0
        self.rotate_offset = 0.0
        self.rotate_velocity = 0.0
        self.scale_offset = 0.0
        self.scale_velocity = 0.0
        self.remaining = 0.0
        self.last_time = None
        self.ux = 0.0
        self.uy = 0.0
        self.cx = 0.0
        self.cy = 0.0
        self.tx = 0.0
        self.ty = 0.0
        self.reset = True

    def physics_reset(self, now: float) -> None:
        self.reset = True
        self.remaining = 0.0
        self.last_time = now
        self.x_offset = self.x_velocity = self.y_offset = self.y_velocity = 0.0
        self.rotate_offset = self.rotate_velocity = 0.0
        self.scale_offset = self.scale_velocity = 0.0

    def apply(self, now: float) -> None:
        if self.broken:
            return
        data: PhysicsConstraintData = self.data  # type: ignore[assignment]
        mix = self.mix()
        if mix == 0:
            return
        bone = self.bone
        skeleton = self.skeleton
        sx, sy = skeleton.scale_x, skeleton.scale_y
        length = bone.length
        f = skeleton.data.reference_scale
        step = 1 / data.fps if data.fps else 1 / 60
        values = self.values
        mass_inverse = 1 / values["mass"] if values["mass"] else 0.0
        use_x = data.x > 0
        use_y = data.y > 0
        use_rot = data.rotation > 0 or data.shear_x > 0
        use_scale = data.scale_x > 0

        if self.last_time is None:
            self.last_time = now
        delta = max(now - self.last_time, 0.0)
        self.remaining += delta
        self.last_time = now
        bx = bone.world_x
        by = bone.world_y

        if self.reset:
            self.reset = False
            self.ux = bx
            self.uy = by
            self.remaining = 0.0
        else:
            a = self.remaining
            i = values["inertia"]
            d = -1.0
            qx = data.limit * delta
            qy = qx * abs(sy)
            qx = qx * abs(sx)
            if use_x or use_y:
                if use_x:
                    self.x_offset += clamp((self.ux - bx) * i, -qx, qx)
                    self.ux = bx
                if use_y:
                    self.y_offset += clamp((self.uy - by) * i, -qy, qy)
                    self.uy = by
                if a >= step:
                    d = math.pow(values["damping"], 60 * step)
                    m = mass_inverse * step
                    e = values["strength"]
                    w = values["wind"] * f
                    g = values["gravity"] * f
                    while True:
                        if use_x:
                            self.x_velocity += (w - self.x_offset * e) * m
                            self.x_offset += self.x_velocity * step
                            self.x_velocity *= d
                        if use_y:
                            self.y_velocity -= (g + self.y_offset * e) * m
                            self.y_offset += self.y_velocity * step
                            self.y_velocity *= d
                        a -= step
                        if a < step:
                            break
            if use_x:
                bone.world_x += self.x_offset * mix * data.x
            if use_y:
                bone.world_y += self.y_offset * mix * data.y

            if use_rot or use_scale:
                ca = atan2r(bone.c, bone.a)
                mr = 0.0
                dx = clamp(self.cx - bone.world_x, -qx, qx)
                dy = clamp(self.cy - bone.world_y, -qy, qy)
                if use_rot:
                    mr = (data.rotation + data.shear_x) * mix
                    r = atan2r(dy + self.ty, dx + self.tx) - ca - self.rotate_offset * mr
                    self.rotate_offset += (r - math.ceil(r / math.tau - 0.5) * math.tau) * i
                    r = self.rotate_offset * mr + ca
                    co = math.cos(r)
                    si = math.sin(r)
                    if use_scale:
                        r = length * math.sqrt(bone.a * bone.a + bone.c * bone.c)
                        if r > 0:
                            self.scale_offset += (dx * co + dy * si) * i / r
                else:
                    co = math.cos(ca)
                    si = math.sin(ca)
                    r = length * math.sqrt(bone.a * bone.a + bone.c * bone.c)
                    if r > 0:
                        self.scale_offset += (dx * co + dy * si) * i / r
                a = self.remaining
                if a >= step:
                    if d == -1:
                        d = math.pow(values["damping"], 60 * step)
                    m = mass_inverse * step
                    e = values["strength"]
                    w = values["wind"]
                    g = values["gravity"]
                    h = length / f if f else 0.0
                    while True:
                        a -= step
                        if use_scale:
                            self.scale_velocity += (w * co - g * si - self.scale_offset * e) * m
                            self.scale_offset += self.scale_velocity * step
                            self.scale_velocity *= d
                        if use_rot:
                            self.rotate_velocity -= ((w * si + g * co) * h
                                                     + self.rotate_offset * e) * m
                            self.rotate_offset += self.rotate_velocity * step
                            self.rotate_velocity *= d
                            if a < step:
                                break
                            r = self.rotate_offset * mr + ca
                            co = math.cos(r)
                            si = math.sin(r)
                        elif a < step:
                            break
            self.remaining = a
        self.cx = bone.world_x
        self.cy = bone.world_y

        if use_rot:
            o = self.rotate_offset * mix
            if data.shear_x > 0:
                r = 0.0
                if data.rotation > 0:
                    r = o * data.rotation
                    si = math.sin(r)
                    co = math.cos(r)
                    b = bone.b
                    bone.b = co * b - si * bone.d
                    bone.d = si * b + co * bone.d
                r = r + o * data.shear_x
                si = math.sin(r)
                co = math.cos(r)
                a = bone.a
                bone.a = co * a - si * bone.c
                bone.c = si * a + co * bone.c
            else:
                o = o * data.rotation
                si = math.sin(o)
                co = math.cos(o)
                a = bone.a
                bone.a = co * a - si * bone.c
                bone.c = si * a + co * bone.c
                b = bone.b
                bone.b = co * b - si * bone.d
                bone.d = si * b + co * bone.d
        if use_scale:
            s = 1 + self.scale_offset * mix * data.scale_x
            bone.a *= s
            bone.c *= s
        self.tx = length * bone.a
        self.ty = length * bone.c
        bone.applied_from_world()


# ---------------------------------------------------------------------------
# 8.2 driver
# ---------------------------------------------------------------------------


class DriverConstraint(Constraint):
    ANIMATABLE = ("mix",)

    def __init__(self, data: DriverConstraintData, skeleton) -> None:
        super().__init__(data, skeleton)

    def apply(self, now: float) -> None:
        from .animation import apply_driver_target, evaluate_keys, parameter_value

        data: DriverConstraintData = self.data  # type: ignore[assignment]
        skeleton = self.skeleton
        parameter = skeleton.data.find_parameter(data.parameter)
        if parameter is None:
            return
        value = parameter_value(skeleton, parameter)
        mix = self.mix()

        if data.animation is not None:
            animation = skeleton.data.find_animation(data.animation)
            if animation is None:
                return
            low = data.from_value if data.from_value is not None else parameter.min
            high = data.to_value if data.to_value is not None else parameter.max
            if low == high:
                return
            time_to = data.time_to if data.time_to is not None else animation.duration
            t = data.time_from + (value - low) / (high - low) * (time_to - data.time_from)
            t = clamp(t, min(data.time_from, time_to), max(data.time_from, time_to))
            for timeline in animation.timelines:
                if timeline.type in ("event", "sequence", "tag"):
                    continue
                sampled = evaluate_keys(timeline.keys, t, timeline.components)
                target = DriverTarget(
                    type=timeline.type, target=timeline.target, property=timeline.property,
                    skin=timeline.skin, attachment=timeline.attachment, mode=data.mode,
                )
                apply_driver_target(skeleton, target, sampled, data.mode, mix)
            return

        for target in data.targets or []:
            sampled = evaluate_keys(target.keys, value, 1, key_field="input")
            apply_driver_target(skeleton, target, sampled, target.mode, mix)


# ---------------------------------------------------------------------------


def build_constraints(skeleton) -> list[Constraint]:
    out: list[Constraint] = []
    for data in skeleton.data.constraints:
        if isinstance(data, IkConstraintData):
            out.append(IkConstraint(data, skeleton))
        elif isinstance(data, TransformConstraintData):
            out.append(TransformConstraint(data, skeleton))
        elif isinstance(data, PathConstraintData):
            out.append(PathConstraint(data, skeleton))
        elif isinstance(data, PhysicsConstraintData):
            out.append(PhysicsConstraint(data, skeleton))
        elif isinstance(data, DriverConstraintData):
            out.append(DriverConstraint(data, skeleton))
    return out
