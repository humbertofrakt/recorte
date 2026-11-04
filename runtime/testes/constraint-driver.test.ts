/**
 * Driver constraint (spec 8.2) and parameter values (spec 8.1). Every expected
 * number below is computed by hand from the pseudocode, in the comments.
 *
 * Base fixture used by most tests:
 *   parameter "p": min 0, max 90, default 0
 *   bone "arm": child of root, setup rotation 10
 *   driver "d": target bone arm.rotation, keys (input 0 -> 0), (input 90 -> 60)
 *   -> val(v) = 60 * v / 90 = v * 2/3
 */

import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { DriverConstraint } from '../src/constraints/driver.js';
import { TransformConstraint } from '../src/constraints/transform.js';
import { parameterValue } from '../src/parameters.js';
import type {
  AnimationDef, BoneDef, ConstraintDef, DriverTargetDef, MorphDef, ParameterDef, SkinDef, SlotDef, VariableDef,
} from '../src/types.js';

interface Parts {
  bones?: BoneDef[];
  slots?: SlotDef[];
  skins?: SkinDef[];
  parameters?: ParameterDef[];
  morphs?: MorphDef[];
  variables?: VariableDef[];
  constraints?: ConstraintDef[];
  animations?: AnimationDef[];
}

function load(parts: Parts) {
  return loadSkeletonData({
    bone: { version: '1.0', minVersion: '1.0', generator: 'test' },
    bones: parts.bones ?? [{ name: 'root' }],
    ...parts,
  } as Record<string, unknown>);
}

function build(parts: Parts): Skeleton {
  return new Skeleton(load(parts));
}

const ROOT: BoneDef = { name: 'root' };
const ARM: BoneDef = { name: 'arm', parent: 'root', rotation: 10 };
const P90: ParameterDef = { name: 'p', min: 0, max: 90, default: 0 };

/** Target bone arm.rotation with the base keyform (0 -> 0, 90 -> 60). */
function armRotationTarget(mode?: 'add' | 'replace'): DriverTargetDef {
  return {
    type: 'bone', target: 'arm', property: 'rotation', ...(mode === undefined ? {} : { mode }),
    keys: [{ input: 0, value: 0 }, { input: 90, value: 60 }],
  };
}

function baseDriver(extra: Partial<ConstraintDef> = {}): ConstraintDef {
  return { type: 'driver', name: 'd', parameter: 'p', targets: [armRotationTarget()], ...extra } as ConstraintDef;
}

/** Base skeleton: root + arm, parameter p, driver d. */
function baseSkeleton(driver: ConstraintDef = baseDriver()): Skeleton {
  return build({ bones: [ROOT, ARM], parameters: [P90], constraints: [driver] });
}

/** Sets the parameter and recomputes the pose. Returns the applied rotation of "arm". */
function armAt(sk: Skeleton, value: number): number {
  sk.setParameter('p', value);
  sk.updateWorldTransform();
  return sk.findBone('arm')!.arotation;
}

// ---------------------------------------------------------------------------

describe('registration', () => {
  it('replaces the noop factory for type "driver"', () => {
    const sk = baseSkeleton();
    const c = sk.findConstraint('d');
    expect(c).toBeInstanceOf(DriverConstraint);
    expect((c as DriverConstraint).data.parameter.name).toBe('p');
    expect((c as DriverConstraint).active).toBe(true);
  });
});

