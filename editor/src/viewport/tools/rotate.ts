/**
 * Tool "Girar" (owner B): turns the selected bones.
 *
 * The pivot is the world origin of each bone, which is the point its PARENT
 * put it at. The angle is measured around the pivot of the first selected
 * bone, and the same turn is then written into every selected bone's LOCAL
 * `rotation`.
 *
 * A parent that mirrors its child (negative determinant) reverses the turn on
 * screen, so the local value moves the other way. `frameHandedness` gives that
 * sign, and it is why dragging always follows the pointer.
 *
 * Holding Shift snaps to steps of 15 degrees.
 *
 * SPACE (requirement R7). The snap is measured FROM the chosen space, not from
 * the world: inside a rig tilted by 7 degrees, snapping to 0, 15, 30 of the
 * screen is a snap nobody can use. With Local and Pai the steps start at the
 * angle of that frame; with Mundo they start at zero. `space.ts` holds the
 * frames.
 *
 * COMPENSATION (requirement R7). Turning a bone with "Não mexer nos filhos" on
 * leaves the whole branch where it is on screen — see `compensate.ts`.
 */

import {
  registerTool,
  type EditorDoc,
  type Tool,
  type ToolEvent,
} from '../../contract.js';
import {
  HANDLE,
  angleDelta,
  angleTo,
  bonePivot,
  frameHandedness,
  newMergeKey,
  parentFrame,
  readBoneNow,
  strokeCircle,
  strokeLine,
  writeBoneValues,
} from './select.js';
import { GestureFooter } from './gesture-footer.js';
import { frameAngle, getHandleSpace, spaceFrame } from './space.js';
import { draggedBones } from './translate.js';
import { applyCompensation, planCompensation, type CompensationPlan } from './compensate.js';
import {
  ensureOwnBones, ownBoneNow, pickedAttachment, startAttachmentDrag, writeAttachmentValues,
  type PickedAttachment,
} from './attachment-edit.js';
import { DrawingGroupDrag, drawingsCenter, pickedDrawings, type Point } from './drawing-group.js';


/** Radius of the rotation ring, in screen pixels. */
const RING_PIXELS = 70;
/** Snap step in degrees while Shift is held. */
export const SNAP_DEGREES = 15;

interface DragBone {
  name: string;
  startRotation: number;
  handedness: number;
  /** Angle the snap counts from, so the steps follow the chosen space. */
  snapOrigin: number;
}

interface Drag {
  bones: DragBone[];
  pivotX: number;
  pivotY: number;
  startAngle: number;
  mergeKey: string;
  plan: CompensationPlan;
  /** O DESENHO sendo girado, quando não há osso escolhido — item 2. */
  attachment: PickedAttachment | null;
}

/** Angle rounded to the nearest snap step when Shift is held. */
export function snapAngle(degrees: number, shift: boolean, step = SNAP_DEGREES): number {
  return shift ? Math.round(degrees / step) * step : degrees;
}

/**
 * The same snap, counted from `origin` instead of from zero.
 *
 *   snap(v) = origin + round((v − origin) / step) · step
 *
 * With `origin = 0` this is `snapAngle`, which is what the Mundo space asks
 * for; with the parent's angle it is what the Pai space asks for.
 */
export function snapAngleFrom(
  degrees: number, origin: number, shift: boolean, step = SNAP_DEGREES,
): number {
  return shift ? origin + Math.round((degrees - origin) / step) * step : degrees;
}

class RotateTool implements Tool {
  readonly id = 'rotate';
  readonly label = 'Girar';
  readonly shortcut = 'e';

  private drag: Drag | null = null;
  /** Dois ou mais desenhos soltos girando em volta do centro comum — lote 60a. */
  private group: { drag: DrawingGroupDrag; center: Point; startAngle: number } | null = null;
  /** Uma imagem sem osso próprio esperando o primeiro movimento, numa animação (8d). */
  private pending: { attachment: PickedAttachment; origin: ToolEvent; mergeKey: string } | null = null;

  onExit(): void {
    this.drag = null;
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
    if (names.length === 0) {
      // Sem osso escolhido, mas com um desenho: gira o desenho — item 2. O
      // pivô é a ÂNCORA do anexo, que é onde ele já gira no runtime.
      const attachment = pickedAttachment(doc);
      if (attachment === null) {
        // Dois ou mais desenhos soltos: giram em volta do centro da caixa deles.
        const items = pickedDrawings(doc);
        const center = items === null ? null : drawingsCenter(doc);
        if (items === null || center === null) return;
        startAttachmentDrag();
        this.group = {
          drag: new DrawingGroupDrag(items, 'Girar desenhos', newMergeKey('rotate-imagens')),
          center, startAngle: angleTo(center.x, center.y, e.x, e.y),
        };
        return;
      }
      startAttachmentDrag();
      // Rodada 8d: com osso próprio, gira o osso dela (nasce na âncora da
      // imagem, com o giro dela); sem ele, numa animação, nasce agora.
      const own = ownBoneNow(doc, attachment.slot);
      if (own !== null) {
        this.drag = this.boneDrag(doc, [own], e, newMergeKey('rotate-imagem'), false);
        return;
      }
      if (doc.animation !== null) {
        this.pending = { attachment, origin: e, mergeKey: newMergeKey('rotate-imagem') };
        return;
      }
      this.drag = {
        bones: [], pivotX: attachment.anchor.x, pivotY: attachment.anchor.y,
        startAngle: angleTo(attachment.anchor.x, attachment.anchor.y, e.x, e.y),
        mergeKey: newMergeKey('rotate-anexo'),
        plan: planCompensation(doc, []), attachment,
      };
      return;
    }
    this.drag = this.boneDrag(doc, names, e, newMergeKey('rotate'), true);
  }

