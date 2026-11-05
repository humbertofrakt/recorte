// SPDX-License-Identifier: Apache-2.0
/**
 * Immutable data classes: the resolved form of a `.bone` file and of an atlas.
 *
 * Names are resolved to object references by the loader; the runtime never
 * looks names up per frame. Instances (`Skeleton`, `Bone`, `Slot`) live in
 * `skeleton.ts` and point back to these.
 */

import type {
  BoneHeader, Color4, BlendMode, BoneNumericProperty, BoneInheritProperty, DriverMode,
  PathPositionMode, PathSpacingMode, PathRotateMode, VariableType, VariableValue,
  AnimationBlend, SequenceMode, AtlasFormat, AtlasMinFilter, AtlasMagFilter, AtlasWrap,
} from './types.js';
import type { CurveData } from './curve.js';
import type { Attachment } from './attachments/attachment.js';
import type { VertexAttachment } from './attachments/vertex-attachment.js';
import type { RegionAttachment } from './attachments/region.js';
import type { MeshAttachment } from './attachments/mesh.js';
import type { LinkedMeshAttachment } from './attachments/linkedmesh.js';
import type { Matrix2x3 } from './math.js';

export type { Attachment } from './attachments/attachment.js';
export { VertexAttachment, BindingData, type MorphInfluence } from './attachments/vertex-attachment.js';
export { RegionAttachment } from './attachments/region.js';
export { MeshAttachment } from './attachments/mesh.js';
export { LinkedMeshAttachment } from './attachments/linkedmesh.js';
export { BoundingBoxAttachment } from './attachments/boundingbox.js';
export { ClippingAttachment } from './attachments/clipping.js';
export { PathAttachment } from './attachments/path.js';
export { PointAttachment } from './attachments/point.js';
export { SkeletonAttachment } from './attachments/skeleton-attachment.js';
export { SequenceData } from './attachments/sequence.js';

/** A non-fatal problem found while loading (spec 4.7, 2.5). */
export interface LoadWarning {
  /** JSON Pointer (RFC 6901) of the offending value. */
  readonly pointer: string;
  readonly message: string;
}

// ---------------------------------------------------------------------------
// Bones and slots
// ---------------------------------------------------------------------------

/**
 * Inheritance mode derived from the three `inherit*` booleans (spec 5.3). The
 * last three are the F3 modes: built on the Spine formulas, not on Spine.
 */
export type InheritMode =
  | 'normal' | 'onlyTranslation' | 'noRotationOrReflection' | 'noScale' | 'noScaleOrReflection'
  | 'noRotation' | 'noReflection' | 'onlyReflection';

/** Maps the three booleans to a mode (spec 5.3). Since F3 every combination has a formula. */
export function inheritMode(inheritRotation: boolean, inheritScale: boolean, inheritReflection: boolean): InheritMode {
  if (inheritRotation) {
    if (inheritScale) return inheritReflection ? 'normal' : 'noReflection';
    return inheritReflection ? 'noScale' : 'noScaleOrReflection';
  }
  if (inheritScale) return inheritReflection ? 'noRotation' : 'noRotationOrReflection';
  return inheritReflection ? 'onlyReflection' : 'onlyTranslation';
}

export class BoneData {
  readonly index: number;
  readonly name: string;
  readonly parent: BoneData | null;
  readonly length: number;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly scaleY: number;
  readonly shearX: number;
  readonly shearY: number;
  readonly inheritRotation: boolean;
  readonly inheritScale: boolean;
  readonly inheritReflection: boolean;
  readonly skinRequired: boolean;
  readonly color: Color4;
  readonly icon: string | null;
  readonly visible: boolean;
  readonly folder: string | null;

  constructor(index: number, name: string, parent: BoneData | null, values: {
    length?: number; x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number;
    shearX?: number; shearY?: number; inheritRotation?: boolean; inheritScale?: boolean;
    inheritReflection?: boolean; skinRequired?: boolean; color?: Color4; icon?: string | null;
    visible?: boolean; folder?: string | null;
  } = {}) {
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
  get inherit(): InheritMode {
    return inheritMode(this.inheritRotation, this.inheritScale, this.inheritReflection);
  }
}

export class SlotData {
  readonly index: number;
  readonly name: string;
  readonly bone: BoneData;
  /** Setup placeholder name. `null` = empty slot. */
  readonly attachmentName: string | null;
  readonly color: Color4;
  readonly darkColor: [number, number, number] | null;
  readonly blend: BlendMode;
  readonly visible: boolean;
  readonly folder: string | null;

