/**
 * Exportar imagem: sequência de PNG, folha de sprites e GIF (requisito E5).
 *
 * O que se prova aqui, com conta à mão:
 *   1. Quais instantes viram quadro, e por que o último de um laço fica de fora.
 *   2. A câmera: `cameraFor` do TypeScript e `cameraDe` do `render-png.mjs`
 *      devolvem o MESMO número. Se uma mudar sozinha, este caso quebra.
 *   3. O recorte automático acha a caixa do conteúdo, e corta todos os quadros
 *      pela MESMA caixa (senão a folha de sprites não teria grade).
 *   4. A grade da folha de sprites, e o JSON de índice que vai junto.
 *   5. A paleta: quando as cores cabem, nada é aproximado.
 *   6. O LZW do GIF, byte a byte, contra uma codificação feita na mão.
 *   7. Um GIF de 2 cores e 2 quadros, lido de volta: cabeçalho, descritor de
 *      tela, paleta, bloco NETSCAPE, bloco de controle gráfico com o atraso, e
 *      os pixels de cada quadro descomprimidos de novo.
 *   8. A linha de comando grava os arquivos e escreve o resumo em português.
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import {
  FFMPEG_HINT, GIF89A, autoCropFrames, buildPalette, buildSpriteSheet, cameraFor, contentBox,
  cropFrame, encodeGif, frameFileName, frameTimes, indexFrame, lzwEncode, paletteBits,
  renderSequence, sheetGridFor, unionBox, type RgbaFrame,
} from '../src/exportar/quadros.js';

const RAIZ = 'C:/Users/F-rak/Desktop/animador';
const EXEMPLO = `${RAIZ}/formato/exemplos/heroi.bone`;

// ---------------------------------------------------------------------------
// Ferramentas do teste
// ---------------------------------------------------------------------------

/** Um quadro cheio de uma cor só. */
function solidFrame(width: number, height: number, rgba: [number, number, number, number]): RgbaFrame {
  const px = new Uint8Array(width * height * 4);
  for (let i = 0; i < px.length; i += 4) {
    px[i] = rgba[0];
    px[i + 1] = rgba[1];
    px[i + 2] = rgba[2];
    px[i + 3] = rgba[3];
  }
  return { width, height, rgba: px };
}

/** Escreve um pixel num quadro. */
function put(frame: RgbaFrame, x: number, y: number, rgba: [number, number, number, number]): void {
  const at = (y * frame.width + x) * 4;
  frame.rgba[at] = rgba[0];
  frame.rgba[at + 1] = rgba[1];
  frame.rgba[at + 2] = rgba[2];
  frame.rgba[at + 3] = rgba[3];
}

// ---------------------------------------------------------------------------
// Um leitor de GIF, escrito aqui, para ler de volta o que o escritor gravou
// ---------------------------------------------------------------------------

interface GifFrame {
  delayCentis: number;
  transparentIndex: number;
  disposal: number;
  left: number;
  top: number;
  width: number;
  height: number;
  minCodeSize: number;
  /** Bytes do fluxo LZW, já sem as sub-blocos. */
  lzw: Uint8Array;
  /** Um índice de paleta por pixel. */
  indices: number[];
}

interface GifFile {
  signature: string;
  width: number;
  height: number;
  hasGlobalTable: boolean;
  tableSize: number;
  palette: number[][];
  loop: number | null;
  frames: GifFrame[];
}

/** Desfaz as sub-blocos de no máximo 255 bytes. Devolve os bytes e onde parou. */
function readSubBlocks(bytes: Uint8Array, at: number): { data: Uint8Array; next: number } {
  const parts: number[] = [];
  let i = at;
  while (bytes[i] !== 0) {
    const size = bytes[i]!;
    for (let k = 1; k <= size; k++) parts.push(bytes[i + k]!);
    i += size + 1;
  }
  return { data: Uint8Array.from(parts), next: i + 1 };
}

