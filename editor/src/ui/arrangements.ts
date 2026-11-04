/**
 * **Arranjos com nome** — degrau 11, lote 4 (18/09/2026), C6.
 *
 * O menu Janela guardava **um** arranjo só: "Voltar ao padrão", e nada mais.
 * A pesquisa dos modos (17/09) mostrou o buraco: o modo Pivô e o modo
 * Visualização que o Humberto pediu não são freio nenhum — são **a tela
 * arrumada para uma tarefa**, e para isso é preciso poder guardar uma tela com
 * nome e trazê-la de volta.
 *
 * | O que é | Onde mora |
 * |:---|:---|
 * | Os dois de **fábrica** (Pivô e Visualização) | aqui, como receita: uma lista de painéis por grupo, montada com os painéis que existirem |
 * | Os **guardados** por quem usa | no navegador (`RECORTE_arranjos`), como a arrumação e o tema. **Nunca no `.bone`** |
 *
 * De fábrica eles são receita, e não fotografia: um arranjo guardado com os
 * painéis de hoje ficaria com nomes que podem sumir amanhã. `layoutOf` monta o
 * arranjo com o que o programa tem agora, e o que faltar é pulado — a mesma
 * regra do `columnFrom`.
 *
 * Módulo puro em cima, armazenamento no fim. Sem `localStorage` (aba anônima,
 * teste) valem só os dois de fábrica.
 */

import { DEFAULT_WIDTH, defaultLayout, parseLayout } from './layout-model.js';
import type { LayoutState } from './layout-model.js';

/** Um arranjo: o nome que se lê no menu e a tela que ele monta. */
export interface Arrangement {
  /** O que aparece no menu Janela. */
  name: string;
  /** O id da ação: `arranjo-pivo`. Sai do nome, e é único. */
  id: string;
  /** `true` nos dois de fábrica: não se apagam. */
  factory: boolean;
}

/** Uma receita de fábrica: os grupos de cada lado e as larguras. */
interface Recipe {
  name: string;
  left: readonly (readonly string[])[];
  right: readonly (readonly string[])[];
  widths: [number, number];
  /** A faixa de baixo (a linha do tempo) aberta neste arranjo? */
  dock: boolean;
  /** Por que este arranjo existe, para a dica do menu. */
  hint: string;
}

/**
 * Os dois arranjos de fábrica, pelas palavras do Humberto (Q37, 17/09).
 *
 * **Pivô**: *"acertar e organizar o pivô de ~30 peças rápido"*. A grade de
 * imagens e o painel Pivôs ficam grandes, de um lado só, e a cena continua
 * inteira — é onde se vê o ponto cair no lugar.
 *
 * **Visualização**: *"rodar as animações e pôr e tirar peles para testar"*. A
 * Prévia em cima, as animações e as peles embaixo dela, e a faixa de baixo
 * fechada: aqui se olha, não se edita chave.
 */
const RECIPES: readonly Recipe[] = Object.freeze([
  Object.freeze({
    name: 'Pivô',
    left: Object.freeze([Object.freeze(['arvore', 'ordem']), Object.freeze(['propriedades'])]),
    right: Object.freeze([Object.freeze(['pivos', 'imagens']), Object.freeze(['exibicao'])]),
    widths: [220, 420] as [number, number],
    dock: false,
    hint: 'A grade dos pivôs grande, de um lado só: acertar o ponto de muitas peças seguidas',
  }),
  Object.freeze({
    name: 'Visualização',
    left: Object.freeze([Object.freeze(['arvore']), Object.freeze(['propriedades'])]),
    right: Object.freeze([Object.freeze(['previa']), Object.freeze(['animacoes', 'peles'])]),
    widths: [200, 380] as [number, number],
    dock: false,
    hint: 'A Prévia com as animações e as skins ao lado: rodar e testar, sem editar chave',
  }),
]);

/** O id da ação de um arranjo, a partir do nome. Sem acento e sem espaço. */
export function arrangementId(name: string): string {
  const limpo = name.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `arranjo-${limpo === '' ? 'sem-nome' : limpo}`;
}

