#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Importa um PSD ou PSB em camadas para o formato .bone (requisito R3 / I1).
//
// Uso:
//   node ferramentas/importar-psd.mjs personagem.psd saida
//   node ferramentas/importar-psd.mjs personagem.psb build/heroi --max 4096
//
// Grava três arquivos:
//   saida.bone         o esqueleto, com um slot por camada, na posição do PSD
//   saida.atlas.json   o atlas de §10
//   saida.png          a página do atlas (saida2.png, se precisar de outra)
//
// Cada camada do PSD vira um slot com um anexo do tipo region, preso ao osso
// raiz, na ordem de desenho do PSD. Sem dependências: o leitor de PSD é de
// `ferramentas/src/importar/psd.ts` e o empacotador de `src/atlas/packer.ts`.

import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import zlib from 'node:zlib'

import { readPsd, psdToBoneFile } from './src/importar/psd.ts'
import { isBonesLayer } from './src/importar/psd-bones.ts'
import { packAtlas } from './src/atlas/packer.ts'
import { encodePng } from './src/atlas/png.ts'

const aqui = dirname(fileURLToPath(import.meta.url))
const validador = join(aqui, 'validador', 'validar.mjs')

const USO = `Uso: node ferramentas/importar-psd.mjs <arquivo.psd> <saida> [opções]

  --max N            lado maior da página do atlas em pixels (padrão 2048)
  --padding N        espaço entre as imagens em pixels (padrão 2)
  --pot              lados da página em potência de dois
  --sem-rotacao      não gira nenhuma imagem 90 graus
  --sem-corte        não corta a borda transparente das camadas
  --ossos            lê a camada "ossos" como esqueleto: cada linha vira um osso
  --relatorio ARQ    grava os avisos também num arquivo de texto
  --sem-validar      não chama o validador no fim
  --ajuda            mostra este texto`

// ---------------------------------------------------------------------------
// Argumentos
// ---------------------------------------------------------------------------

function lerArgumentos(argv) {
  const op = {
    max: 2048, padding: 2, pot: false, rotacao: true, corte: true,
    relatorio: null, validar: true, ajuda: false, entrada: null, saida: null, ossos: false,
  }
  const livres = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (!a.startsWith('--')) { livres.push(a); continue }
    const [chave, junto] = a.slice(2).split('=')
    const valor = () => (junto !== undefined ? junto : argv[++i])
    switch (chave) {
      case 'max': op.max = Number(valor()); break
      case 'padding': op.padding = Number(valor()); break
      case 'pot': op.pot = true; break
      case 'sem-rotacao': op.rotacao = false; break
      case 'sem-corte': op.corte = false; break
      case 'ossos': op.ossos = true; break
      case 'relatorio': op.relatorio = valor(); break
      case 'sem-validar': op.validar = false; break
      case 'ajuda': case 'help': op.ajuda = true; break
      default: throw new Error(`opção desconhecida: --${chave}`)
    }
  }
  op.entrada = livres[0] ?? null
  op.saida = livres[1] ?? null
  return op
}

// ---------------------------------------------------------------------------
// O zlib do Node, no formato que o leitor e o PNG pedem
// ---------------------------------------------------------------------------

const paraBuffer = (u8) => Buffer.from(u8.buffer, u8.byteOffset, u8.byteLength)

const ZLIB = {
  inflate: (dados) => new Uint8Array(zlib.inflateSync(paraBuffer(dados))),
  deflate: (dados, nivel = 9) => new Uint8Array(zlib.deflateSync(paraBuffer(dados), { level: nivel })),
}

// ---------------------------------------------------------------------------
// Resumo em colunas alinhadas
// ---------------------------------------------------------------------------

function coluna(rotulo, largura) {
  return rotulo + ' '.repeat(Math.max(0, largura - rotulo.length))
}

function plural(n, um, muitos) {
  return `${n} ${n === 1 ? um : muitos}`
}

// ---------------------------------------------------------------------------
// Principal
// ---------------------------------------------------------------------------