  /** O arrasto de ossos; sem compensar no osso próprio de uma imagem (8d). */
  private boneDrag(doc: EditorDoc, names: string[], e: ToolEvent, mergeKey: string, compensate: boolean): Drag {
    const skeleton = doc.skeleton!;
    const pivot = bonePivot(skeleton, names[0]!);
    const space = getHandleSpace();
    return {
      bones: names.map((name) => {
        const start = readBoneNow(doc, name, 'rotation');
        const handedness = frameHandedness(parentFrame(skeleton, name));
        // Pai: the local number already IS the parent-relative angle, so the
        // steps start at zero. Mundo: cancel the parent's angle, so the bone's
        // world axis lands on a multiple of the step. Local: count from where
        // the bone is now, which is "turn it by exactly 15 more".
        let snapOrigin = 0;
        if (space === 'mundo') snapOrigin = -frameAngle(parentFrame(skeleton, name)) * handedness;
        else if (space === 'local') snapOrigin = start;
        return { name, startRotation: start, handedness, snapOrigin };
      }),
      pivotX: pivot.x,
      pivotY: pivot.y,
      startAngle: angleTo(pivot.x, pivot.y, e.x, e.y),
      mergeKey,
      plan: planCompensation(doc, compensate ? names : []),
      attachment: null,
    };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    this.moveInner(doc, e);
    this.footer.say(doc, { kind: 'rotate' }, e.x, e.y);
  }

  private moveInner(doc: EditorDoc, e: ToolEvent): void {
    const group = this.group;
    if (group !== null) {
      const turn = angleDelta(group.startAngle, angleTo(group.center.x, group.center.y, e.x, e.y));
      group.drag.write(doc, { kind: 'rotate', center: group.center, turn: snapAngle(turn, e.shift) });
      return;
    }
    const pending = this.pending;
    if (pending !== null) {
      this.pending = null;
      const bones = ensureOwnBones(doc, [pending.attachment], pending.mergeKey, 'Girar imagem');
      const own = bones?.get(pending.attachment.slot);
      if (own === undefined || doc.skeleton === null) return;
      this.drag = this.boneDrag(doc, [own], pending.origin, `${pending.mergeKey}:chave`, false);
    }
    const drag = this.drag;
    if (drag === null) return;
    const now = angleTo(drag.pivotX, drag.pivotY, e.x, e.y);
    const turn = angleDelta(drag.startAngle, now);

    if (drag.attachment !== null) {
      writeAttachmentValues(doc, drag.attachment, 'Girar desenho', [{
        field: 'rotation',
        value: snapAngle(drag.attachment.rotation + turn, e.shift),
      }]);
      return;
    }

    const values = drag.bones.map((bone) => ({
      bone: bone.name,
      key: 'rotation' as const,
      value: snapAngleFrom(bone.startRotation + turn * bone.handedness, bone.snapOrigin, e.shift),
    }));
    writeBoneValues(doc, 'Girar osso', drag.mergeKey, values);
    applyCompensation(doc, drag.plan, drag.mergeKey);
  }

  onUp(doc: EditorDoc): void {
    if (this.drag?.attachment != null || this.group !== null) doc.endMerge?.();
    this.drag = null;
    this.group = null;
    this.pending = null;
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    const radius = RING_PIXELS / scale;
    for (const name of doc.selection.bones) {
      const pivot = bonePivot(skeleton, name);
      strokeCircle(ctx, scale, HANDLE.free, 3, pivot.x, pivot.y, RING_PIXELS);
      const bone = skeleton.findBone(name);
      if (bone === null) continue;
      // A tick along the bone's own X axis, so the current angle is visible.
      const length = Math.hypot(bone.a, bone.c);
      if (length < 1e-6) continue;
      strokeLine(
        ctx, scale, HANDLE.guide, 2,
        pivot.x, pivot.y,
        pivot.x + (bone.a / length) * radius,
        pivot.y + (bone.c / length) * radius,
      );
    }
    // The zero of the chosen space, so the user can see what a snap counts from.
    const space = getHandleSpace();
    for (const name of doc.selection.bones) {
      const pivot = bonePivot(skeleton, name);
      const frame = spaceFrame(skeleton, name, space);
      const length = Math.hypot(frame.a, frame.c);
      if (length < 1e-9) continue;
      strokeLine(
        ctx, scale, HANDLE.ghost, 1,
        pivot.x, pivot.y,
        pivot.x + (frame.a / length) * radius,
        pivot.y + (frame.c / length) * radius,
      );
    }
    const drag = this.drag;
    if (drag !== null) {
      strokeLine(ctx, scale, HANDLE.ghost, 1, drag.pivotX, drag.pivotY, drag.pivotX + radius, drag.pivotY);
    }
  }
}

export const rotateTool: Tool = new RotateTool();
registerTool(rotateTool);