/** Os dois de fábrica, na ordem do menu. */
export function factoryArrangements(): Arrangement[] {
  return RECIPES.map((recipe) => ({ name: recipe.name, id: arrangementId(recipe.name), factory: true }));
}

/** A dica de um arranjo de fábrica, ou `''`. */
export function arrangementHint(id: string): string {
  return RECIPES.find((recipe) => arrangementId(recipe.name) === id)?.hint ?? '';
}

/** A faixa de baixo fica aberta neste arranjo? `null` = não é de fábrica. */
export function arrangementDock(id: string): boolean | null {
  const recipe = RECIPES.find((r) => arrangementId(r.name) === id);
  return recipe === undefined ? null : recipe.dock;
}

/**
 * A tela que um arranjo monta, com os painéis que existem hoje.
 *
 * `null` quando o id não é de nenhum arranjo conhecido — regra 21: um arranjo
 * que sumiu não vira uma tela inventada; quem chama avisa.
 */
export function layoutOf(id: string, known: readonly string[], saved: SavedArrangements = {}): LayoutState | null {
  const recipe = RECIPES.find((r) => arrangementId(r.name) === id);
  if (recipe !== undefined) {
    const base = defaultLayout(known);
    const coluna = (groups: readonly (readonly string[])[], fallback: LayoutState['left']): LayoutState['left'] => {
      const filtrados = groups.map((group) => group.filter((tab) => known.includes(tab)));
      // Tudo o que o arranjo não cita fica FECHADO, e não sumido: o menu
      // Janela continua trazendo qualquer um de volta, pela porta de sempre.
      return {
        ...fallback,
        groups: filtrados.map((group) => [...group]),
        active: filtrados.map((group) => group[0] ?? null),
        collapsed: filtrados.map(() => false),
        closed: fallback.closed.map((item) => ({ ...item })),
        floating: [],
      };
    };
    const citados = new Set([...recipe.left.flat(), ...recipe.right.flat()]);
    const fechados = known.filter((tab) => !citados.has(tab)).map((tab, at) => ({ id: tab, group: 0, at }));
    const left = coluna(recipe.left, base.left);
    const right = coluna(recipe.right, base.right);
    return {
      left: { ...left, closed: fechados },
      right: { ...right, closed: [] },
      widths: recipe.widths,
      hidden: false,
    };
  }
  const guardado = saved[id];
  if (guardado === undefined) return null;
  return reviveLayout(guardado, known);
}

// ---------------------------------------------------------------------------
// Os guardados por quem usa
// ---------------------------------------------------------------------------

/** O que fica gravado de um arranjo guardado: o nome e a tela inteira. */
export interface SavedArrangement {
  name: string;
  layout: unknown;
}

export type SavedArrangements = Readonly<Record<string, SavedArrangement>>;

/** A chave do navegador onde os arranjos moram. Nunca no `.bone`. */
export const ARRANGEMENTS_KEY = 'RECORTE_arranjos';

/** Quantos arranjos se pode guardar. Mais que isso não é lista, é gaveta. */
export const MAX_ARRANGEMENTS = 12;

/**
 * Lê o que estava gravado. O que não tem nome ou tela sai, e sai **contado**.
 */
export function parseArrangements(saved: unknown): { arranjos: SavedArrangements; dropped: number } {
  const out: Record<string, SavedArrangement> = {};
  let dropped = 0;
  if (saved === null || typeof saved !== 'object' || Array.isArray(saved)) return { arranjos: out, dropped };
  for (const [id, valor] of Object.entries(saved as Record<string, unknown>)) {
    const item = valor as { name?: unknown; layout?: unknown } | null;
    if (item === null || typeof item !== 'object'
      || typeof item.name !== 'string' || item.name.trim() === ''
      || item.layout === null || typeof item.layout !== 'object'
      || !id.startsWith('arranjo-')) {
      dropped += 1;
      continue;
    }
    out[id] = { name: item.name, layout: item.layout };
  }
  return { arranjos: out, dropped };
}

