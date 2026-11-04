// SPDX-License-Identifier: Apache-2.0
/**
 * O `rig` no validador — degrau 12, parte `P1`, lote 4.
 *
 * A §4.8 diz, com todas as letras: *"O validador (12.3) DEVE conferir o `rig`
 * de um arquivo externo contra o hospedeiro quando tem os dois em mãos, e
 * listar cada nome que falta."* **Ele não conferia.**
 *
 * Três coisas faltavam, e este arquivo prende as três:
 *
 *   1. `RIG_UNMET` não existia no validador — só nos dois runtimes;
 *   2. `RIG_INCOMPLETE` não existia em código vivo NENHUM, nem no runtime;
 *   3. o validador carregava externos só dos corpos citados por chave `body`,
 *      e **nunca lia** `assets.animations` nem `assets.skins` — então nunca
 *      tinha hospedeiro e externo em mãos ao mesmo tempo.
 *
 * O resultado: quem validava pela linha de comando um `.bone` com animação de
 * fábrica recebia **verde** e nenhuma palavra sobre os nomes que não batiam.
 * Regra 21 da casa, na cara que engana a nós.
 */
import { describe, it, expect } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import * as nucleo from '../../site/validador/nucleo.js'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')
const cli = join(raiz, 'ferramentas', 'validador', 'validar.mjs')
const exemplos = join(raiz, 'formato', 'exemplos')

/** Um hospedeiro com os ossos e slots que se pedir. */
function hospedeiro(ossos: string[], slots: string[], externos: { animations?: string[]; skins?: string[] } = {}): any {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    assets: { animations: externos.animations ?? [], skins: externos.skins ?? [] },
    bones: [{ name: 'root' }, ...ossos.map(n => ({ name: n, parent: 'root', length: 50 }))],
    slots: slots.map(n => ({ name: n, bone: 'root' })),
    skins: [{ name: 'default', attachments: {} }],
  }
}

/** Um arquivo de animações externo: `bones` só com a raiz, e um `rig`. */
function arquivoDeAnimacoes(rig: any, alvos: Array<[string, string]> = []): any {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [],
    skins: [],
    rig,
    animations: [{
      name: 'andar', duration: 1,
      timelines: alvos.map(([tipo, alvo]) => ({
        type: tipo, target: alvo,
        property: tipo === 'bone' ? 'rotation' : 'color',
        keys: [{ time: 0, value: tipo === 'bone' ? 0 : [1, 1, 1, 1] }],
      })),
    }],
  }
}

const codigos = (ps: Array<{ codigo?: string }>) => ps.map(p => p.codigo).filter(Boolean)

// ---------------------------------------------------------------------------
// 1. Sem os dois em mãos, nada é acusado
// ---------------------------------------------------------------------------

describe('sem o arquivo externo em mãos, o validador se cala', () => {
  it('não acusa nada quando o mapa de externos não vem', () => {
    // Não ter o arquivo não é o mesmo que o nome faltar. Um aviso aqui seria
    // um palpite, e palpite silencioso é o que a regra 21 proíbe.
    const doc = hospedeiro([], [], { animations: ['andar.bone'] })
    expect(nucleo.checarRig(doc, {})).toEqual([])
  })

  it('nem quando o externo é citado mas não abriu', () => {
    const doc = hospedeiro([], [], { animations: ['andar.bone'] })
    const externos = new Map([['andar.bone', null]])
    expect(nucleo.checarRig(doc, { externos })).toEqual([])
  })

  it('`externosCitados` junta as duas listas, sem repetir', () => {
    const doc = hospedeiro([], [], { animations: ['a.bone', 'b.bone'], skins: ['b.bone', 'c.bone'] })
    expect(nucleo.externosCitados(doc)).toEqual([
      { uri: 'a.bone', lista: 'animations' },
      { uri: 'b.bone', lista: 'animations' },
      { uri: 'c.bone', lista: 'skins' },
    ])
  })
})

// ---------------------------------------------------------------------------
// 2. RIG_UNMET — cada nome que falta, um aviso
// ---------------------------------------------------------------------------

