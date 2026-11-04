/**
 * **As chaves guardadas** — rodada 13 (05/10/2026).
 *
 * O Humberto (`02 AS DECISOES`, seção 1, regra 5): *"Peça tirada da base: as
 * chaves dela nas animações ficam guardadas, sem fazer nada. Se a peça volta,
 * as chaves voltam. Como dois saves: um não apaga o outro."*
 *
 * Até aqui apagar um osso ou uma imagem levava junto as linhas do tempo dela,
 * em toda animação (`applyRemoval`), e só o Ctrl+Z as trazia. Agora elas saem
 * da animação e vão para o estado do editor, no arquivo:
 * `extensions.RECORTE_editor_state.chavesGuardadas`. Saem da animação porque
 * uma timeline com alvo que não existe é L1 (spec 4.7) e todo leitor a ignora
 * avisando; no estado do editor nenhum leitor as vê (regra 6 da casa).
 *
 * VOLTAR: uma peça nova com o MESMO NOME e do MESMO TIPO (osso com osso,
 * imagem com imagem, regra com regra) religa as chaves dela. De outro tipo não
 * religa, e o rodapé diz. Uma animação que já tem chave da peça nova naquela
 * mesma linha não perde nada: a guardada continua guardada ("um não apaga o
 * outro"), e o rodapé diz.
 *
 * O Spriter (manual 1.4) não tem base: o Delete apaga o objeto da chave, e o
 * Shift+Delete de todos os quadros, sem volta além do desfazer. Esta é a
 * decisão do Humberto, acima dele.
 *
 * Puro: lê e escreve o `.bone`. Os comandos estão no fim.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import {
  EDITOR_EXTENSION, readEditorState, writeEditorState,
  type ChangeKind, type Command, type EditorDoc, type EditorState,
} from '../contract.js';

/** O campo, dentro de `extensions.RECORTE_editor_state`. */
export const GUARDED_FIELD = 'chavesGuardadas';

/** O tipo da peça, na palavra da tela. */
export type PieceKind = 'osso' | 'imagem' | 'regra';

/** Uma linha do tempo guardada, ou as entradas de ordem de desenho de uma imagem. */
export interface GuardedEntry {
  tipo: PieceKind;
  nome: string;
  animacao: string;
  /** A timeline inteira, como estava. */
  timeline?: Record<string, unknown>;
  /** Só imagem: o `offset` dela em cada chave de `drawOrder`, pelo instante. */
  ordem?: Array<{ time: number; offset: number }>;
}

type Def = Record<string, unknown>;
interface TimelineLike { type?: unknown; target?: unknown; property?: unknown; skin?: unknown; attachment?: unknown; keys?: Def[] }

/** O tipo da peça que a timeline mexe, como o `applyRemoval` poda. `null` = nenhuma. */
function kindOfTimeline(type: unknown): PieceKind | null {
  if (type === 'bone') return 'osso';
  if (type === 'slot' || type === 'deform' || type === 'sequence') return 'imagem';
  if (type === 'constraint') return 'regra';
  return null;
}

/** As guardadas do arquivo, sem nunca falhar num valor estragado. */
export function readGuarded(file: BoneFile): GuardedEntry[] {
  const raw = (readEditorState(file) as Record<string, unknown>)[GUARDED_FIELD];
  if (!Array.isArray(raw)) return [];
  return raw.filter((e): e is GuardedEntry => e !== null && typeof e === 'object'
    && typeof (e as GuardedEntry).nome === 'string' && typeof (e as GuardedEntry).animacao === 'string'
    && ((e as GuardedEntry).tipo === 'osso' || (e as GuardedEntry).tipo === 'imagem' || (e as GuardedEntry).tipo === 'regra'));
}

function writeGuarded(file: BoneFile, entries: GuardedEntry[]): void {
  const state = { ...readEditorState(file) } as Record<string, unknown>;
  if (entries.length === 0) delete state[GUARDED_FIELD];
  else state[GUARDED_FIELD] = entries;
  writeEditorState(file, state as EditorState);
  const f = file as { extensionsUsed?: string[] };
  const used = f.extensionsUsed ?? [];
  if (!used.includes(EDITOR_EXTENSION)) f.extensionsUsed = [...used, EDITOR_EXTENSION];
}

