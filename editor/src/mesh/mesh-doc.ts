/**
 * The bridge between the pure mesh functions and the document (owner C).
 *
 * `mesh-edit.ts` and `weights.ts` know nothing about the editor: they take
 * arrays and give arrays back. This module is the only place that knows how to
 * find the selected mesh inside the file, how to write it back as a command,
 * and — the rule that matters most — WHERE a vertex move has to land:
 *
 *   MONTAGEM  (`doc.animation === null`)  the rest mesh changes: `vertices`
 *     (or `binding.positions`) of the attachment are rewritten.
 *   ANIMAÇÃO  (`doc.animation !== null`)  the rest mesh is NOT touched. The
 *     move becomes a `deform` key at `doc.time`, through `setPropertyOrKey`
 *     of `anim/pose-mode.ts` (spec 9.6).
 *
 * Deform layout, spec 7.4: `2N` offsets for a mesh without weights, `2 x sum
 * counts` for one with weights — one offset per INFLUENCE, in that bone's own
 * local space. Moving a vertex by `d` in world therefore writes `M^-1 d` on
 * each of its influences, without the translation: the weights add up to 1, so
 * the vertex lands exactly on the pointer.
 */

import {
  inverseTransformPoint, invertMatrix,
  type BoundingBoxAttachmentDef, type ClippingAttachmentDef, type Matrix2x3,
  type MeshAttachmentDef, type PathAttachmentDef, type Skeleton,
} from '../../../runtime/src/index.js';
import { corpoDe, wentToBase } from '../contract.js';
import type { EditorDoc } from '../contract.js';
import { pointerOf, SetProperties, SetProperty } from '../doc/commands.js';
import { deformTarget, findTimeline, weightsTarget } from '../anim/keying.js';
import { valueAt } from '../anim/keying.js';
import { setPropertyOrKey } from '../anim/pose-mode.js';
import { findAttachment } from '../doc/attachments.js';
import {
  addHullVertex, addVertex, moveVertex, removeVertex, type MeshGeometry,
} from './mesh-edit.js';
import {
  bindAttachment, bindBone, boneFramesOf, cloneTable, emptyTable, geometryWorldPositions,
  influencingBones, tableOf, unbindAttachment, unbindBone, worldPositionsOf,
  type BoneFrame, type WeightTable,
} from './weights.js';

// ---------------------------------------------------------------------------
// Finding the mesh the user is working on
// ---------------------------------------------------------------------------

/**
 * Os quatro anexos que a ferramenta **Malha** pega — degrau 7, tarefa 7.4
 * (defeito A3).
 *
 * A ficha da caixa e a da máscara sempre disseram *"arraste com a ferramenta
 * Malha"*, e a Malha só pegava `mesh`: a frase mandava para uma porta fechada.
 * Os quatro guardam o contorno do mesmo jeito (`vertices` ou `binding`, 7.4),
 * então uma conta só serve para os quatro. O que NÃO serve para os quatro são
 * os campos de desenho: `uvs`, `triangles` e `hull` são do `mesh`, e o
 * `lengths` é do `path` — `geometryEntries` grava só o que o tipo tem.
 */
export type ShapeKind = 'mesh' | 'boundingbox' | 'clipping' | 'path';

/** Os tipos de anexo que a Malha edita, na ordem em que a ficha os lista. */
export const SHAPE_KINDS: readonly ShapeKind[] = Object.freeze([
  'mesh', 'boundingbox', 'clipping', 'path',
]);

/** O anexo de um dos quatro tipos, como o arquivo o guarda. */
export type ShapeDef =
  | MeshAttachmentDef | BoundingBoxAttachmentDef | ClippingAttachmentDef | PathAttachmentDef;

/**
 * O contorno como as contas de peso o veem.
 *
 * `weights.ts` recebe `MeshAttachmentDef`, mas lê e escreve **só** `vertices`
 * e `binding`, que os quatro tipos têm com o mesmo significado (7.4). O molde
 * fica aqui, num lugar só, para a conversa com `weights.ts` não se espalhar em
 * conversões soltas pelo arquivo.
 */
export function asMeshDef(def: ShapeDef): MeshAttachmentDef {
  return def as MeshAttachmentDef;
}

/** The mesh attachment being edited, with everything needed to write it back. */
export interface MeshRef {
  readonly slot: string;
  readonly attachment: string;
  readonly skin: string;
  readonly skinIndex: number;
  readonly def: ShapeDef;
  /** Qual dos quatro é — degrau 7. `'mesh'` é o de sempre. */
  readonly kind: ShapeKind;
}

