/**
 * End-to-end test of the example `heroi.bone` (spec 12.4, pose dump).
 *
 * Loads the file and the atlas from disk, builds the `Skeleton` through the
 * public entry point (`src/index.ts` only — this also proves the real
 * constraint factories replace the noops of `constraints/constraint.ts` when a
 * consumer imports nothing else), and checks the whole phase-2 chain: the five
 * constraint types run, no matrix goes NaN, the three animations play from
 * start to end at 1/60 s and fire the expected events, and `collectDrawables`
 * returns something to draw.
 */

import { readFileSync } from 'node:fs';
import {
  loadSkeletonData, loadAtlas, Skeleton, Bone, collectDrawables, fireEvents,
  pose, applyResets, NoopConstraint,
  IkConstraint, TransformConstraint, PathConstraint, PhysicsConstraint, DriverConstraint,
  type FiredEvent, type SkeletonData, type AtlasData,
} from '../src/index.js';

const EXAMPLES = 'C:/Users/F-rak/Desktop/animador/formato/exemplos/';

function readAtlas(): AtlasData {
  return loadAtlas(JSON.parse(readFileSync(EXAMPLES + 'heroi.atlas.json', 'utf8')));
}

function readData(): SkeletonData {
  return loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), { atlases: [readAtlas()] });
}

/** Fresh skeleton in the setup pose, world transform up to date at `now = 0`. */
function heroi(): Skeleton {
  const skeleton = new Skeleton(readData());
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform(0);
  return skeleton;
}

const MATRIX: readonly (keyof Bone)[] = ['a', 'b', 'c', 'd', 'worldX', 'worldY'];

function expectFinite(skeleton: Skeleton, where: string): void {
  for (const bone of skeleton.bones) {
    for (const f of MATRIX) {
      expect(Number.isFinite(bone[f] as number), `${where}: ${bone.data.name}.${String(f)}`).toBe(true);
    }
    expect(Number.isFinite(bone.arotation), `${where}: ${bone.data.name}.arotation`).toBe(true);
  }
  for (const w of skeleton.morphWeights) expect(Number.isFinite(w), `${where}: morph`).toBe(true);
  for (const p of skeleton.parameters) expect(Number.isFinite(p), `${where}: parameter`).toBe(true);
}

// ---------------------------------------------------------------------------

describe('heroi.bone: loading', () => {
  it('loads the file and the atlas without a single warning', () => {
    const data = readData();
    expect(data.warnings).toEqual([]);
    expect(data.missingImages).toEqual([]);
    expect(data.degraded).toBe(false);
    expect(data.animations.map((a) => a.name)).toEqual(['idle', 'walk', 'attack']);
  });

  it('resolves every attachment of the default skin', () => {
    const skeleton = heroi();
    const named = skeleton.slots.filter((s) => s.data.attachmentName !== null);
    expect(named.length).toBeGreaterThan(0);
    for (const slot of named) expect(slot.attachment, slot.data.name).not.toBeNull();
  });
});

