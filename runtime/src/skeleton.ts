// SPDX-License-Identifier: Apache-2.0
import { orderFromOffsets } from './draw-order.js';
/**
 * Runtime instances: `Bone`, `Slot` and `Skeleton` (spec 5).
 *
 * Every bone keeps three states (spec 5.2): local (setup + animations),
 * applied (copy of local, then constraints) and world (matrix computed from
 * the applied pose). `Skeleton.updateWorldTransform` is the reference
 * `updatePose` of spec 5.6 with the dirty-flag optimisation the same section
 * allows.
 */

import {
  SkeletonData, BoneData, SlotData, SkinData, ConstraintData, inheritMode, type InheritMode,
} from './data.js';
import type { VariableValue } from './types.js';
import type { Attachment } from './attachments/attachment.js';
import { VertexAttachment } from './attachments/vertex-attachment.js';
import { RegionAttachment } from './attachments/region.js';
import { MeshAttachment } from './attachments/mesh.js';
import { LinkedMeshAttachment } from './attachments/linkedmesh.js';
import { BoundingBoxAttachment } from './attachments/boundingbox.js';
import { createConstraint, type Constraint } from './constraints/constraint.js';
import {
  atan2, atan2Deg, cosDeg, sinDeg, sanitize, identityMatrix, multiplyMatrix, EPSILON_DET, EPSILON_SCALE, PI,
  type Matrix2x3, type Vector2,
} from './math.js';

// ---------------------------------------------------------------------------
// Bone
// ---------------------------------------------------------------------------

export class Bone implements Matrix2x3 {
  readonly data: BoneData;
  readonly skeleton: Skeleton;
  /** Current parent. A `parent` key (spec 9.4) can change it; `null` = root. */
  parent: Bone | null;
  /** The parent written in the file (spec 5.1). */
  readonly setupParent: Bone | null;
  readonly children: Bone[] = [];

  // Local pose (spec 5.2): written by setup pose and animations only.
  x = 0;
  y = 0;
  rotation = 0;
  scaleX = 1;
  scaleY = 1;
  shearX = 0;
  shearY = 0;
  inheritRotation = true;
  inheritScale = true;
  inheritReflection = true;

  // Applied pose (spec 5.2): copy of the local pose, then constraints.
  ax = 0;
  ay = 0;
  arotation = 0;
  ascaleX = 1;
  ascaleY = 1;
  ashearX = 0;
  ashearY = 0;
  ainheritRotation = true;
  ainheritScale = true;
  ainheritReflection = true;

  // World matrix (spec 3.2), always computed from the applied pose.
  a = 1;
  b = 0;
  c = 0;
  d = 1;
  worldX = 0;
  worldY = 0;

  /** `true` when the world matrix must be recomputed before being read (spec 5.6). */
  dirty = true;

  constructor(data: BoneData, skeleton: Skeleton, parent: Bone | null) {
    this.data = data;
    this.skeleton = skeleton;
    this.parent = parent;
    this.setupParent = parent;
    if (parent !== null) parent.children.push(this);
    this.setToSetupPose();
  }

  /**
   * Re-parents the bone (spec 9.4 `parent` timeline). Refuses a cycle — the
   * new parent being this bone or one of its descendants — and returns
   * `false`; the caller warns once (L2 `PARENT_CYCLE`). Nothing is converted:
   * from now on the local values are measured from the new parent, as in
   * Spriter. The skeleton recomputes its update order (spec 5.6).
   */
  setParent(parent: Bone | null): boolean {
    if (parent === this.parent) return true;
    for (let p = parent; p !== null; p = p.parent) if (p === this) return false;
    const old = this.parent;
    if (old !== null) {
      const i = old.children.indexOf(this);
      if (i >= 0) old.children.splice(i, 1);
    }
    this.parent = parent;
    if (parent !== null) parent.children.push(this);
    this.dirty = true;
    this.skeleton.orderDirty = true;
    return true;
  }

  /** Restores the local pose from the file (spec 5.1), the parent included. */
  setToSetupPose(): void {
    if (this.parent !== this.setupParent) this.setParent(this.setupParent);
    const d = this.data;
    this.x = d.x;
    this.y = d.y;
    this.rotation = d.rotation;
    this.scaleX = d.scaleX;
    this.scaleY = d.scaleY;
    this.shearX = d.shearX;
    this.shearY = d.shearY;
    this.inheritRotation = d.inheritRotation;
    this.inheritScale = d.inheritScale;
    this.inheritReflection = d.inheritReflection;
    this.dirty = true;
  }

  /** `applied = local` (spec 5.6 step 1). */
  updateAppliedFromLocal(): void {
    this.ax = this.x;
    this.ay = this.y;
    this.arotation = this.rotation;
    this.ascaleX = this.scaleX;
    this.ascaleY = this.scaleY;
    this.ashearX = this.shearX;
    this.ashearY = this.shearY;
    this.ainheritRotation = this.inheritRotation;
    this.ainheritScale = this.inheritScale;
    this.ainheritReflection = this.inheritReflection;
    this.dirty = true;
  }

  /** Inheritance mode from the **applied** booleans (spec 5.3). */
  get inherit(): InheritMode {
    return inheritMode(this.ainheritRotation, this.ainheritScale, this.ainheritReflection);
  }