/** Quantas chaves uma entrada guarda. */
function keysOf(entry: GuardedEntry): number {
  if (entry.timeline !== undefined) return Array.isArray(entry.timeline['keys']) ? (entry.timeline['keys'] as unknown[]).length : 0;
  return entry.ordem?.length ?? 0;
}

/** O que foi guardado de uma vez, para o rodapé. */
export interface GuardSummary {
  /** Chaves guardadas. */
  keys: number;
  /** Em quantas animações. */
  animations: number;
  /** As peças, pelo nome, na ordem em que apareceram. */
  names: string[];
}

/**
 * Guarda as chaves das peças que vão sair, ANTES de o `applyRemoval` podar.
 * As mesmas linhas que ele poda: osso; slot, deform e sequence da imagem; a
 * regra; e o lugar da imagem em cada chave de ordem de desenho. Só as das
 * animações: a linha de um driver é parte da regra, e sai com ela.
 */
export function guardRemoved(
  file: BoneFile, removal: { bones: ReadonlySet<string>; slots: ReadonlySet<string>; constraints: ReadonlySet<string> },
): GuardSummary {
  const found: GuardedEntry[] = [];
  const animations = new Set<string>();
  const names: string[] = [];
  const doomed = (kind: PieceKind, name: unknown): boolean => typeof name === 'string'
    && (kind === 'osso' ? removal.bones : kind === 'imagem' ? removal.slots : removal.constraints).has(name);

  for (const animation of (file.animations ?? []) as unknown as Def[]) {
    const name = String(animation['name']);
    for (const tl of (animation['timelines'] as TimelineLike[] | undefined) ?? []) {
      const kind = kindOfTimeline(tl.type);
      if (kind !== null && doomed(kind, tl.target)) {
        found.push({ tipo: kind, nome: tl.target as string, animacao: name, timeline: JSON.parse(JSON.stringify(tl)) as Def });
        animations.add(name);
        if (!names.includes(tl.target as string)) names.push(tl.target as string);
        continue;
      }
      if (tl.type !== 'drawOrder' || removal.slots.size === 0) continue;
      const bySlot = new Map<string, Array<{ time: number; offset: number }>>();
      for (const key of tl.keys ?? []) {
        if (!Array.isArray(key['value'])) continue;
        for (const item of key['value'] as Def[]) {
          const slot = item?.['slot'];
          if (typeof slot !== 'string' || !removal.slots.has(slot)) continue;
          const list = bySlot.get(slot) ?? [];
          list.push({ time: Number(key['time']), offset: Number(item['offset'] ?? 0) });
          bySlot.set(slot, list);
        }
      }
      for (const [slot, ordem] of bySlot) {
        found.push({ tipo: 'imagem', nome: slot, animacao: name, ordem });
        animations.add(name);
        if (!names.includes(slot)) names.push(slot);
      }
    }
  }
  if (found.length > 0) writeGuarded(file, [...readGuarded(file), ...found]);
  return { keys: found.reduce((n, e) => n + keysOf(e), 0), animations: animations.size, names };
}

/** A frase do rodapé depois de apagar, ou `''` sem nada guardado. */
export function guardNotice(summary: GuardSummary): string {
  if (summary.keys === 0) return '';
  const quem = summary.names.length === 1 ? `de "${summary.names[0]}"` : `de ${summary.names.length} peças`;
  const chaves = summary.keys === 1 ? '1 chave' : `${summary.keys} chaves`;
  const onde = summary.animations === 1 ? 'em 1 animação' : `em ${summary.animations} animações`;
  return `${chaves} ${quem} guardada${summary.keys === 1 ? '' : 's'} ${onde}. Crie de novo com o mesmo nome e elas voltam`;
}

/** O tipo da peça que tem esse nome no arquivo agora, ou `null`. */
function kindNow(file: BoneFile, name: string, kind: PieceKind): 'same' | 'other' | null {
  const isBone = file.bones.some((b) => b.name === name);
  const isSlot = (file.slots ?? []).some((s) => s.name === name);
  const isRule = (file.constraints ?? []).some((c) => c.name === name);
  const same = kind === 'osso' ? isBone : kind === 'imagem' ? isSlot : isRule;
  if (same) return 'same';
  return isBone || isSlot || isRule ? 'other' : null;
}

/** O endereço de uma timeline (spec 9.1): o que não pode repetir na animação. */
function addressOf(tl: TimelineLike | Def): string {
  const t = tl as TimelineLike;
  return JSON.stringify([t.type, t.target, t.property ?? null, t.skin ?? null, t.attachment ?? null]);
}

