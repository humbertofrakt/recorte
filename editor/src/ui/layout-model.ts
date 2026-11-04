/**
 * As DUAS colunas da bancada (dono A) — lote 16, rodada 3.
 *
 * O Humberto, com a tela do Spriter aberta ao lado da nossa: *"o Spriter é
 * limpo e claro. **Ele usa as laterais**, por isso a cena é muito mais
 * espaçosa."*
 *
 * A nossa bancada tinha uma coluna só, à direita, e a cena ficava espremida
 * entre ela e a faixa de baixo. No Spriter a cena fica **no meio**, com uma
 * coluna de cada lado:
 *
 * | Esquerda | Direita |
 * |:---|:---|
 * | Hierarquia · Ordem | Imagens (Paleta) |
 * | Propriedades do objeto | Animações · Histórico |
 *
 * Este arquivo não toca em tela nenhuma. `panel-groups.ts` continua sendo a lei
 * de **uma** coluna — onde cada aba está, qual está à frente, como as duas se
 * dividem em altura. Aqui só se junta duas delas e se guarda a largura de cada
 * lado. Regra 2 do plano: decisão em módulo puro, DOM só desenha.
 */

import {
  DEFAULT_SPLIT, defaultColumnState, groupOf, moveTab, parseColumnState, restoreAutoSplit,
  selectTab, setSplit,
} from './panel-groups.js';
import type { ColumnState } from './panel-groups.js';

/** Qual dos dois lados. */
export type Side = 'left' | 'right';

/** A bancada inteira: as duas colunas, as larguras, e o `Tab`. */
export interface LayoutState {
  left: ColumnState;
  right: ColumnState;
  /** Largura de cada coluna em pixels, na ordem esquerda, direita. */
  widths: [number, number];
  /** `true` esconde as duas colunas e a faixa de baixo — a tecla `Tab`. */
  hidden: boolean;
}

/**
 * Onde cada aba nasce, de fábrica, em cada lado.
 *
 * A ordem é a do Spriter, e não é gosto: à **esquerda** fica o que responde
 * *"o que é esta coisa que eu estou olhando?"* — a árvore, a ordem de desenho
 * e as propriedades do que está escolhido. À **direita** fica o que responde
 * *"o que eu quero fazer agora?"* — as imagens que se arrastam para a cena e a
 * lista de animações.
 *
 * Id de painel que ainda não existe — `imagens` chega no lote 20, `historico`
 * no 19 — é pulado sem estourar, que é o que `parseColumnState` já faz.
 */
export const LEFT_GROUPS: readonly (readonly string[])[] = Object.freeze([
  Object.freeze(['arvore', 'ordem']),
  Object.freeze(['propriedades']),
]);

export const RIGHT_GROUPS: readonly (readonly string[])[] = Object.freeze([
  // A **Prévia** voltou para cá no lote 25 — anotação 5 do Humberto, apontando
  // a aba dela na faixa de baixo: *"muda isso de lugar, não faz sentido tá
  // aí"*. O desvio 1 do lote 12 a tinha mandado para baixo, com o argumento de
  // que ela é sobre tempo; ele olhou e discordou, e a faixa de baixo é a
  // linha do tempo, não uma gaveta. Ela é uma janelinha do personagem, e o
  // lugar disso é ao lado de Imagens e Exibição.
  // A aba **Entidades** entrou no degrau 5 (17/09/2026, E15): *"painel
  // Entidades ao lado do Imagens"*. Ao lado quer dizer **neste grupo**, e é
  // esta lista que decide — um painel que não está escrito aqui existe no menu
  // Janela e não nasce na coluna, que é uma porta prometida e não entregue.
  // O painel **Pivôs** entrou no degrau 8 (C4): a pasta inteira em grade, com
  // a cruz, sem janela que tranca. Ele nasce no grupo da Imagens porque é a
  // mesma lista de imagens, vista por outro lado — e, de novo, é ESTA lista
  // que faz um painel nascer na coluna e ser medido pela prova.
  // O painel **Partículas** entrou na rodada 15 (04/10/2026): *"partículas
  // com menu próprio"* (`02`, seção 4). Ao lado de Entidades: as duas são
  // peças que se põem num osso. Depois do Pivôs, que é colado no Entidades (C4).
  // A aba **Malha e pesos** veio para cá na rodada 17 (L12 + PL-30, decisão do
  // Diretor, 05/10/2026): ao lado de Imagens e Pivôs, que são as mesmas
  // imagens vistas por outro lado. No grupo de baixo ela dividia a vez com
  // Animações — abrir uma escondia a outra. **Só no arranjo de fábrica**: o
  // arranjo que a pessoa guardou não muda (`parseLayout` só conserta o que falta).
  Object.freeze(['imagens', 'entidades', 'pivos', 'malha', 'particulas', 'exibicao', 'previa']),
  // A aba **Peles** entrou no lote 27 — anotação 12: *"não sei onde estão as
  // skins e como faço para usar. Skin é importante, não deixa escondido."*
  // A aba **Regras** entrou no lote 28 — anotação 13: as regras eram uma seção
  // no fim da Árvore, abaixo de dezoito ossos e vinte e três slots.
  Object.freeze(['animacoes', 'peles', 'regras', 'historico']),
]);

