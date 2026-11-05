// SPDX-License-Identifier: Apache-2.0
/**
 * Slicing a `.bone` file by skin, by animation or by slot folder (requirement
 * E3, spec sections 4.4, 7.1, 9.5 and 10).
 *
 * WHY THIS EXISTS
 * ---------------
 * Ten characters that share one skeleton are authored in ONE project, and that
 * is the right way to author them: one rig, one set of animations, ten skins.
 * A game does not want to load ten skins on every screen. So the publisher
 * needs the opposite move at the end: cut the one project into one file per
 * character, and one atlas per character.
 *
 * WHAT THIS MODULE PROMISES
 * -------------------------
 * The sliced file poses IDENTICALLY to the whole file, for the skins that
 * survived. That is the only promise worth making, and it is the one the tests
 * measure, by comparing the pose dump of section 12.4 of both files.
 *
 * To keep it, nothing is removed unless removing it provably cannot move a
 * surviving bone, slot or vertex:
 *
 *   skin          removed when it was not asked for. A skin that is not active
 *                 draws nothing, so the pose of the active ones does not care.
 *   animation     removed when it was not asked for. An animation nobody plays
 *                 changes no pose. Animations a surviving `driver` constraint
 *                 plays are kept even when they were not asked for (6.6).
 *   slot          removed only by the folder filter, and only when no
 *                 surviving constraint needs it (a `path` constraint reads its
 *                 target slot, 6.4).
 *   attachment    removed with its slot or with its skin. Orphans too: a
 *                 `linkedmesh` whose parent placeholder went away (7.5).
 *   bone          removed only when NOTHING that survived can read it: no live
 *                 slot sits on it, no live weighted vertex names it, no live
 *                 timeline moves it, no live constraint touches it, no live
 *                 parameter reads it, and no surviving bone descends from it.
 *                 A bone like that cannot influence any surviving world
 *                 transform, because transforms only flow from parent to child.
 *   constraint    removed when no skin that survived can switch it on
 *                 (`skinRequired`, 7.1), or when every bone it WRITES to is
 *                 itself unread. In both cases nothing surviving reads its
 *                 result.
 *   event         removed when no surviving animation fires it (9.7). An event
 *                 only reaches the game through a key.
 *
 * WHAT IS NEVER REMOVED, ON PURPOSE
 * ---------------------------------
 * `parameters`, `variables` and `tags`. They are the knobs the GAME reads and
 * writes at run time (8.3, 8.4, 8.5); a knob with no key in this file may still
 * be set by code. They are also a few bytes each. Removing them would trade a
 * measurable risk for an unmeasurable gain.
 *
 * Bones are never REORDERED either, and `bones[0]` is never removed: spec 4.7
 * makes the first bone the fallback parent, and `binding.bones[]` addresses
 * bones by POSITION. Positions are renumbered when a bone goes, and every
 * binding is rewritten to match.
 */

import type {
  AtlasFile, AtlasRegion, AttachmentDef, BindingDef, BoneFile, ClippingAttachmentDef,
  ConstraintDef, DrawOrderEntry, KeyDef, SequenceDef, SkinDef, TimelineDef,
} from '../../../runtime/src/types.js';
import { packAtlas } from '../atlas/packer.js';
import type { AtlasJson, PackedPage, PackOptions, PackerItem } from '../atlas/packer.js';

// ---------------------------------------------------------------------------
// What the caller asks for
// ---------------------------------------------------------------------------

export interface SliceOptions {
  /**
   * Skins to keep, by name. `undefined` keeps every skin. `"default"` is
   * always kept (4.4: it is always active), and so is every skin a kept skin
   * pulls in through `includes`.
   */
  readonly skins?: readonly string[];
  /** Animations to keep, by name. `undefined` keeps every animation. */
  readonly animations?: readonly string[];
  /**
   * Slot folders to keep. A slot is kept when its `folder` is one of these, or
   * starts with one of these followed by `/`. `undefined` keeps every slot.
   */
  readonly folders?: readonly string[];
  /** Remove events no surviving animation fires. Default `true`. */
  readonly dropUnusedEvents?: boolean;
  /** Remove constraints nothing surviving reads. Default `true`. */
  readonly dropUnusedConstraints?: boolean;
  /** Remove bones nothing surviving reads. Default `true`. */
  readonly dropUnusedBones?: boolean;
  /** Written into `bone.generator` when given. */
  readonly generator?: string;
}

// ---------------------------------------------------------------------------
// What the caller gets back
// ---------------------------------------------------------------------------

/** Kind of thing that left the file. English identifier, Portuguese label. */
export type RemovedKind =
  | 'skin' | 'animation' | 'slot' | 'attachment' | 'bone' | 'constraint'
  | 'event' | 'timeline' | 'morph' | 'reference';

/** Portuguese name of each kind, for anything a person reads. */
export const KIND_LABELS: Readonly<Record<RemovedKind, string>> = Object.freeze({
  skin: 'pele',
  animation: 'animação',
  slot: 'slot',
  attachment: 'desenho',
  bone: 'osso',
  constraint: 'regra',
  event: 'evento',
  timeline: 'trilha',
  morph: 'morph',
  reference: 'referência',
});

/** One thing that left the file, and why. */
export interface RemovedItem {
  readonly kind: RemovedKind;
  /** Name a person would recognise, e.g. `armadura` or `cape_upper / cape_upper`. */
  readonly name: string;
  /** One short sentence in Portuguese. */
  readonly reason: string;
  /** Bytes of compact JSON that went away with it. */
  readonly bytes: number;
}

