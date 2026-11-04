// SPDX-License-Identifier: Apache-2.0
/**
 * Animation layers (tracks), crossfade and per-property mixing.
 *
 * This is runtime machinery only. NOTHING here adds a field to the `.bone`
 * format: a track, an alpha and a bone mask are decisions a game makes at run
 * time, not data the artist saves. The only file field this module reads is
 * `animation.defaultMix` (spec 4.6), the crossfade hint the format already
 * carries and that nothing consumed until now.
 *
 * The model, in one paragraph. `AnimationState` holds numbered tracks. Track 0
 * is the base (walk); track 1 and up write over it (shoot, with a bone mask so
 * only the arms move). Each track has one current `TrackEntry` and, while a
 * crossfade is running, the entry it is replacing (`mixingFrom`). `update(dt)`
 * advances the clocks and fires listeners; `apply(skeleton)` writes the result
 * into the skeleton, from track 0 upwards.
 *
 * How a value is composited (all of it hand-checkable):
 *
 *   mixNumber(current, setup, value, alpha, blend)
 *     'setup'          setup   + (value - setup)   * alpha
 *     'first'          the FIRST animation to claim the property owns it; a
 *                      later one is ignored. When it does apply it behaves
 *                      like 'replace'.
 *     'replace'        current + (value - current) * alpha
 *     'add'            current + (value - setup)   * alpha
 *
 * Crossfade inside one track. Let `a` be the track alpha, `m = mixTime /
 * mixDuration` in [0, 1], `f` the outgoing value and `t` the incoming one, and
 * `base` what the tracks below already wrote. We want exactly
 *
 *     result = base + (lerp(f, t, m) - base) * a
 *
 * and we get it by applying the outgoing animation first with
 *
 *     a1 = a * (1 - m) / (1 - a * m)          (0 when a * m >= 1)
 *
 * and the incoming one on top with `a2 = a * m`. Substituting the two lerps
 * gives the line above; with `a = 1` it reduces to `a1 = 1`, `a2 = m`, i.e. the
 * outgoing pose written whole and the incoming one lerped over it.
 *
 * A property the OUTGOING animation writes and the incoming one does not
 * cannot be crossfaded — there is nothing to fade towards — so it fades back to
 * the setup pose instead, with `alpha = a * (1 - m)`. That is the difference
 * between an arm that snaps back and an arm that eases back.
 *
 * `apply` puts the skeleton in its setup pose first (`resetToSetupPose`), so
 * every frame is computed from a known state and a property no track writes is
 * the setup value, not last frame's leftovers.
 */

import type {
  AnimationData, BoneData, ConstraintData, DeformTimelineData, TimelineData, WeightsTimelineData,
} from './data.js';
import { AnimationData as AnimationDataClass } from './data.js';
import { VertexAttachment } from './attachments/vertex-attachment.js';
import type { Skeleton, Slot } from './skeleton.js';
import { Actor } from './actor.js';
import {
  applyDrawOrder, applyParentKey, applySlotBoneKey, runStart, evaluateComponent, evaluateDarkColor, evaluateDeform,
  evaluateNumber, evaluateStepped, evaluateWeights, findKeyIndex, type FiredEvent, fireEvents,
} from './animation.js';
import { sequenceFrameAt } from './sequence-frame.js';
import { clamp } from './math.js';

// ---------------------------------------------------------------------------
// Mixing primitives
// ---------------------------------------------------------------------------

/** How an animation enters over what is already posed. See the file header. */
export type MixBlend = 'setup' | 'first' | 'replace' | 'add';

/** One property value composited over what is already there. */
export function mixNumber(
  current: number, setup: number, value: number, alpha: number, blend: MixBlend,
): number {
  if (alpha >= 1 && blend !== 'add') return value;
  switch (blend) {
    case 'setup': return setup + (value - setup) * alpha;
    case 'add': return current + (value - setup) * alpha;
    default: return current + (value - current) * alpha;
  }
}

/**
 * A value that cannot be interpolated (a name, a flag, a draw order, a tag)
 * is written whole from half the fade on, and not before. Blending half an
 * attachment name is not a thing; the spec calls these stepped (9.10).
 */
export function mixTakes(alpha: number): boolean {
  return alpha >= 0.5;
}

/**
 * Stable identity of what a timeline writes, e.g. `bone:3:rotation`. Two
 * timelines with the same key fight over the same number, which is what the
 * crossfade and the `first` blend need to know. Timelines that write nothing
 * (`event`, `constraint` `reset`) return the empty string.
 */
