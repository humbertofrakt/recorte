// SPDX-License-Identifier: Apache-2.0
/**
 * Ossos desenhados no PSD — lote 45 (rodada 4, resposta D9 do Humberto).
 *
 * O PSD não tem esqueleto. Esta convenção deixa desenhar um, com o pincel, por
 * cima da arte; o importador lê as linhas e monta os ossos.
 *
 * | O que se desenha                                  | O que vira                                   |
 * |:--------------------------------------------------|:---------------------------------------------|
 * | uma camada `ossos` (ou camadas no grupo `ossos`)  | só ela é lida como esqueleto; não é desenho  |
 * | cada linha                                        | um osso, da base à ponta                     |
 * | uma bolinha gorda numa ponta                      | a base (onde o osso gira)                    |
 * | sem bolinha                                       | a ponta que encosta noutro osso é a base     |
 * | base que encosta noutra linha (até 12 px)         | filho daquela                                |
 * | várias bases no mesmo ponto, uma bem mais curta   | a curta (a bacia) é o pai das outras         |
 * | várias bases no mesmo ponto, do mesmo tamanho     | irmãs: cada uma procura o pai fora dali      |
 * | linha que não encosta em nada                     | filha de `root`                              |
 * | nome                                              | `osso_1`, `osso_2`… da raiz para as pontas   |
 * | cada camada de desenho                            | presa ao osso cuja linha mais a cobre        |
 *
 * COMO SE ACHA UMA LINHA
 *
 * 1. O que tem alfa de 128 para cima é traço.
 * 2. A distância de cada pixel ao fundo (chanfro 3-4) dá a meia largura do
 *    traço; um ponto bem mais gordo que o traço é uma **bolinha**.
 * 3. Cada mancha conexa que é UMA faixa reta (com no máximo uma bolinha) vira
 *    uma linha direto, pelo eixo principal dos pixels. É o caso de uma linha
 *    por camada, e é o mais exato.
 * 4. Mancha com linhas que se tocam: Hough. A reta mais votada, o trecho
 *    contínuo mais comprido sobre ela, o eixo refeito pelos pixels desse
 *    trecho; tira, vota de novo, até sobrar só migalha. Uma bolinha no meio de
 *    uma reta corta a reta em duas — é assim que uma corrente reta se separa.
 *
 * Puro: sem Node e sem DOM. O mesmo módulo serve a linha de comando e o editor.
 * Coordenadas em pixels da tela do PSD, com y para BAIXO, até a hora de virar
 * osso; aí passam para o mundo do `.bone`, com y para cima e a origem no meio
 * da tela, como o `psdPlacement` de `psd.ts` faz com os desenhos.
 */

import type { Bone } from './comum.ts'

// ---------------------------------------------------------------------------
// Formas públicas
// ---------------------------------------------------------------------------

export interface Point {
  x: number
  y: number
}

/** Uma linha achada, em pixels da tela do PSD (y para baixo). */
export interface BoneStroke {
  /** Onde o osso gira. Sem bolinha, só a primeira ponta, até a hierarquia decidir. */
  base: Point
  tip: Point
  /** `true` quando uma bolinha marcou a base. */
  ball: boolean
  /** Raio da bolinha, em px; `0` sem ela. */
  radius: number
  /** Meia largura do traço, em px. */
  halfWidth: number
}

/** Uma camada com pixels e lugar na tela. `PsdLayer` serve. */
export interface PsdRigLayer {
  name: string
  x: number
  y: number
  width: number
  height: number
  /** RGBA8, alfa direto, de cima para baixo. */
  pixels: Uint8Array
}

/** Até onde uma base "encosta" noutra linha, em px. */
export const TOUCH_TOLERANCE = 12

/** O nome da camada, ou do grupo, que vira esqueleto. */
export const BONES_LAYER_NAME = 'ossos'

/** Comprimento mínimo de uma linha achada pelo Hough, fora a bolinha. */
const MIN_LINE = 5

/** Alfa a partir do qual um pixel é traço. */
const ALPHA_MIN = 128

/**
 * O aviso do importador de sempre quando o PSD tem a camada `ossos`: ela
 * **nunca** vira desenho, e sem a opção fica de fora.
 */
export const BONES_LAYER_SKIPPED =
  'Camada "ossos" ignorada: use PSD com ossos… (ou --ossos na linha de comando) para ela virar esqueleto.'

/** `true` para a camada `ossos` e para toda camada dentro de um grupo `ossos`. */
export function isBonesLayer(layer: { name: string }): boolean {
  return layer.name.split('/').some((part) => part.trim().toLowerCase() === BONES_LAYER_NAME)
}

// ---------------------------------------------------------------------------
// Contas pequenas
// ---------------------------------------------------------------------------

const DEG = 180 / Math.PI