/** JSON Pointer of one field of the attachment. */
export function meshPointer(ref: MeshRef, property: string): string {
  return pointerOf('skins', ref.skinIndex, 'attachments', ref.slot, ref.attachment, property);
}

/**
 * The mesh the selection points at, or `null`.
 *
 * A selected attachment wins; with only a slot selected, the attachment the
 * slot shows is used, which is what the artist means by "this drawing".
 */
export function selectedMesh(doc: EditorDoc): MeshRef | null {
  const picked = doc.selection.attachments[0];
  if (picked !== undefined) return meshRef(doc, picked.slot, picked.attachment);
  const slot = doc.selection.slots[0];
  if (slot === undefined) return null;
  const name = (corpoDe(doc).file.slots ?? []).find((entry) => entry.name === slot)?.attachment;
  if (typeof name !== 'string') return null;
  return meshRef(doc, slot, name);
}

/**
 * O contorno de um par slot/anexo, ou `null` quando aquele anexo não tem
 * contorno para arrastar.
 *
 * Degrau 7: além do `mesh`, passam a valer a **caixa** (7.6), a **máscara**
 * (7.7) e o **caminho** (7.8). Uma caixa em `rectangle` ou `ellipse` fica de
 * fora de propósito: ela não tem cantos, tem centro e tamanho, e quem os edita
 * é a ficha. `shapeRefusal` diz isso em voz alta (regra 21).
 */
export function meshRef(doc: EditorDoc, slot: string, attachment: string): MeshRef | null {
  const found = findAttachment(corpoDe(doc).file, slot, attachment);
  if (found === null) return null;
  const def = found.def as ShapeDef;
  const kind = def.type as ShapeKind;
  if (!SHAPE_KINDS.includes(kind)) return null;
  if (kind === 'boundingbox' && !polygonBox(def as BoundingBoxAttachmentDef)) return null;
  return {
    slot, attachment, skin: found.skinName, skinIndex: found.skin, def, kind,
  };
}

/** Uma caixa de contorno, e não uma de retângulo ou elipse (7.6). */
function polygonBox(def: BoundingBoxAttachmentDef): boolean {
  const shape = def.shape ?? 'polygon';
  return shape === 'polygon';
}

/**
 * A frase para o anexo escolhido que a Malha **não** pega, ou `null` quando
 * ela pega — regra 21: onde o programa não entende, ele avisa.
 */
export function shapeRefusal(doc: EditorDoc): string | null {
  const picked = doc.selection.attachments[0];
  const slot = picked?.slot ?? doc.selection.slots[0];
  if (slot === undefined) return null;
  const name = picked?.attachment
    ?? (corpoDe(doc).file.slots ?? []).find((entry) => entry.name === slot)?.attachment;
  if (typeof name !== 'string') return null;
  const found = attachmentRef(doc, slot, name);
  if (found === null) return null;
  const type = found.def.type;
  if (type === 'boundingbox') {
    const shape = (found.def as BoundingBoxAttachmentDef).shape ?? 'polygon';
    if (shape === 'polygon') return null;
    return `"${name}" é uma caixa em ${shape === 'ellipse' ? 'elipse' : 'retângulo'}: o centro e o tamanho se editam na ficha.`;
  }
  if (SHAPE_KINDS.includes(type as ShapeKind)) return null;
  return `"${name}" não tem contorno para arrastar: a Malha pega malha, caixa, máscara e caminho.`;
}

/** O caminho não ganha nem perde ponto pela cena — a frase que a Malha diz. */
export const PATH_VERTEX_NOTICE =
  'Um caminho anda de três em três pontos (entra, âncora, sai): arraste os que existem; criar e apagar âncora ainda não tem porta.';

/** The attachment of one slot/attachment pair, whatever its type. */
export function attachmentRef(
  doc: EditorDoc, slot: string, attachment: string,
): { skinIndex: number; skinName: string; def: { type: string } } | null {
  const found = findAttachment(corpoDe(doc).file, slot, attachment);
  if (found === null) return null;
  return { skinIndex: found.skin, skinName: found.skinName, def: found.def };
}

// ---------------------------------------------------------------------------
// Bones and frames
// ---------------------------------------------------------------------------

/** Bone frames of the live skeleton, or an empty list while it does not load. */
export function framesOf(doc: EditorDoc): BoneFrame[] {
  const skeleton: Skeleton | null = doc.skeleton;
  return skeleton === null ? [] : boneFramesOf(skeleton);
}

