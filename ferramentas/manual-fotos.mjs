// SPDX-License-Identifier: Apache-2.0
// Tira TODAS as fotos do manual, do programa de verdade, num comando só.
//
// POR QUE EXISTE
// --------------
// Foto tirada à mão envelhece uma a uma: cada lote mexe num painel, e meses
// depois metade das fotos mostra uma tela que não existe mais. Esta lista tira
// todas de novo. O degrau D13 (05/11/2026) trocou as fotos assim.
//
// COMO
// ----
// - Playwright com o Chromium sem janela. 1440×900, escala 1 — o tamanho em
//   que a interface foi medida.
// - O script SOBE o próprio servidor do editor (porta 5193) e o derruba no fim.
// - Cada foto é um passo: arruma a tela, e fotografa. Um passo que não acha o
//   que procura PARA o programa (regra 21): foto de uma tela que não entrou no
//   estado pedido é pior que foto nenhuma.
// - A parte "montar" refaz o começo do Roteiro dos 30 minutos com uma pasta de
//   mentira, em memória (a mesma ideia do `provas/roteiro-30.mjs`): as peças
//   são retângulos coloridos, e a foto mostra o programa, não a arte.
//
// USO, da raiz do projeto:
//
//   node ferramentas/manual-fotos.mjs            todas
//   node ferramentas/manual-fotos.mjs 04-        só as que começam com "04-"
//
// Grava em documentos/manual/imagens/. No fim, uma linha por foto e o console
// da página. Console com erro: não publique as fotos.

import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const DESTINO = resolve(RAIZ, 'documentos', 'manual', 'imagens');
const PORTA = 5193;
const URL_EDITOR = `http://localhost:${PORTA}/`;
const SO = process.argv[2] ?? null;

// O Playwright não está no package.json: vem do sistema (o ambiente da nuvem
// o traz instalado). Sem ele, o script diz o que falta e para.
let chromium;
try {
  ({ chromium } = createRequire(import.meta.url)('playwright'));
} catch {
  console.error('Falta o Playwright. Instale com: npm install --no-save playwright');
  process.exit(2);
}

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------------
// As peças do boneco de exemplo: as mesmas do Roteiro dos 30 minutos
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
  { nome: 'bracos/braco_tras', w: 20, h: 60, cor: '#2c4b80', x: -32, y: 100 },
];

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
window.__f = (() => {
  const r = {};
  r.carregar = async () => {
    r.vp = (await import('/src/viewport/viewport.ts')).viewportPanel;
    r.acoes = await import('/src/ui/actions.ts');
    r.picking = await import('/src/viewport/picking.ts');
    r.caixa = await import('/src/viewport/transform-box.ts');
    return true;
  };
  r.doc = () => r.vp.doc;
  r.q = (s) => [...document.querySelectorAll(s)];
  r.visivel = (el) => el !== null && el !== undefined && el.getClientRects().length > 0;
  r.tela = (x, y) => {
    const c = r.vp.canvas.getBoundingClientRect();
    const p = r.vp.camera.worldToScreen(x, y);
    return { x: c.left + p.x, y: c.top + p.y };
  };
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
  r.centroDoSlot = (slot) => {
    const sk = r.doc().skeleton;
    const s = sk?.findSlot(slot);
    if (!s || !s.attachment) return null;
    const w = r.picking.attachmentWorldPoints(s, s.attachment);
    if (w === null) return null;
    let x = 0; let y = 0;
    for (let i = 0; i < w.count; i++) { x += w.vertices[i * 2]; y += w.vertices[i * 2 + 1]; }
    return { x: x / w.count, y: y / w.count };
  };
  r.irPara = (t) => { const d = r.doc(); d.time = t; d.repose?.(); return d.time; };
  r.linhaArvore = (nome) => r.q('.arvore-item').find((b) => (b.querySelector('.arvore-nome')?.textContent ?? '').trim() === nome) ?? null;
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
        return { async write(d) { partes.push(d); }, async close() { h._file = new File(partes, nome); } };
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
      async resolve() { return null; },
    };
    return h;
  };
  r.montarPasta = async (pecas) => {
    const raiz = r.pasta('boneco');
    for (const p of pecas) {
      const [sub, nome] = p.nome.split('/');
      const dir = await raiz.getDirectoryHandle(sub, { create: true });
      const blob = await r.png(p.w, p.h, p.cor);
      dir._filhos.set(nome + '.png', r.arquivo(nome + '.png', new File([blob], nome + '.png', { type: 'image/png' })));
    }
    window.showDirectoryPicker = async () => raiz;
    window.showSaveFilePicker = async (o) => raiz.getFileHandle((o && o.suggestedName) || 'boneco.bone', { create: true });
    return true;
  };
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
// O servidor e o navegador
// ---------------------------------------------------------------------------

