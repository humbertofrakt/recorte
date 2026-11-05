// Robô do QA de arquivo: sobe o editor (vite-quieto), um Chromium sem janela,
// e liga os seletores de arquivo do navegador a pastas REAIS do disco.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs';
import { join, basename, dirname, resolve } from 'node:path';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

export const RAIZ = process.env.RECORTE ?? process.cwd();
export const SAIDA = '' + (process.env.QA_SAIDA ?? '/tmp/qa-arquivo') + '';
export const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

let vite = null;
export async function subirEditor(porta = 5291) {
  try { const r = await fetch(`http://localhost:${porta}/`); if (r.ok) return `http://localhost:${porta}/`; } catch {}
  vite = spawn(process.execPath, [join(RAIZ, 'ferramentas/provas/vite-quieto.mjs'), '--port', String(porta)], { cwd: RAIZ, stdio: 'inherit' });
  for (let i = 0; i < 120; i++) {
    try { const r = await fetch(`http://localhost:${porta}/`); if (r.ok) return `http://localhost:${porta}/`; } catch {}
    await esperar(250);
  }
  throw new Error('editor não subiu');
}
export function pararEditor() { try { vite?.kill(); } catch {} }

/** A fila do seletor: o próximo show*Picker devolve o que está aqui. */
export const fila = [];
export const log = [];

const FS_SHIM = String.raw`
(() => {
  const b64 = (u8) => { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); };
  const unb64 = (s) => { const b = atob(s); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  const mime = (n) => n.endsWith('.png') ? 'image/png' : n.endsWith('.json') ? 'application/json' : n.endsWith('.gif') ? 'image/gif' : n.endsWith('.psd') ? 'image/vnd.adobe.photoshop' : '';
  const fileHandle = (path) => {
    const h = {
      kind: 'file', name: path.split('/').pop(), __path: path,
      async getFile() {
        const r = await window.__fs('read', path);
        if (r === null) throw new DOMException('não há ' + path, 'NotFoundError');
        return new File([unb64(r.b64)], h.name, { type: mime(h.name), lastModified: r.mtime });
      },
      async createWritable() {
        const partes = [];
        return {
          async write(d) {
            if (d && typeof d === 'object' && 'type' in d && d.type === 'write') d = d.data;
            if (typeof d === 'string') partes.push(new TextEncoder().encode(d));
            else if (d instanceof Blob) partes.push(new Uint8Array(await d.arrayBuffer()));
            else if (d instanceof ArrayBuffer) partes.push(new Uint8Array(d));
            else if (ArrayBuffer.isView(d)) partes.push(new Uint8Array(d.buffer, d.byteOffset, d.byteLength));
            else throw new Error('write: tipo desconhecido');
          },
          async truncate() {}, async seek() {},
          async close() {
            const total = partes.reduce((n, p) => n + p.length, 0);
            const u = new Uint8Array(total); let o = 0; for (const p of partes) { u.set(p, o); o += p.length; }
            await window.__fs('write', path, b64(u));
          },
          async abort() {},
        };
      },
      async queryPermission() { return 'granted'; }, async requestPermission() { return 'granted'; },
      async isSameEntry(o) { return o && o.__path === path; },
    };
    return h;
  };
  const dirHandle = (path) => {
    const h = {
      kind: 'directory', name: path.split('/').pop(), __path: path,
      async *entries() { for (const e of await window.__fs('list', path)) yield [e.name, e.dir ? dirHandle(path + '/' + e.name) : fileHandle(path + '/' + e.name)]; },
      async *values() { for await (const [, v] of h.entries()) yield v; },
      async *keys() { for await (const [k] of h.entries()) yield k; },
      [Symbol.asyncIterator]() { return h.entries(); },
      async getFileHandle(n, o) {
        const st = await window.__fs('stat', path + '/' + n);
        if (st === 'dir') throw new DOMException(n + ' é pasta', 'TypeMismatchError');
        if (st === null) { if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError'); await window.__fs('write', path + '/' + n, ''); }
        return fileHandle(path + '/' + n);
      },
      async getDirectoryHandle(n, o) {
        const st = await window.__fs('stat', path + '/' + n);
        if (st === 'file') throw new DOMException(n + ' é arquivo', 'TypeMismatchError');
        if (st === null) { if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError'); await window.__fs('mkdir', path + '/' + n); }
        return dirHandle(path + '/' + n);
      },
      async removeEntry(n) { await window.__fs('rm', path + '/' + n); },
      async resolve(alvo) { if (!alvo || !alvo.__path || !alvo.__path.startsWith(path + '/')) return null; return alvo.__path.slice(path.length + 1).split('/'); },
      async isSameEntry(o) { return o && o.__path === path; },
      async queryPermission() { return 'granted'; }, async requestPermission() { return 'granted'; },
    };
    return h;
  };
  window.__fileHandle = fileHandle; window.__dirHandle = dirHandle;
  const pick = async (tipo, opts) => {
    const r = await window.__fs('pick', tipo, JSON.stringify(opts ?? {}));
    if (r === null) throw new DOMException('O usuário cancelou', 'AbortError');
    return r;
  };
  window.showDirectoryPicker = async (o) => dirHandle(await pick('dir', o));
  window.showSaveFilePicker = async (o) => fileHandle(await pick('save', o));
  window.showOpenFilePicker = async (o) => (await pick('open', o)).map(fileHandle);
  // Uma pasta solta como o Chrome a entrega: webkitGetAsEntry e getAsFileSystemHandle.
  window.__entrada = (path) => {
    const nome = path.split('/').pop();
    return (async () => {
      const st = await window.__fs('stat', path);
      const fazer = async (p, full) => {
        const s = await window.__fs('stat', p);
        if (s === 'dir') {
          const filhos = await window.__fs('list', p);
          return { isFile: false, isDirectory: true, name: p.split('/').pop(), fullPath: full,
            createReader() { let dado = false; return { readEntries(ok, fail) {
              if (dado) { ok([]); return; } dado = true;
              Promise.all(filhos.map((f) => fazer(p + '/' + f.name, full + '/' + f.name))).then(ok, fail);
            } }; } };
        }
        return { isFile: true, isDirectory: false, name: p.split('/').pop(), fullPath: full,
          file(ok, fail) { fileHandle(p).getFile().then(ok, fail); } };
      };
      return fazer(path, '/' + nome);
    })();
  };
})();
`;

