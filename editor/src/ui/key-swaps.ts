/**
 * **A tabela de troca das teclas** — degrau 11, lote 2 (18/09/2026), G7.
 *
 * O Humberto: *"o sistema de trocar as teclas, com a tabela de troca na
 * máquina, a Ajuda mostrando as trocadas e o conflito avisando"*.
 *
 * A tabela de fábrica continua sendo `ui/keys.ts`: uma tecla nova ainda é uma
 * linha lá. O que mora aqui é só a **diferença** que esta pessoa escolheu —
 * *"esta linha, nesta máquina, atende por esta outra tecla"* — guardada no
 * navegador, como o tema e o arranjo dos painéis, e **nunca no `.bone`**: o
 * boneco que se entrega não leva as teclas de quem o fez.
 *
 * Três regras, e as três são a regra 21:
 *
 * | Regra | |
 * |:---|:---|
 * | O conflito **avisa** | tecla que já é de outra coisa no mesmo lugar não troca em silêncio: a troca é recusada, com o nome de quem já tem a tecla |
 * | A tecla fixa **diz** que é fixa | as que o programa lê direto do teclado (Espaço, as setas de andar, 7 8 9 0, o P de segurar) não fingem que trocam |
 * | O que estava gravado e não existe mais **é contado** | `parseSwaps` devolve o que jogou fora, e a Ajuda diz quantas |
 *
 * A parte de cima é pura. O armazenamento, no fim, aguenta não haver
 * `localStorage` (aba anônima, teste): aí as teclas são as de fábrica.
 */

import type { KeyBinding } from './keys.js';

/** De linha da tabela (`bindingId`) para a tecla nova, como `shortcutOfEvent` escreve. */
export type KeySwaps = Readonly<Record<string, string>>;

/** Uma linha depois da troca: a tecla que vale, e a de fábrica ao lado. */
export interface LiveBinding extends KeyBinding {
  /** O nome da linha na tabela de troca. */
  id: string;
  /** A tecla de fábrica. Igual a `key` quando não houve troca. */
  defaultKey: string;
  /** `true` quando esta pessoa trocou a tecla desta linha. */
  swapped: boolean;
  /** `true` quando o programa lê esta tecla direto do teclado: não se troca. */
  fixed: boolean;
}

/** O nome de uma linha: onde vale, o que faz, e a tecla de fábrica. */
export function bindingId(row: Pick<KeyBinding, 'scope' | 'action' | 'key'>): string {
  return `${row.scope}|${row.action}|${row.key}`;
}

/*
 * As ações cuja tecla o programa lê DIRETO do evento, sem passar pela tabela:
 * o Espaço da cena (segurar e arrastar, ou tocar), as setas que andam com o
 * escolhido, o 7 8 9 0 de ver e travar (`toggleViewKey`), o P de segurar (é a
 * ferramenta na mão que o ouve) e o Ctrl+Shift+Z. Trocá-las na tabela não
 * mudaria o que o dedo faz — e uma troca que não vale é pior que nenhuma.
 */
const FIXED_ACTIONS: ReadonlySet<string> = new Set([
  'local:mover-vista', 'local:andar', 'local:andar-10', 'local:pegar-filhos',
  'ver-ossos', 'travar-ossos', 'ver-desenhos', 'travar-desenhos', 'tocar',
]);

/** A tecla desta linha é lida direto do teclado? */
export function isFixed(row: Pick<KeyBinding, 'action' | 'key'>): boolean {
  return FIXED_ACTIONS.has(row.action) || row.key === ' ' || row.key === 'ctrl+shift+z';
}

/** A tabela com as trocas aplicadas. A de fábrica não é tocada. */
export function applySwaps(table: readonly KeyBinding[], swaps: KeySwaps): LiveBinding[] {
  return table.map((row) => {
    const id = bindingId(row);
    const fixed = isFixed(row);
    const nova = fixed ? undefined : swaps[id];
    const swapped = nova !== undefined && nova !== row.key;
    const key = swapped ? nova : row.key;
    return {
      ...row,
      key,
      ...(row.help === undefined ? {} : {
        help: { menu: row.help.menu, shortcut: swapped ? prettyKey(key) : row.help.shortcut },
      }),
      id, defaultKey: row.key, swapped, fixed,
    };
  });
}

const PRETTY: Readonly<Record<string, string>> = Object.freeze({
  arrowup: '↑', arrowdown: '↓', arrowleft: '←', arrowright: '→',
  ' ': 'Espaço', escape: 'Esc', delete: 'Delete', backspace: 'Backspace',
  home: 'Home', end: 'End', pageup: 'PageUp', pagedown: 'PageDown',
  enter: 'Enter', tab: 'Tab', insert: 'Insert',
});

