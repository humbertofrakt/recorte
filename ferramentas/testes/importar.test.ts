// Testes dos importadores (Spine, DragonBones, Spriter).
// Os arquivos de origem são montados à mão aqui: nada é baixado.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

import { importSpine } from '../src/importar/spine.ts'
import { importSpineAtlas, cropUvToOriginal } from '../src/importar/spine-atlas.ts'
import { importDragonBones } from '../src/importar/dragonbones.ts'
import { importSpriter, importSpriterProject, parseXml, xmlToScon } from '../src/importar/spriter.ts'
import type { AtlasFile, BoneFile, Timeline } from '../src/importar/comum.ts'

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = resolve(aqui, '..', '..')
const schema = JSON.parse(readFileSync(join(raiz, 'formato', 'bone.schema.json'), 'utf8')) as Record<string, unknown>

const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true })
addFormats(ajv)
const validarBone = ajv.compile(schema)
const validarAtlas = ajv.compile({
  $ref: '#/definitions/atlas',
  definitions: (schema as { definitions: unknown }).definitions,
})

function erros(validar: { errors?: unknown[] | null }): string {
  return (validar.errors ?? []).map(e => JSON.stringify(e)).join('\n')
}

/** Schema + as duas regras semânticas que o validador também cobre. */
function esperarBoneValido(file: BoneFile): void {
  const ok = validarBone(file)
  expect(erros(validarBone as never)).toBe(ok ? '' : erros(validarBone as never))
  expect(ok).toBe(true)
  const raizes = file.bones.filter(b => b.parent === undefined || b.parent === null)
  expect(raizes.length).toBe(1)
  const nomes = new Set(file.bones.map(b => b.name))
  expect(nomes.size).toBe(file.bones.length)
  for (const bone of file.bones) {
    if (bone.parent !== undefined) expect(nomes.has(bone.parent)).toBe(true)
  }
}

function acharTimeline(file: BoneFile, animacao: string, tipo: string, alvo?: string, propriedade?: string): Timeline {
  const anim = (file.animations ?? []).find(a => a.name === animacao)
  expect(anim, `animação ${animacao}`).toBeDefined()
  const tl = anim!.timelines.find(
    t => t.type === tipo && (alvo === undefined || t.target === alvo) && (propriedade === undefined || t.property === propriedade),
  )
  expect(tl, `timeline ${tipo}/${alvo ?? '-'}/${propriedade ?? '-'}`).toBeDefined()
  return tl!
}

// ============================================================== Spine: atlas

const ATLAS_SPINE = `
boneco.png
size: 256, 256
format: RGBA8888
filter: Nearest, Nearest
repeat: none
pma: true

corpo
bounds: 0, 0, 80, 120

braco
bounds: 100, 10, 20, 60
rotate: 90
offsets: 4, 6, 30, 70
`

const ATLAS_SPINE_ANTIGO = `
boneco.png
size: 256, 256
format: RGBA8888
filter: Linear, Linear
repeat: none
corpo
  rotate: false
  xy: 5, 7
  size: 80, 120
  orig: 88, 130
  offset: 4, 6
  index: -1
`

describe('atlas do Spine', () => {
  it('lê o formato novo (bounds/offsets) e vale pelo schema', () => {
    const { atlas, avisos } = importSpineAtlas(ATLAS_SPINE)
    const ok = validarAtlas(atlas)
    expect(erros(validarAtlas as never)).toBe(ok ? '' : erros(validarAtlas as never))
    expect(ok).toBe(true)
    expect(atlas.pages).toHaveLength(1)
    expect(atlas.pages[0]).toMatchObject({
      name: 'boneco',
      image: 'boneco.png',
      width: 256,
      height: 256,
      minFilter: 'nearest',
      magFilter: 'nearest',
      premultiplied: true,
    })
    expect(atlas.regions[0]).toMatchObject({ name: 'corpo', page: 0, x: 0, y: 0, width: 80, height: 120 })
    expect(avisos.length).toBeGreaterThan(0)
  })

  it('lê o formato antigo (xy/size/orig/offset)', () => {
    const { atlas } = importSpineAtlas(ATLAS_SPINE_ANTIGO)
    expect(atlas.regions).toHaveLength(1)
    expect(atlas.regions[0]).toMatchObject({
      name: 'corpo',
      x: 5,
      y: 7,
      width: 80,
      height: 120,
      offsetX: 4,
      offsetY: 6,
      originalWidth: 88,
      originalHeight: 130,
    })
    expect(atlas.regions[0]!.rotation).toBeUndefined()
  })

  it('converte a rotação anti-horária do Spine para a convenção da seção 10.4', () => {
    const { atlas, rotatedRegions, crops, avisos } = importSpineAtlas(ATLAS_SPINE)
    const braco = atlas.regions.find(r => r.name === 'braco')!
    expect(rotatedRegions.has('braco')).toBe(true)
    // Corte espelhado: offsetX' = OW - offsetX - w, offsetY' = OH - offsetY - h.
    expect(braco).toMatchObject({
      x: 100,
      y: 10,
      width: 20,
      height: 60,
      rotation: 90,
      offsetX: 6,
      offsetY: 4,
      originalWidth: 30,
      originalHeight: 70,
    })
    expect(avisos.join(' ')).toContain('anti-horário')

    // Prova: o mesmo ponto da imagem cai no mesmo pixel da página nos dois.
    const page = atlas.pages[0]!
    const crop = crops.get('braco')!
    const X = 100
    const Y = 10
    const w = 20
    const h = 60
    for (const [cu, cv] of [[0, 0], [1, 0], [1, 1], [0, 1], [0.25, 0.75]] as [number, number][]) {
      // Mapeamento do Spine para uma região girada no anti-horário.
      const spineU = X + cv * h
      const spineV = Y + w - cu * w

      // Mapeamento do .bone, seção 10.4, com os campos convertidos.
      const [u0, v0] = cropUvToOriginal(crop, cu, cv)
      const ow = braco.originalWidth ?? braco.width
      const oh = braco.originalHeight ?? braco.height
      const px = u0 * ow - (braco.offsetX ?? 0)
      const py = v0 * oh - (oh - (braco.offsetY ?? 0) - braco.height)
      const boneU = braco.x + braco.height - py
      const boneV = braco.y + px

      expect(boneU).toBeCloseTo(spineU, 6)
      expect(boneV).toBeCloseTo(spineV, 6)
      expect(boneU).toBeGreaterThanOrEqual(0)
      expect(boneU).toBeLessThanOrEqual(page.width)
    }
  })

  it('avisa quando a rotação não é 0 nem 90', () => {
    const { avisos } = importSpineAtlas('p.png\nsize: 64,64\n\nx\nbounds: 0,0,10,10\nrotate: 180\n')
    expect(avisos.join(' ')).toContain('180')
  })
})