/** World matrix of the bone a slot hangs from, or the identity. */
export function slotFrameOf(doc: EditorDoc, slot: string): Matrix2x3 {
  const skeleton = doc.skeleton;
  const identity: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  if (skeleton === null) return identity;
  const found = skeleton.slots.find((entry) => entry.data.name === slot);
  if (found === undefined) return identity;
  const bone = found.bone;
  return { a: bone.a, b: bone.b, c: bone.c, d: bone.d, worldX: bone.worldX, worldY: bone.worldY };
}

// ---------------------------------------------------------------------------
// Reading the mesh
// ---------------------------------------------------------------------------

/** Everything a tool or a panel needs to draw and edit one mesh. */
export interface MeshView {
  readonly ref: MeshRef;
  /** Geometry in the SLOT BONE's local space, weights or not. */
  readonly geometry: MeshGeometry;
  /** Weights per vertex; empty maps when the mesh has none. */
  readonly weights: WeightTable;
  readonly weighted: boolean;
  readonly frames: BoneFrame[];
  readonly slotFrame: Matrix2x3;
  /** Rest positions in world units, `2N`, with no deform applied. */
  readonly world: number[];
}

/**
 * The mesh as the editor works with it: geometry always in the slot bone's
 * local space, even when the file stores weights. That way one editing path
 * serves both kinds of mesh, and only the write-back differs.
 */
export function readMesh(doc: EditorDoc, ref: MeshRef): MeshView {
  const frames = framesOf(doc);
  const slotFrame = slotFrameOf(doc, ref.slot);
  const weighted = ref.def.binding !== undefined;
  const plain = weighted ? unbindAttachment(asMeshDef(ref.def), frames, slotFrame) : asMeshDef(ref.def);
  const vertices = (plain.vertices ?? []).slice();
  // Caixa, máscara e caminho não têm `uvs`, `triangles` nem `hull`: o contorno
  // é a lista inteira, e a geometria nasce com o contorno cheio. O desenho da
  // ferramenta e as contas de vértice servem aos quatro sem um `if` a mais.
  const mesh = asMeshDef(ref.def);
  const geometry: MeshGeometry = ref.kind === 'mesh'
    ? {
      vertices,
      uvs: (mesh.uvs ?? []).slice(),
      triangles: (mesh.triangles ?? []).slice(),
      edges: (mesh.edges ?? []).slice(),
      hull: mesh.hull ?? (vertices.length >> 1),
    }
    : { vertices, uvs: [], triangles: [], edges: [], hull: vertices.length >> 1 };
  return {
    ref,
    geometry,
    weights: tableOf(asMeshDef(ref.def)),
    weighted,
    frames,
    slotFrame,
    world: worldPositionsOf(asMeshDef(ref.def), frames, slotFrame),
  };
}

/**
 * World position of every vertex right now, deform included. Read from the
 * live skeleton when it has the attachment, so what the tool draws is exactly
 * what the renderer draws.
 */
export function liveWorldVertices(doc: EditorDoc, view: MeshView): number[] {
  const skeleton = doc.skeleton;
  const slot = skeleton?.slots.find((entry) => entry.data.name === view.ref.slot);
  const attachment = slot?.attachment as {
    computeWorldVertices?: (slot: unknown, out: number[], offset: number, stride: number) => unknown;
    vertexCount?: number;
  } | null | undefined;
  const count = view.geometry.vertices.length >> 1;
  if (slot !== undefined && attachment != null
    && typeof attachment.computeWorldVertices === 'function'
    && attachment.vertexCount === count) {
    const out = new Array<number>(count * 2).fill(0);
    attachment.computeWorldVertices(slot, out, 0, 2);
    return out;
  }
  return view.world.slice();
}

// ---------------------------------------------------------------------------
// Writing the mesh back — assembly mode
// ---------------------------------------------------------------------------

/**
 * O `lengths` de um caminho (7.8): o comprimento acumulado do começo até o fim
 * de cada curva, uma entrada por curva. O editor é quem o gera, e o validador
 * cobra o número de entradas (L1), então ele é refeito a cada mexida no
 * contorno.
 *
 * Os pontos vêm de três em três — `entra, âncora, sai` —, e cada curva é a
 * Bézier cúbica entre duas âncoras vizinhas. O comprimento sai de 16 pedaços
 * retos por curva: erro abaixo de um décimo de por cento numa curva de
 * desenho, e nenhuma dependência nova.
 */
