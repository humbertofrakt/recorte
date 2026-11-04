// SPDX-License-Identifier: Apache-2.0
// O Roteiro dos 30 minutos, rodado sem ninguém — lote 67.
//
// O Humberto, 11/09/2026: "em 30 minutos montar um boneco exatamente como no
// Spriter: abro, arrasto as peças, crio os ossos, associo e faço uma
// animação". Os 14 passos estão em
// `documentos/planos/ROTEIRO dos 30 minutos 2026-09-11.md`. Este script faz
// cada passo no editor de verdade e diz, passo a passo, "passou" ou o que
// faltou. O programa só volta para ele quando os 14 passam.
//
// COMO
//
// - **Chrome headless**, dirigido por CDP, como o `conferir-editor.mjs` e o
//   `fotos-manual.mjs`: o painel do navegador da automação não compõe quadros
//   (medido: `requestAnimationFrame` roda zero vezes por segundo lá).
// - O script **sobe o próprio servidor** do editor (porta 5191) e o próprio
//   Chrome (porta 9335), com um perfil novo: nada de rascunho de outra sessão.
//   Os dois morrem no fim.
// - Clique, arrasto e tecla vão como **eventos de verdade** do navegador
//   (`Input.dispatchMouseEvent` e `Input.dispatchKeyEvent`): passam pela cena,
//   pelas ferramentas e pela casca como os do Humberto passariam.
// - Onde não há gesto que um robô faça, a mesma porta do gesto: soltar a peça
//   da aba Imagens na cena é um `drop` com o tipo da aba; "Mandar para trás",
//   "Nova animação", "Copiar pose", "Colar", "Salvar" e "Novo" são as ações
//   que o menu chama (`runAction`).
// - A **pasta** do passo 2 é uma pasta de mentira, em memória, entregue pelo
//   `showDirectoryPicker` da página: é o Abrir pasta de verdade que roda, com
//   a varredura das subpastas. O Salvar do passo 13 grava nela.
// - O passo 14 FECHA de verdade: `Page.navigate` recarrega a página inteira,
//   o que apaga o `window` e a pasta de mentira junto — por isso o script
//   guarda os bytes dela no lado do Node ANTES de recarregar, e os devolve
//   depois (`__r.recriarPasta`), como um disco devolveria. Só então reabre,
//   pelo botão "Abrir pasta" das boas-vindas, e compara o `.bone` salvo com o
//   documento reaberto, campo por campo (o "recente" guarda a pasta no
//   IndexedDB, que uma pasta de mentira não atravessa — por isso as
//   boas-vindas aparecem de novo, como aconteceria com uma pasta real que o
//   sistema tivesse esquecido).
// - Para conferir, o script lê o documento pela cena (`viewportPanel.doc`) e
//   a câmera dela. O servidor de desenvolvimento serve o mesmo módulo que o
//   editor usa, então é o mesmo objeto. Só lê; quem muda é o gesto.
// - Janela de confirmação (`confirm`) é aceita sozinha, e anotada.
//
// USO, da raiz do projeto:
//
//   npm run roteiro
//   node ferramentas/provas/roteiro-30.mjs --fotos PASTA
//
// Com `--fotos`, uma foto por passo, em 1440x900, na PASTA dada.
// Sai uma linha por passo e, no fim, o console da página. Código 1 quando
// algum passo não passou.

import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..');
const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA_EDITOR = 5191;
const PORTA_CHROME = 9335;
const URL_EDITOR = `http://localhost:${PORTA_EDITOR}/`;
const FOTOS = (() => {
  const i = process.argv.indexOf('--fotos');
  return i >= 0 && process.argv[i + 1] ? resolve(process.argv[i + 1]) : null;
})();

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// O boneco: 10 peças em 3 subpastas, e onde cada uma fica no mundo (y para cima)
// ---------------------------------------------------------------------------

const PECAS = [
  { nome: 'corpo/cabeca', w: 60, h: 60, cor: '#e8b27a', x: 0, y: 175 },
  { nome: 'corpo/tronco', w: 50, h: 90, cor: '#4f7fc9', x: 0, y: 100 },
  { nome: 'bracos/braco_frente', w: 20, h: 60, cor: '#3b63a8', x: 32, y: 100 },
  { nome: 'bracos/mao_aberta', w: 24, h: 24, cor: '#e8b27a', x: 32, y: 55 },
  { nome: 'bracos/mao_fechada', w: 24, h: 24, cor: '#c9905a' },
  { nome: 'pernas/perna_frente', w: 22, h: 70, cor: '#5a5a5a', x: 12, y: 20 },
  { nome: 'pernas/perna_tras', w: 22, h: 70, cor: '#3d3d3d', x: -12, y: 20 },
  { nome: 'pernas/pe_frente', w: 34, h: 14, cor: '#6b4a2b', x: 20, y: -30 },
  { nome: 'pernas/pe_tras', w: 34, h: 14, cor: '#4f361f', x: -4, y: -30 },
  // Por último, e por isso na frente de tudo: o passo 4 manda ele para trás.
  { nome: 'bracos/braco_tras', w: 20, h: 60, cor: '#2c4b80', x: -32, y: 100 },
];

/** Os 8 ossos: de onde a onde se arrasta, o pai, e as peças que ele pega no passo 6. */
const OSSOS = [
  { id: 'quadril', de: [0, 45], ate: [0, 60], pai: null, pecas: [] },
  { id: 'tronco', de: [0, 60], ate: [0, 140], pai: 'quadril', pecas: ['corpo/tronco'] },
  { id: 'cabeca', de: [0, 150], ate: [0, 200], pai: 'tronco', pecas: ['corpo/cabeca'] },
  { id: 'braco_f', de: [32, 128], ate: [32, 75], pai: 'tronco', pecas: ['bracos/braco_frente'] },
  { id: 'braco_t', de: [-32, 128], ate: [-32, 75], pai: 'tronco', pecas: ['bracos/braco_tras'] },
  { id: 'mao', de: [32, 70], ate: [32, 44], pai: 'braco_f', pecas: ['bracos/mao_aberta'] },
  { id: 'perna_f', de: [12, 52], ate: [12, -12], pai: 'quadril', pecas: ['pernas/perna_frente', 'pernas/pe_frente'] },
  { id: 'perna_t', de: [-12, 52], ate: [-12, -12], pai: 'quadril', pecas: ['pernas/perna_tras', 'pernas/pe_tras'] },
];

// ---------------------------------------------------------------------------
// As ajudantes que moram dentro da página
// ---------------------------------------------------------------------------

