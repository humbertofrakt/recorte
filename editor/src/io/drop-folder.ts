/**
 * Soltar uma PASTA na janela — rodada final, Ficha E, E3 (29/09/2026).
 *
 * O `drop` lia `dataTransfer.files`, e o navegador põe ali só o NOME de uma
 * pasta solta, sem nada de dentro. Quem soltava a pasta do projeto do Spriter
 * (`exemplo/game`: o `.scml` e as imagens em nove subpastas) entregava ao
 * programa um arquivo vazio chamado `game`. Descer na pasta é pelo
 * `webkitGetAsEntry` de cada item — o mesmo que o Spine e o Spriter deixam
 * fazer quando se arrasta a pasta do projeto.
 *
 * **As entradas têm de ser pegas DURANTE o evento**: depois dele o navegador
 * esvazia o `dataTransfer`. Por isso `dropEntries` é síncrona, e só a leitura
 * (`filesOfEntries`) é assíncrona.
 *
 * Os tipos abaixo são o pedaço do `FileSystemEntry` que se usa, e nada mais:
 * com eles o teste monta uma pasta de mentira sem navegador (regra 8).
 */

/** Uma entrada de arquivo: `fullPath` começa com `/`, como o navegador escreve. */
export interface DroppedFileEntry {
  readonly isFile: true;
  readonly isDirectory: false;
  readonly name: string;
  readonly fullPath: string;
  file(ok: (file: File) => void, fail?: (error: unknown) => void): void;
}

/** Uma entrada de pasta: lê os filhos em lotes, até vir um lote vazio. */
export interface DroppedDirectoryEntry {
  readonly isFile: false;
  readonly isDirectory: true;
  readonly name: string;
  readonly fullPath: string;
  createReader(): {
    readEntries(ok: (entries: DroppedEntry[]) => void, fail?: (error: unknown) => void): void;
  };
}

export type DroppedEntry = DroppedFileEntry | DroppedDirectoryEntry;

/** A vista estreita do `DataTransfer` que se usa. */
interface ItemList {
  readonly items?: ArrayLike<{ kind: string; webkitGetAsEntry?(): unknown }>;
}

/**
 * As entradas do arrasto, pegas agora, durante o evento. `null` quando o
 * navegador não sabe dar entrada — aí vale o `dataTransfer.files` de sempre.
 */
export function dropEntries(data: ItemList | null): DroppedEntry[] | null {
  const items = data?.items;
  if (items === undefined) return null;
  const out: DroppedEntry[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    if (item.kind !== 'file' || typeof item.webkitGetAsEntry !== 'function') return null;
    const entry = item.webkitGetAsEntry() as DroppedEntry | null;
    if (entry !== null) out.push(entry);
  }
  return out;
}

/** `true` quando alguma entrada é pasta: só então vale descer. */
export function hasFolder(entries: readonly DroppedEntry[]): boolean {
  return entries.some((entry) => entry.isDirectory);
}

/** Pasta que não se desce: escondida (`.git`) — o mesmo corte da pasta do projeto. */
function skipped(name: string): boolean {
  return name.startsWith('.') || name === 'node_modules';
}

function readAll(entry: DroppedDirectoryEntry): Promise<DroppedEntry[]> {
  const reader = entry.createReader();
  const all: DroppedEntry[] = [];
  return new Promise((done, fail) => {
    // O Chrome devolve no máximo cem por vez: lê até vir um lote vazio.
    const next = (): void => reader.readEntries((batch) => {
      if (batch.length === 0) { done(all); return; }
      all.push(...batch);
      next();
    }, fail);
    next();
  });
}

function fileOf(entry: DroppedFileEntry): Promise<File> {
  return new Promise((done, fail) => entry.file(done, fail));
}

/**
 * Todos os arquivos, descendo nas pastas. Cada um sai com `webkitRelativePath`
 * — `game/bot/01 (6).png` —, que é o que o resto do programa já lê quando uma
 * pasta entra pelo `<input webkitdirectory>`. Um arquivo que não se deixa ler
 * vai para `unread`, com o caminho: ninguém some calado (regra 21).
 */