/** O que religar faria agora. Vazio = nada a fazer. */
export interface RelinkPlan {
  /** As entradas que voltam, pelo índice na lista guardada. */
  back: number[];
  /** Peças que voltaram de OUTRO tipo: o nome, o tipo guardado. Não religam. */
  otherKind: Array<{ nome: string; tipo: PieceKind }>;
  /** Linhas que não voltam porque a animação já tem chave da peça nova ali. */
  taken: number;
}

/** Quais guardadas voltam agora, e quais não podem. Não mexe em nada. */
export function relinkPlan(file: BoneFile): RelinkPlan {
  const plan: RelinkPlan = { back: [], otherKind: [], taken: 0 };
  const entries = readGuarded(file);
  if (entries.length === 0) return plan;
  const animations = new Map(((file.animations ?? []) as unknown as Def[]).map((a) => [String(a['name']), a]));
  entries.forEach((entry, i) => {
    const now = kindNow(file, entry.nome, entry.tipo);
    if (now === null) return;
    if (now === 'other') {
      if (!plan.otherKind.some((o) => o.nome === entry.nome)) plan.otherKind.push({ nome: entry.nome, tipo: entry.tipo });
      return;
    }
    const animation = animations.get(entry.animacao);
    if (animation === undefined) return;
    if (entry.timeline !== undefined) {
      const lines = (animation['timelines'] as TimelineLike[] | undefined) ?? [];
      if (lines.some((tl) => addressOf(tl) === addressOf(entry.timeline!))) {
        plan.taken++;
        return;
      }
    }
    plan.back.push(i);
  });
  return plan;
}

/** O que religar fez, para o rodapé. */
export interface RelinkSummary {
  keys: number;
  animations: number;
  names: string[];
  otherKind: Array<{ nome: string; tipo: PieceKind }>;
  taken: number;
}

/** Religa o que o plano diz. Devolve o resumo. */
function relink(file: BoneFile, plan: RelinkPlan): RelinkSummary {
  const entries = readGuarded(file);
  const animations = new Map(((file.animations ?? []) as unknown as Def[]).map((a) => [String(a['name']), a]));
  const summary: RelinkSummary = { keys: 0, animations: 0, names: [], otherKind: plan.otherKind, taken: plan.taken };
  const touched = new Set<string>();
  const back = new Set(plan.back);
  for (const i of plan.back) {
    const entry = entries[i]!;
    const animation = animations.get(entry.animacao)!;
    if (entry.timeline !== undefined) {
      const lines = (animation['timelines'] as Def[] | undefined) ?? [];
      lines.push(JSON.parse(JSON.stringify(entry.timeline)) as Def);
      animation['timelines'] = lines;
    }
    for (const { time, offset } of entry.ordem ?? []) {
      for (const tl of (animation['timelines'] as TimelineLike[] | undefined) ?? []) {
        if (tl.type !== 'drawOrder') continue;
        const key = (tl.keys ?? []).find((k) => k['time'] === time);
        if (key === undefined || !Array.isArray(key['value'])) continue;
        const value = key['value'] as Def[];
        if (!value.some((item) => item?.['slot'] === entry.nome)) value.push({ slot: entry.nome, offset });
      }
    }
    summary.keys += keysOf(entry);
    touched.add(entry.animacao);
    if (!summary.names.includes(entry.nome)) summary.names.push(entry.nome);
  }
  summary.animations = touched.size;
  writeGuarded(file, entries.filter((_, i) => !back.has(i)));
  return summary;
}

/** A frase do rodapé depois de religar, ou `''` sem nada a dizer. */
export function relinkNotice(summary: RelinkSummary): string {
  const parts: string[] = [];
  if (summary.keys > 0) {
    const quem = summary.names.length === 1 ? `de "${summary.names[0]}"` : `de ${summary.names.join(', ')}`;
    const chaves = summary.keys === 1 ? '1 chave guardada voltou' : `${summary.keys} chaves guardadas voltaram`;
    const onde = summary.animations === 1 ? 'em 1 animação' : `em ${summary.animations} animações`;
    parts.push(`${chaves} ${quem}, ${onde}`);
  }
  for (const o of summary.otherKind) {
    parts.push(`"${o.nome}" tem chaves guardadas de ${o.tipo === 'osso' ? 'um osso' : o.tipo === 'imagem' ? 'uma imagem' : 'uma regra'}: com outro tipo elas não voltam`);
  }
  if (summary.taken > 0) {
    parts.push(summary.taken === 1
      ? '1 linha guardada continua guardada: a animação já tem chave nova ali'
      : `${summary.taken} linhas guardadas continuam guardadas: a animação já tem chave nova ali`);
  }
  return parts.join('. ');
}

