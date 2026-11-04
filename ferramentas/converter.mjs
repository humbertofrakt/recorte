#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Converte entre .bone (JSON), .boneb (binário) e .bonez (pacote ZIP).
//
//   node ferramentas/converter.mjs heroi.bone heroi.boneb
//   node ferramentas/converter.mjs heroi.boneb heroi.bone
//   node ferramentas/converter.mjs heroi.bone heroi.bonez --validar
//
// A conversão é pela extensão dos dois arquivos. Com --validar o programa
// relê a saída, compara com a entrada e roda o validador de esquema.
//
// Sem dependências: usa só os módulos embutidos do Node. As bibliotecas são
// TypeScript e o Node as carrega direto (remoção de tipos, Node 22.18+).

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, resolve, join, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import zlib from 'node:zlib';

import { writeBonebWithReport } from './src/binario/escrever.ts';
import { readBonebWithReport } from './src/binario/ler.ts';
import { writeBonez, readBonez } from './src/binario/bonez.ts';

const AQUI = dirname(fileURLToPath(import.meta.url));
const VALIDADOR = join(AQUI, 'validador', 'validar.mjs');

/** zlib do Node injetado nas funções de .bonez (elas nunca importam Node). */
const COMPRESSAO = {
  deflateRaw: (dados) => new Uint8Array(zlib.deflateRawSync(dados, { level: 9 })),
  inflateRaw: (dados) => new Uint8Array(zlib.inflateRawSync(dados)),
};

// ---------------------------------------------------------------------------
// Texto para o usuário
// ---------------------------------------------------------------------------

const AJUDA = `
Converter arquivos do formato bone

  node ferramentas/converter.mjs  entrada  saida  [--validar]

Formatos, pela extensão:

  .bone     JSON, legível, para ler e editar
  .boneb    binário, compacto, para o jogo carregar
  .bonez    pacote ZIP com o esqueleto, o atlas e as imagens

Opções:

  --validar   relê a saída, compara com a entrada e roda o validador
  --ajuda     mostra este texto
`;

