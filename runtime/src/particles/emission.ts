// SPDX-License-Identifier: Apache-2.0
/**
 * When a particle is born — extension `BONE_particles`, sections 4, 5 and 6.
 *
 * Everything here is a closed form. `E(t)` is the number of births up to `t`,
 * the integral of the effective rate; a particle `i` is born at the `t` where
 * `E(t) = i`, and that inverse is a division. There is no accumulator that
 * walks frame by frame, because an accumulator makes 30 fps and 60 fps disagree
 * and makes dragging the cursor backwards impossible (extension 3.4).
 *
 * Two things animate the rate. `emitting`, a boolean with `stepped` keys
 * (extension 4.1, the 1st phase), and — since the 2nd phase — `rate` itself,
 * by integral (extension 4.2): a `linear` key makes `E` a parabola, and the
 * birth is its STABLE inverse. Case P-002 is the case for it.
 *
 * The only sum allowed is the one below, per key, taken when the curve is
 * built: fixed order, fixed number of terms, independent of the frame.
 */

import { particleRandom, PARTICLE_CHANNEL } from './hash.js';
import type { ParticleAttachment } from '../attachments/particle.js';

/** Slack for the floor/ceil of a count that a division may land just off. */
const COUNT_EPSILON = 1e-9;

/**
 * Safety stop on how many birth candidates one emitter may enumerate in one
 * frame. The format's own ceiling is 10 000 live particles (extension 10), so
 * this is twenty times above anything a valid file asks for; it exists so a
 * `count` of a billion in a broken file cannot hang the editor.
 */
const CANDIDATE_CAP = 200000;

/** `emitting` read at a time, as the `stepped` keys of extension 4.1 give it. */
export interface EmittingKeys {
  readonly times: Float64Array;
  readonly values: readonly boolean[];
}

/**
 * The animated `rate` (extension 4.2, 2nd phase): one value per key, and the
 * curve from key `i` to key `i + 1`. The loader already swapped a negative
 * value for `0` and a Bézier for `linear`, so only `linear` and `stepped` come
 * here — the two curves whose integral is closed.
 */
export interface RateKeys {
  readonly times: Float64Array;
  readonly values: Float64Array;
  readonly curves: readonly { readonly kind: string }[];
}

/**
 * The effective rate and its integral `E` (extension 4.1 and 4.2).
 *
 * The rate is piecewise LINEAR: each segment `[boundaries[k], boundaries[k+1])`
 * starts with rate `rates[k]` and climbs with slope `slopes[k]`. A segment cut
 * by `emitting` or by a `stepped` key has slope `0`, and then `E` is a straight
 * line and the inverse a division — the 1st phase, unchanged bit for bit. A
 * `linear` key of `rate` gives a slope, `E` becomes a parabola, and the inverse
 * is the STABLE root of 4.2: `τ = 2d / (r0 + sqrt(r0² + 2·s·d))`, which does not
 * divide by `s` and holds with `s = 0` without a branch.
 *
 * `E` is anchored at the emission origin — `startDelay` — so that `E(origin)`
 * is `0` and index `0` is born there. Before the origin the rate is the one of
 * the FIRST key (spec 9.10: before the first key the first key holds), which is
 * what gives `prewarm` its negative indices a known rate (extension 6).
 */
export class EmissionCurve {
  /** `E(origin) = 0`. */
  readonly origin: number;
  /** Effective rate for `t < origin`, from the first key. */
  readonly rateBefore: number;
  /** Segment starts, ascending; `boundaries[0] === origin`. */
  readonly boundaries: Float64Array;
  /** Effective rate at the START of `[boundaries[k], boundaries[k+1])`. */
  readonly rates: Float64Array;
  /** Slope of the effective rate inside the segment; `0` in the 1st phase. */
  readonly slopes: Float64Array;
  /** `E(boundaries[k])`, summed once here and never per frame. */
  readonly totals: Float64Array;

  constructor(attachment: ParticleAttachment, emitting: EmittingKeys | null, rate: RateKeys | null = null) {
    const fixed = attachment.rate > 0 ? attachment.rate : 0;
    this.origin = attachment.startDelay;

    const on = (t: number): boolean => {
      if (emitting === null || emitting.times.length === 0) return attachment.emitting;
      const times = emitting.times;
      if (t < times[0]) return emitting.values[0];
      let lo = 0;
      let hi = times.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (times[mid] <= t) lo = mid;
        else hi = mid - 1;
      }
      return emitting.values[lo];
    };