/** Head count of one file, before or after the cut. */
export interface SliceCounts {
  bones: number;
  slots: number;
  skins: number;
  attachments: number;
  constraints: number;
  events: number;
  animations: number;
  timelines: number;
  keys: number;
  /** Length of the compact JSON, in bytes. */
  bytes: number;
}

export interface SliceResult {
  /** The sliced file. A fresh object; the input is never touched. */
  readonly file: BoneFile;
  /** Everything that left, item by item, in reading order. */
  readonly removed: readonly RemovedItem[];
  readonly before: SliceCounts;
  readonly after: SliceCounts;
  /** Skins that survived, in file order. */
  readonly skins: readonly string[];
  /** Animations that survived, in file order. */
  readonly animations: readonly string[];
  /** Atlas region names the sliced file still asks for (10.5). */
  readonly regions: readonly string[];
  /** Slots kept against the folder filter because a live constraint reads them. */
  readonly slotsKeptForConstraints: readonly string[];
  /** Animations kept against the filter because a live `driver` plays them. */
  readonly animationsKeptForDrivers: readonly string[];
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

/** A `.bone` file is JSON, so JSON is a complete and honest deep copy. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Bytes of the compact JSON of one value. `undefined` is zero bytes. */
export function jsonBytes(value: unknown): number {
  if (value === undefined) return 0;
  const text = JSON.stringify(value);
  if (text === undefined) return 0;
  // Names may carry accents, so count UTF-8 bytes, not characters.
  return new TextEncoder().encode(text).length;
}

/** Head count of one file. */
export function countFile(file: BoneFile): SliceCounts {
  let attachments = 0;
  for (const skin of file.skins ?? []) {
    for (const slot of Object.values(skin.attachments ?? {})) {
      attachments += Object.keys(slot).length;
    }
  }
  let timelines = 0;
  let keys = 0;
  for (const animation of file.animations ?? []) {
    timelines += (animation.timelines ?? []).length;
    for (const timeline of animation.timelines ?? []) keys += (timeline.keys ?? []).length;
  }
  return {
    bones: file.bones.length,
    slots: (file.slots ?? []).length,
    skins: (file.skins ?? []).length,
    attachments,
    constraints: (file.constraints ?? []).length,
    events: (file.events ?? []).length,
    animations: (file.animations ?? []).length,
    timelines,
    keys,
    bytes: jsonBytes(file),
  };
}

/** `true` when `folder` is inside one of `roots` (`capa` holds `capa/interna`). */
export function folderMatches(folder: string | undefined, roots: readonly string[]): boolean {
  if (folder === undefined) return roots.includes('');
  return roots.some((root) => root === folder || folder.startsWith(`${root}/`));
}

/** Every image name a `sequence` asks for (7.10). */
export function sequenceNames(base: string, sequence: SequenceDef): string[] {
  if (sequence.frames !== undefined && sequence.frames.length > 0) return [...sequence.frames];
  const count = sequence.count ?? 0;
  const start = sequence.start ?? 1;
  const digits = sequence.digits ?? 0;
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    names.push(base + String(start + i).padStart(digits, '0'));
  }
  return names;
}

/** Atlas region names one attachment asks for. Empty for shapes with no image. */
export function attachmentRegions(placeholder: string, attachment: AttachmentDef): string[] {
  if (attachment.type !== 'region' && attachment.type !== 'mesh' && attachment.type !== 'linkedmesh') {
    return [];
  }
  const base = attachment.path ?? placeholder;
  const sequence = attachment.sequence;
  if (sequence !== undefined) return sequenceNames(base, sequence);
  return [base];
}

/** Every region name the whole file still asks for, without repeats. */
export function usedRegionNames(file: BoneFile): string[] {
  const names = new Set<string>();
  for (const skin of file.skins ?? []) {
    for (const [, placeholders] of Object.entries(skin.attachments ?? {})) {
      for (const [placeholder, attachment] of Object.entries(placeholders)) {
        if (attachment === null) continue;
        for (const name of attachmentRegions(placeholder, attachment)) names.add(name);
      }
    }
  }
  return [...names];
}

// ---------------------------------------------------------------------------
// Draw order (spec 9.5)
// ---------------------------------------------------------------------------

/**
 * The draw order one key produces, as setup indices, exactly as spec 9.5
 * spells it out: place the cited slots, last one wins a collision, the loser
 * goes back to the queue, then fill the holes in setup order.
 *
 * Written here and not borrowed from the runtime because slicing has to run
 * the algorithm on the OLD slot list and again on the NEW one, and compare.
 */
export function applyDrawOrder(count: number, entries: ReadonlyArray<{ index: number; offset: number }>): number[] {
  const order = new Array<number>(count).fill(-1);
  const cited = new Array<boolean>(count).fill(false);
  for (const entry of entries) {
    if (entry.index < 0 || entry.index >= count) continue;
    let at = entry.index + entry.offset;
    if (at < 0) at = 0;
    if (at >= count) at = count - 1;
    const loser = order[at];
    if (loser !== -1) cited[loser] = false; // 9.5: the loser is un-cited.
    order[at] = entry.index;
    cited[entry.index] = true;
  }
  let next = 0;
  for (let i = 0; i < count; i++) {
    if (order[i] !== -1) continue;
    while (next < count && cited[next]) next++;
    order[i] = next;
    cited[next] = true;
    next++;
  }
  return order;
}

