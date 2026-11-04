/**
 * Bulk edits of a whole timeline — requirements A1 and A6.
 *
 * Pure functions over the `.bone` JSON, like `keying.ts`: no DOM, no document,
 * no undo. The dopesheet wraps every one of them in an `EditKeys` command, and
 * the tests call them straight.
 *
 * WHAT IS HERE
 *   Esticar seleção          `scaleKeys` around the start of the selection.
 *   Espelhar no tempo        the same, with factor −1 around the MIDDLE of the
 *                            selection, so the block keeps the room it had.
 *   Espelhar esquerda/direita swap the timelines of two bones whose names are
 *                            a mirrored pair; the rule of what a pair is comes
 *                            from the user as text.
 *   Fechar ciclo             copy the first key to the end of the animation and
 *                            match the tangents, so a looping animation does
 *                            not jerk when it wraps.
 */

import type { BoneFile, CurveDef, KeyValue } from '../../../runtime/src/index.js';
import {
  clampControls, readCurve, toBezier, writeCurve,
  type ControlPoints,
} from './curves.js';
import {
  durationOf, findAnimation, findTimeline, roundTime, scaleKeys, setKey,
  targetInfo, targetOfTimeline, timelinesOf,
  type KeyClipboard, type KeyRef, type TimelineTarget,
} from './keying.js';

// ---------------------------------------------------------------------------
// Small shared views of the JSON
// ---------------------------------------------------------------------------

/** Loose view of a key, so this module does not fight the union type. */
interface KeyLike {
  time: number;
  value?: KeyValue;
  curve?: CurveDef;
  [field: string]: unknown;
}

/** Loose view of a timeline. */
interface TimelineLike {
  type: string;
  target?: string;
  keys?: KeyLike[];
}

/** JSON deep copy. The file only ever holds JSON values, so this is exact. */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/** A key value as an array of numbers, whatever shape it came in. */
function componentsOf(value: KeyValue | undefined, count: number): number[] {
  if (Array.isArray(value)) {
    const out: number[] = [];
    for (let j = 0; j < count; j++) out.push(Number(value[j] ?? 0));
    return out;
  }
  const single = typeof value === 'number' ? value : 0;
  const out: number[] = [];
  for (let j = 0; j < count; j++) out.push(j === 0 ? single : 0);
  return out;
}

// ---------------------------------------------------------------------------
// Esticar e espelhar no tempo (requirement A1)
// ---------------------------------------------------------------------------

/** First and last time of a set of keys, or `null` when the set is empty. */
export function timeSpanOf(refs: readonly KeyRef[]): { first: number; last: number } | null {
  if (refs.length === 0) return null;
  let first = Number.POSITIVE_INFINITY;
  let last = Number.NEGATIVE_INFINITY;
  for (const ref of refs) {
    if (ref.time < first) first = ref.time;
    if (ref.time > last) last = ref.time;
  }
  return { first, last };
}

/**
 * Stretches the selected keys in time by `factor`, holding the FIRST key of the
 * selection still.
 *
 *   t → first + (t − first) · factor
 *
 * Holding the first key is what dragging the right-hand edge of the selection
 * does in every dopesheet: the block keeps its start and changes its length, so
 * a cycle that already begins in the right place still does.
 */
export function stretchSelection(
  file: BoneFile, animation: string, refs: readonly KeyRef[], factor: number,
): KeyRef[] {
  const span = timeSpanOf(refs);
  if (span === null || !Number.isFinite(factor) || factor === 0) return [];
  return scaleKeys(file, animation, refs, span.first, factor);
}

/**
 * Reverses the order of the selected keys in time, around the middle of the
 * selection:
 *
 *   pivot = (first + last) / 2      t → pivot − (t − pivot)
 *
 * The block ends exactly where it started and lasts exactly as long; only the
 * order of the keys inside it is turned round. That is what "espelhar no tempo"
 * has to mean, and it is why the pivot is the selection's middle and not the
 * playhead — the playhead would move the whole block somewhere else.
 */
