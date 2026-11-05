/**
 * Opening and saving (owner A).
 *
 * Saving is `JSON.stringify` of the document, because the document is the file.
 * Before the bytes go out we load them back with the runtime loader: if the
 * result would warn a reader, the user is told in plain words and decides.
 *
 * Two paths, chosen at run time:
 *   - File System Access API, when the browser has it. Saving writes back to
 *     the very file the user opened, with no download folder in the middle.
 *   - `<input type="file">` and a download link everywhere else.
 */

import { notePickerProblem, noteSaveRefused } from './picker-problem.js';
import {
  loadAtlas, loadSkeletonData, loadSkeletonFileAsync, nestedAttachments, parseBoneText,
} from '../../../runtime/src/index.js';
import type { AtlasData, BoneFile, SkeletonData } from '../../../runtime/src/index.js';
import { atlasPageBlobs } from './import-images.js';
import { atlasFilesForDisk } from './pivot-atlas.js';
import type { Doc } from '../doc/document.js';
import { Projeto } from '../doc/projeto.js';
import { projectFilesToSave } from './project-open.js';
import { recentHandles, rememberRecent } from './recent.js';
import { pruneFolderPivots } from './folder-atlas.js';
import { buildFolderPack, descend, folderSaveRoute } from './folder-save.js';
import { entityFileText, rememberEntityFile } from '../doc/entity-files.js';
import type { FolderPack } from './folder-save.js';
import {
  companionFiles, foldersOfBone, isProvisionalAtlas, projectFolder, rememberFolderBone, rememberedFolders, rootFileNames,
} from './project-folder.js';
import { nomeParaSalvar, salvarDireto } from './pedir-pasta.js';

/** Extension of a skeleton file. */
export const BONE_EXTENSION = '.bone';
/** Extension of an atlas file. */
export const ATLAS_EXTENSION = '.atlas.json';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];

/**
 * The three encodings "Abrir" takes (spec 1.2). A `.boneb` and a `.bonez` are
 * read by their bytes, not by the name, so a renamed file still opens.
 */
const SKELETON_EXTENSIONS = ['.bone', '.boneb', '.bonez'];

// ---------------------------------------------------------------------------
// The bits of the File System Access API we use, declared here so the build
// does not depend on which DOM library version TypeScript ships.
// ---------------------------------------------------------------------------

interface FileHandle {
  readonly name: string;
  getFile(): Promise<File>;
  createWritable(): Promise<{ write(data: string | Blob): Promise<void>; close(): Promise<void> }>;
  /**
   * Permissão guardada de uma sessão anterior — só existe nos navegadores com
   * a API de arquivos. O `Abrir recente` pergunta de novo, e perguntar exige
   * um clique da pessoa: o do próprio item do menu.
   */
  queryPermission?(options?: { mode?: string }): Promise<string>;
  requestPermission?(options?: { mode?: string }): Promise<string>;
}

/** The folder a file sits in, when the browser lets us ask for it. */
interface DirectoryHandle {
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileHandle>;
}

interface PickerWindow {
  showOpenFilePicker?(options?: unknown): Promise<FileHandle[]>;
  showSaveFilePicker?(options?: unknown): Promise<FileHandle>;
}

function picker(): PickerWindow {
  return globalThis as unknown as PickerWindow;
}

/** `true` when the browser can write back to the file the user opened. */
export function hasFileSystemAccess(): boolean {
  const w = picker();
  return typeof w.showOpenFilePicker === 'function' && typeof w.showSaveFilePicker === 'function';
}

/** Handle of the open file, so "Salvar" writes back to it. One document at a time. */
let openHandle: FileHandle | null = null;

/** Forgets the open file, so the next save asks where to put it. */
export function forgetHandle(): void {
  openHandle = null;
}

/** `true` quando o Salvar já sabe em que arquivo gravar — rodada 7. */
export function hasOpenHandle(): boolean {
  return openHandle !== null;
}

// ---------------------------------------------------------------------------
// Small file helpers
// ---------------------------------------------------------------------------

function lower(name: string): string {
  return name.toLowerCase();
}

function isBoneFile(name: string): boolean {
  return lower(name).endsWith(BONE_EXTENSION);
}

/** `.bone`, `.boneb` or `.bonez`: any of the three encodings of spec 1.2. */
export function isSkeletonFile(name: string): boolean {
  return SKELETON_EXTENSIONS.some((ext) => lower(name).endsWith(ext));
}

/** `.boneb` or `.bonez`: the two that arrive as bytes, not as text. */
function isPackedFile(name: string): boolean {
  return lower(name).endsWith('.boneb') || lower(name).endsWith('.bonez');
}

function isAtlasFile(name: string): boolean {
  return lower(name).endsWith(ATLAS_EXTENSION);
}

function isImageFile(name: string): boolean {
  return IMAGE_EXTENSIONS.some((ext) => lower(name).endsWith(ext));
}

/** Last path segment, so `images/heroi.png` matches the file `heroi.png`. */
function baseName(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1];
}

// ---------------------------------------------------------------------------
// Opening
// ---------------------------------------------------------------------------

export interface OpenedDocument {
  file: BoneFile;
  /** Name of the file that was opened, for the title bar. */
  path: string;
  atlases: AtlasData[];
  /** Page image, keyed by the `image` written in the atlas. */
  images: Map<string, CanvasImageSource>;
  /**
   * The nested skeletons of spec 7.11, keyed by the `uri` the attachment
   * writes. Empty when the file has none, or when none of them was found.
   */
  skeletons: Map<string, SkeletonData>;
  /** Things the user should know: missing atlas, missing image, load warnings. */
  warnings: string[];
}

/**
 * The children a package already resolved, taken back out of the loaded data
 * and keyed by `uri` so the editor's own loader can find them again.
 *
 * The document is re-read from the JSON tree every time a command changes it,
 * and that second reading has no ZIP in its hands — so the children have to
 * travel next to the file, not inside the first result.
 */
function childrenOf(data: SkeletonData): Map<string, SkeletonData> {
  const children = new Map<string, SkeletonData>();
  for (const attachment of nestedAttachments(data)) {
    if (attachment.child === null) continue;
    children.set(attachment.resolvedUri, attachment.child);
  }
  return children;
}

/**
 * Asks the user for files and reads them. The user may pick the `.bone`, its
 * `.atlas.json` and the images all at once; whatever is missing is reported.
 * Returns `null` when the user cancels.
 */
export async function openDocument(): Promise<OpenedDocument | null> {
  const files = await pickFilesToOpen();
  if (files === null || files.length === 0) return null;
  return readOpenedFiles(files);
}

/**
 * `claim: false` — escolher um `.bone` **sem** tomar o lugar do arquivo aberto
 * (degrau 10, E17). O "Abrir outro corpo…" traz um arquivo PARA DENTRO do
 * projeto: o `Ctrl+S` continua gravando o que já estava aberto, e não o
 * recém-chegado.
 */
