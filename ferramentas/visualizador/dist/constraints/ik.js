// SPDX-License-Identifier: Apache-2.0
/**
 * IK constraint (spec 6.2): one or two bones rotate so the tip of the last
 * bone reaches the world position of the target bone.
 *
 * Normative port of Spine 4.2 `IkConstraint.apply1` / `apply2`, following the
 * spec text where the two differ (see DUVIDAS-SPEC.md). Reads and writes the
 * **applied** pose only (spec 5.2, 6.1) and recomputes the world matrix of
 * the bones it changes through `Bone.updateWorldTransform`, which marks the
 * descendants dirty (spec 5.6).
 */
import { IkConstraintData } from '../data.js';
import { atan2, atan2Deg, normalizeAngle, sanitize, EPSILON_DET, PI, RAD_TO_DEG, } from '../math.js';
import { registerConstraint } from './constraint.js';
export class IkConstraint {
    data;
    /** Constrained bones: 1 or 2 (`bones[1]` is a child of `bones[0]`). */
    bones;
    target;
    active = true;
    mix;
    bendPositive;
    compress;
    stretch;
    uniform;
    softness;
    constructor(data, skeleton) {
        this.data = data;
        this.bones = data.bones.map((bd) => skeleton.bones[bd.index]);
        this.target = skeleton.bones[data.target.index];
        this.mix = data.mix;
        this.bendPositive = data.bendPositive;
        this.compress = data.compress;
        this.stretch = data.stretch;
        this.uniform = data.uniform;
        this.softness = data.softness;
    }
    reset() {
        // Stateless.
    }
    setToSetupPose() {
        const d = this.data;
        this.mix = d.mix;
        this.bendPositive = d.bendPositive;
        this.compress = d.compress;
        this.stretch = d.stretch;
        this.uniform = d.uniform;
        this.softness = d.softness;
    }
    update(_skeleton, _now) {
        const target = this.target;
        const bones = this.bones;
        switch (bones.length) {
            case 1:
                apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.uniform, this.mix);
                break;
            case 2:
                apply2(bones[0], bones[1], target.worldX, target.worldY, this.bendPositive, this.stretch, this.uniform, this.softness, this.mix);
                break;
            default:
                // 0 or more than 2 bones never pass the loader (spec 6.2, L1).
                break;
        }
    }
}
/**
 * One-bone IK (spec 6.2 `ik1`): rotates `bone` so its X axis points at the
 * world position `(tx, ty)`; optionally compresses or stretches `scaleX`.
 */