    // The key of `rate` in force at `t` (`-1` before the first), spec 9.10.
    const rateKey = (t: number): number => {
      const times = rate!.times;
      if (t < times[0]) return -1;
      let lo = 0;
      let hi = times.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (times[mid] <= t) lo = mid;
        else hi = mid - 1;
      }
      return lo;
    };
    const animated = rate !== null && rate.times.length > 0;
    // The rate at `t` and its slope from `t` on, inside the key segment.
    const rateAt = (t: number): [number, number] => {
      if (!animated) return [fixed, 0];
      const k = rateKey(t);
      const values = rate!.values;
      if (k < 0) return [values[0], 0];
      const last = rate!.times.length - 1;
      if (k >= last || rate!.curves[k].kind === 'stepped') return [values[k], 0];
      const t0 = rate!.times[k];
      const t1 = rate!.times[k + 1];
      const slope = (values[k + 1] - values[k]) / (t1 - t0);
      return [values[k] + slope * (t - t0), slope];
    };

    this.rateBefore = on(-Infinity) ? (animated ? rate!.values[0] : fixed) : 0;

    const marks: number[] = [this.origin];
    if (emitting !== null) {
      for (let i = 0; i < emitting.times.length; i++) {
        const t = emitting.times[i];
        if (t > this.origin) marks.push(t);
      }
    }
    if (animated) {
      for (let i = 0; i < rate!.times.length; i++) {
        const t = rate!.times[i];
        if (t > this.origin) marks.push(t);
      }
    }
    marks.sort((a, b) => a - b);
    const boundaries: number[] = [];
    for (const t of marks) if (boundaries.length === 0 || t > boundaries[boundaries.length - 1]) boundaries.push(t);

    const rates = new Float64Array(boundaries.length);
    const slopes = new Float64Array(boundaries.length);
    const totals = new Float64Array(boundaries.length);
    for (let k = 0; k < boundaries.length; k++) {
      if (on(boundaries[k])) {
        const [r, s] = rateAt(boundaries[k]);
        rates[k] = r > 0 ? r : 0;
        slopes[k] = s;
      }
      if (k > 0) {
        const dt = boundaries[k] - boundaries[k - 1];
        totals[k] = totals[k - 1] + rates[k - 1] * dt + slopes[k - 1] * dt * dt / 2;
      }
    }
    // `marks` always holds the origin, so there is always at least one segment.
    this.boundaries = new Float64Array(boundaries);
    this.rates = rates;
    this.slopes = slopes;
    this.totals = totals;
  }

  /** The effective rate in force at `t` (extension 4.1 and 4.2). */
  rateAt(t: number): number {
    if (t < this.boundaries[0]) return this.rateBefore;
    const k = this.segmentAt(t);
    const r = this.rates[k] + this.slopes[k] * (t - this.boundaries[k]);
    return r > 0 ? r : 0;
  }

  /** `E(t)`: how many births up to `t`, counted from the origin. Negative before it. */
  countAt(t: number): number {
    if (t < this.boundaries[0]) return -this.rateBefore * (this.boundaries[0] - t);
    const k = this.segmentAt(t);
    const dt = t - this.boundaries[k];
    return this.totals[k] + this.rates[k] * dt + this.slopes[k] * dt * dt / 2;
  }

  /**
   * `τ(i)`: the time at which `E` reaches `i`, or `null` when the rate never
   * gets there (a stretch with `emitting` off never produces anyone).
   */
  timeOf(index: number): number | null {
    if (index < this.totals[0]) {
      if (this.rateBefore <= 0) return null;
      return this.boundaries[0] + index / this.rateBefore;
    }
    let lo = 0;
    let hi = this.totals.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.totals[mid] <= index) lo = mid;
      else hi = mid - 1;
    }
    const r0 = this.rates[lo];
    const s = this.slopes[lo];
    const d = index - this.totals[lo];
    if (r0 <= 0 && s <= 0) return null;
    // A ramp that starts at rate 0 has `0 / 0` here for the index sitting on
    // the boundary; it is born on the boundary, where `E` reaches it.
    if (d === 0) return this.boundaries[lo];
    // Extension 4.2: the STABLE inverse. With `s = 0` it is `2d / 2r0 = d / r0`
    // exactly (doubling is exact, and `sqrt(r0·r0) === r0` in IEEE 754), so the
    // 1st phase keeps every bit. The other root, `(−r0 + sqrt(…)) / s`, divides
    // by `s` and is forbidden.
    const disc = r0 * r0 + 2 * s * d;
    return this.boundaries[lo] + (2 * d) / (r0 + Math.sqrt(disc > 0 ? disc : 0));
  }

  private segmentAt(t: number): number {
    let lo = 0;
    let hi = this.boundaries.length - 1;
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1;
      if (this.boundaries[mid] <= t) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
}

