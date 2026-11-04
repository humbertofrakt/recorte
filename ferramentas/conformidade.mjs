#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Executor da suíte de conformidade do formato .bone (§12.4).
//
//   node ferramentas/conformidade.mjs
//   node ferramentas/conformidade.mjs --nivel A
//   node ferramentas/conformidade.mjs --caso A-010-heranca-cinco-modos
//   node ferramentas/conformidade.mjs --json > relatorio.json
//   node ferramentas/conformidade.mjs --gerar --caso NOVO-CASO
//   node ferramentas/conformidade.mjs --adaptador "python meu_adaptador.py"
//
// Sem --adaptador, roda os casos contra o runtime de referência deste
// repositório. Com --adaptador, roda contra o runtime de outra pessoa: o
// comando recebe a pasta do caso como argumento e a sonda em JSON na entrada
// padrão, e devolve o pose dump em JSON na saída padrão.
//
// Sai com código diferente de zero se algum caso falhar.
//
// O runtime é TypeScript; este script compila `runtime/src` mais
// `ferramentas/src/conformidade` para `ferramentas/dist/conformidade` quando
// está faltando ou desatualizado, e importa de lá.

import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';
import zlib from 'node:zlib';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..');
const CASOS = join(RAIZ, 'conformidade', 'casos');
const TSCONFIG = join(AQUI, 'src', 'conformidade', 'tsconfig.json');
const DIST = join(AQUI, 'dist', 'conformidade');

const USO = `
Suíte de conformidade do formato .bone

  node ferramentas/conformidade.mjs [opções]

Opções
  --caso NOME        Roda só um caso (o nome da pasta). Pode repetir.
  --nivel A|B|C|X    Roda só os casos de um nível. Pode repetir.
  --json             Imprime o relatório em JSON, sem a tabela.
  --gerar            Regrava os esperado.json a partir do runtime atual.
  --adaptador CMD    Roda contra outro runtime, e não contra o de referência.
  --casos PASTA      Outra pasta de casos.
  --ajuda            Mostra esta ajuda.
`.trim();

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function lerArgumentos(argv) {
  const op = { casos: [], niveis: [], json: false, gerar: false, adaptador: null, pasta: CASOS, ajuda: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) throw new Error(`argumento solto: ${a}`);
    const [chave, junto] = a.slice(2).split('=');
    const valor = () => (junto !== undefined ? junto : argv[++i]);
    switch (chave) {
      case 'caso': op.casos.push(valor()); break;
      case 'nivel': op.niveis.push(String(valor()).toUpperCase()); break;
      case 'json': op.json = true; break;
      case 'gerar': op.gerar = true; break;
      case 'adaptador': op.adaptador = valor(); break;
      case 'casos': op.pasta = resolve(process.cwd(), valor()); break;
      case 'ajuda': case 'help': op.ajuda = true; break;
      default: throw new Error(`opção desconhecida: --${chave}`);
    }
  }
  return op;
}

// ---------------------------------------------------------------------------
// Compilação do runtime de referência
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
  const alvo = join(DIST, 'ferramentas', 'src', 'conformidade', 'pose-dump.js');
  const fonte = Math.max(maisRecente(join(RAIZ, 'runtime', 'src')), maisRecente(join(AQUI, 'src', 'conformidade')));
  if (existsSync(alvo) && statSync(alvo).mtimeMs >= fonte) return;
  const tsc = join(RAIZ, 'node_modules', 'typescript', 'bin', 'tsc');
  if (!existsSync(tsc)) throw new Error('typescript não encontrado em node_modules');
  process.stderr.write('compilando runtime -> ferramentas/dist/conformidade ...\n');
  execFileSync(process.execPath, [tsc, '-p', TSCONFIG], { stdio: 'inherit' });
}

async function carregarRuntime() {
  garantirDist();
  const base = join(DIST, 'ferramentas', 'src', 'conformidade', 'pose-dump.js');
  const rt = join(DIST, 'runtime', 'src', 'index.js');
  return {
    dump: await import(pathToFileURL(base).href),
    core: await import(pathToFileURL(rt).href),
  };
}

// ---------------------------------------------------------------------------
// Casos
// ---------------------------------------------------------------------------

/** Nível do caso a partir do prefixo da pasta (§12.4). */
export function nivelDoCaso(nome) {
  const m = /^([A-Z]+)-/.exec(nome);
  return m === null ? '?' : m[1];
}

function listarCasos(pasta) {
  if (!existsSync(pasta)) return [];
  return readdirSync(pasta, { withFileTypes: true })
    .filter((e) => e.isDirectory() && existsSync(join(pasta, e.name, 'esperado.json')))
    .map((e) => e.name)
    .sort();
}

