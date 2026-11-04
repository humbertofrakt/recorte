/**
 * Path constraint (spec 6.4). Every expected value below is derived by hand
 * from the `pathApply` pseudocode of the spec, with the arithmetic written in
 * the comments; nothing is copied from the runtime output.
 */

import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { PathConstraint } from '../src/constraints/path.js';
import type { BoneDef, PathConstraintDef, PathAttachmentDef, AttachmentDef } from '../src/types.js';

// ---------------------------------------------------------------------------
// Paths used by the tests
//
// The `path` attachment stores `3K` points, `inX inY x y outX outY` per anchor
// (spec 7.8). With the two handles of a curve at the thirds of a straight
// segment the Bezier walks it at constant speed:
//   B(t) = 0*u^3 + (L/3)*3u^2 t + (2L/3)*3u t^2 + L*t^3
//        = L u^2 t + 2L u t^2 + L t^3 = L t (u + t)^2 = L t
// so every "third-handle" segment below has B(t) = L t and length L.
// ---------------------------------------------------------------------------

const H = 100 / 3;

/** Open, one curve, A0 (0,0) -> A1 (100,0). `B(t) = (100t, 0)`, length 100. */
const STRAIGHT: number[] = [
  -10, 0, // in0   (ignored: open path)
  0, 0, //   A0
  H, 0, //   out0
  2 * H, 0, // in1
  100, 0, // A1
  110, 0, // out1  (ignored)
];

/** Open, one curve, A0 (0,0) -> A1 (0,100). `B(t) = (0, 100t)`. */
const VERTICAL: number[] = [
  0, -10,
  0, 0,
  0, H,
  0, 2 * H,
  0, 100,
  0, 110,
];

/**
 * Open, two curves: (0,0) -> (100,0) -> (100,100). Each curve has length 100,
 * total 200. Curve 0 is `(100t, 0)`, curve 1 is `(100, 100t)`.
 */
const L_PATH: number[] = [
  -10, 0,
  0, 0, //     A0 (0,0)
  H, 0,
  2 * H, 0,
  100, 0, //   A1 (100,0)
  100, H,
  100, 2 * H,
  100, 100, // A2 (100,100)
  100, 110,
];

/**
 * Closed, two curves: A0 (0,0) -> A1 (100,0) -> back to A0. Curve 1 uses
 * `out1` and `in0`, both at the thirds, so it is `(100(1-t), 0)`. Total 200.
 */
const LOOP: number[] = [
  H, 0, //     in0  (used by the closing curve)
  0, 0, //     A0
  H, 0, //     out0
  2 * H, 0, // in1
  100, 0, //   A1
  2 * H, 0, // out1 (used by the closing curve)
];

/**
 * Open, one curve on the X axis with both handles at the origin:
 *   B(t) = 100 t^3.
 * Straight but NOT constant speed, so `constantSpeed` is visible.
 */
const CUBED: number[] = [
  -10, 0,
  0, 0, //   A0
  0, 0, //   out0 (on the anchor)
  0, 0, //   in1  (on the anchor)
  100, 0, // A1
  110, 0,
];

// ---------------------------------------------------------------------------

const ROOT: BoneDef = { name: 'root' };

interface Setup {
  bones?: BoneDef[];
  vertices?: number[];
  lengths?: number[];
  closed?: boolean;
  constantSpeed?: boolean;
  /** Replaces the `path` attachment of the target slot entirely. */
  attachment?: AttachmentDef | null;
  constraint?: Partial<PathConstraintDef>;
}

/**
 * Skeleton with a `root`, the given bones, a slot `track` on `root` showing a
 * `path` attachment, and one path constraint named `pc` over `bones`.
 */
function build(setup: Setup): Skeleton {
  const path: PathAttachmentDef = {
    type: 'path',
    lengths: setup.lengths ?? [100],
    vertices: setup.vertices ?? STRAIGHT,
    closed: setup.closed ?? false,
    constantSpeed: setup.constantSpeed ?? true,
  };
  const attachment = setup.attachment === undefined ? path : setup.attachment;
  const bones = setup.bones ?? [{ name: 'b', parent: 'root' }];
  const data = loadSkeletonData({
    bone: { version: '1.0', minVersion: '1.0', generator: 'test' },
    bones: [ROOT, ...bones],
    slots: [{ name: 'track', bone: 'root', attachment: 'track' }],
    skins: [{ name: 'default', attachments: { track: { track: attachment } } }],
    constraints: [{
      type: 'path',
      name: 'pc',
      target: 'track',
      bones: bones.map((b) => b.name),
      ...setup.constraint,
    } as PathConstraintDef],
  });
  const skeleton = new Skeleton(data);
  skeleton.updateWorldTransform(0);
  return skeleton;
}

