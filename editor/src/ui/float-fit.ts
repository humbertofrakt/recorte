/**
 * O painel solto cabe INTEIRO na área — rodada 4, lote 3 (05/10/2026).
 *
 * O `clampFloat` de `panel-groups.ts` só guarda 48 px de barra à vista: o resto
 * do painel pode pendurar para fora. Na conferência da rodada 4 isso apareceu
 * duas vezes: a aba solta sobre o corpo de outro painel caiu em `x = -10`,
 * com 220 px abaixo da cena, **por cima dos botões da linha do tempo** (foto
 * `37`); e em 1280×720 o painel solto no meio da cena desce sobre o tocador
 * (foto `42`). A régua do Photoshop é outra: o painel flutua por cima da
 * cena, e nunca esconde o que fica fora dela.
 *
 * Aqui a régua passa a ser: **o painel inteiro dentro da camada dos soltos**
 * (a faixa do meio, entre a barra e a linha do tempo). Se ele não cabe, ele
 * ENCOLHE até o mínimo; se nem o mínimo cabe, ele ocupa a área toda. Nunca
 * sai, nunca cobre a linha do tempo.
 *
 * Puro. Quem desenha é a casca; quem decide é isto.
 */

import {
  FLOAT_MAX_FRACTION, FLOAT_MIN_H, FLOAT_MIN_W,
} from './panel-groups.js';
import type { FloatBox } from './panel-groups.js';

/**
 * A caixa do painel solto, inteira dentro de uma área `areaW × areaH`.
 *
 * O tamanho fica entre o mínimo e 80% da área (a mesma fração de antes: o
 * painel não pode cobrir a cena inteira). A posição empurra a caixa para
 * dentro pelo lado que passou — quem soltou perto da borda de baixo ganha o
 * painel encostado nela, e não pendurado.
 */
export function fitFloat(box: FloatBox, areaW: number, areaH: number): FloatBox {
  const largura = Math.max(1, Math.round(areaW));
  const altura = Math.max(1, Math.round(areaH));
  const maxW = Math.min(largura, Math.max(FLOAT_MIN_W, Math.floor(largura * FLOAT_MAX_FRACTION)));
  const maxH = Math.min(altura, Math.max(FLOAT_MIN_H, Math.floor(altura * FLOAT_MAX_FRACTION)));
  const w = Math.min(maxW, Math.max(Math.min(FLOAT_MIN_W, maxW), Math.round(box.w)));
  const h = Math.min(maxH, Math.max(Math.min(FLOAT_MIN_H, maxH), Math.round(box.h)));
  const x = Math.min(Math.max(0, Math.round(box.x)), largura - w);
  const y = Math.min(Math.max(0, Math.round(box.y)), altura - h);
  return { x, y, w, h };
}

/**
 * Mudar o TAMANHO pelo canto, sem o painel pular de lugar: o canto de cima à
 * esquerda fica onde está, e a caixa só cresce até a borda da área. (O
 * `fitFloat` sozinho empurraria o painel para dentro, e quem puxa o canto vê a
 * caixa andar debaixo da mão.)
 */
export function resizeInside(box: FloatBox, areaW: number, areaH: number): FloatBox {
  const x = Math.max(0, Math.round(box.x));
  const y = Math.max(0, Math.round(box.y));
  return fitFloat({
    x, y,
    w: Math.min(Math.round(box.w), Math.max(1, Math.round(areaW) - x)),
    h: Math.min(Math.round(box.h), Math.max(1, Math.round(areaH) - y)),
  }, areaW, areaH);
}

/** A caixa está inteira dentro da área? É a pergunta que a prova faz. */
export function floatInside(box: FloatBox, areaW: number, areaH: number): boolean {
  return box.x >= 0 && box.y >= 0 && box.x + box.w <= areaW && box.y + box.h <= areaH;
}
