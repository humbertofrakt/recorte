// SPDX-License-Identifier: Apache-2.0
/**
 * Atlas packer (requirement E2, spec §10).
 *
 * Pure TypeScript: no Node, no DOM. It takes a list of images already decoded
 * to RGBA8 and gives back finished pages (as RGBA8 pixel buffers) plus the
 * atlas JSON of §10.3, ready to be written next to them. The command line
 * (`ferramentas/empacotar.mjs`) and the editor ("Importar imagens") both call
 * this same function, so a page packed on disk and a page packed in the browser
 * are byte-for-byte the same.
 *
 * What it does, in the order it happens:
 *   1. resample, when a scale other than 1 was asked for;
 *   2. trim the transparent border, recording `offsetX/offsetY` and
 *      `originalWidth/originalHeight` exactly as §10.3 defines them;
 *   3. fold pixel-identical images into `aliases` of one region;
 *   4. place the crops, by MaxRects or by a fixed grid, rotating 90° clockwise
 *      when that makes one fit;
 *   5. shrink each page to the smallest size the options allow;
 *   6. blit, duplicate the border into the padding (bleed), and premultiply.
 *
 * Region names are passed through untouched, so `bracos/mao_01` keeps both its
 * folder and its sequence index (§7.10).
 */

// ---------------------------------------------------------------------------
// The atlas JSON of §10, declared here so this module imports nothing
// ---------------------------------------------------------------------------

export interface AtlasPageJson {
  name: string;
  image: string;
  width: number;
  height: number;
  format?: string;
  minFilter?: string;
  magFilter?: string;
  wrapU?: string;
  wrapV?: string;
  premultiplied?: boolean;
}

export interface AtlasRegionJson {
  name: string;
  aliases?: string[];
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
  originalWidth?: number;
  originalHeight?: number;
  pivotX?: number;
  pivotY?: number;
}

export interface AtlasJson {
  atlas: { version: string; generator?: string };
  scale?: number;
  pages: AtlasPageJson[];
  regions: AtlasRegionJson[];
}

// ---------------------------------------------------------------------------
// Input and options
// ---------------------------------------------------------------------------

/** One image to pack. `pixels` is RGBA8, straight alpha, top-down. */
export interface PackerItem {
  /** Region name. Folders (`corpo/mao`) and sequence indices (`mao_01`) are kept. */
  name: string;
  width: number;
  height: number;
  pixels: Uint8Array;
  /**
   * Pivot in px of this image, from the left and from the bottom (§10.3).
   * Trimming does not move it: it is measured on the original, not the crop.
   * Absent = the centre.
   */
  pivotX?: number;
  pivotY?: number;
}

export type PackMethod = 'maxrects' | 'grid';

export interface PackOptions {
  /** Largest page, in px. Default `2048`. */
  maxWidth?: number;
  /** Default: the same as `maxWidth`. */
  maxHeight?: number;
  /** Smallest page, in px. Default `16`. */
  minWidth?: number;
  /** Default: the same as `minWidth`. */
  minHeight?: number;
  /** Gap between two regions, in px. Default `2`. */
  padding?: number;
  /** Keep `padding` free at the page border too. Default `false`. */
  edgePadding?: boolean;
  /** Border pixels duplicated outward into the gap. Default `floor(padding / 2)`. */
  bleed?: number;
  /** Cut the transparent border off each image. Default `true`. */
  trim?: boolean;
  /** A pixel counts as empty when its alpha is at or below this. Default `0`. */
  alphaThreshold?: number;
  /** Allow turning a crop 90° clockwise to make it fit. Default `true`. */
  rotation?: boolean;
  /** Page sides must be powers of two. Default `false`. */
  pot?: boolean;
  /** Page sides must be multiples of four. Default `false`. */
  multipleOfFour?: boolean;
  /** Page must be square. Default `false`. */
  square?: boolean;
  /** Multiply RGB by alpha and mark the page `premultiplied` (§7.12). Default `false`. */
  premultiplied?: boolean;
  /** `maxrects` packs tightly; `grid` puts every image in a cell of one size. Default `maxrects`. */
  method?: PackMethod;
  /** Fold pixel-identical images into one region with `aliases`. Default `true`. */
  aliases?: boolean;
  /** Base name of the pages. Page 1 is `<base>`, page 2 is `<base>2`. Default `'pagina'`. */
  pageName?: string;
  /** Appended to the page name to build `page.image`. Default `'.png'`. */
  imageExtension?: string;
  /** Written into `atlas.generator`. */
  generator?: string;
  /** Resample factor, and the `scale` written in the atlas. Default `1`. */
  scale?: number;
  format?: string;
  minFilter?: string;
  magFilter?: string;
  wrapU?: string;
  wrapV?: string;
}

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------

