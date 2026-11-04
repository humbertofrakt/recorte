/**
 * Handles drawn on the drawing area (owner D).
 *
 * A handle is a dot the user can grab. Each one stands for one number (or one
 * pair of numbers) that already exists in the `.bone` file, and dragging it
 * pushes the command that writes exactly that number. Nothing here invents a
 * value the format cannot hold.
 *
 * | Handle              | Grabs                          | Writes                          |
 * |:--------------------|:-------------------------------|:--------------------------------|
 * | Alvo de IK          | the target bone of an `ik`     | that bone's local `x`, `y`      |
 * | Dobra               | the joint of a 2-bone `ik`     | `bendPositive`                  |
 * | Alvo de transformar | the target bone of a `transform` | that bone's local `x`, `y`    |
 * | Posição no caminho  | the first bone of a `path`     | `position`                      |
 * | Vento               | the bone of a `physics`        | `wind`                          |
 * | Gravidade           | the bone of a `physics`        | `gravity`                       |
 *
 * Every position below is in WORLD coordinates (Y up), so the tests can check
 * them without a canvas.
 *
 * POSE MODE. Every write goes through `anim/pose-mode.ts`, never straight into
 * the setup pose: with an animation open, dragging a handle writes a KEY at
 * `doc.time`. The bone handles use `writeBoneValues` (the door `tools/select.ts`
 * already opens for the transform tools) and the constraint handles use
 * `writeConstraintValue` below, which is the same rule for a `constraint`
 * timeline (spec 9.1).
 */

import type {
  ConstraintDef, IkConstraintDef, PathConstraintDef, PhysicsConstraintDef, TransformConstraintDef,
} from '../../../runtime/src/index.js';
import { corpoDe } from '../contract.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { constraintTarget } from '../anim/keying.js';
import { setPropertyOrKey, type PoseOutcome } from '../anim/pose-mode.js';
import {
  HANDLE, fillHandle, newMergeKey, parentFrame, strokeCircle, strokeLine,
  worldPointToFrame, writeBoneValues,
} from './tools/select.js';

// ---------------------------------------------------------------------------
// Sizes, in screen pixels unless the name says otherwise
// ---------------------------------------------------------------------------

/** Size of a square handle on screen. Also the radius that catches a click. */
export const HANDLE_PIXELS = 14;
/** How far the bend handle sits from the joint, on screen. */
export const BEND_PIXELS = 34;
/**
 * World units per unit of `wind` / `gravity`. The physics forces are large
 * numbers, so the arrow would leave the screen at 1:1.
 */
export const FORCE_SCALE = 0.25;
/** Length used when a path has no measurable size, so a drag still does something. */
export const PATH_REFERENCE = 100;

// ---------------------------------------------------------------------------
// The handles
// ---------------------------------------------------------------------------

export type HandleKind =
  | 'ikTarget'
  | 'ikBend'
  | 'transformTarget'
  | 'pathPosition'
  | 'physicsWind'
  | 'physicsGravity';

export interface Handle {
  /** Unique on the screen: `kind:constraint`. */
  readonly id: string;
  readonly kind: HandleKind;
  /** Written next to the handle, in Portuguese. Never an icon alone. */
  readonly label: string;
  /** Name of the constraint this handle belongs to. */
  readonly constraint: string;
  /** Where the handle is, in world coordinates. */
  readonly x: number;
  readonly y: number;
  /** Where the guide line starts (the joint, the bone, the anchor). */
  readonly anchorX: number;
  readonly anchorY: number;
  /** Bone the drag moves, for the handles that move a bone. Otherwise `null`. */
  readonly bone: string | null;
  /**
   * World tip of the chain, only on the bend handle: the side of the line from
   * `anchor` to `tip` is what `bendPositive` means, and `resolveHandles` needs
   * it to push the handle off the joint.
   */
  readonly tipX?: number;
  readonly tipY?: number;
}

/** Constraints of the file, typed. Missing array reads as empty. */
function constraintsOf(doc: EditorDoc): ConstraintDef[] {
  return corpoDe(doc).file.constraints ?? [];
}

/** World origin of a bone, or `null` when the bone is not in the skeleton. */
function boneOrigin(doc: EditorDoc, name: string): { x: number; y: number } | null {
  const bone = doc.skeleton?.findBone(name) ?? null;
  return bone === null ? null : { x: bone.worldX, y: bone.worldY };
}

/** World tip of a bone (its origin plus its length along its own X axis). */
function boneTipWorld(doc: EditorDoc, name: string): { x: number; y: number } | null {
  const bone = doc.skeleton?.findBone(name) ?? null;
  if (bone === null) return null;
  const length = bone.data.length;
  return { x: bone.worldX + bone.a * length, y: bone.worldY + bone.c * length };
}

