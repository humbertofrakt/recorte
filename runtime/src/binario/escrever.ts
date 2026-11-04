// SPDX-License-Identifier: Apache-2.0
/**
 * `.boneb` writer — the binary encoding of the `.bone` tree (spec section 11).
 *
 * The binary file is NOT a fixed per-object layout. It is the very same JSON
 * tree, encoded compactly and self-describingly: property names go through a
 * string table, every value carries a type tag, and homogeneous numeric arrays
 * become contiguous blocks. A reader that does not know a type or a block kind
 * skips it, exactly like an unknown JSON property (spec 11.1).
 *
 * Layout produced here:
 *
 *   header (32 bytes) | section table (24 bytes each) | STRS | TREE | BLOB? | INDX?
 *
 * Every section starts at a multiple of 16 bytes, everything is little-endian
 * and floats are IEEE-754 binary32 (spec 11.2).
 *
 * This module is deliberately self-contained: no runtime import that survives
 * type erasure, so plain Node can load it straight from a `.mjs` script.
 */

import type { BoneFile } from '../types.js';

// ---------------------------------------------------------------------------
// Constants (spec 11.2, 11.3, 11.5, 11.6)
// ---------------------------------------------------------------------------

/** `\x89BONE\r\n\x1a` — the PNG trick: catches text-mode transfers. */
export const BONEB_MAGIC: readonly number[] = [0x89, 0x42, 0x4f, 0x4e, 0x45, 0x0d, 0x0a, 0x1a];

/** Version of THIS binary layout, independent of the format version. */
export const BONEB_LAYOUT_VERSION = 1;

/** Every section and every block starts at a multiple of this. */
export const BONEB_ALIGN = 16;

/** Header flag bit 0: the file carries an `INDX` section. */
export const BONEB_FLAG_INDEX = 1;

/** Tree value type tags (spec 11.5). */
export const T_NULL = 0x00;
export const T_FALSE = 0x01;
export const T_TRUE = 0x02;
export const T_INT = 0x03;
export const T_FLOAT = 0x04;
export const T_DOUBLE = 0x05;
export const T_STRING = 0x06;
export const T_ARRAY = 0x07;
export const T_OBJECT = 0x08;
export const T_F32_ARRAY = 0x09;
export const T_U32_ARRAY = 0x0a;
export const T_I32_ARRAY = 0x0b;
export const T_U16_ARRAY = 0x0c;
export const T_U8_ARRAY = 0x0d;
export const T_BLOB_REF = 0x0e;
export const T_INT64 = 0x0f;

/** Canonical block kinds of the `BLOB` section (spec 11.6). */
export const BLOB_F32 = 1;
export const BLOB_U32 = 2;
export const BLOB_I32 = 3;
export const BLOB_U16 = 4;
export const BLOB_U8 = 5;
export const BLOB_TKEY = 16;
export const BLOB_BIND = 17;
export const BLOB_VERT = 18;

/** `INDX` entry kinds (spec 11.7). */
export const INDX_ANIMATION = 1;
export const INDX_SKIN = 2;
export const INDX_EXTENSION = 3;

/** Maximum tree depth (spec 11.5, 12.6). */
export const MAX_TREE_DEPTH = 64;

/**
 * Property names whose numbers the specification declares `integer`
 * (spec 11.5, "Regras do gravador"). Everything else becomes `f32`.
 *
 * `bones` is here only inside a `binding` object (7.4); the atlas-only names
 * are added when writing an `.atlas.json` tree.
 */
const INTEGER_KEYS: ReadonlySet<string> = new Set([
  'triangles', 'hull', 'edges', 'counts', 'page', 'count', 'start', 'digits',
  'setup', 'index', 'offset', 'int',
]);

/** Extra integer names that only apply to an atlas tree (spec 10.3). */
const ATLAS_INTEGER_KEYS: ReadonlySet<string> = new Set([
  'x', 'y', 'width', 'height', 'offsetX', 'offsetY', 'originalWidth', 'originalHeight',
]);

const I32_MIN = -2147483648;
const I32_MAX = 2147483647;
const U32_MAX = 4294967295;

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

/** Error carrying a stable code, like the validator messages of spec 12.3. */
export class BonebWriteError extends Error {
  code: string;
  pointer: string;
  constructor(code: string, message: string, pointer = '') {
    super(message);
    this.name = 'BonebWriteError';
    this.code = code;
    this.pointer = pointer;
  }
}

