/**
 * Tool "Selecionar" (owner B) and the machinery the other tools share.
 *
 * Everything a transform tool needs lives here so the four drag tools stay
 * short: the `SetProperty` command, the readers and writers of the LOCAL pose
 * inside the `.bone` file, and the frame helpers that turn a world movement
 * into a value the parent bone accepts.
 *
 * The golden rule of this folder: tools write the LOCAL pose of a bone
 * (`x, y, rotation, scaleX, scaleY`) in `doc.file.bones`. They never write a
 * world value anywhere, because the file has no world values to write.
 */

import {
  emptySelection,
  registerTool,
  type ChangeKind,
  type Command,
  type EditorDoc,
  type Selection,
  type Tool,
  type ToolEvent, corpoDe
} from '../../contract.js';
import { clickKeepsBone, clickKeepsBoneNotice } from '../../doc/own-bone.js';
import {
  atan2Deg,
  collectDrawables,
  identityMatrix,
  invertMatrix,
  inverseTransformPoint,
  matrixDeterminant,
  type BoneDef,
  type Matrix2x3,
  type Skeleton,
  type Vector2,
} from '../../../../runtime/src/index.js';
import {
  pickAll, pickAt, pickInRect, selectionFor, selectionForPicks, samePick, withChosen,
  type BoxMode, type Pick, type WorldRect,
} from '../picking.js';
import { currentLocks, viewSettings, type PickLocks } from '../onion.js';
import { appliedParents, reparentExtra, runReparent } from '../../doc/reparent.js';
import {
  ChildGrab, boneFirstNotice, childInSelection, chooseBoneNotice, grabChildren, grabCloseNotice, grabMenuNotice, grabOpenNotice, parentGesture,
  stepNotice,
  type GrabTarget,
} from '../parent-gesture.js';
import { boneTarget } from '../../anim/keying.js';
import { topLevelBones } from '../../doc/bones.js';
import { nudgeLabel } from './nudge-words.js';
import { chosenNotice, handPickedBones } from './creation-words.js';
import { currentValueOf, keyValuesNow, type PoseOutcome } from '../../anim/pose-mode.js';

// ---------------------------------------------------------------------------
// The local pose properties a tool may write
// ---------------------------------------------------------------------------

/**
 * Local pose properties of a bone that the transform tools edit.
 *
 * `shearX` and `shearY` are here for the compensation of R7: holding a child
 * still while a parent is scaled unevenly needs a slant, and `shearY` is the
 * field the format has for it (spec 5.5 always decomposes with `shearX = 0`).
 */
export type BoneKey = 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY' | 'shearX' | 'shearY';

/** Value a property has when the file leaves it out. */
export const BONE_DEFAULTS: Readonly<Record<BoneKey, number>> = Object.freeze({
  x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0,
});

/** The bone entry of the file, or `null` when the name is unknown. */
export function findBoneDef(doc: EditorDoc, name: string): BoneDef | null {
  for (const def of corpoDe(doc).file.bones) if (def.name === name) return def;
  return null;
}

/** Current value of a local pose property, straight from the file. */
export function readBone(doc: EditorDoc, name: string, key: BoneKey): number {
  const def = findBoneDef(doc, name);
  const value = def === null ? undefined : def[key];
  return typeof value === 'number' ? value : BONE_DEFAULTS[key];
}

/**
 * Writes one local pose property.
 *
 * Three places hold the same number and all three must agree at once, or the
 * viewport would show the previous frame during a drag:
 *   - `doc.file`, the document itself, which is what gets saved;
 *   - the loaded `BoneData`, which is the setup pose a re-pose restores;
 *   - the live `Bone`, so the very next frame is already right.
 */
export function writeBone(doc: EditorDoc, name: string, key: BoneKey, value: number): void {
  const def = findBoneDef(doc, name);
  if (def !== null) (def as unknown as Record<string, number>)[key] = value;

  const data = doc.data?.findBone(name) ?? null;
  if (data !== null) (data as unknown as Record<string, number>)[key] = value;

  const bone = doc.skeleton?.findBone(name) ?? null;
  if (bone !== null) {
    (bone as unknown as Record<string, number>)[key] = value;
    bone.dirty = true;
  }
}