export function timelineKey(tl: TimelineData): string {
  switch (tl.kind) {
    case 'bone.number':
    case 'bone.inherit':
    case 'bone.parent': return `bone:${tl.bone.index}:${tl.property}`;
    case 'slot.attachment': return `slot:${tl.slot.index}:attachment`;
    case 'slot.color': return `slot:${tl.slot.index}:color`;
    case 'slot.darkColor': return `slot:${tl.slot.index}:darkColor`;
    case 'slot.visible': return `slot:${tl.slot.index}:visible`;
    case 'slot.bone': return `slot:${tl.slot.index}:bone`;
    case 'drawOrder': return 'drawOrder';
    case 'deform': return `deform:${tl.slot.index}:${tl.attachment.name}`;
    case 'weights': return `weights:${tl.slot.index}:${tl.attachment.name}`;
    case 'sequence': return `sequence:${tl.slot.index}:${tl.attachment.name}`;
    case 'constraint.number':
    case 'constraint.boolean': return `constraint:${tl.constraint.index}:${tl.property}`;
    case 'parameter': return `parameter:${tl.parameter.index}`;
    case 'morph': return `morph:${tl.morph.index}`;
    case 'variable.number':
    case 'variable.stepped': return `variable:${tl.variable.index}`;
    case 'tag': return 'tag';
    case 'nested.animation': return `nested:${tl.slot.index}:animation`;
    case 'nested.number': return `nested:${tl.slot.index}:${tl.property}`;
    default: return '';
  }
}

const keyCache = new WeakMap<AnimationData, ReadonlySet<string>>();

/** Every property key an animation writes. Cached per animation. */
export function animationKeys(animation: AnimationData): ReadonlySet<string> {
  let set = keyCache.get(animation);
  if (set === undefined) {
    const out = new Set<string>();
    for (const tl of animation.timelines) {
      const key = timelineKey(tl);
      if (key !== '') out.add(key);
    }
    set = out;
    keyCache.set(animation, out);
  }
  return set;
}

/** Bones a constraint moves, so a bone mask can decide whether it applies. */
function constraintBones(data: ConstraintData): readonly BoneData[] {
  const d = data as { bones?: readonly BoneData[]; bone?: BoneData };
  if (d.bones !== undefined) return d.bones;
  if (d.bone !== undefined) return [d.bone];
  return [];
}

/**
 * Index of the bone a timeline ends up moving, or `null` when it writes
 * something that belongs to no single bone. A slot answers with its bone.
 */
function timelineBone(tl: TimelineData): number | null {
  switch (tl.kind) {
    case 'bone.number':
    case 'bone.inherit':
    case 'bone.parent': return tl.bone.index;
    case 'slot.attachment':
    case 'slot.color':
    case 'slot.darkColor':
    case 'slot.visible':
    case 'slot.bone':
    case 'deform':
    case 'weights':
    case 'sequence':
    case 'nested.animation':
    case 'nested.number': return tl.slot.bone.index;
    default: return null;
  }
}

/** Options of `applyAnimationMixed`. */
export interface MixOptions {
  /** 0 writes nothing, 1 writes the animation whole. Default 1. */
  alpha?: number;
  /** Default `'replace'`. */
  blend?: MixBlend;
  /**
   * Bone indices this application may write. `null` (default) is the whole
   * skeleton. With a mask set, a timeline that belongs to no bone (draw order,
   * parameter, morph, variable, tag) is NOT applied: a layer that owns only the
   * arms must not reorder the whole character.
   */
  boneMask?: ReadonlySet<number> | null;
  /**
   * Keys the animation taking over also writes. Only meaningful while fading
   * OUT: a key in this set uses `alpha`, a key outside it uses `holdAlpha` and
   * fades back to the setup pose instead.
   */
  shared?: ReadonlySet<string> | null;
  /** Alpha for keys outside `shared`. Defaults to `alpha`. */
  holdAlpha?: number;
  /**
   * Keys a LOWER track already claimed. The `'first'` blend refuses to write
   * these. Defaults to `written`.
   */
  blocked?: ReadonlySet<string> | null;
  /**
   * Keys written this frame. Every application adds to it, so the caller can
   * chain tracks and know what the ones below already own.
   */
  written?: Set<string> | null;
}

let deformScratch = new Float64Array(0);
const color4 = new Float64Array(4);
const color3 = new Float64Array(3);

function scratchFor(length: number): Float64Array {
  if (deformScratch.length < length) deformScratch = new Float64Array(length);
  return deformScratch.length === length ? deformScratch : deformScratch.subarray(0, length);
}

/**
 * `applyAnimation` of spec 9.10 with an alpha, a blend mode and a bone mask.
 * With `alpha = 1`, `blend = 'setup'` and no mask it writes exactly what
 * `applyAnimation` writes over a setup pose, which is what 9.10 requires of a
 * runtime with tracks.
 *
 * Does not compute the world transform, does not fire events and does not run
 * physics `reset` keys; `AnimationState` and `fireEvents` do that.
 */
