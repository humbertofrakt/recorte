#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Exportador para glTF 2.0 (requisito E6).
//
//   node ferramentas/exportar.mjs heroi.bone saida.glb
//   node ferramentas/exportar.mjs heroi.bone saida.gltf --formato gltf
//   node ferramentas/exportar.mjs heroi.bonez saida.glb --animacoes walk,attack
//
// Lê os três encodings do formato (.bone, .boneb e .bonez, pelos bytes), junta
// os atlas e as imagens das páginas, e grava:
//
//   .glb    um arquivo só, com o JSON, os números e as imagens dentro
//   .gltf   o JSON, mais um .bin ao lado com os números e as imagens
//
// Sem dependências: o exportador é `ferramentas/src/exportar/gltf.ts`, e este
// script o compila para `ferramentas/dist/exportar` quando está faltando ou
// desatualizado.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve, join, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';
import { inflateRawSync } from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const TSCONFIG = join(AQUI, 'src', 'exportar', 'tsconfig.json');
const DIST = join(AQUI, 'dist', 'exportar');

const USO = `Uso: node ferramentas/exportar.mjs <entrada> <saida> [opções]

  <entrada>            arquivo .bone, .boneb ou .bonez
  <saida>              arquivo .glb ou .gltf

  --formato gltf|glb   força o formato (padrão: pela extensão da saída)
  --animacoes LISTA    animações a exportar, separadas por vírgula
                       (padrão: todas)
  --peles LISTA        peles ativas na pose de setup (padrão: só a "default")
  --sem-imagens        não põe as imagens das páginas dentro do arquivo
  --passo-z N          distância no eixo z entre dois desenhos (padrão 0.1)
  --quadros N          amostras por segundo ao converter curva Bezier
  --ajuda              mostra esta ajuda`;

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function lerArgumentos(argv) {
  const posicionais = [];
  const op = { formato: null, animacoes: null, peles: null, imagens: true, passoZ: null, quadros: null, ajuda: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { posicionais.push(a); continue; }
    const [chave, junto] = a.slice(2).split('=');
    const valor = () => (junto !== undefined ? junto : argv[++i]);
    switch (chave) {
      case 'formato': op.formato = String(valor()).toLowerCase(); break;
      case 'animacoes': op.animacoes = String(valor()).split(',').map((s) => s.trim()).filter(Boolean); break;
      case 'peles': op.peles = String(valor()).split(',').map((s) => s.trim()).filter(Boolean); break;
      case 'sem-imagens': op.imagens = false; break;
      case 'passo-z': op.passoZ = Number(valor()); break;
      case 'quadros': op.quadros = Number(valor()); break;
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
// Compilação do exportador
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
  const alvo = join(DIST, 'ferramentas', 'src', 'exportar', 'gltf.js');
  const fonte = Math.max(maisRecente(join(RAIZ, 'runtime', 'src')), maisRecente(join(AQUI, 'src', 'exportar')));
  if (existsSync(alvo) && statSync(alvo).mtimeMs >= fonte) return alvo;
  const tsc = join(RAIZ, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!existsSync(tsc)) throw new Error('typescript não encontrado em node_modules');
  process.stderr.write('compilando exportador -> ferramentas/dist/exportar ...\n');
  execFileSync(process.execPath, [tsc, '-p', TSCONFIG], { stdio: 'inherit' });
  return alvo;
}

// ---------------------------------------------------------------------------
// Leitura da entrada
// ---------------------------------------------------------------------------

/**
 * Abre o esqueleto e junta os bytes das imagens de cada página.
 * Devolve `{ dados, imagens }`, com `imagens` no formato que o exportador quer.
 */
function abrirEsqueleto(rt, caminho) {
  const bytes = new Uint8Array(readFileSync(caminho));
  const encoding = rt.detectEncoding(bytes);
  const imagens = [];

  if (encoding === 'bonez') {
    const aberto = rt.loadSkeletonFile(bytes, {
      codec: { inflateRaw: (d) => new Uint8Array(inflateRawSync(Buffer.from(d))) },
    });
    for (const aviso of aberto.warnings) process.stderr.write(`aviso: ${aviso}\n`);
    const principal = aberto.archive.mainName;
    const base = principal.includes('/') ? principal.slice(0, principal.lastIndexOf('/') + 1) : '';
    for (const atlas of aberto.atlases) {
      for (const pagina of atlas.pages) {
        const entrada = aberto.archive.read(base + pagina.image) ?? aberto.archive.read(pagina.image);
        if (entrada === undefined) {
          process.stderr.write(`aviso: o pacote não traz a imagem "${pagina.image}"\n`);
          continue;
        }
        imagens.push({ page: pagina.name, bytes: entrada });
      }
    }
    return { dados: aberto.data, imagens };
  }

  const pasta = dirname(caminho);
  const doc = encoding === 'boneb' ? rt.readBoneb(bytes) : rt.parseBoneText(new TextDecoder().decode(bytes));
  const base = doc.assets?.imagesBase ?? '';
  const atlases = [];
  for (const uri of doc.assets?.atlases ?? []) {
    const caminhoAtlas = resolve(pasta, uri);
    if (!existsSync(caminhoAtlas)) {
      process.stderr.write(`aviso: atlas "${uri}" não achado em ${caminhoAtlas}\n`);
      continue;
    }
    const atlas = rt.loadAtlas(rt.parseBoneText(readFileSync(caminhoAtlas, 'utf8')));
    atlases.push(atlas);
    for (const pagina of atlas.pages) {
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
      imagens.push({ page: pagina.name, bytes: new Uint8Array(readFileSync(achado)) });
    }
  }
  const dados = rt.loadSkeletonData(doc, { atlases });
  for (const w of dados.warnings) process.stderr.write(`aviso: ${w.pointer} ${w.message}\n`);
  return { dados, imagens };
}

// ---------------------------------------------------------------------------
// Saída
// ---------------------------------------------------------------------------

function formatoDe(op) {
  if (op.formato !== null) {
    if (op.formato !== 'gltf' && op.formato !== 'glb') throw new Error(`--formato aceita "gltf" ou "glb", não "${op.formato}"`);
    return op.formato;
  }
  return op.saida.toLowerCase().endsWith('.gltf') ? 'gltf' : 'glb';
}

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
  const entrada = resolve(process.cwd(), op.entrada);
  const saida = resolve(process.cwd(), op.saida);
  if (!existsSync(entrada)) throw new Error(`não achei o arquivo ${entrada}`);

  const alvo = garantirDist();
  const gltf = await import(pathToFileURL(alvo).href);
  const rt = await import(pathToFileURL(join(DIST, 'runtime', 'src', 'index.js')).href);

  const { dados, imagens } = abrirEsqueleto(rt, entrada);
  const formato = formatoDe(op);
  const nomeBin = basename(saida).replace(/\.gltf$/i, '') + '.bin';

  const resultado = gltf.exportGltf(dados, {
    animations: op.animacoes ?? undefined,
    skins: op.peles ?? undefined,
    images: op.imagens ? imagens : [],
    zStep: op.passoZ === null || !Number.isFinite(op.passoZ) ? undefined : op.passoZ,
    bakeFps: op.quadros === null || !Number.isFinite(op.quadros) ? undefined : op.quadros,
    binName: formato === 'gltf' ? nomeBin : undefined,
  });

  mkdirSync(dirname(saida), { recursive: true });
  let escritos = [];
  if (formato === 'glb') {
    const glb = gltf.gltfToGlb(resultado);
    writeFileSync(saida, glb);
    escritos = [[basename(saida), tamanho(glb.length)]];
  } else {
    const texto = gltf.gltfJsonText(resultado, nomeBin);
    const caminhoBin = join(dirname(saida), nomeBin);
    writeFileSync(saida, texto, 'utf8');
    writeFileSync(caminhoBin, resultado.bin);
    escritos = [[basename(saida), tamanho(Buffer.byteLength(texto))], [nomeBin, tamanho(resultado.bin.length)]];
  }

  const s = resultado.stats;
  process.stdout.write(`\nExportado para glTF 2.0 (${formato}):\n\n`);
  process.stdout.write(tabela([
    ...escritos,
    ['ossos (joints)', String(s.joints)],
    ['nós', String(s.nodes)],
    ['malhas', String(s.meshes)],
    ['vértices', String(s.vertices)],
    ['triângulos', String(s.triangles)],
    ['animações', String(s.animations)],
    ['imagens', String(s.images)],
  ]) + '\n');

  if (resultado.warnings.length > 0) {
    process.stdout.write(`\nO que não coube no glTF (${resultado.warnings.length}):\n\n`);
    for (const aviso of resultado.warnings) process.stdout.write(`  - ${aviso}\n`);
  } else {
    process.stdout.write('\nNada se perdeu na conversão.\n');
  }
  process.stdout.write('\n');
}

if (process.argv[1] !== undefined && process.argv[1].endsWith('exportar.mjs')) {
  principal().catch((e) => { process.stderr.write(`erro: ${e.message}\n`); process.exit(e.codigo ?? 1); });
}
