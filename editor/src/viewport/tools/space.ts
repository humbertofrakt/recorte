/**
 * The space the transform handles work in, and the three compensation
 * switches — requirement R7.
 *
 * TWO SEPARATE THINGS LIVE HERE.
 *
 * 1. THE SPACE (Local, Pai, Mundo)
 *    A bone's local pose is always written in the PARENT's frame, because that
 *    is the only place the `.bone` file has for it. What the space changes is
 *    the frame the DRAG is measured in and the axes the arrows are drawn along:
 *
 *      Local  the bone's own world matrix. The X arrow points along the bone.
 *      Pai    the parent's world matrix. The axes are the ones the numbers in
 *             the properties panel are written in.
 *      Mundo  the screen's own axes. X is right, Y is up, whatever the rig does.
 *
 *    A world movement `d` is turned into the chosen frame with `F⁻¹ d`, locked
 *    to one axis there when Shift is held, and turned back with `F d`. With the
 *    world frame `F` is the identity, which is exactly what the tools did
 *    before this file existed.
 *
 * 2. THE COMPENSATION (three checkboxes)
 *    "Arrumar o rig sem estragar a pose". Moving a bone normally drags the
 *    whole branch with it. With compensation on, the bone moves and everything
 *    that hangs off it stays exactly where it is on screen. The maths is in
 *    `compensate.ts`; this file only holds the switches, so a tool can read
 *    them without importing the whole compensation machinery.
 *
 * Both are plain module state with listeners, the same shape `pose-mode.ts`
 * uses for automatic recording: the toolbar sets them, every tool reads them,
 * and nothing has to be threaded through the document.
 */

import type { Matrix2x3, Skeleton, Vector2 } from '../../../../runtime/src/index.js';
import { identityMatrix } from '../../../../runtime/src/index.js';
import { boneFrame, bonePivot, parentFrame } from './select.js';

// ---------------------------------------------------------------------------
// The space
// ---------------------------------------------------------------------------

/** Frame the handles of a transform tool work in. */
export type HandleSpace = 'local' | 'pai' | 'mundo';

/** The three choices, with the words the user reads. Order of the toolbar. */
export const HANDLE_SPACES: ReadonlyArray<{
  readonly id: HandleSpace;
  readonly label: string;
  readonly hint: string;
}> = Object.freeze([
  {
    id: 'local',
    label: 'Local',
    hint: 'As setas seguem o próprio osso: X aponta para a ponta dele.',
  },
  {
    id: 'pai',
    label: 'Pai',
    hint: 'As setas seguem o osso pai. É o referencial dos números do painel Propriedades.',
  },
  {
    id: 'mundo',
    label: 'Mundo',
    hint: 'As setas seguem a tela: X para a direita, Y para cima.',
  },
] as const);

/**
 * `local` is the default, the way Spine and Moho ship.
 *
 * It is also what the tools did before the selector existed: "Escalar" always
 * measured the pointer in the bone's own axes, and an artist who scales a
 * rotated bone expects the handle to follow the bone. `Pai` is one click away
 * for whoever wants the frame the numbers in the properties panel are in.
 */
let handleSpace: HandleSpace = 'local';
const spaceListeners = new Set<(space: HandleSpace) => void>();

export function getHandleSpace(): HandleSpace {
  return handleSpace;
}

/** Switches space. An unknown id is ignored, so a bad button cannot break the tool. */
export function setHandleSpace(space: HandleSpace): void {
  if (space === handleSpace) return;
  if (!HANDLE_SPACES.some((entry) => entry.id === space)) return;
  handleSpace = space;
  for (const listener of spaceListeners) listener(space);
}

export function onHandleSpaceChange(listener: (space: HandleSpace) => void): () => void {
  spaceListeners.add(listener);
  return () => spaceListeners.delete(listener);
}

// ---------------------------------------------------------------------------
// The compensation switches
// ---------------------------------------------------------------------------

/**
 * What must stay where it is while the bone moves.
 *
 * The three are separate on purpose: fixing the length of an arm means keeping
 * the hand in place (`children`) while the drawing is allowed to follow, and
 * fixing the pivot of a drawing means the opposite.
 */
export interface CompensationFlags {
  /** "Não mexer nos filhos": the child bones keep their world matrix. */
  children: boolean;
  /** "Não mexer nos desenhos": region, mesh, point and path attachments stay. */
  drawings: boolean;
  /** "Não mexer nas caixas": `boundingbox` and `clipping` attachments stay. */
  boxes: boolean;
}

/** The words the user reads, in the order the checkboxes appear. */
export const COMPENSATION_LABELS: ReadonlyArray<{
  readonly id: keyof CompensationFlags;
  readonly label: string;
  readonly hint: string;
}> = Object.freeze([
  {
    id: 'children',
    label: 'Não mexer nos filhos',
    hint: 'Os ossos filhos ficam onde estão. Só este osso muda.',
  },
  {
    id: 'drawings',
    label: 'Não mexer nos desenhos',
    hint: 'Os desenhos presos a este osso ficam onde estão. Só vale com a base aberta.',
  },
  {
    id: 'boxes',
    label: 'Não mexer nas caixas',
    hint: 'As caixas de colisão e os recortes ficam onde estão. Só vale com a base aberta.',
  },
] as const);

