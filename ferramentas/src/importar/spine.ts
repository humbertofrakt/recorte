// SPDX-License-Identifier: Apache-2.0
// Spine (Esoteric Software) JSON 3.8 - 4.3 -> .bone (spec section 13.1).
// Spine and Recorte share the coordinate system (Y up, degrees counter
// clockwise, pixels), so no axis conversion is needed here.

import type {
  Animation,
  Attachment,
  AtlasFile,
  Bone,
  BoneFile,
  Constraint,
  Curve,
  DrawOrderOffset,
  EventDef,
  ImportResult,
  JsonObject,
  Key,
  Skin,
  Slot,
  Timeline,
} from './comum.ts'
import {
  Warnings,
  bool,
  ensureKeyAtZero,
  evaluateNumber,
  hexToColor3,
  hexToColor4,
  intArray,
  isObject,
  makeHeader,
  normalizedCurveToAbsolute,
  num,
  numArray,
  round6,
  roundArray,
  sanitizePath,
  sanitizeUri,
  str,
  tidyKeys,
} from './comum.ts'
import type { RegionCrop } from './spine-atlas.ts'
import { cropUvToOriginal, importSpineAtlas } from './spine-atlas.ts'

export interface SpineOptions {
  /** Name written into `assets.atlases`. */
  atlasNome?: string
}

const INHERIT_MAP: Record<string, [boolean, boolean, boolean]> = {
  normal: [true, true, true],
  onlytranslation: [false, false, false],
  norotationorreflection: [false, true, false],
  noscale: [true, false, true],
  noscaleorreflection: [true, false, false],
}

const BLEND_MAP: Record<string, string> = {
  normal: 'normal',
  additive: 'additive',
  multiply: 'multiply',
  screen: 'screen',
}

const CONSTRAINT_RANK: Record<string, number> = { ik: 0, transform: 1, path: 2, physics: 3 }

// --------------------------------------------------------------------- curves

type CurveSpec =
  | { kind: 'linear' }
  | { kind: 'stepped' }
  | { kind: 'absolute'; values: number[] }
  | { kind: 'normalized'; values: number[] }

function readSpineCurve(frame: JsonObject): CurveSpec {
  const raw = frame['curve']
  if (raw === undefined || raw === null) return { kind: 'linear' }
  if (raw === 'stepped') return { kind: 'stepped' }
  if (typeof raw === 'number') {
    // Spine 3.8: "curve" is cx1 and c2/c3/c4 follow, all normalized.
    return {
      kind: 'normalized',
      values: [raw, num(frame['c2']), num(frame['c3'], 1), num(frame['c4'], 1)],
    }
  }
  if (Array.isArray(raw)) return { kind: 'absolute', values: numArray(raw) }
  return { kind: 'linear' }
}

function curveOf(
  spec: CurveSpec,
  component: number,
  t0: number,
  v0: number,
  t1: number,
  v1: number,
): Curve {
  if (spec.kind === 'stepped') return 'stepped'
  if (spec.kind === 'linear') return 'linear'
  if (spec.kind === 'normalized') return normalizedCurveToAbsolute(spec.values, t0, v0, t1, v1)
  const slice = spec.values.slice(component * 4, component * 4 + 4)
  if (slice.length < 4) {
    const first = spec.values.slice(0, 4)
    if (first.length < 4) return 'linear'
    return roundArray(first)
  }
  return roundArray(slice)
}

function frameList(value: unknown): JsonObject[] {
  if (!Array.isArray(value)) return []
  return value.filter(isObject)
}

/** Builds a numeric timeline from Spine frames. */
function numberKeys(
  frames: JsonObject[],
  read: (frame: JsonObject) => number,
  component: number,
): Key[] {
  const keys: Key[] = frames.map(f => ({ time: round6(num(f['time'])), value: round6(read(f)) }))
  for (let i = 0; i < frames.length - 1; i++) {
    const spec = readSpineCurve(frames[i]!)
    const c = curveOf(spec, component, keys[i]!.time, num(keys[i]!.value), keys[i + 1]!.time, num(keys[i + 1]!.value))
    if (c !== 'linear') keys[i]!.curve = c
  }
  return tidyKeys(keys)
}

// ---------------------------------------------------------------- attachments

interface MeshInfo {
  binding: boolean
  influenceCount: number
  vertexCount: number
}

class SpineImporter {
  readonly avisos = new Warnings()
  private readonly bones: Bone[] = []
  private readonly slots: Slot[] = []
  private readonly constraints: Constraint[] = []
  private readonly skins: Skin[] = []
  private readonly events: EventDef[] = []
  private readonly animations: Animation[] = []
  private readonly boneNames = new Set<string>()
  private readonly slotOrder: string[] = []
  private readonly slotSetup = new Map<string, Slot>()
  private readonly constraintByName = new Map<string, Constraint>()
  private readonly physicsNames: string[] = []
  private readonly meshInfo = new Map<string, MeshInfo>()
  private crops = new Map<string, RegionCrop>()
  private rotatedRegions = new Set<string>()
  private atlas: AtlasFile | undefined
  /** Verdadeiro quando o projeto cita ao menos uma região de atlas. */
  private usouRegiao = false
  private spineVersion = ''
  private legacy38 = false

  private readonly json: JsonObject
  private readonly options: SpineOptions

  constructor(json: JsonObject, options: SpineOptions) {
    this.json = json
    this.options = options
  }

  run(atlasTexto?: string | null): ImportResult {
    // `!=` solto pega null e undefined de uma vez: a linha de comando passa
    // null quando não veio --atlas, e a API passa undefined.
    if (atlasTexto != null && atlasTexto.trim().length > 0) {
      const parsed = importSpineAtlas(atlasTexto)
      this.atlas = parsed.atlas
      this.crops = parsed.crops
      this.rotatedRegions = parsed.rotatedRegions
      for (const a of parsed.avisos) this.avisos.add(a)
    }

    const skeleton = isObject(this.json['skeleton']) ? this.json['skeleton'] : {}
    this.spineVersion = str(skeleton['spine'], 'desconhecida')
    const major = Number.parseInt(this.spineVersion.split('.')[0] ?? '4', 10)
    this.legacy38 = Number.isFinite(major) && major < 4

    const file: BoneFile = {
      bone: makeHeader(`Spine ${this.spineVersion}`),
      bones: this.bones,
    }

    this.readSkeleton(skeleton, file)
    this.readBones()
    this.readSlots()
    this.readConstraints()
    this.readSkins()
    this.readEvents()
    this.readAnimations()

    if (this.bones.length === 0) {
      this.avisos.add('O arquivo do Spine não tem ossos. Foi criado um osso "root".')
      this.bones.push({ name: 'root' })
      this.boneNames.add('root')
    }

    if (this.slots.length > 0) file.slots = this.slots
    if (this.constraints.length > 0) file.constraints = this.constraints
    if (this.skins.length > 0) file.skins = this.skins
    if (this.events.length > 0) file.events = this.events
    if (this.animations.length > 0) file.animations = this.animations

    // Sem atlas, as regiões saem sem recorte: quem importar precisa saber
    // disso antes de abrir o arquivo e achar que a arte está errada.
    if (this.atlas === undefined && this.usouRegiao) {
      this.avisos.add(
        'Sem --atlas as regiões saem sem recorte: tamanho, deslocamento e giro '
        + 'de cada figura vêm do próprio desenho, não da página do atlas.',
      )
    }

    const avisos = this.avisos.list()
    file.extras = {
      import: { from: 'spine', version: this.spineVersion, warnings: avisos },
    }
    return { file, atlas: this.atlas, avisos }
  }

