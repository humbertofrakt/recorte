// SPDX-License-Identifier: Apache-2.0
/**
 * Pose dump of spec 12.4: the exact shape a runtime must produce so the
 * conformance suite can compare it with `esperado.json`.
 *
 * Two halves live here, and nothing else:
 *
 *   `buildPoseDump(data, probe)`  runs the reference runtime over the probe
 *                                 and returns the dump.
 *   `comparePoseDump(a, b)`       compares an expected dump with a produced
 *                                 one, using the tolerances of spec 3.6.
 *
 * Comparison rule (spec 12.4, read from the example of 14.2, where `arm`
 * declares only `arotation` besides the matrix): **the expected dump declares
 * what is compared.** A field the expected sample does not mention is not
 * checked. That is what lets a case say "only this bone, only its rotation"
 * without writing the whole skeleton down.
 */

import {
  applyResets, activeTags, fireEvents, Actor, NestedSkeleton,
  type AnimationData, type SkeletonData, type FiredEvent,
} from '../../../runtime/src/index.js';
import type { Skeleton, Slot } from '../../../runtime/src/skeleton.js';
import { collectDrawList } from '../../../runtime/src/render-list.js';
import { angleDistance, normalizeAngle } from '../../../runtime/src/math.js';
import { VertexAttachment } from '../../../runtime/src/attachments/vertex-attachment.js';
import { RegionAttachment } from '../../../runtime/src/attachments/region.js';
import { MeshAttachment } from '../../../runtime/src/attachments/mesh.js';
import { LinkedMeshAttachment } from '../../../runtime/src/attachments/linkedmesh.js';
import { BoundingBoxAttachment } from '../../../runtime/src/attachments/boundingbox.js';
import { PointAttachment } from '../../../runtime/src/attachments/point.js';
import { ParticleAttachment } from '../../../runtime/src/attachments/particle.js';
import { EmissionCurve, type EmittingKeys } from '../../../runtime/src/particles/emission.js';
import { rateKeysOf } from '../../../runtime/src/particles/frame.js';
import { computeParticles, type ParticleSample } from '../../../runtime/src/particles/emitter.js';
import { BonePoser } from '../../../runtime/src/particles/bone-poser.js';

/** `version` written in every dump (spec 12.4). */
export const POSE_DUMP_VERSION = '1.0';

/** Decimal places of every number in the dump (spec 3.6: writers limit to 6). */
export const DUMP_DECIMALS = 6;

// ---------------------------------------------------------------------------
// Probe (spec 12.4 `probe.json`)
// ---------------------------------------------------------------------------

/** What a case asks the runtime to measure. */
export type MeasureName =
  | 'bones' | 'slots' | 'drawOrder' | 'vertices' | 'uvs' | 'events'
  | 'points' | 'boundingBoxes' | 'tags' | 'variables' | 'parameters'
  // Extension `BONE_particles`, 14.1. The pose dump of spec 12.4 had no way of
  // speaking about a particle, and the eight cases P-001..P-008 ask for this.
  | 'particles'
  // Spec 12.4, round 11: what is drawn, in order, child by child. `drawOrder`
  // only names the slots of the outer body and never saw inside a child.
  | 'drawList';

/** One drawn piece of the `drawList` channel (spec 12.4). */
export interface DrawListEntry {
  /** `<slot>/<attachment>`, prefixed with the parent slot at each nesting level. */
  piece: string;
  /** The masks that clip it, outermost first, by the same naming. Always there. */
  clips: string[];
}

export const DEFAULT_MEASURE: readonly MeasureName[] = ['bones', 'slots', 'drawOrder', 'events', 'tags'];

export interface Probe {
  /**
   * The skin STACK, bottom to top (spec 4.4, 0.2 draft): exactly these skins
   * are active, and the one on top wins. Absent = `["default"]`.
   */
  readonly skins?: readonly string[];
  /** Animation to apply; `null` or absent = setup pose only. */
  readonly animation?: string | null;
  /** Skeleton times to sample, ascending. */
  readonly times: readonly number[];
  /** `true` = animation time wraps at `duration` and events unroll (spec 8.6, 9.11). */
  readonly loop?: boolean;
  /**
   * Fixed simulation step (spec 6.5). When given and `> 0`, the clock walks
   * from `0` in steps of this size and every requested time must be a whole
   * number of steps. Absent = each requested time is posed on its own.
   */
  readonly physicsDt?: number;
  /** What to write into each sample. Absent = `DEFAULT_MEASURE`. */
  readonly measure?: readonly MeasureName[];
  /** Per-case tolerance overrides (spec 3.6 names). Rarely needed. */
  readonly tolerances?: Partial<Tolerances>;
}

// ---------------------------------------------------------------------------
// Dump
// ---------------------------------------------------------------------------

/** World matrix (spec 3.2) and applied pose (spec 5.2) of one bone. */
export interface BoneSample {
  a: number; b: number; c: number; d: number;
  worldX: number; worldY: number;
  ax: number; ay: number;
  arotation: number; ascaleX: number; ascaleY: number; ashearX: number; ashearY: number;
}

export interface SlotSample {
  attachment: string | null;
  color: number[];
  darkColor: number[] | null;
  visible: boolean;
  /**
   * Current sequence frame (spec 9.6).
   *
   * `-1` means the attachment has NO sequence at all. `sequence.setup` is not
   * `-1`: it is resolved to the real frame number, so a sample taken before
   * the first key still names a frame. (The comment used to say the opposite
   * of the code, and an adapter written from the interface alone failed B-110
   * without being told why.)
   */
  sequenceIndex: number;
  /** The APPLIED bone of the slot (spec 9.5, 12.4): the file's, or the one of the active `slot/bone` key. */
  bone: string;
}

