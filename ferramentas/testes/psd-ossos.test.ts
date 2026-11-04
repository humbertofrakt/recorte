// SPDX-License-Identifier: Apache-2.0
// Lote 45 — ossos desenhados no PSD (rodada 4, resposta D9 do Humberto).
//
// As camadas são pintadas aqui mesmo, pixel a pixel: o teste sabe onde cada
// linha e cada bolinha estão, e cobra o osso de volta com o valor esperado.
// No fim, o herói inteiro faz a volta pela linha de comando.

import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { psdPlacement, psdToBoneFile, readPsd } from '../src/importar/psd.ts'
import type { PsdDocument, PsdLayer } from '../src/importar/psd.ts'
import {
  assignLayersToBones, hierarchyFromStrokes, isBonesLayer, strokesFromLayer,
} from '../src/importar/psd-bones.ts'
import type { BoneStroke, Point } from '../src/importar/psd-bones.ts'
import type { Bone, BoneFile, Slot } from '../src/importar/comum.ts'
import {
  BONES_LAYER_SKIPPED_EDITOR, splitBonesLayers, writePsdIntoFile,
} from '../../editor/src/io/import-psd.ts'
import { fileMenu, flatEntries } from '../../editor/src/ui/menus.ts'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')

// ---------------------------------------------------------------------------
// Pintar
// ---------------------------------------------------------------------------

const W = 200
const H = 300

function vazia(w = W, h = H): Uint8Array {
  return new Uint8Array(w * h * 4)
}

function pintar(px: Uint8Array, w: number, h: number, dentro: (x: number, y: number) => boolean): void {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!dentro(x + 0.5, y + 0.5)) continue
      const i = (y * w + x) * 4
      px[i] = 200
      px[i + 1] = 20
      px[i + 2] = 40
      px[i + 3] = 255
    }
  }
}

function distSeg(p: Point, a: Point, b: Point): number {
  const vx = b.x - a.x
  const vy = b.y - a.y
  const l2 = vx * vx + vy * vy
  const u = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / l2))
  return Math.hypot(p.x - (a.x + u * vx), p.y - (a.y + u * vy))
}

function linha(px: Uint8Array, a: Point, b: Point, meia = 1.5): void {
  pintar(px, W, H, (x, y) => distSeg({ x, y }, a, b) <= meia)
}

function bola(px: Uint8Array, c: Point, r = 5): void {
  pintar(px, W, H, (x, y) => Math.hypot(x - c.x, y - c.y) <= r)
}

function camada(name: string, pixels: Uint8Array, x = 0, y = 0, w = W, h = H): PsdLayer {
  const corte = name.lastIndexOf('/')
  return {
    name,
    folder: corte < 0 ? '' : name.slice(0, corte),
    leaf: name.slice(corte + 1),
    x, y, width: w, height: h, pixels,
    opacity: 1, visible: true, blendMode: 'norm', hasMask: false,
  }
}

function documento(layers: PsdLayer[]): PsdDocument {
  return { width: W, height: H, channels: 4, depth: 8, colorMode: 3, psb: false, layers, warnings: [] }
}

// A corrente do plano: quadril → tronco → cabeça, com uma bolinha em cada base.
const Q = { base: { x: 100, y: 250 }, tip: { x: 104, y: 200 } }
const T = { base: { x: 104, y: 200 }, tip: { x: 95, y: 130 } }
const C = { base: { x: 95, y: 130 }, tip: { x: 110, y: 95 } }
const CORRENTE = [Q, T, C]

/** Ângulo no mundo do `.bone` (y para cima), em graus. */
function anguloMundo(s: { base: Point; tip: Point }): number {
  return (Math.atan2(-(s.tip.y - s.base.y), s.tip.x - s.base.x) * 180) / Math.PI
}

function giro(a: number): number {
  let v = a % 360
  if (v <= -180) v += 360
  if (v > 180) v -= 360
  return v
}