/** The identity of one particle (extension 3.1) plus the instant it is born. */
export interface ParticleBirth {
  /** `0` = the continuous flow; `1 + b` = burst number `b`. */
  readonly flow: number;
  /** May be negative: `prewarm` lives on negative indices (extension 6). */
  readonly index: number;
  /** `t_i`, in skeleton time. Negative in prewarm and in previous laps. */
  readonly birth: number;
}

/**
 * What one call to `collectBirths` had to leave out, so the caller can say so
 * once instead of going quiet (extension 6, house rule 21).
 */
export interface BirthReport {
  /** Burst cycles the lap dropped because their instant fell outside `[0, D)`. */
  cyclesDropped: number;
  /** Which bursts, by their index in `bursts`. */
  burstsCut: number[];
}

/** A fresh, empty report. */
export function newBirthReport(): BirthReport {
  return { cyclesDropped: 0, burstsCut: [] };
}

/** What the loop of extension 6 needs to know about the animation being played. */
export interface EmissionWindow {
  /** The skeleton time being drawn (already wrapped, when the animation loops). */
  readonly time: number;
  /** `D`, the duration of the animation playing (spec 9.11). `0` = no animation. */
  readonly duration: number;
}

/**
 * Applies `explosiveness` then `randomness` to a continuous birth, in that
 * order (extension 4.4). Both are monotonic and pure: the tremor stays inside
 * the particle's own slot, so the order of births never changes.
 */
function shiftBirth(attachment: ParticleAttachment, curve: EmissionCurve, index: number, continuous: number): number {
  let t = continuous;
  const e = attachment.explosiveness;
  if (e > 0 && attachment.duration > 0) {
    const start = Math.floor(continuous / attachment.duration) * attachment.duration;
    t = start + (1 - e) * (continuous - start);
  }
  const r = attachment.randomness;
  if (r > 0) {
    const local = curve.rateAt(continuous);
    // No slot, no tremor: with a local rate of 0 there is nothing to shake.
    if (local > 0) t += r * particleRandom(attachment.seed, 0, index, PARTICLE_CHANNEL.RANDOMNESS) / local;
  }
  return t;
}

/**
 * Every birth that could still be alive at `window.time`, in no particular
 * order (extension 4 and 5, with the loop of extension 6).
 *
 * The window comes from `lifetime.max`, a field that is deliberately NOT
 * animable: with keys the window would mean walking a curve, and a Bézier
 * bulges (extension 5). `E` only picks candidates; the filter on `t_i` decides.
 */
