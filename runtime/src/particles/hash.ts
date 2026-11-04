// SPDX-License-Identifier: Apache-2.0
/**
 * The chance of a particle — extension `BONE_particles`, section 3.2.
 *
 * A particle never draws from a stateful generator. Its randomness is a pure
 * function of four integers — seed, flow, index, channel — hashed with the PCG
 * of Jarzynski and Olano (*Hash Functions for GPU Rendering*, JCGT 2020).
 * Nothing here depends on the frame number, on `dt`, or on the order in which
 * particles are visited: that is the whole point, and section 3.4 of the
 * extension lists what it forbids to keep it.
 *
 * Every step is 32-bit unsigned, mod 2^32. In JavaScript that means `Math.imul`
 * for the multiplications and `>>>` for the shifts (extension 3.2, the table
 * "como escrever em cada linguagem").
 *
 * The five reference numbers a reader that declares P MUST reproduce, all
 * checked by `runtime/testes/particulas.test.ts`:
 *
 *     pcg(0)               129708002
 *     pcg(42)              1223963391
 *     pcg(0xFFFFFFFF)      3861530882
 *     particleRandom(42, 0,  7, 0)   0.4190843105316162
 *     particleRandom(42, 0, -3, 0)   0.5181800723075867
 */

/** One round of the PCG hash (extension 3.2). `v` and the result are uint32. */
export function pcg(v: number): number {
  const state = (Math.imul(v >>> 0, 747796405) + 2891336453) >>> 0;
  const shift = ((state >>> 28) + 4) >>> 0;
  const word = Math.imul((((state >>> shift) ^ state) >>> 0), 277803737) >>> 0;
  return (((word >>> 22) ^ word) >>> 0);
}

/**
 * `u` in `[0, 1)` for one channel of one particle (extension 3.2).
 *
 * A negative `index` enters the hash as its two's complement in 32 bits — that
 * is what `>>> 0` does — and NOT as its absolute value: prewarm lives on
 * negative indices (extension 6), and a reader that took the modulus would make
 * the previous lap a copy of the current one. Case P-004 exists for this.
 *
 * The result keeps 24 bits, which is exact in float32 as well as float64, so a
 * runtime computing in float32 (allowed by spec 3.6) draws the same `u`.
 */
export function particleRandom(seed: number, flow: number, index: number, channel: number): number {
  let h = pcg(seed >>> 0);
  h = pcg((h ^ (flow >>> 0)) >>> 0);
  h = pcg((h ^ (index >>> 0)) >>> 0);
  h = pcg((h ^ (channel >>> 0)) >>> 0);
  return (h >>> 8) / 16777216;
}

/**
 * The channel table of extension 3.3, frozen: a channel number NEVER changes
 * meaning. A new channel only ever goes on the end.
 */
export const PARTICLE_CHANNEL = Object.freeze({
  LIFETIME: 0,
  SPEED: 1,
  SPREAD: 2,
  SHAPE_A: 3,
  SHAPE_B: 4,
  ANGLE: 5,
  ANGULAR_VELOCITY: 6,
  SCALE: 7,
  START_COLOR: 8,
  START_FRAME: 9,
  RANDOMNESS: 10,
  PROBABILITY: 11,
  MESH_PICK: 12,
} as const);

/** `min + (max − min) · u` — how every `[min, max]` field is drawn (extension 3.3). */
export function particleRange(range: ArrayLike<number>, u: number): number {
  const min = range[0];
  return min + (range[1] - min) * u;
}
