// SPDX-License-Identifier: Apache-2.0
/**
 * `point` attachment: a named position and rotation (spec 7.9). Spawn points,
 * camera targets. Not a socket: since the 0.2 draft the entity follows the
 * image (7.11), and a point is only what the game reads.
 *
 * The matrix passed in is the slot's applied bone — `Slot.boneMatrix`, which
 * carries the `transform` of a `slot/bone` key (spec 9.5).
 */

import { Attachment } from './attachment.js';
import { atan2Deg, cosDeg, sinDeg, type Matrix2x3, type Vector2 } from '../math.js';

export class PointAttachment extends Attachment {
  readonly type = 'point' as const;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;

  constructor(name: string, options: { color?: ArrayLike<number>; x?: number; y?: number; rotation?: number } = {}) {
    super(name, options.color);
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.rotation = options.rotation ?? 0;
  }

  /** World position (spec 7.9 `pointWorld`). */
  computeWorldPosition(bone: Matrix2x3, out: Vector2 = { x: 0, y: 0 }): Vector2 {
    out.x = bone.a * this.x + bone.b * this.y + bone.worldX;
    out.y = bone.c * this.x + bone.d * this.y + bone.worldY;
    return out;
  }

  /** World rotation in degrees (spec 7.9 `pointWorld`). */
  computeWorldRotation(bone: Matrix2x3): number {
    const cos = cosDeg(this.rotation);
    const sin = sinDeg(this.rotation);
    return atan2Deg(cos * bone.c + sin * bone.d, cos * bone.a + sin * bone.b);
  }
}
