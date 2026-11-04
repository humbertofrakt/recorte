/**
 * Mesh geometry editing (owner C, requirement R4).
 *
 * Pure functions over the `.bone` JSON. Nothing here touches the DOM, the
 * document or the undo stack: a caller reads an attachment, asks for a new
 * geometry, and writes it back with a normal `SetProperty` command. That keeps
 * every rule of spec 7.4 in one testable place.
 *
 * The working shape is `MeshGeometry`: the four arrays of spec 7.4 that
 * describe a mesh without weights (`vertices`, `uvs`, `triangles`, `edges`)
 * plus `hull`. Weighted meshes are converted with `weights.ts` first — geometry
 * editing always happens on plain local positions, which is also how an artist
 * thinks about it.
 *
 * Coordinate spaces:
 *   - vertices: local space of the slot's bone, Y up, pixels (spec 7.4).
 *   - uvs:      0..1 on the ORIGINAL image, v = 0 at the top (spec 7.4).
 *   - images:   pixel space, X right, Y down, origin at the top-left corner.
 */

import type {
  MeshAttachmentDef, RegionAttachmentDef,
} from '../../../runtime/src/index.js';

// ---------------------------------------------------------------------------
// The working shape
// ---------------------------------------------------------------------------

/** A mesh without weights: exactly the arrays spec 7.4 stores. */
export interface MeshGeometry {
  /** `2N` local positions, `x, y` per vertex. */
  vertices: number[];
  /** `2N` texture coordinates, `u, v` per vertex. */
  uvs: number[];
  /** `3T` vertex indices, counter-clockwise. */
  triangles: number[];
  /** Pairs of vertex indices the editor keeps as constraints. */
  edges: number[];
  /** The first `hull` vertices form the outline, in order. */
  hull: number;
}

/** Number of vertices in a geometry. */
export function vertexCount(geo: MeshGeometry): number {
  return geo.vertices.length >> 1;
}

/** A deep copy, so an edit never aliases the document. */
export function cloneGeometry(geo: MeshGeometry): MeshGeometry {
  return {
    vertices: geo.vertices.slice(),
    uvs: geo.uvs.slice(),
    triangles: geo.triangles.slice(),
    edges: geo.edges.slice(),
    hull: geo.hull,
  };
}

/** Reads the geometry of an unweighted mesh attachment. */
export function readGeometry(def: MeshAttachmentDef): MeshGeometry {
  if (def.vertices === undefined) {
    throw new Error('esta malha tem pesos: converta para sem pesos antes de editar a forma');
  }
  return {
    vertices: def.vertices.slice(),
    uvs: (def.uvs ?? []).slice(),
    triangles: (def.triangles ?? []).slice(),
    edges: (def.edges ?? []).slice(),
    hull: def.hull ?? (def.vertices.length >> 1),
  };
}

/**
 * A new attachment carrying `geo`. The original is not touched, and `binding`
 * is removed because a geometry has no weights (spec 7.4: exactly one of
 * `vertices` or `binding`).
 */
export function writeGeometry(def: MeshAttachmentDef, geo: MeshGeometry): MeshAttachmentDef {
  const out: MeshAttachmentDef = { ...def };
  delete out.binding;
  out.vertices = geo.vertices.slice();
  out.uvs = geo.uvs.slice();
  out.triangles = geo.triangles.slice();
  out.hull = geo.hull;
  if (geo.edges.length > 0) out.edges = geo.edges.slice();
  else delete out.edges;
  return out;
}

// ---------------------------------------------------------------------------
// region -> mesh
// ---------------------------------------------------------------------------

/** Size of the original image, when the attachment does not carry one. */
export interface ImageSize {
  width: number;
  height: number;
}

/**
 * What `regionToMesh` reads from the atlas region: the same fields the runtime's
 * `computeRegionFrame` reads (spec 7.3, 10.3). An `AtlasRegionData` fits.
 */
export interface AtlasCrop {
  readonly originalWidth: number;
  readonly originalHeight: number;
  readonly width: number;
  readonly height: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly scale: number;
}

/**
 * Turns a `region` into a `mesh` with the same four corners (spec 7.3).
 *
 * The corner formula of 7.3 is applied without an atlas, which is the case an
 * editor works in: the crop is the whole image and the offsets are zero. The
 * region transform (`x`, `y`, `rotation`, `scaleX`, `scaleY`) is baked into the
 * four vertices, because a mesh has no transform of its own.
 *
 * Corner order is the one of 7.3 — BL, BR, TR, TL, counter-clockwise — with
 * UVs BL = (0, 1), BR = (1, 1), TR = (1, 0), TL = (0, 0) and the two triangles
 * `[0, 1, 2, 0, 2, 3]`.
 */
