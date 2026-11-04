/**
 * **O pivô que a pessoa pôs, e que o rig não diz** — rodada 13 (05/10/2026).
 *
 * O Humberto: *"acertei o pivô de uma imagem presa a um osso: o desenho fica
 * parado."* A imagem que não tem osso próprio fica parada, e então a origem do
 * osso NÃO cai mais no pivô: o rig deixa de dizer onde ele está. Sem esta
 * lista, o próximo Salvar (ou Exportar skin, ou Carimbar) recalcularia o pivô
 * pelo rig e o pivô novo voltaria ao velho, calado.
 *
 * `extensions.RECORTE_editor_state.pivosAMao`: imagem → `[x, y]`, em px do
 * atlas, de baixo, como `pivotX/pivotY` (§10.3). Nenhum leitor vê (regra 6);
 * nenhum campo novo no núcleo.
 *
 * Mora no degrau da base (e não em `io/pivot-model.ts`, que a reexporta)
 * porque o documento também a lê: o atlas que vem do disco traz o pivô que o
 * disco tinha, e quem mostra o pivô (a janela, o painel Pivôs, a cruz da
 * miniatura) lê a região. Conserto 1 da conferência da rodada 13: depois de
 * salvar, fechar e reabrir, a janela dizia o pivô VELHO, porque ninguém passava
 * a lista para a região. Agora o documento passa, toda vez que recebe atlas.
 */

import type { AtlasData, BoneFile } from '../../../runtime/src/index.js';
import { EDITOR_EXTENSION, readEditorState, writeEditorState, type EditorState } from '../contract.js';

export const HAND_PIVOTS = 'pivosAMao';

/** Os pivôs à mão do arquivo; valor estragado é ignorado. */
export function readHandPivots(file: BoneFile): Record<string, [number, number]> {
  const raw = (readEditorState(file) as Record<string, unknown>)[HAND_PIVOTS];
  const out: Record<string, [number, number]> = {};
  if (raw === null || typeof raw !== 'object' || Array.isArray(raw)) return out;
  for (const [name, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(value) || value.length !== 2) continue;
    const [x, y] = value as unknown[];
    if (typeof x === 'number' && Number.isFinite(x) && typeof y === 'number' && Number.isFinite(y)) out[name] = [x, y];
  }
  return out;
}

/** Grava a lista; vazia, o campo sai. */
export function writeHandPivots(file: BoneFile, pivots: Record<string, [number, number]>): void {
  const state = { ...readEditorState(file) } as Record<string, unknown>;
  if (Object.keys(pivots).length === 0) {
    if (!(HAND_PIVOTS in state)) return;
    delete state[HAND_PIVOTS];
  } else {
    state[HAND_PIVOTS] = pivots;
  }
  writeEditorState(file, state as EditorState);
  const f = file as { extensionsUsed?: string[] };
  const used = f.extensionsUsed ?? [];
  if (!used.includes(EDITOR_EXTENSION)) f.extensionsUsed = [...used, EDITOR_EXTENSION];
}

/**
 * Põe o pivô à mão na região de cada atlas, NO LUGAR: o objeto do atlas é o
 * mesmo (o acervo importado e o "atlas mudou" o reconhecem pela identidade).
 * O pivô de uma região não muda desenho nenhum (§10.3: é informação para o
 * editor e para a troca de imagem), então isto não mexe na cena. Devolve
 * quantas regiões mudaram.
 */
export function applyHandPivots(file: BoneFile, atlases: readonly AtlasData[]): number {
  const hand = readHandPivots(file);
  const names = Object.keys(hand);
  if (names.length === 0) return 0;
  let changed = 0;
  for (const name of names) {
    for (const atlas of atlases) {
      const region = atlas.findRegion(name) as unknown as { pivotX?: number; pivotY?: number } | null;
      if (region === null || region === undefined) continue;
      const [x, y] = hand[name]!;
      if (region.pivotX !== x || region.pivotY !== y) {
        region.pivotX = x;
        region.pivotY = y;
        changed++;
      }
      break;
    }
  }
  return changed;
}
