// SPDX-License-Identifier: Apache-2.0
/**
 * Exports a `.bone` skeleton to glTF 2.0 (requisito E6).
 *
 * WHY: glTF is the "JPEG of 3D". A `.bone` that can leave as glTF can be
 * opened by Blender, three.js, Babylon, Godot, Unity and every viewer that
 * reads the Khronos format — without any of them knowing what `.bone` is.
 *
 * WHAT IT PRODUCES
 * ----------------
 * Every bone becomes a node; the whole set becomes one `skin` with `joints`
 * and `inverseBindMatrices`. Every `region`, `mesh` and `linkedmesh` drawn in
 * the setup pose becomes a flat mesh (`z` constant) with `POSITION`,
 * `TEXCOORD_0`, `JOINTS_0` and `WEIGHTS_0`, so it deforms with the joints
 * exactly as spec 7.4 asks. The atlas page becomes the image, and the UVs
 * come out already mapped to the page (spec 10.4), so no importer has to know
 * about the atlas. Animations become `channels` and `samplers` over the node
 * `translation`, `rotation` and `scale`.
 *
 * Output is a `.gltf` with a separate `.bin`, or one `.glb`.
 *
 * WHAT IS LOST (each one becomes a warning, in Portuguese, at export time)
 * -----------------------------------------------------------------------
 * | O que                     | Por quê                                       |
 * |:--------------------------|:----------------------------------------------|
 * | `shearX` / `shearY`       | Um nó glTF é T x R x S. Cisalhamento não cabe. |
 * | Herança (5.3) fora de     | glTF só tem herança completa.                  |
 * | `normal`                  |                                                |
 * | Constraints (6)           | ik, transform, path, physics e driver não       |
 * |                           | existem em glTF. Exporte a pose já resolvida.   |
 * | Ordem de desenho (9.5)    | glTF não tem ordem de desenho; cada attachment  |
 * |                           | recebe um `z` diferente para manter a pilha.    |
 * | `deform` e morphs (9.6, 8.3) | Viraria morph target por quadro; não feito.  |
 * | `darkColor` (7.12)        | Não existe tint black em glTF.                  |
 * | `blend` fora de `normal`  | glTF só tem `OPAQUE`, `MASK` e `BLEND`.         |
 * | Sequências (7.10)         | Troca de imagem por quadro não tem equivalente. |
 * | Esqueleto aninhado (7.11) | Precisaria exportar o filho junto; não feito.   |
 * | Eventos, tags, variáveis  | Não existem em glTF.                            |
 * | Curva Bezier de 9.3       | Só vira CUBICSPLINE quando os pontos de         |
 * |                           | controle em `x` estão em 1/3 e 2/3; nos outros  |
 * |                           | casos a curva é amostrada quadro a quadro.      |
 *
 * The exporter never touches the filesystem and imports nothing from Node, so
 * the same code runs in the editor and on the command line.
 */

import {
  Skeleton, collectDrawables, computeFinalColor, regionOf, sampleCurve,
  REGION_TRIANGLES, RegionAttachment, MeshAttachment, LinkedMeshAttachment,
  type AtlasPageData, type AnimationData, type BlendMode, type BoneData,
  type SkeletonData, type Slot, type CurveData, type NumericKeys,
} from '../../../runtime/src/index.js';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** One atlas page image, ready to be embedded. */
export interface GltfImage {
  /** `page.name` of the atlas page these bytes belong to. */
  page: string;
  /** The encoded file (PNG, JPEG or WebP), as it sits on disk. */
  bytes: Uint8Array;
  /** Default: guessed from the first bytes, falling back to `image/png`. */
  mimeType?: string;
}

export interface ExportGltfOptions {
  /** File name written in `buffers[0].uri` of a `.gltf`. Default `"cena.bin"`. */
  binName?: string;
  /** Animations to export, by name. Default: every animation in the file. */
  animations?: readonly string[];
  /** Skins active while the setup pose is read. Default: only `default`. */
  skins?: readonly string[];
  /** Page images. A page without one becomes a material with no texture. */
  images?: readonly GltfImage[];
  /** Gap along `z` between two drawables, to keep the draw order. Default `0.1`. */
  zStep?: number;
  /** Samples per second when a Bezier curve has to be baked. Default: `skeleton.fps`. */
  bakeFps?: number;
  /** Written in `asset.generator`. */
  generator?: string;
}

export interface GltfStats {
  nodes: number;
  joints: number;
  meshes: number;
  vertices: number;
  triangles: number;
  animations: number;
  images: number;
  /** Total size of the binary buffer, in bytes. */
  binBytes: number;
}

export interface GltfExport {
  /** The glTF JSON tree, ready for `JSON.stringify`. */
  json: Record<string, unknown>;
  /** The single binary buffer: geometry, matrices, animation and images. */
  bin: Uint8Array;
  /** What did not fit, in Portuguese. */
  warnings: string[];
  stats: GltfStats;
}

/** Default gap along `z`, in skeleton units, between two drawables. */
export const DEFAULT_Z_STEP = 0.1;

// glTF constants (they are OpenGL enums; glTF has no names for them).
const COMPONENT_FLOAT = 5126;
const COMPONENT_UNSIGNED_SHORT = 5123;
const COMPONENT_UNSIGNED_INT = 5125;
const TARGET_ARRAY_BUFFER = 34962;
const TARGET_ELEMENT_ARRAY_BUFFER = 34963;

