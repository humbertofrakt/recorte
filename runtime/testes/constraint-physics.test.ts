/**
 * Physics constraint (spec 6.5). Every expected value below is derived by hand
 * from the spec pseudocode (the derivation is in the comment next to it), never
 * copied from the code output.
 *
 * Common rig: root (identity) -> "pend" (length 100, points +X) -> "tip" (x 100).
 * referenceScale f = 100, skeleton scale 1, so wind/gravity in the translation
 * loop are multiplied by 100 and h = l / f = 1 in the rotation loop.
 */

import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { PhysicsConstraint } from '../src/constraints/physics.js';
import type { PhysicsConstraintDef } from '../src/types.js';

const header = { version: '1.0', minVersion: '1.0', generator: 'test' };
const STEP = 1 / 60;

function rig(physics: Partial<PhysicsConstraintDef>): Skeleton {
  const data = loadSkeletonData({
    bone: header,
    skeleton: { referenceScale: 100 },
    bones: [
      { name: 'root' },
      { name: 'pend', parent: 'root', length: 100 },
      { name: 'tip', parent: 'pend', x: 100 },
    ],
    constraints: [{ type: 'physics', name: 'phys', bone: 'pend', ...physics }],
  });
  const skeleton = new Skeleton(data);
  // Spec 6.5 starts the physics state with `reset = true`, and the FIRST pose
  // update is the frame that only anchors the bone: it simulates nothing. The
  // constructor's warm-up is not a pose update (it must not be, or a runtime
  // could never agree with one that has no such warm-up — see the note in
  // `Skeleton`), so the rig spends that frame here. Every expectation below
  // then counts steps from a skeleton already anchored, which is where a game
  // is after its first frame.
  skeleton.updateWorldTransform(0);
  return skeleton;
}

function physicsOf(sk: Skeleton): PhysicsConstraint {
  const c = sk.constraints[0];
  if (!(c instanceof PhysicsConstraint)) throw new Error('physics constraint not registered');
  return c;
}

function steps(sk: Skeleton, n: number, dt = STEP): void {
  for (let i = 0; i < n; i++) sk.advance(dt);
}

describe('registration', () => {
  it('replaces the noop factory for type "physics"', () => {
    const sk = rig({ x: 1 });
    expect(sk.constraints.length).toBe(1);
    expect(physicsOf(sk).data.type).toBe('physics');
    expect(physicsOf(sk).bone).toBe(sk.findBone('pend'));
  });

  it('exposes the animatable values and restores them with setToSetupPose', () => {
    const sk = rig({ x: 1, gravity: 3, wind: 4, strength: 50, damping: 0.8, mass: 2, inertia: 0.25 });
    const c = physicsOf(sk);
    expect(c.massInverse).toBe(0.5);
    expect(c.step).toBe(STEP);
    c.gravity = 9; c.wind = 9; c.strength = 9; c.damping = 0.1; c.mass = 9; c.inertia = 0.9; c.mix = 0.2;
    c.setToSetupPose();
    expect([c.gravity, c.wind, c.strength, c.damping, c.mass, c.inertia, c.mix]).toEqual([3, 4, 50, 0.8, 2, 0.25, 1]);
  });
});

