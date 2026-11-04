/**
 * As ações da aba Imagens que valem com ela FECHADA — P33 (rodada final,
 * 29/09/2026).
 *
 * O chat O comparou os menus dos três programas e achou: *"o pivô só existe
 * em painel"*. Quem fechou a aba Imagens, ou nunca a abriu, não tinha por onde
 * definir nem carimbar um pivô. Agora as quatro têm id, e nascem com o
 * documento (`registerCoreActions`), como as da Árvore e das Regras:
 *
 * | id | O que faz |
 * |:---|:---|
 * | `definir-pivo` | abre a janela do pivô para a imagem do desenho escolhido |
 * | `carimbar-pivos` | grava no atlas onde cada imagem encaixa no osso |
 * | `recarregar-pasta` | relê a pasta do disco, e diz o que mudou |
 * | `trocar-pasta-origem` | troca o acervo pelas imagens de outra pasta |
 *
 * O resto da aba (Copiar e Colar pivô, Duplicar no atlas, Trazer como
 * sequência) fica no botão direito, como no Spriter: é gesto EM uma imagem, e
 * sem a imagem à vista não há em quem fazer.
 *
 * A conta de cada uma mora em `palette.ts`, e a aba chama as mesmas funções.
 */

import type { EditorDoc } from '../contract.js';
import { registerAction } from '../ui/actions.js';
import {
  NO_HAND_PIVOT, NO_NUMBERED_RUN, bringSequenceOf, copyPivotOfSelection, definePivotOfSelection, handPivotImages,
  hasPivotClip, numberedRunsOf, palettePanel, pastePivotOnSelection, reloadFolderOf, resetPivotOfSelection,
  stampPivotsOf, swapFolderOf,
} from './palette.js';
import { canTakeOutEntity, takeOutEntity, whyCannotTakeOutEntity, FIT_WHY, fitPlan, fitToPrevious } from './image-picker-model.js';
import { targetOfSelection } from './image-picker.js';

/** Os ids, na ordem do menu. */
export const IMAGE_ACTION_IDS = [
  'definir-pivo', 'carimbar-pivos', 'recarregar-pasta', 'trocar-pasta-origem',
] as const;

/** Registra as quatro. Devolve quem as tira de novo. */
export function registerImageActions(doc: EditorDoc): Array<() => void> {
  return [
    registerAction('definir-pivo', { run: () => definePivotOfSelection(doc) }),
    registerAction('carimbar-pivos', {
      // Com a aba aberta, os avisos de pivôs diferentes aparecem nela, cada um
      // com o seu botão de duplicar; fechada, o rodapé já os contou.
      run: () => palettePanel.showConflicts(stampPivotsOf(doc)),
    }),
    // Rodada 13, caso (b): o pivô à mão sai da lista e volta para onde o osso
    // está. Sem janela de pergunta; o Ctrl+Z devolve.
    registerAction('voltar-pivo-osso', {
      run: () => { resetPivotOfSelection(doc); },
      enabled: () => handPivotImages(doc).length > 0,
      why: () => NO_HAND_PIVOT,
    }),
    // A aba se redesenha sozinha: a pasta avisa quem a mostra quando muda.
    registerAction('recarregar-pasta', { run: async () => { await reloadFolderOf(doc); } }),
    registerAction('trocar-pasta-origem', { run: () => swapFolderOf(doc) }),
    // Rodada 6 (05/10/2026): as três do botão direito da aba ganham porta no
    // menu Imagens. Agem no desenho escolhido; a sequência pergunta a subpasta.
    registerAction('copiar-pivo', { run: async () => { await copyPivotOfSelection(doc); } }),
    // Rodada 44, lote 7 (doc 75): o desenho trocado cabe no tamanho do que saiu.
    registerAction('caber-na-antiga', {
      run: () => { fitToPrevious(doc, targetOfSelection(doc)); },
      enabled: () => fitPlan(doc, targetOfSelection(doc)) !== null,
      why: () => FIT_WHY,
    }),
    registerAction('colar-pivo', {
      run: async () => { await pastePivotOnSelection(doc); },
      enabled: () => hasPivotClip(),
      why: () => 'Copie o pivô de uma imagem primeiro: Imagens → Copiar pivô',
    }),
    registerAction('trazer-sequencia', {
      run: async () => { await bringSequenceOf(doc); },
      enabled: () => numberedRunsOf(doc).length > 0,
      why: () => NO_NUMBERED_RUN,
    }),
    // Rodada 8a (04/10/2026), decisão 6 da conexão: a imagem de antes volta.
    registerAction('tirar-entidade', {
      run: () => { takeOutEntity(doc); },
      enabled: () => canTakeOutEntity(doc),
      // Rodada 6, régua 3: o cinza diz por quê, no caso de agora.
      why: () => whyCannotTakeOutEntity(doc),
    }),
  ];
}
