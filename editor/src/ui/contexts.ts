/**
 * Os contextos — rodada 4, lote 8 (05/10/2026).
 *
 * O Humberto, 04/10: *"Lá tem uma aba só de janelas. E contextos."* O Diretor
 * decidiu pelo Photoshop: o contexto é a **área de trabalho** dele — a tela
 * arrumada para uma tarefa, trocada por um **botão na barra**, além do menu
 * Janela ([webucator](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/),
 * [teachucomp](https://www.teachucomp.com/?p=31521)).
 *
 * Três contextos novos, um por tarefa do trabalho, mais os dois arranjos de
 * fábrica que já existem (Pivô e Visualização, `arrangements.ts`), que
 * continuam iguais e entram no mesmo botão.
 *
 * | Contexto | Esquerda | Direita | Linha do tempo | Por quê |
 * |:---|:---|:---|:---:|:---|
 * | **Montar** | Árvore, Ordem · Propriedades | Imagens, Entidades, Pivôs, Partículas · Skins, Regras | fechada | montar é arrastar a imagem para a cena, pendurar no osso, acertar a ordem e o pivô. Skins e regras são da base. Na base não há chave: a linha do tempo só ocuparia a cena |
 * | **Animar** | Árvore · Propriedades | Animações, Imagens, Entidades · Histórico, Exibição | **aberta** | animar é escolher a animação, pegar o osso pela Árvore, digitar nas Propriedades e pôr a chave na linha do tempo. Imagens e Entidades ficam atrás das Animações para a troca de imagem na chave, como no Spriter |
 * | **Pesos** | Árvore · Propriedades | Malha e pesos (alta) · Exibição, Histórico | fechada | a malha e os pesos são da base, e o painel é o mais alto do programa (faltavam 567 px nele, `ESTADO`): ele ganha o grupo de cima com 75% da altura, e a cena ganha a linha do tempo inteira |
 *
 * O que um contexto não cita fica **fechado**, nunca sumido: o menu Janela
 * traz qualquer um de volta — e volta para o grupo de fábrica dele, não para
 * um canto qualquer.
 *
 * A tela é dele, o arquivo é do boneco: o contexto escolhido mora no navegador
 * (`RECORTE_contexto`), nunca no `.bone`. Puro, menos a leitura do navegador,
 * que é de quem chama.
 */

import { DEFAULT_WIDTH, LEFT_GROUPS, RIGHT_GROUPS, defaultLayout } from './layout-model.js';
import type { LayoutState, Side } from './layout-model.js';
import { allArrangements, arrangementDock, arrangementHint, layoutOf } from './arrangements.js';
import type { SavedArrangements } from './arrangements.js';
import type { ColumnState } from './panel-groups.js';

/** A receita de um contexto. */
export interface ContextRecipe {
  id: string;
  name: string;
  left: readonly (readonly string[])[];
  right: readonly (readonly string[])[];
  widths: [number, number];
  /** Fatia da altura do grupo de cima, de cada lado. `null` = a automática. */
  split: [number | null, number | null];
  /** A faixa de baixo (a linha do tempo) aberta? */
  dock: boolean;
  /** A dica do botão e do menu: para que serve. */
  hint: string;
}

export const CONTEXTS: readonly ContextRecipe[] = Object.freeze([
  Object.freeze({
    id: 'contexto-montar',
    name: 'Montar',
    left: [['arvore', 'ordem'], ['propriedades']],
    right: [['imagens', 'entidades', 'pivos', 'particulas'], ['peles', 'regras']],
    widths: [DEFAULT_WIDTH, DEFAULT_WIDTH] as [number, number],
    split: [null, null] as [number | null, number | null],
    dock: false,
    hint: 'Arrastar imagens, pendurar nos ossos, acertar a ordem e o pivô',
  }),
  Object.freeze({
    id: 'contexto-animar',
    name: 'Animar',
    left: [['arvore'], ['propriedades']],
    right: [['animacoes', 'imagens', 'entidades'], ['historico', 'exibicao']],
    widths: [DEFAULT_WIDTH, DEFAULT_WIDTH] as [number, number],
    split: [null, null] as [number | null, number | null],
    dock: true,
    hint: 'Escolher a animação, pegar o osso e pôr a chave na linha do tempo',
  }),
  Object.freeze({
    id: 'contexto-pesos',
    name: 'Pesos',
    left: [['arvore'], ['propriedades']],
    right: [['malha', 'exibicao'], ['historico']],
    widths: [220, 300] as [number, number],
    split: [null, 0.75] as [number | null, number | null],
    dock: false,
    hint: 'A malha e os pesos grandes, a Árvore para escolher o osso',
  }),
]);

/**
 * Nada escolhido ainda: a tela de FÁBRICA (`defaultLayout`), que não é igual a
 * nenhum contexto. O botão diz "Padrão" — dizer "Montar" com a tela de fábrica
 * seria o botão mentir (regra 21). Mudou na ligação (lote 8): era Montar.
 */
export const DEFAULT_CONTEXT = 'padrao';

/** O nome que o botão mostra para a tela de fábrica. */
export const DEFAULT_CONTEXT_NAME = 'Padrão';

