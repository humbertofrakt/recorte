// SPDX-License-Identifier: Apache-2.0
// A PROVA DE PESSOA FINAL — noite de 05/11/2026, sobre a integração da noite.
//
// Boas-vindas → Abrir a oficina → tocar → tomadas (a motosserra na mão; o
// herói na cabine do mecha) → Skins → Guarda-roupa, vestir a armadura →
// Animação → Animações de outro boneco… → Quero fazer… "arma" → exportar GIF.
//
// Só clica no que está à vista, pelo texto que a pessoa lê. Nenhum
// `page.evaluate` mexe no documento. Cada passo diz PASSOU ou FALHOU; cada
// lugar em que a pessoa travaria sai como ATRITO. Um passo que falha não
// derruba os seguintes.
//
// Uso, com o editor de pé:  node ferramentas/provas/prova-de-pessoa-final.mjs [url] [pasta]
// O Playwright vem do `require('playwright')` da máquina (PLAYWRIGHT=caminho troca).

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const URL = process.argv[2] ?? 'http://localhost:5199/';
const OUT = process.argv[3] ?? join(process.cwd(), 'prova-de-pessoa-final');
mkdirSync(OUT, { recursive: true });

const linhas = [];
const diz = (passo, ok, nota = '') => { const l = `${ok ? 'PASSOU' : 'FALHOU'} · ${passo}${nota ? ` · ${nota}` : ''}`; linhas.push(l); console.log(l); };
const atrito = (onde, nota) => { const l = `ATRITO · ${onde} · ${nota}`; linhas.push(l); console.log(l); };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await context.addInitScript(() => { delete window.showSaveFilePicker; delete window.showOpenFilePicker; delete window.showDirectoryPicker; });
const page = await context.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(String(e)));
const baixados = [];
page.on('download', async (d) => { const f = join(OUT, d.suggestedFilename()); await d.saveAs(f); baixados.push(f); });

const foto = (n) => page.screenshot({ path: join(OUT, `${n}.png`) });
/** A janela aberta por cima: as da casa (`.dialog-veil`) e as que se dizem `dialog`. */
const jan = () => page.locator('.dialog-veil, [role=dialog]').last();
const rodapeVisivel = async () => (await page.locator('.status-state').innerText()).trim();
const rodape = async () => (await page.locator('.status-state').getAttribute('title')) ?? '';
const janela = async () => ((await page.locator('.dialog-veil, [role=dialog]').count()) > 0
  ? (await jan().innerText()).replace(/\s+/g, ' ') : '');
async function menu(topo, ...itens) {
  await page.locator('button.menu-button', { hasText: new RegExp(`^${topo}$`) }).click();
  for (let i = 0; i < itens.length; i++) {
    const item = page.locator('.menu-item:visible', { hasText: itens[i] }).first();
    if (i < itens.length - 1) await item.hover(); else await item.click();
    await page.waitForTimeout(150);
  }
}
/** A lista Bases mora na aba Animações; se outra aba está à frente, a pessoa clica na aba. */
async function bases(nome) {
  const linha = page.locator('.anim-corpos li, .anim-corpo-item', { hasText: nome }).first();
  if (!(await linha.isVisible().catch(() => false))) {
    atrito(`Bases → ${nome}`, 'a lista Bases não está à vista: outra aba (Skins) ficou na frente da aba Animações; é preciso clicar na aba');
    await page.locator('button.panel-tab:visible', { hasText: /^Animações/ }).first().click();
    await page.waitForTimeout(300);
  }
  await linha.click();
  await page.waitForTimeout(600);
}
async function passo(nome, corpo) {
  try { await corpo(); } catch (e) { diz(nome, false, String(e.message ?? e).split('\n')[0].slice(0, 160)); }
}
const cortado = async (onde) => {
  const v = await rodapeVisivel();
  if (/…$/.test(v)) atrito(onde, `o rodapé sai cortado com "…": "${v.slice(0, 90)}"`);
};

// 1. Boas-vindas → Abrir a oficina
await page.goto(URL);
await page.waitForSelector('.viewport-canvas');
await passo('boas-vindas → Abrir a oficina', async () => {
  const b = page.locator('button:visible', { hasText: /Abrir a oficina/ }).first();
  diz('as boas-vindas mostram "Abrir a oficina"', await b.isVisible());
  await b.click();
  await page.locator('.anim-lista li', { hasText: 'walk' }).first().waitFor({ timeout: 20000 });
  await page.waitForTimeout(800);
  diz('a oficina abriu, e o rodapé diz por onde começar', /walk/.test(await rodape()), (await rodape()).slice(0, 120));
  await cortado('rodapé da Oficina aberta');
  await foto('01-oficina');
});

// 2. Tocar
await passo('tocar o walk', async () => {
  await page.locator('.anim-lista li', { hasText: 'walk' }).first().click();
  await page.waitForTimeout(300);
  const tocar = page.locator('button.dope-toc-tocar');
  await tocar.click(); await page.waitForTimeout(1200);
  diz('walk toca, com a motosserra na mão', (await tocar.getAttribute('aria-pressed')) === 'true');
  await foto('02-tocando');
  await tocar.click();
});

