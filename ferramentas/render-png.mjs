#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Renderizador de prova: desenha um quadro de uma animação .bone num PNG.
//
//   node ferramentas/render-png.mjs walk 0.5 saida.png
//   node ferramentas/render-png.mjs idle 0 saida.png --largura 800 --sem-ossos
//   node ferramentas/render-png.mjs attack 0.2 saida.png --bone outro.bone
//
// Sem dependências: lê o PNG do atlas com um decodificador mínimo (zlib do
// Node), rasteriza os triângulos em software (amostragem por vizinho mais
// próximo, cor de §7.12, máscara de §7.7) e grava o PNG de saída com
// zlib.deflate. Serve de prova visual e é a base do pose dump de §12.4.
//
// O runtime é TypeScript; este script compila `runtime/src` para
// `ferramentas/visualizador/dist` (o mesmo dist do visualizador) quando está
// faltando ou desatualizado, e importa de lá.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const TSCONFIG = join(AQUI, 'visualizador', 'tsconfig.json');
const DIST = join(AQUI, 'visualizador', 'dist');

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function lerArgumentos(argv) {
  const posicionais = [];
  const op = {
    largura: 640, ossos: true, bone: join(RAIZ, 'formato', 'exemplos', 'heroi.bone'),
    fundo: null, margem: 0.12, passo: 1 / 60,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { posicionais.push(a); continue; }
    const [chave, valorJunto] = a.slice(2).split('=');
    const valor = () => (valorJunto !== undefined ? valorJunto : argv[++i]);
    switch (chave) {
      case 'largura': op.largura = Number(valor()); break;
      // QA 04/11/2026 (D11): com --bone, a ferramenta dizia "Nenhum esqueleto passado".
      case 'bone': op.bone = resolve(process.cwd(), valor()); op.boneEscolhido = true; break;
      case 'fundo': op.fundo = valor(); break;
      case 'margem': op.margem = Number(valor()); break;
      case 'passo': op.passo = Number(valor()); break;
      case 'sem-ossos': op.ossos = false; break;
      case 'esqueleto': op.ossos = true; break;
      case 'ajuda': case 'help': op.ajuda = true; break;
      default: throw new Error(`opção desconhecida: --${chave}`);
    }
  }
  // Quatro posicionais = o esqueleto veio na frente. Três = o esqueleto é o
  // exemplo, e a ferramenta diz qual usou em vez de escolher em silêncio.
  // Antes, `render-png.mjs meu.bone walk 0.5 saida.png` lia "meu.bone" como
  // nome de animação e ninguém entendia o resultado.
  if (posicionais.length >= 4) {
    op.bone = resolve(process.cwd(), posicionais[0]);
    op.boneEscolhido = true;
    posicionais.shift();
  }
  op.animacao = posicionais[0];
  op.tempo = posicionais[1] === undefined ? 0 : Number(posicionais[1]);
  op.saida = posicionais[2];
  return op;
}

const USO = `Uso: node ferramentas/render-png.mjs [esqueleto] <animacao> <tempo> <saida.png> [opções]

  esqueleto       o .bone, .boneb ou .bonez a desenhar.
                  Sem ele, usa formato/exemplos/heroi.bone e avisa.
  animacao        nome da animação; "-" desenha a pose de montagem
  tempo           segundos dentro da animação
  saida.png       o arquivo a gravar

  --largura N     largura do PNG em pixels (padrão 640)
  --bone CAMINHO  o mesmo que o posicional, para quem prefere opção
  --sem-ossos     não desenha as linhas dos ossos
  --fundo RRGGBB  cor de fundo opaca (padrão: transparente)
  --margem F      folga em volta do desenho, fração do tamanho (padrão 0.12)
  --passo F       passo do avanço em segundos (padrão 1/60)`;

// ---------------------------------------------------------------------------
// Compilação do runtime
// ---------------------------------------------------------------------------

function maisRecente(pasta) {
  let t = 0;
  for (const e of readdirSync(pasta, { withFileTypes: true })) {
    const p = join(pasta, e.name);
    if (e.isDirectory()) t = Math.max(t, maisRecente(p));
    else if (e.name.endsWith('.ts')) t = Math.max(t, statSync(p).mtimeMs);
  }
  return t;
}

