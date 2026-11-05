#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Validador do formato Recorte, contra formato/bone.schema.json (rascunho 0.2).
//
// Sabe validar três tipos de documento, escolhidos pelo nome (ou por opção),
// e o pacote que os junta:
//   esqueleto   .bone / .json        raiz do schema (seções 2 a 9)
//   atlas       .atlas.json          definitions/atlas (seção 10)
//   manifesto   manifest.json        definitions/manifest (seção 2.9)
//   pacote      .bonez               o manifesto, o principal, todo esqueleto
//                                    listado e todo atlas listado (2.9)
//
// As regras que o schema não expressa (referências por nome, a exceção do
// rig e a do corpo citado por `body`, os avisos L2) moram em
// site/validador/nucleo.js e são IMPORTADAS daqui: um lugar só, para a página
// e a linha de comando nunca divergirem.
//
// Uso: node ferramentas/validador/validar.mjs arquivo1.bone [arquivo2 ...]
//      node ferramentas/validador/validar.mjs heroi.bonez
//      node ferramentas/validador/validar.mjs saida.atlas.json
//      node ferramentas/validador/validar.mjs --atlas qualquer-nome.json
//      node ferramentas/validador/validar.mjs --todos   (valida formato/exemplos/*)
//      node ferramentas/validador/validar.mjs --json arquivo.bone   (relatório para máquina)
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname, join, basename, posix } from 'node:path'
import { fileURLToPath } from 'node:url'
import zlib from 'node:zlib'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import {
  checarSemantica, checarAtlas, checarManifesto, avisos as avisosGerais,
  corposCitados, externosCitados, detectarEmbalagem,
} from '../../site/validador/nucleo.js'
import { readBonez } from '../visualizador/dist/binario/bonez.js'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')
const caminhoSchema = join(raiz, 'formato', 'bone.schema.json')

const pastaExtensoes = join(raiz, 'formato', 'extensions')

/**
 * Os nomes de extensão que o `REGISTRY.md` registra — o registro que a §2.7
 * aponta. A tabela "Prefixos em uso" é a fonte: primeira célula da linha, o
 * nome entre crases. Nome fora dela é válido e sai como L2 `EXT_UNREGISTERED`.
 *
 * Ler o Markdown parece frágil, e a alternativa é pior: uma lista de nomes
 * dentro do código divergiria do registro no primeiro dia, e o registro é o
 * documento que a spec cita.
 */
function carregarRegistrados() {
  const nomes = new Set()
  let texto
  try { texto = readFileSync(join(pastaExtensoes, 'REGISTRY.md'), 'utf8') }
  catch { return nomes }
  for (const linha of texto.split(/\r?\n/)) {
    const m = /^\|\s*`([A-Z][A-Z0-9]{1,7}_[a-z0-9_]+)`\s*\|/.exec(linha)
    if (m) nomes.add(m[1])
  }
  return nomes
}

/**
 * O registro de extensões: nome da extensão → o schema que ela publica.
 *
 * A §12.7 manda "extensões registradas trazem o seu schema e o validador o
 * aplica pelo nome", e ninguém aplicava: o `definitions/extensions` do
 * `bone.schema.json` confere o NOME da chave e que o valor é objeto, e para
 * aí. A convenção de arquivo está escrita em `formato/extensions/REGISTRY.md`:
 * `<NOME_DA_EXTENSAO>.schema.json`, ao lado do `<NOME_DA_EXTENSAO>.md`.
 *
 * O schema diz de si mesmo o que descreve, em `x-attachment-types`: assim um
 * arquivo novo na pasta entra no registro sem uma linha de código aqui.
 */
function carregarExtensoes(ajv) {
  const registro = {}
  let arquivos = []
  try { arquivos = readdirSync(pastaExtensoes).filter(f => f.endsWith('.schema.json')) }
  catch { return registro }
  for (const arquivo of arquivos.sort()) {
    const nome = basename(arquivo, '.schema.json')
    let esquema
    try { esquema = JSON.parse(readFileSync(join(pastaExtensoes, arquivo), 'utf8')) }
    catch (e) {
      console.error(`aviso: ${arquivo} não é JSON válido e ficou de fora do registro (${e.message})`)
      continue
    }
    try {
      registro[esquema['x-extension'] ?? nome] = {
        validar: ajv.compile(esquema),
        tiposDeAnexo: esquema['x-attachment-types'] ?? [],
        tiposDeTimeline: esquema['x-timeline-types'] ?? [],
      }
    } catch (e) {
      console.error(`aviso: ${arquivo} não compila e ficou de fora do registro (${e.message})`)
    }
  }
  return registro
}

