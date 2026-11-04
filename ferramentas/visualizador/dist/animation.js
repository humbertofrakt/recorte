import { orderFromOffsets } from './draw-order.js';
import { VertexAttachment } from './attachments/vertex-attachment.js';
import { SkeletonAttachment } from './attachments/skeleton-attachment.js';
import { sampleCurve } from './curve.js';
import { clamp } from './math.js';
import { sequenceFrameAt } from './sequence-frame.js';
// ---------------------------------------------------------------------------
// Key lookup and evaluation (spec 9.10 `evaluate`)
// ---------------------------------------------------------------------------
/**
 * Largest `i` with `times[i] <= t` (binary search), or `-1` when `t` is
 * before the first key. `times` is strictly increasing.
 */
export function findKeyIndex(times, t) {
    let lo = 0;
    let hi = times.length - 1;
    if (hi < 0 || t < times[0])
        return -1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (times[mid] <= t)
            lo = mid;
        else
            hi = mid - 1;
    }
    return lo;
}
/** Component `j` of numeric keys at time `t` (spec 9.10 + 9.3). */
export function evaluateComponent(keys, t, j) {
    const times = keys.times;
    const n = times.length;
    const c = keys.components;
    const values = keys.values;
    if (n === 0)
        return 0;
    if (t <= times[0])
        return values[j];
    if (t >= times[n - 1])
        return values[(n - 1) * c + j];
    const i = findKeyIndex(times, t);
    const v0 = values[i * c + j];
    const v1 = values[(i + 1) * c + j];
    return sampleCurve(keys.curves[i], j, times[i], times[i + 1], v0, v1, t);
}
/** One-component numeric keys at time `t`. */
export function evaluateNumber(keys, t) {
    return evaluateComponent(keys, t, 0);
}
/** Every component at time `t`, written into `out` (length `>= components`). */
export function evaluateComponents(keys, t, out) {
    for (let j = 0; j < keys.components; j++)
        out[j] = evaluateComponent(keys, t, j);
    return out;
}
/** Non-interpolable keys at time `t`: the last key with `time <= t`, or the first key before it. */
export function evaluateStepped(keys, t) {
    const i = findKeyIndex(keys.times, t);
    return keys.values[i < 0 ? 0 : i];
}
/**
 * `darkColor` at time `t`: `null` (tint black off) or `[r, g, b]` in `out`.
 * A segment that starts or ends in `null` is stepped (spec 9.5).
 */
export function evaluateDarkColor(tl, t, out) {
    const times = tl.times;
    const n = times.length;
    if (n === 0)
        return null;
    let i;
    if (t <= times[0])
        i = 0;
    else if (t >= times[n - 1])
        i = n - 1;
    else
        i = findKeyIndex(times, t);
    const v0 = tl.values[i];
    if (v0 === null)
        return null;
    if (i === n - 1 || t <= times[0] || t >= times[n - 1]) {
        out.set(v0);
        return out;
    }
    const v1 = tl.values[i + 1];
    if (v1 === null) {
        out.set(v0);
        return out;
    }
    const curve = tl.curves[i];
    for (let j = 0; j < 3; j++)
        out[j] = sampleCurve(curve, j, times[i], times[i + 1], v0[j], v1[j], t);
    return out;
}
/**
 * Deform at time `t` (spec 9.6): element by element with ONE curve per key,
 * `s = sampled factor in [v0 = 0, v1 = 1]`, `out = k + (n - k) * s`. An empty
 * key (`value: []`) is a deform of zeros. Returns `null` when the result is
 * "no deform" (both keys empty), otherwise `out` (length `deformLength`).
 */