// ---------------------------------------------------------------------------
// Byte writer
// ---------------------------------------------------------------------------

/** Growable little-endian byte buffer. */
export class ByteWriter {
  private buf: Uint8Array;
  private view: DataView;
  /** Bytes written so far. */
  length = 0;

  constructor(capacity = 4096) {
    this.buf = new Uint8Array(Math.max(16, capacity));
    this.view = new DataView(this.buf.buffer);
  }

  private ensure(extra: number): void {
    const need = this.length + extra;
    if (need <= this.buf.length) return;
    let size = this.buf.length * 2;
    while (size < need) size *= 2;
    const next = new Uint8Array(size);
    next.set(this.buf.subarray(0, this.length));
    this.buf = next;
    this.view = new DataView(next.buffer);
  }

  u8(value: number): void {
    this.ensure(1);
    this.view.setUint8(this.length, value & 0xff);
    this.length += 1;
  }

  u16(value: number): void {
    this.ensure(2);
    this.view.setUint16(this.length, value & 0xffff, true);
    this.length += 2;
  }

  u32(value: number): void {
    this.ensure(4);
    this.view.setUint32(this.length, value >>> 0, true);
    this.length += 4;
  }

  i32(value: number): void {
    this.ensure(4);
    this.view.setInt32(this.length, value | 0, true);
    this.length += 4;
  }

  f32(value: number): void {
    this.ensure(4);
    this.view.setFloat32(this.length, value, true);
    this.length += 4;
  }

  f64(value: number): void {
    this.ensure(8);
    this.view.setFloat64(this.length, value, true);
    this.length += 8;
  }

  u64(value: number | bigint): void {
    this.ensure(8);
    this.view.setBigUint64(this.length, BigInt(value), true);
    this.length += 8;
  }

  /** Writes the raw NaN pattern used by `TKEY` for a `null` value. */
  nanF32(): void {
    this.ensure(4);
    this.view.setUint32(this.length, 0xffffffff, true);
    this.length += 4;
  }

  bytes(data: Uint8Array): void {
    this.ensure(data.length);
    this.buf.set(data, this.length);
    this.length += data.length;
  }

  /** Zero padding until `length` is a multiple of `align`. */
  pad(align: number): void {
    const rest = this.length % align;
    if (rest === 0) return;
    const missing = align - rest;
    this.ensure(missing);
    this.buf.fill(0, this.length, this.length + missing);
    this.length += missing;
  }

  toBytes(): Uint8Array {
    return this.buf.slice(0, this.length);
  }
}

// ---------------------------------------------------------------------------
// String table (`STRS`, spec 11.4)
// ---------------------------------------------------------------------------

const encoder = new TextEncoder();

/** Deduplicating UTF-8 string table. Index 0 is always the empty string. */
export class StringTable {
  private index = new Map<string, number>();
  private items: Uint8Array[] = [];

  constructor() {
    this.intern('');
  }

  get count(): number {
    return this.items.length;
  }

  intern(value: string): number {
    const found = this.index.get(value);
    if (found !== undefined) return found;
    const bytes = encoder.encode(value);
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] === 0) {
        throw new BonebWriteError('BIN_STRING_NUL', 'Texto com byte NUL não pode ser gravado.');
      }
    }
    if (bytes.length > 1024 * 1024) {
      throw new BonebWriteError('LIMIT_STRING', 'Texto acima de 1 MiB (limite de 12.6).');
    }
    const at = this.items.length;
    this.items.push(bytes);
    this.index.set(value, at);
    return at;
  }

  /** Serialises the section: `u32 count`, `u32 offsets[count+1]`, bytes. */
  encode(): Uint8Array {
    const w = new ByteWriter(4 + 4 * (this.items.length + 1) + 64);
    w.u32(this.items.length);
    let offset = 0;
    for (const item of this.items) {
      w.u32(offset);
      offset += item.length;
    }
    w.u32(offset);
    for (const item of this.items) w.bytes(item);
    return w.toBytes();
  }
}

// ---------------------------------------------------------------------------
// Blob table (`BLOB`, spec 11.6)
// ---------------------------------------------------------------------------

interface BlobRecord {
  kind: number;
  elemCount: number;
  bytes: Uint8Array;
}

/** Collects canonical blocks and lays them out 16-byte aligned. */
export class BlobTable {
  private records: BlobRecord[] = [];

  get count(): number {
    return this.records.length;
  }

