/**
 * Animation application (spec 9.10), sequence frames (9.6), events (8.6),
 * resets (9.8), tags (8.5), final color (7.12) and the draw walk (7.7, 7.13).
 * Every expected value is derived by hand from the spec text.
 */

import { readFileSync } from 'node:fs';
import { loadSkeletonData, loadAtlas } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import {
  findKeyIndex, evaluateNumber, evaluateComponents, evaluateStepped, evaluateDeform, applyAnimation, pose,
  activeTags, fireEvents, applyResets, applyDrawOrder,
} from '../src/animation.js';
import { computeSequenceFrame, sequenceFrameAt } from '../src/sequence-frame.js';
import { computeFinalColor, shadeTexel, blendFactors } from '../src/color.js';
import { collectDrawables } from '../src/render-list.js';
import { MeshAttachment, RegionAttachment } from '../src/data.js';
import { sampleCurve } from '../src/curve.js';
import '../src/constraints/physics.js';
import '../src/constraints/transform.js';
import { PointAttachment, WeightsTimelineData } from '../src/data.js';
import { evaluateWeights } from '../src/animation.js';
import { runStart } from '../src/animation.js';

const EXAMPLES = process.cwd().replace(/\\/g, '/') + '/formato/exemplos/';
const header = { version: '1.0', minVersion: '1.0', generator: 'test' };

const mesh = { type: 'mesh', vertices: [0, 0, 10, 0, 0, 10], uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2] };

/** A rig with one animated arm, two slots, a mesh with a deform and a region with a sequence. */
function rig() {
  return loadSkeletonData({
    bone: header,
    bones: [{ name: 'root' }, { name: 'arm', parent: 'root', x: 10 }],
    slots: [{ name: 'a', bone: 'arm', attachment: 'r' }, { name: 'b', bone: 'arm', attachment: 'm' }, { name: 'c', bone: 'root' }],
    skins: [{ name: 'default', attachments: {
      a: { r: { type: 'region', width: 10, height: 10, sequence: { count: 3 } }, r2: { type: 'region', width: 2, height: 2 } },
      b: { m: mesh },
    } }],
    events: [{ name: 'step' }, { name: 'hit', int: 7 }],
    parameters: [{ name: 'p', min: 0, max: 1 }],
    morphs: [{ name: 'smile', min: 0, max: 1, targets: [{ slot: 'b', attachment: 'm', offsets: [0, 0, 1, 1] }] }],
    variables: [{ name: 'n', type: 'int' }, { name: 's', type: 'string', default: 'x' }],
    tags: ['idle', 'a', 'b'],
    constraints: [
      { type: 'transform', name: 'tc', bones: ['arm'], target: 'root', mix: 0 },
      { type: 'physics', name: 'ph', bone: 'arm', x: 1 },
    ],
    animations: [{
      name: 'anim', duration: 2, loop: true, tags: ['idle'],
      timelines: [
        { type: 'bone', target: 'arm', property: 'rotation', keys: [{ time: 0, value: 350 }, { time: 1, value: 10 }] },
        { type: 'bone', target: 'arm', property: 'x', keys: [{ time: 0.5, value: 5, curve: 'stepped' }, { time: 1, value: 20 }, { time: 1.5, value: 30, curve: [1.2, 25, 1.4, 25] }] },
        { type: 'bone', target: 'arm', property: 'inheritRotation', keys: [{ time: 1, value: false }] },
        { type: 'slot', target: 'a', property: 'color', keys: [{ time: 0, value: [1, 0, 0, 1] }, { time: 1, value: [0, 1, 0, 0.5] }] },
        { type: 'slot', target: 'a', property: 'darkColor', keys: [{ time: 0, value: null }, { time: 1, value: [0.2, 0.4, 0.6] }, { time: 2, value: [0.4, 0.4, 0.4] }] },
        { type: 'slot', target: 'a', property: 'attachment', keys: [{ time: 1, value: 'r2' }, { time: 1.5, value: null }] },
        { type: 'slot', target: 'a', property: 'visible', keys: [{ time: 1, value: false }] },
        { type: 'drawOrder', keys: [{ time: 0, value: [] }, { time: 1, value: [{ slot: 'c', offset: -2 }] }] },
        { type: 'deform', target: 'b', attachment: 'm', keys: [{ time: 0, value: [] }, { time: 1, value: [2, 4], offset: 2 }] },
        { type: 'sequence', target: 'a', attachment: 'r', keys: [{ time: 1, value: { mode: 'loop', index: 0, delay: 0.25 } }] },
        { type: 'event', keys: [{ time: 0, event: 'step' }, { time: 1, event: 'hit', int: 9 }] },
        { type: 'constraint', target: 'tc', property: 'mix', keys: [{ time: 0, value: 0 }, { time: 1, value: 0.5 }] },
        { type: 'constraint', target: 'ph', property: 'reset', keys: [{ time: 0.5 }] },
        { type: 'parameter', target: 'p', keys: [{ time: 0, value: -1 }, { time: 1, value: 3 }] },
        { type: 'morph', target: 'smile', keys: [{ time: 0, value: 0 }, { time: 1, value: 2 }] },
        { type: 'variable', target: 'n', keys: [{ time: 0, value: 0 }, { time: 1, value: 3.9 }] },
        { type: 'variable', target: 's', keys: [{ time: 0.5, value: 'y' }] },
        { type: 'tag', keys: [{ time: 0.5, value: ['a'] }, { time: 1, value: ['b'] }] },
        { type: 'nested', target: 'c', property: 'animation', keys: [{ time: 0, value: 'run' }] },
        { type: 'nested', target: 'c', property: 'time', keys: [{ time: 0, value: 0 }, { time: 2, value: 4 }] },
      ],
    }],
  });
}