async function pickFilesToOpen(options: { claim?: boolean } = {}): Promise<File[] | null> {
  const claim = options.claim !== false;
  const w = picker();
  if (typeof w.showOpenFilePicker === 'function') {
    let handles: FileHandle[];
    try {
      handles = await w.showOpenFilePicker({
        multiple: true,
        types: [{
          description: 'Esqueleto Recorte e imagens',
          accept: {
            'application/json': ['.bone', '.json'],
            'application/octet-stream': ['.boneb'],
            'application/vnd.bone+zip': ['.bonez'],
            'image/*': IMAGE_EXTENSIONS,
          },
        }],
      });
    } catch {
      return null; // The user closed the dialog.
    }
    // Only a `.bone` is written back in place; a package is re-saved through
    // "Salvar como pacote", so it never claims the handle.
    const boneHandle = handles.find((h) => isBoneFile(h.name));
    if (claim) openHandle = boneHandle ?? null;
    // Arquivo → Abrir recente, lote 33. Guarda o esqueleto E as imagens que
    // vieram junto: reabrir o personagem sem os desenhos seria pior do que
    // não reabrir.
    const doEsqueleto = handles.find((h) => isSkeletonFile(h.name));
    if (claim && doEsqueleto !== undefined) void rememberRecent(doEsqueleto.name, handles);
    const files = await Promise.all(handles.map((h) => h.getFile()));
    // J1 (29/09/2026): só o `.bone`, sem o atlas? A pasta dele pode estar
    // entre as lembradas — o atlas e as páginas vêm de lá, como no Spriter.
    companionFolder = null;
    if (claim && boneHandle !== undefined && !handles.some((h) => isAtlasFile(h.name))) {
      const achado = await companionFiles(boneHandle, await rememberedFolders());
      if (achado !== null && achado.files !== null) {
        const nomes = new Set(files.map((f) => f.name));
        files.push(...achado.files.filter((f) => !nomes.has(f.name)));
      } else if (achado !== null) {
        companionFolder = achado.folder.name;
      }
    }
    return files;
  }
  if (claim) openHandle = null;
  return pickWithInput();
}

/** J1: a pasta do `.bone` achada entre as lembradas, mas sem permissão — para o aviso dizer o nome. */
let companionFolder: string | null = null;

/**
 * O aviso de quando o `.bone` chega sem as imagens — J1 (29/09/2026).
 *
 * Dizia *"Abra o atlas junto para ver as imagens"*, e parava ali: nem onde
 * estava o atlas, nem que o caminho de verdade é abrir a PASTA. Agora diz o
 * gesto inteiro, e o nome da pasta quando o programa a conhece.
 */
export function missingAtlasNotice(bone: string, atlases: readonly string[], folder: string | null): string {
  const onde = folder === null
    ? `e escolha a pasta onde está o ${bone}`
    : `e escolha a pasta "${folder}"`;
  // "esqueleto" virou "base" — rodada 4, consertos (conferência da rodada 24, A6).
  return `Esta base usa ${atlases.join(', ')}, que mora na pasta do projeto, e ela veio sozinha: `
    + `as imagens ficaram de fora. Para abrir com elas: Arquivo → Abrir pasta do projeto… ${onde}.`;
}

/**
 * **A pasta que está sendo aberta** — rodada 45, lote 1 (doc `57`, foto `31`).
 *
 * Quem abre pela PASTA (Abrir pasta do projeto…, Abrir recente, Novo projeto
 * numa pasta com projeto) já escolheu a pasta. O aviso de cima mandava
 * *"escolha a pasta "X""* — a mesma que acabou de abrir. Enquanto a casca abre
 * pela pasta, ela diz o nome aqui, e o aviso passa a dizer o que falta nela.
 */
let pastaAbrindo: string | null = null;

/** A casca marca a pasta antes de abrir por ela, e desmarca (`null`) depois. */
export function abrindoPelaPasta(nome: string | null): void {
  pastaAbrindo = nome;
}

/** O aviso do atlas que não está na pasta aberta: o nome do que falta, e onde pôr. */
export function atlasForaDaPastaNotice(bone: string, atlases: readonly string[], pasta: string): string {
  const quais = atlases.join(', ');
  const verbo = atlases.length === 1 ? 'não está' : 'não estão';
  return `${quais} ${verbo} na pasta "${pasta}": as imagens de ${bone} ficaram de fora. `
    + `Ponha ${quais} e as imagens ${atlases.length === 1 ? 'dele' : 'deles'} na pasta e aperte Recarregar`;
}

/** The fallback picker: a hidden `<input type="file">`. */
function pickWithInput(): Promise<File[] | null> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = `${SKELETON_EXTENSIONS.join(',')},.json,${IMAGE_EXTENSIONS.join(',')}`;
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const files = input.files === null ? [] : [...input.files];
      input.remove();
      resolve(files.length > 0 ? files : null);
    });
    // A cancelled dialog fires nothing in older browsers, so the element stays
    // until the next open; that is cheaper than guessing with a timer.
    document.body.append(input);
    input.click();
  });
}

/**
 * Reabre um arquivo da lista de recentes — anotação 22, lote 33.
 *
 * Devolve `null` de três jeitos, e cada um tem um recado próprio em quem
 * chamou: sem jeito de reabrir guardado (`sem-jeito`), permissão negada
 * (`sem-permissao`), ou o arquivo sumiu do disco (`sumiu`).
 */
export async function openRecentDocument(
  name: string,
): Promise<{ doc: OpenedDocument } | { erro: 'sem-jeito' | 'sem-permissao' | 'sumiu' }> {
  const guardados = (await recentHandles(name)) as FileHandle[];
  if (guardados.length === 0) return { erro: 'sem-jeito' };

  const arquivos: File[] = [];
  for (const handle of guardados) {
    try {
      if (typeof handle.queryPermission === 'function') {
        let estado = await handle.queryPermission({ mode: 'read' });
        if (estado !== 'granted' && typeof handle.requestPermission === 'function') {
          estado = await handle.requestPermission({ mode: 'read' });
        }
        if (estado !== 'granted') return { erro: 'sem-permissao' };
      }
      arquivos.push(await handle.getFile());
    } catch {
      // Arquivo apagado, renomeado, ou numa pasta que já não existe.
      return { erro: 'sumiu' };
    }
  }
  const boneHandle = guardados.find((h) => isBoneFile(h.name));
  openHandle = boneHandle ?? null;
  const aberto = await readOpenedFiles(arquivos);
  if (aberto === null) return { erro: 'sumiu' };
  void rememberRecent(name, guardados);
  return { doc: aberto };
}

// ---------------------------------------------------------------------------
// Abrir outro `.bone` — degrau 10, tarefa 10.2 (E17)
// ---------------------------------------------------------------------------

/**
 * **Abrir outro `.bone` para dentro do projeto** (E17, `ARQUITETO 3` §1.4).
 *
 * *"Abrir como corpo"*: entra na lista Corpos e a base dele abre. *"Abrir como
 * entidade"*: entra na lista Entidades e fica **fechado** — uma entidade é um
 * projeto pronto que a gente encaixa, não um arquivo que a gente edita.
 *
 * Os dois gestos leem o arquivo do mesmo jeito — o que muda é em qual lista
 * ele cai, e isso quem decide é a casca. Aqui só se lê, e **sem tomar o lugar
 * do arquivo aberto**: o `Ctrl+S` continua gravando o de antes.
 */