export function pathLengths(vertices: readonly number[], closed: boolean): number[] {
  const points = vertices.length / 6;
  const anchors = Math.floor(points);
  if (anchors < 2) return [];
  const at = (index: number): [number, number] => {
    const i = ((index % (anchors * 3)) + anchors * 3) % (anchors * 3);
    return [vertices[2 * i] ?? 0, vertices[2 * i + 1] ?? 0];
  };
  const curves = closed ? anchors : anchors - 1;
  const out: number[] = [];
  let total = 0;
  for (let c = 0; c < curves; c++) {
    const p0 = at(3 * c + 1);
    const c1 = at(3 * c + 2);
    const c2 = at(3 * c + 3);
    const p1 = at(3 * c + 4);
    let last = p0;
    for (let step = 1; step <= 16; step++) {
      const t = step / 16;
      const u = 1 - t;
      const x = u * u * u * p0[0] + 3 * u * u * t * c1[0] + 3 * u * t * t * c2[0] + t * t * t * p1[0];
      const y = u * u * u * p0[1] + 3 * u * u * t * c1[1] + 3 * u * t * t * c2[1] + t * t * t * p1[1];
      total += Math.hypot(x - last[0], y - last[1]);
      last = [x, y];
    }
    out.push(total);
  }
  return out;
}

/** The fields a geometry writes into the attachment, as pointer/value pairs. */
function geometryEntries(
  view: MeshView, geo: MeshGeometry, weights: WeightTable,
): Array<readonly [string, unknown]> {
  const ref = view.ref;
  const entries: Array<readonly [string, unknown]> = [];
  if (view.weighted) {
    const withGeo: MeshAttachmentDef = { ...asMeshDef(ref.def), vertices: geo.vertices.slice() };
    delete withGeo.binding;
    const bound = bindAttachment(withGeo, weights, view.frames, view.slotFrame);
    entries.push([meshPointer(ref, 'binding'), bound.binding]);
  } else {
    entries.push([meshPointer(ref, 'vertices'), geo.vertices.slice()]);
  }
  // Só o `mesh` tem mapa de imagem e triângulos. Gravar `uvs: []` numa caixa
  // seria inventar campo que o leitor não espera — degrau 7, tarefa 7.4.
  if (ref.kind === 'mesh') {
    entries.push([meshPointer(ref, 'uvs'), geo.uvs.slice()]);
    entries.push([meshPointer(ref, 'triangles'), geo.triangles.slice()]);
    entries.push([meshPointer(ref, 'hull'), geo.hull]);
    entries.push([meshPointer(ref, 'edges'), geo.edges.length > 0 ? geo.edges.slice() : undefined]);
  }
  // O `lengths` do caminho é gerado pelo editor (7.8), e o validador cobra uma
  // entrada por curva: mexeu no contorno, ele é refeito.
  if (ref.kind === 'path') {
    const def = ref.def as PathAttachmentDef;
    entries.push([meshPointer(ref, 'lengths'), pathLengths(geo.vertices, def.closed === true)]);
  }
  return entries;
}

/**
 * Writes a whole geometry into the file, in one undo step. This is the REST
 * mesh: it is only ever called in assembly mode, or by a button that changes
 * the shape of the mesh on purpose ("Gerar automática").
 */
export function writeGeometry(
  doc: EditorDoc, view: MeshView, geo: MeshGeometry, label: string,
  options: { weights?: WeightTable; mergeable?: boolean } = {},
): void {
  const weights = options.weights ?? view.weights;
  corpoDe(doc).run(new SetProperties(geometryEntries(view, geo, weights), {
    label, kind: 'structure', mergeable: options.mergeable ?? false,
  }));
}

/** Writes only the weights, keeping the shape. One undo step. */
export function writeWeightTable(
  doc: EditorDoc, view: MeshView, weights: WeightTable, label: string,
  options: { mergeable?: boolean } = {},
): void {
  const ref = view.ref;
  const plain: MeshAttachmentDef = { ...asMeshDef(ref.def), vertices: view.geometry.vertices.slice() };
  delete plain.binding;
  const bound = bindAttachment(plain, weights, view.frames, view.slotFrame);
  corpoDe(doc).run(new SetProperties([
    [meshPointer(ref, 'binding'), bound.binding],
    [meshPointer(ref, 'vertices'), undefined],
  ], { label, kind: 'structure', mergeable: options.mergeable ?? false }));
}