function bone(skeleton: Skeleton, name: string) {
  const b = skeleton.findBone(name);
  if (b === null) throw new Error(`no bone "${name}"`);
  return b;
}

describe('registration', () => {
  it('replaces the noop factory for type "path"', () => {
    const sk = build({});
    const c = sk.findConstraint('pc');
    expect(c).toBeInstanceOf(PathConstraint);
    const pc = c as PathConstraint;
    expect(pc.target.data.name).toBe('track');
    expect(pc.bones.map((b) => b.data.name)).toEqual(['b']);
    expect(pc.pathAttachment?.closed).toBe(false);
  });

  it('setToSetupPose restores the animatable values', () => {
    const sk = build({ constraint: { position: 0.25, spacing: 3, mixRotation: 0.5, mixX: 0.25, mixY: 0.75 } });
    const pc = sk.findConstraint('pc') as PathConstraint;
    pc.position = 9;
    pc.spacing = 9;
    pc.mixRotation = 0;
    pc.mixX = 0;
    pc.mixY = 0;
    pc.mix = 0;
    pc.setToSetupPose();
    expect(pc.position).toBe(0.25);
    expect(pc.spacing).toBe(3);
    expect(pc.mixRotation).toBe(0.5);
    expect(pc.mixX).toBe(0.25);
    expect(pc.mixY).toBe(0.75);
    expect(pc.mix).toBe(1);
  });
});

describe('inactive cases (spec 6.4)', () => {
  // The bone sits at (7, 3) under an identity root: without the constraint its
  // world matrix is the identity translated to (7, 3).
  const PLACED: BoneDef[] = [{ name: 'b', parent: 'root', x: 7, y: 3 }];

  it('does nothing when the target slot shows no attachment', () => {
    const sk = build({ bones: PLACED, attachment: null });
    const b = bone(sk, 'b');
    expect((sk.findConstraint('pc') as PathConstraint).pathAttachment).toBeNull();
    expect(b.worldX).toBe(7);
    expect(b.worldY).toBe(3);
  });

  it('does nothing when the target slot shows an attachment that is not a path', () => {
    const sk = build({
      bones: PLACED,
      attachment: { type: 'region', width: 10, height: 10 },
    });
    const b = bone(sk, 'b');
    expect((sk.findConstraint('pc') as PathConstraint).pathAttachment).toBeNull();
    expect(b.worldX).toBe(7);
    expect(b.worldY).toBe(3);
  });

  it('does nothing with mix 0', () => {
    // mR = mX = mY = mix * ... = 0 -> the pseudocode returns before step 1.
    const sk = build({ bones: PLACED, constraint: { position: 0.5, mix: 0 } });
    const b = bone(sk, 'b');
    expect(b.worldX).toBe(7);
    expect(b.worldY).toBe(3);
  });

  it('does nothing when every per-property mix is 0', () => {
    const sk = build({
      bones: PLACED,
      constraint: { position: 0.5, mixRotation: 0, mixX: 0, mixY: 0 },
    });
    const b = bone(sk, 'b');
    expect(b.worldX).toBe(7);
    expect(b.worldY).toBe(3);
  });
});

