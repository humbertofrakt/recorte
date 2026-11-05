// SPDX-License-Identifier: Apache-2.0
// Uma imagem em DOIS ossos, do começo ao fim, sem ninguém — lote 69.
//
// O Humberto, 12/09/2026: "não consigo usar peso de forma decente. Pega uma
// imagem e liga a dois ossos. O sistema não está completo". O plano está em
// `documentos/planos/PLANO pesos - imagem em dois ossos 2026-09-12.md`, e o
// "Pronto quando" dele é exatamente o que este script faz, no editor de
// verdade: escolher a malha, apertar **Ligar**, clicar nos DOIS ossos na cena,
// fechar, **Pesos automáticos** — e a malha nunca sai da tela no meio.
//
// COMO (o mesmo jeito do `roteiro-30.mjs`, lote 67)
//
// - **Chrome headless**, dirigido por CDP: o painel do navegador da automação
//   não compõe quadros.
// - O script sobe o **próprio servidor** do editor (porta 5192) e o **próprio
//   Chrome** (porta 9336), com um perfil novo. Os dois morrem no fim.
// - Clique e tecla vão como **eventos de verdade** (`Input.dispatchMouseEvent`,
//   `Input.dispatchKeyEvent`): passam pela cena, pelas ferramentas e pela aba
//   como os do Humberto passariam.
// - O esqueleto do ensaio entra por `doc.setFile`, que é a mesma porta do
//   Abrir: dois ossos em fila e uma malha comprida em cima dos dois. Sem
//   imagem — a malha e os ossos se desenham e se pegam sem atlas nenhum.
// - Para conferir, lê o documento pela cena (`viewportPanel.doc`). Só lê.
//
// USO, da raiz do projeto:
//
//   npm run pesos
//   node ferramentas/provas/pesos-dois-ossos.mjs --foto FOTO.png
//
// Sai uma linha por passo e, no fim, o console da página. Código 1 quando
// algum passo não passou.

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..');
// No Linux (as sessões na nuvem), o Chromium do Playwright, sem sandbox:
// roda como root. No Windows, o Chrome do Humberto, como sempre.
const CHROME = process.env.CHROME ?? (process.platform === 'linux'
  ? '/opt/pw-browsers/chromium'
  : 'C:/Program Files/Google/Chrome/Application/chrome.exe');
const SEM_SANDBOX = process.platform === 'linux' ? ['--no-sandbox'] : [];
const PORTA_EDITOR = 5192;
const PORTA_CHROME = 9336;
const URL_EDITOR = `http://localhost:${PORTA_EDITOR}/`;
const FOTO = (() => {
  const i = process.argv.indexOf('--foto');
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null;
})();

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const filhos = [];

// ---------------------------------------------------------------------------
// O esqueleto do ensaio: dois ossos em fila, uma malha comprida em cima deles
// ---------------------------------------------------------------------------

const ARQUIVO = {
  bone: { version: '1.0', minVersion: '1.0', generator: 'prova' },
  skeleton: { name: 'ensaio', fps: 30 },
  bones: [
    { name: 'root' },
    { name: 'arm', parent: 'root', length: 80 },
    { name: 'forearm', parent: 'arm', x: 80, length: 80 },
  ],
  slots: [{ name: 'pele', bone: 'root', attachment: 'pele' }],
  skins: [{
    name: 'default',
    attachments: {
      pele: {
        pele: {
          type: 'mesh',
          path: 'pele',
          vertices: [0, -20, 80, -20, 160, -20, 160, 20, 80, 20, 0, 20],
          uvs: [0, 1, 0.5, 1, 1, 1, 1, 0, 0.5, 0, 0, 0],
          triangles: [0, 1, 4, 0, 4, 5, 1, 2, 3, 1, 3, 4],
          hull: 6,
          width: 160,
          height: 40,
        },
      },
    },
  }],
};

