// SPDX-License-Identifier: Apache-2.0
/**
 * O validador do rascunho 0.2 (degrau 1 do ARQUITETO 4, 17/09/2026).
 *
 * O que este arquivo prende:
 *   1. o schema aceita os campos novos (`body`, `weights`, `slot/bone` com
 *      `transform`, `animation.crop`, `rig.reference`) — os casos C-290 a
 *      C-297 passam no schema;
 *   2. o socket saiu: um arquivo do 0.1 com `socket` continua abrindo, mas com
 *      aviso, nunca em silêncio (regra 21);
 *   3. as duas exceções da §4.7: um nome que vem do `rig`, e um nome que existe
 *      num corpo citado por uma chave `body`;
 *   4. os códigos de aviso novos saem com o nome da §12.3;
 *   5. a linha de comando abre `.bonez` e resolve os corpos citados do disco.
 *
 * O núcleo (`site/validador/nucleo.js`) é o mesmo que a página carrega, e a
 * linha de comando o importa: um lugar só para as regras.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'
import * as nucleo from '../../site/validador/nucleo.js'
import { validateSkeleton, validateAtlas, validateManifest } from '../../site/validador/esquema-compilado.js'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')
// Os casos do 0.2 nasceram em casos-pendentes/ e entraram em casos/ em 17/09/2026,
// quando os dois runtimes passaram. O teste os lê de onde moram agora.
const pendentes = join(raiz, 'conformidade', 'casos')
const exemplos = join(raiz, 'formato', 'exemplos')
const cli = join(raiz, 'ferramentas', 'validador', 'validar.mjs')

const VALIDADORES = { esqueleto: validateSkeleton, atlas: validateAtlas, manifesto: validateManifest }

function ajvDoCli() {
  const schema = JSON.parse(readFileSync(join(raiz, 'formato', 'bone.schema.json'), 'utf8'))
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
  addFormats(ajv)
  const id = schema.$id ?? 'bone.schema.json'
  ajv.addSchema(schema, id)
  return { esqueleto: ajv.compile({ $ref: `${id}#` }), schema }
}
const CLI = ajvDoCli()

function ler(caminho: string) {
  return JSON.parse(readFileSync(caminho, 'utf8'))
}

/** Os corpos que as chaves `body` citam, lidos da pasta do caso (a base de 2.8). */
function corposDe(doc: any, pasta: string) {
  const corpos = new Map<string, any>()
  for (const uri of nucleo.corposCitados(doc)) {
    const p = join(pasta, uri)
    corpos.set(uri, existsSync(p) ? ler(p) : null)
  }
  return corpos
}

function rodarCli(args: string[]) {
  const r = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
  return { codigo: r.status, saida: `${r.stdout}\n${r.stderr}` }
}

// ---------------------------------------------------------------------------
// 1. O schema do 0.2
// ---------------------------------------------------------------------------

