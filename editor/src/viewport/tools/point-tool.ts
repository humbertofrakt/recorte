/**
 * Ferramenta "Ponto" (dono B) — item 12.
 *
 * Um `point` (§7.9) é posição e rotação com nome, e nada mais: a boca do cano
 * da arma, o lugar de onde sai a faísca, o alvo que a câmera segue. Ele não
 * desenha. O jogo lê a matriz de mundo dele e pendura ali o que quiser.
 *
 * Sem esta ferramenta, criar um ponto era escrever JSON à mão: o formato tinha
 * o tipo desde sempre e o editor não tinha a porta.
 *
 * GESTO
 *   Alt + arrastar   cria um ponto na raiz do arrasto, apontando para onde
 *                    você soltou. Alt porque arrastar sem ele MOVE o ponto que
 *                    já está lá — o mesmo par de gestos do Spriter.
 *   arrastar         move o ponto sob o cursor.
 *   Shift + arrastar gira o ponto sob o cursor.
 *
 * ONDE O VALOR MORA
 * `x`, `y` e `rotation` são do espaço do OSSO do slot, que é o que o arquivo
 * guarda. O gesto acontece no mundo, então tudo aqui converte antes de gravar.
 *
 * **Em Animando não cria chave.** Um `point` não tem linha do tempo de posição
 * no formato — não há o que chavear —, então mexer nele muda a montagem, e a
 * barra de baixo diz isso em vez de deixar a pessoa achar que gravou uma pose.
 */

import {
  emptySelection,
  registerTool,
  type EditorDoc,
  type Tool,
  type ToolEvent, corpoDe
} from '../../contract.js';
import { atan2Deg, type Bone, type Skeleton } from '../../../../runtime/src/index.js';
import {
  AddAttachmentToSlot, AddPointAttachment, inSlotNotice, pointAttachment, shapeTarget,
} from '../../panels/tree-model.js';
import { SetProperty } from '../../doc/commands.js';
import { pointerOf } from '../../panels/json-pointer.js';
import { HANDLE, fillHandle, strokeLine } from './select.js';
import { looseShapeHint } from './creation-words.js';
import { editableSkin, visibleSkinsOf } from '../onion.js';

/** Raio, em pixels de tela, para o cursor pegar um ponto que já existe. */
export const POINT_PICK_PIXELS = 10;
/** Mais curto que isto na tela e o ponto nasce sem apontar para lado nenhum. */
export const MIN_POINT_DRAG_PIXELS = 6;

/** Onde um `point` está, no mundo. §7.9, `pointWorld`. */
export function pointWorld(
  bone: Bone, x: number, y: number, rotation: number,
): { x: number; y: number; rotation: number } {
  const pos = bone.localToWorld(x, y);
  const cos = Math.cos((rotation * Math.PI) / 180);
  const sin = Math.sin((rotation * Math.PI) / 180);
  return {
    x: pos.x,
    y: pos.y,
    rotation: atan2Deg(cos * bone.c + sin * bone.d, cos * bone.a + sin * bone.b),
  };
}

/** Um ponto achado na cena, com tudo o que é preciso para mexer nele. */
export interface FoundPoint {
  slot: string;
  attachment: string;
  skin: number;
  bone: Bone;
  /** Onde ele está no mundo agora. */
  world: { x: number; y: number; rotation: number };
}

/**
 * O `point` mais perto do cursor, dentro do raio, ou `null`.
 *
 * Do topo da ordem de desenho para baixo, como todo o resto do `picking`: o que
 * está por cima ganha o clique.
 */
export function pickPoint(
  doc: EditorDoc, worldX: number, worldY: number, pixelsPerUnit: number,
): FoundPoint | null {
  const skeleton = doc.skeleton;
  if (skeleton === null) return null;
  const radius = POINT_PICK_PIXELS / (pixelsPerUnit > 1e-9 ? pixelsPerUnit : 1e-9);
  let best: FoundPoint | null = null;
  let bestDistance = radius * radius;

  for (const found of allPoints(doc, skeleton)) {
    const dx = found.world.x - worldX;
    const dy = found.world.y - worldY;
    const distance = dx * dx + dy * dy;
    if (distance > bestDistance) continue;
    bestDistance = distance;
    best = found;
  }
  return best;
}

