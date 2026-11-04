// SPDX-License-Identifier: Apache-2.0
/**
 * `.bonez` container — the ZIP package of the format (spec 2.9).
 *
 * A `.bonez` is a plain ZIP (PKWARE APPNOTE 6.3.x) with three rules on top:
 * the first entry is `mimetype`, stored uncompressed, so the bytes 30..61 of
 * the file spell out the MIME type (the EPUB / ODF trick); the second entry is
 * `manifest.json`; and every entry name follows the uri rules of spec 2.8.
 *
 * Compression is injected, not imported: `node:zlib` on the server, the
 * browser's `DecompressionStream` (or nothing at all, Store only) on the web.
 * This module never touches the filesystem and never imports Node.
 *
 * Reading is hostile-input safe: zip bomb ratio, total size, entry count,
 * path traversal, duplicate names and local-vs-central mismatch are all
 * checked before a single byte is inflated (spec 12.6).
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Exact content of the `mimetype` entry, without a newline (spec 2.9). */
export const BONEZ_MIMETYPE = 'application/vnd.bone+zip';

/** Name of the first entry. */
export const BONEZ_MIMETYPE_ENTRY = 'mimetype';

/** Name of the second entry. */
export const BONEZ_MANIFEST_ENTRY = 'manifest.json';

/** Container version written in the manifest. */
export const BONEZ_VERSION = '1.0';

const SIG_LOCAL = 0x04034b50;
const SIG_CENTRAL = 0x02014b50;
const SIG_EOCD = 0x06054b50;
const SIG_ZIP64_EOCD = 0x06064b50;
const SIG_ZIP64_LOCATOR = 0x07064b50;

const METHOD_STORE = 0;
const METHOD_DEFLATE = 8;

const FLAG_DATA_DESCRIPTOR = 1 << 3;
const FLAG_UTF8 = 1 << 11;

/** Hard limits of spec 12.6. */
export const BONEZ_MAX_ENTRIES = 65535;
export const BONEZ_MAX_TOTAL_UNCOMPRESSED = 4 * 1024 * 1024 * 1024;
/** Refuse an entry that inflates more than this many times (spec 12.6). */
export const BONEZ_MAX_RATIO = 200;
/** Entries below this size never trip the ratio check. */
const RATIO_FLOOR = 1024;
/** Maximum uri / entry name length in code points (spec 2.8, 12.6). */
const MAX_NAME_LENGTH = 1024;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Compression injected by the host. Both halves are optional. */
export interface ZipCodec {
  /** Raw deflate (no zlib header). Node: `zlib.deflateRawSync`. */
  deflateRaw?(data: Uint8Array): Uint8Array;
  /** Raw inflate. `expectedSize` is the size declared in the ZIP. */
  inflateRaw?(data: Uint8Array, expectedSize: number): Uint8Array;
}

/** `manifest.json` (spec 2.9). */
export interface BonezManifest {
  bonez: { version: string };
  main: string;
  skeletons?: string[];
  atlases?: string[];
  images?: string[];
  audio?: string[];
  hashes?: Record<string, string>;
  extras?: unknown;
}

/** One file going into the package. */
export interface BonezFile {
  name: string;
  data: Uint8Array;
  /** Force Deflate (`true`) or Store (`false`). Default: by extension. */
  compress?: boolean;
}

/** Input of {@link writeBonez}. */
export interface WriteBonezInput {
  manifest: BonezManifest;
  files: readonly BonezFile[];
}

/** Options of {@link readBonez}. */
export interface ReadBonezOptions {
  maxEntries?: number;
  maxTotalUncompressed?: number;
  maxRatio?: number;
}

/** One entry as listed in the central directory. */
export interface BonezEntryInfo {
  name: string;
  method: number;
  compressedSize: number;
  uncompressedSize: number;
  crc32: number;
}

/** An open package. Entries are inflated only when asked for. */
export interface BonezArchive {
  manifest: BonezManifest;
  /** Name of the main skeleton entry (`manifest.main`). */
  mainName: string;
  entries: BonezEntryInfo[];
  names(): string[];
  has(name: string): boolean;
  /** Decompressed bytes, or `undefined` when the entry is not in the package. */
  read(name: string): Uint8Array | undefined;
  /** Decompressed bytes of `manifest.main`. */
  readMain(): Uint8Array;
  /** Human readable warnings, in Portuguese. */
  warnings: string[];
}

/** Error carrying a stable code, like the validator messages of spec 12.3. */
export class BonezError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = 'BonezError';
    this.code = code;
  }
}

function fail(code: string, message: string): never {
  throw new BonezError(code, message);
}

// ---------------------------------------------------------------------------
// CRC-32 (ZIP uses the IEEE polynomial, reflected)
// ---------------------------------------------------------------------------

