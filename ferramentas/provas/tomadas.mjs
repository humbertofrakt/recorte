// SPDX-License-Identifier: Apache-2.0
// As tomadas, provadas por uma PESSOA — 05/11/2026.
//
// O Humberto: "eu pedia algo, o Claude dizia que programava, mas o que eu
// pedia não aparecia na tela". Esta prova SÓ clica no que está à vista: item
// de menu pelo texto, linha da Árvore pelo nome, ícone pela dica, botão pelo
// que está escrito nele. O script lê o documento apenas para CONFERIR — nunca
// para mudar nada, nem para descobrir onde clicar.
//
// O roteiro:
//   a) abrir o herói; pôr a espada na OUTRA mão (forearm_b), pelo botão
//      direito no osso, na Árvore → "Encaixar um projeto…";
//   b) abrir o mecha; botão direito no tronco → "Pôr uma tomada aqui…",
//      chamá-la "cabine"; clicar no ícone da tomada, na cena → "Encaixar um
//      projeto…" → heroi.bone. O herói entra no mecha, com a espada dele;
//   c) tocar a animação do mecha: o herói e a espada mexem junto.
//
// A janela de escolher arquivo e pasta é do sistema: `disco-na-pagina.js` a
// troca por uma que devolve o que o roteiro manda, ligada ao disco.
//
// USO, da raiz:  npm run tomadas   ·   node ferramentas/provas/tomadas.mjs --fotos PASTA

import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..');
const PORTA = Number(process.env.PORTA_EDITOR ?? 5197);
const URL_EDITOR = process.env.URL_EDITOR ?? `http://localhost:${PORTA}/`;
const arg = (nome) => {
  const i = process.argv.indexOf(nome);
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null;
};
const FOTOS = arg('--fotos');
const TRABALHO = arg('--trabalho') ?? mkdtempSync(join(tmpdir(), 'tomadas-'));
const PASTA_HEROI = join(TRABALHO, 'heroi');
const PASTA_MECHA = join(TRABALHO, 'mecha');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

const resultados = [];
const consoles = [];
let fotoN = 0;

async function passo(nome, fn) {
  const t0 = Date.now();
  let r;
  try { r = await fn(); } catch (e) { r = `quebrou: ${e?.stack ?? e}`; }
  const ok = r === true;
  resultados.push({ nome, ok });
  console.log(`${ok ? 'passou' : 'FALTOU'}  ${((Date.now() - t0) / 1000).toFixed(1).padStart(5)} s  ${nome}${ok ? '' : `\n         ${r}`}`);
  return ok;
}

async function foto(page, nome) {
  if (FOTOS === null) return;
  mkdirSync(FOTOS, { recursive: true });
  fotoN++;
  await page.screenshot({ path: join(FOTOS, `${String(fotoN).padStart(2, '0')}-${nome}.png`) });
}

function prepararPastas() {
  const ex = join(RAIZ, 'formato', 'exemplos');
  rmSync(TRABALHO, { recursive: true, force: true });
  mkdirSync(PASTA_HEROI, { recursive: true });
  mkdirSync(PASTA_MECHA, { recursive: true });
  for (const n of ['heroi.bone', 'heroi.atlas.json', 'heroi.png', 'espada.bone']) copyFileSync(join(ex, n), join(PASTA_HEROI, n));
  for (const n of ['mecha.bone', 'mecha-animacoes.bone', 'mecha-pele-inverno.bone', 'capacete.bone', 'espada.bone', 'heroi.atlas.json', 'heroi.png']) {
    if (existsSync(join(ex, n))) copyFileSync(join(ex, n), join(PASTA_MECHA, n));
  }
}

