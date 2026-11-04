// SPDX-License-Identifier: Apache-2.0
// Spriter SCML (XML) and SCON (JSON) -> .bone (spec section 13.3).
// Spriter already uses Y up and counter-clockwise degrees; time is in
// milliseconds. There is no mesh and no saved IK in the source file.

import type {
  Animation,
  Attachment,
  Bone,
  BoneFile,
  Curve,
  DrawOrderOffset,
  EventDef,
  ImportResult,
  JsonObject,
  Key,
  Skin,
  Slot,
  Timeline,
  Variable,
} from './comum.ts'
import {
  Warnings,
  drawOrderOffsets,
  ensureKeyAtZero,
  fitEasing,
  isObject,
  makeHeader,
  normalizedCurveToAbsolute,
  num,
  round6,
  sanitizePath,
  sanitizeUri,
  str,
  tidyKeys,
} from './comum.ts'

// ------------------------------------------------------------ minimal XML

interface XmlNode {
  name: string
  attrs: Record<string, string>
  children: XmlNode[]
}

const XML_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

function decodeEntities(text: string): string {
  return text.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (whole, body: string) => {
    if (body.startsWith('#x') || body.startsWith('#X')) {
      const code = Number.parseInt(body.slice(2), 16)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    if (body.startsWith('#')) {
      const code = Number.parseInt(body.slice(1), 10)
      return Number.isFinite(code) ? String.fromCodePoint(code) : whole
    }
    return XML_ENTITIES[body] ?? whole
  })
}

/** Very small XML reader: elements and attributes only, no DTD, no namespaces. */
export function parseXml(text: string): XmlNode {
  let i = 0
  const stack: XmlNode[] = []
  let root: XmlNode | null = null

  const skipTo = (marker: string): void => {
    const at = text.indexOf(marker, i)
    i = at < 0 ? text.length : at + marker.length
  }

  while (i < text.length) {
    const open = text.indexOf('<', i)
    if (open < 0) break
    i = open
    if (text.startsWith('<!--', i)) {
      skipTo('-->')
      continue
    }
    if (text.startsWith('<![CDATA[', i)) {
      skipTo(']]>')
      continue
    }
    if (text.startsWith('<?', i)) {
      skipTo('?>')
      continue
    }
    if (text.startsWith('<!', i)) {
      skipTo('>')
      continue
    }
    const close = text.indexOf('>', i)
    if (close < 0) break
    const inner = text.slice(i + 1, close)
    i = close + 1

    if (inner.startsWith('/')) {
      stack.pop()
      continue
    }
    const selfClosing = inner.endsWith('/')
    const body = selfClosing ? inner.slice(0, -1) : inner
    const nameMatch = /^\s*([^\s/>]+)/.exec(body)
    if (nameMatch === null) continue
    const name = nameMatch[1]!
    const node: XmlNode = { name, attrs: {}, children: [] }

    const attrRe = /([^\s=/]+)\s*=\s*("([^"]*)"|'([^']*)')/g
    attrRe.lastIndex = nameMatch[0].length
    let m: RegExpExecArray | null
    while ((m = attrRe.exec(body)) !== null) {
      node.attrs[m[1]!] = decodeEntities(m[3] ?? m[4] ?? '')
    }

    const parent = stack[stack.length - 1]
    if (parent === undefined) {
      if (root === null) root = node
    } else {
      parent.children.push(node)
    }
    if (!selfClosing) stack.push(node)
  }

  if (root === null) throw new Error('O arquivo SCML não tem nenhum elemento XML.')
  return root
}

/** Tags that appear at most once inside their parent. */
const SINGLETON_TAGS = new Set(['mainline', 'meta', 'bone', 'object', 'var_defs', 'tag_list', 'obj_info_def'])

/** Turns the XML tree into the same shape SCON already has. */
export function xmlToScon(node: XmlNode): JsonObject {
  const out: JsonObject = { ...node.attrs }
  const groups = new Map<string, JsonObject[]>()
  for (const child of node.children) {
    const list = groups.get(child.name) ?? []
    list.push(xmlToScon(child))
    groups.set(child.name, list)
  }
  for (const [name, list] of groups) {
    out[name] = SINGLETON_TAGS.has(name) && list.length === 1 ? list[0]! : list
  }
  return out
}

// -------------------------------------------------------------- accessors

/**
 * **As timelines casadas pelo NOME** — rodada 45, lote 5 (doc `57`; doc `72`, a).
 *
 * No Spriter o `id` de uma timeline vale dentro da animação: o `bcp.scml` do
 * Humberto tem 13 animações, e 34 dos 35 números apontam peças diferentes em
 * animações diferentes (na primeira o 0 é "Agrupar 79 copiar"; nas outras 12,
 * "01 (12)"). O importador casava pelo número, e as chaves de uma peça caíam em
 * outra: o boneco abria espalhado. A forma do erro: *casei pelo número o que o
 * Spriter casa pelo nome*.
 *
 * Aqui cada nome (com o tipo) ganha um número só para o arquivo inteiro, e as
 * referências da mainline de cada animação seguem. Quem já era coerente fica
 * com os números que tinha: o primeiro dono de um número o mantém.
 */
export function normalizarTimelines(entity: JsonObject): JsonObject {
  const numeroDe = new Map<string, number>()
  const tomados = new Set<number>()
  let proximo = 0
  const livre = (): number => {
    while (tomados.has(proximo)) proximo++
    return proximo
  }
  const animations = list(entity['animation']).map((animation) => {
    const mapa = new Map<number, number>()
    const timelines = list(animation['timeline']).map((tl, i) => {
      const antigo = has(tl, 'id') ? Math.round(numOf(tl, 'id')) : i
      const chave = `${strOf(tl, 'name')}|${strOf(tl, 'object_type', 'sprite').toLowerCase()}`
      let novo = numeroDe.get(chave)
      if (novo === undefined) {
        novo = tomados.has(antigo) ? livre() : antigo
        numeroDe.set(chave, novo)
        tomados.add(novo)
      }
      mapa.set(antigo, novo)
      return { ...tl, id: novo }
    })
    const refs = (value: unknown): JsonObject[] => list(value).map((ref) => {
      const alvo = Math.round(numOf(ref, 'timeline'))
      return { ...ref, timeline: mapa.get(alvo) ?? alvo }
    })
    const mainline = animation['mainline']
    const keys = list(isObject(mainline) ? mainline['key'] : mainline).map((key) => ({
      ...key, bone_ref: refs(key['bone_ref']), object_ref: refs(key['object_ref']),
    }))
    return { ...animation, timeline: timelines, mainline: isObject(mainline) ? { ...mainline, key: keys } : keys }
  })
  return { ...entity, animation: animations }
}

