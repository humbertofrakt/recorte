#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Fatiador: um arquivo por personagem, a partir de um projeto só (requisito E3).
//
//   node ferramentas/fatiar.mjs heroi.bone saida --peles default,armadura
//   node ferramentas/fatiar.mjs heroi.bone saida --animacoes idle,walk
//   node ferramentas/fatiar.mjs heroi.bone saida --pasta capa --sem-atlas
//   node ferramentas/fatiar.mjs heroi.bone saida --um-arquivo-por-pele
//
// Dez personagens que dividem o mesmo esqueleto são desenhados num projeto só.
// O jogo não quer carregar as dez peles em toda tela. Este comando faz o corte
// no fim: um `.bone` e um atlas por personagem, com a promessa de que a pose e
// a animação do que sobrou são IDÊNTICAS às do arquivo inteiro.
//
// Grava, ao lado do nome de saída:
//   saida.bone         o esqueleto fatiado
//   saida.atlas.json   o atlas com só as regiões usadas, reempacotado
//   saida.png          a página nova (saida2.png, se precisar de duas)
//
// Sem dependências: o corte é `ferramentas/src/exportar/fatiar.ts` e o
// empacotamento é o mesmo `packAtlas` de `ferramentas/src/atlas/packer.ts`.
// Este script compila os dois para `ferramentas/dist/exportar` quando falta.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const TSCONFIG = join(AQUI, 'src', 'exportar', 'tsconfig.json');
const DIST = join(AQUI, 'dist', 'exportar');

const USO = `Uso: node ferramentas/fatiar.mjs <entrada> <saida> [opções]

  <entrada>                arquivo .bone, .boneb ou .bonez
  <saida>                  nome de saída, SEM extensão

  Com um .bonez na entrada, a saída também é um .bonez: o esqueleto fatiado,
  o atlas e as páginas reempacotadas, num arquivo só.

  --peles LISTA            peles a manter, separadas por vírgula
                           (a pele "default" entra sempre)
  --animacoes LISTA        animações a manter, separadas por vírgula
  --pasta LISTA            pastas de slot a manter, separadas por vírgula
  --sem-atlas              não grava atlas nem página
  --um-arquivo-por-pele    grava um .bone para cada pele do arquivo
  --max N                  lado maior da página nova, em pixels (padrão 2048)
  --padding N              espaço entre as imagens, em pixels (padrão 2)
  --ajuda                  mostra este texto`;

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function lista(texto) {
  return String(texto).split(',').map((parte) => parte.trim()).filter(Boolean);
}