export function regionToMesh(
  region: RegionAttachmentDef, size?: ImageSize, atlas?: AtlasCrop,
): MeshAttachmentDef {
  // Lote 63a: com a região do atlas, a conta é a do runtime (§7.3,
  // `computeRegionFrame`): o tamanho original em px do esqueleto (dividido
  // pela escala) e o RECORTE, com os deslocamentos da borda cortada. Sem
  // isso, uma peça sem `width/height` (o lote 56 apaga os dois) ou de atlas
  // cortado virava malha em outro lugar: *"o negócio saiu correndo"*.
  const s = atlas !== undefined && atlas.scale > 0 ? atlas.scale : 1;
  // Sem atlas: o tamanho da imagem, ou o do próprio desenho, como antes.
  const originalW = atlas !== undefined ? atlas.originalWidth / s : (size?.width || (region.width ?? 0));
  const originalH = atlas !== undefined ? atlas.originalHeight / s : (size?.height || (region.height ?? 0));
  const W = region.width !== undefined && region.width !== 0 ? region.width : originalW;
  const H = region.height !== undefined && region.height !== 0 ? region.height : originalH;
  const kx = originalW !== 0 ? W / originalW : 1;
  const ky = originalH !== 0 ? H / originalH : 1;
  const cropW = atlas !== undefined ? atlas.width / s : originalW;
  const cropH = atlas !== undefined ? atlas.height / s : originalH;
  const offX = atlas !== undefined ? atlas.offsetX / s : 0;
  const offY = atlas !== undefined ? atlas.offsetY / s : 0;
  const x0 = (-originalW / 2 + offX) * kx;
  const x1 = x0 + cropW * kx;
  const y0 = (-originalH / 2 + offY) * ky;
  const y1 = y0 + cropH * ky;
  // UV na imagem original, v para baixo (§7.4): o recorte dentro dela.
  const ow = atlas?.originalWidth ?? 0;
  const oh = atlas?.originalHeight ?? 0;
  const u0 = atlas !== undefined && ow !== 0 ? atlas.offsetX / ow : 0;
  const u1 = atlas !== undefined && ow !== 0 ? (atlas.offsetX + atlas.width) / ow : 1;
  const v1 = atlas !== undefined && oh !== 0 ? 1 - atlas.offsetY / oh : 1;
  const v0 = atlas !== undefined && oh !== 0 ? 1 - (atlas.offsetY + atlas.height) / oh : 0;

  const rotation = region.rotation ?? 0;
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const sx = region.scaleX ?? 1;
  const sy = region.scaleY ?? 1;
  const tx = region.x ?? 0;
  const ty = region.y ?? 0;

  const corner = (px: number, py: number): [number, number] => [
    px * sx * cos - py * sy * sin + tx,
    px * sx * sin + py * sy * cos + ty,
  ];

  const bl = corner(x0, y0);
  const br = corner(x1, y0);
  const tr = corner(x1, y1);
  const tl = corner(x0, y1);

  const mesh: MeshAttachmentDef = {
    type: 'mesh',
    vertices: [bl[0], bl[1], br[0], br[1], tr[0], tr[1], tl[0], tl[1]],
    uvs: [u0, v1, u1, v1, u1, v0, u0, v0],
    triangles: [0, 1, 2, 0, 2, 3],
    hull: 4,
  };
  if (region.path !== undefined) mesh.path = region.path;
  if (region.color !== undefined) mesh.color = region.color;
  if (region.sequence !== undefined) mesh.sequence = region.sequence;
  if (W !== 0) mesh.width = W;
  if (H !== 0) mesh.height = H;
  return mesh;
}

// ---------------------------------------------------------------------------
// The map from local position to UV
// ---------------------------------------------------------------------------

/** An affine map `u = a x + b y + tx`, `v = c x + d y + ty`. */
export interface UvMap {
  a: number; b: number; tx: number;
  c: number; d: number; ty: number;
}

/**
 * The affine map that best takes the vertices to their UVs, by least squares.
 *
 * A mesh born from a region (or from an image outline) sits exactly on such a
 * map, so the fit is exact and stays exact: moving a vertex and setting its UV
 * through the same map leaves every vertex on it. When the fit is degenerate
 * (fewer than three vertices, or all of them on one line) the bounding box of
 * the mesh is used instead, mapped to the whole image.
 */
export function uvMapOf(geo: MeshGeometry): UvMap {
  const n = vertexCount(geo);
  if (n >= 3 && geo.uvs.length >= n * 2) {
    const fit = fitAffine(geo.vertices, geo.uvs, n);
    if (fit !== null) return fit;
  }
  return boundingBoxUvMap(geo);
}

/** Least squares fit of an affine map from `src` (2N) to `dst` (2N). */
function fitAffine(src: readonly number[], dst: readonly number[], n: number): UvMap | null {
  // Normal equations of [x y 1] · M = [u v], solved with a 3x3 inverse.
  let sxx = 0, sxy = 0, sx = 0, syy = 0, sy = 0, s1 = 0;
  let sxu = 0, syu = 0, su = 0, sxv = 0, syv = 0, sv = 0;
  for (let i = 0; i < n; i++) {
    const x = src[2 * i], y = src[2 * i + 1];
    const u = dst[2 * i], v = dst[2 * i + 1];
    sxx += x * x; sxy += x * y; sx += x;
    syy += y * y; sy += y; s1 += 1;
    sxu += x * u; syu += y * u; su += u;
    sxv += x * v; syv += y * v; sv += v;
  }
  const inv = invert3(
    sxx, sxy, sx,
    sxy, syy, sy,
    sx, sy, s1,
  );
  if (inv === null) return null;
  const a = inv[0] * sxu + inv[1] * syu + inv[2] * su;
  const b = inv[3] * sxu + inv[4] * syu + inv[5] * su;
  const tx = inv[6] * sxu + inv[7] * syu + inv[8] * su;
  const c = inv[0] * sxv + inv[1] * syv + inv[2] * sv;
  const d = inv[3] * sxv + inv[4] * syv + inv[5] * sv;
  const ty = inv[6] * sxv + inv[7] * syv + inv[8] * sv;
  const values = [a, b, tx, c, d, ty];
  if (values.some((value) => !Number.isFinite(value))) return null;
  return { a, b, tx, c, d, ty };
}

/** Inverse of a symmetric 3x3, row major, or `null` when it is singular. */
function invert3(
  m0: number, m1: number, m2: number,
  m3: number, m4: number, m5: number,
  m6: number, m7: number, m8: number,
): number[] | null {
  const c0 = m4 * m8 - m5 * m7;
  const c1 = m5 * m6 - m3 * m8;
  const c2 = m3 * m7 - m4 * m6;
  const det = m0 * c0 + m1 * c1 + m2 * c2;
  const scale = Math.max(Math.abs(m0), Math.abs(m4), Math.abs(m8), 1);
  if (!Number.isFinite(det) || Math.abs(det) < 1e-12 * scale * scale * scale) return null;
  const inv = 1 / det;
  return [
    c0 * inv, (m2 * m7 - m1 * m8) * inv, (m1 * m5 - m2 * m4) * inv,
    c1 * inv, (m0 * m8 - m2 * m6) * inv, (m2 * m3 - m0 * m5) * inv,
    c2 * inv, (m1 * m6 - m0 * m7) * inv, (m0 * m4 - m1 * m3) * inv,
  ];
}

/** Fallback map: the mesh bounding box stretched over the whole image. */
function boundingBoxUvMap(geo: MeshGeometry): UvMap {
  const box = boundsOf(geo.vertices);
  const w = box.maxX - box.minX;
  const h = box.maxY - box.minY;
  // u grows with x from the left edge; v grows downwards from the top edge,
  // because spec 7.4 puts `v = 0` at the top of the image.
  const a = w > 1e-9 ? 1 / w : 0;
  const d = h > 1e-9 ? -1 / h : 0;
  return { a, b: 0, tx: -box.minX * a, c: 0, d, ty: -box.maxY * d };
}

