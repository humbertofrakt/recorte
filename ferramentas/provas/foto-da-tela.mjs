// SPDX-License-Identifier: Apache-2.0
// Uma foto da tela do editor, para o Humberto ver sem estar na frente —
// degrau 11 (18/09/2026): um par de fotos, antes e depois, por lote.
//
// O mesmo molde do `medir-paineis.mjs`: sobe o próprio servidor (porta 5193) e
// um Chrome sem janela (9337), com perfil novo, abre o herói, roda o preparo e
// grava o PNG. Desliga os dois no fim.
//
// USO, da raiz do projeto:
//
//   node ferramentas/provas/foto-da-tela.mjs SAIDA.png [--preparo ARQUIVO.js] [--sem-heroi]
//
// O preparo é JavaScript avaliado na página, com `__m.vp` (o painel da cena),
// `__m.acoes` (o registro de ações) e `__m.contrato` à mão. Pode ser `async`:
// o valor da última expressão é esperado. `--sem-heroi` fotografa como abre.

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA_EDITOR = 5193;
const PORTA_CHROME = 9337;
const URL_EDITOR = `http://localhost:${PORTA_EDITOR}/`;
const SAIDA = process.argv[2];
const arg = (nome) => {
  const i = process.argv.indexOf(nome);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : null;
};
const PREPARO = arg('--preparo');
// `--gesto`: o preparo devolve `{ de: [x, y], ate: [x, y] }` e a foto sai COM O
// BOTÃO DO MOUSE AINDA APERTADO no fim do arrasto — é como se fotografa a sombra
// que só existe enquanto a mão segura.
const GESTO = process.argv.includes('--gesto');
// `--programa`: fotografa o editor MONTADO (`programa/`, na mesma porta 5193) em vez do
// código do disco. É a foto de ANTES de um lote já começado: o `programa/` é a
// versão fechada anterior. Sem `__m`: o preparo só tem o DOM e o teclado.
const PROGRAMA = process.argv.includes('--programa');
const SEM_HEROI = process.argv.includes('--sem-heroi') || PROGRAMA;
if (!SAIDA) { console.error('Falta o nome do PNG de saída.'); process.exit(2); }

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const filhos = [];
const encerrar = () => { for (const p of filhos) { try { p.kill(); } catch { /* já saiu */ } } };
process.on('exit', encerrar);

let ws; let proximo = 0; const pendentes = new Map();
const cmd = (method, params = {}) => new Promise((ok) => {
  const id = ++proximo; pendentes.set(id, ok); ws.send(JSON.stringify({ id, method, params }));
});
async function ava(expressao) {
  const r = await cmd('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) {
    const e = r.result.exceptionDetails;
    throw new Error(e.exception?.description ?? e.text ?? 'erro na página');
  }
  return r.result?.result?.value;
}

