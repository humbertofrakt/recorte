// L: Spine pela tela (pasta com .json + .atlas + .png); Repetir a última exportação; Entregar uma base
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar, campo } from './harness.mjs';
import { cpSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
const D = `${SAIDA}/L`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/out`, { recursive: true });
cpSync('/home/user/recorte/ferramentas/testes/exemplos-de-fora', `${D}/spine`, { recursive: true });
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
const info = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return { bones: d.file.bones?.length, slots: d.file.slots?.length, anims: (d.file.animations ?? []).map(a => a.name), regions: d.atlases.reduce((n, a) => n + a.regions.length, 0), pages: d.atlases.flatMap(a => a.pages.map(p => !!d.imageFor(p))), dirty: d.dirty }; });
const passo = async (n) => { await esperar(1500); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   ${JSON.stringify(await info())}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 600)}\n   log: ${log.splice(0).filter(l => !l.startsWith('[grava]')).join(' ; ').slice(0, 400)}`); await foto(page, `L-${n}`); return j; };
fila.push(`${D}/spine`);
await menu(page, 'Arquivo', 'Importar', 'De outro programa');
let j = await passo('1-spine');
if (j) await clicar(page, /^Fechar/);
// exporta um GIF e repete com Ctrl+Shift+E
await menu(page, 'Arquivo', 'Exportar', 'GIF, PNG'); await esperar(400);
await page.locator('[role=dialog] button', { hasText: /^Exportar$/ }).click(); await esperar(3000);
j = await passo('2-gif'); if (j) await clicar(page, /^Fechar/);
await page.locator('.viewport').first().click({ position: { x: 30, y: 30 } });
await page.keyboard.press('Control+Shift+e'); await esperar(3500);
j = await passo('3-repetir'); if (j) await clicar(page, /^Fechar/);
console.log('dl:', readdirSync(`${D}/dl`));
// Entregar uma base
fila.push(`${D}/out/entregue.bone`);
await menu(page, 'Arquivo', 'Exportar', 'Entregar uma base'); await esperar(1500);
j = await passo('4-entregar'); if (j) await clicar(page, /^Fechar/);
console.log('out:', readdirSync(`${D}/out`), 'dl:', readdirSync(`${D}/dl`));
await browser.close(); pararEditor();