describe('evaluate (spec 9.10, 9.3)', () => {
  const data = rig();
  const anim = data.animations[0];
  const rotation = anim.timelines[0];
  const x = anim.timelines[1];
  if (rotation.kind !== 'bone.number' || x.kind !== 'bone.number') throw new Error('kind');

  it('finds the key by binary search', () => {
    const times = Float64Array.from([0, 1, 2.5, 4]);
    expect(findKeyIndex(times, -1)).toBe(-1);
    expect(findKeyIndex(times, 0)).toBe(0);
    expect(findKeyIndex(times, 0.99)).toBe(0);
    expect(findKeyIndex(times, 1)).toBe(1);
    expect(findKeyIndex(times, 3)).toBe(2);
    expect(findKeyIndex(times, 9)).toBe(3);
    expect(findKeyIndex(new Float64Array(0), 1)).toBe(-1);
  });

  it('rotation does not wrap: 350 -> 10 passes through 180 at the middle', () => {
    expect(evaluateNumber(rotation.keys, 0.5)).toBeCloseTo(180, 12);
    expect(evaluateNumber(rotation.keys, 0.25)).toBeCloseTo(265, 12);
  });

  it('before the first key the first key holds; after the last, the last', () => {
    expect(evaluateNumber(x.keys, 0)).toBe(5);
    expect(evaluateNumber(x.keys, -3)).toBe(5);
    expect(evaluateNumber(x.keys, 1.5)).toBe(30);
    expect(evaluateNumber(x.keys, 99)).toBe(30);
    expect(evaluateNumber(rotation.keys, 5)).toBe(10);
  });

  it('stepped holds the key value until the next key', () => {
    expect(evaluateNumber(x.keys, 0.75)).toBe(5);
    expect(evaluateNumber(x.keys, 0.999)).toBe(5);
    expect(evaluateNumber(x.keys, 1)).toBe(20);
  });

  it('bezier keys sample the exact curve', () => {
    // Key 1 (t 1, v 20) -> key 2 (t 1.5, v 30) with handles (1.2, 25) (1.4, 25): ease in-out, symmetric -> 25 at t 1.25.
    expect(evaluateNumber(x.keys, 1.25)).toBeCloseTo(25, 6);
    expect(evaluateNumber(x.keys, 1.1)).toBeCloseTo(sampleCurve(x.keys.curves[1], 0, 1, 1.5, 20, 30, 1.1), 12);
    expect(evaluateNumber(x.keys, 1.1)).toBeGreaterThan(20);
    expect(evaluateNumber(x.keys, 1.1)).toBeLessThan(22.5); // below the straight line (22)
  });

  it('evaluates every component and stepped values', () => {
    const color = anim.timelines[3];
    if (color.kind !== 'slot.color') throw new Error('kind');
    expect(Array.from(evaluateComponents(color.keys, 0.5, new Float64Array(4)))).toEqual([0.5, 0.5, 0, 0.75]);
    const attachment = anim.timelines[5];
    if (attachment.kind !== 'slot.attachment') throw new Error('kind');
    expect(evaluateStepped(attachment.keys, 0)).toBe('r2'); // first key before the first key
    expect(evaluateStepped(attachment.keys, 1.2)).toBe('r2');
    expect(evaluateStepped(attachment.keys, 1.5)).toBeNull();
  });

  it('deform interpolates element by element with the single curve factor (spec 9.6)', () => {
    const deform = anim.timelines[8];
    if (deform.kind !== 'deform') throw new Error('kind');
    const out = new Float64Array(6);
    expect(evaluateDeform(deform, 0, out)).toBeNull(); // empty key: no deform
    expect(Array.from(evaluateDeform(deform, 0.5, out)!)).toEqual([0, 0, 1, 2, 0, 0]);
    expect(Array.from(evaluateDeform(deform, 1, out)!)).toEqual([0, 0, 2, 4, 0, 0]);
    expect(Array.from(evaluateDeform(deform, 7, out)!)).toEqual([0, 0, 2, 4, 0, 0]);
  });
});

