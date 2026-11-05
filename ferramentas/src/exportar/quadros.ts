// SPDX-License-Identifier: Apache-2.0
/**
 * Frame export: PNG sequence, sprite sheet and animated GIF (requisito E5).
 *
 * WHY THIS MODULE EXISTS
 * ----------------------
 * Until now the only way out as an image was one PNG of one frame, from the
 * command line. A game that cannot ship a sprite sheet cannot use the editor,
 * and a format nobody can preview as a GIF is a format nobody links to.
 *
 * WHAT IS IN HERE, AND WHAT IS NOT
 * --------------------------------
 * Everything here works on plain RGBA buffers and plain numbers. It does not
 * import Node, it does not touch a canvas and it does not know how a skeleton
 * is drawn. The DRAWING is injected as a `FrameRenderer`, so:
 *
 *   command line  `ferramentas/exportar-imagem.mjs` injects the software
 *                 rasterizer of `ferramentas/render-png.mjs` (`desenharPose`),
 *                 which is the same code that writes the single-frame PNG;
 *   editor        `editor/src/io/export-image.ts` injects the Canvas 2D
 *                 renderer the viewport already uses, and reads the pixels
 *                 back with `getImageData`.
 *
 * One module, two roads, and neither of them owns a second rasterizer.
 *
 * THE THREE OUTPUTS
 * -----------------
 * | Saída            | O que é                                              |
 * |:-----------------|:-----------------------------------------------------|
 * | Sequência PNG    | Um arquivo por quadro, numerado: `walk_0000.png`.     |
 * | Folha de sprites | Uma imagem com a grade dos quadros, mais um JSON de   |
 * |                  | índice dizendo onde cada quadro está.                 |
 * | GIF animado      | Um arquivo só, que toca sozinho em qualquer lugar.    |
 *
 * VÍDEO DE VERDADE (MP4, AVI) NÃO SAI DAQUI. Um codificador de vídeo não cabe
 * sem dependência, e este projeto não tem nenhuma. A saída de vídeo do Recorte
 * é o GIF e a sequência de PNGs; para MP4, passe a sequência para o ffmpeg —
 * o comando pronto está em {@link FFMPEG_HINT}.
 *
 * THE GIF IS WRITTEN HERE, BYTE BY BYTE
 * -------------------------------------
 * Palette (median cut down to 256 colours), LZW, the graphic control block
 * with the delay, and the Netscape loop block. All of it below, in plain
 * TypeScript, so the GIF costs no dependency either.
 */

// ---------------------------------------------------------------------------
// The picture, as everything here sees it
// ---------------------------------------------------------------------------

/** One image: straight (non-premultiplied) RGBA8, top-down, `width * height * 4` bytes. */
export interface RgbaFrame {
  readonly width: number;
  readonly height: number;
  readonly rgba: Uint8Array;
  /** Time in seconds this frame was drawn at. Absent for a lone picture. */
  readonly time?: number;
}

/** A rectangle in pixels, top-down like the buffer. */
export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Draws the pose at `time` and hands back the pixels. */
export type FrameRenderer = (time: number) => RgbaFrame | Promise<RgbaFrame>;

/** Ready-made command line for the MP4 nobody can write without a dependency. */
export const FFMPEG_HINT =
  'ffmpeg -framerate 30 -i quadro_%04d.png -c:v libx264 -pix_fmt yuv420p saida.mp4';

// ---------------------------------------------------------------------------
// Which times to draw
// ---------------------------------------------------------------------------

export interface FrameTimeOptions {
  /** Length of the animation, in seconds. */
  duration: number;
  /** Frames per second. */
  fps: number;
  /** First second to draw. Default `0`. */
  from?: number;
  /** Last second to draw. Default `duration`. */
  to?: number;
  /**
   * `true` draws the closing frame too. Default `false`, and that default is
   * the right one for a looping animation: the frame at `duration` is the very
   * same drawing as the frame at `0`, so keeping it makes the loop stutter.
   */
  includeEnd?: boolean;
}

/**
 * The instants to draw, in seconds, ascending.
 *
 * The count is rounded, never truncated: 1 second at 30 frames per second is
 * 30 frames, not 29 plus a rounding error.
 */
