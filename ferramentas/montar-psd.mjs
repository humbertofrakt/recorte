#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Monta um `.psd` em camadas a partir de um `.bone` — anotação 24, lote 36.
//
//   node ferramentas/montar-psd.mjs
//   node ferramentas/montar-psd.mjs --bone outro.bone --saida arte.psd
//
// POR QUE ISTO EXISTE
//
// O passo 1 do manual é "trazer a arte", e o caminho recomendado é o PSD: ele é
// o único que traz a **posição** de cada peça. Só que **não havia um `.psd` no
// projeto**: o passo 1 não podia ser percorrido nem por quem escreveu o
// programa, e o importador de PSD só era exercitado por arquivos de fora.
//
// Este programa é o **inverso do importador**: pega o herói montado e devolve a
// arte solta, uma camada por desenho, cada uma no lugar em que ela aparece na
// tela, com os grupos vindos das pastas dos slots. Importar o que ele gera tem
// que devolver os mesmos slots, nas mesmas posições.
//
// COMO ELE DESENHA
//
// Não há um segundo rasterizador aqui. Cada camada é um quadro inteiro
// desenhado pelo **mesmo** `desenharPose` do `render-png.mjs`, com só um slot
// visível de cada vez, recortado depois no retângulo do que ficou opaco. Um
// desenho girado sai girado, uma malha sai deformada, e a cor e a máscara da
// §7.7 valem — porque é o mesmo código que a prova visual usa.
//
// O QUE UM PSD NÃO GUARDA
//
// Camada de PSD é um retângulo alinhado com a tela: **giro, escala e malha
// entram nos pixels**, e não voltam como números. Reimportar devolve a mesma
// arte no mesmo lugar, mas o esqueleto tem de ser feito de novo — que é
// exatamente o que o passo 3 do manual diz.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { abrirEsqueleto, carregarRuntime, desenharPose } from './render-png.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');

const USO = `uso: node ferramentas/montar-psd.mjs [--bone ARQUIVO] [--saida ARQUIVO] [--margem N] [--ossos]

  --bone     o .bone de onde a arte sai (padrão: formato/exemplos/heroi.bone)
  --saida    o .psd a gravar (padrão: ao lado do .bone, com o mesmo nome;
             com --ossos, o nome ganha "-ossos")
  --margem   folga em pixels em volta do personagem (padrão: 20)
  --ossos    põe por cima um grupo "ossos": uma camada por osso, com a linha
             da base à ponta e uma bolinha na base (a convenção do lote 45)
`;

function lerArgumentos(argv) {
  const op = {
    bone: resolve(RAIZ, 'formato', 'exemplos', 'heroi.bone'),
    saida: null,
    margem: 20,
    ossos: false,
    ajuda: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ajuda' || a === '-h' || a === '--help') { op.ajuda = true; continue; }
    if (!a.startsWith('--')) continue;
    const [chave, junto] = a.slice(2).split('=');
    const valor = () => (junto !== undefined ? junto : argv[++i]);
    switch (chave) {
      case 'bone': op.bone = resolve(process.cwd(), valor()); break;
      case 'saida': op.saida = resolve(process.cwd(), valor()); break;
      case 'margem': op.margem = Number(valor()); break;
      case 'ossos': op.ossos = true; break;
      default: throw new Error(`opção desconhecida: --${chave}`);
    }
  }
  if (op.saida === null) op.saida = op.bone.replace(/\.bone$/i, op.ossos ? '-ossos.psd' : '.psd');
  return op;
}

// ---------------------------------------------------------------------------
// Bytes
// ---------------------------------------------------------------------------

/** Um bufferzinho que cresce, com as escritas que o PSD usa. */
class Bytes {
  constructor() {
    this.buf = new Uint8Array(1 << 16);
    this.len = 0;
  }

  espaco(n) {
    if (this.len + n <= this.buf.length) return;
    let tamanho = this.buf.length * 2;
    while (tamanho < this.len + n) tamanho *= 2;
    const novo = new Uint8Array(tamanho);
    novo.set(this.buf.subarray(0, this.len));
    this.buf = novo;
  }