function round2(value: number): number {
  const r = Math.round(value * 100) / 100
  return r === 0 ? 0 : r
}

/** Um ângulo em graus, em (-180, 180]. */
function normalizeDeg(angle: number): number {
  let a = angle % 360
  if (a <= -180) a += 360
  if (a > 180) a -= 360
  return a
}

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Distância de `p` ao segmento `a`–`b`, e onde cai: `u` de 0 (em `a`) a 1 (em `b`). */
function segmentDistance(p: Point, a: Point, b: Point): { d: number; u: number } {
  const vx = b.x - a.x
  const vy = b.y - a.y
  const len2 = vx * vx + vy * vy
  const u = len2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / len2))
  return { d: Math.hypot(p.x - (a.x + u * vx), p.y - (a.y + u * vy)), u }
}

function lengthOf(s: BoneStroke): number {
  return dist(s.base, s.tip)
}

// ---------------------------------------------------------------------------
// A imagem: traço, distância ao fundo, manchas
// ---------------------------------------------------------------------------

function maskOf(pixels: Uint8Array, count: number): Uint8Array {
  const mask = new Uint8Array(count)
  for (let i = 0; i < count; i++) mask[i] = (pixels[i * 4 + 3] ?? 0) >= ALPHA_MIN ? 1 : 0
  return mask
}

/** Distância de cada pixel de traço ao fundo mais perto, em px (chanfro 3-4, dividido por 3). */
function distanceTransform(mask: Uint8Array, w: number, h: number): Float32Array {
  const d = new Float32Array(w * h)
  for (let i = 0; i < d.length; i++) d[i] = mask[i] === 1 ? 1e9 : 0
  const at = (x: number, y: number): number => (x < 0 || y < 0 || x >= w || y >= h ? 0 : d[y * w + x]!)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x
      if (d[i] === 0) continue
      d[i] = Math.min(d[i]!, at(x - 1, y) + 3, at(x - 1, y - 1) + 4, at(x, y - 1) + 3, at(x + 1, y - 1) + 4)
    }
  }
  for (let y = h - 1; y >= 0; y--) {
    for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x
      if (d[i] === 0) continue
      d[i] = Math.min(d[i]!, at(x + 1, y) + 3, at(x + 1, y + 1) + 4, at(x, y + 1) + 3, at(x - 1, y + 1) + 4)
    }
  }
  for (let i = 0; i < d.length; i++) d[i] = d[i]! / 3
  return d
}

function isLocalMax(d: Float32Array, w: number, h: number, x: number, y: number): boolean {
  const v = d[y * w + x]!
  if (v <= 0) return false
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
      if (d[ny * w + nx]! > v) return false
    }
  }
  return true
}

/** Manchas conexas (8 vizinhos). `labels[i]` é a mancha do pixel, ou -1 no fundo. */
function components(mask: Uint8Array, w: number, h: number): { labels: Int32Array; lists: number[][] } {
  const labels = new Int32Array(w * h).fill(-1)
  const lists: number[][] = []
  const queue: number[] = []
  for (let start = 0; start < mask.length; start++) {
    if (mask[start] !== 1 || labels[start] !== -1) continue
    const id = lists.length
    const list: number[] = []
    labels[start] = id
    queue.length = 0
    queue.push(start)
    for (let q = 0; q < queue.length; q++) {
      const i = queue[q]!
      list.push(i)
      const x = i % w
      const y = (i - x) / w
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = x + dx
          const ny = y + dy
          if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue
          const n = ny * w + nx
          if (mask[n] === 1 && labels[n] === -1) {
            labels[n] = id
            queue.push(n)
          }
        }
      }
    }
    lists.push(list)
  }
  return { labels, lists }
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]!
}

// ---------------------------------------------------------------------------
// Eixo principal e trechos contínuos
// ---------------------------------------------------------------------------

interface Fit {
  c: Point
  d: Point
  n: Point
}

/**
 * O eixo que melhor passa pelos pontos. Com `anchor`, o eixo passa por ele —
 * é o caso da bolinha: a linha sai do centro dela.
 */
function fitLine(points: readonly Point[], anchor: Point | null): Fit {
  let c: Point
  if (anchor !== null) {
    c = anchor
  } else {
    let sx = 0
    let sy = 0
    for (const p of points) {
      sx += p.x
      sy += p.y
    }
    c = { x: sx / points.length, y: sy / points.length }
  }
  let xx = 0
  let xy = 0
  let yy = 0
  for (const p of points) {
    const dx = p.x - c.x
    const dy = p.y - c.y
    xx += dx * dx
    xy += dx * dy
    yy += dy * dy
  }
  const angle = 0.5 * Math.atan2(2 * xy, xx - yy)
  const d = { x: Math.cos(angle), y: Math.sin(angle) }
  return { c, d, n: { x: -d.y, y: d.x } }
}

