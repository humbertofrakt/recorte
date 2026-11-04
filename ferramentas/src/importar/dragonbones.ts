// SPDX-License-Identifier: Apache-2.0
// DragonBones JSON 5.5 -> .bone (spec section 13.2).
// DragonBones uses Y down and clockwise degrees: y -> -y, angle -> -angle,
// and time is measured in frames (t = frame / frameRate).

import type {
  Animation,
  Attachment,
  AtlasFile,
  AtlasRegion,
  Bone,
  BoneFile,
  Constraint,
  Curve,
  DrawOrderOffset,
  EventDef,
  ImportResult,
  JsonObject,
  Key,
  Matrix,
  Skin,
  Slot,
  Timeline,
} from './comum.ts'
import {
  Warnings,
  bool,
  DEG,
  FORMAT_VERSION,
  IMPORTER_NAME,
  ensureKeyAtZero,
  fitEasing,
  isObject,
  makeHeader,
  matrixApply,
  matrixApplyVector,
  matrixInvert,
  matrixMultiply,
  normalizedCurveToAbsolute,
  num,
  numArray,
  intArray,
  round6,
  roundArray,
  sanitizePath,
  sanitizeUri,
  str,
  tidyKeys,
} from './comum.ts'

const BLEND_MAP: Record<string, string> = {
  normal: 'normal',
  add: 'additive',
  additive: 'additive',
  multiply: 'multiply',
  screen: 'screen',
}

interface MeshShape {
  weighted: boolean
  vertexCount: number
  /** For weighted meshes: one 2x3 matrix per influence, in DragonBones space. */
  influence: Matrix[]
  /** Number of influences per vertex. */
  counts: number[]
}

interface RegionSize {
  width: number
  height: number
}

function objectList(value: unknown): JsonObject[] {
  if (!Array.isArray(value)) return []
  return value.filter(isObject)
}

class DragonBonesImporter {
  readonly avisos = new Warnings()
  private readonly bones: Bone[] = []
  private readonly slots: Slot[] = []
  private readonly constraints: Constraint[] = []
  private readonly skins: Skin[] = []
  private readonly events: EventDef[] = []
  private readonly animations: Animation[] = []
  private readonly boneIndex = new Map<string, number>()
  private readonly slotSetup = new Map<string, Slot>()
  private readonly slotOrder: string[] = []
  private readonly slotDisplays = new Map<string, string[]>()
  private readonly meshShapes = new Map<string, MeshShape>()
  private readonly regionSizes = new Map<string, RegionSize>()
  private atlas: AtlasFile | undefined
  private frameRate = 24
  private version = ''

  private readonly json: JsonObject
  /** Name of the armature to convert. Undefined means the first one. */
  private readonly wanted: string | undefined

  constructor(json: JsonObject, wanted?: string) {
    this.json = json
    this.wanted = wanted
  }

  run(atlasJson?: unknown): ImportResult {
    this.version = str(this.json['version'], 'desconhecida')
    this.frameRate = num(this.json['frameRate'], 24)
    if (this.frameRate <= 0) this.frameRate = 24
    if (atlasJson !== undefined && atlasJson !== null) this.readAtlas(atlasJson)

    const armatures = objectList(this.json['armature'])
    if (armatures.length === 0) throw new Error('O arquivo do DragonBones não tem nenhuma armature.')

    // Um arquivo do DragonBones pode ter várias armatures, e um .bone guarda um
    // esqueleto. Sem escolha, vai a primeira; `parte` escolhe outra pelo nome.
    let escolhida = 0
    if (this.wanted !== undefined) {
      escolhida = armatures.findIndex(a => str(a['name']) === this.wanted)
      if (escolhida < 0) {
        const nomes = armatures.map(a => str(a['name'])).join(', ')
        throw new Error(`O arquivo não tem a armature "${this.wanted}". Tem: ${nomes}.`)
      }
    }
    if (armatures.length > 1) {
      const extras = armatures.filter((_, i) => i !== escolhida).map(a => str(a['name'])).join(', ')
      this.avisos.add(
        `O arquivo tem ${armatures.length} armatures. Só "${str(armatures[escolhida]!['name'])}" virou este .bone. Para as outras (${extras}), rode de novo com --parte <nome>.`,
      )
    }
    const armature = armatures[escolhida]!
    const armatureFps = num(armature['frameRate'], 0)
    if (armatureFps > 0) this.frameRate = armatureFps

    const file: BoneFile = {
      bone: makeHeader(`DragonBones ${this.version}`),
      bones: this.bones,
    }

    const skeleton: JsonObject = { name: str(armature['name'], str(this.json['name'], 'armature')), fps: this.frameRate }
    const aabb = armature['aabb']
    if (isObject(aabb)) {
      skeleton['x'] = round6(num(aabb['x']))
      skeleton['y'] = round6(-num(aabb['y']) - num(aabb['height']))
      skeleton['width'] = round6(Math.abs(num(aabb['width'])))
      skeleton['height'] = round6(Math.abs(num(aabb['height'])))
    }
    file.skeleton = skeleton as BoneFile['skeleton']
    if (this.atlas !== undefined) file.assets = { atlases: ['atlas.atlas.json'] }

    this.readBones(armature)
    this.readSlots(armature)
    this.readSkins(armature)
    this.readIk(armature)
    this.readPath(armature)
    this.readAnimations(armature)

    if (this.bones.length === 0) {
      this.bones.push({ name: 'root' })
      this.boneIndex.set('root', 0)
      this.avisos.add('A armature não tem ossos. Foi criado um osso "root".')
    }
    if (this.slots.length > 0) file.slots = this.slots
    if (this.constraints.length > 0) file.constraints = this.constraints
    if (this.skins.length > 0) file.skins = this.skins
    if (this.events.length > 0) file.events = this.events
    if (this.animations.length > 0) file.animations = this.animations

    const extras: JsonObject = {
      import: { from: 'dragonbones', version: this.version, warnings: [] as string[] },
    }
    const canvas = armature['canvas']
    if (canvas !== undefined) extras['dragonbones'] = { canvas }
    const defaultActions = armature['defaultActions']
    if (defaultActions !== undefined) {
      extras['dragonbones'] = { ...(extras['dragonbones'] as JsonObject | undefined), defaultActions }
      this.avisos.add('A armature tem "defaultActions". Foram guardadas em extras; o runtime não executa ações.')
    }
    const avisos = this.avisos.list()
    ;(extras['import'] as JsonObject)['warnings'] = avisos
    file.extras = extras
    return { file, atlas: this.atlas, avisos }
  }

