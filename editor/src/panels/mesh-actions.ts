/**
 * As doze portas da aba **Malha e pesos** no menu Malha e regras — rodada 6
 * (05/10/2026), `05 O DESENHO DOS MENUS`, §5.
 *
 * *"Hoje a malha tem zero itens de menu"* — o desenho. Os botões moravam só na
 * aba, e com ela fechada não havia por onde achar a malha. O molde é o de
 * `rules-actions.ts`: cada ação traz a aba à frente ANTES de agir
 * (`mostrar-painel-malha`), que é o que a monta quando estava fechada e o que
 * mostra onde o gesto foi parar. A conta é a do botão (`fromMenu`).
 *
 * O item cinza diz por quê (régua 3): `meshMenuWhy` lê o documento, sem
 * painel nenhum, e é a mesma frase do rodapé.
 *
 * Um `registerAction` por linha, com o id escrito: o `acoes.test.ts` procura
 * cada id assim, para saber em que arquivo ele nasce.
 */

import { registerAction, runAction } from '../ui/actions.js';
import type { ActionDef } from '../ui/actions.js';
import type { EditorDoc } from '../contract.js';
import { meshMenuChecked, meshMenuPanel, meshMenuWhy } from './mesh-panel.js';
import type { MeshMenuId } from './mesh-panel.js';

/** O corpo de cada uma: traz a aba, chama o botão; cinza diz por quê. */
function porta(doc: EditorDoc, id: MeshMenuId): ActionDef {
  const checked = meshMenuChecked(id);
  return {
    run: () => {
      runAction('mostrar-painel-malha');
      meshMenuPanel.fromMenu(doc, id);
    },
    enabled: () => meshMenuWhy(doc, id) === null,
    why: () => meshMenuWhy(doc, id),
    ...(checked === undefined ? {} : { checked: () => meshMenuChecked(id) === true }),
  };
}

/** Registra as doze. Devolve como tirá-las. */
export function registerMeshActions(doc: EditorDoc): Array<() => void> {
  return [
    registerAction('virar-malha', porta(doc, 'virar-malha')),
    registerAction('malha-automatica', porta(doc, 'malha-automatica')),
    registerAction('tracar-contorno', porta(doc, 'tracar-contorno')),
    registerAction('criar-vertice', porta(doc, 'criar-vertice')),
    registerAction('apagar-vertice', porta(doc, 'apagar-vertice')),
    // Rodada 41, lote 4: Criar aresta só existia na aba e na tecla L.
    registerAction('criar-aresta', porta(doc, 'criar-aresta')),
    registerAction('usar-forma-de-outra', porta(doc, 'usar-forma-de-outra')),
    registerAction('ligar-ossos', porta(doc, 'ligar-ossos')),
    registerAction('pesos-automaticos', porta(doc, 'pesos-automaticos')),
    registerAction('suavizar-pesos', porta(doc, 'suavizar-pesos')),
    registerAction('podar-pesos', porta(doc, 'podar-pesos')),
    registerAction('chavear-pesos', porta(doc, 'chavear-pesos')),
    registerAction('tirar-pesos', porta(doc, 'tirar-pesos')),
  ];
}
