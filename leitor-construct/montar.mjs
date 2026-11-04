#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Monta o leitor do Construct (rodada K1, 05/10/2026).
//
//   npm run leitor:construct
//
// Faz três coisas, nesta ordem:
//
//   1. O PACOTE: `src/pacote.ts` (o runtime inteiro, menos o render/canvas.ts,
//      mais o desenhador e o carregador do leitor) num arquivo .js só:
//      `addon/c3runtime/recorte-runtime.js`. Escrita ES2021, porque o Construct
//      ainda não aceita campos de classe (pesquisa 08, seção 2). O arquivo
//      entra no Construct como "external-runtime-script": um script comum, que
//      deixa tudo em `globalThis.RecorteRuntime`.
//
//   2. A PROVA: o `pose-dump` da conformidade, compilado de modo que todo
//      import dele que vá para `runtime/src` caia no `globalThis.RecorteRuntime`
//      do PACOTE. Assim os casos de `conformidade/casos/` medem o arquivo que vai dentro do addon, e
//      não o runtime de referência. Sai em `saida/prova/pose-dump.mjs`.
//
//   3. O ADDON: a pasta `addon/` num zip, `saida/Recorte.c3addon`.
//
//   4. O EXEMPLO: a pasta `exemplo/heroi-andando/` num zip, `saida/heroi-andando.c3p`
//      (rodada K5: até aqui ele era montado à mão, e podia ficar velho).
//
// Nada aqui escreve fora de `leitor-construct/`.

import { build } from 'esbuild';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';
import { ID_DO_ADDON } from './id.mjs';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const ADDON = join(AQUI, 'addon');
const SAIDA = join(AQUI, 'saida');
const PACOTE = join(ADDON, 'c3runtime', 'recorte-runtime.js');
const PROVA = join(SAIDA, 'prova', 'pose-dump.mjs');
const C3ADDON = join(SAIDA, 'Recorte.c3addon');
const C3P = join(SAIDA, 'heroi-andando.c3p');
const EXEMPLO = join(AQUI, 'exemplo', 'heroi-andando');

/** A escrita que o Construct aceita (pesquisa 08: "o SDK pede ES2021"). */
export const ALVO = 'es2021';

const CABECALHO = `// SPDX-License-Identifier: Apache-2.0
// Recorte — o runtime do formato .bone, empacotado para o Construct 3.
// GERADO por leitor-construct/montar.mjs a partir de runtime/src e
// leitor-construct/src. Não edite à mão: rode "npm run leitor:construct".
`;

/** As opções do pacote. `write: false` devolve o texto sem gravar (o teste usa). */
export function opcoesDoPacote() {
  return {
    entryPoints: [join(AQUI, 'src', 'pacote.ts')],
    outfile: PACOTE,
    bundle: true,
    format: 'iife',
    globalName: 'RecorteRuntime',
    target: ALVO,
    platform: 'neutral',
    banner: { js: CABECALHO },
    footer: { js: 'globalThis.RecorteRuntime = RecorteRuntime;' },
    legalComments: 'none',
    logLevel: 'warning',
  };
}

/** O texto que o pacote TEM de ter agora, montado na memória. */
export async function pacoteEmMemoria() {
  const r = await build({ ...opcoesDoPacote(), write: false });
  return r.outputFiles[0].text;
}

async function montarPacote() {
  await build(opcoesDoPacote());
}

/** Todo import do pose-dump que cair dentro de runtime/src vira o pacote. */
const paraOPacote = {
  name: 'para-o-pacote',
  setup(b) {
    const runtimeSrc = join(RAIZ, 'runtime', 'src') + sep;
    b.onResolve({ filter: /runtime\/src\// }, (args) => {
      const alvo = resolve(args.resolveDir, args.path);
      if (!alvo.startsWith(runtimeSrc)) return undefined;
      return { path: 'pacote', namespace: 'recorte-pacote' };
    });
    b.onLoad({ filter: /.*/, namespace: 'recorte-pacote' }, () => ({
      contents: 'module.exports = globalThis.RecorteRuntime;',
      loader: 'js',
    }));
  },
};

async function montarProva() {
  await build({
    entryPoints: [join(RAIZ, 'ferramentas', 'src', 'conformidade', 'pose-dump.ts')],
    outfile: PROVA,
    bundle: true,
    format: 'esm',
    target: 'node22',
    platform: 'node',
    plugins: [paraOPacote],
    logLevel: 'warning',
  });
}

// --- um zip pequeno (deflate do Node, sem biblioteca de fora) ---------------