// 3. Tomadas: a motosserra está na mão; o herói na cabine do mecha
await passo('tomadas', async () => {
  const lista = (await page.locator('.anim-corpo').innerText()).replace(/\s+/g, ' ');
  diz('a motosserra aparece como entidade do herói', /motosserra/.test(lista));
  const zoomAntes = await page.locator('.viewport-zoom-campo').inputValue();
  await page.locator('.anim-corpos li, .anim-corpo-item', { hasText: 'mecha' }).first().click();
  await page.waitForTimeout(800);
  const zoomDepois = await page.locator('.viewport-zoom-campo').inputValue();
  diz('Bases → mecha: a vista se ajusta à base nova', zoomAntes !== zoomDepois, `${zoomAntes} → ${zoomDepois}`);
  const r = await rodape();
  if (!/mecha/.test(r)) atrito('Bases → mecha', `o rodapé não diz que a base trocou: "${r.slice(0, 90)}"`);
  const arvore = (await page.locator('.panel-column').first().innerText()).replace(/\s+/g, ' ');
  diz('o herói está na cabine do mecha (a Árvore mostra "cabine · piloto")', /cabine\s*piloto/.test(arvore));
  await foto('03-mecha');
  await page.locator('.anim-corpos li, .anim-corpo-item', { hasText: 'heroi' }).first().click();
  await page.waitForTimeout(600);
});

// 4. Skins → Guarda-roupa, vestir a armadura
await passo('guarda-roupa', async () => {
  await menu('Skins', 'Guarda-roupa');
  await jan().waitFor();
  const j = await janela();
  diz('Skins → Guarda-roupa abre, e diz como usar', /Cada coluna é uma skin/.test(j), j.slice(0, 80));
  await foto('04-guarda-roupa');
  const vestir = jan().getByRole('button', { name: /Vestir só esta/ }).first();
  if (!(await vestir.count())) { atrito('Guarda-roupa', 'não há "Vestir só esta" à vista'); }
  else {
    await vestir.click(); await page.waitForTimeout(500);
    const vestida = (await jan().innerText()).match(/Vestida: [^\n]*/)?.[0] ?? '';
    diz('"Vestir só esta" na coluna armadura veste a armadura', /armadura/.test(vestida), vestida);
    await cortado('rodapé do Guarda-roupa');
  }
  await foto('04b-armadura');
  const fechar = jan().getByRole('button', { name: /Fechar/ });
  if (await fechar.count()) await fechar.first().click(); else await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  const aberta = await page.locator('.dialog-veil, [role=dialog]').count();
  if (aberta > 0) { atrito('Guarda-roupa', '"Fechar" não fechou a janela'); await page.keyboard.press('Escape'); }
});

// 5. Animação → Animações de outro boneco… (no cavaleiro, vindas do herói)
await passo('animações de outro boneco', async () => {
  await bases('cavaleiro');
  await menu('Animação', 'Animações de outro boneco');
  await jan().waitFor();
  const j = await janela();
  diz('a janela diz o que faz', /o andar de um serve no outro/.test(j), j.slice(0, 90));
  await foto('05-outro-boneco');
  const heroi = jan().getByText(/heroi — base deste projeto/).first();
  if (await heroi.count()) { await heroi.click(); await page.waitForTimeout(400); }
  else atrito('Animações de outro boneco', 'não há "heroi" na lista De onde vêm');
  const j2 = await janela();
  const botoes = await jan().locator('button:visible').allInnerTexts();
  const acao = botoes.find((t) => /^(Trazer|Usar|Aplicar|Copiar|Receber)/.test(t.trim()));
  if (acao === undefined) { atrito('Animações de outro boneco', `qual botão aplica? botões: ${botoes.map((t) => t.trim()).join(' | ')}`); await page.keyboard.press('Escape'); return; }
  await jan().getByRole('button', { name: acao.trim() }).first().click();
  await page.waitForTimeout(800);
  const r = await rodape();
  diz(`"${acao.trim()}": o rodapé diz que as animações vieram, ligadas`, /animaç(ão|ões) de heroi/.test(r), r.slice(0, 100));
  const todo = await page.locator('footer.status-bar').innerText();
  const avisos = /(\d+) avisos?/.exec(todo);
  if (avisos !== null) atrito('Animações de outro boneco', `logo depois, o rodapé mostra "${avisos[0]}"`);
  await cortado('rodapé de Animações de outro boneco');
  await foto('05b-cavaleiro');
});

// 6. Quero fazer… "arma"
await passo('quero fazer', async () => {
  await page.locator('button:visible', { hasText: /Quero fazer/ }).click();
  await page.waitForTimeout(300);
  await page.keyboard.type('arma');
  await page.waitForTimeout(400);
  const j = await janela();
  diz('Quero fazer… "arma" acha "Pôr uma arma na mão", com os passos', /Pôr uma arma na mão/.test(j) && /Encaixar um projeto/.test(j), j.slice(0, 100));
  await foto('06-quero-fazer');
  const fechar = jan().getByRole('button', { name: /^Fechar$/ });
  if (await fechar.count()) await fechar.first().click(); else await page.keyboard.press('Escape');
});

// 7. Exportar um GIF
await passo('exportar GIF', async () => {
  await bases('heroi');
  await page.locator('.anim-lista li', { hasText: 'walk' }).first().click();
  await menu('Arquivo', 'Exportar', 'GIF, PNG, folha, vídeo');
  await jan().waitFor();
  const antes = baixados.length;
  await jan().getByRole('button', { name: /^Exportar/ }).last().click();
  await page.waitForTimeout(4000);
  const gif = baixados.slice(antes).find((f) => f.endsWith('.gif'));
  let tam = '';
  if (gif) { const b = readFileSync(gif); tam = `${b.readUInt16LE(6)}×${b.readUInt16LE(8)}`; }
  diz('o GIF sai', gif !== undefined, `${gif?.split(/[\\/]/).pop() ?? '(nada)'} ${tam}`);
  await foto('07-exportou');
});

diz('nenhum erro na página', erros.length === 0, erros.join(' | ').slice(0, 300));
writeFileSync(join(OUT, 'resultado.txt'), `${linhas.join('\n')}\n`);
await browser.close();
process.exit(linhas.some((l) => l.startsWith('FALHOU')) ? 1 : 0);