export async function openAnotherSkeleton(known?: KnownFiles): Promise<OpenedDocument | null> {
  const files = await pickFilesToOpen({ claim: false });
  if (files === null || files.length === 0) return null;
  return readOpenedFiles(files, known);
}

/**
 * **O que o projeto já tem aberto** — rodada 8b, C18. Quem traz um `.bone` para
 * dentro de um projeto (Abrir uma entidade, Abrir como base) passa os atlas e
 * as imagens de agora: o arquivo que veio sozinho, sem o atlas dele, procura as
 * imagens ali, em vez de entrar sem desenho.
 */
export interface KnownFiles {
  readonly atlases: readonly AtlasData[];
  readonly images: ReadonlyMap<string, CanvasImageSource>;
}

/**
 * **Quem veio de fora** — os arquivos que entraram no projeto por "Abrir outro
 * `.bone`", pelo uri que ganharam aqui dentro (E17, E4).
 *
 * É o que faz o Salvar de uma entidade editada ter o que perguntar: só um
 * arquivo que tem origem FORA da pasta pode ser gravado "por cima" dela.
 * Zerado por "Novo projeto", como tudo o mais da sessão anterior.
 */
const fromOutside = new Map<string, string>();

/** Anota que `uri` veio do arquivo `origem`, de fora da pasta do projeto. */
export function rememberOutside(uri: string, origem: string): void {
  fromOutside.set(uri, origem);
}

/** O arquivo de origem de um uri que veio de fora, ou `null`. */
export function cameFromOutside(uri: string): string | null {
  return fromOutside.get(uri) ?? null;
}

/** Esquece as origens: o projeto é outro. */
export function forgetOutside(): void {
  fromOutside.clear();
}

/**
 * A uri com que um arquivo entra no projeto: o nome dele, sem a pasta de onde
 * veio. É o que uma chave `body` escreve, e o que o manifesto lista (2.9).
 */
export function uriForOpened(path: string, taken: Iterable<string>): string {
  const base = baseName(path);
  const used = new Set(taken);
  if (!used.has(base)) return base;
  const stem = base.replace(/\.bone$/i, '');
  for (let n = 2; ; n++) {
    const candidate = `${stem}-${n}.bone`;
    if (!used.has(candidate)) return candidate;
  }
}

/** Turns the picked files into a document, an atlas list and an image map. */
export async function readOpenedFiles(files: readonly File[], known?: KnownFiles): Promise<OpenedDocument | null> {
  const warnings: string[] = [];
  const boneFile = files.find((f) => isSkeletonFile(f.name));
  if (boneFile === undefined) {
    warnings.push('Nenhum arquivo de esqueleto foi escolhido.');
    throw new Error('Escolha um arquivo .bone, .boneb ou .bonez.');
  }

  // A `.boneb` or a `.bonez` arrives as bytes: the runtime reads it, and a
  // package brings its atlas and its images with it (spec 1.2, 2.9).
  if (isPackedFile(boneFile.name)) return readPackedFile(boneFile, warnings);

  const file = parseBoneText(await boneFile.text()) as BoneFile;

  const atlases: AtlasData[] = [];
  for (const candidate of files) {
    if (!isAtlasFile(candidate.name)) continue;
    try {
      const atlas = loadAtlas(parseBoneText(await candidate.text()));
      atlases.push(atlas);
      for (const warning of atlas.warnings) warnings.push(`${candidate.name} — ${warning.message}`);
    } catch (error) {
      warnings.push(`Não deu para ler o atlas ${candidate.name}: ${messageOf(error)}`);
    }
  }
  const wanted = file.assets?.atlases ?? [];
  // Rodada 8b, C18: o arquivo veio sozinho para dentro de um projeto que já
  // tem atlas abertos. As imagens são procuradas neles, e o aviso diz isso —
  // o que não estiver lá continua sendo dito pelo carregador, imagem por imagem.
  const emprestado = wanted.length > 0 && atlases.length === 0 && known !== undefined && known.atlases.length > 0;
  if (emprestado) {
    atlases.push(...known.atlases);
    warnings.push(`${boneFile.name} pede ${wanted.join(', ')}, que não veio junto: as imagens foram `
      + 'procuradas nos atlas que o projeto já tem abertos.');
  } else if (wanted.length > 0 && atlases.length === 0) {
    warnings.push(pastaAbrindo !== null
      ? atlasForaDaPastaNotice(boneFile.name, wanted, pastaAbrindo)
      : missingAtlasNotice(boneFile.name, wanted, companionFolder ?? foldersOfBone(boneFile.name)[0] ?? null));
  }
  // Vale para ESTE abrir só: um arrasto depois não pode herdar o nome da pasta.
  companionFolder = null;

  // Os atlas emprestados já têm as imagens: só os escolhidos procuram as suas.
  const images = await loadImages(files, emprestado ? [] : atlases, warnings);
  if (emprestado) for (const [nome, imagem] of known.images) if (!images.has(nome)) images.set(nome, imagem);

  // Spec 7.11: a `skeleton` attachment names another `.bone`. When the user
  // picked it in the same dialog, it goes in; when they did not, the slot draws
  // nothing and the line below says why.
  const skeletons = new Map<string, SkeletonData>();
  const first = loadSkeletonData(JSON.parse(JSON.stringify(file)) as unknown, { atlases });
  for (const attachment of nestedAttachments(first)) {
    const wanted = baseName(attachment.resolvedUri);
    const picked = files.find((f) => baseName(f.name) === wanted && f !== boneFile);
    if (picked === undefined) {
      // Rodada 8b, C18: a entidade de dentro que o projeto já abriu antes (a
      // espada do herói) entra junto, sem pedir o arquivo de novo.
      const conhecido = entityFileText(attachment.resolvedUri);
      if (conhecido !== null) {
        try {
          skeletons.set(attachment.resolvedUri, loadSkeletonData(parseBoneText(conhecido), { atlases }));
          continue;
        } catch (error) {
          warnings.push(`Não deu para ler ${attachment.resolvedUri}: ${messageOf(error)}`);
          continue;
        }
      }
      warnings.push(`A entidade ${attachment.resolvedUri} não foi aberta; esse slot fica vazio.`);
      continue;
    }
    try {
      const texto = await picked.text();
      skeletons.set(attachment.resolvedUri, loadSkeletonData(parseBoneText(texto), { atlases }));
      // Rodada 8b, C10: o texto fica guardado, para a entidade abrir por dentro.
      rememberEntityFile(attachment.resolvedUri, texto);
    } catch (error) {
      warnings.push(`Não deu para ler ${picked.name}: ${messageOf(error)}`);
    }
  }

  return { file, path: boneFile.name, atlases, images, skeletons, warnings };
}