/**
 * Tira um campo do osso, como ele estava antes de alguém escrevê-lo — A4, rodada
 * final (29/09/2026). O arquivo perde o campo; o `BoneData` e o `Bone` vivo
 * voltam ao valor que o campo ausente quer dizer, para a tela não mudar.
 */
export function clearBone(doc: EditorDoc, name: string, key: BoneKey): void {
  writeBone(doc, name, key, BONE_DEFAULTS[key]);
  const def = findBoneDef(doc, name);
  if (def !== null) delete (def as unknown as Record<string, number>)[key];
}

// ---------------------------------------------------------------------------
// SetProperty
// ---------------------------------------------------------------------------

/** One property of one bone, with the value before and after the edit. */
export interface PropertyChange {
  readonly bone: string;
  readonly key: BoneKey;
  before: number;
  after: number;
  /**
   * `true` quando o arquivo NÃO tinha o campo antes da edição — A4. O desfazer
   * então tira o campo em vez de escrever o padrão (`shearX: 0` onde não havia
   * `shearX` nenhum): o arquivo volta letra por letra.
   */
  absent?: boolean;
}

/**
 * Sets local pose properties. One command carries every property of every
 * bone touched by a single drag step, and `mergeWith` folds the whole drag
 * into one undo entry: the merged command keeps the `before` of the first
 * step and the `after` of the last one.
 */
export class SetProperty implements Command {
  readonly kind: ChangeKind = 'transform';

  constructor(
    readonly label: string,
    readonly changes: PropertyChange[],
    /** Drags with the same key merge. A new drag must use a new key. */
    readonly mergeKey: string,
  ) {}

  apply(doc: EditorDoc): void {
    for (const change of this.changes) writeBone(doc, change.bone, change.key, change.after);
  }

  revert(doc: EditorDoc): void {
    for (const change of this.changes) {
      if (change.absent === true) clearBone(doc, change.bone, change.key);
      else writeBone(doc, change.bone, change.key, change.before);
    }
  }

  mergeWith(previous: Command): boolean {
    if (!(previous instanceof SetProperty)) return false;
    if (previous.mergeKey !== this.mergeKey) return false;
    if (previous.changes.length !== this.changes.length) return false;
    for (let i = 0; i < this.changes.length; i++) {
      const mine = this.changes[i];
      const theirs = previous.changes[i];
      if (mine.bone !== theirs.bone || mine.key !== theirs.key) return false;
    }
    for (let i = 0; i < this.changes.length; i++) {
      this.changes[i].before = previous.changes[i].before;
      // O começo do arrasto é o do primeiro passo: se o campo não existia lá,
      // o desfazer do arrasto inteiro tem de tirá-lo.
      this.changes[i].absent = previous.changes[i].absent;
    }
    return true;
  }
}

/** Builds a `SetProperty` that takes each property from its current value. */
export function setProperties(
  doc: EditorDoc,
  label: string,
  mergeKey: string,
  values: Array<{ bone: string; key: BoneKey; value: number }>,
): SetProperty {
  const changes: PropertyChange[] = values.map((item) => {
    const def = findBoneDef(doc, item.bone);
    const had = def !== null && typeof (def as unknown as Record<string, unknown>)[item.key] === 'number';
    return {
      bone: item.bone,
      key: item.key,
      before: readBone(doc, item.bone, item.key),
      after: item.value,
      ...(had ? {} : { absent: true }),
    };
  });
  return new SetProperty(label, changes, mergeKey);
}

// ---------------------------------------------------------------------------
// The two modes (anim/pose-mode.ts)
// ---------------------------------------------------------------------------

/**
 * The value a drag must start from.
 *
 * In assembly mode that is the number in `file.bones`. With an animation open
 * it is what the animation shows at `doc.time`, which is a different number as
 * soon as the property is keyed — starting from the setup value there would make
 * the bone jump the moment the pointer moves.
 */
export function readBoneNow(doc: EditorDoc, name: string, key: BoneKey): number {
  if (doc.animation === null) return readBone(doc, name, key);
  const value = currentValueOf(doc, boneTarget(name, key));
  return typeof value === 'number' ? value : readBone(doc, name, key);
}