export function mirrorKeysInTime(
  file: BoneFile, animation: string, refs: readonly KeyRef[],
): KeyRef[] {
  const span = timeSpanOf(refs);
  if (span === null) return [];
  const pivot = (span.first + span.last) / 2;
  return scaleKeys(file, animation, refs, pivot, -1);
}

// ---------------------------------------------------------------------------
// Espelhar esquerda e direita (requirement A1)
// ---------------------------------------------------------------------------

/** One way of writing "this name is the mirror of that one". */
export interface MirrorRule {
  /** Ending of the left-hand name, e.g. `_e`. May be empty. */
  readonly left: string;
  /** Ending of the right-hand name, e.g. `_d`. May be empty. */
  readonly right: string;
}

/**
 * What the rule box starts with.
 *
 * Three conventions, because three are in the wild: Portuguese `_e`/`_d`
 * (esquerda / direita), English `_l`/`_r`, and the spelled-out `_esq`/`_dir`.
 * A rig that uses `perna` and `perna_b` writes `/_b` — the left side of the
 * rule is simply empty.
 */
// K5 (chat K, 29/09): o herói usa `leg`/`leg_b` nos ossos e `leg_front`/`leg_back`
// nos desenhos — e o padrão não casava nenhum. `_front/_back` e `/_b` entram; o
// `/_b` é seguro porque o colar só troca para um par que EXISTE no arquivo
// (`mirrorClipboardIn`).
export const DEFAULT_MIRROR_RULES = '_e/_d, _l/_r, _esq/_dir, _front/_back, /_b';

/**
 * Reads the rule box: pairs separated by commas, the two sides by a slash.
 *
 * `"_e/_d, /_b"` gives two rules. Whitespace is dropped. A pair with both sides
 * empty, or with no slash, is ignored instead of throwing — the box is a field
 * the user types into, and a half-typed rule must not break the button.
 */
export function parseMirrorRules(text: string): MirrorRule[] {
  const rules: MirrorRule[] = [];
  for (const piece of text.split(',')) {
    const slash = piece.indexOf('/');
    if (slash < 0) continue;
    const left = piece.slice(0, slash).trim();
    const right = piece.slice(slash + 1).trim();
    if (left === '' && right === '') continue;
    if (left === right) continue;
    rules.push({ left, right });
  }
  return rules;
}

/**
 * The mirrored name of `name` under ONE rule, or `null`.
 *
 * The longer ending is tried first, which is what makes an empty side work: for
 * the rule `/_b`, `perna_b` matches `_b` and gives `perna`, and only a name that
 * does NOT end in `_b` falls through to "add `_b`".
 */
export function mirrorNameUnder(name: string, rule: MirrorRule): string | null {
  const sides: Array<{ from: string; to: string }> = [
    { from: rule.left, to: rule.right },
    { from: rule.right, to: rule.left },
  ];
  sides.sort((a, b) => b.from.length - a.from.length);
  for (const side of sides) {
    if (side.from === '') return name + side.to;
    if (name.endsWith(side.from)) return name.slice(0, name.length - side.from.length) + side.to;
  }
  return null;
}

/** The mirrored name under the first rule that produces one. */
export function mirrorNameOf(name: string, rules: readonly MirrorRule[]): string | null {
  for (const rule of rules) {
    const partner = mirrorNameUnder(name, rule);
    if (partner !== null && partner !== name) return partner;
  }
  return null;
}

/** Two names that mirror each other, in the order they appear in the file. */
export interface MirrorPair {
  readonly a: string;
  readonly b: string;
  /** The rule that matched, so the panel can show WHY these two are a pair. */
  readonly rule: MirrorRule;
}

/**
 * Every mirrored pair inside `names`.
 *
 * A name is used at most once: the first rule that finds an existing partner
 * wins, and both names are then out of the running. Without that, the rule
 * `/_b` would pair `perna_b` with `perna_b_b`.
 */