// ========================================================== Spine: esqueleto

const SPINE = {
  skeleton: { spine: '4.2.33', hash: 'abc', x: -40, y: 0, width: 120, height: 160, fps: 30, images: './imagens/', audio: './audio/' },
  bones: [
    { name: 'root' },
    { name: 'arm', parent: 'root', x: 0, y: 40, length: 60, rotation: 15, inherit: 'noScale', color: 'ff8000ff' },
    { name: 'target', parent: 'root', x: 60, y: 40, skin: true },
  ],
  slots: [
    { name: 'body', bone: 'root', attachment: 'body' },
    { name: 'arm', bone: 'arm', attachment: 'arm', color: '80ff00ff', dark: '112233', blend: 'additive' },
  ],
  ik: [{ name: 'ik_arm', order: 1, bones: ['arm'], target: 'target', mix: 0.75, bendPositive: false, softness: 3 }],
  transform: [
    { name: 'tr', order: 0, bones: ['arm'], target: 'target', mixRotate: 0.5, mixX: 0.25, rotation: 10, x: 4 },
  ],
  physics: [{ name: 'fis', order: 2, bone: 'arm', inertia: 0.4, strength: 80, wind: 5 }],
  skins: [
    {
      name: 'default',
      attachments: {
        body: { body: { type: 'region', path: 'corpo', x: 0, y: 60, width: 80, height: 120, color: 'ffffffff' } },
        arm: {
          arm: {
            type: 'mesh',
            path: 'braco',
            width: 60,
            height: 20,
            uvs: [0, 1, 1, 1, 1, 0, 0, 0],
            triangles: [0, 1, 2, 0, 2, 3],
            hull: 4,
            edges: [0, 2, 2, 4, 4, 6, 6, 0],
            vertices: [
              2, 0, 0, 30, 0.5, 1, 0, -10, 0.5,
              1, 1, 60, -10, 1,
              1, 1, 60, 10, 1,
              2, 0, 0, 50, 0.5, 1, 0, 10, 0.5,
            ],
          },
        },
      },
    },
    {
      name: 'armadura',
      attachments: { body: { body: { type: 'region', name: 'armadura/corpo' } } },
    },
  ],
  events: { passo: { int: 1, audio: 'passo.ogg', volume: 0.8 } },
  animations: {
    acenar: {
      bones: {
        arm: {
          rotate: [
            { time: 0, value: 0, curve: [0.1, 0, 0.3, 45] },
            { time: 0.5, value: 45, curve: 'stepped' },
            { time: 1, value: 0 },
          ],
          translate: [
            { time: 0, x: 0, y: 0, curve: [0.3, 2, 0.7, 8, 0.25, 5, 0.75, 15] },
            { time: 1, x: 10, y: 20 },
          ],
          scale: [{ time: 0.5, x: 2, y: 3 }],
          inherit: [{ time: 0, inherit: 'onlyTranslation' }],
        },
      },
      slots: {
        body: {
          rgba: [
            { time: 0, color: 'ffffffff' },
            { time: 0.5, color: 'ff0000ff' },
          ],
          attachment: [{ time: 0.25, name: null }],
        },
        arm: {
          rgb: [{ time: 0, color: 'ffffff' }, { time: 1, color: '000000' }],
          alpha: [{ time: 0, value: 1 }, { time: 0.5, value: 0 }],
        },
      },
      attachments: {
        default: {
          arm: {
            arm: {
              deform: [
                { time: 0, vertices: [] },
                { time: 0.5, offset: 4, vertices: [0, 3, 0, 3] },
              ],
            },
          },
        },
      },
      drawOrder: [{ time: 0.2, offsets: [{ slot: 'body', offset: 1 }] }],
      events: [{ time: 0.5, name: 'passo', int: 2, volume: 0.5 }],
      ik: { ik_arm: [{ time: 0, mix: 1 }, { time: 0.5, mix: 0, bendPositive: true }] },
      physics: { '': [{ time: 0, inertia: 0.2 }] },
    },
  },
}

