// SPDX-License-Identifier: Apache-2.0
// A espada de um, o boneco de outro — a ideia que deu origem ao Recorte,
// provada pelo PROGRAMA, de ponta a ponta, por duas pessoas.
//
// O Humberto: "uma pessoa possa desenhar uma espada e outra possa animar um
// boneco, e nesse tipo de arquivo seja possível juntar os dois".
//
// COMO
//
// - Um Chromium sem janela, dirigido pelo Playwright, com mouse e teclado de
//   verdade. Nenhuma função de dentro do editor é chamada para MUDAR nada:
//   menu se abre clicando, ferramenta se pega pela tecla, osso se cria
//   arrastando, chave nasce girando a bolinha. O script só LÊ o documento para
//   saber onde clicar (os olhos da pessoa) e para conferir.
// - A janela de escolher pasta e arquivo é do sistema, não do programa: o
//   Chromium sem janela não a abre. `disco-na-pagina.js` a troca por uma que
//   devolve a pasta (ou o arquivo) que o roteiro manda, LIGADA AO DISCO DE
//   VERDADE: o que o editor grava cai no disco, e o que a pessoa A grava, a
//   pessoa B lê.
// - Pessoa A e pessoa B são dois navegadores, com perfis separados, como duas
//   máquinas. Só o disco passa de uma para a outra.
// - No fim: `npm run validar` e `ferramentas/render-png.mjs --bone` sobre o que
//   a pessoa B salvou, e a conta da mão e da espada pelo runtime.
//
// USO, da raiz do projeto:
//
//   npm run espada
//   node ferramentas/provas/espada-e-boneco.mjs [--fotos PASTA] [--trabalho PASTA]
//
// O script sobe o próprio editor na porta 5196 (PORTA_EDITOR muda), ou usa o
// que URL_EDITOR apontar. As pastas das duas pessoas ficam numa pasta
// temporária, ou em --trabalho.
//
// Código 1 quando algum passo não passou.

import { createRequire } from 'node:module';
import { spawn, spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync, crc32 } from 'node:zlib';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..');
const PORTA = Number(process.env.PORTA_EDITOR ?? 5196);
const URL_EDITOR = process.env.URL_EDITOR ?? `http://localhost:${PORTA}/`;
const arg = (nome) => {
  const i = process.argv.indexOf(nome);
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null;
};
const FOTOS = arg('--fotos');
const TRABALHO = arg('--trabalho') ?? mkdtempSync(join(tmpdir(), 'espada-e-boneco-'));
const PASTA_A = join(TRABALHO, 'pessoa-a', 'espada');
const PASTA_B = join(TRABALHO, 'pessoa-b', 'heroi');
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// As imagens da espada: PNG feito aqui, sem biblioteca
// ---------------------------------------------------------------------------

function png(w, h, pinta) {
  const linhas = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    linhas[y * (w * 4 + 1)] = 0;
    for (let x = 0; x < w; x++) {
      const [r, g, b, a] = pinta(x, y) ?? [0, 0, 0, 0];
      const o = y * (w * 4 + 1) + 1 + x * 4;
      linhas[o] = r; linhas[o + 1] = g; linhas[o + 2] = b; linhas[o + 3] = a;
    }
  }
  const pedaco = (tipo, dado) => {
    const t = Buffer.from(tipo, 'ascii');
    const tam = Buffer.alloc(4); tam.writeUInt32BE(dado.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, dado])) >>> 0);
    return Buffer.concat([tam, t, dado, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pedaco('IHDR', ihdr), pedaco('IDAT', deflateSync(linhas)), pedaco('IEND', Buffer.alloc(0)),
  ]);
}

/** A espada deitada, a ponta para a direita (o eixo x do osso). `cor` = a lâmina. */
function imagensDaEspada(cor) {
  const borda = [30, 30, 30, 255];
  const cabo = png(40, 14, (x, y) => {
    if (x >= 32) return y >= 0 ? [200, 160, 40, 255] : null; // a guarda, dourada
    if (y < 3 || y > 10) return null;
    if (y === 3 || y === 10) return borda;
    return (x % 6 < 3) ? [110, 70, 35, 255] : [80, 50, 25, 255];
  });
  const lamina = png(110, 16, (x, y) => {
    const meio = 7.5;
    const meia = x < 90 ? 7 : 7 * (110 - x) / 20; // a ponta afina
    const d = Math.abs(y - meio);
    if (d > meia) return null;
    if (d > meia - 1.2) return borda;
    return [cor[0] - Math.round(d * 6), cor[1] - Math.round(d * 6), cor[2] - Math.round(d * 4), 255];
  });
  const brilho = png(90, 4, (x, y) => [255, 255, 255, Math.round(200 * (1 - Math.abs(y - 1.5) / 2) * (1 - x / 90))]);
  return { 'cabo.png': cabo, 'lamina.png': lamina, 'brilho.png': brilho };
}

// ---------------------------------------------------------------------------
// O relatório
// ---------------------------------------------------------------------------

const resultados = [];
const consoles = [];
let fotoN = 0;