  // ------------------------------------------------------------------- atlas

  private readAtlas(raw: unknown): void {
    if (!isObject(raw)) {
      this.avisos.add('O atlas do DragonBones não é um objeto JSON. Ignorado.')
      return
    }
    const image = sanitizeUri(raw['imagePath'])
    if (image === undefined) {
      this.avisos.add('O atlas do DragonBones não tem "imagePath" utilizável. Ignorado.')
      return
    }
    const pageName = image.replace(/\.[^./]+$/, '') || 'pagina'
    const regions: AtlasRegion[] = []
    for (const sub of objectList(raw['SubTexture'])) {
      const name = str(sub['name'])
      if (name.length === 0) continue
      const width = Math.round(num(sub['width']))
      const height = Math.round(num(sub['height']))
      const frameWidth = Math.round(num(sub['frameWidth'], width))
      const frameHeight = Math.round(num(sub['frameHeight'], height))
      const frameX = Math.round(num(sub['frameX']))
      const frameY = Math.round(num(sub['frameY']))
      const region: AtlasRegion = {
        name,
        page: 0,
        x: Math.round(num(sub['x'])),
        y: Math.round(num(sub['y'])),
        width,
        height,
      }
      if (bool(sub['rotated'])) region.rotation = 90
      const offsetX = -frameX
      const offsetY = frameHeight - height + frameY
      if (offsetX !== 0) region.offsetX = Math.max(0, offsetX)
      if (offsetY !== 0) region.offsetY = Math.max(0, offsetY)
      if (frameWidth !== width) region.originalWidth = frameWidth
      if (frameHeight !== height) region.originalHeight = frameHeight
      regions.push(region)
      this.regionSizes.set(name, { width: frameWidth, height: frameHeight })
    }
    this.atlas = {
      atlas: { version: FORMAT_VERSION, generator: IMPORTER_NAME },
      pages: [
        {
          name: pageName,
          image,
          width: Math.max(1, Math.round(num(raw['width'], 1))),
          height: Math.max(1, Math.round(num(raw['height'], 1))),
        },
      ],
      regions,
    }
  }

  // ------------------------------------------------------------------- bones

  private readBones(armature: JsonObject): void {
    for (const raw of objectList(armature['bone'])) {
      const name = str(raw['name'])
      if (name.length === 0) continue
      const bone: Bone = { name }
      if (typeof raw['parent'] === 'string' && raw['parent'].length > 0) bone.parent = raw['parent']
      const length = num(raw['length'])
      if (length !== 0) bone.length = round6(Math.abs(length))
      const t = isObject(raw['transform']) ? raw['transform'] : {}
      const x = num(t['x'])
      const y = num(t['y'])
      const skX = num(t['skX'])
      const skY = num(t['skY'], skX)
      const scX = num(t['scX'], 1)
      const scY = num(t['scY'], 1)
      if (x !== 0) bone.x = round6(x)
      if (y !== 0) bone.y = round6(-y)
      if (skX !== 0) bone.rotation = round6(-skX)
      const shearY = -(skY - skX)
      if (Math.abs(shearY) > 1e-9) bone.shearY = round6(shearY)
      if (scX !== 1) bone.scaleX = round6(scX)
      if (scY !== 1) bone.scaleY = round6(scY)
      if (raw['inheritRotation'] === false) bone.inheritRotation = false
      if (raw['inheritScale'] === false) bone.inheritScale = false
      if (raw['inheritReflection'] === false) bone.inheritReflection = false
      if (raw['inheritTranslation'] === false) {
        this.avisos.add(
          `Osso "${name}" tem "inheritTranslation: false", que o formato não tem. O osso passou a herdar a translação do pai; confira a pose.`,
        )
      }
      this.boneIndex.set(name, this.bones.length)
      this.bones.push(bone)
    }
    for (const bone of this.bones) {
      if (bone.parent !== undefined && !this.boneIndex.has(bone.parent)) {
        this.avisos.add(`Osso "${bone.name}" aponta para o pai "${bone.parent}", que não existe. Virou filho da raiz.`)
        delete bone.parent
      }
    }
    const roots = this.bones.filter(b => b.parent === undefined)
    if (roots.length > 1) {
      const root: Bone = { name: this.uniqueBoneName('root') }
      for (const bone of roots) bone.parent = root.name
      this.bones.unshift(root)
      this.boneIndex.clear()
      this.bones.forEach((b, i) => this.boneIndex.set(b.name, i))
      this.avisos.add(`A armature tinha ${roots.length} ossos sem pai. Foi criado o osso "${root.name}" como raiz única.`)
    }
  }

  private uniqueBoneName(base: string): string {
    let name = base
    let n = 2
    while (this.boneIndex.has(name)) name = `${base}_${n++}`
    return name
  }

  // ------------------------------------------------------------------- slots

