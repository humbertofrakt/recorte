/**
 * Tests for the web validator (`site/validador/`), requirement F4.
 *
 * The page has one job the command line does not: it has to be believable to
 * somebody who has never installed Node. That only works if it says exactly
 * what the command line says. So the test that matters here is not "does the
 * page run" — it is **the two validators agree**.
 *
 * Every check below runs the same file twice: once through
 * `ferramentas/validador/validar.mjs`'s own logic (Ajv over
 * `formato/bone.schema.json`, plus its semantic rules), and once through
 * `site/validador/nucleo.js` with the ahead-of-time compiled schema. When they
 * disagree, this file fails, and the disagreement is the bug.
 */

import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import * as nucleo from '../../site/validador/nucleo.js'
import type { TipoDeDocumento, Validadores } from '../../site/validador/nucleo.js'
import {
  validateAtlas, validateManifest, validateSkeleton,
} from '../../site/validador/esquema-compilado.js'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')
const exemplos = join(raiz, 'formato', 'exemplos')

const VALIDADORES: Validadores = {
  esqueleto: validateSkeleton,
  atlas: validateAtlas,
  manifesto: validateManifest,
}

// ---------------------------------------------------------------------------
// The command line, rebuilt here so the two can be compared side by side
// ---------------------------------------------------------------------------

/**
 * Ajv set up exactly as `ferramentas/validador/validar.mjs` sets it up: same
 * options, same schema file, same three entry points. This is the reference
 * the page has to match.
 */
function compilarComoNoCli() {
  const schema = JSON.parse(readFileSync(join(raiz, 'formato', 'bone.schema.json'), 'utf8'))
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
  addFormats(ajv)
  const id = schema.$id ?? 'bone.schema.json'
  ajv.addSchema(schema, id)
  const porRef = (ref: string) => ajv.compile({ $ref: `${id}${ref}` })
  return {
    esqueleto: porRef('#'),
    atlas: porRef('#/definitions/atlas'),
    manifesto: porRef('#/definitions/manifest'),
  }
}

const CLI = compilarComoNoCli()