/** Axis-aligned box: the shape `boundsOf` returns. */
export interface Box {
  minX: number; minY: number; maxX: number; maxY: number;
}

/** Bounding box of a `2N` position array. */
export function boundsOf(points: readonly number[]): Box {
  if (points.length < 2) return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (let i = 0; i < points.length; i += 2) {
    const x = points[i], y = points[i + 1];
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

/**
 * As opções de posição e tamanho para regenerar a malha SEM o desenho pular
 * — conserto de 13/09/2026, *"quando aperta pra criar malha o sprite se
 * move"*.
 *
 * A ideia velha pedia o traçado no CENTRO da malha atual, mas media o
 * tamanho do canvas por um metadado (`width`/`height` do anexo, às vezes
 * velho, às vezes vindo de uma conta de escala do atlas). O canvas quase
 * nunca enche o recorte — a arte tem borda transparente —, então o centro da
 * SILHUETA traçada não é o centro do canvas, e os dois se confundiam: um
 * salto do tamanho da folga entre os dois.
 *
 * A conta certa não usa metadado nenhum: o canvas inteiro (`0..largura,
 * 0..altura` em pixel) tem que cair exatamente na CAIXA que a malha JÁ
 * ocupa. No caso comum — Virar malha, depois Gerar automática — a caixa É o
 * canvas, e a conta sai exata. Numa malha mexida à mão a caixa não é mais um
 * retângulo do canvas certinho, mas é a aproximação honesta: o desenho fica
 * onde e do tamanho que já estava.
 *
 * `fallback` só entra quando a caixa não tem tamanho nenhum (malha
 * degenerada, ou a primeira vez que não há caixa para copiar).
 */
export function autoMeshOptionsFromBox(
  box: Box, fallback: { width: number; height: number },
): { width: number; height: number; x: number; y: number } {
  const width = box.maxX - box.minX;
  const height = box.maxY - box.minY;
  return {
    width: width > 1e-6 ? width : fallback.width,
    height: height > 1e-6 ? height : fallback.height,
    x: (box.minX + box.maxX) / 2,
    y: (box.minY + box.maxY) / 2,
  };
}

/** The UV a local position gets under `map`. */
export function uvAt(map: UvMap, x: number, y: number): [number, number] {
  return [map.a * x + map.b * y + map.tx, map.c * x + map.d * y + map.ty];
}

// ---------------------------------------------------------------------------
// Vertex and edge editing
// ---------------------------------------------------------------------------

/**
 * Moves one vertex and recomputes its UV, so the image keeps following the
 * mesh in the setup pose. Triangles are left alone: moving a vertex never
 * changes the topology.
 *
 * `keepUv` holds the UV where it was, which stretches the image instead of
 * sliding it: that is what an artist wants when the shape of the mesh must
 * change without the drawing moving under it.
 */
export function moveVertex(
  geo: MeshGeometry, index: number, x: number, y: number,
  options: { keepUv?: boolean } = {},
): MeshGeometry {
  const n = vertexCount(geo);
  if (index < 0 || index >= n) throw new Error(`vértice ${index} não existe`);
  const map = uvMapOf(geo);
  const out = cloneGeometry(geo);
  out.vertices[2 * index] = x;
  out.vertices[2 * index + 1] = y;
  if (options.keepUv === true) return out;
  const uv = uvAt(map, x, y);
  out.uvs[2 * index] = uv[0];
  out.uvs[2 * index + 1] = uv[1];
  return out;
}

/**
 * Adds an interior vertex and retriangulates. The new vertex goes after the
 * hull vertices, so `hull` stays valid; its UV comes from the image map.
 */
export function addVertex(geo: MeshGeometry, x: number, y: number): MeshGeometry {
  const map = uvMapOf(geo);
  const out = cloneGeometry(geo);
  out.vertices.push(x, y);
  const uv = uvAt(map, x, y);
  out.uvs.push(uv[0], uv[1]);
  out.triangles = triangulate(out.vertices, out.hull, out.edges);
  return out;
}

/**
 * Adds a vertex on the outline, between hull vertices `after` and `after + 1`.
 * Interior indices shift by one, so triangles and edges are renumbered.
 */
export function addHullVertex(geo: MeshGeometry, after: number, x: number, y: number): MeshGeometry {
  const hull = geo.hull;
  if (hull < 1 || after < 0 || after >= hull) throw new Error(`aresta do contorno ${after} não existe`);
  const map = uvMapOf(geo);
  const at = after + 1;
  const out = cloneGeometry(geo);
  out.vertices.splice(2 * at, 0, x, y);
  const uv = uvAt(map, x, y);
  out.uvs.splice(2 * at, 0, uv[0], uv[1]);
  out.hull = hull + 1;
  out.edges = out.edges.map((i) => (i >= at ? i + 1 : i));
  out.triangles = triangulate(out.vertices, out.hull, out.edges);
  return out;
}

/**
 * Deletes a vertex and every index above it moves down by one. A hull with
 * fewer than three vertices left is refused: spec 7.4 needs `N >= 3`.
 */
export function removeVertex(geo: MeshGeometry, index: number): MeshGeometry {
  const n = vertexCount(geo);
  if (index < 0 || index >= n) throw new Error(`vértice ${index} não existe`);
  if (n <= 3) throw new Error('uma malha precisa de pelo menos 3 vértices');
  const wasHull = index < geo.hull;
  if (wasHull && geo.hull <= 3) throw new Error('o contorno precisa de pelo menos 3 vértices');

  const out = cloneGeometry(geo);
  out.vertices.splice(2 * index, 2);
  out.uvs.splice(2 * index, 2);
  if (wasHull) out.hull = geo.hull - 1;
  const shift = (i: number): number => (i > index ? i - 1 : i);
  const edges: number[] = [];
  for (let i = 0; i + 1 < out.edges.length; i += 2) {
    const a = out.edges[i], b = out.edges[i + 1];
    if (a === index || b === index) continue;
    edges.push(shift(a), shift(b));
  }
  out.edges = edges;
  out.triangles = triangulate(out.vertices, out.hull, out.edges);
  return out;
}

/** Adds a constraint edge between two vertices and retriangulates. */
export function addEdge(geo: MeshGeometry, a: number, b: number): MeshGeometry {
  const n = vertexCount(geo);
  if (a < 0 || b < 0 || a >= n || b >= n || a === b) throw new Error('aresta inválida');
  if (hasEdge(geo.edges, a, b)) return cloneGeometry(geo);
  const out = cloneGeometry(geo);
  out.edges.push(a, b);
  out.triangles = triangulate(out.vertices, out.hull, out.edges);
  return out;
}

/** Removes a constraint edge and retriangulates. */
export function removeEdge(geo: MeshGeometry, a: number, b: number): MeshGeometry {
  const out = cloneGeometry(geo);
  const edges: number[] = [];
  for (let i = 0; i + 1 < out.edges.length; i += 2) {
    const p = out.edges[i], q = out.edges[i + 1];
    if ((p === a && q === b) || (p === b && q === a)) continue;
    edges.push(p, q);
  }
  out.edges = edges;
  out.triangles = triangulate(out.vertices, out.hull, out.edges);
  return out;
}

/** `true` when the pair is already in the constraint list, in either order. */
export function hasEdge(edges: readonly number[], a: number, b: number): boolean {
  for (let i = 0; i + 1 < edges.length; i += 2) {
    const p = edges[i], q = edges[i + 1];
    if ((p === a && q === b) || (p === b && q === a)) return true;
  }
  return false;
}

/** Index of the vertex closest to a point, or `-1` beyond `maxDistance`. */
export function nearestVertex(
  geo: MeshGeometry, x: number, y: number, maxDistance = Infinity,
): number {
  let best = -1;
  let bestDistance = maxDistance * maxDistance;
  const n = vertexCount(geo);
  for (let i = 0; i < n; i++) {
    const dx = geo.vertices[2 * i] - x;
    const dy = geo.vertices[2 * i + 1] - y;
    const d = dx * dx + dy * dy;
    if (d <= bestDistance) {
      bestDistance = d;
      best = i;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Constrained Delaunay triangulation
// ---------------------------------------------------------------------------

/*
 * Own implementation, no dependency. Three steps, in this order:
 *
 *   1. Ear clipping of the outline (the first `hull` vertices), which works on
 *      a concave polygon and never produces a triangle outside it.
 *   2. Insertion of every interior vertex: the triangle containing it is split
 *      into three.
 *   3. Delaunay optimisation by edge flipping. An edge of the outline or an
 *      edge the user asked for is never flipped, which is what makes the
 *      result CONSTRAINED Delaunay. A requested edge that the first two steps
 *      did not produce is recovered first, by flipping the edges it crosses.
 *
 * Every triangle is stored counter-clockwise, as spec 7.4 requires.
 */

/** Twice the signed area of a triangle; positive when counter-clockwise. */
function cross(ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}

/** Twice the signed area of a polygon given as indices into `points`. */
function polygonArea2(points: readonly number[], loop: readonly number[]): number {
  let sum = 0;
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i], b = loop[(i + 1) % loop.length];
    sum += points[2 * a] * points[2 * b + 1] - points[2 * b] * points[2 * a + 1];
  }
  return sum;
}

/** `true` when `p` is inside (or on) triangle `a b c`, which must be CCW. */
function pointInTriangle(
  points: readonly number[], a: number, b: number, c: number, px: number, py: number,
): boolean {
  const ax = points[2 * a], ay = points[2 * a + 1];
  const bx = points[2 * b], by = points[2 * b + 1];
  const cx = points[2 * c], cy = points[2 * c + 1];
  const d0 = cross(ax, ay, bx, by, px, py);
  const d1 = cross(bx, by, cx, cy, px, py);
  const d2 = cross(cx, cy, ax, ay, px, py);
  return d0 >= 0 && d1 >= 0 && d2 >= 0;
}

/** Ear clipping of one simple polygon. Returns counter-clockwise triangles. */
export function earClip(points: readonly number[], loop: readonly number[]): number[] {
  const out: number[] = [];
  if (loop.length < 3) return out;
  const ring = loop.slice();
  if (polygonArea2(points, ring) < 0) ring.reverse();

  let guard = ring.length * ring.length + 16;
  while (ring.length > 3 && guard-- > 0) {
    let clipped = false;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[(i + ring.length - 1) % ring.length];
      const b = ring[i];
      const c = ring[(i + 1) % ring.length];
      const ax = points[2 * a], ay = points[2 * a + 1];
      const bx = points[2 * b], by = points[2 * b + 1];
      const cx = points[2 * c], cy = points[2 * c + 1];
      if (cross(ax, ay, bx, by, cx, cy) <= 0) continue;   // reflex or flat corner
      let empty = true;
      for (const other of ring) {
        if (other === a || other === b || other === c) continue;
        if (pointInTriangle(points, a, b, c, points[2 * other], points[2 * other + 1])) {
          empty = false;
          break;
        }
      }
      if (!empty) continue;
      out.push(a, b, c);
      ring.splice(i, 1);
      clipped = true;
      break;
    }
    if (!clipped) break;    // outline crosses itself: stop with what we have
  }
  if (ring.length === 3) out.push(ring[0], ring[1], ring[2]);
  return out;
}

/** `true` when `d` falls strictly inside the circumcircle of CCW `a b c`. */
function inCircle(
  points: readonly number[], a: number, b: number, c: number, d: number,
): boolean {
  const ax = points[2 * a] - points[2 * d], ay = points[2 * a + 1] - points[2 * d + 1];
  const bx = points[2 * b] - points[2 * d], by = points[2 * b + 1] - points[2 * d + 1];
  const cx = points[2 * c] - points[2 * d], cy = points[2 * c + 1] - points[2 * d + 1];
  const det = (ax * ax + ay * ay) * (bx * cy - by * cx)
    - (bx * bx + by * by) * (ax * cy - ay * cx)
    + (cx * cx + cy * cy) * (ax * by - ay * bx);
  return det > 1e-9;
}

function edgeKey(a: number, b: number): string {
  return a < b ? `${a},${b}` : `${b},${a}`;
}

/** For each undirected edge, the triangles that use it (at most two). */
function adjacency(triangles: readonly number[]): Map<string, number[]> {
  const map = new Map<string, number[]>();
  for (let t = 0; t < triangles.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const k = edgeKey(triangles[t + e], triangles[t + ((e + 1) % 3)]);
      const list = map.get(k);
      if (list === undefined) map.set(k, [t]);
      else list.push(t);
    }
  }
  return map;
}

/** The vertex of triangle `t` that is neither `a` nor `b`, or `-1`. */
function apexOf(triangles: readonly number[], t: number, a: number, b: number): number {
  for (let e = 0; e < 3; e++) {
    const v = triangles[t + e];
    if (v !== a && v !== b) return v;
  }
  return -1;
}

/** Rewrites triangle `t` in place. */
function setTriangle(triangles: number[], t: number, a: number, b: number, c: number): void {
  triangles[t] = a;
  triangles[t + 1] = b;
  triangles[t + 2] = c;
}

/** Puts triangle `t` back in counter-clockwise order. */
function orient(points: readonly number[], triangles: number[], t: number): void {
  const a = triangles[t], b = triangles[t + 1], c = triangles[t + 2];
  if (polygonArea2(points, [a, b, c]) < 0) setTriangle(triangles, t, a, c, b);
}

/** `true` when the quadrilateral `a c b d`, in that order, is strictly convex. */
function isConvexQuad(points: readonly number[], a: number, c: number, b: number, d: number): boolean {
  const loop = [a, c, b, d];
  let sign = 0;
  for (let i = 0; i < 4; i++) {
    const p = loop[i], q = loop[(i + 1) % 4], r = loop[(i + 2) % 4];
    const z = cross(
      points[2 * p], points[2 * p + 1],
      points[2 * q], points[2 * q + 1],
      points[2 * r], points[2 * r + 1],
    );
    if (Math.abs(z) < 1e-9) return false;
    const s = z > 0 ? 1 : -1;
    if (sign === 0) sign = s;
    else if (sign !== s) return false;
  }
  return true;
}

/**
 * Replaces the two triangles sharing edge `p q` by the two that share `c d`,
 * where `c` and `d` are the apexes. Both come out counter-clockwise.
 */
function flip(
  points: readonly number[], triangles: number[],
  t1: number, t2: number, p: number, q: number, c: number, d: number,
): void {
  setTriangle(triangles, t1, c, p, d);
  setTriangle(triangles, t2, c, d, q);
  orient(points, triangles, t1);
  orient(points, triangles, t2);
}

/**
 * Flips every non-constrained edge that fails the Delaunay test, until none
 * does. Each pass rebuilds the adjacency, which is cheap for editor meshes.
 */
function delaunayFlip(points: readonly number[], triangles: number[], fixed: ReadonlySet<string>): void {
  let guard = triangles.length * 8 + 64;
  let changed = true;
  while (changed && guard-- > 0) {
    changed = false;
    const map = adjacency(triangles);
    for (const [k, list] of map) {
      if (list.length !== 2 || fixed.has(k)) continue;
      const parts = k.split(',');
      const p = Number(parts[0]);
      const q = Number(parts[1]);
      const t1 = list[0], t2 = list[1];
      const c = apexOf(triangles, t1, p, q);
      const d = apexOf(triangles, t2, p, q);
      if (c < 0 || d < 0 || c === d) continue;
      if (!inCircle(points, triangles[t1], triangles[t1 + 1], triangles[t1 + 2], d)) continue;
      if (!isConvexQuad(points, p, c, q, d)) continue;   // a fold would follow
      flip(points, triangles, t1, t2, p, q, c, d);
      changed = true;
      break;
    }
  }
}

/** How far from an edge a point may be and still count as being ON it. */
const ON_EDGE = 1e-9;

/**
 * Splits the triangle that holds vertex `v`.
 *
 * A point STRICTLY inside a triangle splits it into three. A point that falls
 * exactly ON an edge is the case that must not be missed: splitting the
 * triangle into three would make one of them have zero area, and a mesh with a
 * zero-area triangle is a mesh with a hole in the middle of a straight line. So
 * the edge is split instead, in both triangles that share it.
 */
function insertPoint(points: readonly number[], triangles: number[], v: number): boolean {
  const px = points[2 * v], py = points[2 * v + 1];
  const sideOf = (t: number, e: number): number => {
    const p = triangles[t + e], q = triangles[t + ((e + 1) % 3)];
    return cross(points[2 * p], points[2 * p + 1], points[2 * q], points[2 * q + 1], px, py);
  };

  for (let t = 0; t < triangles.length; t += 3) {
    if (sideOf(t, 0) > ON_EDGE && sideOf(t, 1) > ON_EDGE && sideOf(t, 2) > ON_EDGE) {
      const a = triangles[t], b = triangles[t + 1], c = triangles[t + 2];
      setTriangle(triangles, t, a, b, v);
      triangles.push(b, c, v, c, a, v);
      return true;
    }
  }

  const total = triangles.length;
  for (let t = 0; t < total; t += 3) {
    for (let e = 0; e < 3; e++) {
      if (Math.abs(sideOf(t, e)) > ON_EDGE) continue;
      if (sideOf(t, (e + 1) % 3) <= ON_EDGE || sideOf(t, (e + 2) % 3) <= ON_EDGE) continue;
      splitEdge(triangles, t, e, v);
      return true;
    }
  }
  return false;
}

/** Cuts edge `e` of triangle `t` at vertex `v`, in both triangles that share it. */
function splitEdge(triangles: number[], t: number, e: number, v: number): void {
  const a = triangles[t + e];
  const b = triangles[t + ((e + 1) % 3)];
  const c = triangles[t + ((e + 2) % 3)];
  let other = -1;
  let apex = -1;
  for (let k = 0; k < triangles.length; k += 3) {
    if (k === t) continue;
    const tri = [triangles[k], triangles[k + 1], triangles[k + 2]];
    if (!tri.includes(a) || !tri.includes(b)) continue;
    other = k;
    apex = apexOf(triangles, k, a, b);
    break;
  }
  setTriangle(triangles, t, a, v, c);
  triangles.push(v, b, c);
  if (other >= 0 && apex >= 0) {
    setTriangle(triangles, other, b, v, apex);
    triangles.push(v, a, apex);
  }
}

/** Drops triangles with no area at all: they cover nothing and confuse a flip. */
function dropDegenerate(points: readonly number[], triangles: readonly number[]): number[] {
  const out: number[] = [];
  for (let t = 0; t + 2 < triangles.length; t += 3) {
    const a = triangles[t], b = triangles[t + 1], c = triangles[t + 2];
    if (Math.abs(polygonArea2(points, [a, b, c])) <= 1e-12) continue;
    out.push(a, b, c);
  }
  return out;
}

/** Do segments `p q` and `r s` cross in their interiors? */
function segmentsCross(
  points: readonly number[], p: number, q: number, r: number, s: number,
): boolean {
  if (p === r || p === s || q === r || q === s) return false;
  const px = points[2 * p], py = points[2 * p + 1];
  const qx = points[2 * q], qy = points[2 * q + 1];
  const rx = points[2 * r], ry = points[2 * r + 1];
  const sx = points[2 * s], sy = points[2 * s + 1];
  const d1 = cross(px, py, qx, qy, rx, ry);
  const d2 = cross(px, py, qx, qy, sx, sy);
  const d3 = cross(rx, ry, sx, sy, px, py);
  const d4 = cross(rx, ry, sx, sy, qx, qy);
  return ((d1 > 0) !== (d2 > 0)) && ((d3 > 0) !== (d4 > 0));
}

/** `true` when the triangulation already contains the edge `a b`. */
function containsEdge(triangles: readonly number[], a: number, b: number): boolean {
  for (let t = 0; t < triangles.length; t += 3) {
    for (let e = 0; e < 3; e++) {
      const p = triangles[t + e], q = triangles[t + ((e + 1) % 3)];
      if ((p === a && q === b) || (p === b && q === a)) return true;
    }
  }
  return false;
}

/**
 * Forces the edge `a b` into the triangulation by flipping the edges it
 * crosses, one at a time: the recovery step of a constrained triangulation.
 * An edge that cannot be recovered is left out, and the mesh stays valid.
 */
function recoverEdge(points: readonly number[], triangles: number[], a: number, b: number): void {
  let guard = triangles.length * 4 + 32;
  while (!containsEdge(triangles, a, b) && guard-- > 0) {
    const map = adjacency(triangles);
    let flipped = false;
    for (const [k, list] of map) {
      if (list.length !== 2) continue;
      const parts = k.split(',');
      const p = Number(parts[0]);
      const q = Number(parts[1]);
      if (!segmentsCross(points, a, b, p, q)) continue;
      const t1 = list[0], t2 = list[1];
      const c = apexOf(triangles, t1, p, q);
      const d = apexOf(triangles, t2, p, q);
      if (c < 0 || d < 0 || c === d) continue;
      if (!isConvexQuad(points, p, c, q, d)) continue;
      flip(points, triangles, t1, t2, p, q, c, d);
      flipped = true;
      break;
    }
    if (!flipped) return;
  }
}

/**
 * Constrained Delaunay triangulation of a mesh.
 *
 * `points` is `2N` positions, the first `hull` of them the outline in order
 * and the rest interior. `edges` are pairs the result should contain. Returns
 * `3T` counter-clockwise indices, ready for `mesh.triangles` (spec 7.4).
 */
export function triangulate(
  points: readonly number[], hull: number, edges: readonly number[] = [],
): number[] {
  const n = points.length >> 1;
  if (n < 3) return [];
  const outline = Math.max(3, Math.min(hull > 0 ? hull : n, n));
  const loop: number[] = [];
  for (let i = 0; i < outline; i++) loop.push(i);

  const triangles = earClip(points, loop);
  if (triangles.length === 0) return [];

  for (let v = outline; v < n; v++) insertPoint(points, triangles, v);

  const fixed = new Set<string>();
  for (let i = 0; i < outline; i++) fixed.add(edgeKey(loop[i], loop[(i + 1) % outline]));
  for (let i = 0; i + 1 < edges.length; i += 2) {
    const a = edges[i], b = edges[i + 1];
    if (a < 0 || b < 0 || a >= n || b >= n || a === b) continue;
    if (!containsEdge(triangles, a, b)) recoverEdge(points, triangles, a, b);
    fixed.add(edgeKey(a, b));
  }

  delaunayFlip(points, triangles, fixed);
  return dropDegenerate(points, triangles);
}

// ---------------------------------------------------------------------------
// Automatic mesh from the silhouette of an image (requirement R4)
// ---------------------------------------------------------------------------

/*
 * Four steps, none of them touching the DOM:
 *
 *   1. read the alpha channel and call every pixel above a threshold "drawing";
 *   2. walk the border of the drawing, pixel by pixel (Moore tracing), which
 *      gives a closed loop with one point per boundary pixel;
 *   3. throw away the points that add nothing (Douglas-Peucker), so a hand
 *      drawn outline of 2000 pixels becomes 30 vertices an artist can move;
 *   4. drop interior vertices on a grid and triangulate everything together.
 *
 * The image is read in PIXEL space (X right, Y DOWN, origin top-left). The
 * geometry comes out in the bone's LOCAL space (Y up, origin at the centre of
 * the image), with the UVs of spec 7.4 (`v = 0` at the top).
 */

/** An image the tracer can read: exactly the shape of a DOM `ImageData`. */
export interface ImageLike {
  width: number;
  height: number;
  /** RGBA bytes, row by row, from the top. */
  data: ArrayLike<number>;
}

export interface AutoMeshOptions {
  /** Alpha from which a pixel counts as drawing, `0..1`. Default `0.05`. */
  alpha?: number;
  /**
   * Quanto o contorno gerado fica afastado da arte, para fora, em pixels da
   * imagem — item 4.1, plano "caixa, ossos e malha". `traceOutline` andava em
   * cima do primeiro pixel opaco, e a malha comia a borda do desenho.
   * Ligado por padrão (`DEFAULT_OUTLINE_OUTSET`); `0` desliga.
   */
  outset?: number;
  /** Simplification tolerance, in image pixels. Default `2`. */
  tolerance?: number;
  /** Most outline vertices kept. Default `48`. */
  maxHull?: number;
  /** Distance between interior vertices, in image pixels. `0` = none. */
  spacing?: number;
  /** Size of the mesh in skeleton pixels. Default: the size of the image. */
  width?: number;
  height?: number;
  /** Where the centre of the image sits in the bone's local space. */
  x?: number;
  y?: number;
}

/** O afastamento do contorno com que a malha automática nasce, em pixels da imagem. */
export const DEFAULT_OUTLINE_OUTSET = 2;

/** `true` when the pixel is inside the image and opaque enough. */
function isSolid(image: ImageLike, x: number, y: number, threshold: number): boolean {
  if (x < 0 || y < 0 || x >= image.width || y >= image.height) return false;
  return image.data[(y * image.width + x) * 4 + 3] >= threshold;
}

/**
 * A máscara opaca "inchada" `outset` pixels para fora — o afastamento do
 * contorno (item 4.1). Dilatação separável (linhas, depois colunas), a mesma
 * conta de toda dilatação de imagem: um quadrado de lado `2·outset`, barato e
 * sem risco de a malha se cruzar em canto côncavo, porque é feita em cima do
 * raster, não deslocando vértices.
 */
function dilatedMask(image: ImageLike, threshold: number, outset: number): Uint8Array {
  const { width, height } = image;
  const base = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      base[y * width + x] = isSolid(image, x, y, threshold) ? 1 : 0;
    }
  }
  if (outset <= 0) return base;
  const r = Math.max(1, Math.round(outset));
  const rows = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let hit = 0;
      for (let dx = -r; dx <= r && hit === 0; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width && base[y * width + nx] === 1) hit = 1;
      }
      rows[y * width + x] = hit;
    }
  }
  const out = new Uint8Array(width * height);
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      let hit = 0;
      for (let dy = -r; dy <= r && hit === 0; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height && rows[ny * width + x] === 1) hit = 1;
      }
      out[y * width + x] = hit;
    }
  }
  return out;
}

