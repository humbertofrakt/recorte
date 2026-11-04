/**
 * **O meio da cena, no mundo** — rodada 15 (04/10/2026), linha 6.
 *
 * O emissor novo, sem nada escolhido, tem de nascer **onde se vê**: no meio do
 * que a câmera mostra. Quem cria o emissor (`panels/`) não conhece a câmera, e
 * não deve importar a cena (`viewport/viewport.ts` só o `main.ts` importa). A
 * cena diz aqui como perguntar; quem cria pergunta.
 *
 * Puro, sem DOM: num teste sem cena a resposta é `null`, e quem cria cai no
 * lugar de sempre.
 */

/** Um ponto no mundo (Y para cima), como o esqueleto o mede. */
export interface WorldPoint2 {
  readonly x: number;
  readonly y: number;
}

let source: (() => WorldPoint2 | null) | null = null;

/** A cena instala aqui a sua pergunta; `null` tira. */
export function setViewCenterSource(fn: (() => WorldPoint2 | null) | null): void {
  source = fn;
}

/** O meio do que a câmera mostra, no mundo, ou `null` sem cena. */
export function viewCenter(): WorldPoint2 | null {
  return source === null ? null : source();
}

/**
 * **Andar a vista** — rodada 39b (doc 36, defeito 1). Quem muda o lugar do
 * boneco no mundo SEM mudar o desenho (o "Pôr no projeto" para cima: o boneco
 * sai da âncora do mecha e o mecha passa a ficar em volta dele) pede à cena
 * para andar a câmera o mesmo tanto, e na tela nada pula. Sem cena (teste),
 * ninguém ouve, e nada acontece.
 */
let panSink: ((dx: number, dy: number) => void) | null = null;

/** A cena instala aqui como andar a câmera, em unidades do mundo; `null` tira. */
export function setViewPanSink(fn: ((dx: number, dy: number) => void) | null): void {
  panSink = fn;
}

/** Anda o meio da vista `dx`, `dy` no mundo (Y para cima). Sem cena, nada. */
export function panView(dx: number, dy: number): void {
  if (dx === 0 && dy === 0) return;
  panSink?.(dx, dy);
}
