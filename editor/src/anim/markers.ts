/**
 * Marcas e trecho de laço na linha do tempo (dono C) — itens 81 e 82.
 *
 * **Nada disto vai para o jogo.** Uma marca é um recado para quem anima —
 * "aqui o pé bate no chão", "aqui começa o ataque" — e um trecho de laço é uma
 * lente para olhar dois segundos do meio da animação sem esperar o resto. Os
 * dois moram em `RECORTE_editor_state.timeline`, que os leitores ignoram (§2.7).
 *
 * Por animação, e não por arquivo: as marcas do `walk` não fazem sentido no
 * `attack`.
 *
 * Tudo aqui é puro. Ler e escrever no arquivo é uma função só, no fim.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { readEditorState, writeEditorState } from '../contract.js';
import type { EditorState } from '../contract.js';

/** A chave dentro de `RECORTE_editor_state`. */
export const TIMELINE_STATE_KEY = 'timeline';

/** Uma marca: um instante com nome. */
export interface Marker {
  time: number;
  name: string;
}

/** O trecho que o tocador repete, quando há um. */
export interface LoopRange {
  from: number;
  to: number;
}

/** O que o editor guarda de uma animação. */
export interface TimelineState {
  loop?: LoopRange;
  markers?: Marker[];
}

/** Tudo, por nome de animação. */
export type TimelineStates = Record<string, TimelineState>;

/** Quanto dois tempos podem diferir e ainda serem "o mesmo instante". */
const EPSILON = 1e-6;

function sameTime(a: number, b: number): boolean {
  return Math.abs(a - b) <= EPSILON;
}

// ---------------------------------------------------------------------------
// Ler e escrever
// ---------------------------------------------------------------------------

/** Lê o guardado, aceitando lixo e faltas: qualquer coisa estranha vira vazio. */
export function parseTimelineStates(saved: unknown): TimelineStates {
  if (saved === null || typeof saved !== 'object') return {};
  const out: TimelineStates = {};
  for (const [name, raw] of Object.entries(saved as Record<string, unknown>)) {
    if (raw === null || typeof raw !== 'object') continue;
    const source = raw as Record<string, unknown>;
    const state: TimelineState = {};

    const loop = source['loop'];
    if (loop !== null && typeof loop === 'object') {
      const from = (loop as Record<string, unknown>)['from'];
      const to = (loop as Record<string, unknown>)['to'];
      if (typeof from === 'number' && typeof to === 'number' && to > from) {
        state.loop = { from: Math.max(0, from), to };
      }
    }

    const markers = source['markers'];
    if (Array.isArray(markers)) {
      const list: Marker[] = [];
      for (const item of markers) {
        if (item === null || typeof item !== 'object') continue;
        const time = (item as Record<string, unknown>)['time'];
        const label = (item as Record<string, unknown>)['name'];
        if (typeof time !== 'number' || time < 0) continue;
        list.push({ time, name: typeof label === 'string' ? label : '' });
      }
      if (list.length > 0) state.markers = sortMarkers(list);
    }

    if (state.loop !== undefined || state.markers !== undefined) out[name] = state;
  }
  return out;
}

/** O guardado do arquivo. */
export function readTimelineStates(file: BoneFile): TimelineStates {
  const state = readEditorState(file) as EditorState & Record<string, unknown>;
  return parseTimelineStates(state[TIMELINE_STATE_KEY]);
}

/**
 * Grava o guardado no arquivo, mantendo o resto da extensão.
 *
 * Uma animação sem marca e sem trecho **sai** do objeto, em vez de ficar como
 * `{}`: um arquivo que carrega restos vazios cresce a cada sessão e não diz
 * nada a mais.
 */
export function writeTimelineStates(file: BoneFile, states: TimelineStates): void {
  const state = readEditorState(file) as EditorState & Record<string, unknown>;
  const clean: TimelineStates = {};
  for (const [name, value] of Object.entries(states)) {
    const keep: TimelineState = {};
    if (value.loop !== undefined) keep.loop = { ...value.loop };
    if (value.markers !== undefined && value.markers.length > 0) {
      keep.markers = value.markers.map((m) => ({ ...m }));
    }
    if (keep.loop !== undefined || keep.markers !== undefined) clean[name] = keep;
  }
  if (Object.keys(clean).length === 0) delete state[TIMELINE_STATE_KEY];
  else state[TIMELINE_STATE_KEY] = clean;
  writeEditorState(file, state);
}

