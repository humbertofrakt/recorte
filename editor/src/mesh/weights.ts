/**
 * Mesh weights (owner C, requirement R5).
 *
 * Pure functions over the `.bone` JSON and over one working shape, the
 * `WeightTable`: one map `bone index -> weight` per vertex. Nothing here
 * touches the DOM, the document or the undo stack; a caller reads an
 * attachment, asks for new weights, and writes the result back with a normal
 * command.
 *
 * Why a table and not the `Binding` of spec 7.4 straight away: the file stores
 * weights as a structure of arrays (`counts`, `bones`, `positions`,
 * `weights`), which is perfect to read at sixty frames per second and terrible
 * to edit with a brush — adding one influence to one vertex would move every
 * number after it. So editing happens on the table, and `tableToBinding`
 * writes the SoA back exactly as the spec asks: positions in each bone's own
 * local space, weights already normalized (7.4: the reader never renormalizes).
 *
 * Coordinate spaces:
 *   - WORLD (skeleton space, Y up) is where the brush and the automatic
 *     weights work, because that is where the artist sees the mesh;
 *   - the file keeps positions in each bone's LOCAL space, and the conversion
 *     is a matrix inverse — which is also what makes converting a mesh between
 *     "with weights" and "without weights" exact, in both directions.
 */

import {
  Skeleton, invertMatrix, loadSkeletonData, transformPoint,
} from '../../../runtime/src/index.js';
import type {
  BindingDef, BoneFile, Matrix2x3, MeshAttachmentDef,
} from '../../../runtime/src/index.js';
import type { MeshGeometry } from './mesh-edit.js';

// ---------------------------------------------------------------------------
// Bones, as the weights see them
// ---------------------------------------------------------------------------

/** One bone in the setup pose: its world matrix, its index and its length. */
export interface BoneFrame extends Matrix2x3 {
  /** Index in `file.bones`, which is what `binding.bones` stores (7.4). */
  readonly index: number;
  readonly name: string;
  /** Bone length in world units, `0` for a bone with no length. */
  readonly length: number;
}

/** The world segment of a bone: origin to tip (spec 4.2). */
export interface BoneSegment {
  x1: number; y1: number; x2: number; y2: number;
}

export function boneSegment(frame: BoneFrame): BoneSegment {
  return {
    x1: frame.worldX,
    y1: frame.worldY,
    x2: frame.a * frame.length + frame.worldX,
    y2: frame.c * frame.length + frame.worldY,
  };
}

/** Bone frames read from a posed runtime skeleton, in `file.bones` order. */
export function boneFramesOf(skeleton: Skeleton): BoneFrame[] {
  return skeleton.bones.map((bone, index) => ({
    index,
    name: bone.data.name,
    length: bone.data.length,
    a: bone.a, b: bone.b, c: bone.c, d: bone.d,
    worldX: bone.worldX, worldY: bone.worldY,
  }));
}

/**
 * Bone frames of the SETUP pose of a file. The file is loaded through the
 * runtime, so the world matrices are the normative ones of spec 5.4 and not a
 * second implementation that could drift.
 */
export function boneFramesFromFile(file: BoneFile): BoneFrame[] {
  const data = loadSkeletonData(file as unknown as Record<string, unknown>);
  const skeleton = new Skeleton(data);
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform();
  return boneFramesOf(skeleton);
}

/** The frame of the bone a slot hangs from, or `null`. */
export function slotBoneFrame(
  file: BoneFile, slot: string, frames: readonly BoneFrame[],
): BoneFrame | null {
  const found = (file.slots ?? []).find((entry) => entry.name === slot);
  if (found === undefined) return null;
  return frames.find((frame) => frame.name === found.bone) ?? null;
}

/** Distance from a point to a bone segment, in world units. */
export function distanceToBone(frame: BoneFrame, x: number, y: number): number {
  const s = boneSegment(frame);
  const dx = s.x2 - s.x1;
  const dy = s.y2 - s.y1;
  const len2 = dx * dx + dy * dy;
  if (len2 <= 1e-12) return Math.hypot(x - s.x1, y - s.y1);
  let t = ((x - s.x1) * dx + (y - s.y1) * dy) / len2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return Math.hypot(x - (s.x1 + dx * t), y - (s.y1 + dy * t));
}

