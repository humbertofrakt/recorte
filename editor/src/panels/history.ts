/**
 * Painel **Histórico** (dono C) — lote 19, rodada 3.
 *
 * A aba `History` do Spriter, ao lado de `Animations`. Uma linha por passo de
 * desfazer, com o nome que a própria `Command` carrega. Clicar numa linha
 * volta — ou avança — até ela.
 *
 * **Ele nunca mexe na pilha.** A conta de quantos passos faltam é do
 * `history-model.ts`, e o que este painel faz é chamar `doc.undo()` ou
 * `doc.redo()` essa quantidade de vezes. Uma pilha mexida por fora deixa de
 * ser uma pilha, e desfazer deixa de ser confiável no dia em que mais importa.
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel } from '../contract.js';
import { clear, el } from './dom.js';
import { historyRows, jumpNotice, stepsTo } from './history-model.js';
import type { HistoryRow, UndoView } from './history-model.js';

/** Uma pilha sem nada, para um documento que não expõe a sua. */
const PILHA_VAZIA: UndoView = { entries: () => [], cursor: () => -1 };

class HistoryPanel implements Panel {
  readonly id = 'historico';
  readonly title = 'Histórico';
  /**
   * Todo tipo de mudança: um passo de desfazer nasce de qualquer um deles, e
   * a lista tem que crescer no mesmo instante em que o passo acontece.
   */
  readonly listensTo = ['file', 'structure', 'transform', 'selection', 'assets'] as const;

  private doc: EditorDoc | null = null;
  private list: HTMLElement | null = null;

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    clear(host);
    // `painel` traz as cores do tema — o mesmo defeito da aba Ordem (lote 25).
    host.classList.add('painel', 'historico');
    // Rodada 47, lote 4 (R10 do doc 68): uma linha de ajuda; a frase inteira na dica.
    const topo = el('p', 'historico-aviso', HISTORY_HELP_SHORT);
    topo.title = HISTORY_HELP;
    this.list = el('div', 'historico-lista');
    this.list.setAttribute('role', 'list');
    host.append(topo, this.list);
    this.render();
  }

  refresh(_change: DocChange): void {
    this.render();
  }

  unmount(): void {
    this.doc = null;
    this.list = null;
  }

  private render(): void {
    const doc = this.doc;
    const list = this.list;
    if (doc === null || list === null) return;
    clear(list);
    const pilha = doc.history ?? PILHA_VAZIA;
    for (const row of historyRows(pilha)) list.append(this.buildRow(doc, row));
    // A lista cresce para baixo; quem olha quer ver o que acabou de acontecer.
    list.scrollTop = list.scrollHeight;
  }

  private buildRow(doc: EditorDoc, row: HistoryRow): HTMLElement {
    const node = el('button', `historico-linha historico-${row.state}`);
    (node as HTMLButtonElement).type = 'button';
    node.setAttribute('role', 'listitem');
    node.append(
      el('span', 'historico-marca', row.state === 'atual' ? '●' : '○'),
      el('span', 'historico-nome', row.label),
    );
    const dica = row.state === 'atual'
      ? `${row.label}: é onde o documento está agora`
      : `Ir para: ${row.label}`;
    node.title = dica;
    node.setAttribute('aria-label', dica);
    if (row.state === 'atual') node.setAttribute('aria-current', 'step');
    node.addEventListener('click', () => this.jumpTo(doc, row));
    return node;
  }

  /** Volta ou avança até aquele passo, um `undo`/`redo` de cada vez. */
  private jumpTo(doc: EditorDoc, row: HistoryRow): void {
    const passos = stepsTo(doc.history ?? PILHA_VAZIA, row.index);
    if ('undo' in passos) {
      for (let i = 0; i < passos.undo; i++) doc.undo();
    } else {
      for (let i = 0; i < passos.redo; i++) doc.redo();
    }
    doc.notice(jumpNotice(passos, row.label));
    this.render();
  }
}

export const historyPanel = new HistoryPanel();
registerPanel(historyPanel);

/** A ajuda do Histórico, inteira (na dica) e numa linha (à vista) — rodada 47, lote 4. */
export const HISTORY_HELP = 'Clique num passo para voltar até ele. Os cinzas foram desfeitos.';
export const HISTORY_HELP_SHORT = 'Clique num passo para voltar a ele';
