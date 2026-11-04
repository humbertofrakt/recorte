// SPDX-License-Identifier: Apache-2.0
/**
 * O recorte por máscara feito na conta (rodada K3).
 *
 * O editor corta pelo Canvas (`ctx.clip`); o Construct não tem como, então o
 * leitor corta os triângulos. A prova é por AMOSTRAGEM: milhares de pontos ao
 * acaso; para cada um, a resposta da conta ("este ponto é desenhado? com que
 * uv?") tem de ser a que o editor daria — dentro da peça inteira E dentro da
 * máscara (ou fora, com `invert`), com o uv da peça inteira naquele ponto. E
 * nunca coberto duas vezes: o que é transparente sairia mais escuro.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// As regras do runtime (ik, física, caminho…) só existem depois deste import, como no addon:
// sem ele o esqueleto roda com regras 'noop' e o herói NÃO é o do jogo (achado na K5).
import '../src/pacote.js';
import { carregarBoneco } from '../src/carregar.js';
import { Avisos, pecasDoQuadro, type Peca, type RecorteDaPeca } from '../src/desenhador.js';
import { cortarPeca, triangularMascara, areaComSinal, type Mascara } from '../src/recorte.js';
import { Tocador } from '../src/tocador.js';

const EXEMPLOS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'formato', 'exemplos');

// --- geometria da prova (independente da do recorte) -------------------------

/** Dentro do polígono simples, pela regra par-ímpar (a do Canvas para polígono que não se cruza). */
function dentroDoPoligono(p: ArrayLike<number>, x: number, y: number): boolean {
  let dentro = false;
  const n = p.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = p[i * 2], yi = p[i * 2 + 1], xj = p[j * 2], yj = p[j * 2 + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

/** Distância do ponto ao segmento. */
function distSeg(px: number, py: number, ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax, dy = by - ay;
  const l = dx * dx + dy * dy;
  const t = l === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

/** Baricêntricas do ponto no triângulo `i` (índices na peça), ou null se fora. */
function bari(mundo: ArrayLike<number>, a: number, b: number, c: number, x: number, y: number): [number, number, number] | null {
  const ax = mundo[a * 2], ay = mundo[a * 2 + 1], bx = mundo[b * 2], by = mundo[b * 2 + 1], cx = mundo[c * 2], cy = mundo[c * 2 + 1];
  const d = (by - cy) * (ax - cx) + (cx - bx) * (ay - cy);
  if (Math.abs(d) < 1e-12) return null;
  const l1 = ((by - cy) * (x - cx) + (cx - bx) * (y - cy)) / d;
  const l2 = ((cy - ay) * (x - cx) + (ax - cx) * (y - cy)) / d;
  const l3 = 1 - l1 - l2;
  return l1 >= 0 && l2 >= 0 && l3 >= 0 ? [l1, l2, l3] : null;
}

/** Quantos triângulos cobrem o ponto, e o uv do primeiro. */
function cobertura(mundo: ArrayLike<number>, uvs: ArrayLike<number>, tri: ArrayLike<number>, x: number, y: number) {
  let n = 0;
  let uv: [number, number] | null = null;
  for (let k = 0; k + 2 < tri.length; k += 3) {
    const b = bari(mundo, tri[k], tri[k + 1], tri[k + 2], x, y);
    if (b === null) continue;
    n++;
    if (uv === null) {
      uv = [0, 0];
      for (let q = 0; q < 3; q++) { uv[0] += b[q] * uvs[tri[k + q] * 2]; uv[1] += b[q] * uvs[tri[k + q] * 2 + 1]; }
    }
  }
  return { n, uv };
}

/** Números ao acaso, sempre os mesmos (a prova se repete igual). */
function sorteio(semente: number) {
  let s = semente >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 2 ** 32; };
}

/** Todas as arestas que importam: as da peça inteira e as das máscaras. */
function arestas(mundo: ArrayLike<number>, tri: ArrayLike<number>, recortes: readonly { poligono: ArrayLike<number> }[]): number[][] {
  const saida: number[][] = [];
  for (let k = 0; k + 2 < tri.length; k += 3) {
    for (let q = 0; q < 3; q++) {
      const a = tri[k + q], b = tri[k + ((q + 1) % 3)];
      saida.push([mundo[a * 2], mundo[a * 2 + 1], mundo[b * 2], mundo[b * 2 + 1]]);
    }
  }
  for (const r of recortes) {
    const n = r.poligono.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      saida.push([r.poligono[i * 2], r.poligono[i * 2 + 1], r.poligono[j * 2], r.poligono[j * 2 + 1]]);
    }
  }
  return saida;
}

/**
 * Confere uma peça cortada contra a inteira com as máscaras. Devolve quantos
 * pontos caíram dentro (desenhados) e fora, para o teste ver que olhou dos dois lados.
 */
function conferir(
  inteira: { mundo: ArrayLike<number>; uvs: ArrayLike<number>; triangulos: ArrayLike<number> },
  recortes: readonly { poligono: ArrayLike<number>; inverter: boolean }[],
  cortada: { mundo: ArrayLike<number>; uvs: ArrayLike<number>; triangulos: ArrayLike<number> },
  pontos = 3000,
): { desenhados: number; cortados: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < inteira.mundo.length; i += 2) {
    minX = Math.min(minX, inteira.mundo[i]); maxX = Math.max(maxX, inteira.mundo[i]);
    minY = Math.min(minY, inteira.mundo[i + 1]); maxY = Math.max(maxY, inteira.mundo[i + 1]);
  }
  const bordas = arestas(inteira.mundo, inteira.triangulos, recortes);
  const acaso = sorteio(7);
  let desenhados = 0;
  let cortados = 0;
  for (let k = 0; k < pontos; k++) {
    const x = minX + (maxX - minX) * acaso();
    const y = minY + (maxY - minY) * acaso();
    if (bordas.some(([ax, ay, bx, by]) => distSeg(x, y, ax, ay, bx, by) < 1e-6)) continue;
    const dePeca = cobertura(inteira.mundo, inteira.uvs, inteira.triangulos, x, y);
    if (dePeca.n === 0) continue;
    const passa = recortes.every((r) => dentroDoPoligono(r.poligono, x, y) !== r.inverter);
    const nosso = cobertura(cortada.mundo, cortada.uvs, cortada.triangulos, x, y);
    expect(nosso.n, `ponto (${x}, ${y})`).toBe(passa ? 1 : 0);
    if (passa) {
      desenhados++;
      expect(nosso.uv![0]).toBeCloseTo(dePeca.uv![0], 9);
      expect(nosso.uv![1]).toBeCloseTo(dePeca.uv![1], 9);
    } else {
      cortados++;
    }
  }
  return { desenhados, cortados };
}

