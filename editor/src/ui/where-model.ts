/**
 * **Onde se está** — degrau 11, lote 1 (18/09/2026), M4 de vez.
 *
 * O interruptor `Montagem | Animando` saiu da barra, e o `Ctrl+Tab` saiu com
 * ele. Não há mais modo: há **o que está aberto**. `doc.animation === null` é a
 * base aberta, e o rodapé diz *"Base: homem"*; com uma animação aberta ele diz
 * *"Animação: andar"*. É a mesma frase que o Spriter escreve no título da
 * paleta de animações, e é o que o Humberto ditou.
 *
 * Nada some sem porta (regra 21): a dica do rodapé diz **como se troca** — a
 * janela Animação abre a base com um clique no corpo, e a animação com um
 * clique no nome; o menu Animação tem **Abrir a base**.
 *
 * Módulo puro: recebe o que precisa e devolve palavras.
 */

/** O que o rodapé precisa saber do documento. */
export interface WhereInput {
  /** `doc.animation`: `null` = a base aberta. */
  animation: string | null;
  /** O nome do corpo em foco: o `skeleton.name`, ou o nome do arquivo. */
  body: string;
  /**
   * O nome do corpo do instante, quando a animação virou de corpo (9.13) e ele
   * é outro. `null` = o próprio corpo em foco.
   */
  bodyNow?: string | null;
}

/** O que o rodapé escreve. */
export interface WhereLabel {
  /** `'base'` ou `'animacao'`: só para a cor. Nunca para esconder ferramenta. */
  kind: 'base' | 'animacao';
  /** Em negrito: *"Base: homem"*, *"Animação: andar"*. */
  title: string;
  /** Ao lado, em tom suave: para onde vai a mexida. */
  detail: string;
  /** A dica: por onde se troca, agora que o interruptor saiu. */
  hint: string;
}

/** A porta que ficou no lugar do interruptor, escrita uma vez só. */
export const WHERE_DOORS =
  'Para trocar: na janela Animação, clique na base para abrir a base, ou no nome de uma animação para abri-la. '
  + 'No menu Animação, Abrir a base.';

/** O nome do corpo sem a extensão: `homem.bone` se lê *homem*. */
export function bodyTitle(name: string): string {
  const limpo = name.trim().replace(/\.bone$/i, '');
  return limpo.length > 0 ? limpo : 'sem nome';
}

export function whereLabel(input: WhereInput): WhereLabel {
  const corpo = bodyTitle(input.body);
  if (input.animation === null) {
    return {
      kind: 'base',
      title: `Base: ${corpo}`,
      detail: 'Mexer grava na base, e vale em todas as animações.',
      hint: `A base de ${corpo} está aberta. ${WHERE_DOORS}`,
    };
  }
  const virou = input.bodyNow !== undefined && input.bodyNow !== null && bodyTitle(input.bodyNow) !== corpo;
  return {
    kind: 'animacao',
    title: `Animação: ${input.animation}`,
    detail: virou
      ? `Mexer grava chave. Neste instante a base é ${bodyTitle(input.bodyNow!)}.`
      : 'Mexer grava chave.',
    hint: `A animação ${input.animation}, de ${corpo}, está aberta. ${WHERE_DOORS}`,
  };
}
