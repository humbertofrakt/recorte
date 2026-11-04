#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Compara ONDE A ARTE CAI em dois arquivos `.bone` — lote 36.
//
//   node ferramentas/conferir-arte.mjs formato/exemplos/heroi.bone volta.bone
//
// Sai um JSON com quantos pares foram comparados e a pior diferença, em pixels.
//
// POR QUE ISTO EXISTE
//
// O `montar-psd.mjs` promete que a arte volta no mesmo lugar depois de passar
// pelo PSD. Comparar os NÚMEROS dos dois arquivos não prova isso: o importador
// cria outro esqueleto, com outro atlas e outros nomes de imagem. O que tem que
// bater é **o desenho** — e é isso que este programa mede: ele desenha um slot
// de cada vez, nos dois arquivos, e compara o retângulo do que ficou opaco.
//
// O DESLOCAMENTO COMUM SAI DA CONTA, de propósito: um PSD não guarda onde fica
// a origem do mundo, e o importador centraliza a tela. O que importa é a
// posição de cada peça EM RELAÇÃO ÀS OUTRAS, que é o que faz o personagem ser
// o mesmo personagem.

import { carregarRuntime, abrirEsqueleto, desenharPose } from './render-png.mjs';
import { resolve } from 'node:path';

const USO = 'uso: node ferramentas/conferir-arte.mjs A.bone B.bone [--ossos]\n';

// ---------------------------------------------------------------------------
// --ossos: os ossos também voltam? — lote 45
// ---------------------------------------------------------------------------
//
// O importador com --ossos dá outros nomes (`osso_1`…). Os pares saem de ONDE
// cada osso nasce e para onde aponta, depois de tirar o deslocamento comum,
// como a arte. Depois, pai contra pai e ângulo contra ângulo.

/** Cada osso no mundo, na pose de repouso: base, ângulo, pai. */
function ossosDe(rt, caminho) {
  const { dados } = abrirEsqueleto(rt, caminho);
  const esqueleto = new rt.Skeleton(dados);
  esqueleto.setToSetupPose();
  esqueleto.updateWorldTransform();
  return esqueleto.bones.map((osso) => ({
    nome: osso.data.name,
    pai: osso.parent === null ? null : osso.parent.data.name,
    x: osso.worldX,
    y: osso.worldY,
    angulo: (Math.atan2(osso.c, osso.a) * 180) / Math.PI,
    comprimento: osso.data.length ?? 0,
  }));
}

function girar(angulo) {
  let v = angulo % 360;
  if (v <= -180) v += 360;
  if (v > 180) v -= 360;
  return v;
}

function compararOssos(rt, caminhoA, caminhoB) {
  const um = ossosDe(rt, caminhoA);
  const dois = ossosDe(rt, caminhoB);
  // A raiz sem comprimento é a origem: casa com a raiz do outro lado.
  const eRaiz = (o) => o.pai === null && o.comprimento === 0;
  const linhasUm = um.filter((o) => !eRaiz(o));
  const linhasDois = dois.filter((o) => !eRaiz(o));
  const raizesUm = um.filter(eRaiz);
  if (linhasUm.length === 0 || linhasDois.length === 0) {
    return { pares: 0, paiIgual: 0, paiDiferente: [], faltando: linhasUm.map((o) => o.nome), piorAngulo: null };
  }
  const meio = (lista) => {
    const xs = lista.map((o) => o.x);
    const ys = lista.map((o) => o.y);
    return [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2];
  };
  const [ux, uy] = meio(linhasUm);
  const [dx, dy] = meio(linhasDois);

  const candidatos = [];
  for (const u of linhasUm) {
    for (const d of linhasDois) {
      const base = Math.hypot(u.x - (d.x + ux - dx), u.y - (d.y + uy - dy));
      const giro = Math.abs(girar(u.angulo - d.angulo));
      candidatos.push({ u, d, base, giro, nota: base + giro / 10 });
    }
  }
  candidatos.sort((p, q) => p.nota - q.nota);
  const deUm = new Map();
  const deDois = new Map();
  for (const c of candidatos) {
    if (c.base > 4 || deUm.has(c.u.nome) || deDois.has(c.d.nome)) continue;
    deUm.set(c.u.nome, c);
    deDois.set(c.d.nome, c);
  }

  const traduz = new Map([...deDois].map(([nome, c]) => [nome, c.u.nome]));
  for (const r of dois.filter(eRaiz)) if (raizesUm.length > 0) traduz.set(r.nome, raizesUm[0].nome);
  let paiIgual = raizesUm.length;
  const paiDiferente = [];
  let piorAngulo = 0;
  let ondeAngulo = '';
  for (const [nome, c] of deUm) {
    const obtido = c.d.pai === null ? null : (traduz.get(c.d.pai) ?? `?${c.d.pai}`);
    if (obtido === c.u.pai) paiIgual++;
    else paiDiferente.push(nome);
    if (c.giro > piorAngulo) {
      piorAngulo = c.giro;
      ondeAngulo = nome;
    }
  }
  return {
    pares: deUm.size + raizesUm.length,
    paiIgual,
    paiDiferente,
    faltando: linhasUm.filter((o) => !deUm.has(o.nome)).map((o) => o.nome),
    piorAngulo: Number(piorAngulo.toFixed(3)),
    ondeAngulo,
  };
}