const servidor = spawn(process.execPath, [resolve(RAIZ, 'node_modules', 'vite', 'bin', 'vite.js'), 'editor', '--port', String(PORTA), '--strictPort'], {
  cwd: RAIZ, stdio: 'ignore',
});
const fim = () => { try { servidor.kill(); } catch { /* já foi */ } };
process.on('exit', fim);

for (let i = 0; ; i++) {
  try { const r = await fetch(URL_EDITOR); if (r.ok) break; } catch { /* ainda subindo */ }
  if (i > 60) { console.error('O editor não subiu na porta ' + PORTA); process.exit(2); }
  await esperar(500);
}

mkdirSync(DESTINO, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const consola = [];
pagina.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consola.push(`${m.type()}: ${m.text()}`); });
pagina.on('pageerror', (e) => consola.push(`erro: ${e.message}`));
pagina.on('dialog', (d) => { consola.push(`janela aceita: ${d.message().slice(0, 80)}`); d.accept(); });

const ava = (js) => pagina.evaluate(js);
async function ate(js, ms = 4000) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { if (await ava(js)) return true; await esperar(80); }
  return false;
}
function exigir(ok, oque) { if (!ok) throw new Error(oque); }

async function abrirLimpo() {
  await pagina.goto(URL_EDITOR);
  await pagina.waitForSelector('.menu-button');
  await ava(AJUDANTES);
  await ava('__f.carregar()');
  await esperar(500);
}
async function heroi() {
  await abrirLimpo();
  // Pelo menu, e não pelo botão das boas-vindas: depois de um passo que
  // montou um boneco, a página volta com o rascunho, sem as boas-vindas.
  await menu('Arquivo');
  await itemDeMenu('Abrir o herói');
  exigir(await ate(`(__f.doc().file.bones ?? []).length > 5`), 'o herói não abriu');
  await esperar(600);
}
async function fecharMenus() {
  await pagina.keyboard.press('Escape');
  await pagina.mouse.click(720, 880);
  await esperar(150);
}
async function menu(nome) {
  await fecharMenus();
  await pagina.locator('.menu-button', { hasText: new RegExp(`^${nome}$`) }).click();
  await esperar(200);
}
async function submenu(comeco) {
  const ok = await ava(`(() => { const b = __f.q('.menu-item-pai').find((x) => x.textContent.trim().startsWith(${JSON.stringify(comeco)}) && __f.visivel(x)); if (!b) return false; b.focus(); return true; })()`);
  exigir(ok, `sem o submenu ${comeco}`);
  await esperar(200);
}
async function itemDeMenu(comeco) {
  const ok = await ava(`(() => { const b = __f.q('.menu-item').find((x) => (x.querySelector('.menu-name')?.textContent ?? x.textContent).trim().startsWith(${JSON.stringify(comeco)}) && __f.visivel(x)); if (!b) return false; b.click(); return true; })()`);
  exigir(ok, `sem o item ${comeco}`);
  await esperar(300);
}
async function aba(nome) {
  const ok = await ava(`(() => { const b = __f.q('.panel-tab, .dock-tab').find((x) => x.textContent.trim() === ${JSON.stringify(nome)}); if (!b) return false; b.click(); return true; })()`);
  exigir(ok, `sem a aba ${nome}`);
  await esperar(250);
}
async function acao(id) {
  await ava(`__f.acoes.runAction(${JSON.stringify(id)})`);
  await esperar(250);
}
async function naCena() {
  const c = await ava(`(() => { const b = __f.vp.canvas.getBoundingClientRect(); return { x: b.left + 8, y: b.top + 8 }; })()`);
  await ava(`document.querySelector('.viewport')?.focus()`);
  return c;
}
async function ponto(x, y) { return ava(`__f.tela(${x}, ${y})`); }
async function arrastar(de, para, passos = 8) {
  await pagina.mouse.move(de.x, de.y);
  await pagina.mouse.down();
  for (let i = 1; i <= passos; i++) await pagina.mouse.move(de.x + ((para.x - de.x) * i) / passos, de.y + ((para.y - de.y) * i) / passos);
  await pagina.mouse.up();
  await esperar(150);
}
async function animacao(nome) {
  // A linha da lista Animações: o nome, depois a duração ("walk1,00 s").
  const ok = await ava(`(() => { const b = __f.q('.anim-item').find((x) => { const t = x.textContent.replace(/^[\\s★]+/, ''); return t.startsWith(${JSON.stringify(nome)}) && !/[a-z_]/i.test(t[${nome.length}] ?? ''); }); if (!b) return false; b.click(); return true; })()`);
  exigir(ok, `sem a animação ${nome} na lista`);
  exigir(await ate(`__f.doc().animation === ${JSON.stringify(nome)}`), `a animação ${nome} não abriu`);
  await esperar(300);
}
async function escolherOsso(nome) {
  const ok = await ava(`(() => { const b = __f.linhaArvore(${JSON.stringify(nome)}); if (!b) return false; b.click(); return true; })()`);
  exigir(ok, `sem a linha ${nome} na Árvore`);
  await esperar(200);
}

