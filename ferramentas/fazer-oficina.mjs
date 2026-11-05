#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// A OFICINA — o exemplo que mostra tudo junto (noite de 04 para 05/11/2026).
//
//   node ferramentas/fazer-oficina.mjs            grava em exemplo/oficina/
//   node ferramentas/fazer-oficina.mjs PASTA
//
// As três ideias do Humberto, num projeto de verdade (com manifest.json):
//
// | Arquivo | O que mostra |
// |:---|:---|
// | heroi.bone + motosserra.bone | o herói segura uma MOTOSSERRA: um esqueleto próprio, com a corrente girando sempre (`baseAnimation`, §7.11) |
// | mecha.bone | um mecha com o HERÓI DENTRO, na cabine (o herói é um anexo `skeleton`) |
// | cavaleiro, goblin, robo | três bonecos de proporções diferentes, as MESMAS animações (parado, andar…) pelo Esqueleto padrão (`assets.animations`, §2.8) |
// | heroi.bone, Skins | o herói com DUAS ROUPAS: `default` e `armadura` |
//
// A arte nova (motosserra, mecha, bonecos) é desenhada aqui: formas com
// contorno, uma luz em cima. O herói é o do exemplo (`formato/exemplos/`).
// Rodar de novo regrava tudo igual (sem data nem número aleatório).
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gravarPng } from './render-png.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SAIDA = resolve(process.argv[2] ?? join(RAIZ, 'exemplo', 'oficina'));
const ler = (p) => JSON.parse(readFileSync(join(RAIZ, p), 'utf8'));
const PADRAO = ler('formato/rigs/humanoide-v1.bone');
const ANIMACOES = 'humanoide-v1-animacoes.bone';

const CABECALHO = (id, nome) => ({
  version: '1.0', minVersion: '1.0', generator: 'Recorte — fazer-oficina.mjs', id,
  created: '2026-11-05T00:00:00Z', modified: '2026-11-05T00:00:00Z', license: 'CC0-1.0',
  copyright: `Exemplo "oficina" do Recorte — ${nome}`,
});

// ---------------------------------------------------------------------------
// O pincel: retângulo arredondado e círculo, com contorno e luz em cima
// ---------------------------------------------------------------------------

const W = 512;
const H = 512;
const px = new Uint8Array(W * H * 4);

function ponto(x, y, c, a = 1) {
  if (x < 0 || y < 0 || x >= W || y >= H) return;
  const k = (y * W + x) * 4;
  const b = 1 - a;
  px[k] = Math.round(c[0] * a + px[k] * b);
  px[k + 1] = Math.round(c[1] * a + px[k + 1] * b);
  px[k + 2] = Math.round(c[2] * a + px[k + 2] * b);
  px[k + 3] = Math.min(255, Math.round(255 * a + px[k + 3] * b));
}
const escuro = (c, f = 0.45) => c.map((v) => Math.round(v * f));
const claro = (c, f = 0.35) => c.map((v) => Math.round(v + (255 - v) * f));

/** Dentro de um retângulo de cantos redondos? Distância à borda (negativo = fora). */
function dentroRet(x, y, w, h, r) {
  const cx = Math.min(Math.max(x, r), w - r);
  const cy = Math.min(Math.max(y, r), h - r);
  const d = Math.hypot(x - cx, y - cy);
  return r - d;
}

/** Pinta uma peça (retângulo redondo) com contorno escuro e luz em cima. */
function peca(x0, y0, w, h, cor, r = 4, borda = 2) {
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const d = dentroRet(i + 0.5, j + 0.5, w, h, Math.min(r, w / 2, h / 2));
      if (d <= -0.5) continue;
      const a = Math.min(1, d + 0.5);
      let c = d < borda ? escuro(cor) : cor;
      if (d >= borda && j < h * 0.35) c = claro(cor, 0.25);
      ponto(x0 + i, y0 + j, c, a);
    }
  }
}

