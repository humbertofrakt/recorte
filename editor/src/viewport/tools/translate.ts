/**
 * Tool "Mover" (owner B): drags the selected bones.
 *
 * The pointer moves in world units. The value written is the bone's LOCAL
 * `x` and `y`, so the world movement is first expressed in the parent's own
 * axes. A bone under a parent turned by 90 degrees therefore still follows
 * the pointer exactly.
 *
 * SPACE (requirement R7). The arrows, and the axis Shift locks to, follow the
 * space chosen in the toolbar: the bone's own axes (Local), the parent's axes
 * (Pai) or the screen's (Mundo). What is WRITTEN is always the parent-relative
 * `x` and `y`, because that is the only thing the file has — see `space.ts`.
 *
 * COMPENSATION (requirement R7). With a switch on, the children and the
 * drawings keep their place on screen while the bone alone moves. The maths is
 * in `compensate.ts`; here it is two calls: a snapshot when the pointer goes
 * down, and one write after every move.
 */

import {
  registerTool,
  type EditorDoc,
  type Selection,
  type Tool,
  type ToolEvent, corpoDe
} from '../../contract.js';
import { pickAt, type Pick } from '../picking.js';
import { currentLocks, viewSettings } from '../onion.js';
import { CloneDrag } from '../../doc/duplicate.js';
import { GUIDE_SNAP_PIXELS, snapPoint } from '../guides-model.js';
import { topLevelBones } from '../../doc/bones.js';
import type { BoneFile, Matrix2x3 } from '../../../../runtime/src/index.js';
import {
  HANDLE,
  bonePivot,
  fillHandle,
  newMergeKey,
  parentFrame,
  readBoneNow,
  selectedBones,
  strokeLine,
  worldDeltaToFrame,
  writeBoneValues,
} from './select.js';
import { GestureFooter } from './gesture-footer.js';
import {
  frameAxes, getHandleSpace, lockAxisInFrame, spaceFrame,
} from './space.js';
import { applyCompensation, planCompensation, type CompensationPlan } from './compensate.js';
import {
  ensureOwnBones, ownBoneNow, pickedAttachment, startAttachmentDrag, worldDeltaToBone, writeAttachmentValues,
  type PickedAttachment,
} from './attachment-edit.js';
import { DrawingGroupDrag, drawingsCenter, pickedDrawings } from './drawing-group.js';


/**
 * Os ossos que o arrasto move de verdade: os escolhidos, sem os que já vêm
 * de carona no pai. É o que as quatro ferramentas de transformar chamam no
 * lugar de `selectedBones`.
 *
 * A conta de quem manda é do `doc/bones.ts` desde o lote do `P` (v12.1) — as
 * setas do teclado precisam dela também. O `topLevelBones` continua saindo
 * daqui para quem já o importava.
 */
export function draggedBones(doc: EditorDoc): string[] {
  return topLevelBones(corpoDe(doc).file, selectedBones(doc));
}

export { topLevelBones } from '../../doc/bones.js';

/** Length of the drawn arrows, in screen pixels. */
const ARROW_PIXELS = 62;
/** Size of the square handle at the bone origin, in screen pixels. */
const CENTER_PIXELS = 9;

interface DragBone {
  name: string;
  startX: number;
  startY: number;
  frame: Matrix2x3;
}

interface Drag {
  bones: DragBone[];
  originX: number;
  originY: number;
  mergeKey: string;
  axis: 'none' | 'x' | 'y';
  /** Axes Shift locks to, taken once so the lock does not wander mid-drag. */
  spaceFrame: Matrix2x3;
  plan: CompensationPlan;
  /** O DESENHO sendo movido, quando não há osso escolhido — item 2. */
  attachment: PickedAttachment | null;
  /** O ponto que o ímã das guias leva: o pivô do primeiro osso, ou a âncora do desenho. */
  anchor: { x: number; y: number };
}

/** Ctrl + arrastar em andamento — lote 42. */
interface CloneState {
  selection: Selection;
  originX: number;
  originY: number;
  anchor: { x: number; y: number };
  axis: 'none' | 'x' | 'y';
  /** O clone de agora, que sai quando o ponteiro anda. */
  last: CloneDrag | null;
}