describe('importador do Spine', () => {
  const { file, avisos } = importSpine(structuredClone(SPINE), ATLAS_SPINE, { atlasNome: 'boneco.atlas.json' })

  it('gera um .bone válido pelo schema', () => {
    esperarBoneValido(file)
    expect(file.bone.generator).toBe('Spine 4.2.33')
    expect(file.bone.version).toBe('1.0')
  })

  it('copia cabeçalho, assets e esqueleto', () => {
    expect(file.skeleton).toMatchObject({ x: -40, width: 120, height: 160, fps: 30, hash: 'abc' })
    expect(file.assets?.imagesBase).toBe('imagens/')
    expect(file.assets?.audioBase).toBe('audio/')
    expect(file.assets?.atlases).toEqual(['boneco.atlas.json'])
  })

  it('converte ossos, herança e cor', () => {
    const arm = file.bones.find(b => b.name === 'arm')!
    expect(arm).toMatchObject({ parent: 'root', y: 40, length: 60, rotation: 15 })
    expect(arm.x).toBeUndefined() // valor padrão não é gravado
    // "noScale" = herda rotação e reflexão, não herda escala.
    expect(arm.inheritScale).toBe(false)
    expect(arm.inheritRotation).toBeUndefined()
    expect(arm.inheritReflection).toBeUndefined()
    expect(arm.color).toEqual([1, 0.501961, 0, 1])
    expect(file.bones.find(b => b.name === 'target')!.skinRequired).toBe(true)
  })

  it('converte slots com cor, dark e mistura', () => {
    const arm = file.slots!.find(s => s.name === 'arm')!
    expect(arm.color).toEqual([0.501961, 1, 0, 1])
    expect(arm.darkColor).toEqual([0.066667, 0.133333, 0.2])
    expect(arm.blend).toBe('additive')
  })

  it('ordena as constraints por "order" e renomeia os mixes', () => {
    expect(file.constraints!.map(c => c.name)).toEqual(['tr', 'ik_arm', 'fis'])
    const tr = file.constraints!.find(c => c.name === 'tr')!
    expect(tr).toMatchObject({ mixRotation: 0.5, mixX: 0.25, offsetRotation: 10, offsetX: 4 })
    const ik = file.constraints!.find(c => c.name === 'ik_arm')!
    expect(ik).toMatchObject({ bones: ['arm'], target: 'target', mix: 0.75, bendPositive: false, softness: 3 })
    const fis = file.constraints!.find(c => c.name === 'fis')!
    expect(fis).toMatchObject({ bone: 'arm', inertia: 0.4, strength: 80, wind: 5 })
  })

  it('converte a mesh com pesos para "binding"', () => {
    const mesh = file.skins![0]!.attachments!['arm']!['arm'] as Record<string, unknown>
    expect(mesh['binding']).toEqual({
      counts: [2, 1, 1, 2],
      bones: [0, 1, 1, 1, 0, 1],
      positions: [0, 30, 0, -10, 60, -10, 60, 10, 0, 50, 0, 10],
      weights: [0.5, 0.5, 1, 1, 0.5, 0.5],
    })
    expect(mesh['vertices']).toBeUndefined()
    // "edges" do Spine vem em índice x 2.
    expect(mesh['edges']).toEqual([0, 1, 1, 2, 2, 3, 3, 0])
    expect(mesh['hull']).toBe(4)
  })

  it('resolve o caminho do attachment pela regra da seção 13.1', () => {
    const body = file.skins![0]!.attachments!['body']!['body'] as Record<string, unknown>
    expect(body['path']).toBe('corpo')
    const armadura = file.skins![1]!.attachments!['body']!['body'] as Record<string, unknown>
    expect(armadura['path']).toBe('armadura/corpo')
  })

  it('separa translate em duas timelines com a curva de cada eixo', () => {
    const x = acharTimeline(file, 'acenar', 'bone', 'arm', 'x')
    const y = acharTimeline(file, 'acenar', 'bone', 'arm', 'y')
    expect(x.keys.map(k => k.time)).toEqual([0, 1])
    expect(x.keys[0]!.curve).toEqual([0.3, 2, 0.7, 8])
    expect(y.keys[0]!.curve).toEqual([0.25, 5, 0.75, 15])
    expect(y.keys[1]!.value).toBe(20)
  })

  it('mantém as curvas stepped e absolutas da rotação', () => {
    const rot = acharTimeline(file, 'acenar', 'bone', 'arm', 'rotation')
    expect(rot.keys[0]!.curve).toEqual([0.1, 0, 0.3, 45])
    expect(rot.keys[1]!.curve).toBe('stepped')
    expect(rot.keys[2]!.curve).toBeUndefined()
  })

  it('insere chave em t = 0 com o valor de setup quando a timeline começa depois', () => {
    const scaleX = acharTimeline(file, 'acenar', 'bone', 'arm', 'scaleX')
    expect(scaleX.keys[0]).toMatchObject({ time: 0, value: 1, curve: 'stepped' })
    expect(scaleX.keys[1]).toMatchObject({ time: 0.5, value: 2 })
  })

  it('transforma "inherit" em três timelines booleanas stepped', () => {
    const rot = acharTimeline(file, 'acenar', 'bone', 'arm', 'inheritRotation')
    expect(rot.keys[0]).toMatchObject({ time: 0, value: false, curve: 'stepped' })
    const escala = acharTimeline(file, 'acenar', 'bone', 'arm', 'inheritScale')
    expect(escala.keys[0]!.value).toBe(false)
  })

  it('converte cor de slot e junta rgb com alpha', () => {
    const cor = acharTimeline(file, 'acenar', 'slot', 'body', 'color')
    expect(cor.keys[1]!.value).toEqual([1, 0, 0, 1])
    const juntas = acharTimeline(file, 'acenar', 'slot', 'arm', 'color')
    expect(juntas.keys.map(k => k.time)).toEqual([0, 0.5, 1])
    expect(juntas.keys[0]!.value).toEqual([1, 1, 1, 1])
    expect(juntas.keys[1]!.value).toEqual([0.5, 0.5, 0.5, 0])
    expect(juntas.keys[2]!.value).toEqual([0, 0, 0, 0])
    expect(avisos.join(' ')).toContain('tempos diferentes')
  })

  it('converte deform, drawOrder e evento', () => {
    const deform = acharTimeline(file, 'acenar', 'deform', 'arm')
    expect(deform.attachment).toBe('arm')
    expect(deform.keys[1]).toMatchObject({ time: 0.5, offset: 4, value: [0, 3, 0, 3] })
    const ordem = acharTimeline(file, 'acenar', 'drawOrder')
    expect(ordem.keys[0]).toMatchObject({ time: 0, curve: 'stepped', value: [] })
    expect(ordem.keys[1]).toMatchObject({ time: 0.2, value: [{ slot: 'body', offset: 1 }] })
    const evento = acharTimeline(file, 'acenar', 'event')
    expect(evento.keys[0]).toMatchObject({ time: 0.5, event: 'passo', int: 2, volume: 0.5 })
    expect(file.events![0]).toMatchObject({ name: 'passo', int: 1, audio: 'passo.ogg', volume: 0.8 })
  })

  it('converte timelines de constraint, inclusive a física sem nome', () => {
    const mix = acharTimeline(file, 'acenar', 'constraint', 'ik_arm', 'mix')
    expect(mix.keys.map(k => k.value)).toEqual([1, 0])
    const bend = acharTimeline(file, 'acenar', 'constraint', 'ik_arm', 'bendPositive')
    expect(bend.keys[0]).toMatchObject({ time: 0, value: false, curve: 'stepped' })
    const fis = acharTimeline(file, 'acenar', 'constraint', 'fis', 'inertia')
    expect(fis.keys[0]!.value).toBe(0.2)
  })

  it('gira 180° o attachment das regiões giradas do atlas', () => {
    // "braco" está girado no atlas: a mesh usa uvs convertidos.
    const mesh = file.skins![0]!.attachments!['arm']!['arm'] as Record<string, unknown>
    const uvs = mesh['uvs'] as number[]
    expect(uvs).toHaveLength(8)
    for (const v of uvs) expect(v).toBeGreaterThanOrEqual(0)
  })

  it('avisa sobre o que não coube e grava extras.import', () => {
    const importado = (file.extras!['import'] as Record<string, unknown>)
    expect(importado['from']).toBe('spine')
    expect(importado['version']).toBe('4.2.33')
    expect(Array.isArray(importado['warnings'])).toBe(true)
    expect(avisos.length).toBeGreaterThan(0)
  })

  it('avisa e continua quando o osso da timeline não existe', () => {
    const entrada = structuredClone(SPINE) as Record<string, any>
    entrada.animations.acenar.bones['fantasma'] = { rotate: [{ time: 0, value: 10 }] }
    const r = importSpine(entrada)
    expect(r.avisos.join(' ')).toContain('fantasma')
    esperarBoneValido(r.file)
  })

  it('entende os nomes antigos da 3.8', () => {
    const entrada = {
      skeleton: { spine: '3.8.99' },
      bones: [{ name: 'root' }, { name: 'a', parent: 'root', transform: 'noRotationOrReflection' }],
      transform: [{ name: 'tr', bones: ['a'], target: 'root', rotateMix: 0.5, translateMix: 0.25 }],
      animations: {
        anda: {
          bones: { a: { rotate: [{ time: 0, value: 0, curve: 0.25, c2: 0.5, c3: 0.75, c4: 1 }, { time: 1, value: 90 }] } },
        },
      },
    }
    const r = importSpine(entrada)
    esperarBoneValido(r.file)
    const a = r.file.bones.find(b => b.name === 'a')!
    expect(a.inheritRotation).toBe(false)
    expect(a.inheritReflection).toBe(false)
    expect(a.inheritScale).toBeUndefined()
    const tr = r.file.constraints![0]!
    expect(tr).toMatchObject({ mixRotation: 0.5, mixX: 0.25, mixY: 0.25 })
    // Curva normalizada 3.8 vira absoluta: cx = t0 + x(t1-t0), cy = v0 + y(v1-v0).
    const rot = acharTimeline(r.file, 'anda', 'bone', 'a', 'rotation')
    expect(rot.keys[0]!.curve).toEqual([0.25, 45, 0.75, 90])
  })
})