// ---------------------------------------------------------------------------
// The working shape
// ---------------------------------------------------------------------------

/** Weights of one vertex: bone index -> weight. */
export type VertexWeights = Map<number, number>;

/** One entry per vertex. This is what the brushes edit. */
export type WeightTable = VertexWeights[];

/** An empty table for `count` vertices. */
export function emptyTable(count: number): WeightTable {
  const table: WeightTable = [];
  for (let i = 0; i < count; i++) table.push(new Map());
  return table;
}

export function cloneTable(table: WeightTable): WeightTable {
  return table.map((vertex) => new Map(vertex));
}

/** Weight of one bone on one vertex, `0` when the bone has no influence. */
export function weightOf(table: WeightTable, vertex: number, bone: number): number {
  return table[vertex]?.get(bone) ?? 0;
}

/** The weight every vertex gives to one bone, for the colours of the viewport. */
export function boneColumn(table: WeightTable, bone: number): number[] {
  return table.map((vertex) => vertex.get(bone) ?? 0);
}

/**
 * Every bone bound to the mesh, sorted by index: the list "Ossos que
 * influenciam". A bone with weight 0 COUNTS — lote 63: it was bound with P and
 * not painted yet, and spec 7.4 allows weights `0..1`. A brush that takes a
 * bone down to 0 deletes the entry, so painting it away still unbinds it.
 */
export function influencingBones(table: WeightTable): number[] {
  const bones = new Set<number>();
  for (const vertex of table) for (const [bone, weight] of vertex) if (weight >= 0) bones.add(bone);
  return [...bones].sort((a, b) => a - b);
}

/** Uma fatia da pizza de um vértice: o osso, e o quanto ele puxa (`0..1`). */
export interface WeightSlice {
  readonly bone: number;
  readonly weight: number;
}

/**
 * A **pizza** de um vértice — lote 69, plano "uma imagem em dois ossos".
 *
 * O Spine e o DragonBones desenham cada vértice de uma malha com peso como uma
 * pizza: uma fatia por osso, na cor do osso, do tamanho do peso. É o que deixa
 * ver **dois ossos ao mesmo tempo** — a escala azul–vermelho de antes mostrava
 * um osso por vez, e por isso o Humberto não via a imagem presa aos dois.
 *
 * As fatias saem em **ordem de índice de osso**, sempre a mesma, para a cor de
 * um osso não pular de lugar entre um vértice e o vizinho. O osso que está na
 * lista com peso 0 não vira fatia: fatia de tamanho 0 não se vê.
 */
export function pieOf(table: WeightTable, vertex: number): WeightSlice[] {
  const entry = table[vertex];
  if (entry === undefined) return [];
  return [...entry]
    .filter(([, weight]) => weight > 0)
    .sort((a, b) => a[0] - b[0])
    .map(([bone, weight]) => ({ bone, weight }));
}

// ---------------------------------------------------------------------------
// Binding one bone by hand — lote 63, plano "o P liga o osso"
// ---------------------------------------------------------------------------

/**
 * Liga um osso à malha — lote 63. O Humberto, 10/09/2026: *"como faz para
 * associar um osso à malha?"*. O gesto é o P, o mesmo de prender filhos.
 *
 * Malha sem peso nenhum: o osso entra com **1 em todos os pontos**, e a malha
 * passa a seguir ele. Malha que já tem peso: ele entra com **0** em todos os
 * pontos — a soma continua 1, nada se mexe, e a lista já o mostra, pronto
 * para o pincel ou para Pesos automáticos. Devolve uma tabela nova.
 */
export function bindBone(table: WeightTable, bone: number, vertexCount: number): WeightTable {
  const out = cloneTable(table);
  while (out.length < vertexCount) out.push(new Map());
  const empty = out.every((vertex) => vertex.size === 0);
  for (const vertex of out) {
    if (empty) vertex.set(bone, 1);
    else if (!vertex.has(bone)) vertex.set(bone, 0);
  }
  return out;
}

