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
import { atan2Deg, cosDeg, sinDeg } from '../math.js';
export class PointAttachment extends Attachment {
    type = 'point';
    x;
    y;
    rotation;
    constructor(name, options = {}) {
        super(name, options.color);
        this.x = options.x ?? 0;
        this.y = options.y ?? 0;
        this.rotation = options.rotation ?? 0;
    }
    /** World position (spec 7.9 `pointWorld`). */
    computeWorldPosition(bone, out = { x: 0, y: 0 }) {
        out.x = bone.a * this.x + bone.b * this.y + bone.worldX;
        out.y = bone.c * this.x + bone.d * this.y + bone.worldY;
        return out;
    }
    /** World rotation in degrees (spec 7.9 `pointWorld`). */
    computeWorldRotation(bone) {
        const cos = cosDeg(this.rotation);
        const sin = sinDeg(this.rotation);
        return atan2Deg(cos * bone.c + sin * bone.d, cos * bone.a + sin * bone.b);
    }
}