/**
 * Opens a `.boneb` or a `.bonez` (spec 11, 2.9).
 *
 * The browser has no synchronous inflate, so this goes through
 * `loadSkeletonFileAsync`, which uses `DecompressionStream`. A package already
 * carries its atlas and its page images, so nothing else has to be picked.
 */
async function readPackedFile(picked: File, warnings: string[]): Promise<OpenedDocument> {
  const bytes = new Uint8Array(await picked.arrayBuffer());
  const loaded = await loadSkeletonFileAsync(bytes);
  // QA 04/11/2026 (D8): o `.boneb` vem sem atlas — o binário não o carrega
  // dentro, como o `.bonez`. A primeira frase é a mesma do `.bone` sozinho, em
  // português, antes das frases cruas do leitor, imagem por imagem.
  const pedidos = (loaded.file as BoneFile).assets?.atlases ?? [];
  if (loaded.archive === null && pedidos.length > 0 && loaded.atlases.length === 0) {
    warnings.push(pastaAbrindo !== null
      ? atlasForaDaPastaNotice(picked.name, pedidos, pastaAbrindo)
      : missingAtlasNotice(picked.name, pedidos, companionFolder ?? foldersOfBone(picked.name)[0] ?? null));
  }
  companionFolder = null;
  warnings.push(...loaded.warnings);
  for (const warning of loaded.data.warnings) warnings.push(`${warning.pointer}: ${warning.message}`);

  const images = new Map<string, CanvasImageSource>();
  const archive = loaded.archive;
  if (archive !== null) {
    const base = archive.mainName.includes('/') ? archive.mainName.slice(0, archive.mainName.lastIndexOf('/') + 1) : '';
    for (const atlas of loaded.atlases) {
      for (const page of atlas.pages) {
        const entry = archive.read(base + page.image) ?? archive.read(page.image);
        if (entry === undefined) {
          warnings.push(`O pacote não traz a imagem ${page.image}; essa página fica vazia.`);
          continue;
        }
        try {
          const bitmap = await createImageBitmap(new Blob([entry as BlobPart]));
          images.set(page.image, bitmap);
          images.set(page.name, bitmap);
        } catch (error) {
          warnings.push(`Não deu para ler a imagem ${page.image}: ${messageOf(error)}`);
        }
      }
    }
  }

  openHandle = null;
  return {
    file: loaded.file as BoneFile, path: picked.name, atlases: loaded.atlases,
    images, skeletons: childrenOf(loaded.data), warnings,
  };
}

/** Decodes the picked images and keys them the way the atlas names them. */
async function loadImages(
  files: readonly File[],
  atlases: readonly AtlasData[],
  warnings: string[],
): Promise<Map<string, CanvasImageSource>> {
  const byBaseName = new Map<string, CanvasImageSource>();
  for (const candidate of files) {
    if (!isImageFile(candidate.name)) continue;
    try {
      byBaseName.set(baseName(candidate.name), await createImageBitmap(candidate));
    } catch (error) {
      warnings.push(`Não deu para ler a imagem ${candidate.name}: ${messageOf(error)}`);
    }
  }

  const images = new Map<string, CanvasImageSource>(byBaseName);
  for (const atlas of atlases) {
    for (const page of atlas.pages) {
      const image = byBaseName.get(baseName(page.image));
      if (image === undefined) {
        warnings.push(`A imagem ${page.image} não foi aberta; essa página fica vazia.`);
        continue;
      }
      images.set(page.image, image);
      images.set(page.name, image);
    }
  }
  return images;
}

// ---------------------------------------------------------------------------
// Checking before saving
// ---------------------------------------------------------------------------

export interface CheckResult {
  /** `false` when the file would not load at all. */
  ok: boolean;
  /** Plain-language problems, ready to show. */
  problems: string[];
}

/** Loads the text back with the runtime loader and reports what it says. */
export function checkBeforeSaving(
  text: string,
  atlases: readonly AtlasData[],
  skeletons: ReadonlyMap<string, SkeletonData> = new Map(),
): CheckResult {
  try {
    const data = loadSkeletonData(parseBoneText(text), { atlases, skeletons });
    const problems = data.warnings.map((w) => `${w.pointer}: ${w.message}`);
    for (const image of data.missingImages) problems.push(`imagem não encontrada: ${image}`);
    return { ok: true, problems };
  } catch (error) {
    return { ok: false, problems: [messageOf(error)] };
  }
}

// ---------------------------------------------------------------------------
// Saving
// ---------------------------------------------------------------------------

export interface SaveOptions {
  /** `true` for "Salvar como": always asks where to put the file. */
  saveAs?: boolean;
  /**
   * Asked when the check found problems. Return `true` to save anyway.
   * The shell passes its own window, built from `problemsQuestion` (P43).
   * Without it, `window.confirm` — the last resort, for a caller with no shell.
   */
  confirmProblems?(problems: string[]): boolean | Promise<boolean>;
}

/** Writes the document. Returns the file name written, or `null` if cancelled. */
export async function saveDocument(doc: Doc, options: SaveOptions = {}): Promise<string | null> {
  // Lote 61: o pivô da pasta de uma imagem que já está na cena mora na região.
  pruneFolderPivots(doc);
  lastNote = null;
  lastNoteWarns = false;

  const check = checkBeforeSaving(doc.serialize(), doc.atlases, doc.skeletons);
  if (!check.ok || check.problems.length > 0) {
    const ask = options.confirmProblems ?? lastResortConfirm;
    const go = await ask(check.problems);
    if (!go) {
      // Rodada 39: o "não" — dito ou dado sozinho pelo navegador — vira frase.
      noteSaveRefused(check.problems, suggestedName(doc));
      return null;
    }
  }

  const suggested = suggestedName(doc);
  const w = picker();
  const folder = projectFolder(doc);

  if (typeof w.showSaveFilePicker === 'function') {
    let handle = openHandle;
    // Rodada 7: o projeto começou numa pasta (Novo projeto…, Abrir pasta…): o
    // Salvar grava ali, sem perguntar — se o nome está livre. Um `.bone` que
    // ninguém abriu não é sobrescrito calado: aí a janela abre, na pasta.
    if (handle === null && options.saveAs !== true && folder?.handle?.getFileHandle !== undefined) {
      const nome = nomeParaSalvar(doc.path, doc.file.skeleton?.name, folder.name);
      const direto = salvarDireto({
        temArquivoAberto: false, salvarComo: false, pastaGravavel: true,
        nome, nomesNaRaiz: await rootFileNames(folder.handle),
      });
      if (direto) {
        try {
          handle = await folder.handle.getFileHandle(nome, { create: true }) as unknown as FileHandle;
        } catch {
          handle = null; // Sem escrita na pasta: a janela do Salvar decide.
        }
      }
    }
    if (handle === null || options.saveAs === true) {
      try {
        handle = await w.showSaveFilePicker({
          suggestedName: suggested,
          // Lote 62: a janela abre na pasta do projeto — o `.bone` mora ao
          // lado das imagens, e o atlas vai junto.
          ...(folder?.handle ? { startIn: folder.handle } : {}),
          types: [{ description: 'Esqueleto Recorte', accept: { 'application/json': ['.bone'] } }],
        });
      } catch (error) {
        // Rodada 23: fechado ou bloqueado, o rodapé diz (regra 21).
        notePickerProblem(error, options.saveAs === true ? 'Salvar como' : 'Salvar');
        return null;
      }
    }
    // Lote 62: o atlas nasce aqui, e o `.bone` que sai já o cita.
    const pack = await buildFolderPack(doc, stemOfName(handle.name));
    const text = doc.serialize();
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    openHandle = handle;
    lastNote = await saveAtlasBeside(doc, handle, pack);
    // Degrau 4b: os outros corpos e o `manifest.json`, ao lado do `.bone`.
    lastNote = joinNotes(lastNote, await saveProjectBeside(doc, handle));
    markProjectSaved(doc, handle.name);
    // Salvo também é recente: é o arquivo em que se estava trabalhando.
    void rememberRecent(handle.name, [handle]);
    return handle.name;
  }

  const pack = await buildFolderPack(doc, stemOfName(suggested));
  const text = doc.serialize();
  downloadText(suggested, text);
  lastNote = await saveAtlasBeside(doc, null, pack);
  lastNote = joinNotes(lastNote, await saveProjectBeside(doc, null));
  markProjectSaved(doc, suggested);
  void rememberRecent(suggested);
  return suggested;
}