export function evaluateDeform(tl, t, out) {
    const times = tl.times;
    const n = times.length;
    if (n === 0)
        return null;
    const length = tl.attachment.deformLength;
    let i;
    if (t <= times[0])
        i = 0;
    else if (t >= times[n - 1])
        i = n - 1;
    else
        i = findKeyIndex(times, t);
    const k = tl.vertices[i];
    if (i === n - 1 || t <= times[0] || t >= times[n - 1]) {
        if (k.length === 0)
            return null;
        copyPadded(k, out, length);
        return out;
    }
    const next = tl.vertices[i + 1];
    if (k.length === 0 && next.length === 0)
        return null;
    const s = sampleCurve(tl.curves[i], 0, times[i], times[i + 1], 0, 1, t);
    for (let j = 0; j < length; j++) {
        const a = j < k.length ? k[j] : 0;
        const b = j < next.length ? next[j] : 0;
        out[j] = a + (b - a) * s;
    }
    return out;
}
function copyPadded(src, out, length) {
    const n = Math.min(src.length, length);
    for (let j = 0; j < n; j++)
        out[j] = src[j];
    for (let j = n; j < length; j++)
        out[j] = 0;
}
// ---------------------------------------------------------------------------
// Applying an animation (spec 9.10 `Pose`)
// ---------------------------------------------------------------------------
const scratch3 = new Float64Array(3);
/**
 * Writes the state of `animation` at time `t` into `skeleton` (spec 9.10),
 * on top of whatever the skeleton holds (call `setToSetupPose` first for the
 * reference pose, or use `pose`). Does not compute the world transform and
 * does not fire events (`fireEvents`) nor physics resets (`applyResets`).
 * `deform` and `sequence` timelines are applied after every other timeline so
 * they see the final attachment of the slot; they only take effect when the
 * slot shows the attachment they name (or one that inherits its deform).
 */