function lerArgumentos(argv) {
  const posicionais = [];
  const op = {
    peles: null, animacoes: null, pastas: null, atlas: true,
    umPorPele: false, max: 2048, padding: 2, ajuda: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { posicionais.push(a); continue; }
    const [chave, junto] = a.slice(2).split('=');
    const valor = () => (junto !== undefined ? junto : argv[++i]);
    switch (chave) {
      case 'peles': op.peles = lista(valor()); break;
      case 'animacoes': op.animacoes = lista(valor()); break;
      case 'pasta': case 'pastas': op.pastas = lista(valor()); break;
      case 'sem-atlas': op.atlas = false; break;
      case 'um-arquivo-por-pele': op.umPorPele = true; break;
      case 'max': op.max = Number(valor()); break;
      case 'padding': op.padding = Number(valor()); break;
      case 'ajuda': case 'help': op.ajuda = true; break;
      // QA 04/11/2026: a pergunta errada sai com 2 (o 1 é do erro do trabalho).
      default: throw Object.assign(new Error(`opção desconhecida: --${chave}`), { codigo: 2 });
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
  const alvo = join(DIST, 'ferramentas', 'src', 'exportar', 'fatiar.js');
  const imagem = join(DIST, 'ferramentas', 'src', 'atlas', 'png.js');
  const fonte = Math.max(
    maisRecente(join(RAIZ, 'runtime', 'src')),
    maisRecente(join(AQUI, 'src', 'exportar')),
    maisRecente(join(AQUI, 'src', 'atlas')),
    statSync(TSCONFIG).mtimeMs,
  );
  if (existsSync(alvo) && existsSync(imagem) && statSync(alvo).mtimeMs >= fonte) return;
  const tsc = join(RAIZ, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!existsSync(tsc)) throw new Error('typescript não encontrado em node_modules');
  process.stderr.write('compilando o fatiador -> ferramentas/dist/exportar ...\n');
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

/** O mesmo zlib, no formato que o `.bonez` pede (deflate cru, §2.9). */
const ZIP = {
  deflateRaw: (dados) => new Uint8Array(zlib.deflateRawSync(paraBuffer(dados), { level: 9 })),
  inflateRaw: (dados) => new Uint8Array(zlib.inflateRawSync(paraBuffer(dados))),
};

/**
 * Grava o PNG do jeito que ficar MENOR.
 *
 * Uma página de arte 2D costuma caber numa paleta, e uma paleta corta o
 * arquivo pela metade; uma página com muita cor, não. Em vez de escolher de
 * antemão, as quatro combinações são geradas e a menor ganha. As páginas aqui
 * são pequenas, então isso custa milissegundos — e o arquivo do jogador é o
 * que importa.
 */
function melhorPng(png, pagina) {
  const imagem = { width: pagina.width, height: pagina.height, pixels: pagina.pixels };
  let menor = null;
  for (const colorType of ['auto', 'rgba8']) {
    for (const filter of ['adaptive', 0]) {
      const bytes = png.encodePng(imagem, ZLIB, { colorType, filter });
      if (menor === null || bytes.length < menor.length) menor = bytes;
    }
  }
  return menor;
}

// ---------------------------------------------------------------------------
// Leitura
// ---------------------------------------------------------------------------

/** Junta pedaços de caminho DENTRO do ZIP: sempre `/`, sem `.` nem `..`. */
function juntarNoPacote(...partes) {
  const saida = [];
  for (const parte of partes.join('/').split('/')) {
    if (parte === '' || parte === '.') continue;
    if (parte === '..') saida.pop();
    else saida.push(parte);
  }
  return saida.join('/');
}

/** A pasta de um nome de entrada do ZIP, ou `''` na raiz. */
function pastaNoPacote(nome) {
  return nome.includes('/') ? nome.slice(0, nome.lastIndexOf('/')) : '';
}

/**
 * Lê um `.bonez` (§2.9): o esqueleto principal, os atlas e as páginas, todos
 * de dentro do ZIP — lote 41. Devolve o mesmo formato do `abrir` de disco, e o
 * resto do fatiador não precisa saber de onde as coisas vieram.
 */
function abrirPacote(rt, png, bonez, bytes) {
  const pacote = bonez.readBonez(bytes, ZIP);
  for (const aviso of pacote.warnings) process.stderr.write(`aviso: ${aviso}\n`);
  const principal = pacote.readMain();
  const arquivo = rt.detectEncoding(principal) === 'boneb'
    ? rt.readBoneb(principal)
    : rt.parseBoneText(new TextDecoder().decode(principal));

  const pastaMain = pastaNoPacote(pacote.mainName);
  const base = arquivo.assets?.imagesBase ?? '';
  const atlases = [];
  for (const uri of arquivo.assets?.atlases ?? []) {
    const entrada = juntarNoPacote(pastaMain, uri);
    const dados = pacote.read(entrada);
    if (dados === undefined) {
      process.stderr.write(`aviso: atlas "${uri}" não está dentro do pacote\n`);
      continue;
    }
    const texto = new TextDecoder().decode(dados);
    const json = JSON.parse(texto);
    const paginas = [];
    for (const pagina of json.pages ?? []) {
      // Os mesmos três lugares do disco, agora dentro do ZIP.
      const candidatos = [
        juntarNoPacote(pastaMain, base, pagina.image),
        juntarNoPacote(pastaNoPacote(entrada), pagina.image),
        juntarNoPacote(pastaMain, pagina.image),
      ];
      const achado = candidatos.find((c) => pacote.has(c));
      if (achado === undefined) {
        process.stderr.write(`aviso: página "${pagina.name}" sem imagem no pacote (${pagina.image})\n`);
        continue;
      }
      const cru = pacote.read(achado);
      const imagem = png.decodePng(cru, ZLIB);
      paginas.push({
        name: pagina.name, width: imagem.width, height: imagem.height,
        pixels: imagem.pixels, bytes: cru.length, crus: cru,
      });
    }
    atlases.push({ uri, json, texto, paginas });
  }
  return { arquivo, atlases, pacote: true };
}

/** Lê o esqueleto, o atlas e as páginas que estiverem no disco — ou no pacote. */
function abrir(rt, png, bonez, caminho) {
  const bytes = new Uint8Array(readFileSync(caminho));
  const encoding = rt.detectEncoding(bytes);
  if (encoding === 'bonez') return abrirPacote(rt, png, bonez, bytes);
  const arquivo = encoding === 'boneb'
    ? rt.readBoneb(bytes)
    : rt.parseBoneText(new TextDecoder().decode(bytes));

  const pasta = dirname(caminho);
  const base = arquivo.assets?.imagesBase ?? '';
  const atlases = [];
  for (const uri of arquivo.assets?.atlases ?? []) {
    const caminhoAtlas = resolve(pasta, uri);
    if (!existsSync(caminhoAtlas)) {
      process.stderr.write(`aviso: atlas "${uri}" não achado em ${caminhoAtlas}\n`);
      continue;
    }
    const texto = readFileSync(caminhoAtlas, 'utf8');
    const json = JSON.parse(texto);
    const paginas = [];
    for (const pagina of json.pages ?? []) {
      // §2.8: a página é relativa a `imagesBase`; o exemplo guarda o PNG ao
      // lado do atlas, então os dois lugares são tentados.
      const candidatos = [
        resolve(pasta, base, pagina.image),
        resolve(dirname(caminhoAtlas), pagina.image),
        resolve(pasta, pagina.image),
      ];
      const achado = candidatos.find((c) => existsSync(c));
      if (achado === undefined) {
        process.stderr.write(`aviso: página "${pagina.name}" sem imagem (${pagina.image})\n`);
        continue;
      }
      const cru = new Uint8Array(readFileSync(achado));
      const imagem = png.decodePng(cru, ZLIB);
      paginas.push({
        name: pagina.name, width: imagem.width, height: imagem.height,
        pixels: imagem.pixels, bytes: cru.length, crus: cru,
      });
    }
    atlases.push({ uri, json, texto, paginas });
  }
  return { arquivo, atlases, pacote: false };
}

// ---------------------------------------------------------------------------
// Escrita
// ---------------------------------------------------------------------------

/**
 * Grava o atlas fatiado e as páginas novas. Devolve os bytes gravados e os
 * bytes que o atlas velho ocupava, para a conta de quanto encolheu.
 *
 * `gravar(nome, bytes)` decide para onde vai cada arquivo: para o disco, ao
 * lado do `.bone`, ou para dentro do `.bonez` de saída — lote 41.
 */
function gravarAtlas(fatiar, png, entrada, saidaBase, regioes, opcoes, gravar) {
  if (entrada.atlases.length === 0) return null;
  const nomeBase = basename(saidaBase);
  const usadas = new Set(regioes);

  let antes = 0;
  let depois = 0;
  const gravados = [];
  const faltando = [];
  let regioesAntes = 0;
  let regioesDepois = 0;
  let reempacotados = 0;

  for (let i = 0; i < entrada.atlases.length; i++) {
    const fonte = entrada.atlases[i];
    antes += Buffer.byteLength(fonte.texto, 'utf8');
    for (const pagina of fonte.paginas) antes += pagina.bytes;
    regioesAntes += (fonte.json.regions ?? []).length;

    const sufixo = entrada.atlases.length === 1 ? '' : `-${i + 1}`;
    const nomePagina = `${nomeBase}${sufixo}`;
    const nomeArquivo = `${nomePagina}.atlas.json`;
    const corte = fatiar.sliceAtlasRegions(fonte.json, usadas);
    for (const nome of corte.report.missing) faltando.push(nome);

    // Nada saiu do atlas? Então nada se ganha em reempacotar, e reempacotar
    // um PNG já otimizado costuma deixá-lo MAIOR. Os bytes originais são
    // copiados, só o nome muda.
    if (corte.report.dropped.length === 0) {
      regioesDepois += corte.atlas.regions.length;
      const json = { ...fonte.json, pages: fonte.json.pages.map((p, k) => ({
        ...p, image: `${nomePagina}${k === 0 ? '' : String(k + 1)}.png`,
      })) };
      const texto = `${JSON.stringify(json, null, 2)}\n`;
      gravar(nomeArquivo, Buffer.from(texto, 'utf8'));
      depois += Buffer.byteLength(texto, 'utf8');
      gravados.push({ nome: nomeArquivo, largura: null, altura: null });
      for (let k = 0; k < fonte.paginas.length; k++) {
        const pagina = fonte.paginas[k];
        const nome = json.pages[k].image;
        gravar(nome, paraBuffer(pagina.crus));
        depois += pagina.crus.length;
        gravados.push({ nome, largura: pagina.width, altura: pagina.height });
      }
      continue;
    }

    reempacotados++;
    const resultado = fatiar.repackAtlas(fonte.json, fonte.paginas, usadas, {
      pageName: nomePagina,
      maxWidth: opcoes.max,
      maxHeight: opcoes.max,
      padding: opcoes.padding,
      generator: 'Recorte fatiador 0.1.0',
    });
    regioesDepois += resultado.atlas.regions.length;

    const texto = `${JSON.stringify(resultado.atlas, null, 2)}\n`;
    gravar(nomeArquivo, Buffer.from(texto, 'utf8'));
    depois += Buffer.byteLength(texto, 'utf8');
    gravados.push({ nome: nomeArquivo, largura: null, altura: null });

    for (const pagina of resultado.pages) {
      const bytes = melhorPng(png, pagina);
      gravar(pagina.image, paraBuffer(bytes));
      depois += bytes.length;
      gravados.push({ nome: pagina.image, largura: pagina.width, altura: pagina.height });
    }
  }

  return { antes, depois, gravados, faltando, regioesAntes, regioesDepois, reempacotados };
}

// ---------------------------------------------------------------------------
// Resumo, em colunas alinhadas
// ---------------------------------------------------------------------------

/**
 * Uma tabela de colunas alinhadas.
 *
 * `alinhar` diz, por coluna, se ela vai para a direita (números) ou para a
 * esquerda (palavras). Números à direita porque a vírgula do milhar tem de
 * ficar uma embaixo da outra; palavras à esquerda porque é por onde a leitura
 * começa. A última coluna nunca leva espaço à toa no fim.
 */
function tabela(linhas, alinhar = []) {
  const colunas = Math.max(0, ...linhas.map((linha) => linha.length));
  const largura = [];
  for (let c = 0; c < colunas; c++) {
    largura.push(Math.max(0, ...linhas.map((linha) => String(linha[c] ?? '').length)));
  }
  return linhas.map((linha) => {
    const partes = [];
    for (let c = 0; c < colunas; c++) {
      const texto = String(linha[c] ?? '');
      if (c === colunas - 1) partes.push(alinhar[c] === 'direita' ? texto.padStart(largura[c]) : texto);
      else partes.push(alinhar[c] === 'direita' ? texto.padStart(largura[c]) : texto.padEnd(largura[c]));
    }
    return `  ${partes.join('   ')}`.replace(/\s+$/, '');
  }).join('\n');
}

function numero(valor) {
  return Math.round(valor).toLocaleString('pt-BR');
}

/** `37,5% menor`, `12,0% maior` ou `do mesmo tamanho`. Sem sinal para decifrar. */
function diferenca(fracao) {
  const conta = `${(Math.abs(fracao) * 100).toFixed(1).replace('.', ',')}%`;
  if (Math.abs(fracao) < 0.0005) return 'do mesmo tamanho';
  return fracao > 0 ? `${conta} menor` : `${conta} maior`;
}

function escreverResumo(fatiar, titulo, resultado, esqueleto, atlas) {
  const partes = [];
  const linha = (texto = '') => partes.push(`${texto}\n`);

  linha();
  linha(titulo);
  linha();

  linha('Ficou com');
  linha();
  linha(tabela([
    ['o quê', 'agora', 'antes'],
    ['Ossos', numero(resultado.after.bones), numero(resultado.before.bones)],
    ['Slots', numero(resultado.after.slots), numero(resultado.before.slots)],
    ['Peles', numero(resultado.after.skins), numero(resultado.before.skins)],
    ['Desenhos', numero(resultado.after.attachments), numero(resultado.before.attachments)],
    ['Regras', numero(resultado.after.constraints), numero(resultado.before.constraints)],
    ['Eventos', numero(resultado.after.events), numero(resultado.before.events)],
    ['Animações', numero(resultado.after.animations), numero(resultado.before.animations)],
    ['Trilhas', numero(resultado.after.timelines), numero(resultado.before.timelines)],
    ['Chaves', numero(resultado.after.keys), numero(resultado.before.keys)],
  ], ['esquerda', 'direita', 'direita']));
  linha();

  linha(tabela([
    ['Peles que ficaram', resultado.skins.join(', ') || '(nenhuma)'],
    ['Animações que ficaram', resultado.animations.join(', ') || '(nenhuma)'],
  ]));
  if (resultado.animationsKeptForDrivers.length > 0) {
    linha();
    linha(`  Uma regra "driver" toca estas animações, então elas ficaram: ${resultado.animationsKeptForDrivers.join(', ')}`);
  }
  if (resultado.slotsKeptForConstraints.length > 0) {
    linha();
    linha(`  Uma regra precisa ler estes slots, então eles ficaram: ${resultado.slotsKeptForConstraints.join(', ')}`);
  }
  linha();

  const grupos = fatiar.groupRemoved(resultado.removed);
  const quantos = resultado.removed.length;
  linha(`O que saiu   (${numero(quantos)} ${quantos === 1 ? 'item' : 'itens'})`);
  linha();
  if (grupos.length === 0) {
    linha('  Nada saiu. O arquivo já era só isto.');
    linha();
  } else {
    linha(tabela([
      ['tipo', 'quantos', 'bytes'],
      ...grupos.map((g) => [g.label, numero(g.count), numero(g.bytes)]),
    ], ['esquerda', 'direita', 'direita']));
    linha();
    linha('Item por item');
    linha();
    linha(tabela(resultado.removed.map((item) => [
      fatiar.KIND_LABELS[item.kind], item.name, item.reason,
    ])));
    linha();
  }

  const doEsqueleto = fatiar.shrink(esqueleto.antes, esqueleto.depois);
  const contas = [
    ['Esqueleto', `${numero(doEsqueleto.before)} -> ${numero(doEsqueleto.after)}`, diferenca(doEsqueleto.fraction)],
  ];
  if (atlas !== null) {
    const doAtlas = fatiar.shrink(atlas.antes, atlas.depois);
    contas.push(['Atlas e páginas', `${numero(doAtlas.before)} -> ${numero(doAtlas.after)}`, diferenca(doAtlas.fraction)]);
    const total = fatiar.shrink(doEsqueleto.before + doAtlas.before, doEsqueleto.after + doAtlas.after);
    contas.push(['Tudo junto', `${numero(total.before)} -> ${numero(total.after)}`, diferenca(total.fraction)]);
  }
  linha('Encolheu');
  linha();
  linha(tabela([['o quê', 'de -> para, em bytes', 'resultado'], ...contas], ['esquerda', 'direita', 'esquerda']));
  linha();

  if (atlas !== null) {
    linha('Atlas');
    linha();
    linha(tabela([
      ['o quê', 'agora', 'antes'],
      ['Regiões', numero(atlas.regioesDepois), numero(atlas.regioesAntes)],
    ], ['esquerda', 'direita', 'direita']));
    linha();
    linha(tabela(atlas.gravados.map((g) => [
      g.largura === null ? 'Arquivo' : 'Página',
      g.nome,
      g.largura === null ? '' : `${g.largura} x ${g.altura} px`,
    ])));
    if (atlas.reempacotados === 0) {
      linha();
      linha('  Nenhuma região saiu do atlas, então a página foi copiada sem mexer nos pixels.');
    }
    if (atlas.faltando.length > 0) {
      linha();
      linha(`  O atlas não tem estas regiões: ${atlas.faltando.join(', ')}`);
    }
    linha();
  }
  process.stdout.write(partes.join(''));
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

async function principal() {
  const op = lerArgumentos(process.argv.slice(2));
  if (op.ajuda || op.entrada === undefined || op.saida === undefined) {
    process.stdout.write(`${USO}\n`);
    process.exit(op.ajuda ? 0 : 2);
  }

  const entradaCaminho = resolve(process.cwd(), op.entrada);
  if (!existsSync(entradaCaminho)) throw new Error(`não achei o arquivo ${entradaCaminho}`);
  const saidaBase = resolve(process.cwd(), op.saida).replace(/\.bonez?$/i, '');
  mkdirSync(dirname(saidaBase), { recursive: true });

  garantirDist();
  const fatiar = await import(pathToFileURL(join(DIST, 'ferramentas', 'src', 'exportar', 'fatiar.js')).href);
  const png = await import(pathToFileURL(join(DIST, 'ferramentas', 'src', 'atlas', 'png.js')).href);
  const rt = await import(pathToFileURL(join(DIST, 'runtime', 'src', 'index.js')).href);
  const bonez = await import(pathToFileURL(join(DIST, 'runtime', 'src', 'binario', 'bonez.js')).href);

  const entrada = abrir(rt, png, bonez, entradaCaminho);

  const cortes = [];
  if (op.umPorPele) {
    const peles = (entrada.arquivo.skins ?? []).map((pele) => pele.name);
    if (peles.length === 0) throw new Error('este arquivo não tem pele nenhuma');
    for (const pele of peles) {
      cortes.push({
        rotulo: `Pele "${pele}"`,
        saida: `${saidaBase}-${pele}`,
        opcoes: { skins: [pele], animations: op.animacoes ?? undefined, folders: op.pastas ?? undefined },
      });
    }
  } else {
    cortes.push({
      rotulo: 'Fatiado',
      saida: saidaBase,
      opcoes: {
        skins: op.peles ?? undefined,
        animations: op.animacoes ?? undefined,
        folders: op.pastas ?? undefined,
      },
    });
  }

  for (const corte of cortes) {
    const resultado = fatiar.sliceBoneFile(entrada.arquivo, {
      ...corte.opcoes,
      generator: 'Recorte fatiador 0.1.0',
    });

    // O esqueleto aponta para o atlas ao lado dele, com o nome novo.
    const arquivo = resultado.file;
    if (op.atlas && entrada.atlases.length > 0) {
      const nomeBase = basename(corte.saida);
      arquivo.assets = {
        ...arquivo.assets,
        atlases: entrada.atlases.map((_, i) =>
          `${nomeBase}${entrada.atlases.length === 1 ? '' : `-${i + 1}`}.atlas.json`),
        imagesBase: '',
      };
    }

    // Pacote na entrada, pacote na saída — lote 41. Cada arquivo vai para a
    // memória em vez do disco, e no fim sai um `.bonez` só.
    const pastaSaida = dirname(corte.saida);
    const noPacote = [];
    const gravar = entrada.pacote
      ? (nome, dados) => { noPacote.push({ name: nome, data: new Uint8Array(dados) }); }
      : (nome, dados) => { writeFileSync(join(pastaSaida, nome), dados); };

    const nomeEsqueleto = `${basename(corte.saida)}.bone`;
    const textoEsqueleto = `${JSON.stringify(arquivo, null, 2)}\n`;
    gravar(nomeEsqueleto, Buffer.from(textoEsqueleto, 'utf8'));
    const bytesDepois = Buffer.byteLength(textoEsqueleto, 'utf8');
    const atlas = op.atlas
      ? gravarAtlas(fatiar, png, entrada, corte.saida, resultado.regions, op, gravar)
      : null;

    let pacote = null;
    if (entrada.pacote) {
      const nomes = noPacote.map((f) => f.name);
      const manifest = {
        bonez: { version: '1.0' },
        main: nomeEsqueleto,
        skeletons: [nomeEsqueleto],
        atlases: nomes.filter((n) => n.endsWith('.atlas.json')),
        images: nomes.filter((n) => n.endsWith('.png')),
      };
      const bytes = bonez.writeBonez({ manifest, files: noPacote }, ZIP);
      writeFileSync(`${corte.saida}.bonez`, paraBuffer(bytes));
      pacote = { nome: `${basename(corte.saida)}.bonez`, bytes: bytes.length, dentro: noPacote.length };
    }

    // A prova de que o resultado abre: o runtime de referência lê o que
    // acabou de sair, e todo aviso dele vai para a tela.
    const lerTexto = (uri) => (entrada.pacote
      ? new TextDecoder().decode(noPacote.find((f) => f.name === uri)?.data ?? new Uint8Array())
      : readFileSync(join(pastaSaida, uri), 'utf8'));
    const lidos = atlas === null
      ? []
      : (arquivo.assets?.atlases ?? []).map((uri) => rt.loadAtlas(JSON.parse(lerTexto(uri))));
    const dados = rt.loadSkeletonData(arquivo, { atlases: lidos });
    for (const aviso of dados.warnings) {
      process.stderr.write(`aviso: ${aviso.pointer} ${aviso.message}\n`);
    }

    escreverResumo(
      fatiar,
      `${corte.rotulo}   ->   ${pacote === null ? nomeEsqueleto : pacote.nome}`,
      resultado,
      // Os dois lados medidos com o MESMO gravador: comparar o arquivo de
      // entrada, formatado à mão, com a saída do JSON.stringify mediria o
      // gosto de quem digitou, não o corte.
      { antes: Buffer.byteLength(`${JSON.stringify(entrada.arquivo, null, 2)}
`, 'utf8'), depois: bytesDepois },
      atlas,
    );
    if (pacote !== null) {
      process.stdout.write(`Pacote\n\n${tabela([
        ['Arquivo', pacote.nome, `${numero(pacote.bytes)} bytes`, `${pacote.dentro} arquivos dentro`],
      ], ['esquerda', 'esquerda', 'direita', 'esquerda'])}\n\n`);
    }
  }
}

if (process.argv[1] !== undefined && process.argv[1].endsWith('fatiar.mjs')) {
  principal().catch((erro) => { process.stderr.write(`erro: ${erro.message}\n`); process.exit(erro.codigo ?? 1); });
}
