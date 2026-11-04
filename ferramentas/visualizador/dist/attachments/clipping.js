// SPDX-License-Identifier: Apache-2.0
/**
 * `clipping` attachment: polygonal mask that clips the slots drawn after it
 * (spec 7.7). Never drawn itself.
 */
import { VertexAttachment } from './vertex-attachment.js';
export class ClippingAttachment extends VertexAttachment {
    type = 'clipping';
    /** Last clipped slot (inclusive) in the current draw order. `null` = none. */
    endSlot;
    /** Explicit list of clipped slots. When present `endSlot` is ignored. */
    slots;
    invert;
    constructor(name, options = {}) {
        super(name, options.color, options.vertices ?? null, options.binding ?? null);
        this.endSlot = options.endSlot ?? null;
        this.slots = options.slots ?? null;
        this.invert = options.invert ?? false;
    }
    /** Whether this mask clips anything at all (spec 7.7). */
    get clipsAnything() {
        return this.slots !== null || this.endSlot !== null;
    }
}
