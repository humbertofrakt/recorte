/**
 * Ferramenta "Caixa" (dono B) — item 13.
 *
 * Um `boundingbox` (§7.6) é o contorno com que o jogo pergunta "isto encostou
 * naquilo?": a área do soco, o corpo que leva dano, o gatilho que dispara a
 * armadilha. Ele não desenha nada na tela do jogo.
 *
 * Sem esta ferramenta, criar uma caixa era escrever JSON à mão. O formato tem o
 * tipo desde sempre; faltava a porta.
 *
 * GESTO
 *   Alt + arrastar   desenha o retângulo, de um canto ao outro.
 *
 * Alt, e não o arrasto seco, pelo mesmo motivo do Ponto: arrastar sem Alt é o
 * que a ferramenta Malha vai usar para pegar os cantos de uma caixa que já
 * existe. Aqui, sem Alt, ela diz o que fazer em vez de não fazer nada.
 *
 * DEPOIS DE CRIADA, quem edita é a ferramenta **Malha**: uma caixa é um
 * polígono, e a Malha já move vértice. Nasce com quatro, em ordem e sem se
 * cruzar — um contorno que se cruza é L2 no formato.
 */

import {
  emptySelection,
  registerTool,
  type EditorDoc,
  type Tool,
  type ToolEvent, corpoDe
} from '../../contract.js';
import {
  AddAttachmentToSlot, AddBoundingBox, boxAttachment, boxVertices, inSlotNotice, shapeTarget,
} from '../../panels/tree-model.js';
import { HANDLE, fillHandle, strokeLine } from './select.js';
import { looseShapeHint } from './creation-words.js';
import { editableSkin, visibleSkinsOf } from '../onion.js';

/** Menor que isto na tela, dos dois lados, e não é uma caixa: é um clique. */
export const MIN_BOX_PIXELS = 8;

interface Drag {
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

class BoxTool implements Tool {
  readonly id = 'box';
  readonly label = 'Caixa';
  readonly shortcut = 'x';
  // Sem `modes`: vale nos dois modos desde o lote 57 (plano pivô). A caixa
  // entra na Montagem, medida contra o osso como a cena o mostra.

  private drag: Drag | null = null;

  onExit(): void {
    this.drag = null;
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0 || doc.skeleton === null) return;
    if (!e.alt) {
      doc.notice('Segure Alt e arraste para desenhar a caixa');
      return;
    }
    this.drag = { fromX: e.x, fromY: e.y, toX: e.x, toY: e.y };
  }

  onMove(_doc: EditorDoc, e: ToolEvent): void {
    if (this.drag === null) return;
    this.drag.toX = e.x;
    this.drag.toY = e.y;
  }

  onUp(doc: EditorDoc, e: ToolEvent): void {
    const drag = this.drag;
    this.drag = null;
    const skeleton = doc.skeleton;
    if (drag === null || skeleton === null) return;

    const largura = Math.abs(e.x - drag.fromX) * e.scale;
    const altura = Math.abs(e.y - drag.fromY) * e.scale;
    if (largura < MIN_BOX_PIXELS || altura < MIN_BOX_PIXELS) {
      doc.notice('Caixa pequena demais. Arraste de um canto ao outro');
      return;
    }

    // Slot escolhido e nenhum osso: a caixa entra NELE — lote 40.
    const target = shapeTarget(corpoDe(doc).file, doc.selection);
    // Rodada 46, lote 4: caiu na raiz com um desenho escolhido? O rodapé ensina.
    const solta = target === null ? '' : looseShapeHint(doc.selection, target.bone, corpoDe(doc).file.bones[0]?.name ?? null, true);
    if (target === null) {
      doc.notice('Crie um osso antes de criar uma caixa');
      return;
    }
    const boneName = target.bone;
    const bone = skeleton.findBone(boneName);
    if (bone === null) return;

    // Os vértices vão para o arquivo no espaço do OSSO, que é onde §7.4 os
    // guarda. Os dois cantos vêm do mundo; a conversão é aqui, uma vez.
    const a = bone.worldToLocal(drag.fromX, drag.fromY);
    const b = bone.worldToLocal(e.x, e.y);
    if (target.kind === 'slot') {
      const inSlot = new AddAttachmentToSlot(
        target.slot, editableSkin(corpoDe(doc).file, visibleSkinsOf(doc)), `${target.slot}_caixa`,
        boxAttachment(boxVertices(a.x, a.y, b.x, b.y)), 'Nova caixa no desenho',
      );
      corpoDe(doc).run(inSlot);
      doc.select({
        ...emptySelection(),
        slots: [target.slot],
        attachments: [{ slot: target.slot, attachment: inSlot.name }],
      });
      doc.notice(inSlotNotice('Caixa', inSlot.name, target.slot));
      return;
    }
    const command = new AddBoundingBox(
      corpoDe(doc).file, boneName, visibleSkinsOf(doc), boxVertices(a.x, a.y, b.x, b.y),
    );
    corpoDe(doc).run(command);
    doc.select({
      ...emptySelection(),
      attachments: [{ slot: command.name, attachment: command.name }],
    });
    doc.notice(`Caixa ${command.name} criada no osso ${boneName}${solta}`);
  }

  onKey(_doc: EditorDoc, key: string): boolean {
    if (key !== 'Escape' || this.drag === null) return false;
    this.drag = null;
    return true;
  }

  drawOverlay(_doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const drag = this.drag;
    if (drag === null) return;
    // O retângulo do arrasto, no mundo: os quatro lados e os dois cantos que a
    // mão está segurando.
    strokeLine(ctx, scale, HANDLE.free, 2, drag.fromX, drag.fromY, drag.toX, drag.fromY);
    strokeLine(ctx, scale, HANDLE.free, 2, drag.toX, drag.fromY, drag.toX, drag.toY);
    strokeLine(ctx, scale, HANDLE.free, 2, drag.toX, drag.toY, drag.fromX, drag.toY);
    strokeLine(ctx, scale, HANDLE.free, 2, drag.fromX, drag.toY, drag.fromX, drag.fromY);
    fillHandle(ctx, scale, HANDLE.free, 8, drag.fromX, drag.fromY);
    fillHandle(ctx, scale, HANDLE.guide, 8, drag.toX, drag.toY);
  }
}

export const boxTool: Tool = new BoxTool();
registerTool(boxTool);
