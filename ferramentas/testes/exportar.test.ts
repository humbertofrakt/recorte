/**
 * Exportação para glTF 2.0 (requisito E6).
 *
 * O que se prova aqui:
 *   1. O que sai é glTF válido pela letra do Khronos: `asset.version`, todo
 *      accessor com `min` e `max`, todo bufferView dentro do buffer, o
 *      `byteLength` do buffer igual aos bytes de verdade, o `skin` com
 *      `joints` e `inverseBindMatrices`.
 *   2. Ida e volta da matriz de bind: `inverseBindMatrix x mundoDoSetup = I`.
 *   3. O skinning do glTF, feito à mão aqui, devolve os mesmos vértices que o
 *      `computeWorldVertices` de §7.4 — na pose de setup e animando.
 *   4. As curvas viram STEP, LINEAR ou CUBICSPLINE, e a CUBICSPLINE reproduz
 *      a Bezier de §9.3 quando os controles estão em 1/3 e 2/3.
 *   5. O `.glb` tem o cabeçalho e os dois pedaços que a spec manda.
 *   6. A linha de comando grava os arquivos e escreve o resumo em português.
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  loadAtlas, loadSkeletonData, parseBoneText, pose, sampleCurve, Skeleton,
  RegionAttachment, MeshAttachment,
  type AtlasData, type SkeletonData,
} from '../../runtime/src/index.js';
import {
  exportGltf, gltfToGlb, gltfJsonText, quaternionZ, boneMatrix4, inverseBindMatrix4, imageMimeType,
} from '../src/exportar/gltf.js';

const EXAMPLES = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';
const RAIZ = 'C:/Users/F-rak/Desktop/animador';

function readAtlas(): AtlasData {
  return loadAtlas(JSON.parse(readFileSync(EXAMPLES + 'heroi.atlas.json', 'utf8')));
}

function readHeroi(): SkeletonData {
  return loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), { atlases: [readAtlas()] });
}

// ---------------------------------------------------------------------------
// Reading the glTF back
// ---------------------------------------------------------------------------

type Gltf = Record<string, any>;

/** Numbers of one accessor, read out of the binary buffer. */
function accessorValues(gltf: Gltf, bin: Uint8Array, index: number): number[] {
  const accessor = gltf.accessors[index];
  const view = gltf.bufferViews[accessor.bufferView];
  const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 }[accessor.type as string]!;
  const count = accessor.count * size;
  const at = (view.byteOffset ?? 0) + (accessor.byteOffset ?? 0);
  const buffer = bin.buffer.slice(bin.byteOffset + at, bin.byteOffset + at + count * bytesPer(accessor.componentType));
  const typed = accessor.componentType === 5126 ? new Float32Array(buffer)
    : accessor.componentType === 5123 ? new Uint16Array(buffer) : new Uint32Array(buffer);
  return Array.from(typed);
}

function bytesPer(componentType: number): number {
  return componentType === 5126 || componentType === 5125 ? 4 : 2;
}