const along = (f: Fit, p: Point): number => (p.x - f.c.x) * f.d.x + (p.y - f.c.y) * f.d.y
const across = (f: Fit, p: Point): number => (p.x - f.c.x) * f.n.x + (p.y - f.c.y) * f.n.y

/** Separa os índices em trechos contínuos ao longo de `t`, quebrando nos buracos maiores que `gap`. */
function runsOf(indices: readonly number[], t: (i: number) => number, gap: number): number[][] {
  const sorted = [...indices].sort((a, b) => t(a) - t(b))
  const runs: number[][] = []
  let current: number[] = []
  let last = -Infinity
  for (const i of sorted) {
    const v = t(i)
    if (current.length > 0 && v - last > gap) {
      runs.push(current)
      current = []
    }
    current.push(i)
    last = v
  }
  if (current.length > 0) runs.push(current)
  return runs
}

function extentOf(run: readonly number[], t: (i: number) => number): number {
  if (run.length === 0) return 0
  return t(run[run.length - 1]!) - t(run[0]!)
}

// ---------------------------------------------------------------------------
// Bolinhas
// ---------------------------------------------------------------------------

interface Ball {
  x: number
  y: number
  r: number
  component: number
  used: boolean
}

function findBalls(
  mask: Uint8Array, d: Float32Array, labels: Int32Array, w: number, h: number, halfWidth: number,
): Ball[] {
  const threshold = Math.max(2.5, 1.8 * halfWidth)
  const candidates: Array<{ x: number; y: number; v: number }> = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const v = d[y * w + x]!
      if (v >= threshold && isLocalMax(d, w, h, x, y)) candidates.push({ x, y, v })
    }
  }
  candidates.sort((a, b) => b.v - a.v || a.y - b.y || a.x - b.x)
  const balls: Ball[] = []
  for (const c of candidates) {
    const cx = c.x + 0.5
    const cy = c.y + 0.5
    if (balls.some((b) => Math.hypot(b.x - cx, b.y - cy) <= Math.max(b.r, c.v))) continue
    // O centro de verdade: a média dos pixels dentro do raio, que é o disco.
    const r = c.v
    let sx = 0
    let sy = 0
    let count = 0
    const reach = Math.ceil(r)
    for (let y = Math.max(0, c.y - reach); y <= Math.min(h - 1, c.y + reach); y++) {
      for (let x = Math.max(0, c.x - reach); x <= Math.min(w - 1, c.x + reach); x++) {
        if (mask[y * w + x] !== 1) continue
        if (Math.hypot(x + 0.5 - cx, y + 0.5 - cy) > r) continue
        sx += x + 0.5
        sy += y + 0.5
        count++
      }
    }
    balls.push({
      x: count > 0 ? sx / count : cx,
      y: count > 0 ? sy / count : cy,
      r,
      component: labels[c.y * w + c.x]!,
      used: false,
    })
  }
  return balls
}

// ---------------------------------------------------------------------------
// Hough, para a mancha em que várias linhas se tocam
// ---------------------------------------------------------------------------