/** The command line verdict for one already-parsed document. */
function vereditoDoCli(doc: unknown, tipo: TipoDeDocumento) {
  const compilado = CLI[tipo]
  const passou = compilado(doc)
  const erros: string[] = passou
    ? []
    : (compilado.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.keyword}`)
  // Desde o rascunho 0.2 o núcleo devolve também avisos (L2); só o erro (L1)
  // derruba o arquivo, na página e na linha de comando.
  const semanticos = (
    tipo === 'atlas' ? nucleo.checarAtlas(doc as never)
      : tipo === 'manifesto' ? nucleo.checarManifesto(doc as never)
        : nucleo.checarSemantica(doc as never)
  ).filter((p) => (p as { gravidade?: string }).gravidade !== 'aviso')
  return { valido: erros.length === 0 && semanticos.length === 0, erros, semanticos }
}

function lerExemplo(nome: string) {
  const caminho = join(exemplos, nome)
  const bytes = new Uint8Array(readFileSync(caminho))
  const texto = readFileSync(caminho, 'utf8')
  return { nome, bytes, texto, doc: JSON.parse(texto) }
}

/** The five files `npm run validar -- --todos` walks. */
const EXEMPLOS = ['heroi.bone', 'espada.bone', 'minimo.bone', 'heroi.atlas.json', 'manifest.json']

// ---------------------------------------------------------------------------
// Which file is this
// ---------------------------------------------------------------------------

describe('detectar o tipo do arquivo pelos bytes', () => {
  it('reconhece as três embalagens pelos primeiros bytes, nunca pelo nome', () => {
    const texto = new Uint8Array(readFileSync(join(exemplos, 'heroi.bone')))
    const binario = new Uint8Array(readFileSync(join(raiz, 'conformidade', 'casos', 'BIN-401-roundtrip', 'entrada.boneb')))
    const pacote = new Uint8Array(readFileSync(join(raiz, 'conformidade', 'casos', 'ZIP-501-manifesto', 'entrada.bonez')))

    expect(nucleo.detectarEmbalagem(texto)).toBe('bone')
    expect(nucleo.detectarEmbalagem(binario)).toBe('boneb')
    expect(nucleo.detectarEmbalagem(pacote)).toBe('bonez')

    // The name is a lie and the bytes still win.
    expect(nucleo.detectarTipo('qualquer-coisa.txt', binario).embalagem).toBe('boneb')
    expect(nucleo.detectarTipo('nome-trocado.bone', pacote).embalagem).toBe('bonez')
  })

  it('usa a mesma regra de nome do validador de linha de comando', () => {
    // `tipoPeloNome` in validar.mjs: `.atlas.json` -> atlas, `manifest.json` ->
    // manifesto, anything else -> esqueleto.
    expect(nucleo.tipoPeloNome('heroi.atlas.json')).toBe('atlas')
    expect(nucleo.tipoPeloNome('C:/pasta/saida.atlas.json')).toBe('atlas')
    expect(nucleo.tipoPeloNome('manifest.json')).toBe('manifesto')
    expect(nucleo.tipoPeloNome('heroi.bone')).toBe('esqueleto')
    expect(nucleo.tipoPeloNome('qualquer.json')).toBe('esqueleto')
  })

  it('cai no conteúdo quando o nome não diz nada', () => {
    const atlas = lerExemplo('heroi.atlas.json')
    const manifesto = lerExemplo('manifest.json')
    const esqueleto = lerExemplo('minimo.bone')
    expect(nucleo.detectarTipo('sem-nome', atlas.bytes, atlas.doc).tipo).toBe('atlas')
    expect(nucleo.detectarTipo('sem-nome', manifesto.bytes, manifesto.doc).tipo).toBe('manifesto')
    expect(nucleo.detectarTipo('sem-nome', esqueleto.bytes, esqueleto.doc).tipo).toBe('esqueleto')
  })

  it('separa imagem de arquivo do formato', () => {
    const png = new Uint8Array(readFileSync(join(exemplos, 'heroi.png')))
    expect(nucleo.ehImagem('heroi.png', png)).toBe(true)
    // Even with the extension filed off, the PNG signature gives it away.
    expect(nucleo.ehImagem('sem-extensao', png)).toBe(true)
    expect(nucleo.ehImagem('heroi.bone', new Uint8Array(readFileSync(join(exemplos, 'heroi.bone'))))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// The page and the command line say the same thing
// ---------------------------------------------------------------------------

describe('a página concorda com a linha de comando', () => {
  it.each(EXEMPLOS)('%s: mesmo veredito nos dois', (nome) => {
    const { bytes, doc } = lerExemplo(nome)
    const tipo = nucleo.detectarTipo(nome, bytes, doc).tipo
    const web = nucleo.validarDocumento(doc, tipo, VALIDADORES)
    const cli = vereditoDoCli(doc, tipo)
    expect(web.valido).toBe(cli.valido)
    expect(web.tipo).toBe(tipo)
  })

  it('os cinco exemplos passam, como no `npm run validar -- --todos`', () => {
    for (const nome of EXEMPLOS) {
      const { bytes, doc } = lerExemplo(nome)
      const tipo = nucleo.detectarTipo(nome, bytes, doc).tipo
      expect(nucleo.validarDocumento(doc, tipo, VALIDADORES).valido, nome).toBe(true)
    }
  })

  it('o esquema compilado dá o mesmo resultado que o Ajv do CLI, erro a erro', () => {
    // Six defects planted in a file that was valid a line ago. Both validators
    // have to find the same set — that is the whole promise of this page.
    const doc = JSON.parse(readFileSync(join(exemplos, 'heroi.bone'), 'utf8'))
    delete doc.bone.minVersion
    doc.bones[2].rotation = 'noventa'
    doc.bones[3].parent = 'osso_que_nao_existe'
    doc.bones[5].name = doc.bones[4].name
    doc.slots[0].blend = 'arco-iris'

    const cli = vereditoDoCli(doc, 'esqueleto')
    const web = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    expect(cli.valido).toBe(false)
    expect(web.valido).toBe(false)

    // Same schema errors: same pointers, same keywords.
    const doCli = new Set(cli.erros)
    const daWeb = new Set(
      web.problemas.filter(p => p.origem === 'esquema').map(p => `${p.ponteiro || '/'} ${p.chave}`),
    )
    expect([...daWeb].sort()).toEqual([...doCli].sort())

    // Same semantic errors on both sides. Since the rascunho 0.2 the núcleo
    // also checks the references by name (4.7), so renaming bone 5 on top of
    // bone 4 drags along every slot and timeline that pointed at the old name:
    // the count is whatever the rules find, and it has to be the SAME on both
    // sides, with the three planted pointers among them.
    const daRegra = web.problemas.filter(p => p.origem === 'regra' && p.gravidade === 'erro')
    expect(daRegra).toHaveLength(cli.semanticos.length)
    expect(daRegra.length).toBeGreaterThanOrEqual(3)
    const ponteiros = daRegra.map(p => p.ponteiro)
    expect(ponteiros).toContain('/bones/3/parent')
    expect(ponteiros).toContain('/bones/5/name')
    expect(ponteiros.some(p => p.startsWith('/slots/') && p.endsWith('/bone'))).toBe(true)
  })

  it('o atlas quebrado cai nas mesmas cinco regras nos dois lados', () => {
    const doc = JSON.parse(readFileSync(join(exemplos, 'heroi.atlas.json'), 'utf8'))
    doc.regions[0].rotation = 45
    doc.regions[1].name = doc.regions[2].name
    doc.regions[3].x = 9000
    doc.regions[4].page = 7

    const cli = vereditoDoCli(doc, 'atlas')
    const web = nucleo.validarDocumento(doc, 'atlas', VALIDADORES)
    expect(cli.valido).toBe(false)
    expect(web.valido).toBe(false)
    expect(web.problemas.filter(p => p.gravidade === 'erro')).toHaveLength(
      cli.erros.length + cli.semanticos.length,
    )
    const ponteiros = web.problemas.map(p => p.ponteiro)
    expect(ponteiros).toContain('/regions/0/rotation')
    expect(ponteiros).toContain('/regions/2/name')
    expect(ponteiros).toContain('/regions/3/x')
    expect(ponteiros).toContain('/regions/4/page')
  })

  it('o arquivo quebrado de propósito da página traz os seis defeitos combinados', () => {
    // `site/validador/exemplo-com-erro.bone` é o que o botão "ver um arquivo
    // com erro" carrega. Se um dia ele passar a ser válido, o botão vira
    // mentira — e este teste cai antes disso.
    const caminho = join(raiz, 'site', 'validador', 'exemplo-com-erro.bone')
    const texto = readFileSync(caminho, 'utf8')
    const doc = JSON.parse(texto)

    const cli = vereditoDoCli(doc, 'esqueleto')
    expect(cli.valido).toBe(false)

    const web = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    expect(web.valido).toBe(false)
    const erros = web.problemas.filter(p => p.gravidade === 'erro')
    expect(erros).toHaveLength(6)
    expect(erros.map(p => p.ponteiro).sort()).toEqual([
      '/bone', '/bones', '/bones/2/rotation', '/bones/3/parent', '/bones/5/name', '/slots/0/blend',
    ])

    // Every problem points at a line that really exists in the file.
    const linhas = nucleo.mapaDeLinhas(texto)
    const total = texto.split('\n').length
    for (const p of erros) {
      let caminhoAtual = p.ponteiro
      let linha: number | undefined
      while ((linha = linhas.get(caminhoAtual)) === undefined && caminhoAtual !== '') {
        caminhoAtual = caminhoAtual.slice(0, caminhoAtual.lastIndexOf('/'))
      }
      expect(linha, p.ponteiro).toBeGreaterThan(0)
      expect(linha, p.ponteiro).toBeLessThanOrEqual(total)
    }
  })

  it('vinte e um defeitos plantados, um de cada vez, e os dois lados batem sempre', () => {
    // One defect at a time, so nothing hides behind anything else. This is the
    // check that catches an `esquema-compilado.js` left behind after the schema
    // changed: rebuild it with `node site/validador/construir-esquema.mjs`.
    const defeitos: Array<[string, (d: any) => void]> = [
      ['sem bone', d => { delete d.bone }],
      ['sem bones', d => { delete d.bones }],
      ['bones vazio', d => { d.bones = [] }],
      ['bone não é objeto', d => { d.bone = 'oi' }],
      ['version com formato errado', d => { d.bone.version = '1' }],
      ['created não é data', d => { d.bone.created = 'ontem' }],
      ['osso sem nome', d => { delete d.bones[1].name }],
      ['nome de osso vazio', d => { d.bones[1].name = '' }],
      ['rotation texto', d => { d.bones[1].rotation = 'x' }],
      ['slot sem osso', d => { delete d.slots[0].bone }],
      ['blend fora da lista', d => { d.slots[0].blend = 'arco-iris' }],
      ['cor com 3 números', d => { d.slots[0].color = [1, 1, 1] }],
      ['cor fora de 0..1', d => { d.slots[0].color = [2, 0, 0, 1] }],
      ['skin sem nome', d => { delete d.skins[0].name }],
      ['constraint sem tipo', d => { delete d.constraints[0].type }],
      ['constraint com mix inválido', d => { d.constraints[0].mix = 5 }],
      ['animação sem nome', d => { delete d.animations[0].name }],
      ['timeline sem keys', d => { delete d.animations[0].timelines[0].keys }],
      ['key sem time', d => { delete d.animations[0].timelines[0].keys[0].time }],
      ['extensão com nome torto', d => { d.extensionsUsed = ['minhaextensao'] }],
      ['tags repetidas', d => { d.tags = ['a', 'a'] }],
    ]

    const original = readFileSync(join(exemplos, 'heroi.bone'), 'utf8')
    for (const [rotulo, quebrar] of defeitos) {
      const doc = JSON.parse(original)
      quebrar(doc)
      const cli = vereditoDoCli(doc, 'esqueleto')
      const web = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
      expect(cli.valido, rotulo).toBe(false)
      expect(web.valido, rotulo).toBe(false)
      // The schema errors are the same set on both sides, before the page
      // trims the `anyOf` noise for the reader.
      VALIDADORES.esqueleto(doc)
      const daWeb = nucleo.enxugarErros(VALIDADORES.esqueleto.errors ?? [])
      expect(daWeb.length, rotulo).toBeGreaterThan(0)
      for (const e of daWeb) {
        expect(cli.erros, `${rotulo} → ${e.instancePath}`).toContain(`${e.instancePath || '/'} ${e.keyword}`)
      }
    }
  })

  it('o manifesto com principal fora da lista é recusado nos dois lados', () => {
    const doc = JSON.parse(readFileSync(join(exemplos, 'manifest.json'), 'utf8'))
    doc.main = 'outro.bone'
    expect(vereditoDoCli(doc, 'manifesto').valido).toBe(false)
    const web = nucleo.validarDocumento(doc, 'manifesto', VALIDADORES)
    expect(web.valido).toBe(false)
    expect(web.problemas[0].ponteiro).toBe('/main')
    expect(web.problemas[0].regra).toBe('2.9')
  })
})

// ---------------------------------------------------------------------------
// Classifying a problem
// ---------------------------------------------------------------------------

describe('classificar problema', () => {
  it('escreve em português, sem sobra da mensagem em inglês do Ajv', () => {
    const doc = JSON.parse(readFileSync(join(exemplos, 'minimo.bone'), 'utf8'))
    delete doc.bone.generator
    doc.bones[0].name = ''
    doc.slots[0].bone = 42

    const web = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    expect(web.valido).toBe(false)
    for (const p of web.problemas) {
      expect(p.texto).not.toMatch(/\bmust\b|\bshould\b|\bproperty\b/)
      expect(p.texto.length).toBeGreaterThan(10)
      expect(p.regra).toMatch(/^\d+\.\d+$/)
    }
    const textos = web.problemas.map(p => p.texto)
    expect(textos).toContain('Falta a propriedade obrigatória "generator".')
  })

  it('dá a gravidade certa: erro derruba o arquivo, aviso não', () => {
    const doc = JSON.parse(readFileSync(join(exemplos, 'minimo.bone'), 'utf8'))
    const web = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    // `minimo.bone` é válido e ainda assim tem o que dizer: sem atlas e sem
    // animação. Aviso nunca vira erro.
    expect(web.valido).toBe(true)
    expect(web.problemas.length).toBeGreaterThan(0)
    expect(web.problemas.every(p => p.gravidade === 'aviso')).toBe(true)
    expect(nucleo.frasePlacar(web)).toBe('Arquivo válido. 2 avisos.')
  })

  it('cita a seção da especificação pelo lugar onde o problema está', () => {
    expect(nucleo.regraDoPonteiro('/bones/3/parent', 'esqueleto')).toBe('4.2')
    expect(nucleo.regraDoPonteiro('/slots/0/blend', 'esqueleto')).toBe('4.3')
    expect(nucleo.regraDoPonteiro('/animations/1/timelines/0', 'esqueleto')).toBe('9.1')
    expect(nucleo.regraDoPonteiro('/constraints/0/mix', 'esqueleto')).toBe('6.1')
    expect(nucleo.regraDoPonteiro('/bone/version', 'esqueleto')).toBe('2.3')
    expect(nucleo.regraDoPonteiro('/regions/2/x', 'atlas')).toBe('10.3')
    expect(nucleo.regraDoPonteiro('/pages/0/width', 'atlas')).toBe('10.2')
    expect(nucleo.regraDoPonteiro('/main', 'manifesto')).toBe('2.9')
  })

  it('enxuga a explosão de erros de `anyOf`, guardando o erro do galho', () => {
    const doc = JSON.parse(readFileSync(join(exemplos, 'heroi.bone'), 'utf8'))
    // A constraint of an unknown shape makes Ajv try every branch and report
    // one failure per branch. The reader wants one line, not fifteen.
    doc.constraints[0] = { name: 'torto', type: 'ik', bones: [], target: 5 }
    const web = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    expect(web.valido).toBe(false)
    const noPonto = web.problemas.filter(p => p.ponteiro.startsWith('/constraints/0'))
    expect(noPonto.length).toBeGreaterThan(0)
    expect(noPonto.length).toBeLessThan(6)
  })
})

// ---------------------------------------------------------------------------
// Pointer to line
// ---------------------------------------------------------------------------

describe('achar a linha do ponteiro', () => {
  it('acha a linha de um JSON escrito à mão', () => {
    const texto = [
      '{',                       // 1
      '  "bone": {',             // 2
      '    "version": "1.0"',    // 3
      '  },',                    // 4
      '  "bones": [',            // 5
      '    { "name": "root" },', // 6
      '    { "name": "hips" }',  // 7
      '  ]',                     // 8
      '}',                       // 9
    ].join('\n')
    const linhas = nucleo.mapaDeLinhas(texto)
    expect(linhas.get('')).toBe(1)
    expect(linhas.get('/bone')).toBe(2)
    expect(linhas.get('/bone/version')).toBe(3)
    expect(linhas.get('/bones')).toBe(5)
    expect(linhas.get('/bones/0')).toBe(6)
    expect(linhas.get('/bones/1/name')).toBe(7)
  })

  it('a linha que ele aponta no heroi.bone traz mesmo aquela propriedade', () => {
    const { texto } = lerExemplo('heroi.bone')
    const linhas = nucleo.mapaDeLinhas(texto)
    const emLinhas = texto.split('\n')
    for (const ponteiro of ['/bone/version', '/bones/0/name', '/slots/0/bone', '/animations/0/name']) {
      const linha = linhas.get(ponteiro)
      expect(linha, ponteiro).toBeGreaterThan(0)
      const chave = ponteiro.slice(ponteiro.lastIndexOf('/') + 1)
      expect(emLinhas[(linha as number) - 1], ponteiro).toContain(`"${chave}"`)
    }
  })

  it('escapa e desescapa segmento com barra e til (RFC 6901)', () => {
    expect(nucleo.escaparPonteiro('a/b')).toBe('a~1b')
    expect(nucleo.escaparPonteiro('a~b')).toBe('a~0b')
    expect(nucleo.desescaparPonteiro('a~1b')).toBe('a/b')
    expect(nucleo.desescaparPonteiro('a~0b')).toBe('a~b')
  })

  it('não trava com JSON quebrado: devolve o que conseguiu ler', () => {
    const linhas = nucleo.mapaDeLinhas('{\n  "bone": {\n    "version": "1.0"\n')
    expect(linhas.get('/bone/version')).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// The summary
// ---------------------------------------------------------------------------

describe('montar o resumo do conteúdo', () => {
  it('as contas do heroi.bone batem com o próprio arquivo', () => {
    const { doc } = lerExemplo('heroi.bone')
    const resumo = nucleo.resumirConteudo(doc, 'esqueleto')
    const contas = Object.fromEntries(resumo.contas)

    expect(contas.Ossos).toBe(doc.bones.length)
    expect(contas.Slots).toBe(doc.slots.length)
    expect(contas.Peles).toBe(doc.skins.length)
    expect(contas.Regras).toBe(doc.constraints.length)
    expect(contas['Animações']).toBe(doc.animations.length)

    // Counted straight off the raw JSON, not off the summary's own code.
    const desenhos = doc.skins.reduce(
      (soma: number, pele: any) => soma + Object.values(pele.attachments ?? {})
        .reduce((s: number, porSlot: any) => s + Object.keys(porSlot).length, 0),
      0)
    expect(contas.Desenhos).toBe(desenhos)

    const trilhas = doc.animations.reduce((s: number, a: any) => s + a.timelines.length, 0)
    const chaves = doc.animations.reduce(
      (s: number, a: any) => s + a.timelines.reduce((t: number, tl: any) => t + tl.keys.length, 0), 0)
    expect(contas.Trilhas).toBe(trilhas)
    expect(contas.Chaves).toBe(chaves)
  })

  it('lê o cabeçalho e a lista de animações do heroi.bone', () => {
    const { doc } = lerExemplo('heroi.bone')
    const resumo = nucleo.resumirConteudo(doc, 'esqueleto')
    expect(resumo.versao).toBe(doc.bone.version)
    expect(resumo.versaoMinima).toBe(doc.bone.minVersion)
    expect(resumo.programa).toBe(doc.bone.generator)
    expect(resumo.animacoes?.map(a => a.nome)).toEqual(doc.animations.map((a: any) => a.name))
    expect(resumo.atlases).toEqual(doc.assets.atlases)
  })

  it('nomeia os recursos que o arquivo realmente usa', () => {
    const { doc } = lerExemplo('heroi.bone')
    const recursos = nucleo.resumirConteudo(doc, 'esqueleto').recursos
    // The example file was built to exercise the whole format.
    for (const esperado of ['mesh', 'linkedmesh', 'boundingbox', 'clipping', 'point',
      'skeleton', 'ik', 'transform', 'caminho', 'fisica', 'driver', 'deform']) {
      expect(recursos, esperado).toContain(esperado)
    }
    // Every reported feature has a name a person can read.
    for (const r of recursos) expect(nucleo.NOME_DO_RECURSO[r], r).toBeTruthy()
  })

  it('não inventa recurso que o arquivo não usa', () => {
    const { doc } = lerExemplo('minimo.bone')
    const recursos = nucleo.resumirConteudo(doc, 'esqueleto').recursos
    expect(recursos).toEqual(['region'])
  })

  it('resume o atlas com páginas, regiões, giradas e aparadas', () => {
    const { doc } = lerExemplo('heroi.atlas.json')
    const resumo = nucleo.resumirConteudo(doc, 'atlas')
    const contas = Object.fromEntries(resumo.contas)
    expect(contas['Páginas']).toBe(doc.pages.length)
    expect(contas['Regiões']).toBe(doc.regions.length)
    expect(contas.Giradas).toBe(doc.regions.filter((r: any) => r.rotation === 90).length)
    expect(resumo.imagens).toEqual(doc.pages.map((p: any) => p.image))
  })

  it('resume o manifesto com as três listas', () => {
    const { doc } = lerExemplo('manifest.json')
    const resumo = nucleo.resumirConteudo(doc, 'manifesto')
    expect(Object.fromEntries(resumo.contas)).toEqual({
      Esqueletos: doc.skeletons.length,
      Atlas: doc.atlases.length,
      Imagens: doc.images.length,
    })
    expect(resumo.nome).toBe(doc.main)
  })
})

// ---------------------------------------------------------------------------
// The one-line verdict
// ---------------------------------------------------------------------------

describe('frase do placar', () => {
  it('conta erro e aviso em português, no singular e no plural', () => {
    const frase = (problemas: Array<{ gravidade: 'erro' | 'aviso' }>) =>
      nucleo.frasePlacar({ valido: problemas.every(p => p.gravidade !== 'erro'), tipo: 'esqueleto', problemas: problemas as never })
    expect(frase([])).toBe('Arquivo válido. Nenhum problema.')
    expect(frase([{ gravidade: 'aviso' }])).toBe('Arquivo válido. 1 aviso.')
    expect(frase([{ gravidade: 'erro' }])).toBe('Arquivo inválido. 1 erro.')
    expect(frase([{ gravidade: 'erro' }, { gravidade: 'erro' }, { gravidade: 'aviso' }]))
      .toBe('Arquivo inválido. 2 erros e 1 aviso.')
  })
})