/** Largura de fábrica de cada coluna, em pixels. */
export const DEFAULT_WIDTH = 260;

/**
 * Os limites da largura.
 *
 * Menos de 180 não é painel: o nome de um osso com o cadeado e o olho ao lado
 * já não cabe. Mais de 480 é a cena pagando por um painel que ninguém está
 * olhando — e a cena é o ponto desta rodada inteira.
 */
export const WIDTH_MIN = 180;
export const WIDTH_MAX = 480;

function clampWidth(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return DEFAULT_WIDTH;
  return Math.min(WIDTH_MAX, Math.max(WIDTH_MIN, Math.round(value)));
}

/**
 * A divisão de altura de cada lado, de fábrica.
 *
 * À **esquerda**, meio a meio: desde o lote 22 as Propriedades abrem com a
 * ficha rápida — seis linhas com o disco e a barra —, e com 58% para a Árvore
 * o disco ficava abaixo da dobra. À direita fica o `DEFAULT_SPLIT` de sempre.
 */
export const LEFT_SPLIT = 0.5;

// ---------------------------------------------------------------------------
// A divisão de altura, guardada no navegador — lote 52, rodada 5
// ---------------------------------------------------------------------------

/** A divisão de fábrica de um lado: é a que os dois cliques na alça devolvem. */
export function defaultSplit(side: Side): number {
  return side === 'left' ? LEFT_SPLIT : DEFAULT_SPLIT;
}

/**
 * Onde a divisão mora: no `localStorage`, como o tema. É da máquina de quem
 * trabalha, e não do personagem — abrir outro arquivo não pode devolver a
 * Árvore ao tamanho de fábrica.
 */
export const SPLIT_STORAGE_KEY = 'RECORTE_divisao_das_colunas';

/** O que o navegador guarda de um lado: a divisão, e se ela é automática. */
export interface SavedSplit {
  split: number;
  /**
   * `true` quando a pessoa NUNCA arrastou a alça daquele lado. Sem isto, o
   * número guardado (mesmo sendo o de fábrica) voltaria mandando, e a divisão
   * automática de 13/09/2026 nunca valeria da segunda vez que o editor abrisse.
   */
  auto: boolean;
}

/** Lê o que foi guardado. Lixo, número fora da faixa ou lado ausente ficam de fora. */
export function parseSavedSplits(raw: string | null): Partial<Record<Side, SavedSplit>> {
  if (raw === null) return {};
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return {};
  }
  const out: Partial<Record<Side, SavedSplit>> = {};
  if (value === null || typeof value !== 'object') return out;
  for (const side of ['left', 'right'] as const) {
    const guardado = (value as Record<string, unknown>)[side];
    // Antes de 13/09/2026 o que se guardava era o número solto; um navegador
    // com esse valor continua sendo lido, e como ele só era gravado depois de
    // um arrasto, ele vale como mão: `auto: false`.
    if (typeof guardado === 'number' && Number.isFinite(guardado)) {
      out[side] = { split: setSplit(defaultColumnState(), guardado).split, auto: false };
      continue;
    }
    if (guardado === null || typeof guardado !== 'object') continue;
    const campo = (guardado as Record<string, unknown>)['split'];
    if (typeof campo !== 'number' || !Number.isFinite(campo)) continue;
    out[side] = {
      split: setSplit(defaultColumnState(), campo).split,
      auto: (guardado as Record<string, unknown>)['auto'] !== false,
    };
  }
  return out;
}