describe('targets mode: parameter drives a bone rotation', () => {
  it('reads the first keyform at the parameter minimum', () => {
    // v = 0 -> val = 0 ; replace, mix 1: cur 10 + (0 - 10) * 1 = 0
    expect(armAt(baseSkeleton(), 0)).toBeCloseTo(0, 10);
  });

  it('interpolates halfway between the two keyforms', () => {
    // v = 45 -> val = 0 + (60 - 0) * (45 - 0) / (90 - 0) = 30
    expect(armAt(baseSkeleton(), 45)).toBeCloseTo(30, 10);
  });

  it('reads the last keyform at the parameter maximum', () => {
    // v = 90 -> val = 60
    expect(armAt(baseSkeleton(), 90)).toBeCloseTo(60, 10);
  });

  it('interpolates linearly at an arbitrary input', () => {
    // v = 30 -> val = 60 * 30 / 90 = 20
    expect(armAt(baseSkeleton(), 30)).toBeCloseTo(20, 10);
  });

  it('never writes the local pose and does not accumulate between frames', () => {
    const sk = baseSkeleton();
    const arm = sk.findBone('arm')!;
    sk.setParameter('p', 90);
    sk.updateWorldTransform();
    sk.updateWorldTransform();
    expect(arm.rotation).toBe(10); // local pose untouched (spec 8.2)
    expect(arm.arotation).toBeCloseTo(60, 10);
  });

  it('holds the first / last key outside the key range (clamp, spec 8.2)', () => {
    // keys only cover 0..45; the parameter goes to 90.
    const sk = build({
      bones: [ROOT, ARM], parameters: [P90],
      constraints: [baseDriver({
        targets: [{ type: 'bone', target: 'arm', property: 'rotation', keys: [{ input: 0, value: 5 }, { input: 45, value: 25 }] }],
      } as Partial<ConstraintDef>)],
    });
    expect(armAt(sk, 90)).toBeCloseTo(25, 10); // after the last key: 25
    expect(armAt(sk, 0)).toBeCloseTo(5, 10); // at (and before) the first key: 5
  });

  it('honours a stepped curve between keyforms', () => {
    const sk = build({
      bones: [ROOT, ARM], parameters: [P90],
      constraints: [baseDriver({
        targets: [{ type: 'bone', target: 'arm', property: 'rotation', keys: [{ input: 0, value: 0, curve: 'stepped' }, { input: 90, value: 60 }] }],
      } as Partial<ConstraintDef>)],
    });
    expect(armAt(sk, 45)).toBeCloseTo(0, 10);
    expect(armAt(sk, 90)).toBeCloseTo(60, 10);
  });

  it('recomputes the descendants of a driven bone (dirty rule, spec 5.6)', () => {
    // arm setup rotation 10 driven to 90 (val 60 -> use a key that reaches 90).
    const sk = build({
      bones: [ROOT, { name: 'arm', parent: 'root' }, { name: 'hand', parent: 'arm', x: 10 }],
      parameters: [P90],
      constraints: [baseDriver({
        targets: [{ type: 'bone', target: 'arm', property: 'rotation', keys: [{ input: 0, value: 0 }, { input: 90, value: 90 }] }],
      } as Partial<ConstraintDef>)],
    });
    sk.setParameter('p', 90);
    sk.updateWorldTransform();
    // arm rotated 90 -> hand local (10, 0) lands on world (0, 10)
    const hand = sk.findBone('hand')!;
    expect(hand.worldX).toBeCloseTo(0, 10);
    expect(hand.worldY).toBeCloseTo(10, 10);
  });
});

describe('parameter range (spec 8.1)', () => {
  it('clamps a value below min and above max', () => {
    const sk = baseSkeleton();
    expect(armAt(sk, -50)).toBeCloseTo(0, 10); // clamped to 0 -> val 0
    expect(armAt(sk, 200)).toBeCloseTo(60, 10); // clamped to 90 -> val 60
  });

  it('wraps with repeat: r = 90, 100 -> 10 and -10 -> 80', () => {
    const sk = build({
      bones: [ROOT, ARM],
      parameters: [{ name: 'p', min: 0, max: 90, repeat: true }],
      constraints: [baseDriver({
        targets: [{ type: 'bone', target: 'arm', property: 'rotation', keys: [{ input: 0, value: 0 }, { input: 90, value: 90 }] }],
      } as Partial<ConstraintDef>)],
    });
    // ((100 - 0) mod 90 + 90) mod 90 = 10
    expect(armAt(sk, 100)).toBeCloseTo(10, 10);
    // ((-10) mod 90 + 90) mod 90 = 80
    expect(armAt(sk, -10)).toBeCloseTo(80, 10);
    // 90 wraps back to 0 (the range is [min, max))
    expect(armAt(sk, 90)).toBeCloseTo(0, 10);
  });

  it('takes the default in the setup pose', () => {
    const sk = build({
      bones: [ROOT, ARM],
      parameters: [{ name: 'p', min: 0, max: 90, default: 45 }],
      constraints: [baseDriver()],
    });
    sk.updateWorldTransform();
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(30, 10);
  });
});

