// SPDX-License-Identifier: Apache-2.0
/**
 * `BONE_particle` attachment: a stateless particle emitter (extension
 * `BONE_particles`, `formato/extensions/BONE_particles.md`).
 *
 * It sits in a slot, tied to the slot's bone, exactly like a `region`. The type
 * is ALWAYS prefixed — `"BONE_particle"`, singular, one attachment is one
 * emitter — and the extension name that goes in `extensionsUsed` is
 * `BONE_particles`, plural (extension 2.1).
 *
 * This class only HOLDS the emitter: every number is read once, the defaults of
 * extension 9 are filled in, and unknown values already fell back in the loader
 * with a warning (extension 7.4). The frame at time `t` is computed by
 * `particles/emitter.ts`, and it is a pure function of `(file, animation, t)`:
 * nothing is kept between frames, here or there.
 *
 * `shape` is the one field with NO silent default. A shape this reader does not
 * know means the emitter is not drawn at all and a warning is written — falling
 * back to `point` would be a guess the user has no way of noticing (extension
 * 7.4, house rule 21). `shapeKnown === false` says exactly that.
 */

import { Attachment } from './attachment.js';
import type { SequenceData } from './sequence.js';
import type { AtlasRegionData } from '../data.js';

export const PARTICLE_ATTACHMENT_TYPE = 'BONE_particle' as const;

/** Shapes of extension 9.4. `mesh` also needs level B; `path` is extension 1.1 (9.4.2). */
export const PARTICLE_SHAPES = ['point', 'circle', 'rectangle', 'edge', 'bone', 'mesh', 'path'] as const;
export type ParticleShape = (typeof PARTICLE_SHAPES)[number];

export const PARTICLE_MESH_MODES = ['vertex', 'edge', 'triangle'] as const;
export type ParticleMeshMode = (typeof PARTICLE_MESH_MODES)[number];

export const PARTICLE_SPACES = ['local', 'world'] as const;
export type ParticleSpace = (typeof PARTICLE_SPACES)[number];

export const PARTICLE_SORT_MODES = ['youngestInFront', 'oldestInFront'] as const;
export type ParticleSortMode = (typeof PARTICLE_SORT_MODES)[number];

export const PARTICLE_FRAME_MODES = ['lifetime', 'fps'] as const;
export type ParticleFrameMode = (typeof PARTICLE_FRAME_MODES)[number];

/** One entry of `bursts` (extension 4.3, 9.1). */
export interface ParticleBurst {
  readonly time: number;
  readonly count: number;
  readonly cycles: number;
  readonly interval: number;
  readonly probability: number;
}

/** A key of `scaleOverLifetime`, `colorOverLifetime`, `alphaOverLifetime` (extension 9.6, 9.7). */
export interface OverLifetimeKey<T> {
  /** `0..1` of the life, not seconds. */
  readonly time: number;
  readonly value: T;
  readonly curve: string | readonly number[];
}

export interface ParticleAttachmentOptions {
  color?: ArrayLike<number>;
  path?: string;
  x?: number;
  y?: number;
  rotation?: number;
  emitting?: boolean;
  rate?: number;
  bursts?: readonly ParticleBurst[];
  explosiveness?: number;
  duration?: number;
  randomness?: number;
  startDelay?: number;
  lifetime?: ArrayLike<number>;
  maxParticles?: number;
  speed?: ArrayLike<number>;
  direction?: number;
  spread?: number;
  spherizeDirection?: number;
  alignToVelocity?: boolean;
  shape?: ParticleShape;
  shapeKnown?: boolean;
  radius?: number;
  radiusThickness?: number;
  arc?: number;
  size?: ArrayLike<number>;
  edge?: ArrayLike<number>;
  mesh?: string | null;
  meshMode?: ParticleMeshMode;
  curve?: string | null;
  gravity?: ArrayLike<number>;
  drag?: number;
  angle?: ArrayLike<number>;
  angularVelocity?: ArrayLike<number>;
  scale?: ArrayLike<number>;
  scaleOverLifetime?: readonly OverLifetimeKey<number>[] | null;
  startColor?: readonly ArrayLike<number>[];
  colorOverLifetime?: readonly OverLifetimeKey<Float64Array>[] | null;
  alphaOverLifetime?: readonly OverLifetimeKey<number>[] | null;
  sequence?: SequenceData | null;
  frameMode?: ParticleFrameMode;
  cycles?: number;
  fps?: number;
  startFrame?: ArrayLike<number>;
  space?: ParticleSpace;
  seed?: number;
  looping?: boolean;
  prewarm?: number;
  sortMode?: ParticleSortMode;
}