/** The eight neighbours, clockwise in pixel space, starting at west. */
const MOORE: ReadonlyArray<readonly [number, number]> = [
  [-1, 0], [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1],
];

/**
 * The outline of the drawing, as `2K` pixel coordinates of the boundary
 * pixels, in order. Empty when the image has no opaque pixel.
 *
 * Moore neighbourhood tracing: from the first opaque pixel found scanning top
 * to bottom, walk clockwise around the shape, always starting the search for
 * the next boundary pixel just after the one we came from. Only the OUTER
 * border is followed; holes stay inside the mesh, which is what a deformable
 * piece of art needs.
 *
 * `outset` (item 4.1) traces the border of the DILATED mask instead of the
 * bare pixels, so the outline sits that many pixels away from the artwork —
 * `0`, the default here, keeps the exact pixel the trace always walked on.
 * `autoMeshFromImage` is the caller that turns the offset ON by default.
 */
export function traceOutline(image: ImageLike, alpha = 0.05, outset = 0): number[] {
  const threshold = Math.max(1, Math.round(alpha * 255));
  const mask = dilatedMask(image, threshold, outset);
  const solid = (x: number, y: number): boolean => {
    if (x < 0 || y < 0 || x >= image.width || y >= image.height) return false;
    return mask[y * image.width + x] === 1;
  };
  let startX = -1;
  let startY = -1;
  for (let y = 0; y < image.height && startY < 0; y++) {
    for (let x = 0; x < image.width; x++) {
      if (solid(x, y)) {
        startX = x;
        startY = y;
        break;
      }
    }
  }
  if (startY < 0) return [];

  const out: number[] = [startX, startY];
  let cx = startX;
  let cy = startY;
  // We arrived from the west: the scan proves that pixel is empty.
  let from = 0;
  let guard = image.width * image.height * 4 + 64;
  while (guard-- > 0) {
    let found = false;
    for (let step = 1; step <= 8; step++) {
      const dir = (from + step) % 8;
      const nx = cx + MOORE[dir][0];
      const ny = cy + MOORE[dir][1];
      if (!solid(nx, ny)) continue;
      // Around the new pixel, the one we came from lies at `dir + 4`; the
      // sweep starts right after it, so nothing is skipped.
      from = (dir + 4) % 8;
      cx = nx;
      cy = ny;
      found = true;
      break;
    }
    if (!found) break;                       // a single isolated pixel
    if (cx === startX && cy === startY) break;
    out.push(cx, cy);
  }
  return out;
}

