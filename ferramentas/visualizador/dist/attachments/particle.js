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
export const PARTICLE_ATTACHMENT_TYPE = 'BONE_particle';
/** Shapes of extension 9.4. `mesh` also needs level B; `path` is extension 1.1 (9.4.2). */
export const PARTICLE_SHAPES = ['point', 'circle', 'rectangle', 'edge', 'bone', 'mesh', 'path'];
export const PARTICLE_MESH_MODES = ['vertex', 'edge', 'triangle'];
export const PARTICLE_SPACES = ['local', 'world'];
export const PARTICLE_SORT_MODES = ['youngestInFront', 'oldestInFront'];
export const PARTICLE_FRAME_MODES = ['lifetime', 'fps'];
function pair(value, a, b) {
    if (value === undefined)
        return new Float64Array([a, b]);
    return new Float64Array([value[0] ?? a, value[1] ?? b]);
}
export class ParticleAttachment extends Attachment {
    type = PARTICLE_ATTACHMENT_TYPE;
    /** Region of the atlas, like `region.path` (extension 9.8). */
    path;
    // Where the emitter is (extension 9.10, 04/10/2026): `M_emissor = M_osso ×
    // T(x, y) · R(rotation)`, the order of a `region`, without scale. Not animable.
    x;
    y;
    /** Degrees, counter-clockwise. Turns the emitter's frame. */
    rotation;
    // Emission (extension 9.1)
    /** Setup value; `emitting` is animable, read at birth, with `stepped` keys. */
    emitting;
    /** particles/s. Fixed in the 1st phase: what animates is `emitting`. */
    rate;
    bursts;
    explosiveness;
    /** ONLY for `explosiveness`. The loop uses the animation's duration (extension 6). */
    duration;
    randomness;
    startDelay;
    // Life and cap (extension 9.2)
    /** `[min, max]` seconds. NOT animable: `max` is the search window of extension 5. */
    lifetime;
    maxParticles;
    // Speed, direction, spread (extension 9.3)
    speed;
    direction;
    /** HALF-spread, in degrees: `θ = direction + spread·(2·u2 − 1)`. */
    spread;
    spherizeDirection;
    alignToVelocity;
    // Shape (extension 9.4)
    shape;
    /** `false` = the file named a shape this reader does not know: do not draw (extension 7.4). */
    shapeKnown;
    radius;
    radiusThickness;
    arc;
    size;
    edge;
    /** Placeholder of a `mesh` of the SAME slot, for `shape: "mesh"`. Level B. */
    mesh;
    meshMode;
    /**
     * `"<slot>/<placeholder>"` of a `path` attachment of ANY slot, for
     * `shape: "path"` (extension 1.1, 9.4.2). The slot is what comes before the
     * FIRST slash; the placeholder is all the rest, slashes included.
     */
    curve;
    // Forces (extension 9.5)
    gravity;
    /** Linear drag `k`, 1/s: `v' = g − k·v`. */
    drag;
    // Rotation and size (extension 9.6)
    angle;
    angularVelocity;
    scale;
    scaleOverLifetime;
    // Color (extension 9.7)
    startColor;
    colorOverLifetime;
    alphaOverLifetime;
    // Image and frame sheet (extension 9.8)
    sequence;
    frameMode;
    cycles;
    fps;
    startFrame;
    // Space, seed, loop, order (extension 9.9)
    space;
    /** ALWAYS fixed. There is no automatic seed, and `0` is a valid seed. */
    seed;
    looping;
    /** Seconds. Only with `looping: false`. */
    prewarm;
    sortMode;
    /**
     * Atlas region of `path`, resolved by the loader exactly as a `region`'s is
     * (spec 2.8). With a `sequence` every particle picks its own frame instead,
     * and this holds the setup frame.
     */
    region = null;
    /** Called by the loader once the atlases are known. */
    setRegion(region) {
        this.region = region;
    }
    constructor(name, options = {}) {
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
export function isParticleAttachment(att) {
    return att !== null && att.type === PARTICLE_ATTACHMENT_TYPE;
}
