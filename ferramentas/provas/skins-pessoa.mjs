// SPDX-License-Identifier: Apache-2.0
// As skins como uma pessoa nova — noite de 04/11/2026 (ramo obra/skins).
//
// O Humberto, 04/11: "eu pedia algo, o Claude dizia que programava, mas o que
// eu pedia não aparecia na tela". Este script é a prova de PESSOA: os cinco
// objetivos de skin, feitos SÓ clicando no que se vê — texto de botão, item de
// menu, nome acessível (o que o leitor de tela lê). Nenhum `page.evaluate`
// mexe no documento; o script só LÊ a tela (o rodapé, o rótulo de uma casa).
//
//   a. uma roupa nova para o herói, "ferro", trocando 3 peças
//   b. ver as roupas lado a lado, provar com o mouse, e alternar
//   c. combinar armadura + capa
//   d. mandar a roupa para outro boneco (Levar… e Trazer skin de fora…)
//   e. uma skin de fora que troca a cabeça por um capacete, com a imagem junto
//
// Cada passo sai como "passou" ou "TRAVOU: onde". Código 1 quando algum trava.
//
// USO, da raiz do projeto:
//
//   node ferramentas/provas/skins-pessoa.mjs
//   node ferramentas/provas/skins-pessoa.mjs --fotos PASTA
//
// Sobe o próprio servidor do editor (porta 5207) e um Chromium sem janela (o
// Playwright já instalado). Os seletores de arquivo do navegador são tirados
// da página (como num navegador sem eles): o Abrir e o Exportar caem no
// `<input type=file>` e no download, que o Playwright sabe responder.

import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..');
const PORTA = 5207;
const URL_EDITOR = `http://localhost:${PORTA}/`;
const FIXTURAS = join(AQUI, 'skins-pessoa');
const FOTOS = (() => {
  const i = process.argv.indexOf('--fotos');
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null;
})();

const require = createRequire(import.meta.url);
let playwright;
try {
  playwright = require('playwright');
} catch {
  playwright = require('/opt/node-tools/node_modules/playwright');
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const resultados = [];

async function subirServidor() {
  const vite = spawn(process.execPath, [join(RAIZ, 'node_modules', 'vite', 'bin', 'vite.js'), 'editor', '--port', String(PORTA), '--strictPort'], {
    cwd: RAIZ, stdio: 'ignore',
  });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(URL_EDITOR);
      if (r.ok) return vite;
    } catch { /* ainda subindo */ }
    await esperar(250);
  }
  vite.kill();
  throw new Error(`o editor não subiu na porta ${PORTA}`);
}

async function novaPagina(browser) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    delete window.showOpenFilePicker;
    delete window.showSaveFilePicker;
    delete window.showDirectoryPicker;
  });
  page.on('dialog', (d) => d.accept());
  await page.goto(URL_EDITOR);
  await page.getByRole('button', { name: /Abrir o herói/ }).click();
  await page.waitForTimeout(1200);
  return page;
}

const rodape = async (page) => (await page.locator('.rodape, footer, .status').first().innerText().catch(() => '')).split('\n')[0];

async function foto(page, nome) {
  if (FOTOS === null) return;
  mkdirSync(FOTOS, { recursive: true });
  await page.screenshot({ path: join(FOTOS, nome) });
}

/** Um passo: roda, e anota "passou" ou onde travou. */
async function passo(objetivo, nome, fazer) {
  try {
    const nota = await fazer();
    resultados.push({ objetivo, nome, ok: true, nota: nota ?? '' });
  } catch (erro) {
    resultados.push({ objetivo, nome, ok: false, nota: String(erro?.message ?? erro).split('\n')[0].slice(0, 160) });
  }
}

const T = { timeout: 5000 };

async function abrirGuardaRoupa(page) {
  await page.getByText('Skins', { exact: true }).first().click(T);
  await page.getByText('Guarda-roupa: peça × skin…').first().click(T);
  await page.getByRole('dialog', { name: 'Guarda-roupa' }).waitFor(T);
}

/** Lê o que uma casa da grade diz, pelo nome acessível. */
async function casa(page, peca, pele) {
  const b = page.getByRole('button', { name: new RegExp(`^${peca} em ${pele}: `) });
  const nome = await b.getAttribute('aria-label', T);
  return nome.replace(/^.*: /, '');
}

async function trocar(page, peca, pele, imagem) {
  await page.getByRole('button', { name: new RegExp(`^${peca} em ${pele}: `) }).click(T);
  await page.getByText(`Trocar ${peca} na skin "${pele}"`).waitFor(T);
  await page.locator('.guarda-roupa-escolha').getByRole('button', { name: imagem, exact: true }).click(T);
  await page.waitForTimeout(250);
  const agora = await casa(page, peca, pele);
  if (agora !== imagem) throw new Error(`a casa ${peca} × ${pele} diz "${agora}", e não "${imagem}"`);
  return await rodape(page);
}

