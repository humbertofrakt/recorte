/**
 * Compensation — requirement R7, the half that lets a rig be fixed without
 * destroying the pose.
 *
 * THE WHOLE MATHS, IN FOUR LINES
 *
 * Call `B` the world matrix of the bone before the edit and `B'` the world
 * matrix after it. Everything that hangs off that bone — a child bone, a
 * drawing, a collision box, one influence of a weighted vertex — is stored as a
 * point or a matrix `p` in the bone's LOCAL space, and lands on screen at
 * `B · p`. After the edit the same `p` would land at `B' · p`, which is the
 * jump the artist is complaining about.
 *
 * Define the FIX MATRIX
 *
 *     F = B'⁻¹ · B
 *
 * and replace every local `p` by `F · p`. The new world position is
 *
 *     B' · (F · p) = B' · B'⁻¹ · B · p = B · p
 *
 * which is the OLD one, exactly — not approximately, and with no iteration.
 * One matrix per edited bone answers all three checkboxes at once, because all
 * three hold things written in that bone's local space.
 *
 * WHAT EACH SWITCH DOES WITH `F`
 *   "Não mexer nos filhos"   a child's local pose `L` becomes `F · L`, then is
 *                            decomposed back into `x, y, rotation, scaleX,
 *                            scaleY, shearY` by `localFromWorld`.
 *   "Não mexer nos desenhos" a region or point transform `A` becomes `F · A`;
 *                            an unweighted vertex `v` becomes `F · v`; a
 *                            weighted vertex has ONLY the influences that name
 *                            this bone moved, which is exact because the world
 *                            sum `Σ wᵢ (Bᵢ · pᵢ)` keeps every other term.
 *   "Não mexer nas caixas"   the same as drawings, on `boundingbox`, `clipping`
 *                            and `path`.
 *
 * WHERE IT IS EXACT AND WHERE IT IS NOT
 * Child bones and every vertex-based attachment: exact, always. A `region` or
 * `point` transform is exact whenever `F` has no shear — that is, for every
 * move, every rotation and every uniform scale. A NON-uniform scale of a bone
 * shears its drawings, and a region attachment has no field for shear, so what
 * is written back is the closest transform the format can hold. That is the
 * format's limit, not a shortcut, and it is the same limit Spine has.
 */

import type {
  AttachmentDef, BoneFile, Matrix2x3,
} from '../../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../../contract.js';
import { boneFrame, parentFrame, writeBoneValues, type BoneKey } from './select.js';
import { getCompensation, type CompensationFlags } from './space.js';
import { fixAttachment, fixMatrix, isIdentityFix, localFromWorld } from '../../doc/world-math.js';

// ---------------------------------------------------------------------------
// Poses, matrices, and moving one attachment by the fix matrix
// ---------------------------------------------------------------------------

// Moram em `doc/world-math.ts` desde o lote A4: o `doc/reparent.ts` usa a
// mesma conta, e a base não importa a cena. Os nomes continuam saindo daqui.
export { decomposeTrs, fixAttachment, fixMatrix, fixPoint, isIdentityFix, localFromWorld } from '../../doc/world-math.js';
export type { LocalPose, Trs } from '../../doc/world-math.js';

// ---------------------------------------------------------------------------
// Reading the file
// ---------------------------------------------------------------------------

/** JSON deep copy. The file only ever holds JSON values, so this is exact. */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/**
 * Names of the bones whose parent is `name` AND whose inheritance is the plain
 * `normal` one of spec 5.3.
 *
 * The other four modes build their world matrix from a doctored parent matrix,
 * so `P⁻¹ · M` is not the local part and `localFromWorld` would answer a pose
 * that does not reproduce the world. A bone that says "do not inherit my
 * parent's rotation" mostly does not need compensating anyway — that is what it
 * asked for. Such a bone is left alone instead of being moved wrongly.
 */
export function childBonesOf(file: BoneFile, name: string): string[] {
  return (file.bones ?? [])
    .filter((bone) => bone.parent === name
      && bone.inheritRotation !== false
      && bone.inheritScale !== false
      && bone.inheritReflection !== false)
    .map((bone) => bone.name);
}

/** Index of a bone in the file, which is the index a weight binding uses. */
export function boneIndexOf(file: BoneFile, name: string): number {
  return (file.bones ?? []).findIndex((bone) => bone.name === name);
}

/** Attachment kinds each checkbox is responsible for. */
const DRAWING_TYPES = new Set(['region', 'mesh', 'linkedmesh', 'point']);
const BOX_TYPES = new Set(['boundingbox', 'clipping', 'path']);

/** Where one attachment lives inside the file. */
export interface AttachmentAddress {
  skin: number;
  slot: string;
  attachment: string;
}

