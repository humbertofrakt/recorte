/**
 * O atlas nasce ao salvar (dono A) — lote 62, plano pasta do projeto.
 *
 * O Humberto: *"ao salvar em `.bone`, o programa empacota o atlas e o resto."*
 * No Spriter o atlas é exportação; aqui ele sai no Salvar, **só com o que está
 * em uso**: um projeto com 500 imagens na pasta e 40 no personagem salva 40.
 *
 * As imagens da pasta que estão na cena moram em regiões provisórias (lote
 * 60). Ao salvar, as que algum desenho usa passam pelo mesmo empacotador da
 * linha de comando (`packAtlas`), com o pivô carimbado pelo rig antes (lote
 * 56). O atlas e as páginas vão para **a pasta do projeto, ao lado do `.bone`**,
 * pelo handle da pasta. Sem jeito de gravar na pasta, baixam — e o rodapé diz
 * por quê.
 *
 * Na sessão, nada muda: as regiões continuam apontando para os arquivos da
 * pasta, frescos. O atlas salvo é para os leitores. Reabrir o `.bone` com a
 * pasta aberta troca o atlas salvo pelas provisórias de novo
 * (`adoptFolderAtlases`); sem a pasta, ele abre pelo atlas, como sempre.
 *
 * "Reempacotar atlas" saiu do menu: reempacotar é o Salvar.
 */

import { packAtlas } from '../../../ferramentas/src/atlas/packer.js';
import type { PackedAtlas, PackedPage, PackerItem } from '../../../ferramentas/src/atlas/packer.js';
import type { AtlasData, AtlasPageData, BoneFile } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { atlasTreesOf } from './pivot-atlas.js';
import { stampPivots } from './pivot-model.js';
import { ensureProvisional, ensureProvisionalMany } from './folder-atlas.js';
import { findAtlasRegion } from '../../../runtime/src/index.js';
import {
  imagesInUse, isProvisionalAtlas, projectFolder, type FolderDirectoryHandle,
} from './project-folder.js';

/** O que vai escrito em `atlas.generator`. */
export const FOLDER_ATLAS_GENERATOR = 'Recorte editor 0.1.0';

// ---------------------------------------------------------------------------
// A conta, sem navegador
// ---------------------------------------------------------------------------

/** Uma imagem da pasta que vai para o atlas salvo. */
export interface SaveItem {
  /** O nome da região: o caminho relativo, `maos/mao_aberta`. */
  name: string;
  /** A página provisória de onde os pixels vêm. */
  page: AtlasPageData;
  width: number;
  height: number;
  /**
   * O pedaço da página que é ESTA imagem — E5 (29/09/2026). Na pasta cada
   * imagem é a sua página, e o pedaço é a página inteira; na folha do Aseprite
   * os quadros dividem uma página, e cada um é um retângulo dela.
   */
  crop: RegionCrop;
  pivotX?: number;
  pivotY?: number;
}

/**
 * O que o Salvar empacota — **uma função só decide**, para o `.bone`, o
 * Salvar como e o `.bonez`.
 *
 * `items`: as regiões provisórias **em uso**, com o pivô carimbado pelo rig
 * (ou o que a região já tinha). `reuse`: não há nada da pasta a empacotar, e
 * os atlas de sempre vão para o disco como hoje (só o que o carimbo mudou).
 */
export function atlasForSave(doc: EditorDoc): { items: SaveItem[]; reuse: boolean } {
  const index = doc.atlases.findIndex((atlas) => isProvisionalAtlas(atlas));
  if (index < 0) return { items: [], reuse: true };
  const atlas = doc.atlases[index]!;
  const used = imagesInUse(doc.file);
  const stamped = stampPivots(doc.file, atlasTreesOf(doc)).atlases[index];
  const byName = new Map((stamped?.regions ?? []).map((region) => [region.name, region]));
  const items: SaveItem[] = [];
  for (const region of atlas.regions) {
    if (!used.has(region.name)) continue;
    const carimbo = byName.get(region.name);
    const item: SaveItem = {
      name: region.name, page: region.page, width: region.originalWidth, height: region.originalHeight,
      crop: regionCrop(region),
    };
    const px = carimbo?.pivotX ?? region.pivotX;
    const py = carimbo?.pivotY ?? region.pivotY;
    if (px !== undefined) item.pivotX = px;
    if (py !== undefined) item.pivotY = py;
    items.push(item);
  }
  return { items, reuse: items.length === 0 };
}

