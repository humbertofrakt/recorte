// SPDX-License-Identifier: Apache-2.0
/**
 * Image sequence inside a `region`, `mesh` or `linkedmesh` (spec 7.10).
 * Only the image changes between frames; vertices, weights and UVs stay.
 */
export class SequenceData {
    /** Number of frames. */
    count;
    /** Frame image names, already generated (`frames[]` or `path + number`). */
    frames;
    start;
    digits;
    /** Frame shown in the setup pose. */
    setup;
    /** Atlas region per frame, resolved by the loader (`null` = missing image). */
    regions;
    constructor(frames, start, digits, setup) {
        this.frames = frames;
        this.count = frames.length;
        this.start = start;
        this.digits = digits;
        this.setup = setup;
        this.regions = new Array(frames.length).fill(null);
    }
    /**
     * Frame shown for `slot` (spec 7.10, 9.6): `slot.sequenceIndex` when set
     * by a `sequence` timeline, otherwise `setup`. Always inside `0..count-1`.
     */
    frameIndexFor(slot) {
        const index = slot.sequenceIndex >= 0 ? slot.sequenceIndex : this.setup;
        return index < 0 ? 0 : index >= this.count ? this.count - 1 : index;
    }
    /**
     * Builds the frame names of a sequence (spec 7.10): `frames[i]`, or
     * `path + format(start + i, digits)`.
     */
    static frameNames(path, count, start, digits, frames) {
        if (frames !== undefined)
            return frames.slice();
        const out = new Array(count);
        for (let i = 0; i < count; i++)
            out[i] = path + formatNumber(start + i, digits);
        return out;
    }
}
/** `formatNumber(4, 2) === "04"`; `digits = 0` means no padding. */
export function formatNumber(value, digits) {
    const s = String(Math.trunc(value));
    if (digits <= 0 || s.length >= digits)
        return s;
    return '0'.repeat(digits - s.length) + s;
}