function garantirDist() {
  const indice = join(DIST, 'index.js');
  const fonte = maisRecente(join(RAIZ, 'runtime', 'src'));
  if (existsSync(indice) && statSync(indice).mtimeMs >= fonte) return;
  const tsc = join(RAIZ, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!existsSync(tsc)) throw new Error('typescript não encontrado em node_modules');
  process.stderr.write('compilando runtime -> ferramentas/visualizador/dist ...\n');
  execFileSync(process.execPath, [tsc, '-p', TSCONFIG], { stdio: 'inherit' });
}

// ---------------------------------------------------------------------------
// PNG: leitura
// ---------------------------------------------------------------------------

const ASSINATURA = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const CANAIS = { 0: 1, 2: 3, 4: 2, 6: 4 };

/** Lê um PNG de 8 bits por canal, sem entrelace. Devolve RGBA de cima para baixo. */
export function lerPng(buf) {
  if (!buf.subarray(0, 8).equals(ASSINATURA)) throw new Error('não é um PNG');
  let largura = 0, altura = 0, profundidade = 0, tipo = 0, entrelace = 0;
  const dados = [];
  let paleta = null, transparencia = null;
  for (let i = 8; i + 8 <= buf.length;) {
    const tam = buf.readUInt32BE(i);
    const nome = buf.toString('latin1', i + 4, i + 8);
    const corpo = buf.subarray(i + 8, i + 8 + tam);
    i += 12 + tam;
    if (nome === 'IHDR') {
      largura = corpo.readUInt32BE(0);
      altura = corpo.readUInt32BE(4);
      profundidade = corpo[8];
      tipo = corpo[9];
      entrelace = corpo[12];
    } else if (nome === 'PLTE') paleta = Buffer.from(corpo);
    else if (nome === 'tRNS') transparencia = Buffer.from(corpo);
    else if (nome === 'IDAT') dados.push(Buffer.from(corpo));
    else if (nome === 'IEND') break;
  }
  if (profundidade !== 8) throw new Error(`PNG com ${profundidade} bits por canal não é suportado`);
  if (entrelace !== 0) throw new Error('PNG entrelaçado não é suportado');
  const canais = tipo === 3 ? 1 : CANAIS[tipo];
  if (canais === undefined) throw new Error(`tipo de cor ${tipo} não é suportado`);
  if (tipo === 3 && paleta === null) throw new Error('PNG com paleta sem PLTE');

  const cru = zlib.inflateSync(Buffer.concat(dados));
  const bruto = desfiltrar(cru, largura, altura, canais);
  const rgba = new Uint8Array(largura * altura * 4);
  for (let p = 0, d = 0; p < largura * altura; p++) {
    const s = p * canais;
    let r, g, b, a = 255;
    if (tipo === 0) { r = g = b = bruto[s]; }
    else if (tipo === 4) { r = g = b = bruto[s]; a = bruto[s + 1]; }
    else if (tipo === 2) { r = bruto[s]; g = bruto[s + 1]; b = bruto[s + 2]; }
    else if (tipo === 6) { r = bruto[s]; g = bruto[s + 1]; b = bruto[s + 2]; a = bruto[s + 3]; }
    else { const k = bruto[s] * 3; r = paleta[k]; g = paleta[k + 1]; b = paleta[k + 2]; a = transparencia !== null && bruto[s] < transparencia.length ? transparencia[bruto[s]] : 255; }
    rgba[d++] = r; rgba[d++] = g; rgba[d++] = b; rgba[d++] = a;
  }
  return { largura, altura, rgba };
}

