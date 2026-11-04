/**
 * Puxar o painel e ver ele vir junto — rodada 4, lote 1 (05/10/2026).
 *
 * O Humberto, 04/10: *"no Photoshop você pode abrir os menus e soltar eles das
 * paredes. Atualmente eles ficam presos nas paredes."*
 *
 * A conferência da rodada 4 achou por quê (`09 OS PAINEIS`): o soltar existia,
 * mas pelo arrasto do NAVEGADOR (`draggable`, `dragstart`, `dragend`). Fora
 * das tiras de abas ninguém aceitava a soltura, e sobre a cena o cursor dizia
 * **"proibido"** o caminho todo; o painel só soltava depois que a mão largava.
 * Quem vê "proibido" não larga ali.
 *
 * Aqui o arrasto passa a ser NOSSO, por eventos de ponteiro, e um só para os
 * dois gestos — puxar a aba e puxar a barra do painel solto:
 *
 * | Onde a mão está | O que a tela mostra | Ao largar |
 * |:---|:---|:---|
 * | ainda perto de onde apertou (< 5 px) | nada: é um clique | escolhe a aba |
 * | sobre uma tira de abas | a **linha azul** onde a aba entra | cola ali |
 * | sobre o corpo de um grupo | o **contorno azul** do grupo | cola no fim dele |
 * | em qualquer outro lugar | a **sombra do painel** onde ele vai ficar | solta ali |
 *
 * É o Photoshop: a aba solta onde se larga, e o realce azul mostra onde ela
 * vai entrar ([webucator](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/)).
 * E o painel solto cola de volta **pelo mesmo gesto**: puxar a barra até uma
 * tira, com a mesma linha azul.
 *
 * Puro: recebe retângulos e pontos, devolve a decisão. A casca mede e desenha.
 * Coordenadas: as da tela (`clientX`, `getBoundingClientRect`) para o que se
 * mede; as da camada dos soltos para a caixa do painel, como em `panel-groups`.
 */

import { fitFloat } from './float-fit.js';
import type { Side } from './layout-model.js';
import { FLOAT_DEFAULT_H, FLOAT_DEFAULT_W, dropIndex, snapFloat } from './panel-groups.js';
import type { FloatBox, FloatSnap, SnapArea, TabRect } from './panel-groups.js';

/** Quanto a mão anda antes de o clique virar arrasto, em pixels. */
export const DRAG_START_PX = 5;

/**
 * Onde a barra do painel recém-solto fica em relação à mão: a barra de título
 * debaixo do dedo, como quem segura a aba. É o mesmo 14 px que a casca usava.
 */
export const GRAB_BAR_Y = 14;

/** O que está sendo puxado. */
export type DragSource =
  /** A aba de um painel na coluna. */
  | { kind: 'aba'; id: string; side: Side; group: number }
  /** A barra de título de um painel solto. `box` é onde ele estava. */
  | { kind: 'solto'; id: string; box: FloatBox }
  /**
   * O VÃO da tira (o espaço à direita das abas): o grupo inteiro — lote 5.
   * `id` é a aba à frente; `tabs`, todas, na ordem.
   */
  | { kind: 'grupo'; id: string; side: Side; group: number; tabs: readonly string[] };

export interface Point {
  x: number;
  y: number;
}

/** O gesto em andamento, do aperto ao largar. */
export interface DragState {
  source: DragSource;
  /** Onde a mão apertou, na tela. */
  from: Point;
  /** Onde a mão está agora, na tela. */
  at: Point;
  /** Já passou do limite do clique? Depois que passa, não volta a ser clique. */
  started: boolean;
  /**
   * Para o painel solto: onde, dentro da caixa dele, a mão pegou. É o que faz
   * o painel andar sem pular para debaixo do dedo.
   */
  grab: Point;
}

/** Uma tira de abas na tela, com o corpo do grupo dela. */
export interface StripInfo {
  side: Side;
  group: number;
  /** A tira inteira (`.panel-tabs`). */
  strip: TabRect;
  /** O corpo do grupo, abaixo da tira. `null` quando o grupo está recolhido. */
  body: TabRect | null;
  /** As abas, na ordem da tela. A aba puxada continua contando: o índice é visual. */
  tabs: readonly TabRect[];
}

/** A camada dos soltos na tela, e a cena dentro dela (para colar na quina). */
export interface DropArea {
  layer: TabRect;
  scene: SnapArea;
}

/** A linha azul de onde a aba vai entrar, na tela. */
export interface DropLine {
  x: number;
  top: number;
  bottom: number;
}

/** O que acontece se a mão largar agora. */
export type DropTarget =
  | { kind: 'nada' }
  | {
    kind: 'tira';
    side: Side;
    group: number;
    /** A posição visual na tira — passe por `insertionIndex` antes do `moveTab`. */
    visual: number;
    /** A linha azul, ou `null` quando o realce é o contorno do grupo. */
    line: DropLine | null;
    /** O contorno azul: a tira, ou a tira mais o corpo. */
    outline: TabRect;
  }
  | { kind: 'solto'; box: FloatBox; snap: FloatSnap | null };

/** O resultado do gesto inteiro, quando a mão larga. */
export type DragResult =
  | { kind: 'clique' }
  | { kind: 'nada' }
  | { kind: 'colar'; id: string; side: Side; group: number; visual: number }
  | { kind: 'soltar'; id: string; box: FloatBox; snap: FloatSnap | null }
  | { kind: 'mover'; id: string; box: FloatBox; snap: FloatSnap | null }
  /** O grupo inteiro foi para outra tira: as abas entram na ordem, a partir de `visual`. */
  | { kind: 'colarGrupo'; from: { side: Side; group: number }; side: Side; group: number; visual: number }
  /** O grupo inteiro saiu da parede (`floatGroup`). */
  | { kind: 'soltarGrupo'; from: { side: Side; group: number }; box: FloatBox; snap: FloatSnap | null };