export function frameTimes(options: FrameTimeOptions): number[] {
  const fps = options.fps > 0 ? options.fps : 30;
  const duration = Math.max(0, options.duration);
  const from = Math.max(0, options.from ?? 0);
  const to = Math.max(from, options.to ?? duration);
  const span = to - from;
  const count = Math.max(1, Math.round(span * fps) + (options.includeEnd === true ? 1 : 0));
  const times: number[] = [];
  for (let i = 0; i < count; i++) times.push(round6(from + i / fps));
  return times;
}

/** Six decimal places: enough for a frame at 1000 fps, short enough to read. */
function round6(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

// ---------------------------------------------------------------------------
// The camera: world units in, pixels out
// ---------------------------------------------------------------------------

export interface CameraOptions {
  /** Width of the picture in pixels. Wins over `scale` when both are given. */
  width?: number;
  /** Pixels per world unit. Default `1`. */
  scale?: number;
  /** Slack around the drawing, as a fraction of its longest side. Default `0.12`. */
  margin?: number;
}

/** Where the world sits inside the picture. */
export interface FrameCamera {
  width: number;
  height: number;
  /** Pixels per world unit. */
  scale: number;
  /** World coordinate of the left edge. */
  originX: number;
  /** World coordinate of the BOTTOM edge (the world has Y up, the picture Y down). */
  originY: number;
}

/**
 * The camera for a bounding box in world units.
 *
 * It is computed ONCE for the whole export, from the union of every frame's
 * bounds, and every frame is then drawn with it. Recomputing it per frame is
 * what makes an exported sequence jitter: the character would stay still and
 * the picture would breathe around it.
 */
export function cameraFor(bounds: Box, options: CameraOptions = {}): FrameCamera {
  const margin = options.margin ?? 0.12;
  const slack = Math.max(bounds.width, bounds.height) * Math.max(0, margin);
  const worldWidth = Math.max(1e-6, bounds.width + slack * 2);
  const worldHeight = Math.max(1e-6, bounds.height + slack * 2);
  const scale = options.width !== undefined && options.width > 0
    ? options.width / worldWidth
    : Math.max(1e-9, options.scale ?? 1);
  const width = Math.max(1, Math.round(worldWidth * scale));
  const height = Math.max(1, Math.round(worldHeight * scale));
  return { width, height, scale, originX: bounds.x - slack, originY: bounds.y - slack };
}

/** The smallest box holding both. Either one may be `null`. */
export function unionBox(a: Box | null, b: Box | null): Box | null {
  if (a === null) return b === null ? null : { ...b };
  if (b === null) return { ...a };
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const right = Math.max(a.x + a.width, b.x + b.width);
  const bottom = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: right - x, height: bottom - y };
}

// ---------------------------------------------------------------------------
// Automatic crop: throw away the empty border
// ---------------------------------------------------------------------------

/**
 * The smallest box holding every pixel whose alpha reaches `threshold`, or
 * `null` when the frame is empty.
 *
 * `threshold` is 1 by default: a single unit of alpha counts as drawing. Raise
 * it to cut a soft, almost invisible halo away too.
 */
export function contentBox(frame: RgbaFrame, threshold = 1): Box | null {
  let minX = frame.width;
  let minY = frame.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < frame.height; y++) {
    const row = y * frame.width * 4;
    for (let x = 0; x < frame.width; x++) {
      if (frame.rgba[row + x * 4 + 3]! < threshold) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1 };
}

/** Copies a rectangle out of a frame. Parts outside the frame come out clear. */
export function cropFrame(frame: RgbaFrame, box: Box): RgbaFrame {
  const width = Math.max(1, Math.round(box.width));
  const height = Math.max(1, Math.round(box.height));
  const out = new Uint8Array(width * height * 4);
  const left = Math.round(box.x);
  const top = Math.round(box.y);
  for (let y = 0; y < height; y++) {
    const sy = top + y;
    if (sy < 0 || sy >= frame.height) continue;
    for (let x = 0; x < width; x++) {
      const sx = left + x;
      if (sx < 0 || sx >= frame.width) continue;
      const from = (sy * frame.width + sx) * 4;
      const to = (y * width + x) * 4;
      out[to] = frame.rgba[from]!;
      out[to + 1] = frame.rgba[from + 1]!;
      out[to + 2] = frame.rgba[from + 2]!;
      out[to + 3] = frame.rgba[from + 3]!;
    }
  }
  return { width, height, rgba: out, ...(frame.time === undefined ? {} : { time: frame.time }) };
}