export function applyAnimationMixed(
  skeleton: Skeleton, animation: AnimationData, t: number, options: MixOptions = {},
): void {
  const baseAlpha = options.alpha ?? 1;
  const blend = options.blend ?? 'replace';
  const mask = options.boneMask ?? null;
  const shared = options.shared ?? null;
  const holdAlpha = options.holdAlpha ?? baseAlpha;
  const written = options.written ?? null;
  const blocked = options.blocked ?? written;
  const timelines = animation.timelines;
  let tagsWritten = false;

  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < timelines.length; i++) {
      const tl = timelines[i];
      const second = tl.kind === 'deform' || tl.kind === 'weights' || tl.kind === 'sequence';
      if ((pass === 1) !== second) continue;
      const key = timelineKey(tl);
      if (key === '') continue;

      // Bone mask.
      if (mask !== null) {
        const bone = timelineBone(tl);
        if (bone !== null) {
          if (!mask.has(bone)) continue;
        } else if (tl.kind === 'constraint.number' || tl.kind === 'constraint.boolean') {
          let touched = false;
          for (const b of constraintBones(tl.constraint)) if (mask.has(b.index)) { touched = true; break; }
          if (!touched) continue;
        } else {
          continue; // draw order, parameter, morph, variable, tag: whole-skeleton only
        }
      }

      // `first`: the animation that claimed the property keeps it.
      if (blend === 'first' && blocked !== null && blocked.has(key)) continue;
      const alpha = shared !== null && !shared.has(key) ? holdAlpha : baseAlpha;
      if (alpha <= 0) continue;
      if (written !== null) written.add(key);

      applyTimeline(skeleton, animation, tl, t, alpha, blend, () => { tagsWritten = true; });
    }
  }
  if (!tagsWritten && animation.tags.length > 0 && mask === null && mixTakes(baseAlpha)) {
    skeleton.tags = animation.tags;
  }
}

