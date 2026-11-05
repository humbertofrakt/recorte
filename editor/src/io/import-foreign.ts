/**
 * "Importar de outro programa" (owner A).
 *
 * The same four importers the command line uses — Spine, DragonBones and
 * Spriter — driven from the editor. Nothing is converted twice: this module
 * only picks the files, decides which importer to call, and turns what comes
 * back into a document.
 *
 * The user may hand over several files at once: the project, its atlas, and
 * the page images. Whatever is missing turns into a warning in plain
 * Portuguese, never into a silent half-import.
 */

import { findAtlasRegion, loadAtlas } from '../../../runtime/src/index.js';
import type { AtlasData, BoneFile } from '../../../runtime/src/index.js';
import { importSpine } from '../../../ferramentas/src/importar/spine.js';
import { dragonBonesParts, importDragonBones } from '../../../ferramentas/src/importar/dragonbones.js';
import { importSpriter, spriterParts } from '../../../ferramentas/src/importar/spriter.js';
import type { AtlasFile } from '../../../ferramentas/src/importar/comum.js';
import type { EditorDoc } from '../contract.js';
import { ensureProvisionalMany } from './folder-atlas.js';
import { imageFromFile, imagesInUse, isFolderImage, setProjectFolder, skipFolderEntry } from './project-folder.js';
import type { FolderDirectoryHandle, FolderImage } from './project-folder.js';

/** The programs the editor can read a project from. */
export type ForeignFormat = 'spine' | 'dragonbones' | 'spriter';

/** How each one is called on screen, so the user reads a name, not a code. */
export const FORMAT_LABELS: Record<ForeignFormat, string> = {
  spine: 'Spine',
  dragonbones: 'DragonBones',
  spriter: 'Spriter',
};

/** Extensions the picker offers. */
const PROJECT_TYPES = ['.json', '.scml', '.scon', '.atlas', '.txt'];
const IMAGE_TYPES = ['.png', '.webp', '.jpg', '.jpeg'];

// ---------------------------------------------------------------------------
// Picking
// ---------------------------------------------------------------------------

interface FileHandle { readonly name: string; getFile(): Promise<File> }
interface PickerWindow { showOpenFilePicker?(options?: unknown): Promise<FileHandle[]> }

/** Asks for the project and whatever comes with it. `null` when cancelled. */
export async function pickForeignFiles(): Promise<File[] | null> {
  const w = globalThis as unknown as PickerWindow;
  if (typeof w.showOpenFilePicker === 'function') {
    try {
      const handles = await w.showOpenFilePicker({
        multiple: true,
        types: [{
          description: 'Projeto de outro programa, atlas e imagens',
          accept: {
            'application/json': ['.json', '.scon'],
            'text/plain': ['.scml', '.atlas', '.txt'],
            'image/*': IMAGE_TYPES,
          },
        }],
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
    input.accept = [...PROJECT_TYPES, ...IMAGE_TYPES].join(',');
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const files = input.files === null ? [] : [...input.files];
      input.remove();
      done(files.length > 0 ? files : null);
    });
    document.body.append(input);
    input.click();
  });
}

// ---------------------------------------------------------------------------
// Telling the three formats apart
// ---------------------------------------------------------------------------

/**
 * Which program wrote this text. Reads the content, not the extension, because
 * Spine, DragonBones and Spriter's SCON all end in `.json`.
 *
 * Returns `null` when nothing matches, so the caller can say so in words.
 */
export function detectFormat(text: string): ForeignFormat | null {
  const clean = text.replace(/^﻿/, '').trimStart();
  if (clean.startsWith('<')) return 'spriter';
  let data: unknown;
  try {
    data = JSON.parse(clean);
  } catch {
    return null;
  }
  if (data === null || typeof data !== 'object') return null;
  const o = data as Record<string, unknown>;
  if (o.spriter_data !== undefined) return 'spriter';
  if (Array.isArray(o.armature)) return 'dragonbones';
  if (o.skeleton !== undefined && (Array.isArray(o.bones) || (o.skeleton as Record<string, unknown>).spine !== undefined)) {
    return 'spine';
  }
  if (Array.isArray(o.entity) && Array.isArray(o.folder)) return 'spriter';
  if (Array.isArray(o.bones)) return 'spine';
  return null;
}