  u8(v) { this.espaco(1); this.buf[this.len++] = v & 255; }
  u16(v) { this.espaco(2); this.buf[this.len++] = (v >> 8) & 255; this.buf[this.len++] = v & 255; }
  i16(v) { this.u16(v < 0 ? v + 0x10000 : v); }
  u32(v) {
    this.espaco(4);
    this.buf[this.len++] = (v >>> 24) & 255;
    this.buf[this.len++] = (v >>> 16) & 255;
    this.buf[this.len++] = (v >>> 8) & 255;
    this.buf[this.len++] = v & 255;
  }
  i32(v) { this.u32(v < 0 ? v + 0x100000000 : v); }
  tag(texto) { for (const c of texto) this.u8(c.charCodeAt(0)); }
  bytes(arr) { this.espaco(arr.length); this.buf.set(arr, this.len); this.len += arr.length; }
  zeros(n) { this.espaco(n); this.buf.fill(0, this.len, this.len + n); this.len += n; }

  /** Nome curto do PSD: um byte de tamanho, o texto, e enchimento até `passo`. */
  pascal(texto, passo = 4) {
    const cru = Buffer.from(texto, 'latin1');
    const corte = cru.subarray(0, 255);
    this.u8(corte.length);
    this.bytes(corte);
    const total = 1 + corte.length;
    const falta = (passo - (total % passo)) % passo;
    this.zeros(falta);
  }

  /** O nome de verdade, em UTF-16: é ele que sobrevive a um acento. */
  luni(texto) {
    const corpo = new Bytes();
    corpo.u32(texto.length);
    for (let i = 0; i < texto.length; i++) corpo.u16(texto.charCodeAt(i));
    // "Rounded up to an even byte count", diz a especificação.
    if ((corpo.len & 1) === 1) corpo.u8(0);
    this.tag('8BIM');
    this.tag('luni');
    this.u32(corpo.len);
    this.bytes(corpo.pronto());
  }

  /** O bloco que diz "esta linha é uma pasta" (1) ou "aqui ela fecha" (3). */
  lsct(tipo) {
    this.tag('8BIM');
    this.tag('lsct');
    this.u32(4);
    this.u32(tipo);
  }

  pronto() { return this.buf.subarray(0, this.len); }
}

// ---------------------------------------------------------------------------
// As camadas, tiradas do esqueleto
// ---------------------------------------------------------------------------

/** O retângulo do que não é transparente, ou `null` quando tudo é. */
function recorteOpaco(rgba, largura, altura) {
  let x0 = largura; let y0 = altura; let x1 = -1; let y1 = -1;
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      if (rgba[(y * largura + x) * 4 + 3] === 0) continue;
      if (x < x0) x0 = x;
      if (y < y0) y0 = y;
      if (x > x1) x1 = x;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < x0 || y1 < y0) return null;
  return { x: x0, y: y0, largura: x1 - x0 + 1, altura: y1 - y0 + 1 };
}

/** Copia o pedaço de dentro do recorte para um buffer só dele. */
function recortar(rgba, largura, caixa) {
  const saida = new Uint8Array(caixa.largura * caixa.altura * 4);
  for (let y = 0; y < caixa.altura; y++) {
    const de = ((caixa.y + y) * largura + caixa.x) * 4;
    saida.set(rgba.subarray(de, de + caixa.largura * 4), y * caixa.largura * 4);
  }
  return saida;
}

/**
 * Uma camada por desenho, na ordem de desenho, cada uma no seu lugar.
 *
 * O truque é simples e é o que evita um segundo rasterizador: esconde todo
 * mundo, mostra um, desenha o quadro inteiro, recorta o que ficou opaco.
 */
function camadasDo(rt, esqueleto, imagens, camera) {
  const guardados = esqueleto.slots.map((slot) => slot.attachmentName);
  const camadas = [];

  for (const alvo of rt.collectDrawables(esqueleto)) {
    const nome = alvo.slot.data.name;
    for (const slot of esqueleto.slots) {
      if (slot.data.name !== nome) slot.setAttachment(null);
    }
    // De novo depois de esconder: trocar o attachment de um slot **derruba o
    // esqueleto filho** dele (§7.11), e é o `updateWorldTransform` que o monta
    // outra vez. Sem esta linha a espada saía como camada vazia.
    esqueleto.updateWorldTransform();
    const quadro = desenharPose(rt, esqueleto, imagens, camera, { ossos: false });
    // Volta todo mundo antes de qualquer outra coisa: o próximo desenho precisa
    // do esqueleto inteiro de novo (uma máscara pode depender de outro slot).
    esqueleto.slots.forEach((slot, i) => slot.setAttachment(
      guardados[i] === null ? null : esqueleto.getAttachment(slot.data.index, guardados[i]),
    ));
    esqueleto.updateWorldTransform();

    const caixa = recorteOpaco(quadro.rgba, quadro.largura, quadro.altura);
    if (caixa === null) continue;
    const slotDef = alvo.slot.data;
    camadas.push({
      nome,
      pasta: typeof slotDef.folder === 'string' ? slotDef.folder : '',
      x: caixa.x,
      y: caixa.y,
      largura: caixa.largura,
      altura: caixa.altura,
      rgba: recortar(quadro.rgba, quadro.largura, caixa),
    });
  }
  return camadas;
}

