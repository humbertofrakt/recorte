import { readFileSync } from 'node:fs';
import { loadSkeletonData, loadAtlas } from '../src/loader.js';
import { Skeleton, Bone } from '../src/skeleton.js';
import { inheritMode } from '../src/data.js';
import { normalizeAngle } from '../src/math.js';
import { registerConstraint, getConstraintFactory } from '../src/constraints/constraint.js';
import '../src/constraints/transform.js';
import '../src/constraints/physics.js';
import type { BoneDef } from '../src/types.js';

const EXAMPLES = process.cwd().replace(/\\/g, '/') + '/formato/exemplos/';

function skeletonFromBones(bones: BoneDef[]): Skeleton {
  const data = loadSkeletonData({
    bone: { version: '1.0', minVersion: '1.0', generator: 'test' },
    bones,
  });
  return new Skeleton(data);
}

function expectMatrix(bone: { a: number; b: number; c: number; d: number; worldX: number; worldY: number }, expected: number[], digits = 5): void {
  expect(bone.a).toBeCloseTo(expected[0], digits);
  expect(bone.b).toBeCloseTo(expected[1], digits);
  expect(bone.c).toBeCloseTo(expected[2], digits);
  expect(bone.d).toBeCloseTo(expected[3], digits);
  expect(bone.worldX).toBeCloseTo(expected[4], digits);
  expect(bone.worldY).toBeCloseTo(expected[5], digits);
}

describe('world transform of a chain (spec 5.4, normal mode)', () => {
  // Hand-computed:
  // root: T(10,20) R(30) S(2,1)      -> a = 2cos30, b = cos120, c = 2sin30, d = sin120
  // child: x 5, shearX 10           -> la = cos10, lb = cos90, lc = sin10, ld = sin90
  // grandchild: y 3, rotation -90    -> la = 0, lb = 1, lc = -1, ld = 0
  const sk = skeletonFromBones([
    { name: 'root', x: 10, y: 20, rotation: 30, scaleX: 2, scaleY: 1 },
    { name: 'child', parent: 'root', x: 5, shearX: 10 },
    { name: 'grand', parent: 'child', y: 3, rotation: -90 },
  ]);

  it('root', () => {
    expectMatrix(sk.bones[0], [1.7320508, -0.5, 1, 0.8660254, 10, 20]);
  });

  it('child with shear', () => {
    // a = pa*cos10 + pb*sin10 = 1.7057370 - 0.0868241 = 1.6189130
    // c = pc*cos10 + pd*sin10 = 0.9848078 + 0.1503837 = 1.1351915
    expectMatrix(sk.bones[1], [1.6189130, -0.5, 1.1351915, 0.8660254, 18.6602540, 25]);
  });

  it('grandchild with rotation -90 (swaps and negates the parent axes)', () => {
    // a = pb*(-1) = 0.5 ; b = pa = 1.6189130 ; c = pd*(-1) = -0.8660254 ; d = pc = 1.1351915
    // worldX = pb*3 + 18.6602540 = 17.1602540 ; worldY = pd*3 + 25 = 27.5980762
    expectMatrix(sk.bones[2], [0.5, 1.6189130, -0.8660254, 1.1351915, 17.1602540, 27.5980762]);
  });

  it('exposes world rotation and scale (spec 3.2)', () => {
    expect(sk.bones[0].worldRotationX).toBeCloseTo(30, 6);
    expect(sk.bones[0].worldScaleX).toBeCloseTo(2, 6);
    expect(sk.bones[0].worldScaleY).toBeCloseTo(1, 6);
  });
});