/** Duas frases do rodapé numa, ou a que houver. */
function joinNotes(a: string | null, b: string | null): string | null {
  if (a === null) return b;
  if (b === null) return a;
  return `${a}. ${b}`;
}

/** O projeto inteiro salvo: cada corpo limpa a marca, o foco com o nome gravado. */
function markProjectSaved(doc: Doc, name: string): void {
  const projeto = doc.project;
  if (projeto instanceof Projeto) projeto.markSaved(name);
  else doc.markSaved(name);
}

/**
 * Os outros corpos e o `manifest.json` — degrau 4b, `ARQUITETO 3` §1.3 (a).
 *
 * Só quando o projeto tem mais de um arquivo: o herói sozinho salva como
 * sempre, sem manifesto. Vão pelo mesmo caminho do atlas: a pasta do projeto,
 * ao lado do `.bone` em foco; sem pasta, a pasta do handle; sem nada, baixam.
 * Devolve a frase do rodapé, ou `null` quando não havia o que gravar.
 */
async function saveProjectBeside(doc: Doc, handle: FileHandle | null): Promise<string | null> {
  const projeto = doc.project;
  if (!(projeto instanceof Projeto)) return null;
  const files = projectFilesToSave(projeto, handle === null ? suggestedName(doc) : handle.name);
  if (files.length === 0) return null;
  const out = files.map((file) => ({ name: file.name, blob: new Blob([file.text], { type: 'application/json' }) }));
  const quantos = files.length - 1;
  const frase = `${quantos === 0 ? 'O manifesto' : `${quantos} ${quantos === 1 ? 'corpo' : 'corpos'} e o manifesto`} do projeto`;
  // Rodada 13 (segunda conferência): "O manifesto do projeto baixados" — o
  // verbo concorda com o que se gravou: um só, singular.
  const gravados = quantos === 0 ? 'gravado' : 'gravados';
  const baixados = quantos === 0 ? 'baixado' : 'baixados';

  const folder = projectFolder(doc);
  if (folder !== null && folder.handle !== null) {
    let inside: string[] | null = null;
    if (handle !== null && folder.handle.resolve !== undefined) {
      try {
        inside = await folder.handle.resolve(handle);
      } catch {
        inside = null;
      }
    }
    const route = folderSaveRoute(folder, inside);
    if (route.kind === 'pasta') {
      const dir = await descend(folder.handle, route.path);
      for (const file of out) await writeInto(dir as unknown as DirectoryHandle, file.name, file.blob);
      return `${frase} ${gravados} na pasta`;
    }
  }
  const directory = handle === null ? null : await directoryOf(handle);
  if (directory !== null) {
    for (const file of out) await writeInto(directory, file.name, file.blob);
    return `${frase} ${gravados} ao lado`;
  }
  for (const file of out) downloadBlob(file.name, file.blob);
  lastNoteWarns = true;
  return `${frase} ${baixados}: salve o .bone dentro da pasta do projeto para ${quantos === 0 ? 'ir junto' : 'irem juntos'}`;
}

// ---------------------------------------------------------------------------
// Entregar um corpo — degrau 10, tarefa 10.1 (P2)
// ---------------------------------------------------------------------------

/** O que a entrega de um corpo gravou. */
export interface DeliveredBody {
  /** O nome do `.bone` que saiu. */
  name: string;
  /** O nome do atlas que saiu junto, ou `null` quando não houve o que fatiar. */
  atlas: string | null;
  /** Quantas imagens entraram no atlas fatiado. */
  images: number;
  /** Para onde foram: a pasta escolhida, ou a pasta de downloads. */
  where: 'pasta' | 'baixado';
  warnings: string[];
}

/**
 * **Arquivo → Entregar um corpo…** (P2, `programa-novo/02`).
 *
 * *"Salvar grava o projeto inteiro; entregar ao jogo pode levar só um corpo."*
 * Sai UM `.bone` — o corpo escolhido, sozinho — com o **atlas fatiado** ao
 * lado: só as imagens que ESSE corpo usa, e não as do projeto todo. O jogo que
 * só quer o herói não carrega o lobisomem junto.
 *
 * A entrega não mexe no projeto: ela não toma o lugar do arquivo aberto, não
 * limpa a marca de "não salvo" e não entra nos recentes. É uma cópia que sai.
 */
export async function deliverBody(doc: Doc): Promise<DeliveredBody | null> {
  const warnings: string[] = [];
  const suggested = suggestedName(doc);
  const w = picker();
  let handle: FileHandle | null = null;
  if (typeof w.showSaveFilePicker === 'function') {
    try {
      handle = await w.showSaveFilePicker({
        suggestedName: suggested,
        types: [{ description: 'Esqueleto Recorte', accept: { 'application/json': ['.bone'] } }],
      });
    } catch (error) {
      notePickerProblem(error, 'Entregar a base');
      return null;
    }
  }
  const name = handle?.name ?? suggested;
  // O atlas fatiado nasce aqui, e o `.bone` que sai já o cita — por isso antes
  // do `serialize`, como no Salvar.
  const pack = await buildFolderPack(doc, stemOfName(name));
  if (pack === null) {
    warnings.push('As imagens desta base não vieram da pasta do projeto: o atlas que ela já citava vai como está, sem fatiar.');
  }
  const check = checkBeforeSaving(doc.serialize(), doc.atlases, doc.skeletons);
  for (const problem of check.problems) warnings.push(problem);

  const out: Array<{ name: string; blob: Blob }> = [];
  if (pack !== null) {
    out.push({ name: pack.atlasName, blob: new Blob([pack.text], { type: 'application/json' }) });
    for (const page of pack.pages) {
      out.push({ name: page.name, blob: new Blob([page.bytes.slice().buffer as ArrayBuffer], { type: 'image/png' }) });
    }
  }
  const text = doc.serialize();

  if (handle !== null) {
    const writable = await handle.createWritable();
    await writable.write(text);
    await writable.close();
    const directory = await directoryOf(handle);
    if (directory !== null) {
      for (const file of out) await writeInto(directory, file.name, file.blob);
      return { name, atlas: pack?.atlasName ?? null, images: pack?.count ?? 0, where: 'pasta', warnings };
    }
    for (const file of out) downloadBlob(file.name, file.blob);
    return {
      name, atlas: pack?.atlasName ?? null, images: pack?.count ?? 0, where: 'pasta',
      warnings: out.length === 0 ? warnings
        : [...warnings, 'O navegador não entregou a pasta do arquivo: o atlas e as páginas foram baixados. Ponha-os ao lado do .bone.'],
    };
  }
  downloadText(name, text);
  for (const file of out) downloadBlob(file.name, file.blob);
  return { name, atlas: pack?.atlasName ?? null, images: pack?.count ?? 0, where: 'baixado', warnings };
}

