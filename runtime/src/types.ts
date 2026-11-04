// SPDX-License-Identifier: Apache-2.0
/**
 * JSON-level types mirroring the `.bone` file and the `.atlas.json` file.
 *
 * These types describe the file exactly as written: every optional property of
 * the specification is optional here. Defaults are applied by the loader, not
 * by the types. Discriminated unions use the `type` property.
 *
 * Spec: sections 2, 4, 6, 7, 8, 9 and 10.
 */

export type Color4 = [number, number, number, number];
export type Color3 = [number, number, number];

/**
 * A closed set of known literals that still accepts any other string (values
 * added by newer versions or extensions, spec 2.4, 2.5). Keeps autocomplete
 * on the known values without collapsing the whole union to `string`.
 */
export type LiteralUnion<T extends string> = T | (string & {});

/** Every object of the format may carry `extras` and `extensions` (spec 2.1). */
export interface Extensible {
  extras?: unknown;
  extensions?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Root and header (spec 2.2, 2.3, 2.8, 4.1)
// ---------------------------------------------------------------------------

export interface BoneHeader extends Extensible {
  version: string;
  minVersion: string;
  generator: string;
  id?: string;
  created?: string;
  modified?: string;
  license?: string;
  copyright?: string;
}

export interface SkeletonMetaDef extends Extensible {
  name?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fps?: number;
  referenceScale?: number;
  pixelArt?: boolean;
  hash?: string;
}

export interface AssetsDef extends Extensible {
  atlases?: string[];
  imagesBase?: string;
  audioBase?: string;
  skeletonsBase?: string;
  /** Files whose `animations` enter this skeleton by name (spec 2.8). */
  animations?: string[];
  /** Files whose `skins` (with their `skinRequired` bones) enter this body (spec 2.8). */
  skins?: string[];
}

export interface BoneFile extends Extensible {
  bone: BoneHeader;
  extensionsUsed?: string[];
  extensionsRequired?: string[];
  skeleton?: SkeletonMetaDef;
  assets?: AssetsDef;
  /** What this file requires from the skeleton that uses it (spec 4.8). */
  rig?: RigDef;
  bones: BoneDef[];
  slots?: SlotDef[];
  constraints?: ConstraintDef[];
  skins?: SkinDef[];
  events?: EventDef[];
  parameters?: ParameterDef[];
  morphs?: MorphDef[];
  variables?: VariableDef[];
  tags?: string[];
  animations?: AnimationDef[];
}

// ---------------------------------------------------------------------------
// Bones and slots (spec 4.2, 4.3)
// ---------------------------------------------------------------------------

export interface BoneDef extends Extensible {
  name: string;
  parent?: string;
  length?: number;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  shearX?: number;
  shearY?: number;
  inheritRotation?: boolean;
  inheritScale?: boolean;
  inheritReflection?: boolean;
  skinRequired?: boolean;
  color?: Color4;
  icon?: string;
  visible?: boolean;
  folder?: string;
}

export type BlendMode = 'normal' | 'additive' | 'multiply' | 'screen';

export interface SlotDef extends Extensible {
  name: string;
  bone: string;
  attachment?: string;
  color?: Color4;
  darkColor?: Color3;
  blend?: LiteralUnion<BlendMode>;
  visible?: boolean;
  folder?: string;
}

// ---------------------------------------------------------------------------
// Skins and attachments (spec 4.4, 7)
// ---------------------------------------------------------------------------

export interface SkinDef extends Extensible {
  name: string;
  displayName?: string;
  includes?: string[];
  bones?: string[];
  constraints?: string[];
  /** slotName -> placeholderName -> attachment (or null to hide). */
  attachments?: Record<string, Record<string, AttachmentDef | null>>;
}

/** Weighted vertices, structure of arrays (spec 7.4). */
export interface BindingDef {
  counts: number[];
  bones: number[];
  positions: number[];
  weights: number[];
}

export interface SequenceDef extends Extensible {
  count?: number;
  frames?: string[];
  start?: number;
  digits?: number;
  setup?: number;
}

export interface AttachmentBaseDef extends Extensible {
  type: string;
  path?: string;
  color?: Color4;
}

export interface RegionAttachmentDef extends AttachmentBaseDef {
  type: 'region';
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  width?: number;
  height?: number;
  sequence?: SequenceDef;
}

export interface MeshAttachmentDef extends AttachmentBaseDef {
  type: 'mesh';
  vertices?: number[];
  binding?: BindingDef;
  uvs: number[];
  triangles: number[];
  hull?: number;
  edges?: number[];
  width?: number;
  height?: number;
  sequence?: SequenceDef;
}

export interface LinkedMeshAttachmentDef extends AttachmentBaseDef {
  type: 'linkedmesh';
  parent: string;
  skin?: string;
  inheritDeform?: boolean;
  width?: number;
  height?: number;
  sequence?: SequenceDef;
}

export type BoundingBoxShape = 'polygon' | 'rectangle' | 'ellipse';

export interface BoundingBoxAttachmentDef extends AttachmentBaseDef {
  type: 'boundingbox';
  shape?: LiteralUnion<BoundingBoxShape>;
  vertices?: number[];
  binding?: BindingDef;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
}

export interface ClippingAttachmentDef extends AttachmentBaseDef {
  type: 'clipping';
  end?: string;
  slots?: string[];
  invert?: boolean;
  vertices?: number[];
  binding?: BindingDef;
}

export interface PathAttachmentDef extends AttachmentBaseDef {
  type: 'path';
  closed?: boolean;
  constantSpeed?: boolean;
  lengths: number[];
  vertices?: number[];
  binding?: BindingDef;
}

export interface PointAttachmentDef extends AttachmentBaseDef {
  type: 'point';
  x?: number;
  y?: number;
  rotation?: number;
}

export interface SkeletonAttachmentDef extends AttachmentBaseDef {
  type: 'skeleton';
  uri: string;
  skins?: string[];
  animation?: string;
  loop?: boolean;
  timeScale?: number;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  inheritColor?: boolean;
  /** Spec 7.11: the child plays the animation with the name the parent is playing. */
  inheritAnimation?: boolean;
  /** Spec 7.11: child animation that always runs underneath, looping, on its own clock. */
  baseAnimation?: string;
  /** Spec 7.11 (since 1.1): the child's slot that marks the middle; the child is drawn around its parent. */
  around?: string;
}

/**
 * `BONE_particle` — the stateless emitter of the `BONE_particles` extension
 * (`formato/extensions/BONE_particles.md`). It is NOT a core type: it is a
 * prefixed type, which spec 2.7 allows an extension to add, and a reader
 * without the extension treats the placeholder as empty (spec 2.5).
 *
 * The fields are described one by one in section 9 of the extension; they are
 * listed loosely here on purpose, because this interface exists so the runtime
 * can name the type, not so it can re-specify it. The law is the extension
 * and the eight cases P-001..P-008.
 */
export interface ParticleAttachmentDef extends AttachmentBaseDef {
  type: 'BONE_particle';
  path?: string;
  [field: string]: unknown;
}

export type AttachmentDef =
  | RegionAttachmentDef
  | MeshAttachmentDef
  | LinkedMeshAttachmentDef
  | BoundingBoxAttachmentDef
  | ClippingAttachmentDef
  | PathAttachmentDef
  | PointAttachmentDef
  | SkeletonAttachmentDef
  | ParticleAttachmentDef;

export type AttachmentType = AttachmentDef['type'];

// ---------------------------------------------------------------------------
// Constraints (spec 6, 8.2)
// ---------------------------------------------------------------------------

export interface ConstraintBaseDef extends Extensible {
  type: string;
  name: string;
  mix?: number;
  skinRequired?: boolean;
}

export interface IkConstraintDef extends ConstraintBaseDef {
  type: 'ik';
  bones: string[];
  target: string;
  bendPositive?: boolean;
  compress?: boolean;
  stretch?: boolean;
  uniform?: boolean;
  softness?: number;
}

export interface TransformConstraintDef extends ConstraintBaseDef {
  type: 'transform';
  bones: string[];
  target: string;
  local?: boolean;
  relative?: boolean;
  offsetRotation?: number;
  offsetX?: number;
  offsetY?: number;
  offsetScaleX?: number;
  offsetScaleY?: number;
  offsetShearY?: number;
  mixRotation?: number;
  mixX?: number;
  mixY?: number;
  mixScaleX?: number;
  mixScaleY?: number;
  mixShearY?: number;
}

export type PathPositionMode = 'fixed' | 'percent';
export type PathSpacingMode = 'length' | 'fixed' | 'percent' | 'proportional';
export type PathRotateMode = 'tangent' | 'chain' | 'chainScale';

export interface PathConstraintDef extends ConstraintBaseDef {
  type: 'path';
  bones: string[];
  target: string;
  positionMode?: LiteralUnion<PathPositionMode>;
  spacingMode?: LiteralUnion<PathSpacingMode>;
  rotateMode?: LiteralUnion<PathRotateMode>;
  offsetRotation?: number;
  position?: number;
  spacing?: number;
  mixRotation?: number;
  mixX?: number;
  mixY?: number;
}

export interface PhysicsConstraintDef extends ConstraintBaseDef {
  type: 'physics';
  bone: string;
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  shearX?: number;
  inertia?: number;
  strength?: number;
  damping?: number;
  mass?: number;
  wind?: number;
  gravity?: number;
  limit?: number;
  fps?: number;
}

export type DriverMode = 'replace' | 'add';

export interface DriverKeyDef extends Extensible {
  input: number;
  value: KeyValue;
  curve?: CurveDef;
  offset?: number;
}

export interface DriverTargetDef extends Extensible {
  type: string;
  target?: string;
  property?: string;
  skin?: string;
  attachment?: string;
  mode?: LiteralUnion<DriverMode>;
  keys: DriverKeyDef[];
}

export interface DriverConstraintDef extends ConstraintBaseDef {
  type: 'driver';
  parameter: string;
  targets?: DriverTargetDef[];
  animation?: string;
  from?: number;
  to?: number;
  timeFrom?: number;
  timeTo?: number;
  mode?: LiteralUnion<DriverMode>;
}

export type ConstraintDef =
  | IkConstraintDef
  | TransformConstraintDef
  | PathConstraintDef
  | PhysicsConstraintDef
  | DriverConstraintDef;

export type ConstraintType = ConstraintDef['type'];

// ---------------------------------------------------------------------------
// Events, parameters, morphs, variables (spec 4.5, 8)
// ---------------------------------------------------------------------------

export interface EventDef extends Extensible {
  name: string;
  int?: number;
  float?: number;
  string?: string;
  audio?: string;
  volume?: number;
  balance?: number;
}

export type BoneNumericProperty = 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY' | 'shearX' | 'shearY';
export type BoneInheritProperty = 'inheritRotation' | 'inheritScale' | 'inheritReflection';

export interface ParameterSourceDef extends Extensible {
  bone: string;
  property: LiteralUnion<BoneNumericProperty>;
  from?: number;
  to?: number;
}

export interface ParameterDef extends Extensible {
  name: string;
  min?: number;
  max?: number;
  default?: number;
  repeat?: boolean;
  group?: string;
  displayName?: string;
  source?: ParameterSourceDef;
}

export interface MorphTargetDef extends Extensible {
  slot: string;
  attachment: string;
  skin?: string;
  offsets: number[];
}

export interface MorphDef extends Extensible {
  name: string;
  weight?: number;
  min?: number;
  max?: number;
  group?: string;
  targets: MorphTargetDef[];
}

export type VariableType = 'float' | 'int' | 'string' | 'bool';
export type VariableValue = number | string | boolean;

export interface VariableDef extends Extensible {
  name: string;
  type: LiteralUnion<VariableType>;
  default?: VariableValue;
}

// ---------------------------------------------------------------------------
// Animations, timelines, keys, curves (spec 9)
// ---------------------------------------------------------------------------

export type AnimationBlend = 'replace' | 'add' | 'multiply';

export interface AnimationDef extends Extensible {
  name: string;
  duration?: number;
  loop?: boolean;
  blend?: LiteralUnion<AnimationBlend>;
  defaultMix?: number;
  tags?: string[];
  /** Image export crop of this animation (spec 4.6). Informative: no pose reader uses it. */
  crop?: { x?: number; y?: number; width?: number; height?: number };
  timelines?: TimelineDef[];
}

/** `transform` of a `slot` / `bone` key (spec 9.5): `T(x, y) R(rotation) S(scaleX, scaleY)`. */
export interface SlotBoneTransformDef {
  x?: number;
  y?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

/** `rig` block (spec 4.8): what this file requires from the skeleton that uses it. */
export interface RigDef extends Extensible {
  name?: string;
  bones?: string[];
  slots?: string[];
  reference?: { bone: string; length: number };
}

/** `"linear"`, `"stepped"`, an unknown string (fallback) or `4 x C` Bezier numbers. */
export type CurveDef = LiteralUnion<'linear' | 'stepped'> | number[];

export interface DrawOrderEntry {
  slot: string;
  offset: number;
}

export type SequenceMode =
  | 'hold'
  | 'once'
  | 'loop'
  | 'pingpong'
  | 'onceReverse'
  | 'loopReverse'
  | 'pingpongReverse';

export interface SequenceKeyValue {
  mode?: LiteralUnion<SequenceMode>;
  index?: number;
  delay?: number;
}

export type KeyValue =
  | number
  | boolean
  | string
  | null
  | number[]
  | string[]
  | DrawOrderEntry[]
  | SequenceKeyValue;

export interface KeyDef extends Extensible {
  time: number;
  value?: KeyValue;
  curve?: CurveDef;
  /** Only `deform`: index of the first number of `value` inside the deform array. */
  offset?: number;
  /** Only `slot` / `bone`: where the attachment sits on the new bone (spec 9.5). */
  transform?: SlotBoneTransformDef;
  /** Only `body`: the skin stack passes to the new body (spec 9.13). Default `true`. */
  keepSkins?: boolean;
  /** Only `event`. */
  event?: string;
  int?: number;
  float?: number;
  string?: string;
  volume?: number;
  balance?: number;
}

export interface TimelineBaseDef extends Extensible {
  type: string;
  target?: string;
  property?: string;
  skin?: string;
  attachment?: string;
  keys: KeyDef[];
}

export interface BoneTimelineDef extends TimelineBaseDef {
  type: 'bone';
  target: string;
  property: LiteralUnion<BoneNumericProperty | BoneInheritProperty>;
}

export type SlotProperty = 'attachment' | 'color' | 'darkColor' | 'visible';

export interface SlotTimelineDef extends TimelineBaseDef {
  type: 'slot';
  target: string;
  property: LiteralUnion<SlotProperty>;
}

export interface DrawOrderTimelineDef extends TimelineBaseDef {
  type: 'drawOrder';
}

export interface DeformTimelineDef extends TimelineBaseDef {
  type: 'deform';
  target: string;
  skin?: string;
  attachment: string;
}

export interface SequenceTimelineDef extends TimelineBaseDef {
  type: 'sequence';
  target: string;
  skin?: string;
  attachment: string;
}

export interface EventTimelineDef extends TimelineBaseDef {
  type: 'event';
}

export interface ConstraintTimelineDef extends TimelineBaseDef {
  type: 'constraint';
  target: string;
  property: string;
}

export interface ParameterTimelineDef extends TimelineBaseDef {
  type: 'parameter';
  target: string;
  property: LiteralUnion<'value'>;
}

export interface MorphTimelineDef extends TimelineBaseDef {
  type: 'morph';
  target: string;
  property: LiteralUnion<'weight'>;
}

export interface VariableTimelineDef extends TimelineBaseDef {
  type: 'variable';
  target: string;
  property: LiteralUnion<'value'>;
}

export interface TagTimelineDef extends TimelineBaseDef {
  type: 'tag';
}

export type NestedProperty = 'animation' | 'time' | 'timeScale';

export interface NestedTimelineDef extends TimelineBaseDef {
  type: 'nested';
  target: string;
  property: LiteralUnion<NestedProperty>;
}

export type TimelineDef =
  | BoneTimelineDef
  | SlotTimelineDef
  | DrawOrderTimelineDef
  | DeformTimelineDef
  | SequenceTimelineDef
  | EventTimelineDef
  | ConstraintTimelineDef
  | ParameterTimelineDef
  | MorphTimelineDef
  | VariableTimelineDef
  | TagTimelineDef
  | NestedTimelineDef;

export type TimelineType = TimelineDef['type'];

// ---------------------------------------------------------------------------
// Atlas (spec 10)
// ---------------------------------------------------------------------------

export type AtlasFormat = 'rgba8' | 'rgb8' | 'rgba4' | 'rgb565' | 'alpha8';
export type AtlasMinFilter = 'nearest' | 'linear' | 'mipmap';
export type AtlasMagFilter = 'nearest' | 'linear';
export type AtlasWrap = 'clamp' | 'repeat' | 'mirror';

export interface AtlasHeader extends Extensible {
  version: string;
  generator?: string;
}

export interface AtlasPage extends Extensible {
  name: string;
  image: string;
  width: number;
  height: number;
  format?: LiteralUnion<AtlasFormat>;
  minFilter?: LiteralUnion<AtlasMinFilter>;
  magFilter?: LiteralUnion<AtlasMagFilter>;
  wrapU?: LiteralUnion<AtlasWrap>;
  wrapV?: LiteralUnion<AtlasWrap>;
  premultiplied?: boolean;
}

export interface AtlasRegion extends Extensible {
  name: string;
  aliases?: string[];
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  offsetX?: number;
  offsetY?: number;
  originalWidth?: number;
  originalHeight?: number;
  /** Px of the original image, from the left and from the bottom (10.3). Informative: the pose never reads it. */
  pivotX?: number;
  pivotY?: number;
}

export interface AtlasFile extends Extensible {
  atlas: AtlasHeader;
  scale?: number;
  pages: AtlasPage[];
  regions: AtlasRegion[];
}