/**
 * A linha que a aba mostra enquanto uma animação está aberta — plano "fluxo
 * criar e animar", lote 2, 14/09/2026.
 *
 * Substitui a recusa de antes ("Volte à Montagem (Ctrl+Tab)", lote 63a): a
 * ferramenta agora fica na mão em Animando (`viewport/tools/mesh-tool.ts`,
 * `weights-tool.ts`), e o cuidado que a recusa tentava resolver — não deixar
 * a pessoa gravar a forma de repouso pensando que está gravando o quadro de
 * agora — passa a ser dito, não impedido. `moveMeshVertex` abaixo já faz a
 * conta certa sozinho (grava `deform`, uma chave); esta frase avisa que TUDO
 * o mais nesta aba (forma, arestas, pesos, ossos ligados) continua indo para
 * a pose de repouso, com animação aberta ou não.
 *
 * Uma linha só, curta, e diz o que ACONTECE — não o que é proibido: "vale em
 * todas as animações" ensina mais que "isto não vira chave". O Humberto
 * chamou a aba de "uma wikipédia" em 13/09; um parágrafo aqui repetiria o
 * erro num lugar novo.
 */
export const MESH_REST_POSE_NOTICE =
  'A forma e os pesos vão para a base e valem em todas as animações; só arrastar um vértice grava uma chave.';

/**
 * Sufixo do rodapé quando a ação que acabou de rodar foi para a base — item
 * 2.4; degrau 4a (17/09/2026): "na pose de repouso" virou "foi para a base".
 */
export function restPoseSuffix(doc: EditorDoc): string {
  // Degrau 4b: com a virada, a base é a do corpo do instante, e o rodapé diz qual.
  return wentToBase(doc);
}

/**
 * Liga ou tira um osso da malha — lote 63. É o que o **P** faz num clique
 * numa malha, e o botão *tirar* da lista "Ossos que influenciam".
 *
 * Osso fora da lista: entra (`bindBone`). Osso na lista: sai
 * (`unbindBone`); se era o último, a malha fica sem pesos, no mesmo lugar.
 * A malha inteira é gravada num `SetProperty` só: um passo de desfazer, e o
 * desfazer devolve o anexo letra por letra. Vale nos dois modos desde
 * 14/09/2026 (lote 2) — peso é sempre da forma de repouso, animando ou não,
 * e é isso que a frase do rodapé diz quando há uma animação aberta.
 */
export function toggleMeshBone(doc: EditorDoc, bone: string, slot: string, attachment: string): string {
  const ref = meshRef(doc, slot, attachment);
  if (ref === null) return `${attachment} não é malha`;
  const suffix = restPoseSuffix(doc);
  const index = (corpoDe(doc).file.bones ?? []).findIndex((entry) => entry.name === bone);
  if (index < 0) return `${bone} não está no arquivo`;

  const frames = framesOf(doc);
  const slotFrame = slotFrameOf(doc, slot);
  const table = tableOf(asMeshDef(ref.def));
  const count = (ref.def.binding?.counts.length) ?? ((ref.def.vertices?.length ?? 0) >> 1);
  const pointer = pointerOf('skins', ref.skinIndex, 'attachments', slot, attachment);

  if (!influencingBones(table).includes(index)) {
    const empty = influencingBones(table).length === 0;
    const def = bindAttachment(asMeshDef(ref.def), bindBone(table, index, count), frames, slotFrame);
    corpoDe(doc).run(new SetProperty(pointer, def, {
      label: `Ligar ${bone} à malha ${attachment}`, kind: 'structure', mergeable: false,
    }));
    return empty
      ? `"${bone}" entrou na malha "${attachment}", com peso 100% em todos os pontos${suffix}`
      : `"${bone}" entrou na malha "${attachment}" com peso 0%${suffix}: pinte, ou use Pesos automáticos`;
  }

  const out = unbindBone(table, index);
  const last = influencingBones(out.table).length === 0;
  const def = last
    ? unbindAttachment(asMeshDef(ref.def), frames, slotFrame)
    : bindAttachment(asMeshDef(ref.def), out.table, frames, slotFrame);
  corpoDe(doc).run(new SetProperty(pointer, def, {
    label: `Tirar ${bone} da malha ${attachment}`, kind: 'structure', mergeable: false,
  }));
  if (last) return `"${bone}" saiu da malha "${attachment}"${suffix}. Ela ficou sem pesos, no mesmo lugar`;
  return `"${bone}" saiu da malha "${attachment}"${suffix}${out.warning === null ? '' : `. ${out.warning}`}`;
}