  // ------------------------------------------------------------------ header

  private readSkeleton(skeleton: JsonObject, file: BoneFile): void {
    const info: JsonObject = {}
    for (const key of ['x', 'y', 'width', 'height', 'fps', 'referenceScale']) {
      if (typeof skeleton[key] === 'number') info[key] = round6(num(skeleton[key]))
    }
    if (typeof skeleton['hash'] === 'string') info['hash'] = skeleton['hash']
    if (Object.keys(info).length > 0) file.skeleton = info as BoneFile['skeleton']

    const assets: JsonObject = {}
    if (this.atlas !== undefined) {
      assets['atlases'] = [this.options.atlasNome ?? 'atlas.atlas.json']
    }
    const images = sanitizeUri(skeleton['images'])
    if (images !== undefined) assets['imagesBase'] = images
    const audio = sanitizeUri(skeleton['audio'])
    if (audio !== undefined) assets['audioBase'] = audio
    if (Object.keys(assets).length > 0) file.assets = assets as BoneFile['assets']
  }

  // ------------------------------------------------------------------- bones

  private readBones(): void {
    for (const raw of frameList(this.json['bones'])) {
      const name = str(raw['name'])
      if (name.length === 0) continue
      const bone: Bone = { name }
      if (typeof raw['parent'] === 'string') bone.parent = raw['parent']
      for (const key of ['length', 'x', 'y', 'rotation', 'shearX', 'shearY'] as const) {
        if (typeof raw[key] === 'number' && raw[key] !== 0) bone[key] = round6(num(raw[key]))
      }
      for (const key of ['scaleX', 'scaleY'] as const) {
        if (typeof raw[key] === 'number' && raw[key] !== 1) bone[key] = round6(num(raw[key]))
      }
      const inheritRaw = str(raw['inherit'] ?? raw['transform'], 'normal').toLowerCase()
      const inherit = INHERIT_MAP[inheritRaw]
      if (inherit === undefined) {
        this.avisos.add(`Osso "${name}" com herança "${inheritRaw}" desconhecida. Usando herança normal.`)
      } else {
        if (!inherit[0]) bone.inheritRotation = false
        if (!inherit[1]) bone.inheritScale = false
        if (!inherit[2]) bone.inheritReflection = false
      }
      if (bool(raw['skin'])) bone.skinRequired = true
      if (typeof raw['color'] === 'string') bone.color = hexToColor4(raw['color'], [0.61, 0.61, 0.61, 1])
      if (typeof raw['icon'] === 'string') bone.icon = raw['icon']
      if (raw['visible'] === false) bone.visible = false
      this.bones.push(bone)
      this.boneNames.add(name)
    }
    // Bones whose parent is missing would break the validator.
    for (const bone of this.bones) {
      if (bone.parent !== undefined && !this.boneNames.has(bone.parent)) {
        this.avisos.add(`Osso "${bone.name}" aponta para o pai "${bone.parent}", que não existe. Virou filho da raiz.`)
        delete bone.parent
      }
    }
  }

  // ------------------------------------------------------------------- slots

  private readSlots(): void {
    for (const raw of frameList(this.json['slots'])) {
      const name = str(raw['name'])
      const bone = str(raw['bone'])
      if (name.length === 0 || bone.length === 0) continue
      const slot: Slot = { name, bone }
      if (!this.boneNames.has(bone)) {
        this.avisos.add(`Slot "${name}" está no osso "${bone}", que não existe. Ligado ao primeiro osso.`)
        slot.bone = this.bones[0]?.name ?? 'root'
      }
      if (typeof raw['attachment'] === 'string') slot.attachment = raw['attachment']
      if (typeof raw['color'] === 'string') slot.color = hexToColor4(raw['color'])
      if (typeof raw['dark'] === 'string') slot.darkColor = hexToColor3(raw['dark'])
      const blendRaw = str(raw['blend'], 'normal').toLowerCase()
      const blend = BLEND_MAP[blendRaw]
      if (blend === undefined) {
        this.avisos.add(`Slot "${name}" com mistura "${blendRaw}" desconhecida. Usando "normal".`)
      } else if (blend !== 'normal') {
        slot.blend = blend
      }
      if (raw['visible'] === false) slot.visible = false
      this.slots.push(slot)
      this.slotOrder.push(name)
      this.slotSetup.set(name, slot)
    }
  }

  // ------------------------------------------------------------- constraints