describe('sequence frames (spec 9.6)', () => {
  it('follows the seven modes on a 3-frame sequence', () => {
    const f = (mode: string, index: number, k: number) => computeSequenceFrame(mode as 'loop', index, 1, 0, k, 3);
    expect(f('hold', 1, 5)).toBe(1);
    expect(computeSequenceFrame('loop', 1, 0, 0, 5, 3)).toBe(1); // delay 0 = hold
    expect([0, 1, 2, 3, 4].map((k) => f('once', 1, k))).toEqual([1, 2, 2, 2, 2]);
    expect([0, 1, 2, 3, 4].map((k) => f('loop', 1, k))).toEqual([1, 2, 0, 1, 2]);
    expect([0, 1, 2, 3, 4, 5].map((k) => f('pingpong', 0, k))).toEqual([0, 1, 2, 1, 0, 1]);
    expect([0, 1, 2, 3].map((k) => f('onceReverse', 0, k))).toEqual([2, 1, 0, 0]);
    expect([0, 1, 2, 3].map((k) => f('loopReverse', 0, k))).toEqual([2, 1, 0, 2]);
    expect([0, 1, 2, 3, 4].map((k) => f('pingpongReverse', 0, k))).toEqual([2, 1, 0, 1, 2]);
    // One frame: pingpong p = 0 -> frame 0.
    expect(computeSequenceFrame('pingpong', 0, 1, 0, 9, 1)).toBe(0);
    // k uses floor((t - t0) / delay + 0.00001): a tiny rounding error still lands on the frame.
    expect(computeSequenceFrame('loop', 0, 0.1, 0, 0.3 - 1e-9, 3)).toBe(0);
    expect(computeSequenceFrame('loop', 0, 0.1, 0, 0.3, 3)).toBe(0);
    expect(computeSequenceFrame('loop', 0, 0.1, 0, 0.3000001, 3)).toBe(0);
  });

  it('setup before the first key, then the active key (spec 9.6)', () => {
    const data = rig();
    const tl = data.animations[0].timelines[9];
    if (tl.kind !== 'sequence') throw new Error('kind');
    expect(sequenceFrameAt(tl, 0.5)).toBe(-1);
    expect(sequenceFrameAt(tl, 1)).toBe(0);
    expect(sequenceFrameAt(tl, 1.6)).toBe(2); // k = floor(0.6 / 0.25) = 2
    expect(sequenceFrameAt(tl, 1.8)).toBe(0); // k = 3 -> 3 mod 3
  });
});