/** O retângulo do que cada slot desenha, por nome, na pose de repouso. */
function caixasDe(rt, caminho) {
  const { dados, imagens } = abrirEsqueleto(rt, caminho);
  const esqueleto = new rt.Skeleton(dados);
  esqueleto.setToSetupPose();
  esqueleto.updateWorldTransform();

  const limites = esqueleto.getBounds();
  const camera = {
    width: Math.ceil(limites.width) + 40,
    height: Math.ceil(limites.height) + 40,
    scale: 1,
    originX: limites.x - 20,
    originY: limites.y - 20,
  };

  const guardados = esqueleto.slots.map((slot) => slot.attachmentName);
  const caixas = new Map();
  for (const alvo of rt.collectDrawables(esqueleto)) {
    const nome = alvo.slot.data.name;
    for (const slot of esqueleto.slots) {
      if (slot.data.name !== nome) slot.setAttachment(null);
    }
    esqueleto.updateWorldTransform();
    const quadro = desenharPose(rt, esqueleto, imagens, camera, { ossos: false });
    esqueleto.slots.forEach((slot, i) => slot.setAttachment(
      guardados[i] === null ? null : esqueleto.getAttachment(slot.data.index, guardados[i]),
    ));
    esqueleto.updateWorldTransform();

    let x0 = quadro.largura; let y0 = quadro.altura; let x1 = -1; let y1 = -1;
    for (let y = 0; y < quadro.altura; y++) {
      for (let x = 0; x < quadro.largura; x++) {
        if (quadro.rgba[(y * quadro.largura + x) * 4 + 3] === 0) continue;
        if (x < x0) x0 = x;
        if (y < y0) y0 = y;
        if (x > x1) x1 = x;
        if (y > y1) y1 = y;
      }
    }
    if (x1 < x0) continue;
    caixas.set(nome, {
      cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, largura: x1 - x0 + 1, altura: y1 - y0 + 1,
    });
  }
  return caixas;
}

async function principal() {
  const args = process.argv.slice(2);
  const comOssos = args.includes('--ossos');
  const [a, b] = args.filter((arg) => !arg.startsWith('--'));
  if (a === undefined || b === undefined) {
    process.stderr.write(USO);
    process.exit(2);
  }
  const rt = await carregarRuntime();
  const um = caixasDe(rt, resolve(process.cwd(), a));
  const dois = caixasDe(rt, resolve(process.cwd(), b));
  const ossos = comOssos
    ? { ossos: compararOssos(rt, resolve(process.cwd(), a), resolve(process.cwd(), b)) }
    : {};

  const nomes = [...um.keys()].filter((nome) => dois.has(nome));
  const faltando = [...um.keys()].filter((nome) => !dois.has(nome));
  if (nomes.length === 0) {
    process.stdout.write(JSON.stringify({ pares: 0, faltando, piorCentro: null, piorTamanho: null, ...ossos }));
    return;
  }
  const dx = nomes.reduce((s, n) => s + (um.get(n).cx - dois.get(n).cx), 0) / nomes.length;
  const dy = nomes.reduce((s, n) => s + (um.get(n).cy - dois.get(n).cy), 0) / nomes.length;

  let piorCentro = 0; let ondeCentro = '';
  let piorTamanho = 0; let ondeTamanho = '';
  for (const nome of nomes) {
    const p = um.get(nome); const q = dois.get(nome);
    const centro = Math.max(Math.abs(p.cx - q.cx - dx), Math.abs(p.cy - q.cy - dy));
    if (centro > piorCentro) { piorCentro = centro; ondeCentro = nome; }
    const tamanho = Math.max(Math.abs(p.largura - q.largura), Math.abs(p.altura - q.altura));
    if (tamanho > piorTamanho) { piorTamanho = tamanho; ondeTamanho = nome; }
  }
  process.stdout.write(JSON.stringify({
    pares: nomes.length,
    faltando,
    deslocamento: [Number(dx.toFixed(3)), Number(dy.toFixed(3))],
    piorCentro: Number(piorCentro.toFixed(3)),
    ondeCentro,
    piorTamanho,
    ondeTamanho,
    ...ossos,
  }));
}

principal().catch((e) => { process.stderr.write(`erro: ${e.message}\n`); process.exit(1); });
