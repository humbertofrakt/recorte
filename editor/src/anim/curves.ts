/**
 * Curves of one key (spec 9.3): read, write, presets and sampling.
 *
 * Pure functions. No DOM, no document, no commands. The graph editor draws with
 * these, the properties panel labels a curve with these, and the tests pin the
 * numbers each preset produces.
 *
 * WHAT THE FORMAT STORES (spec 9.3)
 *
 *   "linear" | "stepped" | [cx1, cy1, cx2, cy2] x C
 *
 * `C` is the number of components of the value: 1 for a number, 4 for `color`,
 * 3 for `darkColor`, 1 for `deform` (one curve for every vertex). The four
 * numbers of a component are ABSOLUTE, not normalized: `cx` is in seconds, `cy`
 * is in the units of the value. Absolute is what lets a segment with
 * `v0 === v1` still bulge, which is how overshoot survives a round trip.
 *
 * Between key `k` at `(t0, v0)` and key `k+1` at `(t1, v1)`:
 *
 *   P0 = (t0, v0)   P1 = (cx1, cy1)   P2 = (cx2, cy2)   P3 = (t1, v1)
 *
 * The spec requires `t0 <= cx1 <= cx2 <= t1` and fixes a violation IN THIS
 * ORDER: `cx1 = clamp(cx1, t0, t1)` first, then `cx2 = clamp(cx2, cx1, t1)`.
 * `cy` is never clamped. That order is what keeps `x(s)` monotonic, so the
 * solve has exactly one root. `resolveCurve` below is the one place that does
 * it, and `clampControls` is the one place that states it.
 */

import type { CurveDef } from '../../../runtime/src/index.js';

// ---------------------------------------------------------------------------
// Shapes
// ---------------------------------------------------------------------------

export type CurveKindName = 'linear' | 'stepped' | 'bezier';

/** Absolute control points of one component: `cx` in seconds, `cy` in value units. */
export interface ControlPoints {
  cx1: number;
  cy1: number;
  cx2: number;
  cy2: number;
}

/**
 * Control points as fractions of the segment box, which is how a preset states
 * a shape: `x` runs 0..1 from `t0` to `t1`, `y` runs 0..1 from `v0` to `v1`.
 * `y` outside 0..1 is overshoot, and is legal.
 */
