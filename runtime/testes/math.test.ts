import {
  degToRad, radToDeg, clamp, normalizeAngle, normalizeRadians, isNearZero, sanitize, atan2, atan2Deg,
  identityMatrix, invertMatrix, multiplyMatrix, composeMatrix, transformPoint, inverseTransformPoint,
  matrixRotationDeg, matrixScaleX, EPSILON_DET,
} from '../src/math.js';
import { normalizeCurve, sampleCurve, solveBezierParameter, LINEAR_CURVE, STEPPED_CURVE } from '../src/curve.js';

describe('angles', () => {
  it('converts degrees and radians', () => {
    expect(degToRad(180)).toBeCloseTo(Math.PI, 12);
    expect(radToDeg(Math.PI / 2)).toBeCloseTo(90, 12);
  });

  it('normalizes degrees to (-180, 180]', () => {
    expect(normalizeAngle(0)).toBe(0);
    expect(normalizeAngle(180)).toBe(180);
    expect(normalizeAngle(-180)).toBe(180);
    expect(normalizeAngle(540)).toBe(180);
    expect(normalizeAngle(270)).toBe(-90);
    expect(normalizeAngle(-190)).toBe(170);
    expect(normalizeAngle(720)).toBe(0);
    expect(normalizeAngle(-350)).toBe(10);
  });

  it('normalizes radians to (-PI, PI]', () => {
    expect(normalizeRadians(Math.PI)).toBe(Math.PI);
    expect(normalizeRadians(-Math.PI)).toBe(Math.PI);
    expect(normalizeRadians(3 * Math.PI)).toBeCloseTo(Math.PI, 12);
    expect(normalizeRadians(-Math.PI / 2)).toBeCloseTo(-Math.PI / 2, 12);
  });

  it('defines atan2(0, 0) = 0 even for -0 (spec 3.6)', () => {
    expect(atan2(0, 0)).toBe(0);
    expect(atan2(0, -0)).toBe(0);
    expect(Math.atan2(0, -0)).toBe(Math.PI); // the JS behaviour we guard against
    expect(atan2Deg(1, 1)).toBeCloseTo(45, 12);
  });
});

describe('numbers', () => {
  it('clamps', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    expect(clamp(-5, 0, 1)).toBe(0);
    expect(clamp(0.5, 0, 1)).toBe(0.5);
  });

  it('uses the spec thresholds for isNearZero', () => {
    expect(EPSILON_DET).toBe(0.0001);
    expect(isNearZero(0.0001)).toBe(true);
    expect(isNearZero(0.00011)).toBe(false);
    expect(isNearZero(0.00001, 0.00001)).toBe(true);
    expect(isNearZero(0.000011, 0.00001)).toBe(false);
  });

  it('sanitizes NaN and Infinity to 0', () => {
    expect(sanitize(NaN)).toBe(0);
    expect(sanitize(Infinity)).toBe(0);
    expect(sanitize(-Infinity)).toBe(0);
    expect(sanitize(1.5)).toBe(1.5);
  });
});

describe('matrix 2x3', () => {
  it('inverts and multiplies back to identity', () => {
    const m = composeMatrix(10, -5, 30, 2, 0.5);
    const inv = invertMatrix(m);
    const id = multiplyMatrix(m, inv);
    expect(id.a).toBeCloseTo(1, 10);
    expect(id.b).toBeCloseTo(0, 10);
    expect(id.c).toBeCloseTo(0, 10);
    expect(id.d).toBeCloseTo(1, 10);
    expect(id.worldX).toBeCloseTo(0, 10);
    expect(id.worldY).toBeCloseTo(0, 10);
  });

  it('transforms points and inverts them', () => {
    const m = composeMatrix(100, 50, 90, 1, 1);
    const p = transformPoint(m, 10, 0);
    expect(p.x).toBeCloseTo(100, 10);
    expect(p.y).toBeCloseTo(60, 10);
    const back = inverseTransformPoint(m, p.x, p.y);
    expect(back.x).toBeCloseTo(10, 10);
    expect(back.y).toBeCloseTo(0, 10);
    expect(matrixRotationDeg(m)).toBeCloseTo(90, 10);
    expect(matrixScaleX(m)).toBeCloseTo(1, 10);
  });

  it('guards a degenerate determinant (spec 5.5)', () => {
    const m = { a: 0.005, b: 0, c: 0, d: 0.005, worldX: 3, worldY: 4 }; // det = 0.000025 <= 0.0001
    const inv = invertMatrix(m);
    expect(inv).toEqual({ a: 0, b: 0, c: 0, d: 0, worldX: 0, worldY: 0 });
    const p = inverseTransformPoint(m, 10, 10);
    expect(p).toEqual({ x: 0, y: 0 });
    const ok = invertMatrix(identityMatrix());
    expect(ok.a).toBe(1);
  });
});