/** O LZW do GIF, ao contrário. É o decodificador do apêndice F da spec 87a. */
function lzwDecode(data: Uint8Array, minCodeSize: number): number[] {
  const clearCode = 1 << minCodeSize;
  const endCode = clearCode + 1;
  let table: number[][] = [];
  const reset = (): void => {
    table = [];
    for (let i = 0; i < clearCode; i++) table.push([i]);
    table.push([], []); // clear e end
  };
  reset();

  let codeSize = minCodeSize + 1;
  let bitAt = 0;
  const out: number[] = [];
  let previous: number[] | null = null;

  const readCode = (): number => {
    let code = 0;
    for (let bit = 0; bit < codeSize; bit++) {
      const byte = data[(bitAt >> 3)] ?? 0;
      code |= ((byte >> (bitAt & 7)) & 1) << bit;
      bitAt++;
    }
    return code;
  };

  for (;;) {
    if ((bitAt >> 3) >= data.length) break;
    const code = readCode();
    if (code === clearCode) {
      reset();
      codeSize = minCodeSize + 1;
      previous = null;
      continue;
    }
    if (code === endCode) break;
    let entry: number[];
    if (code < table.length && table[code]!.length > 0) entry = table[code]!;
    else if (previous !== null) entry = [...previous, previous[0]!];
    else throw new Error(`código LZW ${code} sem entrada na tabela`);
    out.push(...entry);
    if (previous !== null) {
      table.push([...previous, entry[0]!]);
      // O leitor anda uma entrada ATRÁS do escritor (a primeira leitura depois
      // do clear não põe nada na tabela), então ele passa a ler mais largo
      // quando a tabela ALCANÇA a potência de dois, não quando a passa. Um
      // bit de diferença aqui e o resto do fluxo vira lixo.
      if (table.length >= (1 << codeSize) && codeSize < 12) codeSize++;
    }
    previous = entry;
  }
  return out;
}

/** Lê um GIF inteiro de volta. */
function readGif(bytes: Uint8Array): GifFile {
  const signature = String.fromCharCode(...bytes.subarray(0, 6));
  const u16 = (at: number): number => bytes[at]! | (bytes[at + 1]! << 8);
  const width = u16(6);
  const height = u16(8);
  const packed = bytes[10]!;
  const hasGlobalTable = (packed & 0x80) !== 0;
  const tableSize = 1 << ((packed & 0x07) + 1);
  const palette: number[][] = [];
  let at = 13;
  if (hasGlobalTable) {
    for (let i = 0; i < tableSize; i++) {
      palette.push([bytes[at]!, bytes[at + 1]!, bytes[at + 2]!]);
      at += 3;
    }
  }

  let loop: number | null = null;
  const frames: GifFrame[] = [];
  let pendingDelay = 0;
  let pendingTransparent = -1;
  let pendingDisposal = 0;

  while (at < bytes.length) {
    const marker = bytes[at]!;
    if (marker === 0x3B) break;
    if (marker === 0x21) {
      const label = bytes[at + 1]!;
      if (label === 0xF9) {
        const flags = bytes[at + 3]!;
        pendingDisposal = (flags >> 2) & 0x07;
        pendingTransparent = (flags & 1) === 1 ? bytes[at + 6]! : -1;
        pendingDelay = u16(at + 4);
        at = readSubBlocks(bytes, at + 3 + bytes[at + 2]!).next;
        continue;
      }
      if (label === 0xFF) {
        const name = String.fromCharCode(...bytes.subarray(at + 3, at + 14));
        const block = readSubBlocks(bytes, at + 3 + bytes[at + 2]!);
        if (name === 'NETSCAPE2.0') loop = block.data[1]! | (block.data[2]! << 8);
        at = block.next;
        continue;
      }
      at = readSubBlocks(bytes, at + 3 + bytes[at + 2]!).next;
      continue;
    }
    if (marker !== 0x2C) throw new Error(`bloco desconhecido 0x${marker.toString(16)} em ${at}`);
    const left = u16(at + 1);
    const top = u16(at + 3);
    const w = u16(at + 5);
    const h = u16(at + 7);
    const minCodeSize = bytes[at + 10]!;
    const block = readSubBlocks(bytes, at + 11);
    frames.push({
      delayCentis: pendingDelay,
      transparentIndex: pendingTransparent,
      disposal: pendingDisposal,
      left, top, width: w, height: h, minCodeSize,
      lzw: block.data,
      indices: lzwDecode(block.data, minCodeSize),
    });
    at = block.next;
  }
  return { signature, width, height, hasGlobalTable, tableSize, palette, loop, frames };
}

