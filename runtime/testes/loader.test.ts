import { readFileSync } from 'node:fs';
import { loadSkeletonData, loadAtlas, LoadError, READER_VERSION, parseVersion, escapePointer, parseBoneText, loadSkeletonFromText, loadAtlasFromText } from '../src/loader.js';
import {
  RegionAttachment, MeshAttachment, LinkedMeshAttachment, ClippingAttachment, PathAttachment, PointAttachment,
  SkeletonAttachment, BoundingBoxAttachment, IkConstraintData, TransformConstraintData, PathConstraintData,
  PhysicsConstraintData, DriverConstraintData,
} from '../src/data.js';
import { Skeleton, collectDrawables, pose, type AtlasData } from '../src/index.js';
import { BodyTimelineData, SlotBoneTimelineData } from '../src/data.js';
import { selfIntersection, loadAnimationsFor } from '../src/loader.js';

const EXAMPLES = process.cwd().replace(/\\/g, '/') + '/formato/exemplos/';
const readJson = (name: string): unknown => JSON.parse(readFileSync(EXAMPLES + name, 'utf8'));

const header = { version: '1.0', minVersion: '1.0', generator: 'test' };

// Lote 55: `pivotX/pivotY` na região (10.3). O runtime carrega e não usa.
describe('pivô da região do atlas (10.3)', () => {
  /** Bones, region corners and UVs of the heroi, one line each, at `t` of `animation`. */
  function poseText(atlas: AtlasData, animation: string, t: number): string {
    const data = loadSkeletonData(readJson('heroi.bone'), { atlases: [atlas] });
    const skeleton = new Skeleton(data);
    pose(skeleton, data.animations.find((a) => a.name === animation)!, t);
    const lines: string[] = [];
    for (const bone of skeleton.bones) {
      lines.push(`${bone.data.name} ${bone.a} ${bone.b} ${bone.c} ${bone.d} ${bone.worldX} ${bone.worldY}`);
    }
    for (const d of collectDrawables(skeleton)) {
      const att = d.attachment;
      if (att instanceof RegionAttachment) {
        lines.push(`${d.slot.data.name}/${att.name} ${Array.from(att.computeWorldVertices(d.slot)).join(' ')} | ${Array.from(att.uvs).join(' ')}`);
      } else if (att instanceof MeshAttachment) {
        lines.push(`${d.slot.data.name}/${att.name} | ${Array.from(att.uvs).join(' ')}`);
      }
    }
    return lines.join('\n');
  }

  it('lê pivotX e pivotY, e sem eles fica undefined', () => {
    const json = readJson('heroi.atlas.json') as { regions: Array<Record<string, unknown>> };
    // O exemplo sai carimbado desde o lote 56: começa sem pivô nenhum.
    for (const r of json.regions) { delete r.pivotX; delete r.pivotY; }
    json.regions[0].pivotX = -7.5;
    json.regions[0].pivotY = 300;
    const atlas = loadAtlas(json);
    expect(atlas.warnings).toEqual([]);
    expect(atlas.regions[0].pivotX).toBe(-7.5);
    expect(atlas.regions[0].pivotY).toBe(300);
    expect(atlas.regions[1].pivotX).toBeUndefined();
    expect(atlas.regions[1].pivotY).toBeUndefined();
  });

  it('a pose do herói é idêntica, por texto, com e sem pivô', () => {
    const plain = readJson('heroi.atlas.json') as { regions: Array<Record<string, unknown>> };
    const pivoted = JSON.parse(JSON.stringify(plain)) as typeof plain;
    // Pivôs de propósito estranhos: fora da imagem, negativos, quebrados.
    pivoted.regions.forEach((r, i) => { r.pivotX = -7.5 + i * 13; r.pivotY = 300 - i * 3.25; });
    const a = loadAtlas(plain);
    const b = loadAtlas(pivoted);
    for (const [animation, t] of [['idle', 0], ['walk', 0.4], ['attack', 0.3]] as const) {
      const text = poseText(a, animation, t);
      expect(text.split('\n').length).toBeGreaterThan(30);
      expect(poseText(b, animation, t)).toBe(text);
    }
  });
});

describe('minimo.bone', () => {
  const data = loadSkeletonData(readJson('minimo.bone'));

  it('loads with defaults', () => {
    expect(data.warnings).toEqual([]);
    expect(data.bones.length).toBe(1);
    const root = data.bones[0];
    expect(root.parent).toBeNull();
    expect(root.x).toBe(0);
    expect(root.scaleX).toBe(1);
    expect(root.inheritRotation).toBe(true);
    expect(root.color).toEqual([0.61, 0.61, 0.61, 1]);
    expect(data.meta.fps).toBe(30);
    expect(data.meta.referenceScale).toBe(100);
    expect(data.assets.atlases).toEqual([]);
    const slot = data.slots[0];
    expect(slot.bone).toBe(root);
    expect(slot.color).toEqual([1, 1, 1, 1]);
    expect(slot.darkColor).toBeNull();
    expect(slot.blend).toBe('normal');
    expect(slot.visible).toBe(true);
    expect(slot.attachmentName).toBe('corpo');
    expect(data.skins.length).toBe(1);
    expect(data.defaultSkin.name).toBe('default');
    const att = data.defaultSkin.getAttachment(0, 'corpo') as RegionAttachment;
    expect(att).toBeInstanceOf(RegionAttachment);
    expect(att.path).toBe('corpo');
    expect(att.width).toBe(64);
    expect(att.region).toBeNull();
    expect(data.animations).toEqual([]);
  });

  it('creates an empty default skin when none exists', () => {
    const d = loadSkeletonData({ bone: header, bones: [{ name: 'root' }] });
    expect(d.skins.length).toBe(1);
    expect(d.defaultSkin.name).toBe('default');
    expect(d.skins[0]).toBe(d.defaultSkin);
  });
});

