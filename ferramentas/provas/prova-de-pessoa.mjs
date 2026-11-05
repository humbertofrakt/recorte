// SPDX-License-Identifier: Apache-2.0
// A PROVA DE PESSOA — noite de 05/11/2026.
//
// Uma pessoa que nunca abriu o Recorte, de ponta a ponta, no editor MONTADO:
// abrir → Abrir o herói → tocar → mudar uma pose → animação nova de 1 s com 3
// chaves → exportar GIF → salvar → reabrir.
//
// Só clica no que está à vista: botões e menus pelo TEXTO que a pessoa lê, a
// cena, a Árvore, a ficha, o teclado. Nenhum `page.evaluate` mexe no
// documento. O que a prova LÊ é o que a pessoa lê: o rodapé, a lista, a
// janela; e os arquivos que o navegador baixou.
//
// Cada passo diz PASSOU ou FALHOU. Cada momento em que a pessoa não saberia o
// que clicar, ou leria uma palavra que não entende, sai como ATRITO — não
// reprova a prova, mas entra no relatório (`documentos/projeto do programa/
// noite/prova-de-pessoa.md`).
//
// Uso, com o editor de pé (o montado: `PORTA=5281 node programa/servidor.mjs`,
// ou o de desenvolvimento):
//   node ferramentas/provas/prova-de-pessoa.mjs [url] [pasta-das-fotos]
// O Playwright vem do `require('playwright')` da máquina (PLAYWRIGHT=caminho troca).
//
// O navegador da prova não tem o seletor de pasta (`showDirectoryPicker`): o
// Salvar cai no download, como no Firefox. É o caminho que um robô consegue
// percorrer; o do Chrome com pasta escolhida é da mão do Humberto.

import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT ?? 'playwright');
const URL = process.argv[2] ?? 'http://localhost:5281/';
const OUT = process.argv[3] ?? join(process.cwd(), 'prova-de-pessoa');
mkdirSync(OUT, { recursive: true });

const linhas = [];
const diz = (passo, ok, nota = '') => {
  const l = `${ok ? 'PASSOU' : 'FALHOU'} · ${passo}${nota ? ` · ${nota}` : ''}`;
  linhas.push(l); console.log(l);
};
const atrito = (onde, nota) => { const l = `ATRITO · ${onde} · ${nota}`; linhas.push(l); console.log(l); };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await context.addInitScript(() => {
  delete window.showSaveFilePicker; delete window.showOpenFilePicker; delete window.showDirectoryPicker;
});
const page = await context.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(String(e)));
const baixados = [];
page.on('download', async (d) => {
  const arquivo = join(OUT, d.suggestedFilename());
  await d.saveAs(arquivo);
  baixados.push(arquivo);
});

const foto = (n) => page.screenshot({ path: join(OUT, `${n}.png`) });
const rodape = async () => (await page.locator('footer.status-bar').innerText()).replace(/\s+/g, ' ');
const janela = async () => ((await page.locator('.dialog-veil').count()) > 0
  ? (await page.locator('.dialog-veil').last().innerText()).replace(/\s+/g, ' ') : '');
async function menu(topo, ...itens) {
  await page.locator('button.menu-button', { hasText: new RegExp(`^${topo}$`) }).click();
  for (let i = 0; i < itens.length; i++) {
    const item = page.locator('.menu-item:visible', { hasText: itens[i] }).first();
    if (i < itens.length - 1) await item.hover(); else await item.click();
    await page.waitForTimeout(150);
  }
}
/** Palavras que a pessoa não conhece (o dicionário da tela, `ui/jargao.ts`), fora de parênteses. */
const JARGAO = /(?<![\p{L}.])(slots?|atlas|manifesto?|rig|skeletons?|attachments?|constraints?|timelines?|keyframes?)(?!\p{L}|\.json)/iu;
function confereJargao(onde, texto) {
  const fora = texto.replace(/\([^()]*\)/g, ' ');
  const m = JARGAO.exec(fora);
  if (m !== null) atrito(onde, `a palavra "${m[1]}" não é da pessoa: "${texto.slice(0, 140)}"`);
}

