/**
 * Tool "Posar" (owner D, requirement R6): drag the tip of a chain and the
 * bones bend to follow.
 *
 * WHAT IT WRITES. Nothing but LOCAL ROTATIONS, in `file.bones` in assembly mode
 * and as keys on the `bone/rotation` timelines with an animation open. The IK
 * here is a way of AIMING, not a constraint: no `ik` entry is created, and a
 * file posed with this tool plays back the same in any reader. Every write goes
 * through `writeBoneValues`, which is the door `tools/select.ts` opens onto
 * `anim/pose-mode.ts` — a tool that writes the setup pose while an animation is
 * open destroys the artist's rest pose.
 *
 * THE SOLVER. `solveTwoBone` is the same maths as `IkConstraint.apply2` of the
 * runtime, for the case a pose drag actually meets: parent scale uniform, no
 * stretch, no softness, full mix. It exists separately for two reasons: the
 * drag has to answer while the pointer moves, before any constraint runs, and a
 * chain being posed by hand usually has no `ik` constraint on it at all.
 * `exibicao.test.ts` checks the two agree bone by bone.
 *
 * THE HANDLES. This tool DRAGS the constraint handles of `handles.ts` (IK
 * target, bend, transform target, path position, wind, gravity). Drawing them
 * is `viewport.ts`'s job now, for every tool, and so is the onion skin — the
 * stopgap of PEDIDOS-FASE3B item 9 is over.
 */

import {
  RAD_TO_DEG, atan2, atan2Deg, normalizeAngle,
  type Bone, type Skeleton,
} from '../../../../runtime/src/index.js';
import { shownBone } from '../../doc/own-bone.js';
import {
  registerTool,
  type EditorDoc,
  type Tool,
  type ToolEvent, corpoDe
} from '../../contract.js';
import { pickAll } from '../picking.js';
import { pickLocks } from './select.js';
import {
  beginHandleDrag, drawHandles, handleAt, moveHandleDrag, resolveHandles,
  type Handle, type HandleDrag,
} from '../handles.js';
import {
  HANDLE, fillHandle, newMergeKey, parentFrame, strokeCircle, strokeLine,
  worldPointToFrame, writeBoneValues,
} from './select.js';

// ---------------------------------------------------------------------------
// The two-bone solver
// ---------------------------------------------------------------------------

/** Below this the chain has no length and there is nothing to solve. */
const EPSILON = 1e-6;

/** How many bones a drag bends by default: the classic arm or leg. */
export const CHAIN_LENGTH = 2;

/** What a chain has to do to reach a point. Both angles are LOCAL degrees. */
export interface ChainSolution {
  /** Local rotation of the first bone of the chain. */
  rotation1: number;
  /** Local rotation of the second bone, or `0` for a one-bone chain. */
  rotation2: number;
  /** `false` when the target is out of reach and the chain is stretched flat. */
  reached: boolean;
}

/** Everything `solveTwoBone` needs, all of it already in the parent's frame. */
export interface ChainInput {
  /** Local position of the second bone inside the first one (`x`, `y`). */
  childX: number;
  childY: number;
  /** Length of the second bone. */
  childLength: number;
  /** Target, measured FROM the first bone's origin, in its parent's frame. */
  targetX: number;
  targetY: number;
  /** Which side the elbow or the knee sticks out to. */
  bendPositive: boolean;
}

/**
 * One bone aimed at a point: the rotation that puts its X axis on the target.
 * The same as `IkConstraint.apply1` with no compress and no stretch.
 */
export function solveOneBone(targetX: number, targetY: number): number {
  if (Math.abs(targetX) < EPSILON && Math.abs(targetY) < EPSILON) return 0;
  return normalizeAngle(atan2Deg(targetY, targetX));
}

/**
 * Two bones bent so the tip of the second reaches the target.
 *
 * Straight from `apply2` (spec 6.2) in the uniform-scale branch:
 *
 *   cos = (d² - l1² - l2²) / (2 · l1 · l2)     the law of cosines
 *   a2  = acos(cos) · bendDir                  the angle at the joint
 *   a1  = atan2(ty·a − tx·b, tx·a + ty·b)      where a = l1 + l2·cos, b = l2·sin(a2)
 *
 * `os` is the angle the second bone's origin sits at inside the first one. It
 * is zero for the usual chain, where the child sits on its parent's X axis, and
 * `apply2` subtracts it from the first rotation and adds it to the second — so
 * the solver does the same and the two agree even on a crooked chain.
 *
 * Out of reach `cos` leaves −1..1: the chain goes straight (or folds flat) and
 * `reached` says so, instead of the angles turning into `NaN`.
 */