export function findMirrorPairs(
  names: readonly string[], rules: readonly MirrorRule[],
): MirrorPair[] {
  const present = new Set(names);
  const used = new Set<string>();
  const pairs: MirrorPair[] = [];
  for (const name of names) {
    if (used.has(name)) continue;
    for (const rule of rules) {
      const partner = mirrorNameUnder(name, rule);
      if (partner === null || partner === name) continue;
      if (!present.has(partner) || used.has(partner)) continue;
      pairs.push({ a: name, b: partner, rule });
      used.add(name);
      used.add(partner);
      break;
    }
  }
  return pairs;
}

/** Every bone the animation writes a timeline for, in timeline order. */
export function animatedBones(file: BoneFile, animation: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const timeline of timelinesOf(file, animation)) {
    const target = targetOfTimeline(timeline);
    if (target.type !== 'bone' || target.target === undefined) continue;
    if (seen.has(target.target)) continue;
    seen.add(target.target);
    names.push(target.target);
  }
  return names;
}

/**
 * Swaps the bone timelines of every pair: what the left bone was doing, the
 * right one now does, and the other way round.
 *
 * Only the `target` field of each timeline is rewritten, which is a swap and
 * therefore stays a bijection: no two timelines can end up with the same
 * address of spec 9.1. Values are NOT negated, on purpose — in a rig whose
 * rest pose is already mirrored (the normal case, and the only case where
 * "espelhar esquerda e direita" means anything) the numbers carry straight
 * over. Returns how many timelines changed hands.
 */
export function swapMirroredBones(
  file: BoneFile, animation: string, pairs: readonly MirrorPair[],
): number {
  const partner = new Map<string, string>();
  for (const pair of pairs) {
    partner.set(pair.a, pair.b);
    partner.set(pair.b, pair.a);
  }
  let moved = 0;
  for (const timeline of timelinesOf(file, animation)) {
    const loose = timeline as unknown as TimelineLike;
    if (loose.type !== 'bone' || loose.target === undefined) continue;
    const other = partner.get(loose.target);
    if (other === undefined) continue;
    loose.target = other;
    moved += 1;
  }
  return moved;
}

// ---------------------------------------------------------------------------
// Colar espelhado — item 2
// ---------------------------------------------------------------------------

/**
 * O clipboard com o nome do osso ou do slot trocado pelo par — item 2, "Colar
 * espelhado": copia o braço direito animado, cola no esquerdo.
 *
 * Troca só o NOME (`target.target`), pela primeira regra que casar; os
 * valores não mudam, a mesma lógica de `swapMirroredBones` — num rig cuja
 * pose de repouso já é espelhada, o número atravessa direto. Um alvo sem par
 * (a coluna, o quadril, `drawOrder`, `event`) cola sem trocar de nome.
 */
export function mirrorClipboard(
  clipboard: KeyClipboard, rules: readonly MirrorRule[],
): KeyClipboard {
  const items = clipboard.items.map((item) => {
    const name = item.target.target;
    if (name === undefined) return item;
    const partner = mirrorNameOf(name, rules);
    if (partner === null) return item;
    return { ...item, target: { ...item.target, target: partner } };
  });
  return { base: clipboard.base, items };
}

/**
 * O colar espelhado **que olha o arquivo** — K5 (chat K, 29/09/2026).
 *
 * `mirrorClipboard` troca o nome pela primeira regra que produz UM nome, exista
 * ele ou não: com `/_b` no padrão, `torso` viraria `torso_b`, que ninguém tem.
 * Aqui só vale o par que está em `present`; quem não tem par cola com o nome de
 * sempre, e o nome dele volta em `unpaired`, para o rodapé DIZER — a regra 21:
 * o colar que não acha par não finge que espelhou.
 */
export function mirrorClipboardIn(
  clipboard: KeyClipboard, rules: readonly MirrorRule[], present: ReadonlySet<string>,
): { clipboard: KeyClipboard; unpaired: string[]; swapped: number } {
  const unpaired = new Set<string>();
  let swapped = 0;
  const items = clipboard.items.map((item) => {
    const name = item.target.target;
    if (name === undefined) return item;
    for (const rule of rules) {
      const partner = mirrorNameUnder(name, rule);
      if (partner === null || partner === name || !present.has(partner)) continue;
      swapped += 1;
      return { ...item, target: { ...item.target, target: partner } };
    }
    unpaired.add(name);
    return item;
  });
  return { clipboard: { base: clipboard.base, items }, unpaired: [...unpaired], swapped };
}

