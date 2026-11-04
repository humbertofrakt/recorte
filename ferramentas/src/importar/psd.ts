// SPDX-License-Identifier: Apache-2.0
/**
 * PSD and PSB reader (requirement R3 / I1), in plain TypeScript.
 *
 * No dependency, no Node, no DOM: the only thing injected is `inflate`, and
 * only the ZIP compressions need it. So the very same module serves the command
 * line (`ferramentas/importar-psd.mjs`, where `node:zlib` provides it) and the
 * editor (`editor/src/io/import-psd.ts`, where the browser stream API does).
 *
 * What it reads, which is what a layered character needs and nothing more:
 *
 *   - the file header: width, height, channel count, bit depth (8 and 16) and
 *     colour mode (RGB and greyscale);
 *   - the layer table: rectangle, opacity, blend mode, visibility, the Pascal
 *     name and the Unicode name of the `luni` block, which wins when both are
 *     there because it is the one that survives an accent;
 *   - layer groups, from the `lsct` section divider, turned into folders in the
 *     name: a layer `braco` inside a group `corpo` comes back as `corpo/braco`;
 *   - the per-channel pixels, in compressions 0 (raw), 1 (RLE PackBits) and,
 *     when an `inflate` was handed over, 2 and 3 (ZIP, the second one with the
 *     per-row prediction undone).
 *
 * Each layer comes back with its position on the document canvas and its pixels
 * already RGBA8, straight alpha, top-down — the one shape the atlas packer and
 * a canvas both take — with the layer opacity already folded into the alpha.
 *
 * Anything that could not be carried over is a line of Portuguese in
 * `warnings`. Nothing is dropped in silence.
 *
 * Reference: Adobe Photoshop File Formats Specification, sections "File
 * Header", "Layer and Mask Information" and "Channel image data".
 */

import type { Attachment, BoneFile, Skin, Slot } from './comum.ts'
import { makeHeader } from './comum.ts'
import { BONES_LAYER_SKIPPED, buildPsdRig, isBonesLayer } from './psd-bones.ts'

// ---------------------------------------------------------------------------
// Public shapes
// ---------------------------------------------------------------------------

/** The decompressor, injected so this module depends on no platform. */
export interface PsdZlib {
  /** zlib stream in, raw bytes out. */
  inflate(data: Uint8Array): Uint8Array
}

/** One layer with pixels, ready to be packed into an atlas. */
export interface PsdLayer {
  /** Full name, folders included: `corpo/braco`. */
  name: string
  /** Only the folders, `corpo`, or `''` when the layer is not in a group. */
  folder: string
  /** Only the leaf, `braco`. */
  leaf: string
  /** Left edge on the document canvas, in px, x to the right. */
  x: number
  /** Top edge on the document canvas, in px, y DOWN (the PSD convention). */
  y: number
  width: number
  height: number
  /** `width * height * 4` bytes, RGBA8, straight alpha, top-down. */
  pixels: Uint8Array
  /** Layer opacity, `0` to `1`, already folded into `pixels`. */
  opacity: number
  /** `false` when the eye is off in Photoshop. */
  visible: boolean
  /** The four-letter PSD blend key, e.g. `norm`, `mul `, `scrn`. */
  blendMode: string
  /** `true` when the layer carried a mask, which this reader ignores. */
  hasMask: boolean
}

/** Everything the reader took out of a `.psd` or `.psb`. */
export interface PsdDocument {
  width: number
  height: number
  /** Channels of the merged image. */
  channels: number
  /** Bits per sample, as written in the header. */
  depth: number
  /** Photoshop colour mode: 1 grey, 3 RGB. */
  colorMode: number
  /** `true` for a `.psb` (large document format). */
  psb: boolean
  /** Layers with pixels, in draw order: the first one is drawn first. */
  layers: PsdLayer[]
  /** The guides of the document, in canvas pixels (degrau 8, task 8.4). */
  guides: PsdGuides
  /** What could not be carried over, one line each, in Portuguese. */
  warnings: string[]
}

/**
 * As guias do documento, em px da tela — degrau 8, tarefa 8.4 (I8).
 *
 * `vertical` são as guias de pé, medidas da esquerda (elas dão um **x**);
 * `horizontal` são as deitadas, medidas de cima (elas dão um **y**), que é a
 * conta do PSD, com o y para baixo.
 */
export interface PsdGuides {
  vertical: number[]
  horizontal: number[]
}

/** Colour mode names, for the warnings. */
const COLOR_MODES: Record<number, string> = {
  0: 'bitmap (1 bit)',
  1: 'tons de cinza',
  2: 'cores indexadas',
  3: 'RGB',
  4: 'CMYK',
  7: 'multicanal',
  8: 'duotone',
  9: 'Lab',
}

// ---------------------------------------------------------------------------
// Bytes
// ---------------------------------------------------------------------------

/** A cursor over the file. Every read moves it forward and checks the end. */
class Reader {
  private at = 0
  private readonly bytes: Uint8Array

