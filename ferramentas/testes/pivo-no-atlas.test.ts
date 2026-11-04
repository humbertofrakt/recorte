/**
 * Lote 55 — o pivô por região do atlas (spec 10.3, `pivotX`, `pivotY`).
 *
 * O campo é da imagem ORIGINAL: o corte da borda não o move, o reempacotar
 * não o perde, o editor grava o que leu, o validador aceita número. A pose que
 * não muda está em `runtime/testes/loader.test.ts`.
 * Plano: `documentos/planos/PLANO pivô e Animando 2026-09-10.md`.
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { packAtlas } from '../src/atlas/packer.js';
import type { AtlasJson, AtlasRegionJson, PackerItem } from '../src/atlas/packer.js';
import { repackAtlas } from '../src/exportar/fatiar.js';
import { loadAtlas } from '../../runtime/src/index.js';
import type { AtlasFile } from '../../runtime/src/types.js';
import { atlasToJson } from '../../editor/src/io/save-binary.js';

const RAIZ = 'C:/Users/F-rak/Desktop/animador';

/** A transparent image with one opaque block inside it. */
function withBlock(
  name: string, width: number, height: number,
  left: number, top: number, blockWidth: number, blockHeight: number,
  extra: Partial<PackerItem> = {},
): PackerItem {
  const pixels = new Uint8Array(width * height * 4);
  for (let y = top; y < top + blockHeight; y++) {
    for (let x = left; x < left + blockWidth; x++) {
      const p = (y * width + x) * 4;
      pixels[p] = 200; pixels[p + 1] = 100; pixels[p + 2] = 50; pixels[p + 3] = 255;
    }
  }
  return { name, width, height, pixels, ...extra };
}

function region(atlas: AtlasJson, name: string): AtlasRegionJson {
  const found = atlas.regions.find((r) => r.name === name);
  if (found === undefined) throw new Error(`região "${name}" não saiu`);
  return found;
}

describe('pivô no empacotador', () => {
  it('o corte da borda não move o pivô', () => {
    // 20×10 com um bloco 8×5 em (3, 2): corta 3 à esquerda e 10 − 2 − 5 = 3 embaixo.
    const packed = packAtlas([withBlock('mao', 20, 10, 3, 2, 8, 5, { pivotX: 12, pivotY: 3 })], { padding: 0 });
    const r = region(packed.atlas, 'mao');
    expect(r.offsetX).toBe(3);
    expect(r.offsetY).toBe(3);
    expect(r.pivotX).toBe(12);
    expect(r.pivotY).toBe(3);
  });

  it('sem pivô na entrada, nada sai', () => {
    const r = region(packAtlas([withBlock('mao', 20, 10, 3, 2, 8, 5)]).atlas, 'mao');
    expect('pivotX' in r).toBe(false);
    expect('pivotY' in r).toBe(false);
  });

  it('com escala, o pivô encolhe junto com a imagem (10.5)', () => {
    const packed = packAtlas([withBlock('mao', 20, 10, 0, 0, 20, 10, { pivotX: 12, pivotY: 3 })], { scale: 0.5, trim: false });
    const r = region(packed.atlas, 'mao');
    expect(r.width).toBe(10);
    expect(r.pivotX).toBe(6);
    expect(r.pivotY).toBe(1.5);
  });

  it('duas cópias do mesmo desenho viram apelido só com o mesmo pivô', () => {
    const same = packAtlas([
      withBlock('a', 8, 8, 0, 0, 8, 8, { pivotX: 1, pivotY: 2 }),
      withBlock('b', 8, 8, 0, 0, 8, 8, { pivotX: 1, pivotY: 2 }),
    ]);
    expect(same.atlas.regions.map((r) => r.name)).toEqual(['a']);
    expect(region(same.atlas, 'a').aliases).toEqual(['b']);

    // É o que "Duplicar no atlas" faz: mesmo retângulo, outro pivô, outra região.
    const other = packAtlas([
      withBlock('a', 8, 8, 0, 0, 8, 8, { pivotX: 1, pivotY: 2 }),
      withBlock('a_2', 8, 8, 0, 0, 8, 8, { pivotX: 7, pivotY: 2 }),
    ]);
    expect(other.atlas.regions.map((r) => r.name).sort()).toEqual(['a', 'a_2']);
    expect(region(other.atlas, 'a_2').pivotX).toBe(7);
  });
});

