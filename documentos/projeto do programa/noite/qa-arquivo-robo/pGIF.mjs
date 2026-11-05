import { subirEditor, abrir, esperar, pararEditor, menu, rodape, SAIDA, campo, clicar } from './harness.mjs';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
const D = `${SAIDA}/GIF`; rmSync(D, { recursive: true, force: true }); mkdirSync(D, { recursive: true });
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: D });
await menu(page, 'Arquivo', 'Abrir o herói');
for (const anim of ['walk', 'attack']) {
  await menu(page, 'Arquivo', 'Exportar', 'GIF, PNG'); await esperar(400);
  await campo(page, 'Animação').selectOption({ label: anim });
  await page.locator('[role=dialog] button', { hasText: /^Exportar$/ }).click(); await esperar(3000);
  console.log(anim, '→', (await rodape(page)).split(' | ')[0]);
  await clicar(page, /^Fechar/);
}
console.log('downloads:', readdirSync(D));
await browser.close(); pararEditor();
