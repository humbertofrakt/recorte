/**
 * A última exportação, para poder repetir (dono A) — item 103.
 *
 * Exportar é um gesto que se repete dez vezes por tarde: mexeu na animação,
 * exporta de novo para ver no jogo. As opções são sempre as mesmas, e responder
 * às mesmas cinco perguntas dez vezes é o tipo de atrito que faz alguém parar de
 * conferir no jogo.
 *
 * `Ctrl+Shift+E` repete a última, sem perguntar nada. Sem nenhuma guardada, ele
 * abre a janela normal — nunca adivinha.
 *
 * Guardado no NAVEGADOR, e não no `.bone`: são opções de quem exporta, não do
 * personagem. Um arquivo que carregasse "exportar em 20 quadros por segundo"
 * levaria essa escolha para quem o recebesse.
 */

/** Os três tipos de exportação que o editor faz. */
export type ExportKind = 'imagem' | 'gltf' | 'pele';

/** Onde tudo isto mora no navegador. */
export const LAST_EXPORT_KEY = 'RECORTE_last_export';

/** O que foi guardado: as opções, e quando. */
export interface LastExport {
  kind: ExportKind;
  /** As opções da janela daquele tipo, como elas foram enviadas. */
  options: Record<string, unknown>;
  /** Milissegundos, para a dica poder dizer "de dois minutos atrás". */
  savedAt: number;
}

type Store = Pick<Storage, 'getItem' | 'setItem'>;

function storage(): Store | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Lê o guardado, aceitando lixo: qualquer coisa estranha vira vazio. */
export function parseLastExports(saved: unknown): Partial<Record<ExportKind, LastExport>> {
  if (saved === null || typeof saved !== 'object') return {};
  const out: Partial<Record<ExportKind, LastExport>> = {};
  for (const kind of ['imagem', 'gltf', 'pele'] as const) {
    const raw = (saved as Record<string, unknown>)[kind];
    if (raw === null || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    if (item['options'] === null || typeof item['options'] !== 'object') continue;
    out[kind] = {
      kind,
      options: item['options'] as Record<string, unknown>,
      savedAt: typeof item['savedAt'] === 'number' ? item['savedAt'] : 0,
    };
  }
  return out;
}

function readAll(): Partial<Record<ExportKind, LastExport>> {
  const store = storage();
  if (store === null) return {};
  try {
    const text = store.getItem(LAST_EXPORT_KEY);
    return text === null ? {} : parseLastExports(JSON.parse(text));
  } catch {
    return {};
  }
}

/** Guarda as opções desta exportação. */
export function saveLastExport(
  kind: ExportKind, options: Record<string, unknown>, now = Date.now(),
): void {
  const all = readAll();
  all[kind] = { kind, options, savedAt: now };
  const store = storage();
  if (store === null) return;
  try {
    store.setItem(LAST_EXPORT_KEY, JSON.stringify(all));
  } catch {
    // Cota cheia ou armazenamento negado: a exportação já aconteceu, e é isso
    // que importa. Repetir vai pedir as opções de novo.
  }
}

/** As opções da última exportação daquele tipo, ou `null`. */
export function loadLastExport(kind: ExportKind): LastExport | null {
  return readAll()[kind] ?? null;
}

/** A última de todas, seja de que tipo for, ou `null`. */
export function loadMostRecentExport(): LastExport | null {
  let best: LastExport | null = null;
  for (const item of Object.values(readAll())) {
    if (item === undefined) continue;
    if (best === null || item.savedAt > best.savedAt) best = item;
  }
  return best;
}

/** Esquece tudo. Para teste, e para o dia em que houver um botão. */
export function forgetLastExports(): void {
  const store = storage();
  if (store === null) return;
  try {
    store.setItem(LAST_EXPORT_KEY, '{}');
  } catch {
    // Sem armazenamento não havia o que esquecer.
  }
}

/** O nome que se lê de cada tipo, para a barra de baixo e para a dica. */
export const EXPORT_LABELS: Readonly<Record<ExportKind, string>> = Object.freeze({
  imagem: 'imagem',
  gltf: 'glTF',
  pele: 'por skin',
});
