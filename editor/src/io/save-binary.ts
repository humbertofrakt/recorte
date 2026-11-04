/**
 * "Salvar como binário" and "Salvar como pacote" (owner A).
 *
 * Both write the very same document the `.bone` would hold — the tree comes
 * from `doc.serialize()`, so the editor state, the timestamp and every rounded
 * number are identical to what "Salvar" writes. Only the container changes:
 *
 *   `.boneb`  the binary layout of spec 11. Smaller and faster to parse.
 *   `.bonez`  a ZIP with the skeleton, its atlas and its page images inside,
 *             so one file is the whole character (spec 2.9).
 *
 * The browser has no synchronous deflate, and the ZIP writer asks for one. So
 * every entry is compressed first, with `CompressionStream('deflate-raw')`,
 * and the writer is handed a codec that just looks the answer up. When the
 * browser has no `CompressionStream`, the package still comes out — stored
 * instead of deflated, which every ZIP reader accepts.
 */

import { writeBoneb } from '../../../ferramentas/src/binario/escrever.js';
import { writeBonez } from '../../../ferramentas/src/binario/bonez.js';
import type { BonezFile, BonezManifest, ZipCodec } from '../../../ferramentas/src/binario/bonez.js';
import { atlasPageBlobs } from './import-images.js';
import { atlasFilesForDisk } from './pivot-atlas.js';
import { buildFolderPack } from './folder-save.js';
import { isProvisionalAtlas } from './project-folder.js';
import { MANIFEST_NAME, joinBase, montagemMapped, projectFilesToSave, skeletonsBaseOf } from './project-open.js';
import { readMontagem, writeMontagem } from '../doc/montagem.js';
import { PROJECT_EXTRA, Projeto, emptyManifest, writeProjectLists } from '../doc/projeto.js';
import type { Doc } from '../doc/document.js';
import { nestedAttachments } from '../../../runtime/src/index.js';
import type { SkeletonData } from '../../../runtime/src/index.js';
import { entityFileText } from '../doc/entity-files.js';

// `atlasToJson` morava aqui até o lote 56. Mudou para `pivot-atlas.ts`, junto
// do carimbo, e continua saindo por esta porta.
export { atlasToJson } from './pivot-atlas.js';

/** Extension of the binary encoding (spec 11.1). */
export const BONEB_EXTENSION = '.boneb';
/** Extension of the package (spec 2.9). */
export const BONEZ_EXTENSION = '.bonez';

// ---------------------------------------------------------------------------
// Writing a file out
// ---------------------------------------------------------------------------

interface FileHandle {
  readonly name: string;
  createWritable(): Promise<{ write(data: Blob | Uint8Array): Promise<void>; close(): Promise<void> }>;
}
interface PickerWindow { showSaveFilePicker?(options?: unknown): Promise<FileHandle> }

/**
 * Hands the bytes to the user, by the nicest road the browser has. Returns the
 * name written, or `null` when the user closed the dialog.
 */