function houghSegments(points: readonly Point[], halfWidth: number): Array<{ a: Point; b: Point }> {
  const minLen = Math.max(MIN_LINE, 3 * halfWidth)
  const gap = 2 * halfWidth + 4
  const band = halfWidth + 1.5
  if (points.length === 0) return []

  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const p of points) {
    x0 = Math.min(x0, p.x)
    y0 = Math.min(y0, p.y)
    x1 = Math.max(x1, p.x)
    y1 = Math.max(y1, p.y)
  }
  const diag = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) + 2
  const rows = 2 * diag + 1
  const ANGLES = 180
  const cos = new Float64Array(ANGLES)
  const sin = new Float64Array(ANGLES)
  for (let a = 0; a < ANGLES; a++) {
    cos[a] = Math.cos(a / DEG)
    sin[a] = Math.sin(a / DEG)
  }
  const acc = new Int32Array(ANGLES * rows)
  const off = new Uint8Array(ANGLES * rows)
  const local = points.map((p) => ({ x: p.x - x0, y: p.y - y0 }))
  const vote = (i: number, delta: number): void => {
    const p = local[i]!
    for (let a = 0; a < ANGLES; a++) {
      acc[a * rows + Math.round(p.x * cos[a]! + p.y * sin[a]!) + diag] += delta
    }
  }
  const alive = new Uint8Array(points.length).fill(1)
  for (let i = 0; i < points.length; i++) vote(i, 1)

  const out: Array<{ a: Point; b: Point }> = []
  for (let guard = 0; guard < 600; guard++) {
    let best = -1
    let bestVotes = 0
    for (let k = 0; k < acc.length; k++) {
      if (off[k] === 1) continue
      if (acc[k]! > bestVotes) {
        bestVotes = acc[k]!
        best = k
      }
    }
    if (best < 0 || bestVotes < minLen) break
    const a = Math.floor(best / rows)
    const rho = (best % rows) - diag
    const fit0: Fit = {
      c: { x: rho * cos[a]!, y: rho * sin[a]! },
      d: { x: -sin[a]!, y: cos[a]! },
      n: { x: cos[a]!, y: sin[a]! },
    }
    const near: number[] = []
    for (let i = 0; i < local.length; i++) {
      if (alive[i] === 1 && Math.abs(across(fit0, local[i]!)) <= band) near.push(i)
    }
    const t0 = (i: number): number => along(fit0, local[i]!)
    const run0 = runsOf(near, t0, gap).sort((p, q) => extentOf(q, t0) - extentOf(p, t0))[0] ?? []
    if (extentOf(run0, t0) < minLen) {
      off[best] = 1
      continue
    }

    // O eixo refeito pelos pixels do trecho, e o trecho colhido de novo nele.
    const fit1 = fitLine(run0.map((i) => local[i]!), null)
    const near1: number[] = []
    for (let i = 0; i < local.length; i++) {
      if (alive[i] === 1 && Math.abs(across(fit1, local[i]!)) <= halfWidth + 1) near1.push(i)
    }
    const t1 = (i: number): number => along(fit1, local[i]!)
    const runs1 = runsOf(near1, t1, gap)
    let run = runs1[0] ?? []
    let closest = Infinity
    for (const candidate of runs1) {
      const lo = t1(candidate[0]!)
      const hi = t1(candidate[candidate.length - 1]!)
      const miss = lo > 0 ? lo : hi < 0 ? -hi : 0
      if (miss < closest) {
        closest = miss
        run = candidate
      }
    }
    if (run.length === 0 || extentOf(run, t1) < minLen) {
      off[best] = 1
      continue
    }
    const fit = fitLine(run.map((i) => local[i]!), null)
    let lo = Infinity
    let hi = -Infinity
    for (const i of run) {
      const v = along(fit, local[i]!)
      lo = Math.min(lo, v)
      hi = Math.max(hi, v)
    }
    const shrink = Math.min(0.5 * halfWidth, (hi - lo) / 4)
    lo += shrink
    hi -= shrink
    out.push({
      a: { x: fit.c.x + lo * fit.d.x + x0, y: fit.c.y + lo * fit.d.y + y0 },
      b: { x: fit.c.x + hi * fit.d.x + x0, y: fit.c.y + hi * fit.d.y + y0 },
    })
    for (const i of run) {
      alive[i] = 0
      vote(i, -1)
    }
  }
  return out
}

// ---------------------------------------------------------------------------
// Uma camada inteira
// ---------------------------------------------------------------------------

export interface StrokeReadOptions {
  /** Onde a camada começa na tela do PSD. As linhas voltam na tela, não na camada. */
  x?: number
  y?: number
  /** Onde escrever o que não deu para ler, em português. */
  warnings?: string[]
}

/**
 * **As linhas de uma camada.** `pixels` é RGBA8 de `w` por `h`. Volta cada
 * linha com a base e a ponta, na tela do PSD (`x`, `y` somados).
 */
