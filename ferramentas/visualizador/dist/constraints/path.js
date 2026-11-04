// SPDX-License-Identifier: Apache-2.0
/**
 * Path constraint (spec 6.4): spreads a list of bones along the cubic Bezier
 * curve of the `path` attachment currently shown by the target **slot**.
 *
 * Normative port of the `pathApply` pseudocode of spec 6.4 (itself a port of
 * Spine 4.2 `PathConstraint`), following the spec text where the two differ
 * (see DUVIDAS-SPEC.md 14 to 17).
 *
 * The constraint reads and writes the **world** matrix of the bones and then
 * derives the applied pose (`Bone.updateAppliedTransform`, spec 5.5). Nothing
 * touches the local pose (spec 5.2, 6.1, decision 23).
 *
 * Importing this module registers the factory for `type: "path"`, replacing
 * the noop placeholder of `constraint.ts`.
 */
import { PathConstraintData } from '../data.js';
import { PathAttachment } from '../attachments/path.js';
import { atan2, normalizeRadians, DEG_TO_RAD, EPSILON_SCALE } from '../math.js';
import { finishWorldWrite, registerConstraint } from './constraint.js';
/** Linear segments per curve used to measure and to walk it (spec 6.4). */
const SEGMENTS = 10;
/** Below this `t` the curve position is the anchor itself (Spine 4.2 `epsilon`). */
const CURVE_EPSILON = 0.00001;
export class PathConstraint {
    data;
    /** Constrained bones, in file order. */
    bones;
    /** Slot whose current attachment must be a `path` (spec 6.4). */
    target;
    active = true;
    /** General mix (spec 6.1). Multiplies every per-property mix. */
    mix;
    mixRotation;
    mixX;
    mixY;
    /** Position of the first bone, in the unit of `positionMode`. Animatable. */
    position;
    /** Space between bones, in the unit of `spacingMode`. Animatable. */
    spacing;
    // -- scratch buffers, reused between frames (no allocation per frame) --------
    /** `spaces[0] = 0`; `spaces[i + 1]` is the gap before bone `i`. Length `n + 1`. */
    spaces = new Float64Array(0);
    /** World length of each bone, only filled in `chainScale` (spec 6.4 `lengths`). */
    boneLengths = new Float64Array(0);
    /** World position of the `3K` path points, `x, y` pairs. */
    world = new Float64Array(0);
    /** `x, y, tangentAngle` per sample. `n + 1` samples (spec 6.4 step 2). */
    positions = new Float64Array(0);
    /** Cumulative arc length at the end of each of the `curveCount * 10` segments. */
    segmentLengths = new Float64Array(0);
    /** The eight numbers of the current curve: `x1 y1 cx1 cy1 cx2 cy2 x2 y2`. */
    controls = new Float64Array(8);
    constructor(data, skeleton) {
        this.data = data;
        this.bones = data.bones.map((bd) => skeleton.bones[bd.index]);
        this.target = skeleton.slots[data.target.index];
        this.mix = data.mix;
        this.mixRotation = data.mixRotation;
        this.mixX = data.mixX;
        this.mixY = data.mixY;
        this.position = data.position;
        this.spacing = data.spacing;
    }
    reset() {
        // Stateless.
    }
    setToSetupPose() {
        const d = this.data;
        this.mix = d.mix;
        this.mixRotation = d.mixRotation;
        this.mixX = d.mixX;
        this.mixY = d.mixY;
        this.position = d.position;
        this.spacing = d.spacing;
    }
    /** The `path` attachment the target slot shows, or `null` (spec 6.4: then nothing happens). */
    get pathAttachment() {
        const attachment = this.target.attachment;
        return attachment instanceof PathAttachment ? attachment : null;
    }
    update(_skeleton, _now) {
        const path = this.pathAttachment;
        if (path === null)
            return;
        const mix = this.mix;
        const mR = mix * this.mixRotation;
        const mX = mix * this.mixX;
        const mY = mix * this.mixY;
        if (mR === 0 && mX === 0 && mY === 0)
            return;
        const bones = this.bones;
        const n = bones.length;
        if (n === 0)
            return;
        if (path.curveCount < 1 || path.vertexCount < path.anchorCount * 3)
            return;
        const d = this.data;
        const scale = d.rotateMode === 'chainScale';
        const tangents = d.rotateMode === 'tangent';
        this.computeSpaces(n, scale, tangents);
        const positions = this.computeWorldPositions(path, n);
        if (positions === null)
            return;
        // -- step 3: apply to the bones (spec 6.4) ---------------------------------
        const spaces = this.spaces;
        const boneLengths = this.boneLengths;
        let bx = positions[0];
        let by = positions[1];
        let offR = d.offsetRotation;
        let tip = false;
        if (offR === 0) {
            tip = d.rotateMode === 'chain';
        }
        else {
            const pb = this.target.boneMatrix;
            offR *= pb.a * pb.d - pb.b * pb.c > 0 ? DEG_TO_RAD : -DEG_TO_RAD;
        }
        for (let i = 0; i < n; i++) {
            const bone = bones[i];
            bone.worldX += (bx - bone.worldX) * mX;
            bone.worldY += (by - bone.worldY) * mY;
            const p = (i + 1) * 3;
            const x = positions[p];
            const y = positions[p + 1];
            const dx = x - bx;
            const dy = y - by;
            if (scale) {
                const length = boneLengths[i];
                if (length !== 0) {
                    const s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * mR + 1;
                    bone.a *= s;
                    bone.c *= s;
                }
            }
            bx = x;
            by = y;
            if (mR > 0) {
                const a = bone.a, b = bone.b, cc = bone.c, dd = bone.d;
                let r;
                if (tangents)
                    r = positions[i * 3 + 2];
                else if (spaces[i + 1] === 0)
                    r = positions[p + 2];
                else
                    r = atan2(dy, dx);
                r -= atan2(cc, a);
                if (tip) {
                    // The tip correction moves the ORIGIN OF THE NEXT BONE, not this
                    // bone's matrix (spec 6.4, decision 20).
                    const cos = Math.cos(r), sin = Math.sin(r);
                    const length = bone.data.length;
                    bx += (length * (cos * a - sin * cc) - dx) * mR;
                    by += (length * (sin * a + cos * cc) - dy) * mR;
                }
                else {
                    r += offR;
                }
                r = normalizeRadians(r) * mR;
                const cos = Math.cos(r), sin = Math.sin(r);
                bone.a = cos * a - sin * cc;
                bone.b = cos * b - sin * dd;
                bone.c = sin * a + cos * cc;
                bone.d = sin * b + cos * dd;
            }
            finishWorldWrite(bone);
        }
    }
    // -- step 1: spaces between bones (spec 6.4) ---------------------------------
    computeSpaces(n, scale, tangents) {
        if (this.spaces.length < n + 1)
            this.spaces = new Float64Array(n + 1);
        if (scale && this.boneLengths.length < n)
            this.boneLengths = new Float64Array(n);
        const spaces = this.spaces;
        const boneLengths = this.boneLengths;
        const spacing = this.spacing;
        const mode = this.data.spacingMode;
        const bones = this.bones;
        spaces[0] = 0;
        for (let i = 0; i < n; i++) {
            const bone = bones[i];
            const setupLength = bone.data.length;
            const worldLength = setupLength * Math.sqrt(bone.a * bone.a + bone.c * bone.c);
            if (scale)
                boneLengths[i] = setupLength < EPSILON_SCALE ? 0 : worldLength;
            const tiny = setupLength < EPSILON_SCALE;
            switch (mode) {
                case 'percent':
                    // Turned into pixels in step 2 (multiplied by the path length).
                    spaces[i + 1] = spacing;
                    break;
                case 'fixed':
                    spaces[i + 1] = tiny ? spacing : spacing * worldLength / setupLength;
                    break;
                case 'proportional':
                    spaces[i + 1] = tiny ? spacing : worldLength;
                    break;
                default: // 'length'
                    spaces[i + 1] = tiny ? spacing : (setupLength + spacing) * worldLength / setupLength;
                    break;
            }
        }
        if (mode === 'proportional') {
            // `m = n` in tangent mode, `n + 1` otherwise (spec 6.4, decision 20).
            const m = tangents ? n : n + 1;
            let sum = 0;
            for (let i = 1; i <= n; i++)
                sum += spaces[i];
            if (sum > 0) {
                const k = m / sum * spacing;
                for (let i = 1; i <= n; i++)
                    spaces[i] *= k;
            }
        }
    }
    // -- step 2: sample the path (spec 6.4) --------------------------------------
    /**
     * Fills `positions` with `n + 1` samples `x, y, tangentAngle` (radians).
     * Returns `null` when the path has no measurable length.
     *
     * The tangent angle is computed for **every** sample: step 3 reads `T[i]`
     * in tangent mode and `T[i + 1]` when the space is 0 (DUVIDAS-SPEC 14).
     */
    computeWorldPositions(path, n) {
        const slot = this.target;
        const pointCount = path.anchorCount * 3;
        if (this.world.length < pointCount * 2)
            this.world = new Float64Array(pointCount * 2);
        path.computeWorldVertices(slot, this.world, 0, 2);
        const closed = path.closed;
        const curveCount = path.curveCount;
        // Length table: by arc of the current frame, or by the setup `lengths`.
        const setupLengths = path.lengths;
        const constantSpeed = path.constantSpeed || setupLengths.length < curveCount;
        let total;
        let table;
        if (constantSpeed) {
            table = this.measureCurves(curveCount, pointCount);
            total = table.length === 0 ? 0 : table[curveCount * SEGMENTS - 1];
        }
        else {
            table = setupLengths;
            total = setupLengths[curveCount - 1];
        }
        if (!(total > 0))
            return null;
        if (this.positions.length < (n + 1) * 3)
            this.positions = new Float64Array((n + 1) * 3);
        const positions = this.positions;
        const spaces = this.spaces;
        let pos = this.position;
        if (this.data.positionMode === 'percent')
            pos *= total;
        if (this.data.spacingMode === 'percent') {
            for (let i = 1; i <= n; i++)
                spaces[i] *= total;
        }
        const controls = this.controls;
        for (let i = 0, o = 0; i <= n; i++, o += 3) {
            pos += spaces[i];
            let q = pos;
            if (closed) {
                q %= total;
                if (q < 0)
                    q += total;
            }
            else if (q < 0) {
                this.extrapolateBefore(q, positions, o);
                continue;
            }
            else if (q > total) {
                this.extrapolateAfter(q - total, positions, o, pointCount);
                continue;
            }
            // Curve and `t` holding `q`.
            let curve;
            let t;
            if (constantSpeed) {
                let j = 0;
                while (j < curveCount * SEGMENTS - 1 && table[j] < q)
                    j++;
                const prev = j === 0 ? 0 : table[j - 1];
                const segment = table[j] - prev;
                const local = segment > 0 ? (q - prev) / segment : 0;
                curve = Math.floor(j / SEGMENTS);
                t = (j % SEGMENTS + local) / SEGMENTS;
            }
            else {
                let k = 0;
                while (k < curveCount - 1 && table[k] < q)
                    k++;
                const prev = k === 0 ? 0 : table[k - 1];
                const span = table[k] - prev;
                curve = k;
                t = span > 0 ? (q - prev) / span : 0;
            }
            this.curveControls(curve, pointCount, controls);
            addCurvePosition(controls, t, positions, o);
        }
        return positions;
    }
    /** Cumulative arc length of every segment, `SEGMENTS` per curve (spec 6.4). */
    measureCurves(curveCount, pointCount) {
        const count = curveCount * SEGMENTS;
        if (this.segmentLengths.length < count)
            this.segmentLengths = new Float64Array(count);
        const table = this.segmentLengths;
        const c = this.controls;
        let total = 0;
        for (let k = 0; k < curveCount; k++) {
            this.curveControls(k, pointCount, c);
            let px = c[0];
            let py = c[1];
            for (let s = 1; s <= SEGMENTS; s++) {
                const t = s / SEGMENTS;
                const u = 1 - t;
                const uu = u * u, tt = t * t;
                const ut3 = u * t * 3;
                const x = c[0] * uu * u + c[2] * u * ut3 + c[4] * t * ut3 + c[6] * tt * t;
                const y = c[1] * uu * u + c[3] * u * ut3 + c[5] * t * ut3 + c[7] * tt * t;
                const dx = x - px, dy = y - py;
                total += Math.sqrt(dx * dx + dy * dy);
                table[k * SEGMENTS + s - 1] = total;
                px = x;
                py = y;
            }
        }
        return table;
    }
    /**
     * The four control points of curve `k`: anchor `k` (point `3k+1`), its out
     * handle (`3k+2`), the in handle of anchor `k+1` (`3k+3`) and anchor `k+1`
     * (`3k+4`). On a closed path the last curve wraps to points `0` and `1`.
     */
    curveControls(k, pointCount, out) {
        const w = this.world;
        const base = k * 3 + 1;
        for (let i = 0; i < 4; i++) {
            const point = (base + i) % pointCount;
            out[i * 2] = w[point * 2];
            out[i * 2 + 1] = w[point * 2 + 1];
        }
    }
    /** `q < 0` on an open path: straight line out of anchor 0 along its out handle (spec 6.4). */
    extrapolateBefore(q, out, o) {
        const w = this.world;
        const x1 = w[2], y1 = w[3]; // anchor 0 = point 1
        const dx = w[4] - x1, dy = w[5] - y1; // out handle of anchor 0 = point 2
        const r = atan2(dy, dx);
        out[o] = x1 + q * Math.cos(r);
        out[o + 1] = y1 + q * Math.sin(r);
        out[o + 2] = r;
    }
    /** `q > total` on an open path: straight line out of the last anchor, along its in handle (spec 6.4). */
    extrapolateAfter(q, out, o, pointCount) {
        const w = this.world;
        const anchor = (pointCount - 2) * 2; // last anchor = point 3K-2
        const handle = (pointCount - 3) * 2; // its in handle = point 3K-3
        const x1 = w[anchor], y1 = w[anchor + 1];
        const dx = x1 - w[handle], dy = y1 - w[handle + 1];
        const r = atan2(dy, dx);
        out[o] = x1 + q * Math.cos(r);
        out[o + 1] = y1 + q * Math.sin(r);
        out[o + 2] = r;
    }
}
/**
 * `B(t)` and the tangent angle of one curve (spec 6.4 `Bezier` and
 * `anguloDaTangente`). `c` is `x1 y1 cx1 cy1 cx2 cy2 x2 y2`.
 */