describe('applyAnimation / pose (spec 9.10)', () => {
  it('writes every timeline kind into the skeleton at t = 0.5', () => {
    const data = rig();
    const sk = new Skeleton(data);
    const anim = data.animations[0];
    applyAnimation(sk, anim, 0.5);
    const arm = sk.findBone('arm')!;
    expect(arm.rotation).toBeCloseTo(180, 12);
    expect(arm.x).toBe(5);
    expect(arm.inheritRotation).toBe(false); // first key before the first key
    const a = sk.findSlot('a')!;
    expect(Array.from(a.color)).toEqual([0.5, 0.5, 0, 0.75]);
    expect(a.darkColor).toBeNull(); // null -> value segment is stepped
    expect(a.attachment!.name).toBe('r2');
    expect(a.visible).toBe(false);
    expect(sk.drawOrder.map((s) => s.data.name)).toEqual(['a', 'b', 'c']);
    const b = sk.findSlot('b')!;
    expect(b.deformAttachment).toBe(b.attachment);
    expect(Array.from(b.deform!)).toEqual([0, 0, 1, 2, 0, 0]);
    expect(a.sequenceIndex).toBe(-1); // attachment is r2 now, not the sequence owner; and before the first key anyway
    expect(sk.constraints[0].mix).toBe(0.25);
    expect(sk.parameters[0]).toBe(1); // -1 .. 3 at the middle = 1 (inside [0, 1])
    expect(sk.morphWeights[0]).toBe(1); // 2 * 0.5 = 1 -> within [0, 1]
    expect(sk.variables[0]).toBe(1); // 3.9 * 0.5 = 1.95 -> int truncates to 1
    expect(sk.variables[1]).toBe('y');
    expect(sk.tags).toEqual(['idle', 'a']);
    const c = sk.findSlot('c')!;
    expect(c.nestedAnimation).toBe('run');
    expect(c.nestedAnimationSet).toBe(true);
    expect(c.nestedTime).toBe(1);
  });

  it('parameter values are constrained and the local pose is untouched by constraints', () => {
    const data = rig();
    const sk = new Skeleton(data);
    const anim = data.animations[0];
    applyAnimation(sk, anim, 0.25); // parameter: -1 + 4 * 0.25 = 0 -> 0 ; morph 0.5
    expect(sk.parameters[0]).toBe(0);
    applyAnimation(sk, anim, 1); // 3 -> clamped to max 1
    expect(sk.parameters[0]).toBe(1);
    expect(sk.morphWeights[0]).toBe(1);
    applyAnimation(sk, anim, 0);
    expect(sk.parameters[0]).toBe(0); // -1 clamped to min
  });

  it('deform, sequence and dark color follow the attachment shown by the slot', () => {
    const data = rig();
    const sk = new Skeleton(data);
    const anim = data.animations[0];
    applyAnimation(sk, anim, 1.6);
    const a = sk.findSlot('a')!;
    expect(a.attachment).toBeNull(); // attachment key at 1.5 = null
    expect(a.sequenceIndex).toBe(-1);
    // 0.2 + 0.2 * 0.6 = 0.32 ; 0.6 - 0.2 * 0.6 = 0.48
    expect(a.darkColor![0]).toBeCloseTo(0.32, 12);
    expect(a.darkColor![1]).toBeCloseTo(0.4, 12);
    expect(a.darkColor![2]).toBeCloseTo(0.48, 12);
    // Without the attachment timeline the sequence frame lands on the region.
    const noSwap = loadSkeletonData({
      bone: header, bones: [{ name: 'root' }], slots: [{ name: 'a', bone: 'root', attachment: 'r' }],
      skins: [{ name: 'default', attachments: { a: { r: { type: 'region', width: 1, height: 1, sequence: { count: 3 } } } } }],
      animations: [{ name: 'x', timelines: [{ type: 'sequence', target: 'a', attachment: 'r', keys: [{ time: 1, value: { mode: 'loop', delay: 0.25 } }] }] }],
    });
    const sk2 = new Skeleton(noSwap);
    applyAnimation(sk2, noSwap.animations[0], 1.6);
    expect(sk2.slots[0].sequenceIndex).toBe(2);
    expect((sk2.slots[0].attachment as RegionAttachment).frameIndexFor(sk2.slots[0])).toBe(2);
    applyAnimation(sk2, noSwap.animations[0], 0.2);
    expect(sk2.slots[0].sequenceIndex).toBe(-1);
  });

  it('deform without the mesh shown leaves the slot alone; morph and deform add up in the world', () => {
    const data = rig();
    const sk = new Skeleton(data);
    const anim = data.animations[0];
    const b = sk.findSlot('b')!;
    b.setAttachmentName(null);
    applyAnimation(sk, anim, 1);
    expect(b.deform).toBeNull();
    b.setAttachmentName('m');
    applyAnimation(sk, anim, 1);
    const m = b.attachment as MeshAttachment;
    const world = m.computeWorldVertices(b) as Float64Array;
    // vertex 1 = (10, 0) + deform (2, 4) + morph weight 1 * (1, 1) = (13, 5), arm at x 10 (rotation 10 at t = 1)
    const arm = sk.findBone('arm')!;
    sk.updateWorldTransform();
    m.computeWorldVertices(b, world);
    expect(world[2]).toBeCloseTo(arm.a * 13 + arm.b * 5 + arm.worldX, 9);
    expect(world[3]).toBeCloseTo(arm.c * 13 + arm.d * 5 + arm.worldY, 9);
  });

  it('draw order keys: [] = setup order, offsets applied in place', () => {
    const data = rig();
    const sk = new Skeleton(data);
    const before = sk.drawOrder;
    applyAnimation(sk, data.animations[0], 1);
    expect(sk.drawOrder).toBe(before); // same array, rewritten
    expect(sk.drawOrder.map((s) => s.data.name)).toEqual(['c', 'a', 'b']);
    applyAnimation(sk, data.animations[0], 0);
    expect(sk.drawOrder.map((s) => s.data.name)).toEqual(['a', 'b', 'c']);
    // Spec 4.4 / 9.5: offsets measured from the base order (here the array order).
    applyDrawOrder(sk, [{ slot: data.slots[1], offset: -1 }]);
    expect(sk.drawOrder.map((s) => s.data.name)).toEqual(['b', 'a', 'c']);
  });

  it('pose = setup + animation + world transform (spec 9.10 Pose)', () => {
    const data = rig();
    const sk = new Skeleton(data);
    sk.findBone('arm')!.y = 99; // dirt that setup must clear
    pose(sk, data.animations[0], 0.5, 3);
    const arm = sk.findBone('arm')!;
    expect(arm.y).toBe(0);
    expect(arm.rotation).toBeCloseTo(180, 12); // local pose: the animation value
    expect(sk.time).toBe(3);
    // Applied pose: the transform constraint (mix 0.25 at t 0.5, target root at rotation 0) turns
    // the arm a quarter of the way towards 0: 180 + normalized(0 - 180) * 0.25 = 180 + 180 * 0.25 = 225 = -135.
    expect(Math.abs(Math.abs(arm.arotation) - 135)).toBeLessThan(1e-9);
    expect(Math.abs(Math.abs(arm.worldRotationX) - 135)).toBeLessThan(1e-6);
    expect(arm.x).toBe(5); // the local pose is never written by a constraint (spec 5.2)
    expect(arm.ax).not.toBe(5); // the world-mode transform constraint also mixes the position
  });

  it('pose without constraints puts the arm exactly where the animation says', () => {
    const data = rig();
    const sk = new Skeleton(data);
    for (const c of sk.constraints) c.active = false;
    pose(sk, data.animations[0], 0.5);
    const arm = sk.findBone('arm')!;
    expect(arm.arotation).toBeCloseTo(180, 12);
    expect(arm.worldX).toBe(5);
    expect(arm.a).toBeCloseTo(-1, 12);
  });

  it('applies the heroi example without throwing and moves the torso', () => {
    const data = loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), {
      atlases: [loadAtlas(JSON.parse(readFileSync(EXAMPLES + 'heroi.atlas.json', 'utf8')))],
    });
    const sk = new Skeleton(data);
    const idle = data.findAnimation('idle')!;
    const torso = idle.timelines[0];
    if (torso.kind !== 'bone.number') throw new Error('kind');
    const mid = (torso.keys.times[0] + torso.keys.times[1]) / 2;
    pose(sk, idle, mid, 0.1);
    const expected = evaluateNumber(torso.keys, mid);
    expect(sk.findBone('torso')!.rotation).toBeCloseTo(expected, 12);
    expect(expected).toBeGreaterThan(90);
    for (const anim of data.animations) for (const t of [0, 0.3, anim.duration]) pose(sk, anim, t, t);
  });
});

