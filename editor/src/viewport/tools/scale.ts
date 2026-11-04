/**
 * Tool "Escalar" (owner B): stretches the selected bones.
 *
 * The pivot is the bone's world origin, the point its PARENT put it at, so
 * scaling never slides the bone away from where the parent holds it. The
 * pointer is read in the bone's own frame at the moment the drag starts: how
 * many times farther it went along the bone's X axis is how many times the
 * local `scaleX` grows. The Y axis works the same way.
 *
 * Holding Shift keeps the proportions (both axes get the same factor).
 *
 * SPACE (requirement R7). The frame the pointer is measured in follows the
 * toolbar: Local is the bone's own axes and is what the tool always did; Pai
 * measures along the parent's axes and Mundo along the screen's, which is what
 * an artist wants when the rig is tilted. The two numbers written are still
 * `scaleX` and `scaleY` of the bone, because that is all the file holds.
 *
 * COMPENSATION (requirement R7). With a switch on, the children and the
 * drawings stay put while only this bone stretches — see `compensate.ts`.
 */

import {
  registerTool,
  type EditorDoc,
  type Tool,
  type ToolEvent,
} from '../../contract.js';
import type { Matrix2x3 } from '../../../../runtime/src/index.js';
import {
  HANDLE,
  bonePivot,
  fillHandle,
  newMergeKey,
  readBoneNow,
  strokeLine,
  worldPointToFrame,
  writeBoneValues,
} from './select.js';
import { GestureFooter } from './gesture-footer.js';
import { frameAxes, getHandleSpace, spaceFrame } from './space.js';
import { draggedBones } from './translate.js';
import { applyCompensation, planCompensation, type CompensationPlan } from './compensate.js';
import {
  EMITTER_HAS_NO_SCALE, ensureOwnBones, ownBoneNow, pickedAttachment, startAttachmentDrag, writeAttachmentValues,
  type PickedAttachment,
} from './attachment-edit.js';
import { DrawingGroupDrag, drawingsCenter, pickedDrawings, type Point } from './drawing-group.js';


/** Distance of the drawn handles from the pivot, in screen pixels. */
const HANDLE_DISTANCE = 62;
const HANDLE_SIZE = 10;

/**
 * Closest the pointer may start to an axis before that axis stops scaling.
 * Below it the ratio would explode, so the axis is simply left alone.
 */
export const MIN_REFERENCE = 1e-3;

interface DragBone {
  name: string;
  startScaleX: number;
  startScaleY: number;
  frame: Matrix2x3;
  referenceX: number;
  referenceY: number;
  referenceLength: number;
}

interface Drag {
  bones: DragBone[];
  mergeKey: string;
  plan: CompensationPlan;
}

/** New scale from the reference distance and the current one. */
export function scaleFactor(reference: number, current: number): number {
  return Math.abs(reference) < MIN_REFERENCE ? 1 : current / reference;
}

/**
 * A menor distância de partida que a escala aceita, em pixels de tela —
 * rodada 46, lote 3 (doc `66`, §2.1; nota (a) do doc `73`). O meio do lado de
 * um osso fica a 16 px dele, e 20 px de mouse davam 3×; começar o arrasto
 * sobre a linha da origem dava "× −79". Com o mínimo, o mesmo arrasto anda
 * devagar e nunca explode.
 */
export const SCALE_MIN_REFERENCE_PIXELS = 32;

/**
 * Na escala LIVRE (canto, ou a ferramenta Escalar sem trava), um eixo que parte a
 * menos disto da linha do pivô, em pixels de tela, fica parado: dividir por quase
 * zero dava "× −79" (nota (a) do doc `73`). O rodapé diz.
 */
export const FREE_AXIS_MIN_PIXELS = 4;

/** O que o rodapé acrescenta quando a escala partiu de perto do pivô (nota (a) do doc `73`). */
export const NEAR_PIVOT_SUFFIX = ' · perto do pivô um eixo fica parado: comece mais longe';

/**
 * O fator com a distância de partida no mínimo `min`: abaixo dele, conta o
 * quanto o mouse ANDOU sobre `min`, em vez de dividir por quase nada. Começa
 * em 1, como `scaleFactor`, e é igual a ele quando a partida já é longe.
 */