let compensation: CompensationFlags = { children: false, drawings: false, boxes: false };
const compensationListeners = new Set<(flags: CompensationFlags) => void>();

/** A copy, so nobody can change the switches by mutating what they read. */
export function getCompensation(): CompensationFlags {
  return { ...compensation };
}

/** `true` when at least one switch is on, so a tool can skip the work. */
export function compensationOn(flags: CompensationFlags = compensation): boolean {
  return flags.children || flags.drawings || flags.boxes;
}

export function setCompensation(flags: Partial<CompensationFlags>): void {
  const next: CompensationFlags = { ...compensation, ...flags };
  if (next.children === compensation.children
    && next.drawings === compensation.drawings
    && next.boxes === compensation.boxes) {
    return;
  }
  compensation = next;
  for (const listener of compensationListeners) listener({ ...next });
}

export function onCompensationChange(listener: (flags: CompensationFlags) => void): () => void {
  compensationListeners.add(listener);
  return () => compensationListeners.delete(listener);
}

/** Puts the switches back where they start. Only the tests need this. */
export function resetSpaceState(): void {
  handleSpace = 'local';
  compensation = { children: false, drawings: false, boxes: false };
}

// ---------------------------------------------------------------------------
// Frames
// ---------------------------------------------------------------------------

/**
 * The matrix whose axes the handles use, always with its origin at the bone.
 *
 * `mundo` is the identity moved to the bone: the axes are the screen's, the
 * origin is still the point the bone turns around.
 */
export function spaceFrame(
  skeleton: Skeleton, boneName: string, space: HandleSpace,
): Matrix2x3 {
  if (space === 'local') return boneFrame(skeleton, boneName);
  if (space === 'pai') return parentFrame(skeleton, boneName);
  const pivot = bonePivot(skeleton, boneName);
  const frame = identityMatrix();
  frame.worldX = pivot.x;
  frame.worldY = pivot.y;
  return frame;
}

/**
 * The X and Y axes of a frame as unit world vectors, for drawing the arrows.
 *
 * A degenerate axis (a bone scaled to zero) falls back to the world axis, so
 * the handle never disappears and the user always has something to grab.
 */
export function frameAxes(frame: Matrix2x3): { x: Vector2; y: Vector2 } {
  const lengthX = Math.hypot(frame.a, frame.c);
  const lengthY = Math.hypot(frame.b, frame.d);
  return {
    x: lengthX > 1e-9 ? { x: frame.a / lengthX, y: frame.c / lengthX } : { x: 1, y: 0 },
    y: lengthY > 1e-9 ? { x: frame.b / lengthY, y: frame.d / lengthY } : { x: 0, y: 1 },
  };
}

/**
 * A world movement locked to one axis OF THE GIVEN FRAME while Shift is held.
 *
 *   f  = F⁻¹ d      the movement written in the frame's own axes
 *   f' = (fx, 0)    or (0, fy), whichever the pointer left first
 *   d' = F f'       back to world
 *
 * `axis` is remembered across the drag, so the movement does not jump from one
 * axis to the other while the user is still holding Shift.
 */
export function lockAxisInFrame(
  frame: Matrix2x3,
  worldDX: number,
  worldDY: number,
  shift: boolean,
  current: 'none' | 'x' | 'y',
): { dx: number; dy: number; axis: 'none' | 'x' | 'y' } {
  if (!shift) return { dx: worldDX, dy: worldDY, axis: 'none' };

  const det = frame.a * frame.d - frame.b * frame.c;
  if (Math.abs(det) <= 1e-9) return { dx: worldDX, dy: worldDY, axis: 'none' };
  const fx = (worldDX * frame.d - worldDY * frame.b) / det;
  const fy = (worldDY * frame.a - worldDX * frame.c) / det;

  let axis = current;
  if (axis === 'none') {
    if (Math.abs(fx) < 1e-6 && Math.abs(fy) < 1e-6) return { dx: worldDX, dy: worldDY, axis: 'none' };
    axis = Math.abs(fx) >= Math.abs(fy) ? 'x' : 'y';
  }
  const kx = axis === 'x' ? fx : 0;
  const ky = axis === 'y' ? fy : 0;
  return { dx: frame.a * kx + frame.b * ky, dy: frame.c * kx + frame.d * ky, axis };
}

/**
 * The angle, in degrees, that the frame's X axis makes with the world X axis.
 *
 * "Girar" snaps to steps of 15 degrees measured FROM this angle, so a bone
 * under a parent turned by 7 degrees snaps to 7, 22, 37 in the Pai space and to
 * 0, 15, 30 in the Mundo space. Snapping to the world grid inside a tilted rig
 * is what makes a snap useless.
 */
export function frameAngle(frame: Matrix2x3): number {
  return (Math.atan2(frame.c, frame.a) * 180) / Math.PI;
}