/** Todo `point` das peles visíveis, com o osso que o carrega. */
export function allPoints(doc: EditorDoc, skeleton: Skeleton): FoundPoint[] {
  const out: FoundPoint[] = [];
  const visible = new Set(visibleSkinsOf(doc));
  const skins = corpoDe(doc).file.skins ?? [];
  for (let i = 0; i < skins.length; i++) {
    const skin = skins[i];
    if (visible.size > 0 && !visible.has(skin.name)) continue;
    if (visible.size === 0 && skin.name !== 'default') continue;
    for (const [slotName, attachments] of Object.entries(skin.attachments ?? {})) {
      const slot = (corpoDe(doc).file.slots ?? []).find((s) => s.name === slotName);
      if (slot === undefined) continue;
      const bone = skeleton.findBone(slot.bone);
      if (bone === null) continue;
      for (const [name, def] of Object.entries(attachments ?? {})) {
        const shape = def as { type?: string; x?: number; y?: number; rotation?: number } | null;
        if (shape === null || shape.type !== 'point') continue;
        out.push({
          slot: slotName,
          attachment: name,
          skin: i,
          bone,
          world: pointWorld(bone, shape.x ?? 0, shape.y ?? 0, shape.rotation ?? 0),
        });
      }
    }
  }
  return out;
}

type Mode = 'criar' | 'mover' | 'girar';

interface Drag {
  mode: Mode;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  /** O ponto sendo mexido, em `mover` e `girar`. */
  found: FoundPoint | null;
}

class PointTool implements Tool {
  readonly id = 'point';
  readonly label = 'Ponto';
  readonly shortcut = 'o';
  // Sem `modes`: vale nos dois modos desde o lote 57 (plano pivô). O ponto
  // entra na Montagem, medido contra o osso como a cena o mostra.

  private drag: Drag | null = null;

