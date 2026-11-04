// SPDX-License-Identifier: Apache-2.0
/**
 * Transform constraint (spec 6.3): makes the constrained bones follow the
 * target bone, per property, with the four modes `local` x `relative`.
 * Faithful port of Spine 4.2 `TransformConstraint`, with the general `mix`
 * of spec 6.1 multiplied into every per-property mix.
 *
 * World modes read and write the world matrix, then derive the applied pose
 * (`Bone.updateAppliedTransform`, spec 5.5). Local modes read and write the
 * applied pose, then recompute the world (`Bone.updateWorldTransform`, spec
 * 5.4). Nothing ever touches the local pose (spec 5.2, 6.1).
 *
 * Importing this module registers the factory for `type: "transform"`,
 * replacing the noop placeholder of `constraint.ts`.
 */

import type { ConstraintData } from '../data.js';
import { TransformConstraintData } from '../data.js';
import type { Bone, Skeleton } from '../skeleton.js';
import { finishWorldWrite, registerConstraint, type Constraint } from './constraint.js';
import { atan2, normalizeRadians, DEG_TO_RAD, PI, type Vector2 } from '../math.js';

export class TransformConstraint implements Constraint {
  readonly data: TransformConstraintData;
  /** Constrained bones, in file order. */
  readonly bones: Bone[];
  /** Source bone. */
  readonly target: Bone;

  active = true;
  /** General mix (spec 6.1). Multiplies every per-property mix. */
  mix: number;
  mixRotation: number;
  mixX: number;
  mixY: number;
  mixScaleX: number;
  mixScaleY: number;
  mixShearY: number;

  private readonly temp: Vector2 = { x: 0, y: 0 };

  constructor(data: TransformConstraintData, skeleton: Skeleton) {
    this.data = data;
    this.bones = data.bones.map((bd) => skeleton.bones[bd.index]);
    this.target = skeleton.bones[data.target.index];
    this.mix = data.mix;
    this.mixRotation = data.mixRotation;
    this.mixX = data.mixX;
    this.mixY = data.mixY;
    this.mixScaleX = data.mixScaleX;
    this.mixScaleY = data.mixScaleY;
    this.mixShearY = data.mixShearY;
  }

  reset(): void {
    // Stateless.
  }

  setToSetupPose(): void {
    const d = this.data;
    this.mix = d.mix;
    this.mixRotation = d.mixRotation;
    this.mixX = d.mixX;
    this.mixY = d.mixY;
    this.mixScaleX = d.mixScaleX;
    this.mixScaleY = d.mixScaleY;
    this.mixShearY = d.mixShearY;
  }

  update(_skeleton: Skeleton, _now: number): void {
    const mix = this.mix;
    const mR = mix * this.mixRotation;
    const mX = mix * this.mixX;
    const mY = mix * this.mixY;
    const mSX = mix * this.mixScaleX;
    const mSY = mix * this.mixScaleY;
    const mSH = mix * this.mixShearY;
    if (mR === 0 && mX === 0 && mY === 0 && mSX === 0 && mSY === 0 && mSH === 0) return;

    const d = this.data;
    if (d.local) {
      if (d.relative) this.applyRelativeLocal(mR, mX, mY, mSX, mSY, mSH);
      else this.applyAbsoluteLocal(mR, mX, mY, mSX, mSY, mSH);
    } else {
      if (d.relative) this.applyRelativeWorld(mR, mX, mY, mSX, mSY, mSH);
      else this.applyAbsoluteWorld(mR, mX, mY, mSX, mSY, mSH);
    }
  }

  // -- world modes -------------------------------------------------------------