/**
 * Crops every frame to ONE box: the union of what they all draw.
 *
 * One box and not one per frame, on purpose. Cropping each frame to its own
 * content gives frames of different sizes that no longer line up, and a sprite
 * sheet made of them cannot be indexed by a grid. The union keeps every frame
 * the same size and still throws the empty border away.
 */
export function autoCropFrames(
  frames: readonly RgbaFrame[], threshold = 1,
): { frames: RgbaFrame[]; box: Box | null } {
  let box: Box | null = null;
  for (const frame of frames) box = unionBox(box, contentBox(frame, threshold));
  if (box === null) return { frames: frames.map((frame) => frame), box: null };
  const cut = box;
  return { frames: frames.map((frame) => cropFrame(frame, cut)), box: cut };
}

// ---------------------------------------------------------------------------
// The sprite sheet
// ---------------------------------------------------------------------------

export interface SheetOptions {
  /** Frames per row. Default: as square a grid as the count allows. */
  columns?: number;
  /** Transparent pixels between two frames. Default `0`. */
  padding?: number;
  /** Opaque background, `[r, g, b]` in 0..255. Default: transparent. */
  background?: readonly [number, number, number] | null;
  /** Written into the index, so a loader knows which file to open. */
  imageName?: string;
  /** Written into the index. */
  animation?: string | null;
  /** Written into the index. */
  fps?: number;
}

/** Where one frame sits on the sheet. */
export interface SheetFrameIndex {
  index: number;
  /** Second of the animation this frame was drawn at. */
  time: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The JSON that travels with the sheet. Read it, and the grid needs no guessing. */
export interface SheetIndex {
  /** Name of the image file this index belongs to. */
  image: string;
  animation: string | null;
  fps: number;
  count: number;
  columns: number;
  rows: number;
  frameWidth: number;
  frameHeight: number;
  padding: number;
  frames: SheetFrameIndex[];
}

/** Columns and rows for `count` frames, as square as it gets. */
export function sheetGridFor(count: number, columns?: number): { columns: number; rows: number } {
  const total = Math.max(1, Math.round(count));
  const cols = columns !== undefined && columns > 0
    ? Math.min(Math.round(columns), total)
    : Math.ceil(Math.sqrt(total));
  return { columns: cols, rows: Math.ceil(total / cols) };
}

/**
 * Lays every frame on one image, left to right and top to bottom, and writes
 * down where each one landed.
 *
 * Every frame must already be the same size — {@link autoCropFrames} is what
 * guarantees that after a crop. A frame of a different size is refused instead
 * of being stretched: a sheet whose cells do not match the index is worse than
 * an error message.
 */
export function buildSpriteSheet(
  frames: readonly RgbaFrame[], options: SheetOptions = {},
): { sheet: RgbaFrame; index: SheetIndex } {
  if (frames.length === 0) throw new Error('não há quadro nenhum para a folha de sprites');
  const first = frames[0]!;
  for (const frame of frames) {
    if (frame.width !== first.width || frame.height !== first.height) {
      throw new Error('todos os quadros da folha têm que ter o mesmo tamanho');
    }
  }

  const padding = Math.max(0, Math.round(options.padding ?? 0));
  const grid = sheetGridFor(frames.length, options.columns);
  const cellWidth = first.width + padding;
  const cellHeight = first.height + padding;
  const width = grid.columns * cellWidth + padding;
  const height = grid.rows * cellHeight + padding;
  const rgba = new Uint8Array(width * height * 4);

  const back = options.background ?? null;
  if (back !== null) {
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = back[0];
      rgba[i + 1] = back[1];
      rgba[i + 2] = back[2];
      rgba[i + 3] = 255;
    }
  }

