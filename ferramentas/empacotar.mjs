#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Empacotador de atlas (requisito E2, §10 da especificação).
//
//   node ferramentas/empacotar.mjs pasta-com-pngs saida
//   node ferramentas/empacotar.mjs arte/heroi build/heroi --max 1024 --pot
//   node ferramentas/empacotar.mjs arte/heroi build/heroi --escala 1,0.5
//
// Lê todos os PNG da pasta (inclusive das subpastas), empacota e grava:
//   saida.atlas.json   o atlas de §10
//   saida.png          a primeira página
//   saida2.png         a segunda, se precisar
//
// Sem dependências: o decodificador e o codificador de PNG são de
// `ferramentas/src/atlas/png.ts` e o empacotador de `packer.ts`. Os dois são
// TypeScript; este script compila `ferramentas/src/atlas` para
// `ferramentas/dist/atlas` quando está faltando ou desatualizado.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join, basename, relative, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const TSCONFIG = join(AQUI, 'src', 'atlas', 'tsconfig.json');
const DIST = join(AQUI, 'dist', 'atlas');

const USO = `Uso: node ferramentas/empacotar.mjs <pasta-com-pngs> <saida> [opções]

  --max N             lado maior da página em pixels (padrão 2048)
  --padding N         espaço entre as imagens em pixels (padrão 2)
  --sangria N         pixels de borda duplicada (padrão: metade do padding)
  --pot               lados da página em potência de dois
  --multiplo-de-4     lados da página em múltiplo de quatro
  --quadrado          página quadrada
  --escala LISTA      uma ou mais escalas, separadas por vírgula (padrão 1)
  --premultiplicado   grava a página com alfa pré-multiplicado
  --sem-rotacao       não gira nenhuma imagem 90 graus
  --sem-corte         não corta a borda transparente das imagens
  --sem-apelidos      não junta imagens iguais numa região só
  --grade             empacota em grade, todas as células do mesmo tamanho
  --ajuda             mostra este texto`;

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function lerArgumentos(argv) {
  const posicionais = [];
  const op = {
    max: 2048, padding: 2, sangria: null, pot: false, multiploDeQuatro: false,
    quadrado: false, escalas: [1], premultiplicado: false, rotacao: true,
    corte: true, apelidos: true, metodo: 'maxrects', ajuda: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { posicionais.push(a); continue; }
    const [chave, valorJunto] = a.slice(2).split('=');
    const valor = () => (valorJunto !== undefined ? valorJunto : argv[++i]);
    switch (chave) {
      case 'max': op.max = Number(valor()); break;
      case 'padding': op.padding = Number(valor()); break;
      case 'sangria': op.sangria = Number(valor()); break;
      case 'pot': op.pot = true; break;
      case 'multiplo-de-4': op.multiploDeQuatro = true; break;
      case 'quadrado': op.quadrado = true; break;
      case 'escala': op.escalas = valor().split(',').map((v) => Number(v.trim())); break;
      case 'premultiplicado': op.premultiplicado = true; break;
      case 'sem-rotacao': op.rotacao = false; break;
      case 'sem-corte': op.corte = false; break;
      case 'sem-apelidos': op.apelidos = false; break;
      case 'grade': op.metodo = 'grid'; break;
      case 'ajuda': case 'help': op.ajuda = true; break;
      default: throw new Error(`opção desconhecida: --${chave}`);
    }
  }
  op.entrada = posicionais[0];
  op.saida = posicionais[1];
  return op;
}

// ---------------------------------------------------------------------------
// Compilação
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
  const indice = join(DIST, 'packer.js');
  const fonte = maisRecente(join(AQUI, 'src', 'atlas'));
  if (existsSync(indice) && statSync(indice).mtimeMs >= fonte) return;
  const tsc = join(RAIZ, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!existsSync(tsc)) throw new Error('typescript não encontrado em node_modules');
  process.stderr.write('compilando ferramentas/src/atlas -> ferramentas/dist/atlas ...\n');
  execFileSync(process.execPath, [tsc, '-p', TSCONFIG], { stdio: 'inherit' });
}

// ---------------------------------------------------------------------------
// zlib do Node no formato que o png.ts pede
// ---------------------------------------------------------------------------

const paraBuffer = (u8) => Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength);

const ZLIB = {
  inflate: (dados) => new Uint8Array(zlib.inflateSync(paraBuffer(dados))),
  deflate: (dados, nivel = 9) => new Uint8Array(zlib.deflateSync(paraBuffer(dados), { level: nivel })),
};

// ---------------------------------------------------------------------------
// Arquivos
// ---------------------------------------------------------------------------

const EXTENSOES = ['.png'];

/** Todos os PNG da pasta e das subpastas, em ordem de nome. */
function listarImagens(pasta) {
  const achados = [];
  const andar = (dir) => {
    const entradas = readdirSync(dir, { withFileTypes: true })
      .sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const e of entradas) {
      const caminho = join(dir, e.name);
      if (e.isDirectory()) andar(caminho);
      else if (EXTENSOES.some((ext) => e.name.toLowerCase().endsWith(ext))) achados.push(caminho);
    }
  };
  andar(pasta);
  return achados;
}

