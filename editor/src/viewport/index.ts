/**
 * Viewport barrel (owner B's folder, wired here).
 *
 * Importing this module registers the viewport panel (id `viewport`) and the
 * eight tools. `mountViewport` is the door the shell uses to put the canvas in
 * the centre of the window instead of in the side column — see
 * PEDIDOS-CONTRATO item 2.
 */

import type { EditorDoc } from '../contract.js';
import { viewportPanel } from './viewport.js';

export {
  getActiveTool, getActiveToolId, onActiveToolChange, setActiveTool,
  toolOfKey, viewportPanel,
} from './viewport.js';
export { Camera, gridStep } from './camera.js';

/** Puts the viewport inside `host`. The host must be able to grow. */
export function mountViewport(doc: EditorDoc, host: HTMLElement): void {
  viewportPanel.mount(doc, host);
}
