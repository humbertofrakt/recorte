/**
 * **Combinar os ossos** — reaproveitar animação, noite de 04/11/2026.
 *
 * 🗣️ *"o Fortnite tem vários personagens, mas usa as mesmas animações base"*.
 *
 * Uma animação liga no osso **pelo nome** (§2.8). Quando o boneco daqui chama
 * de `braco_direito` o que a animação chama de `braco_d`, nada se mexe — e até
 * hoje o editor só dizia *"esta base NÃO tem 14 nomes"*. Esta é a conta da
 * tabela "osso de lá → osso daqui", sem DOM (regra 8):
 *
 * | Passo | Quem decide |
 * |:---|:---|
 * | mesmo nome | `mesmo nome` |
 * | a tabela lembrada da última vez | `lembrado` |
 * | nome parecido: `braco_direito`, `right_arm` e `braco_d` são o mesmo osso | `parecido` |
 * | a pessoa escolhe na lista | `escolhido` |
 *
 * É o auto-mapeamento do Avatar do Unity, com as palavras em português. O que
 * não se achou fica `null` e a janela diz **FALTA** — nunca um palpite calado
 * (regra 21).
 */

// ---------------------------------------------------------------------------
// O nome parecido
// ---------------------------------------------------------------------------

/** As partes do corpo, e as palavras que querem dizer cada uma. */
const PARTES: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['raiz', ['raiz', 'root', 'origem']],
  ['quadril', ['quadril', 'bacia', 'hips', 'hip', 'pelvis', 'cintura', 'quadris']],
  ['tronco', ['tronco', 'torso', 'corpo', 'chest', 'spine', 'peito', 'body', 'barriga']],
  ['pescoco', ['pescoco', 'neck']],
  ['cabeca', ['cabeca', 'head', 'cranio']],
  ['antebraco', ['antebraco', 'forearm', 'lowerarm']],
  ['braco', ['braco', 'arm', 'upperarm', 'ombro']],
  ['mao', ['mao', 'hand', 'punho']],
  ['canela', ['canela', 'shin', 'calf', 'lowerleg', 'joelho']],
  ['coxa', ['coxa', 'perna', 'thigh', 'upperleg', 'leg']],
  ['pe', ['pe', 'foot', 'feet']],
];

/** As palavras de lado. `b`/`tras` são o de trás, que o padrão chama de `e`. */
const LADOS: ReadonlyArray<readonly [string, readonly string[]]> = [
  ['d', ['d', 'dir', 'direito', 'direita', 'right', 'r', 'frente', 'f', 'front']],
  ['e', ['e', 'esq', 'esquerdo', 'esquerda', 'left', 'l', 'b', 'tras', 'back']],
];

/** As partes que têm dois lados. */
const COM_LADO = new Set(['antebraco', 'braco', 'mao', 'canela', 'coxa', 'pe']);

/** Sem acento, sem maiúscula, em pedaços: `BracoDireito` → `braco`, `direito`. */
function pedacos(nome: string): string[] {
  return nome
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((p) => p.length > 0);
}

/** A parte e o lado de um nome, ou `null` quando não é parte do corpo conhecida. */
export function bodyPartOf(nome: string): { parte: string; lado: string } | null {
  const ps = pedacos(nome);
  // O nome inteiro colado também vale: `upperarm`, `antebraco`.
  const juntos = ps.join('');
  let parte: string | null = null;
  for (const [p, palavras] of PARTES) {
    if (palavras.includes(juntos) || ps.some((x) => palavras.includes(x))) { parte = p; break; }
    // `antebraco_d` em pedaços é `antebraco`, `d`: já pego acima. `upper_arm`:
    const sem = ps.filter((x) => !LADOS.some(([, l]) => l.includes(x))).join('');
    if (palavras.includes(sem)) { parte = p; break; }
  }
  if (parte === null) return null;
  let lado = '';
  for (const [l, palavras] of LADOS) {
    if (ps.some((x) => palavras.includes(x))) { lado = l; break; }
  }
  return { parte, lado: COM_LADO.has(parte) ? lado : '' };
}

/**
 * As chaves de um esqueleto inteiro: `braco` sem lado vira `braco:d` quando o
 * mesmo esqueleto tem um `braco` do lado `e` — é o herói (`arm` e `arm_b`).
 */