function applyTimeline(
  skeleton: Skeleton, animation: AnimationData, tl: TimelineData, t: number,
  alpha: number, blend: MixBlend, markTags: () => void,
): void {
  switch (tl.kind) {
    case 'bone.number': {
      const bone = skeleton.bones[tl.bone.index];
      bone[tl.property] = mixNumber(
        bone[tl.property], tl.bone[tl.property], evaluateNumber(tl.keys, t), alpha, blend,
      );
      break;
    }
    case 'bone.inherit': {
      const bone = skeleton.bones[tl.bone.index];
      if (mixTakes(alpha)) bone[tl.property] = evaluateStepped(tl.keys, t);
      else if (blend === 'setup') bone[tl.property] = tl.bone[tl.property];
      break;
    }
    case 'bone.parent': {
      // Spec 9.4: stepped, not mixable; `setup` blend returns the file parent.
      const bone = skeleton.bones[tl.bone.index];
      if (mixTakes(alpha)) applyParentKey(skeleton, bone, evaluateStepped(tl.keys, t));
      else if (blend === 'setup') applyParentKey(skeleton, bone, null);
      break;
    }
    case 'slot.attachment': {
      const slot = skeleton.slots[tl.slot.index];
      if (mixTakes(alpha)) {
        slot.setAttachmentName(evaluateStepped(tl.keys, t));
        slot.nestedOrigin = runStart(tl.keys, t);
      } else if (blend === 'setup') {
        slot.setAttachmentName(tl.slot.attachmentName);
      }
      break;
    }
    case 'slot.color': {
      const slot = skeleton.slots[tl.slot.index];
      const setup = tl.slot.color;
      for (let j = 0; j < 4; j++) {
        slot.color[j] = mixNumber(slot.color[j], setup[j], evaluateComponent(tl.keys, t, j), alpha, blend);
      }
      break;
    }
    case 'slot.darkColor': {
      const slot = skeleton.slots[tl.slot.index];
      const v = evaluateDarkColor(tl, t, color3);
      const setup = tl.slot.darkColor;
      const current = slot.darkColor;
      if (v === null || current === null || (blend !== 'replace' && setup === null)) {
        if (mixTakes(alpha)) {
          if (v === null) slot.darkColor = null;
          else if (current === null) slot.darkColor = Float64Array.from(v);
          else current.set(v);
        }
        break;
      }
      for (let j = 0; j < 3; j++) {
        current[j] = mixNumber(current[j], setup === null ? current[j] : setup[j], v[j], alpha, blend);
      }
      break;
    }
    case 'slot.visible': {
      const slot = skeleton.slots[tl.slot.index];
      if (mixTakes(alpha)) slot.visible = evaluateStepped(tl.keys, t);
      else if (blend === 'setup') slot.visible = tl.slot.visible;
      break;
    }
    case 'slot.bone': {
      // Spec 9.5: stepped, not mixable; `setup` blend returns the file bone.
      const slot = skeleton.slots[tl.slot.index];
      if (mixTakes(alpha)) applySlotBoneKey(skeleton, slot, evaluateStepped(tl.keys, t));
      else if (blend === 'setup') slot.setBone(null, null);
      break;
    }
    case 'weights':
      applyWeightsMixed(skeleton.slots[tl.slot.index], tl, t, alpha, blend);
      break;
    case 'drawOrder': {
      if (!mixTakes(alpha)) break;
      const i = findKeyIndex(tl.times, t);
      applyDrawOrder(skeleton, tl.entries[i < 0 ? 0 : i]);
      break;
    }
    case 'constraint.number': {
      const c = skeleton.constraintFor(tl.constraint) as unknown as Record<string, number> | null;
      if (c === null) break;
      const setup = (tl.constraint as unknown as Record<string, number>)[tl.property] ?? 0;
      c[tl.property] = mixNumber(c[tl.property], setup, evaluateNumber(tl.keys, t), alpha, blend);
      break;
    }
    case 'constraint.boolean': {
      const c = skeleton.constraintFor(tl.constraint) as unknown as Record<string, boolean> | null;
      if (c === null || !mixTakes(alpha)) break;
      c[tl.property] = evaluateStepped(tl.keys, t);
      break;
    }
    case 'parameter': {
      const p = tl.parameter;
      const v = mixNumber(skeleton.parameters[p.index], p.default, evaluateNumber(tl.keys, t), alpha, blend);
      skeleton.parameters[p.index] = p.constrain(v);
      break;
    }
    case 'morph': {
      const m = tl.morph;
      const v = mixNumber(skeleton.morphWeights[m.index], m.weight, evaluateNumber(tl.keys, t), alpha, blend);
      skeleton.morphWeights[m.index] = clamp(v, m.min, m.max);
      break;
    }
    case 'variable.number': {
      const variable = tl.variable;
      const setup = typeof variable.default === 'number' ? variable.default : 0;
      const current = skeleton.variables[variable.index];
      const v = mixNumber(typeof current === 'number' ? current : 0, setup, evaluateNumber(tl.keys, t), alpha, blend);
      skeleton.variables[variable.index] = variable.type === 'int' ? Math.trunc(v) : v;
      break;
    }
    case 'variable.stepped': {
      if (!mixTakes(alpha)) break;
      skeleton.variables[tl.variable.index] = evaluateStepped(tl.keys, t);
      break;
    }
    case 'tag': {
      if (!mixTakes(alpha)) break;
      skeleton.tags = activeTagsFor(animation, tl.keys.times, tl.keys.values, t);
      markTags();
      break;
    }
    case 'nested.animation': {
      if (!mixTakes(alpha)) break;
      const slot = skeleton.slots[tl.slot.index];
      slot.nestedAnimation = evaluateStepped(tl.keys, t);
      slot.nestedAnimationSet = true;
      slot.nestedAnimationOrigin = runStart(tl.keys, t);
      break;
    }
    case 'nested.number': {
      const slot = skeleton.slots[tl.slot.index];
      const v = evaluateNumber(tl.keys, t);
      const current = tl.property === 'time' ? slot.nestedTime : slot.nestedTimeScale;
      const setup = tl.property === 'time' ? 0 : 1;
      const mixed = mixNumber(Number.isNaN(current) ? setup : current, setup, v, alpha, blend);
      if (tl.property === 'time') slot.nestedTime = mixed;
      else slot.nestedTimeScale = mixed;
      break;
    }
    case 'deform':
      applyDeformMixed(skeleton.slots[tl.slot.index], tl, t, alpha, blend);
      break;
    case 'sequence': {
      if (!mixTakes(alpha)) break;
      const slot = skeleton.slots[tl.slot.index];
      if (slot.attachment === tl.attachment) slot.sequenceIndex = sequenceFrameAt(tl, t);
      break;
    }
    default:
      break;
  }
}

function activeTagsFor(
  animation: AnimationData, times: Float64Array, values: readonly (readonly string[])[], t: number,
): readonly string[] {
  const i = findKeyIndex(times, t);
  if (i < 0) return animation.tags;
  const fromKey = values[i];
  if (animation.tags.length === 0) return fromKey;
  const out = animation.tags.slice();
  for (const tag of fromKey) if (!out.includes(tag)) out.push(tag);
  return out;
}

/** Weights with an alpha (spec 9.6). The setup weights are the file's. */
function applyWeightsMixed(
  slot: Slot, tl: WeightsTimelineData, t: number, alpha: number, blend: MixBlend,
): void {
  const current = slot.attachment;
  const target = tl.attachment.timelineAttachment;
  const binding = tl.attachment.binding;
  if (binding === null || !(current instanceof VertexAttachment) || current.timelineAttachment !== target) return;
  const length = binding.weights.length;
  const value = evaluateWeights(tl, t, new Float64Array(length));
  const held = slot.weights !== null && slot.weights.length === length && slot.weightsAttachment === target
    ? slot.weights : null;
  const out = held ?? Float64Array.from(binding.weights);
  for (let j = 0; j < length; j++) out[j] = mixNumber(out[j], binding.weights[j], value[j], alpha, blend);
  slot.weights = out;
  slot.weightsAttachment = target;
}

