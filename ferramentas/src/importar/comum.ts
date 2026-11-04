// SPDX-License-Identifier: Apache-2.0
// Shared types and helpers for the .bone importers (spec section 13).
// Identifiers and comments in English; user-facing warnings in Portuguese.

export type Json = unknown
export type JsonObject = Record<string, unknown>

export type Curve = 'linear' | 'stepped' | number[]

export interface DrawOrderOffset {
  slot: string
  offset: number
}

export interface Key {
  time: number
  value?: unknown
  curve?: Curve
  offset?: number
  event?: string
  int?: number
  float?: number
  string?: string
  volume?: number
  balance?: number
  /**
   * O local do anexo no osso NOVO, numa chave `slot`/`bone` (spec 9.5).
   *
   * A chave que troca o desenho de osso carrega a posição dele lá, porque o
   * runtime não converte nada: sem isto a espada saltaria ao mudar de mão.
   * É o que o Spriter grava no `object_ref` de cada chave (13.3).
   */
  transform?: { x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number }
  extras?: JsonObject
}

export interface Timeline {
  type: string
  target?: string
  property?: string
  skin?: string
  attachment?: string
  keys: Key[]
  extras?: JsonObject
}

export interface Animation {
  name: string
  duration?: number
  loop?: boolean
  blend?: 'replace' | 'add' | 'multiply'
  defaultMix?: number
  tags?: string[]
  timelines: Timeline[]
  extras?: JsonObject
}

export interface Bone {
  name: string
  parent?: string
  length?: number
  x?: number
  y?: number
  rotation?: number
  scaleX?: number
  scaleY?: number
  shearX?: number
  shearY?: number
  inheritRotation?: boolean
  inheritScale?: boolean
  inheritReflection?: boolean
  skinRequired?: boolean
  color?: number[]
  icon?: string
  visible?: boolean
  folder?: string
  extras?: JsonObject
}

export interface Slot {
  name: string
  bone: string
  attachment?: string
  color?: number[]
  darkColor?: number[]
  blend?: string
  visible?: boolean
  folder?: string
  extras?: JsonObject
}

export interface Binding {
  counts: number[]
  bones: number[]
  positions: number[]
  weights: number[]
}

export interface Attachment {
  type: string
  path?: string
  color?: number[]
  [key: string]: unknown
}

export interface Skin {
  name: string
  displayName?: string
  includes?: string[]
  bones?: string[]
  constraints?: string[]
  attachments?: Record<string, Record<string, Attachment | null>>
  extras?: JsonObject
}

export interface Constraint {
  type: string
  name: string
  mix?: number
  skinRequired?: boolean
  [key: string]: unknown
}

export interface EventDef {
  name: string
  int?: number
  float?: number
  string?: string
  audio?: string
  volume?: number
  balance?: number
  extras?: JsonObject
}

export interface Variable {
  name: string
  type: 'float' | 'int' | 'string' | 'bool'
  default?: number | string | boolean
}

export interface BoneHeader {
  version: string
  minVersion: string
  generator: string
  id?: string
  created?: string
  license?: string
  extras?: JsonObject
}

export interface SkeletonInfo {
  name?: string
  x?: number
  y?: number
  width?: number
  height?: number
  fps?: number
  referenceScale?: number
  hash?: string
  extras?: JsonObject
}

export interface Assets {
  atlases?: string[]
  imagesBase?: string
  audioBase?: string
  skeletonsBase?: string
}

export interface BoneFile {
  bone: BoneHeader
  skeleton?: SkeletonInfo
  assets?: Assets
  bones: Bone[]
  slots?: Slot[]
  constraints?: Constraint[]
  skins?: Skin[]
  events?: EventDef[]
  variables?: Variable[]
  tags?: string[]
  animations?: Animation[]
  extras?: JsonObject
}

export interface AtlasPage {
  name: string
  image: string
  width: number
  height: number
  format?: string
  minFilter?: string
  magFilter?: string
  wrapU?: string
  wrapV?: string
  premultiplied?: boolean
}

export interface AtlasRegion {
  name: string
  aliases?: string[]
  page: number
  x: number
  y: number
  width: number
  height: number
  rotation?: number
  offsetX?: number
  offsetY?: number
  originalWidth?: number
  originalHeight?: number
}

export interface AtlasFile {
  atlas: { version: string; generator: string }
  scale?: number
  pages: AtlasPage[]
  regions: AtlasRegion[]
}

export interface ImportResult {
  file: BoneFile
  atlas?: AtlasFile
  avisos: string[]
}

export const FORMAT_VERSION = '1.0'
export const IMPORTER_NAME = 'Recorte importador 0.1.0'

/** Collects warnings without duplicates blowing up the report. */
export class Warnings {
  private readonly seen = new Map<string, number>()
  private readonly order: string[] = []

