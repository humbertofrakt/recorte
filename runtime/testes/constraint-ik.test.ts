/**
 * IK constraint (spec 6.2). Every expected value below is derived by hand from
 * the `ik1` / `ik2` pseudocode of the spec; the derivation is in the comment
 * of each test. Nothing was copied from the output of the implementation.
 */

import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { getConstraintFactory } from '../src/constraints/constraint.js';
import { IkConstraint } from '../src/constraints/ik.js';
import type { BoneDef, ConstraintDef } from '../src/types.js';

const header = { version: '1.0', minVersion: '1.0', generator: 'test' };

function build(bones: BoneDef[], constraints: ConstraintDef[]): Skeleton {
  const data = loadSkeletonData({ bone: header, bones, constraints });
  const sk = new Skeleton(data);
  sk.updateWorldTransform();
  return sk;
}

/** World rotation of the bone X axis, in degrees. */
function worldRot(sk: Skeleton, name: string): number {
  return sk.findBone(name)!.worldRotationX;
}

/** World position of the tip of a bone (its `length` along the local X axis). */
function tip(sk: Skeleton, name: string): { x: number; y: number } {
  const b = sk.findBone(name)!;
  return b.localToWorld(b.data.length, 0);
}

// One bone "arm" (length 100) under root; target "t" is a sibling under root.
function oneBone(arm: Partial<BoneDef>, target: Partial<BoneDef>, ik: Partial<ConstraintDef> = {}): Skeleton {
  return build(
    [
      { name: 'root' },
      { name: 'arm', parent: 'root', length: 100, ...arm },
      { name: 't', parent: 'root', ...target },
    ],
    [{ type: 'ik', name: 'ik', bones: ['arm'], target: 't', ...ik } as ConstraintDef],
  );
}

// Two bones P (length 100) -> C (at x 100, length 100) under root; target "t" under root.
function twoBones(target: Partial<BoneDef>, ik: Partial<ConstraintDef> = {}, P: Partial<BoneDef> = {}, C: Partial<BoneDef> = {}): Skeleton {
  return build(
    [
      { name: 'root' },
      { name: 'P', parent: 'root', length: 100, ...P },
      { name: 'C', parent: 'P', x: 100, length: 100, ...C },
      { name: 't', parent: 'root', ...target },
    ],
    [{ type: 'ik', name: 'ik', bones: ['P', 'C'], target: 't', ...ik } as ConstraintDef],
  );
}

describe('registration', () => {
  it('replaces the noop factory for type "ik"', () => {
    expect(getConstraintFactory('ik')).not.toBeNull();
    const sk = oneBone({}, { x: 100, y: 100 });
    expect(sk.constraints).toHaveLength(1);
    expect(sk.constraints[0]).toBeInstanceOf(IkConstraint);
    const ik = sk.constraints[0] as IkConstraint;
    expect(ik.bones.map((b) => b.data.name)).toEqual(['arm']);
    expect(ik.target.data.name).toBe('t');
  });
});