const FILTER_NEAREST = 9728;
const FILTER_LINEAR = 9729;
const FILTER_LINEAR_MIPMAP_LINEAR = 9987;
const WRAP_CLAMP = 33071;
const WRAP_REPEAT = 10497;
const WRAP_MIRROR = 33648;

/** Most influences a glTF `JOINTS_0` can carry without extra sets. */
const MAX_INFLUENCES = 4;

// ---------------------------------------------------------------------------
// Binary buffer builder
// ---------------------------------------------------------------------------

/**
 * Collects the bytes of the single glTF buffer and hands out bufferView and
 * accessor indices. Every view starts on a multiple of 4, which satisfies the
 * alignment rule of the glTF spec for every component type we write.
 */
class BinBuilder {
  private readonly chunks: Uint8Array[] = [];
  private length = 0;
  readonly bufferViews: Record<string, unknown>[] = [];
  readonly accessors: Record<string, unknown>[] = [];

  private pad(): void {
    const rest = this.length % 4;
    if (rest === 0) return;
    const fill = new Uint8Array(4 - rest);
    this.chunks.push(fill);
    this.length += fill.length;
  }

  /** Appends raw bytes as one bufferView and returns its index. */
  addView(bytes: Uint8Array, target?: number): number {
    this.pad();
    const view: Record<string, unknown> = {
      buffer: 0, byteOffset: this.length, byteLength: bytes.length,
    };
    if (target !== undefined) view.target = target;
    this.chunks.push(bytes);
    this.length += bytes.length;
    this.bufferViews.push(view);
    return this.bufferViews.length - 1;
  }

  /**
   * Appends one accessor and its bufferView. `min` and `max` are always
   * written: the glTF spec requires them for `POSITION` and for animation
   * inputs, and they are legal everywhere else.
   */
  addAccessor(
    values: Float32Array | Uint16Array | Uint32Array,
    type: 'SCALAR' | 'VEC2' | 'VEC3' | 'VEC4' | 'MAT4',
    options: { target?: number; name?: string } = {},
  ): number {
    const size = COMPONENTS_PER_TYPE[type];
    const count = values.length / size;
    const componentType = values instanceof Float32Array ? COMPONENT_FLOAT
      : values instanceof Uint16Array ? COMPONENT_UNSIGNED_SHORT : COMPONENT_UNSIGNED_INT;
    const bytes = new Uint8Array(values.buffer, values.byteOffset, values.byteLength);
    const view = this.addView(bytes.slice(), options.target);
    const min = new Array<number>(size).fill(Number.POSITIVE_INFINITY);
    const max = new Array<number>(size).fill(Number.NEGATIVE_INFINITY);
    for (let i = 0; i < values.length; i++) {
      const j = i % size;
      const v = values[i];
      if (v < min[j]) min[j] = v;
      if (v > max[j]) max[j] = v;
    }
    if (count === 0) {
      min.fill(0);
      max.fill(0);
    }
    const accessor: Record<string, unknown> = {
      bufferView: view, componentType, count, type, min, max,
    };
    if (options.name !== undefined) accessor.name = options.name;
    this.accessors.push(accessor);
    return this.accessors.length - 1;
  }

  /** The whole buffer, padded to a multiple of 4 (the GLB chunk rule). */
  finish(): Uint8Array {
    this.pad();
    const out = new Uint8Array(this.length);
    let at = 0;
    for (const chunk of this.chunks) {
      out.set(chunk, at);
      at += chunk.length;
    }
    return out;
  }

  get byteLength(): number {
    return this.length;
  }
}

const COMPONENTS_PER_TYPE: Record<string, number> = {
  SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16,
};

// ---------------------------------------------------------------------------
// Small maths
// ---------------------------------------------------------------------------

/** Quaternion of a rotation of `degrees` around `+z`, in glTF order `[x, y, z, w]`. */
export function quaternionZ(degrees: number): [number, number, number, number] {
  const half = (degrees * Math.PI) / 360;
  return [0, 0, Math.sin(half), Math.cos(half)];
}

/**
 * The 2x3 world matrix of a bone as a glTF 4x4, column-major:
 * `[a c 0 0, b d 0 0, 0 0 1 0, worldX worldY 0 1]`.
 */
export function boneMatrix4(m: { a: number; b: number; c: number; d: number; worldX: number; worldY: number }): number[] {
  return [
    m.a, m.c, 0, 0,
    m.b, m.d, 0, 0,
    0, 0, 1, 0,
    m.worldX, m.worldY, 0, 1,
  ];
}

/**
 * Inverse of {@link boneMatrix4}: the `inverseBindMatrix` of a joint.
 * A singular matrix (`det = 0`, a bone scaled to nothing) comes back as the
 * identity, which is the only choice that does not produce NaN vertices.
 */
export function inverseBindMatrix4(m: { a: number; b: number; c: number; d: number; worldX: number; worldY: number }): number[] {
  const det = m.a * m.d - m.b * m.c;
  if (det === 0 || !Number.isFinite(det)) {
    return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  }
  const ia = m.d / det;
  const ib = -m.b / det;
  const ic = -m.c / det;
  const id = m.a / det;
  const tx = -(ia * m.worldX + ib * m.worldY);
  const ty = -(ic * m.worldX + id * m.worldY);
  return [
    ia, ic, 0, 0,
    ib, id, 0, 0,
    0, 0, 1, 0,
    tx, ty, 0, 1,
  ];
}