/** Uma linha de rodapé para o que a entrega gravou. */
export function deliveredLine(result: DeliveredBody): string {
  const atlas = result.atlas === null
    ? 'sem atlas novo'
    : `${result.atlas} com ${result.images} ${result.images === 1 ? 'imagem' : 'imagens'}`;
  return `Base entregue em ${result.name} (${atlas})`;
}

// ---------------------------------------------------------------------------
// Salvar uma entidade editada — degrau 10, tarefa 10.3 (E4)
// ---------------------------------------------------------------------------

/** As duas saídas do Salvar de uma entidade editada (E4). */
export type EntitySaveChoice = 'novo' | 'por-cima';

/**
 * **A pergunta do Salvar de uma entidade editada** (E4, `ARQUITETO 3` §1.4).
 *
 * *"Pergunta Novo (cópia dentro do projeto) ou Por cima (o arquivo de origem),
 * e diz quantos projetos usam o original, se souber."*
 *
 * O "se souber" é o que a regra 21 cobra: o editor conhece **este** projeto, e
 * não os outros que possam ter o mesmo arquivo. Então a frase diz o que ele
 * sabe e admite o que não sabe — em vez de um número inventado que faria
 * alguém gravar por cima achando que ninguém mais usa.
 */
export function entitySaveLines(uri: string, usedHere: number): string[] {
  const aqui = usedHere === 0
    ? `Neste projeto, nenhuma base aponta para ${uri} agora.`
    : usedHere === 1
      ? `Neste projeto, 1 base usa ${uri}.`
      : `Neste projeto, ${usedHere} bases usam ${uri}.`;
  return [
    aqui,
    'De outros projetos o editor não sabe: ele só enxerga a pasta que está aberta. '
    + 'Por cima muda o arquivo para quem mais o use.',
    'Novo: uma cópia dentro deste projeto. O arquivo de origem fica como está.',
  ];
}

/** A frase do último Salvar sobre o atlas da pasta, para o rodapé, ou `null`. */
let lastNote: string | null = null;

/** O que o último Salvar disse do atlas da pasta — lote 62. */
export function lastSaveNote(): string | null {
  return lastNote;
}

/**
 * `true` quando o último Salvar **não** pôs tudo ao lado do `.bone`: o atlas,
 * as páginas ou os outros corpos foram baixados — QA de 04/11/2026.
 */
let lastNoteWarns = false;

export function lastSaveWarns(): boolean {
  return lastNoteWarns;
}

/**
 * **A frase do rodapé depois do Salvar** — QA de 04/11/2026 (D3).
 *
 * O rodapé mostra a primeira frase que cabe (`versoesDaFrase`), e a frase era
 * sempre *"Salvo em copia.bone. O .bone foi salvo fora da pasta mao: o atlas e
 * as páginas foram baixados…"*: em 1920 px só o "Salvo em copia.bone." cabia,
 * e quem salvou fora da pasta não ficava sabendo que o `.bone` saiu sem atlas
 * ao lado (regra 21). Quando a nota é um aviso, ela vem **primeiro**; quando é
 * só uma notícia ("Atlas da pasta gravado ao lado"), vem depois, como antes.
 */
export function saveStatusLine(name: string, note: string | null, warns: boolean, atlasTogether: boolean): string {
  if (note !== null && warns) return `${note}. Salvo em ${name}.`;
  if (note !== null) return `Salvo em ${name}. ${note}.`;
  return atlasTogether ? `Salvo em ${name}. Atlas e páginas gravados junto.` : `Salvo em ${name}.`;
}

/**
 * O `.bone` reaberto pela pasta — lote 62 — passa a ser o arquivo aberto: o
 * `Ctrl+S` grava de volta nele, como no Abrir.
 */
export function useOpenHandle(handle: unknown): void {
  openHandle = handle as FileHandle;
}

/** `heroi.bone` dá `heroi`. */
function stemOfName(name: string): string {
  return baseName(name).replace(/\.bone$/i, '') || 'sem-nome';
}

/**
 * Writes the packed atlas and its pages next to the `.bone` that was just
 * saved (PEDIDOS-FASE4, pedido 2). A skeleton whose images were imported in
 * the editor is useless on its own: `assets.atlases` names a file that has to
 * exist, and the pages only live in memory until they are written.
 *
 * With the File System Access API the files land in the very folder the user
 * chose, through the same directory handle. Without it, the browser can only
 * download, so each file becomes its own download — the names still match what
 * the `.bone` asks for.
 *
 * The atlas goes out stamped with the pivots the rig says (plano pivô, lote
 * 56). A skeleton opened with an atlas from disk already has its files where
 * they belong, so that atlas is written again only when the stamp, a
 * "Carimbar pivôs" or a "Duplicar no atlas" changed it — and only the
 * `.atlas.json`: the page images on disk did not change.
 */
async function saveAtlasBeside(doc: Doc, handle: FileHandle | null, pack: FolderPack | null): Promise<string | null> {
  const levados = await levarAtlasParaAPasta(doc, handle);
  return joinNotes(await gravarAtlasAoLado(doc, handle, pack), levados);
}

/**
 * **O que o `.bone` cita e mora fora da pasta** — rodada 45, lote 1 (doc `57`,
 * fotos `29` e `31`; suposição S1).
 *
 * O herói aberto de fora e salvo numa pasta nova gravava só o `heroi.bone` e o
 * `manifest.json`: o `heroi.atlas.json` e o `heroi.png` ficavam onde estavam, e
 * ao reabrir a pasta as imagens sumiam. No Spriter o projeto É a pasta, e o
 * "Save as" leva as imagens junto (SR p.4, p.33). Aqui o Salvar leva para a
 * pasta o atlas e as páginas que faltam nela, e diz quais.
 */