function addCurvePosition(c, t, out, o) {
    const x1 = c[0], y1 = c[1], cx1 = c[2], cy1 = c[3], cx2 = c[4], cy2 = c[5], x2 = c[6], y2 = c[7];
    if (!(t >= CURVE_EPSILON)) { // also catches NaN
        out[o] = x1;
        out[o + 1] = y1;
        out[o + 2] = atan2(cy1 - y1, cx1 - x1);
        return;
    }
    const tt = t * t, ttt = tt * t;
    const u = 1 - t, uu = u * u, uuu = uu * u;
    const ut = u * t, ut3 = ut * 3, uut3 = u * ut3, ttu3 = t * ut3;
    const x = x1 * uuu + cx1 * uut3 + cx2 * ttu3 + x2 * ttt;
    const y = y1 * uuu + cy1 * uut3 + cy2 * ttu3 + y2 * ttt;
    out[o] = x;
    out[o + 1] = y;
    if (t < 0.001) {
        out[o + 2] = atan2(cy1 - y1, cx1 - x1);
    }
    else {
        // The point minus the quadratic point one degree down is the derivative direction.
        out[o + 2] = atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
    }
}
/**
 * After the constraint wrote the world matrix directly: derive the applied
 * pose (spec 5.5), keep the written matrix (it is not recomputed, as in
 * Spine) and dirty the descendants (spec 5.6).
 */
registerConstraint('path', (data, skeleton) => {
    if (!(data instanceof PathConstraintData)) {
        throw new Error(`constraint "${data.name}": expected PathConstraintData for type "path"`);
    }
    return new PathConstraint(data, skeleton);
});