const feitas = [];
async function foto(nome, recorte) {
  const caminho = resolve(DESTINO, nome);
  await esperar(250);
  await pagina.screenshot({ path: caminho, ...(recorte ? { clip: recorte } : {}) });
  feitas.push(nome);
}
/** O retângulo de um elemento, com folga, para recortar. */
async function caixaDe(seletor, folga = 4) {
  const b = await ava(`(() => { const e = __f.q(${JSON.stringify(seletor)}).find((x) => __f.visivel(x)); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, width: r.width, height: r.height }; })()`);
  exigir(b !== null, `sem ${seletor} à vista`);
  const x = Math.max(0, b.x - folga);
  const y = Math.max(0, b.y - folga);
  return { x, y, width: Math.min(1440 - x, b.width + folga * 2), height: Math.min(900 - y, b.height + folga * 2) };
}
/** O menu aberto e o pedaço da tela em volta dele. */
async function caixaDoMenu() {
  const b = await ava(`(() => { const ls = __f.q('.menu-list').filter((x) => __f.visivel(x)); if (ls.length === 0) return null;
    let x0 = 1e9, y0 = 0, x1 = 0, y1 = 0; for (const l of ls) { const r = l.getBoundingClientRect(); x0 = Math.min(x0, r.left); x1 = Math.max(x1, r.right); y1 = Math.max(y1, r.bottom); }
    return { x: x0, y: y0, x1, y1 }; })()`);
  exigir(b !== null, 'nenhum menu aberto');
  const x = Math.max(0, b.x - 20);
  return { x, y: 0, width: Math.min(1440 - x, b.x1 - x + 20), height: Math.min(900, b.y1 + 12) };
}

// ---------------------------------------------------------------------------
// As fotos
// ---------------------------------------------------------------------------

/** [nome, função]. A função arruma a tela e chama `foto`. */
const PASSOS = [];
/** A coluna da direita inteira: a aba que se abriu pode mudar de altura. */
const DIREITA = { x: 1180, y: 88, width: 260, height: 630 };
const passo = (nome, fn) => PASSOS.push([nome, fn]);

// --- 00: abrir, a tela, os menus -------------------------------------------

passo('00-boas-vindas.png', async () => {
  await abrirLimpo();
  await foto('00-boas-vindas.png');
});