/** O guardado de uma animação, ou um vazio. */
export function stateOf(states: TimelineStates, animation: string | null): TimelineState {
  if (animation === null) return {};
  return states[animation] ?? {};
}

// ---------------------------------------------------------------------------
// Marcas
// ---------------------------------------------------------------------------

/** Em ordem de tempo. Duas no mesmo instante ficam na ordem em que entraram. */
function sortMarkers(markers: readonly Marker[]): Marker[] {
  return [...markers].sort((a, b) => a.time - b.time);
}

/**
 * Põe uma marca naquele instante.
 *
 * Já havia uma ali? Ela **troca de nome** em vez de virar duas. Duas marcas no
 * mesmo instante seriam dois triângulos exatamente por cima um do outro, e
 * ninguém conseguiria pegar a de baixo.
 */
export function addMarker(
  markers: readonly Marker[], time: number, name = '',
): Marker[] {
  const at = markers.findIndex((marker) => sameTime(marker.time, time));
  if (at >= 0) {
    const out = [...markers];
    out[at] = { time: out[at].time, name };
    return out;
  }
  return sortMarkers([...markers, { time, name }]);
}

/** Tira a marca daquele instante. Sem marca ali, devolve a mesma lista. */
export function removeMarker(markers: readonly Marker[], time: number): Marker[] {
  return markers.filter((marker) => !sameTime(marker.time, time));
}

/** Troca o nome da marca daquele instante. */
export function renameMarker(
  markers: readonly Marker[], time: number, name: string,
): Marker[] {
  return markers.map((marker) => (
    sameTime(marker.time, time) ? { time: marker.time, name } : marker
  ));
}

/** A marca daquele instante, ou `null`. */
export function markerAt(markers: readonly Marker[], time: number): Marker | null {
  return markers.find((marker) => sameTime(marker.time, time)) ?? null;
}

/** A próxima marca depois de `time`, ou `null`. */
export function nextMarker(markers: readonly Marker[], time: number): Marker | null {
  for (const marker of sortMarkers(markers)) {
    if (marker.time > time + EPSILON) return marker;
  }
  return null;
}

/** A marca anterior a `time`, ou `null`. */
export function previousMarker(markers: readonly Marker[], time: number): Marker | null {
  let found: Marker | null = null;
  for (const marker of sortMarkers(markers)) {
    if (marker.time < time - EPSILON) found = marker;
  }
  return found;
}

/** O nome que se mostra de uma marca sem nome, para ela não ficar muda. */
export function markerLabel(marker: Marker): string {
  return marker.name.trim() === '' ? 'marca' : marker.name;
}

// ---------------------------------------------------------------------------
// Trecho de laço
// ---------------------------------------------------------------------------

/**
 * O trecho com o começo trocado, ou `null` quando o trecho deixa de existir.
 *
 * Um começo depois do fim não é um trecho: seria tocar de trás para frente sem
 * ninguém ter pedido. Nesse caso o trecho some, e a barra de baixo diz.
 */
export function setLoopFrom(loop: LoopRange | undefined, from: number): LoopRange | null {
  const to = loop?.to;
  if (to === undefined) return null;
  return to > from ? { from: Math.max(0, from), to } : null;
}

/** O trecho com o fim trocado, ou `null` quando ele deixa de existir. */
export function setLoopTo(loop: LoopRange | undefined, to: number): LoopRange | null {
  const from = loop?.from ?? 0;
  return to > from ? { from, to } : null;
}

/** `true` quando o tempo está dentro do trecho. */
export function insideLoop(loop: LoopRange | undefined, time: number): boolean {
  if (loop === undefined) return true;
  return time >= loop.from - EPSILON && time <= loop.to + EPSILON;
}