  const list: SheetFrameIndex[] = [];
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]!;
    const column = i % grid.columns;
    const row = Math.floor(i / grid.columns);
    const left = padding + column * cellWidth;
    const top = padding + row * cellHeight;
    blit(rgba, width, frame, left, top);
    list.push({
      index: i,
      time: frame.time ?? 0,
      x: left,
      y: top,
      width: frame.width,
      height: frame.height,
    });
  }

  return {
    sheet: { width, height, rgba },
    index: {
      image: options.imageName ?? 'folha.png',
      animation: options.animation ?? null,
      fps: options.fps ?? 30,
      count: frames.length,
      columns: grid.columns,
      rows: grid.rows,
      frameWidth: first.width,
      frameHeight: first.height,
      padding,
      frames: list,
    },
  };
}

/** Copies a frame onto the sheet. Straight copy: the sheet cell starts empty. */
function blit(
  target: Uint8Array, targetWidth: number, frame: RgbaFrame, left: number, top: number,
): void {
  for (let y = 0; y < frame.height; y++) {
    const from = y * frame.width * 4;
    const to = ((top + y) * targetWidth + left) * 4;
    target.set(frame.rgba.subarray(from, from + frame.width * 4), to);
  }
}

// ---------------------------------------------------------------------------
// The palette: median cut down to 256 colours
// ---------------------------------------------------------------------------

/** A colour table: `count` entries of three bytes, plus how to reach them. */
export interface Palette {
  /** `count * 3` bytes, red, green and blue. */
  readonly colors: Uint8Array;
  readonly count: number;
  /** Index of the see-through entry, or `-1` when the GIF is fully opaque. */
  readonly transparentIndex: number;
}

/** One colour of the histogram, with how many pixels wear it. */
interface ColorCount {
  r: number;
  g: number;
  b: number;
  n: number;
}

/**
 * Counts the opaque colours of every frame.
 *
 * Exact colours, not a coarse 5-bit bucket. A drawing with four flat colours
 * has to come out with those four colours and no dithered approximation of
 * them, and that is only true if the histogram never rounded them away.
 */
/** Um passo do GIF aos pedaços: a fase e o quadro que acabou — QA de 04/11/2026 (D20). */
export interface GifStep {
  readonly fase: 'paleta' | 'quadro';
  readonly feito: number;
  readonly total: number;
}

/** Roda um gerador até o fim, sem pausa nenhuma: o caminho de sempre. */
function drain<T>(steps: Generator<GifStep, T>): T {
  let r = steps.next();
  while (!r.done) r = steps.next();
  return r.value;
}

function* histogramSteps(
  frames: readonly RgbaFrame[], alphaThreshold: number,
): Generator<GifStep, { colors: ColorCount[]; anyTransparent: boolean }> {
  const seen = new Map<number, ColorCount>();
  let anyTransparent = false;
  let feito = 0;
  for (const frame of frames) {
    const px = frame.rgba;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3]! < alphaThreshold) {
        anyTransparent = true;
        continue;
      }
      const r = px[i]!;
      const g = px[i + 1]!;
      const b = px[i + 2]!;
      const key = (r << 16) | (g << 8) | b;
      const found = seen.get(key);
      if (found === undefined) seen.set(key, { r, g, b, n: 1 });
      else found.n++;
    }
    yield { fase: 'paleta', feito: ++feito, total: frames.length };
  }
  return { colors: [...seen.values()], anyTransparent };
}

/** The channel with the widest spread inside a bucket: the one to cut on. */
function widestChannel(bucket: readonly ColorCount[]): 'r' | 'g' | 'b' {
  let minR = 255; let maxR = 0;
  let minG = 255; let maxG = 0;
  let minB = 255; let maxB = 0;
  for (const c of bucket) {
    if (c.r < minR) minR = c.r;
    if (c.r > maxR) maxR = c.r;
    if (c.g < minG) minG = c.g;
    if (c.g > maxG) maxG = c.g;
    if (c.b < minB) minB = c.b;
    if (c.b > maxB) maxB = c.b;
  }
  const spreadR = maxR - minR;
  const spreadG = maxG - minG;
  const spreadB = maxB - minB;
  if (spreadG >= spreadR && spreadG >= spreadB) return 'g';
  return spreadR >= spreadB ? 'r' : 'b';
}