describe('inherit modes (spec 5.3 / 5.4)', () => {
  // Parent: rotation 90, scale (2, 1) -> pa = 0, pb = -1, pc = 2, pd = 0 (det = 2).
  // Child: x 10, rotation 45 -> la = lc = ld = 0.70711, lb = -0.70711.
  // Translation always uses the full parent matrix: (0, 20).
  function child(flags: Partial<BoneDef>, parentScaleX = 2): Bone {
    const sk = skeletonFromBones([
      { name: 'root', rotation: 90, scaleX: parentScaleX, scaleY: 1 },
      { name: 'child', parent: 'root', x: 10, rotation: 45, ...flags },
    ]);
    return sk.bones[1];
  }

  it('maps the eight boolean combinations to eight modes (F3: none is reserved)', () => {
    expect(inheritMode(true, true, true)).toBe('normal');
    expect(inheritMode(false, false, false)).toBe('onlyTranslation');
    expect(inheritMode(false, true, false)).toBe('noRotationOrReflection');
    expect(inheritMode(true, false, true)).toBe('noScale');
    expect(inheritMode(true, false, false)).toBe('noScaleOrReflection');
    expect(inheritMode(false, true, true)).toBe('noRotation');
    expect(inheritMode(true, true, false)).toBe('noReflection');
    expect(inheritMode(false, false, true)).toBe('onlyReflection');
  });

  it('normal', () => {
    // a = pb*lc = -0.70711 ; b = pb*ld = -0.70711 ; c = pc*la = 1.41421 ; d = pc*lb = -1.41421
    expectMatrix(child({}), [-0.7071068, -0.7071068, 1.4142136, -1.4142136, 0, 20]);
  });

  it('onlyTranslation', () => {
    expectMatrix(child({ inheritRotation: false, inheritScale: false, inheritReflection: false }),
      [0.7071068, -0.7071068, 0.7071068, 0.7071068, 0, 20]);
  });

  it('noRotationOrReflection', () => {
    // s = |det| / (pa^2 + pc^2) = 2/4 = 0.5 ; pa = 0, pc = 2, pb = pc*s = 1, pd = 0 ; prx = atan2d(2, 0) = 90
    // rx = 45 - 90 = -45 ; ry = 45 - 90 + 90 = 45
    // a = pa*la - pb*lc = -(1)(-0.70711) = 0.70711 ; b = -pb*ld = -0.70711 ; c = pc*la = 1.41421 ; d = pc*lb = 1.41421
    expectMatrix(child({ inheritRotation: false, inheritScale: true, inheritReflection: false }),
      [0.7071068, -0.7071068, 1.4142136, 1.4142136, 0, 20]);
  });

  it('noScale keeps the direction of the parent transform and unit scale', () => {
    // za = pa*cos45 + pb*sin45 = -0.70711 ; zc = pc*cos45 + pd*sin45 = 1.41421 ; normalized: (-0.44721, 0.89443)
    // r = atan2(zc, za) + 90deg = 116.565 + 90 = 206.565deg ; zb = cos r = -0.89443 ; zd = sin r = -0.44721
    // la = 1, lb = 0, lc = 0, ld = 1 -> a = za, b = zb, c = zc, d = zd
    const b = child({ inheritRotation: true, inheritScale: false, inheritReflection: true });
    expectMatrix(b, [-0.4472136, -0.8944272, 0.8944272, -0.4472136, 0, 20]);
    expect(b.worldScaleX).toBeCloseTo(1, 6);
    expect(b.worldRotationX).toBeCloseTo(116.565051, 4);
  });

  it('noScaleOrReflection equals noScale when the parent is not reflected', () => {
    expectMatrix(child({ inheritRotation: true, inheritScale: false, inheritReflection: false }),
      [-0.4472136, -0.8944272, 0.8944272, -0.4472136, 0, 20]);
  });

  it('noScale inherits the parent reflection, noScaleOrReflection does not', () => {
    // Parent scaleX = -2: pa = 0, pb = -1, pc = -2, pd = 0 (det = -2).
    // za = -0.70711, zc = -1.41421 -> normalized (-0.44721, -0.89443)
    // r = atan2(-0.89443, -0.44721) + 90deg = -116.565 + 90 = -26.565deg
    // noScale: s = -1 -> zb = -cos r = -0.89443 ; zd = -sin r = 0.44721
    const reflected = child({ inheritRotation: true, inheritScale: false, inheritReflection: true }, -2);
    expectMatrix(reflected, [-0.4472136, -0.8944272, -0.8944272, 0.4472136, 0, -20]);
    expect(reflected.a * reflected.d - reflected.b * reflected.c).toBeCloseTo(-1, 6);
    // noScaleOrReflection: s = +1 -> zb = 0.89443 ; zd = -0.44721
    const upright = child({ inheritRotation: true, inheritScale: false, inheritReflection: false }, -2);
    expectMatrix(upright, [-0.4472136, 0.8944272, -0.8944272, -0.4472136, 0, -20]);
    expect(upright.a * upright.d - upright.b * upright.c).toBeCloseTo(1, 6);
  });

  it('inherit* changes made on the local pose take effect on the next update', () => {
    const sk = skeletonFromBones([
      { name: 'root', rotation: 90, scaleX: 2 },
      { name: 'child', parent: 'root', x: 10, rotation: 45 },
    ]);
    const c = sk.bones[1];
    c.inheritRotation = false;
    c.inheritScale = false;
    c.inheritReflection = false;
    sk.updateWorldTransform();
    expectMatrix(c, [0.7071068, -0.7071068, 0.7071068, 0.7071068, 0, 20]);
  });
});