/** Um círculo cheio com contorno; `raios` desenha raios (a roda da motosserra). */
function circulo(x0, y0, d, cor, raios = 0) {
  const r = d / 2;
  for (let j = 0; j < d; j++) {
    for (let i = 0; i < d; i++) {
      const dx = i + 0.5 - r;
      const dy = j + 0.5 - r;
      const dist = Math.hypot(dx, dy);
      if (dist > r) continue;
      let c = dist > r - 2 ? escuro(cor) : cor;
      if (raios > 0 && dist < r - 2) {
        const ang = Math.atan2(dy, dx);
        const s = Math.abs(Math.sin((ang * raios) / 2));
        if (s < 0.25 || dist < r * 0.25) c = escuro(cor, 0.6);
      }
      ponto(x0 + i, y0 + j, c, Math.min(1, r - dist + 0.5));
    }
  }
}

// O empacotador: prateleiras, da esquerda para a direita.
const regioes = [];
let cx = 2;
let cy = 2;
let alturaLinha = 0;
function regiao(nome, w, h, pintar) {
  if (cx + w + 2 > W) { cx = 2; cy += alturaLinha + 2; alturaLinha = 0; }
  if (cy + h + 2 > H) throw new Error(`a folha encheu em ${nome}`);
  pintar(cx, cy, w, h);
  regioes.push({ name: nome, page: 0, x: cx, y: cy, width: w, height: h });
  cx += w + 2;
  alturaLinha = Math.max(alturaLinha, h);
  return { w, h };
}

// ---------------------------------------------------------------------------
// A motosserra
// ---------------------------------------------------------------------------

const LARANJA = [235, 120, 30];
const METAL = [170, 178, 190];
const GRAFITE = [60, 64, 72];
regiao('motosserra/motor', 36, 26, (x, y, w, h) => {
  peca(x, y, w, h, LARANJA, 6);
  peca(x + 6, y + 8, 14, 6, GRAFITE, 2, 1);
});
regiao('motosserra/lamina', 64, 14, (x, y, w, h) => peca(x, y, w, h, METAL, 7));
regiao('motosserra/roda', 16, 16, (x, y, w) => circulo(x, y, w, GRAFITE, 6));
regiao('motosserra/dente', 7, 5, (x, y, w, h) => peca(x, y, w, h, GRAFITE, 1, 1));
regiao('motosserra/cabo', 22, 8, (x, y, w, h) => peca(x, y, w, h, GRAFITE, 4));

const DENTES = 8;
const PASSO = 8;
const motosserra = {
  bone: CABECALHO('6f1e2d3c-4b5a-4968-8778-a1b2c3d4e5f1', 'a motosserra'),
  skeleton: { name: 'motosserra', x: -10, y: -20, width: 120, height: 40, fps: 30, referenceScale: 100 },
  assets: { atlases: ['oficina.atlas.json'], imagesBase: '', skeletonsBase: '' },
  bones: [
    { name: 'raiz' },
    { name: 'motor', parent: 'raiz', length: 30 },
    { name: 'lamina', parent: 'motor', x: 30, y: 0, length: 62 },
    { name: 'corrente_cima', parent: 'lamina', x: 0, y: 6 },
    { name: 'corrente_baixo', parent: 'lamina', x: 0, y: -6 },
    { name: 'roda', parent: 'lamina', x: 56, y: 0 },
  ],
  slots: [
    { name: 'cabo', bone: 'motor', attachment: 'cabo' },
    { name: 'lamina', bone: 'lamina', attachment: 'lamina' },
    ...Array.from({ length: DENTES }, (_, i) => ({ name: `dente_cima_${i + 1}`, bone: 'corrente_cima', attachment: 'dente' })),
    ...Array.from({ length: DENTES }, (_, i) => ({ name: `dente_baixo_${i + 1}`, bone: 'corrente_baixo', attachment: 'dente' })),
    { name: 'roda', bone: 'roda', attachment: 'roda' },
    { name: 'motor', bone: 'motor', attachment: 'motor' },
  ],
  skins: [{
    name: 'default',
    attachments: {
      cabo: { cabo: { type: 'region', path: 'motosserra/cabo', x: 2, y: 14, rotation: 0, width: 22, height: 8 } },
      lamina: { lamina: { type: 'region', path: 'motosserra/lamina', x: 30, y: 0, width: 64, height: 14 } },
      motor: { motor: { type: 'region', path: 'motosserra/motor', x: 14, y: 0, width: 36, height: 26 } },
      roda: { roda: { type: 'region', path: 'motosserra/roda', x: 0, y: 0, width: 16, height: 16 } },
      ...Object.fromEntries(Array.from({ length: DENTES }, (_, i) => [
        `dente_cima_${i + 1}`, { dente: { type: 'region', path: 'motosserra/dente', x: 2 + i * PASSO, y: 1, width: 7, height: 5 } },
      ])),
      ...Object.fromEntries(Array.from({ length: DENTES }, (_, i) => [
        `dente_baixo_${i + 1}`, { dente: { type: 'region', path: 'motosserra/dente', x: 2 + i * PASSO, y: -1, width: 7, height: 5 } },
      ])),
    },
  }],
  animations: [
    {
      // A corrente: os dentes de cima andam para a frente, os de baixo para
      // trás, um passo de dente por volta — e a volta emenda sem pulo.
      name: 'girar', duration: 0.2, loop: true,
      timelines: [
        { type: 'bone', target: 'corrente_cima', property: 'x', keys: [{ time: 0, value: 0 }, { time: 0.2, value: PASSO }] },
        { type: 'bone', target: 'corrente_baixo', property: 'x', keys: [{ time: 0, value: PASSO }, { time: 0.2, value: 0 }] },
        { type: 'bone', target: 'roda', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 0.1, value: -180 }, { time: 0.2, value: -360 }] },
      ],
    },
    {
      name: 'parado', duration: 1, loop: true,
      timelines: [
        { type: 'bone', target: 'motor', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 0.5, value: 1.5 }, { time: 1, value: 0 }] },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Os bonecos do Esqueleto padrão: cavaleiro, goblin, robô — e o mecha