/** O texto que vai para o `localStorage`. */
export function splitsToSave(layout: LayoutState): string {
  return JSON.stringify({
    left: { split: layout.left.split, auto: layout.left.autoSplit },
    right: { split: layout.right.split, auto: layout.right.autoSplit },
  });
}

/** A bancada com as divisões guardadas no navegador por cima das do arquivo. */
export function withSavedSplits(layout: LayoutState, saved: Partial<Record<Side, SavedSplit>>): LayoutState {
  const aplicar = (coluna: ColumnState, guardado: SavedSplit | undefined): ColumnState => {
    if (guardado === undefined) return coluna;
    // `setSplit` desliga o automático, que é o certo quando a mão mandou.
    // Quando ela nunca mandou, o automático volta a valer.
    const com = setSplit(coluna, guardado.split);
    return guardado.auto ? restoreAutoSplit(com) : com;
  };
  return {
    ...layout,
    left: aplicar(layout.left, saved.left),
    right: aplicar(layout.right, saved.right),
  };
}

/** Uma coluna de fábrica, com os grupos daquele lado. */
function columnFrom(
  groups: readonly (readonly string[])[], known: readonly string[], split = DEFAULT_SPLIT,
): ColumnState {
  const filtered = groups.map((group) => group.filter((id) => known.includes(id)));
  return {
    groups: filtered.map((group) => [...group]),
    active: filtered.map((group) => group[0] ?? null),
    hidden: false,
    split,
    collapsed: filtered.map(() => false),
    // De fábrica a divisão é automática: o grupo em que se está trabalhando
    // leva a maior parte da altura (13/09/2026).
    autoSplit: true,
    focus: 0,
    // De fábrica nada está fechado nem descolado: os painéis todos na coluna.
    closed: [],
    floating: [],
  };
}

/** A bancada de fábrica, já sem os painéis que este lote ainda não tem. */
export function defaultLayout(known: readonly string[]): LayoutState {
  return {
    left: columnFrom(LEFT_GROUPS, known, LEFT_SPLIT),
    right: columnFrom(RIGHT_GROUPS, known),
    widths: [DEFAULT_WIDTH, DEFAULT_WIDTH],
    hidden: false,
  };
}

/** Todo id que a arrumação de fábrica menciona, dos dois lados. */
function everyDefaultId(): string[] {
  return [...LEFT_GROUPS.flat(), ...RIGHT_GROUPS.flat()];
}

/**
 * Lê a bancada guardada e a conserta contra os painéis que existem hoje.
 *
 * **A migração é o ponto deste função.** O `RECORTE_editor_state` de todo
 * arquivo gravado até a v3.7 guarda **uma** coluna, no formato antigo. Ela vira
 * a coluna da **direita**, que é onde ela estava na tela, e a esquerda nasce de
 * fábrica. Nada se perde e ninguém precisa arrumar a bancada de novo.
 *
 * O reconhecimento do formato antigo é a ausência de `left` e `right`: o
 * formato novo sempre traz os dois.
 */