  constructor(bytes: Uint8Array) {
    this.bytes = bytes
  }

  get pos(): number {
    return this.at
  }

  set pos(value: number) {
    this.at = value
  }

  get length(): number {
    return this.bytes.length
  }

  private need(count: number): void {
    if (this.at + count > this.bytes.length) {
      throw new Error('o arquivo acaba antes do esperado; ele pode estar cortado')
    }
  }

  u8(): number {
    this.need(1)
    return this.bytes[this.at++]
  }

  u16(): number {
    this.need(2)
    const v = (this.bytes[this.at] << 8) | this.bytes[this.at + 1]
    this.at += 2
    return v
  }

  i16(): number {
    return (this.u16() << 16) >> 16
  }

  u32(): number {
    this.need(4)
    const b = this.bytes
    const v = ((b[this.at] << 24) | (b[this.at + 1] << 16) | (b[this.at + 2] << 8) | b[this.at + 3]) >>> 0
    this.at += 4
    return v
  }

  i32(): number {
    return this.u32() | 0
  }

  /** A 64-bit length, as PSB writes it. Refuses anything past 2^53. */
  u64(): number {
    const high = this.u32()
    const low = this.u32()
    if (high > 0x001fffff) throw new Error('o arquivo declara um tamanho grande demais para ser lido')
    return high * 0x100000000 + low
  }

  /** Four ASCII bytes, as a string: the block signatures and keys. */
  tag(): string {
    this.need(4)
    let out = ''
    for (let i = 0; i < 4; i++) out += String.fromCharCode(this.bytes[this.at + i])
    this.at += 4
    return out
  }

  /** Peeks four ASCII bytes without moving. Empty when the file ends first. */
  peekTag(at: number = this.at): string {
    if (at + 4 > this.bytes.length) return ''
    let out = ''
    for (let i = 0; i < 4; i++) out += String.fromCharCode(this.bytes[at + i])
    return out
  }

  slice(count: number): Uint8Array {
    this.need(count)
    const out = this.bytes.subarray(this.at, this.at + count)
    this.at += count
    return out
  }

  skip(count: number): void {
    this.need(count)
    this.at += count
  }

  /**
   * A Pascal string padded to a multiple of `pad`: one length byte, that many
   * bytes of text, then the filler. Read as Latin-1, which is what Photoshop
   * writes here; the real name comes from the `luni` block when it is present.
   */
  pascal(pad: number): string {
    const size = this.u8()
    const raw = this.slice(size)
    let out = ''
    for (let i = 0; i < raw.length; i++) out += String.fromCharCode(raw[i])
    const total = 1 + size
    const extra = (pad - (total % pad)) % pad
    if (extra > 0) this.skip(extra)
    return out
  }
}

/**
 * The guides, out of image resource 1032 — degrau 8, task 8.4 (I8).
 *
 * O Humberto, sobre o plugin do Spine: *"pivô automático com o PSD, isso é
 * OURO"*. O plugin lê a guia como 0,0 e grava o deslocamento real; o nosso
 * punha a origem no meio da tela e nunca perguntava ao artista.
 *
 * Bloco 1032, "Grid and guides": versão (4), o passo da grade (2 × 4), quantas
 * guias (4), e então, por guia, a posição (4) e a direção (1). A posição vem em
 * **trinta e dois avos de pixel**, que é como o Photoshop a guarda.
 *
 * Um bloco estragado não derruba a importação: as guias voltam vazias, o
 * arquivo entra pela tela, e a linha de aviso diz isso. Um PSD sem guia
 * nenhuma sai igual ao de antes, byte a byte.
 */
function readGuides(r: Reader, end: number, warn: (line: string) => void): PsdGuides {
  const guides: PsdGuides = { vertical: [], horizontal: [] }
  try {
    while (r.pos + 12 <= end) {
      if (r.tag() !== '8BIM') break
      const id = r.u16()
      r.pascal(2)
      const size = r.u32()
      const after = r.pos + size + (size % 2)
      if (after > end) break
      if (id === 1032 && size >= 16) {
        r.skip(12) // version, and the grid cycle in x and y
        const count = r.u32()
        for (let i = 0; i < count && r.pos + 5 <= after; i++) {
          // Trinta e dois avos de pixel, e a direção num byte: 0 de pé, 1 deitada.
          const at = r.u32() / 32
          const vertical = r.u8() === 0
          if (!Number.isFinite(at)) continue
          ;(vertical ? guides.vertical : guides.horizontal).push(at)
        }
      }
      r.pos = after
    }
  } catch {
    warn('O bloco de guias deste PSD não pôde ser lido; o arquivo entra alinhado pela tela.')
    return { vertical: [], horizontal: [] }
  }
  guides.vertical.sort((a, b) => a - b)
  guides.horizontal.sort((a, b) => a - b)
  return guides
}

function readU16(bytes: Uint8Array, at: number): number {
  return (bytes[at] << 8) | bytes[at + 1]
}