/**
 * THE one door the transform tools write through.
 *
 * Assembly mode writes the setup pose, exactly as before. With an animation open
 * it writes keys instead and the setup pose is never touched — that is the whole
 * rule of `anim/pose-mode.ts`, and a tool that builds a `SetProperty` by hand
 * quietly destroys the artist's rest pose.
 *
 * Returns what happened, so the caller can stop a drag that is being refused.
 */
export function writeBoneValues(
  doc: EditorDoc,
  label: string,
  mergeKey: string,
  values: ReadonlyArray<{ bone: string; key: BoneKey; value: number }>,
): PoseOutcome {
  if (doc.animation === null) {
    corpoDe(doc).run(setProperties(doc, label, mergeKey, [...values]));
    return 'montagem';
  }
  return keyValuesNow(
    doc,
    values.map((item) => ({ target: boneTarget(item.bone, item.key), value: item.value })),
    label,
    mergeKey,
  );
}

// ---------------------------------------------------------------------------
// Frames: world <-> the space a bone's local pose lives in
// ---------------------------------------------------------------------------

/**
 * The frame a bone's local pose is expressed in: its parent's world matrix,
 * or the skeleton's own placement for a bone without a parent.
 */
export function parentFrame(skeleton: Skeleton, boneName: string): Matrix2x3 {
  const bone = skeleton.findBone(boneName);
  const parent = bone?.parent ?? null;
  if (parent !== null) {
    return {
      a: parent.a, b: parent.b, c: parent.c, d: parent.d,
      worldX: parent.worldX, worldY: parent.worldY,
    };
  }
  return {
    a: skeleton.scaleX, b: 0, c: 0, d: skeleton.scaleY,
    worldX: skeleton.x, worldY: skeleton.y,
  };
}

/** The bone's own world matrix, or the identity while it is not loaded. */
export function boneFrame(skeleton: Skeleton, boneName: string): Matrix2x3 {
  const bone = skeleton.findBone(boneName);
  if (bone === null) return identityMatrix();
  return { a: bone.a, b: bone.b, c: bone.c, d: bone.d, worldX: bone.worldX, worldY: bone.worldY };
}

/** A world MOVEMENT (not a point) expressed in the frame's own axes. */
export function worldDeltaToFrame(frame: Matrix2x3, worldDX: number, worldDY: number): Vector2 {
  const inverse = invertMatrix(frame);
  return { x: inverse.a * worldDX + inverse.b * worldDY, y: inverse.c * worldDX + inverse.d * worldDY };
}

/** A world POINT expressed in the frame's own coordinates. */
export function worldPointToFrame(frame: Matrix2x3, worldX: number, worldY: number): Vector2 {
  return inverseTransformPoint(frame, worldX, worldY);
}

/**
 * `+1` when turning the local rotation counter-clockwise also turns the bone
 * counter-clockwise on screen, `-1` when the parent mirrors it.
 */
export function frameHandedness(frame: Matrix2x3): number {
  return matrixDeterminant(frame) < 0 ? -1 : 1;
}

/** World angle, in degrees, from a pivot to a point. */
export function angleTo(pivotX: number, pivotY: number, x: number, y: number): number {
  return atan2Deg(y - pivotY, x - pivotX);
}

/** Shortest way from angle `from` to angle `to`, in degrees, inside -180..180. */
export function angleDelta(from: number, to: number): number {
  let delta = (to - from) % 360;
  if (delta > 180) delta -= 360;
  if (delta < -180) delta += 360;
  return delta;
}

/** World origin of a bone, which is the pivot every rotation turns around. */
export function bonePivot(skeleton: Skeleton, boneName: string): Vector2 {
  const bone = skeleton.findBone(boneName);
  return bone === null ? { x: 0, y: 0 } : { x: bone.worldX, y: bone.worldY };
}

/** Bones the tools act on: the selection, in file order. */
export function selectedBones(doc: EditorDoc): string[] {
  const chosen = new Set(doc.selection.bones);
  return corpoDe(doc).file.bones.map((def) => def.name).filter((name) => chosen.has(name));
}