  /**
   * Applied pose -> world matrix (spec 5.4, normative port of Spine 4.2
   * `Bone.updateWorldTransform`). Marks the children dirty.
   */
  updateWorldTransform(): void {
    const skeleton = this.skeleton;
    // Spec 7.11: inside a nested child `sx = sy = 1` and `skX = skY = 0`; the
    // slot matrix takes the place of the skeleton placement for the root bone.
    const nestedParent = skeleton.parentMatrix;
    const sx = nestedParent === null ? skeleton.scaleX : 1;
    const sy = nestedParent === null ? skeleton.scaleY : 1;
    const rotation = this.arotation;
    const scaleX = this.ascaleX;
    const scaleY = this.ascaleY;
    const shearX = this.ashearX;
    const shearY = this.ashearY;

    const rotY = rotation + 90 + shearY;
    let la = cosDeg(rotation + shearX) * scaleX;
    let lb = cosDeg(rotY) * scaleY;
    let lc = sinDeg(rotation + shearX) * scaleX;
    let ld = sinDeg(rotY) * scaleY;

    const parent: Matrix2x3 | null = this.parent ?? nestedParent;
    if (parent === null) {
      this.worldX = this.ax * sx + skeleton.x;
      this.worldY = this.ay * sy + skeleton.y;
      this.a = la * sx;
      this.b = lb * sx;
      this.c = lc * sy;
      this.d = ld * sy;
      this.finishWorld();
      return;
    }

    let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
    this.worldX = pa * this.ax + pb * this.ay + parent.worldX;
    this.worldY = pc * this.ax + pd * this.ay + parent.worldY;

    // Spec 7.11: the root bone of a child is computed as the `normal` case,
    // whatever its own inherit flags say.
    const mode = this.parent === null ? 'normal' : this.inherit;
    // F3: the reflection of the chain, without the whole skeleton's flip — the
    // same test `noScale` makes. The three F3 modes read it.
    const flip = (pa * pd - pb * pc < 0) !== ((sx < 0) !== (sy < 0));
    switch (mode) {
      case 'normal':
      case 'noReflection': {
        // noReflection (F3): `normal` with the parent un-reflected.
        if (mode === 'noReflection' && flip) {
          pb = -pb;
          pd = -pd;
        }
        this.a = pa * la + pb * lc;
        this.b = pa * lb + pb * ld;
        this.c = pc * la + pd * lc;
        this.d = pc * lb + pd * ld;
        this.finishWorld();
        return; // the skeleton scale already came through the parent
      }
      case 'onlyTranslation':
      case 'onlyReflection': {
        // onlyReflection (F3): the bone turns inside out with its parent.
        if (mode === 'onlyReflection' && flip) {
          lb = -lb;
          ld = -ld;
        }
        this.a = la;
        this.b = lb;
        this.c = lc;
        this.d = ld;
        break;
      }
      case 'noRotationOrReflection':
      case 'noRotation': {
        let s = pa * pa + pc * pc;
        let prx: number;
        if (s > EPSILON_DET) {
          s = Math.abs(pa * pd - pb * pc) / s;
          // noRotation (F3): the sign of the determinant stays.
          if (mode === 'noRotation' && flip) s = -s;
          pa /= sx;
          pc /= sy;
          pb = pc * s;
          pd = pa * s;
          prx = atan2Deg(pc, pa);
        } else {
          pa = 0;
          pc = 0;
          prx = 90 - atan2Deg(pd, pb);
        }
        const rx = rotation + shearX - prx;
        const ry = rotation + shearY - prx + 90;
        la = cosDeg(rx) * scaleX;
        lb = cosDeg(ry) * scaleY;
        lc = sinDeg(rx) * scaleX;
        ld = sinDeg(ry) * scaleY;
        this.a = pa * la - pb * lc;
        this.b = pa * lb - pb * ld;
        this.c = pc * la + pd * lc;
        this.d = pc * lb + pd * ld;
        break;
      }
      case 'noScale':
      case 'noScaleOrReflection': {
        const cos = cosDeg(rotation);
        const sin = sinDeg(rotation);
        let za = (pa * cos + pb * sin) / sx;
        let zc = (pc * cos + pd * sin) / sy;
        let s = Math.sqrt(za * za + zc * zc);
        if (s > EPSILON_SCALE) s = 1 / s;
        za *= s;
        zc *= s;
        s = Math.sqrt(za * za + zc * zc);
        if (mode === 'noScale' && ((pa * pd - pb * pc < 0) !== ((sx < 0) !== (sy < 0)))) s = -s;
        const r = atan2(zc, za) + PI / 2;
        const zb = Math.cos(r) * s;
        const zd = Math.sin(r) * s;
        la = cosDeg(shearX) * scaleX;
        lb = cosDeg(90 + shearY) * scaleY;
        lc = sinDeg(shearX) * scaleX;
        ld = sinDeg(90 + shearY) * scaleY;
        this.a = za * la + zb * lc;
        this.b = za * lb + zb * ld;
        this.c = zc * la + zd * lc;
        this.d = zc * lb + zd * ld;
        break;
      }
    }
    this.a *= sx;
    this.b *= sx;
    this.c *= sy;
    this.d *= sy;
    this.finishWorld();
  }

  /**
   * Recomputes this bone and every descendant, in skeleton array order
   * (parents first). For constraints that write a bone and then read one of
   * its descendants inside the same `update` (spec 5.6 dirty rule).
   */
  updateWorldTransformWithChildren(): void {
    this.updateWorldTransform();
    const bones = this.skeleton.bones;
    for (let i = this.data.index + 1; i < bones.length; i++) {
      const b = bones[i];
      if (b.isDescendantOf(this)) b.updateWorldTransform();
    }
  }

  /** `true` when `ancestor` is a (transitive) parent of this bone. */
  isDescendantOf(ancestor: Bone): boolean {
    for (let p = this.parent; p !== null; p = p.parent) if (p === ancestor) return true;
    return false;
  }

  /** Sanitizes the matrix, clears the dirty flag and dirties the children. */
  private finishWorld(): void {
    this.a = sanitize(this.a);
    this.b = sanitize(this.b);
    this.c = sanitize(this.c);
    this.d = sanitize(this.d);
    this.worldX = sanitize(this.worldX);
    this.worldY = sanitize(this.worldY);
    this.dirty = false;
    const children = this.children;
    for (let i = 0; i < children.length; i++) children[i].dirty = true;
  }