// ---------------------------------------------------------------------------
// Textures
// ---------------------------------------------------------------------------

/** MIME type of an encoded image, by its first bytes. */
export function imageMimeType(bytes: Uint8Array): string {
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return 'image/png';
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';
  if (bytes.length >= 12
    && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
    && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) {
    return 'image/webp';
  }
  return 'image/png';
}

function magFilterOf(page: AtlasPageData): number {
  return page.magFilter === 'nearest' ? FILTER_NEAREST : FILTER_LINEAR;
}

function minFilterOf(page: AtlasPageData): number {
  if (page.minFilter === 'nearest') return FILTER_NEAREST;
  if (page.minFilter === 'mipmap') return FILTER_LINEAR_MIPMAP_LINEAR;
  return FILTER_LINEAR;
}

function wrapOf(wrap: string): number {
  if (wrap === 'repeat') return WRAP_REPEAT;
  if (wrap === 'mirror') return WRAP_MIRROR;
  return WRAP_CLAMP;
}

// ---------------------------------------------------------------------------
// Geometry of one drawable
// ---------------------------------------------------------------------------

/** One drawable turned into glTF vertex arrays, still without a material. */
interface Primitive {
  name: string;
  /** `3N`: the setup-pose world position of each vertex, with `z` per draw order. */
  positions: Float32Array;
  /** `2N`: page UVs (spec 10.4), `v` down — the glTF convention. */
  uvs: Float32Array;
  joints: Uint16Array;
  weights: Float32Array;
  indices: Uint32Array;
  page: AtlasPageData | null;
  /** `light` of spec 7.12, as `baseColorFactor`. */
  color: [number, number, number, number];
  blend: BlendMode;
}

/**
 * Reads one drawable in the setup pose and writes it as glTF vertex arrays.
 *
 * `POSITION` is the SETUP-POSE WORLD position, and the `inverseBindMatrix` of
 * every joint is the inverse of its setup-pose world matrix. With that pair,
 * glTF skinning (`sum w_k x node_k x IBM_k x P`) reproduces the `worldVertices`
 * of spec 7.4 exactly whenever the influences of a vertex agree at setup —
 * which is what an editor writes. When they do not, `warn` is called once.
 */
function buildPrimitive(
  slot: Slot, attachment: RegionAttachment | MeshAttachment | LinkedMeshAttachment,
  z: number, warn: (message: string) => void,
): Primitive {
  const isRegion = attachment instanceof RegionAttachment;
  const vertexCount = isRegion ? 4 : attachment.vertexCount;
  const world = new Float64Array(vertexCount * 2);
  attachment.computeWorldVertices(slot, world, 0, 2);
  const uvSource = isRegion ? attachment.uvsFor(slot) : attachment.regionUVsFor(slot);
  const triangles = isRegion ? REGION_TRIANGLES : attachment.triangles;

  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 2);
  const joints = new Uint16Array(vertexCount * 4);
  const weights = new Float32Array(vertexCount * 4);

  for (let v = 0; v < vertexCount; v++) {
    positions[v * 3] = world[v * 2];
    positions[v * 3 + 1] = world[v * 2 + 1];
    positions[v * 3 + 2] = z;
    uvs[v * 2] = uvSource[v * 2];
    uvs[v * 2 + 1] = uvSource[v * 2 + 1];
  }

  const binding = isRegion ? null : attachment.binding;
  if (binding === null) {
    // Unweighted: the whole attachment rides the slot bone (spec 7.3, 7.4).
    const joint = slot.bone.data.index;
    for (let v = 0; v < vertexCount; v++) {
      joints[v * 4] = joint;
      weights[v * 4] = 1;
    }
  } else {
    const bones = slot.skeleton.bones;
    let influence = 0;
    for (let v = 0; v < vertexCount; v++) {
      const count = binding.counts[v];
      const picked: { bone: number; weight: number; x: number; y: number }[] = [];
      for (let k = 0; k < count; k++, influence++) {
        picked.push({
          bone: binding.bones[influence],
          weight: binding.weights[influence],
          x: binding.positions[influence * 2],
          y: binding.positions[influence * 2 + 1],
        });
      }
      if (picked.length > MAX_INFLUENCES) {
        warn(`O attachment "${attachment.name}" tem vértice com ${picked.length} influências; glTF guarda ${MAX_INFLUENCES}. Fiquei com as maiores.`);
        picked.sort((a, b) => b.weight - a.weight);
        picked.length = MAX_INFLUENCES;
      }
      let sum = 0;
      for (let k = 0; k < picked.length; k++) {
        joints[v * 4 + k] = picked[k].bone;
        weights[v * 4 + k] = picked[k].weight;
        sum += picked[k].weight;
      }
      if (Math.abs(sum - 1) > 1e-3) {
        warn(`O attachment "${attachment.name}" tem vértice com pesos somando ${sum.toFixed(3)}; glTF espera 1. Deixei como está.`);
      }
      // The single POSITION only works when every influence agrees at setup.
      for (const p of picked) {
        const bone = bones[p.bone];
        const wx = bone.a * p.x + bone.b * p.y + bone.worldX;
        const wy = bone.c * p.x + bone.d * p.y + bone.worldY;
        if (Math.abs(wx - world[v * 2]) > 0.5 || Math.abs(wy - world[v * 2 + 1]) > 0.5) {
          warn(`O attachment "${attachment.name}" tem vértice cujas influências não coincidem no setup; em glTF ele fica na média ponderada.`);
          break;
        }
      }
    }
  }

  const indices = new Uint32Array(triangles.length);
  for (let i = 0; i < triangles.length; i++) indices[i] = triangles[i];

  const final = computeFinalColor(slot, attachment);
  return {
    name: `${slot.data.name}/${attachment.name}`,
    positions, uvs, joints, weights, indices,
    page: regionOf(slot, attachment)?.page ?? null,
    color: [final.light[0], final.light[1], final.light[2], final.light[3]],
    blend: slot.blend,
  };
}

