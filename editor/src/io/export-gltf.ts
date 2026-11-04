/**
 * "Arquivo → Exportar glTF…" (owner A).
 *
 * glTF is the format every 3D tool already reads: Blender, three.js, Babylon,
 * Godot, Unity and every online viewer. Exporting to it is how a `.bone`
 * reaches a program that has never heard of `.bone`.
 *
 * The work itself is done by `ferramentas/src/exportar/gltf.ts`, the very same
 * module the command line uses (`node ferramentas/exportar.mjs`). It imports
 * nothing from Node, so the editor calls it directly and the two roads produce
 * the same bytes.
 *
 * TWO SHAPES, ONE FILE EITHER WAY
 * -------------------------------
 *   `.glb`   header, JSON and numbers in one binary file. The default.
 *   `.gltf`  the JSON, with the numbers carried inside it as a `data:` address.
 *
 * A `.gltf` normally comes with a `.bin` next to it. A browser cannot promise
 * to write two files into the same folder, and half an export is worse than
 * none — so the numbers travel inside the JSON. Every glTF reader accepts that.
 *
 * WHAT DOES NOT FIT goes back as a list of warnings, in Portuguese, which the
 * shell shows in the plain message window.
 */

import { exportGltf, gltfToGlb } from '../../../ferramentas/src/exportar/gltf.js';
import type { GltfExport, GltfImage, GltfStats } from '../../../ferramentas/src/exportar/gltf.js';
import type { SkeletonData } from '../../../runtime/src/index.js';
import { atlasPageBlobs } from './import-images.js';
import { imageToPng, stem } from './save-binary.js';
import type { Doc } from '../doc/document.js';

/** Extension of the one-file binary shape. */
export const GLB_EXTENSION = '.glb';
/** Extension of the JSON shape. */
export const GLTF_EXTENSION = '.gltf';

/** Which of the two shapes to write. */
export type GltfFormat = 'glb' | 'gltf';

// ---------------------------------------------------------------------------
// Handing the bytes to the user
// ---------------------------------------------------------------------------

interface FileHandle {
  readonly name: string;
  createWritable(): Promise<{ write(data: Blob): Promise<void>; close(): Promise<void> }>;
}
interface PickerWindow { showSaveFilePicker?(options?: unknown): Promise<FileHandle> }

/** `.gltf` when the name ends in `.gltf`, `.glb` otherwise. */
export function formatOfName(name: string): GltfFormat {
  return name.toLowerCase().endsWith(GLTF_EXTENSION) ? 'gltf' : 'glb';
}

// ---------------------------------------------------------------------------
// The page images
// ---------------------------------------------------------------------------

/**
 * The atlas pages as encoded files, ready to go inside the glTF.
 *
 * Images imported in the editor still live as canvases, so they are read back
 * as PNG. Images opened from disk were decoded by the browser and the original
 * bytes are gone, so they are drawn onto a canvas and written out as PNG too:
 * the pixels are the same, only the file is re-encoded.
 */
export async function pageImages(
  doc: Doc,
): Promise<{ images: GltfImage[]; warnings: string[] }> {
  const warnings: string[] = [];
  const images: GltfImage[] = [];

  const packed = new Map<string, Blob>();
  for (const page of await atlasPageBlobs(doc)) packed.set(page.name, page.blob);

  for (const atlas of doc.atlases) {
    for (const page of atlas.pages) {
      const blob = packed.get(page.image);
      if (blob !== undefined) {
        images.push({ page: page.name, bytes: new Uint8Array(await blob.arrayBuffer()) });
        continue;
      }
      const source = doc.imageFor(page);
      if (source === null) {
        warnings.push(`A imagem ${page.image} não está aberta. Essa página sai sem textura.`);
        continue;
      }
      const bytes = await imageToPng(source, page.width, page.height);
      if (bytes === null) {
        warnings.push(`Não deu para gravar a imagem ${page.image} dentro do glTF.`);
        continue;
      }
      images.push({ page: page.name, bytes });
    }
  }
  return { images, warnings };
}