export function dampedFactor(reference: number, current: number, min: number): number {
  if (Math.abs(reference) >= min) return scaleFactor(reference, current);
  const r = reference < 0 ? -min : min;
  return (r + current - reference) / r;
}

/**
 * Os dois fatores de um arrasto medido a partir de um ponto — o mesmo do
 * desenho sozinho: meio de lado trava um eixo, `Shift` é proporção.
 */
function factorsFrom(
  lock: 'x' | 'y' | null, shift: boolean, rx: number, ry: number, nx: number, ny: number, min = 0, minFree = 0,
): { fx: number; fy: number } {
  if (lock !== null) {
    const one = lock === 'x' ? dampedFactor(rx, nx, min) : dampedFactor(ry, ny, min);
    return { fx: lock === 'x' || shift ? one : 1, fy: lock === 'y' || shift ? one : 1 };
  }
  if (shift) {
    const uniform = freeFactor(Math.hypot(rx, ry), Math.hypot(nx, ny), minFree);
    return { fx: uniform, fy: uniform };
  }
  return { fx: freeFactor(rx, nx, minFree), fy: freeFactor(ry, ny, minFree) };
}

/** A escala livre de um eixo: parada quando a partida é rente à linha do pivô (rodada 46, lote 3). */
export function freeFactor(reference: number, current: number, minFree: number): number {
  return Math.abs(reference) < minFree ? 1 : scaleFactor(reference, current);
}

class ScaleTool implements Tool {
  readonly id = 'scale';
  readonly label = 'Escalar';
  readonly shortcut = 'r';

  private drag: Drag | null = null;
  /**
   * O arrasto de um DESENHO — item 2. Campo próprio, e não um `attachment`
   * dentro de `Drag`, porque escalar um anexo não tem `frame` nem `plan`: o
   * que ele guarda é só a distância de referência até a âncora.
   */
  private attachmentDrag: {
    picked: PickedAttachment; referenceX: number; referenceY: number;
  } | null = null;
  /**
   * Um eixo só — lote 47. O meio de um lado do Transformar escala só aquele
   * eixo, e só aquela chave é gravada. `null` são os dois, como sempre. Com
   * `Shift`, o outro eixo acompanha (proporção). Volta a `null` ao soltar.
   */
  private axisLock: 'x' | 'y' | null = null;

  setAxisLock(axis: 'x' | 'y' | null): void {
    this.axisLock = axis;
  }

  /** Dois ou mais desenhos soltos crescendo a partir do centro comum — lote 60a. */
  private group: { drag: DrawingGroupDrag; center: Point; referenceX: number; referenceY: number } | null = null;
  /** Uma imagem sem osso próprio esperando o primeiro movimento, numa animação (8d). */
  private pending: { attachment: PickedAttachment; origin: ToolEvent; mergeKey: string } | null = null;

  onExit(): void {
    this.drag = null;
    this.attachmentDrag = null;
    this.group = null;
    this.pending = null;
    this.axisLock = null;
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
    if (names.length === 0) {
      // Sem osso escolhido, mas com um desenho: escala o desenho — item 2. A
      // referência é a distância da âncora até onde o dedo pegou.
      const attachment = pickedAttachment(doc);
      // Rodada 15: o emissor não tem escala (§9.10 da extensão). Diz, e para.
      if (attachment !== null && attachment.emitter) {
        doc.notice(EMITTER_HAS_NO_SCALE);
        return;
      }
      if (attachment === null) {
        // Dois ou mais desenhos soltos: a referência é a distância do centro comum.
        const items = pickedDrawings(doc);
        const center = items === null ? null : drawingsCenter(doc);
        if (items === null || center === null) return;
        startAttachmentDrag();
        this.group = {
          drag: new DrawingGroupDrag(items, 'Escalar desenhos', newMergeKey('scale-imagens')),
          center, referenceX: e.x - center.x, referenceY: e.y - center.y,
        };
        return;
      }
      startAttachmentDrag();
      // Rodada 8d: com osso próprio, escala o osso dela, nos eixos da imagem;
      // sem ele, numa animação, ele nasce no primeiro movimento.
      const own = ownBoneNow(doc, attachment.slot);
      if (own !== null) {
        this.attachmentDrag = null;
        this.drag = this.boneDrag(doc, [own], e, newMergeKey('scale-imagem'), false);
        return;
      }
      if (doc.animation !== null) {
        this.pending = { attachment, origin: e, mergeKey: newMergeKey('scale-imagem') };
        return;
      }
      this.attachmentDrag = {
        picked: attachment,
        referenceX: e.x - attachment.anchor.x,
        referenceY: e.y - attachment.anchor.y,
      };
      return;
    }
    this.attachmentDrag = null;
    this.drag = this.boneDrag(doc, names, e, newMergeKey('scale'), true);
  }

