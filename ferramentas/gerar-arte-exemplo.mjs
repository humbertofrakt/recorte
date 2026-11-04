#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Gera a arte do exemplo: desenha as peças do herói por código, empacota tudo
// numa página de atlas e grava:
//
//   formato/exemplos/heroi.png         (a página do atlas)
//   formato/exemplos/heroi.atlas.json  (as regiões correspondentes)
//
//   node ferramentas/gerar-arte-exemplo.mjs
//
// Sem dependências: rasterizador próprio (preenchimento de polígono por
// varredura, contorno por dilatação da máscara, sombreamento em degradê
// vertical) escrevendo num buffer RGBA, gravado com zlib.deflate — o mesmo
// caminho que `render-png.mjs` usa para ler e escrever PNG.

import { writeFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const EXEMPLOS = join(RAIZ, 'formato', 'exemplos');

// ---------------------------------------------------------------------------
// PNG: escrita (igual à de ferramentas/render-png.mjs)
// ---------------------------------------------------------------------------

const ASSINATURA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = TABELA_CRC[(c ^ buf[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pedaco(nome, corpo) {
  const cabeca = Buffer.alloc(4);
  cabeca.writeUInt32BE(corpo.length, 0);
  const tipo = Buffer.from(nome, 'latin1');
  const cauda = Buffer.alloc(4);
  cauda.writeUInt32BE(crc32(Buffer.concat([tipo, corpo])), 0);
  return Buffer.concat([cabeca, tipo, corpo, cauda]);
}

/** Grava RGBA8 (alfa reto, de cima para baixo) como PNG sem entrelace. */
function gravarPng(largura, altura, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8;  // bits por canal
  ihdr[9] = 6;  // RGBA
  const passo = largura * 4;
  const cru = Buffer.alloc((passo + 1) * altura);
  for (let y = 0; y < altura; y++) {
    cru[y * (passo + 1)] = 0; // filtro "none"
    Buffer.from(rgba.buffer, rgba.byteOffset + y * passo, passo).copy(cru, y * (passo + 1) + 1);
  }
  return Buffer.concat([
    ASSINATURA,
    pedaco('IHDR', ihdr),
    pedaco('IDAT', zlib.deflateSync(cru, { level: 9 })),
    pedaco('IEND', Buffer.alloc(0)),
  ]);
}

// ---------------------------------------------------------------------------
// Cores
// ---------------------------------------------------------------------------

/** "#rrggbb" -> [r, g, b] em 0..255. */
function cor(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Mistura duas cores; `t` = 0 devolve `a`, `t` = 1 devolve `b`. */
function entre(a, b, t) {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
}

/** Escurece uma cor mantendo o matiz — usado nas peças do lado de trás. */
function fundo(c, k = 0.68) {
  return [c[0] * k, c[1] * k, c[2] * k];
}

const CONTORNO = cor('#241c2e');

const PALETA = {
  contorno: CONTORNO,
  pele: cor('#f6c9a0'),
  peleSombra: cor('#d9976a'),
  tunica: cor('#3f8fd6'),
  tunicaSombra: cor('#255f9e'),
  couro: cor('#8a5326'),
  couroSombra: cor('#5d3517'),
  calca: cor('#4b4468'),
  calcaSombra: cor('#332e4a'),
  bota: cor('#7a4a24'),
  botaSombra: cor('#4f2d13'),
  cabelo: cor('#e9a93c'),
  cabeloSombra: cor('#b57518'),
  metal: cor('#d5dce8'),
  metalSombra: cor('#8e99ad'),
  capa: cor('#c8392f'),
  capaSombra: cor('#7f2019'),
  olho: cor('#ffffff'),
  pupila: cor('#2b2340'),
};

// ---------------------------------------------------------------------------
// Formas (coordenadas em pixels da peça, y para baixo)
// ---------------------------------------------------------------------------

const TAU = Math.PI * 2;

/** Elipse como polígono. */
function elipse(cx, cy, rx, ry, n = 64) {
  const p = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    p.push(cx + Math.cos(a) * rx, cy + Math.sin(a) * ry);
  }
  return p;
}

/** Retângulo de cantos arredondados. */
function retangulo(x, y, w, h, r = 0, n = 10) {
  const raio = Math.min(r, w / 2, h / 2);
  const cantos = [
    [x + w - raio, y + raio, -Math.PI / 2],
    [x + w - raio, y + h - raio, 0],
    [x + raio, y + h - raio, Math.PI / 2],
    [x + raio, y + raio, Math.PI],
  ];
  const p = [];
  for (const [cx, cy, a0] of cantos) {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      p.push(cx + Math.cos(a) * raio, cy + Math.sin(a) * raio);
    }
  }
  return p;
}

/** Cápsula de raio variável entre dois pontos: a forma de um membro. */
function membro(x0, y0, r0, x1, y1, r1, n = 24) {
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const p = [];
  for (let i = 0; i <= n; i++) {
    const a = ang + Math.PI / 2 + (i / n) * Math.PI;
    p.push(x0 + Math.cos(a) * r0, y0 + Math.sin(a) * r0);
  }
  for (let i = 0; i <= n; i++) {
    const a = ang - Math.PI / 2 + (i / n) * Math.PI;
    p.push(x1 + Math.cos(a) * r1, y1 + Math.sin(a) * r1);
  }
  return p;
}

/** Polígono suavizado por Catmull-Rom fechado — silhuetas orgânicas. */
function suave(pontos, passos = 8) {
  const n = pontos.length / 2;
  const p = [];
  const em = (i) => {
    const k = ((i % n) + n) % n;
    return [pontos[k * 2], pontos[k * 2 + 1]];
  };
  for (let i = 0; i < n; i++) {
    const [x0, y0] = em(i - 1);
    const [x1, y1] = em(i);
    const [x2, y2] = em(i + 1);
    const [x3, y3] = em(i + 2);
    for (let s = 0; s < passos; s++) {
      const t = s / passos;
      const t2 = t * t;
      const t3 = t2 * t;
      p.push(
        0.5 * ((2 * x1) + (-x0 + x2) * t + (2 * x0 - 5 * x1 + 4 * x2 - x3) * t2 + (-x0 + 3 * x1 - 3 * x2 + x3) * t3),
        0.5 * ((2 * y1) + (-y0 + y2) * t + (2 * y0 - 5 * y1 + 4 * y2 - y3) * t2 + (-y0 + 3 * y1 - 3 * y2 + y3) * t3),
      );
    }
  }
  return p;
}

// ---------------------------------------------------------------------------
// Rasterizador
// ---------------------------------------------------------------------------

const SS = 3; // amostras por pixel em cada eixo (suaviza as bordas)

class Peca {
  constructor(nome, largura, altura) {
    this.nome = nome;
    this.largura = largura;
    this.altura = altura;
    this.W = largura * SS;
    this.H = altura * SS;
    this.px = new Float64Array(this.W * this.H * 4); // alfa reto, 0..255 nas cores
    this.mascara = new Uint8Array(this.W * this.H);
    this.dilatada = new Uint8Array(this.W * this.H);
  }

  /** Marca na máscara os pixels dentro dos polígonos (regra par-ímpar). */
  rasterizar(poligonos, mascara) {
    mascara.fill(0);
    let minY = Infinity;
    let maxY = -Infinity;
    for (const poli of poligonos) {
      for (let i = 1; i < poli.length; i += 2) {
        if (poli[i] < minY) minY = poli[i];
        if (poli[i] > maxY) maxY = poli[i];
      }
    }
    if (!Number.isFinite(minY)) return;
    const y0 = Math.max(0, Math.floor(minY * SS));
    const y1 = Math.min(this.H - 1, Math.ceil(maxY * SS));
    const cortes = [];
    for (let y = y0; y <= y1; y++) {
      const py = (y + 0.5) / SS;
      cortes.length = 0;
      for (const poli of poligonos) {
        const n = poli.length / 2;
        for (let i = 0, j = n - 1; i < n; j = i, i++) {
          const yi = poli[i * 2 + 1];
          const yj = poli[j * 2 + 1];
          if ((yi > py) === (yj > py)) continue;
          const xi = poli[i * 2];
          const xj = poli[j * 2];
          cortes.push(xi + ((py - yi) / (yj - yi)) * (xj - xi));
        }
      }
      if (cortes.length < 2) continue;
      cortes.sort((a, b) => a - b);
      for (let k = 0; k + 1 < cortes.length; k += 2) {
        const a = Math.max(0, Math.ceil(cortes[k] * SS - 0.5));
        const b = Math.min(this.W - 1, Math.floor(cortes[k + 1] * SS - 0.5));
        for (let x = a; x <= b; x++) mascara[y * this.W + x] = 1;
      }
    }
  }

  /** Engorda a máscara em `raio` pixels da peça — vira o contorno. */
  dilatar(origem, destino, raio) {
    destino.set(origem);
    const r = Math.round(raio * SS);
    if (r <= 0) return;
    const disco = [];
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) if (dx * dx + dy * dy <= r * r) disco.push(dy * this.W + dx);
    }
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        const i = y * this.W + x;
        if (origem[i] === 0) continue;
        // só a borda precisa carimbar o disco
        const borda = x === 0 || y === 0 || x === this.W - 1 || y === this.H - 1
          || origem[i - 1] === 0 || origem[i + 1] === 0
          || origem[i - this.W] === 0 || origem[i + this.W] === 0;
        if (!borda) continue;
        for (const d of disco) {
          const j = i + d;
          if (j < 0 || j >= destino.length) continue;
          const jx = j % this.W;
          if (Math.abs(jx - x) > r) continue; // não vaza para a linha vizinha
          destino[j] = 1;
        }
      }
    }
  }

  /**
   * Pinta os pixels marcados, por cima do que já está. Com `recorte`, só
   * pinta onde já há tinta — é assim que um detalhe fica dentro da silhueta.
   */
  pintar(mascara, tinta, recorte = false) {
    const p = this.px;
    for (let y = 0; y < this.H; y++) {
      for (let x = 0; x < this.W; x++) {
        const i = y * this.W + x;
        if (mascara[i] === 0) continue;
        if (recorte && p[i * 4 + 3] === 0) continue;
        const c = tinta(x / SS, y / SS);
        const k = i * 4;
        p[k] = c[0];
        p[k + 1] = c[1];
        p[k + 2] = c[2];
        p[k + 3] = 255;
      }
    }
  }

  /**
   * Desenha uma forma: contorno escuro por fora, preenchimento por dentro.
   * `op.cor` é a cor de cima e `op.cor2` a de baixo (degradê vertical).
   */
  forma(poligonos, op = {}) {
    const polis = Array.isArray(poligonos[0]) ? poligonos : [poligonos];
    this.rasterizar(polis, this.mascara);
    const recorte = op.recorte === true;
    const contorno = op.contorno === undefined ? 2 : op.contorno;
    if (contorno > 0) {
      this.dilatar(this.mascara, this.dilatada, contorno);
      const c = op.corContorno ?? CONTORNO;
      this.pintar(this.dilatada, () => c, recorte);
    }
    if (op.cor === null) return;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const poli of polis) {
      for (let i = 1; i < poli.length; i += 2) {
        if (poli[i] < minY) minY = poli[i];
        if (poli[i] > maxY) maxY = poli[i];
      }
    }
    const alto = Math.max(1e-6, maxY - minY);
    const a = op.cor ?? PALETA.pele;
    const b = op.cor2 ?? a;
    this.pintar(this.mascara, (_, y) => entre(a, b, Math.max(0, Math.min(1, (y - minY) / alto))), recorte);
  }

  /** Reduz as amostras a pixels e devolve RGBA8. */
  resolver() {
    const out = new Uint8Array(this.largura * this.altura * 4);
    const n = SS * SS;
    for (let y = 0; y < this.altura; y++) {
      for (let x = 0; x < this.largura; x++) {
        let r = 0;
        let g = 0;
        let b = 0;
        let a = 0;
        for (let sy = 0; sy < SS; sy++) {
          for (let sx = 0; sx < SS; sx++) {
            const k = (((y * SS + sy) * this.W) + (x * SS + sx)) * 4;
            const al = this.px[k + 3] / 255;
            r += this.px[k] * al;
            g += this.px[k + 1] * al;
            b += this.px[k + 2] * al;
            a += al;
          }
        }
        const i = (y * this.largura + x) * 4;
        if (a <= 0) continue;
        out[i] = Math.round(Math.min(255, r / a));
        out[i + 1] = Math.round(Math.min(255, g / a));
        out[i + 2] = Math.round(Math.min(255, b / a));
        out[i + 3] = Math.round(Math.min(255, (a / n) * 255));
      }
    }
    return out;
  }
}

