/**
 * A conta de mundo e local dos ossos, e mover um desenho pela matriz de
 * conserto — lote A4, plano arrumação (v10.7).
 *
 * Morava em `viewport/tools/compensate.ts`. Veio para a base porque o
 * `doc/reparent.ts` precisa dela, e a base não importa a cena. É a mesma conta
 * do Compensar (lote 6) e do Trocar de pai (lote 34): `L' = P'⁻¹ · W`. A
 * ferramenta continua exportando tudo com os mesmos nomes, daqui.
 */

import type { AttachmentDef, Matrix2x3 } from '../../../runtime/src/index.js';
import {
  atan2Deg, composeMatrix, invertMatrix, multiplyMatrix,
} from '../../../runtime/src/index.js';

/** JSON deep copy. The file only ever holds JSON values, so this is exact. */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

// ---------------------------------------------------------------------------
// Poses and matrices
// ---------------------------------------------------------------------------

/** The local pose of a bone, as the `.bone` file writes it. */
export interface LocalPose {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  /** `shearX` is always 0 in a decomposition (spec 5.5); the slant goes here. */
  shearY: number;
}

/** Below this the matrix has no inverse and the guards of spec 5.5 apply. */
const EPSILON_DET = 1e-4;

/** An angle brought back inside (−180, 180]. */
function normalizeDegrees(degrees: number): number {
  let value = degrees % 360;
  if (value > 180) value -= 360;
  if (value <= -180) value += 360;
  return value;
}

/**
 * The local pose that puts a bone at `world` while its parent frame is `parent`.
 *
 * This is the EXACT inverse of the world pass of spec 5.4 for the `normal`
 * inheritance mode. `parent` is the frame the local pose lives in, which is what
 * `parentFrame` of `select.ts` returns: the parent's world matrix, or the
 * skeleton's own placement for a bone with no parent. Feeding the result back
 * through 5.4 reproduces `world` to the last bit, which is what the test pins.
 *
 * THE CONTA
 *
 *   R = P⁻¹ · M            the local linear part, columns (Ra,Rc) and (Rb,Rd)
 *   scaleX   = |(Ra, Rc)|          length of the first column
 *   rotation = atan2(Rc, Ra)       direction of the first column
 *   ψ        = atan2(Rd, Rb)       direction of the second column
 *   m        = |(Rb, Rd)|          length of the second column
 *   det      = Ra·Rd − Rb·Rc
 *   scaleY   =  m,  shearY = ψ − rotation − 90     when det ≥ 0
 *   scaleY   = −m,  shearY = ψ − rotation + 90     when det < 0
 *
 * The second branch only picks the other of the two ways of writing the same
 * column, so that the sign of `scaleY` still tells a mirrored bone from an
 * upright one, which is the convention the rest of the format uses.
 *
 * WHY NOT `appliedFromWorld` OF SPEC 5.5, WORD FOR WORD
 * Because 5.5 (and the Spine code it is ported from) computes `scaleY` as
 * `det / scaleX`, which is the length of the part of the second column that is
 * PERPENDICULAR to the first. Whenever the two columns are not perpendicular —
 * that is, whenever there is any shear at all — that is shorter than the column
 * itself by exactly `cos(shear)`, and writing the pose back gives a different
 * matrix. It is the length of the column, `|(Rb, Rd)|`, that 5.4 reads back.
 * A compensation is only worth anything if it is exact, so this uses the exact
 * inverse. The difference is written up for the runtime owner in
 * `documentos/notas-de-desenvolvimento/PEDIDOS-FASE6.md`.
 */
export function localFromWorld(world: Matrix2x3, parent: Matrix2x3): LocalPose {
  const det = parent.a * parent.d - parent.b * parent.c;
  if (Math.abs(det) <= EPSILON_DET) {
    return { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, shearY: 0 };
  }
  const pid = 1 / det;
  const ia = parent.d * pid;
  const ib = parent.b * pid;
  const ic = parent.c * pid;
  const id = parent.a * pid;

  const dx = world.worldX - parent.worldX;
  const dy = world.worldY - parent.worldY;
  const x = dx * ia - dy * ib;
  const y = dy * id - dx * ic;

  const ra = ia * world.a - ib * world.c;
  const rb = ia * world.b - ib * world.d;
  const rc = id * world.c - ic * world.a;
  const rd = id * world.d - ic * world.b;

  const scaleX = Math.sqrt(ra * ra + rc * rc);
  const length = Math.sqrt(rb * rb + rd * rd);
  const inner = ra * rd - rb * rc;

  if (scaleX <= EPSILON_DET) {
    // The first column collapsed: there is no rotation to read from it, so the
    // second column carries the angle and the bone is written with no width.
    return {
      x, y,
      rotation: normalizeDegrees(atan2Deg(rd, rb) - 90),
      scaleX: 0,
      scaleY: length,
      shearY: 0,
    };
  }

  const rotation = atan2Deg(rc, ra);
  const columnAngle = atan2Deg(rd, rb);
  const mirrored = inner < 0;
  return {
    x, y,
    rotation,
    scaleX,
    scaleY: mirrored ? -length : length,
    shearY: normalizeDegrees(columnAngle - rotation + (mirrored ? 90 : -90)),
  };
}