const AJUDANTES = String.raw`
window.__r = (() => {
  const r = {};
  r.carregar = async () => {
    r.vp = (await import('/src/viewport/viewport.ts')).viewportPanel;
    r.acoes = await import('/src/ui/actions.ts');
    r.picking = await import('/src/viewport/picking.ts');
    r.caixa = await import('/src/viewport/transform-box.ts');
    r.pose = await import('/src/anim/pose-mode.ts');
    r.telaViva = await import('/src/viewport/viewport.ts');
    return true;
  };
  r.doc = () => r.vp.doc;
  r.q = (s) => [...document.querySelectorAll(s)];
  r.tela = (x, y) => {
    const c = r.vp.canvas.getBoundingClientRect();
    const p = r.vp.camera.worldToScreen(x, y);
    return { x: c.left + p.x, y: c.top + p.y };
  };
  r.centro = (el) => {
    const b = el.getBoundingClientRect();
    return { x: b.left + b.width / 2, y: b.top + b.height / 2 };
  };
  r.visivel = (el) => el !== null && el !== undefined && el.getClientRects().length > 0;
  r.ferramenta = () => r.telaViva.getActiveToolId();
  /** O slot que mostra a imagem, pelo caminho do desenho ativo. */
  r.slotDe = (imagem) => {
    const d = r.doc();
    for (const slot of d.file.slots ?? []) {
      for (const skin of d.file.skins ?? []) {
        const def = skin.attachments?.[slot.name]?.[slot.attachment];
        if (def && (def.path ?? slot.attachment) === imagem) return slot.name;
      }
    }
    return null;
  };
  r.pontosDoSlot = (slot) => {
    const sk = r.doc().skeleton;
    const s = sk?.findSlot(slot);
    if (!s || !s.attachment) return null;
    const w = r.picking.attachmentWorldPoints(s, s.attachment);
    return w === null ? null : Array.from(w.vertices).slice(0, w.count * 2);
  };
  r.centroDoSlot = (slot) => {
    const p = r.pontosDoSlot(slot);
    if (p === null) return null;
    let x = 0; let y = 0;
    for (let i = 0; i < p.length; i += 2) { x += p[i]; y += p[i + 1]; }
    return { x: x / (p.length / 2), y: y / (p.length / 2) };
  };
  r.matriz = (osso) => {
    const b = r.doc().skeleton?.findBone(osso);
    return b ? [b.a, b.b, b.c, b.d, b.worldX, b.worldY] : null;
  };
  r.irPara = (t) => { const d = r.doc(); d.time = t; d.repose?.(); return d.time; };
  r.linhaArvore = (nome) => r.q('.arvore-item').find((b) => (b.querySelector('.arvore-nome')?.textContent ?? '').trim() === nome) ?? null;
  r.focarCena = () => { const v = document.querySelector('.viewport'); v?.focus(); return document.activeElement === v; };
  r.janelas = () => r.q('[role=dialog]').filter((e) => r.visivel(e) && !e.classList.contains('grade-imagens')).length;

  // A pasta de mentira, em memória, com o jeito da API de arquivos.
  r.png = (w, h, cor) => new Promise((ok) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d'); g.fillStyle = cor; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1a1a1a'; g.lineWidth = 2; g.strokeRect(1, 1, w - 2, h - 2);
    c.toBlob(ok, 'image/png');
  });
  r.arquivo = (nome, file) => {
    const h = {
      kind: 'file', name: nome, _file: file,
      async getFile() { return h._file; },
      async createWritable() {
        const partes = [];
        return {
          async write(d) { partes.push(d); },
          async close() { h._file = new File(partes, nome, { lastModified: Date.now() }); },
        };
      },
    };
    return h;
  };
  r.pasta = (nome) => {
    const filhos = new Map();
    const h = {
      kind: 'directory', name: nome, _filhos: filhos,
      async *values() { for (const f of filhos.values()) yield f; },
      async queryPermission() { return 'granted'; },
      async requestPermission() { return 'granted'; },
      async getFileHandle(n, o) {
        let f = filhos.get(n);
        if (f === undefined) {
          if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError');
          f = r.arquivo(n, new File([], n)); filhos.set(n, f);
        }
        return f;
      },
      async getDirectoryHandle(n, o) {
        let d = filhos.get(n);
        if (d === undefined) {
          if (!(o && o.create)) throw new DOMException('não há ' + n, 'NotFoundError');
          d = r.pasta(n); filhos.set(n, d);
        }
        return d;
      },
      async resolve(alvo) {
        const busca = (dir, caminho) => {
          for (const [n, f] of dir._filhos) {
            if (f === alvo) return [...caminho, n];
            if (f.kind === 'directory') { const achou = busca(f, [...caminho, n]); if (achou) return achou; }
          }
          return null;
        };
        return busca(h, []);
      },
    };
    return h;
  };
  r.montarPasta = async (pecas) => {
    const raiz = r.pasta('boneco');
    for (const p of pecas) {
      const [sub, nome] = p.nome.split('/');
      const dir = await raiz.getDirectoryHandle(sub, { create: true });
      const blob = await r.png(p.w, p.h, p.cor);
      dir._filhos.set(nome + '.png', r.arquivo(nome + '.png', new File([blob], nome + '.png', { type: 'image/png', lastModified: Date.now() })));
    }
    r.raiz = raiz;
    window.showDirectoryPicker = async () => raiz;
    window.showSaveFilePicker = async (o) => raiz.getFileHandle((o && o.suggestedName) || 'boneco.bone', { create: true });
    return true;
  };
  r.listar = () => {
    const out = [];
    const anda = (d, pre) => { for (const [n, f] of d._filhos) { if (f.kind === 'directory') anda(f, pre + n + '/'); else out.push(pre + n); } };
    anda(r.raiz, '');
    return out.sort();
  };
  r.lerArquivo = async (caminho) => {
    let dir = r.raiz;
    const partes = caminho.split('/');
    for (const p of partes.slice(0, -1)) dir = dir?._filhos.get(p);
    const f = dir?._filhos.get(partes[partes.length - 1]);
    return f ? await f._file.text() : null;
  };
  // Lote "salvar, fechar, reabrir": o binário (as páginas do atlas) em base64,
  // para atravessar Runtime.evaluate como o texto atravessa.
  r.lerArquivoB64 = async (caminho) => {
    let dir = r.raiz;
    const partes = caminho.split('/');
    for (const p of partes.slice(0, -1)) dir = dir?._filhos.get(p);
    const f = dir?._filhos.get(partes[partes.length - 1]);
    if (!f) return null;
    const bytes = new Uint8Array(await f._file.arrayBuffer());
    let bin = '';
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  };
  // Reconstrói a pasta de mentira a partir do que foi lido ANTES de
  // recarregar a página — o window e todo objeto da pasta morrem no
  // recarregamento, mas os bytes que o Node guardou não. Isto é o que faz o
  // passo 14 ser um FECHAR de verdade: a memória do editor se vai inteira, e
  // só o disco (aqui, os bytes guardados pelo script) atravessa.
  r.recriarPasta = async (arquivos) => {
    const raiz = r.pasta('boneco');
    for (const [caminho, dado] of Object.entries(arquivos)) {
      const partes = caminho.split('/');
      const nome = partes.pop();
      let dir = raiz;
      for (const parte of partes) dir = await dir.getDirectoryHandle(parte, { create: true });
      let arquivo;
      if (dado.b64 !== undefined) {
        const bin = atob(dado.b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        arquivo = new File([bytes], nome, { type: 'image/png', lastModified: Date.now() });
      } else {
        arquivo = new File([dado.texto], nome, { type: 'application/octet-stream', lastModified: Date.now() });
      }
      dir._filhos.set(nome, r.arquivo(nome, arquivo));
    }
    r.raiz = raiz;
    window.showDirectoryPicker = async () => raiz;
    window.showSaveFilePicker = async (o) => raiz.getFileHandle((o && o.suggestedName) || 'boneco.bone', { create: true });
    return true;
  };
  /** Soltar uma imagem da aba Imagens na cena: o drop com o tipo da aba. */
  r.soltar = (nome, x, y) => {
    const c = r.vp.canvas;
    const dt = new DataTransfer();
    dt.setData('text/x-recorte-imagem', nome);
    c.dispatchEvent(new DragEvent('dragover', { dataTransfer: dt, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    c.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true, clientX: x, clientY: y }));
    return true;
  };
  return r;
})();
true`;