export async function filesOfEntries(
  entries: readonly DroppedEntry[],
): Promise<{ files: File[]; unread: string[] }> {
  const files: File[] = [];
  const unread: string[] = [];
  const walk = async (entry: DroppedEntry): Promise<void> => {
    const path = entry.fullPath.replace(/^\/+/, '');
    if (entry.isDirectory) {
      if (skipped(entry.name)) return;
      let children: DroppedEntry[];
      try {
        children = await readAll(entry);
      } catch {
        unread.push(`${path}/`);
        return;
      }
      for (const child of children) await walk(child);
      return;
    }
    try {
      const file = await fileOf(entry);
      Object.defineProperty(file, 'webkitRelativePath', { value: path, configurable: true });
      files.push(file);
    } catch {
      unread.push(path);
    }
  };
  for (const entry of entries) await walk(entry);
  return { files, unread };
}

// ---------------------------------------------------------------------------
// Rodada 48 (a mão do Humberto, 07/10/2026): soltar a pasta `mao` abria o
// seletor do Windows perguntando a pasta. O arrasto traz a ALÇA da pasta
// (`getAsFileSystemHandle`, Chrome e Edge 86+): com ela a pasta solta abre como
// projeto, sem perguntar — o mesmo que Arquivo → Abrir pasta faz depois do
// seletor. Como o Spriter, que abre a pasta do projeto que se arrasta.
// ---------------------------------------------------------------------------

/** A vista estreita do item que dá alça. */
interface ItemComAlca {
  readonly kind: string;
  getAsFileSystemHandle?(): Promise<unknown>;
}

/**
 * Pede a alça de cada item **agora, durante o evento**: depois dele o
 * navegador esvazia o `dataTransfer`, como com as entradas. `null` quando o
 * navegador não dá alça (Firefox) — aí vale o caminho de antes.
 */
export function pedirAlcas(data: { readonly items?: ArrayLike<ItemComAlca> } | null): Promise<unknown>[] | null {
  const items = data?.items;
  if (items === undefined || items.length === 0) return null;
  const out: Promise<unknown>[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    if (item.kind !== 'file' || typeof item.getAsFileSystemHandle !== 'function') return null;
    out.push(item.getAsFileSystemHandle().catch(() => null));
  }
  return out;
}

/** O que fazer com o que se soltou. */
export type PlanoDaPastaSolta = { kind: 'abrir-pasta' } | { kind: 'importar' } | { kind: 'ler-arquivos' };

/** Um projeto de outro programa na raiz: Spriter (`.scml`, `.scon`), Spine (`.json` + `.atlas`), DragonBones (`_ske.json`). */
function projetoDeFora(raiz: readonly string[]): boolean {
  const tem = (re: RegExp): boolean => raiz.some((nome) => re.test(nome));
  if (tem(/\.(scml|scon)$/i) || tem(/_ske\.json$/i)) return true;
  return tem(/\.json$/i) && tem(/\.atlas(\.txt)?$/i);
}

/**
 * **A pasta solta: abrir, importar, ou ler como antes.** Puro.
 *
 * - Uma pasta só, com alça de pasta: **abre a pasta** como projeto.
 * - …mas com um projeto de outro programa na raiz (e nenhum `.bone` nosso):
 *   **importa**, como o arrasto já fazia (E2, 29/09).
 * - Sem alça (outro navegador), várias coisas, ou um arquivo: o caminho de antes.
 */
export function planoDaPastaSolta(
  entradas: readonly { readonly isDirectory: boolean }[],
  alcas: readonly unknown[] | null,
  raiz: readonly string[],
): PlanoDaPastaSolta {
  if (entradas.length !== 1 || !entradas[0]!.isDirectory) return { kind: 'ler-arquivos' };
  const alca = alcas?.[0] as { kind?: unknown } | null | undefined;
  if (alca === null || alca === undefined || alca.kind !== 'directory') return { kind: 'ler-arquivos' };
  const nosso = raiz.some((nome) => /\.bone$/i.test(nome) || nome.toLowerCase() === 'manifest.json');
  if (!nosso && projetoDeFora(raiz)) return { kind: 'importar' };
  return { kind: 'abrir-pasta' };
}

/** O rodapé depois de abrir a pasta solta. Sem licença de gravar, diz quando ela será pedida. */
export function avisoDaPastaSolta(nome: string, imagens: number, podeGravar: boolean): string {
  const quantas = imagens === 1 ? '1 imagem' : `${imagens} imagens`;
  const base = `A pasta ${nome} abriu como projeto, pelo arrasto: ${quantas} na aba Imagens`;
  return podeGravar ? base : `${base}. Para gravar nela, o Salvar vai pedir licença uma vez`;
}