/** `'ctrl+shift+arrowup'` → `'Ctrl+Shift+↑'`: a tecla como se lê no menu. */
export function prettyKey(key: string): string {
  // A tecla "+" sozinha, ou no fim ("ctrl++"), não pode ser partida no sinal.
  const parts = key === '+' ? ['+'] : key.endsWith('++') ? [...key.slice(0, -2).split('+'), '+'] : key.split('+');
  return parts.map((part) => {
    if (part === 'ctrl') return 'Ctrl';
    if (part === 'alt') return 'Alt';
    if (part === 'shift') return 'Shift';
    const nome = PRETTY[part];
    if (nome !== undefined) return nome;
    return part.length === 1 ? part.toUpperCase() : part.charAt(0).toUpperCase() + part.slice(1);
  }).join('+');
}

/** Os lugares, em palavras, para a frase do conflito. */
const SCOPE_WORDS: Readonly<Record<KeyBinding['scope'], string>> = Object.freeze({
  'toda-parte': 'em toda parte',
  cena: 'na cena',
  'linha-do-tempo': 'na linha do tempo',
  arvore: 'na Árvore',
  ordem: 'na aba Ordem',
});

/*
 * As teclas que não chegam ao programa, ou que são dele para sempre. O
 * navegador fica com as primeiras; Esc, Enter e Tab fecham janela, confirmam e
 * escondem os painéis, e o Espaço é o tocador e a mão de mover a vista.
 */
const RESERVED: Readonly<Record<string, string>> = Object.freeze({
  'ctrl+w': 'o navegador fecha a aba com ela',
  'ctrl+t': 'o navegador abre uma aba com ela',
  'ctrl+r': 'o navegador recarrega a página com ela',
  'ctrl+tab': 'o navegador troca de aba com ela',
  f5: 'o navegador recarrega a página com ela',
  f11: 'o navegador põe a janela em tela cheia com ela',
  f12: 'o navegador abre as ferramentas dele com ela',
  escape: 'Esc fecha janelas e cancela gestos',
  enter: 'Enter confirma as janelas',
  ' ': 'o Espaço toca a animação e move a vista',
});

/** O que `proposeSwap` responde. */
export type SwapResult =
  | { ok: true; swaps: KeySwaps; notice: string }
  | { ok: false; notice: string; conflict?: LiveBinding };

/**
 * Tenta trocar a tecla de uma linha. **Nunca troca em silêncio sobre outra.**
 *
 * Conflito é: outra linha, fazendo outra coisa, com a mesma tecla, **no mesmo
 * lugar — ou em toda parte**. A tabela de fábrica deixa uma tecla de painel
 * repetir uma de toda parte (o `M` é Malha fora da linha do tempo e marca
 * dentro dela), porque alguém pensou nas duas juntas; uma troca feita à mão não
 * teve esse alguém, e por isso a régua dela é mais dura.
 */
export function proposeSwap(
  table: readonly KeyBinding[], swaps: KeySwaps, id: string, key: string,
): SwapResult {
  const live = applySwaps(table, swaps);
  const row = live.find((r) => r.id === id);
  if (row === undefined) return { ok: false, notice: 'Essa linha não existe mais na tabela de teclas.' };
  if (row.fixed) return { ok: false, notice: `A tecla de "${row.label}" é fixa: o programa a lê direto do teclado.` };
  if (key === '' || ['ctrl', 'alt', 'shift', 'control', 'meta'].includes(key.split('+').pop() ?? '')) {
    return { ok: false, notice: 'Isso é só um modificador. Aperte a tecla junto.' };
  }
  const reservada = RESERVED[key];
  if (reservada !== undefined) {
    return { ok: false, notice: `${prettyKey(key)} não pode ser usada: ${reservada}. A tecla não foi trocada.` };
  }
  const conflict = live.find((other) => other.id !== id
    && other.key === key
    && other.action !== row.action
    && (other.scope === row.scope || other.scope === 'toda-parte' || row.scope === 'toda-parte'));
  if (conflict !== undefined) {
    return {
      ok: false,
      conflict,
      notice: `${prettyKey(key)} já é de "${conflict.label}" (${SCOPE_WORDS[conflict.scope]}). `
        + 'A tecla não foi trocada. Troque a de lá primeiro, ou escolha outra.',
    };
  }
  const next: Record<string, string> = { ...swaps };
  if (key === row.defaultKey) delete next[id];
  else next[id] = key;
  return {
    ok: true,
    swaps: next,
    notice: key === row.defaultKey
      ? `"${row.label}" voltou à tecla de fábrica, ${prettyKey(key)}.`
      : `"${row.label}" agora é ${prettyKey(key)} (era ${prettyKey(row.defaultKey)}).`,
  };
}