// ---------------------------------------------------------------------------
// As peças do herói
// ---------------------------------------------------------------------------
// Cada peça é desenhada em pé, com o eixo do osso apontando para a direita nos
// membros (ombro à esquerda, cotovelo à direita) — assim o attachment fica com
// rotação 0. O tronco e a cabeça são desenhados de pé mesmo.

/** Tronco: túnica, cinto e gola. Com `metal`, a variante de armadura. */
function desenharTronco(p, metal) {
  const claro = metal ? PALETA.metal : PALETA.tunica;
  const escuro = metal ? PALETA.metalSombra : PALETA.tunicaSombra;
  p.forma(suave([14, 6, 38, 2, 62, 6, 70, 22, 61, 46, 65, 72, 58, 80, 18, 80, 11, 72, 15, 46, 6, 22]),
    { cor: claro, cor2: escuro });
  // gola em V
  p.forma(suave([29, 2, 47, 2, 38, 22]), { cor: escuro, cor2: PALETA.contorno, contorno: 1, recorte: true });
  if (metal) {
    p.forma(elipse(38, 34, 23, 17), { cor: PALETA.metal, cor2: PALETA.metalSombra, contorno: 1.5, recorte: true });
    p.forma(retangulo(34, 20, 8, 40, 3), { cor: PALETA.metalSombra, contorno: 1, recorte: true });
  } else {
    p.forma(retangulo(35, 16, 6, 42, 3), { cor: escuro, contorno: 0, recorte: true });
  }
  // cinto e fivela
  p.forma(retangulo(12, 58, 52, 13, 4), { cor: PALETA.couro, cor2: PALETA.couroSombra, contorno: 1.5, recorte: true });
  p.forma(retangulo(31, 60, 12, 9, 2), { cor: PALETA.metal, cor2: PALETA.metalSombra, contorno: 1.5, recorte: true });
}

