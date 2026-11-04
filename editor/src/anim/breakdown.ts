/**
 * **O meio-termo (breakdown)** — rodada 17, PL-25 (05/10/2026).
 *
 * Decisão do Diretor, a partir do plano D4 e do Harmony 25 ("Breakdown que
 * favorece uma chave"): na agulha, uma chave **entre a chave de antes e a de
 * depois** de cada linha — no meio, puxando para a anterior (1/3) ou para a
 * seguinte (2/3). É chave comum: nada sai do programa diferente do que sairia
 * se a pessoa tivesse posado à mão.
 *
 * Puro: a conta mora aqui, e quem grava é `keyValuesNow` (um passo de
 * desfazer). Vale para as linhas de OSSO de números (posição, giro, escala,
 * inclinação); a linha sem chave dos dois lados, ou de valor que não é
 * número, fica como está, e a frase do rodapé conta quantas entraram.
 */

import type { BoneFile, KeyValue } from '../../../runtime/src/index.js';
import { sameTime, targetOfTimeline, timelinesOf } from './keying.js';
import type { TimelineTarget } from './keying.js';

export type BreakdownKind = 'meio' | 'anterior' | 'seguinte';

/** Quanto do caminho da chave de antes até a de depois. */
export const BREAKDOWN_FRACTION: Readonly<Record<BreakdownKind, number>> = Object.freeze({
  meio: 0.5,
  anterior: 1 / 3,
  seguinte: 2 / 3,
});

/** O nome de cada um, no menu e no rodapé. */
export const BREAKDOWN_LABEL: Readonly<Record<BreakdownKind, string>> = Object.freeze({
  meio: 'Meio-termo',
  anterior: 'Meio-termo puxando para a anterior',
  seguinte: 'Meio-termo puxando para a seguinte',
});

interface KeyLike { time?: number; value?: unknown }

function mix(a: unknown, b: unknown, f: number): KeyValue | null {
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * f;
  if (Array.isArray(a) && Array.isArray(b) && a.length === b.length
    && a.every((x) => typeof x === 'number') && b.every((x) => typeof x === 'number')) {
    return (a as number[]).map((x, i) => x + ((b[i] as number) - x) * f) as unknown as KeyValue;
  }
  return null;
}

/**
 * As chaves do meio-termo em `time`: uma por linha de osso de `bones` que tem
 * chave antes e chave depois. `bones` vazio = todos os ossos (a pose inteira).
 */
export function breakdownValues(
  file: BoneFile, animation: string, time: number, bones: readonly string[], kind: BreakdownKind,
): Array<{ target: TimelineTarget; value: KeyValue }> {
  const f = BREAKDOWN_FRACTION[kind];
  const quais = new Set(bones);
  const out: Array<{ target: TimelineTarget; value: KeyValue }> = [];
  for (const timeline of timelinesOf(file, animation)) {
    const target = targetOfTimeline(timeline);
    if (target.type !== 'bone' || target.target === undefined) continue;
    if (quais.size > 0 && !quais.has(target.target)) continue;
    const keys = ((timeline as { keys?: KeyLike[] }).keys ?? [])
      .filter((k) => typeof k.time === 'number')
      .slice()
      .sort((a, b) => a.time! - b.time!);
    let antes: KeyLike | null = null;
    let depois: KeyLike | null = null;
    for (const k of keys) {
      if (k.time! < time && !sameTime(k.time!, time)) antes = k;
      else if (k.time! > time && !sameTime(k.time!, time)) { depois = k; break; }
    }
    if (antes === null || depois === null) continue;
    const value = mix(antes.value, depois.value, f);
    if (value !== null) out.push({ target, value });
  }
  return out;
}

/** A frase do rodapé, dita com o que aconteceu (regra 21). */
export function breakdownNotice(kind: BreakdownKind, count: number, time: number, allBones: boolean): string {
  const quando = `${time.toFixed(2).replace('.', ',')} s`;
  if (count === 0) {
    return `${BREAKDOWN_LABEL[kind]}: nenhuma linha tem chave antes e depois de ${quando}`
      + (allBones ? '' : ' nos ossos escolhidos') + '. Nada mudou';
  }
  return `${BREAKDOWN_LABEL[kind]} em ${quando}: ${count} chave${count === 1 ? '' : 's'}`
    + (allBones ? ', na pose inteira (nenhum osso escolhido)' : ', nos ossos escolhidos');
}