/**
 * Ctrl + arrastar clona quando o ponteiro está EM CIMA do que está escolhido —
 * lote 42. No vazio, ou em outra coisa, o Ctrl não clona: o arrasto é o de
 * sempre. São dois alvos diferentes, e quem decide é o que está embaixo.
 */
export function clonesUnderPointer(selection: Selection, hit: Pick | null): boolean {
  if (hit === null) return false;
  if (selection.bones.includes(hit.bone)) return true;
  if (hit.slot !== null && selection.slots.includes(hit.slot)) return true;
  return selection.attachments.some((a) => a.slot === hit.slot && a.attachment === hit.attachment);
}

/**
 * O ímã das guias: o deslocamento que leva `anchor` para a guia mais perto,
 * a até 6 px de tela. Com as guias escondidas, ou sem guia, nada muda.
 */
export function snapDelta(
  anchor: { x: number; y: number }, dx: number, dy: number, zoom: number,
): { dx: number; dy: number } {
  const view = viewSettings();
  if (!view.showGuides || view.guides.length === 0) return { dx, dy };
  const tolerance = GUIDE_SNAP_PIXELS / (zoom > 1e-9 ? zoom : 1e-9);
  const p = snapPoint(anchor.x + dx, anchor.y + dy, view.guides, tolerance);
  return { dx: p.x - anchor.x, dy: p.y - anchor.y };
}

/**
 * World movement after Shift has locked it to a WORLD axis.
 *
 * Kept for the tests and for the Mundo space, where it is exactly what
 * `lockAxisInFrame` does with the identity frame.
 */
export function lockAxis(
  dx: number, dy: number, shift: boolean, current: 'none' | 'x' | 'y',
): { dx: number; dy: number; axis: 'none' | 'x' | 'y' } {
  if (!shift) return { dx, dy, axis: 'none' };
  let axis = current;
  if (axis === 'none') {
    if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return { dx, dy, axis: 'none' };
    axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
  }
  return axis === 'x' ? { dx, dy: 0, axis } : { dx: 0, dy, axis };
}

class TranslateTool implements Tool {
  readonly id = 'translate';
  readonly label = 'Mover';
  readonly shortcut = 'w';

  private drag: Drag | null = null;
  private clone: CloneState | null = null;
  /** Dois ou mais desenhos soltos andando juntos — lote 60a. */
  private group: {
    drag: DrawingGroupDrag; originX: number; originY: number;
    axis: 'none' | 'x' | 'y'; anchor: { x: number; y: number };
  } | null = null;

  /** Uma imagem sem osso próprio esperando o primeiro movimento, numa animação (8d). */
  private pending: { attachment: PickedAttachment; origin: ToolEvent; mergeKey: string } | null = null;

  onExit(): void {
    this.drag = null;
    this.clone = null;
    this.group = null;
    this.pending = null;
  }

  /** O número no rodapé enquanto arrasta — rodada 46, lote 1 (`gesture-footer.ts`). */
  private readonly footer = new GestureFooter();

  onDown(doc: EditorDoc, e: ToolEvent): void {
    this.downInner(doc, e);
    if (e.button === 0) this.footer.start(doc, draggedBones(doc)[0] ?? null, e.x, e.y);
  }

  private downInner(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    const names = draggedBones(doc);
    // Ctrl + arrastar em cima do escolhido: clona, e o arrasto leva o clone —
    // lote 42. Só na Montagem: clonar é estrutura, e estrutura não se anima.
    if (e.ctrl && doc.animation === null
      && clonesUnderPointer(doc.selection, pickAt(skeleton, e.x, e.y, e.scale, 0, currentLocks()))) {
      const anexo = names.length === 0 ? pickedAttachment(doc) : null;
      this.clone = {
        selection: { ...doc.selection },
        originX: e.x,
        originY: e.y,
        anchor: names.length > 0 ? bonePivot(skeleton, names[0]!) : anexo?.anchor ?? { x: e.x, y: e.y },
        axis: 'none',
        last: null,
      };
      return;
    }
    if (names.length === 0) {
      // Sem osso escolhido, mas com um desenho: mexe no desenho — item 2.
      const attachment = pickedAttachment(doc);
      if (attachment === null) {
        // Dois ou mais desenhos soltos: andam todos juntos — lote 60a.
        const items = pickedDrawings(doc);
        if (items === null) return;
        startAttachmentDrag();
        this.group = {
          drag: new DrawingGroupDrag(items, 'Mover desenhos', newMergeKey('translate-imagens')),
          originX: e.x, originY: e.y, axis: 'none', anchor: drawingsCenter(doc) ?? { x: e.x, y: e.y },
        };
        return;
      }
      startAttachmentDrag();
      // Rodada 8d: a imagem com osso próprio anda pelo osso dela — na base,
      // a pose de repouso dele; numa animação, a chave. Sem osso próprio,
      // numa animação, ele nasce no primeiro movimento (`pending`).
      const own = ownBoneNow(doc, attachment.slot);
      if (own !== null) {
        this.drag = this.boneDrag(doc, [own], e, newMergeKey('translate-imagem'), false);
        return;
      }
      if (doc.animation !== null) {
        this.pending = { attachment, origin: e, mergeKey: newMergeKey('translate-imagem') };
        return;
      }
      this.drag = {
        bones: [], originX: e.x, originY: e.y, mergeKey: newMergeKey('translate-anexo'),
        axis: 'none', spaceFrame: { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 },
        plan: planCompensation(doc, []), attachment, anchor: { ...attachment.anchor },
      };
      return;
    }
    this.drag = this.boneDrag(doc, names, e, newMergeKey('translate'), true);
  }