function numero(valor) {
  return String(valor).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function porcentagem(valor) {
  return `${valor.toFixed(1).replace('.', ',')}%`;
}

/** Uma linha de tabela: rótulo, nome do arquivo, valor alinhado à direita. */
function linha(rotulo, nome, valor) {
  return `  ${rotulo.padEnd(10)}${nome.padEnd(28)}${valor.padStart(16)}`;
}

function erro(mensagem) {
  console.error(`\nErro: ${mensagem}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Comparação profunda com tolerância de float 32
// ---------------------------------------------------------------------------

// Um float de 32 bits guarda cerca de 7 casas significativas. O erro relativo
// máximo de arredondamento é 2^-24, ou 6e-8. A tolerância aqui é 1e-6, umas
// vinte vezes maior, e o piso absoluto de 1e-6 cobre os valores perto de zero.
const TOLERANCIA_RELATIVA = 1e-6;
const TOLERANCIA_ABSOLUTA = 1e-6;

function diferenca(a, b, caminho = '') {
  if (a === b) return null;
  if (typeof a === 'number' && typeof b === 'number') {
    const limite = Math.max(TOLERANCIA_ABSOLUTA, Math.abs(a) * TOLERANCIA_RELATIVA);
    return Math.abs(a - b) <= limite ? null : `${caminho || '/'}: ${a} virou ${b}`;
  }
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return `${caminho || '/'}: ${JSON.stringify(a)} virou ${JSON.stringify(b)}`;
  }
  if (Array.isArray(a) !== Array.isArray(b)) return `${caminho || '/'}: um é lista e o outro não`;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return `${caminho || '/'}: lista de ${a.length} virou ${b.length}`;
    for (let i = 0; i < a.length; i++) {
      const d = diferenca(a[i], b[i], `${caminho}/${i}`);
      if (d) return d;
    }
    return null;
  }
  const chavesA = Object.keys(a);
  const chavesB = Object.keys(b);
  if (chavesA.length !== chavesB.length) {
    const faltando = chavesA.filter((k) => !chavesB.includes(k));
    const sobrando = chavesB.filter((k) => !chavesA.includes(k));
    return `${caminho || '/'}: faltou [${faltando}] e sobrou [${sobrando}]`;
  }
  for (const chave of chavesA) {
    if (!(chave in b)) return `${caminho}/${chave}: sumiu`;
    const d = diferenca(a[chave], b[chave], `${caminho}/${chave}`);
    if (d) return d;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Números legíveis ao voltar do binário
// ---------------------------------------------------------------------------

// Um float de 32 bits vira `0.6000000238418579` em JSON. Aqui procuramos a
// escrita mais curta que volta para o MESMO float de 32 bits, então `0.6`
// vira `0.6` de novo. Sem perda: o valor binário é idêntico (3.6).
function encurtar(valor) {
  if (!Number.isFinite(valor) || Number.isInteger(valor)) return valor;
  const alvo = Math.fround(valor);
  if (alvo !== valor) return valor;
  for (let casas = 1; casas <= 9; casas++) {
    const curto = Number(valor.toPrecision(casas));
    if (Math.fround(curto) === alvo) return curto;
  }
  return valor;
}

function encurtarTudo(valor) {
  if (typeof valor === 'number') return encurtar(valor);
  if (Array.isArray(valor)) return valor.map(encurtarTudo);
  if (valor && typeof valor === 'object') {
    const saida = {};
    for (const [chave, item] of Object.entries(valor)) saida[chave] = encurtarTudo(item);
    return saida;
  }
  return valor;
}

// ---------------------------------------------------------------------------
// Leitura e escrita por extensão
// ---------------------------------------------------------------------------

function formato(caminho) {
  const ext = extname(caminho).toLowerCase();
  if (ext === '.bone' || ext === '.boneb' || ext === '.bonez') return ext.slice(1);
  return null;
}

/** Devolve { doc, forma, avisos, principal } lendo qualquer um dos três. */
function ler(caminho) {
  const bytes = new Uint8Array(readFileSync(caminho));
  const forma = formato(caminho);
  if (forma === 'bone') {
    return { doc: JSON.parse(new TextDecoder().decode(bytes)), forma: 'bone', avisos: [], principal: basename(caminho) };
  }
  if (forma === 'boneb') {
    const lido = readBonebWithReport(bytes);
    return { doc: lido.value, forma: 'boneb', avisos: lido.warnings, principal: basename(caminho) };
  }
  if (forma === 'bonez') {
    const pacote = readBonez(bytes, COMPRESSAO);
    const principais = pacote.readMain();
    const interna = formato(pacote.mainName) ?? 'bone';
    if (interna === 'boneb') {
      const lido = readBonebWithReport(principais);
      return { doc: lido.value, forma: 'boneb', avisos: [...pacote.warnings, ...lido.warnings], principal: pacote.mainName };
    }
    return {
      doc: JSON.parse(new TextDecoder().decode(principais)),
      forma: 'bone',
      avisos: pacote.warnings,
      principal: pacote.mainName,
    };
  }
  erro(`Não conheço a extensão de "${caminho}". Use .bone, .boneb ou .bonez.`);
}

/**
 * Todos os `uri` de esqueleto aninhado (7.11) que este documento cita, na
 * ordem em que aparecem. Um attachment de tipo "skeleton" traz outro `.bone`
 * junto; sem ele, o pacote abre sem a espada na mão do personagem.
 */
function esqueletosAninhados(doc) {
  const uris = [];
  for (const pele of doc?.skins ?? []) {
    for (const porSlot of Object.values(pele?.attachments ?? {})) {
      for (const anexo of Object.values(porSlot ?? {})) {
        if (anexo?.type !== 'skeleton') continue;
        const uri = anexo.uri;
        if (typeof uri !== 'string' || uri === '' || uris.includes(uri)) continue;
        uris.push(uri);
      }
    }
  }
  return uris;
}

/**
 * Procura o atlas, as imagens e os esqueletos aninhados que o esqueleto cita,
 * ao lado do arquivo de entrada. O que não existir no disco fica de fora:
 * arquivo faltando nunca é erro fatal (2.8).
 *
 * `jaVistos` guarda os nomes já postos no pacote, para um esqueleto que cita
 * a si mesmo (direta ou indiretamente) não virar uma volta sem fim.
 */
function juntarRecursos(doc, pastaEntrada, jaVistos = new Set()) {
  const arquivos = [];
  const atlases = [];
  const imagens = [];
  const esqueletos = [];
  const bases = doc?.assets ?? {};
  for (const uri of bases.atlases ?? []) {
    const caminho = resolve(pastaEntrada, uri);
    if (!existsSync(caminho)) continue;
    const bytes = new Uint8Array(readFileSync(caminho));
    arquivos.push({ name: uri, data: bytes });
    atlases.push(uri);
    let atlas = null;
    try {
      atlas = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      continue;
    }
    const pastaAtlas = dirname(uri) === '.' ? '' : `${dirname(uri)}/`;
    for (const pagina of atlas?.pages ?? []) {
      const nome = pagina?.image;
      if (typeof nome !== 'string' || nome.startsWith('data:')) continue;
      const uriImagem = `${pastaAtlas}${nome}`;
      const caminhoImagem = resolve(pastaEntrada, uriImagem);
      if (!existsSync(caminhoImagem)) continue;
      if (arquivos.some((a) => a.name === uriImagem)) continue;
      arquivos.push({ name: uriImagem, data: new Uint8Array(readFileSync(caminhoImagem)), compress: false });
      imagens.push(uriImagem);
    }
  }

  // Os esqueletos aninhados (7.11), e o que cada um deles cita por sua vez.
  const pastaEsqueletos = typeof bases.skeletonsBase === 'string' ? bases.skeletonsBase : '';
  for (const uri of esqueletosAninhados(doc)) {
    const nome = `${pastaEsqueletos}${uri}`;
    if (jaVistos.has(nome)) continue;
    const caminho = resolve(pastaEntrada, nome);
    if (!existsSync(caminho)) continue;
    jaVistos.add(nome);
    const bytes = new Uint8Array(readFileSync(caminho));
    arquivos.push({ name: nome, data: bytes });
    esqueletos.push(nome);

    let filho = null;
    try {
      filho = JSON.parse(new TextDecoder().decode(bytes));
    } catch {
      continue; // Um `.boneb` aninhado entra como bytes, sem olhar dentro.
    }
    const dentro = juntarRecursos(filho, dirname(caminho), jaVistos);
    for (const arquivo of dentro.arquivos) {
      if (arquivos.some((a) => a.name === arquivo.name)) continue;
      arquivos.push(arquivo);
    }
    for (const nomeAtlas of dentro.atlases) if (!atlases.includes(nomeAtlas)) atlases.push(nomeAtlas);
    for (const nomeImagem of dentro.imagens) if (!imagens.includes(nomeImagem)) imagens.push(nomeImagem);
    for (const nomeFilho of dentro.esqueletos) if (!esqueletos.includes(nomeFilho)) esqueletos.push(nomeFilho);
  }

  return { arquivos, atlases, imagens, esqueletos };
}

function escrever(caminho, doc, forma, pastaEntrada, nomePrincipal) {
  const alvo = formato(caminho);
  if (alvo === 'bone') {
    const arvore = forma === 'boneb' ? encurtarTudo(doc) : doc;
    const texto = `${JSON.stringify(arvore, null, 2)}\n`;
    const bytes = new TextEncoder().encode(texto);
    writeFileSync(caminho, bytes);
    return { bytes, avisos: [] };
  }
  if (alvo === 'boneb') {
    const escrito = writeBonebWithReport(doc);
    writeFileSync(caminho, escrito.bytes);
    return { bytes: escrito.bytes, avisos: escrito.warnings };
  }
  if (alvo === 'bonez') {
    const base = basename(caminho, '.bonez');
    const interno = forma === 'boneb' ? `${base}.boneb` : `${base}.bone`;
    const principal = nomePrincipal && formato(nomePrincipal) ? nomePrincipal : interno;
    const avisos = [];
    let dados;
    if (formato(principal) === 'boneb') {
      const escrito = writeBonebWithReport(doc);
      dados = escrito.bytes;
      avisos.push(...escrito.warnings);
    } else {
      dados = new TextEncoder().encode(`${JSON.stringify(doc, null, 2)}\n`);
    }
    const extras = juntarRecursos(doc, pastaEntrada);
    const manifesto = {
      bonez: { version: '1.0' },
      main: principal,
      skeletons: [principal, ...extras.esqueletos],
    };
    if (extras.atlases.length) manifesto.atlases = extras.atlases;
    if (extras.imagens.length) manifesto.images = extras.imagens;
    const bytes = writeBonez(
      { manifest: manifesto, files: [{ name: principal, data: dados }, ...extras.arquivos] },
      COMPRESSAO,
    );
    writeFileSync(caminho, bytes);
    return { bytes, avisos };
  }
  erro(`Não conheço a extensão de "${caminho}". Use .bone, .boneb ou .bonez.`);
}

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

function rodarValidador(doc) {
  if (!existsSync(VALIDADOR)) return 'Validador não encontrado; pulei essa parte.';
  const pasta = mkdtempSync(join(tmpdir(), 'bone-'));
  const arquivo = join(pasta, 'conferir.bone');
  try {
    writeFileSync(arquivo, `${JSON.stringify(doc, null, 2)}\n`);
    const saida = execFileSync(process.execPath, [VALIDADOR, arquivo], { encoding: 'utf8' });
    return saida.trim();
  } catch (e) {
    return (e.stdout ?? e.message ?? String(e)).toString().trim();
  } finally {
    rmSync(pasta, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Programa
// ---------------------------------------------------------------------------

function principal(argv) {
  const opcoes = argv.filter((a) => a.startsWith('--'));
  const caminhos = argv.filter((a) => !a.startsWith('--'));
  if (opcoes.includes('--ajuda') || opcoes.includes('--help') || caminhos.length === 0) {
    console.log(AJUDA);
    return;
  }
  if (caminhos.length !== 2) {
    erro('Preciso de dois caminhos: entrada e saída.');
  }
  const [entrada, saida] = caminhos.map((c) => resolve(process.cwd(), c));
  if (!existsSync(entrada)) erro(`Não achei "${entrada}".`);
  if (resolve(entrada) === resolve(saida)) erro('A saída não pode ser o mesmo arquivo da entrada.');

  const lido = ler(entrada);
  const escrito = escrever(saida, lido.doc, lido.forma, dirname(entrada), lido.principal);
  const tamanhoEntrada = readFileSync(entrada).length;
  const tamanhoSaida = escrito.bytes.length;

  console.log('');
  console.log(linha('Entrada', basename(entrada), `${numero(tamanhoEntrada)} bytes`));
  console.log(linha('Saida', basename(saida), `${numero(tamanhoSaida)} bytes`));
  if (tamanhoEntrada > 0) {
    const reducao = ((tamanhoEntrada - tamanhoSaida) / tamanhoEntrada) * 100;
    const rotulo = reducao >= 0 ? 'Reducao' : 'Aumento';
    console.log(linha(rotulo, '', porcentagem(Math.abs(reducao))));
  }
  console.log('');

  for (const aviso of [...lido.avisos, ...escrito.avisos]) console.log(`  Aviso: ${aviso}`);

  if (opcoes.includes('--validar')) {
    const volta = ler(saida);
    const d = diferenca(lido.doc, volta.doc);
    console.log(d ? `  Ida e volta: MUDOU -> ${d}` : '  Ida e volta: igual');
    const relatorio = rodarValidador(volta.doc);
    for (const l of relatorio.split('\n')) console.log(`  ${l}`);
    console.log('');
    if (d) process.exit(1);
  }
}

principal(process.argv.slice(2));