function lower(name: string): string {
  return name.toLowerCase();
}

/** Last path segment, so `imagens/mao.png` matches the file `mao.png`. */
function baseName(path: string): string {
  const parts = path.split(/[\\/]/);
  return parts[parts.length - 1];
}

function isImage(name: string): boolean {
  return IMAGE_TYPES.some((ext) => lower(name).endsWith(ext));
}

/** The Spine atlas is a text file, usually `.atlas`, sometimes `.atlas.txt`. */
function looksLikeSpineAtlas(name: string, text: string): boolean {
  if (lower(name).endsWith('.atlas') || lower(name).endsWith('.atlas.txt')) return true;
  // A Spine atlas starts with a blank line and then the page image name.
  return /^\s*[^\s{[][^\n]*\.(png|webp|jpg|jpeg)\s*$/im.test(text.split('\n').slice(0, 3).join('\n'));
}

// ---------------------------------------------------------------------------
// The import itself
// ---------------------------------------------------------------------------

export interface ForeignImport {
  file: BoneFile;
  format: ForeignFormat;
  /** The file the project was read from, as it came: `bcp.scml`. */
  projectName: string;
  /** Name to give the document, e.g. `heroi.bone`. */
  path: string;
  /** The atlas the importer built, as the runtime reads it. */
  atlases: AtlasData[];
  /** Raw atlas tree, for whoever saves the `.atlas.json` next to the `.bone`. */
  atlasFile: AtlasFile | null;
  /** Name to write the atlas under. */
  atlasName: string | null;
  images: Map<string, CanvasImageSource>;
  /**
   * Every skeleton the source file holds — a DragonBones `armature`, a Spriter
   * `entity`. A `.bone` keeps one, so the others need another run with
   * `parte`. One name here means nothing was left behind.
   */
  parts: string[];
  /** Everything the conversion could not carry over, in Portuguese. */
  warnings: string[];
}

/**
 * Converts a set of picked files into a document.
 *
 * Throws, in plain words, when there is no project among them or when the
 * format is not one of the three.
 */
export async function importForeignFiles(
  files: readonly File[], forced?: ForeignFormat, parte?: string,
): Promise<ForeignImport> {
  const warnings: string[] = [];

  // 1. Read every text file once, and sort them into project and atlas.
  //
  // The images are NOT decoded here any more (29/09/2026): only an atlas page
  // is drawn from this map, and a Spriter project brings a hundred loose
  // images of 1600 px that were decoded one by one and then never used. They
  // are decoded in step 3, once the atlas says which ones are pages.
  const texts: Array<{ name: string; text: string }> = [];
  const imageFiles = new Map<string, File>();
  const images = new Map<string, CanvasImageSource>();
  for (const file of files) {
    if (isImage(file.name)) {
      if (!imageFiles.has(baseName(file.name))) imageFiles.set(baseName(file.name), file);
      continue;
    }
    texts.push({ name: file.name, text: await file.text() });
  }

  let atlasText: string | null = null;
  let atlasJson: unknown = null;
  let project: { name: string; text: string } | null = null;
  let format: ForeignFormat | null = forced ?? null;

  for (const candidate of texts) {
    if (project === null) {
      const guess = forced ?? detectFormat(candidate.text);
      if (guess !== null) {
        project = candidate;
        format = guess;
        continue;
      }
    }
    if (atlasText === null && looksLikeSpineAtlas(candidate.name, candidate.text)) {
      atlasText = candidate.text;
      continue;
    }
    // A DragonBones texture atlas is JSON with `SubTexture` inside.
    try {
      const parsed: unknown = JSON.parse(candidate.text.replace(/^﻿/, ''));
      if (parsed !== null && typeof parsed === 'object'
        && Array.isArray((parsed as Record<string, unknown>).SubTexture)) {
        atlasJson = parsed;
      }
    } catch {
      // Not JSON: nothing here for us.
    }
  }

  if (project === null || format === null) {
    throw new Error(
      'Nenhum projeto de Spine, DragonBones ou Spriter entre os arquivos escolhidos.',
    );
  }

  // 2. Run the importer for that program.
  const stem = baseName(project.name).replace(/\.[^.]+$/, '');
  const atlasName = `${stem}.atlas.json`;
  let result;
  if (format === 'spine') {
    if (atlasText === null) {
      warnings.push('O arquivo .atlas do Spine não veio junto. Sem ele, as imagens não são recortadas.');
    }
    result = importSpine(
      JSON.parse(project.text.replace(/^﻿/, '')), atlasText ?? undefined, { atlasNome: atlasName },
    );
  } else if (format === 'dragonbones') {
    result = importDragonBones(
      JSON.parse(project.text.replace(/^﻿/, '')), atlasJson ?? undefined, { parte },
    );
  } else {
    result = importSpriter(project.text, { parte });
  }
  warnings.push(...result.avisos);

  // 3. Turn the atlas the importer built into something the viewport draws.
  const atlases: AtlasData[] = [];
  const atlasFile = result.atlas ?? null;
  if (atlasFile !== null) {
    result.file.assets ??= {};
    (result.file.assets as { atlases?: string[] }).atlases = [atlasName];
    try {
      const atlas = loadAtlas(atlasFile);
      atlases.push(atlas);
      for (const warning of atlas.warnings) warnings.push(`Atlas — ${warning.message}`);
      for (const page of atlas.pages) {
        const pageFile = imageFiles.get(baseName(page.image));
        if (pageFile === undefined) {
          warnings.push(`A imagem ${page.image} não veio junto; essa página fica vazia.`);
          continue;
        }
        let image: CanvasImageSource;
        try {
          image = await createImageBitmap(pageFile);
        } catch (error) {
          warnings.push(`Não deu para ler a imagem ${pageFile.name}: ${messageOf(error)}.`);
          continue;
        }
        images.set(baseName(page.image), image);
        images.set(page.image, image);
        images.set(page.name, image);
      }
    } catch (error) {
      warnings.push(`Não deu para montar o atlas: ${messageOf(error)}.`);
    }
  }

  return {
    file: result.file as unknown as BoneFile,
    format,
    projectName: project.name,
    parts: partsOf(format, project.text),
    path: `${stem}.bone`,
    atlases,
    atlasFile,
    atlasName: atlasFile === null ? null : atlasName,
    images,
    warnings,
  };
}

/** Names of every skeleton in the source file. Spine always has exactly one. */
function partsOf(format: ForeignFormat, text: string): string[] {
  try {
    if (format === 'dragonbones') return dragonBonesParts(JSON.parse(text.replace(/^﻿/, '')));
    if (format === 'spriter') return spriterParts(text);
  } catch {
    // A source we could not re-read is not worth a second error message.
  }
  return [];
}

/**
 * The whole command: ask for the files, convert them. `null` when cancelled.
 *
 * `parte` picks which skeleton of the source file to convert, for a
 * DragonBones with several armatures or a Spriter with several entities.
 */
export async function importFromOtherProgram(
  parte?: string,
  gate?: (files: readonly File[]) => Promise<readonly File[] | null>,
  escolher?: (projetos: readonly string[]) => Promise<string | null>,
): Promise<ForeignProject | null> {
  // Rodada 45, lote 3 (doc 57, T8): com o seletor de pasta, pede a PASTA do
  // projeto. O Spriter procura as imagens a partir da raiz (SR p.4), e o
  // seletor de arquivos não alcança 13 subpastas de uma vez: só o .scml
  // entrava, sem imagem nenhuma.
  if (hasForeignFolderPicker()) {
    const pasta = await pickForeignFolder();
    if (pasta === null) return null;
    const rel = (path: string): string => path.slice(pasta.name.length + 1);
    const projetos = projetosNaRaiz(pasta.files.map((entry) => rel(entry.path)));
    if (projetos.length === 0) {
      throw new Error(`A pasta ${pasta.name} não tem projeto de outro programa na raiz: um .scml ou .scon do Spriter, ou o .json do Spine ou do DragonBones.`);
    }
    let escolhido = projetos[0]!;
    if (projetos.length > 1) {
      const resposta = escolher === undefined ? escolhido : await escolher(projetos);
      if (resposta === null) return null;
      escolhido = resposta;
    }
    const lista = pasta.files.filter((entry) => !projetos.includes(rel(entry.path)) || rel(entry.path) === escolhido);
    const caminhos = new Map(lista.map((entry) => [entry.file, entry.path]));
    const escolhidos = gate === undefined ? lista.map((entry) => entry.file) : await gate(lista.map((entry) => entry.file));
    if (escolhidos === null) return null;
    const importado = await importForeignProject(escolhidos, escolhidos.map((file) => caminhos.get(file) ?? file.name), parte);
    return { ...importado, folderHandle: pasta.handle };
  }
  const picked = await pickForeignFiles();
  if (picked === null || picked.length === 0) return null;
  // E6 (rodada 3): quem chama pode olhar o peso ANTES de ler as imagens, e
  // tirar as imagens ou desistir. `null` = desistiu.
  const files = gate === undefined ? picked : await gate(picked);
  if (files === null) return null;
  // 29/09/2026: o mesmo que o arrasto. Quem chama liga as imagens soltas
  // depois do `setFile`, com `adoptForeignImages`.
  return importForeignProject(files, undefined, parte);
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// ---------------------------------------------------------------------------
// O projeto de VERDADE, com as imagens soltas — rodada final, Ficha E, E2 e E3
// (29/09/2026)
// ---------------------------------------------------------------------------

/*
 * **O defeito, medido com o projeto do Humberto** (`exemplo/game`, um `.scml` e
 * 129 imagens em subpastas): o boneco entrava INVISÍVEL, com 176 avisos
 * *"image not found in any atlas"*. O Spriter não tem atlas — o modelo dele é a
 * pasta do projeto, que é a paleta. O importador lia as imagens que vieram
 * junto, e ninguém as ligava ao boneco.
 *
 * Agora é o modelo do Spriter escrito: as imagens soltas entram na aba
 * Imagens, com o caminho que o `.scml` escreve (`bot/01 (6)`), e as que o
 * boneco usa ganham região — a mesma região provisória da pasta do projeto
 * (lote 60). Dois passos, porque o segundo precisa do documento já trocado:
 *
 * | Passo | Função | Quando |
 * |:---:|:---|:---|
 * | 1 | `importForeignProject(files, relPaths?)` | no lugar do `importForeignFiles` |
 * | 2 | `adoptForeignImages(doc, importado)` | logo depois do `setFile` |
 *
 * Com atlas (Spine, DragonBones) o passo 2 não faz nada: as imagens de lá são
 * páginas, e o atlas já as corta.
 */

/** O que o passo 1 devolve: o de sempre, mais as imagens soltas da pasta. */
export interface ForeignProject extends ForeignImport {
  /** As imagens que vieram junto, com o nome relativo ao arquivo do projeto. Vazio quando há atlas. */
  looseImages: FolderImage[];
  /** A pasta em que o projeto estava, para o aviso dizer onde procurou. Vazio sem pasta. */
  folderName: string;
  /**
   * A pasta escolhida, com escrita — rodada 45, lote 3 (S5). Com ela o projeto
   * importado já mora na pasta do Spriter, e o Salvar grava o .bone ao lado do
   * .scml, sem tocar nele. Ausente quando vieram arquivos soltos.
   */
  folderHandle?: FolderDirectoryHandle;
}

// ---------------------------------------------------------------------------
// A pasta do projeto de fora — rodada 45, lote 3 (doc 57, T8 e T10)
// ---------------------------------------------------------------------------

/** Uma entrada de pasta, como o `showDirectoryPicker` a dá (ou um teste a monta). */
export interface ForeignDirEntry {
  readonly kind?: string;
  readonly name: string;
  values?(): AsyncIterable<ForeignDirEntry>;
  getFile?(): Promise<File>;
}

/** O que serve de uma pasta de projeto: os arquivos de projeto e atlas, e as imagens. */
function serveDeFora(name: string): boolean {
  const lower = lower_(name);
  return [...PROJECT_TYPES, ...IMAGE_TYPES].some((ext) => lower.endsWith(ext));
}
function lower_(name: string): string {
  return name.toLowerCase();
}

/**
 * Varre a pasta e as subpastas, com o caminho de cada arquivo a partir dela
 * (`bot/01 (6).png`). Só o que serve: projeto, atlas, imagem. Pastas
 * escondidas e de sistema ficam de fora, como na pasta do projeto.
 */
export async function arquivosDaPasta(
  dir: ForeignDirEntry, prefixo = '',
): Promise<Array<{ file: File; path: string }>> {
  const out: Array<{ file: File; path: string }> = [];
  if (dir.values === undefined) return out;
  for await (const entry of dir.values()) {
    if (entry.kind === 'directory' || (entry.kind === undefined && entry.values !== undefined)) {
      if (skipFolderEntry(entry.name)) continue;
      out.push(...await arquivosDaPasta(entry, `${prefixo}${entry.name}/`));
      continue;
    }
    if (!serveDeFora(entry.name) || entry.getFile === undefined) continue;
    try {
      out.push({ file: await entry.getFile(), path: `${prefixo}${entry.name}` });
    } catch {
      // Sem permissão, ou apagado no meio: fica de fora, e o aviso das imagens diz qual.
    }
  }
  return out;
}

/**
 * Os arquivos de projeto na RAIZ da pasta: o `.scml` e o `.scon` do Spriter,
 * o `.json` do Spine e do DragonBones. A textura do DragonBones (`_tex.json`)
 * e o atlas não são projeto.
 */
export function projetosNaRaiz(paths: readonly string[]): string[] {
  return paths.filter((path) => {
    if (path.includes('/')) return false;
    const lower = lower_(path);
    if (lower.endsWith('_tex.json') || lower.endsWith('.atlas.json')) return false;
    return lower.endsWith('.scml') || lower.endsWith('.scon') || lower.endsWith('.json');
  });
}

interface ForeignFolderPicker {
  showDirectoryPicker?(options?: unknown): Promise<ForeignDirEntry>;
}

/** `true` quando o navegador escolhe pasta (Chrome, Edge). */
export function hasForeignFolderPicker(): boolean {
  return typeof (globalThis as unknown as ForeignFolderPicker).showDirectoryPicker === 'function';
}

/** Pede a pasta do projeto de fora. Os caminhos saem com o nome dela na frente. `null` = fechou. */
export async function pickForeignFolder(): Promise<{
  name: string; handle: FolderDirectoryHandle; files: Array<{ file: File; path: string }>;
} | null> {
  const w = globalThis as unknown as ForeignFolderPicker;
  if (typeof w.showDirectoryPicker !== 'function') return null;
  let handle: ForeignDirEntry;
  try {
    handle = await w.showDirectoryPicker({ id: 'recorte-de-fora', mode: 'readwrite' });
  } catch {
    return null;
  }
  const files = (await arquivosDaPasta(handle)).map((entry) => ({ file: entry.file, path: `${handle.name}/${entry.path}` }));
  return { name: handle.name, handle: handle as unknown as FolderDirectoryHandle, files };
}

/**
 * **O relatório do importar, em palavras de usuário** — rodada 45, lote 3 (T10).
 *
 * O Spriter de verdade dava 28 linhas, dez delas iguais a menos do nome
 * (*"O osso "bone_000" troca de pai…"*), com número de seção e a palavra
 * *timeline*. Aqui as linhas que só mudam no nome entre aspas viram UMA, com a
 * conta e os nomes; sai o número de seção; *timeline* vira "chaves".
 */
export function agruparAvisos(lines: readonly string[]): string[] {
  const limpar = (line: string): string => line
    .replace(/ uma timeline "parent"/g, ' chaves de troca de pai')
    .replace(/ uma timeline "slot\/bone"/g, ' chaves de troca de osso')
    .replace(/ timeline "([^"]*)"/g, ' chaves "$1"')
    .replace(/\s*\((spec )?\d+(\.\d+)*\)/g, '');
  const grupos = new Map<string, { exemplo: string; vezes: number; nomes: string[] }>();
  for (const line of lines) {
    const limpa = limpar(line);
    const nome = /"([^"]*)"/.exec(limpa)?.[1];
    const chave = limpa.replace(/"[^"]*"/, '"…"');
    const grupo = grupos.get(chave);
    if (grupo === undefined) {
      grupos.set(chave, { exemplo: limpa, vezes: 1, nomes: nome === undefined ? [] : [nome] });
    } else {
      grupo.vezes++;
      if (nome !== undefined && !grupo.nomes.includes(nome)) grupo.nomes.push(nome);
    }
  }
  const out: string[] = [];
  for (const [chave, grupo] of grupos) {
    if (grupo.vezes <= 1) {
      out.push(grupo.exemplo);
      continue;
    }
    // Rodada 45, lote 5 (doc 72, b): o primeiro nome NA frase, e os outros logo
    // depois dele: "O osso "bone_000" (e mais 9: bone_002, …) troca de pai".
    const outros = grupo.nomes.slice(1);
    const lista = outros.slice(0, 5).join(', ') + (outros.length > 5 ? ` e mais ${outros.length - 5}` : '');
    const junto = outros.length === 0 ? '' : ` (e mais ${outros.length}: ${lista})`;
    out.push(`${grupo.vezes} vezes: ${chave.replace('"…"', `"${grupo.nomes[0]}"${junto}`)}`);
  }
  return out;
}