  /** O arrasto de ossos; sem compensar no osso próprio de uma imagem (8d). */
  private boneDrag(doc: EditorDoc, names: string[], e: ToolEvent, mergeKey: string, compensate: boolean): Drag {
    const skeleton = doc.skeleton!;
    const space = getHandleSpace();
    return {
      mergeKey,
      plan: planCompensation(doc, compensate ? names : []),
      bones: names.map((name) => {
        const frame = spaceFrame(skeleton, name, space);
        const reference = worldPointToFrame(frame, e.x, e.y);
        return {
          name,
          startScaleX: readBoneNow(doc, name, 'scaleX'),
          startScaleY: readBoneNow(doc, name, 'scaleY'),
          frame,
          referenceX: reference.x,
          referenceY: reference.y,
          referenceLength: Math.hypot(reference.x, reference.y),
        };
      }),
    };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    this.moveInner(doc, e);
    this.footer.say(doc, { kind: 'scale', axis: e.shift ? null : this.axisLock }, e.x, e.y,
      this.nearPivot ? NEAR_PIVOT_SUFFIX : '');
  }

  /** Rodada 46, lote 3: o arrasto começou perto do pivô e anda devagar (o rodapé diz). */
  private nearPivot = false;

  /** O arrasto de agora partiu de perto do pivô? Lido pelo rodapé. */
  get startedNearPivot(): boolean {
    return this.nearPivot;
  }