export interface EventSample {
  time: number;
  event: string;
  int: number;
  float: number;
  string: string;
  volume: number;
  balance: number;
}

export interface PointSample { x: number; y: number; rotation: number }

/**
 * One live particle, exactly as extension `BONE_particles` 14.1 writes it.
 *
 * `x` and `y` are ALWAYS in skeleton space, in both `space` values: that is
 * what lets a `local` and a `world` be compared at all, and it is what case
 * P-006 leans on.
 *
 * `angle` is in degrees and NOT reduced to `−180..180`: `251.145834`, never
 * `−108.854166`. The leiame of P-001 says a reader that reduces it FAILS the
 * case, so the comparison below must not be circular either.
 */
export interface ParticleDumpSample {
  /** `0` = the continuous flow; `1 + b` = burst `b` (extension 3.1). */
  flow: number;
  /** MAY be negative: prewarm lives on negative indices (extension 6). */
  index: number;
  /** `t_i`, in skeleton time. Negative in prewarm and in previous laps. */
  birth: number;
  /** `life_i`, the life this particle drew. */
  life: number;
  /** `t − t_i`. */
  age: number;
  x: number;
  y: number;
  angle: number;
  /** The factor, with the bone's scale already in it (extension 7.2). */
  scale: number;
}

export interface PoseSampleFull {
  time: number;
  /**
   * The body of the instant (spec 9.13, 12.4): the `value` of the `body` key
   * in force, or `null` = the body of the file. Always written.
   */
  body: string | null;
  bones: Record<string, BoneSample>;
  slots: Record<string, SlotSample>;
  drawOrder: string[];
  vertices: Record<string, number[]>;
  /**
   * Page UVs of every region and mesh attachment on screen (spec 10.4).
   *
   * Eight numbers per region — BL, BR, TR, TL, the same corner order as
   * `vertices` — and `2N` per mesh. Without this channel the suite could not
   * see a texture bug at all: swapping the crop UVs of 7.3 for the literal
   * `(0,1)(1,1)(1,0)(0,0)` of the text passed all 31 cases, B-102 included,
   * because the pose dump only ever compared geometry. Two runtimes could pass
   * the whole of level B and draw completely different pictures.
   */
  uvs: Record<string, number[]>;
  boundingBoxes: Record<string, number[]>;
  points: Record<string, PointSample>;
  /**
   * Per emitter, keyed `<slot>/<placeholder>`: the live particles in draw
   * order, already cut by `maxParticles` (extension 14.1).
   *
   * An emitter with nobody alive comes out as an EMPTY LIST and does not
   * vanish from the map. Vanishing would confuse "there is no particle" with
   * "this reader does not implement P", and those are not the same answer.
   */
  particles: Record<string, ParticleDumpSample[]>;
  /** Spec 12.4: the pieces that go to the screen, in the order they are drawn. */
  drawList: DrawListEntry[];
  events: EventSample[];
  tags: string[];
  variables: Record<string, number | string | boolean>;
  parameters: Record<string, number>;
}

/** One sample. Every block is optional: `measure` decides which are written. */
export type PoseSample = { time: number; body?: string | null } & Partial<Omit<PoseSampleFull, 'time' | 'body'>>;

export interface PoseDump {
  version: string;
  samples: PoseSample[];
}

// ---------------------------------------------------------------------------
// Tolerances (spec 3.6, used by 12.4)
// ---------------------------------------------------------------------------

export interface Tolerances {
  /** Position, vertex, `worldX/Y`, `ax/ay`: px. */
  position: number;
  /** `arotation`, `ashearX/Y`, point rotation: degrees, circular distance. */
  angle: number;
  /** `a b c d`, `ascaleX/Y`. */
  matrix: number;
  /** Color channel. */
  color: number;
  /** UV coordinate: a fraction of the page, not a distance in px. */
  uv: number;
}

export const TOLERANCES: Readonly<Tolerances> = Object.freeze({
  position: 1e-3,
  angle: 1e-2,
  matrix: 1e-4,
  color: 1e-3,
  uv: 1e-6,
});

/** Physics with a fixed `dt` is compared at `1e-2` px (spec 3.6). */
export const PHYSICS_TOLERANCES: Readonly<Tolerances> = Object.freeze({
  position: 1e-2,
  angle: 1e-2,
  matrix: 1e-4,
  color: 1e-3,
  uv: 1e-6,
});

// ---------------------------------------------------------------------------
// Running a probe
// ---------------------------------------------------------------------------

function round(value: number): number {
  if (!Number.isFinite(value)) return 0;
  const k = 10 ** DUMP_DECIMALS;
  const r = Math.round(value * k) / k;
  return r === 0 ? 0 : r;
}

function animationTime(now: number, duration: number, loop: boolean): number {
  if (!loop || duration <= 0) return now;
  const t = now - Math.floor(now / duration) * duration;
  return t;
}

function measureSet(probe: Probe): Set<MeasureName> {
  return new Set(probe.measure ?? DEFAULT_MEASURE);
}

function boneSample(bone: {
  a: number; b: number; c: number; d: number; worldX: number; worldY: number;
  ax: number; ay: number; arotation: number; ascaleX: number; ascaleY: number; ashearX: number; ashearY: number;
}): BoneSample {
  return {
    a: round(bone.a), b: round(bone.b), c: round(bone.c), d: round(bone.d),
    worldX: round(bone.worldX), worldY: round(bone.worldY),
    ax: round(bone.ax), ay: round(bone.ay),
    arotation: round(normalizeAngle(bone.arotation)),
    ascaleX: round(bone.ascaleX), ascaleY: round(bone.ascaleY),
    ashearX: round(normalizeAngle(bone.ashearX)),
    ashearY: round(normalizeAngle(bone.ashearY)),
  };
}