export function apply1(bone, tx, ty, compress, stretch, uniform, mix) {
    const skeleton = bone.skeleton;
    const sx = skeleton.scaleX;
    const sy = skeleton.scaleY;
    const p = bone.parent;
    // The root cannot be constrained by IK (spec 6.2, L1; the loader drops such
    // constraints). Fall back to an identity parent rather than crash.
    let pa = 1, pb = 0, pc = 0, pd = 1, pwx = 0, pwy = 0;
    if (p !== null) {
        pa = p.a;
        pb = p.b;
        pc = p.c;
        pd = p.d;
        pwx = p.worldX;
        pwy = p.worldY;
    }
    let rot = -bone.ashearX - bone.arotation; // degrees
    let lx = 0, ly = 0;
    const mode = bone.inherit;
    // F3: the reflection of the chain, without the whole skeleton's flip.
    const flip = (pa * pd - pb * pc < 0) !== ((sx < 0) !== (sy < 0));
    switch (mode) {
        case 'onlyTranslation':
        case 'onlyReflection':
            // onlyReflection (F3) flips only the bone's Y axis; the X axis the aim
            // uses is the `onlyTranslation` one.
            lx = (tx - bone.worldX) * Math.sign(sx);
            ly = (ty - bone.worldY) * Math.sign(sy);
            break;
        case 'noReflection': {
            // noReflection (F3): the parent un-reflected, measured from the bone.
            if (flip) {
                pb = -pb;
                pd = -pd;
            }
            const x = tx - bone.worldX;
            const y = ty - bone.worldY;
            const det = pa * pd - pb * pc;
            if (Math.abs(det) <= EPSILON_DET) {
                lx = 0;
                ly = 0;
            }
            else {
                lx = (x * pd - y * pb) / det;
                ly = (y * pa - x * pc) / det;
            }
            break;
        }
        case 'noRotation':
        case 'noRotationOrReflection': {
            let s = Math.abs(pa * pd - pb * pc) / Math.max(EPSILON_DET, pa * pa + pc * pc);
            if (mode === 'noRotation' && flip)
                s = -s;
            const sa = pa / sx;
            const sc = pc / sy;
            pb = -sc * s * sx;
            pd = sa * s * sy;
            rot += atan2Deg(sc, sa);
            // Falls through to the general case.
        }
        // eslint-disable-next-line no-fallthrough
        default: {
            const x = tx - pwx;
            const y = ty - pwy;
            const det = pa * pd - pb * pc;
            if (Math.abs(det) <= EPSILON_DET) {
                lx = 0;
                ly = 0;
            }
            else {
                lx = (x * pd - y * pb) / det - bone.ax;
                ly = (y * pa - x * pc) / det - bone.ay;
            }
        }
    }
    rot += atan2Deg(ly, lx);
    if (bone.ascaleX < 0)
        rot += 180;
    rot = normalizeAngle(rot);
    let scX = bone.ascaleX;
    let scY = bone.ascaleY;
    if (compress || stretch) {
        if (mode === 'noScale' || mode === 'noScaleOrReflection') {
            lx = tx - bone.worldX;
            ly = ty - bone.worldY;
        }
        const b = bone.data.length * scX;
        if (b > EPSILON_DET) {
            const dd = lx * lx + ly * ly;
            if ((compress && dd < b * b) || (stretch && dd > b * b)) {
                const s = (Math.sqrt(dd) / b - 1) * mix + 1;
                scX *= s;
                if (uniform)
                    scY *= s;
            }
        }
    }
    bone.arotation = sanitize(bone.arotation + rot * mix);
    bone.ascaleX = sanitize(scX);
    bone.ascaleY = sanitize(scY);
    bone.updateWorldTransform();
}
/**
 * Two-bone IK (spec 6.2 `ik2`): `parent` and its child `child` bend so the
 * tip of `child` reaches `(tx, ty)`. Everything is solved in the space of the
 * parent of `parent` (identity when it is the root). Includes the exact
 * non-uniform parent scale branch (circle/ellipse intersection).
 */