/** Deform with an alpha. The setup deform is "no deform", i.e. all zeros. */
function applyDeformMixed(
  slot: Slot, tl: DeformTimelineData, t: number, alpha: number, blend: MixBlend,
): void {
  const current = slot.attachment;
  if (!(current instanceof VertexAttachment) || current.timelineAttachment !== tl.attachment.timelineAttachment) return;
  const length = tl.attachment.deformLength;
  const value = evaluateDeform(tl, t, scratchFor(length));
  const held = slot.deform !== null && slot.deform.length === length
    && slot.deformAttachment === tl.attachment.timelineAttachment ? slot.deform : null;
  if (value === null && held === null) return;
  if (value === null && blend === 'setup') {
    slot.deform = null;
    slot.deformAttachment = null;
    return;
  }
  const out = held ?? new Float64Array(length);
  for (let j = 0; j < length; j++) {
    const c = held === null ? 0 : held[j];
    out[j] = mixNumber(c, 0, value === null ? 0 : value[j], alpha, blend);
  }
  slot.deform = out;
  slot.deformAttachment = tl.attachment.timelineAttachment;
}

// ---------------------------------------------------------------------------
// Mix duration table (the `AnimationStateData` of the file header)
// ---------------------------------------------------------------------------

/**
 * How long the crossfade from one animation to another lasts, in seconds.
 * Looked up by pair; falls back to the incoming animation's `defaultMix`
 * (spec 4.6) and then to `defaultMix` of this table.
 */
export class AnimationStateData {
  /** Used when the pair is not in the table and the animation has no hint. */
  defaultMix = 0;
  private readonly pairs = new Map<string, number>();

  /** Crossfade from `from` to `to`, in seconds. Names, not objects. */
  setMix(from: string, to: string, duration: number): void {
    this.pairs.set(`${from} ${to}`, duration);
  }

  /** Removes one pair from the table. */
  clearMix(from: string, to: string): void {
    this.pairs.delete(`${from} ${to}`);
  }

  getMix(from: AnimationData | null, to: AnimationData): number {
    if (from !== null) {
      const v = this.pairs.get(`${from.name} ${to.name}`);
      if (v !== undefined) return v;
    }
    if (to.defaultMix !== null) return to.defaultMix;
    return this.defaultMix;
  }
}

// ---------------------------------------------------------------------------
// Tracks
// ---------------------------------------------------------------------------

/** The empty animation: fades a track back to the setup pose. */
export const EMPTY_ANIMATION: AnimationData = new AnimationDataClass(-1, '<vazia>', [], { duration: 0 });

/** One animation playing on one track. */
export class TrackEntry {
  readonly trackIndex: number;
  readonly animation: AnimationData;
  /** Repeats when the duration runs out. */
  loop: boolean;
  /** Multiplies the delta. 1 is normal speed, 0.5 is half. */
  timeScale = 1;
  /** How much of this track reaches the skeleton, 0 to 1. */
  alpha = 1;
  /** How this track enters over the tracks below it. */
  mixBlend: MixBlend = 'replace';
  /**
   * Bone NAMES this entry may write, or `null` for the whole skeleton. Lives on
   * the track, never in the file: a mask is a decision of the game.
   */
  boneMask: ReadonlySet<string> | null = null;
  /** Seconds played, without the loop folded in. */
  trackTime = 0;
  /** Seconds of crossfade already elapsed. */
  mixTime = 0;
  /** Total crossfade, resolved from the table when the entry starts. */
  mixDuration = 0;
  /** The entry being faded out, or `null`. */
  mixingFrom: TrackEntry | null = null;
  /** The entry queued after this one, or `null`. */
  next: TrackEntry | null = null;
  /** Track time of the PREVIOUS entry at which this queued entry starts. */
  delay = 0;
  /** Listener for this entry only. Called before the state's listeners. */
  listener: AnimationStateListener | null = null;

  /** Crossfade asked for by the caller; `null` means "read the table". */
  requestedMix: number | null = null;
  /** Last `trackTime` events were fired up to. */
  lastEventTime = -Infinity;
  /** Loops already reported by `complete`. */
  completedLoops = 0;

  constructor(trackIndex: number, animation: AnimationData, loop: boolean) {
    this.trackIndex = trackIndex;
    this.animation = animation;
    this.loop = loop;
  }