  /**
   * World matrix -> applied pose (spec 5.5 `appliedFromWorld`, port of Spine
   * 4.2 `updateAppliedTransform`), with the determinant guards of spec 5.5.
   */
  updateAppliedTransform(): void {
    const skeleton = this.skeleton;
    const sx = skeleton.scaleX;
    const sy = skeleton.scaleY;
    const parent = this.parent;
    if (parent === null) {
      this.ax = sanitize((this.worldX - skeleton.x) / sx);
      this.ay = sanitize((this.worldY - skeleton.y) / sy);
      this.arotation = sanitize(atan2Deg(this.c, this.a));
      this.ascaleX = sanitize(Math.sqrt(this.a * this.a + this.c * this.c));
      this.ascaleY = sanitize(Math.sqrt(this.b * this.b + this.d * this.d));
      this.ashearX = 0;
      this.ashearY = sanitize(atan2Deg(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c));
      return;
    }

    let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
    let pid = safeInverse(pa * pd - pb * pc);
    let ia = pd * pid, ib = pb * pid, ic = pc * pid, id = pa * pid;
    const dx = this.worldX - parent.worldX;
    const dy = this.worldY - parent.worldY;
    this.ax = sanitize(dx * ia - dy * ib);
    this.ay = sanitize(dy * id - dx * ic);

    let ra: number, rb: number, rc: number, rd: number;
    const mode = this.inherit;
    const flip = (pa * pd - pb * pc < 0) !== ((sx < 0) !== (sy < 0));
    if (mode === 'onlyTranslation' || mode === 'onlyReflection') {
      ra = this.a; rb = this.b; rc = this.c; rd = this.d;
      // onlyReflection (F3): undo the flipped second column.
      if (mode === 'onlyReflection' && flip) {
        rb = -rb;
        rd = -rd;
      }
    } else {
      if (mode === 'noReflection') {
        // noReflection (F3): the `normal` inverse, with the parent un-reflected.
        if (flip) {
          pb = -pb;
          pd = -pd;
          pid = safeInverse(pa * pd - pb * pc);
          ia = pd * pid;
          ib = pb * pid;
          ic = pc * pid;
          id = pa * pid;
        }
      } else if (mode === 'noRotationOrReflection' || mode === 'noRotation') {
        const den = pa * pa + pc * pc;
        let s = den > EPSILON_DET ? Math.abs(pa * pd - pb * pc) / den : 0;
        if (mode === 'noRotation' && flip) s = -s;
        const sa = pa / sx;
        const sc = pc / sy;
        pb = -sc * s * sx;
        pd = sa * s * sy;
        pid = safeInverse(pa * pd - pb * pc);
        ia = pd * pid;
        ib = pb * pid;
      } else if (mode === 'noScale' || mode === 'noScaleOrReflection') {
        const cos = cosDeg(this.arotation);
        const sin = sinDeg(this.arotation);
        pa = (pa * cos + pb * sin) / sx;
        pc = (pc * cos + pd * sin) / sy;
        let s = Math.sqrt(pa * pa + pc * pc);
        if (s > EPSILON_SCALE) s = 1 / s;
        pa *= s;
        pc *= s;
        s = Math.sqrt(pa * pa + pc * pc);
        if (mode === 'noScale' && ((pid < 0) !== ((sx < 0) !== (sy < 0)))) s = -s;
        const r = PI / 2 + atan2(pc, pa);
        pb = Math.cos(r) * s;
        pd = Math.sin(r) * s;
        pid = safeInverse(pa * pd - pb * pc);
        ia = pd * pid;
        ib = pb * pid;
        ic = pc * pid;
        id = pa * pid;
      }
      ra = ia * this.a - ib * this.c;
      rb = ia * this.b - ib * this.d;
      rc = id * this.c - ic * this.a;
      rd = id * this.d - ic * this.b;
    }

    this.ashearX = 0;
    this.ascaleX = Math.sqrt(ra * ra + rc * rc);
    if (this.ascaleX > EPSILON_DET) {
      const det = ra * rd - rb * rc;
      this.ascaleY = sanitize(det / this.ascaleX);
      this.ashearY = sanitize(-atan2Deg(ra * rb + rc * rd, det));
      this.arotation = sanitize(atan2Deg(rc, ra));
    } else {
      this.ascaleX = 0;
      this.ascaleY = sanitize(Math.sqrt(rb * rb + rd * rd));
      this.ashearY = 0;
      this.arotation = sanitize(90 - atan2Deg(rd, rb));
    }
    this.ascaleX = sanitize(this.ascaleX);
  }

  /** Local point -> world (spec 5.5 `localToWorld`). */
  localToWorld(lx: number, ly: number, out: Vector2 = { x: 0, y: 0 }): Vector2 {
    out.x = this.a * lx + this.b * ly + this.worldX;
    out.y = this.c * lx + this.d * ly + this.worldY;
    return out;
  }

  /** World point -> local (spec 5.5 `worldToLocal`); `(0, 0)` when `|det| <= 0.0001`. */
  worldToLocal(wx: number, wy: number, out: Vector2 = { x: 0, y: 0 }): Vector2 {
    const det = this.a * this.d - this.b * this.c;
    if (Math.abs(det) <= EPSILON_DET) {
      out.x = 0;
      out.y = 0;
      return out;
    }
    const x = wx - this.worldX;
    const y = wy - this.worldY;
    out.x = (x * this.d - y * this.b) / det;
    out.y = (y * this.a - x * this.c) / det;
    return out;
  }

  /**
   * World rotation (degrees) that a value of the bone `rotation` property
   * would produce (Spine 4.2 `localToWorldRotation`).
   */
  localToWorldRotation(localRotation: number): number {
    const r = localRotation - (this.arotation - this.ashearX);
    const cos = cosDeg(r);
    const sin = sinDeg(r);
    return atan2Deg(cos * this.c + sin * this.d, cos * this.a + sin * this.b);
  }

  /** Value of the bone `rotation` property that yields `worldRotation` (Spine 4.2 `worldToLocalRotation`). */
  worldToLocalRotation(worldRotation: number): number {
    const cos = cosDeg(worldRotation);
    const sin = sinDeg(worldRotation);
    return atan2Deg(this.a * sin - this.c * cos, this.d * cos - this.b * sin) + this.arotation - this.ashearX;
  }

