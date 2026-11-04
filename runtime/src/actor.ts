// SPDX-License-Identifier: Apache-2.0
/**
 * The `Actor`: a project with several bodies, and the body switch of spec 9.13.
 *
 * The werewolf man is not one skeleton that changes shape: he is two bodies,
 * each with its own base (5.1), bones and skins. An animation of the man may
 * say, with a `body` key, "from 0.5 s on, the body is `lobisomem.bone`". The
 * rules this class keeps:
 *
 *   - every body is built ONCE, when the actor is made. A switch changes which
 *     skeleton is alive; no skeleton is ever rebuilt in the middle;
 *   - `corpoEm(animation, t)` is a pure function of `t`: BEFORE the first
 *     `body` key the body is the file's (the one exception to "before the first
 *     key, the first key"), and in a loop `t` is already `t mod duration`;
 *   - timelines match the body of the instant BY NAME. The animation is bound
 *     to each body once and cached; a name the body lacks is dropped with the
 *     warning `BODY_UNMET`, once. Nothing is converted;
 *   - the skin stack passes to the new body by name (`keepSkins: true`) or the
 *     body enters with `["default"]` (`keepSkins: false`) — also a function
 *     of `t`, walked key by key;
 *   - an entity (a `skeleton` attachment, 7.11) goes on when the new body has
 *     a slot of the same name showing the same `uri`: same clock, same
 *     animation. Otherwise the old instance is gone, with `NESTED_GONE`, once
 *     (Appendix C rule 16);
 *   - physics is per skeleton: the skeleton that enters starts as on its first
 *     `updatePose` (6.5). A body never posed already is; a body that COMES
 *     BACK gets `physicsReset` (Appendix C rule 12).
 *
 * A project with one body and no `body` key is just a `Skeleton`: the actor
 * then always answers the file, and `pose` is the `Pose` of 9.10.
 */

import type { AnimationData, SkeletonData } from './data.js';
import { Skeleton } from './skeleton.js';
import { applyAnimation, findKeyIndex } from './animation.js';
import { loadAnimationsFor } from './loader.js';
import { NestedSkeleton } from './nested.js';
import { SkeletonAttachment } from './attachments/skeleton-attachment.js';

/** What `corpoEm` answers for an instant (spec 9.13). */
export interface BodyAt {
  /** The `value` of the key in force, or `null` = the body of the file. */
  readonly body: string | null;
  /** The skin stack of that instant, by name, bottom to top. */
  readonly stack: readonly string[];
}

export class Actor {
  /** The body of the file itself. */
  readonly arquivo: SkeletonData;
  /** One skeleton per body, built once. Key `null` = the file; the others by key `value`. */
  readonly esqueletos: ReadonlyMap<string | null, Skeleton>;
  /** Warnings of the switch (`BODY_UNMET`, `BODY_MISSING`, `SKIN_UNMET`, `NESTED_GONE`), each once. */
  readonly warnings: string[] = [];

  /** The skeleton alive right now. */
  skeleton: Skeleton;
  /** Key `value` of the body alive right now; `null` = the file. */
  body: string | null = null;

  /** The skin stack the game chose, by name (spec 4.4). */
  private gameStack: string[];
  /** Animation -> body -> the animation bound to that body by name (`null` = could not bind). */
  private readonly bound = new Map<AnimationData, Map<string, AnimationData | null>>();
  /** Skeleton the actor left on the last switch, until its entities are carried over. */
  private leaving: Skeleton | null = null;
  /** Skeletons already posed in this playback (Appendix C rule 12). */
  private readonly posed = new Set<Skeleton>();

  constructor(file: SkeletonData, bodies: ReadonlyMap<string, SkeletonData> = new Map()) {
    this.arquivo = file;
    const map = new Map<string | null, Skeleton>();
    map.set(null, new Skeleton(file));
    for (const [key, data] of bodies) map.set(key, new Skeleton(data));
    this.esqueletos = map;
    this.skeleton = map.get(null)!;
    this.gameStack = this.skeleton.skinStack.map((skin) => skin.name);
  }

  /**
   * The skin stack the game chooses, bottom to top (spec 4.4). Every name must
   * be a skin of the file (unknown throws, as `Skeleton.setSkinStack`). It
   * holds until a `body` key with `keepSkins: false` resets it.
   */
  setSkinStack(names: readonly string[]): void {
    for (const name of names) {
      if (this.arquivo.findSkin(name) === null) throw new Error(`skin not found: "${name}"`);
    }
    this.gameStack = names.slice();
    this.applyStack(this.skeleton, this.body, this.gameStack);
  }

  /** The stack the game chose, by name. */
  get skinStack(): readonly string[] {
    return this.gameStack;
  }

  /**
   * `corpoEm(animation, t)` of spec 9.13, with the stack of that instant.
   * `t` is animation time, the loop already applied. A key that names a body
   * that was not loaded is skipped: the body before it holds (warning once).
   */
  corpoEm(animation: AnimationData | null, t: number): BodyAt {
    let body: string | null = null;
    let stack: readonly string[] = this.gameStack;
    const tl = animation === null ? null : animation.body;
    if (tl === null) return { body, stack };
    const last = findKeyIndex(tl.times, t);
    for (let i = 0; i <= last; i++) {
      const key = tl.keys.values[i];
      if (key.value !== null && !this.esqueletos.has(key.value)) {
        this.warn(`BODY_MISSING: o corpo "${key.value}" da animação "${animation!.name}" não foi carregado; fica o corpo de antes (9.13)`);
        continue;
      }
      body = key.value;
      if (!key.keepSkins) stack = ['default'];
    }
    return { body, stack };
  }

