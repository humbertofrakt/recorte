/**
 * Panels barrel (owner C's folder, wired here).
 *
 * Importing this module registers every panel. It exists so `main.ts` has one
 * address to import instead of five, and so the order in which the panels
 * appear is written down in a single place.
 *
 * The order below is the order the shell shows them in. The first five go in
 * the right-hand column; "Linha do tempo" and "Curvas" go in the strip under
 * the drawing area, as tabs — see `DOCK_PANELS` in `ui/shell.ts`.
 */

import { treePanel } from './tree.js';
import { drawOrderPanel } from './draw-order.js';
import { historyPanel } from './history.js';
import { palettePanel } from './palette.js';
// Degrau 5: a aba vizinha da Imagens — as entidades do projeto (E15).
import { entitiesPanel } from './palette-entities.js';
// Degrau 8: a pasta inteira em grade, com a cruz, sem janela que tranca (C4).
import { pivotPanel } from './pivot-panel.js';
// Rodada 15: as partículas com lugar próprio, ao lado das Entidades.
import { particlesPanel } from './particles-panel.js';
import { propertiesPanel } from './properties.js';
import { animationsPanel } from './animations.js';
import { skinsPanel } from './skins.js';
import { rulesPanel } from './rules.js';
import { meshPanel } from './mesh-panel.js';
import { viewPanel } from './view-panel.js';
import { previewPanel } from './preview.js';
import { dopesheetPanel } from './dopesheet.js';
import { graphPanel } from './graph.js';

export {
  treePanel, drawOrderPanel, propertiesPanel, animationsPanel, skinsPanel, rulesPanel,
  historyPanel, palettePanel, entitiesPanel, particlesPanel, pivotPanel, meshPanel, viewPanel, previewPanel,
  dopesheetPanel, graphPanel,
};