/** O que sobrou depois de tirar um osso, e o aviso quando algum ponto ficou sem nenhum. */
export interface UnbindResult {
  table: WeightTable;
  /** Pontos que só tinham este osso e ficaram sem entrada. */
  orphans: number;
  warning: string | null;
}

/** O aviso dos pontos que ficaram sem osso. */
export function orphanWarning(orphans: number): string | null {
  if (orphans <= 0) return null;
  return orphans === 1 ? '1 ponto ficou sem osso' : `${orphans} pontos ficaram sem osso`;
}

/**
 * Tira um osso da malha — lote 63. O peso dele é **redistribuído** aos outros
 * do mesmo ponto, na proporção do que eles tinham, e a soma continua 1. Se os
 * outros tinham 0 (entraram pelo P e não foram pintados), dividem por igual.
 * Um ponto que só tinha este osso fica sem entrada, e o aviso diz quantos.
 */
export function unbindBone(table: WeightTable, bone: number): UnbindResult {
  const out = cloneTable(table);
  let orphans = 0;
  for (const vertex of out) {
    if (!vertex.has(bone)) continue;
    vertex.delete(bone);
    if (vertex.size === 0) {
      orphans += 1;
      continue;
    }
    let sum = 0;
    for (const weight of vertex.values()) sum += weight;
    if (sum > 0) normalizeVertex(vertex);
    else for (const other of vertex.keys()) vertex.set(other, 1 / vertex.size);
  }
  return { table: out, orphans, warning: orphanWarning(orphans) };
}

/**
 * Os ossos que Pesos automáticos usa — lote 63: **só os da lista**, quando a
 * malha já tem alguém ligado; lista vazia, como sempre, todo osso com
 * comprimento.
 */
export function autoWeightBones(table: WeightTable, frames: readonly BoneFrame[]): number[] {
  const listed = influencingBones(table);
  if (listed.length > 0) return listed;
  return frames.filter((frame) => frame.length > 0).map((frame) => frame.index);
}

/**
 * Makes the weights of one vertex add up to 1 (L1 of spec 7.4).
 *
 * Locked bones keep the weight they have: only what is left of the 1 is shared
 * among the others, in proportion. A vertex whose locked weights already add
 * up to 1 or more has every unlocked weight dropped, which is exactly what a
 * lock is for — "this bone owns this vertex, stop the brush from taking it".
 */
export function normalizeVertex(vertex: VertexWeights, locked: ReadonlySet<number> = new Set()): void {
  let lockedSum = 0;
  let freeSum = 0;
  for (const [bone, weight] of vertex) {
    if (locked.has(bone)) lockedSum += weight;
    else freeSum += weight;
  }
  const room = 1 - lockedSum;
  if (room <= 0) {
    for (const bone of [...vertex.keys()]) if (!locked.has(bone)) vertex.delete(bone);
    if (lockedSum > 0 && Math.abs(lockedSum - 1) > 1e-9) {
      for (const [bone, weight] of vertex) vertex.set(bone, weight / lockedSum);
    }
    return;
  }
  if (freeSum <= 0) {
    // Nothing free to grow: give the rest to the locked bones, or leave the
    // vertex empty when it has no weight at all.
    if (lockedSum > 0) {
      for (const [bone, weight] of vertex) vertex.set(bone, weight / lockedSum);
    }
    return;
  }
  const scale = room / freeSum;
  for (const [bone, weight] of vertex) {
    if (!locked.has(bone)) vertex.set(bone, weight * scale);
  }
}

/** Normalizes every vertex of a table, in place. */
export function normalizeTable(table: WeightTable, locked: ReadonlySet<number> = new Set()): void {
  for (const vertex of table) normalizeVertex(vertex, locked);
}

/**
 * Drops weights below `threshold` and normalizes what is left. The largest
 * weight of a vertex always survives: spec 7.4 asks for at least one influence
 * per vertex (`counts >= 1`).
 */
export function pruneWeights(
  table: WeightTable, threshold = 0.02, locked: ReadonlySet<number> = new Set(),
): WeightTable {
  const out = cloneTable(table);
  for (const vertex of out) {
    if (vertex.size === 0) continue;
    let best = -1;
    let bestWeight = -1;
    for (const [bone, weight] of vertex) {
      if (weight > bestWeight) {
        bestWeight = weight;
        best = bone;
      }
    }
    for (const [bone, weight] of [...vertex]) {
      if (bone === best || locked.has(bone)) continue;
      if (weight < threshold) vertex.delete(bone);
    }
    normalizeVertex(vertex, locked);
  }
  return out;
}