/**
 * Frame the slot is showing (spec 7.10, 9.6): the resolved index, so
 * `sequence.setup` before the first key is observable as a real frame number.
 * `-1` when the attachment has no sequence.
 */
function sequenceFrame(slot: Slot): number {
  const att = slot.attachment as { sequence?: { frameIndexFor(s: { sequenceIndex: number }): number } | null } | null;
  const sequence = att === null ? null : att.sequence ?? null;
  return sequence === null || sequence === undefined ? -1 : sequence.frameIndexFor(slot);
}

function slotSample(slot: Slot): SlotSample {
  return {
    attachment: slot.attachment === null ? null : slot.attachment.name,
    color: Array.from(slot.color, round),
    darkColor: slot.darkColor === null ? null : Array.from(slot.darkColor, round),
    visible: slot.visible,
    sequenceIndex: sequenceFrame(slot),
    bone: slot.bone.data.name,
  };
}

/**
 * Runs one probe against the reference runtime and returns the dump.
 *
 * The probe runs on an `Actor` (spec 9.13): `bodies` are the other bodies of
 * the project, keyed by the `value` of the `body` keys that name them (what
 * `loadSkeletonFile` returns in `bodies`). Without them the file is the only
 * body, and a `body` key that names another one keeps the file, with a warning.
 *
 * `probe.skins` is the skin STACK, bottom to top (spec 4.4); absent =
 * `["default"]`, the stack a new reader is born with.
 */
export function buildPoseDump(
  data: SkeletonData, probe: Probe, bodies: ReadonlyMap<string, SkeletonData> = new Map(),
): PoseDump {
  const actor = new Actor(data, bodies);
  actor.setSkinStack(probe.skins ?? ['default']);

  let animation: AnimationData | null = null;
  if (probe.animation !== undefined && probe.animation !== null) {
    animation = data.findAnimation(probe.animation);
    if (animation === null) throw new Error(`animação não encontrada: "${probe.animation}"`);
  }
  const duration = animation === null ? 0 : animation.duration;
  const loop = probe.loop ?? false;
  const want = measureSet(probe);
  const times = probe.times;
  const dt = probe.physicsDt ?? 0;

  const samples: PoseSample[] = [];
  let previous = -Infinity;
  // The window a `reset` key is measured against is the one between two
  // POSE UPDATES, not between two samples. With `physicsDt` there are many
  // updates per sample, and reusing the sample window here re-fired the reset
  // on every step after the crossing: the physics then sat at rest forever.
  // Measured on the `attack` animation of `heroi.bone`, whose `reset` key sits
  // at time 0 and is crossed by the loop.
  let lastStep = -Infinity;
  // Child clock at the previous sample, per live nested instance, for the
  // `(previous, now]` window of the child's events (spec 7.11, 12.4).
  const childClocks = new Map<NestedSkeleton, ChildClock>();

  // Extension `BONE_particles` 7.2: `space: "world"` needs the bone's matrix at
  // the BIRTH instant, which is not the frame being drawn. The poser keeps its
  // own actor so asking for a past pose never disturbs the one being measured,
  // and it is built once per run, not once per sample.
  const poser = want.has('particles')
    ? new BonePoser(data, animation, { skins: probe.skins ?? ['default'], bodies, loop })
    : null;

  const take = (now: number): void => {
    samples.push(makeSample(actor, animation, now, duration, loop, previous, want, childClocks, poser));
    previous = now;
  };

  const posePose = (now: number): void => {
    // Spec 9.11 / 12.4: in a loop the time wraps BEFORE anything else, and
    // `corpoEm` receives the wrapped time (case C-291).
    const skeleton = actor.prepare(animation, animationTime(now, duration, loop), loop);
    skeleton.time = now;
    const bound = actor.boundAnimation;
    if (bound !== null) applyResets(skeleton, bound, lastStep, now, loop);
    lastStep = now;
    skeleton.updateWorldTransform(now);
  };

  if (dt > 0) {
    const last = times.length === 0 ? 0 : Math.max(...times);
    const steps = Math.round(last / dt);
    let next = 0;
    for (let i = 0; i <= steps; i++) {
      const now = i * dt;
      posePose(now);
      while (next < times.length && Math.abs(times[next] - now) <= dt * 1e-6) {
        take(now);
        next++;
      }
    }
    if (next < times.length) {
      throw new Error(`com physicsDt cada tempo pedido tem que ser múltiplo do passo; falta ${times[next]}`);
    }
  } else {
    for (const now of times) {
      posePose(now);
      take(now);
    }
  }

  return { version: POSE_DUMP_VERSION, samples };
}

/** A child's clocks at the previous sample, for its event window. */
interface ChildClock {
  top: number;
  base: number;
  name: string | null;
}

/**
 * Every skeleton the dump looks into, with the prefix its keys carry: the live
 * body with `""`, and each live nested child with `"<slot>/"` in front, a
 * grandchild with `"<slot>/<slot>/"` (spec 12.4).
 */
function eachSkeleton(skeleton: Skeleton, prefix: string, visit: (s: Skeleton, prefix: string, owner: Slot | null) => void, owner: Slot | null = null): void {
  visit(skeleton, prefix, owner);
  for (const slot of skeleton.slots) {
    const nested = slot.nested;
    if (nested === null || slot.attachment !== nested.attachment) continue;
    eachSkeleton(nested.skeleton, `${prefix}${slot.data.name}/`, visit, slot);
  }
}