// ---------------------------------------------------------------------------

/** Que peça cada osso desenha: [cor (0 pele, 1 roupa, 2 perna, 3 detalhe), grossura]. */
const PECAS = {
  tronco: [1, 34], pescoco: [0, 12], cabeca: [0, 34], mao_e: [0, 11], mao_d: [0, 11], braco_e: [1, 14], antebraco_e: [0, 12], braco_d: [1, 14], antebraco_d: [0, 12],
  coxa_e: [2, 16], canela_e: [2, 14], pe_e: [3, 11], coxa_d: [2, 16], canela_d: [2, 14], pe_d: [3, 11],
};
/** A ordem de desenho: o lado de trás (e) primeiro. */
const ORDEM = ['braco_e', 'antebraco_e', 'mao_e', 'coxa_e', 'canela_e', 'pe_e', 'pescoco', 'tronco', 'cabeca',
  'coxa_d', 'canela_d', 'pe_d', 'braco_d', 'antebraco_d', 'mao_d'];

const BONECOS = [
  { nome: 'cavaleiro', escala: 1.2, largura: 1.0, cores: [[236, 196, 160], [96, 116, 168], [70, 74, 96], [120, 80, 50]], id: 'c1' },
  { nome: 'goblin', escala: 0.72, largura: 1.45, cores: [[120, 184, 88], [150, 96, 52], [96, 66, 40], [70, 50, 30]], id: 'c2' },
  { nome: 'robo', escala: 1.0, largura: 1.2, cores: [[205, 210, 220], [232, 128, 44], [80, 84, 96], [50, 52, 60]], id: 'c3' },
  { nome: 'mecha', escala: 2.1, largura: 2.4, cores: [[150, 160, 176], [72, 112, 150], [64, 70, 84], [44, 48, 56]], id: 'c4' },
];

for (const b of BONECOS) {
  for (const osso of ORDEM) {
    const [cor, larg] = PECAS[osso];
    const comp = PADRAO.bones.find((o) => o.name === osso).length;
    const w = Math.max(8, Math.round(comp * b.escala) + 4);
    const h = Math.max(8, Math.round(larg * b.largura * (osso === 'cabeca' ? b.escala / b.largura * 1.1 : 1)));
    regiao(`${b.nome}/${osso}`, w, h, (x, y) => {
      peca(x, y, w, h, b.cores[cor], Math.min(8, h / 2));
      // Um detalhe: o olho na cabeça, o cinto no tronco.
      if (osso === 'cabeca') peca(x + Math.round(w * 0.55), y + Math.round(h * 0.55), Math.max(3, Math.round(w * 0.14)), Math.max(3, Math.round(h * 0.14)), [30, 30, 40], 2, 1);
      if (osso === 'tronco') peca(x + 4, y + 2, Math.max(4, Math.round(w * 0.12)), h - 4, b.cores[3], 2, 1);
    });
  }
}
// A cabine do mecha: o fundo, e o vidro por cima do herói.
regiao('mecha/cabine', 74, 80, (x, y, w, h) => peca(x, y, w, h, [40, 44, 54], 12));
regiao('mecha/vidro', 74, 80, (x, y, w, h) => {
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const d = dentroRet(i + 0.5, j + 0.5, w, h, 12);
    if (d <= -0.5) continue;
    if (d < 3) ponto(x + i, y + j, [60, 70, 90], 1);
    else ponto(x + i, y + j, [190, 225, 255], (i + j) % 23 < 3 ? 0.6 : 0.22);
  }
});

