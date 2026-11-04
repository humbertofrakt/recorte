/**
 * Quando um painel de lista precisa refazer o DOM — e quando NÃO precisa.
 *
 * Sem DOM. Uma função pura, e um teste que a cobre sem navegador.
 *
 * **Por que isto existe.** O Humberto, 09/09/2026, pela segunda vez:
 * *"quando tiver uma animação rodando, quero poder clicar em outra e ela tocar.
 * Atualmente isso está travado."* O motor estava certo desde o lote 24 — o
 * `switchAnimation` troca e continua tocando. O que não acontecia era o
 * **clique**.
 *
 * O painel Animações escuta `time` e refazia a lista inteira a cada aviso.
 * Tocando, o tempo muda a cada quadro: o botão em que o dedo desceu já tinha
 * sido destruído quando o dedo subiu, e o navegador **não dispara `click`**
 * quando o `mousedown` e o `mouseup` caem em elementos diferentes. Nada estava
 * travado; a lista é que fugia da mão.
 *
 * A saída não é trocar `click` por `mousedown` — isso esconderia a causa e
 * quebraria o arrasto. A saída é **não refazer o que não mudou**.
 */

import type { ChangeKind } from '../contract.js';

/** O que fazer com a lista depois de um aviso do documento. */
export type Redraw =
  /** Nada mudou na tela. Não toque no DOM. */
  | 'nada'
  /** Só mudou qual linha está escolhida: troque o realce, e mais nada. */
  | 'so-escolha'
  /** As linhas em si mudaram: refaça. */
  | 'refazer';

/** O que o painel tem desenhado, ou o que ele teria de desenhar agora. */
export interface ListShape {
  /**
   * Uma assinatura das linhas: nome, e tudo o mais que a linha mostra.
   *
   * Ela é comparada **por texto**. Duas listas com a mesma assinatura desenham
   * igual, e é isso que autoriza não mexer no DOM.
   */
  rows: string;
  /** A linha em destaque, ou `null`. */
  picked: string | null;
}

/**
 * As mudanças que refazem a lista **sem perguntar**.
 *
 * `file` é outro documento inteiro. `assets` troca as imagens, e uma miniatura
 * não entra na assinatura — ela é um `data:` de mil caracteres, e comparar mil
 * caracteres a cada aviso custaria mais do que refazer.
 */
const ALWAYS: readonly ChangeKind[] = Object.freeze(['file', 'assets']);

/**
 * O que fazer, comparando o que está na tela com o que teria de estar.
 *
 * A conta é a mesma para todo painel de lista, e é de propósito: um painel que
 * decide isso do seu jeito é um painel que um dia decide errado sozinho.
 */
export function redrawPlan(kind: ChangeKind, before: ListShape, after: ListShape): Redraw {
  if (ALWAYS.includes(kind)) return 'refazer';
  if (before.rows !== after.rows) return 'refazer';
  if (before.picked !== after.picked) return 'so-escolha';
  return 'nada';
}

/**
 * Junta os pedaços de cada linha numa assinatura.
 *
 * `JSON.stringify`, e não um separador escolhido a dedo. Um separador só
 * funciona se for um caractere que nunca aparece nos dados, e **nome é texto do
 * usuário**: um slot chamado `a|1` daria a mesma assinatura que dois campos
 * `a` e `1`. Duas listas diferentes com a mesma assinatura fariam a tela
 * **deixar de se refazer** — que é justamente o defeito que este arquivo existe
 * para não ter. O teste dessa colisão está no `lote26`, e foi ele que pegou o
 * erro na primeira escrita desta função.
 */
export function signature(parts: readonly (string | number | boolean | null)[][]): string {
  return JSON.stringify(parts);
}