export function collectBirths(
  attachment: ParticleAttachment, curve: EmissionCurve, window: EmissionWindow,
  out: ParticleBirth[] = [], report: BirthReport | null = null,
): ParticleBirth[] {
  const now = window.time;
  const lifeMax = attachment.lifetime[1];
  const oldest = now - lifeMax;
  const looping = attachment.looping && window.duration > 0;
  const duration = window.duration;
  let budget = CANDIDATE_CAP;

  const add = (flow: number, index: number, birth: number): void => {
    if (birth > now || birth <= oldest) return;
    // `Math.ceil` of a value a hair below zero gives `-0`, and `-0` is a
    // different index from `0` to anything that compares field by field.
    out.push({ flow, index: index === 0 ? 0 : index, birth: birth === 0 ? 0 : birth });
  };

  // --- the continuous flow --------------------------------------------------
  if (looping) {
    // Extension 6: one lap carries the indices `0 <= i < E(D)`, and the lap
    // behind is the same list with `t_i` moved by `−D`. The chance does NOT
    // include the lap number — if it did, `t` alone would not say which lap we
    // are on, and the function would stop being pure.
    const perLap = Math.ceil(curve.countAt(duration) - COUNT_EPSILON);
    if (perLap > 0) {
      const laps = Math.ceil((lifeMax + duration) / duration) + 1;
      for (let lap = 0; lap < laps && budget > 0; lap++) {
        const shift = lap * duration;
        for (let i = 0; i < perLap && budget > 0; i++) {
          budget--;
          const base = curve.timeOf(i);
          if (base === null) continue;
          add(0, i, shiftBirth(attachment, curve, i, base) - shift);
        }
      }
    }
  } else {
    // Extension 6: without the loop the births are the ones in `[−prewarm, t]`,
    // and `prewarm: 0` starts the emitter empty.
    const first = Math.ceil(curve.countAt(curve.origin - attachment.prewarm) - COUNT_EPSILON);
    const lo = Math.max(first, Math.ceil(curve.countAt(oldest)) - 1);
    const hi = Math.floor(curve.countAt(now)) + 1;
    for (let i = lo; i <= hi && budget > 0; i++) {
      budget--;
      const base = curve.timeOf(i);
      if (base === null) continue;
      add(0, i, shiftBirth(attachment, curve, i, base));
    }
  }

  // --- the bursts (extension 4.3) ------------------------------------------
  // `probability` is drawn PER PARTICLE, on channel 11, in the burst's own
  // flow. Half a probability does not mean exactly half the particles: case
  // P-007 gets 6 of 10, and a reader that rounds to 5 fails it.
  const lapsBack = looping ? Math.ceil((lifeMax + duration) / duration) + 1 : 1;
  for (let b = 0; b < attachment.bursts.length; b++) {
    const burst = attachment.bursts[b];
    const flow = 1 + b;
    // Extension 6: with the loop on, the lap carries ONLY the cycles whose
    // instant falls in `[0, D)` — zero CLOSED, `D` OPEN. A cycle landing
    // exactly on `D` is the first cycle of the NEXT lap, not the last of this
    // one, and counting it in both would duplicate it, which is the very
    // defect this cut exists to kill. Without the loop every cycle counts: it
    // is the loop that cuts, and with no loop there is no seam to hide.
    //
    // The instant is `startDelay + time + c·interval`, exactly as extension 4.3
    // writes it, and the cut of extension 6 uses the SAME expression.
    // `startDelay` belongs to the whole emitter, not to one flow: 9.1 defines
    // it as "births only from here on", and 6 fixes that a burst IS a birth.
    // Reading "birth" one way in 6 and another in 9.1 would be the same word
    // meaning two things in one document.
    const origin = curve.origin;
    const lastCycle = looping
      ? cyclesInLap(burst, origin, duration, report, b)
      : burst.cycles - 1;
    for (let lap = 0; lap < lapsBack && budget > 0; lap++) {
      const shift = looping ? lap * duration : 0;
      const base = origin + burst.time;
      const cLo = Math.max(0, Math.ceil((oldest - base + shift) / burst.interval - COUNT_EPSILON));
      const cHi = Math.min(lastCycle, Math.floor((now - base + shift) / burst.interval + COUNT_EPSILON));
      for (let c = cLo; c <= cHi && budget > 0; c++) {
        const birth = base + c * burst.interval - shift;
        for (let j = 0; j < burst.count && budget > 0; j++) {
          budget--;
          const index = c * burst.count + j;
          if (particleRandom(attachment.seed, flow, index, PARTICLE_CHANNEL.PROBABILITY) >= burst.probability) continue;
          add(flow, index, birth);
        }
      }
      if (!looping) break;
    }
  }

  return out;
}

/**
 * Last cycle index of a burst that still belongs to the lap (extension 6).
 *
 * `0 <= startDelay + time + c·interval < D`, with `D` OPEN. Returns `-1` when
 * not even the first cycle fits. Whatever is left over is counted into `report`, because a
 * reader that cuts in silence drops a cycle the author wrote and gives no sign
 * — and cutting without saying so is wrong for the same reason as not cutting
 * at all.
 */
function cyclesInLap(
  burst: ParticleAttachment['bursts'][number], origin: number, duration: number,
  report: BirthReport | null, index: number,
): number {
  const first = origin + burst.time;
  if (first < 0 || first >= duration) {
    if (report !== null) { report.cyclesDropped += burst.cycles; report.burstsCut.push(index); }
    return -1;
  }
  // The largest `c` with `startDelay + time + c·interval < D`.
  const limit = Math.ceil((duration - first) / burst.interval - COUNT_EPSILON) - 1;
  const last = Math.min(burst.cycles - 1, limit);
  if (report !== null && last < burst.cycles - 1) {
    report.cyclesDropped += burst.cycles - 1 - last;
    report.burstsCut.push(index);
  }
  return last;
}