// ================================================================ DragonBones

const DRAGONBONES = {
  name: 'projeto',
  version: '5.5',
  frameRate: 24,
  armature: [
    {
      name: 'heroi',
      frameRate: 24,
      aabb: { x: -10, y: -20, width: 100, height: 200 },
      bone: [
        { name: 'root' },
        { name: 'arm', parent: 'root', length: 40, transform: { x: 10, y: 20, skX: 30, scX: 2 } },
        { name: 'hand', parent: 'arm', transform: { x: 50, skX: 0, skY: 15 } },
        { name: 'alvo', parent: 'root', transform: { x: 90, y: 5 } },
      ],
      slot: [
        { name: 'corpo', parent: 'arm', displayIndex: 0, blendMode: 'add', color: { aM: 50, rM: 100, gM: 100, bM: 100 } },
        { name: 'mao', parent: 'hand', displayIndex: 0 },
      ],
      ik: [{ name: 'ik_hand', bone: 'hand', target: 'alvo', chain: 1, bendPositive: true, weight: 0.8 }],
      skin: [
        {
          name: '',
          slot: [
            {
              name: 'corpo',
              display: [
                { name: 'corpo', type: 'image', transform: { x: 4, y: 6 }, pivot: { x: 0.5, y: 0.5 } },
                {
                  name: 'malha',
                  type: 'mesh',
                  vertices: [0, 0, 20, 0, 20, 10, 0, 10],
                  uvs: [0, 0, 1, 0, 1, 1, 0, 1],
                  triangles: [0, 1, 2, 0, 2, 3],
                  weights: [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
                  slotPose: [1, 0, 0, 1, 0, 0],
                  bonePose: [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 10, 0],
                },
              ],
            },
            { name: 'mao', display: [{ name: 'mao', type: 'image' }] },
          ],
        },
      ],
      animation: [
        {
          name: 'andar',
          duration: 24,
          playTimes: 0,
          fadeInTime: 0.2,
          bone: [
            {
              name: 'arm',
              translateFrame: [
                { duration: 12, tweenEasing: 0, x: 0, y: 10 },
                { duration: 0, x: 30, y: -20 },
              ],
              rotateFrame: [
                { duration: 12, tweenEasing: 0, rotate: 0, clockwise: 1 },
                { duration: 0, rotate: 90 },
              ],
              scaleFrame: [
                { duration: 12, x: 1, y: 1 },
                { duration: 0, x: 2, y: 0.5 },
              ],
            },
          ],
          slot: [
            {
              name: 'corpo',
              displayFrame: [
                { duration: 12, value: 0 },
                { duration: 0, value: 1 },
              ],
              colorFrame: [{ duration: 0, tweenEasing: 0, value: { aM: 0 } }],
            },
          ],
          ffd: [
            {
              skin: '',
              slot: 'corpo',
              name: 'malha',
              frame: [
                { duration: 12, tweenEasing: 0, offset: 0, vertices: [1, 2] },
                { duration: 0, vertices: [] },
              ],
            },
          ],
          ik: [{ name: 'ik_hand', frame: [{ duration: 0, tweenEasing: 0, bendPositive: false, weight: 0.5 }] }],
          zOrder: { frame: [{ duration: 0, zOrder: [0, 1, 1, -1] }] },
          frame: [
            { duration: 12 },
            { duration: 0, events: [{ name: 'passo', ints: [3], floats: [1.5], strings: ['a'] }] },
          ],
        },
      ],
    },
  ],
}

const ATLAS_DB = {
  imagePath: 'heroi.png',
  width: 512,
  height: 512,
  SubTexture: [
    { name: 'corpo', x: 0, y: 0, width: 40, height: 60 },
    { name: 'mao', x: 40, y: 0, width: 20, height: 20, frameX: -2, frameY: -3, frameWidth: 26, frameHeight: 28 },
  ],
}

describe('importador do DragonBones', () => {
  const { file, atlas, avisos } = importDragonBones(structuredClone(DRAGONBONES), structuredClone(ATLAS_DB))

  it('gera um .bone válido pelo schema', () => {
    esperarBoneValido(file)
    expect(file.bone.generator).toBe('DragonBones 5.5')
  })

  it('inverte o Y e o sinal do ângulo dos ossos', () => {
    const arm = file.bones.find(b => b.name === 'arm')!
    expect(arm).toMatchObject({ parent: 'root', x: 10, y: -20, rotation: -30, scaleX: 2, length: 40 })
    // skY - skX = 15 => shearY = -15.
    const hand = file.bones.find(b => b.name === 'hand')!
    expect(hand).toMatchObject({ x: 50, shearY: -15 })
  })

  it('converte a cor do slot de 0..100 para 0..1 e a mistura', () => {
    const corpo = file.slots!.find(s => s.name === 'corpo')!
    expect(corpo.color).toEqual([1, 1, 1, 0.5])
    expect(corpo.blend).toBe('additive')
    expect(corpo.attachment).toBe('corpo')
  })

  it('monta a IK com o pai na cadeia e inverte o lado da dobra', () => {
    const ik = file.constraints!.find(c => c.name === 'ik_hand')!
    expect(ik).toMatchObject({ type: 'ik', bones: ['arm', 'hand'], target: 'alvo', mix: 0.8, bendPositive: false })
  })

  it('calcula o binding da mesh com bonePose e slotPose', () => {
    const malha = file.skins![0]!.attachments!['corpo']!['malha'] as Record<string, unknown>
    expect(malha['binding']).toEqual({
      counts: [1, 1, 1, 1],
      bones: [0, 1, 1, 0],
      positions: [0, 0, 10, 0, 10, -10, 0, -10],
      weights: [1, 1, 1, 1],
    })
    // Y invertido inverte o enrolamento: os triângulos são espelhados.
    expect(malha['triangles']).toEqual([0, 2, 1, 0, 3, 2])
  })

  it('converte tempo de frames para segundos e o "clockwise" da rotação', () => {
    const x = acharTimeline(file, 'andar', 'bone', 'arm', 'x')
    expect(x.keys.map(k => k.time)).toEqual([0, 0.5])
    expect(x.keys.map(k => k.value)).toEqual([0, 30])
    const y = acharTimeline(file, 'andar', 'bone', 'arm', 'y')
    expect(y.keys.map(k => k.value)).toEqual([-10, 20])
    const rot = acharTimeline(file, 'andar', 'bone', 'arm', 'rotation')
    // rotate 0 -> 90 com clockwise 1: no .bone vira 0 -> -(90 + 360).
    expect(rot.keys.map(k => k.value)).toEqual([0, -450])
    expect(rot.keys[0]!.curve).toBeUndefined()
  })

  it('trata tweenEasing ausente como stepped e 0 como linear', () => {
    const escala = acharTimeline(file, 'andar', 'bone', 'arm', 'scaleX')
    expect(escala.keys[0]!.curve).toBe('stepped')
    const x = acharTimeline(file, 'andar', 'bone', 'arm', 'x')
    expect(x.keys[0]!.curve).toBeUndefined()
  })

  it('converte displayFrame, colorFrame, zOrder, ffd e eventos', () => {
    const att = acharTimeline(file, 'andar', 'slot', 'corpo', 'attachment')
    expect(att.keys.map(k => k.value)).toEqual(['corpo', 'malha'])
    const cor = acharTimeline(file, 'andar', 'slot', 'corpo', 'color')
    expect(cor.keys[0]!.value).toEqual([1, 1, 1, 0])
    const ordem = acharTimeline(file, 'andar', 'drawOrder')
    expect(ordem.keys[0]!.value).toEqual([{ slot: 'corpo', offset: 1 }, { slot: 'mao', offset: -1 }])
    const deform = acharTimeline(file, 'andar', 'deform', 'corpo')
    expect(deform.keys[0]!.value).toEqual([1, -2, 0, 0, 0, 0, 0, 0])
    const evento = acharTimeline(file, 'andar', 'event')
    expect(evento.keys[0]).toMatchObject({ time: 0.5, event: 'passo', int: 3, float: 1.5, string: 'a' })
    const mix = acharTimeline(file, 'andar', 'constraint', 'ik_hand', 'mix')
    expect(mix.keys[0]!.value).toBe(0.5)
    const bend = acharTimeline(file, 'andar', 'constraint', 'ik_hand', 'bendPositive')
    expect(bend.keys[0]!.value).toBe(true)
  })

  it('marca loop, defaultMix e duração em segundos', () => {
    const anim = file.animations![0]!
    expect(anim).toMatchObject({ name: 'andar', duration: 1, loop: true, defaultMix: 0.2 })
  })

  it('converte o atlas do DragonBones', () => {
    expect(atlas).toBeDefined()
    const ok = validarAtlas(atlas as AtlasFile)
    expect(erros(validarAtlas as never)).toBe(ok ? '' : erros(validarAtlas as never))
    expect(ok).toBe(true)
    const mao = atlas!.regions.find(r => r.name === 'mao')!
    // offsetX = -frameX ; offsetY = frameHeight - height + frameY
    expect(mao).toMatchObject({ x: 40, y: 0, width: 20, height: 20, offsetX: 2, offsetY: 5, originalWidth: 26, originalHeight: 28 })
  })

  it('avisa sobre a soma de cor e sobre inheritTranslation', () => {
    const entrada = structuredClone(DRAGONBONES) as Record<string, any>
    entrada.armature[0].slot[0].color.rO = 20
    entrada.armature[0].bone[1].inheritTranslation = false
    const r = importDragonBones(entrada)
    expect(r.avisos.join(' ')).toContain('soma de cor')
    expect(r.avisos.join(' ')).toContain('inheritTranslation')
    esperarBoneValido(r.file)
  })

  it('grava extras.import com a origem', () => {
    const importado = file.extras!['import'] as Record<string, unknown>
    expect(importado['from']).toBe('dragonbones')
    expect(avisos.length).toBeGreaterThanOrEqual(0)
  })
})

// ==================================================================== Spriter

const SCML = `<?xml version="1.0" encoding="UTF-8"?>
<spriter_data scml_version="1.0" generator="BrashMonkey Spriter" generator_version="r11">
  <folder id="0" name="arte">
    <file id="0" name="corpo.png" width="40" height="60" pivot_x="0.5" pivot_y="0"/>
    <file id="1" name="corpo2.png" width="40" height="60" pivot_x="0.5" pivot_y="0"/>
    <file id="2" name="passo.wav"/>
  </folder>
  <entity id="0" name="heroi">
    <obj_info name="osso_raiz" type="bone" w="50" h="10"/>
    <obj_info name="corpo" type="sprite"/>
    <var_defs>
      <i id="0" name="vida" type="int" default="100"/>
    </var_defs>
    <character_map id="0" name="ferido">
      <map folder="0" file="0" target_folder="0" target_file="1"/>
    </character_map>
    <animation id="0" name="andar" length="1000" looping="true" interval="100">
      <mainline>
        <key id="0" time="0">
          <bone_ref id="0" timeline="0" key="0"/>
          <object_ref id="0" parent="0" timeline="1" key="0" z_index="0"/>
        </key>
        <key id="1" time="500">
          <bone_ref id="0" timeline="0" key="1"/>
          <object_ref id="0" parent="0" timeline="1" key="1" z_index="0"/>
        </key>
      </mainline>
      <timeline id="0" name="osso_raiz" object_type="bone">
        <key id="0" time="0" spin="-1" curve_type="cubic" c1="0.2" c2="0.8">
          <bone x="0" y="0" angle="0" scale_x="1" scale_y="1"/>
        </key>
        <key id="1" time="500">
          <bone x="10" y="20" angle="270" scale_x="2" scale_y="1"/>
        </key>
      </timeline>
      <timeline id="1" name="corpo" object_type="sprite">
        <key id="0" time="0" curve_type="instant">
          <object folder="0" file="0" x="5" y="6" angle="0" a="1"/>
        </key>
        <key id="1" time="500">
          <object folder="0" file="1" x="5" y="6" angle="0" a="0.5"/>
        </key>
      </timeline>
      <eventline id="0" name="grito">
        <key id="0" time="250"/>
      </eventline>
      <soundline id="0" name="som">
        <key id="0" time="750"><object folder="0" file="2" volume="0.5" panning="-0.25"/></key>
      </soundline>
      <meta>
        <varline def="0">
          <key id="0" time="0" val="100"/>
          <key id="1" time="500" val="50"/>
        </varline>
        <tagline>
          <key id="0" time="0"><tag id="0" t="0" name="idle"/></key>
        </tagline>
      </meta>
    </animation>
  </entity>
</spriter_data>
`

describe('importador do Spriter', () => {
  const { file, avisos } = importSpriter(SCML)

  it('lê o XML sem dependência e gera um .bone válido', () => {
    esperarBoneValido(file)
    expect(file.bone.generator).toContain('Spriter')
  })

  it('cria osso auxiliar e slot para o sprite', () => {
    expect(file.bones.map(b => b.name)).toEqual(['root', 'osso_raiz', 'corpo_osso'])
    expect(file.bones.find(b => b.name === 'osso_raiz')).toMatchObject({ parent: 'root', length: 50 })
    expect(file.bones.find(b => b.name === 'corpo_osso')).toMatchObject({ parent: 'osso_raiz' })
    expect(file.slots).toEqual([{ name: 'corpo', bone: 'corpo_osso', attachment: 'corpo' }])
  })

  it('rodada 8d: o osso auxiliar do sprite sai marcado como osso próprio, escondido e só do editor', () => {
    const aux = file.bones.find(b => b.name === 'corpo_osso') as Record<string, unknown>
    expect(aux['visible']).toBe(false)
    expect(aux['extensions']).toEqual({ RECORTE_editor_state: { ossoProprio: true } })
    // O osso de verdade do Spriter não.
    expect((file.bones.find(b => b.name === 'osso_raiz') as Record<string, unknown>)['visible']).toBeUndefined()
  })

  it('transforma o pivô do arquivo em x/y da região', () => {
    const region = file.skins![0]!.attachments!['corpo']!['corpo'] as Record<string, unknown>
    // ((0.5 - 0.5) * 40, (0.5 - 0) * 60)
    expect(region).toMatchObject({ type: 'region', y: 30, width: 40, height: 60 })
    expect(region['x']).toBeUndefined()
  })

  it('converte character_map em skin', () => {
    const ferido = file.skins!.find(s => s.name === 'ferido')!
    const trocado = ferido.attachments!['corpo']!['corpo'] as Record<string, unknown>
    expect(trocado['path']).toBe('corpo2')
  })

  it('converte tempo de ms para segundos e a curva cúbica', () => {
    const x = acharTimeline(file, 'andar', 'bone', 'osso_raiz', 'x')
    expect(x.keys.map(k => k.time)).toEqual([0, 0.5])
    // cx1 = t0 + (t1-t0)/3 ; cy1 = v0 + c1(v1-v0)
    expect(x.keys[0]!.curve).toEqual([0.166667, 2, 0.333333, 8])
  })

  it('desenrola o ângulo conforme o "spin"', () => {
    const rot = acharTimeline(file, 'andar', 'bone', 'osso_raiz', 'rotation')
    // spin -1 (horário): 0 -> 270 vira 0 -> -90.
    expect(rot.keys.map(k => k.value)).toEqual([0, -90])
  })

  it('converte alpha em cor de slot e a troca de arquivo em attachment', () => {
    const cor = acharTimeline(file, 'andar', 'slot', 'corpo', 'color')
    expect(cor.keys.map(k => k.value)).toEqual([[1, 1, 1, 1], [1, 1, 1, 0.5]])
    expect(cor.keys[0]!.curve).toBe('stepped')
    const att = acharTimeline(file, 'andar', 'slot', 'corpo', 'attachment')
    expect(att.keys.map(k => k.value)).toEqual(['corpo', 'corpo2'])
  })

  it('converte eventline, soundline, varline e tagline', () => {
    const eventos = (file.animations![0]!.timelines).filter(t => t.type === 'event')
    const todos = eventos.flatMap(t => t.keys)
    expect(todos.find(k => k.event === 'grito')!.time).toBe(0.25)
    const som = todos.find(k => k.event === 'passo')!
    expect(som).toMatchObject({ time: 0.75, volume: 0.5, balance: -0.25 })
    expect(file.events!.find(e => e.name === 'passo')!.audio).toBe('passo.wav')
    const variavel = acharTimeline(file, 'andar', 'variable', 'vida', 'value')
    expect(variavel.keys.map(k => k.value)).toEqual([100, 50])
    const tag = acharTimeline(file, 'andar', 'tag')
    expect(tag.keys[0]!.value).toEqual(['idle'])
  })

  it('avisa que a origem não tem mesh, pesos nem IK', () => {
    expect(avisos.join(' ')).toContain('mesh')
    expect(avisos.join(' ')).toContain('IK')
  })

  it('lê SCON (JSON) com o mesmo resultado do SCML', () => {
    const scon = xmlToScon(parseXml(SCML))
    const r = importSpriter(scon)
    esperarBoneValido(r.file)
    expect(r.file.bones.map(b => b.name)).toEqual(file.bones.map(b => b.name))
    const rot = acharTimeline(r.file, 'andar', 'bone', 'osso_raiz', 'rotation')
    expect(rot.keys.map(k => k.value)).toEqual([0, -90])
  })

  it('lê SCON entregue como texto JSON', () => {
    const scon = JSON.stringify(xmlToScon(parseXml(SCML)))
    const r = importSpriter(scon)
    esperarBoneValido(r.file)
  })

  /**
   * O SCML de sempre, com um osso a mais e o DESENHO trocando de osso na
   * segunda chave da mainline — degrau 10, tarefa 10.5.
   */
  const sconComTrocaDeOsso = (): Record<string, any> => {
    const scon = xmlToScon(parseXml(SCML)) as Record<string, any>
    const entity = scon.entity[0]
    entity.obj_info.push({ name: 'osso2', type: 'bone' })
    const animation = entity.animation[0]
    animation.timeline.push({ id: '2', name: 'osso2', object_type: 'bone', key: [{ id: '0', time: '0', bone: { x: '0' } }] })
    animation.mainline.key[0].bone_ref.push({ id: '1', timeline: '2' })
    animation.mainline.key[1].bone_ref.push({ id: '1', timeline: '2' })
    animation.mainline.key[1].object_ref[0].parent = '1'
    return scon
  }

  it('o desenho que troca de osso vira uma timeline slot/bone, com o local no transform', () => {
    const r = importSpriter(sconComTrocaDeOsso())
    esperarBoneValido(r.file)
    // Degrau 10 (10.5, spec 9.5 e 13.3): `object_ref.parent` que muda entre
    // chaves é o desenho trocando de osso, e não o osso trocando de pai.
    const tl = acharTimeline(r.file, 'andar', 'slot', 'corpo', 'bone')
    expect(tl.keys.length).toBeGreaterThan(0)
    const virada = tl.keys.find(k => k.value !== null)!
    expect(virada.value).toBe('osso2')
    expect(virada.curve).toBe('stepped')
    // O runtime não converte nada: a chave carrega o local do desenho lá — o
    // `x, y` da chave do Spriter, que já é medido do pai daquela chave.
    expect(virada.transform).toEqual({ x: 5, y: 6 })
    expect(r.avisos.join(' ')).toContain('troca de osso')
    expect(r.avisos.join(' ')).toContain('slot/bone')
  })

  it('com --assar, o osso auxiliar fica com um pai só e o aviso diz que ficou', () => {
    const r = importSpriter(sconComTrocaDeOsso(), { assar: true })
    esperarBoneValido(r.file)
    const slotBone = (r.file.animations ?? [])
      .flatMap(a => a.timelines ?? [])
      .filter(t => t.type === 'slot' && t.property === 'bone')
    expect(slotBone).toEqual([])
    expect(r.avisos.join(' ')).toContain('--assar')
  })

  it('o SCML inteiro vira um projeto: uma entity, um corpo (10.5)', () => {
    const scon = xmlToScon(parseXml(SCML)) as Record<string, any>
    // Uma segunda entity, com o nome cheio de coisa que um disco não aceita.
    const segunda = JSON.parse(JSON.stringify(scon.entity[0])) as Record<string, any>
    segunda.id = '1'
    segunda.name = 'Um Dragão!'
    scon.entity.push(segunda)

    const projeto = importSpriterProject(scon)
    expect(projeto.bodies.map(b => b.entity)).toEqual([scon.entity[0].name, 'Um Dragão!'])
    // O nome do arquivo sai limpo, e o primeiro `entity` é o `main` (2.9).
    expect(projeto.bodies[1]!.uri.endsWith('.bone')).toBe(true)
    expect(projeto.bodies[1]!.uri).not.toContain('!')
    expect(projeto.manifest.main).toBe(projeto.bodies[0]!.uri)
    expect(projeto.manifest.skeletons).toEqual(projeto.bodies.map(b => b.uri))
    expect(projeto.manifest.extras.RECORTE_projeto).toEqual({
      corpos: projeto.bodies.map(b => b.uri), entidades: [], emFoco: projeto.bodies[0]!.uri,
    })
    for (const corpo of projeto.bodies) esperarBoneValido(corpo.file)
    // O aviso de "só uma entity virou este .bone" não cabe aqui: todas viraram.
    expect(projeto.avisos.join(' ')).not.toContain('Só "')
  })
})

// ============================================================ linha de comando

describe('linha de comando (importar.mjs)', () => {
  const pasta = mkdtempSync(join(tmpdir(), 'recorte-importar-'))
  const cli = join(raiz, 'ferramentas', 'importar.mjs')

  function rodar(...args: string[]): { saida: string; codigo: number } {
    const r = spawnSync(process.execPath, [cli, ...args], { encoding: 'utf8' })
    return { saida: `${r.stdout ?? ''}${r.stderr ?? ''}`, codigo: r.status ?? -1 }
  }

  it('descobre o formato do Spine sozinho, grava o atlas e valida a saída', () => {
    const entrada = join(pasta, 'spine.json')
    const atlas = join(pasta, 'spine.atlas')
    const saida = join(pasta, 'heroi.bone')
    writeFileSync(entrada, JSON.stringify(SPINE), 'utf8')
    writeFileSync(atlas, ATLAS_SPINE, 'utf8')
    const { saida: texto, codigo } = rodar(entrada, saida, '--atlas', atlas)
    expect(codigo).toBe(0)
    expect(texto).toContain('recursos convertidos')
    expect(texto).toContain('OK')
    const gerado = JSON.parse(readFileSync(saida, 'utf8')) as BoneFile
    esperarBoneValido(gerado)
    expect(gerado.assets?.atlases).toEqual(['heroi.atlas.json'])
    const atlasGerado = JSON.parse(readFileSync(join(pasta, 'heroi.atlas.json'), 'utf8')) as AtlasFile
    expect(validarAtlas(atlasGerado)).toBe(true)
  })

  it('descobre o DragonBones e o Spriter sozinho e grava o relatório', () => {
    const db = join(pasta, 'db.json')
    writeFileSync(db, JSON.stringify(DRAGONBONES), 'utf8')
    const r1 = rodar(db, join(pasta, 'db.bone'))
    expect(r1.codigo).toBe(0)
    expect(r1.saida).toContain('recursos convertidos')

    const scml = join(pasta, 'heroi.scml')
    const relatorio = join(pasta, 'relatorio.txt')
    writeFileSync(scml, SCML, 'utf8')
    const r2 = rodar(scml, join(pasta, 'scml.bone'), '--relatorio', relatorio)
    expect(r2.codigo).toBe(0)
    const texto = readFileSync(relatorio, 'utf8')
    expect(texto).toContain('Origem: spriter')
    expect(texto).toContain('mesh')
  })

  // P3: a guarda de spine.ts testava contra `undefined`, mas a linha de
  // comando passa `null` quando não veio --atlas, e `null.trim()` estourava.
  it('importa um projeto do Spine sem --atlas, avisando em português', () => {
    const entrada = join(pasta, 'spine-sem-atlas.json')
    const saida = join(pasta, 'sem-atlas.bone')
    writeFileSync(entrada, JSON.stringify(SPINE), 'utf8')
    const { saida: texto, codigo } = rodar(entrada, saida)
    expect(codigo).toBe(0)
    expect(texto).not.toContain('Cannot read properties')
    expect(texto).toContain('Sem --atlas as regiões saem sem recorte')
    const gerado = JSON.parse(readFileSync(saida, 'utf8')) as BoneFile
    esperarBoneValido(gerado)
    expect(gerado.assets?.atlases).toBeUndefined()
  })

  it('reclama quando não dá para descobrir o formato', () => {
    const solto = join(pasta, 'solto.json')
    writeFileSync(solto, '{"qualquer": 1}', 'utf8')
    const { saida, codigo } = rodar(solto, join(pasta, 'solto.bone'))
    expect(codigo).not.toBe(0)
    expect(saida).toContain('--formato')
  })
})

// ================================================================= XML mínimo

describe('leitor de XML próprio', () => {
  it('lê atributos, filhos, comentários e tags vazias', () => {
    const node = parseXml('<a x="1"><!-- nota --><b y="2"/><b y="3"></b></a>')
    expect(node.name).toBe('a')
    expect(node.attrs['x']).toBe('1')
    expect(node.children.map(c => c.attrs['y'])).toEqual(['2', '3'])
  })

  it('resolve entidades', () => {
    const node = parseXml('<a t="a &amp; b &#65;"/>')
    expect(node.attrs['t']).toBe('a & b A')
  })
})

// ---------------------------------------------------------------------------
// Rodada 45, lote 5 — o Spriter casa as timelines pelo NOME (doc 57; doc 72, a)
// ---------------------------------------------------------------------------

describe('rodada 45, lote 5: as timelines do Spriter casam pelo nome, não pelo número', () => {
  it('o mesmo número em animações diferentes, com nomes diferentes, vira duas peças', async () => {
    const { normalizarTimelines } = await import('../src/importar/spriter.ts')
    const entity = {
      animation: [
        { name: 'a', timeline: [{ id: 0, name: 'fundo' }], mainline: { key: [{ object_ref: [{ id: 0, timeline: 0 }] }] } },
        {
          name: 'b',
          timeline: [{ id: 0, name: 'mao' }, { id: 1, name: 'fundo' }],
          mainline: { key: [{ object_ref: [{ id: 0, timeline: 0 }, { id: 1, timeline: 1 }] }] },
        },
      ],
    }
    const n = normalizarTimelines(entity) as { animation: Array<{ timeline: Array<{ id: number; name: string }>; mainline: { key: Array<{ object_ref: Array<{ timeline: number }> }> } }> }
    expect(n.animation[0]!.timeline).toEqual([{ id: 0, name: 'fundo' }])
    // "fundo" fica com o 0 em toda parte; "mao", que usava o 0 na animação b, ganha o 1.
    expect(n.animation[1]!.timeline).toEqual([{ id: 1, name: 'mao' }, { id: 0, name: 'fundo' }])
    expect(n.animation[1]!.mainline.key[0]!.object_ref.map((r) => r.timeline)).toEqual([1, 0])
  })

  it('o arquivo coerente fica com os números que tinha', async () => {
    const { normalizarTimelines } = await import('../src/importar/spriter.ts')
    const anim = (nome: string): unknown => ({
      name: nome,
      timeline: [{ id: 0, name: 'osso', object_type: 'bone' }, { id: 1, name: 'mao' }],
      mainline: { key: [{ bone_ref: [{ id: 0, timeline: 0 }], object_ref: [{ id: 0, timeline: 1, parent: 0 }] }] },
    })
    const entity = { animation: [anim('a'), anim('b')] }
    expect(normalizarTimelines(entity)).toEqual(entity)
  })

  it('o bcp do Humberto: as 28 "trocas" eram o defeito; casando pelo nome, nenhuma', () => {
    const scml = readFileSync(resolve(aqui, '../../exemplo/game/bcp.scml'), 'utf8')
    const r = importSpriter(scml)
    const trocas = r.avisos.filter((a) => a.includes('troca de pai') || a.includes('troca de osso'))
    expect(trocas).toEqual([])
    // As peças que o número juntava voltam a ser peças: 23 desenhos, um por timeline de sprite.
    expect((r.file.slots ?? []).length).toBe(23)
  })
})

describe('rodada 45, lote 5: a peça que a animação do Spriter não usa não aparece nela', () => {
  it('no bcp, o fundo fica vazio onde a animação não o usa, e à vista onde usa', () => {
    const scml = readFileSync(resolve(aqui, '../../exemplo/game/bcp.scml'), 'utf8')
    const r = importSpriter(scml)
    const animacoes = (r.file as { animations?: Array<{ name: string; timelines: Timeline[] }> }).animations ?? []
    expect(animacoes.length).toBe(13)
    const vazio = (anim: string, slot: string): boolean => {
      const a = animacoes.find((x) => x.name === anim)!
      const tl = a.timelines.find((t) => t.type === 'slot' && (t as { target?: string }).target === slot && (t as { property?: string }).property === 'attachment') as { keys: Array<{ value: unknown }> } | undefined
      return tl !== undefined && tl.keys.length === 1 && tl.keys[0]!.value === null
    }
    // 'Camada 87' (o fundo) só existe na NewAnimation.
    expect(vazio('andarfaca', 'Camada 87')).toBe(true)
    expect(vazio('atacarmachini', 'Camada 87')).toBe(true)
    expect(vazio('NewAnimation', 'Camada 87')).toBe(false)
  })
})
