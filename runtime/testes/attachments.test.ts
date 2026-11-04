import { readFileSync } from 'node:fs';
import { loadSkeletonData, loadAtlas } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { AtlasData, AtlasPageData, AtlasRegionData, MeshAttachment, RegionAttachment, LinkedMeshAttachment, BoundingBoxAttachment } from '../src/data.js';
import { BindingData } from '../src/attachments/vertex-attachment.js';
import { PointAttachment } from '../src/attachments/point.js';
import { SequenceData, formatNumber } from '../src/attachments/sequence.js';
import type { BoneDef } from '../src/types.js';

const EXAMPLES = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';

function skeletonFromBones(bones: BoneDef[], extra: Record<string, unknown> = {}): Skeleton {
  return new Skeleton(loadSkeletonData({
    bone: { version: '1.0', minVersion: '1.0', generator: 'test' },
    bones,
    slots: [{ name: 's', bone: bones[bones.length - 1].name }],
    ...extra,
  }));
}

function page(): AtlasPageData {
  return new AtlasPageData(0, 'p', 'p.png', 256, 256);
}

describe('atlas UV mapping (spec 10.4)', () => {
  it('maps a rotated region: the crop top-left lands on the page top-right', () => {
    const r = new AtlasRegionData(0, 'arm', page(), 1, { x: 0, y: 120, width: 60, height: 20, rotation: 90 });
    const tl = r.computeUV(0, 0);
    expect(tl[0]).toBeCloseTo(20 / 256, 12);
    expect(tl[1]).toBeCloseTo(120 / 256, 12);
    const br = r.computeUV(1, 1);
    expect(br[0]).toBeCloseTo(0, 12);
    expect(br[1]).toBeCloseTo(180 / 256, 12);
  });

  it('maps an unrotated region with offsets', () => {
    const r = new AtlasRegionData(0, 'armor', page(), 1, {
      x: 80, y: 0, width: 72, height: 110, offsetX: 4, offsetY: 6, originalWidth: 80, originalHeight: 120,
    });
    // Crop top-left in the original image: u = 4/80, v = (120 - 6 - 110)/120 = 4/120.
    const tl = r.computeUV(4 / 80, 4 / 120);
    expect(tl[0]).toBeCloseTo(80 / 256, 12);
    expect(tl[1]).toBeCloseTo(0, 12);
    // Crop bottom-right: u = 76/80, v = 114/120.
    const br = r.computeUV(76 / 80, 114 / 120);
    expect(br[0]).toBeCloseTo(152 / 256, 12);
    expect(br[1]).toBeCloseTo(110 / 256, 12);
  });
});

