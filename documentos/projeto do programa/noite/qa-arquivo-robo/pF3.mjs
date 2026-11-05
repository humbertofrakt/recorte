import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
const D = `${SAIDA}/F3`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/proj`, { recursive: true });
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
await clicar(page, /Começar vazio/);
for (const p of ['Fumaça', 'Fogo', 'Faísca']) { await menu(page, 'Partículas', p); await esperar(300); }
await menu(page, 'Animação', 'Nova animação'); await esperar(400); await page.keyboard.press('Enter'); await esperar(400);
// vai a 0,5 s e desliga Emitindo do emissor escolhido (o último, faísca)
await page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; d.time = 0.5; d.repose?.(); });
await esperar(300);
const caixa = page.locator('xpath=//label[normalize-space()="Emitindo"]/following::input[@type="checkbox"][1]').first();
console.log('Emitindo marcado?', await caixa.isChecked());
await caixa.click(); await esperar(400);
console.log('rodapé', await rodape(page));
console.log('timeline:', await page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return JSON.stringify(d.file.animations?.[0]); }));
await foto(page, 'F3-chave-emitindo');
fila.push(`${D}/proj`);
await page.keyboard.press('Control+s'); await esperar(600);
console.log('janela salvar:', (await janelaTexto(page))?.replace(/\n+/g, ' / ').slice(0, 300));
await clicar(page, /Escolher a pasta/); await esperar(2500); console.log('janela depois:', (await janelaTexto(page))?.replace(/\n+/g, ' / ').slice(0, 600)); await foto(page, 'F3-depois-salvar');
await esperar(4000); console.log('DIRTY', await page.evaluate(async () => (await import('/src/viewport/viewport.ts')).viewportPanel.doc.dirty)); console.log('rodapé', await rodape(page), '\nproj:', readdirSync(`${D}/proj`));
console.log(log.splice(0).filter(l => !l.startsWith('[grava]')).join('\n').slice(0, 500));
await browser.close(); pararEditor();
