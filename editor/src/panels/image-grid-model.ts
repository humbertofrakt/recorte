/**
 * A grade de imagens na cena, como conta (dono C) — lote 60b, plano consertos
 * do teste.
 *
 * Foto do Spriter, 11/09/2026: com a mão escolhida aparece, na própria cena e
 * embaixo do desenho, uma faixa de miniaturas das imagens da mesma pasta, a
 * atual destacada, e embaixo dela o seletor "fonte: pasta | objeto". Do
 * nosso, a lista com busca do lote 60, o Humberto disse: *"o seu é um menu dos
 * satanás"*. E: *"a nossa pode ser em grade, para não ser uma fileira
 * enorme"*. Então: uma **grade** de até 6 por linha, sem rolagem de lado.
 *
 * Este arquivo decide o que a grade mostra, quantas linhas ela tem e onde ela
 * fica na tela. O desenho mora em `image-picker.ts`, junto da troca do lote 60.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { baseOf, folderOf, naturalCompare } from '../io/project-folder.js';
import { pickerEntries, type PickerEntry } from './image-picker-model.js';
import { imageOf } from './skins-model.js';

/**
 * De onde vêm as imagens: a subpasta da imagem atual, **todas** as do acervo,
 * ou as que o slot já usou. `todas` é da rodada 44, lote 2: com a espada na
 * raiz, o machado de `armas/` não aparecia na grade de jeito nenhum.
 */
export type GridSource = 'pasta' | 'todas' | 'objeto';

export const GRID_SOURCES: readonly GridSource[] = Object.freeze(['pasta', 'todas', 'objeto']);

/** Ordem da fonte "todas": a raiz primeiro, depois cada subpasta, nomes em ordem natural. */
export function byFolderThenName(a: string, b: string): number {
  const fa = folderOf(a);
  const fb = folderOf(b);
  if (fa !== fb) return fa === '' ? -1 : fb === '' ? 1 : naturalCompare(fa, fb);
  return naturalCompare(a, b);
}

/**
 * Onde a grade "todas" põe um cabeçalho de pasta — rodada 44, lote 4 (doc
 * 61): as imagens de pastas diferentes vinham numa fila só, e "armas/" só
 * na dica. Devolve o índice da primeira imagem de cada pasta e o nome dela
 * (`''` = a raiz). Só quando há mais de uma pasta.
 */
export function gridFolderBreaks(names: readonly string[]): Array<{ at: number; folder: string }> {
  const out: Array<{ at: number; folder: string }> = [];
  names.forEach((name, at) => {
    const folder = folderOf(name);
    if (out.length === 0 || out[out.length - 1]!.folder !== folder) out.push({ at, folder });
  });
  return out.length > 1 ? out : [];
}

/**
 * A fonte que a grade usa de fato — rodada 44, lote 4 (doc 61). Numa
 * ENTIDADE não há imagem de agora, e "pasta" mostrava o mesmo que "todas"
 * sem dizer: a grade abre em "todas" e o botão "pasta" diz por quê.
 */
export function gridSourceFor(chosen: GridSource, isEntity: boolean): GridSource {
  return chosen === 'pasta' && isEntity ? 'todas' : chosen;
}

/** A dica do botão "pasta" quando o desenho é uma entidade. */
export const NO_FOLDER_NOW_HINT = 'Sem pasta de agora: o desenho é uma entidade, e não tem imagem. Mostrando todas';

/** A dica de cada fonte, no botão dela. */
export function gridSourceHint(source: GridSource): string {
  switch (source) {
    case 'pasta': return 'Só as imagens da mesma subpasta da imagem de agora';
    case 'todas': return 'Todas as imagens do acervo, de todas as subpastas, em ordem de nome';
    case 'objeto': return 'Só as imagens que este slot já usou: nas skins, nas chaves de Desenho e nas trocas desta sessão';
  }
}

/** O que a grade diz quando a fonte não tem imagem nenhuma. */
export function gridEmptyText(source: GridSource): string {
  switch (source) {
    case 'pasta': return 'Nenhuma imagem na mesma pasta. Tente "todas"';
    case 'todas': return 'Nenhuma imagem no acervo: abra a pasta do projeto, ou solte PNGs na janela';
    case 'objeto': return 'Este slot ainda não usou outra imagem';
  }
}