function list(value: unknown): JsonObject[] {
  if (Array.isArray(value)) return value.filter(isObject)
  if (isObject(value)) return [value]
  return []
}

function numOf(o: JsonObject | undefined, key: string, fallback = 0): number {
  if (o === undefined) return fallback
  const v = o[key]
  if (typeof v === 'number' && Number.isFinite(v)) return v
  if (typeof v === 'string') {
    const n = Number.parseFloat(v)
    if (Number.isFinite(n)) return n
  }
  return fallback
}

function strOf(o: JsonObject | undefined, key: string, fallback = ''): string {
  if (o === undefined) return fallback
  const v = o[key]
  if (typeof v === 'string') return v
  if (typeof v === 'number') return String(v)
  return fallback
}

function boolOf(o: JsonObject | undefined, key: string, fallback: boolean): boolean {
  if (o === undefined) return fallback
  const v = o[key]
  if (typeof v === 'boolean') return v
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase()
    if (t === 'true' || t === '1') return true
    if (t === 'false' || t === '0') return false
  }
  if (typeof v === 'number') return v !== 0
  return fallback
}

function has(o: JsonObject | undefined, key: string): boolean {
  return o !== undefined && o[key] !== undefined && o[key] !== null && o[key] !== ''
}

// ------------------------------------------------------------------ types

interface FileInfo {
  name: string
  path: string | undefined
  width: number
  height: number
  pivotX: number
  pivotY: number
}

interface SpriteInfo {
  slot: string
  bone: string
  attachments: Map<string, string>
}

const CURVE_WARNED = 'Curva "quartic"/"quintic" do Spriter aproximada por uma Bézier cúbica. Erro pequeno entre as chaves.'

class SpriterImporter {
  readonly avisos = new Warnings()
  private readonly bones: Bone[] = []
  private readonly slots: Slot[] = []
  private readonly skins: Skin[] = []
  private readonly events: EventDef[] = []
  private readonly variables: Variable[] = []
  private readonly animations: Animation[] = []
  private readonly boneNames = new Set<string>()
  private readonly files = new Map<string, FileInfo>()
  private readonly objInfo = new Map<string, JsonObject>()
  /** timeline index -> bone name, for bone timelines. */
  private readonly boneOfTimeline = new Map<number, string>()
  /** timeline index -> sprite data, for object timelines. */
  private readonly spriteOfTimeline = new Map<number, SpriteInfo>()
  private readonly defaultAttachments: Record<string, Record<string, Attachment | null>> = {}
  private version = ''

  private readonly root: JsonObject

  /** Name of the entity to convert. Undefined means the first one. */
  private readonly wanted: string | undefined

  /** `true` = keep one parent per bone and warn (the pre-9.4 behaviour). */
  private readonly assar: boolean

  constructor(root: JsonObject, wanted?: string, assar = false) {
    this.root = root
    this.wanted = wanted
    this.assar = assar
  }

  run(): ImportResult {
    this.version = strOf(this.root, 'scml_version', strOf(this.root, 'generator_version', 'desconhecida'))
    const generator = strOf(this.root, 'generator', 'Spriter')

    this.readFiles()
    const entities = list(this.root['entity'])
    if (entities.length === 0) throw new Error('O arquivo do Spriter não tem nenhuma entity.')

    // Um arquivo do Spriter pode ter várias entities, e um .bone guarda um
    // esqueleto. Sem escolha, vai a primeira; `parte` escolhe outra pelo nome.
    let escolhida = 0
    if (this.wanted !== undefined) {
      escolhida = entities.findIndex(e => strOf(e, 'name') === this.wanted)
      if (escolhida < 0) {
        const nomes = entities.map(e => strOf(e, 'name')).join(', ')
        throw new Error(`O arquivo não tem a entity "${this.wanted}". Tem: ${nomes}.`)
      }
    }
    if (entities.length > 1) {
      const names = entities.filter((_, i) => i !== escolhida).map(e => strOf(e, 'name')).join(', ')
      this.avisos.add(`O arquivo tem ${entities.length} entities. Só "${strOf(entities[escolhida]!, 'name')}" virou este .bone. Para as outras (${names}), rode de novo com --parte <nome>.`)
    }
    // Rodada 45, lote 5: o número da timeline vale DENTRO de cada animação; entre
    // animações, o Spriter casa pelo nome. Renumera pelo nome antes de tudo.
    const entity = normalizarTimelines(entities[escolhida]!)

    for (const info of list(entity['obj_info'])) {
      this.objInfo.set(strOf(info, 'name'), info)
    }

    const file: BoneFile = { bone: makeHeader(`${generator} ${this.version}`), bones: this.bones }
    // O nome da entity vira o nome do esqueleto (4.1): sem ele o arquivo não
    // diz quem é, e um projeto com várias entities vira vários "sem nome".
    const nomeDaEntity = strOf(entity, 'name')
    if (nomeDaEntity.length > 0) file.skeleton = { name: nomeDaEntity }

    this.readVariables(entity)
    this.buildRig(entity)
    this.readCharacterMaps(entity)
    this.readAnimations(entity, file)

    if (this.bones.length === 0) {
      this.bones.push({ name: 'root' })
      this.boneNames.add('root')
    }
    if (this.slots.length > 0) file.slots = this.slots
    // Rodada 8d: o osso próprio de cada sprite leva a marca do editor; quem
    // usa uma extensão a declara (o validador cobra, EXT_REQUIRED_NOT_USED).
    if (this.bones.some(b => (b as { extensions?: Record<string, unknown> }).extensions?.['RECORTE_editor_state'] !== undefined)) {
      const comExt = file as { extensionsUsed?: string[] }
      const used = comExt.extensionsUsed ?? []
      if (!used.includes('RECORTE_editor_state')) comExt.extensionsUsed = [...used, 'RECORTE_editor_state']
    }
    if (this.skins.length > 0) file.skins = this.skins
    if (this.events.length > 0) file.events = this.events
    if (this.variables.length > 0) file.variables = this.variables
    if (this.animations.length > 0) file.animations = this.animations

    const tagList = this.root['tag_list'] ?? entity['tag_list']
    const tags = list(tagList).flatMap(t => list(t['i']).map(i => strOf(i, 'name'))).filter(t => t.length > 0)
    const flatTags = tags.length > 0 ? tags : list(tagList).map(t => strOf(t, 'name')).filter(t => t.length > 0)
    if (flatTags.length > 0) file.tags = flatTags

    this.avisos.add('O Spriter não guarda mesh, pesos nem IK no arquivo: nada disso foi convertido porque não existe na origem.')

    const avisos = this.avisos.list()
    file.extras = { import: { from: 'spriter', version: this.version, warnings: avisos } }
    return { file, avisos }
  }

