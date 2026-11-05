// I: soltar uma pasta na cena (a alça e as entradas, como o Chrome entrega)
import { subirEditor, abrir, foto, log, esperar, pararEditor, menu, rodape, fila, SAIDA, janelaTexto, clicar } from './harness.mjs';
import { cpSync, mkdirSync, rmSync, readdirSync } from 'node:fs';
const L = Number(process.argv[2] ?? 1920), A = Number(process.argv[3] ?? 1080);
const D = `${SAIDA}/I-${L}`; rmSync(D, { recursive: true, force: true }); mkdirSync(D, { recursive: true });
cpSync('/home/user/recorte/exemplo/game/mao', `${D}/mao`, { recursive: true });
cpSync('/home/user/recorte/exemplo/game', `${D}/game`, { recursive: true });
const url = await subirEditor(5292);
const { browser, page } = await abrir({ url, largura: L, altura: A, dirDownload: `${D}/dl` });
const soltar = (path) => page.evaluate(async (p) => {
  const entry = await window.__entrada(p);
  const handle = window.__dirHandle(p);
  const item = { kind: 'file', type: '', webkitGetAsEntry: () => entry, getAsFileSystemHandle: async () => handle, getAsFile: () => null };
  const dt = { items: Object.assign([item], { length: 1 }), files: Object.assign([], { length: 0, item: () => null }), types: ['Files'], getData: () => '', dropEffect: 'copy', effectAllowed: 'all' };
  const canvas = document.querySelector('.viewport canvas');
  const r = canvas.getBoundingClientRect();
  for (const tipo of ['dragenter', 'dragover', 'drop']) {
    const ev = new Event(tipo, { bubbles: true, cancelable: true });
    Object.defineProperty(ev, 'dataTransfer', { value: dt });
    Object.defineProperty(ev, 'clientX', { value: r.left + r.width / 2 });
    Object.defineProperty(ev, 'clientY', { value: r.top + r.height / 2 });
    canvas.dispatchEvent(ev);
  }
  return true;
}, path);
const info = () => page.evaluate(async () => { const d = (await import('/src/viewport/viewport.ts')).viewportPanel.doc; return { slots: d.file.slots?.length, anims: (d.file.animations ?? []).length, dirty: d.dirty, path: d.path }; });
const passo = async (n) => { await esperar(1500); const j = await janelaTexto(page); console.log(`## ${n}\n   rodapé: ${await rodape(page)}\n   ${JSON.stringify(await info())} imagens na aba: ${await page.locator('.imagens-linha').count()}\n   janela: ${j?.replace(/\n+/g, ' / ').slice(0, 500)}\n   log: ${log.splice(0).join(' ; ').slice(0, 400)}`); await foto(page, `I${L}-${n}`); return j; };
await soltar(`${D}/mao`);
let j = await passo('1-soltou-mao');
if (j) { await page.locator('[role=dialog] button:visible').first().click(); await passo('1b'); }
await soltar(`${D}/game`);
await esperar(8000); j = await passo('2-soltou-game');
for (let i = 0; i < 4 && j; i++) { if (!(await clicar(page, /^Descartar|^bcp\.scml$|^Abrir com as imagens|^Fechar/))) break; await esperar(4000); j = await passo(`2-${i}`); }
await browser.close(); pararEditor();
