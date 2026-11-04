// SPDX-License-Identifier: Apache-2.0
// Confere que o editor está de pé, sem clicar à mão.
//
// Abre o editor num Chrome headless de verdade, ajusta a tela, entra em
// Animando, TOCA a animação `walk`, mede se a tela muda de quadro em quadro,
// lê o console inteiro e grava a foto em 1440x900.
//
// Por que headless, e não o navegador da automação: o painel do navegador da
// automação NÃO compõe quadros — medido, `requestAnimationFrame` roda ZERO
// vezes por segundo lá, mesmo com a aba visível. Nele o tocador parece
// travado e a foto falha por tempo. Um Chrome headless roda a 61 quadros por
// segundo, e é o único jeito de PROVAR que a animação anda.
//
// Uso, da raiz do projeto, com o editor já servindo em 5173
// (`npm run editor` numa outra janela):
//
//   node ferramentas/provas/conferir-editor.mjs PERFIL FOTO.png
//
// PERFIL é uma pasta descartável para o Chrome. Exemplo:
//
//   node ferramentas/provas/conferir-editor.mjs %TEMP%/perfil editor/tela-final.png
//
// Sai um JSON com: quadros de rAF por segundo, o modo em que entrou, os
// relógios lidos enquanto tocava, quantos quadros distintos foram desenhados,
// os pixels desenhados e TODA linha de console.

import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PORTA = 9333;
const PERFIL = process.argv[2];
const SAIDA = process.argv[3];
const URL = 'http://localhost:5173/';