/**
 * Os nomes do atlas da pasta e da página dele, sem pisar em nada.
 *
 * O atlas leva o nome do `.bone` (`heroi.atlas.json`) — a não ser que esse
 * nome já seja de um atlas que veio com o arquivo (o herói aberto do disco):
 * aí vira `heroi-pasta.atlas.json`. A página é `heroi-atlas.png`, e nunca o
 * nome de uma imagem da pasta: gravar a página por cima da arte seria perder
 * a arte.
 */
export function folderAtlasNames(
  file: BoneFile, stem: string, own: string | null, folderPaths: ReadonlySet<string>,
): { atlas: string; page: string } {
  const listed = new Set((file.assets?.atlases ?? []).filter((name) => name !== own));
  let base = stem;
  for (let n = 1; listed.has(`${base}.atlas.json`); n++) base = n === 1 ? `${stem}-pasta` : `${stem}-pasta${n}`;
  let page = `${base}-atlas`;
  for (let k = 2; folderPaths.has(`${page}.png`); k++) page = `${base}-atlas${k}`;
  return { atlas: `${base}.atlas.json`, page };
}

/** Põe o atlas da pasta em `assets.atlases`, no lugar do nome antigo dele. */
export function withAtlasName(file: BoneFile, name: string, previous: string | null): void {
  file.assets ??= {};
  const list = (file.assets.atlases ?? []).filter((item) => item !== previous || item === name);
  if (!list.includes(name)) list.push(name);
  file.assets.atlases = list;
}

/** Empacota as imagens em uso. Puro: é o empacotador da linha de comando. */
export function packForSave(items: readonly PackerItem[], pageName: string): PackedAtlas {
  return packAtlas(items, { pageName, generator: FOLDER_ATLAS_GENERATOR });
}

/** Por onde o atlas da pasta vai para o disco. */
export type SaveRoute =
  /** Para dentro da pasta do projeto, na mesma subpasta do `.bone`. */
  | { kind: 'pasta'; path: string[] }
  /** Baixado, com a frase do porquê. */
  | { kind: 'baixar'; why: string }
  /** Sem pasta do projeto: o caminho de sempre, ao lado do `.bone`. */
  | { kind: 'ao-lado' };

/**
 * A rota do atlas da pasta. `inside` é onde o `.bone` caiu dentro da pasta
 * (`['heroi.bone']` na raiz), ou `null` quando ele foi salvo fora dela.
 */
export function folderSaveRoute(
  folder: { name: string; handle: unknown } | null, inside: readonly string[] | null,
): SaveRoute {
  if (folder === null) return { kind: 'ao-lado' };
  if (folder.handle === null) {
    return {
      kind: 'baixar',
      why: folder.name === ''
        ? 'As imagens vieram soltas, sem pasta aberta: o atlas e as páginas foram baixados'
        : `A pasta ${folder.name} foi aberta só para ler (este navegador não deixa gravar nela): `
          + 'o atlas e as páginas foram baixados',
    };
  }
  if (inside === null) {
    return {
      kind: 'baixar',
      why: `O .bone foi salvo fora da pasta ${folder.name}: o atlas e as páginas foram baixados. `
        + 'Salve o .bone dentro da pasta para eles irem juntos',
    };
  }
  return { kind: 'pasta', path: inside.slice(0, -1) };
}