const janelasNativas = [];
const perfil = mkdtempSync(join(tmpdir(), 'recorte-foto-'));
let codigo = 0;
try {
  filhos.push(PROGRAMA
    ? spawn(process.execPath, [resolve(RAIZ, 'programa/servidor.mjs'), '--sem-navegador', '--porta', String(PORTA_EDITOR)], { cwd: RAIZ, stdio: 'ignore', env: { ...process.env, PORT: String(PORTA_EDITOR), PORTA: String(PORTA_EDITOR) } })
    : spawn(process.execPath, [resolve(RAIZ, 'ferramentas/provas/vite-quieto.mjs'), '--port', String(PORTA_EDITOR)], { cwd: RAIZ, stdio: 'ignore' }));
  let subiu = false;
  for (let i = 0; i < 80 && !subiu; i++) { try { subiu = (await fetch(URL_EDITOR)).ok; } catch { /* subindo */ } if (!subiu) await esperar(250); }
  if (!subiu) throw new Error('o editor não subiu');
  filhos.push(spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1440,900', `--remote-debugging-port=${PORTA_CHROME}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore' }));
  let pagina;
  for (let i = 0; i < 60 && pagina === undefined; i++) {
    try { pagina = (await (await fetch(`http://127.0.0.1:${PORTA_CHROME}/json/list`)).json()).find((t) => t.type === 'page'); } catch { /* subindo */ }
    if (pagina === undefined) await esperar(250);
  }
  if (pagina === undefined) throw new Error('o Chrome headless não abriu');
  ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id !== undefined && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); return; }
    // Janela NATIVA do navegador (`confirm`, `alert`): ela trava a página e
    // não aparece na foto — o Chrome sem tela não a desenha. A foto registra
    // o TEXTO dela e a recusa, para a prova dizer o que havia ali.
    if (m.method === 'Page.javascriptDialogOpening') {
      janelasNativas.push(m.params.message);
      void cmd('Page.handleJavaScriptDialog', { accept: false });
    }
  };
  await cmd('Runtime.enable'); await cmd('Page.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cmd('Page.navigate', { url: URL_EDITOR });
  let montou = false;
  for (let i = 0; i < 80 && !montou; i++) {
    await esperar(250);
    try { montou = await ava(`!!document.querySelector('canvas.viewport-canvas')`); } catch { /* carregando */ }
  }
  if (!montou) throw new Error('o editor não montou');
  await esperar(600);
  if (!PROGRAMA) await ava(`(async () => { window.__m = {
    vp: (await import('/src/viewport/viewport.ts')).viewportPanel,
    acoes: await import('/src/ui/actions.ts'),
    contrato: await import('/src/contract.ts'),
  }; return true; })()`);
  if (!SEM_HEROI) {
    await ava(`__m.acoes.runAction('abrir-exemplo')`);
    for (let i = 0; i < 40; i++) { if (await ava('(__m.vp.doc.file.slots ?? []).length > 0')) break; await esperar(150); }
  }
  if (PREPARO !== null) {
    const r = await ava(readFileSync(resolve(PREPARO), 'utf8'));
    if (r !== undefined) console.log(`preparo: ${JSON.stringify(r)}`);
    // `--gesto` com `de` e sem `ate`: só leva o PONTEIRO até lá (para
    // fotografar um submenu, que abre com o ponteiro em cima).
    if (GESTO && r?.de && !r?.ate) {
      await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.de[0], y: r.de[1] });
      await esperar(400);
    }
    if (GESTO && r?.de && r?.ate) {
      const [x0, y0] = r.de; const [x1, y1] = r.ate;
      await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0, y: y0 });
      await cmd('Input.dispatchMouseEvent', { type: 'mousePressed', x: x0, y: y0, button: 'left', buttons: 1, clickCount: 1 });
      for (let i = 1; i <= 12; i++) {
        await cmd('Input.dispatchMouseEvent', { type: 'mouseMoved', x: x0 + ((x1 - x0) * i) / 12, y: y0 + ((y1 - y0) * i) / 12, button: 'left', buttons: 1 });
        await esperar(20);
      }
      // `--soltar`: a foto sai DEPOIS de a mão soltar (o painel já colado).
      if (process.argv.includes('--soltar')) {
        await cmd('Input.dispatchMouseEvent', { type: 'mouseReleased', x: x1, y: y1, button: 'left', buttons: 0, clickCount: 1 });
      }
    }
  }
  // `--recarregar`: depois do preparo, recarrega a página e espera de novo.
  // É como se fotografa o que só acontece AO ABRIR — a janela de recuperar o
  // rascunho, por exemplo. O preparo não pode recarregar sozinho: a avaliação
  // dele morreria junto com a página.
  if (process.argv.includes('--recarregar')) {
    await cmd('Page.navigate', { url: URL_EDITOR });
    let voltou = false;
    for (let i = 0; i < 80 && !voltou; i++) {
      await esperar(250);
      try { voltou = await ava(`!!document.querySelector('canvas.viewport-canvas')`); } catch { /* carregando */ }
    }
    if (!voltou) throw new Error('a página não voltou depois de recarregar');
    await esperar(800);
  }
  await esperar(500);
  const foto = await cmd('Page.captureScreenshot', { format: 'png' });
  mkdirSync(dirname(resolve(SAIDA)), { recursive: true });
  writeFileSync(resolve(SAIDA), Buffer.from(foto.result.data, 'base64'));
  console.log(`foto: ${SAIDA}`);
  if (janelasNativas.length > 0) {
    console.log(`janela(s) NATIVA(s) do navegador, que não aparecem na foto: ${janelasNativas.map((t) => JSON.stringify(t)).join(' | ')}`);
  }
} catch (erro) {
  console.error(`A foto não saiu: ${erro instanceof Error ? erro.message : String(erro)}`);
  codigo = 2;
} finally {
  try { ws?.close(); } catch { /* fechado */ }
  encerrar();
  await esperar(300);
  try { rmSync(perfil, { recursive: true, force: true }); } catch { /* o Chrome segura algum arquivo */ }
}
process.exit(codigo);