describe('region attachment (spec 7.3)', () => {
  it('computes the four corners without an atlas', () => {
    const att = new RegionAttachment('r', { width: 60, height: 20 });
    // BL, BR, TR, TL
    expect(Array.from(att.offsets)).toEqual([-30, -10, 30, -10, 30, 10, -30, 10]);
    expect(Array.from(att.uvs)).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);
  });

  it('applies the attachment transform T R S', () => {
    const att = new RegionAttachment('r', { width: 60, height: 20, x: 5, y: 7, rotation: 90, scaleX: 2, scaleY: 1 });
    // BL (-30,-10): scaled (-60,-10), rotated 90 -> (10,-60), translated -> (15,-53)
    expect(att.offsets[0]).toBeCloseTo(15, 9);
    expect(att.offsets[1]).toBeCloseTo(-53, 9);
    // TR (30,10): scaled (60,10), rotated -> (-10,60), translated -> (-5,67)
    expect(att.offsets[4]).toBeCloseTo(-5, 9);
    expect(att.offsets[5]).toBeCloseTo(67, 9);
  });

  it('uses an atlas region rotated 90: corners stay, UVs turn', () => {
    const region = new AtlasRegionData(0, 'arm', page(), 1, { x: 0, y: 120, width: 60, height: 20, rotation: 90 });
    const att = new RegionAttachment('arm', { width: 60, height: 20 });
    att.setRegion(region);
    expect(Array.from(att.offsets)).toEqual([-30, -10, 30, -10, 30, 10, -30, 10]);
    const uv = Array.from(att.uvs);
    // BL -> page (0, 120) ; BR -> (0, 180) ; TR -> (20, 180) ; TL -> (20, 120)
    expect(uv[0]).toBeCloseTo(0, 12); expect(uv[1]).toBeCloseTo(120 / 256, 12);
    expect(uv[2]).toBeCloseTo(0, 12); expect(uv[3]).toBeCloseTo(180 / 256, 12);
    expect(uv[4]).toBeCloseTo(20 / 256, 12); expect(uv[5]).toBeCloseTo(180 / 256, 12);
    expect(uv[6]).toBeCloseTo(20 / 256, 12); expect(uv[7]).toBeCloseTo(120 / 256, 12);
  });

  it('shrinks and shifts the corners by the atlas crop offsets', () => {
    const region = new AtlasRegionData(0, 'armor', page(), 1, {
      x: 80, y: 0, width: 72, height: 110, offsetX: 4, offsetY: 6, originalWidth: 80, originalHeight: 120,
    });
    const att = new RegionAttachment('armor', { width: 80, height: 120 });
    att.setRegion(region);
    // x0 = -40 + 4 = -36 ; x1 = -36 + 72 = 36 ; y0 = -60 + 6 = -54 ; y1 = -54 + 110 = 56
    expect(Array.from(att.offsets)).toEqual([-36, -54, 36, -54, 36, 56, -36, 56]);
    // UVs of the crop corners on the page: BL (80, 110), TL (80, 0), TR (152, 0)
    expect(att.uvs[0]).toBeCloseTo(80 / 256, 12); expect(att.uvs[1]).toBeCloseTo(110 / 256, 12);
    expect(att.uvs[6]).toBeCloseTo(80 / 256, 12); expect(att.uvs[7]).toBeCloseTo(0, 12);
    expect(att.uvs[4]).toBeCloseTo(152 / 256, 12);
  });

  it('takes the size from the atlas when width/height are 0 and honours atlas scale', () => {
    const region = new AtlasRegionData(0, 'r', page(), 2, { x: 0, y: 0, width: 60, height: 20 });
    const att = new RegionAttachment('r');
    att.setRegion(region);
    expect(att.effectiveWidth).toBe(30);
    expect(att.effectiveHeight).toBe(10);
    expect(Array.from(att.offsets)).toEqual([-15, -5, 15, -5, 15, 5, -15, 5]);
  });

  it('computes world vertices through the slot bone', () => {
    const sk = skeletonFromBones([{ name: 'root' }, { name: 'b', parent: 'root', x: 100, y: 50, rotation: 90 }]);
    const att = new RegionAttachment('r', { width: 60, height: 20 });
    const out = att.computeWorldVertices(sk.slots[0]) as Float64Array;
    // BL (-30,-10) rotated 90 -> (10,-30) + (100,50) = (110, 20)
    expect(out[0]).toBeCloseTo(110, 9);
    expect(out[1]).toBeCloseTo(20, 9);
    // TR (30,10) -> (-10,30) + (100,50) = (90, 80)
    expect(out[4]).toBeCloseTo(90, 9);
    expect(out[5]).toBeCloseTo(80, 9);
  });

  it('picks the sequence frame per slot without mutating the attachment (spec 7.10)', () => {
    const r0 = new AtlasRegionData(0, 'f0', page(), 1, { x: 0, y: 0, width: 10, height: 10 });
    // Frame 1 is a cropped image: offsets shift the corners, so corners depend on the frame too.
    const r1 = new AtlasRegionData(1, 'f1', page(), 1, { x: 50, y: 0, width: 8, height: 10, offsetX: 2, originalWidth: 10, originalHeight: 10 });
    const seq = new SequenceData(['f0', 'f1'], 1, 0, 0);
    seq.regions[0] = r0;
    seq.regions[1] = r1;
    const att = new RegionAttachment('r', { width: 10, height: 10, sequence: seq });
    att.setRegion(r0);
    const sk = skeletonFromBones([{ name: 'root' }]);
    const slot = sk.slots[0];
    // Two slots (two skeletons) share the attachment and show different frames.
    const other = skeletonFromBones([{ name: 'root' }]).slots[0];
    other.sequenceIndex = 1;

    expect(att.frameIndexFor(slot)).toBe(0);
    expect(att.uvsFor(slot)[6]).toBeCloseTo(0, 12);
    expect(att.offsetsFor(slot)[0]).toBe(-5);
    expect(att.frameIndexFor(other)).toBe(1);
    expect(att.regionFor(other)).toBe(r1);
    expect(att.uvsFor(other)[6]).toBeCloseTo(50 / 256, 12);
    expect(att.offsetsFor(other)[0]).toBeCloseTo(-3, 12); // x0 = -5 + offsetX 2

    const a = att.computeWorldVertices(other) as Float64Array;
    expect(a[0]).toBeCloseTo(-3, 12);
    // Reading the other frame did not touch the setup state nor the first slot.
    expect(att.region).toBe(r0);
    expect(att.uvs[6]).toBeCloseTo(0, 12);
    const b = att.computeWorldVertices(slot) as Float64Array;
    expect(b[0]).toBe(-5);
    expect(att.computeWorldVertices(other)[0]).toBeCloseTo(-3, 12);
    // Out-of-range index clamps; -1 means the setup frame.
    other.sequenceIndex = 7;
    expect(att.frameIndexFor(other)).toBe(1);
    other.sequenceIndex = -1;
    expect(att.frameIndexFor(other)).toBe(0);
  });
});