export function parseLayout(saved: unknown, known: readonly string[]): LayoutState {
  const raw = (saved !== null && typeof saved === 'object'
    ? saved as Record<string, unknown>
    : {});

  const antigo = raw['left'] === undefined && raw['right'] === undefined
    && (raw['groups'] !== undefined || raw['active'] !== undefined || raw['split'] !== undefined);

  const fabrica = defaultLayout(known);

  if (antigo) {
    /*
     * Formato de antes do lote 16: uma coluna só, e ela era a da DIREITA.
     *
     * Quem estava naquela coluna FICA nela: o arquivo é a verdade sobre onde a
     * pessoa deixou a bancada. Só o que ela não conhecia se decide por fábrica
     * — hoje a aba `ordem`, que nasce à esquerda. Sem esta divisão, `arvore` e
     * `propriedades` apareceriam nos DOIS lados, porque a esquerda de fábrica
     * também os cita.
     */
    const naDireita = new Set(readIds(raw).filter((id) => known.includes(id)));
    for (const id of known) {
      if (naDireita.has(id)) continue;
      if (!LEFT_GROUPS.some((group) => group.includes(id))) naDireita.add(id);
    }
    return {
      left: columnFrom(LEFT_GROUPS, known.filter((id) => !naDireita.has(id)), LEFT_SPLIT),
      right: parseColumnState(raw, [...naDireita]),
      widths: fabrica.widths,
      hidden: raw['hidden'] === true,
    };
  }

  const left = raw['left'] === undefined
    ? fabrica.left
    : parseColumnState(raw['left'], known);
  const right = raw['right'] === undefined
    ? fabrica.right
    : parseColumnState(raw['right'], known);

  // `parseColumnState` põe TODO painel conhecido que ficou de fora dentro da
  // coluna que ele leu. Rodado duas vezes, ele poria cada painel nos DOIS
  // lados. Aqui se decide de quem é cada um: quem estava guardado num lado
  // fica nele, e quem sobrou vai para o lado onde nasce de fábrica.
  const naEsquerda = new Set(readIds(raw['left']));
  const naDireita = new Set(readIds(raw['right']));
  const arrumada = splitBetweenSides(left, right, known, naEsquerda, naDireita);

  const widths = Array.isArray(raw['widths']) ? raw['widths'] as unknown[] : [];
  return {
    left: arrumada.left,
    right: arrumada.right,
    widths: [clampWidth(widths[0]), clampWidth(widths[1])],
    hidden: raw['hidden'] === true,
  };
}

/**
 * Os ids que uma coluna guardada cita, sem consertar nada: os dos grupos, os
 * FECHADOS e os SOLTOS (com as abas do grupo solto).
 *
 * Rodada 50, lote 1 (doc `98`, item C): lia só os grupos. A Ordem levada para
 * a direita e solta de lá não era "da direita" para esta leitura, e a casa de
 * fábrica dela (a esquerda) a ganhava de volta numa aba órfã — que escondia o
 * corpo da janela solta. Um painel guardado num lado, em qualquer estado,
 * pertence àquele lado.
 */
function readIds(saved: unknown): string[] {
  if (saved === null || typeof saved !== 'object') return [];
  const raw = saved as Record<string, unknown>;
  const out: string[] = [];
  const groups = raw['groups'];
  if (Array.isArray(groups)) {
    for (const group of groups) {
      if (!Array.isArray(group)) continue;
      for (const id of group) if (typeof id === 'string') out.push(id);
    }
  }
  for (const lista of [raw['closed'], raw['floating']]) {
    if (!Array.isArray(lista)) continue;
    for (const item of lista) {
      if (item === null || typeof item !== 'object') continue;
      const campo = item as Record<string, unknown>;
      if (typeof campo['id'] === 'string') out.push(campo['id']);
      const abas = campo['tabs'];
      if (Array.isArray(abas)) for (const aba of abas) if (typeof aba === 'string') out.push(aba);
    }
  }
  return out;
}

/** Tira de cada lado o que pertence ao outro, e devolve os dois arrumados. */
function splitBetweenSides(
  left: ColumnState, right: ColumnState, known: readonly string[],
  naEsquerda: ReadonlySet<string>, naDireita: ReadonlySet<string>,
): { left: ColumnState; right: ColumnState } {
  const daEsquerda = (id: string): boolean => {
    if (naEsquerda.has(id)) return true;
    if (naDireita.has(id)) return false;
    return LEFT_GROUPS.some((group) => group.includes(id));
  };
  const conhecidos = new Set(known);
  const limpa = (state: ColumnState, meu: (id: string) => boolean): ColumnState => {
    const groups = state.groups.map((group) => group.filter((id) => conhecidos.has(id) && meu(id)));
    return {
      ...state,
      groups,
      active: groups.map((group, i) => {
        const wanted = state.active[i];
        return typeof wanted === 'string' && group.includes(wanted) ? wanted : group[0] ?? null;
      }),
    };
  };
  return {
    left: limpa(left, daEsquerda),
    right: limpa(right, (id) => !daEsquerda(id)),
  };
}

