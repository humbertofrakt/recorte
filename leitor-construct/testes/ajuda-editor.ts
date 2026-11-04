// SPDX-License-Identifier: Apache-2.0
/**
 * A comparação com o desenhador do EDITOR, usada pelos testes do leitor.
 *
 * O editor (`runtime/src/render/canvas.ts`) não faz listas: ele pinta um
 * Canvas 2D. Aqui ele pinta num Canvas de mentira, que só anota — para cada
 * `drawImage`, o contorno do pedaço, as máscaras ativas e a matriz que leva a
 * imagem até ele. Da matriz se tiram os uv. As nossas peças têm de dar o mesmo
 * pedaço, na mesma ordem, no mesmo lugar, com o mesmo uv, a mesma
 * transparência, a mesma mistura e a mesma máscara.
 *
 * Não é arquivo de teste (não termina em .test.ts): é a régua que eles usam.
 */

import { expect } from 'vitest';
import { CanvasRenderer, BLEND_COMPOSITE } from '../../runtime/src/render/canvas.js';
import type { Skeleton } from '../../runtime/src/skeleton.js';
import { pecasDoQuadro, type Peca } from '../src/desenhador.js';

// --- o Canvas de mentira ------------------------------------------------------

type M = [number, number, number, number, number, number];
const IDENT: M = [1, 0, 0, 1, 0, 0];
function mult(m: M, n: M): M {
  return [
    m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
    m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
    m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
  ];
}
function aplicar(m: M, x: number, y: number): [number, number] {
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}
function inversa(m: M): M {
  const det = m[0] * m[3] - m[1] * m[2];
  return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det,
    (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det];
}

/** O que o editor pintou: um `drawImage` de página do atlas. */
interface Pintura {
  pagina: string;
  /** As máscaras que o Canvas aplicava: os pontos do caminho e a regra. */
  cortes: { pontos: [number, number][]; regra: string }[];
  pontos: [number, number][];
  matriz: M;
  alpha: number;
  composicao: string;
}

function canvasQueAnota(): { ctx: CanvasRenderingContext2D; pinturas: Pintura[] } {
  const pinturas: Pintura[] = [];
  let m: M = IDENT;
  let cortes: Pintura['cortes'] = [];
  const pilha: { m: M; alpha: number; comp: string; cortes: Pintura['cortes'] }[] = [];
  let caminho: [number, number][] = [];
  const estado = { globalAlpha: 1, globalCompositeOperation: 'source-over' };
  const alvo: Record<string, unknown> = {
    canvas: { width: 800, height: 800 },
    save: () => pilha.push({ m, alpha: estado.globalAlpha, comp: estado.globalCompositeOperation, cortes }),
    restore: () => {
      const s = pilha.pop()!;
      m = s.m; estado.globalAlpha = s.alpha; estado.globalCompositeOperation = s.comp; cortes = s.cortes;
    },
    clip: (regra?: string) => { cortes = [...cortes, { pontos: caminho.slice(), regra: regra ?? 'nonzero' }]; },
    beginPath: () => { caminho = []; },
    moveTo: (x: number, y: number) => { caminho.push(aplicar(m, x, y)); },
    lineTo: (x: number, y: number) => { caminho.push(aplicar(m, x, y)); },
    transform: (a: number, b: number, c: number, d: number, e: number, f: number) => { m = mult(m, [a, b, c, d, e, f]); },
    setTransform: (a: any, b?: number, c?: number, d?: number, e?: number, f?: number) => {
      m = typeof a === 'object' ? [a.a, a.b, a.c, a.d, a.e, a.f] : [a, b!, c!, d!, e!, f!];
    },
    getTransform: () => ({ a: m[0], b: m[1], c: m[2], d: m[3], e: m[4], f: m[5] }),
    drawImage: (imagem: any) => {
      if (typeof imagem?.pagina !== 'string') return;
      pinturas.push({ pagina: imagem.pagina, pontos: caminho.slice(), cortes: cortes.slice(0, -1), matriz: m, alpha: estado.globalAlpha, composicao: estado.globalCompositeOperation });
    },
  };
  const ctx = new Proxy(alvo, {
    get: (o, k: string) => (k in o ? o[k] : k in estado ? (estado as any)[k] : () => undefined),
    set: (o, k: string, v) => {
      if (k in estado) (estado as any)[k] = v;
      else o[k] = v;
      return true;
    },
  });
  return { ctx: ctx as unknown as CanvasRenderingContext2D, pinturas };
}