export function faltaNaPasta(
  atlases: ReadonlyArray<{ nome: string; paginas: readonly string[] }>,
  raiz: readonly string[],
): { atlas: string[]; paginas: string[] } {
  const tem = new Set(raiz);
  const nomeDe = (nome: string): string => nome.split(/[\\/]/).pop() || nome;
  const atlas: string[] = [];
  const paginas: string[] = [];
  for (const pedido of atlases) {
    const nome = nomeDe(pedido.nome);
    if (!tem.has(nome) && !atlas.includes(nome)) atlas.push(nome);
    for (const pagina of pedido.paginas) {
      const p = nomeDe(pagina);
      if (!tem.has(p) && !paginas.includes(p)) paginas.push(p);
    }
  }
  return { atlas, paginas };
}

/**
 * As entidades (spec 7.11) que o `.bone` cita e que não estão na raiz da pasta —
 * rodada 45, lote 1, a irmã de `faltaNaPasta`: o herói salvo numa pasta nova
 * levava o atlas e deixava a espada de fora (prova do lote 1, foto 07).
 */
export function entidadesForaDaPasta(uris: readonly string[], raiz: readonly string[]): string[] {
  const tem = new Set(raiz);
  const out: string[] = [];
  for (const uri of uris) if (uri.length > 0 && !uri.includes('/') && !tem.has(uri) && !out.includes(uri)) out.push(uri);
  return out;
}

/** Grava na raiz da pasta o atlas e as páginas que faltam nela. A frase do rodapé, ou `null`. */
async function levarAtlasParaAPasta(doc: Doc, handle: FileHandle | null): Promise<string | null> {
  const folder = projectFolder(doc);
  if (folder === null || folder.handle === null || handle === null || folder.handle.resolve === undefined) return null;
  let inside: string[] | null = null;
  try {
    inside = await folder.handle.resolve(handle);
  } catch {
    inside = null;
  }
  // Só com o `.bone` na raiz da pasta: é ali que o leitor procura o atlas.
  if (inside === null || inside.length !== 1) return null;
  const disk = atlasFilesForDisk(doc);
  const atlases = doc.atlases.filter((atlas) => !isProvisionalAtlas(atlas));
  const nomeDe = (nome: string): string => nome.split(/[\\/]/).pop() || nome;
  const pedidos = disk.files.map((file, i) => ({
    nome: file.name, paginas: (atlases[i]?.pages ?? []).map((page) => page.image),
  }));
  const raiz = await rootFileNames(folder.handle);
  const falta = faltaNaPasta(pedidos, raiz);
  const citadas = doc.data === null ? [] : nestedAttachments(doc.data).map((attachment) => attachment.resolvedUri);
  const entidades = entidadesForaDaPasta(citadas, raiz);
  if (falta.atlas.length === 0 && falta.paginas.length === 0 && entidades.length === 0) return null;
  const dir = folder.handle as unknown as DirectoryHandle;
  const levados: string[] = [];
  const ficaram: string[] = [];
  for (const file of disk.files) {
    const nome = nomeDe(file.name);
    if (!falta.atlas.includes(nome) || levados.includes(nome)) continue;
    await writeInto(dir, nome, new Blob([file.text], { type: 'application/json' }));
    levados.push(nome);
  }
  for (const atlas of atlases) {
    for (const page of atlas.pages) {
      const nome = nomeDe(page.image);
      if (!falta.paginas.includes(nome) || levados.includes(nome) || ficaram.includes(nome)) continue;
      const source = doc.imageFor(page);
      const blob = source === null ? null : await paginaComoPng(source, page.width, page.height);
      if (blob === null) {
        ficaram.push(nome);
        continue;
      }
      await writeInto(dir, nome, blob);
      levados.push(nome);
    }
  }
  for (const uri of entidades) {
    const texto = entityFileText(uri);
    if (texto === null) {
      ficaram.push(uri);
      continue;
    }
    await writeInto(dir, uri, new Blob([texto], { type: 'application/json' }));
    levados.push(uri);
  }
  const partes: string[] = [];
  if (levados.length > 0) partes.push(`Levei para a pasta ${folder.name} o que o .bone cita e estava fora dela: ${levados.join(', ')}`);
  if (ficaram.length > 0) partes.push(`Não deu para levar ${ficaram.join(', ')}: não está aberto no programa`);
  return partes.length === 0 ? null : partes.join('. ');
}

/** Uma página do atlas como PNG. A irmã de `imageToPng` (`save-binary.ts`), sem o ciclo de importação. */
async function paginaComoPng(source: CanvasImageSource, width: number, height: number): Promise<Blob | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    const context = canvas.getContext('2d');
    if (context === null) return null;
    context.drawImage(source, 0, 0);
    return await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
  } catch {
    return null;
  }
}

/** O que o Salvar sempre fez com o atlas: os do import e os mudados, ao lado do `.bone`. */
async function gravarAtlasAoLado(doc: Doc, handle: FileHandle | null, pack: FolderPack | null): Promise<string | null> {
  const disk = atlasFilesForDisk(doc);
  const files = disk.files.filter((file) => file.fromImport || file.changed);
  const pages = disk.fromImport ? await atlasPageBlobs(doc) : [];
  // `assets.atlases` may carry a folder; the file lands beside the `.bone`.
  const nameOf = (name: string): string => name.split(/[\\/]/).pop() || name;
  const out: Array<{ name: string; blob: Blob }> = [
    ...files.map((file) => ({ name: nameOf(file.name), blob: new Blob([file.text], { type: 'application/json' }) })),
    ...pages,
  ];
  // Lote 62: o atlas da pasta — só as imagens em uso — e as páginas dele.
  if (pack !== null) {
    out.push({ name: pack.atlasName, blob: new Blob([pack.text], { type: 'application/json' }) });
    for (const page of pack.pages) {
      out.push({ name: page.name, blob: new Blob([page.bytes.slice().buffer as ArrayBuffer], { type: 'image/png' }) });
    }
  }

  // Com a pasta do projeto aberta, o atlas vai **pela pasta**, ao lado do
  // `.bone` — não mais pelo `getParent()`, que é fora do padrão.
  const folder = projectFolder(doc);
  if (folder !== null) {
    let inside: string[] | null = null;
    if (handle !== null && folder.handle?.resolve !== undefined) {
      try {
        inside = await folder.handle.resolve(handle);
      } catch {
        inside = null;
      }
    }
    // O `.bone` na raiz da pasta: reabrir a pasta reabre ele.
    if (inside !== null && inside.length === 1) rememberFolderBone(folder.name, inside[0]!);
    if (pack !== null) {
      const route = folderSaveRoute(folder, inside);
      if (route.kind === 'pasta' && folder.handle !== null) {
        const dir = await descend(folder.handle, route.path);
        for (const file of out) await writeInto(dir as unknown as DirectoryHandle, file.name, file.blob);
        return `Atlas da pasta gravado ao lado: ${pack.atlasName}, com ${pack.count} ${pack.count === 1 ? 'imagem' : 'imagens'} em uso`;
      }
      if (route.kind === 'baixar') {
        for (const file of out) downloadBlob(file.name, file.blob);
        lastNoteWarns = true;
        return route.why;
      }
    }
  }

  if (out.length === 0) return null;
  const directory = handle === null ? null : await directoryOf(handle);
  if (directory !== null) {
    for (const file of out) await writeInto(directory, file.name, file.blob);
    return pack === null ? null : `Atlas gravado ao lado: ${pack.atlasName}`;
  }
  for (const file of out) downloadBlob(file.name, file.blob);
  if (pack !== null) lastNoteWarns = true;
  return pack === null ? null : `Atlas e páginas baixados: ${pack.atlasName}`;
}