/** A barra do Windows vira `/`, e sai a `/` do começo (o `fullPath` do arrasto começa com uma). */
function cleanPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+/, '');
}

/**
 * O caminho de uma imagem visto da pasta do projeto — é assim que o Spriter o
 * escreve. `game/bcp.scml` + `game/bot/01 (6).png` → `bot/01 (6).png`. Uma
 * imagem fora da pasta do projeto fica com o caminho que tem.
 */
export function insideProject(projectPath: string, imagePath: string): string {
  const project = cleanPath(projectPath);
  const image = cleanPath(imagePath);
  const cut = project.lastIndexOf('/');
  if (cut < 0) return image;
  const dir = project.slice(0, cut + 1);
  return image.startsWith(dir) ? image.slice(dir.length) : image;
}

/** O caminho de um arquivo no que foi escolhido ou solto: o de fora, o `webkitRelativePath`, ou o nome. */
function pathOf(file: File, index: number, relPaths?: readonly string[]): string {
  const given = relPaths?.[index];
  if (given !== undefined && given !== '') return cleanPath(given);
  const inside = (file as File & { webkitRelativePath?: string }).webkitRelativePath;
  return cleanPath(inside !== undefined && inside !== '' ? inside : file.name);
}

/**
 * O passo 1: converte o projeto e separa as imagens soltas.
 *
 * `relPaths`, quando vem, dá o caminho de cada arquivo (na mesma ordem) — é o
 * que a casca tem ao abrir uma PASTA. Sem ele vale o `webkitRelativePath` do
 * arrasto de pasta, e depois o nome do arquivo.
 */
