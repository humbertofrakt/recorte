/**
 * As ações da aba **Regras**, de arranque — defeito 2 (19/09/2026).
 *
 * O molde é o do `skins-actions.ts` (lote A2), e o guarda de `acoes.test.ts`
 * exigia este arquivo existir por escrito: *"nenhum painel registra uma ação
 * de arranque ao montar; cada uma está escrita num `*-actions.ts`"*. As nove
 * nasciam no `mount()` de `rules.ts`, e por isso a tabela as chamava de ações
 * de painel — o rótulo estava certo, e era o defeito escrito na tabela.
 *
 * **O que isso causava:** com a aba Regras fechada o painel nunca monta, a
 * ação **não existe**, e o `runAction` devolve `false` sem que ninguém olhe o
 * retorno. O menu chamava, nada acontecia, e não havia o que avisar — porque
 * a coisa que avisaria também não tinha sido montada. Não é "o botão não
 * funciona": é **uma ação que existe às vezes**, conforme a aba que está
 * aberta. É a regra 21 pelo pior dos lados, o do silêncio.
 */

import { registerAction, runAction } from '../ui/actions.js';
import type { EditorDoc } from '../contract.js';
import { askPick } from '../ui/dialog.js';
import { rulesPanel, setRulesDoc } from './rules.js';
import { tagRows } from './rules-vars.js';

/**
 * Por que as portas da rodada 6 estão cinzas — régua 3: a mesma frase vai na
 * dica do item e no rodapé.
 */
export const RULE_WHY = Object.freeze({
  regra: 'Escolha uma regra primeiro, na Árvore ou na aba Regras',
  parametro: 'Escolha um parâmetro primeiro, na Árvore ou na aba Regras',
  etiqueta: 'Não há etiqueta nenhuma ainda: Animação → Variáveis e etiquetas → Nova etiqueta',
});

/** As etiquetas declaradas no arquivo (§8.5), pelo nome. */
export function tagNamesOf(doc: EditorDoc): string[] {
  return tagRows(doc.file, null, 0).map((row) => row.name);
}

/**
 * Qual etiqueta — a etiqueta não entra na seleção (§8.5: é só um nome numa
 * lista), então o menu pergunta. Uma só vai direto, na hora: sem janela e
 * sem esperar.
 */
function withTag(doc: EditorDoc, title: string, faz: (nome: string) => void): void {
  const nomes = tagNamesOf(doc);
  if (nomes.length === 0) { doc.notice(RULE_WHY.etiqueta); return; }
  if (nomes.length === 1) { faz(nomes[0]!); return; }
  void askPick({
    title,
    placeholder: 'Qual etiqueta?',
    search: (text) => nomes
      .filter((nome) => nome.toLowerCase().includes(String(text).trim().toLowerCase()))
      .map((nome) => ({ id: nome, label: nome })),
  }).then((nome) => { if (nome !== null) faz(nome); });
}

/**
 * Registra as nove. Devolve como tirá-las.
 *
 * Cada uma traz a aba à frente ANTES de agir, com `mostrar-painel-regras`:
 * não é enfeite, é o que **monta** o painel quando a aba estava fechada, e é
 * o que faz a pessoa ver onde a regra nova foi parar. `mostrar-painel-*` traz
 * à frente e **nunca fecha** — o `painel-*` é o interruptor, e confundir os
 * dois é a outra metade deste mesmo defeito.
 */
export function registerRuleActions(doc: EditorDoc): Array<() => void> {
  // Sem isto a ação existiria e voltaria em silêncio na primeira linha: com a
  // aba fechada não há painel montado, e portanto não há `this.doc`.
  setRulesDoc(doc);
  /** Traz a aba à frente (montando-a, se preciso) e então faz o gesto. */
  const naAba = (faz: () => void): { run: () => void } => ({
    run: () => {
      runAction('mostrar-painel-regras');
      faz();
    },
  });
  return [
    registerAction('nova-regra-guiada', naAba(() => { void rulesPanel.newRule(); })),
    registerAction('fisica-simular', naAba(() => rulesPanel.toggleSimulate())),
    registerAction('fisica-reiniciar', naAba(() => rulesPanel.resetOne())),
    registerAction('fisica-reiniciar-todas', naAba(() => rulesPanel.resetAll())),
    registerAction('fisica-assar', naAba(() => rulesPanel.bake())),
    registerAction('nova-variavel', naAba(() => rulesPanel.newVariable())),
    registerAction('apagar-variavel', naAba(() => rulesPanel.deleteVariable())),
    registerAction('nova-etiqueta', naAba(() => rulesPanel.newTag())),
    registerAction('mostrar-variaveis', naAba(() => rulesPanel.toggleVars())),
    // Rodada 6 (05/10/2026), `05 O DESENHO DOS MENUS`: as portas que só
    // existiam na linha da aba (lápis, chave, lixeira). Agem no que está
    // escolhido, na Árvore ou na aba; a etiqueta pergunta qual.
    registerAction('trocar-ossos-regra', {
      ...naAba(() => {
        const nome = doc.selection.constraints[0];
        if (nome !== undefined) void rulesPanel.changeChain(nome);
      }),
      enabled: () => doc.selection.constraints.length > 0,
      why: () => RULE_WHY.regra,
    }),
    registerAction('apagar-regra', {
      ...naAba(() => rulesPanel.deleteRule()),
      enabled: () => doc.selection.constraints.length > 0,
      why: () => RULE_WHY.regra,
    }),
    registerAction('chave-parametro', {
      ...naAba(() => {
        const nome = (doc.selection.parameters ?? [])[0];
        if (nome !== undefined) void rulesPanel.keyHere(nome);
      }),
      enabled: () => (doc.selection.parameters ?? []).length > 0,
      why: () => RULE_WHY.parametro,
    }),
    registerAction('apagar-parametro', {
      ...naAba(() => rulesPanel.deleteParameter()),
      enabled: () => (doc.selection.parameters ?? []).length > 0,
      why: () => RULE_WHY.parametro,
    }),
    registerAction('renomear-etiqueta', {
      ...naAba(() => {
        withTag(doc, 'Renomear etiqueta', (nome) => { void rulesPanel.renameTag(nome); });
      }),
      enabled: () => tagNamesOf(doc).length > 0,
      why: () => RULE_WHY.etiqueta,
    }),
    registerAction('apagar-etiqueta', {
      ...naAba(() => {
        withTag(doc, 'Apagar etiqueta', (nome) => { void rulesPanel.deleteTag(nome); });
      }),
      enabled: () => tagNamesOf(doc).length > 0,
      why: () => RULE_WHY.etiqueta,
    }),
  ];
}