describe('o schema do rascunho 0.2', () => {
  it('tem o $id do 0.2 e não conhece mais o socket', () => {
    expect(CLI.schema.$id).toContain('bone-0.2')
    // as propriedades sumiram (as descrições ainda contam a história, de propósito)
    expect(CLI.schema.definitions.attachmentPoint.properties.socket).toBeUndefined()
    expect(CLI.schema.definitions.attachmentSkeleton.properties.socket).toBeUndefined()
    expect(CLI.schema.definitions.attachmentSkeleton.properties.childSocket).toBeUndefined()
    // e conhece os campos novos
    expect(CLI.schema.definitions.timelineType.anyOf[0].enum).toEqual(
      expect.arrayContaining(['body', 'weights']),
    )
    expect(CLI.schema.definitions.key.properties.transform).toBeDefined()
    expect(CLI.schema.definitions.key.properties.keepSkins).toBeDefined()
    expect(CLI.schema.definitions.animation.properties.crop).toBeDefined()
    expect(CLI.schema.definitions.rig.properties.reference).toBeDefined()
    expect(CLI.schema.definitions.rig.properties.sockets).toBeUndefined()
  })

  const casosNovos = readdirSync(pendentes).filter((n) => /^C-29[0-7]-/.test(n))

  it('há oito casos novos, C-290 a C-297, em casos/', () => {
    expect(casosNovos).toHaveLength(8)
  })

  it.each(casosNovos)('%s: todo arquivo .bone passa no schema e no núcleo, com os corpos citados abertos', (caso) => {
    const pasta = join(pendentes, caso)
    for (const nome of readdirSync(pasta).filter((f) => f.endsWith('.bone'))) {
      const doc = ler(join(pasta, nome))
      expect(CLI.esqueleto(doc), `${caso}/${nome}: ${JSON.stringify(CLI.esqueleto.errors)}`).toBe(true)
      const r = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { corpos: corposDe(doc, pasta) })
      const erros = r.problemas.filter((p) => p.gravidade === 'erro')
      expect(erros, `${caso}/${nome}: ${JSON.stringify(erros)}`).toHaveLength(0)
    }
  })

  it('o esquema compilado da página concorda com o Ajv da linha de comando nos casos novos', () => {
    for (const caso of casosNovos) {
      const pasta = join(pendentes, caso)
      for (const nome of readdirSync(pasta).filter((f) => f.endsWith('.bone'))) {
        const doc = ler(join(pasta, nome))
        expect(validateSkeleton(doc), `${caso}/${nome}`).toBe(CLI.esqueleto(doc))
      }
    }
  })

  it('o `transform` de slot/bone é um objeto; o `offset` do deform continua inteiro', () => {
    const doc = ler(join(pendentes, 'C-295-desenho-troca-de-osso', 'entrada.bone'))
    const chave = doc.animations[0].timelines[0].keys[1]
    expect(chave.transform).toEqual({ x: 10, y: 0, rotation: -90, scaleX: 1, scaleY: 1 })
    expect(chave.offset).toBeUndefined()
    // `offset` como objeto numa chave de slot/bone é recusado: são duas coisas
    const errado = JSON.parse(JSON.stringify(doc))
    errado.animations[0].timelines[0].keys[1].offset = { x: 10 }
    expect(CLI.esqueleto(errado)).toBe(false)
    // `transform` que não é objeto também
    const errado2 = JSON.parse(JSON.stringify(doc))
    errado2.animations[0].timelines[0].keys[1].transform = 5
    expect(CLI.esqueleto(errado2)).toBe(false)
  })

  it('`crop` negativo e `rig.reference.length` zero são recusados pelo schema', () => {
    const doc = ler(join(exemplos, 'minimo.bone'))
    doc.animations = [{ name: 'a', crop: { x: 0, y: 0, width: -1, height: 10 } }]
    expect(CLI.esqueleto(doc)).toBe(false)
    const doc2 = ler(join(exemplos, 'minimo.bone'))
    doc2.rig = { bones: ['root'], reference: { bone: 'root', length: 0 } }
    expect(CLI.esqueleto(doc2)).toBe(false)
    doc2.rig.reference.length = 60
    expect(CLI.esqueleto(doc2)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 2. O socket saiu — e o arquivo velho avisa, não quebra
// ---------------------------------------------------------------------------

describe('o socket saiu do formato', () => {
  it('nenhum exemplo publicado traz socket', () => {
    for (const nome of readdirSync(exemplos).filter((f) => f.endsWith('.bone'))) {
      expect(readFileSync(join(exemplos, nome), 'utf8'), nome).not.toContain('"socket"')
    }
    expect(readFileSync(join(raiz, 'formato', 'rigs', 'humanoide-v1.bone'), 'utf8')).not.toContain('socket')
  })

  it('um arquivo do 0.1 com socket abre com aviso, nunca em silêncio', () => {
    const doc = ler(join(raiz, 'backup', 'exemplos_2026-09-17_antes-de-tirar-o-socket', 'mecha.bone'))
    const r = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    expect(r.valido).toBe(true)
    const sockets = r.problemas.filter((p) => p.codigo === 'HINT_UNKNOWN_PROPERTY')
    expect(sockets.length).toBeGreaterThanOrEqual(3) // rig.sockets, os dois point.socket, skeleton.socket/childSocket
    expect(sockets.every((p) => p.gravidade === 'aviso')).toBe(true)
    expect(sockets.map((p) => p.ponteiro)).toContain('/rig/sockets')
  })
})

// ---------------------------------------------------------------------------
// 3. As duas exceções da §4.7
// ---------------------------------------------------------------------------

describe('as referências por nome e as duas exceções', () => {
  it('um osso pode pendurar num osso do rig: a pele de fora com osso é válida', () => {
    const rabo = ler(join(raiz, 'formato', 'rigs', 'lobisomem-rabo.bone'))
    const r = nucleo.validarDocumento(rabo, 'esqueleto', VALIDADORES)
    expect(r.problemas.filter((p) => p.gravidade === 'erro')).toHaveLength(0)
    // sem o rig, o mesmo arquivo é L1 REF_BONE_MISSING
    delete rabo.rig
    const r2 = nucleo.validarDocumento(rabo, 'esqueleto', VALIDADORES)
    expect(r2.problemas.some((p) => p.codigo === 'REF_BONE_MISSING' && p.ponteiro === '/bones/1/parent')).toBe(true)
  })

  it('um alvo que só existe no corpo citado por body não é erro quando o corpo está aberto', () => {
    const pasta = join(pendentes, 'C-290-virada-corte-seco')
    const doc = ler(join(pasta, 'entrada.bone'))
    // `rabo` não existe no homem; existe no lobisomem, citado pela chave body
    const com = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { corpos: corposDe(doc, pasta) })
    expect(com.problemas.filter((p) => p.gravidade === 'erro')).toHaveLength(0)
    expect(com.problemas.some((p) => p.codigo === 'BODY_UNMET')).toBe(false)
  })

  it('sem o corpo aberto, o nome vira aviso BODY_UNMET e BODY_MISSING; nunca erro, nunca silêncio', () => {
    const doc = ler(join(pendentes, 'C-290-virada-corte-seco', 'entrada.bone'))
    const sem = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    expect(sem.valido).toBe(true)
    expect(sem.problemas.some((p) => p.codigo === 'BODY_MISSING')).toBe(true)
    expect(sem.problemas.some((p) => p.codigo === 'BODY_UNMET' && p.ponteiro === '/animations/0/timelines/3/target')).toBe(true)
  })

  it('um alvo que não existe em lugar nenhum é L1, mesmo com o corpo aberto', () => {
    const pasta = join(pendentes, 'C-290-virada-corte-seco')
    const doc = ler(join(pasta, 'entrada.bone'))
    doc.animations[0].timelines[2].target = 'osso_de_ninguem'
    const r = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { corpos: corposDe(doc, pasta) })
    expect(r.valido).toBe(false)
    expect(r.problemas.some((p) => p.codigo === 'REF_BONE_MISSING' && p.ponteiro === '/animations/0/timelines/2/target')).toBe(true)
  })

  it('slot preso a osso inexistente, pele em slot inexistente e evento não declarado são L1', () => {
    const doc = ler(join(exemplos, 'minimo.bone'))
    doc.slots.push({ name: 'solto', bone: 'nao_existe' })
    doc.skins[0].attachments.fantasma = { fantasma: { type: 'region' } }
    doc.animations = [{ name: 'a', timelines: [{ type: 'event', keys: [{ time: 0, event: 'nao_declarado' }] }] }]
    const r = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    const codigos = r.problemas.filter((p) => p.gravidade === 'erro').map((p) => p.codigo)
    expect(codigos).toContain('REF_BONE_MISSING')
    expect(codigos).toContain('REF_SLOT_MISSING')
    expect(codigos).toContain('REF_EVENT_MISSING')
  })
})

// ---------------------------------------------------------------------------
// 4. Os códigos novos
// ---------------------------------------------------------------------------

describe('os códigos do rascunho 0.2', () => {
  it('duas linhas body na mesma animação: ORDER_TIMELINE_DUPLICATE', () => {
    const pasta = join(pendentes, 'C-290-virada-corte-seco')
    const doc = ler(join(pasta, 'entrada.bone'))
    doc.animations[0].timelines.push({ type: 'body', keys: [{ time: 0.7, value: null }] })
    const r = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { corpos: corposDe(doc, pasta) })
    expect(r.problemas.some((p) => p.codigo === 'ORDER_TIMELINE_DUPLICATE' && p.gravidade === 'erro')).toBe(true)
  })

  it('chave body em 0 com outro corpo: BODY_AT_START, aviso', () => {
    const pasta = join(pendentes, 'C-290-virada-corte-seco')
    const doc = ler(join(pasta, 'entrada.bone'))
    doc.animations[0].timelines[0].keys[0].time = 0
    const r = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES, { corpos: corposDe(doc, pasta) })
    const p = r.problemas.find((q) => q.codigo === 'BODY_AT_START')
    expect(p).toBeDefined()
    expect(p!.gravidade).toBe('aviso')
    expect(r.valido).toBe(true)
  })

  it('pesos animados com tamanho errado ou soma diferente de 1: RANGE_WEIGHTS_SIZE e RANGE_WEIGHT_SUM', () => {
    const doc = ler(join(pendentes, 'C-296-pesos-animados', 'entrada.bone'))
    const bom = nucleo.validarDocumento(doc, 'esqueleto', VALIDADORES)
    expect(bom.problemas.filter((p) => p.gravidade === 'erro')).toHaveLength(0)
    const curto = JSON.parse(JSON.stringify(doc))
    curto.animations[0].timelines[1].keys[0].value = [1, 0, 1]
    expect(nucleo.validarDocumento(curto, 'esqueleto', VALIDADORES).problemas.some((p) => p.codigo === 'RANGE_WEIGHTS_SIZE')).toBe(true)
    const torto = JSON.parse(JSON.stringify(doc))
    torto.animations[0].timelines[1].keys[1].value = [0.5, 0.2, 1, 1]
    expect(nucleo.validarDocumento(torto, 'esqueleto', VALIDADORES).problemas.some((p) => p.codigo === 'RANGE_WEIGHT_SUM')).toBe(true)
  })

  it('osso comum num arquivo de pele de fora: EXTERNAL_BONE_NOT_SKIN, aviso', () => {
    const rabo = ler(join(pendentes, 'C-294-pele-externa-com-osso', 'rabo.bone'))
    rabo.bones.push({ name: 'intruso', parent: 'root' })
    const r = nucleo.validarDocumento(rabo, 'esqueleto', VALIDADORES)
    const p = r.problemas.find((q) => q.codigo === 'EXTERNAL_BONE_NOT_SKIN')
    expect(p).toBeDefined()
    expect(p!.gravidade).toBe('aviso')
    expect(p!.ponteiro).toBe('/bones/2')
  })

  it('o resumo da página nomeia a virada e os pesos animados como recursos', () => {
    const doc = ler(join(pendentes, 'C-290-virada-corte-seco', 'entrada.bone'))
    expect(nucleo.resumirEsqueleto(doc).recursos).toContain('virada')
    const doc2 = ler(join(pendentes, 'C-296-pesos-animados', 'entrada.bone'))
    expect(nucleo.resumirEsqueleto(doc2).recursos).toContain('pesosAnimados')
  })
})

