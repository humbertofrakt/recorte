/**
 * O painel **Histórico**, como conta (dono C) — lote 19, rodada 3.
 *
 * No Spriter é a aba `History`, ao lado de `Animations`. Aqui não existia: a
 * única forma de saber o que se tinha feito era abrir o menu Editar e ler
 * "Desfazer Mover osso" — **um** passo, o de cima da pilha.
 *
 * Uma lista de passos responde outra pergunta, e é uma pergunta que se faz
 * muito: *"em que ponto isto ainda estava certo?"*. Com a lista, voltar cinco
 * passos é um clique, e não cinco `Ctrl+Z` contados de cabeça.
 *
 * Este arquivo é só a conta. Ele não desenha nada e **não mexe na pilha**: o
 * painel chama `doc.undo()` e `doc.redo()` tantas vezes quantas esta conta
 * disser. Uma pilha mexida por fora deixa de ser uma pilha.
 */

// `UndoView` mora em `contract.ts` desde o lote A4: o documento a devolve.
import type { UndoView } from '../contract.js';
export type { UndoView } from '../contract.js';

/** Em que pé está um passo da lista. */
export type HistoryState =
  /** Feito, e ainda vale. */
  | 'feito'
  /** O ponto em que o documento está agora. */
  | 'atual'
  /** Desfeito: continua na lista, cinza, até alguém escrever por cima. */
  | 'desfeito';

/** Uma linha do painel Histórico. */
export interface HistoryRow {
  /** O `label` que a própria `Command` já carrega: "Mover osso". */
  label: string;
  /** A posição na pilha, contando do mais antigo. */
  index: number;
  state: HistoryState;
}

/**
 * As linhas do painel, da mais antiga para a mais nova.
 *
 * A primeira linha é sempre **"Arquivo aberto"**, no índice `-1`: é o estado
 * de antes do primeiro comando, e ele é um ponto para o qual se pode voltar.
 * Sem ele, desfazer tudo seria um lugar sem nome na lista.
 */
export function historyRows(stack: UndoView): HistoryRow[] {
  const cursor = stack.cursor();
  const rows: HistoryRow[] = [{
    label: 'Arquivo aberto',
    index: -1,
    state: cursor === -1 ? 'atual' : 'feito',
  }];
  for (const entry of stack.entries()) {
    rows.push({
      label: entry.label,
      index: entry.index,
      state: entry.undone ? 'desfeito' : (entry.index === cursor ? 'atual' : 'feito'),
    });
  }
  return rows;
}

/**
 * Quantos `undo` ou `redo` levam o documento até aquele passo.
 *
 * Devolve `{ undo: n }` para voltar, `{ redo: n }` para avançar, e
 * `{ undo: 0 }` quando já se está lá. Nunca um número negativo: quem chama não
 * tem que decidir para que lado ir, e é justamente aí que se erra.
 */
export function stepsTo(stack: UndoView, index: number): { undo: number } | { redo: number } {
  const cursor = stack.cursor();
  if (index === cursor) return { undo: 0 };
  if (index < cursor) return { undo: cursor - index };
  return { redo: index - cursor };
}

/**
 * A frase que a barra de baixo diz depois de pular na lista.
 *
 * Um pulo de cinco passos que não diz nada parece um pulo que não aconteceu,
 * e a pessoa clica de novo.
 */
export function jumpNotice(steps: { undo: number } | { redo: number }, label: string): string {
  if ('undo' in steps) {
    if (steps.undo === 0) return `Já está em ${label}`;
    return steps.undo === 1
      ? `Voltou um passo, até ${label}`
      : `Voltou ${steps.undo} passos, até ${label}`;
  }
  return steps.redo === 1
    ? `Avançou um passo, até ${label}`
    : `Avançou ${steps.redo} passos, até ${label}`;
}
