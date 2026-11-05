// SPDX-License-Identifier: Apache-2.0
// N-4b (05/11/2026): o recorte da exportação, arrastado na cena.
// Prova do N-4b SÓ com o que está à vista: menus, botões, cena, teclado.
// O documento nunca é mexido por `page.evaluate`. A única leitura por dentro é
// a câmera (onde fica o canto na tela) — só lê, não escreve.
//
// Uso, com o editor de pé (npm run editor -- --port 5199):
//   node ferramentas/provas/recorte-na-cena.mjs [url] [pasta-das-fotos]
// O Playwright vem do `require('playwright')` da máquina (PLAYWRIGHT=caminho troca).
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const URL = process.argv[2] ?? 'http://localhost:5199/';
const OUT = process.argv[3] ?? join(process.cwd(), 'prova-recorte');
mkdirSync(OUT, { recursive: true });
const linhas = [];
const diz = (passo, ok, nota) => { const l = `${ok ? 'PASSOU' : 'FALHOU'} · ${passo}${nota ? ` · ${nota}` : ''}`; linhas.push(l); console.log(l); };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await context.addInitScript(() => {
  delete window.showSaveFilePicker; delete window.showOpenFilePicker; delete window.showDirectoryPicker;
});
const page = await context.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(String(e)));
page.on('dialog', (d) => d.accept());
await page.goto(URL);
await page.waitForSelector('.viewport-canvas');
const foto = (n) => page.screenshot({ path: join(OUT, `${n}.png`) });

/** Clica no menu de cima e nos itens, um depois do outro, como a mão. */
async function menu(topo, ...itens) {
  await page.locator('button.menu-button', { hasText: new RegExp(`^${topo}$`) }).click();
  for (let i = 0; i < itens.length; i++) {
    const item = page.locator('.menu-item:visible, [role=menuitem]:visible', { hasText: itens[i] }).first();
    if (i < itens.length - 1) await item.hover(); else await item.click();
    await page.waitForTimeout(150);
  }
}
const ficha = () => Promise.all(['x', 'y', 'width', 'height'].map(async (k) => {
  const c = page.locator(`#cena-recorte-${k}`);
  return (await c.count()) && (await c.isVisible()) ? c.inputValue() : null;
}));
const titulo = async () => (await page.locator('.anim-recorte .anim-secao-nome').textContent())?.trim();
const rodape = async () => (await page.locator('footer.status-bar').innerText()).replace(/\s+/g, ' ');
const numeros = async () => (await ficha()).map(Number);

// 1. O herói, pelo menu Arquivo; a idle, pelo clique na lista.
await menu('Arquivo', 'Abrir o herói (exemplo)');
await page.locator('.anim-lista li').filter({ hasText: /^\W*idle/ }).first().waitFor();
await page.locator('.anim-lista li').filter({ hasText: /^\W*idle/ }).first().click();
await page.waitForTimeout(300);
diz('o herói abriu pelo menu, e a idle pela lista', true);
diz('a aba Animações mostra a linha do recorte, à vista', await page.locator('.anim-recorte').isVisible(), await titulo());

// 2. Animação → Recorte na cena: o item existe, à vista, com nome claro.
await page.locator('button.menu-button', { hasText: /^Animação$/ }).click();
const item = page.locator('.menu-item:visible', { hasText: 'Recorte na cena' }).first();
diz('o menu Animação mostra "Recorte na cena", com a tecla C', await item.isVisible() && /C/.test(await item.innerText()), (await item.innerText()).replace(/\s+/g, ' '));
await foto('01-menu-animacao');
await item.click();
await page.waitForTimeout(300);
const n0 = await numeros();
diz('ligado: a caixa do recorte aparece na cena, com os 4 números', n0.every(Number.isFinite), n0.join(' '));
diz('a linha da aba Animações diz o tamanho', (await titulo()) === `Recorte ${n0[2]} × ${n0[3]} px`, await titulo());
await foto('02-recorte-ligado');

// 3. Afasta pelo botão − até o retângulo inteiro caber na cena.
const tela = (x, y) => page.evaluate(async ([wx, wy]) => {
  const vp = (await import('/src/viewport/viewport.ts')).viewportPanel; // só LÊ a câmera
  const c = vp.canvas.getBoundingClientRect(); const s = vp.camera.worldToScreen(wx, wy);
  return { x: c.left + s.x, y: c.top + s.y, top: c.top, bottom: c.bottom, left: c.left, right: c.right };
}, [x, y]);
for (let i = 0; i < 8; i++) {
  const a = await tela(n0[0], n0[1]); const z = await tela(n0[0] + n0[2], n0[1] + n0[3]);
  if (a.x > a.left + 40 && z.x < a.right - 60 && z.y > a.top + 40 && a.y < a.bottom - 80) break;
  await page.locator('.viewport-zoom-botao', { hasText: '−' }).click();
  await page.waitForTimeout(120);
}