describe('tags (spec 8.5)', () => {
  it('activeTags = animation.tags plus the last key; only animation.tags before the first key', () => {
    const data = rig();
    const anim = data.animations[0];
    expect(activeTags(anim, 0.2)).toEqual(['idle']);
    expect(activeTags(anim, 0.5)).toEqual(['idle', 'a']);
    expect(activeTags(anim, 1.5)).toEqual(['idle', 'b']);
    const untagged = loadSkeletonData({ bone: header, bones: [{ name: 'r' }], animations: [{ name: 'x', tags: ['t'] }] });
    expect(activeTags(untagged.animations[0], 0)).toEqual(['t']);
    const sk = new Skeleton(untagged);
    applyAnimation(sk, untagged.animations[0], 0);
    expect(sk.tags).toEqual(['t']);
  });
});

describe('events (spec 8.6) and physics reset keys (spec 9.8)', () => {
  const data = rig();
  const anim = data.animations[0]; // duration 2, keys: step @ 0, hit @ 1 (int 9)
  const names = (prev: number, now: number, loop: boolean) => fireEvents(anim, prev, now, loop).map((e) => `${e.key.event.name}@${e.time}`);

  it('fires on crossing, including the key at 0 on the first frame', () => {
    expect(names(-Infinity, 0, false)).toEqual(['step@0']);
    expect(names(0, 0.5, false)).toEqual([]);
    expect(names(0.5, 1, false)).toEqual(['hit@1']);
    expect(names(1, 4.5, false)).toEqual([]);
    const fired = fireEvents(anim, 0.5, 1, false);
    expect(fired[0].key.int).toBe(9); // key field overrides the definition
  });

  it('unrolls the loop and orders deliveries by time', () => {
    expect(names(1, 4.5, true)).toEqual(['step@2', 'hit@3', 'step@4']);
    expect(names(-Infinity, 0, true)).toEqual(['step@0']);
    expect(names(1.9, 2, true)).toEqual(['step@2']);
    expect(names(2, 2, true)).toEqual([]);
  });

  it('duration 0 never unrolls', () => {
    const d = loadSkeletonData({
      bone: header, bones: [{ name: 'r' }], events: [{ name: 'e' }],
      animations: [{ name: 'x', duration: 0, loop: true, timelines: [{ type: 'event', keys: [{ time: 0, event: 'e' }] }] }],
    });
    expect(fireEvents(d.animations[0], -Infinity, 0, true).length).toBe(1);
    expect(fireEvents(d.animations[0], 0, 5, true).length).toBe(0);
  });

  it('reset keys call physicsReset on the constraint when crossed', () => {
    const sk = new Skeleton(data);
    const phys = sk.constraints[1] as unknown as { reset(): void; data: { type: string } };
    expect(phys.data.type).toBe('physics');
    let resets = 0;
    const original = phys.reset.bind(phys);
    phys.reset = () => { resets++; original(); };
    expect(applyResets(sk, anim, 0, 0.4, false)).toBe(0);
    expect(applyResets(sk, anim, 0.4, 0.5, false)).toBe(1);
    expect(resets).toBe(1);
    expect(applyResets(sk, anim, 0.5, 4.6, true)).toBe(2); // 2.5 and 4.5
    expect(resets).toBe(3);
  });
});