/** Desfaz os cinco filtros por linha do PNG (RFC 2083 §6). */
function desfiltrar(cru, largura, altura, canais) {
  const passo = largura * canais;
  const out = Buffer.alloc(passo * altura);
  let p = 0;
  for (let y = 0; y < altura; y++) {
    const filtro = cru[p++];
    const linha = cru.subarray(p, p + passo);
    p += passo;
    const destino = out.subarray(y * passo, (y + 1) * passo);
    const anterior = y === 0 ? null : out.subarray((y - 1) * passo, y * passo);
    for (let x = 0; x < passo; x++) {
      const a = x >= canais ? destino[x - canais] : 0;
      const b = anterior === null ? 0 : anterior[x];
      const c = anterior === null || x < canais ? 0 : anterior[x - canais];
      const v = linha[x];
      switch (filtro) {
        case 0: destino[x] = v; break;
        case 1: destino[x] = (v + a) & 255; break;
        case 2: destino[x] = (v + b) & 255; break;
        case 3: destino[x] = (v + ((a + b) >> 1)) & 255; break;
        case 4: destino[x] = (v + paeth(a, b, c)) & 255; break;
        default: throw new Error(`filtro PNG desconhecido: ${filtro}`);
      }
    }
  }
  return out;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

// ---------------------------------------------------------------------------
// PNG: escrita
// ---------------------------------------------------------------------------

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
export function gravarPng(largura, altura, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(largura, 0);
  ihdr.writeUInt32BE(altura, 4);
  ihdr[8] = 8;   // bits por canal
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
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
// Rasterizador
// ---------------------------------------------------------------------------

/** Alvo em alfa reto, componentes em 0..1. */
class Quadro {
  constructor(largura, altura) {
    this.largura = largura;
    this.altura = altura;
    this.px = new Float64Array(largura * altura * 4);
  }

  /** Mistura uma cor em alfa reto no pixel, pelos modos de §7.12. */
  misturar(x, y, r, g, b, a, blend) {
    if (a <= 0) return;
    const i = (y * this.largura + x) * 4;
    const p = this.px;
    const da = p[i + 3];
    let sr = r, sg = g, sb = b;
    if (blend === 'multiply') { sr = r * p[i]; sg = g * p[i + 1]; sb = b * p[i + 2]; }
    else if (blend === 'screen') { sr = r + p[i] - r * p[i]; sg = g + p[i + 1] - g * p[i + 1]; sb = b + p[i + 2] - b * p[i + 2]; }
    if (blend === 'additive') {
      p[i] += sr * a; p[i + 1] += sg * a; p[i + 2] += sb * a;
      p[i + 3] = Math.min(1, da + a);
      return;
    }
    const na = a + da * (1 - a);
    if (na <= 0) return;
    p[i] = (sr * a + p[i] * da * (1 - a)) / na;
    p[i + 1] = (sg * a + p[i + 1] * da * (1 - a)) / na;
    p[i + 2] = (sb * a + p[i + 2] * da * (1 - a)) / na;
    p[i + 3] = na;
  }

  paraRgba() {
    const out = new Uint8Array(this.largura * this.altura * 4);
    for (let i = 0; i < out.length; i++) {
      out[i] = Math.max(0, Math.min(255, Math.round(this.px[i] * 255)));
    }
    return out;
  }
}

/** Ponto dentro do polígono (par-ímpar), o teste de recorte de §7.7. */
function dentroDoPoligono(poli, x, y) {
  let dentro = false;
  for (let i = 0, j = poli.length - 2; i < poli.length; j = i, i += 2) {
    const xi = poli[i], yi = poli[i + 1], xj = poli[j], yj = poli[j + 1];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) dentro = !dentro;
  }
  return dentro;
}

/**
 * Preenche um triângulo amostrando a textura por coordenadas baricêntricas.
 * `dst` são 6 números em pixels da imagem, `src` 6 números em pixels da página.
 */
function triangulo(quadro, dst, src, textura, cor, premultiplicado, blend, recorte, sombrear) {
  const [x0, y0, x1, y1, x2, y2] = dst;
  const det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  if (Math.abs(det) < 1e-12) return;
  const minX = Math.max(0, Math.floor(Math.min(x0, x1, x2)));
  const maxX = Math.min(quadro.largura - 1, Math.ceil(Math.max(x0, x1, x2)));
  const minY = Math.max(0, Math.floor(Math.min(y0, y1, y2)));
  const maxY = Math.min(quadro.altura - 1, Math.ceil(Math.max(y0, y1, y2)));
  const tex = [0, 0, 0, 0];
  const saida = [0, 0, 0, 0];
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const px = x + 0.5, py = y + 0.5;
      const l1 = ((px - x0) * (y2 - y0) - (x2 - x0) * (py - y0)) / det;
      const l2 = ((x1 - x0) * (py - y0) - (px - x0) * (y1 - y0)) / det;
      const l0 = 1 - l1 - l2;
      if (l0 < -1e-9 || l1 < -1e-9 || l2 < -1e-9) continue;
      if (recorte !== null && recorte(px, py) === false) continue;
      const u = l0 * src[0] + l1 * src[2] + l2 * src[4];
      const v = l0 * src[1] + l1 * src[3] + l2 * src[5];
      const tx = Math.max(0, Math.min(textura.largura - 1, Math.floor(u)));
      const ty = Math.max(0, Math.min(textura.altura - 1, Math.floor(v)));
      const t = (ty * textura.largura + tx) * 4;
      tex[0] = textura.rgba[t] / 255;
      tex[1] = textura.rgba[t + 1] / 255;
      tex[2] = textura.rgba[t + 2] / 255;
      tex[3] = textura.rgba[t + 3] / 255;
      sombrear(tex, cor, premultiplicado, saida);
      let [r, g, b, a] = saida;
      if (premultiplicado && a > 0) { r /= a; g /= a; b /= a; }
      quadro.misturar(x, y, r, g, b, a, blend);
    }
  }
}