  constructor(index: number, name: string, bone: BoneData, values: {
    attachmentName?: string | null; color?: Color4; darkColor?: [number, number, number] | null;
    blend?: BlendMode; visible?: boolean; folder?: string | null;
  } = {}) {
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

// ---------------------------------------------------------------------------
// Skins
// ---------------------------------------------------------------------------

/** One `{slot, offset}` of a draw-order list (spec 4.4 `skin.drawOrder`, 9.5 timeline). */
export interface DrawOrderOffset {
  readonly slot: SlotData;
  readonly offset: number;
}

export class SkinData {
  readonly index: number;
  readonly name: string;
  readonly displayName: string | null;
  /** Skins this one incorporates, in order (filled by the loader after all skins exist). */
  readonly includes: SkinData[] = [];
  readonly bones: BoneData[] = [];
  readonly constraints: ConstraintData[] = [];
  /** Draw-order offsets applied while this skin is active (spec 4.4). */
  readonly drawOrder: DrawOrderOffset[] = [];
  /** slot index -> placeholder -> attachment (`null` hides the placeholder). */
  readonly attachments: Map<number, Map<string, Attachment | null>> = new Map();

  constructor(index: number, name: string, displayName: string | null = null) {
    this.index = index;
    this.name = name;
    this.displayName = displayName;
  }

  /**
   * Attachment defined by this skin alone for `(slot, placeholder)`.
   * `undefined` = not defined here; `null` = defined as hidden.
   */
  getAttachment(slotIndex: number, name: string): Attachment | null | undefined {
    return this.attachments.get(slotIndex)?.get(name);
  }

  /** Adds an attachment definition. Used by the loader and by editors. */
  setAttachment(slotIndex: number, name: string, attachment: Attachment | null): void {
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
  expand(out: SkinData[] = [], visiting: Set<SkinData> = new Set()): SkinData[] {
    if (visiting.has(this)) return out;
    visiting.add(this);
    for (const inc of this.includes) inc.expand(out, visiting);
    out.push(this);
    visiting.delete(this);
    return out;
  }
}

// ---------------------------------------------------------------------------
// Constraints (spec 6, 8.2)
// ---------------------------------------------------------------------------

export abstract class ConstraintData {
  abstract readonly type: string;
  readonly index: number;
  readonly name: string;
  readonly mix: number;
  readonly skinRequired: boolean;

  protected constructor(index: number, name: string, mix: number, skinRequired: boolean) {
    this.index = index;
    this.name = name;
    this.mix = mix;
    this.skinRequired = skinRequired;
  }
}

export class IkConstraintData extends ConstraintData {
  readonly type = 'ik' as const;
  readonly bones: readonly BoneData[];
  readonly target: BoneData;
  readonly bendPositive: boolean;
  readonly compress: boolean;
  readonly stretch: boolean;
  readonly uniform: boolean;
  readonly softness: number;

  constructor(index: number, name: string, bones: readonly BoneData[], target: BoneData, values: {
    mix?: number; skinRequired?: boolean; bendPositive?: boolean; compress?: boolean;
    stretch?: boolean; uniform?: boolean; softness?: number;
  } = {}) {
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
  readonly type = 'transform' as const;
  readonly bones: readonly BoneData[];
  readonly target: BoneData;
  readonly local: boolean;
  readonly relative: boolean;
  readonly offsetRotation: number;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly offsetScaleX: number;
  readonly offsetScaleY: number;
  readonly offsetShearY: number;
  readonly mixRotation: number;
  readonly mixX: number;
  readonly mixY: number;
  readonly mixScaleX: number;
  readonly mixScaleY: number;
  readonly mixShearY: number;

  constructor(index: number, name: string, bones: readonly BoneData[], target: BoneData, values: {
    mix?: number; skinRequired?: boolean; local?: boolean; relative?: boolean;
    offsetRotation?: number; offsetX?: number; offsetY?: number; offsetScaleX?: number;
    offsetScaleY?: number; offsetShearY?: number; mixRotation?: number; mixX?: number;
    mixY?: number; mixScaleX?: number; mixScaleY?: number; mixShearY?: number;
  } = {}) {
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
  readonly type = 'path' as const;
  readonly bones: readonly BoneData[];
  /** Slot whose current attachment must be a `path`. */
  readonly target: SlotData;
  readonly positionMode: PathPositionMode;
  readonly spacingMode: PathSpacingMode;
  readonly rotateMode: PathRotateMode;
  readonly offsetRotation: number;
  readonly position: number;
  readonly spacing: number;
  readonly mixRotation: number;
  readonly mixX: number;
  readonly mixY: number;

  constructor(index: number, name: string, bones: readonly BoneData[], target: SlotData, values: {
    mix?: number; skinRequired?: boolean; positionMode?: PathPositionMode; spacingMode?: PathSpacingMode;
    rotateMode?: PathRotateMode; offsetRotation?: number; position?: number; spacing?: number;
    mixRotation?: number; mixX?: number; mixY?: number;
  } = {}) {
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
  readonly type = 'physics' as const;
  readonly bone: BoneData;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scaleX: number;
  readonly shearX: number;
  readonly inertia: number;
  readonly strength: number;
  readonly damping: number;
  readonly mass: number;
  readonly wind: number;
  readonly gravity: number;
  readonly limit: number;
  readonly fps: number;

  constructor(index: number, name: string, bone: BoneData, values: {
    mix?: number; skinRequired?: boolean; x?: number; y?: number; rotation?: number; scaleX?: number;
    shearX?: number; inertia?: number; strength?: number; damping?: number; mass?: number;
    wind?: number; gravity?: number; limit?: number; fps?: number;
  } = {}) {
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
  readonly timeline: TimelineData;
  readonly mode: DriverMode;

  constructor(timeline: TimelineData, mode: DriverMode) {
    this.timeline = timeline;
    this.mode = mode;
  }
}

export class DriverConstraintData extends ConstraintData {
  readonly type = 'driver' as const;
  readonly parameter: ParameterData;
  /** Targets mode (`null` in continuous mode). */
  readonly targets: readonly DriverTargetData[] | null;
  /** Continuous mode animation. Bound by the loader after animations are read. */
  animation: AnimationData | null;
  /** Continuous mode: name written in the file, kept for late binding. */
  readonly animationName: string | null;
  readonly from: number;
  readonly to: number;
  readonly timeFrom: number;
  /** `NaN` until bound to the animation (default: animation duration). */
  timeTo: number;
  readonly mode: DriverMode;

  constructor(index: number, name: string, parameter: ParameterData, values: {
    mix?: number; skinRequired?: boolean; targets?: readonly DriverTargetData[] | null;
    animationName?: string | null; from?: number; to?: number; timeFrom?: number; timeTo?: number; mode?: DriverMode;
  } = {}) {
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

export type AnyConstraintData =
  | IkConstraintData
  | TransformConstraintData
  | PathConstraintData
  | PhysicsConstraintData
  | DriverConstraintData;

// ---------------------------------------------------------------------------
// Events, parameters, morphs, variables
// ---------------------------------------------------------------------------

export class EventData {
  readonly index: number;
  readonly name: string;
  readonly int: number;
  readonly float: number;
  readonly string: string;
  readonly audio: string | null;
  readonly volume: number;
  readonly balance: number;

  constructor(index: number, name: string, values: {
    int?: number; float?: number; string?: string; audio?: string | null; volume?: number; balance?: number;
  } = {}) {
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
  readonly bone: BoneData;
  readonly property: BoneNumericProperty;
  readonly from: number;
  readonly to: number;

  constructor(bone: BoneData, property: BoneNumericProperty, from = 0, to = 1) {
    this.bone = bone;
    this.property = property;
    this.from = from;
    this.to = to;
  }
}

export class ParameterData {
  readonly index: number;
  readonly name: string;
  readonly min: number;
  readonly max: number;
  readonly default: number;
  readonly repeat: boolean;
  readonly group: string | null;
  readonly displayName: string | null;
  readonly source: ParameterSourceData | null;

  constructor(index: number, name: string, values: {
    min?: number; max?: number; default?: number; repeat?: boolean; group?: string | null;
    displayName?: string | null; source?: ParameterSourceData | null;
  } = {}) {
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
  constrain(value: number): number {
    if (this.max <= this.min) return this.min;
    if (this.repeat) {
      const r = this.max - this.min;
      return this.min + (((value - this.min) % r) + r) % r;
    }
    return value < this.min ? this.min : value > this.max ? this.max : value;
  }
}

export class MorphTargetData {
  readonly slot: SlotData;
  readonly skin: SkinData;
  readonly attachment: VertexAttachment;
  readonly offsets: Float64Array;

  constructor(slot: SlotData, skin: SkinData, attachment: VertexAttachment, offsets: ArrayLike<number>) {
    this.slot = slot;
    this.skin = skin;
    this.attachment = attachment;
    this.offsets = Float64Array.from(offsets);
  }
}

export class MorphData {
  readonly index: number;
  readonly name: string;
  readonly weight: number;
  readonly min: number;
  readonly max: number;
  readonly group: string | null;
  /** Filled by the loader after the attachments exist. */
  readonly targets: MorphTargetData[] = [];

  constructor(index: number, name: string, values: {
    weight?: number; min?: number; max?: number; group?: string | null;
  } = {}) {
    this.index = index;
    this.name = name;
    this.weight = values.weight ?? 0;
    this.min = values.min ?? 0;
    this.max = values.max ?? 1;
    this.group = values.group ?? null;
  }
}

export class VariableData {
  readonly index: number;
  readonly name: string;
  readonly type: VariableType;
  readonly default: VariableValue;

  constructor(index: number, name: string, type: VariableType, defaultValue?: VariableValue) {
    this.index = index;
    this.name = name;
    this.type = type;
    this.default = defaultValue ?? VariableData.defaultFor(type);
  }

  static defaultFor(type: VariableType): VariableValue {
    switch (type) {
      case 'string': return '';
      case 'bool': return false;
      default: return 0;
    }
  }

  get isNumeric(): boolean {
    return this.type === 'float' || this.type === 'int';
  }
}

// ---------------------------------------------------------------------------
// Animations and timelines (spec 9)
// ---------------------------------------------------------------------------

/** Numeric keys with `components` values per key and one curve per key. */
export interface NumericKeys {
  /** Key times in seconds (driver targets: parameter inputs). Strictly increasing. */
  readonly times: Float64Array;
  /** `components x times.length` values, key-major. */
  readonly values: Float64Array;
  readonly components: number;
  /** Curve from key `i` to key `i + 1`. The last entry is unused. */
  readonly curves: readonly CurveData[];
}

/** Non-interpolable keys: always stepped. */
export interface SteppedKeys<T> {
  readonly times: Float64Array;
  readonly values: readonly T[];
}

export type TimelineKind =
  | 'bone.number' | 'bone.inherit' | 'bone.parent'
  | 'slot.attachment' | 'slot.color' | 'slot.darkColor' | 'slot.visible'
  | 'drawOrder' | 'deform' | 'sequence' | 'event'
  | 'constraint.number' | 'constraint.boolean' | 'constraint.reset'
  | 'parameter' | 'morph' | 'variable.number' | 'variable.stepped'
  | 'tag' | 'nested.animation' | 'nested.number'
  | 'slot.bone' | 'weights' | 'body'
  // Extension `BONE_particles` (4.1): the emitter's tap. Read by the emitter,
  // never applied to the skeleton — see `ParticleEmittingTimelineData`.
  | 'particle.emitting'
  // Extension `BONE_particles` (4.2, 2nd phase): the animated `rate`, read
  // the same way, by the emitter — see `ParticleRateTimelineData`.
  | 'particle.rate';

export abstract class TimelineBase {
  abstract readonly kind: TimelineKind;
  /** `type` as written in the file. */
  abstract readonly type: string;
  abstract readonly times: Float64Array;

  get keyCount(): number {
    return this.times.length;
  }

  /** Time of the last key (0 when empty). */
  get lastTime(): number {
    const t = this.times;
    return t.length === 0 ? 0 : t[t.length - 1];
  }
}

export class BoneNumberTimelineData extends TimelineBase {
  readonly kind = 'bone.number' as const;
  readonly type = 'bone' as const;
  constructor(readonly bone: BoneData, readonly property: BoneNumericProperty, readonly keys: NumericKeys) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class BoneInheritTimelineData extends TimelineBase {
  readonly kind = 'bone.inherit' as const;
  readonly type = 'bone' as const;
  constructor(readonly bone: BoneData, readonly property: BoneInheritProperty, readonly keys: SteppedKeys<boolean>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

/**
 * `bone` / `parent` (spec 9.4): the bone hangs from another bone from the key
 * on, stepped only; `null` = the parent of the file. Local values are not
 * converted — from the key on they are measured from the new parent.
 */
export class BoneParentTimelineData extends TimelineBase {
  readonly kind = 'bone.parent' as const;
  readonly type = 'bone' as const;
  readonly property = 'parent' as const;
  constructor(readonly bone: BoneData, readonly keys: SteppedKeys<BoneData | null>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class SlotAttachmentTimelineData extends TimelineBase {
  readonly kind = 'slot.attachment' as const;
  readonly type = 'slot' as const;
  readonly property = 'attachment' as const;
  constructor(readonly slot: SlotData, readonly keys: SteppedKeys<string | null>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class SlotColorTimelineData extends TimelineBase {
  readonly kind = 'slot.color' as const;
  readonly type = 'slot' as const;
  readonly property = 'color' as const;
  /** 4 components per key. */
  constructor(readonly slot: SlotData, readonly keys: NumericKeys) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class SlotDarkColorTimelineData extends TimelineBase {
  readonly kind = 'slot.darkColor' as const;
  readonly type = 'slot' as const;
  readonly property = 'darkColor' as const;
  readonly times: Float64Array;
  /** `[r, g, b]` per key or `null` (tint black off). */
  readonly values: readonly (Float64Array | null)[];
  /** Stepped whenever either end of the segment is `null` (spec 9.5). */
  readonly curves: readonly CurveData[];
  constructor(readonly slot: SlotData, times: Float64Array, values: readonly (Float64Array | null)[], curves: readonly CurveData[]) {
    super();
    this.times = times;
    this.values = values;
    this.curves = curves;
  }
}

export class SlotVisibleTimelineData extends TimelineBase {
  readonly kind = 'slot.visible' as const;
  readonly type = 'slot' as const;
  readonly property = 'visible' as const;
  constructor(readonly slot: SlotData, readonly keys: SteppedKeys<boolean>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class DrawOrderTimelineData extends TimelineBase {
  readonly kind = 'drawOrder' as const;
  readonly type = 'drawOrder' as const;
  readonly times: Float64Array;
  /** Per key: slot indices in draw order over the `slots` ARRAY order (spec 9.5 algorithm applied), or `null` = base order. Kept for tools; the runtime applies `entries` over the base order of spec 4.4. */
  readonly orders: readonly (Int32Array | null)[];
  /** Per key: the `{slot, offset}` list as written (`null` = `[]`, back to the base order). */
  readonly entries: readonly (readonly DrawOrderOffset[] | null)[];
  constructor(times: Float64Array, orders: readonly (Int32Array | null)[], entries: readonly (readonly DrawOrderOffset[] | null)[]) {
    super();
    this.times = times;
    this.orders = orders;
    this.entries = entries;
  }
}

export class DeformTimelineData extends TimelineBase {
  readonly kind = 'deform' as const;
  readonly type = 'deform' as const;
  readonly times: Float64Array;
  /**
   * Per key: the deform expanded to `attachment.deformLength` (spec 9.6),
   * or an empty array for `value: []` (no deform).
   */
  readonly vertices: readonly Float64Array[];
  /** One curve (1 component) per key. */
  readonly curves: readonly CurveData[];
  constructor(
    readonly slot: SlotData, readonly skin: SkinData, readonly attachment: VertexAttachment,
    times: Float64Array, vertices: readonly Float64Array[], curves: readonly CurveData[],
  ) {
    super();
    this.times = times;
    this.vertices = vertices;
    this.curves = curves;
  }
}

export interface SequenceKey {
  readonly mode: SequenceMode;
  readonly index: number;
  readonly delay: number;
}

export type SequenceCapableAttachment = RegionAttachment | MeshAttachment | LinkedMeshAttachment;

export class SequenceTimelineData extends TimelineBase {
  readonly kind = 'sequence' as const;
  readonly type = 'sequence' as const;
  constructor(
    readonly slot: SlotData, readonly skin: SkinData, readonly attachment: SequenceCapableAttachment,
    readonly keys: SteppedKeys<SequenceKey>,
  ) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export interface EventKey {
  readonly time: number;
  readonly event: EventData;
  readonly int: number;
  readonly float: number;
  readonly string: string;
  readonly volume: number;
  readonly balance: number;
}

export class EventTimelineData extends TimelineBase {
  readonly kind = 'event' as const;
  readonly type = 'event' as const;
  readonly times: Float64Array;
  /** Non-decreasing times; several keys may share a time (spec 9.7). */
  readonly events: readonly EventKey[];
  constructor(times: Float64Array, events: readonly EventKey[]) {
    super();
    this.times = times;
    this.events = events;
  }
}

export class ConstraintNumberTimelineData extends TimelineBase {
  readonly kind = 'constraint.number' as const;
  readonly type = 'constraint' as const;
  constructor(readonly constraint: ConstraintData, readonly property: string, readonly keys: NumericKeys) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class ConstraintBooleanTimelineData extends TimelineBase {
  readonly kind = 'constraint.boolean' as const;
  readonly type = 'constraint' as const;
  constructor(readonly constraint: ConstraintData, readonly property: string, readonly keys: SteppedKeys<boolean>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class ConstraintResetTimelineData extends TimelineBase {
  readonly kind = 'constraint.reset' as const;
  readonly type = 'constraint' as const;
  readonly property = 'reset' as const;
  readonly times: Float64Array;
  constructor(readonly constraint: PhysicsConstraintData, times: Float64Array) {
    super();
    this.times = times;
  }
}

export class ParameterTimelineData extends TimelineBase {
  readonly kind = 'parameter' as const;
  readonly type = 'parameter' as const;
  readonly property = 'value' as const;
  constructor(readonly parameter: ParameterData, readonly keys: NumericKeys) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class MorphTimelineData extends TimelineBase {
  readonly kind = 'morph' as const;
  readonly type = 'morph' as const;
  readonly property = 'weight' as const;
  constructor(readonly morph: MorphData, readonly keys: NumericKeys) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class VariableNumberTimelineData extends TimelineBase {
  readonly kind = 'variable.number' as const;
  readonly type = 'variable' as const;
  readonly property = 'value' as const;
  constructor(readonly variable: VariableData, readonly keys: NumericKeys) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class VariableSteppedTimelineData extends TimelineBase {
  readonly kind = 'variable.stepped' as const;
  readonly type = 'variable' as const;
  readonly property = 'value' as const;
  constructor(readonly variable: VariableData, readonly keys: SteppedKeys<string | boolean>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class TagTimelineData extends TimelineBase {
  readonly kind = 'tag' as const;
  readonly type = 'tag' as const;
  constructor(readonly keys: SteppedKeys<readonly string[]>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class NestedAnimationTimelineData extends TimelineBase {
  readonly kind = 'nested.animation' as const;
  readonly type = 'nested' as const;
  readonly property = 'animation' as const;
  constructor(readonly slot: SlotData, readonly keys: SteppedKeys<string | null>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export class NestedNumberTimelineData extends TimelineBase {
  readonly kind = 'nested.number' as const;
  readonly type = 'nested' as const;
  constructor(readonly slot: SlotData, readonly property: 'time' | 'timeScale', readonly keys: NumericKeys) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

/**
 * The value of a `slot` / `bone` key (spec 9.5): the bone the slot hangs from
 * while the key holds, and where the attachment sits on it. `bone: null` = the
 * bone of the file, and then `transform` is `null` too.
 */
export interface SlotBoneKey {
  readonly bone: BoneData | null;
  /** `T(x, y) R(rotation) S(scaleX, scaleY)` of the key, or `null` = identity. */
  readonly transform: Matrix2x3 | null;
}

/**
 * `slot` / `bone` (spec 9.5, F8): the drawing changes bone in the middle of the
 * animation. Stepped only. Nothing is converted: the key carries the position
 * of the attachment on the new bone.
 */
export class SlotBoneTimelineData extends TimelineBase {
  readonly kind = 'slot.bone' as const;
  readonly type = 'slot' as const;
  readonly property = 'bone' as const;
  constructor(readonly slot: SlotData, readonly keys: SteppedKeys<SlotBoneKey>) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

/**
 * `weights` (spec 9.6, F9): the weights of a `binding` animated in time, one
 * curve for the whole array, never renormalized. Only the weights move; the
 * structure (counts, bones, positions) stays the file's.
 */
export class WeightsTimelineData extends TimelineBase {
  readonly kind = 'weights' as const;
  readonly type = 'weights' as const;
  readonly times: Float64Array;
  /** Per key: `sum(counts)` weights, in `binding.weights` order. */
  readonly weights: readonly Float64Array[];
  /** One curve (1 component) per key. */
  readonly curves: readonly CurveData[];
  constructor(
    readonly slot: SlotData, readonly skin: SkinData, readonly attachment: VertexAttachment,
    times: Float64Array, weights: readonly Float64Array[], curves: readonly CurveData[],
  ) {
    super();
    this.times = times;
    this.weights = weights;
    this.curves = curves;
  }
}

/** One key of a `body` timeline (spec 9.13). */
export interface BodyKey {
  /** The body as written in the key; `null` = the body of this very file. */
  readonly value: string | null;
  /** `value` joined to `assets.skeletonsBase` (spec 2.8); `null` with `value`. */
  readonly uri: string | null;
  /** The skin stack passes to the new body by name (`true`) or not (spec 9.13). */
  readonly keepSkins: boolean;
}

/**
 * `body` (spec 9.13): the animation changes body from the key on — a dry cut.
 * Stepped only. Unlike every other timeline, BEFORE the first key the body is
 * the file's, not the first key's. The `Actor` reads it; `applyAnimation` never
 * writes anything for it.
 */
export class BodyTimelineData extends TimelineBase {
  readonly kind = 'body' as const;
  readonly type = 'body' as const;
  constructor(readonly keys: SteppedKeys<BodyKey>) { super(); }
  get times(): Float64Array { return this.keys.times; }
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
  readonly kind = 'particle.emitting' as const;
  readonly type = 'BONE_particle' as const;
  readonly property = 'emitting' as const;
  constructor(
    readonly slot: SlotData,
    readonly skin: SkinData,
    readonly attachmentName: string,
    readonly keys: SteppedKeys<boolean>,
  ) { super(); }
  get times(): Float64Array { return this.keys.times; }
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
  readonly kind = 'particle.rate' as const;
  readonly type = 'BONE_particle' as const;
  readonly property = 'rate' as const;
  constructor(
    readonly slot: SlotData,
    readonly skin: SkinData,
    readonly attachmentName: string,
    readonly keys: NumericKeys,
  ) { super(); }
  get times(): Float64Array { return this.keys.times; }
}

export type TimelineData =
  | SlotBoneTimelineData
  | WeightsTimelineData
  | BodyTimelineData
  | ParticleEmittingTimelineData
  | ParticleRateTimelineData
  | BoneNumberTimelineData
  | BoneInheritTimelineData
  | BoneParentTimelineData
  | SlotAttachmentTimelineData
  | SlotColorTimelineData
  | SlotDarkColorTimelineData
  | SlotVisibleTimelineData
  | DrawOrderTimelineData
  | DeformTimelineData
  | SequenceTimelineData
  | EventTimelineData
  | ConstraintNumberTimelineData
  | ConstraintBooleanTimelineData
  | ConstraintResetTimelineData
  | ParameterTimelineData
  | MorphTimelineData
  | VariableNumberTimelineData
  | VariableSteppedTimelineData
  | TagTimelineData
  | NestedAnimationTimelineData
  | NestedNumberTimelineData;

export class AnimationData {
  readonly index: number;
  readonly name: string;
  readonly duration: number;
  readonly loop: boolean;
  readonly blend: AnimationBlend;
  readonly defaultMix: number | null;
  readonly tags: readonly string[];
  readonly timelines: readonly TimelineData[];
  /** Image export crop (spec 4.6). Read and kept; no pose reader uses it. */
  readonly crop: AnimationCrop | null;
  /**
   * The animation as written in the file (the JSON object), kept so the
   * `Actor` can bind it BY NAME to another body of the project (spec 9.13).
   * `null` for an animation built in code.
   */
  readonly source: unknown;
  /** The `body` timeline, or `null` when the animation never changes body. */
  readonly body: BodyTimelineData | null;

  constructor(index: number, name: string, timelines: readonly TimelineData[], values: {
    duration?: number; loop?: boolean; blend?: AnimationBlend; defaultMix?: number | null; tags?: readonly string[];
    crop?: AnimationCrop | null; source?: unknown;
  } = {}) {
    this.index = index;
    this.name = name;
    this.timelines = timelines;
    let duration = values.duration;
    if (duration === undefined) {
      duration = 0;
      for (const tl of timelines) duration = Math.max(duration, tl.lastTime);
    }
    this.duration = duration;
    this.loop = values.loop ?? false;
    this.blend = values.blend ?? 'replace';
    this.defaultMix = values.defaultMix ?? null;
    this.tags = values.tags ?? [];
    this.crop = values.crop ?? null;
    this.source = values.source ?? null;
    let body: BodyTimelineData | null = null;
    for (const tl of timelines) if (tl.kind === 'body') body = tl;
    this.body = body;
  }
}

/** `animation.crop` (spec 4.6), in skeleton units, lower-left corner. */
export interface AnimationCrop {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

export interface SkeletonMeta {
  readonly name: string | null;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly fps: number;
  readonly referenceScale: number;
  readonly pixelArt: boolean;
  readonly hash: string | null;
}

export interface AssetsData {
  readonly atlases: readonly string[];
  readonly imagesBase: string;
  readonly audioBase: string;
  readonly skeletonsBase: string;
  /** `assets.animations` as written (spec 2.8). */
  readonly animations: readonly string[];
  /** `assets.skins` as written (spec 2.8). */
  readonly skins: readonly string[];
}

/** The `rig` block (spec 4.8): what this file requires of the skeleton that uses it. */
export interface RigData {
  readonly name: string | null;
  readonly bones: readonly string[];
  readonly slots: readonly string[];
  /** Only an animations file: the host bone whose `length` scales the translations (spec 2.8, F24). */
  readonly reference: { readonly bone: string; readonly length: number } | null;
}

export class SkeletonData {
  readonly header: BoneHeader;
  readonly meta: SkeletonMeta;
  readonly assets: AssetsData;
  /** The `rig` block, or `null` (spec 4.8). */
  readonly rig: RigData | null;
  readonly extensionsUsed: readonly string[];
  readonly extensionsRequired: readonly string[];
  readonly bones: readonly BoneData[];
  readonly slots: readonly SlotData[];
  readonly skins: readonly SkinData[];
  /** The `"default"` skin. Created empty by the loader when the file has none. */
  readonly defaultSkin: SkinData;
  readonly constraints: readonly ConstraintData[];
  readonly events: readonly EventData[];
  readonly parameters: readonly ParameterData[];
  readonly morphs: readonly MorphData[];
  readonly variables: readonly VariableData[];
  readonly tags: readonly string[];
  readonly animations: readonly AnimationData[];
  /** Non-fatal problems found while loading. */
  readonly warnings: readonly LoadWarning[];
  /** Image / region names that no atlas provided (spec 2.8). */
  readonly missingImages: readonly string[];
  /**
   * `true` when a required extension is not supported and the caller asked
   * for a degraded load anyway (spec 2.7, `LoadOptions.allowMissingRequiredExtensions`).
   * A degraded skeleton must not be reported as loaded correctly.
   */
  readonly degraded: boolean;

  private readonly boneMap = new Map<string, BoneData>();
  private readonly slotMap = new Map<string, SlotData>();
  private readonly skinMap = new Map<string, SkinData>();
  private readonly constraintMap = new Map<string, ConstraintData>();
  private readonly eventMap = new Map<string, EventData>();
  private readonly parameterMap = new Map<string, ParameterData>();
  private readonly morphMap = new Map<string, MorphData>();
  private readonly variableMap = new Map<string, VariableData>();
  private readonly animationMap = new Map<string, AnimationData>();

  constructor(values: {
    header: BoneHeader; meta: SkeletonMeta; assets: AssetsData; rig?: RigData | null;
    extensionsUsed: readonly string[]; extensionsRequired: readonly string[];
    bones: readonly BoneData[]; slots: readonly SlotData[]; skins: readonly SkinData[]; defaultSkin: SkinData;
    constraints: readonly ConstraintData[]; events: readonly EventData[]; parameters: readonly ParameterData[];
    morphs: readonly MorphData[]; variables: readonly VariableData[]; tags: readonly string[];
    animations: readonly AnimationData[]; warnings: readonly LoadWarning[]; missingImages: readonly string[];
    degraded?: boolean;
  }) {
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
    for (const b of this.bones) if (!this.boneMap.has(b.name)) this.boneMap.set(b.name, b);
    for (const s of this.slots) if (!this.slotMap.has(s.name)) this.slotMap.set(s.name, s);
    for (const s of this.skins) if (!this.skinMap.has(s.name)) this.skinMap.set(s.name, s);
    for (const c of this.constraints) if (!this.constraintMap.has(c.name)) this.constraintMap.set(c.name, c);
    for (const e of this.events) if (!this.eventMap.has(e.name)) this.eventMap.set(e.name, e);
    for (const p of this.parameters) if (!this.parameterMap.has(p.name)) this.parameterMap.set(p.name, p);
    for (const m of this.morphs) if (!this.morphMap.has(m.name)) this.morphMap.set(m.name, m);
    for (const v of this.variables) if (!this.variableMap.has(v.name)) this.variableMap.set(v.name, v);
    for (const a of this.animations) if (!this.animationMap.has(a.name)) this.animationMap.set(a.name, a);
  }

  findBone(name: string): BoneData | null { return this.boneMap.get(name) ?? null; }
  findSlot(name: string): SlotData | null { return this.slotMap.get(name) ?? null; }
  findSkin(name: string): SkinData | null { return this.skinMap.get(name) ?? null; }
  findConstraint(name: string): ConstraintData | null { return this.constraintMap.get(name) ?? null; }
  findEvent(name: string): EventData | null { return this.eventMap.get(name) ?? null; }
  findParameter(name: string): ParameterData | null { return this.parameterMap.get(name) ?? null; }
  findMorph(name: string): MorphData | null { return this.morphMap.get(name) ?? null; }
  findVariable(name: string): VariableData | null { return this.variableMap.get(name) ?? null; }
  findAnimation(name: string): AnimationData | null { return this.animationMap.get(name) ?? null; }

  /**
   * Puts another set of animations in place of the current ones, keeping every
   * other piece of the skeleton exactly as it is.
   *
   * This is for an EDITOR, which changes timelines while the artist drags the
   * mouse: reading the whole file again to see one new key would also rebuild
   * the bones, the skins and every attachment, and throw away the `Skeleton`
   * that is on screen. A player never needs it. See `loadAnimationsFor`.
   */
  replaceAnimations(animations: readonly AnimationData[]): void {
    // `animations` is readonly for everyone outside; this is the one door.
    (this as { animations: readonly AnimationData[] }).animations = animations;
    this.animationMap.clear();
    for (const a of animations) if (!this.animationMap.has(a.name)) this.animationMap.set(a.name, a);
  }

  /** The root bone (`bones[0]`, spec 2.2). */
  get root(): BoneData {
    return this.bones[0];
  }
}

// ---------------------------------------------------------------------------
// Atlas (spec 10)
// ---------------------------------------------------------------------------

export class AtlasPageData {
  readonly index: number;
  readonly name: string;
  readonly image: string;
  readonly width: number;
  readonly height: number;
  readonly format: AtlasFormat;
  readonly minFilter: AtlasMinFilter;
  readonly magFilter: AtlasMagFilter;
  readonly wrapU: AtlasWrap;
  readonly wrapV: AtlasWrap;
  readonly premultiplied: boolean;

  constructor(index: number, name: string, image: string, width: number, height: number, values: {
    format?: AtlasFormat; minFilter?: AtlasMinFilter; magFilter?: AtlasMagFilter;
    wrapU?: AtlasWrap; wrapV?: AtlasWrap; premultiplied?: boolean;
  } = {}) {
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
  readonly index: number;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly page: AtlasPageData;
  /** Atlas `scale`: page px per skeleton px (spec 10.2). */
  readonly scale: number;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  /** `0` or `90` (clockwise, spec 10.3). */
  readonly rotation: 0 | 90;
  readonly offsetX: number;
  readonly offsetY: number;
  readonly originalWidth: number;
  readonly originalHeight: number;
  /**
   * Pivot in px of the ORIGINAL image, from the left and from the bottom, like
   * `offsetX/offsetY` (spec 10.3). `undefined` = the centre. Informative: the
   * pose never reads it; an editor uses it to put a new image in place.
   */
  readonly pivotX: number | undefined;
  readonly pivotY: number | undefined;

  constructor(index: number, name: string, page: AtlasPageData, scale: number, values: {
    aliases?: readonly string[]; x: number; y: number; width: number; height: number;
    rotation?: 0 | 90; offsetX?: number; offsetY?: number; originalWidth?: number; originalHeight?: number;
    pivotX?: number | undefined; pivotY?: number | undefined;
  }) {
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
  computeUV(u0: number, v0: number, out: Float64Array | number[] = new Float64Array(2), offset = 0): Float64Array | number[] {
    const px = u0 * this.originalWidth - this.offsetX;
    const py = v0 * this.originalHeight - (this.originalHeight - this.offsetY - this.height);
    const pw = this.page.width;
    const ph = this.page.height;
    if (this.rotation === 90) {
      out[offset] = (this.x + this.height - py) / pw;
      out[offset + 1] = (this.y + px) / ph;
    } else {
      out[offset] = (this.x + px) / pw;
      out[offset + 1] = (this.y + py) / ph;
    }
    return out;
  }
}

export class AtlasData {
  readonly scale: number;
  readonly pages: readonly AtlasPageData[];
  readonly regions: readonly AtlasRegionData[];
  readonly warnings: readonly LoadWarning[];
  private readonly regionMap = new Map<string, AtlasRegionData>();

  constructor(scale: number, pages: readonly AtlasPageData[], regions: readonly AtlasRegionData[], warnings: readonly LoadWarning[] = []) {
    this.scale = scale;
    this.pages = pages;
    this.regions = regions;
    this.warnings = warnings;
    // Names first, then aliases; the first occurrence wins (spec 10.5).
    for (const r of regions) if (!this.regionMap.has(r.name)) this.regionMap.set(r.name, r);
    for (const r of regions) for (const a of r.aliases) if (!this.regionMap.has(a)) this.regionMap.set(a, r);
  }

  /** Finds a region by name or alias (spec 10.5). */
  findRegion(name: string): AtlasRegionData | null {
    return this.regionMap.get(name) ?? null;
  }
}

/** Looks a region up across several atlases, in order (spec 2.8, 10.5). */
export function findAtlasRegion(atlases: readonly AtlasData[], name: string): AtlasRegionData | null {
  for (const atlas of atlases) {
    const r = atlas.findRegion(name);
    if (r !== null) return r;
  }
  return null;
}