describe('final color (spec 7.12) and draw walk (spec 7.7, 7.13)', () => {
  it('multiplies slot and attachment colors after clamping; dark defaults to black', () => {
    const data = loadSkeletonData({
      bone: header, bones: [{ name: 'r' }], slots: [{ name: 's', bone: 'r', attachment: 'a', color: [2, 0.5, 1, 0.5] }],
      skins: [{ name: 'default', attachments: { s: { a: { type: 'region', color: [1, 1, 0.5, 1] } } } }],
    });
    const sk = new Skeleton(data);
    const slot = sk.slots[0];
    const color = computeFinalColor(slot, slot.attachment!);
    expect(Array.from(color.light)).toEqual([1, 0.5, 0.5, 0.5]);
    expect(Array.from(color.dark)).toEqual([0, 0, 0]);
    expect(color.tintBlack).toBe(false);
    expect(Array.from(shadeTexel([1, 0, 0.5, 0.8], color, false))).toEqual([1, 0, 0.25, 0.4]);
    slot.darkColor = Float64Array.from([0.5, 0.5, 0.5]);
    computeFinalColor(slot, slot.attachment!, color);
    expect(color.tintBlack).toBe(true);
    // straight: r = 1*1 + 0*0.5 = 1 ; g = 0*0.5 + 1*0.5 = 0.5 ; b = 0.5*0.5 + 0.5*0.5 = 0.5
    expect(Array.from(shadeTexel([1, 0, 0.5, 0.8], color, false))).toEqual([1, 0.5, 0.5, 0.4]);
    // premultiplied: r = 1*1*0.5 + (0.8-1)*0.5*0.5 = 0.45
    expect(shadeTexel([1, 0, 0.5, 0.8], color, true)[0]).toBeCloseTo(0.45, 12);
    expect(blendFactors('normal', false)).toEqual({ src: 'SRC_ALPHA', dst: 'ONE_MINUS_SRC_ALPHA' });
    expect(blendFactors('additive', true)).toEqual({ src: 'ONE', dst: 'ONE' });
  });

  it('walks the draw order with the clipping rules', () => {
    const clip = (extra: Record<string, unknown>) => ({ type: 'clipping', vertices: [0, 0, 1, 0, 0, 1], ...extra });
    const region = { type: 'region', width: 1, height: 1 };
    const build = (clipDef: Record<string, unknown>) => new Skeleton(loadSkeletonData({
      bone: header, bones: [{ name: 'r' }],
      slots: [
        { name: 'k', bone: 'r', attachment: 'k' }, { name: 'a', bone: 'r', attachment: 'x' }, { name: 'b', bone: 'r', attachment: 'x' },
        { name: 'hidden', bone: 'r', attachment: 'x', visible: false }, { name: 'c', bone: 'r', attachment: 'x' }, { name: 'box', bone: 'r', attachment: 'bb' },
      ],
      skins: [{ name: 'default', attachments: {
        k: { k: clipDef }, a: { x: region }, b: { x: region }, hidden: { x: region }, c: { x: region },
        box: { bb: { type: 'boundingbox', vertices: [0, 0, 1, 0, 0, 1] } },
      } }],
    }));
    const names = (sk: Skeleton) => collectDrawables(sk).map((d) => `${d.slot.data.name}${d.clip === null ? '' : '*'}`);
    expect(names(build(clip({ end: 'b' })))).toEqual(['a*', 'b*', 'c']);
    expect(names(build(clip({ slots: ['c'] })))).toEqual(['a', 'b', 'c*']);
    expect(names(build(clip({ end: 'b', slots: ['c'], invert: true })))).toEqual(['a', 'b', 'c*']);
    expect(names(build(clip({})))).toEqual(['a', 'b', 'c']);
    // `end` before the mask in the current order: clips until the end of the list.
    const sk = build(clip({ end: 'a' }));
    sk.drawOrder = [sk.slots[1], sk.slots[0], sk.slots[2], sk.slots[4]];
    expect(names(sk)).toEqual(['a', 'b*', 'c*']);
    const withClip = collectDrawables(build(clip({ end: 'b' })));
    expect(withClip[0].clip!.polygon.length).toBe(6);
    expect(withClip[0].clip!.invert).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// O desenho troca de osso (9.5) e os pesos animados (9.6), rascunho 0.2
// ---------------------------------------------------------------------------

describe('slot/bone com transform (9.5, F8)', () => {
  const h = { version: '1.0', minVersion: '1.0', generator: 'teste slot bone' };
  function espada(extraKeys: unknown[] = []): ReturnType<typeof loadSkeletonData> {
    return loadSkeletonData({
      bone: h,
      bones: [
        { name: 'root' },
        { name: 'mao', parent: 'root', x: 50, y: 100 },
        { name: 'costas', parent: 'root', x: -20, y: 120, rotation: 90 },
      ],
      slots: [{ name: 'espada', bone: 'mao', attachment: 'espada' }, { name: 'alvo', bone: 'mao', attachment: 'alvo' }],
      skins: [{ name: 'default', attachments: {
        espada: { espada: { type: 'region', width: 40, height: 10, x: 20 } },
        alvo: { alvo: { type: 'point', x: 10, rotation: 0 } },
      } }],
      animations: [{ name: 'guardar', duration: 1, timelines: [
        { type: 'slot', target: 'espada', property: 'bone', keys: [
          { time: 0, value: null },
          { time: 0.5, value: 'costas', transform: { x: 10, y: 0, rotation: -90, scaleX: 1, scaleY: 1 } },
        ] },
        { type: 'slot', target: 'alvo', property: 'bone', keys: [{ time: 0, value: 'costas' }] },
        ...extraKeys,
      ] }],
    }, { strict: true });
  }
  const verts = (sk: Skeleton): number[] => {
    const slot = sk.findSlot('espada')!;
    return Array.from((slot.attachment as RegionAttachment).computeWorldVertices(slot), (v) => Math.round(v * 1e6) / 1e6 + 0);
  };

  it('antes da chave mede da mão; depois, das costas através do transform, T antes de R', () => {
    const data = espada();
    const sk = new Skeleton(data);
    pose(sk, data.findAnimation('guardar')!, 0.49);
    expect(sk.findSlot('espada')!.bone.data.name).toBe('mao');
    expect(verts(sk)).toEqual([50, 95, 90, 95, 90, 105, 50, 105]);
    pose(sk, data.findAnimation('guardar')!, 0.51);
    expect(sk.findSlot('espada')!.bone.data.name).toBe('costas');
    expect(verts(sk)).toEqual([-20, 125, 20, 125, 20, 135, -20, 135]);
  });

  it('os ossos não mudam: o slot não entra na árvore', () => {
    const data = espada();
    const sk = new Skeleton(data);
    pose(sk, data.findAnimation('guardar')!, 0.49);
    const antes = sk.bones.map((b) => [b.worldX, b.worldY, b.a, b.b, b.c, b.d]);
    pose(sk, data.findAnimation('guardar')!, 0.51);
    expect(sk.bones.map((b) => [b.worldX, b.worldY, b.a, b.b, b.c, b.d])).toEqual(antes);
  });

  it('setToSetupPose devolve o osso do arquivo e larga o transform', () => {
    const data = espada();
    const sk = new Skeleton(data);
    pose(sk, data.findAnimation('guardar')!, 0.9);
    sk.setToSetupPose();
    const slot = sk.findSlot('espada')!;
    expect(slot.bone).toBe(slot.setupBone);
    expect(slot.boneTransform).toBeNull();
    sk.updateWorldTransform(0);
    expect(verts(sk)).toEqual([50, 95, 90, 95, 90, 105, 50, 105]);
  });

  it('o ponto segue o osso aplicado (7.9 com 9.5)', () => {
    const data = espada();
    const sk = new Skeleton(data);
    pose(sk, data.findAnimation('guardar')!, 0.2);
    const slot = sk.findSlot('alvo')!;
    const p = (slot.attachment as PointAttachment).computeWorldPosition(slot.boneMatrix);
    expect(p.x).toBeCloseTo(-20, 9);
    expect(p.y).toBeCloseTo(130, 9);
  });

  it('osso que o corpo não tem: a chave é ignorada, vale o de antes, com SLOT_BONE_UNMET', () => {
    const data = loadSkeletonData({
      bone: h,
      bones: [{ name: 'root' }, { name: 'mao', parent: 'root', x: 5 }, { name: 'costas', parent: 'root', x: 9 }],
      slots: [{ name: 's', bone: 'root', attachment: 'r' }],
      skins: [{ name: 'default', attachments: { s: { r: { type: 'region', width: 2, height: 2 } } } }],
      animations: [{ name: 'a', duration: 1, timelines: [{ type: 'slot', target: 's', property: 'bone', keys: [
        { time: 0, value: 'costas' }, { time: 0.5, value: 'rabo' },
      ] }] }],
    });
    expect(data.warnings.some((w) => w.message.startsWith('SLOT_BONE_UNMET'))).toBe(true);
    const sk = new Skeleton(data);
    pose(sk, data.findAnimation('a')!, 0.8);
    expect(sk.findSlot('s')!.bone.data.name).toBe('costas');
  });
});

describe('weights: pesos animados (9.6, F9)', () => {
  const h = { version: '1.0', minVersion: '1.0', generator: 'teste pesos' };
  function capa(): ReturnType<typeof loadSkeletonData> {
    return loadSkeletonData({
      bone: h,
      bones: [{ name: 'root' }, { name: 'hips', parent: 'root', y: 100 }, { name: 'torso', parent: 'hips', rotation: 90 }],
      slots: [{ name: 'capa', bone: 'hips', attachment: 'capa' }],
      skins: [{ name: 'default', attachments: { capa: { capa: {
        type: 'mesh', width: 40, height: 50,
        binding: { counts: [2, 1, 1], bones: [1, 2, 1, 1], positions: [0, 50, 50, 0, -20, 0, 20, 0], weights: [1, 0, 1, 1] },
        uvs: [0.5, 0, 0, 1, 1, 1], triangles: [0, 1, 2], hull: 3,
      } } } }],
      animations: [{ name: 'dobrar', duration: 1, timelines: [
        { type: 'bone', target: 'torso', property: 'rotation', keys: [{ time: 0, value: 90 }, { time: 1, value: 180 }] },
        { type: 'weights', target: 'capa', skin: 'default', attachment: 'capa', keys: [
          { time: 0, value: [1, 0, 1, 1] }, { time: 1, value: [0, 1, 1, 1] },
        ] },
      ] }],
    }, { strict: true });
  }
  const verts = (sk: Skeleton): number[] => {
    const slot = sk.findSlot('capa')!;
    return Array.from((slot.attachment as MeshAttachment).computeWorldVertices(slot), (v) => Math.round(v * 1e5) / 1e5 + 0);
  };

  it('em 0,5 o vértice é a média das duas contribuições, sem renormalizar', () => {
    const data = capa();
    const sk = new Skeleton(data);
    pose(sk, data.findAnimation('dobrar')!, 0.5);
    expect(verts(sk)).toEqual([-17.67767, 142.67767, -20, 100, 20, 100]);
    pose(sk, data.findAnimation('dobrar')!, 1);
    expect(verts(sk)).toEqual([-50, 100, -20, 100, 20, 100]);
  });

  it('evaluateWeights interpola elemento a elemento com uma curva', () => {
    const tl = capa().findAnimation('dobrar')!.timelines.find((t) => t.kind === 'weights') as WeightsTimelineData;
    expect(Array.from(evaluateWeights(tl, 0.25, new Float64Array(4)))).toEqual([0.75, 0.25, 1, 1]);
    expect(Array.from(evaluateWeights(tl, -1, new Float64Array(4)))).toEqual([1, 0, 1, 1]);
    expect(Array.from(evaluateWeights(tl, 9, new Float64Array(4)))).toEqual([0, 1, 1, 1]);
  });

  it('a setup pose devolve os pesos do arquivo (5.1)', () => {
    const data = capa();
    const sk = new Skeleton(data);
    pose(sk, data.findAnimation('dobrar')!, 1);
    sk.setToSetupPose();
    expect(sk.findSlot('capa')!.weights).toBeNull();
    sk.updateWorldTransform(0);
    expect(verts(sk)).toEqual([0, 150, -20, 100, 20, 100]);
  });

  it('chave de tamanho errado é ignorada com RANGE_WEIGHTS_SIZE; sem binding é recusada', () => {
    const def = (value: number[], mesh: Record<string, unknown>) => ({
      bone: h,
      bones: [{ name: 'root' }],
      slots: [{ name: 'm', bone: 'root', attachment: 'm' }],
      skins: [{ name: 'default', attachments: { m: { m: mesh } } }],
      animations: [{ name: 'a', timelines: [{ type: 'weights', target: 'm', attachment: 'm', keys: [
        { time: 0, value: [1, 1, 1] }, { time: 1, value },
      ] }] }],
    });
    const pesado = {
      type: 'mesh', uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2], hull: 3,
      binding: { counts: [1, 1, 1], bones: [0, 0, 0], positions: [0, 0, 1, 0, 0, 1], weights: [1, 1, 1] },
    };
    const d1 = loadSkeletonData(def([1, 1], pesado));
    expect(d1.warnings.some((w) => w.message.startsWith('RANGE_WEIGHTS_SIZE'))).toBe(true);
    expect((d1.animations[0].timelines[0] as WeightsTimelineData).times.length).toBe(1);
    const semPeso = { type: 'mesh', vertices: [0, 0, 1, 0, 0, 1], uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2], hull: 3 };
    const d2 = loadSkeletonData(def([1, 1, 1], semPeso));
    expect(d2.animations[0].timelines).toHaveLength(0);
    expect(d2.warnings.some((w) => w.message.startsWith('ORDER_TIMELINE_TARGET'))).toBe(true);
  });
});

describe('runStart: onde começou a corrida de chaves (Apêndice C, regra 1)', () => {
  const keys = { times: Float64Array.from([0, 0.5, 0.8, 1.5, 2]), values: [null, 'a', 'a', 'b', 'a'] };
  it('recua enquanto as chaves anteriores têm o mesmo valor; antes da primeira, 0', () => {
    expect(runStart(keys, -1)).toBe(0);
    expect(runStart(keys, 0.2)).toBe(0);
    expect(runStart(keys, 0.6)).toBe(0.5);
    expect(runStart(keys, 1.2)).toBe(0.5);
    expect(runStart(keys, 1.7)).toBe(1.5);
    expect(runStart(keys, 9)).toBe(2);
  });
});
