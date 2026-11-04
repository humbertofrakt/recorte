// SPDX-License-Identifier: Apache-2.0
/**
 * `.boneb` reader — decodes the binary encoding back to the `.bone` tree
 * (spec section 11).
 *
 * The reader is deliberately forgiving, because that is the whole point of the
 * format (spec 11.1, 11.9, 12.2): an unknown section tag is skipped, an unknown
 * canonical block kind is skipped, an unknown sized type tag is skipped. Only
 * things that make the file undecodable are refused: wrong magic, a newer
 * binary layout, a broken size, a reserved type tag.
 *
 * The constants below repeat the ones in `escrever.ts` on purpose. Keeping the
 * two modules free of cross-imports lets a plain `.mjs` script load either one
 * directly, without a build step.
 */

import type { BoneFile } from '../types.js';

// ---------------------------------------------------------------------------
// Constants (mirror of escrever.ts)
// ---------------------------------------------------------------------------

const MAGIC: readonly number[] = [0x89, 0x42, 0x4f, 0x4e, 0x45, 0x0d, 0x0a, 0x1a];
const SUPPORTED_LAYOUT_VERSION = 1;
const ALIGN = 16;
const HEADER_SIZE = 32;
const SECTION_ENTRY_SIZE = 24;
const MAX_TREE_DEPTH = 64;

const T_NULL = 0x00;
const T_FALSE = 0x01;
const T_TRUE = 0x02;
const T_INT = 0x03;
const T_FLOAT = 0x04;
const T_DOUBLE = 0x05;
const T_STRING = 0x06;
const T_ARRAY = 0x07;
const T_OBJECT = 0x08;
const T_F32_ARRAY = 0x09;
const T_U32_ARRAY = 0x0a;
const T_I32_ARRAY = 0x0b;
const T_U16_ARRAY = 0x0c;
const T_U8_ARRAY = 0x0d;
const T_BLOB_REF = 0x0e;
const T_INT64 = 0x0f;

const BLOB_F32 = 1;
const BLOB_U32 = 2;
const BLOB_I32 = 3;
const BLOB_U16 = 4;
const BLOB_U8 = 5;
const BLOB_TKEY = 16;
const BLOB_BIND = 17;
const BLOB_VERT = 18;

/** Value used in place of a type or block the reader does not understand. */
const UNKNOWN: unique symbol = Symbol('boneb.desconhecido');

// ---------------------------------------------------------------------------
// Errors and report
// ---------------------------------------------------------------------------

/** Structural error (L0 of spec 12.3): the bytes are not a readable `.boneb`. */
export class BonebReadError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'BonebReadError';
    this.code = code;
  }
}

/** One section as found in the file. */
export interface BonebSectionInfo {
  tag: string;
  offset: number;
  length: number;
  bytes: Uint8Array;
}

/** The fixed 32-byte header (spec 11.3). */
export interface BonebHeaderInfo {
  layoutVersion: number;
  flags: number;
  formatVersion: string;
  minVersion: string;
  sectionCount: number;
  fileSize: number;
}

/** One entry of the `INDX` section (spec 11.7). */
export interface BonebIndexEntry {
  kind: number;
  name: string;
  offset: number;
  length: number;
}

/** Everything {@link readBonebWithReport} knows about a file. */
export interface ReadBonebResult {
  value: BoneFile;
  header: BonebHeaderInfo;
  /** Sections the reader does not know, kept so a rewrite can preserve them. */
  unknownSections: BonebSectionInfo[];
  index: BonebIndexEntry[];
  /** Human readable warnings, in Portuguese. */
  warnings: string[];
}

/** Options of {@link readBoneb}. */
export interface ReadBonebOptions {
  /** Maximum accepted file size in bytes. Default 1 GiB (spec 12.6). */
  maxFileSize?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const utf8 = new TextDecoder('utf-8', { fatal: true });

function u32ToTag(value: number): string {
  let out = '';
  for (let i = 0; i < 4; i++) out += String.fromCharCode((value >>> (8 * i)) & 0xff);
  return out;
}

function fail(code: string, message: string): never {
  throw new BonebReadError(code, message);
}

interface BlobHeader {
  kind: number;
  elemCount: number;
  offset: number;
  byteLength: number;
}

// ---------------------------------------------------------------------------
// Decoder
// ---------------------------------------------------------------------------

class Decoder {
  private bytes: Uint8Array;
  private view: DataView;
  private strings: string[] = [];
  private blobHeaders: BlobHeader[] = [];
  private blobBase = 0;
  private blobCache: unknown[] = [];
  private blobDone: boolean[] = [];
  private treeEnd = 0;
  private pos = 0;
  readonly warnings: string[] = [];
  private warned = new Set<string>();