/** Takes the weights off the attachment, leaving the mesh where it is. */
export function removeWeights(doc: EditorDoc, view: MeshView, label = 'Tirar pesos'): void {
  const plain = unbindAttachment(asMeshDef(view.ref.def), view.frames, view.slotFrame);
  corpoDe(doc).run(new SetProperties([
    [meshPointer(view.ref, 'vertices'), plain.vertices],
    [meshPointer(view.ref, 'binding'), undefined],
  ], { label, kind: 'structure', mergeable: false }));
}

// ---------------------------------------------------------------------------
// Deform — animation mode
// ---------------------------------------------------------------------------

/** Length of the deform array of this mesh (spec 7.4). */
export function deformLength(view: MeshView): number {
  const binding = view.ref.def.binding;
  if (binding === undefined) return view.geometry.vertices.length;
  return binding.positions.length;
}

/** The deform of this attachment at `doc.time`, or an array of zeros. */
export function deformNow(doc: EditorDoc, view: MeshView): number[] {
  const size = deformLength(view);
  const zeros = new Array<number>(size).fill(0);
  if (doc.animation === null) return zeros;
  const target = deformTarget(view.ref.slot, view.ref.attachment, view.ref.skin);
  const value = valueAt(doc.file, doc.animation, doc.time, target);
  if (!Array.isArray(value)) return zeros;
  for (let i = 0; i < size && i < value.length; i++) {
    const n = Number(value[i]);
    zeros[i] = Number.isFinite(n) ? n : 0;
  }
  return zeros;
}

/** Applies a world movement to the linear part of a matrix inverse. */
function worldDeltaToLocal(frame: Matrix2x3, dx: number, dy: number): { x: number; y: number } {
  const inv = invertMatrix(frame);
  return { x: inv.a * dx + inv.b * dy, y: inv.c * dx + inv.d * dy };
}

/**
 * The deform array after moving vertex `index` by `(dx, dy)` in world units.
 * Weighted meshes get the movement on every influence of the vertex, each one
 * in its own bone's space (7.4).
 */
export function deformAfterMove(
  view: MeshView, deform: readonly number[], index: number, dx: number, dy: number,
): number[] {
  const out = deform.slice();
  const binding = view.ref.def.binding;
  if (binding === undefined) {
    const local = worldDeltaToLocal(view.slotFrame, dx, dy);
    out[2 * index] = (out[2 * index] ?? 0) + local.x;
    out[2 * index + 1] = (out[2 * index + 1] ?? 0) + local.y;
    return out;
  }
  const byIndex = new Map(view.frames.map((frame) => [frame.index, frame]));
  let j = 0;
  for (let v = 0; v < binding.counts.length; v++) {
    for (let k = 0; k < binding.counts[v]; k++, j++) {
      if (v !== index) continue;
      const frame = byIndex.get(binding.bones[j]);
      if (frame === undefined) continue;
      const local = worldDeltaToLocal(frame, dx, dy);
      out[2 * j] = (out[2 * j] ?? 0) + local.x;
      out[2 * j + 1] = (out[2 * j + 1] ?? 0) + local.y;
    }
  }
  return out;
}

/** Writes a deform array as a key at `doc.time`. Returns what pose mode did. */
export function keyDeform(
  doc: EditorDoc, view: MeshView, deform: readonly number[],
  label = 'Mover vértice', mergeable = true,
): ReturnType<typeof setPropertyOrKey> {
  const target = deformTarget(view.ref.slot, view.ref.attachment, view.ref.skin);
  return setPropertyOrKey(doc, target, deform.slice(), { label, mergeable });
}

/**
 * O aviso da chave `deform` velha — degrau 7, tarefa 7.7 (desvio 5 do Chat C).
 *
 * Mudar a FORMA de uma malha que já tem chaves de deformação não quebra o
 * arquivo: §9.6 manda o leitor expandir o trecho para o tamanho do layout e
 * completar com zeros. Mas os números daquelas chaves foram medidos nos
 * vértices de ANTES, e depois da mudança eles caem em outros vértices — a
 * malha continua se mexendo, na parte errada do desenho.
 *
 * O Chat C anotou o risco no degrau 4a e deixou para cá. Impedir seria tirar a
 * liberdade que o Humberto pediu (*"quero a liberdade do Spriter"*); calar
 * seria a regra 21 ao contrário. Então o programa **conta**: quantas chaves,
 * de quantas animações, e o que acontece com elas.
 *
 * Devolve o pedaço de frase, ou vazio quando não há chave nenhuma.
 */