export function strokesFromLayer(
  pixels: Uint8Array, w: number, h: number, options: StrokeReadOptions = {},
): BoneStroke[] {
  const ox = options.x ?? 0
  const oy = options.y ?? 0
  const warn = (line: string): void => {
    if (options.warnings !== undefined && !options.warnings.includes(line)) options.warnings.push(line)
  }
  if (w <= 0 || h <= 0) return []
  const mask = maskOf(pixels, w * h)
  const d = distanceTransform(mask, w, h)
  const { labels, lists } = components(mask, w, h)

  const ridge: number[] = []
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (mask[y * w + x] === 1 && isLocalMax(d, w, h, x, y)) ridge.push(d[y * w + x]!)
    }
  }
  const halfWidth = Math.max(1, median(ridge))
  const balls = findBalls(mask, d, labels, w, h, halfWidth)
  const gap = 2 * halfWidth + 4
  const centre = (i: number): Point => ({ x: (i % w) + 0.5, y: Math.floor(i / w) + 0.5 })

  const strokes: BoneStroke[] = []
  let specks = 0
  for (let id = 0; id < lists.length; id++) {
    const inside = balls.filter((b) => b.component === id)
    const all = lists[id]!.map(centre)
    const line = all.filter((p) => !inside.some((b) => Math.hypot(p.x - b.x, p.y - b.y) <= b.r + 1.5))
    if (line.length < 3) {
      if (inside.length === 0) specks++
      continue
    }

    // Uma faixa reta só, com no máximo uma bolinha: a linha sai direto do eixo.
    if (inside.length <= 1) {
      const ball = inside[0] ?? null
      const fit = fitLine(line, ball === null ? null : { x: ball.x, y: ball.y })
      const idx = line.map((_, i) => i)
      const t = (i: number): number => along(fit, line[i]!)
      const straight = line.every((p) => Math.abs(across(fit, p)) <= halfWidth + 1.5)
      if (straight && runsOf(idx, t, gap).length === 1) {
        if (ball !== null) {
          // A ponta é o pixel mais longe do centro da bolinha, no eixo.
          let far = 0
          for (const i of idx) if (Math.abs(t(i)) > Math.abs(far)) far = t(i)
          const reach = Math.abs(far) - Math.min(0.5 * halfWidth, Math.abs(far) / 4)
          const sign = far < 0 ? -1 : 1
          ball.used = true
          strokes.push({
            base: { x: ball.x + ox, y: ball.y + oy },
            tip: { x: ball.x + sign * reach * fit.d.x + ox, y: ball.y + sign * reach * fit.d.y + oy },
            ball: true,
            radius: ball.r,
            halfWidth,
          })
        } else {
          let lo = Infinity
          let hi = -Infinity
          for (const i of idx) {
            lo = Math.min(lo, t(i))
            hi = Math.max(hi, t(i))
          }
          if (hi - lo < 2) {
            specks++
            continue
          }
          const shrink = Math.min(0.5 * halfWidth, (hi - lo) / 4)
          strokes.push({
            base: { x: fit.c.x + (lo + shrink) * fit.d.x + ox, y: fit.c.y + (lo + shrink) * fit.d.y + oy },
            tip: { x: fit.c.x + (hi - shrink) * fit.d.x + ox, y: fit.c.y + (hi - shrink) * fit.d.y + oy },
            ball: false,
            radius: 0,
            halfWidth,
          })
        }
        continue
      }
    }

    // Linhas que se tocam: Hough, e depois as bolinhas vão para as pontas.
    const segments = houghSegments(line, halfWidth).map((s) => ({
      a: s.a, b: s.b, ball: null as Ball | null, baseIsA: true,
    }))
    const reachOf = (b: Ball): number => b.r + halfWidth + 4
    const endsNear = (b: Ball): number[] => segments
      .map((s, i) => ({ i, e: Math.min(dist(s.a, b), dist(s.b, b)) }))
      .filter((c) => c.e <= reachOf(b))
      .map((c) => c.i)
    const give = (b: Ball, i: number): void => {
      const s = segments[i]!
      s.ball = b
      s.baseIsA = dist(s.a, b) <= dist(s.b, b)
      b.used = true
    }
    // Primeiro a bolinha que só encosta numa linha; depois a que sobra para uma
    // linha só sem bolinha; por fim, a ponta mais perto.
    for (const b of inside) {
      const near = endsNear(b)
      if (near.length === 1 && segments[near[0]!]!.ball === null) give(b, near[0]!)
    }
    for (let changed = true; changed;) {
      changed = false
      for (const b of inside) {
        if (b.used) continue
        const free = endsNear(b).filter((i) => segments[i]!.ball === null)
        if (free.length === 1) {
          give(b, free[0]!)
          changed = true
        }
      }
    }
    for (const b of inside) {
      if (b.used) continue
      const free = endsNear(b).filter((i) => segments[i]!.ball === null)
      if (free.length === 0) continue
      free.sort((p, q) => {
        const sp = segments[p]!
        const sq = segments[q]!
        return Math.min(dist(sp.a, b), dist(sp.b, b)) - Math.min(dist(sq.a, b), dist(sq.b, b)) || p - q
      })
      give(b, free[0]!)
    }
    for (const s of segments) {
      const b = s.ball
      const baseEnd = s.baseIsA ? s.a : s.b
      const tipEnd = s.baseIsA ? s.b : s.a
      strokes.push({
        base: b === null ? { x: baseEnd.x + ox, y: baseEnd.y + oy } : { x: b.x + ox, y: b.y + oy },
        tip: { x: tipEnd.x + ox, y: tipEnd.y + oy },
        ball: b !== null,
        radius: b === null ? 0 : b.r,
        halfWidth,
      })
    }
  }

  for (const b of balls) {
    if (b.used) continue
    warn(`Uma bolinha perto de (${Math.round(b.x + ox)}, ${Math.round(b.y + oy)}) não encosta em linha nenhuma `
      + 'e ficou de fora.')
  }
  if (specks > 0) {
    warn(`${specks === 1 ? 'Um risco solto' : `${specks} riscos soltos`} na camada de ossos `
      + `${specks === 1 ? 'era pequeno demais para ser osso e ficou' : 'eram pequenos demais para ser osso e ficaram'} de fora.`)
  }
  return strokes
}