/**
 * Every handle currently on screen, in file order.
 *
 * A constraint whose bones or target are missing simply produces no handle:
 * a half-typed file must never stop the drawing area.
 */
export function collectHandles(doc: EditorDoc): Handle[] {
  const out: Handle[] = [];
  if (doc.skeleton === null) return out;

  for (const constraint of constraintsOf(doc)) {
    switch (constraint.type) {
      case 'ik':
        addIkHandles(doc, constraint, out);
        break;
      case 'transform':
        addTransformHandle(doc, constraint, out);
        break;
      case 'path':
        addPathHandle(doc, constraint, out);
        break;
      case 'physics':
        addPhysicsHandles(doc, constraint, out);
        break;
      default:
        break;
    }
  }
  return out;
}

function addIkHandles(doc: EditorDoc, def: IkConstraintDef, out: Handle[]): void {
  const target = boneOrigin(doc, def.target);
  if (target !== null) {
    out.push({
      id: `ikTarget:${def.name}`,
      kind: 'ikTarget',
      label: `Alvo de IK — ${def.name}`,
      constraint: def.name,
      x: target.x,
      y: target.y,
      anchorX: target.x,
      anchorY: target.y,
      bone: def.target,
    });
  }
  // The bend handle only makes sense with two bones: one bone cannot bend.
  if (def.bones.length !== 2) return;
  const joint = boneOrigin(doc, def.bones[1]);
  const root = boneOrigin(doc, def.bones[0]);
  const tip = boneTipWorld(doc, def.bones[1]);
  if (joint === null || root === null || tip === null) return;
  out.push({
    id: `ikBend:${def.name}`,
    kind: 'ikBend',
    label: `Dobra — ${def.name}`,
    constraint: def.name,
    // The handle sits ON the joint; the drawing pushes it aside by the
    // current bend, which is a screen distance and so is not stored here.
    x: joint.x,
    y: joint.y,
    anchorX: root.x,
    anchorY: root.y,
    bone: def.bones[1],
    tipX: tip.x,
    tipY: tip.y,
  });
}

function addTransformHandle(doc: EditorDoc, def: TransformConstraintDef, out: Handle[]): void {
  const target = boneOrigin(doc, def.target);
  if (target === null) return;
  out.push({
    id: `transformTarget:${def.name}`,
    kind: 'transformTarget',
    label: `Alvo de transformar — ${def.name}`,
    constraint: def.name,
    x: target.x,
    y: target.y,
    anchorX: target.x,
    anchorY: target.y,
    bone: def.target,
  });
}

function addPathHandle(doc: EditorDoc, def: PathConstraintDef, out: Handle[]): void {
  if (def.bones.length === 0) return;
  const first = boneOrigin(doc, def.bones[0]);
  const tip = boneTipWorld(doc, def.bones[0]);
  if (first === null || tip === null) return;
  out.push({
    id: `pathPosition:${def.name}`,
    kind: 'pathPosition',
    label: `Posição no caminho — ${def.name}`,
    constraint: def.name,
    // On the tip of the first bone: that is the point the path moves.
    x: tip.x,
    y: tip.y,
    anchorX: first.x,
    anchorY: first.y,
    bone: def.bones[0],
  });
}

function addPhysicsHandles(doc: EditorDoc, def: PhysicsConstraintDef, out: Handle[]): void {
  const origin = boneOrigin(doc, def.bone);
  if (origin === null) return;
  const wind = def.wind ?? 0;
  const gravity = def.gravity ?? 0;
  out.push({
    id: `physicsWind:${def.name}`,
    kind: 'physicsWind',
    label: `Vento — ${def.name}`,
    constraint: def.name,
    // Wind is a constant force along +X (spec 6.5).
    x: origin.x + wind * FORCE_SCALE,
    y: origin.y,
    anchorX: origin.x,
    anchorY: origin.y,
    bone: def.bone,
  });
  out.push({
    id: `physicsGravity:${def.name}`,
    kind: 'physicsGravity',
    label: `Gravidade — ${def.name}`,
    constraint: def.name,
    // Gravity is a constant force DOWN, which is -Y (spec 6.5).
    x: origin.x,
    y: origin.y - gravity * FORCE_SCALE,
    anchorX: origin.x,
    anchorY: origin.y,
    bone: def.bone,
  });
}