  add(message: string): void {
    const count = this.seen.get(message)
    if (count === undefined) {
      this.seen.set(message, 1)
      this.order.push(message)
    } else {
      this.seen.set(message, count + 1)
    }
  }

  list(): string[] {
    return this.order.map(m => {
      const n = this.seen.get(m) ?? 1
      return n > 1 ? `${m} (${n} vezes)` : m
    })
  }
}

// ---------------------------------------------------------------- primitives

export function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function num(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function str(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function bool(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function numArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.map(v => num(v))
}

export function intArray(value: unknown): number[] {
  if (!Array.isArray(value)) return []
  return value.map(v => Math.round(num(v)))
}

/** Rounds to 6 decimals (spec 3.6: writers should not exceed 6 places). */
export function round6(value: number): number {
  if (!Number.isFinite(value)) return 0
  const r = Math.round(value * 1e6) / 1e6
  return Object.is(r, -0) ? 0 : r
}

export function roundArray(values: number[]): number[] {
  return values.map(round6)
}

export const DEG = Math.PI / 180

// ------------------------------------------------------------------- colours

/** "rrggbbaa" or "rrggbb" hex to [r, g, b, a] floats. */
export function hexToColor4(hex: unknown, fallback: number[] = [1, 1, 1, 1]): number[] {
  const text = str(hex).replace(/^#/, '')
  if (text.length !== 6 && text.length !== 8) return fallback.slice()
  const parts: number[] = []
  for (let i = 0; i < text.length; i += 2) {
    const v = parseInt(text.slice(i, i + 2), 16)
    if (Number.isNaN(v)) return fallback.slice()
    parts.push(round6(v / 255))
  }
  if (parts.length === 3) parts.push(1)
  return parts
}

/** "rrggbb" hex to [r, g, b] floats. */
export function hexToColor3(hex: unknown, fallback: number[] = [0, 0, 0]): number[] {
  const c = hexToColor4(hex, [...fallback, 1])
  return c.slice(0, 3)
}

export function clampUnit(value: number): number {
  if (!Number.isFinite(value)) return 0
  return value < 0 ? 0 : value > 1 ? 1 : value
}


// ---------------------------------------------------------------------- URIs

/**
 * Makes a path usable as a `uri` in the schema: no scheme, no leading slash,
 * no "..", forward slashes only. Returns undefined when nothing is left.
 */
export function sanitizeUri(raw: unknown): string | undefined {
  let text = str(raw).trim().replace(/\\/g, '/')
  if (!text) return undefined
  while (text.startsWith('./')) text = text.slice(2)
  while (text.startsWith('/')) text = text.slice(1)
  if (!text || text === '.') return undefined
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(text)) return undefined
  if (text === '..' || text.startsWith('../') || text.includes('/../') || text.endsWith('/..')) return undefined
  return text
}

/** Same rules as sanitizeUri but for `attachment.path` (":" is also banned). */
export function sanitizePath(raw: unknown): string | undefined {
  const uri = sanitizeUri(raw)
  if (uri === undefined) return undefined
  if (uri.includes(':')) return undefined
  return uri
}

// -------------------------------------------------------------------- curves

/**
 * Normalized bezier control points to absolute ones (spec 13, rule 4):
 * cx = t0 + x*(t1-t0), cy = v0 + y*(v1-v0).
 */
export function normalizedCurveToAbsolute(
  normalized: number[],
  t0: number,
  v0: number,
  t1: number,
  v1: number,
): number[] {
  const [x1, y1, x2, y2] = normalized
  return roundArray([
    t0 + num(x1) * (t1 - t0),
    v0 + num(y1) * (v1 - v0),
    t0 + num(x2) * (t1 - t0),
    v0 + num(y2) * (v1 - v0),
  ])
}

/**
 * Fits a cubic bezier (with x control points at 1/3 and 2/3, so x(t) == t)
 * to an arbitrary normalized easing function f: [0,1] -> R.
 * Returns the two normalized y control points.
 */
export function fitEasing(f: (p: number) => number): [number, number] {
  const a = f(1 / 3) - 1 / 27
  const b = f(2 / 3) - 8 / 27
  // (4/9)y1 + (2/9)y2 = a ; (2/9)y1 + (4/9)y2 = b
  const det = (4 / 9) * (4 / 9) - (2 / 9) * (2 / 9)
  const y1 = ((4 / 9) * a - (2 / 9) * b) / det
  const y2 = ((4 / 9) * b - (2 / 9) * a) / det
  return [y1, y2]
}

/** Evaluates a key list at time t, following spec 9.10 (single component). */
export function evaluateNumber(keys: Key[], t: number): number {
  if (keys.length === 0) return 0
  if (t <= keys[0]!.time) return num(keys[0]!.value)
  const last = keys[keys.length - 1]!
  if (t >= last.time) return num(last.value)
  let i = 0
  for (let j = 0; j < keys.length - 1; j++) if (keys[j]!.time <= t) i = j
  const k = keys[i]!
  const n = keys[i + 1]!
  const v0 = num(k.value)
  const v1 = num(n.value)
  if (k.curve === 'stepped') return v0
  if (!Array.isArray(k.curve)) {
    const p = (t - k.time) / (n.time - k.time)
    return v0 + (v1 - v0) * p
  }
  return sampleBezier(k.time, v0, k.curve, n.time, v1, t)
}

/** Absolute cubic bezier segment sampled at time t (spec 9.3). */
export function sampleBezier(
  t0: number,
  v0: number,
  curve: number[],
  t1: number,
  v1: number,
  t: number,
): number {
  const cx1 = num(curve[0])
  const cy1 = num(curve[1])
  const cx2 = num(curve[2])
  const cy2 = num(curve[3])
  // Solve for the bezier parameter that matches x == t, by bisection.
  let lo = 0
  let hi = 1
  let p = (t - t0) / (t1 - t0)
  for (let i = 0; i < 40; i++) {
    const mt = 1 - p
    const x = mt * mt * mt * t0 + 3 * mt * mt * p * cx1 + 3 * mt * p * p * cx2 + p * p * p * t1
    if (x < t) lo = p
    else hi = p
    p = (lo + hi) / 2
  }
  const mt = 1 - p
  return mt * mt * mt * v0 + 3 * mt * mt * p * cy1 + 3 * mt * p * p * cy2 + p * p * p * v1
}

// ------------------------------------------------------------------ timeline

/** Sorts keys by time and drops duplicates (keeping the last one). */
export function tidyKeys(keys: Key[]): Key[] {
  const sorted = keys.slice().sort((a, b) => a.time - b.time)
  const out: Key[] = []
  for (const k of sorted) {
    const prev = out[out.length - 1]
    if (prev && Math.abs(prev.time - k.time) < 1e-9) out[out.length - 1] = k
    else out.push(k)
  }
  return out
}

/**
 * Spec 13.1: a timeline that does not start at t = 0 gets a key at 0 holding
 * the setup value, stepped until the first original key.
 */
export function ensureKeyAtZero(keys: Key[], setupValue: unknown): Key[] {
  if (keys.length === 0) return keys
  if (keys[0]!.time <= 1e-9) return keys
  const zero: Key = { time: 0, value: cloneValue(setupValue), curve: 'stepped' }
  return [zero, ...keys]
}

function cloneValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.slice()
  return value
}

/** Builds a drawOrder offsets array from a desired slot order. */
export function drawOrderOffsets(setupOrder: string[], wantedOrder: string[]): DrawOrderOffset[] {
  const setupIndex = new Map<string, number>()
  setupOrder.forEach((name, i) => setupIndex.set(name, i))
  const offsets: DrawOrderOffset[] = []
  wantedOrder.forEach((name, target) => {
    const from = setupIndex.get(name)
    if (from === undefined) return
    if (from !== target) offsets.push({ slot: name, offset: target - from })
  })
  return offsets
}

// ------------------------------------------------------------- 2x3 matrices

export type Matrix = [number, number, number, number, number, number] // a b c d tx ty

export function matrixMultiply(m: Matrix, n: Matrix): Matrix {
  return [
    m[0] * n[0] + m[1] * n[2],
    m[0] * n[1] + m[1] * n[3],
    m[2] * n[0] + m[3] * n[2],
    m[2] * n[1] + m[3] * n[3],
    m[0] * n[4] + m[1] * n[5] + m[4],
    m[2] * n[4] + m[3] * n[5] + m[5],
  ]
}

export function matrixInvert(m: Matrix): Matrix {
  const det = m[0] * m[3] - m[1] * m[2]
  if (Math.abs(det) < 1e-12) return [1, 0, 0, 1, 0, 0]
  const ia = m[3] / det
  const ib = -m[1] / det
  const ic = -m[2] / det
  const id = m[0] / det
  return [ia, ib, ic, id, -(ia * m[4] + ib * m[5]), -(ic * m[4] + id * m[5])]
}

export function matrixApply(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[1] * y + m[4], m[2] * x + m[3] * y + m[5]]
}

export function matrixApplyVector(m: Matrix, x: number, y: number): [number, number] {
  return [m[0] * x + m[1] * y, m[2] * x + m[3] * y]
}

// ------------------------------------------------------------------- header

export function makeHeader(generator: string): BoneHeader {
  return { version: FORMAT_VERSION, minVersion: FORMAT_VERSION, generator }
}