  /** `local: false, relative: false` (spec 6.3 `transformWorldAbsolute`). */
  private applyAbsoluteWorld(mR: number, mX: number, mY: number, mSX: number, mSY: number, mSH: number): void {
    const d = this.data;
    const target = this.target;
    const ta = target.a, tb = target.b, tc = target.c, td = target.d;
    const reflect = ta * td - tb * tc > 0 ? DEG_TO_RAD : -DEG_TO_RAD;
    const offsetRotation = d.offsetRotation * reflect;
    const offsetShearY = d.offsetShearY * reflect;
    const temp = this.temp;

    const bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      const bone = bones[i];

      if (mR !== 0) {
        const a = bone.a, b = bone.b, c = bone.c, dd = bone.d;
        const r = normalizeRadians(atan2(tc, ta) - atan2(c, a) + offsetRotation) * mR;
        const cos = Math.cos(r), sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * dd;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * dd;
      }

      if (mX !== 0 || mY !== 0) {
        target.localToWorld(d.offsetX, d.offsetY, temp);
        bone.worldX += (temp.x - bone.worldX) * mX;
        bone.worldY += (temp.y - bone.worldY) * mY;
      }

      if (mSX !== 0) {
        let s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
        if (s !== 0) s = (s + (Math.sqrt(ta * ta + tc * tc) - s + d.offsetScaleX) * mSX) / s;
        bone.a *= s;
        bone.c *= s;
      }

      if (mSY !== 0) {
        let s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
        if (s !== 0) s = (s + (Math.sqrt(tb * tb + td * td) - s + d.offsetScaleY) * mSY) / s;
        bone.b *= s;
        bone.d *= s;
      }

      if (mSH > 0) {
        const b = bone.b, dd = bone.d;
        const by = atan2(dd, b);
        let r = normalizeRadians(atan2(td, tb) - atan2(tc, ta) - (by - atan2(bone.c, bone.a)));
        r = by + (r + offsetShearY) * mSH;
        const s = Math.sqrt(b * b + dd * dd);
        bone.b = Math.cos(r) * s;
        bone.d = Math.sin(r) * s;
      }

      finishWorldWrite(bone);
    }
  }

  /** `local: false, relative: true` (spec 6.3, world relative). */
  private applyRelativeWorld(mR: number, mX: number, mY: number, mSX: number, mSY: number, mSH: number): void {
    const d = this.data;
    const target = this.target;
    const ta = target.a, tb = target.b, tc = target.c, td = target.d;
    const reflect = ta * td - tb * tc > 0 ? DEG_TO_RAD : -DEG_TO_RAD;
    const offsetRotation = d.offsetRotation * reflect;
    const offsetShearY = d.offsetShearY * reflect;
    const temp = this.temp;

    const bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      const bone = bones[i];

      if (mR !== 0) {
        const a = bone.a, b = bone.b, c = bone.c, dd = bone.d;
        // Adds the target rotation instead of moving towards it.
        const r = normalizeRadians(atan2(tc, ta) + offsetRotation) * mR;
        const cos = Math.cos(r), sin = Math.sin(r);
        bone.a = cos * a - sin * c;
        bone.b = cos * b - sin * dd;
        bone.c = sin * a + cos * c;
        bone.d = sin * b + cos * dd;
      }

      if (mX !== 0 || mY !== 0) {
        // The whole world point of the offset is added, target position included (spec 6.3, as Spine).
        target.localToWorld(d.offsetX, d.offsetY, temp);
        bone.worldX += temp.x * mX;
        bone.worldY += temp.y * mY;
      }

      if (mSX !== 0) {
        const s = (Math.sqrt(ta * ta + tc * tc) - 1 + d.offsetScaleX) * mSX + 1;
        bone.a *= s;
        bone.c *= s;
      }

      if (mSY !== 0) {
        const s = (Math.sqrt(tb * tb + td * td) - 1 + d.offsetScaleY) * mSY + 1;
        bone.b *= s;
        bone.d *= s;
      }

      if (mSH > 0) {
        let r = normalizeRadians(atan2(td, tb) - atan2(tc, ta));
        const b = bone.b, dd = bone.d;
        r = atan2(dd, b) + (r - PI / 2 + offsetShearY) * mSH;
        const s = Math.sqrt(b * b + dd * dd);
        bone.b = Math.cos(r) * s;
        bone.d = Math.sin(r) * s;
      }

      finishWorldWrite(bone);
    }
  }

  // -- local modes -------------------------------------------------------------

  /** `local: true, relative: false` (spec 6.3, degrees, applied pose, no rotation wrap). */
  private applyAbsoluteLocal(mR: number, mX: number, mY: number, mSX: number, mSY: number, mSH: number): void {
    const d = this.data;
    const t = this.target;
    const bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      const bone = bones[i];
      bone.arotation += (t.arotation - bone.arotation + d.offsetRotation) * mR;
      bone.ax += (t.ax - bone.ax + d.offsetX) * mX;
      bone.ay += (t.ay - bone.ay + d.offsetY) * mY;
      bone.ascaleX += (t.ascaleX - bone.ascaleX + d.offsetScaleX) * mSX;
      bone.ascaleY += (t.ascaleY - bone.ascaleY + d.offsetScaleY) * mSY;
      bone.ashearY += (t.ashearY - bone.ashearY + d.offsetShearY) * mSH;
      bone.updateWorldTransform();
    }
  }

  /** `local: true, relative: true` (spec 6.3). */
  private applyRelativeLocal(mR: number, mX: number, mY: number, mSX: number, mSY: number, mSH: number): void {
    const d = this.data;
    const t = this.target;
    const bones = this.bones;
    for (let i = 0, n = bones.length; i < n; i++) {
      const bone = bones[i];
      bone.arotation += (t.arotation + d.offsetRotation) * mR;
      bone.ax += (t.ax + d.offsetX) * mX;
      bone.ay += (t.ay + d.offsetY) * mY;
      bone.ascaleX *= (t.ascaleX - 1 + d.offsetScaleX) * mSX + 1;
      bone.ascaleY *= (t.ascaleY - 1 + d.offsetScaleY) * mSY + 1;
      bone.ashearY += (t.ashearY + d.offsetShearY) * mSH;
      bone.updateWorldTransform();
    }
  }
}

registerConstraint('transform', (data: ConstraintData, skeleton: Skeleton) => {
  if (!(data instanceof TransformConstraintData)) {
    throw new Error(`constraint "${data.name}": expected TransformConstraintData for type "transform"`);
  }
  return new TransformConstraint(data, skeleton);
});