  // ------------------------------------------------------------------ files

  private readFiles(): void {
    const folders = list(this.root['folder'])
    folders.forEach((folder, folderIndex) => {
      const folderId = has(folder, 'id') ? Math.round(numOf(folder, 'id')) : folderIndex
      list(folder['file']).forEach((f, fileIndex) => {
        const fileId = has(f, 'id') ? Math.round(numOf(f, 'id')) : fileIndex
        const name = strOf(f, 'name', `arquivo_${folderId}_${fileId}`)
        this.files.set(`${folderId}/${fileId}`, {
          name,
          path: sanitizePath(name.replace(/\.[^./]+$/, '')),
          width: numOf(f, 'width', 0),
          height: numOf(f, 'height', 0),
          pivotX: numOf(f, 'pivot_x', 0),
          pivotY: numOf(f, 'pivot_y', 1),
        })
      })
    })
  }

  private readVariables(entity: JsonObject): void {
    const defs = entity['var_defs']
    for (const v of list(isObject(defs) ? defs['i'] : defs)) {
      const name = strOf(v, 'name')
      if (name.length === 0) continue
      const rawType = strOf(v, 'type', 'float').toLowerCase()
      const type: Variable['type'] = rawType === 'int' ? 'int' : rawType === 'string' ? 'string' : rawType === 'bool' ? 'bool' : 'float'
      const variable: Variable = { name, type }
      if (has(v, 'default')) {
        variable.default =
          type === 'string' ? strOf(v, 'default') : type === 'bool' ? boolOf(v, 'default', false) : type === 'int' ? Math.round(numOf(v, 'default')) : round6(numOf(v, 'default'))
      }
      this.variables.push(variable)
    }
    for (const info of list(entity['obj_info'])) {
      const owner = strOf(info, 'name')
      const defs2 = info['var_defs']
      for (const v of list(isObject(defs2) ? defs2['i'] : defs2)) {
        const name = strOf(v, 'name')
        if (name.length === 0) continue
        const rawType = strOf(v, 'type', 'float').toLowerCase()
        const type: Variable['type'] = rawType === 'int' ? 'int' : rawType === 'string' ? 'string' : rawType === 'bool' ? 'bool' : 'float'
        this.variables.push({ name: `${owner}.${name}`, type })
      }
    }
  }

  // -------------------------------------------------------------------- rig

  private uniqueName(base: string, taken: Set<string>): string {
    let name = base.length > 0 ? base : 'item'
    let n = 2
    while (taken.has(name)) name = `${base}_${n++}`
    taken.add(name)
    return name
  }