  onExit(doc: EditorDoc): void {
    this.finish(doc);
    this.drag = null;
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0 || doc.skeleton === null) return;
    if (e.alt) {
      this.drag = { mode: 'criar', fromX: e.x, fromY: e.y, toX: e.x, toY: e.y, found: null };
      return;
    }
    const found = pickPoint(doc, e.x, e.y, e.scale);
    if (found === null) {
      doc.notice('Segure Alt e arraste para criar um ponto');
      return;
    }
    doc.select({ ...emptySelection(), attachments: [{ slot: found.slot, attachment: found.attachment }] });
    this.drag = {
      mode: e.shift ? 'girar' : 'mover',
      fromX: e.x, fromY: e.y, toX: e.x, toY: e.y, found,
    };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    const drag = this.drag;
    if (drag === null) return;
    drag.toX = e.x;
    drag.toY = e.y;
    if (drag.mode === 'criar' || drag.found === null) return;
    if (drag.mode === 'mover') this.moveTo(doc, drag.found, e.x, e.y);
    else this.turnTo(doc, drag.found, e.x, e.y);
  }

  onUp(doc: EditorDoc, e: ToolEvent): void {
    const drag = this.drag;
    this.drag = null;
    if (drag === null) return;
    if (drag.mode !== 'criar') {
      this.finish(doc);
      return;
    }
    this.create(doc, drag, e);
  }

  onKey(doc: EditorDoc, key: string): boolean {
    if (key !== 'Escape' || this.drag === null) return false;
    this.drag = null;
    this.finish(doc);
    return true;
  }

  /** Fecha o passo de desfazer do arrasto: o próximo é outro passo. */
  private finish(doc: EditorDoc): void {
    doc.endMerge?.();
  }

  private create(doc: EditorDoc, drag: Drag, e: ToolEvent): void {
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    // Slot escolhido e nenhum osso: o ponto entra NELE — lote 40.
    const target = shapeTarget(corpoDe(doc).file, doc.selection);
    // Rodada 46, lote 4: caiu na raiz com um desenho escolhido? O rodapé ensina.
    const solta = target === null ? '' : looseShapeHint(doc.selection, target.bone, corpoDe(doc).file.bones[0]?.name ?? null, false);
    if (target === null) {
      doc.notice('Crie um osso antes de criar um ponto');
      return;
    }
    const boneName = target.bone;
    const bone = skeleton.findBone(boneName);
    if (bone === null) return;

    const local = bone.worldToLocal(drag.fromX, drag.fromY);
    // Um arrasto curto não aponta para nada: o ponto nasce sem giro, em vez de
    // apontar para onde o dedo tremeu.
    const dx = e.x - drag.fromX;
    const dy = e.y - drag.fromY;
    const longe = Math.hypot(dx, dy) * e.scale >= MIN_POINT_DRAG_PIXELS;
    const rotation = longe ? bone.worldToLocalRotation(atan2Deg(dy, dx)) : 0;

    if (target.kind === 'slot') {
      const inSlot = new AddAttachmentToSlot(
        target.slot, editableSkin(corpoDe(doc).file, visibleSkinsOf(doc)), `${target.slot}_ponto`,
        pointAttachment(local.x, local.y, rotation), 'Novo ponto no slot',
      );
      corpoDe(doc).run(inSlot);
      // O slot continua escolhido: o próximo Alt + arrasto entra no mesmo slot.
      doc.select({
        ...emptySelection(),
        slots: [target.slot],
        attachments: [{ slot: target.slot, attachment: inSlot.name }],
      });
      doc.notice(inSlotNotice('Ponto', inSlot.name, target.slot));
      return;
    }

    const command = new AddPointAttachment(
      corpoDe(doc).file, boneName, visibleSkinsOf(doc), local.x, local.y, rotation,
    );
    corpoDe(doc).run(command);
    doc.select({
      ...emptySelection(),
      attachments: [{ slot: command.name, attachment: command.name }],
    });
    doc.notice(`Ponto ${command.name} criado no osso ${boneName}${solta}`);
  }

  /** Escreve `x` e `y` do anexo, no espaço do osso. */
  private moveTo(doc: EditorDoc, found: FoundPoint, worldX: number, worldY: number): void {
    const local = found.bone.worldToLocal(worldX, worldY);
    this.write(doc, found, 'x', local.x);
    this.write(doc, found, 'y', local.y);
    this.sayAssembly(doc);
  }

  /** Escreve `rotation` do anexo, no espaço do osso. */
  private turnTo(doc: EditorDoc, found: FoundPoint, worldX: number, worldY: number): void {
    const angle = atan2Deg(worldY - found.world.y, worldX - found.world.x);
    this.write(doc, found, 'rotation', found.bone.worldToLocalRotation(angle));
    this.sayAssembly(doc);
  }

  private write(doc: EditorDoc, found: FoundPoint, field: string, value: number): void {
    const pointer = pointerOf(
      'skins', found.skin, 'attachments', found.slot, found.attachment, field,
    );
    corpoDe(doc).run(new SetProperty(pointer, Math.round(value * 1e4) / 1e4, {
      label: 'Mover ponto', kind: 'structure', mergeable: true,
    }));
  }

  /**
   * Diz, uma vez por arrasto, que isto é montagem e não animação.
   *
   * O formato não tem linha do tempo para a posição de um `point`: não há o que
   * chavear. Sem esta frase, quem está com uma animação aberta acharia que
   * acabou de gravar uma pose.
   */
  private sayAssembly(doc: EditorDoc): void {
    if (doc.animation === null || this.said) return;
    this.said = true;
    doc.notice('Posição do ponto é da montagem: ela não vira chave');
  }

  private said = false;

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const drag = this.drag;
    if (drag !== null && drag.mode === 'criar') {
      strokeLine(ctx, scale, HANDLE.free, 3, drag.fromX, drag.fromY, drag.toX, drag.toY);
      fillHandle(ctx, scale, HANDLE.free, 9, drag.fromX, drag.fromY);
      fillHandle(ctx, scale, HANDLE.guide, 9, drag.toX, drag.toY);
      return;
    }
    // Fora do arrasto, uma alça em cada ponto: sem ela não se sabe onde clicar.
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    for (const found of allPoints(doc, skeleton)) {
      fillHandle(ctx, scale, HANDLE.guide, 8, found.world.x, found.world.y);
    }
  }
}

export const pointTool: Tool = new PointTool();
registerTool(pointTool);