/**
 * The handles as they are DRAWN, which is what a click must be measured
 * against. Only the bend handle moves: it sits on the joint in `collectHandles`
 * and is pushed off it by a fixed number of screen pixels, so it does not hide
 * the joint and does not change size with the zoom.
 */
export function resolveHandles(
  doc: EditorDoc, scale: number, handles: readonly Handle[] = collectHandles(doc),
): Handle[] {
  return handles.map((handle) => {
    if (handle.kind !== 'ikBend') return handle;
    const tipX = handle.tipX ?? handle.x;
    const tipY = handle.tipY ?? handle.y;
    const positive = readConstraint(doc, handle.constraint, 'bendPositive', true) as boolean;
    const spot = bendHandlePosition(handle, tipX, tipY, positive, scale);
    return { ...handle, x: spot.x, y: spot.y };
  });
}

/** The handle under `(x, y)`, or `null`. The last one wins, so it is the top one. */
export function handleAt(
  handles: readonly Handle[], x: number, y: number, scale: number, pixels = HANDLE_PIXELS,
): Handle | null {
  const radius = pixels / (scale > 0 ? scale : 1);
  let found: Handle | null = null;
  for (const handle of handles) {
    if (Math.hypot(handle.x - x, handle.y - y) <= radius) found = handle;
  }
  return found;
}

// ---------------------------------------------------------------------------
// Writing a constraint property
// ---------------------------------------------------------------------------

/** The constraint entry of the file, or `null` when the name is unknown. */
export function findConstraintDef(doc: EditorDoc, name: string): ConstraintDef | null {
  for (const def of constraintsOf(doc)) if (def.name === name) return def;
  return null;
}

/** Current value of a constraint property, straight from the file. */
export function readConstraint(
  doc: EditorDoc, name: string, key: string, fallback: number | boolean,
): number | boolean {
  const def = findConstraintDef(doc, name);
  const value = def === null ? undefined : (def as unknown as Record<string, unknown>)[key];
  return typeof value === typeof fallback ? (value as number | boolean) : fallback;
}

/**
 * Writes one constraint property in the three places that must agree, exactly
 * like `writeBone` does for bones:
 *   - `doc.file`, which is what gets saved;
 *   - the loaded `ConstraintData`, which a re-pose restores from;
 *   - the live constraint, so the very next frame is already right.
 *
 * Without the second write the value would jump back on the next `repose()`,
 * because `setToSetupPose` copies the constraint data over the live values.
 */
export function writeConstraint(
  doc: EditorDoc, name: string, key: string, value: number | boolean,
): void {
  const def = findConstraintDef(doc, name);
  if (def !== null) (def as unknown as Record<string, unknown>)[key] = value;

  const data = doc.data?.findConstraint(name) ?? null;
  if (data !== null) (data as unknown as Record<string, unknown>)[key] = value;

  const live = doc.skeleton?.findConstraint(name) ?? null;
  if (live !== null) (live as unknown as Record<string, unknown>)[key] = value;
}

/** One constraint property, with the value before and after the edit. */
export interface ConstraintChange {
  readonly constraint: string;
  readonly key: string;
  before: number | boolean;
  after: number | boolean;
}

/** Sets constraint properties. A whole drag folds into one undo step. */
export class SetConstraintProperty implements Command {
  readonly kind: ChangeKind = 'transform';

  constructor(
    readonly label: string,
    readonly changes: ConstraintChange[],
    /** Drags with the same key merge. A new drag must use a new key. */
    readonly mergeKey: string,
  ) {}

  apply(doc: EditorDoc): void {
    for (const change of this.changes) writeConstraint(doc, change.constraint, change.key, change.after);
  }

  revert(doc: EditorDoc): void {
    for (const change of this.changes) writeConstraint(doc, change.constraint, change.key, change.before);
  }

  mergeWith(previous: Command): boolean {
    if (!(previous instanceof SetConstraintProperty)) return false;
    if (previous.mergeKey !== this.mergeKey) return false;
    if (previous.changes.length !== this.changes.length) return false;
    for (let i = 0; i < this.changes.length; i++) {
      if (previous.changes[i].constraint !== this.changes[i].constraint) return false;
      if (previous.changes[i].key !== this.changes[i].key) return false;
    }
    for (let i = 0; i < this.changes.length; i++) {
      this.changes[i].before = previous.changes[i].before;
    }
    return true;
  }
}

/** Builds a `SetConstraintProperty` that reads each `before` from the file. */
export function setConstraintProperties(
  doc: EditorDoc, label: string, mergeKey: string,
  values: Array<{ constraint: string; key: string; value: number | boolean; fallback: number | boolean }>,
): SetConstraintProperty {
  const changes: ConstraintChange[] = values.map((item) => ({
    constraint: item.constraint,
    key: item.key,
    before: readConstraint(doc, item.constraint, item.key, item.fallback),
    after: item.value,
  }));
  return new SetConstraintProperty(label, changes, mergeKey);
}