function chavesDe(nomes: readonly string[]): Map<string, string> {
  const partes = new Map<string, { parte: string; lado: string }>();
  for (const n of nomes) {
    const p = bodyPartOf(n);
    if (p !== null) partes.set(n, p);
  }
  const chaves = new Map<string, string>();
  for (const [n, p] of partes) {
    let lado = p.lado;
    if (lado === '' && COM_LADO.has(p.parte)) {
      const outro = [...partes.values()].some((q) => q.parte === p.parte && q.lado === 'e');
      lado = outro ? 'd' : '';
    }
    chaves.set(n, `${p.parte}:${lado}`);
  }
  return chaves;
}

// ---------------------------------------------------------------------------
// A tabela
// ---------------------------------------------------------------------------

/** Como a linha foi achada. `null` = não foi: FALTA. */
export type MatchHow = 'mesmo nome' | 'lembrado' | 'parecido' | 'escolhido' | null;

/** Uma linha da tabela: o osso que a animação pede, e o daqui. */
export interface BoneMatchRow {
  /** O nome na animação (de lá). */
  from: string;
  /** O osso deste boneco, ou `null` = falta. */
  to: string | null;
  how: MatchHow;
}

/** A tabela inteira, com a conta que a janela mostra no título. */
export interface BoneMatch {
  rows: BoneMatchRow[];
  /** Quantas linhas têm osso daqui. */
  matched: number;
  /** Quantas linhas há. */
  total: number;
}

/**
 * Combina os ossos que a animação pede com os deste boneco.
 *
 * Cada osso daqui é usado **uma vez só**: dois ossos de lá no mesmo osso daqui
 * fariam um sobrescrever o outro a cada quadro. Ordem: o mesmo nome primeiro
 * (nunca se perde para um parecido), depois o lembrado, depois o parecido.
 */
export function matchBones(
  needed: readonly string[],
  host: readonly string[],
  remembered: Readonly<Record<string, string>> = {},
): BoneMatch {
  const livres = new Set(host);
  const rows: BoneMatchRow[] = needed.map((from) => ({ from, to: null, how: null }));
  for (const row of rows) {
    if (livres.has(row.from)) { row.to = row.from; row.how = 'mesmo nome'; livres.delete(row.from); }
  }
  for (const row of rows) {
    if (row.to !== null) continue;
    const lembrado = remembered[row.from];
    if (lembrado !== undefined && livres.has(lembrado)) {
      row.to = lembrado; row.how = 'lembrado'; livres.delete(lembrado);
    }
  }
  const deLa = chavesDe(needed);
  const daqui = chavesDe(host);
  for (const row of rows) {
    if (row.to !== null) continue;
    const chave = deLa.get(row.from);
    if (chave === undefined) continue;
    const achado = host.find((n) => livres.has(n) && daqui.get(n) === chave);
    if (achado !== undefined) { row.to = achado; row.how = 'parecido'; livres.delete(achado); }
  }
  return summarize(rows);
}

/** A conta da tabela. */
export function summarize(rows: BoneMatchRow[]): BoneMatch {
  return { rows, matched: rows.filter((r) => r.to !== null).length, total: rows.length };
}

/**
 * A pessoa escolheu na lista: `from` passa a ir para `to` (`null` = nenhum).
 * Se `to` já estava em outra linha, aquela linha fica sem — um osso daqui,
 * uma linha só.
 */
export function chooseBone(match: BoneMatch, from: string, to: string | null): BoneMatch {
  const rows = match.rows.map((r) => ({ ...r }));
  for (const r of rows) {
    if (r.from === from) { r.to = to; r.how = to === null ? null : 'escolhido'; }
    else if (to !== null && r.to === to) { r.to = null; r.how = null; }
  }
  return summarize(rows);
}

/** O título da seção: `combinam 14 de 17`. */
export function matchTitle(match: BoneMatch): string {
  return `Combinar os ossos — combinam ${match.matched} de ${match.total}`;
}

/** A tabela como se guarda: só as linhas que não são o mesmo nome. */
export function rememberedOf(match: BoneMatch): Record<string, string> {
  const out: Record<string, string> = {};
  for (const r of match.rows) if (r.to !== null && r.to !== r.from) out[r.from] = r.to;
  return out;
}

