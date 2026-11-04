/**
 * "Importar imagens" and "Reempacotar atlas".
 *
 * Starting a character from nothing means starting from a folder of PNGs. This
 * module takes those files, packs them with the very same packer the command
 * line uses (`ferramentas/src/atlas/packer.ts`), and writes the result into the
 * document: an atlas in `assets.atlases`, one slot per image, and one `region`
 * attachment per slot — all inside a single undoable command, so one Ctrl+Z
 * puts the document back exactly as it was.
 *
 * The pages never go to disk here. They live as canvases the viewport draws
 * from, and `atlasFileText` / `atlasPageBlobs` hand the bytes to whoever saves.
 *
 * The pixels that came in are kept in memory per document, so "Reempacotar
 * atlas" can lay the same images out again with other options (a bigger page,
 * power of two, another scale) without asking for the files a second time.
 */

import { loadAtlas } from '../../../runtime/src/index.js';
import type {
  AtlasData, AtlasPageData, BoneFile, RegionAttachmentDef, SkinDef, SlotDef,
} from '../../../runtime/src/index.js';
import { packAtlas, regionNameFromPath } from '../../../ferramentas/src/atlas/packer.js';
import type { PackOptions, PackedAtlas, PackerItem } from '../../../ferramentas/src/atlas/packer.js';
import { SnapshotCommand } from '../doc/commands.js';
import type { FileKey } from '../doc/commands.js';
import type { EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';

/** Image files the picker offers. Anything the browser can decode works. */
const IMAGE_TYPES = ['.png', '.webp', '.jpg', '.jpeg', '.gif', '.bmp'];

/** Extension of an atlas file (spec 10.1). */
const ATLAS_EXTENSION = '.atlas.json';

// ---------------------------------------------------------------------------
// The document, seen as the holder of the loaded atlases
// ---------------------------------------------------------------------------

/**
 * `Doc` has `setAssets`; the contract interface does not, because most modules
 * have no business swapping the atlases. This is the narrow view this module
 * needs, so it never has to import the concrete class.
 */
interface AssetHolder extends EditorDoc {
  setAssets(atlases: readonly AtlasData[], images: ReadonlyMap<string, CanvasImageSource>): void;
}

function asHolder(doc: EditorDoc): AssetHolder | null {
  const holder = doc as AssetHolder;
  return typeof holder.setAssets === 'function' ? holder : null;
}

// ---------------------------------------------------------------------------
// What one import produced, kept per document
// ---------------------------------------------------------------------------

export interface ImportedAtlas {
  /** File name written in `assets.atlases`, e.g. `heroi.atlas.json`. */
  fileName: string;
  /** The pack, pixels included. */
  packed: PackedAtlas;
  /** The atlas as the runtime reads it. */
  data: AtlasData;
  /** One canvas per page, keyed by `page.image`. */
  images: Map<string, CanvasImageSource>;
  /** Options this pack ran with, so a repack can change just one of them. */
  options: PackOptions;
}

interface Store {
  /** The images that came in, by region name, ready to be packed again. */
  items: Map<string, PackerItem>;
  current: ImportedAtlas | null;
}

const stores = new WeakMap<EditorDoc, Store>();

function storeOf(doc: EditorDoc): Store {
  let store = stores.get(doc);
  if (store === undefined) {
    store = { items: new Map(), current: null };
    stores.set(doc, store);
  }
  return store;
}

/** `true` when this document has images in memory to pack again. */
export function hasImportedImages(doc: EditorDoc): boolean {
  return storeOf(doc).items.size > 0;
}

/** The atlas the last import or repack produced, or `null`. */
export function importedAtlas(doc: EditorDoc): ImportedAtlas | null {
  return storeOf(doc).current;
}

// ---------------------------------------------------------------------------
// The stock, opened up so another importer can share this one atlas
// ---------------------------------------------------------------------------

/*
 * POR QUE ESTAS QUATRO FUNÇÕES EXISTEM.
 *
 * O acervo de imagens de um documento é privado (o `WeakMap` acima), e era
 * privado demais: "Importar PSD" não conseguia chegar nele, empacotava um
 * atlas próprio e chamava `setAssets` com ele — ou seja, num arquivo que já
 * tinha imagens importadas, o atlas do PSD substituía o das imagens, e o que
 * fosse salvo depois não trazia as páginas do PSD, porque `atlasFileText` lê
 * `store.current`.
 *
 * Com estas quatro, quem importa de outra origem põe os itens no MESMO acervo,
 * empacota tudo numa página só, registra o resultado, e o desfazer devolve o
 * acervo ao que era. "Reempacotar atlas" passa a valer para o PSD também.
 */

/** Adds items to the document's stock. Does not pack and makes no command. */
export function addImportedItems(doc: EditorDoc, items: readonly PackerItem[]): void {
  const store = storeOf(doc);
  for (const item of items) store.items.set(item.name, item);
}

/** The items the document holds today, so a caller can pack them all at once. */
export function importedItems(doc: EditorDoc): PackerItem[] {
  return [...storeOf(doc).items.values()];
}

/** Everything the stock holds, copied, so an undo can put it back. */
export interface ImportedStock {
  items: readonly PackerItem[];
  current: ImportedAtlas | null;
}

/** Reads the stock, for a command that is about to change it. */
export function importedStock(doc: EditorDoc): ImportedStock {
  const store = storeOf(doc);
  return { items: [...store.items.values()], current: store.current };
}

/** Puts back what `importedStock` read. */
export function restoreImportedStock(doc: EditorDoc, stock: ImportedStock): void {
  const store = storeOf(doc);
  store.items = new Map(stock.items.map((item) => [item.name, item]));
  store.current = stock.current;
}

/** The name the atlas file of this document gets, without the extension. */
export function atlasBaseName(doc: EditorDoc, fallback = 'atlas'): string {
  return baseNameOf(doc, fallback);
}

/** Records an atlas packed elsewhere as this document's current one. */
export function setImportedAtlas(doc: EditorDoc, imported: ImportedAtlas): void {
  storeOf(doc).current = imported;
}

/** Packs the stock the same way an import does, so both give one atlas. */
export function packImportedStock(
  doc: EditorDoc,
  extra: readonly PackerItem[] = [],
  options: PackOptions = {},
  fallbackName = 'atlas',
): ImportedAtlas {
  const store = storeOf(doc);
  const merged = { ...(store.current?.options ?? {}), ...options };
  return build(doc, [...store.items.values(), ...extra], merged, fallbackName);
}

// ---------------------------------------------------------------------------
// Picking and decoding
// ---------------------------------------------------------------------------

interface FileHandle { readonly name: string; getFile(): Promise<File> }
interface PickerWindow { showOpenFilePicker?(options?: unknown): Promise<FileHandle[]> }

/** Asks for several image files. Returns `null` when the user cancels. */
export async function pickImages(): Promise<File[] | null> {
  const w = globalThis as unknown as PickerWindow;
  if (typeof w.showOpenFilePicker === 'function') {
    try {
      const handles = await w.showOpenFilePicker({
        multiple: true,
        types: [{ description: 'Imagens', accept: { 'image/*': IMAGE_TYPES } }],
      });
      return await Promise.all(handles.map((h) => h.getFile()));
    } catch {
      return null; // The user closed the dialog.
    }
  }
  return new Promise((done) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = IMAGE_TYPES.join(',');
    input.addEventListener('change', () => {
      const list = input.files;
      done(list === null || list.length === 0 ? null : Array.from(list));
    });
    // A cancelled dialog fires nothing in older browsers; `cancel` covers the rest.
    input.addEventListener('cancel', () => done(null));
    input.click();
  });
}

