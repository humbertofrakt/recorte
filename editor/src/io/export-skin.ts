/**
 * "Arquivo → Exportar por pele…" (owner A, requirement E3).
 *
 * One project, ten characters, one skeleton. The publisher does not want the
 * game to carry ten skins onto every screen, so at the end of the day the
 * project is cut into one file per character. This window is that cut, with
 * the mouse instead of the command line.
 *
 * WHAT IT SHOWS WHILE YOU CLICK
 * -----------------------------
 * Every tick re-slices the file in memory and re-writes the numbers: bones,
 * slots, drawings, animations and the size in bytes, next to the numbers of
 * the whole file. The point is that the person deciding what to cut can see
 * what the cut costs BEFORE saving anything.
 *
 * THE WORK ITSELF is `ferramentas/src/exportar/fatiar.ts`, the very same module
 * `node ferramentas/fatiar.mjs` calls. Two roads, one result.
 *
 * THE SLICED ATLAS comes out since lote 41, as ONE file: a `.bonez` with the
 * sliced `.bone`, the `.atlas.json` with only the regions that stayed, and the
 * re-packed pages. A browser cannot promise to write three files into one
 * folder — so it writes one. The plain `.bone` is still the other option.
 */

import {
  repackAtlas, sliceBoneFile, KIND_LABELS, type PageImage,
} from '../../../ferramentas/src/exportar/fatiar.js';
import type { SliceResult } from '../../../ferramentas/src/exportar/fatiar.js';
import type { PackedPage } from '../../../ferramentas/src/atlas/packer.js';
import { writeBonez } from '../../../ferramentas/src/binario/bonez.js';
import type { BonezFile, BonezManifest } from '../../../ferramentas/src/binario/bonez.js';
import type { AtlasPageData } from '../../../runtime/src/index.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import { composeExternals } from '../../../runtime/src/index.js';
// Degrau 9 (I12, F23): Exportar pele e Importar pele.
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { BONEZ_EXTENSION, browserCodec, putBytes, stem } from './save-binary.js';
import { atlasTreesOf } from './pivot-atlas.js';
import { stampPivots } from './pivot-model.js';
import type { Doc } from '../doc/document.js';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4.
import { el } from '../ui/dom.js';
import { notePickerProblem } from './picker-problem.js';

/** Extension of what this window writes. */
export const BONE_EXTENSION = '.bone';

/** What the person ticked. */
export interface SkinExportChoice {
  /** Skins to keep. `default` is always kept, ticked or not (spec 4.4). */
  readonly skins: readonly string[];
  /** Animations to keep. */
  readonly animations: readonly string[];
}

/** What came out. */
export interface SkinExportRun {
  readonly choice: SkinExportChoice;
  readonly result: SliceResult;
  readonly name: string;
  readonly size: number;
  /** Os arquivos de dentro do pacote, quando saiu um `.bonez` — lote 41. */
  readonly entries?: readonly string[];
  /** O que não coube no pacote, em português. */
  readonly warnings?: readonly string[];
}

// ---------------------------------------------------------------------------
// The cut itself
// ---------------------------------------------------------------------------

/** Skins offered by the open file, in file order. */
export function skinNames(doc: Doc): string[] {
  return (doc.file.skins ?? []).map((skin) => skin.name);
}

/** Animations offered by the open file, in file order. */
export function animationNames(doc: Doc): string[] {
  return (doc.file.animations ?? []).map((animation) => animation.name);
}

/**
 * Slices the open document. Never throws for an empty choice: a file with no
 * skin at all is still a file, and the window has to keep showing numbers.
 */
export function sliceDoc(doc: Doc, choice: SkinExportChoice): SliceResult {
  const skins = skinNames(doc);
  const animations = animationNames(doc);
  return sliceBoneFile(doc.file, {
    skins: skins.length === 0 ? undefined : choice.skins.filter((name) => skins.includes(name)),
    animations: animations.length === 0 ? undefined : choice.animations.filter((name) => animations.includes(name)),
    generator: 'Recorte editor 0.1.0',
  });
}

/** The bytes this window would write, with the editor's own writer. */
export function slicedText(result: SliceResult): string {
  return `${JSON.stringify(result.file, null, 2)}\n`;
}

/** Suggested file name: `heroi` plus the skins, so ten files never collide. */
export function suggestedName(
  doc: Doc, choice: SkinExportChoice, extension: string = BONE_EXTENSION,
): string {
  const extra = choice.skins.filter((name) => name !== 'default');
  const tail = extra.length === 0 ? '' : `-${extra.join('-')}`;
  return `${stem(doc)}${tail}${extension}`;
}

// ---------------------------------------------------------------------------
// O pacote por pele — lote 41 (Nenhum 6). Puro: sem canvas, sem Node
// ---------------------------------------------------------------------------

/** Um atlas do documento: a árvore do `.atlas.json` e os pixels das páginas. */
export interface PackageAtlasSource {
  json: Parameters<typeof repackAtlas>[0];
  pages: PageImage[];
}

/** O que vai dentro do `.bonez`, pronto para o `writeBonez`. */
export interface SkinPackage {
  manifest: BonezManifest;
  files: BonezFile[];
  /** O que o atlas não tinha, em português. */
  warnings: string[];
}