export function deformWarningFor(doc: EditorDoc, ref: MeshRef): string {
  const target = deformTarget(ref.slot, ref.attachment, ref.skin);
  let chaves = 0;
  const animacoes = new Set<string>();
  for (const animation of doc.file.animations ?? []) {
    const name = animation.name;
    if (typeof name !== 'string') continue;
    const timeline = findTimeline(doc.file, name, target);
    if (timeline === null) continue;
    const keys = (timeline as unknown as { keys?: unknown[] }).keys ?? [];
    if (keys.length === 0) continue;
    chaves += keys.length;
    animacoes.add(name);
  }
  if (chaves === 0) return '';
  const onde = animacoes.size === 1
    ? `de "${[...animacoes][0]}"`
    : `de ${animacoes.size} animações`;
  return `. Atenção: ${chaves} ${chaves === 1 ? 'chave de deformação' : 'chaves de deformação'} ${onde} ${
    chaves === 1
      ? 'foi gravada na forma de antes e agora cai em outros vértices'
      : 'foram gravadas na forma de antes e agora caem em outros vértices'}`;
}

// ---------------------------------------------------------------------------
// Chavear pesos — F9, spec 9.6; degrau 7, tarefa 7.6
// ---------------------------------------------------------------------------

/**
 * **Chavear pesos**: grava os pesos de agora como uma chave `weights` (9.6).
 *
 * Pintar peso continua indo para a BASE, com animação aberta ou não (A5, M7):
 * *"peso é gesto de estrutura na cabeça de quem pinta"*, e gravar chave sozinho
 * encheria a animação de chaves que ninguém pediu. Quem quer o peso animado
 * aperta este botão, e só então nasce a chave.
 *
 * A chave leva **todos** os pesos do `binding`, na ordem dele (9.6: tamanho
 * diferente é L1), e a soma por vértice é 1 — a mesma conta que o arquivo já
 * guarda, porque o editor nunca grava outra coisa.
 */
export const WEIGHTS_KEY_LABEL = 'Chavear pesos';

/** A frase para quem aperta Chavear pesos sem animação aberta. */
export const WEIGHTS_KEY_NO_ANIMATION =
  'Chavear pesos precisa de uma animação aberta: com a base aberta, o peso pintado já é o de todas.';

/** A frase para a malha sem pesos: não há o que chavear. */
export const WEIGHTS_KEY_NO_BINDING =
  'Esta malha não tem pesos. Ligue os ossos (ou Pesos automáticos) antes de chavear.';

/** Os pesos do `binding`, na ordem dele — o `value` da chave `weights` (9.6). */
export function weightsValueOf(view: MeshView): number[] {
  const binding = view.ref.def.binding;
  if (binding === undefined) return [];
  return [...binding.weights];
}

/**
 * Grava a chave `weights` no instante de agora. Devolve a frase do rodapé:
 * onde não dá para gravar, ela diz o porquê (regra 21).
 */
export function keyWeights(doc: EditorDoc, view: MeshView): string {
  if (doc.animation === null) return WEIGHTS_KEY_NO_ANIMATION;
  const value = weightsValueOf(view);
  if (value.length === 0) return WEIGHTS_KEY_NO_BINDING;
  const target = weightsTarget(view.ref.slot, view.ref.attachment, view.ref.skin);
  const saida = setPropertyOrKey(doc, target, value, { label: WEIGHTS_KEY_LABEL, mergeable: false });
  if (saida !== 'chave') return `Não deu para chavear os pesos de "${view.ref.attachment}".`;
  const quantos = view.ref.def.binding?.counts.length ?? 0;
  return `Pesos de "${view.ref.attachment}" chaveados em ${segundosDe(doc.time)}: ${quantos} vértices. Pintar continua indo para a base.`;
}