export async function importForeignProject(
  files: readonly File[], relPaths?: readonly string[], parte?: string,
): Promise<ForeignProject> {
  const imported = await importForeignFiles(files, undefined, parte);
  const at = files.findIndex((file) => file.name === imported.projectName && !isImage(file.name));
  const projectPath = at < 0 ? imported.projectName : pathOf(files[at]!, at, relPaths);
  const cut = projectPath.lastIndexOf('/');
  const folderName = cut < 0 ? '' : projectPath.slice(0, cut).split('/').pop() ?? '';
  const looseImages = imported.atlasFile !== null
    ? []
    : files.flatMap((file, i) => (isFolderImage(file.name)
      ? [imageFromFile(file, insideProject(projectPath, pathOf(file, i, relPaths)))]
      : []));
  return { ...imported, looseImages, folderName };
}

/** O resultado do passo 2. `notice` é UMA frase, ou `null` quando não havia imagem solta. */
export interface AdoptedImages {
  shown: number;
  missing: string[];
  notice: string | null;
}

/**
 * O passo 2: as imagens soltas vão para a aba Imagens, e as que o boneco usa
 * ganham região — a cena é trocada uma vez só (`ensureProvisionalMany`).
 * `onProgress` conta as imagens lidas, para a casca dizer "12 de 20".
 */
