// SPDX-License-Identifier: Apache-2.0
// Grava o manual inteiro num PDF.
//
// POR QUE ELE NÃO TEM UM RENDERIZADOR PRÓPRIO
// -------------------------------------------
// O editor já sabe montar o manual numa página só: é o que o **Ajuda → Manual**
// (`F1`) faz, e quem faz é o `editor/src/io/manual.ts`. Escrever aqui um
// segundo conversor de Markdown criaria duas versões da mesma coisa, e em
// pouco tempo o PDF diria uma coisa e o programa diria outra.
//
// Então este programa **usa o do editor**: abre o editor num Chrome headless,
// pede a ele o HTML pronto (`manualPageHtml()`), acrescenta só o CSS de
// impressão — tamanho da página, margens, onde pode e onde não pode quebrar —
// e manda o Chrome imprimir. Uma fonte só, para a tela e para o papel.
//
// As imagens entram porque a página é impressa **na mesma origem** em que o
// editor está servindo: os endereços que o Vite gera continuam válidos.
//
// USO, da raiz do projeto, com o editor servindo em 5173
// (`npm run editor` numa outra janela):
//
//   npm run manual-pdf
//
// Sai `documentos/manual/Manual do Recorte AAAA-MM-DD.pdf`, com a data no
// nome. Para gravar em outro lugar, passe o caminho:
//
//   npm run manual-pdf -- C:/Users/F-rak/Desktop/manual.pdf

import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = 9335;
const URL_EDITOR = 'http://localhost:5173/';

const hoje = new Date().toISOString().slice(0, 10);
const SAIDA = process.argv[2] !== undefined
  ? resolve(process.argv[2])
  : resolve(RAIZ, 'documentos', 'manual', `Manual do Recorte ${hoje}.pdf`);

// ---------------------------------------------------------------------------
// O editor tem de estar de pé
// ---------------------------------------------------------------------------

// Sem o editor servindo não há de onde tirar o manual. Dizer isso agora, com o
// comando escrito, é melhor que um erro de rede trinta segundos depois.
try {
  const r = await fetch(URL_EDITOR, { signal: AbortSignal.timeout(3000) });
  if (!r.ok) throw new Error(String(r.status));
} catch {
  console.error('O editor não está servindo em http://localhost:5173.');
  console.error('Abra outra janela do terminal, rode `npm run editor`, e tente de novo.');
  process.exit(2);
}

// ---------------------------------------------------------------------------
// O CSS de impressão
// ---------------------------------------------------------------------------

/**
 * O que muda do papel para a tela, e por quê.
 *
 * - **Cada capítulo começa numa página nova.** Num PDF de cem páginas, achar o
 *   começo de um capítulo é a coisa que mais se faz.
 * - **Imagem, tabela e bloco de código não se partem** entre duas páginas. Uma
 *   tabela partida perde o cabeçalho, e meia foto não explica nada.
 * - **Um título nunca fica sozinho no pé da página**: `break-after: avoid`
 *   puxa ele para a página seguinte junto com o que ele anuncia.
 * - **O fundo é branco**, e não o creme da tela: papel já é fundo.
 * - A largura de leitura da tela (46rem) sai: no papel quem decide a medida é
 *   a margem da página.
 */
const CSS_IMPRESSAO = `
  @page { size: A4; margin: 18mm 15mm 20mm; }
  body { background: #ffffff; font-size: 10.5pt; }
  main { max-width: none; margin: 0; padding: 0; }
  p, li { max-width: none; }
  .capa { background: #1c3d5a; color: #fff; padding: 28mm 12mm; margin: 0 0 8mm; }
  .capa h1 { font-size: 30pt; }
  .indice { break-after: page; }
  .capitulo { break-before: page; border-top: 0; margin-top: 0; padding-top: 0; }
  .capitulo:first-of-type { break-before: auto; }
  h2 { font-size: 19pt; margin: 0 0 6mm; }
  h3 { font-size: 13pt; }
  h4 { font-size: 11.5pt; }
  h2, h3, h4 { break-after: avoid; }
  img, table, pre, blockquote { break-inside: avoid; }
  /*
   * box-sizing porque a imagem tem borda de 1px de cada lado: com o
   * content-box do padrão, max-width 100% dá 100% MAIS dois pixels, e o
   * papel corta esses dois pixels na margem direita.
   */
  img { max-height: 150mm; object-fit: contain; box-sizing: border-box; }
  table { font-size: 9pt; display: table; }
  th, td { padding: 1.2mm 2mm; }
  hr { margin: 6mm 0; }
  a { color: #12507c; text-decoration: none; }
  .rodape { break-before: avoid; }
`;