/**
 * Rewrites one `drawOrder` key for a shorter slot list.
 *
 * Offsets in 9.5 are relative to a slot's POSITION, so cutting a slot out of
 * the middle silently moves every key. This runs the old key over the old
 * list, throws away the slots that went, and writes the offsets that reproduce
 * the surviving order on the new list. It cites only the slots it has to, and
 * checks its own work by running 9.5 again; if the short citation does not
 * reproduce the order, it cites every slot instead.
 */
export function rebuildDrawOrderValue(
  value: readonly DrawOrderEntry[], oldSlots: readonly string[], newSlots: readonly string[],
): DrawOrderEntry[] {
  const oldIndex = new Map(oldSlots.map((name, at) => [name, at]));
  const newIndex = new Map(newSlots.map((name, at) => [name, at]));

  const entries: Array<{ index: number; offset: number }> = [];
  for (const entry of value) {
    const at = oldIndex.get(entry.slot);
    if (at === undefined) continue; // 9.5: an entry naming no slot is ignored.
    entries.push({ index: at, offset: entry.offset });
  }
  const wanted = applyDrawOrder(oldSlots.length, entries)
    .map((i) => oldSlots[i])
    .filter((name) => newIndex.has(name));

  const short: DrawOrderEntry[] = [];
  const all: DrawOrderEntry[] = [];
  for (let position = 0; position < wanted.length; position++) {
    const name = wanted[position];
    const setup = newIndex.get(name)!;
    const offset = position - setup;
    all.push({ slot: name, offset });
    if (offset !== 0) short.push({ slot: name, offset });
  }

  const produces = (cited: readonly DrawOrderEntry[]): boolean => {
    const order = applyDrawOrder(
      newSlots.length,
      cited.map((entry) => ({ index: newIndex.get(entry.slot)!, offset: entry.offset })),
    ).map((i) => newSlots[i]);
    return order.length === wanted.length && order.every((name, at) => name === wanted[at]);
  };

  if (produces(short)) return short;
  return all;
}

// ---------------------------------------------------------------------------
// Reading the references of one constraint
// ---------------------------------------------------------------------------

/** Bones a constraint WRITES to (6.2 to 6.6). Its result lands only here. */
export function constraintWrites(constraint: ConstraintDef): string[] {
  switch (constraint.type) {
    case 'ik':
    case 'transform':
    case 'path':
      return [...constraint.bones];
    case 'physics':
      return [constraint.bone];
    case 'driver':
      return (constraint.targets ?? [])
        .filter((target) => target.type === 'bone' && target.target !== undefined)
        .map((target) => target.target!);
    default:
      return [];
  }
}

/** Bones a constraint READS. A target bone is read, never written. */
export function constraintReads(constraint: ConstraintDef): string[] {
  switch (constraint.type) {
    case 'ik':
    case 'transform':
      return [constraint.target];
    default:
      return [];
  }
}

/** Slots a constraint READS. Only `path` has one: its target holds the curve. */
export function constraintSlots(constraint: ConstraintDef): string[] {
  return constraint.type === 'path' ? [constraint.target] : [];
}

/** Slots a `driver` writes into (8.2), so they cannot be cut under it. */
function driverSlots(constraint: ConstraintDef): string[] {
  if (constraint.type !== 'driver') return [];
  return (constraint.targets ?? [])
    .filter((target) => target.type === 'slot' && target.target !== undefined)
    .map((target) => target.target!);
}

/** Animations a `driver` plays (6.6). They have to survive with it. */
function driverAnimations(constraint: ConstraintDef): string[] {
  if (constraint.type !== 'driver' || constraint.animation === undefined) return [];
  return [constraint.animation];
}

// ---------------------------------------------------------------------------
// The slicer
// ---------------------------------------------------------------------------

/** Live sets, grown to a fixed point before anything is actually deleted. */
interface LiveSets {
  skins: Set<string>;
  animations: Set<string>;
  slots: Set<string>;
  bones: Set<string>;
  constraints: Set<string>;
}

/**
 * Cuts a `.bone` file down to the skins, animations and slot folders asked
 * for, and reports every single thing that left.
 *
 * Throws, with a message in Portuguese, when a name asked for is not in the
 * file — a typed skin name that silently produces an empty file is the worst
 * possible outcome of this command.
 */