// ---------------------------------------------------------------------------
// As ajudantes que moram dentro da página
// ---------------------------------------------------------------------------

const AJUDANTES = String.raw`
window.__p = (() => {
  const p = {};
  p.carregar = async () => {
    p.vp = (await import('/src/viewport/viewport.ts')).viewportPanel;
    p.registro = await import('/src/viewport/tools/registry.ts');
    p.pesos = await import('/src/viewport/tools/weights-tool.ts');
    p.modelo = await import('/src/panels/mesh-panel-model.ts');
    return true;
  };
  p.doc = () => p.vp.doc;
  p.q = (s) => [...document.querySelectorAll(s)];
  p.tela = (x, y) => {
    const c = p.vp.canvas.getBoundingClientRect();
    const t = p.vp.camera.worldToScreen(x, y);
    return { x: c.left + t.x, y: c.top + t.y };
  };
  p.centro = (el) => {
    // A aba rola: sem trazer o botão para dentro da coluna, o clique de
    // verdade cairia fora da tela.
    el.scrollIntoView({ block: 'center' });
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2, largura: b.width, altura: b.height };
  };
  p.focarCena = () => { const v = document.querySelector('.viewport'); v?.focus(); return document.activeElement === v; };
  p.ferramenta = () => p.registro.getActiveToolId();
  /** Abre uma aba pelo nome escrito nela. */
  p.abrirAba = (nome) => {
    const aba = p.q('.panel-column .panel-tab').find((t) => t.textContent.trim() === nome);
    if (!aba) return false;
    aba.click();
    return true;
  };
  /** Um botão da aba Malha e pesos, pelo nome exato ou pela dica exata. */
  // Rodada 47, lote 5: a aba Malha dobra Forma, Ossos e Pesos (abre a da
  // ferramenta). Um botão dentro de uma seção dobrada pede o clique no título,
  // como a pessoa faria: este ajudante abre a dobra antes de devolver o botão.
  p.abrirDobraDe = (botao) => {
    const secao = botao?.closest('.malha-dobra.is-dobrada');
    secao?.querySelector(':scope > .malha-secao-titulo')?.click();
  };
  p.botao = (nome) => p.q('.painel button').find((b) => {
    const dica = (b.getAttribute('aria-label') || '').trim();
    const texto = (b.textContent || '').trim();
    return dica === nome || texto === nome;
  }) ?? null;
  /** A linha da Árvore de um osso ou desenho, pelo nome. */
  p.linha = (nome) => p.q('.arvore-item').find((b) => (b.querySelector('.arvore-nome')?.textContent ?? '').trim() === nome) ?? null;
  /** O que a aba mostra da lista Ossos que influenciam: nome, %, cor. */
  p.lista = () => p.q('.malha-osso').map((li) => ({
    nome: (li.querySelector('.malha-osso-nome')?.textContent ?? '').trim(),
    conta: (li.querySelector('.malha-osso-conta')?.textContent ?? '').trim(),
    cor: li.querySelector('.malha-osso-cor')?.style.background ?? '',
  }));
  /** A malha como está no arquivo. */
  p.malha = () => p.doc().file.skins[0].attachments.pele.pele;
  p.selecao = () => {
    const s = p.doc().selection;
    return { ossos: s.bones.slice(), anexos: s.attachments.map((a) => a.slot + '/' + a.attachment) };
  };
  p.recado = () => (document.querySelector('.rodape-recado')?.textContent ?? document.body.innerText.includes('Clique nos ossos que puxam esta malha') ? 'sim' : 'nao');
  // Rodada 41, lote 4: a linha "Escolha a ferramenta" saiu da aba antes da
  // rodada 41 (o Ligar vale com qualquer ferramenta desde o lote 70). O passo
  // que a procurava passou a provar o que a aba mostra de verdade.
  p.formaComVertices = () => p.q('.malha-secao-titulo').some((n) => n.textContent.trim() === 'Forma' && /vértices/.test(n.title || ''));
  return p;
})();
`;