  add(kind: number, elemCount: number, bytes: Uint8Array): number {
    const at = this.records.length;
    this.records.push({ kind, elemCount, bytes });
    return at;
  }

  encode(): Uint8Array {
    const n = this.records.length;
    const headerSize = 4 + n * 24;
    let cursor = headerSize + ((BONEB_ALIGN - (headerSize % BONEB_ALIGN)) % BONEB_ALIGN);
    const offsets: number[] = [];
    for (const record of this.records) {
      offsets.push(cursor);
      cursor += record.bytes.length;
      cursor += (BONEB_ALIGN - (cursor % BONEB_ALIGN)) % BONEB_ALIGN;
    }
    const w = new ByteWriter(cursor + 16);
    w.u32(n);
    for (let i = 0; i < n; i++) {
      const record = this.records[i]!;
      w.u32(record.kind);
      w.u32(record.elemCount);
      w.u64(offsets[i]!);
      w.u64(record.bytes.length);
    }
    for (let i = 0; i < n; i++) {
      w.pad(BONEB_ALIGN);
      w.bytes(this.records[i]!.bytes);
    }
    return w.toBytes();
  }
}

// ---------------------------------------------------------------------------
// Canonical blocks: TKEY and BIND (spec 11.6)
// ---------------------------------------------------------------------------

/** Property names a `TKEY` key may carry. Anything else keeps the plain tree. */
const TKEY_ALLOWED_KEYS: ReadonlySet<string> = new Set(['time', 'value', 'curve']);

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Builds a `TKEY` block for a timeline `keys` array, or returns `null` when the
 * array does not qualify and must stay in the tree (spec 11.5).
 *
 * Disqualifying: any property beyond `time`/`value`/`curve`, a non numeric
 * value, a mixed component count, a `null` value outside the 3-component
 * (`darkColor`) case, or an explicit `"linear"` curve string. The last one is
 * refused on purpose: `TKEY` has no way to tell "curve absent" from
 * "curve written as linear", and the round trip of 11.1 must be exact.
 */
function buildTkeyBlock(keys: readonly unknown[]): { bytes: Uint8Array; elemCount: number } | null {
  const n = keys.length;
  if (n === 0) return null;

  const times = new Array<number>(n);
  const curveTypes = new Array<number>(n);
  const values: (number[] | null)[] = new Array(n);
  const beziers: number[][] = [];
  let components = -1;
  let nullable = false;

  for (let i = 0; i < n; i++) {
    const key = keys[i];
    if (!isPlainObject(key)) return null;
    for (const name of Object.keys(key)) {
      if (!TKEY_ALLOWED_KEYS.has(name)) return null;
    }
    const time = key['time'];
    if (!isFiniteNumber(time)) return null;
    times[i] = time;

    const raw = key['value'];
    if (raw === null) {
      nullable = true;
      values[i] = null;
    } else if (isFiniteNumber(raw)) {
      if (components === -1) components = 1;
      else if (components !== 1) return null;
      values[i] = [raw];
    } else if (Array.isArray(raw) && (raw.length === 3 || raw.length === 4)) {
      for (const item of raw) if (!isFiniteNumber(item)) return null;
      if (components === -1) components = raw.length;
      else if (components !== raw.length) return null;
      values[i] = raw.slice() as number[];
    } else {
      return null;
    }

    const curve = key['curve'];
    if (curve === undefined) {
      curveTypes[i] = 0;
    } else if (curve === 'stepped') {
      curveTypes[i] = 1;
    } else if (Array.isArray(curve)) {
      for (const item of curve) if (!isFiniteNumber(item)) return null;
      curveTypes[i] = 2;
      beziers.push(curve as number[]);
    } else {
      return null;
    }
  }

  if (components === -1) return null;
  // `nullable` only exists for `darkColor`, which has 3 components (spec 11.6).
  if (nullable && components !== 3) return null;
  for (const bezier of beziers) {
    if (bezier.length !== 4 * components) return null;
  }

  const w = new ByteWriter(64 + n * (4 + 4 * components + 1) + beziers.length * 16 * components);
  w.u32(n);
  w.u32(components);
  w.u32(nullable ? 1 : 0);
  for (let i = 0; i < n; i++) w.f32(times[i]!);
  for (let i = 0; i < n; i++) {
    const value = values[i];
    if (value === null) {
      for (let c = 0; c < components; c++) w.nanF32();
    } else {
      for (let c = 0; c < components; c++) w.f32(value![c]!);
    }
  }
  for (let i = 0; i < n; i++) w.u8(curveTypes[i]!);
  w.pad(BONEB_ALIGN);
  w.u32(beziers.length);
  for (const bezier of beziers) {
    for (const item of bezier) w.f32(item);
  }
  return { bytes: w.toBytes(), elemCount: n };
}