/**
 * Monta o pacote de uma pele: o `.bone` fatiado, o `.atlas.json` com **só** as
 * regiões que os anexos que sobraram citam, e as páginas reempacotadas.
 *
 * O corte do atlas é o `repackAtlas` do fatiador — o mesmo empacotador da linha
 * de comando —, então a página que sai daqui e a de `npm run fatiar` são a
 * mesma conta. Quem grava o PNG é quem chama (`encodePng`): o navegador usa o
 * canvas, o teste e a linha de comando usam o `png.ts`.
 *
 * O `.bone` de dentro aponta para o atlas de dentro, com `imagesBase` vazio:
 * as páginas moram ao lado dele no ZIP (§2.8, §2.9).
 */
export async function skinPackageFiles(
  result: SliceResult,
  base: string,
  sources: readonly PackageAtlasSource[],
  encodePng: (page: PackedPage) => Uint8Array | Promise<Uint8Array>,
): Promise<SkinPackage> {
  const encoder = new TextEncoder();
  const used = new Set(result.regions);
  const files: BonezFile[] = [];
  const atlasNames: string[] = [];
  const imageNames: string[] = [];
  const answered = new Set<string>();

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i]!;
    const pageName = `${base}${sources.length === 1 ? '' : `-${i + 1}`}`;
    const packed = repackAtlas(source.json, source.pages, used, {
      pageName, generator: 'Recorte editor 0.1.0',
    });
    for (const region of packed.atlas.regions) {
      answered.add(region.name);
      for (const alias of region.aliases ?? []) answered.add(alias);
    }
    // Atlas de onde nada ficou não entra: ele seria só uma página vazia.
    if (packed.atlas.regions.length === 0) continue;
    const atlasName = `${pageName}.atlas.json`;
    files.push({ name: atlasName, data: encoder.encode(`${JSON.stringify(packed.atlas, null, 2)}\n`) });
    atlasNames.push(atlasName);
    for (const page of packed.pages) {
      files.push({ name: page.image, data: await encodePng(page) });
      imageNames.push(page.image);
    }
  }

  const file = JSON.parse(JSON.stringify(result.file)) as SliceResult['file'];
  const assets = { ...(file.assets ?? {}) } as Record<string, unknown>;
  if (atlasNames.length > 0) assets['atlases'] = atlasNames;
  else delete assets['atlases'];
  assets['imagesBase'] = '';
  file.assets = assets as SliceResult['file']['assets'];

  const mainName = `${base}${BONE_EXTENSION}`;
  files.unshift({ name: mainName, data: encoder.encode(`${JSON.stringify(file, null, 2)}\n`) });

  const missing = [...used].filter((name) => !answered.has(name));
  const warnings = missing.length === 0 ? [] : [
    `O atlas aberto não tem ${missing.length === 1 ? 'a imagem' : 'as imagens'} ${missing.join(', ')}: `
      + 'o pacote sai sem elas.',
  ];

  const manifest: BonezManifest = {
    bonez: { version: '1.0' },
    main: mainName,
    skeletons: [mainName],
    atlases: atlasNames,
    images: imageNames,
  };
  return { manifest, files, warnings };
}

// ---------------------------------------------------------------------------
// O pacote, no navegador
// ---------------------------------------------------------------------------

/** Os pixels de uma página do atlas, lidos do que a cena está desenhando. */
function pagePixels(doc: Doc, page: AtlasPageData): PageImage | null {
  const source = doc.imageFor(page);
  if (source === null) return null;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(page.width));
  canvas.height = Math.max(1, Math.round(page.height));
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;
  ctx.drawImage(source, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { name: page.name, width: data.width, height: data.height, pixels: new Uint8Array(data.data) };
}