  private readSlots(armature: JsonObject): void {
    for (const raw of objectList(armature['slot'])) {
      const name = str(raw['name'])
      if (name.length === 0) continue
      const parent = str(raw['parent'])
      const slot: Slot = { name, bone: this.boneIndex.has(parent) ? parent : (this.bones[0]?.name ?? 'root') }
      if (!this.boneIndex.has(parent)) {
        this.avisos.add(`Slot "${name}" está no osso "${parent}", que não existe. Ligado ao primeiro osso.`)
      }
      const blendRaw = str(raw['blendMode'], 'normal').toLowerCase()
      const blend = BLEND_MAP[blendRaw]
      if (blend === undefined) {
        this.avisos.add(`Slot "${name}" com mistura "${blendRaw}", que o formato não tem. Usando "normal".`)
      } else if (blend !== 'normal') {
        slot.blend = blend
      }
      const color = raw['color']
      if (isObject(color)) {
        slot.color = [
          round6(Math.min(1, Math.max(0, num(color['rM'], 100) / 100))),
          round6(Math.min(1, Math.max(0, num(color['gM'], 100) / 100))),
          round6(Math.min(1, Math.max(0, num(color['bM'], 100) / 100))),
          round6(Math.min(1, Math.max(0, num(color['aM'], 100) / 100))),
        ]
        const offsets = ['aO', 'rO', 'gO', 'bO'].filter(k => num(color[k]) !== 0)
        if (offsets.length > 0) {
          slot.extras = { dragonbones: { colorOffset: { aO: num(color['aO']), rO: num(color['rO']), gO: num(color['gO']), bO: num(color['bO']) } } }
          this.avisos.add(
            `Slot "${name}" usa soma de cor (${offsets.join(', ')}), que o formato não tem. Guardada em extras; a cor pode ficar diferente.`,
          )
        }
      }
      slot.extras = {
        ...(slot.extras ?? {}),
        dragonbones: { ...((slot.extras?.['dragonbones'] as JsonObject | undefined) ?? {}), displayIndex: Math.round(num(raw['displayIndex'])) },
      }
      this.slots.push(slot)
      this.slotOrder.push(name)
      this.slotSetup.set(name, slot)
    }
  }

  // ------------------------------------------------------------------- skins

  private readSkins(armature: JsonObject): void {
    const rawSkins = objectList(armature['skin'])
    if (rawSkins.length === 0) return
    for (const rawSkin of rawSkins) {
      const skinName = str(rawSkin['name']) || 'default'
      const skin: Skin = { name: skinName }
      const attachments: Record<string, Record<string, Attachment | null>> = {}
      for (const rawSlot of objectList(rawSkin['slot'])) {
        const slotName = str(rawSlot['name'])
        if (slotName.length === 0) continue
        const bucket: Record<string, Attachment | null> = {}
        const names: string[] = []
        for (const display of objectList(rawSlot['display'])) {
          let placeholder = str(display['name'])
          if (placeholder.length === 0) placeholder = `display_${names.length}`
          let unique = placeholder
          let n = 2
          while (bucket[unique] !== undefined) unique = `${placeholder}_${n++}`
          const attachment = this.readDisplay(display, skinName, slotName, unique)
          names.push(unique)
          if (attachment !== undefined) bucket[unique] = attachment
        }
        if (skinName === 'default' || !this.slotDisplays.has(slotName)) this.slotDisplays.set(slotName, names)
        if (Object.keys(bucket).length > 0) attachments[slotName] = bucket
      }
      if (Object.keys(attachments).length > 0) skin.attachments = attachments
      this.skins.push(skin)
    }
    // Setup attachment per slot comes from displayIndex.
    for (const slot of this.slots) {
      const dbExtras = slot.extras?.['dragonbones'] as JsonObject | undefined
      const index = Math.round(num(dbExtras?.['displayIndex']))
      const names = this.slotDisplays.get(slot.name) ?? []
      if (index >= 0 && index < names.length) slot.attachment = names[index]
      if (dbExtras !== undefined) {
        delete dbExtras['displayIndex']
        if (Object.keys(dbExtras).length === 0) delete slot.extras!['dragonbones']
        if (Object.keys(slot.extras!).length === 0) delete slot.extras
      }
    }
  }