function boneco(b, extra = {}) {
  const bones = PADRAO.bones.map((o) => {
    const novo = { name: o.name };
    if (o.parent) novo.parent = o.parent;
    for (const k of ['x', 'y', 'rotation']) if (o[k] !== undefined) novo[k] = o[k];
    if (o.length !== undefined) novo.length = Math.round(o.length * b.escala * 100) / 100;
    if (o.parent && o.parent !== 'raiz') {
      if (typeof novo.x === 'number') novo.x = Math.round(novo.x * b.escala * 100) / 100;
      if (typeof novo.y === 'number') novo.y = Math.round(novo.y * b.escala * 100) / 100;
    }
    if (o.name === 'quadril') novo.y = Math.round(90 * b.escala);
    if (o.folder) novo.folder = o.folder;
    return novo;
  });
  const slots = ORDEM.map((osso) => ({ name: osso, bone: osso, attachment: `${b.nome}/${osso}` }));
  const attachments = {};
  for (const osso of ORDEM) {
    const reg = regioes.find((r) => r.name === `${b.nome}/${osso}`);
    attachments[osso] = { [`${b.nome}/${osso}`]: { type: 'region', x: reg.width / 2 - 2, y: 0, width: reg.width, height: reg.height } };
  }
  const altura = Math.round(235 * b.escala);
  const file = {
    bone: CABECALHO(`00000000-0000-4000-8000-0000000000${b.id}`, b.nome),
    skeleton: { name: b.nome, x: -Math.round(70 * b.escala), y: -10, width: Math.round(140 * b.escala), height: altura, fps: 30, referenceScale: 100 },
    assets: { atlases: ['oficina.atlas.json'], imagesBase: '', skeletonsBase: '', animations: [ANIMACOES] },
    // §4.8: "rig num esqueleto comum é permitido e inerte — documentação e
    // dica ao editor". Este boneco segue o Esqueleto padrão.
    rig: { name: 'humanoide-v1', bones: PADRAO.rig.bones },
    bones, slots, skins: [{ name: 'default', attachments }], animations: [],
    ...extra,
  };
  return file;
}

const bonecos = BONECOS.filter((b) => b.nome !== 'mecha').map((b) => [b.nome, boneco(b)]);

// O mecha: o mesmo esqueleto padrão, grande; no peito, a cabine com o herói.
const M = BONECOS.find((b) => b.nome === 'mecha');
const mecha = boneco(M);
const iTronco = mecha.slots.findIndex((s) => s.name === 'tronco');
mecha.slots.splice(iTronco + 1, 0,
  { name: 'cabine_fundo', bone: 'tronco', attachment: 'cabine' },
  { name: 'cabine', bone: 'tronco', attachment: 'piloto' },
  { name: 'cabine_vidro', bone: 'tronco', attachment: 'vidro' },
);
const tr = mecha.bones.find((o) => o.name === 'tronco').length;
Object.assign(mecha.skins[0].attachments, {
  // O tronco aponta para cima (rotação 90): x anda pelo tronco, e a rotação
  // -90 põe a cabine (e o herói) de pé.
  cabine_fundo: { cabine: { type: 'region', path: 'mecha/cabine', x: tr * 0.62, y: 0, rotation: -90, width: 74, height: 80 } },
  cabine: {
    piloto: {
      type: 'skeleton', uri: 'heroi.bone', x: tr * 0.62 - 34, y: -4, rotation: -90, scaleX: 0.3, scaleY: 0.3,
      skins: [], animation: 'idle', loop: true, timeScale: 1, inheritColor: true,
    },
  },
  cabine_vidro: { vidro: { type: 'region', path: 'mecha/vidro', x: tr * 0.62, y: 0, rotation: -90, width: 74, height: 80 } },
});
mecha.skeleton.y = -10;