function readU32(bytes: Uint8Array, at: number): number {
  return ((bytes[at] << 24) | (bytes[at + 1] << 16) | (bytes[at + 2] << 8) | bytes[at + 3]) >>> 0
}

/** UTF-16 big endian, the encoding of the `luni` block. */
function utf16be(bytes: Uint8Array, count: number): string {
  const units: number[] = []
  for (let i = 0; i < count && i * 2 + 1 < bytes.length; i++) units.push(readU16(bytes, i * 2))
  // Trailing NUL: Photoshop counts it in some writers and not in others.
  while (units.length > 0 && units[units.length - 1] === 0) units.pop()
  let out = ''
  for (let i = 0; i < units.length; i += 1024) {
    out += String.fromCharCode(...units.slice(i, i + 1024))
  }
  return out
}

// ---------------------------------------------------------------------------
// The three compressions
// ---------------------------------------------------------------------------

/**
 * PackBits, the RLE of compression 1. The scanline byte counts come first —
 * two bytes each in a PSD, four in a PSB — and then the packed rows.
 */
export function unpackBits(
  body: Uint8Array, height: number, rowBytes: number, psb: boolean,
): Uint8Array {
  const out = new Uint8Array(rowBytes * height)
  const step = psb ? 4 : 2
  let at = height * step
  for (let y = 0; y < height; y++) {
    const count = psb ? readU32(body, y * 4) : readU16(body, y * 2)
    const end = Math.min(at + count, body.length)
    let write = y * rowBytes
    const limit = write + rowBytes
    let p = at
    while (p < end && write < limit) {
      const n = (body[p++] << 24) >> 24
      if (n >= 0) {
        for (let k = 0; k <= n && write < limit && p < body.length; k++) out[write++] = body[p++]
      } else if (n !== -128) {
        const value = body[p++]
        for (let k = 0; k < 1 - n && write < limit; k++) out[write++] = value
      }
      // n === -128 is a no-op, exactly as PackBits defines it.
    }
    at = at + count
  }
  return out
}

/** Undoes the per-row delta of compression 3 (ZIP with prediction), 8 bits. */
function undoPrediction8(samples: Uint8Array, width: number, height: number): void {
  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 1; x < width; x++) {
      samples[row + x] = (samples[row + x] + samples[row + x - 1]) & 255
    }
  }
}

/** Undoes the prediction of a 16-bit channel, which works on whole samples. */
function undoPrediction16(samples: Uint8Array, width: number, height: number): void {
  for (let y = 0; y < height; y++) {
    const row = y * width * 2
    for (let x = 1; x < width; x++) {
      const here = row + x * 2
      const before = here - 2
      const sum = ((samples[before] << 8) | samples[before + 1])
        + ((samples[here] << 8) | samples[here + 1])
      samples[here] = (sum >>> 8) & 255
      samples[here + 1] = sum & 255
    }
  }
}

/** Why a channel could not be read, or `null` when it was. */
interface ChannelResult {
  samples: Uint8Array | null
  problem: string | null
}

/**
 * One channel, decompressed and narrowed to one byte per sample.
 * `raw` is the whole channel record: the two compression bytes and the body.
 */
function decodeChannel(
  raw: Uint8Array, width: number, height: number, depth: number, psb: boolean,
  zlib: PsdZlib | null,
): ChannelResult {
  if (raw.length < 2) return { samples: null, problem: 'o canal veio vazio' }
  const compression = readU16(raw, 0)
  const body = raw.subarray(2)
  const bytesPerSample = depth === 8 ? 1 : depth === 16 ? 2 : 0
  if (bytesPerSample === 0) {
    return { samples: null, problem: `${depth} bits por canal não são suportados` }
  }
  const rowBytes = width * bytesPerSample
  let samples: Uint8Array

  if (compression === 0) {
    samples = body.slice(0, rowBytes * height)
  } else if (compression === 1) {
    samples = unpackBits(body, height, rowBytes, psb)
  } else if (compression === 2 || compression === 3) {
    if (zlib === null) {
      return { samples: null, problem: 'está compactado em ZIP e não há descompactador aqui' }
    }
    try {
      samples = zlib.inflate(body)
    } catch (error) {
      return { samples: null, problem: `o ZIP não abriu: ${messageOf(error)}` }
    }
    if (compression === 3) {
      if (bytesPerSample === 1) undoPrediction8(samples, width, height)
      else undoPrediction16(samples, width, height)
    }
  } else {
    return { samples: null, problem: `a compressão ${compression} não é conhecida` }
  }

  if (samples.length < rowBytes * height) {
    return { samples: null, problem: 'faltam bytes para a largura e a altura da camada' }
  }
  if (bytesPerSample === 1) return { samples, problem: null }

  // 16 bits: keep the high byte, which is what an 8-bit pipeline can use.
  const narrowed = new Uint8Array(width * height)
  for (let i = 0; i < narrowed.length; i++) narrowed[i] = samples[i * 2]
  return { samples: narrowed, problem: null }
}