  private readDisplay(
    display: JsonObject,
    skinName: string,
    slotName: string,
    placeholder: string,
  ): Attachment | undefined {
    const type = str(display['type'], 'image').toLowerCase()
    const t = isObject(display['transform']) ? display['transform'] : {}
    const rotation = -num(t['skX'])
    const scaleX = num(t['scX'], 1)
    const scaleY = num(t['scY'], 1)
    const px = num(t['x'])
    const py = -num(t['y'])

    const rawPath = typeof display['path'] === 'string' && display['path'].length > 0 ? display['path'] : str(display['name'])
    const path = sanitizePath(rawPath)

    switch (type) {
      case 'image': {
        const attachment: Attachment = { type: 'region' }
        if (path !== undefined && path !== placeholder) attachment.path = path
        const size = this.regionSizes.get(rawPath)
        const pivot = isObject(display['pivot']) ? display['pivot'] : {}
        const pivotX = num(pivot['x'], 0.5)
        const pivotY = num(pivot['y'], 0.5)
        let cx = px
        let cy = py
        if (pivotX !== 0.5 || pivotY !== 0.5) {
          if (size === undefined) {
            this.avisos.add(
              `Display "${placeholder}" tem pivô fora do centro, mas o atlas não veio junto. O desenho pode sair deslocado.`,
            )
          } else {
            const dx = (0.5 - pivotX) * size.width * scaleX
            const dy = -(0.5 - pivotY) * size.height * scaleY
            const cos = Math.cos(rotation * DEG)
            const sin = Math.sin(rotation * DEG)
            cx = px + cos * dx - sin * dy
            cy = py + sin * dx + cos * dy
          }
        }
        if (cx !== 0) attachment['x'] = round6(cx)
        if (cy !== 0) attachment['y'] = round6(cy)
        if (rotation !== 0) attachment['rotation'] = round6(rotation)
        if (scaleX !== 1) attachment['scaleX'] = round6(scaleX)
        if (scaleY !== 1) attachment['scaleY'] = round6(scaleY)
        if (size !== undefined) {
          attachment['width'] = size.width
          attachment['height'] = size.height
        }
        return attachment
      }
      case 'mesh': {
        const share = str(display['share'])
        if (share.length > 0) {
          const attachment: Attachment = { type: 'linkedmesh', parent: share }
          if (path !== undefined && path !== placeholder) attachment.path = path
          if (display['inheritDeform'] === false) attachment['inheritDeform'] = false
          return attachment
        }
        return this.readMesh(display, skinName, slotName, placeholder, path, [px, py, rotation, scaleX, scaleY])
      }
      case 'boundingbox': {
        const subType = str(display['subType'], 'polygon').toLowerCase()
        const attachment: Attachment = { type: 'boundingbox' }
        if (subType === 'rectangle' || subType === 'ellipse') {
          attachment['shape'] = subType
          attachment['width'] = round6(Math.abs(num(display['width'])))
          attachment['height'] = round6(Math.abs(num(display['height'])))
          if (px !== 0) attachment['x'] = round6(px)
          if (py !== 0) attachment['y'] = round6(py)
          if (rotation !== 0) attachment['rotation'] = round6(rotation)
          return attachment
        }
        const vertices = numArray(display['vertices'])
        if (vertices.length < 6) {
          this.avisos.add(`Bounding box "${placeholder}" sem vértices. Descartada.`)
          return undefined
        }
        attachment['shape'] = 'polygon'
        attachment['vertices'] = roundArray(vertices.map((v, i) => (i % 2 === 1 ? -v : v)))
        return attachment
      }
      case 'armature': {
        const child = str(display['name'], placeholder)
        const uri = sanitizeUri(`${child}.bone`)
        const attachment: Attachment = { type: 'skeleton', uri: uri ?? 'armature.bone' }
        const actions = objectList(display['actions'])
        const play = actions.find(a => str(a['gotoAndPlay']).length > 0 || str(a['name']).length > 0)
        if (play !== undefined) attachment['animation'] = str(play['gotoAndPlay'], str(play['name']))
        if (display['inheritAnimation'] === false) attachment['inheritColor'] = true
        this.avisos.add(
          `Slot "${slotName}" mostra a armature "${child}". Converta essa armature separada e deixe o arquivo "${child}.bone" ao lado.`,
        )
        return attachment
      }
      default: {
        this.avisos.add(`Display "${placeholder}" do tipo "${type}" não existe no formato. Descartado.`)
        return undefined
      }
    }
  }

  private readMesh(
    display: JsonObject,
    skinName: string,
    slotName: string,
    placeholder: string,
    path: string | undefined,
    transform: [number, number, number, number, number],
  ): Attachment | undefined {
    const vertices = numArray(display['vertices'])
    const uvs = numArray(display['uvs'])
    const triangles = intArray(display['triangles'])
    if (vertices.length < 6 || uvs.length < 6 || triangles.length < 3) {
      this.avisos.add(`Mesh "${placeholder}" sem vértices, uvs ou triângulos. Descartada.`)
      return undefined
    }
    const attachment: Attachment = { type: 'mesh' }
    if (path !== undefined && path !== placeholder) attachment.path = path
    attachment['uvs'] = roundArray(uvs.map(v => Math.min(1, Math.max(0, v))))
    // Flipping Y reverses the winding: keep triangles counter clockwise.
    const flipped: number[] = []
    for (let i = 0; i + 2 < triangles.length; i += 3) {
      flipped.push(triangles[i]!, triangles[i + 2]!, triangles[i + 1]!)
    }
    attachment['triangles'] = flipped

    const edges = intArray(display['edges']).concat(intArray(display['userEdges']))
    if (edges.length > 0) attachment['edges'] = edges

    const size = this.regionSizes.get(path ?? placeholder)
    if (size !== undefined) {
      attachment['width'] = size.width
      attachment['height'] = size.height
    }

    const weights = numArray(display['weights'])
    const key = `${skinName}/${slotName}/${placeholder}`
    if (weights.length === 0) {
      const [px, py, rotation, scaleX, scaleY] = transform
      const cos = Math.cos(rotation * DEG)
      const sin = Math.sin(rotation * DEG)
      const out: number[] = []
      for (let i = 0; i + 1 < vertices.length; i += 2) {
        const vx = vertices[i]! * scaleX
        const vy = -vertices[i + 1]! * scaleY
        out.push(round6(px + cos * vx - sin * vy), round6(py + sin * vx + cos * vy))
      }
      attachment['vertices'] = out
      this.meshShapes.set(key, { weighted: false, vertexCount: out.length / 2, influence: [], counts: [] })
      return attachment
    }

    const slotPoseRaw = numArray(display['slotPose'])
    const bonePoseRaw = numArray(display['bonePose'])
    const slotPose: Matrix =
      slotPoseRaw.length >= 6
        ? [slotPoseRaw[0]!, slotPoseRaw[1]!, slotPoseRaw[2]!, slotPoseRaw[3]!, slotPoseRaw[4]!, slotPoseRaw[5]!]
        : [1, 0, 0, 1, 0, 0]
    const poseBones: number[] = []
    const poseMatrices: Matrix[] = []
    for (let i = 0; i + 6 < bonePoseRaw.length + 1 && i + 7 <= bonePoseRaw.length; i += 7) {
      poseBones.push(Math.round(bonePoseRaw[i]!))
      poseMatrices.push([
        bonePoseRaw[i + 1]!,
        bonePoseRaw[i + 2]!,
        bonePoseRaw[i + 3]!,
        bonePoseRaw[i + 4]!,
        bonePoseRaw[i + 5]!,
        bonePoseRaw[i + 6]!,
      ])
    }
    if (poseMatrices.length === 0) {
      this.avisos.add(`Mesh "${placeholder}" tem pesos mas não tem "bonePose". Pesos descartados.`)
      attachment['vertices'] = roundArray(vertices.map((v, i) => (i % 2 === 1 ? -v : v)))
      return attachment
    }

    const counts: number[] = []
    const bones: number[] = []
    const positions: number[] = []
    const weightValues: number[] = []
    const influence: Matrix[] = []
    let w = 0
    let vertexIndex = 0
    while (w < weights.length) {
      const n = Math.round(weights[w++] ?? 0)
      if (n <= 0 || w + n * 2 > weights.length) {
        this.avisos.add(`Mesh "${placeholder}" com lista de pesos malformada. Pesos descartados.`)
        return attachment
      }
      const vx = vertices[vertexIndex * 2] ?? 0
      const vy = vertices[vertexIndex * 2 + 1] ?? 0
      const [ax, ay] = matrixApply(slotPose, vx, vy)
      counts.push(n)
      for (let k = 0; k < n; k++) {
        const poseIndex = Math.round(weights[w++] ?? 0)
        const weight = weights[w++] ?? 0
        const pose = poseMatrices[poseIndex] ?? ([1, 0, 0, 1, 0, 0] as Matrix)
        const inverse = matrixInvert(pose)
        const [bx, by] = matrixApply(inverse, ax, ay)
        bones.push(Math.max(0, poseBones[poseIndex] ?? 0))
        positions.push(round6(bx), round6(-by))
        weightValues.push(round6(Math.min(1, Math.max(0, weight))))
        influence.push(matrixMultiply(inverse, slotPose))
      }
      vertexIndex++
    }
    attachment['binding'] = { counts, bones, positions, weights: weightValues }
    this.meshShapes.set(key, { weighted: true, vertexCount: counts.length, influence, counts })
    return attachment
  }

