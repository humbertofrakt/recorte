/**
 * As guias da cena (dono B) — lote 42, rodada 4, Spriter 8.
 *
 * Arrastar a partir da régua de cima cria uma guia **deitada**; da régua da
 * esquerda, uma guia **em pé**. A ferramenta Mover **imanta** nelas a 6 pixels
 * de tela: o pé que tem de pisar no chão pisa, sem conta de cabeça.
 *
 * ONDE MORAM. Em `RECORTE_editor_state.view.guides`, junto das outras opções
 * de ver — nunca no núcleo do `.bone` (regra 6 da casa). Uma guia é de quem
 * monta o boneco, não do boneco: um leitor que não conhece a extensão ignora
 * tudo, e o arquivo do jogo não muda um byte.
 *
 * Puro: sem canvas e sem DOM. Quem desenha é o `viewport.ts`.
 */

/** Uma guia. `x` é uma linha em pé, em `x = value`; `y`, uma deitada, em `y = value`. */
export interface Guide {
  axis: 'x' | 'y';
  /** Posição no mundo, em pixels do arquivo (§3). */
  value: number;
}

/** A distância do ímã, em pixels de TELA: igual em qualquer zoom. */
export const GUIDE_SNAP_PIXELS = 6;

/** A cor das guias: o ciano do Photoshop e do Spriter, que nenhum desenho usa. */
export const GUIDE_COLOR = '#12b3d6';

/** Duas casas: a guia vem do ponteiro, e o ponteiro não acerta a milésima. */
function round(value: number): number {
  const out = Math.round(value * 100) / 100;
  return Object.is(out, -0) ? 0 : out;
}

/**
 * Leva `pos` para a guia mais perto, se ela estiver a até `tolerance`.
 * Fora do alcance, `pos` volta como veio.
 *
 * `snapToGuides(103, [100], 6)` dá `100`; com `108` dá `108`.
 */
export function snapToGuides(pos: number, guides: readonly number[], tolerance: number): number {
  let best = pos;
  let bestDistance = tolerance;
  for (const guide of guides) {
    const distance = Math.abs(pos - guide);
    if (distance <= bestDistance) {
      bestDistance = distance;
      best = guide;
    }
  }
  return best;
}

/** As posições das guias de um eixo. */
export function guideValues(guides: readonly Guide[], axis: 'x' | 'y'): number[] {
  return guides.filter((guide) => guide.axis === axis).map((guide) => guide.value);
}

/**
 * Um ponto do mundo levado às guias: `x` às em pé, `y` às deitadas.
 * `tolerance` já em unidades do mundo (6 px divididos pelo zoom).
 */
export function snapPoint(
  x: number, y: number, guides: readonly Guide[], tolerance: number,
): { x: number; y: number } {
  return {
    x: snapToGuides(x, guideValues(guides, 'x'), tolerance),
    y: snapToGuides(y, guideValues(guides, 'y'), tolerance),
  };
}

/** A lista com uma guia a mais. Uma guia repetida não entra duas vezes. */
export function addGuide(guides: readonly Guide[], guide: Guide): Guide[] {
  const value = round(guide.value);
  if (guides.some((g) => g.axis === guide.axis && Math.abs(g.value - value) < 1e-6)) return [...guides];
  return [...guides, { axis: guide.axis, value }];
}

/** A régua sob o ponto da tela, ou `null`. O cantinho onde as duas se cruzam não é de nenhuma. */
export function rulerAt(screenX: number, screenY: number, size: number): 'top' | 'left' | null {
  const top = screenY < size;
  const left = screenX < size;
  if (top && left) return null;
  if (top) return 'top';
  if (left) return 'left';
  return null;
}

/** A guia que nasce do arrasto: da régua de cima, deitada; da esquerda, em pé. */
export function guideFromRuler(ruler: 'top' | 'left', worldX: number, worldY: number): Guide {
  return ruler === 'top' ? { axis: 'y', value: round(worldY) } : { axis: 'x', value: round(worldX) };
}

/** A frase do rodapé para uma guia. */
export function guideLabel(guide: Guide): string {
  const valor = String(guide.value).replace('.', ',');
  return guide.axis === 'y' ? `Guia deitada em y = ${valor}` : `Guia em pé em x = ${valor}`;
}

/** As guias de um JSON solto. O que não for guia é deixado de fora, sem erro. */
export function parseGuides(saved: unknown): Guide[] {
  if (!Array.isArray(saved)) return [];
  const out: Guide[] = [];
  for (const item of saved) {
    if (item === null || typeof item !== 'object') continue;
    const axis = (item as { axis?: unknown }).axis;
    const value = (item as { value?: unknown }).value;
    if ((axis === 'x' || axis === 'y') && typeof value === 'number' && Number.isFinite(value)) {
      out.push({ axis, value });
    }
  }
  return out;
}