/** Os guardados, na ordem do nome, para o menu. */
export function savedList(saved: SavedArrangements): Arrangement[] {
  return Object.entries(saved)
    .map(([id, item]) => ({ id, name: item.name, factory: false }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pt'));
}

/** Os arranjos do menu Janela: os dois de fábrica e depois os guardados. */
export function allArrangements(saved: SavedArrangements): Arrangement[] {
  return [...factoryArrangements(), ...savedList(saved)];
}

/** O que `guardar` responde. Nome repetido troca o de antes, e diz isso. */
export type SaveResult =
  | { ok: true; arranjos: SavedArrangements; notice: string }
  | { ok: false; notice: string };

export function saveArrangement(
  saved: SavedArrangements, name: string, layout: unknown,
): SaveResult {
  const limpo = name.trim();
  if (limpo === '') return { ok: false, notice: 'O arranjo precisa de um nome.' };
  const id = arrangementId(limpo);
  if (factoryArrangements().some((item) => item.id === id)) {
    return { ok: false, notice: `"${limpo}" é um arranjo de fábrica: escolha outro nome.` };
  }
  const trocou = saved[id] !== undefined;
  if (!trocou && Object.keys(saved).length >= MAX_ARRANGEMENTS) {
    return {
      ok: false,
      notice: `Já há ${MAX_ARRANGEMENTS} arranjos guardados. Apague um antes de guardar outro.`,
    };
  }
  return {
    ok: true,
    arranjos: { ...saved, [id]: { name: limpo, layout } },
    notice: trocou ? `Arranjo "${limpo}" regravado.` : `Arranjo "${limpo}" guardado.`,
  };
}

/** Apaga um guardado. Os de fábrica não se apagam. */
export function deleteArrangement(saved: SavedArrangements, id: string): SaveResult {
  if (factoryArrangements().some((item) => item.id === id)) {
    return { ok: false, notice: 'Os arranjos de fábrica não se apagam.' };
  }
  const item = saved[id];
  if (item === undefined) return { ok: false, notice: 'Esse arranjo já não existe.' };
  const { [id]: _fora, ...resto } = saved;
  return { ok: true, arranjos: resto, notice: `Arranjo "${item.name}" apagado.` };
}

// ---------------------------------------------------------------------------
// Na máquina
// ---------------------------------------------------------------------------

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

let current: SavedArrangements | null = null;
const listeners = new Set<() => void>();

/** Os arranjos guardados nesta máquina. */
export function arrangements(): SavedArrangements {
  if (current === null) {
    current = {};
    const store = storage();
    if (store !== null) {
      try {
        const texto = store.getItem(ARRANGEMENTS_KEY);
        if (texto !== null) current = parseArrangements(JSON.parse(texto)).arranjos;
      } catch {
        current = {};
      }
    }
  }
  return current;
}

/** Grava. `false` = o navegador não deixou, e vale só nesta sessão. */
export function setArrangements(next: SavedArrangements): boolean {
  current = { ...next };
  let gravou = true;
  const store = storage();
  if (store !== null) {
    try {
      if (Object.keys(current).length === 0) store.removeItem(ARRANGEMENTS_KEY);
      else store.setItem(ARRANGEMENTS_KEY, JSON.stringify(current));
    } catch {
      gravou = false;
    }
  }
  for (const listener of [...listeners]) listener();
  return gravou;
}

export function onArrangementsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// ---------------------------------------------------------------------------
// A tela guardada, de volta
// ---------------------------------------------------------------------------

/**
 * A tela de um arranjo guardado, consertada contra os painéis de hoje.
 *
 * É o mesmo caminho da arrumação que a casca grava — e por isso o arranjo
 * guardado com um painel que não existe mais não estoura: `parseLayout` já
 * sabe jogar fora o que não conhece e trazer de volta o que ficou de fora.
 */
function reviveLayout(item: SavedArrangement, known: readonly string[]): LayoutState {
  const lido = parseLayout(item.layout, known);
  return {
    ...lido,
    widths: [
      Number.isFinite(lido.widths[0]) ? lido.widths[0] : DEFAULT_WIDTH,
      Number.isFinite(lido.widths[1]) ? lido.widths[1] : DEFAULT_WIDTH,
    ],
  };
}