describe('mode add vs replace (spec 8.2)', () => {
  // The local pose is moved to 40 (as an animation would), so the current value
  // (40) differs from the setup value (10) and the two modes diverge.
  function movedArm(mode: 'add' | 'replace', mix?: number): Skeleton {
    const sk = build({
      bones: [ROOT, ARM], parameters: [P90],
      constraints: [baseDriver({ targets: [armRotationTarget(mode)], ...(mix === undefined ? {} : { mix }) } as Partial<ConstraintDef>)],
    });
    sk.findBone('arm')!.rotation = 40;
    return sk;
  }

  it('replace takes the property to the value', () => {
    // cur 40, val 60, mix 1 -> 40 + (60 - 40) * 1 = 60
    expect(armAt(movedArm('replace'), 90)).toBeCloseTo(60, 10);
  });

  it('add sums the deviation from the setup value', () => {
    // cur 40, val 60, setup 10, mix 1 -> 40 + (60 - 10) * 1 = 90
    expect(armAt(movedArm('add'), 90)).toBeCloseTo(90, 10);
  });

  it('replace with mix 0.5 moves halfway to the value', () => {
    // 40 + (60 - 40) * 0.5 = 50
    expect(armAt(movedArm('replace', 0.5), 90)).toBeCloseTo(50, 10);
  });

  it('add with mix 0.5 sums half of the deviation', () => {
    // 40 + (60 - 10) * 0.5 = 65
    expect(armAt(movedArm('add', 0.5), 90)).toBeCloseTo(65, 10);
  });

  it('add of a driver whose value equals the setup value changes nothing', () => {
    // At v = 15 the keyform gives 10, the setup rotation: 40 + (10 - 10) = 40.
    expect(armAt(movedArm('add'), 15)).toBeCloseTo(40, 10);
  });
});

describe('mix (spec 6.1)', () => {
  it('goes partway with the constraint mix', () => {
    // cur 10, val 60, mix 0.5 -> 10 + 50 * 0.5 = 35
    expect(armAt(baseSkeleton(baseDriver({ mix: 0.5 } as Partial<ConstraintDef>)), 90)).toBeCloseTo(35, 10);
  });

  it('mix 0 leaves the applied pose alone', () => {
    expect(armAt(baseSkeleton(baseDriver({ mix: 0 } as Partial<ConstraintDef>)), 90)).toBeCloseTo(10, 10);
  });

  it('setToSetupPose restores the file mix', () => {
    const sk = baseSkeleton(baseDriver({ mix: 0.5 } as Partial<ConstraintDef>));
    const c = sk.findConstraint('d')!;
    c.mix = 1;
    c.setToSetupPose();
    expect(c.mix).toBe(0.5);
  });
});

describe('broken references stay quiet (spec 4.7)', () => {
  it('drops the whole driver when the parameter does not exist', () => {
    const data = load({ bones: [ROOT, ARM], parameters: [P90], constraints: [baseDriver({ parameter: 'nope' } as Partial<ConstraintDef>)] });
    expect(data.constraints.length).toBe(0);
    expect(data.warnings.some((w) => w.message.includes('parameter "nope" does not exist'))).toBe(true);
    const sk = new Skeleton(data);
    sk.updateWorldTransform();
    expect(sk.findBone('arm')!.arotation).toBe(10);
  });

  it('a driver whose only target is broken loads inactive and changes nothing', () => {
    const data = load({
      bones: [ROOT, ARM], parameters: [P90],
      constraints: [baseDriver({
        targets: [{ type: 'bone', target: 'ghost', property: 'rotation', keys: [{ input: 0, value: 0 }] }],
      } as Partial<ConstraintDef>)],
    });
    const sk = new Skeleton(data);
    const c = sk.findConstraint('d') as DriverConstraint;
    expect(c).toBeInstanceOf(DriverConstraint);
    expect(c.active).toBe(false);
    expect(armAt(sk, 90)).toBe(10);
  });

  it('keeps the valid targets when one of them is broken', () => {
    const sk = build({
      bones: [ROOT, ARM], parameters: [P90],
      constraints: [baseDriver({
        targets: [
          { type: 'bone', target: 'ghost', property: 'rotation', keys: [{ input: 0, value: 0 }] },
          armRotationTarget(),
        ],
      } as Partial<ConstraintDef>)],
    });
    expect((sk.findConstraint('d') as DriverConstraint).active).toBe(true);
    expect(armAt(sk, 90)).toBeCloseTo(60, 10);
  });

  it('ignores an unknown animation (continuous mode) without breaking the load', () => {
    const data = load({
      bones: [ROOT, ARM], parameters: [P90],
      constraints: [{ type: 'driver', name: 'd', parameter: 'p', animation: 'ghost' } as ConstraintDef],
    });
    expect(data.constraints.length).toBe(0);
    expect(() => new Skeleton(data).updateWorldTransform()).not.toThrow();
  });
});

