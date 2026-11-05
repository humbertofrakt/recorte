/**
 * Tests of `src/anim/curves.ts` — the curve of one key (spec 9.3).
 *
 * No DOM here: everything under test is a pure function. The two things worth
 * pinning are the exact numbers each preset produces (hand-computed in the
 * comments, so a change of preset shows up as a changed test, not as a silent
 * change of feel) and agreement with the runtime, which is the normative
 * sampler every game will use.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { normalizeCurve, sampleCurve } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
// Defeito 3 (19/09/2026): chavear no meio de um trecho reparte a curva.
import { setKey, valueAt } from '../src/anim/keying.js';
import { keyDropTime, pastSlop } from '../src/panels/graph.js';
import { snapToFrame } from '../src/panels/dopesheet.js';
import {
  CURVE_PRESETS,
  LINEAR_UNIT,
  clampControls,
  clampShape,
  collapseCurve,
  curveExtent,
  curveKindLabel,
  expandCurve,
  findPreset,
  isDefaultCurve,
  linearShape,
  matchPreset,
  presetCurve,
  presetShape,
  readCurve,
  resolveCurve,
  samplePolyline,
  solveParameter,
  steppedShape,
  toAbsolute,
  toBezier,
  toUnit,
  valueOnCurve,
  withPoint,
  writeCurve,
  type ControlPoints,
  type CurveShape,
} from '../src/anim/curves.js';

/** Shorthand: the four numbers of component `j`, as an array. */
function flat(shape: CurveShape, j = 0): number[] {
  const p = shape.points[j] as ControlPoints;
  return [p.cx1, p.cy1, p.cx2, p.cy2];
}

function preset(id: string) {
  const found = findPreset(id);
  expect(found, `preset ${id}`).not.toBeNull();
  return found!;
}

// ---------------------------------------------------------------------------
// Reading and writing
// ---------------------------------------------------------------------------