  /**
   * `animation` bound BY NAME to `body` (spec 9.13), built once and cached.
   * `body: null` is the file, and the animation itself. `null` when the body
   * is unknown or the animation was built in code (no JSON to bind).
   */
  animationFor(animation: AnimationData, body: string | null): AnimationData | null {
    if (body === null) return animation;
    const skeleton = this.esqueletos.get(body);
    if (skeleton === undefined) return null;
    let perBody = this.bound.get(animation);
    if (perBody === undefined) {
      perBody = new Map();
      this.bound.set(animation, perBody);
    }
    if (perBody.has(body)) return perBody.get(body)!;
    let result: AnimationData | null = null;
    if (animation.source === null) {
      this.warn(`BODY_UNBOUND: a animação "${animation.name}" não veio de um arquivo e não pode valer no corpo "${body}"`);
    } else {
      const loaded = loadAnimationsFor(skeleton.data, { animations: [animation.source] }, { unmetCode: 'BODY_UNMET' });
      result = loaded.animations[0] ?? null;
      for (const w of loaded.warnings) {
        if (w.message.startsWith('BODY_UNMET')) this.warn(`${w.message} (corpo "${body}", animação "${animation.name}")`);
      }
    }
    perBody.set(body, result);
    return result;
  }

  /**
   * Makes the body of `(animation, t)` the live one, with the stack of that
   * instant, and returns its skeleton. Does not pose it. A body that comes
   * back has its physics reset (6.5, Appendix C rule 12). Call `settle` after
   * the animation is applied, so the entities can go on (7.11).
   */
  enter(animation: AnimationData | null, t: number): Skeleton {
    const { body, stack } = this.corpoEm(animation, t);
    const next = this.esqueletos.get(body) ?? this.skeleton;
    const previous = this.skeleton;
    if (next !== previous) {
      if (this.posed.has(next)) next.physicsReset();
      this.leaving = previous;
    }
    this.posed.add(next);
    this.skeleton = next;
    this.body = body;
    this.applyStack(next, this.body, stack);
    return next;
  }

  /**
   * After the animation was applied to the skeleton that just entered: every
   * entity that lived in a slot of the same name with the same `uri` in the
   * body that was left goes on with its clocks (spec 7.11, 9.13). An entity
   * with nowhere to go is gone, with a warning once. Nothing is invented.
   */
  settle(): void {
    const from = this.leaving;
    this.leaving = null;
    if (from === null) return;
    const to = this.skeleton;
    for (const oldSlot of from.slots) {
      const old = oldSlot.nested;
      if (!(old instanceof NestedSkeleton)) continue;
      const slot = to.findSlot(oldSlot.data.name);
      const att = slot === null ? null : slot.attachment;
      if (slot === null || !(att instanceof SkeletonAttachment) || att.resolvedUri !== old.attachment.resolvedUri) {
        this.warn(`NESTED_GONE: a entidade do slot "${oldSlot.data.name}" (${old.attachment.resolvedUri}) não tem lugar no corpo "${this.body ?? '(o arquivo)'}"; some (7.11)`);
        continue;
      }
      const instance = slot.nestedSkeleton();
      if (instance instanceof NestedSkeleton) instance.continueFrom(old);
    }
  }

  /**
   * `Pose(projeto, animation, t, now)` of spec 9.10: the body of the instant,
   * its base, the animation bound to it, the entities carried over, and the
   * world transform at `now`. `t` is animation time (loop applied by the
   * caller); `now` is the skeleton clock (6.5), `t` when omitted. Returns the
   * skeleton that was posed.
   */
  pose(animation: AnimationData | null, t: number, now: number = t, loop = false): Skeleton {
    const skeleton = this.prepare(animation, t, loop);
    skeleton.updateWorldTransform(now);
    return skeleton;
  }

  /**
   * `pose` without the world transform: for a caller that still has work to
   * do between the two (physics `reset` keys, a parameter from the game).
   * Returns the live skeleton; `boundAnimation` says what was applied.
   * `loop` says whether the animation is playing in a loop: an entity with
   * `inheritAnimation` follows it (Appendix C rule 4).
   */
  prepare(animation: AnimationData | null, t: number, loop = false): Skeleton {
    const skeleton = this.enter(animation, t);
    skeleton.setToSetupPose();
    const bound = animation === null ? null : this.animationFor(animation, this.body);
    this.boundAnimation = bound;
    if (bound !== null) {
      applyAnimation(skeleton, bound, t);
      skeleton.playingLoop = loop;
    }
    this.settle();
    return skeleton;
  }

  /** The animation `prepare` applied last, bound to the live body; `null` = setup pose. */
  boundAnimation: AnimationData | null = null;

  /** Sets the stack on a body by name, dropping the names it lacks (warning once). Re-resolves only on change. */
  private applyStack(skeleton: Skeleton, body: string | null, names: readonly string[]): void {
    const known: string[] = [];
    for (const name of names) {
      if (skeleton.data.findSkin(name) === null) {
        this.warn(`SKIN_UNMET: o corpo "${body ?? '(o arquivo)'}" não tem a pele "${name}"; ela fica fora da pilha (9.13)`);
        continue;
      }
      known.push(name);
    }
    const same = skeleton.skinStack.length === known.length
      && skeleton.skinStack.every((skin, i) => skin.name === known[i]);
    if (!same) skeleton.setSkinStack(known);
  }

  private warn(message: string): void {
    if (!this.warnings.includes(message)) this.warnings.push(message);
  }
}

/** `Pose(actor, animation, t, now)` of spec 9.10 as a function. */
export function poseActor(actor: Actor, animation: AnimationData | null, t: number, now: number = t, loop = false): Skeleton {
  return actor.pose(animation, t, now, loop);
}