/** Linha de 1 px (DDA), para os ossos. */
function linha(quadro, x0, y0, x1, y1, r, g, b, a) {
  const passos = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
  for (let i = 0; i <= passos; i++) {
    const x = Math.round(x0 + ((x1 - x0) * i) / passos);
    const y = Math.round(y0 + ((y1 - y0) * i) / passos);
    if (x < 0 || y < 0 || x >= quadro.largura || y >= quadro.altura) continue;
    quadro.misturar(x, y, r, g, b, a, 'normal');
  }
}

function quadrado(quadro, cx, cy, raio, r, g, b, a) {
  for (let y = Math.round(cy - raio); y <= Math.round(cy + raio); y++) {
    for (let x = Math.round(cx - raio); x <= Math.round(cx + raio); x++) {
      if (x < 0 || y < 0 || x >= quadro.largura || y >= quadro.altura) continue;
      quadro.misturar(x, y, r, g, b, a, 'normal');
    }
  }
}

// ---------------------------------------------------------------------------
// Runtime, esqueleto e imagens — reaproveitados por exportar-imagem.mjs
// ---------------------------------------------------------------------------
//
// Estas quatro funções eram fechaduras dentro de `principal()`. Saíram para o
// nível do módulo quando a exportação de sequência, folha e GIF apareceu
// (requisito E5): o exportador precisa DO MESMO rasterizador, e um segundo
// rasterizador seria um segundo jeito de o mesmo arquivo virar pixel — que é
// exatamente o que um formato-padrão não pode ter.
//
// `principal()` continua fazendo o que fazia, chamando-as em fila.

/** Compila o runtime, se preciso, e devolve o módulo já importado. */
export async function carregarRuntime() {
  garantirDist();
  return import(new URL('index.js', new URL('file:///' + DIST.replace(/\\/g, '/') + '/')).href);
}

/**
 * Abre um `.bone` com os atlas, as imagens das páginas e os esqueletos
 * aninhados de §7.11. Devolve `{ dados, imagens }`, com `imagens` sendo um
 * Map de nome de página para `{ largura, altura, rgba }` (ou `null`).
 */
