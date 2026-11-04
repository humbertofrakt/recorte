/**
 * Os arquivos abertos há pouco — anotação 22, lote 33.
 *
 * **Arquivo → Abrir recente** era cinza desde sempre, com a dica dizendo "vem
 * no lote 4". O lote 4 passou há muito. Um programa que não lembra o que você
 * abriu ontem obriga a percorrer o seletor de arquivos toda vez, e é a primeira
 * coisa que falta ao chegar de qualquer outro programa.
 *
 * Duas metades, e a de cima é pura:
 *
 * - a **lista** — nome e quando —, que mora no `localStorage` como texto, tem
 *   no máximo cinco, não repete nome e traz o mais novo na frente;
 * - o **jeito de reabrir**, que é o `FileSystemFileHandle` do navegador. Ele
 *   não é texto e não cabe no `localStorage`: vai para o IndexedDB, que guarda
 *   objeto. Sem ele — navegador sem essa API, aba anônima — a lista continua
 *   valendo, e o clique abre o seletor já no nome certo.
 */

import { idbDelete, idbGetValue, idbPutValue } from './idb.js';

/** Onde a lista mora. Texto, e pequena de propósito. */
export const RECENT_KEY = 'RECORTE_recentes';

/** Quantos ficam. Cinco é o que se lê sem procurar. */
export const MAX_RECENT = 5;

/** Um arquivo da lista. */
export interface RecentFile {
  /** O nome do arquivo, com a extensão. É a chave: um nome, uma linha. */
  name: string;
  /** Quando ele foi aberto ou salvo, em milissegundos. */
  at: number;
}

/**
 * A lista com `name` na frente. Puro: entra uma lista, sai outra.
 *
 * O mesmo nome aberto de novo **sobe** em vez de duplicar, e a lista nunca
 * passa de `MAX_RECENT`.
 */
export function withRecent(
  list: readonly RecentFile[], name: string, at: number, max = MAX_RECENT,
): RecentFile[] {
  const limpo = name.trim();
  if (limpo === '') return [...list];
  const resto = list.filter((item) => item.name !== limpo);
  return [{ name: limpo, at }, ...resto].slice(0, Math.max(0, max));
}

/** Lê a lista do texto guardado. Texto estragado devolve lista vazia. */
export function parseRecent(raw: string | null): RecentFile[] {
  if (raw === null || raw.trim() === '') return [];
  try {
    const dados = JSON.parse(raw) as unknown;
    if (!Array.isArray(dados)) return [];
    const saida: RecentFile[] = [];
    for (const item of dados) {
      if (typeof item !== 'object' || item === null) continue;
      const { name, at } = item as { name?: unknown; at?: unknown };
      if (typeof name !== 'string' || name.trim() === '') continue;
      saida.push({ name, at: typeof at === 'number' && Number.isFinite(at) ? at : 0 });
    }
    return saida.slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

/** Onde a lista é guardada. `localStorage` serve; um Map serve nos testes. */
export interface RecentStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

function storage(): RecentStorage | null {
  try {
    const s = (globalThis as { localStorage?: RecentStorage }).localStorage;
    return s ?? null;
  } catch {
    // Navegador com armazenamento desligado. Sem lista, o resto do editor
    // continua inteiro — é o mesmo trato do rascunho.
    return null;
  }
}

/** A lista de agora, do mais novo para o mais velho. */
export function recentFiles(store: RecentStorage | null = storage()): RecentFile[] {
  if (store === null) return [];
  return parseRecent(store.getItem(RECENT_KEY));
}

/** Guarda a lista. */
function saveRecent(list: readonly RecentFile[], store: RecentStorage | null = storage()): void {
  if (store === null) return;
  try {
    store.setItem(RECENT_KEY, JSON.stringify(list));
  } catch {
    // Cota cheia: perder a lista dos recentes não pode derrubar um salvamento.
  }
}

/** A chave do jeito de reabrir, no IndexedDB. */
function handleKey(name: string): string {
  return `recente:${name}`;
}

/**
 * Anota que este arquivo foi aberto ou salvo agora.
 *
 * `handles` são os `FileSystemFileHandle` de **tudo o que foi aberto junto** —
 * o esqueleto e as imagens do atlas. Guardar só o `.bone` reabriria o
 * personagem sem os desenhos, que é pior do que não reabrir. Sem os handles
 * (navegador sem essa API) a linha vale do mesmo jeito: o clique abre o
 * seletor, e quem escolhe é a pessoa.
 */
export async function rememberRecent(name: string, handles: readonly unknown[] = []): Promise<void> {
  const antes = recentFiles();
  const lista = withRecent(antes, name, Date.now());
  saveRecent(lista);
  if (handles.length > 0) await idbPutValue(handleKey(name), [...handles]);
  // Quem CAIU da lista não continua ocupando lugar no banco.
  const vivos = new Set(lista.map((item) => item.name));
  for (const item of antes) {
    if (!vivos.has(item.name)) await idbDelete(handleKey(item.name));
  }
}

/** Os jeitos de reabrir este nome, ou lista vazia se não houver. */
export async function recentHandles(name: string): Promise<unknown[]> {
  const guardado = await idbGetValue(handleKey(name));
  return Array.isArray(guardado) ? guardado : [];
}

/** Esquece a lista inteira. Existe para o teste e para quem quiser limpar. */
export function forgetRecent(store: RecentStorage | null = storage()): void {
  saveRecent([], store);
}

/**
 * **As pastas primeiro** — rodada 45, lote 6 (doc `78`, d). A lista punha o
 * `rino.bone` (que abre sem as imagens) antes de "rino (pasta)". A pasta é o
 * projeto: ela vem primeiro; dentro de cada grupo, a ordem de antes.
 */
export function pastasPrimeiro<T extends { name: string }>(lista: readonly T[], ehPasta: (name: string) => boolean): T[] {
  return [...lista.filter((item) => ehPasta(item.name)), ...lista.filter((item) => !ehPasta(item.name))];
}
