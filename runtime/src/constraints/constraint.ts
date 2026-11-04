// SPDX-License-Identifier: Apache-2.0
/**
 * Runtime constraint interface and registry (spec 5.6, 6.1).
 *
 * A `Skeleton` creates one `Constraint` instance per `ConstraintData` through
 * the factory registered for `data.type`. Types without a factory are ignored
 * (spec 2.5: unknown constraint type -> ignore).
 *
 * The real implementations live in sibling files (`ik.ts`, `transform.ts`,
 * `path.ts`, `physics.ts`, `driver.ts`) and replace the noop factories
 * registered here by calling `registerConstraint` again.
 */

import type { ConstraintData } from '../data.js';
import type { Bone, Skeleton } from '../skeleton.js';

/**
 * After a constraint wrote the world matrix of `bone` directly: derive the
 * applied pose (spec 5.5), keep the written matrix as the bone's world (it is
 * not recomputed, as in Spine), and dirty the descendants (spec 5.6).
 *
 * Shared by `transform.ts` and `path.ts`, the two constraints that write the
 * matrix instead of the applied pose.
 */
export function finishWorldWrite(bone: Bone): void {
  bone.updateAppliedTransform();
  bone.dirty = false;
  const children = bone.children;
  for (let i = 0; i < children.length; i++) children[i].dirty = true;
}

export interface Constraint {
  readonly data: ConstraintData;
  /** `false` disables the constraint entirely (runtime switch, not in the file). */
  active: boolean;
  /** Current mix. `0` = off, `1` = full. Animatable (spec 6.1). */
  mix: number;
  /**
   * Applies the constraint (spec 5.6 step 2). Bones it reads are up to date
   * when called; it must write the applied pose and world matrix of the bones
   * it changes (through `Bone.updateWorldTransform`, which marks the direct
   * children dirty).
   *
   * Dirty rule (spec 5.6): after writing a bone, its descendants MUST be
   * recomputed before being read again inside the same `update`. Use
   * `Bone.updateWorldTransformWithChildren()` (subtree) or
   * `skeleton.updateDirtyBones()` (everything) before such a read.
   *
   * `now` is the skeleton time in seconds (spec 6.5), monotonic; physics keeps
   * its own `lastTime` to derive the elapsed delta.
   */
  update(skeleton: Skeleton, now: number): void;
  /** Clears internal state (physics `reset`, spec 6.5). No-op for stateless constraints. */
  reset(): void;
  /** Restores every animatable value to the file values (spec 5.1). */
  setToSetupPose(): void;
}

export type ConstraintFactory = (data: ConstraintData, skeleton: Skeleton) => Constraint;

const registry = new Map<string, ConstraintFactory>();

/** Registers (or replaces) the factory used for constraints of `type`. */
export function registerConstraint(type: string, factory: ConstraintFactory): void {
  registry.set(type, factory);
}

export function getConstraintFactory(type: string): ConstraintFactory | null {
  return registry.get(type) ?? null;
}

/** Creates the runtime instance for `data`, or `null` when the type is unknown. */
export function createConstraint(data: ConstraintData, skeleton: Skeleton): Constraint | null {
  const factory = registry.get(data.type);
  return factory === undefined ? null : factory(data, skeleton);
}

/**
 * Placeholder that keeps `mix` and does nothing. Registered for the five core
 * types until the real implementations replace it.
 */
export class NoopConstraint implements Constraint {
  readonly data: ConstraintData;
  active = true;
  mix: number;

  constructor(data: ConstraintData) {
    this.data = data;
    this.mix = data.mix;
  }

  update(_skeleton: Skeleton, _now: number): void {
    // Nothing: the real behaviour lives in the sibling files.
  }

  reset(): void {
    // No state.
  }

  setToSetupPose(): void {
    this.mix = this.data.mix;
  }
}

const noopFactory: ConstraintFactory = (data) => new NoopConstraint(data);

// Fallback registrations. Importing `ik.ts`, `transform.ts`, `path.ts`,
// `physics.ts` and `driver.ts` replaces each one with the real factory (the
// last `registerConstraint` for a type wins). `../index.ts` imports all five
// for that side effect, so a consumer of the entry point never gets a noop.
// A type left with the noop still loads and animates: only the constraint's
// own effect is missing (spec 2.5).
registerConstraint('ik', noopFactory);
registerConstraint('transform', noopFactory);
registerConstraint('path', noopFactory);
registerConstraint('physics', noopFactory);
registerConstraint('driver', noopFactory);
