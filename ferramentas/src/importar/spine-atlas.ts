// SPDX-License-Identifier: Apache-2.0
// Reads the Spine text `.atlas` file and produces the Recorte atlas JSON
// (spec section 10). Spine stores a rotated region turned 90 degrees
// COUNTER-clockwise; Recorte's `rotation: 90` means CLOCKWISE (spec 10.4).
// The two differ by 180 degrees, so the crop offsets are mirrored here and the
// skeleton importer compensates the attachments (see `rotatedRegions`).

import type { AtlasFile, AtlasPage, AtlasRegion } from './comum.ts'
import { IMPORTER_NAME, FORMAT_VERSION, Warnings, sanitizeUri } from './comum.ts'

export interface SpineAtlasResult {
  atlas: AtlasFile
  /** Region names that were stored rotated counter-clockwise by Spine. */
  rotatedRegions: Set<string>
  /** Region name -> crop data, used to convert mesh uvs. */
  crops: Map<string, RegionCrop>
  avisos: string[]
}

export interface RegionCrop {
  width: number
  height: number
  offsetX: number
  offsetY: number
  originalWidth: number
  originalHeight: number
  rotated: boolean
}

interface Entry {
  name: string
  props: Map<string, string[]>
}

const PAGE_ONLY_KEYS = ['format', 'filter', 'repeat', 'pma']
const REGION_KEYS = ['xy', 'bounds', 'orig', 'offset', 'offsets', 'rotate', 'index', 'split', 'pad']

const FORMAT_MAP: Record<string, string> = {
  rgba8888: 'rgba8',
  rgb888: 'rgb8',
  rgba4444: 'rgba4',
  rgb565: 'rgb565',
  alpha: 'alpha8',
  intensity: 'alpha8',
  luminancealpha: 'rgba8',
}

const FILTER_MAP: Record<string, string> = {
  nearest: 'nearest',
  linear: 'linear',
  mipmap: 'mipmap',
  mipmapnearestnearest: 'mipmap',
  mipmaplinearnearest: 'mipmap',
  mipmapnearestlinear: 'mipmap',
  mipmaplinearlinear: 'mipmap',
}

function splitValues(raw: string): string[] {
  return raw
    .split(',')
    .map(v => v.trim())
    .filter(v => v.length > 0)
}

function toInt(value: string | undefined, fallback = 0): number {
  if (value === undefined) return fallback
  const n = Number.parseFloat(value)
  return Number.isFinite(n) ? Math.round(n) : fallback
}

/** Splits the text into (name, properties) entries, tolerant to both layouts. */
function readEntries(text: string): Entry[] {
  const lines = text.split(/\r\n|\r|\n/)
  const entries: Entry[] = []
  let current: Entry | null = null
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (line.length === 0) {
      current = null
      continue
    }
    const colon = line.indexOf(':')
    if (colon > 0 && current !== null) {
      const key = line.slice(0, colon).trim().toLowerCase()
      const value = line.slice(colon + 1).trim()
      current.props.set(key, splitValues(value))
      continue
    }
    if (colon > 0 && current === null) {
      // Stray property with no owner: ignore it.
      continue
    }
    current = { name: line, props: new Map() }
    entries.push(current)
  }
  return entries
}

function isRegionEntry(entry: Entry): boolean {
  for (const key of REGION_KEYS) if (entry.props.has(key)) return true
  return false
}

function isPageEntry(entry: Entry): boolean {
  if (isRegionEntry(entry)) return false
  for (const key of PAGE_ONLY_KEYS) if (entry.props.has(key)) return true
  return entry.props.has('size')
}

/** Reads Spine's `rotate` value. Returns degrees counter-clockwise. */
function readRotate(values: string[] | undefined): number {
  if (values === undefined || values.length === 0) return 0
  const v = values[0]!.trim().toLowerCase()
  if (v === 'true') return 90
  if (v === 'false') return 0
  const n = Number.parseFloat(v)
  if (!Number.isFinite(n)) return 0
  return ((Math.round(n / 90) * 90) % 360 + 360) % 360
}