function pair(value: ArrayLike<number> | undefined, a: number, b: number): Float64Array {
  if (value === undefined) return new Float64Array([a, b]);
  return new Float64Array([value[0] ?? a, value[1] ?? b]);
}

export class ParticleAttachment extends Attachment {
  readonly type = PARTICLE_ATTACHMENT_TYPE;
  /** Region of the atlas, like `region.path` (extension 9.8). */
  readonly path: string;

  // Where the emitter is (extension 9.10, 04/10/2026): `M_emissor = M_osso ×
  // T(x, y) · R(rotation)`, the order of a `region`, without scale. Not animable.
  readonly x: number;
  readonly y: number;
  /** Degrees, counter-clockwise. Turns the emitter's frame. */
  readonly rotation: number;

  // Emission (extension 9.1)
  /** Setup value; `emitting` is animable, read at birth, with `stepped` keys. */
  readonly emitting: boolean;
  /** particles/s. Fixed in the 1st phase: what animates is `emitting`. */
  readonly rate: number;
  readonly bursts: readonly ParticleBurst[];
  readonly explosiveness: number;
  /** ONLY for `explosiveness`. The loop uses the animation's duration (extension 6). */
  readonly duration: number;
  readonly randomness: number;
  readonly startDelay: number;

  // Life and cap (extension 9.2)
  /** `[min, max]` seconds. NOT animable: `max` is the search window of extension 5. */
  readonly lifetime: Float64Array;
  readonly maxParticles: number;

  // Speed, direction, spread (extension 9.3)
  readonly speed: Float64Array;
  readonly direction: number;
  /** HALF-spread, in degrees: `θ = direction + spread·(2·u2 − 1)`. */
  readonly spread: number;
  readonly spherizeDirection: number;
  readonly alignToVelocity: boolean;

  // Shape (extension 9.4)
  readonly shape: ParticleShape;
  /** `false` = the file named a shape this reader does not know: do not draw (extension 7.4). */
  readonly shapeKnown: boolean;
  readonly radius: number;
  readonly radiusThickness: number;
  readonly arc: number;
  readonly size: Float64Array;
  readonly edge: Float64Array;
  /** Placeholder of a `mesh` of the SAME slot, for `shape: "mesh"`. Level B. */
  readonly mesh: string | null;
  readonly meshMode: ParticleMeshMode;
  /**
   * `"<slot>/<placeholder>"` of a `path` attachment of ANY slot, for
   * `shape: "path"` (extension 1.1, 9.4.2). The slot is what comes before the
   * FIRST slash; the placeholder is all the rest, slashes included.
   */
  readonly curve: string | null;

  // Forces (extension 9.5)
  readonly gravity: Float64Array;
  /** Linear drag `k`, 1/s: `v' = g − k·v`. */
  readonly drag: number;

  // Rotation and size (extension 9.6)
  readonly angle: Float64Array;
  readonly angularVelocity: Float64Array;
  readonly scale: Float64Array;
  readonly scaleOverLifetime: readonly OverLifetimeKey<number>[] | null;

  // Color (extension 9.7)
  readonly startColor: readonly Float64Array[];
  readonly colorOverLifetime: readonly OverLifetimeKey<Float64Array>[] | null;
  readonly alphaOverLifetime: readonly OverLifetimeKey<number>[] | null;

  // Image and frame sheet (extension 9.8)
  readonly sequence: SequenceData | null;
  readonly frameMode: ParticleFrameMode;
  readonly cycles: number;
  readonly fps: number;
  readonly startFrame: Float64Array;

