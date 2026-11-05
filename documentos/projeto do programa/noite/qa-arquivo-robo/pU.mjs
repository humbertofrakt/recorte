import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { cpSync, mkdirSync, rmSync } from 'node:fs';
const D = `${SAIDA}/U`; rmSync(D, { recursive: true, force: true }); mkdirSync(D, { recursive: true });
cpSync('/home/user/recorte/formato/exemplos/heroi.psd', `${D}/heroi.psd`);
cpSync(`${SAIDA}/E-1920/out/heroi.bonez`, `${D}/heroi.bonez`); cpSync(`${SAIDA}/E-1920/out/heroi.boneb`, `${D}/heroi.boneb`);
cpSync('/home/user/recorte/exemplo/game/bcp.scml', `${D}/bcp.scml`);
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, dirDownload: `${D}/dl` });
const soltar = (paths) => page.evaluate(async (ps) => {
  const items = [];
  for (const p of ps) { const entry = await window.__entrada(p); const file = await window.__fileHandle(p).getFile(); items.push({ kind: 'file', type: file.type, webkitGetAsEntry: () => entry, getAsFile: () => file, getAsFileSystemHandle: async () => window.__fileHandle(p) }); }
  const files = items.map((i) => i.getAsFile());
  const dt = { items: Object.assign(items, { length: items.length }), files: Object.assign(files, { item: (i) => files[i] }), types: ['Files'], getData: () => '', dropEffect: 'copy', effectAllowed: 'all' };
  const canvas = document.querySelector('.viewport canvas'); const r = canvas.getBoundingClientRect();
  for (const tipo of ['dragenter', 'dragover', 'drop']) { const ev = new Event(tipo, { bubbles: true, cancelable: true }); Object.defineProperty(ev, 'dataTransfer', { value: dt }); Object.defineProperty(ev, 'clientX', { value: r.left + r.width / 2 }); Object.defineProperty(ev, 'clientY', { value: r.top + r.height / 2 }); canvas.dispatchEvent(ev); }
}, paths);
const info = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return { bones: d.file.bones?.length, slots: d.file.slots?.length, anims: (d.file.animations ?? []).length, pages: d.atlases.flatMap(a => a.pages.map(p => !!d.imageFor(p))), dirty: d.dirty, path: d.path }; });
const passo = async (n) => { await esperar(2500); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   ${JSON.stringify(await info())}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 400)}`); await foto(page, `U-${n}`); for (let i = 0; i < 3; i++) { if (!(await janelaTexto(page))) break; await clicar(page, /^Descartar|^Fechar|^Substituir/) || await page.locator('[role=dialog] button:visible').last().click(); await esperar(1500); } };
await clicar(page, /Começar vazio/);
await soltar([`${D}/heroi.psd`]); await passo('1-psd');
await soltar([`${D}/heroi.bonez`]); await passo('2-bonez');
await soltar([`${D}/heroi.boneb`]); await passo('3-boneb');
await soltar([`${D}/bcp.scml`]); await passo('4-scml-sozinho');
await browser.close(); pararEditor();