passo('00-a-tela.png', async () => {
  await heroi();
  await foto('00-a-tela.png');
  await foto('00-barra-de-acoes.png', { x: 0, y: 44, width: 1440, height: 44 });
  await foto('00-rodape-base.png', { x: 0, y: 850, width: 900, height: 50 });
  await foto('00-ver-e-travar.png', { x: 885, y: 44, width: 220, height: 44 });
});

const MENUS = [
  ['Arquivo', '00-menu-arquivo.png'], ['Editar', '00-menu-editar.png'], ['Imagens', '00-menu-imagens.png'],
  ['Base', '00-menu-base.png'], ['Malha e regras', '00-menu-malha-e-regras.png'], ['Animação', '00-menu-animacao.png'],
  ['Skins', '00-menu-skins.png'], ['Entidades', '00-menu-entidades.png'], ['Partículas', '00-menu-particulas.png'],
  ['Exibir', '00-menu-exibir.png'], ['Janela', '00-menu-janela.png'], ['Ajuda', '00-menu-ajuda.png'],
];
passo('00-menu-', async () => {
  await heroi();
  for (const [nome, arquivo] of MENUS) {
    if (SO !== null && SO !== '00-menu-' && !arquivo.startsWith(SO)) continue;
    await menu(nome);
    await foto(arquivo, await caixaDoMenu());
  }
  await fecharMenus();
});

passo('00-rodape-animacao.png', async () => {
  await heroi();
  await animacao('walk');
  await foto('00-rodape-animacao.png', { x: 0, y: 850, width: 900, height: 50 });
});

passo('00-paleta.png', async () => {
  await heroi();
  await acao('paleta');
  await pagina.keyboard.type('chave');
  await esperar(300);
  await foto('00-paleta.png');
  await pagina.keyboard.press('Escape');
});

// --- 01: montar um corpo, com a pasta de mentira ---------------------------

const ossoDe = {};
async function montarAte(etapa) {
  await abrirLimpo();
  await ava(`__f.montarPasta(${JSON.stringify(PECAS)})`);
  await menu('Arquivo');
  await itemDeMenu('Abrir pasta do projeto');
  exigir(await ate(`document.body.innerText.includes('mao_fechada')`, 6000), 'a pasta não abriu');
  await esperar(400);
  if (etapa === 'pasta') return;

  for (const p of PECAS) {
    if (p.x === undefined) continue;
    const alvo = await ponto(p.x, p.y);
    await ava(`__f.soltar(${JSON.stringify(p.nome)}, ${alvo.x}, ${alvo.y})`);
    await esperar(200);
  }
  exigir(await ate(`(__f.doc().file.slots ?? []).length >= 9`, 5000), 'as peças não entraram na cena');
  // O boneco de retângulos é pequeno: Exibir → Ajustar à tela, e ele enche a cena.
  await pagina.mouse.click(720, 880);
  await acao('ajustar');
  if (etapa === 'pecas') return;
  // O braço de trás vai para trás do tronco.
  const braco = await ava(`__f.slotDe('bracos/braco_tras')`);
  const c = await ava(`__f.centroDoSlot(${JSON.stringify(braco)})`);
  const p = await ponto(c.x, c.y);
  await pagina.mouse.click(p.x, p.y);
  for (let i = 0; i < 12; i++) await ava(`__f.acoes.runAction('descer-ordem')`);
  await esperar(200);
  if (etapa === 'ordem') return;
  for (const o of OSSOS) {
    await naCena();
    await pagina.keyboard.press('t');
    if (o.pai === null) await pagina.keyboard.press('Escape');
    else await escolherOsso(ossoDe[o.pai]);
    await naCena();
    await pagina.keyboard.press('b');
    const antes = await ava('__f.doc().file.bones.map((b) => b.name)');
    await arrastar(await ponto(...o.de), await ponto(...o.ate));
    const novo = await ava(`__f.doc().file.bones.map((b) => b.name).find((n) => !${JSON.stringify(antes)}.includes(n)) ?? null`);
    exigir(novo !== null, `o osso ${o.id} não nasceu`);
    ossoDe[o.id] = novo;
  }
  await naCena();
  await pagina.keyboard.press('t');
  if (etapa === 'ossos') return;
  for (const o of OSSOS) {
    if (o.pecas.length === 0) continue;
    await escolherOsso(ossoDe[o.id]);
    await naCena();
    await pagina.keyboard.down('p');
    for (const imagem of o.pecas) {
      const slot = await ava(`__f.slotDe(${JSON.stringify(imagem)})`);
      const cc = await ava(`__f.centroDoSlot(${JSON.stringify(slot)})`);
      const pp = await ponto(cc.x, cc.y);
      await pagina.mouse.click(pp.x, pp.y);
      await esperar(120);
    }
    await pagina.keyboard.up('p');
  }
  await esperar(200);
}

