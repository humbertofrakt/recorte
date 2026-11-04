// SPDX-License-Identifier: Apache-2.0
/**
 * Final color of a drawn attachment (spec 7.12): `light = slot.color x
 * attachment.color` (components clamped to `[0, 1]` first), `dark =
 * slot.darkColor` or black. Blend factors per mode are listed for renderers.
 */

import type { BlendMode } from './types.js';
import type { Attachment } from './attachments/attachment.js';
import type { Slot } from './skeleton.js';

/** `light` (`[r, g, b, a]`) and `dark` (`[r, g, b]`) that multiply the texel (spec 7.12). */
export interface FinalColor {
  readonly light: Float64Array;
  readonly dark: Float64Array;
  /** `true` when the slot has a dark color (tint black on). */
  tintBlack: boolean;
}

export function createFinalColor(): FinalColor {
  return { light: new Float64Array(4), dark: new Float64Array(3), tintBlack: false };
}

function unit(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Computes the `light` / `dark` of spec 7.12 for `slot` showing `attachment`. */
export function computeFinalColor(slot: Slot, attachment: Attachment, out: FinalColor = createFinalColor()): FinalColor {
  const sc = slot.color;
  const ac = attachment.color;
  for (let i = 0; i < 4; i++) out.light[i] = unit(sc[i]) * unit(ac[i]);
  const dark = slot.darkColor;
  out.tintBlack = dark !== null;
  for (let i = 0; i < 3; i++) out.dark[i] = dark === null ? 0 : unit(dark[i]);
  return out;
}

/**
 * Applies spec 7.12 to one texel (straight alpha `tex`, or premultiplied when
 * `premultiplied`). Writes `[r, g, b, a]` into `out`.
 */
export function shadeTexel(tex: ArrayLike<number>, color: FinalColor, premultiplied: boolean, out: Float64Array | number[] = new Float64Array(4)): Float64Array | number[] {
  const l = color.light;
  const d = color.dark;
  const a = tex[3];
  if (!premultiplied) {
    for (let i = 0; i < 3; i++) out[i] = tex[i] * l[i] + (1 - tex[i]) * d[i];
  } else {
    for (let i = 0; i < 3; i++) out[i] = tex[i] * l[i] * l[3] + (a - tex[i]) * d[i] * l[3];
  }
  out[3] = a * l[3];
  return out;
}

/** `glBlendFunc` factors of spec 7.12 (source, destination), by page kind. */
export interface BlendFactors {
  readonly src: string;
  readonly dst: string;
}

const STRAIGHT: Record<BlendMode, BlendFactors> = {
  normal: { src: 'SRC_ALPHA', dst: 'ONE_MINUS_SRC_ALPHA' },
  additive: { src: 'SRC_ALPHA', dst: 'ONE' },
  multiply: { src: 'DST_COLOR', dst: 'ONE_MINUS_SRC_ALPHA' },
  screen: { src: 'ONE', dst: 'ONE_MINUS_SRC_COLOR' },
};

const PREMULTIPLIED: Record<BlendMode, BlendFactors> = {
  normal: { src: 'ONE', dst: 'ONE_MINUS_SRC_ALPHA' },
  additive: { src: 'ONE', dst: 'ONE' },
  multiply: { src: 'DST_COLOR', dst: 'ONE_MINUS_SRC_ALPHA' },
  screen: { src: 'ONE', dst: 'ONE_MINUS_SRC_COLOR' },
};

export function blendFactors(mode: BlendMode, premultiplied: boolean): BlendFactors {
  return (premultiplied ? PREMULTIPLIED : STRAIGHT)[mode] ?? STRAIGHT.normal;
}
