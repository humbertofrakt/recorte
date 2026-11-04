// SPDX-License-Identifier: Apache-2.0
/**
 * `clipping` attachment: polygonal mask that clips the slots drawn after it
 * (spec 7.7). Never drawn itself.
 */

import { VertexAttachment, BindingData } from './vertex-attachment.js';
import type { SlotData } from '../data.js';

export class ClippingAttachment extends VertexAttachment {
  readonly type = 'clipping' as const;
  /** Last clipped slot (inclusive) in the current draw order. `null` = none. */
  readonly endSlot: SlotData | null;
  /** Explicit list of clipped slots. When present `endSlot` is ignored. */
  readonly slots: readonly SlotData[] | null;
  readonly invert: boolean;

  constructor(
    name: string,
    options: {
      color?: ArrayLike<number>;
      vertices?: ArrayLike<number> | null; binding?: BindingData | null;
      endSlot?: SlotData | null; slots?: readonly SlotData[] | null; invert?: boolean;
    } = {},
  ) {
    super(name, options.color, options.vertices ?? null, options.binding ?? null);
    this.endSlot = options.endSlot ?? null;
    this.slots = options.slots ?? null;
    this.invert = options.invert ?? false;
  }

  /** Whether this mask clips anything at all (spec 7.7). */
  get clipsAnything(): boolean {
    return this.slots !== null || this.endSlot !== null;
  }
}