/** Keeps the `max` largest influences of every vertex and normalizes. */
export function limitInfluences(table: WeightTable, max: number): WeightTable {
  const out = cloneTable(table);
  if (max < 1) return out;
  for (const vertex of out) {
    if (vertex.size <= max) continue;
    const sorted = [...vertex].sort((p, q) => q[1] - p[1]).slice(0, max);
    vertex.clear();
    for (const [bone, weight] of sorted) vertex.set(bone, weight);
    normalizeVertex(vertex);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Automatic weights (requirement R5)
// ---------------------------------------------------------------------------

export interface AutoWeightOptions {
  /** Bones allowed to influence, by index. Default: every bone with length. */
  bones?: readonly number[];
  /**
   * How much farther than the closest bone another bone may be and still
   * count. `2` means "up to twice the distance of the nearest bone".
   */
  range?: number;
  /** Exponent of the falloff. Larger = the closest bone wins by more. */
  falloff?: number;
  /** Most influences per vertex. */
  maxInfluences?: number;
  /** Weights below this are dropped before normalizing. */
  threshold?: number;
}

/** Distance under which two points count as the same, in world units. */
const NEAR = 1e-4;

/**
 * Weights by distance from the vertex to the bone segment, with a soft cutoff.
 *
 * FORMULA. For a vertex `p`, let `d_i` be the distance from `p` to the segment
 * of bone `i` and `d0 = max(min d_i, NEAR)` the distance to the closest bone.
 * With `range` (default 2) and `falloff` (default 2):
 *
 *     raw_i = (d0 * range / max(d_i, NEAR)) ^ falloff - 1      , or 0 if negative
 *     w_i   = raw_i / sum(raw)
 *
 * Three properties, and they are the reason for this shape:
 *
 *   - a bone exactly `range` times farther than the closest one gets `raw = 0`,
 *     so influence FADES OUT instead of being cut off at a hard border: no
 *     visible seam where a bone enters the mesh ("queda suave");
 *   - two bones at the same distance get the same weight, so a vertex halfway
 *     between two bones comes out `0.5 / 0.5` — a rule an artist can predict;
 *   - the sum is 1 by construction (7.4 asks for `|sum - 1| <= 1e-4`), and
 *     nothing is renormalized at read time.
 *
 * `positions` are the vertices in WORLD space, `2N` numbers.
 */
export function autoWeights(
  positions: readonly number[], frames: readonly BoneFrame[], options: AutoWeightOptions = {},
): WeightTable {
  const range = options.range ?? 2;
  const falloff = options.falloff ?? 2;
  const maxInfluences = options.maxInfluences ?? 4;
  const threshold = options.threshold ?? 0.01;

  const allowed = options.bones === undefined
    ? frames.filter((frame) => frame.length > 0)
    : frames.filter((frame) => options.bones?.includes(frame.index) === true);
  const chosen = allowed.length > 0 ? allowed : frames.slice();

  const count = positions.length >> 1;
  const table = emptyTable(count);
  if (chosen.length === 0) return table;

  for (let v = 0; v < count; v++) {
    const x = positions[2 * v];
    const y = positions[2 * v + 1];
    const distances = chosen.map((frame) => Math.max(distanceToBone(frame, x, y), NEAR));
    const nearest = Math.max(Math.min(...distances), NEAR);
    const cutoff = nearest * range;
    let sum = 0;
    const raws: number[] = [];
    for (const d of distances) {
      const raw = Math.max(0, Math.pow(cutoff / d, falloff) - 1);
      raws.push(raw);
      sum += raw;
    }
    const vertex = table[v];
    if (sum <= 0) {
      // Every bone sits at the cutoff: give the vertex to the closest one.
      let best = 0;
      for (let i = 1; i < distances.length; i++) if (distances[i] < distances[best]) best = i;
      vertex.set(chosen[best].index, 1);
      continue;
    }
    for (let i = 0; i < raws.length; i++) {
      const w = raws[i] / sum;
      if (w > 0) vertex.set(chosen[i].index, w);
    }
  }

  const pruned = pruneWeights(limitInfluences(table, maxInfluences), threshold);
  normalizeTable(pruned);
  return pruned;
}

// ---------------------------------------------------------------------------
// Brushes (requirement R5)
// ---------------------------------------------------------------------------

export type BrushMode = 'add' | 'subtract' | 'replace' | 'smooth';

export interface BrushOptions {
  mode: BrushMode;
  /** Bone being painted, by index. Ignored by `smooth`. */
  bone: number;
  /** Centre of the brush, in world units. */
  x: number;
  y: number;
  /** Radius of the brush, in world units. */
  radius: number;
  /** How hard the brush presses, `0..1`. */
  strength: number;
  /** Vertices in world space, `2N` numbers. */
  positions: readonly number[];
  /** Value `replace` walks towards. Default `1`. */
  value?: number;
  /** Bones the brush must not change. */
  locked?: ReadonlySet<number>;
  /** Neighbours per vertex, needed by `smooth`. See `neighborsOf`. */
  neighbors?: ReadonlyArray<readonly number[]>;
  /**
   * Só estes vértices — rodada 41, lote 2. Com vértices escolhidos, o pincel
   * do Spine pinta só neles; sem escolha (`undefined`), pinta todos.
   */
  only?: ReadonlySet<number>;
}

/**
 * Weight of the brush at a distance: `(1 - (d/r)^2)^2`, times `strength`.
 *
 * It is 1 at the centre, 0 at the border, and flat at both ends, so a stroke
 * leaves no ring and no step. Outside the radius it is exactly 0.
 */
export function brushFalloff(distance: number, radius: number, strength: number): number {
  if (radius <= 0) return 0;
  const t = distance / radius;
  if (t >= 1) return 0;
  const k = 1 - t * t;
  return k * k * Math.max(0, Math.min(1, strength));
}

/** Which vertices share a triangle with each vertex (for the smooth brush). */
export function neighborsOf(triangles: readonly number[], count: number): number[][] {
  const sets: Array<Set<number>> = [];
  for (let i = 0; i < count; i++) sets.push(new Set());
  for (let t = 0; t + 2 < triangles.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const a = triangles[t + e];
      const b = triangles[t + ((e + 1) % 3)];
      if (a < 0 || b < 0 || a >= count || b >= count) continue;
      sets[a].add(b);
      sets[b].add(a);
    }
  }
  return sets.map((set) => [...set].sort((p, q) => p - q));
}

/**
 * One brush stroke. Returns a new table; the one given is not touched.
 *
 * Every vertex the brush reaches is normalized after the change, with the
 * locked bones kept where they are, so the file never holds a mesh whose
 * weights do not add up to 1.
 */
export function paintWeights(table: WeightTable, options: BrushOptions): WeightTable {
  const out = cloneTable(table);
  const locked = options.locked ?? new Set<number>();
  const count = Math.min(out.length, options.positions.length >> 1);
  const target = options.value ?? 1;

  for (let v = 0; v < count; v++) {
    const dx = options.positions[2 * v] - options.x;
    const dy = options.positions[2 * v + 1] - options.y;
    const f = brushFalloff(Math.hypot(dx, dy), options.radius, options.strength);
    if (f <= 0) continue;
    if (options.only !== undefined && !options.only.has(v)) continue;
    const vertex = out[v];

    if (options.mode === 'smooth') {
      smoothVertex(out, table, v, f, options.neighbors ?? [], locked);
      continue;
    }
    if (locked.has(options.bone)) continue;

    const before = vertex.get(options.bone) ?? 0;
    let after = before;
    if (options.mode === 'add') after = before + f;
    else if (options.mode === 'subtract') after = before - f;
    else after = before + (target - before) * f;
    // A locked bone owns its share: what is left over is all the brush may
    // take, so painting can never quietly steal from a bone the artist froze.
    let lockedSum = 0;
    for (const [other, value] of vertex) if (other !== options.bone && locked.has(other)) lockedSum += value;
    after = Math.max(0, Math.min(1 - lockedSum, after));

    if (after <= 0) vertex.delete(options.bone);
    else vertex.set(options.bone, after);
    balanceVertex(vertex, options.bone, after, locked);
  }
  return out;
}

/**
 * After one bone was set to `weight`, shares the rest of the 1 among the
 * others, in proportion to what they had. A vertex whose other bones are all
 * locked or empty gives the whole vertex to the bone just painted.
 */
function balanceVertex(
  vertex: VertexWeights, bone: number, weight: number, locked: ReadonlySet<number>,
): void {
  let others = 0;
  let lockedSum = 0;
  for (const [other, value] of vertex) {
    if (other === bone) continue;
    if (locked.has(other)) lockedSum += value;
    else others += value;
  }
  const room = 1 - weight - lockedSum;
  if (room <= 0) {
    for (const other of [...vertex.keys()]) {
      if (other !== bone && !locked.has(other)) vertex.delete(other);
    }
    normalizeVertex(vertex, new Set([...locked, bone]));
    return;
  }
  if (others <= 0) {
    if (weight <= 0) return;
    vertex.set(bone, weight + room);
    return;
  }
  const scale = room / others;
  for (const [other, value] of vertex) {
    if (other === bone || locked.has(other)) continue;
    vertex.set(other, value * scale);
  }
}

/** Moves one vertex towards the average of its neighbours, by `f`. */
function smoothVertex(
  out: WeightTable, source: WeightTable, v: number, f: number,
  neighbors: ReadonlyArray<readonly number[]>, locked: ReadonlySet<number>,
): void {
  const around = neighbors[v] ?? [];
  if (around.length === 0) return;
  const average = new Map<number, number>();
  for (const other of around) {
    for (const [bone, weight] of source[other] ?? []) {
      average.set(bone, (average.get(bone) ?? 0) + weight / around.length);
    }
  }
  const vertex = out[v];
  const bones = new Set<number>([...vertex.keys(), ...average.keys()]);
  for (const bone of bones) {
    if (locked.has(bone)) continue;
    const from = vertex.get(bone) ?? 0;
    const to = average.get(bone) ?? 0;
    const value = from + (to - from) * f;
    if (value <= 1e-6) vertex.delete(bone);
    else vertex.set(bone, value);
  }
  normalizeVertex(vertex, locked);
}

/** Smooths every vertex once, with no brush: the "Suavizar" button. */
export function smoothAll(
  table: WeightTable, triangles: readonly number[], strength = 0.5,
  locked: ReadonlySet<number> = new Set(),
): WeightTable {
  const out = cloneTable(table);
  const neighbors = neighborsOf(triangles, table.length);
  const f = Math.max(0, Math.min(1, strength));
  for (let v = 0; v < out.length; v++) smoothVertex(out, table, v, f, neighbors, locked);
  return out;
}

// ---------------------------------------------------------------------------
// The file format: `Binding` (spec 7.4)
// ---------------------------------------------------------------------------

/** World position of every vertex of a binding, `2N` numbers. */
export function bindingWorldPositions(
  binding: BindingDef, frames: readonly BoneFrame[],
): number[] {
  const byIndex = new Map(frames.map((frame) => [frame.index, frame]));
  const out: number[] = [];
  let j = 0;
  for (let v = 0; v < binding.counts.length; v++) {
    let wx = 0;
    let wy = 0;
    for (let k = 0; k < binding.counts[v]; k++, j++) {
      const frame = byIndex.get(binding.bones[j]);
      const px = binding.positions[2 * j];
      const py = binding.positions[2 * j + 1];
      const w = binding.weights[j];
      if (frame === undefined) continue;
      wx += (frame.a * px + frame.b * py + frame.worldX) * w;
      wy += (frame.c * px + frame.d * py + frame.worldY) * w;
    }
    out.push(wx, wy);
  }
  return out;
}

/** The weights of a binding, as a table the brushes can edit. */
export function bindingToTable(binding: BindingDef): WeightTable {
  const table = emptyTable(binding.counts.length);
  let j = 0;
  for (let v = 0; v < binding.counts.length; v++) {
    for (let k = 0; k < binding.counts[v]; k++, j++) {
      const bone = binding.bones[j];
      table[v].set(bone, (table[v].get(bone) ?? 0) + binding.weights[j]);
    }
  }
  return table;
}

/**
 * A `Binding` for vertices given in WORLD space (spec 7.4).
 *
 * Each influence keeps the vertex in ITS OWN bone's local space, which is the
 * inverse of that bone's world matrix applied to the world position. With
 * normalized weights the sum of `w_i * M_i * (M_i^-1 p)` is `p` again, so the
 * mesh does not move when it gains weights — that is the whole reason the
 * format has no bind matrix (7.4).
 */
export function tableToBinding(
  table: WeightTable, positions: readonly number[], frames: readonly BoneFrame[],
): BindingDef {
  const byIndex = new Map(frames.map((frame) => [frame.index, frame]));
  const counts: number[] = [];
  const bones: number[] = [];
  const points: number[] = [];
  const weights: number[] = [];
  const inverse = new Map<number, Matrix2x3>();

  for (let v = 0; v < table.length; v++) {
    // Peso 0 fica (lote 63): é o osso ligado pelo P e ainda não pintado. A
    // §7.4 aceita `0..1`, e sem ele a lista perderia o osso ao gravar.
    const entries = [...table[v]]
      .filter(([bone, weight]) => weight >= 0 && byIndex.has(bone))
      .sort((p, q) => p[0] - q[0]);
    if (entries.length === 0) {
      const fallback = frames[0];
      if (fallback === undefined) throw new Error('o esqueleto não tem ossos');
      entries.push([fallback.index, 1]);
    }
    let sum = 0;
    for (const [, weight] of entries) sum += weight;
    counts.push(entries.length);
    const x = positions[2 * v] ?? 0;
    const y = positions[2 * v + 1] ?? 0;
    for (const [bone, weight] of entries) {
      let inv = inverse.get(bone);
      if (inv === undefined) {
        const frame = byIndex.get(bone);
        if (frame === undefined) continue;
        inv = invertMatrix(frame);
        inverse.set(bone, inv);
      }
      const local = transformPoint(inv, x, y);
      bones.push(bone);
      points.push(local.x, local.y);
      weights.push(sum > 0 ? weight / sum : 1 / entries.length);
    }
  }
  return { counts, bones, positions: points, weights };
}

// ---------------------------------------------------------------------------
// With weights <-> without weights, both ways, without the mesh moving
// ---------------------------------------------------------------------------

/** World position of every vertex of an attachment, `2N` numbers. */
export function worldPositionsOf(
  def: MeshAttachmentDef, frames: readonly BoneFrame[], slotFrame: Matrix2x3,
): number[] {
  if (def.binding !== undefined) return bindingWorldPositions(def.binding, frames);
  const out: number[] = [];
  const vertices = def.vertices ?? [];
  for (let i = 0; i + 1 < vertices.length; i += 2) {
    const p = transformPoint(slotFrame, vertices[i], vertices[i + 1]);
    out.push(p.x, p.y);
  }
  return out;
}

/** World positions of a geometry, whose vertices live in the slot bone space. */
export function geometryWorldPositions(geo: MeshGeometry, slotFrame: Matrix2x3): number[] {
  const out: number[] = [];
  for (let i = 0; i + 1 < geo.vertices.length; i += 2) {
    const p = transformPoint(slotFrame, geo.vertices[i], geo.vertices[i + 1]);
    out.push(p.x, p.y);
  }
  return out;
}

/**
 * The attachment with weights: `vertices` goes away and `binding` takes its
 * place (7.4 allows exactly one of the two). Every vertex stays where it was.
 */
export function bindAttachment(
  def: MeshAttachmentDef, table: WeightTable,
  frames: readonly BoneFrame[], slotFrame: Matrix2x3,
): MeshAttachmentDef {
  const world = worldPositionsOf(def, frames, slotFrame);
  const out: MeshAttachmentDef = { ...def };
  delete out.vertices;
  out.binding = tableToBinding(table, world, frames);
  return out;
}

/**
 * The attachment without weights: `binding` goes away and `vertices` comes
 * back, in the slot bone's local space. Every vertex stays where it was.
 */
export function unbindAttachment(
  def: MeshAttachmentDef, frames: readonly BoneFrame[], slotFrame: Matrix2x3,
): MeshAttachmentDef {
  const world = worldPositionsOf(def, frames, slotFrame);
  const inv = invertMatrix(slotFrame);
  const vertices: number[] = [];
  for (let i = 0; i + 1 < world.length; i += 2) {
    const local = transformPoint(inv, world[i], world[i + 1]);
    vertices.push(local.x, local.y);
  }
  const out: MeshAttachmentDef = { ...def };
  delete out.binding;
  out.vertices = vertices;
  return out;
}

/** The weights of an attachment, or an empty table when it has none. */
export function tableOf(def: MeshAttachmentDef): WeightTable {
  if (def.binding !== undefined) return bindingToTable(def.binding);
  return emptyTable((def.vertices?.length ?? 0) >> 1);
}

/**
 * The attachment with the same shape and NEW weights. A mesh that had none is
 * bound; one that had some keeps every vertex where it is.
 */
export function writeWeights(
  def: MeshAttachmentDef, table: WeightTable,
  frames: readonly BoneFrame[], slotFrame: Matrix2x3,
): MeshAttachmentDef {
  return bindAttachment(def, table, frames, slotFrame);
}

// ---------------------------------------------------------------------------
// O peso exato de um vértice — rodada 41, lote 2 (06/10/2026)
// ---------------------------------------------------------------------------

/**
 * O peso de um osso nos vértices escolhidos: o valor, e se eles discordam.
 *
 * Como a lista **Weights** do Spine: com um vértice escolhido ela mostra o
 * peso de cada osso nele; com vários que diferem, um `*`. A aba mostrava a
 * média da malha inteira, e quem clicava num vértice achava que lia o dele
 * (doc `43`, foto `27`).
 */
export function weightAt(
  table: WeightTable, vertices: readonly number[], bone: number,
): { value: number; mixed: boolean } {
  const valid = vertices.filter((v) => v >= 0 && v < table.length);
  if (valid.length === 0) return { value: 0, mixed: false };
  const values = valid.map((v) => table[v]?.get(bone) ?? 0);
  const first = values[0]!;
  const mixed = values.some((x) => Math.abs(x - first) > 0.005);
  return { value: values.reduce((s, x) => s + x, 0) / values.length, mixed };
}

/**
 * Põe o osso `bone` com peso `value` (`0..1`) nos vértices escolhidos, e
 * reparte o resto entre os outros ossos **na proporção que já tinham** —
 * rodada 41, lote 2. É o campo **Weight** do Spine e o slider do DragonBones.
 *
 * Regras, as mesmas do pincel (`paintWeights`): o osso travado não muda, e o
 * valor nunca passa do que os travados deixam. Se os outros ossos livres
 * estavam todos em zero, o resto vai em partes iguais para os outros ossos da
 * lista (`influencing`); sem nenhum, o vértice fica todo do osso, e ele diz.
 * Devolve uma tabela nova; a de entrada não muda.
 */
export function setWeight(
  table: WeightTable, vertices: readonly number[], bone: number, value: number,
  locked: ReadonlySet<number> = new Set(),
): WeightTable {
  const out = cloneTable(table);
  if (locked.has(bone)) return out;
  const influencing = influencingBones(table);
  const target = Math.max(0, Math.min(1, value));
  for (const v of vertices) {
    const vertex = out[v];
    if (vertex === undefined) continue;
    let lockedSum = 0;
    let freeSum = 0;
    for (const [other, w] of vertex) {
      if (other === bone) continue;
      if (locked.has(other)) lockedSum += w;
      else freeSum += w;
    }
    const mine = Math.min(target, Math.max(0, 1 - lockedSum));
    const room = Math.max(0, 1 - lockedSum - mine);
    vertex.set(bone, mine);
    if (freeSum > 1e-9) {
      for (const [other, w] of [...vertex]) {
        if (other === bone || locked.has(other)) continue;
        vertex.set(other, (w / freeSum) * room);
      }
    } else if (room > 1e-9) {
      const others = influencing.filter((o) => o !== bone && !locked.has(o));
      if (others.length === 0) vertex.set(bone, mine + room);
      else for (const o of others) vertex.set(o, room / others.length);
    }
  }
  return out;
}
