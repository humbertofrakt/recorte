// SPDX-License-Identifier: Apache-2.0
// Adaptador de referência da suíte de conformidade do formato bone (§12.4).
//
// É o arquivo que você lê linha a linha quando o SEU adaptador diverge.
//
// Ele implementa o contrato do Passo 2 do guia, e nada além dele:
//
//   entrada   a pasta do caso vem como ÚLTIMO argumento da linha de comando;
//             a sonda (`probe`) vem inteira pela entrada padrão, em JSON.
//   saída     o pose dump, em JSON, pela saída padrão. Nada mais na saída
//             padrão: nem log, nem aviso, nem linha em branco.
//   erro      recusar o arquivo é sair com código diferente de zero e
//             escrever o motivo na saída de ERRO. O caso X-305 exige isso.
//
// Rode assim, da raiz do projeto:
//
//   node ferramentas/conformidade.mjs --adaptador "node conformidade/adaptador-referencia.mjs"
//
// e os casos passam (os 53 de casos/ e, com --casos conformidade/casos-pendentes, os pendentes). Se o seu runtime falha num caso e este passa, a
// diferença está no seu runtime, não na suíte — e você pode comparar os dois
// dumps lado a lado.
//
// Este adaptador usa o runtime de referência em TypeScript, já compilado em
// `ferramentas/dist/conformidade/`. Se essa pasta não existir, rode
// `node ferramentas/conformidade.mjs` uma vez: ele compila sozinho.

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { inflateRawSync } from 'node:zlib';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RAIZ, 'ferramentas', 'dist', 'conformidade');

function moduloDeDist(...partes) {
  const caminho = join(DIST, ...partes);
  if (!existsSync(caminho)) {
    throw new Error(
      `o runtime de referência não está compilado: falta ${caminho}.\n`
      + 'Rode "node ferramentas/conformidade.mjs" uma vez; ele compila sozinho.',
    );
  }
  return import(pathToFileURL(caminho).href);
}

const { loadSkeletonFile, loadAtlas, parseBoneText } =
  await moduloDeDist('runtime', 'src', 'index.js');
const { buildPoseDump } =
  await moduloDeDist('ferramentas', 'src', 'conformidade', 'pose-dump.js');

// ---------------------------------------------------------------------------
// 1. A pasta do caso e a sonda
// ---------------------------------------------------------------------------

const pasta = process.argv[process.argv.length - 1];

let entrada = '';
for await (const pedaco of process.stdin) entrada += pedaco;
const sonda = JSON.parse(entrada);

// ---------------------------------------------------------------------------
// 2. Carregar o esqueleto
// ---------------------------------------------------------------------------

// As três embalagens da §2.9, nesta ordem. Um caso BIN traz `entrada.boneb` e
// um caso ZIP traz `entrada.bonez`; a maioria traz `entrada.bone`.
const NOMES = ['entrada.bone', 'entrada.boneb', 'entrada.bonez'];
const caminho = NOMES.map((n) => join(pasta, n)).find((c) => existsSync(c));
if (caminho === undefined) {
  throw new Error(`a pasta "${pasta}" não tem nenhum de: ${NOMES.join(', ')}`);
}

// Atlas solto ao lado só existe no `.bone` de texto: o `.boneb` não é JSON, e
// o `.bonez` já traz os atlas dentro do pacote — `loadSkeletonFile` acha.
const atlases = [];
if (caminho.endsWith('.bone')) {
  const doc = JSON.parse(readFileSync(caminho, 'utf8'));
  for (const uri of doc.assets?.atlases ?? []) {
    const p = join(pasta, uri);
    if (existsSync(p)) atlases.push(loadAtlas(parseBoneText(readFileSync(p, 'utf8'))));
  }
}

// O `codec` só é usado pelo `.bonez`, que é um ZIP com deflate cru. Um runtime
// que não abra pacote pode passar sem ele e falhar só o caso ZIP.
//
// Se este `loadSkeletonFile` estourar — por exemplo num arquivo cujo
// `extensionsRequired` cita uma extensão desconhecida (2.7) — a exceção sobe,
// o processo sai com código diferente de zero e a mensagem vai para a saída de
// erro. É exatamente o que o caso X-305 espera; não capture isso.
const { data, bodies } = loadSkeletonFile(new Uint8Array(readFileSync(caminho)), {
  atlases,
  codec: { inflateRaw: (d) => inflateRawSync(d) },
  // §2.8: o "resolver" de um .bone solto. Um caso pode trazer arquivos ao lado
  // da entrada — o esqueleto aninhado (7.11), as animações e peles de fora
  // (2.8), os corpos da virada (9.13) —, e eles só são lidos de dentro da
  // pasta do caso. Nunca fora dela.
  files: (pedido) => {
    const alvo = resolve(pasta, pedido);
    if (!alvo.startsWith(resolve(pasta))) return null;
    return existsSync(alvo) ? new Uint8Array(readFileSync(alvo)) : null;
  },
});

// ---------------------------------------------------------------------------
// 3. Montar o dump e escrever
// ---------------------------------------------------------------------------

// `buildPoseDump` faz, para cada tempo da sonda, os cinco passos do Passo 3 do
// guia: pose de repouso, animação, avanço do relógio de física, transformação
// de mundo, leitura. Um runtime de terceiro escreve esses cinco passos aqui.
// `bodies` são os corpos que as chaves `body` citam (9.13), já carregados.
const dump = buildPoseDump(data, sonda, bodies);

// Saída padrão: só o JSON. Um `console.log` extra aqui reprova todos os casos
// de uma vez, e é o erro mais comum de quem escreve o primeiro adaptador.
process.stdout.write(JSON.stringify(dump));