describe('positionMode (spec 6.4)', () => {
  it('percent: position 0.5 on a 100 px path puts the bone at x 50', () => {
    // total = 100 ; pos = 0.5 * 100 = 50 ; q = 50
    // segment table (10 per curve, B(t) = 100t): 10 20 30 40 50 60 70 80 90 100
    // first entry >= 50 is index 4 -> prev 40, local (50-40)/10 = 1 -> t = (4+1)/10 = 0.5
    // B(0.5) = (50, 0) ; worldX += (50 - 0) * 1 = 50
    const sk = build({ constraint: { positionMode: 'percent', position: 0.5 } });
    const b = bone(sk, 'b');
    expect(b.worldX).toBeCloseTo(50, 9);
    expect(b.worldY).toBeCloseTo(0, 9);
  });

  it('fixed: position 25 is 25 px along the path', () => {
    // q = 25 ; first entry >= 25 is index 2 (30) -> prev 20, local 0.5
    // t = (2 + 0.5)/10 = 0.25 -> B = (25, 0)
    const sk = build({ constraint: { positionMode: 'fixed', position: 25 } });
    expect(bone(sk, 'b').worldX).toBeCloseTo(25, 9);
  });

  it('percent uses the whole closed path (two curves, total 200)', () => {
    // pos = 0.6 * 200 = 120 ; table: 10..100 (curve 0), 110..200 (curve 1)
    // first >= 120 is index 11 -> prev 110, local 1 -> curve 1, t = (1+1)/10 = 0.2
    // curve 1 is (100(1-t), 0) -> x = 80
    const sk = build({
      vertices: LOOP, closed: true, lengths: [100, 200],
      constraint: { positionMode: 'percent', position: 0.6 },
    });
    expect(bone(sk, 'b').worldX).toBeCloseTo(80, 9);
  });
});

describe('closed path wrap (spec 6.4)', () => {
  // Total 200. q = pos mod 200, brought back into [0, 200).
  // q = 150 -> curve 1 at arc 50 -> t = 0.5 -> x = 100 (1 - 0.5) = 50
  it('150 lands halfway down the return curve, at x 50', () => {
    const sk = build({
      vertices: LOOP, closed: true, lengths: [100, 200],
      constraint: { positionMode: 'fixed', position: 150 },
    });
    expect(bone(sk, 'b').worldX).toBeCloseTo(50, 9);
  });

  it('250 wraps to 50, on the way out, also x 50', () => {
    // 250 mod 200 = 50 -> curve 0 at t = 0.5 -> x = 50
    const sk = build({
      vertices: LOOP, closed: true, lengths: [100, 200],
      constraint: { positionMode: 'fixed', position: 250 },
    });
    expect(bone(sk, 'b').worldX).toBeCloseTo(50, 9);
  });

  it('-50 wraps to 150, x 50 again', () => {
    const sk = build({
      vertices: LOOP, closed: true, lengths: [100, 200],
      constraint: { positionMode: 'fixed', position: -50 },
    });
    expect(bone(sk, 'b').worldX).toBeCloseTo(50, 9);
  });
});

describe('out of range on an open path (spec 6.4)', () => {
  it('q < 0 extrapolates straight out of anchor 0, along its out handle', () => {
    // anchor 0 = (0,0), out handle = (100/3, 0) -> r = atan2(0, 33.33) = 0
    // P = (0 + (-25) cos 0, 0 + (-25) sin 0) = (-25, 0)
    const sk = build({ constraint: { positionMode: 'fixed', position: -25 } });
    expect(bone(sk, 'b').worldX).toBeCloseTo(-25, 9);
    expect(bone(sk, 'b').worldY).toBeCloseTo(0, 9);
  });

  it('q > total extrapolates straight out of the last anchor', () => {
    // last anchor = (100,0), its in handle = (200/3, 0) -> r = atan2(0, 33.33) = 0
    // p = 130 - 100 = 30 -> P = (100 + 30, 0) = (130, 0)
    const sk = build({ constraint: { positionMode: 'fixed', position: 130 } });
    expect(bone(sk, 'b').worldX).toBeCloseTo(130, 9);
  });
});