describe('one-bone IK (spec 6.2 ik1)', () => {
  it('points the bone at a target 45 degrees away', () => {
    // parent = root (identity). rot = -shearX - rotation = 0.
    // x = 100, y = 100, det = 1 -> lx = 100 - ax = 100, ly = 100.
    // rot = atan2d(100, 100) = 45 -> arotation = 0 + 45 * 1 = 45.
    const sk = oneBone({}, { x: 100, y: 100 });
    const arm = sk.findBone('arm')!;
    expect(arm.arotation).toBeCloseTo(45, 6);
    expect(arm.ascaleX).toBe(1);
    expect(arm.ascaleY).toBe(1);
    expect(worldRot(sk, 'arm')).toBeCloseTo(45, 6);
    // world matrix: a = cos45, b = -sin45, c = sin45, d = cos45
    expect(arm.a).toBeCloseTo(Math.SQRT1_2, 6);
    expect(arm.c).toBeCloseTo(Math.SQRT1_2, 6);
    expect(arm.b).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(arm.d).toBeCloseTo(Math.SQRT1_2, 6);
    // local pose untouched (spec 5.2)
    expect(arm.rotation).toBe(0);
  });

  it('accounts for the current applied rotation (bone starts at 90)', () => {
    // rot = -0 - 90 = -90; lx = 100, ly = 100 -> rot = -90 + 45 = -45.
    // arotation = 90 + (-45) = 45.
    const sk = oneBone({ rotation: 90 }, { x: 100, y: 100 });
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(45, 6);
    expect(sk.findBone('arm')!.rotation).toBe(90);
  });

  it('works in the parent space when the parent is rotated', () => {
    // root rotation 90 -> pa = 0, pb = -1, pc = 1, pd = 0, det = 1.
    // target local (0, 100) -> world (-100, 0).
    // x = -100, y = 0 -> lx = (x*pd - y*pb)/det = 0, ly = (y*pa - x*pc)/det = 100.
    // rot = atan2d(100, 0) = 90 -> arotation = 90; world rotation = 90 + 90 = 180.
    const sk = build(
      [
        { name: 'root', rotation: 90 },
        { name: 'arm', parent: 'root', length: 100 },
        { name: 't', parent: 'root', y: 100 },
      ],
      [{ type: 'ik', name: 'ik', bones: ['arm'], target: 't' }],
    );
    const arm = sk.findBone('arm')!;
    expect(sk.findBone('t')!.worldX).toBeCloseTo(-100, 6);
    expect(arm.arotation).toBeCloseTo(90, 6);
    expect(worldRot(sk, 'arm')).toBeCloseTo(180, 6);
    expect(tip(sk, 'arm').x).toBeCloseTo(-100, 6);
    expect(tip(sk, 'arm').y).toBeCloseTo(0, 6);
  });

  it('mix 0.5 rotates halfway', () => {
    // rot = 45 -> arotation = 0 + 45 * 0.5 = 22.5.
    const sk = oneBone({}, { x: 100, y: 100 }, { mix: 0.5 });
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(22.5, 6);
  });

  it('mix 0 leaves the bone in FK; active=false too', () => {
    const sk = oneBone({}, { x: 100, y: 100 }, { mix: 0 });
    expect(sk.findBone('arm')!.arotation).toBe(0);
    const sk2 = oneBone({}, { x: 100, y: 100 });
    sk2.constraints[0].active = false;
    sk2.updateWorldTransform();
    expect(sk2.findBone('arm')!.arotation).toBe(0);
  });

  it('does not accumulate across frames (applied is rebuilt from local)', () => {
    const sk = oneBone({}, { x: 100, y: 100 }, { mix: 0.5 });
    sk.updateWorldTransform();
    sk.updateWorldTransform();
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(22.5, 6);
  });

  it('adds 180 when scaleX is negative', () => {
    // rot = 45 + 180 = 225 -> normalized = -135 -> arotation = -135.
    // With scaleX -1: a = cos(-135) * -1 = +0.7071, c = sin(-135) * -1 = +0.7071
    // -> the (flipped) X axis still points at the target (45 degrees).
    const sk = oneBone({ scaleX: -1 }, { x: 100, y: 100 });
    const arm = sk.findBone('arm')!;
    expect(arm.arotation).toBeCloseTo(-135, 6);
    expect(arm.a).toBeCloseTo(Math.SQRT1_2, 6);
    expect(arm.c).toBeCloseTo(Math.SQRT1_2, 6);
  });

  it('stretch: scaleX grows so the tip reaches a far target', () => {
    // target (200, 0): lx = 200, ly = 0, rot = 0. b = length * scaleX = 100.
    // dd = 40000 > b*b = 10000 and stretch -> s = (200/100 - 1) * 1 + 1 = 2.
    const sk = oneBone({}, { x: 200 }, { stretch: true });
    const arm = sk.findBone('arm')!;
    expect(arm.arotation).toBeCloseTo(0, 6);
    expect(arm.ascaleX).toBeCloseTo(2, 6);
    expect(arm.ascaleY).toBe(1);
    expect(tip(sk, 'arm').x).toBeCloseTo(200, 6);
    // local scale untouched
    expect(arm.scaleX).toBe(1);
  });

  it('without stretch the far target only rotates the bone', () => {
    const sk = oneBone({}, { x: 200 });
    expect(sk.findBone('arm')!.ascaleX).toBe(1);
    expect(tip(sk, 'arm').x).toBeCloseTo(100, 6);
  });

  it('stretch + uniform also scales Y', () => {
    const sk = oneBone({}, { x: 200 }, { stretch: true, uniform: true });
    expect(sk.findBone('arm')!.ascaleX).toBeCloseTo(2, 6);
    expect(sk.findBone('arm')!.ascaleY).toBeCloseTo(2, 6);
  });

  it('compress: scaleX shrinks for a near target; mix scales the amount', () => {
    // target (50, 0): dd = 2500 < 10000 and compress -> s = (50/100 - 1) * mix + 1.
    // mix 1 -> 0.5 ; mix 0.5 -> 0.75.
    const sk = oneBone({}, { x: 50 }, { compress: true });
    expect(sk.findBone('arm')!.ascaleX).toBeCloseTo(0.5, 6);
    const sk2 = oneBone({}, { x: 50 }, { compress: true, mix: 0.5 });
    expect(sk2.findBone('arm')!.ascaleX).toBeCloseTo(0.75, 6);
    // stretch alone does nothing for a near target
    const sk3 = oneBone({}, { x: 50 }, { stretch: true });
    expect(sk3.findBone('arm')!.ascaleX).toBe(1);
  });

  it('noRotationOrReflection mode: rotation is measured against the parent axes', () => {
    // root rotation 90: pa = 0, pb = -1, pc = 1, pd = 0. sx = sy = 1.
    // s = |pa*pd - pb*pc| / max(0.0001, pa*pa + pc*pc) = 1 / 1 = 1.
    // sa = 0, sc = 1 -> pb = -1, pd = 0 ; rot = 0 + atan2d(1, 0) = 90.
    // target world (100, 100): x = 100, y = 100, det = 0*0 - (-1)(1) = 1.
    // lx = (100*0 - 100*(-1)) / 1 - 0 = 100 ; ly = (100*0 - 100*1) / 1 = -100.
    // rot = 90 + atan2d(-100, 100) = 45 -> arotation = 45.
    // updateWorld (noRotationOrReflection): prx = 90, rx = 45 - 90 = -45;
    // pa = 0, pc = 1, pb = 1, pd = 0 -> a = -pb*lc = sin45, c = pc*la = cos45 -> world 45.
    const sk = build(
      [
        { name: 'root', rotation: 90 },
        { name: 'arm', parent: 'root', length: 100, inheritRotation: false, inheritScale: true, inheritReflection: false },
        // root is rotated 90: local (100, -100) is world (100, 100).
        { name: 't', parent: 'root', x: 100, y: -100 },
      ],
      [{ type: 'ik', name: 'ik', bones: ['arm'], target: 't' }],
    );
    const arm = sk.findBone('arm')!;
    expect(arm.arotation).toBeCloseTo(45, 6);
    expect(worldRot(sk, 'arm')).toBeCloseTo(45, 6);
  });
});