export function applyAnimation(skeleton, animation, t) {
    const timelines = animation.timelines;
    let tagsWritten = false;
    skeleton.playingAnimation = animation.name;
    skeleton.playingTime = t;
    for (let i = 0; i < timelines.length; i++) {
        const tl = timelines[i];
        switch (tl.kind) {
            case 'bone.number':
                skeleton.bones[tl.bone.index][tl.property] = evaluateNumber(tl.keys, t);
                break;
            case 'bone.inherit':
                skeleton.bones[tl.bone.index][tl.property] = evaluateStepped(tl.keys, t);
                break;
            case 'bone.parent':
                applyParentKey(skeleton, skeleton.bones[tl.bone.index], evaluateStepped(tl.keys, t));
                break;
            case 'slot.attachment': {
                const slot = skeleton.slots[tl.slot.index];
                slot.setAttachmentName(evaluateStepped(tl.keys, t));
                slot.nestedOrigin = entityRunStart(skeleton, tl.slot.index, tl.keys, t);
                break;
            }
            case 'slot.color': {
                const slot = skeleton.slots[tl.slot.index];
                evaluateComponents(tl.keys, t, slot.color);
                break;
            }
            case 'slot.darkColor': {
                const slot = skeleton.slots[tl.slot.index];
                const v = evaluateDarkColor(tl, t, scratch3);
                if (v === null)
                    slot.darkColor = null;
                else if (slot.darkColor === null)
                    slot.darkColor = Float64Array.from(v);
                else
                    slot.darkColor.set(v);
                break;
            }
            case 'slot.visible':
                skeleton.slots[tl.slot.index].visible = evaluateStepped(tl.keys, t);
                break;
            case 'slot.bone':
                applySlotBoneKey(skeleton, skeleton.slots[tl.slot.index], evaluateStepped(tl.keys, t));
                break;
            case 'drawOrder': {
                const i = findKeyIndex(tl.times, t);
                applyDrawOrder(skeleton, tl.entries[i < 0 ? 0 : i]);
                break;
            }
            case 'constraint.number': {
                const c = skeleton.constraintFor(tl.constraint);
                if (c !== null)
                    c[tl.property] = evaluateNumber(tl.keys, t);
                break;
            }
            case 'constraint.boolean': {
                const c = skeleton.constraintFor(tl.constraint);
                if (c !== null)
                    c[tl.property] = evaluateStepped(tl.keys, t);
                break;
            }
            case 'parameter':
                skeleton.parameters[tl.parameter.index] = tl.parameter.constrain(evaluateNumber(tl.keys, t));
                break;
            case 'morph': {
                const m = tl.morph;
                skeleton.morphWeights[m.index] = clamp(evaluateNumber(tl.keys, t), m.min, m.max);
                break;
            }
            case 'variable.number': {
                const v = evaluateNumber(tl.keys, t);
                skeleton.variables[tl.variable.index] = tl.variable.type === 'int' ? Math.trunc(v) : v;
                break;
            }
            case 'variable.stepped':
                skeleton.variables[tl.variable.index] = evaluateStepped(tl.keys, t);
                break;
            case 'tag':
                skeleton.tags = activeTagsOf(animation, tl.keys, t);
                tagsWritten = true;
                break;
            case 'nested.animation': {
                const slot = skeleton.slots[tl.slot.index];
                slot.nestedAnimation = evaluateStepped(tl.keys, t);
                slot.nestedAnimationSet = true;
                slot.nestedAnimationOrigin = runStart(tl.keys, t);
                break;
            }
            case 'nested.number': {
                const slot = skeleton.slots[tl.slot.index];
                const v = evaluateNumber(tl.keys, t);
                if (tl.property === 'time')
                    slot.nestedTime = v;
                else
                    slot.nestedTimeScale = v;
                break;
            }
            case 'event':
            case 'constraint.reset':
            case 'body':
            case 'deform':
            case 'weights':
            case 'sequence':
                // events / resets: `fireEvents`, `applyResets`; body: the `Actor` (9.13);
                // deform / weights / sequence: second pass below
                break;
        }
    }
    if (!tagsWritten && animation.tags.length > 0)
        skeleton.tags = animation.tags;
    for (let i = 0; i < timelines.length; i++) {
        const tl = timelines[i];
        if (tl.kind === 'deform')
            applyDeform(skeleton.slots[tl.slot.index], tl, t);
        else if (tl.kind === 'weights')
            applyWeights(skeleton.slots[tl.slot.index], tl, t);
        else if (tl.kind === 'sequence') {
            const slot = skeleton.slots[tl.slot.index];
            if (slot.attachment === tl.attachment)
                slot.sequenceIndex = sequenceFrameAt(tl, t);
        }
    }
}
function applyDeform(slot, tl, t) {
    const current = slot.attachment;
    if (!(current instanceof VertexAttachment) || current.timelineAttachment !== tl.attachment.timelineAttachment)
        return;
    const length = tl.attachment.deformLength;
    let buffer = slot.deform;
    if (buffer === null || buffer.length !== length || slot.deformAttachment !== tl.attachment.timelineAttachment) {
        buffer = new Float64Array(length);
    }
    const v = evaluateDeform(tl, t, buffer);
    if (v === null) {
        slot.deform = null;
        slot.deformAttachment = null;
    }
    else {
        slot.deform = v;
        slot.deformAttachment = tl.attachment.timelineAttachment;
    }
}
/**
 * Where the run of stepped keys holding the value in force at `t` began
 * (Appendix C rule 1): the time of the earliest key of the run of equal values
 * that ends at the key in force. Before the first key, 0. Stateless: the same
 * `t` always gives the same answer.
 */
export function runStart(keys, t) {
    const i = findKeyIndex(keys.times, t);
    if (i < 0)
        return 0;
    const value = keys.values[i];
    let j = i;
    while (j > 0 && keys.values[j - 1] === value)
        j--;
    return keys.times[j];
}
/**
 * `runStart` for a `slot/attachment` timeline (spec 7.11, Appendix C rule 1):
 * the run also goes back through keys that show ANOTHER placeholder holding a
 * `skeleton` attachment of the same resolved `uri`. Swapping between two
 * placeholders of one entity — how `around` is turned on and off in the middle
 * of an animation — does not restart the child. Another `uri` does.
 * The placeholders resolve through the skins of the instant; still stateless.
 */