export function abrirEsqueleto(rt, caminhoBone) {
  const imagens = new Map();

  function carregarAtlas(caminho0, doc) {
    const pastaBone = dirname(caminho0);
    const base = doc.assets?.imagesBase ?? '';
    const atlases = [];
    for (const uri of doc.assets?.atlases ?? []) {
      const caminho = resolve(pastaBone, uri);
      const atlas = rt.loadAtlas(JSON.parse(readFileSync(caminho, 'utf8')));
      atlases.push(atlas);
      for (const pagina of atlas.pages) {
        if (imagens.has(pagina.name)) continue;
        // §2.8: a página é relativa a `imagesBase`; o exemplo guarda o PNG ao
        // lado do atlas, então os dois lugares são tentados.
        const candidatos = [
          resolve(pastaBone, base, pagina.image),
          resolve(dirname(caminho), pagina.image),
          resolve(pastaBone, pagina.image),
        ];
        const img = candidatos.find((c) => existsSync(c));
        imagens.set(pagina.name, img === undefined ? null : lerPng(readFileSync(img)));
        if (img === undefined) process.stderr.write(`aviso: página "${pagina.name}" sem imagem (${pagina.image})\n`);
      }
    }
    return atlases;
  }

  function carregarBone(caminho0, cadeia = []) {
    if (cadeia.includes(caminho0)) {
      throw new Error(`ciclo de esqueleto aninhado em "${caminho0}" (7.11)`);
    }
    if (cadeia.length + 1 > 8) {
      throw new Error(`esqueleto aninhado passou da profundidade máxima de 8 (12.6)`);
    }
    const doc = JSON.parse(readFileSync(caminho0, 'utf8'));
    const atlases = carregarAtlas(caminho0, doc);
    const dados = rt.loadSkeletonData(doc, { atlases });
    for (const w of dados.warnings) {
      process.stderr.write(`aviso: ${caminho0}: ${w.pointer} ${w.message}\n`);
    }
    // §2.8: `uri` do filho é relativa a `assets.skeletonsBase` do pai.
    const pasta = dirname(caminho0);
    const raiz = dados.assets.skeletonsBase ?? '';
    for (const att of rt.nestedAttachments(dados)) {
      const filho = resolve(pasta, raiz, att.uri);
      if (!existsSync(filho)) {
        process.stderr.write(`aviso: esqueleto aninhado "${att.uri}" não achado em ${filho}\n`);
        continue;
      }
      att.child = carregarBone(filho, [...cadeia, caminho0]);
    }
    return dados;
  }

  return { dados: carregarBone(caminhoBone), imagens };
}

/**
 * Põe o esqueleto na pose da animação no tempo pedido, AVANÇANDO do zero,
 * quadro a quadro: a física de §6.5 depende do histórico, não do instante.
 *
 * `de` diz de onde partir: passe o tempo do quadro anterior para continuar a
 * simulação numa sequência, em vez de refazê-la do zero a cada quadro.
 */
export function posarAte(rt, esqueleto, animacao, tempo, passo = 1 / 60, de = null) {
  let anterior = de === null ? -Infinity : de;
  let t = de === null ? 0 : de;
  for (;;) {
    rt.pose(esqueleto, animacao, t, t);
    rt.applyResets(esqueleto, animacao, anterior, t, false);
    anterior = t;
    if (t >= tempo) break;
    t = Math.min(tempo, t + passo);
  }
}

/**
 * A câmera de um retângulo do mundo. É a gêmea em JavaScript de `cameraFor`
 * de `ferramentas/src/exportar/quadros.ts`, e um caso de teste confere que as
 * duas dão o mesmo número — se uma mudar sozinha, o teste quebra.
 *
 *   `largura`  fixa a largura em pixels e decide a escala;
 *   `escala`   pixels por unidade de mundo, quando não há largura;
 *   `margem`   folga em volta, em fração do lado maior.
 */
export function cameraDe(limites, { largura, escala = 1, margem = 0.12 } = {}) {
  const folga = Math.max(limites.width, limites.height) * Math.max(0, margem);
  const mundoL = Math.max(1e-6, limites.width + folga * 2);
  const mundoA = Math.max(1e-6, limites.height + folga * 2);
  const s = largura !== undefined && largura > 0 ? largura / mundoL : Math.max(1e-9, escala);
  return {
    width: Math.max(1, Math.round(mundoL * s)),
    height: Math.max(1, Math.round(mundoA * s)),
    scale: s,
    originX: limites.x - folga,
    originY: limites.y - folga,
  };
}

/**
 * Os limites do esqueleto posado **com as partículas** — QA de 04/11/2026
 * (D10). O `getBounds` do runtime conta os desenhos, e não as partículas: um
 * emissor sozinho dava um retângulo de nada, e a câmera ampliava até a tela
 * virar uma cor só. Cada partícula entra com o quadrado da imagem dela.
 */
