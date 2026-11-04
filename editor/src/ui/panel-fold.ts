/**
 * Dois cliques recolhem — rodada 4, lote 4 (05/10/2026).
 *
 * O Photoshop: **dois cliques na aba** (ou na barra do grupo) recolhem o
 * painel até a tira; dois cliques de novo o devolvem
 * ([apogeephoto](https://www.apogeephoto.com/photoshop-setting-up-your-workspace-with-panels/)).
 * A conferência da rodada 4 (`09 OS PAINEIS`, fotos `13` e `40`): no nosso,
 * dois cliques na aba e na barra do painel solto não faziam nada. O `▾` no
 * fim da tira recolhia — o mesmo efeito por outro gesto, que continua.
 *
 * | Onde | Dois cliques fazem |
 * |:---|:---|
 * | na aba de um grupo da coluna | recolhe o grupo (o mesmo que o `▾`); de novo, abre |
 * | na barra do painel solto | o painel encolhe até a barra; de novo, volta ao tamanho |
 *
 * O primeiro dos dois cliques continua escolhendo a aba, como no Photoshop.
 *
 * **O painel solto recolhido** é uma marca nova no item do solto
 * (`recolhido: true`), guardada no navegador com o resto da arrumação. Um
 * programa de antes desta marca a ignora, e o painel abre aberto — nada se
 * perde. Puro.
 */

import { groupOf, isCollapsed, toggleCollapsed } from './panel-groups.js';
import type { ColumnState, FloatBox } from './panel-groups.js';

/** A altura da barra do painel solto, medida no `programa/` v25.7: 35 px. */
export const FLOAT_BAR_H = 35;

/** O item do painel solto com a marca nova. Sem a marca, está aberto. */
export type FoldableFloat = ColumnState['floating'][number] & { recolhido?: boolean };

/** O que os dois cliques na aba responderam. */
export interface FoldResult {
  state: ColumnState;
  /** A frase do rodapé: o que aconteceu, ou por que nada aconteceu. */
  notice: string;
}

/**
 * Dois cliques na aba `id`: recolhe ou abre o grupo dela.
 *
 * O último grupo aberto não recolhe (a coluna ficaria sem painel): aí nada
 * muda, e o rodapé diz o caminho para a tela inteira.
 */
export function tabDoubleClick(state: ColumnState, id: string, title: string): FoldResult {
  const group = groupOf(state, id);
  if (group === -1) return { state, notice: '' };
  const estava = isCollapsed(state, group);
  const proximo = toggleCollapsed(state, group);
  if (proximo === state) {
    return { state, notice: `${title} é o último grupo aberto desta coluna. Para a cena inteira: Tab, ou recolher a coluna em ícones` };
  }
  // Rodada 50, lote 4: "Painel Ordem recolhido" — concorda com qualquer nome de painel.
  return { state: proximo, notice: estava ? `Painel ${title} aberto` : `Painel ${title} recolhido. Dois cliques na aba abrem de novo` };
}

/** O painel solto está recolhido até a barra? */
export function isFloatFolded(state: ColumnState, id: string): boolean {
  const item = state.floating.find((outro) => outro.id === id) as FoldableFloat | undefined;
  return item?.recolhido === true;
}

/** Dois cliques na barra do solto: recolhe ou devolve. O tamanho guardado não muda. */
export function toggleFloatFold(state: ColumnState, id: string): ColumnState {
  if (!state.floating.some((item) => item.id === id)) return state;
  return {
    ...state,
    floating: state.floating.map((item) => {
      if (item.id !== id) return item;
      const { recolhido, ...resto } = item as FoldableFloat;
      return recolhido === true ? resto : { ...resto, recolhido: true };
    }),
  };
}

/**
 * A caixa que se DESENHA: recolhido, só a barra; aberto, a caixa inteira.
 * A caixa guardada fica com a altura de antes, e é ela que volta.
 */
export function drawnFloatBox(box: FloatBox, folded: boolean): FloatBox {
  return folded ? { ...box, h: Math.min(box.h, FLOAT_BAR_H) } : box;
}

/** Lê a marca de um item guardado: só `true` recolhe. Qualquer outra coisa, aberto. */
export function readFold(raw: unknown): { recolhido?: true } {
  return raw !== null && typeof raw === 'object' && (raw as Record<string, unknown>)['recolhido'] === true
    ? { recolhido: true }
    : {};
}