/** `true` para um atlas salvo por nós a partir da pasta: toda região é uma imagem dela. */
export function isOwnFolderAtlas(
  atlas: { regions: readonly { name: string; aliases?: readonly string[] }[]; pages: readonly { image: string }[] },
  folderNames: ReadonlySet<string>,
): boolean {
  // Imagens iguais viram uma região com apelidos (§10.5): os apelidos contam.
  return !isProvisionalAtlas(atlas) && atlas.regions.length > 0
    && atlas.regions.every((region) => [region.name, ...(region.aliases ?? [])]
      .every((name) => folderNames.has(name)));
}

/**
 * As imagens da pasta que a aba mostra: todas, menos as que são **páginas de
 * atlas** — a do herói aberto, e a `heroi-atlas.png` que o próprio Salvar
 * grava na pasta. Uma página não é uma peça: é todas elas juntas.
 */
export function shownFolderNames(doc: EditorDoc): string[] {
  const folder = projectFolder(doc);
  if (folder === null) return [];
  const pages = new Set<string>();
  for (const atlas of doc.atlases) {
    if (isProvisionalAtlas(atlas)) continue;
    for (const page of atlas.pages) pages.add(page.image);
  }
  const stems = (doc.file.assets?.atlases ?? []).map((name) => `${name.replace(/\.atlas\.json$/i, '')}-atlas`);
  const out: string[] = [];
  for (const image of folder.images.values()) {
    if (pages.has(image.path)) continue;
    if (!image.path.includes('/') && stems.some((stem) => image.path.startsWith(stem))) continue;
    out.push(image.name);
  }
  return out;
}

// ---------------------------------------------------------------------------
// O navegador: os pixels, o pacote e a pasta
// ---------------------------------------------------------------------------

/** O nome do atlas da pasta que o Salvar usou por último, por documento. */
const ownAtlas = new WeakMap<EditorDoc, string>();

/**
 * Os pixels de UMA imagem da pasta, lidos do que a cena desenha — E5
 * (29/09/2026).
 *
 * Lia a PÁGINA inteira. Na pasta cada imagem é a sua página, e dava certo; na
 * folha do Aseprite os oito quadros dividem uma página, e cada um saía como a
 * tira inteira — o empacotador via oito imagens iguais e guardava UMA, com as
 * outras sete de apelido. Depois de salvar e reabrir, todo quadro mostrava a
 * folha toda. Medido no programa montado v23.2: *"8 imagens em uso"* no
 * rodapé e uma região só no atlas gravado.
 *
 * A forma: *li a página no lugar da região*. Agora o retângulo da região é
 * copiado para uma tela do tamanho ORIGINAL, no lugar do corte (§10.3), e o
 * empacotador recebe a imagem como ela era antes de o Aseprite cortar a borda.
 */
function regionPixels(
  doc: EditorDoc, page: AtlasPageData, crop: RegionCrop,
): { width: number; height: number; data: Uint8Array } | null {
  if (typeof document === 'undefined') return null;
  const source = doc.imageFor(page);
  if (source === null) return null;
  const canvas = document.createElement('canvas');
  canvas.width = crop.canvasWidth;
  canvas.height = crop.canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx === null) return null;
  ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, crop.dx, crop.dy, crop.sw, crop.sh);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { width: data.width, height: data.height, data: new Uint8Array(data.data) };
}

/** De onde copiar na página, e para onde na tela do tamanho original. Tudo em px da página. */
export interface RegionCrop {
  sx: number; sy: number; sw: number; sh: number;
  dx: number; dy: number;
  canvasWidth: number; canvasHeight: number;
}

/**
 * O recorte de uma região (§10.3): origem no canto de cima, Y para baixo; o
 * `offsetY` conta de BAIXO, e por isso o destino é `altura original − offsetY
 * − altura`. A região provisória da pasta nunca é girada (`withProvisional` e
 * `withSheet` não giram); uma girada fica com a página inteira, como antes —
 * e o rodapé do Salvar continua contando as imagens que saíram.
 */
