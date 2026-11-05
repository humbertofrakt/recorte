/**
 * A janela **Ajuda → Quero fazer…** — noite de 04/11/2026.
 *
 * Em cima, o campo: "o que você quer fazer?". Embaixo, as tarefas que casam.
 * Clicar numa mostra os passos, curtos, e o botão **Mostrar onde**: ele fecha
 * a janela, abre o menu do primeiro comando e ACENDE o item, com o caminho
 * escrito no rodapé. A pessoa vê onde está; ela mesma clica.
 *
 * A lista e a busca são do `quero-fazer-model.ts` (puro, com teste). Aqui só
 * se desenha, e se acende o menu.
 */

import './dialog.css';
import { el } from './dom.js';
import { TAREFAS, buscarTarefas, caminhoDe, caminhoEscrito, primeiroComando, textoDoPasso } from './quero-fazer-model.js';
import type { Tarefa } from './quero-fazer-model.js';

/** Abre a janela. `avisar` escreve no rodapé. */
export function abrirQueroFazer(avisar: (texto: string) => void, host: HTMLElement = document.body): void {
  const campo = el('input', {
    class: 'dialog-pick-campo', type: 'text',
    placeholder: 'O que você quer fazer? Exemplo: arma, roupa, gif',
    'aria-label': 'O que você quer fazer?',
  }) as HTMLInputElement;
  const lista = el('ul', { class: 'dialog-pick-lista', role: 'listbox' });
  const detalhe = el('div', { class: 'quero-fazer-detalhe' });
  const caixa = el('div', {
    class: 'dialog-box dialog-pick quero-fazer', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Quero fazer…',
  }, [el('h2', { class: 'dialog-title', text: 'Quero fazer…' }), campo, lista, detalhe]);
  const veu = el('div', { class: 'dialog-veil' }, [caixa]);

  let achadas: Tarefa[] = [];
  let cursor = 0;
  let aberta = true;

  const fechar = (): void => {
    if (!aberta) return;
    aberta = false;
    document.removeEventListener('keydown', teclas, true);
    veu.remove();
  };

  function mostrar(tarefa: Tarefa): void {
    detalhe.textContent = '';
    const passos = el('ol', { class: 'quero-fazer-passos' });
    for (const passo of tarefa.passos) passos.append(el('li', { text: textoDoPasso(passo) }));
    detalhe.append(el('h3', { class: 'quero-fazer-titulo', text: tarefa.titulo }), passos);
    if (tarefa.capitulo !== undefined) {
      detalhe.append(el('p', { class: 'dialog-pick-dica', text: `No manual: ${tarefa.capitulo} (Ajuda → Manual, F1)` }));
    }
    const botoes = el('div', { class: 'dialog-escolhas' });
    const onde = el('button', { class: 'dialog-close', type: 'button', text: 'Mostrar onde' }) as HTMLButtonElement;
    onde.addEventListener('click', () => {
      fechar();
      mostrarOnde(tarefa, avisar);
    });
    const sair = el('button', { class: 'dialog-close', type: 'button', text: 'Fechar' }) as HTMLButtonElement;
    sair.addEventListener('click', fechar);
    botoes.append(onde, sair);
    detalhe.append(botoes);
  }

  function pintar(): void {
    lista.textContent = '';
    achadas.forEach((tarefa, i) => {
      const linha = el('li', {
        class: i === cursor ? 'dialog-pick-linha is-active' : 'dialog-pick-linha',
        role: 'option', 'aria-selected': i === cursor ? 'true' : 'false',
      }, [el('span', { class: 'dialog-pick-nome', text: tarefa.titulo })]);
      linha.addEventListener('pointerdown', (ev) => {
        ev.preventDefault();
        cursor = i;
        pintar();
      });
      lista.append(linha);
    });
    const atual = achadas[cursor];
    if (atual === undefined) {
      detalhe.textContent = '';
      detalhe.append(el('p', { class: 'dialog-pick-conta', text: 'Nada com essas palavras. Tente outra, ou Ajuda → Paleta de comandos.' }));
    } else {
      mostrar(atual);
    }
  }

  function buscar(): void {
    achadas = buscarTarefas(campo.value);
    cursor = 0;
    pintar();
  }

  function teclas(ev: KeyboardEvent): void {
    if (!aberta) return;
    // Tecla tratada uma vez (regra 12): a janela come as suas.
    if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); fechar(); return; }
    if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
      ev.preventDefault();
      ev.stopPropagation();
      if (achadas.length === 0) return;
      cursor = (cursor + (ev.key === 'ArrowDown' ? 1 : -1) + achadas.length) % achadas.length;
      pintar();
      lista.children[cursor]?.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (ev.key === 'Enter' && document.activeElement === campo) {
      ev.preventDefault();
      ev.stopPropagation();
      const atual = achadas[cursor];
      if (atual !== undefined) { fechar(); mostrarOnde(atual, avisar); }
    }
  }

  campo.addEventListener('input', buscar);
  veu.addEventListener('pointerdown', (ev) => { if (ev.target === veu) fechar(); });
  document.addEventListener('keydown', teclas, true);
  host.append(veu);
  achadas = [...TAREFAS];
  pintar();
  campo.focus();
}

/**
 * Abre o menu do primeiro comando da tarefa e acende o item.
 *
 * Não roda nada: quem clica é a pessoa. O submenu abre como abre para quem
 * anda de Tab — o foco no item pai —, e o item fica com uma borda laranja.
 */
export function mostrarOnde(tarefa: Tarefa, avisar: (texto: string) => void): void {
  const acao = primeiroComando(tarefa);
  const caminho = acao === null ? null : caminhoDe(acao);
  if (caminho === null) {
    // O rodapé apertado mostra só o que vem ANTES dos dois-pontos: o
    // essencial vai primeiro (regra achada pela Cena, 05/11).
    avisar(`Siga os passos da janela Quero fazer… (${tarefa.titulo})`);
    return;
  }
  const [menu, ...resto] = caminho.rotulos;
  const botao = [...document.querySelectorAll<HTMLButtonElement>('.menu-button')].find((b) => b.textContent?.trim() === menu);
  if (botao === undefined) {
    avisar(`${caminhoEscrito(caminho)} — é aqui`);
    return;
  }
  if (botao.getAttribute('aria-expanded') !== 'true') botao.click();
  const visivel = (e: Element): boolean => e.getClientRects().length > 0;
  let alvo: HTMLButtonElement | undefined;
  resto.forEach((rotulo, i) => {
    alvo = [...document.querySelectorAll<HTMLButtonElement>('.menu-item')]
      .filter(visivel)
      .find((b) => b.querySelector('.menu-name')?.textContent?.trim() === rotulo);
    if (alvo !== undefined && i < resto.length - 1) {
      // O submenu se posiciona no `pointerenter` e abre no foco.
      alvo.dispatchEvent(new PointerEvent('pointerenter'));
      alvo.closest('li')?.dispatchEvent(new PointerEvent('pointerenter'));
      alvo.focus();
    }
  });
  if (alvo !== undefined) {
    alvo.classList.add('quero-fazer-aceso');
    alvo.style.outline = '3px solid #ff9f1a';
    alvo.style.outlineOffset = '-3px';
    alvo.scrollIntoView({ block: 'nearest' });
  }
  avisar(`${caminhoEscrito(caminho)} — aceso em laranja`);
}