// ---------------------------------------------------------------------------
// Ligadas: os ossos daqui ganham os nomes de lá
// ---------------------------------------------------------------------------

/** Um osso daqui que muda de nome. */
export interface BoneRename { de: string; para: string }

/**
 * Os nomes que mudam neste boneco para ele tocar as animações **ligadas**.
 *
 * Só as linhas achadas e de nome diferente. Devolve também os **conflitos**: um
 * osso daqui que já tem o nome de lá e não entra na tabela (renomear o outro
 * para esse nome faria dois ossos com o mesmo nome).
 */
export function renamesFor(match: BoneMatch, host: readonly string[]): {
  renames: BoneRename[]; conflicts: string[];
} {
  const renames = match.rows
    .filter((r): r is BoneMatchRow & { to: string } => r.to !== null && r.to !== r.from)
    .map((r) => ({ de: r.to, para: r.from }));
  const saindo = new Set(renames.map((r) => r.de));
  const conflicts = renames
    .filter((r) => host.includes(r.para) && !saindo.has(r.para))
    .map((r) => r.para);
  return { renames, conflicts };
}

// ---------------------------------------------------------------------------
// Cópia: as chaves de lá com os nomes daqui
// ---------------------------------------------------------------------------

/** Uma timeline, o que se lê aqui. */
interface TimelineLike { type?: unknown; target?: unknown }

/** Tipos de timeline cujo alvo é um slot (§9.1). */
const SLOT_TIMELINES = new Set(['slot', 'deform', 'weights', 'sequence', 'nested']);

/** Tipos de timeline sem alvo, que entram sempre. */
const SEM_ALVO = new Set(['drawOrder', 'event', 'tag', 'body']);

/**
 * As animações de lá, com cada timeline de osso apontando para o osso daqui.
 *
 * O que **não** tem onde cair sai, e sai contado (regra 21): a timeline de um
 * osso que ficou sem par, a de um slot que este boneco não tem, a de uma regra
 * ou parâmetro (que a §2.8 também ignora num arquivo de fora).
 */
export function translateAnimations(
  animations: readonly unknown[],
  match: BoneMatch,
  hostSlots: readonly string[],
): { animations: unknown[]; dropped: string[] } {
  const para = new Map<string, string>();
  for (const r of match.rows) if (r.to !== null) para.set(r.from, r.to);
  const slots = new Set(hostSlots);
  const dropped: string[] = [];
  const out = animations.map((a) => {
    const copia = JSON.parse(JSON.stringify(a)) as { name?: unknown; timelines?: unknown[] };
    const nome = String(copia.name ?? '');
    const timelines = Array.isArray(copia.timelines) ? copia.timelines : [];
    copia.timelines = timelines.filter((raw) => {
      const tl = raw as TimelineLike;
      const tipo = typeof tl.type === 'string' ? tl.type : '';
      const alvo = typeof tl.target === 'string' ? tl.target : '';
      if (SEM_ALVO.has(tipo)) return true;
      if (tipo === 'bone') {
        const novo = para.get(alvo);
        if (novo === undefined) { anota(dropped, `${nome}: osso "${alvo}"`); return false; }
        tl.target = novo;
        return true;
      }
      if (SLOT_TIMELINES.has(tipo)) {
        if (slots.has(alvo)) return true;
        anota(dropped, `${nome}: slot "${alvo}"`);
        return false;
      }
      anota(dropped, `${nome}: ${tipo || 'linha'} "${alvo}"`);
      return false;
    });
    return copia;
  });
  return { animations: out, dropped };
}

function anota(lista: string[], item: string): void {
  if (!lista.includes(item)) lista.push(item);
}

/** Os ossos que as animações nomeiam (os alvos das timelines `bone`), na ordem. */
export function bonesUsedBy(animations: readonly unknown[]): string[] {
  const out: string[] = [];
  for (const a of animations) {
    const tls = (a as { timelines?: unknown }).timelines;
    if (!Array.isArray(tls)) continue;
    for (const raw of tls) {
      const tl = raw as TimelineLike;
      if (tl.type === 'bone' && typeof tl.target === 'string' && !out.includes(tl.target)) out.push(tl.target);
    }
  }
  return out;
}
