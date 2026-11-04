/**
 * A linha do tempo: o ponteiro — lote A5b, plano arrumação (v10.9).
 *
 * Arrastar a agulha, escolher e mover chaves, o retângulo de escolha e a
 * prévia do arrasto. Cortado de `dopesheet.ts` pela seção "Pointer": cada
 * método virou uma função que recebe o painel (`panel`). Os três ouvintes
 * (`onRulerDown`, `onPointerMove`, `onPointerUp`) são propriedades da classe,
 * e ficaram nela.
 */

import { dopesheetGroups, keyRefKey, roundTime, sameTime, targetKey } from '../anim/keying.js';
import type { KeyRef } from '../anim/keying.js';
import { el } from './dom.js';
import { clonesOnDrag, isDoubleClick, selectionModeOf, startsKeyDrag } from './dopesheet-model.js';
import type { DopesheetPanel } from './dopesheet.js';
import { fpsOf } from './dopesheet.js';
import { snapToFrame } from './dopesheet.js';
import { spanOf } from './dopesheet.js';

// -------------------------------------------------------------------------
// Pointer
// -------------------------------------------------------------------------

/** Seconds per pixel inside a track element. */
export function secondsPerPixel(panel: DopesheetPanel, element: HTMLElement): number {
  const doc = panel.doc;
  if (doc === null) return 0;
  const width = element.getBoundingClientRect().width;
  return width > 0 ? spanOf(doc) / width : 0;
}

export function timeFromEvent(panel: DopesheetPanel, element: HTMLElement, clientX: number): number {
  const doc = panel.doc;
  if (doc === null) return 0;
  const box = element.getBoundingClientRect();
  if (box.width <= 0) return 0;
  const fraction = (clientX - box.left) / box.width;
  return Math.max(0, roundTime(fraction * spanOf(doc)));
}

export function scrubTo(panel: DopesheetPanel, clientX: number): void {
  const doc = panel.doc;
  const ruler = panel.ruler;
  if (doc === null || ruler === null) return;
  const time = panel.timeFromEvent(ruler, clientX);
  doc.time = snapToFrame(time, fpsOf(doc));
}

/**
 * O clique num losango — G2 e G11, degrau 6.
 *
 * | Tecla | O clique | E se virar arrasto |
 * |:---|:---|:---|
 * | `Ctrl` | **soma** à seleção | **clona** as escolhidas no tempo novo, e os originais ficam onde estavam (item 6) |
 * | `Shift` | **tira** da seleção | nada: tirar não é pegar, e um arrasto moveria justamente o que se acabou de soltar |
 * | nenhuma | escolhe só ela, se ainda não estava escolhida | **move as escolhidas** |
 *
 * **O arrasto move as escolhidas, e não empurra as seguintes** (G11). O
 * Spriter faz assim — cap. 11: *"arrastar quadro-chave; Ctrl para pegar
 * vários"*, e os vários andam juntos —, e o Recorte nunca empurrou: a
 * `rippleMove` de `anim/keying.ts` só tem porta por comando (**Animação →
 * Empurrar as chaves…**). O medo que gerou o G11 já estava atendido; o que
 * este degrau troca é qual tecla escolhe.
 */
export function onKeyDownPointer(panel: DopesheetPanel, event: PointerEvent, ref: KeyRef): void {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  const id = keyRefKey(ref);
  const mode = selectionModeOf(event);

  // Rodada 40, lote 3: o duplo clique, contado aqui (`isDoubleClick`).
  const toque = { id, at: event.timeStamp, x: event.clientX, y: event.clientY };
  if (mode === 'trocar' && isDoubleClick(panel.lastKeyTouch, toque)) {
    panel.lastKeyTouch = null;
    panel.deleteOneKey(ref);
    return;
  }
  panel.lastKeyTouch = mode === 'trocar' ? toque : null;

  if (!startsKeyDrag(mode)) {
    // Tirar da seleção e sair: sem arrasto, sem clone. Um arrasto que começa
    // tirando levaria embora a chave que o gesto acabou de soltar.
    panel.selectKeys([ref], mode);
    return;
  }

  // Rodada 40, lote 1 (S1): o clique simples leva a agulha até a chave, e a
  // ficha mostra o valor DELA. Antes a agulha ficava onde estava, e a ficha
  // mostrava o valor de outro tempo (doc 39, §2.3). Ctrl e Shift não mexem:
  // quem soma ou tira está escolhendo, não olhando.
  if (mode === 'trocar' && panel.doc !== null && !sameTime(panel.doc.time, ref.time)) {
    panel.doc.time = ref.time;
  }

  panel.cloning = clonesOnDrag(mode);
  if (mode === 'somar') {
    panel.selectKeys([ref], 'somar');
    // Depois de somar, porque a clicada agora faz parte do que se clona.
    panel.cloneSource = panel.selectedRefs;
  } else if (!panel.selected.has(id)) {
    panel.selectKeys([ref], 'trocar');
  }

  panel.drag = 'chaves';
  panel.dragStart = { x: event.clientX, y: event.clientY, time: ref.time };
  panel.dragDelta = 0;
  window.addEventListener('pointermove', panel.onPointerMove);
  window.addEventListener('pointerup', panel.onPointerUp);
}

