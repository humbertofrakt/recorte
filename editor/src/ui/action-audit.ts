/**
 * A auditoria das **funções escondidas** (dono A) — lote 29, anotação 15.
 *
 * O Humberto, 09/09/2026: *"aproveite e veja se tem outras funções
 * extremamente importantes escondidas."* A varredura achou dez, e nenhuma
 * delas estava escondida do jeito que se esperava — **nenhuma faltava num
 * menu**. Elas eram gestos sem ação nenhuma registrada: `Alt` + clique na
 * régua, `M` com o foco na faixa, botão direito no losango, `Ctrl` + arrastar
 * no Criar osso. Não havia o que pôr num menu, porque não havia função: havia
 * um `if` no meio de um manipulador de evento.
 *
 * Este arquivo é o que impede isso de voltar. `hiddenFunctions` recebe **toda
 * ação que o programa registra** e devolve as que não têm porta nenhuma. O
 * teste espera lista vazia, e diz qual sobrou quando não está.
 *
 * É o mesmo desenho do `auditMenus` do lote 19: uma lista do que está errado,
 * e não um `throw`. Assim o teste diz tudo o que falta de uma vez, em vez de
 * um por rodada.
 */

import { flatEntries } from './menus.js';
import type { MenuGroupDef } from './menus.js';
import type { ActionBarItem } from './action-bar-model.js';

/** Uma ação sem porta, com o nome dela. */
export interface HiddenAction {
  action: string;
  /** O que fazer, escrito para uma pessoa ler. */
  regra: string;
}

/**
 * As ações que o **botão direito** alcança, e onde.
 *
 * Escrita à mão, e é de propósito: um menu de contexto é construído dentro do
 * painel, com `runAction`, e não há como um teste sem navegador descobrir
 * quais. Esta tabela é o registro da decisão, e o teste a confere contra o
 * código-fonte dos painéis — se um item sumir do menu, a linha aqui fica
 * mentindo, e o teste avisa.
 */
export const CONTEXT_ACTIONS: readonly { action: string; where: string }[] = Object.freeze([
  { action: 'copiar-ancora', where: 'Árvore, botão direito num desenho' },
  { action: 'colar-ancora', where: 'Árvore, botão direito num desenho' },
  { action: 'substituir-nomes', where: 'Árvore, botão direito em qualquer linha' },
  { action: 'trocar-imagem-todas-peles', where: 'Árvore, botão direito num desenho' },
]);

/**
 * As ações que **não precisam** de porta, e por quê.
 *
 * Uma lista de exceções é uma dívida, e por isso cada linha carrega o motivo.
 * Sem o motivo escrito, a lista cresce até a auditoria não provar mais nada.
 */
export const EXEMPT: readonly { action: string; why: string }[] = Object.freeze([
  {
    action: 'nova-regra-ik',
    why: 'criar adivinhando; o menu chama a janela guiada desde o lote 29 (item k). '
      + 'A ação fica para os testes e para a importação.',
  },
  { action: 'nova-regra-transform', why: 'o mesmo que `nova-regra-ik`.' },
  { action: 'nova-regra-path', why: 'o mesmo que `nova-regra-ik`.' },
  { action: 'nova-regra-physics', why: 'o mesmo que `nova-regra-ik`.' },
  { action: 'nova-regra-driver', why: 'o mesmo que `nova-regra-ik`.' },
]);

/**
 * As ações registradas que não aparecem em menu, na barra nem no botão direito.
 *
 * `registered` é a lista real: o teste a lê do código-fonte, para ela não
 * poder envelhecer. Uma ação que ninguém alcança é uma função que existe e não
 * está lá — é exatamente disso que a anotação 15 fala.
 */
export function hiddenFunctions(
  registered: readonly string[],
  menus: readonly MenuGroupDef[],
  bar: readonly ActionBarItem[],
): HiddenAction[] {
  const emMenu = new Set(menus.flatMap((g) => flatEntries(g.entries)).map((e) => e.action));
  const naBarra = new Set(bar.map((item) => item.actionId));
  const noBotaoDireito = new Set(CONTEXT_ACTIONS.map((item) => item.action));
  const dispensadas = new Set(EXEMPT.map((item) => item.action));

  const out: HiddenAction[] = [];
  for (const action of [...new Set(registered)].sort()) {
    if (dispensadas.has(action)) continue;
    if (emMenu.has(action) || naBarra.has(action) || noBotaoDireito.has(action)) continue;
    out.push({
      action,
      regra: 'ação registrada sem porta: ela não está em menu, nem na barra, '
        + 'nem num botão direito. Ponha uma, ou escreva o motivo em EXEMPT',
    });
  }
  return out;
}
