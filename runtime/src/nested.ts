// SPDX-License-Identifier: Apache-2.0
/**
 * Nested skeletons (spec 7.11): a whole skeleton living inside a slot.
 *
 * A `skeleton` attachment names another file. Once that file is loaded — by
 * `LoadOptions.skeletons`, or out of the `.bonez` the parent came in — the
 * attachment carries it in `child`, and this module turns it into a live
 * instance: it hangs the child's root bones from the slot bone, drives the
 * child clock from the parent clock, applies the `nested` timelines of spec
 * 9.9 and multiplies the parent slot's `light` into the child's slots.
 *
 * The child is a plain `Skeleton`, so its constraints, its physics and its own
 * nested children all work as usual. `collectDrawables` already lists the
 * `skeleton` attachment; a renderer draws `slot.nestedSkeleton()` as a block,
 * in the parent's draw order, as spec 7.11 asks.
 *
 * Refusals (spec 7.11, 12.6), all of them L1 with the same fallback as a
 * missing image — nothing is drawn and the user is told once:
 *   - the `uri` did not resolve to a file;
 *   - the chain would loop (`A` inside `B` inside `A`);
 *   - the chain would go past depth 8.
 */

import type { AnimationData, SkeletonData, SkinData } from './data.js';
import { SkeletonAttachment } from './attachments/skeleton-attachment.js';
import type { Attachment } from './attachments/attachment.js';
import {
  Skeleton, registerNestedFactory, type NestedInstance, type Slot,
} from './skeleton.js';
import { applyAnimation, applyResets } from './animation.js';
import { computeFinalColor, createFinalColor, type FinalColor } from './color.js';
import { identityMatrix } from './math.js';

/** Deepest chain of nested skeletons a reader must open (spec 12.6). */
export const MAX_NESTED_DEPTH = 8;

/**
 * A live child of one `skeleton` attachment.
 *
 * Every clock is derived, never accumulated (principle 11, Appendix C rule 1):
 * the same parent time always gives the same child pose, which is what the
 * conformance suite of spec 12.4 compares. The zero of the child clock is the
 * start of the run of `slot/attachment` keys that shows this entity at `t`
 * (`Slot.nestedOrigin`), or 0 without such a timeline; a skin change never
 * resets it. The parent time is the parent's animation time, loop applied
 * (rule 2): in a loop the child starts again on every lap of the parent.
 */
export class NestedSkeleton implements NestedInstance {
  /** The attachment in force. `rebind` swaps it for another one of the same `uri`. */
  attachment: SkeletonAttachment;
  readonly skeleton: Skeleton;

  /** Animation playing on top in the child, or `null` = none (spec 7.11). */
  animation: AnimationData | null = null;
  /** Name asked for, whether or not it exists in the child. */
  animationName: string | null = null;
  /** Child clock of the animation on top, in seconds, before its loop. */
  time = 0;
  /** Whether the animation on top loops: the attachment's `loop`, or the parent's for `inheritAnimation` (rules 3, 4). */
  topLoop = true;
  /** The `baseAnimation` of the attachment, or `null` (spec 7.11). */
  baseAnimation: AnimationData | null;
  /** Background clock in seconds (spec 7.11 `tBase`), before the loop. */
  baseTime = 0;
  /** Multiplier from the parent clock to the child clock used this frame (1 when `nested/time` drives it). */
  clockScale = 1;
  /**
   * The clocks of the previous `update`, for the `(previous, now]` window of
   * the child's `reset` keys (spec 9.8, 8.6). The child's animation counts in
   * full (7.11), so its physics resets fire like the parent's (case C-326).
   * `-Infinity` = a new run: keys at 0 fire on the first frame.
   */
  private resetTop = { animation: null as AnimationData | null, time: -Infinity };
  private resetBase = { animation: null as AnimationData | null, time: -Infinity };
  private readonly parentLight: FinalColor = createFinalColor();

  constructor(slot: Slot, attachment: SkeletonAttachment, data: SkeletonData) {
    this.attachment = attachment;
    this.skeleton = new Skeleton(data, slot);
    this.applySkins(slot);
    this.setAnimation(attachment.animation);
    const base = attachment.baseAnimation;
    this.baseAnimation = base === null ? null : data.findAnimation(base);
    if (base !== null && this.baseAnimation === null) {
      warnNested(slot, `O esqueleto "${attachment.uri}" não tem a animação de fundo "${base}" (7.11).`);
    }
  }