const TABELA_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(bytes) {
  let c = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) c = TABELA_CRC[(c ^ bytes[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

/** Arquivos `{ nome, bytes }` num zip com deflate. Nomes com "/". */
export function zipar(arquivos) {
  const partes = [];
  const central = [];
  let pos = 0;
  for (const { nome, bytes } of arquivos) {
    const nomeB = Buffer.from(nome, 'utf8');
    const dados = deflateRawSync(bytes, { level: 9 });
    const crc = crc32(bytes);
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // nomes em UTF-8
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(0, 10);
    local.writeUInt16LE(0x21, 12); // 01/01/1980
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(dados.length, 18);
    local.writeUInt32LE(bytes.length, 22);
    local.writeUInt16LE(nomeB.length, 26);
    local.writeUInt16LE(0, 28);
    const cab = Buffer.alloc(46);
    cab.writeUInt32LE(0x02014b50, 0);
    cab.writeUInt16LE(20, 4);
    cab.writeUInt16LE(20, 6);
    cab.writeUInt16LE(0x0800, 8);
    cab.writeUInt16LE(8, 10);
    cab.writeUInt16LE(0, 12);
    cab.writeUInt16LE(0x21, 14);
    cab.writeUInt32LE(crc, 16);
    cab.writeUInt32LE(dados.length, 20);
    cab.writeUInt32LE(bytes.length, 24);
    cab.writeUInt16LE(nomeB.length, 28);
    cab.writeUInt32LE(pos, 42);
    central.push(cab, nomeB);
    partes.push(local, nomeB, dados);
    pos += 30 + nomeB.length + dados.length;
  }
  const tamCentral = central.reduce((s, b) => s + b.length, 0);
  const fim = Buffer.alloc(22);
  fim.writeUInt32LE(0x06054b50, 0);
  fim.writeUInt16LE(arquivos.length, 8);
  fim.writeUInt16LE(arquivos.length, 10);
  fim.writeUInt32LE(tamCentral, 12);
  fim.writeUInt32LE(pos, 16);
  return Buffer.concat([...partes, ...central, fim]);
}

function arquivosDe(pasta, base = pasta) {
  const lista = [];
  for (const nome of readdirSync(pasta).sort()) {
    const p = join(pasta, nome);
    if (statSync(p).isDirectory()) lista.push(...arquivosDe(p, base));
    else lista.push({ nome: relative(base, p).split(sep).join('/'), bytes: readFileSync(p) });
  }
  return lista;
}

/**
 * Leva o id de `id.mjs` a todo arquivo que ainda cita o velho. O velho é o que
 * está no addon.json. Troca o id exato e a forma minúscula (a chave do lang).
 * Devolve quantos arquivos mudaram.
 */
export function propagarId(novo = ID_DO_ADDON, ADDON_ = ADDON, EXEMPLO_ = EXEMPLO) {
  const caminhoAddon = join(ADDON_, 'addon.json');
  const velho = JSON.parse(readFileSync(caminhoAddon, 'utf8').replace(/^﻿/, '')).id;
  if (velho === novo) return 0;
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(novo)) throw new Error(`id inválido: "${novo}"`);
  const textos = [
    ...arquivosDe(ADDON_).filter((a) => /\.(js|json)$/.test(a.nome) && a.nome !== 'c3runtime/recorte-runtime.js').map((a) => join(ADDON_, a.nome)),
    ...arquivosDe(EXEMPLO_).filter((a) => /^(objectTypes\/.*\.json|project\.c3proj)$/.test(a.nome)).map((a) => join(EXEMPLO_, a.nome)),
  ];
  const exato = new RegExp(`\\b${velho}\\b`, 'g');
  const minusculo = new RegExp(`"${velho.toLowerCase()}"`, 'g');
  let n = 0;
  for (const p of textos) {
    const antes = readFileSync(p, 'utf8');
    const depois = antes.replace(exato, novo).replace(minusculo, `"${novo.toLowerCase()}"`);
    if (depois !== antes) { writeFileSync(p, depois); n++; }
  }
  return n;
}

function montarAddon() {
  // Só vai para o zip o que o addon.json lista: nada esquecido, nada a mais.
  const addon = JSON.parse(readFileSync(join(ADDON, 'addon.json'), 'utf8').replace(/^﻿/, ''));
  const presentes = new Map(arquivosDe(ADDON).map((a) => [a.nome, a]));
  const faltam = addon['file-list'].filter((n) => !presentes.has(n));
  if (faltam.length > 0) throw new Error(`o addon.json cita arquivos que não existem: ${faltam.join(', ')}`);
  const arquivos = addon['file-list'].map((n) => presentes.get(n));
  mkdirSync(SAIDA, { recursive: true });
  writeFileSync(C3ADDON, zipar(arquivos));
  return arquivos.length;
}

/** O projeto de exemplo, a pasta inteira, como vai no `.c3p` (um zip, como o Construct salva). */
export function arquivosDoExemplo(EXEMPLO_ = EXEMPLO) {
  return arquivosDe(EXEMPLO_);
}

function montarExemplo() {
  const arquivos = arquivosDoExemplo();
  writeFileSync(C3P, zipar(arquivos));
  return arquivos.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const trocados = propagarId();
  if (trocados > 0) process.stdout.write(`id      ${ID_DO_ADDON} levado a ${trocados} arquivo(s)
`);
  await montarPacote();
  await montarProva();
  const n = montarAddon();
  const ne = montarExemplo();
  const kb = (statSync(PACOTE).size / 1024).toFixed(0);
  process.stdout.write(`pacote  ${relative(RAIZ, PACOTE)} (${kb} KB, ${ALVO})\n`);
  process.stdout.write(`prova   ${relative(RAIZ, PROVA)}\n`);
  process.stdout.write(`addon   ${relative(RAIZ, C3ADDON)} (${n} arquivos)\n`);
  process.stdout.write(`exemplo ${relative(RAIZ, C3P)} (${ne} arquivos)\n`);
}