/** Cabeça: orelha, crânio, franja, olhos, sobrancelhas, nariz e boca. */
function desenharCabeca(p) {
  // orelha atrás (o herói olha para a direita)
  p.forma(elipse(9, 38, 5.5, 7.5), { cor: PALETA.pele, cor2: PALETA.peleSombra });
  // crânio
  p.forma(suave([32, 6, 50, 12, 58, 30, 52, 52, 34, 62, 18, 56, 6, 36, 12, 14]),
    { cor: PALETA.pele, cor2: PALETA.peleSombra });
  // franja por cima
  p.forma(suave([31, 2, 52, 7, 60, 24, 56, 32, 46, 18, 30, 14, 15, 20, 6, 33, 4, 18, 14, 5]),
    { cor: PALETA.cabelo, cor2: PALETA.cabeloSombra, contorno: 2 });
  // olhos
  for (const cx of [25, 42]) {
    p.forma(elipse(cx, 36, 5.5, 6.5), { cor: PALETA.olho, contorno: 1.5, recorte: true });
    p.forma(elipse(cx + 1.5, 37, 2.6, 3.2), { cor: PALETA.pupila, contorno: 0, recorte: true });
  }
  // sobrancelhas
  p.forma(retangulo(20, 25, 11, 3.5, 1.7), { cor: PALETA.cabeloSombra, contorno: 0, recorte: true });
  p.forma(retangulo(37, 24, 11, 3.5, 1.7), { cor: PALETA.cabeloSombra, contorno: 0, recorte: true });
  // nariz
  p.forma(suave([50, 38, 55, 43, 49, 45]), { cor: PALETA.peleSombra, contorno: 1, recorte: true });
  // boca: arco fino
  const boca = [];
  for (let i = 0; i <= 20; i++) {
    const a = Math.PI * (0.14 + (i / 20) * 0.72);
    boca.push(33 - Math.cos(a) * 11, 44 + Math.sin(a) * 9);
  }
  for (let i = 20; i >= 0; i--) {
    const a = Math.PI * (0.14 + (i / 20) * 0.72);
    boca.push(33 - Math.cos(a) * 8, 44 + Math.sin(a) * 6.2);
  }
  p.forma(boca, { cor: PALETA.contorno, contorno: 0, recorte: true });
}