function carregarSchema() {
  const schema = JSON.parse(readFileSync(caminhoSchema, 'utf8'))
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
  addFormats(ajv)
  // Um compilado por tipo de arquivo. O `$ref` para dentro do próprio schema
  // aproveita todas as `definitions` sem copiar nada.
  const id = schema.$id ?? 'bone.schema.json'
  ajv.addSchema(schema, id)
  const porRef = (ref) => ajv.compile({ $ref: `${id}${ref}` })
  return {
    ajv,
    schema,
    esqueleto: porRef('#'),
    atlas: porRef('#/definitions/atlas'),
    manifesto: porRef('#/definitions/manifest'),
    extensoes: carregarExtensoes(ajv),
    extensoesRegistradas: carregarRegistrados(),
  }
}

/** Que tipo de documento é, pelo nome. */
function tipoPeloNome(caminho) {
  const nome = basename(caminho).toLowerCase()
  if (nome.endsWith('.atlas.json')) return 'atlas'
  if (nome === 'manifest.json') return 'manifesto'
  if (nome.endsWith('.bonez')) return 'pacote'
  return 'esqueleto'
}

const ROTULO = { esqueleto: 'esqueleto', atlas: 'atlas', manifesto: 'manifesto', pacote: 'pacote' }

/** Junção `base + nome` da §2.8. */
function juntar(base, nome) {
  if (!base) return nome
  return base.endsWith('/') ? base + nome : `${base}/${nome}`
}

/**
 * Os corpos que as chaves `body` de um esqueleto citam (9.13), lidos por
 * `ler(uriResolvida)`, que devolve o texto ou `null`. É a exceção da 4.7: um
 * nome que não está no arquivo mas está num corpo citado não é erro.
 */
function carregarCorpos(doc, ler) {
  const corpos = new Map()
  const base = typeof doc.assets?.skeletonsBase === 'string' ? doc.assets.skeletonsBase : ''
  for (const uri of corposCitados(doc)) {
    let corpo = null
    try {
      const texto = ler(juntar(base, uri))
      if (texto !== null) corpo = JSON.parse(texto)
    } catch { corpo = null }
    corpos.set(uri, corpo)
  }
  return corpos
}

/**
 * Os arquivos externos que `assets.animations` e `assets.skins` citam (2.8),
 * lidos por `ler(uriResolvida)` como os corpos acima.
 *
 * Sem isto o validador **nunca** tinha hospedeiro e externo em mãos ao mesmo
 * tempo, e a §4.8 — *"o validador DEVE conferir o `rig` de um arquivo externo
 * contra o hospedeiro quando tem os dois em mãos, e listar cada nome que
 * falta"* — não tinha como ser cumprida. Quem validava pela linha de comando um
 * `.bone` com animação de fábrica recebia **verde** e nenhuma palavra sobre os
 * nomes que não batiam.
 */
function carregarExternos(doc, ler) {
  const externos = new Map()
  const base = typeof doc.assets?.skeletonsBase === 'string' ? doc.assets.skeletonsBase : ''
  for (const { uri } of externosCitados(doc)) {
    let ext = null
    try {
      const texto = ler(juntar(base, uri))
      if (texto !== null) ext = JSON.parse(texto)
    } catch { ext = null }
    externos.set(uri, ext)
  }
  return externos
}

/** Valida um documento já lido. `contexto` leva os corpos citados (9.13). */
function validarDocumento(doc, tipo, v, contexto = {}) {
  const compilado = v[tipo]
  const ok = compilado(doc)
  const erros = ok ? [] : compilado.errors.map(e => `${e.instancePath || '/'} ${e.message}${e.params && e.params.allowedValues ? ' (' + e.params.allowedValues.join(', ') + ')' : ''}`)
  const avisos = []
  // O registro de extensões viaja no contexto: o `nucleo.js` aplica o schema
  // pelo nome (§12.7), e a página faz o mesmo com os schemas já compilados.
  const comExtensoes = { ...contexto, extensoes: v.extensoes, extensoesRegistradas: v.extensoesRegistradas }
  const regras =
    tipo === 'esqueleto' ? [...checarSemantica(doc, comExtensoes), ...avisosGerais(doc, tipo)]
      : tipo === 'atlas' ? checarAtlas(doc)
        : checarManifesto(doc)
  for (const r of regras) {
    const linha = `${r.codigo ? `[${r.codigo}] ` : ''}${r.texto}${r.ponteiro ? `  (${r.ponteiro})` : ''}`
    if (r.gravidade === 'aviso') avisos.push(linha)
    else erros.push(linha)
  }
  return { ok: erros.length === 0, tipo, erros, avisos }
}

function validarTexto(texto, tipo, v, contexto) {
  let doc
  try { doc = JSON.parse(texto) }
  catch (e) { return { ok: false, tipo, erros: [`JSON inválido: ${e.message}`], avisos: [] } }
  return validarDocumento(doc, tipo, v, contexto)
}