  private readConstraints(): void {
    const pending: { order: number; rank: number; constraint: Constraint }[] = []

    const push = (raw: JsonObject, constraint: Constraint, rank: number): void => {
      if (bool(raw['skin'])) constraint.skinRequired = true
      pending.push({ order: num(raw['order']), rank, constraint })
    }

    for (const raw of frameList(this.json['ik'])) {
      const name = str(raw['name'])
      if (name.length === 0) continue
      const c: Constraint = {
        type: 'ik',
        name,
        bones: (Array.isArray(raw['bones']) ? raw['bones'] : []).map(b => str(b)).filter(b => b.length > 0).slice(0, 2),
        target: str(raw['target']),
      }
      if (raw['bendPositive'] === false) c['bendPositive'] = false
      if (bool(raw['compress'])) c['compress'] = true
      if (bool(raw['stretch'])) c['stretch'] = true
      if (bool(raw['uniform'])) c['uniform'] = true
      if (num(raw['softness']) !== 0) c['softness'] = round6(num(raw['softness']))
      c.mix = round6(num(raw['mix'], 1))
      push(raw, c, CONSTRAINT_RANK['ik']!)
    }

    for (const raw of frameList(this.json['transform'])) {
      const name = str(raw['name'])
      if (name.length === 0) continue
      const c: Constraint = {
        type: 'transform',
        name,
        bones: (Array.isArray(raw['bones']) ? raw['bones'] : []).map(b => str(b)).filter(b => b.length > 0),
        target: str(raw['target']),
      }
      if (bool(raw['local'])) c['local'] = true
      if (bool(raw['relative'])) c['relative'] = true
      const offsets: [string, string][] = [
        ['rotation', 'offsetRotation'],
        ['x', 'offsetX'],
        ['y', 'offsetY'],
        ['scaleX', 'offsetScaleX'],
        ['scaleY', 'offsetScaleY'],
        ['shearY', 'offsetShearY'],
      ]
      for (const [from, to] of offsets) if (num(raw[from]) !== 0) c[to] = round6(num(raw[from]))
      if (this.legacy38) {
        this.assignMix(c, 'mixRotation', raw['rotateMix'])
        this.assignMix(c, 'mixX', raw['translateMix'])
        this.assignMix(c, 'mixY', raw['translateMix'])
        this.assignMix(c, 'mixScaleX', raw['scaleMix'])
        this.assignMix(c, 'mixScaleY', raw['scaleMix'])
        this.assignMix(c, 'mixShearY', raw['shearMix'])
      } else {
        this.assignMix(c, 'mixRotation', raw['mixRotate'])
        this.assignMix(c, 'mixX', raw['mixX'])
        this.assignMix(c, 'mixY', raw['mixY'])
        this.assignMix(c, 'mixScaleX', raw['mixScaleX'])
        this.assignMix(c, 'mixScaleY', raw['mixScaleY'])
        this.assignMix(c, 'mixShearY', raw['mixShearY'])
      }
      push(raw, c, CONSTRAINT_RANK['transform']!)
      if (isObject(raw['properties']) || Array.isArray(raw['properties'])) {
        this.avisos.add(
          `Transform constraint "${name}" usa mapeamento de propriedades do Spine 4.3. Isso vira "parameter" + "driver"; ainda não convertido. O original ficou em extras.`,
        )
        c.extras = { spine: { properties: raw['properties'] } }
      }
    }

    for (const raw of frameList(this.json['path'])) {
      const name = str(raw['name'])
      if (name.length === 0) continue
      const c: Constraint = {
        type: 'path',
        name,
        bones: (Array.isArray(raw['bones']) ? raw['bones'] : []).map(b => str(b)).filter(b => b.length > 0),
        target: str(raw['target']),
      }
      const positionMode = str(raw['positionMode'], 'percent').toLowerCase()
      if (positionMode === 'fixed') c['positionMode'] = 'fixed'
      const spacingMode = str(raw['spacingMode'], 'length').toLowerCase()
      if (['fixed', 'percent', 'proportional'].includes(spacingMode)) c['spacingMode'] = spacingMode
      const rotateMode = str(raw['rotateMode'], 'tangent').toLowerCase().replace(/\s+/g, '')
      if (rotateMode === 'chain') c['rotateMode'] = 'chain'
      else if (rotateMode === 'chainscale') c['rotateMode'] = 'chainScale'
      if (num(raw['rotation']) !== 0) c['offsetRotation'] = round6(num(raw['rotation']))
      if (num(raw['position']) !== 0) c['position'] = round6(num(raw['position']))
      if (num(raw['spacing']) !== 0) c['spacing'] = round6(num(raw['spacing']))
      if (this.legacy38) {
        this.assignMix(c, 'mixRotation', raw['rotateMix'])
        this.assignMix(c, 'mixX', raw['translateMix'])
        this.assignMix(c, 'mixY', raw['translateMix'])
      } else {
        this.assignMix(c, 'mixRotation', raw['mixRotate'])
        this.assignMix(c, 'mixX', raw['mixX'])
        this.assignMix(c, 'mixY', raw['mixY'])
      }
      push(raw, c, CONSTRAINT_RANK['path']!)
    }

    for (const raw of frameList(this.json['physics'])) {
      const name = str(raw['name'])
      if (name.length === 0) continue
      const c: Constraint = { type: 'physics', name, bone: str(raw['bone']) }
      const pairs: [string, string, number][] = [
        ['x', 'x', 0],
        ['y', 'y', 0],
        ['rotate', 'rotation', 0],
        ['scaleX', 'scaleX', 0],
        ['shearX', 'shearX', 0],
        ['inertia', 'inertia', 0.5],
        ['strength', 'strength', 100],
        ['damping', 'damping', 1],
        ['mass', 'mass', 1],
        ['wind', 'wind', 0],
        ['gravity', 'gravity', 0],
        ['limit', 'limit', 5000],
        ['fps', 'fps', 60],
      ]
      for (const [from, to, def] of pairs) {
        if (typeof raw[from] === 'number' && raw[from] !== def) c[to] = round6(num(raw[from]))
      }
      c.mix = round6(num(raw['mix'], 1))
      this.physicsNames.push(name)
      push(raw, c, CONSTRAINT_RANK['physics']!)
    }

    pending.sort((a, b) => (a.order - b.order) || (a.rank - b.rank))
    for (const { constraint } of pending) {
      this.constraints.push(constraint)
      this.constraintByName.set(constraint.name, constraint)
    }
  }

  private assignMix(c: Constraint, key: string, value: unknown): void {
    if (typeof value !== 'number') return
    const v = round6(Math.min(1, Math.max(0, value)))
    if (v !== 1) c[key] = v
  }

  // ------------------------------------------------------------------- skins

  private readSkins(): void {
    const raw = this.json['skins']
    const list: JsonObject[] = []
    if (Array.isArray(raw)) {
      list.push(...raw.filter(isObject))
    } else if (isObject(raw)) {
      // Spine 3.8: skins is a map name -> attachments.
      for (const [name, value] of Object.entries(raw)) {
        list.push({ name, attachments: value })
      }
    }
    if (list.length === 0) return

    for (const rawSkin of list) {
      const name = str(rawSkin['name'], 'default')
      const skin: Skin = { name }
      const bones = (Array.isArray(rawSkin['bones']) ? rawSkin['bones'] : []).map(b => str(b)).filter(b => b.length > 0)
      if (bones.length > 0) skin.bones = bones
      const constraints: string[] = []
      for (const key of ['ik', 'transform', 'path', 'physics']) {
        const arr = rawSkin[key]
        if (Array.isArray(arr)) for (const c of arr) if (str(c).length > 0) constraints.push(str(c))
      }
      if (constraints.length > 0) skin.constraints = constraints
      if (typeof rawSkin['color'] === 'string') {
        skin.extras = { spine: { color: rawSkin['color'] } }
      }

      const attachments: Record<string, Record<string, Attachment | null>> = {}
      const rawAttachments = rawSkin['attachments']
      if (isObject(rawAttachments)) {
        for (const [slotName, perSlot] of Object.entries(rawAttachments)) {
          if (!isObject(perSlot)) continue
          const bucket: Record<string, Attachment | null> = {}
          for (const [placeholder, rawAttachment] of Object.entries(perSlot)) {
            if (rawAttachment === null) {
              bucket[placeholder] = null
              continue
            }
            if (!isObject(rawAttachment)) continue
            const converted = this.readAttachment(placeholder, rawAttachment, name, slotName)
            if (converted !== undefined) bucket[placeholder] = converted
          }
          if (Object.keys(bucket).length > 0) attachments[slotName] = bucket
        }
      }
      if (Object.keys(attachments).length > 0) skin.attachments = attachments
      this.skins.push(skin)
    }
  }

