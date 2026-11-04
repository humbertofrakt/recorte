// SPDX-License-Identifier: Apache-2.0
/**
 * Parameter values (spec 8.1).
 *
 * A parameter is a named number with a range. It does nothing by itself: a
 * `driver` (spec 8.2, `constraints/driver.ts`) reads it and writes into
 * properties.
 *
 * Where the current value comes from, in the precedence order of 8.1:
 *
 * | Case | Value |
 * |:---|:---|
 * | `source` present | `min + (bone.applied[property] - from) / (to - from) * (max - min)`, read when the driver runs |
 * | `parameter` timeline | the timeline value (written by `applyAnimation`) |
 * | game API | `Skeleton.setParameter` |
 * | nothing | `default` (setup pose) |
 *
 * The last three all live in `Skeleton.parameters[index]`, so between them the
 * precedence is the call order of the frame (`setToSetupPose` -> game API ->
 * `applyAnimation`, as `animation.ts` documents). `source` is the one case
 * that is resolved late: `parameterValue` recomputes it from the bone every
 * time it is asked, which is what "read when the driver is applied" means.
 *
 * Every value goes through `ParameterData.constrain`: clamp to `[min, max]`,
 * or wrap when `repeat` (spec 8.1; a degenerate range yields `min`, see
 * DUVIDAS-SPEC 8).
 */
/** Field of `Bone` holding the applied value of each numeric property (spec 5.2). */
export const APPLIED_BONE_PROPERTY = {
    x: 'ax',
    y: 'ay',
    rotation: 'arotation',
    scaleX: 'ascaleX',
    scaleY: 'ascaleY',
    shearX: 'ashearX',
    shearY: 'ashearY',
};
/** Field of `Bone` holding the applied value of each inheritance flag (spec 5.3). */
export const APPLIED_BONE_INHERIT = {
    inheritRotation: 'ainheritRotation',
    inheritScale: 'ainheritScale',
    inheritReflection: 'ainheritReflection',
};
/** Applied value of a numeric bone property (spec 5.2). */
export function boneApplied(bone, property) {
    return bone[APPLIED_BONE_PROPERTY[property]];
}
/** Writes the applied value of a numeric bone property. Does not touch the local pose. */
export function setBoneApplied(bone, property, value) {
    bone[APPLIED_BONE_PROPERTY[property]] = value;
}
/**
 * Value a `source` parameter reads from its bone (spec 8.1), already
 * constrained. Returns `null` when the parameter has no `source`.
 *
 * `to == from` is L1 and the loader rejects it; a hand-built parameter with a
 * degenerate range yields `min` instead of dividing by zero.
 */
export function parameterFromSource(skeleton, parameter) {
    const source = parameter.source;
    if (source === null)
        return null;
    const span = source.to - source.from;
    if (span === 0)
        return parameter.constrain(parameter.min);
    const bone = skeleton.bones[source.bone.index];
    const read = boneApplied(bone, source.property);
    return parameter.constrain(parameter.min + ((read - source.from) / span) * (parameter.max - parameter.min));
}
/**
 * Current value of `parameter` (spec 8.1), constrained. With `source` the
 * value is recomputed from the bone's applied pose; otherwise it is the value
 * stored in the skeleton (timeline, game API or `default`).
 */
export function parameterValue(skeleton, parameter) {
    const fromSource = parameterFromSource(skeleton, parameter);
    if (fromSource !== null)
        return fromSource;
    return parameter.constrain(skeleton.parameters[parameter.index]);
}
/**
 * `parameterValue`, also storing the result in `Skeleton.parameters` so the
 * game and later drivers read the same number the driver used. Returns it.
 */
export function refreshParameter(skeleton, parameter) {
    const v = parameterValue(skeleton, parameter);
    skeleton.parameters[parameter.index] = v;
    return v;
}
/** Recomputes every `source` parameter (spec 8.1). Drivers do this on their own. */
export function refreshSourceParameters(skeleton) {
    for (const p of skeleton.data.parameters) {
        if (p.source !== null)
            skeleton.parameters[p.index] = parameterValue(skeleton, p);
    }
}
