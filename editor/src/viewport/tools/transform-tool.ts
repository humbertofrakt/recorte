/**
 * Ferramenta "Transformar" (dono B) — lote 47. Mover, girar, escalar e
 * inclinar numa ferramenta só, como o Spriter: a caixa tracejada com os
 * quadradinhos, o pivô e a haste com a bolinha.
 *
 * | Gesto                            | Quem faz a conta                 |
 * |:---------------------------------|:---------------------------------|
 * | arrastar dentro da caixa         | Mover (`translate.ts`)           |
 * | arrastar a bolinha da haste      | Girar (`rotate.ts`)              |
 * | arrastar um canto                | Escalar, os dois eixos           |
 * | arrastar o meio de um lado       | Escalar, um eixo só              |
 * | **Alt** + o meio de um lado      | Inclinar (`shear.ts`), um eixo   |
 * | clicar                           | Selecionar                       |
 * | arrastar fora da caixa           | Selecionar: o retângulo          |
 *
 * **Nenhuma conta nova.** A ferramenta guarda as quatro de dentro e repassa
 * `onDown`, `onMove` e `onUp` para a que o gesto escolheu. Por isso o arquivo
 * sai igual, texto contra texto, ao que a ferramenta de sempre deixaria com o
 * mesmo arrasto — e Eixos, Compensar, `Shift` e o `Ctrl` que clona valem igual.
 * A única coisa que o Escalar ganhou foi a trava de eixo do meio de lado.
 *
 * Mover, Girar, Escalar e Inclinar continuam na barra, para quem prefere o
 * jeito do Spine.
 *
 * O INCLINAR, item 2.3 do plano de 13/09/2026. O pedido foi encaixá-lo aqui
 * **sem inventar alça nova**. Os três programas que servem de régua:
 *
 * | Programa    | O que tem |
 * |:------------|:----------|
 * | Spriter     | não tem inclinar nenhum |
 * | Spine       | tem, mas como ferramenta separada, com alças próprias |
 * | DragonBones | não tem inclinar nenhum |
 *
 * Nenhum dos três resolve dentro de uma caixa só, então a resposta veio do
 * gesto que todo editor de desenho tem há trinta anos: **segurar uma tecla e
 * puxar o meio de um lado da caixa**. É o `Alt` aqui. As alças são as mesmas,
 * o número delas não muda, e quem nunca apertar o `Alt` não vê diferença
 * nenhuma.
 *
 * Qual lado escreve qual campo é o contrário do Escalar, e tem de ser: puxar
 * o **topo** para o lado é o que inclina em X ("o topo anda, a base fica"), e
 * puxar um **lado** para cima é o que inclina em Y. Canto não inclina — canto
 * continua escalando os dois eixos.
 */

import {
  registerTool,
  type EditorDoc,
  type Tool,
  type ToolEvent,
} from '../../contract.js';
import { pickAll } from '../picking.js';
import { HANDLE_PIXELS } from '../handles.js';
import {
  cursorForHandle, transformBox, transformHit,
  type ScaleHandle, type TransformBox, type TransformHit,
} from '../transform-box.js';
import {
  HANDLE, fillHandle, pickLocks, selectTool, selectedBones, strokeLine,
} from './select.js';
import { draggedBones, translateTool } from './translate.js';
import { rotateTool } from './rotate.js';
import { NEAR_PIVOT_SUFFIX, scaleTool } from './scale.js';
import { shearTool } from './shear.js';
import { footerFor, gestureValuesNow, quietFooter, rulesOfGesture, type FooterKind, type GestureValues } from './gesture-footer.js';

/** Um toque que anda menos que isto, em pixels de tela, é um clique. */
const CLICK_PIXELS = 4;

/** Os valores de partida, para o rodapé dizer quanto o gesto já fez (`gesture-footer.ts`). */
type Start = GestureValues;

interface Gesture {
  zone: TransformHit;
  /** A ferramenta que recebe o arrasto. */
  tool: Tool;
  downX: number;
  downY: number;
  downScale: number;
  moved: boolean;
  handle: ScaleHandle | null;
  /** Com `Alt` na alça: o eixo que o Inclinar recebeu. `null` nos outros gestos. */
  shearAxis: 'x' | 'y' | null;
  /** Desceu em algo fora da caixa: já escolheu, e o arrasto move. */
  pickedFirst: boolean;
  bone: string | null;
  start: Start | null;
}

/** O eixo que um meio de lado escala. Canto: os dois. */
export function axisOfHandle(handle: ScaleHandle): 'x' | 'y' | null {
  if (handle === 'e' || handle === 'w') return 'x';
  if (handle === 'n' || handle === 's') return 'y';
  return null;
}

