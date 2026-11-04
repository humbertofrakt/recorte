/**
 * **Ajuda → Atalhos do teclado**, agora com a troca — degrau 11, lote 2 (G7).
 *
 * A mesma tabela de sempre (menu, item, tecla), saída de `ui/keys.ts`. O que
 * entrou: cada linha que pode trocar tem um **lápis**; clicar nele e apertar a
 * tecla nova troca **na hora**, e a troca fica nesta máquina. A linha trocada
 * diz *"era Ctrl+K"* e ganha a **seta de voltar**. O conflito aparece escrito
 * em cima da tabela, e a tecla **não** troca.
 *
 * Decisão nenhuma mora aqui: quem decide é `ui/key-swaps.ts` (`proposeSwap`).
 * Este arquivo só desenha e escuta a tecla.
 *
 * **A segunda porta da paleta** — 22/09/2026, lote 2 do plano `COMO SABER O
 * QUE O PROGRAMA TEM`. Esta janela é onde para quem está procurando **onde
 * fica** uma coisa: ele abre os Atalhos, corre a lista com o olho, e se o nome
 * não estiver lá ele fica sem saída. O botão *"Procurar um comando…"* põe a
 * paleta a um clique dali — a busca que já existia desde o item 110 e que o
 * Humberto não sabia que existia.
 *
 * Ele chama `runAction('paleta')`, que é o MESMO id do menu Ajuda: não há ação
 * nova, não há tecla nova, e nada foi duplicado. É o desenho do botão direito
 * dos painéis, que também alcança ações por `runAction` (ver `CONTEXT_ACTIONS`
 * em `ui/action-audit.ts`). E é palavra, e não ícone, porque a tira de baixo
 * desta janela é de palavras — como na Janela de Problemas, onde os ícones
 * escondiam o nome do conserto na dica.
 */

import './dialog.css';
import { el } from './dom.js';
import { paintIcon } from './icons.js';
import { hasAction, runAction } from './actions.js';
import { KEY_TABLE, keyOf } from './keys.js';
import type { KeyBinding } from './keys.js';
import {
  applySwaps, keySwaps, lostSwaps, panelKeyRows, prettyKey, proposeSwap, restoreSwap, setKeySwaps,
} from './key-swaps.js';
import type { LiveBinding, SwapResult } from './key-swaps.js';
import type { OpenDialog } from './dialog.js';

export interface KeysDialogOptions {
  /** A tabela de fábrica com os menus de agora: `keyTable(shell.groups())`. */
  table: readonly KeyBinding[];
  host?: HTMLElement;
}

function iconButton(icon: string, name: string, onClick: () => void): HTMLButtonElement {
  const button = el('button', { class: 'dialog-icone', type: 'button', title: name, 'aria-label': name }) as HTMLButtonElement;
  const glyph = el('span', { class: 'dialog-icone-desenho' });
  if (!paintIcon(glyph, icon, 16)) glyph.textContent = name.slice(0, 1);
  button.append(glyph);
  button.addEventListener('click', onClick);
  return button;
}

/**
 * **As teclas dos painéis**, numa seção dobrada embaixo da tabela — rodada
 * 17, PL-21. Só para ler: elas valem com o foco no painel, e a troca delas é
 * a mesma do lápis quando o painel tiver item de menu.
 */
function panelKeysSection(): HTMLElement {
  const linhas = panelKeyRows(applySwaps(KEY_TABLE, keySwaps(KEY_TABLE)));
  const corpo = el('tbody');
  for (const linha of linhas) {
    corpo.append(el('tr', {}, [
      el('td', { text: linha.painel }), el('td', { text: linha.label }),
      el('td', { class: 'dialog-teclas-tecla', text: linha.tecla }), el('td', { text: linha.quando }),
    ]));
  }
  const cabeca = el('tr', { class: 'dialog-table-head' });
  for (const nome of ['Painel', 'O que faz', 'Tecla', 'Quando']) cabeca.append(el('th', { text: nome, scope: 'col' }));
  const tabela = el('table', { class: 'dialog-table dialog-teclas' }, [el('thead', {}, [cabeca]), corpo]);
  const dobra = el('details', { class: 'dialog-teclas-paineis' }, [
    el('summary', { text: `Teclas dos painéis (${linhas.length}): Linha do tempo, Ordem e Árvore — valem com o foco no painel` }),
    el('div', { class: 'dialog-table-box' }, [tabela]),
  ]);
  return dobra;
}