// ---------------------------------------------------------------------------
// A virada de corpo — degrau 10, tarefa 10.6
// ---------------------------------------------------------------------------

/**
 * **O exportador recebe UM corpo, e a virada vira aviso** (10.6).
 *
 * Um glTF é um esqueleto: ele não tem onde guardar *"daqui a meio segundo o
 * homem é um lobisomem, com outros ossos"* (9.13). O que sai é o corpo
 * escolhido, do começo ao fim — e o que ficou de fora vai escrito na janela,
 * com o nome da animação e o segundo da virada, porque uma perda que ninguém
 * leu é uma perda descoberta dentro do motor do jogo, horas depois.
 */
export function bodySwitchWarnings(data: SkeletonData): string[] {
  const out: string[] = [];
  for (const animation of data.animations) {
    const tl = animation.body;
    if (tl === null || tl === undefined) continue;
    const viradas: string[] = [];
    tl.keys.values.forEach((key, i) => {
      if (key.value === null) return;
      const time = tl.keys.times[i] ?? 0;
      viradas.push(`${time.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} s → ${String(key.value)}`);
    });
    if (viradas.length === 0) continue;
    out.push(`A animação "${animation.name}" troca de base (${viradas.join('; ')}). `
      + 'O glTF guarda um esqueleto só: sai a base deste arquivo, do começo ao fim. '
      + 'Para o outro, exporte-o à parte.');
  }
  return out;
}

// ---------------------------------------------------------------------------
// Building the bytes
// ---------------------------------------------------------------------------

export interface GltfBuild {
  bytes: Uint8Array;
  format: GltfFormat;
  warnings: string[];
  stats: GltfStats;
}

/** The numbers buffer as a `data:` address, so a `.gltf` needs no `.bin`. */
function withEmbeddedBuffer(result: GltfExport): string {
  let binary = '';
  const chunk = 0x8000; // Big enough to be fast, small enough for the stack.
  for (let at = 0; at < result.bin.length; at += chunk) {
    binary += String.fromCharCode(...result.bin.subarray(at, at + chunk));
  }
  const base64 = btoa(binary);
  const json = { ...result.json };
  json.buffers = [{
    uri: `data:application/octet-stream;base64,${base64}`,
    byteLength: result.bin.length,
  }];
  return JSON.stringify(json, null, 2);
}

/**
 * Exports the open document, with no dialog in the way. Split out so a test
 * can check the bytes without a save dialog nobody can drive.
 *
 * Throws when there is no loaded skeleton — an empty document has nothing to
 * export, and saying so is better than writing an empty file.
 */
export async function gltfBytes(doc: Doc, format: GltfFormat = 'glb'): Promise<GltfBuild> {
  const data = doc.data;
  if (data === null) {
    throw new Error('Este arquivo não carregou. Abra ou conserte o esqueleto antes de exportar.');
  }

  const pictures = await pageImages(doc);
  const result = exportGltf(data, {
    images: pictures.images,
    binName: `${stem(doc)}.bin`,
    generator: 'Recorte editor 0.1.0',
  });

  const warnings = [...bodySwitchWarnings(data), ...pictures.warnings, ...result.warnings];
  if (format === 'gltf') {
    const text = withEmbeddedBuffer(result);
    return { bytes: new TextEncoder().encode(text), format, warnings, stats: result.stats };
  }
  return { bytes: gltfToGlb(result), format, warnings, stats: result.stats };
}

// ---------------------------------------------------------------------------
// The menu entry
// ---------------------------------------------------------------------------

export interface GltfSaveResult {
  name: string;
  size: number;
  format: GltfFormat;
  warnings: string[];
  stats: GltfStats;
}

/**
 * Asks where to put the file, builds it and writes it. Returns `null` when the
 * user closed the dialog.
 *
 * The name chosen decides the shape: end it in `.gltf` for the JSON, in `.glb`
 * for the binary. The export runs after the name is known, so nothing is built
 * for a dialog the user cancelled.
 */