  private readAttachment(
    placeholder: string,
    raw: JsonObject,
    skinName: string,
    slotName: string,
  ): Attachment | undefined {
    const type = str(raw['type'], 'region').toLowerCase()
    const spineName = typeof raw['name'] === 'string' ? raw['name'] : undefined
    const attachment: Attachment = { type }

    // Path resolution (spec 13.1).
    const rawPath = typeof raw['path'] === 'string' ? raw['path'] : spineName
    if (rawPath !== undefined && rawPath !== placeholder) {
      const clean = sanitizePath(rawPath)
      if (clean === undefined) {
        this.avisos.add(`Attachment "${placeholder}" tem caminho inválido "${rawPath}". Caminho descartado.`)
      } else {
        attachment.path = clean
      }
    }
    if (spineName !== undefined && spineName !== placeholder && spineName !== attachment.path) {
      attachment.extras = { spine: { name: spineName } }
    }
    if (typeof raw['color'] === 'string') attachment.color = hexToColor4(raw['color'])

    const regionName = attachment.path ?? placeholder
    // Só region, mesh e linkedmesh leem a página do atlas.
    if (type === 'region' || type === 'mesh' || type === 'linkedmesh') this.usouRegiao = true
    const crop = this.crops.get(regionName)
    const flipped = this.rotatedRegions.has(regionName)

    switch (type) {
      case 'region': {
        for (const key of ['x', 'y', 'rotation'] as const) {
          if (num(raw[key]) !== 0) attachment[key] = round6(num(raw[key]))
        }
        for (const key of ['scaleX', 'scaleY'] as const) {
          if (num(raw[key], 1) !== 1) attachment[key] = round6(num(raw[key], 1))
        }
        for (const key of ['width', 'height'] as const) {
          if (num(raw[key]) !== 0) attachment[key] = round6(num(raw[key]))
        }
        if (flipped) {
          // The atlas stored this region mirrored (see spine-atlas.ts).
          attachment['rotation'] = round6(num(attachment['rotation']) + 180)
        }
        this.copySequence(raw, attachment)
        break
      }
      case 'mesh': {
        const uvs = numArray(raw['uvs'])
        const triangles = intArray(raw['triangles'])
        if (uvs.length < 6 || triangles.length < 3) {
          this.avisos.add(`Mesh "${placeholder}" sem uvs ou triângulos. Attachment descartado.`)
          return undefined
        }
        attachment['uvs'] = this.convertUvs(uvs, crop, flipped, placeholder)
        attachment['triangles'] = triangles
        this.readVertices(raw, attachment, uvs.length / 2, `${skinName}/${slotName}/${placeholder}`)
        const hull = num(raw['hull'])
        if (hull > 0) attachment['hull'] = Math.round(hull)
        const edges = intArray(raw['edges'])
        if (edges.length > 0) attachment['edges'] = this.convertEdges(edges, placeholder)
        for (const key of ['width', 'height'] as const) {
          if (num(raw[key]) !== 0) attachment[key] = round6(num(raw[key]))
        }
        this.copySequence(raw, attachment)
        break
      }
      case 'linkedmesh': {
        attachment.type = 'linkedmesh'
        attachment['parent'] = str(raw['parent'])
        if (attachment['parent'] === '') {
          this.avisos.add(`Linkedmesh "${placeholder}" sem "parent". Attachment descartado.`)
          return undefined
        }
        if (typeof raw['skin'] === 'string' && raw['skin'] !== 'default') attachment['skin'] = raw['skin']
        const inherit = raw['timelines'] ?? raw['deform']
        if (inherit === false) attachment['inheritDeform'] = false
        for (const key of ['width', 'height'] as const) {
          if (num(raw[key]) !== 0) attachment[key] = round6(num(raw[key]))
        }
        this.copySequence(raw, attachment)
        break
      }
      case 'boundingbox': {
        attachment['shape'] = 'polygon'
        this.readVertices(raw, attachment, num(raw['vertexCount']), `${skinName}/${slotName}/${placeholder}`)
        if (attachment['vertices'] === undefined && attachment['binding'] === undefined) {
          this.avisos.add(`Boundingbox "${placeholder}" sem vértices. Attachment descartado.`)
          return undefined
        }
        break
      }
      case 'clipping': {
        if (typeof raw['end'] === 'string') attachment['end'] = raw['end']
        this.readVertices(raw, attachment, num(raw['vertexCount']), `${skinName}/${slotName}/${placeholder}`)
        if (attachment['vertices'] === undefined && attachment['binding'] === undefined) {
          this.avisos.add(`Clipping "${placeholder}" sem vértices. Attachment descartado.`)
          return undefined
        }
        break
      }
      case 'path': {
        if (bool(raw['closed'])) attachment['closed'] = true
        if (raw['constantSpeed'] === false) attachment['constantSpeed'] = false
        const vertexCount = num(raw['vertexCount'])
        this.readVertices(raw, attachment, vertexCount, `${skinName}/${slotName}/${placeholder}`)
        const lengths = numArray(raw['lengths'])
        if (lengths.length > 0) {
          attachment['lengths'] = roundArray(lengths)
        } else {
          const anchors = Math.max(1, Math.floor(vertexCount / 3))
          const curves = bool(raw['closed']) ? anchors : Math.max(1, anchors - 1)
          attachment['lengths'] = new Array<number>(curves).fill(0)
          this.avisos.add(`Path "${placeholder}" sem "lengths". Preenchido com zeros; recalcule no editor.`)
        }
        break
      }
      case 'point': {
        for (const key of ['x', 'y', 'rotation'] as const) {
          if (num(raw[key]) !== 0) attachment[key] = round6(num(raw[key]))
        }
        break
      }
      default: {
        this.avisos.add(`Attachment "${placeholder}" do tipo "${type}" não existe no formato. Convertido para "region" vazia.`)
        attachment.type = 'region'
        attachment.extras = { ...(attachment.extras ?? {}), spine: { type, original: raw } }
        break
      }
    }
    return attachment
  }