describe('heroi.bone with atlas', () => {
  const atlas = loadAtlas(readJson('heroi.atlas.json'));
  const data = loadSkeletonData(readJson('heroi.bone'), { atlases: [atlas] });

  it('loads without warnings or missing images', () => {
    expect(data.warnings).toEqual([]);
    expect(data.missingImages).toEqual([]);
    expect(data.header.id).toBe('3c9f4a2e-7b1d-4e6a-9f0c-2d5b8e1a7c44');
    expect(data.extensionsUsed).toEqual(['RECORTE_editor_state']);
    expect(data.meta.name).toBe('heroi');
    expect(data.assets.imagesBase).toBe('images/');
  });

  it('resolves bones and parents', () => {
    expect(data.bones.map((b) => b.name)).toEqual([
      'root', 'hips', 'torso', 'head', 'arm', 'forearm', 'hand_target',
      'leg', 'shin', 'foot', 'hair', 'cape1', 'cape2',
      'arm_b', 'forearm_b', 'leg_b', 'shin_b', 'foot_b',
    ]);
    expect(data.findBone('forearm')!.parent).toBe(data.findBone('arm'));
    expect(data.findBone('hand_target')!.inherit).toBe('onlyTranslation');
    expect(data.findBone('torso')!.rotation).toBe(90);
    expect(data.findBone('torso')!.length).toBe(70);
    expect(data.findBone('head')!.icon).toBe('head');
  });

  it('resolves slots', () => {
    expect(data.slots.length).toBe(23);
    expect(data.findSlot('hair')!.darkColor).toEqual([0.1, 0, 0.1]);
    expect(data.findSlot('hand')!.bone).toBe(data.findBone('forearm'));
    expect(data.findSlot('hitbox')!.folder).toBe('colisao');
  });

  it('resolves skins, placeholders and every attachment type', () => {
    expect(data.skins.map((s) => s.name)).toEqual(['default', 'armadura', 'armadura_capa']);
    const def = data.defaultSkin;
    const slot = (n: string): number => data.findSlot(n)!.index;
    expect(def.getAttachment(slot('mask'), 'mask')).toBeInstanceOf(ClippingAttachment);
    const mask = def.getAttachment(slot('mask'), 'mask') as ClippingAttachment;
    expect(mask.endSlot).toBe(data.findSlot('head'));
    expect(mask.slots).toBeNull();
    expect(def.getAttachment(slot('body'), 'body')).toBeInstanceOf(RegionAttachment);
    const body = def.getAttachment(slot('body'), 'body') as RegionAttachment;
    expect(body.region).toBe(atlas.findRegion('body'));
    expect(body.rotation).toBe(-90);
    const face = def.getAttachment(slot('head'), 'face') as MeshAttachment;
    expect(face).toBeInstanceOf(MeshAttachment);
    expect(face.binding!.counts.length).toBe(4);
    expect(face.deformLength).toBe(10);
    expect(face.hull).toBe(4);
    expect(face.region).toBe(atlas.findRegion('face'));
    const hand = def.getAttachment(slot('hand'), 'hand') as RegionAttachment;
    expect(hand.sequence!.frames).toEqual(['hand_01', 'hand_02', 'hand_03']);
    expect(hand.sequence!.regions[2]).toBe(atlas.findRegion('hand_03'));
    expect(hand.region).toBe(atlas.findRegion('hand_01'));
    expect(def.getAttachment(slot('weapon'), 'sword')).toBeInstanceOf(SkeletonAttachment);
    expect((def.getAttachment(slot('weapon'), 'sword') as SkeletonAttachment).uri).toBe('espada.bone');
    expect(def.getAttachment(slot('hitbox'), 'hitbox')).toBeInstanceOf(BoundingBoxAttachment);
    expect(def.getAttachment(slot('hand_point'), 'hand_point')).toBeInstanceOf(PointAttachment);
    const path = def.getAttachment(slot('cape_path'), 'cape_path') as PathAttachment;
    expect(path).toBeInstanceOf(PathAttachment);
    expect(path.anchorCount).toBe(3);
    expect(path.curveCount).toBe(2);
    expect(Array.from(path.lengths)).toEqual([36.056, 77.287]);

    const armor = data.findSkin('armadura')!;
    expect(armor.displayName).toBe('Armadura');
    expect(armor.getAttachment(slot('hair'), 'hair')).toBeNull();
    expect(armor.getAttachment(slot('arm'), 'arm')).toBeUndefined();
    const linked = armor.getAttachment(slot('head'), 'face') as LinkedMeshAttachment;
    expect(linked).toBeInstanceOf(LinkedMeshAttachment);
    expect(linked.parent).toBe(face);
    expect(linked.region).toBe(atlas.findRegion('face'));
    const capa = data.findSkin('armadura_capa')!;
    expect(capa.includes).toEqual([armor]);
    expect(capa.expand().map((s) => s.name)).toEqual(['armadura', 'armadura_capa']);
  });

  it('resolves constraints in file order', () => {
    expect(data.constraints.map((c) => c.name)).toEqual(['ik_arm', 'head_lean', 'cape_follow', 'hair_physics', 'look_driver']);
    const ik = data.constraints[0] as IkConstraintData;
    expect(ik).toBeInstanceOf(IkConstraintData);
    expect(ik.bones.map((b) => b.name)).toEqual(['arm', 'forearm']);
    expect(ik.target).toBe(data.findBone('hand_target'));
    expect(ik.bendPositive).toBe(false);
    const tr = data.constraints[1] as TransformConstraintData;
    expect(tr).toBeInstanceOf(TransformConstraintData);
    expect(tr.local).toBe(true);
    expect(tr.mixRotation).toBe(0.05);
    const path = data.constraints[2] as PathConstraintData;
    expect(path).toBeInstanceOf(PathConstraintData);
    expect(path.target).toBe(data.findSlot('cape_path'));
    expect(path.rotateMode).toBe('chain');
    const ph = data.constraints[3] as PhysicsConstraintData;
    expect(ph).toBeInstanceOf(PhysicsConstraintData);
    expect(ph.bone).toBe(data.findBone('hair'));
    expect(ph.strength).toBe(80);
    expect(ph.limit).toBe(5000);
    const drv = data.constraints[4] as DriverConstraintData;
    expect(drv).toBeInstanceOf(DriverConstraintData);
    expect(drv.parameter).toBe(data.parameters[0]);
    expect(drv.targets!.length).toBe(2);
    expect(drv.targets![0].mode).toBe('add');
    expect(drv.targets![0].timeline.kind).toBe('bone.number');
    expect(Array.from(drv.targets![0].timeline.times)).toEqual([-1, 0, 1]);
    expect(drv.targets![1].timeline.kind).toBe('morph');
    expect(drv.from).toBe(-1);
    expect(drv.to).toBe(1);
  });

  it('resolves events, parameters, morphs, variables and tags', () => {
    expect(data.events.map((e) => e.name)).toEqual(['step', 'hit']);
    expect(data.findEvent('hit')!.float).toBe(0);
    expect(data.findEvent('hit')!.volume).toBe(1);
    expect(data.findEvent('step')!.audio).toBe('step.ogg');
    expect(data.parameters[0].name).toBe('lookX');
    expect(data.parameters[0].min).toBe(-1);
    expect(data.morphs[0].targets.length).toBe(1);
    expect(data.morphs[0].targets[0].attachment).toBe(data.defaultSkin.getAttachment(11, 'face')); // slot `head`
    expect(data.variables.map((v) => v.default)).toEqual([0, true]);
    expect(data.tags).toEqual(['vulnerable', 'attacking', 'idle']);
  });

  it('resolves animations and timelines', () => {
    expect(data.animations.map((a) => a.name)).toEqual(['idle', 'walk', 'attack']);
    const idle = data.findAnimation('idle')!;
    expect(idle.duration).toBe(2);
    expect(idle.loop).toBe(true);
    expect(idle.tags).toEqual(['idle']);
    expect(idle.timelines.map((t) => t.kind)).toEqual([
      'bone.number', 'bone.number', 'bone.number', 'bone.number', 'bone.number',
      'bone.number', 'bone.number', 'bone.number', 'bone.number',
      'slot.color', 'deform', 'sequence',
      'parameter', 'morph', 'constraint.number', 'variable.number', 'variable.stepped', 'tag',
      'nested.animation', 'nested.number',
    ]);
    const torso = idle.timelines[0];
    if (torso.kind !== 'bone.number') throw new Error('kind');
    expect(torso.bone).toBe(data.findBone('torso'));
    expect(torso.property).toBe('rotation');
    expect(Array.from(torso.keys.values)).toEqual([90, 93, 90]);
    expect(torso.keys.curves[0].kind).toBe('bezier');
    expect(Array.from(torso.keys.curves[0].controls!)).toEqual([0.3, 90, 0.7, 93]);
    expect(torso.keys.curves[2].kind).toBe('linear');
    const color = idle.timelines[9];
    if (color.kind !== 'slot.color') throw new Error('kind');
    expect(color.keys.components).toBe(4);
    expect(color.keys.curves[0].controls!.length).toBe(16);
    const deform = idle.timelines[10];
    if (deform.kind !== 'deform') throw new Error('kind');
    expect(deform.vertices[0].length).toBe(0);
    expect(Array.from(deform.vertices[1])).toEqual([0, 0, 0, 0, 0, 1, 0, 1, 0, 0]);
    expect(deform.curves[1].kind).toBe('bezier');
    const seq = idle.timelines[11];
    if (seq.kind !== 'sequence') throw new Error('kind');
    expect(seq.keys.values[0]).toEqual({ mode: 'loop', index: 0, delay: 0.25 });
    const grounded = idle.timelines[16];
    if (grounded.kind !== 'variable.stepped') throw new Error('kind');
    expect(grounded.keys.values).toEqual([true]);

    const walk = data.findAnimation('walk')!;
    const drawOrder = walk.timelines.find((t) => t.kind === 'drawOrder');
    if (drawOrder === undefined || drawOrder.kind !== 'drawOrder') throw new Error('kind');
    expect(drawOrder.orders[0]).toBeNull();
    // slot `arm` (15) walks two places back; 13 and 14 shift down
    expect(Array.from(drawOrder.orders[1]!)).toEqual(
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 15, 13, 14, 16, 17, 18, 19, 20, 21, 22],
    );
    const events = walk.timelines.find((t) => t.kind === 'event');
    if (events === undefined || events.kind !== 'event') throw new Error('kind');
    expect(events.events.length).toBe(2);
    expect(events.events[1].int).toBe(2);
    expect(events.events[1].volume).toBe(0.8); // from the definition
    expect(events.events[1].balance).toBe(0.3);
    const attachment = walk.timelines.find((t) => t.kind === 'slot.attachment');
    if (attachment === undefined || attachment.kind !== 'slot.attachment') throw new Error('kind');
    expect(attachment.keys.values).toEqual(['hand', 'hand_fist', 'hand']);

    const attack = data.findAnimation('attack')!;
    const kinds = attack.timelines.map((t) => t.kind);
    expect(kinds).toContain('constraint.reset');
    expect(kinds).toContain('constraint.boolean');
    expect(kinds).toContain('bone.inherit');
    const dark = attack.timelines.find((t) => t.kind === 'slot.darkColor');
    if (dark === undefined || dark.kind !== 'slot.darkColor') throw new Error('kind');
    expect(dark.values[0]).toBeNull();
    expect(dark.curves[0].kind).toBe('stepped');
    const nestedTime = attack.timelines.find((t) => t.kind === 'nested.number');
    if (nestedTime === undefined || nestedTime.kind !== 'nested.number') throw new Error('kind');
    expect(nestedTime.property).toBe('time');
    expect(nestedTime.keys.curves[0].kind).toBe('bezier');
  });

  it('reports missing images when an atlas is given but lacks a region', () => {
    const d = loadSkeletonData(readJson('minimo.bone'), { atlases: [atlas] });
    expect(d.missingImages).toEqual(['corpo']);
    expect(d.warnings.length).toBe(1);
    expect(d.warnings[0].pointer).toBe('/skins/0/attachments/corpo/corpo/path');
  });
});

