// SPDX-License-Identifier: Apache-2.0
/**
 * What to draw in one frame (spec 7.13) with the clipping walk of spec 7.7.
 *
 * `collectDrawables` walks the current draw order and produces one entry per
 * drawable attachment (`region`, `mesh`, `linkedmesh`, `skeleton`) together
 * with the clipping mask active at that point (`null` = unclipped). The
 * geometry of the clip (polygon intersection or stencil) is the renderer's;
 * this module only decides WHAT is drawn and WHICH mask applies.
 *
 * `collectDrawGroups` is the same walk with the three groups of spec 7.11: a
 * nested child with `around` is drawn around the skeleton that receives it,
 * half behind the whole of it and half in front. `collectDrawList` opens the
 * children and gives the frame as one flat list.
 */

import type { Attachment } from './attachments/attachment.js';
import { ClippingAttachment } from './attachments/clipping.js';
import { ParticleAttachment } from './attachments/particle.js';
import { SkeletonAttachment } from './attachments/skeleton-attachment.js';
import { MAX_NESTED_DEPTH } from './nested.js';
import type { SlotData } from './data.js';
import type { Skeleton, Slot } from './skeleton.js';

/** Active mask while walking the draw order (spec 7.7). */
export interface ClipState {
  readonly slot: Slot;
  readonly attachment: ClippingAttachment;
  /** World polygon of the mask (`2N`), computed when the mask was met. */
  readonly polygon: Float64Array;
  readonly end: SlotData | null;
  readonly slots: ReadonlySet<SlotData> | null;
  readonly invert: boolean;
}

export interface Drawable {
  readonly slot: Slot;
  readonly attachment: Attachment;
  /** Mask that clips this drawable, or `null`. */
  readonly clip: ClipState | null;
  /**
   * Only on a nested child drawn AROUND this skeleton (spec 7.11, `around`),
   * and only out of `collectDrawGroups`: which half of the child this entry is.
   */
  readonly part?: 'back' | 'front';
}

/**
 * `BONE_particle` is here because an emitter draws in its slot's place in the
 * `drawOrder` (spec 9.5), exactly like any other attachment, and `clipping`
 * applies to it as it does to any other. What it draws — how many particles,
 * where — is the emitter's own business (`particles/emitter.ts`); this module
 * only ever decides WHAT is drawn and WHICH mask applies.
 *
 * A reader WITHOUT the extension never gets here: `loadAttachment` already
 * turned the placeholder into an empty one and warned (spec 2.5).
 */
const DRAWABLE_TYPES: ReadonlySet<string> = new Set(['region', 'mesh', 'linkedmesh', 'skeleton', 'BONE_particle']);

/**
 * Spec 7.7 / 7.13 walk over `skeleton.drawOrder`. Invisible slots and empty
 * placeholders are skipped; a `clipping` attachment replaces the previous
 * mask and is not drawn; a mask without `end` and without `slots` clips
 * nothing.
 */
export function collectDrawables(skeleton: Skeleton, out: Drawable[] = []): Drawable[] {
  walk(skeleton, null, (drawable) => out.push(drawable));
  return out;
}

/**
 * The walk itself. `marker` is the slot that marks the middle when this
 * skeleton is a child drawn AROUND its parent (spec 7.11, `around`): it takes
 * part in the clipping walk exactly as it would without the mark, it is never
 * visited — unless it shows a child with an `around` of its own, whose back and
 * front halves still come out (C-324) — and `passed` tells the visitor on which
 * side of it a drawable is.
 * The marker is a SLOT: empty or hidden, its place in the order is still there.
 */
function walk(
  skeleton: Skeleton, marker: string | null, visit: (drawable: Drawable, passed: boolean) => void,
): void {
  let clip: ClipState | null = null;
  let passed = false;
  for (const slot of skeleton.drawOrder) {
    const isMarker = marker !== null && slot.data.name === marker;
    if (isMarker) passed = true;
    const att = slot.attachment;
    if (att === null || !slot.visible) continue;
    if (att instanceof ClippingAttachment) {
      if (!att.clipsAnything) {
        clip = null;
        continue;
      }
      const polygon = att.computeWorldVertices(slot) as Float64Array;
      clip = {
        slot, attachment: att, polygon, end: att.endSlot,
        slots: att.slots === null ? null : new Set(att.slots), invert: att.invert,
      };
      continue;
    }
    // The marker slot draws nothing in the middle — but a child drawn AROUND
    // this skeleton from inside it still goes to the back and to the front
    // (spec 7.11, the onion by composition; case C-324). Only its middle goes.
    if (DRAWABLE_TYPES.has(att.type) && (!isMarker || aroundMarker(slot) !== null)) {
      const clipped = clip !== null && (clip.slots === null || clip.slots.has(slot.data));
      visit({ slot, attachment: att, clip: clipped ? clip : null }, passed);
    }
    if (clip !== null && clip.slots === null && slot.data === clip.end) clip = null;
  }
}

// ---------------------------------------------------------------------------
// `around`: the child drawn around the skeleton that receives it (spec 7.11)
// ---------------------------------------------------------------------------

