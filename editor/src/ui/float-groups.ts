/**
 * Soltar o grupo inteiro — rodada 4, lote 5 (05/10/2026).
 *
 * O Photoshop: puxar a **barra do grupo** solta o grupo inteiro, com as abas
 * dele ([webucator](https://www.webucator.com/article/how-to-use-panels-in-adobe-photoshop/)).
 * No nosso, a barra do grupo é o **vão da tira** (o espaço à direita das
 * abas): a conferência (`09 OS PAINEIS`) viu que puxá-lo não fazia nada.
 *
 * ## O dado guardado
 *
 * Hoje um painel solto é UM painel: `{ id, group, at, x, y, w, h, snap? }`.
 * O grupo solto é o mesmo item com uma lista a mais:
 *
 * ```
 * { id: 'imagens', tabs: ['imagens', 'entidades', 'pivos'], group: 0, at: 0, x, y, w, h }
 * ```
 *
 * `id` é a aba à frente; `tabs` são todas, na ordem, com a da frente dentro.
 *
 * | Quem lê | O que acontece |
 * |:---|:---|
 * | **este programa, um arranjo ANTIGO** (sem `tabs`) | é um painel solto de uma aba só — exatamente como hoje. `tabsOf` devolve `[id]` |
 * | **um programa de ANTES deste lote, um arranjo novo** (o Humberto diz "volta pra 0.5") | o leitor antigo ignora `tabs`. O painel da frente abre solto; os outros do grupo não estão em grupo, nem fechados, nem soltos — e a regra 2 do `parseColumnState` os põe **de volta no grupo de fábrica deles**. Nada se perde: no pior caso voltam para a coluna |
 * | **este programa, um `tabs` torto** (painel que não existe mais, repetido, em outro lugar) | `readFloatTabs` joga fora o que não conhece e o que já está em outro lugar; a da frente sempre fica |
 *
 * Puro. Funciona sobre o `ColumnState` de `panel-groups`, com o campo novo
 * opcional — quem não usa o campo não muda.
 */

import { FLOAT_DEFAULT_H, FLOAT_DEFAULT_W } from './panel-groups.js';
import type { ColumnState, FloatBox } from './panel-groups.js';

/** O item solto com a lista de abas. Sem `tabs`, é o solto de uma aba de hoje. */
export type FloatGroupItem = ColumnState['floating'][number] & { tabs?: string[] };

/** As abas de um solto, na ordem. Sem lista: só ele. */
export function tabsOf(item: FloatGroupItem): string[] {
  return item.tabs !== undefined && item.tabs.length > 0 ? [...item.tabs] : [item.id];
}

/** O solto que contém o painel `id` (à frente ou atrás), ou `null`. */
export function floatHolding(state: ColumnState, id: string): FloatGroupItem | null {
  return (state.floating as FloatGroupItem[]).find((item) => tabsOf(item).includes(id)) ?? null;
}

/**
 * Solta o grupo `index` inteiro, na caixa `box`. A aba à frente continua à
 * frente. Grupo vazio não solta nada.
 *
 * A coluna fica com o grupo vazio — "dois grupos é a forma da coluna", e o
 * grupo vazio ainda aceita aba arrastada de volta (é o mesmo que o
 * `moveTab` faz).
 */
export function floatGroup(state: ColumnState, index: number, box: FloatBox): ColumnState {
  const ids = state.groups[index];
  if (ids === undefined || ids.length === 0) return state;
  const frente = state.active[index] ?? ids[0]!;
  const groups = state.groups.map((lista, i) => (i === index ? [] : [...lista]));
  const active = state.active.map((atual, i) => (i === index ? null : atual));
  const collapsed = state.collapsed.map((um, i) => (i === index ? false : um));
  const outro = groups.findIndex((lista) => lista.length > 0);
  const item: FloatGroupItem = { id: frente, tabs: [...ids], group: index, at: 0, ...box };
  return {
    ...state,
    groups,
    active,
    collapsed,
    focus: state.focus === index && outro !== -1 ? outro : state.focus,
    floating: [...state.floating, item],
  };
}

/** A caixa de fábrica de um grupo recém-solto, para quem não mediu nada. */
export function defaultGroupBox(x: number, y: number): FloatBox {
  return { x, y, w: FLOAT_DEFAULT_W, h: FLOAT_DEFAULT_H };
}

/** Escolhe a aba da frente dentro de um grupo solto. */
export function selectFloatTab(state: ColumnState, id: string): ColumnState {
  const dono = floatHolding(state, id);
  if (dono === null || dono.id === id) return state;
  return {
    ...state,
    floating: (state.floating as FloatGroupItem[]).map((item) => (
      item === dono ? { ...item, id, tabs: tabsOf(item) } : item
    )),
  };
}

/**
 * Cola o grupo solto de volta, TODAS as abas, na ordem, no grupo `toGroup`
 * a partir da posição `at`. Sem destino: volta para o grupo de onde saiu.
 * A da frente continua à frente.
 */
export function dockFloatGroup(state: ColumnState, id: string, toGroup?: number, at?: number): ColumnState {
  const dono = floatHolding(state, id);
  if (dono === null) return state;
  const destino = Math.min(state.groups.length - 1, Math.max(0, toGroup ?? dono.group));
  const groups = state.groups.map((lista) => [...lista]);
  const alvo = groups[destino]!;
  const onde = Math.min(Math.max(0, at ?? (toGroup === undefined ? dono.at : alvo.length)), alvo.length);
  alvo.splice(onde, 0, ...tabsOf(dono));
  const active = [...state.active];
  active[destino] = dono.id;
  const collapsed = [...state.collapsed];
  collapsed[destino] = false;
  return {
    ...state,
    groups,
    active,
    collapsed,
    focus: destino,
    floating: state.floating.filter((item) => item !== dono),
  };
}

/**
 * Todos os soltos de volta, grupo por grupo — o resgate do "Voltar ao padrão".
 *
 * O `dockAllFloating` de hoje só devolve o `id` de cada solto: com um grupo
 * solto, as outras abas ficariam em lugar nenhum. Esta é a que a casca passa
 * a chamar.
 */
export function dockAllFloatGroups(state: ColumnState): ColumnState {
  let proximo = state;
  for (const item of [...state.floating].reverse()) proximo = dockFloatGroup(proximo, item.id);
  return proximo;
}

/**
 * Lê o `tabs` de um item guardado, contra os painéis de hoje.
 *
 * `seen` são os painéis já postos em algum lugar (grupos, fechados, outros
 * soltos), e é ATUALIZADO aqui: nenhuma aba fica em dois lugares (regra 3 do
 * `parseColumnState`). A da frente (`lead`) já foi lida por quem chama e
 * sempre fica, na posição em que estava.
 *
 * Devolve `{}` quando sobra só a da frente: é o solto de uma aba, e o
 * arquivo fica como era.
 */
export function readFloatTabs(
  raw: unknown, lead: string, known: readonly string[], seen: Set<string>,
): { tabs?: string[] } {
  if (raw === null || typeof raw !== 'object') return {};
  const lista = (raw as Record<string, unknown>)['tabs'];
  if (!Array.isArray(lista)) return {};
  const tabs: string[] = [];
  for (const id of lista) {
    if (id === lead) {
      if (!tabs.includes(lead)) tabs.push(lead);
      continue;
    }
    if (typeof id !== 'string' || !known.includes(id) || seen.has(id) || tabs.includes(id)) continue;
    tabs.push(id);
    seen.add(id);
  }
  if (!tabs.includes(lead)) tabs.unshift(lead);
  return tabs.length > 1 ? { tabs } : {};
}
