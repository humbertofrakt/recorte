/**
 * "Importar PSD" (requirement R3 / I1).
 *
 * This is the door the art comes in through. A character is drawn in Photoshop,
 * one body part per layer; this module opens that `.psd` (or `.psb`), packs
 * every layer into an atlas with the very same packer the command line uses,
 * and writes one slot with one `region` attachment per layer into the open
 * document — each one sitting exactly where its layer sat on the canvas, and in
 * the PSD's own draw order.
 *
 * Three promises this module keeps:
 *
 *   1. ONE undo step. Everything the import writes — the atlas reference, the
 *      bones, the slots, the skin — goes in inside a single `Command`, so one
 *      Ctrl+Z puts the document back exactly as it was.
 *   2. Nothing is lost in silence. Whatever the PSD carries that a `.bone`
 *      cannot — an unknown blend mode, a layer mask, a layer with no pixels —
 *      comes back as a line of Portuguese in a plain window with a Fechar button.
 *   3. Nothing is overwritten without being asked. When the document already
 *      has a skeleton, the user picks between replacing it and adding to it.
 *
 * The reading itself is `ferramentas/src/importar/psd.ts`, shared with
 * `ferramentas/importar-psd.mjs`, so a PSD opened here and a PSD converted on
 * the command line give the same slots in the same places.
 */

import { loadAtlas } from '../../../runtime/src/index.js';
import type {
  AtlasData, AtlasPageData, BoneFile, RegionAttachmentDef, SkinDef, SlotDef,
} from '../../../runtime/src/index.js';
import { packAtlas } from '../../../ferramentas/src/atlas/packer.js';
import type { PackOptions, PackedAtlas, PackerItem } from '../../../ferramentas/src/atlas/packer.js';
import { psdPlacement, readPsdAsync } from '../../../ferramentas/src/importar/psd.js';
import type { PsdDocument, PsdLayer } from '../../../ferramentas/src/importar/psd.js';
import { buildPsdRig, isBonesLayer } from '../../../ferramentas/src/importar/psd-bones.js';
import {
  addImportedItems, atlasBaseName, importedItems, importedStock, mergedAssets, packImportedStock,
  restoreImportedStock, setImportedAtlas,
} from './import-images.js';
import type { ImportedAtlas, ImportedStock } from './import-images.js';
import { SnapshotCommand } from '../doc/commands.js';
import type { FileKey } from '../doc/commands.js';
import type { EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4.
import { el } from '../ui/dom.js';

/** What the file picker offers. */
const PSD_TYPES = ['.psd', '.psb'];

/** Extension of an atlas file (spec 10.1). */
const ATLAS_EXTENSION = '.atlas.json';

/** What to do when the document already has a skeleton. */
export type PsdMode = 'substituir' | 'acrescentar';

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
// Picking and reading
// ---------------------------------------------------------------------------

interface FileHandle { readonly name: string; getFile(): Promise<File> }
interface PickerWindow { showOpenFilePicker?(options?: unknown): Promise<FileHandle[]> }

/** Asks for one `.psd` or `.psb`. Returns `null` when the user cancels. */
export async function pickPsdFile(): Promise<File | null> {
  const w = globalThis as unknown as PickerWindow;
  if (typeof w.showOpenFilePicker === 'function') {
    try {
      const handles = await w.showOpenFilePicker({
        multiple: false,
        types: [{
          description: 'Arquivo do Photoshop em camadas',
          accept: { 'image/vnd.adobe.photoshop': PSD_TYPES },
        }],
      });
      return handles.length === 0 ? null : await handles[0].getFile();
    } catch {
      return null; // The user closed the dialog.
    }
  }
  return new Promise((done) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = PSD_TYPES.join(',');
    input.addEventListener('change', () => {
      const list = input.files;
      done(list === null || list.length === 0 ? null : list[0]);
    });
    input.addEventListener('cancel', () => done(null));
    input.click();
  });
}