/**
 * The folder a saved file sits in, when the browser allows asking. Chrome only
 * hands the directory over after the user picked it, so this is `null` more
 * often than not — and then the downloads path above takes over.
 */
async function directoryOf(handle: FileHandle): Promise<DirectoryHandle | null> {
  const withParent = handle as FileHandle & { getParent?(): Promise<DirectoryHandle> };
  if (typeof withParent.getParent !== 'function') return null;
  try {
    return await withParent.getParent();
  } catch {
    return null;
  }
}

async function writeInto(directory: DirectoryHandle, name: string, blob: Blob): Promise<void> {
  const file = await directory.getFileHandle(name, { create: true });
  const writable = await file.createWritable();
  await writable.write(blob);
  await writable.close();
}

/**
 * A pergunta "salvar mesmo assim?", pronta para a janela da casa — decisão
 * P43 (29/09/2026).
 *
 * O `io/` não abre janela da interface (lote A4; `fronteiras.test.ts`): ele
 * devolve a pergunta como DADO, e quem chama `saveDocument` a mostra, pelo
 * gancho `confirmProblems`. Vêm **todos** os avisos — o `confirm()` antigo
 * cortava em oito, e o nono aviso podia ser justamente o que importava.
 */
export interface ProblemsQuestion {
  title: string;
  lead: string;
  lines: string[];
  /** O botão que salva. */
  yes: string;
  /** O botão que volta sem salvar. */
  no: string;
}

export function problemsQuestion(problems: readonly string[]): ProblemsQuestion {
  const n = problems.length;
  return {
    title: 'Salvar com avisos?',
    lead: n === 1
      ? 'O arquivo tem 1 aviso. Ele abre do mesmo jeito, mas vale ler antes:'
      : `O arquivo tem ${n} avisos. Ele abre do mesmo jeito, mas vale ler antes:`,
    lines: [...problems],
    yes: 'Salvar mesmo assim',
    no: 'Voltar sem salvar',
  };
}

/**
 * **Último recurso**, e só para quem chama `saveDocument` sem o gancho
 * `confirmProblems`: a janela do navegador. A casa passa a janela dela (P43,
 * P36) — esta aqui existe para um teste ou uma ferramenta que não tem casca.
 */
function lastResortConfirm(problems: string[]): boolean {
  const q = problemsQuestion(problems);
  return globalThis.confirm(`${q.title}\n\n${q.lead}\n\n${q.lines.join('\n')}`);
}

function suggestedName(doc: Doc): string {
  const name = doc.path ?? doc.file.skeleton?.name ?? 'sem-nome';
  return isBoneFile(name) ? baseName(name) : `${baseName(name)}${BONE_EXTENSION}`;
}

/** The fallback save: hand the browser a file to download. */
function downloadText(name: string, text: string): void {
  downloadBlob(name, new Blob([text], { type: 'application/json' }));
}

function downloadBlob(name: string, blob: Blob): void {
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

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ---------------------------------------------------------------------------
// Opening a file the editor ships with, for the first run
// ---------------------------------------------------------------------------

/**
 * Reads a `.bone` and its atlas from URLs. Used to open the example on the
 * first run. `resolve` turns a name written inside the file into a URL; the
 * default puts it next to the `.bone`, which is what a plain server does.
 */
export async function fetchDocument(
  boneUrl: string,
  resolve?: (name: string) => string,
): Promise<OpenedDocument> {
  const warnings: string[] = [];
  const response = await fetch(boneUrl);
  if (!response.ok) throw new Error(`Não deu para abrir ${boneUrl} (${response.status}).`);
  const file = parseBoneText(await response.text()) as BoneFile;

  const base = boneUrl.slice(0, boneUrl.lastIndexOf('/') + 1);
  const urlOf = resolve ?? ((name: string) => base + baseName(name));
  const atlases: AtlasData[] = [];
  const images = new Map<string, CanvasImageSource>();

  for (const name of file.assets?.atlases ?? []) {
    try {
      const atlasResponse = await fetch(urlOf(name));
      if (!atlasResponse.ok) throw new Error(`status ${atlasResponse.status}`);
      const atlas = loadAtlas(parseBoneText(await atlasResponse.text()));
      atlases.push(atlas);
      for (const page of atlas.pages) {
        try {
          const imageResponse = await fetch(urlOf(page.image));
          if (!imageResponse.ok) throw new Error(`status ${imageResponse.status}`);
          const bitmap = await createImageBitmap(await imageResponse.blob());
          images.set(page.image, bitmap);
          images.set(page.name, bitmap);
        } catch (error) {
          warnings.push(`Imagem ${page.image}: ${messageOf(error)}`);
        }
      }
    } catch (error) {
      warnings.push(`Atlas ${name}: ${messageOf(error)}`);
    }
  }

  // Spec 7.11: the children named by the `skeleton` attachments, fetched from
  // the same place the file came from.
  const skeletons = new Map<string, SkeletonData>();
  const first = loadSkeletonData(JSON.parse(JSON.stringify(file)) as unknown, { atlases });
  for (const attachment of nestedAttachments(first)) {
    const uri = attachment.resolvedUri;
    try {
      const childResponse = await fetch(urlOf(uri));
      if (!childResponse.ok) throw new Error(`status ${childResponse.status}`);
      const texto = await childResponse.text();
      skeletons.set(uri, loadSkeletonData(parseBoneText(texto), { atlases }));
      // Rodada 8b, C10: o texto fica guardado, para a entidade abrir por dentro.
      rememberEntityFile(uri, texto);
    } catch (error) {
      warnings.push(`Esqueleto aninhado ${uri}: ${messageOf(error)}`);
    }
  }

  openHandle = null;
  return { file, path: baseName(boneUrl), atlases, images, skeletons, warnings };
}

/**
 * **O que veio dentro do pacote** — rodada 45, lote 4 (doc `64`, c). Abrir o
 * `.bonez` não dizia nada; a espada vinha dentro e ninguém sabia.
 */
export function pacoteAbertoNotice(pacote: string, entidades: readonly string[], atlas: number): string {
  const partes: string[] = [];
  if (entidades.length > 0) {
    partes.push(`${entidades.length === 1 ? 'a entidade' : `${entidades.length} entidades`} ${entidades.join(', ')}`);
  }
  if (atlas > 0) partes.push(atlas === 1 ? 'o atlas com as imagens' : `${atlas} atlas com as imagens`);
  return partes.length === 0 ? `Pacote ${pacote} aberto.` : `Pacote ${pacote} aberto, com ${partes.join(' e ')} dentro.`;
}