  /** Learns the hierarchy from every mainline and creates bones and slots. */
  private buildRig(entity: JsonObject): void {
    const animations = list(entity['animation'])
    const timelinesByIndex = new Map<number, JsonObject>()
    const parentVotes = new Map<number, Map<number, number>>() // timeline -> parent timeline -> votes
    const parentChanges = new Set<number>()
    const zOrder = new Map<number, number>()

    for (const animation of animations) {
      const timelines = list(animation['timeline'])
      timelines.forEach((tl, i) => {
        const id = has(tl, 'id') ? Math.round(numOf(tl, 'id')) : i
        if (!timelinesByIndex.has(id)) timelinesByIndex.set(id, tl)
      })
      const mainline = animation['mainline']
      for (const key of list(isObject(mainline) ? mainline['key'] : mainline)) {
        const boneRefs = list(key['bone_ref'])
        const refById = new Map<number, number>()
        boneRefs.forEach((ref, i) => {
          const id = has(ref, 'id') ? Math.round(numOf(ref, 'id')) : i
          refById.set(id, Math.round(numOf(ref, 'timeline')))
        })
        const vote = (timeline: number, parentId: number): void => {
          const parentTimeline = parentId < 0 ? -1 : (refById.get(parentId) ?? -1)
          const votes = parentVotes.get(timeline) ?? new Map<number, number>()
          votes.set(parentTimeline, (votes.get(parentTimeline) ?? 0) + 1)
          parentVotes.set(timeline, votes)
          if (votes.size > 1) parentChanges.add(timeline)
        }
        for (const ref of boneRefs) {
          vote(Math.round(numOf(ref, 'timeline')), has(ref, 'parent') ? Math.round(numOf(ref, 'parent')) : -1)
        }
        for (const ref of list(key['object_ref'])) {
          const timeline = Math.round(numOf(ref, 'timeline'))
          vote(timeline, has(ref, 'parent') ? Math.round(numOf(ref, 'parent')) : -1)
          if (!zOrder.has(timeline)) zOrder.set(timeline, numOf(ref, 'z_index'))
        }
      }
    }

    const bestParent = (timeline: number): number => {
      const votes = parentVotes.get(timeline)
      if (votes === undefined) return -1
      let best = -1
      let bestCount = -1
      for (const [parent, count] of votes) {
        if (count > bestCount) {
          best = parent
          bestCount = count
        }
      }
      return best
    }

    const ids = Array.from(timelinesByIndex.keys()).sort((a, b) => a - b)
    const takenBones = new Set<string>()
    const takenSlots = new Set<string>()

    // Root bone: everything without a parent hangs here.
    const root: Bone = { name: this.uniqueName('root', takenBones) }
    this.bones.push(root)
    this.boneNames.add(root.name)

    const kindOf = (tl: JsonObject): string => {
      const declared = strOf(tl, 'object_type', '').toLowerCase()
      if (declared.length > 0) return declared
      const info = this.objInfo.get(strOf(tl, 'name'))
      return strOf(info, 'type', 'sprite').toLowerCase()
    }

    // Bones first, so sprites can hang on them.
    for (const id of ids) {
      const tl = timelinesByIndex.get(id)!
      if (kindOf(tl) !== 'bone') continue
      const name = this.uniqueName(strOf(tl, 'name', `osso_${id}`), takenBones)
      const bone: Bone = { name }
      const info = this.objInfo.get(strOf(tl, 'name'))
      const w = numOf(info, 'w', 0)
      if (w > 0) bone.length = round6(w)
      const h = numOf(info, 'h', 0)
      if (h > 0) bone.extras = { spriter: { h } }
      this.bones.push(bone)
      this.boneNames.add(name)
      this.boneOfTimeline.set(id, name)
    }
    for (const id of ids) {
      const boneName = this.boneOfTimeline.get(id)
      if (boneName === undefined) continue
      const parentTimeline = bestParent(id)
      const parentName = parentTimeline < 0 ? root.name : this.boneOfTimeline.get(parentTimeline)
      const bone = this.bones.find(b => b.name === boneName)!
      bone.parent = parentName ?? root.name
      if (parentChanges.has(id)) {
        this.avisos.add(this.assar
          ? `O osso "${boneName}" troca de pai no meio da animação. Com --assar o formato usa um pai só; foi mantido o mais usado.`
          : `O osso "${boneName}" troca de pai no meio da animação. O pai do arquivo é o mais usado; as outras chaves viram uma timeline "parent" (9.4).`)
      }
    }

    // Sprites, boxes and points: one auxiliary bone plus one slot each.
    const spriteIds = ids.filter(id => {
      const kind = kindOf(timelinesByIndex.get(id)!)
      return kind === 'sprite' || kind === 'box' || kind === 'point'
    })
    spriteIds.sort((a, b) => (zOrder.get(a) ?? 0) - (zOrder.get(b) ?? 0))

    for (const id of spriteIds) {
      const tl = timelinesByIndex.get(id)!
      const label = strOf(tl, 'name', `objeto_${id}`)
      const kind = kindOf(tl)
      const boneName = this.uniqueName(`${label}_osso`, takenBones)
      const parentTimeline = bestParent(id)
      const parentName = parentTimeline < 0 ? root.name : (this.boneOfTimeline.get(parentTimeline) ?? root.name)
      // Rodada 8d (04/10/2026): é o "osso próprio" do sprite no editor — a
      // imagem anda por ele, e a Árvore e a cena não o mostram como osso. A
      // marca é só do editor (`RECORTE_editor_state`); `visible: false` não
      // muda o desenho em nenhum leitor.
      this.bones.push({
        name: boneName, parent: parentName, visible: false,
        extensions: { RECORTE_editor_state: { ossoProprio: true } },
      } as Bone)
      this.boneNames.add(boneName)
      if (parentChanges.has(id)) {
        this.avisos.add(this.assar
          ? `O desenho "${label}" troca de osso no meio da animação. Com --assar o formato usa um osso só; foi mantido o mais usado.`
          : `O desenho "${label}" troca de osso no meio da animação. O osso do arquivo é o mais usado; as outras chaves viram uma timeline "slot/bone" (9.5), com o local do desenho no osso novo.`)
      }

      const slotName = this.uniqueName(label, takenSlots)
      const slot: Slot = { name: slotName, bone: boneName }
      const attachments: Record<string, Attachment | null> = {}
      const byFile = new Map<string, string>()

      if (kind === 'sprite') {
        for (const key of list(tl['key'])) {
          const object = isObject(key['object']) ? key['object'] : key
          const fileKey = `${Math.round(numOf(object, 'folder'))}/${Math.round(numOf(object, 'file'))}`
          const info = this.files.get(fileKey)
          if (info === undefined) continue
          if (byFile.has(fileKey)) continue
          const placeholder = info.name.replace(/\.[^./]+$/, '') || fileKey.replace('/', '_')
          let unique = placeholder
          let n = 2
          while (attachments[unique] !== undefined) unique = `${placeholder}_${n++}`
          const pivotX = has(object, 'pivot_x') ? numOf(object, 'pivot_x') : info.pivotX
          const pivotY = has(object, 'pivot_y') ? numOf(object, 'pivot_y') : info.pivotY
          const attachment: Attachment = { type: 'region' }
          if (info.path !== undefined && info.path !== unique) attachment.path = info.path
          const ax = round6((0.5 - pivotX) * info.width)
          const ay = round6((0.5 - pivotY) * info.height)
          if (ax !== 0) attachment['x'] = ax
          if (ay !== 0) attachment['y'] = ay
          if (info.width > 0) attachment['width'] = round6(info.width)
          if (info.height > 0) attachment['height'] = round6(info.height)
          attachments[unique] = attachment
          byFile.set(fileKey, unique)
        }
        const varying = list(tl['key']).some(key => {
          const object = isObject(key['object']) ? key['object'] : key
          return has(object, 'pivot_x') || has(object, 'pivot_y')
        })
        if (varying) {
          this.avisos.add(`O sprite "${label}" tem pivô por chave. Foi usado o pivô da primeira chave de cada imagem; o desenho pode deslizar entre chaves.`)
        }
      } else if (kind === 'box') {
        const info = this.objInfo.get(strOf(tl, 'name'))
        const w = numOf(info, 'w', 1)
        const h = numOf(info, 'h', 1)
        const pivotX = numOf(info, 'pivot_x', 0)
        const pivotY = numOf(info, 'pivot_y', 1)
        attachments[slotName] = {
          type: 'boundingbox',
          shape: 'rectangle',
          width: round6(Math.abs(w)),
          height: round6(Math.abs(h)),
          x: round6((0.5 - pivotX) * w),
          y: round6((0.5 - pivotY) * h),
        }
      } else {
        attachments[slotName] = { type: 'point' }
      }

      const first = Object.keys(attachments)[0]
      if (first !== undefined) slot.attachment = first
      this.slots.push(slot)
      if (Object.keys(attachments).length > 0) this.defaultAttachments[slotName] = attachments
      this.spriteOfTimeline.set(id, { slot: slotName, bone: boneName, attachments: byFile })
    }

    for (const id of ids) {
      const tl = timelinesByIndex.get(id)!
      const kind = kindOf(tl)
      if (kind === 'entity') {
        this.avisos.add(`O objeto "${strOf(tl, 'name')}" é uma sub-entidade. Converta essa entity à parte e ligue um attachment "skeleton" ao slot.`)
      }
    }

    if (Object.keys(this.defaultAttachments).length > 0) {
      this.skins.push({ name: 'default', attachments: this.defaultAttachments })
    } else {
      this.skins.push({ name: 'default' })
    }
  }

