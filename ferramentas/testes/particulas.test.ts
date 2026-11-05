// SPDX-License-Identifier: Apache-2.0
//
// A extensão `BONE_particles` — degrau 12, parte 1.
//
// Este arquivo é o da PARTE (regra 16 da casa): todo teste de partícula no
// formato mora aqui, e nunca num `loteNN.test.ts`.
//
// O que ele prova, em ordem:
//   1. o hash PCG dá os cinco números de referência da spec da extensão;
//   2. `"BONE_particle"` passa no `bone.schema.json` do núcleo — o ponto que o
//      encargo mandou NÃO resolver no escuro;
//   3. o schema da extensão é aplicado PELO NOME, e pega defeito que o núcleo
//      deixava passar (§12.7);
//   4. a página e a linha de comando dão o mesmo veredito.
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import * as nucleo from '../../site/validador/nucleo.js'
import type { RegistroDeExtensoes, Validadores } from '../../site/validador/nucleo.js'
import {
  validateAtlas, validateManifest, validateSkeleton,
} from '../../site/validador/esquema-compilado.js'
import { registroDeExtensoes, extensoesRegistradas } from '../../site/validador/extensoes-compiladas.js'
// Rodada 15: o dump, para provar a §9.10 e que sem ela nada muda.
import { loadSkeletonData } from '../../runtime/src/loader.js'
import {
  buildPoseDump, comparePoseDump, formatPoseDump, TOLERANCES, type Probe,
} from '../src/conformidade/pose-dump.js'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')
const exemploParticulas = join(raiz, 'formato', 'exemplos', 'particulas.bone')
const schemaNucleo = join(raiz, 'formato', 'bone.schema.json')
const schemaExtensao = join(raiz, 'formato', 'extensions', 'BONE_particles.schema.json')

const VALIDADORES: Validadores = {
  esqueleto: validateSkeleton,
  atlas: validateAtlas,
  manifesto: validateManifest,
}

/** Uma cópia nova do exemplo a cada teste: nenhum teste suja o do vizinho. */
function exemplo(): any {
  return JSON.parse(readFileSync(exemploParticulas, 'utf8'))
}

function emissorDe(doc: any): any {
  return doc.skins[0].attachments.cachimbo_fumaca.fumaca
}

// ---------------------------------------------------------------------------
// 1. O acaso
// ---------------------------------------------------------------------------

/** O `pcg` da §3.2 da spec da extensão, escrito como a tabela de linguagens manda. */
function pcg(v: number): number {
  const state = (Math.imul(v >>> 0, 747796405) + 2891336453) >>> 0
  const word = Math.imul((state >>> ((state >>> 28) + 4)) ^ state, 277803737) >>> 0
  return ((word >>> 22) ^ word) >>> 0
}

/** `acaso(semente, fluxo, indice, canal)` — devolve `u` em [0, 1). */
function acaso(semente: number, fluxo: number, indice: number, canal: number): number {
  let h = pcg(semente)
  h = pcg((h ^ (fluxo >>> 0)) >>> 0)
  h = pcg((h ^ (indice >>> 0)) >>> 0)
  h = pcg((h ^ (canal >>> 0)) >>> 0)
  return (h >>> 8) / 16777216
}

describe('o acaso: PCG de 32 bits (§3.2 da extensão)', () => {
  it('dá os cinco números de referência, exatos', () => {
    // Estes cinco estão escritos na spec da extensão e foram conferidos em
    // Node e em Python, mesmo bit. Um runtime que não os reproduza NÃO
    // implementa P, e é a primeira coisa a conferir antes de qualquer caso.
    expect(pcg(0)).toBe(129708002)
    expect(pcg(42)).toBe(1223963391)
    expect(pcg(0xFFFFFFFF)).toBe(3861530882)
    expect(acaso(42, 0, 7, 0)).toBe(0.4190843105316162)
    expect(acaso(42, 0, -3, 0)).toBe(0.5181800723075867)
  })

  it('cabe exato em 24 bits, como a spec promete', () => {
    // `(h >> 8) / 2^24`: o numerador é inteiro e menor que 2^24, então o valor
    // sobrevive a float32 sem perder um bit. É o que permite a um runtime em
    // float32 tirar o mesmo `u` que um em float64.
    for (let i = 0; i < 200; i++) {
      const u = acaso(42, 0, i, i % 13)
      expect(u).toBeGreaterThanOrEqual(0)
      expect(u).toBeLessThan(1)
      expect(Number.isInteger(u * 16777216)).toBe(true)
      expect(Math.fround(u)).toBe(u)
    }
  })

  it('o índice negativo entra por complemento de dois, e não é o mesmo do positivo', () => {
    // O pré-aquecimento (§6) nasce com índices negativos. Se o hash tratasse
    // −3 como 3, a volta anterior repetiria a atual.
    expect(acaso(42, 0, -3, 0)).not.toBe(acaso(42, 0, 3, 0))
    expect(acaso(42, 0, -3, 0)).toBe(acaso(42, 0, 0xFFFFFFFD, 0))
  })

  it('cada canal é uma semente independente: nenhum repete o do vizinho', () => {
    const vistos = new Set<number>()
    for (let canal = 0; canal <= 12; canal++) vistos.add(acaso(42, 0, 7, canal))
    expect(vistos.size).toBe(13)
  })
})

// ---------------------------------------------------------------------------
// 2. O tipo prefixado no schema do núcleo
// ---------------------------------------------------------------------------