// 4. Arrasta o canto de cima à direita: +40 px de tela à direita, 30 para cima.
const canto = await tela(n0[0] + n0[2], n0[1] + n0[3]);
await page.mouse.move(canto.x, canto.y);
await page.mouse.down();
for (let i = 1; i <= 10; i++) await page.mouse.move(canto.x + 4 * i, canto.y - 3 * i);
await foto('03-arrastando');
await page.mouse.up();
const n1 = await numeros();
diz('arrastar o canto: largura e altura crescem, X e Y ficam', n1[2] > n0[2] && n1[3] > n0[3] && n1[0] === n0[0] && n1[1] === n0[1], `${n0.join(' ')} → ${n1.join(' ')}`);
diz('o rodapé diz o tamanho novo', (await rodape()).includes(`${n1[2]} × ${n1[3]} px`), (await rodape()).slice(0, 90));

// 5. Ctrl+Z pelo teclado.
await page.keyboard.press('Control+z');
await page.waitForTimeout(200);
const n2 = await numeros();
diz('Ctrl+Z: os números voltam, num passo só', n2.join(' ') === n0.join(' '), n2.join(' '));
await page.keyboard.press('Control+Shift+z');
await page.waitForTimeout(200);
diz('Ctrl+Shift+Z refaz', (await numeros()).join(' ') === n1.join(' '));

// 6. Escreve a Largura na caixa da cena.
await page.locator('#cena-recorte-width').fill('300');
await page.locator('#cena-recorte-width').press('Enter');
await page.waitForTimeout(200);
const fim = await numeros();
diz('a Largura escrita na caixa vale', fim[2] === 300, fim.join(' '));

// 7. "Pronto" termina; a linha da aba fica.
await page.locator('.viewport-recorte-botao', { hasText: 'Pronto' }).click();
await page.waitForTimeout(200);
diz('Pronto: a caixa some, a linha da aba fica com o tamanho', !(await page.locator('.viewport-recorte').isVisible()) && (await titulo()) === `Recorte 300 × ${fim[3]} px`, await titulo());
await foto('04-pronto');

// 8. Arquivo → Exportar → GIF…, com "A área desenhada nesta animação".
await menu('Arquivo', 'Exportar', 'GIF, PNG, folha, vídeo…');
const janela = page.locator('.dialog-veil').last();
await janela.waitFor();
await janela.locator('select').filter({ has: page.locator('option[value="animacao"]') }).first().selectOption('animacao');
await foto('05-exportar');
const [gif] = await Promise.all([
  page.waitForEvent('download', { timeout: 60000 }),
  janela.getByRole('button', { name: /^Exportar/ }).last().click(),
]);
const caminhoGif = join(OUT, gif.suggestedFilename());
await gif.saveAs(caminhoGif);
const b = readFileSync(caminhoGif);
const w = b.readUInt16LE(6); const h = b.readUInt16LE(8);
diz('o GIF sai do tamanho do recorte', b.subarray(0, 3).toString() === 'GIF' && w === 300 && h === fim[3], `${gif.suggestedFilename()} ${w}×${h}`);
await page.locator('.dialog-veil').getByRole('button', { name: 'Fechar' }).click();

// 9. Arquivo → Salvar como…, e Arquivo → Abrir projeto…
const [salvo] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), menu('Arquivo', 'Salvar como…')]);
const caminhoBone = join(OUT, salvo.suggestedFilename());
await salvo.saveAs(caminhoBone);
const crop = JSON.parse(readFileSync(caminhoBone, 'utf8')).animations.find((a) => a.name === 'idle').crop;
diz('o arquivo salvo traz o animation.crop', crop?.width === 300 && crop?.height === fim[3], JSON.stringify(crop));
const [chooser] = await Promise.all([page.waitForEvent('filechooser', { timeout: 30000 }), menu('Arquivo', 'Abrir projeto…')]);
await chooser.setFiles(caminhoBone);
await page.waitForTimeout(1500);
await page.locator('.anim-lista li').filter({ hasText: /^\W*idle/ }).first().click();
await page.waitForTimeout(300);
diz('reaberto: a linha da aba diz o mesmo recorte', (await titulo()) === `Recorte 300 × ${fim[3]} px`, await titulo());
await foto('06-reaberto');

// 10. A base aberta: a linha some, e o item do menu fica cinza.
await page.locator('.anim-corpos *, .anim-secao *', { hasText: /^Base — montar$/ }).first().click().catch(async () => menu('Base', 'Abrir a base'));
await page.waitForTimeout(300);
await page.locator('button.menu-button', { hasText: /^Animação$/ }).click();
const cinza = await page.locator('.menu-item:visible', { hasText: 'Recorte na cena' }).first();
const desligado = (await cinza.isDisabled()) || (await cinza.getAttribute('aria-disabled')) === 'true';
diz('com a base aberta: a linha some e "Recorte na cena" fica cinza', !(await page.locator('.anim-recorte').isVisible()) && desligado);
await page.keyboard.press('Escape');

diz('nenhum erro na página', erros.length === 0, erros.join(' | '));
writeFileSync(join(OUT, 'resultado.txt'), `${linhas.join('\n')}\n`);
await browser.close();
process.exit(linhas.some((l) => l.startsWith('FALHOU')) ? 1 : 0);
