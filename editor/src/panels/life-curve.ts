/**
 * **As curvas e o gradiente ao longo da vida** — rodada 16, lote 4.
 *
 * `scaleOverLifetime`, `alphaOverLifetime` e `colorOverLifetime` (§9.6 e §9.7
 * da extensão) são chaves `{time, value, curve}` com `time` de 0 a 1 da vida —
 * o mesmo formato de chave da §9.2 da spec. Até aqui só os modelos prontos as
 * escreviam: a ficha não tinha onde mexer.
 *
 * Este módulo é a parte **pura**: ler as chaves, avaliar no mesmo jeito do
 * runtime (`normalizeCurve` + `sampleCurve`, as mesmas funções que o
 * `particles/emitter.ts` chama), e as operações de pôr, mover e tirar uma
 * chave, cada uma devolvendo a lista nova inteira — quem grava é um
 * `SetProperty` no anexo, com desfazer de graça. O desenho é do `properties.ts`.
 *
 * **Por que não o painel Curvas.** Ele mexe em chaves de ANIMAÇÃO, com o tempo em
 * segundos, por `SetKey` dentro de uma animação aberta. Aqui o tempo é a vida
 * da partícula, e as chaves moram no anexo, valendo em toda animação.
 */

import { normalizeCurve, sampleCurve } from '../../../runtime/src/index.js';

export interface LifeKey {
  time: number;
  value: number;
  curve?: unknown;
}

export interface LifeColorKey {
  time: number;
  value: [number, number, number, number];
  curve?: unknown;
}

const finito = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** As chaves de número do arquivo. O que não é chave (sem `time` ou `value`) fica de fora. */
export function readLifeKeys(raw: unknown): LifeKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((k): k is LifeKey => k !== null && typeof k === 'object'
    && finito((k as LifeKey).time) && finito((k as LifeKey).value));
}

/** As chaves de cor do arquivo (`color4`). */
export function readColorKeys(raw: unknown): LifeColorKey[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((k): k is LifeColorKey => k !== null && typeof k === 'object' && finito((k as LifeColorKey).time)
    && Array.isArray((k as LifeColorKey).value) && (k as LifeColorKey).value.length === 4
    && (k as LifeColorKey).value.every(finito));
}