/** A mão apertou. `grab` só importa para o painel solto (onde a barra foi pega). */
export function startDrag(source: DragSource, x: number, y: number, grab: Point = { x: 0, y: 0 }): DragState {
  return { source, from: { x, y }, at: { x, y }, started: false, grab };
}

/** A mão andou. Passou do limite uma vez, é arrasto até o fim. */
export function moveDrag(state: DragState, x: number, y: number): DragState {
  const longe = Math.hypot(x - state.from.x, y - state.from.y) >= DRAG_START_PX;
  return { ...state, at: { x, y }, started: state.started || longe };
}

const dentro = (r: TabRect, x: number, y: number): boolean => (
  x >= r.left && x <= r.right && y >= r.top && y <= r.bottom
);

/**
 * A linha azul para a posição `visual` da tira.
 *
 * Antes da aba daquela posição; depois da última, se a posição é o fim; e no
 * começo da tira, se ela está vazia.
 */
export function dropLine(tabs: readonly TabRect[], visual: number, strip: TabRect): DropLine {
  if (tabs.length === 0) return { x: strip.left + 4, top: strip.top + 4, bottom: strip.bottom - 4 };
  const antes = tabs[visual];
  if (antes !== undefined) return { x: antes.left - 1, top: antes.top, bottom: antes.bottom };
  const ultima = tabs[tabs.length - 1]!;
  return { x: ultima.right + 1, top: ultima.top, bottom: ultima.bottom };
}

/** A caixa que o painel teria se a mão largasse agora, nas coordenadas da camada. */
export function shadowBox(state: DragState, area: DropArea): { box: FloatBox; snap: FloatSnap | null } {
  const largura = area.layer.right - area.layer.left;
  const altura = area.layer.bottom - area.layer.top;
  const local = { x: state.at.x - area.layer.left, y: state.at.y - area.layer.top };
  const caixa = state.source.kind === 'solto'
    ? { x: local.x - state.grab.x, y: local.y - state.grab.y, w: state.source.box.w, h: state.source.box.h }
    : { x: local.x - FLOAT_DEFAULT_W / 2, y: local.y - GRAB_BAR_Y, w: FLOAT_DEFAULT_W, h: FLOAT_DEFAULT_H };
  const colado = snapFloat(fitFloat(caixa, largura, altura), area.scene);
  // A quina é da cena, e a cena está dentro da camada; o `fitFloat` de novo é
  // só a garantia de que colar nunca empurra o painel para fora.
  return { box: fitFloat(colado.box, largura, altura), snap: colado.snap };
}

/**
 * O que acontece se a mão largar agora — é isto que a casca desenha enquanto
 * a mão segura: a linha azul, o contorno azul ou a sombra.
 */
export function dropTarget(state: DragState, strips: readonly StripInfo[], area: DropArea): DropTarget {
  if (!state.started) return { kind: 'nada' };
  const { x, y } = state.at;

  const src = state.source;
  const proprio = (info: StripInfo): boolean => (
    src.kind !== 'solto' && src.side === info.side && src.group === info.group
  );

  for (const info of strips) {
    if (dentro(info.strip, x, y)) {
      // O grupo largado na PRÓPRIA tira não vai a lugar nenhum. (A aba na
      // própria tira, sim: é como se reordena.)
      if (src.kind === 'grupo' && proprio(info)) return { kind: 'nada' };
      const visual = dropIndex(info.tabs, x, y);
      return {
        kind: 'tira', side: info.side, group: info.group, visual,
        line: dropLine(info.tabs, visual, info.strip), outline: info.strip,
      };
    }
  }

  for (const info of strips) {
    if (info.body === null || !dentro(info.body, x, y)) continue;
    // A aba (ou o grupo) largada sobre o corpo do PRÓPRIO grupo não vai a
    // lugar nenhum: é o Photoshop, e é o arrasto que a pessoa desistiu no meio.
    if (proprio(info)) return { kind: 'nada' };
    return {
      kind: 'tira', side: info.side, group: info.group, visual: info.tabs.length, line: null,
      outline: {
        left: Math.min(info.strip.left, info.body.left), right: Math.max(info.strip.right, info.body.right),
        top: info.strip.top, bottom: info.body.bottom,
      },
    };
  }

  return { kind: 'solto', ...shadowBox(state, area) };
}

/** A mão largou. O que fazer. */
export function endDrag(state: DragState, target: DropTarget): DragResult {
  if (!state.started) return { kind: 'clique' };
  const id = state.source.id;
  const src = state.source;
  if (src.kind === 'grupo') {
    const from = { side: src.side, group: src.group };
    switch (target.kind) {
      case 'nada': return { kind: 'nada' };
      case 'tira': return { kind: 'colarGrupo', from, side: target.side, group: target.group, visual: target.visual };
      case 'solto': return { kind: 'soltarGrupo', from, box: target.box, snap: target.snap };
    }
  }
  switch (target.kind) {
    case 'nada': return { kind: 'nada' };
    case 'tira': return { kind: 'colar', id, side: target.side, group: target.group, visual: target.visual };
    case 'solto':
      return state.source.kind === 'solto'
        ? { kind: 'mover', id, box: target.box, snap: target.snap }
        : { kind: 'soltar', id, box: target.box, snap: target.snap };
  }
}

/** A frase do rodapé enquanto a mão segura — a casca escreve, isto decide. */
export function dragHint(title: string, target: DropTarget): string {
  switch (target.kind) {
    case 'nada': return '';
    case 'tira': return `Solte para colar ${title} neste grupo`;
    case 'solto': return `Solte para deixar ${title} solto aqui`;
  }
}
