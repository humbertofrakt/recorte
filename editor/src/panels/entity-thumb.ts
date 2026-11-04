/**
 * A miniatura de uma entidade — degrau 5 (o painel Entidades), degrau 8 (a
 * grade do botão direito).
 *
 * Ela morava dentro de `palette-entities.ts`, que **registra um painel** ao
 * carregar. A grade de imagens precisa da mesma miniatura, e importar o painel
 * só para desenhar um quadradinho registraria a aba Entidades em todo lugar
 * que abre a grade — inclusive num teste que não pediu painel nenhum. Então a
 * conta do desenho mora aqui, sozinha, sem efeito ao carregar.
 *
 * **A miniatura é parada** (E16, veto do Humberto em 15/09): a pose de repouso,
 * desenhada uma vez. Uma fila de bonecos andando ao lado da cena rouba o olho
 * de quem está animando.
 */

import { CanvasRenderer, Skeleton, smoothingFor } from '../../../runtime/src/index.js';
import type { AtlasPageData, SkeletonData } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';

/** Lado da miniatura de uma entidade, em pixels. O mesmo da aba Imagens. */
export const ENTITY_THUMB = 48;

/**
 * A miniatura de uma entidade, como `data:` URL, ou `null`.
 *
 * A pose de repouso (§5.1), encaixada no quadrado sem esticar: uma espada
 * comprida continua comprida, e é assim que se reconhece a peça. `null` quando
 * não há navegador, quando o esqueleto não está carregado, ou quando ele não
 * ocupa área nenhuma — e aí a linha mostra só o nome, que é a verdade.
 */
export function entityThumbnail(
  doc: EditorDoc, data: SkeletonData, size = ENTITY_THUMB,
): string | null {
  if (typeof document === 'undefined') return null;
  let skeleton: Skeleton;
  try {
    skeleton = new Skeleton(data);
  } catch {
    return null;
  }
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform();
  const bounds = skeleton.getBounds();
  if (!(bounds.width > 0) || !(bounds.height > 0)) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;
  ctx.imageSmoothingEnabled = smoothingFor(doc.file.skeleton);
  const renderer = new CanvasRenderer(ctx, {
    images: (page: AtlasPageData) => doc.imageFor(page),
  });
  // 0,9 deixa uma margem: uma peça encostada nas quatro bordas parece cortada.
  const zoom = Math.min(size / bounds.width, size / bounds.height) * 0.9;
  const cx = bounds.x + bounds.width / 2;
  const cy = bounds.y + bounds.height / 2;
  // O Y sobe no arquivo e desce num canvas (§3.3).
  ctx.setTransform(zoom, 0, 0, -zoom, size / 2 - cx * zoom, size / 2 + cy * zoom);
  try {
    renderer.draw(skeleton);
  } catch {
    return null;
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  try {
    return canvas.toDataURL();
  } catch {
    return null; // Canvas "sujo": a linha fica com o nome.
  }
}
