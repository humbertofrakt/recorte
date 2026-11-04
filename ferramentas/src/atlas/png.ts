// SPDX-License-Identifier: Apache-2.0
/**
 * PNG reader and writer in plain TypeScript.
 *
 * No Node and no browser API is touched: the deflate/inflate pair is injected
 * through `PngZlib`, so the very same module serves the command line (where
 * `node:zlib` provides it) and the editor (where a stream-based adapter does).
 *
 * Reading supports the non-interlaced subset every packer meets in practice:
 * colour types 0 (grey), 2 (RGB), 3 (palette), 4 (grey + alpha) and 6 (RGBA),
 * bit depths 1, 2, 4, 8 and 16, plus `tRNS` for all three of its shapes and the
 * five row filters of RFC 2083 §6. Pixels always come back as straight-alpha
 * RGBA8, top-down, which is the one shape the packer works in.
 *
 * Writing produces RGBA8, RGB8, grey8 or a palette, with a fixed or an adaptive
 * row filter.
 *
 * The decoding logic follows `ferramentas/render-png.mjs`, widened to the bit
 * depths and colour types that file did not need.
 */

// ---------------------------------------------------------------------------
// Public shapes
// ---------------------------------------------------------------------------

/** The compressor, injected so this module depends on no platform. */
export interface PngZlib {
  /** zlib stream in, raw bytes out. */
  inflate(data: Uint8Array): Uint8Array;
  /** Raw bytes in, zlib stream out. `level` is 0 to 9. */
  deflate(data: Uint8Array, level?: number): Uint8Array;
}

/** An image in the one shape the packer uses: RGBA8, straight alpha, top-down. */
export interface PngImage {
  width: number;
  height: number;
  /** `width * height * 4` bytes. */
  pixels: Uint8Array;
}

/** Extra facts about the file that was read, for tools that want to report them. */
export interface PngInfo {
  bitDepth: number;
  colorType: number;
  /** `true` when the file carried a `PLTE` chunk. */
  paletted: boolean;
  /** `true` when the file carried a `tRNS` chunk. */
  transparency: boolean;
}

export interface DecodedPng extends PngImage {
  info: PngInfo;
}

/** How to store the pixels when writing. `auto` picks the smallest that is exact. */
export type PngColorChoice = 'rgba8' | 'rgb8' | 'gray8' | 'palette' | 'auto';

/** Row filter: a fixed one (0 to 4), or `adaptive` to choose per row. */
export type PngFilterChoice = 0 | 1 | 2 | 3 | 4 | 'adaptive';

export interface PngEncodeOptions {
  /** Default `'rgba8'`. */
  colorType?: PngColorChoice;
  /** Default `0` (no filter), which is the fastest and compresses flat art well. */
  filter?: PngFilterChoice;
  /** Deflate level, 0 to 9. Default `9`. */
  level?: number;
}

// ---------------------------------------------------------------------------
// Bytes
// ---------------------------------------------------------------------------

const SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];

