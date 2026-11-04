// SPDX-License-Identifier: Apache-2.0
/**
 * `region` attachment: a rectangular image attached to the slot bone (spec 7.3).
 *
 * The four local corners and their UVs are precomputed per atlas region by
 * `computeRegionFrame()` (a pure function) whenever the region changes at load
 * or edit time. With a sequence (spec 7.10) every frame gets its own corners
 * and UVs (`frameOffsets`, `frameUVs`); reading functions such as
 * `computeWorldVertices` and `uvsFor` pick the frame from `slot.sequenceIndex`
 * and never mutate the attachment, so one attachment can be shared by several
 * skeletons or slots showing different frames.
 */
import { Attachment } from './attachment.js';
import { cosDeg, sinDeg } from '../math.js';
/** Corner order inside `offsets` and `uvs`: BL, BR, TR, TL (counter-clockwise). */
export const REGION_BL = 0;
export const REGION_BR = 2;
export const REGION_TR = 4;
export const REGION_TL = 6;
/** Triangles of a region, indexing the four corners (spec 7.3). */
export const REGION_TRIANGLES = Object.freeze([0, 1, 2, 0, 2, 3]);
/**
 * Computes the four local corners and their page UVs of one atlas region
 * (spec 7.3, normative; UVs through spec 10.4). Pure: writes only into
 * `outOffsets` and `outUVs` (8 numbers each, BL BR TR TL).
 * Without a region the crop is the whole image and the offsets are 0.
 */
