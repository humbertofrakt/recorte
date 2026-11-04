/**
 * Rascunho automático — para uma sessão de animação não acabar no lixo.
 *
 * Antes disso, fechar a aba, apertar F5 ou clicar num link com a barra de
 * estado dizendo "Arquivo não salvo" perdia tudo, em silêncio: não havia aviso
 * de saída, nem gravação automática, nem recuperação. Numa sessão de duas
 * horas isso é a diferença entre o programa servir e não servir.
 *
 * O que fica guardado é só o texto do `.bone`: nada de imagens, que são
 * grandes e continuam no disco de quem abriu. O guardador é passado de fora
 * (`Storage`), então tudo aqui é testável sem navegador.
 *
 * O rascunho é apagado quando o arquivo é salvo e quando o dono manda
 * descartar. Um rascunho velho demais também não é oferecido: acordar um
 * trabalho de duas semanas atrás assusta mais do que ajuda.
 */

/** Onde o rascunho mora. `localStorage` serve; um Map também, nos testes. */
export interface DraftStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const DRAFT_KEY = 'recorte.rascunho';

/** Um rascunho não é oferecido depois disto. Sete dias. */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Espera mínima entre duas gravações, para não gravar a cada tecla. */
export const DRAFT_THROTTLE_MS = 3000;

export interface Draft {
  /** Momento da gravação, em milissegundos do relógio do sistema. */
  savedAt: number;
  /** Nome mostrado ao dono ("heroi.bone", "sem nome"). */
  name: string;
  /** Caminho no disco, ou `null` para um arquivo que nunca foi salvo. */
  path: string | null;
  /** O `.bone` inteiro, como texto. */
  json: string;
}

/**
 * Grava o rascunho.
 *
 * Devolve `false` quando o guardador recusou — a aba anônima recusa, e a cota
 * cheia também. Recusar não pode derrubar o editor: quem não conseguiu gravar
 * segue trabalhando, só sem rede de proteção.
 */