// ---------------------------------------------------------------------------
// Animation samplers
// ---------------------------------------------------------------------------

/** How a group of key times will be written out. */
type Interpolation = 'STEP' | 'LINEAR' | 'CUBICSPLINE';

/** One node property that an animation writes. */
interface Channel {
  node: number;
  path: 'translation' | 'rotation' | 'scale';
  interpolation: Interpolation;
  times: number[];
  /** `3` per key for translation and scale, `4` for rotation; `x3` for CUBICSPLINE. */
  values: number[];
}

/** `true` when every segment of every component uses `kind`. */
function everyCurveIs(curves: readonly CurveData[], kind: string, keyCount: number): boolean {
  for (let i = 0; i + 1 < keyCount; i++) if (curves[i].kind !== kind) return false;
  return true;
}

/**
 * `true` when every Bezier segment is a cubic Hermite in disguise: the two
 * control points sit exactly on 1/3 and 2/3 of the segment in TIME. Only then
 * can glTF's CUBICSPLINE reproduce the curve of spec 9.3 without sampling.
 */
function isHermiteBezier(keys: NumericKeys, tolerance = 1e-4): boolean {
  const times = keys.times;
  const c = keys.components;
  for (let i = 0; i + 1 < times.length; i++) {
    const curve = keys.curves[i];
    if (curve.kind === 'linear') continue;
    if (curve.kind !== 'bezier' || curve.controls === null) return false;
    const t0 = times[i];
    const t1 = times[i + 1];
    const span = t1 - t0;
    if (span <= 0) return false;
    for (let j = 0; j < c; j++) {
      const cx1 = curve.controls[j * 4];
      const cx2 = curve.controls[j * 4 + 2];
      if (Math.abs(cx1 - (t0 + span / 3)) > tolerance * Math.max(1, span)) return false;
      if (Math.abs(cx2 - (t0 + (2 * span) / 3)) > tolerance * Math.max(1, span)) return false;
    }
  }
  return true;
}

/** Value of component `j` of `keys` at `t`, following the spec 9.10 edge rules. */
function valueAt(keys: NumericKeys, t: number, j: number): number {
  const times = keys.times;
  const n = times.length;
  if (n === 0) return 0;
  const c = keys.components;
  if (t <= times[0]) return keys.values[j];
  if (t >= times[n - 1]) return keys.values[(n - 1) * c + j];
  let i = 0;
  while (i + 1 < n && times[i + 1] <= t) i++;
  return sampleCurve(keys.curves[i], j, times[i], times[i + 1], keys.values[i * c + j], keys.values[(i + 1) * c + j], t);
}

/** Sample times: the union of every key time of `parts`, in order. */
function unionTimes(parts: readonly (NumericKeys | null)[]): number[] {
  const set = new Set<number>();
  for (const p of parts) {
    if (p === null) continue;
    for (const t of p.times) set.add(t);
  }
  return [...set].sort((a, b) => a - b);
}

/** Times of a baked sampler: `fps` per second from 0 to `duration`, plus every key time. */
function bakedTimes(parts: readonly (NumericKeys | null)[], duration: number, fps: number): number[] {
  const step = fps > 0 ? 1 / fps : 1 / 30;
  const set = new Set<number>();
  for (let t = 0; t < duration; t += step) set.add(Math.round(t * 1e6) / 1e6);
  set.add(duration);
  for (const p of parts) {
    if (p === null) continue;
    for (const t of p.times) set.add(t);
  }
  return [...set].sort((a, b) => a - b);
}

/** One animated component: its keys (or `null` = never animated) and its setup value. */
interface Part {
  keys: NumericKeys | null;
  setup: number;
}

/** `true` when every animated component of `parts` keys at exactly the same times. */
function shareTimes(parts: readonly Part[]): boolean {
  let first: Float64Array | null = null;
  for (const p of parts) {
    if (p.keys === null) continue;
    if (first === null) {
      first = p.keys.times;
      continue;
    }
    if (first.length !== p.keys.times.length) return false;
    for (let i = 0; i < first.length; i++) if (first[i] !== p.keys.times[i]) return false;
  }
  return first !== null;
}

/**
 * Tangents of one segment, as glTF CUBICSPLINE wants them (derivative with
 * respect to TIME). A linear segment gets the straight slope; a Hermite
 * Bezier gets `3 x (cy1 - v0) / span` out and `3 x (v1 - cy2) / span` in
 * (spec 9.3 with the control points at 1/3 and 2/3).
 */