  // ---------------------------------------------------------------- ik / path

  private readIk(armature: JsonObject): void {
    for (const raw of objectList(armature['ik'])) {
      const name = str(raw['name'])
      const boneName = str(raw['bone'])
      if (name.length === 0 || !this.boneIndex.has(boneName)) {
        if (name.length > 0) this.avisos.add(`IK "${name}" aponta para o osso "${boneName}", que não existe. Descartada.`)
        continue
      }
      const chain = Math.round(num(raw['chain']))
      const bones: string[] = [boneName]
      if (chain >= 1) {
        const parent = this.bones[this.boneIndex.get(boneName)!]?.parent
        if (parent !== undefined) bones.unshift(parent)
        else this.avisos.add(`IK "${name}" pede cadeia de 2 ossos, mas "${boneName}" não tem pai. Virou IK de 1 osso.`)
      }
      if (chain > 1) {
        this.avisos.add(`IK "${name}" tem cadeia de ${chain + 1} ossos. O formato aceita 2; foi cortada.`)
      }
      const c: Constraint = { type: 'ik', name, bones: bones.slice(-2), target: str(raw['target']) }
      // DragonBones is Y down, so the bend side is inverted.
      if (bool(raw['bendPositive'], true)) c['bendPositive'] = false
      c.mix = round6(Math.min(1, Math.max(0, num(raw['weight'], 1))))
      this.constraints.push(c)
    }
  }

  private readPath(armature: JsonObject): void {
    for (const raw of objectList(armature['path'])) {
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
      if (num(raw['rotateOffset']) !== 0) c['offsetRotation'] = round6(-num(raw['rotateOffset']))
      if (num(raw['position']) !== 0) c['position'] = round6(num(raw['position']))
      if (num(raw['spacing']) !== 0) c['spacing'] = round6(num(raw['spacing']))
      const rotateMix = num(raw['rotateMix'], 1)
      const translateMix = num(raw['translateMix'], 1)
      if (rotateMix !== 1) c['mixRotation'] = round6(Math.min(1, Math.max(0, rotateMix)))
      if (translateMix !== 1) {
        c['mixX'] = round6(Math.min(1, Math.max(0, translateMix)))
        c['mixY'] = c['mixX']
      }
      this.constraints.push(c)
    }
  }

  // -------------------------------------------------------------- animations

  /** Frame start times in seconds. The last entry closes the list. */
  private frameTimes(frames: JsonObject[]): number[] {
    const times: number[] = []
    let acc = 0
    for (const f of frames) {
      times.push(round6(acc / this.frameRate))
      acc += num(f['duration'], 0)
    }
    return times
  }

  private curveFor(frame: JsonObject, t0: number, v0: number, t1: number, v1: number): Curve {
    const curve = numArray(frame['curve'])
    if (curve.length >= 4) {
      if (curve.length > 4) {
        this.avisos.add(
          'Uma curva do DragonBones tem mais de 4 números (vários trechos). Só o primeiro trecho foi usado; o meio da curva pode ficar diferente.',
        )
      }
      return normalizedCurveToAbsolute(curve.slice(0, 4), t0, v0, t1, v1)
    }
    const raw = frame['tweenEasing']
    if (raw === undefined || raw === null || typeof raw !== 'number' || !Number.isFinite(raw)) return 'stepped'
    if (raw === 0) return 'linear'
    let g: (p: number) => number
    let amount: number
    if (raw < 0) {
      g = p => p * p
      amount = -raw
    } else if (raw <= 1) {
      g = p => 1 - (1 - p) * (1 - p)
      amount = raw
    } else {
      g = p => 0.5 * (1 - Math.cos(p * Math.PI))
      amount = raw - 1
    }
    const [y1, y2] = fitEasing(p => (g(p) - p) * amount + p)
    return normalizedCurveToAbsolute([1 / 3, y1, 2 / 3, y2], t0, v0, t1, v1)
  }