export function writeDraft(storage: DraftStorage, draft: Draft): boolean {
  try {
    storage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

/** Apaga o rascunho. Chamado ao salvar e ao descartar. */
export function clearDraft(storage: DraftStorage): void {
  try {
    storage.removeItem(DRAFT_KEY);
  } catch {
    // Nada a fazer: sem guardador não há rascunho para apagar.
  }
}

/**
 * Lê o rascunho guardado, ou `null`.
 *
 * `null` também para lixo: texto que não é JSON, JSON sem os campos, ou um
 * rascunho mais velho que `DRAFT_MAX_AGE_MS`. Melhor não oferecer nada do que
 * oferecer uma coisa que não abre.
 */
export function readDraft(
  storage: DraftStorage,
  now: number = Date.now(),
  maxAge: number = DRAFT_MAX_AGE_MS,
): Draft | null {
  let raw: string | null;
  try {
    raw = storage.getItem(DRAFT_KEY);
  } catch {
    return null;
  }
  if (raw === null || raw === '') return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  return validDraft(parsed, now, maxAge);
}

/**
 * O rascunho lido de um valor qualquer, ou `null` para lixo e para velho
 * demais. O mesmo juízo para o rascunho atual e para os guardados (P55).
 */
function validDraft(parsed: unknown, now: number, maxAge: number): Draft | null {
  if (typeof parsed !== 'object' || parsed === null) return null;

  const draft = parsed as Partial<Draft>;
  if (typeof draft.json !== 'string' || draft.json === '') return null;
  if (typeof draft.savedAt !== 'number' || !Number.isFinite(draft.savedAt)) return null;
  if (now - draft.savedAt > maxAge) return null;
  // Um rascunho gravado "no futuro" é relógio trocado, não corrupção.

  return {
    savedAt: draft.savedAt,
    name: typeof draft.name === 'string' ? draft.name : 'sem nome',
    path: typeof draft.path === 'string' ? draft.path : null,
    json: draft.json,
  };
}

/**
 * Diz se já dá para gravar de novo.
 *
 * O editor chama isto a cada mudança do documento; sem a espera, arrastar um
 * osso gravaria o arquivo inteiro dezenas de vezes por segundo.
 */
export function shouldWriteDraft(
  lastWriteAt: number | null,
  now: number,
  throttle: number = DRAFT_THROTTLE_MS,
): boolean {
  if (lastWriteAt === null) return true;
  return now - lastWriteAt >= throttle;
}

/** "hoje às 14:32", "ontem às 09:05", "em 03/09/2026 às 22:10". */
export function describeDraftTime(savedAt: number, now: number = Date.now()): string {
  const then = new Date(savedAt);
  const hora = `${String(then.getHours()).padStart(2, '0')}:${String(then.getMinutes()).padStart(2, '0')}`;
  const dia = (d: Date): number => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dias = Math.round((dia(new Date(now)) - dia(then)) / (24 * 60 * 60 * 1000));
  if (dias <= 0) return `hoje às ${hora}`;
  if (dias === 1) return `ontem às ${hora}`;
  const data = then.toLocaleDateString('pt-BR');
  return `em ${data} às ${hora}`;
}

/**
 * O rótulo da mudança que `Doc.markSaved` emite — A3, 29/09/2026.
 *
 * É a ÚNICA mudança que apaga o rascunho. Antes, qualquer mudança com o
 * documento limpo apagava: escolher um osso, trocar de ferramenta, abrir outro
 * arquivo. A forma: *o ouvinte tratava "limpo" como "acabei de salvar"*.
 * Medido em 29/09, 00:20: herói mexido → recarregar → "Agora não" → trocar a
 * ferramenta → o rascunho do herói sumia.
 */
export const SAVED_LABEL = 'Salvo';

/** O que fazer com o rascunho quando o documento muda. */
export type DraftMove = 'gravar' | 'apagar' | 'deixar';

/**
 * Sujo grava; salvo apaga; o resto DEIXA. Um rascunho de outro trabalho — o
 * que a janela de recuperar ofereceu e a pessoa guardou para depois — não é
 * de quem está aberto agora, e ninguém o apaga sem ter salvo.
 */
export function draftMove(dirty: boolean, change: { kind: string; label?: string }): DraftMove {
  if (dirty) return 'gravar';
  return change.kind === 'file' && change.label === SAVED_LABEL ? 'apagar' : 'deixar';
}

/**
 * Grava ao fechar a aba? Só com o documento sujo — A3 e J13, 29/09/2026.
 *
 * Gravar sempre trocava o rascunho que havia pelo documento limpo, que não
 * tem nada a recuperar: salvar → recarregar → a janela oferecia "sem nome".
 * A forma: *a saída gravava o rascunho mesmo limpo*.
 */
export function draftOnExit(dirty: boolean): boolean {
  return dirty;
}

// ---------------------------------------------------------------------------
// Os rascunhos GUARDADOS — P55 (29/09/2026)
// ---------------------------------------------------------------------------

/**
 * **Nada que a pessoa fez se perde sem ela mandar** — decisão do Planejador,
 * 29/09/2026 (o defeito A2-1).
 *
 * O rascunho era UM só. Quem escolhia "Agora não — guardar o rascunho" e
 * depois mexia no documento novo gravava por cima do guardado, calado: o
 * trabalho recusado sumia, e a janela prometia o contrário. A forma: *a
 * promessa "guardar" morava num lugar que o próximo trabalho ocupava*.
 *
 * Agora "Agora não" COPIA o rascunho para uma lista de guardados. O atual
 * fica onde está (o roteiro confere isso desde o A2 do degrau 11), e o
 * trabalho novo pode gravar por cima dele: a cópia guardada não é tocada. A
 * janela de recuperar mostra os dois, sem repetir o mesmo. Guardado velho
 * demais (sete dias) sai sozinho, como o atual.
 */
export const KEPT_DRAFTS_KEY = 'recorte.rascunhos-guardados';

/** Os guardados que ainda valem, do mais novo para o mais velho. */
export function readKeptDrafts(
  storage: DraftStorage,
  now: number = Date.now(),
  maxAge: number = DRAFT_MAX_AGE_MS,
): Draft[] {
  let raw: string | null;
  try {
    raw = storage.getItem(KEPT_DRAFTS_KEY);
  } catch {
    return [];
  }
  if (raw === null || raw === '') return [];
  let lista: unknown;
  try {
    lista = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(lista)) return [];
  return lista
    .map((item) => validDraft(item, now, maxAge))
    .filter((draft): draft is Draft => draft !== null)
    .sort((a, b) => b.savedAt - a.savedAt);
}

/** Grava a lista de guardados. `false` quando o guardador recusou. */
function writeKeptDrafts(storage: DraftStorage, drafts: readonly Draft[]): boolean {
  try {
    if (drafts.length === 0) storage.removeItem(KEPT_DRAFTS_KEY);
    else storage.setItem(KEPT_DRAFTS_KEY, JSON.stringify(drafts));
    return true;
  } catch {
    return false;
  }
}

/**
 * Todos os rascunhos a oferecer: o atual primeiro, depois os guardados, do
 * mais novo para o mais velho.
 */
export function draftsToOffer(storage: DraftStorage, now: number = Date.now()): Draft[] {
  const atual = readDraft(storage, now);
  const guardados = readKeptDrafts(storage, now).filter((draft) => atual === null || !sameDraft(draft, atual));
  return [...(atual === null ? [] : [atual]), ...guardados];
}

/** O mesmo rascunho: a mesma hora e o mesmo texto. */
function sameDraft(a: Draft, b: Draft): boolean {
  return a.savedAt === b.savedAt && a.json === b.json;
}

/**
 * "Agora não — guardar": uma CÓPIA do rascunho atual vai para os guardados.
 * O atual fica. `false` quando o guardador recusou (cota cheia) — quem chama
 * diz isso, porque aí o trabalho novo PODE gravar por cima.
 */
export function keepCurrentDraft(storage: DraftStorage, now: number = Date.now()): boolean {
  const atual = readDraft(storage, now);
  if (atual === null) return true;
  const guardados = readKeptDrafts(storage, now);
  if (guardados.some((draft) => sameDraft(draft, atual))) return true;
  return writeKeptDrafts(storage, [atual, ...guardados]);
}

/**
 * Recuperar um guardado: ele volta a ser o atual, e o atual (se havia) vai
 * para os guardados no lugar dele. Troca, e não apaga. `null` quando o
 * guardado não está mais lá.
 */
export function takeKeptDraft(storage: DraftStorage, savedAt: number, now: number = Date.now()): Draft | null {
  const guardados = readKeptDrafts(storage, now);
  const escolhido = guardados.find((draft) => draft.savedAt === savedAt) ?? null;
  if (escolhido === null) return null;
  const atual = readDraft(storage, now);
  const resto = guardados.filter((draft) => draft !== escolhido);
  const guardarAtual = atual !== null && !guardados.some((draft) => sameDraft(draft, atual));
  // A ordem importa: se um passo falhar no meio, nada some. Primeiro o atual
  // entra nos guardados (o escolhido ainda está lá); depois o escolhido vira o
  // atual; só então ele sai da lista.
  if (guardarAtual && !writeKeptDrafts(storage, [atual as Draft, ...guardados])) return null;
  if (!writeDraft(storage, escolhido)) return null;
  writeKeptDrafts(storage, guardarAtual ? [atual as Draft, ...resto] : resto);
  return escolhido;
}

/** "Apagar os rascunhos": o atual e os guardados. Só quando a pessoa manda. */
export function clearAllDrafts(storage: DraftStorage): void {
  clearDraft(storage);
  writeKeptDrafts(storage, []);
}

/**
 * O nome de cada rascunho no botão, **sem dois iguais** — P55 (29/09/2026).
 *
 * A primeira foto do P55 mostrou dois botões idênticos: *Recuperar
 * "heroi.bone", hoje às 10:24*, duas vezes. Quem olha não sabe qual é qual.
 * Quando o nome e o minuto empatam, entram os segundos; se ainda empatar, um
 * número. O primeiro da lista é o atual, e diz isso.
 */
export function draftLabels(drafts: readonly Draft[], now: number = Date.now()): string[] {
  const hora = (d: Draft, segundos: boolean): string => {
    const base = describeDraftTime(d.savedAt, now);
    if (!segundos) return base;
    const s = String(new Date(d.savedAt).getSeconds()).padStart(2, '0');
    return `${base}:${s}`;
  };
  const curto = drafts.map((d) => `"${d.name}", ${hora(d, false)}`);
  const empata = (lista: string[], i: number): boolean => lista.filter((x) => x === lista[i]).length > 1;
  const comSegundos = drafts.map((d, i) => (empata(curto, i) ? `"${d.name}", ${hora(d, true)}` : curto[i]!));
  const vistos = new Map<string, number>();
  return comSegundos.map((rotulo, i) => {
    let final = rotulo;
    if (empata(comSegundos, i)) {
      const n = (vistos.get(rotulo) ?? 0) + 1;
      vistos.set(rotulo, n);
      final = `${rotulo} (nº ${n})`;
    }
    return i === 0 && drafts.length > 1 ? `${final} — o mais recente` : final;
  });
}