function segmentTangents(keys: NumericKeys, i: number, j: number): { out: number; in: number } {
  const c = keys.components;
  const t0 = keys.times[i];
  const t1 = keys.times[i + 1];
  const span = t1 - t0;
  const v0 = keys.values[i * c + j];
  const v1 = keys.values[(i + 1) * c + j];
  if (span <= 0) return { out: 0, in: 0 };
  const curve = keys.curves[i];
  if (curve.kind !== 'bezier' || curve.controls === null) {
    const slope = (v1 - v0) / span;
    return { out: slope, in: slope };
  }
  return {
    out: (3 * (curve.controls[j * 4 + 1] - v0)) / span,
    in: (3 * (v1 - curve.controls[j * 4 + 3])) / span,
  };
}

/**
 * Builds one glTF channel for `path` out of the component timelines.
 *
 * The interpolation is chosen so nothing is invented:
 *   - every segment stepped                      -> `STEP`
 *   - every segment linear                       -> `LINEAR`
 *   - every segment a Hermite Bezier, same times -> `CUBICSPLINE` (exact)
 *   - anything else                              -> baked at `fps`, `LINEAR`
 */
function buildChannel(
  node: number,
  path: 'translation' | 'scale',
  parts: readonly Part[],
  duration: number,
  fps: number,
): Channel | null {
  if (parts.every((p) => p.keys === null)) return null;
  const keysOnly = parts.map((p) => p.keys);
  const animated = parts.filter((p) => p.keys !== null).map((p) => p.keys!);

  const allStepped = animated.every((k) => everyCurveIs(k.curves, 'stepped', k.times.length));
  const allLinear = animated.every((k) => everyCurveIs(k.curves, 'linear', k.times.length));
  const hermite = shareTimes(parts) && animated.every((k) => isHermiteBezier(k))
    && animated.some((k) => !everyCurveIs(k.curves, 'linear', k.times.length));

  const value = (p: Part, t: number): number => (p.keys === null ? p.setup : valueAt(p.keys, t, 0));

  if (allStepped || allLinear) {
    const times = unionTimes(keysOnly);
    const values: number[] = [];
    for (const t of times) {
      values.push(value(parts[0], t), value(parts[1], t), path === 'scale' ? 1 : 0);
    }
    return { node, path, interpolation: allStepped ? 'STEP' : 'LINEAR', times, values };
  }

  if (hermite) {
    const times = [...animated[0].times];
    const values: number[] = [];
    for (let i = 0; i < times.length; i++) {
      const inT: number[] = [];
      const mid: number[] = [];
      const outT: number[] = [];
      for (let j = 0; j < 2; j++) {
        const p = parts[j];
        mid.push(value(p, times[i]));
        if (p.keys === null) {
          inT.push(0);
          outT.push(0);
          continue;
        }
        inT.push(i === 0 ? 0 : segmentTangents(p.keys, i - 1, 0).in);
        outT.push(i + 1 < times.length ? segmentTangents(p.keys, i, 0).out : 0);
      }
      // The third axis never moves: a `.bone` skeleton is flat.
      inT.push(0);
      mid.push(path === 'scale' ? 1 : 0);
      outT.push(0);
      values.push(...inT, ...mid, ...outT);
    }
    return { node, path, interpolation: 'CUBICSPLINE', times, values };
  }

  const times = bakedTimes(keysOnly, duration, fps);
  const values: number[] = [];
  for (const t of times) {
    values.push(value(parts[0], t), value(parts[1], t), path === 'scale' ? 1 : 0);
  }
  return { node, path, interpolation: 'LINEAR', times, values };
}

/**
 * Rotation channel. Degrees become a quaternion around `+z`, so glTF's
 * spherical interpolation is exactly the linear interpolation of the angle —
 * as long as no segment turns 180 degrees or more, which would make the
 * shorter arc go the wrong way. Such a segment is baked instead.
 */
function buildRotationChannel(node: number, keys: NumericKeys, duration: number, fps: number): Channel {
  const stepped = everyCurveIs(keys.curves, 'stepped', keys.times.length);
  const linear = everyCurveIs(keys.curves, 'linear', keys.times.length);
  let bigTurn = false;
  for (let i = 0; i + 1 < keys.times.length; i++) {
    if (Math.abs(keys.values[i + 1] - keys.values[i]) >= 180) bigTurn = true;
  }

  const times = stepped || (linear && !bigTurn)
    ? [...keys.times]
    : bakedTimes([keys], duration, fps);
  const values: number[] = [];
  for (const t of times) values.push(...quaternionZ(valueAt(keys, t, 0)));
  return { node, path: 'rotation', interpolation: stepped ? 'STEP' : 'LINEAR', times, values };
}

// ---------------------------------------------------------------------------
// The export itself
// ---------------------------------------------------------------------------

/**
 * Turns a loaded `.bone` into a glTF 2.0 tree plus its binary buffer.
 *
 * The skeleton is read in the SETUP POSE: that is the bind pose of the skin,
 * and the one every `inverseBindMatrix` is built from.
 */