describe('world <-> local (spec 5.5)', () => {
  const sk = skeletonFromBones([
    { name: 'root', x: 10, y: 20, rotation: 30, scaleX: 2, scaleY: 1 },
    { name: 'child', parent: 'root', x: 5, shearX: 10 },
    { name: 'grand', parent: 'child', y: 3, rotation: -90, scaleX: 0.5, scaleY: 3 },
  ]);

  it('worldToLocal(localToWorld(p)) = p on every bone of the chain', () => {
    for (const bone of sk.bones) {
      for (const [lx, ly] of [[0, 0], [7, -3], [-12.5, 40]]) {
        const w = bone.localToWorld(lx, ly);
        const l = bone.worldToLocal(w.x, w.y);
        expect(l.x).toBeCloseTo(lx, 9);
        expect(l.y).toBeCloseTo(ly, 9);
      }
    }
  });

  it('localToWorld matches the matrix formula', () => {
    const b = sk.bones[2];
    const w = b.localToWorld(2, -1);
    expect(w.x).toBeCloseTo(b.a * 2 + b.b * -1 + b.worldX, 12);
    expect(w.y).toBeCloseTo(b.c * 2 + b.d * -1 + b.worldY, 12);
  });

  it('worldToLocal returns (0, 0) when the scale is 0 (determinant guard)', () => {
    const flat = skeletonFromBones([
      { name: 'root' },
      { name: 'zero', parent: 'root', x: 5, scaleX: 0, scaleY: 0 },
      { name: 'leaf', parent: 'zero', x: 1 },
    ]);
    const zero = flat.bones[1];
    expect(zero.a).toBe(0);
    expect(zero.worldToLocal(100, 100)).toEqual({ x: 0, y: 0 });
    // A child of a degenerate parent gets an applied pose of finite numbers (pid = 0).
    const leaf = flat.bones[2];
    leaf.updateAppliedTransform();
    for (const v of [leaf.ax, leaf.ay, leaf.arotation, leaf.ascaleX, leaf.ascaleY, leaf.ashearX, leaf.ashearY]) {
      expect(Number.isFinite(v)).toBe(true);
    }
    expect(leaf.ax).toBe(0);
    expect(leaf.ascaleX).toBe(0);
  });

  it('appliedFromWorld recovers the applied pose of a normal-mode child', () => {
    const sk2 = skeletonFromBones([
      { name: 'root', x: 3, y: -4, rotation: 20, scaleX: 1.5, scaleY: 0.75 },
      { name: 'child', parent: 'root', x: 8, y: 2, rotation: 30, scaleX: 1.5, scaleY: 0.8, shearY: 10 },
    ]);
    const c = sk2.bones[1];
    c.updateAppliedTransform();
    expect(c.ax).toBeCloseTo(8, 6);
    expect(c.ay).toBeCloseTo(2, 6);
    expect(normalizeAngle(c.arotation - 30)).toBeCloseTo(0, 6);
    expect(c.ascaleX).toBeCloseTo(1.5, 6);
    // Spine's decomposition (spec 5.5): scaleY = det / scaleX = scaleY * cos(shearY). Not exact under shear.
    expect(c.ascaleY).toBeCloseTo(0.8 * Math.cos(10 * Math.PI / 180), 6);
    expect(c.ashearX).toBe(0);
    expect(c.ashearY).toBeCloseTo(10, 6);
  });

  it('appliedFromWorld is an exact inverse without shear', () => {
    const sk2 = skeletonFromBones([
      { name: 'root', x: 3, y: -4, rotation: 20, scaleX: 1.5, scaleY: 0.75 },
      { name: 'child', parent: 'root', x: 8, y: 2, rotation: -50, scaleX: 1.5, scaleY: 0.8 },
    ]);
    const c = sk2.bones[1];
    const before = [c.a, c.b, c.c, c.d, c.worldX, c.worldY];
    c.updateAppliedTransform();
    expect(c.ascaleY).toBeCloseTo(0.8, 9);
    expect(c.ashearY).toBeCloseTo(0, 9);
    c.updateWorldTransform();
    expectMatrix(c, before, 9);
  });

  it('appliedFromWorld recovers the pose of the root with the skeleton offset', () => {
    const sk2 = skeletonFromBones([{ name: 'root', x: 3, y: -4, rotation: 20, scaleX: 1.5, scaleY: 0.75 }]);
    sk2.x = 100;
    sk2.y = 50;
    sk2.updateWorldTransform();
    const r = sk2.bones[0];
    expect(r.worldX).toBeCloseTo(103, 9);
    r.updateAppliedTransform();
    expect(r.ax).toBeCloseTo(3, 9);
    expect(r.ay).toBeCloseTo(-4, 9);
    expect(r.arotation).toBeCloseTo(20, 9);
    expect(r.ascaleX).toBeCloseTo(1.5, 9);
    expect(r.ascaleY).toBeCloseTo(0.75, 9);
  });

  it('rotation helpers round-trip', () => {
    const c = sk.bones[1];
    const world = c.localToWorldRotation(15);
    expect(normalizeAngle(c.worldToLocalRotation(world) - 15)).toBeCloseTo(0, 6);
  });

  it('documents the root shearY sign of spec 5.5 (DUVIDAS-SPEC 10)', () => {
    // Root, rotation 0, shearY 30, scale 1: b = cos120 = -0.5, d = sin120 = 0.866, a = 1, c = 0.
    // Spec 5.5 root branch: shearY = atan2d(a*b + c*d, a*d - b*c) = atan2d(-0.5, 0.866) = -30,
    // the OPPOSITE sign of the value that produced the matrix (+30). The non-root branch
    // (-atan2d(...)) gives +30. The runtime ports the spec (and Spine 4.2) as written;
    // this test pins the behaviour until the spec decides.
    const root = skeletonFromBones([{ name: 'root', shearY: 30 }]).bones[0];
    expect(root.b).toBeCloseTo(-0.5, 9);
    expect(root.d).toBeCloseTo(0.8660254, 6);
    root.updateAppliedTransform();
    expect(root.ashearY).toBeCloseTo(-30, 6);
    // The same pose under a parent recovers +30.
    const child = skeletonFromBones([{ name: 'root' }, { name: 'c', parent: 'root', shearY: 30 }]).bones[1];
    child.updateAppliedTransform();
    expect(child.ashearY).toBeCloseTo(30, 6);
  });
});