describe('parameter source: a bone drives the parameter (spec 8.1)', () => {
  const HANDLE: BoneDef = { name: 'handle', parent: 'root', x: 50 };
  const SOURCED: ParameterDef = {
    name: 'p', min: 0, max: 90, default: 0,
    source: { bone: 'handle', property: 'x', from: 0, to: 100 },
  };

  it('maps the applied bone value into the parameter range', () => {
    const sk = build({ bones: [ROOT, HANDLE, ARM], parameters: [SOURCED], constraints: [baseDriver()] });
    sk.updateWorldTransform();
    // v = 0 + (50 - 0) / (100 - 0) * (90 - 0) = 45 -> val = 30
    expect(parameterValue(sk, sk.data.findParameter('p')!)).toBeCloseTo(45, 10);
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(30, 10);
  });

  it('wins over a value set through the API and is written back', () => {
    const sk = build({ bones: [ROOT, HANDLE, ARM], parameters: [SOURCED], constraints: [baseDriver()] });
    sk.setParameter('p', 90);
    sk.updateWorldTransform();
    expect(sk.parameters[0]).toBeCloseTo(45, 10);
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(30, 10);
  });

  it('follows the bone when it moves', () => {
    const sk = build({ bones: [ROOT, HANDLE, ARM], parameters: [SOURCED], constraints: [baseDriver()] });
    sk.findBone('handle')!.x = 100; // v = 90 -> val = 60
    sk.updateWorldTransform();
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(60, 10);
    sk.findBone('handle')!.x = 200; // out of range -> clamped to 90
    sk.updateWorldTransform();
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(60, 10);
  });
});

