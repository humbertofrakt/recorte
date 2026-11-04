// SPDX-License-Identifier: Apache-2.0
// Adaptador da conformidade que roda SOBRE O PACOTE do leitor do Construct
// (rodada K1). É o `conformidade/adaptador-referencia.mjs` com uma diferença só:
// o runtime não vem de `ferramentas/dist/`, vem do arquivo que vai dentro do
// addon, `leitor-construct/addon/c3runtime/recorte-runtime.js`.
//
//   npm run leitor:construct
//   node ferramentas/conformidade.mjs --adaptador "node leitor-construct/testes/adaptador-pacote.mjs"
//
// O pacote é um script comum (como o Construct o carrega): ao rodar, ele deixa
// tudo em `globalThis.RecorteRuntime`. O `pose-dump` da prova foi compilado
// para ler as classes DE LÁ — por isso é importado depois do pacote.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const LEITOR = resolve(AQUI, '..');
// RECORTE_PACOTE troca o arquivo medido: é como se prova que a prova olha o pacote
// (um pacote estragado de propósito tem de reprovar casos).
const PACOTE = process.env.RECORTE_PACOTE ?? join(LEITOR, 'addon', 'c3runtime', 'recorte-runtime.js');
const PROVA = join(LEITOR, 'saida', 'prova', 'pose-dump.mjs');

for (const p of [PACOTE, PROVA]) {
  if (!existsSync(p)) throw new Error(`falta ${p}. Rode "npm run leitor:construct" antes.`);
}

await import(pathToFileURL(PACOTE).href);
const R = globalThis.RecorteRuntime;
if (R === undefined) throw new Error('o pacote rodou e não deixou globalThis.RecorteRuntime');
const { buildPoseDump } = await import(pathToFileURL(PROVA).href);
const { loadSkeletonFile, loadAtlas, parseBoneText } = R;

const pasta = process.argv[process.argv.length - 1];

let entrada = '';
for await (const pedaco of process.stdin) entrada += pedaco;
const sonda = JSON.parse(entrada);

const NOMES = ['entrada.bone', 'entrada.boneb', 'entrada.bonez'];
const caminho = NOMES.map((n) => join(pasta, n)).find((c) => existsSync(c));
if (caminho === undefined) throw new Error(`a pasta "${pasta}" não tem nenhum de: ${NOMES.join(', ')}`);

const atlases = [];
if (caminho.endsWith('.bone')) {
  const doc = JSON.parse(readFileSync(caminho, 'utf8'));
  for (const uri of doc.assets?.atlases ?? []) {
    const p = join(pasta, uri);
    if (existsSync(p)) atlases.push(loadAtlas(parseBoneText(readFileSync(p, 'utf8'))));
  }
}

const { data, bodies } = loadSkeletonFile(new Uint8Array(readFileSync(caminho)), {
  atlases,
  codec: { inflateRaw: (d) => inflateRawSync(d) },
  files: (pedido) => {
    const alvo = resolve(pasta, pedido);
    if (!alvo.startsWith(resolve(pasta))) return null;
    return existsSync(alvo) ? new Uint8Array(readFileSync(alvo)) : null;
  },
});

process.stdout.write(JSON.stringify(buildPoseDump(data, sonda, bodies)));
