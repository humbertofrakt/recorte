// SPDX-License-Identifier: Apache-2.0
// Os três bonecos da prova "reaproveitar animação" (noite de 04/11/2026).
//
//   node ferramentas/provas/reaproveitar/fazer-bonecos.mjs PASTA
//
// Grava em PASTA: bonecos.png + bonecos.atlas.json (retângulos coloridos) e
//   cavaleiro.bone  alto, com os nomes do humanoide-v1
//   goblin.bone     baixo e largo, com os nomes do humanoide-v1
//   robo.bone       nomes DIFERENTES (braco_direito, perna_esquerda…): o
//                   caso de quem montou o boneco antes de conhecer o padrão
// São o que uma pessoa teria no disco ANTES de reaproveitar: bonecos já
// montados, sem animação nenhuma. A prova só clica a partir daí.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gravarPng } from '../../render-png.mjs';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const PADRAO = JSON.parse(readFileSync(join(RAIZ, 'formato/rigs/humanoide-v1.bone'), 'utf8'));

/** Os nomes do robô: quem montou antes de conhecer o padrão. */
export const NOMES_DO_ROBO = {
  raiz: 'raiz', quadril: 'bacia', tronco: 'corpo', pescoco: 'pescoco', cabeca: 'cabeca',
  braco_e: 'braco_esquerdo', antebraco_e: 'antebraco_esquerdo', mao_e: 'mao_esquerda',
  braco_d: 'braco_direito', antebraco_d: 'antebraco_direito', mao_d: 'mao_direita',
  coxa_e: 'perna_esquerda', canela_e: 'canela_esquerda', pe_e: 'pe_esquerdo',
  coxa_d: 'perna_direita', canela_d: 'canela_direita', pe_d: 'pe_direito',
};

// Cada boneco: escala do comprimento, cores (pele, roupa, perna) e largura.
const BONECOS = [
  { nome: 'cavaleiro', escala: 1.25, largura: 1.0, cores: [[230, 190, 150], [120, 130, 150], [70, 70, 90]], nomes: null },
  { nome: 'goblin', escala: 0.7, largura: 1.5, cores: [[110, 170, 80], [140, 90, 40], [90, 60, 30]], nomes: null },
  { nome: 'robo', escala: 1.0, largura: 1.2, cores: [[200, 200, 210], [220, 120, 40], [80, 80, 90]], nomes: NOMES_DO_ROBO },
];

// Que parte do corpo cada osso desenha, com a cor (0 pele, 1 roupa, 2 perna).
const PECAS = [
  ['tronco', 1, 30], ['cabeca', 0, 34],
  ['braco_e', 1, 12], ['antebraco_e', 0, 10], ['braco_d', 1, 12], ['antebraco_d', 0, 10],
  ['coxa_e', 2, 14], ['canela_e', 2, 12], ['pe_e', 2, 10],
  ['coxa_d', 2, 14], ['canela_d', 2, 12], ['pe_d', 2, 10],
];
// Na ordem de desenho: o lado de trás (e) primeiro.
const ORDEM = ['braco_e', 'antebraco_e', 'coxa_e', 'canela_e', 'pe_e', 'tronco', 'cabeca',
  'coxa_d', 'canela_d', 'pe_d', 'braco_d', 'antebraco_d'];

