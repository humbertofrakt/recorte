/**
 * The promise `keying.ts` makes, written down and checked by the compiler.
 *
 * This file holds no logic. It states the signature every other module is
 * allowed to depend on, and the assignments at the bottom fail to compile the
 * day `keying.ts` changes one of them. It is the cheapest contract test there
 * is: no runtime, no test file, just types.
 *
 * POSE MODE, the rule this phase introduces:
 *  - assembly mode (`doc.animation === null`): editing a value writes the setup
 *    pose, that is the object in `file.bones` / `slots` / `skins`;
 *  - animation mode (`doc.animation !== null`): editing a value must NOT touch
 *    the setup pose. It creates or updates a key on the matching timeline, at
 *    `doc.time`, inside the open animation.
 *
 * The address of a timeline is `TimelineTarget` (spec 9.1): the tuple
 * `(type, target, property, skin, attachment)`. There is no second, friendlier
 * address — one shape, so nothing has to be translated.
 */

import type { BoneFile, KeyDef, KeyValue } from '../../../runtime/src/index.js';
import {
  isKeyed, keyTimes, moveKeys, removeKey, scaleKeys, setKey, setupValueFor,
  timelinePointerFor, valueAt,
} from './keying.js';
import type { KeyRef, SetKeyOptions, TimelineTarget } from './keying.js';

/** JSON Pointer of a timeline, created on the way when `create` is `true`. */
export type TimelinePointerFn = (
  file: BoneFile, animation: string, target: TimelineTarget, create?: boolean,
) => string | null;

/** Creates or updates the key of `target` at `time`. */
export type SetKeyFn = (
  file: BoneFile, animation: string, time: number, target: TimelineTarget,
  value?: KeyValue, options?: SetKeyOptions,
) => KeyDef;

/** Removes the key of `target` at `time`; `false` when there was none. */
export type RemoveKeyFn = (
  file: BoneFile, animation: string, time: number, target: TimelineTarget, event?: string,
) => boolean;

/** Times of every key on the timeline `target` names, in ascending order. */
export type KeyTimesFn = (
  file: BoneFile, animation: string, target: TimelineTarget,
) => number[];

/** `true` when `target` already has a key at `time`. */
export type IsKeyedFn = (
  file: BoneFile, animation: string, time: number, target: TimelineTarget,
) => boolean;

/** Value of that timeline at `time`, sampled through the curves of 9.3. */
export type ValueAtFn = (
  file: BoneFile, animation: string, time: number, target: TimelineTarget,
) => KeyValue | undefined;

/** The value `target` has in the setup pose (spec 5.1). */
export type SetupValueFn = (file: BoneFile, target: TimelineTarget) => KeyValue | undefined;

/** Slides a set of keys along the time axis by `delta` seconds. */
export type MoveKeysFn = (
  file: BoneFile, animation: string, refs: readonly KeyRef[], delta: number,
) => KeyRef[];

/** Stretches a set of keys around `pivot`. */
export type ScaleKeysFn = (
  file: BoneFile, animation: string, refs: readonly KeyRef[], pivot: number, factor: number,
) => KeyRef[];

// The checks. Each line is a compile error the day the implementation drifts.
const checkTimelinePointer: TimelinePointerFn = timelinePointerFor;
const checkSetKey: SetKeyFn = setKey;
const checkRemoveKey: RemoveKeyFn = removeKey;
const checkKeyTimes: KeyTimesFn = keyTimes;
const checkIsKeyed: IsKeyedFn = isKeyed;
const checkValueAt: ValueAtFn = valueAt;
const checkSetupValue: SetupValueFn = setupValueFor;
const checkMoveKeys: MoveKeysFn = moveKeys;
const checkScaleKeys: ScaleKeysFn = scaleKeys;

/** Kept so the checks above are not dead code the bundler drops. */
export const KEYING_CONTRACT = [
  checkTimelinePointer, checkSetKey, checkRemoveKey, checkKeyTimes, checkIsKeyed,
  checkValueAt, checkSetupValue, checkMoveKeys, checkScaleKeys,
] as const;