export async function abrir({ largura = 1920, altura = 1080, url, dirDownload } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: largura, height: altura }, acceptDownloads: true });
  const page = await context.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => log.push(`[pageerror] ${e.message}`));
  page.on('dialog', async (d) => { log.push(`[dialog ${d.type()}] ${d.message()}`); await d.accept(); });
  const downloads = [];
  page.on('download', async (d) => {
    const alvo = join(dirDownload ?? join(SAIDA, 'downloads'), d.suggestedFilename());
    mkdirSync(dirname(alvo), { recursive: true });
    await d.saveAs(alvo);
    downloads.push(alvo);
    log.push(`[download] ${alvo}`);
  });
  await page.exposeFunction('__fs', async (op, p, dado) => {
    try {
      switch (op) {
        case 'read': { if (!existsSync(p)) return null; return { b64: readFileSync(p).toString('base64'), mtime: statSync(p).mtimeMs }; }
        case 'write': mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, Buffer.from(dado, 'base64')); log.push(`[grava] ${p}`); return true;
        case 'list': return readdirSync(p, { withFileTypes: true }).map((e) => ({ name: e.name, dir: e.isDirectory() }));
        case 'stat': if (!existsSync(p)) return null; return statSync(p).isDirectory() ? 'dir' : 'file';
        case 'mkdir': mkdirSync(p, { recursive: true }); return true;
        case 'rm': rmSync(p, { recursive: true, force: true }); return true;
        case 'pick': {
          const proximo = fila.shift();
          log.push(`[seletor ${p}] ${dado} -> ${JSON.stringify(proximo ?? null)}`);
          if (proximo === undefined || proximo === null) return null;
          return proximo;
        }
      }
    } catch (e) { log.push(`[fs erro] ${op} ${p}: ${e.message}`); throw e; }
    return null;
  });
  await page.addInitScript(FS_SHIM);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForSelector('.viewport canvas', { timeout: 30000 });
  await esperar(800);
  return { browser, context, page, downloads };
}

/** Abre um menu do topo e clica numa entrada pelo texto (submenus pelo meio). */
export async function menu(page, ...caminho) {
  const topo = page.locator('.menu-bar .menu-button').filter({ hasText: new RegExp('^\\s*' + esc(caminho[0]) + '\\s*$') }).first();
  await topo.click();
  await esperar(200);
  for (let i = 1; i < caminho.length; i++) {
    const item = page.locator('.menu-item:visible').filter({ has: page.locator('.menu-name', { hasText: new RegExp('^\\s*' + esc(caminho[i])) }) }).last();
    await item.waitFor({ state: 'visible', timeout: 5000 });
    if (i < caminho.length - 1) { await item.hover(); await esperar(250); if (!(await page.locator('.menu-item:visible').filter({ has: page.locator('.menu-name', { hasText: new RegExp('^\\s*' + esc(caminho[i+1])) }) }).count())) { await item.click(); await esperar(250); } }
    else await item.click();
  }
  await esperar(300);
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export async function rodape(page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('.status-state, .status-warn')];
    return els.map((e) => e.textContent.trim()).filter(Boolean).join(' | ');
  });
}

export async function foto(page, nome) {
  mkdirSync(join(SAIDA, 'fotos'), { recursive: true });
  const p = join(SAIDA, 'fotos', nome + '.png');
  await page.screenshot({ path: p });
  return p;
}

/** O controle logo depois do rótulo, na janela aberta. */
export function campo(page, rotulo) {
  return page.locator(`xpath=//*[@role='dialog']//label[normalize-space()='${rotulo}']/following::*[self::input or self::select][1]`).last();
}
export async function janelaTexto(page) {
  return page.evaluate(() => { const d = [...document.querySelectorAll('[role=dialog]')].filter(e => e.getClientRects().length).pop(); return d ? d.innerText : null; });
}
/** Clica no botão da janela aberta cujo texto casa; devolve se achou. */
export async function clicar(page, re) {
  const b = page.locator('[role=dialog] button:visible', { hasText: re });
  if (!(await b.count())) return false;
  await b.first().click(); await esperar(400); return true;
}