/** Uma página reempacotada, gravada em PNG pelo canvas do navegador. */
async function canvasPng(page: PackedPage): Promise<Uint8Array> {
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

/** Os bytes do `.bonez` de uma pele, com os avisos. */
export async function skinPackageBytes(
  doc: Doc, result: SliceResult, base: string,
): Promise<{ bytes: Uint8Array; entries: string[]; warnings: string[] }> {
  const warnings: string[] = [];
  const sources: PackageAtlasSource[] = [];
  // O atlas da pele sai carimbado pelo rig inteiro — plano pivô, lote 56.
  const stamped = stampPivots(doc.file, atlasTreesOf(doc)).atlases;
  for (const [index, atlas] of doc.atlases.entries()) {
    const pages: PageImage[] = [];
    for (const page of atlas.pages) {
      const pixels = pagePixels(doc, page);
      if (pixels === null) warnings.push(`A imagem ${page.image} não está aberta; ela fica fora do pacote.`);
      else pages.push(pixels);
    }
    sources.push({ json: stamped[index] as unknown as PackageAtlasSource['json'], pages });
  }
  const pkg = await skinPackageFiles(result, base, sources, canvasPng);
  const codec = await browserCodec(pkg.files.map((f) => f.data));
  const bytes = writeBonez({ manifest: pkg.manifest, files: pkg.files }, codec);
  return { bytes, entries: pkg.files.map((f) => f.name), warnings: [...warnings, ...pkg.warnings] };
}

// ---------------------------------------------------------------------------
// The numbers on screen
// ---------------------------------------------------------------------------

export interface CountRow {
  /** Written out in full, never abbreviated. */
  readonly label: string;
  readonly now: number;
  readonly whole: number;
}

/** The live table: what the result has, next to what the whole file has. */
export function countRows(result: SliceResult, textBytes: number, wholeBytes: number): CountRow[] {
  return [
    { label: 'Ossos', now: result.after.bones, whole: result.before.bones },
    { label: 'Slots', now: result.after.slots, whole: result.before.slots },
    { label: 'Skins', now: result.after.skins, whole: result.before.skins },
    { label: 'Desenhos', now: result.after.attachments, whole: result.before.attachments },
    { label: 'Regras', now: result.after.constraints, whole: result.before.constraints },
    { label: 'Eventos', now: result.after.events, whole: result.before.events },
    { label: 'Animações', now: result.after.animations, whole: result.before.animations },
    { label: 'Chaves', now: result.after.keys, whole: result.before.keys },
    { label: 'Tamanho em bytes', now: textBytes, whole: wholeBytes },
  ];
}

/** One line for the status bar. */
export function skinExportLine(run: SkinExportRun): string {
  const size = run.size.toLocaleString('pt-BR');
  const { after } = run.result;
  return `Salvo em ${run.name}. ${size} bytes, ${after.bones} ossos, ${after.slots} slots, `
    + `${after.skins} skins, ${after.animations} animações. ${run.result.removed.length} item(ns) saíram.`;
}

/** The list the message window shows: everything that left, one per line. */
export function skinExportReport(run: SkinExportRun): string[] {
  const lines = run.result.removed.map((item) => `${KIND_LABELS[item.kind]} ${item.name} — ${item.reason}`);
  if (run.entries !== undefined) lines.unshift(`No pacote: ${run.entries.join(', ')}`);
  return [...lines, ...(run.warnings ?? [])];
}

// ---------------------------------------------------------------------------
// The window
// ---------------------------------------------------------------------------
//
// No new stylesheet: the rows borrow the "Propriedades" panel classes
// (`prop-linha`, `prop-rotulo`, `prop-campo`) and the frame borrows the message
// window's (`dialog-veil`, `dialog-box`), exactly like "Exportar imagem…".

/** One tick box with its words beside it, and the words are a label. */
function tickRow(name: string, checked: boolean, id: string): {
  row: HTMLElement; box: HTMLInputElement;
} {
  const row = el('div', 'prop-linha');
  const words = el('label', 'prop-rotulo', name);
  words.htmlFor = id;
  const box = el('input', 'prop-marca') as HTMLInputElement;
  box.type = 'checkbox';
  box.checked = checked;
  box.id = id;
  row.append(words, box);
  return { row, box };
}

/** The bytes of a string, counted the way a file counts them. */
export function textBytes(text: string): number {
  return new TextEncoder().encode(text).length;
}

/**
 * Opens "Exportar por pele…". Resolves with `null` when the window was closed
 * without exporting.
 *
 * Nothing is written until the button is pressed, and the slicing that feeds
 * the numbers happens in memory on a copy, so a window opened by accident
 * costs nothing and changes nothing.
 */
export function exportSkinWindow(doc: Doc, host?: HTMLElement): Promise<SkinExportRun | null> {
  const parent = host ?? document.body;
  const skins = skinNames(doc);
  const animations = animationNames(doc);

  const box = el('div', 'dialog-box');
  // As classes de `prop-*` leem variáveis que só existem dentro de `.painel`.
  // Fora dele o `grid-template-columns` fica inválido e o rótulo cai POR CIMA
  // do campo. As variáveis vão aqui, com os mesmos valores de `panels.css`.
  for (const [name, value] of [
    ['--painel-rotulo', '70%'],
    ['--painel-linha', '#c3ccd8'],
    ['--painel-campo', '#f4f6f9'],
    ['--painel-texto', '#10151c'],
    ['--painel-texto-fraco', '#45505e'],
    ['--painel-realce', '#1a4fd8'],
  ]) box.style.setProperty(name, value);
  box.style.overflowY = 'auto';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Exportar por skin');

  const veil = el('div', 'dialog-veil');
  veil.append(box);

  box.append(el('h2', 'dialog-title', 'Exportar por skin'));
  box.append(el('p', 'dialog-lead',
    'Marque as skins e as animações que este arquivo tem de levar. '
    + 'O que ficar sem uso sai junto, e a lista do que saiu aparece no fim. '
    + 'A pose e a animação do que sobrar ficam iguais às do arquivo inteiro.'));

  // --- the two lists of tick boxes -----------------------------------------
  const boxesBySkin = new Map<string, HTMLInputElement>();
  const boxesByAnimation = new Map<string, HTMLInputElement>();

  box.append(el('h3', 'dialog-lead', 'Skins'));
  if (skins.length === 0) {
    box.append(el('p', 'dialog-lead', 'Este arquivo não tem skin nenhuma.'));
  }
  for (const name of skins) {
    const fixed = name === 'default';
    const { row, box: tick } = tickRow(
      fixed ? 'default  (a skin padrão vai sempre)' : name, true, `pele-${name}`,
    );
    tick.disabled = fixed;
    boxesBySkin.set(name, tick);
    box.append(row);
  }

  box.append(el('h3', 'dialog-lead', 'Animações'));
  if (animations.length === 0) {
    box.append(el('p', 'dialog-lead', 'Este arquivo não tem animação nenhuma.'));
  }
  for (const name of animations) {
    const { row, box: tick } = tickRow(name, true, `animacao-${name}`);
    boxesByAnimation.set(name, tick);
    box.append(row);
  }

  // --- the live numbers -----------------------------------------------------
  box.append(el('h3', 'dialog-lead', 'O que vai sair'));
  const headings = el('div', 'prop-linha');
  headings.append(el('span', 'prop-rotulo', 'o quê'), el('span', undefined, 'agora   /   arquivo inteiro'));
  box.append(headings);

  const valueNodes = new Map<string, HTMLElement>();
  for (const label of [
    'Ossos', 'Slots', 'Skins', 'Desenhos', 'Regras', 'Eventos', 'Animações', 'Chaves', 'Tamanho em bytes',
  ]) {
    const row = el('div', 'prop-linha');
    const value = el('span', undefined, '—');
    row.append(el('span', 'prop-rotulo', label), value);
    valueNodes.set(label, value);
    box.append(row);
  }

  // Lote 41: o pacote com o atlas. Marcado quando há atlas aberto; sem atlas
  // não há o que reempacotar, e a caixa fica cinza dizendo por quê.
  const hasAtlas = doc.atlases.length > 0;
  const { row: packageRow, box: packageTick } = tickRow(
    'Pacote .bonez com o atlas (um arquivo só)', hasAtlas, 'pele-pacote',
  );
  packageTick.disabled = !hasAtlas;
  packageRow.title = hasAtlas
    ? 'Sai um .bonez com o .bone fatiado, o atlas só com as regiões usadas e as páginas reempacotadas'
    : 'Este arquivo não tem atlas aberto: sai só o .bone';
  box.append(packageRow);

  const leaving = el('p', 'dialog-lead', '');
  const atlasNote = el('p', 'dialog-lead', '');
  box.append(leaving, atlasNote);

  const go = el('button', 'dialog-close', 'Exportar') as HTMLButtonElement;
  go.type = 'button';
  const cancel = el('button', 'dialog-close', 'Fechar sem exportar') as HTMLButtonElement;
  cancel.type = 'button';
  const buttons = el('div', 'dialog-buttons');
  buttons.append(go, cancel);
  box.append(buttons);

  const chosen = (): SkinExportChoice => ({
    skins: skins.filter((name) => name === 'default' || (boxesBySkin.get(name)?.checked ?? false)),
    animations: animations.filter((name) => boxesByAnimation.get(name)?.checked ?? false),
  });

  let latest: SliceResult | null = null;
  let latestText = '';

  const refresh = (): void => {
    let result: SliceResult;
    try {
      result = sliceDoc(doc, chosen());
    } catch (error) {
      leaving.textContent = error instanceof Error ? error.message : String(error);
      go.disabled = true;
      return;
    }
    go.disabled = false;
    latest = result;
    latestText = slicedText(result);
    const whole = `${JSON.stringify(doc.file, null, 2)}\n`;
    for (const row of countRows(result, textBytes(latestText), textBytes(whole))) {
      const node = valueNodes.get(row.label);
      if (node === undefined) continue;
      node.textContent = `${row.now.toLocaleString('pt-BR')}   /   ${row.whole.toLocaleString('pt-BR')}`;
    }
    leaving.textContent = result.removed.length === 0
      ? 'Nada sai: este arquivo já é só o que foi marcado.'
      : `Saem ${result.removed.length} item(ns). A lista inteira aparece depois de exportar.`;
    atlasNote.textContent = packageTick.checked
      ? `Sai um .bonez só: o .bone, o atlas com as ${result.regions.length} região(ões) usadas e as páginas reempacotadas.`
      : `O arquivo vai pedir ${result.regions.length} região(ões) do atlas. Sai só o .bone; `
        + 'para levar o atlas junto, marque o pacote .bonez.';
  };

  for (const tick of [...boxesBySkin.values(), ...boxesByAnimation.values(), packageTick]) {
    tick.addEventListener('change', refresh);
  }
  refresh();

  return new Promise<SkinExportRun | null>((resolve) => {
    let open = true;
    const finish = (value: SkinExportRun | null): void => {
      if (!open) return;
      open = false;
      document.removeEventListener('keydown', onKey, true);
      veil.remove();
      resolve(value);
    };

    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      finish(null);
    }

    cancel.addEventListener('click', () => finish(null));
    veil.addEventListener('pointerdown', (event) => {
      if (event.target === veil) finish(null);
    });
    document.addEventListener('keydown', onKey, true);

    go.addEventListener('click', () => {
      if (latest === null) return;
      const choice = chosen();
      const result = latest;
      if (packageTick.checked) {
        const suggested = suggestedName(doc, choice, BONEZ_EXTENSION);
        go.disabled = true;
        atlasNote.textContent = 'Reempacotando o atlas…';
        void skinPackageBytes(doc, result, suggested.slice(0, -BONEZ_EXTENSION.length))
          .then(async (pkg) => {
            const name = await putBytes(
              suggested, pkg.bytes, 'Pacote Recorte', BONEZ_EXTENSION, 'application/vnd.bone+zip',
            );
            go.disabled = false;
            if (name === null) { refresh(); return; } // The user closed the save dialog.
            finish({
              choice, result, name, size: pkg.bytes.length, entries: pkg.entries, warnings: pkg.warnings,
            });
          })
          .catch((error: unknown) => {
            go.disabled = false;
            atlasNote.textContent = error instanceof Error ? error.message : String(error);
          });
        return;
      }
      void putBoneFile(suggestedName(doc, choice), latestText).then((name) => {
        if (name === null) return; // The user closed the save dialog.
        finish({
          choice, result, name, size: textBytes(latestText),
        });
      });
    });

    parent.append(veil);
    go.focus();
  });
}