/**
 * O eixo que um meio de lado **inclina**, com `Alt` — item 2.3. É o contrário
 * do Escalar, e não por capricho: o que inclina em X é o topo andando de lado,
 * e o que inclina em Y é um lado andando para cima. Canto devolve `null`:
 * canto não inclina, continua escalando.
 */
export function shearAxisOfHandle(handle: ScaleHandle): 'x' | 'y' | null {
  if (handle === 'n' || handle === 's') return 'x';
  if (handle === 'e' || handle === 'w') return 'y';
  return null;
}

/** Os valores de agora (rodada 46: com X e Y, para o Mover dizer quanto andou). */
const valuesNow = gestureValuesNow;

/**
 * A classe de cursor de uma zona. `null` fora da caixa: o cursor de sempre.
 *
 * Rodada 46, lote 2: com `Alt` sobre o meio de um lado o gesto é INCLINAR, e
 * o cursor dizia "escalar" (doc `66`, §2.1). Agora diz o eixo que inclina:
 * `col-resize` quando o topo anda de lado (X), `row-resize` quando um lado
 * sobe (Y). Canto com Alt continua escalando, e o cursor continua o de escalar.
 */
export function transformCursor(zone: TransformHit, box: TransformBox | null, alt = false): string | null {
  if (zone === 'move') return 'is-transform-move';
  if (zone === 'rotate') return 'is-transform-rotate';
  if (zone === 'outside' || box === null) return null;
  const shear = alt ? shearAxisOfHandle(zone.scale) : null;
  if (shear !== null) return `is-transform-shear-${shear}`;
  return `is-transform-scale-${cursorForHandle(box, zone.scale)}`;
}

const cursorFor = transformCursor;

/** A menor distância de um ponto às bordas da caixa, em mundo. */
export function distanceToBox(box: TransformBox, x: number, y: number): number {
  let best = Infinity;
  const c = box.corners;
  for (let i = 0; i < 4; i++) {
    const a = c[i]!;
    const b = c[(i + 1) % 4]!;
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const len2 = vx * vx + vy * vy;
    const t = len2 < 1e-12 ? 0 : Math.max(0, Math.min(1, ((x - a.x) * vx + (y - a.y) * vy) / len2));
    best = Math.min(best, Math.hypot(x - (a.x + t * vx), y - (a.y + t * vy)));
  }
  return best;
}

/** Inclinar puxando para fora do lado não inclina: o rodapé diz o gesto certo (rodada 46, lote 3). */
export const SHEAR_ALONG_NOTICE = ': puxe ao longo do lado, não para fora';

/** O que o rodapé diz ao parar com Alt sobre o meio de um lado — rodada 46, lote 2. */
export const SHEAR_HOVER_NOTICE = 'Alt: este quadradinho inclina. Puxe ao longo do lado: o topo anda, a base fica';

/**
 * A frase do Alt pelo eixo do quadradinho — rodada 46, lote 4 (nota do doc
 * `76`): nos lados da direita e da esquerda não há "topo e base"; lá é um lado
 * que anda, e o outro fica.
 */
export function shearHoverNotice(axis: 'x' | 'y'): string {
  return axis === 'x'
    ? SHEAR_HOVER_NOTICE
    : 'Alt: este quadradinho inclina. Puxe ao longo do lado: este lado anda, o do outro lado fica';
}

/** A zona debaixo do ponteiro, e a caixa em que ela foi medida. */
export function zoneAt(
  doc: EditorDoc, x: number, y: number, scale: number,
): { zone: TransformHit; box: TransformBox | null } {
  const box = transformBox(doc, scale);
  if (box === null) return { zone: 'outside', box };
  const tolerance = HANDLE_PIXELS / 2 / (scale > 0 ? scale : 1);
  return { zone: transformHit({ x, y }, box, tolerance), box };
}

/**
 * O ponteiro está em cima do pixel de um desenho escolhido? Lote 60c: com a
 * parte transparente passando direto (`picking.ts`), a conta é a do clique.
 */
function overSelectedDrawing(doc: EditorDoc, x: number, y: number, scale: number): boolean {
  return pickAll(doc.skeleton, x, y, scale, pickLocks()).some((hit) => hit.kind === 'attachment'
    && doc.selection.attachments.some((item) => item.slot === hit.slot && item.attachment === hit.attachment));
}

/**
 * A zona que o clique vale — lote 60c. O Humberto: *"se eu clicar em uma
 * parte sem imagem eu quero que o clique passe direto como no Spriter"*. Com
 * só desenhos escolhidos, o miolo da caixa só pega onde há pixel de um deles;
 * na parte transparente vale como fora da caixa: escolhe o que estiver
 * embaixo, ou limpa. Os quadradinhos e a bolinha continuam valendo.
 */