/**
 * The `emitting` tap of one emitter, read straight off the animation (extension
 * 4.1). It is NOT applied to the skeleton, on purpose: the emitter asks for it
 * at birth instants that are not the frame being drawn.
 */
function emittingKeys(animation: AnimationData | null, slotName: string, attachmentName: string): EmittingKeys | null {
  if (animation === null) return null;
  for (const tl of animation.timelines) {
    if (tl.kind !== 'particle.emitting') continue;
    if (tl.slot.name !== slotName || tl.attachmentName !== attachmentName) continue;
    return tl.keys;
  }
  return null;
}

/**
 * What the emitter may ask the skeleton (extension 7.2).
 *
 * In `local` it only ever asks for the frame being drawn, and the slot's
 * applied bone (spec 9.5) is right there — which also makes a nested child's
 * emitter work. In `world` it asks for the matrix at `t_i`, and that needs the
 * poser. A `world` emitter inside a NESTED skeleton has no poser of its own
 * yet, and this throws instead of quietly handing back the wrong matrix: a
 * wrong number that passes is worse than a stop that says why (house rule 21).
 */
function emitterPose(slot: Slot, att: ParticleAttachment, prefix: string, poser: BonePoser | null) {
  // The poser is needed for `space: "world"` (the matrix at `t_i`) and for
  // `shape: "mesh"` (the vertices deformed at `t_i`, and in `local` the inverse
  // of that matrix as well).
  // `shape: "path"` (extension 1.1) reads the path at `t_i` too.
  const needsPast = att.space === 'world' || att.shape === 'mesh' || att.shape === 'path';
  if (!needsPast) {
    return { matrixAt: () => slot.boneMatrix, boneLength: () => slot.bone.data.length };
  }
  if (poser === null || prefix !== '') {
    throw new Error(`o emissor "${prefix}${slot.data.name}/${att.name}" pede a pose de um instante passado dentro de um esqueleto aninhado; o dump ainda não mede isso`);
  }
  return poser.poseFor(slot.data.name, att.mesh, att.curve);
}

/** Six decimals, like the rest of the dump (extension 14.1). */
function particleSample(p: ParticleSample): ParticleDumpSample {
  return {
    flow: p.flow, index: p.index,
    birth: round(p.birth), life: round(p.life), age: round(p.age),
    x: round(p.x), y: round(p.y),
    // NOT normalized. `251.145834`, not `−108.854166`.
    angle: round(p.angle),
    scale: round(p.scale),
  };
}

