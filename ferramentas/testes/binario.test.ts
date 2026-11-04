/**
 * Tests for the binary `.boneb` encoding (spec 11) and the `.bonez` container
 * (spec 2.9).
 *
 * The test that matters is the round trip: read the real example files, write
 * them as `.boneb`, read them back, and prove the tree that comes out is
 * equivalent to the one that went in.
 *
 * TOLERANCE. `.boneb` stores every non-integer number as IEEE-754 binary32
 * (spec 11.2, 3.6), so the round trip is lossy on purpose. A binary32 keeps
 * about 7 significant decimal digits: the worst relative rounding error is
 * 2^-24, about 6e-8. The deep comparison below accepts a relative difference
 * of 1e-6 (roughly twenty times that margin) with an absolute floor of 1e-6
 * for values near zero. A second, stricter test proves that every number comes
 * back as exactly `Math.fround(original)`, which is the real guarantee.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

import {
  writeBoneb, writeBonebWithReport, BonebWriteError,
} from '../src/binario/escrever.js';
import {
  readBoneb, readBonebWithReport, BonebReadError,
} from '../src/binario/ler.js';
import {
  writeBonez, readBonez, checkEntryName, crc32, BonezError,
  BONEZ_MIMETYPE, BONEZ_MIMETYPE_ENTRY,
} from '../src/binario/bonez.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const RELATIVE_TOLERANCE = 1e-6;
const ABSOLUTE_TOLERANCE = 1e-6;

/** Deep comparison that treats numbers as binary32. Returns the first diff. */
function deepDiff(a: unknown, b: unknown, path = ''): string | null {
  const here = path || '/';
  if (a === b) return null;
  if (typeof a === 'number' && typeof b === 'number') {
    const limit = Math.max(ABSOLUTE_TOLERANCE, Math.abs(a) * RELATIVE_TOLERANCE);
    return Math.abs(a - b) <= limit ? null : `${here}: ${a} virou ${b}`;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return `${here}: ${JSON.stringify(a)} virou ${JSON.stringify(b)}`;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return `${here}: um é lista e o outro não`;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return `${here}: lista de ${a.length} virou ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const diff = deepDiff(a[i], b[i], `${path}/${i}`);
      if (diff) return diff;
    }
    return null;
  }
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keysA = Object.keys(left);
  const keysB = Object.keys(right);
  if (keysA.length !== keysB.length) {
    const missing = keysA.filter((k) => !keysB.includes(k));
    const extra = keysB.filter((k) => !keysA.includes(k));
    return `${here}: faltou [${missing}] e sobrou [${extra}]`;
  }
  for (const key of keysA) {
    if (!(key in right)) return `${path}/${key}: sumiu`;
    const diff = deepDiff(left[key], right[key], `${path}/${key}`);
    if (diff) return diff;
  }
  return null;
}

/** Stricter check: every number must come back as exactly `fround(original)`. */
function froundDiff(a: unknown, b: unknown, path = ''): string | null {
  if (typeof a === 'number' && typeof b === 'number') {
    if (a === b) return null;
    if (Math.fround(a) === b) return null;
    return `${path || '/'}: ${a} virou ${b} (esperava ${Math.fround(a)})`;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const diff = froundDiff(a[i], b[i], `${path}/${i}`);
      if (diff) return diff;
    }
    return null;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const left = a as Record<string, unknown>;
    const right = b as Record<string, unknown>;
    for (const key of Object.keys(left)) {
      const diff = froundDiff(left[key], right[key], `${path}/${key}`);
      if (diff) return diff;
    }
  }
  return null;
}

function exemplo(nome: string): { texto: string; doc: Record<string, unknown> } {
  const caminho = fileURLToPath(new URL(`../../formato/exemplos/${nome}`, import.meta.url));
  const texto = readFileSync(caminho, 'utf8');
  return { texto, doc: JSON.parse(texto) as Record<string, unknown> };
}

/** Node's zlib, injected. The `.bonez` module never imports Node itself. */
const CODEC = {
  deflateRaw: (data: Uint8Array): Uint8Array => new Uint8Array(zlib.deflateRawSync(data, { level: 9 })),
  inflateRaw: (data: Uint8Array): Uint8Array => new Uint8Array(zlib.inflateRawSync(data)),
};

function minimalDoc(): Record<string, unknown> {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste 0.1.0' },
    bones: [{ name: 'root' }],
  };
}

// ---------------------------------------------------------------------------
// Round trip with the real examples
// ---------------------------------------------------------------------------

describe('.boneb: ida e volta com os exemplos reais', () => {
  for (const nome of ['heroi.bone', 'minimo.bone']) {
    it(`${nome} volta equivalente`, () => {
      const { doc } = exemplo(nome);
      const bytes = writeBoneb(doc);
      const volta = readBoneb(bytes) as unknown;
      expect(deepDiff(doc, volta)).toBeNull();
    });

    it(`${nome}: todo número volta como float de 32 bits exato`, () => {
      const { doc } = exemplo(nome);
      const volta = readBoneb(writeBoneb(doc)) as unknown;
      expect(froundDiff(doc, volta)).toBeNull();
    });

    it(`${nome}: a ordem das propriedades é preservada`, () => {
      const { doc } = exemplo(nome);
      const volta = readBoneb(writeBoneb(doc)) as unknown as Record<string, unknown>;
      expect(Object.keys(volta)).toEqual(Object.keys(doc));
    });
  }

  it('o .boneb é menor que o .bone', () => {
    const { texto, doc } = exemplo('heroi.bone');
    const bytes = writeBoneb(doc);
    const tamanhoJson = new TextEncoder().encode(texto).length;
    expect(bytes.length).toBeLessThan(tamanhoJson);
  });

  it('grava e relê sem aviso nenhum', () => {
    const { doc } = exemplo('heroi.bone');
    const escrito = writeBonebWithReport(doc);
    expect(escrito.warnings).toEqual([]);
    const lido = readBonebWithReport(escrito.bytes);
    expect(lido.warnings).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Header and sections (spec 11.3, 11.4)
// ---------------------------------------------------------------------------

describe('.boneb: cabeçalho e tabela de seções', () => {
  it('a assinatura é a de 11.3 e o tamanho bate', () => {
    const bytes = writeBoneb(minimalDoc());
    expect([...bytes.subarray(0, 8)]).toEqual([0x89, 0x42, 0x4f, 0x4e, 0x45, 0x0d, 0x0a, 0x1a]);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(view.getUint16(8, true)).toBe(1);
    expect(Number(view.getBigUint64(24, true))).toBe(bytes.length);
  });

  it('toda seção começa em múltiplo de 16', () => {
    const { doc } = exemplo('heroi.bone');
    const bytes = writeBoneb(doc);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const sectionCount = view.getUint32(20, true);
    expect(sectionCount).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < sectionCount; i++) {
      const offset = Number(view.getBigUint64(32 + i * 24 + 8, true));
      expect(offset % 16).toBe(0);
    }
  });

  it('recusa assinatura errada', () => {
    const bytes = writeBoneb(minimalDoc());
    bytes[1] = 0x00;
    expect(() => readBoneb(bytes)).toThrowError(BonebReadError);
    try {
      readBoneb(bytes);
    } catch (e) {
      expect((e as BonebReadError).code).toBe('BIN_MAGIC');
    }
  });

  it('recusa tamanho de arquivo que não bate', () => {
    const bytes = writeBoneb(minimalDoc());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    view.setBigUint64(24, BigInt(bytes.length + 8), true);
    try {
      readBoneb(bytes);
      throw new Error('deveria ter recusado');
    } catch (e) {
      expect((e as BonebReadError).code).toBe('BIN_FILE_SIZE');
    }
  });

  it('recusa um layout binário mais novo, citando as duas versões', () => {
    const bytes = writeBoneb(minimalDoc());
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    view.setUint16(8, 7, true);
    try {
      readBoneb(bytes);
      throw new Error('deveria ter recusado');
    } catch (e) {
      expect((e as BonebReadError).code).toBe('BIN_LAYOUT_VERSION');
      expect((e as Error).message).toContain('7');
      expect((e as Error).message).toContain('1');
    }
  });

  it('o índice INDX aponta para cada animação e cada skin', () => {
    const { doc } = exemplo('heroi.bone');
    const lido = readBonebWithReport(writeBoneb(doc));
    const animacoes = (doc['animations'] as { name: string }[]).map((a) => a.name);
    const noIndice = lido.index.filter((e) => e.kind === 1).map((e) => e.name);
    expect(noIndice).toEqual(animacoes);
    expect(lido.header.flags & 1).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Forward compatibility (spec 11.1, 11.4, 11.5, 11.9)
// ---------------------------------------------------------------------------

describe('.boneb: o que o leitor não conhece, ele pula', () => {
  it('arquivo com seção desconhecida continua legível', () => {
    const doc = minimalDoc();
    const carga = new TextEncoder().encode('dados de uma versão futura');
    const bytes = writeBoneb(doc, { extraSections: [{ tag: 'ZZZZ', bytes: carga }] });
    const lido = readBonebWithReport(bytes);
    expect(deepDiff(doc, lido.value)).toBeNull();
    expect(lido.unknownSections.map((s) => s.tag)).toEqual(['ZZZZ']);
    expect(lido.unknownSections[0]!.bytes).toEqual(carga);
    expect(lido.warnings.join(' ')).toContain('ZZZZ');
  });

  it('a seção desconhecida sobrevive a uma regravação', () => {
    const doc = minimalDoc();
    const carga = new TextEncoder().encode('preservar');
    const primeiro = readBonebWithReport(writeBoneb(doc, { extraSections: [{ tag: 'ZZZZ', bytes: carga }] }));
    const segundo = readBonebWithReport(writeBoneb(primeiro.value, { extraSections: primeiro.unknownSections }));
    expect(segundo.unknownSections.map((s) => s.tag)).toEqual(['ZZZZ']);
    expect(segundo.unknownSections[0]!.bytes).toEqual(carga);
  });

  it('valor de tipo futuro (0x20+) é pulado e o resto abre', () => {
    // `edges: [11, 22, 33, 44]` vira `0D 04000000 0B 16 21 2C`: 9 bytes.
    // Trocando a etiqueta por 0x30, os mesmos 9 bytes viram um tipo futuro
    // com `u32 byteLength = 4` seguido de 4 bytes — o leitor pula igual.
    const doc = { ...minimalDoc(), edges: [11, 22, 33, 44], depois: 'continua' };
    const bytes = writeBoneb(doc, { blocks: false });
    const at = acharSequencia(bytes, [0x0d, 0x04, 0x00, 0x00, 0x00, 11, 22, 33, 44]);
    expect(at).toBeGreaterThan(0);
    bytes[at] = 0x30;
    const lido = readBonebWithReport(bytes);
    expect(lido.value).not.toHaveProperty('edges');
    expect((lido.value as unknown as Record<string, unknown>)['depois']).toBe('continua');
    expect(lido.warnings.join(' ')).toContain('0x30');
  });

  it('tipo reservado (0x10..0x1F) faz o leitor recusar', () => {
    const doc = { ...minimalDoc(), edges: [11, 22, 33, 44] };
    const bytes = writeBoneb(doc, { blocks: false });
    const at = acharSequencia(bytes, [0x0d, 0x04, 0x00, 0x00, 0x00, 11, 22, 33, 44]);
    expect(at).toBeGreaterThan(0);
    bytes[at] = 0x10;
    try {
      readBoneb(bytes);
      throw new Error('deveria ter recusado');
    } catch (e) {
      expect((e as BonebReadError).code).toBe('BIN_TREE_TYPE_RESERVED');
    }
  });

  it('bloco de kind desconhecido é pulado e a propriedade some', () => {
    const vertices = Array.from({ length: 200 }, (_, i) => i * 0.25);
    const doc = {
      ...minimalDoc(),
      skins: [{ name: 'default', attachments: { s: { m: { type: 'mesh', vertices } } } }],
    };
    const bytes = writeBoneb(doc);
    // Troca o `kind` do primeiro bloco (VERT = 18) por um valor de outra versão.
    const blob = secaoDe(bytes, 'BLOB');
    expect(blob).not.toBeNull();
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    expect(view.getUint32(blob! + 4, true)).toBe(18);
    view.setUint32(blob! + 4, 999, true);
    const lido = readBonebWithReport(bytes);
    const malha = ((lido.value as unknown as Record<string, unknown>)['skins'] as Record<string, unknown>[])[0]!;
    const attachments = (malha['attachments'] as Record<string, Record<string, Record<string, unknown>>>);
    expect(attachments['s']!['m']!).not.toHaveProperty('vertices');
    expect(attachments['s']!['m']!['type']).toBe('mesh');
    expect(lido.warnings.join(' ')).toContain('999');
  });
});

function acharSequencia(bytes: Uint8Array, alvo: readonly number[]): number {
  outer: for (let i = 0; i + alvo.length <= bytes.length; i++) {
    for (let k = 0; k < alvo.length; k++) {
      if (bytes[i + k] !== alvo[k]) continue outer;
    }
    return i;
  }
  return -1;
}

/** Offset da seção com essa etiqueta, ou `null` quando não existe. */
function secaoDe(bytes: Uint8Array, tag: string): number | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const count = view.getUint32(20, true);
  for (let i = 0; i < count; i++) {
    const at = 32 + i * 24;
    let nome = '';
    for (let k = 0; k < 4; k++) nome += String.fromCharCode(view.getUint8(at + k));
    if (nome === tag) return Number(view.getBigUint64(at + 8, true));
  }
  return null;
}

// ---------------------------------------------------------------------------
// Strings, arrays and canonical blocks
// ---------------------------------------------------------------------------

describe('.boneb: texto, listas grandes e blocos canônicos', () => {
  it('texto com acento e emoji volta idêntico', () => {
    const doc = {
      ...minimalDoc(),
      skeleton: { name: 'ação de coração 🦴🎬' },
      tags: ['ataque', 'ação', 'não-sei', '日本語', '🦴'],
      extras: { autor: 'Humberto — versão “final”', nota: 'ç ã õ é ü ñ' },
    };
    const volta = readBoneb(writeBoneb(doc)) as unknown as Record<string, unknown>;
    expect(volta['tags']).toEqual(doc.tags);
    expect(volta['extras']).toEqual(doc.extras);
    expect((volta['skeleton'] as Record<string, unknown>)['name']).toBe(doc.skeleton.name);
  });

  it('texto repetido entra uma vez só na tabela de strings', () => {
    const repetido = { ...minimalDoc(), a: 'igualzinho', b: 'igualzinho', c: 'igualzinho' };
    const unico = { ...minimalDoc(), a: 'igualzinho', b: 'diferente1', c: 'diferente2' };
    expect(writeBoneb(repetido).length).toBeLessThan(writeBoneb(unico).length);
  });

  it('array grande de números volta igual (bloco TKEY)', () => {
    const keys = Array.from({ length: 500 }, (_, i) => ({
      time: i / 30,
      value: Math.sin(i / 7) * 100,
      ...(i % 5 === 0 ? { curve: 'stepped' as const } : {}),
      ...(i % 7 === 0 ? { curve: [i / 30, 0, i / 30 + 0.01, 1] } : {}),
    }));
    const doc = {
      ...minimalDoc(),
      animations: [{ name: 'longa', timelines: [{ type: 'bone', target: 'root', property: 'x', keys }] }],
    };
    const bytes = writeBoneb(doc);
    expect(deepDiff(doc, readBoneb(bytes))).toBeNull();
    // Com bloco tem que ficar menor do que sem bloco.
    expect(bytes.length).toBeLessThan(writeBoneb(doc, { blocks: false }).length);
  });

  it('cor de 4 componentes e darkColor com null passam pelo TKEY', () => {
    const keys = Array.from({ length: 100 }, (_, i) => ({
      time: i / 30,
      value: i % 10 === 0 ? null : [i / 100, 0.5, 0.25],
    }));
    const doc = {
      ...minimalDoc(),
      animations: [{ name: 'cor', timelines: [{ type: 'slot', target: 's', property: 'darkColor', keys }] }],
    };
    const volta = readBoneb(writeBoneb(doc)) as unknown;
    expect(deepDiff(doc, volta)).toBeNull();
  });

  it('binding grande volta igual (bloco BIND)', () => {
    const n = 120;
    const counts: number[] = [];
    const bones: number[] = [];
    const positions: number[] = [];
    const weights: number[] = [];
    for (let v = 0; v < n; v++) {
      counts.push(2);
      bones.push(0, 1);
      positions.push(v * 1.5, v * -0.25, v * 0.75, v * 2);
      weights.push(0.75, 0.25);
    }
    const doc = {
      ...minimalDoc(),
      bones: [{ name: 'root' }, { name: 'b', parent: 'root' }],
      skins: [{
        name: 'default',
        attachments: {
          slot: {
            malha: {
              type: 'mesh',
              binding: { counts, bones, positions, weights },
              uvs: Array.from({ length: n * 2 }, (_, i) => (i % 100) / 100),
              triangles: [0, 1, 2],
            },
          },
        },
      }],
    };
    const bytes = writeBoneb(doc);
    expect(deepDiff(doc, readBoneb(bytes))).toBeNull();
    // O BIND troca tamanho por acesso direto: `counts` e `bones` viram u32
    // para o runtime apontar um array direto na memória (11.6). Ele pode ficar
    // maior que a árvore; o que importa é a seção BLOB existir e voltar igual.
    expect(secaoDe(bytes, 'BLOB')).not.toBeNull();
    expect(secaoDe(writeBoneb(doc, { blocks: false }), 'BLOB')).toBeNull();
  });

  it('vertices grande volta igual (bloco VERT)', () => {
    const vertices = Array.from({ length: 400 }, (_, i) => i * 0.125 - 25);
    const doc = {
      ...minimalDoc(),
      skins: [{ name: 'default', attachments: { s: { m: { type: 'mesh', vertices, triangles: [0, 1, 2] } } } }],
    };
    expect(deepDiff(doc, readBoneb(writeBoneb(doc)))).toBeNull();
  });

  it('chaves com propriedade fora de time/value/curve ficam na árvore', () => {
    const keys = Array.from({ length: 100 }, (_, i) => ({ time: i / 30, value: [1, 2], offset: i }));
    const doc = {
      ...minimalDoc(),
      animations: [{ name: 'deform', timelines: [{ type: 'deform', target: 's', keys }] }],
    };
    expect(deepDiff(doc, readBoneb(writeBoneb(doc)))).toBeNull();
  });

  it('inteiros da spec continuam inteiros exatos', () => {
    const doc = {
      ...minimalDoc(),
      skins: [{
        name: 'default',
        attachments: {
          s: {
            m: {
              type: 'mesh',
              triangles: [0, 1, 2, 3, 70000, 2147483647],
              hull: 4,
              edges: [0, 1, 1, 2],
              vertices: [0.1, 0.2, 0.3, 0.4],
            },
          },
        },
      }],
    };
    const volta = readBoneb(writeBoneb(doc)) as unknown as Record<string, unknown>;
    const malha = ((volta['skins'] as Record<string, unknown>[])[0]!['attachments'] as Record<string, Record<string, Record<string, unknown>>>)['s']!['m']!;
    expect(malha['triangles']).toEqual([0, 1, 2, 3, 70000, 2147483647]);
    expect(malha['hull']).toBe(4);
  });

  it('recusa NaN e Infinity, que não são valores do formato (2.1)', () => {
    expect(() => writeBoneb({ ...minimalDoc(), x: Number.NaN })).toThrowError(BonebWriteError);
    expect(() => writeBoneb({ ...minimalDoc(), x: Number.POSITIVE_INFINITY })).toThrowError(BonebWriteError);
  });

  it('recusa árvore com mais de 64 níveis (12.6)', () => {
    let fundo: Record<string, unknown> = { fim: 1 };
    for (let i = 0; i < 80; i++) fundo = { dentro: fundo };
    expect(() => writeBoneb({ ...minimalDoc(), extras: fundo })).toThrowError(BonebWriteError);
  });
});

// ---------------------------------------------------------------------------
// Container .bonez (spec 2.9)
// ---------------------------------------------------------------------------

describe('.bonez: o pacote', () => {
  function pacoteSimples(): Uint8Array {
    const { doc } = exemplo('heroi.bone');
    return writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'heroi.boneb', skeletons: ['heroi.boneb'] },
      files: [{ name: 'heroi.boneb', data: writeBoneb(doc) }],
    }, CODEC);
  }

  it('o mimetype fica na posição exata que 2.9 manda', () => {
    const zip = pacoteSimples();
    const texto = new TextDecoder();
    expect([...zip.subarray(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    expect(texto.decode(zip.subarray(30, 38))).toBe(BONEZ_MIMETYPE_ENTRY);
    expect(texto.decode(zip.subarray(38, 38 + BONEZ_MIMETYPE.length))).toBe(BONEZ_MIMETYPE);
    const view = new DataView(zip.buffer, zip.byteOffset, zip.byteLength);
    expect(view.getUint16(8, true)).toBe(0); // método Store
    expect(view.getUint16(6, true)).toBe(0); // sem data descriptor, sem UTF-8
    expect(view.getUint16(28, true)).toBe(0); // extra field de comprimento 0
  });

  it('ida e volta pelo pacote devolve o mesmo esqueleto', () => {
    const { doc } = exemplo('heroi.bone');
    const zip = pacoteSimples();
    const pacote = readBonez(zip, CODEC);
    expect(pacote.mainName).toBe('heroi.boneb');
    expect(pacote.manifest.bonez.version).toBe('1.0');
    expect(deepDiff(doc, readBoneb(pacote.readMain()))).toBeNull();
    expect(pacote.warnings).toEqual([]);
  });

  it('o pacote comprimido é menor que o .bone solto', () => {
    const { texto } = exemplo('heroi.bone');
    expect(pacoteSimples().length).toBeLessThan(new TextEncoder().encode(texto).length);
  });

  it('lista as entradas e lê qualquer uma pelo nome', () => {
    const zip = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'x.bone', atlases: ['arte/x.atlas.json'] },
      files: [
        { name: 'x.bone', data: new TextEncoder().encode(JSON.stringify(minimalDoc())) },
        { name: 'arte/x.atlas.json', data: new TextEncoder().encode('{"atlas":{"version":"1.0"}}') },
      ],
    }, CODEC);
    const pacote = readBonez(zip, CODEC);
    expect(pacote.names()).toContain('arte/x.atlas.json');
    expect(new TextDecoder().decode(pacote.read('arte/x.atlas.json')!)).toContain('atlas');
    expect(pacote.read('nao-existe.png')).toBeUndefined();
  });

  it('avisa quando uma entrada não está listada no manifesto (ZIP_UNLISTED)', () => {
    const zip = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'x.bone' },
      files: [
        { name: 'x.bone', data: new TextEncoder().encode(JSON.stringify(minimalDoc())) },
        { name: 'solta.txt', data: new TextEncoder().encode('oi') },
      ],
    }, CODEC);
    expect(readBonez(zip, CODEC).warnings.join(' ')).toContain('solta.txt');
  });

  it('funciona sem compressor nenhum, só com Store', () => {
    const zip = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'x.bone' },
      files: [{ name: 'x.bone', data: new TextEncoder().encode(JSON.stringify(minimalDoc())) }],
    });
    const pacote = readBonez(zip);
    expect(JSON.parse(new TextDecoder().decode(pacote.readMain()))).toEqual(minimalDoc());
  });

  it('detecta arquivo corrompido pelo CRC', () => {
    const zip = pacoteSimples();
    const pacote = readBonez(zip, CODEC);
    const at = zip.length - 200;
    zip[at] = zip[at]! ^ 0xff;
    void pacote;
    expect(() => readBonez(zip, CODEC).readMain()).toThrow();
  });
});

describe('.bonez: segurança (12.6)', () => {
  it('recusa caminho com dois pontos seguidos, na gravação', () => {
    for (const nome of ['../fora.bone', 'a/../b.bone', 'a/..', '..']) {
      expect(() => writeBonez({
        manifest: { bonez: { version: '1.0' }, main: nome },
        files: [{ name: nome, data: new Uint8Array(1) }],
      }, CODEC)).toThrowError(BonezError);
    }
  });

  it('recusa caminho com dois pontos seguidos, na leitura', () => {
    // Nomes do mesmo tamanho, para trocar byte a byte num ZIP já pronto.
    const zip = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'ab/x.bone' },
      files: [{ name: 'ab/x.bone', data: new TextEncoder().encode(JSON.stringify(minimalDoc())) }],
    }, CODEC);
    const de = new TextEncoder().encode('ab/x.bone');
    const para = new TextEncoder().encode('../x.bone');
    for (let i = 0; i + de.length <= zip.length; i++) {
      let bate = true;
      for (let k = 0; k < de.length; k++) if (zip[i + k] !== de[k]) { bate = false; break; }
      if (bate) zip.set(para, i);
    }
    try {
      readBonez(zip, CODEC);
      throw new Error('deveria ter recusado');
    } catch (e) {
      expect((e as BonezError).code).toBe('URI_INVALID');
    }
  });

  it('recusa nome absoluto, barra invertida e dois-pontos', () => {
    expect(checkEntryName('/raiz.bone')).not.toBeNull();
    expect(checkEntryName('pasta\\x.bone')).not.toBeNull();
    expect(checkEntryName('C:/x.bone')).not.toBeNull();
    expect(checkEntryName('a//b.bone')).not.toBeNull();
    expect(checkEntryName('a/./b.bone')).not.toBeNull();
    expect(checkEntryName('a%2F..%2Fb')).not.toBeNull();
    expect(checkEntryName('imagens/heroi.png')).toBeNull();
  });

  it('recusa zip bomb pela razão de compressão', () => {
    const bomba = new Uint8Array(2 * 1024 * 1024); // 2 MiB de zeros
    const zip = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'x.bone', images: ['bomba.bin'] },
      files: [
        { name: 'x.bone', data: new TextEncoder().encode(JSON.stringify(minimalDoc())) },
        { name: 'bomba.bin', data: bomba, compress: true },
      ],
    }, CODEC);
    expect(zip.length).toBeLessThan(64 * 1024);
    try {
      readBonez(zip, CODEC);
      throw new Error('deveria ter recusado');
    } catch (e) {
      expect((e as BonezError).code).toBe('LIMIT_ZIP_RATIO');
    }
  });

  it('recusa quando o total descompactado passa do limite', () => {
    const zip = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'x.bone' },
      files: [{ name: 'x.bone', data: new TextEncoder().encode(JSON.stringify(minimalDoc())) }],
    }, CODEC);
    try {
      readBonez(zip, CODEC, { maxTotalUncompressed: 16 });
      throw new Error('deveria ter recusado');
    } catch (e) {
      expect((e as BonezError).code).toBe('LIMIT_ZIP_TOTAL');
    }
  });

  it('recusa nome repetido', () => {
    expect(() => writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'x.bone' },
      files: [
        { name: 'x.bone', data: new Uint8Array(1) },
        { name: 'x.bone', data: new Uint8Array(1) },
      ],
    }, CODEC)).toThrowError(BonezError);
  });

  it('recusa bytes que não começam com o mimetype', () => {
    const zip = writeBonez({
      manifest: { bonez: { version: '1.0' }, main: 'x.bone' },
      files: [{ name: 'x.bone', data: new Uint8Array(1) }],
    }, CODEC);
    zip[38] = 0x41;
    try {
      readBonez(zip, CODEC);
      throw new Error('deveria ter recusado');
    } catch (e) {
      expect((e as BonezError).code).toBe('ZIP_MIMETYPE');
    }
  });

  it('o CRC-32 é o do ZIP', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });
});