function principal() {
  let op
  try {
    op = lerArgumentos(process.argv.slice(2))
  } catch (erro) {
    process.stderr.write(`Erro: ${erro.message}\n`)
    process.exit(2)
  }
  if (op.ajuda || op.entrada === null || op.saida === null) {
    process.stdout.write(`${USO}\n`)
    process.exit(op.ajuda ? 0 : 2)
  }

  const entrada = resolve(process.cwd(), op.entrada)
  if (!existsSync(entrada) || !statSync(entrada).isFile()) {
    process.stderr.write(`Erro: arquivo não encontrado: ${entrada}\n`)
    process.exit(2)
  }
  const saida = resolve(process.cwd(), op.saida).replace(/\.bone$/i, '')
  const pasta = dirname(saida)
  const base = basename(saida)
  mkdirSync(pasta, { recursive: true })

  // 1. Ler o PSD.
  let psd
  try {
    psd = readPsd(new Uint8Array(readFileSync(entrada)), ZLIB)
  } catch (erro) {
    process.stderr.write(`Erro ao ler o PSD: ${erro.message}\n`)
    process.exit(1)
  }
  if (psd.layers.length === 0) {
    for (const aviso of psd.warnings) process.stdout.write(`Aviso: ${aviso}\n`)
    process.stderr.write('Erro: nenhuma camada com desenho neste arquivo.\n')
    process.exit(1)
  }

  // 2. Empacotar as camadas num atlas. A camada "ossos" nunca é desenho e
  //    fica de fora, com --ossos ou sem (lote 45).
  const desenhos = psd.layers.filter((c) => !isBonesLayer(c))
  if (desenhos.length === 0) {
    process.stderr.write('Erro: este PSD só tem a camada "ossos". Falta a arte.\n')
    process.exit(1)
  }
  const nomeAtlas = `${base}.atlas.json`
  let empacotado
  try {
    empacotado = packAtlas(
      desenhos.map((c) => ({ name: c.name, width: c.width, height: c.height, pixels: c.pixels })),
      {
        maxWidth: op.max,
        maxHeight: op.max,
        padding: op.padding,
        pot: op.pot,
        rotation: op.rotacao,
        trim: op.corte,
        pageName: base,
        generator: 'Recorte importador de PSD 0.1.0',
      },
    )
  } catch (erro) {
    process.stderr.write(`Erro ao empacotar as camadas: ${erro.message}\n`)
    process.exit(1)
  }

  // 3. Montar o .bone.
  const montado = psdToBoneFile(psd, { atlasName: nomeAtlas, name: base, bonesLayer: op.ossos })
  const avisos = [...psd.warnings, ...montado.warnings]

  // 4. Gravar os três arquivos.
  const caminhoBone = `${saida}.bone`
  writeFileSync(caminhoBone, `${JSON.stringify(montado.file, null, 2)}\n`, 'utf8')
  const caminhoAtlas = join(pasta, nomeAtlas)
  writeFileSync(caminhoAtlas, `${JSON.stringify(empacotado.atlas, null, 2)}\n`, 'utf8')
  const paginas = []
  for (const pagina of empacotado.pages) {
    const png = encodePng(
      { width: pagina.width, height: pagina.height, pixels: pagina.pixels },
      ZLIB,
      { colorType: 'rgba8', filter: 'adaptive' },
    )
    const caminho = join(pasta, pagina.image)
    writeFileSync(caminho, paraBuffer(png))
    paginas.push(pagina)
  }

  if (op.relatorio !== null) {
    const linhas = [`Entrada: ${entrada}`, `Saída: ${caminhoBone}`, '', ...avisos]
    writeFileSync(resolve(process.cwd(), op.relatorio), `${linhas.join('\n')}\n`, 'utf8')
  }

  // 5. Resumo, em colunas alinhadas.
  const tipo = psd.psb ? 'PSB' : 'PSD'
  process.stdout.write('\n')
  process.stdout.write(`${coluna('Arquivo lido:', 24)}${basename(entrada)} (${tipo}, ${psd.width} x ${psd.height} px)\n`)
  process.stdout.write(`${coluna('Camadas importadas:', 24)}${psd.layers.length}\n`)
  process.stdout.write(`${coluna('Slots criados:', 24)}${montado.slotNames.length}\n`)
  if (op.ossos) process.stdout.write(`${coluna('Ossos criados:', 24)}${montado.boneNames.length}\n`)
  process.stdout.write(`${coluna('Páginas do atlas:', 24)}${paginas.length}\n`)
  process.stdout.write(`${coluna('Avisos:', 24)}${avisos.length}\n`)
  process.stdout.write('\n')
  process.stdout.write(`${coluna('Esqueleto:', 24)}${caminhoBone}\n`)
  process.stdout.write(`${coluna('Atlas:', 24)}${caminhoAtlas}\n`)
  for (const pagina of paginas) {
    process.stdout.write(`${coluna('Página:', 24)}${join(pasta, pagina.image)}  ${pagina.width} x ${pagina.height} px\n`)
  }

  if (avisos.length > 0) {
    process.stdout.write('\nAvisos\n')
    for (const aviso of avisos) process.stdout.write(`  - ${aviso}\n`)
  }
  process.stdout.write('\n')

  // 6. Conferir o que foi gravado.
  let falhou = false
  if (op.validar) {
    const r = spawnSync(process.execPath, [validador, caminhoBone], { encoding: 'utf8' })
    const texto = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()
    if (texto) process.stdout.write(`${texto}\n`)
    if (r.status !== 0) falhou = true
  }

  process.stdout.write(
    `${plural(psd.layers.length, 'camada lida', 'camadas lidas')}, `
    + `${plural(montado.slotNames.length, 'slot criado', 'slots criados')}, `
    + `${plural(avisos.length, 'aviso', 'avisos')}.\n`,
  )
  process.exit(falhou ? 1 : 0)
}

principal()