async function passo(nome, fn) {
  const t0 = Date.now();
  let r;
  try { r = await fn(); } catch (e) { r = `quebrou: ${e?.stack ?? e}`; }
  const ok = r === true;
  resultados.push({ nome, ok, r, ms: Date.now() - t0 });
  console.log(`${ok ? 'passou' : 'FALTOU'}  ${((Date.now() - t0) / 1000).toFixed(1).padStart(5)} s  ${nome}${ok ? '' : `\n         ${r}`}`);
  return ok;
}

async function foto(page, nome) {
  if (FOTOS === null) return;
  mkdirSync(FOTOS, { recursive: true });
  fotoN++;
  await page.screenshot({ path: join(FOTOS, `${String(fotoN).padStart(2, '0')}-${nome}.png`) });
}

// ---------------------------------------------------------------------------
// A pessoa diante do editor
// ---------------------------------------------------------------------------

async function abrirNavegador(browser, quem) {
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
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoles.push(`${quem} [${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => consoles.push(`${quem} [pageerror] ${e.message}`));
  page.on('dialog', (d) => { consoles.push(`${quem} [janela do navegador] ${d.message()}`); d.accept(); });
  await page.goto(URL_EDITOR);
  await page.waitForSelector('canvas.viewport-canvas');
  await page.waitForTimeout(600);
  return { ctx, page };
}

/** As ajudantes que só LEEM: onde está cada coisa na tela. */
const OLHOS = String.raw`
window.__o = (() => {
  const o = {};
  o.vp = null;
  o.carregar = async () => { o.vp = (await import('/src/viewport/viewport.ts')).viewportPanel; return true; };
  o.doc = () => o.vp.doc;
  o.tela = (x, y) => {
    const c = o.vp.canvas.getBoundingClientRect();
    const p = o.vp.camera.worldToScreen(x, y);
    return { x: c.left + p.x, y: c.top + p.y };
  };
  o.mundoDoOsso = (nome, lx = 0, ly = 0) => {
    const b = o.doc().skeleton?.findBone(nome);
    if (!b) return null;
    return { x: b.a * lx + b.b * ly + b.worldX, y: b.c * lx + b.d * ly + b.worldY };
  };
  return o;
})();
true`;

async function olhos(page) {
  await page.evaluate(OLHOS);
  await page.evaluate('__o.carregar()');
}

/** Clica no menu de cima, e depois no item (e no subitem), pelo NOME. */
async function menu(page, ...caminho) {
  const [topo, ...itens] = caminho;
  await page.locator('.menu-button', { hasText: new RegExp(`^${topo}$`) }).click();
  await page.waitForTimeout(150);
  for (const item of itens) {
    const alvo = page.locator('.menu-list:not([hidden]) .menu-item:visible', {
      has: page.locator('.menu-name', { hasText: new RegExp(`^${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }),
    }).first();
    await alvo.hover();
    await page.waitForTimeout(120);
    if (item === itens[itens.length - 1]) await alvo.click();
  }
  await page.waitForTimeout(250);
}

async function rodape(page) {
  return (await page.locator('.status-state').first().textContent().catch(() => '')) ?? '';
}


/** Um ponto do mundo, na tela. */
async function ponto(page, x, y) { return page.evaluate(([x, y]) => __o.tela(x, y), [x, y]); }

/** Foco na cena sem clicar no desenho: as teclas de ferramenta valem ali. */
async function focoNaCena(page) {
  await page.locator('.viewport').first().focus();
  await page.waitForTimeout(50);
}