export function entityRunStart(skeleton, slotIndex, keys, t) {
    const i = findKeyIndex(keys.times, t);
    if (i < 0)
        return 0;
    const value = keys.values[i];
    const uriOf = (name) => {
        if (name === null)
            return null;
        const att = skeleton.getAttachment(slotIndex, name);
        return att instanceof SkeletonAttachment ? att.resolvedUri : null;
    };
    const uri = uriOf(value);
    let j = i;
    while (j > 0) {
        const before = keys.values[j - 1];
        if (before !== value && (uri === null || uriOf(before) !== uri))
            break;
        j--;
    }
    return keys.times[j];
}
/**
 * A `slot` / `bone` key (spec 9.5): hangs the slot from the key bone, with the
 * key `transform`; `bone: null` = the bone of the file. Nothing is converted.
 */
export function applySlotBoneKey(skeleton, slot, key) {
    slot.setBone(key.bone === null ? null : skeleton.bones[key.bone.index], key.transform);
}
/**
 * Weights at time `t` (spec 9.6 `weights`): element by element with ONE curve
 * per key, like `deform`, never renormalized. Writes `out` and returns it.
 */
export function evaluateWeights(tl, t, out) {
    const times = tl.times;
    const n = times.length;
    if (t <= times[0] || n === 1) {
        out.set(tl.weights[0]);
        return out;
    }
    if (t >= times[n - 1]) {
        out.set(tl.weights[n - 1]);
        return out;
    }
    const i = findKeyIndex(times, t);
    const k = tl.weights[i];
    const next = tl.weights[i + 1];
    const s = sampleCurve(tl.curves[i], 0, times[i], times[i + 1], 0, 1, t);
    for (let j = 0; j < out.length; j++)
        out[j] = k[j] + (next[j] - k[j]) * s;
    return out;
}
/** Writes the weights of this frame into the slot, when it shows that attachment. */
function applyWeights(slot, tl, t) {
    const current = slot.attachment;
    const target = tl.attachment.timelineAttachment;
    if (!(current instanceof VertexAttachment) || current.timelineAttachment !== target)
        return;
    const length = tl.weights[0].length;
    let buffer = slot.weights;
    if (buffer === null || buffer.length !== length || slot.weightsAttachment !== target)
        buffer = new Float64Array(length);
    slot.weights = evaluateWeights(tl, t, buffer);
    slot.weightsAttachment = target;
}
/**
 * A `parent` key (spec 9.4): `null` = the parent of the file. A cycle is
 * refused by `Bone.setParent`, and the skeleton warns once (L2 `PARENT_CYCLE`).
 */
export function applyParentKey(skeleton, bone, target) {
    const parent = target === null ? bone.setupParent : skeleton.bones[target.index];
    if (!bone.setParent(parent)) {
        skeleton.warnOnce(`PARENT_CYCLE: "${bone.data.name}" não pode virar filho de "${parent === null ? '' : parent.data.name}" (9.4); chave ignorada`);
    }
}
/**
 * Sets `skeleton.drawOrder` from a key of spec 9.5, in place. `null` (the key
 * `[]`) = the base order of spec 4.4; offsets are measured from that base
 * order, not from the `slots` array (case C-280).
 */
export function applyDrawOrder(skeleton, entries) {
    const base = skeleton.baseDrawOrder;
    const out = skeleton.drawOrder;
    out.length = base.length;
    if (entries === null) {
        for (let i = 0; i < base.length; i++)
            out[i] = base[i];
        return;
    }
    const order = orderFromOffsets(base.map((s) => s.data.index), entries.map((e) => ({ slot: e.slot.index, offset: e.offset })));
    const slots = skeleton.slots;
    for (let i = 0; i < order.length; i++)
        out[i] = slots[order[i]];
}
/**
 * Reference `Pose(skeleton, animation, t, now)` of spec 9.10: setup pose,
 * the animation at `t`, then `updateWorldTransform(now)`.
 */