export interface UnitControlPoints {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** A curve read from one key, already split per component. */
export interface CurveShape {
  readonly kind: CurveKindName;
  /** One entry per component when `kind === 'bezier'`; empty otherwise. */
  readonly points: readonly ControlPoints[];
}

/** One sampled point of a curve, for drawing. */
export interface CurveSample {
  time: number;
  value: number;
}

export function linearShape(): CurveShape {
  return { kind: 'linear', points: [] };
}

export function steppedShape(): CurveShape {
  return { kind: 'stepped', points: [] };
}

function clamp(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

// ---------------------------------------------------------------------------
// Reading and writing the `curve` field of a key
// ---------------------------------------------------------------------------

/**
 * Reads `curve` exactly as the file has it, without the clamp.
 *
 * Falls back to `linear` on every problem the spec lists: an unknown string, a
 * value that is not a string or an array, a length other than `4 x components`,
 * or a non-finite number. Use `resolveCurve` when the numbers are going to be
 * sampled; use this one when the raw file numbers are what you want to show.
 */
export function readCurve(curve: CurveDef | undefined, components: number): CurveShape {
  if (curve === undefined || curve === 'linear') return linearShape();
  if (curve === 'stepped') return steppedShape();
  if (typeof curve === 'string') return linearShape();
  if (!Array.isArray(curve)) return linearShape();
  if (curve.length !== 4 * components) return linearShape();
  const points: ControlPoints[] = [];
  for (let j = 0; j < components; j++) {
    const base = j * 4;
    const cx1 = curve[base];
    const cy1 = curve[base + 1];
    const cx2 = curve[base + 2];
    const cy2 = curve[base + 3];
    if (!isFiniteNumber(cx1) || !isFiniteNumber(cy1) || !isFiniteNumber(cx2) || !isFiniteNumber(cy2)) {
      return linearShape();
    }
    points.push({ cx1, cy1, cx2, cy2 });
  }
  return { kind: 'bezier', points };
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/** The clamp of 9.3, in the order the spec fixes: `cx1` first, then `cx2`. */
export function clampControls(p: ControlPoints, t0: number, t1: number): ControlPoints {
  const cx1 = clamp(p.cx1, t0, t1);
  const cx2 = clamp(p.cx2, cx1, t1);
  return { cx1, cy1: p.cy1, cx2, cy2: p.cy2 };
}

/** Applies `clampControls` to every component. Non-bezier shapes pass through. */
export function clampShape(shape: CurveShape, t0: number, t1: number): CurveShape {
  if (shape.kind !== 'bezier') return shape;
  return { kind: 'bezier', points: shape.points.map((p) => clampControls(p, t0, t1)) };
}

/**
 * Reads and clamps in one step, the same way the runtime `normalizeCurve` does.
 *
 * `interpolable` is `false` for booleans, strings, `null` and objects: those are
 * always stepped, whatever the file says.
 */
export function resolveCurve(
  curve: CurveDef | undefined,
  components: number,
  interpolable: boolean,
  t0: number,
  t1: number,
): CurveShape {
  if (!interpolable) return steppedShape();
  return clampShape(readCurve(curve, components), t0, t1);
}

/** Turns a shape back into the `curve` field of a key. */
export function writeCurve(shape: CurveShape): CurveDef {
  if (shape.kind === 'stepped') return 'stepped';
  if (shape.kind === 'linear') return 'linear';
  const flat: number[] = [];
  for (const p of shape.points) flat.push(p.cx1, p.cy1, p.cx2, p.cy2);
  return flat;
}

/**
 * `true` when the shape is the format default, so the writer may drop the field
 * from the key instead of writing `"linear"`.
 */
export function isDefaultCurve(shape: CurveShape): boolean {
  return shape.kind === 'linear';
}

/** Name of the kind, in Portuguese, for a label. */
export function curveKindLabel(shape: CurveShape): string {
  // "Parada", como no menu da chave — rodada 40, lote 1. Um nome por coisa.
  if (shape.kind === 'stepped') return 'Parada';
  if (shape.kind === 'linear') return 'Linear';
  return 'Curva';
}

// ---------------------------------------------------------------------------
// Absolute <-> unit, and per-component <-> single curve
// ---------------------------------------------------------------------------

/**
 * Absolute control points as fractions of the segment box.
 *
 * A segment with `t1 === t0` has no width and one with `v1 === v0` has no
 * height; those directions collapse to 0 and the shape cannot be recovered from
 * the unit form. That is why the file stores absolute numbers, and why the unit
 * form is only ever used to state a preset or to compare two components.
 */
export function toUnit(
  p: ControlPoints, t0: number, v0: number, t1: number, v1: number,
): UnitControlPoints {
  const dt = t1 - t0;
  const dv = v1 - v0;
  const x = (cx: number): number => (dt === 0 ? 0 : (cx - t0) / dt);
  const y = (cy: number): number => (dv === 0 ? 0 : (cy - v0) / dv);
  return { x1: x(p.cx1), y1: y(p.cy1), x2: x(p.cx2), y2: y(p.cy2) };
}

/** The reverse of `toUnit`. */
export function toAbsolute(
  u: UnitControlPoints, t0: number, v0: number, t1: number, v1: number,
): ControlPoints {
  const dt = t1 - t0;
  const dv = v1 - v0;
  return {
    cx1: t0 + u.x1 * dt,
    cy1: v0 + u.y1 * dv,
    cx2: t0 + u.x2 * dt,
    cy2: v0 + u.y2 * dv,
  };
}

/**
 * One unit curve spread over every component, each with its own value range.
 *
 * This is the "single curve" the editor offers when the user does not want to
 * shape red, green, blue and alpha one by one: the same feel, four sets of
 * absolute numbers, because each component travels a different distance.
 */
export function expandCurve(
  unit: UnitControlPoints,
  t0: number,
  t1: number,
  values0: readonly number[],
  values1: readonly number[],
): CurveShape {
  const count = Math.max(values0.length, values1.length);
  const points: ControlPoints[] = [];
  for (let j = 0; j < count; j++) {
    points.push(toAbsolute(unit, t0, values0[j] ?? 0, t1, values1[j] ?? 0));
  }
  return { kind: 'bezier', points };
}

/**
 * The single unit curve every component shares, or `null` when they differ.
 *
 * A component that does not move (`v1 === v0`) carries no `y` information, so it
 * is compared on `x` only and never blocks the match.
 */
export function collapseCurve(
  shape: CurveShape,
  t0: number,
  t1: number,
  values0: readonly number[],
  values1: readonly number[],
  epsilon = 1e-6,
): UnitControlPoints | null {
  if (shape.kind !== 'bezier' || shape.points.length === 0) return null;
  let found: UnitControlPoints | null = null;
  let foundHasY = false;
  for (let j = 0; j < shape.points.length; j++) {
    const p = shape.points[j];
    if (p === undefined) return null;
    const v0 = values0[j] ?? 0;
    const v1 = values1[j] ?? 0;
    const unit = toUnit(p, t0, v0, t1, v1);
    const hasY = v1 !== v0;
    if (found === null) {
      found = unit;
      foundHasY = hasY;
      continue;
    }
    if (Math.abs(unit.x1 - found.x1) > epsilon || Math.abs(unit.x2 - found.x2) > epsilon) return null;
    if (hasY && foundHasY) {
      if (Math.abs(unit.y1 - found.y1) > epsilon || Math.abs(unit.y2 - found.y2) > epsilon) return null;
    } else if (hasY && !foundHasY) {
      found = { x1: found.x1, y1: unit.y1, x2: found.x2, y2: unit.y2 };
      foundHasY = true;
    }
  }
  return found;
}

// ---------------------------------------------------------------------------
// Turning a straight line into handles the user can grab
// ---------------------------------------------------------------------------

/**
 * The unit points that make a cubic trace its own chord.
 *
 * With `P1 = P0 + (P3 - P0) / 3` and `P2 = P0 + 2 (P3 - P0) / 3` the cubic is
 * the straight line, exactly, at every `s`. So this is the shape a `linear`
 * segment must take the moment the user grabs a handle: the drawing does not
 * move, and from then on there is something to drag.
 */
export const LINEAR_UNIT: UnitControlPoints = Object.freeze({
  x1: 1 / 3, y1: 1 / 3, x2: 2 / 3, y2: 2 / 3,
});

/**
 * The same segment written as a bezier, whatever it was before.
 *
 * `bezier` comes back untouched. `linear` becomes the chord written as handles
 * (`LINEAR_UNIT`), which looks identical. `stepped` has no handles at all, so
 * it becomes the chord too: grabbing a handle on a step is a request to stop
 * being a step. The graph editor calls this before every handle drag.
 */
export function toBezier(
  shape: CurveShape,
  t0: number,
  t1: number,
  values0: readonly number[],
  values1: readonly number[],
): CurveShape {
  if (shape.kind === 'bezier' && shape.points.length > 0) return shape;
  return expandCurve(LINEAR_UNIT, t0, t1, values0, values1);
}

/**
 * The same shape with component `j` replaced. Everything else is kept, so
 * shaping red does not disturb green, blue and alpha.
 *
 * A shape that is not a bezier, or one too short to hold `j`, comes back
 * unchanged: run `toBezier` first.
 */
export function withPoint(shape: CurveShape, j: number, point: ControlPoints): CurveShape {
  if (shape.kind !== 'bezier') return shape;
  if (j < 0 || j >= shape.points.length) return shape;
  const points = shape.points.map((p, index) => (index === j ? point : p));
  return { kind: 'bezier', points };
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

/**
 * A named shape, in unit coordinates.
 *
 * Every preset keeps `0 <= x1 <= x2 <= 1`, so applying one never trips the
 * clamp of 9.3 and what the user picked is what the file stores. `y` outside
 * 0..1 is deliberate: that is the overshoot of "Passa do alvo" and
 * "Recua e passa".
 *
 * The names matter. These two used to be called "Salto" and "Elástico", which
 * is what the industry calls two OTHER curves: a real bounce settles in
 * several decaying hops, and a real elastic oscillates. Neither fits in one
 * Bezier segment — the spec itself says they "become several keys" — so
 * calling them that sent an animator coming from Spine to the wrong button.
 * These two are what they say they are: overshoot ("back out") and
 * anticipation ("back in-out"), inside a single segment. Real bounce and real
 * elastic are a job for a key generator; they are noted in ESTADO.md.
 */
export interface CurvePreset {
  readonly id: string;
  /** Shown on the button, in Portuguese. */
  readonly label: string;
  /** One short line explaining the movement, for the tooltip. */
  readonly hint: string;
  readonly kind: CurveKindName;
  /** `null` for `linear` and `stepped`. */
  readonly unit: UnitControlPoints | null;
}

export const CURVE_PRESETS: readonly CurvePreset[] = Object.freeze([
  {
    id: 'suave',
    label: 'Suave',
    hint: 'Começa devagar e termina devagar.',
    kind: 'bezier',
    unit: { x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
  },
  {
    id: 'entrada-suave',
    label: 'Entrada suave',
    hint: 'Começa devagar e termina rápido.',
    kind: 'bezier',
    unit: { x1: 0.42, y1: 0, x2: 1, y2: 1 },
  },
  {
    id: 'saida-suave',
    label: 'Saída suave',
    hint: 'Começa rápido e termina devagar.',
    kind: 'bezier',
    unit: { x1: 0, y1: 0, x2: 0.58, y2: 1 },
  },
  {
    id: 'linear',
    label: 'Linear',
    hint: 'Reta entre as duas chaves.',
    kind: 'linear',
    unit: null,
  },
  {
    // O id fica (arquivos de teste e chamadas o usam); o NOME é o do menu da
    // chave — rodada 40, lote 1: "se é Parada no menu, é Parada no gráfico".
    id: 'degrau',
    label: 'Parada',
    hint: 'Segura o valor até a próxima chave. Sem meio-termo.',
    kind: 'stepped',
    unit: null,
  },
  {
    id: 'salto',
    label: 'Passa do alvo',
    hint: 'Passa um pouco do valor da próxima chave e volta a ele, como um elástico.',
    kind: 'bezier',
    unit: { x1: 0.34, y1: 1.56, x2: 0.64, y2: 1 },
  },
  {
    id: 'elastico',
    label: 'Recua e passa',
    hint: 'Recua um pouco antes de sair, passa do alvo e volta: bom para um golpe ou um pulo.',
    kind: 'bezier',
    unit: { x1: 0.25, y1: -0.6, x2: 0.75, y2: 1.6 },
  },
] as const satisfies readonly CurvePreset[]);

export function findPreset(id: string): CurvePreset | null {
  return CURVE_PRESETS.find((preset) => preset.id === id) ?? null;
}

/**
 * A dica de um botão de formato — rodada 40, lote 1.
 *
 * Apagado, ele diz por quê (regra 21). A dica do formato termina em ponto, e a
 * frase do porquê era colada depois de outro ponto: saía *"devagar.. Primeiro"*
 * nas sete. Aqui o ponto final da dica é trocado, nunca somado.
 */
export function presetButtonHint(preset: CurvePreset, ready: boolean): string {
  if (ready) return preset.hint;
  return `${preset.hint.replace(/\.\s*$/, '')}. Primeiro escolha uma chave: clique num ponto do gráfico, ou numa chave da linha do tempo`;
}

/** The shape a preset produces for one segment, over every component. */
export function presetShape(
  preset: CurvePreset,
  t0: number,
  t1: number,
  values0: readonly number[],
  values1: readonly number[],
): CurveShape {
  if (preset.kind === 'linear' || preset.unit === null) {
    return preset.kind === 'stepped' ? steppedShape() : linearShape();
  }
  return expandCurve(preset.unit, t0, t1, values0, values1);
}

/** The `curve` field a preset produces, ready to write into a key. */
export function presetCurve(
  preset: CurvePreset,
  t0: number,
  t1: number,
  values0: readonly number[],
  values1: readonly number[],
): CurveDef {
  return writeCurve(presetShape(preset, t0, t1, values0, values1));
}

/**
 * The preset a shape came from, or `null` when the user has dragged a handle
 * away from every preset. Used to light up the button that is in effect.
 */
export function matchPreset(
  shape: CurveShape,
  t0: number,
  t1: number,
  values0: readonly number[],
  values1: readonly number[],
  epsilon = 1e-6,
): CurvePreset | null {
  if (shape.kind === 'stepped') return findPreset('degrau');
  if (shape.kind === 'linear') return findPreset('linear');
  const unit = collapseCurve(shape, t0, t1, values0, values1, epsilon);
  if (unit === null) return null;
  for (const preset of CURVE_PRESETS) {
    const target = preset.unit;
    if (target === null) continue;
    if (Math.abs(unit.x1 - target.x1) <= epsilon
      && Math.abs(unit.y1 - target.y1) <= epsilon
      && Math.abs(unit.x2 - target.x2) <= epsilon
      && Math.abs(unit.y2 - target.y2) <= epsilon) {
      return preset;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Sampling
// ---------------------------------------------------------------------------

/**
 * Solves `x(s) = t` for the cubic with `x(0) = t0` and `x(1) = t1`.
 *
 * `x` is monotonic because the clamp guarantees `t0 <= cx1 <= cx2 <= t1`, so
 * there is exactly one root. Newton, kept inside a bracket by bisection, to
 * `1e-6 x (t1 - t0)` — the tolerance the spec names.
 */
export function solveParameter(
  t0: number, cx1: number, cx2: number, t1: number, t: number,
): number {
  const span = t1 - t0;
  if (span <= 0) return 0;
  if (t <= t0) return 0;
  if (t >= t1) return 1;
  // The stop condition is on `s`, not on `x` (spec 9.3). Stopping on `x`
  // lets the error reach the value multiplied by |v'(s)| / |x'(s)|, a ratio
  // with no upper bound. Same loop as the runtime's `solveBezierParameter`.
  const epsilon = 1e-12;
  let s = (t - t0) / span;
  let low = 0;
  let high = 1;
  for (let i = 0; i < 64; i++) {
    const u = 1 - s;
    const x = u * u * u * t0 + 3 * u * u * s * cx1 + 3 * u * s * s * cx2 + s * s * s * t1;
    const error = x - t;
    if (error === 0) return s;
    if (error > 0) high = s;
    else low = s;
    if (high - low <= epsilon) break;
    const dx = 3 * u * u * (cx1 - t0) + 6 * u * s * (cx2 - cx1) + 3 * s * s * (t1 - cx2);
    let next = dx > 1e-12 ? s - error / dx : (low + high) / 2;
    if (next <= low || next >= high) next = (low + high) / 2;
    if (Math.abs(next - s) <= epsilon) { s = next; break; }
    s = next;
  }
  return clamp(s, 0, 1);
}

/**
 * Value of component `j` at time `t`, the sampling of 9.3.
 *
 * Pass a shape that has already been through `resolveCurve` or `clampShape`:
 * unclamped control points would make `x(s)` fold back on itself.
 */
export function valueOnCurve(
  shape: CurveShape,
  j: number,
  t0: number, v0: number,
  t1: number, v1: number,
  t: number,
): number {
  if (shape.kind === 'stepped') return v0;
  const p = shape.points[j];
  if (shape.kind === 'linear' || p === undefined) {
    if (t1 === t0) return v0;
    return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
  }
  const s = solveParameter(t0, p.cx1, p.cx2, t1, t);
  const u = 1 - s;
  return u * u * u * v0 + 3 * u * u * s * p.cy1 + 3 * u * s * s * p.cy2 + s * s * s * v1;
}

/**
 * A polyline that follows the segment, for drawing.
 *
 * The bezier is walked in `s`, not in `t`, so the fast part of the curve gets
 * the same number of points as the slow part and the drawing has no corners.
 * `stepped` returns the two corners of the step, so the riser is visible.
 */
export function samplePolyline(
  shape: CurveShape,
  j: number,
  t0: number, v0: number,
  t1: number, v1: number,
  steps = 32,
): CurveSample[] {
  if (shape.kind === 'stepped') {
    return [{ time: t0, value: v0 }, { time: t1, value: v0 }, { time: t1, value: v1 }];
  }
  const p = shape.points[j];
  if (shape.kind === 'linear' || p === undefined) {
    return [{ time: t0, value: v0 }, { time: t1, value: v1 }];
  }
  const count = Math.max(2, Math.floor(steps));
  const out: CurveSample[] = [];
  for (let i = 0; i <= count; i++) {
    const s = i / count;
    const u = 1 - s;
    const time = u * u * u * t0 + 3 * u * u * s * p.cx1 + 3 * u * s * s * p.cx2 + s * s * s * t1;
    const value = u * u * u * v0 + 3 * u * u * s * p.cy1 + 3 * u * s * s * p.cy2 + s * s * s * v1;
    out.push({ time, value });
  }
  return out;
}

/**
 * Lowest and highest value the segment reaches, endpoints included.
 *
 * This is what the "Ajustar" button needs: a curve that overshoots leaves the
 * box drawn by its two keys, and the vertical scale has to make room for it.
 */
export function curveExtent(
  shape: CurveShape,
  j: number,
  t0: number, v0: number,
  t1: number, v1: number,
  steps = 32,
): { min: number; max: number } {
  let min = Math.min(v0, v1);
  let max = Math.max(v0, v1);
  for (const sample of samplePolyline(shape, j, t0, v0, t1, v1, steps)) {
    if (sample.value < min) min = sample.value;
    if (sample.value > max) max = sample.value;
  }
  return { min, max };
}