function clickZone(doc: EditorDoc, x: number, y: number, scale: number): { zone: TransformHit; box: TransformBox | null } {
  const found = zoneAt(doc, x, y, scale);
  // Rodada 46, lote 3 (doc `66`, §2.1): rente à caixa de um OSSO (a menos de
  // meio quadradinho) ainda é dentro. A caixa do osso é estreita, e o clique
  // que caía um pixel fora virava retângulo e desmarcava o osso.
  if (found.zone === 'outside' && found.box !== null && selectedBones(doc).length > 0
    && distanceToBox(found.box, x, y) * scale <= HANDLE_PIXELS / 2) {
    return { zone: 'move', box: found.box };
  }
  if (found.zone === 'move' && selectedBones(doc).length === 0 && !overSelectedDrawing(doc, x, y, scale)) {
    return { zone: 'outside', box: found.box };
  }
  return found;
}

class TransformTool implements Tool {
  readonly id = 'transform';
  readonly label = 'Transformar';
  readonly shortcut = 't';

  private gesture: Gesture | null = null;
  private cursor: string | null = null;

  onExit(doc: EditorDoc): void {
    for (const tool of [selectTool as Tool, translateTool, rotateTool, scaleTool, shearTool]) tool.onExit?.(doc);
    this.gesture = null;
    this.cursor = null;
  }

  onHover(doc: EditorDoc, e: ToolEvent): void {
    if (this.gesture !== null) return;
    const { zone, box } = clickZone(doc, e.x, e.y, e.scale);
    const antes = this.cursor;
    this.cursor = cursorFor(zone, box, e.alt);
    // Uma vez ao entrar, e não a cada movimento: o rodapé ensina sem piscar.
    if (this.cursor !== antes && this.cursor?.startsWith('is-transform-shear-') === true) {
      doc.notice(shearHoverNotice(this.cursor.endsWith('-y') ? 'y' : 'x'));
    }
  }

  cursorClass(): string | null {
    return selectTool.cursorClass() ?? this.cursor;
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    const { zone, box } = clickZone(doc, e.x, e.y, e.scale);
    this.cursor = cursorFor(zone, box, e.alt);
    const bone = selectedBones(doc)[0] ?? null;
    const base = {
      zone, downX: e.x, downY: e.y, downScale: e.scale, moved: false,
      handle: null, shearAxis: null, pickedFirst: false, bone, start: valuesNow(doc, bone),
    };

    if (zone === 'rotate') {
      rotateTool.onDown?.(doc, e);
      this.gesture = { ...base, tool: rotateTool };
      return;
    }
    if (typeof zone === 'object') {
      // `Alt` na alça do meio de um lado: inclina em vez de escalar — item
      // 2.3. Sem osso escolhido não há o que inclinar (um anexo não tem
      // inclinação no formato), e no canto não há inclinação nenhuma: nos
      // dois casos o `Alt` não faz nada e a alça escala, como sempre.
      const shearAxis = e.alt && draggedBones(doc).length > 0
        ? shearAxisOfHandle(zone.scale)
        : null;
      if (shearAxis !== null) {
        shearTool.setAxisLock(shearAxis);
        shearTool.onDown?.(doc, e);
        this.gesture = { ...base, tool: shearTool, handle: zone.scale, shearAxis };
        return;
      }
      scaleTool.setAxisLock(axisOfHandle(zone.scale));
      scaleTool.onDown?.(doc, e);
      this.gesture = { ...base, tool: scaleTool, handle: zone.scale };
      return;
    }
    if (zone === 'move') {
      translateTool.onDown?.(doc, e);
      this.gesture = { ...base, tool: translateTool };
      return;
    }

    // Fora da caixa: o que Selecionar faz. Em cima de alguma coisa, ela fica
    // escolhida, e o arrasto já a move — o gesto do Spriter, sem trocar de
    // ferramenta. No vazio, é o retângulo.
    const under = pickAll(doc.skeleton, e.x, e.y, e.scale, pickLocks());
    selectTool.onDown(doc, e);
    if (under.length > 0) {
      const chosen = selectedBones(doc)[0] ?? null;
      // Sem Ctrl: o Ctrl do Mover clona o escolhido, e isto acabou de ser escolhido.
      translateTool.onDown?.(doc, { ...e, ctrl: false });
      this.gesture = {
        ...base, zone: 'move', tool: translateTool, pickedFirst: true,
        bone: chosen, start: valuesNow(doc, chosen),
      };
      return;
    }
    this.gesture = { ...base, tool: selectTool as Tool };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    const g = this.gesture;
    if (g === null) return;
    if (g.zone === 'move' && !g.moved
      && Math.hypot(e.x - g.downX, e.y - g.downY) * g.downScale < CLICK_PIXELS) return;
    g.moved = true;
    // Rodada 46, lote 1: a ferramenta de dentro fica calada; quem diz o
    // número é o Transformar, uma frase por movimento.
    quietFooter(() => g.tool.onMove?.(doc, e));
    if (g.tool !== (selectTool as Tool)) doc.notice(this.footer(doc, g, e));
  }