describe('mesh skinning (spec 7.4)', () => {
  // root at the origin (identity); b at (100, 0) rotated 90 -> a = 0, b = -1, c = 1, d = 0.
  const bones: BoneDef[] = [{ name: 'root' }, { name: 'b', parent: 'root', x: 100, rotation: 90 }];

  function weightedMesh(): MeshAttachment {
    return new MeshAttachment('m', {
      binding: new BindingData([2, 1, 1], [0, 1, 0, 0], [10, 0, 0, 10, 0, 20, 5, 5], [0.5, 0.5, 1, 1]),
      uvs: [0, 0, 0, 1, 1, 1],
      triangles: [0, 1, 2],
    });
  }

  it('blends two bones with weights 0.5 / 0.5', () => {
    const sk = skeletonFromBones(bones);
    const slot = sk.slots[0];
    const mesh = weightedMesh();
    expect(mesh.vertexCount).toBe(3);
    expect(mesh.deformLength).toBe(8);
    const out = mesh.computeWorldVertices(slot) as Float64Array;
    // v0 = 0.5 * root(10,0) + 0.5 * b(0,10) = 0.5*(10,0) + 0.5*(100 - 10, 0) = (50, 0)
    expect(out[0]).toBeCloseTo(50, 9);
    expect(out[1]).toBeCloseTo(0, 9);
    expect(out[2]).toBeCloseTo(0, 9);
    expect(out[3]).toBeCloseTo(20, 9);
    expect(out[4]).toBeCloseTo(5, 9);
    expect(out[5]).toBeCloseTo(5, 9);
  });

  it('adds the slot deform per influence and ignores a deform of another attachment', () => {
    const sk = skeletonFromBones(bones);
    const slot = sk.slots[0];
    const mesh = weightedMesh();
    slot.deform = Float64Array.from([0, 0, 10, 0, 0, 0, 0, 0]); // influence 1 (bone b) moves by (+10, 0) in b space
    slot.deformAttachment = mesh;
    const out = mesh.computeWorldVertices(slot) as Float64Array;
    // b(10,10) -> (100 - 10, 10) = (90, 10) ; v0 = 0.5*(10,0) + 0.5*(90,10) = (50, 5)
    expect(out[0]).toBeCloseTo(50, 9);
    expect(out[1]).toBeCloseTo(5, 9);
    slot.deformAttachment = weightedMesh(); // a different attachment: deform does not apply
    const out2 = mesh.computeWorldVertices(slot) as Float64Array;
    expect(out2[1]).toBeCloseTo(0, 9);
  });

  it('transforms unweighted vertices by the slot bone', () => {
    const sk = skeletonFromBones(bones);
    const mesh = new MeshAttachment('m', { vertices: [0, 0, 10, 0, 0, 10], uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2] });
    const out = mesh.computeWorldVertices(sk.slots[0]) as Float64Array;
    expect(Array.from(out).map((v) => Math.round(v * 1e9) / 1e9)).toEqual([100, 0, 100, 10, 90, 0]);
    expect(mesh.hull).toBe(3);
    expect(mesh.triangleCount).toBe(1);
  });

  it('writes with offset and stride', () => {
    const sk = skeletonFromBones([{ name: 'root' }]);
    const mesh = new MeshAttachment('m', { vertices: [1, 2, 3, 4, 5, 6], uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2] });
    const out = new Float64Array(12);
    mesh.computeWorldVertices(sk.slots[0], out, 1, 4);
    const expected = [0, 1, 2, 0, 0, 3, 4, 0, 0, 5, 6, 0];
    for (let i = 0; i < expected.length; i++) expect(out[i]).toBeCloseTo(expected[i], 12);
  });

  it('maps mesh UVs to the page', () => {
    const region = new AtlasRegionData(0, 'r', page(), 1, { x: 64, y: 32, width: 16, height: 8 });
    const mesh = new MeshAttachment('m', { vertices: [0, 0, 10, 0, 0, 10], uvs: [0, 0, 1, 0, 0.5, 1], triangles: [0, 1, 2] });
    mesh.setRegion(region);
    expect(mesh.regionUVs[0]).toBeCloseTo(64 / 256, 12);
    expect(mesh.regionUVs[1]).toBeCloseTo(32 / 256, 12);
    expect(mesh.regionUVs[2]).toBeCloseTo(80 / 256, 12);
    expect(mesh.regionUVs[4]).toBeCloseTo(72 / 256, 12);
    expect(mesh.regionUVs[5]).toBeCloseTo(40 / 256, 12);
  });

  it('mesh and linked mesh use the UVs of the slot sequence frame (spec 7.10)', () => {
    const r0 = new AtlasRegionData(0, 'f0', page(), 1, { x: 0, y: 0, width: 16, height: 8 });
    const r1 = new AtlasRegionData(1, 'f1', page(), 1, { x: 128, y: 64, width: 16, height: 8 });
    const seq = new SequenceData(['f0', 'f1'], 1, 0, 0);
    seq.regions[0] = r0;
    seq.regions[1] = r1;
    const mesh = new MeshAttachment('m', { vertices: [0, 0, 10, 0, 0, 10], uvs: [0, 0, 1, 0, 0.5, 1], triangles: [0, 1, 2], sequence: seq });
    mesh.setRegion(r0);
    const sk = skeletonFromBones([{ name: 'root' }]);
    const slot = sk.slots[0];
    expect(mesh.regionUVsFor(slot)[0]).toBeCloseTo(0, 12);
    slot.sequenceIndex = 1;
    expect(mesh.frameIndexFor(slot)).toBe(1);
    expect(mesh.regionFor(slot)).toBe(r1);
    // vertex 0 (u 0, v 0) lands on the frame-1 top-left corner: (128, 64) / 256
    expect(mesh.regionUVsFor(slot)[0]).toBeCloseTo(128 / 256, 12);
    expect(mesh.regionUVsFor(slot)[1]).toBeCloseTo(64 / 256, 12);
    // Setup state untouched.
    expect(mesh.region).toBe(r0);
    expect(mesh.regionUVs[0]).toBeCloseTo(0, 12);

    // A linked mesh has its own sequence and frames, sharing the parent UVs.
    const seq2 = new SequenceData(['g0', 'g1'], 1, 0, 1);
    seq2.regions[0] = r0;
    seq2.regions[1] = r1;
    const linked = new LinkedMeshAttachment('l', mesh, { sequence: seq2 });
    linked.setRegion(r1);
    slot.sequenceIndex = -1; // setup frame of seq2 is 1
    expect(linked.frameIndexFor(slot)).toBe(1);
    expect(linked.regionUVsFor(slot)[0]).toBeCloseTo(128 / 256, 12);
    slot.sequenceIndex = 0;
    expect(linked.regionUVsFor(slot)[0]).toBeCloseTo(0, 12);
    expect(linked.uvs).toBe(mesh.uvs);
  });

  it('reuses the slot scratch buffer for deform + morph (no allocation per frame)', () => {
    const sk = skeletonFromBones(bones);
    const slot = sk.slots[0];
    const mesh = weightedMesh();
    expect(mesh.computeDelta(slot)).toBeNull();
    slot.deform = Float64Array.from([1, 2]); // shorter than the layout: the rest is 0
    slot.deformAttachment = mesh;
    const first = mesh.computeDelta(slot)!;
    expect(Array.from(first)).toEqual([1, 2, 0, 0, 0, 0, 0, 0]);
    expect(slot.deltaScratch).toBe(first);
    slot.deform = Float64Array.from([0, 0, 5, 0, 0, 0, 0, 0]);
    const second = mesh.computeDelta(slot)!;
    expect(second).toBe(first); // same buffer, no new array
    expect(Array.from(second)).toEqual([0, 0, 5, 0, 0, 0, 0, 0]);
    // A bigger attachment on the same slot grows the buffer once and keeps it.
    const bigger = new MeshAttachment('big', {
      vertices: [0, 0, 1, 0, 0, 1, 1, 1, 2, 2], uvs: new Array(10).fill(0), triangles: [0, 1, 2],
    });
    slot.deform = Float64Array.from([9]);
    slot.deformAttachment = bigger;
    const third = bigger.computeDelta(slot)!;
    expect(third.length).toBeGreaterThanOrEqual(10);
    expect(third[0]).toBe(9);
    expect(third[9]).toBe(0);
    expect(bigger.computeDelta(slot)).toBe(third);
  });
});