describe('heroi.bone: constraints', () => {
  it('instantiates the five types with the real classes, in file order', () => {
    const skeleton = heroi();
    const names = skeleton.constraints.map((c) => c.data.name);
    expect(names).toEqual(['ik_arm', 'head_lean', 'cape_follow', 'hair_physics', 'look_driver']);
    expect(skeleton.constraints[0]).toBeInstanceOf(IkConstraint);
    expect(skeleton.constraints[1]).toBeInstanceOf(TransformConstraint);
    expect(skeleton.constraints[2]).toBeInstanceOf(PathConstraint);
    expect(skeleton.constraints[3]).toBeInstanceOf(PhysicsConstraint);
    expect(skeleton.constraints[4]).toBeInstanceOf(DriverConstraint);
    for (const c of skeleton.constraints) expect(c).not.toBeInstanceOf(NoopConstraint);
  });

  it('`constraints[i].data.index` is the position in the array', () => {
    const data = readData();
    data.constraints.forEach((c, i) => expect(c.index).toBe(i));
  });

  it('no matrix is NaN in the setup pose', () => {
    expectFinite(heroi(), 'setup');
  });

  it('the IK really moves the arm', () => {
    // Setup pose: arm = -160, forearm = 20. The target `hand_target` is at
    // (30, 60) in the world, which the chain cannot reach with those angles.
    const off = new Skeleton(readData());
    off.setToSetupPose();
    off.findConstraint('ik_arm')!.mix = 0; // after the setup pose: it restores mix
    off.updateWorldTransform(0);
    expect(off.findBone('arm')!.arotation).toBeCloseTo(-160, 10);
    expect(off.findBone('forearm')!.arotation).toBeCloseTo(20, 10);

    const on = heroi();
    const arm = on.findBone('arm')!;
    const forearm = on.findBone('forearm')!;
    expect(arm.arotation).toBeCloseTo(-166.75948008, 6);
    expect(forearm.arotation).toBeCloseTo(0, 6);
    // The local pose is untouched: constraints write the applied pose (5.2).
    expect(arm.rotation).toBe(-160);
    expect(forearm.rotation).toBe(20);
    // The world matrix followed the applied pose.
    expect(forearm.worldX).not.toBeCloseTo(off.findBone('forearm')!.worldX, 3);
  });

  it('the transform constraint leans the head with the torso', () => {
    // `head_lean`: local + relative, mixRotation 0.05 over the torso rotation.
    const skeleton = heroi();
    const head = skeleton.findBone('head')!;
    const torso = skeleton.findBone('torso')!;
    expect(head.rotation).toBe(0);
    expect(head.arotation).toBeCloseTo(torso.rotation * 0.05, 10);
    expect(head.arotation).not.toBe(0);
  });

  it('the path constraint places the cape bones on the path', () => {
    const skeleton = heroi();
    const off = new Skeleton(readData());
    off.setToSetupPose();
    off.findConstraint('cape_follow')!.mix = 0;
    off.updateWorldTransform(0);
    const moved = ['cape1', 'cape2'].some((n) => {
      const a = skeleton.findBone(n)!;
      const b = off.findBone(n)!;
      return Math.hypot(a.worldX - b.worldX, a.worldY - b.worldY) > 1e-6
        || Math.abs(a.arotation - b.arotation) > 1e-6;
    });
    expect(moved).toBe(true);
  });

  it('the physics constraint moves the hair as the clock advances', () => {
    const skeleton = heroi();
    const hair = skeleton.findBone('hair')!;
    const first = hair.arotation;
    for (let i = 0; i < 30; i++) skeleton.advance(1 / 60);
    expect(hair.arotation).not.toBeCloseTo(first, 6);
    expectFinite(skeleton, 'physics 0.5s');
  });

  it('`physicsReset` reaches the PhysicsConstraint', () => {
    const skeleton = heroi();
    const hair = skeleton.findBone('hair')!;
    for (let i = 0; i < 30; i++) skeleton.advance(1 / 60);
    const settled = hair.arotation;
    skeleton.physicsReset();
    skeleton.updateWorldTransform();
    // After the reset the spring starts over from the bone pose.
    expect(hair.arotation).not.toBeCloseTo(settled, 6);
    skeleton.physicsReset();
    skeleton.updateWorldTransform();
    const afterFirst = hair.arotation;
    skeleton.physicsReset();
    skeleton.updateWorldTransform();
    expect(hair.arotation).toBeCloseTo(afterFirst, 10); // reset is idempotent
  });

  it('the driver writes the head and the morph from `lookX`', () => {
    const skeleton = heroi();
    const head = skeleton.findBone('head')!;
    const neutral = head.arotation;
    expect(skeleton.morphWeights[0]).toBeCloseTo(0.5, 10); // keys -1 -> 0, 1 -> 1

    expect(skeleton.setParameter('lookX', 1)).toBe(true);
    skeleton.updateWorldTransform();
    expect(head.arotation).toBeCloseTo(neutral + 12, 6); // mode add, key (1, 12)
    expect(skeleton.morphWeights[0]).toBeCloseTo(1, 10);

    skeleton.setParameter('lookX', -1);
    skeleton.updateWorldTransform();
    expect(head.arotation).toBeCloseTo(neutral - 12, 6);
    expect(skeleton.morphWeights[0]).toBeCloseTo(0, 10);
  });
});