/** Rabo de cavalo: raiz à esquerda, ponta à direita. */
function desenharCabelo(p) {
  p.forma(suave([3, 15, 11, 4, 27, 6, 42, 11, 54, 15, 40, 21, 24, 26, 9, 26]),
    { cor: PALETA.cabelo, cor2: PALETA.cabeloSombra });
  p.forma(suave([12, 12, 30, 12, 44, 15, 28, 18, 14, 18]),
    { cor: PALETA.cabelo, contorno: 0, recorte: true });
}

/** Braço de cima: manga da túnica no ombro, o resto em pele. */
function desenharBraco(p, atras) {
  const w = p.largura;
  const cy = p.altura / 2;
  const pele = atras ? fundo(PALETA.pele) : PALETA.pele;
  const peleS = atras ? fundo(PALETA.peleSombra) : PALETA.peleSombra;
  const tun = atras ? fundo(PALETA.tunica) : PALETA.tunica;
  const tunS = atras ? fundo(PALETA.tunicaSombra) : PALETA.tunicaSombra;
  p.forma(membro(7, cy, cy - 3, w - 6, cy, cy - 6), { cor: pele, cor2: peleS });
  p.forma(membro(7, cy, cy - 2.5, w * 0.5, cy, cy - 4), { cor: tun, cor2: tunS, contorno: 1.5, recorte: true });
}