describe('readCurve', () => {
  it('reads the two strings and the absent field', () => {
    expect(readCurve(undefined, 1).kind).toBe('linear');
    expect(readCurve('linear', 1).kind).toBe('linear');
    expect(readCurve('stepped', 1).kind).toBe('stepped');
  });

  it('falls back to linear on an unknown string (spec 2.5)', () => {
    expect(readCurve('easeInOutQuint', 1).kind).toBe('linear');
  });

  it('falls back to linear when the length is not 4 x C', () => {
    // 4 numbers, but the value has 4 components: 16 were needed.
    expect(readCurve([0, 0, 1, 1], 4).kind).toBe('linear');
    expect(readCurve([0, 0, 1], 1).kind).toBe('linear');
  });

  it('falls back to linear on a non-finite number', () => {
    expect(readCurve([0, 0, Number.NaN, 1], 1).kind).toBe('linear');
    expect(readCurve([0, 0, Number.POSITIVE_INFINITY, 1], 1).kind).toBe('linear');
  });

  it('splits 4 x C numbers into one entry per component', () => {
    const shape = readCurve([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 3);
    expect(shape.kind).toBe('bezier');
    expect(shape.points).toHaveLength(3);
    expect(flat(shape, 0)).toEqual([0, 1, 2, 3]);
    expect(flat(shape, 1)).toEqual([4, 5, 6, 7]);
    expect(flat(shape, 2)).toEqual([8, 9, 10, 11]);
  });
});

describe('writeCurve', () => {
  it('round-trips a bezier through the file form', () => {
    const numbers = [0.1, 2, 0.4, 8, 0.2, 3, 0.5, 9];
    const shape = readCurve(numbers, 2);
    expect(writeCurve(shape)).toEqual(numbers);
    expect(readCurve(writeCurve(shape), 2)).toEqual(shape);
  });

  it('writes the two strings back', () => {
    expect(writeCurve(linearShape())).toBe('linear');
    expect(writeCurve(steppedShape())).toBe('stepped');
  });

  it('names the default so the writer can drop the field', () => {
    expect(isDefaultCurve(linearShape())).toBe(true);
    expect(isDefaultCurve(steppedShape())).toBe(false);
    expect(isDefaultCurve(readCurve([0, 0, 1, 1], 1))).toBe(false);
  });

  it('labels the kind in Portuguese', () => {
    expect(curveKindLabel(linearShape())).toBe('Linear');
    // Rodada 40, lote 1: "Parada", como no menu da chave.
    expect(curveKindLabel(steppedShape())).toBe('Parada');
    expect(curveKindLabel(readCurve([0, 0, 1, 1], 1))).toBe('Curva');
  });
});

// ---------------------------------------------------------------------------
// The clamp of 9.3, in the order the spec fixes
// ---------------------------------------------------------------------------

describe('clamp of cx1 and cx2 (spec 9.3)', () => {
  it('clamps cx1 into [t0, t1] first', () => {
    // t0 = 1, t1 = 2. cx1 = -5 -> 1. cx2 = 1.5 stays.
    expect(clampControls({ cx1: -5, cy1: 7, cx2: 1.5, cy2: 9 }, 1, 2))
      .toEqual({ cx1: 1, cy1: 7, cx2: 1.5, cy2: 9 });
  });

  it('clamps cx2 into [cx1, t1], using the ALREADY clamped cx1', () => {
    // t0 = 0, t1 = 1. cx1 = 0.8 stays. cx2 = 0.2 < cx1 -> 0.8, not 0.2.
    expect(clampControls({ cx1: 0.8, cy1: 0, cx2: 0.2, cy2: 1 }, 0, 1))
      .toEqual({ cx1: 0.8, cy1: 0, cx2: 0.8, cy2: 1 });
  });

  it('the order matters: cx1 pushed up drags cx2 up with it', () => {
    // cx1 = -3 -> clamped to t0 = 0. cx2 = -1 -> clamp(-1, 0, 1) = 0.
    // Clamping cx2 against the RAW cx1 = -3 would have left cx2 = -1.
    expect(clampControls({ cx1: -3, cy1: 0, cx2: -1, cy2: 1 }, 0, 1))
      .toEqual({ cx1: 0, cy1: 0, cx2: 0, cy2: 1 });
  });

  it('never clamps cy, so overshoot survives', () => {
    const out = clampControls({ cx1: 0.3, cy1: -40, cx2: 0.7, cy2: 250 }, 0, 1);
    expect(out.cy1).toBe(-40);
    expect(out.cy2).toBe(250);
  });

  it('clamps every component of a multi-component curve', () => {
    const shape = clampShape(readCurve([-1, 0, 5, 1, 0.9, 0, 0.1, 1], 2), 0, 1);
    expect(flat(shape, 0)).toEqual([0, 0, 1, 1]);
    expect(flat(shape, 1)).toEqual([0.9, 0, 0.9, 1]);
  });

  it('matches the runtime normalizeCurve number for number', () => {
    const numbers = [-1, 3, 5, 4, 0.9, 3, 0.1, 4];
    const mine = clampShape(readCurve(numbers, 2), 0, 1);
    const theirs = normalizeCurve(numbers, 2, true, 0, 1);
    expect(theirs.controls).not.toBeNull();
    expect([...flat(mine, 0), ...flat(mine, 1)]).toEqual([...(theirs.controls!)]);
  });

  it('a non-interpolable value is always stepped', () => {
    expect(resolveCurve([0, 0, 1, 1], 1, false, 0, 1).kind).toBe('stepped');
    expect(normalizeCurve([0, 0, 1, 1], 1, false, 0, 1).kind).toBe('stepped');
  });
});

// ---------------------------------------------------------------------------
// Presets: the numbers, computed by hand
// ---------------------------------------------------------------------------

describe('presets', () => {
  it('every preset keeps 0 <= x1 <= x2 <= 1, so the clamp never fires', () => {
    for (const p of CURVE_PRESETS) {
      if (p.unit === null) continue;
      expect(p.unit.x1, p.id).toBeGreaterThanOrEqual(0);
      expect(p.unit.x2, p.id).toBeGreaterThanOrEqual(p.unit.x1);
      expect(p.unit.x2, p.id).toBeLessThanOrEqual(1);
    }
  });

  it('every preset has a written label, never an icon alone', () => {
    for (const p of CURVE_PRESETS) {
      expect(p.label.length, p.id).toBeGreaterThan(0);
      expect(p.hint.length, p.id).toBeGreaterThan(0);
    }
  });

  it('the seven presets are the ones the panel offers', () => {
    expect(CURVE_PRESETS.map((p) => p.label)).toEqual([
      'Suave', 'Entrada suave', 'Saída suave', 'Linear', 'Parada',
      'Passa do alvo', 'Recua e passa',
    ]);
  });

  // Segment: t0 = 0, t1 = 1, v0 = 0, v1 = 10. So dt = 1 and dv = 10, and
  // cx = 0 + x * 1 = x, cy = 0 + y * 10 = 10y. Every number below is that.
  const t0 = 0;
  const t1 = 1;
  const v0 = [0];
  const v1 = [10];

  it('Suave = ease in-out (0.42, 0, 0.58, 1)', () => {
    // cx1 = 0.42, cy1 = 10 * 0 = 0, cx2 = 0.58, cy2 = 10 * 1 = 10.
    expect(presetCurve(preset('suave'), t0, t1, v0, v1)).toEqual([0.42, 0, 0.58, 10]);
  });

  it('Entrada suave = ease in (0.42, 0, 1, 1)', () => {
    // cx1 = 0.42, cy1 = 0, cx2 = 1, cy2 = 10.
    expect(presetCurve(preset('entrada-suave'), t0, t1, v0, v1)).toEqual([0.42, 0, 1, 10]);
  });

  it('Saída suave = ease out (0, 0, 0.58, 1)', () => {
    // cx1 = 0, cy1 = 0, cx2 = 0.58, cy2 = 10.
    expect(presetCurve(preset('saida-suave'), t0, t1, v0, v1)).toEqual([0, 0, 0.58, 10]);
  });

  it('Linear and Degrau write the strings, not numbers', () => {
    expect(presetCurve(preset('linear'), t0, t1, v0, v1)).toBe('linear');
    expect(presetCurve(preset('degrau'), t0, t1, v0, v1)).toBe('stepped');
  });

  it('"Passa do alvo" overshoots: y1 = 1.56 means 15.6 on a travel of 10', () => {
    // cx1 = 0.34, cy1 = 10 * 1.56 = 15.6, cx2 = 0.64, cy2 = 10 * 1 = 10.
    const numbers = presetCurve(preset('salto'), t0, t1, v0, v1) as number[];
    expect(numbers[0]).toBeCloseTo(0.34, 12);
    expect(numbers[1]).toBeCloseTo(15.6, 12);
    expect(numbers[2]).toBeCloseTo(0.64, 12);
    expect(numbers[3]).toBeCloseTo(10, 12);
  });

  it('"Recua e passa" pulls back first: y1 = -0.6 means -6 on a travel of 10', () => {
    // cx1 = 0.25, cy1 = 10 * -0.6 = -6, cx2 = 0.75, cy2 = 10 * 1.6 = 16.
    const numbers = presetCurve(preset('elastico'), t0, t1, v0, v1) as number[];
    expect(numbers[0]).toBeCloseTo(0.25, 12);
    expect(numbers[1]).toBeCloseTo(-6, 12);
    expect(numbers[2]).toBeCloseTo(0.75, 12);
    expect(numbers[3]).toBeCloseTo(16, 12);
  });

  it('a segment that does not start at zero shifts, it does not rescale x', () => {
    // t0 = 0.5, t1 = 1.5 -> dt = 1. v0 = 20, v1 = 30 -> dv = 10.
    // Suave: cx1 = 0.5 + 0.42 = 0.92, cy1 = 20 + 0 = 20,
    //        cx2 = 0.5 + 0.58 = 1.08, cy2 = 20 + 10 = 30.
    const numbers = presetCurve(preset('suave'), 0.5, 1.5, [20], [30]) as number[];
    expect(numbers[0]).toBeCloseTo(0.92, 12);
    expect(numbers[1]).toBeCloseTo(20, 12);
    expect(numbers[2]).toBeCloseTo(1.08, 12);
    expect(numbers[3]).toBeCloseTo(30, 12);
  });

  it('a falling segment mirrors y: v0 = 100, v1 = 0 gives cy1 = 100', () => {
    // dv = -100. Suave: cy1 = 100 + 0 * -100 = 100, cy2 = 100 + 1 * -100 = 0.
    expect(presetCurve(preset('suave'), 0, 1, [100], [0])).toEqual([0.42, 100, 0.58, 0]);
  });

  it('a preset over four components writes 16 numbers, one range each', () => {
    // color: r 0 -> 1, g 0 -> 0.5, b 1 -> 1 (still), a 1 -> 0.
    const numbers = presetCurve(preset('suave'), 0, 2, [0, 0, 1, 1], [1, 0.5, 1, 0]) as number[];
    expect(numbers).toHaveLength(16);
    // dt = 2, so cx1 = 0 + 0.42 * 2 = 0.84 and cx2 = 0 + 0.58 * 2 = 1.16 on all four.
    for (let j = 0; j < 4; j++) {
      expect(numbers[j * 4]).toBeCloseTo(0.84, 12);
      expect(numbers[j * 4 + 2]).toBeCloseTo(1.16, 12);
    }
    expect(numbers[1]).toBeCloseTo(0, 12);   // r: cy1 = 0 + 0 * 1
    expect(numbers[3]).toBeCloseTo(1, 12);   // r: cy2 = 0 + 1 * 1
    expect(numbers[7]).toBeCloseTo(0.5, 12); // g: cy2 = 0 + 1 * 0.5
    expect(numbers[9]).toBeCloseTo(1, 12);   // b: no travel, cy1 = cy2 = 1
    expect(numbers[11]).toBeCloseTo(1, 12);
    expect(numbers[13]).toBeCloseTo(1, 12);  // a: cy1 = 1 + 0 * -1
    expect(numbers[15]).toBeCloseTo(0, 12);  // a: cy2 = 1 + 1 * -1
  });

  it('matchPreset finds the preset a shape came from', () => {
    for (const p of CURVE_PRESETS) {
      const shape = presetShape(p, 0.5, 1.5, [20], [30]);
      expect(matchPreset(shape, 0.5, 1.5, [20], [30])?.id, p.id).toBe(p.id);
    }
  });

  it('matchPreset returns null once a handle is dragged away', () => {
    const shape = readCurve([0.11, 0, 0.58, 10], 1);
    expect(matchPreset(shape, 0, 1, [0], [10])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Per-component curve <-> single curve
// ---------------------------------------------------------------------------

describe('per-component and single curve', () => {
  it('unit and absolute are inverses', () => {
    const unit = { x1: 0.3, y1: -0.2, x2: 0.8, y2: 1.4 };
    const abs = toAbsolute(unit, 2, 50, 6, 90);
    // dt = 4, dv = 40: cx1 = 2 + 1.2 = 3.2, cy1 = 50 - 8 = 42,
    //                  cx2 = 2 + 3.2 = 5.2, cy2 = 50 + 56 = 106.
    expect(abs.cx1).toBeCloseTo(3.2, 12);
    expect(abs.cy1).toBeCloseTo(42, 12);
    expect(abs.cx2).toBeCloseTo(5.2, 12);
    expect(abs.cy2).toBeCloseTo(106, 12);
    const back = toUnit(abs, 2, 50, 6, 90);
    expect(back.x1).toBeCloseTo(unit.x1, 12);
    expect(back.y1).toBeCloseTo(unit.y1, 12);
    expect(back.x2).toBeCloseTo(unit.x2, 12);
    expect(back.y2).toBeCloseTo(unit.y2, 12);
  });

  it('a segment with no travel collapses y to zero, which is why the file is absolute', () => {
    const unit = toUnit({ cx1: 0.2, cy1: 5, cx2: 0.8, cy2: 5 }, 0, 5, 1, 5);
    expect(unit.y1).toBe(0);
    expect(unit.y2).toBe(0);
    expect(unit.x1).toBeCloseTo(0.2, 12);
  });

  it('expand then collapse gives the single curve back', () => {
    const unit = { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
    const shape = expandCurve(unit, 0, 1, [0, 10, -4], [10, 30, 6]);
    const back = collapseCurve(shape, 0, 1, [0, 10, -4], [10, 30, 6]);
    expect(back).not.toBeNull();
    expect(back!.x1).toBeCloseTo(0.42, 12);
    expect(back!.y1).toBeCloseTo(0, 12);
    expect(back!.x2).toBeCloseTo(0.58, 12);
    expect(back!.y2).toBeCloseTo(1, 12);
  });

  it('collapse returns null when one component was shaped on its own', () => {
    const shape = readCurve([0.42, 0, 0.58, 10, 0.10, 10, 0.90, 30], 2);
    expect(collapseCurve(shape, 0, 1, [0, 10], [10, 30])).toBeNull();
  });

  it('a component that does not travel does not block the match', () => {
    // Second component stays at 1, so its cy carries no shape. x still agrees.
    const shape = readCurve([0.42, 0, 0.58, 10, 0.42, 1, 0.58, 1], 2);
    const back = collapseCurve(shape, 0, 1, [0, 1], [10, 1]);
    expect(back).not.toBeNull();
    expect(back!.y2).toBeCloseTo(1, 12);
  });

  it('collapse of linear or stepped is null: there is nothing to share', () => {
    expect(collapseCurve(linearShape(), 0, 1, [0], [1])).toBeNull();
    expect(collapseCurve(steppedShape(), 0, 1, [0], [1])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Handles for a segment that had none
// ---------------------------------------------------------------------------

describe('toBezier and withPoint', () => {
  it('a straight line becomes handles at one third and two thirds', () => {
    // t0 = 0, t1 = 3 -> dt = 3: cx1 = 1, cx2 = 2.
    // v0 = 0, v1 = 90 -> dv = 90: cy1 = 30, cy2 = 60.
    const shape = toBezier(linearShape(), 0, 3, [0], [90]);
    expect(shape.kind).toBe('bezier');
    expect(flat(shape)).toEqual([1, 30, 2, 60]);
  });

  it('those handles trace the straight line, so the drawing does not move', () => {
    const straight = toBezier(linearShape(), 0, 3, [0], [90]);
    for (let i = 0; i <= 10; i++) {
      const t = (3 * i) / 10;
      expect(valueOnCurve(straight, 0, 0, 0, 3, 90, t))
        .toBeCloseTo(valueOnCurve(linearShape(), 0, 0, 0, 3, 90, t), 6);
    }
  });

  it('a step also becomes the chord: grabbing a handle ends the step', () => {
    expect(flat(toBezier(steppedShape(), 0, 3, [0], [90]))).toEqual([1, 30, 2, 60]);
  });

  it('a curve that already has handles comes back untouched', () => {
    const shape = readCurve([0.42, 0, 0.58, 10], 1);
    expect(toBezier(shape, 0, 1, [0], [10])).toBe(shape);
  });

  it('a straight line over four components gets four sets of handles', () => {
    const shape = toBezier(linearShape(), 0, 3, [0, 0, 1, 1], [1, 0.5, 1, 0]);
    expect(shape.points).toHaveLength(4);
    expect(writeCurve(shape)).toHaveLength(16);
  });

  it('withPoint changes one component and leaves the others alone', () => {
    const shape = readCurve([0.42, 0, 0.58, 10, 0.42, 1, 0.58, 5], 2);
    const out = withPoint(shape, 1, { cx1: 0.1, cy1: 9, cx2: 0.9, cy2: 3 });
    expect(flat(out, 0)).toEqual([0.42, 0, 0.58, 10]);
    expect(flat(out, 1)).toEqual([0.1, 9, 0.9, 3]);
    // The original is untouched: these are values, not something to mutate.
    expect(flat(shape, 1)).toEqual([0.42, 1, 0.58, 5]);
  });

  it('withPoint does nothing on a shape with no handles or a missing component', () => {
    const point = { cx1: 0, cy1: 0, cx2: 1, cy2: 1 };
    expect(withPoint(linearShape(), 0, point).kind).toBe('linear');
    const shape = readCurve([0.42, 0, 0.58, 10], 1);
    expect(withPoint(shape, 3, point)).toBe(shape);
    expect(withPoint(shape, -1, point)).toBe(shape);
  });

  it('LINEAR_UNIT is the chord, so the clamp never fires on it', () => {
    expect(LINEAR_UNIT.x1).toBeCloseTo(1 / 3, 12);
    expect(LINEAR_UNIT.x2).toBeCloseTo(2 / 3, 12);
    expect(LINEAR_UNIT.y1).toBeCloseTo(1 / 3, 12);
    expect(LINEAR_UNIT.y2).toBeCloseTo(2 / 3, 12);
  });
});

// ---------------------------------------------------------------------------
// Sampling, checked against the runtime
// ---------------------------------------------------------------------------

describe('sampling agrees with the runtime', () => {
  const cases: Array<{ name: string; curve: number[] | string; c: number; t0: number; t1: number; v0: number[]; v1: number[] }> = [
    { name: 'suave', curve: [0.42, 0, 0.58, 10], c: 1, t0: 0, t1: 1, v0: [0], v1: [10] },
    { name: 'salto', curve: [0.34, 15.6, 0.64, 10], c: 1, t0: 0, t1: 1, v0: [0], v1: [10] },
    { name: 'elastico', curve: [0.25, -6, 0.75, 16], c: 1, t0: 0, t1: 1, v0: [0], v1: [10] },
    { name: 'deslocado', curve: [0.92, 20, 1.08, 30], c: 1, t0: 0.5, t1: 1.5, v0: [20], v1: [30] },
    { name: 'descendo', curve: [0.42, 100, 0.58, 0], c: 1, t0: 0, t1: 1, v0: [100], v1: [0] },
    { name: 'sem viagem', curve: [0.3, 40, 0.7, -40], c: 1, t0: 0, t1: 2, v0: [0], v1: [0] },
    { name: 'precisa de clamp', curve: [-3, 0, -1, 10], c: 1, t0: 0, t1: 1, v0: [0], v1: [10] },
    { name: 'linear', curve: 'linear', c: 1, t0: 0, t1: 1, v0: [3], v1: [9] },
    { name: 'stepped', curve: 'stepped', c: 1, t0: 0, t1: 1, v0: [3], v1: [9] },
    {
      name: 'cor com 4 componentes',
      curve: [0.2, 0, 0.9, 1, 0.42, 0, 0.58, 0.5, 0.1, 1, 0.5, 1, 0.3, 1, 0.6, 0],
      c: 4, t0: 0, t1: 1, v0: [0, 0, 1, 1], v1: [1, 0.5, 1, 0],
    },
  ];

  for (const test of cases) {
    it(`matches sampleCurve for "${test.name}"`, () => {
      const mine = resolveCurve(test.curve as never, test.c, true, test.t0, test.t1);
      const theirs = normalizeCurve(test.curve as never, test.c, true, test.t0, test.t1);
      expect(mine.kind).toBe(theirs.kind);
      for (let j = 0; j < test.c; j++) {
        const v0 = test.v0[j]!;
        const v1 = test.v1[j]!;
        for (let i = 0; i <= 20; i++) {
          const t = test.t0 + (test.t1 - test.t0) * (i / 20);
          expect(valueOnCurve(mine, j, test.t0, v0, test.t1, v1, t))
            .toBeCloseTo(sampleCurve(theirs, j, test.t0, test.t1, v0, v1, t), 9);
        }
      }
    });
  }

  it('solveParameter clamps outside the segment', () => {
    expect(solveParameter(0, 0.42, 0.58, 1, -5)).toBe(0);
    expect(solveParameter(0, 0.42, 0.58, 1, 9)).toBe(1);
    expect(solveParameter(1, 1, 1, 1, 1)).toBe(0);
  });

  it('an unclamped curve still lands on the two keys', () => {
    const shape = readCurve([0.42, 0, 0.58, 10], 1);
    expect(valueOnCurve(shape, 0, 0, 0, 1, 10, 0)).toBeCloseTo(0, 12);
    expect(valueOnCurve(shape, 0, 0, 0, 1, 10, 1)).toBeCloseTo(10, 12);
  });
});

// ---------------------------------------------------------------------------
// Drawing helpers
// ---------------------------------------------------------------------------

describe('drawing helpers', () => {
  it('the polyline lies on the curve', () => {
    const shape = resolveCurve([0.34, 15.6, 0.64, 10], 1, true, 0, 1);
    const line = samplePolyline(shape, 0, 0, 0, 1, 10, 24);
    expect(line).toHaveLength(25);
    expect(line[0]).toEqual({ time: 0, value: 0 });
    expect(line[24]!.time).toBeCloseTo(1, 12);
    expect(line[24]!.value).toBeCloseTo(10, 12);
    // The solve stops at 1e-6 x (t1 - t0) of time error, the tolerance the spec
    // names, so the value can differ in the fifth decimal on a travel of 10.
    for (const point of line) {
      expect(valueOnCurve(shape, 0, 0, 0, 1, 10, point.time)).toBeCloseTo(point.value, 4);
    }
  });

  it('the polyline of a step shows the riser', () => {
    expect(samplePolyline(steppedShape(), 0, 0, 3, 2, 9)).toEqual([
      { time: 0, value: 3 }, { time: 2, value: 3 }, { time: 2, value: 9 },
    ]);
  });

  it('the polyline of a straight line is two points', () => {
    expect(samplePolyline(linearShape(), 0, 0, 3, 2, 9)).toEqual([
      { time: 0, value: 3 }, { time: 2, value: 9 },
    ]);
  });

  it('the extent makes room for the overshoot, which is what "Ajustar" needs', () => {
    // "Passa do alvo" from 0 to 10 rises above 10 before settling.
    const salto = resolveCurve([0.34, 15.6, 0.64, 10], 1, true, 0, 1);
    const extent = curveExtent(salto, 0, 0, 0, 1, 10, 200);
    expect(extent.min).toBeCloseTo(0, 6);
    expect(extent.max).toBeGreaterThan(10.5);
    // "Recua e passa" dips below 0 first.
    const elastico = resolveCurve([0.25, -6, 0.75, 16], 1, true, 0, 1);
    const both = curveExtent(elastico, 0, 0, 0, 1, 10, 200);
    expect(both.min).toBeLessThan(-0.5);
    expect(both.max).toBeGreaterThan(10.5);
  });

  it('the extent of a straight line is just the two keys', () => {
    expect(curveExtent(linearShape(), 0, 0, 4, 1, -6)).toEqual({ min: -6, max: 4 });
  });
});


// ---------------------------------------------------------------------------
// E2: clicar numa chave escolhe; só arrastar move
// ---------------------------------------------------------------------------

describe('arrastar chave no painel Curvas', () => {
  const origem = { fromX: 100, fromY: 50 };

  it('um clique parado não vira arrasto', () => {
    expect(pastSlop(origem, 100, 50)).toBe(false);
    // O tremor de mão de um clique: menos de 4 px em qualquer direção.
    expect(pastSlop(origem, 102, 52)).toBe(false);
    expect(pastSlop(origem, 103, 50)).toBe(false);
  });

  it('andar 4 px ou mais é arrasto', () => {
    expect(pastSlop(origem, 104, 50)).toBe(true);
    expect(pastSlop(origem, 100, 46)).toBe(true);
    expect(pastSlop(origem, 103, 53)).toBe(true);
  });

  // A chave media 0,166666 s a 30 fps (quadro 5). Sem encaixe ela virava
  // 0,167 s, ou seja quadro 5,01, e a linha do tempo passava a mentir.
  it('a chave larga encaixada no quadro, não em 3 casas decimais', () => {
    // O mesmo encaixe da régua da linha do tempo, para as duas concordarem
    // sobre em que quadro a chave está.
    expect(keyDropTime(0.1671, 30, false, 0, 2)).toBe(snapToFrame(0.1671, 30));
    expect(keyDropTime(0.1671, 30, false, 0, 2)).toBe(keyDropTime(0.1666, 30, false, 0, 2));
    expect(keyDropTime(0.34, 24, false, 0, 2)).toBe(snapToFrame(1 / 3, 24));
    // Antes: 3 casas decimais soltas davam 0,167 s, que a 30 fps é o quadro 5,01.
    expect(keyDropTime(0.1671, 30, false, 0, 2)).not.toBe(0.167);
  });

  it('com tempo livre a chave para onde o ponteiro parou', () => {
    expect(keyDropTime(0.1671, 30, true, 0, 2)).toBeCloseTo(0.1671, 9);
  });

  it('os vizinhos seguram a chave: um arrasto nunca troca a ordem', () => {
    expect(keyDropTime(5, 30, false, 0.2, 0.8)).toBeCloseTo(0.8, 9);
    expect(keyDropTime(-5, 30, false, 0.2, 0.8)).toBeCloseTo(0.2, 9);
  });
});

// --- o defeito 3: chavear no meio de uma curva estragava a curva -----------

/*
 * Achado ABRINDO O PROGRAMA em 19/09/2026: animação `walk`, `t = 0,3`,
 * `Ctrl+K`. O rodapé passava de "Nenhum aviso" a DOIS:
 *
 *     curve cx1 0.33 outside [0.25, 0.3], clamped
 *     curve cx2 0.42 outside [0.3, 0.3], clamped
 *
 * A chave nova parte o trecho 0,25 → 0,5 em dois, e a curva daquele trecho
 * ficava inteira na chave de 0,25: os pontos de controle, que são segundos
 * ABSOLUTOS (§9.3), passam a cair fora do trecho novo. O runtime os aperta
 * contra a borda — e **o movimento muda sem ninguém ter pedido**.
 *
 * A propriedade que estes testes prendem não é "não há aviso": é **pôr uma
 * chave no meio de um trecho não pode mudar o movimento**. O aviso é o
 * sintoma; a curva redesenhada é o estrago.
 */
describe('chavear no meio de um trecho reparte a curva (defeito 3)', () => {
  const HEROI_4 = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  const QUADRIL = { type: 'bone', target: 'hips', property: 'y' } as const;
  const lerHeroi = (): BoneFile => JSON.parse(readFileSync(HEROI_4, 'utf8')) as BoneFile;

  /** Os avisos que o validador daria sobre as curvas desta linha do tempo. */
  const avisosDeCurva = (file: BoneFile): string[] => {
    const w = (file.animations ?? []).find((a) => a.name === 'walk');
    const tl = (w?.timelines ?? []).find(
      (x) => x.type === 'bone' && x.target === 'hips' && x.property === 'y',
    );
    const keys = (tl?.keys ?? []) as Array<{ time: number; curve?: unknown }>;
    const ditos: string[] = [];
    for (let i = 0; i < keys.length - 1; i++) {
      normalizeCurve(
        keys[i]!.curve as never, 1, true, keys[i]!.time, keys[i + 1]!.time,
        (m) => ditos.push(m),
      );
    }
    return ditos;
  };

  it('o defeito, como ele era: a curva de 0,25 sobrava do trecho novo', () => {
    const file = lerHeroi();
    // A curva do herói em 0,25 é `[0.33, 86, 0.42, 90]`, no trecho 0,25 → 0,5.
    // Partido em 0,3, o `cx1 = 0,33` cai FORA — é o aviso que ele viu.
    expect(avisosDeCurva(file)).toEqual([]);
    const solta = normalizeCurve([0.33, 86, 0.42, 90], 1, true, 0.25, 0.3, () => {});
    expect(solta.controls?.[0]).toBe(0.3); // apertado contra a borda
  });

  it('a chave nova em 0,3 não deixa nenhum aviso, e as duas curvas cabem', () => {
    const file = lerHeroi();
    const antes = valueAt(file, 'walk', 0.3, QUADRIL) as number;
    setKey(file, 'walk', 0.3, QUADRIL, antes);
    expect(avisosDeCurva(file)).toEqual([]);
  });

  it('E O QUE IMPORTA: o movimento fica IGUAL, de ponta a ponta', () => {
    const file = lerHeroi();
    // 201 pontos ao longo da animação inteira, e não só dentro do trecho: uma
    // curva repartida errado também estraga a borda com a vizinha.
    const amostras = Array.from({ length: 201 }, (_, i) => i / 200);
    const antes = amostras.map((t) => valueAt(file, 'walk', t, QUADRIL) as number);

    const valor = valueAt(file, 'walk', 0.3, QUADRIL) as number;
    setKey(file, 'walk', 0.3, QUADRIL, valor);

    const depois = amostras.map((t) => valueAt(file, 'walk', t, QUADRIL) as number);
    for (let i = 0; i < amostras.length; i++) {
      // 1e-6 é a tolerância da própria conformidade para pose; De Casteljau é
      // exato, e o que sobra é o arredondamento de sete casas do arquivo.
      expect(depois[i]!, `t = ${amostras[i]}`).toBeCloseTo(antes[i]!, 6);
    }
  });

  it('em QUALQUER tempo dentro do trecho, e não só em 0,3', () => {
    for (const t of [0.26, 0.27, 0.3, 0.33, 0.4, 0.45, 0.49]) {
      const file = lerHeroi();
      const amostras = Array.from({ length: 101 }, (_, i) => 0.25 + (i / 100) * 0.25);
      const antes = amostras.map((x) => valueAt(file, 'walk', x, QUADRIL) as number);
      setKey(file, 'walk', t, QUADRIL, valueAt(file, 'walk', t, QUADRIL) as number);
      expect(avisosDeCurva(file), `t = ${t}`).toEqual([]);
      const depois = amostras.map((x) => valueAt(file, 'walk', x, QUADRIL) as number);
      for (let i = 0; i < amostras.length; i++) {
        expect(depois[i]!, `t = ${t}, amostra ${amostras[i]}`).toBeCloseTo(antes[i]!, 5);
      }
    }
  });

  it('`stepped` reparte em duas `stepped`: segurar até 0,5 é segurar duas vezes', () => {
    const file = lerHeroi();
    const w = (file.animations ?? []).find((a) => a.name === 'walk')!;
    const tl = (w.timelines ?? []).find(
      (x) => x.type === 'bone' && x.target === 'hips' && x.property === 'y',
    ) as { keys: Array<{ time: number; curve?: unknown }> };
    tl.keys[1]!.curve = 'stepped';
    const valor = valueAt(file, 'walk', 0.3, QUADRIL) as number;
    setKey(file, 'walk', 0.3, QUADRIL, valor);
    expect(tl.keys[1]!.curve).toBe('stepped');
    expect(tl.keys[2]!.curve).toBe('stepped');
    expect(valueAt(file, 'walk', 0.4, QUADRIL)).toBe(valueAt(file, 'walk', 0.26, QUADRIL));
  });

  it('trecho reto continua reto: nada é escrito onde não havia curva', () => {
    const file = lerHeroi();
    const w = (file.animations ?? []).find((a) => a.name === 'walk')!;
    const tl = (w.timelines ?? []).find(
      (x) => x.type === 'bone' && x.target === 'hips' && x.property === 'y',
    ) as { keys: Array<{ time: number; curve?: unknown }> };
    delete tl.keys[1]!.curve;
    setKey(file, 'walk', 0.3, QUADRIL, valueAt(file, 'walk', 0.3, QUADRIL) as number);
    expect(tl.keys[1]!.curve).toBeUndefined();
    expect(tl.keys[2]!.curve).toBeUndefined();
  });

  it('a chave no FIM, depois da última, não reparte nada — não há trecho', () => {
    const file = lerHeroi();
    setKey(file, 'walk', 1.5, QUADRIL, 90);
    expect(avisosDeCurva(file)).toEqual([]);
  });

  it('a curva que o gesto escolheu manda: `options.curve` não é repartida', () => {
    const file = lerHeroi();
    setKey(file, 'walk', 0.3, QUADRIL, 88, { curve: 'stepped' });
    const w = (file.animations ?? []).find((a) => a.name === 'walk')!;
    const tl = (w.timelines ?? []).find(
      (x) => x.type === 'bone' && x.target === 'hips' && x.property === 'y',
    ) as { keys: Array<{ time: number; curve?: unknown }> };
    expect(tl.keys[2]!.curve).toBe('stepped');
  });
});

// ---------------------------------------------------------------------------
// Rodada 40, lote 1 — a curva e o valor se veem (doc 39, §2.2 e §2.3)
// ---------------------------------------------------------------------------

import {
  CURVE_KINDS as KINDS_40, curveKindOf as kindOf40, keyFocus as keyFocus40,
  onKeyFocus as onKeyFocus40, setKeyCurve as setCurve40, setKeyFocus as setKeyFocus40,
} from '../src/anim/keying.js';
import { presetButtonHint as presetButtonHint40 } from '../src/anim/curves.js';
import { keyTitle as keyTitle40 } from '../src/panels/dopesheet-model.js';

describe('rodada 40, lote 1: um nome por curva, e a chave diz o que é', () => {
  const rot40 = { type: 'bone' as const, target: 'braco', property: 'rotation' };
  const x40 = { type: 'bone' as const, target: 'braco', property: 'x' };
  function file40(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'braco', parent: 'root' }],
      events: [{ name: 'passo' }],
      animations: [{
        name: 'walk', duration: 1,
        timelines: [
          { type: 'bone', target: 'braco', property: 'rotation',
            keys: [{ time: 0, value: 0 }, { time: 0.5, value: 20 }, { time: 1, value: -12.5 }] },
          { type: 'bone', target: 'braco', property: 'x',
            keys: [{ time: 0, value: 4 }, { time: 1, value: 30 }] },
          { type: 'event', keys: [{ time: 0.25, event: 'passo' }] },
        ],
      }],
    } as BoneFile;
  }
  const keys40 = (file: BoneFile): Array<Record<string, unknown>> =>
    ((file.animations ?? [])[0].timelines?.[0] as unknown as { keys: Array<Record<string, unknown>> }).keys;

  it('o gráfico diz "Parada", como o menu da chave — nunca "Degrau"', () => {
    expect(findPreset('degrau')?.label).toBe('Parada');
    expect(curveKindLabel(steppedShape())).toBe('Parada');
    expect(CURVE_PRESETS.map((p) => p.label)).not.toContain('Degrau');
  });

  it('o menu da chave tem os três suaves do gráfico, com o mesmo nome', () => {
    expect(KINDS_40.map((k) => k.label)).toEqual(['Linear', 'Suave', 'Entrada suave', 'Saída suave', 'Parada']);
    for (const kind of KINDS_40) {
      const preset = CURVE_PRESETS.find((p) => p.label === kind.label);
      expect(preset, kind.label).toBeDefined();
      expect(kind.hint, kind.label).toBe(preset!.hint);
    }
  });

  it('cada suave do menu grava a MESMA curva que o botão do gráfico', () => {
    for (const id of ['suave', 'entrada-suave', 'saida-suave'] as const) {
      const file = file40();
      setCurve40(file, 'walk', [{ target: rot40, time: 0 }], id);
      const esperado = presetCurve(findPreset(id)!, 0, 0.5, [0], [20]);
      const escrito = keys40(file)[0]['curve'] as number[];
      expect(escrito.length, id).toBe(4);
      (esperado as number[]).forEach((n, i) => expect(escrito[i], `${id}[${i}]`).toBeCloseTo(n, 9));
    }
  });

  it('`curveKindOf` reconhece os cinco, e a Suave antiga (um terço) continua Suave', () => {
    for (const kind of KINDS_40) {
      const file = file40();
      setCurve40(file, 'walk', [{ target: rot40, time: 0 }], kind.id);
      expect(kindOf40(file, 'walk', { target: rot40, time: 0 })).toBe(kind.id);
    }
    const antiga = file40();
    keys40(antiga)[0]['curve'] = [0.5 / 3, 0, 0.5 - 0.5 / 3, 20];
    expect(kindOf40(antiga, 'walk', { target: rot40, time: 0 })).toBe('suave');
    const amao = file40();
    keys40(amao)[0]['curve'] = [0.05, 18, 0.3, -4];
    expect(kindOf40(amao, 'walk', { target: rot40, time: 0 })).toBe('outra');
  });

  it('a dica da chave diz o tempo, o valor com a unidade e a curva', () => {
    const file = file40();
    setCurve40(file, 'walk', [{ target: rot40, time: 0.5 }], 'parada');
    expect(keyTitle40(file, 'walk', { target: rot40, time: 0 })).toBe('0,00 s · Rotação de braco = 0° · Linear');
    expect(keyTitle40(file, 'walk', { target: rot40, time: 0.5 })).toBe('0,50 s · Rotação de braco = 20° · Parada');
    expect(keyTitle40(file, 'walk', { target: rot40, time: 1 })).toBe('1,00 s · Rotação de braco = −12,5° · a última: sem curva');
    expect(keyTitle40(file, 'walk', { target: x40, time: 0 })).toBe('0,00 s · Posição X de braco = 4 px · Linear');
    expect(keyTitle40(file, 'walk', { target: { type: 'event' }, time: 0.25, event: 'passo' })).toBe('0,25 s · Evento passo');
  });

  it('a chave em foco é uma só, e quem escuta ouve uma vez por mudança', () => {
    const ouvidas: Array<string | null> = [];
    const parar = onKeyFocus40((ref) => ouvidas.push(ref === null ? null : `${ref.target.target}@${ref.time}`));
    setKeyFocus40({ target: rot40, time: 0.5 });
    setKeyFocus40({ target: rot40, time: 0.5 });
    setKeyFocus40({ target: x40, time: 0 });
    setKeyFocus40(null);
    parar();
    setKeyFocus40({ target: rot40, time: 1 });
    expect(ouvidas).toEqual(['braco@0.5', 'braco@0', null]);
    expect(keyFocus40()?.time).toBe(1);
    setKeyFocus40(null);
  });

  it('a dica de um botão do gráfico apagado não tem ".." no meio', () => {
    for (const preset of CURVE_PRESETS) {
      expect(presetButtonHint40(preset, false)).not.toContain('..');
      expect(presetButtonHint40(preset, false)).toContain('Primeiro escolha uma chave');
      expect(presetButtonHint40(preset, true)).toBe(preset.hint);
    }
  });
});

// ---------------------------------------------------------------------------
// Rodada 40, lote 3 — as notas da conferência da v31.4 (doc 44)
// ---------------------------------------------------------------------------

import { segmentPath as segmentPath40 } from '../src/panels/dopesheet-model.js';
import { spanOfLines as spanOfLines40 } from '../src/panels/graph.js';

describe('rodada 40, lote 3: a folha desenha a curva de verdade, e Ajustar enquadra a escolhida', () => {
  const rot = { type: 'bone' as const, target: 'braco', property: 'rotation' };
  function arquivo(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'braco', parent: 'root' }],
      animations: [{
        name: 'walk', duration: 1,
        timelines: [{ type: 'bone', target: 'braco', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.5, value: 20 }, { time: 1, value: 0 }] }],
      }],
    } as BoneFile;
  }

  it('cada curva tem o seu desenho na folha: entrada e saída NÃO são iguais à suave', () => {
    const caminhos: Record<string, string | null> = {};
    for (const id of ['linear', 'suave', 'entrada-suave', 'saida-suave', 'parada'] as const) {
      const file = arquivo();
      setCurve40(file, 'walk', [{ target: rot, time: 0 }], id);
      caminhos[id] = segmentPath40(file, 'walk', { target: rot, time: 0 });
    }
    expect(caminhos['linear']).toBe('M0,100 L100,0');
    expect(caminhos['suave']).toBe('M0,100 C42,100 58,0 100,0');
    expect(caminhos['entrada-suave']).toBe('M0,100 C42,100 100,0 100,0');
    expect(caminhos['saida-suave']).toBe('M0,100 C0,100 58,0 100,0');
    expect(caminhos['parada']).toBe('M0,100 L100,100 L100,0');
    expect(new Set(Object.values(caminhos)).size).toBe(5);
  });

  it('a última chave não tem trecho', () => {
    expect(segmentPath40(arquivo(), 'walk', { target: rot, time: 1 })).toBeNull();
  });

  it('Ajustar com uma chave escolhida enquadra a linha DELA, e não todas', () => {
    const linhas = [
      { id: 'grande', visible: true, components: 1, component: 0,
        keys: [{ time: 0, value: -100, curve: undefined }, { time: 1, value: 100, curve: undefined }] },
      { id: 'pequena', visible: true, components: 1, component: 0,
        keys: [{ time: 0, value: 10, curve: undefined }, { time: 1, value: 13, curve: undefined }] },
    ];
    const todas = spanOfLines40(linhas, null);
    expect(todas.min).toBeLessThan(-100);
    const so = spanOfLines40(linhas, 'pequena');
    expect(so.min).toBeCloseTo(9.7, 6);
    expect(so.max).toBeCloseTo(13.3, 6);
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 4: Curvas — dica nos botões e o rodapé fala', () => {
  it('Ajustar e Mostrar todas com dica; os dois dizem no rodapé o que fizeram', () => {
    const curvas = fonteR47L4('panels/graph.ts');
    expect(curvas).toContain("comDica(button('Ajustar'");
    expect(curvas).toContain("comDica(button('Mostrar todas'");
    expect((curvas.match(/notice\(/g) ?? []).length).toBeGreaterThanOrEqual(2);
  });
});

// Rodada 47, lote 5b (notas do doc 86)
describe('rodada 47, lote 5b: as linhas da lista das Curvas têm dica', () => {
  const fonteR47L5b = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

  it('cada linha da lista diz que o clique mostra ou esconde', () => {
    expect(fonteR47L5b('panels/graph.ts')).toContain('clique mostra ou esconde esta linha no gráfico');
  });
});

// Rodada 47, lote 6c (nota 4 do doc 90)
describe('rodada 47, lote 6c: as Curvas falam sem jargão', () => {
  it('nenhuma dica de formato cita outro programa; a lista diz "à vista" e "escondida"', () => {
    const curvas = readFileSync(resolve(__dirname, '../src/anim/curves.ts'), 'utf8');
    expect(curvas).not.toMatch(/hint: '[^']*(Spine|Blender|overshoot|back in-out)/);
    const grafico = readFileSync(resolve(__dirname, '../src/panels/graph.ts'), 'utf8');
    expect(grafico).toContain("channel.visible ? 'à vista' : 'escondida'");
  });
});

// QA da noite de 04/11/2026 (obra/qa-animar): no andar com curvas, "Selecionar
// todas as chaves" escolheu 6 e o "Suave" respondeu "4 chave(s) agora em
// Suave" — o "(s)" de formulário, e as 2 que não mudaram sem explicação.
import { curveAppliedNotice as curveAppliedNoticeQA, keysAfterEndNotice as keysAfterEndNoticeQA } from '../src/panels/dopesheet-model.js';
describe('o rodapé da curva conta direito (QA da noite)', () => {
  it('plural e singular de verdade', () => {
    expect(curveAppliedNoticeQA(1, 1, 'Suave')).toBe('1 chave agora em Suave');
    expect(curveAppliedNoticeQA(4, 4, 'Linear')).toBe('4 chaves agora em Linear');
    expect(curveAppliedNoticeQA(3, 3, 'Parada')).toBe('3 chaves agora paradas');
    expect(curveAppliedNoticeQA(1, 1, 'Parada')).toBe('1 chave agora parada');
  });
  it('diz por que algumas das escolhidas não mudaram', () => {
    expect(curveAppliedNoticeQA(4, 6, 'Suave'))
      .toBe('4 chaves agora em Suave. As outras 2 são a última da linha: não têm para onde curvar');
    expect(curveAppliedNoticeQA(2, 3, 'Suave'))
      .toBe('2 chaves agora em Suave. A outra é a última da linha: não tem para onde curvar');
  });
  it('nenhuma mudou: a frase de antes', () => {
    expect(curveAppliedNoticeQA(0, 2, 'Suave')).toBe('Nenhuma chave mudou: a última de cada linha não tem para onde curvar');
  });
  it('a duração encurtada conta as chaves que sobram', () => {
    expect(keysAfterEndNoticeQA('0,50 s', 0)).toBe('Duração: 0,50 s');
    expect(keysAfterEndNoticeQA('0,50 s', 1)).toBe('Duração: 0,50 s. 1 chave ficou depois do fim');
    expect(keysAfterEndNoticeQA('0,50 s', 3)).toBe('Duração: 0,50 s. 3 chaves ficaram depois do fim');
  });
});