/** Property names a `binding` object may carry to qualify for `BIND`. */
const BIND_KEYS: readonly string[] = ['counts', 'bones', 'positions', 'weights'];

/**
 * Builds a `BIND` block for a `binding` object (spec 7.4, 11.6), or returns
 * `null` when the object carries anything else or the sizes do not add up.
 */
function buildBindBlock(binding: Record<string, unknown>): { bytes: Uint8Array; elemCount: number } | null {
  const names = Object.keys(binding);
  if (names.length !== BIND_KEYS.length) return null;
  for (const name of names) if (!BIND_KEYS.includes(name)) return null;

  const counts = binding['counts'];
  const bones = binding['bones'];
  const positions = binding['positions'];
  const weights = binding['weights'];
  if (!Array.isArray(counts) || !Array.isArray(bones)) return null;
  if (!Array.isArray(positions) || !Array.isArray(weights)) return null;

  const n = counts.length;
  let total = 0;
  for (const item of counts) {
    if (!Number.isInteger(item) || (item as number) < 0 || (item as number) > U32_MAX) return null;
    total += item as number;
  }
  if (bones.length !== total) return null;
  if (weights.length !== total) return null;
  if (positions.length !== 2 * total) return null;
  for (const item of bones) {
    if (!Number.isInteger(item) || (item as number) < 0 || (item as number) > U32_MAX) return null;
  }
  for (const item of positions) if (!isFiniteNumber(item)) return null;
  for (const item of weights) if (!isFiniteNumber(item)) return null;

  const w = new ByteWriter(64 + n * 4 + total * 4 + total * 12);
  w.u32(n);
  w.u32(total);
  for (const item of counts) w.u32(item as number);
  for (const item of bones) w.u32(item as number);
  w.pad(BONEB_ALIGN);
  for (const item of positions) w.f32(item as number);
  for (const item of weights) w.f32(item as number);
  return { bytes: w.toBytes(), elemCount: n };
}

// ---------------------------------------------------------------------------
// Tree encoder (`TREE`, spec 11.5)
// ---------------------------------------------------------------------------

/** One entry of the lazy-loading index (spec 11.7). */
interface IndexEntry {
  kind: number;
  name: number;
  offset: number;
  length: number;
}

/** Options of {@link writeBoneb}. */
export interface WriteBonebOptions {
  /** Write the `INDX` section for lazy loading. Default `true`. */
  index?: boolean;
  /** Embed a `JSON` copy of the tree. Default `false`. */
  json?: boolean;
  /** Use canonical blocks (`TKEY`, `BIND`, `VERT`). Default `true`. */
  blocks?: boolean;
  /** Minimum element count before a canonical block is used. Default `64`. */
  blockThreshold?: number;
  /** Unknown sections preserved from a file read earlier (spec 11.4). */
  extraSections?: readonly BonebSection[];
  /** Treat the tree as an `.atlas.json` (extra integer names of spec 10.3). */
  atlas?: boolean;
}

/** A raw section, used to carry unknown sections through a round trip. */
export interface BonebSection {
  tag: string;
  bytes: Uint8Array;
}

/** Result of {@link writeBonebWithReport}. */
export interface WriteBonebResult {
  bytes: Uint8Array;
  /** Human readable warnings, in Portuguese. */
  warnings: string[];
}

class TreeEncoder {
  readonly writer = new ByteWriter(8192);
  readonly warnings: string[] = [];
  private strings: StringTable;
  private blobs: BlobTable;
  private atlas: boolean;
  private blocks: boolean;
  private threshold: number;

  constructor(strings: StringTable, blobs: BlobTable, options: WriteBonebOptions) {
    this.strings = strings;
    this.blobs = blobs;
    this.atlas = options.atlas === true;
    this.blocks = options.blocks !== false;
    this.threshold = options.blockThreshold ?? 64;
  }

  private isIntegerKey(key: string | null, parentIsBinding: boolean): boolean {
    if (key === null) return false;
    if (INTEGER_KEYS.has(key)) return true;
    if (parentIsBinding && key === 'bones') return true;
    if (this.atlas && ATLAS_INTEGER_KEYS.has(key)) return true;
    return false;
  }

