// SPDX-License-Identifier: Apache-2.0
/**
 * Driver constraint (spec 8.2, listed as 6.6 among the constraints).
 *
 * A driver reads ONE parameter (spec 8.1, `parameters.ts`) and writes into
 * properties. It sits in `constraints` and obeys the array order (spec 5.6),
 * so it can read a bone an IK already solved (through `parameter.source`) and
 * can feed the `mix` of a later constraint.
 *
 * Two exclusive modes:
 *
 * - **targets mode** (`targets`): each target is a timeline whose keys are
 *   indexed by the parameter value instead of time (the 1-D keyform of
 *   Live2D). `evaluate` (spec 9.10) is reused with `input` in place of `time`,
 *   so outside the key range the first / last key holds.
 * - **continuous mode** (`animation`): the parameter value is mapped to a time
 *   inside a control animation, and every timeline of that animation is
 *   evaluated there (the Slider of Spine 4.3, the Smart Bone of Moho).
 *
 * Writing one value (spec 8.2 `aplicarAlvo`):
 *
 * ```
 * cur = read(target)     // bone: APPLIED pose; everything else: current state
 * interpolable: replace -> cur + (val - cur) * mix
 *               add     -> cur + (val - setup(target)) * mix
 * otherwise:    (mix >= 0.5) ? val : cur
 * ```
 *
 * A bone target writes `bone.applied`, never `bone.local`, and nothing carries
 * over to the next frame: `updateWorldTransform` copies local into applied
 * again before the constraints run (spec 5.6). After writing a bone, the bone
 * and its descendants are recomputed (dirty rule of 5.6).
 */

import {
  DriverConstraintData, VertexAttachment,
  type ConstraintData, type DeformTimelineData, type TimelineData,
} from '../data.js';
import type { Bone, Skeleton, Slot } from '../skeleton.js';
import {
  applyDrawOrder, applyParentKey, evaluateComponent, evaluateDarkColor, evaluateDeform, evaluateNumber,
  evaluateStepped, findKeyIndex,
} from '../animation.js';
import { APPLIED_BONE_INHERIT, APPLIED_BONE_PROPERTY, refreshParameter } from '../parameters.js';
import { clamp } from '../math.js';
import type { DriverMode } from '../types.js';
import { registerConstraint, type Constraint } from './constraint.js';

/** Timelines a driver never applies: they are crossings, not values (spec 8.2). */
function isValueTimeline(tl: TimelineData): boolean {
  return tl.kind !== 'event' && tl.kind !== 'sequence' && tl.kind !== 'tag' && tl.kind !== 'constraint.reset';
}

export class DriverConstraint implements Constraint {
  readonly data: DriverConstraintData;
  active = true;
  mix: number;

  /** Bones written this frame; recomputed (with their descendants) at the end of `update`. */
  private readonly touched: Bone[] = [];
  /** Reused buffer for `deform` targets. */
  private deformScratch: Float64Array | null = null;
  /** Reused buffer for `slot.darkColor` targets. */
  private readonly color3 = new Float64Array(3);

  constructor(data: DriverConstraintData, _skeleton: Skeleton) {
    this.data = data;
    this.mix = data.mix;
    // Nothing to drive: no valid target survived the loader, or the continuous
    // mode animation / range is unusable (spec 4.7: ignore, never throw).
    if (data.targets !== null) {
      if (data.targets.length === 0) this.active = false;
    } else if (data.animation === null || data.to === data.from) {
      this.active = false;
    }
  }

  /** Parameter value driving this constraint right now (spec 8.1). */
  input(skeleton: Skeleton): number {
    return refreshParameter(skeleton, this.data.parameter);
  }

  /**
   * Time inside the control animation for the parameter value `v`
   * (continuous mode, spec 8.2), clamped to `[min(timeFrom, timeTo),
   * max(timeFrom, timeTo)]`.
   */
  animationTime(v: number): number {
    const d = this.data;
    const span = d.to - d.from;
    if (span === 0) return d.timeFrom;
    const t = d.timeFrom + ((v - d.from) / span) * (d.timeTo - d.timeFrom);
    return clamp(t, Math.min(d.timeFrom, d.timeTo), Math.max(d.timeFrom, d.timeTo));
  }