async function abrirNavegador(browser) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.exposeFunction('__disco', (op, p, dado) => {
    try {
      if (op === 'listar') return readdirSync(p, { withFileTypes: true }).map((e) => ({ name: e.name, dir: e.isDirectory() }));
      if (op === 'ler') return readFileSync(p).toString('base64');
      if (op === 'data') return statSync(p).mtimeMs;
      if (op === 'gravar') { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, Buffer.from(dado, 'base64')); return true; }
      if (op === 'existe') return existsSync(p) ? (statSync(p).isDirectory() ? 'dir' : 'file') : null;
      if (op === 'mkdir') { mkdirSync(p, { recursive: true }); return true; }
      if (op === 'apagar') { rmSync(p, { recursive: true, force: true }); return true; }
      return null;
    } catch (e) { return { erro: String(e) }; }
  });
  await ctx.addInitScript({ path: join(AQUI, 'disco-na-pagina.js') });
  const page = await ctx.newPage();
  page.setDefaultTimeout(6000);
  page.on('console', (m) => { if (m.type() === 'error') consoles.push(`[erro] ${m.text()}`); });
  page.on('pageerror', (e) => consoles.push(`[pageerror] ${e.message}`));
  page.on('dialog', (d) => { consoles.push(`[janela do navegador] ${d.message()}`); d.accept(); });
  await page.goto(URL_EDITOR);
  await page.waitForSelector('canvas.viewport-canvas');
  await page.waitForTimeout(600);
  // Os olhos: SÓ leitura, para conferir.
  await page.evaluate(async () => { window.__vp = (await import('/src/viewport/viewport.ts')).viewportPanel; });
  return { ctx, page };
}

/** Lê o documento, para conferir. Nunca muda nada. */
const ler = (page, fn) => page.evaluate(`(${fn})(window.__vp.doc)`);

/** O que a "janela do sistema" vai devolver quando o programa a abrir. */
const escolherNaJanela = (page, { pasta = null, arquivos = null } = {}) =>
  page.evaluate(([p, a]) => { window.__proximaPasta = p; window.__proximosArquivos = a; }, [pasta, arquivos]);

/** Menu de cima, pelo texto. */
async function menu(page, topo, item) {
  await page.locator('.menu-button', { hasText: new RegExp(`^${topo}$`) }).click();
  await page.waitForTimeout(150);
  await page.locator('.menu-list:not([hidden]) .menu-item:visible', { has: page.locator('.menu-name', { hasText: item }) }).first().click();
  await page.waitForTimeout(300);
}

/** Item do menu flutuante (botão direito, ícone), pelo texto. */
async function itemFlutuante(page, texto) {
  const item = page.locator('.menu-flutuante-item:visible', { hasText: texto }).first();
  await item.waitFor({ timeout: 3000 });
  await item.click();
  await page.waitForTimeout(300);
}

/** Botão direito na linha da Árvore com este nome. */
async function botaoDireitoNaArvore(page, nome) {
  await page.locator('[role="tab"]', { hasText: /^\s*Árvore/ }).first().click().catch(() => {});
  const busca = page.locator('.arvore-item', { has: page.locator('.arvore-nome', { hasText: new RegExp(`^${nome}$`) }) }).first();
  await busca.scrollIntoViewIfNeeded();
  await busca.click({ button: 'right' });
  await page.waitForTimeout(250);
}

/** A janela "falta o atlas": o botão que escolhe a pasta da peça. */
async function responderPastaDaPeca(page, pasta) {
  const janela = page.locator('.dialog-box', { hasText: 'falta' });
  try { await janela.waitFor({ timeout: 2500 }); } catch { return false; }
  await escolherNaJanela(page, { pasta });
  await janela.locator('button', { hasText: 'Escolher a pasta de' }).click();
  await page.waitForTimeout(1200);
  return true;
}


/** Com vários .bone na pasta, o programa pergunta qual: a pessoa clica no nome. */
async function escolherBone(page, nome) {
  const botao = page.locator('.dialog-box button', { hasText: new RegExp(`^\\s*${nome.replace('.', '\\.')}\\s*$`) }).first();
  const veio = await botao.waitFor({ timeout: 2500 }).then(() => true).catch(() => false);
  if (!veio) return false;
  await foto(page, `qual-bone-${nome}`);
  await botao.click();
  await page.waitForTimeout(500);
  return true;
}

async function esperarAte(page, fn, ms = 8000) {
  const fim = Date.now() + ms;
  while (Date.now() < fim) {
    if (await ler(page, fn)) return true;
    await page.waitForTimeout(200);
  }
  return false;
}