const vite = await subirServidor();
const browser = await playwright.chromium.launch();
const pasta = mkdtempSync(join(tmpdir(), 'skins-pessoa-'));
let codigo = 0;
try {
  const page = await novaPagina(browser);

  // a. Roupa nova, 3 peças
  await passo('a', 'abrir o Guarda-roupa pelo menu Skins', () => abrirGuardaRoupa(page));
  await passo('a', '+ Nova skin, com o nome "ferro"', async () => {
    await page.getByRole('button', { name: '+ Nova skin' }).click(T);
    await page.keyboard.type('ferro');
    await page.getByRole('button', { name: 'Criar a skin' }).click(T);
    await page.getByRole('button', { name: /^body em ferro: / }).waitFor(T);
    return await rodape(page);
  });
  await passo('a', 'trocar body', () => trocar(page, 'body', 'ferro', 'armadura/body'));
  await passo('a', 'trocar hand', () => trocar(page, 'hand', 'ferro', 'hand_03'));
  await passo('a', 'trocar hair', () => trocar(page, 'hair', 'ferro', 'cape_upper'));
  await foto(page, 'depois-1-guarda-roupa.png');

  // b. Lado a lado, provar, alternar
  await passo('b', 'cada coluna mostra o boneco inteiro', async () => {
    const n = await page.getByRole('img', { name: /^O boneco com/ }).count();
    if (n < 3) throw new Error(`só ${n} bonecos à vista`);
    return `${n} bonecos lado a lado`;
  });
  await passo('b', 'mouse na coluna armadura prova no manequim', async () => {
    const dlg = page.getByRole('dialog', { name: 'Guarda-roupa' });
    await dlg.getByText('armadura', { exact: true }).hover(T);
    await dlg.getByText('Provando: armadura').waitFor(T);
    await foto(page, 'depois-2-provando.png');
    await dlg.getByText('Guarda-roupa', { exact: true }).hover(T);
    return 'Provando: armadura';
  });
  await passo('b', 'Vestir só esta: armadura, depois ferro', async () => {
    const coluna = (nome) => page.getByRole('dialog', { name: 'Guarda-roupa' }).locator('.guarda-roupa-coluna').filter({ has: page.getByText(nome, { exact: true }) });
    await coluna('armadura').getByRole('button', { name: 'Vestir só esta' }).click(T);
    await coluna('armadura').getByText('● vestida', { exact: true }).waitFor(T);
    await coluna('ferro').getByRole('button', { name: 'Vestir só esta' }).click(T);
    return await rodape(page);
  });

  // c. Combinar armadura + capa
  await passo('c', 'Vestir só a armadura, e a capa "por cima"', async () => {
    const coluna = (nome) => page.getByRole('dialog', { name: 'Guarda-roupa' }).locator('.guarda-roupa-coluna').filter({ has: page.getByText(nome, { exact: true }) });
    await coluna('armadura').getByRole('button', { name: 'Vestir só esta' }).click(T);
    await coluna('armadura_capa').getByRole('checkbox').check(T);
    await page.getByRole('dialog', { name: 'Guarda-roupa' }).getByText('Vestida: armadura_capa + armadura').waitFor(T);
    await foto(page, 'depois-3-combinadas.png');
    return 'Vestida: armadura_capa + armadura';
  });

  // d. Levar para outro boneco
  let levado = null;
  await passo('d', 'Levar… a skin ferro', async () => {
    const coluna = page.locator('.guarda-roupa-coluna').filter({ has: page.getByText('ferro', { exact: true }) });
    const baixou = page.waitForEvent('download', T);
    await coluna.getByRole('button', { name: 'Levar…' }).click(T);
    const d = await baixou;
    levado = join(pasta, d.suggestedFilename());
    await d.saveAs(levado);
    return `${d.suggestedFilename()} · ${await rodape(page)}`;
  });
  const outro = await novaPagina(browser);
  await passo('d', 'noutro boneco: Trazer skin de fora…', async () => {
    if (levado === null) throw new Error('não houve arquivo para trazer');
    await abrirGuardaRoupa(outro);
    const escolha = outro.waitForEvent('filechooser', T);
    await outro.getByRole('button', { name: 'Trazer skin de fora…' }).click(T);
    await (await escolha).setFiles([levado]);
    await outro.getByRole('button', { name: /^body em ferro: / }).waitFor(T);
    const agora = await casa(outro, 'body', 'ferro');
    if (agora !== 'armadura/body') throw new Error(`body × ferro diz "${agora}"`);
    return await rodape(outro);
  });

  // e. Capacete de fora, com a imagem junto
  await passo('e', 'Trazer skin de fora… com o .bone e a imagem', async () => {
    const escolha = outro.waitForEvent('filechooser', T);
    await outro.getByRole('button', { name: 'Trazer skin de fora…' }).click(T);
    await (await escolha).setFiles([join(FIXTURAS, 'capacete-skin.bone'), join(FIXTURAS, 'capacete.png')]);
    await outro.getByText(/A imagem "capacete" entrou junto/).first().waitFor(T);
    const agora = await casa(outro, 'head', 'capacete');
    if (agora !== 'capacete') throw new Error(`head × capacete diz "${agora}"`);
    return await rodape(outro);
  });
  await passo('e', 'nenhum aviso: a cabeça desenha', async () => {
    await outro.getByRole('dialog', { name: 'Guarda-roupa' }).getByRole('button', { name: 'Fechar' }).click(T);
    await outro.getByText('Nenhum aviso').waitFor(T);
    await foto(outro, 'depois-4-capacete.png');
    return 'Nenhum aviso';
  });
} finally {
  await browser.close();
  vite.kill();
  rmSync(pasta, { recursive: true, force: true });
}

for (const r of resultados) {
  console.log(`${r.ok ? 'passou ' : 'TRAVOU '} ${r.objetivo} · ${r.nome}${r.nota ? ` — ${r.nota}` : ''}`);
  if (!r.ok) codigo = 1;
}
const objetivos = [...new Set(resultados.map((r) => r.objetivo))];
const feitos = objetivos.filter((o) => resultados.filter((r) => r.objetivo === o).every((r) => r.ok));
console.log(`\n${feitos.length} de ${objetivos.length} objetivos feitos só com cliques visíveis.`);
process.exit(codigo);
