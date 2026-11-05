// O: soltar uma folha do Aseprite (fogo.png + fogo.json) na cena; salvar; validar; exportar a animação
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { mkdirSync, rmSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const D = `${SAIDA}/O`; rmSync(D, { recursive: true, force: true }); mkdirSync(`${D}/src`, { recursive: true }); mkdirSync(`${D}/proj`);
execFileSync('python3', ['-c', `
from PIL import Image, ImageDraw
im = Image.new('RGBA', (128, 32), (0,0,0,0)); d = ImageDraw.Draw(im)
cores = [(255,60,0,255),(255,140,0,255),(255,220,0,255),(255,100,0,255)]
for i,c in enumerate(cores): d.ellipse([i*32+4, 4+i*2, i*32+28, 28], fill=c)
im.save('${D}/src/fogo.png')
`]);
const frames = {}; for (let i = 0; i < 4; i++) frames[`fogo ${i}.aseprite`] = { frame: { x: i * 32, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, duration: 100 };
writeFileSync(`${D}/src/fogo.json`, JSON.stringify({ frames, meta: { app: 'https://www.aseprite.org/', version: '1.3', image: 'fogo.png', format: 'RGBA8888', size: { w: 128, h: 32 }, scale: '1', frameTags: [{ name: 'queimar', from: 0, to: 3, direction: 'forward' }] } }, null, 1));
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
await clicar(page, /Começar vazio/);
fila.push(`${D}/proj`);
await page.evaluate(async (paths) => {
  const items = [];
  for (const p of paths) { const entry = await window.__entrada(p); const file = await window.__fileHandle(p).getFile(); items.push({ kind: 'file', type: file.type, webkitGetAsEntry: () => entry, getAsFile: () => file, getAsFileSystemHandle: async () => window.__fileHandle(p) }); }
  const files = items.map((i) => i.getAsFile());
  const dt = { items: Object.assign(items, { length: items.length }), files: Object.assign(files, { item: (i) => files[i] }), types: ['Files'], getData: () => '', dropEffect: 'copy', effectAllowed: 'all' };
  const canvas = document.querySelector('.viewport canvas'); const r = canvas.getBoundingClientRect();
  for (const tipo of ['dragenter', 'dragover', 'drop']) { const ev = new Event(tipo, { bubbles: true, cancelable: true }); Object.defineProperty(ev, 'dataTransfer', { value: dt }); Object.defineProperty(ev, 'clientX', { value: r.left + r.width / 2 }); Object.defineProperty(ev, 'clientY', { value: r.top + r.height / 2 }); canvas.dispatchEvent(ev); }
}, [`${D}/src/fogo.png`, `${D}/src/fogo.json`]);
await esperar(2000);
console.log('janela:', (await janelaTexto(page))?.replace(/\n+/g, ' / ').slice(0, 400));
let j = await janelaTexto(page); for (let i = 0; i < 3 && j; i++) { await page.locator('[role=dialog] button:visible').first().click(); await esperar(1200); console.log('janela', i, (j = await janelaTexto(page))?.replace(/\n+/g, ' / ').slice(0, 300)); }
console.log('rodapé', await rodape(page));
console.log(await page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return JSON.stringify({ slots: d.file.slots, anims: d.file.animations?.map(a => [a.name, a.duration, a.timelines?.length]), regions: d.atlases.map(a => a.regions.map(r => r.name)) }).slice(0, 700); }));
await foto(page, 'O-aseprite');
await page.keyboard.press('Control+s'); await esperar(1000); await clicar(page, /Escolher a pasta/); await esperar(3000);
console.log('rodapé', await rodape(page), '\nproj', readdirSync(`${D}/proj`));
console.log(log.filter(l => !l.startsWith('[grava]')).join('\n').slice(0, 600));
await browser.close(); pararEditor();