/** `a x b`, both column-major 4x4. */
function multiply4(a: readonly number[], b: readonly number[]): number[] {
  const out = new Array<number>(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

const IDENTITY4 = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

/** `T x R x S` of one glTF node, column-major, as the glTF spec defines it. */
function nodeMatrix(node: Record<string, any>): number[] {
  const t = node.translation ?? [0, 0, 0];
  const q = node.rotation ?? [0, 0, 0, 1];
  const s = node.scale ?? [1, 1, 1];
  const [x, y, z, w] = q;
  const r = [
    1 - 2 * (y * y + z * z), 2 * (x * y + z * w), 2 * (x * z - y * w), 0,
    2 * (x * y - z * w), 1 - 2 * (x * x + z * z), 2 * (y * z + x * w), 0,
    2 * (x * z + y * w), 2 * (y * z - x * w), 1 - 2 * (x * x + y * y), 0,
    0, 0, 0, 1,
  ];
  const rs = [
    r[0] * s[0], r[1] * s[0], r[2] * s[0], 0,
    r[4] * s[1], r[5] * s[1], r[6] * s[1], 0,
    r[8] * s[2], r[9] * s[2], r[10] * s[2], 0,
    t[0], t[1], t[2], 1,
  ];
  return rs;
}

/** Global matrix of every node, walking the scene the way a viewer does. */
function globalMatrices(gltf: Gltf, overrides: Map<number, Record<string, any>> = new Map()): number[][] {
  const out = new Array<number[]>(gltf.nodes.length).fill(IDENTITY4);
  const walk = (index: number, parent: readonly number[]): void => {
    const node = { ...gltf.nodes[index], ...(overrides.get(index) ?? {}) };
    const world = multiply4(parent, nodeMatrix(node));
    out[index] = world;
    for (const child of gltf.nodes[index].children ?? []) walk(child, world);
  };
  for (const root of gltf.scenes[gltf.scene].nodes) walk(root, IDENTITY4);
  return out;
}

/** Spherical interpolation of two quaternions — what glTF `LINEAR` means for a rotation. */
function slerp(a: readonly number[], b: readonly number[], t: number): number[] {
  let dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3];
  let end = [...b];
  if (dot < 0) {
    end = end.map((v) => -v);
    dot = -dot;
  }
  if (dot > 0.9995) {
    const out = a.map((v, i) => v + (end[i] - v) * t);
    const n = Math.hypot(...out);
    return out.map((v) => v / n);
  }
  const theta = Math.acos(dot);
  const s0 = Math.sin((1 - t) * theta) / Math.sin(theta);
  const s1 = Math.sin(t * theta) / Math.sin(theta);
  return a.map((v, i) => v * s0 + end[i] * s1);
}

/** `m x [x, y, 0, 1]`, giving back the two coordinates that matter. */
function apply(m: readonly number[], x: number, y: number): [number, number] {
  return [m[0] * x + m[4] * y + m[12], m[1] * x + m[5] * y + m[13]];
}

/** glTF skinning of one vertex: `sum w_k x global_k x IBM_k x P`. */
function skinVertex(
  globals: readonly number[][], ibm: readonly number[], joints: readonly number[], weights: readonly number[],
  v: number, px: number, py: number,
): [number, number] {
  let x = 0;
  let y = 0;
  for (let k = 0; k < 4; k++) {
    const w = weights[v * 4 + k];
    if (w === 0) continue;
    const joint = joints[v * 4 + k];
    const matrix = multiply4(globals[joint], ibm.slice(joint * 16, joint * 16 + 16));
    const [ax, ay] = apply(matrix, px, py);
    x += ax * w;
    y += ay * w;
  }
  return [x, y];
}

// ---------------------------------------------------------------------------

describe('glTF: a estrutura que a spec do Khronos exige', () => {
  const result = exportGltf(readHeroi(), { images: [{ page: 'heroi', bytes: new Uint8Array(readFileSync(EXAMPLES + 'heroi.png')) }] });
  const gltf = result.json as Gltf;

  it('tem asset 2.0, uma cena e um nó raiz', () => {
    expect(gltf.asset.version).toBe('2.0');
    expect(typeof gltf.asset.generator).toBe('string');
    expect(gltf.scene).toBe(0);
    expect(gltf.scenes[0].nodes.length).toBe(1);
    expect(gltf.scenes[0].nodes[0]).toBeLessThan(gltf.nodes.length);
  });

  it('o buffer declara exatamente os bytes que existem', () => {
    expect(gltf.buffers.length).toBe(1);
    expect(gltf.buffers[0].byteLength).toBe(result.bin.length);
    expect(result.bin.length % 4).toBe(0);
  });

  it('todo bufferView cabe dentro do buffer e começa alinhado em 4', () => {
    for (const view of gltf.bufferViews) {
      expect(view.buffer).toBe(0);
      expect(view.byteOffset % 4).toBe(0);
      expect(view.byteOffset + view.byteLength).toBeLessThanOrEqual(result.bin.length);
    }
  });

  it('todo accessor tem min e max com o número certo de componentes', () => {
    const size: Record<string, number> = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
    for (const accessor of gltf.accessors) {
      expect(accessor.min).toBeDefined();
      expect(accessor.max).toBeDefined();
      expect(accessor.min.length).toBe(size[accessor.type]);
      expect(accessor.max.length).toBe(size[accessor.type]);
      for (const v of [...accessor.min, ...accessor.max]) expect(Number.isFinite(v)).toBe(true);
      const view = gltf.bufferViews[accessor.bufferView];
      expect(accessor.count * size[accessor.type] * bytesPer(accessor.componentType))
        .toBeLessThanOrEqual(view.byteLength);
    }
  });

  it('o skin tem um joint por osso e uma matriz de bind por joint', () => {
    const data = readHeroi();
    expect(gltf.skins.length).toBe(1);
    expect(gltf.skins[0].joints).toEqual(data.bones.map((b) => b.index));
    const ibm = gltf.accessors[gltf.skins[0].inverseBindMatrices];
    expect(ibm.type).toBe('MAT4');
    expect(ibm.count).toBe(data.bones.length);
    expect(gltf.skins[0].skeleton).toBe(0);
  });

  it('cada primitivo tem POSITION, TEXCOORD_0, JOINTS_0, WEIGHTS_0 e índices', () => {
    expect(gltf.meshes.length).toBeGreaterThan(0);
    for (const mesh of gltf.meshes) {
      for (const primitive of mesh.primitives) {
        for (const name of ['POSITION', 'TEXCOORD_0', 'JOINTS_0', 'WEIGHTS_0']) {
          expect(primitive.attributes[name]).toBeTypeOf('number');
        }
        expect(primitive.indices).toBeTypeOf('number');
        expect(primitive.mode).toBe(4);
        const position = gltf.accessors[primitive.attributes.POSITION];
        expect(position.type).toBe('VEC3');
        expect(gltf.accessors[primitive.attributes.JOINTS_0].componentType).toBe(5123);
        expect(gltf.accessors[primitive.attributes.TEXCOORD_0].count).toBe(position.count);
        // Todo índice aponta para um vértice que existe.
        const indices = accessorValues(gltf, result.bin, primitive.indices);
        expect(indices.length % 3).toBe(0);
        for (const i of indices) expect(i).toBeLessThan(position.count);
        expect(primitive.material).toBeLessThan(gltf.materials.length);
      }
    }
  });

  it('a hierarquia dos nós é a dos ossos, e cada osso aparece uma vez só', () => {
    const data = readHeroi();
    const seen = new Set<number>();
    for (const bone of data.bones) {
      expect(gltf.nodes[bone.index].name).toBe(bone.name);
      for (const child of gltf.nodes[bone.index].children ?? []) {
        expect(seen.has(child)).toBe(false);
        seen.add(child);
      }
    }
    for (const bone of data.bones) {
      if (bone.parent === null) continue;
      expect(gltf.nodes[bone.parent.index].children).toContain(bone.index);
    }
  });

  it('a imagem do atlas entra pelo bufferView, com o mime certo', () => {
    expect(gltf.images.length).toBe(1);
    expect(gltf.images[0].mimeType).toBe('image/png');
    expect(gltf.textures[0].source).toBe(0);
    expect(gltf.samplers.length).toBe(1);
    const view = gltf.bufferViews[gltf.images[0].bufferView];
    const png = result.bin.subarray(view.byteOffset, view.byteOffset + 8);
    expect(Array.from(png)).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  });

  it('os UVs saem já mapeados para a página, dentro de [0, 1]', () => {
    for (const mesh of gltf.meshes) {
      const uvs = accessorValues(gltf, result.bin, mesh.primitives[0].attributes.TEXCOORD_0);
      for (const uv of uvs) {
        expect(uv).toBeGreaterThanOrEqual(-1e-6);
        expect(uv).toBeLessThanOrEqual(1 + 1e-6);
      }
    }
  });

  it('lista as perdas conhecidas, em português', () => {
    const texto = result.warnings.join('\n');
    expect(texto).toContain('esqueleto aninhado');
    expect(texto).toContain('cisalhamento');
    expect(texto).toContain('constraints');
    expect(result.json.extras).toMatchObject({ formato: 'bone' });
  });
});

describe('glTF: ida e volta da matriz de bind', () => {
  it('inverseBindMatrix x mundoDoSetup dá a identidade', () => {
    const data = readHeroi();
    const skeleton = new Skeleton(data);
    skeleton.updateWorldTransform(0);
    for (const bone of skeleton.bones) {
      const product = multiply4(inverseBindMatrix4(bone), boneMatrix4(bone));
      for (let i = 0; i < 16; i++) expect(product[i]).toBeCloseTo(IDENTITY4[i], 9);
    }
  });

  it('uma matriz sem inversa vira a identidade, e não NaN', () => {
    const flat = inverseBindMatrix4({ a: 0, b: 0, c: 0, d: 0, worldX: 5, worldY: 7 });
    expect(flat).toEqual(IDENTITY4);
  });

  it('a matriz de bind escrita no arquivo é a inversa do mundo do setup', () => {
    const data = readHeroi();
    const result = exportGltf(data);
    const gltf = result.json as Gltf;
    const ibm = accessorValues(gltf, result.bin, gltf.skins[0].inverseBindMatrices);
    // A pose de bind é a de setup CRUA: glTF não tem constraints, então o
    // exportador desliga todas antes de ler o mundo.
    const skeleton = new Skeleton(data);
    for (const constraint of skeleton.constraints) constraint.active = false;
    skeleton.setToSetupPose();
    skeleton.updateWorldTransform(0);
    for (const bone of skeleton.bones) {
      const esperado = inverseBindMatrix4(bone);
      for (let i = 0; i < 16; i++) expect(ibm[bone.data.index * 16 + i]).toBeCloseTo(esperado[i], 4);
    }
  });

  it('quaternionZ e boneMatrix4 concordam com a rotação em graus', () => {
    const [x, y, z, w] = quaternionZ(90);
    expect(x).toBe(0);
    expect(y).toBe(0);
    expect(z).toBeCloseTo(Math.SQRT1_2, 12);
    expect(w).toBeCloseTo(Math.SQRT1_2, 12);
    expect(imageMimeType(new Uint8Array([0xff, 0xd8, 0xff]))).toBe('image/jpeg');
  });
});

describe('glTF: o skinning devolve os mesmos vértices de §7.4', () => {
  it('na pose de setup, cada vértice cai onde o runtime põe', () => {
    const data = readHeroi();
    const result = exportGltf(data);
    const gltf = result.json as Gltf;
    const globals = globalMatrices(gltf);
    const ibm = accessorValues(gltf, result.bin, gltf.skins[0].inverseBindMatrices);

    let checked = 0;
    for (const mesh of gltf.meshes) {
      const primitive = mesh.primitives[0];
      const positions = accessorValues(gltf, result.bin, primitive.attributes.POSITION);
      const joints = accessorValues(gltf, result.bin, primitive.attributes.JOINTS_0);
      const weights = accessorValues(gltf, result.bin, primitive.attributes.WEIGHTS_0);
      for (let v = 0; v < positions.length / 3; v++) {
        const [x, y] = skinVertex(globals, ibm, joints, weights, v, positions[v * 3], positions[v * 3 + 1]);
        expect(x).toBeCloseTo(positions[v * 3], 2);
        expect(y).toBeCloseTo(positions[v * 3 + 1], 2);
        checked++;
      }
    }
    expect(checked).toBeGreaterThan(20);
  });

  it('com a animação aplicada nos nós, bate com pose() do runtime', () => {
    // Esqueleto sem constraints: glTF não tem constraints, então a comparação
    // só faz sentido onde o runtime também não usa nenhuma.
    const data = loadSkeletonData(parseBoneText(JSON.stringify({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { fps: 30 },
      bones: [
        { name: 'root' },
        { name: 'braco', parent: 'root', x: 10, y: 0, rotation: 20, length: 40 },
      ],
      slots: [{ name: 'mao', bone: 'braco', attachment: 'mao' }],
      skins: [{
        name: 'default',
        attachments: { mao: { mao: { type: 'region', path: 'mao', x: 20, y: 0, width: 30, height: 20 } } },
      }],
      animations: [{
        name: 'girar',
        duration: 1,
        timelines: [
          { type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 20 }, { time: 1, value: 90 }] },
          { type: 'bone', target: 'braco', property: 'x', keys: [{ time: 0, value: 10 }, { time: 1, value: 40 }] },
          { type: 'bone', target: 'braco', property: 'scaleX', keys: [{ time: 0, value: 1 }, { time: 1, value: 2 }] },
        ],
      }],
    })));

    const result = exportGltf(data);
    const gltf = result.json as Gltf;
    const ibm = accessorValues(gltf, result.bin, gltf.skins[0].inverseBindMatrices);
    const animation = gltf.animations[0];

    const t = 0.4;
    // Amostra os samplers do glTF como um visualizador faria (LINEAR).
    const overrides = new Map<number, Record<string, any>>();
    for (const channel of animation.channels) {
      const sampler = animation.samplers[channel.sampler];
      expect(sampler.interpolation).toBe('LINEAR');
      const times = accessorValues(gltf, result.bin, sampler.input);
      const values = accessorValues(gltf, result.bin, sampler.output);
      const size = values.length / times.length;
      let i = 0;
      while (i + 1 < times.length && times[i + 1] <= t) i++;
      const t0 = times[i];
      const t1 = times[Math.min(i + 1, times.length - 1)];
      const alpha = t1 === t0 ? 0 : (t - t0) / (t1 - t0);
      const next = Math.min(i + 1, times.length - 1);
      const from = values.slice(i * size, i * size + size);
      const to = values.slice(next * size, next * size + size);
      // Uma rotação em glTF é um quaternion: LINEAR quer dizer esférica.
      const out = channel.target.path === 'rotation'
        ? slerp(from, to, alpha)
        : from.map((a, j) => a + (to[j] - a) * alpha);
      const node = overrides.get(channel.target.node) ?? {};
      node[channel.target.path] = out;
      overrides.set(channel.target.node, node);
    }

    const globals = globalMatrices(gltf, overrides);
    const positions = accessorValues(gltf, result.bin, gltf.meshes[0].primitives[0].attributes.POSITION);
    const joints = accessorValues(gltf, result.bin, gltf.meshes[0].primitives[0].attributes.JOINTS_0);
    const weights = accessorValues(gltf, result.bin, gltf.meshes[0].primitives[0].attributes.WEIGHTS_0);

    const skeleton = new Skeleton(data);
    pose(skeleton, data.findAnimation('girar')!, t, t);
    const slot = skeleton.findSlot('mao')!;
    const attachment = slot.attachment as RegionAttachment;
    const world = new Float64Array(8);
    attachment.computeWorldVertices(slot, world, 0, 2);

    for (let v = 0; v < 4; v++) {
      const [x, y] = skinVertex(globals, ibm, joints, weights, v, positions[v * 3], positions[v * 3 + 1]);
      expect(x).toBeCloseTo(world[v * 2], 3);
      expect(y).toBeCloseTo(world[v * 2 + 1], 3);
    }
  });
});