/** Distance from `p` to the segment `a b`. */
function distanceToSegment(
  px: number, py: number, ax: number, ay: number, bx: number, by: number,
): number {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = len2 <= 1e-12 ? 0 : ((px - ax) * dx + (py - ay) * dy) / len2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = ax + dx * t;
  const qy = ay + dy * t;
  return Math.hypot(px - qx, py - qy);
}

/** Douglas-Peucker over one open chain of indices. Keeps both ends. */
function simplifyChain(
  points: readonly number[], first: number, last: number, tolerance: number, keep: boolean[],
): void {
  if (last <= first + 1) return;
  const ax = points[2 * first], ay = points[2 * first + 1];
  const bx = points[2 * last], by = points[2 * last + 1];
  let worst = -1;
  let worstDistance = tolerance;
  for (let i = first + 1; i < last; i++) {
    const d = distanceToSegment(points[2 * i], points[2 * i + 1], ax, ay, bx, by);
    if (d > worstDistance) {
      worstDistance = d;
      worst = i;
    }
  }
  if (worst < 0) return;
  keep[worst] = true;
  simplifyChain(points, first, worst, tolerance, keep);
  simplifyChain(points, worst, last, tolerance, keep);
}

/**
 * Drops the points of a CLOSED loop that stay closer than `tolerance` to the
 * line between the points kept around them (Douglas-Peucker). The loop is cut
 * at the point farthest from the first one, so the two chains are simplified
 * without the cut showing.
 */