function makeSample(
  actor: Actor, animation: AnimationData | null, now: number,
  duration: number, loop: boolean, previous: number, want: Set<MeasureName>,
  childClocks: Map<NestedSkeleton, ChildClock>, poser: BonePoser | null,
): PoseSample {
  const top = actor.skeleton;
  // Spec 12.4: `body` is always there, `null` = the body of the file.
  const sample: PoseSample = { time: round(now), body: actor.body };

  if (want.has('bones')) {
    const bones: Record<string, BoneSample> = {};
    eachSkeleton(top, '', (skeleton, prefix) => {
      for (const bone of skeleton.bones) bones[prefix + bone.data.name] = boneSample(bone);
    });
    sample.bones = bones;
  }
  if (want.has('slots')) {
    const slots: Record<string, SlotSample> = {};
    eachSkeleton(top, '', (skeleton, prefix) => {
      for (const slot of skeleton.slots) slots[prefix + slot.data.name] = slotSample(slot);
    });
    sample.slots = slots;
  }
  if (want.has('drawOrder')) {
    // The draw order of the body of the instant; a child is one block in it (7.11).
    sample.drawOrder = top.drawOrder.map((slot) => slot.data.name);
  }
  if (want.has('drawList')) {
    // Spec 12.4: the frame as it goes to the screen, children opened in place
    // and the `around` children behind and in front of who receives them (7.11).
    sample.drawList = collectDrawList(top).map((piece) => ({
      piece: piece.name, clips: piece.clips.map((clip) => clip.name),
    }));
  }
  if (want.has('vertices') || want.has('boundingBoxes')) {
    const vertices: Record<string, number[]> = {};
    const boxes: Record<string, number[]> = {};
    eachSkeleton(top, '', (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (att === null) continue;
        const key = `${prefix}${slot.data.name}/${att.name}`;
        if (att instanceof BoundingBoxAttachment) {
          boxes[key] = Array.from(att.computeWorldVertices(slot) as Float64Array, round);
        } else if (att instanceof VertexAttachment) {
          vertices[key] = Array.from(att.computeWorldVertices(slot) as Float64Array, round);
        } else if (att instanceof RegionAttachment) {
          vertices[key] = Array.from(att.computeWorldVertices(slot) as Float64Array, round);
        }
      }
    });
    if (want.has('vertices')) sample.vertices = vertices;
    if (want.has('boundingBoxes')) sample.boundingBoxes = boxes;
  }
  if (want.has('uvs')) {
    const uvs: Record<string, number[]> = {};
    eachSkeleton(top, '', (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (att === null) continue;
        const key = `${prefix}${slot.data.name}/${att.name}`;
        if (att instanceof RegionAttachment) {
          uvs[key] = Array.from(att.uvsFor(slot), round);
        } else if (att instanceof MeshAttachment || att instanceof LinkedMeshAttachment) {
          // A `linkedmesh` has its own image, so it has its own page UVs (7.5).
          // Leaving it out of this channel would hide every texture error on a
          // linked mesh, and the Python runtime reports it: the two dumps
          // disagreed on case B-104 until this branch was widened.
          uvs[key] = Array.from(att.regionUVsFor(slot), round);
        }
      }
    });
    sample.uvs = uvs;
  }
  if (want.has('points')) {
    const points: Record<string, PointSample> = {};
    eachSkeleton(top, '', (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (!(att instanceof PointAttachment)) continue;
        // The applied bone, with the `transform` of a `slot/bone` key (9.5).
        const matrix = slot.boneMatrix;
        const p = att.computeWorldPosition(matrix);
        points[`${prefix}${slot.data.name}/${att.name}`] = {
          x: round(p.x), y: round(p.y), rotation: round(normalizeAngle(att.computeWorldRotation(matrix))),
        };
      }
    });
    sample.points = points;
  }
  if (want.has('particles')) {
    // The time the emitter is asked about is the ANIMATION time: a birth from
    // the lap behind carries `t_i = −0.05` in that same frame (extension 6),
    // and the dump writes `birth` in it too — which is why case P-003 gets the
    // same text at `t = 0.02` and at `t = 1.02`.
    const at = animationTime(now, duration, loop);
    const bound = actor.boundAnimation;
    const out: Record<string, ParticleDumpSample[]> = {};
    eachSkeleton(top, '', (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (!(att instanceof ParticleAttachment)) continue;
        const key = `${prefix}${slot.data.name}/${att.name}`;
        const curve = new EmissionCurve(att, emittingKeys(bound, slot.data.name, att.name), rateKeysOf(bound, slot.data.name, att.name));
        const pose = emitterPose(slot, att, prefix, poser);
        const frame = computeParticles(att, curve, { time: at, duration }, pose);
        out[key] = frame.particles.map(particleSample);
      }
    });
    sample.particles = out;
  }
  if (want.has('events')) {
    const out: EventSample[] = [];
    const push = (fired: FiredEvent, name: string, time: number = fired.time): void => {
      out.push({
        time: round(time),
        event: name,
        int: fired.key.int,
        float: round(fired.key.float),
        string: fired.key.string,
        volume: round(fired.key.volume),
        balance: round(fired.key.balance),
      });
    };
    // Events belong to the animation, not to a body (spec 9.13).
    if (animation !== null) {
      for (const fired of fireEvents(animation, previous, now, loop)) push(fired, fired.key.event.name);
    }
    // Spec 7.11 and Appendix C rules 6 and 7: a child's events — of the
    // animation on top and of the background one — reach the game as
    // `"<slot>/<event>"`. The window is the child's, since the previous sample;
    // a change of the child's animation, or a clock that went back (a new lap
    // of the parent), reopens it at -inf. The `time` is in the PARENT's clock:
    // `sample time - (child clock - event time in the child) / timeScale`.
    eachSkeleton(top, '', (_skeleton, prefix, owner) => {
      if (owner === null || !(owner.nested instanceof NestedSkeleton)) return;
      const child = owner.nested;
      const before = childClocks.get(child);
      const scale = child.clockScale === 0 ? 1 : child.clockScale;
      const name = (event: string): string => `${prefix}${event}`;
      const inParent = (childNow: number, eventTime: number): number => now - (childNow - eventTime) / scale;
      if (child.baseAnimation !== null) {
        const from = before === undefined || before.base > child.baseTime ? -Infinity : before.base;
        for (const fired of fireEvents(child.baseAnimation, from, child.baseTime, true)) {
          push(fired, name(fired.key.event.name), inParent(child.baseTime, fired.time));
        }
      }
      if (child.animation !== null) {
        const from = before === undefined || before.name !== child.animationName || before.top > child.time ? -Infinity : before.top;
        for (const fired of fireEvents(child.animation, from, child.time, child.topLoop)) {
          push(fired, name(fired.key.event.name), inParent(child.time, fired.time));
        }
      }
      childClocks.set(child, { top: child.time, base: child.baseTime, name: child.animationName });
    });
    sample.events = out;
  }
  if (want.has('tags')) {
    sample.tags = animation === null
      ? []
      : Array.from(activeTags(animation, animationTime(now, duration, loop)));
  }
  if (want.has('variables')) {
    const out: Record<string, number | string | boolean> = {};
    const list = top.data.variables;
    for (let i = 0; i < list.length; i++) {
      const v = top.variables[i];
      out[list[i].name] = typeof v === 'number' ? round(v) : v;
    }
    sample.variables = out;
  }
  if (want.has('parameters')) {
    const out: Record<string, number> = {};
    const list = top.data.parameters;
    for (let i = 0; i < list.length; i++) out[list[i].name] = round(top.parameters[i]);
    sample.parameters = out;
  }
  return sample;
}

// ---------------------------------------------------------------------------
// Comparison
// ---------------------------------------------------------------------------

/** One place where the produced dump does not match the expected one. */
export interface Difference {
  /** Where, in JSON Pointer style: `/samples/0/bones/arm/a`. */
  readonly pointer: string;
  /** How far off, in the unit of the field. `Infinity` for a mismatch that has no distance. */
  readonly delta: number;
  /** Tolerance that was applied. */
  readonly tolerance: number;
  readonly expected: unknown;
  readonly actual: unknown;
}

export interface CompareResult {
  readonly ok: boolean;
  readonly differences: Difference[];
  /** Largest `delta / tolerance` seen, so cases with different units compare. */
  readonly worstRatio: number;
  /** Largest raw `delta` seen. */
  readonly worstDelta: number;
}

