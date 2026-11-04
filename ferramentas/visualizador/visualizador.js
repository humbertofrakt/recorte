/**
 * Visualizador do formato Recorte (.bone).
 *
 * Carrega heroi.bone + heroi.atlas.json + heroi.png, monta o esqueleto e
 * desenha em laço com requestAnimationFrame. Sem build: modulo ES puro que
 * importa o runtime ja compilado em ./dist (veja o README).
 */

import { loadSkeletonFromText, loadAtlasFromText } from './dist/loader.js';
import { Skeleton } from './dist/skeleton.js';
import { pose } from './dist/animation.js';
import { CanvasRenderer } from './dist/render/canvas.js';
// Registram os tipos reais de constraint (import por efeito colateral).
import './dist/constraints/ik.js';
import './dist/constraints/transform.js';
import './dist/constraints/physics.js';
import './dist/constraints/path.js';
import './dist/constraints/driver.js';

const EXEMPLOS = new URL('../../formato/exemplos/', import.meta.url);
const ARQUIVO_BONE = new URL('heroi.bone', EXEMPLOS);
const ARQUIVO_ATLAS = new URL('heroi.atlas.json', EXEMPLOS);

const tela = document.getElementById('tela');
const ctx = tela.getContext('2d');
const recado = document.getElementById('recado');
const avisos = document.getElementById('avisos');
const listaAnimacoes = document.getElementById('animacoes');
const campoTempo = document.getElementById('tempo');
const campoVelocidade = document.getElementById('velocidade');
const valorVelocidade = document.getElementById('velocidadeValor');
const campoZoom = document.getElementById('zoom');
const valorZoom = document.getElementById('zoomValor');

const estado = {
  esqueleto: null,
  renderizador: null,
  animacao: null,
  tempoAnimacao: 0,
  relogio: 0,
  tocando: true,
  velocidade: 1,
  zoom: 1,
  escalaBase: 1,
  centro: { x: 0, y: 0 },
};

// ---------------------------------------------------------------------------
// Carregamento
// ---------------------------------------------------------------------------

async function texto(url) {
  const resposta = await fetch(url);
  if (!resposta.ok) throw new Error(`${resposta.status} ao buscar ${url.pathname}`);
  return resposta.text();
}

function imagem(url) {
  return new Promise((ok, erro) => {
    const img = new Image();
    img.onload = () => ok(img);
    img.onerror = () => erro(new Error(`não deu para carregar a imagem ${url}`));
    img.src = String(url);
  });
}

async function carregar() {
  const [textoAtlas, textoBone] = await Promise.all([texto(ARQUIVO_ATLAS), texto(ARQUIVO_BONE)]);
  const atlas = loadAtlasFromText(textoAtlas);
  const dados = loadSkeletonFromText(textoBone, { atlases: [atlas] });

  // Cada página vira uma imagem, resolvida em relação ao arquivo do atlas.
  const imagens = new Map();
  await Promise.all(atlas.pages.map(async (pagina) => {
    imagens.set(pagina.name, await imagem(new URL(pagina.image, ARQUIVO_ATLAS)));
  }));

  const esqueleto = new Skeleton(dados);
  const renderizador = new CanvasRenderer(ctx, {
    images: imagens,
    debug: {},
    onWarning: (mensagem) => anotarAviso(mensagem),
  });

  estado.esqueleto = esqueleto;
  estado.renderizador = renderizador;

  for (const aviso of dados.warnings) anotarAviso(`${aviso.pointer}: ${aviso.message}`);
  for (const falta of dados.missingImages) anotarAviso(`imagem "${falta}" não está no atlas`);

  montarListaAnimacoes(dados.animations);
  escolherAnimacao(dados.animations[0] ?? null);
  enquadrar();
  recado.textContent = `${dados.meta.name} · ${dados.bones.length} ossos · ${dados.slots.length} slots · ${dados.animations.length} animações`;
}

const avisosVistos = new Set();

function anotarAviso(mensagem) {
  if (avisosVistos.has(mensagem)) return;
  avisosVistos.add(mensagem);
  const item = document.createElement('li');
  item.textContent = mensagem;
  avisos.append(item);
}

// ---------------------------------------------------------------------------
// Animações
// ---------------------------------------------------------------------------

function montarListaAnimacoes(animacoes) {
  listaAnimacoes.replaceChildren();
  if (animacoes.length === 0) {
    const vazio = document.createElement('p');
    vazio.textContent = 'Este arquivo não tem animação.';
    listaAnimacoes.append(vazio);
    return;
  }
  for (const animacao of animacoes) {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.setAttribute('aria-pressed', 'false');
    botao.dataset.nome = animacao.name;
    const titulo = document.createElement('span');
    titulo.textContent = animacao.name;
    const detalhe = document.createElement('small');
    detalhe.textContent = `${animacao.duration.toFixed(2)} s · ${animacao.loop ? 'em laço' : 'uma vez'}`;
    botao.append(titulo, detalhe);
    botao.addEventListener('click', () => escolherAnimacao(animacao));
    listaAnimacoes.append(botao);
  }
}