/** Os segundos com vírgula, como o resto do programa escreve. */
function segundosDe(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

// ---------------------------------------------------------------------------
// The one door: moving a vertex
// ---------------------------------------------------------------------------

export type MoveOutcome = 'montagem' | 'chave' | 'recusado';

/**
 * Moves one vertex to a world position. Assembly mode changes the rest mesh;
 * with an animation open it writes a `deform` key and the rest mesh is left
 * exactly as it was.
 */
export function moveMeshVertex(
  doc: EditorDoc, view: MeshView, index: number, worldX: number, worldY: number,
  options: { label?: string; keepUv?: boolean; mergeable?: boolean } = {},
): MoveOutcome {
  const count = view.geometry.vertices.length >> 1;
  if (index < 0 || index >= count) return 'recusado';
  const label = options.label ?? 'Mover vértice';

  if (doc.animation !== null) {
    const live = liveWorldVertices(doc, view);
    const dx = worldX - (live[2 * index] ?? 0);
    const dy = worldY - (live[2 * index + 1] ?? 0);
    const deform = deformAfterMove(view, deformNow(doc, view), index, dx, dy);
    return keyDeform(doc, view, deform, label, options.mergeable ?? true);
  }

  const local = inverseTransformPoint(view.slotFrame, worldX, worldY);
  // Caixa, máscara e caminho não têm mapa de imagem: recalcular `uvs` neles
  // encheria o anexo de campo que o tipo não tem (7.6 a 7.8).
  const keepUv = options.keepUv ?? (view.ref.kind !== 'mesh');
  const geo = moveVertex(view.geometry, index, local.x, local.y, { keepUv });
  writeGeometry(doc, view, geo, label, { mergeable: options.mergeable ?? true });
  return 'montagem';
}

// ---------------------------------------------------------------------------
// Adding and removing vertices, weights included
// ---------------------------------------------------------------------------

/** Weights of a new vertex: a copy of the closest vertex that has some. */
function weightsForNew(view: MeshView, x: number, y: number): Map<number, number> {
  let best = -1;
  let bestDistance = Infinity;
  const vertices = view.geometry.vertices;
  for (let v = 0; v * 2 + 1 < vertices.length; v++) {
    if ((view.weights[v]?.size ?? 0) === 0) continue;
    const d = Math.hypot(vertices[2 * v] - x, vertices[2 * v + 1] - y);
    if (d < bestDistance) {
      bestDistance = d;
      best = v;
    }
  }
  return best < 0 ? new Map() : new Map(view.weights[best]);
}

/**
 * Adds an interior vertex at a LOCAL position, weights and all. A new vertex
 * of a weighted mesh copies the weights of the closest vertex, which is what
 * an artist expects: cutting a triangle in two must not move anything.
 */
export function addMeshVertex(
  doc: EditorDoc, view: MeshView, x: number, y: number, label = 'Novo vértice',
): string | null {
  // Caixa e máscara são um contorno e nada mais: um ponto no meio delas não
  // quer dizer nada. O ponto novo entra NA ARESTA mais perto, e o contorno
  // continua fechado e em ordem — degrau 7, tarefa 7.4.
  if (view.ref.kind === 'path') return PATH_VERTEX_NOTICE;
  const outline = view.ref.kind !== 'mesh';
  const geo = outline
    ? addHullVertex(view.geometry, nearestHullEdge(view.geometry, x, y), x, y)
    : addVertex(view.geometry, x, y);
  const weights = cloneTable(view.weights);
  if (view.weighted) {
    const fresh = weightsForNew(view, x, y);
    if (outline) weights.splice(nearestHullEdge(view.geometry, x, y) + 1, 0, fresh);
    else weights.push(fresh);
  }
  writeGeometry(doc, view, geo, label, { weights });
  return null;
}

/** A aresta do contorno mais perto de um ponto local: o vértice que a começa. */
export function nearestHullEdge(geo: MeshGeometry, x: number, y: number): number {
  const hull = Math.max(geo.hull, 0);
  if (hull < 2) return 0;
  let best = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < hull; i++) {
    const ax = geo.vertices[2 * i], ay = geo.vertices[2 * i + 1];
    const j = (i + 1) % hull;
    const bx = geo.vertices[2 * j], by = geo.vertices[2 * j + 1];
    const dx = bx - ax, dy = by - ay;
    const len = dx * dx + dy * dy;
    const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len));
    const d = Math.hypot(x - (ax + t * dx), y - (ay + t * dy));
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  }
  return best;
}

/** Removes one vertex, its weights and the edges that used it. */
export function removeMeshVertex(
  doc: EditorDoc, view: MeshView, index: number, label = 'Apagar vértice',
): string | null {
  if (view.ref.kind === 'path') return PATH_VERTEX_NOTICE;
  const geo = removeVertex(view.geometry, index);
  const weights = cloneTable(view.weights);
  if (index < weights.length) weights.splice(index, 1);
  writeGeometry(doc, view, geo, label, { weights });
  return null;
}

/** An empty weight table for a mesh that has none yet. */
export function blankWeights(view: MeshView): WeightTable {
  return emptyTable(view.geometry.vertices.length >> 1);
}

/** World positions of the rest geometry, for the automatic weights. */
export function restWorldPositions(view: MeshView): number[] {
  return geometryWorldPositions(view.geometry, view.slotFrame);
}