  update(skeleton: Skeleton, _now: number): void {
    const d = this.data;
    const mix = this.mix;
    if (mix === 0) return;
    const v = this.input(skeleton);

    if (d.targets !== null) {
      for (const target of d.targets) this.applyTimeline(skeleton, target.timeline, v, target.mode, mix);
    } else {
      const animation = d.animation;
      if (animation === null) return;
      const t = this.animationTime(v);
      for (const tl of animation.timelines) {
        if (isValueTimeline(tl)) this.applyTimeline(skeleton, tl, t, d.mode, mix);
      }
    }

    // Dirty rule (spec 5.6): the bones written above and everything under them.
    const touched = this.touched;
    if (touched.length > 0) {
      for (const bone of touched) bone.dirty = true;
      touched.length = 0;
      skeleton.updateDirtyBones();
    }
  }

  reset(): void {
    this.touched.length = 0;
  }

  setToSetupPose(): void {
    this.mix = this.data.mix;
  }

  // -- one target (spec 8.2 `aplicarAlvo`) -----------------------------------

  private applyTimeline(skeleton: Skeleton, tl: TimelineData, input: number, mode: DriverMode, mix: number): void {
    switch (tl.kind) {
      case 'bone.number': {
        const bone = skeleton.bones[tl.bone.index];
        const field = APPLIED_BONE_PROPERTY[tl.property];
        const val = evaluateNumber(tl.keys, input);
        bone[field] = blendNumber(bone[field], val, tl.bone[tl.property], mode, mix);
        this.touch(bone);
        break;
      }
      case 'bone.inherit': {
        if (mix < 0.5) break;
        const bone = skeleton.bones[tl.bone.index];
        bone[APPLIED_BONE_INHERIT[tl.property]] = evaluateStepped(tl.keys, input);
        this.touch(bone);
        break;
      }
      case 'bone.parent': {
        if (mix < 0.5) break;
        const bone = skeleton.bones[tl.bone.index];
        applyParentKey(skeleton, bone, evaluateStepped(tl.keys, input));
        this.touch(bone);
        break;
      }
      case 'slot.attachment': {
        if (mix < 0.5) break;
        skeleton.slots[tl.slot.index].setAttachmentName(evaluateStepped(tl.keys, input));
        break;
      }
      case 'slot.color': {
        const color = skeleton.slots[tl.slot.index].color;
        const setup = tl.slot.color;
        for (let j = 0; j < 4; j++) {
          color[j] = blendNumber(color[j], evaluateComponent(tl.keys, input, j), setup[j], mode, mix);
        }
        break;
      }
      case 'slot.darkColor': {
        this.applyDarkColor(skeleton.slots[tl.slot.index], tl, input, mode, mix);
        break;
      }
      case 'slot.visible': {
        if (mix < 0.5) break;
        skeleton.slots[tl.slot.index].visible = evaluateStepped(tl.keys, input);
        break;
      }
      case 'drawOrder': {
        if (mix < 0.5) break;
        const i = findKeyIndex(tl.times, input);
        applyDrawOrder(skeleton, tl.entries[i < 0 ? 0 : i]);
        break;
      }
      case 'deform': {
        this.applyDeform(skeleton.slots[tl.slot.index], tl, input, mode, mix);
        break;
      }
      case 'constraint.number': {
        const c = skeleton.constraintFor(tl.constraint);
        if (c === null) break;
        const holder = c as unknown as Record<string, number>;
        const cur = holder[tl.property];
        if (typeof cur !== 'number') break;
        const setup = (tl.constraint as unknown as Record<string, unknown>)[tl.property];
        holder[tl.property] = blendNumber(cur, evaluateNumber(tl.keys, input), typeof setup === 'number' ? setup : cur, mode, mix);
        break;
      }
      case 'constraint.boolean': {
        if (mix < 0.5) break;
        const c = skeleton.constraintFor(tl.constraint);
        if (c === null) break;
        (c as unknown as Record<string, boolean>)[tl.property] = evaluateStepped(tl.keys, input);
        break;
      }
      case 'parameter': {
        const p = tl.parameter;
        const cur = skeleton.parameters[p.index];
        skeleton.parameters[p.index] = p.constrain(blendNumber(cur, evaluateNumber(tl.keys, input), p.default, mode, mix));
        break;
      }
      case 'morph': {
        const m = tl.morph;
        const cur = skeleton.morphWeights[m.index];
        skeleton.morphWeights[m.index] = clamp(blendNumber(cur, evaluateNumber(tl.keys, input), m.weight, mode, mix), m.min, m.max);
        break;
      }
      case 'variable.number': {
        const variable = tl.variable;
        const raw = skeleton.variables[variable.index];
        const cur = typeof raw === 'number' ? raw : 0;
        const setup = typeof variable.default === 'number' ? variable.default : 0;
        const v = blendNumber(cur, evaluateNumber(tl.keys, input), setup, mode, mix);
        skeleton.variables[variable.index] = variable.type === 'int' ? Math.trunc(v) : v;
        break;
      }
      case 'variable.stepped': {
        if (mix < 0.5) break;
        skeleton.variables[tl.variable.index] = evaluateStepped(tl.keys, input);
        break;
      }
      case 'nested.animation': {
        if (mix < 0.5) break;
        const slot = skeleton.slots[tl.slot.index];
        slot.nestedAnimation = evaluateStepped(tl.keys, input);
        slot.nestedAnimationSet = true;
        break;
      }
      case 'nested.number': {
        const slot = skeleton.slots[tl.slot.index];
        const val = evaluateNumber(tl.keys, input);
        // Unset (`NaN`) until something writes it: spec 9.9 gives these no
        // setup value. `add` starts from 0, `replace` from the key value.
        const raw = tl.property === 'time' ? slot.nestedTime : slot.nestedTimeScale;
        const cur = Number.isFinite(raw) ? raw : (mode === 'add' ? 0 : val);
        const v = blendNumber(cur, val, 0, mode, mix);
        if (tl.property === 'time') slot.nestedTime = v;
        else slot.nestedTimeScale = v;
        break;
      }
      case 'event':
      case 'sequence':
      case 'tag':
      case 'constraint.reset':
        break; // Not allowed as a driver target (spec 8.2); skipped in continuous mode too.
    }
  }