describe('errors and fallbacks (spec 4.7, 12)', () => {
  it('throws on fatal structure problems with the JSON pointer', () => {
    expect(() => loadSkeletonData(null)).toThrow(LoadError);
    expect(() => loadSkeletonData({})).toThrow('/bone');
    expect(() => loadSkeletonData({ bone: header })).toThrow('/bones');
    expect(() => loadSkeletonData({ bone: header, bones: [] })).toThrow('/bones');
    expect(() => loadSkeletonData({ bone: header, bones: [{ name: 'r', x: 'no' }] })).toThrow('/bones/0/x');
    expect(() => loadSkeletonData({ bone: { version: 'x', minVersion: '1.0', generator: 'g' }, bones: [{ name: 'r' }] })).toThrow('/bone/version');
  });

  it('nonexistent parent: strict throws, lenient attaches to the root', () => {
    const json = { bone: header, bones: [{ name: 'root' }, { name: 'a', parent: 'ghost' }] };
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/bones/1/parent');
    const d = loadSkeletonData(json);
    expect(d.bones[1].parent).toBe(d.bones[0]);
    expect(d.warnings[0].pointer).toBe('/bones/1/parent');
  });

  it('parent cycle: strict throws mentioning the cycle, lenient breaks it', () => {
    const json = { bone: header, bones: [{ name: 'root' }, { name: 'a', parent: 'b' }, { name: 'b', parent: 'a' }] };
    expect(() => loadSkeletonData(json, { strict: true })).toThrow(/cycle/);
    const d = loadSkeletonData(json);
    expect(d.bones[1].parent).toBe(d.bones[0]);
    expect(d.bones[2].parent).toBe(d.bones[1]);
    expect(d.bones.map((b) => b.name)).toEqual(['root', 'a', 'b']);
  });

  it('parent after child (no cycle) is reported and attached to the root', () => {
    const json = { bone: header, bones: [{ name: 'root' }, { name: 'a', parent: 'b' }, { name: 'b', parent: 'root' }] };
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/bones/1/parent');
    const d = loadSkeletonData(json);
    expect(d.bones[1].parent).toBe(d.bones[0]);
  });

  it('two roots: strict throws, lenient attaches the second to the first', () => {
    const json = { bone: header, bones: [{ name: 'root' }, { name: 'other' }] };
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/bones/1/parent');
    const d = loadSkeletonData(json);
    expect(d.bones[1].parent).toBe(d.bones[0]);
    const withParentOnRoot = { bone: header, bones: [{ name: 'root', parent: 'x' }] };
    expect(() => loadSkeletonData(withParentOnRoot, { strict: true })).toThrow('/bones/0/parent');
    expect(loadSkeletonData(withParentOnRoot).bones[0].parent).toBeNull();
  });

  it('slot with nonexistent bone: strict throws, lenient attaches to the root', () => {
    const json = { bone: header, bones: [{ name: 'root' }], slots: [{ name: 's', bone: 'nope' }] };
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/slots/0/bone');
    const d = loadSkeletonData(json);
    expect(d.slots[0].bone).toBe(d.bones[0]);
  });

  it('the three F3 inherit combinations load with no issue, each to its own mode', () => {
    const json = {
      bone: header,
      bones: [
        { name: 'root' },
        { name: 'a', parent: 'root', inheritReflection: false },
        { name: 'b', parent: 'root', inheritRotation: false },
        { name: 'c', parent: 'root', inheritRotation: false, inheritScale: false },
      ],
    };
    expect(() => loadSkeletonData(json, { strict: true })).not.toThrow();
    const bones = loadSkeletonData(json).bones;
    expect(bones.slice(1).map((b) => b.inherit)).toEqual(['noReflection', 'noRotation', 'onlyReflection']);
  });

  it('unknown attachment, constraint and timeline types are ignored (spec 2.5)', () => {
    const d = loadSkeletonData({
      bone: header,
      bones: [{ name: 'root' }],
      slots: [{ name: 's', bone: 'root', attachment: 'a' }],
      skins: [{ name: 'default', attachments: { s: { a: { type: 'ACME_ribbon' } } } }],
      constraints: [{ type: 'ACME_spring', name: 'c' }, { type: 'physics', name: 'p', bone: 'root' }],
      animations: [{ name: 'x', timelines: [
        { type: 'ACME_thing', keys: [{ time: 0, value: 1 }] },
        { type: 'bone', target: 'root', property: 'wobble', keys: [{ time: 0, value: 1 }] },
        { type: 'bone', target: 'root', property: 'x', keys: [{ time: 0, value: 1 }] },
      ] }],
    });
    expect(d.defaultSkin.getAttachment(0, 'a')).toBeNull();
    expect(d.constraints.map((c) => c.name)).toEqual(['p']);
    expect(d.animations[0].timelines.length).toBe(1);
    expect(d.warnings.length).toBe(4);
  });

  it('broken constraint references drop the whole constraint', () => {
    const json = {
      bone: header,
      bones: [{ name: 'root' }, { name: 'a', parent: 'root' }, { name: 'b', parent: 'a' }],
      constraints: [
        { type: 'ik', name: 'bad_target', bones: ['a'], target: 'ghost' },
        { type: 'ik', name: 'root_ik', bones: ['root'], target: 'a' },
        { type: 'ik', name: 'descendant', bones: ['a'], target: 'b' },
        { type: 'ik', name: 'ok', bones: ['a', 'b'], target: 'root' }, // an ancestor target is fine
      ],
    };
    expect(loadSkeletonData(json).constraints.map((c) => c.name)).toEqual(['ok']);
    const d = loadSkeletonData({
      ...json,
      bones: [{ name: 'root' }, { name: 'a', parent: 'root' }, { name: 'b', parent: 'a' }, { name: 't', parent: 'root' }],
      constraints: [{ type: 'ik', name: 'ok', bones: ['a', 'b'], target: 't' }],
    });
    expect(d.constraints.map((c) => c.name)).toEqual(['ok']);
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/constraints/0/target');
  });

  it('driver in continuous mode binds the animation and defaults timeTo to its duration', () => {
    const d = loadSkeletonData({
      bone: header,
      bones: [{ name: 'root' }],
      parameters: [{ name: 'p', min: 0, max: 2 }],
      constraints: [{ type: 'driver', name: 'd', parameter: 'p', animation: 'ctl' }],
      animations: [{ name: 'ctl', timelines: [{ type: 'bone', target: 'root', property: 'x', keys: [{ time: 0, value: 0 }, { time: 1.5, value: 10 }] }] }],
    });
    const drv = d.constraints[0] as DriverConstraintData;
    expect(drv.animation).toBe(d.animations[0]);
    expect(drv.timeTo).toBe(1.5);
    expect(drv.from).toBe(0);
    expect(drv.to).toBe(2);
    const missing = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }], parameters: [{ name: 'p' }],
      constraints: [{ type: 'driver', name: 'd', parameter: 'p', animation: 'ghost' }],
    });
    expect(missing.constraints).toEqual([]);
  });

  it('normalizes curves with the clamp rule and unknown strings', () => {
    const d = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }],
      animations: [{ name: 'a', timelines: [{ type: 'bone', target: 'root', property: 'x', keys: [
        { time: 0, value: 0, curve: [-1, 0, 2, 5] },
        { time: 1, value: 5, curve: 'elastic' },
        { time: 2, value: 0, curve: [0.9, 0, 0.2, 1] },
      ] }] }],
    });
    const tl = d.animations[0].timelines[0];
    if (tl.kind !== 'bone.number') throw new Error('kind');
    expect(Array.from(tl.keys.curves[0].controls!)).toEqual([0, 0, 1, 5]);
    expect(tl.keys.curves[1].kind).toBe('linear');
    expect(tl.keys.curves[2].kind).toBe('linear'); // last key: ignored
    expect(d.animations[0].duration).toBe(2);
  });

  it('draw order keys: unknown slot ignored, index clamped, last entry wins', () => {
    const d = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }],
      slots: [{ name: 'a', bone: 'root' }, { name: 'b', bone: 'root' }, { name: 'c', bone: 'root' }],
      animations: [{ name: 'x', timelines: [{ type: 'drawOrder', keys: [
        { time: 0, value: [{ slot: 'ghost', offset: 1 }, { slot: 'a', offset: 5 }] },
        { time: 1, value: [{ slot: 'a', offset: 1 }, { slot: 'c', offset: -1 }] },
      ] }] }],
    });
    const tl = d.animations[0].timelines[0];
    if (tl.kind !== 'drawOrder') throw new Error('kind');
    expect(Array.from(tl.orders[0]!)).toEqual([1, 2, 0]);
    expect(Array.from(tl.orders[1]!)).toEqual([0, 2, 1]);
  });

  it('keys out of order are reordered in lenient mode', () => {
    const json = {
      bone: header, bones: [{ name: 'root' }],
      animations: [{ name: 'a', timelines: [{ type: 'bone', target: 'root', property: 'x', keys: [{ time: 1, value: 1 }, { time: 0, value: 0 }] }] }],
    };
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/animations/0/timelines/0/keys');
    const tl = loadSkeletonData(json).animations[0].timelines[0];
    if (tl.kind !== 'bone.number') throw new Error('kind');
    expect(Array.from(tl.keys.times)).toEqual([0, 1]);
    expect(Array.from(tl.keys.values)).toEqual([0, 1]);
  });

  it('a mesh needs exactly one of vertices or binding, with matching sizes', () => {
    const base = { bone: header, bones: [{ name: 'root' }], slots: [{ name: 's', bone: 'root' }] };
    const noSource = loadSkeletonData({ ...base, skins: [{ name: 'default', attachments: { s: { m: { type: 'mesh', uvs: [0, 0, 0, 0, 0, 0], triangles: [0, 1, 2] } } } }] });
    expect(noSource.defaultSkin.getAttachment(0, 'm')).toBeNull();
    const badBinding = { ...base, skins: [{ name: 'default', attachments: { s: { m: {
      type: 'mesh', uvs: [0, 0, 0, 0, 0, 0], triangles: [0, 1, 2],
      binding: { counts: [1, 1, 1], bones: [0, 0, 7], positions: [0, 0, 0, 0, 0, 0], weights: [1, 1, 1] },
    } } } }] };
    expect(() => loadSkeletonData(badBinding, { strict: true })).toThrow('/skins/0/attachments/s/m/binding/bones/2');
    expect(loadSkeletonData(badBinding).defaultSkin.getAttachment(0, 'm')).toBeNull();
  });

  it('skin include cycles are cut and missing includes ignored', () => {
    const d = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }],
      skins: [{ name: 'a', includes: ['b', 'ghost'] }, { name: 'b', includes: ['a'] }],
    });
    const a = d.findSkin('a')!;
    const b = d.findSkin('b')!;
    expect(a.expand().length + b.expand().length).toBeLessThanOrEqual(4);
    expect(a.expand().includes(a)).toBe(true);
    expect(d.warnings.some((w) => /cycle/.test(w.message))).toBe(true);
    expect(d.warnings.some((w) => w.pointer === '/skins/0/includes/1')).toBe(true);
  });

  it('version handling follows spec 2.4', () => {
    expect(parseVersion('1.0')).toEqual({ major: 1, minor: 0 });
    expect(parseVersion('1.0.1')).toBeNull();
    const newer = loadSkeletonData({ bone: { version: '1.7', minVersion: '1.0', generator: 'g' }, bones: [{ name: 'r' }] });
    expect(newer.warnings[0].message).toMatch(/partial read/);
    const major = { bone: { version: '2.0', minVersion: '2.0', generator: 'g' }, bones: [{ name: 'r' }] };
    expect(() => loadSkeletonData(major, { strict: true })).toThrow('/bone/version');
    expect(loadSkeletonData(major).warnings[0].message).toMatch(/2\.0/);
  });

  // Rodada 11 (05/10/2026): o leitor passou a ler o `around` (7.11), que é da
  // 1.1, e continuava dizendo que só conhecia a 1.0: todo arquivo com
  // `around` abria certo E com o aviso de "best effort".
  it('o leitor conhece a 1.1: um arquivo 1.1 abre sem aviso de versão; um 1.2 continua avisando', () => {
    const de = (version: string, minVersion: string) => loadSkeletonData(
      { bone: { version, minVersion, generator: 'g' }, bones: [{ name: 'r' }] });
    expect(READER_VERSION).toEqual({ major: 1, minor: 1 });
    expect(de('1.1', '1.1').warnings).toEqual([]);
    expect(de('1.1', '1.0').warnings).toEqual([]);
    const exige = de('1.2', '1.2').warnings;
    expect(exige.length).toBe(1);
    expect(exige[0].message).toMatch(/requires 1\.2, reader is 1\.1: best effort/);
    expect(de('1.2', '1.0').warnings[0].message).toMatch(/newer than reader 1\.1: partial read/);
  });

  it('escapes JSON pointer segments', () => {
    expect(escapePointer('a/b~c')).toBe('a~1b~0c');
    const d = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }], slots: [{ name: 'x/y', bone: 'nope' }],
    });
    expect(d.warnings[0].pointer).toBe('/slots/0/bone');
  });
});

