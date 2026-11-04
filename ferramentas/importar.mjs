#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// Importa projetos de Spine, DragonBones e Spriter para o formato .bone.
//
// Uso:
//   node ferramentas/importar.mjs entrada.json saida.bone
//   node ferramentas/importar.mjs heroi.json heroi.bone --atlas heroi.atlas
//   node ferramentas/importar.mjs heroi.scml heroi.bone --relatorio aviso.txt
//
// Opções:
//   --atlas <arquivo>      Atlas de origem (.atlas do Spine ou .json do DragonBones)
//   --formato <nome>       Força o formato: spine, dragonbones, spriter
//   --parte <nome>         Qual armature (DragonBones) ou entity (Spriter) converter
//   --relatorio <arquivo>  Grava os avisos também num arquivo de texto
//   --sem-validar          Não chama o validador no fim
//   --assar                Spriter: um pai só por osso (comportamento antigo), sem timeline parent

import { readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

import { importSpine } from './src/importar/spine.ts'
import { importDragonBones } from './src/importar/dragonbones.ts'
import { importSpriter, importSpriterProject, spriterParts } from './src/importar/spriter.ts'

const aqui = dirname(fileURLToPath(import.meta.url))
const validador = join(aqui, 'validador', 'validar.mjs')

function lerArgumentos(argv) {
  const opcoes = { atlas: null, formato: null, parte: null, relatorio: null, validar: true, assar: false }
  const livres = []
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--atlas') opcoes.atlas = argv[++i] ?? null
    else if (a === '--formato') opcoes.formato = (argv[++i] ?? '').toLowerCase()
    else if (a === '--parte') opcoes.parte = argv[++i] ?? null
    else if (a === '--relatorio') opcoes.relatorio = argv[++i] ?? null
    else if (a === '--sem-validar') opcoes.validar = false
    else if (a === '--assar') opcoes.assar = true
    else if (a === '--ajuda' || a === '-h' || a === '--help') opcoes.ajuda = true
    else if (a.startsWith('--')) throw new Error(`Opção desconhecida: ${a}`)
    else livres.push(a)
  }
  opcoes.entrada = livres[0] ?? null
  opcoes.saida = livres[1] ?? null
  return opcoes
}

function ajuda() {
  console.log('Importador do Recorte')
  console.log('')
  console.log('  node ferramentas/importar.mjs entrada saida.bone [opções]')
  console.log('')
  console.log('Opções:')
  console.log('  --atlas <arquivo>      Atlas de origem (.atlas do Spine ou .json do DragonBones)')
  console.log('  --formato <nome>       Força o formato: spine, dragonbones, spriter')
  console.log('  --parte <nome>         Qual armature (DragonBones) ou entity (Spriter) converter')
  console.log('  --relatorio <arquivo>  Grava os avisos num arquivo de texto')
  console.log('  --sem-validar          Não chama o validador no fim')
  console.log('  --assar                Spriter: um pai só por osso (comportamento antigo), sem timeline parent')
}

function detectarFormato(texto) {
  const limpo = texto.replace(/^﻿/, '').trimStart()
  if (limpo.startsWith('<')) return 'spriter'
  let dados
  try {
    dados = JSON.parse(limpo)
  } catch {
    throw new Error('O arquivo de entrada não é JSON nem XML.')
  }
  if (dados && typeof dados === 'object') {
    if (dados.spriter_data) return 'spriter'
    if (Array.isArray(dados.armature)) return 'dragonbones'
    if (dados.skeleton && (Array.isArray(dados.bones) || dados.skeleton.spine)) return 'spine'
    if (Array.isArray(dados.entity) && Array.isArray(dados.folder)) return 'spriter'
    if (Array.isArray(dados.bones)) return 'spine'
  }
  throw new Error('Não deu para descobrir o formato de origem. Use --formato spine, dragonbones ou spriter.')
}

