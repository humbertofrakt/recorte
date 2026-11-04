/**
 * Transform constraint (spec 6.3). Every expected value below is computed by
 * hand from the spec pseudocode, in the comments, never copied from output.
 */

import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { TransformConstraint } from '../src/constraints/transform.js';
import type { BoneDef, ConstraintDef } from '../src/types.js';

function build(bones: BoneDef[], constraints: ConstraintDef[]): Skeleton {
  const data = loadSkeletonData({
    bone: { version: '1.0', minVersion: '1.0', generator: 'test' },
    bones,
    constraints,
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

/** Only the given mixes are non-zero; every other per-property mix is 0. */
function only(mixes: Partial<Record<'mixRotation' | 'mixX' | 'mixY' | 'mixScaleX' | 'mixScaleY' | 'mixShearY', number>>) {
  return { mixRotation: 0, mixX: 0, mixY: 0, mixScaleX: 0, mixScaleY: 0, mixShearY: 0, ...mixes };
}

const SQ2 = Math.SQRT1_2; // cos 45 = sin 45 = 0.7071068

// Target: rotation 90 at (10, 0) under an identity root.
//   rotY = 90 + 90 = 180 -> ta = cos90 = 0, tb = cos180 = -1, tc = sin90 = 1, td = sin180 = 0
//   target matrix [0 -1; 1 0], worldX 10, worldY 0
const ROOT: BoneDef = { name: 'root' };
const TARGET_R90: BoneDef = { name: 'target', parent: 'root', x: 10, rotation: 90 };

describe('registration', () => {
  it('replaces the noop factory for type "transform"', () => {
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target' },
    ]);
    const c = sk.findConstraint('t');
    expect(c).toBeInstanceOf(TransformConstraint);
    expect((c as TransformConstraint).target.data.name).toBe('target');
    expect((c as TransformConstraint).bones.map((b) => b.data.name)).toEqual(['bone']);
  });
});

describe('world absolute: rotation', () => {
  // bone: identity at (0, 0) -> a 1, b 0, c 0, d 1
  // r = normalize(atan2(tc, ta) - atan2(c, a) + 0) * mR = (PI/2 - 0) * mR

  it('copies the target rotation with mix 1', () => {
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', ...only({ mixRotation: 1 }) },
    ]);
    // r = PI/2 -> cos 0, sin 1
    // a' = 0*1 - 1*0 = 0 ; b' = 0*0 - 1*1 = -1 ; c' = 1*1 + 0*0 = 1 ; d' = 1*0 + 0*1 = 0
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [0, -1, 1, 0, 0, 0]);
    // appliedFromWorld (parent identity): rotation = atan2d(rc, ra) = atan2d(1, 0) = 90
    //   scaleX = sqrt(0 + 1) = 1 ; det = 0*0 - (-1)(1) = 1 ; scaleY = 1 ; shearY = -atan2d(0, 1) = 0
    expect(bone.arotation).toBeCloseTo(90, 5);
    expect(bone.ascaleX).toBeCloseTo(1, 5);
    expect(bone.ascaleY).toBeCloseTo(1, 5);
    expect(bone.ashearY).toBeCloseTo(0, 5);
    expect(bone.ax).toBeCloseTo(0, 5);
    expect(bone.ay).toBeCloseTo(0, 5);
  });

  it('goes halfway with mixRotation 0.5', () => {
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', ...only({ mixRotation: 0.5 }) },
    ]);
    // r = PI/4 -> cos = sin = 0.7071068
    // a' = cos ; b' = -sin ; c' = sin ; d' = cos
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [SQ2, -SQ2, SQ2, SQ2, 0, 0]);
    expect(bone.arotation).toBeCloseTo(45, 5);
  });

  it('multiplies the general mix into the property mix (mix 0.5 x mixRotation 0.5)', () => {
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', mix: 0.5, ...only({ mixRotation: 0.5 }) },
    ]);
    // mR = 0.25 -> r = PI/8 = 22.5 deg -> cos 0.9238795, sin 0.3826834
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [0.9238795, -0.3826834, 0.3826834, 0.9238795, 0, 0]);
    expect(bone.arotation).toBeCloseTo(22.5, 5);
  });

  it('never writes the local pose and does not accumulate between frames', () => {
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', ...only({ mixRotation: 0.5 }) },
    ]);
    const bone = sk.findBone('bone')!;
    sk.updateWorldTransform();
    sk.updateWorldTransform();
    expect(bone.rotation).toBe(0);
    expect(bone.arotation).toBeCloseTo(45, 5);
  });

  it('flips offsetRotation when the target is reflected', () => {
    // target scaleX -1, rotation 0: ta = -1, tb = 0, tc = 0, td = 1 ; det = -1 < 0 -> reflect = -DEG2RAD
    // offR = 30 * (-DEG2RAD) = -PI/6
    // r = normalize(atan2(0, -1) - atan2(0, 1) - PI/6) = PI - PI/6 = 5PI/6 = 150 deg
    // a' = cos150 = -0.8660254 ; b' = -sin150 = -0.5 ; c' = sin150 = 0.5 ; d' = cos150 = -0.8660254
    const sk = build([ROOT, { name: 'target', parent: 'root', scaleX: -1 }, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', offsetRotation: 30, ...only({ mixRotation: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [-0.8660254, -0.5, 0.5, -0.8660254, 0, 0]);
    expect(bone.arotation).toBeCloseTo(150, 5);
  });
});