  private touch(bone: Bone): void {
    if (!this.touched.includes(bone)) this.touched.push(bone);
  }

  private applyDarkColor(slot: Slot, tl: TimelineData & { kind: 'slot.darkColor' }, input: number, mode: DriverMode, mix: number): void {
    const val = evaluateDarkColor(tl, input, this.color3);
    const setup = tl.slot.darkColor;
    if (val === null) {
      // "tint black off" is not interpolable.
      if (mix >= 0.5) slot.darkColor = null;
      return;
    }
    if (slot.darkColor === null) {
      if (mix >= 0.5) slot.darkColor = Float64Array.from(val);
      return;
    }
    const cur = slot.darkColor;
    for (let j = 0; j < 3; j++) cur[j] = blendNumber(cur[j], val[j], setup === null ? 0 : setup[j], mode, mix);
  }

  private applyDeform(slot: Slot, tl: DeformTimelineData, input: number, mode: DriverMode, mix: number): void {
    const current = slot.attachment;
    if (!(current instanceof VertexAttachment) || current.timelineAttachment !== tl.attachment.timelineAttachment) return;
    const length = tl.attachment.deformLength;
    if (this.deformScratch === null || this.deformScratch.length < length) this.deformScratch = new Float64Array(length);
    const val = evaluateDeform(tl, input, this.deformScratch);
    const timelineAttachment = tl.attachment.timelineAttachment;
    let out = slot.deform;
    const hadDeform = out !== null && out.length === length && slot.deformAttachment === timelineAttachment;
    if (!hadDeform) out = new Float64Array(length);
    const buffer = out as Float64Array;
    // The setup deform is "no deform": zeros (spec 5.1).
    for (let j = 0; j < length; j++) {
      const cur = hadDeform ? buffer[j] : 0;
      buffer[j] = blendNumber(cur, val === null ? 0 : val[j], 0, mode, mix);
    }
    slot.deform = buffer;
    slot.deformAttachment = timelineAttachment;
  }
}

/** `aplicarAlvo` for an interpolable value (spec 8.2). */
function blendNumber(cur: number, val: number, setup: number, mode: DriverMode, mix: number): number {
  if (mode === 'add') return cur + (val - setup) * mix;
  return cur + (val - cur) * mix;
}

function driverFactory(data: ConstraintData, skeleton: Skeleton): Constraint {
  if (!(data instanceof DriverConstraintData)) throw new Error(`driver factory received "${data.type}" data`);
  return new DriverConstraint(data, skeleton);
}

// Registered by side effect: importing this module replaces the noop factory.
registerConstraint('driver', driverFactory);