/** Antebraço: pele com uma bracelete de couro no cotovelo. */
function desenharAntebraco(p, atras) {
  const w = p.largura;
  const cy = p.altura / 2;
  const pele = atras ? fundo(PALETA.pele) : PALETA.pele;
  const peleS = atras ? fundo(PALETA.peleSombra) : PALETA.peleSombra;
  const couro = atras ? fundo(PALETA.couro) : PALETA.couro;
  const couroS = atras ? fundo(PALETA.couroSombra) : PALETA.couroSombra;
  p.forma(membro(6, cy, cy - 3, w - 5, cy, cy - 4), { cor: pele, cor2: peleS });
  p.forma(membro(5, cy, cy - 2.5, 13, cy, cy - 3), { cor: couro, cor2: couroS, contorno: 1.5, recorte: true });
}

/** Mão: `fecho` 0 = aberta, 1 = meia, 2 = punho. */
function desenharMao(p, fecho, atras) {
  const c = p.largura / 2;
  const pele = atras ? fundo(PALETA.pele) : PALETA.pele;
  const peleS = atras ? fundo(PALETA.peleSombra) : PALETA.peleSombra;
  const raio = [c - 4, c - 4.5, c - 5][fecho];
  p.forma(elipse(c, c, raio + 1, raio), { cor: pele, cor2: peleS });
  if (fecho === 0) {
    p.forma(elipse(c + raio - 1, c + 2.5, 3.2, 4), { cor: pele, cor2: peleS, contorno: 1.5 });
    for (let i = 0; i < 3; i++) {
      p.forma(retangulo(c - 4 + i * 3.2, c - raio + 2, 1.6, raio, 0.8),
        { cor: peleS, contorno: 0, recorte: true });
    }
  } else {
    for (let i = 0; i < 3; i++) {
      p.forma(retangulo(c - 5, c - 4 + i * 3.4, raio + 4, 1.8, 0.9),
        { cor: peleS, contorno: 0, recorte: true });
    }
  }
}