  private moveInner(doc: EditorDoc, e: ToolEvent): void {
    // Rodada 46, lote 3: a partida nunca vale menos que 40 px de tela.
    const px = 1 / (e.scale > 0 ? e.scale : 1);
    const min = SCALE_MIN_REFERENCE_PIXELS * px;
    const minFree = FREE_AXIS_MIN_PIXELS * px;
    // Trava (meio do lado): amortece. Livre: um eixo rente à linha do pivô fica parado.
    // Nota do doc 77: o amortecido não avisa (o número já está certo); só o eixo parado avisa.
    const lockedF = (r: number, c: number): number => dampedFactor(r, c, min);
    const scaleFactor = (r: number, c: number): number => { if (Math.abs(r) < minFree) this.nearPivot = true; return freeFactor(r, c, minFree); };
    const group = this.group;
    if (group !== null) {
      const { fx, fy } = factorsFrom(
        this.axisLock, e.shift, group.referenceX, group.referenceY, e.x - group.center.x, e.y - group.center.y, min, minFree,
      );
      group.drag.write(doc, { kind: 'scale', center: group.center, fx, fy });
      return;
    }
    const pending = this.pending;
    if (pending !== null) {
      this.pending = null;
      const bones = ensureOwnBones(doc, [pending.attachment], pending.mergeKey, 'Escalar imagem');
      const own = bones?.get(pending.attachment.slot);
      if (own === undefined || doc.skeleton === null) return;
      this.drag = this.boneDrag(doc, [own], pending.origin, `${pending.mergeKey}:chave`, false);
    }
    const anexo = this.attachmentDrag;
    if (anexo !== null) {
      const nowX = e.x - anexo.picked.anchor.x;
      const nowY = e.y - anexo.picked.anchor.y;
      const lock = this.axisLock;
      if (lock !== null) {
        const f = lock === 'x' ? lockedF(anexo.referenceX, nowX) : lockedF(anexo.referenceY, nowY);
        const campos: Array<{ field: 'scaleX' | 'scaleY'; value: number }> = [];
        if (lock === 'x' || e.shift) campos.push({ field: 'scaleX', value: anexo.picked.scaleX * f });
        if (lock === 'y' || e.shift) campos.push({ field: 'scaleY', value: anexo.picked.scaleY * f });
        writeAttachmentValues(doc, anexo.picked, 'Escalar desenho', campos);
        return;
      }
      let fx: number;
      let fy: number;
      if (e.shift) {
        const uniform = scaleFactor(
          Math.hypot(anexo.referenceX, anexo.referenceY), Math.hypot(nowX, nowY),
        );
        fx = uniform;
        fy = uniform;
      } else {
        fx = scaleFactor(anexo.referenceX, nowX);
        fy = scaleFactor(anexo.referenceY, nowY);
      }
      writeAttachmentValues(doc, anexo.picked, 'Escalar desenho', [
        { field: 'scaleX', value: anexo.picked.scaleX * fx },
        { field: 'scaleY', value: anexo.picked.scaleY * fy },
      ]);
      return;
    }
    const drag = this.drag;
    if (drag === null) return;

    const values: Array<{ bone: string; key: 'scaleX' | 'scaleY'; value: number }> = [];
    for (const bone of drag.bones) {
      const now = worldPointToFrame(bone.frame, e.x, e.y);
      const lock = this.axisLock;
      if (lock !== null) {
        const f = lock === 'x' ? lockedF(bone.referenceX, now.x) : lockedF(bone.referenceY, now.y);
        if (lock === 'x' || e.shift) values.push({ bone: bone.name, key: 'scaleX', value: bone.startScaleX * f });
        if (lock === 'y' || e.shift) values.push({ bone: bone.name, key: 'scaleY', value: bone.startScaleY * f });
        continue;
      }
      let factorX: number;
      let factorY: number;
      if (e.shift) {
        const uniform = scaleFactor(bone.referenceLength, Math.hypot(now.x, now.y));
        factorX = uniform;
        factorY = uniform;
      } else {
        factorX = scaleFactor(bone.referenceX, now.x);
        factorY = scaleFactor(bone.referenceY, now.y);
      }
      values.push({ bone: bone.name, key: 'scaleX', value: bone.startScaleX * factorX });
      values.push({ bone: bone.name, key: 'scaleY', value: bone.startScaleY * factorY });
    }
    writeBoneValues(doc, 'Escalar osso', drag.mergeKey, values);
    applyCompensation(doc, drag.plan, drag.mergeKey);
  }

  onUp(doc: EditorDoc): void {
    this.nearPivot = false;
    if (this.attachmentDrag !== null || this.group !== null) doc.endMerge?.();
    this.attachmentDrag = null;
    this.group = null;
    this.drag = null;
    this.pending = null;
    this.axisLock = null;
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    const distance = HANDLE_DISTANCE / scale;
    const space = getHandleSpace();
    for (const name of doc.selection.bones) {
      const pivot = bonePivot(skeleton, name);
      const axes = frameAxes(spaceFrame(skeleton, name, space));
      const ax = pivot.x + axes.x.x * distance;
      const ay = pivot.y + axes.x.y * distance;
      const bx = pivot.x + axes.y.x * distance;
      const by = pivot.y + axes.y.y * distance;
      strokeLine(ctx, scale, HANDLE.axisX, 3, pivot.x, pivot.y, ax, ay);
      strokeLine(ctx, scale, HANDLE.axisY, 3, pivot.x, pivot.y, bx, by);
      fillHandle(ctx, scale, HANDLE.axisX, HANDLE_SIZE, ax, ay);
      fillHandle(ctx, scale, HANDLE.axisY, HANDLE_SIZE, bx, by);
      fillHandle(ctx, scale, HANDLE.free, HANDLE_SIZE, pivot.x, pivot.y);
    }
  }
}

export const scaleTool: Tool & { setAxisLock(axis: 'x' | 'y' | null): void; readonly startedNearPivot: boolean } = new ScaleTool();
registerTool(scaleTool);