export async function adoptForeignImages(
  doc: EditorDoc, imported: ForeignProject, onProgress?: (done: number, total: number) => void,
): Promise<AdoptedImages> {
  if (imported.looseImages.length === 0) {
    // QA 04/11/2026 (D23): o .scml sozinho, sem imagem nenhuma, saía calado —
    // só "184 avisos". As que o boneco usa e nenhum atlas tem: a frase diz.
    const faltam = [...imagesInUse(doc.file)].filter((name) => findAtlasRegion(doc.atlases, name) === null);
    if (faltam.length === 0) return { shown: 0, missing: [], notice: null };
    return {
      shown: 0, missing: faltam,
      notice: looseImagesNotice(FORMAT_LABELS[imported.format], 0, faltam, imported.folderName ?? '', imported.folderHandle !== undefined),
    };
  }
  // Rodada 45, lote 3: com a pasta escolhida, o projeto mora nela (S5).
  setProjectFolder(doc, {
    name: imported.folderName, handle: imported.folderHandle ?? null,
    images: new Map(imported.looseImages.map((image) => [image.name, image])),
  });
  const { made, missing } = await ensureProvisionalMany(doc, imagesInUse(doc.file), onProgress);
  return {
    shown: made.length,
    missing,
    notice: looseImagesNotice(FORMAT_LABELS[imported.format], made.length, missing, imported.folderName, imported.folderHandle !== undefined),
  };
}