export function limitesComParticulas(rt, esqueleto, cache = new rt.ParticleCache()) {
  let caixa = esqueleto.getBounds();
  for (const d of rt.collectDrawables(esqueleto)) {
    if (!rt.isParticleAttachment(d.attachment)) continue;
    const quadroP = rt.particleFrame(esqueleto, d.slot, d.attachment, cache);
    if (quadroP.silence !== null) continue;
    for (const p of quadroP.particles) {
      const regiao = d.attachment.region;
      const lado = regiao === null ? 1 : Math.max(regiao.originalWidth ?? regiao.width ?? 1, regiao.originalHeight ?? regiao.height ?? 1);
      const r = (lado * Math.abs(p.scale)) / 2;
      caixa = juntarLimites(caixa, { x: p.x - r, y: p.y - r, width: r * 2, height: r * 2 });
    }
  }
  return caixa;
}

/** O menor retângulo que segura os dois. Qualquer um pode ser `null`. */
export function juntarLimites(a, b) {
  if (a === null) return b === null ? null : { ...b };
  if (b === null) return { ...a };
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  const direita = Math.max(a.x + a.width, b.x + b.width);
  const cima = Math.max(a.y + a.height, b.y + b.height);
  return { x, y, width: direita - x, height: cima - y };
}

/**
 * Desenha a pose atual do esqueleto e devolve `{ largura, altura, rgba }` em
 * RGBA8 de cima para baixo, com alfa reto — o que o PNG e o GIF querem.
 *
 * `camera` é o que `cameraDe` devolve. `opcoes.fundo` é `"RRGGBB"` ou `null`
 * (transparente); `opcoes.ossos` liga as linhas dos ossos.
 */