  private readCharacterMaps(entity: JsonObject): void {
    for (const map of list(entity['character_map'])) {
      const name = strOf(map, 'name', `mapa_${this.skins.length}`)
      const skin: Skin = { name }
      const attachments: Record<string, Record<string, Attachment | null>> = {}
      for (const entry of list(map['map'])) {
        const fromKey = `${Math.round(numOf(entry, 'folder'))}/${Math.round(numOf(entry, 'file'))}`
        const from = this.files.get(fromKey)
        if (from === undefined) continue
        const placeholder = from.name.replace(/\.[^./]+$/, '')
        const hasTarget = has(entry, 'target_folder') && has(entry, 'target_file')
        const target = hasTarget ? this.files.get(`${Math.round(numOf(entry, 'target_folder'))}/${Math.round(numOf(entry, 'target_file'))}`) : undefined
        for (const [slotName, bucket] of Object.entries(this.defaultAttachments)) {
          if (bucket[placeholder] === undefined) continue
          const slotBucket = attachments[slotName] ?? {}
          if (target === undefined) {
            slotBucket[placeholder] = null
          } else {
            const base = bucket[placeholder]
            const attachment: Attachment = { ...(base ?? { type: 'region' }) }
            if (target.path !== undefined) attachment.path = target.path
            if (target.width > 0) attachment['width'] = round6(target.width)
            if (target.height > 0) attachment['height'] = round6(target.height)
            slotBucket[placeholder] = attachment
          }
          attachments[slotName] = slotBucket
        }
      }
      if (Object.keys(attachments).length > 0) skin.attachments = attachments
      this.skins.push(skin)
    }
  }

  // -------------------------------------------------------------- animation

  private curveOf(key: JsonObject, t0: number, v0: number, t1: number, v1: number): Curve {
    const type = strOf(key, 'curve_type', 'linear').toLowerCase()
    const c1 = numOf(key, 'c1')
    const c2 = numOf(key, 'c2')
    const c3 = numOf(key, 'c3')
    const c4 = numOf(key, 'c4')
    switch (type) {
      case 'instant':
        return 'stepped'
      case 'linear':
      case '':
        return 'linear'
      case 'quadratic':
        return normalizedCurveToAbsolute([1 / 3, (2 * c1) / 3, 2 / 3, (2 * c1) / 3 + 1 / 3], t0, v0, t1, v1)
      case 'cubic':
        return normalizedCurveToAbsolute([1 / 3, c1, 2 / 3, c2], t0, v0, t1, v1)
      case 'quartic': {
        this.avisos.add(CURVE_WARNED)
        const ys = [0, c1, c2, c3, 1]
        const [y1, y2] = fitEasing(p => bezierAt(ys, p))
        return normalizedCurveToAbsolute([1 / 3, y1, 2 / 3, y2], t0, v0, t1, v1)
      }
      case 'quintic': {
        this.avisos.add(CURVE_WARNED)
        const ys = [0, c1, c2, c3, c4, 1]
        const [y1, y2] = fitEasing(p => bezierAt(ys, p))
        return normalizedCurveToAbsolute([1 / 3, y1, 2 / 3, y2], t0, v0, t1, v1)
      }
      case 'bezier':
        return normalizedCurveToAbsolute([c1, c2, c3, c4], t0, v0, t1, v1)
      default:
        this.avisos.add(`Curva "${type}" desconhecida no Spriter. Usando linear.`)
        return 'linear'
    }
  }

  private numberKeys(keys: JsonObject[], read: (k: JsonObject) => number): Key[] {
    const out: Key[] = keys.map(k => ({ time: round6(numOf(k, 'time') / 1000), value: round6(read(k)) }))
    for (let i = 0; i < keys.length - 1; i++) {
      const c = this.curveOf(keys[i]!, out[i]!.time, num(out[i]!.value), out[i + 1]!.time, num(out[i + 1]!.value))
      if (c !== 'linear') out[i]!.curve = c
    }
    return tidyKeys(out)
  }

  private addTimeline(timelines: Timeline[], timeline: Timeline, setupValue: unknown): void {
    if (timeline.keys.length === 0) return
    timeline.keys = ensureKeyAtZero(timeline.keys, setupValue)
    timelines.push(timeline)
  }

  private readAnimations(entity: JsonObject, file: BoneFile): void {
    const animations = list(entity['animation'])
    for (const raw of animations) {
      const name = strOf(raw, 'name', `animacao_${this.animations.length}`)
      const timelines: Timeline[] = []
      const animation: Animation = { name, timelines }
      const length = numOf(raw, 'length', 0)
      if (length > 0) animation.duration = round6(length / 1000)
      animation.loop = boolOf(raw, 'looping', true)
      const interval = numOf(raw, 'interval', 0)
      if (interval > 0 && file.skeleton?.fps === undefined) {
        file.skeleton = { ...file.skeleton, fps: round6(1000 / interval) }
      }

      const eventKeys: Key[] = []
      for (const [index, tl] of this.indexedTimelines(raw)) {
        const keys = list(tl['key'])
        if (keys.length === 0) continue
        const kind = strOf(tl, 'object_type', '').toLowerCase() || strOf(this.objInfo.get(strOf(tl, 'name')), 'type', 'sprite').toLowerCase()
        const boneName = this.boneOfTimeline.get(index)
        const sprite = this.spriteOfTimeline.get(index)
        if (boneName !== undefined) {
          this.transformTimelines(timelines, boneName, keys, 'bone')
        } else if (sprite !== undefined) {
          this.transformTimelines(timelines, sprite.bone, keys, 'object')
          if (kind === 'sprite') this.spriteTimelines(timelines, sprite, keys)
        } else if (kind === 'sound') {
          this.collectSoundKeys(keys, eventKeys)
        }
      }

      // Rodada 45, lote 5 (doc 72, a): no Spriter a peça que a animação não usa
      // NÃO aparece nela. Sem esta chave, ela ficava com a imagem da base, à
      // vista: a metralhadora dentro do "andarfaca", o fundo dentro de tudo.
      const usados = new Set<number>()
      for (const [index, tl] of this.indexedTimelines(raw)) if (list(tl['key']).length > 0) usados.add(index)
      for (const [index, sprite] of this.spriteOfTimeline) {
        if (usados.has(index)) continue
        if (timelines.some((tl) => tl.type === 'slot' && tl.target === sprite.slot && tl.property === 'attachment')) continue
        timelines.push({ type: 'slot', target: sprite.slot, property: 'attachment', keys: [{ time: 0, value: null }] })
      }

      this.mainlineTimelines(raw, timelines)
      this.metaTimelines(raw, timelines)
      this.collectEventKeys(raw, eventKeys)
      for (const soundline of list(raw['soundline'])) {
        this.collectSoundKeys(list(soundline['key']), eventKeys)
      }
      if (eventKeys.length > 0) {
        eventKeys.sort((a, b) => a.time - b.time)
        timelines.push({ type: 'event', keys: eventKeys })
      }
      this.animations.push(animation)
    }
  }

  private *indexedTimelines(animation: JsonObject): Generator<[number, JsonObject]> {
    const timelines = list(animation['timeline'])
    for (let i = 0; i < timelines.length; i++) {
      const tl = timelines[i]!
      const id = has(tl, 'id') ? Math.round(numOf(tl, 'id')) : i
      yield [id, tl]
    }
  }

