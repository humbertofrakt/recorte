/**
 * Um `ViewMenuState` pronto, para os testes do menu Exibir.
 *
 * NÃO é um arquivo de teste: o `vitest.config.ts` só coleta `*.test.ts`.
 *
 * Ele existe porque três testes montavam o mesmo objeto à mão, e cada campo
 * novo do painel Exibição — `clippings` no lote 6, `hoverNames` e `cleanView` no
 * lote 7 — quebrava os três de uma vez. O que se quer provar ali é o MENU, não
 * a lista de campos da exibição; a lista mora aqui, num lugar só.
 */

import { DEFAULT_VIEW } from '../src/viewport/onion.js';
import type { ViewMenuState } from '../src/ui/menus.js';

/** O estado do menu Exibir a partir do padrão, com o que se quiser trocado. */
export function viewMenuState(patch: Partial<ViewMenuState> = {}): ViewMenuState {
  return {
    bones: DEFAULT_VIEW.bones,
    boneNames: DEFAULT_VIEW.boneNames,
    boundingBoxes: DEFAULT_VIEW.boundingBoxes,
    points: DEFAULT_VIEW.points,
    meshes: DEFAULT_VIEW.meshes,
    edges: DEFAULT_VIEW.edges,
    weights: DEFAULT_VIEW.weights,
    grid: DEFAULT_VIEW.grid,
    rulers: DEFAULT_VIEW.rulers,
    axes: DEFAULT_VIEW.axes,
    drawings: DEFAULT_VIEW.drawings,
    clippings: DEFAULT_VIEW.clippings,
    hoverNames: DEFAULT_VIEW.hoverNames,
    cleanView: DEFAULT_VIEW.cleanView,
    onion: { enabled: DEFAULT_VIEW.onion.enabled },
    ...patch,
  };
}
