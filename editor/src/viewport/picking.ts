/**
 * Picking (owner B): what is under the pointer.
 *
 * Order of preference, the same order a person expects:
 *   1. the drawn attachment nearest the top of the draw order whose triangles
 *      contain the point (`computeWorldVertices` gives the world triangles);
 *   2. bounding boxes, likewise from the top;
 *   3. the bone whose segment (origin -> tip) is nearest the point, inside a
 *      radius measured in SCREEN pixels so it feels the same at any zoom.
 *
 * Rodada 8d: com "Ver ossos" ligado (`locks.bonesOnTop`), o CORPO do osso vem
 * antes de tudo — ele é desenhado por cima das imagens, e clicar numa imagem já
 * não escolhe o osso dela. A ponta fica na ordem de sempre.
 *
 * `pickAll` returns every hit, top first, so Alt can cycle through things that
 * overlap. No DOM here either: everything takes world coordinates.
 */

import {
  REGION_TRIANGLES,
  isParticleAttachment,
  particleFrame,
  type Skeleton,
  type Slot,
} from '../../../runtime/src/index.js';
import { aroundMarker, collectDrawGroups, collectDrawables } from '../../../runtime/src/index.js';
import type { DrawCut } from '../../../runtime/src/index.js';
import { emptySelection, type Selection } from '../contract.js';
import { isBoneLocked, isSlotLocked, type PickLocks } from './onion.js';
import { emitterHit, emitterPlace, type ParticlePositions } from './particles-view.js';

/**
 * As partículas vivas de um emissor, pela conta do runtime (`particleFrame`):
 * a MESMA que as desenha. Rodada 15.
 */