/** The average colour of a bucket, weighted by how many pixels each one has. */
function averageOf(bucket: readonly ColorCount[]): [number, number, number] {
  let r = 0; let g = 0; let b = 0; let n = 0;
  for (const c of bucket) {
    r += c.r * c.n;
    g += c.g * c.n;
    b += c.b * c.n;
    n += c.n;
  }
  if (n === 0) return [0, 0, 0];
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

/**
 * Median cut (Heckbert, 1982), the algorithm every GIF writer uses.
 *
 * Start with every colour in one box. Split the box with the most colours in
 * it, along its widest channel, at the median. Repeat until there are as many
 * boxes as the palette has room for. Each box then becomes one palette entry,
 * the weighted average of what fell in it.
 *
 * WHEN THE PICTURE ALREADY FITS, NOTHING IS APPROXIMATED: a drawing with 200
 * distinct colours comes out with those 200 colours, byte for byte.
 */
export function buildPalette(
  frames: readonly RgbaFrame[], maxColors = 256, alphaThreshold = 128,
): Palette {
  return drain(paletteSteps(frames, maxColors, alphaThreshold));
}

function* paletteSteps(
  frames: readonly RgbaFrame[], maxColors: number, alphaThreshold: number,
): Generator<GifStep, Palette> {
  const limit = Math.max(2, Math.min(256, Math.round(maxColors)));
  const { colors, anyTransparent } = yield* histogramSteps(frames, alphaThreshold);
  const room = Math.max(1, anyTransparent ? limit - 1 : limit);

  let chosen: Array<[number, number, number]>;
  if (colors.length <= room) {
    chosen = colors.map((c) => [c.r, c.g, c.b] as [number, number, number]);
  } else {
    let buckets: ColorCount[][] = [colors];
    while (buckets.length < room) {
      let widest = -1;
      let at = -1;
      for (let i = 0; i < buckets.length; i++) {
        const bucket = buckets[i]!;
        if (bucket.length < 2) continue;
        if (bucket.length > widest) {
          widest = bucket.length;
          at = i;
        }
      }
      if (at < 0) break;
      const bucket = buckets[at]!;
      const channel = widestChannel(bucket);
      bucket.sort((a, b) => a[channel] - b[channel]);
      const half = bucket.length >> 1;
      buckets = [
        ...buckets.slice(0, at),
        bucket.slice(0, half),
        bucket.slice(half),
        ...buckets.slice(at + 1),
      ];
    }
    chosen = buckets.map(averageOf);
  }

  if (chosen.length === 0) chosen = [[0, 0, 0]];
  const transparentIndex = anyTransparent ? chosen.length : -1;
  if (anyTransparent) chosen.push([0, 0, 0]);

  const table = new Uint8Array(chosen.length * 3);
  for (let i = 0; i < chosen.length; i++) {
    table[i * 3] = chosen[i]![0];
    table[i * 3 + 1] = chosen[i]![1];
    table[i * 3 + 2] = chosen[i]![2];
  }
  return { colors: table, count: chosen.length, transparentIndex };
}

/**
 * Every pixel of a frame as an index into the palette.
 *
 * Nearest colour by squared distance in RGB, with a cache: a drawing repeats
 * the same colour thousands of times, and looking it up once is the difference
 * between a GIF that exports now and one that exports after lunch.
 */
export function indexFrame(
  frame: RgbaFrame, palette: Palette, alphaThreshold = 128,
  cache: Map<number, number> = new Map(),
): Uint8Array {
  const out = new Uint8Array(frame.width * frame.height);
  const px = frame.rgba;
  const opaqueCount = palette.transparentIndex < 0 ? palette.count : palette.count - 1;
  for (let p = 0, i = 0; i < px.length; i += 4, p++) {
    if (px[i + 3]! < alphaThreshold && palette.transparentIndex >= 0) {
      out[p] = palette.transparentIndex;
      continue;
    }
    const r = px[i]!;
    const g = px[i + 1]!;
    const b = px[i + 2]!;
    const key = (r << 16) | (g << 8) | b;
    const known = cache.get(key);
    if (known !== undefined) {
      out[p] = known;
      continue;
    }
    let best = 0;
    let bestDistance = Infinity;
    for (let c = 0; c < opaqueCount; c++) {
      const dr = r - palette.colors[c * 3]!;
      const dg = g - palette.colors[c * 3 + 1]!;
      const db = b - palette.colors[c * 3 + 2]!;
      const distance = dr * dr + dg * dg + db * db;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = c;
        if (distance === 0) break;
      }
    }
    cache.set(key, best);
    out[p] = best;
  }
  return out;
}

