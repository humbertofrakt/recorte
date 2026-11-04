/**
 * A porta da lista da pasta para quem não pode importar o painel (dono A) —
 * lote 60.
 *
 * A cena abre a lista da pasta com o clique de novo no desenho escolhido. Mas
 * a lista (`panels/image-picker.ts`) puxa as miniaturas, e as miniaturas puxam
 * o painel de malha, que puxa a cena: a cena importando a lista fecharia um
 * círculo de módulos. Então a lista se registra aqui quando carrega, e a cena
 * chama por aqui. Sem nada registrado (um teste), a chamada devolve `false`.
 */

import type { EditorDoc } from '../contract.js';
import type { GridBox, GridCamera, GridOption } from '../panels/image-grid-model.js';

/** O desenho que a lista troca. O mesmo `PickerTarget` do modelo da lista. */
export interface PickerHookTarget {
  slot: string;
  attachment: string;
  skin: string;
}

type Opener = (
  doc: EditorDoc, x: number, y: number, target: PickerHookTarget, options?: { everywhere?: boolean },
) => void;

let opener: Opener | null = null;

/** A lista se registra aqui ao carregar. */
export function setImagePickerOpener(fn: Opener): void {
  opener = fn;
}

/** Abre a lista, se ela estiver registrada. `false` quando não está. */
export function requestImagePicker(
  doc: EditorDoc, x: number, y: number, target: PickerHookTarget, options: { everywhere?: boolean } = {},
): boolean {
  if (opener === null) return false;
  opener(doc, x, y, target, options);
  return true;
}

// ---------------------------------------------------------------------------
// A grade de imagens na cena — lote 60b. A mesma porta, pelo mesmo motivo.
// ---------------------------------------------------------------------------

type GridSync = (doc: EditorDoc, stage: HTMLElement, camera: GridCamera, box: GridBox | null) => void;

let gridSync: GridSync | null = null;

/** A grade se registra aqui ao carregar. */
export function setImageGridSync(fn: GridSync): void {
  gridSync = fn;
}

/**
 * Mostra, move ou esconde a grade: a cena chama a cada quadro desenhado, com
 * a caixa de mundo do desenho escolhido, ou `null` para esconder.
 */
export function syncImageGrid(doc: EditorDoc, stage: HTMLElement, camera: GridCamera, box: GridBox | null): boolean {
  if (gridSync === null) return false;
  gridSync(doc, stage, camera, box);
  return true;
}

// Lote 60c: o botão direito no desenho ABRE a grade, com as opções embaixo.
type GridOpener = (
  doc: EditorDoc, stage: HTMLElement, camera: GridCamera, box: GridBox, options: readonly GridOption[],
) => void;

let gridOpener: GridOpener | null = null;

/** A grade se registra aqui ao carregar. */
export function setImageGridOpener(fn: GridOpener): void {
  gridOpener = fn;
}

/** Abre a grade no desenho escolhido. `false` quando ela não está registrada (um teste). */
export function requestImageGrid(
  doc: EditorDoc, stage: HTMLElement, camera: GridCamera, box: GridBox, options: readonly GridOption[],
): boolean {
  if (gridOpener === null) return false;
  gridOpener(doc, stage, camera, box, options);
  return true;
}
