// SPDX-License-Identifier: Apache-2.0
// Confronto entre dois runtimes do formato .bone.
//
// A suíte de conformidade compara cada runtime com o `esperado.json`. Isto
// compara os DOIS RUNTIMES ENTRE SI, campo por campo, sem passar pelo
// esperado. Dois runtimes podem passar na suíte e ainda assim discordar em
// canais que nenhum caso mede.
//
// Uso, da raiz do projeto:
//
//   node ferramentas/comparar-runtimes.mjs
//   node ferramentas/comparar-runtimes.mjs --json
//   node ferramentas/comparar-runtimes.mjs --a "node conformidade/adaptador-referencia.mjs" \
//                                          --b "python runtime-python/adaptador.py"
//
// Cada adaptador segue o contrato do Passo 2 do guia (§12.4): a pasta do caso
// vem como último argumento, a sonda vem em JSON pela entrada padrão, e o pose
// dump sai em JSON pela saída padrão.

import { spawn } from 'node:child_process';
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const CASOS_PADRAO = join(RAIZ, 'conformidade', 'casos');

// Tolerância da §12.4: 1e-4 absoluto para os campos numéricos do dump.
const TOLERANCIA = 1e-4;

const argv = process.argv.slice(2);
function opcao(nome, padrao) {
  const i = argv.indexOf(nome);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : padrao;
}
const SAIDA_JSON = argv.includes('--json');
const COMANDO_A = opcao('--a', 'node conformidade/adaptador-referencia.mjs');
const COMANDO_B = opcao('--b', 'python runtime-python/adaptador.py');
const NOME_A = opcao('--nome-a', 'TypeScript');
const NOME_B = opcao('--nome-b', 'Python');
// `--casos PASTA` confronta outra pasta — `conformidade/casos-pendentes`, por
// exemplo — como a mesma opção do executor. Padrão: `conformidade/casos`.
const CASOS = resolve(process.cwd(), opcao('--casos', CASOS_PADRAO));

// ---------------------------------------------------------------------------
// Rodar um adaptador
// ---------------------------------------------------------------------------

function rodar(comando, pasta, sonda) {
  return new Promise((pronto) => {
    const partes = comando.split(' ').filter(Boolean);
    const filho = spawn(partes[0], [...partes.slice(1), pasta], {
      cwd: RAIZ,
      shell: process.platform === 'win32',
    });
    let saida = '';
    let erro = '';
    filho.stdout.on('data', (d) => { saida += d; });
    filho.stderr.on('data', (d) => { erro += d; });
    filho.on('close', (codigo) => pronto({ codigo, saida, erro }));
    filho.stdin.write(JSON.stringify(sonda));
    filho.stdin.end();
  });
}

// ---------------------------------------------------------------------------
// Comparar dois dumps
// ---------------------------------------------------------------------------

function comparar(a, b, caminho, achados) {
  if (typeof a === 'number' && typeof b === 'number') {
    const d = Math.abs(a - b);
    if (d > TOLERANCIA) achados.push({ caminho, a, b, diferenca: d });
    return d;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) {
      achados.push({ caminho, a: `${a.length} itens`, b: `${b.length} itens`, diferenca: Infinity });
      return Infinity;
    }
    let maior = 0;
    for (let i = 0; i < a.length; i++) {
      maior = Math.max(maior, comparar(a[i], b[i], `${caminho}[${i}]`, achados));
    }
    return maior;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const chaves = new Set([...Object.keys(a), ...Object.keys(b)]);
    let maior = 0;
    for (const k of chaves) {
      if (!(k in a)) {
        achados.push({ caminho: `${caminho}.${k}`, a: '(ausente)', b: b[k], diferenca: Infinity });
        maior = Infinity;
        continue;
      }
      if (!(k in b)) {
        achados.push({ caminho: `${caminho}.${k}`, a: a[k], b: '(ausente)', diferenca: Infinity });
        maior = Infinity;
        continue;
      }
      maior = Math.max(maior, comparar(a[k], b[k], `${caminho}.${k}`, achados));
    }
    return maior;
  }
  if (JSON.stringify(a) !== JSON.stringify(b)) {
    achados.push({ caminho, a, b, diferenca: Infinity });
    return Infinity;
  }
  return 0;
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