// ---------------------------------------------------------------------------
// 5. A linha de comando
// ---------------------------------------------------------------------------

describe('a linha de comando', () => {
  it('abre um .bonez: manifesto, principal e atlas, cada um com o seu veredito', () => {
    const r = rodarCli([join(raiz, 'conformidade', 'casos', 'ZIP-501-manifesto', 'entrada.bonez')])
    expect(r.codigo, r.saida).toBe(0)
    expect(r.saida).toContain('(pacote)')
    expect(r.saida).toContain('manifest.json')
    expect(r.saida).toMatch(/ok\s+esqueleto\.bone/)
  })

  it('resolve do disco o corpo citado por body: o C-290 passa sem erro e sem BODY_UNMET', () => {
    const r = rodarCli([join(pendentes, 'C-290-virada-corte-seco', 'entrada.bone')])
    expect(r.codigo, r.saida).toBe(0)
    expect(r.saida).not.toContain('BODY_UNMET')
    expect(r.saida).not.toContain('BODY_MISSING')
  })

  it('os exemplos e os dois arquivos de rigs/ passam', () => {
    expect(rodarCli(['--todos']).codigo).toBe(0)
    const r = rodarCli([join(raiz, 'formato', 'rigs', 'humanoide-v1.bone'), join(raiz, 'formato', 'rigs', 'lobisomem-rabo.bone')])
    expect(r.codigo, r.saida).toBe(0)
  })

  it('--json devolve um relatório de máquina com os códigos', () => {
    const saida = execFileSync(process.execPath, [cli, '--json', join(raiz, 'backup', 'exemplos_2026-09-17_antes-de-tirar-o-socket', 'mecha.bone')], { encoding: 'utf8' })
    const rel = JSON.parse(saida)
    expect(rel.validos).toBe(1)
    expect(rel.arquivos[0].avisos.some((a: string) => a.includes('HINT_UNKNOWN_PROPERTY'))).toBe(true)
  })
})