// ---------------------------------------------------------------------------
// Handing the bytes to the user
// ---------------------------------------------------------------------------

interface FileHandle {
  readonly name: string;
  createWritable(): Promise<{ write(data: Blob): Promise<void>; close(): Promise<void> }>;
}
interface PickerWindow { showSaveFilePicker?(options?: unknown): Promise<FileHandle> }

/** Asks where to put the file and writes it. `null` when the user backed out. */
export async function putBoneFile(suggested: string, text: string): Promise<string | null> {
  const blob = new Blob([text], { type: 'application/json' });
  const w = globalThis as unknown as PickerWindow;

  if (typeof w.showSaveFilePicker === 'function') {
    let handle: FileHandle;
    try {
      handle = await w.showSaveFilePicker({
        suggestedName: suggested,
        types: [{ description: 'Esqueleto Recorte', accept: { 'application/json': [BONE_EXTENSION] } }],
      });
    } catch (error) {
      notePickerProblem(error, 'Exportar a skin');
      return null;
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

// ---------------------------------------------------------------------------
// Exportar pele… / Importar pele… — degrau 9 (18/09/2026), I12, F23, P4
// ---------------------------------------------------------------------------

/*
 * 🗣️ *"A pele é do corpo. A pele de fora (Dota 2) é a mesma pele salva em
 * arquivo."* — o Humberto, Q30/Q40.
 *
 * São duas coisas diferentes com nomes parecidos, e vale escrever a diferença
 * aqui, porque quem confundir grava o arquivo errado:
 *
 * | O quê | O que é | Onde |
 * |:---|:---|:---|
 * | **Exportar por pele…** | o corpo inteiro FATIADO: só o que aquela pele usa, para o jogo levar um personagem e não dez | o resto deste arquivo |
 * | **Exportar pele…** | só a pele, num `.bone` com `rig`, para entrar em OUTRO corpo | esta seção |
 *
 * O arquivo da pele leva, além da pele (spec 2.8, §5.2 do `ARQUITETO 3`): os
 * ossos `skinRequired` que ela liga (o rabo do lobisomem), os slots que ela
 * veste e que o hospedeiro não tem, as regras `skinRequired`, e o **`rig`**
 * (4.8) — o contrato explícito do que ela exige de quem a usar. O `rig` é
 * gerado do conteúdo: os slots que a pele preenche e os ossos em que ela
 * pendura os seus.
 */

/** O que sai num arquivo de pele, para a janela poder dizer antes de gravar. */
export interface SkinFileReport {
  /** Os ossos que a pele leva junto. */
  bones: string[];
  /** Os slots que ela leva junto (os que só ela veste). */
  slots: string[];
  /** As regras que ela leva junto. */
  constraints: string[];
  /** O que o `rig` exige do hospedeiro: ossos. */
  needsBones: string[];
  /** O que o `rig` exige do hospedeiro: slots. */
  needsSlots: string[];
}

/**
 * O `.bone` de uma pele só, pronto para `assets.skins` de outro corpo.
 *
 * Não mexe no documento. O `rig` sai do conteúdo, como a spec pede de um
 * gravador (4.8): os slots que a pele veste e existem no hospedeiro, e os
 * ossos de que os ossos dela penduram.
 */
export function buildSkinFile(
  file: BoneFile, skinName: string,
): { file: BoneFile; report: SkinFileReport } | null {
  const skin = (file.skins ?? []).find((s) => s.name === skinName);
  if (skin === undefined) return null;

  const ossosDela = new Set(skin.bones ?? []);
  const regrasDela = new Set(skin.constraints ?? []);
  const bones = (file.bones ?? []).filter((bone) => ossosDela.has(bone.name));
  const constraints = (file.constraints ?? []).filter((rule) => regrasDela.has(rule.name));

  // Os slots que a pele veste: os que moram num osso DELA vão junto (o slot do
  // rabo não existe no hospedeiro); os outros são do hospedeiro, e entram no
  // `rig` como exigência.
  const vestidos = Object.keys(skin.attachments ?? {})
    .filter((slot) => Object.keys(skin.attachments?.[slot] ?? {}).length > 0);
  const slots = (file.slots ?? []).filter(
    (slot) => vestidos.includes(slot.name) && ossosDela.has(slot.bone),
  );
  const levados = new Set(slots.map((slot) => slot.name));
  const needsSlots = vestidos.filter((slot) => !levados.has(slot));

  // Os ossos de fora em que os ossos dela penduram, e os ossos dos slots que
  // ficam no hospedeiro: é o que ela exige que exista lá.
  const needsBones: string[] = [];
  const pedir = (name: string | undefined): void => {
    if (name === undefined || ossosDela.has(name) || needsBones.includes(name)) return;
    needsBones.push(name);
  };
  for (const bone of bones) pedir(bone.parent);
  for (const slot of needsSlots) {
    pedir((file.slots ?? []).find((s) => s.name === slot)?.bone);
  }

  // Rodada 44, lote 7 (doc 75): os PESOS. O `binding.bones` de uma malha com
  // peso conta na lista de ossos do ARQUIVO da pele (apêndice C, regra 8), e
  // saía com os números do corpo — num arquivo que só tem o `root`. Na volta
  // o leitor mandava cada osso para o índice 0, e o rosto do herói (uma malha
  // presa a `head` e `neck`) ia parar na raiz: "sem rosto, e Nenhum aviso".
  // Agora os ossos que os pesos usam entram no arquivo pelo NOME (o leitor os
  // casa com os do corpo e não os cria: não são `skinRequired`), e os números
  // são os dessa lista.
  const raiz = rootNameFor(bones);
  const listaDoArquivo: string[] = [raiz, ...bones.map((b) => b.name)];
  const referencias: Array<{ name: string; parent: string }> = [];
  const nomesDoCorpo = (file.bones ?? []).map((b) => b.name);
  const peleSaida = JSON.parse(JSON.stringify(skin)) as { attachments?: Record<string, Record<string, unknown>> };
  for (const porSlot of Object.values(peleSaida.attachments ?? {})) {
    for (const def of Object.values(porSlot ?? {})) {
      const binding = (def as { binding?: { bones?: unknown } } | null)?.binding;
      if (binding === undefined || !Array.isArray(binding.bones)) continue;
      binding.bones = (binding.bones as unknown[]).map((indice) => {
        if (typeof indice !== 'number') return indice;
        const nome = nomesDoCorpo[indice];
        if (nome === undefined) return indice;
        let k = listaDoArquivo.indexOf(nome);
        if (k < 0) {
          listaDoArquivo.push(nome);
          referencias.push({ name: nome, parent: raiz });
          pedir(nome);
          k = listaDoArquivo.length - 1;
        }
        return k;
      });
    }
  }

  const saida = {
    // O cabeçalho vem do corpo de origem, e não inventado aqui: `minVersion` é
    // obrigatório (§2.1), e um arquivo de pele sem ele não carrega — o tipo de
    // defeito que só aparece na máquina de quem recebeu.
    bone: {
      ...JSON.parse(JSON.stringify(file.bone ?? { version: '1.0', minVersion: '1.0' })),
      generator: 'Recorte',
    },
    skeleton: { name: skinName },
    ...(file.assets === undefined ? {} : { assets: JSON.parse(JSON.stringify(file.assets)) }),
    rig: {
      name: (file as { rig?: { name?: string } }).rig?.name ?? `${skinName}-v1`,
      ...(needsBones.length === 0 ? {} : { bones: needsBones }),
      ...(needsSlots.length === 0 ? {} : { slots: needsSlots }),
    },
    // M17 (rodada 3, 04/10/2026): `bones` é obrigatório (2.2) e começa pelo
    // osso raiz do arquivo — o que o leitor de `assets.skins` ignora calado
    // (2.8), como no `rigs/lobisomem-rabo.bone`. Sem ele a pele sem osso saía
    // sem `bones`, e a Importar a recusava: "/bones: expected an array".
    bones: [{ name: raiz }, ...JSON.parse(JSON.stringify(bones)), ...referencias],
    ...(slots.length === 0 ? {} : { slots: JSON.parse(JSON.stringify(slots)) }),
    ...(constraints.length === 0 ? {} : { constraints: JSON.parse(JSON.stringify(constraints)) }),
    skins: [peleSaida],
  } as unknown as BoneFile;

  return {
    file: saida,
    report: {
      bones: bones.map((b) => b.name),
      slots: slots.map((s) => s.name),
      constraints: constraints.map((c) => c.name),
      needsBones,
      needsSlots,
    },
  };
}

/** O nome do osso raiz do arquivo de pele: `root`, ou um que os ossos dela não usem. */
function rootNameFor(bones: ReadonlyArray<{ name: string }>): string {
  const usados = new Set(bones.map((b) => b.name));
  if (!usados.has('root')) return 'root';
  for (let n = 2; ; n++) if (!usados.has(`root${n}`)) return `root${n}`;
}

/**
 * Quantas imagens da pele são **soltas** — rodada 44, lote 5: as da pasta que
 * ainda não entraram num atlas salvo. O arquivo da pele cita o atlas do corpo,
 * e elas não vão junto: quem a importa em outro projeto não as vê.
 */
export function looseImagesIn(skinFile: BoneFile, loose: readonly string[]): number {
  const soltas = new Set(loose);
  const usadas = new Set<string>();
  for (const skin of skinFile.skins ?? []) {
    for (const porSlot of Object.values(skin.attachments ?? {})) {
      for (const [nome, def] of Object.entries(porSlot ?? {})) {
        const d = def as { type?: string; path?: string } | null;
        if (d === null || typeof d !== 'object') continue;
        if (d.type !== undefined && d.type !== 'region' && d.type !== 'mesh') continue;
        const imagem = d.path ?? nome;
        if (soltas.has(imagem)) usadas.add(imagem);
      }
    }
  }
  return usadas.size;
}

/** A frase do rodapé depois de gravar a pele. */
export function skinFileNotice(name: string, report: SkinFileReport, soltas = 0): string {
  const partes: string[] = [];
  if (report.bones.length > 0) {
    partes.push(report.bones.length === 1 ? '1 osso' : `${report.bones.length} ossos`);
  }
  if (report.slots.length > 0) {
    partes.push(report.slots.length === 1 ? '1 slot' : `${report.slots.length} slots`);
  }
  if (report.constraints.length > 0) {
    partes.push(report.constraints.length === 1 ? '1 regra' : `${report.constraints.length} regras`);
  }
  const leva = partes.length === 0 ? 'só os desenhos' : partes.join(', ');
  // Rodada 44, lote 5: "exige 6 nomes de quem a usar" não se lia. Diz quais.
  const pedidos: string[] = [];
  const nb = report.needsBones.length;
  const ns = report.needsSlots.length;
  if (nb > 0) pedidos.push(nb === 1 ? '1 osso' : `${nb} ossos`);
  if (ns > 0) pedidos.push(ns === 1 ? '1 slot' : `${ns} slots`);
  const contrato = pedidos.length === 0 ? ''
    : `; ela exige de quem a usar ${pedidos.join(' e ')} com estes mesmos nomes`;
  const fora = soltas === 0 ? ''
    : `. ${soltas === 1 ? '1 imagem solta não vai' : `${soltas} imagens soltas não vão`} junto: `
      + `salve o projeto antes, para ${soltas === 1 ? 'ela entrar' : 'elas entrarem'} no atlas`;
  return `Skin "${name}" gravada com ${leva}${contrato}${fora}`;
}

/**
 * **Importar pele…**: põe o uri do arquivo em `assets.skins` (2.8).
 *
 * A pele de fora **não é copiada** para dentro do corpo, e é de propósito: ela
 * continua sendo um arquivo, que se pode trocar sem reabrir o personagem — é o
 * modelo do Dota 2, e é o que o runtime já monta. O nome dela aparece na lista
 * de Feitas como as outras (F23), e vem com os ossos que ela traz.
 */
export class ImportSkinFile implements Command {
  readonly label = 'Importar skin';
  readonly kind: ChangeKind = 'structure';
  private had = false;
  private before: string[] = [];

  constructor(private readonly uri: string) {}

  apply(doc: EditorDoc): void {
    const file = doc.file as unknown as { assets?: { skins?: string[] } };
    file.assets ??= {};
    this.had = Array.isArray(file.assets.skins);
    this.before = this.had ? [...file.assets.skins!] : [];
    if (this.before.includes(this.uri)) return;
    file.assets.skins = [...this.before, this.uri];
  }

  revert(doc: EditorDoc): void {
    const file = doc.file as unknown as { assets?: { skins?: string[] } };
    if (file.assets === undefined) return;
    if (this.had) file.assets.skins = [...this.before];
    else delete file.assets.skins;
  }
}

/**
 * **Importar pele…, copiando** — M17, rodada 3 (04/10/2026).
 *
 * A forma do defeito: *"o que eu gravo, eu não consigo ler"*. A Importar só
 * escrevia o uri em `assets.skins` — e o editor monta o corpo sem ler arquivo
 * de fora nenhum: a pele não voltava, e o rodapé dizia "agora na lista de
 * Feitas". Agora a pele **entra no corpo**, como o *Import Data* do Spine:
 * a pele, os ossos `skinRequired` e os slots que ela traz, e as regras dela.
 *
 * A conta é a do runtime (`composeExternals`, spec 2.8), e não uma segunda:
 * o que entra, em que ordem, o osso raiz do arquivo que cai calado, o nome
 * que já existe aqui (o daqui vale), e os índices de `binding.bones`
 * traduzidos pelo nome. Um passo de desfazer; o `revert` devolve as quatro
 * listas como eram.
 */
export class ImportSkinCopy implements Command {
  readonly label = 'Importar skin';
  readonly kind: ChangeKind = 'structure';
  /** Os avisos da composição (2.8), com o código na frente, em português. */
  warnings: string[] = [];
  /** O que entrou, para a frase do rodapé. */
  readonly brought = { skins: [] as string[], bones: [] as string[], slots: [] as string[], constraints: [] as string[] };
  private before: Partial<Record<'bones' | 'slots' | 'constraints' | 'skins', unknown>> | null = null;
  private after: Record<string, unknown> | null = null;

  constructor(private readonly uri: string, private readonly external: BoneFile) {}

  apply(doc: EditorDoc): void {
    const file = doc.file as unknown as Record<string, unknown>;
    if (this.after === null) {
      this.before = {};
      for (const key of LISTS) if (key in file) this.before[key] = JSON.parse(JSON.stringify(file[key]));
      // Só ESTE arquivo entra: as listas de fora que o corpo já cita não são
      // copiadas junto (elas continuam sendo referências).
      const host = JSON.parse(JSON.stringify(file)) as Record<string, unknown>;
      const assets = { ...((host['assets'] as Record<string, unknown> | undefined) ?? {}) };
      assets['skins'] = [this.uri];
      delete assets['animations'];
      host['assets'] = assets;
      const external = JSON.parse(JSON.stringify(this.external)) as unknown;
      const composed = composeExternals(host, '', () => external);
      this.warnings = [...composed.warnings];
      const tree = composed.tree as Record<string, unknown>;
      this.after = {};
      for (const key of LISTS) if (key in tree) this.after[key] = tree[key];
      const nomes = (list: unknown): string[] => (Array.isArray(list) ? list : [])
        .map((x) => (x as { name?: unknown }).name).filter((n): n is string => typeof n === 'string');
      for (const key of LISTS) {
        const antes = new Set(nomes(this.before[key]));
        this.brought[key] = nomes(this.after[key]).filter((n) => !antes.has(n));
      }
    }
    for (const key of LISTS) {
      if (key in this.after) file[key] = JSON.parse(JSON.stringify(this.after[key]));
    }
  }

  revert(doc: EditorDoc): void {
    const file = doc.file as unknown as Record<string, unknown>;
    if (this.before === null) return;
    for (const key of LISTS) {
      if (key in this.before) file[key] = JSON.parse(JSON.stringify(this.before[key]));
      else delete file[key];
    }
  }
}

const LISTS = ['bones', 'slots', 'constraints', 'skins'] as const;

/**
 * A frase do rodapé depois de copiar a pele (M17). Diz o que entrou, o que
 * ficou de fora e por quê, e o que o arquivo exige e este corpo não tem.
 */
export function importSkinCopyNotice(
  uri: string, command: ImportSkinCopy, unmet: readonly string[],
): string {
  const { skins, bones, slots, constraints } = command.brought;
  const conta = (n: number, um: string, varios: string): string => (n === 1 ? `1 ${um}` : `${n} ${varios}`);
  const peles = skins.length === 1 ? `a skin "${skins[0]!}"` : `${skins.length} skins (${skins.join(', ')})`;
  const junto = [
    bones.length > 0 ? conta(bones.length, 'osso', 'ossos') : '',
    slots.length > 0 ? conta(slots.length, 'slot', 'slots') : '',
    constraints.length > 0 ? conta(constraints.length, 'regra', 'regras') : '',
  ].filter((t) => t !== '');
  const com = junto.length === 0 ? '' : `, com ${junto.join(', ')}`;
  // Rodada 44, lote 6: ela entra vestida, no topo de Ativas.
  const partes = [`${uri}: ${peles} entrou nesta base${com}, e está vestida, no topo de Ativas`];
  if (unmet.length > 0) partes.push(`esta base não tem ${unmet.join(', ')}: o que depender disso não aparece`);
  // Rodada 44, lote 7 (doc 75): o aviso dos PESOS não se engole — era ele que
  // dizia que o rosto ia para a raiz, e a barra dizia "Nenhum aviso". O osso
  // de referência dos pesos não é `skinRequired` de propósito: o leitor o casa
  // pelo nome e o ignora como osso novo, e isso não é aviso para quem importa.
  const outros = command.warnings
    .filter((w) => !w.startsWith('RIG_UNMET') || w.includes('do binding de'))
    .filter((w) => !w.startsWith('EXTERNAL_BONE_NOT_SKIN'))
    .map((w) => w.replace(/^[A-Z_]+: /, '').replace(/ \(2\.8\)$/, ''));
  if (outros.length > 0) partes.push(outros.join('; '));
  return partes.join('. ');
}

/** Os uris de pele de fora que este corpo já cita. */
export function importedSkinUris(file: BoneFile): string[] {
  return [...((file as unknown as { assets?: { skins?: string[] } }).assets?.skins ?? [])];
}

/**
 * O que a pele de fora exige e este corpo não tem (4.8), para o aviso.
 *
 * Quem confere é o leitor do hospedeiro, e ele avisa `RIG_UNMET`; o editor diz
 * a mesma coisa **antes** de gravar, em português, porque é aqui que ainda dá
 * para escolher outro corpo (regra 21).
 */
export function unmetRig(host: BoneFile, external: BoneFile): string[] {
  const rig = (external as unknown as { rig?: { bones?: string[]; slots?: string[] } }).rig;
  if (rig === undefined) return [];
  const ossos = new Set((host.bones ?? []).map((b) => b.name));
  const slots = new Set((host.slots ?? []).map((s) => s.name));
  return [
    ...(rig.bones ?? []).filter((name) => !ossos.has(name)).map((name) => `osso "${name}"`),
    ...(rig.slots ?? []).filter((name) => !slots.has(name)).map((name) => `slot "${name}"`),
  ];
}

/** A frase do rodapé ao importar. Diz o que falta, quando falta. */
export function importSkinNotice(uri: string, names: readonly string[], unmet: readonly string[]): string {
  const peles = names.length === 0 ? 'nenhuma skin'
    : names.length === 1 ? `a skin "${names[0]!}"` : `${names.length} skins`;
  if (unmet.length === 0) return `${uri}: ${peles}, agora na lista de Feitas`;
  return `${uri}: ${peles}. Esta base não tem ${unmet.join(', ')} — a skin entra assim mesmo, `
    + 'e o que depender desses nomes fica de fora';
}