interface StreamWindow {
  DecompressionStream?: new (format: string) => TransformStream<Uint8Array, Uint8Array>;
}

/**
 * The browser's inflate, for the ZIP compressions of a PSD.
 *
 * `DecompressionStream` is a promise, and the reader is written for a
 * synchronous one, which is why the reading goes through `readPsdAsync`.
 */
async function browserInflate(data: Uint8Array): Promise<Uint8Array> {
  const Stream = (globalThis as unknown as StreamWindow).DecompressionStream;
  if (Stream === undefined) {
    throw new Error('este navegador não descompacta ZIP; salve o PSD sem compressão ZIP');
  }
  const copy = new Uint8Array(data.length);
  copy.set(data);
  const stream = new Blob([copy.buffer]).stream().pipeThrough(new Stream('deflate'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** Reads a picked file into a `PsdDocument`. Throws in plain Portuguese. */
export async function readPsdFile(file: File): Promise<PsdDocument> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  return readPsdAsync(bytes, { inflate: browserInflate });
}

// ---------------------------------------------------------------------------
// Packing the layers
// ---------------------------------------------------------------------------

/**
 * The atlas one PSD import produced.
 *
 * It is `ImportedAtlas` of `import-images.ts` under another name: the PSD goes
 * into the SAME stock as the loose images, so a document ends with one atlas
 * and one page, and "Reempacotar atlas" and "Salvar" see the layers too.
 */
export type PsdAtlas = ImportedAtlas;

/**
 * Renames any layer whose name is already a region of the document's atlas.
 *
 * Without this, the layer would take that region's place in the pack and
 * silently change the drawing of an attachment that has nothing to do with the
 * PSD. Renaming keeps both, and every rename comes back as a line of warning.
 */
export function renameClashingLayers(psd: PsdDocument, taken: readonly string[]): string[] {
  const warnings: string[] = [];
  const used = new Set(taken);
  for (const layer of psd.layers) {
    if (!used.has(layer.name)) {
      used.add(layer.name);
      continue;
    }
    const fresh = uniqueName(layer.name, used);
    used.add(fresh);
    warnings.push(
      `Já havia um desenho chamado "${layer.name}" neste arquivo. `
      + `A camada do PSD entrou como "${fresh}", para não apagar o que já existia.`,
    );
    layer.name = fresh;
    layer.leaf = fresh.split('/').pop() ?? fresh;
  }
  return warnings;
}

/** One canvas per page, ready for `imageFor`. */
function pagesToCanvases(packed: PackedAtlas): Map<string, CanvasImageSource> {
  const images = new Map<string, CanvasImageSource>();
  for (const page of packed.pages) {
    const canvas = document.createElement('canvas');
    canvas.width = page.width;
    canvas.height = page.height;
    const ctx = canvas.getContext('2d');
    if (ctx === null) throw new Error('o navegador não deu um contexto 2D para montar a página');
    ctx.putImageData(
      new ImageData(new Uint8ClampedArray(page.pixels), page.width, page.height), 0, 0,
    );
    images.set(page.image, canvas);
  }
  return images;
}

/** One packer item per layer of the PSD, named as the layer is named. */
export function psdPackerItems(psd: PsdDocument): PackerItem[] {
  return psd.layers.map((layer: PsdLayer) => ({
    name: layer.name,
    width: layer.width,
    height: layer.height,
    pixels: layer.pixels,
  }));
}

/**
 * Every layer of the PSD, packed into one atlas of its own.
 *
 * Used when there is no document to share a stock with — a test, a bench. The
 * menu goes through `packImportedStock`, which packs the layers together with
 * whatever the document already imported.
 */
export function packPsdLayers(
  psd: PsdDocument, base: string, options: PackOptions = {},
): PsdAtlas {
  const merged: PackOptions = {
    generator: 'Recorte editor — importar PSD',
    pageName: base,
    ...options,
  };
  const packed = packAtlas(psdPackerItems(psd), merged);
  return {
    fileName: base + ATLAS_EXTENSION,
    packed,
    data: loadAtlas(JSON.parse(JSON.stringify(packed.atlas))),
    images: pagesToCanvases(packed),
    options: merged,
  };
}

// ---------------------------------------------------------------------------
// The document edit, on its own so a test can read it without a browser
// ---------------------------------------------------------------------------

export interface PsdWriteOptions {
  mode: PsdMode;
  /** Name written in `assets.atlases`. */
  atlasName: string;
  /** `skeleton.name` when replacing. */
  name?: string;
  /** Name of the root bone the slots hang from. Default `root`. */
  rootBone?: string;
  /**
   * As camadas `ossos` do PSD — lote 45. Com elas, cada linha vira um osso
   * pendurado no osso raiz, e cada desenho vai para o osso que o cobre. Elas
   * NÃO estão em `psd.layers`: não viram desenho nem entram no atlas.
   */
  bonesLayers?: readonly PsdLayer[];
}

export interface PsdWriteResult {
  /** Slot name given to each layer, in the same order as `psd.layers`. */
  slotNames: string[];
  /** Os ossos que a camada `ossos` criou, pai antes de filho. */
  boneNames: string[];
  warnings: string[];
}

/** PSD blend keys the `.bone` format has a name for (spec 7.12). */
const BLEND_MODES: Record<string, 'multiply' | 'screen' | 'additive'> = {
  'mul ': 'multiply',
  scrn: 'screen',
  lddg: 'additive',
  lite: 'additive',
};

/** How a PSD blend key is called in Portuguese, for the warning. */
const BLEND_NAMES: Record<string, string> = {
  diss: 'Dissolver', dark: 'Escurecer', idiv: 'Subexposição de cores',
  lbrn: 'Subexposição linear', dkCl: 'Cor mais escura', lgCl: 'Cor mais clara',
  over: 'Sobrepor', sLit: 'Luz suave', hLit: 'Luz intensa', vLit: 'Luz vívida',
  lLit: 'Luz linear', pLit: 'Luz do pino', hMix: 'Mistura dura', diff: 'Diferença',
  smud: 'Exclusão', fsub: 'Subtrair', fdiv: 'Dividir', hue: 'Matiz',
  sat: 'Saturação', colr: 'Cor', lum: 'Luminosidade',
};

/** The skin a new attachment goes into: the first one, or a fresh `default`. */
function editableSkin(file: BoneFile): SkinDef {
  file.skins ??= [];
  const skins = file.skins;
  if (skins.length > 0) {
    skins[0].attachments ??= {};
    return skins[0];
  }
  const created: SkinDef = { name: 'default', attachments: {} };
  skins.push(created);
  return created;
}

/** Last segment of a layer name: `corpo/braco` gives `braco`. */
function lastSegment(name: string): string {
  const parts = name.split('/');
  return parts[parts.length - 1];
}

/**
 * The whole document edit one PSD import makes.
 *
 * `substituir` throws away the bones, slots, skins and animations that were
 * there and builds the character again from the PSD. `acrescentar` keeps every
 * one of them and hangs the new slots off the first bone, at the end of the
 * draw order — which is where a new layer belongs, on top of what exists.
 */
export function writePsdIntoFile(
  file: BoneFile, psd: PsdDocument, options: PsdWriteOptions,
): PsdWriteResult {
  const warnings: string[] = [];
  const slotNames: string[] = [];

  if (options.mode === 'substituir') {
    if ((file.animations ?? []).length > 0) {
      warnings.push(
        `As ${(file.animations ?? []).length} animações do arquivo saíram junto com o esqueleto antigo. `
        + 'Elas apontavam para ossos que não existem mais.',
      );
    }
    delete file.animations;
    delete file.constraints;
    file.bones = [{ name: options.rootBone ?? 'root' }];
    file.slots = [];
    file.skins = [{ name: 'default', attachments: {} }];
    file.skeleton = {
      ...(file.skeleton ?? {}),
      name: options.name ?? file.skeleton?.name ?? 'psd',
      x: -psd.width / 2,
      y: -psd.height / 2,
      width: psd.width,
      height: psd.height,
    };
  }

  // The atlas the layers were packed into (spec 2.8).
  file.assets ??= {};
  const atlases = file.assets.atlases ?? [];
  file.assets.atlases = atlases.includes(options.atlasName)
    ? [...atlases]
    : [...atlases, options.atlasName];

  file.slots ??= [];
  const skin = editableSkin(file);
  skin.attachments ??= {};
  const bone = options.rootBone ?? file.bones[0]?.name ?? 'root';
  const taken = new Set(file.slots.map((slot) => slot.name));

  // Lote 45: as linhas da camada `ossos` viram ossos pendurados em `bone`.
  const bonesLayers = options.bonesLayers ?? [];
  const rig = bonesLayers.length > 0
    ? buildPsdRig(psd, bonesLayers, psd.layers, { rootBone: bone, taken: file.bones.map((b) => b.name) })
    : null;
  if (rig !== null) {
    warnings.push(...rig.warnings);
    file.bones.push(...(rig.bones as unknown as typeof file.bones));
  }

  for (let index = 0; index < psd.layers.length; index++) {
    const layer = psd.layers[index]!;
    const placed = rig === null ? null : rig.placements[index] ?? null;
    const slotName = uniqueName(lastSegment(layer.name), taken);
    taken.add(slotName);
    slotNames.push(slotName);

    const slot: SlotDef = { name: slotName, bone: placed?.bone ?? bone, attachment: slotName };
    if (layer.folder !== '') slot.folder = layer.folder;
    if (!layer.visible) slot.visible = false;
    const blend = BLEND_MODES[layer.blendMode];
    if (blend !== undefined) slot.blend = blend;
    else if (layer.blendMode !== 'norm' && layer.blendMode !== 'pass') {
      const pretty = BLEND_NAMES[layer.blendMode.trim()] ?? layer.blendMode.trim();
      warnings.push(
        `A camada "${layer.name}" usa a mistura "${pretty}", que o formato não tem. Ela entrou como normal.`,
      );
    }
    file.slots.push(slot);

    const place = psdPlacement(psd, layer);
    const attachment: RegionAttachmentDef = placed === null
      ? { type: 'region', x: place.x, y: place.y, width: place.width, height: place.height }
      : {
        type: 'region',
        x: placed.x,
        y: placed.y,
        ...(placed.rotation !== 0 ? { rotation: placed.rotation } : {}),
        width: place.width,
        height: place.height,
      };
    if (layer.name !== slotName) attachment.path = layer.name;
    skin.attachments[slotName] = { [slotName]: attachment };
  }

  return { slotNames, boneNames: rig === null ? [] : rig.bones.map((b) => b.name), warnings };
}

// ---------------------------------------------------------------------------
// The command
// ---------------------------------------------------------------------------

/**
 * One undo step for the whole import: the file members it touched go back to
 * what they were, and the viewport gets its old atlas back with them.
 */
export class ImportPsdCommand extends SnapshotCommand {
  readonly label = 'Importar PSD';
  protected readonly keys: readonly FileKey[];

  private readonly psd: PsdDocument;
  private readonly atlas: PsdAtlas;
  private readonly options: PsdWriteOptions;
  private previous: { atlases: readonly AtlasData[]; images: Map<string, CanvasImageSource> } | null = null;
  /** The image stock as it was before the import, so an undo puts it back. */
  private previousStock: ImportedStock | null = null;

  /** Filled in by `apply`, so the caller can read the slots it created. */
  result: PsdWriteResult = { slotNames: [], boneNames: [], warnings: [] };

  constructor(psd: PsdDocument, atlas: PsdAtlas, options: PsdWriteOptions) {
    super();
    this.psd = psd;
    this.atlas = atlas;
    this.options = options;
    // Acrescentar com ossos mexe em `bones` também, e o desfazer tem de saber.
    this.keys = options.mode === 'substituir'
      ? ['assets', 'skeleton', 'bones', 'slots', 'skins', 'constraints', 'animations']
      : (options.bonesLayers ?? []).length > 0
        ? ['assets', 'bones', 'slots', 'skins']
        : ['assets', 'slots', 'skins'];
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
    this.previousStock = importedStock(doc);

    super.apply(doc);

    // The layers join the document's own stock, so "Reempacotar atlas" and
    // "Salvar" — both of which read that stock — see them from now on.
    // Replacing the character also replaces its drawings: the stock is emptied
    // first, so no region of the old atlas survives with nothing pointing at it.
    if (this.options.mode === 'substituir') {
      restoreImportedStock(doc, { items: [], current: null });
    }
    addImportedItems(doc, psdPackerItems(this.psd));
    setImportedAtlas(doc, this.atlas);
    // Ao lado dos atlas que vieram com o arquivo, e não no lugar deles —
    // conserto de 10/09/2026, a mesma conta do "Importar imagens".
    if (holder !== null && this.previous !== null) {
      const merged = mergedAssets(this.previous, this.previousStock?.current?.data ?? null, this.atlas);
      holder.setAssets(merged.atlases, merged.images);
    }
  }

  revert(doc: EditorDoc): void {
    super.revert(doc);
    if (this.previousStock !== null) restoreImportedStock(doc, this.previousStock);
    const holder = asHolder(doc);
    if (holder !== null && this.previous !== null) {
      holder.setAssets(this.previous.atlases, this.previous.images);
    }
  }

  protected mutate(file: BoneFile): void {
    this.result = writePsdIntoFile(file, this.psd, this.options);
  }
}

// ---------------------------------------------------------------------------
// Asking what to do with the skeleton already in the document
// ---------------------------------------------------------------------------

/** `true` when this document already has a character in it. */
export function hasSkeleton(file: BoneFile): boolean {
  return file.bones.length > 1 || (file.slots ?? []).length > 0;
}

/**
 * The question, with the answer spelled out on each button.
 *
 * No icon without a label and no "OK / Cancelar": each button says what will
 * happen to the drawing already on screen, because that is the only thing the
 * user is actually deciding.
 */
export function askPsdMode(host: HTMLElement = document.body): Promise<PsdMode | null> {
  return new Promise((done) => {
    let answered = false;
    const finish = (answer: PsdMode | null): void => {
      if (answered) return;
      answered = true;
      document.removeEventListener('keydown', onKey, true);
      root.remove();
      done(answer);
    };

    const replace = el('button', {
      class: 'dialog-close', type: 'button', text: 'Substituir o que já existe',
    }) as HTMLButtonElement;
    const add = el('button', {
      class: 'dialog-close', type: 'button', text: 'Acrescentar ao que já existe',
    }) as HTMLButtonElement;
    const cancel = el('button', {
      class: 'dialog-close', type: 'button', text: 'Cancelar',
    }) as HTMLButtonElement;

    replace.addEventListener('click', () => finish('substituir'));
    add.addEventListener('click', () => finish('acrescentar'));
    cancel.addEventListener('click', () => finish(null));

    const box = el('div', {
      class: 'dialog-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Já existe uma base',
    }, [
      el('h2', { class: 'dialog-title', text: 'Já existe uma base neste arquivo' }),
      el('p', {
        class: 'dialog-lead',
        text: 'Escolha o que fazer com os ossos e os slots que já estão aqui.',
      }),
      el('ul', { class: 'dialog-list' }, [
        el('li', { text: 'Substituir: apaga os ossos, os slots e as animações, e monta tudo de novo pelo PSD.' }),
        el('li', { text: 'Acrescentar: guarda o que existe e põe as camadas do PSD por cima.' }),
      ]),
      el('div', { class: 'dialog-buttons' }, [replace, add, cancel]),
    ]);
    const root = el('div', { class: 'dialog-veil' }, [box]);

    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      finish(null);
    }

    root.addEventListener('pointerdown', (event) => {
      if (event.target === root) finish(null);
    });
    document.addEventListener('keydown', onKey, true);
    host.append(root);
    add.focus();
  });
}

// ---------------------------------------------------------------------------
// The whole command, from the menu
// ---------------------------------------------------------------------------

export interface ImportPsdOptions {
  /** The file to read. When missing, the user is asked for it. */
  file?: File;
  /** Skips the question. When missing and a skeleton exists, the user is asked. */
  mode?: PsdMode;
  /** Passed straight to the packer. */
  pack?: PackOptions;
  /** `true` lê a camada `ossos` como esqueleto — "Importar → PSD com ossos…", lote 45. */
  bones?: boolean;
}

/** O aviso do Importar → PSD… de sempre quando o PSD tem a camada `ossos`. */
export const BONES_LAYER_SKIPPED_EDITOR =
  'Camada "ossos" ignorada: use Arquivo → Importar → PSD com ossos… para ela virar esqueleto.';

/**
 * Tira a camada `ossos` dos desenhos — lote 45. Ela **nunca** vira desenho:
 * com `bones`, volta para virar esqueleto; sem, fica de fora, com aviso. Mexe
 * em `psd.layers`, que depois vai para o atlas e para os slots.
 */
export function splitBonesLayers(
  psd: PsdDocument, bones: boolean,
): { bonesLayers: PsdLayer[]; warnings: string[] } {
  const found = psd.layers.filter(isBonesLayer);
  psd.layers = psd.layers.filter((layer) => !isBonesLayer(layer));
  const warnings: string[] = [];
  if (bones && found.length === 0) {
    warnings.push('Não há camada "ossos" neste PSD. Todo desenho ficou preso ao osso raiz, '
      + 'como no Importar → PSD… de sempre.');
  }
  if (!bones && found.length > 0) warnings.push(BONES_LAYER_SKIPPED_EDITOR);
  return { bonesLayers: bones ? found : [], warnings };
}

export interface ImportPsdResult {
  psd: PsdDocument;
  atlas: PsdAtlas;
  mode: PsdMode;
  slotNames: string[];
  warnings: string[];
  /** One line for the status bar. */
  summary: string;
}

/**
 * "Arquivo → Importar PSD…": the whole thing.
 *
 * Returns `null` when the user cancelled — the file picker or the question.
 * Throws, in plain words, when the file is not a PSD or has no layer with
 * pixels; the shell turns that into the failure window.
 */
export async function importPsd(
  doc: EditorDoc, options: ImportPsdOptions = {},
): Promise<ImportPsdResult | null> {
  const file = options.file ?? await pickPsdFile();
  if (file === null) return null;

  const psd = await readPsdFile(file);
  if (psd.layers.length === 0) {
    const why = psd.warnings.length > 0 ? ` ${psd.warnings[0]}` : '';
    throw new Error(`Nenhuma camada com desenho neste arquivo.${why}`);
  }

  // Lote 45: a camada `ossos` sai dos desenhos, com ou sem ossos.
  const { bonesLayers, warnings: bonesWarnings } = splitBonesLayers(psd, options.bones === true);
  if (psd.layers.length === 0) {
    throw new Error('Este PSD só tem a camada "ossos". Falta a arte: as camadas de desenho.');
  }

  let mode = options.mode;
  if (mode === undefined) {
    mode = hasSkeleton(doc.file) ? await askPsdMode() ?? undefined : 'substituir';
    if (mode === undefined) return null; // The question was cancelled.
  }

  const stem = (file.name.split(/[\\/]/).pop() ?? 'psd').replace(/\.ps[db]$/i, '') || 'psd';

  /*
   * ONE ATLAS PER DOCUMENT, not one per importer.
   *
   * "Acrescentar" packs the layers together with whatever "Importar imagens"
   * already put in this document, so both end up on the same page and both are
   * written out on save. "Substituir" throws the old character away, and the
   * drawings of that character go with it: the atlas is then the PSD alone.
   */
  const packOptions: PackOptions = {
    generator: 'Recorte editor — importar PSD',
    ...(options.pack ?? {}),
  };
  const adding = mode === 'acrescentar';
  const clashes = adding
    ? renameClashingLayers(psd, importedItems(doc).map((item) => item.name))
    : [];
  const atlas = adding
    ? packImportedStock(doc, psdPackerItems(psd), packOptions, stem)
    : packPsdLayers(psd, atlasBaseName(doc, stem), packOptions);

  const command = new ImportPsdCommand(psd, atlas, {
    mode, atlasName: atlas.fileName, name: stem,
    ...(bonesLayers.length > 0 ? { bonesLayers } : {}),
  });
  doc.run(command);

  const warnings = [...psd.warnings, ...bonesWarnings, ...clashes, ...command.result.warnings];
  // Lote A4: a janela dos avisos é de quem chama (a casca), por `psdWarningsNote`.
  // O `io/` não abre janela da interface.

  return {
    psd,
    atlas,
    mode,
    slotNames: command.result.slotNames,
    warnings,
    summary: `${countLine(psd, command.result.slotNames.length)} `
      + `${command.result.boneNames.length > 0
        ? `${plural(command.result.boneNames.length, 'osso criado', 'ossos criados')}. `
        : ''}${pagesLine(atlas)}`,
  };
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

function countLine(psd: PsdDocument, slots: number): string {
  return `${plural(psd.layers.length, 'camada lida', 'camadas lidas')}, `
    + `${plural(slots, 'slot criado', 'slots criados')}.`;
}

/**
 * A janela dos avisos de uma importação, como dado — lote A4. Quem chama
 * `importPsd` (a casca) a mostra com `tellUser`, depois de importar e antes de
 * escrever o resumo no rodapé, como antes. `null` quando não há aviso.
 */
export function psdWarningsNote(
  result: { psd: PsdDocument; slotNames: readonly string[]; warnings: readonly string[] },
): { title: string; lead: string; lines: string[]; closeLabel: string } | null {
  if (result.warnings.length === 0) return null;
  return {
    title: 'PSD importado, com avisos',
    lead: `${countLine(result.psd, result.slotNames.length)} Estes pontos merecem uma olhada:`,
    lines: [...result.warnings],
    closeLabel: 'Fechar',
  };
}

function pagesLine(atlas: PsdAtlas): string {
  const pages = atlas.packed.pages.length;
  const usage = `${(atlas.packed.usage * 100).toFixed(0)}% aproveitado`;
  return `${plural(pages, 'página de atlas', 'páginas de atlas')}, ${usage}.`;
}

/** The `.atlas.json` text of an import, for whoever saves it next to the `.bone`. */
export function psdAtlasText(atlas: PsdAtlas): string {
  return `${JSON.stringify(atlas.packed.atlas, null, 2)}\n`;
}

/** One PNG per page of an import, named as `page.image`. */
export async function psdAtlasPageBlobs(atlas: PsdAtlas): Promise<Array<{ name: string; blob: Blob }>> {
  const out: Array<{ name: string; blob: Blob }> = [];
  for (const page of atlas.packed.pages) {
    const canvas = atlas.images.get(page.image);
    if (!(canvas instanceof HTMLCanvasElement)) continue;
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
    if (blob !== null) out.push({ name: page.image, blob });
  }
  return out;
}