export interface PackedPage extends AtlasPageJson {
  /** `width * height * 4` bytes, RGBA8, top-down. */
  pixels: Uint8Array;
}

export interface PackedAtlas {
  /** Page px per skeleton px (§10.2). Equal to the requested `scale`. */
  scale: number;
  pages: PackedPage[];
  regions: AtlasRegionJson[];
  /** The atlas file of §10.2, without the pixels. Write this as `.atlas.json`. */
  atlas: AtlasJson;
  /** Images that went in, aliases included. */
  imageCount: number;
  /** Region area over page area, `0` to `1`. */
  usage: number;
}

// ---------------------------------------------------------------------------
// Names
// ---------------------------------------------------------------------------

/**
 * Region name for a file path relative to the packed folder: back-slashes turn
 * into forward slashes and the extension goes away. `bracos\mao_01.png` becomes
 * `bracos/mao_01`, which is what `attachment.path` looks for (§10.5).
 */
export function regionNameFromPath(relativePath: string): string {
  return relativePath.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\.[^./]+$/, '');
}

/**
 * Splits a sequence frame name (§7.10): `mao_01` gives `{ base: 'mao_', index: 1,
 * digits: 2 }`. A name with no trailing digits gives `null`.
 */
export function sequenceFrameName(name: string): { base: string; index: number; digits: number } | null {
  const match = /^(.*?)(\d+)$/.exec(name);
  if (match === null) return null;
  return { base: match[1], index: Number(match[2]), digits: match[2].length };
}

// ---------------------------------------------------------------------------
// Resolved options
// ---------------------------------------------------------------------------

interface Resolved {
  maxWidth: number; maxHeight: number; minWidth: number; minHeight: number;
  padding: number; edgePadding: boolean; bleed: number;
  trim: boolean; alphaThreshold: number; rotation: boolean;
  pot: boolean; multipleOfFour: boolean; square: boolean;
  premultiplied: boolean; method: PackMethod; aliases: boolean;
  pageName: string; imageExtension: string; generator: string; scale: number;
  format?: string; minFilter?: string; magFilter?: string; wrapU?: string; wrapV?: string;
}

function resolve(options: PackOptions): Resolved {
  const maxWidth = Math.max(1, Math.floor(options.maxWidth ?? 2048));
  const minWidth = Math.max(1, Math.floor(options.minWidth ?? 16));
  const padding = Math.max(0, Math.floor(options.padding ?? 2));
  const method: PackMethod = options.method === 'grid' ? 'grid' : 'maxrects';
  return {
    maxWidth,
    maxHeight: Math.max(1, Math.floor(options.maxHeight ?? maxWidth)),
    minWidth,
    minHeight: Math.max(1, Math.floor(options.minHeight ?? minWidth)),
    padding,
    edgePadding: options.edgePadding ?? false,
    bleed: Math.max(0, Math.floor(options.bleed ?? Math.floor(padding / 2))),
    trim: options.trim ?? true,
    alphaThreshold: options.alphaThreshold ?? 0,
    // A grid has cells of one size, so turning a cell would gain nothing.
    rotation: method === 'grid' ? false : (options.rotation ?? true),
    pot: options.pot ?? false,
    multipleOfFour: options.multipleOfFour ?? false,
    square: options.square ?? false,
    premultiplied: options.premultiplied ?? false,
    method,
    aliases: options.aliases ?? true,
    pageName: options.pageName ?? 'pagina',
    imageExtension: options.imageExtension ?? '.png',
    generator: options.generator ?? 'Recorte empacotador',
    scale: options.scale ?? 1,
    format: options.format,
    minFilter: options.minFilter,
    magFilter: options.magFilter,
    wrapU: options.wrapU,
    wrapV: options.wrapV,
  };
}