/**
 * `F = after⁻¹ · before`. Multiply any point written in the bone's local space
 * by this and its world position does not move.
 */
export function fixMatrix(before: Matrix2x3, after: Matrix2x3): Matrix2x3 {
  return multiplyMatrix(invertMatrix(after), before);
}

/** `true` when the matrix is the identity, to the tolerance a drag needs. */
export function isIdentityFix(fix: Matrix2x3, epsilon = 1e-9): boolean {
  return Math.abs(fix.a - 1) <= epsilon && Math.abs(fix.b) <= epsilon
    && Math.abs(fix.c) <= epsilon && Math.abs(fix.d - 1) <= epsilon
    && Math.abs(fix.worldX) <= epsilon && Math.abs(fix.worldY) <= epsilon;
}

/** A point moved by the fix matrix. */
export function fixPoint(fix: Matrix2x3, x: number, y: number): { x: number; y: number } {
  return { x: fix.a * x + fix.b * y + fix.worldX, y: fix.c * x + fix.d * y + fix.worldY };
}

/** Translation, rotation and scale of a matrix built as `T · R · S`. */
export interface Trs {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

/**
 * Splits `T · R · S` back into its parts, the same convention `composeMatrix`
 * and the `region` corner formula of spec 7.3 use:
 *
 *   a = cos·sx   b = −sin·sy   c = sin·sx   d = cos·sy
 *   scaleX = |(a, c)|, det = a·d − b·c, scaleY = det / scaleX
 */
export function decomposeTrs(m: Matrix2x3): Trs {
  const scaleX = Math.hypot(m.a, m.c);
  if (scaleX <= 1e-9) {
    return { x: m.worldX, y: m.worldY, rotation: 0, scaleX: 0, scaleY: Math.hypot(m.b, m.d) };
  }
  const det = m.a * m.d - m.b * m.c;
  return {
    x: m.worldX,
    y: m.worldY,
    rotation: atan2Deg(m.c, m.a),
    scaleX,
    scaleY: det / scaleX,
  };
}

// ---------------------------------------------------------------------------
// Moving one attachment by the fix matrix
// ---------------------------------------------------------------------------

/**
 * A copy of `def` with everything written in `bone`'s space moved by `fix`.
 *
 * `boneIndex` is the index of the edited bone, which is what a weight binding
 * stores; `ownSlot` says whether the attachment's slot names that same bone,
 * because an unweighted attachment only follows the bone its slot names.
 */
export function fixAttachment(
  def: AttachmentDef, fix: Matrix2x3, boneIndex: number, ownSlot: boolean,
): AttachmentDef {
  const next = clone(def) as AttachmentDef & Record<string, unknown>;
  const type = (next.type as string | undefined) ?? 'region';

  const binding = next['binding'] as { bones?: number[]; counts?: number[]; positions?: number[] } | undefined;
  if (binding !== undefined && Array.isArray(binding.bones) && Array.isArray(binding.positions)) {
    // Weighted: only the influences that name THIS bone move. Every other term
    // of the world sum is untouched, so the sum comes out where it was.
    for (let i = 0; i < binding.bones.length; i++) {
      if (binding.bones[i] !== boneIndex) continue;
      const px = binding.positions[i * 2] ?? 0;
      const py = binding.positions[i * 2 + 1] ?? 0;
      const moved = fixPoint(fix, px, py);
      binding.positions[i * 2] = moved.x;
      binding.positions[i * 2 + 1] = moved.y;
    }
    return next;
  }

  if (!ownSlot) return next;

  const vertices = next['vertices'] as number[] | undefined;
  if (Array.isArray(vertices)) {
    for (let i = 0; i + 1 < vertices.length; i += 2) {
      const moved = fixPoint(fix, vertices[i] ?? 0, vertices[i + 1] ?? 0);
      vertices[i] = moved.x;
      vertices[i + 1] = moved.y;
    }
    return next;
  }

  // What is left is a transform: `region`, `point`, and a `boundingbox` written
  // as a rectangle. Its local matrix is `A = T · R · S`; the fixed one is
  // `F · A`, split back into the fields the format has. Rodada 15: the
  // particle emitter too (`x`, `y`, `rotation`, extension 9.10), without scale.
  if (type === 'region' || type === 'point' || type === 'boundingbox' || type === 'BONE_particle') {
    const current = composeMatrix(
      Number(next['x'] ?? 0),
      Number(next['y'] ?? 0),
      Number(next['rotation'] ?? 0),
      type === 'region' ? Number(next['scaleX'] ?? 1) : 1,
      type === 'region' ? Number(next['scaleY'] ?? 1) : 1,
    );
    const trs = decomposeTrs(multiplyMatrix(fix, current));
    next['x'] = trs.x;
    next['y'] = trs.y;
    next['rotation'] = trs.rotation;
    if (type === 'region') {
      next['scaleX'] = trs.scaleX;
      next['scaleY'] = trs.scaleY;
    }
  }
  return next;
}