/**
 * Arrastar em faixa vazia: o retângulo de laço.
 *
 * Não recebe alvo nenhum. Recebia, e não usava: o laço pega o que a caixa
 * toca, venha de que linha vier. Um parâmetro que ninguém lê é um parâmetro
 * que um dia alguém preenche errado.
 */
export function onTrackDown(panel: DopesheetPanel, event: PointerEvent): void {
  if (event.button !== 0) return;
  // O laço obedece à MESMA tecla do clique (G2): `Ctrl` soma ao que já havia,
  // `Shift` tira o que a caixa tocar, e sem tecla a caixa troca a seleção.
  // O que a caixa pega é aplicado em `selectInsideBand`, no soltar.
  panel.bandMode = selectionModeOf(event);
  if (panel.bandMode === 'trocar') panel.selectKeys([], 'trocar');
  panel.drag = 'laco';
  panel.dragStart = { x: event.clientX, y: event.clientY, time: 0 };
  const band = el('div', 'dope-laco');
  panel.band = band;
  document.body.append(band);
  panel.moveBand(event.clientX, event.clientY);
  window.addEventListener('pointermove', panel.onPointerMove);
  window.addEventListener('pointerup', panel.onPointerUp);
}

export function moveBand(panel: DopesheetPanel, x: number, y: number): void {
  const band = panel.band;
  if (band === null) return;
  const left = Math.min(x, panel.dragStart.x);
  const top = Math.min(y, panel.dragStart.y);
  band.style.position = 'fixed';
  band.style.left = `${left}px`;
  band.style.top = `${top}px`;
  band.style.width = `${Math.abs(x - panel.dragStart.x)}px`;
  band.style.height = `${Math.abs(y - panel.dragStart.y)}px`;
}

/** Slides the selected diamonds while the pointer is down, without editing. */
export function previewDrag(panel: DopesheetPanel, track: HTMLElement): void {
  const doc = panel.doc;
  const body = panel.body;
  if (doc === null || body === null) return;
  const pixels = track.getBoundingClientRect().width / spanOf(doc) * panel.dragDelta;
  for (const node of body.querySelectorAll('.dope-chave-escolhida')) {
    if (node instanceof HTMLElement) node.style.transform = `translateX(${pixels}px) rotate(45deg)`;
  }
}

/**
 * O que a caixa do laço tocou entra na seleção — ou sai dela, com `Shift`.
 *
 * O modo foi decidido no `pointerdown` (`panel.bandMode`) e não aqui, porque
 * no soltar já não há tecla a ler: o usuário pode ter largado o `Ctrl` no meio
 * do arrasto, e o gesto tem que terminar sendo o que começou.
 */
export function selectInsideBand(panel: DopesheetPanel): void {
  const band = panel.band;
  const body = panel.body;
  if (band === null || body === null) return;
  const box = band.getBoundingClientRect();
  const found: KeyRef[] = [];
  for (const node of body.querySelectorAll('.dope-chave')) {
    if (!(node instanceof HTMLElement)) continue;
    const spot = node.getBoundingClientRect();
    const insideX = spot.left < box.right && spot.right > box.left;
    const insideY = spot.top < box.bottom && spot.bottom > box.top;
    if (!insideX || !insideY) continue;
    const ref = panel.refOfNode(node);
    if (ref !== null) found.push(ref);
  }
  for (const ref of found) {
    const id = keyRefKey(ref);
    if (panel.bandMode === 'tirar') panel.selected.delete(id);
    else panel.selected.set(id, ref);
  }
}

/** Rebuilds the key a diamond stands for, from what was written on it. */
export function refOfNode(panel: DopesheetPanel, node: HTMLElement): KeyRef | null {
  const doc = panel.doc;
  if (doc === null || doc.animation === null) return null;
  const id = node.dataset['alvo'];
  const time = Number(node.dataset['tempo']);
  if (id === undefined || !Number.isFinite(time)) return null;
  for (const group of dopesheetGroups(doc.file, doc.animation)) {
    for (const row of group.rows) {
      if (targetKey(row.target) !== id) continue;
      if (row.times.some((t) => sameTime(t, time))) return { target: row.target, time };
    }
  }
  return null;
}

export function endDrag(panel: DopesheetPanel): void {
  panel.drag = 'nenhum';
  panel.dragDelta = 0;
  panel.bandMode = 'trocar';
  panel.band?.remove();
  panel.band = null;
  window.removeEventListener('pointermove', panel.onPointerMove);
  window.removeEventListener('pointerup', panel.onPointerUp);
}
