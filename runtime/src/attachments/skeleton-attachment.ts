// SPDX-License-Identifier: Apache-2.0
/**
 * `skeleton` attachment: a complete nested skeleton inside a slot (spec 7.11).
 *
 * The attachment stores the definition and computes the parent matrix the
 * child root receives: `M_slotBone x T(x, y) R(rotation) S(scaleX, scaleY)`.
 *
 * `child` is the loaded file behind `uri`. The loader fills it when the caller
 * hands it a skeleton map (`LoadOptions.skeletons`) or when the file came out
 * of a `.bonez` that carries the child too. `null` means "not resolved": the
 * placeholder is drawn as empty and the reader warns once (spec 7.11, 2.8).
 * `nested.ts` turns a resolved `child` into a live instance.
 */

import { Attachment } from './attachment.js';
import type { SkeletonData } from '../data.js';
import { composeMatrix, identityMatrix, multiplyMatrix, type Matrix2x3 } from '../math.js';

export class SkeletonAttachment extends Attachment {
  readonly type = 'skeleton' as const;
  readonly uri: string;
  readonly skins: readonly string[];
  readonly animation: string | null;
  readonly loop: boolean;
  readonly timeScale: number;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly inheritColor: boolean;
  /** Spec 7.11 channel 2: play the animation with the name the parent is playing. */
  readonly inheritAnimation: boolean;
  /** Spec 7.11 background channel: child animation always running underneath, looping. */
  readonly baseAnimation: string | null;
  /**
   * Spec 7.11, "around": the child's slot that marks the middle. The child is
   * drawn around the skeleton that receives it — what comes before that slot
   * behind the whole of it, what comes after in front. `null` = one block.
   */
  readonly around: string | null;

  /**
   * `uri` resolved against `assets.skeletonsBase` (spec 2.8). Written by the
   * loader; equal to `uri` while nothing resolved it.
   */
  resolvedUri: string;
  /** The loaded child file, or `null` while `uri` did not resolve (spec 7.11). */
  child: SkeletonData | null = null;

  /** `T(x, y) R(rotation) S(scaleX, scaleY)`, precomputed. */
  private readonly localMatrix: Matrix2x3;

  constructor(
    name: string,
    options: {
      color?: ArrayLike<number>; uri: string; skins?: readonly string[]; animation?: string | null;
      loop?: boolean; timeScale?: number; x?: number; y?: number; rotation?: number;
      scaleX?: number; scaleY?: number; inheritColor?: boolean;
      inheritAnimation?: boolean; baseAnimation?: string | null; around?: string | null;
    },
  ) {
    super(name, options.color);
    this.uri = options.uri;
    this.resolvedUri = options.uri;
    this.skins = options.skins ?? [];
    this.animation = options.animation ?? null;
    this.loop = options.loop ?? true;
    this.timeScale = options.timeScale ?? 1;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.rotation = options.rotation ?? 0;
    this.scaleX = options.scaleX ?? 1;
    this.scaleY = options.scaleY ?? 1;
    this.inheritColor = options.inheritColor ?? true;
    this.inheritAnimation = options.inheritAnimation ?? false;
    this.baseAnimation = options.baseAnimation ?? null;
    this.around = options.around ?? null;
    this.localMatrix = composeMatrix(this.x, this.y, this.rotation, this.scaleX, this.scaleY);
  }

  /**
   * Matrix the child root bone uses as its parent (spec 7.11):
   * `P = M x T(x, y) R(rotation) S(scaleX, scaleY)`, with `M` the matrix of the
   * slot's APPLIED bone — `Slot.boneMatrix`, which already carries the
   * `transform` of a `slot/bone` key (9.5). The entity follows the image.
   */
  computeParentMatrix(bone: Matrix2x3, out: Matrix2x3 = identityMatrix()): Matrix2x3 {
    return multiplyMatrix(bone, this.localMatrix, out);
  }
}
