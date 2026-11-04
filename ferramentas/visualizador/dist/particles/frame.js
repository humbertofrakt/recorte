// SPDX-License-Identifier: Apache-2.0
/**
 * One emitter's frame, asked for straight off a posed skeleton — the door a
 * renderer uses (extension `BONE_particles`).
 *
 * `computeParticles` deliberately knows nothing about `Skeleton`: it takes a
 * curve, a window and a way of asking for a bone matrix, and that is what makes
 * it testable without a DOM and reusable by the conformance harness. This
 * module is the thin layer that fills those three in from a skeleton that has
 * already been posed, so a renderer does not have to know the extension's
 * insides to draw an emitter.
 *
 * Everything below is still a pure function of the posed skeleton: the cache is
 * only a cache, and extension 7.2 says in so many words that a cache changes no
 * result.
 */
import { EmissionCurve } from './emission.js';
import { computeParticles } from './emitter.js';
import { BonePoser } from './bone-poser.js';
/**
 * Keeps the per-skeleton pieces an emitter needs between frames: the emission
 * curves, and the poser that `space: "world"` leans on. One per renderer is
 * plenty; without it every frame rebuilds them, which is slower and gives the
 * same numbers.
 *
 * Keyed by IDENTITY — the attachment, the animation and the skeleton data
 * objects themselves — and never by name. It used to be keyed by name
 * (animation, slot, attachment), and a renderer that drew one file and then a
 * reloaded one with the same names kept drawing with the OLD curve: measured in
 * the editor as 0 px of difference after changing the rate (round 16, lot 7).
 * A new file brings new objects, so it can never hit an old entry, and the old
 * ones go away with the file (`WeakMap`).
 */
export class ParticleCache {
    curves = new WeakMap();
    posers = new WeakMap();
    /** Drops everything. Call it when the file or the animation changed. */
    clear() {
        this.curves = new WeakMap();
        this.posers = new WeakMap();
    }
    curveFor(skeleton, slot, attachment, animation) {
        let byAnimation = this.curves.get(attachment);
        if (byAnimation === undefined) {
            byAnimation = new Map();
            this.curves.set(attachment, byAnimation);
        }
        let c = byAnimation.get(animation);
        if (c === undefined) {
            c = new EmissionCurve(attachment, emittingKeysOf(animation, slot.data.name, attachment.name));
            byAnimation.set(animation, c);
        }
        return c;
    }
    poserFor(skeleton, animation, loop) {
        let byAnimation = this.posers.get(skeleton.data);
        if (byAnimation === undefined) {
            byAnimation = new Map();
            this.posers.set(skeleton.data, byAnimation);
        }
        let byRest = byAnimation.get(animation);
        if (byRest === undefined) {
            byRest = new Map();
            byAnimation.set(animation, byRest);
        }
        // The skin stack goes in the key too: the poser poses with it.
        const skins = skeleton.skinStack.map((sk) => sk.name);
        const key = `${loop ? '1' : '0'} ${JSON.stringify(skins)}`;
        let p = byRest.get(key);
        if (p === undefined) {
            p = new BonePoser(skeleton.data, animation, { skins, loop });
            byRest.set(key, p);
        }
        return p;
    }
}
/**
 * The `emitting` tap of one emitter, read straight off the animation
 * (extension 4.1). It is never applied to the skeleton: the emitter asks for it
 * at birth instants that are not the frame being drawn.
 */
export function emittingKeysOf(animation, slotName, attachmentName) {
    if (animation === null)
        return null;
    for (const tl of animation.timelines) {
        if (tl.kind !== 'particle.emitting')
            continue;
        if (tl.slot.name !== slotName || tl.attachmentName !== attachmentName)
            continue;
        return tl.keys;
    }
    return null;
}
/**
 * The live particles of `slot`'s emitter at the instant the skeleton is posed
 * at, in draw order, already cut by `maxParticles`.
 *
 * The time asked of the emitter is the ANIMATION time — `skeleton.playingTime`,
 * which already has the loop applied — because that is the frame the births of
 * previous laps are written in (extension 6). With no animation playing it is
 * the skeleton's own clock.
 */
export function particleFrame(skeleton, slot, attachment, cache = null) {
    const animation = skeleton.playingAnimation === null ? null : skeleton.data.findAnimation(skeleton.playingAnimation);
    const duration = animation === null ? 0 : animation.duration;
    const time = animation === null ? skeleton.time : skeleton.playingTime;
    const curve = cache === null
        ? new EmissionCurve(attachment, emittingKeysOf(animation, slot.data.name, attachment.name))
        : cache.curveFor(skeleton, slot, attachment, animation);
    // The poser is needed whenever the emitter asks about an instant that is NOT
    // the frame being drawn. That is `space: "world"` (the bone's matrix at `t_i`,
    // extension 7.2) and ALSO `shape: "mesh"`, whose vertices are the deformed
    // ones at `t_i` (extension 9.4) — and in `local` the inverse of the matrix at
    // `t_i` is needed too, to bring the sampled point back to the bone's frame.
    // `shape: "path"` (extension 1.1) is the same: the path is read at `t_i`.
    const needsPast = attachment.space === 'world' || attachment.shape === 'mesh' || attachment.shape === 'path';
    if (!needsPast) {
        // `local` without a mesh: the bone goes on commanding, so the matrix wanted
        // is the frame's, and the slot's applied bone (spec 9.5) is already here.
        return computeParticles(attachment, curve, { time, duration }, {
            matrixAt: () => slot.boneMatrix,
            boneLength: () => slot.bone.data.length,
        });
    }
    const poser = (cache ?? new ParticleCache()).poserFor(skeleton, animation, skeleton.playingLoop);
    return computeParticles(attachment, curve, { time, duration }, poser.poseFor(slot.data.name, attachment.mesh, attachment.curve));
}
/**
 * Atlas region one particle shows: the frame of the `sequence` (extension 9.8)
 * or, without a sequence, the emitter's own `path`.
 *
 * `region` is resolved by the loader, so a missing image comes back `null` and
 * the caller warns instead of drawing a guess.
 */
export function particleRegion(attachment, particle, fallback) {
    const sequence = attachment.sequence;
    if (sequence === null || particle.frame < 0)
        return fallback;
    return sequence.regions[particle.frame] ?? null;
}