  /**
   * O arrasto de ossos. `compensate` é falso para o osso próprio de uma
   * imagem (8d): "não mexer nos filhos" deixaria a própria imagem parada.
   */
  private boneDrag(doc: EditorDoc, names: string[], e: ToolEvent, mergeKey: string, compensate: boolean): Drag {
    const skeleton = doc.skeleton!;
    return {
      anchor: bonePivot(skeleton, names[0]!),
      attachment: null,
      bones: names.map((name) => ({
        name,
        startX: readBoneNow(doc, name, 'x'),
        startY: readBoneNow(doc, name, 'y'),
        frame: parentFrame(skeleton, name),
      })),
      originX: e.x,
      originY: e.y,
      mergeKey,
      axis: 'none',
      spaceFrame: spaceFrame(skeleton, names[0]!, getHandleSpace()),
      plan: planCompensation(doc, compensate ? names : []),
    };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    this.moveInner(doc, e);
    // O clone tem o recado dele ao soltar; o resto diz quanto andou.
    if (this.clone === null) this.footer.say(doc, { kind: 'move' }, e.x, e.y);
  }

  private moveInner(doc: EditorDoc, e: ToolEvent): void {
    const clone = this.clone;
    if (clone !== null) {
      this.moveClone(doc, clone, e);
      return;
    }
    const group = this.group;
    if (group !== null) {
      const locked = lockAxis(e.x - group.originX, e.y - group.originY, e.shift, group.axis);
      group.axis = locked.axis;
      const move = e.shift ? locked : snapDelta(group.anchor, locked.dx, locked.dy, e.scale);
      group.drag.write(doc, { kind: 'move', dx: move.dx, dy: move.dy });
      return;
    }
    const pending = this.pending;
    if (pending !== null) {
      // O primeiro movimento de uma imagem sem osso próprio, numa animação:
      // o osso nasce agora, e o arrasto passa a ser dele (8d).
      this.pending = null;
      const bones = ensureOwnBones(doc, [pending.attachment], pending.mergeKey, 'Mover imagem');
      const own = bones?.get(pending.attachment.slot);
      if (own === undefined || doc.skeleton === null) return;
      this.drag = this.boneDrag(doc, [own], pending.origin, `${pending.mergeKey}:chave`, false);
    }
    const drag = this.drag;
    if (drag === null) return;
    if (drag.attachment !== null) {
      const locked = lockAxis(e.x - drag.originX, e.y - drag.originY, e.shift, drag.axis);
      drag.axis = locked.axis;
      // Com Shift o eixo está preso, e o ímã não pode soltá-lo.
      const move = e.shift ? locked : snapDelta(drag.anchor, locked.dx, locked.dy, e.scale);
      const local = worldDeltaToBone(drag.attachment.bone, move.dx, move.dy);
      writeAttachmentValues(doc, drag.attachment, 'Mover desenho', [
        { field: 'x', value: drag.attachment.x + local.x },
        { field: 'y', value: drag.attachment.y + local.y },
      ]);
      return;
    }
    const locked = lockAxisInFrame(
      drag.spaceFrame, e.x - drag.originX, e.y - drag.originY, e.shift, drag.axis,
    );
    drag.axis = locked.axis;
    const move = e.shift ? locked : snapDelta(drag.anchor, locked.dx, locked.dy, e.scale);

    const values: Array<{ bone: string; key: 'x' | 'y'; value: number }> = [];
    for (const bone of drag.bones) {
      const local = worldDeltaToFrame(bone.frame, move.dx, move.dy);
      values.push({ bone: bone.name, key: 'x', value: bone.startX + local.x });
      values.push({ bone: bone.name, key: 'y', value: bone.startY + local.y });
    }
    writeBoneValues(doc, 'Mover osso', drag.mergeKey, values);
    applyCompensation(doc, drag.plan, drag.mergeKey);
  }

