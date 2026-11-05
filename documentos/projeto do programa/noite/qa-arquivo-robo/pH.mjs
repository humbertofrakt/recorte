// H: biblioteca — exportar animações, importar em outra base (PSD com ossos), e a biblioteca de fábrica
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { cpSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const D = `${SAIDA}/H-${L}`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/out`, { recursive: true });
cpSync('/home/user/recorte/formato/exemplos/heroi.psd', `${D}/heroi.psd`);
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${D}/dl` });
const anims = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return { anims: (d.file.animations ?? []).map(a => `${a.name}:${a.timelines?.length}`), extra: d.file.assets?.animations, bones: d.file.bones?.length }; });
const passo = async (n) => { await esperar(900); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   ${JSON.stringify(await anims())}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 700)}\n   log: ${log.splice(0).filter(l => !l.startsWith('[grava]')).join(' ; ').slice(0, 500)}`); await foto(page, `H${L}-${n}`); return j; };
await menu(page, 'Arquivo', 'Abrir o herói');
await menu(page, 'Arquivo', 'Exportar', 'Animações, para outra base');
let j = await passo('1-janela-exportar');
fila.push(`${D}/out/andar-atacar.bone`);
const b = page.locator('[role=dialog] button:visible', { hasText: /Exportar|Gravar|Salvar/ }).first();
if (await b.count()) { await b.click(); }
j = await passo('2-exportou');
if (j) await page.locator('[role=dialog] button:visible').last().click();
console.log('out:', readdirSync(`${D}/out`));
// outra base: PSD com ossos
fila.push([`${D}/heroi.psd`]);
await menu(page, 'Arquivo', 'Importar', 'PSD com ossos');
await esperar(800); await clicar(page, /^Descartar/); await esperar(500); await clicar(page, /^Substituir/); await esperar(2500);
j = await passo('3-psd-ossos'); if (j) await page.locator('[role=dialog] button:visible').last().click();
fila.push([`${D}/out/andar-atacar.bone`]);
await menu(page, 'Arquivo', 'Importar', 'Animações, de outra base');
j = await passo('4-pergunta');
if (j) await clicar(page, /^Trazer/);
await passo('5-importou');
await menu(page, 'Animação', 'Animações', 'Biblioteca de animações');
j = await passo('6-biblioteca');
await browser.close(); pararEditor();
