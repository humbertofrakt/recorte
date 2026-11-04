// SPDX-License-Identifier: Apache-2.0
/**
 * The bone matrix at an instant that is NOT the frame being drawn — what
 * `space: "world"` needs (extension `BONE_particles`, 7.2).
 *
 * In `local` the bone goes on commanding the particle after it is born, so the
 * matrix wanted is the one of the frame and the caller already has it. In
 * `world` the bone lets the particle go at the instant of BIRTH and never
 * touches it again, so the emitter asks for the matrix at `t_i` — a time in the
 * past, possibly negative, possibly from a previous lap.
 *
 * That matrix comes from `Pose(esqueleto, animação, t_i)` (spec 9.10), which is
 * a pure function: the same `t_i` always gives the same matrix, no matter how
 * many frames were drawn before. This class holds its OWN `Actor` so asking for
 * a past pose never disturbs the skeleton being drawn, and caches by exact
 * `t_i` — a cache changes no result (extension 7.2).
 *
 * The cost is one pose per birth, and the spec says so out loud: the editor
 * warns past 256 poses in a frame.
 */
import { Actor } from '../actor.js';
import { identityMatrix } from '../math.js';
export class BonePoser {
    actor;
    animation;
    duration;
    loop;
    cache = new Map();
    constructor(data, animation, options = {}) {
        this.actor = new Actor(data, options.bodies ?? new Map());
        this.actor.setSkinStack(options.skins ?? ['default']);
        this.animation = animation;
        this.duration = animation === null ? 0 : animation.duration;
        this.loop = options.loop ?? false;
    }
    /**
     * The applied bone of `slotName` (spec 9.5) at skeleton time `t`, as a matrix
     * in skeleton space.
     *
     * When the animation loops, `t` wraps at `D` first. A birth from the lap
     * behind carries `t_i = −0.05` (extension 6), and the bone at that instant
     * was where the animation puts it at `0.95`, not where the first key puts it:
     * without the wrap every particle of every past lap would launch from the
     * pose of time 0, and the seam the loop exists to hide would show again.
     */
    matrixFor(slotName, t) {
        let bySlot = this.cache.get(slotName);
        if (bySlot === undefined) {
            bySlot = new Map();
            this.cache.set(slotName, bySlot);
        }
        const hit = bySlot.get(t);
        if (hit !== undefined)
            return hit;
        const at = this.animationTime(t);
        const skeleton = this.actor.prepare(this.animation, at, this.loop);
        skeleton.time = t;
        skeleton.updateWorldTransform(t);
        const slot = skeleton.slots.find((s) => s.data.name === slotName);
        const source = slot === undefined ? null : slot.boneMatrix;
        const copy = identityMatrix();
        if (source !== null) {
            copy.a = source.a;
            copy.b = source.b;
            copy.c = source.c;
            copy.d = source.d;
            copy.worldX = source.worldX;
            copy.worldY = source.worldY;
        }
        bySlot.set(t, copy);
        return copy;
    }
    /**
     * The `mesh` attachment named by an emitter, deformed at `t` (level B,
     * extension 9.4). Vertices in SKELETON space, three indices per triangle.
     *
     * The placeholder must be a `mesh` OF THE SAME SLOT — that is what the
     * extension says and what the validator checks with `REF_PARTICLE_MESH`.
     * Anything else comes back `null`, and the emitter then says out loud that it
     * is not drawing rather than drawing from nowhere.
     */
    meshFor(slotName, meshName, t) {
        const at = this.animationTime(t);
        const skeleton = this.actor.prepare(this.animation, at, this.loop);
        skeleton.time = t;
        skeleton.updateWorldTransform(t);
        const slot = skeleton.slots.find((s) => s.data.name === slotName);
        if (slot === undefined)
            return null;
        for (const skin of skeleton.skinStack) {
            const att = skin.getAttachment(slot.data.index, meshName);
            if (att === undefined || att === null)
                continue;
            const mesh = att;
            if (mesh.type !== 'mesh' && mesh.type !== 'linkedmesh')
                return null;
            const out = new Float64Array(mesh.vertexCount * 2);
            mesh.computeWorldVertices(slot, out, 0, 2);
            return { vertices: out, triangles: mesh.triangles };
        }
        return null;
    }
    /**
     * The `path` named by an emitter's `curve`, at `t` (extension 1.1, 9.4.2):
     * the `3K` points in SKELETON space — the bone of the PATH's slot and the
     * path's deform at `t` — and whether it is closed.
     *
     * `curve` is `"<slot>/<placeholder>"`: the slot is what comes before the
     * FIRST slash, the placeholder all the rest. The path may live in ANY slot —
     * a slot shows one attachment at a time, and the path usually has its own —
     * and it is looked up in the skins whatever the slot is showing. Anything
     * that is not a `path` comes back `null`, and the emitter says out loud that
     * it is not drawing (`REF_PARTICLE_CURVE` in the validator).
     */
    pathFor(curve, t) {
        const bar = curve.indexOf('/');
        if (bar <= 0 || bar === curve.length - 1)
            return null;
        const slotName = curve.slice(0, bar);
        const pathName = curve.slice(bar + 1);
        const at = this.animationTime(t);
        const skeleton = this.actor.prepare(this.animation, at, this.loop);
        skeleton.time = t;
        skeleton.updateWorldTransform(t);
        const slot = skeleton.slots.find((s) => s.data.name === slotName);
        if (slot === undefined)
            return null;
        for (const skin of skeleton.skinStack) {
            const att = skin.getAttachment(slot.data.index, pathName);
            if (att === undefined || att === null)
                continue;
            const path = att;
            if (path.type !== 'path')
                return null;
            const out = new Float64Array(path.vertexCount * 2);
            path.computeWorldVertices(slot, out, 0, 2);
            return { points: out, closed: path.closed };
        }
        return null;
    }
    /** Length of the slot's bone, for `shape: "bone"` (extension 9.4). */
    lengthFor(slotName) {
        const slot = this.actor.skeleton.slots.find((s) => s.data.name === slotName);
        return slot === undefined ? 0 : slot.bone.data.length;
    }
    /**
     * The `EmitterPose` of one slot, ready to hand to `computeParticles`.
     *
     * `meshName` is the emitter's `mesh` field; pass `null` when the emitter does
     * not use `shape: "mesh"`, and `meshAt` is then left out so the emitter knows
     * this host has no mesh to give. `curve` is the same for `shape: "path"`
     * (extension 1.1): `null` leaves `pathAt` out.
     */
    poseFor(slotName, meshName = null, curve = null) {
        const pose = {
            matrixAt: (t) => this.matrixFor(slotName, t),
            boneLength: () => this.lengthFor(slotName),
        };
        const withMesh = meshName === null ? pose : { ...pose, meshAt: (t) => this.meshFor(slotName, meshName, t) };
        if (curve === null)
            return withMesh;
        return { ...withMesh, pathAt: (t) => this.pathFor(curve, t) };
    }
    animationTime(t) {
        if (!this.loop || this.duration <= 0)
            return t;
        return t - Math.floor(t / this.duration) * this.duration;
    }
}