// ---------------------------------------------------------------------------
// Quem é filho de quem
// ---------------------------------------------------------------------------

export interface StrokeTree {
  /** As linhas, já com base e ponta decididas, na mesma ordem da entrada. */
  strokes: BoneStroke[]
  /** O pai de cada linha, pelo índice; `null` é filha de `root`. */
  parents: Array<number | null>
}

/**
 * **A árvore.** Orienta as linhas sem bolinha, acha o pai de cada uma e tira
 * qualquer ciclo. Pura: a mesma entrada dá sempre a mesma árvore.
 */
export function hierarchyFromStrokes(
  input: readonly BoneStroke[], tolerance: number = TOUCH_TOLERANCE,
): StrokeTree {
  const strokes: BoneStroke[] = input.map((s) => ({ ...s, base: { ...s.base }, tip: { ...s.tip } }))
  const n = strokes.length

  // A ponta que chega na bolinha de outro osso vai até o centro dela: é a
  // junta. Só quando a bolinha está no prolongamento da linha — uma bolinha
  // ao lado não puxa ponta nenhuma.
  for (const s of strokes) {
    if (!s.ball) continue
    for (const o of strokes) {
      if (o === s || !o.ball) continue
      const reach = o.radius + s.halfWidth + 4
      if (dist(s.tip, o.base) > reach) continue
      const len = lengthOf(s)
      if (len === 0) continue
      const dx = (s.tip.x - s.base.x) / len
      const dy = (s.tip.y - s.base.y) / len
      const off = Math.abs((o.base.x - s.base.x) * -dy + (o.base.y - s.base.y) * dx)
      if (off <= s.halfWidth + 1.5) s.tip = { ...o.base }
    }
  }

  /** Encosta no corpo ou na ponta de `j` (longe da base dele)? A distância, ou `null`. */
  const bodyTouch = (p: Point, j: number): number | null => {
    const o = strokes[j]!
    const { d } = segmentDistance(p, o.base, o.tip)
    if (d > tolerance) return null
    if (dist(p, o.base) <= tolerance) return null
    return d
  }
  const flip = (s: BoneStroke): void => {
    const base = s.base
    s.base = s.tip
    s.tip = base
  }

  // Sem bolinha, a base é a ponta que encosta num osso já decidido.
  const resolved = strokes.map((s) => s.ball)
  const centroid = n === 0 ? { x: 0, y: 0 } : {
    x: strokes.reduce((sum, s) => sum + (s.base.x + s.tip.x) / 2, 0) / n,
    y: strokes.reduce((sum, s) => sum + (s.base.y + s.tip.y) / 2, 0) / n,
  }
  for (;;) {
    let changed = true
    while (changed) {
      changed = false
      for (let i = 0; i < n; i++) {
        if (resolved[i]) continue
        const s = strokes[i]!
        let atBase = Infinity
        let atTip = Infinity
        for (let j = 0; j < n; j++) {
          if (j === i || !resolved[j]) continue
          atBase = Math.min(atBase, bodyTouch(s.base, j) ?? Infinity)
          atTip = Math.min(atTip, bodyTouch(s.tip, j) ?? Infinity)
        }
        if (atBase === Infinity && atTip === Infinity) continue
        if (atTip < atBase) flip(s)
        resolved[i] = true
        changed = true
      }
    }
    // Ninguém mais se decide sozinho: a linha mais perto do meio do desenho
    // começa, com a base na ponta mais perto do meio.
    let pick = -1
    let pickDistance = Infinity
    for (let i = 0; i < n; i++) {
      if (resolved[i]) continue
      const s = strokes[i]!
      const mid = { x: (s.base.x + s.tip.x) / 2, y: (s.base.y + s.tip.y) / 2 }
      const dm = dist(mid, centroid)
      if (dm < pickDistance) {
        pickDistance = dm
        pick = i
      }
    }
    if (pick < 0) break
    const s = strokes[pick]!
    if (dist(s.tip, centroid) < dist(s.base, centroid)) flip(s)
    resolved[pick] = true
  }

  // O pai.
  //
  // 1. Encruzilhada: as linhas cujas bases caem juntas (até `tolerance`).
  //    Se uma delas é bem mais curta — metade ou menos de cada outra —, ela é
  //    o CENTRO (uma bacia, um ombro) e é o pai das outras. Sem centro, elas
  //    são irmãs, e cada uma procura o pai fora da encruzilhada.
  // 2. Fora dela: a linha em cujo corpo ou ponta a base encosta, a mais perto.
  // 3. O centro só aceita pai pela PONTA de outra linha. Uma linha que só
  //    passa perto dele — o braço caído por cima da bacia — não é pai de nada.
  const lengths = strokes.map(lengthOf)
  const junctionOf = (i: number): number[] => {
    const members = [i]
    for (let j = 0; j < n; j++) {
      if (j !== i && dist(strokes[i]!.base, strokes[j]!.base) <= tolerance) members.push(j)
    }
    return members
  }
  const hubOf = (members: readonly number[]): number | null => {
    if (members.length < 2) return null
    let hub = members[0]!
    for (const m of members) {
      if (lengths[m]! < lengths[hub]! - 1e-9 || (Math.abs(lengths[m]! - lengths[hub]!) <= 1e-9 && m < hub)) hub = m
    }
    return members.every((m) => m === hub || lengths[hub]! <= 0.5 * lengths[m]!) ? hub : null
  }

  const parents: Array<number | null> = []
  const reach: number[] = []
  const hubs = new Set<number>()
  for (let i = 0; i < n; i++) {
    const s = strokes[i]!
    const junction = junctionOf(i)
    const hub = hubOf(junction)
    if (hub !== null) hubs.add(hub)
    if (hub !== null && hub !== i) {
      parents.push(hub)
      reach.push(0)
      continue
    }
    let best = -1
    let bestDistance = Infinity
    for (let j = 0; j < n; j++) {
      if (junction.includes(j)) continue
      const o = strokes[j]!
      if (hub === i && dist(s.base, o.tip) > tolerance) continue
      const { d } = segmentDistance(s.base, o.base, o.tip)
      if (d <= tolerance && d < bestDistance) {
        bestDistance = d
        best = j
      }
    }
    parents.push(best >= 0 ? best : null)
    reach.push(best >= 0 ? bestDistance : 0)
  }

  // Ciclo: um centro de encruzilhada que está nele vira raiz; sem centro, o
  // que encostou mais de longe; empate, o de menor índice.
  for (let start = 0; start < n; start++) {
    const seen: number[] = []
    let k: number | null = start
    while (k !== null && !seen.includes(k)) {
      seen.push(k)
      k = parents[k] ?? null
    }
    if (k === null) continue
    const cycle = seen.slice(seen.indexOf(k)).sort((a, b) => a - b)
    const centre = cycle.find((m) => hubs.has(m))
    const loosest = cycle.reduce((a, b) => (reach[b]! > reach[a]! ? b : a), cycle[0]!)
    parents[centre ?? loosest] = null
  }

  return { strokes, parents }
}