describe('heroi.bone: animations', () => {
  const EXPECTED: Record<string, string[]> = {
    idle: [],
    walk: ['step', 'step'],
    attack: ['hit'],
  };

  for (const name of ['idle', 'walk', 'attack']) {
    it(`"${name}" plays from start to end at 1/60 s without NaN`, () => {
      const skeleton = heroi();
      const animation = skeleton.data.animations.find((a) => a.name === name)!;
      const fired: FiredEvent[] = [];
      const step = 1 / 60;
      let prev = -Infinity;
      let t = 0;
      let frames = 0;
      while (t <= animation.duration + 1e-9) {
        pose(skeleton, animation, t, t);
        applyResets(skeleton, animation, prev, t, false);
        fireEvents(animation, prev, t, false, fired);
        expectFinite(skeleton, `${name} @ ${t.toFixed(4)}`);
        prev = t;
        t += step;
        frames++;
      }
      expect(frames).toBeGreaterThan(1);
      expect(fired.map((f) => f.key.event.name)).toEqual(EXPECTED[name]);
      expect(collectDrawables(skeleton).length).toBeGreaterThan(0);
    });
  }

  it('"walk" fires its two `step` events with the keyed values', () => {
    const skeleton = heroi();
    const walk = skeleton.data.animations.find((a) => a.name === 'walk')!;
    const fired = fireEvents(walk, -Infinity, walk.duration, false);
    expect(fired.map((f) => f.time)).toEqual([0.25, 0.75]);
    expect(fired.map((f) => f.key.int)).toEqual([1, 2]);
    expect(fired.map((f) => f.key.balance)).toEqual([-0.3, 0.3]);
    expect(fired[0].key.volume).toBeCloseTo(0.8, 10); // default of the event
  });

  it('"walk" looped over three cycles fires six events', () => {
    const skeleton = heroi();
    const walk = skeleton.data.animations.find((a) => a.name === 'walk')!;
    const fired = fireEvents(walk, -Infinity, 3 * walk.duration, true);
    expect(fired.length).toBe(6);
    expect(fired.map((f) => f.time)).toEqual([0.25, 0.75, 1.25, 1.75, 2.25, 2.75]);
  });
});

describe('heroi.bone: draw list', () => {
  it('returns the drawables in draw order, with the clipping mask applied', () => {
    const skeleton = heroi();
    const drawables = collectDrawables(skeleton);
    expect(drawables.length).toBeGreaterThan(0);
    expect(drawables.map((d) => `${d.slot.data.name}/${d.attachment.name}`)).toEqual([
      'cape_upper/cape_upper', 'cape_lower/cape_lower', 'hair/hair',
      'arm_back/arm_back', 'forearm_back/forearm_back', 'hand_back/hand_back',
      'leg_back/thigh_back', 'shin_back/shin_back', 'foot_back/foot_back',
      'body/body', 'head/face',
      'leg_front/thigh', 'shin_front/shin', 'foot_front/foot',
      'arm/arm', 'forearm/forearm', 'sword_blade/blade', 'weapon/sword', 'hand/hand',
    ]);
    // `mask` clips only `body` and `head` (spec 7.7: `end` + `slots`).
    expect(drawables.filter((d) => d.clip !== null).map((d) => d.slot.data.name)).toEqual(['body', 'head']);
    const clip = drawables.find((d) => d.slot.data.name === 'body')!.clip!;
    expect(clip.polygon.length % 2).toBe(0);
    expect(clip.polygon.length).toBeGreaterThanOrEqual(6);
    for (const v of clip.polygon) expect(Number.isFinite(v)).toBe(true);
  });

  it('still has something to draw at the end of every animation', () => {
    const skeleton = heroi();
    for (const animation of skeleton.data.animations) {
      pose(skeleton, animation, animation.duration, animation.duration);
      expect(collectDrawables(skeleton).length, animation.name).toBeGreaterThan(0);
    }
  });
});