  private transformTimelines(timelines: Timeline[], boneName: string, keys: JsonObject[], child: 'bone' | 'object'): void {
    const values = keys.map(k => (isObject(k[child]) ? (k[child] as JsonObject) : k))
    const bone = this.bones.find(b => b.name === boneName)
    const pick = (field: string, fallback: number) => (i: number) => numOf(values[i], field, fallback)

    const build = (property: string, field: string, fallback: number): void => {
      let i = 0
      const read = pick(field, fallback)
      const out = this.numberKeys(keys, () => read(i++))
      this.addTimeline(
        timelines,
        { type: 'bone', target: boneName, property, keys: out },
        property === 'scaleX' || property === 'scaleY' ? num(bone?.scaleX, 1) : 0,
      )
    }
    build('x', 'x', 0)
    build('y', 'y', 0)
    build('scaleX', 'scale_x', 1)
    build('scaleY', 'scale_y', 1)

    // Rotation: "spin" tells which way the tween turns.
    const angles: number[] = []
    let offset = 0
    values.forEach((v, i) => {
      const raw = numOf(v, 'angle', 0) + offset
      if (i === 0) {
        angles.push(raw)
        return
      }
      const previous = angles[i - 1]!
      const spin = Math.round(numOf(keys[i - 1], 'spin', 1))
      let value = raw
      if (spin > 0) while (value < previous) value += 360
      else if (spin < 0) while (value > previous) value -= 360
      offset += value - raw
      angles.push(value)
    })
    let cursor = 0
    const rotationKeys = this.numberKeys(keys, () => angles[cursor++] ?? 0)
    keys.forEach((k, i) => {
      if (i >= rotationKeys.length - 1) return
      if (Math.round(numOf(k, 'spin', 1)) === 0) rotationKeys[i]!.curve = 'stepped'
    })
    this.addTimeline(timelines, { type: 'bone', target: boneName, property: 'rotation', keys: rotationKeys }, 0)
  }

  private spriteTimelines(timelines: Timeline[], sprite: SpriteInfo, keys: JsonObject[]): void {
    const objects = keys.map(k => (isObject(k['object']) ? (k['object'] as JsonObject) : k))
    if (objects.some(o => has(o, 'a'))) {
      let i = 0
      const alphaKeys = this.numberKeys(keys, () => {
        const a = Math.min(1, Math.max(0, numOf(objects[i++], 'a', 1)))
        return a
      })
      const colorKeys: Key[] = alphaKeys.map(k => ({
        time: k.time,
        value: [1, 1, 1, round6(num(k.value))],
        ...(Array.isArray(k.curve) ? { curve: [...k.curve, ...k.curve, ...k.curve, ...k.curve] } : k.curve === 'stepped' ? { curve: 'stepped' as Curve } : {}),
      }))
      this.addTimeline(timelines, { type: 'slot', target: sprite.slot, property: 'color', keys: colorKeys }, [1, 1, 1, 1])
    }
    const attachmentKeys: Key[] = []
    objects.forEach((o, i) => {
      const fileKey = `${Math.round(numOf(o, 'folder'))}/${Math.round(numOf(o, 'file'))}`
      const placeholder = sprite.attachments.get(fileKey)
      attachmentKeys.push({
        time: round6(numOf(keys[i], 'time') / 1000),
        value: placeholder ?? null,
        curve: 'stepped',
      })
    })
    const distinct = new Set(attachmentKeys.map(k => String(k.value)))
    const slot = this.slots.find(s => s.name === sprite.slot)
    if (distinct.size > 1 || (attachmentKeys[0] !== undefined && attachmentKeys[0].value !== (slot?.attachment ?? null))) {
      this.addTimeline(
        timelines,
        { type: 'slot', target: sprite.slot, property: 'attachment', keys: tidyKeys(attachmentKeys) },
        slot?.attachment ?? null,
      )
    }
  }

  private collectSoundKeys(keys: JsonObject[], eventKeys: Key[]): void {
    for (const key of keys) {
      const object = isObject(key['object']) ? (key['object'] as JsonObject) : key
      const info = this.files.get(`${Math.round(numOf(object, 'folder'))}/${Math.round(numOf(object, 'file'))}`)
      if (info === undefined) continue
      const name = info.name.replace(/\.[^./]+$/, '')
      let def = this.events.find(e => e.name === name)
      if (def === undefined) {
        def = { name }
        const audio = sanitizeUri(info.name)
        if (audio !== undefined) def.audio = audio
        this.events.push(def)
      }
      const eventKey: Key = { time: round6(numOf(key, 'time') / 1000), event: name }
      if (has(object, 'volume')) eventKey.volume = round6(Math.min(1, Math.max(0, numOf(object, 'volume', 1))))
      if (has(object, 'panning')) eventKey.balance = round6(Math.min(1, Math.max(-1, numOf(object, 'panning'))))
      eventKeys.push(eventKey)
    }
  }

  private mainlineTimelines(animation: JsonObject, timelines: Timeline[]): void {
    const mainline = animation['mainline']
    const keys = list(isObject(mainline) ? mainline['key'] : mainline)
    if (keys.length === 0) return
    const setupOrder = this.slots.map(s => s.name)
    const drawKeys: Key[] = []
    const parentKeys = new Map<string, Key[]>()
    // Degrau 10 (10.5): o pai de um SPRITE que muda entre chaves vira uma
    // timeline `slot`/`bone` (9.5), e não mais um `bone/parent` no osso
    // auxiliar. Por slot, as chaves em que o desenho pendura noutro osso.
    const slotBoneKeys = new Map<string, Key[]>()
    const byId = new Map(this.indexedTimelines(animation))
    const rootName = this.bones[0]?.name ?? 'root'
    for (const key of keys) {
      if (!this.assar) this.collectParentKeys(key, rootName, parentKeys, slotBoneKeys, byId)
      const refs = list(key['object_ref'])
        .map(ref => ({
          slot: this.spriteOfTimeline.get(Math.round(numOf(ref, 'timeline')))?.slot,
          z: numOf(ref, 'z_index'),
        }))
        .filter((r): r is { slot: string; z: number } => r.slot !== undefined)
      if (refs.length === 0) continue
      refs.sort((a, b) => a.z - b.z)
      const wanted = refs.map(r => r.slot)
      for (const name of setupOrder) if (!wanted.includes(name)) wanted.push(name)
      drawKeys.push({
        time: round6(numOf(key, 'time') / 1000),
        value: drawOrderOffsets(setupOrder, wanted) as DrawOrderOffset[],
        curve: 'stepped',
      })
    }
    for (const [boneName, pk] of parentKeys) {
      if (pk.every(k => k.value === null)) continue
      this.addTimeline(timelines, { type: 'bone', target: boneName, property: 'parent', keys: tidyKeys(pk) }, null)
    }
    for (const [slotName, sk] of slotBoneKeys) {
      if (sk.every(k => k.value === null)) continue
      // `tidyKeys` tira repetida por valor; aqui o `transform` também conta,
      // porque duas chaves para o mesmo osso com locais diferentes são duas
      // chaves de verdade — comê-las faria o desenho parar de acompanhar.
      this.addTimeline(timelines, { type: 'slot', target: slotName, property: 'bone', keys: sk }, null)
    }
    if (drawKeys.length === 0) return
    if (drawKeys.every(k => (k.value as DrawOrderOffset[]).length === 0)) return
    this.addTimeline(timelines, { type: 'drawOrder', keys: tidyKeys(drawKeys) }, [])
  }