  private convertUvs(
    uvs: number[],
    crop: RegionCrop | undefined,
    flipped: boolean,
    placeholder: string,
  ): number[] {
    if (crop === undefined) {
      if (flipped) {
        this.avisos.add(`Mesh "${placeholder}" usa região girada, mas o atlas não veio junto. UVs não ajustados.`)
      }
      return roundArray(uvs)
    }
    const out: number[] = []
    for (let i = 0; i < uvs.length; i += 2) {
      const [u, v] = cropUvToOriginal(crop, uvs[i] ?? 0, uvs[i + 1] ?? 0)
      out.push(round6(Math.min(1, Math.max(0, u))), round6(Math.min(1, Math.max(0, v))))
    }
    return out
  }

  private convertEdges(edges: number[], placeholder: string): number[] {
    if (edges.every(e => e % 2 === 0)) return edges.map(e => e / 2)
    this.avisos.add(`Mesh "${placeholder}" tem "edges" com índice ímpar. Copiados sem conversão.`)
    return edges
  }

  private copySequence(raw: JsonObject, attachment: Attachment): void {
    const seq = raw['sequence']
    if (!isObject(seq)) return
    const out: JsonObject = {}
    if (typeof seq['count'] === 'number') out['count'] = Math.round(num(seq['count']))
    if (typeof seq['start'] === 'number' && seq['start'] !== 1) out['start'] = Math.round(num(seq['start']))
    if (typeof seq['digits'] === 'number' && seq['digits'] !== 0) out['digits'] = Math.round(num(seq['digits']))
    if (typeof seq['setup'] === 'number' && seq['setup'] !== 0) out['setup'] = Math.round(num(seq['setup']))
    if (out['count'] === undefined) {
      this.avisos.add('Sequência sem "count". Ignorada.')
      return
    }
    attachment['sequence'] = out
  }

  /** Spine vertices: plain list, or weighted "n, (bone, x, y, w) x n" runs. */
  private readVertices(
    raw: JsonObject,
    attachment: Attachment,
    vertexCount: number,
    label: string,
  ): void {
    const vertices = numArray(raw['vertices'])
    if (vertices.length === 0) return
    const plainLength = Math.round(vertexCount) * 2
    if (vertexCount > 0 && vertices.length === plainLength) {
      attachment['vertices'] = roundArray(vertices)
      this.meshInfo.set(label, { binding: false, influenceCount: 0, vertexCount: Math.round(vertexCount) })
      return
    }
    const counts: number[] = []
    const bones: number[] = []
    const positions: number[] = []
    const weights: number[] = []
    let i = 0
    while (i < vertices.length) {
      const n = Math.round(vertices[i++] ?? 0)
      if (n <= 0 || i + n * 4 > vertices.length) {
        this.avisos.add(`Vértices com pesos malformados em "${label}". Attachment sem deformação.`)
        attachment['vertices'] = roundArray(vertices)
        return
      }
      counts.push(n)
      for (let k = 0; k < n; k++) {
        bones.push(Math.round(vertices[i++] ?? 0))
        positions.push(round6(vertices[i++] ?? 0), round6(vertices[i++] ?? 0))
        weights.push(round6(Math.min(1, Math.max(0, vertices[i++] ?? 0))))
      }
    }
    attachment['binding'] = { counts, bones, positions, weights }
    this.meshInfo.set(label, { binding: true, influenceCount: weights.length, vertexCount: counts.length })
  }

  // ------------------------------------------------------------------ events

  private readEvents(): void {
    const raw = this.json['events']
    if (!isObject(raw)) return
    for (const [name, value] of Object.entries(raw)) {
      if (!isObject(value)) continue
      const def: EventDef = { name }
      if (typeof value['int'] === 'number') def.int = Math.round(num(value['int']))
      if (typeof value['float'] === 'number') def.float = round6(num(value['float']))
      if (typeof value['string'] === 'string') def.string = value['string']
      if (typeof value['audio'] === 'string') {
        const audio = sanitizeUri(value['audio'])
        if (audio === undefined) this.avisos.add(`Evento "${name}" tem áudio com caminho inválido. Áudio descartado.`)
        else def.audio = audio
      }
      if (typeof value['volume'] === 'number') def.volume = round6(Math.min(1, Math.max(0, num(value['volume'], 1))))
      if (typeof value['balance'] === 'number') def.balance = round6(Math.min(1, Math.max(-1, num(value['balance']))))
      this.events.push(def)
    }
  }

  // -------------------------------------------------------------- animations

  private readAnimations(): void {
    const raw = this.json['animations']
    if (!isObject(raw)) return
    for (const [name, value] of Object.entries(raw)) {
      if (!isObject(value)) continue
      const timelines: Timeline[] = []
      this.readBoneTimelines(value['bones'], timelines, name)
      this.readSlotTimelines(value['slots'], timelines, name)
      this.readDeformTimelines(value['attachments'] ?? value['deform'] ?? value['ffd'], timelines)
      this.readDrawOrder(value['drawOrder'] ?? value['draworder'], timelines)
      this.readEventTimeline(value['events'], timelines, name)
      this.readConstraintTimelines(value, timelines, name)
      const animation: Animation = { name, timelines }
      this.animations.push(animation)
    }
  }

  private addTimeline(timelines: Timeline[], timeline: Timeline, setupValue: unknown): void {
    if (timeline.keys.length === 0) return
    timeline.keys = ensureKeyAtZero(timeline.keys, setupValue)
    timelines.push(timeline)
  }

  private boneSetup(boneName: string, property: string): number {
    const bone = this.bones.find(b => b.name === boneName)
    if (bone === undefined) return property === 'scaleX' || property === 'scaleY' ? 1 : 0
    switch (property) {
      case 'x': return num(bone.x)
      case 'y': return num(bone.y)
      case 'rotation': return num(bone.rotation)
      case 'scaleX': return num(bone.scaleX, 1)
      case 'scaleY': return num(bone.scaleY, 1)
      case 'shearX': return num(bone.shearX)
      case 'shearY': return num(bone.shearY)
      default: return 0
    }
  }