/** O editor desenha o esqueleto; devolve as pinturas, com o uv tirado da matriz. */
export function oQueOEditorDesenha(esqueleto: Skeleton) {
  const { ctx, pinturas } = canvasQueAnota();
  const tamanhos = new Map<string, [number, number]>();
  const r = new CanvasRenderer(ctx, {
    images: (pagina) => {
      tamanhos.set(pagina.name, [pagina.width, pagina.height]);
      return { pagina: pagina.name } as unknown as CanvasImageSource;
    },
    seamExpand: 0,
    // Sem superfície extra: a peça com cor vai direto, só com o alpha. A cor
    // RGB se confere à parte, contra o `computeFinalColor`.
    createScratch: () => { throw new Error('sem superfície extra no teste'); },
  });
  r.draw(esqueleto);
  return pinturas.map((p) => {
    const [pw, ph] = tamanhos.get(p.pagina)!;
    const inv = inversa(p.matriz);
    return { ...p, uvs: p.pontos.map(([x, y]) => { const [px, py] = aplicar(inv, x, y); return [px / pw, py / ph]; }) };
  });
}

/** As nossas peças, abertas no mesmo gesto do editor: região inteira, malha triângulo a triângulo. */
export function abertas(pecas: Peca[]) {
  const saida: { pagina: string; pontos: [number, number][]; uvs: [number, number][]; alpha: number; composicao: string; nome: string; recortes: Peca['recortes'] }[] = [];
  for (const p of pecas) {
    const ponto = (i: number): [number, number] => [p.mundo[i * 2], p.mundo[i * 2 + 1]];
    const uv = (i: number): [number, number] => [p.uvs[i * 2], p.uvs[i * 2 + 1]];
    const base = { pagina: p.pagina.name, alpha: p.cor[3], composicao: BLEND_COMPOSITE[p.mistura], nome: `${p.slot}/${p.anexo}`, recortes: p.recortes };
    if (p.tipo === 'region') {
      saida.push({ ...base, pontos: [0, 1, 2, 3].map(ponto), uvs: [0, 1, 2, 3].map(uv) });
      continue;
    }
    if (p.tipo === 'BONE_particle') {
      // O editor pinta cada partícula como um quadrado, com o alpha dela.
      for (let k = 0; k < p.mundo.length / 2; k += 4) {
        const v = [k, k + 1, k + 2, k + 3];
        saida.push({ ...base, alpha: p.coresPorVertice![k * 4 + 3], pontos: v.map(ponto), uvs: v.map(uv) });
      }
      continue;
    }
    const t = Array.from(p.triangulos);
    for (let k = 0; k < t.length; k += 3) {
      saida.push({ ...base, pontos: [t[k], t[k + 1], t[k + 2]].map(ponto), uvs: [t[k], t[k + 1], t[k + 2]].map(uv) });
    }
  }
  return saida;
}

export function comparar(esqueleto: Skeleton): number {
  return compararListas(oQueOEditorDesenha(esqueleto), abertas(pecasDoQuadro(esqueleto, undefined, { cortar: false })));
}

export function compararListas(editor: ReturnType<typeof oQueOEditorDesenha>, nossas: ReturnType<typeof abertas>): number {
  expect(nossas.length).toBe(editor.length);
  for (let i = 0; i < editor.length; i++) {
    const e = editor[i];
    const n = nossas[i];
    const onde = `pedaço ${i} (${n.nome})`;
    expect(n.pagina, onde).toBe(e.pagina);
    expect(n.alpha, onde).toBeCloseTo(e.alpha, 12);
    expect(n.composicao, onde).toBe(e.composicao);
    expect(n.pontos.length, onde).toBe(e.pontos.length);
    // A máscara: a mesma que o Canvas aplicava, com a mesma regra (7.7).
    expect(n.recortes.length, `${onde}: máscaras`).toBe(e.cortes.length);
    for (let c = 0; c < e.cortes.length; c++) {
      const r = n.recortes[c];
      const corte = e.cortes[c];
      expect(corte.regra, onde).toBe(r.inverter ? 'evenodd' : 'nonzero');
      const pts = corte.pontos.slice(corte.pontos.length - r.poligono.length / 2);
      for (let k = 0; k < pts.length; k++) {
        expect(pts[k][0], onde).toBeCloseTo(r.poligono[k * 2], 9);
        expect(pts[k][1], onde).toBeCloseTo(r.poligono[k * 2 + 1], 9);
      }
    }
    for (let k = 0; k < e.pontos.length; k++) {
      expect(n.pontos[k][0], onde).toBeCloseTo(e.pontos[k][0], 9);
      expect(n.pontos[k][1], onde).toBeCloseTo(e.pontos[k][1], 9);
      expect(n.uvs[k][0], onde).toBeCloseTo(e.uvs[k][0], 6);
      expect(n.uvs[k][1], onde).toBeCloseTo(e.uvs[k][1], 6);
    }
  }
  return editor.length;
}