function correnteNumaCamada(): Uint8Array {
  const px = vazia()
  for (const s of CORRENTE) {
    linha(px, s.base, s.tip)
    bola(px, s.base)
  }
  return px
}

/** O desenho do tronco: um retângulo opaco em volta dele. */
function desenhoDoTronco(): PsdLayer {
  const w = 30
  const h = 50
  return camada('corpo/tronco', new Uint8Array(w * h * 4).fill(255), 85, 140, w, h)
}

/** O mundo de cada osso, somando os pais — escala 1, sem cisalhamento. */
function mundoDe(bones: readonly Bone[]): Map<string, { x: number; y: number; rotation: number }> {
  const m = new Map<string, { x: number; y: number; rotation: number }>()
  for (const b of bones) {
    const p = b.parent === undefined ? { x: 0, y: 0, rotation: 0 } : m.get(b.parent)!
    const r = (p.rotation * Math.PI) / 180
    const x = b.x ?? 0
    const y = b.y ?? 0
    m.set(b.name, {
      x: p.x + x * Math.cos(r) - y * Math.sin(r),
      y: p.y + x * Math.sin(r) + y * Math.cos(r),
      rotation: p.rotation + (b.rotation ?? 0),
    })
  }
  return m
}

/** O índice da linha cuja base cai em `p`. */
function naBase(strokes: readonly BoneStroke[], p: Point): number {
  return strokes.findIndex((s) => Math.hypot(s.base.x - p.x, s.base.y - p.y) <= 1.5)
}

// ---------------------------------------------------------------------------
// As linhas de uma camada
// ---------------------------------------------------------------------------

