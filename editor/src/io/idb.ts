/**
 * O IndexedDB mínimo: guardar, ler e apagar um arquivo (dono A) — item 62.
 *
 * A imagem de referência é um PNG inteiro. Ele NÃO pode ir para o `.bone`: o
 * `.bone` é do personagem, e quem receber o arquivo não tem por que receber
 * junto a fotografia que alguém usou de guia. E não cabe no `localStorage`, que
 * é texto e tem cinco megabytes contados.
 *
 * Então: IndexedDB, uma loja só, chave de texto, valor `Blob`. Três funções e
 * mais nada — este arquivo não vai virar uma camada de banco de dados.
 *
 * Tudo devolve em vez de explodir. Aba anônima, cota cheia e navegador com o
 * armazenamento desligado são casos normais aqui: sem a referência o editor
 * segue inteiro, só sem a imagem atrás.
 */

const DB_NAME = 'recorte';
const DB_VERSION = 1;
const STORE = 'arquivos';

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      const idb = (globalThis as { indexedDB?: IDBFactory }).indexedDB;
      if (idb === undefined) { resolve(null); return; }
      request = idb.open(DB_NAME, DB_VERSION);
    } catch {
      resolve(null);
      return;
    }
    request.onupgradeneeded = (): void => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    request.onsuccess = (): void => resolve(request.result);
    request.onerror = (): void => resolve(null);
    // Uma aba antiga segurando a versão anterior travaria isto para sempre.
    request.onblocked = (): void => resolve(null);
  });
}

function run<T>(
  mode: IDBTransactionMode, body: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T | null> {
  return openDb().then((db) => {
    if (db === null) return null;
    return new Promise<T | null>((resolve) => {
      let request: IDBRequest<T>;
      try {
        request = body(db.transaction(STORE, mode).objectStore(STORE));
      } catch {
        db.close();
        resolve(null);
        return;
      }
      request.onsuccess = (): void => { resolve(request.result ?? null); db.close(); };
      request.onerror = (): void => { resolve(null); db.close(); };
    });
  });
}

/** Guarda o arquivo naquela chave. `false` quando o navegador recusou. */
export async function idbPut(key: string, blob: Blob): Promise<boolean> {
  return (await run('readwrite', (store) => store.put(blob, key))) !== null;
}

/** O arquivo daquela chave, ou `null` — inclusive quando não há banco. */
export async function idbGet(key: string): Promise<Blob | null> {
  const value = await run<unknown>('readonly', (store) => store.get(key) as IDBRequest<unknown>);
  return value instanceof Blob ? value : null;
}

/**
 * Guarda um valor qualquer — anotação 22, lote 33.
 *
 * Existe por causa do `FileSystemFileHandle` dos arquivos recentes: ele não é
 * texto, não cabe no `localStorage`, e o navegador sabe guardá-lo aqui do
 * mesmo jeito que guarda um `Blob`. É a mesma loja e a mesma promessa: nunca
 * estoura, e devolve `false` quando o navegador recusou.
 */
export async function idbPutValue(key: string, value: unknown): Promise<boolean> {
  return (await run('readwrite', (store) => store.put(value, key))) !== null;
}

/** O valor daquela chave, ou `null` — inclusive quando não há banco. */
export async function idbGetValue(key: string): Promise<unknown | null> {
  const value = await run<unknown>('readonly', (store) => store.get(key) as IDBRequest<unknown>);
  return value ?? null;
}

/** Apaga. Apagar o que não existe é sucesso: o fim é o mesmo. */
export async function idbDelete(key: string): Promise<void> {
  await run('readwrite', (store) => store.delete(key));
}