describe('morphs and linked meshes on the example file (spec 7.5, 8.3)', () => {
  const data = loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), {
    atlases: [loadAtlas(JSON.parse(readFileSync(EXAMPLES + 'heroi.atlas.json', 'utf8')))],
  });

  it('adds the morph offsets scaled by the clamped weight', () => {
    const sk = new Skeleton(data);
    const slot = sk.findSlot('head')!;
    const face = slot.attachment as MeshAttachment;
    expect(face).toBeInstanceOf(MeshAttachment);
    expect(face.morphInfluences.length).toBe(1);
    const before = face.computeWorldVertices(slot) as Float64Array;
    sk.morphWeights[0] = 2; // clamped to max = 1
    const after = face.computeWorldVertices(slot) as Float64Array;
    const head = sk.findBone('head')!;
    // offsets [0,0, 0,0, 0,3, 0,-3, 0,0]: influence 2 (vertex 2, bone head) moves by (0, 3) in head space.
    expect(after[4] - before[4]).toBeCloseTo(head.b * 3, 9);
    expect(after[5] - before[5]).toBeCloseTo(head.d * 3, 9);
    // vertex 3: influences 3 (head, w 0.7, offset (0,-3)) and 4 (torso, w 0.3, no offset)
    expect(after[6] - before[6]).toBeCloseTo(head.b * -3 * 0.7, 9);
    expect(after[7] - before[7]).toBeCloseTo(head.d * -3 * 0.7, 9);
    expect(after[0]).toBe(before[0]);
  });

  it('linked mesh shares the parent arrays and inherits its deform and morphs', () => {
    const sk = new Skeleton(data);
    sk.setSkin('armadura');
    const slot = sk.findSlot('head')!;
    const linked = slot.attachment as LinkedMeshAttachment;
    expect(linked).toBeInstanceOf(LinkedMeshAttachment);
    const parent = data.defaultSkin.getAttachment(slot.data.index, 'face') as MeshAttachment;
    expect(linked.parent).toBe(parent);
    expect(linked.binding).toBe(parent.binding);
    expect(linked.uvs).toBe(parent.uvs);
    expect(linked.triangles).toBe(parent.triangles);
    expect(linked.timelineAttachment).toBe(parent);
    const before = linked.computeWorldVertices(slot) as Float64Array;
    sk.morphWeights[0] = 1;
    const after = linked.computeWorldVertices(slot) as Float64Array;
    expect(after[5] - before[5]).toBeCloseTo(sk.findBone('head')!.d * 3, 9);
    sk.morphWeights[0] = 0;

    // Deform written for the parent applies to the linked mesh (inheritDeform: true).
    const head = sk.findBone('head')!;
    slot.deform = Float64Array.from([0, 0, 0, 0, 4, 0]); // influence 2 (head) moves by (4, 0)
    slot.deformAttachment = parent;
    const deformed = linked.computeWorldVertices(slot) as Float64Array;
    expect(deformed[4] - before[4]).toBeCloseTo(head.a * 4, 9);
    expect(deformed[5] - before[5]).toBeCloseTo(head.c * 4, 9);
  });

  it('linked mesh with inheritDeform: false ignores the parent deform', () => {
    const sk = new Skeleton(data);
    const slot = sk.findSlot('head')!;
    const parent = data.defaultSkin.getAttachment(slot.data.index, 'face') as MeshAttachment;
    const own = new LinkedMeshAttachment('own', parent, { inheritDeform: false });
    expect(own.timelineAttachment).toBe(own);
    const before = own.computeWorldVertices(slot) as Float64Array;
    slot.deform = Float64Array.from([0, 0, 0, 0, 4, 0]);
    slot.deformAttachment = parent;
    const after = own.computeWorldVertices(slot) as Float64Array;
    expect(Array.from(after)).toEqual(Array.from(before));
    slot.deformAttachment = own; // its own deform does apply
    const ownDeform = own.computeWorldVertices(slot) as Float64Array;
    expect(ownDeform[4] - before[4]).toBeCloseTo(sk.findBone('head')!.a * 4, 9);
  });
});

