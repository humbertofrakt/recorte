/**
 * A pasta do projeto com `manifest.json` (dono A) — degrau 4b (17/09/2026).
 *
 * `ARQUITETO 3` §1.3, saída **a**: a pasta de trabalho é o `.bonez` aberto. Um
 * `manifest.json` na raiz, um `.bone` por corpo e por entidade ao lado, um
 * atlas. Abrir a pasta lê o manifesto, abre cada corpo da lista **Corpos**
 * (cada um pelo mesmo `readOpenedFiles` de sempre, com o atlas e as páginas
 * da raiz), e monta o projeto em volta do documento que a casca segura. Sem
 * manifesto, a pasta abre como antes (lote 62): o `.bone` lembrado, ou vazia.
 *
 * Salvar grava o `.bone` em foco como sempre e, quando o projeto tem mais de
 * um arquivo, os outros corpos e o `manifest.json` ao lado — `main` é o corpo
 * em foco, `skeletons` são todos, e as listas vão em `extras.RECORTE_projeto`.
 * Um projeto de um corpo só não ganha manifesto: o herói salva como hoje.
 *
 * Duas metades, como em `project-folder.ts`: a conta, pura (`projectFilesToSave`,
 * `readManifestText`), e a pasta, pelo navegador.
 */

import { parseBoneText } from '../../../runtime/src/index.js';
import type { BoneFile } from '../../../runtime/src/index.js';
import { Doc } from '../doc/document.js';
import { isProjectManifest, readProjectLists, writeProjectLists } from '../doc/projeto.js';
import type { ProjectLists, ProjectManifest, Projeto } from '../doc/projeto.js';
import { isEmptyMontagem, readMontagem, writeMontagem } from '../doc/montagem.js';
import type { Montagem } from '../doc/montagem.js';
import { readOpenedFiles } from './open-save.js';
import type { OpenedDocument } from './open-save.js';
import { boneFilesInFolder } from './project-folder.js';
import type { FolderDirectoryHandle, FolderFileHandle } from './project-folder.js';

/** O nome do manifesto na raiz da pasta (spec 2.9). */
export const MANIFEST_NAME = 'manifest.json';

// ---------------------------------------------------------------------------
// A uri do corpo e o caminho na pasta — degrau 10, tarefa 10.7
// ---------------------------------------------------------------------------

/**
 * **Duas palavras para a mesma coisa, e vale a pena separá-las** (10.7).
 *
 * A **uri** é o que uma chave `body` escreve (`lobisomem.bone`), e é por ela
 * que o `Actor` do runtime acha o corpo: ele casa pela `value` crua (9.13). O
 * **caminho** é onde o arquivo está dentro da pasta do projeto
 * (`corpos/lobisomem.bone`), e é o que o `manifest.json` lista (2.9) e o que o
 * Salvar grava. Os dois só diferem quando o corpo em foco tem
 * `assets.skeletonsBase` (2.8) — num projeto que o editor mesmo criou a base é
 * vazia e os dois são a mesma string.
 *
 * A suposição 1 do degrau 4b — *"o uri da chave `body` é o nome do arquivo na
 * raiz, sem passar por `skeletonsBase`"* — fecha aqui: as chaves do projeto
 * continuam sendo a uri crua (o `Actor` não muda), e a tradução para caminho
 * acontece nas duas pontas do disco, ao abrir e ao salvar.
 */
export function skeletonsBaseOf(file: BoneFile | null | undefined): string {
  const base = file?.assets?.skeletonsBase;
  if (typeof base !== 'string' || base.length === 0) return '';
  return base.endsWith('/') ? base : `${base}/`;
}

/** Junção `base + uri` da §2.8. Base vazia devolve a uri como está. */
export function joinBase(base: string, uri: string): string {
  if (base.length === 0) return uri;
  return base.endsWith('/') ? base + uri : `${base}/${uri}`;
}

/** O caminho de volta em uri: tira a base, quando o caminho começa por ela. */
export function uriOfPath(base: string, path: string): string {
  if (base.length === 0 || !path.startsWith(base)) return path;
  return path.slice(base.length);
}

// ---------------------------------------------------------------------------
// A conta, sem navegador
// ---------------------------------------------------------------------------