/** Lê um caso: entrada, sonda e pose dump esperado. */
function lerCaso(pasta, nome) {
  const dir = join(pasta, nome);
  const esperado = JSON.parse(readFileSync(join(dir, 'esperado.json'), 'utf8'));
  // A sonda mora em `probe.json` (§12.4) ou dentro do próprio esperado.json.
  const sondaPropria = join(dir, 'probe.json');
  const sonda = existsSync(sondaPropria)
    ? JSON.parse(readFileSync(sondaPropria, 'utf8'))
    : esperado.probe;
  if (sonda === undefined) throw new Error(`caso "${nome}" sem sonda: falta probe.json ou a chave "probe" em esperado.json`);
  // As três embalagens da §2.9. Um caso BIN traz `entrada.boneb` e um caso ZIP
  // traz `entrada.bonez`; o resto da suíte não muda de linha, porque
  // `loadSkeletonFile` descobre a embalagem pelos primeiros bytes.
  const nomes = ['entrada.bone', 'entrada.boneb', 'entrada.bonez'];
  const entrada = nomes.map((n) => join(dir, n)).find((c) => existsSync(c));
  if (entrada === undefined) {
    throw new Error(`caso "${nome}" sem entrada: falta ${nomes.join(', ')}`);
  }
  return { nome, dir, nivel: nivelDoCaso(nome), sonda, esperado, entrada };
}

/** Carrega o esqueleto do caso, com os atlas que o arquivo pedir. */
function carregarEsqueleto(core, caso) {
  const bytes = readFileSync(caso.entrada);
  const atlases = [];
  // Só o `.bone` de texto tem atlas soltos ao lado. O `.boneb` não é JSON, e
  // o `.bonez` já traz os atlas dentro do pacote.
  if (caso.entrada.endsWith('.bone')) {
    const doc = JSON.parse(readFileSync(caso.entrada, 'utf8'));
    for (const uri of doc.assets?.atlases ?? []) {
      const caminho = resolve(caso.dir, uri);
      if (!existsSync(caminho)) continue;
      atlases.push(core.loadAtlas(core.parseBoneText(readFileSync(caminho, 'utf8'))));
    }
  }
  const arquivo = core.loadSkeletonFile(new Uint8Array(bytes), {
    atlases,
    codec: { inflateRaw: (d) => zlib.inflateRawSync(d) },
    // §2.8: o "resolver" de um .bone solto. Um caso pode trazer arquivos ao
    // lado da entrada — o esqueleto aninhado (7.11), as animações e peles de
    // fora (2.8), os corpos da virada (9.13) —, e eles só são lidos de dentro
    // da pasta do caso.
    files: (caminho) => {
      const alvo = resolve(caso.dir, caminho);
      if (!alvo.startsWith(resolve(caso.dir))) return null;
      return existsSync(alvo) ? new Uint8Array(readFileSync(alvo)) : null;
    },
  });
  return { data: arquivo.data, bodies: arquivo.bodies };
}

// ---------------------------------------------------------------------------
// Execução de um caso
// ---------------------------------------------------------------------------