/** Em que lado aquela aba está, ou `null`. */
export function sideOf(layout: LayoutState, id: string): Side | null {
  if (groupOf(layout.left, id) !== -1) return 'left';
  if (groupOf(layout.right, id) !== -1) return 'right';
  return null;
}

/**
 * Em que ordem procurar "o painel em uso" — rodada 4, consertos (05/10/2026).
 *
 * Os itens Soltar o painel da parede e Fechar o grupo procuravam sempre a
 * coluna da DIREITA primeiro: com a Árvore em uso, saía um painel da direita
 * (conferência da rodada 24). O lado da última mão vem primeiro; sem nenhum,
 * a ordem de antes.
 */
export function ladosPorUso(emUso: Side | null): Side[] {
  if (emUso === 'left') return ['left', 'right'];
  return ['right', 'left'];
}

/** A coluna de um lado. */
export function columnOf(layout: LayoutState, side: Side): ColumnState {
  return side === 'left' ? layout.left : layout.right;
}

/** Põe a aba à frente do grupo dela, em qualquer um dos dois lados. */
export function selectInLayout(layout: LayoutState, id: string): LayoutState {
  const side = sideOf(layout, id);
  if (side === null) return layout;
  return side === 'left'
    ? { ...layout, left: selectTab(layout.left, id) }
    : { ...layout, right: selectTab(layout.right, id) };
}

/**
 * **Mover para a outra coluna** — o botão direito numa aba.
 *
 * Ela some do lado onde estava, entra no **fim do último grupo** do outro lado
 * e fica à frente lá: quem pede para mover quer olhar o painel do outro lado
 * agora, e não descobrir que ele foi para trás de outra aba.
 */
export function moveToOtherColumn(layout: LayoutState, id: string): LayoutState {
  const side = sideOf(layout, id);
  if (side === null) return layout;

  const origem = columnOf(layout, side);
  const destinoLado: Side = side === 'left' ? 'right' : 'left';
  const destino = columnOf(layout, destinoLado);

  const groups = origem.groups.map((group) => group.filter((other) => other !== id));
  const semEla: ColumnState = {
    ...origem,
    groups,
    active: origem.active.map((current, i) => (current === id ? groups[i]?.[0] ?? null : current)),
  };

  const ultimo = destino.groups.length - 1;
  const novosGrupos = destino.groups.map((group, i) => (i === ultimo ? [...group, id] : [...group]));
  const comEla: ColumnState = {
    ...destino,
    groups: novosGrupos,
    active: destino.active.map((current, i) => (i === ultimo ? id : current)),
  };

  return side === 'left'
    ? { ...layout, left: semEla, right: comEla }
    : { ...layout, left: comEla, right: semEla };
}

/** Muda a largura de um lado, sempre dentro dos limites. */
export function setWidth(layout: LayoutState, side: Side, width: number): LayoutState {
  const widths: [number, number] = [...layout.widths];
  widths[side === 'left' ? 0 : 1] = clampWidth(width);
  return { ...layout, widths };
}

/** Esconde ou mostra as duas colunas e a faixa de baixo — a tecla `Tab`. */
export function toggleLayoutHidden(layout: LayoutState): LayoutState {
  return { ...layout, hidden: !layout.hidden };
}

/** Todo painel que a bancada conhece, dos dois lados, sem repetir. */
export function allTabs(layout: LayoutState): string[] {
  return [...layout.left.groups.flat(), ...layout.right.groups.flat()];
}

/**
 * Os ids que a arrumação de fábrica cita mas que o programa ainda não tem.
 *
 * Existe para o teste dizer, em uma linha, **quais** painéis o plano já
 * reservou e ainda não construiu — hoje `imagens` (lote 20) e `historico`
 * (lote 19). Um id reservado que nunca chegasse seria uma aba prometida e não
 * entregue, e ninguém veria.
 */
export function missingTabs(known: readonly string[]): string[] {
  return everyDefaultId().filter((id) => !known.includes(id));
}

/** A antiga arrumação de uma coluna, para quem ainda precisar dela. */
export { defaultColumnState, moveTab };