export function solveTwoBone(input: ChainInput): ChainSolution {
  const l1 = Math.hypot(input.childX, input.childY);
  const l2 = input.childLength;
  const tx = input.targetX;
  const ty = input.targetY;

  if (l1 < EPSILON || l2 < EPSILON) {
    return { rotation1: solveOneBone(tx, ty), rotation2: 0, reached: false };
  }

  const bendDir = input.bendPositive ? 1 : -1;
  // `atan2` of the runtime, not `Math.atan2`: same function, same rounding,
  // so the solver and `IkConstraint` never drift apart in the last decimals.
  const os = atan2(input.childY, input.childX);
  const dd = tx * tx + ty * ty;

  let cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  let a2: number;
  let reached = true;
  if (cos < -1) {
    // Nearer than the two bones can fold: the chain doubles back on itself.
    cos = -1;
    a2 = Math.PI * bendDir;
    reached = false;
  } else if (cos > 1) {
    // Farther than the two bones reach: the chain goes straight at it.
    cos = 1;
    a2 = 0;
    reached = false;
  } else {
    a2 = Math.acos(cos) * bendDir;
  }

  const a = l1 + l2 * cos;
  const b = l2 * Math.sin(a2);
  const a1 = atan2(ty * a - tx * b, tx * a + ty * b);

  return {
    rotation1: normalizeAngle((a1 - os) * RAD_TO_DEG),
    rotation2: normalizeAngle((a2 + os) * RAD_TO_DEG),
    reached,
  };
}

/**
 * Which side the chain is bent to RIGHT NOW, so a drag keeps the elbow where
 * the artist put it instead of flipping it on the first mouse move.
 */
export function bendOf(child: Bone): boolean {
  const os = atan2Deg(child.ay, child.ax);
  return normalizeAngle(child.arotation - os) >= 0;
}

// ---------------------------------------------------------------------------
// The chain
// ---------------------------------------------------------------------------

/**
 * The bones a drag on `tip` bends, from the shoulder down to the tip.
 *
 * It walks up the parents and stops before the bone that has no parent of its
 * own: the skeleton's root bone places the whole character, and a pose tool
 * that turned it would swing everything else with it.
 */
export function chainFor(skeleton: Skeleton, tip: string, count = CHAIN_LENGTH): string[] {
  let bone = skeleton.findBone(tip);
  if (bone === null) return [];
  const names = [bone.data.name];
  while (names.length < count) {
    const parent: Bone | null = bone.parent;
    if (parent === null || parent.parent === null) break;
    names.unshift(parent.data.name);
    bone = parent;
  }
  return names;
}

/** World tip of a bone: its origin plus its length along its own X axis. */
export function boneTip(bone: Bone): { x: number; y: number } {
  const length = bone.data.length;
  return { x: bone.worldX + bone.a * length, y: bone.worldY + bone.c * length };
}

/** What a drag on a chain has to write, in local degrees. */
export interface ChainWrite {
  bone: string;
  key: 'rotation';
  value: number;
}

/**
 * The rotations that put the tip of `chain` on the world point `(x, y)`.
 *
 * Empty when the chain cannot be posed: no skeleton, a name that is not a bone,
 * a chain longer than two bones. Two bones use `solveTwoBone`; one bone is
 * aimed at the target.
 */
export function poseChain(
  skeleton: Skeleton, chain: readonly string[], worldX: number, worldY: number,
  bendPositive?: boolean,
): ChainWrite[] {
  if (chain.length === 0 || chain.length > 2) return [];
  const root = skeleton.findBone(chain[0]);
  if (root === null) return [];

  // The target, in the frame the first bone's local pose lives in, measured
  // from that bone's own origin: exactly what `apply2` calls (ttx, tty).
  const local = worldPointToFrame(parentFrame(skeleton, chain[0]), worldX, worldY);
  const targetX = local.x - root.ax;
  const targetY = local.y - root.ay;

  if (chain.length === 1) {
    return [{ bone: chain[0], key: 'rotation', value: solveOneBone(targetX, targetY) }];
  }

  const child = skeleton.findBone(chain[1]);
  if (child === null) return [];
  const solution = solveTwoBone({
    childX: child.ax,
    childY: child.ay,
    childLength: child.data.length,
    targetX,
    targetY,
    bendPositive: bendPositive ?? bendOf(child),
  });
  return [
    { bone: chain[0], key: 'rotation', value: solution.rotation1 },
    { bone: chain[1], key: 'rotation', value: solution.rotation2 },
  ];
}

// ---------------------------------------------------------------------------
// The tool
// ---------------------------------------------------------------------------