describe('Skeleton (spec 5.6, 4.4)', () => {
  const skeletonJson = JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8'));
  const atlasJson = JSON.parse(readFileSync(EXAMPLES + 'heroi.atlas.json', 'utf8'));
  const atlas = loadAtlas(atlasJson);
  const data = loadSkeletonData(skeletonJson, { atlases: [atlas] });

  it('builds bones, slots, draw order and constraints from the data', () => {
    const sk = new Skeleton(data);
    expect(sk.bones.length).toBe(18);
    expect(sk.slots.length).toBe(23);
    expect(sk.drawOrder.map((s) => s.data.name)).toEqual(data.slots.map((s) => s.name));
    expect(sk.constraints.map((c) => c.data.type)).toEqual(['ik', 'transform', 'path', 'physics', 'driver']);
    expect(sk.findBone('torso')!.parent).toBe(sk.findBone('hips'));
    expect(sk.findBone('hips')!.children.map((b) => b.data.name)).toEqual(['torso', 'leg', 'leg_b']);
    expect(sk.findSlot('hand')!.attachment?.name).toBe('hand');
    expect(sk.findSlot('hand')!.bone).toBe(sk.findBone('forearm'));
  });

  it('computes the world pose of the setup (torso up, head at the top)', () => {
    const sk = new Skeleton(data);
    const hips = sk.findBone('hips')!;
    const torso = sk.findBone('torso')!;
    const head = sk.findBone('head')!;
    expect(hips.worldY).toBeCloseTo(90, 9);
    expect(torso.worldRotationX).toBeCloseTo(90, 9);
    expect(head.worldX).toBeCloseTo(0, 9);
    expect(head.worldY).toBeCloseTo(160, 9);
    // hand_target uses onlyTranslation: keeps its own axes.
    const target = sk.findBone('hand_target')!;
    expectMatrix(target, [1, 0, 0, 1, 30, 60]);
  });

  it('applies local changes on updateWorldTransform and keeps applied = local without constraints', () => {
    const sk = new Skeleton(data);
    for (const c of sk.constraints) c.active = false; // the example has a real transform constraint on the head
    const hips = sk.findBone('hips')!;
    hips.y = 80;
    hips.rotation = 10;
    sk.updateWorldTransform();
    expect(hips.ay).toBe(80);
    expect(hips.arotation).toBe(10);
    expect(hips.worldY).toBeCloseTo(80, 9);
    expect(sk.findBone('head')!.worldRotationX).toBeCloseTo(100, 9);
    sk.setToSetupPose();
    sk.updateWorldTransform();
    expect(hips.worldY).toBeCloseTo(90, 9);
  });

  it('scales and offsets the whole skeleton', () => {
    const sk = new Skeleton(data);
    sk.x = 100;
    sk.scaleX = -1;
    sk.updateWorldTransform();
    expect(sk.findBone('hips')!.worldX).toBeCloseTo(100, 9);
    expect(sk.findBone('hand_target')!.worldX).toBeCloseTo(70, 9);
    expect(sk.findBone('hand_target')!.a).toBeCloseTo(-1, 9);
  });

  it('marks descendants dirty when a bone is recomputed by a constraint-like write', () => {
    const sk = new Skeleton(data);
    const torso = sk.findBone('torso')!;
    const head = sk.findBone('head')!;
    torso.arotation = 0;
    torso.updateWorldTransform();
    expect(head.dirty).toBe(true);
    sk.updateDirtyBones();
    expect(head.dirty).toBe(false);
    expect(head.worldX).toBeCloseTo(70, 9);
    expect(head.worldY).toBeCloseTo(90, 9);
  });

  it('combines skins: the last one wins and null hides (spec 4.4)', () => {
    const sk = new Skeleton(data);
    expect(sk.findSlot('hair')!.attachment).not.toBeNull();
    expect(sk.findSlot('body')!.attachment).toBe(data.defaultSkin.getAttachment(10, 'body'));
    sk.setSkin('armadura');
    expect(sk.findSlot('hair')!.attachment).toBeNull();
    expect(sk.findSlot('body')!.attachment).toBe(data.findSkin('armadura')!.getAttachment(10, 'body'));
    expect(sk.findSlot('head')!.attachment!.type).toBe('linkedmesh');
    // Not overridden by the skin: falls through to default.
    expect(sk.findSlot('arm')!.attachment).toBe(data.defaultSkin.getAttachment(15, 'arm'));
    // armadura_capa includes armadura.
    sk.setSkin(['armadura_capa']);
    expect(sk.findSlot('body')!.attachment).toBe(data.findSkin('armadura')!.getAttachment(10, 'body'));
    expect(sk.findSlot('hair')!.attachment).toBeNull();
    sk.setSkin(null);
    expect(sk.findSlot('hair')!.attachment!.type).toBe('region');
    expect(() => sk.setSkin('nope')).toThrow();
  });

  it('setAttachment resolves placeholders through the active skins', () => {
    const sk = new Skeleton(data);
    sk.setAttachment('hand', 'hand_fist');
    expect(sk.findSlot('hand')!.attachment!.name).toBe('hand_fist');
    sk.setAttachment('hand', 'does_not_exist');
    expect(sk.findSlot('hand')!.attachment).toBeNull();
    sk.setAttachment('hand', null);
    expect(sk.findSlot('hand')!.attachmentName).toBeNull();
    sk.setSlotsToSetupPose();
    expect(sk.findSlot('hand')!.attachment!.name).toBe('hand');
  });

  it('resets parameters, morphs, variables and tags on setToSetupPose', () => {
    const sk = new Skeleton(data);
    expect(sk.parameters[0]).toBe(0);
    expect(sk.variables).toEqual([0, true]);
    sk.parameters[0] = 0.5;
    sk.morphWeights[0] = 1;
    sk.variables[1] = false;
    sk.tags = ['idle'];
    sk.setToSetupPose();
    expect(sk.parameters[0]).toBe(0);
    expect(sk.morphWeights[0]).toBe(0);
    expect(sk.variables[1]).toBe(true);
    expect(sk.tags).toEqual([]);
  });

  it('computes bounds from region, mesh and bounding box attachments', () => {
    const sk = new Skeleton(data);
    const b = sk.getBounds();
    expect(b.width).toBeGreaterThan(0);
    expect(b.height).toBeGreaterThan(0);
    // The body region (80 x 120 around torso center 35 along +X of a bone pointing up) spans y in [65, 185].
    expect(b.y).toBeLessThanOrEqual(65 + 1e-9);
    expect(b.y + b.height).toBeGreaterThanOrEqual(185 - 1e-9);
    for (const slot of sk.slots) slot.visible = false;
    expect(sk.getBounds()).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('skips skinRequired constraints not listed by the active skins', () => {
    const d = loadSkeletonData({
      bone: { version: '1.0', minVersion: '1.0', generator: 'test' },
      bones: [{ name: 'root' }, { name: 'a', parent: 'root', x: 10 }, { name: 't', parent: 'root', x: 20 }],
      constraints: [{ type: 'transform', name: 'c', bones: ['a'], target: 't', skinRequired: true }],
      skins: [{ name: 'default' }, { name: 's', constraints: ['c'] }],
    });
    // Spy factory: counts how many times `update` runs.
    const original = getConstraintFactory('transform')!;
    let updates = 0;
    registerConstraint('transform', (cd) => ({
      data: cd, active: true, mix: cd.mix,
      update() { updates++; },
      reset() { /* stateless */ },
      setToSetupPose() { /* nothing */ },
    }));
    try {
      const sk = new Skeleton(d); // the constructor runs one updateWorldTransform: skin not active -> 0
      expect(sk.activeSkinConstraints.size).toBe(0);
      sk.updateWorldTransform();
      expect(updates).toBe(0);
      sk.setSkin('s');
      expect(sk.activeSkinConstraints.has(d.constraints[0])).toBe(true);
      sk.updateWorldTransform();
      expect(updates).toBe(1);
      sk.constraints[0].mix = 0; // mix 0 also skips (spec 5.6)
      sk.updateWorldTransform();
      expect(updates).toBe(1);
    } finally {
      registerConstraint('transform', original);
    }
  });

  it('updateWorldTransform(now) drives the clock; advance(dt) adds to it (spec 5.6, 6.5)', () => {
    const sk = new Skeleton(data);
    expect(sk.time).toBe(0);
    sk.updateWorldTransform(); // pose only: the clock does not move
    expect(sk.time).toBe(0);
    sk.updateWorldTransform(1.5);
    expect(sk.time).toBe(1.5);
    sk.advance(0.25);
    expect(sk.time).toBe(1.75);
    sk.advance(-1); // negative deltas are ignored
    expect(sk.time).toBe(1.75);
    // Physics keeps lastTime = now (spec 6.5): a repeated `now` means delta 0.
    const phys = sk.constraints.find((c) => c.data.type === 'physics') as unknown as { lastTime: number; remaining: number };
    expect(phys.lastTime).toBe(1.75);
    const remaining = phys.remaining;
    sk.updateWorldTransform(1.75);
    expect(phys.remaining).toBe(remaining); // delta 0: nothing accumulated
    expect(phys.lastTime).toBe(1.75);
  });

  it('a constraint that writes a bone can read a descendant after updateWorldTransformWithChildren (spec 5.6)', () => {
    const d = loadSkeletonData({
      bone: { version: '1.0', minVersion: '1.0', generator: 'test' },
      bones: [
        { name: 'root' }, { name: 'top', parent: 'root', x: 10 }, { name: 'mid', parent: 'top', x: 10 },
        { name: 'leaf', parent: 'mid', x: 10 }, { name: 'sibling', parent: 'root', x: 5 },
      ],
      constraints: [{ type: 'transform', name: 'c', bones: ['top'], target: 'sibling' }],
    });
    const original = getConstraintFactory('transform')!;
    let leafXInsideUpdate = Number.NaN;
    let siblingDirty = false;
    registerConstraint('transform', (cd, skeleton) => ({
      data: cd, active: true, mix: 1,
      update() {
        const top = skeleton.findBone('top')!;
        top.arotation = 90; // writes the top of the chain...
        top.updateWorldTransformWithChildren(); // ...then recomputes the subtree in order
        leafXInsideUpdate = skeleton.findBone('leaf')!.worldX; // grandchild is fresh
        siblingDirty = skeleton.findBone('sibling')!.dirty; // untouched bones stay clean
      },
      reset() { /* stateless */ },
      setToSetupPose() { /* nothing */ },
    }));
    try {
      const sk = new Skeleton(d);
      // top at (10, 0) rotated 90: mid at (10, 10), leaf at (10, 20).
      expect(leafXInsideUpdate).toBeCloseTo(10, 9);
      expect(sk.findBone('leaf')!.worldY).toBeCloseTo(20, 9);
      expect(siblingDirty).toBe(false);
      expect(sk.findBone('leaf')!.isDescendantOf(sk.findBone('top')!)).toBe(true);
      expect(sk.findBone('sibling')!.isDescendantOf(sk.findBone('top')!)).toBe(false);
    } finally {
      registerConstraint('transform', original);
    }
  });
});

// ---------------------------------------------------------------------------
// A pilha de peles (spec 4.4, rascunho 0.2): a default é uma pele como as outras
// ---------------------------------------------------------------------------

describe('pilha de peles (4.4, rascunho 0.2)', () => {
  const pilhaHeader = { version: '1.0', minVersion: '1.0', generator: 'teste pilha' };
  function vestido(): Skeleton {
    return new Skeleton(loadSkeletonData({
      bone: pilhaHeader,
      bones: [{ name: 'root' }],
      slots: [{ name: 'corpo', bone: 'root', attachment: 'corpo' }, { name: 'capa', bone: 'root', attachment: 'capa' }],
      skins: [
        { name: 'default', attachments: {
          corpo: { corpo: { type: 'region', width: 10, height: 10 } },
          capa: { capa: { type: 'region', width: 6, height: 6 } },
        } },
        { name: 'armadura', attachments: { corpo: { corpo: { type: 'region', width: 20, height: 30 } } } },
        { name: 'nua', attachments: { capa: { capa: null } } },
      ],
    }));
  }
  const largura = (sk: Skeleton, slot: string): number | null => {
    const att = sk.findSlot(slot)!.attachment as { width?: number } | null;
    return att === null ? null : att.width ?? null;
  };

  it('um esqueleto novo nasce com a pilha ["default"]', () => {
    const sk = vestido();
    expect(sk.skinStack.map((s) => s.name)).toEqual(['default']);
    expect(largura(sk, 'corpo')).toBe(10);
    expect(largura(sk, 'capa')).toBe(6);
  });

  it('fora da pilha a default não está ativa: o placeholder que só ela dá fica vazio', () => {
    const sk = vestido();
    sk.setSkinStack(['armadura']);
    expect(largura(sk, 'corpo')).toBe(20);
    expect(sk.findSlot('capa')!.attachment).toBeNull();
    expect(sk.findSlot('capa')!.attachmentName).toBe('capa');
  });

  it('a de cima vence, nas duas ordens', () => {
    const sk = vestido();
    sk.setSkinStack(['default', 'armadura']);
    expect(largura(sk, 'corpo')).toBe(20);
    sk.setSkinStack(['armadura', 'default']);
    expect(largura(sk, 'corpo')).toBe(10);
  });

  it('null numa pele de cima esconde o que a de baixo dava', () => {
    const sk = vestido();
    sk.setSkinStack(['default', 'nua']);
    expect(sk.findSlot('capa')!.attachment).toBeNull();
    sk.setSkinStack(['nua', 'default']);
    expect(largura(sk, 'capa')).toBe(6);
  });

  it('pilha vazia não mostra pele nenhuma, e nome desconhecido lança', () => {
    const sk = vestido();
    sk.setSkinStack([]);
    expect(sk.findSlot('corpo')!.attachment).toBeNull();
    expect(() => sk.setSkinStack(['nope'])).toThrow(/skin not found/);
    expect(sk.skinStack).toHaveLength(0);
  });

  it('setSkin continua pondo a default por baixo, e activeSkins não a lista (o editor conta com isso)', () => {
    const sk = vestido();
    sk.setSkin(['armadura']);
    expect(sk.skinStack.map((s) => s.name)).toEqual(['default', 'armadura']);
    expect(sk.activeSkins.map((s) => s.name)).toEqual(['armadura']);
    expect(largura(sk, 'capa')).toBe(6);
    sk.setSkin(null);
    expect(sk.skinStack.map((s) => s.name)).toEqual(['default']);
  });

  it('addSkin empilha por cima sem remontar o esqueleto', () => {
    const sk = vestido();
    const bones = sk.bones;
    sk.addSkin('armadura');
    expect(sk.skinStack.map((s) => s.name)).toEqual(['default', 'armadura']);
    expect(sk.bones).toBe(bones);
  });
});
