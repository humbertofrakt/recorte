/**
 * Malha e pesos — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `malha`, `lote63-malha-p-liga`, `lote69-pesos-dois-ossos`.
 */

import { describe, expect, it } from 'vitest';
import { Skeleton, loadSkeletonData } from '../../runtime/src/index.js';
import type { BoneFile, MeshAttachmentDef, RegionAttachmentDef } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { cropPlacement } from '../src/panels/mesh-panel.js';
import { findTimeline, deformTarget, weightsTarget } from '../src/anim/keying.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { addEdge, addVertex, autoMeshFromImage, autoMeshOptionsFromBox, boundsOf, DEFAULT_OUTLINE_OUTSET, earClip, moveVertex, regionToMesh, removeVertex, simplifyLoop, traceOutline, triangulate } from '../src/mesh/mesh-edit.js';
import type { ImageLike, MeshGeometry } from '../src/mesh/mesh-edit.js';
import { weightAt, setWeight } from '../src/mesh/weights.js';
import { verticesInBox } from '../src/viewport/tools/mesh-tool.js';
import { autoWeights, bindAttachment, bindingToTable, boneFramesFromFile, distanceToBone, emptyTable, normalizeVertex, paintWeights, pruneWeights, slotBoneFrame, smoothAll, unbindAttachment, weightOf, worldPositionsOf, autoWeightBones, bindBone, influencingBones, tableOf, tableToBinding, unbindBone } from '../src/mesh/weights.js';
import type { WeightTable, BoneFrame } from '../src/mesh/weights.js';
import {
  addMeshVertex, deformAfterMove, deformWarningFor, keyWeights, MESH_REST_POSE_NOTICE,
  moveMeshVertex, nearestHullEdge, PATH_VERTEX_NOTICE, pathLengths, readMesh, meshRef,
  removeMeshVertex, restWorldPositions, shapeRefusal, toggleMeshBone,
  WEIGHTS_KEY_NO_ANIMATION, WEIGHTS_KEY_NO_BINDING, weightsValueOf,
} from '../src/mesh/mesh-doc.js';
import { emptySelection } from '../src/contract.js';
import type { ToolEvent } from '../src/contract.js';
import { selectTool } from '../src/viewport/tools/select.js';
import { weightsTool, forgetRadiusChoice, getBrush, setBrush, suggestRadius } from '../src/viewport/tools/weights-tool.js';
import {
  CREATE_VERTEX_NOTICE, MISSED_VERTEX_NOTICE, createVertexModeOpen, meshTool, setCreateVertexMode, toggleCreateVertexMode,
  saidToBase, NO_VERTEX_TO_DELETE_NOTICE,
} from '../src/viewport/tools/mesh-tool.js';
import { pieOf } from '../src/mesh/weights.js';
import {
  BIND_NOTICE, bindClick, bindModeClick, bindModeOpen, bindModeSceneClick, boneColor, initialRadius,
  setBindMode, shouldAutoPickMeshTool, toggleBindMode, toolHintNeeded,
  BRUSH_TOOL_NOTICE, WEIGHTS_TEST_HINT, shouldTakeWeightsTool, weightsDoneNotice,
  BRUSH_FIELDS, BRUSH_MODES, MESH_BUTTON_TIPS, boneListCaption, lockTip, attachmentKindLine, shapeDoneNotice,
  BRUSH_NO_BONE_NOTICE, brushStrokeNotice, changedVertices,
  MESH_REST_POSE_SHORT, shouldAutoWeightAfterBind, bindClosedNotice,
} from '../src/panels/mesh-panel-model.js';
import { selectionForRow } from '../src/panels/tree-rows.js';

// ---------------------------------------------------------------------------
// malha — era `malha.test.ts`
// ---------------------------------------------------------------------------

describe('malha', () => {
/**
 * Mesh and weights (owner C, requirements R4 and R5).
 *
 * Three contracts are pinned here:
 *
 *   1. The GEOMETRY the editor writes is the one of spec 7.3 and 7.4 — the
 *      four corners of a region, the counter-clockwise triangles, the UVs with
 *      `v = 0` at the top. Several numbers below were counted by hand from the
 *      formula in the specification, not read off the implementation.
 *
 *   2. WEIGHTS never move the mesh. Converting a mesh to weights and back has
 *      to leave every vertex in the same world position, and the check runs
 *      through the runtime's own `computeWorldVertices`, so a wrong conversion
 *      cannot hide behind a second implementation.
 *
 *   3. The RULE OF THE TWO MODES holds for vertices too: with an animation
 *      open, moving a vertex writes a `deform` key and does not touch the rest
 *      mesh (spec 9.6).
 *
 * No DOM: the tracer works on a plain array of RGBA bytes.
 */
// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/** A square mesh of 40 x 40 around the origin, in the slot bone's space. */
function squareMesh(): MeshAttachmentDef {
  return {
    type: 'mesh',
    vertices: [-20, -20, 20, -20, 20, 20, -20, 20],
    uvs: [0, 1, 1, 1, 1, 0, 0, 0],
    triangles: [0, 1, 2, 0, 2, 3],
    hull: 4,
    width: 40,
    height: 40,
  };
}

/**
 * Two bones side by side, both 100 long and 100 apart:
 *   `baixo` runs from (0, 0) to (100, 0), `cima` from (0, 100) to (100, 100).
 * A vertex at (50, 50) is therefore 50 away from each of them.
 */
function twoBoneFile(mesh: MeshAttachmentDef = squareMesh()): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'teste', fps: 30 },
    bones: [
      { name: 'root' },
      { name: 'baixo', parent: 'root', length: 100 },
      { name: 'cima', parent: 'root', y: 100, length: 100 },
    ],
    slots: [
      { name: 'corpo', bone: 'baixo', attachment: 'tronco' },
    ],
    skins: [
      { name: 'default', attachments: { corpo: { tronco: mesh } } },
    ],
    animations: [
      { name: 'andar', duration: 1 },
    ],
  };
}

/** The mesh stored in the file, as it is on disk. */
function meshOf(file: BoneFile): MeshAttachmentDef {
  const def = file.skins?.[0]?.attachments?.corpo?.tronco;
  if (def == null) throw new Error('a malha sumiu do arquivo');
  return def as MeshAttachmentDef;
}

/** World vertices through the runtime, which is the normative reader (7.4). */
function runtimeWorldVertices(file: BoneFile): number[] {
  const data = loadSkeletonData(JSON.parse(JSON.stringify(file)) as Record<string, unknown>);
  const skeleton = new Skeleton(data);
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform();
  const slot = skeleton.slots[0];
  const attachment = slot.attachment as unknown as {
    computeWorldVertices(slot: unknown, out: number[], offset: number, stride: number): unknown;
    vertexCount: number;
  };
  const out = new Array<number>(attachment.vertexCount * 2).fill(0);
  attachment.computeWorldVertices(slot, out, 0, 2);
  return out;
}

/** A geometry as `mesh-edit` sees it. */
function geometryOf(def: MeshAttachmentDef): MeshGeometry {
  return {
    vertices: (def.vertices ?? []).slice(),
    uvs: def.uvs.slice(),
    triangles: def.triangles.slice(),
    edges: (def.edges ?? []).slice(),
    hull: def.hull ?? ((def.vertices ?? []).length >> 1),
  };
}

/** Triangles as a comparable set: each one sorted, the list sorted. */
function triangleSet(triangles: readonly number[]): string[] {
  const out: string[] = [];
  for (let t = 0; t + 2 < triangles.length; t += 3) {
    out.push([triangles[t], triangles[t + 1], triangles[t + 2]].sort((a, b) => a - b).join(','));
  }
  return out.sort();
}

/** Twice the signed area; positive means counter-clockwise (7.4). */
function area2(points: readonly number[], a: number, b: number, c: number): number {
  return (points[2 * b] - points[2 * a]) * (points[2 * c + 1] - points[2 * a + 1])
    - (points[2 * b + 1] - points[2 * a + 1]) * (points[2 * c] - points[2 * a]);
}

/** An image with an opaque rectangle in it, top-down RGBA. */
function rectImage(width: number, height: number, x0: number, y0: number, x1: number, y1: number): ImageLike {
  const data = new Array<number>(width * height * 4).fill(0);
  for (let y = y0; y < y1; y++) {
    for (let x = x0; x < x1; x++) {
      const i = (y * width + x) * 4;
      data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
    }
  }
  return { width, height, data };
}

// ---------------------------------------------------------------------------
// 1. region -> mesh (spec 7.3)
// ---------------------------------------------------------------------------

describe('region vira malha', () => {
  it('escreve os quatro cantos e os uvs da especificação', () => {
    const region: RegionAttachmentDef = {
      type: 'region', x: 10, y: 20, width: 100, height: 50,
    };
    const mesh = regionToMesh(region);

    // Counted by hand from 7.3: half sizes 50 and 25, moved by (10, 20).
    // BL, BR, TR, TL, counter-clockwise.
    expect(mesh.vertices).toEqual([-40, -5, 60, -5, 60, 45, -40, 45]);
    expect(mesh.uvs).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);
    expect(mesh.triangles).toEqual([0, 1, 2, 0, 2, 3]);
    expect(mesh.hull).toBe(4);
    expect(mesh.width).toBe(100);
    expect(mesh.height).toBe(50);
    expect(mesh.type).toBe('mesh');
  });

  it('assa a rotação e a escala nos vértices', () => {
    const region: RegionAttachmentDef = {
      type: 'region', width: 20, height: 10, rotation: 90,
    };
    const vertices = regionToMesh(region).vertices ?? [];
    // A 90 degree turn takes (x, y) to (-y, x): BL (-10, -5) -> (5, -10).
    expect(vertices[0]).toBeCloseTo(5, 9);
    expect(vertices[1]).toBeCloseTo(-10, 9);
    expect(vertices[4]).toBeCloseTo(-5, 9);
    expect(vertices[5]).toBeCloseTo(10, 9);
  });

  it('usa o tamanho da imagem quando o region não traz um', () => {
    const mesh = regionToMesh({ type: 'region' }, { width: 8, height: 4 });
    expect(mesh.vertices).toEqual([-4, -2, 4, -2, 4, 2, -4, 2]);
  });
});

// ---------------------------------------------------------------------------
// 2. Triangulation
// ---------------------------------------------------------------------------