// ---------------------------------------------------------------------------
// LZW, the GIF flavour (spec 87a, appendix F)
// ---------------------------------------------------------------------------

/** Bits written least-significant first, which is what GIF asks for. */
class BitWriter {
  private readonly bytes: number[] = [];
  private accumulator = 0;
  private bits = 0;

  write(code: number, size: number): void {
    this.accumulator |= (code << this.bits);
    this.bits += size;
    while (this.bits >= 8) {
      this.bytes.push(this.accumulator & 0xFF);
      this.accumulator >>>= 8;
      this.bits -= 8;
    }
  }

  finish(): Uint8Array {
    if (this.bits > 0) {
      this.bytes.push(this.accumulator & 0xFF);
      this.accumulator = 0;
      this.bits = 0;
    }
    return Uint8Array.from(this.bytes);
  }
}

/**
 * LZW-compresses one frame of indices, GIF style.
 *
 * The dictionary starts with one code per colour, plus CLEAR and END. Codes
 * grow from `minCodeSize + 1` bits up to 12; at 4096 entries a CLEAR is
 * emitted and the dictionary starts over â€” that reset is what keeps a long
 * animation from running out of codes.
 *
 * Returns the raw code stream, WITHOUT the sub-block framing.
 */
export function lzwEncode(indices: Uint8Array, minCodeSize: number): Uint8Array {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  const writer = new BitWriter();

  let dictionary = new Map<string, number>();
  let next = endCode + 1;
  let codeSize = minCodeSize + 1;

  const reset = (): void => {
    dictionary = new Map<string, number>();
    next = endCode + 1;
    codeSize = minCodeSize + 1;
  };

  writer.write(clearCode, codeSize);

  if (indices.length === 0) {
    writer.write(endCode, codeSize);
    return writer.finish();
  }

  let current = String(indices[0]!);
  for (let i = 1; i < indices.length; i++) {
    const symbol = indices[i]!;
    const candidate = `${current},${symbol}`;
    if (dictionary.has(candidate)) {
      current = candidate;
      continue;
    }
    writer.write(codeOf(current, dictionary), codeSize);
    if (next < 4096) {
      dictionary.set(candidate, next);
      next++;
      if (next > (1 << codeSize) && codeSize < 12) codeSize++;
    } else {
      writer.write(clearCode, codeSize);
      reset();
    }
    current = String(symbol);
  }
  writer.write(codeOf(current, dictionary), codeSize);
  writer.write(endCode, codeSize);
  return writer.finish();
}

/** A one-symbol string is its own colour index; longer ones are in the table. */
function codeOf(sequence: string, dictionary: Map<string, number>): number {
  const known = dictionary.get(sequence);
  if (known !== undefined) return known;
  return Number(sequence);
}

/** Wraps a byte stream in the sub-blocks of at most 255 bytes GIF asks for. */
function subBlocks(data: Uint8Array, out: number[]): void {
  for (let at = 0; at < data.length; at += 255) {
    const piece = data.subarray(at, Math.min(at + 255, data.length));
    out.push(piece.length);
    for (const byte of piece) out.push(byte);
  }
  out.push(0);
}

// ---------------------------------------------------------------------------
// The GIF file itself
// ---------------------------------------------------------------------------