// ---------------------------------------------------------------------------
// Que desenho vai em que osso
// ---------------------------------------------------------------------------

/** Quantos pontos da linha, de pixel em pixel, caem em cima do desenho. */
function coverage(layer: PsdRigLayer, s: BoneStroke): number {
  const steps = Math.max(1, Math.ceil(lengthOf(s)))
  let count = 0
  for (let k = 0; k <= steps; k++) {
    const x = Math.floor(s.base.x + ((s.tip.x - s.base.x) * k) / steps - layer.x)
    const y = Math.floor(s.base.y + ((s.tip.y - s.base.y) * k) / steps - layer.y)
    if (x < 0 || y < 0 || x >= layer.width || y >= layer.height) continue
    if ((layer.pixels[(y * layer.width + x) * 4 + 3] ?? 0) >= ALPHA_MIN) count++
  }
  return count
}

/**
 * **Cada desenho, no osso cuja linha mais o cobre.** Nenhuma cobre: o osso
 * mais perto do centro da camada. Volta o índice da linha, por camada.
 */
export function assignLayersToBones(
  layers: readonly PsdRigLayer[], strokes: readonly BoneStroke[],
): number[] {
  return layers.map((layer) => {
    const centre = { x: layer.x + layer.width / 2, y: layer.y + layer.height / 2 }
    let best = -1
    let bestCover = -1
    let bestDistance = Infinity
    strokes.forEach((s, i) => {
      const cover = coverage(layer, s)
      const d = segmentDistance(centre, s.base, s.tip).d
      if (cover > bestCover || (cover === bestCover && d < bestDistance)) {
        best = i
        bestCover = cover
        bestDistance = d
      }
    })
    return best
  })
}

// ---------------------------------------------------------------------------
// O esqueleto pronto
// ---------------------------------------------------------------------------

export interface PsdRigOptions {
  /** O osso de onde as raízes pendem. */
  rootBone: string
  /** Nomes que já existem no arquivo, para os novos não repetirem. */
  taken?: Iterable<string>
  tolerance?: number
}

/** Onde um desenho fica, no espaço do osso dele. */
export interface PsdRigPlacement {
  bone: string
  x: number
  y: number
  /** Em graus. Desfaz o giro do osso: o desenho fica em pé, como estava no PSD. */
  rotation: number
}

