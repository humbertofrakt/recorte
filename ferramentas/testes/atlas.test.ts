/**
 * Tests for the atlas packer and the PNG codec (spec §10, requirement E2).
 *
 * The packing numbers here are worked out by hand in the comments, so a change
 * in the placement rule shows up as a failing expectation and not as a silent
 * repack. The UV test compares the packer's own §10.4 formula against the
 * runtime's `computeUV`, which is the one a game will actually run.
 */

import { describe, expect, it } from 'vitest';
import {
  computeRegionUV, packAtlas, packAtlasScales, regionNameFromPath, resamplePixels,
  sequenceFrameName, trimBox,
} from '../src/atlas/packer.js';
import type { AtlasRegionJson, PackerItem } from '../src/atlas/packer.js';
import { decodePng, encodePng, isPng } from '../src/atlas/png.js';
import type { PngZlib } from '../src/atlas/png.js';
import { loadAtlas, loadSkeletonData } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { writeImportIntoFile } from '../../editor/src/io/import-images.js';

// ---------------------------------------------------------------------------
// The compressor, taken from Node without dragging in its type packages
// ---------------------------------------------------------------------------

const nodeZlib = await import('node:' + 'zlib');

const ZLIB: PngZlib = {
  inflate: (data) => new Uint8Array(nodeZlib.inflateSync(data)),
  deflate: (data, level = 9) => new Uint8Array(nodeZlib.deflateSync(data, { level })),
};

// ---------------------------------------------------------------------------
// Small image helpers
// ---------------------------------------------------------------------------

type Rgba = [number, number, number, number];

/** An opaque rectangle of one colour. */
function solid(name: string, width: number, height: number, color: Rgba = [255, 0, 0, 255]): PackerItem {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0; i < pixels.length; i += 4) {
    pixels[i] = color[0];
    pixels[i + 1] = color[1];
    pixels[i + 2] = color[2];
    pixels[i + 3] = color[3];
  }
  return { name, width, height, pixels };
}

/** A fully transparent image with one opaque block inside it. */
function withBlock(
  name: string, width: number, height: number,
  left: number, top: number, blockWidth: number, blockHeight: number,
  color: Rgba = [0, 128, 255, 255],
): PackerItem {
  const pixels = new Uint8Array(width * height * 4);
  for (let y = top; y < top + blockHeight; y++) {
    for (let x = left; x < left + blockWidth; x++) {
      const p = (y * width + x) * 4;
      pixels[p] = color[0];
      pixels[p + 1] = color[1];
      pixels[p + 2] = color[2];
      pixels[p + 3] = color[3];
    }
  }
  return { name, width, height, pixels };
}

/** Reads one page pixel as `[r, g, b, a]`. */
function pixelAt(pixels: Uint8Array, pageWidth: number, x: number, y: number): Rgba {
  const p = (y * pageWidth + x) * 4;
  return [pixels[p], pixels[p + 1], pixels[p + 2], pixels[p + 3]];
}

function findRegion(regions: readonly AtlasRegionJson[], name: string): AtlasRegionJson {
  const region = regions.find((r) => r.name === name);
  if (region === undefined) throw new Error(`região "${name}" não foi gerada`);
  return region;
}

// ---------------------------------------------------------------------------
// Placement
// ---------------------------------------------------------------------------