  private checkFloat32(value: number, key: string | null): void {
    if (value === 0) return;
    const near = Math.fround(value);
    if (near === value) return;
    if (!Number.isFinite(near) || Math.abs(near - value) / Math.abs(value) > 1e-5) {
      const where = key === null ? 'um valor' : `"${key}"`;
      this.warnings.push(`Perda de precisão em ${where}: ${value} não cabe em float de 32 bits.`);
    }
  }

  private number(value: number, key: string | null, parentIsBinding: boolean): void {
    if (!Number.isFinite(value)) {
      throw new BonebWriteError('RANGE_NOT_FINITE', 'NaN e Infinity não são valores válidos (2.1).');
    }
    if (this.isIntegerKey(key, parentIsBinding) && Number.isInteger(value)
      && value >= I32_MIN && value <= I32_MAX) {
      this.writer.u8(T_INT);
      this.writer.i32(value);
      return;
    }
    this.checkFloat32(value, key);
    this.writer.u8(T_FLOAT);
    this.writer.f32(value);
  }

  /** Picks the tightest typed-array tag for a homogeneous numeric array. */
  private numericArrayTag(items: readonly number[], integerKey: boolean): number {
    if (!integerKey) return T_F32_ARRAY;
    let min = Infinity;
    let max = -Infinity;
    for (const item of items) {
      if (!Number.isInteger(item)) return T_F32_ARRAY;
      if (item < min) min = item;
      if (item > max) max = item;
    }
    if (min >= 0) {
      if (max <= 255) return T_U8_ARRAY;
      if (max <= 65535) return T_U16_ARRAY;
      if (max <= U32_MAX) return T_U32_ARRAY;
      return T_F32_ARRAY;
    }
    if (min >= I32_MIN && max <= I32_MAX) return T_I32_ARRAY;
    return T_F32_ARRAY;
  }

  private array(items: readonly unknown[], key: string | null, parentIsBinding: boolean, depth: number): void {
    const w = this.writer;

    if (this.blocks && key === 'keys' && items.length >= this.threshold) {
      const block = buildTkeyBlock(items);
      if (block) {
        w.u8(T_BLOB_REF);
        w.u32(this.blobs.add(BLOB_TKEY, block.elemCount, block.bytes));
        return;
      }
    }

    let allNumbers = items.length > 0;
    for (const item of items) {
      if (!isFiniteNumber(item)) { allNumbers = false; break; }
    }

    if (allNumbers) {
      const numbers = items as readonly number[];
      const integerKey = this.isIntegerKey(key, parentIsBinding);
      if (this.blocks && key === 'vertices' && !integerKey && numbers.length >= this.threshold) {
        const block = new ByteWriter(numbers.length * 4);
        for (const item of numbers) block.f32(item);
        w.u8(T_BLOB_REF);
        w.u32(this.blobs.add(BLOB_VERT, numbers.length, block.toBytes()));
        return;
      }
      const tag = this.numericArrayTag(numbers, integerKey);
      w.u8(tag);
      w.u32(numbers.length);
      if (tag === T_F32_ARRAY) {
        for (const item of numbers) { this.checkFloat32(item, key); w.f32(item); }
      } else if (tag === T_U32_ARRAY) {
        for (const item of numbers) w.u32(item);
      } else if (tag === T_I32_ARRAY) {
        for (const item of numbers) w.i32(item);
      } else if (tag === T_U16_ARRAY) {
        for (const item of numbers) w.u16(item);
      } else {
        for (const item of numbers) w.u8(item);
      }
      return;
    }

    w.u8(T_ARRAY);
    w.u32(items.length);
    for (const item of items) this.value(item, null, false, depth + 1);
  }

  private object(value: Record<string, unknown>, key: string | null, depth: number): void {
    const w = this.writer;

    if (this.blocks && key === 'binding') {
      const counts = value['counts'];
      const total = Array.isArray(counts)
        ? (counts as number[]).reduce((sum, item) => sum + (typeof item === 'number' ? item : 0), 0)
        : 0;
      if (total >= this.threshold) {
        const block = buildBindBlock(value);
        if (block) {
          w.u8(T_BLOB_REF);
          w.u32(this.blobs.add(BLOB_BIND, block.elemCount, block.bytes));
          return;
        }
      }
    }

