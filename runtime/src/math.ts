// SPDX-License-Identifier: Apache-2.0
/**
 * Math utilities shared by the whole runtime.
 *
 * Angles in the file are degrees, counter-clockwise positive (spec 3.1).
 * Thresholds `0.0001` and `0.00001` are normative (spec 3.6) and must be used
 * exactly where the spec uses them.
 */

export const PI = Math.PI;
export const PI2 = Math.PI * 2;
export const DEG_TO_RAD = Math.PI / 180;
export const RAD_TO_DEG = 180 / Math.PI;

/** Guard used by determinant checks (spec 5.5). */
export const EPSILON_DET = 0.0001;
/** Guard used by the `noScale` branches (spec 5.4). */
export const EPSILON_SCALE = 0.00001;

export function degToRad(degrees: number): number {
  return degrees * DEG_TO_RAD;
}

export function radToDeg(radians: number): number {
  return radians * RAD_TO_DEG;
}

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Reduces degrees to the interval `(-180, 180]` (spec 3.1, 6.1). */
export function normalizeAngle(degrees: number): number {
  let r = degrees % 360;
  if (r <= -180) r += 360;
  else if (r > 180) r -= 360;
  // `-0` and values equal to -180 after the modulo become +180.
  if (r === -180) r = 180;
  return r === 0 ? 0 : r;
}

/** Reduces radians to the interval `(-PI, PI]` (spec 6.1 `normalize`). */
export function normalizeRadians(radians: number): number {
  let r = radians % PI2;
  if (r <= -PI) r += PI2;
  else if (r > PI) r -= PI2;
  if (r === -PI) r = PI;
  return r === 0 ? 0 : r;
}

/** `|value| <= threshold`. The default threshold is the determinant guard of spec 5.5. */
export function isNearZero(value: number, threshold: number = EPSILON_DET): boolean {
  return Math.abs(value) <= threshold;
}

/** Replaces NaN and +-Infinity by 0 (spec 5.5: nothing non-finite may enter the pose). */
export function sanitize(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

export function cosDeg(degrees: number): number {
  return Math.cos(degrees * DEG_TO_RAD);
}

export function sinDeg(degrees: number): number {
  return Math.sin(degrees * DEG_TO_RAD);
}

/** `atan2` with `atan2(0, 0) = 0` (spec 3.6; JS returns PI for `atan2(0, -0)`). */
export function atan2(y: number, x: number): number {
  if (y === 0 && x === 0) return 0;
  return Math.atan2(y, x);
}

/** `atan2` in degrees, with `atan2(0, 0) = 0`. */
export function atan2Deg(y: number, x: number): number {
  return atan2(y, x) * RAD_TO_DEG;
}

/** Circular distance between two angles in degrees (spec 12.4). */
export function angleDistance(a: number, b: number): number {
  return Math.abs(normalizeAngle(a - b));
}

// ---------------------------------------------------------------------------
// 2x3 affine matrix (spec 3.2)
// ---------------------------------------------------------------------------

/**
 * | a  b  worldX |
 * | c  d  worldY |
 */
export interface Matrix2x3 {
  a: number;
  b: number;
  c: number;
  d: number;
  worldX: number;
  worldY: number;
}

export function identityMatrix(): Matrix2x3 {
  return { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
}

export function matrixDeterminant(m: Matrix2x3): number {
  return m.a * m.d - m.b * m.c;
}

/**
 * Inverse of a 2x3 affine matrix. When `|det| <= 0.0001` the linear part is
 * zero and the translation is zero, mirroring the guards of spec 5.5
 * (`pid = 0`, `worldToLocal` returning `(0, 0)`).
 */
export function invertMatrix(m: Matrix2x3, out: Matrix2x3 = identityMatrix()): Matrix2x3 {
  const det = matrixDeterminant(m);
  if (Math.abs(det) <= EPSILON_DET) {
    out.a = 0; out.b = 0; out.c = 0; out.d = 0; out.worldX = 0; out.worldY = 0;
    return out;
  }
  const id = 1 / det;
  const a = m.d * id;
  const b = -m.b * id;
  const c = -m.c * id;
  const d = m.a * id;
  out.a = a; out.b = b; out.c = c; out.d = d;
  out.worldX = -(a * m.worldX + b * m.worldY);
  out.worldY = -(c * m.worldX + d * m.worldY);
  return out;
}

/** `out = m1 * m2` (apply `m2` first, then `m1`). */
export function multiplyMatrix(m1: Matrix2x3, m2: Matrix2x3, out: Matrix2x3 = identityMatrix()): Matrix2x3 {
  const a = m1.a * m2.a + m1.b * m2.c;
  const b = m1.a * m2.b + m1.b * m2.d;
  const c = m1.c * m2.a + m1.d * m2.c;
  const d = m1.c * m2.b + m1.d * m2.d;
  const x = m1.a * m2.worldX + m1.b * m2.worldY + m1.worldX;
  const y = m1.c * m2.worldX + m1.d * m2.worldY + m1.worldY;
  out.a = a; out.b = b; out.c = c; out.d = d; out.worldX = x; out.worldY = y;
  return out;
}

/** Builds `T(x, y) * R(rotation) * S(scaleX, scaleY)` with rotation in degrees (spec 7.3, 7.11). */
export function composeMatrix(
  x: number, y: number, rotation: number, scaleX: number, scaleY: number,
  out: Matrix2x3 = identityMatrix(),
): Matrix2x3 {
  const c = cosDeg(rotation);
  const s = sinDeg(rotation);
  out.a = c * scaleX; out.b = -s * scaleY;
  out.c = s * scaleX; out.d = c * scaleY;
  out.worldX = x; out.worldY = y;
  return out;
}

export interface Vector2 {
  x: number;
  y: number;
}

export function transformPoint(m: Matrix2x3, lx: number, ly: number, out: Vector2 = { x: 0, y: 0 }): Vector2 {
  out.x = m.a * lx + m.b * ly + m.worldX;
  out.y = m.c * lx + m.d * ly + m.worldY;
  return out;
}

/** Inverse transform with the `worldToLocal` determinant guard of spec 5.5. */
export function inverseTransformPoint(m: Matrix2x3, wx: number, wy: number, out: Vector2 = { x: 0, y: 0 }): Vector2 {
  const det = matrixDeterminant(m);
  if (Math.abs(det) <= EPSILON_DET) {
    out.x = 0; out.y = 0;
    return out;
  }
  const x = wx - m.worldX;
  const y = wy - m.worldY;
  out.x = (x * m.d - y * m.b) / det;
  out.y = (y * m.a - x * m.c) / det;
  return out;
}

/** World rotation of the matrix X axis in degrees (spec 3.2). */
export function matrixRotationDeg(m: Matrix2x3): number {
  return atan2Deg(m.c, m.a);
}

/** World scale X of the matrix (spec 3.2). */
export function matrixScaleX(m: Matrix2x3): number {
  return Math.sqrt(m.a * m.a + m.c * m.c);
}

export function matrixScaleY(m: Matrix2x3): number {
  return Math.sqrt(m.b * m.b + m.d * m.d);
}