export function simplifyLoop(points: readonly number[], tolerance: number): number[] {
  const n = points.length >> 1;
  if (n <= 3 || tolerance <= 0) return points.slice();
  let far = 0;
  let farDistance = -1;
  for (let i = 1; i < n; i++) {
    const d = Math.hypot(points[2 * i] - points[0], points[2 * i + 1] - points[1]);
    if (d > farDistance) {
      farDistance = d;
      far = i;
    }
  }
  const keep = new Array<boolean>(n).fill(false);
  keep[0] = true;
  keep[far] = true;
  simplifyChain(points, 0, far, tolerance, keep);
  // The second chain ends back at the first point, so it is simplified over a
  // copy that carries point 0 at the end.
  const tail: number[] = [];
  const index: number[] = [];
  for (let i = far; i < n; i++) {
    tail.push(points[2 * i], points[2 * i + 1]);
    index.push(i);
  }
  tail.push(points[0], points[1]);
  index.push(0);
  const tailKeep = new Array<boolean>(index.length).fill(false);
  tailKeep[0] = true;
  tailKeep[index.length - 1] = true;
  simplifyChain(tail, 0, index.length - 1, tolerance, tailKeep);
  for (let i = 0; i < index.length; i++) if (tailKeep[i]) keep[index[i]] = true;

  const out: number[] = [];
  for (let i = 0; i < n; i++) if (keep[i]) out.push(points[2 * i], points[2 * i + 1]);
  return out;
}