// 1. Abrir
await page.goto(URL);
await page.waitForSelector('.viewport-canvas');
await foto('01-abriu');
const heroi = page.locator('button:visible', { hasText: /herói/i }).first();
diz('a tela de boas-vindas mostra "Abrir o herói", à vista', await heroi.isVisible());

// 2. Abrir o herói
await heroi.click();
await page.locator('.anim-lista li', { hasText: 'idle' }).first().waitFor();
await page.waitForTimeout(500);
const r2 = await rodape();
diz('o herói abriu', r2.length > 0, r2.slice(0, 120));
diz('o rodapé diz o primeiro passo: onde clicar para ver o herói se mexer', /clique em idle/.test(r2), r2.slice(0, 160));
await foto('02-heroi');

// 3. Tocar
const tocar = page.locator('button.dope-toc-tocar');
if (await tocar.isDisabled()) {
  atrito('Tocar, logo depois de abrir', `o ▶ está cinza na base; o porquê só está na dica: "${await tocar.getAttribute('title')}"`);
}
await page.locator('.anim-lista li', { hasText: 'idle' }).first().click();
await page.waitForTimeout(300);
await tocar.click();
await page.waitForTimeout(800);
const tocando = await tocar.getAttribute('aria-pressed');
diz('com idle aberta, o ▶ toca', tocando === 'true', `aria-pressed=${tocando}`);
await foto('03-tocando');
await tocar.click();

// 4. Mudar uma pose: a pessoa arrasta o braço na cena
await page.mouse.move(757, 355); await page.mouse.down();
for (let i = 1; i <= 6; i++) await page.mouse.move(757 + 4 * i, 355 + 2 * i);
await page.mouse.up(); await page.waitForTimeout(300);
const r4 = await rodape();
if (/não girou|não moveu|manda nele/.test(r4)) atrito('mudar uma pose no braço', `o rodapé explica, mas o braço não mexe: "${r4.slice(0, 120)}"`);
// e pela Árvore + ficha, no torso
await page.locator('li:visible', { hasText: /^\W*torso\W*$/ }).first().click();
await page.waitForTimeout(200);
const angulo = page.locator('xpath=//*[normalize-space(text())="Ângulo"]/following::input[1]').first();
const antes = Number((await angulo.inputValue()).replace(',', '.'));
await angulo.fill(String(antes + 10)); await angulo.press('Enter'); await page.waitForTimeout(300);
const r4b = await rodape();
diz('mudar a pose: o torso gira pela ficha, e o rodapé diz a chave', /Chave em/.test(r4b), r4b.slice(0, 100));
await page.keyboard.press('Control+z');