// ---------------------------------------------------------------------------
// Subir o editor e o Chrome
// ---------------------------------------------------------------------------

async function subirEditor() {
  const vite = spawn(process.execPath, [
    resolve(RAIZ, 'ferramentas/provas/vite-quieto.mjs'),
    '--port', String(PORTA_EDITOR),
  ], { cwd: RAIZ, stdio: 'ignore' });
  filhos.push(vite);
  for (let i = 0; i < 80; i++) {
    try {
      const r = await fetch(URL_EDITOR);
      if (r.ok) return;
    } catch { /* ainda subindo */ }
    await esperar(250);
  }
  throw new Error(`o editor não subiu em ${URL_EDITOR}`);
}

async function subirChrome(perfil) {
  const chrome = spawn(CHROME, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    ...SEM_SANDBOX,
    '--window-size=1440,900', `--remote-debugging-port=${PORTA_CHROME}`, `--user-data-dir=${perfil}`,
    '--no-first-run', '--no-default-browser-check', 'about:blank',
  ], { stdio: 'ignore' });
  filhos.push(chrome);
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORTA_CHROME}/json/list`);
      const pagina = (await r.json()).find((t) => t.type === 'page');
      if (pagina !== undefined) return pagina;
    } catch { /* ainda subindo */ }
    await esperar(250);
  }
  throw new Error('o Chrome headless não abriu');
}

const perfil = mkdtempSync(resolve(tmpdir(), 'recorte-pesos-'));
await subirEditor();
const pagina = await subirChrome(perfil);

const ws = new WebSocket(pagina.webSocketDebuggerUrl);
await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });

let id = 0;
const pendentes = new Map();
const consolePagina = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id !== undefined && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') {
    consolePagina.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')}`);
  }
  if (m.method === 'Log.entryAdded') consolePagina.push(`${m.params.entry.level}: ${m.params.entry.text}`);
  if (m.method === 'Runtime.exceptionThrown') {
    consolePagina.push(`exceção: ${m.params.exceptionDetails.text ?? m.params.exceptionDetails.exception?.description ?? ''}`);
  }
};
function cmd(method, params = {}) {
  const meu = ++id;
  return new Promise((ok) => { pendentes.set(meu, ok); ws.send(JSON.stringify({ id: meu, method, params })); });
}
async function ava(expr) {
  const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return { erro: r.result.exceptionDetails.text };
  return r.result?.result?.value;
}