  private numberKeys(frames: JsonObject[], read: (f: JsonObject) => number): Key[] {
    const times = this.frameTimes(frames)
    const keys: Key[] = frames.map((f, i) => ({ time: times[i]!, value: round6(read(f)) }))
    for (let i = 0; i < frames.length - 1; i++) {
      const c = this.curveFor(frames[i]!, keys[i]!.time, num(keys[i]!.value), keys[i + 1]!.time, num(keys[i + 1]!.value))
      if (c !== 'linear') keys[i]!.curve = c
    }
    return tidyKeys(keys)
  }

  private addTimeline(timelines: Timeline[], timeline: Timeline, setupValue: unknown): void {
    if (timeline.keys.length === 0) return
    timeline.keys = ensureKeyAtZero(timeline.keys, setupValue)
    timelines.push(timeline)
  }

  private boneSetup(name: string, property: string): number {
    const bone = this.bones[this.boneIndex.get(name) ?? -1]
    if (bone === undefined) return property.startsWith('scale') ? 1 : 0
    switch (property) {
      case 'x': return num(bone.x)
      case 'y': return num(bone.y)
      case 'rotation': return num(bone.rotation)
      case 'scaleX': return num(bone.scaleX, 1)
      case 'scaleY': return num(bone.scaleY, 1)
      default: return 0
    }
  }

  private readAnimations(armature: JsonObject): void {
    for (const raw of objectList(armature['animation'])) {
      const name = str(raw['name'], 'animacao')
      const timelines: Timeline[] = []
      const animation: Animation = { name, timelines }
      const duration = num(raw['duration'])
      if (duration > 0) animation.duration = round6(duration / this.frameRate)
      const playTimes = num(raw['playTimes'], 1)
      if (playTimes === 0) {
        animation.loop = true
      } else if (playTimes > 1) {
        animation.loop = true
        animation.extras = { dragonbones: { playTimes } }
      }
      const fadeIn = num(raw['fadeInTime'], -1)
      if (fadeIn >= 0) animation.defaultMix = round6(fadeIn)
      if (typeof raw['scale'] === 'number' && raw['scale'] !== 1) {
        animation.extras = { ...(animation.extras ?? {}), dragonbones: { ...((animation.extras?.['dragonbones'] as JsonObject | undefined) ?? {}), scale: raw['scale'] } }
      }

      this.readAnimationBones(raw, timelines, name)
      this.readAnimationSlots(raw, timelines, name)
      this.readAnimationFfd(raw, timelines)
      this.readAnimationIk(raw, timelines, name)
      this.readAnimationZOrder(raw, timelines)
      this.readAnimationFrames(raw, timelines)
      this.animations.push(animation)
    }
  }

  private readAnimationBones(animation: JsonObject, timelines: Timeline[], animationName: string): void {
    for (const raw of objectList(animation['bone'])) {
      const boneName = str(raw['name'])
      if (!this.boneIndex.has(boneName)) {
        this.avisos.add(`Animação "${animationName}" mexe no osso "${boneName}", que não existe. Timeline descartada.`)
        continue
      }
      const translate = objectList(raw['translateFrame'])
      if (translate.length > 0) {
        this.addTimeline(
          timelines,
          { type: 'bone', target: boneName, property: 'x', keys: this.numberKeys(translate, f => num(f['x'])) },
          this.boneSetup(boneName, 'x'),
        )
        this.addTimeline(
          timelines,
          { type: 'bone', target: boneName, property: 'y', keys: this.numberKeys(translate, f => -num(f['y'])) },
          this.boneSetup(boneName, 'y'),
        )
      }
      const rotate = objectList(raw['rotateFrame'])
      if (rotate.length > 0) {
        // "clockwise" says how many extra full turns the tween takes.
        let extra = 0
        const values: number[] = []
        rotate.forEach((f, i) => {
          values.push(-(num(f['rotate']) + extra))
          const clockwise = Math.round(num(f['clockwise']))
          if (clockwise !== 0 && i < rotate.length - 1) extra += 360 * clockwise
        })
        let cursor = 0
        this.addTimeline(
          timelines,
          { type: 'bone', target: boneName, property: 'rotation', keys: this.numberKeys(rotate, () => values[cursor++] ?? 0) },
          this.boneSetup(boneName, 'rotation'),
        )
        if (rotate.some(f => num(f['skew']) !== 0)) {
          this.avisos.add(`Osso "${boneName}" tem chaves de "skew" na animação "${animationName}". O formato usa shear no setup; as chaves foram descartadas.`)
        }
      }
      const scale = objectList(raw['scaleFrame'])
      if (scale.length > 0) {
        this.addTimeline(
          timelines,
          { type: 'bone', target: boneName, property: 'scaleX', keys: this.numberKeys(scale, f => num(f['x'], 1)) },
          this.boneSetup(boneName, 'scaleX'),
        )
        this.addTimeline(
          timelines,
          { type: 'bone', target: boneName, property: 'scaleY', keys: this.numberKeys(scale, f => num(f['y'], 1)) },
          this.boneSetup(boneName, 'scaleY'),
        )
      }
      const legacy = objectList(raw['frame'])
      if (legacy.length > 0 && translate.length === 0 && rotate.length === 0 && scale.length === 0) {
        const read = (field: string, sign: number, def = 0) => (f: JsonObject) => {
          const t = isObject(f['transform']) ? f['transform'] : {}
          return sign * num(t[field], def)
        }
        this.addTimeline(timelines, { type: 'bone', target: boneName, property: 'x', keys: this.numberKeys(legacy, read('x', 1)) }, this.boneSetup(boneName, 'x'))
        this.addTimeline(timelines, { type: 'bone', target: boneName, property: 'y', keys: this.numberKeys(legacy, read('y', -1)) }, this.boneSetup(boneName, 'y'))
        this.addTimeline(timelines, { type: 'bone', target: boneName, property: 'rotation', keys: this.numberKeys(legacy, read('skX', -1)) }, this.boneSetup(boneName, 'rotation'))
        this.addTimeline(timelines, { type: 'bone', target: boneName, property: 'scaleX', keys: this.numberKeys(legacy, read('scX', 1, 1)) }, this.boneSetup(boneName, 'scaleX'))
        this.addTimeline(timelines, { type: 'bone', target: boneName, property: 'scaleY', keys: this.numberKeys(legacy, read('scY', 1, 1)) }, this.boneSetup(boneName, 'scaleY'))
      }
    }
  }