/** Coxa: quadril à esquerda, joelho à direita. */
function desenharCoxa(p, atras) {
  const w = p.largura;
  const cy = p.altura / 2;
  const cal = atras ? fundo(PALETA.calca) : PALETA.calca;
  const calS = atras ? fundo(PALETA.calcaSombra) : PALETA.calcaSombra;
  p.forma(membro(9, cy, cy - 3, w - 7, cy, cy - 7), { cor: cal, cor2: calS });
}

/** Canela: calça em cima, cano da bota na ponta. */
function desenharCanela(p, atras) {
  const w = p.largura;
  const cy = p.altura / 2;
  const cal = atras ? fundo(PALETA.calca) : PALETA.calca;
  const calS = atras ? fundo(PALETA.calcaSombra) : PALETA.calcaSombra;
  const bota = atras ? fundo(PALETA.bota) : PALETA.bota;
  const botaS = atras ? fundo(PALETA.botaSombra) : PALETA.botaSombra;
  p.forma(membro(7, cy, cy - 3, w - 6, cy, cy - 5), { cor: cal, cor2: calS });
  p.forma(membro(w * 0.52, cy, cy - 3.5, w - 5, cy, cy - 4.5),
    { cor: bota, cor2: botaS, contorno: 1.5, recorte: true });
}

/** Pé: tornozelo à esquerda, ponta à direita, sola escura embaixo. */
function desenharPe(p, atras) {
  const w = p.largura;
  const h = p.altura;
  const bota = atras ? fundo(PALETA.bota) : PALETA.bota;
  const botaS = atras ? fundo(PALETA.botaSombra) : PALETA.botaSombra;
  p.forma(suave([5, 4, w - 12, 3, w - 3, h * 0.5, w - 6, h - 3, 5, h - 3]),
    { cor: bota, cor2: botaS });
  p.forma(retangulo(3, h - 7, w - 5, 5, 2), { cor: botaS, contorno: 0, recorte: true });
}

/** Espada: punho à esquerda, ponta à direita. */
function desenharEspada(p) {
  const w = p.largura;
  const cy = p.altura / 2;
  p.forma(elipse(5, cy, 4.5, 4.5), { cor: PALETA.metal, cor2: PALETA.metalSombra });
  p.forma(retangulo(6, cy - 3.5, 13, 7, 3), { cor: PALETA.couro, cor2: PALETA.couroSombra });
  p.forma(retangulo(18, 3, 6, p.altura - 6, 2.5), { cor: PALETA.metal, cor2: PALETA.metalSombra });
  p.forma(suave([24, cy - 6, w - 12, cy - 5, w - 3, cy, w - 12, cy + 5, 24, cy + 6]),
    { cor: PALETA.metal, cor2: PALETA.metalSombra });
  p.forma(suave([27, cy - 2, w - 14, cy - 1.5, w - 8, cy, w - 14, cy + 1.5, 27, cy + 2]),
    { cor: PALETA.metalSombra, contorno: 0, recorte: true });
}

