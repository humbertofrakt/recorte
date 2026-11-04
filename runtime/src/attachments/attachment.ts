// SPDX-License-Identifier: Apache-2.0
/**
 * Base class of every attachment (spec 7.2).
 *
 * The attachment name is the placeholder key inside `skin.attachments[slot]`.
 * `color` multiplies the slot color (spec 7.12).
 */

import type { AttachmentType } from '../types.js';

export abstract class Attachment {
  /** Placeholder name (key inside the skin). */
  readonly name: string;
  abstract readonly type: AttachmentType;
  /** `[r, g, b, a]`, straight alpha, 0..1. */
  readonly color: Float64Array;

  protected constructor(name: string, color: ArrayLike<number> = [1, 1, 1, 1]) {
    this.name = name;
    this.color = new Float64Array([color[0] ?? 1, color[1] ?? 1, color[2] ?? 1, color[3] ?? 1]);
  }
}