describe('world absolute: position, scale, shear', () => {
  it('moves towards localToWorld(target, offset) with mixX 1 and mixY 0.5', () => {
    // localToWorld(target, 5, 0) = (ta*5 + tb*0 + 10, tc*5 + td*0 + 0) = (10, 5)
    // worldX = 0 + (10 - 0) * 1 = 10 ; worldY = 0 + (5 - 0) * 0.5 = 2.5
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', offsetX: 5, ...only({ mixX: 1, mixY: 0.5 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [1, 0, 0, 1, 10, 2.5]);
    expect(bone.ax).toBeCloseTo(10, 5);
    expect(bone.ay).toBeCloseTo(2.5, 5);
  });

  it('scales X towards the target scale plus offset', () => {
    // target scaleX 3, rotation 0: ta = 3, tc = 0 -> sqrt(ta^2 + tc^2) = 3
    // bone identity: s = sqrt(1 + 0) = 1
    // s = (1 + (3 - 1 + 0.5) * 0.5) / 1 = 2.25 -> a = 2.25, c = 0
    const sk = build([ROOT, { name: 'target', parent: 'root', scaleX: 3 }, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', offsetScaleX: 0.5, ...only({ mixScaleX: 0.5 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [2.25, 0, 0, 1, 0, 0]);
    expect(bone.ascaleX).toBeCloseTo(2.25, 5);
    expect(bone.ascaleY).toBeCloseTo(1, 5);
  });

  it('scales Y fully with mixScaleY 1', () => {
    // target scaleY 2: tb = cos90 * 2 = 0, td = sin90 * 2 = 2 -> sqrt = 2
    // bone: s = 1 ; s = (1 + (2 - 1 + 0) * 1) / 1 = 2 -> b = 0, d = 2
    const sk = build([ROOT, { name: 'target', parent: 'root', scaleY: 2 }, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', ...only({ mixScaleY: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [1, 0, 0, 2, 0, 0]);
    expect(bone.ascaleY).toBeCloseTo(2, 5);
  });

  it('copies the target shear Y', () => {
    // target shearY 30 (rotation 0, scale 1): ta = 1, tb = cos120 = -0.5, tc = 0, td = sin120 = 0.8660254
    // bone identity: b = 0, d = 1 -> by = atan2(1, 0) = PI/2
    // r = normalize(atan2(td, tb) - atan2(tc, ta) - (by - atan2(c, a))) = 2PI/3 - 0 - PI/2 = PI/6
    // r = by + (PI/6 + 0) * 1 = 2PI/3 ; s = 1 -> b = cos120 = -0.5, d = sin120 = 0.8660254
    const sk = build([ROOT, { name: 'target', parent: 'root', shearY: 30 }, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', ...only({ mixShearY: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [1, -0.5, 0, 0.8660254, 0, 0]);
    // appliedFromWorld: scaleX = 1 ; det = 1*0.866 - (-0.5)(0) = 0.8660254
    //   shearY = -atan2d(ra*rb + rc*rd, det) = -atan2d(-0.5, 0.8660254) = 30
    //   scaleY = det / scaleX = 0.8660254 (cos 30; see DUVIDAS-SPEC 3)
    expect(bone.ashearY).toBeCloseTo(30, 5);
    expect(bone.arotation).toBeCloseTo(0, 5);
    expect(bone.ascaleY).toBeCloseTo(0.8660254, 5);
  });
});

describe('world relative', () => {
  // target at (10, 20) rotation 90 -> matrix [0 -1; 1 0], worldX 10, worldY 20
  const TARGET_R90_AT_10_20: BoneDef = { name: 'target', parent: 'root', x: 10, y: 20, rotation: 90 };

  it('adds the whole localToWorld(target, offset), target position included (correction I3)', () => {
    // localToWorld(target, 5, 0) = (0*5 + (-1)*0 + 10, 1*5 + 0*0 + 20) = (10, 25)
    // bone at (3, 4): worldX = 3 + 10 * 1 = 13 ; worldY = 4 + 25 * 1 = 29
    const sk = build([ROOT, TARGET_R90_AT_10_20, { name: 'bone', parent: 'root', x: 3, y: 4 }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', relative: true, offsetX: 5, ...only({ mixX: 1, mixY: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [1, 0, 0, 1, 13, 29]);
    expect(bone.ax).toBeCloseTo(13, 5);
    expect(bone.ay).toBeCloseTo(29, 5);
  });

  it('adds the target rotation instead of moving towards it', () => {
    // bone rotation 30: a = cos30 = 0.8660254, b = -sin30 = -0.5, c = sin30 = 0.5, d = cos30 = 0.8660254
    // r = normalize(atan2(tc, ta) + 0) * 1 = PI/2 -> cos 0, sin 1
    // a' = -c = -0.5 ; b' = -d = -0.8660254 ; c' = a = 0.8660254 ; d' = b = -0.5   (30 + 90 = 120 deg)
    const sk = build([ROOT, TARGET_R90_AT_10_20, { name: 'bone', parent: 'root', rotation: 30 }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', relative: true, ...only({ mixRotation: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [-0.5, -0.8660254, 0.8660254, -0.5, 0, 0]);
    expect(bone.arotation).toBeCloseTo(120, 5);
  });

  it('multiplies the scale by (targetScale - 1 + offset) * mix + 1', () => {
    // target scaleX 3: sqrt(ta^2 + tc^2) = 3 ; s = (3 - 1 + 0) * 0.5 + 1 = 2
    // bone scaleX 2: a = 2 * 2 = 4, c = 0
    const sk = build([ROOT, { name: 'target', parent: 'root', scaleX: 3 }, { name: 'bone', parent: 'root', scaleX: 2 }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', relative: true, ...only({ mixScaleX: 0.5 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [4, 0, 0, 1, 0, 0]);
    expect(bone.ascaleX).toBeCloseTo(4, 5);
  });

  it('adds the target shear Y to the bone shear Y', () => {
    // target shearY 30: tb = cos120 = -0.5, td = sin120 = 0.8660254 ; ta = 1, tc = 0
    // r = normalize(atan2(td, tb) - atan2(tc, ta)) = 2PI/3
    // bone shearY 10: b = cos100 = -0.1736482, d = sin100 = 0.9848078 ; atan2(d, b) = 100 deg
    // r = 100deg + (120deg - 90deg + 0) * 1 = 130 deg ; s = 1 -> b = cos130 = -0.6427876, d = sin130 = 0.7660444
    const sk = build([ROOT, { name: 'target', parent: 'root', shearY: 30 }, { name: 'bone', parent: 'root', shearY: 10 }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', relative: true, ...only({ mixShearY: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expectMatrix(bone, [1, -0.6427876, 0, 0.7660444, 0, 0]);
    // shearY = -atan2d(1*(-0.6427876) + 0, det = 0.7660444) = 40
    expect(bone.ashearY).toBeCloseTo(40, 5);
  });
});

describe('local absolute', () => {
  it('does not wrap the rotation difference (0 -> 270 with mix 0.5 = 135, not -45)', () => {
    // q.rotation = 0 + (270 - 0 + 0) * 0.5 = 135
    // world: a = cos135 = -0.7071068, b = cos225 = -0.7071068, c = sin135 = 0.7071068, d = sin225 = -0.7071068
    const sk = build([ROOT, { name: 'target', parent: 'root', rotation: 270 }, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', local: true, ...only({ mixRotation: 0.5 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expect(bone.arotation).toBeCloseTo(135, 5);
    expectMatrix(bone, [-SQ2, -SQ2, SQ2, -SQ2, 0, 0]);
    expect(bone.rotation).toBe(0);
  });

  it('compares applied poses, not world, under a rotated parent', () => {
    // root rotation 90. target local rotation 90 (world 180); bone local 0 (world 90).
    // q.rotation = 0 + (90 - 0 + 0) * 1 = 90 -> bone world rotation = 90 + 90 = 180
    // world: root matrix [0 -1; 1 0] ; la = cos90 = 0, lb = cos180 = -1, lc = 1, ld = 0
    //   a = pa*la + pb*lc = 0*0 + (-1)(1) = -1 ; b = pa*lb + pb*ld = 0 ; c = pc*la + pd*lc = 0 ; d = pc*lb + pd*ld = -1
    const sk = build([{ name: 'root', rotation: 90 }, { name: 'target', parent: 'root', rotation: 90 }, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', local: true, ...only({ mixRotation: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expect(bone.arotation).toBeCloseTo(90, 5);
    expectMatrix(bone, [-1, 0, 0, -1, 0, 0]);
  });

  it('applies x, y, scale and shear with offsets and full mixes', () => {
    // target: x 10, y 20, scaleX 3, scaleY 2, shearY 30 ; bone: identity pose
    // ax = 0 + (10 - 0 + 2) * 1 = 12 ; ay = 0 + (20 - 0 + 0) * 1 = 20
    // ascaleX = 1 + (3 - 1 + 1) * 1 = 4 ; ascaleY = 1 + (2 - 1 + 0) * 1 = 2
    // ashearY = 0 + (30 - 0 + 0) * 1 = 30
    const sk = build([ROOT, { name: 'target', parent: 'root', x: 10, y: 20, scaleX: 3, scaleY: 2, shearY: 30 }, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', local: true, offsetX: 2, offsetScaleX: 1, ...only({ mixX: 1, mixY: 1, mixScaleX: 1, mixScaleY: 1, mixShearY: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    expect(bone.ax).toBeCloseTo(12, 5);
    expect(bone.ay).toBeCloseTo(20, 5);
    expect(bone.ascaleX).toBeCloseTo(4, 5);
    expect(bone.ascaleY).toBeCloseTo(2, 5);
    expect(bone.ashearY).toBeCloseTo(30, 5);
    // world (spec 5.4): a = cos0 * 4 = 4 ; b = cos(0 + 90 + 30) * 2 = -1 ; c = 0 ; d = sin120 * 2 = 1.7320508
    expectMatrix(bone, [4, -1, 0, 1.7320508, 12, 20]);
  });

  it('multiplies the general mix (mix 0.5 x mixRotation 0.5 -> 22.5)', () => {
    // q.rotation = 0 + (90 - 0 + 0) * 0.25 = 22.5
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', local: true, mix: 0.5, ...only({ mixRotation: 0.5 }) },
    ]);
    expect(sk.findBone('bone')!.arotation).toBeCloseTo(22.5, 5);
  });
});

describe('local relative', () => {
  it('adds the target values with offsets and partial mixes', () => {
    // bone: rotation 10, x 1, y 2, scaleX 2, scaleY 1, shearY 5
    // target: rotation 20, x 3, y 4, scaleX 1.5, scaleY 0.5, shearY 10
    // offsets: rotation 5, x 1, scaleX 0.25, shearY 5 ; mixes: all 1 except mixX 0.5, mixScaleY 0.5
    // rotation = 10 + (20 + 5) * 1 = 35
    // x = 1 + (3 + 1) * 0.5 = 3 ; y = 2 + (4 + 0) * 1 = 6
    // scaleX = 2 * ((1.5 - 1 + 0.25) * 1 + 1) = 3.5
    // scaleY = 1 * ((0.5 - 1 + 0) * 0.5 + 1) = 0.75
    // shearY = 5 + (10 + 5) * 1 = 20
    const sk = build([
      ROOT,
      { name: 'target', parent: 'root', rotation: 20, x: 3, y: 4, scaleX: 1.5, scaleY: 0.5, shearY: 10 },
      { name: 'bone', parent: 'root', rotation: 10, x: 1, y: 2, scaleX: 2, scaleY: 1, shearY: 5 },
    ], [
      {
        type: 'transform', name: 't', bones: ['bone'], target: 'target', local: true, relative: true,
        offsetRotation: 5, offsetX: 1, offsetScaleX: 0.25, offsetShearY: 5,
        mixRotation: 1, mixX: 0.5, mixY: 1, mixScaleX: 1, mixScaleY: 0.5, mixShearY: 1,
      },
    ]);
    const bone = sk.findBone('bone')!;
    expect(bone.arotation).toBeCloseTo(35, 5);
    expect(bone.ax).toBeCloseTo(3, 5);
    expect(bone.ay).toBeCloseTo(6, 5);
    expect(bone.ascaleX).toBeCloseTo(3.5, 5);
    expect(bone.ascaleY).toBeCloseTo(0.75, 5);
    expect(bone.ashearY).toBeCloseTo(20, 5);
    // local pose untouched
    expect(bone.rotation).toBe(10);
    expect(bone.x).toBe(1);
    expect(bone.scaleX).toBe(2);
    // world (spec 5.4): a = cos35 * 3.5 = 2.8670321 ; c = sin35 * 3.5 = 2.0075175
    //   rotY = 35 + 90 + 20 = 145 ; b = cos145 * 0.75 = -0.6143640 ; d = sin145 * 0.75 = 0.4301823
    expectMatrix(bone, [3.5 * Math.cos(35 * Math.PI / 180), 0.75 * Math.cos(145 * Math.PI / 180), 3.5 * Math.sin(35 * Math.PI / 180), 0.75 * Math.sin(145 * Math.PI / 180), 3, 6]);
  });
});

describe('several bones and descendants (spec 5.6 dirty rule)', () => {
  it('rotates two bones and recomputes the child of a constrained bone', () => {
    // arm: identity at (0, 0); hand: child of arm at x 10; other: identity at (0, 5)
    // rotation copy (mR 1): arm and other become [0 -1; 1 0] (see the first test)
    // hand: worldX = a*10 + b*0 + armX = 0 ; worldY = c*10 + d*0 + armY = 10 ; matrix inherits [0 -1; 1 0]
    const sk = build([
      ROOT, TARGET_R90,
      { name: 'arm', parent: 'root' },
      { name: 'hand', parent: 'arm', x: 10 },
      { name: 'other', parent: 'root', y: 5 },
    ], [
      { type: 'transform', name: 't', bones: ['arm', 'other'], target: 'target', ...only({ mixRotation: 1 }) },
    ]);
    expectMatrix(sk.findBone('arm')!, [0, -1, 1, 0, 0, 0]);
    expectMatrix(sk.findBone('other')!, [0, -1, 1, 0, 0, 5]);
    expectMatrix(sk.findBone('hand')!, [0, -1, 1, 0, 0, 10]);
    expect(sk.findBone('hand')!.arotation).toBe(0);
  });

  it('a constrained child of a constrained bone reads the stale world (reference order)', () => {
    // arm and hand both constrained, world absolute, mR 1.
    // Reference 5.6: all worlds are computed once before apply(c); inside the loop hand reads
    // its pre-constraint matrix (identity at (10, 0)) and is rotated to 90 in place:
    //   hand matrix [0 -1; 1 0], worldX 10, worldY 0 (world position is not moved by rotation)
    // appliedFromWorld(hand) with parent arm = [0 -1; 1 0] at (0, 0):
    //   pid = 1 / (0*0 - (-1)(1)) = 1 ; ia = pd = 0, ib = pb = -1, ic = pc = 1, id = pa = 0
    //   dx = 10, dy = 0 -> ax = dx*ia - dy*ib = 0 ; ay = dy*id - dx*ic = -10
    //   ra = ia*a - ib*c = 0 - (-1)(1) = 1 ; rb = ia*b - ib*d = 0 ; rc = id*c - ic*a = 0 ; rd = id*d - ic*b = 1
    //   -> arotation 0, ascaleX 1, ascaleY 1
    const sk = build([
      ROOT, TARGET_R90,
      { name: 'arm', parent: 'root' },
      { name: 'hand', parent: 'arm', x: 10 },
    ], [
      { type: 'transform', name: 't', bones: ['arm', 'hand'], target: 'target', ...only({ mixRotation: 1 }) },
    ]);
    const hand = sk.findBone('hand')!;
    expectMatrix(hand, [0, -1, 1, 0, 10, 0]);
    expect(hand.ax).toBeCloseTo(0, 5);
    expect(hand.ay).toBeCloseTo(-10, 5);
    expect(hand.arotation).toBeCloseTo(0, 5);
  });
});

describe('mix, active and setup pose', () => {
  it('does nothing with mix 0, with active false, or with every property mix 0', () => {
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', mix: 0 },
    ]);
    const bone = sk.findBone('bone')!;
    const c = sk.findConstraint('t') as TransformConstraint;
    expectMatrix(bone, [1, 0, 0, 1, 0, 0]);

    c.mix = 1;
    c.active = false;
    sk.updateWorldTransform();
    expectMatrix(bone, [1, 0, 0, 1, 0, 0]);

    c.active = true;
    c.mixRotation = 0; c.mixX = 0; c.mixY = 0; c.mixScaleX = 0; c.mixScaleY = 0; c.mixShearY = 0;
    sk.updateWorldTransform();
    expectMatrix(bone, [1, 0, 0, 1, 0, 0]);
    expect(bone.arotation).toBe(0);
  });

  it('animated mixes take effect and setToSetupPose restores the file values', () => {
    const sk = build([ROOT, TARGET_R90, { name: 'bone', parent: 'root' }], [
      { type: 'transform', name: 't', bones: ['bone'], target: 'target', mix: 0.5, ...only({ mixRotation: 1 }) },
    ]);
    const bone = sk.findBone('bone')!;
    const c = sk.findConstraint('t') as TransformConstraint;
    // mR = 0.5 -> 45 deg
    expect(bone.arotation).toBeCloseTo(45, 5);

    c.mix = 1;
    c.mixRotation = 0.5;
    c.mixX = 1;
    sk.updateWorldTransform();
    // mR = 0.5 -> 45 deg ; mX = 1 -> worldX = 0 + (localToWorld(target, 0, 0).x - 0) = 10
    expect(bone.arotation).toBeCloseTo(45, 5);
    expect(bone.worldX).toBeCloseTo(10, 5);
    expect(bone.worldY).toBeCloseTo(0, 5);

    c.setToSetupPose();
    expect(c.mix).toBe(0.5);
    expect(c.mixRotation).toBe(1);
    expect(c.mixX).toBe(0);
    sk.updateWorldTransform();
    expect(bone.arotation).toBeCloseTo(45, 5);
    expect(bone.worldX).toBeCloseTo(0, 5);
  });
});