passo('01-', async () => {
  await montarAte('pasta');
  await foto('01-1-a-pasta.png');
  await montarAte('pecas');
  await foto('01-2-as-pecas.png');
  await montarAte('ordem');
  await aba('Ordem');
  await foto('01-3-a-ordem.png');
  await montarAte('ossos');
  await foto('01-4-os-ossos.png');
  // O gesto P: o osso escolhido, P segurado, o rodapé dizendo o que fazer.
  await escolherOsso(ossoDe.tronco);
  await naCena();
  await pagina.keyboard.down('p');
  await esperar(300);
  await foto('01-5-segurar-p.png');
  await pagina.keyboard.up('p');
  await montarAte('prender');
  await aba('Árvore');
  await foto('01-6-preso.png');
});

// --- 01: os painéis e os gestos, no herói ----------------------------------

passo('01-imagens.png', async () => {
  await heroi();
  await aba('Imagens');
  await foto('01-imagens.png', DIREITA);
});

passo('01-arvore.png', async () => {
  await heroi();
  await aba('Árvore');
  await foto('01-arvore.png', { x: 0, y: 88, width: 262, height: 360 });
  await aba('Ordem');
  await foto('01-ordem.png', { x: 0, y: 88, width: 262, height: 360 });
});

passo('01-propriedades.png', async () => {
  await heroi();
  await escolherOsso('torso');
  await foto('01-propriedades.png', { x: 0, y: 445, width: 262, height: 275 });
});

passo('01-criar-osso.png', async () => {
  await heroi();
  await naCena();
  await pagina.keyboard.press('b');
  await esperar(200);
  await foto('01-criar-osso.png');
});

passo('01-transformar.png', async () => {
  await heroi();
  await escolherOsso('torso');
  await naCena();
  await pagina.keyboard.press('t');
  await esperar(200);
  await foto('01-transformar.png', { x: 440, y: 88, width: 560, height: 630 });
});

passo('01-retangulo.png', async () => {
  await heroi();
  await naCena();
  await pagina.keyboard.press('q');
  const a = await ponto(-90, 230);
  const b = await ponto(90, -10);
  await arrastar(a, b);
  await foto('01-retangulo.png');
});

passo('01-exibicao.png', async () => {
  await heroi();
  await aba('Exibição');
  await foto('01-exibicao.png');
});

// --- 02: bases e animações --------------------------------------------------

passo('02-animacoes.png', async () => {
  await heroi();
  await aba('Animações');
  await foto('02-animacoes.png', DIREITA);
  await animacao('walk');
  await foto('02-animacao-aberta.png');
});

// --- 03: skins --------------------------------------------------------------

passo('03-skins.png', async () => {
  await heroi();
  await aba('Skins');
  await foto('03-skins.png', DIREITA);
});

// --- 04: animar ------------------------------------------------------------

passo('04-', async () => {
  await heroi();
  await animacao('walk');
  await ava('__f.irPara(0.25)');
  await esperar(300);
  await foto('04-animando.png');
  await foto('04-tocador.png', { x: 0, y: 720, width: 1440, height: 125 });
  await acao('detalhes-faixa');
  await esperar(400);
  await foto('04-linha-do-tempo.png');
  await acao('detalhes-faixa');
  await aba('Curvas');
  await escolherOsso('torso');
  await esperar(300);
  await foto('04-curvas.png');
  await aba('Linha do tempo');
  await acao('ver-cebola');
  await esperar(400);
  await foto('04-casca-de-cebola.png', { x: 440, y: 88, width: 560, height: 630 });
  await acao('ver-cebola');
  await menu('Animação');
  await submenu('Ir para');
  await foto('04-menu-ir-para.png', await caixaDoMenu());
  await fecharMenus();
});

