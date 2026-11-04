// SPDX-License-Identifier: Apache-2.0
/**
 * Frame of an image sequence at a given time (spec 9.6, normative).
 */
/**
 * Frame index for a `sequence` key active since `t0`, evaluated at `t`
 * (`t >= t0`), for a sequence of `count` frames. Port of spec 9.6.
 */
export function computeSequenceFrame(mode, index, delay, t0, t, count) {
    const n = count;
    if (n <= 0)
        return 0;
    if (mode === 'hold' || delay === 0)
        return clampFrame(index, n);
    const k = Math.floor((t - t0) / delay + 0.00001);
    switch (mode) {
        case 'once':
            return Math.min(index + k, n - 1);
        case 'loop':
            return mod(index + k, n);
        case 'pingpong': {
            const p = 2 * n - 2;
            if (p === 0)
                return 0;
            let frame = mod(index + k, p);
            if (frame >= n)
                frame = p - frame;
            return frame;
        }
        case 'onceReverse':
            return Math.max(n - 1 - (index + k), 0);
        case 'loopReverse':
            return n - 1 - mod(index + k, n);
        case 'pingpongReverse': {
            const p = 2 * n - 2;
            if (p === 0)
                return 0;
            let frame = mod(index + k + n - 1, p);
            if (frame >= n)
                frame = p - frame;
            return frame;
        }
        default:
            return clampFrame(index, n); // unknown mode: "hold" (spec 2.5)
    }
}
/**
 * Frame shown at time `t` by a `sequence` timeline: `-1` (= `sequence.setup`)
 * before the first key, otherwise the frame of the last key with `time <= t`.
 */
export function sequenceFrameAt(timeline, t) {
    const times = timeline.times;
    if (times.length === 0 || t < times[0])
        return -1;
    let lo = 0;
    let hi = times.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (times[mid] <= t)
            lo = mid;
        else
            hi = mid - 1;
    }
    const key = timeline.keys.values[lo];
    const sequence = timeline.attachment.sequence;
    const count = sequence === null ? 0 : sequence.count;
    return computeSequenceFrame(key.mode, key.index, key.delay, times[lo], t, count);
}
function mod(a, n) {
    const r = a % n;
    return r < 0 ? r + n : r;
}
function clampFrame(index, n) {
    return index < 0 ? 0 : index >= n ? n - 1 : index;
}