/** Pedaço de capa: a borda de cima fica à esquerda. */
function desenharCapa(p, ondulada) {
  const w = p.largura;
  const h = p.altura;
  const pontos = ondulada
    // a barra da capa é recortada em bicos
    ? [6, 9, w - 12, 3, w - 4, h * 0.26, w - 11, h * 0.44, w - 3, h * 0.62, w - 10, h - 3, 6, h - 9]
    // pedaço de cima: estreito no ombro (esquerda), largo embaixo (direita)
    : [7, 10, w - 5, 3, w - 3, h - 3, 7, h - 10];
  p.forma(suave(pontos), { cor: PALETA.capa, cor2: PALETA.capaSombra });
  // dobra da fazenda ao longo do pedaço
  p.forma(suave([9, h * 0.5 - 2, w - 12, h * 0.5 - 5, w - 12, h * 0.5 + 5, 9, h * 0.5 + 2]),
    { cor: PALETA.capaSombra, contorno: 0, recorte: true });
}

// ---------------------------------------------------------------------------
// Catálogo: nome da região, tamanho e desenho
// ---------------------------------------------------------------------------

const CATALOGO = [
  { nome: 'body', w: 76, h: 84, desenhar: (p) => desenharTronco(p, false) },
  {
    nome: 'armadura/body',
    w: 76,
    h: 84,
    desenhar: (p) => desenharTronco(p, true),
    // recorte apertado: exercita offsetX/offsetY/originalWidth/originalHeight
    corte: { x: 2, y: 3, w: 72, h: 78 },
  },
  { nome: 'face', w: 64, h: 66, desenhar: desenharCabeca, apelidos: ['rosto'] },
  { nome: 'hair', w: 56, h: 30, desenhar: desenharCabelo },
  // a região do braço vai girada 90 na página: prova o caminho de 10.3
  { nome: 'arm', w: 52, h: 26, girar: true, desenhar: (p) => desenharBraco(p, false) },
  { nome: 'forearm', w: 44, h: 22, desenhar: (p) => desenharAntebraco(p, false) },
  { nome: 'hand_01', w: 24, h: 24, desenhar: (p) => desenharMao(p, 0, false) },
  { nome: 'hand_02', w: 24, h: 24, desenhar: (p) => desenharMao(p, 1, false) },
  { nome: 'hand_03', w: 24, h: 24, desenhar: (p) => desenharMao(p, 2, false) },
  { nome: 'arm_back', w: 48, h: 24, desenhar: (p) => desenharBraco(p, true) },
  { nome: 'forearm_back', w: 40, h: 20, desenhar: (p) => desenharAntebraco(p, true) },
  { nome: 'hand_back', w: 22, h: 22, desenhar: (p) => desenharMao(p, 1, true) },
  { nome: 'thigh', w: 50, h: 28, desenhar: (p) => desenharCoxa(p, false) },
  { nome: 'shin', w: 46, h: 24, desenhar: (p) => desenharCanela(p, false) },
  { nome: 'foot', w: 34, h: 20, desenhar: (p) => desenharPe(p, false) },
  { nome: 'thigh_back', w: 50, h: 28, desenhar: (p) => desenharCoxa(p, true) },
  { nome: 'shin_back', w: 46, h: 24, desenhar: (p) => desenharCanela(p, true) },
  { nome: 'foot_back', w: 34, h: 20, desenhar: (p) => desenharPe(p, true) },
  { nome: 'blade', w: 70, h: 24, desenhar: desenharEspada },
  { nome: 'cape_upper', w: 40, h: 32, desenhar: (p) => desenharCapa(p, false) },
  { nome: 'cape_lower', w: 46, h: 42, desenhar: (p) => desenharCapa(p, true) },
];

// ---------------------------------------------------------------------------
// Empacotamento e gravação
// ---------------------------------------------------------------------------

const PAGINA = 256;
const FOLGA = 2;