function rodarAdaptador(comando, caso) {
  // O comando vai inteiro para o shell, com a pasta do caso no fim. Assim um
  // caminho com espaço (`"C:\Program Files\..."`) continua entre aspas, o que
  // não acontece se a linha for quebrada em pedaços antes.
  const linha = `${comando} "${caso.dir}"`;
  const r = spawnSync(linha, {
    input: JSON.stringify(caso.sonda),
    encoding: 'utf8',
    shell: true,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) throw new Error(`adaptador não rodou: ${r.error.message}`);
  if (r.status !== 0) throw new Error(`adaptador saiu com código ${r.status}: ${(r.stderr || '').trim().slice(0, 400)}`);
  try {
    return JSON.parse(r.stdout);
  } catch {
    throw new Error(`o adaptador não devolveu JSON: ${String(r.stdout).trim().slice(0, 200)}`);
  }
}

function tolerancias(mod, caso) {
  const base = caso.sonda.physicsDt > 0 ? mod.PHYSICS_TOLERANCES : mod.TOLERANCES;
  return caso.sonda.tolerances ? { ...base, ...caso.sonda.tolerances } : base;
}

async function rodarCaso(rt, op, caso) {
  const inicio = Date.now();
  // Um caso pode exigir que o arquivo seja RECUSADO. É o que 2.7 manda fazer
  // com `extensionsRequired` que o leitor não conhece, e sem isto não havia
  // como escrever esse caso: a suíte só sabia comparar poses.
  const recusaEsperada = caso.esperado.recusa;
  let obtido;
  try {
    if (op.adaptador !== null) {
      obtido = rodarAdaptador(op.adaptador, caso);
    } else {
      const { data, bodies } = carregarEsqueleto(rt.core, caso);
      obtido = rt.dump.buildPoseDump(data, caso.sonda, bodies);
    }
  } catch (erro) {
    if (recusaEsperada !== undefined) {
      const trecho = recusaEsperada.contem;
      const bate = trecho === undefined || String(erro.message).includes(trecho);
      return {
        caso: caso.nome, nivel: caso.nivel, passou: bate,
        erro: bate ? null : `recusou, mas a mensagem não traz "${trecho}": ${erro.message}`,
        diferencas: [], maiorDiferenca: bate ? 0 : null, ms: Date.now() - inicio,
      };
    }
    return {
      caso: caso.nome, nivel: caso.nivel, passou: false, erro: erro.message,
      diferencas: [], maiorDiferenca: null, ms: Date.now() - inicio,
    };
  }

  if (recusaEsperada !== undefined) {
    return {
      caso: caso.nome, nivel: caso.nivel, passou: false,
      erro: 'o arquivo devia ter sido recusado, e carregou',
      diferencas: [], maiorDiferenca: null, ms: Date.now() - inicio,
    };
  }

  const r = rt.dump.comparePoseDump(caso.esperado, obtido, tolerancias(rt.dump, caso));
  return {
    caso: caso.nome, nivel: caso.nivel, passou: r.ok, erro: null,
    diferencas: r.differences.slice(0, 8).map((d) => ({
      onde: d.pointer,
      esperado: d.expected,
      obtido: d.actual,
      diferenca: Number.isFinite(d.delta) ? Number(d.delta.toPrecision(4)) : null,
      tolerancia: d.tolerance,
    })),
    maiorDiferenca: r.differences.length === 0 && r.worstDelta === 0 ? 0 : Number(r.worstDelta.toPrecision(4)),
    ms: Date.now() - inicio,
  };
}

async function gerarCaso(rt, caso) {
  // Caso de recusa não tem pose para gerar: o esperado dele é escrito à mão e
  // regravá-lo apagaria a única coisa que ele diz.
  if (caso.esperado.recusa !== undefined) return;
  const { data, bodies } = carregarEsqueleto(rt.core, caso);
  const dump = rt.dump.buildPoseDump(data, caso.sonda, bodies);
  const saida = { probe: caso.sonda, version: dump.version, samples: dump.samples };
  writeFileSync(join(caso.dir, 'esperado.json'), rt.dump.formatPoseDump(saida), 'utf8');
}

/**
 * Nível alcançado, pela regra 5 da §12.4 — o campo que o §12.4 passo 3 pede no
 * relatório e que faltava: quem consumisse o JSON tinha que recalcular a regra
 * por fora.
 *
 * A: 100% de A e X.  B: mais 100% de B.  C: mais 100% de C, e todos os casos
 * BIN e ZIP. Casos X são obrigatórios em TODO nível: compatibilidade não é
 * opcional.
 *
 * `missingCategories` lista as categorias obrigatórias que não têm caso
 * nenhum. Sem isso, um conjunto vazio é satisfeito por qualquer runtime e o
 * número parece melhor do que é.
 */
export function nivelAlcancado(porNivel) {
  const cheio = (n) => {
    const v = porNivel[n];
    return v !== undefined && v.total > 0 && v.passaram === v.total;
  };
  const vazio = (n) => porNivel[n] === undefined || porNivel[n].total === 0;

  const missingCategories = ['A', 'B', 'C', 'X', 'BIN', 'ZIP'].filter(vazio);

  if (!cheio('X')) return { level: null, missingCategories };
  if (!cheio('A')) return { level: null, missingCategories };
  if (!cheio('B')) return { level: 'A', missingCategories };
  // O nível C exige também as embalagens. Uma categoria vazia NÃO conta como
  // aprovada: um conjunto vazio qualquer runtime satisfaz.
  const embalagens = cheio('BIN') && cheio('ZIP');
  if (!cheio('C') || !embalagens) return { level: 'B', missingCategories };
  return { level: 'C', missingCategories };
}

// ---------------------------------------------------------------------------
// Tabela
// ---------------------------------------------------------------------------

function tabela(linhas) {
  const cab = ['Caso', 'Nível', 'Resultado', 'Maior diferença'];
  const corpo = linhas.map((r) => [
    r.caso,
    r.nivel,
    r.erro !== null ? 'ERRO' : r.passou ? 'passou' : 'FALHOU',
    r.erro !== null ? '—' : r.maiorDiferenca === 0 ? 'nenhuma' : String(r.maiorDiferenca),
  ]);
  const larguras = cab.map((c, i) => Math.max(c.length, ...corpo.map((l) => l[i].length)));
  const linha = (celulas) => celulas.map((c, i) => c.padEnd(larguras[i])).join('  ').trimEnd();
  const regua = larguras.map((w) => '-'.repeat(w)).join('  ');
  return [linha(cab), regua, ...corpo.map(linha)].join('\n');
}

function detalhes(linhas) {
  const partes = [];
  for (const r of linhas) {
    if (r.passou) continue;
    partes.push(`\n${r.caso}`);
    if (r.erro !== null) {
      partes.push(`  erro: ${r.erro}`);
      continue;
    }
    for (const d of r.diferencas) {
      const esperado = JSON.stringify(d.esperado);
      const obtido = JSON.stringify(d.obtido);
      const dist = d.diferenca === null ? 'não bate' : `diferença ${d.diferenca} (tolerância ${d.tolerancia})`;
      partes.push(`  ${d.onde}`);
      partes.push(`    esperado ${esperado}   obtido ${obtido}   ${dist}`);
    }
  }
  return partes.join('\n');
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

export async function principal(argv) {
  const op = lerArgumentos(argv);
  if (op.ajuda) {
    process.stdout.write(USO + '\n');
    return 0;
  }

  let nomes = listarCasos(op.pasta);
  if (op.casos.length > 0) {
    const pedidos = new Set(op.casos);
    const faltando = op.casos.filter((n) => !nomes.includes(n));
    if (faltando.length > 0) throw new Error(`caso não encontrado: ${faltando.join(', ')}`);
    nomes = nomes.filter((n) => pedidos.has(n));
  }
  if (op.niveis.length > 0) {
    const pedidos = new Set(op.niveis);
    nomes = nomes.filter((n) => pedidos.has(nivelDoCaso(n)));
  }
  if (nomes.length === 0) throw new Error(`nenhum caso em ${op.pasta}`);

  const rt = await carregarRuntime();
  const casos = nomes.map((n) => lerCaso(op.pasta, n));

  if (op.gerar) {
    if (op.adaptador !== null) throw new Error('--gerar não funciona com --adaptador: o esperado sai do runtime de referência');
    // Trava de segurança: quase todo esperado.json da suíte foi calculado à
    // mão a partir da spec, e a conta está no leiame.md do caso. Regravar tudo
    // de uma vez apagaria isso e deixaria a suíte provando só que o runtime
    // concorda consigo mesmo. Regravar exige dizer qual caso.
    if (op.casos.length === 0 && op.pasta === CASOS) {
      throw new Error(
        '--gerar sem --caso regravaria a suíte inteira e apagaria as contas feitas à mão.\n'
        + '  Use --caso NOME para o caso novo, ou --casos PASTA para uma cópia.',
      );
    }
    for (const caso of casos) await gerarCaso(rt, caso);
    process.stderr.write(`regravados ${casos.length} esperado.json\n`);
    // Recarrega e confere: o esperado novo tem que passar.
    for (const caso of casos) Object.assign(caso, lerCaso(op.pasta, caso.nome));
  }

  const linhas = [];
  for (const caso of casos) linhas.push(await rodarCaso(rt, op, caso));

  const falhas = linhas.filter((r) => !r.passou);
  const porNivel = {};
  for (const r of linhas) {
    const n = (porNivel[r.nivel] ??= { total: 0, passaram: 0 });
    n.total++;
    if (r.passou) n.passaram++;
  }

  if (op.json) {
    const { level, missingCategories } = nivelAlcancado(porNivel);
    const relatorio = {
      suite: 'bone-conformance',
      formatVersion: '1.0',
      runtime: op.adaptador === null ? 'referência (Recorte)' : op.adaptador,
      date: new Date().toISOString(),
      total: linhas.length,
      passed: linhas.length - falhas.length,
      failed: falhas.length,
      level,
      missingCategories,
      byLevel: porNivel,
      cases: linhas,
    };
    process.stdout.write(JSON.stringify(relatorio, null, 2) + '\n');
  } else {
    process.stdout.write(tabela(linhas) + '\n');
    if (falhas.length > 0) process.stdout.write(detalhes(linhas) + '\n');
    const resumo = Object.entries(porNivel)
      .map(([n, v]) => `${n}: ${v.passaram}/${v.total}`)
      .join('   ');
    process.stdout.write(`\n${linhas.length - falhas.length} de ${linhas.length} passaram.   ${resumo}\n`);
  }

  return falhas.length === 0 ? 0 : 1;
}

const rodandoDireto = process.argv[1] !== undefined
  && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;

if (rodandoDireto) {
  principal(process.argv.slice(2))
    .then((codigo) => process.exit(codigo))
    .catch((erro) => {
      process.stderr.write(`erro: ${erro.message}\n`);
      process.exit(2);
    });
}