/** Channels per pixel of each PNG colour type. Type 3 stores one palette index. */
const CHANNELS: Record<number, number> = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 };

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) !== 0 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < bytes.length; i++) c = CRC_TABLE[(c ^ bytes[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function readU32(bytes: Uint8Array, at: number): number {
  return ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0;
}

function writeU32(bytes: Uint8Array, at: number, value: number): void {
  bytes[at] = (value >>> 24) & 255;
  bytes[at + 1] = (value >>> 16) & 255;
  bytes[at + 2] = (value >>> 8) & 255;
  bytes[at + 3] = value & 255;
}

function latin1(bytes: Uint8Array, from: number, to: number): string {
  let out = '';
  for (let i = from; i < to; i++) out += String.fromCharCode(bytes[i]);
  return out;
}

function concat(parts: readonly Uint8Array[]): Uint8Array {
  let total = 0;
  for (const p of parts) total += p.length;
  const out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

/** One PNG chunk: length, type, body, CRC of type + body. */
function chunk(type: string, body: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + body.length);
  writeU32(out, 0, body.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(body, 8);
  writeU32(out, 8 + body.length, crc32(out.subarray(4, 8 + body.length)));
  return out;
}

// ---------------------------------------------------------------------------
// Reading
// ---------------------------------------------------------------------------

/** `true` when the bytes start with the PNG signature. */
export function isPng(bytes: Uint8Array): boolean {
  if (bytes.length < 8) return false;
  for (let i = 0; i < 8; i++) if (bytes[i] !== SIGNATURE[i]) return false;
  return true;
}

function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

/** Undoes the five per-row filters of RFC 2083 §6. */
function unfilter(raw: Uint8Array, bytesPerRow: number, height: number, bpp: number): Uint8Array {
  const out = new Uint8Array(bytesPerRow * height);
  let read = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[read++];
    const rowAt = y * bytesPerRow;
    const prevAt = rowAt - bytesPerRow;
    for (let x = 0; x < bytesPerRow; x++) {
      const a = x >= bpp ? out[rowAt + x - bpp] : 0;
      const b = y === 0 ? 0 : out[prevAt + x];
      const c = y === 0 || x < bpp ? 0 : out[prevAt + x - bpp];
      const v = raw[read + x];
      let value: number;
      switch (filter) {
        case 0: value = v; break;
        case 1: value = v + a; break;
        case 2: value = v + b; break;
        case 3: value = v + ((a + b) >> 1); break;
        case 4: value = v + paeth(a, b, c); break;
        default: throw new Error(`filtro de linha desconhecido no PNG: ${filter}`);
      }
      out[rowAt + x] = value & 255;
    }
    read += bytesPerRow;
  }
  return out;
}

/**
 * Reads one sample of `bitDepth` bits. Sub-byte samples are packed MSB first,
 * 16-bit samples big-endian; the 16-bit case keeps the high byte, which is what
 * an 8-bit-per-channel pipeline can use.
 */
function sampleReader(raw: Uint8Array, bitDepth: number): (rowAt: number, index: number) => number {
  if (bitDepth === 8) return (rowAt, index) => raw[rowAt + index];
  if (bitDepth === 16) return (rowAt, index) => raw[rowAt + index * 2];
  const perByte = 8 / bitDepth;
  const mask = (1 << bitDepth) - 1;
  return (rowAt, index) => {
    const byte = raw[rowAt + Math.floor(index / perByte)];
    const shift = 8 - bitDepth * ((index % perByte) + 1);
    return (byte >>> shift) & mask;
  };
}

/**
 * Reads a non-interlaced PNG and returns straight-alpha RGBA8, top-down.
 * Throws with a message in Portuguese when the file is outside the subset.
 */
export function decodePng(bytes: Uint8Array, zlib: PngZlib): DecodedPng {
  if (!isPng(bytes)) throw new Error('não é um arquivo PNG');
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  let sawHeader = false;
  let palette: Uint8Array | null = null;
  let transparency: Uint8Array | null = null;
  const data: Uint8Array[] = [];

  for (let at = 8; at + 8 <= bytes.length;) {
    const size = readU32(bytes, at);
    const type = latin1(bytes, at + 4, at + 8);
    const body = bytes.subarray(at + 8, at + 8 + size);
    at += 12 + size;
    if (type === 'IHDR') {
      width = readU32(body, 0);
      height = readU32(body, 4);
      bitDepth = body[8];
      colorType = body[9];
      interlace = body[12];
      sawHeader = true;
    } else if (type === 'PLTE') palette = body.slice();
    else if (type === 'tRNS') transparency = body.slice();
    else if (type === 'IDAT') data.push(body.slice());
    else if (type === 'IEND') break;
  }

  if (!sawHeader) throw new Error('PNG sem cabeçalho IHDR');
  if (width <= 0 || height <= 0) throw new Error('PNG com largura ou altura zero');
  if (interlace !== 0) throw new Error('PNG entrelaçado não é suportado');
  const channels = CHANNELS[colorType];
  if (channels === undefined) throw new Error(`tipo de cor ${colorType} não é suportado`);
  if (colorType === 3) {
    if (palette === null) throw new Error('PNG com paleta sem o bloco PLTE');
    if (![1, 2, 4, 8].includes(bitDepth)) throw new Error(`paleta com ${bitDepth} bits não é suportada`);
  } else if (colorType === 0) {
    if (![1, 2, 4, 8, 16].includes(bitDepth)) throw new Error(`cinza com ${bitDepth} bits não é suportado`);
  } else if (bitDepth !== 8 && bitDepth !== 16) {
    throw new Error(`${bitDepth} bits por canal não é suportado neste tipo de cor`);
  }

  const bitsPerPixel = channels * bitDepth;
  const bytesPerRow = Math.ceil((width * bitsPerPixel) / 8);
  const bpp = Math.max(1, Math.floor(bitsPerPixel / 8));
  const raw = unfilter(zlib.inflate(concat(data)), bytesPerRow, height, bpp);
  const sample = sampleReader(raw, bitDepth);

  // Grey and palette samples below 8 bits are scaled up to the full 0..255 range.
  const maxValue = (1 << Math.min(bitDepth, 8)) - 1;
  const greyScale = bitDepth >= 8 ? 1 : 255 / maxValue;

  // `tRNS` for grey and RGB names one fully transparent colour, in 16-bit
  // samples; only the high byte matters once we are down at 8 bits.
  const keyGrey = colorType === 0 && transparency !== null && transparency.length >= 2
    ? (bitDepth === 16 ? transparency[0] : (((transparency[0] << 8) | transparency[1]) & maxValue))
    : -1;
  const keyRgb = colorType === 2 && transparency !== null && transparency.length >= 6
    ? [transparency[0 + (bitDepth === 16 ? 0 : 1)], transparency[2 + (bitDepth === 16 ? 0 : 1)], transparency[4 + (bitDepth === 16 ? 0 : 1)]]
    : null;

  const pixels = new Uint8Array(width * height * 4);
  let write = 0;
  for (let y = 0; y < height; y++) {
    const rowAt = y * bytesPerRow;
    for (let x = 0; x < width; x++) {
      const base = x * channels;
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 255;
      if (colorType === 0) {
        const v = sample(rowAt, base);
        if (v === keyGrey) a = 0;
        r = g = b = Math.round(v * greyScale);
      } else if (colorType === 4) {
        r = g = b = sample(rowAt, base);
        a = sample(rowAt, base + 1);
      } else if (colorType === 2) {
        r = sample(rowAt, base);
        g = sample(rowAt, base + 1);
        b = sample(rowAt, base + 2);
        if (keyRgb !== null && r === keyRgb[0] && g === keyRgb[1] && b === keyRgb[2]) a = 0;
      } else if (colorType === 6) {
        r = sample(rowAt, base);
        g = sample(rowAt, base + 1);
        b = sample(rowAt, base + 2);
        a = sample(rowAt, base + 3);
      } else {
        const index = sample(rowAt, base);
        const k = index * 3;
        const table = palette as Uint8Array;
        r = table[k];
        g = table[k + 1];
        b = table[k + 2];
        if (transparency !== null && index < transparency.length) a = transparency[index];
      }
      pixels[write++] = r;
      pixels[write++] = g;
      pixels[write++] = b;
      pixels[write++] = a;
    }
  }

  return {
    width,
    height,
    pixels,
    info: { bitDepth, colorType, paletted: palette !== null, transparency: transparency !== null },
  };
}

// ---------------------------------------------------------------------------
// Writing
// ---------------------------------------------------------------------------

/** Applies one row filter into `out`, and returns the sum of absolute values. */
function filterRow(
  row: Uint8Array, prev: Uint8Array | null, bpp: number, filter: number, out: Uint8Array,
): number {
  let sum = 0;
  for (let x = 0; x < row.length; x++) {
    const a = x >= bpp ? row[x - bpp] : 0;
    const b = prev === null ? 0 : prev[x];
    const c = prev === null || x < bpp ? 0 : prev[x - bpp];
    let v: number;
    switch (filter) {
      case 0: v = row[x]; break;
      case 1: v = row[x] - a; break;
      case 2: v = row[x] - b; break;
      case 3: v = row[x] - ((a + b) >> 1); break;
      default: v = row[x] - paeth(a, b, c); break;
    }
    const byte = v & 255;
    out[x] = byte;
    sum += byte < 128 ? byte : 256 - byte;
  }
  return sum;
}

/** Builds the filtered scanline stream: one filter byte, then the row. */
function filterImage(
  samples: Uint8Array, bytesPerRow: number, height: number, bpp: number, choice: PngFilterChoice,
): Uint8Array {
  const out = new Uint8Array((bytesPerRow + 1) * height);
  const candidate = new Uint8Array(bytesPerRow);
  const best = new Uint8Array(bytesPerRow);
  for (let y = 0; y < height; y++) {
    const row = samples.subarray(y * bytesPerRow, (y + 1) * bytesPerRow);
    const prev = y === 0 ? null : samples.subarray((y - 1) * bytesPerRow, y * bytesPerRow);
    const at = y * (bytesPerRow + 1);
    if (choice === 'adaptive') {
      let bestFilter = 0;
      let bestSum = Infinity;
      for (let f = 0; f <= 4; f++) {
        const sum = filterRow(row, prev, bpp, f, candidate);
        if (sum < bestSum) { bestSum = sum; bestFilter = f; best.set(candidate); }
      }
      out[at] = bestFilter;
      out.set(best, at + 1);
    } else {
      filterRow(row, prev, bpp, choice, candidate);
      out[at] = choice;
      out.set(candidate, at + 1);
    }
  }
  return out;
}

/** Distinct RGBA colours, in first-seen order, or `null` past `limit`. */
function collectPalette(pixels: Uint8Array, limit: number): number[] | null {
  const seen = new Map<number, number>();
  const order: number[] = [];
  for (let i = 0; i < pixels.length; i += 4) {
    const key = ((pixels[i] << 24) | (pixels[i + 1] << 16) | (pixels[i + 2] << 8) | pixels[i + 3]) >>> 0;
    if (seen.has(key)) continue;
    seen.set(key, order.length);
    order.push(key);
    if (order.length > limit) return null;
  }
  return order;
}

function hasAlpha(pixels: Uint8Array): boolean {
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 255) return true;
  return false;
}

function isGrey(pixels: Uint8Array): boolean {
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i] !== pixels[i + 1] || pixels[i] !== pixels[i + 2]) return false;
  }
  return true;
}