describe('"BONE_particle" contra o `bone.schema.json` (§2.7)', () => {
  it('passa: o `anyOf` do attachmentType tem o ramo de tipo prefixado', () => {
    // O encargo mandou conferir isto e NÃO decidir no escuro: o enum dos oito
    // tipos do núcleo é fechado, mas ele mora num `anyOf` com
    // `coreOrExtensionType`, que é o regex de nome da §2.7. Não há defeito do
    // schema — e este teste existe para ninguém ter de reconferir.
    const doc = exemplo()
    expect(validateSkeleton(doc), JSON.stringify(validateSkeleton.errors)).toBe(true)
  })

  it('o ramo prefixado é o regex da §2.7, e recusa nome torto', () => {
    const schema = JSON.parse(readFileSync(schemaNucleo, 'utf8'))
    const ramos = schema.definitions.attachmentType.anyOf
    expect(ramos).toHaveLength(2)
    expect(ramos[0].enum).toContain('region')
    expect(ramos[0].enum).not.toContain('BONE_particle')
    expect(ramos[1].$ref).toBe('#/definitions/coreOrExtensionType')
    expect(schema.definitions.coreOrExtensionType.pattern)
      .toBe('^[A-Z][A-Z0-9]{1,7}_[a-z0-9_]+$')

    // O tipo sem prefixo não é aceito por nenhum dos dois ramos: é o que
    // segura a regra "ninguém escreve `type: particle` sem prefixo".
    const doc = exemplo()
    emissorDe(doc).type = 'particle'
    expect(validateSkeleton(doc)).toBe(false)
  })

  it('a timeline da extensão também é prefixada, e passa', () => {
    const doc = exemplo()
    expect(doc.animations[0].timelines[0].type).toBe('BONE_particle')
    expect(validateSkeleton(doc)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 3. O schema da extensão, aplicado pelo nome
// ---------------------------------------------------------------------------

/** Ajv montado como em `ferramentas/validador/validar.mjs`, para o registro do CLI. */
function registroComoNoCli(): RegistroDeExtensoes {
  const esquema = JSON.parse(readFileSync(schemaExtensao, 'utf8'))
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
  addFormats(ajv)
  return {
    [esquema['x-extension']]: {
      validar: ajv.compile(esquema),
      tiposDeAnexo: esquema['x-attachment-types'],
      tiposDeTimeline: esquema['x-timeline-types'],
    },
  }
}

describe('o schema da extensão é aplicado pelo nome (§12.7)', () => {
  it('o registro compilado da página traz a `BONE_particles`', () => {
    expect(Object.keys(registroDeExtensoes)).toContain('BONE_particles')
    expect(registroDeExtensoes.BONE_particles.tiposDeAnexo).toEqual(['BONE_particle'])
  })

  it('o exemplo bom passa nos dois registros', () => {
    const doc = exemplo()
    expect(nucleo.checarExtensoes(doc, registroDeExtensoes)).toEqual([])
    expect(nucleo.checarExtensoes(doc, registroComoNoCli())).toEqual([])
  })

  it('sem registro não acusa nada: não conhecer a extensão não é erro (§2.5)', () => {
    const doc = exemplo()
    emissorDe(doc).rate = -5
    expect(nucleo.checarExtensoes(doc, undefined)).toEqual([])
    expect(nucleo.checarExtensoes(doc, {})).toEqual([])
  })

  it.each([
    ['rate negativo', (e: any) => { e.rate = -5 }, '/rate'],
    ['maxParticles acima do teto de 10 000', (e: any) => { e.maxParticles = 99999 }, '/maxParticles'],
    ['shape que não existe', (e: any) => { e.shape = 'triangulo' }, '/shape'],
    ['seed negativa', (e: any) => { e.seed = -1 }, '/seed'],
    ['lifetime com um número só', (e: any) => { e.lifetime = [1] }, '/lifetime'],
    ['space fora da lista', (e: any) => { e.space = 'galaxia' }, '/space'],
    ['sortMode fora da lista', (e: any) => { e.sortMode = 'aoAcaso' }, '/sortMode'],
    ['shape mesh sem o campo mesh', (e: any) => { e.shape = 'mesh' }, ''],
  ])('pega %s, que o schema do núcleo deixava passar', (_nome, estragar, sufixo) => {
    const doc = exemplo()
    estragar(emissorDe(doc))

    // O núcleo sozinho continua dizendo que está tudo bem: `additionalProperties`
    // é `true` por desenho (§2.5), e o conteúdo da extensão não é dele.
    expect(validateSkeleton(doc)).toBe(true)

    for (const registro of [registroDeExtensoes, registroComoNoCli()]) {
      const problemas = nucleo.checarExtensoes(doc, registro)
      expect(problemas.length).toBeGreaterThan(0)
      expect(problemas[0].codigo).toBe('EXT_SCHEMA')
      expect(problemas[0].regra).toBe('2.7')
      expect(problemas.some(p =>
        p.ponteiro === `/skins/0/attachments/cachimbo_fumaca/fumaca${sufixo}`)).toBe(true)
    }
  })

  it('o ponteiro aponta para o campo, não para o arquivo', () => {
    const doc = exemplo()
    emissorDe(doc).rate = -5
    const [p] = nucleo.checarExtensoes(doc, registroDeExtensoes)
    expect(p.ponteiro).toBe('/skins/0/attachments/cachimbo_fumaca/fumaca/rate')
    expect(p.texto).toContain('BONE_particles')
  })

  it('anexo de outra extensão, que não está no registro, passa direto', () => {
    const doc = exemplo()
    doc.skins[0].attachments.cachimbo_fumaca.outro = { type: 'ACME_ribbon', qualquerCoisa: 1 }
    expect(nucleo.checarExtensoes(doc, registroDeExtensoes)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// 4. A página e a linha de comando não divergem
// ---------------------------------------------------------------------------

describe('a página e a linha de comando dão o mesmo veredito', () => {
  it('o exemplo de partículas é válido nos dois, com o registro ligado', () => {
    const doc = exemplo()
    const web = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { extensoes: registroDeExtensoes })
    expect(web.valido).toBe(true)
  })

  it('e inválido nos dois quando o emissor está torto', () => {
    const doc = exemplo()
    emissorDe(doc).rate = -5
    const comRegistro = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { extensoes: registroDeExtensoes })
    const comCli = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { extensoes: registroComoNoCli() })
    expect(comRegistro.valido).toBe(false)
    expect(comCli.valido).toBe(false)
  })

  it('o buraco que o registro fecha: um defeito que SÓ o schema da extensão pega', () => {
    // Este teste dizia outra coisa no lote 1 — que `rate: -5` passava sem o
    // registro — e o lote 2 tornou isso falso: `RANGE_PARTICLE_RATE` é regra
    // semântica e não precisa de registro nenhum. Reescrito, não apagado.
    //
    // Para mostrar o buraco é preciso um defeito que a regra semântica NÃO
    // cobre e o schema da extensão sim: um `space` que não existe. Sem o
    // registro, o arquivo passa por válido; com ele, não.
    const doc = exemplo()
    emissorDe(doc).space = 'galaxia'

    expect(nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES).valido).toBe(true)
    expect(nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES,
      { extensoes: registroDeExtensoes }).valido).toBe(false)
    expect(nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES,
      { extensoes: registroComoNoCli() }).valido).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 5. Os cinco códigos do validador (lote 2)
// ---------------------------------------------------------------------------

/** Só os códigos dos problemas, na ordem em que saíram. */
function codigos(problemas: Array<{ codigo?: string }>): string[] {
  return problemas.map(p => p.codigo!).filter(Boolean)
}

describe('RANGE_PARTICLE_MINMAX (L1)', () => {
  it.each(['lifetime', 'speed', 'angle', 'angularVelocity', 'scale', 'startFrame'])(
    'pega a faixa "%s" de trás para frente', (campo) => {
      const doc = exemplo()
      emissorDe(doc)[campo] = [9, 1]
      const p = nucleo.checarParticulas(doc)
      expect(codigos(p)).toContain('RANGE_PARTICLE_MINMAX')
      const achado = p.find(x => x.codigo === 'RANGE_PARTICLE_MINMAX')!
      expect(achado.gravidade).toBe('erro')
      expect(achado.ponteiro).toBe(`/skins/0/attachments/cachimbo_fumaca/fumaca/${campo}`)
    })

  it('min igual a max é legítimo: não acusa', () => {
    const doc = exemplo()
    emissorDe(doc).speed = [100, 100]
    expect(codigos(nucleo.checarParticulas(doc))).not.toContain('RANGE_PARTICLE_MINMAX')
  })

  it('o exemplo bom não acusa nada', () => {
    expect(nucleo.checarParticulas(exemplo())).toEqual([])
  })
})

describe('RANGE_PARTICLE_RATE (L1)', () => {
  it('pega a taxa negativa no anexo', () => {
    const doc = exemplo()
    emissorDe(doc).rate = -5
    const p = nucleo.checarParticulas(doc)
    expect(codigos(p)).toContain('RANGE_PARTICLE_RATE')
    expect(p.find(x => x.codigo === 'RANGE_PARTICLE_RATE')!.gravidade).toBe('erro')
  })

  it('pega a taxa negativa numa chave, que o campo parado esconderia', () => {
    const doc = exemplo()
    const tl = doc.animations[0].timelines[0]
    tl.property = 'rate'
    tl.keys = [{ time: 0, value: 10 }, { time: 1, value: -3 }]
    const p = nucleo.checarParticulas(doc)
    expect(codigos(p)).toContain('RANGE_PARTICLE_RATE')
    expect(p.find(x => x.codigo === 'RANGE_PARTICLE_RATE')!.ponteiro)
      .toBe('/animations/0/timelines/0/keys/1/value')
  })
})

describe('RANGE_PARTICLE_RATE_CURVE (L2)', () => {
  it('avisa quando a chave de taxa tem Bézier, e é aviso, não erro', () => {
    const doc = exemplo()
    const tl = doc.animations[0].timelines[0]
    tl.property = 'rate'
    tl.keys = [{ time: 0, value: 0, curve: [0.1, 0, 0.3, 40] }, { time: 1, value: 40 }]
    const p = nucleo.checarParticulas(doc)
    const achado = p.find(x => x.codigo === 'RANGE_PARTICLE_RATE_CURVE')!
    expect(achado).toBeDefined()
    expect(achado.gravidade).toBe('aviso')
    expect(achado.ponteiro).toBe('/animations/0/timelines/0/keys/0/curve')
  })

  it('"linear" e "stepped" passam: são as duas que dão integral exata', () => {
    const doc = exemplo()
    const tl = doc.animations[0].timelines[0]
    tl.property = 'rate'
    tl.keys = [{ time: 0, value: 0, curve: 'linear' }, { time: 1, value: 40, curve: 'stepped' }]
    expect(codigos(nucleo.checarParticulas(doc))).not.toContain('RANGE_PARTICLE_RATE_CURVE')
  })
})

describe('REF_PARTICLE_MESH (L1)', () => {
  it('pega a malha que não existe', () => {
    const doc = exemplo()
    const e = emissorDe(doc)
    e.shape = 'mesh'
    e.mesh = 'nuvem'
    const p = nucleo.checarParticulas(doc)
    expect(codigos(p)).toContain('REF_PARTICLE_MESH')
    expect(p.find(x => x.codigo === 'REF_PARTICLE_MESH')!.gravidade).toBe('erro')
  })

  it('pega a malha que existe NOUTRO slot: tem de ser o mesmo', () => {
    // É a regra que o encargo pede em letras: "não aponta para um `mesh` do
    // MESMO slot". A malha de outro slot está presa a outro osso, e os
    // vértices que ela deforma não são os que o emissor usaria.
    const doc = exemplo()
    doc.slots.push({ name: 'outro', bone: 'root', attachment: 'nuvem' })
    doc.skins[0].attachments.outro = {
      nuvem: { type: 'mesh', path: 'nuvem', uvs: [0, 0, 1, 0, 1, 1], triangles: [0, 1, 2], vertices: [0, 0, 1, 0, 1, 1] },
    }
    const e = emissorDe(doc)
    e.shape = 'mesh'
    e.mesh = 'nuvem'
    expect(codigos(nucleo.checarParticulas(doc))).toContain('REF_PARTICLE_MESH')
  })

  it('a malha certa, no mesmo slot, passa', () => {
    const doc = exemplo()
    doc.skins[0].attachments.cachimbo_fumaca.nuvem = {
      type: 'mesh', path: 'nuvem', uvs: [0, 0, 1, 0, 1, 1], triangles: [0, 1, 2], vertices: [0, 0, 1, 0, 1, 1],
    }
    const e = emissorDe(doc)
    e.shape = 'mesh'
    e.mesh = 'nuvem'
    expect(codigos(nucleo.checarParticulas(doc))).not.toContain('REF_PARTICLE_MESH')
  })
})

describe('REF_PARTICLE_CURVE (L1) — a forma path, extensão 1.1 (§9.4.2)', () => {
  /** Um caminho de duas âncoras, num slot próprio, como o `cape_path` do herói. */
  function comTrilha(nomeDoCaminho = 'caminho', tipo = 'path'): any {
    const doc = exemplo()
    doc.slots.push({ name: 'trilha', bone: 'root', attachment: nomeDoCaminho })
    doc.skins[0].attachments.trilha = {
      [nomeDoCaminho]: tipo === 'path'
        ? { type: 'path', lengths: [300], vertices: [0, 0, 0, 0, 100, 0, 200, 0, 300, 0, 300, 0] }
        : { type: tipo },
    }
    return doc
  }

  it('o caminho certo, em OUTRO slot, passa', () => {
    const doc = comTrilha()
    const e = emissorDe(doc)
    e.shape = 'path'
    e.curve = 'trilha/caminho'
    expect(codigos(nucleo.checarParticulas(doc))).not.toContain('REF_PARTICLE_CURVE')
  })

  it('o slot vem antes da PRIMEIRA barra: placeholder com barra passa', () => {
    const doc = comTrilha('capa/borda')
    const e = emissorDe(doc)
    e.shape = 'path'
    e.curve = 'trilha/capa/borda'
    expect(codigos(nucleo.checarParticulas(doc))).not.toContain('REF_PARTICLE_CURVE')
  })

  it.each([
    ['sem curve', undefined],
    ['caminho que não existe', 'trilha/outro'],
    ['slot que não existe', 'outro/caminho'],
    ['sem barra', 'caminho'],
  ])('%s: L1', (_nome, curve) => {
    const doc = comTrilha()
    const e = emissorDe(doc)
    e.shape = 'path'
    if (curve !== undefined) e.curve = curve
    const p = nucleo.checarParticulas(doc)
    expect(codigos(p)).toContain('REF_PARTICLE_CURVE')
    expect(p.find(x => x.codigo === 'REF_PARTICLE_CURVE')!.gravidade).toBe('erro')
  })

  it('o anexo existe e não é path: L1', () => {
    const doc = comTrilha('caminho', 'point')
    const e = emissorDe(doc)
    e.shape = 'path'
    e.curve = 'trilha/caminho'
    expect(codigos(nucleo.checarParticulas(doc))).toContain('REF_PARTICLE_CURVE')
  })

  it('o schema 1.1 aceita "path" com curve, e recusa "path" sem curve — nos dois registros', () => {
    for (const registro of [registroComoNoCli(), registroDeExtensoes]) {
      const bom = comTrilha()
      Object.assign(emissorDe(bom), { shape: 'path', curve: 'trilha/caminho' })
      expect(nucleo.checarExtensoes(bom, registro).filter(x => x.gravidade === 'erro')).toEqual([])
      const sem = comTrilha()
      emissorDe(sem).shape = 'path'
      expect(nucleo.checarExtensoes(sem, registro).some(x => x.gravidade === 'erro')).toBe(true)
    }
  })
})

describe('LIMIT_PARTICLE_COUNT (L2)', () => {
  it('avisa quando taxa × vida passa de 10 000', () => {
    const doc = exemplo()
    const e = emissorDe(doc)
    e.rate = 9000
    e.lifetime = [1, 2]        // 18 000 vivas
    const p = nucleo.checarParticulas(doc)
    const achado = p.find(x => x.codigo === 'LIMIT_PARTICLE_COUNT')!
    expect(achado).toBeDefined()
    expect(achado.gravidade).toBe('aviso')
    expect(achado.texto).toContain('18000')
  })

  it('olha a MAIOR taxa das chaves, não só o número parado', () => {
    // Um emissor com `rate: 1` no anexo e uma chave em 9 000 estouraria o teto
    // e passaria batido se a conta olhasse só o campo.
    const doc = exemplo()
    const e = emissorDe(doc)
    e.rate = 1
    e.lifetime = [1, 2]
    const tl = doc.animations[0].timelines[0]
    tl.property = 'rate'
    tl.keys = [{ time: 0, value: 1 }, { time: 1, value: 9000 }]
    expect(codigos(nucleo.checarParticulas(doc))).toContain('LIMIT_PARTICLE_COUNT')
  })

  it('o exemplo bom (20/s por 1,5 s) fica muito abaixo do teto', () => {
    expect(codigos(nucleo.checarParticulas(exemplo()))).not.toContain('LIMIT_PARTICLE_COUNT')
  })
})

// ---------------------------------------------------------------------------
// 6. extensionsUsed e extensionsRequired (§2.7)
// ---------------------------------------------------------------------------

const REGISTRADAS = new Set(['RECORTE_editor_state', 'BONE_param_grid', 'BONE_pendulum', 'BONE_particles'])

describe('extensionsUsed e extensionsRequired (§2.7)', () => {
  it('o exemplo bom passa: usa a extensão e a declara', () => {
    const doc = exemplo()
    expect(nucleo.checarUsoDeExtensoes(doc, registroDeExtensoes, REGISTRADAS)).toEqual([])
  })

  it('EXT_REQUIRED_NOT_USED é L1, e não um aviso: exigida e não declarada', () => {
    // Isto era um AVISO sem código, e um aviso deixa o arquivo passar por
    // válido. A §12.3 diz L1.
    const doc = exemplo()
    doc.extensionsRequired = ['BONE_pendulum']
    const p = nucleo.checarUsoDeExtensoes(doc, registroDeExtensoes, REGISTRADAS)
    const achado = p.find(x => x.codigo === 'EXT_REQUIRED_NOT_USED')!
    expect(achado).toBeDefined()
    expect(achado.gravidade).toBe('erro')
    expect(achado.ponteiro).toBe('/extensionsRequired/0')
  })

  it('EXT_REQUIRED_NOT_USED: o arquivo USA a extensão e não a lista', () => {
    // O caso que morde: um leitor decide o que consegue mostrar lendo
    // `extensionsUsed`. Sem o nome lá, ele diz que abriu tudo e não abriu.
    const doc = exemplo()
    doc.extensionsUsed = []
    const p = nucleo.checarUsoDeExtensoes(doc, registroDeExtensoes, REGISTRADAS)
    const achado = p.find(x => x.codigo === 'EXT_REQUIRED_NOT_USED')!
    expect(achado).toBeDefined()
    expect(achado.gravidade).toBe('erro')
    expect(achado.texto).toContain('BONE_particles')
  })

  it('acha o uso pelo anexo, pela timeline e pelo bloco `extensions`', () => {
    const soAnexo = exemplo()
    soAnexo.extensionsUsed = []
    delete soAnexo.animations
    expect(nucleo.checarUsoDeExtensoes(soAnexo, registroDeExtensoes, REGISTRADAS)).toHaveLength(1)

    const soTimeline = exemplo()
    soTimeline.extensionsUsed = []
    soTimeline.skins[0].attachments.cachimbo_fumaca.fumaca = { type: 'region', path: 'fx/fumaca' }
    expect(nucleo.checarUsoDeExtensoes(soTimeline, registroDeExtensoes, REGISTRADAS)).toHaveLength(1)

    const soBloco = exemplo()
    soBloco.extensionsUsed = []
    soBloco.skins[0].attachments.cachimbo_fumaca.fumaca = { type: 'region', path: 'fx/fumaca' }
    delete soBloco.animations
    soBloco.bones[0].extensions = { RECORTE_editor_state: { camera: 1 } }
    const p = nucleo.checarUsoDeExtensoes(soBloco, registroDeExtensoes, REGISTRADAS)
    expect(p).toHaveLength(1)
    expect(p[0].texto).toContain('RECORTE_editor_state')
  })

  it('EXT_UNREGISTERED é L2: nome válido, fora do registro', () => {
    const doc = exemplo()
    doc.extensionsUsed = ['BONE_particles', 'ACME_glow']
    const p = nucleo.checarUsoDeExtensoes(doc, registroDeExtensoes, REGISTRADAS)
    const achado = p.find(x => x.codigo === 'EXT_UNREGISTERED')!
    expect(achado).toBeDefined()
    expect(achado.gravidade).toBe('aviso')
    expect(achado.ponteiro).toBe('/extensionsUsed/1')
  })

  it('sem a lista de registradas não acusa EXT_UNREGISTERED', () => {
    // Não ter o registro em mãos não é o mesmo que o nome não estar nele.
    const doc = exemplo()
    doc.extensionsUsed = ['BONE_particles', 'ACME_glow']
    expect(codigos(nucleo.checarUsoDeExtensoes(doc, registroDeExtensoes, undefined)))
      .not.toContain('EXT_UNREGISTERED')
  })

  it('o registro que a página carrega bate com o do REGISTRY.md', () => {
    expect([...extensoesRegistradas].sort()).toEqual([...REGISTRADAS].sort())
  })
})

// ---------------------------------------------------------------------------
// 7. Os dezessete casos de partícula
// ---------------------------------------------------------------------------

// Os dezessete viveram em `casos-pendentes/` até 18/09/2026, quando os três
// resultados bateram e o Planejador os moveu. O guarda lá embaixo — o que
// afirma que o executor NÃO varre `casos-pendentes/` — continua de pé, e
// tem de continuar: é ele que impede alguém de pôr caso não confrontado na
// varredura oficial, e ele vale com a pasta vazia.
const pastaDosCasos = join(raiz, 'conformidade', 'casos')
const pastaPendente = join(raiz, 'conformidade', 'casos-pendentes')

/**
 * Onde um caso mora. São DUAS pastas e a diferença é o contrário de um
 * detalhe: `casos/` é o que a suíte oficial varre, e `casos-pendentes/` é o que
 * ela não varre. Um caso na pasta errada ou não é provado, ou é contado como
 * prova sem ser uma.
 */
function ondeMora(nome: string): string {
  if (existsSync(join(pastaDosCasos, nome))) return pastaDosCasos
  if (existsSync(join(pastaPendente, nome))) return pastaPendente
  throw new Error(`caso "${nome}" não está em casos/ nem em casos-pendentes/`)
}
const OITO = [
  'P-001-posicao-fechada',
  'P-002-taxa-em-rampa',
  'P-003-laco',
  'P-004-pre-aquecimento',
  'P-005-teto-de-vivas',
  'P-006-space-world',
  'P-007-rajada-com-probabilidade',
  'P-008-arrastar-para-tras',
]

function caso(nome: string): { entrada: any; esperado: any; leiame: string } {
  return {
    entrada: JSON.parse(readFileSync(join(ondeMora(nome), nome, 'entrada.bone'), 'utf8')),
    esperado: JSON.parse(readFileSync(join(ondeMora(nome), nome, 'esperado.json'), 'utf8')),
    leiame: readFileSync(join(ondeMora(nome), nome, 'leiame.md'), 'utf8'),
  }
}

/** As partículas do único emissor de um caso, numa amostra. */
function particulas(esperado: any, i: number): any[] {
  return esperado.samples[i].particles['fx/jato']
}

/** O emissor de um CASO mora no slot `fx`, placeholder `jato` — não no do exemplo. */
function emissorDoCaso(entrada: any): any {
  return entrada.skins[0].attachments.fx.jato
}

/**
 * Os oito casos da segunda leva, um por decisão da rodada de 18/09/2026.
 * Cada um vive num ponto que NENHUM dos oito primeiros exercita — é por isso
 * que os dois runtimes passavam os oito e desenhariam diferente.
 */
const OITO_NOVOS = [
  'P-009-startDelay-com-prewarm',
  'P-010-startDelay-com-rajada',
  'P-011-rajada-com-laco',
  'P-012-spherize-com-spread',
  'P-013-osso-com-escala-nao-uniforme',
  'P-014-oldest-in-front',
  'P-015-malha-aresta-e-triangulo',
  'P-016-emitting-com-startDelay',
  'P-017-emitting-que-religa',
]

/**
 * Os três da rodada 15 (04/10/2026): a §9.10, `x`, `y` e `rotation` do emissor.
 * Números calculados à mão antes do código, e refeitos à mão pelo Diretor.
 */
const DA_RODADA_15 = [
  'P-018-emissor-com-x-y',
  'P-019-emissor-com-rotation',
  'P-020-emissor-world-osso-andando',
]

/**
 * Os seis da rodada 16 (05/10/2026): a forma `path`, extensão 1.1 (§9.4.2).
 * Postos em `casos/` pela ficha do Diretor com DUAS fontes — a conta à mão e o
 * runtime TypeScript —, e o leiame de cada um dizia isso; às 18h21 o Python
 * bateu e eles passaram a dizer três. O P-026 nasceu desse confronto.
 */
const DA_RODADA_16 = [
  'P-021-caminho-por-comprimento',
  'P-022-caminho-animado',
  'P-023-caminho-em-outro-slot',
  'P-024-caminho-curvo-dez-segmentos',
  'P-025-caminho-fechado',
  'P-026-caminho-world-com-spherize',
]

/**
 * Os da rodada 34 (05/10/2026, noite), escritos à mão pela spec por quem não
 * escreveu runtime, e promovidos no fecho da v28.8 com as três fontes.
 */
const DA_RODADA_34 = [
  'P-027-malha-world-girada',
  'P-028-caminho-com-pesos',
]

/**
 * O P-029 também é da rodada 34, mas não mede `particles`: mede a `drawList`
 * (o emissor de forma desconhecida fica de fora, regra 21). A entrada dele traz
 * de propósito uma forma que o schema recusa, então ele não entra nos testes de
 * "a entrada é válida" nem de "o esperado traz o emissor" — só na pasta.
 */
const SO_NA_PASTA = ['P-029-forma-desconhecida-na-drawlist']

/**
 * Os de 05/11/2026, da 2ª fase de `rate` (extensão 1.2) e da identidade da
 * timeline: contas à mão antes do runtime, e as três fontes batendo.
 */
const DE_05_11 = [
  'P-030-rampa-com-torneira',
  'P-031-dois-emissores-no-mesmo-slot',
]

const TODOS = [...OITO, ...OITO_NOVOS, ...DA_RODADA_15, ...DA_RODADA_16, ...DA_RODADA_34, ...DE_05_11]   // trinta

/** O que a suíte oficial varre: os que PROVAM alguma coisa. Desde 05/11/2026, todos. */
const PROVADOS = [...TODOS].sort()
/** O que ela não varre. O P-002 morou aqui até a 2ª fase de `rate` abrir (05/11/2026). */
const MUDOS: string[] = []

describe('os dezessete casos P-001 a P-017', () => {
  it('os dezessete existem, e cada um na pasta CERTA', () => {
    // Este teste dizia "os oito" e listava só a primeira leva; depois passou a
    // exigir os dezessete em `casos/`. Reescrito outra vez, e não apagado,
    // quando o P-002 voltou para `casos-pendentes/` — e de novo em 05/11/2026,
    // quando ele entrou com a 2ª fase de `rate`.
    //
    // A pasta não é detalhe: `casos/` é o que a suíte oficial varre. O P-002
    // PASSA SEM EXERCITAR NADA (o anexo tem `rate: 0` e o esperado é lista
    // vazia), então tê-lo em `casos/` fazia o `P: 17/17` valer dezesseis provas
    // e um caso mudo.
    const emCasos = readdirSync(pastaDosCasos).filter(n => n.startsWith('P-')).sort()
    const pendentes = readdirSync(pastaPendente).filter(n => n.startsWith('P-')).sort()
    expect(emCasos).toEqual([...PROVADOS, ...SO_NA_PASTA].sort())
    expect(pendentes).toEqual(MUDOS)
    expect([...emCasos, ...pendentes].sort()).toEqual([...TODOS, ...SO_NA_PASTA].sort())
  })

  it.each(TODOS)('%s: a entrada é um `.bone` válido e declara a extensão', (nome) => {
    const { entrada } = caso(nome)
    expect(validateSkeleton(entrada), JSON.stringify(validateSkeleton.errors)).toBe(true)
    expect(entrada.extensionsUsed).toContain('BONE_particles')
    expect(nucleo.checarExtensoes(entrada, registroDeExtensoes)).toEqual([])
    expect(nucleo.checarParticulas(entrada)).toEqual([])
    expect(nucleo.checarUsoDeExtensoes(entrada, registroDeExtensoes, REGISTRADAS)).toEqual([])
  })

  it.each(TODOS)('%s: o esperado pede a medida `particles` e traz o emissor', (nome) => {
    const { entrada, esperado } = caso(nome)
    expect(esperado.probe.measure).toEqual(['particles'])
    expect(esperado.samples.length).toBeGreaterThan(0)
    // Uma chave por emissor que um slot MOSTRA — o P-015 tem três, e é de
    // propósito. Um placeholder que o slot não mostra não é desenhado e não entra
    // (§14.1, linha de 05/11/2026): o P-031 tem um, o `jato2`.
    const emissores = entrada.skins[0].attachments
    const esperadas = (entrada.slots as any[]).flatMap((sl) => {
      const a = emissores[sl.name]?.[sl.attachment]
      return a?.type === 'BONE_particle' ? [`${sl.name}/${sl.attachment}`] : []
    })
    for (const s of esperado.samples) {
      // Emissor sem viva nenhuma sai como lista VAZIA, e não some da chave:
      // sumir confundiria "não há partícula" com "o leitor não implementa P".
      expect(Object.keys(s.particles).sort()).toEqual(esperadas.sort())
      for (const lista of Object.values(s.particles)) expect(Array.isArray(lista)).toBe(true)
    }
  })

  it.each(TODOS)('%s: ninguém escreveu `"type": "particle"` sem prefixo', (nome) => {
    const { entrada, leiame } = caso(nome)
    const texto = JSON.stringify(entrada)
    expect(texto).not.toContain('"type":"particle"')
    expect(texto).toContain('"BONE_particle"')
    expect(leiame).toContain('BONE_particles')
  })

  it('P-001: a partícula (0, 7) tem os números que a spec publica', () => {
    // Refeitos aqui a partir do hash, e não copiados do arquivo: se alguém
    // regravar o caso com números de um runtime torto, este teste cai.
    const sete = particulas(caso('P-001-posicao-fechada').esperado, 0).find(p => p.index === 7)
    expect(sete).toBeDefined()
    expect(sete.birth).toBe(0.35)
    expect(sete.age).toBe(0.15)
    expect(sete.life).toBe(Math.round((1 + 0.5 * acaso(42, 0, 7, 0)) * 1e6) / 1e6)
    expect(sete.x).toBe(3.559924)
    expect(sete.y).toBe(16.586731)
    expect(sete.angle).toBe(251.145834)
    expect(sete.scale).toBe(0.700088)
  })

  it('P-001: o ângulo sai como está, e não reduzido a −180..180', () => {
    const sete = particulas(caso('P-001-posicao-fechada').esperado, 0).find(p => p.index === 7)
    expect(sete.angle).toBeGreaterThan(180)
    expect(sete.angle).not.toBeCloseTo(-108.854166, 4)
  })

  it('P-001: a lista está na ordem de desenho, a mais nova na frente', () => {
    const lista = particulas(caso('P-001-posicao-fechada').esperado, 0)
    for (let i = 1; i < lista.length; i++) expect(lista[i - 1].birth).toBeGreaterThan(lista[i].birth)
  })

  it('P-002 tem a lista CHEIA desde a 2ª fase: 8, 21 e 33 vivas, e o leiame conta de onde saiu', () => {
    const { esperado, leiame } = caso('P-002-taxa-em-rampa')
    expect([0, 1, 2].map(i => particulas(esperado, i).length)).toEqual([8, 21, 33])
    expect(leiame).toContain('A 2ª fase abriu')
    expect(leiame).toContain('raiz direta')
  })

  it.each(PROVADOS)('%s: o leiame diz quando entrou em `casos/`', (nome) => {
    // A convenção dos casos `C-*`, que os `P-*` passaram a seguir: quem move
    // escreve quando e por quê. Sem a linha, daqui a um ano ninguém sabe se o
    // caso foi confrontado ou se entrou de carona.
    const { leiame } = caso(nome)
    expect(leiame).toContain('## Onde este caso mora')
    if (DA_RODADA_16.includes(nome)) {
      // Entraram com duas fontes, por ordem da ficha, e o leiame tem de DIZER
      // quantas: "duas" enquanto o Python não bate, "três" depois. O que não
      // pode é um caso de duas fontes passar calado por um de três.
      expect(leiame).toContain('Entrou em `casos/` em 05/10/2026')
      expect(leiame).toMatch(/duas\*\* fontes|três\*\* fontes independentes/)
      return
    }
    // Os da rodada 15 entraram noutro dia (04/10/2026), pelas mesmas três
    // fontes; os da rodada 34, no fecho da v28.8.
    const dia = DA_RODADA_15.includes(nome) ? '04/10/2026' : DA_RODADA_34.includes(nome) ? '05/10/2026'
      : nome === 'P-002-taxa-em-rampa' || DE_05_11.includes(nome) ? '05/11/2026' : '18/09/2026'
    expect(leiame).toContain(`Entrou em \`casos/\` em ${dia}`)
    expect(leiame).toContain('três** fontes independentes')
  })

  it('P-002 conta que VOLTOU uma vez, e por que agora entrou', () => {
    // Um caso que já foi promovido uma vez por engano: a história fica no
    // leiame, e diz o que mudou para ele entrar de verdade.
    const { leiame } = caso('P-002-taxa-em-rampa')
    expect(leiame).toContain('**Devolvido** para `casos-pendentes/`')
    expect(leiame).toContain('Entrou em `casos/` em 05/11/2026')
    expect(leiame).toContain('um runtime sem a rampa reprova')
  })

  it('P-002 PROVA a rampa: o anexo tem rate 0, a prova está na timeline, e a lista não é vazia', () => {
    // Até 05/11/2026 ele passava sem provar nada: lista vazia, e um runtime de
    // 1ª fase dava zero partículas e passava. Agora quem não lê a timeline de
    // `rate` dá zero e REPROVA.
    const { entrada, esperado } = caso('P-002-taxa-em-rampa')
    expect(emissorDoCaso(entrada).rate).toBe(0)
    expect(entrada.animations[0].timelines[0].property).toBe('rate')
    for (let i = 0; i < esperado.samples.length; i++) expect(particulas(esperado, i).length).toBeGreaterThan(0)

    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')
    expect(spec).toContain('devolvido no mesmo dia')
    expect(spec).toContain('P: 31/31')
  })

  it('P-003: `t` e `t + D` dão o MESMO quadro, campo a campo', () => {
    const { esperado } = caso('P-003-laco')
    expect(esperado.probe.loop).toBe(true)
    expect(esperado.samples[0].time).toBe(0.02)
    expect(esperado.samples[1].time).toBe(1.02)
    expect(particulas(esperado, 1)).toEqual(particulas(esperado, 0))
  })

  it('P-003: em `t = 0.02` já há partículas da volta anterior', () => {
    // Sem as voltas de trás o efeito "começa do nada" a cada volta.
    const lista = particulas(caso('P-003-laco').esperado, 0)
    expect(lista.length).toBeGreaterThan(1)
    expect(lista.some(p => p.birth < 0)).toBe(true)
  })

  it('P-004: o índice −3 existe e traz o `u` de referência', () => {
    const lista = particulas(caso('P-004-pre-aquecimento').esperado, 0)
    const menos3 = lista.find(p => p.index === -3)
    expect(menos3).toBeDefined()
    expect(menos3.birth).toBe(-0.15)
    expect(acaso(42, 0, -3, 0)).toBe(0.5181800723075867)
    // e o hash não confunde −3 com 3
    expect(acaso(42, 0, -3, 0)).not.toBe(acaso(42, 0, 3, 0))
  })

  it('P-005: cinco desenhadas, e são as cinco mais novas', () => {
    const { entrada, esperado } = caso('P-005-teto-de-vivas')
    expect(emissorDoCaso(entrada).maxParticles).toBe(5)
    const lista = particulas(esperado, 0)
    expect(lista).toHaveLength(5)
    expect(lista.map(p => p.index)).toEqual([11, 10, 9, 8, 7])
  })

  it('P-006: a partícula não gira com o osso — (100, 0), e não (0, 100)', () => {
    const { entrada, esperado } = caso('P-006-space-world')
    expect(emissorDoCaso(entrada).space).toBe('world')
    expect(entrada.animations[0].timelines[0].keys[1].value).toBe(90)
    const [p] = particulas(esperado, 1)
    expect(p.x).toBe(100)
    expect(p.y).toBe(0)
  })

  it('P-007: nascem 6 de 10, e são os índices que o canal 11 escolhe', () => {
    const lista = particulas(caso('P-007-rajada-com-probabilidade').esperado, 0)
    const nascidos = lista.map(p => p.index).sort((a, b) => a - b)
    expect(nascidos).toEqual([1, 3, 5, 6, 7, 8])
    // refeito pelo hash, não lido do arquivo
    const pelaConta: number[] = []
    for (let i = 0; i < 10; i++) if (acaso(42, 1, i, 11) < 0.5) pelaConta.push(i)
    expect(nascidos).toEqual(pelaConta)
    // todas no fluxo da rajada, que é 1 + 0
    expect(lista.every(p => p.flow === 1)).toBe(true)
  })

  it('P-007: o empate de `t_i` desempata pelo índice decrescente', () => {
    const lista = particulas(caso('P-007-rajada-com-probabilidade').esperado, 0)
    expect(lista.every(p => p.birth === 0.1)).toBe(true)
    expect(lista.map(p => p.index)).toEqual([8, 7, 6, 5, 3, 1])
  })

  it('P-008: a 1ª e a 3ª amostras são IDÊNTICAS, e a 2ª não', () => {
    // É a régua inteira: 0.9 → 0.3 → 0.9 devolve o primeiro quadro.
    const { esperado } = caso('P-008-arrastar-para-tras')
    expect(esperado.probe.times).toEqual([0.9, 0.3, 0.9])
    expect(particulas(esperado, 2)).toEqual(particulas(esperado, 0))
    expect(particulas(esperado, 1)).not.toEqual(particulas(esperado, 0))
  })

  it('a spec proíbe medir o `angle` por distância circular (§14.2)', () => {
    // Esta linha nasceu de uma observação do chat do runtime Python: os dois
    // runtimes chegaram à leitura certa por conta própria, e dois leitores
    // acertarem não prova que a frase basta — prova que bastou para aqueles
    // dois. O teste existe para a linha não sumir num "conserto" futuro.
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')
    expect(spec).toContain('NÃO PODE** medi-lo por distância circular')
    expect(spec).toContain('### 14.2')
    expect(spec).toContain('**Nunca** distância circular')
    // e o tamanho, com a razão junto: sem ela, alguém afrouxa para 1e-2
    expect(spec).toContain('**`1e-3` grau**')
    expect(spec).toContain('nada aqui\nacumula')
  })

  it('o P-001 continua provando o ângulo não reduzido, que é o que a §14.2 protege', () => {
    // A §14.2 só vale porque existe um caso que a exerce. Se este par se
    // desencontrar, a regra vira texto sem prova.
    const sete = particulas(caso('P-001-posicao-fechada').esperado, 0).find(p => p.index === 7)
    expect(sete.angle).toBe(251.145834)
    // o valor que um leitor errado daria, e que a conta circular faria passar
    const reduzido = ((sete.angle % 360) + 540) % 360 - 180
    expect(reduzido).toBeCloseTo(-108.854166, 5)
    expect(Math.abs(sete.angle - reduzido)).toBeCloseTo(360, 5)
  })

  it('as cinco linhas do confronto dos dois runtimes estão na spec', () => {
    // Nenhuma das cinco é exercitada por caso nenhum HOJE — é por isso que os
    // dois runtimes podiam passar os oito e desenhar diferente. Enquanto os
    // casos novos não existem, o que prende cada linha é este teste.
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')

    // 1. a tolerância, fixada e uniforme
    expect(spec).toContain('`1e-3` para todo campo sob `/particles/`')
    expect(spec).not.toContain('posição `1e-3` px, ângulo `1e-2` grau')

    // 2. a fórmula do ponto uniforme: dobrar, e não a raiz quadrada
    expect(spec).toContain('### 9.4.1')
    expect(spec).toContain('se s + w > 1:')
    expect(spec).toContain('DOBRAR')

    // 3. a lista de arestas, e o porquê verificável
    expect(spec).toContain('aresta única da triangulação')
    expect(spec).toContain('NUNCA o campo `edges`')

    // 4. a ordem do spherizeDirection
    expect(spec).toContain('#### 9.3.1')
    expect(spec).toContain('mistura, depois abre o leque em volta da base misturada')

    // 5. a rajada no laço, e o corte dos ciclos
    expect(spec).toContain('"Nascimentos" inclui a rajada')
    expect(spec).toContain('Só os ciclos cujo instante cai em `[0, D)`')

    // 6. a fronteira EM SÍMBOLOS, e igual à do fluxo contínuo
    expect(spec).toContain('`0 <= instante < D`')
    expect(spec).toContain('Zero\n**fechado**, `D` **aberto**')
    expect(spec).toContain('`0 <= i < E(D)`')
  })

  it('o `startDelay` está nas TRÊS contas, e na mesma forma longa', () => {
    // A doença é sempre a mesma: uma frase omite o que outra manda. O
    // `startDelay` aparecia numa única linha da spec inteira — a da tabela de
    // campos — e em nenhuma fórmula. O runtime Python relata que quase
    // implementou as duas coisas, porque leu as duas frases.
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')

    // §4.2: a origem da integral, e NÃO uma soma no fim — a soma no fim
    // fazia nascer partícula com o `emitting` já fechado (v20.0)
    expect(spec).toContain('a origem:  o = startDelay')
    expect(spec).toContain('E(o) = 0')
    expect(spec).toContain('t_i   = startDelay + time + c·interval')       // §4.3, rajada
    expect(spec).toContain('`0 <= startDelay + time + c·interval < D`')    // §6, o corte

    // e a forma CURTA não pode ter sobrado em lugar nenhum: é ela que convida
    // o leitor a esquecê-lo
    expect(spec).not.toContain('t_i   = time + c·interval')
    expect(spec).not.toContain('`0 <= time + c·interval < D`')
    expect(spec).not.toContain('t_cont = startDelay + t_k + τ(i − E_k)')
  })

  it('a timeline de `emitting` é lida no relógio do ESQUELETO, e a spec dá a régua', () => {
    // A nona frase calada. A régua que veio com ela vale para todo campo
    // animável que aparecer depois, e é por isso que ela está na spec e não
    // só a decisão: poupa a décima.
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')
    expect(spec).toContain('No **relógio do\nesqueleto**')
    expect(spec).toContain('**Não** em `t − startDelay`')
    expect(spec).toContain('desloca NASCIMENTOS, que o programa gera. Não desloca CHAVES')
  })

  it('a régua separa o que segue o `startDelay` do que não segue', () => {
    // Nascimento é gerado pela conta e segue; chave é posta à mão e não segue.
    // Se as duas listas se misturarem, a distinção vira frase bonita.
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')
    const regua = spec.slice(spec.indexOf('| O que segue o `startDelay` |'))
      .slice(0, spec.slice(spec.indexOf('| O que segue o `startDelay` |')).indexOf('\n\n'))
    expect(regua).toContain('fluxo contínuo')
    expect(regua).toContain('rajada')
    expect(regua).toContain('`prewarm`')
    expect(regua).toContain('timeline de `emitting`')
  })

  it('o `startDelay` muda QUEM é cortado — o exemplo da §6, refeito', () => {
    // Se as duas leituras dessem o mesmo resultado, a linha seria enfeite.
    const startDelay = 0.3, time = 0.8, D = 1, c = 0
    const comDecisao = startDelay + time + c * 0.5
    const pelaLetraAntiga = time + c * 0.5

    expect(comDecisao).toBeCloseTo(1.1, 6)
    expect(pelaLetraAntiga).toBeCloseTo(0.8, 6)
    // um fica FORA da volta, o outro DENTRO: duas partículas diferentes na
    // tela, do mesmo arquivo, conforme o leitor
    expect(comDecisao >= 0 && comDecisao < D).toBe(false)
    expect(pelaLetraAntiga >= 0 && pelaLetraAntiga < D).toBe(true)
  })

  it('os oito PRIMEIROS não separam as duas leituras; os novos separam', () => {
    // Este teste dizia só a primeira metade — que nenhum caso exercitava o
    // `startDelay`. Reescrito quando a segunda leva entrou, porque agora ela
    // exercita, e é exatamente essa a diferença que ela existe para fechar.
    for (const nome of OITO) {
      expect(emissorDoCaso(caso(nome).entrada).startDelay ?? 0, nome).toBe(0)
    }
    const comDelay = OITO_NOVOS.filter(n => (emissorDoCaso(caso(n).entrada).startDelay ?? 0) !== 0)
    expect(comDelay).toEqual([
      'P-009-startDelay-com-prewarm',
      'P-010-startDelay-com-rajada',
      'P-016-emitting-com-startDelay',
    ])
  })

  it('a fronteira `[0, D)` é `D` ABERTO: o ciclo em `D` fica de fora', () => {
    // O caso mais banal que alguém escreve — rajada a cada 0,5 s numa animação
    // de 1 s — é justamente o que separa as duas leituras da fronteira.
    const time = 0, intervalo = 0.5, cycles = 4, D = 1
    const ts = Array.from({ length: cycles }, (_, c) => time + c * intervalo)
    expect(ts).toEqual([0, 0.5, 1, 1.5])
    const dentro = ts.filter(t => t >= 0 && t < D)
    expect(dentro).toEqual([0, 0.5])
    // o ciclo em D NÃO entra: ele é o primeiro da volta seguinte
    expect(dentro).not.toContain(D)
    // e se entrasse, ele cairia em cima do ciclo 0 da volta atual ao voltar −D
    expect(D - D).toBe(ts[0])
  })

  it('o `edges` do núcleo é mesmo "só editor", que é a razão escrita na §9.4.1', () => {
    // A razão da spec tem de ser verificável, senão é só uma opinião com voz
    // de norma. Esta é: se a linha do núcleo mudar, este teste cai junto.
    const nucleoSpec = readFileSync(join(raiz, 'formato', 'ESPECIFICACAO 2026-09-17.md'), 'utf8')
    expect(nucleoSpec).toContain('| `edges` | integer[] | não | `[]` | Pares de índices. Só editor. |')
  })

  it('o exemplo do corte de ciclos da §6 confere: 2 ficam, 3 se sobrepõem', () => {
    // A conta que a spec cita, refeita aqui. Se ela estiver errada no texto,
    // o texto engana quem o seguir — e este teste é quem percebe.
    const time = 0.1, cycles = 5, intervalo = 0.5, D = 1
    const ts = Array.from({ length: cycles }, (_, c) => +(time + c * intervalo).toFixed(6))
    expect(ts).toEqual([0.1, 0.6, 1.1, 1.6, 2.1])
    const dentro = ts.filter(t => t >= 0 && t < D)
    const fora = ts.filter(t => !(t >= 0 && t < D))
    expect(dentro).toEqual([0.1, 0.6])
    expect(fora).toHaveLength(3)
    // e o primeiro que sobra cai EM CIMA de um da volta atual, ao voltar −D
    expect(+(fora[0] - D).toFixed(6)).toBe(0.1)
    expect(dentro).toContain(+(fora[0] - D).toFixed(6))
  })

  it('as duas fórmulas do triângulo dão pontos DIFERENTES — por isso a spec escolhe', () => {
    // Se as duas dessem o mesmo ponto, a linha da §9.4.1 seria enfeite.
    const A = [0, 0], B = [10, 0], C = [0, 10]
    const ponto = (s: number, w: number) => [A[0] + s * (B[0] - A[0]) + w * (C[0] - A[0]),
                                             A[1] + s * (B[1] - A[1]) + w * (C[1] - A[1])]
    const u3 = acaso(42, 0, 7, 3), u4 = acaso(42, 0, 7, 4)

    // a de dobrar, que é a que a spec manda
    let s = u3, w = u4
    if (s + w > 1) { s = 1 - s; w = 1 - w }
    const dobrar = ponto(s, w)

    // a da raiz quadrada, a outra usual
    const r = Math.sqrt(u3)
    const raiz = ponto(1 - r, u4 * r)

    expect(dobrar).not.toEqual(raiz)
    // e a diferença é grande, não um arredondamento
    expect(Math.hypot(dobrar[0] - raiz[0], dobrar[1] - raiz[1])).toBeGreaterThan(1)
  })

  it('a ordem do `spherizeDirection` muda o leque — e com spherize 1 ele fecharia', () => {
    // A razão que a §9.3.1 dá, refeita: na ordem contrária o leque encolhe por
    // (1 − spherize), e com spherize 1 todas as partículas saem no mesmo ângulo.
    const direction = 90, spread = 30, saida = 0, u2 = 0.9
    const curto = (a: number, b: number, k: number) => {
      let d = ((b - a + 540) % 360) - 180
      return a + d * k
    }
    const desvio = spread * (2 * u2 - 1)            // o quanto o leque afasta da base
    for (const spherize of [0, 0.5, 1]) {
      const base = curto(direction, saida, spherize)
      // a ordem da spec: mistura, depois abre o leque em volta da base
      const certo = base + desvio
      // a ordem contrária: abre o leque em volta de `direction`, e só então mistura
      const errado = curto(direction + desvio, saida, spherize)

      expect(certo - base).toBeCloseTo(desvio, 6)
      // e aqui está o efeito colateral que a §9.3.1 nomeia: o leque encolhe
      // por (1 − spherize), sem ninguém ter pedido
      expect(errado - base).toBeCloseTo(desvio * (1 - spherize), 6)
    }
    // com spherize 1 ele fecha de vez: todas saem no mesmo ângulo, por mais
    // que o autor tenha aberto o spread
    expect(curto(direction + desvio, saida, 1) - curto(direction, saida, 1)).toBeCloseTo(0, 6)
  })

  // -------------------------------------------------------------------------
  // A segunda leva, um caso por decisão da rodada
  // -------------------------------------------------------------------------

  it('P-009: o `startDelay` desloca a origem, e o `prewarm` parte DELA', () => {
    const lista = particulas(caso('P-009-startDelay-com-prewarm').esperado, 0)
    expect(lista.map(p => p.index)).toEqual(
      Array.from({ length: 25 }, (_, k) => 4 - k))          // de 4 a −20, do mais novo ao mais velho
    // a mais velha nasceu em 0.3 − 1: a origem deslocada, menos o pré-aquecimento
    expect(lista[lista.length - 1].birth).toBe(-0.7)
    // sem o startDelay na conta ela nasceria em −1.0, e a lista iria até i = 10
    expect(lista[0].birth).toBe(0.5)
  })

  it('P-010: o `startDelay` muda QUEM o laço corta', () => {
    const { entrada, esperado } = caso('P-010-startDelay-com-rajada')
    const e = emissorDoCaso(entrada)
    expect(e.startDelay).toBe(0.3)
    expect(e.bursts[0].cycles).toBe(3)
    const lista = particulas(esperado, 0)
    // três ciclos escritos, DOIS sobreviveram ao corte: 2 ciclos × count 2
    expect(lista).toHaveLength(4)
    expect([...new Set(lista.map(p => p.birth))].sort()).toEqual([0.6, 0.9])
    // o terceiro ciclo cairia em 1.2, fora de [0, D) — e sem o startDelay
    // os três cairiam em 0.3, 0.6 e 0.9, todos dentro
    expect(0.3 + e.bursts[0].time + 2 * e.bursts[0].interval).toBeCloseTo(1.2, 6)
    expect(e.bursts[0].time + 2 * e.bursts[0].interval).toBeCloseTo(0.9, 6)
  })

  it('P-011: a explosão da volta anterior existe, e é a MESMA rajada', () => {
    const esperado = caso('P-011-rajada-com-laco').esperado
    const cedo = particulas(esperado, 0), tarde = particulas(esperado, 1)
    // em t = 0.05 a tela NÃO está vazia: é isso que a decisão comprou
    expect(cedo.length).toBeGreaterThan(0)
    expect(cedo[0].birth).toBe(-0.2)                       // 0.8 − D
    expect(tarde[0].birth).toBe(0.8)
    // a mesma rajada, uma volta antes e uma depois: mesmos índices
    expect(cedo.map(p => p.index)).toEqual(tarde.map(p => p.index))
    // e o corte dos ciclos: 3 escritos, só o de 0.8 está em [0, D)
    expect(cedo).toHaveLength(3)
  })

  it('P-012: o `spherizeDirection` muda o desenho — 6 das 7 se movem', () => {
    const { entrada, esperado } = caso('P-012-spherize-com-spread')
    expect(emissorDoCaso(entrada).spherizeDirection).toBe(0.5)
    expect(emissorDoCaso(entrada).spread).toBe(30)
    const lista = particulas(esperado, 0)
    expect(lista).toHaveLength(7)
    // a mais nova tem idade 0 e está no ponto de nascimento; as outras seis
    // carregam a direção misturada, e é nelas que a ordem aparece
    expect(lista.filter(p => p.age > 0)).toHaveLength(6)
  })

  it('P-013: o `scale` do dump é a escala do eixo X, e não a média nem a de Y', () => {
    const { entrada, esperado } = caso('P-013-osso-com-escala-nao-uniforme')
    const osso = entrada.bones.find((b: any) => b.name === 'emissor')
    expect([osso.scaleX, osso.scaleY]).toEqual([2, 3])
    const lista = particulas(esperado, 0)
    for (const p of lista) expect(p.scale).toBe(2)         // hypot(a, c) = 2
    expect(lista.every(p => p.scale !== 2.5)).toBe(true)   // não é a média
    expect(lista.every(p => p.scale !== 3)).toBe(true)     // não é a de Y
    // e a posição passou pela matriz inteira: x e y na razão 2:3
    const viva = lista.find(p => p.age > 0 && p.x !== 0)!
    expect(viva.y / viva.x).toBeCloseTo(3 / 2, 6)
  })

  it('P-014: `oldestInFront` é a lista exatamente ao contrário', () => {
    const { entrada, esperado } = caso('P-014-oldest-in-front')
    expect(emissorDoCaso(entrada).sortMode).toBe('oldestInFront')
    const lista = particulas(esperado, 0)
    expect(lista.map(p => p.index)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    // a mais velha na frente: os `birth` sobem
    for (let i = 1; i < lista.length; i++) expect(lista[i].birth).toBeGreaterThan(lista[i - 1].birth)
  })

  it('P-015: a ordem da triangulação NÃO muda a aresta escolhida', () => {
    // O coração do caso: duas malhas iguais, `triangles` escrito em ordens
    // diferentes e com os índices rodados. Se um runtime guardar a ordem de
    // descoberta, as duas listas divergem — e sem este par ninguém notaria,
    // porque cada uma sozinha "parece" certa.
    const { entrada, esperado } = caso('P-015-malha-aresta-e-triangulo')
    const a = esperado.samples[0].particles['fx/jato']
    const b = esperado.samples[0].particles['fx2/jato2']
    const c = esperado.samples[0].particles['fx3/jato3']

    const t1 = entrada.skins[0].attachments.fx.pano.triangles
    const t2 = entrada.skins[0].attachments.fx2.pano2.triangles
    expect(t1).not.toEqual(t2)                              // escritos diferente
    expect(a.map((p: any) => [p.x, p.y])).toEqual(b.map((p: any) => [p.x, p.y]))  // mesmo resultado

    // as arestas do quadrado são CINCO: a diagonal entra uma vez só
    const arestas = new Set<string>()
    for (let i = 0; i + 2 < t1.length; i += 3) {
      const t = [t1[i], t1[i + 1], t1[i + 2]]
      for (const [x, y] of [[t[0], t[1]], [t[1], t[2]], [t[0], t[2]]]) {
        arestas.add(`${Math.min(x, y)},${Math.max(x, y)}`)
      }
    }
    expect(arestas.size).toBe(5)

    // e o `triangle` cai dentro do quadrado
    for (const p of c) {
      expect(p.x).toBeGreaterThanOrEqual(-1e-9)
      expect(p.x).toBeLessThanOrEqual(10 + 1e-9)
      expect(p.y).toBeGreaterThanOrEqual(-1e-9)
      expect(p.y).toBeLessThanOrEqual(10 + 1e-9)
    }
  })

  it('P-016: a chave de `emitting` vale no relógio do esqueleto', () => {
    const { entrada, esperado } = caso('P-016-emitting-com-startDelay')
    const tl = entrada.animations[0].timelines[0]
    expect(tl.type).toBe('BONE_particle')
    expect(tl.property).toBe('emitting')
    expect(tl.keys.map((k: any) => [k.time, k.value])).toEqual([[0, true], [0.5, false]])

    const lista = particulas(esperado, 0)
    // Este teste dizia 10 nascimentos, de 0.3 a 0.75 — pela fórmula que somava
    // o `startDelay` NO FIM. Aquela fórmula fazia nascer partícula com o
    // `emitting` já fechado, e foi corrigida na v20.0: a origem da integral é
    // `o = startDelay`, e a janela de emissão é [0.3, 0.5). Reescrito.
    expect(lista).toHaveLength(4)
    expect(lista.map(p => p.birth).reverse()).toEqual([0.3, 0.35, 0.4, 0.45])
    // NADA nasce com a torneira fechada: é o que a §4.1 promete e a §4.2 cumpre
    expect(lista.every(p => p.birth < 0.5)).toBe(true)
    // e nada nasce antes do startDelay (§9.1)
    expect(lista.every(p => p.birth >= 0.3)).toBe(true)
  })

  it('P-017: o `emitting` que religa NÃO pula índice', () => {
    // Um trecho de taxa zero tem área zero e não consome índice. O erro aqui
    // não é de contagem, é de IDENTIDADE: índice diferente é hash diferente,
    // logo vida, velocidade, ângulo e cor diferentes.
    const { entrada, esperado } = caso('P-017-emitting-que-religa')
    const chaves = entrada.animations[0].timelines[0].keys
    expect(chaves.map((k: any) => [k.time, k.value])).toEqual([[0, true], [0.5, false], [0.8, true]])

    const antes = particulas(esperado, 0)
    expect(antes).toHaveLength(14)
    expect(antes.map(p => p.index).reverse()).toEqual([...Array(14).keys()])   // 0..13, SEGUIDOS
    const segundoGrupo = antes.filter(p => p.birth >= 0.8)
    expect(segundoGrupo.map(p => p.index).reverse()).toEqual([10, 11, 12, 13]) // e não 16..19
    expect(segundoGrupo.map(p => p.birth).reverse()).toEqual([0.8, 0.85, 0.9, 0.95])
    // ninguém nasceu no trecho fechado
    expect(antes.every(p => p.birth < 0.5 || p.birth >= 0.8)).toBe(true)
  })

  it('P-017: a conta errada dá a MESMA contagem e outros nomes', () => {
    // O que faz este caso valer: um leitor que calcule `t_i = i / rate` e
    // descarte quem caiu com a torneira fechada acerta o TAMANHO da lista nas
    // duas amostras, e erra todos os índices do segundo grupo. Índice é hash,
    // e hash é vida, velocidade, ângulo e cor. Nenhum número o denunciaria.
    const aberto = (t: number) => (t >= 0 && t < 0.5) || t >= 0.8
    const errado = (T: number) => {
      const fora: number[] = []
      for (let i = 0; i <= 25; i++) {
        const t = Number((i / 20).toFixed(6))
        if (t <= T && aberto(t)) fora.push(i)
      }
      return fora
    }
    const esperado = caso('P-017-emitting-que-religa').esperado
    for (const [k, T] of [[0, 0.99], [1, 1.0]] as const) {
      const certo = particulas(esperado, k).map(p => p.index).reverse()
      expect(errado(T)).toHaveLength(certo.length)          // MESMA contagem
      expect(errado(T)).not.toEqual(certo)                  // outros nomes
    }
    expect(errado(0.99)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 17, 18, 19])
    expect(errado(1.0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 16, 17, 18, 19, 20])
  })

  it('P-017: os três valores da integral que a §4.2 promete', () => {
    // E(0.5) = 10 · E(0.8) = 10 (PARADA, o trecho fechado tem área zero) ·
    // E(1.0) = 14. Um gerador que não os reproduza tem o defeito que a §4.2
    // conserta, e vai gravar um caso errado.
    const E = (t: number) => 20 * Math.max(0, Math.min(t, 0.5)) + 20 * Math.max(0, t - 0.8)
    expect(E(0.5)).toBeCloseTo(10, 9)
    expect(E(0.8)).toBeCloseTo(10, 9)
    expect(E(1.0)).toBeCloseTo(14, 9)
    // e o leiame publica os três, para conferir um gerador antes de ele gravar
    expect(caso('P-017-emitting-que-religa').leiame).toContain('E(0.8) = 10')
  })

  it('P-017: quem nasce exatamente em `t` está vivo (§5)', () => {
    // A segunda amostra existe porque quem pediu o caso esperava 14 em t = 1.0
    // e a conta dá 15: a §5 diz `t_i <= t`, e o índice 14 nasce em 1.0 com
    // idade 0. Não é regra nova — o P-001 já a exercita —, mas aqui cai num
    // número redondo, onde é fácil arredondar para fora sem perceber.
    const esperado = caso('P-017-emitting-que-religa').esperado
    const noPonto = particulas(esperado, 1)
    expect(noPonto).toHaveLength(15)
    expect(noPonto[0].index).toBe(14)
    expect(noPonto[0].birth).toBe(1)
    expect(noPonto[0].age).toBe(0)

    // e o P-001 já dizia o mesmo: o índice 10 nasce exatamente em t = 0.5
    const p001 = particulas(caso('P-001-posicao-fechada').esperado, 0)
    expect(p001[0].index).toBe(10)
    expect(p001[0].birth).toBe(0.5)
    expect(p001[0].age).toBe(0)
  })

  it('a spec diz que `oldestInFront` é o `reverse()` da lista inteira', () => {
    // A décima frase calada. Em símbolos, como a fronteira `[0, D)`: forma
    // curta é o que o próximo leitor copia.
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')
    expect(spec).toContain('oldestInFront = reverse(youngestInFront)')
    expect(spec).toContain('O desempate vai junto')
    expect(spec).toContain('inverte nos **três**')
  })

  it('e que o CORTE vem antes da ordem de desenho', () => {
    // Achado na minha própria calculadora ao escrever a linha acima: eu
    // invertia e só então cortava, o que guardaria as mais VELHAS. O defeito
    // é latente — só aparece com `oldestInFront` E `maxParticles` juntos, o
    // par que nenhum caso tem —, e é por isso que ele merece linha e teste.
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')
    expect(spec).toContain('São DUAS etapas, e a ordem entre elas é normativa')
    expect(spec).toContain('Cortar depois de inverter guardaria as mais VELHAS')
    expect(spec).toContain('as maxParticles MAIS NOVAS')
  })

  it('cortar-depois-de-inverter dá outra lista: o defeito medido', () => {
    // Doze vivas, teto de 5, `oldestInFront`. As duas ordens de operação dão
    // conjuntos DIFERENTES — não só ordem diferente.
    const vivas = Array.from({ length: 12 }, (_, i) => ({ index: i, birth: i * 0.05 }))
    const maisNovasPrimeiro = [...vivas].sort((a, b) => b.birth - a.birth)

    const certo = maisNovasPrimeiro.slice(0, 5).reverse()          // corta, depois inverte
    const errado = [...maisNovasPrimeiro].reverse().slice(0, 5)    // inverte, depois corta

    expect(certo.map(p => p.index)).toEqual([7, 8, 9, 10, 11])     // as cinco MAIS NOVAS
    expect(errado.map(p => p.index)).toEqual([0, 1, 2, 3, 4])      // as cinco mais VELHAS
    expect(certo.map(p => p.index)).not.toEqual(errado.map(p => p.index))
  })

  // -------------------------------------------------------------------------
  // A entrada tem de trazer o que o leiame AFIRMA que ela tem
  //
  // Os dois erros que eu peguei sozinho eram de CONTAGEM, e a conta à mão os
  // pegou. O terceiro foi de outra natureza — o P-011 (e o P-010 junto com ele,
  // que ninguém tinha visto) afirmavam `D = 1` no leiame e **não traziam
  // animação nenhuma** na entrada. Sem animação tocando não há `D`, e sem `D`
  // não há volta de trás: o runtime devolvia lista vazia, e estava certo.
  //
  // Conferir o tamanho da lista nunca pegaria isso. Estes testes pegam.
  // -------------------------------------------------------------------------

  it.each(TODOS)('%s: sonda com `loop` exige animação, e vice-versa', (nome) => {
    const { entrada, esperado } = caso(nome)
    const animacoes: any[] = entrada.animations ?? []
    if (esperado.probe.loop) {
      // a §6 diz que `D` é a duração da animação que toca: sem ela, não há `D`
      expect(animacoes.length, `${nome}: sonda em laço sem animação`).toBeGreaterThan(0)
      expect(esperado.probe.animation, `${nome}: sonda em laço sem nomear a animação`).toBeTruthy()
    }
    if (esperado.probe.animation) {
      expect(animacoes.map(a => a.name)).toContain(esperado.probe.animation)
    }
  })

  it.each(TODOS)('%s: o `D` que o leiame afirma existe na entrada', (nome) => {
    const { entrada, esperado, leiame } = caso(nome)
    const m = /`D = ([0-9.]+)`/.exec(leiame)
    if (!m) return
    const D = Number(m[1])
    const tocando = (entrada.animations ?? []).find((a: any) => a.name === esperado.probe.animation)
    expect(tocando, `${nome}: o leiame afirma D = ${D} e a sonda não toca animação nenhuma`).toBeTruthy()
    expect(tocando.duration, `${nome}: o leiame afirma D = ${D} e a animação dura outra coisa`).toBe(D)
  })

  it.each(TODOS)('%s: os campos que o leiame cita estão mesmo no emissor', (nome) => {
    // O bloco ```json do leiame descreve o emissor. Se ele disser
    // `"startDelay": 0.3` e a entrada não tiver, o caso mente sobre si mesmo.
    const { entrada, leiame } = caso(nome)
    const emissor = emissorDoCaso(entrada)
    for (const bloco of leiame.match(/```json\n([\s\S]*?)```/g) ?? []) {
      const corpo = bloco.replace(/```json\n/, '').replace(/```$/, '').trim()
      let campos: any
      try { campos = JSON.parse(`{${corpo}}`) } catch { continue }   // não é bloco de emissor
      for (const [chave, valor] of Object.entries(campos)) {
        if (!(chave in emissor)) continue                            // o bloco pode citar outra coisa
        // as rajadas do leiame vêm sem os padrões (`probability` implícito),
        // então o que se exige é que o que ELE afirma bata, campo a campo
        if (Array.isArray(valor)) {
          valor.forEach((item: any, k) => {
            for (const [ck, cv] of Object.entries(item)) {
              expect(emissor[chave][k][ck], `${nome}: o leiame diz ${chave}[${k}].${ck} = ${cv}`).toEqual(cv)
            }
          })
        } else {
          expect(emissor[chave], `${nome}: o leiame diz ${chave} = ${JSON.stringify(valor)}`).toEqual(valor)
        }
      }
    }
  })

  it('P-010 e P-011 têm a animação que o laço exige', () => {
    // O conserto de 18/09, preso: os dois afirmavam `D = 1` e não traziam
    // animação. O P-011 foi achado pelo runtime Python; o P-010 pela varredura
    // que ele me fez fazer. Os números não mudaram — só a entrada passou a
    // dizer de onde vem o `D` que a conta já usava.
    for (const nome of ['P-010-startDelay-com-rajada', 'P-011-rajada-com-laco']) {
      const { entrada, esperado } = caso(nome)
      expect(entrada.animations).toHaveLength(1)
      expect(entrada.animations[0].duration).toBe(1)
      expect(esperado.probe.animation).toBe(entrada.animations[0].name)
      expect(esperado.probe.loop).toBe(true)
    }
    // e os números continuam os que a conta deu
    expect(particulas(caso('P-011-rajada-com-laco').esperado, 0)[0].birth).toBe(-0.2)
    expect(particulas(caso('P-010-startDelay-com-rajada').esperado, 0)).toHaveLength(4)
  })

  it.each(OITO_NOVOS)('%s: o leiame diz qual decisão prende e o que falha sem ela', (nome) => {
    // É o que impede alguém, daqui a um ano, de "simplificar" o caso sem
    // saber o que está apagando.
    const { leiame } = caso(nome)
    expect(leiame).toContain('## A decisão que este caso prende')
    // o contrafactual, que é o que dá sentido ao caso: "sem ela / sem elas /
    // sem a primeira…". O P-011 prende DUAS decisões e diz as duas.
    expect(leiame).toMatch(/\*\*Sem /)
    expect(leiame).toContain('## O que falha aqui')
  })

  it('o executor de conformidade NÃO varre esta pasta', () => {
    // Caso pendente não pode derrubar a suíte de quem não tem o módulo P.
    // Se este teste cair, alguém mudou o executor e os 71 viraram 79.
    const executor = readFileSync(join(raiz, 'ferramentas', 'conformidade.mjs'), 'utf8')
    expect(executor).not.toContain('casos-pendentes')
  })
})

// ---------------------------------------------------------------------------
// Rodada 15 (04/10/2026): `x`, `y` e `rotation` do emissor — a §9.10
// ---------------------------------------------------------------------------

describe('§9.10: o emissor tem x, y e rotation, como a imagem', () => {
  it('exigência b do Diretor: sem os três campos, o dump sai IGUAL, byte a byte, ao da v23.9', () => {
    // A linha de base foi gravada às 23h09 de 04/10/2026, com o runtime de
    // antes da §9.10 (as contas de partícula intactas desde a v23.9: só o
    // `index.ts` tinha mudado, e para exportar). São os 16 casos P de então e
    // o exemplo `particulas.bone` em cinco instantes. Nenhum deles tem `x`,
    // `y` ou `rotation` no emissor — e nenhum muda um caractere.
    const base = JSON.parse(readFileSync(join(raiz, 'ferramentas', 'testes', 'dados', 'dump-particulas-v23.9.json'), 'utf8')) as Record<string, string>
    const nomes = Object.keys(base)
    expect(nomes.length).toBe(17)
    for (const nome of nomes) {
      let data
      let probe
      if (nome.startsWith('exemplos/')) {
        data = loadSkeletonData(exemplo())
        probe = { animation: 'fumar', times: [0, 0.25, 0.5, 1, 1.75], measure: ['particles'] } as Probe
      } else {
        const { entrada, esperado } = caso(nome)
        expect(Object.keys(emissorDoCaso(entrada)).some(k => k === 'x' || k === 'y' || k === 'rotation')).toBe(false)
        data = loadSkeletonData(entrada)
        probe = esperado.probe as Probe
      }
      expect(formatPoseDump(buildPoseDump(data, probe)), nome).toBe(base[nome])
    }
  })

  it('e escrever os três campos com ZERO dá o mesmo dump: o padrão é mesmo zero', () => {
    for (const nome of ['P-001-posicao-fechada', 'P-006-space-world', 'P-013-osso-com-escala-nao-uniforme', 'P-015-malha-aresta-e-triangulo']) {
      const { entrada, esperado } = caso(nome)
      const antes = formatPoseDump(buildPoseDump(loadSkeletonData(entrada), esperado.probe))
      Object.assign(emissorDoCaso(entrada), { x: 0, y: 0, rotation: 0 })
      expect(formatPoseDump(buildPoseDump(loadSkeletonData(entrada), esperado.probe)), nome).toBe(antes)
    }
  })

  for (const nome of DA_RODADA_15) {
    it(`${nome}: regra 26 — sem os três campos (o leitor de antes), o caso FALHA`, () => {
      // Um caso que nunca se viu falhar não é um caso. O leitor de antes da
      // §9.10 ignorava `x`, `y` e `rotation` (campo desconhecido, §2.5): tirá-los
      // do arquivo é ler como ele lia.
      const { entrada, esperado } = caso(nome)
      const certo = comparePoseDump(esperado, buildPoseDump(loadSkeletonData(entrada), esperado.probe), TOLERANCES)
      expect(certo.ok).toBe(true)
      const e = emissorDoCaso(entrada)
      delete e.x; delete e.y; delete e.rotation
      const antigo = comparePoseDump(esperado, buildPoseDump(loadSkeletonData(entrada), esperado.probe), TOLERANCES)
      expect(antigo.ok).toBe(false)
    })
  }

  it('P-019: a ordem errada (R × M_osso) daria escala 2 — o caso a pega', () => {
    const { esperado } = caso('P-019-emissor-com-rotation')
    for (const p of particulas(esperado, 0)) expect(p.scale).toBe(1)
    // e o x cresce com a², o y com a: a gravidade girou junto (local)
    expect(particulas(esperado, 0).map((p: any) => [p.x, p.y])).toEqual([[0, 0], [1, 10], [4, 20], [9, 30]])
  })

  it('P-020: em "world", a matriz do NASCIMENTO — com a de agora, todos teriam x 40', () => {
    const { esperado } = caso('P-020-emissor-world-osso-andando')
    const xs = particulas(esperado, 0).map((p: any) => p.x)
    expect(xs).toEqual([40, 30, 20, 10])
  })

  it('a spec diz a regra, a conta e as consequências, por extenso', () => {
    const spec = readFileSync(join(raiz, 'formato', 'extensions', 'BONE_particles.md'), 'utf8')
    expect(spec).toContain('### 9.10 Onde o emissor está')
    expect(spec).toContain('M_emissor = M_osso × T(x, y) · R(rotation)')
    expect(spec).toContain('**girar o emissor gira a gravidade local**')
    expect(spec).toContain('**deslocado ou girado, ele sai de cima do osso**')
    expect(spec).toContain('P: 19/19')
  })

  it('o validador aceita os três campos e recusa texto no lugar de número (EXT_SCHEMA)', () => {
    const doc = exemplo()
    Object.assign(emissorDe(doc), { x: 12.5, y: -3, rotation: 45 })
    expect(nucleo.checarExtensoes(doc, registroDeExtensoes)).toEqual([])
    expect(nucleo.checarExtensoes(doc, registroComoNoCli())).toEqual([])
    for (const campo of ['x', 'y', 'rotation']) {
      const ruim = exemplo()
      emissorDe(ruim)[campo] = '10'
      for (const registro of [registroDeExtensoes, registroComoNoCli()]) {
        const problemas = nucleo.checarExtensoes(ruim, registro)
        expect(problemas.length, campo).toBeGreaterThan(0)
        expect(problemas[0].codigo).toBe('EXT_SCHEMA')
        expect(problemas.some(p => p.ponteiro === `/skins/0/attachments/cachimbo_fumaca/fumaca/${campo}`)).toBe(true)
      }
    }
  })
})