/** A posição `lo` da chave que começa o trecho de `u` (a lista já está em ordem). */
function trecho<T extends { time: number }>(keys: readonly T[], u: number): number {
  let lo = 0;
  let hi = keys.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (keys[mid]!.time <= u) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/**
 * O valor em `u` (0..1 da vida), **pela conta do runtime**: antes da primeira
 * chave vale a primeira, depois da última vale a última, e sem chave vale 1.
 */
export function sampleLife(keys: readonly LifeKey[], u: number): number {
  const n = keys.length;
  if (n === 0) return 1;
  if (u <= keys[0]!.time) return keys[0]!.value;
  if (u >= keys[n - 1]!.time) return keys[n - 1]!.value;
  const lo = trecho(keys, u);
  const a = keys[lo]!;
  const b = keys[lo + 1]!;
  const curva = normalizeCurve(a.curve as never, 1, true, a.time, b.time);
  return sampleCurve(curva, 0, a.time, b.time, a.value, b.value, u);
}

/** A cor em `u`, pela conta do runtime (§9.7); sem chave, branco. */
export function sampleLifeColor(keys: readonly LifeColorKey[], u: number): [number, number, number, number] {
  const n = keys.length;
  if (n === 0) return [1, 1, 1, 1];
  if (u <= keys[0]!.time) return [...keys[0]!.value];
  if (u >= keys[n - 1]!.time) return [...keys[n - 1]!.value];
  const lo = trecho(keys, u);
  const a = keys[lo]!;
  const b = keys[lo + 1]!;
  if (a.time === b.time) return [...a.value];
  const curva = normalizeCurve(a.curve as never, 4, true, a.time, b.time);
  return [0, 1, 2, 3].map((j) => sampleCurve(curva, j, a.time, b.time, a.value[j]!, b.value[j]!, u)) as [number, number, number, number];
}

/** De onde até onde a curva se desenha. A transparência é 0..1; o tamanho cresce com as chaves. */
export function lifeRange(field: string, keys: readonly LifeKey[]): [number, number] {
  if (field === 'alphaOverLifetime') return [0, 1];
  const maior = Math.max(1, ...keys.map((k) => k.value));
  return [0, Math.max(2, Math.ceil(maior * 1.25 * 2) / 2)];
}

const tres = (v: number): number => Math.round(v * 1000) / 1000;
const entre = (v: number, a: number, b: number): number => Math.min(b, Math.max(a, v));

/**
 * **Pôr uma chave** em `time`, com `value`. Sem chave nenhuma, a curva nasce
 * com as duas pontas valendo `padrao` (o que o runtime já fazia: sem chave, 1)
 * — senão a primeira chave sozinha mandaria na vida inteira.
 */
export function addLifeKey(keys: readonly LifeKey[], time: number, value: number, padrao = 1): LifeKey[] {
  const base: LifeKey[] = keys.length === 0 ? [{ time: 0, value: padrao }, { time: 1, value: padrao }] : keys.map((k) => ({ ...k }));
  const t = tres(entre(time, 0, 1));
  if (base.some((k) => Math.abs(k.time - t) < 0.001)) return base;
  const nova: LifeKey = { time: t, value: tres(value) };
  const i = base.findIndex((k) => k.time > t);
  if (i < 0) base.push(nova);
  else base.splice(i, 0, nova);
  return base;
}

/**
 * **Mover uma chave.** O tempo fica entre as vizinhas (a ordem nunca se
 * inverte: o runtime procura o trecho em lista ordenada); a primeira chave não
 * passa de 0 nem a última de 1. O valor fica dentro de `faixa`.
 */
export function moveLifeKey(
  keys: readonly LifeKey[], i: number, time: number, value: number, faixa: readonly [number, number],
): LifeKey[] {
  const out = keys.map((k) => ({ ...k }));
  const k = out[i];
  if (k === undefined) return out;
  const antes = i > 0 ? out[i - 1]!.time + 0.001 : 0;
  const depois = i < out.length - 1 ? out[i + 1]!.time - 0.001 : 1;
  k.time = tres(entre(time, antes, Math.max(antes, depois)));
  k.value = tres(entre(value, faixa[0], faixa[1]));
  return out;
}

/** **Tirar uma chave.** As duas pontas ficam: uma curva de uma chave só não é curva. `null` = não pode. */
export function removeLifeKey<T extends { time: number }>(keys: readonly T[], i: number): T[] | null {
  if (keys.length <= 2 || i <= 0 || i >= keys.length - 1) return null;
  return keys.filter((_, j) => j !== i).map((k) => ({ ...k }));
}

/** As curvas prontas — o primeiro passo de quem não sabe por onde começar. */
export const LIFE_PRESETS: Readonly<Record<string, ReadonlyArray<{ name: string; keys: LifeKey[] }>>> = {
  scaleOverLifetime: [
    { name: 'igual a vida toda', keys: [{ time: 0, value: 1 }, { time: 1, value: 1 }] },
    { name: 'cresce', keys: [{ time: 0, value: 0.3 }, { time: 1, value: 1.5 }] },
    { name: 'encolhe', keys: [{ time: 0, value: 1 }, { time: 1, value: 0 }] },
    { name: 'pulsa', keys: [{ time: 0, value: 0.5 }, { time: 0.5, value: 1.2 }, { time: 1, value: 0.5 }] },
  ],
  alphaOverLifetime: [
    { name: 'sempre inteira', keys: [{ time: 0, value: 1 }, { time: 1, value: 1 }] },
    { name: 'some no fim', keys: [{ time: 0, value: 1 }, { time: 0.7, value: 1 }, { time: 1, value: 0 }] },
    { name: 'aparece e some', keys: [{ time: 0, value: 0 }, { time: 0.15, value: 1 }, { time: 0.8, value: 1 }, { time: 1, value: 0 }] },
    { name: 'some aos poucos', keys: [{ time: 0, value: 1 }, { time: 1, value: 0 }] },
  ],
};

// ---------------------------------------------------------------------------
// O gradiente (colorOverLifetime)
// ---------------------------------------------------------------------------

/** Uma cor nova em `time`: a que o gradiente já mostra ali, para nada pular. */
export function addColorKey(keys: readonly LifeColorKey[], time: number): LifeColorKey[] {
  const branco: [number, number, number, number] = [1, 1, 1, 1];
  const base: LifeColorKey[] = keys.length === 0
    ? [{ time: 0, value: [...branco] }, { time: 1, value: [...branco] }]
    : keys.map((k) => ({ ...k, value: [...k.value] as [number, number, number, number] }));
  const t = tres(entre(time, 0, 1));
  if (base.some((k) => Math.abs(k.time - t) < 0.001)) return base;
  const cor = sampleLifeColor(base, t).map(tres) as [number, number, number, number];
  const i = base.findIndex((k) => k.time > t);
  const nova: LifeColorKey = { time: t, value: cor };
  if (i < 0) base.push(nova);
  else base.splice(i, 0, nova);
  return base;
}

/** Mover uma cor no tempo, sem passar das vizinhas. */
export function moveColorKey(keys: readonly LifeColorKey[], i: number, time: number): LifeColorKey[] {
  const tempos = moveLifeKey(keys.map((k) => ({ time: k.time, value: 0 })), i, time, 0, [0, 0]);
  return keys.map((k, j) => ({ ...k, value: [...k.value] as [number, number, number, number], time: tempos[j]!.time }));
}

/** Trocar a cor de uma chave. O alfa da chave fica: o seletor de cor do navegador não tem alfa. */
export function setColorKey(keys: readonly LifeColorKey[], i: number, rgb: readonly [number, number, number]): LifeColorKey[] {
  return keys.map((k, j) => (j === i
    ? { ...k, value: [tres(rgb[0]), tres(rgb[1]), tres(rgb[2]), k.value[3]] as [number, number, number, number] }
    : { ...k, value: [...k.value] as [number, number, number, number] }));
}

/**
 * O CSS da faixa do gradiente, amostrado pela conta do runtime (17 paradas).
 * `recuo` (px) põe as paradas onde os losangos estão: o nascimento a `recuo`
 * px da borda esquerda, a morte a `recuo` px da direita.
 */
export function gradientCss(keys: readonly LifeColorKey[], recuo = 0): string {
  const paradas: string[] = [];
  for (let i = 0; i <= 16; i++) {
    const u = i / 16;
    const [r, g, b, a] = sampleLifeColor(keys, u);
    const onde = recuo === 0 ? `${Math.round(u * 100)}%` : `calc(${recuo}px + ${u} * (100% - ${2 * recuo}px))`;
    paradas.push(`rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${tres(a)}) ${onde}`);
  }
  return `linear-gradient(to right, ${paradas.join(', ')})`;
}

type Cor4 = [number, number, number, number];

/** O par `startColor` do arquivo (§9.7). O que falta ou não é cor vale branco, como no runtime. */
export function readStartColors(raw: unknown): [Cor4, Cor4] {
  const branco = (): Cor4 => [1, 1, 1, 1];
  const cor = (v: unknown): Cor4 => (Array.isArray(v) && v.length === 4 && v.every(finito) ? [...v] as Cor4 : branco());
  return Array.isArray(raw) ? [cor(raw[0]), cor(raw[1])] : [branco(), branco()];
}

/**
 * **A barra da Cor na vida, com a cor que se vê** — rodada 48 (07/10/2026), a
 * mão do Humberto: trocou a Cor ao nascer e a barra não mudou. A conta é a do
 * Unity e do Godot, e a da §9.7 da extensão: `startColor × colorOverLifetime`.
 *
 * Três faixas no mesmo fundo, sem crescer a linha: em cima (60 %) a Cor na
 * vida, a que os losangos editam; embaixo, finas, a cor da tela com a Cor ao
 * nascer «de» (20 %) e com a «a» (20 %). Sem Cor na vida, em cima é branco e
 * embaixo a Cor ao nascer pura.
 */
export function gradientBandsCss(start: readonly [Cor4, Cor4], keys: readonly LifeColorKey[], recuo = 0): string {
  const faixa = (vezes: Cor4 | null): string => {
    const paradas: string[] = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16;
      const vida = sampleLifeColor(keys, u);
      const [r, g, b, a] = vezes === null ? vida : vida.map((c, j) => c * vezes[j]!);
      const onde = recuo === 0 ? `${Math.round(u * 100)}%` : `calc(${recuo}px + ${u} * (100% - ${2 * recuo}px))`;
      paradas.push(`rgba(${Math.round(r! * 255)}, ${Math.round(g! * 255)}, ${Math.round(b! * 255)}, ${tres(a!)}) ${onde}`);
    }
    return `linear-gradient(to right, ${paradas.join(', ')})`;
  };
  return `${faixa(null)} 0 0 / 100% 60% no-repeat, `
    + `${faixa(start[0])} 0 75% / 100% 20% no-repeat, `
    + `${faixa(start[1])} 0 100% / 100% 20% no-repeat`;
}