describe('glTF: as curvas de §9.3', () => {
  /** A skeleton with one bone and one `x` timeline built from `keys`. */
  function comCurva(keys: unknown[]): SkeletonData {
    return loadSkeletonData(parseBoneText(JSON.stringify({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { fps: 20 },
      bones: [{ name: 'root' }, { name: 'osso', parent: 'root' }],
      slots: [],
      skins: [{ name: 'default', attachments: {} }],
      animations: [{ name: 'a', duration: 1, timelines: [{ type: 'bone', target: 'osso', property: 'x', keys }] }],
    })));
  }

  function sampler(data: SkeletonData): { gltf: Gltf; bin: Uint8Array; sampler: Record<string, any> } {
    const result = exportGltf(data);
    const gltf = result.json as Gltf;
    return { gltf, bin: result.bin, sampler: gltf.animations[0].samplers[0] };
  }

  it('curva "stepped" vira STEP e guarda só as chaves', () => {
    const { sampler: s, gltf, bin } = sampler(comCurva([
      { time: 0, value: 0, curve: 'stepped' }, { time: 1, value: 10 },
    ]));
    expect(s.interpolation).toBe('STEP');
    expect(accessorValues(gltf, bin, s.input)).toEqual([0, 1]);
  });

  it('curva linear vira LINEAR e guarda só as chaves', () => {
    const { sampler: s, gltf, bin } = sampler(comCurva([{ time: 0, value: 0 }, { time: 1, value: 10 }]));
    expect(s.interpolation).toBe('LINEAR');
    expect(accessorValues(gltf, bin, s.input)).toEqual([0, 1]);
    expect(accessorValues(gltf, bin, s.output)).toEqual([0, 0, 0, 10, 0, 0]);
  });

  it('Bezier com controles em 1/3 e 2/3 vira CUBICSPLINE exata', () => {
    const data = comCurva([
      { time: 0, value: 0, curve: [1 / 3, 4, 2 / 3, 9] },
      { time: 1, value: 10 },
    ]);
    const { sampler: s, gltf, bin } = sampler(data);
    expect(s.interpolation).toBe('CUBICSPLINE');
    const times = accessorValues(gltf, bin, s.input);
    const values = accessorValues(gltf, bin, s.output);
    expect(times).toEqual([0, 1]);
    // Por chave: entrada (3), valor (3), saída (3).
    expect(values.length).toBe(times.length * 9);
    const v0 = values[3];
    const out0 = values[6];
    const in1 = values[9];
    const v1 = values[12];
    expect(v0).toBeCloseTo(0, 6);
    expect(v1).toBeCloseTo(10, 6);
    expect(out0).toBeCloseTo(3 * (4 - 0), 5);
    expect(in1).toBeCloseTo(3 * (10 - 9), 5);

    // O Hermite do glTF tem que dar o mesmo que sampleCurve de §9.3.
    const keys = (data.findAnimation('a')!.timelines[0] as any).keys;
    for (const t of [0.1, 0.25, 0.5, 0.8]) {
      const s2 = t * t;
      const s3 = s2 * t;
      const hermite = (2 * s3 - 3 * s2 + 1) * v0 + (s3 - 2 * s2 + t) * out0
        + (-2 * s3 + 3 * s2) * v1 + (s3 - s2) * in1;
      expect(hermite).toBeCloseTo(sampleCurve(keys.curves[0], 0, 0, 1, 0, 10, t), 6);
    }
  });

  it('Bezier fora de 1/3 e 2/3 é amostrada quadro a quadro', () => {
    const { sampler: s, gltf, bin } = sampler(comCurva([
      { time: 0, value: 0, curve: [0.1, 0, 0.9, 10] },
      { time: 1, value: 10 },
    ]));
    expect(s.interpolation).toBe('LINEAR');
    // 20 quadros por segundo em um segundo de animação.
    expect(accessorValues(gltf, bin, s.input).length).toBeGreaterThan(19);
  });

  it('uma volta de 180 graus ou mais é amostrada, para o quaternion não errar o lado', () => {
    const data = loadSkeletonData(parseBoneText(JSON.stringify({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { fps: 30 },
      bones: [{ name: 'root' }, { name: 'osso', parent: 'root' }],
      skins: [{ name: 'default', attachments: {} }],
      animations: [{
        name: 'volta', duration: 1,
        timelines: [{ type: 'bone', target: 'osso', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 350 }] }],
      }],
    })));
    const result = exportGltf(data);
    const gltf = result.json as Gltf;
    const s = gltf.animations[0].samplers[0];
    expect(s.interpolation).toBe('LINEAR');
    expect(accessorValues(gltf, result.bin, s.input).length).toBeGreaterThan(20);
  });

  it('só exporta as animações pedidas e avisa de nome que não existe', () => {
    const result = exportGltf(readHeroi(), { animations: ['walk', 'nao-existe'] });
    const gltf = result.json as Gltf;
    expect(gltf.animations.map((a: any) => a.name)).toEqual(['walk']);
    expect(result.warnings.join(' ')).toContain('"nao-existe"');
  });
});