  /** Rotation of the world X axis in degrees (spec 3.2). */
  get worldRotationX(): number {
    return atan2Deg(this.c, this.a);
  }

  get worldRotationY(): number {
    return atan2Deg(this.d, this.b);
  }

  get worldScaleX(): number {
    return Math.sqrt(this.a * this.a + this.c * this.c);
  }

  get worldScaleY(): number {
    return Math.sqrt(this.b * this.b + this.d * this.d);
  }
}

/** `1 / det`, or `0` when `|det| <= 0.0001` (spec 5.5). */
function safeInverse(det: number): number {
  return Math.abs(det) <= EPSILON_DET ? 0 : 1 / det;
}

// ---------------------------------------------------------------------------
// Slot
// ---------------------------------------------------------------------------

/**
 * A live nested child (spec 7.11). The class lives in `nested.ts`; only this
 * shape is needed here, so `skeleton.ts` keeps no import cycle with it.
 */
export interface NestedInstance {
  /** The `skeleton` attachment this instance was built for. */
  readonly attachment: Attachment;
  /** The child instance itself. Its `parentMatrix` is the slot bone matrix. */
  readonly skeleton: Skeleton;
  /** Animation running in the child, or `null` = its setup pose (spec 9.9). */
  readonly animationName: string | null;
  /** Child clock in seconds, after `timeScale` and the `nested/time` timeline. */
  readonly time: number;
  /** Places and poses the child for the parent clock `now` (seconds). */
  update(slot: Slot, now: number): void;
  /**
   * Spec 7.11: the slot now shows ANOTHER `skeleton` attachment. `true` when it
   * is the same entity (same resolved `uri`) and this instance goes on living
   * under the new attachment; `false` when it is something else and must go.
   */
  rebind(attachment: Attachment): boolean;
}

/**
 * Builds the child instance of a `skeleton` attachment, or returns `null`
 * when it cannot be built (unresolved `uri`, cycle, depth over the limit).
 * Replaced by `nested.ts`; the default builds nothing, so a runtime that never
 * imports `nested.ts` behaves like the level A / B reader of spec 7.11.
 */
export type NestedFactory = (slot: Slot) => NestedInstance | null;

let nestedFactory: NestedFactory = () => null;

/** Installs the factory used for `skeleton` attachments. Called by `nested.ts`. */
export function registerNestedFactory(factory: NestedFactory): void {
  nestedFactory = factory;
}

export class Slot {
  readonly data: SlotData;
  readonly skeleton: Skeleton;
  /**
   * The APPLIED bone (spec 9.5): the bone of the file, or the one a
   * `slot/bone` key hangs the slot from. `setToSetupPose` restores the file's.
   * The slot never enters the bone tree: this only says whose matrix the
   * attachment reads.
   */
  bone: Bone;
  /** The bone written in the file (spec 5.1). */
  readonly setupBone: Bone;
  /**
   * `T(x, y) R(rotation) S(scaleX, scaleY)` of the active `slot/bone` key, or
   * `null` = identity (spec 9.5). Multiplied between the bone and the
   * attachment of `region`, unweighted mesh, `point`, box and `skeleton`.
   */
  boneTransform: Matrix2x3 | null = null;
  /** Scratch for `boneMatrix` when `boneTransform` is set. */
  private readonly boneMatrixScratch: Matrix2x3 = identityMatrix();
  /**
   * Weights of this frame (spec 9.6 `weights`), in `binding.weights` order, for
   * `weightsAttachment`. `null` = the weights of the file.
   */
  weights: Float64Array | null = null;
  /** Attachment (its `timelineAttachment`) the weights belong to. */
  weightsAttachment: VertexAttachment | null = null;

  /** Placeholder currently requested (setup or animation). `null` = empty. */
  attachmentName: string | null = null;
  /** Attachment resolved through the active skins. `null` = nothing drawn. */
  attachment: Attachment | null = null;
  /** `[r, g, b, a]` tint, straight alpha. */
  readonly color = new Float64Array(4);
  /** `[r, g, b]` tint black, or `null` = off. */
  darkColor: Float64Array | null = null;
  visible = true;
  /** Current deform (layout of spec 7.4) for `deformAttachment`, or `null`. */
  deform: Float64Array | null = null;
  /** Attachment (its `timelineAttachment`) the deform belongs to. */
  deformAttachment: VertexAttachment | null = null;
  /** Current sequence frame; `-1` = show `sequence.setup`. */
  sequenceIndex = -1;
  /**
   * Scratch buffer for `VertexAttachment.computeDelta` (deform + morph sum),
   * reused between frames so no array is allocated per attachment per frame.
   */
  deltaScratch: Float64Array | null = null;

  // Nested skeleton control (spec 9.9 `nested`), written by timelines. `null`
  // / `NaN` = not driven: the child uses its `skeleton` attachment defaults.
  /** Animation name requested for the child skeleton (`null` = its setup pose). */
  nestedAnimation: string | null = null;
  /** `true` when a `nested/animation` timeline has written `nestedAnimation`. */
  nestedAnimationSet = false;
  /** Child time driven by a `nested/time` timeline (`NaN` = free-running clock). */
  nestedTime = Number.NaN;
  /** Multiplier of the child clock (`NaN` = the attachment `timeScale`). */
  nestedTimeScale = Number.NaN;
  /**
   * Parent animation time the entity shown here became active (Appendix C
   * rule 1): the start of the run of `slot/attachment` keys with the value in
   * force, or 0 without such a timeline. Written by `applyAnimation`.
   */
  nestedOrigin = 0;
  /** Start of the run of `nested/animation` keys with the value in force (spec 9.9). */
  nestedAnimationOrigin = 0;
  /**
   * Live child instance for the current `skeleton` attachment, created on
   * demand by `nested.ts`. Survives `setToSetupPose` (rebuilding it every
   * frame would throw the child's physics away), and is dropped when the
   * attachment changes.
   */
  nested: NestedInstance | null = null;