async function arrastar(page, de, ate, passos = 10) {
  await page.mouse.move(de.x, de.y);
  await page.mouse.down();
  for (let i = 1; i <= passos; i++) {
    await page.mouse.move(de.x + ((ate.x - de.x) * i) / passos, de.y + ((ate.y - de.y) * i) / passos);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  await page.waitForTimeout(200);
}

/** A linha da Árvore com este nome. */
function linhaArvore(page, nome) {
  return page.locator('.arvore-item', { has: page.locator('.arvore-nome', { hasText: new RegExp(`^${nome}$`) }) }).first();
}

/** Renomeia pela Árvore: dois cliques no nome, escreve, Enter. */
async function renomear(page, de, para) {
  await linhaArvore(page, de).dblclick();
  await page.waitForTimeout(150);
  await page.keyboard.press('Control+a');
  await page.keyboard.type(para);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
}

/** Leva a agulha a `t` segundos, escrevendo no relógio do tocador. */
async function irPara(page, t) {
  const campo = page.locator('.dope-toc-tempo input').first();
  await campo.click();
  await page.keyboard.press('Control+a');
  await page.keyboard.type(String(t).replace('.', ','));
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
}


/** Escreve no campo Ângulo da ficha rápida (Propriedades), e Enter. */
async function angulo(page, graus) {
  const campo = page.locator('input#ficha-rotation').first();
  await campo.click();
  await campo.fill(String(graus));
  await campo.press('Enter');
  await page.waitForTimeout(150);
}

/** Nova animação (o + da aba Animações), e o nome no campo que abre. */
async function novaAnimacao(page, nome) {
  await page.locator('button[aria-label="Nova animação"]:visible').first().click();
  await page.waitForTimeout(250);
  await page.keyboard.press('Control+a');
  await page.keyboard.type(nome);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
}

/** As chaves de giro de um osso numa animação: [[tempo, valor]]. */
async function chavesDeGiro(page, anim, osso) {
  return page.evaluate(([anim, osso]) => {
    const a = (__o.doc().file.animations ?? []).find((x) => x.name === anim);
    const l = (a?.timelines ?? []).find((t) => t.type === 'bone' && t.target === osso && t.property === 'rotation');
    return l ? l.keys.map((k) => [k.time, k.value]) : null;
  }, [anim, osso]);
}


/** Abre a aba (a tira de abas do lado), pelo nome. */
async function aba(page, nome) {
  const t = page.locator('[role="tab"]', { hasText: new RegExp(`^\\s*${nome}\\s*(×)?\\s*$`) }).first();
  await t.click();
  await page.waitForTimeout(250);
}

const docJs = (fn) => `(() => { const d = __o.doc(); return (${fn})(d); })()`;

// ---------------------------------------------------------------------------
// O roteiro
// ---------------------------------------------------------------------------

async function pessoaA(browser) {
  rmSync(join(TRABALHO, 'pessoa-a'), { recursive: true, force: true });
  mkdirSync(PASTA_A, { recursive: true });
  for (const [nome, bytes] of Object.entries(imagensDaEspada([200, 205, 215]))) writeFileSync(join(PASTA_A, nome), bytes);

  const { ctx, page } = await abrirNavegador(browser, 'A');
  await olhos(page);
  await foto(page, 'a-abre');

  await passo('A: Arquivo → Novo projeto…, na pasta só com a espada', async () => {
    await page.evaluate((p) => { window.__proximaPasta = p; }, PASTA_A);
    await menu(page, 'Arquivo', 'Novo projeto…');
    await page.waitForTimeout(800);
    await foto(page, 'a-novo-projeto');
    const texto = await page.evaluate(() => document.body.innerText);
    const faltas = [];
    for (const n of ['cabo', 'lamina', 'brilho']) if (!texto.includes(n)) faltas.push(`sem ${n} na aba Imagens`);
    return faltas.length === 0 || `${faltas.join('; ')} · rodapé: ${await rodape(page)}`;
  });


  await passo('A: arrasta as três imagens para a cena', async () => {
    const lugares = [['lamina', 95, 0], ['brilho', 90, 0], ['cabo', 20, 0]];
    for (const [nome, x, y] of lugares) {
      const alvo = await ponto(page, x, y);
      await page.locator(`.imagens-linha[data-imagem="${nome}"]`).dragTo(page.locator('canvas.viewport-canvas'), { targetPosition: await page.evaluate(([x, y]) => { const c = __o.vp.canvas.getBoundingClientRect(); const p = __o.vp.camera.worldToScreen(x, y); return { x: p.x, y: p.y }; }, [x, y]) });
      await page.waitForTimeout(250);
    }
    const slots = await page.evaluate(docJs((d) => (d.file.slots ?? []).map((s) => s.name)));
    await foto(page, 'a-imagens-na-cena');
    return slots.length === 3 || `na cena: ${slots.join(', ')}`;
  });

  await passo('A: cria dois ossos (B e arrastar) e prende as imagens (P e clique)', async () => {
    const faltas = [];
    const nomes = () => page.evaluate(docJs((d) => d.file.bones.map((b) => b.name)));
    // Clica no vazio para não pegar nenhum desenho; T, Esc: nada escolhido.
    await page.mouse.click(...Object.values(await ponto(page, -300, 200)));
    await focoNaCena(page);
    await page.keyboard.press('t');
    await page.keyboard.press('Escape');
    await page.keyboard.press('b');
    let antes = await nomes();
    await arrastar(page, await ponto(page, 0, 0), await ponto(page, 40, 0));
    const cabo = (await nomes()).find((n) => !antes.includes(n));
    if (!cabo) return 'o osso do cabo não nasceu';
    await linhaArvore(page, cabo).click();
    await focoNaCena(page);
    await page.keyboard.press('b');
    antes = await nomes();
    await arrastar(page, await ponto(page, 44, 0), await ponto(page, 150, 0));
    const lamina = (await nomes()).find((n) => !antes.includes(n));
    if (!lamina) return 'o osso da lâmina não nasceu';
    const pai = await page.evaluate(docJs((d) => d.file.bones.map((b) => [b.name, b.parent ?? null])));
    if (!pai.some(([n, p]) => n === lamina && p === cabo)) faltas.push(`a lâmina nasceu filha de ${JSON.stringify(pai)}`);
    await focoNaCena(page);
    await page.keyboard.press('t');
    await renomear(page, cabo, 'cabo_osso');
    await renomear(page, lamina, 'lamina_osso');
    // Prender: escolhe o osso na Árvore, segura P e clica na imagem.
    for (const [osso, pecas] of [['cabo_osso', [['cabo', 10, 0]]], ['lamina_osso', [['lamina', 70, 5], ['brilho', 70, 0.5]]]]) {
      await linhaArvore(page, osso).click();
      await focoNaCena(page);
      await page.keyboard.down('p');
      for (const [, x, y] of pecas) { const q = await ponto(page, x, y); await page.mouse.click(q.x, q.y); await page.waitForTimeout(120); }
      await page.keyboard.up('p');
    }
    const presos = await page.evaluate(docJs((d) => Object.fromEntries(d.file.slots.map((s) => [s.name, s.bone]))));
    if (presos.cabo !== 'cabo_osso') faltas.push(`cabo em ${presos.cabo}`);
    if (presos.lamina !== 'lamina_osso') faltas.push(`lamina em ${presos.lamina}`);
    if (presos.brilho !== 'lamina_osso') faltas.push(`brilho em ${presos.brilho}`);
    await foto(page, 'a-ossos');
    return faltas.length === 0 || `${faltas.join('; ')} · ossos ${JSON.stringify(await nomes())} · rodapé: ${await rodape(page)}`;
  });

  await passo('A: anima idle (a lâmina balança) e attack (o golpe)', async () => {
    const faltas = [];
    const roteiro = {
      idle: [['lamina_osso', [[0.5, 4], [1, 0]]]],
      attack: [['cabo_osso', [[0.15, 50], [0.35, -30], [0.6, 0]]], ['lamina_osso', [[0.15, -6], [0.35, 8], [0.6, 0]]]],
    };
    for (const [anim, ossos] of Object.entries(roteiro)) {
      await novaAnimacao(page, anim);
      const aberta = await page.evaluate(docJs((d) => d.animation));
      if (aberta !== anim) { faltas.push(`a animação aberta é ${aberta}, não ${anim}`); continue; }
      for (const [osso, chaves] of ossos) {
        await linhaArvore(page, osso).click();
        for (const [t, v] of chaves) { await irPara(page, t); await angulo(page, v); }
        const k = await chavesDeGiro(page, anim, osso);
        const esperadas = [[0, 0], ...chaves];
        const ok = k !== null && esperadas.every(([t, v]) => k.some(([kt, kv]) => Math.abs(kt - t) < 1e-3 && Math.abs(kv - v) < 1e-3));
        if (!ok) faltas.push(`${anim}/${osso}: chaves ${JSON.stringify(k)}, esperava ${JSON.stringify(esperadas)}`);
      }
      await irPara(page, 0.15);
      await foto(page, `a-anima-${anim}`);
    }
    return faltas.length === 0 || `${faltas.join('; ')} · rodapé: ${await rodape(page)}`;
  });

  await passo('A: o attack toca uma vez (tira o "repete"), e Ctrl+S salva espada.bone', async () => {
    const faltas = [];
    // O attack está aberto: o botão Repetir do tocador desliga o laço dele.
    await page.locator('.dope-tocador button[aria-label^="Repetir"]').first().click();
    await page.waitForTimeout(200);
    const laco = await page.evaluate(docJs((d) => d.file.animations.find((a) => a.name === 'attack')?.loop));
    if (laco !== false) faltas.push(`o attack continua em laço (${laco})`);
    await focoNaCena(page);
    await page.keyboard.press('Control+s');
    for (let i = 0; i < 40 && !existsSync(join(PASTA_A, 'espada.bone')); i++) await page.waitForTimeout(200);
    await page.waitForTimeout(500);
    await foto(page, 'a-salvou');
    const arquivos = readdirSync(PASTA_A).sort();
    if (!arquivos.includes('espada.bone')) return `sem espada.bone na pasta: ${arquivos.join(', ')} · rodapé: ${await rodape(page)}`;
    const bone = JSON.parse(readFileSync(join(PASTA_A, 'espada.bone'), 'utf8'));
    const anims = (bone.animations ?? []).map((a) => a.name);
    if (!anims.includes('idle') || !anims.includes('attack')) faltas.push(`animações salvas: ${anims.join(', ')}`);
    for (const a of bone.assets?.atlases ?? []) if (!arquivos.includes(a)) faltas.push(`o atlas ${a} não está na pasta`);
    console.log(`         pasta A: ${arquivos.join(', ')}`);
    return faltas.length === 0 || faltas.join('; ');
  });

  await ctx.close();
}


/**
 * A pasta de trabalho da pessoa B: o herói de exemplo, SEM a espada. Sai o
 * slot `weapon` (a espada aninhada), o `sword_blade` (a lâmina desenhada) e o
 * que os cita; sai também o `attack` dele — o golpe é a pessoa B quem anima.
 * O resto do herói é o exemplo, byte a byte.
 */
function prepararHeroi() {
  rmSync(join(TRABALHO, 'pessoa-b'), { recursive: true, force: true });
  mkdirSync(PASTA_B, { recursive: true });
  const ex = join(RAIZ, 'formato', 'exemplos');
  const h = JSON.parse(readFileSync(join(ex, 'heroi.bone'), 'utf8'));
  const fora = new Set(['weapon', 'sword_blade']);
  h.slots = h.slots.filter((s) => !fora.has(s.name));
  for (const skin of h.skins) for (const n of fora) delete skin.attachments[n];
  h.animations = h.animations.filter((a) => a.name !== 'attack');
  for (const a of h.animations) {
    a.timelines = a.timelines.filter((t) => !fora.has(t.target));
    for (const t of a.timelines) {
      if (t.type !== 'drawOrder') continue;
      for (const k of t.keys) if (Array.isArray(k.offsets)) k.offsets = k.offsets.filter((o) => !fora.has(o.slot));
    }
  }
  writeFileSync(join(PASTA_B, 'heroi.bone'), JSON.stringify(h, null, 2));
  copyFileSync(join(ex, 'heroi.atlas.json'), join(PASTA_B, 'heroi.atlas.json'));
  copyFileSync(join(ex, 'heroi.png'), join(PASTA_B, 'heroi.png'));
}

async function pessoaB(browser) {
  prepararHeroi();
  const { ctx, page } = await abrirNavegador(browser, 'B');
  await olhos(page);

  await passo('B: Arquivo → Abrir pasta do projeto…, o herói sem espada', async () => {
    await page.evaluate((p) => { window.__proximaPasta = p; window.__proximosArquivos = [p + '/heroi.bone']; }, PASTA_B);
    await menu(page, 'Arquivo', 'Abrir pasta do projeto…');
    for (let i = 0; i < 40; i++) { if (await page.evaluate(docJs((d) => (d.file.slots ?? []).length > 0))) break; await page.waitForTimeout(250); }
    await page.waitForTimeout(500);
    await foto(page, 'b-abre-heroi');
    const e = await page.evaluate(docJs((d) => ({ nome: d.file.skeleton?.name, slots: (d.file.slots ?? []).map((s) => s.name), escolhas: window.__escolhas })));
    if (!e.slots.includes('hand')) return `o herói não abriu: ${JSON.stringify(e)} · rodapé: ${await rodape(page)}`;
    return !e.slots.includes('weapon') || 'o herói veio com a espada';
  });

  await passo('B: Tomadas → Trazer entidade de fora…, só o espada.bone da pessoa A', async () => {
    // A pessoa escolhe SÓ o espada.bone, como faria. O programa pede a pasta
    // dela (o atlas mora ao lado), e a pessoa aponta a pasta da pessoa A.
    await page.evaluate((p) => { window.__proximosArquivos = [p + '/espada.bone']; window.__proximaPasta = p; }, PASTA_A);
    await menu(page, 'Tomadas', 'Trazer entidade de fora…');
    const pergunta = page.locator('.dialog-box', { hasText: 'falta espada.atlas.json' });
    await pergunta.waitFor({ timeout: 4000 }).catch(() => {});
    if (await pergunta.count() === 0) return `o programa não perguntou pela pasta · rodapé: ${await rodape(page)}`;
    await foto(page, 'b-pede-a-pasta');
    await pergunta.locator('button', { hasText: 'Escolher a pasta de espada.bone' }).click();
    await page.waitForTimeout(1200);
    const janelas = await page.evaluate(() => [...document.querySelectorAll('[role=dialog]')].filter((e) => e.getClientRects().length).map((e) => e.innerText.slice(0, 300)));
    if (janelas.length > 0) { await page.keyboard.press('Escape'); return `abriu com avisos: ${janelas.join(' | ')}`; }
    await aba(page, 'Tomadas');
    await foto(page, 'b-prateleira');
    const n = await page.locator('.imagens-linha[data-entidade="espada.bone"]').count();
    return n > 0 || `a espada não está na prateleira · rodapé: ${await rodape(page)}`;
  });

  await passo('B: arrasta a espada da prateleira até a mão do herói', async () => {
    // Na base: vale em todas as animações (manual, capítulo 5).
    await page.locator('text=Base — montar').first().click();
    await page.waitForTimeout(300);
    const mao = await page.evaluate(() => __o.mundoDoOsso('forearm', 35, 0));
    const destino = await page.evaluate(([x, y]) => __o.vp.camera.worldToScreen(x, y), [mao.x, mao.y]);
    await page.locator('.imagens-linha[data-entidade="espada.bone"]').first().dragTo(page.locator('canvas.viewport-canvas'), { targetPosition: destino });
    await page.waitForTimeout(500);
    await foto(page, 'b-espada-na-mao');
    const e = await page.evaluate(docJs((d) => {
      const out = [];
      for (const sk of d.file.skins ?? []) for (const [slot, porNome] of Object.entries(sk.attachments ?? {})) for (const [nome, a] of Object.entries(porNome ?? {})) if (a && a.type === 'skeleton') out.push({ skin: sk.name, slot, nome, a, osso: d.file.slots.find((s) => s.name === slot)?.bone });
      return { out, anim: d.animation };
    }));
    console.log(`         ${JSON.stringify(e)} · rodapé: ${await rodape(page)}`);
    return e.out.length === 1 || 'a espada não entrou como anexo skeleton';
  });

  await passo('B: acerta a espada na mão (X, Y, Ângulo, Escala) pela ficha', async () => {
    const valores = { x: 33, y: 0, rotation: 90, scaleX: 0.8, scaleY: 0.8 };
    for (const [k, v] of Object.entries(valores)) {
      const campo = page.locator(`input#ficha-${k}`).first();
      await campo.click();
      await campo.fill(String(v));
      await campo.press('Enter');
      await page.waitForTimeout(120);
    }
    const a = await page.evaluate(docJs((d) => d.file.skins[0].attachments.espada?.espada ?? null));
    await foto(page, 'b-espada-acertada');
    const errados = Object.entries(valores).filter(([k, v]) => Math.abs((a?.[k] ?? NaN) - v) > 1e-6);
    return errados.length === 0 || `o anexo ficou ${JSON.stringify(a)}`;
  });

  await passo('B: no cartão da espada, anima ▾ → "mexe junto com quem segura" (inheritAnimation)', async () => {
    const cartao = page.locator('.entidades-cartao', { hasText: 'PROJETO' }).filter({ hasText: 'espada' }).first();
    await cartao.locator('button.entidades-cartao-anima').first().click();
    await page.waitForTimeout(200);
    await foto(page, 'b-anima-a-de-quem-recebe');
    await page.locator('.menu-flutuante-item', { hasText: 'mexe junto com quem segura' }).first().click();
    await page.waitForTimeout(300);
    const a = await page.evaluate(docJs((d) => d.file.skins[0].attachments.espada?.espada ?? null));
    return a?.inheritAnimation === true || `o anexo ficou ${JSON.stringify(a)} · rodapé: ${await rodape(page)}`;
  });

  await passo('B: anima o golpe — nova animação attack, a mão (alvo do ik) e o tronco', async () => {
    const faltas = [];
    await novaAnimacao(page, 'attack');
    if (await page.evaluate(docJs((d) => d.animation)) !== 'attack') return 'a animação attack não abriu';
    const campo = async (k, v) => {
      const c = page.locator(`input#ficha-${k}`).first();
      await c.click(); await c.fill(String(v)); await c.press('Enter'); await page.waitForTimeout(120);
    };
    const golpe = [[0.15, -10, 175, 105], [0.35, 80, 105, 80], [0.6, 30, 60, 90]];
    for (const [t, x, y, giro] of golpe) {
      await irPara(page, t);
      await linhaArvore(page, 'hand_target').click();
      await campo('x', x); await campo('y', y);
      await linhaArvore(page, 'torso').click();
      await campo('rotation', giro);
    }
    const linhas = await page.evaluate(docJs((d) => (d.file.animations.find((a) => a.name === 'attack')?.timelines ?? []).map((t) => `${t.target}.${t.property}:${t.keys.length}`)));
    for (const l of ['hand_target.x', 'hand_target.y', 'torso.rotation']) if (!linhas.some((x) => x.startsWith(l + ':4'))) faltas.push(`sem as 4 chaves de ${l} (${linhas.join(' ')})`);
    // Tira o laço: o golpe toca uma vez.
    await page.locator('.dope-tocador button[aria-label^="Repetir"]').first().click();
    await irPara(page, 0.35);
    await foto(page, 'b-golpe');
    // A espada toca o attack DELA: o rótulo da faixa diz "pelo pai".
    const faixa = await page.locator('.dope-faixa, [class*="faixa"]').filter({ hasText: 'espada' }).first().textContent().catch(() => null);
    console.log(`         faixa da espada: ${faixa}`);
    return faltas.length === 0 || faltas.join('; ');
  });

  await passo('B: Ctrl+S salva o projeto do herói', async () => {
    await focoNaCena(page);
    await page.keyboard.press('Control+s');
    await page.waitForTimeout(2500);
    const arquivos = readdirSync(PASTA_B).sort();
    console.log(`         pasta B: ${arquivos.join(', ')} · ${await rodape(page)}`);
    const falta = ['heroi.bone', 'espada.bone', 'espada.atlas.json', 'espada-atlas.png', 'manifest.json'].filter((n) => !arquivos.includes(n));
    await foto(page, 'b-salvou');
    return falta.length === 0 || `faltou na pasta: ${falta.join(', ')}`;
  });

  await ctx.close();
}


// ---------------------------------------------------------------------------
// A prova: o validador e o runtime, sobre o que a pessoa B salvou
// ---------------------------------------------------------------------------

/** O estado da espada num instante: onde está o pino, e o que ela toca. */
async function espadaNoInstante(rt, rp, dados, anim, t) {
  const sk = new rt.Skeleton(dados);
  sk.setToSetupPose();
  sk.updateWorldTransform(0);
  rp.posarAte(rt, sk, dados.animations.find((a) => a.name === anim), t);
  const slot = sk.findSlot('espada');
  const n = slot?.nestedSkeleton() ?? null;
  const att = slot?.attachment;
  const fa = sk.findBone('forearm');
  const pin = { x: fa.a * att.x + fa.b * att.y + fa.worldX, y: fa.c * att.x + fa.d * att.y + fa.worldY };
  const raiz = n?.skeleton.findBone('root') ?? null;
  return {
    toca: n?.animationName ?? null,
    pino: pin,
    raiz: raiz === null ? null : { x: raiz.worldX, y: raiz.worldY },
    cabo: n?.skeleton.findBone('cabo_osso')?.rotation ?? null,
    avisos: sk.nestedWarnings,
  };
}

async function provar(rotulo, esperaCor) {
  const bone = join(PASTA_B, 'heroi.bone');
  await passo(`${rotulo}: npm run validar aceita o heroi.bone salvo`, async () => {
    const r = spawnSync(process.execPath, [join(RAIZ, 'ferramentas/validador/validar.mjs'), bone], { encoding: 'utf8' });
    return r.status === 0 || `${r.stdout}\n${r.stderr}`;
  });
  await passo(`${rotulo}: o runtime põe a espada na mão no walk e no attack, e ela toca o attack dela`, async () => {
    const rp = await import('../render-png.mjs');
    const rt = await rp.carregarRuntime();
    const { dados, imagens } = rp.abrirEsqueleto(rt, bone);
    const faltas = [];
    const pinos = [];
    for (const [anim, t, toca] of [['walk', 0, 'idle'], ['walk', 0.25, 'idle'], ['walk', 0.5, 'idle'], ['attack', 0.15, 'attack'], ['attack', 0.35, 'attack']]) {
      const e = await espadaNoInstante(rt, rp, dados, anim, t);
      if (e.raiz === null) { faltas.push(`${anim} ${t}: a espada não foi montada (${e.avisos.join('; ')})`); continue; }
      const d = Math.hypot(e.raiz.x - e.pino.x, e.raiz.y - e.pino.y);
      if (d > 1e-3) faltas.push(`${anim} ${t}: a raiz da espada está a ${d.toFixed(3)} do pino na mão`);
      if (e.toca !== toca) faltas.push(`${anim} ${t}: a espada toca ${e.toca}, não ${toca}`);
      pinos.push(e.pino);
      if (anim === 'attack' && t === 0.15 && (e.cabo === null || Math.abs(e.cabo - 50) > 1)) faltas.push(`attack 0,15: o cabo da espada está em ${e.cabo}°, não nos 50° da pessoa A`);
    }
    // A mão anda: se o pino ficasse parado, "seguir a mão" não provaria nada.
    const andou = Math.max(...pinos.map((p) => Math.hypot(p.x - pinos[0].x, p.y - pinos[0].y)));
    if (andou < 5) faltas.push(`a mão quase não andou (${andou.toFixed(2)}): a prova não prova`);
    // As fotos, pequenas, e a cor da lâmina na página do atlas da espada.
    const pagina = [...imagens.entries()].find(([nome]) => nome.startsWith('espada'))?.[1] ?? null;
    if (pagina === null) faltas.push('a página do atlas da espada não foi lida');
    else if (esperaCor !== null) {
      const { rgba, largura } = pagina;
      let soma = [0, 0, 0]; let n = 0;
      for (let i = 0; i < rgba.length; i += 4) if (rgba[i + 3] === 255 && rgba[i + 2] > 60) { soma[0] += rgba[i]; soma[1] += rgba[i + 1]; soma[2] += rgba[i + 2]; n++; }
      const media = soma.map((v) => v / Math.max(1, n));
      const perto = media.every((v, i) => Math.abs(v - esperaCor[i]) < 45);
      if (!perto) faltas.push(`a lâmina na página tem cor ${media.map((v) => v.toFixed(0)).join(',')}, não ${esperaCor.join(',')} (${largura} px)`);
    }
    if (FOTOS !== null) {
      for (const [anim, t] of [['walk', 0.25], ['attack', 0.15], ['attack', 0.35]]) {
        const sk = new rt.Skeleton(dados);
        sk.setToSetupPose(); sk.updateWorldTransform(0);
        const lim = sk.getBounds();
        rp.posarAte(rt, sk, dados.animations.find((a) => a.name === anim), t);
        const cam = rp.cameraDe(rp.juntarLimites(lim, sk.getBounds()), { largura: 240, margem: 0.12 });
        const img = rp.desenharPose(rt, sk, imagens, cam, { ossos: false });
        fotoN++;
        writeFileSync(join(FOTOS, `${String(fotoN).padStart(2, '0')}-${rotulo.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-runtime-${anim}-${String(t).replace('.', '')}.png`), rp.gravarPng(img.largura, img.altura, img.rgba));
      }
    }
    return faltas.length === 0 || faltas.join('; ');
  });
}


/**
 * A pessoa A muda a espada: redesenha a lâmina (outra cor) no programa de
 * desenho dela — aqui, o PNG novo gravado no disco —, abre o projeto dela no
 * Recorte, Recarregar na aba Imagens, e Ctrl+S salva por cima.
 */
async function pessoaAMuda(browser, cor) {
  const { ctx, page } = await abrirNavegador(browser, 'A2');
  await olhos(page);
  await passo('A muda: abre a pasta da espada, redesenha a lâmina, Recarregar, Ctrl+S por cima', async () => {
    await page.evaluate((p) => { window.__proximaPasta = p; }, PASTA_A);
    await menu(page, 'Arquivo', 'Abrir pasta do projeto…');
    for (let i = 0; i < 40; i++) { if (await page.evaluate(docJs((d) => (d.file.slots ?? []).length > 0))) break; await page.waitForTimeout(250); }
    if (await page.evaluate(docJs((d) => (d.file.slots ?? []).length)) !== 3) return `a espada não reabriu · rodapé: ${await rodape(page)}`;
    const antes = statSync(join(PASTA_A, 'espada.bone')).mtimeMs;
    writeFileSync(join(PASTA_A, 'lamina.png'), imagensDaEspada(cor)['lamina.png']);
    await aba(page, 'Imagens');
    await page.locator(`button[title^="Recarregar a pasta"]`).first().click();
    await page.waitForTimeout(800);
    await focoNaCena(page);
    await page.keyboard.press('Control+s');
    for (let i = 0; i < 40 && statSync(join(PASTA_A, 'espada.bone')).mtimeMs === antes; i++) await page.waitForTimeout(200);
    await page.waitForTimeout(600);
    await foto(page, 'a-mudou-a-cor');
    if (statSync(join(PASTA_A, 'espada.bone')).mtimeMs === antes) return `não salvou por cima · rodapé: ${await rodape(page)}`;
    return true;
  });
  await ctx.close();
}

/**
 * A entrega: a pessoa A manda os três arquivos da espada para a pessoa B, e
 * B os põe na pasta do projeto dela, por cima dos de antes — o que se faz no
 * explorador de arquivos, por e-mail ou por uma pasta compartilhada. Fora do
 * Recorte, por isso fora do navegador.
 */
function entregar() {
  for (const n of ['espada.bone', 'espada.atlas.json', 'espada-atlas.png']) copyFileSync(join(PASTA_A, n), join(PASTA_B, n));
}

/** A pessoa B reabre o projeto dela, num navegador novo: a espada nova está lá. */
async function pessoaBReabre(browser) {
  const { ctx, page } = await abrirNavegador(browser, 'B2');
  await olhos(page);
  await passo('B reabre: Abrir pasta do projeto…, a espada nova na mão, nada refeito', async () => {
    await page.evaluate((p) => { window.__proximaPasta = p; }, PASTA_B);
    await menu(page, 'Arquivo', 'Abrir pasta do projeto…');
    for (let i = 0; i < 40; i++) { if (await page.evaluate(docJs((d) => (d.file.slots ?? []).length > 0))) break; await page.waitForTimeout(250); }
    await page.waitForTimeout(800);
    await aba(page, 'Tomadas');
    await foto(page, 'b-reabriu-espada-nova');
    const e = await page.evaluate(docJs((d) => {
      const slot = d.skeleton?.findSlot('espada');
      const n = slot?.nestedSkeleton() ?? null;
      const att = d.file.skins[0].attachments.espada?.espada ?? null;
      const regiao = n?.skeleton.findSlot('lamina')?.attachment?.region ?? null;
      const imagem = regiao === null ? null : d.imageFor(regiao.page);
      return { montada: n !== null, att, temImagem: imagem !== null, avisos: d.warnings };
    }));
    const faltas = [];
    if (!e.montada) faltas.push('a espada não foi montada na mão');
    if (!e.temImagem) faltas.push('a lâmina não tem imagem na cena');
    if (e.att?.inheritAnimation !== true || e.att?.rotation !== 90) faltas.push(`o encaixe mudou: ${JSON.stringify(e.att)}`);
    if (e.avisos.length > 0) faltas.push(`avisos: ${e.avisos.join(' | ')}`);
    return faltas.length === 0 || `${faltas.join('; ')} · rodapé: ${await rodape(page)}`;
  });
  await ctx.close();
}

/** Sobe o editor (o Vite quieto, sem vigia), a não ser que `URL_EDITOR` já aponte um. */
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

async function main() {
  const vite = await subirEditor();
  const browser = await chromium.launch();
  try {
    await pessoaA(browser);
    await pessoaB(browser);
    await provar('Prova', [200, 205, 215]);
    const NOVA = [235, 150, 90];
    await pessoaAMuda(browser, NOVA);
    entregar();
    await pessoaBReabre(browser);
    await provar('Depois', NOVA);
  } finally {
    await browser.close();
    vite?.kill();
  }
  if (consoles.length > 0) { console.log('\nConsole:'); for (const c of consoles.slice(0, 40)) console.log('  ' + c); }
  const falhou = resultados.filter((r) => !r.ok).length;
  console.log(`\n${resultados.length - falhou} de ${resultados.length} passos. Trabalho em ${TRABALHO}`);
  process.exitCode = falhou === 0 ? 0 : 1;
}

await main();