describe('pivô no reempacotar de uma pele', () => {
  it('as regiões mantidas trazem o pivô da origem', () => {
    const source = packAtlas([
      withBlock('mao', 20, 10, 3, 2, 8, 5, { pivotX: 12, pivotY: 3 }),
      withBlock('pe', 12, 12, 1, 1, 6, 6),
      withBlock('capa', 16, 16, 0, 0, 16, 16, { pivotX: -4, pivotY: 40 }),
    ], { padding: 0, pageName: 'origem' });
    const page = {
      name: source.atlas.pages[0].name,
      width: source.pages[0].width, height: source.pages[0].height, pixels: source.pages[0].pixels,
    };
    const repacked = repackAtlas(source.atlas as unknown as AtlasFile, [page], new Set(['mao', 'pe']));
    expect(repacked.atlas.regions.map((r) => r.name).sort()).toEqual(['mao', 'pe']);
    const mao = region(repacked.atlas, 'mao');
    expect([mao.pivotX, mao.pivotY]).toEqual([12, 3]);
    expect([mao.offsetX, mao.offsetY]).toEqual([3, 3]);
    expect('pivotX' in region(repacked.atlas, 'pe')).toBe(false);
  });
});

describe('pivô no atlasToJson do editor', () => {
  const tree = {
    atlas: { version: '1.0' },
    pages: [{ name: 'p', image: 'p.png', width: 64, height: 64 }],
    regions: [
      { name: 'mao', page: 0, x: 0, y: 0, width: 10, height: 10, pivotX: 2.5, pivotY: -1 },
      { name: 'pe', page: 0, x: 10, y: 0, width: 10, height: 10 },
    ],
  };

  it('ida e volta dos dois campos; sem pivô no original, nada é gravado', () => {
    const written = atlasToJson(loadAtlas(tree)) as { regions: Array<Record<string, unknown>> };
    expect(written.regions[0]).toMatchObject({ name: 'mao', pivotX: 2.5, pivotY: -1 });
    expect('pivotX' in written.regions[1]).toBe(false);
    expect('pivotY' in written.regions[1]).toBe(false);
    const again = loadAtlas(written);
    expect([again.regions[0].pivotX, again.regions[0].pivotY]).toEqual([2.5, -1]);
    expect(again.regions[1].pivotX).toBeUndefined();
  });
});

describe('pivô no validador da linha de comando', () => {
  function validate(regionExtra: Record<string, unknown>): number {
    const dir = mkdtempSync(join(tmpdir(), 'pivo-'));
    const path = join(dir, 'teste.atlas.json');
    writeFileSync(path, JSON.stringify({
      atlas: { version: '1.0', generator: 'teste' },
      pages: [{ name: 'p', image: 'p.png', width: 64, height: 64 }],
      regions: [{ name: 'mao', page: 0, x: 0, y: 0, width: 10, height: 10, ...regionExtra }],
    }));
    try {
      execFileSync('node', [join(RAIZ, 'ferramentas/validador/validar.mjs'), path], { stdio: 'pipe' });
      return 0;
    } catch (error) {
      return (error as { status: number }).status;
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it('aceita número, até fora da imagem, e recusa texto', () => {
    expect(validate({ pivotX: 12, pivotY: 3 })).toBe(0);
    expect(validate({ pivotX: -40.25, pivotY: 900 })).toBe(0);
    expect(validate({ pivotX: '12' })).toBe(1);
  });
});