  /**
   * Takes over the state of the instance that lived in a slot of the same name
   * and the same `uri` in the body the animation left (spec 7.11, 9.13). The
   * clocks are derived, so this only carries what the previous frame chose;
   * the next `update` recomputes the same numbers from `t`.
   */
  continueFrom(other: NestedSkeleton): void {
    this.setAnimation(other.animationName);
    this.time = other.time;
    this.baseTime = other.baseTime;
    this.topLoop = other.topLoop;
    this.clockScale = other.clockScale;
    this.resetTop = { ...other.resetTop };
    this.resetBase = { ...other.resetBase };
  }

  /**
   * The slot moved to another `skeleton` attachment (spec 7.11). Same resolved
   * `uri` and same loaded file: this instance goes on — its skeleton, its
   * physics, its clocks — reading the fields of the new attachment from now on.
   * Anything else: `false`, and the caller lets the instance go.
   */
  rebind(attachment: Attachment): boolean {
    if (!(attachment instanceof SkeletonAttachment)) return false;
    const old = this.attachment;
    if (attachment.resolvedUri !== old.resolvedUri || attachment.child !== old.child) return false;
    this.attachment = attachment;
    const slot = this.skeleton.nestedOwner;
    const sameSkins = attachment.skins.length === old.skins.length && attachment.skins.every((s, i) => s === old.skins[i]);
    if (!sameSkins && slot !== null) this.applySkins(slot);
    const base = attachment.baseAnimation;
    this.baseAnimation = base === null ? null : this.skeleton.data.findAnimation(base);
    return true;
  }

  /** Skins asked for by the attachment; a name the child does not have is a warning. */
  private applySkins(slot: Slot): void {
    const wanted = this.attachment.skins;
    if (wanted.length === 0) return;
    const found: SkinData[] = [];
    for (const name of wanted) {
      const skin = this.skeleton.data.findSkin(name);
      if (skin === null) {
        warnNested(slot, `O esqueleto "${this.attachment.uri}" não tem a pele "${name}".`);
        continue;
      }
      found.push(skin);
    }
    if (found.length > 0) this.skeleton.setSkin(found);
  }

  /** Names the animation on top (spec 9.9); `null` = none. The clock is not stored here. */
  setAnimation(name: string | null): void {
    if (name === this.animationName && (name === null || this.animation !== null)) return;
    this.animationName = name;
    this.animation = name === null ? null : this.skeleton.data.findAnimation(name);
  }

  /**
   * Places and poses the child for the parent clock `now` (spec 7.11, 9.9,
   * Appendix C rules 1 to 5). Called by `Skeleton.updateNested` once the
   * parent's bones are final.
   */
  update(slot: Slot, now: number): void {
    const att = this.attachment;
    const parent = slot.skeleton;
    // Rule 2: the parent's animation time, loop applied; `now` in a setup pose.
    const parentTime = parent.playingAnimation !== null ? parent.playingTime : now;
    const scale = Number.isFinite(slot.nestedTimeScale) ? slot.nestedTimeScale : att.timeScale;
    const attached = slot.nestedOrigin;

    // Which animation plays on top (spec 7.11 table, strongest first):
    // 1. a `nested/animation` key; its `null` means "none on top" and does
    //    NOT fall through; 2. `inheritAnimation` and the child has the name the
    //    parent is playing; 3. the `animation` of the attachment; 4. nothing.
    let topTime: number;
    if (slot.nestedAnimationSet) {
      this.setAnimation(slot.nestedAnimation);
      // Zeroed where the run of `nested/animation` keys with this name began,
      // never before the entity was shown (rule 3: the attachment's loop).
      topTime = (parentTime - Math.max(attached, slot.nestedAnimationOrigin)) * scale;
      this.topLoop = att.loop;
    } else if (att.inheritAnimation && parent.playingAnimation !== null
      && this.skeleton.data.findAnimation(parent.playingAnimation) !== null) {
      this.setAnimation(parent.playingAnimation);
      // Rule 4: the parent's clock and the parent's loop.
      topTime = parentTime * scale;
      this.topLoop = parent.playingLoop;
    } else {
      this.setAnimation(att.animation);
      topTime = (parentTime - attached) * scale;
      this.topLoop = att.loop;
    }
    // Rule 5: `nested/time` drives the animation on top, whatever its source,
    // and `timeScale` is ignored while it does.
    const driven = Number.isFinite(slot.nestedTime);
    this.time = driven ? slot.nestedTime : topTime;
    this.clockScale = driven ? 1 : scale;
    // 7.11 `tBase`: its own clock since the entity was shown, never reset by
    // the animation on top and never driven by `nested/time`.
    this.baseTime = (parentTime - attached) * scale;

    const child = this.skeleton;
    // 7.11: `M_slotBone x T(x, y) R(rotation) S(scaleX, scaleY)`, with the
    // applied bone and its `slot/bone` transform (9.5).
    if (child.parentMatrix === null) child.parentMatrix = identityMatrix();
    att.computeParentMatrix(slot.boneMatrix, child.parentMatrix);

    // Two layers, fixed order (7.11): the background animation over the setup
    // pose, then the animation on top, property by property. The parent tint
    // is folded in before the world pass so a grandchild inherits it the same way.
    child.setToSetupPose();
    const base = this.baseAnimation;
    if (base !== null) applyAnimation(child, base, loopTime(this.baseTime, base.duration));
    const animation = this.animation;
    if (animation !== null) {
      applyAnimation(child, animation, this.animationTime(animation));
      child.playingLoop = this.topLoop;
    }
    if (att.inheritColor && slot.attachment !== null) this.inheritColor(slot);
    // Spec 9.8: the `reset` keys crossed since the previous frame, BEFORE the
    // physics of this frame runs (the order C-262 measures).
    fireResets(child, base, this.baseTime, true, this.resetBase);
    fireResets(child, animation, this.time, this.topLoop, this.resetTop);
    child.updateWorldTransform(this.time);
  }

