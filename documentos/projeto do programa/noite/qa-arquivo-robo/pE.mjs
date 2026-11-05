// E: Salvar como pacote (.bonez) e binário (.boneb), com e sem pasta; reabrir o .bonez
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const D = `${SAIDA}/E-${L}`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/downloads`, { recursive: true }); mkdirSync(`${D}/out`);
const url = await subirEditor();
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${D}/downloads` });
const docInfo = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; const f = d.file; return { bones: f.bones?.length, slots: f.slots?.length, anims: (f.animations ?? []).length, atlases: d.atlases.length, pages: d.atlases.map(a => a.pages.map(p => !!d.imageFor(p))).flat(), skel: [...(d.skeletons?.keys?.() ?? [])], dirty: d.dirty, path: d.path }; });
const passo = async (n) => { await esperar(1200); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   doc: ${JSON.stringify(await docInfo())}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 700)}\n   log: ${log.splice(0).filter(l => !l.startsWith('[grava]')).join('\n        ').slice(0, 800)}`); await foto(page, `E${L}-${n}`); if (j) { await page.locator('[role=dialog] button:visible').last().click(); await esperar(300); } };
await menu(page, 'Arquivo', 'Abrir o herói');
fila.push(`${D}/out/heroi.bonez`);
await menu(page, 'Arquivo', 'Exportar', 'Salvar como pacote');
await passo('1-bonez');
fila.push(`${D}/out/heroi.boneb`);
await menu(page, 'Arquivo', 'Exportar', 'Salvar como binário');
await passo('2-boneb');
console.log('out:', readdirSync(`${D}/out`), 'downloads:', readdirSync(`${D}/downloads`));
// reabrir o .bonez pelo Ctrl+O
fila.push([`${D}/out/heroi.bonez`]);
await page.keyboard.press('Control+o'); await esperar(500); await clicar(page, /^Descartar/);
await passo('3-reabre-bonez');
fila.push([`${D}/out/heroi.boneb`]);
await page.keyboard.press('Control+o'); await esperar(500); await clicar(page, /^Descartar/);
await passo('4-reabre-boneb');
await browser.close(); pararEditor();