  /** Time inside the animation: wrapped when looping, clamped when not. */
  get animationTime(): number {
    const d = this.animation.duration;
    if (d <= 0) return 0;
    if (!this.loop) return clamp(this.trackTime, 0, d);
    const t = this.trackTime % d;
    return t < 0 ? t + d : t;
  }

  /** `true` when a non-looping entry has run past its duration. */
  get isComplete(): boolean {
    return !this.loop && this.trackTime >= this.animation.duration;
  }

  /** How far the crossfade got, 0 to 1. 1 when there is nothing to fade. */
  get mixProgress(): number {
    if (this.mixingFrom === null) return 1;
    if (this.mixDuration <= 0) return 1;
    return clamp(this.mixTime / this.mixDuration, 0, 1);
  }
}

/** What a listener is told. Every method is optional. */
export interface AnimationStateListener {
  /** The entry became the current one on its track. */
  start?(entry: TrackEntry): void;
  /** Another entry took the track over; this one is fading out. */
  interrupt?(entry: TrackEntry): void;
  /** The entry stopped reaching the skeleton. */
  end?(entry: TrackEntry): void;
  /** The entry reached the end of the animation (once per loop). */
  complete?(entry: TrackEntry): void;
  /** The entry was thrown away. Always the last call for it. */
  dispose?(entry: TrackEntry): void;
  /** An `event` key of spec 8.6 was crossed. */
  event?(entry: TrackEntry, fired: FiredEvent): void;
}

type QueueItem =
  | { readonly type: 'start' | 'interrupt' | 'end' | 'complete' | 'dispose'; readonly entry: TrackEntry }
  | { readonly type: 'event'; readonly entry: TrackEntry; readonly fired: FiredEvent };

// ---------------------------------------------------------------------------
// AnimationState
// ---------------------------------------------------------------------------

/**
 * Numbered animation tracks over one skeleton. Track 0 is the base; higher
 * tracks write over it, with an alpha and, when they should touch only part of
 * the body, a bone mask.
 *
 * One frame:
 *
 *     state.update(dt);
 *     state.apply(skeleton);
 *     skeleton.updateWorldTransform(now);
 */
export class AnimationState {
  readonly data: AnimationStateData;
  /** Multiplies every delta, for slow motion over the whole state. */
  timeScale = 1;
  /**
   * `apply` puts the skeleton in the setup pose first. Turn it off only when
   * something else already posed the skeleton this frame.
   */
  resetToSetupPose = true;

  private readonly trackList: (TrackEntry | null)[] = [];
  private readonly listeners: AnimationStateListener[] = [];
  private readonly queue: QueueItem[] = [];
  private draining = false;
  private readonly firedScratch: FiredEvent[] = [];
  private readonly maskScratch = new Set<number>();

  constructor(data: AnimationStateData = new AnimationStateData()) {
    this.data = data;
  }

  /** The tracks, in order. A hole is a track with nothing playing. */
  get tracks(): readonly (TrackEntry | null)[] {
    return this.trackList;
  }

  /** The entry playing on a track, or `null`. */
  getCurrent(trackIndex: number): TrackEntry | null {
    return this.trackList[trackIndex] ?? null;
  }

  addListener(listener: AnimationStateListener): () => void {
    this.listeners.push(listener);
    return () => this.removeListener(listener);
  }

  removeListener(listener: AnimationStateListener): void {
    const i = this.listeners.indexOf(listener);
    if (i >= 0) this.listeners.splice(i, 1);
  }

  // -------------------------------------------------------------------------
  // Setting animations
  // -------------------------------------------------------------------------

  /**
   * Plays `animation` on `trackIndex` now. Whatever was there is interrupted
   * and crossfades out over `mixDuration` seconds (the table, when omitted).
   */
  setAnimation(
    trackIndex: number, animation: AnimationData, loop = animation.loop, mixDuration: number | null = null,
  ): TrackEntry {
    const entry = new TrackEntry(trackIndex, animation, loop);
    entry.requestedMix = mixDuration;
    const current = this.getCurrent(trackIndex);
    this.grow(trackIndex);
    if (current !== null) {
      // A crossfade already running is collapsed: only one fade per track.
      const stale = current.mixingFrom;
      current.mixingFrom = null;
      if (stale !== null) this.disposeEntry(stale, true);
      this.disposeQueue(current.next);
      current.next = null;
      entry.mixingFrom = current;
      entry.mixDuration = mixDuration ?? this.data.getMix(current.animation, animation);
      entry.mixTime = 0;
      this.enqueue('interrupt', current);
      if (entry.mixDuration <= 0) {
        entry.mixingFrom = null;
        this.enqueue('end', current);
        this.enqueue('dispose', current);
      }
    } else {
      entry.mixDuration = mixDuration ?? 0;
    }
    this.trackList[trackIndex] = entry;
    this.enqueue('start', entry);
    this.drain();
    return entry;
  }