describe('RIG_UNMET (L2)', () => {
  it('lista CADA osso que o corpo não tem, um por um', () => {
    // A §4.8 pede "listar cada nome que falta", e não "avisar que algo falta".
    // Quem lê o relatório precisa saber quais renomear.
    const doc = hospedeiro(['quadril'], [], { animations: ['andar.bone'] })
    const ext = arquivoDeAnimacoes({ bones: ['quadril', 'tronco', 'cabeca'], slots: [] },
      [['bone', 'quadril'], ['bone', 'tronco'], ['bone', 'cabeca']])
    const ps = nucleo.checarRig(doc, { externos: new Map([['andar.bone', ext]]) })
    const unmet = ps.filter(p => p.codigo === 'RIG_UNMET')
    expect(unmet).toHaveLength(2)
    expect(unmet.every(p => p.gravidade === 'aviso')).toBe(true)
    expect(unmet.map(p => p.texto).join(' ')).toContain('tronco')
    expect(unmet.map(p => p.texto).join(' ')).toContain('cabeca')
    expect(unmet.every(p => p.ponteiro === '/assets/animations')).toBe(true)
  })

  it('lista também os slots que faltam', () => {
    const doc = hospedeiro([], ['corpo'], { skins: ['inverno.bone'] })
    const ext = { ...arquivoDeAnimacoes({ bones: [], slots: ['corpo', 'capuz'] }), skins: [] }
    const ps = nucleo.checarRig(doc, { externos: new Map([['inverno.bone', ext]]) })
    const unmet = ps.filter(p => p.codigo === 'RIG_UNMET')
    expect(unmet).toHaveLength(1)
    expect(unmet[0].texto).toContain('capuz')
    expect(unmet[0].ponteiro).toBe('/assets/skins')
  })

  it('cala quando o corpo tem tudo', () => {
    const doc = hospedeiro(['quadril', 'tronco'], ['corpo'], { animations: ['andar.bone'] })
    const ext = arquivoDeAnimacoes({ bones: ['quadril', 'tronco'], slots: ['corpo'] },
      [['bone', 'quadril'], ['bone', 'tronco'], ['slot', 'corpo']])
    expect(nucleo.checarRig(doc, { externos: new Map([['andar.bone', ext]]) })).toEqual([])
  })

  it('o osso de `rig.reference` que falta também é RIG_UNMET (2.8)', () => {
    // Sem ele o ajuste de tamanho vira k = 1, e a animação entra do tamanho
    // errado — em silêncio, se ninguém avisar.
    const doc = hospedeiro(['quadril'], [], { animations: ['andar.bone'] })
    const ext = arquivoDeAnimacoes({ bones: ['quadril'], reference: { bone: 'tronco', length: 70 } },
      [['bone', 'quadril']])
    const ps = nucleo.checarRig(doc, { externos: new Map([['andar.bone', ext]]) })
    const unmet = ps.filter(p => p.codigo === 'RIG_UNMET')
    expect(unmet).toHaveLength(1)
    expect(unmet[0].texto).toContain('tronco')
    expect(unmet[0].texto).toContain('k = 1')
  })

  it('o osso de `rig.reference` com `length` zero também', () => {
    const doc = hospedeiro([], [], { animations: ['andar.bone'] })
    doc.bones.push({ name: 'tronco', parent: 'root', length: 0 })
    const ext = arquivoDeAnimacoes({ bones: [], reference: { bone: 'tronco', length: 70 } })
    const ps = nucleo.checarRig(doc, { externos: new Map([['andar.bone', ext]]) })
    expect(codigos(ps)).toContain('RIG_UNMET')
    expect(ps[0].texto).toContain('length zero')
  })
})

// ---------------------------------------------------------------------------
// 3. RIG_INCOMPLETE — o rig que cita menos do que o arquivo usa
// ---------------------------------------------------------------------------