describe('glTF: os dois arquivos de saída', () => {
  it('o .gltf aponta para o .bin pelo nome pedido', () => {
    const result = exportGltf(readHeroi());
    const texto = gltfJsonText(result, 'heroi.bin');
    const gltf = JSON.parse(texto) as Gltf;
    expect(gltf.buffers[0].uri).toBe('heroi.bin');
    expect(gltf.buffers[0].byteLength).toBe(result.bin.length);
  });

  it('o .glb tem cabeçalho, pedaço JSON e pedaço BIN, todos alinhados', () => {
    const result = exportGltf(readHeroi(), { images: [{ page: 'heroi', bytes: new Uint8Array(readFileSync(EXAMPLES + 'heroi.png')) }] });
    const glb = gltfToGlb(result);
    const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);

    expect(view.getUint32(0, true)).toBe(0x46546c67); // "glTF"
    expect(view.getUint32(4, true)).toBe(2);
    expect(view.getUint32(8, true)).toBe(glb.length);
    expect(glb.length % 4).toBe(0);

    const jsonLength = view.getUint32(12, true);
    expect(view.getUint32(16, true)).toBe(0x4e4f534a); // "JSON"
    expect(jsonLength % 4).toBe(0);
    const json = JSON.parse(new TextDecoder().decode(glb.subarray(20, 20 + jsonLength))) as Gltf;
    expect(json.asset.version).toBe('2.0');
    expect(json.buffers[0].uri).toBeUndefined();

    const at = 20 + jsonLength;
    const binLength = view.getUint32(at, true);
    expect(view.getUint32(at + 4, true)).toBe(0x004e4942); // "BIN\0"
    expect(binLength).toBe(result.bin.length);
    expect(at + 8 + binLength).toBe(glb.length);
  });

  it('sem as imagens o arquivo sai menor e o material fica sem textura', () => {
    const semImagem = exportGltf(readHeroi());
    const comImagem = exportGltf(readHeroi(), { images: [{ page: 'heroi', bytes: new Uint8Array(readFileSync(EXAMPLES + 'heroi.png')) }] });
    expect(semImagem.bin.length).toBeLessThan(comImagem.bin.length);
    expect((semImagem.json as Gltf).images).toBeUndefined();
    for (const material of (semImagem.json as Gltf).materials) {
      expect(material.pbrMetallicRoughness.baseColorTexture).toBeUndefined();
    }
    expect(semImagem.warnings.join(' ')).toContain('não foi passada');
  });
});

