import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
const D = `${SAIDA}/I-1920`;
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
fila.push(`${D}/game`);
await menu(page, 'Arquivo', 'Abrir pasta do projeto');
const t0 = Date.now();
for (let i = 0; i < 2; i++) {
  await esperar(1500);
  const info = await page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return { at: d.atlases.map(a => a.regions.length), w: document.querySelector('.status-warn')?.textContent }; });
  console.log(((Date.now() - t0) / 1000).toFixed(1), JSON.stringify(info), (await rodape(page)).slice(0, 80));
}
await page.locator('.status-warn').click(); await esperar(800);
console.log('JANELA', (await janelaTexto(page))?.replace(/\n+/g, ' / ').slice(0, 400));
console.log('depois do clique', await page.evaluate(() => document.querySelector('.status-warn')?.textContent));
await foto(page, 'I3-clique');
await browser.close(); pararEditor();