export function exportGltf(data: SkeletonData, options: ExportGltfOptions = {}): GltfExport {
  const warnings: string[] = [];
  const warn = (message: string): void => {
    if (!warnings.includes(message)) warnings.push(message);
  };

  const skeleton = new Skeleton(data);
  if (options.skins !== undefined && options.skins.length > 0) {
    try {
      skeleton.setSkin([...options.skins]);
    } catch (error) {
      warn(`Não achei uma das skins pedidas: ${(error as Error).message}`);
    }
  }
  // The bind pose is the SETUP POSE OF THE FILE (spec 5.1), with no constraint
  // applied. It has to be: a glTF node is `translation x rotation x scale` and
  // nothing else, so the only world matrix a viewer can rebuild from the nodes
  // is the one the file writes. Letting a constraint move the bind pose would
  // make every `inverseBindMatrix` disagree with the node it belongs to, and
  // the mesh would come out deformed the moment it loads.
  for (const constraint of skeleton.constraints) constraint.active = false;
  if (data.constraints.length > 0) {
    warn(`Este esqueleto tem ${data.constraints.length} constraint(s) (6). glTF não tem constraints: o glTF sai com a pose de setup crua, sem ik, transform, path, physics nem driver.`);
  }
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform(0);

  const bin = new BinBuilder();
  const zStep = options.zStep ?? DEFAULT_Z_STEP;
  const fps = options.bakeFps ?? (data.meta.fps > 0 ? data.meta.fps : 30);

  // -- nodes: one per bone, in file order, so a joint index IS a node index --
  const nodes: Record<string, unknown>[] = [];
  for (const bone of data.bones) {
    const node: Record<string, unknown> = { name: bone.name };
    if (bone.x !== 0 || bone.y !== 0) node.translation = [bone.x, bone.y, 0];
    if (bone.rotation !== 0) node.rotation = quaternionZ(bone.rotation);
    if (bone.scaleX !== 1 || bone.scaleY !== 1) node.scale = [bone.scaleX, bone.scaleY, 1];
    nodes.push(node);
    if (bone.shearX !== 0 || bone.shearY !== 0) {
      warn(`O osso "${bone.name}" usa cisalhamento (5.4). Um nó glTF é só translação, rotação e escala: o cisalhamento se perde.`);
    }
    if (!bone.inheritRotation || !bone.inheritScale || !bone.inheritReflection) {
      warn(`O osso "${bone.name}" não herda tudo do pai (5.3). glTF só tem herança completa: o resultado vai diferir.`);
    }
  }
  const rootBones: number[] = [];
  for (const bone of data.bones) {
    if (bone.parent === null) {
      rootBones.push(bone.index);
      continue;
    }
    const parent = nodes[bone.parent.index];
    const children = (parent.children as number[] | undefined) ?? [];
    children.push(bone.index);
    parent.children = children;
  }

  // -- inverse bind matrices: the inverse of each setup-pose world matrix ----
  const ibm = new Float32Array(data.bones.length * 16);
  for (let i = 0; i < skeleton.bones.length; i++) {
    ibm.set(inverseBindMatrix4(skeleton.bones[i]), i * 16);
  }
  const ibmAccessor = bin.addAccessor(ibm, 'MAT4', { name: 'inverseBindMatrices' });

  // -- geometry --------------------------------------------------------------
  const primitives: Primitive[] = [];
  let order = 0;
  for (const drawable of collectDrawables(skeleton)) {
    const attachment = drawable.attachment;
    if (attachment.type === 'skeleton') {
      warn(`O slot "${drawable.slot.data.name}" tem um esqueleto aninhado (7.11); ele não entra no glTF.`);
      continue;
    }
    if (drawable.clip !== null) {
      warn(`O slot "${drawable.slot.data.name}" é recortado por uma máscara (7.7); glTF não tem recorte, o desenho sai inteiro.`);
    }
    if (attachment instanceof RegionAttachment || attachment instanceof MeshAttachment
      || attachment instanceof LinkedMeshAttachment) {
      if (attachment.sequence !== null) {
        warn(`O attachment "${attachment.name}" é uma sequência (7.10); só o quadro do setup vai para o glTF.`);
      }
      primitives.push(buildPrimitive(drawable.slot, attachment, order * zStep, warn));
      order++;
    }
  }

  // -- images, samplers, textures, materials ---------------------------------
  const imageBytes = new Map<string, GltfImage>();
  for (const image of options.images ?? []) imageBytes.set(image.page, image);

  const images: Record<string, unknown>[] = [];
  const samplers: Record<string, unknown>[] = [];
  const textures: Record<string, unknown>[] = [];
  const textureByPage = new Map<string, number>();

  const textureFor = (page: AtlasPageData): number | null => {
    const known = textureByPage.get(page.name);
    if (known !== undefined) return known;
    const file = imageBytes.get(page.name);
    if (file === undefined) {
      warn(`A página de atlas "${page.name}" não foi passada; esse material sai sem textura.`);
      textureByPage.set(page.name, -1);
      return null;
    }
    if (page.premultiplied) {
      warn(`A página "${page.name}" está com alfa pré-multiplicado; glTF espera alfa reto, então a cor sai escura nas bordas.`);
    }
    const view = bin.addView(file.bytes.slice());
    images.push({
      name: page.name,
      bufferView: view,
      mimeType: file.mimeType ?? imageMimeType(file.bytes),
    });
    samplers.push({
      magFilter: magFilterOf(page), minFilter: minFilterOf(page),
      wrapS: wrapOf(page.wrapU), wrapT: wrapOf(page.wrapV),
    });
    textures.push({ name: page.name, source: images.length - 1, sampler: samplers.length - 1 });
    const index = textures.length - 1;
    textureByPage.set(page.name, index);
    return index;
  };

  const materials: Record<string, unknown>[] = [];
  const materialByKey = new Map<string, number>();
  const materialFor = (primitive: Primitive): number => {
    const c = primitive.color;
    const key = `${primitive.page?.name ?? ''}|${c.join(',')}|${primitive.blend}`;
    const known = materialByKey.get(key);
    if (known !== undefined) return known;
    if (primitive.blend !== 'normal') {
      warn(`O slot de "${primitive.name}" usa blend "${primitive.blend}" (7.12); glTF só tem o normal, então ele sai como normal.`);
    }
    const texture = primitive.page === null ? null : textureFor(primitive.page);
    const pbr: Record<string, unknown> = {
      baseColorFactor: [c[0], c[1], c[2], c[3]],
      metallicFactor: 0,
      roughnessFactor: 1,
    };
    if (texture !== null && texture >= 0) pbr.baseColorTexture = { index: texture };
    materials.push({
      name: primitive.name,
      pbrMetallicRoughness: pbr,
      alphaMode: 'BLEND',
      doubleSided: true,
    });
    const index = materials.length - 1;
    materialByKey.set(key, index);
    return index;
  };

  // -- meshes and their nodes ------------------------------------------------
  const meshes: Record<string, unknown>[] = [];
  const meshNodes: number[] = [];
  let vertices = 0;
  let triangles = 0;
  for (const primitive of primitives) {
    const attributes = {
      POSITION: bin.addAccessor(primitive.positions, 'VEC3', { target: TARGET_ARRAY_BUFFER, name: `${primitive.name}/POSITION` }),
      TEXCOORD_0: bin.addAccessor(primitive.uvs, 'VEC2', { target: TARGET_ARRAY_BUFFER }),
      JOINTS_0: bin.addAccessor(primitive.joints, 'VEC4', { target: TARGET_ARRAY_BUFFER }),
      WEIGHTS_0: bin.addAccessor(primitive.weights, 'VEC4', { target: TARGET_ARRAY_BUFFER }),
    };
    const indices = bin.addAccessor(primitive.indices, 'SCALAR', { target: TARGET_ELEMENT_ARRAY_BUFFER });
    meshes.push({
      name: primitive.name,
      primitives: [{ attributes, indices, material: materialFor(primitive), mode: 4 }],
    });
    // Spec of glTF: the transform of a skinned mesh node is ignored, so the
    // node carries nothing but the mesh and the skin.
    nodes.push({ name: primitive.name, mesh: meshes.length - 1, skin: 0 });
    meshNodes.push(nodes.length - 1);
    vertices += primitive.positions.length / 3;
    triangles += primitive.indices.length / 3;
  }

  // -- the scene root --------------------------------------------------------
  nodes.push({
    name: data.meta.name ?? 'esqueleto',
    children: [...rootBones, ...meshNodes],
  });
  const rootNode = nodes.length - 1;

  // -- animations ------------------------------------------------------------
  const wanted = options.animations;
  const chosen = data.animations.filter((a) => wanted === undefined || wanted.includes(a.name));
  if (wanted !== undefined) {
    for (const name of wanted) {
      if (!data.animations.some((a) => a.name === name)) warn(`A animação "${name}" não existe neste arquivo.`);
    }
  }
  const animations: Record<string, unknown>[] = [];
  for (const animation of chosen) {
    const built = buildAnimation(animation, data, bin, fps, warn);
    if (built !== null) animations.push(built);
  }

  // -- assembly --------------------------------------------------------------
  const skin: Record<string, unknown> = {
    name: data.meta.name ?? 'esqueleto',
    joints: data.bones.map((b) => b.index),
    inverseBindMatrices: ibmAccessor,
  };
  if (rootBones.length > 0) skin.skeleton = rootBones[0];

  const binBytes = bin.finish();
  const buffer: Record<string, unknown> = { byteLength: binBytes.length };
  if (options.binName !== undefined) buffer.uri = options.binName;

  const json: Record<string, unknown> = {
    asset: {
      version: '2.0',
      generator: options.generator ?? `Recorte — exportador glTF do formato .bone ${data.header.version}`,
    },
    scene: 0,
    scenes: [{ name: data.meta.name ?? 'esqueleto', nodes: [rootNode] }],
    nodes,
    skins: [skin],
    meshes,
    materials,
    accessors: bin.accessors,
    bufferViews: bin.bufferViews,
    buffers: [buffer],
    extras: {
      formato: 'bone',
      versao: data.header.version,
      esqueleto: data.meta.name,
      perdas: warnings,
    },
  };
  if (images.length > 0) {
    json.images = images;
    json.samplers = samplers;
    json.textures = textures;
  }
  if (animations.length > 0) json.animations = animations;

  return {
    json,
    bin: binBytes,
    warnings,
    stats: {
      nodes: nodes.length,
      joints: data.bones.length,
      meshes: meshes.length,
      vertices,
      triangles,
      animations: animations.length,
      images: images.length,
      binBytes: binBytes.length,
    },
  };
}

