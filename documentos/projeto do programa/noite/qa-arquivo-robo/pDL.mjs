// Salvar sem seletor (download) → reabrir o que baixou. Só cliques e teclas.
import { createRequire } from 'node:module';
import { mkdirSync, rmSync, readdirSync } from 'node:fs';
import { subirEditor, pararEditor, esperar, menu, rodape, foto, SAIDA } from './harness.mjs';
const { chromium } = createRequire(import.meta.url)('playwright');
const D = `${SAIDA}/DL`; rmSync(D, { recursive: true, force: true }); mkdirSync(D, { recursive: true });
const url = await subirEditor(5292);
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, acceptDownloads: true });
const page = await ctx.newPage();
await page.addInitScript(() => { delete window.showSaveFilePicker; delete window.showOpenFilePicker; delete window.showDirectoryPicker; });
const baixados = [];
page.on('download', async (d) => { const p = `${D}/${d.suggestedFilename()}`; await d.saveAs(p); baixados.push(p); });
await page.goto(url); await page.waitForSelector('.viewport canvas'); await esperar(800);
await page.getByText('Abrir o herói', { exact: false }).first().click(); await esperar(1200);
await page.keyboard.press('Control+s'); await esperar(4000);
console.log('rodapé:', await rodape(page));
console.log('dica:', await page.evaluate(() => document.querySelector('.status-state').title));
console.log('baixados:', readdirSync(D));
await foto(page, 'DL-1-salvou');
await page.reload(); await page.waitForSelector('.viewport canvas'); await esperar(1200);
const dlg = page.locator('[role=dialog] button:visible', { hasText: /^Apagar o rascunho|^Agora não/ }); if (await dlg.count()) { await dlg.first().click(); await esperar(400); }
const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.keyboard.press('Control+o')]);
await chooser.setFiles(baixados.find((p) => p.endsWith('.bonez')));
await esperar(3000);
console.log('reaberto:', await rodape(page));
await foto(page, 'DL-2-reaberto');
await browser.close(); pararEditor();
