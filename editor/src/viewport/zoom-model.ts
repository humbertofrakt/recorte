/**
 * As contas do zoom do canto da cena (dono B).
 *
 * Sem tela nenhuma aqui: ler "200%" e devolver 2, escrever 2 e devolver
 * "200%", e achar a caixa que cabe o que está escolhido. A camada do canto só
 * desenha o que estas três funções decidem.
 *
 * O campo do zoom é um campo de texto e não uma lista, porque quem anima passa
 * o dia entre 25% e 400% e "digitar 200 e apertar Enter" é mais rápido do que
 * clicar sete vezes no `+`. É o canto inferior do Spine e o Ctrl+0 do Live2D.
 */

import { boneTip, attachmentWorldPoints, boundsOfWorldPoints } from './picking.js';
import type { PointBox } from './picking.js';
import type { WorldBounds } from './camera.js';
import type { Selection } from '../contract.js';
import { collectDrawables, type Skeleton } from '../../../runtime/src/index.js';

/**
 * Lê o que foi digitado no campo do zoom. `null` quando não é um zoom.
 *
 * Aceita `200`, `200%`, `200 %` e a vírgula decimal, que é como se escreve
 * número em português. Recusa zero e negativo: um zoom de zero não é uma vista
 * pequena, é nenhuma vista, e o campo tem que dizer não em vez de apagar a
 * cena.
 */
export function parseZoomPercent(text: string): number | null {
  const clean = text.trim().replace(/%/g, '').replace(',', '.').trim();
  if (clean === '') return null;
  if (!/^[+]?\d*\.?\d+$/.test(clean)) return null;
  const percent = Number(clean);
  if (!Number.isFinite(percent) || percent <= 0) return null;
  return percent / 100;
}

/** Escreve o zoom como o campo mostra: `1.5` vira `"150%"`. */
/** O rodapé de um zoom pelo teclado ou pelo menu — rodada 46, lote 4. */
export function zoomNotice(zoom: number): string {
  return `Zoom: ${formatZoomPercent(zoom)}`;
}

export function formatZoomPercent(zoom: number): string {
  if (!Number.isFinite(zoom) || zoom <= 0) return '100%';
  return `${Math.round(zoom * 100)}%`;
}

/** A caixa vira o retângulo que a câmera sabe enquadrar. */
function boundsOf(box: PointBox | null): WorldBounds | null {
  if (box === null) return null;
  return {
    x: box.minX,
    y: box.minY,
    width: box.maxX - box.minX,
    height: box.maxY - box.minY,
  };
}

/** Junta um ponto à caixa que está sendo montada. */
function add(box: PointBox | null, x: number, y: number): PointBox {
  if (box === null) return { minX: x, minY: y, maxX: x, maxY: y };
  return {
    minX: Math.min(box.minX, x),
    minY: Math.min(box.minY, y),
    maxX: Math.max(box.maxX, x),
    maxY: Math.max(box.maxY, y),
  };
}

/** Junta outra caixa à que está sendo montada. */
function union(box: PointBox | null, other: PointBox | null): PointBox | null {
  if (other === null) return box;
  if (box === null) return other;
  return {
    minX: Math.min(box.minX, other.minX),
    minY: Math.min(box.minY, other.minY),
    maxX: Math.max(box.maxX, other.maxX),
    maxY: Math.max(box.maxY, other.maxY),
  };
}

/**
 * A caixa que cabe tudo o que está escolhido, ou `null` se não há nada.
 *
 * Osso entra pela raiz E pela ponta: enquadrar um braço e mostrar só o ombro
 * não é enquadrar o braço. Desenho entra pelos vértices no mundo, que é a mesma
 * conta que o retângulo de seleção usa — `attachmentWorldPoints` é de
 * `picking.ts` de propósito, para as duas leituras nunca discordarem.
 *
 * Escolher um slot vale por escolher tudo o que está dentro dele naquele
 * momento.
 */
export function selectionBounds(
  skeleton: Skeleton | null,
  selection: Selection,
): WorldBounds | null {
  if (skeleton === null) return null;
  let box: PointBox | null = null;

  const bones = new Set(selection.bones);
  for (const bone of skeleton.bones) {
    if (!bones.has(bone.data.name)) continue;
    box = add(box, bone.worldX, bone.worldY);
    const tip = boneTip(bone);
    box = add(box, tip.x, tip.y);
  }

  const slots = new Set(selection.slots);
  const attachments = new Set(selection.attachments.map((a) => `${a.slot}/${a.attachment}`));
  for (const { slot, attachment } of collectDrawables(skeleton)) {
    const name = slot.data.name;
    const wanted = slots.has(name) || attachments.has(`${name}/${attachment.name}`);
    if (!wanted) continue;
    const points = attachmentWorldPoints(slot, attachment);
    if (points === null) continue;
    box = union(box, boundsOfWorldPoints(points.vertices, points.count));
  }

  // Um slot escolhido cujo anexo é uma caixa de colisão não aparece em
  // `collectDrawables`, que só lista o que é desenhado. Ele também tem lugar
  // no mundo, e enquadrar tem que enxergá-lo.
  for (const slot of skeleton.drawOrder) {
    const attachment = slot.attachment;
    if (attachment === null || attachment.type === 'region' || attachment.type === 'mesh') continue;
    const name = slot.data.name;
    if (!slots.has(name) && !attachments.has(`${name}/${attachment.name}`)) continue;
    const points = attachmentWorldPoints(slot, attachment);
    if (points === null) continue;
    box = union(box, boundsOfWorldPoints(points.vertices, points.count));
  }

  return boundsOf(box);
}