  onUp(doc: EditorDoc): void {
    const clone = this.clone;
    this.clone = null;
    if (clone !== null) {
      if (clone.last !== null) {
        const n = clone.last.newBones.size + clone.last.newSlots.size;
        doc.notice(`${n} ${n === 1 ? 'item clonado' : 'itens clonados'} arrastando. Ctrl+Z desfaz num passo`);
      }
      doc.endMerge?.();
      return;
    }
    if (this.drag?.attachment != null || this.group !== null) doc.endMerge?.();
    this.drag = null;
    this.group = null;
    this.pending = null;
  }

  /**
   * Um passo do arrasto do clone.
   *
   * A pilha de desfazer APLICA antes de juntar, então juntar dois clones
   * deixaria dois. Por isso, a cada movimento, o clone de antes sai e entra
   * um novo no lugar de agora: no fim sobra **um** passo de desfazer, e o
   * original nunca se mexe.
   */
  private moveClone(doc: EditorDoc, clone: CloneState, e: ToolEvent): void {
    const locked = lockAxis(e.x - clone.originX, e.y - clone.originY, e.shift, clone.axis);
    clone.axis = locked.axis;
    const move = e.shift ? locked : snapDelta(clone.anchor, locked.dx, locked.dy, e.scale);
    if (clone.last !== null && doc.undoLabel === clone.last.label) doc.undo();
    const command = new CloneDrag(corpoDe(doc).file, clone.selection, { x: move.dx, y: move.dy });
    clone.last = null;
    if (!command.hasWork) return;
    corpoDe(doc).run(command);
    doc.select(command.selectionAfter());
    clone.last = command;
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    const arrow = ARROW_PIXELS / scale;
    // Com um desenho escolhido, a cruz fica na ÂNCORA dele — a raiz do osso
    // mais o `x`/`y` do anexo. Sem ela não se sabe em torno de que ponto o
    // giro e a escala do desenho acontecem.
    const anexo = pickedAttachment(doc);
    if (anexo !== null) {
      strokeLine(ctx, scale, HANDLE.guide, 2,
        anexo.anchor.x - arrow / 3, anexo.anchor.y, anexo.anchor.x + arrow / 3, anexo.anchor.y);
      strokeLine(ctx, scale, HANDLE.guide, 2,
        anexo.anchor.x, anexo.anchor.y - arrow / 3, anexo.anchor.x, anexo.anchor.y + arrow / 3);
      fillHandle(ctx, scale, HANDLE.guide, CENTER_PIXELS, anexo.anchor.x, anexo.anchor.y);
      return;
    }
    const space = getHandleSpace();
    for (const name of doc.selection.bones) {
      const pivot = bonePivot(skeleton, name);
      const axes = frameAxes(spaceFrame(skeleton, name, space));
      const ax = pivot.x + axes.x.x * arrow;
      const ay = pivot.y + axes.x.y * arrow;
      const bx = pivot.x + axes.y.x * arrow;
      const by = pivot.y + axes.y.y * arrow;
      strokeLine(ctx, scale, HANDLE.axisX, 3, pivot.x, pivot.y, ax, ay);
      strokeLine(ctx, scale, HANDLE.axisY, 3, pivot.x, pivot.y, bx, by);
      fillHandle(ctx, scale, HANDLE.axisX, CENTER_PIXELS, ax, ay);
      fillHandle(ctx, scale, HANDLE.axisY, CENTER_PIXELS, bx, by);
      fillHandle(ctx, scale, HANDLE.free, CENTER_PIXELS, pivot.x, pivot.y);
    }
  }
}

export const translateTool: Tool = new TranslateTool();
registerTool(translateTool);