/**
 * Field names measured by CIRCULAR distance, where a full turn is zero apart.
 *
 * `angle` — the particle field of extension `BONE_particles` 14.1 — is NOT here
 * and MUST NOT be added. Adding it is the most natural gesture in the world for
 * whoever passes through in a year's time, and it is exactly the gesture that
 * erases the proof: `251.145834` and `−108.854166` would become zero degrees
 * apart, and a reader that reduces the angle to `−180..180` would pass a case
 * whose leiame says in letters that it must FAIL. `medida-particulas.test.ts`
 * stands guard over this line.
 */
export const ANGLE_FIELDS = new Set(['arotation', 'ashearX', 'ashearY', 'rotation']);
const MATRIX_FIELDS = new Set(['a', 'b', 'c', 'd', 'ascaleX', 'ascaleY']);

function toleranceFor(field: string, tol: Tolerances): number {
  if (ANGLE_FIELDS.has(field)) return tol.angle;
  if (MATRIX_FIELDS.has(field)) return tol.matrix;
  return tol.position;
}

class Comparator {
  readonly differences: Difference[] = [];
  worstRatio = 0;
  worstDelta = 0;

  constructor(private readonly tol: Tolerances) {}

  private add(pointer: string, delta: number, tolerance: number, expected: unknown, actual: unknown): void {
    this.differences.push({ pointer, delta, tolerance, expected, actual });
    const ratio = tolerance > 0 ? delta / tolerance : delta;
    if (ratio > this.worstRatio) this.worstRatio = ratio;
    if (Number.isFinite(delta) && delta > this.worstDelta) this.worstDelta = delta;
  }

  /** Records how far a matching number was, even when it passes. */
  private seen(delta: number, tolerance: number): void {
    const ratio = tolerance > 0 ? delta / tolerance : delta;
    if (ratio > this.worstRatio && delta > tolerance) this.worstRatio = ratio;
    if (delta > this.worstDelta) this.worstDelta = delta;
  }

  number(pointer: string, field: string, expected: number, actual: unknown, angle: boolean): void {
    if (typeof actual !== 'number' || !Number.isFinite(actual)) {
      this.add(pointer, Infinity, 0, expected, actual);
      return;
    }
    const tolerance = angle ? this.tol.angle : toleranceFor(field, this.tol);
    const delta = angle || ANGLE_FIELDS.has(field)
      ? angleDistance(expected, actual)
      : Math.abs(expected - actual);
    if (delta > tolerance) this.add(pointer, delta, tolerance, expected, actual);
    else this.seen(delta, tolerance);
  }

  exact(pointer: string, expected: unknown, actual: unknown): void {
    if (expected !== actual) this.add(pointer, Infinity, 0, expected, actual);
  }

  /** Numeric array compared element by element with one tolerance. */
  numbers(pointer: string, expected: readonly number[], actual: unknown, tolerance: number): void {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      this.add(pointer, Infinity, 0, expected, actual);
      return;
    }
    for (let i = 0; i < expected.length; i++) {
      const a = actual[i];
      if (typeof a !== 'number' || !Number.isFinite(a)) {
        this.add(`${pointer}/${i}`, Infinity, 0, expected[i], a);
        continue;
      }
      const delta = Math.abs(expected[i] - a);
      if (delta > tolerance) this.add(`${pointer}/${i}`, delta, tolerance, expected[i], a);
      else this.seen(delta, tolerance);
    }
  }

  /**
   * A particle field that missed. It goes through its own door because the
   * particle comparison picks the ruler itself — above all for `angle`, which
   * must NOT take the circular distance (extension 14.1, leiame of P-001).
   */
  particleOff(pointer: string, delta: number, tolerance: number, expected: unknown, actual: unknown): void {
    this.add(pointer, delta, tolerance, expected, actual);
  }

  /** A particle field that matched, so the worst ratio still sees how close it was. */
  particleSeen(delta: number, tolerance: number): void {
    this.seen(delta, tolerance);
  }

  strings(pointer: string, expected: readonly unknown[], actual: unknown): void {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      this.add(pointer, Infinity, 0, expected, actual);
      return;
    }
    for (let i = 0; i < expected.length; i++) this.exact(`${pointer}/${i}`, expected[i], actual[i]);
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function compareBones(cmp: Comparator, pointer: string, expected: unknown, actual: unknown): void {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) { cmp.exact(pointer, '<objeto de ossos>', actual); return; }
  for (const [name, want] of Object.entries(expected)) {
    const got = actual[name];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) { cmp.exact(`${pointer}/${name}`, '<osso>', got); continue; }
    for (const [field, value] of Object.entries(want)) {
      if (typeof value !== 'number') { cmp.exact(`${pointer}/${name}/${field}`, value, got[field]); continue; }
      cmp.number(`${pointer}/${name}/${field}`, field, value, got[field], ANGLE_FIELDS.has(field));
    }
  }
}

function compareSlots(cmp: Comparator, pointer: string, expected: unknown, actual: unknown, tol: Tolerances): void {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) { cmp.exact(pointer, '<objeto de slots>', actual); return; }
  for (const [name, want] of Object.entries(expected)) {
    const got = actual[name];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) { cmp.exact(`${pointer}/${name}`, '<slot>', got); continue; }
    for (const [field, value] of Object.entries(want)) {
      const p = `${pointer}/${name}/${field}`;
      if (field === 'color' || field === 'darkColor') {
        if (value === null || got[field] === null) { cmp.exact(p, value, got[field]); continue; }
        cmp.numbers(p, value as number[], got[field], tol.color);
      } else if (typeof value === 'number') {
        cmp.number(p, field, value, got[field], false);
      } else {
        cmp.exact(p, value, got[field]);
      }
    }
  }
}