export async function putBytes(
  suggested: string, bytes: Uint8Array, description: string, extension: string, mime: string,
): Promise<string | null> {
  const w = globalThis as unknown as PickerWindow;
  // A fresh copy: the ZIP writer may hand back a view onto a bigger buffer,
  // and `Blob` would then carry the slack bytes with it.
  const blob = new Blob([bytes.slice().buffer as ArrayBuffer], { type: mime });

  if (typeof w.showSaveFilePicker === 'function') {
    let handle: FileHandle;
    try {
      handle = await w.showSaveFilePicker({
        suggestedName: suggested,
        types: [{ description, accept: { [mime]: [extension] } }],
      });
    } catch {
      return null; // The user closed the dialog.
    }
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return handle.name;
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = suggested;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
  return suggested;
}

/** File name without folder and without extension: `heroi.bone` gives `heroi`. */
export function stem(doc: Doc): string {
  const name = doc.path ?? doc.file.skeleton?.name ?? 'sem-nome';
  const base = name.split(/[\\/]/).pop() ?? name;
  return base.replace(/\.(bone|boneb|bonez|json)$/i, '') || 'sem-nome';
}

/** The tree that "Salvar" would write, so every container holds the same file. */
function treeOf(doc: Doc): unknown {
  return JSON.parse(doc.serialize());
}

/**
 * Os outros arquivos do projeto que vão dentro do pacote — degrau 10.
 *
 * Um documento sem projeto é o corpo único que ele é, e o pacote dele sai como
 * sempre saiu. **Não** se monta um projeto aqui só para perguntar: o
 * construtor do `Projeto` prende o documento a ele, e um "Salvar como pacote"
 * não é lugar de mudar o que o documento é.
 */
function projectPieces(doc: Doc, mainName: string): Array<{ name: string; text: string }> {
  const dele = doc.project;
  if (!(dele instanceof Projeto)) return [];
  return projectFilesToSave(dele, mainName).filter((file) => file.name !== MANIFEST_NAME);
}

/**
 * As listas da janela para dentro do pacote (2.9), com os caminhos que as
 * entradas do ZIP têm. `null` para um projeto de um corpo só: o pacote de um
 * personagem sozinho não carrega estado de editor nenhum.
 */
function projectLists(doc: Doc, mainName: string): unknown {
  const dele = doc.project;
  if (!(dele instanceof Projeto) || !dele.temVarios) return null;
  const lists = dele.lists;
  const base = skeletonsBaseOf(dele.emFoco.file);
  const pathOf = (uri: string): string => (uri === lists.emFoco ? mainName : joinBase(base, uri));
  const manifest = writeProjectLists(emptyManifest(mainName), {
    corpos: lists.corpos.map(pathOf),
    entidades: lists.entidades.map(pathOf),
    emFoco: mainName,
  });
  // Rodada 39: a montagem de teste vai junto no pacote, em caminhos.
  writeMontagem(manifest, montagemMapped(readMontagem(dele.manifesto), pathOf));
  return (manifest.extras ?? {})[PROJECT_EXTRA] ?? null;
}

// ---------------------------------------------------------------------------
// "Salvar como binário"
// ---------------------------------------------------------------------------

export interface BinarySaveResult {
  name: string;
  /** Size of the `.boneb`, in bytes. */
  size: number;
  /** Size the `.bone` would have had, for the line that reports the saving. */
  textSize: number;
}

/**
 * The `.boneb` bytes of the document, with no dialog in the way. Split out so
 * the bytes can be checked without a save dialog nobody can drive.
 */
export function binaryBytes(doc: Doc): { bytes: Uint8Array; textSize: number } {
  const text = doc.serialize();
  return {
    bytes: writeBoneb(JSON.parse(text)),
    textSize: new TextEncoder().encode(text).length,
  };
}

/**
 * Writes the document as `.boneb`. Returns `null` when the user cancelled.
 */
export async function saveAsBinary(doc: Doc): Promise<BinarySaveResult | null> {
  const { bytes, textSize } = binaryBytes(doc);
  const suggested = `${stem(doc)}${BONEB_EXTENSION}`;
  const name = await putBytes(
    suggested, bytes, 'Esqueleto Recorte binário', BONEB_EXTENSION, 'application/vnd.bone',
  );
  if (name === null) return null;
  return { name, size: bytes.length, textSize };
}

/** How much smaller the binary came out, as a line for the status bar. */
export function savingLine(result: BinarySaveResult): string {
  const cut = result.textSize === 0 ? 0 : (1 - result.size / result.textSize) * 100;
  const percent = cut.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
  return `Salvo em ${result.name}. ${result.size.toLocaleString('pt-BR')} bytes, ${percent}% menor que o .bone.`;
}

// ---------------------------------------------------------------------------
// "Salvar como pacote"
// ---------------------------------------------------------------------------

/** Raw deflate for the browser, prepared ahead of time. */
export async function browserCodec(datas: readonly Uint8Array[]): Promise<ZipCodec> {
  const ready = new Map<Uint8Array, Uint8Array>();
  const Compression = (globalThis as unknown as {
    CompressionStream?: new (format: string) => TransformStream<Uint8Array, Uint8Array>;
  }).CompressionStream;
  if (Compression !== undefined) {
    for (const data of datas) {
      try {
        const stream = new Blob([data.slice().buffer as ArrayBuffer]).stream()
          .pipeThrough(new Compression('deflate-raw'));
        ready.set(data, new Uint8Array(await new Response(stream).arrayBuffer()));
      } catch {
        // No deflate for this one: it goes in stored, which is still valid.
      }
    }
  }
  // Returning the input unchanged makes the writer keep the entry stored,
  // because "compressed" never came out smaller.
  return { deflateRaw: (data) => ready.get(data) ?? data };
}

export interface PackageSaveResult {
  name: string;
  size: number;
  /** Names of everything that went in, in order, for the report. */
  entries: string[];
  /** What could not go in, in Portuguese. */
  warnings: string[];
}

/**
 * Writes the document, its atlas and its page images as one `.bonez`.
 *
 * Returns `null` when the user cancelled. The images come from whatever the
 * viewport is drawing, so a character opened with its atlas packs complete,
 * and one opened without it packs with a warning saying so.
 */
export async function saveAsPackage(doc: Doc): Promise<PackageSaveResult | null> {
  const built = await packageBytes(doc);
  const suggested = `${stem(doc)}${BONEZ_EXTENSION}`;
  const name = await putBytes(
    suggested, built.bytes, 'Pacote Recorte', BONEZ_EXTENSION, 'application/vnd.bone+zip',
  );
  if (name === null) return null;
  return { name, size: built.bytes.length, entries: built.entries, warnings: built.warnings };
}

/**
 * The `.bonez` bytes of the document, with no dialog in the way. Split out for
 * the same reason as {@link binaryBytes}.
 */
export async function packageBytes(
  doc: Doc,
): Promise<{ bytes: Uint8Array; entries: string[]; warnings: string[] }> {
  const warnings: string[] = [];
  const encoder = new TextEncoder();
  const base = stem(doc);
  const mainName = `${base}.bone`;

  // Lote 62: as imagens da pasta em uso viram um atlas, e o `.bone` o cita —
  // por isso antes do `serialize`.
  const pack = await buildFolderPack(doc, base);
  const files: BonezFile[] = [
    { name: mainName, data: encoder.encode(doc.serialize()) },
  ];
  const atlasNames: string[] = [];
  const imageNames: string[] = [];

  // 1. The atlas, stamped with the pivots the rig says (plano pivô, lote 56).
  //    An imported one keeps its exact text when the stamp changed nothing; a
  //    loaded one is written back from the tree the runtime read.
  const wanted = doc.file.assets?.atlases ?? [];
  const disk = atlasFilesForDisk(doc, base);
  for (const atlas of disk.files) {
    files.push({ name: atlas.name, data: encoder.encode(atlas.text) });
    atlasNames.push(atlas.name);
  }
  warnings.push(...disk.warnings);
  if (pack !== null) {
    files.push({ name: pack.atlasName, data: encoder.encode(pack.text) });
    atlasNames.push(pack.atlasName);
    for (const page of pack.pages) {
      files.push({ name: page.name, data: page.bytes });
      imageNames.push(page.name);
    }
  }
  const missing = wanted.filter((name) => name !== pack?.atlasName);
  if (disk.files.length === 0 && missing.length > 0) {
    // "esqueleto" virou "base" — rodada 4, consertos (a irmã da linha A6).
    warnings.push(`Esta base usa ${missing.join(', ')}, mas o atlas não está aberto. O pacote sai sem ele.`);
  }

  // 2. The page images.
  const fromImport = await atlasPageBlobs(doc);
  for (const page of fromImport) {
    files.push({ name: page.name, data: new Uint8Array(await page.blob.arrayBuffer()) });
    imageNames.push(page.name);
  }
  // Every other page too: since the fix of 10/09 the imported pack lives
  // BESIDE the atlases that came with the file, and their pages go in as well.
  for (const atlas of doc.atlases) {
    // As páginas provisórias da pasta já entraram empacotadas, acima.
    if (isProvisionalAtlas(atlas)) continue;
    for (const page of atlas.pages) {
      if (imageNames.includes(page.image)) continue;
      const source = doc.imageFor(page);
      if (source === null) {
        warnings.push(`A imagem ${page.image} não está aberta; ela fica fora do pacote.`);
        continue;
      }
      const bytes = await imageToPng(source, page.width, page.height);
      if (bytes === null) {
        warnings.push(`Não deu para gravar a imagem ${page.image} dentro do pacote.`);
        continue;
      }
      files.push({ name: page.image, data: bytes });
      imageNames.push(page.image);
    }
  }

  // Degrau 10 (10.1): **o pacote é o projeto**, não só o corpo em foco. A
  // pasta de trabalho é o `.bonez` aberto (§1.3, saída a), e "Salvar como
  // pacote" só zipa: os outros corpos, as entidades que o projeto abriu e as
  // listas da janela vão dentro, no mesmo manifesto (2.9).
  const projectFiles = projectPieces(doc, mainName);
  for (const file of projectFiles) {
    files.push({ name: file.name, data: encoder.encode(file.text) });
  }
  // Rodada 45, lote 1 (doc 57, T7): a entidade que o `.bone` cita e que o
  // projeto não abriu como peça dele (a espada do herói) ia ficando de fora,
  // calada. Agora ela entra pelo texto que o abrir guardou, ou vira aviso.
  const entidades = entidadesParaOPacote(doc.data, new Set(files.map((file) => file.name)), entityFileText);
  for (const file of entidades.files) files.push({ name: file.name, data: encoder.encode(file.text) });
  warnings.push(...entidades.warnings);

  const manifest: BonezManifest = {
    bonez: { version: '1.0' },
    main: mainName,
    skeletons: [mainName, ...projectFiles.map((file) => file.name), ...entidades.files.map((file) => file.name)],
    atlases: atlasNames,
    images: imageNames,
  };
  const lists = projectLists(doc, mainName);
  if (lists !== null) manifest.extras = { [PROJECT_EXTRA]: lists };

  const codec = await browserCodec(files.map((f) => f.data));
  const bytes = writeBonez({ manifest, files }, codec);
  return { bytes, entries: files.map((f) => f.name), warnings };
}

/**
 * **As entidades que o `.bone` cita**, para dentro do pacote — rodada 45, lote 1.
 *
 * Cada anexo `skeleton` (spec 7.11) aponta um arquivo. O que já está no pacote
 * (`jaDentro`) não entra de novo; o que o editor abriu entra pelo texto guardado
 * (`textoDe`); o que ele não tem vira **aviso**, nunca um silêncio.
 */
export function entidadesParaOPacote(
  data: SkeletonData | null,
  jaDentro: ReadonlySet<string>,
  textoDe: (uri: string) => string | null,
): { files: Array<{ name: string; text: string }>; warnings: string[] } {
  const files: Array<{ name: string; text: string }> = [];
  const warnings: string[] = [];
  if (data === null) return { files, warnings };
  const vistos = new Set(jaDentro);
  for (const attachment of nestedAttachments(data)) {
    const uri = attachment.resolvedUri;
    if (uri.length === 0 || vistos.has(uri)) continue;
    vistos.add(uri);
    const texto = textoDe(uri);
    if (texto === null) {
      warnings.push(`A entidade ${uri} não está aberta: ela fica fora do pacote, e o lugar dela abre vazio.`);
      continue;
    }
    files.push({ name: uri, text: texto });
  }
  return { files, warnings };
}

/** Draws an image onto a canvas and reads the PNG bytes back. */
export async function imageToPng(
  source: CanvasImageSource, width: number, height: number,
): Promise<Uint8Array | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const context = canvas.getContext('2d');
    if (context === null) return null;
    context.drawImage(source, 0, 0);
    const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
    if (blob === null) return null;
    return new Uint8Array(await blob.arrayBuffer());
  } catch {
    return null;
  }
}
