// SPDX-License-Identifier: Apache-2.0
/**
 * Physics constraint (spec 6.5): spring-damper secondary motion, port of the
 * Spine 4.2 `PhysicsConstraint` with the corrections listed in the spec
 * (`a` reloaded before the rotation loop, `tx/ty` stored after the physics of
 * the previous frame, `scaleOffset` in the else branch, reset zeroing
 * `remaining`).
 *
 * Fixed simulation step `1 / fps` with an accumulator (`remaining`). The
 * constraint reads the world matrix of its bone (up to date when `update` is
 * called, spec 5.6), writes the world matrix, derives the applied pose from it
 * (spec 5.5 `appliedFromWorld`) and marks the children dirty.
 *
 * `update(skeleton, now)` receives the skeleton time (spec 6.5 `now`) and
 * keeps `lastTime` exactly as the spec: `delta = max(now - lastTime, 0)`,
 * `physicsReset` sets `lastTime = now`.
 */

import { PhysicsConstraintData, type ConstraintData } from '../data.js';
import type { Bone, Skeleton } from '../skeleton.js';
import { atan2, clamp, sanitize, PI2 } from '../math.js';
import { registerConstraint, type Constraint } from './constraint.js';

export class PhysicsConstraint implements Constraint {
  readonly data: PhysicsConstraintData;
  readonly bone: Bone;
  active = true;
  mix: number;

  // Animatable values (spec 9.8). Restored by `setToSetupPose`.
  inertia: number;
  strength: number;
  damping: number;
  mass: number;
  wind: number;
  gravity: number;

  // Simulation state (spec 6.5, not stored in the file).
  xOffset = 0;
  xVelocity = 0;
  yOffset = 0;
  yVelocity = 0;
  rotateOffset = 0;
  rotateVelocity = 0;
  scaleOffset = 0;
  scaleVelocity = 0;
  /** Accumulated time not yet simulated (seconds). */
  remaining = 0;
  /** Skeleton time of the previous update (spec 6.5 `lastTime`); `NaN` before the first one. */
  lastTime = Number.NaN;
  /** Bone world position used by the translation lag (`ux uy`). */
  private ux = 0;
  private uy = 0;
  /** Bone world position at the end of the previous frame (`cx cy`). */
  private cx = 0;
  private cy = 0;
  /** Bone tip after the physics of the previous frame (`tx ty`). */
  private tx = 0;
  private ty = 0;
  private pendingReset = true;

  constructor(data: PhysicsConstraintData, skeleton: Skeleton) {
    this.data = data;
    this.bone = skeleton.bones[data.bone.index];
    this.mix = data.mix;
    this.inertia = data.inertia;
    this.strength = data.strength;
    this.damping = data.damping;
    this.mass = data.mass;
    this.wind = data.wind;
    this.gravity = data.gravity;
  }

  /** `1 / mass` (spec 6.5 `massInverse`); `0` when `mass` is not positive. */
  get massInverse(): number {
    return this.mass > 0 ? 1 / this.mass : 0;
  }

  /** Simulation step in seconds (`1 / fps`). */
  get step(): number {
    return 1 / this.data.fps;
  }

  /** Spec 6.5 `physicsReset`: next `update` re-anchors the bone and nothing is simulated. */
  reset(): void {
    this.pendingReset = true;
    this.remaining = 0;
    this.lastTime = this.bone.skeleton.time;
    this.xOffset = 0;
    this.xVelocity = 0;
    this.yOffset = 0;
    this.yVelocity = 0;
    this.rotateOffset = 0;
    this.rotateVelocity = 0;
    this.scaleOffset = 0;
    this.scaleVelocity = 0;
  }

  setToSetupPose(): void {
    const d = this.data;
    this.mix = d.mix;
    this.inertia = d.inertia;
    this.strength = d.strength;
    this.damping = d.damping;
    this.mass = d.mass;
    this.wind = d.wind;
    this.gravity = d.gravity;
  }