/** Quanto uma seta anda, em unidades de mundo. `Shift` anda dez. */
export const NUDGE_STEP = 1;
export const NUDGE_STEP_BIG = 10;

/** As quatro setas, e o que cada uma soma. `null` para outra tecla. */
export function nudgeFor(
  key: string, shift: boolean,
): { dx: number; dy: number } | null {
  const step = shift ? NUDGE_STEP_BIG : NUDGE_STEP;
  switch (key) {
    case 'ArrowLeft': return { dx: -step, dy: 0 };
    case 'ArrowRight': return { dx: step, dy: 0 };
    // Y aponta para CIMA no mundo, então a seta para cima soma.
    case 'ArrowUp': return { dx: 0, dy: step };
    case 'ArrowDown': return { dx: 0, dy: -step };
    default: return null;
  }
}

/**
 * Anda com o que está escolhido, um pixel de mundo por vez — item 53.
 *
 * O mouse não acerta um pixel; a seta acerta sempre. É o gesto de ajuste fino
 * que todo programa de desenho tem, e é o último passo de encaixar uma peça.
 *
 * Passa por `writeBoneValues`, que é a MESMA porta das ferramentas: em Montagem
 * escreve a pose de repouso, em Animando grava a chave. Devolve quantos ossos
 * andaram.
 */
export function nudgeSelection(doc: EditorDoc, dx: number, dy: number): number {
  const skeleton = doc.skeleton;
  // Item P3, 13/09/2026: os que mandam, e não todos os escolhidos. Com pai e
  // filho na mesma seleção, o filho andava DUAS vezes — o mesmo defeito que o
  // arrasto já tinha (item 2.1). A seta e o mouse fazem a mesma conta.
  const names = topLevelBones(corpoDe(doc).file, selectedBones(doc));
  if (skeleton === null || names.length === 0) return 0;
  const values: Array<{ bone: string; key: BoneKey; value: number }> = [];
  for (const name of names) {
    const frame = parentFrame(skeleton, name);
    const local = worldDeltaToFrame(frame, dx, dy);
    values.push({ bone: name, key: 'x', value: readBoneNow(doc, name, 'x') + local.x });
    values.push({ bone: name, key: 'y', value: readBoneNow(doc, name, 'y') + local.y });
  }
  // Rodada 46, lote 1: o passo diz quanto andou ("Andar 10 px com o osso").
  writeBoneValues(doc, nudgeLabel(dx, dy, 'o osso'), newMergeKey('nudge'), values);
  doc.endMerge?.();
  return names.length;
}

/** Counter that gives every new drag its own merge key. */
let dragCounter = 0;
export function newMergeKey(prefix: string): string {
  dragCounter += 1;
  return `${prefix}:${dragCounter}`;
}

// ---------------------------------------------------------------------------
// Drawing helpers shared by the overlays
// ---------------------------------------------------------------------------

/** Colours of the handles. Strong contrast, the same in every tool. */
export const HANDLE = Object.freeze({
  axisX: '#d92b2b',
  axisY: '#0f8a35',
  free: '#1b52d6',
  guide: '#8a5a00',
  ghost: '#111111',
});

/**
 * Draws a line whose thickness does not change with the zoom.
 * `scale` is screen pixels per world unit.
 */