const rodape = async (page) => (await page.locator('.status-state').first().textContent().catch(() => '')) ?? '';

async function roteiro(browser) {
  const { ctx, page } = await abrirNavegador(browser);

  await passo('a1. Arquivo → Abrir pasta do projeto…, a pasta do herói', async () => {
    await escolherNaJanela(page, { pasta: PASTA_HEROI });
    await menu(page, 'Arquivo', 'Abrir pasta do projeto…');
    await escolherBone(page, 'heroi.bone');
    const ok = await esperarAte(page, (d) => (d.file.slots ?? []).some((s) => s.name === 'weapon'));
    await foto(page, 'heroi-aberto');
    return ok || `o herói não abriu · ${await rodape(page)}`;
  });

  await passo('a2. Botão direito em forearm_b, na Árvore → Encaixar um projeto… → espada.bone', async () => {
    await botaoDireitoNaArvore(page, 'forearm_b');
    await foto(page, 'menu-do-osso-na-arvore');
    await escolherNaJanela(page, { arquivos: [join(PASTA_HEROI, 'espada.bone')] });
    await itemFlutuante(page, 'Encaixar um projeto…');
    await responderPastaDaPeca(page, PASTA_HEROI);
    const ok = await esperarAte(page, (d) => (d.file.slots ?? []).some((s) => s.bone === 'forearm_b' && s.attachment === 'espada'));
    await foto(page, 'espada-na-outra-mao');
    if (!ok) return `a espada não entrou em forearm_b · ${await rodape(page)}`;
    const icone = await page.locator('.tomada-icone[title*="segura espada"]').count();
    return icone >= 2 || `esperava dois ícones de tomada com a espada, há ${icone}`;
  });

  await passo('a3. O ícone da tomada nova abre o menu dela: trocar ou tirar a peça', async () => {
    const icone = page.locator('.tomada-icone[title^="Tomada tomada_forearm_b"]').first();
    await icone.click();
    await page.waitForTimeout(200);
    const itens = await page.locator('.menu-flutuante-item:visible').allTextContents();
    await foto(page, 'menu-do-icone');
    await page.keyboard.press('Escape');
    return (itens.some((t) => t.startsWith('Trocar a peça')) && itens.some((t) => t.startsWith('Tirar a peça'))) || `o menu tem: ${itens.join(' | ')}`;
  });

  await passo('a4. Ícone → Tirar a peça; depois arrastar a espada da lista Peças até o ícone vazio', async () => {
    await page.locator('.tomada-icone[title^="Tomada tomada_forearm_b"]').first().click();
    await itemFlutuante(page, 'Tirar a peça (espada)');
    const vazio = page.locator('.tomada-icone[title^="Tomada tomada_forearm_b, vazia"]').first();
    if (await vazio.count() === 0) return `a tomada não ficou vazia · ${await rodape(page)}`;
    await page.locator('[role="tab"]', { hasText: /^\s*Tomadas/ }).first().click();
    await page.waitForTimeout(300);
    const peca = page.locator('.imagens-linha[data-entidade="espada.bone"]').first();
    await peca.dragTo(vazio);
    await page.waitForTimeout(400);
    await foto(page, 'arrastou-a-peca');
    const ok = await ler(page, (d) => (d.file.slots ?? []).some((s) => s.name === 'tomada_forearm_b' && s.attachment === 'espada'));
    return ok || `a espada não voltou para a tomada · ${await rodape(page)}`;
  });

  await passo('b1. Arquivo → Abrir pasta do projeto…, a pasta do mecha', async () => {
    await escolherNaJanela(page, { pasta: PASTA_MECHA });
    await menu(page, 'Arquivo', 'Abrir pasta do projeto…');
    // Antes, talvez: "salvar o herói?". Depois: qual .bone abrir.
    const naoSalvar0 = page.locator('.dialog-box button', { hasText: /Não salvar|Descartar|Jogar fora|sem salvar/ }).first();
    if (await naoSalvar0.waitFor({ timeout: 1200 }).then(() => true).catch(() => false)) { await foto(page, 'salvar-antes'); await naoSalvar0.click(); await page.waitForTimeout(300); }
    await escolherBone(page, 'mecha.bone');
    // Uma janela "salvar o herói antes?": a pessoa escolhe não salvar.
    const naoSalvar = page.locator('.dialog-box button', { hasText: /Não salvar|Descartar|Jogar fora/ }).first();
    if (await naoSalvar.count() > 0) await naoSalvar.click();
    const ok = await esperarAte(page, (d) => d.file.skeleton?.name === 'mecha' || (d.file.bones ?? []).some((b) => b.name === 'hand') && !(d.file.bones ?? []).some((b) => b.name === 'forearm'));
    await foto(page, 'mecha-aberto');
    return ok || `o mecha não abriu · ${await rodape(page)}`;
  });

  await passo('b2. Botão direito no tronco → Pôr uma tomada aqui… → "cabine"', async () => {
    await botaoDireitoNaArvore(page, 'torso');
    await itemFlutuante(page, 'Pôr uma tomada aqui…');
    const janela = page.locator('.dialog-box', { hasText: 'Pôr uma tomada no osso torso' });
    await janela.waitFor({ timeout: 3000 });
    const campo = janela.locator('input').first();
    await campo.fill('cabine');
    await foto(page, 'nome-da-tomada');
    await janela.locator('button', { hasText: 'Pôr a tomada' }).click();
    await page.waitForTimeout(400);
    const icone = page.locator('.tomada-icone[title^="Tomada cabine, vazia"]');
    await foto(page, 'tomada-cabine-vazia');
    return (await icone.count()) === 1 || `sem o ícone da tomada cabine · ${await rodape(page)}`;
  });

  await passo('b3. Clique no ícone da cabine → Encaixar um projeto… → heroi.bone', async () => {
    await page.locator('.tomada-icone[title^="Tomada cabine, vazia"]').first().click();
    await escolherNaJanela(page, { arquivos: [join(PASTA_HEROI, 'heroi.bone')] });
    await itemFlutuante(page, 'Encaixar um projeto…');
    await responderPastaDaPeca(page, PASTA_HEROI);
    const ok = await esperarAte(page, (d) => {
      const s = d.skeleton?.findSlot('cabine');
      const n = s?.nestedSkeleton?.() ?? null;
      return n !== null && n.skeleton.findSlot('weapon')?.nestedSkeleton?.() != null;
    });
    await foto(page, 'heroi-na-cabine');
    return ok || `o herói (com a espada dele) não entrou na cabine · ${await rodape(page)}`;
  });

  await passo('b4. Ícone da cabine → "Animação própria, sempre ligada: walk"; o "Mexe junto" vem marcado', async () => {
    await page.locator('.tomada-icone[title^="Tomada cabine: segura heroi"]').first().click();
    await page.waitForTimeout(200);
    const itens = await page.locator('.menu-flutuante-item:visible').allTextContents();
    await foto(page, 'menu-da-cabine');
    if (!itens.some((t) => t.startsWith('✓ Mexe junto com a animação de quem segura'))) return `o menu tem: ${itens.join(' | ')}`;
    await itemFlutuante(page, 'Animação própria, sempre ligada: walk');
    const base = await ler(page, (d) => d.file.skins[0].attachments.cabine?.heroi?.baseAnimation ?? null);
    return base === 'walk' || `baseAnimation ficou ${base}`;
  });

  await passo('b5. A aba Tomadas mostra a cadeia: mecha › cabine › heroi', async () => {
    await page.locator('[role="tab"]', { hasText: /^\s*Tomadas/ }).first().click();
    await page.waitForTimeout(400);
    const texto = await page.locator('.entidades-rolo, [class*="entidades"]').first().innerText().catch(() => '');
    await foto(page, 'aba-tomadas');
    return (texto.includes('cabine') && texto.includes('heroi')) || `a aba diz: ${texto.slice(0, 200)}`;
  });

  await passo('c. Animação idle do mecha, botão Tocar: o herói e a espada mexem junto', async () => {
    await page.locator('[role="tab"]', { hasText: /^\s*Animações/ }).first().click().catch(() => {});
    await page.locator('button', { hasText: /^\s*★?\s*idle\b/ }).first().click();
    await page.waitForTimeout(300);
    const medida = () => ler(page, (d) => {
      const n = d.skeleton?.findSlot('cabine')?.nestedSkeleton?.();
      const torso = d.skeleton?.findBone('torso');
      const raiz = n?.skeleton.findBone('root');
      const esp = n?.skeleton.findSlot('weapon')?.nestedSkeleton?.()?.skeleton.findBone('lamina');
      return { t: d.time, torso: torso ? [torso.worldX, torso.worldY, torso.worldRotationX] : null, raiz: raiz ? [raiz.worldX, raiz.worldY, raiz.worldRotationX] : null, lamina: esp ? [esp.worldX, esp.worldY, esp.worldRotationX] : null, anim: d.animation };
    });
    const antes = await medida();
    await page.locator('.dope-tocador button[aria-label^="Tocar"]').first().click();
    const quadros = [];
    for (let i = 0; i < 8; i++) { await page.waitForTimeout(180); quadros.push(await medida()); }
    await foto(page, 'tocando');
    await page.locator('.dope-tocador button[aria-label^="Tocar"], .dope-tocador button[aria-label^="Pausar"]').first().click().catch(() => {});
    if (antes.anim !== 'idle') return `a animação aberta é ${antes.anim}`;
    if (quadros.some((q) => q.raiz === null || q.lamina === null)) return 'o herói ou a espada sumiram tocando';
    const tempos = new Set(quadros.map((q) => q.t.toFixed(2)));
    if (tempos.size < 3) return `não tocou (tempos ${[...tempos].join(' ')})`;
    // Junto: a raiz do herói anda com o tronco do mecha; a lâmina anda.
    // O herói gira com o tronco: a diferença de giro e de lugar é constante.
    const desvio = quadros.map((q) => Math.hypot(q.raiz[0] - q.torso[0], q.raiz[1] - q.torso[1]));
    const giro = quadros.map((q) => q.raiz[2] - q.torso[2]);
    const fixo = Math.max(...desvio) - Math.min(...desvio) < 1e-3 && Math.max(...giro) - Math.min(...giro) < 1e-3;
    const laminaAnda = new Set(quadros.map((q) => q.lamina.map((v) => v.toFixed(2)).join(','))).size > 1;
    const torsoAnda = new Set(quadros.map((q) => q.torso.map((v) => v.toFixed(2)).join(','))).size > 1;
    if (!fixo) return 'o herói não ficou preso ao tronco do mecha';
    if (!laminaAnda) return 'a espada do herói ficou parada';
    return torsoAnda || 'o tronco do mecha não andou no idle: a prova de "junto" não prova';
  });

  await passo('d. Ctrl+S: o mecha salvo passa no validador, e o runtime desenha o herói na cabine', async () => {
    await page.locator('canvas.viewport-canvas').first().focus().catch(() => {});
    await page.locator('.viewport').first().focus();
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(2500);
    const arquivos = readdirSync(PASTA_MECHA);
    if (!arquivos.includes('heroi.bone')) return `o heroi.bone não foi para a pasta do mecha: ${arquivos.join(', ')} · ${await rodape(page)}`;
    const v = spawnSync(process.execPath, [join(RAIZ, 'ferramentas/validador/validar.mjs'), join(PASTA_MECHA, 'mecha.bone')], { encoding: 'utf8' });
    if (v.status !== 0) return `validador: ${v.stdout} ${v.stderr}`;
    const rp = await import('../render-png.mjs');
    const rt = await rp.carregarRuntime();
    const { dados, imagens } = rp.abrirEsqueleto(rt, join(PASTA_MECHA, 'mecha.bone'));
    const sk = new rt.Skeleton(dados);
    sk.setToSetupPose(); sk.updateWorldTransform(0);
    rp.posarAte(rt, sk, dados.animations.find((a) => a.name === 'idle'), 0.5);
    const n = sk.findSlot('cabine')?.nestedSkeleton() ?? null;
    if (n === null) return 'o runtime não montou o herói na cabine';
    if (n.skeleton.findSlot('weapon')?.nestedSkeleton() == null) return 'o runtime não montou a espada do herói';
    if (FOTOS !== null) {
      const cam = rp.cameraDe(sk.getBounds(), { largura: 320, margem: 0.12 });
      const img = rp.desenharPose(rt, sk, imagens, cam, { ossos: false });
      fotoN++;
      writeFileSync(join(FOTOS, `${String(fotoN).padStart(2, '0')}-runtime-mecha-com-heroi.png`), rp.gravarPng(img.largura, img.altura, img.rgba));
    }
    return true;
  });

  await ctx.close();
}