export function importSpineAtlas(text: string): SpineAtlasResult {
  const avisos = new Warnings()
  const entries = readEntries(text)
  const pages: AtlasPage[] = []
  const regions: AtlasRegion[] = []
  const rotatedRegions = new Set<string>()
  const crops = new Map<string, RegionCrop>()
  const usedPageNames = new Set<string>()
  const usedRegionNames = new Set<string>()
  let pageIndex = -1

  for (const entry of entries) {
    if (isPageEntry(entry) || pageIndex < 0) {
      const image = sanitizeUri(entry.name)
      if (image === undefined) {
        avisos.add(`Página do atlas com caminho de imagem inválido: "${entry.name}". Página ignorada.`)
        continue
      }
      let name = image.replace(/\.[^./]+$/, '')
      if (name.length === 0) name = image
      let unique = name
      let n = 2
      while (usedPageNames.has(unique)) unique = `${name}_${n++}`
      usedPageNames.add(unique)

      const size = entry.props.get('size')
      const page: AtlasPage = {
        name: unique,
        image,
        width: toInt(size?.[0], 0),
        height: toInt(size?.[1], 0),
      }
      if (page.width <= 0 || page.height <= 0) {
        avisos.add(`Página "${unique}" sem "size". Tamanho será deduzido das regiões.`)
        page.width = 0
        page.height = 0
      }
      const format = entry.props.get('format')?.[0]?.toLowerCase()
      if (format !== undefined) {
        const mapped = FORMAT_MAP[format]
        if (mapped === undefined) avisos.add(`Formato de página "${format}" desconhecido. Usando "rgba8".`)
        else if (mapped !== 'rgba8') page.format = mapped
      }
      const filter = entry.props.get('filter')
      if (filter !== undefined) {
        const min = FILTER_MAP[(filter[0] ?? '').toLowerCase()]
        const mag = FILTER_MAP[(filter[1] ?? filter[0] ?? '').toLowerCase()]
        if (min !== undefined && min !== 'linear') page.minFilter = min
        if (mag !== undefined && mag !== 'linear') page.magFilter = mag === 'mipmap' ? 'linear' : mag
      }
      const repeat = (entry.props.get('repeat')?.[0] ?? 'none').toLowerCase()
      if (repeat === 'x') page.wrapU = 'repeat'
      else if (repeat === 'y') page.wrapV = 'repeat'
      else if (repeat === 'xy') {
        page.wrapU = 'repeat'
        page.wrapV = 'repeat'
      }
      if ((entry.props.get('pma')?.[0] ?? '').toLowerCase() === 'true') page.premultiplied = true
      pages.push(page)
      pageIndex = pages.length - 1
      continue
    }

    // Region entry.
    const bounds = entry.props.get('bounds')
    const xy = entry.props.get('xy')
    const size = entry.props.get('size')
    const offsets = entry.props.get('offsets')
    const offset = entry.props.get('offset')
    const orig = entry.props.get('orig')

    const x = bounds ? toInt(bounds[0]) : toInt(xy?.[0])
    const y = bounds ? toInt(bounds[1]) : toInt(xy?.[1])
    const width = bounds ? toInt(bounds[2]) : toInt(size?.[0])
    const height = bounds ? toInt(bounds[3]) : toInt(size?.[1])
    const offsetX = offsets ? toInt(offsets[0]) : toInt(offset?.[0])
    const offsetY = offsets ? toInt(offsets[1]) : toInt(offset?.[1])
    const originalWidth = offsets ? toInt(offsets[2], width) : toInt(orig?.[0], width)
    const originalHeight = offsets ? toInt(offsets[3], height) : toInt(orig?.[1], height)

    const degrees = readRotate(entry.props.get('rotate'))
    let rotation = 0
    let rotated = false
    if (degrees === 90) {
      rotation = 90
      rotated = true
    } else if (degrees !== 0) {
      avisos.add(
        `Região "${entry.name}" girada ${degrees}° no atlas do Spine. O formato aceita só 0° e 90°. Usando 0°; a imagem sairá torta.`,
      )
    }

    const index = toInt(entry.props.get('index')?.[0], -1)
    let name = entry.name
    if (index >= 0) {
      name = `${entry.name}_${index}`
      avisos.add(
        `Região "${entry.name}" tem "index" do Spine. Renomeada para "${name}"; ajuste o caminho do attachment se precisar.`,
      )
    }
    if (usedRegionNames.has(name)) {
      avisos.add(`Região "${name}" repetida no atlas. Só a primeira foi usada.`)
      continue
    }
    usedRegionNames.add(name)

    if (entry.props.has('split') || entry.props.has('pad')) {
      avisos.add(`Região "${name}" tem "split"/"pad" (ninepatch). O formato não guarda isso; foi descartado.`)
    }

    const region: AtlasRegion = {
      name,
      page: pageIndex < 0 ? 0 : pageIndex,
      x,
      y,
      width,
      height,
    }
    // Spine rotates counter-clockwise, Recorte clockwise. Mirroring the crop
    // inside the original image makes the spec 10.4 formula land on the same
    // pixels; the skeleton importer then turns the attachment 180 degrees.
    const finalOffsetX = rotated ? originalWidth - offsetX - width : offsetX
    const finalOffsetY = rotated ? originalHeight - offsetY - height : offsetY
    if (rotation !== 0) region.rotation = rotation
    if (finalOffsetX !== 0) region.offsetX = Math.max(0, finalOffsetX)
    if (finalOffsetY !== 0) region.offsetY = Math.max(0, finalOffsetY)
    if (originalWidth !== width) region.originalWidth = originalWidth
    if (originalHeight !== height) region.originalHeight = originalHeight
    regions.push(region)

    crops.set(name, {
      width,
      height,
      offsetX,
      offsetY,
      originalWidth,
      originalHeight,
      rotated,
    })
    if (rotated) rotatedRegions.add(name)
  }

  if (rotatedRegions.size > 0) {
    avisos.add(
      `O atlas do Spine gira ${rotatedRegions.size} região(ões) no sentido anti-horário e o formato .bone gira no horário. ` +
        `A conversão espelha o corte e vira o desenho 180° para dar o mesmo pixel. Confira essas peças.`,
    )
  }

  // Pages without "size": deduce from the regions that live in them.
  pages.forEach((page, i) => {
    if (page.width > 0 && page.height > 0) return
    let w = 1
    let h = 1
    for (const r of regions) {
      if (r.page !== i) continue
      const rw = r.rotation === 90 ? r.height : r.width
      const rh = r.rotation === 90 ? r.width : r.height
      w = Math.max(w, r.x + rw)
      h = Math.max(h, r.y + rh)
    }
    page.width = w
    page.height = h
  })

  if (pages.length === 0) {
    avisos.add('O arquivo .atlas não tem nenhuma página. Foi criada uma página vazia.')
    pages.push({ name: 'pagina', image: 'pagina.png', width: 1, height: 1 })
  }

  const atlas: AtlasFile = {
    atlas: { version: FORMAT_VERSION, generator: IMPORTER_NAME },
    pages,
    regions,
  }

  return { atlas, rotatedRegions, crops, avisos: avisos.list() }
}

/**
 * Spine mesh uvs are relative to the packed crop; Recorte uvs are relative to
 * the whole original image (spec 10.4). Converts one uv pair.
 */
export function cropUvToOriginal(crop: RegionCrop, u: number, v: number): [number, number] {
  const ow = crop.originalWidth || crop.width || 1
  const oh = crop.originalHeight || crop.height || 1
  let cu = u
  let cv = v
  if (crop.rotated) {
    // The importer stores the image mirrored 180 degrees for rotated regions.
    cu = 1 - cu
    cv = 1 - cv
    const offsetXMirror = ow - crop.offsetX - crop.width
    const offsetYMirror = oh - crop.offsetY - crop.height
    return [
      (offsetXMirror + cu * crop.width) / ow,
      (oh - offsetYMirror - crop.height + cv * crop.height) / oh,
    ]
  }
  return [
    (crop.offsetX + cu * crop.width) / ow,
    (oh - crop.offsetY - crop.height + cv * crop.height) / oh,
  ]
}