/** Keeps at most `max` points of a loop, evenly spaced along it. */
export function limitLoop(points: readonly number[], max: number): number[] {
  const n = points.length >> 1;
  if (max < 3 || n <= max) return points.slice();
  const out: number[] = [];
  for (let i = 0; i < max; i++) {
    const index = Math.round((i * n) / max) % n;
    out.push(points[2 * index], points[2 * index + 1]);
  }
  return out;
}

/** `true` when the point is inside the closed polygon (ray casting). */
export function pointInPolygon(polygon: readonly number[], x: number, y: number): boolean {
  const n = polygon.length >> 1;
  let inside = false;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[2 * i], yi = polygon[2 * i + 1];
    const xj = polygon[2 * j], yj = polygon[2 * j + 1];
    const crosses = (yi > y) !== (yj > y)
      && x < ((xj - xi) * (y - yi)) / (yj - yi + (yj === yi ? 1e-12 : 0)) + xi;
    if (crosses) inside = !inside;
  }
  return inside;
}

/** Smallest distance from a point to the border of a polygon. */
export function distanceToPolygon(polygon: readonly number[], x: number, y: number): number {
  const n = polygon.length >> 1;
  let best = Infinity;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const d = distanceToSegment(
      x, y, polygon[2 * j], polygon[2 * j + 1], polygon[2 * i], polygon[2 * i + 1],
    );
    if (d < best) best = d;
  }
  return best;
}

