// D: Exportar skin, importar skin, trocar imagem nas skins
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { mkdirSync, rmSync, readdirSync, readFileSync } from 'node:fs';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const D = `${SAIDA}/D-${L}`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/downloads`, { recursive: true }); mkdirSync(`${D}/out`);
const url = await subirEditor();
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${D}/downloads` });
const skins = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return (d.file.skins ?? []).map(s => `${s.name}:${Object.keys(s.attachments ?? {}).length}`); });
const passo = async (n) => { await esperar(1000); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   skins: ${JSON.stringify(await skins())}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 900)}\n   log: ${log.splice(0).join('\n        ').slice(0, 900)}`); await foto(page, `D${L}-${n}`); return j; };
await menu(page, 'Arquivo', 'Abrir o herói');
await page.locator('.tab, [role=tab]', { hasText: /^Skins$/ }).first().click(); await esperar(400);
const original = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file.skins.find(s => s.name === 'armadura')));
// 1. lápis na armadura
await page.locator('.peles-linha', { has: page.locator('.peles-nome', { hasText: /^armadura$/ }) }).first().locator('.peles-acao').first().click();
await passo('1-lapis-armadura');
// 2. exportar
fila.push(`${D}/out/armadura.bone`);
await menu(page, 'Arquivo', 'Exportar', 'Skin, para outro boneco');
let j = await passo('2-exportou');
if (j) await page.locator('[role=dialog] button:visible').last().click();
console.log('out:', readdirSync(`${D}/out`), 'downloads:', readdirSync(`${D}/downloads`));
// 3. apaga a armadura e importa de volta
await menu(page, 'Skins', 'Apagar skin');
j = await passo('3-apagar'); if (j) { await clicar(page, /^Apagar/); await esperar(500); }
console.log('   depois de apagar:', JSON.stringify(await skins()));
fila.push([`${D}/out/armadura.bone`]);
await menu(page, 'Arquivo', 'Importar', 'Skin, de outro boneco');
j = await passo('4-importou');
const volta = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file.skins.find(s => s.name === 'armadura') ?? null));
console.log('   armadura volta igual?', volta === original); if (volta !== original) console.log('   ORIG', original.slice(0, 400), '\n   VOLTA', volta?.slice(0, 400));
if (j) await page.locator('[role=dialog] button:visible').last().click();
// 5. trocar imagem nas skins: escolhe o desenho body na Árvore
await page.locator('.arvore-item', { hasText: /^\s*body\s*$/ }).first().click(); await esperar(300);
await menu(page, 'Skins', 'Trocar imagem nas skins');
j = await passo('5-trocar');
const antes = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file.skins.map(s => [s.name, s.attachments?.body])));
const linha = page.locator('.imagens-linha[data-imagem="arm"]').first();
console.log('   linhas arm:', await page.locator('.imagens-linha', { hasText: /^\s*arm\s*$/ }).count(), ' total:', await page.locator('.imagens-linha').count());
await linha.click();
await passo('6-trocou');
const depois = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file.skins.map(s => [s.name, s.attachments?.body])));
console.log('   ANTES', antes, '\n   DEPOIS', depois);
await page.keyboard.press('Control+z'); await esperar(400);
const desfeito = await page.evaluate(async () => JSON.stringify((await import('/src/viewport/viewport.ts')).viewportPanel.doc.file.skins.map(s => [s.name, s.attachments?.body])));
console.log('   Ctrl+Z volta?', desfeito === antes);
await browser.close(); pararEditor();