export function sliceBoneFile(file: BoneFile, options: SliceOptions = {}): SliceResult {
  const before = countFile(file);
  const src = clone(file);
  const removed: RemovedItem[] = [];
  const note = (kind: RemovedKind, name: string, reason: string, value: unknown): void => {
    removed.push({ kind, name, reason, bytes: jsonBytes(value) });
  };

  const allBones = src.bones;
  const allSlots = src.slots ?? [];
  const allSkins = src.skins ?? [];
  const allConstraints = src.constraints ?? [];
  const allAnimations = src.animations ?? [];
  const allEvents = src.events ?? [];
  const allMorphs = src.morphs ?? [];

  const slotByName = new Map(allSlots.map((slot) => [slot.name, slot]));
  const skinByName = new Map(allSkins.map((skin) => [skin.name, skin]));
  const boneOrder = new Map(allBones.map((bone, at) => [bone.name, at]));

  // --- which skins survive (4.4: `default` and every `includes` come along) --
  const liveSkins = new Set<string>();
  if (options.skins === undefined) {
    for (const skin of allSkins) liveSkins.add(skin.name);
  } else {
    const walk = (name: string): void => {
      if (liveSkins.has(name)) return;
      const skin = skinByName.get(name);
      if (skin === undefined) throw new Error(`não achei a pele "${name}" no arquivo`);
      liveSkins.add(name);
      for (const included of skin.includes ?? []) walk(included);
    };
    if (skinByName.has('default')) walk('default');
    for (const name of options.skins) walk(name);
  }

  // --- which animations survive ---------------------------------------------
  const animationNames = new Set(allAnimations.map((animation) => animation.name));
  const liveAnimations = new Set<string>();
  const animationsKeptForDrivers: string[] = [];
  if (options.animations === undefined) {
    for (const name of animationNames) liveAnimations.add(name);
  } else {
    for (const name of options.animations) {
      if (!animationNames.has(name)) throw new Error(`não achei a animação "${name}" no arquivo; há: ${[...animationNames].join(', ') || 'nenhuma'}`);
      liveAnimations.add(name);
    }
    // 6.6: a `driver` in continuous mode PLAYS an animation. Cutting it would
    // change the pose of every bone that driver moves, so it comes along.
    for (const constraint of allConstraints) {
      for (const name of driverAnimations(constraint)) {
        if (!animationNames.has(name) || liveAnimations.has(name)) continue;
        liveAnimations.add(name);
        animationsKeptForDrivers.push(name);
      }
    }
  }

  // --- which slots survive (folder filter; may grow below) ------------------
  const liveSlots = new Set<string>();
  for (const slot of allSlots) {
    if (options.folders === undefined || folderMatches(slot.folder, options.folders)) {
      liveSlots.add(slot.name);
    }
  }
  if (options.folders !== undefined && liveSlots.size === 0) {
    throw new Error(`nenhum slot está na pasta ${options.folders.map((f) => `"${f}"`).join(' ou ')}`);
  }
  const slotsKeptForConstraints: string[] = [];

  // --- a constraint only runs when an active skin switches it on (7.1) ------
  const skinSwitchedOn = new Set<string>();
  for (const skin of allSkins) {
    if (!liveSkins.has(skin.name)) continue;
    for (const name of skin.constraints ?? []) skinSwitchedOn.add(name);
  }
  const activatable = (constraint: ConstraintDef): boolean =>
    constraint.skinRequired !== true || skinSwitchedOn.has(constraint.name);

  // --- the fixed point ------------------------------------------------------
  const live: LiveSets = {
    skins: liveSkins,
    animations: liveAnimations,
    slots: liveSlots,
    bones: new Set<string>(),
    constraints: new Set<string>(),
  };

  /** Every attachment that is still in the file, given the live sets. */
  const liveAttachmentList = (): Array<{ slot: string; placeholder: string; attachment: AttachmentDef }> => {
    const out2: Array<{ slot: string; placeholder: string; attachment: AttachmentDef }> = [];
    for (const skin of allSkins) {
      if (!live.skins.has(skin.name)) continue;
      for (const [slot, placeholders] of Object.entries(skin.attachments ?? {})) {
        if (!live.slots.has(slot)) continue;
        for (const [placeholder, attachment] of Object.entries(placeholders)) {
          if (attachment !== null) out2.push({ slot, placeholder, attachment });
        }
      }
    }
    return out2;
  };

  /** Adds a bone and every ancestor of it: a child cannot be posed without them. */
  const addBoneWithAncestors = (name: string | undefined): boolean => {
    let added = false;
    let at = name;
    for (let guard = 0; guard < allBones.length + 1 && at !== undefined; guard++) {
      if (live.bones.has(at)) break;
      const index = boneOrder.get(at);
      if (index === undefined) break;
      live.bones.add(at);
      added = true;
      at = allBones[index].parent;
    }
    return added;
  };

  for (let round = 0; round < 64; round++) {
    let changed = false;

    // Bones something surviving READS. Nothing else can move a pose.
    if (addBoneWithAncestors(allBones[0]?.name)) changed = true;
    for (const slot of allSlots) {
      if (live.slots.has(slot.name) && addBoneWithAncestors(slot.bone)) changed = true;
    }
    for (const { attachment } of liveAttachmentList()) {
      const binding = (attachment as { binding?: BindingDef }).binding;
      for (const index of binding?.bones ?? []) {
        if (addBoneWithAncestors(allBones[index]?.name)) changed = true;
      }
    }
    for (const animation of allAnimations) {
      if (!live.animations.has(animation.name)) continue;
      for (const timeline of animation.timelines ?? []) {
        if (timeline.type === 'bone' && addBoneWithAncestors(timeline.target)) changed = true;
      }
    }
    for (const parameter of src.parameters ?? []) {
      if (addBoneWithAncestors(parameter.source?.bone)) changed = true;
    }

    // A constraint stays when a bone it WRITES to is still read, when a slot
    // or another target it writes to is still there, or when it plays a live
    // animation. Otherwise its whole result falls on the floor.
    for (const constraint of allConstraints) {
      if (live.constraints.has(constraint.name) || !activatable(constraint)) continue;
      const writesLiveBone = constraintWrites(constraint).some((bone) => live.bones.has(bone));
      const writesLiveSlot = driverSlots(constraint).some((slot) => live.slots.has(slot));
      const playsLiveAnimation = driverAnimations(constraint).some((name) => live.animations.has(name));
      const drivesSomethingElse = constraint.type === 'driver'
        && (constraint.targets ?? []).some((target) => target.type !== 'bone' && target.type !== 'slot');
      if (!writesLiveBone && !writesLiveSlot && !playsLiveAnimation && !drivesSomethingElse) continue;
      live.constraints.add(constraint.name);
      changed = true;
    }

    // A live constraint drags in everything it reads.
    for (const constraint of allConstraints) {
      if (!live.constraints.has(constraint.name)) continue;
      for (const bone of [...constraintWrites(constraint), ...constraintReads(constraint)]) {
        if (addBoneWithAncestors(bone)) changed = true;
      }
      for (const slot of [...constraintSlots(constraint), ...driverSlots(constraint)]) {
        if (live.slots.has(slot) || !slotByName.has(slot)) continue;
        live.slots.add(slot);
        slotsKeptForConstraints.push(slot);
        changed = true;
      }
    }

    if (!changed) break;
  }

  if (options.dropUnusedBones === false) {
    for (const bone of allBones) live.bones.add(bone.name);
  }
  if (options.dropUnusedConstraints === false) {
    for (const constraint of allConstraints) live.constraints.add(constraint.name);
  }

  // -------------------------------------------------------------------------
  // From live sets to a file
  // -------------------------------------------------------------------------

  const out: BoneFile = { ...src };
  if (options.generator !== undefined) out.bone = { ...src.bone, generator: options.generator };

  // --- bones ----------------------------------------------------------------
  const newBones = allBones.filter((bone) => live.bones.has(bone.name));
  for (const bone of allBones) {
    if (live.bones.has(bone.name)) continue;
    note('bone', bone.name, 'nada que sobrou lê este osso', bone);
  }
  const boneIndex = new Map(newBones.map((bone, at) => [bone.name, at]));
  const remapBinding = (binding: BindingDef | undefined): void => {
    if (binding === undefined) return;
    binding.bones = binding.bones.map((old) => boneIndex.get(allBones[old]?.name ?? '') ?? 0);
  };
  out.bones = newBones;

  // --- slots ----------------------------------------------------------------
  const newSlots = allSlots.filter((slot) => live.slots.has(slot.name));
  for (const slot of allSlots) {
    if (live.slots.has(slot.name)) continue;
    const where = slot.folder === undefined ? '' : ` ("${slot.folder}")`;
    note('slot', slot.name, `o slot está fora da pasta pedida${where}`, slot);
  }
  const newSlotNames = newSlots.map((slot) => slot.name);
  const oldSlotNames = allSlots.map((slot) => slot.name);
  const slotsChanged = newSlotNames.length !== oldSlotNames.length;
  if (src.slots !== undefined) out.slots = newSlots;

  // --- skins and attachments ------------------------------------------------
  const newSkins: SkinDef[] = [];
  for (const skin of allSkins) {
    if (!live.skins.has(skin.name)) {
      let count = 0;
      for (const placeholders of Object.values(skin.attachments ?? {})) count += Object.keys(placeholders).length;
      note('skin', skin.name, `a pele não foi pedida; levou ${count} desenho(s) junto`, skin);
      continue;
    }
    const copy: SkinDef = { ...skin };
    if (skin.includes !== undefined) copy.includes = skin.includes.filter((name) => live.skins.has(name));
    if (skin.bones !== undefined) copy.bones = skin.bones.filter((name) => live.bones.has(name));
    if (skin.constraints !== undefined) copy.constraints = skin.constraints.filter((name) => live.constraints.has(name));
    if (skin.attachments !== undefined) {
      const attachments: Record<string, Record<string, AttachmentDef | null>> = {};
      for (const [slot, placeholders] of Object.entries(skin.attachments)) {
        if (!live.slots.has(slot)) {
          for (const [placeholder, attachment] of Object.entries(placeholders)) {
            note('attachment', `${skin.name} / ${slot} / ${placeholder}`, 'o slot dele saiu do arquivo', attachment);
          }
          continue;
        }
        attachments[slot] = { ...placeholders };
      }
      copy.attachments = attachments;
    }
    newSkins.push(copy);
  }
  if (src.skins !== undefined) out.skins = newSkins;

  /** `true` when some live skin gives this slot this placeholder. */
  const placeholderExists = (slot: string, placeholder: string, skinName?: string): boolean => {
    for (const skin of newSkins) {
      if (skinName !== undefined && skin.name !== skinName) continue;
      const found = skin.attachments?.[slot]?.[placeholder];
      if (found !== undefined && found !== null) return true;
    }
    return false;
  };

  // 7.5: a `linkedmesh` borrows its geometry from another placeholder. Without
  // that placeholder it has no vertices at all, so it goes.
  for (const skin of newSkins) {
    for (const [slot, placeholders] of Object.entries(skin.attachments ?? {})) {
      for (const [placeholder, attachment] of Object.entries(placeholders)) {
        if (attachment === null || attachment.type !== 'linkedmesh') continue;
        if (placeholderExists(slot, attachment.parent, attachment.skin)) continue;
        note('attachment', `${skin.name} / ${slot} / ${placeholder}`,
          `a malha "${attachment.parent}" que ele copiava saiu do arquivo`, attachment);
        delete placeholders[placeholder];
      }
    }
  }

  // Weights address bones by position (4.7), and positions just changed.
  for (const skin of newSkins) {
    for (const placeholders of Object.values(skin.attachments ?? {})) {
      for (const attachment of Object.values(placeholders)) {
        if (attachment === null) continue;
        remapBinding((attachment as { binding?: BindingDef }).binding);
      }
    }
  }

  // A `clipping` range names slots (7.7). Names that went away are pruned, and
  // an `end` that went away falls back to the last surviving slot before it.
  for (const skin of newSkins) {
    for (const [slot, placeholders] of Object.entries(skin.attachments ?? {})) {
      for (const [placeholder, attachment] of Object.entries(placeholders)) {
        if (attachment === null || attachment.type !== 'clipping') continue;
        const clipping = attachment as ClippingAttachmentDef;
        if (clipping.slots !== undefined) {
          const gone = clipping.slots.filter((name) => !live.slots.has(name));
          if (gone.length > 0) {
            note('reference', `${skin.name} / ${slot} / ${placeholder} / slots`,
              'nomes de slot que saíram do arquivo', gone);
          }
          clipping.slots = clipping.slots.filter((name) => live.slots.has(name));
        }
        if (clipping.end !== undefined && !live.slots.has(clipping.end)) {
          const at = oldSlotNames.indexOf(clipping.end);
          let replacement: string | undefined;
          for (let i = at; i >= 0; i--) {
            if (live.slots.has(oldSlotNames[i])) { replacement = oldSlotNames[i]; break; }
          }
          note('reference', `${skin.name} / ${slot} / ${placeholder} / end`,
            replacement === undefined
              ? `o slot "${clipping.end}" saiu; o recorte agora vai até o fim`
              : `o slot "${clipping.end}" saiu; o recorte agora termina em "${replacement}"`,
            clipping.end);
          if (replacement === undefined) delete clipping.end;
          else clipping.end = replacement;
        }
      }
    }
  }

  // --- morphs ---------------------------------------------------------------
  const newMorphs = [];
  for (const morph of allMorphs) {
    const kept = morph.targets.filter((target) =>
      live.slots.has(target.slot)
      && (target.skin === undefined || live.skins.has(target.skin))
      && placeholderExists(target.slot, target.attachment, target.skin));
    if (kept.length === 0) {
      note('morph', morph.name, 'todos os desenhos que ele deformava saíram', morph);
      continue;
    }
    for (const target of morph.targets) {
      if (kept.includes(target)) continue;
      note('reference', `${morph.name} / ${target.slot} / ${target.attachment}`,
        'o desenho que ele deformava saiu do arquivo', target);
    }
    newMorphs.push({ ...morph, targets: kept });
  }
  const liveMorphNames = new Set(newMorphs.map((morph) => morph.name));
  if (src.morphs !== undefined) out.morphs = newMorphs;

  // --- constraints ----------------------------------------------------------
  const newConstraints = allConstraints.filter((constraint) => live.constraints.has(constraint.name));
  for (const constraint of allConstraints) {
    if (live.constraints.has(constraint.name)) continue;
    const reason = activatable(constraint)
      ? 'nenhum osso que ela move é lido por algo que sobrou'
      : 'nenhuma pele que sobrou liga esta regra';
    note('constraint', constraint.name, reason, constraint);
  }
  for (const constraint of newConstraints) {
    if (constraint.type !== 'driver' || constraint.targets === undefined) continue;
    const kept = constraint.targets.filter((target) => {
      if (target.target === undefined) return true;
      if (target.type === 'bone') return live.bones.has(target.target);
      if (target.type === 'slot' || target.type === 'nested' || target.type === 'deform') {
        return live.slots.has(target.target);
      }
      if (target.type === 'constraint') return live.constraints.has(target.target);
      if (target.type === 'morph') return liveMorphNames.has(target.target);
      return true;
    });
    if (kept.length !== constraint.targets.length) {
      for (const target of constraint.targets) {
        if (kept.includes(target)) continue;
        note('reference', `${constraint.name} / ${target.type} ${target.target ?? ''}`.trim(),
          'o alvo do driver saiu do arquivo', target);
      }
      constraint.targets = kept;
    }
  }
  if (src.constraints !== undefined) out.constraints = newConstraints;

  // --- animations and their timelines ---------------------------------------
  const firedEvents = new Set<string>();
  const newAnimations = [];
  for (const animation of allAnimations) {
    if (!live.animations.has(animation.name)) {
      note('animation', animation.name,
        `a animação não foi pedida; levou ${(animation.timelines ?? []).length} trilha(s) junto`, animation);
      continue;
    }
    const timelines: TimelineDef[] = [];
    for (const timeline of animation.timelines ?? []) {
      const verdict = timelineVerdict(timeline, live, liveMorphNames, placeholderExists);
      if (verdict !== null) {
        note('timeline', `${animation.name} / ${timeline.type} ${timeline.target ?? ''}`.trim(), verdict, timeline);
        continue;
      }
      const copy = { ...timeline } as TimelineDef;
      if (timeline.type === 'drawOrder' && slotsChanged) {
        copy.keys = timeline.keys.map((key: KeyDef) => ({
          ...key,
          value: rebuildDrawOrderValue((key.value ?? []) as DrawOrderEntry[], oldSlotNames, newSlotNames),
        }));
      }
      timelines.push(copy);
      if (timeline.type === 'event') {
        for (const key of timeline.keys) {
          if (key.event !== undefined) firedEvents.add(key.event);
        }
      }
    }
    newAnimations.push({ ...animation, timelines });
  }
  if (src.animations !== undefined) out.animations = newAnimations;

  // --- events (9.7: an event only reaches the game through a key) -----------
  const dropEvents = options.dropUnusedEvents !== false;
  const newEvents = allEvents.filter((event) => !dropEvents || firedEvents.has(event.name));
  for (const event of allEvents) {
    if (newEvents.includes(event)) continue;
    note('event', event.name, 'nenhuma animação que sobrou dispara este evento', event);
  }
  if (src.events !== undefined) out.events = newEvents;

  const after = countFile(out);
  return {
    file: out,
    removed,
    before,
    after,
    skins: newSkins.map((skin) => skin.name),
    animations: newAnimations.map((animation) => animation.name),
    regions: usedRegionNames(out),
    slotsKeptForConstraints,
    animationsKeptForDrivers,
  };
}