/** Devolve uma linha à tecla de fábrica — se a de fábrica ainda estiver livre. */
export function restoreSwap(table: readonly KeyBinding[], swaps: KeySwaps, id: string): SwapResult {
  const row = applySwaps(table, swaps).find((r) => r.id === id);
  if (row === undefined) return { ok: false, notice: 'Essa linha não existe mais na tabela de teclas.' };
  return proposeSwap(table, swaps, id, row.defaultKey);
}

/** As linhas trocadas, para a Ajuda contar e listar. */
export function swappedRows(table: readonly KeyBinding[], swaps: KeySwaps): LiveBinding[] {
  return applySwaps(table, swaps).filter((row) => row.swapped);
}

/**
 * Lê o que estava gravado. O que não é de uma linha que existe, ou não é
 * texto, sai — e sai **contado**: `dropped` é o que a Ajuda diz que perdeu.
 */
export function parseSwaps(saved: unknown, table: readonly KeyBinding[]): { swaps: KeySwaps; dropped: string[] } {
  const swaps: Record<string, string> = {};
  const dropped: string[] = [];
  if (saved === null || typeof saved !== 'object' || Array.isArray(saved)) return { swaps, dropped };
  const ids = new Set(table.filter((row) => !isFixed(row)).map(bindingId));
  for (const [id, key] of Object.entries(saved as Record<string, unknown>)) {
    if (ids.has(id) && typeof key === 'string' && key !== '') swaps[id] = key;
    else dropped.push(id);
  }
  return { swaps, dropped };
}

// ---------------------------------------------------------------------------
// Na máquina
// ---------------------------------------------------------------------------

/** A chave do navegador onde a tabela de troca mora. Nunca no `.bone`. */
export const SWAPS_KEY = 'RECORTE_teclas';

let current: KeySwaps = {};
let lost: string[] = [];
let loaded = false;
const listeners = new Set<() => void>();

function storage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** A tabela de troca em uso. `table` é a de fábrica, para conferir as linhas. */
export function keySwaps(table: readonly KeyBinding[]): KeySwaps {
  if (!loaded) {
    loaded = true;
    const store = storage();
    if (store !== null) {
      try {
        const text = store.getItem(SWAPS_KEY);
        if (text !== null) {
          const lido = parseSwaps(JSON.parse(text), table);
          current = lido.swaps;
          lost = lido.dropped;
        }
      } catch {
        current = {};
        lost = ['(a tabela gravada não pôde ser lida)'];
      }
    }
  }
  return current;
}

/** O que estava gravado e foi jogado fora ao ler. A Ajuda diz quantas. */
export function lostSwaps(): readonly string[] {
  return lost;
}

/** Grava a tabela de troca, e avisa quem desenha tecla na tela. */
export function setKeySwaps(swaps: KeySwaps): boolean {
  loaded = true;
  current = { ...swaps };
  let gravou = true;
  const store = storage();
  if (store !== null) {
    try {
      if (Object.keys(current).length === 0) store.removeItem(SWAPS_KEY);
      else store.setItem(SWAPS_KEY, JSON.stringify(current));
    } catch {
      gravou = false;
    }
  }
  for (const listener of [...listeners]) listener();
  return gravou;
}

export function onKeySwapsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

// ---------------------------------------------------------------------------
// As teclas dos painéis, para a Ajuda → Atalhos — rodada 17, PL-21
// ---------------------------------------------------------------------------

/** O nome de cada painel, como a aba dele diz. */
const PAINEL_DA_TECLA: Readonly<Record<string, string>> = Object.freeze({
  'linha-do-tempo': 'Linha do tempo',
  ordem: 'Ordem',
  arvore: 'Árvore',
});

export interface PanelKeyRow {
  readonly painel: string;
  readonly label: string;
  readonly tecla: string;
  readonly quando: string;
}

/**
 * **As teclas que só valem com o foco num painel** — PL-21 (rodada 17). A
 * Ajuda → Atalhos listava os menus, as Ferramentas e a Cena; as 35 teclas da
 * Linha do tempo, da Ordem e da Árvore não estavam em lugar nenhum da tela.
 * Elas entram numa seção DOBRADA, embaixo, para a tabela de cima continuar
 * sendo a de todo dia. Na ordem da tabela, agrupadas pelo painel.
 */
export function panelKeyRows(table: readonly KeyBinding[]): PanelKeyRow[] {
  const ordem = Object.keys(PAINEL_DA_TECLA);
  return table
    .filter((row) => row.scope in PAINEL_DA_TECLA)
    .map((row) => ({
      painel: PAINEL_DA_TECLA[row.scope]!,
      label: row.label,
      tecla: prettyKey(row.key),
      quando: row.when ?? '',
      i: ordem.indexOf(row.scope),
    }))
    .sort((a, b) => a.i - b.i)
    .map(({ i: _i, ...linha }) => linha);
}