  private readBoneTimelines(raw: unknown, timelines: Timeline[], animationName: string): void {
    if (!isObject(raw)) return
    for (const [boneName, value] of Object.entries(raw)) {
      if (!isObject(value)) continue
      if (!this.boneNames.has(boneName)) {
        this.avisos.add(`Animação "${animationName}" mexe no osso "${boneName}", que não existe. Timeline descartada.`)
        continue
      }
      for (const [kind, framesRaw] of Object.entries(value)) {
        const frames = frameList(framesRaw)
        if (frames.length === 0) continue
        const add = (property: string, read: (f: JsonObject) => number, component: number): void => {
          this.addTimeline(
            timelines,
            { type: 'bone', target: boneName, property, keys: numberKeys(frames, read, component) },
            this.boneSetup(boneName, property),
          )
        }
        switch (kind.toLowerCase()) {
          case 'rotate':
            add('rotation', f => num(f['value'] ?? f['angle']), 0)
            break
          case 'translate':
            add('x', f => num(f['x']), 0)
            add('y', f => num(f['y']), 1)
            break
          case 'translatex':
            add('x', f => num(f['value'] ?? f['x']), 0)
            break
          case 'translatey':
            add('y', f => num(f['value'] ?? f['y']), 0)
            break
          case 'scale':
            add('scaleX', f => num(f['x'], 1), 0)
            add('scaleY', f => num(f['y'], 1), 1)
            break
          case 'scalex':
            add('scaleX', f => num(f['value'] ?? f['x'], 1), 0)
            break
          case 'scaley':
            add('scaleY', f => num(f['value'] ?? f['y'], 1), 0)
            break
          case 'shear':
            add('shearX', f => num(f['x']), 0)
            add('shearY', f => num(f['y']), 1)
            break
          case 'shearx':
            add('shearX', f => num(f['value'] ?? f['x']), 0)
            break
          case 'sheary':
            add('shearY', f => num(f['value'] ?? f['y']), 0)
            break
          case 'inherit':
          case 'transform': {
            const bone = this.bones.find(b => b.name === boneName)
            const props: ['inheritRotation' | 'inheritScale' | 'inheritReflection', number][] = [
              ['inheritRotation', 0],
              ['inheritScale', 1],
              ['inheritReflection', 2],
            ]
            for (const [property, index] of props) {
              const keys: Key[] = frames.map(f => {
                const mode = str(f['inherit'] ?? f['value'], 'normal').toLowerCase()
                const table = INHERIT_MAP[mode] ?? INHERIT_MAP['normal']!
                return { time: round6(num(f['time'])), value: table[index], curve: 'stepped' as Curve }
              })
              this.addTimeline(
                timelines,
                { type: 'bone', target: boneName, property, keys: tidyKeys(keys) },
                bone === undefined ? true : bone[property] !== false,
              )
            }
            break
          }
          default:
            this.avisos.add(`Timeline de osso "${kind}" desconhecida na animação "${animationName}". Descartada.`)
        }
      }
    }
  }

  private readSlotTimelines(raw: unknown, timelines: Timeline[], animationName: string): void {
    if (!isObject(raw)) return
    for (const [slotName, value] of Object.entries(raw)) {
      if (!isObject(value)) continue
      const setup = this.slotSetup.get(slotName)
      if (setup === undefined) {
        this.avisos.add(`Animação "${animationName}" mexe no slot "${slotName}", que não existe. Timeline descartada.`)
        continue
      }
      const setupColor = setup.color ?? [1, 1, 1, 1]
      let rgbFrames: JsonObject[] | undefined
      let alphaFrames: JsonObject[] | undefined

      for (const [kind, framesRaw] of Object.entries(value)) {
        const frames = frameList(framesRaw)
        if (frames.length === 0) continue
        switch (kind.toLowerCase()) {
          case 'attachment': {
            const keys: Key[] = frames.map(f => ({
              time: round6(num(f['time'])),
              value: typeof f['name'] === 'string' ? f['name'] : null,
              curve: 'stepped' as Curve,
            }))
            this.addTimeline(
              timelines,
              { type: 'slot', target: slotName, property: 'attachment', keys: tidyKeys(keys) },
              setup.attachment ?? null,
            )
            break
          }
          case 'rgba':
          case 'color': {
            this.addTimeline(
              timelines,
              { type: 'slot', target: slotName, property: 'color', keys: this.colorKeys(frames, 'color', 4, setupColor) },
              setupColor,
            )
            break
          }
          case 'rgb':
            rgbFrames = frames
            break
          case 'alpha':
            alphaFrames = frames
            break
          case 'rgba2':
          case 'twocolor': {
            this.addTimeline(
              timelines,
              { type: 'slot', target: slotName, property: 'color', keys: this.colorKeys(frames, 'light', 4, setupColor) },
              setupColor,
            )
            this.addTimeline(
              timelines,
              { type: 'slot', target: slotName, property: 'darkColor', keys: this.colorKeys(frames, 'dark', 3, setup.darkColor ?? [0, 0, 0]) },
              setup.darkColor ?? [0, 0, 0],
            )
            break
          }
          case 'rgb2': {
            this.addTimeline(
              timelines,
              { type: 'slot', target: slotName, property: 'color', keys: this.colorKeys(frames, 'light', 3, setupColor, setupColor[3] ?? 1) },
              setupColor,
            )
            this.addTimeline(
              timelines,
              { type: 'slot', target: slotName, property: 'darkColor', keys: this.colorKeys(frames, 'dark', 3, setup.darkColor ?? [0, 0, 0]) },
              setup.darkColor ?? [0, 0, 0],
            )
            break
          }
          default:
            this.avisos.add(`Timeline de slot "${kind}" desconhecida na animação "${animationName}". Descartada.`)
        }
      }

      if (rgbFrames !== undefined || alphaFrames !== undefined) {
        const keys = this.mergeRgbAlpha(rgbFrames, alphaFrames, setupColor, slotName, animationName)
        this.addTimeline(timelines, { type: 'slot', target: slotName, property: 'color', keys }, setupColor)
      }
    }
  }