  private readAnimationSlots(animation: JsonObject, timelines: Timeline[], animationName: string): void {
    for (const raw of objectList(animation['slot'])) {
      const slotName = str(raw['name'])
      const setup = this.slotSetup.get(slotName)
      if (setup === undefined) {
        this.avisos.add(`Animação "${animationName}" mexe no slot "${slotName}", que não existe. Timeline descartada.`)
        continue
      }
      const names = this.slotDisplays.get(slotName) ?? []
      const displayFrames = objectList(raw['displayFrame'])
      const legacy = objectList(raw['frame'])
      const displaySource = displayFrames.length > 0 ? displayFrames : legacy
      if (displaySource.length > 0 && displaySource.some(f => f['value'] !== undefined || f['displayIndex'] !== undefined)) {
        const times = this.frameTimes(displaySource)
        const keys: Key[] = displaySource.map((f, i) => {
          const index = Math.round(num(f['value'] ?? f['displayIndex']))
          return {
            time: times[i]!,
            value: index >= 0 && index < names.length ? names[index]! : null,
            curve: 'stepped' as Curve,
          }
        })
        this.addTimeline(
          timelines,
          { type: 'slot', target: slotName, property: 'attachment', keys: tidyKeys(keys) },
          setup.attachment ?? null,
        )
      }
      const colorFrames = objectList(raw['colorFrame'])
      const colorSource = colorFrames.length > 0 ? colorFrames : legacy.filter(f => f['color'] !== undefined)
      if (colorSource.length > 0) {
        const setupColor = setup.color ?? [1, 1, 1, 1]
        const times = this.frameTimes(colorSource)
        const readChannel = (f: JsonObject, key: string): number => {
          const value = isObject(f['value']) ? f['value'] : isObject(f['color']) ? f['color'] : {}
          return Math.min(1, Math.max(0, num(value[key], 100) / 100))
        }
        const keys: Key[] = colorSource.map((f, i) => ({
          time: times[i]!,
          value: [
            round6(readChannel(f, 'rM')),
            round6(readChannel(f, 'gM')),
            round6(readChannel(f, 'bM')),
            round6(readChannel(f, 'aM')),
          ],
        }))
        for (let i = 0; i < colorSource.length - 1; i++) {
          const curve: number[] = []
          const v0 = keys[i]!.value as number[]
          const v1 = keys[i + 1]!.value as number[]
          let stepped = false
          for (let c = 0; c < 4; c++) {
            const part = this.curveFor(colorSource[i]!, keys[i]!.time, v0[c]!, keys[i + 1]!.time, v1[c]!)
            if (part === 'stepped') {
              stepped = true
              break
            }
            if (part === 'linear') {
              const t0 = keys[i]!.time
              const t1 = keys[i + 1]!.time
              curve.push(round6(t0 + (t1 - t0) / 3), round6(v0[c]! + (v1[c]! - v0[c]!) / 3), round6(t0 + (2 * (t1 - t0)) / 3), round6(v0[c]! + (2 * (v1[c]! - v0[c]!)) / 3))
            } else {
              curve.push(...part)
            }
          }
          if (stepped) keys[i]!.curve = 'stepped'
          else if (curve.length === 16) keys[i]!.curve = curve
        }
        this.addTimeline(
          timelines,
          { type: 'slot', target: slotName, property: 'color', keys: tidyKeys(keys) },
          setupColor,
        )
      }
    }
  }

  private readAnimationFfd(animation: JsonObject, timelines: Timeline[]): void {
    for (const raw of objectList(animation['ffd'])) {
      const skinName = str(raw['skin']) || 'default'
      const slotName = str(raw['slot'])
      const attachmentName = str(raw['name'])
      const frames = objectList(raw['frame'])
      if (frames.length === 0 || slotName.length === 0 || attachmentName.length === 0) continue
      const shape = this.meshShapes.get(`${skinName}/${slotName}/${attachmentName}`)
      if (shape === undefined) {
        this.avisos.add(`A deformação (ffd) aponta para a mesh "${attachmentName}" do slot "${slotName}", que não foi encontrada. Descartada.`)
        continue
      }
      const times = this.frameTimes(frames)
      const keys: Key[] = frames.map((f, i) => ({
        time: times[i]!,
        value: this.convertFfdFrame(f, shape),
      }))
      for (let i = 0; i < frames.length - 1; i++) {
        const c = this.curveFor(frames[i]!, keys[i]!.time, 0, keys[i + 1]!.time, 1)
        if (c !== 'linear') keys[i]!.curve = c
      }
      const timeline: Timeline = { type: 'deform', target: slotName, attachment: attachmentName, keys: tidyKeys(keys) }
      if (skinName !== 'default') timeline.skin = skinName
      this.addTimeline(timelines, timeline, [])
    }
  }