export function desenharPose(rt, esqueleto, imagens, camera, opcoes = {}) {
  const { width: largura, height: altura, scale: escala, originX: ox, originY: oy } = camera;
  const paraTela = (wx, wy) => [(wx - ox) * escala, altura - (wy - oy) * escala];

  const quadro = new Quadro(largura, altura);
  if (opcoes.fundo !== undefined && opcoes.fundo !== null) {
    const n = parseInt(String(opcoes.fundo).replace('#', ''), 16);
    const r = ((n >> 16) & 255) / 255, g = ((n >> 8) & 255) / 255, b = (n & 255) / 255;
    for (let i = 0; i < quadro.px.length; i += 4) { quadro.px[i] = r; quadro.px[i + 1] = g; quadro.px[i + 2] = b; quadro.px[i + 3] = 1; }
  }

  const cor = { light: new Float64Array(4), dark: new Float64Array(3), tintBlack: false };
  const dst = new Float64Array(6);
  const src = new Float64Array(6);
  let mundo = new Float64Array(64);
  let desenhados = 0, semImagem = 0, aninhados = 0, emissores = 0, particulas = 0;

  // QA 04/11/2026 (D10): as partículas (extensão BONE_particles). Antes, o
  // emissor caía no "sem imagem" e o GIF da linha de comando saía vazio. As
  // contas são as do runtime — `particleFrame` diz onde, de que tamanho e de
  // que cor, como no `drawParticles` do `CanvasRenderer`: um quadrado da
  // imagem por partícula, centrado no pivô, girado e escalado pela partícula,
  // com a cor = slot × anexo × partícula (9.7).
  const cacheParticulas = new rt.ParticleCache();
  const quadP = new Float64Array(8);
  const uvsP = new Float64Array(8);
  const mundoP = new Float64Array(8);
  const corP = { light: new Float64Array(4), dark: new Float64Array(3), tintBlack: false };
  const QUADRO_DA_PARTICULA = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, width: 0, height: 0 };
  /** Desenha um emissor. Devolve quantas partículas, ou `null` quando falta a imagem. */
  function desenharParticulas(alvo, d, recorte) {
    const anexo = d.attachment;
    const quadroP = rt.particleFrame(alvo, d.slot, anexo, cacheParticulas);
    if (quadroP.silence !== null) return 0;
    rt.computeFinalColor(d.slot, anexo, cor);
    let n = 0;
    for (const p of quadroP.particles) {
      const regiao = anexo.sequence !== null && p.frame >= 0 ? anexo.sequence.regions[p.frame] ?? null : anexo.region;
      const textura = regiao === null ? null : imagens.get(regiao.page.name) ?? null;
      if (textura === null) return null;
      const alfa = cor.light[3] * p.color[3];
      if (alfa <= 0) continue;
      for (let i = 0; i < 3; i++) { corP.light[i] = cor.light[i] * p.color[i]; corP.dark[i] = cor.dark[i]; }
      corP.light[3] = alfa;
      corP.tintBlack = cor.tintBlack;
      rt.computeRegionFrame(QUADRO_DA_PARTICULA, regiao, quadP, uvsP);
      const c = Math.cos((p.angle * Math.PI) / 180) * p.scale;
      const sn = Math.sin((p.angle * Math.PI) / 180) * p.scale;
      for (let i = 0; i < 8; i += 2) {
        mundoP[i] = p.x + quadP[i] * c - quadP[i + 1] * sn;
        mundoP[i + 1] = p.y + quadP[i] * sn + quadP[i + 1] * c;
      }
      const pw = regiao.page.width, ph = regiao.page.height;
      const tris = rt.REGION_TRIANGLES;
      for (let i = 0; i < tris.length; i += 3) {
        for (let k = 0; k < 3; k++) {
          const v = tris[i + k] * 2;
          const [px, py] = paraTela(mundoP[v], mundoP[v + 1]);
          dst[k * 2] = px; dst[k * 2 + 1] = py;
          src[k * 2] = uvsP[v] * pw; src[k * 2 + 1] = uvsP[v + 1] * ph;
        }
        triangulo(quadro, dst, src, textura, corP, regiao.page.premultiplied, d.slot.blend, recorte, rt.shadeTexel);
      }
      n++;
    }
    return n;
  }

  /**
   * Desenha uma ordem de desenho inteira. O attachment `skeleton` de §7.11
   * entra aqui de novo, com o filho já posado pelo runtime, e o recorte do pai
   * segue valendo para o bloco inteiro.
   */
  function desenharEsqueleto(alvo, recortePai, profundidade) {
    for (const d of rt.collectDrawables(alvo)) {
      let recorte = recortePai;
      if (d.clip !== null) {
        const poli = new Float64Array(d.clip.polygon.length);
        for (let i = 0; i < poli.length; i += 2) {
          const [px, py] = paraTela(d.clip.polygon[i], d.clip.polygon[i + 1]);
          poli[i] = px; poli[i + 1] = py;
        }
        const invertido = d.clip.invert;
        const proprio = (x, y) => dentroDoPoligono(poli, x, y) !== invertido;
        recorte = recortePai === null ? proprio : (x, y) => recortePai(x, y) && proprio(x, y);
      }

      if (d.attachment.type === 'skeleton') {
        const filho = d.slot.nested;
        if (filho === null || profundidade + 1 > 8) { semImagem++; continue; }
        aninhados++;
        desenharEsqueleto(filho.skeleton, recorte, profundidade + 1);
        continue;
      }

      if (rt.isParticleAttachment(d.attachment)) {
        const n = desenharParticulas(alvo, d, recorte);
        if (n === null) semImagem++;
        else { emissores++; particulas += n; }
        continue;
      }

      const regiao = rt.regionOf(d.slot, d.attachment);
      const textura = regiao === null ? null : imagens.get(regiao.page.name) ?? null;
      if (textura === null) { semImagem++; continue; }
      rt.computeFinalColor(d.slot, d.attachment, cor);
      if (cor.light[3] <= 0) continue;

      const region = d.attachment.type === 'region';
      const conta = region ? 8 : d.attachment.vertexCount * 2;
      if (mundo.length < conta) mundo = new Float64Array(conta);
      d.attachment.computeWorldVertices(d.slot, mundo, 0, 2);
      const uvs = region ? d.attachment.uvsFor(d.slot) : d.attachment.regionUVsFor(d.slot);
      const tris = region ? rt.REGION_TRIANGLES : d.attachment.triangles;
      const pw = regiao.page.width, ph = regiao.page.height;
      for (let i = 0; i < tris.length; i += 3) {
        for (let k = 0; k < 3; k++) {
          const v = tris[i + k] * 2;
          const [px, py] = paraTela(mundo[v], mundo[v + 1]);
          dst[k * 2] = px; dst[k * 2 + 1] = py;
          src[k * 2] = uvs[v] * pw; src[k * 2 + 1] = uvs[v + 1] * ph;
        }
        triangulo(quadro, dst, src, textura, cor, regiao.page.premultiplied, d.slot.blend, recorte, rt.shadeTexel);
      }
      desenhados++;
    }
  }

  desenharEsqueleto(esqueleto, null, 0);

  if (opcoes.ossos === true) {
    for (const osso of esqueleto.bones) {
      const [x0, y0] = paraTela(osso.worldX, osso.worldY);
      const comp = osso.data.length > 0 ? osso.data.length : 10;
      const [x1, y1] = paraTela(osso.worldX + osso.a * comp, osso.worldY + osso.c * comp);
      linha(quadro, x0, y0, x1, y1, 1, 0.35, 0.1, 0.9);
      quadrado(quadro, x0, y0, 1.5, 0.1, 0.8, 1, 0.9);
    }
  }

  return { largura, altura, rgba: quadro.paraRgba(), desenhados, semImagem, aninhados, emissores, particulas };
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