// ---------------------------------------------------------------------------
// A conversa com o Chrome
// ---------------------------------------------------------------------------

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--window-size=1200,1600',
  `--remote-debugging-port=${PORTA}`, `--user-data-dir=${resolve(RAIZ, 'node_modules', '.perfil-pdf')}`,
  '--no-first-run', '--no-default-browser-check', URL_EDITOR,
], { stdio: 'ignore' });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function alvo() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORTA}/json/list`);
      const lista = await r.json();
      const p = lista.find((t) => t.type === 'page' && t.url.startsWith(URL_EDITOR));
      if (p !== undefined) return p;
    } catch { /* ainda subindo */ }
    await esperar(500);
  }
  throw new Error('o Chrome headless não abriu a página');
}

const pagina = await alvo();
const ws = new WebSocket(pagina.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });

let id = 0;
const pendentes = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id !== undefined && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); }
};
function cmd(method, params = {}) {
  const meu = ++id;
  return new Promise((res) => { pendentes.set(meu, res); ws.send(JSON.stringify({ id: meu, method, params })); });
}
async function ava(expr) {
  const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails !== undefined) {
    throw new Error(r.result.exceptionDetails.text ?? 'exceção na página');
  }
  return r.result?.result?.value;
}

await cmd('Runtime.enable');
await cmd('Page.enable');

// Espera o editor montar: é ele que traz o manual dentro.
let pronto = false;
for (let i = 0; i < 60; i++) {
  pronto = await ava("!!document.querySelector('canvas.viewport-canvas')");
  if (pronto === true) break;
  await esperar(500);
}
if (pronto !== true) throw new Error('o editor não montou em 30 s');

// ---------------------------------------------------------------------------
// O manual, montado pelo próprio editor
// ---------------------------------------------------------------------------

const html = await ava(`(async () => {
  const m = await import('/src/io/manual.ts');
  return m.manualPageHtml();
})()`);
if (typeof html !== 'string' || html.length < 1000) {
  throw new Error('o editor não devolveu a página do manual');
}

const capitulos = await ava(`(async () => {
  const m = await import('/src/io/manual.ts');
  return m.manualChapters().map((c) => c.file);
})()`);

// O CSS de impressão entra ANTES do `</style>` que a página já traz, para não
// disputar especificidade com ele: a última regra igual é a que vale.
const paraImprimir = html.replace('</style>', `${CSS_IMPRESSAO}</style>`);

const { frameTree } = (await cmd('Page.getFrameTree')).result;
await cmd('Page.setDocumentContent', { frameId: frameTree.frame.id, html: paraImprimir });

// Uma imagem que ainda não chegou sai como quadrado vazio no PDF, e o PDF não
// avisa. Espera todas, com teto: melhor um erro do que um manual sem fotos.
let carregadas = false;
for (let i = 0; i < 60; i++) {
  const conta = await ava(`(() => {
    const imgs = [...document.images];
    return { total: imgs.length, prontas: imgs.filter((i) => i.complete && i.naturalWidth > 0).length };
  })()`);
  if (conta.total > 0 && conta.total === conta.prontas) { carregadas = conta; break; }
  await esperar(500);
}
if (carregadas === false) throw new Error('as imagens do manual não terminaram de carregar');

// ---------------------------------------------------------------------------
// Imprimir
// ---------------------------------------------------------------------------

const pdf = await cmd('Page.printToPDF', {
  printBackground: true,
  preferCSSPageSize: true,
  displayHeaderFooter: true,
  headerTemplate: '<span></span>',
  footerTemplate:
    '<div style="width:100%;font-size:8pt;color:#666;padding:0 15mm;'
    + 'display:flex;justify-content:space-between;">'
    + '<span>Manual do Recorte</span>'
    + '<span class="pageNumber"></span>'
    + '</div>',
});
const dados = pdf.result?.data;
if (dados === undefined) throw new Error('o Chrome não devolveu o PDF');

const bytes = Buffer.from(dados, 'base64');
mkdirSync(dirname(SAIDA), { recursive: true });
writeFileSync(SAIDA, bytes);

const kb = (bytes.length / 1024).toFixed(0);
console.log(`  Arquivo    ${SAIDA}`);
console.log(`  Tamanho    ${kb} kB`);
console.log(`  Capítulos  ${capitulos.length}  (${capitulos.join(', ')})`);
console.log(`  Imagens    ${carregadas.prontas} de ${carregadas.total}`);

ws.close();
chrome.kill();
process.exit(0);