  /**
   * Queues `animation` after what is playing on the track. `delay` is measured
   * in track time of the entry it follows: it starts when that entry's
   * `trackTime` reaches `delay`. `delay <= 0` means "when the one before it
   * ends", i.e. its duration minus the crossfade.
   */
  addAnimation(
    trackIndex: number, animation: AnimationData, loop = animation.loop, delay = 0,
    mixDuration: number | null = null,
  ): TrackEntry {
    this.grow(trackIndex);
    const entry = new TrackEntry(trackIndex, animation, loop);
    entry.requestedMix = mixDuration;
    let last = this.getCurrent(trackIndex);
    if (last === null) {
      const started = this.setAnimation(trackIndex, animation, loop, mixDuration);
      started.delay = 0;
      return started;
    }
    while (last.next !== null) last = last.next;
    const mix = mixDuration ?? this.data.getMix(last.animation, animation);
    entry.delay = delay > 0 ? delay : Math.max(0, last.animation.duration - mix);
    last.next = entry;
    return entry;
  }

  /**
   * Fades the track back to the setup pose over `mixDuration` seconds. Nothing
   * plays afterwards.
   */
  setEmptyAnimation(trackIndex: number, mixDuration = 0): TrackEntry {
    return this.setAnimation(trackIndex, EMPTY_ANIMATION, false, mixDuration);
  }

  /** Stops a track at once. Listeners get `end` and then `dispose`. */
  clearTrack(trackIndex: number): void {
    const entry = this.trackList[trackIndex] ?? null;
    if (entry === null) return;
    this.trackList[trackIndex] = null;
    this.disposeQueue(entry.next);
    entry.next = null;
    if (entry.mixingFrom !== null) {
      this.disposeEntry(entry.mixingFrom, true);
      entry.mixingFrom = null;
    }
    this.disposeEntry(entry, true);
    this.drain();
  }

  /** Stops every track. */
  clearTracks(): void {
    for (let i = 0; i < this.trackList.length; i++) this.clearTrack(i);
  }

  // -------------------------------------------------------------------------
  // The frame
  // -------------------------------------------------------------------------

  /** Advances every clock by `delta` seconds and fires the listeners. */
  update(delta: number): void {
    const dt = delta * this.timeScale;
    for (let i = 0; i < this.trackList.length; i++) {
      const entry = this.trackList[i];
      if (entry === null) continue;

      const from = entry.mixingFrom;
      if (from !== null) {
        entry.mixTime += dt;
        if (entry.mixDuration <= 0 || entry.mixTime >= entry.mixDuration) {
          entry.mixTime = entry.mixDuration;
          entry.mixingFrom = null;
          this.disposeEntry(from, true);
        } else {
          this.advance(from, dt);
        }
      }
      this.advance(entry, dt);

      const next = entry.next;
      if (next !== null && entry.trackTime >= next.delay) {
        entry.next = null;
        next.mixDuration = next.requestedMix ?? this.data.getMix(entry.animation, next.animation);
        next.mixTime = 0;
        if (next.mixDuration > 0) {
          next.mixingFrom = entry;
          this.enqueue('interrupt', entry);
        } else {
          this.enqueue('interrupt', entry);
          this.disposeEntry(entry, true);
        }
        this.trackList[i] = next;
        this.enqueue('start', next);
      }
    }
    this.drain();
  }

  private advance(entry: TrackEntry, dt: number): void {
    const before = entry.trackTime;
    entry.trackTime += dt * entry.timeScale;
    const animation = entry.animation;
    const duration = animation.duration;

    // Events of spec 8.6, unrolled by the loop. `-Infinity` on the first frame
    // so a key at time 0 fires once.
    const prev = entry.lastEventTime;
    this.firedScratch.length = 0;
    fireEvents(animation, prev, entry.trackTime, entry.loop, this.firedScratch);
    for (const fired of this.firedScratch) this.enqueueEvent(entry, fired);
    entry.lastEventTime = entry.trackTime;

    // `complete`, once per turn of the loop.
    if (duration > 0) {
      const loops = Math.floor(entry.trackTime / duration);
      const cap = entry.loop ? loops : Math.min(loops, 1);
      while (entry.completedLoops < cap) {
        entry.completedLoops++;
        this.enqueue('complete', entry);
      }
    } else if (entry.completedLoops === 0 && entry.trackTime > 0 && before <= 0) {
      entry.completedLoops = 1;
      this.enqueue('complete', entry);
    }
  }