let crcTable: Uint32Array | null = null;

function getCrcTable(): Uint32Array {
  if (crcTable) return crcTable;
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let value = i;
    for (let bit = 0; bit < 8; bit++) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  crcTable = table;
  return table;
}

/** CRC-32 of a byte range, as ZIP computes it. */
export function crc32(data: Uint8Array): number {
  const table = getCrcTable();
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ data[i]!) & 0xff]!;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// Entry names (spec 2.8 rules 1, 2, 3, 5, 7, 8 and spec 12.6)
// ---------------------------------------------------------------------------

const ENCODED_RESERVED = ['%2f', '%5c', '%00', '%3a'];

/**
 * Checks an entry name against the uri rules. Returns a message in Portuguese
 * when the name is invalid, or `null` when it is fine.
 *
 * Stricter than the letter of spec 2.8 on one point: any `..` anywhere in the
 * name is refused, not only a whole `..` segment. Spec 12.6 asks the reader to
 * "reject a ZIP entry with `..`", and refusing the substring is the reading
 * that cannot be walked around. Noted in `runtime/DUVIDAS-SPEC.md`.
 */
export function checkEntryName(name: string): string | null {
  if (name.length === 0) return 'Nome de entrada vazio.';
  if ([...name].length > MAX_NAME_LENGTH) {
    return `Nome de entrada com mais de ${MAX_NAME_LENGTH} caracteres.`;
  }
  for (let i = 0; i < name.length; i++) {
    const code = name.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return 'Nome de entrada com caractere de controle.';
  }
  if (name.includes('\\')) return 'Nome de entrada com barra invertida. Use apenas "/".';
  if (name.includes(':')) return 'Nome de entrada com dois-pontos, que é proibido em qualquer posição.';
  if (name.startsWith('/')) return 'Nome de entrada absoluto. Só caminho relativo.';
  if (name.includes('..')) return 'Nome de entrada com "..", que é proibido (path traversal).';
  const lower = name.toLowerCase();
  for (const bad of ENCODED_RESERVED) {
    if (lower.includes(bad)) return `Nome de entrada com "${bad}" codificado, que é proibido.`;
  }
  for (const segment of name.split('/')) {
    if (segment.length === 0) return 'Nome de entrada com segmento vazio.';
    if (segment === '.') return 'Nome de entrada com segmento ".", que é proibido.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Byte helpers
// ---------------------------------------------------------------------------

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8');

class Buf {
  private buf: Uint8Array;
  private view: DataView;
  length = 0;

  constructor(capacity = 4096) {
    this.buf = new Uint8Array(Math.max(64, capacity));
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

  bytes(data: Uint8Array): void {
    this.ensure(data.length);
    this.buf.set(data, this.length);
    this.length += data.length;
  }

  toBytes(): Uint8Array {
    return this.buf.slice(0, this.length);
  }
}

/** Files that are worth deflating; images and audio are already compressed. */
function shouldCompress(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.bone') || lower.endsWith('.boneb') || lower.endsWith('.json')
    || lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.svg');
}

// ---------------------------------------------------------------------------
// Writer
// ---------------------------------------------------------------------------

interface PendingCentral {
  name: Uint8Array;
  flags: number;
  method: number;
  crc: number;
  compressedSize: number;
  uncompressedSize: number;
  localOffset: number;
}

/** 1980-01-01 00:00, so the same input always gives the same bytes. */
const DOS_TIME = 0;
const DOS_DATE = 0x0021;

function writeEntry(
  out: Buf,
  central: PendingCentral[],
  name: string,
  data: Uint8Array,
  compress: boolean,
  codec: ZipCodec,
  utf8Flag: boolean,
): void {
  const nameBytes = textEncoder.encode(name);
  let method = METHOD_STORE;
  let payload = data;
  if (compress && codec.deflateRaw) {
    const deflated = codec.deflateRaw(data);
    // Never let "compression" make the entry bigger.
    if (deflated.length < data.length) {
      method = METHOD_DEFLATE;
      payload = deflated;
    }
  }
  const flags = utf8Flag ? FLAG_UTF8 : 0;
  const crc = crc32(data);
  const localOffset = out.length;

  out.u32(SIG_LOCAL);
  out.u16(20);
  out.u16(flags);
  out.u16(method);
  out.u16(DOS_TIME);
  out.u16(DOS_DATE);
  out.u32(crc);
  out.u32(payload.length);
  out.u32(data.length);
  out.u16(nameBytes.length);
  out.u16(0);
  out.bytes(nameBytes);
  out.bytes(payload);

  central.push({
    name: nameBytes,
    flags,
    method,
    crc,
    compressedSize: payload.length,
    uncompressedSize: data.length,
    localOffset,
  });
}

/**
 * Builds a `.bonez` package (spec 2.9).
 *
 * `mimetype` goes first, uncompressed, with no extra field and no data
 * descriptor, so bytes 0..3 are `PK\x03\x04`, 30..37 are `mimetype` and
 * 38..61 are the MIME type. `manifest.json` goes second.
 */
export function writeBonez(input: WriteBonezInput, codec: ZipCodec = {}): Uint8Array {
  const manifest = input.manifest;
  if (!manifest || typeof manifest !== 'object') {
    fail('ZIP_MANIFEST', 'O manifesto é obrigatório (2.9).');
  }
  if (typeof manifest.main !== 'string') {
    fail('ZIP_MANIFEST', 'O manifesto precisa de "main" com o nome do arquivo principal (2.9).');
  }
  const mainProblem = checkEntryName(manifest.main);
  if (mainProblem) fail('URI_INVALID', `"main" do manifesto: ${mainProblem}`);

  const seen = new Set<string>();
  for (const file of input.files) {
    const problem = checkEntryName(file.name);
    if (problem) fail('URI_INVALID', `Entrada "${file.name}": ${problem}`);
    if (file.name !== file.name.normalize('NFC')) {
      fail('URI_INVALID', `Entrada "${file.name}" não está na forma NFC (2.9).`);
    }
    if (file.name === BONEZ_MIMETYPE_ENTRY || file.name === BONEZ_MANIFEST_ENTRY) {
      fail('ZIP_DUPLICATE_ENTRY', `A entrada "${file.name}" é gerada pelo empacotador; não passe ela na lista.`);
    }
    if (seen.has(file.name)) {
      fail('ZIP_DUPLICATE_ENTRY', `A entrada "${file.name}" aparece duas vezes (2.9).`);
    }
    seen.add(file.name);
  }
  if (!seen.has(manifest.main)) {
    fail('ZIP_MANIFEST', `O manifesto aponta para "${manifest.main}", que não está no pacote.`);
  }
  const total = input.files.length + 2;
  if (total > BONEZ_MAX_ENTRIES) {
    fail('LIMIT_ZIP_ENTRIES', `Pacote com ${total} entradas, acima do limite de ${BONEZ_MAX_ENTRIES} (12.6).`);
  }

  const normalized: BonezManifest = { bonez: { version: manifest.bonez?.version ?? BONEZ_VERSION }, main: manifest.main };
  if (manifest.skeletons) normalized.skeletons = manifest.skeletons;
  if (manifest.atlases) normalized.atlases = manifest.atlases;
  if (manifest.images) normalized.images = manifest.images;
  if (manifest.audio) normalized.audio = manifest.audio;
  if (manifest.hashes) normalized.hashes = manifest.hashes;
  if (manifest.extras !== undefined) normalized.extras = manifest.extras;

  const out = new Buf(64 * 1024);
  const central: PendingCentral[] = [];

  writeEntry(out, central, BONEZ_MIMETYPE_ENTRY, textEncoder.encode(BONEZ_MIMETYPE), false, codec, false);
  writeEntry(out, central, BONEZ_MANIFEST_ENTRY, textEncoder.encode(JSON.stringify(normalized, null, 2)), true, codec, true);
  for (const file of input.files) {
    const compress = file.compress ?? shouldCompress(file.name);
    writeEntry(out, central, file.name, file.data, compress, codec, true);
  }
  return finishZip(out, central);
}

/**
 * A plain ZIP: the same writer as the `.bonez`, with no `mimetype` and no
 * manifest — for a bundle that is only files, like the PNG sequence the
 * editor hands over in one download (editor lote 51). Entry names follow the
 * same rules as a package's, and the same input gives the same bytes.
 */
export function writeZip(files: readonly BonezFile[], codec: ZipCodec = {}): Uint8Array {
  const seen = new Set<string>();
  for (const file of files) {
    const problem = checkEntryName(file.name);
    if (problem) fail('URI_INVALID', `Entrada "${file.name}": ${problem}`);
    if (file.name !== file.name.normalize('NFC')) {
      fail('URI_INVALID', `Entrada "${file.name}" não está na forma NFC (2.9).`);
    }
    if (seen.has(file.name)) fail('ZIP_DUPLICATE_ENTRY', `A entrada "${file.name}" aparece duas vezes.`);
    seen.add(file.name);
  }
  if (files.length > BONEZ_MAX_ENTRIES) {
    fail('LIMIT_ZIP_ENTRIES', `ZIP com ${files.length} entradas, acima do limite de ${BONEZ_MAX_ENTRIES} (12.6).`);
  }
  const out = new Buf(64 * 1024);
  const central: PendingCentral[] = [];
  for (const file of files) {
    writeEntry(out, central, file.name, file.data, file.compress ?? shouldCompress(file.name), codec, true);
  }
  return finishZip(out, central);
}

/** The central directory and the end record, after the local entries. */
function finishZip(out: Buf, central: readonly PendingCentral[]): Uint8Array {
  const centralOffset = out.length;
  for (const entry of central) {
    if (entry.localOffset > 0xffffffff) {
      fail('LIMIT_ZIP_SIZE', 'Pacote acima de 4 GiB: este gravador não escreve ZIP64.');
    }
    out.u32(SIG_CENTRAL);
    out.u16(20);
    out.u16(20);
    out.u16(entry.flags);
    out.u16(entry.method);
    out.u16(DOS_TIME);
    out.u16(DOS_DATE);
    out.u32(entry.crc);
    out.u32(entry.compressedSize);
    out.u32(entry.uncompressedSize);
    out.u16(entry.name.length);
    out.u16(0);
    out.u16(0);
    out.u16(0);
    out.u16(0);
    out.u32(0);
    out.u32(entry.localOffset);
    out.bytes(entry.name);
  }
  const centralSize = out.length - centralOffset;

  out.u32(SIG_EOCD);
  out.u16(0);
  out.u16(0);
  out.u16(central.length);
  out.u16(central.length);
  out.u32(centralSize);
  out.u32(centralOffset);
  out.u16(0);

  return out.toBytes();
}

// ---------------------------------------------------------------------------
// Reader
// ---------------------------------------------------------------------------

interface CentralEntry extends BonezEntryInfo {
  flags: number;
  localOffset: number;
  nameBytes: Uint8Array;
}

function findEocd(view: DataView, size: number): number {
  const lowest = Math.max(0, size - 22 - 0xffff);
  for (let at = size - 22; at >= lowest; at--) {
    if (view.getUint32(at, true) === SIG_EOCD) return at;
  }
  fail('ZIP_EOCD', 'Não achei o fim do diretório central: não parece um ZIP.');
}

function readZip64Extra(
  extra: Uint8Array,
  entry: { uncompressedSize: number; compressedSize: number; localOffset: number },
): void {
  const view = new DataView(extra.buffer, extra.byteOffset, extra.byteLength);
  let at = 0;
  while (at + 4 <= extra.length) {
    const id = view.getUint16(at, true);
    const size = view.getUint16(at + 2, true);
    if (at + 4 + size > extra.length) return;
    if (id === 0x0001) {
      let field = at + 4;
      const rest = (): boolean => field + 8 <= at + 4 + size;
      if (entry.uncompressedSize === 0xffffffff && rest()) {
        entry.uncompressedSize = Number(view.getBigUint64(field, true));
        field += 8;
      }
      if (entry.compressedSize === 0xffffffff && rest()) {
        entry.compressedSize = Number(view.getBigUint64(field, true));
        field += 8;
      }
      if (entry.localOffset === 0xffffffff && rest()) {
        entry.localOffset = Number(view.getBigUint64(field, true));
        field += 8;
      }
      return;
    }
    at += 4 + size;
  }
}

/**
 * Opens a `.bonez` package (spec 2.9), checking it against the hostile-input
 * rules of spec 12.6 before anything is inflated.
 */
export function readBonez(
  bytes: Uint8Array,
  codec: ZipCodec = {},
  options: ReadBonezOptions = {},
): BonezArchive {
  const maxEntries = options.maxEntries ?? BONEZ_MAX_ENTRIES;
  const maxTotal = options.maxTotalUncompressed ?? BONEZ_MAX_TOTAL_UNCOMPRESSED;
  const maxRatio = options.maxRatio ?? BONEZ_MAX_RATIO;
  const warnings: string[] = [];

  if (bytes.length < 22) fail('ZIP_EOCD', 'Arquivo curto demais para ser um ZIP.');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);

  // -- mimetype, by raw byte position (spec 2.9) ----------------------------
  const head = textDecoder.decode(bytes.subarray(30, 38));
  const mime = textDecoder.decode(bytes.subarray(38, 38 + BONEZ_MIMETYPE.length));
  if (view.getUint32(0, true) !== SIG_LOCAL || head !== BONEZ_MIMETYPE_ENTRY || mime !== BONEZ_MIMETYPE) {
    fail('ZIP_MIMETYPE', 'A primeira entrada não é o "mimetype" exigido por 2.9.');
  }

  // -- end of central directory ---------------------------------------------
  const eocd = findEocd(view, bytes.length);
  let entryCount = view.getUint16(eocd + 10, true);
  let centralSize = view.getUint32(eocd + 12, true);
  let centralOffset = view.getUint32(eocd + 16, true);

  if (entryCount === 0xffff || centralSize === 0xffffffff || centralOffset === 0xffffffff) {
    const locator = eocd - 20;
    if (locator < 0 || view.getUint32(locator, true) !== SIG_ZIP64_LOCATOR) {
      fail('ZIP_ZIP64', 'O ZIP diz que é ZIP64, mas não achei o localizador.');
    }
    const zip64At = Number(view.getBigUint64(locator + 8, true));
    if (zip64At < 0 || zip64At + 56 > bytes.length || view.getUint32(zip64At, true) !== SIG_ZIP64_EOCD) {
      fail('ZIP_ZIP64', 'Registro ZIP64 de fim de diretório inválido.');
    }
    entryCount = Number(view.getBigUint64(zip64At + 32, true));
    centralSize = Number(view.getBigUint64(zip64At + 40, true));
    centralOffset = Number(view.getBigUint64(zip64At + 48, true));
  }

  if (entryCount > maxEntries) {
    fail('LIMIT_ZIP_ENTRIES', `Pacote com ${entryCount} entradas, acima do limite de ${maxEntries} (12.6).`);
  }
  if (centralOffset + centralSize > bytes.length) {
    fail('ZIP_CENTRAL', 'Diretório central fora do arquivo.');
  }

  // -- central directory -----------------------------------------------------
  const entries: CentralEntry[] = [];
  const byName = new Map<string, CentralEntry>();
  let totalUncompressed = 0;
  let at = centralOffset;
  for (let i = 0; i < entryCount; i++) {
    if (at + 46 > centralOffset + centralSize) fail('ZIP_CENTRAL', 'Diretório central acaba no meio de uma entrada.');
    if (view.getUint32(at, true) !== SIG_CENTRAL) fail('ZIP_CENTRAL', 'Assinatura errada no diretório central.');
    const flags = view.getUint16(at + 8, true);
    const method = view.getUint16(at + 10, true);
    const crc = view.getUint32(at + 16, true);
    const nameLength = view.getUint16(at + 28, true);
    const extraLength = view.getUint16(at + 30, true);
    const commentLength = view.getUint16(at + 32, true);
    const sizes = {
      compressedSize: view.getUint32(at + 20, true),
      uncompressedSize: view.getUint32(at + 24, true),
      localOffset: view.getUint32(at + 42, true),
    };
    const nameAt = at + 46;
    if (nameAt + nameLength + extraLength + commentLength > centralOffset + centralSize) {
      fail('ZIP_CENTRAL', 'Nome ou extra fora do diretório central.');
    }
    const nameBytes = bytes.subarray(nameAt, nameAt + nameLength);
    if (extraLength > 0) {
      readZip64Extra(bytes.subarray(nameAt + nameLength, nameAt + nameLength + extraLength), sizes);
    }
    at = nameAt + nameLength + extraLength + commentLength;

    if ((flags & FLAG_UTF8) === 0) {
      for (const byte of nameBytes) {
        if (byte > 0x7f) {
          warnings.push('Entrada com nome fora do ASCII sem a marca de UTF-8; li como UTF-8 mesmo assim.');
          break;
        }
      }
    }
    const name = textDecoder.decode(nameBytes);
    if (name.endsWith('/')) continue; // A directory entry carries no data.

    const problem = checkEntryName(name);
    if (problem) fail('URI_INVALID', `Entrada "${name}": ${problem}`);
    if (name !== name.normalize('NFC')) {
      warnings.push(`Entrada "${name}" não está na forma NFC (2.9).`);
    }
    if (method !== METHOD_STORE && method !== METHOD_DEFLATE) {
      fail('ZIP_METHOD', `Entrada "${name}" usa o método ${method}; só Store e Deflate são válidos (2.9).`);
    }
    if (byName.has(name)) {
      fail('ZIP_DUPLICATE_ENTRY', `A entrada "${name}" aparece duas vezes (2.9).`);
    }

    totalUncompressed += sizes.uncompressedSize;
    if (totalUncompressed > maxTotal) {
      fail('LIMIT_ZIP_TOTAL', `O pacote descompactado passaria de ${maxTotal} bytes (12.6).`);
    }
    if (sizes.uncompressedSize > RATIO_FLOOR && sizes.compressedSize > 0) {
      const ratio = sizes.uncompressedSize / sizes.compressedSize;
      if (ratio > maxRatio) {
        fail(
          'LIMIT_ZIP_RATIO',
          `A entrada "${name}" infla ${Math.round(ratio)} vezes, acima do limite de ${maxRatio}:1 (12.6).`,
        );
      }
    }

    const entry: CentralEntry = {
      name,
      method,
      crc32: crc,
      compressedSize: sizes.compressedSize,
      uncompressedSize: sizes.uncompressedSize,
      flags,
      localOffset: sizes.localOffset,
      nameBytes,
    };
    entries.push(entry);
    byName.set(name, entry);
  }

  // -- reading one entry ------------------------------------------------------
  const cache = new Map<string, Uint8Array>();

  function readEntry(name: string): Uint8Array | undefined {
    const cached = cache.get(name);
    if (cached) return cached;
    const entry = byName.get(name);
    if (!entry) return undefined;

    const local = entry.localOffset;
    if (local + 30 > bytes.length || view.getUint32(local, true) !== SIG_LOCAL) {
      fail('ZIP_LOCAL', `Cabeçalho local da entrada "${name}" inválido.`);
    }
    const localFlags = view.getUint16(local + 6, true);
    const localNameLength = view.getUint16(local + 26, true);
    const localExtraLength = view.getUint16(local + 28, true);
    const localNameAt = local + 30;
    if (localNameAt + localNameLength > bytes.length) {
      fail('ZIP_LOCAL', `Nome da entrada "${name}" fora do arquivo.`);
    }
    const localName = bytes.subarray(localNameAt, localNameAt + localNameLength);
    if (localName.length !== entry.nameBytes.length) {
      fail('ZIP_LOCAL', `A entrada "${name}" tem nomes diferentes no cabeçalho local e no diretório central.`);
    }
    for (let i = 0; i < localName.length; i++) {
      if (localName[i] !== entry.nameBytes[i]) {
        fail('ZIP_LOCAL', `A entrada "${name}" tem nomes diferentes no cabeçalho local e no diretório central.`);
      }
    }
    if ((localFlags & FLAG_DATA_DESCRIPTOR) === 0) {
      const localCrc = view.getUint32(local + 14, true);
      const localCompressed = view.getUint32(local + 18, true);
      if (localCrc !== entry.crc32 && localCrc !== 0) {
        fail('ZIP_LOCAL', `A entrada "${name}" tem CRC diferente no cabeçalho local e no diretório central.`);
      }
      if (localCompressed !== 0xffffffff && localCompressed !== entry.compressedSize && localCompressed !== 0) {
        fail('ZIP_LOCAL', `A entrada "${name}" tem tamanho diferente no cabeçalho local e no diretório central.`);
      }
    }

    const dataAt = localNameAt + localNameLength + localExtraLength;
    if (dataAt + entry.compressedSize > bytes.length) {
      fail('ZIP_LOCAL', `Os dados da entrada "${name}" saem do arquivo.`);
    }
    const payload = bytes.subarray(dataAt, dataAt + entry.compressedSize);

    let data: Uint8Array;
    if (entry.method === METHOD_STORE) {
      data = payload.slice();
    } else {
      if (!codec.inflateRaw) {
        fail('ZIP_NO_CODEC', `A entrada "${name}" está comprimida e nenhum descompactador foi fornecido.`);
      }
      data = codec.inflateRaw(payload, entry.uncompressedSize);
    }
    if (data.length !== entry.uncompressedSize) {
      fail('ZIP_SIZE', `A entrada "${name}" descompactou ${data.length} bytes em vez de ${entry.uncompressedSize}.`);
    }
    if (crc32(data) !== entry.crc32) {
      fail('ZIP_CRC', `A entrada "${name}" não bate com o CRC gravado: o arquivo está corrompido.`);
    }
    cache.set(name, data);
    return data;
  }

  // -- manifest ---------------------------------------------------------------
  const manifestBytes = readEntry(BONEZ_MANIFEST_ENTRY);
  if (!manifestBytes) fail('ZIP_MANIFEST', 'Falta a entrada "manifest.json" (2.9).');
  let manifest: BonezManifest;
  try {
    manifest = JSON.parse(textDecoder.decode(manifestBytes)) as BonezManifest;
  } catch {
    fail('ZIP_MANIFEST', 'O "manifest.json" não é JSON válido.');
  }
  if (!manifest || typeof manifest !== 'object' || typeof manifest.main !== 'string') {
    fail('ZIP_MANIFEST', 'O "manifest.json" precisa de "main" com o nome do arquivo principal (2.9).');
  }
  const mainProblem = checkEntryName(manifest.main);
  if (mainProblem) fail('URI_INVALID', `"main" do manifesto: ${mainProblem}`);
  if (!byName.has(manifest.main)) {
    fail('ZIP_MANIFEST', `O manifesto aponta para "${manifest.main}", que não está no pacote.`);
  }
  if (!manifest.bonez || typeof manifest.bonez.version !== 'string') {
    warnings.push('O manifesto não traz "bonez.version" (2.9).');
  }

  const listed = new Set<string>([manifest.main]);
  for (const list of [manifest.skeletons, manifest.atlases, manifest.images, manifest.audio]) {
    for (const item of list ?? []) listed.add(item);
  }
  for (const entry of entries) {
    if (entry.name === BONEZ_MIMETYPE_ENTRY || entry.name === BONEZ_MANIFEST_ENTRY) continue;
    if (!listed.has(entry.name)) {
      warnings.push(`A entrada "${entry.name}" não está listada no manifesto (ZIP_UNLISTED, L2).`);
    }
  }

  return {
    manifest,
    mainName: manifest.main,
    entries: entries.map((entry) => ({
      name: entry.name,
      method: entry.method,
      compressedSize: entry.compressedSize,
      uncompressedSize: entry.uncompressedSize,
      crc32: entry.crc32,
    })),
    names: () => entries.map((entry) => entry.name),
    has: (name: string) => byName.has(name),
    read: readEntry,
    readMain: () => {
      const data = readEntry(manifest.main);
      if (!data) fail('ZIP_MANIFEST', `Não consegui ler "${manifest.main}".`);
      return data;
    },
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Async reader (browser: `DecompressionStream`)
// ---------------------------------------------------------------------------

/**
 * Compression injected by a host whose inflate is asynchronous.
 *
 * The browser has no synchronous inflate: `DecompressionStream` returns a
 * stream. `readBonez` is synchronous by design (a game loop wants it that
 * way), so the browser path goes through {@link readBonezAsync}, which
 * inflates the compressed entries first and then opens the package with the
 * already-decompressed bytes.
 */
export interface AsyncZipCodec extends ZipCodec {
  /** Raw inflate that returns a promise. Default: `DecompressionStream`. */
  inflateRawAsync?(data: Uint8Array, expectedSize: number): Promise<Uint8Array>;
}

/** Shape of `DecompressionStream`, looked up on `globalThis` (no DOM import). */
interface DecompressionStreamLike {
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;
}
type DecompressionStreamCtor = new (format: string) => DecompressionStreamLike;

/** `DecompressionStream` of this host, or `null` where there is none. */
export function decompressionStreamCtor(): DecompressionStreamCtor | null {
  const ctor = (globalThis as { DecompressionStream?: DecompressionStreamCtor }).DecompressionStream;
  return typeof ctor === 'function' ? ctor : null;
}

/**
 * Raw inflate through `DecompressionStream('deflate-raw')`.
 *
 * Stops as soon as the output passes the size the ZIP declared, so a doctored
 * entry cannot inflate without end (spec 12.6).
 */
export async function inflateRawWithStream(data: Uint8Array, expectedSize: number): Promise<Uint8Array> {
  const Ctor = decompressionStreamCtor();
  if (Ctor === null) {
    fail('ZIP_NO_CODEC', 'Este ambiente não tem DecompressionStream; passe um descompactador em codec.inflateRawAsync.');
  }
  const stream = new Ctor('deflate-raw');
  const writer = stream.writable.getWriter();
  const pump = (async () => {
    await writer.write(data);
    await writer.close();
  })();
  pump.catch(() => { /* the read side reports the real problem */ });

  const reader = stream.readable.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  const cap = expectedSize > 0 ? expectedSize : Number.MAX_SAFE_INTEGER;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value === undefined) continue;
      chunks.push(value);
      length += value.length;
      if (length > cap) {
        await reader.cancel();
        fail('LIMIT_ZIP_RATIO', `Uma entrada inflou mais do que os ${expectedSize} bytes declarados (12.6).`);
      }
    }
  } catch (error) {
    if (error instanceof BonezError) throw error;
    fail('ZIP_INFLATE', `Não deu para descompactar uma entrada: ${(error as Error).message}`);
  }
  const out = new Uint8Array(length);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

/** One deflated entry located in the raw bytes, before any validation. */
interface RawDeflatedEntry {
  name: string;
  /** The compressed bytes, as a view into the file. */
  payload: Uint8Array;
  uncompressedSize: number;
}

/**
 * Light pass that lists the DEFLATED entries and where their bytes sit.
 *
 * It validates nothing: `readBonez` does the whole job afterwards on the same
 * bytes. Anything it cannot parse comes back as an empty list, so the real,
 * well-worded error still comes out of `readBonez`.
 */
function scanDeflatedEntries(bytes: Uint8Array): RawDeflatedEntry[] {
  const out: RawDeflatedEntry[] = [];
  try {
    if (bytes.length < 22) return out;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const eocd = findEocd(view, bytes.length);
    let count = view.getUint16(eocd + 10, true);
    let centralOffset = view.getUint32(eocd + 16, true);
    if (count === 0xffff || centralOffset === 0xffffffff) {
      const locator = eocd - 20;
      if (locator < 0 || view.getUint32(locator, true) !== SIG_ZIP64_LOCATOR) return out;
      const at64 = Number(view.getBigUint64(locator + 8, true));
      if (at64 < 0 || at64 + 56 > bytes.length || view.getUint32(at64, true) !== SIG_ZIP64_EOCD) return out;
      count = Number(view.getBigUint64(at64 + 32, true));
      centralOffset = Number(view.getBigUint64(at64 + 48, true));
    }
    let at = centralOffset;
    for (let i = 0; i < count; i++) {
      if (at + 46 > bytes.length || view.getUint32(at, true) !== SIG_CENTRAL) return out;
      const method = view.getUint16(at + 10, true);
      const nameLength = view.getUint16(at + 28, true);
      const extraLength = view.getUint16(at + 30, true);
      const commentLength = view.getUint16(at + 32, true);
      const sizes = {
        compressedSize: view.getUint32(at + 20, true),
        uncompressedSize: view.getUint32(at + 24, true),
        localOffset: view.getUint32(at + 42, true),
      };
      const nameAt = at + 46;
      if (nameAt + nameLength + extraLength + commentLength > bytes.length) return out;
      const name = textDecoder.decode(bytes.subarray(nameAt, nameAt + nameLength));
      if (extraLength > 0) {
        readZip64Extra(bytes.subarray(nameAt + nameLength, nameAt + nameLength + extraLength), sizes);
      }
      at = nameAt + nameLength + extraLength + commentLength;
      if (method !== METHOD_DEFLATE) continue;

      const local = sizes.localOffset;
      if (local + 30 > bytes.length || view.getUint32(local, true) !== SIG_LOCAL) return out;
      const dataAt = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
      if (dataAt + sizes.compressedSize > bytes.length) return out;
      out.push({
        name,
        payload: bytes.subarray(dataAt, dataAt + sizes.compressedSize),
        uncompressedSize: sizes.uncompressedSize,
      });
    }
  } catch {
    return out;
  }
  return out;
}

/**
 * Opens a `.bonez` where the only inflate available is asynchronous — the
 * browser (spec 2.9).
 *
 * Same result as {@link readBonez}, and the same checks: this function
 * inflates the compressed entries first, then hands `readBonez` a synchronous
 * codec that serves the bytes it already has. Entries stored uncompressed
 * (images, audio) are not touched here; `readBonez` reads those directly, so
 * a package of pictures costs no extra memory.
 *
 * `codec.inflateRaw` (a real synchronous inflate, as in Node) short-circuits
 * the whole thing: the sync path is used as is.
 *
 * The zip bomb limits of spec 12.6 are applied to the declared sizes BEFORE
 * anything is inflated, exactly as in the synchronous reader.
 */
export async function readBonezAsync(
  bytes: Uint8Array,
  codec: AsyncZipCodec = {},
  options: ReadBonezOptions = {},
): Promise<BonezArchive> {
  if (codec.inflateRaw) return readBonez(bytes, codec, options);

  const entries = scanDeflatedEntries(bytes);
  if (entries.length === 0) return readBonez(bytes, codec, options);

  const maxTotal = options.maxTotalUncompressed ?? BONEZ_MAX_TOTAL_UNCOMPRESSED;
  const maxRatio = options.maxRatio ?? BONEZ_MAX_RATIO;
  let total = 0;
  for (const entry of entries) {
    total += entry.uncompressedSize;
    if (total > maxTotal) {
      fail('LIMIT_ZIP_TOTAL', `O pacote descompactado passaria de ${maxTotal} bytes (12.6).`);
    }
    if (entry.uncompressedSize > RATIO_FLOOR && entry.payload.length > 0) {
      const ratio = entry.uncompressedSize / entry.payload.length;
      if (ratio > maxRatio) {
        fail(
          'LIMIT_ZIP_RATIO',
          `A entrada "${entry.name}" infla ${Math.round(ratio)} vezes, acima do limite de ${maxRatio}:1 (12.6).`,
        );
      }
    }
  }

  const inflate = codec.inflateRawAsync ?? inflateRawWithStream;
  // Keyed by where the compressed bytes start in the file: that is exactly the
  // view `readBonez` hands the codec, and two entries never share an offset.
  const ready = new Map<number, Uint8Array>();
  for (const entry of entries) {
    ready.set(entry.payload.byteOffset, await inflate(entry.payload, entry.uncompressedSize));
  }

  return readBonez(bytes, {
    ...codec,
    inflateRaw: (data: Uint8Array, expectedSize: number): Uint8Array => {
      const done = ready.get(data.byteOffset);
      if (done === undefined) {
        fail('ZIP_NO_CODEC', 'Uma entrada comprimida não foi descompactada antes da leitura.');
      }
      if (done.length !== expectedSize) {
        fail('ZIP_SIZE', `Uma entrada descompactou ${done.length} bytes em vez de ${expectedSize}.`);
      }
      return done;
    },
  }, options);
}