function porcentagem(fracao) {
  return `${(fracao * 100).toFixed(1).replace('.', ',')}%`;
}

/** Alinha um rótulo à esquerda, para as colunas do resumo baterem. */
function coluna(rotulo, largura) {
  return rotulo + ' '.repeat(Math.max(0, largura - rotulo.length));
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

async function principal() {
  const op = lerArgumentos(process.argv.slice(2));
  if (op.ajuda || op.entrada === undefined || op.saida === undefined) {
    process.stdout.write(`${USO}\n`);
    process.exit(op.ajuda ? 0 : 1);
  }

  const entrada = resolve(process.cwd(), op.entrada);
  if (!existsSync(entrada) || !statSync(entrada).isDirectory()) {
    throw new Error(`pasta não encontrada: ${entrada}`);
  }
  const saida = resolve(process.cwd(), op.saida);
  const pastaSaida = dirname(saida);
  const base = basename(saida);
  mkdirSync(pastaSaida, { recursive: true });

  garantirDist();
  const { decodePng, encodePng } = await import(pathToFileURL(join(DIST, 'png.js')).href);
  const { packAtlasScales, regionNameFromPath } = await import(pathToFileURL(join(DIST, 'packer.js')).href);

  const caminhos = listarImagens(entrada);
  if (caminhos.length === 0) throw new Error(`nenhum PNG em ${entrada}`);

  const itens = [];
  for (const caminho of caminhos) {
    const bytes = new Uint8Array(readFileSync(caminho));
    let imagem;
    try {
      imagem = decodePng(bytes, ZLIB);
    } catch (erro) {
      throw new Error(`${relative(entrada, caminho)}: ${erro.message}`);
    }
    itens.push({
      name: regionNameFromPath(relative(entrada, caminho).split(sep).join('/')),
      width: imagem.width,
      height: imagem.height,
      pixels: imagem.pixels,
    });
  }

  const opcoes = {
    maxWidth: op.max,
    maxHeight: op.max,
    padding: op.padding,
    rotation: op.rotacao,
    trim: op.corte,
    aliases: op.apelidos,
    pot: op.pot,
    multipleOfFour: op.multiploDeQuatro,
    square: op.quadrado,
    premultiplied: op.premultiplicado,
    method: op.metodo,
    pageName: base,
    generator: 'Recorte empacotador 0.1.0',
  };
  if (op.sangria !== null) opcoes.bleed = op.sangria;

  const resultados = packAtlasScales(itens, op.escalas, opcoes);

  const linhas = [];
  let paginasTotal = 0;
  for (let i = 0; i < resultados.length; i++) {
    const resultado = resultados[i];
    const escala = op.escalas[i];
    const sufixo = escala === 1 ? '' : `@${escala}x`;
    const nomeAtlas = `${base}${sufixo}.atlas.json`;
    writeFileSync(join(pastaSaida, nomeAtlas), `${JSON.stringify(resultado.atlas, null, 2)}\n`, 'utf8');
    for (const pagina of resultado.pages) {
      const png = encodePng(
        { width: pagina.width, height: pagina.height, pixels: pagina.pixels },
        ZLIB,
        { colorType: 'rgba8', filter: 'adaptive' },
      );
      writeFileSync(join(pastaSaida, pagina.image), paraBuffer(png));
      paginasTotal++;
    }
    linhas.push({
      atlas: nomeAtlas,
      escala,
      paginas: resultado.pages,
      regioes: resultado.regions.length,
      imagens: resultado.imageCount,
      aproveitamento: resultado.usage,
    });
  }

  // Resumo, em colunas alinhadas.
  const primeira = linhas[0];
  process.stdout.write('\n');
  process.stdout.write(`${coluna('Imagens lidas:', 22)}${primeira.imagens}\n`);
  process.stdout.write(`${coluna('Regiões no atlas:', 22)}${primeira.regioes}\n`);
  if (primeira.imagens !== primeira.regioes) {
    process.stdout.write(`${coluna('Imagens repetidas:', 22)}${primeira.imagens - primeira.regioes} (viraram apelidos)\n`);
  }
  process.stdout.write(`${coluna('Páginas por atlas:', 22)}${primeira.paginas.length}\n`);
  if (linhas.length > 1) {
    process.stdout.write(`${coluna('Escalas:', 22)}${linhas.length}\n`);
    process.stdout.write(`${coluna('Arquivos gravados:', 22)}${linhas.length} atlas e ${paginasTotal} páginas\n`);
  }
  process.stdout.write('\n');
  for (const linha of linhas) {
    process.stdout.write(`Escala ${linha.escala}\n`);
    process.stdout.write(`  ${coluna('Atlas:', 20)}${linha.atlas}\n`);
    for (const pagina of linha.paginas) {
      process.stdout.write(`  ${coluna('Página:', 20)}${pagina.image}  ${pagina.width} x ${pagina.height} px\n`);
    }
    process.stdout.write(`  ${coluna('Aproveitamento:', 20)}${porcentagem(linha.aproveitamento)}\n`);
  }
  process.stdout.write('\n');
}

principal().catch((erro) => {
  process.stderr.write(`erro: ${erro.message}\n`);
  process.exit(1);
});