describe('glTF: as malhas com peso', () => {
  it('um mesh com pesos leva os ossos e os pesos escritos no arquivo', () => {
    const data = readHeroi();
    const result = exportGltf(data);
    const gltf = result.json as Gltf;
    const skeleton = new Skeleton(data);
    skeleton.updateWorldTransform(0);
    const slot = skeleton.findSlot('head')!;
    const attachment = slot.attachment;
    expect(attachment).toBeInstanceOf(MeshAttachment);
    const binding = (attachment as MeshAttachment).binding;
    expect(binding).not.toBeNull();

    const mesh = gltf.meshes.find((m: any) => m.name === 'head/face');
    expect(mesh).toBeDefined();
    const joints = accessorValues(gltf, result.bin, mesh.primitives[0].attributes.JOINTS_0);
    const weights = accessorValues(gltf, result.bin, mesh.primitives[0].attributes.WEIGHTS_0);
    // Primeiro vértice: mesmos ossos e mesmos pesos do binding de §7.4.
    const count = binding!.counts[0];
    for (let k = 0; k < count && k < 4; k++) {
      expect(joints[k]).toBe(binding!.bones[k]);
      expect(weights[k]).toBeCloseTo(binding!.weights[k], 6);
    }
  });
});

describe('linha de comando (exportar.mjs)', () => {
  it('grava o .glb e escreve o resumo em português', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'recorte-gltf-'));
    try {
      const saida = join(pasta, 'heroi.glb');
      const texto = execFileSync(process.execPath, [
        join(RAIZ, 'ferramentas', 'exportar.mjs'),
        join(RAIZ, 'formato', 'exemplos', 'heroi.bone'),
        saida,
      ], { encoding: 'utf8' });

      expect(existsSync(saida)).toBe(true);
      expect(texto).toContain('Exportado para glTF 2.0 (glb)');
      expect(texto).toContain('ossos (joints)');
      expect(texto).toContain('O que não coube no glTF');

      const glb = new Uint8Array(readFileSync(saida));
      const view = new DataView(glb.buffer, glb.byteOffset, glb.byteLength);
      expect(view.getUint32(0, true)).toBe(0x46546c67);
      expect(view.getUint32(8, true)).toBe(glb.length);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  }, 120_000);

  it('grava o .gltf com o .bin ao lado e aceita --animacoes', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'recorte-gltf-'));
    try {
      const saida = join(pasta, 'heroi.gltf');
      const texto = execFileSync(process.execPath, [
        join(RAIZ, 'ferramentas', 'exportar.mjs'),
        join(RAIZ, 'formato', 'exemplos', 'heroi.bone'),
        saida, '--formato', 'gltf', '--animacoes', 'walk',
      ], { encoding: 'utf8' });

      expect(texto).toContain('Exportado para glTF 2.0 (gltf)');
      const gltf = JSON.parse(readFileSync(saida, 'utf8')) as Gltf;
      expect(gltf.animations.map((a: any) => a.name)).toEqual(['walk']);
      const bin = readFileSync(join(pasta, 'heroi.bin'));
      expect(bin.length).toBe(gltf.buffers[0].byteLength);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  }, 120_000);
});