/** A chave do navegador do contexto escolhido. Nunca no `.bone`. */
export const CONTEXT_STORAGE_KEY = 'RECORTE_contexto';

/** O grupo de fábrica de um painel: para onde ele volta se reaberto pelo menu. */
export function homeOf(id: string): { side: Side; group: number } | null {
  const l = LEFT_GROUPS.findIndex((group) => group.includes(id));
  if (l !== -1) return { side: 'left', group: l };
  const r = RIGHT_GROUPS.findIndex((group) => group.includes(id));
  return r === -1 ? null : { side: 'right', group: r };
}

/**
 * A tela de um contexto, com os painéis que existem hoje. `null` se o id não
 * é de contexto nenhum (regra 21: quem chama avisa; nada de tela inventada).
 */
export function contextLayout(id: string, known: readonly string[]): LayoutState | null {
  const recipe = CONTEXTS.find((item) => item.id === id);
  if (recipe === undefined) return null;
  const base = defaultLayout(known);
  const citados = new Set([...recipe.left.flat(), ...recipe.right.flat()]);
  // Cada fechado vai para o lado de fábrica dele: é lá que o menu Janela o
  // reabre. Painel sem casa de fábrica vai para o último grupo da direita.
  const fechados: Record<Side, Array<{ id: string; group: number; at: number }>> = { left: [], right: [] };
  for (const tab of known) {
    if (citados.has(tab)) continue;
    const casa = homeOf(tab) ?? { side: 'right' as Side, group: RIGHT_GROUPS.length - 1 };
    fechados[casa.side].push({ id: tab, group: casa.group, at: fechados[casa.side].length });
  }
  const coluna = (groups: readonly (readonly string[])[], side: Side, fallback: ColumnState, split: number | null): ColumnState => {
    const filtrados = groups.map((group) => group.filter((tab) => known.includes(tab)));
    return {
      ...fallback,
      groups: filtrados.map((group) => [...group]),
      active: filtrados.map((group) => group[0] ?? null),
      collapsed: filtrados.map(() => false),
      closed: fechados[side],
      floating: [],
      ...(split === null ? {} : { split, autoSplit: false }),
    };
  };
  return {
    left: coluna(recipe.left, 'left', base.left, recipe.split[0]),
    right: coluna(recipe.right, 'right', base.right, recipe.split[1]),
    widths: [...recipe.widths] as [number, number],
    hidden: false,
  };
}

/** A faixa de baixo aberta neste contexto ou arranjo? `null` = um guardado, que não diz. */
export function contextDock(id: string): boolean | null {
  const recipe = CONTEXTS.find((item) => item.id === id);
  return recipe !== undefined ? recipe.dock : arrangementDock(id);
}

/** Uma linha do botão dos contextos. */
export type SwitcherItem =
  | { kind: 'contexto'; id: string; name: string; hint: string; current: boolean }
  | { kind: 'separador' }
  | { kind: 'acao'; id: 'arranjo-guardar' | 'arranjo-padrao'; name: string };

/**
 * O que o botão abre, de cima para baixo — a ordem do seletor do Photoshop:
 * as áreas de trabalho, depois os comandos.
 *
 * | Bloco | Itens |
 * |:---|:---|
 * | 1 | Montar · Animar · Pesos |
 * | 2 | Pivô · Visualização · os guardados por ele |
 * | 3 | Guardar este arranjo… · Voltar ao padrão do contexto |
 */
export function switcherItems(saved: SavedArrangements, current: string): SwitcherItem[] {
  const linha = (id: string, name: string, hint: string): SwitcherItem => ({
    kind: 'contexto', id, name, hint, current: id === current,
  });
  return [
    ...CONTEXTS.map((item) => linha(item.id, item.name, item.hint)),
    { kind: 'separador' },
    ...allArrangements(saved).map((item) => linha(item.id, item.name, arrangementHint(item.id))),
    { kind: 'separador' },
    { kind: 'acao', id: 'arranjo-guardar', name: 'Guardar este arranjo…' },
    { kind: 'acao', id: 'arranjo-padrao', name: 'Voltar ao padrão do contexto' },
  ];
}

/** O nome que o botão mostra. Id desconhecido (um guardado apagado) ou nenhum: "Padrão". */
export function switcherLabel(saved: SavedArrangements, current: string): string {
  const achado = switcherItems(saved, current).find((item) => item.kind === 'contexto' && item.id === current);
  return achado !== undefined && achado.kind === 'contexto' ? achado.name : DEFAULT_CONTEXT_NAME;
}

/**
 * A tela de qualquer item do botão: contexto, arranjo de fábrica ou guardado.
 * `null` = o id sumiu (um guardado apagado em outra aba): quem chama avisa.
 */
export function switchTo(id: string, known: readonly string[], saved: SavedArrangements): LayoutState | null {
  return contextLayout(id, known) ?? layoutOf(id, known, saved);
}

/** Lê o contexto guardado. Desconhecido vira o de fábrica. */
export function parseContext(raw: string | null, saved: SavedArrangements): string {
  if (raw === null) return DEFAULT_CONTEXT;
  const conhecido = switcherItems(saved, '').some((item) => item.kind === 'contexto' && item.id === raw);
  return conhecido ? raw : DEFAULT_CONTEXT;
}