    const names: string[] = [];
    for (const name of Object.keys(value)) {
      if (value[name] === undefined) continue;
      names.push(name);
    }
    const isBinding = BIND_KEYS.every((name) => name in value);
    w.u8(T_OBJECT);
    w.u32(names.length);
    for (const name of names) {
      w.u32(this.strings.intern(name));
      this.value(value[name], name, isBinding, depth + 1);
    }
  }

  value(value: unknown, key: string | null, parentIsBinding: boolean, depth: number): void {
    if (depth > MAX_TREE_DEPTH) {
      throw new BonebWriteError('LIMIT_DEPTH', `Árvore com mais de ${MAX_TREE_DEPTH} níveis (12.6).`);
    }
    const w = this.writer;
    if (value === null || value === undefined) { w.u8(T_NULL); return; }
    switch (typeof value) {
      case 'boolean':
        w.u8(value ? T_TRUE : T_FALSE);
        return;
      case 'number':
        this.number(value, key, parentIsBinding);
        return;
      case 'bigint':
        w.u8(T_INT64);
        w.u64(value < 0n ? BigInt.asUintN(64, value) : value);
        return;
      case 'string':
        w.u8(T_STRING);
        w.u32(this.strings.intern(value));
        return;
      case 'object':
        if (Array.isArray(value)) this.array(value, key, parentIsBinding, depth);
        else this.object(value as Record<string, unknown>, key, depth);
        return;
      default:
        throw new BonebWriteError('BIN_VALUE_TYPE', `Valor de tipo "${typeof value}" não pode ser gravado.`);
    }
  }