describe('atlas loader (spec 10)', () => {
  const atlas = loadAtlas(readJson('heroi.atlas.json'));

  it('loads pages and regions with defaults', () => {
    expect(atlas.warnings).toEqual([]);
    expect(atlas.scale).toBe(1);
    expect(atlas.pages.length).toBe(1);
    expect(atlas.pages[0].premultiplied).toBe(false);
    expect(atlas.pages[0].minFilter).toBe('linear');
    expect(atlas.regions.length).toBe(21);
    const armor = atlas.findRegion('armadura/body')!;
    expect(armor.offsetX).toBe(2);
    expect(armor.originalHeight).toBe(84);
    const body = atlas.findRegion('body')!;
    expect(body.originalWidth).toBe(76);
    expect(body.rotation).toBe(0);
    expect(atlas.findRegion('arm')!.rotation).toBe(90);
    expect(atlas.findRegion('rosto')).toBe(atlas.findRegion('face'));
    expect(atlas.findRegion('nope')).toBeNull();
  });

  it('applies fallbacks for unknown enums and rotations', () => {
    const a = loadAtlas({
      atlas: { version: '1.0' },
      pages: [{ name: 'p', image: 'p.png', width: 64, height: 64, format: 'bc7', magFilter: 'cubic' }],
      regions: [{ name: 'r', page: 0, x: 0, y: 0, width: 8, height: 8, rotation: 45 }, { name: 'q', page: 3, x: 0, y: 0, width: 1, height: 1 }],
    });
    expect(a.pages[0].format).toBe('rgba8');
    expect(a.pages[0].magFilter).toBe('linear');
    expect(a.regions.length).toBe(1);
    expect(a.regions[0].rotation).toBe(0);
    expect(a.warnings.length).toBe(4);
  });

  it('throws on fatal atlas problems', () => {
    expect(() => loadAtlas({})).toThrow('/atlas');
    expect(() => loadAtlas({ atlas: { version: '1.0' }, pages: [], regions: [] })).toThrow('/pages');
    expect(() => loadAtlas({ atlas: { version: '1.0' }, scale: 0, pages: [{ name: 'p', image: 'p', width: 1, height: 1 }], regions: [] })).toThrow('/scale');
  });
});