const QUADRADO = { mundo: [0, 0, 10, 0, 10, 10, 0, 10], uvs: [0, 1, 1, 1, 1, 0, 0, 0], triangulos: [0, 1, 2, 0, 2, 3] };
/** Um L (côncavo), passando pela peça. */
const ELE = Float64Array.of(-2, -2, 6, -2, 6, 4, 3, 4, 3, 12, -2, 12);

function mascara(poligono: Float64Array, inverter: boolean): Mascara {
  return { triangulos: triangularMascara(poligono)!, inverter };
}

describe('a máscara em triângulos', () => {
  it('um quadrado vira 2 triângulos, um L vira 4, nos dois sentidos; a área fecha', () => {
    for (const [p, n] of [[Float64Array.of(0, 0, 4, 0, 4, 4, 0, 4), 2], [ELE, 4]] as const) {
      for (const sentido of [p, inverterSentido(p)]) {
        const t = triangularMascara(sentido)!;
        expect(t).toHaveLength(n);
        const soma = t.reduce((s, tri) => s + areaComSinal(tri), 0);
        expect(soma).toBeCloseTo(Math.abs(areaComSinal(p)), 9);
        for (const tri of t) expect(areaComSinal(tri)).toBeGreaterThan(0);
      }
    }
  });

  it('a máscara que se cruza (um oito) não vira triângulo nenhum: devolve null, para avisar', () => {
    expect(triangularMascara(Float64Array.of(0, 0, 4, 4, 4, 0, 0, 4))).toBeNull();
  });
});

function inverterSentido(p: Float64Array): Float64Array {
  const s = new Float64Array(p.length);
  const n = p.length / 2;
  for (let i = 0; i < n; i++) { s[i * 2] = p[(n - 1 - i) * 2]; s[i * 2 + 1] = p[(n - 1 - i) * 2 + 1]; }
  return s;
}

describe('o corte, ponto a ponto', () => {
  it('dentro de um L côncavo: fica só o que está dentro, com o uv da peça', () => {
    const r = [{ poligono: ELE, inverter: false }];
    const c = cortarPeca(QUADRADO.mundo, QUADRADO.uvs, QUADRADO.triangulos, [mascara(ELE, false)]);
    const { desenhados, cortados } = conferir(QUADRADO, r, c);
    expect(desenhados).toBeGreaterThan(300);
    expect(cortados).toBeGreaterThan(300);
  });

  it('invert, fora do L: fica o resto, sem pedaço repetido', () => {
    const r = [{ poligono: ELE, inverter: true }];
    const c = cortarPeca(QUADRADO.mundo, QUADRADO.uvs, QUADRADO.triangulos, [mascara(ELE, true)]);
    const { desenhados, cortados } = conferir(QUADRADO, r, c);
    expect(desenhados).toBeGreaterThan(300);
    expect(cortados).toBeGreaterThan(300);
  });

  it('duas máscaras em fila (a do pai e a do aninhado): vale o corte das duas', () => {
    const outra = Float64Array.of(1, 1, 9, 1, 9, 9, 1, 9);
    const r = [{ poligono: outra, inverter: false }, { poligono: ELE, inverter: true }];
    const c = cortarPeca(QUADRADO.mundo, QUADRADO.uvs, QUADRADO.triangulos, [mascara(outra, false), mascara(ELE, true)]);
    const { desenhados } = conferir(QUADRADO, r, c);
    expect(desenhados).toBeGreaterThan(300);
  });

  it('a máscara longe da peça: dentro, nada fica; invert, fica tudo igual', () => {
    const longe = Float64Array.of(50, 50, 60, 50, 60, 60);
    expect(cortarPeca(QUADRADO.mundo, QUADRADO.uvs, QUADRADO.triangulos, [mascara(longe, false)]).triangulos).toHaveLength(0);
    const c = cortarPeca(QUADRADO.mundo, QUADRADO.uvs, QUADRADO.triangulos, [mascara(longe, true)]);
    conferir(QUADRADO, [{ poligono: longe, inverter: true }], c);
  });

  it('o conferidor pega um corte errado (regra 26)', () => {
    const r = [{ poligono: ELE, inverter: false }];
    // Cortar com a máscara invertida e conferir como se fosse a direita: tem de falhar.
    const errado = cortarPeca(QUADRADO.mundo, QUADRADO.uvs, QUADRADO.triangulos, [mascara(ELE, true)]);
    expect(() => conferir(QUADRADO, r, errado)).toThrow();
    // E a peça inteira, sem corte nenhum, também.
    expect(() => conferir(QUADRADO, r, QUADRADO)).toThrow();
  });
});