function compareVectorMap(cmp: Comparator, pointer: string, expected: unknown, actual: unknown, tolerance: number): void {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) { cmp.exact(pointer, '<objeto>', actual); return; }
  for (const [name, want] of Object.entries(expected)) {
    cmp.numbers(`${pointer}/${name}`, want as number[], actual[name], tolerance);
  }
}

function comparePoints(cmp: Comparator, pointer: string, expected: unknown, actual: unknown): void {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) { cmp.exact(pointer, '<objeto de pontos>', actual); return; }
  for (const [name, want] of Object.entries(expected)) {
    const got = actual[name];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) { cmp.exact(`${pointer}/${name}`, '<ponto>', got); continue; }
    for (const [field, value] of Object.entries(want)) {
      if (typeof value !== 'number') { cmp.exact(`${pointer}/${name}/${field}`, value, got[field]); continue; }
      cmp.number(`${pointer}/${name}/${field}`, field, value, got[field], field === 'rotation');
    }
  }
}

function compareEvents(cmp: Comparator, pointer: string, expected: unknown, actual: unknown): void {
  if (!Array.isArray(expected)) return;
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    cmp.exact(pointer, `${expected.length} evento(s)`, Array.isArray(actual) ? `${actual.length} evento(s)` : actual);
    return;
  }
  for (let i = 0; i < expected.length; i++) {
    const want = expected[i];
    const got = actual[i];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) { cmp.exact(`${pointer}/${i}`, '<evento>', got); continue; }
    for (const [field, value] of Object.entries(want)) {
      const p = `${pointer}/${i}/${field}`;
      // Spec 12.4: events are exact. `time` and `float` are still numbers, so
      // they get the position tolerance instead of a bit-for-bit match.
      if (field === 'time' || field === 'float' || field === 'volume' || field === 'balance') {
        cmp.number(p, 'time', value as number, got[field], false);
      } else {
        cmp.exact(p, value, got[field]);
      }
    }
  }
}

/**
 * The `particles` block (extension `BONE_particles` 14.1).
 *
 * Three things this comparison does NOT do, and each one has a reason written
 * into a case:
 *
 * 1. **`angle` is compared by plain distance, never circularly.** The leiame of
 *    P-001 says in letters that a reader which reduces the angle to `−180..180`
 *    FAILS the case — and `251.145834` against `−108.854166` is zero degrees
 *    apart the circular way. If `angle` fell into `ANGLE_FIELDS`, a wrong
 *    reader would pass and the proof would go slack for BOTH runtimes, not just
 *    one.
 * 1b. **The size is `1e-3`, one number for EVERY field under `/particles/`**
 *    (extension 14.2, normative). Not the `1e-2` spec 3.6 gives a pose angle,
 *    and not the `1e-4` it gives a scale: one number, because each runtime has
 *    its own comparator and two rulers mean the same case is measured with
 *    different slack depending on who measures. These are TWO rules against TWO
 *    different errors — the plain distance catches the 360° error, which no
 *    tolerance could (360 is 36 000 times `1e-2`), and the `1e-3` catches the
 *    small steady error nobody goes looking for.
 * 2. **`flow` and `index` are exact.** They are the particle's identity
 *    (extension 3.1), not a measurement.
 * 3. **The order matters, and so does the length.** The list IS the draw order
 *    already cut by `maxParticles` (extension 7.1). P-005 passes only with the
 *    five newest, in that order; P-007 only with the tie broken by descending
 *    index. A comparison that sorted before looking would let both through.
 */
function compareParticles(cmp: Comparator, pointer: string, expected: unknown, actual: unknown, tol: Tolerances): void {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) { cmp.exact(pointer, '<objeto de emissores>', actual); return; }
  for (const [name, want] of Object.entries(expected)) {
    const p = `${pointer}/${name}`;
    const got = actual[name];
    if (!Array.isArray(want)) continue;
    if (!Array.isArray(got)) {
      // An emitter with nobody alive is an EMPTY LIST, never a missing key:
      // vanishing would confuse "no particle" with "P not implemented".
      cmp.exact(p, `${want.length} partícula(s)`, got === undefined ? '<emissor ausente>' : got);
      continue;
    }
    if (got.length !== want.length) {
      cmp.exact(p, `${want.length} partícula(s)`, `${got.length} partícula(s)`);
      continue;
    }
    for (let i = 0; i < want.length; i++) {
      const w = want[i] as Record<string, unknown>;
      const g = got[i] as Record<string, unknown>;
      if (!isPlainObject(w)) continue;
      if (!isPlainObject(g)) { cmp.exact(`${p}/${i}`, '<partícula>', g); continue; }
      for (const [field, value] of Object.entries(w)) {
        const q = `${p}/${i}/${field}`;
        if (field === 'flow' || field === 'index') { cmp.exact(q, value, g[field]); continue; }
        if (typeof value !== 'number') { cmp.exact(q, value, g[field]); continue; }
        const a = g[field];
        if (typeof a !== 'number' || !Number.isFinite(a)) { cmp.number(q, field, value, a, false); continue; }
        // One number for every field here (extension 14.2): `1e-3`. Not
        // `tol.angle` for `angle`, not `tol.matrix` for `scale`.
        const tolerance = tol.position;
        const delta = Math.abs(value - a);
        if (delta > tolerance) cmp.particleOff(q, delta, tolerance, value, a);
        else cmp.particleSeen(delta, tolerance);
      }
    }
  }
}