describe('strokesFromLayer — as linhas de uma camada', () => {
  it('três linhas que se tocam, com bolinha em cada base: três linhas, base no centro da bolinha', () => {
    const strokes = strokesFromLayer(correnteNumaCamada(), W, H)
    expect(strokes).toHaveLength(3)
    for (const s of CORRENTE) {
      const i = naBase(strokes, s.base)
      expect(i, `base em ${s.base.x},${s.base.y}`).toBeGreaterThanOrEqual(0)
      expect(strokes[i]!.ball).toBe(true)
      expect(Math.abs(giro(anguloMundo(strokes[i]!) - anguloMundo(s)))).toBeLessThanOrEqual(1)
    }
  })

  it('a camada começa longe do canto: as linhas voltam na tela do PSD', () => {
    const px = vazia()
    linha(px, { x: 20, y: 80 }, { x: 20, y: 20 })
    bola(px, { x: 20, y: 80 })
    const [s] = strokesFromLayer(px, W, H, { x: 300, y: 40 })
    expect(s!.base.x).toBeCloseTo(320, 0)
    expect(s!.base.y).toBeCloseTo(120, 0)
  })

  it('uma reta com três bolinhas no caminho: a bolinha corta, e saem três ossos', () => {
    const px = vazia()
    linha(px, { x: 100, y: 280 }, { x: 100, y: 40 })
    for (const y of [280, 200, 120]) bola(px, { x: 100, y })
    const strokes = strokesFromLayer(px, W, H)
    expect(strokes).toHaveLength(3)
    expect(strokes.every((s) => s.ball)).toBe(true)
    for (const y of [280, 200, 120]) expect(naBase(strokes, { x: 100, y })).toBeGreaterThanOrEqual(0)
  })

  it('bolinha que não encosta em linha nenhuma: fica de fora, com aviso', () => {
    const px = vazia()
    linha(px, { x: 40, y: 250 }, { x: 40, y: 150 })
    bola(px, { x: 40, y: 250 })
    bola(px, { x: 160, y: 60 })
    const warnings: string[] = []
    const strokes = strokesFromLayer(px, W, H, { warnings })
    expect(strokes).toHaveLength(1)
    expect(warnings.join(' ')).toContain('bolinha')
  })

  it('camada vazia: nenhuma linha', () => {
    expect(strokesFromLayer(vazia(), W, H)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// Quem é filho de quem
// ---------------------------------------------------------------------------

function traco(base: Point, tip: Point, ball = true): BoneStroke {
  return { base, tip, ball, radius: ball ? 5 : 0, halfWidth: 2 }
}

describe('hierarchyFromStrokes — quem é filho de quem', () => {
  it('a corrente: tronco filho do quadril, cabeça filha do tronco, quadril na raiz', () => {
    const { strokes, parents } = hierarchyFromStrokes(strokesFromLayer(correnteNumaCamada(), W, H))
    const q = naBase(strokes, Q.base)
    const t = naBase(strokes, T.base)
    const c = naBase(strokes, C.base)
    expect(parents[q]).toBeNull()
    expect(parents[t]).toBe(q)
    expect(parents[c]).toBe(t)
  })

  it('sem bolinha: a ponta que encosta no corpo do outro vira a base', () => {
    const { strokes, parents } = hierarchyFromStrokes([
      traco({ x: 50, y: 250 }, { x: 50, y: 150 }),
      // Escrita ao contrário de propósito: a ponta (50, 200) é que encosta.
      traco({ x: 100, y: 170 }, { x: 50, y: 200 }, false),
    ])
    expect(strokes[1]!.base).toEqual({ x: 50, y: 200 })
    expect(parents[1]).toBe(0)
  })

  it('encruzilhada: três bases no mesmo ponto, e a linha mais curta é o pai', () => {
    const { parents } = hierarchyFromStrokes([
      traco({ x: 102, y: 102 }, { x: 110, y: 160 }),
      traco({ x: 100, y: 100 }, { x: 110, y: 100 }),
      traco({ x: 98, y: 102 }, { x: 90, y: 160 }),
    ])
    expect(parents).toEqual([1, null, 1])
  })

  it('duas bases juntas, do mesmo tamanho: irmãs, e o pai é a linha em que as duas encostam', () => {
    const { parents } = hierarchyFromStrokes([
      traco({ x: 100, y: 250 }, { x: 100, y: 100 }),
      traco({ x: 110, y: 150 }, { x: 140, y: 190 }),
      traco({ x: 108, y: 156 }, { x: 130, y: 200 }),
    ])
    expect(parents).toEqual([null, 0, 0])
  })

  it('o centro da encruzilhada não vira filho de uma linha que só passa perto dele', () => {
    const { parents } = hierarchyFromStrokes([
      traco({ x: 102, y: 102 }, { x: 110, y: 160 }),
      traco({ x: 100, y: 100 }, { x: 110, y: 100 }),
      traco({ x: 98, y: 102 }, { x: 90, y: 160 }),
      // Um braço que desce por cima da bacia, a menos de 12 px da base dela.
      traco({ x: 80, y: 60 }, { x: 96, y: 130 }),
    ])
    expect(parents[1]).toBeNull()
    expect(parents[0]).toBe(1)
    expect(parents[2]).toBe(1)
  })

  it('base a mais de 12 px de tudo: filha de root', () => {
    const { parents } = hierarchyFromStrokes([
      traco({ x: 50, y: 250 }, { x: 50, y: 150 }),
      traco({ x: 70, y: 200 }, { x: 120, y: 200 }),
    ])
    expect(parents).toEqual([null, null])
  })
})

describe('assignLayersToBones — cada desenho no osso que o cobre', () => {
  it('o retângulo do tronco é coberto pela linha do tronco', () => {
    const strokes = CORRENTE.map((s) => traco(s.base, s.tip))
    expect(assignLayersToBones([desenhoDoTronco()], strokes)).toEqual([1])
  })

  it('nenhuma linha cobre: o osso mais perto do centro do desenho', () => {
    const strokes = CORRENTE.map((s) => traco(s.base, s.tip))
    const longe = camada('pe', new Uint8Array(10 * 10 * 4).fill(255), 140, 250, 10, 10)
    expect(assignLayersToBones([longe], strokes)).toEqual([0])
  })
})

// ---------------------------------------------------------------------------
// Do PSD ao .bone
// ---------------------------------------------------------------------------

describe('psdToBoneFile com bonesLayer', () => {
  const doc = documento([desenhoDoTronco(), camada('ossos', correnteNumaCamada())])
  const { file, boneNames, slotNames } = psdToBoneFile(doc, { bonesLayer: true })
  const bones = file.bones as Bone[]

  it('a corrente vira root + osso_1, osso_2, osso_3, cada um filho do anterior', () => {
    expect(bones.map((b) => b.name)).toEqual(['root', 'osso_1', 'osso_2', 'osso_3'])
    expect(boneNames).toEqual(['osso_1', 'osso_2', 'osso_3'])
    expect(bones[1]!.parent).toBe('root')
    expect(bones[2]!.parent).toBe('osso_1')
    expect(bones[3]!.parent).toBe('osso_2')
  })

  it('os ângulos no mundo são os desenhados, até 1°', () => {
    const mundo = mundoDe(bones)
    CORRENTE.forEach((s, i) => {
      const w = mundo.get(`osso_${i + 1}`)!
      expect(Math.abs(giro(w.rotation - anguloMundo(s))), `osso_${i + 1}`).toBeLessThanOrEqual(1)
    })
  })

  it('o desenho sobre o tronco vai para osso_2 e cai no mesmo lugar da tela', () => {
    const slot = (file.slots as Slot[]).find((s) => s.name === 'tronco')!
    expect(slot.bone).toBe('osso_2')
    const anexo = file.skins![0]!.attachments!['tronco']!['tronco'] as Record<string, number>
    const w = mundoDe(bones).get('osso_2')!
    const r = (w.rotation * Math.PI) / 180
    const x = w.x + anexo.x! * Math.cos(r) - anexo.y! * Math.sin(r)
    const y = w.y + anexo.x! * Math.sin(r) + anexo.y! * Math.cos(r)
    const esperado = psdPlacement(doc, doc.layers[0]!)
    expect(Math.abs(x - esperado.x)).toBeLessThanOrEqual(0.05)
    expect(Math.abs(y - esperado.y)).toBeLessThanOrEqual(0.05)
    expect(Math.abs(giro(w.rotation + (anexo.rotation ?? 0)))).toBeLessThanOrEqual(0.01)
  })

  it('a camada ossos não vira slot nem desenho', () => {
    expect(slotNames).toEqual(['tronco'])
    expect((file.slots as Slot[]).map((s) => s.name)).toEqual(['tronco'])
  })

  it('um grupo ossos com uma camada por linha dá o mesmo esqueleto', () => {
    const separadas = CORRENTE.map((s, i) => {
      const px = vazia()
      linha(px, s.base, s.tip)
      bola(px, s.base)
      return camada(`ossos/linha ${i + 1}`, px)
    })
    const outro = psdToBoneFile(documento([desenhoDoTronco(), ...separadas]), { bonesLayer: true })
    const pais = (outro.file.bones as Bone[]).map((b) => [b.name, b.parent ?? null])
    expect(pais).toEqual([['root', null], ['osso_1', 'root'], ['osso_2', 'osso_1'], ['osso_3', 'osso_2']])
  })

  it('PSD sem camada ossos: o .bone é o de hoje, byte a byte, e o aviso diz por quê', () => {
    const semOssos = documento([desenhoDoTronco()])
    const hoje = psdToBoneFile(semOssos)
    const comOpcao = psdToBoneFile(semOssos, { bonesLayer: true })
    expect(JSON.stringify(comOpcao.file)).toBe(JSON.stringify(hoje.file))
    expect(comOpcao.warnings.join(' ')).toContain('Não há camada "ossos"')
  })

  it('sem a opção, a camada ossos fica de fora — nunca vira desenho —, com um aviso', () => {
    const hoje = psdToBoneFile(doc)
    expect(hoje.slotNames).toEqual(['tronco'])
    expect((hoje.file.bones as Bone[]).map((b) => b.name)).toEqual(['root'])
    expect(hoje.warnings.filter((w) => w.includes('"ossos" ignorada'))).toHaveLength(1)
    expect(hoje.warnings.join(' ')).toContain('PSD com ossos')
  })

  it('isBonesLayer: o nome ou o grupo, sem ligar para maiúscula', () => {
    expect(['ossos', 'Ossos', 'ossos/linha', 'corpo/ossos', ' OSSOS '].map((name) => isBonesLayer({ name })))
      .toEqual([true, true, true, true, true])
    expect(['ossinho', 'corpo', 'ossos2/linha'].map((name) => isBonesLayer({ name })))
      .toEqual([false, false, false])
  })
})

// ---------------------------------------------------------------------------
// O editor: o mesmo módulo, pelo menu
// ---------------------------------------------------------------------------

describe('editor: Arquivo → Importar → PSD com ossos…', () => {
  type EditorFile = Parameters<typeof writePsdIntoFile>[0]
  const novo = (bones: Array<{ name: string; parent?: string }>): EditorFile =>
    ({ bone: { version: '1.0' }, bones, slots: [], skins: [] }) as unknown as EditorFile

  it('substituir: os ossos entram no arquivo e o desenho vai para o osso que o cobre', () => {
    const file = novo([{ name: 'root' }])
    const result = writePsdIntoFile(file, documento([desenhoDoTronco()]), {
      mode: 'substituir', atlasName: 'x.atlas.json', bonesLayers: [camada('ossos', correnteNumaCamada())],
    })
    expect(result.boneNames).toEqual(['osso_1', 'osso_2', 'osso_3'])
    expect(file.bones.map((b) => b.name)).toEqual(['root', 'osso_1', 'osso_2', 'osso_3'])
    expect(file.slots!.find((s) => s.name === 'tronco')!.bone).toBe('osso_2')
  })

  it('acrescentar num arquivo que já tem osso_1: os novos pulam o nome', () => {
    const file = novo([{ name: 'root' }, { name: 'osso_1', parent: 'root' }])
    const result = writePsdIntoFile(file, documento([desenhoDoTronco()]), {
      mode: 'acrescentar', atlasName: 'x.atlas.json', bonesLayers: [camada('ossos', correnteNumaCamada())],
    })
    expect(result.boneNames).toEqual(['osso_2', 'osso_3', 'osso_4'])
    expect(file.bones.find((b) => b.name === 'osso_2')!.parent).toBe('root')
  })

  it('sem camadas de ossos, o import de sempre', () => {
    const file = novo([{ name: 'root' }])
    const result = writePsdIntoFile(file, documento([desenhoDoTronco()]), {
      mode: 'substituir', atlasName: 'x.atlas.json',
    })
    expect(result.boneNames).toEqual([])
    expect(file.slots![0]!.bone).toBe('root')
  })

  it('o menu tem "PSD com ossos…", logo depois de "PSD…"', () => {
    const importar = flatEntries(fileMenu()).find((e) => e.action === 'importar')
    const itens = flatEntries(importar?.children ?? [])
    const rotulos = itens.map((e) => e.label)
    expect(rotulos.indexOf('PSD com ossos…')).toBe(rotulos.indexOf('PSD…') + 1)
    expect(itens.find((e) => e.label === 'PSD com ossos…')?.action).toBe('importar-psd-ossos')
  })
})

// ---------------------------------------------------------------------------
// O heroi.psd de exemplo, pelo importador de sempre
// ---------------------------------------------------------------------------

describe('o heroi.psd pelo PSD… de sempre: a camada ossos fica de fora', () => {
  const arquivo = resolve(raiz, 'formato', 'exemplos', 'heroi.psd')

  it('linha de comando e módulo: 19 slots, nenhum da camada ossos, um aviso', () => {
    const psd = readPsd(new Uint8Array(readFileSync(arquivo)))
    expect(psd.layers.filter(isBonesLayer).length).toBe(17)
    const hoje = psdToBoneFile(psd)
    expect(hoje.slotNames).toHaveLength(19)
    expect((hoje.file.slots as Slot[]).some((s) => (s.folder ?? '').split('/').includes('ossos'))).toBe(false)
    expect(hoje.warnings.filter((w) => w.includes('"ossos" ignorada'))).toHaveLength(1)
  })

  it('editor: o importar de sempre tira as 17 camadas de ossos e avisa uma vez', () => {
    const psd = readPsd(new Uint8Array(readFileSync(arquivo)))
    const semOssos = splitBonesLayers(psd, false)
    expect(psd.layers).toHaveLength(19)
    expect(semOssos.bonesLayers).toEqual([])
    expect(semOssos.warnings).toEqual([BONES_LAYER_SKIPPED_EDITOR])

    const outro = readPsd(new Uint8Array(readFileSync(arquivo)))
    const comOssos = splitBonesLayers(outro, true)
    expect(outro.layers).toHaveLength(19)
    expect(comOssos.bonesLayers).toHaveLength(17)
    expect(comOssos.warnings).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// O herói, de ponta a ponta
// ---------------------------------------------------------------------------

describe('o herói pela linha de comando: montar-psd --ossos, importar-psd --ossos, conferir-arte --ossos', () => {
  it('a arte cai no mesmo lugar, e os ossos voltam com o pai e o ângulo', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'recorte-ossos-'))
    const psd = join(pasta, 'heroi-ossos.psd')
    const saida = join(pasta, 'volta')
    execFileSync('node', [resolve(raiz, 'ferramentas', 'montar-psd.mjs'), '--ossos', '--saida', psd], {
      cwd: raiz, stdio: 'pipe',
    })
    execFileSync('node', [resolve(raiz, 'ferramentas', 'importar-psd.mjs'), psd, saida, '--ossos'], {
      cwd: raiz, stdio: 'pipe',
    })
    const volta = JSON.parse(readFileSync(`${saida}.bone`, 'utf8')) as BoneFile
    expect((volta.slots ?? []).some((s) => (s.folder ?? '').split('/').includes('ossos'))).toBe(false)

    const medida = JSON.parse(execFileSync('node', [
      resolve(raiz, 'ferramentas', 'conferir-arte.mjs'),
      resolve(raiz, 'formato', 'exemplos', 'heroi.bone'),
      `${saida}.bone`,
      '--ossos',
    ], { cwd: raiz, encoding: 'utf8' })) as {
      pares: number; piorCentro: number; piorTamanho: number
      ossos: { pares: number; paiIgual: number; paiDiferente: string[]; faltando: string[]; piorAngulo: number }
    }
    expect(medida.pares).toBe(19)
    expect(medida.piorCentro).toBeLessThanOrEqual(1)
    expect(medida.piorTamanho).toBeLessThanOrEqual(1)
    expect(medida.ossos.faltando).toEqual([])
    expect(medida.ossos.pares).toBe(18)
    // Dois não têm como voltar pelo desenho, e o teste diz quais:
    // - o cabelo nasce a 24 px da linha da cabeça; pela regra dos 12 px, é
    //   filho de root;
    // - o alvo do IK mora, de propósito, na ponta do antebraço; pelo desenho,
    //   é filho dele. O PSD não guarda regra de IK.
    // Os outros 16 voltam com o pai certo.
    expect([...medida.ossos.paiDiferente].sort()).toEqual(['hair', 'hand_target'])
    expect(medida.ossos.paiIgual).toBe(16)
    expect(medida.ossos.piorAngulo).toBeLessThanOrEqual(2)
  }, 180_000)
})