/**
 * Every attachment bound to `bone` that one of the switches asks for.
 *
 * A slot names one bone (spec 4.3), so the attachments of that slot are written
 * in that bone's space — which is the space `F` acts on. A weighted mesh may
 * ALSO be pulled by bones far away in the tree; those are handled per influence
 * inside `fixAttachment`, so a mesh is listed once, under the bone that carries
 * its slot, and once under every other edited bone that weighs on it.
 */
export function attachmentsToFix(
  file: BoneFile, bone: string, flags: CompensationFlags,
): AttachmentAddress[] {
  const found: AttachmentAddress[] = [];
  if (!flags.drawings && !flags.boxes) return found;
  const index = boneIndexOf(file, bone);
  const slotsOfBone = new Set((file.slots ?? []).filter((slot) => slot.bone === bone)
    .map((slot) => slot.name));

  const skins = file.skins ?? [];
  for (let s = 0; s < skins.length; s++) {
    const table = skins[s]?.attachments;
    if (table === undefined) continue;
    for (const [slot, entries] of Object.entries(table)) {
      for (const [name, def] of Object.entries(entries ?? {})) {
        const type = (def as { type?: string }).type ?? 'region';
        const wanted = (flags.drawings && DRAWING_TYPES.has(type))
          || (flags.boxes && BOX_TYPES.has(type));
        if (!wanted) continue;
        const binding = (def as { binding?: { bones?: number[] } }).binding;
        const weighted = Array.isArray(binding?.bones) && binding.bones.includes(index);
        if (!slotsOfBone.has(slot) && !weighted) continue;
        found.push({ skin: s, slot, attachment: name });
      }
    }
  }
  return found;
}

/** The attachment object at an address, or `null`. */
export function attachmentAt(file: BoneFile, at: AttachmentAddress): AttachmentDef | null {
  const entries = (file.skins ?? [])[at.skin]?.attachments?.[at.slot];
  return (entries?.[at.attachment] as AttachmentDef | undefined) ?? null;
}

// ---------------------------------------------------------------------------
// The command that writes the attachments
// ---------------------------------------------------------------------------

/**
 * Replaces whole attachment objects, and puts the originals back on undo.
 *
 * Whole objects and not single fields: a compensation touches `x`, `y`,
 * `rotation`, both scales and a vertex array at once, and counting those by
 * hand would be wrong sooner or later. Two commands of the same drag merge, so
 * a drag across fifty mouse moves is one entry in the undo menu.
 */
export class SetAttachments implements Command {
  readonly kind: ChangeKind = 'structure';

  constructor(
    readonly label: string,
    private readonly writes: ReadonlyArray<{ at: AttachmentAddress; def: AttachmentDef }>,
    readonly mergeKey: string,
    private saved: Array<{ at: AttachmentAddress; def: AttachmentDef | null }> | null = null,
  ) {}

  apply(doc: EditorDoc): void {
    if (this.saved === null) {
      this.saved = this.writes.map((write) => ({
        at: write.at,
        def: clone(attachmentAt(doc.file, write.at)),
      }));
    }
    for (const write of this.writes) this.put(doc.file, write.at, clone(write.def));
  }

  revert(doc: EditorDoc): void {
    for (const entry of this.saved ?? []) this.put(doc.file, entry.at, clone(entry.def));
  }

  mergeWith(previous: Command): boolean {
    if (!(previous instanceof SetAttachments)) return false;
    if (previous.mergeKey !== this.mergeKey) return false;
    this.saved = previous.saved;
    return true;
  }

  private put(file: BoneFile, at: AttachmentAddress, def: AttachmentDef | null): void {
    const entries = (file.skins ?? [])[at.skin]?.attachments?.[at.slot];
    if (entries === undefined) return;
    if (def === null) delete entries[at.attachment];
    else entries[at.attachment] = def;
  }
}

// ---------------------------------------------------------------------------
// The snapshot a drag takes, and the write it produces
// ---------------------------------------------------------------------------

/** What one edited bone looked like before the drag started. */
interface BoneSnapshot {
  readonly name: string;
  /** The bone's world matrix at the start of the drag: `B`. */
  readonly world: Matrix2x3;
  /** Child bones to hold still, with their world matrix at the start. */
  readonly children: ReadonlyArray<{ name: string; world: Matrix2x3 }>;
  /** Attachments to hold still, with the definition they started with. */
  readonly attachments: ReadonlyArray<{
    at: AttachmentAddress; def: AttachmentDef; ownSlot: boolean; boneIndex: number;
  }>;
}

/** Everything the compensation needs, taken once when the pointer goes down. */
export interface CompensationPlan {
  readonly flags: CompensationFlags;
  readonly bones: readonly BoneSnapshot[];
  /** Bones the drag itself writes, which must never be compensated as children. */
  readonly edited: ReadonlySet<string>;
}