const casos = readdirSync(CASOS, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)
  .sort();

const linhas = [];

for (const caso of casos) {
  const pasta = join(CASOS, caso);
  const arquivoEsperado = join(pasta, 'esperado.json');
  if (!existsSync(arquivoEsperado)) continue;
  const esperado = JSON.parse(readFileSync(arquivoEsperado, 'utf8'));
  const sonda = esperado.probe ?? esperado.sonda ?? {};

  const [ra, rb] = await Promise.all([
    rodar(COMANDO_A, pasta, sonda),
    rodar(COMANDO_B, pasta, sonda),
  ]);

  const recusaA = ra.codigo !== 0;
  const recusaB = rb.codigo !== 0;

  if (recusaA || recusaB) {
    linhas.push({
      caso,
      a: recusaA ? 'recusou' : 'aceitou',
      b: recusaB ? 'recusou' : 'aceitou',
      concordam: recusaA === recusaB,
      maiorDiferenca: recusaA === recusaB ? 0 : Infinity,
      achados: recusaA === recusaB ? [] : [{ caminho: '(arquivo)', a: recusaA ? 'recusou' : 'aceitou', b: recusaB ? 'recusou' : 'aceitou', diferenca: Infinity }],
    });
    continue;
  }

  let da; let db;
  try { da = JSON.parse(ra.saida); } catch { da = null; }
  try { db = JSON.parse(rb.saida); } catch { db = null; }
  if (!da || !db) {
    linhas.push({ caso, a: da ? 'dump' : 'saída inválida', b: db ? 'dump' : 'saída inválida', concordam: false, maiorDiferenca: Infinity, achados: [] });
    continue;
  }

  const achados = [];
  const maior = comparar(da, db, '', achados);
  linhas.push({
    caso,
    a: 'dump',
    b: 'dump',
    concordam: achados.length === 0,
    maiorDiferenca: maior,
    achados: achados.slice(0, 20),
  });
}

const divergem = linhas.filter((l) => !l.concordam);

if (SAIDA_JSON) {
  console.log(JSON.stringify({
    suite: 'bone-two-runtimes',
    runtimeA: NOME_A,
    runtimeB: NOME_B,
    tolerancia: TOLERANCIA,
    total: linhas.length,
    concordam: linhas.length - divergem.length,
    divergem: divergem.length,
    casos: linhas,
  }, null, 2));
} else {
  const larg = Math.max(4, ...linhas.map((l) => l.caso.length));
  console.log(`Confronto: ${NOME_A}  x  ${NOME_B}     tolerância ${TOLERANCIA}`);
  console.log('');
  console.log(`${'Caso'.padEnd(larg)}  ${NOME_A.padEnd(12)}  ${NOME_B.padEnd(12)}  Concordam  Maior diferença`);
  console.log(`${'-'.repeat(larg)}  ${'-'.repeat(12)}  ${'-'.repeat(12)}  ---------  ---------------`);
  for (const l of linhas) {
    const dif = l.maiorDiferenca === 0 ? 'nenhuma'
      : l.maiorDiferenca === Infinity ? 'incomparável'
        : l.maiorDiferenca.toExponential(1);
    console.log(`${l.caso.padEnd(larg)}  ${l.a.padEnd(12)}  ${l.b.padEnd(12)}  ${(l.concordam ? 'sim' : 'NÃO').padEnd(9)}  ${dif}`);
  }
  console.log('');
  console.log(`${linhas.length - divergem.length} de ${linhas.length} concordam campo a campo.`);
  for (const l of divergem) {
    console.log('');
    console.log(`Divergência em ${l.caso}:`);
    for (const a of l.achados) {
      console.log(`  ${a.caminho}: ${NOME_A}=${a.a}   ${NOME_B}=${a.b}`);
    }
  }
}

process.exit(divergem.length === 0 ? 0 : 1);