// --- o herói ------------------------------------------------------------------

async function lerExemplo(c: string): Promise<Uint8Array | null> {
  try { return new Uint8Array(readFileSync(join(EXEMPLOS, c))); } catch { return null; }
}

/** Peça que a máscara tirou inteira: some da lista. Para o conferidor, é uma peça vazia. */
const VAZIA = { mundo: [], uvs: [], triangulos: [] };

function conferirQuadro(cortadas: Peca[], inteiras: Peca[]): number {
  let comMascara = 0;
  let j = 0;
  for (const inteira of inteiras) {
    const nome = `${inteira.slot}/${inteira.anexo}`;
    const achada = j < cortadas.length && `${cortadas[j].slot}/${cortadas[j].anexo}` === nome ? cortadas[j++] : null;
    if (inteira.recortes.length === 0) {
      expect(achada, nome).not.toBeNull();
      expect(Array.from(achada!.mundo)).toEqual(Array.from(inteira.mundo));
      continue;
    }
    comMascara++;
    conferir(inteira, inteira.recortes as RecorteDaPeca[], achada ?? VAZIA, 1500);
  }
  expect(j).toBe(cortadas.length);
  return comMascara;
}

describe('o herói, com a máscara "mask"', () => {
  it('parado e andando: o corpo e a cabeça cortados como o editor corta; o resto, intacto', async () => {
    const heroi = await carregarBoneco('heroi.bone', lerExemplo);
    const t = new Tocador(heroi.arquivo.data);
    expect(conferirQuadro(pecasDoQuadro(t.esqueleto), pecasDoQuadro(t.esqueleto, undefined, { cortar: false }))).toBe(2);
    t.tocar('walk', true);
    t.avancar(0.4);
    expect(conferirQuadro(pecasDoQuadro(t.esqueleto), pecasDoQuadro(t.esqueleto, undefined, { cortar: false }))).toBe(2);
  });

  it('a máscara do herói até o fim (end = "hand"): a espada aninhada é cortada como um bloco', async () => {
    const texto = readFileSync(join(EXEMPLOS, 'heroi.bone'), 'utf8');
    const doc = JSON.parse(texto);
    doc.skins[0].attachments.mask.mask.end = 'hand';
    const bytes = new TextEncoder().encode(JSON.stringify(doc));
    const heroi = await carregarBoneco('heroi.bone', (c) => (c === 'heroi.bone' ? Promise.resolve(bytes) : lerExemplo(c)));
    const t = new Tocador(heroi.arquivo.data);
    const inteiras = pecasDoQuadro(t.esqueleto, undefined, { cortar: false });
    const lamina = inteiras.find((p) => p.profundidade === 1)!;
    expect(lamina.recortes.map((r) => r.nome)).toEqual(['mask']);
    expect(conferirQuadro(pecasDoQuadro(t.esqueleto), inteiras)).toBeGreaterThan(2);
  });
});

describe('a máscara que se cruza (7.7 proíbe)', () => {
  it('não corta, desenha a peça inteira e AVISA (regra 21)', async () => {
    const doc = JSON.parse(readFileSync(join(EXEMPLOS, 'heroi.bone'), 'utf8'));
    doc.skins[0].attachments.mask.mask.vertices = [-30, -70, 150, 70, 150, -70, -30, 70];
    const bytes = new TextEncoder().encode(JSON.stringify(doc));
    const heroi = await carregarBoneco('heroi.bone', (c) => (c === 'heroi.bone' ? Promise.resolve(bytes) : lerExemplo(c)));
    const t = new Tocador(heroi.arquivo.data);
    const avisos = new Avisos();
    const cortadas = pecasDoQuadro(t.esqueleto, avisos);
    const inteiras = pecasDoQuadro(t.esqueleto, undefined, { cortar: false });
    expect(cortadas.map((p) => Array.from(p.mundo))).toEqual(inteiras.map((p) => Array.from(p.mundo)));
    expect(avisos.todos().join('\n')).toContain('A máscara "mask" se cruza');
  });
});