function escolherAnimacao(animacao) {
  estado.animacao = animacao;
  estado.tempoAnimacao = 0;
  for (const botao of listaAnimacoes.querySelectorAll('button')) {
    botao.setAttribute('aria-pressed', String(animacao !== null && botao.dataset.nome === animacao.name));
  }
}

// ---------------------------------------------------------------------------
// Enquadramento
// ---------------------------------------------------------------------------

function enquadrar() {
  const esqueleto = estado.esqueleto;
  if (esqueleto === null) return;
  const limites = esqueleto.getBounds();
  const largura = limites.width > 0 ? limites.width : 100;
  const altura = limites.height > 0 ? limites.height : 100;
  const caixa = tela.getBoundingClientRect();
  estado.escalaBase = Math.min(caixa.width / (largura * 1.35), caixa.height / (altura * 1.15));
  estado.centro = { x: limites.x + largura / 2, y: limites.y + altura / 2 };
}

function ajustarTamanho() {
  const dpr = window.devicePixelRatio || 1;
  const caixa = tela.getBoundingClientRect();
  const largura = Math.max(1, Math.round(caixa.width * dpr));
  const altura = Math.max(1, Math.round(caixa.height * dpr));
  if (tela.width !== largura || tela.height !== altura) {
    tela.width = largura;
    tela.height = altura;
  }
}

// ---------------------------------------------------------------------------
// Laço de desenho
// ---------------------------------------------------------------------------

function desenhar() {
  const esqueleto = estado.esqueleto;
  const renderizador = estado.renderizador;
  if (esqueleto === null || renderizador === null) return;

  const dpr = window.devicePixelRatio || 1;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, tela.width, tela.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, tela.width, tela.height);

  const escala = estado.escalaBase * estado.zoom * dpr;
  ctx.save();
  ctx.translate(tela.width / 2, tela.height / 2);
  // Esqueleto tem y para cima; canvas tem y para baixo.
  ctx.scale(escala, -escala);
  ctx.translate(-estado.centro.x, -estado.centro.y);
  renderizador.draw(esqueleto);
  ctx.restore();
}

let ultimoQuadro = 0;

function quadro(agora) {
  requestAnimationFrame(quadro);
  const dt = ultimoQuadro === 0 ? 0 : Math.min((agora - ultimoQuadro) / 1000, 0.1);
  ultimoQuadro = agora;

  const esqueleto = estado.esqueleto;
  if (esqueleto === null) return;
  ajustarTamanho();

  const animacao = estado.animacao;
  if (estado.tocando) {
    estado.tempoAnimacao += dt * estado.velocidade;
    estado.relogio += dt * estado.velocidade;
  }
  if (animacao !== null && animacao.duration > 0) {
    if (animacao.loop) estado.tempoAnimacao %= animacao.duration;
    else if (estado.tempoAnimacao > animacao.duration) estado.tempoAnimacao = animacao.duration;
  }

  if (animacao !== null) pose(esqueleto, animacao, estado.tempoAnimacao, estado.relogio);
  else esqueleto.updateWorldTransform(estado.relogio);

  campoTempo.textContent = `${estado.tempoAnimacao.toFixed(2)} s`;
  desenhar();
}

// ---------------------------------------------------------------------------
// Controles
// ---------------------------------------------------------------------------

document.getElementById('tocar').addEventListener('click', () => { estado.tocando = true; });
document.getElementById('parar').addEventListener('click', () => { estado.tocando = false; });
document.getElementById('reiniciar').addEventListener('click', () => { estado.tempoAnimacao = 0; });
document.getElementById('enquadrar').addEventListener('click', () => { enquadrar(); });

campoVelocidade.addEventListener('input', () => {
  estado.velocidade = Number(campoVelocidade.value);
  valorVelocidade.textContent = `${estado.velocidade.toFixed(1)}×`;
});

campoZoom.addEventListener('input', () => {
  estado.zoom = Number(campoZoom.value);
  valorZoom.textContent = `${Math.round(estado.zoom * 100)}%`;
});

const caixasDepuracao = [
  ['verOssos', 'bones'],
  ['verCaixas', 'boundingBoxes'],
  ['verMalha', 'meshes'],
  ['verMascara', 'clipping'],
  ['verPontos', 'points'],
];

for (const [id, chave] of caixasDepuracao) {
  const caixa = document.getElementById(id);
  caixa.addEventListener('change', () => {
    if (estado.renderizador === null) return;
    estado.renderizador.debug[chave] = caixa.checked;
    if (chave === 'points') estado.renderizador.debug.paths = caixa.checked;
  });
}

window.addEventListener('resize', () => { enquadrar(); });

// ---------------------------------------------------------------------------
// Início
// ---------------------------------------------------------------------------

// Atalho para inspecionar no console do navegador: recorte.esqueleto, etc.
window.recorte = estado;

requestAnimationFrame(quadro);

carregar().catch((erro) => {
  recado.classList.add('erro');
  recado.textContent = `Não deu para carregar: ${erro.message}`;
  console.error(erro);
});