  /** Reads a hex colour timeline into colour keys with per-channel curves. */
  private colorKeys(
    frames: JsonObject[],
    field: string,
    channels: number,
    fallback: number[],
    forcedAlpha?: number,
  ): Key[] {
    const keys: Key[] = frames.map(f => {
      const hex = f[field] ?? f['color']
      const color = channels === 4 ? hexToColor4(hex, fallback) : hexToColor3(hex, fallback.slice(0, 3))
      if (channels === 3 && forcedAlpha !== undefined) color.push(round6(forcedAlpha))
      return { time: round6(num(f['time'])), value: color }
    })
    const width = (keys[0]?.value as number[] | undefined)?.length ?? channels
    for (let i = 0; i < frames.length - 1; i++) {
      const spec = readSpineCurve(frames[i]!)
      if (spec.kind === 'stepped') {
        keys[i]!.curve = 'stepped'
        continue
      }
      if (spec.kind === 'linear') continue
      const v0 = keys[i]!.value as number[]
      const v1 = keys[i + 1]!.value as number[]
      const curve: number[] = []
      for (let c = 0; c < width; c++) {
        const part = curveOf(spec, c, keys[i]!.time, v0[c] ?? 0, keys[i + 1]!.time, v1[c] ?? 0)
        if (part === 'stepped' || part === 'linear') {
          // Mixed shapes cannot be expressed: fall back to linear controls.
          const t0 = keys[i]!.time
          const t1 = keys[i + 1]!.time
          curve.push(
            round6(t0 + (t1 - t0) / 3),
            round6((v0[c] ?? 0) + ((v1[c] ?? 0) - (v0[c] ?? 0)) / 3),
            round6(t0 + (2 * (t1 - t0)) / 3),
            round6((v0[c] ?? 0) + (2 * ((v1[c] ?? 0) - (v0[c] ?? 0))) / 3),
          )
        } else {
          curve.push(...part)
        }
      }
      keys[i]!.curve = curve
    }
    return tidyKeys(keys)
  }

  private mergeRgbAlpha(
    rgbFrames: JsonObject[] | undefined,
    alphaFrames: JsonObject[] | undefined,
    setupColor: number[],
    slotName: string,
    animationName: string,
  ): Key[] {
    const rgbKeys = rgbFrames === undefined ? [] : this.colorKeys(rgbFrames, 'color', 3, setupColor)
    const alphaKeys = alphaFrames === undefined ? [] : numberKeys(alphaFrames, f => num(f['value'], 1), 0)

    if (rgbKeys.length > 0 && alphaKeys.length === 0) {
      return rgbKeys.map(k => ({ ...k, value: [...(k.value as number[]).slice(0, 3), round6(setupColor[3] ?? 1)] }))
    }
    if (alphaKeys.length > 0 && rgbKeys.length === 0) {
      return alphaKeys.map(k => ({
        time: k.time,
        value: [round6(setupColor[0] ?? 1), round6(setupColor[1] ?? 1), round6(setupColor[2] ?? 1), round6(num(k.value))],
        ...(k.curve === undefined ? {} : { curve: k.curve }),
      }))
    }

    const timesRgb = rgbKeys.map(k => k.time)
    const timesAlpha = alphaKeys.map(k => k.time)
    const same =
      timesRgb.length === timesAlpha.length && timesRgb.every((t, i) => Math.abs(t - (timesAlpha[i] ?? 0)) < 1e-9)
    if (!same) {
      this.avisos.add(
        `Slot "${slotName}" na animação "${animationName}" tem "rgb" e "alpha" com tempos diferentes. As curvas foram reamostradas; os valores nas chaves continuam exatos.`,
      )
    }
    const times = Array.from(new Set([...timesRgb, ...timesAlpha])).sort((a, b) => a - b)
    return times.map(t => {
      const rgb = rgbKeys.length > 0 ? this.evaluateColor(rgbKeys, t) : setupColor
      const alpha = alphaKeys.length > 0 ? evaluateNumber(alphaKeys, t) : (setupColor[3] ?? 1)
      return {
        time: round6(t),
        value: [round6(rgb[0] ?? 1), round6(rgb[1] ?? 1), round6(rgb[2] ?? 1), round6(alpha)],
      }
    })
  }

  private evaluateColor(keys: Key[], t: number): number[] {
    const out: number[] = []
    const width = (keys[0]?.value as number[] | undefined)?.length ?? 3
    for (let c = 0; c < width; c++) {
      const single = keys.map(k => ({
        time: k.time,
        value: (k.value as number[])[c] ?? 0,
        ...(Array.isArray(k.curve) ? { curve: k.curve.slice(c * 4, c * 4 + 4) } : { curve: k.curve }),
      }))
      out.push(evaluateNumber(single as Key[], t))
    }
    return out
  }

  private readDeformTimelines(raw: unknown, timelines: Timeline[]): void {
    if (!isObject(raw)) return
    for (const [skinName, perSkin] of Object.entries(raw)) {
      if (!isObject(perSkin)) continue
      for (const [slotName, perSlot] of Object.entries(perSkin)) {
        if (!isObject(perSlot)) continue
        for (const [attachmentName, perAttachment] of Object.entries(perSlot)) {
          if (!isObject(perAttachment)) {
            // Spine 3.8 ffd: attachment -> frames array.
            const frames = frameList(perAttachment)
            if (frames.length === 0) continue
            this.pushDeform(timelines, skinName, slotName, attachmentName, frames)
            continue
          }
          for (const [kind, framesRaw] of Object.entries(perAttachment)) {
            const frames = frameList(framesRaw)
            if (frames.length === 0) continue
            if (kind.toLowerCase() === 'deform') {
              this.pushDeform(timelines, skinName, slotName, attachmentName, frames)
            } else if (kind.toLowerCase() === 'sequence') {
              const keys: Key[] = frames.map(f => {
                const value: JsonObject = {}
                const mode = str(f['mode'], 'hold')
                if (mode !== 'hold') value['mode'] = mode
                if (num(f['index']) !== 0) value['index'] = Math.round(num(f['index']))
                if (num(f['delay']) !== 0) value['delay'] = round6(num(f['delay']))
                return { time: round6(num(f['time'])), value, curve: 'stepped' as Curve }
              })
              this.addTimeline(
                timelines,
                { type: 'sequence', target: slotName, skin: skinName, attachment: attachmentName, keys: tidyKeys(keys) },
                {},
              )
            } else {
              this.avisos.add(`Timeline de attachment "${kind}" desconhecida. Descartada.`)
            }
          }
        }
      }
    }
  }

  private pushDeform(
    timelines: Timeline[],
    skinName: string,
    slotName: string,
    attachmentName: string,
    frames: JsonObject[],
  ): void {
    const keys: Key[] = frames.map(f => ({
      time: round6(num(f['time'])),
      value: roundArray(numArray(f['vertices'])),
      ...(num(f['offset']) !== 0 ? { offset: Math.round(num(f['offset'])) } : {}),
    }))
    for (let i = 0; i < frames.length - 1; i++) {
      const spec = readSpineCurve(frames[i]!)
      const c = curveOf(spec, 0, keys[i]!.time, 0, keys[i + 1]!.time, 1)
      if (c !== 'linear') keys[i]!.curve = c
    }
    const timeline: Timeline = { type: 'deform', target: slotName, attachment: attachmentName, keys: tidyKeys(keys) }
    if (skinName !== 'default') timeline.skin = skinName
    this.addTimeline(timelines, timeline, [])
  }