// ---------------------------------------------------------------------------
// The layer table
// ---------------------------------------------------------------------------

/** Keys whose length field is eight bytes long in a PSB. */
const BIG_KEYS = new Set([
  'LMsk', 'Lr16', 'Lr32', 'Layr', 'Mt16', 'Mt32', 'Mtrn', 'Alph',
  'FMsk', 'lnk2', 'FEid', 'FXid', 'PxSD', 'cinf',
])

/** One row of the layer table, before the pixels are attached. */
interface LayerRecord {
  top: number
  left: number
  bottom: number
  right: number
  channels: Array<{ id: number; length: number }>
  blendMode: string
  opacity: number
  visible: boolean
  /** `0` for a normal layer, `1`/`2` for a group opener, `3` for its bottom. */
  section: number
  name: string
  hasMask: boolean
}

function readLayerRecord(r: Reader, psb: boolean): LayerRecord {
  const top = r.i32()
  const left = r.i32()
  const bottom = r.i32()
  const right = r.i32()
  const channelCount = r.u16()
  const channels: Array<{ id: number; length: number }> = []
  for (let i = 0; i < channelCount; i++) {
    const id = r.i16()
    const length = psb ? r.u64() : r.u32()
    channels.push({ id, length })
  }
  const signature = r.tag()
  if (signature !== '8BIM') {
    throw new Error(`a tabela de camadas está fora do lugar (esperava 8BIM, veio "${signature}")`)
  }
  const blendMode = r.tag()
  const opacity = r.u8()
  r.u8() // clipping
  const flags = r.u8()
  r.u8() // filler

  const extraLength = r.u32()
  const extraEnd = r.pos + extraLength

  const maskLength = r.u32()
  const hasMask = maskLength > 0
  r.skip(maskLength)
  const rangesLength = r.u32()
  r.skip(rangesLength)
  let name = r.pascal(4)
  let section = 0

  // The blocks after the name: `luni` carries the real name, `lsct` says
  // whether this row is a group opener or the marker that closes one.
  while (r.pos + 12 <= extraEnd) {
    const sig = r.tag()
    if (sig !== '8BIM' && sig !== '8B64') break
    const key = r.tag()
    const size = psb && BIG_KEYS.has(key) ? r.u64() : r.u32()
    if (r.pos + size > extraEnd) break
    const data = r.slice(size)
    if (key === 'luni' && data.length >= 4) {
      const unicode = utf16be(data.subarray(4), readU32(data, 0))
      if (unicode !== '') name = unicode
    } else if (key === 'lsct' && data.length >= 4) {
      section = readU32(data, 0)
    }
    // "Rounded up to an even byte count", says the spec — but not every writer
    // pads, so realign only when the next signature is one byte further on.
    if ((size & 1) === 1 && r.pos < extraEnd
      && r.peekTag() !== '8BIM' && r.peekTag() !== '8B64'
      && (r.peekTag(r.pos + 1) === '8BIM' || r.peekTag(r.pos + 1) === '8B64')) {
      r.skip(1)
    }
  }
  r.pos = extraEnd

  return {
    top,
    left,
    bottom,
    right,
    channels,
    blendMode,
    opacity,
    // Bit 1 means HIDDEN, not visible. It reads backwards; that is the format.
    visible: (flags & 2) === 0,
    section,
    name,
    hasMask,
  }
}

/** Control characters out, slashes out (they would fake a folder), trimmed. */
function cleanName(raw: string): string {
  const clean = raw
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/[/\\]/g, '-')
    .trim()
  return clean === '' ? 'camada' : clean
}

// ---------------------------------------------------------------------------
// Reading a whole file
// ---------------------------------------------------------------------------

/** `true` when the bytes start with the `8BPS` signature. */
export function isPsd(bytes: Uint8Array): boolean {
  return bytes.length >= 6
    && bytes[0] === 0x38 && bytes[1] === 0x42 && bytes[2] === 0x50 && bytes[3] === 0x53
}

/**
 * Reads a `.psd` or a `.psb` and gives back every layer that has pixels, in
 * draw order, with its position on the canvas.
 *
 * Throws, in Portuguese, only when the file is not a PSD at all or when it is
 * cut short. Everything else — an unreadable layer, a colour mode we do not
 * paint in — is a line in `warnings` and the rest of the file still comes back.
 */