/** Por peça: quantas chaves, em quantas animações — o que a janela mostra. */
export function guardedByPiece(file: BoneFile): Array<{ nome: string; tipo: PieceKind; keys: number; animations: number }> {
  const out = new Map<string, { nome: string; tipo: PieceKind; keys: number; animations: Set<string> }>();
  for (const entry of readGuarded(file)) {
    const id = `${entry.tipo} ${entry.nome}`;
    const row = out.get(id) ?? { nome: entry.nome, tipo: entry.tipo, keys: 0, animations: new Set<string>() };
    row.keys += keysOf(entry);
    row.animations.add(entry.animacao);
    out.set(id, row);
  }
  return [...out.values()].map((r) => ({ nome: r.nome, tipo: r.tipo, keys: r.keys, animations: r.animations.size }));
}

// ---------------------------------------------------------------------------
// Os comandos
// ---------------------------------------------------------------------------

/** Devolve `doc.file` ao texto `saved`, no lugar, chave por chave. */
function restoreText(doc: EditorDoc, saved: string): void {
  const target = doc.file as unknown as Record<string, unknown>;
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, JSON.parse(saved));
}

/**
 * **Religar as chaves guardadas.** Nunca entra sozinho na pilha: o documento o
 * junta ao comando que fez a peça voltar (`WithRelink`), e um Ctrl+Z desfaz os
 * dois — a peça e as chaves dela.
 */
export class RelinkGuarded implements Command {
  readonly label = 'Religar as chaves guardadas';
  readonly kind: ChangeKind = 'structure';
  summary: RelinkSummary = { keys: 0, animations: 0, names: [], otherKind: [], taken: 0 };
  private saved: string | null = null;

  apply(doc: EditorDoc): void {
    this.saved = JSON.stringify(doc.file);
    this.summary = relink(doc.file, relinkPlan(doc.file));
  }

  revert(doc: EditorDoc): void {
    if (this.saved !== null) restoreText(doc, this.saved);
    this.saved = null;
  }
}

/**
 * O comando que fez a peça voltar, com a religação junto: um passo de desfazer.
 * Guarda o `mergeKey` de dentro, para o gesto do osso próprio (8d) continuar
 * sendo um gesto só.
 */
export class WithRelink implements Command {
  readonly label: string;
  readonly kind: ChangeKind;
  constructor(readonly inner: Command, readonly relink: RelinkGuarded) {
    this.label = inner.label;
    this.kind = inner.kind;
  }

  get mergeKey(): unknown {
    return (this.inner as { mergeKey?: unknown }).mergeKey;
  }

  apply(doc: EditorDoc): void {
    this.inner.apply(doc);
    this.relink.apply(doc);
  }

  revert(doc: EditorDoc): void {
    this.relink.revert(doc);
    this.inner.revert(doc);
  }
}

/**
 * **Jogar fora as chaves guardadas**, de propósito — de uma peça, ou todas
 * (`null`). Um passo de desfazer: o Ctrl+Z as devolve.
 */
export class DiscardGuarded implements Command {
  readonly kind: ChangeKind = 'structure';
  readonly label: string;
  /** Quantas chaves saíram. */
  dropped = 0;
  private saved: string | null = null;

  constructor(readonly piece: string | null = null) {
    this.label = piece === null ? 'Jogar fora as chaves guardadas' : `Jogar fora as chaves guardadas de "${piece}"`;
  }

  apply(doc: EditorDoc): void {
    this.saved = JSON.stringify(doc.file);
    const entries = readGuarded(doc.file);
    const keep = entries.filter((e) => this.piece !== null && e.nome !== this.piece);
    this.dropped = entries.filter((e) => !keep.includes(e)).reduce((n, e) => n + keysOf(e), 0);
    writeGuarded(doc.file, keep);
  }

  revert(doc: EditorDoc): void {
    if (this.saved !== null) restoreText(doc, this.saved);
    this.saved = null;
  }
}
