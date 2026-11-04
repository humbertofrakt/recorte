/**
 * A linha Resumo da folha de chaves (dono C) — item 8 da pesquisa.
 *
 * A folha tem uma linha por propriedade, e um personagem sério tem sessenta.
 * Com os grupos fechados — que é como se trabalha — não se vê chave nenhuma, e
 * a pergunta mais comum de quem anima ("onde estão as poses?") fica sem resposta
 * na tela.
 *
 * O Resumo responde: um losango em cada tempo que tem chave em QUALQUER linha,
 * sempre visível. Clicar escolhe todas as chaves daquele tempo; arrastar move
 * todas juntas, num passo de desfazer só.
 *
 * Tudo aqui é conta sobre o `.bone`, sem tela nenhuma.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { allKeyRefs, allKeyTimes, sameTime } from './keying.js';
import type { KeyRef } from './keying.js';

/**
 * Os tempos que têm chave, em ordem, sem repetir.
 *
 * É `allKeyTimes`, e de propósito: as setas `↑` e `↓` já pulam por essa mesma
 * lista quando não há linha escolhida. O Resumo desenha o que as setas andam —
 * se fossem duas listas, um losango poderia ficar num tempo onde a seta não
 * para, e ninguém entenderia por quê.
 */
export function summaryTimes(file: BoneFile, animation: string): number[] {
  return allKeyTimes(file, animation);
}

/**
 * Toda chave que está naquele tempo, de todas as linhas.
 *
 * `sameTime` e não `===`: tempo é ponto flutuante, e `0.1 + 0.2` não é `0.3`.
 * Comparar por igualdade exata deixaria de fora justamente as chaves que uma
 * conta anterior mexeu — que são as que mais interessam.
 */
export function refsAtTime(file: BoneFile, animation: string, time: number): KeyRef[] {
  return allKeyRefs(file, animation).filter((ref) => sameTime(ref.time, time));
}

/**
 * `true` quando aquele tempo junta mais de um TIPO de alvo.
 *
 * Um tempo só com ossos é uma pose. Um tempo com osso e evento é uma pose e
 * mais alguma coisa — um som, um golpe —, e essa diferença merece uma cor
 * própria no losango: quem arrasta precisa saber que está levando junto o
 * evento, e não só a pose.
 */
export function isMixedTime(file: BoneFile, animation: string, time: number): boolean {
  const types = new Set(refsAtTime(file, animation, time).map((ref) => ref.target.type));
  return types.size > 1;
}

/** Uma linha do Resumo, pronta para desenhar. */
export interface SummaryMark {
  time: number;
  /** Quantas chaves estão neste tempo, somando todas as linhas. */
  count: number;
  /** Mais de um tipo de alvo neste tempo. */
  mixed: boolean;
}

/**
 * A linha inteira do Resumo numa passada só.
 *
 * Chamar `refsAtTime` uma vez por losango percorreria todas as chaves da
 * animação uma vez por tempo — e numa animação com trinta poses e sessenta
 * linhas isso é caro para uma coisa que se redesenha a cada tecla. Aqui se
 * percorre uma vez.
 */
export function summaryMarks(file: BoneFile, animation: string): SummaryMark[] {
  const times = summaryTimes(file, animation);
  if (times.length === 0) return [];
  const counts = times.map(() => 0);
  const types: Array<Set<string>> = times.map(() => new Set<string>());
  for (const ref of allKeyRefs(file, animation)) {
    const at = times.findIndex((time) => sameTime(time, ref.time));
    if (at < 0) continue;
    counts[at] += 1;
    types[at].add(ref.target.type);
  }
  return times.map((time, i) => ({ time, count: counts[i], mixed: types[i].size > 1 }));
}