  onUp(doc: EditorDoc, e: ToolEvent): void {
    const g = this.gesture;
    this.gesture = null;
    if (g === null) return;
    g.tool.onUp?.(doc, e);
    if (g.tool === scaleTool) scaleTool.setAxisLock(null);
    if (g.tool === shearTool) shearTool.setAxisLock(null);
    // Um toque dentro da caixa que não andou é um clique: escolhe o que está
    // embaixo, como Selecionar.
    if (g.zone === 'move' && !g.moved && !g.pickedFirst) {
      selectTool.onDown(doc, e);
      selectTool.onUp(doc, e);
    }
  }

  onKey(doc: EditorDoc, key: string): boolean {
    return selectTool.onKey(doc, key);
  }

  onKeyUp(doc: EditorDoc, key: string): boolean {
    return selectTool.onKeyUp(doc, key);
  }

  /**
   * O rodapé enquanto arrasta, com a unidade — rodada 46, lote 1:
   * "Mover X 12 px · Y −4 px", "Girar 37° (agora 57°)", "Escalar X × 1,4".
   * Antes: "Mover", sem quanto, e "Escalar X 1,4", sem o ×.
   */
  private footer(doc: EditorDoc, g: Gesture, e: ToolEvent): string {
    let what: FooterKind;
    if (g.zone === 'move') what = { kind: 'move' };
    else if (g.shearAxis !== null) what = { kind: 'shear', axis: g.shearAxis };
    else if (g.zone === 'rotate') what = { kind: 'rotate' };
    else what = { kind: 'scale', axis: g.handle === null ? null : axisOfHandle(g.handle) };
    const now = valuesNow(doc, g.bone);
    const text = footerFor(what, g.start, now, { dx: e.x - g.downX, dy: e.y - g.downY }, rulesOfGesture(doc, g.bone, what));
    // Rodada 46, lote 3: o 0° calado de quem puxou para fora vira o gesto certo.
    if (what.kind === 'shear' && g.start !== null && now !== null
      && Math.hypot(e.x - g.downX, e.y - g.downY) * g.downScale >= 8) {
      const turn = what.axis === 'x' ? now.shearX - g.start.shearX : now.shearY - g.start.shearY;
      if (Math.abs(turn) < 0.05) return `Inclinar ${what.axis === 'x' ? 'X' : 'Y'} 0°${SHEAR_ALONG_NOTICE}`;
    }
    if (what.kind === 'scale' && g.tool === scaleTool && scaleTool.startedNearPivot) return text + NEAR_PIVOT_SUFFIX;
    return text;
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    // O retângulo de seleção e as marcas dos ossos escolhidos são os do Selecionar.
    selectTool.drawOverlay(doc, ctx, scale);
    const box = transformBox(doc, scale);
    if (box === null) return;

    const [a, b, c, d] = box.corners;
    ctx.save();
    ctx.strokeStyle = HANDLE.ghost;
    ctx.lineWidth = 1.5 / scale;
    ctx.setLineDash([6 / scale, 4 / scale]);
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.lineTo(d.x, d.y);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    strokeLine(ctx, scale, HANDLE.ghost, 2, box.pivot.x, box.pivot.y, box.knob.x, box.knob.y);
    // `visibleHandles`, e não os oito de `handles` — item 1.3, 13/09/2026. A
    // caixa já sabe quais quadradinhos valem (três num osso, oito num
    // desenho), e `transformHit` só responde os dessa lista: desenhar os oito
    // poria na tela quadradinho que não pega, que é a pior mentira que uma
    // alça pode contar.
    for (const name of box.visibleHandles) {
      const h = box.handles[name];
      fillHandle(ctx, scale, HANDLE.ghost, HANDLE_PIXELS, h.x, h.y);
      fillHandle(ctx, scale, '#ffffff', HANDLE_PIXELS - 4, h.x, h.y);
    }

    const radius = HANDLE_PIXELS / 2 / scale;
    ctx.save();
    ctx.lineWidth = 2 / scale;
    ctx.strokeStyle = HANDLE.ghost;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(box.knob.x, box.knob.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // O pivô: a bolinha vermelha do Spriter.
    ctx.fillStyle = HANDLE.axisX;
    ctx.beginPath();
    ctx.arc(box.pivot.x, box.pivot.y, radius * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

// O tipo é a classe: os testes e a cena leem `onHover` e `cursorClass`. O
// registro é o mesmo das outras ferramentas.
export const transformTool = new TransformTool();
registerTool(transformTool as Tool);