// ---------------------------------------------------------------------------
// Os ossos, desenhados como a convenção do lote 45 pede
// ---------------------------------------------------------------------------
//
// Uma camada por osso, dentro do grupo `ossos`, por cima de tudo: a linha da
// base à ponta e uma bolinha na base. Uma camada por osso, e não todas numa
// só, porque no herói as linhas se cruzam (a capa passa pelo braço de trás):
// separadas, cada uma é lida exata. O importador lê as duas formas.

const OSSO_MEIA_LARGURA = 1.5;
const OSSO_RAIO = 5;
/** Osso de comprimento zero (um alvo de IK) vira uma linha curta, na direção dele. */
const OSSO_MINIMO = 16;
const OSSO_COR = [230, 30, 60];

/** A base e a ponta de cada osso, no mundo, na pose de repouso. */
function linhasDosOssos(esqueleto) {
  const linhas = [];
  for (const osso of esqueleto.bones) {
    const comprimento = osso.data.length ?? 0;
    // A raiz na origem, sem comprimento, é o `root` que o importador já cria.
    if (osso.parent === null && comprimento === 0) continue;
    const escala = Math.hypot(osso.a, osso.c) || 1;
    const mundo = comprimento > 0 ? comprimento * escala : OSSO_MINIMO;
    linhas.push({
      nome: osso.data.name,
      base: [osso.worldX, osso.worldY],
      ponta: [osso.worldX + (osso.a / escala) * mundo, osso.worldY + (osso.c / escala) * mundo],
    });
  }
  return linhas;
}

function distanciaAoSegmento(px, py, ax, ay, bx, by) {
  const vx = bx - ax;
  const vy = by - ay;
  const l2 = vx * vx + vy * vy;
  const u = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * vx + (py - ay) * vy) / l2));
  return Math.hypot(px - (ax + u * vx), py - (ay + u * vy));
}

/** A camada de um osso: a linha e a bolinha, em pixels da tela, recortada. */
function camadaDoOsso(linha, camera) {
  const paraTela = ([wx, wy]) => [
    (wx - camera.originX) * camera.scale,
    camera.height - (wy - camera.originY) * camera.scale,
  ];
  const [ax, ay] = paraTela(linha.base);
  const [bx, by] = paraTela(linha.ponta);
  const folga = OSSO_RAIO + 2;
  const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - folga));
  const y0 = Math.max(0, Math.floor(Math.min(ay, by) - folga));
  const x1 = Math.min(camera.width, Math.ceil(Math.max(ax, bx) + folga));
  const y1 = Math.min(camera.height, Math.ceil(Math.max(ay, by) + folga));
  const largura = x1 - x0;
  const altura = y1 - y0;
  if (largura <= 0 || altura <= 0) return null;
  const rgba = new Uint8Array(largura * altura * 4);
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const cx = x0 + x + 0.5;
      const cy = y0 + y + 0.5;
      const naLinha = distanciaAoSegmento(cx, cy, ax, ay, bx, by) <= OSSO_MEIA_LARGURA;
      const naBola = Math.hypot(cx - ax, cy - ay) <= OSSO_RAIO;
      if (!naLinha && !naBola) continue;
      const i = (y * largura + x) * 4;
      rgba[i] = OSSO_COR[0];
      rgba[i + 1] = OSSO_COR[1];
      rgba[i + 2] = OSSO_COR[2];
      rgba[i + 3] = 255;
    }
  }
  const caixa = recorteOpaco(rgba, largura, altura);
  if (caixa === null) return null;
  return {
    nome: linha.nome,
    pasta: 'ossos',
    x: x0 + caixa.x,
    y: y0 + caixa.y,
    largura: caixa.largura,
    altura: caixa.altura,
    rgba: recortar(rgba, largura, caixa),
  };
}

// ---------------------------------------------------------------------------
// O arquivo
// ---------------------------------------------------------------------------

/** Um canal de uma camada, já com a palavra de compressão na frente. */
function canalCru(rgba, largura, altura, deslocamento) {
  const dados = new Bytes();
  dados.u16(0); // 0 = sem compressão
  const total = largura * altura;
  dados.espaco(total);
  for (let i = 0; i < total; i++) dados.u8(rgba[i * 4 + deslocamento]);
  return dados.pronto();
}