export function readPsd(bytes: Uint8Array, zlib: PsdZlib | null = null): PsdDocument {
  const warnings: string[] = []
  const warn = (line: string): void => {
    if (!warnings.includes(line)) warnings.push(line)
  }

  const r = new Reader(bytes)
  if (!isPsd(bytes)) throw new Error('este arquivo não é um PSD nem um PSB.')
  r.skip(4)
  const version = r.u16()
  if (version !== 1 && version !== 2) {
    throw new Error(`versão ${version} de PSD não é conhecida; este leitor abre 1 (PSD) e 2 (PSB).`)
  }
  const psb = version === 2
  r.skip(6) // reserved
  const channels = r.u16()
  const height = r.u32()
  const width = r.u32()
  const depth = r.u16()
  const colorMode = r.u16()

  if (width === 0 || height === 0) throw new Error('o arquivo diz ter largura ou altura zero.')
  if (colorMode !== 3 && colorMode !== 1) {
    warn(`O arquivo está em ${COLOR_MODES[colorMode] ?? `modo de cor ${colorMode}`}. `
      + 'Este leitor pinta RGB e tons de cinza; as cores podem sair trocadas. '
      + 'Converta para RGB no Photoshop e importe de novo.')
  }
  if (depth !== 8 && depth !== 16) {
    warn(`O arquivo tem ${depth} bits por canal. Este leitor abre 8 e 16 bits. `
      + 'Nenhuma camada vai ter pixels.')
  }

  r.skip(r.u32()) // colour mode data
  // Image resources: the guides live here (resource 1032), and until this
  // degrau the whole block was skipped — which is why the importer put the
  // origin in the middle of the canvas and never asked the artist.
  const resourcesLength = r.u32()
  const resourcesEnd = r.pos + resourcesLength
  const guides = readGuides(r, resourcesEnd, warn)
  r.pos = resourcesEnd

  const layerAndMaskLength = psb ? r.u64() : r.u32()
  const layerAndMaskEnd = r.pos + layerAndMaskLength
  const layers: PsdLayer[] = []

  if (layerAndMaskLength === 0) {
    warn('O arquivo não tem camadas separadas, só a imagem achatada. '
      + 'No Photoshop, desligue "Maximizar compatibilidade" ao salvar, ou salve com as camadas.')
    return { width, height, channels, depth, colorMode, psb, layers, guides, warnings }
  }

  const layerInfoLength = psb ? r.u64() : r.u32()
  if (layerInfoLength === 0) {
    warn('O arquivo não tem a tabela de camadas no lugar de sempre. '
      + 'Arquivos de 16 ou 32 bits às vezes guardam ela em outro bloco, que este leitor ainda não abre.')
    r.pos = layerAndMaskEnd
    return { width, height, channels, depth, colorMode, psb, layers, guides, warnings }
  }

  const rawCount = r.i16()
  const count = Math.abs(rawCount)
  const records: LayerRecord[] = []
  for (let i = 0; i < count; i++) records.push(readLayerRecord(r, psb))

  // The full name of every row, folders included. The list is written bottom to
  // top, and a group is written as: its bottom marker, its children, then the
  // row that carries the group's name. Walking it backwards puts the name
  // first, so a plain stack of open folders is enough.
  const paths: string[] = new Array<string>(records.length).fill('')
  const stack: string[] = []
  for (let i = records.length - 1; i >= 0; i--) {
    const record = records[i]
    const leaf = cleanName(record.name)
    if (record.section === 1 || record.section === 2) {
      stack.push(leaf)
      continue
    }
    if (record.section === 3) {
      stack.pop()
      continue
    }
    paths[i] = [...stack].reverse().concat(leaf).join('/')
  }

  // The pixels come after the whole table, one block per channel, in the very
  // order the channels were declared.
  const usedNames = new Set<string>()
  for (let i = 0; i < records.length; i++) {
    const record = records[i]
    const w = record.right - record.left
    const h = record.bottom - record.top
    const name = paths[i]
    const isGroupRow = record.section !== 0

    const planes = new Map<number, Uint8Array>()
    let problem: string | null = null
    for (const channel of record.channels) {
      const raw = r.slice(channel.length)
      // Masks (-2, -3) have their own rectangle; they are skipped, not decoded.
      if (isGroupRow || w <= 0 || h <= 0 || channel.id < -1) continue
      const decoded = decodeChannel(raw, w, h, depth, psb, zlib)
      if (decoded.samples === null) {
        problem ??= decoded.problem
        continue
      }
      planes.set(channel.id, decoded.samples)
    }

    if (isGroupRow) continue
    if (w <= 0 || h <= 0) {
      warn(`A camada "${name}" não tem desenho nenhum e ficou de fora.`)
      continue
    }
    if (problem !== null || planes.size === 0) {
      warn(`A camada "${name}" ficou de fora: ${problem ?? 'não veio nenhum canal de cor'}.`)
      continue
    }
    if (record.hasMask) {
      warn(`A camada "${name}" tem máscara. A máscara não é importada; o desenho vem inteiro.`)
    }

    const opacity = record.opacity / 255
    const pixels = composeLayer(planes, w, h, colorMode, opacity)
    // Two layers may carry the same name in Photoshop; a region name may not
    // repeat in an atlas (§10.3), so the second one gets a number.
    const unique = uniqueName(name, usedNames)
    usedNames.add(unique)
    if (unique !== name) {
      warn(`Há mais de uma camada chamada "${name}". A segunda entrou como "${unique}".`)
    }
    layers.push({
      name: unique,
      folder: unique.includes('/') ? unique.slice(0, unique.lastIndexOf('/')) : '',
      leaf: unique.slice(unique.lastIndexOf('/') + 1),
      x: record.left,
      y: record.top,
      width: w,
      height: h,
      pixels,
      opacity,
      visible: record.visible,
      blendMode: record.blendMode,
      hasMask: record.hasMask,
    })
    if (!record.visible) {
      warn(`A camada "${name}" está desligada no Photoshop. Ela entrou assim mesmo, `
        + 'com o slot desligado; ligue no painel Árvore quando precisar dela.')
    }
  }

  if (layers.length === 0 && count > 0) {
    warn('Nenhuma camada trouxe desenho. Confira se o arquivo tem camadas de pixel, '
      + 'e não só grupos, textos ou camadas de ajuste.')
  }

  return { width, height, channels, depth, colorMode, psb, layers, guides, warnings }
}

