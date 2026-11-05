#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Exportador de imagem: sequência de PNG, folha de sprites e GIF (requisito E5).
//
//   node ferramentas/exportar-imagem.mjs heroi.bone walk saida --formato gif --fps 30
//   node ferramentas/exportar-imagem.mjs heroi.bone walk saida --formato folha --colunas 8
//   node ferramentas/exportar-imagem.mjs heroi.bone walk saida --formato png --escala 2
//   node ferramentas/exportar-imagem.mjs heroi.bone --todas saida --formato gif
//
// VÍDEO DE VERDADE (MP4, AVI) NÃO SAI DAQUI, e não vai sair: um codificador de
// vídeo não cabe sem dependência, e este projeto não tem nenhuma. A saída de
// vídeo do Recorte é o GIF e a sequência de PNGs. Para MP4, passe a sequência
// para o ffmpeg — o comando pronto sai no fim de cada exportação.
//
// Sem dependências. Quem desenha é o rasterizador de `ferramentas/render-png.mjs`
// (o mesmo do PNG de um quadro); quem monta a folha, corta a borda vazia e
// escreve o GIF é `ferramentas/src/exportar/quadros.ts`, que também é o que o
// editor usa. Um rasterizador só, um empacotador só.

import { writeFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

import {
  abrirEsqueleto, cameraDe, carregarRuntime, desenharPose, gravarPng, juntarLimites, limitesComParticulas, posarAte,
} from './render-png.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const TSCONFIG = join(AQUI, 'src', 'exportar', 'tsconfig.json');
const DIST = join(AQUI, 'dist', 'exportar');

const USO = `Uso: node ferramentas/exportar-imagem.mjs <entrada.bone> <animacao> <saida> [opções]

  entrada.bone       o esqueleto a desenhar
  animacao           nome da animação; use --todas para exportar todas
  saida              nome de base dos arquivos, sem extensão

  --formato F        png (sequência), folha (sprite sheet) ou gif. Padrão: png
  --fps N            quadros por segundo. Padrão: 30
  --escala N         pixels por unidade de mundo. Padrão: 1
  --largura N        largura em pixels; manda mais que --escala
  --margem F         folga em volta, fração do tamanho. Padrão: 0.12
  --fundo RRGGBB     cor de fundo opaca. Padrão: transparente
  --sem-recorte      não corta a borda vazia (o padrão é cortar)
  --de N             primeiro segundo a desenhar. Padrão: 0
  --ate N            último segundo a desenhar. Padrão: o fim da animação
  --todas            exporta todas as animações do arquivo
  --colunas N        quadros por linha na folha de sprites
  --cores N          cores do GIF, no máximo 256. Padrão: 256
  --laco N           quantas vezes o GIF repete. 0 = para sempre. Padrão: 0
  --com-ossos        desenha também as linhas dos ossos
  --ajuda            mostra esta ajuda`;

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function lerArgumentos(argv) {
  const posicionais = [];
  const op = {
    formato: 'png', fps: 30, escala: 1, largura: null, margem: 0.12, fundo: null,
    recortar: true, de: 0, ate: null, todas: false, colunas: null, cores: 256,
    laco: 0, ossos: false, ajuda: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { posicionais.push(a); continue; }
    const [chave, junto] = a.slice(2).split('=');
    const valor = () => (junto !== undefined ? junto : argv[++i]);
    switch (chave) {
      case 'formato': op.formato = String(valor()).toLowerCase(); break;
      case 'fps': op.fps = Number(valor()); break;
      case 'escala': op.escala = Number(valor()); break;
      case 'largura': op.largura = Number(valor()); break;
      case 'margem': op.margem = Number(valor()); break;
      case 'fundo': op.fundo = String(valor()); break;
      case 'sem-recorte': op.recortar = false; break;
      case 'recortar': op.recortar = true; break;
      case 'de': op.de = Number(valor()); break;
      case 'ate': op.ate = Number(valor()); break;
      case 'todas': op.todas = true; break;
      case 'colunas': op.colunas = Number(valor()); break;
      case 'cores': op.cores = Number(valor()); break;
      case 'laco': op.laco = Number(valor()); break;
      case 'com-ossos': op.ossos = true; break;
      case 'ajuda': case 'help': op.ajuda = true; break;
      // QA 04/11/2026: a pergunta errada sai com 2 (o 1 é do erro do trabalho).
      default: throw Object.assign(new Error(`opção desconhecida: --${chave}`), { codigo: 2 });
    }
  }
  op.entrada = posicionais[0];
  // Com --todas o nome da animação não é passado, então a saída sobe uma casa.
  if (op.todas && posicionais.length === 2) {
    op.animacao = null;
    op.saida = posicionais[1];
  } else {
    op.animacao = posicionais[1];
    op.saida = posicionais[2];
  }
  return op;
}

const FORMATOS = new Set(['png', 'folha', 'gif']);

// ---------------------------------------------------------------------------
// Compilação do módulo de quadros
// ---------------------------------------------------------------------------

function maisRecente(pasta) {
  let t = 0;
  for (const e of readdirSync(pasta, { withFileTypes: true })) {
    const p = join(pasta, e.name);
    if (e.isDirectory()) t = Math.max(t, maisRecente(p));
    else if (e.name.endsWith('.ts')) t = Math.max(t, statSync(p).mtimeMs);
  }
  return t;
}

function garantirDist() {
  const alvo = join(DIST, 'ferramentas', 'src', 'exportar', 'quadros.js');
  const fonte = Math.max(maisRecente(join(RAIZ, 'runtime', 'src')), maisRecente(join(AQUI, 'src', 'exportar')));
  if (existsSync(alvo) && statSync(alvo).mtimeMs >= fonte) return alvo;
  const tsc = join(RAIZ, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!existsSync(tsc)) throw new Error('typescript não encontrado em node_modules');
  process.stderr.write('compilando exportador de quadros -> ferramentas/dist/exportar ...\n');
  execFileSync(process.execPath, [tsc, '-p', TSCONFIG], { stdio: 'inherit' });
  return alvo;
}

// ---------------------------------------------------------------------------
// Desenhar uma animação inteira
// ---------------------------------------------------------------------------

/**
 * Os limites do desenho ao longo da animação toda, para a câmera não pular de
 * quadro para quadro. Custa uma passada de pose sem desenhar nada, e é ela
 * que faz o GIF ficar parado no lugar em vez de respirar.
 */
function limitesDaAnimacao(rt, dados, animacao, tempos, passo) {
  const esqueleto = new rt.Skeleton(dados);
  esqueleto.setToSetupPose();
  esqueleto.updateWorldTransform(0);
  let caixa = esqueleto.getBounds();
  let anterior = null;
  for (const t of tempos) {
    posarAte(rt, esqueleto, animacao, t, passo, anterior);
    anterior = t;
    // QA 04/11/2026 (D10): as partículas entram na caixa.
    caixa = juntarLimites(caixa, limitesComParticulas(rt, esqueleto));
  }
  return caixa;
}

/** Desenha cada tempo pedido e devolve os quadros em RGBA. */
function desenharQuadros(rt, dados, imagens, animacao, tempos, camera, op) {
  const esqueleto = new rt.Skeleton(dados);
  esqueleto.setToSetupPose();
  esqueleto.updateWorldTransform(0);
  const quadros = [];
  let anterior = null;
  for (const t of tempos) {
    posarAte(rt, esqueleto, animacao, t, 1 / Math.max(1, op.fps * 2), anterior);
    anterior = t;
    const imagem = desenharPose(rt, esqueleto, imagens, camera, { fundo: op.fundo, ossos: op.ossos });
    quadros.push({ width: imagem.largura, height: imagem.altura, rgba: imagem.rgba, time: t });
  }
  return quadros;
}

// ---------------------------------------------------------------------------
// Resumo em português
// ---------------------------------------------------------------------------

function tamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Tabela de duas colunas alinhadas, para a leitura ficar fácil. */
function tabela(linhas) {
  const largura = Math.max(...linhas.map(([rotulo]) => rotulo.length));
  return linhas.map(([rotulo, valor]) => `  ${rotulo.padEnd(largura)}  ${valor}`).join('\n');
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

async function principal() {
  const op = lerArgumentos(process.argv.slice(2));
  if (op.ajuda || op.entrada === undefined || op.saida === undefined) {
    process.stdout.write(USO + '\n');
    process.exit(op.ajuda ? 0 : 2);
  }
  if (!FORMATOS.has(op.formato)) {
    throw new Error(`--formato aceita png, folha ou gif; não "${op.formato}"`);
  }
  if (!Number.isFinite(op.fps) || op.fps <= 0) throw new Error(`--fps inválido: ${op.fps}`);

  const entrada = resolve(process.cwd(), op.entrada);
  if (!existsSync(entrada)) throw new Error(`não achei o arquivo ${entrada}`);
  const saida = resolve(process.cwd(), op.saida);
  mkdirSync(dirname(saida), { recursive: true });

  const alvo = garantirDist();
  const q = await import(pathToFileURL(alvo).href);
  const rt = await carregarRuntime();
  const { dados, imagens } = abrirEsqueleto(rt, entrada);

  const nomes = dados.animations.map((a) => a.name);
  if (nomes.length === 0) throw new Error('este esqueleto não tem animação nenhuma');
  let escolhidas;
  if (op.todas) escolhidas = nomes;
  else if (op.animacao === undefined || op.animacao === null || op.animacao === '-') {
    throw new Error(`diga qual animação; há: ${nomes.join(', ')}`);
  } else if (!nomes.includes(op.animacao)) {
    throw new Error(`animação "${op.animacao}" não existe; há: ${nomes.join(', ')}`);
  } else escolhidas = [op.animacao];

  const escritos = [];
  const linhas = [];

  for (const nome of escolhidas) {
    const animacao = dados.animations.find((a) => a.name === nome);
    const tempos = q.frameTimes({
      duration: animacao.duration, fps: op.fps, from: op.de,
      ...(op.ate === null ? {} : { to: op.ate }),
    });
    const passo = 1 / Math.max(1, op.fps * 2);
    const caixa = limitesDaAnimacao(rt, dados, animacao, tempos, passo);
    const camera = cameraDe(caixa, {
      ...(op.largura !== null && op.largura > 0 ? { largura: op.largura } : {}),
      escala: op.escala, margem: op.margem,
    });
    let quadros = desenharQuadros(rt, dados, imagens, animacao, tempos, camera, op);
    if (op.recortar) quadros = q.autoCropFrames(quadros, 1).frames;

    const base = escolhidas.length > 1 ? `${saida}-${nome}` : saida;
    const curto = basename(base);

    if (op.formato === 'png') {
      for (let i = 0; i < quadros.length; i++) {
        const arquivo = join(dirname(base), q.frameFileName(curto, i));
        const bytes = gravarPng(quadros[i].width, quadros[i].height, quadros[i].rgba);
        writeFileSync(arquivo, bytes);
        escritos.push([basename(arquivo), tamanho(bytes.length)]);
      }
      linhas.push([nome, `${quadros.length} PNG de ${quadros[0].width}x${quadros[0].height}`]);
    } else if (op.formato === 'folha') {
      const folha = q.buildSpriteSheet(quadros, {
        ...(op.colunas !== null && op.colunas > 0 ? { columns: op.colunas } : {}),
        imageName: `${curto}.png`, animation: nome, fps: op.fps,
      });
      const png = gravarPng(folha.sheet.width, folha.sheet.height, folha.sheet.rgba);
      const json = `${JSON.stringify(folha.index, null, 2)}\n`;
      writeFileSync(`${base}.png`, png);
      writeFileSync(`${base}.json`, json, 'utf8');
      escritos.push([`${curto}.png`, tamanho(png.length)], [`${curto}.json`, tamanho(Buffer.byteLength(json))]);
      linhas.push([nome, `folha de ${folha.index.columns}x${folha.index.rows}, ${folha.index.count} quadros`]);
    } else {
      const gif = q.encodeGif(quadros, { fps: op.fps, loop: op.laco, maxColors: op.cores });
      writeFileSync(`${base}.gif`, gif);
      escritos.push([`${curto}.gif`, tamanho(gif.length)]);
      linhas.push([nome, `GIF de ${quadros.length} quadros, ${quadros[0].width}x${quadros[0].height}`]);
    }
  }

  process.stdout.write('\nImagens exportadas:\n\n');
  process.stdout.write(tabela(linhas) + '\n');
  process.stdout.write('\nArquivos gravados:\n\n');
  process.stdout.write(tabela(escritos.slice(0, 12)) + '\n');
  if (escritos.length > 12) process.stdout.write(`  … e mais ${escritos.length - 12} arquivos.\n`);

  if (op.formato === 'png') {
    process.stdout.write('\nPara virar MP4, passe a sequência para o ffmpeg:\n\n');
    process.stdout.write(`  ffmpeg -framerate ${op.fps} -i ${basename(saida)}_%04d.png `
      + '-c:v libx264 -pix_fmt yuv420p saida.mp4\n');
  }
  process.stdout.write('\n');
}

if (process.argv[1] !== undefined && process.argv[1].endsWith('exportar-imagem.mjs')) {
  principal().catch((e) => { process.stderr.write(`erro: ${e.message}\n`); process.exit(e.codigo ?? 1); });
}