/** One animation as glTF `samplers` + `channels`, or `null` when nothing moves. */
function buildAnimation(
  animation: AnimationData, data: SkeletonData, bin: BinBuilder, fps: number,
  warn: (message: string) => void,
): Record<string, unknown> | null {
  // Per bone, the numeric timelines that a glTF node can carry.
  const byBone = new Map<BoneData, Map<string, NumericKeys>>();
  for (const timeline of animation.timelines) {
    if (timeline.kind === 'bone.number') {
      if (timeline.property === 'shearX' || timeline.property === 'shearY') {
        warn(`A animação "${animation.name}" anima cisalhamento do osso "${timeline.bone.name}"; glTF não guarda isso.`);
        continue;
      }
      let map = byBone.get(timeline.bone);
      if (map === undefined) {
        map = new Map();
        byBone.set(timeline.bone, map);
      }
      map.set(timeline.property, timeline.keys);
      continue;
    }
    warnUnexportableTimeline(animation.name, timeline.kind, warn);
  }

  const channels: Record<string, unknown>[] = [];
  const samplers: Record<string, unknown>[] = [];
  const push = (channel: Channel): void => {
    const times = Float32Array.from(channel.times);
    const values = Float32Array.from(channel.values);
    samplers.push({
      input: bin.addAccessor(times, 'SCALAR'),
      output: bin.addAccessor(values, channel.path === 'rotation' ? 'VEC4' : 'VEC3'),
      interpolation: channel.interpolation,
    });
    channels.push({ sampler: samplers.length - 1, target: { node: channel.node, path: channel.path } });
  };

  for (const [bone, map] of byBone) {
    const translation = buildChannel(bone.index, 'translation', [
      { keys: map.get('x') ?? null, setup: bone.x },
      { keys: map.get('y') ?? null, setup: bone.y },
    ], animation.duration, fps);
    if (translation !== null) push(translation);

    const scale = buildChannel(bone.index, 'scale', [
      { keys: map.get('scaleX') ?? null, setup: bone.scaleX },
      { keys: map.get('scaleY') ?? null, setup: bone.scaleY },
    ], animation.duration, fps);
    if (scale !== null) push(scale);

    const rotation = map.get('rotation');
    if (rotation !== undefined) push(buildRotationChannel(bone.index, rotation, animation.duration, fps));
  }

  if (channels.length === 0) return null;
  return { name: animation.name, samplers, channels };
}