export function apply2(parent, child, tx, ty, bendPositive, stretch, uniform, softness, mix) {
    const bendDir = bendPositive ? 1 : -1;
    const px = parent.ax;
    const py = parent.ay;
    let psx = parent.ascaleX;
    let psy = parent.ascaleY;
    let csx = child.ascaleX;
    let sxP = psx; // final scales of the parent (may stretch)
    let syP = psy;
    let os1 = 0, s2 = 1, os2 = 0;
    if (psx < 0) {
        psx = -psx;
        os1 = 180;
        s2 = -1;
    }
    if (psy < 0) {
        psy = -psy;
        s2 = -s2;
    }
    if (csx < 0) {
        csx = -csx;
        os2 = 180;
    }
    const cx = child.ax;
    let cy, cwx, cwy;
    const u = Math.abs(psx - psy) <= EPSILON_DET;
    if (!u || stretch) {
        cy = 0;
        cwx = parent.a * cx + parent.worldX;
        cwy = parent.c * cx + parent.worldY;
    }
    else {
        cy = child.ay;
        cwx = parent.a * cx + parent.b * cy + parent.worldX;
        cwy = parent.c * cx + parent.d * cy + parent.worldY;
    }
    const pp = parent.parent;
    let a, b, c, d, ppx, ppy;
    if (pp !== null) {
        a = pp.a;
        b = pp.b;
        c = pp.c;
        d = pp.d;
        ppx = pp.worldX;
        ppy = pp.worldY;
    }
    else {
        a = 1;
        b = 0;
        c = 0;
        d = 1;
        ppx = 0;
        ppy = 0;
    }
    let id = a * d - b * c;
    id = Math.abs(id) <= EPSILON_DET ? 0 : 1 / id;
    let x = cwx - ppx;
    let y = cwy - ppy;
    const dx = (x * d - y * b) * id - px; // origin of the child relative to the parent
    const dy = (y * a - x * c) * id - py;
    const l1 = Math.sqrt(dx * dx + dy * dy);
    let l2 = child.data.length * csx;
    if (l1 < EPSILON_DET) {
        // The child starts on top of the parent: degenerates into one-bone IK.
        apply1(parent, tx, ty, false, stretch, false, mix);
        child.arotation = 0;
        child.updateWorldTransform();
        return;
    }
    x = tx - ppx;
    y = ty - ppy;
    let ttx = (x * d - y * b) * id - px; // target relative to the parent
    let tty = (y * a - x * c) * id - py;
    let dd = ttx * ttx + tty * tty;
    if (softness !== 0) {
        softness *= psx * (csx + 1) / 2;
        const td = Math.sqrt(dd);
        const sd = td - l1 - l2 * psx + softness;
        if (sd > 0) {
            let pz = Math.min(1, sd / (softness * 2)) - 1;
            pz = (sd - softness * (1 - pz * pz)) / td;
            ttx -= pz * ttx;
            tty -= pz * tty;
            dd = ttx * ttx + tty * tty;
        }
    }
    let a1;
    let a2;
    if (u) {
        // Uniform parent scale.
        l2 *= psx;
        let cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
        if (cos < -1) {
            cos = -1;
            a2 = PI * bendDir;
        }
        else if (cos > 1) {
            cos = 1;
            a2 = 0;
            if (stretch) {
                const k = (Math.sqrt(dd) / (l1 + l2) - 1) * mix + 1;
                sxP *= k;
                if (uniform)
                    syP *= k;
            }
        }
        else {
            a2 = Math.acos(cos) * bendDir;
        }
        a = l1 + l2 * cos;
        b = l2 * Math.sin(a2);
        a1 = atan2(tty * a - ttx * b, ttx * a + tty * b);
    }
    else {
        // Non-uniform parent scale: intersection of the target circle with the ellipse.
        a = psx * l2;
        b = psy * l2;
        const aa = a * a;
        const bb = b * b;
        const ta = atan2(tty, ttx);
        c = bb * l1 * l1 + aa * dd - aa * bb;
        const c1 = -2 * bb * l1;
        const c2 = bb - aa;
        d = c1 * c1 - 4 * c2 * c;
        let solved = false;
        a1 = 0;
        a2 = 0;
        if (d >= 0) {
            let q = Math.sqrt(d);
            if (c1 < 0)
                q = -q;
            q = -(c1 + q) / 2;
            let r0 = q / c2;
            const r1 = c / q;
            const r = Math.abs(r0) < Math.abs(r1) ? r0 : r1;
            r0 = dd - r * r;
            if (r0 >= 0) {
                y = Math.sqrt(r0) * bendDir;
                a1 = ta - atan2(y, r);
                a2 = atan2(y / psy, (r - l1) / psx);
                solved = true;
            }
        }
        if (!solved) {
            // Target out of reach: closest or farthest point of the ellipse.
            let minAngle = PI, minX = l1 - a, minDist = minX * minX, minY = 0;
            let maxAngle = 0, maxX = l1 + a, maxDist = maxX * maxX, maxY = 0;
            c = -a * l1 / (aa - bb);
            if (c >= -1 && c <= 1) {
                c = Math.acos(c);
                x = a * Math.cos(c) + l1;
                y = b * Math.sin(c);
                d = x * x + y * y;
                if (d < minDist) {
                    minAngle = c;
                    minDist = d;
                    minX = x;
                    minY = y;
                }
                if (d > maxDist) {
                    maxAngle = c;
                    maxDist = d;
                    maxX = x;
                    maxY = y;
                }
            }
            if (dd <= (minDist + maxDist) / 2) {
                a1 = ta - atan2(minY * bendDir, minX);
                a2 = minAngle * bendDir;
            }
            else {
                a1 = ta - atan2(maxY * bendDir, maxX);
                a2 = maxAngle * bendDir;
            }
        }
    }
    const os = atan2(cy, cx) * s2;
    const r1 = normalizeAngle((a1 - os) * RAD_TO_DEG + os1 - parent.arotation);
    parent.arotation = sanitize(parent.arotation + r1 * mix);
    parent.ascaleX = sanitize(sxP);
    parent.ascaleY = sanitize(syP);
    parent.ashearX = 0;
    parent.ashearY = 0;
    parent.updateWorldTransform();
    const r2 = normalizeAngle(((a2 + os) * RAD_TO_DEG - child.ashearX) * s2 + os2 - child.arotation);
    child.arotation = sanitize(child.arotation + r2 * mix);
    child.updateWorldTransform();
}
// Registered by side effect; the last registration wins over the noop factory.
registerConstraint('ik', (data, skeleton) => {
    if (!(data instanceof IkConstraintData))
        throw new Error(`ik constraint "${data.name}" has wrong data type "${data.type}"`);
    return new IkConstraint(data, skeleton);
});
