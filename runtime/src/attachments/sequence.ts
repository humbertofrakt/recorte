// SPDX-License-Identifier: Apache-2.0
/**
 * Image sequence inside a `region`, `mesh` or `linkedmesh` (spec 7.10).
 * Only the image changes between frames; vertices, weights and UVs stay.
 */

import type { AtlasRegionData } from '../data.js';

export class SequenceData {
  /** Number of frames. */
  readonly count: number;
  /** Frame image names, already generated (`frames[]` or `path + number`). */
  readonly frames: readonly string[];
  readonly start: number;
  readonly digits: number;
  /** Frame shown in the setup pose. */
  readonly setup: number;
  /** Atlas region per frame, resolved by the loader (`null` = missing image). */
  readonly regions: (AtlasRegionData | null)[];

  constructor(frames: readonly string[], start: number, digits: number, setup: number) {
    this.frames = frames;
    this.count = frames.length;
    this.start = start;
    this.digits = digits;
    this.setup = setup;
    this.regions = new Array<AtlasRegionData | null>(frames.length).fill(null);
  }

  /**
   * Frame shown for `slot` (spec 7.10, 9.6): `slot.sequenceIndex` when set
   * by a `sequence` timeline, otherwise `setup`. Always inside `0..count-1`.
   */
  frameIndexFor(slot: { readonly sequenceIndex: number }): number {
    const index = slot.sequenceIndex >= 0 ? slot.sequenceIndex : this.setup;
    return index < 0 ? 0 : index >= this.count ? this.count - 1 : index;
  }

  /**
   * Builds the frame names of a sequence (spec 7.10): `frames[i]`, or
   * `path + format(start + i, digits)`.
   */
  static frameNames(path: string, count: number, start: number, digits: number, frames?: readonly string[]): string[] {
    if (frames !== undefined) return frames.slice();
    const out = new Array<string>(count);
    for (let i = 0; i < count; i++) out[i] = path + formatNumber(start + i, digits);
    return out;
  }
}

/** `formatNumber(4, 2) === "04"`; `digits = 0` means no padding. */
export function formatNumber(value: number, digits: number): string {
  const s = String(Math.trunc(value));
  if (digits <= 0 || s.length >= digits) return s;
  return '0'.repeat(digits - s.length) + s;
}
