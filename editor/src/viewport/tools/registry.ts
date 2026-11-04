/**
 * A ferramenta na mão — lote A4, plano arrumação (v10.7).
 *
 * Qual ferramenta está ativa, a de antes (o botão direito volta a ela), a
 * ferramenta de cada tecla em cada modo, e o modo do documento. Morava no
 * `viewport.ts`, e três painéis e a casca importavam o painel da cena inteiro
 * para chegar aqui. Agora importam este arquivo; o painel da cena, só o
 * `main.ts`. A cena continua exportando os mesmos nomes, daqui.
 */

import { getTool, getTools } from '../../contract.js';
import type { EditorDoc, Tool } from '../../contract.js';
import { START_TOOL } from '../../ui/toolbar-model.js';
import { toolIdOfKey } from '../../ui/keys.js';

// ---------------------------------------------------------------------------
// Active tool, shared with the shell
// ---------------------------------------------------------------------------

// Lote 47: o programa abre com o Transformar na mão.
let activeToolId = START_TOOL;
/** A ferramenta de onde se veio, para o botão direito voltar a ela. */
let previousToolId: string | null = null;

const toolListeners = new Set<(id: string) => void>();

/** Id of the tool currently in use. */
export function getActiveToolId(): string {
  return activeToolId;
}

/** The tool currently in use, or `null` before any tool is registered. */
export function getActiveTool(): Tool | null {
  return getTool(activeToolId);
}

/** Switches tool. Ignores an unknown id, so a bad shortcut cannot break the editor. */
export function setActiveTool(id: string, doc: EditorDoc | null = null): void {
  const next = getTool(id);
  if (next === null || id === activeToolId) return;
  const previous = getTool(activeToolId);
  if (doc !== null) previous?.onExit?.(doc);
  previousToolId = activeToolId;
  activeToolId = id;
  if (doc !== null) next.onEnter?.(doc);
  for (const listener of toolListeners) listener(id);
}

/** Notifies when the tool changes. Returns the function that stops it. */
export function onActiveToolChange(listener: (id: string) => void): () => void {
  toolListeners.add(listener);
  return () => toolListeners.delete(listener);
}

/** Id da ferramenta de onde se veio, ou `null` antes da primeira troca. */
export function getPreviousToolId(): string | null {
  return previousToolId;
}

/**
 * Para onde o botão direito na cena leva — a conta, sem tela nenhuma.
 *
 * É o gesto do Spine: escolher Girar, depois Mover, e o botão direito faz a
 * cena ir e voltar entre as duas sem tirar a mão do desenho. Devolve `null`
 * quando não há de onde voltar, e aí o botão direito não faz nada.
 */
export function previousToolFor(current: string, previous: string | null): string | null {
  if (previous === null || previous === current) return null;
  return previous;
}

/**
 * `true` até o botão direito na cena ser usado uma vez nesta sessão.
 *
 * Anotação 15: o gesto não tinha pista nenhuma. Uma linha no rodapé **na
 * primeira vez** ensina sem virar paisagem — repetir a frase a cada clique
 * seria ruído, e escondê-la de vez seria o que estava errado.
 */
let firstToolBack = true;

/** Esquece que o gesto já foi usado. Para o teste começar limpo. */
export function forgetToolBackNotice(): void {
  firstToolBack = true;
}

/** A frase que o rodapé diz na primeira vez — anotação 15. */
export const TOOL_BACK_NOTICE =
  'Botão direito na cena volta para a ferramenta de antes.';

/**
 * A frase do botão direito quando não há para onde voltar — rodada 17, M15.
 *
 * Num projeto novo o botão direito dizia *"Não há ferramenta anterior para
 * voltar"*, que soa a erro para quem não sabe o que o gesto faz. Agora diz o
 * gesto e a ferramenta que segue na mão.
 */
export function noToolBackNotice(currentLabel: string | null): string {
  const agora = currentLabel === null ? '' : `: segue ${currentLabel}`;
  return `O botão direito volta à ferramenta de antes, e ainda não houve outra${agora}`;
}

/** Volta à ferramenta anterior. Devolve o id novo, ou `null` se não houver. */
export function toolBack(doc: EditorDoc | null = null): string | null {
  const back = previousToolFor(activeToolId, previousToolId);
  if (back === null) return null;
  setActiveTool(back, doc);
  if (firstToolBack) {
    firstToolBack = false;
    doc?.notice(TOOL_BACK_NOTICE);
  }
  return back;
}

/**
 * A ferramenta de uma tecla. `null` quando a tecla é livre.
 *
 * Degrau 11, lote 2: a tecla sai da tabela que vale AGORA (`ui/keys.ts`, com
 * as trocas desta máquina), e não mais da letra que a ferramenta declara — a
 * letra declarada é a de fábrica, e o teste `teclas` confere que as duas dizem
 * a mesma coisa. `key` pode ser o `event.key` cru ou o nome inteiro
 * (`keyOf(event)`, `'shift+b'`).
 */
export function toolOfKey(key: string): Tool | null {
  const id = toolIdOfKey(key.length === 1 ? key.toLowerCase() : key);
  return id === null ? null : getTool(id);
}

/*
 * `toolForKey` (a tecla por modo) e `toolWrongMode` (o recado que mandava
 * trocar de modo) saíram no degrau 4a, 17/09/2026: nenhuma ferramenta some por
 * modo, então a barra e a tecla dizem a mesma coisa sem conta nenhuma —
 * `toolOfKey` basta.
 */

/*
 * `modeOf` saiu no degrau 11 (18/09/2026): não há modo, há o que está aberto.
 * Quem quer saber pergunta `doc.animation === null` (a base aberta).
 */