export function fazerBonecos(pasta) {
  mkdirSync(pasta, { recursive: true });
  // As regiões: uma tira por boneco, cada peça um retângulo de cor.
  const regioes = [];
  const pintar = [];
  let y = 2;
  const W = 512;
  for (const b of BONECOS) {
    let x = 2;
    let alturaLinha = 0;
    for (const [osso, cor, larg] of PECAS) {
      const comp = PADRAO.bones.find((o) => o.name === osso).length;
      const w = Math.max(6, Math.round(comp * b.escala));
      const h = Math.max(6, Math.round(larg * b.largura * (osso === 'cabeca' ? b.escala : 1)));
      if (x + w + 2 > W) { x = 2; y += alturaLinha + 2; alturaLinha = 0; }
      regioes.push({ name: `${b.nome}/${osso}`, page: 0, x, y, width: w, height: h });
      pintar.push({ x, y, w, h, c: b.cores[cor] });
      x += w + 2;
      alturaLinha = Math.max(alturaLinha, h);
    }
    y += alturaLinha + 4;
  }
  const H = 256;
  const rgba = new Uint8Array(W * H * 4);
  for (const p of pintar) {
    for (let j = 0; j < p.h; j++) for (let i = 0; i < p.w; i++) {
      const borda = i === 0 || j === 0 || i === p.w - 1 || j === p.h - 1;
      const k = ((p.y + j) * W + (p.x + i)) * 4;
      rgba[k] = borda ? p.c[0] * 0.5 : p.c[0];
      rgba[k + 1] = borda ? p.c[1] * 0.5 : p.c[1];
      rgba[k + 2] = borda ? p.c[2] * 0.5 : p.c[2];
      rgba[k + 3] = 255;
    }
  }
  writeFileSync(join(pasta, 'bonecos.png'), gravarPng(W, H, rgba));
  writeFileSync(join(pasta, 'bonecos.atlas.json'), JSON.stringify({
    atlas: { version: '1.0', generator: 'prova reaproveitar' }, scale: 1,
    pages: [{ name: 'bonecos', image: 'bonecos.png', width: W, height: H, format: 'rgba8',
      minFilter: 'linear', magFilter: 'linear', wrapU: 'clamp', wrapV: 'clamp', premultiplied: false }],
    regions: regioes,
  }, null, 2) + '\n');

  for (const b of BONECOS) {
    const nome = (n) => (b.nomes === null ? n : b.nomes[n]);
    const bones = PADRAO.bones.map((o) => {
      const novo = { name: nome(o.name) };
      if (o.parent) novo.parent = nome(o.parent);
      for (const k of ['x', 'y', 'rotation']) if (o[k] !== undefined) novo[k] = o[k];
      if (o.length !== undefined) novo.length = Math.round(o.length * b.escala * 100) / 100;
      if (o.name !== 'raiz' && o.parent !== 'raiz') {
        if (typeof novo.x === 'number') novo.x = Math.round(novo.x * b.escala * 100) / 100;
        if (typeof novo.y === 'number') novo.y = Math.round(novo.y * b.escala * 100) / 100;
      }
      if (o.name === 'quadril') novo.y = Math.round(90 * b.escala);
      return novo;
    });
    const slots = ORDEM.map((osso) => ({ name: `${b.nome}_${osso}`, bone: nome(osso), attachment: `${b.nome}/${osso}` }));
    const attachments = {};
    for (const osso of ORDEM) {
      const reg = regioes.find((r) => r.name === `${b.nome}/${osso}`);
      attachments[`${b.nome}_${osso}`] = {
        [`${b.nome}/${osso}`]: { type: 'region', x: reg.width / 2, y: 0, width: reg.width, height: reg.height },
      };
    }
    const altura = Math.round(230 * b.escala);
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'prova reaproveitar',
        id: `00000000-0000-4000-8000-00000000000${BONECOS.indexOf(b) + 1}`,
        created: '2026-11-05T00:00:00Z', modified: '2026-11-05T00:00:00Z', license: 'CC0-1.0' },
      skeleton: { name: b.nome, x: -80, y: -10, width: 160, height: altura, fps: 30, referenceScale: 100 },
      assets: { atlases: ['bonecos.atlas.json'], imagesBase: '', skeletonsBase: '' },
      bones, slots, skins: [{ name: 'default', attachments }], animations: [],
    };
    writeFileSync(join(pasta, `${b.nome}.bone`), JSON.stringify(file, null, 2) + '\n');
  }
  return BONECOS.map((b) => `${b.nome}.bone`);
}

if (process.argv[1] && process.argv[1].endsWith('fazer-bonecos.mjs')) {
  const pasta = resolve(process.argv[2] ?? 'bonecos');
  console.log(fazerBonecos(pasta).join(', '), '→', pasta);
}