/** e. A oficina de exemplo: as tomadas que ela já traz estão à vista. */
async function oficina(browser) {
  const { ctx, page } = await abrirNavegador(browser);
  await passo('e1. Boas-vindas → Abrir a oficina: a motosserra na mão do herói, com ícone e cartão', async () => {
    await page.locator('.boas-vindas-botao', { hasText: 'Abrir a oficina' }).click();
    const ok = await esperarAte(page, (d) => (d.file.slots ?? []).length > 0, 10000);
    if (!ok) return `a oficina não abriu · ${await rodape(page)}`;
    await page.waitForTimeout(500);
    const icone = await page.locator('.tomada-icone[title*="segura motosserra"]').count();
    await page.locator('[role="tab"]', { hasText: /^\s*Tomadas/ }).first().click();
    await page.waitForTimeout(300);
    const texto = await page.locator('.entidades-rolo').first().innerText();
    await foto(page, 'oficina-heroi');
    if (icone !== 1) return `ícones com a motosserra: ${icone}`;
    return (texto.includes('motosserra') && !/arraste para um slot/.test(texto)) || `a aba diz: ${texto.slice(0, 200)}`;
  });
  await passo('e2. Bases → mecha: o ícone da cabine com o herói, e a cadeia mecha › cabine › heroi › motosserra', async () => {
    await page.locator('[role="tab"]', { hasText: /^\s*Animações/ }).first().click().catch(() => {});
    const linha = page.locator(':visible', { hasText: /^\s*Base — montar · mecha/ }).last();
    await linha.scrollIntoViewIfNeeded();
    await linha.click();
    await page.waitForTimeout(1200);
    const icone = await page.locator('.tomada-icone[title^="Tomada cabine: segura heroi"]').count();
    await page.locator('[role="tab"]', { hasText: /^\s*Tomadas/ }).first().click();
    await page.waitForTimeout(300);
    const texto = await page.locator('.entidades-rolo').first().innerText();
    await foto(page, 'oficina-mecha');
    const ordem = ['mecha', 'cabine', 'heroi', 'motosserra'].map((p) => texto.indexOf(p));
    if (icone !== 1) return `sem o ícone da cabine com o herói (${icone})`;
    return ordem.every((v, i) => v >= 0 && (i === 0 || v > ordem[i - 1])) || `a cadeia não está em ordem: ${texto.slice(0, 200)}`;
  });
  await ctx.close();
}

async function subirEditor() {
  if (process.env.URL_EDITOR) return null;
  const vite = spawn(process.execPath, [join(AQUI, 'vite-quieto.mjs'), '--port', String(PORTA)], { cwd: RAIZ, stdio: 'ignore' });
  for (let i = 0; i < 120; i++) {
    try { if ((await fetch(URL_EDITOR)).ok) return vite; } catch { /* subindo */ }
    await esperar(250);
  }
  vite.kill();
  throw new Error(`o editor não subiu em ${URL_EDITOR}`);
}

const vite = await subirEditor();
const browser = await chromium.launch();
try {
  prepararPastas();
  await roteiro(browser);
  await oficina(browser);
} finally {
  await browser.close();
  vite?.kill();
}
if (consoles.length > 0) { console.log('\nConsole:'); for (const c of consoles.slice(0, 30)) console.log('  ' + c); }
const falhou = resultados.filter((r) => !r.ok).length;
console.log(`\n${resultados.length - falhou} de ${resultados.length} passos. Trabalho em ${TRABALHO}`);
process.exitCode = falhou === 0 ? 0 : 1;