describe('continuous mode: the parameter is a time in a control animation (spec 8.2)', () => {
  const WAVE: AnimationDef = {
    name: 'wave', duration: 1,
    timelines: [{ type: 'bone', target: 'arm', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 90 }] }],
  };

  function continuous(extra: Partial<ConstraintDef> = {}): Skeleton {
    return build({
      bones: [ROOT, ARM], parameters: [P90], animations: [WAVE],
      constraints: [{ type: 'driver', name: 'd', parameter: 'p', animation: 'wave', ...extra } as ConstraintDef],
    });
  }

  it('maps the parameter range onto the animation duration', () => {
    const sk = continuous();
    // from = min = 0, to = max = 90, timeFrom = 0, timeTo = duration = 1
    // v = 45 -> t = 0 + (45 - 0) / 90 * 1 = 0.5 -> val = 45 ; replace, mix 1 -> 45
    expect(armAt(sk, 45)).toBeCloseTo(45, 10);
    expect(armAt(sk, 0)).toBeCloseTo(0, 10);
    expect(armAt(sk, 90)).toBeCloseTo(90, 10);
  });

  it('honours from / to / timeFrom / timeTo', () => {
    // from 30, to 60, timeFrom 0.2, timeTo 0.4
    // v = 45 -> t = 0.2 + (45 - 30) / 30 * 0.2 = 0.3 -> val = 27
    const sk = continuous({ from: 30, to: 60, timeFrom: 0.2, timeTo: 0.4 } as Partial<ConstraintDef>);
    expect(armAt(sk, 45)).toBeCloseTo(27, 10);
  });

  it('clamps the time to [min(timeFrom, timeTo), max(timeFrom, timeTo)]', () => {
    const sk = continuous({ from: 30, to: 60, timeFrom: 0.2, timeTo: 0.4 } as Partial<ConstraintDef>);
    // v = 90 -> t = 0.2 + (90 - 30) / 30 * 0.2 = 0.6 -> clamped to 0.4 -> val = 36
    expect(armAt(sk, 90)).toBeCloseTo(36, 10);
    // v = 0 -> t = 0.2 - 0.2 = 0.0 -> clamped to 0.2 -> val = 18
    expect(armAt(sk, 0)).toBeCloseTo(18, 10);
  });

  it('runs backwards when to < from', () => {
    // from 90, to 0: v = 45 -> t = 0 + (45 - 90) / (0 - 90) * 1 = 0.5 -> val 45
    const sk = continuous({ from: 90, to: 0 } as Partial<ConstraintDef>);
    expect(armAt(sk, 45)).toBeCloseTo(45, 10);
    expect(armAt(sk, 0)).toBeCloseTo(90, 10);
  });

  it('mode add sums the deviation from the setup value', () => {
    const sk = continuous({ mode: 'add' } as Partial<ConstraintDef>);
    sk.findBone('arm')!.rotation = 40;
    // t = 0.5 -> val 45 ; cur 40, setup 10 -> 40 + (45 - 10) = 75
    expect(armAt(sk, 45)).toBeCloseTo(75, 10);
  });

  it('mode replace with mix 0.5 moves halfway', () => {
    const sk = continuous({ mix: 0.5 } as Partial<ConstraintDef>);
    sk.findBone('arm')!.rotation = 40;
    // cur 40, val 45 -> 40 + 5 * 0.5 = 42.5
    expect(armAt(sk, 45)).toBeCloseTo(42.5, 10);
  });
});