function contarRecursos(arquivo, atlas) {
  let total = 0
  total += (arquivo.bones ?? []).length
  total += (arquivo.slots ?? []).length
  total += (arquivo.constraints ?? []).length
  total += (arquivo.events ?? []).length
  total += (arquivo.variables ?? []).length
  for (const skin of arquivo.skins ?? []) {
    total += 1
    for (const bucket of Object.values(skin.attachments ?? {})) {
      total += Object.keys(bucket).length
    }
  }
  for (const animacao of arquivo.animations ?? []) {
    total += 1 + (animacao.timelines ?? []).length
  }
  if (atlas) total += (atlas.pages ?? []).length + (atlas.regions ?? []).length
  return total
}

/**
 * O SCML inteiro, gravado como PROJETO — degrau 10, tarefa 10.5.
 *
 * Um `.bone` por entity na pasta da saída, mais o `manifest.json` da §2.9 com
 * as listas do editor. A pasta que sai é o `.bonez` aberto: `Abrir pasta do
 * projeto…` no editor traz os corpos todos de volta.
 */
function gravarProjeto(texto, saida, opcoes, entrada) {
  let projeto
  try {
    projeto = importSpriterProject(texto, { assar: opcoes.assar === true })
  } catch (erro) {
    console.error(`Erro na conversão: ${erro.message}`)
    process.exit(1)
  }
  const pasta = dirname(saida)
  const gravados = []
  try {
    for (const corpo of projeto.bodies) {
      const caminho = join(pasta, corpo.uri)
      writeFileSync(caminho, JSON.stringify(corpo.file, null, 2) + '\n', 'utf8')
      gravados.push(caminho)
    }
    writeFileSync(join(pasta, 'manifest.json'), JSON.stringify(projeto.manifest, null, 2) + '\n', 'utf8')
  } catch (erro) {
    console.error(`Erro ao gravar em "${pasta}": ${erro.message}`)
    process.exit(1)
  }

  for (const aviso of projeto.avisos) console.log(aviso)
  console.log(`Projeto gravado em ${pasta}: ${projeto.bodies.length} corpos (${projeto.bodies.map(b => b.uri).join(', ')}) e manifest.json`)
  console.log(`Corpo principal: ${projeto.manifest.main}`)
  if (opcoes.relatorio) {
    const linhas = [
      'Origem: spriter', `Entrada: ${entrada}`, `Saída: ${pasta}`,
      `Corpos: ${projeto.bodies.map(b => `${b.entity} → ${b.uri}`).join(', ')}`,
      '', ...projeto.avisos,
    ]
    writeFileSync(resolve(opcoes.relatorio), linhas.join('\n') + '\n', 'utf8')
  }

  let falhou = false
  if (opcoes.validar) {
    for (const caminho of [...gravados, join(pasta, 'manifest.json')]) {
      const r = spawnSync(process.execPath, [validador, caminho], { encoding: 'utf8' })
      const saidaTexto = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()
      if (saidaTexto) console.log(saidaTexto)
      if (r.status !== 0) falhou = true
    }
  }
  const total = projeto.bodies.reduce((soma, corpo) => soma + contarRecursos(corpo.file, null), 0)
  console.log(`${total} recursos convertidos, ${projeto.avisos.length} avisos`)
  process.exit(falhou ? 1 : 0)
}