describe('review fixes: uris, duplicates, drivers, extensions, timelines (spec 2.1, 2.7, 2.8, 4.7, 7.2, 9)', () => {
  const base = { bone: header, bones: [{ name: 'root' }], slots: [{ name: 's', bone: 'root' }] };
  const regionSkin = (path: string, extra: Record<string, unknown> = {}) => [
    { name: 'default', attachments: { s: { r: { type: 'region', path, width: 4, height: 4, ...extra } } } },
  ];

  it('refuses attachment paths that break the uri rules and makes them invisible (spec 7.2, 2.8)', () => {
    const atlas = loadAtlas({ atlas: { version: '1.0' }, pages: [{ name: 'p', image: 'p.png', width: 8, height: 8 }], regions: [] });
    for (const bad of ['../x', 'C:/x', 'a\\b', 'a%2Fb', '/abs', 'a/./b', 'x%00', 'http://h/x', 'a'.repeat(1025)]) {
      const d = loadSkeletonData({ ...base, skins: regionSkin(bad) }, { atlases: [atlas] });
      const att = d.defaultSkin.getAttachment(0, 'r') as RegionAttachment;
      expect(att).toBeInstanceOf(RegionAttachment);
      expect(att.region).toBeNull();
      expect(d.missingImages).toEqual([bad]);
      expect(d.warnings.length).toBe(1);
      expect(d.warnings[0].pointer).toBe('/skins/0/attachments/s/r/path');
      expect(d.warnings[0].message).toMatch(/refused/);
      expect(() => loadSkeletonData({ ...base, skins: regionSkin(bad) }, { strict: true })).toThrow('/skins/0/attachments/s/r/path');
    }
    // Valid names: percent-encoded unreserved characters and sub-folders pass.
    const ok = loadSkeletonData({ ...base, skins: regionSkin('pasta/ol%C3%A1_01') });
    expect(ok.warnings).toEqual([]);
  });

  it('validates sequence frame names and points generated names at "path" (spec 7.10)', () => {
    const explicit = loadSkeletonData({ ...base, skins: regionSkin('r', { sequence: { frames: ['ok', '../bad'] } }) });
    expect(explicit.warnings.length).toBe(1);
    expect(explicit.warnings[0].pointer).toBe('/skins/0/attachments/s/r/sequence/frames/1');
    expect(explicit.missingImages).toEqual(['../bad']);
    const generated = loadSkeletonData({ ...base, skins: regionSkin('C:/x', { sequence: { count: 2 } }) });
    expect(generated.warnings.length).toBe(2);
    expect(generated.warnings[0].pointer).toBe('/skins/0/attachments/s/r/path');
    expect(generated.missingImages).toEqual(['C:/x1', 'C:/x2']);
  });

  it('checks assets, event audio, nested skeleton uri and atlas page image (spec 2.8)', () => {
    const d = loadSkeletonData({
      ...base,
      assets: { atlases: ['a.atlas.json', '../b.atlas.json'], imagesBase: '/abs/', audioBase: 'sons/', skeletonsBase: '' },
      events: [{ name: 'e', audio: 'c:pum.ogg' }],
      skins: [{ name: 'default', attachments: { s: {
        n: { type: 'skeleton', uri: '../fora.bone' },
        d: { type: 'skeleton', uri: 'data:application/json,{}' },
        b: { type: 'boundingbox', path: 'ignored', vertices: [0, 0, 1, 0, 0, 1] },
      } } }],
    });
    const pointers = d.warnings.map((w) => w.pointer);
    expect(pointers).toContain('/assets/atlases/1');
    expect(pointers).toContain('/assets/imagesBase');
    expect(pointers).toContain('/events/0/audio');
    expect(pointers).toContain('/skins/0/attachments/s/n/uri');
    expect(pointers).toContain('/skins/0/attachments/s/d/uri');
    expect(pointers).toContain('/skins/0/attachments/s/b/path'); // L2: path ignored on non-drawing types
    expect(pointers).not.toContain('/assets/audioBase');
    expect(pointers).not.toContain('/assets/skeletonsBase');
    expect(d.defaultSkin.getAttachment(0, 'n')).toBeNull();
    expect(d.defaultSkin.getAttachment(0, 'b')).toBeInstanceOf(BoundingBoxAttachment);

    const atlasJson = (image: string) => ({ atlas: { version: '1.0' }, pages: [{ name: 'p', image, width: 8, height: 8 }], regions: [] });
    expect(loadAtlas(atlasJson('data:image/png;base64,AAAA')).warnings).toEqual([]);
    expect(loadAtlas(atlasJson('../p.png')).warnings[0].pointer).toBe('/pages/0/image');
    expect(() => loadAtlas(atlasJson('C:/p.png'), { strict: true })).toThrow('/pages/0/image');
  });

  it('duplicate names: lookups and references agree on the first object (spec 2.1, DUVIDAS-SPEC 5)', () => {
    const d = loadSkeletonData({
      bone: header,
      bones: [{ name: 'root' }, { name: 'a', parent: 'root', x: 1 }, { name: 'a', parent: 'root', x: 2 }],
      slots: [{ name: 's', bone: 'a' }, { name: 's', bone: 'root' }],
      skins: [{ name: 'k' }, { name: 'k' }],
      events: [{ name: 'e', int: 1 }, { name: 'e', int: 2 }],
      constraints: [{ type: 'physics', name: 'c', bone: 'a' }, { type: 'physics', name: 'c', bone: 'root' }],
      animations: [{ name: 'an' }, { name: 'an', duration: 5 }],
    });
    expect(d.bones.length).toBe(3);
    expect(d.findBone('a')).toBe(d.bones[1]);
    expect(d.findBone('a')).toBe(d.slots[0].bone);
    expect(d.findSlot('s')).toBe(d.slots[0]);
    expect(d.findEvent('e')!.int).toBe(1);
    expect(d.findConstraint('c')).toBe(d.constraints[0]);
    expect((d.constraints[0] as PhysicsConstraintData).bone).toBe(d.bones[1]);
    expect(d.findAnimation('an')).toBe(d.animations[0]);
    expect(d.findAnimation('an')!.duration).toBe(0);
    expect(d.findSkin('k')!.index).toBe(0);
  });

  it('a driver with a missing animation is dropped at load and constraint indices stay dense (spec 4.7, 8.2)', () => {
    const d = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }], parameters: [{ name: 'p' }],
      constraints: [
        { type: 'driver', name: 'broken', parameter: 'p', animation: 'ghost' },
        { type: 'physics', name: 'phys', bone: 'root' },
        { type: 'driver', name: 'good', parameter: 'p', animation: 'ctl' },
      ],
      animations: [{ name: 'ctl', duration: 2, timelines: [{ type: 'constraint', target: 'phys', property: 'mix', keys: [{ time: 0, value: 1 }] }] }],
    });
    expect(d.constraints.map((c) => c.name)).toEqual(['phys', 'good']);
    for (let i = 0; i < d.constraints.length; i++) expect(d.constraints[i].index).toBe(i);
    expect(d.findConstraint('phys')).toBe(d.constraints[0]);
    expect((d.constraints[1] as DriverConstraintData).animation).toBe(d.animations[0]);
    expect((d.constraints[1] as DriverConstraintData).timeTo).toBe(2);
    expect(d.warnings[0].pointer).toBe('/constraints/0/animation');
    // The constraint timeline resolved to the surviving constraint.
    const tl = d.animations[0].timelines[0];
    if (tl.kind !== 'constraint.number') throw new Error('kind');
    expect(tl.constraint).toBe(d.constraints[0]);
  });

  it('refuses unsupported required extensions unless a degraded load is requested (spec 2.7)', () => {
    const json = { ...base, extensionsUsed: ['ACME_a', 'ACME_b'], extensionsRequired: ['ACME_a', 'ACME_b'] };
    expect(() => loadSkeletonData(json)).toThrow(LoadError);
    expect(() => loadSkeletonData(json)).toThrow(/ACME_a, ACME_b/);
    expect(() => loadSkeletonData(json)).toThrow('/extensionsRequired');
    const d = loadSkeletonData(json, { allowMissingRequiredExtensions: true });
    expect(d.degraded).toBe(true);
    expect(d.warnings[0].pointer).toBe('/extensionsRequired');
    expect(d.warnings[0].message).toMatch(/degraded/);
    expect(loadSkeletonData(base).degraded).toBe(false);
    // Strict mode never loads degraded.
    expect(() => loadSkeletonData(json, { allowMissingRequiredExtensions: true, strict: true })).toThrow('/extensionsRequired');
  });

  it('sequence keys: index clamped to 0..count-1, negative delay becomes 0 (spec 9.6)', () => {
    const d = loadSkeletonData({
      ...base,
      skins: regionSkin('f', { sequence: { count: 3 } }),
      animations: [{ name: 'a', timelines: [{ type: 'sequence', target: 's', attachment: 'r', keys: [
        { time: 0, value: { mode: 'loop', index: 5, delay: -1 } },
        { time: 1, value: { mode: 'once', index: -2, delay: 0.1 } },
      ] }] }],
    });
    const tl = d.animations[0].timelines[0];
    if (tl.kind !== 'sequence') throw new Error('kind');
    expect(tl.keys.values[0]).toEqual({ mode: 'loop', index: 2, delay: 0 });
    expect(tl.keys.values[1]).toEqual({ mode: 'once', index: 0, delay: 0.1 });
    expect(d.warnings.map((w) => w.pointer)).toEqual([
      '/animations/0/timelines/0/keys/0/value/index', '/animations/0/timelines/0/keys/0/value/delay',
      '/animations/0/timelines/0/keys/1/value/index',
    ]);
  });

  it('two-bone IK with a bone outside normal inheritance is dropped (spec 6.2, DUVIDAS-SPEC 9)', () => {
    const json = {
      bone: header,
      bones: [{ name: 'root' }, { name: 'a', parent: 'root' }, { name: 'b', parent: 'a', inheritScale: false }, { name: 't', parent: 'root' }],
      constraints: [{ type: 'ik', name: 'ik', bones: ['a', 'b'], target: 't' }],
    };
    const d = loadSkeletonData(json);
    expect(d.constraints).toEqual([]);
    expect(d.warnings[0].pointer).toBe('/constraints/0/bones/1');
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/constraints/0/bones/1');
  });

  it('timeline identity ignores the skin default and irrelevant fields (spec 9.1 duplicates)', () => {
    const mesh = { type: 'mesh', vertices: [0, 0, 1, 0, 0, 1], uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2] };
    const d = loadSkeletonData({
      ...base,
      skins: [{ name: 'default', attachments: { s: { m: mesh } } }],
      animations: [{ name: 'a', timelines: [
        { type: 'deform', target: 's', attachment: 'm', keys: [{ time: 0, value: [1, 1] }] },
        { type: 'deform', target: 's', skin: 'default', attachment: 'm', keys: [{ time: 0, value: [2, 2] }] },
        { type: 'drawOrder', property: 'x', keys: [{ time: 0, value: [] }] },
        { type: 'drawOrder', skin: 'z', keys: [{ time: 0, value: [] }] },
      ] }],
    });
    expect(d.animations[0].timelines.length).toBe(2);
    const deform = d.animations[0].timelines[0];
    if (deform.kind !== 'deform') throw new Error('kind');
    expect(deform.vertices[0][0]).toBe(2); // the last one wins
    expect(d.warnings.filter((w) => /duplicate timeline/.test(w.message)).length).toBe(2);
  });

  it('reports minVersion greater than version (L1 VERSION_MIN_GT_VERSION)', () => {
    const json = { bone: { version: '1.0', minVersion: '1.2', generator: 'g' }, bones: [{ name: 'r' }] };
    const d = loadSkeletonData(json);
    expect(d.warnings[0].pointer).toBe('/bone/minVersion');
    expect(d.warnings[0].message).toMatch(/1\.2.*greater.*1\.0/);
    expect(() => loadSkeletonData(json, { strict: true })).toThrow('/bone/minVersion');
    expect(loadSkeletonData({ bone: { version: '1.1', minVersion: '1.0', generator: 'g' }, bones: [{ name: 'r' }] }).warnings.some((w) => w.pointer === '/bone/minVersion')).toBe(false);
  });

  it('hints placeholders that no skin defines (L2 HINT_PLACEHOLDER_MISSING, spec 7.1)', () => {
    const json = {
      bone: header, bones: [{ name: 'root' }],
      slots: [{ name: 's', bone: 'root', attachment: 'ghost' }, { name: 'ok', bone: 'root', attachment: 'r' }],
      skins: [{ name: 'default', attachments: { ok: { r: { type: 'region' } } } }, { name: 'alt', attachments: { s: { fist: null } } }],
      animations: [{ name: 'a', timelines: [{ type: 'slot', target: 's', property: 'attachment', keys: [
        { time: 0, value: 'fist' }, { time: 1, value: null }, { time: 2, value: 'ghost2' },
      ] }] }],
    };
    const d = loadSkeletonData(json);
    expect(d.warnings.map((w) => w.pointer)).toEqual(['/slots/0/attachment', '/animations/0/timelines/0/keys/2/value']);
    expect(() => loadSkeletonData(json, { strict: true })).not.toThrow(); // L2 only
  });

  it('cuts every include cycle through a skin (spec 4.4)', () => {
    const d = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }],
      skins: [{ name: 'a', includes: ['b', 'c'] }, { name: 'b', includes: ['a'] }, { name: 'c', includes: ['a'] }],
    });
    const a = d.findSkin('a')!;
    const b = d.findSkin('b')!;
    const c = d.findSkin('c')!;
    expect(a.includes).toEqual([]);
    expect(b.includes).toEqual([a]);
    expect(c.includes).toEqual([a]);
    expect(a.expand().map((s) => s.name)).toEqual(['a']);
    expect(b.expand().map((s) => s.name)).toEqual(['a', 'b']);
    expect(d.warnings.filter((w) => /cycle/.test(w.message)).length).toBe(2);
  });

  it('a parameter with max <= min is frozen at min (spec 8.1, DUVIDAS-SPEC 8)', () => {
    const d = loadSkeletonData({ ...base, parameters: [{ name: 'p', min: 1, max: 0, default: 3 }, { name: 'q', min: 1, max: 0, repeat: true }] });
    const p = d.parameters[0];
    expect(p.max).toBe(1);
    expect(p.default).toBe(1);
    expect(p.constrain(0.5)).toBe(1);
    expect(p.constrain(2)).toBe(1);
    expect(d.parameters[1].constrain(7)).toBe(1);
    expect(d.warnings[0].pointer).toBe('/parameters/0/max');
  });

  it('parseBoneText accepts a BOM and refuses duplicate keys with their pointer (spec 2.1)', () => {
    const text = '\uFEFF' + JSON.stringify(base);
    expect(loadSkeletonFromText(text).bones.length).toBe(1);
    expect(parseBoneText('\uFEFF{"a": 1}')).toEqual({ a: 1 });
    const dup = '{"bone": {"version": "1.0", "minVersion": "1.0", "generator": "g"}, "bones": [{"name": "r"}], "bones": []}';
    expect(() => parseBoneText(dup)).toThrow(LoadError);
    expect(() => parseBoneText(dup)).toThrow('/bones');
    const nested = '{"bone": {"version": "1.0", "version": "1.1"}}';
    expect(() => parseBoneText(nested)).toThrow('/bone/version');
    const inArray = '{"bones": [{"name": "r"}, {"name": "s", "x": 1, "x": 2}]}';
    expect(() => parseBoneText(inArray)).toThrow('/bones/1/x');
    const escaped = '{"a/b": 1, "a\\u002fb": 2}';
    expect(() => parseBoneText(escaped)).toThrow('/a~1b');
    // Strings that look like keys or braces do not confuse the scanner.
    expect(parseBoneText('{"a": "{\\"a\\": 1, \\"a\\": 2}", "b": ["}", "a", "a"]}')).toEqual({ a: '{"a": 1, "a": 2}', b: ['}', 'a', 'a'] });
    expect(() => parseBoneText('{"a": ')).toThrow(LoadError);
    expect(loadAtlasFromText('\uFEFF{"atlas": {"version": "1.0"}, "pages": [{"name": "p", "image": "p.png", "width": 1, "height": 1}], "regions": []}').pages.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Rascunho 0.2: body, clipping que se cruza, crop, rig, alvo que mora em outro lugar
// ---------------------------------------------------------------------------

describe('leitor do rascunho 0.2', () => {
  const h = { version: '1.0', minVersion: '1.0', generator: 'teste 0.2' };
  const base = (animations: unknown[], extra: Record<string, unknown> = {}) => ({
    bone: h, bones: [{ name: 'root' }, { name: 'tronco', parent: 'root' }], animations, ...extra,
  });

  it('a timeline body: valor, uri pelo skeletonsBase, keepSkins padrão true, stepped', () => {
    const d = loadSkeletonData(base([{ name: 'virar', timelines: [{ type: 'body', keys: [
      { time: 0.5, value: 'lobisomem.bone', curve: 'linear' }, { time: 0.8, value: null, keepSkins: false },
    ] }] }], { assets: { skeletonsBase: 'corpos/' } }));
    const anim = d.findAnimation('virar')!;
    const tl = anim.body as BodyTimelineData;
    expect(tl).not.toBeNull();
    expect(tl.keys.values).toEqual([
      { value: 'lobisomem.bone', uri: 'corpos/lobisomem.bone', keepSkins: true },
      { value: null, uri: null, keepSkins: false },
    ]);
    expect(d.warnings.some((w) => w.message.includes('stepped only'))).toBe(true);
  });

  it('chave body em 0 com corpo avisa BODY_AT_START; em 0 com null, não', () => {
    const d1 = loadSkeletonData(base([{ name: 'a', timelines: [{ type: 'body', keys: [{ time: 0, value: 'x.bone' }] }] }]));
    expect(d1.warnings.some((w) => w.message.startsWith('BODY_AT_START'))).toBe(true);
    const d2 = loadSkeletonData(base([{ name: 'a', timelines: [{ type: 'body', keys: [{ time: 0, value: null }] }] }]));
    expect(d2.warnings.some((w) => w.message.startsWith('BODY_AT_START'))).toBe(false);
  });

  it('numa animação com body, alvo que falta não é L1 nem em modo estrito; sem body, é', () => {
    const rabo = { type: 'bone', target: 'rabo', property: 'rotation', keys: [{ time: 0, value: 1 }] };
    const com = loadSkeletonData(base([{ name: 'a', timelines: [{ type: 'body', keys: [{ time: 0.5, value: 'l.bone' }] }, rabo] }]), { strict: true });
    expect(com.warnings.some((w) => w.message.startsWith('BODY_UNMET'))).toBe(true);
    expect(() => loadSkeletonData(base([{ name: 'a', timelines: [rabo] }]), { strict: true })).toThrow(/rabo/);
  });

  it('unmetCode no loadAnimationsFor troca L1 por aviso com o código', () => {
    const d = loadSkeletonData(base([]));
    const r = loadAnimationsFor(d, { animations: [{ name: 'x', timelines: [
      { type: 'slot', target: 'nada', property: 'color', keys: [{ time: 0, value: [1, 1, 1, 1] }] },
    ] }] }, { strict: true, unmetCode: 'BODY_UNMET' });
    expect(r.animations[0].timelines).toHaveLength(0);
    expect(r.warnings[0].message.startsWith('BODY_UNMET: slot "nada"')).toBe(true);
  });

  it('slot/bone vira SlotBoneTimelineData com o transform T·R·S montado', () => {
    const d = loadSkeletonData(base([{ name: 'a', timelines: [{ type: 'slot', target: 's', property: 'bone', keys: [
      { time: 0, value: 'tronco', transform: { x: 3, rotation: 90, scaleY: 2 } },
    ] }] }], { slots: [{ name: 's', bone: 'root' }] }), { strict: true });
    const tl = d.animations[0].timelines[0] as SlotBoneTimelineData;
    const t = tl.keys.values[0].transform!;
    expect(tl.keys.values[0].bone!.name).toBe('tronco');
    expect(t.worldX).toBe(3);
    expect(t.a).toBeCloseTo(0, 12);
    expect(t.b).toBeCloseTo(-2, 12);
    expect(t.c).toBeCloseTo(1, 12);
  });

  it('crop é lido e guardado; largura negativa é RANGE_CROP', () => {
    const d = loadSkeletonData(base([{ name: 'a', crop: { x: -80, y: -10, width: 240, height: 200 }, timelines: [] }, { name: 'b', timelines: [] }]));
    expect(d.findAnimation('a')!.crop).toEqual({ x: -80, y: -10, width: 240, height: 200 });
    expect(d.findAnimation('b')!.crop).toBeNull();
    expect(() => loadSkeletonData(base([{ name: 'a', crop: { width: -1, height: 2 }, timelines: [] }]), { strict: true })).toThrow(/RANGE_CROP/);
  });

  it('rig: nomes, referência, e comprimento zero é RIG_REFERENCE', () => {
    const d = loadSkeletonData(base([], { rig: { name: 'humanoide-v1', bones: ['tronco'], slots: ['corpo'], reference: { bone: 'tronco', length: 60 } } }));
    expect(d.rig).toEqual({ name: 'humanoide-v1', bones: ['tronco'], slots: ['corpo'], reference: { bone: 'tronco', length: 60 } });
    const z = loadSkeletonData(base([], { rig: { reference: { bone: 'tronco', length: 0 } } }));
    expect(z.rig!.reference).toBeNull();
    expect(z.warnings.some((w) => w.message.startsWith('RIG_REFERENCE'))).toBe(true);
    expect(loadSkeletonData(base([])).rig).toBeNull();
  });

  it('assets.animations e assets.skins passam a ser lidos e conferidos como uri', () => {
    const d = loadSkeletonData(base([], { assets: { animations: ['andar.bone'], skins: ['rabo.bone'] } }));
    expect(d.assets.animations).toEqual(['andar.bone']);
    expect(d.assets.skins).toEqual(['rabo.bone']);
    expect(() => loadSkeletonData(base([], { assets: { skins: ['../fora.bone'] } }), { strict: true })).toThrow();
  });

  it('clipping que se cruza avisa CLIP_SELF_INTERSECT; um polígono honesto não', () => {
    const clip = (vertices: number[]) => loadSkeletonData({
      bone: h, bones: [{ name: 'root' }], slots: [{ name: 'c', bone: 'root', attachment: 'c' }],
      skins: [{ name: 'default', attachments: { c: { c: { type: 'clipping', vertices } } } }],
    });
    expect(clip([0, 0, 10, 10, 10, 0, 0, 10]).warnings.some((w) => w.message.startsWith('CLIP_SELF_INTERSECT'))).toBe(true);
    expect(clip([0, 0, 10, 0, 10, 10, 0, 10]).warnings.some((w) => w.message.startsWith('CLIP_SELF_INTERSECT'))).toBe(false);
  });

  it('selfIntersection: triângulo nunca, borboleta sim, côncavo não', () => {
    expect(selfIntersection([0, 0, 1, 0, 0, 1])).toBeNull();
    expect(selfIntersection([0, 0, 10, 10, 10, 0, 0, 10])).toEqual([0, 2]);
    expect(selfIntersection([0, 0, 10, 0, 5, 3, 10, 10, 0, 10])).toBeNull();
  });
});

describe('código do alvo que falta fora da virada (Apêndice C, regra 14)', () => {
  it('TARGET_MISSING na frente da mensagem; continua L1 em modo estrito', () => {
    const def = {
      bone: { version: '1.0', minVersion: '1.0', generator: 't' }, bones: [{ name: 'root' }],
      animations: [{ name: 'a', timelines: [{ type: 'bone', target: 'nada', property: 'x', keys: [{ time: 0, value: 1 }] }] }],
    };
    expect(loadSkeletonData(def).warnings.some((w) => w.message.startsWith('TARGET_MISSING: bone "nada"'))).toBe(true);
    expect(() => loadSkeletonData(def, { strict: true })).toThrow(/TARGET_MISSING/);
  });
});