  /**
   * **O pai que muda entre chaves da mainline** — spec 9.4, 9.5 e 13.3.
   *
   * São dois caminhos, e a diferença é o degrau 10 (10.5):
   *
   * | Quem muda de pai | Vira |
   * |:---|:---|
   * | um **osso** (`bone_ref.parent`) | chave `bone`/`parent` (9.4), stepped |
   * | um **desenho** (`object_ref.parent` de um sprite) | chave `slot`/`bone` (9.5), com o `x, y, angle, scale` daquela chave no `transform` |
   *
   * O desenho é o caso do Humberto: *"a espada sai da mão e vai para as costas
   * no meio da animação, sem saltar"*. O único jeito honesto de não saltar é a
   * chave carregar a posição do anexo no osso novo — o runtime não converte
   * nada (9.5). Os locais do Spriter já são medidos do pai daquela chave, e
   * por isso vão como estão.
   *
   * Com `--assar`, nada disto acontece: o osso auxiliar fica com um pai só, o
   * mais usado, e o aviso diz que ficou.
   */
  private collectParentKeys(
    key: JsonObject, rootName: string, out: Map<string, Key[]>,
    slotOut: Map<string, Key[]>, byId: Map<number, JsonObject>,
  ): void {
    const boneRefs = list(key['bone_ref'])
    const refById = new Map<number, number>()
    boneRefs.forEach((ref, i) => {
      const id = has(ref, 'id') ? Math.round(numOf(ref, 'id')) : i
      refById.set(id, Math.round(numOf(ref, 'timeline')))
    })
    const time = round6(numOf(key, 'time') / 1000)
    const parentOf = (ref: JsonObject): string => {
      const parentTimeline = has(ref, 'parent') ? (refById.get(Math.round(numOf(ref, 'parent'))) ?? -1) : -1
      return parentTimeline < 0 ? rootName : (this.boneOfTimeline.get(parentTimeline) ?? rootName)
    }
    for (const ref of boneRefs) {
      const boneName = this.boneOfTimeline.get(Math.round(numOf(ref, 'timeline')))
      if (boneName === undefined) continue
      const setupParent = this.bones.find(b => b.name === boneName)?.parent ?? rootName
      const parentName = parentOf(ref)
      const keysOfBone = out.get(boneName) ?? []
      keysOfBone.push({ time, value: parentName === setupParent ? null : parentName, curve: 'stepped' })
      out.set(boneName, keysOfBone)
    }
    for (const ref of list(key['object_ref'])) {
      const timeline = Math.round(numOf(ref, 'timeline'))
      const sprite = this.spriteOfTimeline.get(timeline)
      if (sprite === undefined) continue
      // O osso do slot no arquivo é o auxiliar; o pai dele é o pai mais usado.
      const setupParent = this.bones.find(b => b.name === sprite.bone)?.parent ?? rootName
      const parentName = parentOf(ref)
      const keysOfSlot = slotOut.get(sprite.slot) ?? []
      if (parentName === setupParent) {
        // De volta ao osso do arquivo: o auxiliar, que já tem as timelines dele.
        keysOfSlot.push({ time, value: null, curve: 'stepped' })
      } else {
        const local = this.spriteLocalAt(byId, timeline, ref)
        const chave: Key = { time, value: parentName, curve: 'stepped' }
        if (local !== null) chave.transform = local
        keysOfSlot.push(chave)
      }
      slotOut.set(sprite.slot, keysOfSlot)
    }
  }

  /**
   * O local do sprite na chave que o `object_ref` aponta, para o `transform`
   * de uma chave `slot`/`bone` (9.5). `null` quando a chave não foi achada —
   * e aí a chave sai sem `transform`, que é o desenho na origem do osso novo,
   * nunca um palpite de posição.
   */
  private spriteLocalAt(
    byId: Map<number, JsonObject>, timeline: number, ref: JsonObject,
  ): { x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number } | null {
    const tl = byId.get(timeline)
    if (tl === undefined) return null
    const keys = list(tl['key'])
    const wanted = has(ref, 'key') ? Math.round(numOf(ref, 'key')) : 0
    const found = keys.find((k, i) => (has(k, 'id') ? Math.round(numOf(k, 'id')) : i) === wanted)
    if (found === undefined) return null
    const object = isObject(found['object']) ? (found['object'] as JsonObject) : found
    const out: { x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number } = {}
    const x = round6(numOf(object, 'x', 0))
    const y = round6(numOf(object, 'y', 0))
    const rotation = round6(numOf(object, 'angle', 0))
    const scaleX = round6(numOf(object, 'scale_x', 1))
    const scaleY = round6(numOf(object, 'scale_y', 1))
    if (x !== 0) out.x = x
    if (y !== 0) out.y = y
    if (rotation !== 0) out.rotation = rotation
    if (scaleX !== 1) out.scaleX = scaleX
    if (scaleY !== 1) out.scaleY = scaleY
    return out
  }