function principal() {
  let opcoes
  try {
    opcoes = lerArgumentos(process.argv.slice(2))
  } catch (erro) {
    console.error(`Erro: ${erro.message}`)
    process.exit(2)
  }
  if (opcoes.ajuda || !opcoes.entrada) {
    ajuda()
    process.exit(opcoes.ajuda ? 0 : 2)
  }
  const entrada = resolve(opcoes.entrada)
  const saida = resolve(opcoes.saida ?? entrada.replace(/\.[^.]+$/, '') + '.bone')

  let texto
  try {
    texto = readFileSync(entrada, 'utf8')
  } catch {
    console.error(`Erro: não deu para ler "${entrada}".`)
    process.exit(2)
  }

  let formato
  try {
    formato = opcoes.formato ?? detectarFormato(texto)
  } catch (erro) {
    console.error(`Erro: ${erro.message}`)
    process.exit(2)
  }

  let atlasTexto = null
  let atlasDados = null
  if (opcoes.atlas) {
    try {
      atlasTexto = readFileSync(resolve(opcoes.atlas), 'utf8')
    } catch {
      console.error(`Erro: não deu para ler o atlas "${opcoes.atlas}".`)
      process.exit(2)
    }
    const limpo = atlasTexto.replace(/^﻿/, '').trimStart()
    if (limpo.startsWith('{')) {
      try {
        atlasDados = JSON.parse(limpo)
      } catch {
        console.error('Erro: o atlas parece JSON, mas não deu para ler.')
        process.exit(2)
      }
    }
  }

  const apelidos = { scml: 'spriter', scon: 'spriter', db: 'dragonbones', dragonbone: 'dragonbones' }
  formato = apelidos[formato] ?? formato

  // Degrau 10 (10.5): um SCML com várias entities é um PROJETO — cada entity
  // é um corpo. Sem `--parte`, saem todos, com o `manifest.json` ao lado; com
  // `--parte`, sai só aquele, como sempre.
  if (formato === 'spriter' && !opcoes.parte) {
    let nomes = []
    try {
      nomes = spriterParts(texto)
    } catch (erro) {
      console.error(`Erro na conversão: ${erro.message}`)
      process.exit(1)
    }
    if (nomes.length > 1) {
      gravarProjeto(texto, saida, opcoes, entrada)
      return
    }
  }

  const nomeAtlas = basename(saida).replace(/\.bone$/i, '') + '.atlas.json'
  let resultado
  try {
    if (formato === 'spine' && opcoes.parte) {
      console.log('Aviso: --parte não vale para o Spine; um projeto do Spine tem um esqueleto só.')
    }
    if (formato === 'spine') {
      if (atlasDados) {
        console.log('Aviso: o Spine usa atlas em texto (.atlas). O arquivo JSON passado em --atlas foi ignorado.')
        atlasTexto = null
      }
      const dados = JSON.parse(texto.replace(/^﻿/, ''))
      resultado = importSpine(dados, atlasTexto, { atlasNome: nomeAtlas })
    } else if (formato === 'dragonbones') {
      const dados = JSON.parse(texto.replace(/^﻿/, ''))
      resultado = importDragonBones(dados, atlasDados, { parte: opcoes.parte ?? undefined })
    } else if (formato === 'spriter') {
      resultado = importSpriter(texto, { parte: opcoes.parte ?? undefined, assar: opcoes.assar === true })
    } else {
      throw new Error(`Formato "${formato}" não existe. Use spine, dragonbones ou spriter.`)
    }
  } catch (erro) {
    console.error(`Erro na conversão: ${erro.message}`)
    process.exit(1)
  }

  if (resultado.atlas && resultado.file.assets) {
    resultado.file.assets.atlases = [nomeAtlas]
  }

  try {
    writeFileSync(saida, JSON.stringify(resultado.file, null, 2) + '\n', 'utf8')
  } catch (erro) {
    console.error(`Erro ao gravar "${saida}": ${erro.message}`)
    process.exit(1)
  }
  let caminhoAtlas = null
  if (resultado.atlas) {
    caminhoAtlas = join(dirname(saida), nomeAtlas)
    writeFileSync(caminhoAtlas, JSON.stringify(resultado.atlas, null, 2) + '\n', 'utf8')
  }

  const avisos = resultado.avisos ?? []
  for (const aviso of avisos) console.log(aviso)
  if (opcoes.relatorio) {
    const linhas = [`Origem: ${formato}`, `Entrada: ${entrada}`, `Saída: ${saida}`, '', ...avisos]
    writeFileSync(resolve(opcoes.relatorio), linhas.join('\n') + '\n', 'utf8')
  }

  console.log(`Arquivo gravado: ${saida}`)
  if (caminhoAtlas) console.log(`Atlas gravado: ${caminhoAtlas}`)

  let falhou = false
  if (opcoes.validar) {
    const r = spawnSync(process.execPath, [validador, saida], { encoding: 'utf8' })
    const texto = `${r.stdout ?? ''}${r.stderr ?? ''}`.trim()
    if (texto) console.log(texto)
    if (r.status !== 0) falhou = true
  }

  const total = contarRecursos(resultado.file, resultado.atlas)
  console.log(`${total} recursos convertidos, ${avisos.length} avisos`)
  process.exit(falhou ? 1 : 0)
}

principal()