export interface GifOptions {
  /** Frames per second, when every frame lasts the same. Default `30`. */
  fps?: number;
  /** Hundredths of a second per frame. Wins over `fps`. */
  delayCentis?: number;
  /** One delay per frame, in hundredths of a second. Wins over both. */
  delaysCentis?: readonly number[];
  /** How many times it plays. `0` (the default) means forever. */
  loop?: number;
  /** At most 256, which is all a GIF has room for. Default `256`. */
  maxColors?: number;
  /** Alpha below this becomes see-through. Default `128`. */
  alphaThreshold?: number;
  /**
   * `true` writes `GIF87a` instead of `GIF89a`. Only useful to prove the
   * writer knows the difference: 87a has no delay and no transparency, so a
   * single opaque frame is all it can honestly carry.
   */
  gif87a?: boolean;
}

/** The signature of the newer GIF, the one with animation in it. */
export const GIF89A = 'GIF89a';
/** The signature of the 1987 GIF: one frame, no delay, no transparency. */
export const GIF87A = 'GIF87a';

/**
 * Writes an animated GIF. No dependency: the palette, the LZW and every block
 * below are this file.
 *
 * THE BLOCKS, IN THE ORDER THEY COME OUT
 * | Bloco                          | O que carrega                          |
 * |:-------------------------------|:---------------------------------------|
 * | Cabeçalho `GIF89a`             | 6 bytes.                               |
 * | Tela lógica                    | Largura, altura, e que há paleta geral. |
 * | Paleta geral                   | 2, 4, 8 â€¦ 256 cores, 3 bytes cada.      |
 * | Bloco NETSCAPE                 | Quantas vezes o laço repete.            |
 * | Por quadro: controle gráfico   | Atraso em centésimos, cor transparente. |
 * | Por quadro: descritor e LZW    | Posição, tamanho e os pixels.           |
 * | `0x3B`                         | Fim.                                    |
 *
 * Every frame must be the same size, because a GIF has one logical screen.
 */
export function encodeGif(frames: readonly RgbaFrame[], options: GifOptions = {}): Uint8Array {
  return drain(gifSteps(frames, options));
}

/**
 * **O GIF aos pedaços** — QA de 04/11/2026 (D20). Os MESMOS bytes do
 * `encodeGif`, com uma pausa depois de cada quadro da paleta e de cada quadro
 * escrito. No editor a pausa devolve a vez à tela: o GIF do Spriter (30
 * quadros de 2837x1197) prendia a página 64 s sem responder, com o Andamento
 * parado. A linha de comando continua no `encodeGif`, sem pausa.
 */
export async function encodeGifPaced(
  frames: readonly RgbaFrame[], options: GifOptions = {},
  onStep: (feito: number, total: number, fase: GifStep['fase']) => void = () => {},
  pause: () => Promise<void> = () => new Promise((done) => { setTimeout(done, 0); }),
): Promise<Uint8Array> {
  const steps = gifSteps(frames, options);
  let r = steps.next();
  while (!r.done) {
    onStep(r.value.feito, r.value.total, r.value.fase);
    await pause();
    r = steps.next();
  }
  return r.value;
}