/**
 * As linhas do arquivo, de BAIXO para CIMA — é assim que o PSD guarda.
 *
 * Uma pasta é escrita como três coisas: a marca que a fecha (`lsct` 3), as
 * camadas de dentro, e por último a linha que carrega o nome dela (`lsct` 1).
 * Quem lê caminha de trás para a frente e empilha os nomes; é o que o nosso
 * leitor faz em `ferramentas/src/importar/psd.ts`.
 */
function linhasDo(camadas) {
  const linhas = [];
  let pastaAberta = null;
  // De baixo para cima: a primeira da ordem de desenho é a que fica no fundo.
  for (const camada of camadas) {
    if (camada.pasta !== pastaAberta) {
      if (pastaAberta !== null) linhas.push({ tipo: 'abre', nome: pastaAberta });
      if (camada.pasta !== '') linhas.push({ tipo: 'fecha', nome: '</Layer group>' });
      pastaAberta = camada.pasta === '' ? null : camada.pasta;
    }
    linhas.push({ tipo: 'camada', camada });
  }
  if (pastaAberta !== null) linhas.push({ tipo: 'abre', nome: pastaAberta });
  return linhas;
}

function escreverPsd(largura, altura, camadas) {
  const linhas = linhasDo(camadas);

  // --- a tabela das camadas
  const tabela = new Bytes();
  tabela.i16(linhas.length);
  const blocos = [];
  for (const linha of linhas) {
    const camada = linha.tipo === 'camada' ? linha.camada : null;
    const topo = camada === null ? 0 : camada.y;
    const esq = camada === null ? 0 : camada.x;
    const base = camada === null ? 0 : camada.y + camada.altura;
    const dir = camada === null ? 0 : camada.x + camada.largura;
    tabela.i32(topo); tabela.i32(esq); tabela.i32(base); tabela.i32(dir);

    const canais = camada === null
      ? [-1, 0, 1, 2].map(() => new Uint8Array([0, 0]))
      : [
        canalCru(camada.rgba, camada.largura, camada.altura, 3),
        canalCru(camada.rgba, camada.largura, camada.altura, 0),
        canalCru(camada.rgba, camada.largura, camada.altura, 1),
        canalCru(camada.rgba, camada.largura, camada.altura, 2),
      ];
    const ids = [-1, 0, 1, 2];
    tabela.u16(4);
    for (let i = 0; i < 4; i++) { tabela.i16(ids[i]); tabela.u32(canais[i].length); }
    blocos.push(canais);

    tabela.tag('8BIM');
    tabela.tag('norm');
    tabela.u8(255); // opacidade
    tabela.u8(0); // clipping
    tabela.u8(0); // flags: visível
    tabela.u8(0); // enchimento

    const extra = new Bytes();
    extra.u32(0); // máscara: nenhuma
    extra.u32(0); // faixas de mistura: nenhuma
    const nome = camada === null ? linha.nome : (camada.nome ?? '');
    extra.pascal(nome);
    extra.luni(nome);
    if (linha.tipo === 'abre') extra.lsct(1);
    if (linha.tipo === 'fecha') extra.lsct(3);
    if ((extra.len & 1) === 1) extra.u8(0);
    tabela.u32(extra.len);
    tabela.bytes(extra.pronto());
  }
  for (const canais of blocos) for (const canal of canais) tabela.bytes(canal);
  if ((tabela.len & 1) === 1) tabela.u8(0);

  // --- o arquivo
  const psd = new Bytes();
  psd.tag('8BPS');
  psd.u16(1);
  psd.zeros(6);
  psd.u16(4); // canais do composto: RGBA
  psd.u32(altura);
  psd.u32(largura);
  psd.u16(8); // 8 bits por canal
  psd.u16(3); // RGB
  psd.u32(0); // dados de modo de cor
  psd.u32(0); // recursos de imagem

  const camadasEmascara = new Bytes();
  camadasEmascara.u32(tabela.len);
  camadasEmascara.bytes(tabela.pronto());
  camadasEmascara.u32(0); // máscara global: nenhuma
  psd.u32(camadasEmascara.len);
  psd.bytes(camadasEmascara.pronto());

  // --- o composto: o que um programa que não lê camadas mostra
  const composto = achatar(largura, altura, camadas);
  psd.u16(0); // sem compressão
  for (let canal = 0; canal < 4; canal++) {
    const ordem = canal === 3 ? 3 : canal;
    psd.espaco(largura * altura);
    for (let i = 0; i < largura * altura; i++) psd.u8(composto[i * 4 + ordem]);
  }
  return Buffer.from(psd.pronto());
}