export function regionCrop(region: {
  x: number; y: number; width: number; height: number; rotation?: number;
  offsetX?: number; offsetY?: number; originalWidth?: number; originalHeight?: number;
  page: { width: number; height: number };
}): RegionCrop {
  const round = (n: number): number => Math.max(0, Math.round(n));
  if ((region.rotation ?? 0) !== 0) {
    const w = Math.max(1, round(region.page.width));
    const h = Math.max(1, round(region.page.height));
    return { sx: 0, sy: 0, sw: w, sh: h, dx: 0, dy: 0, canvasWidth: w, canvasHeight: h };
  }
  const sw = Math.max(1, round(region.width));
  const sh = Math.max(1, round(region.height));
  const W = Math.max(sw, round(region.originalWidth ?? region.width));
  const H = Math.max(sh, round(region.originalHeight ?? region.height));
  return {
    sx: round(region.x), sy: round(region.y), sw, sh,
    dx: round(region.offsetX ?? 0), dy: round(H - (region.offsetY ?? 0) - sh),
    canvasWidth: W, canvasHeight: H,
  };
}

/** Uma página empacotada, em PNG, pelo canvas do navegador. */
async function pngOf(page: PackedPage): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = page.width;
  canvas.height = page.height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('O navegador não deu um contexto 2D para gravar o PNG.');
  const image = ctx.createImageData(page.width, page.height);
  image.data.set(page.pixels);
  ctx.putImageData(image, 0, 0);
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
  if (blob === null) throw new Error('O navegador não conseguiu gravar o PNG.');
  return new Uint8Array(await blob.arrayBuffer());
}

/** O atlas da pasta, pronto para o disco. */
export interface FolderPack {
  /** Como o `.bone` o chama em `assets.atlases`. */
  atlasName: string;
  text: string;
  pages: Array<{ name: string; bytes: Uint8Array }>;
  /** Quantas imagens entraram. */
  count: number;
}

/**
 * Empacota as imagens da pasta em uso e põe o nome do atlas no arquivo. `null`
 * quando não há nada da pasta em uso. Chamar **antes** de `serialize`: o
 * `.bone` que sai tem que citar o atlas que sai junto.
 */
/** Devolve a vez à tela por um instante — QA de 04/11/2026 (D22). */
function respirar(): Promise<void> {
  return new Promise((done) => { setTimeout(done, 0); });
}

export async function buildFolderPack(
  doc: EditorDoc, stem: string,
  // QA 04/11/2026 (D22): o projeto do Spriter (91 imagens) levava 7,2 s aqui,
  // num pedaço só, com a página parada e o rodapé mudo. Agora diz e respira.
  onProgress?: (feito: number, total: number, fase: string) => void,
): Promise<FolderPack | null> {
  const plan = atlasForSave(doc);
  if (plan.reuse) return null;
  const folder = projectFolder(doc);
  const paths = new Set([...(folder?.images.values() ?? [])].map((image) => image.path));
  const own = ownAtlas.get(doc) ?? null;
  const names = folderAtlasNames(doc.file, stem, own, paths);
  const items: PackerItem[] = [];
  let lidas = 0;
  for (const item of plan.items) {
    onProgress?.(++lidas, plan.items.length, 'lendo as imagens do atlas');
    if (onProgress !== undefined && lidas % 8 === 0) await respirar();
    const pixels = regionPixels(doc, item.page, item.crop);
    if (pixels === null) continue;
    const packerItem: PackerItem = { name: item.name, width: pixels.width, height: pixels.height, pixels: pixels.data };
    if (item.pivotX !== undefined) packerItem.pivotX = item.pivotX;
    if (item.pivotY !== undefined) packerItem.pivotY = item.pivotY;
    items.push(packerItem);
  }
  if (items.length === 0) return null;
  const packed = packForSave(items, names.page);
  withAtlasName(doc.file, names.atlas, own);
  ownAtlas.set(doc, names.atlas);
  const pages: FolderPack['pages'] = [];
  for (const page of packed.pages) {
    onProgress?.(pages.length + 1, packed.pages.length, 'gravando as páginas do atlas');
    if (onProgress !== undefined) await respirar();
    pages.push({ name: page.image, bytes: await pngOf(page) });
  }
  return { atlasName: names.atlas, text: `${JSON.stringify(packed.atlas, null, 2)}\n`, pages, count: items.length };
}