/** Size of the dot on the tip of the chain, in screen pixels. */
const TIP_PIXELS = 16;
/** Thickness of the line drawn along the chain, in screen pixels. */
const CHAIN_PIXELS = 4;

/** State kept while a chain is being dragged. */
interface ChainDrag {
  chain: string[];
  mergeKey: string;
  /** Side the chain was bent to when the drag started. `Alt` flips it. */
  bendPositive: boolean;
}

class PoseTool implements Tool {
  readonly id = 'pose';
  readonly label = 'Posar';
  // G1 (degrau 7): o `B` foi para o Criar osso; o Posar fica com **`Y`**, que
  // fecha a fila Q W E R T Y das ferramentas de mexer.
  readonly shortcut = 'y';

  private drag: ChainDrag | null = null;
  private handleDrag: HandleDrag | null = null;
  /** The chain the last click chose, so the overlay can draw it. */
  private chain: string[] = [];

  onExit(): void {
    this.drag = null;
    this.handleDrag = null;
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    const skeleton = doc.skeleton;
    if (skeleton === null) return;

    // A handle wins over a bone: it sits on top and is smaller.
    const handle = handleAt(resolveHandles(doc, e.scale), e.x, e.y, e.scale);
    if (handle !== null) {
      this.handleDrag = beginHandleDrag(doc, handle, e.x, e.y);
      this.drag = null;
      return;
    }

    const tip = this.boneUnder(doc, e);
    if (tip === null) return;
    const chain = chainFor(skeleton, tip);
    if (chain.length === 0) return;
    this.chain = chain;
    doc.select({ ...doc.selection, bones: [...chain] });

    const child = chain.length === 2 ? skeleton.findBone(chain[1]) : null;
    const bend = child === null ? true : bendOf(child);
    this.drag = {
      chain,
      mergeKey: newMergeKey('pose'),
      bendPositive: e.alt ? !bend : bend,
    };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    const handleDrag = this.handleDrag;
    if (handleDrag !== null) {
      moveHandleDrag(doc, handleDrag, e.x, e.y);
      return;
    }
    const drag = this.drag;
    const skeleton = doc.skeleton;
    if (drag === null || skeleton === null) return;
    const values = poseChain(skeleton, drag.chain, e.x, e.y, drag.bendPositive);
    if (values.length === 0) return;
    writeBoneValues(doc, 'Posar osso', drag.mergeKey, values);
  }

  onUp(): void {
    this.drag = null;
    this.handleDrag = null;
  }

  /** The bone the pointer is on, or the first selected one as a fallback. */
  private boneUnder(doc: EditorDoc, e: ToolEvent): string | null {
    const hits = pickAll(doc.skeleton, e.x, e.y, e.scale, pickLocks());
    for (const hit of hits) {
      if (hit.kind === 'bone' && hit.bone !== null) return hit.bone;
    }
    // A click on a drawing poses the bone that drawing hangs from.
    for (const hit of hits) {
      if (hit.slot === null) continue;
      const slot = corpoDe(doc).file.slots?.find((item) => item.name === hit.slot);
      // O osso que se vê, e não o osso próprio escondido da imagem (8d).
      if (slot !== undefined) return shownBone(corpoDe(doc).file, slot.bone);
    }
    return doc.selection.bones[0] ?? null;
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    // The onion skin and the handles are drawn by the viewport, for every tool
    // (PEDIDOS-FASE3B item 9). What is left here is what only this tool shows:
    // the chain being posed, and the ring on the handle being dragged.
    const skeleton = doc.skeleton;
    if (skeleton === null) return;

    const chain = this.drag?.chain ?? this.chain;
    for (const name of chain) {
      const bone = skeleton.findBone(name);
      if (bone === null) continue;
      const tip = boneTip(bone);
      strokeLine(ctx, scale, HANDLE.free, CHAIN_PIXELS, bone.worldX, bone.worldY, tip.x, tip.y);
      strokeCircle(ctx, scale, HANDLE.free, 2, bone.worldX, bone.worldY, TIP_PIXELS / 2);
    }
    const last = chain.length === 0 ? null : skeleton.findBone(chain[chain.length - 1]);
    if (last !== null) {
      const tip = boneTip(last);
      fillHandle(ctx, scale, HANDLE.guide, TIP_PIXELS, tip.x, tip.y);
    }

    // The viewport already drew every handle; this only rings the one being
    // dragged, so the artist sees which one the pointer took hold of.
    const active = this.handleDrag?.handle.id ?? null;
    if (active !== null) {
      const handles: Handle[] = resolveHandles(doc, scale);
      drawHandles(ctx, handles.filter((handle) => handle.id === active), scale, active);
    }
  }
}

export const poseTool: Tool = new PoseTool();
registerTool(poseTool);