describe('spacingMode (spec 6.4)', () => {
  // Two independent bones under the root, so neither inherits what the
  // constraint writes into the other.
  const TWO = (length: number, scaleX = 1): BoneDef[] => [
    { name: 'b0', parent: 'root', length, scaleX },
    { name: 'b1', parent: 'root', length, scaleX },
  ];

  it('fixed: spacing 30 puts the bones 30 px apart', () => {
    // identity bones -> sqrt(a^2 + c^2) = 1 -> worldLen = setupLength
    // spaces[1] = spaces[2] = 30 * worldLen / setupLength = 30
    // samples: 10, 10+30 = 40, 40+30 = 70 -> bones at 10 and 40
    const sk = build({
      bones: TWO(20),
      constraint: { positionMode: 'fixed', position: 10, spacingMode: 'fixed', spacing: 30, mixRotation: 0 },
    });
    expect(bone(sk, 'b0').worldX).toBeCloseTo(10, 9);
    expect(bone(sk, 'b1').worldX).toBeCloseTo(40, 9);
  });

  it('fixed: the gap follows the world scale of the bone', () => {
    // scaleX 2 -> sqrt(a^2 + c^2) = 2 -> worldLen = 20 * 2 = 40
    // spaces[1] = 30 * 40 / 20 = 60 -> samples 0, 60, 120
    const sk = build({
      bones: TWO(20, 2),
      constraint: { positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 30, mixRotation: 0 },
    });
    expect(bone(sk, 'b0').worldX).toBeCloseTo(0, 9);
    expect(bone(sk, 'b1').worldX).toBeCloseTo(60, 9);
  });

  it('length: the gap is (setupLength + spacing) scaled to the world', () => {
    // (20 + 5) * 40/20... here scale 1: (20 + 5) * 1 = 25 -> samples 0, 25, 50
    // q = 25 -> first table entry >= 25 is 30 (index 2) -> t = (2 + 0.5)/10 = 0.25 -> x 25
    const sk = build({
      bones: TWO(20),
      constraint: { positionMode: 'fixed', position: 0, spacingMode: 'length', spacing: 5, mixRotation: 0 },
    });
    expect(bone(sk, 'b0').worldX).toBeCloseTo(0, 9);
    expect(bone(sk, 'b1').worldX).toBeCloseTo(25, 9);
  });

  it('percent: the gap is a fraction of the path length', () => {
    // spaces[i] = 0.25 -> step 2 multiplies by total 100 -> 25 -> samples 0, 25, 50
    const sk = build({
      bones: TWO(20),
      constraint: { positionMode: 'fixed', position: 0, spacingMode: 'percent', spacing: 0.25, mixRotation: 0 },
    });
    expect(bone(sk, 'b0').worldX).toBeCloseTo(0, 9);
    expect(bone(sk, 'b1').worldX).toBeCloseTo(25, 9);
  });

  it('proportional in chain mode uses m = n + 1 (decision 20)', () => {
    // world lengths 20 and 40 -> spaces[1] = 20, spaces[2] = 40, sum = 60
    // m = n + 1 = 3 -> k = 3 / 60 * 10 = 0.5 -> spaces = 10 and 20
    // samples: 0, 10, 30 -> bones at 0 and 10
    const sk = build({
      bones: [{ name: 'b0', parent: 'root', length: 20 }, { name: 'b1', parent: 'root', length: 40 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'proportional', spacing: 10,
        rotateMode: 'chain', mixRotation: 0,
      },
    });
    expect(bone(sk, 'b0').worldX).toBeCloseTo(0, 9);
    expect(bone(sk, 'b1').worldX).toBeCloseTo(10, 9);
  });

  it('proportional in tangent mode uses m = n (decision 20)', () => {
    // same lengths, sum 60, but m = n = 2 -> k = 2 / 60 * 10 = 1/3
    // spaces = 20/3 and 40/3 -> samples 0, 20/3, 20 -> bones at 0 and 20/3
    const sk = build({
      bones: [{ name: 'b0', parent: 'root', length: 20 }, { name: 'b1', parent: 'root', length: 40 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'proportional', spacing: 10,
        rotateMode: 'tangent', mixRotation: 0,
      },
    });
    expect(bone(sk, 'b0').worldX).toBeCloseTo(0, 9);
    expect(bone(sk, 'b1').worldX).toBeCloseTo(20 / 3, 9);
  });
});

describe('rotateMode (spec 6.4)', () => {
  it('tangent aligns the bone with the direction of the path', () => {
    // Vertical path, t = 0.5: B = (0, 50); the quadratic point one degree down
    // is (0, 100/3), so the tangent is atan2(50 - 33.33, 0) = PI/2.
    // r = PI/2 - atan2(c, a) = PI/2 - 0 ; cos 0, sin 1
    // a = 0*1 - 1*0 = 0 ; b = 0*0 - 1*1 = -1 ; c = 1*1 + 0*0 = 1 ; d = 0
    const sk = build({
      vertices: VERTICAL,
      constraint: { positionMode: 'percent', position: 0.5, rotateMode: 'tangent' },
    });
    const b = bone(sk, 'b');
    expect(b.worldX).toBeCloseTo(0, 9);
    expect(b.worldY).toBeCloseTo(50, 9);
    expect(b.a).toBeCloseTo(0, 9);
    expect(b.b).toBeCloseTo(-1, 9);
    expect(b.c).toBeCloseTo(1, 9);
    expect(b.d).toBeCloseTo(0, 9);
    expect(b.arotation).toBeCloseTo(90, 9);
  });

  it('tangent leaves a bone on a horizontal path unrotated', () => {
    // tangent of B(t) = (100t, 0) is atan2(0, +x) = 0 -> r = 0 - 0 = 0
    const sk = build({ constraint: { positionMode: 'percent', position: 0.5 } });
    expect(bone(sk, 'b').arotation).toBeCloseTo(0, 9);
  });

  it('mixRotation 0.5 applies half of the rotation', () => {
    // r = normalize(PI/2) * 0.5 = PI/4 -> arotation 45
    const sk = build({
      vertices: VERTICAL,
      constraint: { positionMode: 'percent', position: 0.5, rotateMode: 'tangent', mixRotation: 0.5 },
    });
    const b = bone(sk, 'b');
    expect(b.a).toBeCloseTo(Math.SQRT1_2, 9);
    expect(b.c).toBeCloseTo(Math.SQRT1_2, 9);
    expect(b.arotation).toBeCloseTo(45, 9);
  });

  it('chain points the bone at the position of the next bone', () => {
    // L path, spacing fixed 100, bones of setup length 100 (so the tip
    // correction is exactly zero). Samples: (0,0), (100,0), (100,100).
    // bone 0: dx 100, dy 0 -> r = atan2(0, 100) = 0 -> no rotation
    // bone 1: origin (100,0), dx 0, dy 100 -> r = atan2(100, 0) = PI/2
    //   cos 0, sin 1 -> a 0, b -1, c 1, d 0
    const sk = build({
      vertices: L_PATH, lengths: [100, 200],
      bones: [{ name: 'b0', parent: 'root', length: 100 }, { name: 'b1', parent: 'root', length: 100 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 100, rotateMode: 'chain',
      },
    });
    const b0 = bone(sk, 'b0');
    const b1 = bone(sk, 'b1');
    expect(b0.worldX).toBeCloseTo(0, 9);
    expect(b0.arotation).toBeCloseTo(0, 9);
    expect(b1.worldX).toBeCloseTo(100, 9);
    expect(b1.worldY).toBeCloseTo(0, 9);
    expect(b1.arotation).toBeCloseTo(90, 9);
  });

  it('tangent on the same path uses the tangent of the sample, not the next bone', () => {
    // tangent at sample 1 (end of curve 0) is atan2(0, 100 - 200/3) = 0,
    // so bone 1 stays unrotated where chain turned it 90 degrees.
    const sk = build({
      vertices: L_PATH, lengths: [100, 200],
      bones: [{ name: 'b0', parent: 'root', length: 100 }, { name: 'b1', parent: 'root', length: 100 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 100, rotateMode: 'tangent',
      },
    });
    expect(bone(sk, 'b1').worldX).toBeCloseTo(100, 9);
    expect(bone(sk, 'b1').arotation).toBeCloseTo(0, 9);
  });

  it('chain: the tip correction moves the ORIGIN of the next bone (decision 20)', () => {
    // Same L path, spacing 100, but bones of setup length 50: the tip of bone 0
    // only reaches x = 50 while the sample is at x = 100.
    // bone 0: r = atan2(0, 100) - atan2(0, 1) = 0 ; cos 1, sin 0 ; len 50
    //   bx += (50*(1*1 - 0*0) - 100) * 1 = -50 -> bx = 100 - 50 = 50
    //   by += (50*(0*1 + 1*0) - 0) * 1 = 0 -> by = 0
    // bone 1: origin (50, 0), sample 2 = (100,100) -> dx 50, dy 100
    //   r = atan2(100, 50) = 1.1071487 rad = 63.434949 degrees
    const sk = build({
      vertices: L_PATH, lengths: [100, 200],
      bones: [{ name: 'b0', parent: 'root', length: 50 }, { name: 'b1', parent: 'root', length: 50 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 100, rotateMode: 'chain',
      },
    });
    const b1 = bone(sk, 'b1');
    expect(b1.worldX).toBeCloseTo(50, 9);
    expect(b1.worldY).toBeCloseTo(0, 9);
    expect(b1.arotation).toBeCloseTo(Math.atan2(100, 50) * 180 / Math.PI, 9);
    expect(b1.arotation).toBeCloseTo(63.434948822922, 9);
  });

  it('tangent has no tip correction: the next bone sits on the sample', () => {
    const sk = build({
      vertices: L_PATH, lengths: [100, 200],
      bones: [{ name: 'b0', parent: 'root', length: 50 }, { name: 'b1', parent: 'root', length: 50 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 100, rotateMode: 'tangent',
      },
    });
    expect(bone(sk, 'b1').worldX).toBeCloseTo(100, 9);
  });

  it('chainScale stretches scaleX so the tip reaches the next position', () => {
    // setup length 50, spacing fixed 100 -> lengths[0] = 50, dx = 100
    // s = (sqrt(100^2) / 50 - 1) * 1 + 1 = 2 -> a = 1*2 = 2, c = 0
    // then r = atan2(0, 100) - atan2(0, 2) = 0 -> the matrix keeps a = 2
    const sk = build({
      bones: [{ name: 'b', parent: 'root', length: 50 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 100, rotateMode: 'chainScale',
      },
    });
    const b = bone(sk, 'b');
    expect(b.worldX).toBeCloseTo(0, 9);
    expect(b.a).toBeCloseTo(2, 9);
    expect(b.c).toBeCloseTo(0, 9);
    expect(b.ascaleX).toBeCloseTo(2, 9);
  });

  it('chainScale with mixRotation 0.5 halves the stretch', () => {
    // s = (100/50 - 1) * 0.5 + 1 = 1.5
    const sk = build({
      bones: [{ name: 'b', parent: 'root', length: 50 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 100,
        rotateMode: 'chainScale', mixRotation: 0.5,
      },
    });
    expect(bone(sk, 'b').a).toBeCloseTo(1.5, 9);
  });
});

describe('offsetRotation (spec 6.4)', () => {
  it('adds degrees to the computed rotation', () => {
    // The slot bone is the identity root: det = 1 > 0 -> offR = 90 * DEG2RAD = PI/2
    // tangent of a horizontal path is 0 -> r = 0 - 0 + PI/2 = PI/2 -> arotation 90
    const sk = build({
      constraint: { positionMode: 'percent', position: 0.5, rotateMode: 'tangent', offsetRotation: 90 },
    });
    expect(bone(sk, 'b').arotation).toBeCloseTo(90, 9);
  });

  it('a non-zero offsetRotation turns the tip correction off (tip = false)', () => {
    // Same case as the tip test, but with offsetRotation 0.000001 degrees:
    // `tip` is only true when offsetRotation is exactly 0, so bone 1 lands on
    // the sample (x 100) instead of on the tip of bone 0 (x 50).
    const sk = build({
      vertices: L_PATH, lengths: [100, 200],
      bones: [{ name: 'b0', parent: 'root', length: 50 }, { name: 'b1', parent: 'root', length: 50 }],
      constraint: {
        positionMode: 'fixed', position: 0, spacingMode: 'fixed', spacing: 100,
        rotateMode: 'chain', offsetRotation: 1e-6,
      },
    });
    expect(bone(sk, 'b1').worldX).toBeCloseTo(100, 9);
  });
});

describe('mixX / mixY (spec 6.4)', () => {
  it('mixX 0.5 moves the bone half the way, mixY 0 leaves Y alone', () => {
    // bone at (10, 4) ; sample (50, 0)
    // worldX += (50 - 10) * 0.5 = 20 -> 30 ; worldY unchanged (4)
    const sk = build({
      bones: [{ name: 'b', parent: 'root', x: 10, y: 4 }],
      constraint: { positionMode: 'percent', position: 0.5, mixX: 0.5, mixY: 0, mixRotation: 0 },
    });
    const b = bone(sk, 'b');
    expect(b.worldX).toBeCloseTo(30, 9);
    expect(b.worldY).toBeCloseTo(4, 9);
  });

  it('mixY 1 pulls the bone onto the path in Y', () => {
    // vertical path, sample (0, 50) ; bone at (10, 4)
    // mixX 0 -> worldX stays 10 ; mixY 1 -> worldY = 4 + (50 - 4) = 50
    const sk = build({
      vertices: VERTICAL,
      bones: [{ name: 'b', parent: 'root', x: 10, y: 4 }],
      constraint: { positionMode: 'percent', position: 0.5, mixX: 0, mixY: 1, mixRotation: 0 },
    });
    const b = bone(sk, 'b');
    expect(b.worldX).toBeCloseTo(10, 9);
    expect(b.worldY).toBeCloseTo(50, 9);
  });

  it('the general mix multiplies every per-property mix', () => {
    // mix 0.5, mixX 1 -> mX = 0.5 -> worldX = 0 + (50 - 0) * 0.5 = 25
    const sk = build({
      constraint: { positionMode: 'percent', position: 0.5, mix: 0.5, mixRotation: 0, mixY: 0 },
    });
    expect(bone(sk, 'b').worldX).toBeCloseTo(25, 9);
  });
});

describe('constantSpeed (spec 6.4, 7.8)', () => {
  // CUBED: B(t) = (100 t^3, 0). Sampling t = 0.1 .. 1.0 gives the points
  //   0.1  0.8  2.7  6.4  12.5  21.6  34.3  51.2  72.9  100
  // and, since they lie on a straight line, that IS the cumulative length
  // table. Total = 100.
  it('true: walks the curve by arc length', () => {
    // pos = 0.5 * 100 = 50 ; first entry >= 50 is index 7 (51.2)
    //   prev 34.3, segment 51.2 - 34.3 = 16.9, local = (50 - 34.3)/16.9
    //   t = (7 + local) / 10 ; x = 100 t^3
    const t = (7 + (50 - 34.3) / (51.2 - 34.3)) / 10;
    const sk = build({
      vertices: CUBED, lengths: [100], constantSpeed: true,
      constraint: { positionMode: 'percent', position: 0.5, mixRotation: 0 },
    });
    const x = bone(sk, 'b').worldX;
    expect(x).toBeCloseTo(100 * t * t * t, 9);
    // The 10-segment table is an approximation, but it lands next to the 50 px
    // the arc-length parametrisation asks for.
    expect(Math.abs(x - 50)).toBeLessThan(0.3);
  });

  it('false: uses the setup `lengths` table and a uniform t inside the curve', () => {
    // total = lengths[0] = 100 ; pos = 0.5 * 100 = 50
    // one curve -> t = (50 - 0) / 100 = 0.5 -> x = 100 * 0.5^3 = 12.5
    const sk = build({
      vertices: CUBED, lengths: [100], constantSpeed: false,
      constraint: { positionMode: 'percent', position: 0.5, mixRotation: 0 },
    });
    expect(bone(sk, 'b').worldX).toBeCloseTo(12.5, 9);
  });

  it('false: the setup table also picks the curve', () => {
    // L path with lengths [100, 200] ; pos = 0.75 * 200 = 150
    // first entry >= 150 is index 1 -> prev 100, t = (150 - 100)/100 = 0.5
    // curve 1 is (100, 100t) -> (100, 50)
    const sk = build({
      vertices: L_PATH, lengths: [100, 200], constantSpeed: false,
      constraint: { positionMode: 'percent', position: 0.75, mixRotation: 0 },
    });
    const b = bone(sk, 'b');
    expect(b.worldX).toBeCloseTo(100, 9);
    expect(b.worldY).toBeCloseTo(50, 9);
  });
});

describe('the path follows the slot bone (spec 7.4)', () => {
  it('reads the world vertices of the frame, not the setup ones', () => {
    // The slot bone is `root`; move the skeleton 200 px to the right: the world
    // path becomes (200,0) -> (300,0), so percent 0.5 lands on x = 250.
    const sk = build({ constraint: { positionMode: 'percent', position: 0.5, mixRotation: 0 } });
    sk.x = 200;
    sk.updateWorldTransform(0);
    expect(bone(sk, 'b').worldX).toBeCloseTo(250, 9);
  });
});