/** The decompressor of a host whose inflate is asynchronous — a browser. */
export interface PsdAsyncZlib {
  inflate(data: Uint8Array): Promise<Uint8Array>
}

/**
 * The same read, for a host with no synchronous inflate.
 *
 * The browser's only decompressor is `DecompressionStream`, and it returns a
 * promise. So the file is walked twice: the first pass writes down every ZIP
 * block it meets and lets those channels fall through, the blocks are inflated
 * in between, and the second pass reads them back in the very order the first
 * one asked for them. A file with no ZIP channel is read once and comes back
 * straight away — which is most files, because Photoshop writes RLE by default.
 */
export async function readPsdAsync(
  bytes: Uint8Array, zlib: PsdAsyncZlib,
): Promise<PsdDocument> {
  const asked: Uint8Array[] = []
  const collect: PsdZlib = {
    inflate(data: Uint8Array): Uint8Array {
      asked.push(data)
      // Refused on purpose: this pass only writes down what has to be inflated.
      throw new Error('adiado para a segunda passada')
    },
  }
  const first = readPsd(bytes, collect)
  if (asked.length === 0) return first

  const ready: Uint8Array[] = []
  for (const block of asked) ready.push(await zlib.inflate(block))

  let next = 0
  const replay: PsdZlib = {
    inflate(): Uint8Array {
      const out = ready[next++]
      if (out === undefined) throw new Error('faltou um bloco já descompactado')
      return out
    },
  }
  return readPsd(bytes, replay)
}

/** Channel planes to RGBA8, straight alpha, with the layer opacity folded in. */
function composeLayer(
  planes: Map<number, Uint8Array>, width: number, height: number,
  colorMode: number, opacity: number,
): Uint8Array {
  const count = width * height
  const out = new Uint8Array(count * 4)
  const grey = colorMode === 1
  const red = planes.get(0) ?? null
  const green = grey ? red : planes.get(1) ?? null
  const blue = grey ? red : planes.get(2) ?? null
  const alpha = planes.get(-1) ?? null
  for (let i = 0; i < count; i++) {
    const at = i * 4
    out[at] = red === null ? 0 : red[i]
    out[at + 1] = green === null ? out[at] : green[i]
    out[at + 2] = blue === null ? out[at] : blue[i]
    const a = alpha === null ? 255 : alpha[i]
    out[at + 3] = Math.round(a * opacity)
  }
  return out
}

// ---------------------------------------------------------------------------
// From a PSD to a `.bone`
// ---------------------------------------------------------------------------

/**
 * Where a layer lands in skeleton space.
 *
 * A PSD counts from the top left corner with y going down; a skeleton counts
 * from its own origin with y going up. The origin is put at the middle of the
 * canvas, so a character drawn in the middle of the page opens in the middle of
 * the viewport, and `attachment.x/y` is the CENTRE of the image, which is what
 * §7.3 asks for.
 */
export function psdPlacement(
  doc: { width: number; height: number },
  layer: { x: number; y: number; width: number; height: number },
  /** Degrau 8: a origem em px do PSD (x da esquerda, y de CIMA). Ausente = o meio. */
  origin?: { x: number; y: number },
): { x: number; y: number; width: number; height: number } {
  const at = origin ?? { x: doc.width / 2, y: doc.height / 2 }
  return {
    x: layer.x + layer.width / 2 - at.x,
    y: at.y - (layer.y + layer.height / 2),
    width: layer.width,
    height: layer.height,
  }
}

/** De onde a origem do esqueleto veio: da guia, de meia guia, ou da tela. */
export type PsdOriginSource = 'guia' | 'guia-x' | 'guia-y' | 'tela'

/** A origem do esqueleto dentro do PSD, e de onde ela veio. */
export interface PsdOrigin {
  /** Em px do PSD: x da esquerda, y de CIMA. */
  x: number
  y: number
  source: PsdOriginSource
}