export async function saveAsGltf(doc: Doc): Promise<GltfSaveResult | null> {
  const suggested = `${stem(doc)}${GLB_EXTENSION}`;
  const w = globalThis as unknown as PickerWindow;

  if (typeof w.showSaveFilePicker === 'function') {
    let handle: FileHandle;
    try {
      handle = await w.showSaveFilePicker({
        suggestedName: suggested,
        types: [
          { description: 'glTF binário (um arquivo só)', accept: { 'model/gltf-binary': [GLB_EXTENSION] } },
          { description: 'glTF em JSON', accept: { 'model/gltf+json': [GLTF_EXTENSION] } },
        ],
      });
    } catch {
      return null; // The user closed the dialog.
    }
    const built = await gltfBytes(doc, formatOfName(handle.name));
    const writable = await handle.createWritable();
    await writable.write(blobOf(built));
    await writable.close();
    return {
      name: handle.name, size: built.bytes.length, format: built.format,
      warnings: built.warnings, stats: built.stats,
    };
  }

  const built = await gltfBytes(doc, 'glb');
  download(suggested, blobOf(built));
  return {
    name: suggested, size: built.bytes.length, format: built.format,
    warnings: built.warnings, stats: built.stats,
  };
}

/** A fresh copy of the bytes: the builder may hand back a view onto more. */
function blobOf(built: GltfBuild): Blob {
  const mime = built.format === 'gltf' ? 'model/gltf+json' : 'model/gltf-binary';
  return new Blob([built.bytes.slice().buffer as ArrayBuffer], { type: mime });
}

function download(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** One line for the status bar: what came out, and how big. */
export function gltfLine(result: GltfSaveResult): string {
  const size = result.size.toLocaleString('pt-BR');
  const { stats } = result;
  return `Salvo em ${result.name}. ${size} bytes, ${stats.joints} ossos, `
    + `${stats.meshes} desenhos, ${stats.animations} animações.`;
}

/**
 * **O que o glTF deixa de fora, em palavras de usuário** — rodada 45, lote 4
 * (4.2). A janela listava 33 linhas na língua do formato: *constraint(s) (6)*,
 * *slot*, *attachment*, *tint black*, uma linha por coisa por animação. Aqui:
 * uma linha por animação, com o que dela não vai; sem número de seção.
 */
export function resumoDoGltf(warnings: readonly string[]): string[] {
  const palavras: Array<[RegExp, string]> = [
    [/constraint\(s\)/g, 'regra(s)'], [/constraints/g, 'regras'], [/\bslot\b/g, 'desenho'],
    [/attachment/g, 'desenho'], [/tint black/g, 'cor escura'], [/morph targets/g, 'formas (morph)'],
    [/\btags\b/g, 'marcas'], [/deform de malha/g, 'deformação de malha'],
    [/tem um esqueleto aninhado/g, 'tem uma entidade'], [/esqueleto aninhado/g, 'entidade'],
    [/pose de setup/g, 'pose de repouso'], [/\bno setup\b/g, 'na pose de repouso'], [/\bdo setup\b/g, 'da pose de repouso'],
    [/\bsetup\b/g, 'pose de repouso'],
  ];
  const limpar = (texto: string): string => palavras
    .reduce((t, [de, para]) => t.replace(de, para), texto)
    .replace(/\s*\(\d+(\.\d+)*\)/g, '');
  const porAnimacao = new Map<string, string[]>();
  const outras: string[] = [];
  for (const linha of warnings) {
    const m = /^A animação "(.+?)" usa (.+?) \([\d.]+\); glTF não tem equivalente, essa parte não é exportada\.?$/.exec(linha);
    if (m !== null) {
      const lista = porAnimacao.get(m[1]!) ?? [];
      lista.push(limpar(m[2]!));
      porAnimacao.set(m[1]!, lista);
    } else {
      outras.push(limpar(linha));
    }
  }
  const linhas = [...outras];
  for (const [animacao, coisas] of porAnimacao) {
    linhas.push(`A animação ${animacao} usa o que o glTF não tem, e essa parte não sai: ${coisas.join(', ')}.`);
  }
  return linhas;
}