/** Até quantas miniaturas numa linha. */
export const GRID_PER_ROW = 6;
/** Lado de uma miniatura, em pixels de tela. */
export const GRID_CELL = 40;
/** Espaço entre as miniaturas. */
export const GRID_GAP = 4;
/** Borda de dentro da grade. */
export const GRID_PAD = 6;
/** A linha do seletor "fonte", com o espaço de cima dela. */
export const GRID_FOOT = 26;
/** Distância entre o desenho e a grade. */
export const GRID_MARGIN = 8;
/** Lote 60c: a altura de uma opção embaixo da grade, e o espaço de cima delas. */
export const GRID_OPTION_ROW = 22;
export const GRID_OPTIONS_TOP = 10;
/** A largura mínima da grade com opções: o nome da opção não pode ser cortado. */
export const GRID_OPTIONS_MIN_WIDTH = 150;

/** Uma opção do botão direito, embaixo da grade — lote 60c. */
export interface GridOption {
  label: string;
  hint: string;
  run: () => void;
  /**
   * Rodada 13 (fecho da v27.6, palavra do Humberto): o item vai **em cima de
   * tudo**, antes das miniaturas — é o "Este boneco". Os outros ficam embaixo,
   * como no Spriter.
   */
  first?: boolean;
}

/** As opções da grade, separadas: as de cima (antes das miniaturas) e as de baixo. */
export function splitGridOptions(options: readonly GridOption[]): { top: GridOption[]; bottom: GridOption[] } {
  return { top: options.filter((o) => o.first === true), bottom: options.filter((o) => o.first !== true) };
}

/** A caixa do desenho escolhido, em mundo (y para cima). */
export interface GridBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** O que a grade precisa da câmera: passar de mundo para tela, e o tamanho da cena. */
export interface GridCamera {
  worldToScreen(x: number, y: number): { x: number; y: number };
  readonly width: number;
  readonly height: number;
}

/** Onde a grade fica, em pixels do palco, e de que lado do desenho. */
export interface GridPlace {
  left: number;
  top: number;
  width: number;
  height: number;
  side: 'baixo' | 'cima';
}

/** A fonte guardada no navegador; qualquer outra coisa é `pasta`. */
export function parseGridSource(value: string | null | undefined): GridSource {
  return value === 'objeto' || value === 'todas' ? value : 'pasta';
}

/**
 * As imagens que o slot **já usou**: os desenhos dele em toda pele, e os que
 * as chaves de Desenho de toda animação mostram. Em ordem natural.
 */
export function slotImages(file: BoneFile, slot: string): string[] {
  const out = new Set<string>();
  const skins = file.skins ?? [];
  const defOf = (name: string): unknown => {
    for (const skin of skins) {
      const def = skin.attachments?.[slot]?.[name];
      if (def) return def;
    }
    return null;
  };
  for (const skin of skins) {
    for (const [name, def] of Object.entries(skin.attachments?.[slot] ?? {})) {
      const image = imageOf(name, def);
      if (image !== null) out.add(image);
    }
  }
  for (const animation of file.animations ?? []) {
    for (const timeline of (animation.timelines ?? []) as unknown as Array<Record<string, unknown>>) {
      if (timeline['type'] !== 'slot' || timeline['target'] !== slot || timeline['property'] !== 'attachment') continue;
      for (const key of (timeline['keys'] ?? []) as Array<{ value?: unknown }>) {
        if (typeof key.value !== 'string') continue;
        const image = imageOf(key.value, defOf(key.value));
        if (image !== null) out.add(image);
      }
    }
  }
  return [...out].sort(naturalCompare);
}

/**
 * O que a grade mostra para o slot, com a imagem de agora marcada.
 *
 * - `pasta`: as imagens da **mesma subpasta** da atual (a regra da lista do
 *   lote 60: sem subpasta e sem pasta aberta, o mesmo prefixo até a última `/`).
 * - `objeto`: só as que este slot já usou (`slotImages`).
 */