/** O rodapé do colar espelhado: o que trocou de lado, e quem ficou sem par. */
export function mirroredPasteNotice(swapped: number, unpaired: readonly string[], rules: readonly MirrorRule[]): string {
  const procurei = rules.map((rule) => `${rule.left}/${rule.right}`).join(', ');
  if (swapped === 0) {
    return `Nenhum par de nome achado: colei sem espelhar. Procurei ${procurei}`;
  }
  const lado = `${swapped} valor${swapped === 1 ? '' : 'es'} trocado${swapped === 1 ? '' : 's'} de lado`;
  if (unpaired.length === 0) return `Colado espelhado: ${lado}`;
  const nomes = unpaired.length <= 4 ? unpaired.join(', ') : `${unpaired.slice(0, 4).join(', ')} e mais ${unpaired.length - 4}`;
  return `Colado espelhado: ${lado}. Sem par, colados iguais: ${nomes}. Procurei ${procurei}`;
}

// ---------------------------------------------------------------------------
// Fechar o ciclo (requirement A6)
// ---------------------------------------------------------------------------

/**
 * The tangent VECTOR leaving the first key of a segment, per component.
 *
 * For a cubic with `P0 = (t0, v0)` and first control point `P1 = (cx1, cy1)`
 * the derivative at `s = 0` is `3 (P1 − P0)`, so `P1 − P0` is the tangent up to
 * the constant 3 — and the constant cancels when the same measure is used at
 * both ends. A `linear` segment has `P1 = P0 + (P3 − P0)/3`, which is the chord
 * written as handles; a `stepped` one has no tangent at all and answers `null`.
 */
export function outgoingTangent(
  curve: CurveDef | undefined,
  components: number,
  t0: number, v0: readonly number[],
  t1: number, v1: readonly number[],
): Array<{ dx: number; dy: number }> | null {
  const shape = readCurve(curve, components);
  if (shape.kind === 'stepped') return null;
  const bezier = toBezier(shape, t0, t1, v0, v1);
  if (bezier.kind !== 'bezier') return null;
  const out: Array<{ dx: number; dy: number }> = [];
  for (let j = 0; j < components; j++) {
    const p = bezier.points[j];
    if (p === undefined) return null;
    out.push({ dx: p.cx1 - t0, dy: p.cy1 - (v0[j] ?? 0) });
  }
  return out;
}

/**
 * The curve of the CLOSING segment, so the loop leaves the end exactly the way
 * it leaves the start.
 *
 * The derivative of a cubic at `s = 1` is `3 (P3 − P2)`. Setting
 *
 *     P2 = P3 − T          with `T` the tangent leaving the first key
 *
 * makes the speed arriving at the end equal to the speed leaving the start, in
 * both `t` and `v`. Wrapping from the last frame to the first is then a
 * straight continuation, and the solavanco is gone.
 *
 * Spec 9.3 requires `t0 ≤ cx1 ≤ cx2 ≤ t1`. When the closing segment is shorter
 * than the opening one, `P3 − T` would fall before `cx1`; `T` is then shortened
 * by the single factor `k` that just fits, which keeps its DIRECTION exact and
 * only reduces how far the handle reaches.
 */
