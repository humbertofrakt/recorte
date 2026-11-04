/**
 * A imagem de referência: um PNG atrás de tudo (dono A) — item 62.
 *
 * É o desenho que veio do papel, ou a foto de quem vai virar personagem. Ele
 * fica ATRÁS da grade e de todo o resto, com opacidade, para se montar o
 * esqueleto por cima sem que o guia dispute a atenção com o osso.
 *
 * ONDE MORA O QUÊ, e por quê:
 *
 * - **A imagem** vai para o IndexedDB do navegador (`io/idb.ts`), com a chave
 *   sendo o nome do arquivo. Ela não entra no `.bone`: o `.bone` descreve o
 *   personagem, e quem recebe o personagem não tem por que receber junto a
 *   fotografia que serviu de guia — nem o peso dela.
 * - **Onde ela está** (x, y, escala, opacidade) vai para
 *   `RECORTE_editor_state.reference`, no arquivo. Isso é a pose do guia em
 *   relação ao personagem: quem abre o mesmo `.bone` na mesma máquina reencontra
 *   o guia no lugar certo. É meia dúzia de números, e os leitores ignoram a
 *   extensão inteira (§2.7).
 *
 * Sem a imagem no navegador — outra máquina, cache limpo — os números continuam
 * lá e nada quebra: a cena só desenha sem o guia.
 */

import { readEditorState, writeEditorState } from '../contract.js';
import type { EditorState } from '../contract.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import { idbDelete, idbGet, idbPut } from '../io/idb.js';

/** A chave dentro de `RECORTE_editor_state`. */
export const REFERENCE_STATE_KEY = 'reference';

/** O prefixo da chave no IndexedDB, para não disputar espaço com outra coisa. */
export const REFERENCE_DB_PREFIX = 'referencia:';

/** Onde o guia está, e quanto dele se vê. */
export interface ReferenceState {
  /** O nome do arquivo, que é também a chave no navegador. */
  name: string;
  /** Canto de cima e da esquerda, em unidades do mundo. */
  x: number;
  y: number;
  /** Unidades do mundo por pixel da imagem. 1 = pixel a pixel. */
  scale: number;
  /** De 0 (invisível) a 1 (opaca). */
  opacity: number;
}

/** O guia de fábrica: na origem, tamanho natural, meio transparente. */
export const DEFAULT_REFERENCE: Readonly<Omit<ReferenceState, 'name'>> = Object.freeze({
  x: 0, y: 0, scale: 1, opacity: 0.5,
});

function number(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

/**
 * Lê o guia guardado, aceitando lixo.
 *
 * Um arquivo escrito à mão, ou por uma versão futura, pode trazer qualquer
 * coisa aqui. Nada disso pode impedir o arquivo de abrir: campo estranho vira
 * o valor de fábrica, e um `reference` sem nome não é um guia.
 */
export function parseReference(saved: unknown): ReferenceState | null {
  if (saved === null || typeof saved !== 'object') return null;
  const raw = saved as Record<string, unknown>;
  const name = raw['name'];
  if (typeof name !== 'string' || name === '') return null;
  return {
    name,
    x: number(raw['x'], DEFAULT_REFERENCE.x),
    y: number(raw['y'], DEFAULT_REFERENCE.y),
    scale: Math.max(0.001, number(raw['scale'], DEFAULT_REFERENCE.scale)),
    // Fora de 0..1 não é opacidade: é engano. Corta nas pontas.
    opacity: Math.min(1, Math.max(0, number(raw['opacity'], DEFAULT_REFERENCE.opacity))),
  };
}

/** O guia deste arquivo, ou `null`. */
export function readReference(file: BoneFile): ReferenceState | null {
  const state = readEditorState(file) as Record<string, unknown>;
  return parseReference(state[REFERENCE_STATE_KEY]);
}

/**
 * Grava o guia no arquivo, ou o tira com `null`.
 *
 * Escreve direto na extensão, sem passar por um `Command`: mover o guia não é
 * mexer no personagem, e encher o desfazer com "movi a folha de referência"
 * faria o `Ctrl+Z` deixar de ser sobre o trabalho.
 */
export function writeReference(file: BoneFile, reference: ReferenceState | null): void {
  const state = readEditorState(file) as EditorState & Record<string, unknown>;
  if (reference === null) delete state[REFERENCE_STATE_KEY];
  else state[REFERENCE_STATE_KEY] = { ...reference };
  writeEditorState(file, state);
}

/** Guarda a imagem no navegador. `false` quando ele recusou. */
export function putReferenceImage(name: string, blob: Blob): Promise<boolean> {
  return idbPut(REFERENCE_DB_PREFIX + name, blob);
}

/** A imagem daquele nome, ou `null` — outra máquina, cache limpo. */
export function getReferenceImage(name: string): Promise<Blob | null> {
  return idbGet(REFERENCE_DB_PREFIX + name);
}

/** Esquece a imagem daquele nome. */
export function deleteReferenceImage(name: string): Promise<void> {
  return idbDelete(REFERENCE_DB_PREFIX + name);
}

/**
 * O retângulo que a imagem ocupa no mundo, para o desenho e para enquadrar.
 *
 * Y cresce para cima (spec 3), e `y` é o canto de BAIXO: assim o guia se
 * comporta como todo o resto do mundo, e não como um pixel de tela.
 */
export function referenceBounds(
  reference: ReferenceState, width: number, height: number,
): { x: number; y: number; width: number; height: number } {
  return {
    x: reference.x,
    y: reference.y,
    width: width * reference.scale,
    height: height * reference.scale,
  };
}