/**
 * **Alinhar pela guia** — degrau 8, tarefa 8.4 (I8), proposta do Diretor
 * aceita pelo Humberto: *"PSD pela guia; sem guia, pela tela; tamanho
 * diferente avisa"*.
 *
 * O cruzamento da **primeira guia de pé** com a **primeira deitada** é o `0, 0`
 * do esqueleto. Só uma delas: aquele eixo vem da guia, o outro do meio da tela,
 * e a linha de aviso diz qual é qual — meio alinhado sem aviso é o pior dos
 * dois mundos (regra 21). Nenhuma guia: o meio da tela, como sempre foi.
 */
export function psdOrigin(
  doc: { width: number; height: number; guides?: PsdGuides },
): PsdOrigin {
  const guides = doc.guides ?? { vertical: [], horizontal: [] }
  const x = guides.vertical[0]
  const y = guides.horizontal[0]
  const temX = typeof x === 'number'
  const temY = typeof y === 'number'
  return {
    x: temX ? x : doc.width / 2,
    y: temY ? y : doc.height / 2,
    source: temX && temY ? 'guia' : temX ? 'guia-x' : temY ? 'guia-y' : 'tela',
  }
}

/** A linha de aviso da origem, ou `null` quando não há o que dizer. */
export function psdOriginWarning(
  doc: { width: number; height: number; guides?: PsdGuides }, origin: PsdOrigin,
): string | null {
  const guides = doc.guides ?? { vertical: [], horizontal: [] }
  const n = (v: number): string => String(Math.round(v * 100) / 100).replace('.', ',')
  const sobrando = guides.vertical.length > 1 || guides.horizontal.length > 1
    ? ' Este PSD tem mais de uma guia em algum eixo: valeu a primeira de cada.'
    : ''
  switch (origin.source) {
    case 'guia':
      return `A origem do esqueleto saiu das guias do PSD: ${n(origin.x)}, ${n(origin.y)} `
        + `px da tela.${sobrando}`
    case 'guia-x':
      return `Este PSD só tem guia DE PÉ: o x saiu dela (${n(origin.x)}), e o y ficou no meio `
        + `da tela (${n(origin.y)}). Ponha uma guia deitada para alinhar a altura também.${sobrando}`
    case 'guia-y':
      return `Este PSD só tem guia DEITADA: o y saiu dela (${n(origin.y)}), e o x ficou no meio `
        + `da tela (${n(origin.x)}). Ponha uma guia de pé para alinhar a largura também.${sobrando}`
    default:
      return null // Sem guia nenhuma: é o caminho de sempre, e não é notícia.
  }
}

/**
 * A guia caiu fora da tela: acontece quando alguém arrasta a guia para fora e
 * esquece. Alinhar por ela põe o personagem longe da origem, e quem abrir o
 * arquivo vai achar que a cena está vazia — então isso se diz.
 */
export function psdOriginOutside(
  doc: { width: number; height: number }, origin: PsdOrigin,
): string | null {
  const fora = origin.x < 0 || origin.x > doc.width || origin.y < 0 || origin.y > doc.height
  return fora
    ? 'A guia deste PSD cai FORA da tela: o personagem vai nascer longe da origem. '
      + 'Confira as guias no Photoshop.'
    : null
}

/** PSD blend keys the `.bone` format has a name for (§7.12). */
const BLEND_MODES: Record<string, 'normal' | 'multiply' | 'screen' | 'additive'> = {
  norm: 'normal',
  pass: 'normal',
  'mul ': 'multiply',
  scrn: 'screen',
  lddg: 'additive',
  lite: 'additive',
}

/** How each PSD blend key is called in Portuguese, for the warning. */
const BLEND_NAMES: Record<string, string> = {
  diss: 'Dissolver',
  dark: 'Escurecer',
  idiv: 'Subexposição de cores',
  lbrn: 'Subexposição linear',
  dkCl: 'Cor mais escura',
  lgCl: 'Cor mais clara',
  over: 'Sobrepor',
  sLit: 'Luz suave',
  hLit: 'Luz intensa',
  vLit: 'Luz vívida',
  lLit: 'Luz linear',
  pLit: 'Luz do pino',
  hMix: 'Mistura dura',
  diff: 'Diferença',
  smud: 'Exclusão',
  fsub: 'Subtrair',
  fdiv: 'Dividir',
  hue: 'Matiz',
  sat: 'Saturação',
  colr: 'Cor',
  lum: 'Luminosidade',
}

export interface PsdBoneOptions {
  /** Written into `assets.atlases`. */
  atlasName?: string
  /** `skeleton.name`. Default `psd`. */
  name?: string
  /** Name of the bone every slot hangs from. Default `root`. */
  rootBone?: string
  /** Written into `bone.generator`. */
  generator?: string
  /**
   * `true` lê a camada `ossos` (ou as camadas do grupo `ossos`) como
   * esqueleto — lote 45, `psd-bones.ts`. Ela não vira desenho; cada linha vira
   * um osso, e cada desenho vai para o osso cuja linha mais o cobre. PSD sem
   * essa camada sai igual, byte a byte, ao de sem a opção.
   */
  bonesLayer?: boolean
}

