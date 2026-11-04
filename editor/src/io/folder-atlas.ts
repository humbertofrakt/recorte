/**
 * O atlas provisório da pasta, no documento vivo (dono A) — lote 60.
 *
 * `project-folder.ts` faz a conta (`withProvisional`, `isProvisionalAtlas`);
 * aqui ela encontra o documento: a imagem é lida da pasta, a página nasce com
 * os pixels dela, e a cena passa a ter a região. Quem chama isto é quem está
 * para usar a imagem — o arrasto para a cena, a soltura na Árvore, a lista da
 * pasta —, **antes** do comando, porque o comando procura a região.
 *
 * Não é passo de desfazer: a região provisória não mora no `.bone`. Desfazer o
 * arrasto tira o desenho; a região fica, sem ninguém usar, e não vai para o
 * disco (o lote 62 empacota só as provisórias em uso).
 */

import { findAtlasRegion, loadAtlas } from '../../../runtime/src/index.js';
import type { AtlasData, AtlasPageData } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { atlasToJson } from './pivot-atlas.js';
import type { AsepriteSheet } from './aseprite-sheet.js';
import { readEditorState, writeEditorState } from '../contract.js';
import type { EditorState } from '../contract.js';
import {
  FOLDER_PIVOTS, PROVISIONAL_IMAGE, folderBitmap, folderImage, imagesInUse, isProvisionalAtlas,
  keepFolderPivots, readFolderPivots, withProvisional, withSheet,
  type ProvisionalTree,
} from './project-folder.js';

/** A mesma vista estreita dos outros módulos de `io/`: só o `Doc` troca os atlas. */
interface AssetHolder extends EditorDoc {
  setAssets(atlases: readonly AtlasData[], images: ReadonlyMap<string, CanvasImageSource>): void;
}

function holderOf(doc: EditorDoc): AssetHolder | null {
  const holder = doc as AssetHolder;
  return typeof holder.setAssets === 'function' ? holder : null;
}

/** Os pixels de toda página que a cena desenha hoje, pelo `image` da página. */
function pageImages(doc: EditorDoc): Map<string, CanvasImageSource> {
  const images = new Map<string, CanvasImageSource>();
  for (const atlas of doc.atlases) {
    for (const page of atlas.pages as readonly AtlasPageData[]) {
      const image = doc.imageFor(page);
      if (image !== null) images.set(page.image, image);
    }
  }
  return images;
}

/** O atlas provisório deste documento, ou `null`. */
export function provisionalAtlas(doc: EditorDoc): AtlasData | null {
  return doc.atlases.find((atlas) => isProvisionalAtlas(atlas)) ?? null;
}

/** Os nomes das regiões provisórias deste documento. */
export function provisionalNames(doc: EditorDoc): string[] {
  return (provisionalAtlas(doc)?.regions ?? []).map((region) => region.name);
}

/** Troca o atlas provisório pelo desta árvore, no mesmo lugar da lista. */
function install(
  doc: EditorDoc, tree: ProvisionalTree, images: Map<string, CanvasImageSource>,
): void {
  const holder = holderOf(doc);
  if (holder === null) return;
  const current = provisionalAtlas(doc);
  const data = loadAtlas(JSON.parse(JSON.stringify(tree)));
  const atlases = current === null
    ? [...doc.atlases, data]
    : doc.atlases.map((atlas) => (atlas === current ? data : atlas));
  holder.setAssets(atlases, images);
}

/**
 * Garante que a imagem `name` tenha região: se já está num atlas, nada muda; se
 * está só na pasta, lê os pixels e cria a região provisória. `false` quando ela
 * não está em lugar nenhum, ou o navegador não conseguiu ler o arquivo.
 *
 * `pivot` é o pivô guardado para a pasta (lote 61), usado quando a região nasce.
 */
export async function ensureProvisional(
  doc: EditorDoc, name: string, pivot?: readonly [number, number],
): Promise<boolean> {
  if (findAtlasRegion(doc.atlases, name) !== null) return true;
  const image = folderImage(doc, name);
  if (image === null) return false;
  const bitmap = await folderBitmap(image);
  if (bitmap === null) return false;
  // Dois arrastos seguidos da mesma imagem: o segundo encontra a região pronta.
  if (findAtlasRegion(doc.atlases, name) !== null) return true;
  const current = provisionalAtlas(doc);
  const tree = withProvisional(
    current === null ? null : atlasToJson(current) as unknown as ProvisionalTree,
    { name, path: image.path, width: bitmap.width, height: bitmap.height },
    // Lote 61: o pivô que a pasta guardou para ela vai para a região.
    pivot ?? readFolderPivots(doc.file)[name],
  );
  const images = pageImages(doc);
  images.set(PROVISIONAL_IMAGE + image.path, bitmap);
  install(doc, tree, images);
  return true;
}