export function computeRegionFrame(params, region, outOffsets, outUVs) {
    let originalW, originalH, cropW, cropH, offX, offY;
    if (region !== null) {
        const s = region.scale;
        originalW = region.originalWidth / s;
        originalH = region.originalHeight / s;
        cropW = region.width / s;
        cropH = region.height / s;
        offX = region.offsetX / s;
        offY = region.offsetY / s;
    }
    else {
        originalW = params.width;
        originalH = params.height;
        cropW = originalW;
        cropH = originalH;
        offX = 0;
        offY = 0;
    }
    const W = params.width !== 0 ? params.width : originalW;
    const H = params.height !== 0 ? params.height : originalH;
    const kx = originalW !== 0 ? W / originalW : 1;
    const ky = originalH !== 0 ? H / originalH : 1;
    const x0 = (-originalW / 2 + offX) * kx;
    const x1 = x0 + cropW * kx;
    const y0 = (-originalH / 2 + offY) * ky;
    const y1 = y0 + cropH * ky;
    const c = cosDeg(params.rotation);
    const s = sinDeg(params.rotation);
    const sx = params.scaleX;
    const sy = params.scaleY;
    const x = params.x;
    const y = params.y;
    const o = outOffsets;
    // BL, BR, TR, TL
    o[0] = x0 * sx * c - y0 * sy * s + x;
    o[1] = x0 * sx * s + y0 * sy * c + y;
    o[2] = x1 * sx * c - y0 * sy * s + x;
    o[3] = x1 * sx * s + y0 * sy * c + y;
    o[4] = x1 * sx * c - y1 * sy * s + x;
    o[5] = x1 * sx * s + y1 * sy * c + y;
    o[6] = x0 * sx * c - y1 * sy * s + x;
    o[7] = x0 * sx * s + y1 * sy * c + y;
    // UVs of the crop corners expressed in the original image (v down), then
    // mapped to the page by spec 10.4. Without offsets this is BL=(0,1) BR=(1,1)
    // TR=(1,0) TL=(0,0), as spec 7.3 lists.
    const uv = outUVs;
    if (region !== null) {
        const ow = region.originalWidth;
        const oh = region.originalHeight;
        const u0 = ow !== 0 ? region.offsetX / ow : 0;
        const u1 = ow !== 0 ? (region.offsetX + region.width) / ow : 1;
        const v1 = oh !== 0 ? 1 - region.offsetY / oh : 1; // bottom of the crop
        const v0 = oh !== 0 ? 1 - (region.offsetY + region.height) / oh : 0; // top of the crop
        region.computeUV(u0, v1, uv, 0);
        region.computeUV(u1, v1, uv, 2);
        region.computeUV(u1, v0, uv, 4);
        region.computeUV(u0, v0, uv, 6);
    }
    else {
        uv[0] = 0;
        uv[1] = 1;
        uv[2] = 1;
        uv[3] = 1;
        uv[4] = 1;
        uv[5] = 0;
        uv[6] = 0;
        uv[7] = 0;
    }
}
export class RegionAttachment extends Attachment {
    type = 'region';
    path;
    x;
    y;
    rotation;
    scaleX;
    scaleY;
    /** Original image size in skeleton px. `0` = take it from the atlas. */
    width;
    height;
    sequence;
    /** Atlas region of the setup frame (`null` = image missing; nothing is drawn). */
    region = null;
    /** Local corners `[x, y] x 4` of the setup frame in the slot bone space. */
    offsets = new Float64Array(8);
    /** Page UVs `[u, v] x 4` of the setup frame, matching `offsets` (spec 10.4). */
    uvs = new Float64Array(8);
    /** Per sequence frame: local corners (empty without a sequence). */
    frameOffsets = [];
    /** Per sequence frame: page UVs (empty without a sequence). */
    frameUVs = [];
    constructor(name, options = {}) {
        super(name, options.color);
        this.path = options.path ?? name;
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.rotation = options.rotation ?? 0;
        this.scaleX = options.scaleX ?? 1;
        this.scaleY = options.scaleY ?? 1;
        this.width = options.width ?? 0;
        this.height = options.height ?? 0;
        this.sequence = options.sequence ?? null;
        this.updateRegion();
    }
    /**
     * Sets the atlas region of the setup frame and recomputes corners and UVs.
     * With a sequence, every frame is recomputed from `sequence.regions`.
     * Loader and editor use only; never called while rendering.
     */
    setRegion(region) {
        this.region = region;
        this.updateRegion();
    }
    /** Effective original width in skeleton px (spec 7.3 `W`). */
    get effectiveWidth() {
        if (this.width !== 0)
            return this.width;
        const r = this.region;
        return r === null ? 0 : r.originalWidth / r.scale;
    }
    get effectiveHeight() {
        if (this.height !== 0)
            return this.height;
        const r = this.region;
        return r === null ? 0 : r.originalHeight / r.scale;
    }
    /** Recomputes `offsets` / `uvs` and, with a sequence, every frame. */
    updateRegion() {
        computeRegionFrame(this, this.region, this.offsets, this.uvs);
        const sequence = this.sequence;
        if (sequence === null)
            return;
        const count = sequence.count;
        this.frameOffsets.length = count;
        this.frameUVs.length = count;
        for (let i = 0; i < count; i++) {
            const o = this.frameOffsets[i] ?? (this.frameOffsets[i] = new Float64Array(8));
            const uv = this.frameUVs[i] ?? (this.frameUVs[i] = new Float64Array(8));
            computeRegionFrame(this, sequence.regions[i] ?? null, o, uv);
        }
    }
    /** Sequence frame shown for `slot`, or `-1` without a sequence. */
    frameIndexFor(slot) {
        return this.sequence === null ? -1 : this.sequence.frameIndexFor(slot);
    }
    /** Atlas region drawn for `slot` (the current frame, or the setup region). */
    regionFor(slot) {
        const sequence = this.sequence;
        if (sequence === null)
            return this.region;
        return sequence.regions[sequence.frameIndexFor(slot)] ?? null;
    }
    /** Local corners for `slot` (read only; the current frame with a sequence). */
    offsetsFor(slot) {
        const sequence = this.sequence;
        if (sequence === null)
            return this.offsets;
        return this.frameOffsets[sequence.frameIndexFor(slot)] ?? this.offsets;
    }
    /** Page UVs for `slot` (read only; the current frame with a sequence). */
    uvsFor(slot) {
        const sequence = this.sequence;
        if (sequence === null)
            return this.uvs;
        return this.frameUVs[sequence.frameIndexFor(slot)] ?? this.uvs;
    }
    /**
     * World position of the four corners (spec 7.3). Writes `x, y` pairs into
     * `out` from `offset`, advancing `stride` per corner. Uses the current
     * sequence frame of the slot when the attachment has a sequence. Never
     * mutates the attachment.
     */
    computeWorldVertices(slot, out = new Float64Array(8), offset = 0, stride = 2) {
        // The applied bone, with the `transform` of a `slot/bone` key (spec 9.5).
        const bone = slot.boneMatrix;
        const a = bone.a, b = bone.b, c = bone.c, d = bone.d, wx = bone.worldX, wy = bone.worldY;
        const o = this.offsetsFor(slot);
        for (let i = 0, j = offset; i < 8; i += 2, j += stride) {
            const lx = o[i];
            const ly = o[i + 1];
            out[j] = a * lx + b * ly + wx;
            out[j + 1] = c * lx + d * ly + wy;
        }
        return out;
    }
}
