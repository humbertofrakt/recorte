// SPDX-License-Identifier: Apache-2.0
// A PROVA da oficina (05/11/2026): boas-vindas → Abrir a oficina → tocar → ver.
//
//   node ferramentas/provas/oficina/prova.cjs [--porta 5287] [--fotos PASTA]
//
// Precisa do editor no ar (node ferramentas/provas/vite-quieto.mjs --port 5287).
// Só clica no que se vê. A motosserra girando sozinha se confere também pelo
// runtime (render-png), que desenha a mesma pose em dois instantes.
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const arg = (n, d) => { const i = process.argv.indexOf(n); return i >= 0 ? process.argv[i + 1] : d; };
const PORTA = arg('--porta', '5287');
const FOTOS = arg('--fotos', null);
const RAIZ = path.resolve(__dirname, '..', '..', '..');
let travou = 0;
const passo = (ok, t) => { console.log(`${ok ? 'passou' : 'TRAVOU'}  ${t}`); if (!ok) travou++; };

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
  const erros = [];
  p.on('pageerror', (e) => erros.push(e.message));
  const foto = async (n) => { if (FOTOS) { fs.mkdirSync(FOTOS, { recursive: true }); await p.screenshot({ path: path.join(FOTOS, `${n}.png`) }); } };
  const cena = p.locator('canvas').first();
  const base = async (n) => { await p.locator('.anim-corpos button').filter({ hasText: n }).first().click(); await p.waitForTimeout(700); };
  const tocar = async (ms) => {
    await p.getByRole('button', { name: /^Tocar/ }).first().click();
    await p.waitForTimeout(ms);
    await p.getByRole('button', { name: /^Pausar|^Tocar/ }).first().click();
  };

  await p.goto(`http://localhost:${PORTA}/`);
  await p.waitForTimeout(2000);
  await p.getByRole('button', { name: /^Abrir a oficina/ }).first().click();
  await p.waitForTimeout(3000);
  const bases = (await p.locator('.anim-corpos').innerText()).replace(/\s+/g, ' ');
  passo(['heroi', 'mecha', 'cavaleiro', 'goblin', 'robo'].every((n) => bases.includes(n)), `boas-vindas → Abrir a oficina: 5 bases (${bases.slice(0, 90)}…)`);

  // (1) o herói com a motosserra
  await base('heroi');
  await p.locator('.anim-item').filter({ hasText: /walk/ }).first().click();
  const a = await cena.screenshot();
  await tocar(500);
  const b2 = await cena.screenshot();
  passo(!a.equals(b2), '(1) o herói anda com a motosserra na mão (walk tocou)');
  const banda = await p.locator('body').innerText();
  passo(/motosserra/.test(banda), '(1) a faixa da arma diz "motosserra" na linha do tempo');
  await foto('1-heroi-motosserra');

  // (4) as duas roupas
  await p.getByRole('tab', { name: /^Skins/ }).first().click().catch(() => p.locator('button, [role=tab]').filter({ hasText: /^Skins$/ }).first().click());
  await p.waitForTimeout(400);
  const roupas = (await p.locator('body').innerText());
  passo(/armadura/.test(roupas), '(4) a aba Skins mostra a segunda roupa: armadura');

  // (2) o mecha com o herói dentro (de volta à aba Animações, onde está a lista Bases)
  await p.locator('button, [role=tab]').filter({ hasText: /^Animações$/ }).first().click();
  await p.waitForTimeout(300);
  await base('mecha');
  const arvore = (await p.locator('.arvore-item').allInnerTexts()).join(' ');
  passo(/piloto/.test(arvore), '(2) na Árvore do mecha, a cabine tem o "piloto" (o herói)');
  // As Tomadas (a tela de encaixe da sessão das Tomadas): a cabine é uma tomada.
  const abaTomadas = p.locator('button, [role=tab]').filter({ hasText: /^Tomadas$/ }).first();
  if (await abaTomadas.isVisible().catch(() => false)) {
    await abaTomadas.click();
    await p.waitForTimeout(400);
    const tomadas = (await p.locator('body').innerText());
    passo(/cabine/.test(tomadas), '(2) a aba Tomadas mostra a cabine do mecha');
    await p.locator('button, [role=tab]').filter({ hasText: /^Imagens$/ }).first().click().catch(() => {});
  }
  await p.locator('button.anim-item-fora').filter({ hasText: 'andar' }).click();
  await p.getByRole('button', { name: 'Ajustar' }).last().click();
  const m1 = await cena.screenshot();
  await tocar(500);
  passo(!m1.equals(await cena.screenshot()), '(2) o mecha anda, com o herói na cabine');
  await foto('2-mecha-com-heroi');

  // (3) três bonecos, as mesmas animações
  for (const n of ['cavaleiro', 'goblin', 'robo']) {
    await base(n);
    const comp = (await p.locator('.anim-de-fora').innerText().catch(() => '')).replace(/\s+/g, ' ');
    passo(/andar/.test(comp) && /Esqueleto padrão/.test(comp), `(3) ${n}: "${comp.slice(0, 60)}"`);
  }
  await p.locator('button.anim-item-fora').filter({ hasText: 'andar' }).click();
  const r1 = await cena.screenshot();
  await tocar(400);
  passo(!r1.equals(await cena.screenshot()), '(3) o robô anda com o andar do Esqueleto padrão');
  await foto('3-robo-andando');
  if (erros.length) { for (const e of erros) console.log('erro da página:', e); travou += erros.length; }
  await b.close();

  // A motosserra gira sozinha: o runtime, o herói em idle, dois instantes.
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'oficina-'));
  const render = (t) => {
    const out = path.join(tmp, `h-${t}.png`);
    execFileSync('node', [path.join(RAIZ, 'ferramentas/render-png.mjs'), path.join(RAIZ, 'exemplo/oficina/motosserra.bone'), 'girar', String(t), out, '--largura', '200', '--sem-ossos']);
    return fs.readFileSync(out);
  };
  passo(!render(0.05).equals(render(0.1)), '(1) pelo runtime: a corrente da motosserra anda sozinha (girar, a camada de fundo)');
  console.log(travou === 0 ? '\nA oficina: os 4 casos, só clicando. Nenhum passo travou.' : `\n${travou} passo(s) travaram.`);
  process.exit(travou === 0 ? 0 : 1);
})();