describe('packer: placement', () => {
  it('places three known rectangles where the hand calculation says', () => {
    // Page starts at 32x32 (longest side 32, no padding). MaxRects, biggest
    // first: A 32x16 takes the top strip and leaves {0,16,32,16}; B 16x16 fills
    // its left half and leaves {16,16,16,16}; C 8x8 goes in that corner.
    const result = packAtlas(
      [solid('a', 32, 16), solid('b', 16, 16), solid('c', 8, 8)],
      { padding: 0, rotation: false, trim: false, minWidth: 16, maxWidth: 64 },
    );

    expect(result.pages).toHaveLength(1);
    expect(result.pages[0].width).toBe(32);
    expect(result.pages[0].height).toBe(32);

    expect(findRegion(result.regions, 'a')).toMatchObject({ page: 0, x: 0, y: 0, width: 32, height: 16 });
    expect(findRegion(result.regions, 'b')).toMatchObject({ page: 0, x: 0, y: 16, width: 16, height: 16 });
    expect(findRegion(result.regions, 'c')).toMatchObject({ page: 0, x: 16, y: 16, width: 8, height: 8 });

    // 512 + 256 + 64 painted pixels out of 32 * 32.
    expect(result.usage).toBeCloseTo(832 / 1024, 10);
    expect(result.imageCount).toBe(3);
  });

  it('keeps the region order of the input, folders and sequence index included', () => {
    const result = packAtlas(
      [solid('bracos/mao_01', 8, 8), solid('bracos/mao_02', 8, 9), solid('corpo', 16, 16)],
      { padding: 0, trim: false, minWidth: 16, maxWidth: 64 },
    );
    expect(result.regions.map((r) => r.name)).toEqual(['bracos/mao_01', 'bracos/mao_02', 'corpo']);
  });

  it('opens a second page when the first one is full', () => {
    const result = packAtlas(
      [solid('a', 30, 30, [255, 0, 0, 255]), solid('b', 30, 30, [0, 255, 0, 255]), solid('c', 30, 30, [0, 0, 255, 255])],
      { padding: 0, trim: false, minWidth: 32, maxWidth: 32, maxHeight: 32 },
    );
    expect(result.pages).toHaveLength(3);
    expect(result.pages.map((p) => p.image)).toEqual(['pagina.png', 'pagina2.png', 'pagina3.png']);
    expect(new Set(result.regions.map((r) => r.page))).toEqual(new Set([0, 1, 2]));
  });

  it('says which image is too big instead of looping', () => {
    expect(() => packAtlas([solid('gigante', 100, 20)], { maxWidth: 64, trim: false }))
      .toThrow(/gigante/);
  });

  it('folds identical images into aliases of one region', () => {
    const result = packAtlas(
      [solid('mao', 8, 8), solid('mao_espelho', 8, 8), solid('pe', 8, 8, [0, 255, 0, 255])],
      { padding: 0, trim: false, minWidth: 16, maxWidth: 64 },
    );
    expect(result.regions).toHaveLength(2);
    expect(findRegion(result.regions, 'mao').aliases).toEqual(['mao_espelho']);
    expect(result.imageCount).toBe(3);
  });

  it('puts every image in a cell of the same size when packing by grid', () => {
    const result = packAtlas(
      [solid('a', 16, 8), solid('b', 8, 16), solid('c', 8, 8, [0, 255, 0, 255]), solid('d', 8, 8, [0, 0, 255, 255])],
      { method: 'grid', padding: 0, trim: false, minWidth: 32, maxWidth: 64 },
    );
    // Cells are 16 x 16, so the page holds two columns of two rows.
    const spots = result.regions.map((r) => `${r.x},${r.y}`).sort();
    expect(spots).toEqual(['0,0', '0,16', '16,0', '16,16']);
    expect(result.regions.every((r) => r.rotation === undefined)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Trimming
// ---------------------------------------------------------------------------

describe('packer: trimming the transparent border', () => {
  it('finds the smallest box that holds the painted pixels', () => {
    const item = withBlock('bloco', 10, 8, 3, 2, 4, 3);
    expect(trimBox(item.pixels, 10, 8)).toEqual({ left: 3, top: 2, width: 4, height: 3 });
  });

  it('writes offsetX, offsetY, originalWidth and originalHeight of §10.3', () => {
    // 10 x 8 image, a 4 x 3 block at column 3, row 2 (from the top).
    // offsetX is the cut on the LEFT: 3.
    // offsetY is the cut at the BOTTOM (Y up): 8 - 2 - 3 = 3.
    const result = packAtlas([withBlock('bloco', 10, 8, 3, 2, 4, 3)], {
      padding: 0, minWidth: 4, minHeight: 4, maxWidth: 64,
    });
    expect(findRegion(result.regions, 'bloco')).toMatchObject({
      x: 0, y: 0, width: 4, height: 3, offsetX: 3, offsetY: 3, originalWidth: 10, originalHeight: 8,
    });
  });

  it('leaves a fully transparent image as one pixel, never as nothing', () => {
    const empty: PackerItem = { name: 'vazio', width: 6, height: 6, pixels: new Uint8Array(6 * 6 * 4) };
    const result = packAtlas([empty], { padding: 0, minWidth: 4, minHeight: 4 });
    expect(findRegion(result.regions, 'vazio')).toMatchObject({ width: 1, height: 1, originalWidth: 6, originalHeight: 6 });
  });

  it('keeps the whole image when trimming is off', () => {
    const result = packAtlas([withBlock('bloco', 10, 8, 3, 2, 4, 3)], {
      trim: false, padding: 0, minWidth: 4, minHeight: 4,
    });
    const region = findRegion(result.regions, 'bloco');
    expect(region.width).toBe(10);
    expect(region.height).toBe(8);
    expect(region.offsetX).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Rotation and the UV formula of §10.4
// ---------------------------------------------------------------------------

describe('packer: rotation of 90 degrees', () => {
  /**
   * A 32 x 24 piece takes the top of a 32 x 32 page and leaves a strip
   * {0, 24, 32, 8}. An 8 x 30 piece only fits there lying down, so it is turned
   * 90 degrees clockwise and covers 30 x 8 px at (0, 24).
   */
  function packRotated() {
    return packAtlas(
      [solid('largo', 32, 24), withBlock('alto', 8, 30, 0, 0, 8, 30, [10, 20, 30, 255])],
      { padding: 0, trim: false, minWidth: 32, maxWidth: 32, maxHeight: 32 },
    );
  }

  it('turns the piece that only fits lying down', () => {
    const result = packRotated();
    expect(result.pages).toHaveLength(1);
    expect(findRegion(result.regions, 'alto')).toMatchObject({
      x: 0, y: 24, width: 8, height: 30, rotation: 90,
    });
  });

  it('puts the top-left corner of the crop at the top-right of the block', () => {
    // §10.4: with rotation 90 the corner (px = 0, py = 0) lands on (x + height, y).
    // The last pixel inside the block is therefore (x + height - 1, y).
    const marker: Rgba = [200, 100, 50, 255];
    const alto = withBlock('alto', 8, 30, 0, 0, 8, 30, [10, 20, 30, 255]);
    alto.pixels[0] = marker[0];
    alto.pixels[1] = marker[1];
    alto.pixels[2] = marker[2];
    alto.pixels[3] = marker[3];

    const result = packAtlas([solid('largo', 32, 24), alto], {
      padding: 0, trim: false, minWidth: 32, maxWidth: 32, maxHeight: 32, bleed: 0,
    });
    const page = result.pages[0];
    const region = findRegion(result.regions, 'alto');
    expect(pixelAt(page.pixels, page.width, region.x + region.height - 1, region.y)).toEqual(marker);
  });

  it('matches computeUV of the runtime, rotated and not rotated', () => {
    const result = packRotated();
    const atlas = loadAtlas(JSON.parse(JSON.stringify(result.atlas)));
    expect(atlas.warnings).toEqual([]);

    const corners: Array<[number, number]> = [[0, 0], [1, 0], [1, 1], [0, 1], [0.25, 0.75]];
    for (const name of ['largo', 'alto']) {
      const region = findRegion(result.regions, name);
      const page = result.pages[region.page];
      const runtimeRegion = atlas.findRegion(name);
      expect(runtimeRegion).not.toBeNull();
      for (const [u0, v0] of corners) {
        const mine = computeRegionUV(region, page, u0, v0);
        const theirs = runtimeRegion!.computeUV(u0, v0);
        expect(mine[0]).toBeCloseTo(theirs[0], 12);
        expect(mine[1]).toBeCloseTo(theirs[1], 12);
      }
    }
  });

  it('matches computeUV for a trimmed region too', () => {
    const result = packAtlas([withBlock('bloco', 10, 8, 3, 2, 4, 3)], {
      padding: 0, minWidth: 8, minHeight: 8, maxWidth: 64,
    });
    const atlas = loadAtlas(JSON.parse(JSON.stringify(result.atlas)));
    const region = findRegion(result.regions, 'bloco');
    const page = result.pages[0];
    const runtimeRegion = atlas.findRegion('bloco')!;

    // The crop's top-left in original-image UVs is (3 / 10, 2 / 8).
    const [u, v] = computeRegionUV(region, page, 3 / 10, 2 / 8);
    expect(u * page.width).toBeCloseTo(region.x, 10);
    expect(v * page.height).toBeCloseTo(region.y, 10);

    const theirs = runtimeRegion.computeUV(3 / 10, 2 / 8);
    expect(u).toBeCloseTo(theirs[0], 12);
    expect(v).toBeCloseTo(theirs[1], 12);
  });

  it('never rotates when rotation is off, even if a page has to grow', () => {
    const result = packAtlas(
      [solid('largo', 32, 24), solid('alto', 8, 30)],
      { padding: 0, trim: false, rotation: false, minWidth: 32, maxWidth: 64, maxHeight: 64 },
    );
    expect(result.regions.every((r) => r.rotation === undefined)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Page sizes
// ---------------------------------------------------------------------------

describe('packer: page sizes', () => {
  it('rounds both sides up to a power of two', () => {
    const result = packAtlas([solid('a', 20, 12)], {
      pot: true, padding: 0, trim: false, minWidth: 16, maxWidth: 64,
    });
    expect(result.pages[0].width).toBe(32);
    expect(result.pages[0].height).toBe(16);
  });

  it('rounds both sides up to a multiple of four', () => {
    const result = packAtlas([solid('a', 21, 13)], {
      multipleOfFour: true, padding: 0, trim: false, minWidth: 4, minHeight: 4, maxWidth: 64,
    });
    expect(result.pages[0].width).toBe(24);
    expect(result.pages[0].height).toBe(16);
    expect(result.pages[0].width % 4).toBe(0);
    expect(result.pages[0].height % 4).toBe(0);
  });

  it('makes the page square when asked', () => {
    const result = packAtlas([solid('a', 20, 12)], {
      square: true, padding: 0, trim: false, minWidth: 4, minHeight: 4, maxWidth: 64,
    });
    expect(result.pages[0].width).toBe(result.pages[0].height);
    expect(result.pages[0].width).toBe(20);
  });

  it('shrinks the page to what is really used', () => {
    const result = packAtlas([solid('a', 10, 6)], {
      padding: 0, trim: false, minWidth: 1, minHeight: 1, maxWidth: 64,
    });
    expect(result.pages[0].width).toBe(10);
    expect(result.pages[0].height).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// Padding and bleed
// ---------------------------------------------------------------------------

describe('packer: padding and bleed', () => {
  it('copies the border pixels outward into the gap', () => {
    const result = packAtlas([solid('quadrado', 4, 4, [255, 0, 0, 255])], {
      padding: 4, bleed: 2, trim: false, minWidth: 8, minHeight: 8, maxWidth: 64,
    });
    const page = result.pages[0];
    const region = findRegion(result.regions, 'quadrado');
    expect(region).toMatchObject({ x: 0, y: 0, width: 4, height: 4 });

    // Two columns to the right of the block repeat its right edge, ...
    expect(pixelAt(page.pixels, page.width, 4, 0)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(page.pixels, page.width, 5, 0)).toEqual([255, 0, 0, 255]);
    // ... two rows below repeat its bottom edge, ...
    expect(pixelAt(page.pixels, page.width, 0, 4)).toEqual([255, 0, 0, 255]);
    expect(pixelAt(page.pixels, page.width, 0, 5)).toEqual([255, 0, 0, 255]);
    // ... the diagonal corner repeats the corner pixel, ...
    expect(pixelAt(page.pixels, page.width, 5, 5)).toEqual([255, 0, 0, 255]);
    // ... and the third column is still empty.
    expect(pixelAt(page.pixels, page.width, 6, 0)).toEqual([0, 0, 0, 0]);
  });

  it('leaves the gap empty when the bleed is zero', () => {
    const result = packAtlas([solid('quadrado', 4, 4)], {
      padding: 4, bleed: 0, trim: false, minWidth: 8, minHeight: 8, maxWidth: 64,
    });
    const page = result.pages[0];
    expect(pixelAt(page.pixels, page.width, 4, 0)).toEqual([0, 0, 0, 0]);
  });

  it('keeps the gap between two regions', () => {
    const result = packAtlas([solid('a', 8, 8), solid('b', 8, 8, [0, 255, 0, 255])], {
      padding: 4, trim: false, rotation: false, minWidth: 32, maxWidth: 64,
    });
    const a = findRegion(result.regions, 'a');
    const b = findRegion(result.regions, 'b');
    const gapX = Math.abs(a.x - b.x);
    const gapY = Math.abs(a.y - b.y);
    expect(Math.max(gapX, gapY)).toBeGreaterThanOrEqual(12);
  });
});

// ---------------------------------------------------------------------------
// Premultiplied alpha and scales
// ---------------------------------------------------------------------------

describe('packer: premultiplied alpha and scales', () => {
  it('multiplies RGB by alpha and marks the page', () => {
    const result = packAtlas([solid('meio', 4, 4, [200, 100, 50, 128])], {
      premultiplied: true, padding: 0, bleed: 0, trim: false, minWidth: 4, minHeight: 4,
    });
    const page = result.pages[0];
    expect(page.premultiplied).toBe(true);
    expect(result.atlas.pages[0].premultiplied).toBe(true);
    expect(pixelAt(page.pixels, page.width, 0, 0)).toEqual([
      Math.round((200 * 128) / 255), Math.round((100 * 128) / 255), Math.round((50 * 128) / 255), 128,
    ]);
  });

  it('writes one atlas per scale, with the scale of §10.2', () => {
    const results = packAtlasScales([solid('a', 32, 32)], [1, 0.5], {
      padding: 0, trim: false, minWidth: 8, minHeight: 8, maxWidth: 64, pageName: 'heroi',
    });
    expect(results).toHaveLength(2);
    expect(results[0].scale).toBe(1);
    expect(results[0].pages[0].image).toBe('heroi.png');
    expect(results[0].pages[0].width).toBe(32);
    expect(results[1].scale).toBe(0.5);
    expect(results[1].atlas.scale).toBe(0.5);
    expect(results[1].pages[0].image).toBe('heroi@0.5x.png');
    expect(results[1].pages[0].width).toBe(16);
    expect(findRegion(results[1].regions, 'a')).toMatchObject({ width: 16, height: 16 });
  });

  it('halves an image without inventing colours', () => {
    const small = resamplePixels(solid('a', 4, 4, [10, 20, 30, 255]).pixels, 4, 4, 2, 2);
    expect(Array.from(small)).toEqual([
      10, 20, 30, 255, 10, 20, 30, 255,
      10, 20, 30, 255, 10, 20, 30, 255,
    ]);
  });
});

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

describe('packer: names', () => {
  it('turns a file path into a region name', () => {
    expect(regionNameFromPath('bracos\\mao_01.png')).toBe('bracos/mao_01');
    expect(regionNameFromPath('./corpo.png')).toBe('corpo');
    expect(regionNameFromPath('a/b/c.PNG')).toBe('a/b/c');
  });

  it('reads the index of a sequence frame', () => {
    expect(sequenceFrameName('mao_01')).toEqual({ base: 'mao_', index: 1, digits: 2 });
    expect(sequenceFrameName('corpo')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// The atlas file itself
// ---------------------------------------------------------------------------

describe('packer: the atlas file', () => {
  it('loads clean in the runtime', () => {
    const items = [
      withBlock('corpo', 40, 60, 4, 6, 30, 48),
      withBlock('bracos/mao_01', 16, 16, 2, 2, 12, 12),
      withBlock('bracos/mao_02', 16, 16, 3, 1, 11, 13),
      solid('fundo', 24, 24, [8, 8, 8, 255]),
    ];
    const result = packAtlas(items, { maxWidth: 128, generator: 'teste' });
    const atlas = loadAtlas(JSON.parse(JSON.stringify(result.atlas)));
    expect(atlas.warnings).toEqual([]);
    expect(atlas.pages).toHaveLength(result.pages.length);
    for (const item of items) expect(atlas.findRegion(item.name)).not.toBeNull();
    expect(result.atlas.atlas).toEqual({ version: '1.0', generator: 'teste' });
  });

  it('never lets a region run off its page', () => {
    const items: PackerItem[] = [];
    for (let i = 0; i < 40; i++) items.push(solid(`peca${i}`, 5 + (i % 11) * 3, 7 + (i % 7) * 4));
    const result = packAtlas(items, { maxWidth: 64, trim: false });
    for (const region of result.regions) {
      const page = result.pages[region.page];
      const onWidth = region.rotation === 90 ? region.height : region.width;
      const onHeight = region.rotation === 90 ? region.width : region.height;
      expect(region.x + onWidth).toBeLessThanOrEqual(page.width);
      expect(region.y + onHeight).toBeLessThanOrEqual(page.height);
    }
  });
});

// ---------------------------------------------------------------------------
// PNG
// ---------------------------------------------------------------------------

/** Deterministic pixels: enough colours to be interesting, few enough to fit a palette. */
function testPixels(width: number, height: number, colors: number): Uint8Array {
  const pixels = new Uint8Array(width * height * 4);
  for (let i = 0, p = 0; p < width * height; p++, i += 4) {
    const k = p % colors;
    pixels[i] = (k * 37) & 255;
    pixels[i + 1] = (k * 91 + 13) & 255;
    pixels[i + 2] = (k * 173 + 7) & 255;
    pixels[i + 3] = k % 5 === 0 ? 0 : (200 + k) & 255;
  }
  return pixels;
}

describe('png: round trip', () => {
  it('writes and reads back the same RGBA8 pixels', () => {
    const image = { width: 17, height: 9, pixels: testPixels(17, 9, 64) };
    const bytes = encodePng(image, ZLIB);
    expect(isPng(bytes)).toBe(true);
    const back = decodePng(bytes, ZLIB);
    expect(back.width).toBe(17);
    expect(back.height).toBe(9);
    expect(back.info.colorType).toBe(6);
    expect(Array.from(back.pixels)).toEqual(Array.from(image.pixels));
  });

  it('writes and reads back the same pixels through a palette', () => {
    const image = { width: 13, height: 11, pixels: testPixels(13, 11, 16) };
    const bytes = encodePng(image, ZLIB, { colorType: 'palette' });
    const back = decodePng(bytes, ZLIB);
    expect(back.info.colorType).toBe(3);
    expect(back.info.paletted).toBe(true);
    expect(back.info.transparency).toBe(true);
    expect(Array.from(back.pixels)).toEqual(Array.from(image.pixels));
  });

  it('writes and reads back RGB8 and grey8', () => {
    const opaque = new Uint8Array(8 * 8 * 4);
    for (let p = 0, i = 0; p < 64; p++, i += 4) {
      opaque[i] = p * 3;
      opaque[i + 1] = p * 3;
      opaque[i + 2] = p * 3;
      opaque[i + 3] = 255;
    }
    const image = { width: 8, height: 8, pixels: opaque };

    const rgb = decodePng(encodePng(image, ZLIB, { colorType: 'rgb8' }), ZLIB);
    expect(rgb.info.colorType).toBe(2);
    expect(Array.from(rgb.pixels)).toEqual(Array.from(opaque));

    const grey = decodePng(encodePng(image, ZLIB, { colorType: 'gray8' }), ZLIB);
    expect(grey.info.colorType).toBe(0);
    expect(Array.from(grey.pixels)).toEqual(Array.from(opaque));
  });

  it('survives every row filter, 0 to 4, and the adaptive one', () => {
    const image = { width: 12, height: 7, pixels: testPixels(12, 7, 32) };
    for (const filter of [0, 1, 2, 3, 4, 'adaptive'] as const) {
      const back = decodePng(encodePng(image, ZLIB, { filter }), ZLIB);
      expect(Array.from(back.pixels), `filtro ${filter}`).toEqual(Array.from(image.pixels));
    }
    for (const filter of [0, 1, 2, 3, 4, 'adaptive'] as const) {
      const back = decodePng(encodePng(image, ZLIB, { colorType: 'palette', filter }), ZLIB);
      expect(Array.from(back.pixels), `paleta, filtro ${filter}`).toEqual(Array.from(image.pixels));
    }
  });

  it('picks the smallest exact storage on auto', () => {
    const few = { width: 4, height: 4, pixels: testPixels(4, 4, 3) };
    expect(decodePng(encodePng(few, ZLIB, { colorType: 'auto' }), ZLIB).info.colorType).toBe(3);

    const many = { width: 40, height: 40, pixels: testPixels(40, 40, 1000) };
    expect(decodePng(encodePng(many, ZLIB, { colorType: 'auto' }), ZLIB).info.colorType).toBe(6);
  });

  it('refuses a palette that does not fit and says why', () => {
    const many = { width: 40, height: 40, pixels: testPixels(40, 40, 1000) };
    expect(() => encodePng(many, ZLIB, { colorType: 'palette' })).toThrow(/256/);
  });

  it('refuses bytes that are not a PNG', () => {
    expect(isPng(new Uint8Array([1, 2, 3]))).toBe(false);
    expect(() => decodePng(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]), ZLIB)).toThrow(/PNG/);
  });

  it('reads what render-png.mjs writes, and the other way round', async () => {
    const url = new URL('../render-png.mjs', import.meta.url).href;
    const rp = await import(/* @vite-ignore */ url);
    const image = { width: 9, height: 5, pixels: testPixels(9, 5, 20) };

    const theirs = rp.lerPng(rp.gravarPng(image.width, image.height, image.pixels));
    expect(theirs.largura).toBe(9);
    expect(Array.from(theirs.rgba)).toEqual(Array.from(image.pixels));

    const mineRead = decodePng(new Uint8Array(rp.gravarPng(image.width, image.height, image.pixels)), ZLIB);
    expect(Array.from(mineRead.pixels)).toEqual(Array.from(image.pixels));

    const buffer = (globalThis as { Buffer?: { from(data: Uint8Array): unknown } }).Buffer;
    const theirsRead = rp.lerPng(buffer!.from(encodePng(image, ZLIB, { filter: 'adaptive' })));
    expect(Array.from(theirsRead.rgba)).toEqual(Array.from(image.pixels));
  });

});

// ---------------------------------------------------------------------------
// What "Importar imagens" writes into the document
// ---------------------------------------------------------------------------

/** A document with nothing but a root bone, the way "Novo" leaves it. */
function emptyFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
  };
}

describe('editor: importing loose images', () => {
  const items = [
    withBlock('corpo', 40, 60, 4, 6, 30, 48),
    withBlock('bracos/mao_01', 16, 16, 2, 2, 12, 12),
    solid('cabeca', 24, 24, [240, 200, 160, 255]),
  ];

  function imported() {
    const packed = packAtlas(items, { maxWidth: 128, pageName: 'heroi', generator: 'teste' });
    const file = emptyFile();
    writeImportIntoFile(file, packed, 'heroi.atlas.json', items.map((i) => i.name));
    return { packed, file };
  }

  it('points the skeleton at the atlas, once', () => {
    const { packed, file } = imported();
    expect(file.assets?.atlases).toEqual(['heroi.atlas.json']);
    writeImportIntoFile(file, packed, 'heroi.atlas.json', []);
    expect(file.assets?.atlases).toEqual(['heroi.atlas.json']);
  });

  it('creates one slot per image, in the order they came in', () => {
    const { file } = imported();
    expect(file.slots?.map((slot) => slot.name)).toEqual(['corpo', 'mao_01', 'cabeca']);
    expect(file.slots?.every((slot) => slot.bone === 'root')).toBe(true);
    expect(file.slots?.every((slot) => slot.attachment === slot.name)).toBe(true);
  });

  it('creates a region attachment with the original size in skeleton px', () => {
    const { file } = imported();
    const attachments = file.skins?.[0].attachments ?? {};
    expect(file.skins?.[0].name).toBe('default');
    expect(attachments['corpo']['corpo']).toMatchObject({ type: 'region', width: 40, height: 60 });
    // The slot took the last segment, so the attachment keeps the full path.
    expect(attachments['mao_01']['mao_01']).toMatchObject({ type: 'region', path: 'bracos/mao_01' });
    expect(attachments['cabeca']['cabeca']).not.toHaveProperty('path');
  });

  it('no longer lays the images out in a row (lote 59): no x is written', () => {
    // The row turned twelve 580 px images into 7.000 px and sent the scene to
    // 9% zoom. Images now wait in the Imagens tab until someone drags them.
    const { file } = imported();
    const attachments = file.skins?.[0].attachments ?? {};
    expect(attachments['corpo']['corpo']).not.toHaveProperty('x');
    expect(attachments['mao_01']['mao_01']).not.toHaveProperty('x');
  });

  it('stacks them at the origin', () => {
    const packed = packAtlas(items, { maxWidth: 128, pageName: 'heroi' });
    const file = emptyFile();
    writeImportIntoFile(file, packed, 'heroi.atlas.json', items.map((i) => i.name));
    const attachments = file.skins?.[0].attachments ?? {};
    expect(attachments['corpo']['corpo']).not.toHaveProperty('x');
  });

  it('does not reuse a slot name that is already taken', () => {
    const packed = packAtlas(items, { maxWidth: 128, pageName: 'heroi' });
    const file = emptyFile();
    file.slots = [{ name: 'corpo', bone: 'root' }];
    writeImportIntoFile(file, packed, 'heroi.atlas.json', ['corpo']);
    expect(file.slots.map((slot) => slot.name)).toEqual(['corpo', 'corpo2']);
  });

  it('gives a document the runtime loads with no warning and no missing image', () => {
    const { packed, file } = imported();
    const atlas = loadAtlas(JSON.parse(JSON.stringify(packed.atlas)));
    const data = loadSkeletonData(JSON.parse(JSON.stringify(file)), { atlases: [atlas] });
    expect(data.warnings).toEqual([]);
    expect(data.missingImages).toEqual([]);
    expect(data.slots).toHaveLength(3);
  });
});

describe('png: a packed page survives the file', () => {
  it('keeps every pixel through write and read', () => {
    const result = packAtlas(
      [withBlock('corpo', 20, 30, 2, 3, 15, 22), solid('mao', 9, 9, [0, 200, 120, 255])],
      { maxWidth: 128, generator: 'teste' },
    );
    const page = result.pages[0];
    const back = decodePng(encodePng(page, ZLIB, { filter: 'adaptive' }), ZLIB);
    expect(back.width).toBe(page.width);
    expect(back.height).toBe(page.height);
    expect(Array.from(back.pixels)).toEqual(Array.from(page.pixels));
  });
});