describe('two-bone IK (spec 6.2 ik2), uniform parent scale', () => {
  // Common numbers: px = py = 0, psx = psy = csx = 1, os1 = os2 = 0, s2 = 1.
  // cx = 100, cy = C.ay = 0 -> cwx = 100, cwy = 0. pp = root (identity):
  // dx = 100, dy = 0 -> l1 = 100. l2 = 100 * 1 = 100. os = atan2(0, 100) = 0.

  it('target at distance 100*sqrt(2), bend positive: 0 / +90', () => {
    // ttx = 100, tty = 100, dd = 20000.
    // cos = (20000 - 10000 - 10000) / (2*100*100) = 0 -> a2 = acos(0) * 1 = pi/2.
    // a = l1 + l2*cos = 100 ; b = l2 * sin(pi/2) = 100.
    // a1 = atan2(tty*a - ttx*b, ttx*a + tty*b) = atan2(0, 20000) = 0.
    // r1 = normalized(0 - 0 + 0 - 0) = 0 -> P.arotation = 0.
    // r2 = normalized((pi/2 + 0) * RAD2DEG - 0) * 1 + 0 - 0 = 90 -> C.arotation = 90.
    const sk = twoBones({ x: 100, y: 100 });
    const P = sk.findBone('P')!;
    const C = sk.findBone('C')!;
    expect(P.arotation).toBeCloseTo(0, 6);
    expect(C.arotation).toBeCloseTo(90, 6);
    expect(P.ascaleX).toBe(1);
    expect(P.ascaleY).toBe(1);
    expect(P.ashearX).toBe(0);
    expect(P.ashearY).toBe(0);
    expect(C.worldX).toBeCloseTo(100, 6);
    expect(C.worldY).toBeCloseTo(0, 6);
    expect(worldRot(sk, 'C')).toBeCloseTo(90, 6);
    expect(tip(sk, 'C').x).toBeCloseTo(100, 6);
    expect(tip(sk, 'C').y).toBeCloseTo(100, 6);
    // local poses untouched
    expect(P.rotation).toBe(0);
    expect(C.rotation).toBe(0);
  });

  it('target at distance 100*sqrt(2), bend negative: +90 / -90', () => {
    // bendDir = -1: a2 = -pi/2 ; a = 100 ; b = 100 * sin(-pi/2) = -100.
    // a1 = atan2(100*100 - 100*(-100), 100*100 + 100*(-100)) = atan2(20000, 0) = pi/2.
    // r1 = 90 -> P.arotation = 90 ; r2 = -90 -> C.arotation = -90.
    // C origin = (0, 100), C world rotation = 0, tip = (100, 100).
    const sk = twoBones({ x: 100, y: 100 }, { bendPositive: false });
    const P = sk.findBone('P')!;
    const C = sk.findBone('C')!;
    expect(P.arotation).toBeCloseTo(90, 6);
    expect(C.arotation).toBeCloseTo(-90, 6);
    expect(C.worldX).toBeCloseTo(0, 6);
    expect(C.worldY).toBeCloseTo(100, 6);
    expect(worldRot(sk, 'C')).toBeCloseTo(0, 6);
    expect(tip(sk, 'C').x).toBeCloseTo(100, 6);
    expect(tip(sk, 'C').y).toBeCloseTo(100, 6);
  });

  it('target (150, 0): law of cosines gives an elbow of 82.819 degrees', () => {
    // dd = 22500. cos = (22500 - 20000) / 20000 = 0.125 -> a2 = acos(0.125) = 82.819244 deg.
    // a = 100 + 12.5 = 112.5 ; b = 100 * sin(82.819244) = 99.215674.
    // a1 = atan2(0 - 150*99.215674, 150*112.5) = atan2(-14882.35, 16875) = -41.409622 deg.
    // Check: interior elbow angle = acos((100^2 + 100^2 - 150^2) / 20000) = acos(-0.125) = 97.18,
    // exterior = 180 - 97.18 = 82.82 ; P angle = acos(150 / 200) = 41.41.
    const sk = twoBones({ x: 150 });
    expect(sk.findBone('P')!.arotation).toBeCloseTo(-41.409622, 5);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(82.819244, 5);
    expect(tip(sk, 'C').x).toBeCloseTo(150, 6);
    expect(tip(sk, 'C').y).toBeCloseTo(0, 6);
  });

  it('target (50, 0): the chain folds', () => {
    // dd = 2500. cos = (2500 - 20000) / 20000 = -0.875 -> a2 = acos(-0.875) = 151.044976 deg.
    // a = 100 - 87.5 = 12.5 ; b = 100 * sin(151.044976) = 48.412292.
    // a1 = atan2(-50*48.412292, 50*12.5) = atan2(-2420.61, 625) = -75.522488 deg
    //    (= -acos(50 / 200)).
    const sk = twoBones({ x: 50 });
    expect(sk.findBone('P')!.arotation).toBeCloseTo(-75.522488, 5);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(151.044976, 5);
    expect(tip(sk, 'C').x).toBeCloseTo(50, 6);
    expect(tip(sk, 'C').y).toBeCloseTo(0, 6);
  });

  it('target out of reach without stretch: chain straightens, no scaling', () => {
    // target (300, 0): dd = 90000. cos = (90000 - 20000) / 20000 = 3.5 > 1 -> cos = 1, a2 = 0.
    // a = 200, b = 0 -> a1 = atan2(0, 60000) = 0. P = 0, C = 0, scale 1. Tip at (200, 0).
    const sk = twoBones({ x: 300 });
    const P = sk.findBone('P')!;
    expect(P.arotation).toBeCloseTo(0, 6);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(0, 6);
    expect(P.ascaleX).toBe(1);
    expect(P.ascaleY).toBe(1);
    expect(tip(sk, 'C').x).toBeCloseTo(200, 6);
  });

  it('target out of reach with stretch: parent scaleX grows', () => {
    // k = (sqrt(90000) / (100 + 100) - 1) * 1 + 1 = 1.5 -> P.ascaleX = 1.5, ascaleY = 1.
    // C inherits the scale (normal mode): C origin (150, 0), C.a = 1.5, tip = 150 + 150 = 300.
    const sk = twoBones({ x: 300 }, { stretch: true });
    const P = sk.findBone('P')!;
    const C = sk.findBone('C')!;
    expect(P.ascaleX).toBeCloseTo(1.5, 6);
    expect(P.ascaleY).toBe(1);
    expect(P.scaleX).toBe(1);
    expect(C.worldX).toBeCloseTo(150, 6);
    expect(C.a).toBeCloseTo(1.5, 6);
    expect(tip(sk, 'C').x).toBeCloseTo(300, 6);
    expect(tip(sk, 'C').y).toBeCloseTo(0, 6);
  });

  it('stretch + uniform scales Y as well; mix halves the stretch', () => {
    const sk = twoBones({ x: 300 }, { stretch: true, uniform: true });
    expect(sk.findBone('P')!.ascaleX).toBeCloseTo(1.5, 6);
    expect(sk.findBone('P')!.ascaleY).toBeCloseTo(1.5, 6);
    // k = (1.5 - 1) * 0.5 + 1 = 1.25
    const sk2 = twoBones({ x: 300 }, { stretch: true, mix: 0.5 });
    expect(sk2.findBone('P')!.ascaleX).toBeCloseTo(1.25, 6);
  });

  it('mix 0.5 applies half of each rotation', () => {
    // bend negative at (100, 100): r1 = 90, r2 = -90 -> P = 45, C = -45.
    const sk = twoBones({ x: 100, y: 100 }, { bendPositive: false, mix: 0.5 });
    expect(sk.findBone('P')!.arotation).toBeCloseTo(45, 6);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(-45, 6);
  });

  it('softness pulls the target in near full extension', () => {
    // softness 10 -> softness' = 10 * psx * (csx + 1) / 2 = 10.
    // target (190, 0): td = 190, sd = 190 - 100 - 100 + 10 = 0 -> not > 0, no change:
    //   cos = (36100 - 20000) / 20000 = 0.805 -> a2 = acos(0.805), tip at 190.
    const sk0 = twoBones({ x: 190 }, { softness: 10 });
    expect(tip(sk0, 'C').x).toBeCloseTo(190, 6);
    // target (195, 0): td = 195, sd = 5 > 0.
    //   pz = min(1, 5 / 20) - 1 = -0.75 ; pz = (5 - 10 * (1 - 0.5625)) / 195 = 0.625 / 195.
    //   ttx = 195 - 0.625 = 194.375 ; dd = 194.375^2 = 37781.640625.
    //   cos = (37781.640625 - 20000) / 20000 = 0.88908203125 -> a2 = 27.241879 deg.
    //   symmetric chain: a1 = -acos(194.375 / 200) = -13.620939 deg. Tip at 194.375.
    const sk = twoBones({ x: 195 }, { softness: 10 });
    expect(sk.findBone('P')!.arotation).toBeCloseTo(-13.620939, 5);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(27.241879, 5);
    expect(tip(sk, 'C').x).toBeCloseTo(194.375, 5);
    expect(tip(sk, 'C').y).toBeCloseTo(0, 6);
  });

  it('child offset in Y enters through "os" when the parent scale is uniform and there is no stretch', () => {
    // C at (100, 50): cy = 50, cwx = 100, cwy = 50 -> l1 = sqrt(12500) = 111.803399.
    // os = atan2(50, 100) = 26.565051 deg.
    // target = C origin + 100 along the same direction = (189.442719, 94.721360):
    //   dd = (l1 + l2)^2 -> cos = 1 (a2 = 0) ; a1 = atan2(tty, ttx) = os.
    // r1 = (a1 - os) * RAD2DEG = 0 -> P.arotation = 0.
    // r2 = (0 + os) * RAD2DEG = 26.565051 -> C.arotation = 26.565051.
    const sk = twoBones({ x: 189.4427191, y: 94.72135955 }, {}, {}, { y: 50 });
    expect(sk.findBone('P')!.arotation).toBeCloseTo(0, 5);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(26.565051, 4);
    expect(tip(sk, 'C').x).toBeCloseTo(189.4427191, 4);
    expect(tip(sk, 'C').y).toBeCloseTo(94.72135955, 4);
  });

  it('child on top of the parent degenerates into one-bone IK', () => {
    // C at x 0 -> l1 = 0 < 0.0001: ik1(P, target) -> P.arotation = 45 ; C.arotation = 0.
    const sk = twoBones({ x: 100, y: 100 }, {}, {}, { x: 0, rotation: 30 });
    expect(sk.findBone('P')!.arotation).toBeCloseTo(45, 6);
    expect(sk.findBone('C')!.arotation).toBe(0);
    expect(sk.findBone('C')!.rotation).toBe(30);
  });

  it('parent with negative scaleX: os1 = 180 and s2 = -1', () => {
    // P scaleX -1: psx = 1, os1 = 180, s2 = -1. cwx = P.a * 100 + 0 = -100 -> dx = -100, l1 = 100.
    // target (-100, 100): ttx = -100, tty = 100, dd = 20000 -> cos = 0, a2 = pi/2 (bend +).
    // a = 100, b = 100 -> a1 = atan2(100*100 - (-100)*100, (-100)*100 + 100*100) = atan2(20000, 0) = pi/2.
    // r1 = normalized((pi/2 - 0) * RAD2DEG + 180 - 0) = normalized(270) = -90 -> P.arotation = -90.
    // r2 = normalized((pi/2 * RAD2DEG - 0) * (-1) + 0 - 0) = -90 -> C.arotation = -90.
    // Check: P at -90 with scaleX -1 -> P.a = cos(-90)*-1 = 0, P.c = sin(-90)*-1 = 1: X axis points up.
    // C origin = (0, 100). C world: a = pa*cos(-90) + pb*sin(-90) ; pb = cos(0)*1 = 1 -> a = -1... tip = (-100, 100).
    const sk = twoBones({ x: -100, y: 100 }, {}, { scaleX: -1 });
    expect(sk.findBone('P')!.arotation).toBeCloseTo(-90, 6);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(-90, 6);
    expect(sk.findBone('C')!.worldX).toBeCloseTo(0, 6);
    expect(sk.findBone('C')!.worldY).toBeCloseTo(100, 6);
    expect(tip(sk, 'C').x).toBeCloseTo(-100, 6);
    expect(tip(sk, 'C').y).toBeCloseTo(100, 6);
  });
});