/**
 * Points on a staggered grid of side `spacing`, inside `polygon` and at least
 * half a step away from its border, so no interior vertex lands on the
 * outline and makes a sliver triangle.
 */
export function interiorGrid(polygon: readonly number[], spacing: number): number[] {
  const out: number[] = [];
  if (spacing <= 0 || polygon.length < 6) return out;
  const box = boundsOf(polygon);
  const margin = spacing * 0.5;
  let row = 0;
  for (let y = box.minY + spacing * 0.5; y <= box.maxY; y += spacing, row++) {
    const shift = (row % 2) * spacing * 0.5;
    for (let x = box.minX + spacing * 0.5 + shift; x <= box.maxX; x += spacing) {
      if (!pointInPolygon(polygon, x, y)) continue;
      if (distanceToPolygon(polygon, x, y) < margin) continue;
      out.push(x, y);
    }
  }
  return out;
}

/** Twice the signed area of a closed loop, positive when counter-clockwise. */
function loopArea2(points: readonly number[]): number {
  const n = points.length >> 1;
  let sum = 0;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    sum += points[2 * j] * points[2 * i + 1] - points[2 * i] * points[2 * j + 1];
  }
  return sum;
}

/**
 * Turns pixel coordinates into a geometry: local positions, UVs, hull and
 * triangles. `hullPixels` is the outline in order, `insidePixels` the interior
 * points; both are `2K` arrays in image pixel space.
 */
export function geometryFromPixels(
  image: ImageSize, hullPixels: readonly number[], insidePixels: readonly number[],
  options: AutoMeshOptions = {},
): MeshGeometry {
  const W = options.width !== undefined && options.width > 0 ? options.width : image.width;
  const H = options.height !== undefined && options.height > 0 ? options.height : image.height;
  const cx = options.x ?? 0;
  const cy = options.y ?? 0;
  const sx = image.width > 0 ? W / image.width : 1;
  const sy = image.height > 0 ? H / image.height : 1;

  const hull = hullPixels.slice();
  // Counter-clockwise in local space: the Y flip below turns a clockwise pixel
  // loop into a counter-clockwise one, so the pixel loop must be clockwise.
  if (loopArea2(hull) > 0) {
    const reversed: number[] = [];
    for (let i = (hull.length >> 1) - 1; i >= 0; i--) reversed.push(hull[2 * i], hull[2 * i + 1]);
    hull.length = 0;
    hull.push(...reversed);
  }

  const vertices: number[] = [];
  const uvs: number[] = [];
  const push = (px: number, py: number): void => {
    vertices.push((px - image.width / 2) * sx + cx, (image.height / 2 - py) * sy + cy);
    uvs.push(image.width > 0 ? px / image.width : 0, image.height > 0 ? py / image.height : 0);
  };
  for (let i = 0; i + 1 < hull.length; i += 2) push(hull[i], hull[i + 1]);
  for (let i = 0; i + 1 < insidePixels.length; i += 2) push(insidePixels[i], insidePixels[i + 1]);

  const hullCount = hull.length >> 1;
  return {
    vertices,
    uvs,
    triangles: triangulate(vertices, hullCount),
    edges: [],
    hull: hullCount,
  };
}

/**
 * A whole mesh from the silhouette of an image: trace, simplify, fill with
 * interior vertices, triangulate. This is the "Gerar automática" button.
 *
 * `spacing` defaults to a sixth of the smaller side of the image, which gives
 * a mesh dense enough to bend an arm and light enough to edit by hand.
 */
export function autoMeshFromImage(image: ImageLike, options: AutoMeshOptions = {}): MeshGeometry {
  const traced = traceOutline(image, options.alpha ?? 0.05, options.outset ?? DEFAULT_OUTLINE_OUTSET);
  if (traced.length < 6) throw new Error('a imagem não tem desenho para traçar');
  const simplified = limitLoop(
    simplifyLoop(traced, options.tolerance ?? 2),
    options.maxHull ?? 48,
  );
  if ((simplified.length >> 1) < 3) throw new Error('o contorno ficou com menos de 3 vértices');
  const spacing = options.spacing ?? Math.max(6, Math.min(image.width, image.height) / 6);
  const inside = interiorGrid(simplified, spacing);
  return geometryFromPixels(image, simplified, inside, options);
}

/** Only the outline, with no interior vertex: the "Traçar contorno" button. */
export function traceHullFromImage(image: ImageLike, options: AutoMeshOptions = {}): MeshGeometry {
  return autoMeshFromImage(image, { ...options, spacing: 0 });
}