// ---------------------------------------------------------------------------
// 1. Quais instantes viram quadro
// ---------------------------------------------------------------------------

describe('quais instantes viram quadro', () => {
  it('1 segundo a 30 quadros por segundo dá 30 quadros, do 0 ao 29/30', () => {
    const times = frameTimes({ duration: 1, fps: 30 });
    expect(times).toHaveLength(30);
    expect(times[0]).toBe(0);
    expect(times[29]).toBeCloseTo(29 / 30, 6);
  });

  it('o quadro do fim só entra quando é pedido — num laço ele repete o do começo', () => {
    expect(frameTimes({ duration: 1, fps: 4 })).toEqual([0, 0.25, 0.5, 0.75]);
    expect(frameTimes({ duration: 1, fps: 4, includeEnd: true })).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('o intervalo escolhido manda mais que a duração', () => {
    expect(frameTimes({ duration: 10, fps: 10, from: 0.5, to: 0.8 }))
      .toEqual([0.5, 0.6, 0.7]);
  });

  it('uma animação de duração zero ainda dá um quadro', () => {
    expect(frameTimes({ duration: 0, fps: 30 })).toEqual([0]);
  });
});

// ---------------------------------------------------------------------------
// 2. A câmera
// ---------------------------------------------------------------------------

describe('a câmera', () => {
  it('conta à mão: caixa 100x50, margem 0.1, largura 240', () => {
    // folga = max(100, 50) * 0.1 = 10
    // mundo = 100 + 20 = 120 de largura, 50 + 20 = 70 de altura
    // escala = 240 / 120 = 2, altura = 70 * 2 = 140
    const camera = cameraFor({ x: 0, y: 0, width: 100, height: 50 }, { width: 240, margin: 0.1 });
    expect(camera.scale).toBe(2);
    expect(camera.width).toBe(240);
    expect(camera.height).toBe(140);
    expect(camera.originX).toBe(-10);
    expect(camera.originY).toBe(-10);
  });

  it('sem largura, a escala manda', () => {
    const camera = cameraFor({ x: 5, y: 5, width: 10, height: 10 }, { scale: 3, margin: 0 });
    expect(camera.width).toBe(30);
    expect(camera.height).toBe(30);
    expect(camera.originX).toBe(5);
  });

  it('é a mesma conta do render-png.mjs — os dois caminhos não podem divergir', async () => {
    const rp = await import(pathToFileURL(`${RAIZ}/ferramentas/render-png.mjs`).href) as {
      cameraDe: (limites: unknown, op: unknown) => Record<string, number>;
      juntarLimites: (a: unknown, b: unknown) => Record<string, number>;
    };
    const caixa = { x: -13.5, y: 2.25, width: 187.5, height: 402.75 };
    for (const op of [
      { largura: 640, margem: 0.12 },
      { largura: 320, margem: 0 },
      { escala: 2.5, margem: 0.3 },
    ]) {
      const mjs = rp.cameraDe(caixa, op);
      const ts = cameraFor(caixa, {
        ...('largura' in op ? { width: op.largura as number } : {}),
        ...('escala' in op ? { scale: op.escala as number } : {}),
        margin: op.margem,
      });
      expect(mjs).toEqual(ts);
    }
  });

  it('juntar limites é a mesma união de retângulos dos dois lados', async () => {
    const rp = await import(pathToFileURL(`${RAIZ}/ferramentas/render-png.mjs`).href) as {
      juntarLimites: (a: unknown, b: unknown) => Record<string, number>;
    };
    const a = { x: 0, y: 0, width: 10, height: 10 };
    const b = { x: 5, y: -5, width: 10, height: 10 };
    expect(rp.juntarLimites(a, b)).toEqual(unionBox(a, b));
    expect(unionBox(a, b)).toEqual({ x: 0, y: -5, width: 15, height: 15 });
  });
});

// ---------------------------------------------------------------------------
// 3. O recorte automático
// ---------------------------------------------------------------------------

describe('recorte automático ao conteúdo', () => {
  it('acha a caixa do conteúdo num quadro quase vazio', () => {
    const frame = solidFrame(4, 4, [0, 0, 0, 0]);
    put(frame, 1, 2, [255, 0, 0, 255]);
    expect(contentBox(frame)).toEqual({ x: 1, y: 2, width: 1, height: 1 });
  });

  it('um quadro vazio não tem caixa', () => {
    expect(contentBox(solidFrame(3, 3, [0, 0, 0, 0]))).toBeNull();
  });

  it('o alfa que conta pode ser levantado, para o halo quase invisível sair', () => {
    const frame = solidFrame(3, 3, [0, 0, 0, 0]);
    put(frame, 0, 0, [9, 9, 9, 10]);
    put(frame, 2, 2, [9, 9, 9, 200]);
    expect(contentBox(frame, 1)).toEqual({ x: 0, y: 0, width: 3, height: 3 });
    expect(contentBox(frame, 100)).toEqual({ x: 2, y: 2, width: 1, height: 1 });
  });

  it('todos os quadros são cortados pela MESMA caixa, ou a folha perde a grade', () => {
    const a = solidFrame(6, 6, [0, 0, 0, 0]);
    put(a, 1, 1, [255, 0, 0, 255]);
    const b = solidFrame(6, 6, [0, 0, 0, 0]);
    put(b, 4, 3, [0, 255, 0, 255]);
    const cut = autoCropFrames([a, b]);
    // União de (1,1,1,1) e (4,3,1,1) = (1,1) até (4,3) = 4 de largura, 3 de altura.
    expect(cut.box).toEqual({ x: 1, y: 1, width: 4, height: 3 });
    expect(cut.frames[0]!.width).toBe(4);
    expect(cut.frames[0]!.height).toBe(3);
    expect(cut.frames[1]!.width).toBe(4);
    // O vermelho ficou no canto de cima e à esquerda do primeiro quadro.
    expect([...cut.frames[0]!.rgba.subarray(0, 4)]).toEqual([255, 0, 0, 255]);
    // O verde ficou na última coluna da última linha do segundo.
    const at = ((3 - 1) * 4 + (4 - 1)) * 4;
    expect([...cut.frames[1]!.rgba.subarray(at, at + 4)]).toEqual([0, 255, 0, 255]);
  });

  it('cortar fora do quadro devolve pixels limpos, não lixo', () => {
    const frame = solidFrame(2, 2, [10, 20, 30, 255]);
    const cut = cropFrame(frame, { x: 1, y: 1, width: 3, height: 3 });
    expect(cut.width).toBe(3);
    expect([...cut.rgba.subarray(0, 4)]).toEqual([10, 20, 30, 255]);
    expect([...cut.rgba.subarray(4, 8)]).toEqual([0, 0, 0, 0]);
  });
});

// ---------------------------------------------------------------------------
// 4. A folha de sprites
// ---------------------------------------------------------------------------

describe('folha de sprites', () => {
  it('a grade padrão é a mais quadrada possível', () => {
    expect(sheetGridFor(10)).toEqual({ columns: 4, rows: 3 });
    expect(sheetGridFor(16)).toEqual({ columns: 4, rows: 4 });
    expect(sheetGridFor(1)).toEqual({ columns: 1, rows: 1 });
    expect(sheetGridFor(12, 5)).toEqual({ columns: 5, rows: 3 });
  });

  it('conta à mão: 5 quadros de 4x3, 3 colunas, folga 2', () => {
    // célula = 4+2 por 3+2 = 6 x 5
    // largura = 3 * 6 + 2 = 20; altura = 2 * 5 + 2 = 12
    const frames = [0, 1, 2, 3, 4].map((i) => {
      const frame = solidFrame(4, 3, [0, 0, 0, 0]);
      put(frame, 0, 0, [i * 10, 0, 0, 255]);
      return { ...frame, time: i / 10 };
    });
    const { sheet, index } = buildSpriteSheet(frames, { columns: 3, padding: 2, imageName: 'walk.png', animation: 'walk', fps: 10 });
    expect(sheet.width).toBe(20);
    expect(sheet.height).toBe(12);
    expect(index.columns).toBe(3);
    expect(index.rows).toBe(2);
    expect(index.frameWidth).toBe(4);
    expect(index.frameHeight).toBe(3);
    expect(index.image).toBe('walk.png');
    expect(index.animation).toBe('walk');
    expect(index.fps).toBe(10);
    // Quadro 0 em (2, 2); quadro 2 em (2 + 2*6, 2) = (14, 2); quadro 3 em (2, 7).
    expect(index.frames[0]).toEqual({ index: 0, time: 0, x: 2, y: 2, width: 4, height: 3 });
    expect(index.frames[2]!.x).toBe(14);
    expect(index.frames[2]!.y).toBe(2);
    expect(index.frames[3]!.x).toBe(2);
    expect(index.frames[3]!.y).toBe(7);
    // E o pixel marcado de cada quadro está mesmo onde o índice diz.
    for (const entry of index.frames) {
      const at = (entry.y * sheet.width + entry.x) * 4;
      expect(sheet.rgba[at]).toBe(entry.index * 10);
      expect(sheet.rgba[at + 3]).toBe(255);
    }
  });

  it('um fundo opaco pinta a folha inteira, folga incluída', () => {
    const { sheet } = buildSpriteSheet([solidFrame(2, 2, [0, 0, 0, 0])], { padding: 1, background: [1, 2, 3] });
    expect(sheet.width).toBe(4);
    expect([...sheet.rgba.subarray(0, 4)]).toEqual([1, 2, 3, 255]);
  });

  it('quadros de tamanhos diferentes são recusados, não esticados', () => {
    expect(() => buildSpriteSheet([solidFrame(2, 2, [0, 0, 0, 0]), solidFrame(3, 2, [0, 0, 0, 0])]))
      .toThrow(/mesmo tamanho/);
  });

  it('o nome de um quadro da sequência é numerado com zeros à esquerda', () => {
    expect(frameFileName('walk', 7)).toBe('walk_0007.png');
    expect(frameFileName('walk', 1234)).toBe('walk_1234.png');
  });
});

// ---------------------------------------------------------------------------
// 5. A paleta
// ---------------------------------------------------------------------------

describe('paleta', () => {
  it('quando as cores cabem, nenhuma é aproximada', () => {
    const frame = solidFrame(2, 2, [0, 0, 0, 255]);
    put(frame, 0, 0, [10, 20, 30, 255]);
    put(frame, 1, 0, [40, 50, 60, 255]);
    put(frame, 0, 1, [70, 80, 90, 255]);
    put(frame, 1, 1, [100, 110, 120, 255]);
    const palette = buildPalette([frame], 256);
    expect(palette.count).toBe(4);
    expect(palette.transparentIndex).toBe(-1);
    const cores = new Set<string>();
    for (let i = 0; i < palette.count; i++) {
      cores.add([palette.colors[i * 3], palette.colors[i * 3 + 1], palette.colors[i * 3 + 2]].join(','));
    }
    expect(cores).toEqual(new Set(['10,20,30', '40,50,60', '70,80,90', '100,110,120']));
  });

  it('havendo pixel transparente, uma entrada é reservada para ele', () => {
    const frame = solidFrame(2, 1, [0, 0, 0, 0]);
    put(frame, 0, 0, [255, 255, 255, 255]);
    const palette = buildPalette([frame]);
    expect(palette.count).toBe(2);
    expect(palette.transparentIndex).toBe(1);
    const indices = indexFrame(frame, palette);
    expect([...indices]).toEqual([0, 1]);
  });

  it('mais cores do que cabe: corta pela mediana e cada pixel acha a mais perto', () => {
    const frame = solidFrame(4, 1, [0, 0, 0, 255]);
    put(frame, 0, 0, [0, 0, 0, 255]);
    put(frame, 1, 0, [10, 0, 0, 255]);
    put(frame, 2, 0, [240, 0, 0, 255]);
    put(frame, 3, 0, [250, 0, 0, 255]);
    const palette = buildPalette([frame], 2);
    expect(palette.count).toBe(2);
    const indices = indexFrame(frame, palette);
    // Os dois escuros num lado, os dois claros no outro.
    expect(indices[0]).toBe(indices[1]);
    expect(indices[2]).toBe(indices[3]);
    expect(indices[0]).not.toBe(indices[2]);
  });

  it('o tamanho da tabela é sempre uma potência de dois', () => {
    expect(paletteBits(2)).toBe(1);
    expect(paletteBits(3)).toBe(2);
    expect(paletteBits(4)).toBe(2);
    expect(paletteBits(5)).toBe(3);
    expect(paletteBits(256)).toBe(8);
  });
});

// ---------------------------------------------------------------------------
// 6. O LZW, byte a byte
// ---------------------------------------------------------------------------

describe('LZW do GIF', () => {
  it('conta à mão: quatro pixels da cor 0, com código mínimo de 2 bits', () => {
    // clear = 4, fim = 5, primeiro código livre = 6, códigos de 3 bits.
    // Sai: clear(4), "0"(0), "0,0"(6), "0"(0), fim(5).
    // Empacotado do bit menos significativo para o mais:
    //   4 | 0<<3 | 6<<6 = 388 -> byte 132, sobra 1 com 1 bit
    //   1 | 0<<1 ... na verdade sobra 1, depois 0 (3 bits) e 5 (3 bits):
    //   1 | (5<<4) = 81
    const bytes = lzwEncode(Uint8Array.from([0, 0, 0, 0]), 2);
    expect([...bytes]).toEqual([132, 81]);
    expect(lzwDecode(bytes, 2)).toEqual([0, 0, 0, 0]);
  });

  it('ida e volta com dados de verdade', () => {
    const indices = new Uint8Array(1000);
    for (let i = 0; i < indices.length; i++) indices[i] = (i * 7 + (i >> 4)) & 15;
    const bytes = lzwEncode(indices, 4);
    expect(lzwDecode(bytes, 4)).toEqual([...indices]);
  });

  it('uma sequência longa passa dos 4096 códigos e reinicia a tabela sem se perder', () => {
    const indices = new Uint8Array(30000);
    for (let i = 0; i < indices.length; i++) indices[i] = (i % 251) & 255;
    const bytes = lzwEncode(indices, 8);
    expect(lzwDecode(bytes, 8)).toEqual([...indices]);
  });
});

// ---------------------------------------------------------------------------
// 7. O GIF inteiro, lido de volta
// ---------------------------------------------------------------------------

describe('GIF de 2 cores e 2 quadros, lido de volta', () => {
  /** Quadro 1: linha branca em cima, preta embaixo. Quadro 2: ao contrário. */
  function twoColorFrames(): RgbaFrame[] {
    const a = solidFrame(2, 2, [0, 0, 0, 255]);
    put(a, 0, 0, [255, 255, 255, 255]);
    put(a, 1, 0, [255, 255, 255, 255]);
    const b = solidFrame(2, 2, [255, 255, 255, 255]);
    put(b, 0, 0, [0, 0, 0, 255]);
    put(b, 1, 0, [0, 0, 0, 255]);
    return [a, b];
  }

  it('cabeçalho, tela lógica e paleta', () => {
    const gif = readGif(encodeGif(twoColorFrames(), { fps: 10 }));
    expect(gif.signature).toBe(GIF89A);
    expect(gif.width).toBe(2);
    expect(gif.height).toBe(2);
    expect(gif.hasGlobalTable).toBe(true);
    // Duas cores cabem em 1 bit, e uma tabela de 1 bit tem 2 entradas.
    expect(gif.tableSize).toBe(2);
    const cores = new Set(gif.palette.map((c) => c.join(',')));
    expect(cores).toEqual(new Set(['0,0,0', '255,255,255']));
  });

  it('o bloco de controle gráfico traz o atraso, em centésimos de segundo', () => {
    const gif = readGif(encodeGif(twoColorFrames(), { fps: 10 }));
    expect(gif.frames).toHaveLength(2);
    // 10 quadros por segundo = 100/10 = 10 centésimos por quadro.
    expect(gif.frames[0]!.delayCentis).toBe(10);
    expect(gif.frames[1]!.delayCentis).toBe(10);
    // Sem pixel transparente, nenhum índice é marcado como vazado.
    expect(gif.frames[0]!.transparentIndex).toBe(-1);
    expect(gif.frames[0]!.disposal).toBe(2);
  });

  it('25 quadros por segundo dão 4 centésimos, e o atraso pode vir por quadro', () => {
    expect(readGif(encodeGif(twoColorFrames(), { fps: 25 })).frames[0]!.delayCentis).toBe(4);
    const escolhido = readGif(encodeGif(twoColorFrames(), { delaysCentis: [7, 33] }));
    expect(escolhido.frames.map((f) => f.delayCentis)).toEqual([7, 33]);
  });

  it('o laço vem no bloco NETSCAPE, e 0 quer dizer para sempre', () => {
    expect(readGif(encodeGif(twoColorFrames(), { fps: 10 })).loop).toBe(0);
    expect(readGif(encodeGif(twoColorFrames(), { fps: 10, loop: 3 })).loop).toBe(3);
  });

  it('os pixels voltam iguais aos que entraram', () => {
    const frames = twoColorFrames();
    const gif = readGif(encodeGif(frames, { fps: 10 }));
    const branco = gif.palette.findIndex((c) => c[0] === 255);
    const preto = gif.palette.findIndex((c) => c[0] === 0);
    // Quadro 1: branco, branco, preto, preto. Quadro 2: o contrário.
    expect(gif.frames[0]!.indices).toEqual([branco, branco, preto, preto]);
    expect(gif.frames[1]!.indices).toEqual([preto, preto, branco, branco]);
    // Um GIF nunca usa menos de 2 bits por código, mesmo com 2 cores.
    expect(gif.frames[0]!.minCodeSize).toBe(2);
    expect(gif.frames[0]!.width).toBe(2);
    expect(gif.frames[0]!.left).toBe(0);
  });

  it('com pixel transparente, o índice reservado aparece no bloco de controle', () => {
    const a = solidFrame(2, 1, [0, 0, 0, 0]);
    put(a, 0, 0, [12, 34, 56, 255]);
    const gif = readGif(encodeGif([a], { fps: 10 }));
    expect(gif.frames[0]!.transparentIndex).toBeGreaterThanOrEqual(0);
    expect(gif.frames[0]!.indices[1]).toBe(gif.frames[0]!.transparentIndex);
  });

  it('o GIF87a existe, carrega um quadro só e não promete atraso', () => {
    const bytes = encodeGif(twoColorFrames(), { gif87a: true });
    expect(String.fromCharCode(...bytes.subarray(0, 6))).toBe('GIF87a');
    const gif = readGif(bytes);
    expect(gif.frames).toHaveLength(1);
    expect(gif.loop).toBeNull();
  });

  it('quadros de tamanhos diferentes são recusados', () => {
    expect(() => encodeGif([solidFrame(2, 2, [0, 0, 0, 255]), solidFrame(3, 2, [0, 0, 0, 255])]))
      .toThrow(/mesmo tamanho/);
  });
});

// ---------------------------------------------------------------------------
// 8. A sequência inteira, com um desenhador de mentira
// ---------------------------------------------------------------------------

describe('renderSequence', () => {
  it('desenha um quadro por instante e guarda o tempo de cada um', async () => {
    const desenhados: number[] = [];
    const result = await renderSequence((time) => {
      desenhados.push(time);
      const frame = solidFrame(4, 4, [0, 0, 0, 0]);
      put(frame, Math.round(time * 10), 1, [255, 0, 0, 255]);
      return frame;
    }, { duration: 0.3, fps: 10 });
    expect(desenhados).toEqual([0, 0.1, 0.2]);
    expect(result.frames.map((f) => f.time)).toEqual([0, 0.1, 0.2]);
    expect(result.box).toBeNull();
  });

  it('com recorte, todos os quadros saem da mesma caixa', async () => {
    const result = await renderSequence((time) => {
      const frame = solidFrame(8, 8, [0, 0, 0, 0]);
      put(frame, Math.round(time * 10) + 2, 3, [255, 0, 0, 255]);
      return frame;
    }, { duration: 0.3, fps: 10, autoCrop: true });
    expect(result.box).toEqual({ x: 2, y: 3, width: 3, height: 1 });
    for (const frame of result.frames) {
      expect(frame.width).toBe(3);
      expect(frame.height).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 9. A linha de comando
// ---------------------------------------------------------------------------

describe('linha de comando', () => {
  function run(args: string[]): string {
    return execFileSync(process.execPath, [`${RAIZ}/ferramentas/exportar-imagem.mjs`, ...args], {
      encoding: 'utf8', cwd: RAIZ,
    });
  }

  it('grava a sequência de PNG, e diz o comando do ffmpeg para virar MP4', () => {
    const dir = mkdtempSync(join(tmpdir(), 'recorte-seq-'));
    try {
      const saida = run([EXEMPLO, 'walk', join(dir, 'walk'), '--formato', 'png', '--fps', '4', '--escala', '0.3']);
      const arquivos = readdirSync(dir).sort();
      expect(arquivos).toEqual(['walk_0000.png', 'walk_0001.png', 'walk_0002.png', 'walk_0003.png']);
      expect(readFileSync(join(dir, 'walk_0000.png')).subarray(1, 4).toString('latin1')).toBe('PNG');
      expect(saida).toContain('Imagens exportadas');
      expect(saida).toContain('ffmpeg');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('grava a folha de sprites com o JSON de índice ao lado', () => {
    const dir = mkdtempSync(join(tmpdir(), 'recorte-folha-'));
    try {
      run([EXEMPLO, 'walk', join(dir, 'walk'), '--formato', 'folha', '--fps', '5', '--escala', '0.3', '--colunas', '3']);
      const index = JSON.parse(readFileSync(join(dir, 'walk.json'), 'utf8')) as {
        image: string; columns: number; rows: number; count: number; frames: unknown[];
      };
      expect(index.image).toBe('walk.png');
      expect(index.columns).toBe(3);
      expect(index.count).toBe(index.frames.length);
      expect(index.rows).toBe(Math.ceil(index.count / 3));
      expect(readFileSync(join(dir, 'walk.png')).subarray(1, 4).toString('latin1')).toBe('PNG');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('grava o GIF, e ele volta a ser lido como GIF89a com os quadros certos', () => {
    const dir = mkdtempSync(join(tmpdir(), 'recorte-gif-'));
    try {
      run([EXEMPLO, 'walk', join(dir, 'walk'), '--formato', 'gif', '--fps', '5', '--escala', '0.3']);
      const gif = readGif(new Uint8Array(readFileSync(join(dir, 'walk.gif'))));
      expect(gif.signature).toBe(GIF89A);
      expect(gif.frames.length).toBeGreaterThan(1);
      expect(gif.frames[0]!.delayCentis).toBe(20);
      expect(gif.frames[0]!.indices).toHaveLength(gif.width * gif.height);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('um formato que não existe é recusado com uma frase em português', () => {
    expect(() => run([EXEMPLO, 'walk', 'saida', '--formato', 'mp4'])).toThrow(/formato aceita|Command failed/);
  });

  it('o comando de exemplo do ffmpeg está escrito no módulo, pronto para copiar', () => {
    expect(FFMPEG_HINT).toContain('ffmpeg');
    expect(FFMPEG_HINT).toContain('%04d.png');
  });
});
