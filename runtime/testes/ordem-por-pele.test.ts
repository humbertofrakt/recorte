// SPDX-License-Identifier: Apache-2.0
/**
 * `skin.drawOrder` (spec 4.4) and the base order the `drawOrder` timeline
 * measures from (spec 9.5). The conformance case C-280 proves the numbers
 * across runtimes; this file proves what a single probe cannot: that a skin
 * swap rebuilds the base order and that leaving the skin returns to the
 * array order.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { pose } from '../src/animation.js';

const CASO = join(__dirname, '..', '..', 'conformidade', 'casos', 'C-280-ordem-por-pele', 'entrada.bone');

function names(sk: Skeleton): string[] {
  return sk.drawOrder.map((s) => s.data.name);
}

describe('skin.drawOrder e a ordem base (spec 4.4, 9.5)', () => {
  const data = loadSkeletonData(JSON.parse(readFileSync(CASO, 'utf8')));

  it('sem skin, a ordem base é a ordem do array', () => {
    const sk = new Skeleton(data);
    expect(names(sk)).toEqual(['corpo', 'capa', 'braco']);
    expect(sk.baseDrawOrder.map((s) => s.data.name)).toEqual(['corpo', 'capa', 'braco']);
  });

  it('vestir a skin move a capa para a frente; tirar a skin devolve', () => {
    const sk = new Skeleton(data);
    sk.setSkin('vestida');
    expect(names(sk)).toEqual(['corpo', 'braco', 'capa']);
    sk.setSkin(null);
    expect(names(sk)).toEqual(['corpo', 'capa', 'braco']);
  });

  it('a timeline mede a partir da ordem base, e [] volta para ela', () => {
    const sk = new Skeleton(data);
    const anim = data.findAnimation('acenar')!;
    sk.setSkin('vestida');
    pose(sk, anim, 0.5);
    expect(names(sk)).toEqual(['braco', 'corpo', 'capa']);
    pose(sk, anim, 0);
    expect(names(sk)).toEqual(['corpo', 'braco', 'capa']);
    // Sem a skin, a mesma chave mede da ordem do array: braco de 2 para 1.
    sk.setSkin(null);
    pose(sk, anim, 0.5);
    expect(names(sk)).toEqual(['corpo', 'braco', 'capa']);
  });

  it('o loader guarda os deslocamentos da skin', () => {
    const skin = data.findSkin('vestida')!;
    expect(skin.drawOrder).toHaveLength(1);
    expect(skin.drawOrder[0].slot.name).toBe('capa');
    expect(skin.drawOrder[0].offset).toBe(1);
  });
});