// --- 05: entidades ---------------------------------------------------------

passo('05-entidades.png', async () => {
  await heroi();
  await aba('Entidades');
  await foto('05-entidades.png', DIREITA);
});

// --- 06: malha e pesos -----------------------------------------------------

passo('06-', async () => {
  await heroi();
  // O rosto do herói é a malha do exemplo: a linha "face" da Árvore.
  const achou = await ava(`(() => { const b = __f.q('.arvore-item').find((x) => x.textContent.includes('face')); if (!b) return false; b.scrollIntoView(); b.click(); return true; })()`);
  exigir(achou, 'sem a linha do rosto na Árvore');
  await esperar(300);
  await naCena();
  await pagina.keyboard.press('m');
  await esperar(300);
  await aba('Malha e pesos');
  await foto('06-malha.png');
  await naCena();
  await pagina.keyboard.press('g');
  await esperar(300);
  await foto('06-pesos.png');
});

// --- 07: regras ------------------------------------------------------------

passo('07-', async () => {
  await heroi();
  await aba('Regras');
  await foto('07-regras.png', DIREITA);
  await menu('Malha e regras');
  await itemDeMenu('Nova regra');
  await esperar(400);
  // A janela pergunta o tipo primeiro; a foto mostra a primeira escolha feita.
  await pagina.locator('select:visible').last().selectOption({ index: 1 });
  await esperar(400);
  await foto('07-nova-regra.png');
  await pagina.keyboard.press('Escape');
});

// --- 08: exportar ----------------------------------------------------------

passo('08-', async () => {
  await heroi();
  await menu('Arquivo');
  await submenu('Exportar');
  await foto('08-menu-exportar.png', await caixaDoMenu());
  await itemDeMenu('GIF, PNG, folha');
  await esperar(500);
  await foto('08-exportar-imagem.png');
  await pagina.keyboard.press('Escape');
});

passo('08-recorte-na-cena.png', async () => {
  // Animação → Recorte na cena (C): o retângulo da exportação, só desta animação.
  await heroi();
  await animacao('walk');
  await menu('Animação');
  await itemDeMenu('Recorte na cena');
  await esperar(400);
  await foto('08-recorte-na-cena.png');
  await pagina.keyboard.press('Enter');
});

// --- 09: vindo de outro programa -------------------------------------------

passo('09-', async () => {
  await heroi();
  await menu('Arquivo');
  await submenu('Importar');
  await foto('09-menu-importar.png', await caixaDoMenu());
  await fecharMenus();
});

// --- 10: partículas --------------------------------------------------------

passo('10-', async () => {
  await heroi();
  await escolherOsso('torso');
  await menu('Partículas');
  await itemDeMenu('Fogo');
  await esperar(800);
  await aba('Partículas');
  await foto('10-particulas.png');
  await menu('Animação');
  await submenu('Animações');
  await itemDeMenu('Biblioteca de animações');
  await esperar(400);
  await foto('10-biblioteca.png');
  await pagina.keyboard.press('Escape');
});

// ---------------------------------------------------------------------------

let falhou = 0;
for (const [nome, fn] of PASSOS) {
  if (SO !== null && !nome.startsWith(SO) && SO !== nome) continue;
  try {
    await fn();
    console.log(`ok     ${nome}`);
  } catch (e) {
    falhou++;
    console.log(`FALHOU ${nome}: ${e.message.split('\n')[0]}`);
  }
}
console.log(`\n${feitas.length} fotos gravadas em ${DESTINO}`);
for (const f of feitas) console.log(`  ${f}`);
if (consola.length > 0) {
  console.log('\nconsole da página:');
  for (const l of consola) console.log(`  ${l}`);
}
await navegador.close();
fim();
process.exit(falhou === 0 ? 0 : 1);