// ---------------------------------------------------------------------------
// O servidor, o Chrome e o CDP
// ---------------------------------------------------------------------------

const filhos = [];
function encerrar() {
  for (const p of filhos) { try { p.kill(); } catch { /* já saiu */ } }
}
process.on('exit', encerrar);

async function subirEditor() {
  const vite = spawn(process.execPath, [resolve(RAIZ, 'ferramentas/provas/vite-quieto.mjs'), '--port', String(PORTA_EDITOR)], {
    cwd: RAIZ, stdio: 'ignore',
  });
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

const consoleDaPagina = [];
const janelasAceitas = [];
const janelasRecusadas = [];
let ws;
let proximo = 0;
const pendentes = new Map();

function cmd(method, params = {}) {
  const id = ++proximo;
  return new Promise((ok) => { pendentes.set(id, ok); ws.send(JSON.stringify({ id, method, params })); });
}

async function ava(expressao) {
  const r = await cmd('Runtime.evaluate', { expression: expressao, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) {
    const e = r.result.exceptionDetails;
    throw new Error(e.exception?.description ?? e.text ?? 'erro na página');
  }
  return r.result?.result?.value;
}

/** Espera a expressão ficar verdadeira, até `ms`. Devolve o último valor. */
async function ate(expressao, ms = 4000) {
  const fim = Date.now() + ms;
  let valor;
  do {
    valor = await ava(expressao);
    if (valor) return valor;
    await esperar(100);
  } while (Date.now() < fim);
  return valor;
}

// Os gestos, como eventos de verdade.
async function mouse(type, x, y, extra = {}) {
  await cmd('Input.dispatchMouseEvent', {
    type, x, y, button: 'left', buttons: type === 'mouseReleased' ? 0 : 1, clickCount: 1, ...extra,
  });
}
async function clicar(p, extra = {}) {
  await mouse('mouseMoved', p.x, p.y, { buttons: 0, ...extra });
  await mouse('mousePressed', p.x, p.y, extra);
  await mouse('mouseReleased', p.x, p.y, extra);
  await esperar(120);
}
async function arrastar(de, ate_, passos = 8, extra = {}) {
  await mouse('mouseMoved', de.x, de.y, { buttons: 0, ...extra });
  await mouse('mousePressed', de.x, de.y, extra);
  for (let i = 1; i <= passos; i++) {
    await mouse('mouseMoved', de.x + ((ate_.x - de.x) * i) / passos, de.y + ((ate_.y - de.y) * i) / passos, extra);
    await esperar(16);
  }
  await mouse('mouseReleased', ate_.x, ate_.y, extra);
  await esperar(150);
}
const TECLAS = {
  p: { key: 'p', code: 'KeyP', vk: 80, text: 'p' },
  // Degrau 7, tarefa 7.1 (G1, 17/09/2026): a tecla do Criar osso passou de
  // `N` para **`B`**, de *bone*, como no Spriter. O `N` ficou livre.
  b: { key: 'b', code: 'KeyB', vk: 66, text: 'b' },
  t: { key: 't', code: 'KeyT', vk: 84, text: 't' },
  s: { key: 's', code: 'KeyS', vk: 83, text: 's' },
  Escape: { key: 'Escape', code: 'Escape', vk: 27 },
  ' ': { key: ' ', code: 'Space', vk: 32, text: ' ' },
};
async function tecla(nome, tipo = 'ambos', modifiers = 0) {
  const t = TECLAS[nome];
  const base = { key: t.key, code: t.code, windowsVirtualKeyCode: t.vk, nativeVirtualKeyCode: t.vk, modifiers };
  if (tipo !== 'solta') await cmd('Input.dispatchKeyEvent', { type: 'keyDown', ...base, ...(t.text && modifiers === 0 ? { text: t.text } : {}) });
  if (tipo !== 'desce') await cmd('Input.dispatchKeyEvent', { type: 'keyUp', ...base });
  await esperar(80);
}
async function naCena() {
  await ava('__r.focarCena()');
}
async function ponto(x, y) {
  return ava(`__r.tela(${x}, ${y})`);
}

// ---------------------------------------------------------------------------
// Os 14 passos. Cada um devolve `true`, ou a frase do que faltou.
// ---------------------------------------------------------------------------

const ossoDe = {}; // id do roteiro -> nome do osso no arquivo
let arquivoSalvo = null;
let nomeSalvo = null;
let animacao = null;

/**
 * **A caixa da queda** — 29/09/2026, dono chat C (P44), defeito C1.
 *
 * Às 04:42 o passo 14 caiu uma vez e a frase se perdeu: a tela só guardava a
 * primeira linha, e nada da página. Uma prova que cai e não diz por quê nos
 * deixa cegos — e a queda que não se repete é justamente a que mais precisa
 * do retrato. Em toda queda ficam, numa pasta com a hora no nome:
 * `queda.txt` (a frase inteira, o tempo de cada passo até ali, as janelas, o
 * console da página, a carga da máquina) e `tela.png` (a tela no instante).
 * A pasta é `backup/provas-quedas/roteiro/`, listada no `INDICE.md`.
 */
async function guardarQueda(n, nome, frase, linhas) {
  try {
    const agora = new Date();
    const dois = (v) => String(v).padStart(2, '0');
    const carimbo = `${agora.getFullYear()}-${dois(agora.getMonth() + 1)}-${dois(agora.getDate())}`
      + `_${dois(agora.getHours())}${dois(agora.getMinutes())}${dois(agora.getSeconds())}_passo-${dois(n)}`;
    const pasta = join(RAIZ, 'backup', 'provas-quedas', 'roteiro', carimbo);
    mkdirSync(pasta, { recursive: true });
    let tela = '(sem foto)';
    try {
      const foto = await cmd('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(pasta, 'tela.png'), Buffer.from(foto.result.data, 'base64'));
      tela = 'tela.png';
    } catch (erro) { tela = `(a foto falhou: ${String(erro)})`; }
    let pagina = '(não li a página)';
    try {
      pagina = JSON.stringify(await ava(`(() => ({
        janelas: [...document.querySelectorAll('.dialog-veil, [role=dialog]')]
          .filter((e) => e.offsetParent !== null).map((e) => e.textContent.slice(0, 300)),
        rodape: (document.querySelector('.status-bar, .barra-status, footer')?.textContent ?? '').slice(0, 300),
      }))()`), null, 2);
    } catch (erro) { pagina = `(a leitura falhou: ${String(erro)})`; }
    const { loadavg, cpus } = await import('node:os');
    const texto = [
      `Roteiro dos 30 minutos — queda no passo ${n}: ${nome}`,
      `Hora: ${agora.toISOString()} · núcleos: ${cpus().length} · carga: ${process.platform === 'win32' ? 'o Windows não informa' : loadavg().join(' ')}`,
      '', 'A frase inteira:', frase, '',
      'O tempo de cada passo até aqui:',
      ...linhas.map((l) => `  ${String(l.n).padStart(2)}  ${l.passou ? 'passou' : 'FALTOU'}  ${(l.ms / 1000).toFixed(1)} s  ${l.nome}`),
      '', 'A página no instante:', pagina, '',
      `Janelas aceitas: ${janelasAceitas.join(' | ') || 'nenhuma'}`,
      `Janelas recusadas: ${janelasRecusadas.join(' | ') || 'nenhuma'}`,
      'Console da página:', ...(consoleDaPagina.length === 0 ? ['  limpo'] : consoleDaPagina.map((c) => `  ${c}`)),
      '', `Foto: ${tela}`,
    ].join('\n');
    writeFileSync(join(pasta, 'queda.txt'), texto);
    console.log(`            a queda ficou guardada em backup/provas-quedas/roteiro/${carimbo}/`);
  } catch (erro) {
    console.log(`            NÃO consegui guardar a queda: ${String(erro)}`);
  }
}

const PASSOS = [
  // Degrau 4a (17/09/2026): "corpo vazio, base aberta". O tocador nunca apaga
  // (M5): com a base aberta ele está lá, com o relógio em 0,00 s e um losango.
  ['Abre o programa: corpo vazio, base aberta', async () => {
    const e = await ava(`(() => { const d = __r.doc(); return {
      slots: (d.file.slots ?? []).length, ossos: (d.file.bones ?? []).length,
      animando: d.animation !== null, ferramenta: __r.ferramenta(),
      relogio: document.querySelector('.dope-toc-tempo input')?.value ?? null,
      losango: document.querySelector('.dope-base-losango') !== null,
      boasVindas: __r.visivel(document.querySelector('.viewport-boas-vindas:not([hidden])')) }; })()`);
    const faltas = [];
    if (e.slots !== 0 || e.ossos > 1) faltas.push(`corpo não está vazio (${e.slots} slots, ${e.ossos} ossos)`);
    if (e.animando) faltas.push('abriu com uma animação, e não com a base');
    if (e.relogio !== '0,00 s') faltas.push(`o tocador não diz 0,00 s com a base aberta (diz ${e.relogio})`);
    if (!e.losango) faltas.push('a folha não mostra o losango da base');
    if (e.ferramenta !== 'transform') faltas.push(`ferramenta ${e.ferramenta}, não Transformar`);
    if (!e.boasVindas) faltas.push('sem as boas-vindas');
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Arquivo → Abrir pasta…', async () => {
    await ava(`__r.montarPasta(${JSON.stringify(PECAS)})`);
    // "Arquivo → Abrir pasta…", pelo menu, como o roteiro diz. Vale com o que
    // estiver aberto: o programa começa com o herói (ver o passo 1).
    const menu = await ava(`(() => { const b = __r.q('.menu-button').find((x) => x.textContent.trim() === 'Arquivo'); if (!b) return false; b.click(); return true; })()`);
    if (!menu) return 'sem o menu Arquivo';
    await esperar(150);
    const item = await ava(`(() => { const b = __r.q('.menu-item').find((x) => x.textContent.trim().startsWith('Abrir pasta')); return __r.visivel(b) ? __r.centro(b) : null; })()`);
    if (item === null) return 'sem o item Abrir pasta… no menu Arquivo';
    await clicar(item);
    const aberto = await ate(`document.body.innerText.includes('mao_fechada')`, 5000);
    const e = await ava(`(() => { const t = document.body.innerText; return {
      subpastas: ['bracos', 'corpo', 'pernas'].filter((s) => __r.q('.imagens-secao-nome').some((n) => n.textContent.trim() === s)),
      slots: (__r.doc().file.slots ?? []).length }; })()`);
    const faltas = [];
    if (!aberto) faltas.push('as imagens não apareceram na aba Imagens');
    if (e.subpastas.length !== 3) faltas.push(`subpastas à vista: ${e.subpastas.join(', ') || 'nenhuma'}`);
    if (e.slots !== 0) faltas.push(`${e.slots} peças entraram na cena sozinhas`);
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Arrasta as peças e arruma', async () => {
    for (const p of PECAS) {
      if (p.x === undefined) continue;
      const alvo = await ponto(p.x, p.y);
      await ava(`__r.soltar(${JSON.stringify(p.nome)}, ${alvo.x}, ${alvo.y})`);
      await esperar(250);
    }
    const na = PECAS.filter((p) => p.x !== undefined).length;
    await ate(`(__r.doc().file.slots ?? []).length >= ${na}`, 5000);
    const e = await ava(`(() => { const d = __r.doc(); return {
      slots: (d.file.slots ?? []).length,
      presos: (d.file.slots ?? []).filter((s) => s.bone !== d.file.bones[0].name).map((s) => s.name),
      raiz: JSON.stringify(d.file.bones[0]) }; })()`);
    const faltas = [];
    if (e.slots !== na) faltas.push(`${e.slots} de ${na} peças na cena`);
    if (e.presos.length > 0) faltas.push(`nasceram presas: ${e.presos.join(', ')}`);
    // Arrumar: o tronco anda 20 px de tela com o Transformar, sem trocar de ferramenta.
    const tronco = await ava(`__r.slotDe('corpo/tronco')`);
    const antes = await ava(`__r.centroDoSlot(${JSON.stringify(tronco)})`);
    const de = await ponto(antes.x, antes.y);
    await arrastar(de, { x: de.x + 20, y: de.y });
    const depois = await ava(`__r.centroDoSlot(${JSON.stringify(tronco)})`);
    const zoom = await ava('__r.vp.camera.zoom');
    if (Math.abs(depois.x - antes.x - 20 / zoom) > 0.01) faltas.push(`o tronco andou ${(depois.x - antes.x).toFixed(2)}, não ${(20 / zoom).toFixed(2)}`);
    const raizDepois = await ava('JSON.stringify(__r.doc().file.bones[0])');
    if (raizDepois !== e.raiz) faltas.push('o arrasto mexeu na raiz');
    const escolha = await ava('__r.doc().selection');
    if (escolha.bones.length > 0) faltas.push(`clicar na peça escolheu o osso ${escolha.bones.join(', ')}`);
    // De volta ao lugar, para os passos seguintes medirem com o boneco inteiro.
    await arrastar({ x: de.x + 20, y: de.y }, de);
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Ordem: braço de trás para trás', async () => {
    const braco = await ava(`__r.slotDe('bracos/braco_tras')`);
    const tronco = await ava(`__r.slotDe('corpo/tronco')`);
    const centro = await ava(`__r.centroDoSlot(${JSON.stringify(braco)})`);
    await clicar(await ponto(centro.x, centro.y));
    const indice = (nome) => `(__r.doc().file.slots ?? []).findIndex((s) => s.name === ${JSON.stringify(nome)})`;
    for (let i = 0; i < 12; i++) {
      if (await ava(`${indice(braco)} < ${indice(tronco)}`)) break;
      await ava(`__r.acoes.runAction('descer-ordem')`);
      await esperar(80);
    }
    return (await ava(`${indice(braco)} < ${indice(tronco)}`)) || 'o braço de trás continua na frente do tronco';
  }],

  ['Cria os ossos (B e arrastar)', async () => {
    const faltas = [];
    for (const o of OSSOS) {
      await naCena();
      await tecla('t');
      if (o.pai === null) {
        await tecla('Escape');
      } else {
        const linha = await ava(`(() => { const b = __r.linhaArvore(${JSON.stringify(ossoDe[o.pai])}); if (!b) return false; b.click(); return true; })()`);
        if (!linha) { faltas.push(`sem a linha de ${o.pai} na Árvore`); continue; }
      }
      await naCena();
      await tecla('b');
      const antes = await ava('__r.doc().file.bones.map((b) => b.name)');
      await arrastar(await ponto(...o.de), await ponto(...o.ate));
      const novo = await ava(`__r.doc().file.bones.map((b) => b.name).find((n) => !${JSON.stringify(antes)}.includes(n)) ?? null`);
      if (novo === null) { faltas.push(`${o.id}: nenhum osso nasceu`); continue; }
      ossoDe[o.id] = novo;
      const pai = await ava(`__r.doc().file.bones.find((b) => b.name === ${JSON.stringify(novo)}).parent ?? null`);
      const esperado = o.pai === null ? await ava('__r.doc().file.bones[0].name') : ossoDe[o.pai];
      if (pai !== esperado) faltas.push(`${o.id} nasceu filho de ${pai}, não de ${esperado}`);
    }
    await naCena();
    await tecla('t');
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Associa: osso, P, clique nas peças', async () => {
    const faltas = [];
    for (const o of OSSOS) {
      if (o.pecas.length === 0 || ossoDe[o.id] === undefined) continue;
      const osso = ossoDe[o.id];
      await ava(`__r.linhaArvore(${JSON.stringify(osso)})?.click()`);
      await naCena();
      await tecla('p', 'desce');
      for (const imagem of o.pecas) {
        const slot = await ava(`__r.slotDe(${JSON.stringify(imagem)})`);
        const antes = await ava(`__r.pontosDoSlot(${JSON.stringify(slot)})`);
        const c = await ava(`__r.centroDoSlot(${JSON.stringify(slot)})`);
        await clicar(await ponto(c.x, c.y));
        const e = await ava(`({ osso: __r.doc().file.slots.find((s) => s.name === ${JSON.stringify(slot)}).bone,
          pontos: __r.pontosDoSlot(${JSON.stringify(slot)}), janelas: __r.janelas() })`);
        if (e.osso !== osso) faltas.push(`${slot} ficou em ${e.osso}, não em ${osso}`);
        if (e.janelas > 0) faltas.push('abriu uma janela');
        const andou = Math.max(...antes.map((v, i) => Math.abs(v - e.pontos[i])));
        if (andou > 1e-4) faltas.push(`${slot} saiu do lugar (${andou.toFixed(4)})`);
      }
      await tecla('p', 'solta');
    }
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Árvore: quem manda em quem', async () => {
    const e = await ava(`(() => ({
      secoes: __r.q('.arvore-secao-titulo').map((t) => t.textContent.replace(/\\d+/g, '').trim()),
      raiz: __r.linhaArvore(__r.doc().file.bones[0].name) !== null }))()`);
    const faltas = [];
    // O título traz a seta antes do nome: procura em qualquer lugar dele.
    if (e.secoes.some((s) => s.includes('Slots'))) faltas.push(`a Árvore ainda é de listas separadas (${e.secoes.join(' · ')}): falta o lote 64`);
    if (e.raiz) faltas.push('a raiz aparece na Árvore');
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Troca a mão pela mão fechada', async () => {
    const slot = await ava(`__r.slotDe('bracos/mao_aberta')`);
    if (slot === null) return 'a mão aberta não está na cena';
    const antes = await ava(`__r.centroDoSlot(${JSON.stringify(slot)})`);
    await naCena();
    await tecla('t');
    // Lote 60c: a grade abre no botão direito, como no Spriter.
    const p = await ponto(antes.x, antes.y);
    await mouse('mouseMoved', p.x, p.y, { buttons: 0 });
    await mouse('mousePressed', p.x, p.y, { button: 'right', buttons: 2 });
    await mouse('mouseReleased', p.x, p.y, { button: 'right', buttons: 0 });
    await esperar(150);
    const grade = await ate(`__r.visivel(document.querySelector('.grade-imagens'))`, 2000);
    if (!grade) return 'a grade de imagens não apareceu no botão direito da mão';
    const alvo = await ava(`(() => { const b = __r.q('.grade-imagem').find((x) => x.title.startsWith('bracos/mao_fechada')); return b ? __r.centro(b) : null; })()`);
    if (alvo === null) return 'a mão fechada não está na grade';
    await clicar(alvo);
    await ate(`__r.slotDe('bracos/mao_fechada') !== null`, 2000);
    const depois = await ava(`__r.slotDe('bracos/mao_fechada') === ${JSON.stringify(slot)} ? __r.centroDoSlot(${JSON.stringify(slot)}) : null`);
    if (depois === null) return 'a troca não aconteceu';
    const andou = Math.hypot(depois.x - antes.x, depois.y - antes.y);
    return andou < 0.01 || `a mão trocou, mas o centro andou ${andou.toFixed(2)} (sem pivô definido)`;
  }],

  // Degrau 4a: "abre a animação". O Gravar sozinho saiu (M6): o passo confere
  // que ele não existe mais, em vez de conferir que está ligado.
  ['Nova animação: abre a animação', async () => {
    const botao = await ava(`(() => { const b = __r.q('button').find((x) => x.getAttribute('aria-label') === 'Nova animação'); return __r.visivel(b) ? __r.centro(b) : null; })()`);
    if (botao === null) return 'o botão Nova animação não está à vista';
    await clicar(botao);
    await ate('__r.doc().animation !== null', 2000);
    // O tocador acende no redesenho seguinte: espera por ele, sem palpite.
    await ate(`document.querySelector('.dope-toc-tocar')?.disabled === false`, 2000);
    const e = await ava(`({ animacao: __r.doc().animation, tempo: __r.doc().time,
      semFreio: !('isAutoKeyOn' in __r.pose) && !('setAutoKey' in __r.pose),
      tocar: (() => { const b = document.querySelector('.dope-toc-tocar'); return b ? !b.disabled : null; })() })`);
    animacao = e.animacao;
    const faltas = [];
    if (e.animacao === null) faltas.push('a animação não abriu');
    if (e.tempo !== 0) faltas.push(`tempo ${e.tempo}, não 0`);
    if (!e.semFreio) faltas.push('o Gravar sozinho ainda existe');
    if (e.tocar === false) faltas.push('o Tocar continua cinza com a animação aberta');
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Em 0,5 s, gira o tronco e o braço', async () => {
    const faltas = [];
    await ava('__r.irPara(0.5)');
    for (const id of ['tronco', 'braco_f']) {
      const osso = ossoDe[id];
      await ava(`__r.linhaArvore(${JSON.stringify(osso)})?.click()`);
      await naCena();
      await tecla('t');
      await esperar(100);
      const caixa = await ava(`(() => { const b = __r.caixa.transformBox(__r.doc(), __r.vp.camera.zoom); return b && { pivo: b.pivot, bola: b.knob }; })()`);
      if (!caixa) { faltas.push(`${id}: sem a caixa do Transformar`); continue; }
      const giro = (25 * Math.PI) / 180;
      const dx = caixa.bola.x - caixa.pivo.x;
      const dy = caixa.bola.y - caixa.pivo.y;
      const destino = { x: caixa.pivo.x + dx * Math.cos(giro) - dy * Math.sin(giro), y: caixa.pivo.y + dx * Math.sin(giro) + dy * Math.cos(giro) };
      await arrastar(await ponto(caixa.bola.x, caixa.bola.y), await ponto(destino.x, destino.y), 10);
      const chave = await ava(`(() => { const a = __r.doc().file.animations.find((x) => x.name === ${JSON.stringify(animacao)});
        const l = (a?.timelines ?? []).find((t) => t.type === 'bone' && t.target === ${JSON.stringify(osso)} && t.property === 'rotation');
        return l ? l.keys.map((k) => k.time) : null; })()`);
      if (chave === null) faltas.push(`${id}: nenhuma chave de giro nasceu`);
      else if (!chave.some((t) => Math.abs(t - 0.5) < 1e-6)) faltas.push(`${id}: chaves em ${chave.join(', ')}, nenhuma em 0,5`);
    }
    const m0 = await ava(`(__r.irPara(0), __r.matriz(${JSON.stringify(ossoDe.tronco)}))`);
    const m5 = await ava(`(__r.irPara(0.5), __r.matriz(${JSON.stringify(ossoDe.tronco)}))`);
    if (m0 && m5 && Math.max(...m0.map((v, i) => Math.abs(v - m5[i]))) < 1e-6) {
      faltas.push('em 0 a pose já é a de 0,5: editar gravou, mas o começo não se guardou');
    }
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Em 1,0 s, volta à pose do começo', async () => {
    await ava('__r.irPara(0)');
    await ava(`__r.acoes.runAction('copiar-pose')`);
    await ava('__r.irPara(1)');
    await ava(`__r.acoes.runAction('colar')`);
    await esperar(150);
    const m0 = await ava(`(__r.irPara(0), __r.matriz(${JSON.stringify(ossoDe.tronco)}))`);
    const m5 = await ava(`(__r.irPara(0.5), __r.matriz(${JSON.stringify(ossoDe.tronco)}))`);
    const m1 = await ava(`(__r.irPara(1), __r.matriz(${JSON.stringify(ossoDe.tronco)}))`);
    if (!m0 || !m1 || !m5) return 'sem o tronco';
    const diferenca = (a, b) => Math.max(...a.map((v, i) => Math.abs(v - b[i])));
    // Sem isto o passo passaria sem provar nada: se a pose de 0 já é a de 0,5
    // (o passo 10), "voltar à pose de 0" em 1,0 não mostra que algo voltou.
    if (diferenca(m5, m1) < 1e-6) return 'em 1,0 s a pose é a mesma de 0,5: não há volta para provar (depende do passo 10)';
    const d = diferenca(m0, m1);
    return d < 1e-6 || `em 1,0 s o tronco não voltou à pose de 0 (diferença ${d.toFixed(4)})`;
  }],

  ['Espaço: toca em laço', async () => {
    // Primeiro com o foco na cena, que é onde a mão está. Se não tocar, de
    // novo com o foco fora dela, para o relatório dizer qual dos dois vale.
    const tocar = async (foco) => {
      await ava('__r.irPara(0)');
      await foco();
      await tecla(' ');
      const tempos = [];
      for (let i = 0; i < 12; i++) { tempos.push(await ava('__r.doc().time')); await esperar(150); }
      await foco();
      await tecla(' ');
      return tempos;
    };
    const anda = (tempos) => new Set(tempos.map((t) => t.toFixed(3))).size > 3;
    const volta = (tempos) => tempos.some((t, i) => i > 0 && t < tempos[i - 1] - 0.05);
    const naCenaTempos = await tocar(naCena);
    if (anda(naCenaTempos)) return volta(naCenaTempos) || 'tocou, mas não voltou ao começo (sem laço) em 1,8 s';
    const foraTempos = await tocar(() => ava('(document.activeElement?.blur(), true)'));
    if (anda(foraTempos)) return 'com o foco na cena o Espaço não toca (lá ele arrasta a vista); fora da cena, toca';
    return `não tocou: tempos ${foraTempos.map((t) => t.toFixed(2)).join(' ')}`;
  }],

  ['Salvar na pasta do projeto', async () => {
    await ava('__r.irPara(0)');
    await naCena();
    await tecla('s', 'ambos', 2);
    const achou = await ate(`__r.listar().some((n) => n.endsWith('.bone') && !n.includes('/'))`, 8000);
    if (!achou) {
      await ava(`__r.acoes.runAction('salvar')`);
      await ate(`__r.listar().some((n) => n.endsWith('.bone'))`, 8000);
    }
    await ate(`__r.listar().some((n) => n.endsWith('.atlas.json'))`, 8000);
    const arquivos = await ava('__r.listar()');
    nomeSalvo = arquivos.find((n) => n.endsWith('.bone') && !n.includes('/')) ?? null;
    if (nomeSalvo === null) return `nenhum .bone na pasta (${arquivos.join(', ')})`;
    arquivoSalvo = await ava(`__r.lerArquivo(${JSON.stringify(nomeSalvo)})`);
    const atlasNome = arquivos.find((n) => n.endsWith('.atlas.json'));
    const faltas = [];
    if (atlasNome === undefined) faltas.push('sem .atlas.json ao lado');
    else {
      const atlas = JSON.parse(await ava(`__r.lerArquivo(${JSON.stringify(atlasNome)})`));
      // O atlas guarda as regiões numa lista própria, com o índice da página (§10.3).
      const regioes = (atlas.regions ?? []).map((r) => r.name);
      if (regioes.includes('bracos/mao_aberta')) faltas.push('a mão aberta, que não está em uso, entrou no atlas');
      if (!regioes.includes('bracos/mao_fechada')) faltas.push('a mão fechada, em uso, não entrou no atlas');
      if (regioes.length !== 9) faltas.push(`${regioes.length} regiões no atlas, não as 9 em uso`);
    }
    if (!arquivos.some((n) => n.endsWith('.png') && !n.includes('/'))) faltas.push('sem a página do atlas');
    const bone = JSON.parse(arquivoSalvo);
    if (!(bone.assets?.atlases ?? []).includes(atlasNome)) faltas.push('o .bone não cita o atlas');
    // A prova de salvar/fechar/reabrir: a arrumação da tela (painel recolhido,
    // flutuante, a altura da faixa) mora na MÁQUINA desde a v12.5 — o `.bone`
    // só pode levar o que `EditorState` (`contract.ts`) declara. Um campo a
    // mais aqui É o arranjo da tela vazando para dentro do arquivo.
    // Degrau 9 (18/09/2026, E10): `skins` virou dois campos — `pilha` (a pilha
    // inteira, de baixo para cima, com a `default` dentro) e `emEdicao` (o
    // lápis). Os dois são estado do EDITOR e moram no mesmo lugar que `skins`
    // morava; `skins` continua sendo gravado como vista velha, para um editor
    // de antes do degrau abrir o arquivo igual.
    const ESTADO_PERMITIDO = new Set(['camera', 'selection', 'animation', 'skins', 'pilha', 'emEdicao', 'view']);
    const estadoSalvo = bone.extensions?.RECORTE_editor_state ?? {};
    const vazou = Object.keys(estadoSalvo).filter((k) => !ESTADO_PERMITIDO.has(k));
    if (vazou.length > 0) {
      faltas.push(`o arquivo salvo levou arranjo de tela para dentro: ${vazou.join(', ')} (isso mora só na máquina, não no .bone)`);
    }
    return faltas.length === 0 || faltas.join('; ');
  }],

  ['Fecha, reabre a pasta, continua', async () => {
    if (arquivoSalvo === null) return 'o passo 13 não salvou';

    // FECHAR de verdade: recarrega a página. Isto apaga TODO o estado em
    // memória — o `window`, o documento, a pasta de mentira inteira — que é
    // exatamente o que "limpar a memória" (o antigo `runAction('novo')`) não
    // provava. Antes de recarregar, o script guarda os bytes da pasta salva
    // no lado do Node: são eles que atravessam, como um disco atravessaria.
    const nomesAntes = await ava('__r.listar()');
    const bytesAntes = {};
    for (const nome of nomesAntes) {
      bytesAntes[nome] = nome.endsWith('.png')
        ? { b64: await ava(`__r.lerArquivoB64(${JSON.stringify(nome)})`) }
        : { texto: await ava(`__r.lerArquivo(${JSON.stringify(nome)})`) };
    }

    await cmd('Page.navigate', { url: URL_EDITOR });
    let montouDeNovo = false;
    for (let i = 0; i < 80 && !montouDeNovo; i++) {
      await esperar(250);
      try { montouDeNovo = await ava(`!!document.querySelector('canvas.viewport-canvas')`); } catch { /* carregando */ }
    }
    if (!montouDeNovo) return 'a página não recarregou (sem o canvas de novo)';
    await esperar(800);
    // A janela de recuperar o rascunho deixou de ser um `confirm` do navegador
    // no degrau 11, lote 7 (A2): agora é uma janela nossa, com os três
    // caminhos escritos. O roteiro escolhe **Agora não — guardar o rascunho**,
    // pela mesma razão de antes: recuperar da memória mascararia a prova de
    // que o documento voltou do ARQUIVO salvo na pasta. E ela também prova o
    // A2: escolher "agora não" NÃO apaga o rascunho.
    const recuperar = await ava(`(() => {
      const b = [...document.querySelectorAll('.dialog-escolha button')]
        .find((x) => x.textContent.includes('Agora não'));
      if (!b) return 'sem a janela de recuperar';
      b.click();
      return 'recusada';
    })()`);
    if (recuperar === 'recusada') janelasRecusadas.push('Havia trabalho não salvo (janela do programa)');
    await esperar(200);
    const rascunhoFicou = await ava('localStorage.getItem("recorte.rascunho") !== null');
    if (recuperar === 'recusada' && !rascunhoFicou) {
      return 'A2: "Agora não" apagou o rascunho — fechar a janela nunca pode apagar';
    }
    await ava(AJUDANTES);
    await ava('__r.carregar()');

    // A prova do fechar: logo depois de recarregar, ANTES de reabrir nada, o
    // documento tem de estar vazio de verdade. Se algo sobreviveu aqui, o
    // recarregamento não fechou o programa — só pareceu.
    const eVazio = await ava(`(() => { const d = __r.doc(); return (d.file.slots ?? []).length === 0 && d.animation === null; })()`);
    if (!eVazio) return 'depois de recarregar a página, o documento não voltou vazio — isto não fechou de verdade';

    await ava(`__r.recriarPasta(${JSON.stringify(bytesAntes)})`);
    const botao = await ate(`(() => { const b = document.querySelector('.boas-vindas-botao[data-acao="abrir-pasta"]'); return __r.visivel(b) ? __r.centro(b) : null; })()`, 3000);
    if (!botao) return 'depois de recarregar, sem o botão Abrir pasta';
    await clicar(botao);
    // A espera era 5 s, e sempre esteve na beira — decisão P39, 29/09/2026,
    // defeito C1. Medido do clique ao documento cheio: hoje 4,6 s e 5,3 s com
    // a máquina vazia; a v22.8 (22/09) 5,3 s e 6,2 s; sob carga, 11 a 41 s.
    // Em 22/09 passou por sorte do relógio. Alargar a ESPERA não muda o que o
    // passo prova: ele continua recusando o rascunho, reabrindo a pasta e
    // conferindo o arquivo inteiro. A lentidão de verdade está escrita na
    // lista de defeitos, para `io/project-folder.ts`.
    await ate('(__r.doc().file.slots ?? []).length > 0', 30000);
    const agora = await ava('__r.doc().serialize()');
    const a = JSON.parse(arquivoSalvo);
    const b = JSON.parse(agora);
    // `bone.modified` é a hora em que o arquivo foi escrito: o `serialize` de
    // agora carimba a hora de agora. Não é diferença de conteúdo.
    if (a.bone) delete a.bone.modified;
    if (b.bone) delete b.bone.modified;
    const diferentes = [...new Set([...Object.keys(a), ...Object.keys(b)])]
      .filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    const faltas = [];
    if (diferentes.length > 0) {
      // Chave curta: mostra o salvo e o reaberto, para o relatório dizer o quê
      // — item por item, não só "bones" ou "animations" quando é UM osso, ou
      // UMA chave dentro de UMA animação, que não voltou.
      const pedaco = (v) => (JSON.stringify(v) ?? 'nada').slice(0, 60);
      const subDiff = (s, r) => [...new Set([...Object.keys(s), ...Object.keys(r)])]
        .filter((c) => JSON.stringify(s[c]) !== JSON.stringify(r[c]));
      const como = (k) => {
        const s = a[k];
        const r = b[k];
        // Lista (ossos, animações, slots…): aponta o ÍNDICE que mudou, e dentro
        // dele o campo, em vez de despejar a lista inteira.
        if (Array.isArray(s) && Array.isArray(r)) {
          const n = Math.max(s.length, r.length);
          const linhas = [];
          for (let i = 0; i < n; i++) {
            const si = s[i];
            const ri = r[i];
            if (JSON.stringify(si) === JSON.stringify(ri)) continue;
            if (si && ri && typeof si === 'object' && typeof ri === 'object' && !Array.isArray(si)) {
              const sub = subDiff(si, ri);
              linhas.push(`[${i}] (${si.name ?? si.target ?? i}).{${sub.map((c) => `${c}: ${pedaco(si[c])} → ${pedaco(ri[c])}`).join(', ')}}`);
            } else {
              linhas.push(`[${i}]: ${pedaco(si)} → ${pedaco(ri)}`);
            }
          }
          if (s.length !== r.length) linhas.push(`tamanho ${s.length} → ${r.length}`);
          return `${k}${linhas.map((l) => (l.startsWith('[') ? l : `.${l}`)).join(', ')}`;
        }
        // Objeto: diz quais campos de dentro mudaram, com um pedaço de cada lado.
        if (s && r && typeof s === 'object' && typeof r === 'object') {
          const sub = subDiff(s, r);
          return `${k}.{${sub.map((c) => `${c}: ${pedaco(s[c])} → ${pedaco(r[c])}`).join(', ')}}`;
        }
        const t1 = JSON.stringify(s) ?? 'nada';
        const t2 = JSON.stringify(r) ?? 'nada';
        return t1.length + t2.length < 240 ? `${k} (salvo ${t1} · reaberto ${t2})` : k;
      };
      faltas.push(`reaberto diferente do salvo em: ${diferentes.map(como).join('; ')}`);
    }
    // A linha da animação pode trazer a estrela da primeira antes do nome.
    const item = await ava(`(() => { const b = __r.q('.anim-item').find((x) => x.textContent.includes(${JSON.stringify(animacao)})); return b ? (b.click(), true) : false; })()`);
    if (!item) faltas.push(`sem a animação ${animacao} na lista`);
    await esperar(200);
    // Com o foco fora da cena: na cena o Espaço arrasta a vista (passo 12).
    await ava('(document.activeElement?.blur(), true)');
    await tecla(' ');
    const t1 = await ava('__r.doc().time');
    await esperar(400);
    const t2 = await ava('__r.doc().time');
    await tecla(' ');
    if (Math.abs(t2 - t1) < 1e-3) faltas.push('a animação reaberta não toca');
    return faltas.length === 0 || faltas.join('; ');
  }],
];

// ---------------------------------------------------------------------------
// Rodar
// ---------------------------------------------------------------------------

const perfil = mkdtempSync(join(tmpdir(), 'recorte-roteiro-'));
let codigo = 0;
try {
  await subirEditor();
  const pagina = await subirChrome(perfil);
  ws = new WebSocket(pagina.webSocketDebuggerUrl);
  await new Promise((ok, erro) => { ws.onopen = ok; ws.onerror = erro; });
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id !== undefined && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); return; }
    if (m.method === 'Runtime.consoleAPICalled' && (m.params.type === 'error' || m.params.type === 'warning')) {
      consoleDaPagina.push(`${m.params.type}: ${m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ')}`);
    }
    if (m.method === 'Runtime.exceptionThrown') {
      consoleDaPagina.push(`exceção: ${m.params.exceptionDetails.exception?.description ?? m.params.exceptionDetails.text}`);
    }
    if (m.method === 'Page.javascriptDialogOpening') {
      // O passo 14 recarrega a página de propósito, para fechar de verdade —
      // e isso desperta "Havia trabalho não salvo, quer recuperar?" (o
      // rascunho automático do que o script mesmo andou fazendo). Aceitar
      // essa recuperação mascararia o teste: o documento voltaria da MEMÓRIA
      // do rascunho, não do arquivo salvo na pasta. É a única que se recusa.
      const recuperar = /recuperar/i.test(m.params.message);
      (recuperar ? janelasRecusadas : janelasAceitas).push(m.params.message);
      void cmd('Page.handleJavaScriptDialog', { accept: !recuperar });
    }
  };
  await cmd('Runtime.enable');
  await cmd('Page.enable');
  await cmd('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await cmd('Page.navigate', { url: URL_EDITOR });
  let montou = false;
  for (let i = 0; i < 80 && !montou; i++) {
    await esperar(250);
    try { montou = await ava(`!!document.querySelector('canvas.viewport-canvas')`); } catch { /* carregando */ }
  }
  if (!montou) throw new Error('o editor não montou');
  await esperar(800);
  await ava(AJUDANTES);
  await ava('__r.carregar()');
  if (FOTOS !== null) mkdirSync(FOTOS, { recursive: true });

  const linhas = [];
  for (let i = 0; i < PASSOS.length; i++) {
    const [nome, passo] = PASSOS[i];
    let saida;
    const t0 = Date.now();
    try {
      saida = await passo();
    } catch (erro) {
      // A pilha inteira vai para a caixa da queda; na tela, a primeira linha.
      saida = `quebrou: ${erro instanceof Error ? (erro.stack ?? erro.message) : String(erro)}`;
    }
    const ms = Date.now() - t0;
    const passou = saida === true;
    if (!passou) codigo = 1;
    linhas.push({ n: i + 1, nome, passou, ms, detalhe: passou ? '' : String(saida) });
    const curta = String(saida).split('\n')[0];
    console.log(`${String(i + 1).padStart(2)}  ${passou ? 'passou' : 'FALTOU'}  ${nome}  (${(ms / 1000).toFixed(1)} s)${passou ? '' : `\n            ${curta}`}`);
    if (!passou) await guardarQueda(i + 1, nome, String(saida), linhas);
    if (FOTOS !== null) {
      const foto = await cmd('Page.captureScreenshot', { format: 'png' });
      writeFileSync(join(FOTOS, `passo-${String(i + 1).padStart(2, '0')}.png`), Buffer.from(foto.result.data, 'base64'));
    }
  }
  const passaram = linhas.filter((l) => l.passou).length;
  console.log(`\n${passaram} de ${PASSOS.length} passos passaram.`);
  if (janelasAceitas.length > 0) console.log(`Janelas de confirmação aceitas: ${janelasAceitas.map((t) => JSON.stringify(t.slice(0, 80))).join(' | ')}`);
  if (janelasRecusadas.length > 0) console.log(`Janelas de confirmação recusadas: ${janelasRecusadas.map((t) => JSON.stringify(t.slice(0, 80))).join(' | ')}`);
  console.log(consoleDaPagina.length === 0 ? 'Console limpo.' : `Console:\n  ${consoleDaPagina.slice(0, 20).join('\n  ')}`);
} catch (erro) {
  console.error(`O roteiro não rodou: ${erro instanceof Error ? erro.message : String(erro)}`);
  codigo = 2;
} finally {
  try { ws?.close(); } catch { /* fechado */ }
  encerrar();
  await esperar(300);
  try { rmSync(perfil, { recursive: true, force: true }); } catch { /* o Chrome ainda segura algum arquivo */ }
}
process.exit(codigo);