/** Which half of a child drawn around its parent, and where it is cut. */
export interface DrawCut {
  /** Name of the child's slot that marks the middle. */
  readonly marker: string;
  readonly part: 'back' | 'front';
}

/**
 * The slot of the child that marks the middle, when `slot` shows a nested
 * skeleton with a valid `around`; `null` otherwise — no `around`, child not
 * loaded, or a name the child does not have. That last one warns once and the
 * child is drawn as one block, as without the field (spec 2.5, 7.11).
 */
export function aroundMarker(slot: Slot): string | null {
  const att = slot.attachment;
  if (!(att instanceof SkeletonAttachment) || att.around === null) return null;
  const nested = slot.nested;
  if (nested === null) return null;
  if (nested.skeleton.findSlot(att.around) === null) {
    slot.skeleton.nestedRoot.warnNested(
      `AROUND_SLOT_MISSING: a entidade "${att.uri}" (slot "${slot.data.name}") pede around "${att.around}", `
      + 'e ela não tem esse slot: desenhada em bloco (7.11)',
    );
    return null;
  }
  return att.around;
}

/**
 * The draw order of one skeleton in the three groups of spec 7.11:
 * `back ++ middle ++ front`. A nested child with `around` leaves its slot's
 * place and shows up TWICE, once with `part: 'back'` and once with
 * `part: 'front'`, never clipped by this skeleton's masks; whoever draws it
 * walks the child with that `DrawCut`. Two of them make the onion: the one in
 * the higher slot goes further back at the back, and further front at the front.
 *
 * With `cut`, only that half of THIS skeleton comes out: what is before the
 * marker (and every `back`), or what is after it (and every `front`).
 *
 * Without any `around` in sight this is `collectDrawables`, entry by entry.
 */
export function collectDrawGroups(skeleton: Skeleton, cut: DrawCut | null = null, out: Drawable[] = []): Drawable[] {
  const back: Drawable[] = [];
  const before: Drawable[] = [];
  const after: Drawable[] = [];
  const front: Drawable[] = [];
  walk(skeleton, cut === null ? null : cut.marker, (drawable, passed) => {
    if (aroundMarker(drawable.slot) !== null) {
      back.unshift({ slot: drawable.slot, attachment: drawable.attachment, clip: null, part: 'back' });
      front.push({ slot: drawable.slot, attachment: drawable.attachment, clip: null, part: 'front' });
      return;
    }
    (passed ? after : before).push(drawable);
  });
  if (cut === null || cut.part === 'back') {
    for (const d of back) out.push(d);
    for (const d of before) out.push(d);
  }
  if (cut === null || cut.part === 'front') {
    for (const d of after) out.push(d);
    for (const d of front) out.push(d);
  }
  return out;
}

/** One mask in the chain that clips a piece, with its name in the dump (spec 12.4). */
export interface PieceClip {
  /** `<slot>/<attachment>` of the `clipping`, prefixed like the piece. */
  readonly name: string;
  readonly state: ClipState;
}

/** One piece that goes to the screen: a leaf of the nested walk (spec 7.13). */
export interface DrawPiece {
  /** The skeleton the slot belongs to (the child, for a piece of a child). */
  readonly skeleton: Skeleton;
  readonly slot: Slot;
  readonly attachment: Attachment;
  /** `<slot>/<attachment>`, with the parent slot in front at each nesting level. */
  readonly name: string;
  /** The masks that clip it, outermost first. */
  readonly clips: readonly PieceClip[];
}

/**
 * The whole frame as ONE list, children opened in place and the `around`
 * children moved to the back and to the front (spec 7.11, 7.13). It is the
 * `drawList` channel of the pose dump (spec 12.4), and what a renderer that
 * does not recurse by itself walks.
 */
export function collectDrawList(skeleton: Skeleton, out: DrawPiece[] = []): DrawPiece[] {
  openInto(skeleton, null, '', [], 0, out);
  return out;
}

function openInto(
  skeleton: Skeleton, cut: DrawCut | null, prefix: string, clips: readonly PieceClip[], depth: number,
  out: DrawPiece[],
): void {
  for (const { slot, attachment, clip, part } of collectDrawGroups(skeleton, cut)) {
    const chain = clip === null ? clips
      : [...clips, { name: `${prefix}${clip.slot.data.name}/${clip.attachment.name}`, state: clip }];
    if (attachment.type === 'skeleton') {
      const nested = slot.nested;
      if (nested === null || depth + 1 > MAX_NESTED_DEPTH) continue;
      const marker = part === undefined ? null : aroundMarker(slot);
      openInto(
        nested.skeleton, marker === null || part === undefined ? null : { marker, part },
        `${prefix}${slot.data.name}/`, chain, depth + 1, out,
      );
      continue;
    }
    // Extension BONE_particles 7.4, house rule 21: an emitter whose `shape`
    // this reader does not know is NOT drawn — so it is not a piece of the
    // frame either (case P-029). The loader already warned, once, by name.
    if (attachment instanceof ParticleAttachment && !attachment.shapeKnown) continue;
    out.push({ skeleton, slot, attachment, name: `${prefix}${slot.data.name}/${attachment.name}`, clips: chain });
  }
}