export interface PsdBoneResult {
  file: BoneFile
  /**
   * Slot name given to each drawing layer, in the same order as `doc.layers`.
   * With `bonesLayer`, the `ossos` layers have no slot and are skipped here.
   */
  slotNames: string[]
  /** Os ossos que as linhas da camada `ossos` criaram, pai antes de filho. */
  boneNames: string[]
  warnings: string[]
}

/** A name not yet in `taken`, as `base`, `base2`, `base3`, … */
function uniqueName(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base
  for (let i = 2; ; i++) {
    const candidate = `${base}${i}`
    if (!taken.has(candidate)) return candidate
  }
}

/**
 * Builds the `.bone` of a read PSD: one root bone, one slot per layer in the
 * PSD's own draw order, and one `region` attachment per slot sitting exactly
 * where the layer sat on the canvas.
 *
 * The pixels are not touched here — packing them into an atlas is the caller's
 * job, and `attachment.path` is the layer's full name, which is the region name
 * the packer will write.
 */
export function psdToBoneFile(doc: PsdDocument, options: PsdBoneOptions = {}): PsdBoneResult {
  const warnings: string[] = []
  const root = options.rootBone ?? 'root'
  // Degrau 8, tarefa 8.4: a guia manda; sem guia, o meio da tela, como sempre.
  const origin = psdOrigin(doc)
  for (const linha of [psdOriginWarning(doc, origin), psdOriginOutside(doc, origin)]) {
    if (linha !== null) warnings.push(linha)
  }
  const file: BoneFile = {
    bone: makeHeader(options.generator ?? 'Recorte importador de PSD 0.1.0'),
    skeleton: {
      name: options.name ?? 'psd',
      // O retângulo da tela, medido da origem: a esquerda dela, e a base dela.
      x: -origin.x,
      y: origin.y - doc.height,
      width: doc.width,
      height: doc.height,
    },
    bones: [{ name: root }],
    slots: [],
    skins: [{ name: 'default', attachments: {} }],
  }
  if (options.atlasName !== undefined && options.atlasName !== '') {
    file.assets = { atlases: [options.atlasName] }
  }

  const skin = (file.skins as Skin[])[0]
  const attachments = skin.attachments as Record<string, Record<string, Attachment>>
  const slots = file.slots as Slot[]
  const taken = new Set<string>()
  const slotNames: string[] = []

  // Lote 45: a camada `ossos` nunca vira desenho. Com a opção, vira
  // esqueleto; sem ela, fica de fora, com aviso.
  const useBones = options.bonesLayer === true
  const bonesLayers = useBones ? doc.layers.filter(isBonesLayer) : []
  const drawing = doc.layers.filter((layer) => !isBonesLayer(layer))
  if (!useBones && drawing.length < doc.layers.length) warnings.push(BONES_LAYER_SKIPPED)
  if (useBones && bonesLayers.length === 0) {
    warnings.push('Não há camada "ossos" neste PSD. Todo desenho ficou preso ao osso raiz, como sem a opção.')
  }
  const rig = bonesLayers.length > 0
    ? buildPsdRig(doc, bonesLayers, drawing, { rootBone: root, taken: [root] })
    : null
  if (rig !== null) {
    warnings.push(...rig.warnings)
    file.bones.push(...rig.bones)
  }

  for (let index = 0; index < drawing.length; index++) {
    const layer = drawing[index]
    const placed = rig === null ? null : rig.placements[index]
    const slotName = uniqueName(cleanName(layer.leaf), taken)
    taken.add(slotName)
    slotNames.push(slotName)

    const slot: Slot = { name: slotName, bone: placed?.bone ?? root, attachment: slotName }
    if (layer.folder !== '') slot.folder = layer.folder
    if (!layer.visible) slot.visible = false
    const blend = BLEND_MODES[layer.blendMode]
    if (blend !== undefined && blend !== 'normal') slot.blend = blend
    else if (blend === undefined) {
      const pretty = BLEND_NAMES[layer.blendMode.trim()] ?? layer.blendMode.trim()
      warnings.push(`A camada "${layer.name}" usa a mistura "${pretty}", que o formato não tem. `
        + 'Ela entrou como normal.')
    }
    slots.push(slot)

    const place = psdPlacement(doc, layer, origin)
    // Preso a um osso da camada `ossos`: o mesmo lugar da tela, medido a
    // partir do osso, e o giro dele desfeito para o desenho ficar em pé.
    const attachment: Attachment = placed == null
      ? {
        type: 'region',
        path: layer.name,
        x: place.x,
        y: place.y,
        width: place.width,
        height: place.height,
      }
      : {
        type: 'region',
        path: layer.name,
        x: placed.x,
        y: placed.y,
        ...(placed.rotation !== 0 ? { rotation: placed.rotation } : {}),
        width: place.width,
        height: place.height,
      }
    attachments[slotName] = { [slotName]: attachment }
  }

  return { file, slotNames, boneNames: rig === null ? [] : rig.bones.map((b) => b.name), warnings }
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}