export function strokeLine(
  ctx: CanvasRenderingContext2D, scale: number, color: string, pixels: number,
  x1: number, y1: number, x2: number, y2: number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = pixels / scale;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

/** Draws a filled square handle of a fixed size on screen. */
export function fillHandle(
  ctx: CanvasRenderingContext2D, scale: number, color: string, pixels: number, x: number, y: number,
): void {
  const half = pixels / scale / 2;
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(x - half, y - half, half * 2, half * 2);
  ctx.restore();
}

/** Draws a circle of a fixed size on screen. */
export function strokeCircle(
  ctx: CanvasRenderingContext2D, scale: number, color: string, pixels: number,
  x: number, y: number, radiusPixels: number,
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = pixels / scale;
  ctx.beginPath();
  ctx.arc(x, y, radiusPixels / scale, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// ---------------------------------------------------------------------------
// The tool itself
// ---------------------------------------------------------------------------

/** Screen size of the selection marker drawn on each selected bone. */
const MARKER_PIXELS = 14;
/** A press shorter than this, in screen pixels, is a click and not a box. */
const BOX_DEAD_PIXELS = 4;

/**
 * O que um clique aponta, no gesto de pegar filhos.
 *
 * Clicou no traço do osso, é o osso. Clicou no desenho, é o **slot** dele —
 * é o desenho que o Humberto está vendo e apontando, e prender o osso do
 * desenho levaria junto tudo o mais que estivesse pendurado nele.
 */
function targetOf(pick: Pick): GrabTarget {
  return pick.kind === 'bone' || pick.slot === null
    ? { kind: 'bone', name: pick.bone }
    : { kind: 'slot', name: pick.slot };
}

/** The locks in force right now, as picking wants them. */
export function pickLocks(): PickLocks {
  return currentLocks(viewSettings());
}

/**
 * The tool "Selecionar".
 *
 *   click                 selects the thing under the pointer (Shift adds)
 *   Alt + click again     walks down through things that overlap
 *   drag over empty space draws a box; Shift adds, Ctrl removes
 *   P held, one bone      "pegar filhos": each click hangs one under it
 *   P, anything else      only says what to do (lote 63a: one gesture only)
 *   Esc                   clears the selection, or leaves the P gesture
 *
 * Locked things are skipped everywhere: see `onion.ts`, `PickLocks`.
 */
class SelectTool implements Tool {
  readonly id = 'select';
  readonly label = 'Selecionar';
  readonly shortcut = 'q';

  /** Last click position, so Alt keeps cycling through the same stack. */
  private lastX = Number.NaN;
  private lastY = Number.NaN;
  private lastHit: Pick | null = null;
  private cycle = 0;

  /** The box being dragged, in world units, or `null`. */
  private box: WorldRect | null = null;
  private boxMode: BoxMode = 'replace';
  private boxScale = 1;
  private boxMoved = false;

  /** O gesto do lote 31 enquanto o P está embaixo, ou `null`. */
  private grab: ChildGrab | null = null;
  /**
   * O filho escolhido quando o P desceu sem osso (rodada 23): o próximo clique
   * num osso, com o P ainda embaixo, diz o passo que falta. `null` fora disso.
   */
  private pSemOsso: string | null = null;
  private calarSemOsso: (() => void) | null = null;

  /** Fim do recado do P sem osso: a tecla subiu, ou a ferramenta saiu. */
  private stopTeaching(): void {
    this.pSemOsso = null;
    this.calarSemOsso?.();
    this.calarSemOsso = null;
  }

  /** Para os testes e para o cursor: o P está segurado pegando filhos? */
  get grabbingChildren(): boolean {
    return this.grab !== null;
  }

  cursorClass(): string | null {
    return this.grab !== null ? 'is-pegando-filhos' : null;
  }

  onExit(): void {
    this.grab = null;
    this.stopTeaching();
    this.box = null;
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    const skeleton = doc.skeleton;
    const locks = pickLocks();
    const sameSpot = Math.abs(e.x - this.lastX) * e.scale < 3
      && Math.abs(e.y - this.lastY) * e.scale < 3;
    this.cycle = e.alt && sameSpot ? this.cycle + 1 : 0;
    this.lastX = e.x;
    this.lastY = e.y;

    // Rodada 11: numa entidade em volta que já está escolhida, o meio dela (que
    // não é desenhado, mas está riscado na cena) continua pegando o clique.
    const escolhidos = [...doc.selection.slots, ...doc.selection.attachments.map((a) => a.slot)];
    const hits = pickAll(skeleton, e.x, e.y, e.scale, withChosen(locks, escolhidos));
    const hit = hits.length === 0 ? null : hits[((this.cycle % hits.length) + hits.length) % hits.length];
    this.lastHit = hit;

    if (this.grab !== null) {
      // Segurando P: o clique prende (ou solta) um filho e NÃO mexe na
      // seleção — o pai tem que continuar escolhido até a tecla subir.
      // A trava é ignorada aqui pelo mesmo motivo de sempre: ela para o
      // mover, não o pendurar.
      // Lote 69: o P numa malha SAIU. Ele ligava o osso à malha (lote 63) —
      // gesto que nem o Spriter, nem o Spine, nem o DragonBones têm, e que só
      // valia com esta ferramenta na mão. Quem liga osso à malha agora é o
      // botão **Ligar** da aba Malha e pesos. Aqui o P volta a fazer uma coisa
      // só: prender filhos, malha ou imagem inteira, tanto faz.
      const under = pickAll(skeleton, e.x, e.y, e.scale);
      const top = under[0] ?? null;
      this.grabOne(doc, top === null ? null : targetOf(top));
      return;
    }

    if (hit === null) {
      // Empty space: maybe a click that clears, maybe the start of a box.
      // Decided on release, when we know whether the pointer moved.
      this.box = { x1: e.x, y1: e.y, x2: e.x, y2: e.y };
      this.boxMode = e.ctrl ? 'remove' : e.shift ? 'add' : 'replace';
      this.boxScale = e.scale;
      this.boxMoved = false;
      return;
    }
    const file = corpoDe(doc).file;
    // Rodada 46, lote 4 (doc `66`, §2.4): Ctrl+clique também soma, como no
    // Spine; o Shift continua. E o rodapé diz quantos e quais.
    const soma = e.shift || e.ctrl;
    doc.select(selectionFor(doc.selection, hit, soma, file.bones?.[0]?.name ?? null, (slot) => clickKeepsBone(file, slot)));
    if (soma) {
      const sel = doc.selection;
      // Rodada 46, lote 5 (nota (d) do doc `80`): osso e desenho somados, os dois contam.
      const boneOfSlot = (slot: string): string | null => (file.slots ?? []).find((s) => s.name === slot)?.bone ?? null;
      const nomes = [...handPickedBones(sel, boneOfSlot), ...sel.attachments.map((a) => a.slot), ...sel.slots];
      const dito = chosenNotice(nomes);
      if (dito !== null) doc.notice(dito);
    }
    // Rodada 8d: a peça que não anda sozinha diz por quê, na hora do clique.
    if (hit.kind === 'attachment' && hit.slot !== null && hit.bone !== file.bones?.[0]?.name) {
      const why = clickKeepsBoneNotice(file, hit.slot, hit.bone);
      if (why !== null) doc.notice(why);
    }
  }

  onMove(_doc: EditorDoc, e: ToolEvent): void {
    const box = this.box;
    if (box === null) return;
    box.x2 = e.x;
    box.y2 = e.y;
    if (Math.abs(box.x2 - box.x1) * this.boxScale >= BOX_DEAD_PIXELS
      || Math.abs(box.y2 - box.y1) * this.boxScale >= BOX_DEAD_PIXELS) {
      this.boxMoved = true;
    }
  }

  onUp(doc: EditorDoc, e: ToolEvent): void {
    const box = this.box;
    if (box === null) return;
    this.box = null;
    box.x2 = e.x;
    box.y2 = e.y;
    if (!this.boxMoved) {
      // A plain click on nothing clears; with Shift or Ctrl it leaves things be.
      if (this.boxMode === 'replace') doc.select(emptySelection());
      return;
    }
    const hits = pickInRect(doc.skeleton, box, pickLocks());
    doc.select(selectionForPicks(doc.selection, hits, this.boxMode));
  }

  onKey(doc: EditorDoc, key: string): boolean {
    if (key === 'Escape') {
      if (this.grab !== null) {
        this.closeGrab(doc);
        return true;
      }
      if (this.box !== null) {
        this.box = null;
        return true;
      }
      doc.select(emptySelection());
      return true;
    }
    if (key === 'p' || key === 'P') {
      // A tecla segurada repete o keydown sozinha. Já estando no gesto, cada
      // repetição não pode ligar e desligar o modo debaixo do dedo.
      if (this.grab !== null) return true;
      // Lote 63a: um gesto só. Sem um osso só escolhido, o P só diz o que fazer.
      if (parentGesture(doc.selection) === 'nada') {
        if (this.calarSemOsso !== null) return true;
        const filho = childInSelection(doc.selection);
        this.pSemOsso = filho;
        doc.notice(chooseBoneNotice(filho));
        // Rodada 23: com o P ainda embaixo, o clique num osso (por qualquer
        // ferramenta, ou pela Árvore) escolhe o osso e diz o passo que falta.
        if (filho !== null) {
          this.calarSemOsso = doc.on((change) => {
            if (change.kind !== 'selection' || doc.selection.bones.length !== 1) return;
            const osso = doc.selection.bones[0]!;
            this.stopTeaching();
            doc.notice(boneFirstNotice(osso, filho));
          });
        }
        return true;
      }
      const parent = doc.selection.bones[0]!;
      this.grab = new ChildGrab(parent);
      doc.notice(grabOpenNotice(parent));
      return true;
    }
    return false;
  }

  onKeyUp(doc: EditorDoc, key: string): boolean {
    if (key !== 'p' && key !== 'P') return false;
    this.stopTeaching();
    // Soltar a tecla só termina o gesto de segurar. O modo "clique no pai",
    // que é o de antes, é um interruptor: ele espera o clique, não o dedo.
    if (this.grab === null) return false;
    this.closeGrab(doc);
    return true;
  }

  /**
   * Um clique numa linha da Árvore com o P segurado — lote 64. O mesmo passo
   * do clique na cena. `false` quando não há gesto aberto: aí a linha escolhe,
   * como sempre.
   */
  grabFromTree(doc: EditorDoc, target: GrabTarget): boolean {
    if (this.grab === null) return false;
    this.grabOne(doc, target);
    return true;
  }

  /** Um clique dentro do gesto: um comando, um passo de desfazer, um recado. */
  private grabOne(doc: EditorDoc, target: GrabTarget | null): void {
    const grab = this.grab;
    if (grab === null) return;
    const step = grab.click(corpoDe(doc).file, target, doc.animation === null ? undefined : appliedParents(doc));
    if (step.do !== 'nada') {
      // Para onde o alvo vai, em cada um dos quatro passos. `trocar` vai para
      // o pai como qualquer outro: quem vê que é uma troca é a porta única
      // (`runReparent`), e é lá que ela acontece, num passo de desfazer só.
      const to = step.do === 'soltar' ? step.back
        : step.do === 'desafilhar' ? step.to
        : grab.parent;
      const selection: Selection = {
        ...emptySelection(),
        bones: step.target.kind === 'bone' ? [step.target.name] : [],
        slots: step.target.kind === 'slot' ? [step.target.name] : [],
      };
      const label = step.do === 'prender' ? `${step.target.name} vira filho de ${to}`
        : step.do === 'desafilhar' ? `${step.target.name} fica solto`
        : step.do === 'trocar' ? `${step.target.name} e ${to} trocam de lugar`
        : `${step.target.name} volta para ${to}`;
      // A porta é a mesma dos outros três caminhos — lote 34 —, e é ela que
      // guarda a pose de mundo e sai de Animando. `quiet` porque o recado
      // deste gesto é o de baixo, com o nome do filho.
      const saida = runReparent(doc, selection, to, label, { quiet: true });
      doc.notice(stepNotice(step, grab.parent) + reparentExtra(saida));
      return;
    }
    doc.notice(stepNotice(step, grab.parent));
  }

  /**
   * O gesto aberto pelo menu Base → *Virar filho de…* — rodada 17, J2. O mesmo
   * `ChildGrab` do P, sem a tecla embaixo: ele fica aberto até o Esc, ou o
   * item do menu outra vez (ou um P apertado e solto). Devolve `false`
   * quando a seleção não é um osso só (aí quem chama dá o recado).
   */
  openGrabFromMenu(doc: EditorDoc): boolean {
    if (this.grab !== null) {
      this.closeGrab(doc);
      return true;
    }
    if (parentGesture(doc.selection) !== 'pegar-filhos') return false;
    const parent = doc.selection.bones[0]!;
    this.grab = new ChildGrab(parent);
    doc.notice(grabMenuNotice(parent));
    return true;
  }

  /** Fim do gesto, pela tecla ou pelo Esc. O que foi preso fica preso. */
  private closeGrab(doc: EditorDoc): void {
    const grab = this.grab;
    if (grab === null) return;
    this.grab = null;
    doc.notice(grabCloseNotice(grab.parent, grab.count));
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    // Item P1: com o P segurado, quem já é filho do osso escolhido fica
    // pintado. É o primeiro traço do gesto, antes de qualquer alça.
    if (this.grab !== null) paintGrabChildren(doc, ctx, scale, this.grab.parent);
    for (const name of doc.selection.bones) {
      const pivot = bonePivot(skeleton, name);
      strokeCircle(ctx, scale, HANDLE.free, 2, pivot.x, pivot.y, MARKER_PIXELS / 2);
    }
    const box = this.box;
    if (box !== null && this.boxMoved) {
      ctx.save();
      ctx.fillStyle = 'rgba(27, 82, 214, 0.10)';
      ctx.fillRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.strokeStyle = HANDLE.free;
      ctx.lineWidth = 1.5 / scale;
      ctx.setLineDash([6 / scale, 4 / scale]);
      ctx.strokeRect(box.x1, box.y1, box.x2 - box.x1, box.y2 - box.y1);
      ctx.restore();
    }
  }
}

// O tipo é a classe, e não `Tool`, por causa dos dois avisos de gesto que os
// testes leem: `waitingForParent` e `grabbingChildren`. Um `as Tool` na hora
// de registrar mantém o registro igual ao das outras ferramentas.
/**
 * A pintura do gesto do `P` — item P1, 13/09/2026.
 *
 * O Humberto, sobre o Spriter: *"os ossos deviam mostrar quem é filho desse
 * osso; o Spriter faz isso com cor e opacidade leve, aí eu posso clicar para
 * transformar em filho ou desafilhar."*
 *
 * Verde, e por baixo de tudo o que o overlay desenha depois: a pintura conta
 * quem já está preso, não escolhe nada. Osso filho leva um traço grosso por
 * cima do osso; desenho filho leva o contorno. Quem é filho é o módulo puro
 * (`grabChildren`) que diz; aqui só se pinta.
 *
 * Opacidade leve de propósito: com o traço cheio, a cena de um personagem
 * montado vira uma mancha verde e some o desenho debaixo.
 */
const GRAB_COLOR = HANDLE.axisY;
const GRAB_ALPHA = 0.45;

export function paintGrabChildren(
  doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number, parent: string,
): void {
  const skeleton = doc.skeleton;
  if (skeleton === null) return;
  const filhos = grabChildren(corpoDe(doc).file, parent, doc.animation === null ? undefined : appliedParents(doc));
  if (filhos.bones.length === 0 && filhos.slots.length === 0) return;
  ctx.save();
  ctx.globalAlpha = GRAB_ALPHA;
  for (const name of filhos.bones) {
    const bone = skeleton.findBone(name);
    if (bone === null) continue;
    const length = bone.data.length;
    if (length > 0) {
      strokeLine(
        ctx, scale, GRAB_COLOR, 7,
        bone.worldX, bone.worldY, bone.worldX + bone.a * length, bone.worldY + bone.c * length,
      );
    }
    strokeCircle(ctx, scale, GRAB_COLOR, 3, bone.worldX, bone.worldY, MARKER_PIXELS / 2);
  }
  const slots = new Set(filhos.slots);
  for (const drawable of collectDrawables(skeleton)) {
    if (!slots.has(drawable.slot.data.name)) continue;
    const shape = drawable.attachment as unknown as {
      computeWorldVertices?: (slot: unknown) => Float64Array;
      hull?: number; vertexCount?: number;
    };
    if (typeof shape.computeWorldVertices !== 'function') continue;
    const vertices = shape.computeWorldVertices(drawable.slot);
    const hull = shape.hull ?? 0;
    const count = hull > 2 ? hull : (shape.vertexCount ?? 4);
    ctx.beginPath();
    for (let i = 0; i < count; i++) {
      const x = vertices[i * 2] ?? 0;
      const y = vertices[i * 2 + 1] ?? 0;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = GRAB_COLOR;
    ctx.lineWidth = 4 / scale;
    ctx.stroke();
  }
  ctx.restore();
}

export const selectTool = new SelectTool();
registerTool(selectTool as Tool);

// Re-exported so the viewport does not import the picking module twice.
export { pickAt, samePick };