  /** Spec 6.5 `physicsApply`. `now` = skeleton time in seconds. */
  update(skeleton: Skeleton, now: number): void {
    const mix = this.mix;
    if (mix === 0) return;

    const data = this.data;
    const bone = this.bone;
    const l = bone.data.length;
    const f = skeleton.data.meta.referenceScale;
    const step = this.step;
    const massInverse = this.massInverse;
    const useX = data.x > 0;
    const useY = data.y > 0;
    const useRot = data.rotation > 0 || data.shearX > 0;
    const useScale = data.scaleX > 0;

    const delta = Number.isNaN(this.lastTime) ? 0 : Math.max(now - this.lastTime, 0);
    this.remaining += delta;
    this.lastTime = now;
    const bx = bone.worldX;
    const by = bone.worldY;

    if (this.pendingReset) {
      this.pendingReset = false;
      this.ux = bx;
      this.uy = by;
      this.remaining = 0;
    } else {
      let a = this.remaining;
      const i = this.inertia;
      let d = -1;
      let qx = data.limit * delta;
      const qy = qx * Math.abs(skeleton.scaleY);
      qx *= Math.abs(skeleton.scaleX);

      if (useX || useY) {
        if (useX) {
          this.xOffset += clamp((this.ux - bx) * i, -qx, qx);
          this.ux = bx;
        }
        if (useY) {
          this.yOffset += clamp((this.uy - by) * i, -qy, qy);
          this.uy = by;
        }
        if (a >= step) {
          d = Math.pow(this.damping, 60 * step);
          const m = massInverse * step;
          const e = this.strength;
          const w = this.wind * f;
          const g = this.gravity * f;
          do {
            if (useX) {
              this.xVelocity += (w - this.xOffset * e) * m;
              this.xOffset += this.xVelocity * step;
              this.xVelocity *= d;
            }
            if (useY) {
              this.yVelocity -= (g + this.yOffset * e) * m;
              this.yOffset += this.yVelocity * step;
              this.yVelocity *= d;
            }
            a -= step;
          } while (a >= step);
        }
      }
      if (useX) bone.worldX += this.xOffset * mix * data.x;
      if (useY) bone.worldY += this.yOffset * mix * data.y;

      if (useRot || useScale) {
        const ca = atan2(bone.c, bone.a);
        let mr = 0;
        let co: number;
        let si: number;
        const dx = clamp(this.cx - bone.worldX, -qx, qx);
        const dy = clamp(this.cy - bone.worldY, -qy, qy);
        if (useRot) {
          mr = (data.rotation + data.shearX) * mix;
          let r = atan2(dy + this.ty, dx + this.tx) - ca - this.rotateOffset * mr;
          this.rotateOffset += (r - Math.ceil(r / PI2 - 0.5) * PI2) * i;
          r = this.rotateOffset * mr + ca;
          co = Math.cos(r);
          si = Math.sin(r);
          if (useScale) {
            r = l * Math.sqrt(bone.a * bone.a + bone.c * bone.c);
            if (r > 0) this.scaleOffset += (dx * co + dy * si) * i / r;
          }
        } else {
          co = Math.cos(ca);
          si = Math.sin(ca);
          const r = l * Math.sqrt(bone.a * bone.a + bone.c * bone.c);
          if (r > 0) this.scaleOffset += (dx * co + dy * si) * i / r;
        }
        a = this.remaining;
        if (a >= step) {
          if (d === -1) d = Math.pow(this.damping, 60 * step);
          const m = massInverse * step;
          const e = this.strength;
          const w = this.wind;
          const g = this.gravity;
          const h = l / f;
          for (;;) {
            a -= step;
            if (useScale) {
              this.scaleVelocity += (w * co - g * si - this.scaleOffset * e) * m;
              this.scaleOffset += this.scaleVelocity * step;
              this.scaleVelocity *= d;
            }
            if (useRot) {
              this.rotateVelocity -= ((w * si + g * co) * h + this.rotateOffset * e) * m;
              this.rotateOffset += this.rotateVelocity * step;
              this.rotateVelocity *= d;
              if (a < step) break;
              const r = this.rotateOffset * mr + ca;
              co = Math.cos(r);
              si = Math.sin(r);
            } else if (a < step) {
              break;
            }
          }
        }
      }
      this.remaining = a;
    }
    this.cx = bone.worldX;
    this.cy = bone.worldY;

    // Apply the result to the world matrix.
    if (useRot) {
      let o = this.rotateOffset * mix;
      if (data.shearX > 0) {
        let r = 0;
        if (data.rotation > 0) {
          r = o * data.rotation;
          const si = Math.sin(r);
          const co = Math.cos(r);
          const b = bone.b;
          bone.b = co * b - si * bone.d;
          bone.d = si * b + co * bone.d;
        }
        r += o * data.shearX;
        const si = Math.sin(r);
        const co = Math.cos(r);
        const a = bone.a;
        bone.a = co * a - si * bone.c;
        bone.c = si * a + co * bone.c;
      } else {
        o *= data.rotation;
        const si = Math.sin(o);
        const co = Math.cos(o);
        const a = bone.a;
        bone.a = co * a - si * bone.c;
        bone.c = si * a + co * bone.c;
        const b = bone.b;
        bone.b = co * b - si * bone.d;
        bone.d = si * b + co * bone.d;
      }
    }
    if (useScale) {
      const s = 1 + this.scaleOffset * mix * data.scaleX;
      bone.a *= s;
      bone.c *= s;
    }
    bone.a = sanitize(bone.a);
    bone.b = sanitize(bone.b);
    bone.c = sanitize(bone.c);
    bone.d = sanitize(bone.d);
    bone.worldX = sanitize(bone.worldX);
    bone.worldY = sanitize(bone.worldY);
    // Tip after the physics; read by the next frame.
    this.tx = l * bone.a;
    this.ty = l * bone.c;
    bone.updateAppliedTransform();
    // The bone world is final; its descendants must be recomputed (spec 5.6 dirty rule).
    const children = bone.children;
    for (let k = 0; k < children.length; k++) children[k].dirty = true;
  }
}

function physicsFactory(data: ConstraintData, skeleton: Skeleton): Constraint {
  if (!(data instanceof PhysicsConstraintData)) throw new Error(`physics factory received "${data.type}" data`);
  return new PhysicsConstraint(data, skeleton);
}

// Registered by side effect: importing this module replaces the noop factory.
registerConstraint('physics', physicsFactory);