/** An empty plan, for a drag with every switch off. */
export const NO_COMPENSATION: CompensationPlan = Object.freeze({
  flags: Object.freeze({ children: false, drawings: false, boxes: false }),
  bones: Object.freeze([]),
  edited: new Set<string>(),
});

/**
 * Takes the snapshot a drag will compensate against.
 *
 * Call it in `onDown`, once. Every mouse move then rebuilds the compensation
 * FROM THIS SNAPSHOT, never from the previous move — a chain of relative fixes
 * would drift, and the whole point is that the drawing does not move at all.
 */
export function planCompensation(
  doc: EditorDoc, boneNames: readonly string[], flags = getCompensation(),
): CompensationPlan {
  const skeleton = doc.skeleton;
  if (skeleton === null || boneNames.length === 0) return NO_COMPENSATION;
  if (!flags.children && !flags.drawings && !flags.boxes) return NO_COMPENSATION;

  const edited = new Set(boneNames);
  // Attachments are structural, and there is no timeline that could carry a
  // region's `x`. With an animation open only the child bones are compensated,
  // because those DO have timelines.
  const assembly = doc.animation === null;
  const bones: BoneSnapshot[] = [];

  for (const name of boneNames) {
    const children = !flags.children ? [] : childBonesOf(doc.file, name)
      .filter((child) => !edited.has(child))
      .map((child) => ({ name: child, world: boneFrame(skeleton, child) }));

    const attachments = !assembly ? [] : attachmentsToFix(doc.file, name, flags).map((at) => {
      const def = attachmentAt(doc.file, at);
      const slotBone = (doc.file.slots ?? []).find((slot) => slot.name === at.slot)?.bone;
      return def === null ? null : {
        at,
        def: clone(def),
        ownSlot: slotBone === name,
        boneIndex: boneIndexOf(doc.file, name),
      };
    }).filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    if (children.length === 0 && attachments.length === 0) continue;
    bones.push({ name, world: boneFrame(skeleton, name), children, attachments });
  }
  return { flags, bones, edited };
}

/** How many things one call to `applyCompensation` held in place. */
export interface CompensationResult {
  bones: number;
  attachments: number;
}

/**
 * Writes the compensation for the state the skeleton is in RIGHT NOW.
 *
 * Call it right after the tool has written the bone values, when the document
 * has already re-posed: `boneFrame` then answers `B'`, and `F = B'⁻¹ · B` is
 * the fix. `mergeKey` must be the drag's own key, so the whole drag stays one
 * step of undo.
 */
export function applyCompensation(
  doc: EditorDoc, plan: CompensationPlan, mergeKey: string,
): CompensationResult {
  const result: CompensationResult = { bones: 0, attachments: 0 };
  const skeleton = doc.skeleton;
  if (skeleton === null || plan.bones.length === 0) return result;

  const boneValues: Array<{ bone: string; key: BoneKey; value: number }> = [];
  const writes: Array<{ at: AttachmentAddress; def: AttachmentDef }> = [];

  for (const snapshot of plan.bones) {
    const after = boneFrame(skeleton, snapshot.name);
    const fix = fixMatrix(snapshot.world, after);
    if (isIdentityFix(fix)) continue;

    for (const child of snapshot.children) {
      // The child must keep the world matrix it had. Its parent frame is the
      // bone we just moved, so read the NEW frame and solve the local pose.
      const pose = localFromWorld(child.world, parentFrame(skeleton, child.name));
      boneValues.push(
        { bone: child.name, key: 'x', value: pose.x },
        { bone: child.name, key: 'y', value: pose.y },
        { bone: child.name, key: 'rotation', value: pose.rotation },
        { bone: child.name, key: 'scaleX', value: pose.scaleX },
        { bone: child.name, key: 'scaleY', value: pose.scaleY },
        // Spec 5.5 always decomposes with `shearX = 0`; a bone that HAD a
        // `shearX` must lose it, or the forward pass would add the old slant on
        // top of the new rotation and the drawing would jump after all.
        { bone: child.name, key: 'shearX', value: 0 },
        { bone: child.name, key: 'shearY', value: pose.shearY },
      );
      result.bones += 1;
    }

    for (const entry of snapshot.attachments) {
      writes.push({
        at: entry.at,
        def: fixAttachment(entry.def, fix, entry.boneIndex, entry.ownSlot),
      });
      result.attachments += 1;
    }
  }

  if (boneValues.length > 0) {
    writeBoneValues(doc, 'Compensar filhos', `${mergeKey}:filhos`, boneValues);
  }
  if (writes.length > 0) {
    doc.run(new SetAttachments('Compensar desenhos', writes, `${mergeKey}:desenhos`));
  }
  return result;
}