/** Writes a non-interlaced 8-bit PNG. Input is straight-alpha RGBA8, top-down. */
export function encodePng(image: PngImage, zlib: PngZlib, options: PngEncodeOptions = {}): Uint8Array {
  const { width, height, pixels } = image;
  if (width <= 0 || height <= 0) throw new Error('não dá para gravar um PNG de tamanho zero');
  if (pixels.length < width * height * 4) throw new Error('faltam pixels para a largura e a altura dadas');
  const filter = options.filter ?? 0;
  const level = options.level ?? 9;

  let choice = options.colorType ?? 'rgba8';
  let paletteColors: number[] | null = null;
  if (choice === 'palette' || choice === 'auto') {
    paletteColors = collectPalette(pixels, 256);
    if (choice === 'palette' && paletteColors === null) {
      throw new Error('a imagem tem mais de 256 cores; não cabe numa paleta');
    }
    if (choice === 'auto') {
      if (paletteColors !== null) choice = 'palette';
      else if (hasAlpha(pixels)) choice = 'rgba8';
      else choice = isGrey(pixels) ? 'gray8' : 'rgb8';
    }
  }

  let colorType: number;
  let channels: number;
  let samples: Uint8Array;
  const extra: Uint8Array[] = [];

  if (choice === 'palette') {
    const colors = paletteColors as number[];
    const index = new Map<number, number>();
    for (let i = 0; i < colors.length; i++) index.set(colors[i], i);
    colorType = 3;
    channels = 1;
    samples = new Uint8Array(width * height);
    for (let p = 0, i = 0; i < pixels.length; i += 4, p++) {
      const key = ((pixels[i] << 24) | (pixels[i + 1] << 16) | (pixels[i + 2] << 8) | pixels[i + 3]) >>> 0;
      samples[p] = index.get(key) as number;
    }
    const plte = new Uint8Array(colors.length * 3);
    const alphas = new Uint8Array(colors.length);
    let lastWithAlpha = -1;
    for (let i = 0; i < colors.length; i++) {
      plte[i * 3] = (colors[i] >>> 24) & 255;
      plte[i * 3 + 1] = (colors[i] >>> 16) & 255;
      plte[i * 3 + 2] = (colors[i] >>> 8) & 255;
      alphas[i] = colors[i] & 255;
      if (alphas[i] !== 255) lastWithAlpha = i;
    }
    extra.push(chunk('PLTE', plte));
    // `tRNS` may stop at the last entry that is not opaque (RFC 2083 §4.2.5).
    if (lastWithAlpha >= 0) extra.push(chunk('tRNS', alphas.subarray(0, lastWithAlpha + 1)));
  } else if (choice === 'rgb8') {
    colorType = 2;
    channels = 3;
    samples = new Uint8Array(width * height * 3);
    for (let p = 0, i = 0; i < pixels.length; i += 4, p += 3) {
      samples[p] = pixels[i];
      samples[p + 1] = pixels[i + 1];
      samples[p + 2] = pixels[i + 2];
    }
  } else if (choice === 'gray8') {
    colorType = 0;
    channels = 1;
    samples = new Uint8Array(width * height);
    for (let p = 0, i = 0; i < pixels.length; i += 4, p++) samples[p] = pixels[i];
  } else {
    colorType = 6;
    channels = 4;
    samples = pixels.subarray(0, width * height * 4);
  }

  const bytesPerRow = width * channels;
  const stream = filterImage(samples, bytesPerRow, height, channels, filter);

  const ihdr = new Uint8Array(13);
  writeU32(ihdr, 0, width);
  writeU32(ihdr, 4, height);
  ihdr[8] = 8;            // bits per sample
  ihdr[9] = colorType;
  ihdr[10] = 0;           // deflate
  ihdr[11] = 0;           // adaptive filtering
  ihdr[12] = 0;           // no interlace

  return concat([
    new Uint8Array(SIGNATURE),
    chunk('IHDR', ihdr),
    ...extra,
    chunk('IDAT', zlib.deflate(stream, level)),
    chunk('IEND', new Uint8Array(0)),
  ]);
}