export function pose(skeleton, animation, t, now = skeleton.time) {
    skeleton.setToSetupPose();
    applyAnimation(skeleton, animation, t);
    skeleton.updateWorldTransform(now);
}
// ---------------------------------------------------------------------------
// Tags (spec 8.5)
// ---------------------------------------------------------------------------
/**
 * `activeTags(animation, time)` of spec 8.5: `animation.tags` plus the value
 * of the last `tag` key with `time <= t`; only `animation.tags` before the
 * first key (the specific rule of 8.5 wins over the generic 9.10 edge rule).
 */
export function activeTags(animation, t) {
    for (const tl of animation.timelines)
        if (tl.kind === 'tag')
            return activeTagsOf(animation, tl.keys, t);
    return animation.tags;
}
function activeTagsOf(animation, keys, t) {
    const i = findKeyIndex(keys.times, t);
    if (i < 0)
        return animation.tags;
    const fromKey = keys.values[i];
    if (animation.tags.length === 0)
        return fromKey;
    const out = animation.tags.slice();
    for (const tag of fromKey)
        if (!out.includes(tag))
            out.push(tag);
    return out;
}
/**
 * Calls `deliver(index, fireTime)` for every crossing of `times[index]` in
 * `(prev, now]`, unrolled by `duration` when `loop` (spec 8.6). Deliveries are
 * ordered by fire time; ties keep the key order.
 */
function crossings(times, prev, now, loop, duration, deliver) {
    const hits = [];
    for (let i = 0; i < times.length; i++) {
        const kt = times[i];
        if (!loop || duration === 0) {
            if (prev < kt && kt <= now)
                hits.push({ index: i, time: kt });
            continue;
        }
        let n = prev === -Infinity ? 0 : Math.max(0, Math.ceil((prev - kt) / duration));
        // `prev < kt + n*D` must hold: step forward while it does not (rounding).
        while (kt + n * duration <= prev)
            n++;
        for (; kt + n * duration <= now; n++)
            hits.push({ index: i, time: kt + n * duration });
    }
    hits.sort((a, b) => a.time - b.time || a.index - b.index);
    for (const h of hits)
        deliver(h.index, h.time);
}
/**
 * Events of `animation` crossed between `prev` (exclusive, `-Infinity` on the
 * first frame) and `now` (inclusive), both in animation seconds without loop
 * applied (spec 8.6). Appended to `out` in delivery order.
 */
export function fireEvents(animation, prev, now, loop, out = []) {
    for (const tl of animation.timelines) {
        if (tl.kind !== 'event')
            continue;
        crossings(tl.times, prev, now, loop, animation.duration, (index, time) => out.push({ key: tl.events[index], time }));
    }
    return out;
}
/**
 * `reset` keys of `physics` constraints crossed in `(prev, now]` (spec 9.8):
 * calls `reset()` on the runtime constraint. Returns how many resets fired.
 */
export function applyResets(skeleton, animation, prev, now, loop) {
    let count = 0;
    for (const tl of animation.timelines) {
        if (tl.kind !== 'constraint.reset')
            continue;
        const c = skeleton.constraintFor(tl.constraint);
        crossings(tl.times, prev, now, loop, animation.duration, () => {
            count++;
            if (c !== null)
                c.reset();
        });
    }
    return count;
}
/** `true` for the timeline kinds `applyAnimation` writes (everything but `event` and `reset`). */
export function isPoseTimeline(tl) {
    // `particle.emitting` joins `body` here: it changes no field of the pose.
    // The emitter reads its keys directly, at the birth instants, because a
    // particle is a pure function of time and those instants are not the frame
    // being drawn (extension `BONE_particles`, 4.1 and 6).
    return tl.kind !== 'event' && tl.kind !== 'constraint.reset' && tl.kind !== 'body'
        && tl.kind !== 'particle.emitting';
}