export function gridEntries(
  file: BoneFile, folderImages: readonly string[], slot: string, source: GridSource,
  options: { current: string | null; folderOpen?: boolean; recent?: readonly string[] },
): PickerEntry[] {
  if (source === 'objeto') {
    // Rodada 44, lote 2: e as que o slot mostrou nesta sessão, mesmo que a
    // troca as tenha tirado do arquivo (o `blade` que virou machado).
    const usadas = [...new Set([...slotImages(file, slot), ...(options.recent ?? [])])].sort(naturalCompare);
    return usadas.map((name) => ({ name, label: baseOf(name), current: name === options.current }));
  }
  if (source === 'todas') {
    // Rodada 44, lote 4 (doc 61): por pasta, a raiz primeiro — a grade põe um
    // cabeçalho em cada uma (`gridFolderBreaks`).
    return [...new Set(folderImages)].sort(byFolderThenName)
      .map((name) => ({ name, label: name, current: name === options.current }));
  }
  return pickerEntries(folderImages, options.current, { folderOpen: options.folderOpen === true }).entries;
}

/**
 * A grade inteira — degrau 8, tarefa 8.1 (E6): as imagens, e **as entidades do
 * projeto depois delas**.
 *
 * As entidades vêm por último e nunca se misturam com as imagens: são peças de
 * outra natureza (um `.bone` inteiro, com relógio), e quem procura a outra mão
 * não quer tropeçar na espada no meio da fila. Um projeto sem entidade nenhuma
 * devolve a grade de sempre, célula por célula.
 */
export function gridCells(
  images: readonly PickerEntry[], entities: readonly PickerEntry[],
): PickerEntry[] {
  return [...images, ...entities];
}

/** Quantas células a grade tem de imagem antes da primeira entidade. */
export function gridEntityStart(cells: readonly PickerEntry[]): number {
  const at = cells.findIndex((cell) => cell.kind === 'entidade');
  return at < 0 ? cells.length : at;
}

/** Quantas miniaturas em cada linha: `14` → `[6, 6, 2]`. */
export function gridLayout(count: number, perRow = GRID_PER_ROW): number[] {
  const rows: number[] = [];
  const per = Math.max(1, Math.floor(perRow));
  for (let left = Math.max(0, Math.floor(count)); left > 0; left -= per) rows.push(Math.min(per, left));
  return rows;
}

/** O tamanho da grade na tela, com a borda e a linha do seletor. */
export function gridSize(rows: readonly number[], options = 0): { width: number; height: number } {
  const cols = rows.length === 0 ? 0 : Math.max(...rows);
  const grade = cols * GRID_CELL + Math.max(0, cols - 1) * GRID_GAP + 2 * GRID_PAD;
  const width = options > 0 ? Math.max(grade, GRID_OPTIONS_MIN_WIDTH) : grade;
  const height = rows.length * GRID_CELL + Math.max(0, rows.length - 1) * GRID_GAP + 2 * GRID_PAD + GRID_FOOT
    + (options > 0 ? options * GRID_OPTION_ROW + GRID_OPTIONS_TOP : 0);
  return { width, height };
}

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * Onde a grade fica: **embaixo** do desenho, centrada nele. Se não couber
 * embaixo, **em cima**. Nunca fora da cena: encosta na borda que faltar.
 */
export function gridAnchor(box: GridBox, camera: GridCamera, rows: readonly number[], options = 0): GridPlace {
  const size = gridSize(rows, options);
  const a = camera.worldToScreen(box.minX, box.minY);
  const b = camera.worldToScreen(box.maxX, box.maxY);
  const centre = (a.x + b.x) / 2;
  const top = Math.min(a.y, b.y);
  const bottom = Math.max(a.y, b.y);
  let side: GridPlace['side'] = 'baixo';
  let y = bottom + GRID_MARGIN;
  if (y + size.height > camera.height) {
    side = 'cima';
    y = top - GRID_MARGIN - size.height;
  }
  return {
    left: clamp(centre - size.width / 2, 0, Math.max(0, camera.width - size.width)),
    top: clamp(y, 0, Math.max(0, camera.height - size.height)),
    width: size.width,
    height: size.height,
    side,
  };
}

/**
 * Para onde a seta leva o foco na grade: ← → uma, ↑ ↓ uma linha. Sem foco,
 * a primeira. Fora da grade, fica onde está. `null` para outra tecla.
 */
export function nextGridIndex(at: number, key: string, count: number, perRow = GRID_PER_ROW): number | null {
  const step = ({ ArrowRight: 1, ArrowLeft: -1, ArrowDown: perRow, ArrowUp: -perRow } as Record<string, number>)[key];
  if (step === undefined) return null;
  if (count <= 0) return null;
  if (at < 0) return 0;
  const next = at + step;
  return next < 0 || next >= count ? at : next;
}