/** Um `.bone`, `.atlas.json` ou `manifest.json` solto no disco. */
function validarSolto(caminho, v, tipoForcado) {
  const tipo = tipoForcado ?? tipoPeloNome(caminho)
  const texto = readFileSync(caminho, 'utf8')
  if (tipo !== 'esqueleto') return { ...validarTexto(texto, tipo, v), entradas: [] }
  let doc
  try { doc = JSON.parse(texto) }
  catch (e) { return { ok: false, tipo, erros: [`JSON inválido: ${e.message}`], avisos: [], entradas: [] } }
  // A base de resolução de um arquivo solto é a pasta dele (2.8).
  const pasta = dirname(caminho)
  const ler = (uri) => {
    const p = resolve(pasta, uri)
    return existsSync(p) ? readFileSync(p, 'utf8') : null
  }
  const corpos = carregarCorpos(doc, ler)
  const externos = carregarExternos(doc, ler)
  return { ...validarDocumento(doc, tipo, v, { corpos, externos }), entradas: [] }
}

/**
 * Um `.bonez`: o manifesto, o esqueleto principal, todo esqueleto listado em
 * `skeletons` e todo atlas listado em `atlases` (2.9). A base de resolução de
 * cada esqueleto é a PASTA DELE dentro do ZIP, nunca a raiz (2.8).
 */
function validarPacote(caminho, v) {
  const bytes = new Uint8Array(readFileSync(caminho))
  let pacote
  try {
    pacote = readBonez(bytes, { inflateRaw: (d) => zlib.inflateRawSync(d) })
  } catch (e) {
    return { ok: false, tipo: 'pacote', erros: [`pacote ilegível: ${e.message}`], avisos: [], entradas: [] }
  }
  const decodificar = (u8) => new TextDecoder().decode(u8)
  const entradas = []
  const avisosDoPacote = (pacote.warnings ?? []).map(a => `[ZIP] ${a}`)
  const lerDentro = (nome) => {
    const b = pacote.read(nome)
    return b === undefined ? null : decodificar(b)
  }

  // 1. o manifesto, lido da própria entrada
  const textoManifesto = lerDentro('manifest.json')
  if (textoManifesto === null) {
    entradas.push({ nome: 'manifest.json', ok: false, tipo: 'manifesto', erros: ['o pacote não traz manifest.json (2.9)'], avisos: [] })
  } else {
    entradas.push({ nome: 'manifest.json', ...validarTexto(textoManifesto, 'manifesto', v) })
  }
  const manifesto = pacote.manifest ?? {}
  const principal = typeof manifesto.main === 'string' ? manifesto.main : pacote.mainName

  // 2. os esqueletos: o principal e os listados, sem repetir
  const esqueletos = []
  for (const nome of [principal, ...(Array.isArray(manifesto.skeletons) ? manifesto.skeletons : [])]) {
    if (typeof nome === 'string' && !esqueletos.includes(nome)) esqueletos.push(nome)
  }
  for (const nome of esqueletos) {
    const texto = lerDentro(nome)
    if (texto === null) {
      entradas.push({ nome, ok: false, tipo: 'esqueleto', erros: [`o manifesto cita "${nome}" e o pacote não traz essa entrada (2.9)`], avisos: [] })
      continue
    }
    let doc
    try { doc = JSON.parse(texto) }
    catch (e) { entradas.push({ nome, ok: false, tipo: 'esqueleto', erros: [`JSON inválido: ${e.message}`], avisos: [] }); continue }
    const pastaDele = posix.dirname(nome) === '.' ? '' : posix.dirname(nome)
    const lerRelativo = (uri) => lerDentro(pastaDele ? posix.join(pastaDele, uri) : uri)
    const corpos = carregarCorpos(doc, lerRelativo)
    const externos = carregarExternos(doc, lerRelativo)
    entradas.push({ nome, ...validarDocumento(doc, 'esqueleto', v, { corpos, externos }) })
  }

  // 3. os atlas listados
  for (const nome of Array.isArray(manifesto.atlases) ? manifesto.atlases : []) {
    const texto = lerDentro(nome)
    if (texto === null) {
      entradas.push({ nome, ok: true, tipo: 'atlas', erros: [], avisos: [`o manifesto lista o atlas "${nome}" e o pacote não traz o arquivo (2.9, L2 ZIP_UNLISTED ao contrário: listado sem entrada)`] })
      continue
    }
    entradas.push({ nome, ...validarTexto(texto, 'atlas', v) })
  }

  const ok = entradas.every(e => e.ok)
  return { ok, tipo: 'pacote', erros: [], avisos: avisosDoPacote, entradas }
}