describe('no forces, static skeleton: nothing changes', () => {
  it('keeps world and applied poses after many steps on every channel', () => {
    const sk = rig({ x: 1, y: 1, rotation: 1, scaleX: 1, shearX: 1 });
    steps(sk, 10);
    const pend = sk.findBone('pend')!;
    // Offsets never receive input (bone still, wind 0, gravity 0), so every offset is 0:
    // worldX += 0, matrix rotated by 0 and scaled by 1 + 0.
    // The final world pass recomputes the matrix from the applied pose (spec 5.6 step 3), so
    // b = cos(90 deg) is a rounding-size number, not an exact 0: compare within 1e-12.
    const close = (actual: number[], expected: number[]): void => {
      for (let i = 0; i < expected.length; i++) expect(actual[i]).toBeCloseTo(expected[i], 12);
    };
    close([pend.a, pend.b, pend.c, pend.d, pend.worldX, pend.worldY], [1, 0, 0, 1, 0, 0]);
    close([pend.ax, pend.ay, pend.arotation, pend.ascaleX, pend.ascaleY, pend.ashearX, pend.ashearY], [0, 0, 0, 1, 1, 0, 0]);
    const tip = sk.findBone('tip')!;
    close([tip.worldX, tip.worldY], [100, 0]);
    const c = physicsOf(sk);
    expect([c.xOffset, c.yOffset, c.rotateOffset, c.scaleOffset, c.xVelocity, c.yVelocity, c.rotateVelocity, c.scaleVelocity])
      .toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('is skipped when mix is 0 or active is false (spec 5.6)', () => {
    const sk = rig({ y: 1, gravity: 2 });
    const c = physicsOf(sk);
    c.mix = 0;
    steps(sk, 3);
    expect(sk.findBone('pend')!.worldY).toBe(0);
    expect(c.remaining).toBe(0); // update never ran, the accumulator did not grow
    c.mix = 1;
    c.active = false;
    steps(sk, 3);
    expect(sk.findBone('pend')!.worldY).toBe(0);
    expect(c.yOffset).toBe(0);
  });
});

describe('translation channel (x) with skeleton translate', () => {
  // x: 1, inertia 1, strength e = 100, damping 1 (d = 1^1 = 1), mass 1, fps 60 -> m = 1/60.
  // Frame 0 (constructor, dt 0): reset branch -> ux = worldX = 0.
  // Then skeleton.x = 10 -> pend.worldX = bx = 10.
  // Frame 1 (dt 1/60):
  //   xOffset += clamp((ux - bx) * 1) = -10 ; ux = 10
  //   a = 1/60 >= step: xVelocity += (0 - (-10)*100) * (1/60) = 1000/60 = 16.6666667
  //                     xOffset += 16.6666667/60 = 0.2777778 -> -9.7222222 ; xVelocity *= 1
  //   worldX = 10 + (-9.7222222) * 1 * 1 = 0.2777778 ; remaining = 0
  //   appliedFromWorld (parent root at worldX 10, identity): ax = 0.2777778 - 10 = -9.7222222
  // Frame 2 (dt 1/60), bone still at 10 -> (ux - bx) = 0:
  //   xVelocity += (972.22222)/60 = 16.2037037 -> 32.8703704
  //   xOffset += 32.8703704/60 = 0.5478395 -> -9.1743827 ; worldX = 0.8256173
  it('lags behind the skeleton and springs back (two hand-computed steps)', () => {
    const sk = rig({ x: 1, inertia: 1, strength: 100, damping: 1 });
    const c = physicsOf(sk);
    const pend = sk.findBone('pend')!;
    const tip = sk.findBone('tip')!;
    sk.x = 10;
    sk.advance(STEP);
    expect(c.xOffset).toBeCloseTo(-9.7222222, 6);
    expect(c.xVelocity).toBeCloseTo(16.6666667, 6);
    expect(pend.worldX).toBeCloseTo(0.2777778, 6);
    expect(pend.worldY).toBe(0);
    expect(pend.ax).toBeCloseTo(-9.7222222, 6);
    expect(pend.arotation).toBe(0);
    expect(tip.worldX).toBeCloseTo(100.2777778, 6); // child recomputed from the new world matrix
    expect(c.remaining).toBe(0);

    sk.advance(STEP);
    expect(c.xVelocity).toBeCloseTo(32.8703704, 6);
    expect(c.xOffset).toBeCloseTo(-9.1743827, 6);
    expect(pend.worldX).toBeCloseTo(0.8256173, 6);
    expect(tip.worldX).toBeCloseTo(100.8256173, 6);
  });

  // limit 600 px/s, delta 1/60 -> qx = 10. Jump of 1000: (ux - bx) * 1 = -1000 -> clamped to -10.
  // Then the same single step as above: xOffset = -10 + 16.6666667/60 = -9.7222222 ; worldX = 1000 - 9.7222222.
  it('clamps the input displacement with limit * delta', () => {
    const sk = rig({ x: 1, inertia: 1, strength: 100, damping: 1, limit: 600 });
    sk.x = 1000;
    sk.advance(STEP);
    expect(physicsOf(sk).xOffset).toBeCloseTo(-9.7222222, 6);
    expect(sk.findBone('pend')!.worldX).toBeCloseTo(990.2777778, 6);
  });
});

describe('translation channel (y) with gravity', () => {
  // y: 1, gravity 2 -> g = 2 * f = 200 ; strength 100 ; inertia 0.5 ; damping 0.5 -> d = 0.5^(60/60) = 0.5 ; m = 1/60.
  // Bone still: (uy - by) * i = 0 every frame.
  // Step 1: yVelocity -= (200 + 0*100)/60 = 3.3333333 -> -3.3333333
  //         yOffset += -3.3333333/60 = -0.0555556 ; yVelocity *= 0.5 -> -1.6666667
  //         worldY = 0 + (-0.0555556) * 1 * 1
  // Step 2: yVelocity -= (200 + (-0.0555556)*100)/60 = 194.4444444/60 = 3.2407407 -> -4.9074074
  //         yOffset += -4.9074074/60 = -0.0817901 -> -0.1373457 ; yVelocity *= 0.5 -> -2.4537037
  it('falls with the spring and damping (two hand-computed steps)', () => {
    const sk = rig({ y: 1, gravity: 2, strength: 100, inertia: 0.5, damping: 0.5 });
    const c = physicsOf(sk);
    const pend = sk.findBone('pend')!;
    sk.advance(STEP);
    expect(c.yVelocity).toBeCloseTo(-1.6666667, 6);
    expect(c.yOffset).toBeCloseTo(-0.0555556, 6);
    expect(pend.worldY).toBeCloseTo(-0.0555556, 6);
    expect(pend.ay).toBeCloseTo(-0.0555556, 6);
    expect(pend.worldX).toBe(0);
    sk.advance(STEP);
    expect(c.yVelocity).toBeCloseTo(-2.4537037, 6);
    expect(c.yOffset).toBeCloseTo(-0.1373457, 6);
    expect(pend.worldY).toBeCloseTo(-0.1373457, 6);
    expect(sk.findBone('tip')!.worldY).toBeCloseTo(-0.1373457, 6);
  });

  // Same simulation; only the write is scaled: worldY += yOffset * mix * c.y = -0.0555556 * 0.5 * 0.5.
  it('scales the written offset by mix * y but not the simulation', () => {
    const sk = rig({ y: 0.5, gravity: 2, strength: 100, inertia: 0.5, damping: 0.5 });
    const c = physicsOf(sk);
    c.mix = 0.5;
    sk.advance(STEP);
    expect(c.yOffset).toBeCloseTo(-0.0555556, 6);
    expect(sk.findBone('pend')!.worldY).toBeCloseTo(-0.0138889, 6);
  });
});

describe('rotation channel', () => {
  // rotation: 1, gravity 10, strength 0, inertia 0.5, damping 1, length 100, f 100 -> h = 1, m = 1/60, mr = 1.
  // Frame 0 (constructor): tx = l * a = 100, ty = 0, cx = cy = 0.
  // Frame 1: ca = atan2(0, 1) = 0 ; dx = dy = 0 ; r = atan2(0 + 0, 0 + 100) - 0 - 0 = 0 -> rotateOffset += 0
  //          co = 1, si = 0. Loop (one step): rotateVelocity -= ((0*0 + 10*1)*1 + 0)/60 = 0.1666667
  //          rotateOffset += -0.1666667/60 = -0.0027778 rad = -0.1591549 deg
  //          apply: a = cos(o) = 0.9999961, c = sin(o) = -0.0027778 ; tx = 99.9996142, ty = -0.2777774
  // Frame 2: applied = local again -> ca = 0 ; r = atan2(ty, tx) - 0 - rotateOffset = o - o = 0
  //          co = cos(o) = 0.9999961 ; rotateVelocity -= 10*0.9999961/60 = 0.1666660 -> -0.3333327
  //          rotateOffset += -0.3333327/60 = -0.0055555 -> -0.0083333 rad = -0.4774642 deg
  it('rotates under gravity, carrying tx/ty from the previous frame (two hand-computed steps)', () => {
    const sk = rig({ rotation: 1, gravity: 10, strength: 0, inertia: 0.5, damping: 1 });
    const c = physicsOf(sk);
    const pend = sk.findBone('pend')!;
    const tip = sk.findBone('tip')!;
    sk.advance(STEP);
    expect(c.rotateOffset).toBeCloseTo(-0.0027778, 7);
    expect(c.rotateVelocity).toBeCloseTo(-0.1666667, 7);
    expect(pend.arotation).toBeCloseTo(-0.1591549, 6);
    expect(pend.a).toBeCloseTo(0.9999961, 7);
    expect(pend.c).toBeCloseTo(-0.0027778, 7);
    expect(pend.ascaleX).toBeCloseTo(1, 9);
    expect(pend.ascaleY).toBeCloseTo(1, 9);
    expect(pend.ashearY).toBeCloseTo(0, 9);
    expect(tip.worldX).toBeCloseTo(99.9996142, 6);
    expect(tip.worldY).toBeCloseTo(-0.2777774, 6);

    sk.advance(STEP);
    expect(c.rotateVelocity).toBeCloseTo(-0.3333327, 6);
    expect(c.rotateOffset).toBeCloseTo(-0.0083333, 6);
    expect(pend.arotation).toBeCloseTo(-0.4774642, 5);
  });

  // shearX: 1, rotation 0 -> mr = 1 and the same first step: o = -0.0027778.
  // Apply (shearX branch, rotation 0): only a, c rotate by o; b, d stay (0, 1).
  // appliedFromWorld (parent identity): ra = cos o, rb = 0, rc = sin o, rd = 1
  //   scaleX = 1 ; det = cos o ; scaleY = cos o = 0.9999961
  //   shearY = -atan2d(ra*rb + rc*rd, det) = -atan2d(sin o, cos o) = +0.1591549
  //   rotation = atan2d(sin o, cos o) = -0.1591549
  it('shearX rotates only the X axis (world Y axis stays at 90 degrees)', () => {
    const sk = rig({ shearX: 1, gravity: 10, strength: 0, inertia: 0.5, damping: 1 });
    const pend = sk.findBone('pend')!;
    sk.advance(STEP);
    expect(pend.arotation).toBeCloseTo(-0.1591549, 6);
    expect(pend.ashearY).toBeCloseTo(0.1591549, 6);
    expect(pend.ascaleY).toBeCloseTo(0.9999961, 7);
    expect(pend.b).toBeCloseTo(0, 12); // exact 0 up to the final cos(90 deg) rounding
    expect(pend.d).toBeCloseTo(1, 12);
    expect(pend.arotation + 90 + pend.ashearY).toBeCloseTo(90, 9);
  });

  // strength 0, gravity 10, damping 0.9 (d = 0.9 per step): damped pendulum with equilibrium
  // g*cos(theta) = 0 -> theta = -PI/2. The equilibrium is stable (theta above -90 -> cos > 0
  // -> velocity goes negative). With v ~ 1.67*cos(theta) rad/s the error decays like e^(-1.67 t);
  // after 10 s (600 steps) it is far below 1e-3 degrees.
  it('hanging bone converges to pointing straight down', () => {
    const sk = rig({ rotation: 1, gravity: 10, strength: 0, inertia: 0.5, damping: 0.9 });
    const pend = sk.findBone('pend')!;
    const tip = sk.findBone('tip')!;
    steps(sk, 600);
    expect(pend.arotation).toBeCloseTo(-90, 3);
    expect(pend.a).toBeCloseTo(0, 4);
    expect(pend.c).toBeCloseTo(-1, 4);
    expect(tip.worldX).toBeCloseTo(0, 2);
    expect(tip.worldY).toBeCloseTo(-100, 2);
    // Spec 5.2: the local pose is never written by a constraint.
    expect(pend.rotation).toBe(0);
  });
});

describe('scale channel', () => {
  // scaleX: 1, wind 6, strength 0, inertia 0.5, damping 1. Bone still: dx = dy = 0 -> scaleOffset input 0.
  // useRot false: co = cos(ca) = 1, si = 0. In the rotation/scale loop w = c.wind (not scaled by f).
  // Step: scaleVelocity += (6*1 - 0 - 0)/60 = 0.1 ; scaleOffset += 0.1/60 = 0.0016667
  // Apply: s = 1 + 0.0016667 -> a = 1.0016667, c = 0 ; ascaleX = 1.0016667 ; tip.worldX = 100.1666667
  it('stretches along the bone under wind (one hand-computed step)', () => {
    const sk = rig({ scaleX: 1, wind: 6, strength: 0, inertia: 0.5, damping: 1 });
    const c = physicsOf(sk);
    const pend = sk.findBone('pend')!;
    sk.advance(STEP);
    expect(c.scaleVelocity).toBeCloseTo(0.1, 9);
    expect(c.scaleOffset).toBeCloseTo(0.0016667, 7);
    expect(pend.a).toBeCloseTo(1.0016667, 7);
    expect(pend.c).toBe(0);
    expect(pend.ascaleX).toBeCloseTo(1.0016667, 7);
    expect(pend.ascaleY).toBe(1);
    expect(sk.findBone('tip')!.worldX).toBeCloseTo(100.1666667, 6);
  });
});

describe('reset', () => {
  // fps 64 -> step = 1/64 (exact in binary). y: 1, gravity 2 -> g = 200, strength 0, damping 1, m = 1/64.
  // One step: yVelocity = -200/64 = -3.125 ; yOffset = -3.125/64 = -0.048828125 (exact).
  const opts: Partial<PhysicsConstraintDef> = { y: 1, gravity: 2, strength: 0, inertia: 0.5, damping: 1, fps: 64 };

  it('zeroes offsets and velocities; the next frame re-anchors without simulating', () => {
    const sk = rig(opts);
    const c = physicsOf(sk);
    const pend = sk.findBone('pend')!;
    steps(sk, 3, 1 / 64);
    expect(pend.worldY).toBeLessThan(-0.1);
    sk.physicsReset();
    expect([c.yOffset, c.yVelocity, c.remaining]).toEqual([0, 0, 0]);
    sk.advance(1 / 64); // reset branch: nothing simulated, offsets stay 0
    expect(pend.worldY).toBe(0);
    expect(pend.ay).toBe(0);
    expect(c.remaining).toBe(0);
    sk.advance(1 / 64); // first real step again, from zero
    expect(c.yOffset).toBe(-0.048828125);
    expect(pend.worldY).toBe(-0.048828125);
  });

  it('zeroes the accumulator (remaining)', () => {
    // Control: two half-steps accumulate to one step.
    const control = rig(opts);
    steps(control, 2, 1 / 128);
    expect(control.findBone('pend')!.worldY).toBe(-0.048828125);

    // With a reset between them the first half-step is discarded.
    const sk = rig(opts);
    const c = physicsOf(sk);
    const pend = sk.findBone('pend')!;
    sk.advance(1 / 128);
    expect(c.remaining).toBe(1 / 128);
    c.reset();
    sk.advance(1 / 128); // reset branch -> remaining = 0
    expect(c.remaining).toBe(0);
    sk.advance(1 / 128); // 1/128 < step: no simulation yet
    expect(pend.worldY).toBe(0);
    expect(c.remaining).toBe(1 / 128);
    sk.advance(1 / 128); // now one full step
    expect(pend.worldY).toBe(-0.048828125);
    expect(c.remaining).toBe(0);
  });
});

describe('fixed step with accumulator', () => {
  // fps 64 so every dt below is exact in binary and the accumulator never drifts.
  // Translation only: the x/y channels take their per-frame input from the bone's own
  // (static) position, so any split of the same total time runs the same fixed steps. The
  // rotation and scale channels sample (cx - worldX) once per FRAME (spec 6.5), so their
  // result legitimately depends on how the time is split; they are tested elsewhere.
  const opts: Partial<PhysicsConstraintDef> = {
    x: 1, y: 1, gravity: 3, wind: 2, strength: 40, inertia: 0.5, damping: 0.8, fps: 64,
  };

  function state(sk: Skeleton): number[] {
    const c = physicsOf(sk);
    const b = sk.findBone('pend')!;
    return [c.xOffset, c.xVelocity, c.yOffset, c.yVelocity, b.worldX, b.worldY, b.ax, b.ay, c.remaining];
  }

  it('variable dt gives the same result as the fixed steps it contains', () => {
    const fixed = rig(opts);
    steps(fixed, 8, 1 / 64);
    const variable = rig(opts);
    for (const dt of [2 / 64, 1 / 64, 3 / 64, 2 / 64]) variable.advance(dt);
    // Identical operations -> identical bits.
    expect(state(variable)).toEqual(state(fixed));
    expect(variable.findBone('tip')!.worldY).toBe(fixed.findBone('tip')!.worldY);
    expect(physicsOf(variable).lastTime).toBeCloseTo(8 / 64, 12);
    expect(physicsOf(fixed).lastTime).toBeCloseTo(8 / 64, 12);
  });

  it('a dt smaller than the step only accumulates', () => {
    const sk = rig(opts);
    steps(sk, 2, 1 / 64);
    const before = state(sk);
    sk.advance(1 / 128);
    const after = state(sk);
    expect(after[8]).toBe(1 / 128); // remaining
    expect(after.slice(0, 8)).toEqual(before.slice(0, 8));
  });
});

describe('determinism', () => {
  it('two runs with the same inputs give identical bits', () => {
    const opts: Partial<PhysicsConstraintDef> = {
      x: 1, y: 1, rotation: 0.7, shearX: 0.3, scaleX: 1, gravity: 4, wind: -1.5, strength: 60,
      inertia: 0.6, damping: 0.85, mass: 1.5, limit: 300,
    };
    const run = (): number[] => {
      const sk = rig(opts);
      const dts = [1 / 60, 1 / 30, 1 / 90, 1 / 60, 0.05, 1 / 60, 1 / 240, 1 / 60];
      for (let i = 0; i < 40; i++) {
        sk.x = Math.sin(i * 0.3) * 50;
        sk.y = Math.cos(i * 0.2) * 20;
        sk.advance(dts[i % dts.length]);
      }
      const out: number[] = [];
      for (const b of sk.bones) out.push(b.a, b.b, b.c, b.d, b.worldX, b.worldY, b.ax, b.ay, b.arotation, b.ascaleX, b.ascaleY, b.ashearY);
      const c = physicsOf(sk);
      out.push(c.xOffset, c.xVelocity, c.yOffset, c.yVelocity, c.rotateOffset, c.rotateVelocity, c.scaleOffset, c.scaleVelocity, c.remaining);
      return out;
    };
    const first = run();
    const second = run();
    expect(second).toEqual(first);
    expect(first.every(Number.isFinite)).toBe(true);
    // The simulation actually did something.
    expect(Math.abs(first[first.length - 9])).toBeGreaterThan(0);
  });
});