/**
 * **A frase do rodapé depois de importar** — QA de 04/11/2026 (D23). O rodapé
 * mostra a primeira frase que cabe; quando falta imagem, a frase das imagens
 * (com o conselho de soltar a PASTA) vem primeiro, e o nome do arquivo depois.
 */
export function importedStatusLine(program: string, path: string, adopted: AdoptedImages, extra = ''): string {
  const nome = `Importado do ${program}: ${path}.${extra === '' ? '' : ` ${extra}`}`;
  if (adopted.notice === null) return nome;
  return adopted.missing.length > 0 ? `${adopted.notice} ${nome}` : `${nome} ${adopted.notice}`;
}

/**
 * A frase do rodapé. **Uma** frase, e não um aviso por imagem: o projeto de
 * verdade dava 176 linhas iguais, e 176 linhas iguais não são lidas. Quando
 * falta alguma, diz QUAIS (as cinco primeiras) e ONDE procurou.
 */
export function looseImagesNotice(
  program: string, shown: number, missing: readonly string[], folder: string, pelaPasta = false,
): string {
  const total = shown + missing.length;
  const onde = folder === '' ? 'entre os arquivos que vieram junto' : `na pasta "${folder}"`;
  if (missing.length === 0) {
    return shown === 1
      ? 'A imagem que o boneco usa veio junto e está na cena e na aba Imagens.'
      : `As ${shown} imagens que o boneco usa vieram junto e estão na cena e na aba Imagens.`;
  }
  const primeiras = missing.slice(0, 5).map((name) => `"${name}"`).join(', ');
  const mais = missing.length > 5 ? ` e mais ${missing.length - 5}` : '';
  const faltam = missing.length === 1 ? 'Falta 1' : `Faltam ${missing.length}`;
  // Rodada 45, lote 3: com a PASTA escolhida, mandar soltar a pasta não ajuda —
  // a imagem não está nela. Diz onde pôr, e o Recarregar.
  const conselho = pelaPasta
    ? `Ponha ${missing.length === 1 ? 'a imagem' : 'as imagens'} na pasta, nesse caminho, e aperte Recarregar.`
    : 'Solte a PASTA do projeto inteira, e não só os arquivos de dentro.';
  return `${shown} de ${total} imagens do boneco estão na cena. ${faltam}: ${primeiras}${mais}. `
    + `Procurei ${onde}, pelo caminho que o ${program} escreve (${missing[0]}.png). `
    + conselho;
}