async function principal() {
  const op = lerArgumentos(process.argv.slice(2));
  if (op.ajuda || op.animacao === undefined || op.saida === undefined) {
    process.stdout.write(USO + '\n');
    process.exit(op.ajuda ? 0 : 2);
  }
  if (!Number.isFinite(op.tempo)) throw new Error(`tempo inválido: ${op.tempo}`);

  const rt = await carregarRuntime();

  if (op.boneEscolhido !== true) {
    console.log(`Nenhum esqueleto passado; usando ${op.bone}`);
  }
  const { dados, imagens } = abrirEsqueleto(rt, op.bone);
  const animacao = dados.animations.find((a) => a.name === op.animacao);
  if (animacao === undefined) {
    throw new Error(`animação "${op.animacao}" não existe; há: ${dados.animations.map((a) => a.name).join(', ')}`);
  }

  // --- pose: avança do zero até o tempo pedido, quadro a quadro (a física
  //     de §6.5 depende do histórico, não só do instante).
  const esqueleto = new rt.Skeleton(dados);
  esqueleto.setToSetupPose();
  esqueleto.updateWorldTransform(0);
  const enquadramento = esqueleto.getBounds();
  posarAte(rt, esqueleto, animacao, op.tempo, op.passo);

  // --- câmera: retângulo do desenho no setup mais a folga, para o
  //     enquadramento não pular de quadro para quadro.
  const camera = cameraDe(juntarLimites(enquadramento, limitesComParticulas(rt, esqueleto)), {
    largura: Math.max(1, Math.round(op.largura)), margem: op.margem,
  });

  // --- desenho (§7.7: ordem de desenho, máscara ativa) e ossos por cima
  const imagem = desenharPose(rt, esqueleto, imagens, camera, { fundo: op.fundo, ossos: op.ossos });
  for (const aviso of esqueleto.nestedWarnings) process.stderr.write(`aviso: ${aviso}\n`);

  const { largura, altura, desenhados, semImagem, aninhados, emissores, particulas } = imagem;
  writeFileSync(resolve(process.cwd(), op.saida), gravarPng(largura, altura, imagem.rgba));
  process.stdout.write(
    `${op.saida}: ${largura}x${altura}, animação "${op.animacao}" em ${op.tempo}s, `
    + `${desenhados} attachment(s) desenhado(s)`
    + `${aninhados > 0 ? `, ${aninhados} esqueleto(s) aninhado(s)` : ''}`
    + `${emissores > 0 ? `, ${emissores} emissor(es) com ${particulas} partícula(s)` : ''}`
    + `${semImagem > 0 ? `, ${semImagem} sem imagem` : ''}\n`,
  );
}

if (import.meta.url === new URL('file:///' + process.argv[1].replace(/\\/g, '/')).href
    || process.argv[1].endsWith('render-png.mjs')) {
  principal().catch((e) => { process.stderr.write(`erro: ${e.message}\n`); process.exit(1); });
}