// ---------------------------------------------------------------------------
// Resampling
// ---------------------------------------------------------------------------

/**
 * Scales RGBA8 pixels. Shrinking averages over the source rectangle each
 * destination pixel covers; growing interpolates between the four neighbours.
 * Both work on premultiplied values, so a transparent pixel cannot bleed its
 * colour into an opaque neighbour.
 */
export function resamplePixels(
  pixels: Uint8Array, width: number, height: number, newWidth: number, newHeight: number,
): Uint8Array {
  const out = new Uint8Array(newWidth * newHeight * 4);
  const sx = width / newWidth;
  const sy = height / newHeight;
  const shrinking = sx > 1 || sy > 1;
  let write = 0;
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      if (shrinking) {
        const x0 = Math.min(width - 1, Math.floor(x * sx));
        const x1 = Math.max(x0 + 1, Math.min(width, Math.ceil((x + 1) * sx)));
        const y0 = Math.min(height - 1, Math.floor(y * sy));
        const y1 = Math.max(y0 + 1, Math.min(height, Math.ceil((y + 1) * sy)));
        let count = 0;
        for (let j = y0; j < y1; j++) {
          for (let i = x0; i < x1; i++) {
            const p = (j * width + i) * 4;
            const pa = pixels[p + 3] / 255;
            r += pixels[p] * pa;
            g += pixels[p + 1] * pa;
            b += pixels[p + 2] * pa;
            a += pixels[p + 3];
            count++;
          }
        }
        r /= count; g /= count; b /= count; a /= count;
      } else {
        const fx = Math.min(width - 1, Math.max(0, (x + 0.5) * sx - 0.5));
        const fy = Math.min(height - 1, Math.max(0, (y + 0.5) * sy - 0.5));
        const x0 = Math.floor(fx);
        const y0 = Math.floor(fy);
        const x1 = Math.min(width - 1, x0 + 1);
        const y1 = Math.min(height - 1, y0 + 1);
        const tx = fx - x0;
        const ty = fy - y0;
        const corners = [
          [(y0 * width + x0) * 4, (1 - tx) * (1 - ty)],
          [(y0 * width + x1) * 4, tx * (1 - ty)],
          [(y1 * width + x0) * 4, (1 - tx) * ty],
          [(y1 * width + x1) * 4, tx * ty],
        ] as const;
        for (const [p, w] of corners) {
          const pa = pixels[p + 3] / 255;
          r += pixels[p] * pa * w;
          g += pixels[p + 1] * pa * w;
          b += pixels[p + 2] * pa * w;
          a += pixels[p + 3] * w;
        }
      }
      const alpha = Math.round(a);
      out[write + 3] = alpha < 0 ? 0 : alpha > 255 ? 255 : alpha;
      if (alpha > 0) {
        const inv = 255 / alpha;
        out[write] = Math.min(255, Math.round(r * inv));
        out[write + 1] = Math.min(255, Math.round(g * inv));
        out[write + 2] = Math.min(255, Math.round(b * inv));
      }
      write += 4;
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Trimming
// ---------------------------------------------------------------------------

export interface TrimBox {
  /** Column of the first kept pixel. */
  left: number;
  /** Row of the first kept pixel, counted from the top. */
  top: number;
  width: number;
  height: number;
}

/**
 * Smallest box that holds every pixel with alpha above `threshold`. A fully
 * transparent image gives a 1×1 box at the top-left corner, because §10.3 has
 * no way to say "nothing".
 */
export function trimBox(
  pixels: Uint8Array, width: number, height: number, threshold = 0,
): TrimBox {
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    const row = y * width;
    for (let x = 0; x < width; x++) {
      if (pixels[(row + x) * 4 + 3] <= threshold) continue;
      if (x < left) left = x;
      if (x > right) right = x;
      if (y < top) top = y;
      if (y > bottom) bottom = y;
    }
  }
  if (right < 0) return { left: 0, top: 0, width: 1, height: 1 };
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

// ---------------------------------------------------------------------------
// Page sizes
// ---------------------------------------------------------------------------

function nextPowerOfTwo(value: number): number {
  let v = 1;
  while (v < value) v *= 2;
  return v;
}

/** Rounds a side up to the smallest value the options allow. */
function roundSide(value: number, o: Resolved, min: number, max: number): number {
  let v = Math.max(value, min);
  if (o.pot) v = nextPowerOfTwo(v);
  else if (o.multipleOfFour) v = Math.ceil(v / 4) * 4;
  return Math.min(v, max);
}

/** Applies `pot`, `multipleOfFour`, `square`, min and max to a page size. */
function constrainSize(width: number, height: number, o: Resolved): { width: number; height: number } {
  let w = roundSide(width, o, o.minWidth, o.maxWidth);
  let h = roundSide(height, o, o.minHeight, o.maxHeight);
  if (o.square) {
    const side = Math.max(w, h);
    w = roundSide(side, o, o.minWidth, o.maxWidth);
    h = roundSide(side, o, o.minHeight, o.maxHeight);
  }
  return { width: w, height: h };
}

/** Page sizes to try, from the smallest allowed up to the largest, in order. */
function sizeLadder(startWidth: number, startHeight: number, o: Resolved): Array<{ width: number; height: number }> {
  const list: Array<{ width: number; height: number }> = [];
  let current = constrainSize(startWidth, startHeight, o);
  for (let guard = 0; guard < 64; guard++) {
    list.push(current);
    if (current.width >= o.maxWidth && current.height >= o.maxHeight) break;
    let w = current.width;
    let h = current.height;
    // Grow the shorter side first, so pages stay close to square.
    if (o.square || (w <= h && w < o.maxWidth) || h >= o.maxHeight) w = Math.min(w * 2, o.maxWidth);
    else h = Math.min(h * 2, o.maxHeight);
    const next = constrainSize(w, h, o);
    if (next.width === current.width && next.height === current.height) break;
    current = next;
  }
  return list;
}

// ---------------------------------------------------------------------------
// MaxRects
// ---------------------------------------------------------------------------

interface Rect { x: number; y: number; width: number; height: number }

interface Placement {
  item: Prepared;
  /** Top-left of the crop on the page, in px. */
  x: number;
  y: number;
  /** `0` or `90` (clockwise, §10.3). */
  rotation: 0 | 90;
}

/**
 * MaxRects with the "best short side fit" rule: among the free rectangles that
 * hold the piece, take the one that leaves the smallest leftover on its short
 * side. Ties break on the long side, then on the order the free list is in, so
 * the same input always gives the same page.
 */
class MaxRects {
  private free: Rect[];

  constructor(width: number, height: number, inset: number) {
    this.free = [{ x: inset, y: inset, width: width - inset, height: height - inset }];
  }

  /** Places `width × height`, turning it when `rotate` is allowed. */
  insert(width: number, height: number, rotate: boolean): { x: number; y: number; rotated: boolean } | null {
    let best: { x: number; y: number; rotated: boolean } | null = null;
    let bestShort = Infinity;
    let bestLong = Infinity;
    for (const f of this.free) {
      if (width <= f.width && height <= f.height) {
        const short = Math.min(f.width - width, f.height - height);
        const long = Math.max(f.width - width, f.height - height);
        if (short < bestShort || (short === bestShort && long < bestLong)) {
          best = { x: f.x, y: f.y, rotated: false };
          bestShort = short;
          bestLong = long;
        }
      }
      if (rotate && height <= f.width && width <= f.height) {
        const short = Math.min(f.width - height, f.height - width);
        const long = Math.max(f.width - height, f.height - width);
        if (short < bestShort || (short === bestShort && long < bestLong)) {
          best = { x: f.x, y: f.y, rotated: true };
          bestShort = short;
          bestLong = long;
        }
      }
    }
    if (best === null) return null;
    const used: Rect = {
      x: best.x,
      y: best.y,
      width: best.rotated ? height : width,
      height: best.rotated ? width : height,
    };
    this.carve(used);
    return best;
  }

  /** Splits every free rectangle the placed one overlaps, then drops the contained ones. */
  private carve(used: Rect): void {
    const next: Rect[] = [];
    for (const f of this.free) {
      if (!overlaps(f, used)) { next.push(f); continue; }
      if (used.x > f.x) next.push({ x: f.x, y: f.y, width: used.x - f.x, height: f.height });
      const rightEdge = used.x + used.width;
      if (rightEdge < f.x + f.width) next.push({ x: rightEdge, y: f.y, width: f.x + f.width - rightEdge, height: f.height });
      if (used.y > f.y) next.push({ x: f.x, y: f.y, width: f.width, height: used.y - f.y });
      const bottomEdge = used.y + used.height;
      if (bottomEdge < f.y + f.height) next.push({ x: f.x, y: bottomEdge, width: f.width, height: f.y + f.height - bottomEdge });
    }
    this.free = next.filter((r, i) => r.width > 0 && r.height > 0
      && !next.some((other, j) => j !== i && contains(other, r) && (!contains(r, other) || j < i)));
  }
}

function overlaps(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function contains(outer: Rect, inner: Rect): boolean {
  return inner.x >= outer.x && inner.y >= outer.y
    && inner.x + inner.width <= outer.x + outer.width
    && inner.y + inner.height <= outer.y + outer.height;
}

// ---------------------------------------------------------------------------
// Preparing the items
// ---------------------------------------------------------------------------

interface Prepared {
  name: string;
  aliases: string[];
  /** Crop pixels, RGBA8, top-down, `width * height * 4` bytes. */
  pixels: Uint8Array;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  originalWidth: number;
  originalHeight: number;
  pivotX: number | undefined;
  pivotY: number | undefined;
}

/** Cuts the crop out of the source image. */
function cut(pixels: Uint8Array, width: number, box: TrimBox): Uint8Array {
  const out = new Uint8Array(box.width * box.height * 4);
  for (let y = 0; y < box.height; y++) {
    const from = ((box.top + y) * width + box.left) * 4;
    out.set(pixels.subarray(from, from + box.width * 4), y * box.width * 4);
  }
  return out;
}

/** A cheap content key, so identical images become aliases of one region. */
function contentKey(item: Prepared): string {
  const p = item.pixels;
  let h1 = 0x811C9DC5;
  let h2 = 0x01000193;
  for (let i = 0; i < p.length; i++) {
    h1 = Math.imul(h1 ^ p[i], 0x01000193) >>> 0;
    h2 = (Math.imul(h2 + p[i], 0x85EBCA6B) ^ (h2 >>> 13)) >>> 0;
  }
  // The pivot is in the key: two copies of one drawing with different pivots
  // stay two regions, which is exactly what "Duplicar no atlas" makes.
  const pivot = `${item.pivotX ?? ''},${item.pivotY ?? ''}`;
  return `${item.width}x${item.height}:${item.offsetX},${item.offsetY},${item.originalWidth},${item.originalHeight}:${pivot}:${h1.toString(16)}${h2.toString(16)}`;
}

function samePixels(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function prepare(items: readonly PackerItem[], o: Resolved): Prepared[] {
  const prepared: Prepared[] = [];
  for (const item of items) {
    if (item.width <= 0 || item.height <= 0) {
      throw new Error(`a imagem "${item.name}" tem largura ou altura zero`);
    }
    if (item.pixels.length < item.width * item.height * 4) {
      throw new Error(`faltam pixels na imagem "${item.name}"`);
    }
    let pixels = item.pixels;
    let width = item.width;
    let height = item.height;
    if (o.scale !== 1) {
      const newWidth = Math.max(1, Math.round(width * o.scale));
      const newHeight = Math.max(1, Math.round(height * o.scale));
      pixels = resamplePixels(pixels, width, height, newWidth, newHeight);
      width = newWidth;
      height = newHeight;
    }
    const box = o.trim
      ? trimBox(pixels, width, height, o.alphaThreshold)
      : { left: 0, top: 0, width, height };
    prepared.push({
      name: item.name,
      aliases: [],
      pixels: box.width === width && box.height === height && box.left === 0 && box.top === 0
        ? pixels.subarray(0, width * height * 4)
        : cut(pixels, width, box),
      width: box.width,
      height: box.height,
      offsetX: box.left,
      // §10.3: `offsetY` counts the pixels cut off the BOTTOM (Y up).
      offsetY: height - box.top - box.height,
      originalWidth: width,
      originalHeight: height,
      // Px of the original image, so the trim leaves it alone; a resample
      // scales it with the image, like every other atlas px (§10.5).
      pivotX: item.pivotX === undefined ? undefined : item.pivotX * (width / item.width),
      pivotY: item.pivotY === undefined ? undefined : item.pivotY * (height / item.height),
    });
  }

  if (!o.aliases) return prepared;

  const byKey = new Map<string, Prepared[]>();
  const kept: Prepared[] = [];
  for (const item of prepared) {
    const key = contentKey(item);
    const bucket = byKey.get(key);
    if (bucket !== undefined) {
      const twin = bucket.find((other) => samePixels(other.pixels, item.pixels));
      if (twin !== undefined) { twin.aliases.push(item.name); continue; }
      bucket.push(item);
    } else byKey.set(key, [item]);
    kept.push(item);
  }
  return kept;
}

/** Biggest first, so the awkward pieces land while the page is still empty. */
function sortForPacking(items: Prepared[]): Prepared[] {
  return [...items].sort((a, b) => {
    const la = Math.max(a.width, a.height);
    const lb = Math.max(b.width, b.height);
    if (la !== lb) return lb - la;
    const areaA = a.width * a.height;
    const areaB = b.width * b.height;
    if (areaA !== areaB) return areaB - areaA;
    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
  });
}

// ---------------------------------------------------------------------------
// Placing
// ---------------------------------------------------------------------------

interface Attempt {
  placed: Placement[];
  left: Prepared[];
}

function attemptMaxRects(items: readonly Prepared[], width: number, height: number, o: Resolved): Attempt {
  const bin = new MaxRects(width, height, o.edgePadding ? o.padding : 0);
  const placed: Placement[] = [];
  const left: Prepared[] = [];
  for (const item of items) {
    const spot = bin.insert(item.width + o.padding, item.height + o.padding, o.rotation);
    if (spot === null) { left.push(item); continue; }
    placed.push({ item, x: spot.x, y: spot.y, rotation: spot.rotated ? 90 : 0 });
  }
  return { placed, left };
}

function attemptGrid(items: readonly Prepared[], width: number, height: number, o: Resolved): Attempt {
  const inset = o.edgePadding ? o.padding : 0;
  let cellWidth = 0;
  let cellHeight = 0;
  for (const item of items) {
    cellWidth = Math.max(cellWidth, item.width + o.padding);
    cellHeight = Math.max(cellHeight, item.height + o.padding);
  }
  const columns = Math.floor((width - inset) / Math.max(1, cellWidth));
  const rows = Math.floor((height - inset) / Math.max(1, cellHeight));
  const placed: Placement[] = [];
  const left: Prepared[] = [];
  let slot = 0;
  for (const item of items) {
    if (slot >= columns * rows) { left.push(item); continue; }
    placed.push({
      item,
      x: inset + (slot % columns) * cellWidth,
      y: inset + Math.floor(slot / columns) * cellHeight,
      rotation: 0,
    });
    slot++;
  }
  return { placed, left };
}

function attempt(items: readonly Prepared[], width: number, height: number, o: Resolved): Attempt {
  return o.method === 'grid' ? attemptGrid(items, width, height, o) : attemptMaxRects(items, width, height, o);
}

/** Smallest allowed page that still holds every placement. */
function shrink(placed: readonly Placement[], o: Resolved): { width: number; height: number } {
  let right = 0;
  let bottom = 0;
  for (const p of placed) {
    const onWidth = p.rotation === 90 ? p.item.height : p.item.width;
    const onHeight = p.rotation === 90 ? p.item.width : p.item.height;
    right = Math.max(right, p.x + onWidth);
    bottom = Math.max(bottom, p.y + onHeight);
  }
  const edge = o.edgePadding ? o.padding : 0;
  return constrainSize(right + edge, bottom + edge, o);
}

// ---------------------------------------------------------------------------
// Drawing a page
// ---------------------------------------------------------------------------

/**
 * Copies the crop into the page. A rotated crop turns 90° clockwise, so the
 * source pixel `(sx, sy)` lands on `(x + h - 1 - sy, y + sx)` — the check §10.4
 * spells out: the crop's top-left corner ends at the block's top-right.
 */
function blit(page: Uint8Array, pageWidth: number, p: Placement): void {
  const { item } = p;
  for (let sy = 0; sy < item.height; sy++) {
    for (let sx = 0; sx < item.width; sx++) {
      const from = (sy * item.width + sx) * 4;
      const dx = p.rotation === 90 ? p.x + item.height - 1 - sy : p.x + sx;
      const dy = p.rotation === 90 ? p.y + sx : p.y + sy;
      const to = (dy * pageWidth + dx) * 4;
      page[to] = item.pixels[from];
      page[to + 1] = item.pixels[from + 1];
      page[to + 2] = item.pixels[from + 2];
      page[to + 3] = item.pixels[from + 3];
    }
  }
}

/** Repeats the border pixels outward, so bilinear filtering never samples the gap. */
function bleedEdges(
  page: Uint8Array, pageWidth: number, pageHeight: number, p: Placement, amount: number,
): void {
  if (amount <= 0) return;
  const onWidth = p.rotation === 90 ? p.item.height : p.item.width;
  const onHeight = p.rotation === 90 ? p.item.width : p.item.height;
  for (let dy = -amount; dy < onHeight + amount; dy++) {
    for (let dx = -amount; dx < onWidth + amount; dx++) {
      if (dx >= 0 && dx < onWidth && dy >= 0 && dy < onHeight) continue;
      const x = p.x + dx;
      const y = p.y + dy;
      if (x < 0 || y < 0 || x >= pageWidth || y >= pageHeight) continue;
      const nearX = p.x + Math.min(onWidth - 1, Math.max(0, dx));
      const nearY = p.y + Math.min(onHeight - 1, Math.max(0, dy));
      const from = (nearY * pageWidth + nearX) * 4;
      const to = (y * pageWidth + x) * 4;
      page[to] = page[from];
      page[to + 1] = page[from + 1];
      page[to + 2] = page[from + 2];
      page[to + 3] = page[from + 3];
    }
  }
}

function premultiplyPage(page: Uint8Array): void {
  for (let i = 0; i < page.length; i += 4) {
    const a = page[i + 3];
    if (a === 255) continue;
    if (a === 0) { page[i] = 0; page[i + 1] = 0; page[i + 2] = 0; continue; }
    page[i] = Math.round((page[i] * a) / 255);
    page[i + 1] = Math.round((page[i + 1] * a) / 255);
    page[i + 2] = Math.round((page[i + 2] * a) / 255);
  }
}

// ---------------------------------------------------------------------------
// The packer
// ---------------------------------------------------------------------------

/**
 * Packs `items` into one or more pages and builds the atlas of §10.
 * Throws, with a message in Portuguese, when one image alone is larger than the
 * biggest page the options allow.
 */
export function packAtlas(items: readonly PackerItem[], options: PackOptions = {}): PackedAtlas {
  const o = resolve(options);
  const prepared = sortForPacking(prepare(items, o));
  const pages: PackedPage[] = [];
  const regions: AtlasRegionJson[] = [];

  let remaining = prepared;
  let pageIndex = 0;
  let usedArea = 0;
  let pageArea = 0;

  while (remaining.length > 0) {
    let longest = 0;
    for (const item of remaining) longest = Math.max(longest, item.width, item.height);
    const start = longest + o.padding + (o.edgePadding ? o.padding : 0);
    const ladder = sizeLadder(start, start, o);

    let chosen: Attempt | null = null;
    let chosenSize = ladder[ladder.length - 1];
    for (const size of ladder) {
      const tried = attempt(remaining, size.width, size.height, o);
      if (tried.left.length === 0) { chosen = tried; chosenSize = size; break; }
      chosen = tried;
      chosenSize = size;
    }
    const result = chosen as Attempt;
    if (result.placed.length === 0) {
      const biggest = remaining[0];
      throw new Error(
        `a imagem "${biggest.name}" (${biggest.width}×${biggest.height} px) não cabe numa página de ${o.maxWidth}×${o.maxHeight} px`,
      );
    }

    const size = result.left.length === 0 ? shrink(result.placed, o) : chosenSize;
    const pixels = new Uint8Array(size.width * size.height * 4);
    for (const p of result.placed) blit(pixels, size.width, p);
    for (const p of result.placed) bleedEdges(pixels, size.width, size.height, p, o.bleed);
    if (o.premultiplied) premultiplyPage(pixels);

    const name = pageIndex === 0 ? o.pageName : `${o.pageName}${pageIndex + 1}`;
    const page: PackedPage = {
      name,
      image: name + o.imageExtension,
      width: size.width,
      height: size.height,
      pixels,
    };
    if (o.format !== undefined) page.format = o.format;
    if (o.minFilter !== undefined) page.minFilter = o.minFilter;
    if (o.magFilter !== undefined) page.magFilter = o.magFilter;
    if (o.wrapU !== undefined) page.wrapU = o.wrapU;
    if (o.wrapV !== undefined) page.wrapV = o.wrapV;
    if (o.premultiplied) page.premultiplied = true;
    pages.push(page);
    pageArea += size.width * size.height;

    for (const p of result.placed) {
      const item = p.item;
      usedArea += item.width * item.height;
      // `aliases` comes right after the name, so the file reads the way §10.6
      // writes it; the spread is only there to keep that order.
      const region: AtlasRegionJson = {
        name: item.name,
        ...(item.aliases.length > 0 ? { aliases: [...item.aliases] } : {}),
        page: pageIndex,
        x: p.x,
        y: p.y,
        width: item.width,
        height: item.height,
      };
      if (p.rotation === 90) region.rotation = 90;
      if (item.offsetX !== 0) region.offsetX = item.offsetX;
      if (item.offsetY !== 0) region.offsetY = item.offsetY;
      if (item.originalWidth !== item.width) region.originalWidth = item.originalWidth;
      if (item.originalHeight !== item.height) region.originalHeight = item.originalHeight;
      if (item.pivotX !== undefined) region.pivotX = item.pivotX;
      if (item.pivotY !== undefined) region.pivotY = item.pivotY;
      regions.push(region);
    }

    remaining = result.left;
    pageIndex++;
  }

  // Regions come out in the order the images went in, not in packing order:
  // a person reading the atlas expects to find them the way they named them.
  const order = new Map<string, number>();
  items.forEach((item, index) => order.set(item.name, index));
  regions.sort((a, b) => (order.get(a.name) ?? 0) - (order.get(b.name) ?? 0));

  const atlas: AtlasJson = {
    atlas: { version: '1.0', generator: o.generator },
    scale: o.scale,
    pages: pages.map(({ pixels: _pixels, ...rest }) => ({ ...rest })),
    regions,
  };

  let imageCount = 0;
  for (const region of regions) imageCount += 1 + (region.aliases?.length ?? 0);

  return {
    scale: o.scale,
    pages,
    regions,
    atlas,
    imageCount,
    usage: pageArea === 0 ? 0 : usedArea / pageArea,
  };
}

/**
 * Packs the same images once per scale (§10.5: one atlas per resolution).
 * Returns one result per scale, in the order given.
 */
export function packAtlasScales(
  items: readonly PackerItem[], scales: readonly number[], options: PackOptions = {},
): PackedAtlas[] {
  return scales.map((scale) => {
    const suffix = scale === 1 ? '' : `@${scale}x`;
    return packAtlas(items, {
      ...options,
      scale,
      pageName: (options.pageName ?? 'pagina') + suffix,
    });
  });
}

/**
 * The UV of a point of the original image on the page (§10.4, normative).
 * The runtime has the same formula in `AtlasRegionData.computeUV`; this copy
 * lets the packer check its own work without importing the runtime.
 */
export function computeRegionUV(
  region: AtlasRegionJson, page: { width: number; height: number }, u0: number, v0: number,
): [number, number] {
  const originalWidth = region.originalWidth ?? region.width;
  const originalHeight = region.originalHeight ?? region.height;
  const offsetX = region.offsetX ?? 0;
  const offsetY = region.offsetY ?? 0;
  const px = u0 * originalWidth - offsetX;
  const py = v0 * originalHeight - (originalHeight - offsetY - region.height);
  if (region.rotation === 90) {
    return [(region.x + region.height - py) / page.width, (region.y + px) / page.height];
  }
  return [(region.x + px) / page.width, (region.y + py) / page.height];
}