/** Draws a file into a canvas and reads its RGBA8 pixels back out. */
async function decodeImage(file: File): Promise<{ width: number; height: number; pixels: Uint8Array }> {
  const bitmap = await createImageBitmap(file);
  // Read the size BEFORE closing: `ImageBitmap.close()` sets `width` and
  // `height` to zero, and a zero-sized item makes the packer refuse the file
  // with "tem largura ou altura zero".
  const width = bitmap.width;
  const height = bitmap.height;
  if (width === 0 || height === 0) {
    throw new Error(`a imagem ${file.name} não tem tamanho; o navegador não conseguiu abrir ela`);
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (ctx === null) throw new Error('o navegador não deu um contexto 2D para ler a imagem');
  ctx.drawImage(bitmap, 0, 0);
  const data = ctx.getImageData(0, 0, width, height);
  bitmap.close();
  return { width, height, pixels: new Uint8Array(data.data.buffer.slice(0)) };
}

/** Reads the files into packer items. The region name is the file name without extension. */
export async function readImageFiles(files: readonly File[]): Promise<PackerItem[]> {
  const items: PackerItem[] = [];
  for (const file of files) {
    // `webkitRelativePath` is set when a whole folder was dropped in, and it is
    // what keeps `bracos/mao_01` a region inside a folder (spec 10.3).
    const path = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
    const name = regionNameFromPath(path !== undefined && path !== '' ? path : file.name);
    const image = await decodeImage(file);
    items.push({ name, width: image.width, height: image.height, pixels: image.pixels });
  }
  return items;
}

// ---------------------------------------------------------------------------
// Turning a pack into something the viewport can draw
// ---------------------------------------------------------------------------

/** One canvas per page, keyed by `page.image`, ready for `imageFor`. */
function pagesToCanvases(packed: PackedAtlas): Map<string, CanvasImageSource> {
  const images = new Map<string, CanvasImageSource>();
  for (const page of packed.pages) {
    const canvas = document.createElement('canvas');
    canvas.width = page.width;
    canvas.height = page.height;
    const ctx = canvas.getContext('2d');
    if (ctx === null) throw new Error('o navegador não deu um contexto 2D para montar a página');
    ctx.putImageData(new ImageData(new Uint8ClampedArray(page.pixels), page.width, page.height), 0, 0);
    images.set(page.image, canvas);
  }
  return images;
}

/**
 * Base name for the atlas and its pages: the document's name, or `atlas` —
 * e **nunca o nome de um atlas que veio com o arquivo**.
 *
 * O herói aberto do disco já tem `heroi.atlas.json`. Se o pacote das imagens
 * importadas se chamasse igual, `assets.atlases` não ganharia uma linha nova,
 * a página `heroi.png` do pacote taparia a do herói na cena, e o Salvar
 * gravaria o pacote **por cima** do atlas do herói. Então, quando o nome do
 * documento já é de um atlas alheio, o pacote vira `heroi-imagens`, e depois
 * `heroi-imagens2`. O atlas do próprio acervo (`store.current`) não conta: ele
 * é substituído a cada importação, e é para ter o mesmo nome.
 */
function baseNameOf(doc: EditorDoc, fallback = 'atlas'): string {
  const last = doc.path === null || doc.path === ''
    ? fallback
    : doc.path.split(/[\\/]/).pop() ?? fallback;
  const base = last.replace(/\.bone$/i, '') || fallback;
  const own = storeOf(doc).current?.fileName ?? null;
  const foreign = new Set((doc.file.assets?.atlases ?? []).filter((name) => name !== own));
  if (!foreign.has(base + ATLAS_EXTENSION)) return base;
  for (let i = 1; ; i++) {
    const candidate = i === 1 ? `${base}-imagens` : `${base}-imagens${i}`;
    if (!foreign.has(candidate + ATLAS_EXTENSION)) return candidate;
  }
}

/** Packs the items and wraps the result with everything the editor needs. */
function build(
  doc: EditorDoc, items: readonly PackerItem[], options: PackOptions, fallback = 'atlas',
): ImportedAtlas {
  const base = baseNameOf(doc, fallback);
  const merged: PackOptions = { generator: 'Recorte editor', pageName: base, ...options };
  const packed = packAtlas(items, merged);
  return {
    fileName: base + ATLAS_EXTENSION,
    packed,
    data: loadAtlas(JSON.parse(JSON.stringify(packed.atlas))),
    images: pagesToCanvases(packed),
    options: merged,
  };
}

// ---------------------------------------------------------------------------
// The command
// ---------------------------------------------------------------------------

/** Os atlas e as imagens que a cena desenha, como `setAssets` recebe. */
export interface LoadedAssets {
  atlases: readonly AtlasData[];
  images: ReadonlyMap<string, CanvasImageSource>;
}

/**
 * O que a cena passa a ter depois de uma importação — conserto de 10/09/2026.
 *
 * Até aqui o comando chamava `setAssets([o novo pacote])`, e isso **trocava
 * todos os atlas** pelo recém-empacotado. Num arquivo aberto do disco — o
 * herói, com o `heroi.atlas.json` dele — soltar um PNG na janela apagava as
 * dezenove peças da cena: o slot continuava, a imagem não, e o rodapé contava
 * 42 avisos. Nas palavras do Humberto, *"as peças quebram"*.
 *
 * O pacote de quem importa é **um atlas a mais**, ao lado dos que vieram com
 * o arquivo. Só o pacote anterior do próprio acervo sai (`ownOld`), porque o
 * novo o contém inteiro: o acervo é um só e é empacotado sempre por inteiro.
 * As imagens seguem a mesma conta: as das páginas que ficam, mais as novas.
 */
export function mergedAssets(
  current: LoadedAssets,
  ownOld: AtlasData | null,
  imported: { data: AtlasData; images: ReadonlyMap<string, CanvasImageSource> },
): { atlases: AtlasData[]; images: Map<string, CanvasImageSource> } {
  const kept = current.atlases.filter((atlas) => atlas !== ownOld);
  const images = new Map<string, CanvasImageSource>();
  for (const atlas of kept) {
    for (const page of atlas.pages) {
      const image = current.images.get(page.image) ?? current.images.get(page.name);
      if (image !== undefined) images.set(page.image, image);
    }
  }
  for (const [name, image] of imported.images) images.set(name, image);
  return { atlases: [...kept, imported.data], images };
}

/*
 * O `ImportLayout` (`'fila'` e `'pilha'`) saiu no lote 59, plano pasta do
 * projeto. A fila espalhava as imagens da esquerda para a direita: doze de
 * 580 px viraram 7.000 px de fila e a cena foi a 9%. Imagem da pasta não entra
 * na cena sozinha; o PSD traz a posição de cada camada. Os slots que este
 * comando ainda cria (quem chama com `newNames`) nascem na origem do osso.
 */

/**
 * Puts a fresh atlas and its slots into the document. Reverting restores the
 * whole of `assets`, `slots` and `skins`, and puts the old atlas back in the
 * viewport, so nothing of the previous state is left behind.
 */
export class ImportImagesCommand extends SnapshotCommand {
  readonly label: string;
  protected readonly keys: readonly FileKey[] = ['assets', 'slots', 'skins'];

  private readonly imported: ImportedAtlas;
  private readonly newNames: readonly string[];
  private previous: { atlases: readonly AtlasData[]; images: Map<string, CanvasImageSource> } | null = null;
  private previousCurrent: ImportedAtlas | null = null;

  constructor(label: string, imported: ImportedAtlas, newNames: readonly string[]) {
    super();
    this.label = label;
    this.imported = imported;
    this.newNames = newNames;
  }

  apply(doc: EditorDoc): void {
    const holder = asHolder(doc);
    if (holder !== null) {
      this.previous = {
        atlases: holder.atlases,
        images: new Map(holder.atlases.flatMap((atlas) => atlas.pages.map(
          (page: AtlasPageData) => [page.image, holder.imageFor(page)] as const,
        ).filter((pair): pair is readonly [string, CanvasImageSource] => pair[1] !== null))),
      };
    }
    const store = storeOf(doc);
    this.previousCurrent = store.current;

    super.apply(doc);

    store.current = this.imported;
    if (holder !== null && this.previous !== null) {
      const merged = mergedAssets(this.previous, this.previousCurrent?.data ?? null, this.imported);
      holder.setAssets(merged.atlases, merged.images);
    }
  }

  revert(doc: EditorDoc): void {
    super.revert(doc);
    const store = storeOf(doc);
    store.current = this.previousCurrent;
    const holder = asHolder(doc);
    if (holder !== null && this.previous !== null) {
      holder.setAssets(this.previous.atlases, this.previous.images);
    }
  }

  protected mutate(file: BoneFile): void {
    writeImportIntoFile(file, this.imported.packed, this.imported.fileName, this.newNames);
  }
}

/**
 * The whole document edit an import makes, on its own so it can be read and
 * tested without a browser: the atlas reference of §2.8, one slot per new
 * image, and one `region` attachment per slot in the editable skin.
 *
 * `width` and `height` are written in skeleton px — the original size of the
 * image (before the trim) divided by `atlas.scale`, which is what §7.3 asks
 * for. Writing them means the drawing looks right even before the atlas file
 * is next to the `.bone`.
 */
export function writeImportIntoFile(
  file: BoneFile,
  packed: PackedAtlas,
  atlasFileName: string,
  newNames: readonly string[],
): void {
  // 1. Point the skeleton at the atlas (spec 2.8).
  file.assets ??= {};
  const atlases = file.assets.atlases ?? [];
  file.assets.atlases = atlases.includes(atlasFileName)
    ? [...atlases]
    : [...atlases, atlasFileName];

  if (newNames.length === 0) return;

  // 2. One slot per new image, in the order the files came in.
  file.slots ??= [];
  file.skins ??= [];
  const bone = file.bones[0]?.name ?? 'root';
  const skin = editableSkin(file);
  skin.attachments ??= {};

  const taken = new Set(file.slots.map((slot) => slot.name));

  for (const regionName of newNames) {
    // Two identical images share one region, and the second name lives in
    // `aliases` (spec 10.5). Both still deserve a slot: a left arm and a right
    // arm are two things on screen even when the drawing is the same file.
    const region = packed.regions.find(
      (r) => r.name === regionName || (r.aliases ?? []).includes(regionName),
    );
    if (region === undefined) continue;
    const width = (region.originalWidth ?? region.width) / packed.scale;
    const height = (region.originalHeight ?? region.height) / packed.scale;

    const slotName = uniqueName(lastSegment(regionName), taken);
    taken.add(slotName);

    const slot: SlotDef = { name: slotName, bone, attachment: slotName };
    file.slots.push(slot);

    const attachment: RegionAttachmentDef = { type: 'region', width, height };
    if (regionName !== slotName) attachment.path = regionName;

    const perSlot = skin.attachments[slotName] ?? {};
    perSlot[slotName] = attachment;
    skin.attachments[slotName] = perSlot;
  }
}

/** Last segment of a region name: `bracos/mao_01` gives `mao_01`. */
function lastSegment(name: string): string {
  const parts = name.split('/');
  return parts[parts.length - 1];
}

/** The skin a new attachment goes into: the first visible one, or `default`. */
function editableSkin(file: BoneFile): SkinDef {
  const skins = file.skins as SkinDef[];
  const wanted = skins.length > 0 ? skins[0].name : 'default';
  const found = skins.find((skin) => skin.name === wanted);
  if (found !== undefined) return found;
  const created: SkinDef = { name: wanted, attachments: {} };
  skins.push(created);
  return created;
}

// ---------------------------------------------------------------------------
// The entry point
// ---------------------------------------------------------------------------

/*
 * "Importar imagens" (`importImages`) saiu no lote 59. As imagens chegam pela
 * pasta do projeto (`project-folder.ts`) ou soltas na janela, e ficam na aba
 * Imagens: nada é empacotado na hora, e nada entra na cena sozinho.
 */

/*
 * "Reempacotar atlas" (`repackAtlas`) saiu no lote 62: o atlas nasce ao Salvar
 * (`folder-save.ts`), só com as imagens em uso. Reempacotar é o Salvar.
 */

/** Forgets the imported images of a document, e.g. after "Novo". */
export function forgetImportedImages(doc: EditorDoc): void {
  stores.delete(doc);
}

// ---------------------------------------------------------------------------
// Saving what was packed
// ---------------------------------------------------------------------------

/** The `.atlas.json` text of the current pack, or `null` when there is none. */
export function atlasFileText(doc: EditorDoc): string | null {
  const imported = storeOf(doc).current;
  if (imported === null) return null;
  return `${JSON.stringify(imported.packed.atlas, null, 2)}\n`;
}

/** One PNG per page of the current pack, named as `page.image`. */
export async function atlasPageBlobs(doc: EditorDoc): Promise<Array<{ name: string; blob: Blob }>> {
  const imported = storeOf(doc).current;
  if (imported === null) return [];
  const out: Array<{ name: string; blob: Blob }> = [];
  for (const page of imported.packed.pages) {
    const canvas = imported.images.get(page.image);
    if (!(canvas instanceof HTMLCanvasElement)) continue;
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
    if (blob !== null) out.push({ name: page.image, blob });
  }
  return out;
}

/** A short line for the status bar: how many images, how many pages, how full. */
export function packSummary(imported: ImportedAtlas): string {
  const { packed } = imported;
  const pages = packed.pages.length === 1 ? '1 página' : `${packed.pages.length} páginas`;
  const usage = `${(packed.usage * 100).toFixed(0)}% aproveitado`;
  return `${packed.imageCount} imagens, ${pages}, ${usage}`;
}