/**
 * THE door every constraint handle writes through, and the twin of
 * `writeBoneValues` in `tools/select.ts`.
 *
 * Assembly mode writes the setup pose with `SetConstraintProperty`, which is
 * the command that keeps the file, the loaded `ConstraintData` and the live
 * constraint in step — without the second write the number would jump back on
 * the next `repose()`, because `setToSetupPose` copies the data over.
 *
 * With an animation open it hands the value to `setPropertyOrKey`, so a
 * `constraint` timeline gets the key and the setup pose is left alone. The key
 * command is `structure`, which reloads the file, so the live constraint is
 * right again by the next frame with no second write needed.
 */
export function writeConstraintValue(
  doc: EditorDoc, constraint: string, key: string, value: number | boolean,
  label: string, mergeKey: string, fallback: number | boolean = 0,
): PoseOutcome {
  if (doc.animation === null) {
    corpoDe(doc).run(setConstraintProperties(doc, label, mergeKey, [
      { constraint, key, value, fallback },
    ]));
    return 'montagem';
  }
  return setPropertyOrKey(doc, constraintTarget(constraint, key), value, { label });
}

// ---------------------------------------------------------------------------
// Dragging a handle
// ---------------------------------------------------------------------------

/** State kept while one handle is being dragged. */
export interface HandleDrag {
  readonly handle: Handle;
  readonly mergeKey: string;
  /** Where the pointer grabbed the handle, in world coordinates. */
  readonly grabX: number;
  readonly grabY: number;
  /** Value the scalar handles started from. */
  readonly startValue: number;
  /** Unit vector a scalar handle measures the drag along. */
  readonly dirX: number;
  readonly dirY: number;
  /** World length that means "one whole unit" for a scalar handle. */
  readonly reference: number;
}

/** Unit vector from the anchor to the handle, or `(1, 0)` when they coincide. */
function handleDirection(handle: Handle): { x: number; y: number; length: number } {
  const dx = handle.x - handle.anchorX;
  const dy = handle.y - handle.anchorY;
  const length = Math.hypot(dx, dy);
  if (length < 1e-6) return { x: 1, y: 0, length: 0 };
  return { x: dx / length, y: dy / length, length };
}

/** Starts a drag. Reads the value the handle stands for straight from the file. */
export function beginHandleDrag(
  doc: EditorDoc, handle: Handle, worldX: number, worldY: number,
): HandleDrag {
  const direction = handleDirection(handle);
  let startValue = 0;
  let reference = PATH_REFERENCE;

  switch (handle.kind) {
    case 'pathPosition': {
      startValue = readConstraint(doc, handle.constraint, 'position', 0) as number;
      // A drag as long as the first bone moves the position by one whole unit.
      reference = direction.length > 1e-6 ? direction.length : PATH_REFERENCE;
      break;
    }
    case 'physicsWind':
      startValue = readConstraint(doc, handle.constraint, 'wind', 0) as number;
      break;
    case 'physicsGravity':
      startValue = readConstraint(doc, handle.constraint, 'gravity', 0) as number;
      break;
    default:
      break;
  }

  return {
    handle,
    mergeKey: newMergeKey(`handle:${handle.id}`),
    grabX: worldX,
    grabY: worldY,
    startValue,
    dirX: direction.x,
    dirY: direction.y,
    reference,
  };
}

/**
 * New value of a path `position` after a drag.
 *
 * `percent` mode counts 0 to 1 along the whole path, so it is clamped; `fixed`
 * mode is a length in skeleton pixels and is not.
 */
export function pathPositionFromDrag(
  start: number, mode: string, along: number, reference: number,
): number {
  if (mode === 'fixed') return start + along;
  const length = reference > 1e-6 ? reference : PATH_REFERENCE;
  return Math.min(1, Math.max(0, start + along / length));
}

/** Sign of the side `(px, py)` is on, relative to the line from root to tip. */
export function sideOfLine(
  rootX: number, rootY: number, tipX: number, tipY: number, px: number, py: number,
): number {
  const cross = (tipX - rootX) * (py - rootY) - (tipY - rootY) * (px - rootX);
  return cross >= 0 ? 1 : -1;
}

/**
 * Continues a drag: pushes the command that writes the new value.
 *
 * Returns `true` when something was written, so a caller can skip a redraw.
 */