function validarArquivo(caminho, v, tipoForcado) {
  let bytes
  try { bytes = readFileSync(caminho) }
  catch (e) { return { ok: false, tipo: tipoForcado ?? tipoPeloNome(caminho), erros: [`não deu para ler: ${e.message}`], avisos: [], entradas: [] } }
  // A embalagem vem dos bytes, nunca do nome (1.2): um .bonez renomeado
  // continua sendo um pacote.
  if (tipoForcado === null && detectarEmbalagem(new Uint8Array(bytes)) === 'bonez') return validarPacote(caminho, v)
  if (tipoForcado === 'pacote' || (tipoForcado === null && tipoPeloNome(caminho) === 'pacote')) return validarPacote(caminho, v)
  try {
    return validarSolto(caminho, v, tipoForcado)
  } catch (e) {
    return { ok: false, tipo: tipoForcado ?? tipoPeloNome(caminho), erros: [`JSON inválido: ${e.message}`], avisos: [], entradas: [] }
  }
}

const args = process.argv.slice(2)
// QA da noite de 04/11/2026: `--help` validava os exemplos, e uma opção
// errada passava calada (regra 21). Ajuda sai com 0; pergunta errada, com 2.
const USO = `Uso: node ferramentas/validador/validar.mjs [opções] arquivo1 [arquivo2 ...]

  Sem arquivo, valida os exemplos de formato/exemplos (o mesmo que --todos).
  O tipo vem do nome: .bone (esqueleto), .atlas.json (atlas),
  manifest.json (manifesto), .bonez (pacote).

  --esqueleto        lê todo arquivo como esqueleto
  --atlas            lê todo arquivo como atlas
  --manifesto        lê todo arquivo como manifesto
  --pacote           lê todo arquivo como pacote .bonez
  --todos            valida os exemplos de formato/exemplos
  --json             relatório em JSON, para máquina
  --ajuda            mostra este texto

Sai com 0 quando tudo é válido, 1 quando algum arquivo tem erro, 2 quando a
pergunta está errada.`
const CONHECIDAS = new Set(['--atlas', '--manifesto', '--esqueleto', '--pacote', '--json', '--todos', '--ajuda', '--help'])
if (args.includes('--ajuda') || args.includes('--help')) {
  console.log(USO)
  process.exit(0)
}
const desconhecida = args.find(a => a.startsWith('--') && !CONHECIDAS.has(a))
if (desconhecida !== undefined) {
  console.error(`Erro: opção desconhecida: ${desconhecida}\n\n${USO}`)
  process.exit(2)
}
let arquivos = args.filter(a => !a.startsWith('--'))
let tipoForcado = null
if (args.includes('--atlas')) tipoForcado = 'atlas'
else if (args.includes('--manifesto')) tipoForcado = 'manifesto'
else if (args.includes('--esqueleto')) tipoForcado = 'esqueleto'
else if (args.includes('--pacote')) tipoForcado = 'pacote'
const emJson = args.includes('--json')
if (args.includes('--todos') || arquivos.length === 0) {
  const dir = join(raiz, 'formato', 'exemplos')
  // Os TRÊS tipos que o validador conhece, e não dois: o `manifest.json` é o
  // que descreve um pacote `.bonez`, e sem um exemplo público ninguém tinha
  // contra o que conferir a leitura de pacote.
  arquivos = readdirSync(dir)
    .filter(f => f.endsWith('.bone') || f.endsWith('.atlas.json') || f === 'manifest.json' || f.endsWith('.bonez'))
    .map(f => join(dir, f))
}

const v = carregarSchema()
let falhas = 0
const relatorio = []
for (const a of arquivos) {
  const r = validarArquivo(resolve(a), v, tipoForcado)
  relatorio.push({ arquivo: a, ...r })
  if (!emJson) {
    console.log(`${r.ok ? 'OK   ' : 'ERRO '} ${a}   (${ROTULO[r.tipo]})`)
    for (const e of r.erros) console.log(`      - ${e}`)
    for (const w of r.avisos) console.log(`      aviso: ${w}`)
    for (const ent of r.entradas ?? []) {
      console.log(`      ${ent.ok ? 'ok  ' : 'ERRO'} ${ent.nome}   (${ROTULO[ent.tipo]})`)
      for (const e of ent.erros) console.log(`           - ${e}`)
      for (const w of ent.avisos) console.log(`           aviso: ${w}`)
    }
  }
  if (!r.ok) falhas++
}
if (emJson) {
  console.log(JSON.stringify({ validos: arquivos.length - falhas, comErro: falhas, arquivos: relatorio }, null, 2))
} else {
  console.log(`\n${arquivos.length - falhas} válido(s), ${falhas} com erro.`)
}
process.exit(falhas ? 1 : 0)