  constructor(data: SlotData, skeleton: Skeleton, bone: Bone) {
    this.data = data;
    this.skeleton = skeleton;
    this.bone = bone;
    this.setupBone = bone;
    this.setToSetupPose();
  }

  /**
   * World matrix the attachment of this slot is measured from (spec 9.5):
   * the applied bone, times the `transform` of the active `slot/bone` key.
   * Weighted vertices do not use it: they are measured from their own bones.
   * Read it after the world transform is up to date; it is not stored.
   */
  get boneMatrix(): Matrix2x3 {
    const t = this.boneTransform;
    return t === null ? this.bone : multiplyMatrix(this.bone, t, this.boneMatrixScratch);
  }

  /**
   * Hangs the slot from `bone` with the key `transform` (spec 9.5). `null` =
   * the bone of the file, and the transform is dropped with it.
   */
  setBone(bone: Bone | null, transform: Matrix2x3 | null): void {
    if (bone === null) {
      this.bone = this.setupBone;
      this.boneTransform = null;
      return;
    }
    this.bone = bone;
    this.boneTransform = transform;
  }

  /** Restores bone, color, dark color, visibility, deform, weights, sequence and the setup attachment (spec 5.1). */
  setToSetupPose(): void {
    const d = this.data;
    this.bone = this.setupBone;
    this.boneTransform = null;
    this.weights = null;
    this.weightsAttachment = null;
    this.color.set(d.color);
    this.darkColor = d.darkColor === null ? null : Float64Array.from(d.darkColor);
    this.visible = d.visible;
    this.deform = null;
    this.deformAttachment = null;
    this.sequenceIndex = -1;
    this.nestedAnimation = null;
    this.nestedAnimationSet = false;
    this.nestedTime = Number.NaN;
    this.nestedTimeScale = Number.NaN;
    this.nestedOrigin = 0;
    this.nestedAnimationOrigin = 0;
    this.setAttachmentName(d.attachmentName);
  }

  /** Blend mode (setup value; not animatable). */
  get blend(): SlotData['blend'] {
    return this.data.blend;
  }

  /** Requests a placeholder; the attachment is resolved through the active skins. */
  setAttachmentName(name: string | null): void {
    this.attachmentName = name;
    this.setAttachment(name === null ? null : this.skeleton.getAttachment(this.data.index, name));
  }

  /** Sets the attachment object directly. Resets deform and sequence state when it changes. */
  setAttachment(attachment: Attachment | null): void {
    if (this.attachment === attachment) return;
    const oldTimeline = this.attachment instanceof VertexAttachment ? this.attachment.timelineAttachment : null;
    const newTimeline = attachment instanceof VertexAttachment ? attachment.timelineAttachment : null;
    if (oldTimeline !== newTimeline) {
      this.deform = null;
      this.deformAttachment = null;
      this.weights = null;
      this.weightsAttachment = null;
    }
    this.attachment = attachment;
    this.sequenceIndex = -1;
    // The instance is NOT dropped here: a setup pose that shows something else
    // and a key that shows the entity again in the same frame must not throw
    // the child away. `Skeleton.updateNested` decides, on the final attachment
    // of the frame (Appendix C rule 16).
  }

  /**
   * Live child of a `skeleton` attachment (spec 7.11), built on first use.
   * `null` when the attachment is not a nested skeleton, when its `uri` did
   * not resolve, or when the chain would loop or go past depth 8.
   */
  nestedSkeleton(): NestedInstance | null {
    if (this.attachment === null || this.attachment.type !== 'skeleton') return null;
    if (this.nested !== null && this.nested.attachment !== this.attachment && this.nested.rebind(this.attachment)) {
      return this.nested;
    }
    if (this.nested === null || this.nested.attachment !== this.attachment) this.nested = nestedFactory(this);
    return this.nested;
  }