  constructor(bytes: Uint8Array) {
    this.bytes = bytes;
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  private warn(message: string): void {
    if (this.warned.has(message)) return;
    this.warned.add(message);
    this.warnings.push(message);
  }

  private f32At(at: number): number {
    const value = this.view.getFloat32(at, true);
    if (Number.isFinite(value)) return value;
    this.warn('Havia NaN ou Infinity em um número; virou 0 (12.6).');
    return 0;
  }

  // -- string table (spec 11.4) --------------------------------------------

  decodeStrings(offset: number, length: number): void {
    if (length < 8) fail('BIN_STRS', 'Seção STRS curta demais.');
    const count = this.view.getUint32(offset, true);
    const tableSize = 4 + 4 * (count + 1);
    if (count > length || tableSize > length) fail('BIN_STRS', 'Seção STRS com contagem impossível.');
    const dataStart = offset + tableSize;
    const dataLength = length - tableSize;
    const offsets = new Array<number>(count + 1);
    let previous = -1;
    for (let i = 0; i <= count; i++) {
      const value = this.view.getUint32(offset + 4 + 4 * i, true);
      if (value < previous) fail('BIN_STRS', 'Offsets de STRS fora de ordem.');
      if (value > dataLength) fail('BIN_STRS', 'Offset de STRS fora da seção.');
      offsets[i] = value;
      previous = value;
    }
    if (offsets[0] !== 0) fail('BIN_STRS', 'O primeiro offset de STRS tem que ser 0.');
    if (offsets[count] !== dataLength) fail('BIN_STRS', 'O último offset de STRS não bate com o tamanho.');
    this.strings = new Array<string>(count);
    for (let i = 0; i < count; i++) {
      const slice = this.bytes.subarray(dataStart + offsets[i]!, dataStart + offsets[i + 1]!);
      for (let k = 0; k < slice.length; k++) {
        if (slice[k] === 0) fail('BIN_STRS', 'Texto com byte NUL na tabela de strings.');
      }
      try {
        this.strings[i] = utf8.decode(slice);
      } catch {
        fail('BIN_STRS', 'Texto que não é UTF-8 válido na tabela de strings.');
      }
    }
    if (count > 0 && this.strings[0] !== '') {
      fail('BIN_STRS', 'O índice 0 da tabela de strings tem que ser o texto vazio.');
    }
  }

  private stringAt(index: number): string {
    if (index >= this.strings.length) {
      fail('BIN_STRING_INDEX', `Índice de texto ${index} fora da tabela (${this.strings.length}).`);
    }
    return this.strings[index]!;
  }

  // -- blob section (spec 11.6) --------------------------------------------

  decodeBlobHeaders(offset: number, length: number): void {
    if (length < 4) fail('BIN_BLOB', 'Seção BLOB curta demais.');
    const count = this.view.getUint32(offset, true);
    const tableSize = 4 + count * 24;
    if (count > length / 24 + 1 || tableSize > length) fail('BIN_BLOB', 'Seção BLOB com contagem impossível.');
    this.blobBase = offset;
    this.blobHeaders = new Array<BlobHeader>(count);
    for (let i = 0; i < count; i++) {
      const at = offset + 4 + i * 24;
      const kind = this.view.getUint32(at, true);
      const elemCount = this.view.getUint32(at + 4, true);
      const blobOffset = Number(this.view.getBigUint64(at + 8, true));
      const byteLength = Number(this.view.getBigUint64(at + 16, true));
      if (blobOffset % ALIGN !== 0) fail('BIN_BLOB', `Bloco ${i} não começa em múltiplo de 16.`);
      if (blobOffset + byteLength > length) fail('BIN_BLOB', `Bloco ${i} sai da seção BLOB.`);
      this.blobHeaders[i] = { kind, elemCount, offset: blobOffset, byteLength };
    }
    this.blobCache = new Array<unknown>(count);
    this.blobDone = new Array<boolean>(count).fill(false);
  }

  private numbersFromBlock(header: BlobHeader, size: number, read: (at: number) => number): number[] {
    if (header.elemCount * size > header.byteLength) {
      fail('BIN_BLOB_SIZE', 'Bloco numérico menor do que a contagem declarada.');
    }
    const base = this.blobBase + header.offset;
    const out = new Array<number>(header.elemCount);
    for (let i = 0; i < header.elemCount; i++) out[i] = read(base + i * size);
    return out;
  }

  private decodeTkey(header: BlobHeader): unknown {
    const base = this.blobBase + header.offset;
    if (header.byteLength < 12) fail('BIN_BLOB_SIZE', 'Bloco TKEY curto demais.');
    const keyCount = this.view.getUint32(base, true);
    const components = this.view.getUint32(base + 4, true);
    const nullable = this.view.getUint32(base + 8, true) !== 0;
    if (keyCount !== header.elemCount) {
      fail('BIN_BLOB_SIZE', 'Bloco TKEY com elemCount diferente de keyCount (11.5).');
    }
    if (components < 1 || components > 16) fail('BIN_BLOB_SIZE', 'Bloco TKEY com número de componentes fora de 1..16.');

    let at = 12;
    const timesAt = at;
    at += keyCount * 4;
    const valuesAt = at;
    at += keyCount * components * 4;
    const curvesAt = at;
    at += keyCount;
    at += (ALIGN - (at % ALIGN)) % ALIGN;
    const bezierCountAt = at;
    at += 4;
    if (at > header.byteLength) fail('BIN_BLOB_SIZE', 'Bloco TKEY menor do que o layout de 11.6.');
    const bezierCount = this.view.getUint32(base + bezierCountAt, true);
    const bezierAt = at;
    if (bezierAt + bezierCount * 4 * components * 4 > header.byteLength) {
      fail('BIN_BLOB_SIZE', 'Bloco TKEY com curvas Bézier fora do tamanho declarado.');
    }

    const keys: Record<string, unknown>[] = new Array(keyCount);
    let bezierUsed = 0;
    for (let i = 0; i < keyCount; i++) {
      const key: Record<string, unknown> = { time: this.f32At(base + timesAt + i * 4) };
      const first = this.view.getFloat32(base + valuesAt + i * components * 4, true);
      if (nullable && Number.isNaN(first)) {
        key['value'] = null;
      } else if (components === 1) {
        key['value'] = this.f32At(base + valuesAt + i * 4);
      } else {
        const value = new Array<number>(components);
        for (let c = 0; c < components; c++) {
          value[c] = this.f32At(base + valuesAt + (i * components + c) * 4);
        }
        key['value'] = value;
      }
      const type = this.view.getUint8(base + curvesAt + i);
      if (type === 1) {
        key['curve'] = 'stepped';
      } else if (type === 2) {
        if (bezierUsed >= bezierCount) {
          this.warn('Bloco TKEY com menos curvas Bézier do que chaves marcadas; usando linear.');
        } else {
          const curve = new Array<number>(4 * components);
          for (let c = 0; c < 4 * components; c++) {
            curve[c] = this.f32At(base + bezierAt + (bezierUsed * 4 * components + c) * 4);
          }
          key['curve'] = curve;
          bezierUsed += 1;
        }
      }
      keys[i] = key;
    }
    return keys;
  }

  private decodeBind(header: BlobHeader): unknown {
    const base = this.blobBase + header.offset;
    if (header.byteLength < 8) fail('BIN_BLOB_SIZE', 'Bloco BIND curto demais.');
    const vertexCount = this.view.getUint32(base, true);
    const total = this.view.getUint32(base + 4, true);
    if (vertexCount !== header.elemCount) {
      fail('BIN_BLOB_SIZE', 'Bloco BIND com elemCount diferente de vertexCount (11.5).');
    }
    let at = 8;
    const countsAt = at;
    at += vertexCount * 4;
    const bonesAt = at;
    at += total * 4;
    at += (ALIGN - (at % ALIGN)) % ALIGN;
    const positionsAt = at;
    at += total * 8;
    const weightsAt = at;
    at += total * 4;
    if (at > header.byteLength) fail('BIN_BLOB_SIZE', 'Bloco BIND menor do que o layout de 11.6.');

    const counts = new Array<number>(vertexCount);
    for (let i = 0; i < vertexCount; i++) counts[i] = this.view.getUint32(base + countsAt + i * 4, true);
    const bones = new Array<number>(total);
    for (let i = 0; i < total; i++) bones[i] = this.view.getUint32(base + bonesAt + i * 4, true);
    const positions = new Array<number>(total * 2);
    for (let i = 0; i < total * 2; i++) positions[i] = this.f32At(base + positionsAt + i * 4);
    const weights = new Array<number>(total);
    for (let i = 0; i < total; i++) weights[i] = this.f32At(base + weightsAt + i * 4);
    return { counts, bones, positions, weights };
  }

  private blob(index: number): unknown {
    if (index >= this.blobHeaders.length) {
      fail('BIN_BLOB_INDEX', `Referência a bloco ${index}, mas há ${this.blobHeaders.length} blocos.`);
    }
    if (this.blobDone[index]) return this.blobCache[index];
    const header = this.blobHeaders[index]!;
    let value: unknown;
    switch (header.kind) {
      case BLOB_F32:
      case BLOB_VERT:
        value = this.numbersFromBlock(header, 4, (at) => this.f32At(at));
        break;
      case BLOB_U32:
        value = this.numbersFromBlock(header, 4, (at) => this.view.getUint32(at, true));
        break;
      case BLOB_I32:
        value = this.numbersFromBlock(header, 4, (at) => this.view.getInt32(at, true));
        break;
      case BLOB_U16:
        value = this.numbersFromBlock(header, 2, (at) => this.view.getUint16(at, true));
        break;
      case BLOB_U8:
        value = this.numbersFromBlock(header, 1, (at) => this.view.getUint8(at));
        break;
      case BLOB_TKEY:
        value = this.decodeTkey(header);
        break;
      case BLOB_BIND:
        value = this.decodeBind(header);
        break;
      default:
        this.warn(`Bloco de tipo ${header.kind} é desconhecido; foi pulado (11.6).`);
        value = UNKNOWN;
    }
    this.blobCache[index] = value;
    this.blobDone[index] = true;
    return value;
  }

  // -- tree (spec 11.5) -----------------------------------------------------

  private need(count: number): void {
    if (this.pos + count > this.treeEnd) {
      fail('BIN_TREE_TRUNCATED', 'A seção TREE acaba no meio de um valor.');
    }
  }

  private countFits(count: number, size: number): void {
    if (count * size > this.treeEnd - this.pos) {
      fail('BIN_TREE_COUNT', 'Contagem maior do que o resto da seção TREE.');
    }
  }

  private readValue(depth: number): unknown {
    if (depth > MAX_TREE_DEPTH) fail('LIMIT_DEPTH', `Árvore com mais de ${MAX_TREE_DEPTH} níveis (12.6).`);
    this.need(1);
    const type = this.view.getUint8(this.pos);
    this.pos += 1;

    switch (type) {
      case T_NULL: return null;
      case T_FALSE: return false;
      case T_TRUE: return true;
      case T_INT: {
        this.need(4);
        const value = this.view.getInt32(this.pos, true);
        this.pos += 4;
        return value;
      }
      case T_FLOAT: {
        this.need(4);
        const value = this.f32At(this.pos);
        this.pos += 4;
        return value;
      }
      case T_DOUBLE: {
        this.need(8);
        const value = this.view.getFloat64(this.pos, true);
        this.pos += 8;
        if (!Number.isFinite(value)) {
          this.warn('Havia NaN ou Infinity em um número; virou 0 (12.6).');
          return 0;
        }
        return value;
      }
      case T_INT64: {
        this.need(8);
        const value = this.view.getBigInt64(this.pos, true);
        this.pos += 8;
        const asNumber = Number(value);
        if (!Number.isSafeInteger(asNumber)) {
          this.warn('Inteiro de 64 bits grande demais para um número JSON; foi arredondado.');
        }
        return asNumber;
      }
      case T_STRING: {
        this.need(4);
        const index = this.view.getUint32(this.pos, true);
        this.pos += 4;
        return this.stringAt(index);
      }
      case T_ARRAY: {
        this.need(4);
        const count = this.view.getUint32(this.pos, true);
        this.pos += 4;
        this.countFits(count, 1);
        const out = new Array<unknown>(count);
        for (let i = 0; i < count; i++) {
          const value = this.readValue(depth + 1);
          out[i] = value === UNKNOWN ? null : value;
        }
        return out;
      }
      case T_OBJECT: {
        this.need(4);
        const count = this.view.getUint32(this.pos, true);
        this.pos += 4;
        this.countFits(count, 5);
        const out: Record<string, unknown> = {};
        for (let i = 0; i < count; i++) {
          this.need(4);
          const keyIndex = this.view.getUint32(this.pos, true);
          this.pos += 4;
          const key = this.stringAt(keyIndex);
          const value = this.readValue(depth + 1);
          if (value === UNKNOWN) {
            this.warn(`A propriedade "${key}" usa um tipo desconhecido e foi pulada (11.9).`);
            continue;
          }
          out[key] = value;
        }
        return out;
      }
      case T_F32_ARRAY: return this.typedArray(4, (at) => this.f32At(at));
      case T_U32_ARRAY: return this.typedArray(4, (at) => this.view.getUint32(at, true));
      case T_I32_ARRAY: return this.typedArray(4, (at) => this.view.getInt32(at, true));
      case T_U16_ARRAY: return this.typedArray(2, (at) => this.view.getUint16(at, true));
      case T_U8_ARRAY: return this.typedArray(1, (at) => this.view.getUint8(at));
      case T_BLOB_REF: {
        this.need(4);
        const index = this.view.getUint32(this.pos, true);
        this.pos += 4;
        if (this.blobHeaders.length === 0) {
          fail('BIN_BLOB_INDEX', 'A árvore cita um bloco, mas o arquivo não tem seção BLOB (11.5).');
        }
        return this.blob(index);
      }
      default:
        if (type >= 0x10 && type <= 0x1f) {
          fail('BIN_TREE_TYPE_RESERVED', `Tipo 0x${type.toString(16)} é reservado: o arquivo usa um layout mais novo (11.5).`);
        }
        // 0x20..0xFF: future types carry their own size, so they can be skipped.
        this.need(4);
        {
          const byteLength = this.view.getUint32(this.pos, true);
          this.pos += 4;
          this.need(byteLength);
          this.pos += byteLength;
        }
        this.warn(`Valor de tipo 0x${type.toString(16)} é desconhecido e foi pulado (11.5).`);
        return UNKNOWN;
    }
  }

  private typedArray(size: number, read: (at: number) => number): number[] {
    this.need(4);
    const count = this.view.getUint32(this.pos, true);
    this.pos += 4;
    this.countFits(count, size);
    const out = new Array<number>(count);
    for (let i = 0; i < count; i++) out[i] = read(this.pos + i * size);
    this.pos += count * size;
    return out;
  }

  decodeTree(offset: number, length: number): Record<string, unknown> {
    this.pos = offset;
    this.treeEnd = offset + length;
    this.need(1);
    if (this.view.getUint8(this.pos) !== T_OBJECT) {
      fail('BIN_ROOT_TYPE', 'O valor raiz da seção TREE tem que ser um objeto (11.5).');
    }
    const value = this.readValue(0);
    return value as Record<string, unknown>;
  }

  decodeIndex(offset: number, length: number): BonebIndexEntry[] {
    if (length < 4) return [];
    const count = this.view.getUint32(offset, true);
    if (4 + count * 24 > length) {
      this.warn('Seção INDX com contagem impossível; foi ignorada.');
      return [];
    }
    const out: BonebIndexEntry[] = [];
    for (let i = 0; i < count; i++) {
      const at = offset + 4 + i * 24;
      out.push({
        kind: this.view.getUint32(at, true),
        name: this.stringAt(this.view.getUint32(at + 4, true)),
        offset: Number(this.view.getBigUint64(at + 8, true)),
        length: Number(this.view.getBigUint64(at + 16, true)),
      });
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Decodes `.boneb` bytes back to the `.bone` tree (spec section 11). */
export function readBoneb(bytes: Uint8Array, options: ReadBonebOptions = {}): BoneFile {
  return readBonebWithReport(bytes, options).value;
}

/** Same as {@link readBoneb} but also returns header, index and warnings. */
export function readBonebWithReport(
  bytes: Uint8Array,
  options: ReadBonebOptions = {},
): ReadBonebResult {
  const maxFileSize = options.maxFileSize ?? 1024 * 1024 * 1024;
  if (bytes.length < HEADER_SIZE) fail('BIN_MAGIC', 'Arquivo curto demais para ser um .boneb.');
  for (let i = 0; i < MAGIC.length; i++) {
    if (bytes[i] !== MAGIC[i]) fail('BIN_MAGIC', 'Assinatura do arquivo não é .boneb (11.3).');
  }
  if (bytes.length > maxFileSize) {
    fail('LIMIT_FILE_SIZE', `Arquivo com ${bytes.length} bytes, acima do limite de ${maxFileSize} (12.6).`);
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const layoutVersion = view.getUint16(8, true);
  if (layoutVersion > SUPPORTED_LAYOUT_VERSION) {
    fail(
      'BIN_LAYOUT_VERSION',
      `Layout binário ${layoutVersion}; este leitor entende até ${SUPPORTED_LAYOUT_VERSION} (11.3).`,
    );
  }
  const flags = view.getUint16(10, true);
  const formatMajor = view.getUint16(12, true);
  const formatMinor = view.getUint16(14, true);
  const minMajor = view.getUint16(16, true);
  const minMinor = view.getUint16(18, true);
  const sectionCount = view.getUint32(20, true);
  const fileSize = Number(view.getBigUint64(24, true));

  if (fileSize !== bytes.length) {
    fail('BIN_FILE_SIZE', `O cabeçalho diz ${fileSize} bytes, mas o arquivo tem ${bytes.length} (11.3).`);
  }
  const tableEnd = HEADER_SIZE + sectionCount * SECTION_ENTRY_SIZE;
  if (sectionCount > (bytes.length - HEADER_SIZE) / SECTION_ENTRY_SIZE || tableEnd > bytes.length) {
    fail('BIN_SECTION_TABLE', 'Tabela de seções não cabe no arquivo (11.4).');
  }

  const sections: BonebSectionInfo[] = [];
  const seen = new Set<string>();
  const ranges: [number, number][] = [];
  for (let i = 0; i < sectionCount; i++) {
    const at = HEADER_SIZE + i * SECTION_ENTRY_SIZE;
    const tag = u32ToTag(view.getUint32(at, true));
    const offset = Number(view.getBigUint64(at + 8, true));
    const length = Number(view.getBigUint64(at + 16, true));
    if (offset % ALIGN !== 0) fail('BIN_SECTION_ALIGN', `Seção "${tag}" não começa em múltiplo de 16 (11.2).`);
    if (offset < tableEnd || offset + length > fileSize) {
      fail('BIN_SECTION_RANGE', `Seção "${tag}" sai do arquivo (11.4).`);
    }
    if (seen.has(tag)) fail('BIN_SECTION_DUPLICATE', `Seção "${tag}" aparece duas vezes (11.4).`);
    seen.add(tag);
    for (const [start, end] of ranges) {
      if (offset < end && start < offset + length) {
        fail('BIN_SECTION_OVERLAP', `Seção "${tag}" se sobrepõe a outra (11.4).`);
      }
    }
    if (length > 0) ranges.push([offset, offset + length]);
    sections.push({ tag, offset, length, bytes: bytes.subarray(offset, offset + length) });
  }

  const find = (tag: string): BonebSectionInfo | undefined => sections.find((s) => s.tag === tag);
  const strs = find('STRS');
  const tree = find('TREE');
  if (!strs) fail('BIN_SECTION_MISSING', 'Falta a seção STRS, que é obrigatória (11.4).');
  if (!tree) fail('BIN_SECTION_MISSING', 'Falta a seção TREE, que é obrigatória (11.4).');

  const decoder = new Decoder(bytes);
  decoder.decodeStrings(strs.offset, strs.length);
  const blob = find('BLOB');
  if (blob) decoder.decodeBlobHeaders(blob.offset, blob.length);
  const value = decoder.decodeTree(tree.offset, tree.length);

  const indexSection = find('INDX');
  const index = indexSection ? decoder.decodeIndex(indexSection.offset, indexSection.length) : [];
  if (indexSection && (flags & 1) === 0) {
    decoder.warnings.push('O cabeçalho não marca o bit de INDX, mas a seção existe (11.3).');
  }

  const known = new Set(['STRS', 'TREE', 'BLOB', 'INDX', 'JSON']);
  const unknownSections = sections.filter((section) => !known.has(section.tag));
  for (const section of unknownSections) {
    decoder.warnings.push(`Seção "${section.tag}" é desconhecida; foi pulada e preservada (11.4).`);
  }

  const header = isRecord(value['bone']) ? value['bone'] : undefined;
  const headerVersion = `${formatMajor}.${formatMinor}`;
  if (header && typeof header['version'] === 'string' && header['version'] !== headerVersion) {
    decoder.warnings.push(
      `O cabeçalho binário diz versão ${headerVersion} e a árvore diz ${header['version']}; vale a árvore (11.3).`,
    );
  }

  return {
    value: value as unknown as BoneFile,
    header: {
      layoutVersion,
      flags,
      formatVersion: headerVersion,
      minVersion: `${minMajor}.${minMinor}`,
      sectionCount,
      fileSize,
    },
    unknownSections,
    index,
    warnings: decoder.warnings,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