const chrome = spawn(CHROME, [
  '--headless=new', '--disable-gpu', '--hide-scrollbars',
  '--force-device-scale-factor=1', '--window-size=1440,900',
  `--remote-debugging-port=${PORTA}`, `--user-data-dir=${PERFIL}`,
  '--no-first-run', '--no-default-browser-check', URL,
], { stdio: 'ignore' });

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function alvo() {
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORTA}/json/list`);
      const lista = await r.json();
      const p = lista.find((t) => t.type === 'page' && t.url.startsWith('http://localhost:5173'));
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
const console_ = [];
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id !== undefined && pendentes.has(m.id)) { pendentes.get(m.id)(m); pendentes.delete(m.id); return; }
  if (m.method === 'Runtime.consoleAPICalled') {
    console_.push({ tipo: m.params.type, texto: m.params.args.map((a) => a.value ?? a.description ?? a.type).join(' ') });
  }
  if (m.method === 'Log.entryAdded') {
    console_.push({ tipo: m.params.entry.level, texto: `${m.params.entry.text} ${m.params.entry.url ?? ''}`.trim() });
  }
  if (m.method === 'Runtime.exceptionThrown') {
    console_.push({ tipo: 'exception', texto: m.params.exceptionDetails.text ?? 'exceção' });
  }
};
function cmd(method, params = {}) {
  const meu = ++id;
  return new Promise((res) => { pendentes.set(meu, res); ws.send(JSON.stringify({ id: meu, method, params })); });
}

await cmd('Runtime.enable');
await cmd('Log.enable');
await cmd('Page.enable');
// A janela do Chrome tira alguns pixels; o override fixa a viewport em
// 1440x900 exatos, que e o tamanho das outras fotos do projeto.
await cmd('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

async function ava0(expr) {
  const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  return r.result?.result?.value;
}
// Espera o editor MONTAR: o canvas do viewport e a árvore de ossos.
let pronto = false;
for (let i = 0; i < 60; i++) {
  pronto = await ava0("!!document.querySelector('canvas.viewport-canvas') && document.body.innerText.includes('Ossos')");
  if (pronto === true) break;
  await esperar(500);
}
if (pronto !== true) throw new Error('o editor não montou em 30 s');
await esperar(1500);

async function ava(expr) {
  const r = await cmd('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true });
  if (r.result?.exceptionDetails) return { erro: r.result.exceptionDetails.text };
  return r.result?.result?.value;
}

const raf = await ava(`(async()=>{let n=0;const t0=performance.now();
  await new Promise((res)=>{function p(){n++;if(performance.now()-t0<1000)requestAnimationFrame(p);else res();}
  requestAnimationFrame(p);setTimeout(res,1500);});return n;})()`);

// Desde o lote 1 (v1.7) o botão mora na camada do canto da cena e mostra só
// "Ajustar"; o nome inteiro está no `aria-label`, que é onde se procura agora.
// O texto continua valendo como segunda tentativa, para o script servir também
// numa versão anterior do editor.
const ajuste = await ava(`(()=>{const alvo=(x)=>{const a=(x.getAttribute('aria-label')||'').trim();
  return a.startsWith('Ajustar à tela')||x.textContent.trim()==='Ajustar à tela';};
  const b=[...document.querySelectorAll('button')].find(alvo);
  if(b)b.click();return !!b;})()`);

// A busca por 'walk' ganhou raiz e filtro no lote 12: a Previa virou aba da
// faixa de baixo (item 30), e as listas dela tem OPTION escritos 'walk'. Um
// option nao e clicavel, e ele vinha ANTES da lista de animacoes no documento.
// A busca agora e dentro da coluna da direita, que e onde o painel Animacoes
// mora.
// Lote 23: entrar em Animando ABRE a linha do tempo, e a cena encolhe de
// proposito. A medida que vale como numero do projeto e a de MONTAGEM, com a
// faixa fechada — por isso ela e tirada ANTES de escolher a animacao.
const cenaMontagem = await ava(`(()=>{const c=document.querySelector('canvas.viewport-canvas');
  const a=(s)=>{const x=document.querySelector(s);return x?x.offsetHeight:0};
  return {canvas:c.offsetHeight, porCento:Math.round(c.offsetHeight/innerHeight*100),
    porCentoLargura:Math.round(c.offsetWidth/innerWidth*100),
    barra:a('.viewport-toolbar'), faixaDeBaixo:a('.dock')};})()`);

// Desde o lote 16 (rodada 3) a bancada tem DUAS colunas: a lista de animacoes
// mora na da DIREITA, e um `querySelector('.panel-column')` pegava a da
// esquerda e nao achava o `walk`. A busca passa a varrer as duas.
const escolha = await ava(`(()=>{const raiz=document.querySelector('.panel-column-direita')||document.querySelector('.panel-column')||document.body;
  const linhas=[...raiz.querySelectorAll('*')].filter(e=>e.children.length===0&&e.tagName!=='OPTION'&&e.textContent.trim()==='walk');
  if(linhas.length===0)return 'sem walk';linhas[0].click();return document.body.innerText.match(/Animando:[^\\n]*/)?.[0]??'nao entrou em Animando';})()`);

await esperar(600);

const tocada = await ava(`(async()=>{
  const c=document.querySelector('canvas.viewport-canvas');
  const ctx=c.getContext('2d');
  const soma=()=>{const d=ctx.getImageData(0,0,c.width,c.height).data;let s=0;
    for(let i=0;i<d.length;i+=40)s=(s+d[i]*(i%251))%2147483647;return s;};
  // Desde o lote 2 (v1.8) o tocador é a primeira linha da linha do tempo, e o
  // botão mostra só o símbolo: ▶ para tocar, ❚❚ para pausar. O relógio virou o
  // campo de tempo mais a etiqueta do quadro, ao lado dele.
  const relogio=()=>{const t=document.querySelector('.dope-toc-campo');
    const q=document.querySelector('.dope-toc-quadro');
    return t===null?null:t.value+' — '+(q?q.textContent:'');};
  const bt=document.querySelector('.dope-toc-tocar');
  const antes={relogio:relogio(),marca:soma(),botao:bt.textContent.trim()};
  bt.click();
  const marcas=[],relogios=[];
  for(let i=0;i<6;i++){await new Promise(r=>setTimeout(r,350));marcas.push(soma());relogios.push(relogio());}
  const depois={botao:document.querySelector('.dope-toc-tocar').textContent.trim(),
    tocando:document.querySelector('.dope-toc-tocar').getAttribute('aria-pressed')};
  return {antes,marcas,quadrosDistintos:new Set(marcas).size,relogios,depois};
})()`);

// Quanto da janela é DESENHO — item 15, lote 4. É a medida que diz se a cena
// está ganhando espaço lote a lote, e ela vale mais do que olhar a foto.
const cena = await ava(`(()=>{
  const c=document.querySelector('canvas.viewport-canvas');
  const bar=document.querySelector('.viewport-toolbar');
  const dock=document.querySelector('.dock');
  const topo=document.querySelector('.top-bar');
  const rodape=document.querySelector('.status-bar');
  const alt=(x)=>x?x.offsetHeight:0;
  const larg=(x)=>x?x.offsetWidth:0;
  return {janela:[innerWidth,innerHeight], canvas:alt(c),
    porCento:Math.round(alt(c)/innerHeight*100),
    // Lote 16: a cena tambem tem que ganhar LARGURA, e nao so altura.
    canvasLargura:larg(c), porCentoLargura:Math.round(larg(c)/innerWidth*100),
    colunas:[larg(document.querySelector('.panel-column-esquerda')),
             larg(document.querySelector('.panel-column-direita'))],
    barra:alt(bar),
    // Uma linha so quando o MEIO de todos os grupos cai na mesma faixa. Contar
    // offsetTop distinto dava 2 para uma barra de uma linha: grupos de alturas
    // diferentes alinhados pelo centro comecam em tops diferentes.
    // (Sem crase nestes comentarios: eles vivem dentro de um template literal.)
    barraUmaLinha: bar ? (() => {
      const meios=[...bar.children].map(x=>x.offsetTop+x.offsetHeight/2);
      return meios.length===0 || Math.max(...meios)-Math.min(...meios) < 12;
    })() : true,
    faixaDeBaixo:alt(dock), topo:alt(topo), rodape:alt(rodape)};
})()`);

const pixels = await ava(`(()=>{const c=document.querySelector('canvas.viewport-canvas');
  const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;let n=0;
  for(let i=3;i<d.length;i+=4)if(d[i]>0)n++;return n;})()`);

const foto = await cmd('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });

// Anotacao 27, lote 38: NENHUM elemento marcado com `hidden` pode continuar
// desenhado. A familia voltou cinco vezes (lotes 14, 16, 19, 30, 37), sempre
// porque uma regra de autor com `display` passa por cima do `[hidden]` do
// navegador. Aqui a conta e do DOM de verdade, com o CSS ja aplicado.
const escondidos = await ava(`(()=>{
  const todos=[...document.querySelectorAll('[hidden]')];
  const aparecendo=todos.filter(e=>getComputedStyle(e).display!=='none')
    .map(e=>(e.className||e.tagName)+' -> '+getComputedStyle(e).display);
  return {marcados:todos.length, aparecendo};
})()`);

// Anotacao 18, lote 32: NENHUMA linha da aba Ordem pode ficar com o quadrado
// vazio. Quem nao tem imagem — sequencia, esqueleto filho, ponto, caixa —
// mostra o icone do tipo. Vem depois da foto de proposito: abrir a aba Ordem
// troca o painel da esquerda, e a foto e da tela de sempre.
const ordem = await ava(`(()=>{
  const aba=[...document.querySelectorAll('.panel-tab')].find(x=>x.textContent.trim()==='Ordem');
  if(!aba)return 'sem aba Ordem';
  aba.click();
  const covas=[...document.querySelectorAll('.ordem-mini')];
  const vazias=covas.filter(c=>c.querySelector('img')===null&&c.querySelector('svg')===null)
    .map(c=>(c.parentElement?c.parentElement.textContent.trim().replace(/\s+/g,' ').slice(0,40):'?'));
  return {linhas:covas.length, vazias};
})()`);
writeFileSync(SAIDA, Buffer.from(foto.result.data, 'base64'));

console.log(JSON.stringify({
  rafPorSegundo: raf, ajustouATela: ajuste, modo: escolha, tocada,
  cenaMontagem, cena, pixelsDesenhados: pixels, ordemSemBuraco: ordem,
  escondidoEscondido: escondidos,
  console: console_,
}, null, 2));

ws.close();
chrome.kill();