  /** Re-resolves `attachmentName` after a skin change. */
  refreshAttachment(): void {
    const name = this.attachmentName;
    this.setAttachment(name === null ? null : this.skeleton.getAttachment(this.data.index, name));
  }
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export class Skeleton {
  readonly data: SkeletonData;
  readonly bones: Bone[];
  /**
   * Bones in calculation order (spec 5.6): parents before children. Equal to
   * `bones` until a `parent` key (spec 9.4) moves a bone; rebuilt on demand.
   */
  updateOrder: Bone[];
  /** `true` when a re-parent happened since `updateOrder` was built. */
  orderDirty = false;
  /** Once-per-skeleton runtime notices (L2, spec 12.3), in Portuguese. */
  readonly warnings: string[] = [];
  readonly slots: Slot[];
  /** Current draw order (spec 9.5). Setup: `baseDrawOrder`. */
  drawOrder: Slot[];
  /**
   * Base draw order (spec 4.4): the `slots` array order with the `drawOrder`
   * of the active skins applied on top. What `[]` in a `drawOrder` timeline
   * returns to, and what its offsets are measured from. Rebuilt by `setSkin`.
   */
  baseDrawOrder: Slot[];
  /** Constraint instances in file order (unknown types skipped). */
  readonly constraints: Constraint[];

  /** Skeleton position and scale given by the game (spec 5.4 `skX, skY, sx, sy`). */
  x = 0;
  y = 0;
  scaleX = 1;
  scaleY = 1;

  /**
   * Matrix the root bones hang from when this skeleton is nested in a slot
   * (spec 7.11): `M_slotBone x T(x, y) R(rotation) S(scaleX, scaleY)`. While
   * it is set, `x`, `y`, `scaleX` and `scaleY` are ignored, as spec 7.11 asks.
   * `null` = a top-level skeleton.
   */
  parentMatrix: Matrix2x3 | null = null;
  /** Slot this skeleton is nested in, or `null` at the top level (spec 7.11). */
  readonly nestedOwner: Slot | null;
  /** Things the nested machinery wants the user to know, in Portuguese. */
  readonly nestedWarnings: string[] = [];

  /** Current parameter values, by parameter index (spec 8.1). */
  readonly parameters: Float64Array;
  /** Current morph weights, by morph index (spec 8.3). */
  readonly morphWeights: Float64Array;
  /** Current variable values, by variable index (spec 8.4). */
  readonly variables: VariableValue[];
  /** Tags active at the moment (spec 8.5). */
  tags: readonly string[] = [];
  /**
   * The animation `Pose` is applying to this skeleton, and its time: "the one
   * the parent is playing" of spec 7.11 (`inheritAnimation`). Written by
   * `applyAnimation` (by `AnimationState` for track 0), cleared by
   * `setToSetupPose`.
   */
  playingAnimation: string | null = null;
  /** Time inside `playingAnimation`, loop already applied. */
  playingTime = 0;
  /** Whether `playingAnimation` loops (Appendix C rule 4). Set by the caller that knows. */
  playingLoop = false;
  /**
   * Skeleton time in seconds (spec 5.6 / 6.5 `now`): monotonic, written by
   * `updateWorldTransform(now)` or `advance(dt)`. Physics reads it.
   */
  time = 0;

  /**
   * The skin STACK (spec 4.4), bottom to top: where two skins give the same
   * placeholder, the one on top wins. `default` is a skin like the others and
   * is active only while it is in here. A new skeleton starts with
   * `[default]`, so a file with no skin choice opens as it always did.
   */
  readonly skinStack: SkinData[] = [];
  /** Bones activated by the active skins (union). */
  readonly activeSkinBones = new Set<BoneData>();
  /** Constraints activated by the active skins (union). */
  readonly activeSkinConstraints = new Set<ConstraintData>();
  /** Per slot: placeholder -> attachment (`null` = hidden), combined across skins. */
  private attachmentLookup: Map<string, Attachment | null>[];
  /** `ConstraintData` -> runtime instance (types without a factory are absent). */
  private readonly constraintByData = new Map<ConstraintData, Constraint>();

  /**
   * `nestedOwner` is the slot this instance hangs from when it is a child of
   * spec 7.11. It is set before anything else so the child, while building
   * ITS own children, already knows the chain that leads to it (cycle and
   * depth detection).
   */
  constructor(data: SkeletonData, nestedOwner: Slot | null = null) {
    this.data = data;
    this.nestedOwner = nestedOwner;
    if (nestedOwner !== null) this.parentMatrix = identityMatrix();
    this.bones = new Array<Bone>(data.bones.length);
    for (let i = 0; i < data.bones.length; i++) {
      const bd = data.bones[i];
      const parent = bd.parent === null ? null : this.bones[bd.parent.index];
      this.bones[i] = new Bone(bd, this, parent);
    }
    this.updateOrder = this.bones.slice();
    this.orderDirty = false;
    this.parameters = new Float64Array(data.parameters.length);
    this.morphWeights = new Float64Array(data.morphs.length);
    this.variables = data.variables.map((v) => v.default);
    this.attachmentLookup = data.slots.map(() => new Map());
    this.skinStack.push(data.defaultSkin);
    this.rebuildSkinLookup();
    this.slots = data.slots.map((sd) => new Slot(sd, this, this.bones[sd.bone.index]));
    this.baseDrawOrder = this.slots.slice();
    this.rebuildBaseDrawOrder();
    this.drawOrder = this.baseDrawOrder.slice();
    this.constraints = [];
    for (const cd of data.constraints) {
      const c = createConstraint(cd, this);
      if (c !== null) {
        this.constraints.push(c);
        this.constraintByData.set(cd, c);
      }
    }
    this.setToSetupPose();
    this.updateWorldTransform(0);
    // The line above is a warm-up: it fills the world matrices so a freshly
    // built skeleton can be drawn or measured before any pose update. It is
    // NOT a pose update, and spec 6.5 says the physics state begins at the
    // FIRST `updatePose`. Without the reset below, the warm-up consumed the
    // `reset = true` frame, and the first real update already carried an
    // inertia offset: measured on `heroi.bone`, the `hair` bone came out at
    // 161.05 degrees at t = 0 where the second runtime read 160. A constructor
    // is invisible to the conformance harness, so a runtime that simulates in
    // it can never agree with one that does not (spec 12.4).
    this.physicsReset();
  }

  // -- setup pose ------------------------------------------------------------

  /** Everything back to the file values (spec 5.1). */
  setToSetupPose(): void {
    this.setBonesToSetupPose();
    this.setSlotsToSetupPose();
    for (const c of this.constraints) c.setToSetupPose();
    const params = this.data.parameters;
    for (let i = 0; i < params.length; i++) this.parameters[i] = params[i].default;
    const morphs = this.data.morphs;
    for (let i = 0; i < morphs.length; i++) this.morphWeights[i] = morphs[i].weight;
    const vars = this.data.variables;
    for (let i = 0; i < vars.length; i++) this.variables[i] = vars[i].default;
    this.tags = [];
    this.playingAnimation = null;
    this.playingTime = 0;
    this.playingLoop = false;
  }

  setBonesToSetupPose(): void {
    for (const b of this.bones) b.setToSetupPose();
  }

  /** Slots back to setup, including the draw order. */
  setSlotsToSetupPose(): void {
    for (const s of this.slots) s.setToSetupPose();
    this.drawOrder = this.baseDrawOrder.slice();
  }

  // -- world transform (spec 5.6) ----------------------------------------------

  /**
   * Reference `updatePose(skeleton, now)` (spec 5.6): applied = local,
   * constraints in file order (each reading up-to-date bones), final world
   * pass. `now` is the skeleton time in seconds (spec 6.5), stored in `time`;
   * omitted = pose only, the clock does not move. Use `advance(dt)` when only
   * a delta is known.
   */
  updateWorldTransform(now: number = this.time): void {
    this.time = now;
    if (this.orderDirty) this.rebuildUpdateOrder();
    const bones = this.updateOrder;
    for (let i = 0; i < bones.length; i++) bones[i].updateAppliedFromLocal();
    this.updateDirtyBones();

    const constraints = this.constraints;
    for (let i = 0; i < constraints.length; i++) {
      const c = constraints[i];
      const d = c.data;
      if (d.skinRequired && !this.activeSkinConstraints.has(d)) continue;
      if (!c.active || c.mix === 0) continue;
      this.updateDirtyBones();
      c.update(this, now);
    }
    this.updateDirtyBones();
    this.updateNested(now);
  }

  /**
   * Poses every nested child (spec 7.11), after the bones of this skeleton are
   * final: the child hangs from the world matrix of its slot bone. Recursive
   * through the child's own `updateWorldTransform`; the depth is bounded when
   * the instances are created.
   */
  updateNested(now: number): void {
    const slots = this.slots;
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const att = slot.attachment;
      // Appendix C rule 16: the instance is gone as soon as the slot stops
      // showing it — by key, by skin or by body. If it comes back it is a new
      // instance, clock by rule 1.
      // Not gone when the slot only moved to another placeholder of the SAME
      // entity (same `uri`, spec 7.11): the instance lives on, no warning.
      if (slot.nested !== null && slot.nested.attachment !== att && (att === null || !slot.nested.rebind(att))) {
        const uri = (slot.nested.attachment as { uri?: string }).uri ?? slot.nested.attachment.name;
        this.nestedRoot.warnNested(`NESTED_GONE: a entidade "${uri}" deixou de ser mostrada no slot "${slot.data.name}" (7.11)`);
        slot.nested = null;
      }
      if (att === null || att.type !== 'skeleton' || !slot.visible) continue;
      const nested = slot.nestedSkeleton();
      if (nested !== null) nested.update(slot, now);
    }
  }