/**
 * O `ensureProvisional` para MUITAS imagens, com a cena trocada UMA vez só —
 * rodada final, Ficha E (29/09/2026).
 *
 * Um projeto do Spriter traz dezenas de imagens soltas, e o de verdade do
 * Humberto (`exemplo/game`) usa vinte. Chamar o `ensureProvisional` vinte vezes
 * troca os atlas vinte vezes, e cada troca remonta o esqueleto. Aqui os pixels
 * são lidos um a um (`onProgress` conta), a árvore provisória cresce em
 * memória, e o `install` acontece no fim.
 *
 * Devolve quais ganharam região e quais NÃO — a imagem que não está na pasta,
 * ou que o navegador não conseguiu ler. Nenhuma some calada (regra 21).
 */
export async function ensureProvisionalMany(
  doc: EditorDoc, names: Iterable<string>,
  onProgress?: (done: number, total: number) => void,
): Promise<{ made: string[]; missing: string[] }> {
  const wanted = [...new Set(names)].filter((name) => findAtlasRegion(doc.atlases, name) === null);
  const made: string[] = [];
  const missing: string[] = [];
  if (wanted.length === 0) return { made, missing };
  const current = provisionalAtlas(doc);
  let tree: ProvisionalTree | null = current === null
    ? null
    : atlasToJson(current) as unknown as ProvisionalTree;
  const images = pageImages(doc);
  const pivots = readFolderPivots(doc.file);
  let done = 0;
  for (const name of wanted) {
    const image = folderImage(doc, name);
    const bitmap = image === null ? null : await folderBitmap(image);
    if (image === null || bitmap === null) {
      missing.push(name);
    } else {
      tree = withProvisional(
        tree, { name, path: image.path, width: bitmap.width, height: bitmap.height }, pivots[name],
      );
      images.set(PROVISIONAL_IMAGE + image.path, bitmap);
      made.push(name);
    }
    onProgress?.(++done, wanted.length);
  }
  if (tree !== null && made.length > 0) install(doc, tree, images);
  return { made, missing };
}

/**
 * Registra uma **folha do Aseprite**: uma página com os pixels do PNG, e uma
 * região por quadro (§6 item 1, a outra metade do "só porta").
 *
 * É o irmão do `ensureProvisional`, e a diferença é toda a diferença entre a
 * folha e a pasta numerada: a pasta traz N imagens e cada uma vira uma página
 * de UMA região; a folha traz UMA imagem e ela vira uma página de N regiões.
 * Daí para a frente as duas são a mesma coisa — os nomes saem na convenção da
 * §7.10, e o `numberedSequence` as reconhece igual.
 *
 * `false` quando o PNG não está na pasta ou o navegador não conseguiu lê-lo:
 * quem chamou diz isso por escrito, em vez de criar um anexo sem imagem.
 */
export async function ensureSheet(
  doc: EditorDoc, sheet: AsepriteSheet, imageName: string,
): Promise<boolean> {
  const image = folderImage(doc, imageName);
  if (image === null) return false;
  const bitmap = await folderBitmap(image);
  if (bitmap === null) return false;
  const current = provisionalAtlas(doc);
  const tree = withSheet(
    current === null ? null : atlasToJson(current) as unknown as ProvisionalTree,
    sheet, image.path,
  );
  const images = pageImages(doc);
  images.set(PROVISIONAL_IMAGE + image.path, bitmap);
  install(doc, tree, images);
  return true;
}

/**
 * Ao salvar — lote 61: a imagem que já tem região e está em uso leva o pivô
 * na região (e no atlas, §10.3). A lista `folderPivots` fica só com as que
 * ainda estão fora da cena. Não é passo de desfazer: é o mesmo arrumar do
 * estado do editor que o Salvar sempre fez (câmera, seleção).
 */
export function pruneFolderPivots(doc: EditorDoc): void {
  const pivots = readFolderPivots(doc.file);
  if (Object.keys(pivots).length === 0) return;
  const used = new Set([...imagesInUse(doc.file)].filter((name) => findAtlasRegion(doc.atlases, name) !== null));
  const kept = keepFolderPivots(pivots, used);
  const state = { ...readEditorState(doc.file) } as Record<string, unknown>;
  if (Object.keys(kept).length === 0) delete state[FOLDER_PIVOTS];
  else state[FOLDER_PIVOTS] = kept;
  writeEditorState(doc.file, state as EditorState);
}

/**
 * Depois do **Recarregar**: as regiões provisórias cujo arquivo mudou ganham os
 * pixels novos, e a cena se redesenha com eles. Devolve quantas mudaram.
 */
export async function refreshProvisional(doc: EditorDoc, names: readonly string[]): Promise<number> {
  const current = provisionalAtlas(doc);
  if (current === null) return 0;
  let tree = atlasToJson(current) as unknown as ProvisionalTree;
  const images = pageImages(doc);
  let count = 0;
  for (const name of names) {
    if (current.findRegion(name) === null) continue;
    const image = folderImage(doc, name);
    if (image === null) continue;
    const bitmap = await folderBitmap(image);
    if (bitmap === null) continue;
    tree = withProvisional(tree, { name, path: image.path, width: bitmap.width, height: bitmap.height });
    images.set(PROVISIONAL_IMAGE + image.path, bitmap);
    count++;
  }
  if (count > 0) install(doc, tree, images);
  return count;
}