describe('curves (spec 9.3)', () => {
  it('normalizes strings and fallbacks', () => {
    expect(normalizeCurve(undefined, 1, true, 0, 1)).toBe(LINEAR_CURVE);
    expect(normalizeCurve('stepped', 1, true, 0, 1)).toBe(STEPPED_CURVE);
    expect(normalizeCurve('bouncy', 1, true, 0, 1)).toBe(LINEAR_CURVE);
    expect(normalizeCurve([0, 0, 1, 1], 1, false, 0, 1)).toBe(STEPPED_CURVE);
    expect(normalizeCurve([0, 0, 1], 1, true, 0, 1)).toBe(LINEAR_CURVE); // wrong length
  });

  it('falls back to linear (with a warning) on a non-numeric entry', () => {
    const warnings: string[] = [];
    const warn = (m: string): void => { warnings.push(m); };
    expect(normalizeCurve(['a', 0, 1, 1] as unknown as number[], 1, true, 0, 1, warn)).toBe(LINEAR_CURVE);
    expect(normalizeCurve([0, NaN, 1, 1], 1, true, 0, 1, warn)).toBe(LINEAR_CURVE);
    expect(normalizeCurve([0, 0, Infinity, 1], 1, true, 0, 1, warn)).toBe(LINEAR_CURVE);
    expect(normalizeCurve([null, 0, 1, 1] as unknown as number[], 1, true, 0, 1, warn)).toBe(LINEAR_CURVE);
    expect(warnings.length).toBe(4);
    expect(warnings[0]).toMatch(/non-numeric/);
    // A valid array still becomes a bezier.
    expect(normalizeCurve([0.2, 0, 0.8, 1], 1, true, 0, 1, warn).kind).toBe('bezier');
    expect(warnings.length).toBe(4);
  });

  it('clamps cx1 first, then cx2 (spec 9.3, decision 30)', () => {
    const a = normalizeCurve([-1, 5, 2, 7], 1, true, 0, 1);
    expect(Array.from(a.controls!)).toEqual([0, 5, 1, 7]);
    const b = normalizeCurve([0.9, 0, 0.2, 1], 1, true, 0, 1);
    expect(Array.from(b.controls!)).toEqual([0.9, 0, 0.9, 1]);
  });

  it('samples linear, stepped and bezier', () => {
    expect(sampleCurve(LINEAR_CURVE, 0, 0, 2, 10, 20, 0.5)).toBeCloseTo(12.5, 12);
    expect(sampleCurve(STEPPED_CURVE, 0, 0, 2, 10, 20, 1.5)).toBe(10);
    // Handles on the straight line: bezier equals linear.
    const straight = normalizeCurve([1 / 3, 10 + 10 / 3, 2 / 3, 10 + 20 / 3], 1, true, 0, 1);
    expect(sampleCurve(straight, 0, 0, 1, 10, 20, 0.25)).toBeCloseTo(12.5, 6);
    // Ease in-out: below the line in the first half.
    const ease = normalizeCurve([0.5, 10, 0.5, 20], 1, true, 0, 1);
    expect(sampleCurve(ease, 0, 0, 1, 10, 20, 0.25)).toBeLessThan(12.5);
    expect(sampleCurve(ease, 0, 0, 1, 10, 20, 0.5)).toBeCloseTo(15, 6);
    // Overshoot is allowed when v0 == v1.
    const belly = normalizeCurve([0.3, 5, 0.7, 5], 1, true, 0, 1);
    expect(sampleCurve(belly, 0, 0, 1, 0, 0, 0.5)).toBeGreaterThan(3);
  });

  it('solves the bezier parameter within tolerance', () => {
    const t0 = 0, cx1 = 0.1, cx2 = 0.3, t1 = 1;
    for (const t of [0, 0.05, 0.2, 0.5, 0.9, 1]) {
      const s = solveBezierParameter(t0, cx1, cx2, t1, t);
      const u = 1 - s;
      const x = u * u * u * t0 + 3 * u * u * s * cx1 + 3 * u * s * s * cx2 + s * s * s * t1;
      expect(Math.abs(x - t)).toBeLessThanOrEqual(1e-6);
    }
  });
});