  // Space, seed, loop, order (extension 9.9)
  readonly space: ParticleSpace;
  /** ALWAYS fixed. There is no automatic seed, and `0` is a valid seed. */
  readonly seed: number;
  readonly looping: boolean;
  /** Seconds. Only with `looping: false`. */
  readonly prewarm: number;
  readonly sortMode: ParticleSortMode;

  /**
   * Atlas region of `path`, resolved by the loader exactly as a `region`'s is
   * (spec 2.8). With a `sequence` every particle picks its own frame instead,
   * and this holds the setup frame.
   */
  region: AtlasRegionData | null = null;

  /** Called by the loader once the atlases are known. */
  setRegion(region: AtlasRegionData | null): void {
    this.region = region;
  }

  constructor(name: string, options: ParticleAttachmentOptions = {}) {
    super(name, options.color);
    this.path = options.path ?? name;
    this.x = options.x ?? 0;
    this.y = options.y ?? 0;
    this.rotation = options.rotation ?? 0;

    this.emitting = options.emitting ?? true;
    this.rate = options.rate ?? 10;
    this.bursts = options.bursts ?? [];
    this.explosiveness = options.explosiveness ?? 0;
    this.duration = options.duration ?? 1;
    this.randomness = options.randomness ?? 0;
    this.startDelay = options.startDelay ?? 0;

    this.lifetime = pair(options.lifetime, 1, 1);
    this.maxParticles = options.maxParticles ?? 1000;

    this.speed = pair(options.speed, 100, 100);
    this.direction = options.direction ?? 90;
    this.spread = options.spread ?? 0;
    this.spherizeDirection = options.spherizeDirection ?? 0;
    this.alignToVelocity = options.alignToVelocity ?? false;

    this.shape = options.shape ?? 'point';
    this.shapeKnown = options.shapeKnown ?? true;
    this.radius = options.radius ?? 0;
    this.radiusThickness = options.radiusThickness ?? 1;
    this.arc = options.arc ?? 360;
    this.size = pair(options.size, 0, 0);
    this.edge = new Float64Array([
      options.edge?.[0] ?? 0, options.edge?.[1] ?? 0, options.edge?.[2] ?? 0, options.edge?.[3] ?? 0,
    ]);
    this.mesh = options.mesh ?? null;
    this.meshMode = options.meshMode ?? 'vertex';
    this.curve = options.curve ?? null;

    this.gravity = pair(options.gravity, 0, 0);
    this.drag = options.drag ?? 0;

    this.angle = pair(options.angle, 0, 0);
    this.angularVelocity = pair(options.angularVelocity, 0, 0);
    this.scale = pair(options.scale, 1, 1);
    this.scaleOverLifetime = options.scaleOverLifetime ?? null;

    const sc = options.startColor;
    this.startColor = [
      new Float64Array(sc?.[0] !== undefined ? Array.from(sc[0]) : [1, 1, 1, 1]),
      new Float64Array(sc?.[1] !== undefined ? Array.from(sc[1]) : [1, 1, 1, 1]),
    ];
    this.colorOverLifetime = options.colorOverLifetime ?? null;
    this.alphaOverLifetime = options.alphaOverLifetime ?? null;

    this.sequence = options.sequence ?? null;
    this.frameMode = options.frameMode ?? 'lifetime';
    this.cycles = options.cycles ?? 1;
    this.fps = options.fps ?? 12;
    this.startFrame = pair(options.startFrame, 0, 0);

    this.space = options.space ?? 'local';
    this.seed = options.seed ?? 0;
    this.looping = options.looping ?? true;
    this.prewarm = options.prewarm ?? 0;
    this.sortMode = options.sortMode ?? 'youngestInFront';
  }
}

/** `true` when this attachment is a particle emitter, without importing the class at the call site. */
export function isParticleAttachment(att: { type: string } | null): att is ParticleAttachment {
  return att !== null && (att.type as string) === PARTICLE_ATTACHMENT_TYPE;
}
