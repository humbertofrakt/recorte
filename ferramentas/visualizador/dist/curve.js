// SPDX-License-Identifier: Apache-2.0
/**
 * Curves between two keys (spec 9.3) in resolved form, plus the normative
 * sampling function. Used by timelines (9.10) and by driver keys (8.2).
 */
import { clamp } from './math.js';
export const LINEAR_CURVE = Object.freeze({ kind: 'linear', controls: null });
export const STEPPED_CURVE = Object.freeze({ kind: 'stepped', controls: null });
/**
 * Normalizes the `curve` of one key (spec 9.3, 2.5).
 *
 * - `interpolable === false` (boolean, string, null, object values): always stepped.
 * - unknown string: linear.
 * - array with wrong length (`!= 4 x components`) or with a non-finite entry: linear.
 * - Bezier: `cx1 = clamp(cx1, t0, t1)`, then `cx2 = clamp(cx2, cx1, t1)`. `cy` is never clamped.
 *
 * `t0` and `t1` are the times (or driver inputs) of this key and the next one.
 */
export function normalizeCurve(curve, components, interpolable, t0, t1, warn) {
    if (!interpolable)
        return STEPPED_CURVE;
    if (curve === undefined || curve === 'linear')
        return LINEAR_CURVE;
    if (curve === 'stepped')
        return STEPPED_CURVE;
    if (typeof curve === 'string') {
        warn?.(`unknown curve "${curve}", using "linear"`);
        return LINEAR_CURVE;
    }
    if (!Array.isArray(curve)) {
        warn?.('curve must be a string or an array, using "linear"');
        return LINEAR_CURVE;
    }
    if (curve.length !== 4 * components) {
        warn?.(`curve has ${curve.length} numbers, expected ${4 * components}, using "linear"`);
        return LINEAR_CURVE;
    }
    for (let i = 0; i < curve.length; i++) {
        const v = curve[i];
        if (typeof v !== 'number' || !Number.isFinite(v)) {
            warn?.(`curve has a non-numeric entry at index ${i}, using "linear"`);
            return LINEAR_CURVE;
        }
    }
    const controls = new Float64Array(curve.length);
    for (let j = 0; j < components; j++) {
        const base = j * 4;
        let cx1 = curve[base];
        const cy1 = curve[base + 1];
        let cx2 = curve[base + 2];
        const cy2 = curve[base + 3];
        const c1 = clamp(cx1, t0, t1);
        if (c1 !== cx1)
            warn?.(`curve cx1 ${cx1} outside [${t0}, ${t1}], clamped`);
        cx1 = c1;
        const c2 = clamp(cx2, cx1, t1);
        if (c2 !== cx2)
            warn?.(`curve cx2 ${cx2} outside [${cx1}, ${t1}], clamped`);
        cx2 = c2;
        controls[base] = cx1;
        controls[base + 1] = cy1;
        controls[base + 2] = cx2;
        controls[base + 3] = cy2;
    }
    return { kind: 'bezier', controls };
}
/**
 * Solves `x(s) = t` for the cubic Bezier `x(s)` with `x(0) = t0` and `x(1) = t1`
 * (monotonic because `t0 <= cx1 <= cx2 <= t1`).
 *
 * The stop condition is on `s`, not on `x` (spec 9.3). Stopping at
 * `|x(s) - t| <= 1e-6 x span` is not enough: the error carried into the value
 * is multiplied by `|v'(s)| / |x'(s)|`, which has no upper bound. Two runtimes
 * that both stopped on `x` disagreed by 8.5e-5 on case A-020, against a
 * conformance tolerance of 1e-4.
 *
 * Newton iterations refined by bisection, down to `|delta s| <= 1e-12`.
 */
export function solveBezierParameter(t0, cx1, cx2, t1, t) {
    const span = t1 - t0;
    if (span <= 0)
        return 0;
    if (t <= t0)
        return 0;
    if (t >= t1)
        return 1;
    const epsilon = 1e-12;
    // Initial guess: linear.
    let s = (t - t0) / span;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 64; i++) {
        const u = 1 - s;
        const x = u * u * u * t0 + 3 * u * u * s * cx1 + 3 * u * s * s * cx2 + s * s * s * t1;
        const err = x - t;
        if (err === 0)
            return s;
        if (err > 0)
            hi = s;
        else
            lo = s;
        if (hi - lo <= epsilon)
            break;
        const dx = 3 * u * u * (cx1 - t0) + 6 * u * s * (cx2 - cx1) + 3 * s * s * (t1 - cx2);
        let next = dx > 1e-12 ? s - err / dx : (lo + hi) / 2;
        if (next <= lo || next >= hi)
            next = (lo + hi) / 2;
        if (Math.abs(next - s) <= epsilon) {
            s = next;
            break;
        }
        s = next;
    }
    return clamp(s, 0, 1);
}
/**
 * Samples component `j` of a curve between two keys (spec 9.3 `amostrar`).
 * `v0`/`v1` are the values of the two keys for that component.
 */
export function sampleCurve(curve, j, t0, t1, v0, v1, t) {
    if (curve.kind === 'stepped')
        return v0;
    if (curve.kind === 'linear' || curve.controls === null) {
        if (t1 === t0)
            return v0;
        return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
    }
    const c = curve.controls;
    const base = j * 4;
    const s = solveBezierParameter(t0, c[base], c[base + 2], t1, t);
    const u = 1 - s;
    return u * u * u * v0 + 3 * u * u * s * c[base + 1] + 3 * u * s * s * c[base + 3] + s * s * s * v1;
}