  /** The top-level skeleton of the nesting chain this one belongs to. */
  get nestedRoot(): Skeleton {
    let root: Skeleton = this;
    while (root.nestedOwner !== null) root = root.nestedOwner.skeleton;
    return root;
  }

  /** Records a nested notice once, in `nestedWarnings`. */
  warnNested(message: string): void {
    if (!this.nestedWarnings.includes(message)) this.nestedWarnings.push(message);
  }

  /** Depth of this instance in the nesting chain: `0` at the top (spec 7.11). */
  get nestedDepth(): number {
    let depth = 0;
    for (let owner = this.nestedOwner; owner !== null; owner = owner.skeleton.nestedOwner) depth++;
    return depth;
  }

  /** `updateWorldTransform(time + dt)`: moves the clock by `dt` seconds (`dt < 0` is treated as 0). */
  advance(dt: number): void {
    this.updateWorldTransform(this.time + (dt > 0 ? dt : 0));
  }

  /**
   * Recomputes every dirty bone in array order (parents first). Constraints
   * call this before reading bones they did not write themselves.
   */
  updateDirtyBones(): void {
    if (this.orderDirty) this.rebuildUpdateOrder();
    const bones = this.updateOrder;
    for (let i = 0; i < bones.length; i++) {
      const b = bones[i];
      if (b.dirty) b.updateWorldTransform();
    }
  }

  /**
   * Spec 5.6: parents before children, in file order among siblings, walked
   * from the roots through the CURRENT `children` lists. Called when a
   * `parent` key changed the tree (spec 9.4), and kept until it changes again.
   */
  rebuildUpdateOrder(): void {
    const out: Bone[] = [];
    const visit = (b: Bone): void => {
      out.push(b);
      const children = b.children;
      for (let i = 0; i < children.length; i++) visit(children[i]);
    };
    const bones = this.bones;
    for (let i = 0; i < bones.length; i++) if (bones[i].parent === null) visit(bones[i]);
    if (out.length !== bones.length) {
      // Unreachable bones (never expected): keep them, in file order.
      for (let i = 0; i < bones.length; i++) if (!out.includes(bones[i])) out.push(bones[i]);
    }
    this.updateOrder = out;
    this.orderDirty = false;
  }

  /** Records a runtime notice once (spec 12.2, item 9: avisar uma vez). */
  warnOnce(message: string): void {
    if (!this.warnings.includes(message)) this.warnings.push(message);
  }

  /** Resets the state of every constraint (spec 6.5 `physicsReset`). */
  physicsReset(): void {
    for (const c of this.constraints) c.reset();
  }

  // -- skins (spec 4.4, 7.1) ---------------------------------------------------

  /**
   * Skins of the stack above `default`, bottom to top: the view the editor
   * has always read. `default` is left out wherever it sits.
   */
  get activeSkins(): readonly SkinData[] {
    return this.skinStack.filter((skin) => skin !== this.data.defaultSkin);
  }

  /**
   * Replaces the skin STACK, bottom to top (spec 4.4): exactly the list, and
   * nothing else. `default` is active only if it is listed; an empty list
   * shows no skin at all. The skin on top wins. Accepts names or `SkinData`;
   * an unknown name throws. Slots keep the placeholder they requested and
   * re-resolve it. The skeleton is not rebuilt.
   */
  setSkinStack(skins: readonly (string | SkinData)[]): void {
    const stack: SkinData[] = [];
    for (const s of skins) {
      const skin = typeof s === 'string' ? this.data.findSkin(s) : s;
      if (skin === null) throw new Error(`skin not found: "${String(s)}"`);
      stack.push(skin);
    }
    this.skinStack.length = 0;
    this.skinStack.push(...stack);
    this.refreshSkins();
  }

  /**
   * COMPATIBILIDADE COM O EDITOR ATÉ O D9 (a pilha na tela). `default` at the
   * bottom, then the given skins, bottom to top (`null` / empty = only
   * `default`). This is NOT the stack of spec 4.4: the editor still counts on
   * `default` being underneath. The pure stack, the one the conformance suite
   * uses, is `setSkinStack`. Remove this when the editor moves to the stack.
   */
  setSkin(skins: string | SkinData | null | readonly (string | SkinData)[]): void {
    const list: (string | SkinData)[] = skins === null ? [] : Array.isArray(skins) ? skins.slice() : [skins as string | SkinData];
    const stack: SkinData[] = [this.data.defaultSkin];
    for (const s of list) {
      const skin = typeof s === 'string' ? this.data.findSkin(s) : s;
      if (skin === null) throw new Error(`skin not found: "${String(s)}"`);
      if (skin !== this.data.defaultSkin) stack.push(skin);
    }
    this.setSkinStack(stack);
  }