  /** Time inside the animation on top, wrapped when it loops (spec 9.11). */
  animationTime(animation: AnimationData): number {
    if (!this.topLoop) return this.time;
    return loopTime(this.time, animation.duration);
  }

  /**
   * Spec 7.11: the parent slot's `light` (7.12) multiplies the `light` of
   * every slot of the child. `darkColor` is not inherited.
   */
  private inheritColor(slot: Slot): void {
    computeFinalColor(slot, slot.attachment!, this.parentLight);
    const l = this.parentLight.light;
    for (const s of this.skeleton.slots) {
      s.color[0] *= l[0];
      s.color[1] *= l[1];
      s.color[2] *= l[2];
      s.color[3] *= l[3];
    }
  }

}

/**
 * The `reset` keys of `animation` crossed in `(last.time, now]`, on the child's
 * own clock before its loop. Another animation, or a clock that went back (the
 * entity shown again, a new run of `nested/animation`), starts a new window.
 */
function fireResets(
  child: Skeleton, animation: AnimationData | null, now: number, loop: boolean,
  last: { animation: AnimationData | null; time: number },
): void {
  if (animation !== last.animation || now < last.time) last.time = -Infinity;
  last.animation = animation;
  if (animation !== null) applyResets(child, animation, last.time, now, loop);
  last.time = now;
}

/** `t mod duration` (spec 9.11); `t` itself for a pose of duration 0. */
function loopTime(t: number, duration: number): number {
  if (duration <= 0) return t;
  return t - Math.floor(t / duration) * duration;
}

/**
 * Prefix spec 7.11 asks for on an event that came out of a child:
 * `"<slot>/<evento>"`. The game reads the child's events with `fireEvents`
 * over `nested.skeleton` and renames them with this.
 */
export function nestedEventName(slot: Slot, eventName: string): string {
  return slot.data.name + '/' + eventName;
}

/**
 * Builds the instance for `slot`, or returns `null` with a warning when the
 * nesting is refused (spec 7.11). Installed as the runtime factory below.
 */
export function createNestedSkeleton(slot: Slot): NestedSkeleton | null {
  const att = slot.attachment;
  if (!(att instanceof SkeletonAttachment)) return null;
  const data = att.child;
  const owner = slot.skeleton;

  if (data === null) {
    warnNested(slot, `O slot "${slot.data.name}" aponta para o esqueleto "${att.uri}", que não foi carregado. Nada é desenhado nele.`);
    return null;
  }
  if (owner.nestedDepth + 1 > MAX_NESTED_DEPTH) {
    warnNested(slot, `Entidade passou da profundidade máxima de ${MAX_NESTED_DEPTH} (12.6) em "${att.uri}".`);
    return null;
  }
  // Cycle: this very file is already somewhere in the chain that leads here.
  for (let s: Slot | null = slot; s !== null; s = s.skeleton.nestedOwner) {
    if (s.skeleton.data === data) {
      warnNested(slot, `Ciclo de entidade em "${att.uri}": o arquivo já está na cadeia (7.11).`);
      return null;
    }
  }
  return new NestedSkeleton(slot, att, data);
}

/** Records a message once, on the top-level skeleton of the chain. */
function warnNested(slot: Slot, message: string): void {
  let root = slot.skeleton;
  while (root.nestedOwner !== null) root = root.nestedOwner.skeleton;
  if (!root.nestedWarnings.includes(message)) root.nestedWarnings.push(message);
}

registerNestedFactory(createNestedSkeleton);