/** One warning per timeline kind glTF has no place for. */
function warnUnexportableTimeline(animation: string, kind: string, warn: (message: string) => void): void {
  const reason: Record<string, string> = {
    'bone.inherit': 'herança de osso (5.3)',
    'bone.parent': 'troca de pai (9.4)',
    'slot.attachment': 'troca de attachment (9.5)',
    'slot.color': 'cor de slot (7.12)',
    'slot.darkColor': 'tint black (7.12)',
    'slot.visible': 'visibilidade de slot (9.5)',
    drawOrder: 'ordem de desenho (9.5)',
    deform: 'deform de malha (9.6)',
    sequence: 'sequência de imagens (7.10)',
    event: 'eventos (8.6)',
    'constraint.number': 'constraints (6)',
    'constraint.boolean': 'constraints (6)',
    'constraint.reset': 'constraints (6)',
    parameter: 'parâmetros (8.1)',
    morph: 'morph targets (8.3)',
    'variable.number': 'variáveis (8.4)',
    'variable.stepped': 'variáveis (8.4)',
    tag: 'tags (8.5)',
    'nested.animation': 'esqueleto aninhado (7.11)',
    'nested.number': 'esqueleto aninhado (7.11)',
  };
  const what = reason[kind];
  if (what === undefined) return;
  warn(`A animação "${animation}" usa ${what}; glTF não tem equivalente, essa parte não é exportada.`);
}

// ---------------------------------------------------------------------------
// Writing the two shapes: `.gltf` + `.bin`, and `.glb`
// ---------------------------------------------------------------------------

/** The `.gltf` text, with `buffers[0].uri` pointing at the `.bin`. */
export function gltfJsonText(result: GltfExport, binName: string): string {
  const json = { ...result.json };
  json.buffers = [{ uri: binName, byteLength: result.bin.length }];
  return JSON.stringify(json, null, 2);
}

const GLB_MAGIC = 0x46546c67;
const GLB_CHUNK_JSON = 0x4e4f534a;
const GLB_CHUNK_BIN = 0x004e4942;

/**
 * The same export as one `.glb` file: header, the JSON chunk padded with
 * spaces, then the BIN chunk padded with zeros (glTF 2.0, section 4.4.3).
 */
export function gltfToGlb(result: GltfExport): Uint8Array {
  const json = { ...result.json };
  json.buffers = [{ byteLength: result.bin.length }];
  const jsonBytes = new TextEncoder().encode(JSON.stringify(json));
  const jsonPadded = padTo4(jsonBytes, 0x20);
  const binPadded = padTo4(result.bin, 0x00);

  const total = 12 + 8 + jsonPadded.length + (binPadded.length > 0 ? 8 + binPadded.length : 0);
  const out = new Uint8Array(total);
  const view = new DataView(out.buffer);
  view.setUint32(0, GLB_MAGIC, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, total, true);
  view.setUint32(12, jsonPadded.length, true);
  view.setUint32(16, GLB_CHUNK_JSON, true);
  out.set(jsonPadded, 20);
  if (binPadded.length > 0) {
    const at = 20 + jsonPadded.length;
    view.setUint32(at, binPadded.length, true);
    view.setUint32(at + 4, GLB_CHUNK_BIN, true);
    out.set(binPadded, at + 8);
  }
  return out;
}

function padTo4(bytes: Uint8Array, fill: number): Uint8Array {
  const rest = bytes.length % 4;
  if (rest === 0) return bytes;
  const out = new Uint8Array(bytes.length + (4 - rest));
  out.set(bytes);
  out.fill(fill, bytes.length);
  return out;
}