  /**
   * Writes every track into `skeleton`, from 0 upwards. Returns `true` when at
   * least one track wrote something.
   *
   * With an `Actor` (spec 9.13) the body is the one track 0 is in at its time:
   * the actor switches to it first, every animation of every track is bound to
   * that body by name, and the entities are carried over at the end.
   */
  apply(target: Skeleton | Actor): boolean {
    let skeleton: Skeleton;
    let bind: (animation: AnimationData) => AnimationData | null = (animation) => animation;
    if (target instanceof Actor) {
      const first = this.trackList[0] ?? null;
      skeleton = target.enter(first === null ? null : first.animation, first === null ? 0 : first.animationTime);
      bind = (animation) => target.animationFor(animation, target.body);
    } else {
      skeleton = target;
    }
    const applied = this.applyBound(skeleton, bind);
    if (target instanceof Actor) target.settle();
    return applied;
  }

  private applyBound(skeleton: Skeleton, bind: (animation: AnimationData) => AnimationData | null): boolean {
    if (this.resetToSetupPose) skeleton.setToSetupPose();
    const written = new Set<string>();
    let applied = false;

    for (let i = 0; i < this.trackList.length; i++) {
      const entry = this.trackList[i];
      if (entry === null || entry.alpha <= 0) continue;
      applied = true;
      // What the tracks BELOW own. The `first` blend loses to those, never to
      // the animation this same track is fading out of.
      const blocked: ReadonlySet<string> = new Set(written);

      const from = entry.mixingFrom;
      const a = clamp(entry.alpha, 0, 1);
      if (i === 0) {
        // Spec 7.11: "the animation the parent is playing" is the one of track 0.
        skeleton.playingAnimation = entry.animation.name;
        skeleton.playingTime = entry.animationTime;
        skeleton.playingLoop = entry.loop;
      }
      const animation = bind(entry.animation);
      if (animation === null) continue;
      if (from === null) {
        applyAnimationMixed(skeleton, animation, entry.animationTime, {
          alpha: a, blend: entry.mixBlend, boneMask: this.maskOf(skeleton, entry), blocked, written,
        });
        continue;
      }
      const fromAnimation = bind(from.animation);

      const m = entry.mixProgress;
      const denominator = 1 - a * m;
      const outgoing = denominator <= 1e-9 ? 0 : (a * (1 - m)) / denominator;
      if (fromAnimation !== null) {
        applyAnimationMixed(skeleton, fromAnimation, from.animationTime, {
          alpha: outgoing,
          blend: from.mixBlend,
          boneMask: this.maskOf(skeleton, from),
          shared: animationKeys(animation),
          holdAlpha: a * (1 - m),
          blocked,
          written,
        });
      }
      applyAnimationMixed(skeleton, animation, entry.animationTime, {
        alpha: a * m, blend: entry.mixBlend, boneMask: this.maskOf(skeleton, entry), blocked, written,
      });
    }
    return applied;
  }

  /** Bone names of a track turned into indices for this skeleton. */
  private maskOf(skeleton: Skeleton, entry: TrackEntry): ReadonlySet<number> | null {
    const names = entry.boneMask;
    if (names === null) return null;
    const out = this.maskScratch;
    out.clear();
    for (const name of names) {
      const bone = skeleton.findBone(name);
      if (bone !== null) out.add(bone.data.index);
    }
    return new Set(out);
  }

  // -------------------------------------------------------------------------
  // Listener queue
  // -------------------------------------------------------------------------

  private grow(trackIndex: number): void {
    while (this.trackList.length <= trackIndex) this.trackList.push(null);
  }

  private disposeQueue(entry: TrackEntry | null): void {
    let e = entry;
    while (e !== null) {
      const next = e.next;
      e.next = null;
      this.enqueue('dispose', e);
      e = next;
    }
  }

  private disposeEntry(entry: TrackEntry, ended: boolean): void {
    if (ended) this.enqueue('end', entry);
    this.enqueue('dispose', entry);
  }

  private enqueue(type: 'start' | 'interrupt' | 'end' | 'complete' | 'dispose', entry: TrackEntry): void {
    this.queue.push({ type, entry });
  }

  private enqueueEvent(entry: TrackEntry, fired: FiredEvent): void {
    this.queue.push({ type: 'event', entry, fired });
  }

  private drain(): void {
    if (this.draining) return;
    this.draining = true;
    try {
      while (this.queue.length > 0) {
        const item = this.queue.shift() as QueueItem;
        const entry = item.entry;
        if (entry.listener !== null) this.deliver(entry.listener, item);
        for (const listener of this.listeners.slice()) this.deliver(listener, item);
      }
    } finally {
      this.draining = false;
    }
  }

  private deliver(listener: AnimationStateListener, item: QueueItem): void {
    switch (item.type) {
      case 'start': listener.start?.(item.entry); break;
      case 'interrupt': listener.interrupt?.(item.entry); break;
      case 'end': listener.end?.(item.entry); break;
      case 'complete': listener.complete?.(item.entry); break;
      case 'dispose': listener.dispose?.(item.entry); break;
      case 'event': listener.event?.(item.entry, item.fired); break;
    }
  }
}