/** Desce da pasta do projeto até a subpasta `path`. */
export async function descend(root: FolderDirectoryHandle, path: readonly string[]): Promise<FolderDirectoryHandle> {
  let here = root;
  for (const part of path) {
    if (typeof here.getDirectoryHandle !== 'function') break;
    here = await here.getDirectoryHandle(part);
  }
  return here;
}

/**
 * Reabrir o `.bone` com a pasta aberta — lote 62: o atlas que o Salvar gravou
 * sai da cena, e as imagens voltam a vir **da pasta**, frescas, cada uma com o
 * pivô que o atlas salvo tinha. Devolve quantas regiões voltaram.
 */
export async function adoptFolderAtlases(doc: EditorDoc): Promise<number> {
  const folder = projectFolder(doc);
  if (folder === null || folder.images.size === 0) return 0;
  const count = await adoptOwnAtlases(doc, new Set(folder.images.keys()));
  // QA 04/11/2026 (D14): o `.bone` sem atlas (o Spriter convertido pela linha
  // de comando, `exemplo/game/bcp 2026-09-09.bone`) cita imagens soltas que
  // ESTÃO na pasta. Elas ficavam "não encontradas" — 176 avisos —, e a aba
  // Imagens mostrava as 128. Agora entram como as do arrasto: região provisória.
  const soltas = await ensureProvisionalMany(doc, looseImagesInFolder(doc.file, doc.atlases, new Set(folder.images.keys())));
  return count + soltas.made.length;
}

/**
 * As imagens que o `.bone` mostra, que nenhum atlas aberto tem e que a pasta
 * tem — D14. Pura: o teste a chama com o arquivo e a pasta de verdade.
 */
export function looseImagesInFolder(
  file: BoneFile, atlases: readonly AtlasData[], folderNames: ReadonlySet<string>,
): string[] {
  return [...imagesInUse(file)].filter((name) => folderNames.has(name) && findAtlasRegion(atlases, name) === null);
}

/** O atlas que o Salvar gravou a partir da pasta volta a vir dela — lote 62. */
async function adoptOwnAtlases(doc: EditorDoc, names: ReadonlySet<string>): Promise<number> {
  const ours = doc.atlases.filter((atlas) => isOwnFolderAtlas(atlas, names));
  if (ours.length === 0) return 0;
  const holder = doc as EditorDoc & {
    setAssets?(atlases: readonly AtlasData[], images: ReadonlyMap<string, CanvasImageSource>): void;
  };
  if (typeof holder.setAssets !== 'function') return 0;

  // O nome do atlas salvo, para o próximo Salvar gravar por cima dele.
  const page = ours[0]!.pages[0]?.image ?? '';
  const listed = doc.file.assets?.atlases ?? [];
  const own = listed.find((name) => page.startsWith(`${name.replace(/\.atlas\.json$/i, '')}-atlas`));
  if (own !== undefined) ownAtlas.set(doc, own);

  const pivots = new Map<string, [number, number] | undefined>();
  for (const atlas of ours) {
    for (const region of atlas.regions) {
      const pivot: [number, number] | undefined = region.pivotX === undefined && region.pivotY === undefined
        ? undefined
        : [region.pivotX ?? region.originalWidth / 2, region.pivotY ?? region.originalHeight / 2];
      // Cada apelido é uma imagem da pasta, e volta como a sua própria região.
      for (const name of [region.name, ...region.aliases]) pivots.set(name, pivot);
    }
  }
  const images = new Map<string, CanvasImageSource>();
  const kept = doc.atlases.filter((atlas) => !ours.includes(atlas));
  for (const atlas of kept) {
    for (const p of atlas.pages) {
      const image = doc.imageFor(p);
      if (image !== null) images.set(p.image, image);
    }
  }
  holder.setAssets(kept, images);
  let count = 0;
  for (const [name, pivot] of pivots) if (await ensureProvisional(doc, name, pivot)) count++;
  return count;
}
