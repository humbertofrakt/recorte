/**
 * As ações da ordem de desenho que não precisam da aba Ordem — lote A2 (v10.5).
 *
 * Os quatro passos (frente, trás, frente de tudo, fundo de tudo), tirar da
 * pasta e copiar a ordem na animação: a conta mora em `draw-order-model.ts`
 * (`runOrderStep`, `runCopyOrderToAnimation`), e nada aqui lê o DOM da aba.
 * Registradas uma vez, no arranque; os botões da aba Ordem chamam
 * `runAction` com o mesmo nome.
 *
 * `copiar-ordem-animacao` morava na cena desde o lote 66 só porque a cena está
 * sempre montada. Agora ela mora com a ordem.
 */

import { corpoDe } from '../contract.js';
import type { EditorDoc } from '../contract.js';
import { registerAction } from '../ui/actions.js';
import { TakeOutOfFolder, orderTargets, runCopyOrderToAnimation, runOrderStep } from './draw-order-model.js';

/** Os slots escolhidos que estão dentro de alguma pasta, na ordem do array. */
export function pickedInFolder(doc: EditorDoc): string[] {
  const escolhidos = new Set(doc.selection.slots);
  return (corpoDe(doc).file.slots ?? [])
    .filter((slot) => escolhidos.has(slot.name) && typeof slot.folder === 'string' && slot.folder !== '')
    .map((slot) => slot.name);
}

/** Tira as escolhidas da pasta, num passo de desfazer. */
export function takeOutOfFolder(doc: EditorDoc): void {
  const nomes = pickedInFolder(doc);
  if (nomes.length === 0) return;
  corpoDe(doc).run(new TakeOutOfFolder(nomes));
  doc.notice(nomes.length === 1 ? 'Peça fora da pasta' : `${nomes.length} peças fora da pasta`);
}

/** Registra as ações da ordem. Devolve como tirá-las. */
export function registerOrderActions(doc: EditorDoc): Array<() => void> {
  // Lote 66: o desenho escolhido na cena conta também.
  const temEscolha = (): boolean => orderTargets(corpoDe(doc).file, doc.selection).length > 0;
  return [
    // "Para a frente" é para cima na tela e para o FIM do array. Em Animando,
    // a ordem nova vira chave `drawOrder` (lote 66).
    registerAction('subir-ordem', { run: () => { runOrderStep(doc, 'frente-1'); }, enabled: temEscolha }),
    registerAction('descer-ordem', { run: () => { runOrderStep(doc, 'fundo-1'); }, enabled: temEscolha }),
    // Peça de pasta leva o pedaço da pasta inteiro.
    registerAction('frente-de-tudo', { run: () => { runOrderStep(doc, 'frente'); }, enabled: temEscolha }),
    registerAction('fundo-de-tudo', { run: () => { runOrderStep(doc, 'fundo'); }, enabled: temEscolha }),
    registerAction('tirar-da-pasta', {
      run: () => takeOutOfFolder(doc),
      enabled: () => pickedInFolder(doc).length > 0,
    }),
    // Lote 66: Editar → Copiar a ordem na animação.
    registerAction('copiar-ordem-animacao', {
      run: () => { runCopyOrderToAnimation(doc); },
      enabled: () => doc.animation !== null,
    }),
  ];
}