function principal() {
  // 1. desenha cada peça
  const pecas = CATALOGO.map((def) => {
    const peca = new Peca(def.nome, def.w, def.h);
    def.desenhar(peca);
    return { def, rgba: peca.resolver(), corte: def.corte ?? { x: 0, y: 0, w: def.w, h: def.h }, x: 0, y: 0 };
  });

  // 2. empacota em prateleiras, da peça mais alta para a mais baixa
  const ordem = [...pecas].sort((a, b) => {
    const ha = a.def.girar ? a.corte.w : a.corte.h;
    const hb = b.def.girar ? b.corte.w : b.corte.h;
    return hb - ha;
  });
  let x = FOLGA;
  let y = FOLGA;
  let alturaPrateleira = 0;
  for (const item of ordem) {
    const lp = item.def.girar ? item.corte.h : item.corte.w;
    const ap = item.def.girar ? item.corte.w : item.corte.h;
    if (x + lp + FOLGA > PAGINA) {
      x = FOLGA;
      y += alturaPrateleira + FOLGA;
      alturaPrateleira = 0;
    }
    item.x = x;
    item.y = y;
    x += lp + FOLGA;
    alturaPrateleira = Math.max(alturaPrateleira, ap);
  }
  const usado = y + alturaPrateleira + FOLGA;
  if (usado > PAGINA) throw new Error(`as peças não cabem em ${PAGINA}x${PAGINA}`);

  // 3. copia as peças para a página
  const pagina = new Uint8Array(PAGINA * PAGINA * 4);
  for (const item of pecas) {
    const { corte, def } = item;
    for (let sy = 0; sy < corte.h; sy++) {
      for (let sx = 0; sx < corte.w; sx++) {
        const o = (((corte.y + sy) * def.w) + (corte.x + sx)) * 4;
        // girada 90: a linha da imagem vira coluna na página (10.3)
        const px = def.girar ? item.x + (corte.h - 1 - sy) : item.x + sx;
        const py = def.girar ? item.y + sx : item.y + sy;
        const d = ((py * PAGINA) + px) * 4;
        pagina[d] = item.rgba[o];
        pagina[d + 1] = item.rgba[o + 1];
        pagina[d + 2] = item.rgba[o + 2];
        pagina[d + 3] = item.rgba[o + 3];
      }
    }
  }
  writeFileSync(join(EXEMPLOS, 'heroi.png'), gravarPng(PAGINA, PAGINA, pagina));

  // 4. escreve o atlas
  const regioes = pecas.map((item) => {
    const { def, corte } = item;
    const r = { name: def.nome, page: 0, x: item.x, y: item.y, width: corte.w, height: corte.h };
    if (def.girar) r.rotation = 90;
    if (corte.w !== def.w || corte.h !== def.h) {
      r.offsetX = corte.x;
      r.offsetY = def.h - corte.y - corte.h;
      r.originalWidth = def.w;
      r.originalHeight = def.h;
    }
    if (def.apelidos !== undefined) r.aliases = def.apelidos;
    return r;
  });
  const atlas = {
    atlas: { version: '1.0', generator: 'Recorte 0.1.0' },
    scale: 1,
    pages: [{
      name: 'heroi',
      image: 'heroi.png',
      width: PAGINA,
      height: PAGINA,
      format: 'rgba8',
      minFilter: 'linear',
      magFilter: 'linear',
      wrapU: 'clamp',
      wrapV: 'clamp',
      premultiplied: false,
    }],
    regions: regioes,
    extras: { packer: 'ferramentas/gerar-arte-exemplo.mjs' },
  };
  writeFileSync(join(EXEMPLOS, 'heroi.atlas.json'), `${JSON.stringify(atlas, null, 2)}\n`);

  process.stdout.write(`heroi.png: ${PAGINA}x${PAGINA}, ${regioes.length} regiões, ${usado} linhas usadas\n`);
}

principal();