  private readDrawOrder(raw: unknown, timelines: Timeline[]): void {
    const frames = frameList(raw)
    if (frames.length === 0) return
    const keys: Key[] = frames.map(f => {
      const offsets: DrawOrderOffset[] = []
      for (const entry of frameList(f['offsets'])) {
        const slot = str(entry['slot'])
        if (!this.slotSetup.has(slot)) continue
        offsets.push({ slot, offset: Math.round(num(entry['offset'])) })
      }
      return { time: round6(num(f['time'])), value: offsets, curve: 'stepped' as Curve }
    })
    this.addTimeline(timelines, { type: 'drawOrder', keys: tidyKeys(keys) }, [])
  }

  private readEventTimeline(raw: unknown, timelines: Timeline[], animationName: string): void {
    const frames = frameList(raw)
    if (frames.length === 0) return
    const known = new Set(this.events.map(e => e.name))
    const keys: Key[] = []
    for (const f of frames) {
      const name = str(f['name'])
      if (name.length === 0) continue
      if (!known.has(name)) {
        this.avisos.add(`Animação "${animationName}" dispara o evento "${name}", que não está declarado. Evento criado com valores padrão.`)
        this.events.push({ name })
        known.add(name)
      }
      const key: Key = { time: round6(num(f['time'])), event: name }
      if (typeof f['int'] === 'number') key.int = Math.round(num(f['int']))
      if (typeof f['float'] === 'number') key.float = round6(num(f['float']))
      if (typeof f['string'] === 'string') key.string = f['string']
      if (typeof f['volume'] === 'number') key.volume = round6(Math.min(1, Math.max(0, num(f['volume'], 1))))
      if (typeof f['balance'] === 'number') key.balance = round6(Math.min(1, Math.max(-1, num(f['balance']))))
      keys.push(key)
    }
    if (keys.length === 0) return
    keys.sort((a, b) => a.time - b.time)
    timelines.push({ type: 'event', keys })
  }

  private constraintSetup(name: string, property: string): number | boolean {
    const c = this.constraintByName.get(name)
    if (c === undefined) return 0
    const value = c[property]
    if (typeof value === 'number' || typeof value === 'boolean') return value
    switch (property) {
      case 'mix':
      case 'mixRotation':
      case 'mixX':
      case 'mixY':
      case 'mixScaleX':
      case 'mixScaleY':
      case 'mixShearY':
      case 'damping':
        return 1
      case 'inertia':
        return 0.5
      case 'strength':
        return 100
      case 'mass':
        return 1
      case 'bendPositive':
        return true
      case 'compress':
      case 'stretch':
      case 'uniform':
        return false
      default:
        return 0
    }
  }

  private readConstraintTimelines(animation: JsonObject, timelines: Timeline[], animationName: string): void {
    const groups: [string, [string, string][], string[]][] = [
      ['ik', [['mix', 'mix'], ['softness', 'softness']], ['bendPositive', 'compress', 'stretch', 'uniform']],
      [
        'transform',
        this.legacy38
          ? [['rotateMix', 'mixRotation'], ['translateMix', 'mixX'], ['translateMix', 'mixY'], ['scaleMix', 'mixScaleX'], ['scaleMix', 'mixScaleY'], ['shearMix', 'mixShearY'], ['mix', 'mix']]
          : [['mixRotate', 'mixRotation'], ['mixX', 'mixX'], ['mixY', 'mixY'], ['mixScaleX', 'mixScaleX'], ['mixScaleY', 'mixScaleY'], ['mixShearY', 'mixShearY'], ['mix', 'mix']],
        [],
      ],
      [
        'path',
        this.legacy38
          ? [['position', 'position'], ['spacing', 'spacing'], ['rotateMix', 'mixRotation'], ['translateMix', 'mixX'], ['translateMix', 'mixY'], ['mix', 'mix']]
          : [['position', 'position'], ['spacing', 'spacing'], ['mixRotate', 'mixRotation'], ['mixX', 'mixX'], ['mixY', 'mixY'], ['mix', 'mix']],
        [],
      ],
      [
        'physics',
        [['inertia', 'inertia'], ['strength', 'strength'], ['damping', 'damping'], ['mass', 'mass'], ['wind', 'wind'], ['gravity', 'gravity'], ['mix', 'mix']],
        [],
      ],
    ]

    for (const [group, numeric, booleans] of groups) {
      const raw = animation[group]
      if (!isObject(raw)) continue
      for (const [rawName, framesRaw] of Object.entries(raw)) {
        const frames = frameList(framesRaw)
        if (frames.length === 0) continue
        // Spine 4.2 writes physics with an empty name to reach every physics
        // constraint at once.
        const targets = rawName === '' && group === 'physics' ? this.physicsNames : [rawName]
        if (targets.length === 0) {
          this.avisos.add(`Animação "${animationName}" tem timeline de física sem alvo e o esqueleto não tem constraint de física. Descartada.`)
          continue
        }
        for (const target of targets) {
          if (!this.constraintByName.has(target)) {
            this.avisos.add(`Animação "${animationName}" mexe na constraint "${target}", que não existe. Timeline descartada.`)
            continue
          }
          for (const [field, property] of numeric) {
            if (!frames.some(f => typeof f[field] === 'number')) continue
            const keys = numberKeys(frames, f => num(f[field], num(this.constraintSetup(target, property))), 0)
            this.addTimeline(
              timelines,
              { type: 'constraint', target, property, keys },
              this.constraintSetup(target, property),
            )
          }
          for (const field of booleans) {
            if (!frames.some(f => typeof f[field] === 'boolean')) continue
            const keys: Key[] = frames.map(f => ({
              time: round6(num(f['time'])),
              value: bool(f[field], Boolean(this.constraintSetup(target, field))),
              curve: 'stepped' as Curve,
            }))
            this.addTimeline(
              timelines,
              { type: 'constraint', target, property: field, keys: tidyKeys(keys) },
              this.constraintSetup(target, field),
            )
          }
          if (group === 'physics' && frames.some(f => f['reset'] === true)) {
            const keys: Key[] = frames.filter(f => f['reset'] === true).map(f => ({ time: round6(num(f['time'])) }))
            if (keys.length > 0) timelines.push({ type: 'constraint', target, property: 'reset', keys: tidyKeys(keys) })
          }
        }
      }
    }
  }
}

export function importSpine(
  json: unknown,
  atlasTexto?: string | null,
  opcoes: SpineOptions = {},
): ImportResult {
  if (!isObject(json)) {
    throw new Error('O arquivo do Spine não é um objeto JSON.')
  }
  return new SpineImporter(json, opcoes).run(atlasTexto)
}