/** O manifesto lido do texto, ou `null` quando o texto não é um manifesto. */
export function readManifestText(text: string): ProjectManifest | null {
  try {
    const parsed = parseBoneText(text) as unknown;
    return isProjectManifest(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Um arquivo que o Salvar grava ao lado do `.bone` em foco. */
export interface ProjectFile {
  name: string;
  text: string;
}

/**
 * **O que o Salvar grava além do `.bone` em foco** — a pasta inteira (10.1).
 *
 * Um `.bone` por corpo, um `.bone` por entidade que o projeto tenha aberto, e
 * o `manifest.json` com as listas. Vazio para um projeto de um corpo só sem
 * entidade nenhuma — o herói continua salvando como hoje, e o passo 13 do
 * roteiro compara a mesma pasta de sempre (suposição 3 do degrau 4b).
 *
 * `mainName` é o nome com que o foco foi gravado (pode ser um Salvar como).
 * Os nomes que saem são **caminhos** na pasta: a uri de cada corpo passa pelo
 * `skeletonsBase` do foco (10.7).
 */
export function projectFilesToSave(projeto: Projeto, mainName: string): ProjectFile[] {
  // Rodada 39: a montagem de teste só existe no manifesto — sem ele, ela se
  // perderia no Salvar, calada.
  const montagem = readMontagem(projeto.manifesto);
  if (!projeto.temVarios && isEmptyMontagem(montagem)) return [];
  const out: ProjectFile[] = [];
  const lists: ProjectLists = projeto.lists;
  const base = skeletonsBaseOf(projeto.emFoco.file);
  const focoUri = lists.emFoco;
  // O foco pode ter sido salvo com outro nome: as listas seguem o nome novo.
  const pathOf = (uri: string): string => (uri === focoUri ? mainName : joinBase(base, uri));
  const corpos = lists.corpos.map(pathOf);
  for (const uri of projeto.outrosCorpos) {
    const doc = projeto.docOf(uri);
    if (doc === null) continue;
    out.push({ name: pathOf(uri), text: doc.serialize() });
  }
  // As entidades que o projeto abriu (E17, E4): elas também moram na pasta.
  // Entidade que ninguém leu não tem texto para gravar, e é só uma linha da
  // lista — o arquivo dela continua onde estava.
  for (const uri of lists.entidades) {
    const doc = projeto.guardados.get(uri);
    if (doc === undefined) continue;
    out.push({ name: pathOf(uri), text: doc.serialize() });
  }
  const manifest = writeProjectLists(projeto.manifesto, {
    corpos, entidades: lists.entidades.map(pathOf), emFoco: mainName,
  });
  writeMontagem(manifest, montagemMapped(montagem, pathOf));
  out.push({ name: MANIFEST_NAME, text: `${JSON.stringify(manifest, null, 2)}\n` });
  return out;
}

/**
 * A montagem com os uris trocados — rodada 39. No manifesto ela fala em
 * **caminhos** na pasta, como as listas; dentro do editor, em **uris**.
 */
export function montagemMapped(montagem: Montagem, map: (uri: string) => string): Montagem {
  return {
    ...montagem,
    ligacoes: montagem.ligacoes.map((l) => ({ host: map(l.host), slot: l.slot, uri: map(l.uri) })),
    acima: montagem.acima.map((a) => ({ base: map(a.base), uri: map(a.uri), slot: a.slot })),
  };
}

// ---------------------------------------------------------------------------
// A pasta, pelo navegador
// ---------------------------------------------------------------------------

/** O manifesto da raiz da pasta, ou `null` quando não há um. */
export async function readManifestInFolder(directory: FolderDirectoryHandle): Promise<ProjectManifest | null> {
  for await (const entry of directory.values()) {
    if (entry.kind === 'directory' || entry.name !== MANIFEST_NAME) continue;
    const file = await (entry as FolderFileHandle).getFile();
    return readManifestText(await file.text());
  }
  return null;
}

/** O projeto lido da pasta: cada corpo aberto, e o handle do `.bone` em foco. */
export interface OpenedProject {
  manifest: ProjectManifest;
  lists: ProjectLists;
  /** Cada corpo da lista, pelo uri, já lido. Corpo que não está na pasta fica de fora. */
  bodies: Map<string, OpenedDocument>;
  /** Cada entidade da lista que a pasta tinha, pelo uri. Fechadas: ninguém as edita. */
  entities: Map<string, OpenedDocument>;
  /** O handle do `.bone` em foco, para o `Ctrl+S` gravar de volta nele. */
  mainHandle: FolderFileHandle | null;
  /** O que faltou: corpo listado que a pasta não tem, arquivo que não abriu. */
  warnings: string[];
}

/**
 * **Um `.bone` da pasta, descendo subpastas** — 10.7.
 *
 * `boneFilesInFolder` só olha a raiz (lote 62). Um corpo em `corpos/lobo.bone`
 * precisa que se desça até a subpasta; o atlas dele resolve contra a pasta
 * dele (2.8), e o atlas da RAIZ vai junto, porque o projeto tem um atlas só.
 */
export async function boneInFolder(
  root: FolderDirectoryHandle, path: string,
): Promise<{ files: File[]; handle: FolderFileHandle } | null> {
  const parts = path.split('/').filter((part) => part.length > 0);
  const name = parts.pop();
  if (name === undefined) return null;
  let here = root;
  for (const part of parts) {
    if (typeof here.getDirectoryHandle !== 'function') return null;
    try {
      here = await here.getDirectoryHandle(part);
    } catch {
      return null;
    }
  }
  const found = await boneFilesInFolder(here, name);
  if (found === null || parts.length === 0) return found;
  // O atlas do projeto mora na raiz: sem ele o corpo da subpasta abriria sem
  // imagem nenhuma, e ninguém saberia por quê (regra 21).
  const naRaiz = await boneFilesInFolder(root, name).catch(() => null);
  const jaTem = new Set(found.files.map((file) => file.name));
  for (const file of naRaiz?.files ?? []) if (!jaTem.has(file.name)) found.files.push(file);
  return found;
}

/**
 * Lê cada corpo e cada entidade do manifesto pela pasta, descendo subpastas.
 * `null` quando nem o corpo em foco está lá: aí a pasta não é um projeto que
 * dê para abrir, e quem chamou cai no caminho de sempre.
 *
 * As listas do manifesto são **caminhos**; o que sai daqui são **uris**, a
 * base tirada pelo `skeletonsBase` do corpo em foco (10.7).
 */
export async function openProjectFiles(
  directory: FolderDirectoryHandle, manifest: ProjectManifest,
): Promise<OpenedProject | null> {
  const paths = readProjectLists(manifest);
  const warnings: string[] = [];
  const ler = async (path: string, oQue: string): Promise<{ opened: OpenedDocument; handle: FolderFileHandle } | null> => {
    const found = await boneInFolder(directory, path);
    if (found === null) {
      warnings.push(`O ${oQue} ${path} está no manifesto, mas não na pasta.`);
      return null;
    }
    try {
      const opened = await readOpenedFiles(found.files);
      if (opened === null) return null;
      warnings.push(...opened.warnings);
      return { opened, handle: found.handle };
    } catch (error) {
      warnings.push(`Não deu para abrir ${path}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  };

  // O foco primeiro: é ele que diz qual é a base das uris dos outros (2.8).
  const main = await ler(paths.emFoco, 'corpo');
  if (main === null) return null;
  const base = skeletonsBaseOf(main.opened.file);
  const emFoco = uriOfPath(base, paths.emFoco);

  const bodies = new Map<string, OpenedDocument>([[emFoco, main.opened]]);
  const entities = new Map<string, OpenedDocument>();
  const corpos = [emFoco];
  for (const path of paths.corpos) {
    if (path === paths.emFoco) continue;
    const uri = uriOfPath(base, path);
    const lido = await ler(path, 'corpo');
    corpos.push(uri);
    if (lido !== null) bodies.set(uri, lido.opened);
  }
  const entidades: string[] = [];
  for (const path of paths.entidades) {
    const uri = uriOfPath(base, path);
    entidades.push(uri);
    const lido = await ler(path, 'arquivo de entidade');
    if (lido !== null) entities.set(uri, lido.opened);
  }
  const lists: ProjectLists = { corpos, entidades, emFoco };
  // Rodada 39: a montagem de teste vem em caminhos; o editor fala em uris.
  const montagem = readMontagem(manifest);
  if (!isEmptyMontagem(montagem)) writeMontagem(manifest, montagemMapped(montagem, (path) => uriOfPath(base, path)));
  return { manifest, lists, bodies, entities, mainHandle: main.handle, warnings };
}

/**
 * Monta o projeto lido em volta do documento em foco. Os corpos que a pasta
 * não tinha saem da lista (com o aviso de `openProjectFiles`); as entidades
 * ficam listadas mesmo fechadas.
 */
export function openProjectInto(projeto: Projeto, opened: OpenedProject): Doc {
  const bodies = new Map<string, { file: OpenedDocument['file']; options: Parameters<Doc['setFile']>[1] }>();
  for (const [uri, body] of opened.bodies) {
    bodies.set(uri, {
      file: body.file,
      options: { atlases: body.atlases, images: body.images, skeletons: body.skeletons },
    });
  }
  const lists: ProjectLists = {
    corpos: opened.lists.corpos.filter((uri) => bodies.has(uri)),
    entidades: opened.lists.entidades,
    emFoco: opened.lists.emFoco,
  };
  projeto.open(opened.manifest, lists, bodies);
  // Degrau 10: a entidade que a pasta trouxe fica **guardada inteira**, como o
  // corpo rebaixado do degrau 5. É o que faz Promover funcionar sem ler o disco
  // de novo (`promover` pergunta a `guardados`), e o que o Salvar grava.
  for (const [uri, body] of opened.entities ?? []) {
    if (projeto.corpos.has(uri) || projeto.guardados.has(uri)) continue;
    projeto.guardados.set(uri, new Doc(body.file, {
      path: uri, undo: projeto.undo,
      atlases: body.atlases, images: body.images, skeletons: body.skeletons,
    }));
  }
  return projeto.emFoco;
}

/** A frase do rodapé ao reabrir um projeto pela pasta. */
export function projectOpenedNotice(folder: string, lists: ProjectLists): string {
  const corpos = lists.corpos.length;
  const entidades = lists.entidades.length;
  const partes = [`${corpos} ${corpos === 1 ? 'base' : 'bases'}`];
  if (entidades > 0) partes.push(`${entidades} ${entidades === 1 ? 'entidade' : 'entidades'}`);
  return `Pasta ${folder}: projeto com ${partes.join(' e ')} reaberto, em foco ${lists.emFoco}`;
}
