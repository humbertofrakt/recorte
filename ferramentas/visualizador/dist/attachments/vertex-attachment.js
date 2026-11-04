// SPDX-License-Identifier: Apache-2.0
/**
 * Attachments made of vertices: `mesh`, `linkedmesh`, `boundingbox` (polygon),
 * `clipping` and `path` (spec 7.4).
 *
 * Vertices are stored either unweighted (`2N` numbers in the slot bone space)
 * or weighted through a `binding` (structure of arrays, positions in each
 * influencing bone's local space, weights used as written, never renormalized).
 *
 * `computeWorldVertices` is the normative `worldVertices` of spec 7.4: it sums
 * the slot deform and the morph targets (spec 8.3) before skinning.
 */
import { Attachment } from './attachment.js';
import { clamp } from '../math.js';
/** Weighted vertices in structure-of-arrays form (spec 7.4 `Binding`). */
export class BindingData {
    /** Influences per vertex. Length `N`. */
    counts;
    /** Bone index per influence. Length `sum(counts)`. */
    bones;
    /** `[x, y]` per influence in that bone's local space. Length `2 x sum(counts)`. */
    positions;
    /** Weight per influence. Length `sum(counts)`. */
    weights;
    constructor(counts, bones, positions, weights) {
        this.counts = Int32Array.from(counts);
        this.bones = Int32Array.from(bones);
        this.positions = Float64Array.from(positions);
        this.weights = Float64Array.from(weights);
    }
    get influenceCount() {
        return this.bones.length;
    }
}
export class VertexAttachment extends Attachment {
    /** Number of vertices `N`. */
    vertexCount;
    /**
     * Unweighted: `2N` numbers `[x, y]` in the slot bone space.
     * Weighted: unused (`binding.positions` holds the data). Empty array in that case.
     */
    vertices;
    binding;
    /** Length of the deform / morph offsets layout: `2N` or `2 x sum(counts)` (spec 7.4). */
    deformLength;
    /**
     * Attachment whose deform timelines and morphs apply to this one. Itself,
     * except for a linked mesh with `inheritDeform: true` (spec 7.5).
     */
    timelineAttachment;
    /** Morph targets pointing at this attachment. Filled by the loader. */
    morphInfluences = [];
    constructor(name, color, vertices, binding) {
        super(name, color);
        this.binding = binding;
        if (binding !== null) {
            this.vertices = new Float64Array(0);
            this.vertexCount = binding.counts.length;
            this.deformLength = binding.positions.length;
        }
        else {
            // A Float64Array is kept as is so a linked mesh shares the parent arrays (spec 7.5).
            this.vertices = vertices === null ? new Float64Array(0)
                : vertices instanceof Float64Array ? vertices : Float64Array.from(vertices);
            this.vertexCount = this.vertices.length >> 1;
            this.deformLength = this.vertices.length;
        }
        this.timelineAttachment = this;
    }
    /**
     * Computes the world position of every vertex (spec 7.4 `worldVertices`).
     * Writes `x, y` pairs into `out` starting at `offset`, advancing `stride`
     * per vertex. Returns `out`.
     */
    computeWorldVertices(slot, out = new Float64Array(this.vertexCount * 2), offset = 0, stride = 2) {
        const delta = this.computeDelta(slot);
        const binding = this.binding;
        const n = this.vertexCount;
        if (binding === null) {
            // The applied bone, with the `transform` of a `slot/bone` key (spec 9.5).
            const bone = slot.boneMatrix;
            const a = bone.a, b = bone.b, c = bone.c, d = bone.d, wx = bone.worldX, wy = bone.worldY;
            const verts = this.vertices;
            for (let v = 0, j = 0, o = offset; v < n; v++, j += 2, o += stride) {
                let lx = verts[j];
                let ly = verts[j + 1];
                if (delta !== null) {
                    lx += delta[j];
                    ly += delta[j + 1];
                }
                out[o] = a * lx + b * ly + wx;
                out[o + 1] = c * lx + d * ly + wy;
            }
            return out;
        }
        const bones = slot.skeleton.bones;
        const counts = binding.counts;
        const boneIndices = binding.bones;
        const positions = binding.positions;
        // Spec 9.6 `weights`: the weights of this frame replace the file's, never
        // renormalized. The timeline attachment matches the way `deform` does, so a
        // linked mesh with `inheritDeform` reads its parent's weights (7.5).
        const weights = slot.weights !== null && slot.weightsAttachment === this.timelineAttachment
            && slot.weights.length === binding.weights.length ? slot.weights : binding.weights;
        let j = 0;
        for (let v = 0, o = offset; v < n; v++, o += stride) {
            let wx = 0;
            let wy = 0;
            const count = counts[v];
            for (let k = 0; k < count; k++, j++) {
                const bone = bones[boneIndices[j]];
                let px = positions[j * 2];
                let py = positions[j * 2 + 1];
                if (delta !== null) {
                    px += delta[j * 2];
                    py += delta[j * 2 + 1];
                }
                const w = weights[j];
                wx += (bone.a * px + bone.b * py + bone.worldX) * w;
                wy += (bone.c * px + bone.d * py + bone.worldY) * w;
            }
            out[o] = wx;
            out[o + 1] = wy;
        }
        return out;
    }
    /**
     * `delta(j) = deform[j] + morphSum[j]` (spec 7.4, 8.3), or `null` when both
     * are absent (fast path). Missing entries count as 0.
     *
     * The result lives in `slot.deltaScratch`, reused between calls (no
     * allocation per frame); it is valid only until the next call for that slot.
     */
    computeDelta(slot) {
        const length = this.deformLength;
        const timelineAttachment = this.timelineAttachment;
        const deform = slot.deformAttachment === timelineAttachment ? slot.deform : null;
        const influences = timelineAttachment.morphInfluences;
        const weights = slot.skeleton.morphWeights;
        let hasMorph = false;
        for (let i = 0; i < influences.length; i++) {
            const m = influences[i].morph;
            if (clamp(weights[m.index], m.min, m.max) !== 0) {
                hasMorph = true;
                break;
            }
        }
        if ((deform === null || deform.length === 0) && !hasMorph)
            return null;
        let delta = slot.deltaScratch;
        if (delta === null || delta.length < length) {
            delta = new Float64Array(length);
            slot.deltaScratch = delta;
        }
        let j = 0;
        if (deform !== null) {
            const n = Math.min(deform.length, length);
            for (; j < n; j++)
                delta[j] = deform[j];
        }
        for (; j < length; j++)
            delta[j] = 0;
        if (hasMorph) {
            for (let i = 0; i < influences.length; i++) {
                const { morph, offsets } = influences[i];
                const w = clamp(weights[morph.index], morph.min, morph.max);
                if (w === 0)
                    continue;
                const n = Math.min(offsets.length, length);
                for (let j = 0; j < n; j++)
                    delta[j] += w * offsets[j];
            }
        }
        return delta;
    }
}