export function moveHandleDrag(
  doc: EditorDoc, drag: HandleDrag, worldX: number, worldY: number,
): boolean {
  const handle = drag.handle;
  const skeleton = doc.skeleton;
  if (skeleton === null) return false;

  switch (handle.kind) {
    case 'ikTarget':
    case 'transformTarget': {
      const bone = handle.bone;
      if (bone === null) return false;
      // The file stores a LOCAL position, so the world point comes back
      // through the frame the bone's parent puts it in.
      const local = worldPointToFrame(parentFrame(skeleton, bone), worldX, worldY);
      const label = handle.kind === 'ikTarget' ? 'Mover alvo de IK' : 'Mover alvo de transformar';
      writeBoneValues(doc, label, drag.mergeKey, [
        { bone, key: 'x', value: local.x },
        { bone, key: 'y', value: local.y },
      ]);
      return true;
    }
    case 'ikBend': {
      const def = findConstraintDef(doc, handle.constraint);
      if (def === null || def.type !== 'ik' || def.bones.length !== 2) return false;
      const root = boneOrigin(doc, def.bones[0]);
      const tip = boneTipWorld(doc, def.bones[1]);
      if (root === null || tip === null) return false;
      const positive = sideOfLine(root.x, root.y, tip.x, tip.y, worldX, worldY) > 0;
      if ((def.bendPositive ?? true) === positive) return false;
      writeConstraintValue(
        doc, handle.constraint, 'bendPositive', positive,
        'Trocar a dobra do IK', drag.mergeKey, true,
      );
      return true;
    }
    case 'pathPosition': {
      const def = findConstraintDef(doc, handle.constraint);
      if (def === null || def.type !== 'path') return false;
      const along = (worldX - drag.grabX) * drag.dirX + (worldY - drag.grabY) * drag.dirY;
      const value = pathPositionFromDrag(
        drag.startValue, def.positionMode ?? 'percent', along, drag.reference,
      );
      writeConstraintValue(
        doc, handle.constraint, 'position', value,
        'Mover a posição no caminho', drag.mergeKey,
      );
      return true;
    }
    case 'physicsWind': {
      const value = (worldX - handle.anchorX) / FORCE_SCALE;
      writeConstraintValue(doc, handle.constraint, 'wind', value, 'Mudar o vento', drag.mergeKey);
      return true;
    }
    case 'physicsGravity': {
      const value = (handle.anchorY - worldY) / FORCE_SCALE;
      writeConstraintValue(
        doc, handle.constraint, 'gravity', value, 'Mudar a gravidade', drag.mergeKey,
      );
      return true;
    }
    default:
      return false;
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

/** Colours of the handles. One hue per job, all of them high contrast. */
export const HANDLE_COLOR: Readonly<Record<HandleKind, string>> = Object.freeze({
  ikTarget: '#d92b2b',
  ikBend: '#8a5a00',
  transformTarget: '#7b2fd6',
  pathPosition: '#0f7a6a',
  physicsWind: '#0f6fd6',
  physicsGravity: '#3a3a3a',
});

/**
 * Where the bend handle is DRAWN: pushed off the joint, perpendicular to the
 * line from the chain root to the chain tip, on the side the bend is on.
 * The distance is a screen distance, so it does not change with the zoom.
 */
export function bendHandlePosition(
  handle: Handle, tipX: number, tipY: number, bendPositive: boolean, scale: number,
): { x: number; y: number } {
  const dx = tipX - handle.anchorX;
  const dy = tipY - handle.anchorY;
  const length = Math.hypot(dx, dy);
  const distance = BEND_PIXELS / (scale > 0 ? scale : 1);
  if (length < 1e-6) return { x: handle.x, y: handle.y + distance };
  const side = bendPositive ? 1 : -1;
  return {
    x: handle.x - (dy / length) * distance * side,
    y: handle.y + (dx / length) * distance * side,
  };
}

/** Draws every handle, with the active one ringed. */
export function drawHandles(
  ctx: CanvasRenderingContext2D, handles: readonly Handle[], scale: number,
  activeId: string | null = null,
): void {
  for (const handle of handles) {
    const color = HANDLE_COLOR[handle.kind];
    if (handle.anchorX !== handle.x || handle.anchorY !== handle.y) {
      strokeLine(ctx, scale, HANDLE.guide, 1, handle.anchorX, handle.anchorY, handle.x, handle.y);
    }
    fillHandle(ctx, scale, color, HANDLE_PIXELS, handle.x, handle.y);
    if (handle.id === activeId) {
      strokeCircle(ctx, scale, color, 2, handle.x, handle.y, HANDLE_PIXELS);
    }
  }
}