export interface PsdRig {
  /** Os ossos novos, pai antes de filho. Não inclui o `rootBone`. */
  bones: Bone[]
  /** Uma por camada de desenho, na ordem dada. */
  placements: PsdRigPlacement[]
  warnings: string[]
}

/**
 * **Do PSD ao esqueleto.** Lê as camadas de ossos, monta a árvore, dá os nomes,
 * e diz onde cada camada de desenho fica no osso dela — no MESMO lugar da
 * tela, só que medido a partir do osso.
 */
export function buildPsdRig(
  doc: { width: number; height: number },
  bonesLayers: readonly PsdRigLayer[],
  drawingLayers: readonly PsdRigLayer[],
  options: PsdRigOptions,
): PsdRig {
  const warnings: string[] = []
  const root = options.rootBone
  const toWorld = (p: Point): Point => ({ x: p.x - doc.width / 2, y: doc.height / 2 - p.y })
  const centreOf = (layer: PsdRigLayer): Point => toWorld({
    x: layer.x + layer.width / 2, y: layer.y + layer.height / 2,
  })

  const found: BoneStroke[] = []
  for (const layer of bonesLayers) {
    found.push(...strokesFromLayer(layer.pixels, layer.width, layer.height, {
      x: layer.x, y: layer.y, warnings,
    }))
  }
  if (found.length === 0) {
    warnings.push('A camada "ossos" não tem nenhuma linha que dê para ler. Todo desenho ficou preso ao osso raiz.')
    return {
      bones: [],
      placements: drawingLayers.map((layer) => ({ bone: root, ...centreOf(layer), rotation: 0 })),
      warnings,
    }
  }

  const tree = hierarchyFromStrokes(found, options.tolerance ?? TOUCH_TOLERANCE)
  const { strokes, parents } = tree

  // Da raiz para as pontas; irmãos de cima para baixo, depois da esquerda
  // para a direita.
  const byPlace = (a: number, b: number): number =>
    strokes[a]!.base.y - strokes[b]!.base.y || strokes[a]!.base.x - strokes[b]!.base.x || a - b
  const children = strokes.map(() => [] as number[])
  const roots: number[] = []
  parents.forEach((p, i) => (p === null ? roots.push(i) : children[p]!.push(i)))
  const order: number[] = []
  const visit = (i: number): void => {
    order.push(i)
    for (const c of children[i]!.sort(byPlace)) visit(c)
  }
  for (const r of roots.sort(byPlace)) visit(r)

  const taken = new Set(options.taken ?? [])
  taken.add(root)
  const names = new Map<number, string>()
  let counter = 1
  for (const i of order) {
    while (taken.has(`osso_${counter}`)) counter++
    const name = `osso_${counter}`
    taken.add(name)
    names.set(i, name)
  }

  // Os números gravados são arredondados; o mundo de cada osso é refeito a
  // partir deles, para o desenho cair no lugar do arquivo, não no da conta.
  const world = new Map<number, { x: number; y: number; rotation: number }>()
  const bones: Bone[] = []
  for (const i of order) {
    const s = strokes[i]!
    const base = toWorld(s.base)
    const tip = toWorld(s.tip)
    const angle = Math.atan2(tip.y - base.y, tip.x - base.x) * DEG
    const p = parents[i] ?? null
    const pw = p === null ? { x: 0, y: 0, rotation: 0 } : world.get(p)!
    const r = pw.rotation / DEG
    const dx = base.x - pw.x
    const dy = base.y - pw.y
    const x = round2(dx * Math.cos(r) + dy * Math.sin(r))
    const y = round2(-dx * Math.sin(r) + dy * Math.cos(r))
    const rotation = round2(normalizeDeg(angle - pw.rotation))
    bones.push({
      name: names.get(i)!,
      parent: p === null ? root : names.get(p)!,
      length: round2(dist(base, tip)),
      x,
      y,
      rotation,
    })
    world.set(i, {
      x: pw.x + x * Math.cos(r) - y * Math.sin(r),
      y: pw.y + x * Math.sin(r) + y * Math.cos(r),
      rotation: pw.rotation + rotation,
    })
  }

  const assigned = assignLayersToBones(drawingLayers, strokes)
  const placements = drawingLayers.map((layer, k) => {
    const i = assigned[k]!
    const w = world.get(i)!
    const c = centreOf(layer)
    const r = w.rotation / DEG
    const dx = c.x - w.x
    const dy = c.y - w.y
    return {
      bone: names.get(i)!,
      x: round2(dx * Math.cos(r) + dy * Math.sin(r)),
      y: round2(-dx * Math.sin(r) + dy * Math.cos(r)),
      rotation: round2(normalizeDeg(-w.rotation)),
    }
  })

  return { bones, placements, warnings }
}