  private metaTimelines(animation: JsonObject, timelines: Timeline[]): void {
    const meta = animation['meta']
    if (!isObject(meta)) return
    for (const varline of list(meta['varline'])) {
      const def = Math.round(numOf(varline, 'def'))
      const variable = this.variables[def]
      if (variable === undefined) {
        this.avisos.add(`A animação usa a variável número ${def}, que não está declarada. Timeline descartada.`)
        continue
      }
      const keys: Key[] = list(varline['key']).map(k => ({
        time: round6(numOf(k, 'time') / 1000),
        value:
          variable.type === 'string'
            ? strOf(k, 'val')
            : variable.type === 'bool'
              ? boolOf(k, 'val', false)
              : variable.type === 'int'
                ? Math.round(numOf(k, 'val'))
                : round6(numOf(k, 'val')),
      }))
      this.addTimeline(
        timelines,
        { type: 'variable', target: variable.name, property: 'value', keys: tidyKeys(keys) },
        variable.default ?? (variable.type === 'string' ? '' : variable.type === 'bool' ? false : 0),
      )
    }
    for (const tagline of list(meta['tagline'])) {
      const keys: Key[] = list(tagline['key']).map(k => ({
        time: round6(numOf(k, 'time') / 1000),
        value: list(k['tag']).map(t => strOf(t, 'name', strOf(t, 't'))).filter(t => t.length > 0),
        curve: 'stepped' as Curve,
      }))
      if (keys.length === 0) continue
      this.addTimeline(timelines, { type: 'tag', keys: tidyKeys(keys) }, [])
    }
  }

  private collectEventKeys(animation: JsonObject, eventKeys: Key[]): void {
    for (const eventline of list(animation['eventline'])) {
      const name = strOf(eventline, 'name', 'evento')
      if (this.events.find(e => e.name === name) === undefined) this.events.push({ name })
      for (const key of list(eventline['key'])) {
        eventKeys.push({ time: round6(numOf(key, 'time') / 1000), event: name })
      }
    }
  }
}

/** Bezier of any degree with uniformly spaced x, evaluated at p. */
function bezierAt(ys: number[], p: number): number {
  const points = ys.slice()
  for (let n = points.length - 1; n > 0; n--) {
    for (let i = 0; i < n; i++) points[i] = points[i]! + (points[i + 1]! - points[i]!) * p
  }
  return points[0] ?? 0
}

export interface SpriterOptions {
  /** Entity to convert, by name. Default: the first one in the file. */
  parte?: string
  /**
   * Old behaviour: keep one parent per bone (the most used) and warn. Default
   * `false`: a bone whose parent changes between mainline keys gets a
   * `bone/parent` timeline (spec 9.4), with Spriter's own semantics.
   */
  assar?: boolean
}

/** Turns whatever the caller has into the `spriter_data` object. */
function spriterRoot(source: string | object): JsonObject {
  let root: JsonObject
  if (typeof source === 'string') {
    const text = source.trim()
    if (text.startsWith('<')) {
      const xml = parseXml(text)
      root = xmlToScon(xml)
    } else {
      const parsed: unknown = JSON.parse(text)
      if (!isObject(parsed)) throw new Error('O arquivo SCON não é um objeto JSON.')
      root = parsed
    }
  } else {
    if (!isObject(source)) throw new Error('O arquivo do Spriter não é um objeto.')
    root = source
  }
  if (isObject(root['spriter_data'])) root = root['spriter_data']
  return root
}

export function importSpriter(source: string | object, opcoes: SpriterOptions = {}): ImportResult {
  return new SpriterImporter(spriterRoot(source), opcoes.parte, opcoes.assar === true).run()
}

/** Names of every entity in the file, so a caller can offer the list. */
export function spriterParts(source: string | object): string[] {
  return list(spriterRoot(source)['entity']).map(e => strOf(e, 'name'))
}

// ---------------------------------------------------------------------------
// O SCML inteiro vira um PROJETO — degrau 10, tarefa 10.5 (spec 13.3)
// ---------------------------------------------------------------------------

/** Um corpo do projeto importado: o nome da entity, o arquivo dentro da pasta. */
export interface SpriterBody {
  /** O nome da entity, como está no SCML. */
  entity: string
  /** O nome do arquivo na pasta do projeto: `heroi.bone`. */
  uri: string
  file: BoneFile
}

/** O SCML inteiro, virado num projeto do Recorte. */
export interface SpriterProject {
  bodies: SpriterBody[]
  /** O `manifest.json` do projeto (spec 2.9), com as listas do editor. */
  manifest: {
    bonez: { version: string }
    main: string
    skeletons: string[]
    extras: { RECORTE_projeto: { corpos: string[]; entidades: string[]; emFoco: string } }
  }
  avisos: string[]
}

/** `Um Herói!` vira `um-heroi.bone`: nome de arquivo que qualquer disco aceita. */
function uriOfEntity(name: string, taken: Set<string>): string {
  const limpo = name
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '')
  const base = limpo.length > 0 ? limpo : `corpo-${taken.size + 1}`
  let uri = `${base}.bone`
  for (let n = 2; taken.has(uri); n++) uri = `${base}-${n}.bone`
  taken.add(uri)
  return uri
}

/**
 * **O SCML inteiro vira um projeto: cada `entity` é um corpo** (13.3, 10.5).
 *
 * *"O projeto é a caixa"* (BASE §15). Um arquivo do Spriter com o herói e o
 * dragão não é um esqueleto com duas metades: são **dois corpos** do mesmo
 * projeto, cada um com a base dele e as animações dele — exatamente o que o
 * `.bonez` da §2.9 guarda, e o que o editor abre pela pasta.
 *
 * O primeiro `entity` é o `main`: é o que um jogo toca sem perguntar (2.9).
 * O `importSpriter` de sempre continua entregando UM corpo, para quem só quer
 * um; aqui saem todos, com o manifesto pronto.
 */
export function importSpriterProject(
  source: string | object, opcoes: Omit<SpriterOptions, 'parte'> = {},
): SpriterProject {
  const root = spriterRoot(source)
  const entities = list(root['entity'])
  if (entities.length === 0) throw new Error('O arquivo do Spriter não tem nenhuma entity.')
  const bodies: SpriterBody[] = []
  const avisos: string[] = []
  const taken = new Set<string>()
  for (const entity of entities) {
    const name = strOf(entity, 'name')
    const result = new SpriterImporter(root, name, opcoes.assar === true).run()
    // O aviso de "o arquivo tem N entities, só uma virou este .bone" é do
    // caminho de um corpo só: aqui todas viraram, e repeti-lo seria mentir.
    for (const aviso of result.avisos) {
      if (aviso.startsWith('O arquivo tem ')) continue
      const comNome = entities.length > 1 ? `${name}: ${aviso}` : aviso
      if (!avisos.includes(comNome)) avisos.push(comNome)
    }
    bodies.push({ entity: name, uri: uriOfEntity(name, taken), file: result.file })
  }
  const corpos = bodies.map(b => b.uri)
  const main = corpos[0]!
  return {
    bodies,
    manifest: {
      bonez: { version: '1.0' },
      main,
      skeletons: corpos,
      extras: { RECORTE_projeto: { corpos, entidades: [], emFoco: main } },
    },
    avisos,
  }
}