  /**
   * Encodes the root object, recording where each animation, skin and root
   * extension starts so an `INDX` section can be written (spec 11.7).
   */
  root(value: Record<string, unknown>, entries: IndexEntry[]): void {
    const w = this.writer;
    const names = Object.keys(value).filter((name) => value[name] !== undefined);
    w.u8(T_OBJECT);
    w.u32(names.length);
    for (const name of names) {
      w.u32(this.strings.intern(name));
      const child = value[name];
      if ((name === 'animations' || name === 'skins') && Array.isArray(child)) {
        const kind = name === 'animations' ? INDX_ANIMATION : INDX_SKIN;
        w.u8(T_ARRAY);
        w.u32(child.length);
        for (const item of child) {
          const start = w.length;
          this.value(item, null, false, 2);
          const itemName = isPlainObject(item) && typeof item['name'] === 'string' ? item['name'] : '';
          entries.push({ kind, name: this.strings.intern(itemName), offset: start, length: w.length - start });
        }
      } else if (name === 'extensions' && isPlainObject(child)) {
        const keys = Object.keys(child).filter((k) => child[k] !== undefined);
        w.u8(T_OBJECT);
        w.u32(keys.length);
        for (const k of keys) {
          w.u32(this.strings.intern(k));
          const start = w.length;
          this.value(child[k], k, false, 2);
          entries.push({ kind: INDX_EXTENSION, name: this.strings.intern(k), offset: start, length: w.length - start });
        }
      } else {
        this.value(child, name, false, 1);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// File assembly (spec 11.3, 11.4)
// ---------------------------------------------------------------------------

const KNOWN_TAGS: readonly string[] = ['STRS', 'TREE', 'BLOB', 'INDX', 'JSON'];

function tagToU32(tag: string): number {
  if (tag.length !== 4) {
    throw new BonebWriteError('BIN_SECTION_TAG', `Etiqueta de seção "${tag}" não tem 4 caracteres.`);
  }
  let out = 0;
  for (let i = 0; i < 4; i++) {
    const code = tag.charCodeAt(i);
    if (code > 0x7f) {
      throw new BonebWriteError('BIN_SECTION_TAG', `Etiqueta de seção "${tag}" tem caractere fora do ASCII.`);
    }
    out |= code << (8 * i);
  }
  return out >>> 0;
}

/** Reads `"1.7"` as `[1, 7]`. Anything unreadable becomes `[1, 0]`. */
function parseVersion(text: unknown): [number, number] {
  if (typeof text !== 'string') return [1, 0];
  const parts = text.split('.');
  const major = Number.parseInt(parts[0] ?? '', 10);
  const minor = Number.parseInt(parts[1] ?? '', 10);
  return [
    Number.isFinite(major) && major >= 0 ? Math.min(major, 65535) : 1,
    Number.isFinite(minor) && minor >= 0 ? Math.min(minor, 65535) : 0,
  ];
}

/**
 * Encodes a `.bone` tree as `.boneb` bytes (spec section 11).
 *
 * The conversion `.bone` -> `.boneb` -> `.bone` gives the same tree back,
 * apart from float-32 precision, property order and number formatting,
 * exactly as spec 11.1 requires.
 */
export function writeBoneb(file: BoneFile | unknown, options: WriteBonebOptions = {}): Uint8Array {
  return writeBonebWithReport(file, options).bytes;
}

/** Same as {@link writeBoneb} but also returns the writer warnings. */
export function writeBonebWithReport(
  file: BoneFile | unknown,
  options: WriteBonebOptions = {},
): WriteBonebResult {
  if (!isPlainObject(file)) {
    throw new BonebWriteError('BIN_ROOT_TYPE', 'O valor raiz de um .boneb tem que ser um objeto (11.5).');
  }

  const strings = new StringTable();
  const blobs = new BlobTable();
  const encoder2 = new TreeEncoder(strings, blobs, options);
  const indexEntries: IndexEntry[] = [];
  encoder2.root(file, indexEntries);

  const treeBytes = encoder2.writer.toBytes();
  const blobBytes = blobs.count > 0 ? blobs.encode() : null;

  const wantIndex = options.index !== false && indexEntries.length > 0;
  let indexBytes: Uint8Array | null = null;
  if (wantIndex) {
    const w = new ByteWriter(4 + indexEntries.length * 24);
    w.u32(indexEntries.length);
    for (const entry of indexEntries) {
      w.u32(entry.kind);
      w.u32(entry.name);
      w.u64(entry.offset);
      w.u64(entry.length);
    }
    indexBytes = w.toBytes();
  }

  const jsonBytes = options.json === true ? encoder.encode(JSON.stringify(file)) : null;

  // STRS must be serialised last: interning happens while the tree is written.
  const sections: BonebSection[] = [{ tag: 'STRS', bytes: strings.encode() }, { tag: 'TREE', bytes: treeBytes }];
  if (blobBytes) sections.push({ tag: 'BLOB', bytes: blobBytes });
  if (indexBytes) sections.push({ tag: 'INDX', bytes: indexBytes });
  if (jsonBytes) sections.push({ tag: 'JSON', bytes: jsonBytes });
  for (const extra of options.extraSections ?? []) {
    if (KNOWN_TAGS.includes(extra.tag)) continue;
    if (sections.some((section) => section.tag === extra.tag)) continue;
    sections.push({ tag: extra.tag, bytes: extra.bytes });
  }

  const headerSize = 32 + sections.length * 24;
  let cursor = headerSize + ((BONEB_ALIGN - (headerSize % BONEB_ALIGN)) % BONEB_ALIGN);
  const offsets: number[] = [];
  for (const section of sections) {
    offsets.push(cursor);
    cursor += section.bytes.length;
    cursor += (BONEB_ALIGN - (cursor % BONEB_ALIGN)) % BONEB_ALIGN;
  }
  // The file ends at the end of the last section; trailing padding is dropped.
  const fileSize = sections.length === 0
    ? cursor
    : offsets[sections.length - 1]! + sections[sections.length - 1]!.bytes.length;

  const header = isPlainObject(file['bone']) ? (file['bone'] as Record<string, unknown>) : {};
  const [formatMajor, formatMinor] = parseVersion(header['version']);
  const [minMajor, minMinor] = parseVersion(header['minVersion']);

  const w = new ByteWriter(fileSize + 16);
  for (const byte of BONEB_MAGIC) w.u8(byte);
  w.u16(BONEB_LAYOUT_VERSION);
  w.u16(indexBytes ? BONEB_FLAG_INDEX : 0);
  w.u16(formatMajor);
  w.u16(formatMinor);
  w.u16(minMajor);
  w.u16(minMinor);
  w.u32(sections.length);
  w.u64(fileSize);
  for (let i = 0; i < sections.length; i++) {
    w.u32(tagToU32(sections[i]!.tag));
    w.u32(0);
    w.u64(offsets[i]!);
    w.u64(sections[i]!.bytes.length);
  }
  for (let i = 0; i < sections.length; i++) {
    w.pad(BONEB_ALIGN);
    w.bytes(sections[i]!.bytes);
  }

  return { bytes: w.toBytes(), warnings: encoder2.warnings };
}