function* gifSteps(frames: readonly RgbaFrame[], options: GifOptions): Generator<GifStep, Uint8Array> {
  if (frames.length === 0) throw new Error('não há quadro nenhum para o GIF');
  const first = frames[0]!;
  for (const frame of frames) {
    if (frame.width !== first.width || frame.height !== first.height) {
      throw new Error('todos os quadros do GIF têm que ter o mesmo tamanho');
    }
  }

  const alphaThreshold = options.alphaThreshold ?? 128;
  const palette = yield* paletteSteps(frames, options.maxColors ?? 256, alphaThreshold);
  const bits = paletteBits(palette.count);
  const tableSize = 1 << bits;
  const old = options.gif87a === true;

  const out: number[] = [];
  for (const ch of old ? GIF87A : GIF89A) out.push(ch.charCodeAt(0));

  // Logical screen descriptor: size, then the packed byte with the global
  // colour table flag (0x80), the colour resolution and the table size.
  pushU16(out, first.width);
  pushU16(out, first.height);
  out.push(0x80 | ((bits - 1) << 4) | (bits - 1));
  out.push(0); // background colour index
  out.push(0); // pixel aspect ratio: none given

  for (let i = 0; i < tableSize; i++) {
    out.push(palette.colors[i * 3] ?? 0, palette.colors[i * 3 + 1] ?? 0, palette.colors[i * 3 + 2] ?? 0);
  }

  // NETSCAPE 2.0: the only place a GIF can say how many times it loops.
  if (!old) {
    out.push(0x21, 0xFF, 0x0B);
    for (const ch of 'NETSCAPE2.0') out.push(ch.charCodeAt(0));
    out.push(0x03, 0x01);
    pushU16(out, Math.max(0, Math.round(options.loop ?? 0)));
    out.push(0x00);
  }

  const delays = delaysFor(frames.length, options);
  const cache = new Map<number, number>();
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i]!;
    if (!old) {
      // Graphic control extension: disposal 2 ("restore to background") so a
      // see-through frame does not smear the frame under it.
      const transparent = palette.transparentIndex >= 0;
      out.push(0x21, 0xF9, 0x04);
      out.push((2 << 2) | (transparent ? 1 : 0));
      pushU16(out, delays[i]!);
      out.push(transparent ? palette.transparentIndex : 0);
      out.push(0x00);
    }
    out.push(0x2C);
    pushU16(out, 0);
    pushU16(out, 0);
    pushU16(out, frame.width);
    pushU16(out, frame.height);
    out.push(0x00); // no local table, not interlaced

    // A GIF never uses fewer than 2 bits per code, even for a 2-colour image.
    const minCodeSize = Math.max(2, bits);
    out.push(minCodeSize);
    subBlocks(lzwEncode(indexFrame(frame, palette, alphaThreshold, cache), minCodeSize), out);
    if (old) break; // 87a carries one frame and no more.
    yield { fase: 'quadro', feito: i + 1, total: frames.length };
  }

  out.push(0x3B);
  return Uint8Array.from(out);
}

/** Palette sizes are powers of two, from 2 to 256; this is the exponent. */
export function paletteBits(count: number): number {
  let bits = 1;
  while ((1 << bits) < count && bits < 8) bits++;
  return bits;
}

/** The delay of each frame in hundredths of a second, never below 2. */
function delaysFor(count: number, options: GifOptions): number[] {
  const fps = options.fps !== undefined && options.fps > 0 ? options.fps : 30;
  const uniform = options.delayCentis ?? Math.max(2, Math.round(100 / fps));
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const given = options.delaysCentis?.[i];
    out.push(Math.max(0, Math.round(given ?? uniform)));
  }
  return out;
}

function pushU16(out: number[], value: number): void {
  const v = Math.max(0, Math.min(0xFFFF, Math.round(value)));
  out.push(v & 0xFF, (v >> 8) & 0xFF);
}

// ---------------------------------------------------------------------------
// The whole job, from times to pictures
// ---------------------------------------------------------------------------

export interface RenderSequenceOptions extends FrameTimeOptions {
  /** `true` cuts the empty border away, the same box for every frame. */
  autoCrop?: boolean;
  /** Alpha that already counts as drawing, for the crop. Default `1`. */
  cropThreshold?: number;
}

/**
 * Draws every frame of an interval and hands the pictures back.
 *
 * The renderer is injected, so this function is the same on the command line
 * and in the editor, and neither of them grew a second rasterizer.
 */
export async function renderSequence(
  render: FrameRenderer, options: RenderSequenceOptions,
): Promise<{ frames: RgbaFrame[]; times: number[]; box: Box | null }> {
  const times = frameTimes(options);
  const drawn: RgbaFrame[] = [];
  for (const time of times) {
    const frame = await render(time);
    drawn.push({ ...frame, time });
  }
  if (options.autoCrop !== true) return { frames: drawn, times, box: null };
  const cropped = autoCropFrames(drawn, options.cropThreshold ?? 1);
  return { frames: cropped.frames, times, box: cropped.box };
}

/** `walk_0007.png` â€” the name of one frame of a sequence. */
export function frameFileName(base: string, index: number, digits = 4): string {
  return `${base}_${String(index).padStart(digits, '0')}.png`;
}