  /** Re-resolves every slot and the base draw order after the stack changed. */
  private refreshSkins(): void {
    this.rebuildSkinLookup();
    for (const slot of this.slots) slot.refreshAttachment();
    this.rebuildBaseDrawOrder();
    this.drawOrder = this.baseDrawOrder.slice();
  }

  /**
   * The resolution list of spec 4.4: for each skin of the stack, bottom to
   * top, its includes expanded in order, then the skin itself.
   */
  skinResolutionList(): SkinData[] {
    const out: SkinData[] = [];
    for (const s of this.skinStack) s.expand(out);
    return out;
  }

  /**
   * Spec 4.4 base order: the array order, then the `drawOrder` of every skin
   * in the resolution list, each applied with the 9.5 algorithm over the
   * order the previous ones left.
   */
  private rebuildBaseDrawOrder(): void {
    let order: number[] = this.slots.map((_, i) => i);
    const skins = this.skinResolutionList();
    for (const skin of skins) {
      if (skin.drawOrder.length === 0) continue;
      order = orderFromOffsets(order, skin.drawOrder.map((e) => ({ slot: e.slot.index, offset: e.offset })));
    }
    this.baseDrawOrder = order.map((i) => this.slots[i]);
  }

  /** Adds one skin on top of the stack (mix and match). */
  addSkin(skin: string | SkinData): void {
    this.setSkinStack([...this.skinStack, skin]);
  }

  private rebuildSkinLookup(): void {
    const lookup = this.attachmentLookup;
    for (const m of lookup) m.clear();
    this.activeSkinBones.clear();
    this.activeSkinConstraints.clear();
    const order = this.skinResolutionList();
    // Later skins override earlier ones: iterating in order and overwriting
    // equals the reversed lookup of spec 4.4 (the skin on top wins).
    for (const skin of order) {
      for (const [slotIndex, map] of skin.attachments) {
        const target = lookup[slotIndex];
        if (target === undefined) continue;
        for (const [name, att] of map) target.set(name, att);
      }
      for (const b of skin.bones) this.activeSkinBones.add(b);
      for (const c of skin.constraints) this.activeSkinConstraints.add(c);
    }
  }

  /**
   * Attachment for `(slot, placeholder)` through the skin stack. `null` when
   * hidden or undefined (spec 4.4, 7.1).
   */
  getAttachment(slot: number | string, name: string): Attachment | null {
    const index = typeof slot === 'number' ? slot : (this.data.findSlot(slot)?.index ?? -1);
    if (index < 0 || index >= this.attachmentLookup.length) return null;
    return this.attachmentLookup[index].get(name) ?? null;
  }

  /** Requests a placeholder for a slot by name (`null` = empty). */
  setAttachment(slotName: string, attachmentName: string | null): void {
    const slot = this.findSlot(slotName);
    if (slot === null) throw new Error(`slot not found: "${slotName}"`);
    slot.setAttachmentName(attachmentName);
  }

  // -- lookups -----------------------------------------------------------------

  findBone(name: string): Bone | null {
    const d = this.data.findBone(name);
    return d === null ? null : this.bones[d.index];
  }

  findSlot(name: string): Slot | null {
    const d = this.data.findSlot(name);
    return d === null ? null : this.slots[d.index];
  }

  findConstraint(name: string): Constraint | null {
    for (const c of this.constraints) if (c.data.name === name) return c;
    return null;
  }

  /** Runtime instance of `data`, or `null` when its type has no factory. */
  constraintFor(data: ConstraintData): Constraint | null {
    return this.constraintByData.get(data) ?? null;
  }

  /** Writes a parameter value through `ParameterData.constrain` (spec 8.1). Returns `false` when the name is unknown. */
  setParameter(name: string, value: number): boolean {
    const p = this.data.findParameter(name);
    if (p === null) return false;
    this.parameters[p.index] = p.constrain(value);
    return true;
  }

  get root(): Bone {
    return this.bones[0];
  }

  // -- bounds --------------------------------------------------------------------

  /**
   * Axis-aligned bounds of the visible `region`, `mesh`, `linkedmesh` and
   * `boundingbox` attachments in world space. All zeros when nothing is visible.
   */
  getBounds(out: Bounds = { x: 0, y: 0, width: 0, height: 0 }): Bounds {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let scratch: Float64Array = new Float64Array(8);
    for (const slot of this.drawOrder) {
      const att = slot.attachment;
      if (att === null || !slot.visible) continue;
      let count = 0;
      if (att instanceof RegionAttachment) {
        att.computeWorldVertices(slot, scratch, 0, 2);
        count = 8;
      } else if (att instanceof MeshAttachment || att instanceof LinkedMeshAttachment || att instanceof BoundingBoxAttachment) {
        count = att.vertexCount * 2;
        if (scratch.length < count) scratch = new Float64Array(count);
        att.computeWorldVertices(slot, scratch, 0, 2);
      } else if (att.type === 'skeleton' && slot.nested !== null) {
        // Spec 7.11: the child counts as part of the parent's drawing.
        const box = slot.nested.skeleton.getBounds();
        if (box.width !== 0 || box.height !== 0) {
          if (box.x < minX) minX = box.x;
          if (box.x + box.width > maxX) maxX = box.x + box.width;
          if (box.y < minY) minY = box.y;
          if (box.y + box.height > maxY) maxY = box.y + box.height;
        }
        continue;
      } else {
        continue;
      }
      for (let i = 0; i < count; i += 2) {
        const x = scratch[i];
        const y = scratch[i + 1];
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
    if (minX === Infinity) {
      out.x = 0; out.y = 0; out.width = 0; out.height = 0;
    } else {
      out.x = minX; out.y = minY; out.width = maxX - minX; out.height = maxY - minY;
    }
    return out;
  }
}