export function closingCurve(
  previousCurve: CurveDef | undefined,
  tangent: ReadonlyArray<{ dx: number; dy: number }>,
  components: number,
  tPrev: number, vPrev: readonly number[],
  tEnd: number, vEnd: readonly number[],
): CurveDef {
  const base = toBezier(readCurve(previousCurve, components), tPrev, tEnd, vPrev, vEnd);
  const span = tEnd - tPrev;
  const points: ControlPoints[] = [];
  for (let j = 0; j < components; j++) {
    const start = base.kind === 'bezier' ? base.points[j] : undefined;
    const cx1 = start?.cx1 ?? tPrev + span / 3;
    const cy1 = start?.cy1 ?? ((vPrev[j] ?? 0) + ((vEnd[j] ?? 0) - (vPrev[j] ?? 0)) / 3);
    const t = tangent[j] ?? { dx: 0, dy: 0 };
    const room = tEnd - cx1;
    const k = t.dx > 1e-12 ? Math.min(1, Math.max(0, room / t.dx)) : 1;
    points.push(clampControls(
      { cx1, cy1, cx2: tEnd - t.dx * k, cy2: (vEnd[j] ?? 0) - t.dy * k },
      tPrev, tEnd,
    ));
  }
  return writeCurve({ kind: 'bezier', points });
}

/** What `closeLoop` did to one timeline. */
export interface CloseLoopReport {
  readonly target: TimelineTarget;
  /** `true` when a key was written at the end of the animation. */
  readonly keyed: boolean;
  /** `true` when the tangents of the closing segment were matched. */
  readonly tangent: boolean;
  /** Said out loud when nothing could be done. */
  readonly refusal?: string;
}

/**
 * Closes the loop of ONE timeline: the first key's value is written again at
 * the end of the animation, and the segment that arrives there is shaped to
 * leave with the same speed the first key leaves with.
 */
export function closeLoopOn(
  file: BoneFile, animation: string, target: TimelineTarget,
): CloseLoopReport {
  const owner = findAnimation(file, animation);
  const timeline = findTimeline(file, animation, target) as unknown as TimelineLike | null;
  if (owner === null || timeline === null) {
    return { target, keyed: false, tangent: false, refusal: 'sem linha' };
  }
  const keys = timeline.keys ?? [];
  const first = keys[0];
  if (first === undefined) {
    return { target, keyed: false, tangent: false, refusal: 'sem chave' };
  }
  const end = roundTime(durationOf(owner));
  if (end <= first.time + 1e-9) {
    return { target, keyed: false, tangent: false, refusal: 'duração curta' };
  }

  const info = targetInfo(target, file);
  if (info.valueless) {
    return { target, keyed: false, tangent: false, refusal: 'sem valor' };
  }

  // 1. The value of the first key, again at the end. `keepCurve` so a curve the
  //    user already drew on an existing end key is not thrown away.
  setKey(file, animation, end, target, clone(first.value), { keepCurve: true });

  // 2. The tangents. Needs a key after the first one (to read the outgoing
  //    tangent) and a key before the end one (to carry the closing curve).
  const after = timeline.keys ?? [];
  const endIndex = after.findIndex((key) => Math.abs(key.time - end) <= 1e-9);
  const previous = endIndex > 0 ? after[endIndex - 1] : undefined;
  const second = after[1];
  if (!info.interpolable || info.components === 0
    || previous === undefined || second === undefined || previous === first) {
    return { target, keyed: true, tangent: false };
  }

  const c = info.components;
  const v0 = componentsOf(first.value, c);
  const v1 = componentsOf(second.value, c);
  const tangent = outgoingTangent(first.curve, c, first.time, v0, second.time, v1);
  if (tangent === null) return { target, keyed: true, tangent: false };

  const vPrev = componentsOf(previous.value, c);
  const endKey = after[endIndex];
  const vEnd = componentsOf(endKey?.value, c);
  previous.curve = closingCurve(previous.curve, tangent, c, previous.time, vPrev, end, vEnd);
  return { target, keyed: true, tangent: true };
}

/** Closes the loop of every timeline named. Returns one report per timeline. */
export function closeLoop(
  file: BoneFile, animation: string, targets: readonly TimelineTarget[],
): CloseLoopReport[] {
  return targets.map((target) => closeLoopOn(file, animation, target));
}

/** Every timeline of an animation, as targets — what "tudo" means for a button. */
export function allTargetsOf(file: BoneFile, animation: string): TimelineTarget[] {
  return timelinesOf(file, animation).map((timeline) => targetOfTimeline(timeline));
}