/** O composto: as camadas empilhadas, a de cima por cima. */
function achatar(largura, altura, camadas) {
  const saida = new Uint8Array(largura * altura * 4);
  for (const camada of camadas) {
    for (let y = 0; y < camada.altura; y++) {
      const alvoY = camada.y + y;
      if (alvoY < 0 || alvoY >= altura) continue;
      for (let x = 0; x < camada.largura; x++) {
        const alvoX = camada.x + x;
        if (alvoX < 0 || alvoX >= largura) continue;
        const de = (y * camada.largura + x) * 4;
        const a = camada.rgba[de + 3] / 255;
        if (a <= 0) continue;
        const para = (alvoY * largura + alvoX) * 4;
        for (let c = 0; c < 3; c++) {
          saida[para + c] = Math.round(camada.rgba[de + c] * a + saida[para + c] * (1 - a));
        }
        saida[para + 3] = Math.round(255 * (a + (saida[para + 3] / 255) * (1 - a)));
      }
    }
  }
  return saida;
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

export async function montarPsd(op) {
  const rt = await carregarRuntime();
  // `abrirEsqueleto` devolve os DADOS (com os aninhados já resolvidos); a
  // instância viva é feita aqui, como o `render-png.mjs` faz.
  const { dados, imagens } = abrirEsqueleto(rt, op.bone);
  const esqueleto = new rt.Skeleton(dados);
  esqueleto.setToSetupPose();
  esqueleto.updateWorldTransform();

  const arte = esqueleto.getBounds();
  // Com --ossos, a tela cresce para caber as linhas e as bolinhas. Sem, é a
  // caixa da arte, e o PSD sai igual ao de antes do lote 45.
  const linhas = op.ossos ? linhasDosOssos(esqueleto) : [];
  let limites = arte;
  if (linhas.length > 0) {
    const pontos = linhas.flatMap((l) => [l.base, l.ponta]);
    const f = OSSO_RAIO + 2;
    const minX = Math.min(arte.x, ...pontos.map((p) => p[0] - f));
    const minY = Math.min(arte.y, ...pontos.map((p) => p[1] - f));
    const maxX = Math.max(arte.x + arte.width, ...pontos.map((p) => p[0] + f));
    const maxY = Math.max(arte.y + arte.height, ...pontos.map((p) => p[1] + f));
    limites = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }
  const margem = Math.max(0, Math.round(op.margem));
  const largura = Math.max(1, Math.ceil(limites.width) + margem * 2);
  const altura = Math.max(1, Math.ceil(limites.height) + margem * 2);
  // Escala 1: um pixel do PSD é uma unidade do arquivo, e é isso que faz a
  // volta pelo importador cair no mesmo lugar.
  const camera = {
    width: largura,
    height: altura,
    scale: 1,
    originX: limites.x - margem,
    originY: limites.y - margem,
  };

  const camadas = camadasDo(rt, esqueleto, imagens, camera);
  if (camadas.length === 0) throw new Error('nenhum desenho com pixel neste arquivo');
  let ossos = 0;
  for (const linha of linhas) {
    const camada = camadaDoOsso(linha, camera);
    if (camada === null) continue;
    camadas.push(camada);
    ossos++;
  }
  const bytes = escreverPsd(largura, altura, camadas);
  writeFileSync(op.saida, bytes);
  return { largura, altura, camadas, ossos, bytes: bytes.length };
}

async function principal() {
  const op = lerArgumentos(process.argv.slice(2));
  if (op.ajuda) { process.stdout.write(USO); process.exit(0); }
  if (!readFileSync(op.bone)) throw new Error(`não achei ${op.bone}`);
  const feito = await montarPsd(op);
  const pastas = new Set(feito.camadas.map((c) => c.pasta).filter((p) => p !== ''));
  process.stdout.write(
    `${op.saida}: ${feito.largura}x${feito.altura}, ${feito.camadas.length} camadas`
    + `${pastas.size > 0 ? `, ${pastas.size} pastas` : ''}`
    + `${feito.ossos > 0 ? `, ${feito.ossos} ossos` : ''}, ${Math.round(feito.bytes / 1024)} kB\n`,
  );
}

if (process.argv[1] !== undefined && process.argv[1].endsWith('montar-psd.mjs')) {
  principal().catch((e) => { process.stderr.write(`erro: ${e.message}\n`); process.exit(1); });
}