describe('other target types (spec 8.2 target table)', () => {
  const MESH = {
    type: 'mesh', width: 10, height: 10,
    vertices: [0, 0, 10, 0, 10, 10, 0, 10],
    uvs: [0, 1, 1, 1, 1, 0, 0, 0],
    triangles: [0, 1, 2, 0, 2, 3],
    hull: 4,
  };
  const SKIN: SkinDef = {
    name: 'default',
    attachments: {
      head: {
        face: MESH as never,
        other: { type: 'region', width: 10, height: 10 } as never,
      },
    },
  };
  const HEAD: SlotDef = { name: 'head', bone: 'root', attachment: 'face' };

  it('writes the weight of a morph, clamped to its range (spec 8.3)', () => {
    const sk = build({
      bones: [ROOT], slots: [HEAD], skins: [SKIN], parameters: [P90],
      morphs: [{ name: 'smile', weight: 0, min: 0, max: 1, targets: [{ slot: 'head', attachment: 'face', offsets: [0, 0, 0, 3, 0, 0, 0, 0] }] }],
      constraints: [{
        type: 'driver', name: 'd', parameter: 'p',
        targets: [{ type: 'morph', target: 'smile', keys: [{ input: 0, value: 0 }, { input: 90, value: 1 }] }],
      } as ConstraintDef],
    });
    sk.setParameter('p', 45);
    sk.updateWorldTransform();
    expect(sk.morphWeights[0]).toBeCloseTo(0.5, 10);
    sk.setParameter('p', 90);
    sk.updateWorldTransform();
    expect(sk.morphWeights[0]).toBeCloseTo(1, 10);
  });

  it('writes a numeric variable, truncating int (spec 8.4)', () => {
    const sk = build({
      bones: [ROOT], parameters: [P90],
      variables: [{ name: 'v', type: 'float' }, { name: 'n', type: 'int' }],
      constraints: [{
        type: 'driver', name: 'd', parameter: 'p',
        targets: [
          { type: 'variable', target: 'v', keys: [{ input: 0, value: 0 }, { input: 90, value: 5 }] },
          { type: 'variable', target: 'n', keys: [{ input: 0, value: 0 }, { input: 90, value: 5 }] },
        ],
      } as ConstraintDef],
    });
    sk.setParameter('p', 45);
    sk.updateWorldTransform();
    expect(sk.variables[0]).toBeCloseTo(2.5, 10);
    expect(sk.variables[1]).toBe(2); // trunc(2.5)
  });

  it('writes another parameter, constrained to its own range', () => {
    const sk = build({
      bones: [ROOT, ARM],
      parameters: [P90, { name: 'q', min: 0, max: 1, default: 0 }],
      constraints: [{
        type: 'driver', name: 'd', parameter: 'p',
        targets: [{ type: 'parameter', target: 'q', keys: [{ input: 0, value: 0 }, { input: 90, value: 2 }] }],
      } as ConstraintDef],
    });
    sk.setParameter('p', 45);
    sk.updateWorldTransform();
    expect(sk.parameters[1]).toBeCloseTo(1, 10); // val 1 -> inside [0, 1]
    sk.setParameter('p', 90);
    sk.updateWorldTransform();
    expect(sk.parameters[1]).toBeCloseTo(1, 10); // val 2 -> clamped to 1
  });

  it('writes the mix of another constraint', () => {
    const sk = build({
      bones: [ROOT, { name: 'target', parent: 'root', x: 10, rotation: 90 }, ARM],
      parameters: [P90],
      constraints: [
        { type: 'transform', name: 't', bones: ['arm'], target: 'target', mix: 1, mixRotation: 1, mixX: 0, mixY: 0, mixScaleX: 0, mixScaleY: 0, mixShearY: 0 },
        {
          type: 'driver', name: 'd', parameter: 'p',
          targets: [{ type: 'constraint', target: 't', property: 'mix', keys: [{ input: 0, value: 0 }, { input: 90, value: 1 }] }],
        } as ConstraintDef,
      ],
    });
    sk.setParameter('p', 45);
    sk.updateWorldTransform();
    const t = sk.findConstraint('t') as TransformConstraint;
    expect(t).toBeInstanceOf(TransformConstraint); // also keeps the import alive: it registers the factory
    expect(t.mix).toBeCloseTo(0.5, 10);
    // Second frame: the transform constraint now runs with mix 0.5 (the driver
    // comes after it in the array, so the new mix lands on the next update).
    sk.updateWorldTransform();
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(10 + (90 - 10) * 0.5, 5);
  });

  it('writes the mix of a constraint declared after it (spec 8.2)', () => {
    // The useful case of 8.2: the driver comes first and drives the `mix` of a
    // later IK/transform, so the new mix lands on the same frame. The loader
    // resolves the driver targets in a second pass (`loadConstraints`).
    const sk = build({
      bones: [ROOT, { name: 'target', parent: 'root', x: 10, rotation: 90 }, ARM],
      parameters: [P90],
      constraints: [
        {
          type: 'driver', name: 'd', parameter: 'p',
          targets: [{ type: 'constraint', target: 't', property: 'mix', keys: [{ input: 0, value: 0 }, { input: 90, value: 1 }] }],
        } as ConstraintDef,
        { type: 'transform', name: 't', bones: ['arm'], target: 'target', mix: 1, mixRotation: 1, mixX: 0, mixY: 0, mixScaleX: 0, mixScaleY: 0, mixShearY: 0 },
      ],
    });
    expect(sk.data.warnings).toEqual([]);
    const t = sk.findConstraint('t') as TransformConstraint;
    expect(t).toBeInstanceOf(TransformConstraint);
    sk.setParameter('p', 45);
    sk.updateWorldTransform();
    expect(t.mix).toBeCloseTo(0.5, 10);
    // Same frame, no delay: the driver ran before the transform constraint.
    expect(sk.findBone('arm')!.arotation).toBeCloseTo(10 + (90 - 10) * 0.5, 5);
    // The array order (and therefore `index`) follows the file.
    expect(sk.data.constraints.map((c) => c.name)).toEqual(['d', 't']);
    expect(sk.data.constraints.map((c) => c.index)).toEqual([0, 1]);
  });

  it('writes the deform of the attachment the slot shows (spec 7.4)', () => {
    function deformDriver(mix: number): Skeleton {
      return build({
        bones: [ROOT], slots: [HEAD], skins: [SKIN], parameters: [P90],
        constraints: [{
          type: 'driver', name: 'd', parameter: 'p', mix,
          targets: [{
            type: 'deform', target: 'head', attachment: 'face',
            keys: [{ input: 0, value: [] }, { input: 90, value: [0, 3, 0, 0, 0, 0, 0, 0] }],
          }],
        } as ConstraintDef],
      });
    }
    const sk = deformDriver(1);
    sk.setParameter('p', 45);
    sk.updateWorldTransform();
    // Halfway between "no deform" (zeros) and the key: 3 * 0.5 = 1.5
    expect(Array.from(sk.findSlot('head')!.deform!)).toEqual([0, 1.5, 0, 0, 0, 0, 0, 0]);

    const half = deformDriver(0.5);
    half.setParameter('p', 90);
    half.updateWorldTransform();
    // cur 0, val 3, mix 0.5 -> 0 + 3 * 0.5 = 1.5
    expect(Array.from(half.findSlot('head')!.deform!)).toEqual([0, 1.5, 0, 0, 0, 0, 0, 0]);
  });

  it('leaves the deform alone when the slot shows another attachment', () => {
    const sk = build({
      bones: [ROOT], slots: [HEAD], skins: [SKIN], parameters: [P90],
      constraints: [{
        type: 'driver', name: 'd', parameter: 'p',
        targets: [{
          type: 'deform', target: 'head', attachment: 'face',
          keys: [{ input: 0, value: [] }, { input: 90, value: [0, 3, 0, 0, 0, 0, 0, 0] }],
        }],
      } as ConstraintDef],
    });
    sk.setAttachment('head', 'other');
    sk.setParameter('p', 90);
    sk.updateWorldTransform();
    expect(sk.findSlot('head')!.deform).toBeNull();
  });

  it('switches a slot attachment only when mix >= 0.5 (not interpolable)', () => {
    function attachmentDriver(mix: number): Skeleton {
      return build({
        bones: [ROOT], slots: [HEAD], skins: [SKIN], parameters: [P90],
        constraints: [{
          type: 'driver', name: 'd', parameter: 'p', mix,
          targets: [{ type: 'slot', target: 'head', property: 'attachment', keys: [{ input: 0, value: 'face' }, { input: 90, value: 'other' }] }],
        } as ConstraintDef],
      });
    }
    const low = attachmentDriver(0.4);
    low.setParameter('p', 90);
    low.updateWorldTransform();
    expect(low.findSlot('head')!.attachmentName).toBe('face');

    const high = attachmentDriver(0.6);
    high.setParameter('p', 90);
    high.updateWorldTransform();
    expect(high.findSlot('head')!.attachmentName).toBe('other');
  });

  it('blends a slot color component by component', () => {
    const sk = build({
      bones: [ROOT], slots: [{ name: 'head', bone: 'root', color: [1, 1, 1, 1] }], parameters: [P90],
      constraints: [{
        type: 'driver', name: 'd', parameter: 'p',
        targets: [{
          type: 'slot', target: 'head', property: 'color',
          keys: [{ input: 0, value: [1, 1, 1, 1] }, { input: 90, value: [1, 0, 0, 0.5] }],
        }],
      } as ConstraintDef],
    });
    sk.setParameter('p', 45);
    sk.updateWorldTransform();
    // val = [1, 0.5, 0.5, 0.75] ; replace with mix 1 -> the value itself
    expect(Array.from(sk.findSlot('head')!.color)).toEqual([1, 0.5, 0.5, 0.75]);
  });
});

describe('two drivers in a row (array order, spec 5.6)', () => {
  it('the second one adds on top of what the first wrote', () => {
    const sk = build({
      bones: [ROOT, ARM], parameters: [P90],
      constraints: [
        { type: 'driver', name: 'd1', parameter: 'p', targets: [armRotationTarget()] } as ConstraintDef,
        {
          type: 'driver', name: 'd2', parameter: 'p',
          targets: [{ type: 'bone', target: 'arm', property: 'rotation', mode: 'add', keys: [{ input: 0, value: 20 }, { input: 90, value: 20 }] }],
        } as ConstraintDef,
      ],
    });
    // d1 at v = 45: cur 10, val 30 -> 30. d2: cur 30, val 20, setup 10 -> 30 + (20 - 10) = 40.
    expect(armAt(sk, 45)).toBeCloseTo(40, 10);
  });
});