describe('RIG_INCOMPLETE (L2)', () => {
  it('pega a animação que anima um osso e não o declara', () => {
    // Este é o caso que não existia em código vivo NENHUM, nem no runtime.
    // O arquivo é válido sozinho: o osso `tronco` está lá dentro. Mas os
    // `bones` de um arquivo de animações são IGNORADOS na importação (2.8),
    // então o hospedeiro precisa ter `tronco` e ninguém declarou isso.
    const doc = hospedeiro(['quadril', 'tronco'], [], { animations: ['andar.bone'] })
    const ext = arquivoDeAnimacoes({ bones: ['quadril'] }, [['bone', 'quadril'], ['bone', 'tronco']])
    ext.bones.push({ name: 'tronco', parent: 'root' })
    const ps = nucleo.checarRig(doc, { externos: new Map([['andar.bone', ext]]) })
    const inc = ps.filter(p => p.codigo === 'RIG_INCOMPLETE')
    expect(inc).toHaveLength(1)
    expect(inc[0].gravidade).toBe('aviso')
    expect(inc[0].texto).toContain('tronco')
    // e não acusa RIG_UNMET: o hospedeiro TEM os dois
    expect(codigos(ps)).not.toContain('RIG_UNMET')
  })

  it('pega o slot animado e não declarado', () => {
    const doc = hospedeiro(['quadril'], ['corpo'], { animations: ['andar.bone'] })
    const ext = arquivoDeAnimacoes({ bones: ['quadril'], slots: [] },
      [['bone', 'quadril'], ['slot', 'corpo']])
    const inc = nucleo.checarRig(doc, { externos: new Map([['andar.bone', ext]]) })
      .filter(p => p.codigo === 'RIG_INCOMPLETE')
    expect(inc).toHaveLength(1)
    expect(inc[0].texto).toContain('corpo')
  })

  it('pega a pele que preenche um slot do hospedeiro sem declará-lo', () => {
    const doc = hospedeiro([], ['corpo'], { skins: ['inverno.bone'] })
    const ext = {
      bone: { version: '1.0', generator: 'teste' }, bones: [{ name: 'root' }], slots: [],
      rig: { slots: [] },
      skins: [{ name: 'inverno', attachments: { corpo: { casaco: { type: 'region' } } } }],
    }
    const inc = nucleo.checarRig(doc, { externos: new Map([['inverno.bone', ext]]) })
      .filter(p => p.codigo === 'RIG_INCOMPLETE')
    expect(inc).toHaveLength(1)
    expect(inc[0].texto).toContain('corpo')
  })

  it('a pele que TRAZ o próprio slot está completa: nada a declarar', () => {
    // É o `rigs/lobisomem-rabo.bone`: o rabo traz os slots dele, e eles entram
    // no fim do array do corpo (2.8). O hospedeiro não precisa tê-los, e um
    // aviso aqui seria falso.
    const doc = hospedeiro([], [], { skins: ['rabo.bone'] })
    doc.bones.push({ name: 'quadril', parent: 'root', length: 50 })
    const ext = {
      bone: { version: '1.0', generator: 'teste' }, bones: [{ name: 'root' }],
      slots: [{ name: 'rabo', bone: 'rabo' }],
      rig: { bones: ['quadril'] },
      skins: [{ name: 'lobo', attachments: { rabo: { rabo: { type: 'region' } } } }],
    }
    expect(nucleo.checarRig(doc, { externos: new Map([['rabo.bone', ext]]) })).toEqual([])
  })

  it('acusa também no arquivo SOLTO que tem `rig`', () => {
    // Este teste dizia o contrário: que o arquivo solto era poupado, para não
    // encher de aviso quem só traz a linha do contrato. Reescrito, não
    // apagado, por decisão do Planejador em 18/09 — e depois de medir: a conta
    // roda sobre os 110 `.bone` do projeto (12 com `rig`) e não acusa NENHUM.
    //
    // O motivo de medir no solto: um `rig` incompleto num arquivo que vai ser
    // DISTRIBUÍDO faz o hospedeiro aplicar menos do que devia, em silêncio.
    // Ele não tem como reclamar do que o rig não citou, e quem publicou nunca
    // descobre.
    const solto = arquivoDeAnimacoes({ name: 'humanoide-v1', bones: [] }, [['bone', 'tronco']])
    const ps = nucleo.checarRig(solto, {})
    expect(ps).toHaveLength(1)
    expect(ps[0].codigo).toBe('RIG_INCOMPLETE')
    expect(ps[0].gravidade).toBe('aviso')
    expect(ps[0].ponteiro).toBe('/rig/bones')
    expect(ps[0].texto).toContain('tronco')
  })

  it('no solto, o osso `skinRequired` é descontado: a pele o leva junto', () => {
    // É o desconto que mata o falso positivo. Um osso `skinRequired` viaja com
    // a pele (2.8) e o hospedeiro não precisa tê-lo.
    const solto = arquivoDeAnimacoes({ bones: [] }, [['bone', 'rabo']])
    solto.bones.push({ name: 'rabo', parent: 'root', skinRequired: true })
    expect(nucleo.checarRig(solto, {})).toEqual([])
  })

  it('no solto, o osso COMUM não é descontado — e é aí que mora o defeito', () => {
    // Os `bones` de um arquivo de animações são IGNORADOS na importação (2.8).
    // O arquivo parece são sozinho — o osso está lá dentro — e chega quebrado
    // no hospedeiro.
    const solto = arquivoDeAnimacoes({ bones: [] }, [['bone', 'tronco']])
    solto.bones.push({ name: 'tronco', parent: 'root' })
    expect(codigos(nucleo.checarRig(solto, {}))).toContain('RIG_INCOMPLETE')
  })

  it('no solto, o slot local é descontado', () => {
    const solto = arquivoDeAnimacoes({ bones: [], slots: [] })
    solto.slots.push({ name: 'rabo', bone: 'root' })
    solto.skins.push({ name: 'lobo', attachments: { rabo: { rabo: { type: 'region' } } } })
    expect(nucleo.checarRig(solto, {})).toEqual([])
  })

  it('arquivo sem `rig` nenhum não é medido', () => {
    const semRig = arquivoDeAnimacoes(undefined, [['bone', 'tronco']])
    delete semRig.rig
    expect(nucleo.checarRig(semRig, {})).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// 3b. A medição que decidiu a regra do arquivo solto
// ---------------------------------------------------------------------------

describe('a medição: zero falso positivo, e pega o defeito de verdade', () => {
  const fabrica = join(raiz, 'formato', 'rigs', 'humanoide-v1-animacoes.bone')

  it('as quatro animações de fábrica passam limpas', () => {
    // O chat `B` conferiu este arquivo À MÃO ao fazê-lo, porque o validador
    // não conferia: "senão seria RIG_INCOMPLETE no arquivo que serve de
    // exemplo a todo mundo". Agora é o validador que confere.
    const doc = JSON.parse(readFileSync(fabrica, 'utf8'))
    expect(doc.animations.map((a: any) => a.name)).toEqual(['parado', 'andar', 'correr', 'pular'])
    expect(nucleo.checarRig(doc, {})).toEqual([])
  })

  it('e com um nome tirado do rig, o aviso aparece', () => {
    // A prova de que o zero acima vale alguma coisa: uma regra que nunca
    // acusa nada também daria zero, e não serviria para nada.
    const doc = JSON.parse(readFileSync(fabrica, 'utf8'))
    doc.rig.bones = doc.rig.bones.filter((n: string) => n !== 'tronco')
    const ps = nucleo.checarRig(doc, {}).filter(p => p.codigo === 'RIG_INCOMPLETE')
    expect(ps).toHaveLength(1)
    expect(ps[0].texto).toContain('tronco')
  })

  it('nenhum `.bone` do projeto com `rig` é acusado', () => {
    // A medição de 18/09, presa aqui para não ter de ser refeita à mão: se
    // alguém gravar um arquivo com rig incompleto, este teste cai e diz qual.
    const acusados: string[] = []
    const varrer = (dir: string): void => {
      for (const n of readdirSync(dir, { withFileTypes: true })) {
        if (['node_modules', 'backup', '.git', 'dist', '__pycache__'].includes(n.name)) continue
        const p = join(dir, n.name)
        if (n.isDirectory()) varrer(p)
        else if (n.name.endsWith('.bone')) {
          let doc: any
          try { doc = JSON.parse(readFileSync(p, 'utf8')) } catch { continue }
          if (!doc?.rig || typeof doc.rig !== 'object') continue
          if (nucleo.checarRig(doc, {}).some(x => x.codigo === 'RIG_INCOMPLETE')) acusados.push(p.slice(raiz.length + 1))
        }
      }
    }
    varrer(raiz)
    expect(acusados).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// 4. RIG_REFERENCE — L1, e é do próprio arquivo
// ---------------------------------------------------------------------------

describe('RIG_REFERENCE (L1)', () => {
  it.each([0, -1, -70])('recusa `reference.length` %s', (n) => {
    const doc = arquivoDeAnimacoes({ bones: ['quadril'], reference: { bone: 'quadril', length: n } })
    const ps = nucleo.checarRig(doc, {})
    expect(ps).toHaveLength(1)
    expect(ps[0].codigo).toBe('RIG_REFERENCE')
    expect(ps[0].gravidade).toBe('erro')
    expect(ps[0].ponteiro).toBe('/rig/reference/length')
  })

  it('aceita um `length` positivo', () => {
    const doc = arquivoDeAnimacoes({ bones: ['quadril'], reference: { bone: 'quadril', length: 70 } })
    expect(nucleo.checarRig(doc, {})).toEqual([])
  })

  it('é erro, e derruba a validade do arquivo', () => {
    const doc = arquivoDeAnimacoes({ bones: [], reference: { bone: 'quadril', length: 0 } })
    expect(nucleo.checarSemantica(doc).some(p => p.codigo === 'RIG_REFERENCE' && p.gravidade === 'erro')).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 5. A linha de comando: ela agora LÊ os externos do disco
// ---------------------------------------------------------------------------

describe('a linha de comando lê `assets.animations` e `assets.skins` do disco', () => {
  function rodar(args: string[]): { texto: string; codigo: number } {
    try {
      const texto = execFileSync(process.execPath, [cli, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
      return { texto, codigo: 0 }
    } catch (e: any) {
      return { texto: `${e.stdout ?? ''}${e.stderr ?? ''}`, codigo: e.status ?? 1 }
    }
  }

  it('acusa o nome que falta, com o nome escrito', () => {
    // É o cenário exato do encargo: um `.bone` que usa animação de fábrica.
    // Antes deste lote, isto saía VERDE e sem uma palavra.
    const tmp = mkdtempSync(join(tmpdir(), 'rig-'))
    try {
      writeFileSync(join(tmp, 'heroi.bone'), JSON.stringify(
        hospedeiro(['quadril'], [], { animations: ['andar.bone'] })))
      writeFileSync(join(tmp, 'andar.bone'), JSON.stringify(
        arquivoDeAnimacoes({ name: 'humanoide-v1', bones: ['quadril', 'tronco', 'cabeca'] },
          [['bone', 'quadril'], ['bone', 'tronco'], ['bone', 'cabeca']])))
      const { texto } = rodar([join(tmp, 'heroi.bone')])
      expect(texto).toContain('RIG_UNMET')
      expect(texto).toContain('tronco')
      expect(texto).toContain('cabeca')
      // L2 não derruba o arquivo: ele continua válido, e abre.
      expect(texto).toContain('OK')
    } finally {
      rmSync(tmp, { recursive: true, force: true })
    }
  })

  it('o `mecha.bone` de exemplo continua limpo: nenhum falso positivo', () => {
    // Ele cita os DOIS tipos de externo e o rig dele bate. Se este teste ficar
    // vermelho, a regra nova passou a acusar arquivo bom.
    const { texto, codigo } = rodar([join(exemplos, 'mecha.bone')])
    expect(codigo).toBe(0)
    expect(texto).not.toContain('RIG_UNMET')
    expect(texto).not.toContain('RIG_INCOMPLETE')
  })

  it('os exemplos da pasta continuam todos válidos', () => {
    const { texto, codigo } = rodar(['--todos'])
    expect(codigo).toBe(0)
    expect(texto).toContain('0 com erro')
  })
})

// ---------------------------------------------------------------------------
// 6. Os três códigos estão na spec
// ---------------------------------------------------------------------------

describe('os três códigos estão escritos na §12.3', () => {
  const spec = readFileSync(join(raiz, 'formato', 'ESPECIFICACAO 2026-09-17.md'), 'utf8')

  it.each(['RIG_UNMET', 'RIG_INCOMPLETE', 'RIG_REFERENCE'])('`%s` tem linha na tabela', (codigo) => {
    expect(spec).toContain(`| \`${codigo}\` |`)
  })

  it('a §4.8 continua mandando o validador conferir', () => {
    expect(spec).toContain('O validador (12.3) **DEVE** conferir o `rig` de um arquivo externo')
  })
})