// 5. Animação nova, 1 s, 3 chaves
await menu('Animação', /^Nova animação/);
await page.waitForTimeout(400);
const r5 = await rodape();
diz('Animação → Nova animação cria, e pede o nome', /Escreva o nome/.test(r5), r5.slice(0, 100));
await page.keyboard.type('aceno'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
await menu('Animação', /^Mudar duração/);
const jd = await janela();
diz('Mudar duração abre a janela, com a duração de agora', /dura/.test(jd), jd.slice(0, 100));
await page.locator('.dialog-veil input').last().fill('1');
await page.locator('.dialog-veil button', { hasText: /^Mudar$/ }).click();
await page.waitForTimeout(300);
await page.locator('li:visible', { hasText: /^\W*torso\W*$/ }).first().click();
const base = Number((await angulo.inputValue()).replace(',', '.'));
const chaves = [];
const chave = async (onde, valor) => {
  await angulo.fill(String(valor)); await angulo.press('Enter'); await page.waitForTimeout(250);
  const r = await rodape(); chaves.push(r); diz(`chave em ${onde}`, /Chave em/.test(r), r.slice(0, 60));
};
await chave('0 s', base + 8);
// 0,50 s: a pessoa clica na régua da linha do tempo, embaixo do "0,50 s"
const meio = page.locator('text=/^0,50 s$/').first();
const caixa = await meio.boundingBox();
if (caixa !== null) await page.mouse.click(caixa.x + 2, caixa.y + caixa.height / 2);
await page.waitForTimeout(250);
await chave('0,5 s', base - 8);
// 1 s: o "1,00 s" fica fora da régua à vista; a pessoa acha o ⏭ (dica "Fim")
if ((await page.locator('text=/^1,00 s$/').count()) === 0 || !(await page.locator('text=/^1,00 s$/').first().isVisible())) {
  atrito('chave em 1 s', 'o fim da animação (1,00 s) não aparece na régua à vista; só o ⏭, que é ícone sem texto (dica "Fim")');
}
await page.locator('.dope-toc-botao[title^="Fim"]').first().click();
await page.waitForTimeout(250);
await chave('1 s', base + 8);
await foto('05-tres-chaves');

// 6. Exportar GIF
await menu('Arquivo', 'Exportar', 'GIF, PNG, folha, vídeo');
await page.locator('.dialog-veil').last().waitFor();
await foto('06-janela-exportar');
const antesGif = baixados.length;
await page.locator('.dialog-veil').last().getByRole('button', { name: /^Exportar/ }).last().click();
await page.waitForTimeout(3000);
const gif = baixados.slice(antesGif).find((f) => f.endsWith('.gif'));
const fim6 = await janela();
diz('Exportar sai um GIF', gif !== undefined, gif?.split(/[\\/]/).pop() ?? '(nada)');
if (gif !== undefined && !/aceno/.test(gif)) atrito('Exportar', `a animação é "aceno", e o arquivo sai "${gif.split(/[\\/]/).pop()}": duas exportações seguidas se pisam`);
diz('a janela diz onde o arquivo ficou', /Pasta:/.test(fim6), fim6.slice(0, 120));
await page.locator('.dialog-veil').getByRole('button', { name: 'Fechar' }).click();

// 7. Salvar
const antesSalvar = baixados.length;
await menu('Arquivo', /^Salvar(\s*Ctrl\+S)?$/);
await page.waitForTimeout(1500);
const r7 = await rodape();
const salvos = baixados.slice(antesSalvar).map((f) => f.split(/[\\/]/).pop());
diz('Salvar baixa o .bone', salvos.some((f) => f.endsWith('.bone')), salvos.join(', '));
confereJargao('rodapé do Salvar', r7);
if (!/\.bone\b/.test(r7.replace(/salve o \.bone/, ''))) atrito('rodapé do Salvar', `não diz que o .bone foi baixado: "${r7.slice(0, 140)}"`);
if (!salvos.some((f) => /atlas/.test(f))) atrito('Salvar', `as imagens do herói (a folha, heroi.atlas.json e o png) NÃO foram junto: só ${salvos.join(', ')}`);

// 8. Reabrir: Arquivo → Abrir projeto…, os arquivos salvos
const bone = baixados.slice(antesSalvar).filter((f) => f.endsWith('.bone') || f.endsWith('.json'));
const [chooser] = await Promise.all([page.waitForEvent('filechooser'), menu('Arquivo', 'Abrir projeto')]);
await chooser.setFiles(bone);
await page.waitForTimeout(2000);
const r8 = await rodape();
await foto('08-reaberto');
const lista = (await page.locator('.anim-lista').first().innerText()).replace(/\s+/g, ' ');
diz('reaberto: a animação aceno está na lista, com 1,00 s', /aceno · 1,00 s/.test(lista), lista.slice(0, 120));
const texto = JSON.parse(readFileSync(bone.find((f) => f.endsWith('.bone')), 'utf8'));
const tempos = (texto.animations.find((a) => a.name === 'aceno')?.timelines ?? [])
  .filter((t) => t.target === 'torso').flatMap((t) => t.keys.map((k) => k.time));
diz('o arquivo salvo tem as 3 chaves, em 0, 0,5 e 1 s', JSON.stringify(tempos) === '[0,0.5,1]', JSON.stringify(tempos));
const avisos = /(\d+) avisos?/.exec(r8);
if (avisos !== null) atrito('reaberto', `o rodapé mostra "${avisos[0]}": "${r8.slice(0, 150)}"`);

diz('nenhum erro na página', erros.length === 0, erros.join(' | '));
writeFileSync(join(OUT, 'resultado.txt'), `${linhas.join('\n')}\n`);
await browser.close();
process.exit(linhas.some((l) => l.startsWith('FALHOU')) ? 1 : 0);