export function showKeysDialog(options: KeysDialogOptions): OpenDialog {
  const host = options.host ?? document.body;
  /** A linha à espera da tecla nova, ou `null`. */
  let waiting: string | null = null;

  const notice = el('p', { class: 'dialog-teclas-aviso', role: 'status', 'aria-live': 'polite' });
  const body = el('tbody');
  const resetAll = el('button', { class: 'dialog-close dialog-secundario', type: 'button', text: 'Voltar todas ao padrão' }) as HTMLButtonElement;
  const findCommand = el('button', {
    class: 'dialog-close dialog-secundario',
    type: 'button',
    text: 'Procurar um comando…',
    title: 'Sei que existe, mas em qual menu está? Digite parte do nome (Ctrl+Shift+P)',
  }) as HTMLButtonElement;
  const closeButton = el('button', { class: 'dialog-close', type: 'button', text: 'Fechar' }) as HTMLButtonElement;

  const say = (text: string, bad = false): void => {
    notice.textContent = text;
    notice.classList.toggle('is-conflito', bad);
  };

  const take = (result: SwapResult): void => {
    if (result.ok) {
      const gravou = setKeySwaps(result.swaps);
      say(gravou ? result.notice : `${result.notice} Mas o navegador não deixou gravar: vale só até fechar o programa.`, !gravou);
    } else {
      say(result.notice, true);
    }
    waiting = null;
    draw();
  };

  function draw(): void {
    const rows: LiveBinding[] = applySwaps(options.table, keySwaps(KEY_TABLE)).filter((row) => row.help !== undefined);
    const trocadas = rows.filter((row) => row.swapped).length;
    resetAll.disabled = trocadas === 0;
    resetAll.title = trocadas === 0 ? 'Nenhuma tecla foi trocada' : `Devolve as ${trocadas} teclas trocadas às de fábrica`;
    body.replaceChildren();
    for (const row of rows) {
      const tr = el('tr', { class: row.swapped ? 'is-trocada' : '' });
      const tecla = el('td', { class: 'dialog-teclas-tecla' });
      if (waiting === row.id) {
        tecla.append(el('span', { class: 'dialog-teclas-espera', text: 'Aperte a tecla nova… (Esc desiste)' }));
      } else {
        tecla.append(el('span', { text: row.help!.shortcut }));
        if (row.swapped) tecla.append(el('span', { class: 'dialog-teclas-era', text: ` trocada — era ${prettyKey(row.defaultKey)}` }));
      }
      const acoes = el('td', { class: 'dialog-teclas-acoes' });
      if (row.fixed) {
        acoes.append(el('span', { class: 'dialog-teclas-fixa', text: 'fixa', title: 'O programa lê esta tecla direto do teclado: ela não troca' }));
      } else {
        acoes.append(iconButton('rename', `Trocar a tecla de ${row.label}`, () => {
          waiting = row.id;
          say(`Aperte a tecla nova para "${row.label}". Esc desiste.`);
          draw();
        }));
        if (row.swapped) {
          acoes.append(iconButton('undo', `Voltar ${row.label} à tecla de fábrica (${prettyKey(row.defaultKey)})`, () => {
            take(restoreSwap(options.table, keySwaps(KEY_TABLE), row.id));
          }));
        }
      }
      tr.append(el('td', { text: row.help!.menu }), el('td', { text: row.label }), tecla, acoes);
      body.append(tr);
    }
  }

  const head = el('tr', { class: 'dialog-table-head' });
  for (const name of ['Menu', 'Item', 'Tecla', 'Trocar']) head.append(el('th', { text: name, scope: 'col' }));
  const table = el('table', { class: 'dialog-table dialog-teclas' }, [el('thead', {}, [head]), body]);
  const perdidas = lostSwaps().length;
  const lead = 'A mesma lista dos menus. O lápis troca a tecla: vale na hora, e fica guardada nesta máquina, não no arquivo.'
    + ' Não achou o que procurava aqui? Aperte "Procurar um comando…" embaixo e digite parte do nome.'
    + (perdidas === 0 ? '' : ` ${perdidas} troca(s) gravada(s) antes não valem mais (a linha saiu do programa) e foram deixadas de lado.`);

  const box = el('div', {
    class: 'dialog-box dialog-box-larga', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Atalhos do teclado',
  }, [
    el('h2', { class: 'dialog-title', text: 'Atalhos do teclado' }),
    el('p', { class: 'dialog-lead', text: lead }),
    notice,
    el('div', { class: 'dialog-table-box' }, [table]),
    panelKeysSection(),
    el('div', { class: 'dialog-buttons' }, [resetAll, findCommand, closeButton]),
  ]);
  const root = el('div', { class: 'dialog-veil' }, [box]);

  let done = (): void => {};
  const closed = new Promise<void>((resolve) => { done = resolve; });
  let open = true;
  const close = (): void => {
    if (!open) return;
    open = false;
    document.removeEventListener('keydown', onKey, true);
    root.remove();
    done();
  };

  function onKey(event: KeyboardEvent): void {
    if (waiting === null) {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    // À espera da tecla nova: TODA tecla é desta janela, e de mais ninguém.
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'Escape') {
      waiting = null;
      say('Nada foi trocado.');
      draw();
      return;
    }
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(event.key)) return;
    take(proposeSwap(options.table, keySwaps(KEY_TABLE), waiting, keyOf(event)));
  }

  resetAll.addEventListener('click', () => {
    const gravou = setKeySwaps({});
    waiting = null;
    say(gravou ? 'Todas as teclas voltaram às de fábrica.' : 'Voltaram, mas o navegador não deixou gravar.', !gravou);
    draw();
  });
  // Fecha ANTES de abrir a paleta: duas janelas modais empilhadas tirariam o
  // `Esc` de dono, e a de baixo ficaria escutando toda tecla da de cima.
  //
  // Sem a ação registrada — um teste sem casca, uma aba fechada — ele diz
  // **onde ela está** em vez de fechar calado num clique que não fez nada
  // (regra 21). O botão não some: a saída existe e é `Ctrl+Shift+P`.
  findCommand.addEventListener('click', () => {
    if (!hasAction('paleta')) {
      say('A busca de comandos abre por Ajuda → Paleta de comandos, ou Ctrl+Shift+P.');
      return;
    }
    close();
    runAction('paleta');
  });
  closeButton.addEventListener('click', close);
  root.addEventListener('pointerdown', (event) => { if (event.target === root) close(); });
  document.addEventListener('keydown', onKey, true);

  draw();
  host.append(root);
  closeButton.focus();
  return { root, close, closed };
}