// ---------------------------------------------------------------------------
// O herói: o do exemplo, com a motosserra na mão no lugar da espada
// ---------------------------------------------------------------------------

const heroi = ler('formato/exemplos/heroi.bone');
heroi.bone = { ...heroi.bone, copyright: 'Exemplo "oficina" do Recorte — o herói, com a motosserra' };
heroi.assets = { ...heroi.assets, imagesBase: '', skeletonsBase: '' };
const arma = heroi.slots.find((s) => s.name === 'weapon');
arma.attachment = 'motosserra';
const padraoHeroi = heroi.skins.find((s) => s.name === 'default');
delete padraoHeroi.attachments.weapon.sword;
padraoHeroi.attachments.weapon.motosserra = {
  type: 'skeleton', uri: 'motosserra.bone', x: 22, y: 0, rotation: 0, scaleX: 0.85, scaleY: 0.85,
  skins: [], animation: 'parado', loop: true, timeScale: 1, inheritColor: true,
  // §7.11: "A motosserra gira mesmo com o personagem parado."
  baseAnimation: 'girar',
};

// ---------------------------------------------------------------------------
// Gravar
// ---------------------------------------------------------------------------

mkdirSync(SAIDA, { recursive: true });
const grava = (nome, obj) => writeFileSync(join(SAIDA, nome), `${JSON.stringify(obj, null, 2)}\n`);
writeFileSync(join(SAIDA, 'oficina.png'), gravarPng(W, H, px));
grava('oficina.atlas.json', {
  atlas: { version: '1.0', generator: 'Recorte — fazer-oficina.mjs' }, scale: 1,
  pages: [{ name: 'oficina', image: 'oficina.png', width: W, height: H, format: 'rgba8',
    minFilter: 'linear', magFilter: 'linear', wrapU: 'clamp', wrapV: 'clamp', premultiplied: false }],
  regions: regioes,
});
copyFileSync(join(RAIZ, 'formato/exemplos/heroi.png'), join(SAIDA, 'heroi.png'));
copyFileSync(join(RAIZ, 'formato/exemplos/heroi.atlas.json'), join(SAIDA, 'heroi.atlas.json'));
copyFileSync(join(RAIZ, 'formato/rigs', ANIMACOES), join(SAIDA, ANIMACOES));
grava('heroi.bone', heroi);
grava('motosserra.bone', motosserra);
grava('mecha.bone', mecha);
for (const [nome, f] of bonecos) grava(`${nome}.bone`, f);

const corpos = ['heroi.bone', 'mecha.bone', 'cavaleiro.bone', 'goblin.bone', 'robo.bone'];
grava('manifest.json', {
  bonez: { version: '1.0' },
  main: 'heroi.bone',
  skeletons: [...corpos, 'motosserra.bone', ANIMACOES],
  atlases: ['heroi.atlas.json', 'oficina.atlas.json'],
  images: ['heroi.png', 'oficina.png'],
  extras: { RECORTE_projeto: { corpos, entidades: ['motosserra.bone'], emFoco: 'heroi.bone' } },
});
writeFileSync(join(SAIDA, 'LEIA-ME.md'), `# A oficina — o exemplo que mostra tudo junto

Gerado por \`node ferramentas/fazer-oficina.mjs\`. Não editar à mão: rode de novo.

| Base | O que mostra | Onde olhar |
|:---|:---|:---|
| **heroi** | segura uma **motosserra**: um esqueleto próprio, com a corrente girando sempre (\`baseAnimation\`) | abra \`walk\` e toque ▶ |
| **heroi** | **duas roupas**: \`default\` e \`armadura\` | aba Skins |
| **mecha** | o **herói dentro**, na cabine (anexo \`skeleton\`) | Bases → mecha, abra \`andar\` |
| **cavaleiro, goblin, robo** | proporções diferentes, as **mesmas** animações (\`humanoide-v1-animacoes.bone\`) | Bases → cada um, em Compartilhadas |
`);
console.log(`oficina gravada em ${SAIDA}: ${regioes.length} regiões, ${corpos.length} bases`);