  /** Expands one ffd frame into a full deform array in the .bone layout. */
  private convertFfdFrame(frame: JsonObject, shape: MeshShape): number[] {
    const raw = numArray(frame['vertices'])
    const offset = Math.round(num(frame['offset']))
    const deltas: number[] = new Array<number>(shape.vertexCount * 2).fill(0)
    for (let i = 0; i < raw.length; i++) {
      const index = offset + i
      if (index >= 0 && index < deltas.length) deltas[index] = raw[i]!
    }
    if (!shape.weighted) {
      return deltas.map((v, i) => round6(i % 2 === 1 ? -v : v))
    }
    const out: number[] = []
    let influenceIndex = 0
    for (let v = 0; v < shape.counts.length; v++) {
      const dx = deltas[v * 2] ?? 0
      const dy = deltas[v * 2 + 1] ?? 0
      const count = shape.counts[v] ?? 0
      for (let k = 0; k < count; k++) {
        const m = shape.influence[influenceIndex++] ?? ([1, 0, 0, 1, 0, 0] as Matrix)
        const [tx, ty] = matrixApplyVector(m, dx, dy)
        out.push(round6(tx), round6(-ty))
      }
    }
    return out
  }

  private readAnimationIk(animation: JsonObject, timelines: Timeline[], animationName: string): void {
    for (const raw of objectList(animation['ik'])) {
      const name = str(raw['name'])
      const frames = objectList(raw['frame'])
      if (frames.length === 0) continue
      const constraint = this.constraints.find(c => c.name === name)
      if (constraint === undefined) {
        this.avisos.add(`Animação "${animationName}" mexe na IK "${name}", que não existe. Timeline descartada.`)
        continue
      }
      if (frames.some(f => typeof f['weight'] === 'number')) {
        this.addTimeline(
          timelines,
          { type: 'constraint', target: name, property: 'mix', keys: this.numberKeys(frames, f => Math.min(1, Math.max(0, num(f['weight'], 1)))) },
          num(constraint.mix, 1),
        )
      }
      if (frames.some(f => typeof f['bendPositive'] === 'boolean')) {
        const times = this.frameTimes(frames)
        const keys: Key[] = frames.map((f, i) => ({
          time: times[i]!,
          value: !bool(f['bendPositive'], true),
          curve: 'stepped' as Curve,
        }))
        this.addTimeline(
          timelines,
          { type: 'constraint', target: name, property: 'bendPositive', keys: tidyKeys(keys) },
          constraint['bendPositive'] !== false,
        )
      }
    }
  }

  private readAnimationZOrder(animation: JsonObject, timelines: Timeline[]): void {
    const container = animation['zOrder']
    const frames = isObject(container) ? objectList(container['frame']) : objectList(container)
    if (frames.length === 0) return
    const times = this.frameTimes(frames)
    const keys: Key[] = frames.map((f, i) => {
      const pairs = intArray(f['zOrder'])
      const offsets: DrawOrderOffset[] = []
      for (let k = 0; k + 1 < pairs.length; k += 2) {
        const slot = this.slotOrder[pairs[k]!]
        if (slot === undefined) continue
        offsets.push({ slot, offset: pairs[k + 1]! })
      }
      return { time: times[i]!, value: offsets, curve: 'stepped' as Curve }
    })
    this.addTimeline(timelines, { type: 'drawOrder', keys: tidyKeys(keys) }, [])
  }

  private readAnimationFrames(animation: JsonObject, timelines: Timeline[]): void {
    const frames = objectList(animation['frame'])
    if (frames.length === 0) return
    const times = this.frameTimes(frames)
    const keys: Key[] = []
    frames.forEach((f, i) => {
      const entries = objectList(f['events']).concat(objectList(f['actions'])).concat(objectList(f['sound']))
      if (typeof f['sound'] === 'string') entries.push({ name: f['sound'], sound: f['sound'] })
      if (typeof f['action'] === 'string') entries.push({ name: f['action'] })
      for (const entry of entries) {
        const name = str(entry['name'] ?? entry['gotoAndPlay'])
        if (name.length === 0) continue
        let def = this.events.find(e => e.name === name)
        if (def === undefined) {
          def = { name }
          const audio = sanitizeUri(entry['sound'])
          if (audio !== undefined) def.audio = audio
          this.events.push(def)
        }
        const key: Key = { time: times[i]!, event: name }
        const ints = intArray(entry['ints'])
        const floats = numArray(entry['floats'])
        const strings = Array.isArray(entry['strings']) ? entry['strings'].map(s => str(s)) : []
        if (ints.length > 0) key.int = ints[0]!
        if (floats.length > 0) key.float = round6(floats[0]!)
        if (strings.length > 0) key.string = strings[0]!
        if (ints.length > 1 || floats.length > 1 || strings.length > 1) {
          this.avisos.add(
            `O evento "${name}" leva mais de um número ou texto. O formato guarda um de cada; os outros foram descartados.`,
          )
        }
        keys.push(key)
      }
    })
    if (keys.length === 0) return
    keys.sort((a, b) => a.time - b.time)
    timelines.push({ type: 'event', keys })
  }
}

export interface DragonBonesOptions {
  /** Armature to convert, by name. Default: the first one in the file. */
  parte?: string
}

export function importDragonBones(
  json: unknown, atlasJson?: unknown, opcoes: DragonBonesOptions = {},
): ImportResult {
  if (!isObject(json)) throw new Error('O arquivo do DragonBones não é um objeto JSON.')
  return new DragonBonesImporter(json, opcoes.parte).run(atlasJson)
}

/** Names of every armature in the file, so a caller can offer the list. */
export function dragonBonesParts(json: unknown): string[] {
  if (!isObject(json)) return []
  return objectList(json['armature']).map(a => str(a['name']))
}
