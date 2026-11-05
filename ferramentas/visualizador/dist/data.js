// SPDX-License-Identifier: Apache-2.0
/**
 * Immutable data classes: the resolved form of a `.bone` file and of an atlas.
 *
 * Names are resolved to object references by the loader; the runtime never
 * looks names up per frame. Instances (`Skeleton`, `Bone`, `Slot`) live in
 * `skeleton.ts` and point back to these.
 */
export { VertexAttachment, BindingData } from './attachments/vertex-attachment.js';
export { RegionAttachment } from './attachments/region.js';
export { MeshAttachment } from './attachments/mesh.js';
export { LinkedMeshAttachment } from './attachments/linkedmesh.js';
export { BoundingBoxAttachment } from './attachments/boundingbox.js';
export { ClippingAttachment } from './attachments/clipping.js';
export { PathAttachment } from './attachments/path.js';
export { PointAttachment } from './attachments/point.js';
export { SkeletonAttachment } from './attachments/skeleton-attachment.js';
export { SequenceData } from './attachments/sequence.js';
/** Maps the three booleans to a mode (spec 5.3). Since F3 every combination has a formula. */
export function inheritMode(inheritRotation, inheritScale, inheritReflection) {
    if (inheritRotation) {
        if (inheritScale)
            return inheritReflection ? 'normal' : 'noReflection';
        return inheritReflection ? 'noScale' : 'noScaleOrReflection';
    }
    if (inheritScale)
        return inheritReflection ? 'noRotation' : 'noRotationOrReflection';
    return inheritReflection ? 'onlyReflection' : 'onlyTranslation';
}
export class BoneData {
    index;
    name;
    parent;
    length;
    x;
    y;
    rotation;
    scaleX;
    scaleY;
    shearX;
    shearY;
    inheritRotation;
    inheritScale;
    inheritReflection;
    skinRequired;
    color;
    icon;
    visible;
    folder;
    constructor(index, name, parent, values = {}) {
        this.index = index;
        this.name = name;
        this.parent = parent;
        this.length = values.length ?? 0;
        this.x = values.x ?? 0;
        this.y = values.y ?? 0;
        this.rotation = values.rotation ?? 0;
        this.scaleX = values.scaleX ?? 1;
        this.scaleY = values.scaleY ?? 1;
        this.shearX = values.shearX ?? 0;
        this.shearY = values.shearY ?? 0;
        this.inheritRotation = values.inheritRotation ?? true;
        this.inheritScale = values.inheritScale ?? true;
        this.inheritReflection = values.inheritReflection ?? true;
        this.skinRequired = values.skinRequired ?? false;
        this.color = values.color ?? [0.61, 0.61, 0.61, 1];
        this.icon = values.icon ?? null;
        this.visible = values.visible ?? true;
        this.folder = values.folder ?? null;
    }
    /** Setup inheritance mode (spec 5.3). */
    get inherit() {
        return inheritMode(this.inheritRotation, this.inheritScale, this.inheritReflection);
    }
}
export class SlotData {
    index;
    name;
    bone;
    /** Setup placeholder name. `null` = empty slot. */
    attachmentName;
    color;
    darkColor;
    blend;
    visible;
    folder;
    constructor(index, name, bone, values = {}) {
        this.index = index;
        this.name = name;
        this.bone = bone;
        this.attachmentName = values.attachmentName ?? null;
        this.color = values.color ?? [1, 1, 1, 1];
        this.darkColor = values.darkColor ?? null;
        this.blend = values.blend ?? 'normal';
        this.visible = values.visible ?? true;
        this.folder = values.folder ?? null;
    }
}
export class SkinData {
    index;
    name;
    displayName;
    /** Skins this one incorporates, in order (filled by the loader after all skins exist). */
    includes = [];
    bones = [];
    constraints = [];
    /** Draw-order offsets applied while this skin is active (spec 4.4). */
    drawOrder = [];
    /** slot index -> placeholder -> attachment (`null` hides the placeholder). */
    attachments = new Map();
    constructor(index, name, displayName = null) {
        this.index = index;
        this.name = name;
        this.displayName = displayName;
    }
    /**
     * Attachment defined by this skin alone for `(slot, placeholder)`.
     * `undefined` = not defined here; `null` = defined as hidden.
     */
    getAttachment(slotIndex, name) {
        return this.attachments.get(slotIndex)?.get(name);
    }
    /** Adds an attachment definition. Used by the loader and by editors. */
    setAttachment(slotIndex, name, attachment) {
        let map = this.attachments.get(slotIndex);
        if (map === undefined) {
            map = new Map();
            this.attachments.set(slotIndex, map);
        }
        map.set(name, attachment);
    }
    /**
     * This skin's activation list: its includes expanded (recursively, in order)
     * followed by itself (spec 4.4). Cycles are cut.
     */
    expand(out = [], visiting = new Set()) {
        if (visiting.has(this))
            return out;
        visiting.add(this);
        for (const inc of this.includes)
            inc.expand(out, visiting);
        out.push(this);
        visiting.delete(this);
        return out;
    }
}
// ---------------------------------------------------------------------------
// Constraints (spec 6, 8.2)
// ---------------------------------------------------------------------------
export class ConstraintData {
    index;
    name;
    mix;
    skinRequired;
    constructor(index, name, mix, skinRequired) {
        this.index = index;
        this.name = name;
        this.mix = mix;
        this.skinRequired = skinRequired;
    }
}
export class IkConstraintData extends ConstraintData {
    type = 'ik';
    bones;
    target;
    bendPositive;
    compress;
    stretch;
    uniform;
    softness;
    constructor(index, name, bones, target, values = {}) {
        super(index, name, values.mix ?? 1, values.skinRequired ?? false);
        this.bones = bones;
        this.target = target;
        this.bendPositive = values.bendPositive ?? true;
        this.compress = values.compress ?? false;
        this.stretch = values.stretch ?? false;
        this.uniform = values.uniform ?? false;
        this.softness = values.softness ?? 0;
    }
}
export class TransformConstraintData extends ConstraintData {
    type = 'transform';
    bones;
    target;
    local;
    relative;
    offsetRotation;
    offsetX;
    offsetY;
    offsetScaleX;
    offsetScaleY;
    offsetShearY;
    mixRotation;
    mixX;
    mixY;
    mixScaleX;
    mixScaleY;
    mixShearY;
    constructor(index, name, bones, target, values = {}) {
        super(index, name, values.mix ?? 1, values.skinRequired ?? false);
        this.bones = bones;
        this.target = target;
        this.local = values.local ?? false;
        this.relative = values.relative ?? false;
        this.offsetRotation = values.offsetRotation ?? 0;
        this.offsetX = values.offsetX ?? 0;
        this.offsetY = values.offsetY ?? 0;
        this.offsetScaleX = values.offsetScaleX ?? 0;
        this.offsetScaleY = values.offsetScaleY ?? 0;
        this.offsetShearY = values.offsetShearY ?? 0;
        this.mixRotation = values.mixRotation ?? 1;
        this.mixX = values.mixX ?? 1;
        this.mixY = values.mixY ?? 1;
        this.mixScaleX = values.mixScaleX ?? 1;
        this.mixScaleY = values.mixScaleY ?? 1;
        this.mixShearY = values.mixShearY ?? 1;
    }
}
export class PathConstraintData extends ConstraintData {
    type = 'path';
    bones;
    /** Slot whose current attachment must be a `path`. */
    target;
    positionMode;
    spacingMode;
    rotateMode;
    offsetRotation;
    position;
    spacing;
    mixRotation;
    mixX;
    mixY;
    constructor(index, name, bones, target, values = {}) {
        super(index, name, values.mix ?? 1, values.skinRequired ?? false);
        this.bones = bones;
        this.target = target;
        this.positionMode = values.positionMode ?? 'percent';
        this.spacingMode = values.spacingMode ?? 'length';
        this.rotateMode = values.rotateMode ?? 'tangent';
        this.offsetRotation = values.offsetRotation ?? 0;
        this.position = values.position ?? 0;
        this.spacing = values.spacing ?? 0;
        this.mixRotation = values.mixRotation ?? 1;
        this.mixX = values.mixX ?? 1;
        this.mixY = values.mixY ?? 1;
    }
}
export class PhysicsConstraintData extends ConstraintData {
    type = 'physics';
    bone;
    x;
    y;
    rotation;
    scaleX;
    shearX;
    inertia;
    strength;
    damping;
    mass;
    wind;
    gravity;
    limit;
    fps;
    constructor(index, name, bone, values = {}) {
        super(index, name, values.mix ?? 1, values.skinRequired ?? false);
        this.bone = bone;
        this.x = values.x ?? 0;
        this.y = values.y ?? 0;
        this.rotation = values.rotation ?? 0;
        this.scaleX = values.scaleX ?? 0;
        this.shearX = values.shearX ?? 0;
        this.inertia = values.inertia ?? 0.5;
        this.strength = values.strength ?? 100;
        this.damping = values.damping ?? 1;
        this.mass = values.mass ?? 1;
        this.wind = values.wind ?? 0;
        this.gravity = values.gravity ?? 0;
        this.limit = values.limit ?? 5000;
        this.fps = values.fps ?? 60;
    }
}
/** One target of a driver in "targets" mode: a timeline keyed by parameter input (spec 8.2). */
export class DriverTargetData {
    /** Keys resolved like a timeline; `times` hold the `input` values. */
    timeline;
    mode;
    constructor(timeline, mode) {
        this.timeline = timeline;
        this.mode = mode;
    }
}
export class DriverConstraintData extends ConstraintData {
    type = 'driver';
    parameter;
    /** Targets mode (`null` in continuous mode). */
    targets;
    /** Continuous mode animation. Bound by the loader after animations are read. */
    animation;
    /** Continuous mode: name written in the file, kept for late binding. */
    animationName;
    from;
    to;
    timeFrom;
    /** `NaN` until bound to the animation (default: animation duration). */
    timeTo;
    mode;
    constructor(index, name, parameter, values = {}) {
        super(index, name, values.mix ?? 1, values.skinRequired ?? false);
        this.parameter = parameter;
        this.targets = values.targets ?? null;
        this.animation = null;
        this.animationName = values.animationName ?? null;
        this.from = values.from ?? parameter.min;
        this.to = values.to ?? parameter.max;
        this.timeFrom = values.timeFrom ?? 0;
        this.timeTo = values.timeTo ?? Number.NaN;
        this.mode = values.mode ?? 'replace';
    }
}
// ---------------------------------------------------------------------------
// Events, parameters, morphs, variables
// ---------------------------------------------------------------------------
export class EventData {
    index;
    name;
    int;
    float;
    string;
    audio;
    volume;
    balance;
    constructor(index, name, values = {}) {
        this.index = index;
        this.name = name;
        this.int = values.int ?? 0;
        this.float = values.float ?? 0;
        this.string = values.string ?? '';
        this.audio = values.audio ?? null;
        this.volume = values.volume ?? 1;
        this.balance = values.balance ?? 0;
    }
}
export class ParameterSourceData {
    bone;
    property;
    from;
    to;
    constructor(bone, property, from = 0, to = 1) {
        this.bone = bone;
        this.property = property;
        this.from = from;
        this.to = to;
    }
}
export class ParameterData {
    index;
    name;
    min;
    max;
    default;
    repeat;
    group;
    displayName;
    source;
    constructor(index, name, values = {}) {
        this.index = index;
        this.name = name;
        this.min = values.min ?? 0;
        this.max = values.max ?? 1;
        this.default = values.default ?? 0;
        this.repeat = values.repeat ?? false;
        this.group = values.group ?? null;
        this.displayName = values.displayName ?? null;
        this.source = values.source ?? null;
    }
    /**
     * Clamps or wraps a value to `[min, max]` (spec 8.1). A degenerate range
     * (`max <= min`, L1) always yields `min` (DUVIDAS-SPEC 8).
     */
    constrain(value) {
        if (this.max <= this.min)
            return this.min;
        if (this.repeat) {
            const r = this.max - this.min;
            return this.min + (((value - this.min) % r) + r) % r;
        }
        return value < this.min ? this.min : value > this.max ? this.max : value;
    }
}
export class MorphTargetData {
    slot;
    skin;
    attachment;
    offsets;
    constructor(slot, skin, attachment, offsets) {
        this.slot = slot;
        this.skin = skin;
        this.attachment = attachment;
        this.offsets = Float64Array.from(offsets);
    }
}
export class MorphData {
    index;
    name;
    weight;
    min;
    max;
    group;
    /** Filled by the loader after the attachments exist. */
    targets = [];
    constructor(index, name, values = {}) {
        this.index = index;
        this.name = name;
        this.weight = values.weight ?? 0;
        this.min = values.min ?? 0;
        this.max = values.max ?? 1;
        this.group = values.group ?? null;
    }
}
export class VariableData {
    index;
    name;
    type;
    default;
    constructor(index, name, type, defaultValue) {
        this.index = index;
        this.name = name;
        this.type = type;
        this.default = defaultValue ?? VariableData.defaultFor(type);
    }
    static defaultFor(type) {
        switch (type) {
            case 'string': return '';
            case 'bool': return false;
            default: return 0;
        }
    }
    get isNumeric() {
        return this.type === 'float' || this.type === 'int';
    }
}
export class TimelineBase {
    get keyCount() {
        return this.times.length;
    }
    /** Time of the last key (0 when empty). */
    get lastTime() {
        const t = this.times;
        return t.length === 0 ? 0 : t[t.length - 1];
    }
}
export class BoneNumberTimelineData extends TimelineBase {
    bone;
    property;
    keys;
    kind = 'bone.number';
    type = 'bone';
    constructor(bone, property, keys) {
        super();
        this.bone = bone;
        this.property = property;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class BoneInheritTimelineData extends TimelineBase {
    bone;
    property;
    keys;
    kind = 'bone.inherit';
    type = 'bone';
    constructor(bone, property, keys) {
        super();
        this.bone = bone;
        this.property = property;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
/**
 * `bone` / `parent` (spec 9.4): the bone hangs from another bone from the key
 * on, stepped only; `null` = the parent of the file. Local values are not
 * converted — from the key on they are measured from the new parent.
 */
export class BoneParentTimelineData extends TimelineBase {
    bone;
    keys;
    kind = 'bone.parent';
    type = 'bone';
    property = 'parent';
    constructor(bone, keys) {
        super();
        this.bone = bone;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class SlotAttachmentTimelineData extends TimelineBase {
    slot;
    keys;
    kind = 'slot.attachment';
    type = 'slot';
    property = 'attachment';
    constructor(slot, keys) {
        super();
        this.slot = slot;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class SlotColorTimelineData extends TimelineBase {
    slot;
    keys;
    kind = 'slot.color';
    type = 'slot';
    property = 'color';
    /** 4 components per key. */
    constructor(slot, keys) {
        super();
        this.slot = slot;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class SlotDarkColorTimelineData extends TimelineBase {
    slot;
    kind = 'slot.darkColor';
    type = 'slot';
    property = 'darkColor';
    times;
    /** `[r, g, b]` per key or `null` (tint black off). */
    values;
    /** Stepped whenever either end of the segment is `null` (spec 9.5). */
    curves;
    constructor(slot, times, values, curves) {
        super();
        this.slot = slot;
        this.times = times;
        this.values = values;
        this.curves = curves;
    }
}
export class SlotVisibleTimelineData extends TimelineBase {
    slot;
    keys;
    kind = 'slot.visible';
    type = 'slot';
    property = 'visible';
    constructor(slot, keys) {
        super();
        this.slot = slot;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class DrawOrderTimelineData extends TimelineBase {
    kind = 'drawOrder';
    type = 'drawOrder';
    times;
    /** Per key: slot indices in draw order over the `slots` ARRAY order (spec 9.5 algorithm applied), or `null` = base order. Kept for tools; the runtime applies `entries` over the base order of spec 4.4. */
    orders;
    /** Per key: the `{slot, offset}` list as written (`null` = `[]`, back to the base order). */
    entries;
    constructor(times, orders, entries) {
        super();
        this.times = times;
        this.orders = orders;
        this.entries = entries;
    }
}
export class DeformTimelineData extends TimelineBase {
    slot;
    skin;
    attachment;
    kind = 'deform';
    type = 'deform';
    times;
    /**
     * Per key: the deform expanded to `attachment.deformLength` (spec 9.6),
     * or an empty array for `value: []` (no deform).
     */
    vertices;
    /** One curve (1 component) per key. */
    curves;
    constructor(slot, skin, attachment, times, vertices, curves) {
        super();
        this.slot = slot;
        this.skin = skin;
        this.attachment = attachment;
        this.times = times;
        this.vertices = vertices;
        this.curves = curves;
    }
}
export class SequenceTimelineData extends TimelineBase {
    slot;
    skin;
    attachment;
    keys;
    kind = 'sequence';
    type = 'sequence';
    constructor(slot, skin, attachment, keys) {
        super();
        this.slot = slot;
        this.skin = skin;
        this.attachment = attachment;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class EventTimelineData extends TimelineBase {
    kind = 'event';
    type = 'event';
    times;
    /** Non-decreasing times; several keys may share a time (spec 9.7). */
    events;
    constructor(times, events) {
        super();
        this.times = times;
        this.events = events;
    }
}
export class ConstraintNumberTimelineData extends TimelineBase {
    constraint;
    property;
    keys;
    kind = 'constraint.number';
    type = 'constraint';
    constructor(constraint, property, keys) {
        super();
        this.constraint = constraint;
        this.property = property;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class ConstraintBooleanTimelineData extends TimelineBase {
    constraint;
    property;
    keys;
    kind = 'constraint.boolean';
    type = 'constraint';
    constructor(constraint, property, keys) {
        super();
        this.constraint = constraint;
        this.property = property;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class ConstraintResetTimelineData extends TimelineBase {
    constraint;
    kind = 'constraint.reset';
    type = 'constraint';
    property = 'reset';
    times;
    constructor(constraint, times) {
        super();
        this.constraint = constraint;
        this.times = times;
    }
}
export class ParameterTimelineData extends TimelineBase {
    parameter;
    keys;
    kind = 'parameter';
    type = 'parameter';
    property = 'value';
    constructor(parameter, keys) {
        super();
        this.parameter = parameter;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class MorphTimelineData extends TimelineBase {
    morph;
    keys;
    kind = 'morph';
    type = 'morph';
    property = 'weight';
    constructor(morph, keys) {
        super();
        this.morph = morph;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class VariableNumberTimelineData extends TimelineBase {
    variable;
    keys;
    kind = 'variable.number';
    type = 'variable';
    property = 'value';
    constructor(variable, keys) {
        super();
        this.variable = variable;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class VariableSteppedTimelineData extends TimelineBase {
    variable;
    keys;
    kind = 'variable.stepped';
    type = 'variable';
    property = 'value';
    constructor(variable, keys) {
        super();
        this.variable = variable;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class TagTimelineData extends TimelineBase {
    keys;
    kind = 'tag';
    type = 'tag';
    constructor(keys) {
        super();
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class NestedAnimationTimelineData extends TimelineBase {
    slot;
    keys;
    kind = 'nested.animation';
    type = 'nested';
    property = 'animation';
    constructor(slot, keys) {
        super();
        this.slot = slot;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class NestedNumberTimelineData extends TimelineBase {
    slot;
    property;
    keys;
    kind = 'nested.number';
    type = 'nested';
    constructor(slot, property, keys) {
        super();
        this.slot = slot;
        this.property = property;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
/**
 * `slot` / `bone` (spec 9.5, F8): the drawing changes bone in the middle of the
 * animation. Stepped only. Nothing is converted: the key carries the position
 * of the attachment on the new bone.
 */
export class SlotBoneTimelineData extends TimelineBase {
    slot;
    keys;
    kind = 'slot.bone';
    type = 'slot';
    property = 'bone';
    constructor(slot, keys) {
        super();
        this.slot = slot;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
/**
 * `weights` (spec 9.6, F9): the weights of a `binding` animated in time, one
 * curve for the whole array, never renormalized. Only the weights move; the
 * structure (counts, bones, positions) stays the file's.
 */
export class WeightsTimelineData extends TimelineBase {
    slot;
    skin;
    attachment;
    kind = 'weights';
    type = 'weights';
    times;
    /** Per key: `sum(counts)` weights, in `binding.weights` order. */
    weights;
    /** One curve (1 component) per key. */
    curves;
    constructor(slot, skin, attachment, times, weights, curves) {
        super();
        this.slot = slot;
        this.skin = skin;
        this.attachment = attachment;
        this.times = times;
        this.weights = weights;
        this.curves = curves;
    }
}
/**
 * `body` (spec 9.13): the animation changes body from the key on — a dry cut.
 * Stepped only. Unlike every other timeline, BEFORE the first key the body is
 * the file's, not the first key's. The `Actor` reads it; `applyAnimation` never
 * writes anything for it.
 */
export class BodyTimelineData extends TimelineBase {
    keys;
    kind = 'body';
    type = 'body';
    constructor(keys) {
        super();
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
/**
 * `BONE_particle` / `emitting` (extension `BONE_particles`, 4.1 and 9.1): the
 * emitter's tap, a boolean with `stepped` keys.
 *
 * It is a PREFIXED timeline type, which spec 2.7 lets an extension add, and a
 * reader without the extension ignores it (spec 2.5, `timeline.type`).
 *
 * Like `body`, `applyAnimation` writes nothing for it, and for a sharper
 * reason: a particle is a pure function of time, so the emitter has to read
 * this tap at instants that are NOT the frame being drawn — the birth of a
 * particle from a previous lap, or a negative time during prewarm. A timeline
 * that "applied" the current value to the slot could not answer that. The
 * emitter walks the keys itself, in `particles/emission.ts`.
 */
export class ParticleEmittingTimelineData extends TimelineBase {
    slot;
    skin;
    attachmentName;
    keys;
    kind = 'particle.emitting';
    type = 'BONE_particle';
    property = 'emitting';
    constructor(slot, skin, attachmentName, keys) {
        super();
        this.slot = slot;
        this.skin = skin;
        this.attachmentName = attachmentName;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
/**
 * The animated `rate` of one emitter (extension `BONE_particles` 4.2, the
 * `linear` branch, 2nd phase). Like `particle.emitting` it is never applied to
 * the skeleton: the emitter integrates it, and inverts the integral, at birth
 * instants that are not the frame being drawn.
 *
 * The loader already did the two swaps of 4.2: a negative key value became `0`
 * (L1 `RANGE_PARTICLE_RATE`) and a Bézier key became `linear` (L2
 * `RANGE_PARTICLE_RATE_CURVE`), so every curve here is `linear` or `stepped`.
 */
export class ParticleRateTimelineData extends TimelineBase {
    slot;
    skin;
    attachmentName;
    keys;
    kind = 'particle.rate';
    type = 'BONE_particle';
    property = 'rate';
    constructor(slot, skin, attachmentName, keys) {
        super();
        this.slot = slot;
        this.skin = skin;
        this.attachmentName = attachmentName;
        this.keys = keys;
    }
    get times() { return this.keys.times; }
}
export class AnimationData {
    index;
    name;
    duration;
    loop;
    blend;
    defaultMix;
    tags;
    timelines;
    /** Image export crop (spec 4.6). Read and kept; no pose reader uses it. */
    crop;
    /**
     * The animation as written in the file (the JSON object), kept so the
     * `Actor` can bind it BY NAME to another body of the project (spec 9.13).
     * `null` for an animation built in code.
     */
    source;
    /** The `body` timeline, or `null` when the animation never changes body. */
    body;
    constructor(index, name, timelines, values = {}) {
        this.index = index;
        this.name = name;
        this.timelines = timelines;
        let duration = values.duration;
        if (duration === undefined) {
            duration = 0;
            for (const tl of timelines)
                duration = Math.max(duration, tl.lastTime);
        }
        this.duration = duration;
        this.loop = values.loop ?? false;
        this.blend = values.blend ?? 'replace';
        this.defaultMix = values.defaultMix ?? null;
        this.tags = values.tags ?? [];
        this.crop = values.crop ?? null;
        this.source = values.source ?? null;
        let body = null;
        for (const tl of timelines)
            if (tl.kind === 'body')
                body = tl;
        this.body = body;
    }
}
export class SkeletonData {
    header;
    meta;
    assets;
    /** The `rig` block, or `null` (spec 4.8). */
    rig;
    extensionsUsed;
    extensionsRequired;
    bones;
    slots;
    skins;
    /** The `"default"` skin. Created empty by the loader when the file has none. */
    defaultSkin;
    constraints;
    events;
    parameters;
    morphs;
    variables;
    tags;
    animations;
    /** Non-fatal problems found while loading. */
    warnings;
    /** Image / region names that no atlas provided (spec 2.8). */
    missingImages;
    /**
     * `true` when a required extension is not supported and the caller asked
     * for a degraded load anyway (spec 2.7, `LoadOptions.allowMissingRequiredExtensions`).
     * A degraded skeleton must not be reported as loaded correctly.
     */
    degraded;
    boneMap = new Map();
    slotMap = new Map();
    skinMap = new Map();
    constraintMap = new Map();
    eventMap = new Map();
    parameterMap = new Map();
    morphMap = new Map();
    variableMap = new Map();
    animationMap = new Map();
    constructor(values) {
        this.header = values.header;
        this.meta = values.meta;
        this.assets = values.assets;
        this.rig = values.rig ?? null;
        this.extensionsUsed = values.extensionsUsed;
        this.extensionsRequired = values.extensionsRequired;
        this.bones = values.bones;
        this.slots = values.slots;
        this.skins = values.skins;
        this.defaultSkin = values.defaultSkin;
        this.constraints = values.constraints;
        this.events = values.events;
        this.parameters = values.parameters;
        this.morphs = values.morphs;
        this.variables = values.variables;
        this.tags = values.tags;
        this.animations = values.animations;
        this.warnings = values.warnings;
        this.missingImages = values.missingImages;
        this.degraded = values.degraded ?? false;
        // Duplicate names: the FIRST object wins, the same choice the loader makes
        // when it resolves references (DUVIDAS-SPEC 5), so `findBone('x')` is the
        // object that slots, constraints and timelines point to.
        for (const b of this.bones)
            if (!this.boneMap.has(b.name))
                this.boneMap.set(b.name, b);
        for (const s of this.slots)
            if (!this.slotMap.has(s.name))
                this.slotMap.set(s.name, s);
        for (const s of this.skins)
            if (!this.skinMap.has(s.name))
                this.skinMap.set(s.name, s);
        for (const c of this.constraints)
            if (!this.constraintMap.has(c.name))
                this.constraintMap.set(c.name, c);
        for (const e of this.events)
            if (!this.eventMap.has(e.name))
                this.eventMap.set(e.name, e);
        for (const p of this.parameters)
            if (!this.parameterMap.has(p.name))
                this.parameterMap.set(p.name, p);
        for (const m of this.morphs)
            if (!this.morphMap.has(m.name))
                this.morphMap.set(m.name, m);
        for (const v of this.variables)
            if (!this.variableMap.has(v.name))
                this.variableMap.set(v.name, v);
        for (const a of this.animations)
            if (!this.animationMap.has(a.name))
                this.animationMap.set(a.name, a);
    }
    findBone(name) { return this.boneMap.get(name) ?? null; }
    findSlot(name) { return this.slotMap.get(name) ?? null; }
    findSkin(name) { return this.skinMap.get(name) ?? null; }
    findConstraint(name) { return this.constraintMap.get(name) ?? null; }
    findEvent(name) { return this.eventMap.get(name) ?? null; }
    findParameter(name) { return this.parameterMap.get(name) ?? null; }
    findMorph(name) { return this.morphMap.get(name) ?? null; }
    findVariable(name) { return this.variableMap.get(name) ?? null; }
    findAnimation(name) { return this.animationMap.get(name) ?? null; }
    /**
     * Puts another set of animations in place of the current ones, keeping every
     * other piece of the skeleton exactly as it is.
     *
     * This is for an EDITOR, which changes timelines while the artist drags the
     * mouse: reading the whole file again to see one new key would also rebuild
     * the bones, the skins and every attachment, and throw away the `Skeleton`
     * that is on screen. A player never needs it. See `loadAnimationsFor`.
     */
    replaceAnimations(animations) {
        // `animations` is readonly for everyone outside; this is the one door.
        this.animations = animations;
        this.animationMap.clear();
        for (const a of animations)
            if (!this.animationMap.has(a.name))
                this.animationMap.set(a.name, a);
    }
    /** The root bone (`bones[0]`, spec 2.2). */
    get root() {
        return this.bones[0];
    }
}
// ---------------------------------------------------------------------------
// Atlas (spec 10)
// ---------------------------------------------------------------------------
export class AtlasPageData {
    index;
    name;
    image;
    width;
    height;
    format;
    minFilter;
    magFilter;
    wrapU;
    wrapV;
    premultiplied;
    constructor(index, name, image, width, height, values = {}) {
        this.index = index;
        this.name = name;
        this.image = image;
        this.width = width;
        this.height = height;
        this.format = values.format ?? 'rgba8';
        this.minFilter = values.minFilter ?? 'linear';
        this.magFilter = values.magFilter ?? 'linear';
        this.wrapU = values.wrapU ?? 'clamp';
        this.wrapV = values.wrapV ?? 'clamp';
        this.premultiplied = values.premultiplied ?? false;
    }
}
export class AtlasRegionData {
    index;
    name;
    aliases;
    page;
    /** Atlas `scale`: page px per skeleton px (spec 10.2). */
    scale;
    x;
    y;
    width;
    height;
    /** `0` or `90` (clockwise, spec 10.3). */
    rotation;
    offsetX;
    offsetY;
    originalWidth;
    originalHeight;
    /**
     * Pivot in px of the ORIGINAL image, from the left and from the bottom, like
     * `offsetX/offsetY` (spec 10.3). `undefined` = the centre. Informative: the
     * pose never reads it; an editor uses it to put a new image in place.
     */
    pivotX;
    pivotY;
    constructor(index, name, page, scale, values) {
        this.index = index;
        this.name = name;
        this.aliases = values.aliases ?? [];
        this.page = page;
        this.scale = scale;
        this.x = values.x;
        this.y = values.y;
        this.width = values.width;
        this.height = values.height;
        this.rotation = values.rotation ?? 0;
        this.offsetX = values.offsetX ?? 0;
        this.offsetY = values.offsetY ?? 0;
        this.originalWidth = values.originalWidth ?? values.width;
        this.originalHeight = values.originalHeight ?? values.height;
        this.pivotX = values.pivotX;
        this.pivotY = values.pivotY;
    }
    /**
     * Maps `(u0, v0)` in the original image to page UVs (spec 10.4, normative).
     * Writes `U, V` into `out[offset]`, `out[offset + 1]`.
     */
    computeUV(u0, v0, out = new Float64Array(2), offset = 0) {
        const px = u0 * this.originalWidth - this.offsetX;
        const py = v0 * this.originalHeight - (this.originalHeight - this.offsetY - this.height);
        const pw = this.page.width;
        const ph = this.page.height;
        if (this.rotation === 90) {
            out[offset] = (this.x + this.height - py) / pw;
            out[offset + 1] = (this.y + px) / ph;
        }
        else {
            out[offset] = (this.x + px) / pw;
            out[offset + 1] = (this.y + py) / ph;
        }
        return out;
    }
}
export class AtlasData {
    scale;
    pages;
    regions;
    warnings;
    regionMap = new Map();
    constructor(scale, pages, regions, warnings = []) {
        this.scale = scale;
        this.pages = pages;
        this.regions = regions;
        this.warnings = warnings;
        // Names first, then aliases; the first occurrence wins (spec 10.5).
        for (const r of regions)
            if (!this.regionMap.has(r.name))
                this.regionMap.set(r.name, r);
        for (const r of regions)
            for (const a of r.aliases)
                if (!this.regionMap.has(a))
                    this.regionMap.set(a, r);
    }
    /** Finds a region by name or alias (spec 10.5). */
    findRegion(name) {
        return this.regionMap.get(name) ?? null;
    }
}
/** Looks a region up across several atlases, in order (spec 2.8, 10.5). */
export function findAtlasRegion(atlases, name) {
    for (const atlas of atlases) {
        const r = atlas.findRegion(name);
        if (r !== null)
            return r;
    }
    return null;
}