describe('triangulação de Delaunay restrita', () => {
  it('um quadrado com um vértice interno dá o leque de quatro triângulos', () => {
    const points = [0, 0, 12, 0, 12, 12, 0, 12, 5, 4];
    const triangles = triangulate(points, 4);
    expect(triangles.length).toBe(12);
    expect(triangleSet(triangles)).toEqual(['0,1,4', '0,3,4', '1,2,4', '2,3,4']);
    for (let t = 0; t < triangles.length; t += 3) {
      expect(area2(points, triangles[t], triangles[t + 1], triangles[t + 2])).toBeGreaterThan(0);
    }
  });

  it('um quadrado sem vértice interno dá dois triângulos', () => {
    const triangles = triangulate([0, 0, 10, 0, 10, 10, 0, 10], 4);
    expect(triangles.length).toBe(6);
    expect(triangleSet(triangles).length).toBe(2);
  });

  it('respeita um contorno côncavo, sem triângulo para fora', () => {
    // An arrow-shaped polygon: the notch must stay empty.
    const points = [0, 0, 10, 0, 10, 10, 5, 4, 0, 10];
    const triangles = earClip(points, [0, 1, 2, 3, 4]);
    expect(triangles.length).toBe(9);
    for (let t = 0; t < triangles.length; t += 3) {
      expect(area2(points, triangles[t], triangles[t + 1], triangles[t + 2])).toBeGreaterThan(0);
    }
  });

  it('mantém uma aresta pedida pelo usuário', () => {
    const geo: MeshGeometry = {
      vertices: [0, 0, 12, 0, 12, 12, 0, 12, 5, 4],
      uvs: [0, 1, 1, 1, 1, 0, 0, 0, 0.4, 0.7],
      triangles: [],
      edges: [],
      hull: 4,
    };
    geo.triangles = triangulate(geo.vertices, geo.hull);
    const withEdge = addEdge(geo, 0, 2);
    expect(withEdge.edges).toEqual([0, 2]);
    const pairs = triangleSet(withEdge.triangles).join(' ');
    expect(pairs.length).toBeGreaterThan(0);
    const hasEdge = (() => {
      for (let t = 0; t + 2 < withEdge.triangles.length; t += 3) {
        const tri = [withEdge.triangles[t], withEdge.triangles[t + 1], withEdge.triangles[t + 2]];
        if (tri.includes(0) && tri.includes(2)) return true;
      }
      return false;
    })();
    expect(hasEdge).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 3. Editing vertices
// ---------------------------------------------------------------------------

describe('editar vértices', () => {
  it('mover um vértice muda a posição e recalcula o uv', () => {
    const geo = geometryOf(squareMesh());
    const moved = moveVertex(geo, 1, 40, -20);
    expect(moved.vertices.slice(2, 4)).toEqual([40, -20]);
    // The mesh came from a region, so the map from position to UV is exact:
    // x = -20 is u = 0 and x = 20 is u = 1, so 40 units are one whole image and
    // x = 40 is u = 1.5.
    expect(moved.uvs[2]).toBeCloseTo(1.5, 9);
    expect(moved.uvs[3]).toBeCloseTo(1, 9);
    // The original is untouched: these functions never alias the document.
    expect(geo.vertices.slice(2, 4)).toEqual([20, -20]);
  });

  it('mover com keepUv deixa a imagem esticar', () => {
    const geo = geometryOf(squareMesh());
    const moved = moveVertex(geo, 1, 40, -20, { keepUv: true });
    expect(moved.uvs).toEqual(geo.uvs);
  });

  it('adicionar um vértice interno retriangula', () => {
    const geo = geometryOf(squareMesh());
    const grown = addVertex(geo, 0, 0);
    expect(grown.vertices.length).toBe(10);
    expect(grown.hull).toBe(4);
    expect(grown.triangles.length).toBe(12);
    expect(grown.uvs[8]).toBeCloseTo(0.5, 9);
    expect(grown.uvs[9]).toBeCloseTo(0.5, 9);
  });

  it('apagar um vértice renumera arestas e triângulos', () => {
    const geo = addVertex(geometryOf(squareMesh()), 0, 0);
    const withEdge = addEdge(geo, 0, 4);
    const smaller = removeVertex(withEdge, 4);
    expect(smaller.vertices.length).toBe(8);
    expect(smaller.edges).toEqual([]);
    for (const index of smaller.triangles) expect(index).toBeLessThan(4);
  });

  it('recusa deixar a malha com menos de três vértices', () => {
    const geo: MeshGeometry = {
      vertices: [0, 0, 10, 0, 5, 10], uvs: [0, 0, 1, 0, 0.5, 1],
      triangles: [0, 1, 2], edges: [], hull: 3,
    };
    expect(() => removeVertex(geo, 0)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// 4. Automatic mesh from an image
// ---------------------------------------------------------------------------

describe('malha automática pela silhueta', () => {
  it('acha o contorno de um retângulo opaco', () => {
    const image = rectImage(20, 20, 5, 5, 15, 15);
    const outline = traceOutline(image);
    expect(outline.length).toBeGreaterThan(6);
    // Every traced pixel is on the border of the rectangle.
    for (let i = 0; i + 1 < outline.length; i += 2) {
      const x = outline[i], y = outline[i + 1];
      expect(x >= 5 && x <= 14 && y >= 5 && y <= 14).toBe(true);
      expect(x === 5 || x === 14 || y === 5 || y === 14).toBe(true);
    }
    // The four corners are there.
    const has = (x: number, y: number): boolean => {
      for (let i = 0; i + 1 < outline.length; i += 2) {
        if (outline[i] === x && outline[i + 1] === y) return true;
      }
      return false;
    };
    expect(has(5, 5)).toBe(true);
    expect(has(14, 5)).toBe(true);
    expect(has(14, 14)).toBe(true);
    expect(has(5, 14)).toBe(true);
  });

  it('simplifica o contorno para os quatro cantos', () => {
    const image = rectImage(20, 20, 5, 5, 15, 15);
    const simplified = simplifyLoop(traceOutline(image), 1);
    expect(simplified.length >> 1).toBeLessThanOrEqual(6);
    expect(simplified.length >> 1).toBeGreaterThanOrEqual(4);
  });

  it('gera uma malha inteira, com uvs dentro de 0..1', () => {
    const image = rectImage(40, 40, 8, 8, 32, 32);
    const geo = autoMeshFromImage(image, { spacing: 8 });
    expect(geo.hull).toBeGreaterThanOrEqual(4);
    expect(geo.vertices.length >> 1).toBeGreaterThan(geo.hull);
    expect(geo.triangles.length).toBeGreaterThan(0);
    expect(geo.triangles.length % 3).toBe(0);
    for (const uv of geo.uvs) {
      expect(uv).toBeGreaterThanOrEqual(0);
      expect(uv).toBeLessThanOrEqual(1);
    }
    // Local space: Y up, origin at the centre of the image.
    const box = boundsOf(geo.vertices);
    expect(box.minX).toBeGreaterThanOrEqual(-20);
    expect(box.maxX).toBeLessThanOrEqual(20);
    expect(box.minY).toBeGreaterThanOrEqual(-20);
    expect(box.maxY).toBeLessThanOrEqual(20);
    for (let t = 0; t + 2 < geo.triangles.length; t += 3) {
      expect(area2(geo.vertices, geo.triangles[t], geo.triangles[t + 1], geo.triangles[t + 2]))
        .toBeGreaterThan(0);
    }
  });

  it('avisa quando a imagem está vazia', () => {
    expect(() => autoMeshFromImage(rectImage(10, 10, 0, 0, 0, 0))).toThrow();
  });

  // -------------------------------------------------------------------------
  // Item 4.1 (plano "caixa, ossos e malha"): o contorno gerado fica afastado
  // da arte, ligado por padrão. "traceOutline andava em cima do primeiro
  // pixel opaco, e a malha comia a borda do desenho."
  // -------------------------------------------------------------------------

  it('sem afastamento, o traçado fica bem em cima do retângulo', () => {
    const image = rectImage(40, 40, 10, 10, 30, 30);
    const outline = traceOutline(image, 0.05, 0);
    const box = boundsOf(outline);
    expect(box.minX).toBe(10);
    expect(box.minY).toBe(10);
    expect(box.maxX).toBe(29);
    expect(box.maxY).toBe(29);
  });

  it('com afastamento, o traçado sai para fora do retângulo, pelo tanto pedido', () => {
    const image = rectImage(40, 40, 10, 10, 30, 30);
    const outline = traceOutline(image, 0.05, 3);
    const box = boundsOf(outline);
    expect(box.minX).toBe(7);
    expect(box.minY).toBe(7);
    expect(box.maxX).toBe(32);
    expect(box.maxY).toBe(32);
  });

  it('afastamento zero é exatamente o traçado de antes: nada de padrão escondido em traceOutline', () => {
    const image = rectImage(40, 40, 10, 10, 30, 30);
    expect(traceOutline(image, 0.05, 0)).toEqual(traceOutline(image, 0.05));
  });

  it('o afastamento pára na borda da imagem: nunca sai do que existe em pixel', () => {
    const image = rectImage(20, 20, 2, 2, 18, 18);
    const outline = traceOutline(image, 0.05, 5);
    const box = boundsOf(outline);
    expect(box.minX).toBe(0);
    expect(box.minY).toBe(0);
    expect(box.maxX).toBe(19);
    expect(box.maxY).toBe(19);
  });

  it('a malha automática já nasce afastada, sem ninguém pedir', () => {
    const image = rectImage(60, 60, 15, 15, 45, 45);
    expect(DEFAULT_OUTLINE_OUTSET).toBeGreaterThan(0);
    const semAfastar = autoMeshFromImage(image, { spacing: 8, outset: 0 });
    const padrao = autoMeshFromImage(image, { spacing: 8 });
    const boxSem = boundsOf(semAfastar.vertices);
    const boxPadrao = boundsOf(padrao.vertices);
    expect(boxPadrao.minX).toBeLessThan(boxSem.minX);
    expect(boxPadrao.minY).toBeLessThan(boxSem.minY);
    expect(boxPadrao.maxX).toBeGreaterThan(boxSem.maxX);
    expect(boxPadrao.maxY).toBeGreaterThan(boxSem.maxY);
  });
});

// ---------------------------------------------------------------------------
// Bug de 13/09/2026: "quando aperta pra criar malha o sprite se move". Trava
// o LUGAR do desenho ao regenerar a malha — com arte FORA do centro do
// canvas, porque com arte simétrica o certo e o errado dão o mesmo número.
// ---------------------------------------------------------------------------

describe('gerar malha não move o desenho', () => {
  it('autoMeshOptionsFromBox: o canvas cai na caixa que a malha já ocupa', () => {
    // A malha de "Virar malha" para uma region em x=300, canvas 40×40.
    const box = { minX: 280, minY: -20, maxX: 320, maxY: 20 };
    expect(autoMeshOptionsFromBox(box, { width: 999, height: 999 }))
      .toEqual({ width: 40, height: 40, x: 300, y: 0 });
  });

  it('malha degenerada (caixa sem tamanho): cai no metadado de reserva', () => {
    const box = { minX: 5, minY: 5, maxX: 5, maxY: 5 };
    expect(autoMeshOptionsFromBox(box, { width: 80, height: 60 }))
      .toEqual({ width: 80, height: 60, x: 5, y: 5 });
  });

  it('arte fora do centro do canvas: a malha nova cai exatamente onde a arte está, vértice a vértice', () => {
    // Malha antiga: um retângulo 40×40 posto em x=300 no espaço do osso —
    // longe da origem, como no relato do Humberto.
    const box = { minX: 280, minY: -20, maxX: 320, maxY: 20 };
    const options = autoMeshOptionsFromBox(box, { width: 40, height: 40 });

    // Arte fora do centro: só a metade ESQUERDA do canvas 40×40 tem pixel.
    const image = rectImage(40, 40, 0, 0, 20, 40);
    const geo = autoMeshFromImage(image, { ...options, spacing: 0, outset: 0 });
    const novo = boundsOf(geo.vertices);

    // A conta: canvas 0..40 (pixel) cai em 280..320 (osso), 1 px = 1 unidade.
    // O pixel 0 (borda esquerda da arte) cai em 280; o pixel 19 (última
    // coluna opaca) cai em 299. A caixa NÃO fica centrada em 300 — fica onde
    // a arte de verdade está, cada canto conferido, não só o meio.
    expect(novo.minX).toBe(280);
    expect(novo.maxX).toBe(299);
    expect(novo.minY).toBe(-19);
    expect(novo.maxY).toBe(20);

    // Trava o conserto ERRADO que quase entrou: "alinhar centro da silhueta
    // nova com o centro da malha antiga" teria posto o centro de volta em
    // 300. O certo é 289,5 — a arte fica onde ela está, não onde o canvas
    // inteiro estava centrado.
    const centro = (novo.minX + novo.maxX) / 2;
    expect(centro).toBeCloseTo(289.5, 5);
    expect(Math.abs(centro - 300)).toBeGreaterThan(5);
  });

  it('o caso comum — Virar malha, depois Gerar automática, arte enchendo o canvas — é exato', () => {
    const region: RegionAttachmentDef = { type: 'region', x: 300, y: 0, width: 40, height: 40 };
    const mesh = regionToMesh(region);
    const antes = boundsOf(mesh.vertices!);
    const options = autoMeshOptionsFromBox(antes, { width: 40, height: 40 });
    const image = rectImage(40, 40, 0, 0, 40, 40); // enche o canvas inteiro
    const geo = autoMeshFromImage(image, { ...options, spacing: 0, outset: 0 });
    const depois = boundsOf(geo.vertices);
    // Até 1 unidade: o traçado anda em cima do ÍNDICE do pixel (0..39, nunca
    // 40), então a borda de fora fica no máximo um pixel aquém do canto —
    // não é o bug, é o preço de medir em pixel inteiro.
    expect(Math.abs(depois.minX - antes.minX)).toBeLessThanOrEqual(1);
    expect(Math.abs(depois.maxX - antes.maxX)).toBeLessThanOrEqual(1);
    expect(Math.abs(depois.minY - antes.minY)).toBeLessThanOrEqual(1);
    expect(Math.abs(depois.maxY - antes.maxY)).toBeLessThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Item 4.2 (plano "caixa, ossos e malha"): o modo Criar vértice, como o Spine
// e o DragonBones. "não tem um modo de criar vértices na malha". O clique
// simples no vazio passa a criar, com o modo aberto; Ctrl + clique continua
// criando de qualquer jeito, como sempre.
// ---------------------------------------------------------------------------

describe('o modo Criar vértice, como o Spine e o DragonBones (item 4.2)', () => {
  /** root; a malha capa na raiz, um quadrado em (−20,120)–(20,160). */
  function docComMalha(): Doc {
    return new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'capa', bone: 'root', attachment: 'capa' }],
      skins: [{
        name: 'default',
        attachments: {
          capa: {
            capa: {
              type: 'mesh', path: 'capa', uvs: [0, 0, 1, 0, 1, 1, 0, 1], triangles: [0, 1, 2, 0, 2, 3],
              vertices: [-20, 120, 20, 120, 20, 160, -20, 160], hull: 4,
            },
          },
        },
      }],
    } as unknown as BoneFile);
  }

  function verticesDaMalha(doc: Doc): number[] {
    const skin = doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>;
    return skin['capa']!['capa']!['vertices'] as number[];
  }

  function evento(x: number, y: number): ToolEvent {
    return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 };
  }

  it('abre e fecha no mesmo botão', () => {
    setCreateVertexMode(false);
    expect(toggleCreateVertexMode()).toBe(true);
    expect(createVertexModeOpen()).toBe(true);
    expect(toggleCreateVertexMode()).toBe(false);
    expect(createVertexModeOpen()).toBe(false);
  });

  it('a frase do rodapé é a do plano', () => {
    expect(CREATE_VERTEX_NOTICE).toBe('Clique na malha para criar vértices. Criar vértice de novo termina.');
  });

  it('fechado, o clique simples no vazio só limpa a seleção: não cria vértice', () => {
    const doc = docComMalha();
    doc.select({
      ...emptySelection(), slots: ['capa'], attachments: [{ slot: 'capa', attachment: 'capa' }], vertices: [0],
    });
    setCreateVertexMode(false);
    const antes = verticesDaMalha(doc).length;
    meshTool.onDown!(doc, evento(0, 140));
    expect(verticesDaMalha(doc).length).toBe(antes);
    expect(doc.selection.vertices).toEqual([]);
  });

  it('L17 (chat L): o clique fora de um vértice DIZ o gesto — uma vez por malha', () => {
    const doc = docComMalha();
    const avisos: string[] = [];
    doc.notice = (texto: string) => { avisos.push(texto); };
    doc.select({ ...emptySelection(), slots: ['capa'], attachments: [{ slot: 'capa', attachment: 'capa' }] });
    setCreateVertexMode(false);
    meshTool.onExit!(doc);
    meshTool.onDown!(doc, evento(0, 140));
    meshTool.onDown!(doc, evento(0, 140));
    expect(avisos.filter((texto) => texto === MISSED_VERTEX_NOTICE)).toHaveLength(1);
    expect(MISSED_VERTEX_NOTICE).toContain('Clique num quadrado branco e arraste');
  });

  it('aberto, o clique simples no vazio cria vértice — o mesmo que Ctrl + clique de sempre', () => {
    const doc = docComMalha();
    doc.select({ ...emptySelection(), slots: ['capa'], attachments: [{ slot: 'capa', attachment: 'capa' }] });
    setCreateVertexMode(true);
    const antes = verticesDaMalha(doc).length;
    meshTool.onDown!(doc, evento(0, 140));
    expect(verticesDaMalha(doc).length).toBe(antes + 2);
    setCreateVertexMode(false);
  });

  it('o Ctrl + clique continua criando vértice mesmo com o modo fechado', () => {
    const doc = docComMalha();
    doc.select({ ...emptySelection(), slots: ['capa'], attachments: [{ slot: 'capa', attachment: 'capa' }] });
    setCreateVertexMode(false);
    const antes = verticesDaMalha(doc).length;
    meshTool.onDown!(doc, { ...evento(0, 140), ctrl: true });
    expect(verticesDaMalha(doc).length).toBe(antes + 2);
  });

  it('Esc fecha o modo', () => {
    const doc = docComMalha();
    setCreateVertexMode(true);
    expect(meshTool.onKey!(doc, 'Escape')).toBe(true);
    expect(createVertexModeOpen()).toBe(false);
    // Sem modo aberto, o Esc segue adiante: quem trata é o de sempre.
    expect(meshTool.onKey!(doc, 'Escape')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 5. Automatic weights
// ---------------------------------------------------------------------------

describe('pesos automáticos', () => {
  const frames = boneFramesFromFile(twoBoneFile());
  const bones = [1, 2];

  it('mede a distância até o segmento do osso', () => {
    expect(distanceToBone(frames[1], 50, 50)).toBeCloseTo(50, 9);
    expect(distanceToBone(frames[2], 50, 50)).toBeCloseTo(50, 9);
  });

  it('um vértice no meio dos dois ossos fica com 0,5 e 0,5', () => {
    const table = autoWeights([50, 50], frames, { bones });
    expect(weightOf(table, 0, 1)).toBeCloseTo(0.5, 9);
    expect(weightOf(table, 0, 2)).toBeCloseTo(0.5, 9);
  });

  it('um vértice em cima de um osso fica com esse osso inteiro', () => {
    const table = autoWeights([50, 0], frames, { bones });
    expect(weightOf(table, 0, 1)).toBeCloseTo(1, 6);
    expect(weightOf(table, 0, 2)).toBeCloseTo(0, 6);
  });

  it('cada vértice soma 1, como pede a 7.4', () => {
    const table = autoWeights([50, 50, 10, 10, 90, 80, 0, 100], frames, { bones });
    for (const vertex of table) {
      let sum = 0;
      for (const [, weight] of vertex) sum += weight;
      expect(Math.abs(sum - 1)).toBeLessThan(1e-4);
      expect(vertex.size).toBeGreaterThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 6. Normalizing, pruning, locking
// ---------------------------------------------------------------------------

describe('normalizar, podar e travar', () => {
  it('normaliza dois pesos iguais para 0,5', () => {
    const vertex = new Map([[1, 2], [2, 2]]);
    normalizeVertex(vertex);
    expect(vertex.get(1)).toBeCloseTo(0.5, 9);
    expect(vertex.get(2)).toBeCloseTo(0.5, 9);
  });

  it('um osso travado guarda o peso que tem', () => {
    const vertex = new Map([[1, 0.4], [2, 2]]);
    normalizeVertex(vertex, new Set([1]));
    expect(vertex.get(1)).toBeCloseTo(0.4, 9);
    expect(vertex.get(2)).toBeCloseTo(0.6, 9);
  });

  it('podar apaga o peso pequeno e renormaliza', () => {
    const table: WeightTable = [new Map([[1, 0.98], [2, 0.02], [3, 0.005]])];
    const pruned = pruneWeights(table, 0.03);
    expect(pruned[0].has(3)).toBe(false);
    expect(pruned[0].has(2)).toBe(false);
    expect(pruned[0].get(1)).toBeCloseTo(1, 9);
    // The table given is not touched.
    expect(table[0].size).toBe(3);
  });

  it('podar nunca deixa um vértice sem osso', () => {
    const table: WeightTable = [new Map([[1, 0.001]])];
    const pruned = pruneWeights(table, 0.5);
    expect(pruned[0].size).toBe(1);
    expect(pruned[0].get(1)).toBeCloseTo(1, 9);
  });
});

// ---------------------------------------------------------------------------
// 7. Brushes
// ---------------------------------------------------------------------------

describe('pincéis', () => {
  it('somar com força 0,5 divide o vértice ao meio', () => {
    const table: WeightTable = [new Map([[1, 1]])];
    const painted = paintWeights(table, {
      mode: 'add', bone: 2, x: 0, y: 0, radius: 10, strength: 0.5,
      positions: [0, 0],
    });
    expect(painted[0].get(2)).toBeCloseTo(0.5, 9);
    expect(painted[0].get(1)).toBeCloseTo(0.5, 9);
    expect(table[0].get(1)).toBe(1);
  });

  it('não pinta fora do raio', () => {
    const table: WeightTable = [new Map([[1, 1]]), new Map([[1, 1]])];
    const painted = paintWeights(table, {
      mode: 'add', bone: 2, x: 0, y: 0, radius: 10, strength: 1,
      positions: [0, 0, 100, 0],
    });
    expect(painted[0].get(2)).toBeCloseTo(1, 9);
    expect(painted[1].has(2)).toBe(false);
  });

  it('subtrair devolve o peso aos outros ossos', () => {
    const table: WeightTable = [new Map([[1, 0.5], [2, 0.5]])];
    const painted = paintWeights(table, {
      mode: 'subtract', bone: 2, x: 0, y: 0, radius: 10, strength: 0.5,
      positions: [0, 0],
    });
    expect(painted[0].get(2) ?? 0).toBeCloseTo(0, 9);
    expect(painted[0].get(1)).toBeCloseTo(1, 9);
  });

  it('um osso travado não muda com o pincel', () => {
    const table: WeightTable = [new Map([[1, 0.5], [2, 0.5]])];
    const painted = paintWeights(table, {
      mode: 'add', bone: 2, x: 0, y: 0, radius: 10, strength: 1,
      positions: [0, 0], locked: new Set([1]),
    });
    expect(painted[0].get(1)).toBeCloseTo(0.5, 9);
    expect(painted[0].get(2)).toBeCloseTo(0.5, 9);
  });

  it('suavizar puxa cada vértice para a média dos vizinhos', () => {
    const table: WeightTable = [
      new Map([[1, 1]]),
      new Map([[1, 1]]),
      new Map([[2, 1]]),
    ];
    const smoothed = smoothAll(table, [0, 1, 2], 1);
    // Vertex 2 has neighbours 0 and 1, both fully on bone 1.
    expect(smoothed[2].get(1)).toBeCloseTo(1, 9);
    expect(smoothed[2].get(2) ?? 0).toBeCloseTo(0, 9);
    // Vertex 0 sees one of each, so it lands halfway.
    expect(smoothed[0].get(1)).toBeCloseTo(0.5, 9);
    expect(smoothed[0].get(2)).toBeCloseTo(0.5, 9);
  });
});

// ---------------------------------------------------------------------------
// 8. With weights <-> without weights, checked by the runtime
// ---------------------------------------------------------------------------

describe('ida e volta entre com pesos e sem pesos', () => {
  it('não move nenhum vértice, conferido com computeWorldVertices', () => {
    const file = twoBoneFile();
    const frames = boneFramesFromFile(file);
    const slotFrame = slotBoneFrame(file, 'corpo', frames);
    expect(slotFrame).not.toBeNull();
    if (slotFrame === null) return;

    const before = runtimeWorldVertices(file);
    const plain = meshOf(file);
    expect(worldPositionsOf(plain, frames, slotFrame)).toEqual(before);

    // 1. bind
    const table = autoWeights(before, frames, { bones: [1, 2] });
    const bound = bindAttachment(plain, table, frames, slotFrame);
    expect(bound.vertices).toBeUndefined();
    expect(bound.binding).toBeDefined();
    const boundFile = twoBoneFile(bound);
    const afterBind = runtimeWorldVertices(boundFile);
    for (let i = 0; i < before.length; i++) expect(afterBind[i]).toBeCloseTo(before[i], 9);

    // The binding is the SoA of 7.4, with the right sizes.
    const binding = bound.binding;
    if (binding === undefined) return;
    const total = binding.counts.reduce((sum, value) => sum + value, 0);
    expect(binding.counts.length).toBe(before.length >> 1);
    expect(binding.bones.length).toBe(total);
    expect(binding.weights.length).toBe(total);
    expect(binding.positions.length).toBe(total * 2);
    for (let v = 0, j = 0; v < binding.counts.length; v++) {
      let sum = 0;
      for (let k = 0; k < binding.counts[v]; k++, j++) sum += binding.weights[j];
      expect(Math.abs(sum - 1)).toBeLessThanOrEqual(1e-4);
    }

    // 2. unbind
    const back = unbindAttachment(bound, frames, slotFrame);
    expect(back.binding).toBeUndefined();
    const backFile = twoBoneFile(back);
    const afterUnbind = runtimeWorldVertices(backFile);
    for (let i = 0; i < before.length; i++) expect(afterUnbind[i]).toBeCloseTo(before[i], 9);
    for (let i = 0; i < (plain.vertices ?? []).length; i++) {
      expect(back.vertices?.[i]).toBeCloseTo((plain.vertices ?? [])[i], 9);
    }
  });

  it('lê os pesos de um binding de volta para a tabela', () => {
    const file = twoBoneFile();
    const frames = boneFramesFromFile(file);
    const slotFrame = slotBoneFrame(file, 'corpo', frames);
    if (slotFrame === null) return;
    const table = autoWeights(runtimeWorldVertices(file), frames, { bones: [1, 2] });
    const bound = bindAttachment(meshOf(file), table, frames, slotFrame);
    const again = bound.binding === undefined ? emptyTable(0) : bindingToTable(bound.binding);
    expect(again.length).toBe(table.length);
    for (let v = 0; v < table.length; v++) {
      for (const [bone, weight] of table[v]) {
        expect(again[v].get(bone) ?? 0).toBeCloseTo(weight, 9);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 9. The rule of the two modes
// ---------------------------------------------------------------------------

describe('mover vértice nos dois modos', () => {
  it('em montagem muda a malha de repouso', () => {
    const doc = new Doc(twoBoneFile());
    doc.select({ ...doc.selection, attachments: [{ slot: 'corpo', attachment: 'tronco' }] });
    const ref = meshRef(doc, 'corpo', 'tronco');
    expect(ref).not.toBeNull();
    if (ref === null) return;
    const view = readMesh(doc, ref);
    // The slot bone sits at the origin with no rotation, so world = local.
    const outcome = moveMeshVertex(doc, view, 0, -30, -25);
    expect(outcome).toBe('montagem');
    const vertices = meshOf(doc.file).vertices ?? [];
    expect(vertices[0]).toBeCloseTo(-30, 6);
    expect(vertices[1]).toBeCloseTo(-25, 6);
    expect(doc.file.animations?.[0].timelines).toBeUndefined();
  });

  it('com uma animação aberta cria chave de deform e não toca no repouso', () => {
    const doc = new Doc(twoBoneFile());
    doc.animation = 'andar';
    doc.time = 0.5;
    const ref = meshRef(doc, 'corpo', 'tronco');
    if (ref === null) throw new Error('a malha não foi encontrada');
    const view = readMesh(doc, ref);
    const before = (meshOf(doc.file).vertices ?? []).slice();

    const outcome = moveMeshVertex(doc, view, 0, -30, -25);
    expect(outcome).toBe('chave');

    // The rest mesh is exactly as it was.
    expect(meshOf(doc.file).vertices).toEqual(before);

    const timeline = findTimeline(doc.file, 'andar', deformTarget('corpo', 'tronco'));
    expect(timeline).not.toBeNull();
    const keys = (timeline as unknown as { keys: Array<{ time: number; value: number[] }> }).keys;
    expect(keys.length).toBe(1);
    expect(keys[0].time).toBeCloseTo(0.5, 9);
    // Vertex 0 went from (-20, -20) to (-30, -25): the offset is (-10, -5).
    expect(keys[0].value[0]).toBeCloseTo(-10, 6);
    expect(keys[0].value[1]).toBeCloseTo(-5, 6);
    for (let i = 2; i < keys[0].value.length; i++) expect(keys[0].value[i]).toBeCloseTo(0, 9);
    // The deform array has the layout of 7.4: `2N` for a mesh with no weights.
    expect(keys[0].value.length).toBe(8);
  });

  it('a chave de deform de uma malha com pesos tem uma entrada por influência', () => {
    const file = twoBoneFile();
    const frames = boneFramesFromFile(file);
    const slotFrame = slotBoneFrame(file, 'corpo', frames);
    if (slotFrame === null) throw new Error('o slot não tem osso');
    const table = autoWeights(worldPositionsOf(meshOf(file), frames, slotFrame), frames, { bones: [1, 2] });
    const bound = bindAttachment(meshOf(file), table, frames, slotFrame);
    const doc = new Doc(twoBoneFile(bound));
    doc.animation = 'andar';
    doc.time = 0;
    const ref = meshRef(doc, 'corpo', 'tronco');
    if (ref === null) throw new Error('a malha não foi encontrada');
    const view = readMesh(doc, ref);

    const total = (bound.binding?.counts ?? []).reduce((sum, value) => sum + value, 0);
    const deform = deformAfterMove(view, new Array<number>(total * 2).fill(0), 0, 5, 0);
    expect(deform.length).toBe(total * 2);

    const outcome = moveMeshVertex(doc, view, 0, restWorldPositions(view)[0] + 5, restWorldPositions(view)[1]);
    expect(outcome).toBe('chave');
    const timeline = findTimeline(doc.file, 'andar', deformTarget('corpo', 'tronco'));
    const keys = (timeline as unknown as { keys: Array<{ value: number[] }> }).keys;
    expect(keys[0].value.length).toBe(total * 2);
  });
});

// ---------------------------------------------------------------------------
// 10. A ferramenta não expulsa mais — plano "fluxo criar e animar", lote 2,
// 14/09/2026. O cuidado do lote: forma e pesos são sempre da pose de
// repouso, deform é sempre da chave, e a pessoa sabe qual é qual sem trocar
// de modo.
// ---------------------------------------------------------------------------

describe('a malha em Animando não expulsa mais', () => {
  it('Malha e Pesos valem sempre: `modes` saiu, e apagar vértice com a animação aberta vai para a base (degrau 4a)', () => {
    // O campo saiu do contrato: não há mais o que restringir.
    expect('modes' in meshTool).toBe(false);
    expect('modes' in weightsTool).toBe(false);
    // Antes, Delete com a animação aberta não fazia nada, calado. Agora apaga
    // da forma (a base) e o rodapé diz para onde foi.
    const doc = new Doc(twoBoneFile());
    doc.animation = 'andar';
    doc.select({
      ...doc.selection, slots: ['corpo'], attachments: [{ slot: 'corpo', attachment: 'tronco' }], vertices: [0],
    });
    const recados: string[] = [];
    doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });
    const antes = (meshOf(doc.file).vertices ?? []).length;
    expect(meshTool.onKey!(doc, 'Delete')).toBe(true);
    expect((meshOf(doc.file).vertices ?? []).length).toBe(antes - 2);
    expect(recados.at(-1)).toContain('foi para a base');
  });

  it('ligar um osso à malha acontece com uma animação aberta, e o rodapé diz que foi para a base', () => {
    const doc = new Doc(twoBoneFile());
    doc.animation = 'andar';
    const linha = toggleMeshBone(doc, 'baixo', 'corpo', 'tronco');
    expect(linha).toContain('foi para a base');
    expect(linha).not.toMatch(/Montagem|saia de Animando/);
    // A malha realmente ganhou o osso, mesmo animando: peso é sempre da pose de repouso.
    expect(influencingBones(tableOf(meshOf(doc.file)))).toContain(1);
  });

  it('o mesmo gesto com a base aberta não diz "foi para a base": é lá que ele já está', () => {
    const doc = new Doc(twoBoneFile());
    const linha = toggleMeshBone(doc, 'baixo', 'corpo', 'tronco');
    expect(linha).not.toContain('foi para a base');
  });

  it('a linha da aba é uma só, curta, e diz o que acontece — não o que é proibido', () => {
    // Uma frase só: no máximo um ponto final, nada de parágrafo.
    expect(MESH_REST_POSE_NOTICE.split('.').filter((f) => f.trim() !== '').length).toBeLessThanOrEqual(1);
    expect(MESH_REST_POSE_NOTICE.length).toBeLessThan(120);
    expect(MESH_REST_POSE_NOTICE).not.toMatch(/Montagem|volte|não pode|bloqueado|proibid/i);
  });
});

// ---------------------------------------------------------------------------
// A região girada no atlas (PEDIDOS-FASE3B, pedido 15)
// ---------------------------------------------------------------------------

describe('cropPlacement', () => {
  /** A região do atlas, com os campos que a spec 10.3 dá. */
  function region(rotation: 0 | 90): {
    x: number; y: number; width: number; height: number;
    rotation: 0 | 90; offsetX: number; offsetY: number;
    originalWidth: number; originalHeight: number;
  } {
    return {
      x: 100, y: 40, width: 12, height: 30,
      rotation, offsetX: 3, offsetY: 5,
      originalWidth: 20, originalHeight: 50,
    };
  }

  /** Aplica a matriz de canvas `(a, b, c, d, e, f)` a um ponto. */
  function apply(
    m: readonly [number, number, number, number, number, number], x: number, y: number,
  ): [number, number] {
    return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
  }

  it('sem giro, só devolve o recorte para o lugar de onde foi cortado', () => {
    const r = region(0);
    const place = cropPlacement(r);
    expect([place.sx, place.sy, place.sw, place.sh]).toEqual([100, 40, 12, 30]);
    // dy = originalHeight - offsetY - height = 50 - 5 - 30 = 15
    expect(apply(place.matrix, 0, 0)).toEqual([3, 15]);
    expect(apply(place.matrix, 12, 30)).toEqual([15, 45]);
  });

  it('girada, lê um retângulo deitado e o desvira', () => {
    const r = region(90);
    const place = cropPlacement(r);
    // O retângulo na página é `height x width`, não `width x height`.
    expect([place.sx, place.sy, place.sw, place.sh]).toEqual([100, 40, 30, 12]);

    // A conta de 10.4 diz que o pixel (px, py) do recorte mora na página em
    // (x + height - py, y + px). Lendo ao contrário, o pixel (u, v) do
    // retângulo lido tem de cair em (v + offsetX, height - u + dy).
    const dy = r.originalHeight - r.offsetY - r.height;
    for (const [u, v] of [[0, 0], [30, 0], [0, 12], [30, 12], [7, 5]]) {
      const [x, y] = apply(place.matrix, u, v);
      expect([x, y]).toEqual([v + r.offsetX, r.height - u + dy]);
    }
  });

  it('o canto de cima do recorte vira o canto de cima da imagem', () => {
    const r = region(90);
    const place = cropPlacement(r);
    const dy = r.originalHeight - r.offsetY - r.height;
    // Pixel (px=0, py=0) do recorte: página (x + height, y), ou seja u = height.
    expect(apply(place.matrix, r.height, 0)).toEqual([r.offsetX, dy]);
  });
});
});

// ---------------------------------------------------------------------------
// malha p liga (lote 63) — era `lote63-malha-p-liga.test.ts`
// ---------------------------------------------------------------------------

describe('malha p liga (lote 63)', () => {
/**
 * Lote 63 (plano "malha — o P liga o osso").
 *
 * Sem DOM. O Humberto, 10/09/2026: *"escolhe o osso que vai ser pai, e P,
 * para virar pai de quem for selecionado. Pergunta: como faz para associar um
 * osso à malha?"*. O que se prova aqui: osso escolhido, P segurado, clique
 * numa malha liga o osso a ela; o mesmo clique tira; Pesos automáticos usa só
 * os ossos da lista; P numa imagem inteira continua trocando o pai.
 */
const HIPS = 1;
const TORSO = 2;
const CAPA = 3;

function tabela(...pontos: Array<Record<number, number>>): WeightTable {
  return pontos.map((p) => new Map(Object.entries(p).map(([k, v]) => [Number(k), v])));
}

function soma(v: Map<number, number>): number {
  let s = 0;
  for (const w of v.values()) s += w;
  return s;
}

describe('bindBone e unbindBone, puros', () => {
  it('bindBone em tabela vazia, 4 pontos: 4 entradas com peso 1', () => {
    const out = bindBone([], CAPA, 4);
    expect(out).toHaveLength(4);
    for (const v of out) {
      expect([...v]).toEqual([[CAPA, 1]]);
      expect(soma(v)).toBe(1);
    }
  });

  it('bindBone com hips a 1 em 4 pontos: capa entra com 0, a soma continua 1, a lista mostra os dois', () => {
    const out = bindBone(tabela({ [HIPS]: 1 }, { [HIPS]: 1 }, { [HIPS]: 1 }, { [HIPS]: 1 }), CAPA, 4);
    for (const v of out) {
      expect(v.get(CAPA)).toBe(0);
      expect(soma(v)).toBe(1);
    }
    expect(influencingBones(out)).toEqual([HIPS, CAPA]);
  });

  it('unbindBone de hips em hips 0,6 · torso 0,4: torso 1; o ponto só de hips fica sem entrada, com aviso', () => {
    const out = unbindBone(tabela({ [HIPS]: 0.6, [TORSO]: 0.4 }, { [HIPS]: 1 }), HIPS);
    expect([...out.table[0]!]).toEqual([[TORSO, 1]]);
    expect(out.table[1]!.size).toBe(0);
    expect(out.orphans).toBe(1);
    expect(out.warning).toBe('1 ponto ficou sem osso');
  });

  it('unbindBone quando os outros tinham 0: dividem por igual, soma 1', () => {
    const out = unbindBone(tabela({ [HIPS]: 1, [TORSO]: 0, [CAPA]: 0 }), HIPS);
    expect(out.table[0]!.get(TORSO)).toBeCloseTo(0.5, 12);
    expect(out.table[0]!.get(CAPA)).toBeCloseTo(0.5, 12);
    expect(out.warning).toBeNull();
  });

  it('peso 0 vai para o arquivo: a §7.4 aceita, e a lista não se perde ao gravar', () => {
    const frames: BoneFrame[] = [
      { index: 0, name: 'root', length: 0, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 },
      { index: HIPS, name: 'hips', length: 10, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 90 },
      { index: TORSO, name: 'torso', length: 10, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 100 },
      { index: CAPA, name: 'capa', length: 10, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 110 },
    ];
    const binding = tableToBinding(bindBone(tabela({ [HIPS]: 1 }), CAPA, 1), [5, 5], frames);
    expect(binding.counts).toEqual([2]);
    expect(binding.bones).toEqual([HIPS, CAPA]);
    expect(binding.weights).toEqual([1, 0]);
  });
});

describe('Pesos automáticos: só os ossos da lista', () => {
  const frames: BoneFrame[] = [
    { index: 0, name: 'root', length: 0, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 },
    { index: HIPS, name: 'hips', length: 10, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 },
    { index: TORSO, name: 'torso', length: 10, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 100 },
    { index: CAPA, name: 'terceiro', length: 10, a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 50 },
  ];

  it('com a lista [hips, torso] e um terceiro osso mais perto, o terceiro não recebe peso', () => {
    const lista = tabela({ [HIPS]: 1, [TORSO]: 0 });
    const bones = autoWeightBones(lista, frames);
    expect(bones).toEqual([HIPS, TORSO]);
    const out = autoWeights([5, 50], frames, { bones });
    expect(out[0]!.has(CAPA)).toBe(false);
    expect(soma(out[0]!)).toBeCloseTo(1, 9);
  });

  it('lista vazia: como sempre, todo osso com comprimento', () => {
    expect(autoWeightBones(tabela({}), frames)).toEqual([HIPS, TORSO, CAPA]);
  });
});

/** root; hips em (0,90); a malha capa na raiz, um quadrado em (−20,120)–(20,160); a mão na raiz em (200,0). */
function boneco(comTorso = false): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', x: 0, y: 90, length: 10 },
      ...(comTorso ? [{ name: 'torso', parent: 'hips', length: 10 }] : []),
    ],
    slots: [
      { name: 'capa', bone: 'root', attachment: 'capa' },
      { name: 'mao', bone: 'root', attachment: 'mao' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        capa: {
          capa: {
            type: 'mesh', path: 'capa', uvs: [0, 0, 1, 0, 1, 1, 0, 1], triangles: [0, 1, 2, 0, 2, 3],
            vertices: [-20, 120, 20, 120, 20, 160, -20, 160], hull: 4,
          },
        },
        mao: { mao: { type: 'region', path: 'mao', x: 200, y: 0, width: 30, height: 30 } },
      },
    }],
  } as unknown as BoneFile);
}

function ev(x: number, y: number): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 };
}

function malha(doc: Doc): Record<string, unknown> {
  const skin = doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>;
  return skin['capa']!['capa']!;
}

describe('P + clique numa malha volta a prender o slot (lote 69)', () => {
  it('com hips escolhido, P + clique na malha prende o SLOT dela, e a malha não ganha peso', () => {
    // Lote 69, item h: o gesto do lote 63 saiu. Nem o Spriter, nem o Spine,
    // nem o DragonBones ligam osso com tecla segurada; quem liga é o botão.
    const doc = boneco();
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey(doc, 'p');
    selectTool.onDown(doc, ev(0, 140));
    selectTool.onUp(doc, ev(0, 140));
    selectTool.onKeyUp(doc, 'p');
    expect(doc.file.slots!.find((entry) => entry.name === 'capa')!.bone).toBe('hips');
    expect(malha(doc)['binding']).toBeUndefined();
    expect(malha(doc)['vertices']).toBeDefined();
  });

  it('P + clique numa imagem inteira continua trocando o pai do slot', () => {
    const doc = boneco();
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey(doc, 'p');
    selectTool.onDown(doc, ev(200, 0));
    selectTool.onUp(doc, ev(200, 0));
    selectTool.onKeyUp(doc, 'p');
    expect(doc.file.slots!.find((entry) => entry.name === 'mao')!.bone).toBe('hips');
    expect(malha(doc)['vertices']).toBeDefined();
  });
});
});

// ---------------------------------------------------------------------------
// pesos, uma imagem em dois ossos (lote 69)
// ---------------------------------------------------------------------------

describe('pesos, uma imagem em dois ossos (lote 69)', () => {
/**
 * Lote 69 (plano "pesos — uma imagem em dois ossos").
 *
 * O Humberto, 12/09/2026: *"não consigo usar peso de forma decente; pega uma
 * imagem e liga a dois ossos; o sistema não está completo"*. O modelo é o do
 * Spine e o do DragonBones, iguais no essencial: um botão **Ligar** abre um
 * modo, cada clique num osso liga ou tira, cada osso ligado tem uma **cor**,
 * cada vértice é uma **pizza**, e a malha **nunca sai da seleção** no meio.
 *
 * Sem DOM: a decisão de cada gesto mora em módulo puro, e é ela que se prova.
 */
const HIPS = 1;
const TORSO = 2;

function tabela69(...pontos: Array<Record<number, number>>): WeightTable {
  return pontos.map((p) => new Map(Object.entries(p).map(([k, v]) => [Number(k), v])));
}

/** root; hips em (0,90); torso filho; a malha capa em (−20,120)–(20,160); a mão em (200,0). */
function boneco69(): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', x: 0, y: 90, length: 10 },
      { name: 'torso', parent: 'hips', length: 10 },
    ],
    slots: [
      { name: 'capa', bone: 'root', attachment: 'capa' },
      { name: 'mao', bone: 'root', attachment: 'mao' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        capa: {
          capa: {
            type: 'mesh', path: 'capa', uvs: [0, 0, 1, 0, 1, 1, 0, 1], triangles: [0, 1, 2, 0, 2, 3],
            vertices: [-20, 120, 20, 120, 20, 160, -20, 160], hull: 4,
          },
        },
        mao: { mao: { type: 'region', path: 'mao', x: 200, y: 0, width: 30, height: 30 } },
      },
    }],
  } as unknown as BoneFile);
}

function evento69(x: number, y: number): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 };
}

function malha69(doc: Doc): Record<string, unknown> {
  const skin = doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>;
  return skin['capa']!['capa']!;
}

/** A malha escolhida, que é como o programa fica quando se clica nela. */
function comAMalha(doc: Doc): void {
  doc.select({ ...emptySelection(), slots: ['capa'], attachments: [{ slot: 'capa', attachment: 'capa' }] });
}

/** A linha da Árvore de um osso, como a Árvore monta. */
function linhaDoOsso(name: string): never {
  return { id: `bone:${name}`, kind: 'bone', name, depth: 0 } as never;
}

describe('o modo Ligar, como o Bind do Spine', () => {
  it('abre e fecha no mesmo botão', () => {
    setBindMode(false);
    expect(toggleBindMode()).toBe(true);
    expect(bindModeOpen()).toBe(true);
    expect(toggleBindMode()).toBe(false);
    expect(bindModeOpen()).toBe(false);
  });

  it('aberto, o clique num osso de fora da lista liga ele: entra com 0, um passo de desfazer', () => {
    const doc = boneco69();
    comAMalha(doc);
    setBindMode(true);
    expect(bindModeClick(doc, 'torso')).toBe(true);
    expect(doc.undoLabel).toBe('Ligar torso à malha capa');
    expect(bindModeClick(doc, 'hips')).toBe(true);
    expect(doc.undoLabel).toBe('Ligar hips à malha capa');
    const b = (malha69(doc) as { binding: { counts: number[]; bones: number[]; weights: number[] } }).binding;
    expect(b.counts).toEqual([2, 2, 2, 2]);
    for (let v = 0; v < 4; v++) {
      expect(b.bones.slice(v * 2, v * 2 + 2)).toEqual([HIPS, TORSO]);
      expect(b.weights.slice(v * 2, v * 2 + 2)).toEqual([0, 1]);
    }
    // A malha não saiu da seleção em momento nenhum — a regra do Spine.
    expect(doc.selection.attachments).toEqual([{ slot: 'capa', attachment: 'capa' }]);
    setBindMode(false);
  });

  it('aberto, o clique num osso que já está na lista tira ele, e o peso vai para os outros', () => {
    const doc = boneco69();
    comAMalha(doc);
    setBindMode(true);
    bindModeClick(doc, 'torso');
    bindModeClick(doc, 'hips');
    bindModeClick(doc, 'torso');
    expect(doc.undoLabel).toBe('Tirar torso da malha capa');
    const b = (malha69(doc) as { binding: { counts: number[]; bones: number[]; weights: number[] } }).binding;
    expect(b.counts).toEqual([1, 1, 1, 1]);
    expect(b.bones).toEqual([HIPS, HIPS, HIPS, HIPS]);
    expect(b.weights).toEqual([1, 1, 1, 1]);
    setBindMode(false);
  });

  it('fechado, o clique num osso não liga nada', () => {
    const doc = boneco69();
    comAMalha(doc);
    setBindMode(false);
    expect(bindModeClick(doc, 'hips')).toBe(false);
    expect(malha69(doc)['binding']).toBeUndefined();
  });

  it('Esc fecha o modo e não mexe na seleção', () => {
    const doc = boneco69();
    comAMalha(doc);
    const antes = doc.selection;
    setBindMode(true);
    expect(weightsTool.onKey!(doc, 'Escape')).toBe(true);
    expect(bindModeOpen()).toBe(false);
    expect(doc.selection).toEqual(antes);
    // Sem modo aberto, o Esc segue adiante: quem trata é o de sempre.
    expect(weightsTool.onKey!(doc, 'Escape')).toBe(false);
  });

  it('o clique na cena liga o osso com QUALQUER ferramenta na mão — conserto do lote 70', () => {
    // O Humberto, na v11.6: "vi onde estava a corrente; clica nela e no osso,
    // não funciona". Só a ferramenta Pesos atendia, e o programa abre com o
    // Transformar. Agora quem atende é a cena, antes da ferramenta.
    const doc = boneco69();
    comAMalha(doc);
    setBindMode(true);
    // hips vai de (0,90) a (10,90).
    expect(bindModeSceneClick(doc, 5, 90, 1)).toBe(true);
    expect(doc.undoLabel).toBe('Ligar hips à malha capa');
    expect(doc.selection.attachments).toEqual([{ slot: 'capa', attachment: 'capa' }]);
    setBindMode(false);
  });

  it('com o modo aberto, o clique no vazio não faz nada e não chega na ferramenta', () => {
    const doc = boneco69();
    comAMalha(doc);
    const antes = doc.undoLabel;
    setBindMode(true);
    expect(bindModeSceneClick(doc, 900, 900, 1)).toBe(true);
    expect(doc.undoLabel).toBe(antes);
    expect(doc.selection.attachments).toEqual([{ slot: 'capa', attachment: 'capa' }]);
    setBindMode(false);
  });

  it('com o modo fechado, a cena não se mete: o clique segue para a ferramenta', () => {
    const doc = boneco69();
    comAMalha(doc);
    setBindMode(false);
    expect(bindModeSceneClick(doc, 5, 90, 1)).toBe(false);
  });

  it('bindClick, puro: fora da lista liga, na lista tira', () => {
    const lista = tabela69({ [HIPS]: 1, [TORSO]: 0 });
    expect(bindClick(lista, TORSO)).toBe('tirar');
    expect(bindClick(lista, 3)).toBe('ligar');
  });

  it('a frase do rodapé é a do plano', () => {
    // Item 4.4: "Ligar" sozinho fazia três trabalhos; este botão passou a se
    // chamar "Ligar ossos", e a frase do rodapé foi junto.
    expect(BIND_NOTICE).toBe('Clique nos ossos que puxam esta malha. Ligar ossos de novo termina.');
  });
});

describe('a cor de cada osso e a pizza de cada vértice', () => {
  it('boneColor num osso sem cor: a da paleta pelo índice, sempre a mesma', () => {
    const file = boneco69().file;
    const cor = boneColor(file, HIPS);
    expect(cor).toMatch(/^#[0-9a-f]{6}$/);
    expect(boneColor(file, HIPS)).toBe(cor);
    expect(boneColor(file, TORSO)).not.toBe(cor);
  });

  it('boneColor num osso COM cor no arquivo: a cor dele', () => {
    const doc = boneco69();
    doc.file.bones![HIPS]!.color = [1, 0.5, 0, 1];
    expect(boneColor(doc.file, HIPS)).toBe('rgb(255, 128, 0)');
  });

  it('pieOf em arm 0,25 · forearm 0,75: duas fatias, em ordem de índice', () => {
    const pizza = pieOf(tabela69({ [TORSO]: 0.75, [HIPS]: 0.25 }), 0);
    expect(pizza).toEqual([{ bone: HIPS, weight: 0.25 }, { bone: TORSO, weight: 0.75 }]);
  });

  it('pieOf: o osso da lista com peso 0 não vira fatia, e vértice sem osso não tem pizza', () => {
    expect(pieOf(tabela69({ [HIPS]: 1, [TORSO]: 0 }), 0)).toEqual([{ bone: HIPS, weight: 1 }]);
    expect(pieOf(tabela69({}), 0)).toEqual([]);
    expect(pieOf([], 3)).toEqual([]);
  });
});

describe('a malha não sai da seleção quando se escolhe o osso', () => {
  it('selectionForRow(osso, keep) com um desenho escolhido: o osso entra, os desenhos ficam', () => {
    const keep = {
      ...emptySelection(),
      slots: ['capa'],
      attachments: [{ slot: 'capa', attachment: 'capa' }],
    };
    const saiu = selectionForRow(linhaDoOsso('hips'), keep);
    expect(saiu.bones).toEqual(['hips']);
    expect(saiu.attachments).toEqual(keep.attachments);
    expect(saiu.slots).toEqual(['capa']);
  });

  it('selectionForRow(osso) sem keep: como sempre, só o osso', () => {
    const saiu = selectionForRow(linhaDoOsso('hips'));
    expect(saiu.bones).toEqual(['hips']);
    expect(saiu.attachments).toEqual([]);
    expect(saiu.slots).toEqual([]);
  });

  it('com Pesos na mão, o clique num osso da cena escolhe o osso e o desenho fica', () => {
    const doc = boneco69();
    comAMalha(doc);
    setBindMode(false);
    const antes = doc.undoLabel;
    // hips vai de (0,90) a (10,90); a malha está em y 120..160. O clique cai
    // no osso e FORA da malha.
    weightsTool.onDown!(doc, evento69(5, 90));
    weightsTool.onUp!(doc, evento69(5, 90));
    expect(doc.selection.bones).toEqual(['hips']);
    expect(doc.selection.attachments).toEqual([{ slot: 'capa', attachment: 'capa' }]);
    expect(doc.undoLabel).toBe(antes);
  });

  it('o clique DENTRO da malha continua pintando', () => {
    const doc = boneco69();
    comAMalha(doc);
    setBindMode(true);
    bindModeClick(doc, 'hips');
    setBindMode(false);
    doc.select({ ...doc.selection, bones: ['hips'] });
    weightsTool.onDown!(doc, evento69(0, 140));
    weightsTool.onUp!(doc, evento69(0, 140));
    expect(doc.selection.bones).toEqual(['hips']);
    expect(doc.undoLabel).toBe('Pintar pesos');
  });
});

describe('o raio do pincel e a linha da ferramenta', () => {
  it('initialRadius numa malha 44 × 22: 11, um quarto do maior lado', () => {
    expect(initialRadius({
      vertices: [0, 0, 44, 0, 44, 22, 0, 22], uvs: [], triangles: [], edges: [], hull: 4,
    })).toBe(11);
  });

  it('initialRadius numa malha minúscula: nunca menos que 4', () => {
    expect(initialRadius({
      vertices: [0, 0, 6, 0, 6, 6, 0, 6], uvs: [], triangles: [], edges: [], hull: 4,
    })).toBe(4);
  });

  it('a malha oferece o raio; depois de o Humberto mexer, a oferta cala', () => {
    forgetRadiusChoice();
    expect(getBrush().radius).toBe(40);
    suggestRadius(11);
    expect(getBrush().radius).toBe(11);
    setBrush({ radius: 30 });
    suggestRadius(11);
    expect(getBrush().radius).toBe(30);
    forgetRadiusChoice();
  });

  it('a linha "Escolha a ferramenta" só aparece sem Malha nem Pesos na mão', () => {
    expect(toolHintNeeded('transform')).toBe(true);
    expect(toolHintNeeded('mesh')).toBe(false);
    expect(toolHintNeeded('weights')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// A porta é uma só — pedido de 13/09/2026: abrir a malha liga a ferramenta.
// ---------------------------------------------------------------------------

describe('a aba liga a ferramenta Malha sozinha — só na malha recém-criada (K11, P21)', () => {
  /*
   * Até 29/09 ela ligava a cada TROCA de malha escolhida: com Transformar na
   * mão, clicar no rosto do herói ligava a Malha, e o gizmo do osso sumia — com
   * a aba Malha e pesos escondida atrás de Animações. Escolher não troca de
   * ferramenta; só o "Virar malha" liga, porque é um clique na própria aba.
   */
  it('malha que acabou de nascer, ferramenta fora de Malha/Pesos: liga', () => {
    expect(shouldAutoPickMeshTool('capa/capa', 'transform')).toBe(true);
    expect(shouldAutoPickMeshTool('capa/capa', 'select')).toBe(true);
  });

  it('já com Malha ou Pesos na mão: não tira', () => {
    expect(shouldAutoPickMeshTool('capa/capa', 'mesh')).toBe(false);
    expect(shouldAutoPickMeshTool('capa/capa', 'weights')).toBe(false);
  });

  it('nada nasceu: não liga nada', () => {
    expect(shouldAutoPickMeshTool(null, 'transform')).toBe(false);
  });

  it('o desenho da aba NÃO troca de ferramenta; só o "Virar malha" chama a regra', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(fonte).not.toContain('autoPickTool');
    const virar = fonte.slice(fonte.indexOf('private regionToMesh('), fonte.indexOf('private autoMesh('));
    expect(virar).toContain('shouldAutoPickMeshTool(`${slot}/${name}`, getActiveToolId())');
    expect(fonte.split('shouldAutoPickMeshTool(').length - 1).toBe(1);
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 7, tarefa 7.4 (defeito A3): a Malha pega caixa, máscara e caminho
//
// A ficha da caixa e a da máscara sempre disseram "arraste com a ferramenta
// Malha", e a Malha só pegava `mesh`: a frase mandava para uma porta fechada.
// ---------------------------------------------------------------------------

describe('a Malha pega caixa, máscara e caminho (7.4)', () => {
  function docCom(anexo: Record<string, unknown>): Doc {
    return new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'forma', bone: 'root', attachment: 'forma' }],
      skins: [{ name: 'default', attachments: { forma: { forma: anexo } } }],
    } as unknown as BoneFile);
  }

  const quadrado = [-20, 120, 20, 120, 20, 160, -20, 160];

  function escolher(doc: Doc): void {
    doc.select({
      ...emptySelection(), slots: ['forma'], attachments: [{ slot: 'forma', attachment: 'forma' }],
    });
  }

  function anexoDe(doc: Doc): Record<string, unknown> {
    const skin = doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>;
    return skin['forma']!['forma']!;
  }

  function evento(x: number, y: number, ctrl = false): ToolEvent {
    return { x, y, dx: 0, dy: 0, shift: false, ctrl, alt: false, button: 0, scale: 1 };
  }

  it('a caixa de contorno, a máscara e o caminho viram MeshRef; a região não', () => {
    for (const tipo of ['boundingbox', 'clipping']) {
      const doc = docCom({ type: tipo, vertices: quadrado.slice() });
      expect(meshRef(doc, 'forma', 'forma')?.kind, tipo).toBe(tipo);
    }
    const caminho = docCom({
      type: 'path', lengths: [40],
      vertices: [-20, 100, -20, 120, -20, 140, 20, 140, 20, 160, 20, 180],
    });
    expect(meshRef(caminho, 'forma', 'forma')?.kind).toBe('path');
    const regiao = docCom({ type: 'region', path: 'forma', width: 10, height: 10 });
    expect(meshRef(regiao, 'forma', 'forma')).toBe(null);
  });

  it('a caixa em retângulo fica de fora, e a Malha diz por quê (regra 21)', () => {
    const doc = docCom({ type: 'boundingbox', shape: 'rectangle', width: 40, height: 40 });
    expect(meshRef(doc, 'forma', 'forma')).toBe(null);
    escolher(doc);
    expect(shapeRefusal(doc)).toContain('retângulo');
  });

  it('arrastar um canto da caixa grava só `vertices`: nada de uvs nem triângulos', () => {
    const doc = docCom({ type: 'boundingbox', vertices: quadrado.slice() });
    escolher(doc);
    const view = readMesh(doc, meshRef(doc, 'forma', 'forma')!);
    moveMeshVertex(doc, view, 0, -30, 110);
    const def = anexoDe(doc);
    expect((def['vertices'] as number[])[0]).toBeCloseTo(-30, 6);
    expect((def['vertices'] as number[])[1]).toBeCloseTo(110, 6);
    expect(def['uvs']).toBeUndefined();
    expect(def['triangles']).toBeUndefined();
    expect(def['hull']).toBeUndefined();
  });

  it('o canto novo de uma máscara entra NA ARESTA mais perto, e o contorno continua em ordem', () => {
    const doc = docCom({ type: 'clipping', end: 'forma', vertices: quadrado.slice() });
    escolher(doc);
    const view = readMesh(doc, meshRef(doc, 'forma', 'forma')!);
    // Perto do meio da aresta de baixo, que vai do vértice 0 ao 1.
    expect(nearestHullEdge(view.geometry, 0, 118)).toBe(0);
    addMeshVertex(doc, view, 0, 118);
    expect(anexoDe(doc)['vertices']).toEqual([-20, 120, 0, 118, 20, 120, 20, 160, -20, 160]);
  });

  it('o contorno nunca desce de três cantos', () => {
    const doc = docCom({ type: 'clipping', vertices: [-20, 120, 20, 120, 0, 160] });
    escolher(doc);
    const view = readMesh(doc, meshRef(doc, 'forma', 'forma')!);
    expect(() => removeMeshVertex(doc, view, 0)).toThrow();
  });

  it('o caminho se arrasta, e o `lengths` é refeito a cada mexida', () => {
    const doc = docCom({
      type: 'path', lengths: [0],
      vertices: [-10, 0, 0, 0, 10, 0, 90, 0, 100, 0, 110, 0],
    });
    escolher(doc);
    const view = readMesh(doc, meshRef(doc, 'forma', 'forma')!);
    moveMeshVertex(doc, view, 1, 0, 0);
    const lengths = anexoDe(doc)['lengths'] as number[];
    expect(lengths).toHaveLength(1);
    expect(lengths[0]).toBeCloseTo(100, 0);
  });

  it('o caminho não ganha nem perde ponto pela cena: ele diz o porquê', () => {
    const doc = docCom({
      type: 'path', lengths: [100],
      vertices: [-10, 0, 0, 0, 10, 0, 90, 0, 100, 0, 110, 0],
    });
    escolher(doc);
    const view = readMesh(doc, meshRef(doc, 'forma', 'forma')!);
    expect(addMeshVertex(doc, view, 50, 20)).toBe(PATH_VERTEX_NOTICE);
    expect(removeMeshVertex(doc, view, 0)).toBe(PATH_VERTEX_NOTICE);
    expect((anexoDe(doc)['vertices'] as number[]).length).toBe(12);
  });

  it('a malha de sempre continua gravando uvs, triângulos e contorno', () => {
    const doc = docCom({
      type: 'mesh', path: 'forma', uvs: [0, 0, 1, 0, 1, 1, 0, 1], triangles: [0, 1, 2, 0, 2, 3],
      vertices: quadrado.slice(), hull: 4,
    });
    escolher(doc);
    const view = readMesh(doc, meshRef(doc, 'forma', 'forma')!);
    addMeshVertex(doc, view, 0, 140);
    const def = anexoDe(doc);
    expect((def['uvs'] as number[]).length).toBe(10);
    expect(def['hull']).toBe(4);
  });

  it('o comprimento de uma curva reta é a distância entre as âncoras', () => {
    expect(pathLengths([-10, 0, 0, 0, 10, 0, 90, 0, 100, 0, 110, 0], false)[0]).toBeCloseTo(100, 0);
    expect(pathLengths([0, 0, 0, 0, 0, 0], false)).toEqual([]);
  });

  it('a ferramenta na mão diz a recusa uma vez só, e volta a dizer quando o anexo muda', () => {
    const doc = docCom({ type: 'region', path: 'forma', width: 10, height: 10 });
    escolher(doc);
    const ditas: string[] = [];
    const parar = doc.on((change) => { if (change.label !== undefined) ditas.push(change.label); });
    meshTool.onDown!(doc, evento(0, 140));
    meshTool.onDown!(doc, evento(0, 140));
    parar();
    expect(ditas.filter((linha) => linha.includes('não tem contorno'))).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Degrau 7, tarefa 7.6 (F9, spec 9.6): Chavear pesos
//
// Pintar peso continua indo para a BASE, animação aberta ou não (A5, M7):
// "peso é gesto de estrutura na cabeça de quem pinta". Quem quer o peso
// animado aperta o botão, e só então nasce a chave.
// ---------------------------------------------------------------------------

/** Os dois ossos e a malha quadrada, como o `describe` de cima os monta. */
function doisOssos(mesh?: MeshAttachmentDef): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'teste', fps: 30 },
    bones: [
      { name: 'root' },
      { name: 'baixo', parent: 'root', length: 100 },
      { name: 'cima', parent: 'root', y: 100, length: 100 },
    ],
    slots: [{ name: 'corpo', bone: 'baixo', attachment: 'tronco' }],
    skins: [{
      name: 'default',
      attachments: {
        corpo: {
          tronco: mesh ?? {
            type: 'mesh', path: 'tronco',
            uvs: [0, 0, 1, 0, 1, 1, 0, 1], triangles: [0, 1, 2, 0, 2, 3],
            vertices: [-20, -20, 20, -20, 20, 20, -20, 20], hull: 4,
          } as MeshAttachmentDef,
        },
      },
    }],
    animations: [{ name: 'andar', duration: 1 }],
  } as unknown as BoneFile;
}

/** A malha como o arquivo a guarda. */
function troncoDe(file: BoneFile): MeshAttachmentDef {
  const def = file.skins?.[0]?.attachments?.['corpo']?.['tronco'];
  if (def == null) throw new Error('a malha sumiu do arquivo');
  return def as MeshAttachmentDef;
}

describe('Chavear pesos (7.6)', () => {
  /** A malha `tronco` com pesos nos dois ossos, num documento. */
  function comPesos(): { doc: Doc; view: ReturnType<typeof readMesh> } {
    const file = doisOssos();
    const frames = boneFramesFromFile(file);
    const slotFrame = slotBoneFrame(file, 'corpo', frames)!;
    const table = autoWeights(worldPositionsOf(troncoDe(file), frames, slotFrame), frames, { bones: [1, 2] });
    const bound = bindAttachment(troncoDe(file), table, frames, slotFrame);
    const doc = new Doc(doisOssos(bound));
    const view = readMesh(doc, meshRef(doc, 'corpo', 'tronco')!);
    return { doc, view };
  }

  it('a chave leva TODOS os pesos do binding, na ordem dele (9.6)', () => {
    const { doc, view } = comPesos();
    doc.animation = 'andar';
    doc.time = 0.5;
    keyWeights(doc, view);
    const timeline = findTimeline(doc.file, 'andar', weightsTarget('corpo', 'tronco'));
    expect(timeline).not.toBeNull();
    const keys = (timeline as unknown as { keys: Array<{ time: number; value: number[] }> }).keys;
    expect(keys).toHaveLength(1);
    expect(keys[0].time).toBeCloseTo(0.5, 9);
    expect(keys[0].value).toEqual(weightsValueOf(view));
    expect(keys[0].value.length).toBe(view.ref.def.binding!.weights.length);
  });

  it('a soma por vértice é 1: é o que o editor grava, e o que 9.6 cobra', () => {
    const { doc, view } = comPesos();
    doc.animation = 'andar';
    keyWeights(doc, view);
    const binding = view.ref.def.binding!;
    const value = weightsValueOf(view);
    let j = 0;
    for (const count of binding.counts) {
      let soma = 0;
      for (let k = 0; k < count; k++, j++) soma += value[j]!;
      expect(soma).toBeCloseTo(1, 6);
    }
  });

  it('a base não muda: chavear não mexe no binding do arquivo', () => {
    const { doc, view } = comPesos();
    doc.animation = 'andar';
    const antes = JSON.stringify(troncoDe(doc.file).binding);
    keyWeights(doc, view);
    expect(JSON.stringify(troncoDe(doc.file).binding)).toBe(antes);
  });

  it('com a base aberta, ele diz que precisa de uma animação — não grava calado', () => {
    const { doc, view } = comPesos();
    expect(doc.animation).toBe(null);
    expect(keyWeights(doc, view)).toBe(WEIGHTS_KEY_NO_ANIMATION);
    expect(doc.file.animations?.[0].timelines).toBeUndefined();
  });

  it('sem pesos não há o que chavear, e ele diz por quê', () => {
    const doc = new Doc(doisOssos());
    doc.animation = 'andar';
    const view = readMesh(doc, meshRef(doc, 'corpo', 'tronco')!);
    expect(keyWeights(doc, view)).toBe(WEIGHTS_KEY_NO_BINDING);
  });

  it('o rodapé diz o segundo e lembra que pintar vai para a base', () => {
    const { doc, view } = comPesos();
    doc.animation = 'andar';
    doc.time = 0.5;
    const linha = keyWeights(doc, view);
    expect(linha).toContain('0,50 s');
    expect(linha).toContain('base');
  });
});

// ---------------------------------------------------------------------------
// Degrau 7, tarefa 7.7 (M7): a forma e os pesos vão para a base do corpo do
// instante, e a chave `deform` velha é dita em voz alta (desvio 5 do Chat C).
// ---------------------------------------------------------------------------

describe('a forma vai para a base, e a chave velha é dita (7.7)', () => {
  it('sem chave de deformação, o aviso é vazio: não há o que avisar', () => {
    const doc = new Doc(doisOssos());
    expect(deformWarningFor(doc, meshRef(doc, 'corpo', 'tronco')!)).toBe('');
  });

  it('com chave de deformação, ele conta quantas e de qual animação', () => {
    const doc = new Doc(doisOssos());
    doc.animation = 'andar';
    doc.time = 0.5;
    const view = readMesh(doc, meshRef(doc, 'corpo', 'tronco')!);
    moveMeshVertex(doc, view, 0, -30, -25);
    const aviso = deformWarningFor(doc, view.ref);
    expect(aviso).toContain('1 chave de deformação');
    expect(aviso).toContain('"andar"');
    expect(aviso).toContain('outros vértices');
  });

  it('a forma escrita com animação aberta vai para a base, e o rodapé diz', () => {
    const doc = new Doc(doisOssos());
    doc.animation = 'andar';
    const view = readMesh(doc, meshRef(doc, 'corpo', 'tronco')!);
    const antes = (troncoDe(doc.file).vertices ?? []).length;
    addMeshVertex(doc, view, 0, 0);
    expect((troncoDe(doc.file).vertices ?? []).length).toBe(antes + 2);
    expect(MESH_REST_POSE_NOTICE).toContain('base');
  });

  it('gerar malha no meio grava no corpo do instante, não no arquivo em foco', () => {
    const fonte = readFileSync(resolve(import.meta.dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    // M7: era `doc.run`, e com a virada de corpo aberta o ponteiro era medido
    // num arquivo e aplicado noutro. O teste prende a porta certa.
    expect(fonte).toContain('corpoDe(doc).run(new SetProperties(pointers');
    expect(fonte).toContain('deformWarningFor(doc, view.ref)');
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, L2 + L3, L1a, L5, L11b: os pesos que se veem
// ---------------------------------------------------------------------------

describe('rodada 17: depois de Pesos automáticos a cena mostra os pesos, e o rodapé diz', () => {
  it('a ferramenta Pesos entra na mão quando não está (com a Malha, com o Transformar)', () => {
    expect(shouldTakeWeightsTool('mesh')).toBe(true);
    expect(shouldTakeWeightsTool('transform')).toBe(true);
    expect(shouldTakeWeightsTool('weights')).toBe(false);
  });

  it('o rodapé leva o resultado e o que a cena mostra (antes: só "Pesos automáticos.")', () => {
    expect(weightsDoneNotice('Pesos automáticos em 4 vértices.', true))
      .toBe('Pesos automáticos em 4 vértices. A ferramenta Pesos (G) ligou: cada vértice mostra a pizza dos ossos que o puxam');
    expect(weightsDoneNotice('Pesos suavizados uma vez.', false)).toBe('Pesos suavizados uma vez');
  });

  it('o passo testar e como voltar (L11b), e a frase do Pincel (L1a)', () => {
    expect(WEIGHTS_TEST_HINT).toContain('gire um osso ligado');
    expect(WEIGHTS_TEST_HINT).toContain('Ctrl+Z');
    expect(BRUSH_TOOL_NOTICE).toContain('ferramenta Pesos, G');
  });

  it('a aba liga: o resultado vai ao rodapé, o Pincel ouve o clique no título, a aba segue a ferramenta', () => {
    const aba = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(aba).toContain("this.weightsDone(doc, `Pesos automáticos em ${table.length} vértices.`);");
    expect(aba).toContain('doc.notice(weightsDoneNotice(result, pegou));');
    expect(aba).toContain("titulo.addEventListener('click'");
    expect(aba).not.toContain("section.addEventListener('toggle', () => { pincelOpen = section.open; });");
    expect(aba).toContain('this.stopTool = onActiveToolChange(() => this.render());');
    expect(aba).toContain("body.querySelector('.malha-secao-pesos')");
  });
});

describe('rodada 17, L5 (a segunda volta): o Pincel aberto pela mão vem para o alto da aba', () => {
  it('o clique no título pede, e o desenho seguinte (ou o de agora) rola até ele', () => {
    const aba = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(aba).toContain("el('details', 'malha-secao malha-secao-pincel')");
    expect(aba).toContain('if (abre) this.trazerPincel = true;');
    expect(aba).toContain('if (this.trazerPincel) this.bringBrushIntoView();');
    // Os Pesos sobem ao pegar a ferramenta, menos quando foi o Pincel que a pegou.
    expect(aba).toContain("if (ferramenta === 'weights' && this.lastTool !== 'weights' && !this.trazerPincel) {");
  });
});

describe('rodada 41, lote 1: todo número da aba diz unidade e faixa, todo botão tem dica', () => {
  it('Raio em px e Força em %: a unidade depois da caixa, a dica leva "de … a …"', () => {
    for (const campo of Object.values(BRUSH_FIELDS)) {
      // Rodada 47, lote 3 (reescrito de propósito): a unidade saiu do rótulo (R2 do doc 68).
      expect(campo.label).not.toContain('(');
      expect(['px', '%']).toContain(campo.unit);
      expect(campo.tip).toContain(`de ${campo.min} a ${campo.max} ${campo.unit}`);
    }
    // A tela fala em %, o pincel continua em 0..1.
    expect(BRUSH_FIELDS.strength.toScreen(0.5)).toBe(50);
    expect(BRUSH_FIELDS.strength.fromScreen(50)).toBe(0.5);
    expect(BRUSH_FIELDS.radius.toScreen(11)).toBe(11);
  });

  it('os quatro modos do Pincel têm dica, e a dica começa pelo nome', () => {
    expect(BRUSH_MODES.map((m) => m.label)).toEqual(['Somar', 'Subtrair', 'Substituir', 'Suavizar']);
    for (const modo of BRUSH_MODES) expect(modo.tip.startsWith(`${modo.label}: `)).toBe(true);
  });

  it('as dicas dos botões da aba são as frases do menu, letra por letra', () => {
    const menus = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');
    for (const frase of Object.values(MESH_BUTTON_TIPS)) expect(menus).toContain(`'${frase}'`);
  });

  it('a lista diz o que é o número: média da malha, ou o vértice escolhido', () => {
    expect(boneListCaption(0)).toContain('peso médio na malha inteira');
    expect(boneListCaption(1)).toContain('peso do vértice escolhido');
    expect(boneListCaption(3)).toContain('3 vértices escolhidos');
    // Conferência da v31.9: uma palavra só — a caixa diz "vários", a frase também.
    expect(boneListCaption(3)).toContain('"vários"');
    expect(boneListCaption(3)).not.toContain('médio');
    expect(lockTip('cape1')).toContain('Travar cape1');
  });

  it('o desenho que não é imagem é dito pelo nome de gente, nunca "linkedmesh" nem "nenhum"', () => {
    expect(attachmentKindLine('region')).toBeNull();
    expect(attachmentKindLine('mesh')).toBeNull();
    const ligada = attachmentKindLine('linkedmesh', 'cape_lower') ?? '';
    expect(ligada).toContain('Malha ligada');
    expect(ligada).toContain('"cape_lower"');
    expect(ligada).not.toContain('linkedmesh');
    // O anexo que sumiu (desfazer o Usar forma): a aba pede outro.
    expect(attachmentKindLine(null)).toBe('Escolha um desenho na árvore ou na tela.');
    expect(attachmentKindLine('skeleton')).toContain('uma entidade');
  });

  it('Gerar e Traçar dizem o resultado no rodapé, não o nome do botão', () => {
    expect(shapeDoneNotice(false, 35, 57)).toBe('Malha gerada: 35 vértices, 57 triângulos');
    expect(shapeDoneNotice(true, 11, 9, ' (foi para a base)')).toBe('Contorno traçado: 11 vértices, 9 triângulos (foi para a base)');
  });

  it('apagar vértice e criar aresta falam também com a base aberta (antes: rodapé mudo)', () => {
    const ditos: string[] = [];
    const doc = { animation: null, notice: (t: string) => ditos.push(t) } as unknown as Parameters<typeof saidToBase>[0];
    saidToBase(doc, 'Vértice apagado');
    expect(ditos).toEqual(['Vértice apagado']);
  });

  it('a aba usa o padrão: campos, modos, dicas, a linha da lista, a trava e os rodapés', () => {
    const aba = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(aba).toContain('this.brushField(BRUSH_FIELDS.radius');
    expect(aba).toContain('this.brushField(BRUSH_FIELDS.strength');
    expect(aba).toContain('node.title = mode.tip;');
    expect(aba).toContain('MESH_BUTTON_TIPS.suavizar');
    expect(aba).toContain('MESH_BUTTON_TIPS.podar');
    expect(aba).toContain('MESH_BUTTON_TIPS.tirarPesos');
    expect(aba).toContain('boneListCaption(');
    expect(aba).toContain('lockTip(bone.name)');
    expect(aba).not.toContain("document.createTextNode('Travar')");
    expect(aba).toContain('attachmentKindLine(');
    expect(aba).not.toContain('Este anexo é do tipo');
    expect(aba).toContain('doc.notice(shapeDoneNotice(');
    expect(aba).toContain('doc.notice(linkedMeshLine(result));');
    const docMalha = readFileSync(resolve(__dirname, '../src/mesh/mesh-doc.ts'), 'utf8');
    expect(docMalha).toContain('com peso 100% em todos os pontos');
    expect(docMalha).toContain('com peso 0%');
  });
});

describe('rodada 41, lote 2: o peso de um vértice se lê e se escreve', () => {
  const tabela = (...linhas: Array<Record<number, number>>): WeightTable =>
    linhas.map((l) => new Map(Object.entries(l).map(([k, v]) => [Number(k), v])));

  it('weightAt: o peso do vértice escolhido; vários que discordam dizem "misturado"', () => {
    const t = tabela({ 0: 0.1, 1: 0.9 }, { 0: 0.5, 1: 0.5 });
    expect(weightAt(t, [0], 0)).toEqual({ value: 0.1, mixed: false });
    const dois = weightAt(t, [0, 1], 0);
    expect(dois.value).toBeCloseTo(0.3);
    expect(dois.mixed).toBe(true);
    expect(weightAt(t, [], 0)).toEqual({ value: 0, mixed: false });
  });

  it('setWeight: 40 % no cape1 de um vértice que tinha 10 % dá 40 / 60, e a soma fica 1', () => {
    const t = tabela({ 0: 0.1, 1: 0.9 }, { 0: 0.5, 1: 0.5 });
    const out = setWeight(t, [0], 0, 0.4);
    expect(out[0]!.get(0)).toBeCloseTo(0.4);
    expect(out[0]!.get(1)).toBeCloseTo(0.6);
    // O outro vértice não muda, e a tabela de entrada também não.
    expect(out[1]!.get(0)).toBeCloseTo(0.5);
    expect(t[0]!.get(0)).toBeCloseTo(0.1);
  });

  it('setWeight reparte o resto na proporção que os outros já tinham', () => {
    const out = setWeight(tabela({ 0: 0.2, 1: 0.4, 2: 0.4 }), [0], 0, 0.6);
    expect(out[0]!.get(1)).toBeCloseTo(0.2);
    expect(out[0]!.get(2)).toBeCloseTo(0.2);
  });

  it('setWeight respeita a trava: o travado não muda, e o valor não passa do que ele deixa', () => {
    const t = tabela({ 0: 0.1, 1: 0.9 });
    const out = setWeight(t, [0], 0, 0.5, new Set([1]));
    expect(out[0]!.get(1)).toBeCloseTo(0.9);
    expect(out[0]!.get(0)).toBeCloseTo(0.1);
    // O próprio osso travado não se escreve.
    expect(setWeight(t, [0], 1, 0.2, new Set([1]))[0]!.get(1)).toBeCloseTo(0.9);
  });

  it('setWeight com os outros em zero dá o resto, em partes iguais, aos outros ossos da lista', () => {
    const out = setWeight(tabela({ 0: 1, 1: 0, 2: 0 }), [0], 0, 0.4);
    expect(out[0]!.get(1)).toBeCloseTo(0.3);
    expect(out[0]!.get(2)).toBeCloseTo(0.3);
  });

  it('o pincel com vértices escolhidos pinta só neles (o Spine faz assim)', () => {
    const t = tabela({ 0: 0, 1: 1 }, { 0: 0, 1: 1 });
    const out = paintWeights(t, {
      mode: 'add', bone: 0, x: 0, y: 0, radius: 50, strength: 1, positions: [0, 0, 1, 0], only: new Set([1]),
    });
    expect(out[0]!.get(0) ?? 0).toBe(0);
    expect(out[1]!.get(0) ?? 0).toBeGreaterThan(0);
  });

  it('verticesInBox: a caixa escolhe os vértices dentro, de qualquer canto para qualquer canto', () => {
    const mundo = [0, 0, 10, 10, 20, 20];
    expect(verticesInBox(mundo, { x0: 5, y0: 5, x1: 25, y1: 25 })).toEqual([1, 2]);
    expect(verticesInBox(mundo, { x0: 25, y0: 25, x1: 5, y1: 5 })).toEqual([1, 2]);
    expect(verticesInBox(mundo, { x0: 30, y0: 30, x1: 40, y1: 40 })).toEqual([]);
  });

  it('a aba e as ferramentas ligam: número do vértice, campo exato, caixa, Shift no pincel, pizza maior', () => {
    const aba = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(aba).toContain('weightAt(table, escolhidos, index)');
    expect(aba).toContain('setWeight(table, escolhidos, index,');
    expect(aba).toContain("'Peso exato'");
    expect(aba).toContain('boneListCaption(escolhidos.length)');
    expect(aba).toContain('vertices: current.vertices.slice()');
    const pesos = readFileSync(resolve(__dirname, '../src/viewport/tools/weights-tool.ts'), 'utf8');
    expect(pesos).toContain('only: stroke.only');
    expect(pesos).toContain('PIE_SELECTED_PIXELS');
    expect(pesos).toContain('if (e.shift)');
    const malha = readFileSync(resolve(__dirname, '../src/viewport/tools/mesh-tool.ts'), 'utf8');
    expect(malha).toContain('verticesInBox(');
  });
});

describe('rodada 41, lote 2: as notas da conferência da v31.6 (doc 46)', () => {
  it('as dicas da aba são frases inteiras, e valem na barra e na caixa do Pincel', () => {
    const aba = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(aba).toContain('pick.title = `Pintar ${bone.name}: ');
    expect(aba).toContain('tirar.title = `Tirar ${bone.name} da malha: ');
    expect(aba).not.toContain("'Escolha dois vértices' :");
    expect(aba).toContain('node.title = field.tip;');
    expect(aba).toContain("titulo.title = 'Pincel: ");
    expect(aba).toContain("select.title = 'Malha de origem: ");
    expect(BRUSH_FIELDS.radius.tip).toContain('de 1 a 400 px');
  });

  it('o Delete da Malha sem vértice escolhido avisa, e não apaga o desenho', () => {
    const malha = readFileSync(resolve(__dirname, '../src/viewport/tools/mesh-tool.ts'), 'utf8');
    expect(malha).toContain('doc.notice(NO_VERTEX_TO_DELETE_NOTICE);');
    expect(NO_VERTEX_TO_DELETE_NOTICE).toContain('Editar → Apagar');
  });
});

describe('rodada 41, lote 3: o pincel se vê e fala', () => {
  it('o rodapé da pincelada diz o osso, onde e se foi para a base', () => {
    expect(brushStrokeNotice('cape1', 7)).toBe('Peso de cape1 pintado em 7 vértices');
    expect(brushStrokeNotice('cape1', 1, ' (foi para a base)')).toBe('Peso de cape1 pintado em 1 vértice (foi para a base)');
    expect(brushStrokeNotice('cape1', 0)).toContain('não mudou nenhum vértice');
    const antes = [new Map([[0, 0.5], [1, 0.5]]), new Map([[0, 1]])];
    const depois = [new Map([[0, 0.7], [1, 0.3]]), new Map([[0, 1]])];
    expect(changedVertices(antes, depois)).toBe(1);
  });

  it('o pincel sem osso escolhido diz como escolher (regra 21)', () => {
    expect(BRUSH_NO_BONE_NOTICE).toContain('Escolha o osso que vai pintar');
    const pesos = readFileSync(resolve(__dirname, '../src/viewport/tools/weights-tool.ts'), 'utf8');
    expect(pesos).toContain('doc.notice(BRUSH_NO_BONE_NOTICE);');
  });

  it('o círculo segue o ponteiro parado, e o osso pintado se desenha por cima da malha', () => {
    const pesos = readFileSync(resolve(__dirname, '../src/viewport/tools/weights-tool.ts'), 'utf8');
    expect(pesos).toContain('onHover(_doc: EditorDoc, e: ToolEvent): void {');
    expect(pesos).toContain('boneSegment(frame)');
    expect(pesos).toContain('brushStrokeNotice(quem,');
    const cena = readFileSync(resolve(__dirname, '../src/viewport/viewport.ts'), 'utf8');
    expect(cena).toContain('Rodada 41, lote 3 (licença do Diretor');
  });

  it('onHover move o centro do círculo sem pintar nada', () => {
    const ditos: string[] = [];
    const doc = { notice: (t: string) => ditos.push(t) } as unknown as Parameters<NonNullable<typeof weightsTool.onHover>>[0];
    const evento = { x: 12, y: 34, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: -1, scale: 1 };
    weightsTool.onHover!(doc, evento);
    expect(ditos).toEqual([]);
    expect((weightsTool as unknown as { cursorX: number; cursorY: number }).cursorX).toBe(12);
    expect((weightsTool as unknown as { cursorX: number; cursorY: number }).cursorY).toBe(34);
  });
});

describe('rodada 41, lote 4: a aba cabe, o segundo osso ganha peso, a aresta tem porta', () => {
  const tabela = (...linhas: Array<Record<number, number>>) =>
    linhas.map((l) => new Map(Object.entries(l).map(([k, v]) => [Number(k), v])));

  it('fechar o Ligar com dois ossos e um sem peso pede Pesos automáticos (S1, como o Spine)', () => {
    expect(shouldAutoWeightAfterBind(tabela({ 0: 1, 1: 0 }, { 0: 1, 1: 0 }))).toBe(true);
    expect(shouldAutoWeightAfterBind(tabela({ 0: 0.6, 1: 0.4 }, { 0: 1, 1: 0 }))).toBe(false);
    expect(shouldAutoWeightAfterBind(tabela({ 0: 1 }, { 0: 1 }))).toBe(false);
    expect(bindClosedNotice(2, 35)).toContain('Os 2 ossos ligados repartiram o peso sozinhos');
  });

  it('o aviso da animação aberta cabe numa linha; a frase inteira vai na dica', () => {
    expect(MESH_REST_POSE_SHORT.length).toBeLessThan(50);
    expect(MESH_REST_POSE_SHORT).toContain('base');
    const aba = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(aba).toContain('recado.title = MESH_REST_POSE_NOTICE;');
    expect(aba).not.toContain("body.append(el('p', 'malha-recado', MESH_REST_POSE_NOTICE));");
    expect(aba).toContain('tituloPesos.title = WEIGHTS_TEST_HINT;');
    expect(aba).not.toContain("section.append(el('p', 'malha-dica', WEIGHTS_TEST_HINT));");
    // Rodada 47, lote 3 (reescrito de propósito): a unidade saiu do rótulo (R2 do doc 68).
    expect(aba).toContain("nome: 'Afastamento', unidade: 'px'");
    expect(aba).toContain('if (!open) this.afterBindClosed();');
    // A frase do S1 não pode ser apagada pelo "Modo de ligar ossos fechado".
    expect(aba).toContain('else if (!this.repartiu)');
  });

  it('Criar ou apagar aresta ganhou porta no menu, cinza dizendo por quê sem dois vértices', () => {
    const menus = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');
    expect(menus).toContain("action: 'criar-aresta'");
    const aba = readFileSync(resolve(__dirname, '../src/panels/mesh-panel.ts'), 'utf8');
    expect(aba).toContain("'criar-aresta'");
    expect(aba).toContain("return doc.selection.vertices.length === 2 ? null : MESH_WHY.dois;");
  });
});

describe('rodada 41, lote 4: as notas da conferência da v32.2 (doc 53)', () => {
  it('[ e ] mudam o Raio com a ferramenta Pesos na mão, e o rodapé diz o número', () => {
    forgetRadiusChoice();
    setBrush({ radius: 40 });
    const ditos: string[] = [];
    const doc = { notice: (t: string) => ditos.push(t), selection: emptySelection() } as unknown as Parameters<NonNullable<typeof weightsTool.onKey>>[0];
    expect(weightsTool.onKey!(doc, ']')).toBe(true);
    expect(getBrush().radius).toBe(50);
    expect(weightsTool.onKey!(doc, '[')).toBe(true);
    expect(getBrush().radius).toBe(40);
    expect(ditos[0]).toContain('Raio do pincel: 50 px');
    expect(BRUSH_FIELDS.radius.tip).toContain('[ e ]');
  });

  it('a tabela de teclas tem [ e ] na cena, para o Raio do pincel', () => {
    const teclas = readFileSync(resolve(__dirname, '../src/ui/keys.ts'), 'utf8');
    expect(teclas).toContain("action: 'local:raio-menor'");
    expect(teclas).toContain("action: 'local:raio-maior'");
  });

  it('mudar o Raio redesenha a cena na hora (o círculo velho ficava até o mouse voltar)', () => {
    const cena = readFileSync(resolve(__dirname, '../src/viewport/viewport.ts'), 'utf8');
    expect(cena).toContain('onBrushChange(() => { this.needsDraw = true; })');
  });

  it('o osso do pincel é lembrado por malha: reescolher o desenho não o perde', () => {
    const pesos = readFileSync(resolve(__dirname, '../src/viewport/tools/weights-tool.ts'), 'utf8');
    expect(pesos).toContain('lembrado.get(');
    expect(pesos).toContain('lembrado.set(');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 3 (doc 68, R7): o número da casa fora da ficha
// ---------------------------------------------------------------------------
const fonteR47 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');
/** Quantas caixas de número cruas (`type = 'number'`) o arquivo ainda tem. */
const cruasR47 = (texto: string): number => (texto.match(/\.type = 'number'|type: 'number'|type="number"/g) ?? []).length;

describe('rodada 47, lote 3: a Malha usa o número da casa', () => {
  it('Afastamento, Raio, Força e Peso exato são o número da casa; nenhuma caixa crua', () => {
    const malha = fonteR47('panels/mesh-panel.ts');
    expect((malha.match(/campoNumero\(\{/g) ?? []).length).toBe(3);
    expect(cruasR47(malha)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 5 (doc 68, opção A; notas do doc 85)
// ---------------------------------------------------------------------------
const fonteR47L5 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 5: a Malha abre a seção da ferramenta (R11, opção A)', () => {
  it('com a Malha na mão, a Forma; com os Pesos, Ossos e Pesos; a mão vence', async () => {
    const { meshFoldsOpen } = await import('../src/panels/mesh-panel-model.js');
    expect(meshFoldsOpen('mesh')).toEqual({ forma: true, ossos: false, pesos: false });
    expect(meshFoldsOpen('weights')).toEqual({ forma: false, ossos: true, pesos: true });
    expect(meshFoldsOpen('select')).toEqual({ forma: true, ossos: false, pesos: false });
    expect(meshFoldsOpen('mesh', { ossos: true })).toEqual({ forma: true, ossos: true, pesos: false });
    // Com o modo Ligar aberto, os Ossos ficam à vista, mesmo que a mão os tenha dobrado.
    expect(meshFoldsOpen('transform', { ossos: false }, true).ossos).toBe(true);
  });

  it('a aba dobra as três, e o título é o botão', () => {
    const aba = fonteR47L5('panels/mesh-panel.ts');
    expect(aba).toContain('const abertas = meshFoldsOpen(ferramentaAgora, this.dobrasDaMao, bindModeOpen());');
    expect(aba).toContain("titulo.setAttribute('role', 'button');");
  });

  it('o aviso azul cabe sem "…" (R9): a frase curta à vista, a inteira na dica', async () => {
    const { MESH_REST_POSE_SHORT } = await import('../src/panels/mesh-panel-model.js');
    const { MESH_REST_POSE_NOTICE } = await import('../src/mesh/mesh-doc.js');
    expect(MESH_REST_POSE_SHORT.length).toBeLessThanOrEqual(30);
    expect(MESH_REST_POSE_SHORT).toContain('base');
    expect(MESH_REST_POSE_NOTICE.length).toBeGreaterThan(MESH_REST_POSE_SHORT.length);
  });
});