describe('other attachments', () => {
  it('bounding box rectangle and ellipse become local polygons', () => {
    const rect = new BoundingBoxAttachment('r', { shape: 'rectangle', x: 10, y: 0, width: 4, height: 2, rotation: 90 });
    expect(rect.vertexCount).toBe(4);
    // corner (-2,-1) rotated 90 -> (1,-2) + (10,0) = (11,-2)
    expect(rect.vertices[0]).toBeCloseTo(11, 9);
    expect(rect.vertices[1]).toBeCloseTo(-2, 9);
    const ell = new BoundingBoxAttachment('e', { shape: 'ellipse', width: 10, height: 4 });
    expect(ell.vertexCount).toBe(16);
    expect(ell.vertices[0]).toBeCloseTo(5, 9);
    expect(ell.vertices[1]).toBeCloseTo(0, 9);
  });

  it('point attachment gives world position and rotation (spec 7.9)', () => {
    const sk = skeletonFromBones([{ name: 'root' }, { name: 'b', parent: 'root', x: 100, rotation: 90 }]);
    const p = new PointAttachment('p', { x: 10, y: 0, rotation: 45 });
    const pos = p.computeWorldPosition(sk.bones[1]);
    expect(pos.x).toBeCloseTo(100, 9);
    expect(pos.y).toBeCloseTo(10, 9);
    expect(p.computeWorldRotation(sk.bones[1])).toBeCloseTo(135, 9);
  });

  it('sequence names are generated from path, start and digits (spec 7.10)', () => {
    expect(formatNumber(4, 2)).toBe('04');
    expect(formatNumber(123, 2)).toBe('123');
    expect(formatNumber(7, 0)).toBe('7');
    expect(SequenceData.frameNames('olho_', 4, 1, 2)).toEqual(['olho_01', 'olho_02', 'olho_03', 'olho_04']);
    expect(SequenceData.frameNames('x', 2, 0, 0, ['a', 'b'])).toEqual(['a', 'b']);
  });

  it('atlas lookup uses names then aliases, first atlas wins', () => {
    const a1 = new AtlasData(1, [page()], [new AtlasRegionData(0, 'face', page(), 1, { x: 0, y: 0, width: 4, height: 4, aliases: ['rosto'] })]);
    const a2 = new AtlasData(1, [page()], [new AtlasRegionData(0, 'face', page(), 1, { x: 9, y: 9, width: 4, height: 4 })]);
    expect(a1.findRegion('rosto')).toBe(a1.regions[0]);
    expect(a1.findRegion('nope')).toBeNull();
    expect(a2.findRegion('face')!.x).toBe(9);
  });
});