function compareVariables(cmp: Comparator, pointer: string, expected: unknown, actual: unknown): void {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) { cmp.exact(pointer, '<objeto>', actual); return; }
  for (const [name, value] of Object.entries(expected)) {
    const p = `${pointer}/${name}`;
    if (typeof value === 'number') cmp.number(p, 'value', value, actual[name], false);
    else cmp.exact(p, value, actual[name]);
  }
}

/**
 * The `drawList` channel (spec 12.4): the same pieces, in the same order, each
 * with the same masks. Exact, like `drawOrder`.
 */
function compareDrawList(cmp: Comparator, pointer: string, expected: unknown, actual: unknown): void {
  if (!Array.isArray(expected)) return;
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    const names = (list: unknown): unknown => (Array.isArray(list)
      ? list.map((e) => (isPlainObject(e) ? e.piece : e)).join(' · ') : list);
    cmp.exact(pointer, names(expected), actual === undefined ? '<sem drawList>' : names(actual));
    return;
  }
  for (let i = 0; i < expected.length; i++) {
    const want = expected[i] as Record<string, unknown>;
    const got = actual[i];
    if (!isPlainObject(got)) { cmp.exact(`${pointer}/${i}`, want.piece, got); continue; }
    cmp.exact(`${pointer}/${i}/piece`, want.piece, got.piece);
    if ('clips' in want) cmp.strings(`${pointer}/${i}/clips`, want.clips as unknown[], got.clips);
  }
}

/**
 * Every key a sample of `esperado.json` may carry. A key outside this list is a
 * channel this harness cannot compare, and it FAILS the case: skipping it gave
 * eleven cases a green they had not earned (round 11, 05/10/2026).
 */
const SAMPLE_KEYS: ReadonlySet<string> = new Set([
  'time', 'body', 'bones', 'slots', 'drawOrder', 'drawList', 'vertices', 'uvs', 'boundingBoxes',
  'points', 'particles', 'events', 'tags', 'variables', 'parameters',
]);

/**
 * Compares the expected dump with the produced one. Only what `expected`
 * declares is checked (spec 12.4). `tolerances` defaults to spec 3.6; a case
 * that simulates physics passes `PHYSICS_TOLERANCES`.
 */
export function comparePoseDump(
  expected: PoseDump, actual: PoseDump, tolerances: Tolerances = TOLERANCES,
): CompareResult {
  const cmp = new Comparator(tolerances);

  if (expected.samples.length !== actual.samples.length) {
    cmp.exact('/samples', `${expected.samples.length} amostra(s)`, `${actual.samples.length} amostra(s)`);
  }
  const n = Math.min(expected.samples.length, actual.samples.length);
  for (let i = 0; i < n; i++) {
    const want = expected.samples[i] as Record<string, unknown>;
    const got = actual.samples[i] as Record<string, unknown>;
    const p = `/samples/${i}`;
    if (typeof want.time === 'number') cmp.number(`${p}/time`, 'time', want.time, got.time, false);
    // Spec 12.4: the body of the instant, compared exactly (`null` = the file).
    if ('body' in want) cmp.exact(`${p}/body`, want.body, got.body === undefined ? '<sem body>' : got.body);
    if ('bones' in want) compareBones(cmp, `${p}/bones`, want.bones, got.bones);
    if ('slots' in want) compareSlots(cmp, `${p}/slots`, want.slots, got.slots, tolerances);
    for (const key of Object.keys(want)) {
      if (!SAMPLE_KEYS.has(key)) cmp.exact(`${p}/${key}`, '<canal que o executor não conhece>', null);
    }
    if ('drawOrder' in want) cmp.strings(`${p}/drawOrder`, want.drawOrder as unknown[], got.drawOrder);
    if ('drawList' in want) compareDrawList(cmp, `${p}/drawList`, want.drawList, got.drawList);
    if ('vertices' in want) compareVectorMap(cmp, `${p}/vertices`, want.vertices, got.vertices, tolerances.position);
    // UVs are a fraction of a page, never a distance in skeleton px, so they
    // are compared against the plain numeric tolerance, not `position`.
    if ('uvs' in want) compareVectorMap(cmp, `${p}/uvs`, want.uvs, got.uvs, tolerances.uv);
    if ('boundingBoxes' in want) compareVectorMap(cmp, `${p}/boundingBoxes`, want.boundingBoxes, got.boundingBoxes, tolerances.position);
    if ('points' in want) comparePoints(cmp, `${p}/points`, want.points, got.points);
    if ('particles' in want) compareParticles(cmp, `${p}/particles`, want.particles, got.particles, tolerances);
    if ('events' in want) compareEvents(cmp, `${p}/events`, want.events, got.events);
    if ('tags' in want) cmp.strings(`${p}/tags`, want.tags as unknown[], got.tags);
    if ('variables' in want) compareVariables(cmp, `${p}/variables`, want.variables, got.variables);
    if ('parameters' in want) compareVariables(cmp, `${p}/parameters`, want.parameters, got.parameters);
  }

  return {
    ok: cmp.differences.length === 0,
    differences: cmp.differences,
    worstRatio: cmp.worstRatio,
    worstDelta: cmp.worstDelta,
  };
}

/** Pretty JSON, arrays of numbers kept on one line, exactly as the cases are stored. */
export function formatPoseDump(dump: PoseDump): string {
  const text = JSON.stringify(dump, null, 2);
  // Collapse `[\n 1,\n 2\n]` back to `[1, 2]` for arrays of plain numbers.
  return text.replace(/\[\s*\n\s*(-?[\d.eE+-]+(?:,\s*\n\s*-?[\d.eE+-]+)*)\s*\n\s*\]/g, (_all, body: string) =>
    `[${body.split(/,\s*\n\s*/).join(', ')}]`) + '\n';
}