describe('two-bone IK, non-uniform parent scale (ellipse branch)', () => {
  // P scale (2, 1): psx = 2, psy = 1, u = false -> cy = 0, cwx = P.a * 100 = 200 -> l1 = 200.
  // l2 = 100. a = psx * l2 = 200, b = psy * l2 = 100, aa = 40000, bb = 10000.
  // c1 = -2 * bb * l1 = -4e6 ; c2 = bb - aa = -30000.

  it('reachable target (200, 100), bend positive: 0 / +90', () => {
    // dd = 50000, ta = atan2(100, 200) = 26.565051 deg.
    // c = bb*l1^2 + aa*dd - aa*bb = 4e8 + 2e9 - 4e8 = 2e9.
    // d = c1^2 - 4*c2*c = 1.6e13 + 2.4e14 = 2.56e14 -> q = 1.6e7 ; c1 < 0 -> q = -1.6e7.
    // q = -(c1 + q) / 2 = 1e7. r0 = q / c2 = -333.33 ; r1 = c / q = 200 -> r = 200.
    // r0 = dd - r*r = 10000 >= 0 -> y = 100 * bendDir.
    // bend +: a1 = ta - atan2(100, 200) = 0 ; a2 = atan2(100 / 1, (200 - 200) / 2) = pi/2.
    // P.arotation = 0, scale (2, 1) kept, shear 0 ; C.arotation = 90.
    // World check: P = diag(2, 1); C origin (200, 0); C X axis = (0, 1) -> tip (200, 100) = target.
    const sk = twoBones({ x: 200, y: 100 }, {}, { scaleX: 2, scaleY: 1 });
    const P = sk.findBone('P')!;
    const C = sk.findBone('C')!;
    expect(P.arotation).toBeCloseTo(0, 6);
    expect(P.ascaleX).toBe(2);
    expect(P.ascaleY).toBe(1);
    expect(C.arotation).toBeCloseTo(90, 6);
    expect(C.worldX).toBeCloseTo(200, 6);
    expect(tip(sk, 'C').x).toBeCloseTo(200, 6);
    expect(tip(sk, 'C').y).toBeCloseTo(100, 6);
  });

  it('reachable target (200, 100), bend negative: 53.13 / -90', () => {
    // y = -100: a1 = ta - atan2(-100, 200) = 26.565051 + 26.565051 = 53.130102 deg.
    // a2 = atan2(-100, 0) = -pi/2 -> C.arotation = -90.
    // World check: C origin = R(53.13) * (200, 0) = (120, 160);
    // tip offset = R(53.13) * S(2,1) * (0, -100) = R(53.13) * (0, -100) = (80, -60) -> (200, 100).
    const sk = twoBones({ x: 200, y: 100 }, { bendPositive: false }, { scaleX: 2, scaleY: 1 });
    const P = sk.findBone('P')!;
    const C = sk.findBone('C')!;
    expect(P.arotation).toBeCloseTo(53.130102, 5);
    expect(C.arotation).toBeCloseTo(-90, 6);
    expect(C.worldX).toBeCloseTo(120, 5);
    expect(C.worldY).toBeCloseTo(160, 5);
    expect(tip(sk, 'C').x).toBeCloseTo(200, 5);
    expect(tip(sk, 'C').y).toBeCloseTo(100, 5);
  });

  it('unreachable target (1000, 0): farthest point of the ellipse, no stretch', () => {
    // dd = 1e6. c = 4e8 + 4e10 - 4e8 = 4e10. d = 1.6e13 + 4.8e15 > 0.
    // q = sqrt(4.816e15) = 69397406 ; c1 < 0 -> q = -69397406 ; q = -(c1 + q)/2 = 36698703.
    // r0 = q / c2 = -1223.29 ; r1 = c / q = 1089.96 -> r = 1089.96 ; dd - r*r < 0 -> not solved.
    // Fallback: minX = l1 - a = 0, minDist = 0 ; maxX = l1 + a = 400, maxDist = 160000.
    // c = -a*l1 / (aa - bb) = -40000 / 30000 = -1.33 -> outside [-1, 1], skipped.
    // dd > (0 + 160000) / 2 -> a1 = ta - atan2(0, 400) = 0 ; a2 = maxAngle = 0.
    // P = 0, C = 0, scale kept (the ellipse branch never stretches).
    const sk = twoBones({ x: 1000 }, { stretch: true }, { scaleX: 2, scaleY: 1 });
    const P = sk.findBone('P')!;
    expect(P.arotation).toBeCloseTo(0, 6);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(0, 6);
    expect(P.ascaleX).toBe(2);
    expect(P.ascaleY).toBe(1);
    expect(tip(sk, 'C').x).toBeCloseTo(400, 6);
  });
});

describe('setup pose and animatable values', () => {
  it('setToSetupPose restores the file values', () => {
    const sk = twoBones({ x: 100, y: 100 }, { bendPositive: false, softness: 3, mix: 0.25 });
    const ik = sk.constraints[0] as IkConstraint;
    ik.mix = 1;
    ik.bendPositive = true;
    ik.stretch = true;
    ik.compress = true;
    ik.uniform = true;
    ik.softness = 0;
    ik.setToSetupPose();
    expect(ik.mix).toBe(0.25);
    expect(ik.bendPositive).toBe(false);
    expect(ik.stretch).toBe(false);
    expect(ik.compress).toBe(false);
    expect(ik.uniform).toBe(false);
    expect(ik.softness).toBe(3);
  });

  it('changing bendPositive at runtime flips the solution', () => {
    const sk = twoBones({ x: 100, y: 100 });
    const ik = sk.constraints[0] as IkConstraint;
    ik.bendPositive = false;
    sk.updateWorldTransform();
    expect(sk.findBone('P')!.arotation).toBeCloseTo(90, 6);
    expect(sk.findBone('C')!.arotation).toBeCloseTo(-90, 6);
  });
});