await cmd('Runtime.enable');
await cmd('Log.enable');
await cmd('Page.enable');
await cmd('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
await cmd('Page.navigate', { url: URL_EDITOR });

let pronto = false;
for (let i = 0; i < 80; i++) {
  pronto = await ava("!!document.querySelector('canvas.viewport-canvas')");
  if (pronto === true) break;
  await esperar(250);
}
if (pronto !== true) throw new Error('o editor não montou em 20 s');
await esperar(800);
await ava(AJUDANTES);
await ava('__p.carregar()');

// Os gestos, como eventos de verdade.
async function mouse(type, x, y, extra = {}) {
  await cmd('Input.dispatchMouseEvent', {
    type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra,
  });
}
async function clicar(ponto, extra = {}) {
  await mouse('mouseMoved', ponto.x, ponto.y, { buttons: 0, ...extra });
  await mouse('mousePressed', ponto.x, ponto.y, extra);
  await mouse('mouseReleased', ponto.x, ponto.y, extra);
  await esperar(140);
}
async function tecla(key, code, vk) {
  const base = { key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk };
  await cmd('Input.dispatchKeyEvent', { type: 'keyDown', ...base, text: key.length === 1 ? key : undefined });
  await cmd('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await esperar(120);
}
const noMundo = (x, y) => ava(`__p.tela(${x}, ${y})`);

// ---------------------------------------------------------------------------
// Os passos
// ---------------------------------------------------------------------------

const passos = [];
const anotar = (nome, saiu) => { passos.push({ nome, saiu }); };

// 1. O esqueleto do ensaio entra, e a cena mostra ele inteiro.
await ava(`(async () => {
  __p.doc().setFile(${JSON.stringify(ARQUIVO)});
  // A cena inteira à vista: o ensaio é 160 x 40 em volta da origem.
  __p.vp.camera.fit({ x: -40, y: -80, width: 240, height: 160 });
  return true;
})()`);
await esperar(500);
anotar('Abre o ensaio: dois ossos e uma malha em cima dos dois',
  (await ava('__p.doc().file.bones.length')) === 3 ? true : 'o arquivo não entrou');

// 2. A aba Malha e pesos aberta, e a ferramenta de ABERTURA na mão. É o caso
//    do Humberto: ele abre o programa e vai direto ligar os ossos, sem trocar
//    de ferramenta. Na v11.6 o clique no osso não ligava nada por causa disso.
await ava('__p.focarCena()');
anotar('A ferramenta de abertura na mão, sem trocar nada',
  (await ava('__p.ferramenta()')) === 'transform' ? true : `a ferramenta é ${await ava('__p.ferramenta()')}`);
anotar('Abre a aba Malha e pesos', (await ava("__p.abrirAba('Malha e pesos')")) === true ? true : 'sem a aba');
await esperar(300);

// 3. Escolhe o desenho na Árvore. Com Pesos na mão, a linha do osso não pode
//    derrubar o desenho — mas primeiro é o desenho que se escolhe.
await ava("__p.doc().select({ bones: [], slots: ['pele'], attachments: [{ slot: 'pele', attachment: 'pele' }], constraints: [], vertices: [] })");
await esperar(300);
anotar('A malha escolhida, com o Transformar na mão: a aba mostra a Forma com a conta dos vértices',
  (await ava('__p.formaComVertices()')) === true ? true : 'a aba não mostra a Forma da malha escolhida');

// 4. O botão Ligar abre o modo.
anotar('O botão Ligar existe na aba', (await ava("!!__p.botao('Ligar ossos')")) === true ? true : 'sem o botão Ligar');
// Rodada 47, lote 5: com o Transformar na mão a seção Ossos nasce dobrada; um clique no título a abre.
await ava("__p.abrirDobraDe(__p.botao('Ligar ossos')); true");
await esperar(200);
await clicar(await ava("__p.centro(__p.botao('Ligar ossos'))"));
anotar('Ligar abre o modo', (await ava('__p.modelo.bindModeOpen()')) === true ? true : 'o modo não abriu');

// 5. Clica nos DOIS ossos, na cena.
await clicar(await noMundo(40, 0));
await esperar(200);
// O segundo pela ÁRVORE — o plano diz "na cena ou na Árvore", e os dois valem.
await ava("__p.linha('forearm')?.click()");
await esperar(250);
const ligados = await ava('(__p.malha().binding?.bones ?? []).slice(0, 4)');
anotar('Os dois ossos entram na malha: um pela cena, um pela Árvore',
  Array.isArray(ligados) && new Set(ligados).size === 2 ? true : `entraram: ${JSON.stringify(ligados)}`);

// 6. A malha nunca saiu da seleção.
const selecao = await ava('__p.selecao()');
anotar('A malha continua escolhida do começo ao fim',
  selecao?.anexos?.[0] === 'pele/pele' ? true : `a seleção virou ${JSON.stringify(selecao)}`);

// 7. Cada osso ligado tem cor e conta na lista.
const lista = await ava('__p.lista()');
anotar('A lista mostra os dois, com a bolinha da cor',
  Array.isArray(lista) && lista.length === 2 && lista.every((l) => l.cor !== '') && lista[0].cor !== lista[1].cor
    ? true : `a lista está ${JSON.stringify(lista)}`);

// 8. Ligar de novo fecha o modo.
await clicar(await ava("__p.centro(__p.botao('Ligar ossos'))"));
anotar('Ligar de novo termina', (await ava('__p.modelo.bindModeOpen()')) === false ? true : 'o modo não fechou');

// 8b. Agora sim a ferramenta Pesos, para pintar e para a linha da aba sumir.
await ava('__p.focarCena()');
await tecla('g', 'KeyG', 71);
anotar('Ferramenta Pesos (G) na mão, pela tecla',
  (await ava('__p.ferramenta()')) === 'weights' ? true : 'a tecla G não pegou');

// 9. Pesos automáticos reparte entre os dois da lista.
await clicar(await ava("__p.centro(__p.botao('Pesos automáticos'))"));
await esperar(300);
const contas = await ava('__p.lista().map((l) => l.conta)');
const somaUm = await ava(`(() => {
  const b = __p.malha().binding;
  if (!b) return 'sem binding';
  let i = 0; let pior = 0;
  for (const n of b.counts) {
    let s = 0;
    for (let k = 0; k < n; k++) s += b.weights[i + k];
    i += n;
    pior = Math.max(pior, Math.abs(s - 1));
  }
  return pior;
})()`);
anotar('Pesos automáticos: cada osso com a sua parte, e a soma 1 em todo ponto',
  typeof somaUm === 'number' && somaUm < 1e-6 && Array.isArray(contas) && contas.length === 2 && !contas.includes('0%')
    ? true : `contas ${JSON.stringify(contas)}, pior soma ${JSON.stringify(somaUm)}`);

// 10. Com Pesos na mão, o clique num osso na Árvore troca o osso e NÃO derruba
//     a malha — o buraco 2 do plano.
await ava("__p.linha('forearm')?.click()");
await esperar(250);
const depois = await ava('__p.selecao()');
anotar('Árvore: escolher o osso a pintar não derruba a malha',
  depois?.ossos?.[0] === 'forearm' && depois?.anexos?.[0] === 'pele/pele'
    ? true : `a seleção virou ${JSON.stringify(depois)}`);

// 11. Um passo de desfazer por gesto: os dois Ligar e o Pesos automáticos.
const desfazer = await ava('__p.doc().undoLabel');
anotar('Pesos automáticos é um passo de desfazer', desfazer === 'Pesos automáticos' ? true : `o último passo é ${desfazer}`);

if (FOTO !== null) {
  // A foto mostra a lista dos ossos ligados, que é o que mudou: a aba fica
  // rolada no botão Ligar, e não no fim.
  await ava("__p.centro(__p.botao('Ligar ossos'))");
  await esperar(250);
  const foto = await cmd('Page.captureScreenshot', { format: 'png' });
  writeFileSync(FOTO, Buffer.from(foto.result.data, 'base64'));
}

// ---------------------------------------------------------------------------
// O relatório
// ---------------------------------------------------------------------------

let ruins = 0;
console.log('');
for (const [i, passo] of passos.entries()) {
  const marca = passo.saiu === true ? 'passou' : 'FALTOU';
  if (passo.saiu !== true) ruins += 1;
  console.log(`${String(i + 1).padStart(2)}  ${marca}  ${passo.nome}${passo.saiu === true ? '' : ` — ${passo.saiu}`}`);
}
console.log(`\n${passos.length - ruins} de ${passos.length} passos passaram.`);

const sujeira = consolePagina.filter((l) => !/^(log|info|debug):/.test(l));
if (sujeira.length === 0) console.log('Console limpo.');
else { console.log('Console:'); for (const linha of sujeira) console.log(`  ${linha}`); }

ws.close();
for (const filho of filhos) filho.kill();
try { rmSync(perfil, { recursive: true, force: true }); } catch { /* o Chrome ainda segura */ }
process.exit(ruins === 0 && sujeira.length === 0 ? 0 : 1);
