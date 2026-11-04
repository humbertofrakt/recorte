/**
 * As réguas da cena (dono B) — lote 21, rodada 3.
 *
 * O Spriter tem números em cima e à esquerda do desenho: `-1000 · -500 · 0 ·
 * 500 · 1000`. Nós tínhamos a grade, que diz "de quanto em quanto", e os eixos,
 * que dizem onde é o zero — mas nada que diga **em que número eu estou**.
 *
 * Isso importa porque as posições do formato são números que se digitam: pôr um
 * ponto em `x = 240` e conferir na tela onde é 240 era uma conta de cabeça.
 *
 * Este arquivo é a conta das marcas, e mais nada. Ele não desenha, não sabe o
 * que é um canvas, e **usa o mesmo `gridStep` da grade**: régua e grade nunca
 * podem discordar — duas escalas na mesma tela é pior que nenhuma.
 */

import { gridStep } from './camera.js';

/** Uma marca da régua. */
export interface RulerTick {
  /** Onde ela cai, em pixels de tela, a partir da borda da régua. */
  px: number;
  /** O número do mundo naquele ponto. */
  value: number;
  /** `true` na marca com número escrito; as outras são só um risco. */
  major: boolean;
}

/** Espessura da régua, em pixels de tela. */
export const RULER_SIZE = 20;

/**
 * Quantas marcas finas há entre duas marcas com número.
 *
 * Cinco. Com dez, a 48px de passo, os riscos ficam a menos de 5px um do outro e
 * viram uma faixa cinza; com duas, não ajudam a estimar nada.
 */
export const MINOR_PER_MAJOR = 5;

/** O que a régua precisa saber da câmera. */
export interface RulerCamera {
  zoom: number;
  /** O valor do mundo na borda de onde a régua começa. */
  from: number;
  /** O valor do mundo na outra ponta. */
  to: number;
}

/**
 * As marcas de uma régua, da borda até `lengthPx`.
 *
 * `axis` muda só uma coisa: em **Y** o mundo cresce para CIMA (§3), e a tela
 * cresce para baixo. Um pixel maior é um valor menor, e é por isso que os dois
 * eixos não podem partilhar a mesma conta sem um sinal.
 *
 * Devolve `[]` quando não há o que desenhar — largura zero, zoom zero, uma
 * câmera que ainda não mediu a tela. Uma régua vazia é melhor que uma régua
 * com um milhão de riscos.
 */
export function rulerTicks(
  camera: RulerCamera, lengthPx: number, axis: 'x' | 'y', gridPixels = 48,
): RulerTick[] {
  if (!(lengthPx > 0) || !(camera.zoom > 1e-9)) return [];
  const span = camera.to - camera.from;
  if (!Number.isFinite(span) || span === 0) return [];

  const major = gridStep(camera.zoom, gridPixels);
  const step = major / MINOR_PER_MAJOR;
  if (!(step > 0)) return [];

  const menor = Math.min(camera.from, camera.to);
  const maior = Math.max(camera.from, camera.to);
  const primeiro = Math.ceil(menor / step) * step;
  const quantas = Math.floor((maior - primeiro) / step) + 1;
  // Um teto para o caso de uma câmera absurda: mil riscos não se leem, e mil
  // riscos por quadro custam mais que o resto do desenho junto.
  if (!(quantas > 0) || quantas > 2000) return [];

  const out: RulerTick[] = [];
  for (let i = 0; i < quantas; i++) {
    // A conta em `i * step` e não em `valor += step` de propósito: somar em
    // ponto flutuante mil vezes afasta o zero do zero.
    const value = primeiro + i * step;
    const t = (value - camera.from) / span;
    out.push({
      px: t * lengthPx,
      value: limparZero(value),
      // Uma marca é "maior" quando cai num múltiplo do passo da GRADE: é isso
      // que faz o número da régua cair em cima da linha da grade.
      major: Math.abs(value / major - Math.round(value / major)) < 1e-6,
    });
  }
  void axis;
  return out;
}

/**
 * Tira o `-0` e o resto de ponto flutuante do número da marca.
 *
 * Uma régua que escreve `-0` ou `1e-14` ao lado do eixo verde é uma régua que
 * ninguém acredita.
 */
function limparZero(value: number): number {
  const arredondado = Math.round(value * 1e6) / 1e6;
  return arredondado === 0 ? 0 : arredondado;
}

/**
 * O número escrito numa marca.
 *
 * Sem casa decimal quando não precisa: `500`, e não `500,0`. Com uma quando o
 * passo é menor que um — dá para aproximar até um décimo de unidade.
 */
/**
 * Onde está o ponteiro, em pixels do mundo — rodada 46, lote 4 (doc `66`,
 * §2.6: a régua marcava o mouse com um traço sem número). Uma etiqueta só, na
 * régua de cima, com os dois eixos: *"X 123 · Y −45 px"*.
 */
export function pointerRulerLabel(x: number, y: number): string {
  const n = (v: number): string => rulerLabel(Math.round(v)).replace(/^-/, '−');
  return `X ${n(x)} · Y ${n(y)} px`;
}

export function rulerLabel(value: number): string {
  const inteiro = Math.abs(value - Math.round(value)) < 1e-6;
  return inteiro ? String(Math.round(value)) : value.toFixed(1).replace('.', ',');
}