const liveParticles: ParticlePositions = (slot, attachment) => {
  try {
    return particleFrame(slot.skeleton, slot, attachment).particles;
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// The transparent part of an image lets the click through — lote 60c
// ---------------------------------------------------------------------------

/**
 * Reads how opaque one pixel of an atlas page is, `0..255`, at page UV `u, v`
 * (`0..1`, `v` down). `null` when it cannot tell (the image has not arrived):
 * then the click takes the drawing, as it always did.
 *
 * The Humberto, 11/09/2026: *"se eu clicar em uma parte sem imagem eu quero
 * que o clique passe direto como no Spriter"*. Picking stays pure: the scene,
 * which owns the images, installs the reader (`setAlphaSampler`).
 */
export type AlphaSampler = (page: object, u: number, v: number) => number | null;

let alphaSampler: AlphaSampler | null = null;

/** The scene installs its pixel reader here; `null` goes back to the whole rectangle. */
export function setAlphaSampler(fn: AlphaSampler | null): void {
  alphaSampler = fn;
}

/** Below this opacity (`0..255`) a pixel is empty for the click. */
export const ALPHA_PICK_MIN = 16;

/**
 * The UV under a point, by barycentric weights inside the triangle that holds
 * it. `vertices` and `uvs` are flat `x, y` lists in the same vertex order.
 * `null` when no triangle holds the point.
 */
export function uvAt(
  vertices: ArrayLike<number>, triangles: ArrayLike<number>, uvs: ArrayLike<number>,
  px: number, py: number,
): { u: number; v: number } | null {
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = triangles[i] * 2;
    const b = triangles[i + 1] * 2;
    const c = triangles[i + 2] * 2;
    const x1 = vertices[a]; const y1 = vertices[a + 1];
    const x2 = vertices[b]; const y2 = vertices[b + 1];
    const x3 = vertices[c]; const y3 = vertices[c + 1];
    if (!pointInTriangle(px, py, x1, y1, x2, y2, x3, y3)) continue;
    const det = (y2 - y3) * (x1 - x3) + (x3 - x2) * (y1 - y3);
    if (Math.abs(det) < 1e-12) continue;
    const l1 = ((y2 - y3) * (px - x3) + (x3 - x2) * (py - y3)) / det;
    const l2 = ((y3 - y1) * (px - x3) + (x1 - x3) * (py - y3)) / det;
    const l3 = 1 - l1 - l2;
    return {
      u: uvs[a] * l1 + uvs[b] * l2 + uvs[c] * l3,
      v: uvs[a + 1] * l1 + uvs[b + 1] * l2 + uvs[c + 1] * l3,
    };
  }
  return null;
}

/** The page UVs and the page of a drawn attachment: `region` keeps `uvs`, a mesh `regionUVs`. */
interface WithPageUVs {
  readonly region?: { readonly page?: object } | null;
  readonly uvs?: ArrayLike<number>;
  readonly regionUVs?: ArrayLike<number>;
}

/** `true` when the pixel under the point is opaque enough, or when nobody can tell. */
function isOpaqueAt(
  attachment: unknown, vertices: ArrayLike<number>, triangles: ArrayLike<number>, x: number, y: number,
): boolean {
  const sampler = alphaSampler;
  if (sampler === null) return true;
  const drawn = attachment as WithPageUVs;
  const page = drawn.region?.page;
  const uvs = drawn.regionUVs ?? drawn.uvs;
  if (page === undefined || uvs === undefined) return true;
  const uv = uvAt(vertices, triangles, uvs, x, y);
  if (uv === null) return true;
  const alpha = sampler(page, uv.u, uv.v);
  return alpha === null || alpha >= ALPHA_PICK_MIN;
}

/** No locks: everything can be picked. The default of every function here. */
export const NO_LOCKS: PickLocks = Object.freeze({
  lockBones: false, lockDrawings: false,
  lockedBones: new Set<string>(), lockedSlots: new Set<string>(),
  hiddenBones: new Set<string>(), hiddenSlots: new Set<string>(),
});

/**
 * O ponto está no CORPO do osso, e não na ponta? Até 80% do comprimento, a
 * contar da raiz (rodada 8d). Um osso sem comprimento é só a raiz: corpo.
 */
function onBoneBody(bone: { worldX: number; worldY: number }, tip: { x: number; y: number }, x: number, y: number): boolean {
  const vx = tip.x - bone.worldX;
  const vy = tip.y - bone.worldY;
  const length2 = vx * vx + vy * vy;
  if (length2 < 1e-12) return true;
  const t = ((x - bone.worldX) * vx + (y - bone.worldY) * vy) / length2;
  return t <= BONE_BODY_SHARE;
}

/** Quanto do osso, da raiz para a ponta, pega o clique por cima das imagens. */
export const BONE_BODY_SHARE = 0.8;

/** How close, in screen pixels, the pointer must be to a bone to hit it. */
export const BONE_PICK_PIXELS = 9;
/** Radius, in screen pixels, of the pick area around a zero-length bone. */
export const BONE_ORIGIN_PIXELS = 11;

export type PickKind = 'attachment' | 'boundingbox' | 'bone';

/** One thing under the pointer. */
export interface Pick {
  kind: PickKind;
  /** Bone name. For an attachment, the bone of its slot. */
  bone: string;
  /** Slot name, or `null` for a bone hit. */
  slot: string | null;
  /** Attachment name, or `null` for a bone hit. */
  attachment: string | null;
  /**
   * Só quando o desenho é uma ENTIDADE (7.11): o slot de dentro dela que o
   * ponto acertou — a imagem em que se clicou. Rodada 11.
   */
  inner?: string;
}

/**
 * Anything that can place its vertices in the world. Both `RegionAttachment`
 * and `VertexAttachment` have this shape, so picking does not need to know
 * which class it holds.
 */
interface WorldVertices {
  readonly type: string;
  readonly name: string;
  computeWorldVertices(
    slot: Slot,
    out?: Float64Array | number[],
    offset?: number,
    stride?: number,
  ): Float64Array | number[];
  readonly triangles?: Int32Array;
  readonly vertexCount?: number;
}

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/** `true` when the point is inside the triangle (edges count as inside). */
export function pointInTriangle(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
  cx: number, cy: number,
): boolean {
  const d1 = (px - bx) * (ay - by) - (ax - bx) * (py - by);
  const d2 = (px - cx) * (by - cy) - (bx - cx) * (py - cy);
  const d3 = (px - ax) * (cy - ay) - (cx - ax) * (py - ay);
  const negative = d1 < 0 || d2 < 0 || d3 < 0;
  const positive = d1 > 0 || d2 > 0 || d3 > 0;
  return !(negative && positive);
}

/** Shortest distance from a point to the segment `a`-`b`. */
export function distanceToSegment(
  px: number, py: number,
  ax: number, ay: number,
  bx: number, by: number,
): number {
  const vx = bx - ax;
  const vy = by - ay;
  const lengthSquared = vx * vx + vy * vy;
  let t = 0;
  if (lengthSquared > 1e-12) {
    t = ((px - ax) * vx + (py - ay) * vy) / lengthSquared;
    t = t < 0 ? 0 : t > 1 ? 1 : t;
  }
  const dx = px - (ax + vx * t);
  const dy = py - (ay + vy * t);
  return Math.sqrt(dx * dx + dy * dy);
}

/** `true` when the point falls in any triangle of a flat `x, y` vertex list. */
export function pointInTriangleList(
  vertices: ArrayLike<number>,
  triangles: ArrayLike<number>,
  px: number,
  py: number,
): boolean {
  for (let i = 0; i + 2 < triangles.length; i += 3) {
    const a = triangles[i] * 2;
    const b = triangles[i + 1] * 2;
    const c = triangles[i + 2] * 2;
    if (pointInTriangle(
      px, py,
      vertices[a], vertices[a + 1],
      vertices[b], vertices[b + 1],
      vertices[c], vertices[c + 1],
    )) return true;
  }
  return false;
}

/** Triangle fan `0, i, i + 1` for a convex-enough polygon of `count` points. */
export function fanTriangles(count: number): number[] {
  const out: number[] = [];
  for (let i = 1; i + 1 < count; i++) out.push(0, i, i + 1);
  return out;
}

// ---------------------------------------------------------------------------
// World points of one attachment
// ---------------------------------------------------------------------------

/** The smallest box around a list of world points. */
export interface PointBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * The box around `count` points read from a flat `x, y, x, y` list.
 *
 * `null` for no point at all, which is not the same as a box of zero size: a
 * slot with nothing in it has no box, a slot with one vertex has one that is a
 * single point.
 */
export function boundsOfWorldPoints(
  vertices: ArrayLike<number>,
  count: number,
): PointBox | null {
  if (count <= 0) return null;
  let minX = Infinity; let minY = Infinity; let maxX = -Infinity; let maxY = -Infinity;
  for (let i = 0; i < count; i++) {
    const x = vertices[i * 2];
    const y = vertices[i * 2 + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  return { minX, minY, maxX, maxY };
}

/**
 * The vertices of one attachment, in the world, or `null` when it has none.
 *
 * A region has four corners and no `vertexCount`; a mesh has `vertexCount` and
 * a triangle list. This is the one place that knows the difference, so picking
 * and framing read the shape the same way.
 */
export function attachmentWorldPoints(
  slot: Slot,
  attachment: unknown,
): { vertices: ArrayLike<number>; count: number } | null {
  const shape = attachment as WorldVertices | null;
  // Rodada 8a: a entidade não tem contorno próprio — quem desenha é o filho.
  // O lugar dela no mundo é a caixa de tudo o que o filho desenha.
  if (shape !== null && shape.type === 'skeleton') {
    const box = nestedBox(slot, attachment);
    return box === null ? null : {
      vertices: [box.minX, box.minY, box.maxX, box.minY, box.maxX, box.maxY, box.minX, box.maxY],
      count: 4,
    };
  }
  if (shape === null || typeof shape.computeWorldVertices !== 'function') return null;
  const vertices = shape.computeWorldVertices(slot);
  const count = shape.vertexCount ?? (shape.triangles === undefined ? 4 : vertices.length / 2);
  return count > 0 ? { vertices, count } : null;
}

// ---------------------------------------------------------------------------
// A entidade: um anexo que desenha pelo filho — rodada 8a (04/10/2026)
// ---------------------------------------------------------------------------

/*
 * O anexo `skeleton` (§7.11) não tem vértices: quem desenha é o esqueleto
 * filho, inteiro, no lugar do slot. Por isso o clique na cena **pulava** a
 * entidade (o `continue` de quem não tem `computeWorldVertices`), e ela não se
 * escolhia, não abria a grade, não se movia — o buraco central da rodada 1.
 *
 * Agora a entidade se acha pelo que ela DESENHA: o clique desce no filho e
 * testa os desenhos dele (com a mesma regra do pixel transparente, lote 60c);
 * a caixa dela no mundo é a caixa desses desenhos. Neto dentro de filho desce
 * do mesmo jeito.
 */

/** Profundidade máxima de entidade dentro de entidade (§12.6). */
const NESTED_PICK_DEPTH = 8;

/** O esqueleto vivo do filho de um slot que mostra uma entidade, ou `null`. */
function nestedChildOf(slot: Slot, attachment: unknown): Skeleton | null {
  if (slot.attachment !== attachment) return null;
  return slot.nestedSkeleton()?.skeleton ?? null;
}

/** A caixa no mundo de tudo o que a entidade desenha, ou `null` (filho não carregado). */
export function nestedBox(slot: Slot, attachment: unknown, depth = 0): PointBox | null {
  const child = nestedChildOf(slot, attachment);
  if (child === null || depth >= NESTED_PICK_DEPTH) return null;
  let box: PointBox | null = null;
  for (const drawable of collectDrawables(child)) {
    const inner = drawable.attachment.type === 'skeleton'
      ? nestedBox(drawable.slot, drawable.attachment, depth + 1)
      : (() => {
        const points = attachmentWorldPoints(drawable.slot, drawable.attachment);
        return points === null ? null : boundsOfWorldPoints(points.vertices, points.count);
      })();
    if (inner === null) continue;
    box = box === null ? { ...inner } : {
      minX: Math.min(box.minX, inner.minX), minY: Math.min(box.minY, inner.minY),
      maxX: Math.max(box.maxX, inner.maxX), maxY: Math.max(box.maxY, inner.maxY),
    };
  }
  return box;
}

/**
 * `true` quando o ponto cai num pixel de verdade de algum desenho da entidade.
 * O transparente deixa o clique passar, como numa imagem (lote 60c).
 */
export function nestedContains(slot: Slot, attachment: unknown, x: number, y: number, depth = 0): boolean {
  return nestedHit(slot, attachment, x, y, null, depth) !== null;
}

/** `true` quando o ponto cai num pixel de verdade do desenho `drawn` do slot `inner`. */
function shapeHit(inner: Slot, drawn: unknown, x: number, y: number): boolean {
  const shape = drawn as WorldVertices;
  if (shape === null || typeof shape.computeWorldVertices !== 'function') return false;
  const vertices = shape.computeWorldVertices(inner) as Float64Array;
  const triangles = shape.triangles ?? REGION_TRIANGLES;
  return pointInTriangleList(vertices, triangles, x, y) && isOpaqueAt(drawn as never, vertices, triangles, x, y);
}

/**
 * **Qual imagem de dentro** da entidade o ponto acerta — rodada 11 (05/10/2026).
 *
 * Devolve o nome do slot DA ENTIDADE (o de cima primeiro, como se vê), ou
 * `null`. É o que o botão direito precisa para o "Este boneco": *"botão direito
 * na imagem do meio do poder"*. Neto dentro de filho responde com o slot do
 * filho que mostra o neto.
 *
 * `cut` é a metade de uma entidade desenhada EM VOLTA de quem a recebe (spec
 * 7.11, `around`): só a de trás ou só a da frente, e o slot do meio, que não é
 * desenhado, não é acertado. Sem `cut`, a entidade inteira, em bloco.
 */
export function nestedHit(
  slot: Slot, attachment: unknown, x: number, y: number, cut: DrawCut | null = null, depth = 0,
): string | null {
  const child = nestedChildOf(slot, attachment);
  if (child === null || depth >= NESTED_PICK_DEPTH) return null;
  const drawables = collectDrawGroups(child, cut);
  for (let i = drawables.length - 1; i >= 0; i--) {
    const { slot: inner, attachment: drawn, part } = drawables[i];
    if (drawn.type === 'skeleton') {
      const marker = part === undefined ? null : aroundMarker(inner);
      const deeper = marker === null || part === undefined ? null : { marker, part };
      if (nestedHit(inner, drawn, x, y, deeper, depth + 1) !== null) return inner.data.name;
      continue;
    }
    if (shapeHit(inner, drawn, x, y)) return inner.data.name;
  }
  return null;
}

/** O slot do meio de uma entidade em volta, vivo, com o desenho que ele tem; ou `null`. */
function markerSlotOf(slot: Slot): { marker: string; inner: Slot } | null {
  const marker = aroundMarker(slot);
  if (marker === null) return null;
  const inner = slot.nested?.skeleton.findSlot(marker) ?? null;
  return inner === null || inner.attachment === null ? null : { marker, inner };
}

/**
 * O contorno da imagem do meio de uma entidade em volta — a que NÃO é
 * desenhada (7.11). Com a peça escolhida a cena o risca tracejado, com o nome:
 * é onde se vê o que marca o meio, e onde se clica para desfazer. `null` quando
 * o slot não mostra uma entidade em volta, ou quando o meio está vazio.
 */
export function markerOutline(
  skeleton: Skeleton | null, slotName: string,
): { name: string; vertices: number[] } | null {
  const slot = skeleton?.findSlot(slotName) ?? null;
  const found = slot === null ? null : markerSlotOf(slot);
  if (found === null) return null;
  const points = attachmentWorldPoints(found.inner, found.inner.attachment);
  if (points === null) return null;
  // Uma região tem quatro cantos, e é o contorno dela. Malha e o resto: a caixa.
  if (points.count === 4) return { name: found.marker, vertices: Array.from({ length: 8 }, (_, i) => points.vertices[i]!) };
  const box = boundsOfWorldPoints(points.vertices, points.count);
  return box === null ? null : {
    name: found.marker,
    vertices: [box.minX, box.minY, box.maxX, box.minY, box.maxX, box.maxY, box.minX, box.maxY],
  };
}

/**
 * As travas, mais as peças escolhidas: numa entidade em volta que está
 * ESCOLHIDA, a imagem do meio — que não é desenhada — pega o clique. Sem a
 * peça escolhida o clique passa por ela, como passa por qualquer coisa que não
 * se vê.
 */
export function withChosen(locks: PickLocks, slots: Iterable<string>): PickLocks {
  return { ...locks, markersOf: new Set(slots) };
}

// ---------------------------------------------------------------------------
// Picking
// ---------------------------------------------------------------------------

/** World tip of a bone: its origin moved `length` along its own X axis. */
export function boneTip(bone: {
  a: number; c: number; worldX: number; worldY: number; data: { length: number };
}): { x: number; y: number } {
  return {
    x: bone.worldX + bone.a * bone.data.length,
    y: bone.worldY + bone.c * bone.data.length,
  };
}

/** Every hit under a world point, nearest the viewer first. */
export function pickAll(
  skeleton: Skeleton | null,
  worldX: number,
  worldY: number,
  pixelsPerUnit: number,
  locks: PickLocks = NO_LOCKS,
): Pick[] {
  const hits: Pick[] = [];
  if (skeleton === null) return hits;
  const scale = pixelsPerUnit > 1e-9 ? pixelsPerUnit : 1e-9;

  // 1. Drawn attachments, from the top of the draw order down.
  // Rodada 15: a marca do emissor é desenhada por cima de tudo, e quem a clica
  // quer o emissor — ela vai para a frente da lista, no fim.
  const marks: Pick[] = [];
  // Rodada 11: pela ordem EM VOLTA (7.11). Uma entidade com `around` é desenhada
  // metade atrás do boneco inteiro e metade na frente; o que está por cima é o
  // que o clique pega. Sem `around` no arquivo é a ordem de sempre.
  const drawables = collectDrawGroups(skeleton);
  for (let i = drawables.length - 1; i >= 0; i--) {
    const { slot, attachment, part } = drawables[i];
    if (isSlotLocked(slot.data.name, locks)) continue;
    // Rodada 15: o emissor não tem contorno. Acha-se pela marca ou pelas
    // partículas vivas (`particles-view.ts`).
    if (isParticleAttachment(attachment)) {
      const hit = emitterHit(slot, attachment, worldX, worldY, scale, liveParticles);
      if (hit !== null) {
        const pick: Pick = { kind: 'attachment', bone: hit.bone, slot: hit.slot, attachment: hit.attachment };
        if (hit.onMark) marks.push(pick); else hits.push(pick);
      }
      continue;
    }
    // Rodada 8a: a entidade se acha pelo que o filho desenha.
    if (attachment.type === 'skeleton') {
      const marker = part === undefined ? null : aroundMarker(slot);
      let inner: string | null = null;
      // O meio não é desenhado: só pega o clique com a peça escolhida, e então
      // por cima de tudo (é onde o contorno tracejado aparece).
      if (marker !== null && part === 'front' && locks.markersOf?.has(slot.data.name) === true) {
        const meio = markerSlotOf(slot);
        if (meio !== null && shapeHit(meio.inner, meio.inner.attachment, worldX, worldY)) inner = marker;
      }
      if (inner === null) {
        inner = nestedHit(slot, attachment, worldX, worldY, marker === null || part === undefined ? null : { marker, part });
      }
      // A peça em volta aparece duas vezes na lista (frente e trás): um acerto só.
      const jaAcertou = hits.some((h) => h.kind === 'attachment' && h.slot === slot.data.name && h.attachment === attachment.name);
      if (inner !== null && !jaAcertou) {
        hits.push({ kind: 'attachment', bone: slot.bone.data.name, slot: slot.data.name, attachment: attachment.name, inner });
      }
      continue;
    }
    const shape = attachment as unknown as WorldVertices;
    if (typeof shape.computeWorldVertices !== 'function') continue;
    const vertices = shape.computeWorldVertices(slot) as Float64Array;
    const triangles = shape.triangles ?? REGION_TRIANGLES;
    if (pointInTriangleList(vertices, triangles, worldX, worldY)) {
      // Lote 60c: onde a imagem é transparente, o clique passa direto.
      if (!isOpaqueAt(attachment, vertices, triangles, worldX, worldY)) continue;
      hits.push({
        kind: 'attachment',
        bone: slot.bone.data.name,
        slot: slot.data.name,
        attachment: attachment.name,
      });
    }
  }

  // 2. Bounding boxes: drawn as guides, never as pixels, so they come after.
  for (let i = skeleton.drawOrder.length - 1; i >= 0; i--) {
    const slot = skeleton.drawOrder[i];
    const attachment = slot.attachment;
    if (attachment === null || attachment.type !== 'boundingbox') continue;
    if (isSlotLocked(slot.data.name, locks)) continue;
    const shape = attachment as unknown as WorldVertices;
    const count = shape.vertexCount ?? 0;
    if (count < 3) continue;
    const vertices = shape.computeWorldVertices(slot) as Float64Array;
    if (pointInTriangleList(vertices, fanTriangles(count), worldX, worldY)) {
      hits.push({
        kind: 'boundingbox',
        bone: slot.bone.data.name,
        slot: slot.data.name,
        attachment: attachment.name,
      });
    }
  }

  // 3. Bones, nearest first. Not the root: it is the world, invisible since
  // lote 60a, and a click at the origin must not pick it.
  const near: Array<{ distance: number; name: string; body: boolean }> = [];
  for (const bone of skeleton.bones) {
    if (bone === skeleton.root) continue;
    // O osso que não se desenha não se clica — o mesmo do retângulo. É o
    // caso do osso próprio de uma imagem (rodada 8d), que ninguém vê.
    if (!bone.data.visible) continue;
    if (isBoneLocked(bone.data.name, locks)) continue;
    const length = bone.data.length;
    const tip = boneTip(bone);
    const radius = (length > 0 ? BONE_PICK_PIXELS : BONE_ORIGIN_PIXELS) / scale;
    const distance = distanceToSegment(worldX, worldY, bone.worldX, bone.worldY, tip.x, tip.y);
    if (distance <= radius) near.push({ distance, name: bone.data.name, body: onBoneBody(bone, tip, worldX, worldY) });
  }
  near.sort((left, right) => left.distance - right.distance);
  // Rodada 8d: com os ossos à vista, o osso desenhado por cima da imagem pega
  // o clique pelo CORPO antes dela — é onde ele está na tela, e clicar na
  // imagem já não escolhe o osso dela. A ponta não: ali costuma estar a peça
  // seguinte (a mão na ponta do antebraço), que tem de continuar clicável.
  const onTop = locks.bonesOnTop === true ? near.filter((item) => item.body) : [];
  const rest = near.filter((item) => !onTop.includes(item));
  const boneHit = (item: { name: string }): Pick => ({ kind: 'bone', bone: item.name, slot: null, attachment: null });
  if (onTop.length > 0) hits.unshift(...onTop.map(boneHit));
  for (const item of rest) hits.push(boneHit(item));
  // A marca do emissor por cima de tudo, até do corpo do osso: é desenhada
  // depois dele (`viewport-draw.ts`), e o emissor nasce na origem de um osso.
  if (marks.length > 0) hits.unshift(...marks);

  return hits;
}

/**
 * The single thing under the pointer. `cycle` walks down the stack of things
 * that overlap, which is what Alt+click does.
 */
export function pickAt(
  skeleton: Skeleton | null,
  worldX: number,
  worldY: number,
  pixelsPerUnit: number,
  cycle = 0,
  locks: PickLocks = NO_LOCKS,
): Pick | null {
  const hits = pickAll(skeleton, worldX, worldY, pixelsPerUnit, locks);
  if (hits.length === 0) return null;
  const index = ((cycle % hits.length) + hits.length) % hits.length;
  return hits[index];
}

/** `true` when both picks name the same thing. */
export function samePick(a: Pick | null, b: Pick | null): boolean {
  if (a === null || b === null) return a === b;
  return a.kind === b.kind && a.bone === b.bone
    && a.slot === b.slot && a.attachment === b.attachment;
}

// ---------------------------------------------------------------------------
// The selection box: drag over empty space, and everything it touches
// ---------------------------------------------------------------------------

/** A rectangle in world units. Any two opposite corners; order does not matter. */
export interface WorldRect {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function normalRect(rect: WorldRect): { minX: number; minY: number; maxX: number; maxY: number } {
  return {
    minX: Math.min(rect.x1, rect.x2), maxX: Math.max(rect.x1, rect.x2),
    minY: Math.min(rect.y1, rect.y2), maxY: Math.max(rect.y1, rect.y2),
  };
}

/**
 * Everything inside the box, in the same order `pickAll` uses: drawings from
 * the top down, then bounding boxes, then bones.
 *
 * A bone is inside when its ROOT is inside, which is the point the artist
 * grabs. A drawing is inside when the box overlaps the bounds of its
 * vertices, so a box that only clips the corner of an arm still takes the
 * arm: that is how Spine, Spriter and Blender all read a rectangle, and it is
 * the forgiving reading, which matters for a hand that is not steady.
 *
 * Hidden bones and locked things are skipped: what cannot be seen or clicked
 * cannot be boxed either.
 */
export function pickInRect(
  skeleton: Skeleton | null,
  rect: WorldRect,
  locks: PickLocks = NO_LOCKS,
): Pick[] {
  const hits: Pick[] = [];
  if (skeleton === null) return hits;
  const box = normalRect(rect);

  const overlaps = (vertices: ArrayLike<number>, count: number): boolean => {
    const around = boundsOfWorldPoints(vertices, count);
    if (around === null) return false;
    return around.maxX >= box.minX && around.minX <= box.maxX
      && around.maxY >= box.minY && around.minY <= box.maxY;
  };

  const drawables = collectDrawables(skeleton);
  for (let i = drawables.length - 1; i >= 0; i--) {
    const { slot, attachment } = drawables[i];
    if (isSlotLocked(slot.data.name, locks)) continue;
    // Rodada 15: o emissor entra pela marca, a origem dele.
    if (isParticleAttachment(attachment)) {
      const at = emitterPlace(slot, attachment);
      if (at.x >= box.minX && at.x <= box.maxX && at.y >= box.minY && at.y <= box.maxY) {
        hits.push({ kind: 'attachment', bone: slot.bone.data.name, slot: slot.data.name, attachment: attachment.name });
      }
      continue;
    }
    // A mesma leitura do enquadrar: a entidade entra pela caixa do filho (8a).
    const points = attachmentWorldPoints(slot, attachment);
    if (points === null) continue;
    if (overlaps(points.vertices, points.count)) {
      hits.push({
        kind: 'attachment', bone: slot.bone.data.name, slot: slot.data.name, attachment: attachment.name,
      });
    }
  }

  for (let i = skeleton.drawOrder.length - 1; i >= 0; i--) {
    const slot = skeleton.drawOrder[i];
    const attachment = slot.attachment;
    if (attachment === null || attachment.type !== 'boundingbox') continue;
    if (isSlotLocked(slot.data.name, locks)) continue;
    const shape = attachment as unknown as WorldVertices;
    const count = shape.vertexCount ?? 0;
    if (count < 2) continue;
    const vertices = shape.computeWorldVertices(slot) as Float64Array;
    if (overlaps(vertices, count)) {
      hits.push({
        kind: 'boundingbox', bone: slot.bone.data.name, slot: slot.data.name, attachment: attachment.name,
      });
    }
  }

  for (const bone of skeleton.bones) {
    if (bone === skeleton.root) continue;
    if (!bone.data.visible) continue;
    if (isBoneLocked(bone.data.name, locks)) continue;
    if (bone.worldX >= box.minX && bone.worldX <= box.maxX
      && bone.worldY >= box.minY && bone.worldY <= box.maxY) {
      hits.push({ kind: 'bone', bone: bone.data.name, slot: null, attachment: null });
    }
  }
  return hits;
}

/** What a box does to the selection: Shift adds, Ctrl removes, nothing replaces. */
export type BoxMode = 'replace' | 'add' | 'remove';

/** The selection after a box picked `hits`. Bones and drawings only: vertices are cleared. */
export function selectionForPicks(current: Selection, hits: readonly Pick[], mode: BoxMode): Selection {
  const base = mode === 'replace' ? emptySelection() : { ...current, vertices: [] };
  const bones = new Set(base.bones);
  const slots = new Set(base.slots);
  const attachments = base.attachments.map((item) => ({ ...item }));
  const has = (slot: string, attachment: string): boolean =>
    attachments.some((item) => item.slot === slot && item.attachment === attachment);

  for (const hit of hits) {
    if (hit.kind === 'bone') {
      if (mode === 'remove') bones.delete(hit.bone);
      else bones.add(hit.bone);
      continue;
    }
    const slot = hit.slot as string;
    const attachment = hit.attachment as string;
    if (mode === 'remove') {
      slots.delete(slot);
      const index = attachments.findIndex((item) => item.slot === slot && item.attachment === attachment);
      if (index >= 0) attachments.splice(index, 1);
    } else {
      slots.add(slot);
      if (!has(slot, attachment)) attachments.push({ slot, attachment });
    }
  }
  return { ...base, bones: [...bones], slots: [...slots], attachments };
}

// ---------------------------------------------------------------------------
// Turning a pick into a selection
// ---------------------------------------------------------------------------

function withoutAttachment(list: Selection['attachments'], slot: string, attachment: string) {
  return list.filter((item) => !(item.slot === slot && item.attachment === attachment));
}

/**
 * Selection after clicking on `hit`.
 * `add` (Shift) toggles the hit inside the current selection instead of
 * replacing it. A click on nothing clears the selection.
 *
 * **Clicar numa imagem escolhe SÓ a imagem** — rodada 8d (04/10/2026), *"como
 * no Spriter"*. Era o osso, o slot e a imagem juntos, e mover a imagem movia o
 * osso com tudo o que estava nele. Agora o slot e a imagem; quem quer o osso
 * clica no osso. Numa animação, mover a imagem cria chave só dela, pelo osso
 * próprio (`doc/own-bone.ts`).
 *
 * `keepsBone` diz quais imagens ainda levam o osso junto: as que não podem
 * andar sozinhas (uma malha, uma caixa, um caminho — `ownBoneRefusal`). Sem
 * isso, clicar na cabeça-malha do herói escolheria algo que nada move.
 *
 * `root` é a raiz: a imagem pendurada nela nunca leva o osso (lote 60a, o
 * "osso maldito" de 10/09), nem quando `keepsBone` pede.
 */
export function selectionFor(
  current: Selection, hit: Pick | null, add: boolean, root: string | null = null,
  keepsBone: (slot: string) => boolean = () => false,
): Selection {
  if (hit === null) return add ? current : emptySelection();

  if (hit.kind === 'bone') {
    if (!add) return { ...emptySelection(), bones: [hit.bone] };
    const has = current.bones.includes(hit.bone);
    return {
      ...current,
      bones: has ? current.bones.filter((name) => name !== hit.bone) : [...current.bones, hit.bone],
    };
  }

  const slot = hit.slot as string;
  const attachment = hit.attachment as string;
  const withBone = hit.bone !== root && keepsBone(slot);
  if (!add) {
    return {
      ...emptySelection(),
      bones: withBone ? [hit.bone] : [],
      slots: [slot],
      attachments: [{ slot, attachment }],
    };
  }
  const has = current.attachments.some((item) => item.slot === slot && item.attachment === attachment);
  return {
    ...current,
    bones: !withBone || current.bones.includes(hit.bone) ? current.bones : [...current.bones, hit.bone],
    slots: has ? current.slots.filter((name) => name !== slot)
      : current.slots.includes(slot) ? current.slots : [...current.slots, slot],
    attachments: has ? withoutAttachment(current.attachments, slot, attachment)
      : [...current.attachments, { slot, attachment }],
  };
}