/**
 * Why this timeline cannot stay, or `null` when it can.
 *
 * A timeline whose target left the file would be a dangling reference (4.7),
 * and a dangling reference makes the file invalid at level L1.
 */
function timelineVerdict(
  timeline: TimelineDef, live: LiveSets, morphs: ReadonlySet<string>,
  placeholderExists: (slot: string, placeholder: string, skin?: string) => boolean,
): string | null {
  switch (timeline.type) {
    case 'bone':
      return live.bones.has(timeline.target) ? null : `o osso "${timeline.target}" saiu do arquivo`;
    case 'slot':
      return live.slots.has(timeline.target) ? null : `o slot "${timeline.target}" saiu do arquivo`;
    case 'nested':
      return live.slots.has(timeline.target) ? null : `o slot "${timeline.target}" saiu do arquivo`;
    case 'deform':
    case 'sequence':
      if (!live.slots.has(timeline.target)) return `o slot "${timeline.target}" saiu do arquivo`;
      if (timeline.skin !== undefined && !live.skins.has(timeline.skin)) {
        return `a pele "${timeline.skin}" saiu do arquivo`;
      }
      return placeholderExists(timeline.target, timeline.attachment, timeline.skin)
        ? null
        : `o desenho "${timeline.attachment}" saiu do arquivo`;
    case 'constraint':
      return live.constraints.has(timeline.target) ? null : `a regra "${timeline.target}" saiu do arquivo`;
    case 'morph':
      return morphs.has(timeline.target) ? null : `o morph "${timeline.target}" saiu do arquivo`;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// The atlas (spec 10)
// ---------------------------------------------------------------------------

/** One decoded atlas page: RGBA8, straight alpha, top-down. */
export interface PageImage {
  /** `page.name`, not the file name. */
  name: string;
  width: number;
  height: number;
  pixels: Uint8Array;
}

export interface AtlasSliceReport {
  /** Regions that stayed, in atlas order. */
  readonly kept: readonly string[];
  /** Regions that went, in atlas order. */
  readonly dropped: readonly string[];
  /** Region names the skeleton asks for and the atlas does not have (10.5). */
  readonly missing: readonly string[];
}

/** `true` when this region answers to one of the names the skeleton asks for. */
function regionAnswers(region: AtlasRegion, used: ReadonlySet<string>): boolean {
  if (used.has(region.name)) return true;
  return (region.aliases ?? []).some((alias) => used.has(alias));
}

/**
 * The same atlas with only the regions the skeleton still asks for. Pages are
 * left alone: this is the cheap cut, for when the pixels must not move.
 */
export function sliceAtlasRegions(atlas: AtlasFile, used: ReadonlySet<string>): {
  atlas: AtlasFile; report: AtlasSliceReport;
} {
  const kept: AtlasRegion[] = [];
  const dropped: string[] = [];
  for (const region of atlas.regions) {
    if (regionAnswers(region, used)) kept.push(region);
    else dropped.push(region.name);
  }
  const answered = new Set<string>();
  for (const region of kept) {
    answered.add(region.name);
    for (const alias of region.aliases ?? []) answered.add(alias);
  }
  const missing = [...used].filter((name) => !answered.has(name));
  return {
    atlas: { ...atlas, regions: kept },
    report: { kept: kept.map((region) => region.name), dropped, missing },
  };
}

/**
 * Cuts one region out of its page and puts it back into an image the size of
 * the ORIGINAL art (10.3), with the transparent border the packer had trimmed
 * put back around it.
 *
 * Why the border goes back: `originalWidth`, `originalHeight`, `offsetX` and
 * `offsetY` are what 10.4 turns into UVs, so a region that is re-packed from
 * its original frame lands on exactly the same pixels of the drawing, however
 * the new packer decides to trim and rotate it. Feed the bare crop instead and
 * every attachment shifts by the size of the border.
 */
export function regionToImage(region: AtlasRegion, page: PageImage): PageImage {
  const originalWidth = region.originalWidth ?? region.width;
  const originalHeight = region.originalHeight ?? region.height;
  const offsetX = region.offsetX ?? 0;
  const offsetY = region.offsetY ?? 0;
  const top = originalHeight - offsetY - region.height;
  const pixels = new Uint8Array(originalWidth * originalHeight * 4);

  for (let sy = 0; sy < region.height; sy++) {
    for (let sx = 0; sx < region.width; sx++) {
      // 10.3: a rotated crop was turned 90° clockwise on the way in, so the
      // source pixel (sx, sy) sits at (x + height - 1 - sy, y + sx).
      const px = region.rotation === 90 ? region.x + region.height - 1 - sy : region.x + sx;
      const py = region.rotation === 90 ? region.y + sx : region.y + sy;
      if (px < 0 || py < 0 || px >= page.width || py >= page.height) continue;
      const dx = offsetX + sx;
      const dy = top + sy;
      if (dx < 0 || dy < 0 || dx >= originalWidth || dy >= originalHeight) continue;
      const from = (py * page.width + px) * 4;
      const to = (dy * originalWidth + dx) * 4;
      pixels[to] = page.pixels[from];
      pixels[to + 1] = page.pixels[from + 1];
      pixels[to + 2] = page.pixels[from + 2];
      pixels[to + 3] = page.pixels[from + 3];
    }
  }
  return { name: region.name, width: originalWidth, height: originalHeight, pixels };
}

export interface RepackResult {
  /** The atlas file of 10.2, ready to be written next to the pages. */
  readonly atlas: AtlasJson;
  /** The new pages, pixels included. */
  readonly pages: readonly PackedPage[];
  readonly report: AtlasSliceReport;
  /** Page pixels before and after, so the shrink can be stated in numbers. */
  readonly pixelsBefore: number;
  readonly pixelsAfter: number;
}

/**
 * Re-packs an atlas with only the regions the sliced skeleton still asks for.
 *
 * The packer is the very same `packAtlas` the command line and the editor use
 * (requirement E2), so a page packed here and a page packed there are the same
 * bytes. Aliases are preserved by handing the packer one image per region and
 * letting it fold identical ones back together.
 */
export function repackAtlas(
  atlas: AtlasFile, pages: readonly PageImage[], used: ReadonlySet<string>,
  options: PackOptions = {},
): RepackResult {
  const { report } = sliceAtlasRegions(atlas, used);
  const kept = new Set(report.kept);
  const pageByName = new Map(pages.map((page) => [page.name, page]));

  const items: PackerItem[] = [];
  for (const region of atlas.regions) {
    if (!kept.has(region.name)) continue;
    const page = pageByName.get(atlas.pages[region.page]?.name ?? '');
    if (page === undefined) continue;
    const image = regionToImage(region, page);
    items.push({
      name: region.name, width: image.width, height: image.height, pixels: image.pixels,
      // The pivot is measured on the original frame, which is what
      // `regionToImage` hands back, so it goes through untouched (10.3).
      ...(region.pivotX !== undefined ? { pivotX: region.pivotX } : {}),
      ...(region.pivotY !== undefined ? { pivotY: region.pivotY } : {}),
    });
  }

  const packed = packAtlas(items, {
    padding: 2,
    generator: 'Recorte fatiador 0.1.0',
    ...options,
  });

  // Aliases are a property of the source art, not of the packing, so a region
  // that answered to two names before still answers to both.
  const aliasesOf = new Map<string, string[]>();
  for (const region of atlas.regions) {
    if (region.aliases !== undefined && region.aliases.length > 0) aliasesOf.set(region.name, region.aliases);
  }
  for (const region of packed.atlas.regions) {
    const extra = (aliasesOf.get(region.name) ?? []).filter((alias) => used.has(alias));
    if (extra.length === 0) continue;
    region.aliases = [...new Set([...(region.aliases ?? []), ...extra])];
  }

  let pixelsBefore = 0;
  for (const page of atlas.pages) pixelsBefore += page.width * page.height;
  let pixelsAfter = 0;
  for (const page of packed.pages) pixelsAfter += page.width * page.height;

  return { atlas: packed.atlas, pages: packed.pages, report, pixelsBefore, pixelsAfter };
}

// ---------------------------------------------------------------------------
// Saying how much smaller it got
// ---------------------------------------------------------------------------

export interface ShrinkReport {
  readonly before: number;
  readonly after: number;
  /** Positive when it got smaller. */
  readonly saved: number;
  /** `0` to `1`. Positive when it got smaller. */
  readonly fraction: number;
}

export function shrink(before: number, after: number): ShrinkReport {
  return {
    before,
    after,
    saved: before - after,
    fraction: before === 0 ? 0 : (before - after) / before,
  };
}

/** `28.467` — thousands separated the way Portuguese writes them. */
export function formatNumber(value: number): string {
  return Math.round(value).toLocaleString('pt-BR');
}

/** `37,5%`, with the comma Portuguese uses. */
export function formatPercent(fraction: number): string {
  return `${(fraction * 100).toFixed(1).replace('.', ',')}%`;
}

/** `28.467 bytes` or, when it is big, `27,8 kB`. Always the exact bytes too. */
export function formatBytes(bytes: number): string {
  if (Math.abs(bytes) < 1024) return `${formatNumber(bytes)} bytes`;
  const kb = (bytes / 1024).toFixed(1).replace('.', ',');
  return `${formatNumber(bytes)} bytes (${kb} kB)`;
}

/**
 * The removals grouped by kind, biggest group first, for a summary that has to
 * fit on one screen. Each line is `kind, how many, how many bytes`.
 */
export function groupRemoved(removed: readonly RemovedItem[]): Array<{
  kind: RemovedKind; label: string; count: number; bytes: number;
}> {
  const groups = new Map<RemovedKind, { count: number; bytes: number }>();
  for (const item of removed) {
    const found = groups.get(item.kind) ?? { count: 0, bytes: 0 };
    found.count += 1;
    found.bytes += item.bytes;
    groups.set(item.kind, found);
  }
  return [...groups.entries()]
    .map(([kind, value]) => ({ kind, label: KIND_LABELS[kind], ...value }))
    .sort((a, b) => b.bytes - a.bytes || a.label.localeCompare(b.label, 'pt-BR'));
}
