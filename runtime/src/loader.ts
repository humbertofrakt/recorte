// SPDX-License-Identifier: Apache-2.0
import type { DrawOrderOffset } from './data.js';
import { BoneParentTimelineData } from './data.js';
/**
 * Loader: JSON (`.bone`, atlas) -> resolved data classes.
 *
 * Applies the defaults of the spec, resolves names to objects, and follows the
 * fallback rules of spec 2.5, 4.7 and 12 for broken files. Fatal problems
 * (wrong JSON structure, no bones, invalid types) throw `LoadError` with the
 * JSON Pointer of the offending value. L1 problems with a defined fallback
 * become warnings unless `options.strict` is set, in which case they throw too.
 */

import type {
  BoneFile, BoneHeader, BoneDef, SlotDef, SkinDef, AttachmentDef, BindingDef, SequenceDef,
  ConstraintDef, DriverTargetDef, EventDef, ParameterDef, MorphDef, VariableDef, AnimationDef,
  TimelineDef, KeyDef, DriverKeyDef, CurveDef, Color4, Color3, BlendMode, BoneNumericProperty,
  BoneInheritProperty, DriverMode, PathPositionMode, PathSpacingMode, PathRotateMode,
  VariableType, VariableValue, AnimationBlend, SequenceMode, AtlasFile,
  AtlasFormat, AtlasMinFilter, AtlasMagFilter, AtlasWrap, DrawOrderEntry, SequenceKeyValue,
} from './types.js';
import {
  SkeletonData, BoneData, SlotData, SkinData, ConstraintData, IkConstraintData, TransformConstraintData,
  PathConstraintData, PhysicsConstraintData, DriverConstraintData, DriverTargetData, EventData,
  ParameterData, ParameterSourceData, MorphData, MorphTargetData, VariableData, AnimationData,
  AtlasData, AtlasPageData, AtlasRegionData, findAtlasRegion,
  BoneNumberTimelineData, BoneInheritTimelineData, SlotAttachmentTimelineData, SlotColorTimelineData,
  SlotDarkColorTimelineData, SlotVisibleTimelineData, DrawOrderTimelineData, DeformTimelineData,
  ParticleEmittingTimelineData,
  SequenceTimelineData, EventTimelineData, ConstraintNumberTimelineData, ConstraintBooleanTimelineData,
  ConstraintResetTimelineData, ParameterTimelineData, MorphTimelineData, VariableNumberTimelineData,
  VariableSteppedTimelineData, TagTimelineData, NestedAnimationTimelineData, NestedNumberTimelineData,
  SlotBoneTimelineData, WeightsTimelineData, BodyTimelineData,
  type SlotBoneKey, type BodyKey, type AnimationCrop, type RigData,
  type TimelineData, type NumericKeys, type SteppedKeys, type LoadWarning, type SkeletonMeta, type AssetsData,
  type EventKey, type SequenceKey, type SequenceCapableAttachment,
} from './data.js';
import { normalizeCurve, LINEAR_CURVE, STEPPED_CURVE, type CurveData } from './curve.js';
import type { Attachment } from './attachments/attachment.js';
import { VertexAttachment, BindingData } from './attachments/vertex-attachment.js';
import { RegionAttachment } from './attachments/region.js';
import { MeshAttachment } from './attachments/mesh.js';
import { LinkedMeshAttachment } from './attachments/linkedmesh.js';
import { BoundingBoxAttachment } from './attachments/boundingbox.js';
import { ClippingAttachment } from './attachments/clipping.js';
import { PathAttachment } from './attachments/path.js';
import { PointAttachment } from './attachments/point.js';
import { SkeletonAttachment } from './attachments/skeleton-attachment.js';
import { SequenceData } from './attachments/sequence.js';
import {
  ParticleAttachment, PARTICLE_ATTACHMENT_TYPE, PARTICLE_SHAPES, PARTICLE_MESH_MODES,
  PARTICLE_SPACES, PARTICLE_SORT_MODES, PARTICLE_FRAME_MODES,
  type ParticleShape, type ParticleBurst, type OverLifetimeKey,
} from './attachments/particle.js';
import { joinUri, validateUri } from './uri.js';
import { stripBom, findDuplicateKey } from './json-text.js';
import { composeMatrix, type Matrix2x3 } from './math.js';

/** Format version this reader implements (spec 2.4). */
export const READER_VERSION = { major: 1, minor: 1 };

/**
 * Extensions this reader implements, by the name that goes in `extensionsUsed`
 * (spec 2.7). `BONE_particles` is the side module **P**: it needs level A,
 * `shape: "mesh"` also needs B, and `space: "world"` needs C when the slot's
 * bone is under constraints (extension 10).
 */
export const SUPPORTED_EXTENSIONS: readonly string[] = ['BONE_particles'];

export interface LoadOptions {
  /** Throw on every L1 problem instead of applying the spec fallback. Default `false`. */
  strict?: boolean;
  /** Atlases used to resolve `region` / `mesh` images (spec 2.8). */
  atlases?: readonly AtlasData[];
  /**
   * Files behind the `skeleton` attachments of spec 7.11, looked up by the
   * `uri` already joined to `assets.skeletonsBase`. A `Map` or a function.
   * A `uri` that does not resolve is an L1 warning: the placeholder is empty.
   */
  skeletons?: NestedSkeletonSource;
  /**
   * Load in degraded mode when `extensionsRequired` lists an extension this
   * reader does not implement (spec 2.7: only "if the user asks"). Default
   * `false`: such a file is refused with `LoadError` at `/extensionsRequired`.
   * When `true`, a warning is recorded and `SkeletonData.degraded` is set.
   */
  allowMissingRequiredExtensions?: boolean;
  /**
   * Animation objects (the JSON objects themselves) that came from ANOTHER
   * file through `assets.animations` (spec 2.8). A target they name that this
   * skeleton does not have is not L1: it is the `rig` that declares it, and
   * the timeline is dropped with the L2 warning `RIG_UNMET` (spec 4.8).
   * Filled by `composeExternals`; a caller rarely sets it by hand.
   */
  externalAnimations?: ReadonlySet<unknown>;
  /**
   * Warning code for a timeline target this skeleton does not have. Unset, a
   * missing target is L1. Set, it is a plain warning with this code in front
   * (never thrown, even in strict mode). The `Actor` uses `BODY_UNMET` when it
   * binds an animation to another body by name (spec 9.13).
   */
  unmetCode?: string;
}

/** Where the loader finds the nested skeletons of spec 7.11. */
export type NestedSkeletonSource =
  | ReadonlyMap<string, SkeletonData>
  | ((resolvedUri: string) => SkeletonData | null | undefined);

export class LoadError extends Error {
  readonly pointer: string;

  constructor(pointer: string, message: string) {
    super(`${pointer}: ${message}`);
    this.name = 'LoadError';
    this.pointer = pointer;
  }
}

// ---------------------------------------------------------------------------
// Context and JSON helpers
// ---------------------------------------------------------------------------

class Context {
  readonly warnings: LoadWarning[] = [];
  readonly strict: boolean;
  readonly atlases: readonly AtlasData[] | null;
  readonly missingImages: string[] = [];

  constructor(options: LoadOptions) {
    this.strict = options.strict ?? false;
    this.atlases = options.atlases ?? null;
  }

  /** Records a warning (never throws). */
  warn(pointer: string, message: string): void {
    this.warnings.push({ pointer, message });
  }

  /** L1 problem with a defined fallback: throws in strict mode, warns otherwise. */
  issue(pointer: string, message: string): void {
    if (this.strict) throw new LoadError(pointer, message);
    this.warnings.push({ pointer, message });
  }

  /** Fatal problem: always throws. */
  fail(pointer: string, message: string): never {
    throw new LoadError(pointer, message);
  }

  /** Records a missing image once (spec 2.8). */
  missingImage(pointer: string, name: string): void {
    if (this.missingImages.includes(name)) return;
    this.missingImages.push(name);
    this.warn(pointer, `image "${name}" not found in any atlas; attachment will be invisible`);
  }

  /**
   * Image name that breaks the uri rules (spec 7.2, 2.8): L1, the name is
   * refused and the attachment is invisible. Returns `false` when refused.
   */
  imageName(pointer: string, name: string): boolean {
    const problem = validateUri(name);
    if (problem === null) return true;
    this.issue(pointer, `image name "${name}" refused: ${problem}; attachment will be invisible`);
    if (!this.missingImages.includes(name)) this.missingImages.push(name);
    return false;
  }

  /** Any other uri of the file (`assets`, `event.audio`, `page.image`): L1 warning. */
  uri(pointer: string, value: string, options: { allowData?: boolean; allowEmpty?: boolean } = {}): void {
    const problem = validateUri(value, options);
    if (problem !== null) this.issue(pointer, `invalid uri "${value}": ${problem}`);
  }
}

/**
 * Parses the text of a `.bone` or `.atlas.json` file (spec 2.1): a leading
 * BOM is accepted, a duplicated key in one object is an L0 `LoadError` with
 * its JSON Pointer, and syntax errors become `LoadError` at `""`.
 */
export function parseBoneText(text: string): unknown {
  const clean = stripBom(text);
  const dup = findDuplicateKey(clean);
  if (dup !== null) throw new LoadError(dup.pointer, `duplicate key "${dup.key}" in the same object`);
  try {
    return JSON.parse(clean) as unknown;
  } catch (e) {
    throw new LoadError('', `invalid JSON: ${(e as Error).message}`);
  }
}

/** `loadSkeletonData(parseBoneText(text), options)`. */
export function loadSkeletonFromText(text: string, options: LoadOptions = {}): SkeletonData {
  return loadSkeletonData(parseBoneText(text), options);
}

/** `loadAtlas(parseBoneText(text), options)`. */
export function loadAtlasFromText(text: string, options: { strict?: boolean } = {}): AtlasData {
  return loadAtlas(parseBoneText(text), options);
}

/** JSON Pointer segment escaping (RFC 6901). */
export function escapePointer(segment: string | number): string {
  return String(segment).replace(/~/g, '~0').replace(/\//g, '~1');
}

function ptr(base: string, ...segments: (string | number)[]): string {
  let out = base;
  for (const s of segments) out += '/' + escapePointer(s);
  return out;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function expectObject(ctx: Context, v: unknown, pointer: string): Record<string, unknown> {
  if (!isObject(v)) ctx.fail(pointer, 'expected an object');
  return v;
}

function expectArray(ctx: Context, v: unknown, pointer: string): unknown[] {
  if (!Array.isArray(v)) ctx.fail(pointer, 'expected an array');
  return v;
}

function optObject(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): Record<string, unknown> | undefined {
  const v = o[key];
  if (v === undefined) return undefined;
  return expectObject(ctx, v, ptr(pointer, key));
}

function optArray(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): unknown[] | undefined {
  const v = o[key];
  if (v === undefined) return undefined;
  return expectArray(ctx, v, ptr(pointer, key));
}

function reqString(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): string {
  const v = o[key];
  if (typeof v !== 'string') ctx.fail(ptr(pointer, key), 'expected a string');
  return v;
}

function optString(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): string | undefined {
  const v = o[key];
  if (v === undefined) return undefined;
  if (typeof v !== 'string') ctx.fail(ptr(pointer, key), 'expected a string');
  return v;
}

function reqNumber(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): number {
  const v = o[key];
  if (typeof v !== 'number' || !Number.isFinite(v)) ctx.fail(ptr(pointer, key), 'expected a finite number');
  return v;
}

function optNumber(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): number | undefined {
  const v = o[key];
  if (v === undefined) return undefined;
  if (typeof v !== 'number' || !Number.isFinite(v)) ctx.fail(ptr(pointer, key), 'expected a finite number');
  return v;
}

function optBoolean(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): boolean | undefined {
  const v = o[key];
  if (v === undefined) return undefined;
  if (typeof v !== 'boolean') ctx.fail(ptr(pointer, key), 'expected a boolean');
  return v;
}

function optStringArray(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): string[] | undefined {
  const arr = optArray(ctx, o, key, pointer);
  if (arr === undefined) return undefined;
  const p = ptr(pointer, key);
  return arr.map((v, i) => {
    if (typeof v !== 'string') ctx.fail(ptr(p, i), 'expected a string');
    return v;
  });
}

function optNumberArray(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): number[] | undefined {
  const arr = optArray(ctx, o, key, pointer);
  if (arr === undefined) return undefined;
  return numberArray(ctx, arr, ptr(pointer, key));
}

function numberArray(ctx: Context, arr: unknown[], pointer: string): number[] {
  return arr.map((v, i) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) ctx.fail(ptr(pointer, i), 'expected a finite number');
    return v;
  });
}

function reqNumberArray(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): number[] {
  const arr = optArray(ctx, o, key, pointer);
  if (arr === undefined) ctx.fail(ptr(pointer, key), 'required array missing');
  return numberArray(ctx, arr, ptr(pointer, key));
}

function optColor4(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): Color4 | undefined {
  const arr = optNumberArray(ctx, o, key, pointer);
  if (arr === undefined) return undefined;
  if (arr.length !== 4) ctx.fail(ptr(pointer, key), 'expected 4 numbers');
  return [arr[0], arr[1], arr[2], arr[3]];
}

function optColor3(ctx: Context, o: Record<string, unknown>, key: string, pointer: string): Color3 | undefined {
  const arr = optNumberArray(ctx, o, key, pointer);
  if (arr === undefined) return undefined;
  if (arr.length !== 3) ctx.fail(ptr(pointer, key), 'expected 3 numbers');
  return [arr[0], arr[1], arr[2]];
}

/** Reads an enum with the spec fallback: unknown value -> default, with a warning. */
function optEnum<T extends string>(ctx: Context, o: Record<string, unknown>, key: string, pointer: string, allowed: readonly T[], fallback: T): T {
  const v = optString(ctx, o, key, pointer);
  if (v === undefined) return fallback;
  if ((allowed as readonly string[]).includes(v)) return v as T;
  ctx.warn(ptr(pointer, key), `unknown value "${v}", using "${fallback}"`);
  return fallback;
}

// ---------------------------------------------------------------------------
// Version (spec 2.4)
// ---------------------------------------------------------------------------

export function parseVersion(text: string): { major: number; minor: number } | null {
  const m = /^(\d+)\.(\d+)$/.exec(text);
  if (m === null) return null;
  return { major: Number(m[1]), minor: Number(m[2]) };
}

function checkVersion(ctx: Context, header: BoneHeader, pointer: string): void {
  const file = parseVersion(header.version);
  const min = parseVersion(header.minVersion);
  if (file === null) ctx.fail(ptr(pointer, 'version'), `invalid version "${header.version}"`);
  if (min === null) ctx.fail(ptr(pointer, 'minVersion'), `invalid minVersion "${header.minVersion}"`);
  // L1 VERSION_MIN_GT_VERSION (spec 2.3: minVersion is always <= version).
  if (min.major > file.major || (min.major === file.major && min.minor > file.minor)) {
    ctx.issue(ptr(pointer, 'minVersion'), `minVersion ${header.minVersion} is greater than version ${header.version}`);
  }
  const r = READER_VERSION;
  if (file.major > r.major) {
    ctx.issue(ptr(pointer, 'version'), `file version ${header.version} is newer than reader ${r.major}.${r.minor}; best effort`);
    return;
  }
  if (file.major === r.major && file.minor > r.minor) {
    if (min.major < r.major || (min.major === r.major && min.minor <= r.minor)) {
      ctx.warn(ptr(pointer, 'version'), `file version ${header.version} newer than reader ${r.major}.${r.minor}: partial read`);
    } else {
      ctx.warn(ptr(pointer, 'minVersion'), `file requires ${header.minVersion}, reader is ${r.major}.${r.minor}: best effort`);
    }
  }
}

// ---------------------------------------------------------------------------
// Skeleton loader
// ---------------------------------------------------------------------------

/** Mutable state shared by the loading steps. */
interface Build {
  ctx: Context;
  bones: BoneData[];
  boneMap: Map<string, BoneData>;
  slots: SlotData[];
  slotMap: Map<string, SlotData>;
  skins: SkinData[];
  skinMap: Map<string, SkinData>;
  defaultSkin: SkinData;
  events: EventData[];
  eventMap: Map<string, EventData>;
  parameters: ParameterData[];
  parameterMap: Map<string, ParameterData>;
  morphs: MorphData[];
  morphMap: Map<string, MorphData>;
  variables: VariableData[];
  variableMap: Map<string, VariableData>;
  constraints: ConstraintData[];
  constraintMap: Map<string, ConstraintData>;
  animations: AnimationData[];
  animationMap: Map<string, AnimationData>;
  /** Names of `/animations[*]`, known before the animations are loaded (drivers, 8.2). */
  animationNames: Set<string>;
  /** Code of the animation being read when a missing target is not L1 (spec 4.7, 4.8, 9.13). */
  unmetCode?: string | null;
  /** Default of `unmetCode` for every animation (`LoadOptions.unmetCode`). */
  baseUnmetCode?: string | null;
  /** `LoadOptions.externalAnimations`. */
  externalAnimations?: ReadonlySet<unknown> | null;
  /** `assets.skeletonsBase`, for the `uri` of a `body` key (spec 9.13). */
  skeletonsBase?: string;
}

/**
 * A timeline target this skeleton does not have (spec 4.7). L1 as a rule; a
 * plain warning with a code when the animation declares that the name lives
 * elsewhere — in the host of an external animation (`RIG_UNMET`, 4.8) or in
 * another body of the project (`BODY_UNMET`, 9.13).
 */
function missingTarget(b: Build, pointer: string, message: string): void {
  const code = b.unmetCode ?? null;
  // Appendix C rule 14: outside a body switch the reader's code is
  // `TARGET_MISSING`. It stays an L1 problem for a validator (4.7), so strict
  // mode still throws.
  if (code === null) b.ctx.issue(pointer, `TARGET_MISSING: ${message}`);
  else b.ctx.warn(pointer, `${code}: ${message}`);
}

/**
 * Loads a parsed `.bone` JSON value into `SkeletonData`.
 * Throws `LoadError` (with a JSON Pointer) on fatal problems.
 */
export function loadSkeletonData(json: unknown, options: LoadOptions = {}): SkeletonData {
  const ctx = new Context(options);
  const root = expectObject(ctx, json, '');

  // Header (2.3)
  const headerObj = expectObject(ctx, root['bone'], '/bone');
  const header: BoneHeader = {
    version: reqString(ctx, headerObj, 'version', '/bone'),
    minVersion: reqString(ctx, headerObj, 'minVersion', '/bone'),
    generator: reqString(ctx, headerObj, 'generator', '/bone'),
    id: optString(ctx, headerObj, 'id', '/bone'),
    created: optString(ctx, headerObj, 'created', '/bone'),
    modified: optString(ctx, headerObj, 'modified', '/bone'),
    license: optString(ctx, headerObj, 'license', '/bone'),
    copyright: optString(ctx, headerObj, 'copyright', '/bone'),
  };
  checkVersion(ctx, header, '/bone');

  // Extensions (2.7)
  const extensionsUsed = optStringArray(ctx, root, 'extensionsUsed', '') ?? [];
  const extensionsRequired = optStringArray(ctx, root, 'extensionsRequired', '') ?? [];
  const unsupported = extensionsRequired.filter((ext) => !SUPPORTED_EXTENSIONS.includes(ext));
  let degraded = false;
  if (unsupported.length > 0) {
    // Spec 2.7: the reader SHOULD refuse, listing the extensions, and MAY load
    // degraded only when the user asks for it.
    const message = `required extensions not supported: ${unsupported.join(', ')}`;
    if (options.allowMissingRequiredExtensions !== true || ctx.strict) throw new LoadError('/extensionsRequired', message);
    ctx.warn('/extensionsRequired', `${message}; loading in degraded mode as requested`);
    degraded = true;
  }

  // Skeleton metadata (4.1) and assets (2.8)
  const metaObj = optObject(ctx, root, 'skeleton', '') ?? {};
  const meta: SkeletonMeta = {
    name: optString(ctx, metaObj, 'name', '/skeleton') ?? null,
    x: optNumber(ctx, metaObj, 'x', '/skeleton') ?? 0,
    y: optNumber(ctx, metaObj, 'y', '/skeleton') ?? 0,
    width: optNumber(ctx, metaObj, 'width', '/skeleton') ?? 0,
    height: optNumber(ctx, metaObj, 'height', '/skeleton') ?? 0,
    fps: optNumber(ctx, metaObj, 'fps', '/skeleton') ?? 30,
    referenceScale: optNumber(ctx, metaObj, 'referenceScale', '/skeleton') ?? 100,
    pixelArt: optBoolean(ctx, metaObj, 'pixelArt', '/skeleton') ?? false,
    hash: optString(ctx, metaObj, 'hash', '/skeleton') ?? null,
  };
  const assetsObj = optObject(ctx, root, 'assets', '') ?? {};
  const assets: AssetsData = {
    atlases: optStringArray(ctx, assetsObj, 'atlases', '/assets') ?? [],
    imagesBase: optString(ctx, assetsObj, 'imagesBase', '/assets') ?? '',
    audioBase: optString(ctx, assetsObj, 'audioBase', '/assets') ?? '',
    skeletonsBase: optString(ctx, assetsObj, 'skeletonsBase', '/assets') ?? '',
    animations: optStringArray(ctx, assetsObj, 'animations', '/assets') ?? [],
    skins: optStringArray(ctx, assetsObj, 'skins', '/assets') ?? [],
  };
  for (let i = 0; i < assets.atlases.length; i++) ctx.uri(ptr('/assets/atlases', i), assets.atlases[i]);
  for (let i = 0; i < assets.animations.length; i++) ctx.uri(ptr('/assets/animations', i), assets.animations[i]);
  for (let i = 0; i < assets.skins.length; i++) ctx.uri(ptr('/assets/skins', i), assets.skins[i]);
  const rig = loadRig(ctx, root);
  ctx.uri('/assets/imagesBase', assets.imagesBase, { allowEmpty: true });
  ctx.uri('/assets/audioBase', assets.audioBase, { allowEmpty: true });
  ctx.uri('/assets/skeletonsBase', assets.skeletonsBase, { allowEmpty: true });

  const b: Build = {
    ctx,
    bones: [], boneMap: new Map(),
    slots: [], slotMap: new Map(),
    skins: [], skinMap: new Map(),
    defaultSkin: null as unknown as SkinData,
    events: [], eventMap: new Map(),
    parameters: [], parameterMap: new Map(),
    morphs: [], morphMap: new Map(),
    variables: [], variableMap: new Map(),
    constraints: [], constraintMap: new Map(),
    animations: [], animationMap: new Map(), animationNames: new Set(),
    baseUnmetCode: options.unmetCode ?? null,
    externalAnimations: options.externalAnimations ?? null,
    skeletonsBase: assets.skeletonsBase,
  };

  loadBones(b, expectArray(ctx, root['bones'], '/bones'));
  loadSlots(b, optArray(ctx, root, 'slots', '') ?? []);
  loadEvents(b, optArray(ctx, root, 'events', '') ?? []);
  loadParameters(b, optArray(ctx, root, 'parameters', '') ?? []);
  loadVariables(b, optArray(ctx, root, 'variables', '') ?? []);
  const tags = optStringArray(ctx, root, 'tags', '') ?? [];
  const skinDefs = optArray(ctx, root, 'skins', '') ?? [];
  loadSkins(b, skinDefs);
  loadMorphs(b, optArray(ctx, root, 'morphs', '') ?? []);
  const animationDefs = optArray(ctx, root, 'animations', '') ?? [];
  // Animation names are needed by drivers (8.2) before the animations are loaded.
  for (const a of animationDefs) if (isObject(a) && typeof a['name'] === 'string') b.animationNames.add(a['name']);
  loadConstraints(b, optArray(ctx, root, 'constraints', '') ?? []);
  linkSkinConstraints(b, skinDefs);
  loadAnimations(b, animationDefs);
  bindDriverAnimations(b);
  checkPlaceholders(b);

  const data = new SkeletonData({
    header, meta, assets, rig, extensionsUsed, extensionsRequired,
    bones: b.bones, slots: b.slots, skins: b.skins, defaultSkin: b.defaultSkin,
    constraints: b.constraints, events: b.events, parameters: b.parameters, morphs: b.morphs,
    variables: b.variables, tags, animations: b.animations,
    warnings: ctx.warnings, missingImages: ctx.missingImages, degraded,
  });
  resolveNestedSkeletons(data, options.skeletons ?? null, { strict: ctx.strict, warnings: ctx.warnings });
  return data;
}

// ---------------------------------------------------------------------------
// Nested skeletons (spec 7.11)
// ---------------------------------------------------------------------------

/** Every `skeleton` attachment of `data`, in skin then placeholder order. */
export function nestedAttachments(data: SkeletonData): SkeletonAttachment[] {
  const out: SkeletonAttachment[] = [];
  for (const skin of data.skins) {
    for (const bySlot of skin.attachments.values()) {
      for (const att of bySlot.values()) {
        if (att instanceof SkeletonAttachment && !out.includes(att)) out.push(att);
      }
    }
  }
  return out;
}

/**
 * Fills `resolvedUri` and `child` on every `skeleton` attachment of `data`
 * (spec 7.11). `source` is a map or a function keyed by the `uri` already
 * joined to `assets.skeletonsBase` (spec 2.8); the plain `uri` is tried too,
 * so a caller that keys its map by the raw `uri` also works.
 *
 * A `uri` that resolves to nothing is L1 with the fallback of spec 2.8: a
 * warning, and the placeholder draws nothing. Called by `loadSkeletonData`,
 * and again by anyone who loads the children after the parent.
 */
export function resolveNestedSkeletons(
  data: SkeletonData,
  source: NestedSkeletonSource | null,
  options: { strict?: boolean; warnings?: LoadWarning[] } = {},
): SkeletonAttachment[] {
  const found: SkeletonAttachment[] = [];
  const lookup = source === null ? null
    : typeof source === 'function' ? source : (uri: string) => source.get(uri);
  for (const att of nestedAttachments(data)) {
    att.resolvedUri = joinUri(data.assets.skeletonsBase, att.uri);
    if (lookup === null) continue;
    const child = lookup(att.resolvedUri) ?? lookup(att.uri) ?? null;
    if (child === null) {
      const problem = {
        pointer: `/skins/.../${att.name}/uri`,
        message: `nested skeleton "${att.resolvedUri}" was not provided; placeholder treated as empty (spec 7.11)`,
      };
      if (options.strict === true) throw new LoadError(problem.pointer, problem.message);
      options.warnings?.push(problem);
      continue;
    }
    att.child = child;
    found.push(att);
  }
  return found;
}

/**
 * Loads only `/animations` of a parsed `.bone`, against a skeleton that is
 * ALREADY loaded, and returns the animations built from it.
 *
 * The timelines point at the very same `BoneData`, `SlotData`, `SkinData` and
 * `ConstraintData` objects the given `SkeletonData` holds, so the result can be
 * handed straight to `SkeletonData.replaceAnimations` and every `Skeleton`
 * already on screen keeps working.
 *
 * WHO NEEDS THIS: an editor. Every key an artist writes changes the file, and
 * reading the whole file again per mouse move would rebuild the skins and the
 * attachments for nothing. Bones, slots, skins and attachments must not have
 * changed since the full load — if they did, load the file properly.
 */
export function loadAnimationsFor(
  data: SkeletonData, json: unknown, options: LoadOptions = {},
): { animations: AnimationData[]; warnings: LoadWarning[] } {
  const ctx = new Context(options);
  const root = expectObject(ctx, json, '');
  const defs = optArray(ctx, root, 'animations', '') ?? [];

  const byName = <T extends { name: string }>(list: readonly T[]): Map<string, T> => {
    // First one wins, the same rule `SkeletonData` uses.
    const map = new Map<string, T>();
    for (const item of list) if (!map.has(item.name)) map.set(item.name, item);
    return map;
  };

  const b: Build = {
    ctx,
    bones: [...data.bones], boneMap: byName(data.bones),
    slots: [...data.slots], slotMap: byName(data.slots),
    skins: [...data.skins], skinMap: byName(data.skins),
    defaultSkin: data.defaultSkin,
    events: [...data.events], eventMap: byName(data.events),
    parameters: [...data.parameters], parameterMap: byName(data.parameters),
    morphs: [...data.morphs], morphMap: byName(data.morphs),
    variables: [...data.variables], variableMap: byName(data.variables),
    constraints: [...data.constraints], constraintMap: byName(data.constraints),
    animations: [], animationMap: new Map(), animationNames: new Set(),
    baseUnmetCode: options.unmetCode ?? null,
    externalAnimations: options.externalAnimations ?? null,
    skeletonsBase: data.assets.skeletonsBase,
  };
  for (const a of defs) if (isObject(a) && typeof a['name'] === 'string') b.animationNames.add(a['name']);

  loadAnimations(b, defs);
  // A driver constraint points at an animation object, and the old one is gone.
  bindDriverAnimations(b);
  return { animations: b.animations, warnings: ctx.warnings };
}

/**
 * L2 `HINT_PLACEHOLDER_MISSING` (spec 7.1): a placeholder named by
 * `slot.attachment` or by a `slot/attachment` timeline key that no skin
 * defines. Not an error (the game may add skins at runtime).
 */
function checkPlaceholders(b: Build): void {
  const ctx = b.ctx;
  const known: Set<string>[] = b.slots.map(() => new Set<string>());
  for (const skin of b.skins) {
    for (const [slotIndex, map] of skin.attachments) {
      const set = known[slotIndex];
      if (set !== undefined) for (const name of map.keys()) set.add(name);
    }
  }
  for (const slot of b.slots) {
    const name = slot.attachmentName;
    if (name !== null && !known[slot.index].has(name)) {
      ctx.warn(ptr('/slots', slot.index, 'attachment'), `placeholder "${name}" is not defined in any skin`);
    }
  }
  for (let a = 0; a < b.animations.length; a++) {
    const timelines = b.animations[a].timelines;
    for (let t = 0; t < timelines.length; t++) {
      const tl = timelines[t];
      if (tl.kind !== 'slot.attachment') continue;
      const values = tl.keys.values;
      for (let k = 0; k < values.length; k++) {
        const name = values[k];
        if (name !== null && !known[tl.slot.index].has(name)) {
          ctx.warn(ptr('/animations', a, 'timelines', t, 'keys', k, 'value'), `placeholder "${name}" is not defined in any skin`);
        }
      }
    }
  }
}

// -- bones (4.2, 4.7) ----------------------------------------------------------

function loadBones(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  if (defs.length === 0) ctx.fail('/bones', 'at least one bone is required');
  const objs = defs.map((d, i) => expectObject(ctx, d, ptr('/bones', i)));
  const names = objs.map((o, i) => reqString(ctx, o, 'name', ptr('/bones', i)));
  const nameIndex = new Map<string, number>();
  names.forEach((n, i) => { if (!nameIndex.has(n)) nameIndex.set(n, i); });

  for (let i = 0; i < objs.length; i++) {
    const o = objs[i] as Record<string, unknown> & BoneDef;
    const p = ptr('/bones', i);
    const name = names[i];
    if (nameIndex.get(name) !== i) ctx.issue(ptr(p, 'name'), `duplicate bone name "${name}"`);

    const parentName = optString(ctx, o, 'parent', p);
    let parent: BoneData | null = null;
    if (i === 0) {
      if (parentName !== undefined) ctx.issue(ptr(p, 'parent'), 'the first bone is the root and must not have a parent; ignored');
    } else if (parentName === undefined) {
      ctx.issue(ptr(p, 'parent'), `bone "${name}" has no parent but is not the first bone (two roots); attached to "${names[0]}"`);
      parent = b.bones[0];
    } else {
      const pi = nameIndex.get(parentName);
      if (pi === undefined) {
        ctx.issue(ptr(p, 'parent'), `parent bone "${parentName}" does not exist; attached to "${names[0]}"`);
        parent = b.bones[0];
      } else if (pi >= i) {
        const cyclic = hasParentCycle(objs, nameIndex, i);
        ctx.issue(ptr(p, 'parent'), cyclic
          ? `parent cycle through bone "${name}"; attached to "${names[0]}"`
          : `parent "${parentName}" comes after bone "${name}" (parents must come first); attached to "${names[0]}"`);
        parent = b.bones[0];
      } else {
        parent = b.bones[pi];
      }
    }

    const inheritRotation = optBoolean(ctx, o, 'inheritRotation', p) ?? true;
    const inheritScale = optBoolean(ctx, o, 'inheritScale', p) ?? true;
    const inheritReflection = optBoolean(ctx, o, 'inheritReflection', p) ?? true;
    // F3: the eight combinations have a formula (5.3). None is reserved.
    const length = optNumber(ctx, o, 'length', p) ?? 0;
    if (length < 0) ctx.issue(ptr(p, 'length'), 'length must be >= 0');

    const bone = new BoneData(i, name, parent, {
      length: Math.max(0, length),
      x: optNumber(ctx, o, 'x', p),
      y: optNumber(ctx, o, 'y', p),
      rotation: optNumber(ctx, o, 'rotation', p),
      scaleX: optNumber(ctx, o, 'scaleX', p),
      scaleY: optNumber(ctx, o, 'scaleY', p),
      shearX: optNumber(ctx, o, 'shearX', p),
      shearY: optNumber(ctx, o, 'shearY', p),
      inheritRotation, inheritScale, inheritReflection,
      skinRequired: optBoolean(ctx, o, 'skinRequired', p),
      color: optColor4(ctx, o, 'color', p),
      icon: optString(ctx, o, 'icon', p) ?? null,
      visible: optBoolean(ctx, o, 'visible', p),
      folder: optString(ctx, o, 'folder', p) ?? null,
    });
    b.bones.push(bone);
    if (!b.boneMap.has(name)) b.boneMap.set(name, bone);
  }
}

function hasParentCycle(objs: Record<string, unknown>[], nameIndex: Map<string, number>, start: number): boolean {
  const seen = new Set<number>();
  let i: number | undefined = start;
  while (i !== undefined) {
    if (seen.has(i)) return true;
    seen.add(i);
    const parentName: unknown = objs[i]['parent'];
    i = typeof parentName === 'string' ? nameIndex.get(parentName) : undefined;
  }
  return false;
}

// -- slots (4.3) ---------------------------------------------------------------

const BLEND_MODES: readonly BlendMode[] = ['normal', 'additive', 'multiply', 'screen'];

function loadSlots(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/slots', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & SlotDef;
    const name = reqString(ctx, o, 'name', p);
    if (b.slotMap.has(name)) ctx.issue(ptr(p, 'name'), `duplicate slot name "${name}"`);
    const boneName = reqString(ctx, o, 'bone', p);
    let bone = b.boneMap.get(boneName);
    if (bone === undefined) {
      ctx.issue(ptr(p, 'bone'), `bone "${boneName}" does not exist; slot attached to "${b.bones[0].name}"`);
      bone = b.bones[0];
    }
    const slot = new SlotData(i, name, bone, {
      attachmentName: optString(ctx, o, 'attachment', p) ?? null,
      color: optColor4(ctx, o, 'color', p),
      darkColor: optColor3(ctx, o, 'darkColor', p) ?? null,
      blend: optEnum(ctx, o, 'blend', p, BLEND_MODES, 'normal'),
      visible: optBoolean(ctx, o, 'visible', p),
      folder: optString(ctx, o, 'folder', p) ?? null,
    });
    b.slots.push(slot);
    if (!b.slotMap.has(name)) b.slotMap.set(name, slot);
  }
}

// -- events (4.5) ----------------------------------------------------------------

function loadEvents(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/events', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & EventDef;
    const name = reqString(ctx, o, 'name', p);
    if (b.eventMap.has(name)) ctx.issue(ptr(p, 'name'), `duplicate event name "${name}"`);
    const audio = optString(ctx, o, 'audio', p);
    if (audio !== undefined) ctx.uri(ptr(p, 'audio'), audio);
    const ev = new EventData(i, name, {
      int: optNumber(ctx, o, 'int', p),
      float: optNumber(ctx, o, 'float', p),
      string: optString(ctx, o, 'string', p),
      audio: audio ?? null,
      volume: optNumber(ctx, o, 'volume', p),
      balance: optNumber(ctx, o, 'balance', p),
    });
    b.events.push(ev);
    if (!b.eventMap.has(name)) b.eventMap.set(name, ev);
  }
}

// -- parameters (8.1) ------------------------------------------------------------

const BONE_NUMERIC_PROPERTIES: readonly BoneNumericProperty[] = ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearX', 'shearY'];
const BONE_INHERIT_PROPERTIES: readonly BoneInheritProperty[] = ['inheritRotation', 'inheritScale', 'inheritReflection'];

function loadParameters(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/parameters', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & ParameterDef;
    const name = reqString(ctx, o, 'name', p);
    if (b.parameterMap.has(name)) ctx.issue(ptr(p, 'name'), `duplicate parameter name "${name}"`);
    const min = optNumber(ctx, o, 'min', p) ?? 0;
    let max = optNumber(ctx, o, 'max', p) ?? 1;
    if (max <= min) {
      // Degenerate range: the parameter is frozen at `min` (DUVIDAS-SPEC 8).
      ctx.issue(ptr(p, 'max'), `max (${max}) must be greater than min (${min}); parameter fixed at min`);
      max = min;
    }
    let def = optNumber(ctx, o, 'default', p) ?? 0;
    if (def < min || def > max) {
      ctx.issue(ptr(p, 'default'), `default ${def} outside [${min}, ${max}]; clamped`);
      def = Math.min(Math.max(def, min), max);
    }
    let source: ParameterSourceData | null = null;
    const so = optObject(ctx, o, 'source', p);
    if (so !== undefined) {
      const sp = ptr(p, 'source');
      const boneName = reqString(ctx, so, 'bone', sp);
      const property = reqString(ctx, so, 'property', sp);
      const bone = b.boneMap.get(boneName);
      const from = optNumber(ctx, so, 'from', sp) ?? 0;
      const to = optNumber(ctx, so, 'to', sp) ?? 1;
      if (bone === undefined) {
        ctx.issue(ptr(sp, 'bone'), `bone "${boneName}" does not exist; source ignored`);
      } else if (!(BONE_NUMERIC_PROPERTIES as readonly string[]).includes(property)) {
        ctx.warn(ptr(sp, 'property'), `unknown property "${property}"; source ignored`);
      } else if (to === from) {
        ctx.issue(ptr(sp, 'to'), 'to must differ from from; source ignored');
      } else {
        source = new ParameterSourceData(bone, property as BoneNumericProperty, from, to);
      }
    }
    const param = new ParameterData(i, name, {
      min, max, default: def,
      repeat: optBoolean(ctx, o, 'repeat', p),
      group: optString(ctx, o, 'group', p) ?? null,
      displayName: optString(ctx, o, 'displayName', p) ?? null,
      source,
    });
    b.parameters.push(param);
    if (!b.parameterMap.has(name)) b.parameterMap.set(name, param);
  }
}

// -- variables (8.4) --------------------------------------------------------------

const VARIABLE_TYPES: readonly VariableType[] = ['float', 'int', 'string', 'bool'];

function loadVariables(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/variables', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & VariableDef;
    const name = reqString(ctx, o, 'name', p);
    const type = reqString(ctx, o, 'type', p);
    if (!(VARIABLE_TYPES as readonly string[]).includes(type)) {
      ctx.warn(ptr(p, 'type'), `unknown variable type "${type}"; variable ignored`);
      continue;
    }
    if (b.variableMap.has(name)) ctx.issue(ptr(p, 'name'), `duplicate variable name "${name}"`);
    let def: VariableValue | undefined = o['default'] as VariableValue | undefined;
    if (def !== undefined && !variableValueMatches(type as VariableType, def)) {
      ctx.issue(ptr(p, 'default'), `default does not match type "${type}"; using the type default`);
      def = undefined;
    }
    if (type === 'int' && typeof def === 'number') def = Math.trunc(def);
    const v = new VariableData(b.variables.length, name, type as VariableType, def);
    b.variables.push(v);
    if (!b.variableMap.has(name)) b.variableMap.set(name, v);
  }
}

function variableValueMatches(type: VariableType, value: unknown): value is VariableValue {
  switch (type) {
    case 'float': case 'int': return typeof value === 'number' && Number.isFinite(value);
    case 'string': return typeof value === 'string';
    case 'bool': return typeof value === 'boolean';
  }
}

// -- skins and attachments (4.4, 7) ----------------------------------------------

interface PendingLinkedMesh {
  skin: SkinData;
  slot: SlotData;
  name: string;
  def: Record<string, unknown> & LinkedMeshAttachmentDefLike;
  pointer: string;
}

interface LinkedMeshAttachmentDefLike {
  parent?: unknown;
  skin?: unknown;
}

function loadSkins(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  const objs: (Record<string, unknown> & SkinDef)[] = [];
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/skins', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & SkinDef;
    const name = reqString(ctx, o, 'name', p);
    if (b.skinMap.has(name)) {
      ctx.issue(ptr(p, 'name'), `duplicate skin name "${name}"; ignored`);
      objs.push(o);
      continue;
    }
    const skin = new SkinData(b.skins.length, name, optString(ctx, o, 'displayName', p) ?? null);
    b.skins.push(skin);
    b.skinMap.set(name, skin);
    objs.push(o);
  }
  let defaultSkin = b.skinMap.get('default');
  if (defaultSkin === undefined) {
    defaultSkin = new SkinData(b.skins.length, 'default');
    b.skins.push(defaultSkin);
    b.skinMap.set('default', defaultSkin);
  }
  b.defaultSkin = defaultSkin;

  // includes and bones
  for (let i = 0; i < objs.length; i++) {
    const o = objs[i];
    const p = ptr('/skins', i);
    const skin = b.skinMap.get(o.name as string);
    if (skin === undefined || skin.index !== indexOfSkinObj(b, objs, i)) continue;
    const includes = optStringArray(ctx, o, 'includes', p) ?? [];
    for (let j = 0; j < includes.length; j++) {
      const inc = b.skinMap.get(includes[j]);
      if (inc === undefined) {
        ctx.issue(ptr(p, 'includes', j), `skin "${includes[j]}" does not exist; ignored`);
        continue;
      }
      if (inc === skin) {
        ctx.issue(ptr(p, 'includes', j), 'a skin cannot include itself; ignored');
        continue;
      }
      skin.includes.push(inc);
    }
    const bones = optStringArray(ctx, o, 'bones', p) ?? [];
    for (let j = 0; j < bones.length; j++) {
      const bone = b.boneMap.get(bones[j]);
      if (bone === undefined) {
        ctx.issue(ptr(p, 'bones', j), `bone "${bones[j]}" does not exist; ignored`);
        continue;
      }
      if (!bone.skinRequired) ctx.warn(ptr(p, 'bones', j), `bone "${bones[j]}" is not skinRequired`);
      skin.bones.push(bone);
    }
    // drawOrder (spec 4.4): offsets applied while the skin is active
    const drawOrder = optArray(ctx, o, 'drawOrder', p);
    if (drawOrder !== undefined) {
      const dp = ptr(p, 'drawOrder');
      for (let j = 0; j < drawOrder.length; j++) {
        const ep = ptr(dp, j);
        const e = expectObject(ctx, drawOrder[j], ep) as Record<string, unknown>;
        const slotName = reqString(ctx, e, 'slot', ep);
        const offset = reqNumber(ctx, e, 'offset', ep);
        const slot = b.slotMap.get(slotName);
        if (slot === undefined) { ctx.issue(ptr(ep, 'slot'), `slot "${slotName}" does not exist; entry ignored`); continue; }
        skin.drawOrder.push({ slot, offset: Math.trunc(offset) });
      }
    }
  }
  // include cycles (L1): detect and cut every cycle through each skin
  for (const skin of b.skins) {
    while (reachesItself(skin, skin, new Set())) {
      const idx = skin.includes.findIndex((inc) => reachesItself(inc, skin, new Set()));
      if (idx < 0) break;
      ctx.issue(ptr('/skins', skin.index, 'includes'), `skin include cycle through "${skin.name}" via "${skin.includes[idx].name}"; cut`);
      skin.includes.splice(idx, 1);
    }
  }

  // attachments: two passes so linked meshes find their parents
  const pending: PendingLinkedMesh[] = [];
  for (let i = 0; i < objs.length; i++) {
    const o = objs[i];
    const p = ptr('/skins', i);
    const skin = b.skinMap.get(o.name as string);
    if (skin === undefined || skin.index !== indexOfSkinObj(b, objs, i)) continue;
    const attachments = optObject(ctx, o, 'attachments', p);
    if (attachments === undefined) continue;
    for (const slotName of Object.keys(attachments)) {
      const sp = ptr(p, 'attachments', slotName);
      const slot = b.slotMap.get(slotName);
      if (slot === undefined) {
        ctx.issue(sp, `slot "${slotName}" does not exist; attachments ignored`);
        continue;
      }
      const placeholders = expectObject(ctx, attachments[slotName], sp);
      for (const placeholder of Object.keys(placeholders)) {
        const ap = ptr(sp, placeholder);
        const value = placeholders[placeholder];
        if (value === null) {
          skin.setAttachment(slot.index, placeholder, null);
          continue;
        }
        const def = expectObject(ctx, value, ap);
        const type = reqString(ctx, def, 'type', ap);
        if (type === 'linkedmesh') {
          pending.push({ skin, slot, name: placeholder, def: def as PendingLinkedMesh['def'], pointer: ap });
          continue;
        }
        const att = loadAttachment(b, def as Record<string, unknown> & AttachmentDef, placeholder, ap);
        skin.setAttachment(slot.index, placeholder, att);
      }
    }
  }
  for (const item of pending) {
    const att = loadLinkedMesh(b, item);
    item.skin.setAttachment(item.slot.index, item.name, att);
  }
}

/** Index the skin created from `objs[i]` received, or -1 for ignored duplicates. */
function indexOfSkinObj(b: Build, objs: (Record<string, unknown> & SkinDef)[], i: number): number {
  const name = objs[i].name as string;
  for (let j = 0; j < i; j++) if ((objs[j].name as string) === name) return -1;
  return b.skinMap.get(name)?.index ?? -1;
}

function reachesItself(current: SkinData, target: SkinData, visited: Set<SkinData>): boolean {
  if (visited.has(current)) return false;
  visited.add(current);
  for (const inc of current.includes) {
    if (inc === target) return true;
    if (reachesItself(inc, target, visited)) return true;
  }
  return false;
}

/** Reads `vertices` xor `binding` (spec 7.4). Returns `null` when neither is usable. */
function loadVertexSource(b: Build, o: Record<string, unknown>, p: string, minVertices: number): { vertices: number[] | null; binding: BindingData | null } | null {
  const ctx = b.ctx;
  const vertices = optNumberArray(ctx, o, 'vertices', p) ?? null;
  const bindingObj = optObject(ctx, o, 'binding', p);
  if (vertices === null && bindingObj === undefined) {
    ctx.issue(p, 'one of "vertices" or "binding" is required; attachment ignored');
    return null;
  }
  if (vertices !== null && bindingObj !== undefined) {
    ctx.issue(p, 'only one of "vertices" or "binding" is allowed; using "binding"');
  }
  if (bindingObj !== undefined) {
    const bp = ptr(p, 'binding');
    const bd = bindingObj as Record<string, unknown> & BindingDef;
    const counts = reqNumberArray(ctx, bd, 'counts', bp);
    const bones = reqNumberArray(ctx, bd, 'bones', bp);
    const positions = reqNumberArray(ctx, bd, 'positions', bp);
    const weights = reqNumberArray(ctx, bd, 'weights', bp);
    let total = 0;
    for (let i = 0; i < counts.length; i++) {
      if (!Number.isInteger(counts[i]) || counts[i] < 1) {
        ctx.issue(ptr(bp, 'counts', i), 'each vertex needs at least one influence; attachment ignored');
        return null;
      }
      total += counts[i];
    }
    if (bones.length !== total || weights.length !== total || positions.length !== total * 2) {
      ctx.issue(bp, `binding sizes do not match counts (sum ${total}); attachment ignored`);
      return null;
    }
    for (let i = 0; i < bones.length; i++) {
      if (!Number.isInteger(bones[i]) || bones[i] < 0 || bones[i] >= b.bones.length) {
        ctx.issue(ptr(bp, 'bones', i), `bone index ${bones[i]} out of range; attachment ignored`);
        return null;
      }
    }
    let j = 0;
    for (let v = 0; v < counts.length; v++) {
      let sum = 0;
      for (let k = 0; k < counts[v]; k++, j++) sum += weights[j];
      if (Math.abs(sum - 1) > 1e-4) ctx.issue(ptr(bp, 'weights'), `weights of vertex ${v} sum to ${sum}, expected 1 (used as written)`);
    }
    if (counts.length < minVertices) {
      ctx.issue(bp, `at least ${minVertices} vertices are required; attachment ignored`);
      return null;
    }
    return { vertices: null, binding: new BindingData(counts, bones, positions, weights) };
  }
  const verts = vertices as number[];
  if (verts.length % 2 !== 0) {
    ctx.issue(ptr(p, 'vertices'), 'vertices must hold x, y pairs; attachment ignored');
    return null;
  }
  if (verts.length / 2 < minVertices) {
    ctx.issue(ptr(p, 'vertices'), `at least ${minVertices} vertices are required; attachment ignored`);
    return null;
  }
  return { vertices: verts, binding: null };
}

function loadSequence(b: Build, o: Record<string, unknown>, p: string, path: string): SequenceData | null {
  const ctx = b.ctx;
  const so = optObject(ctx, o, 'sequence', p);
  if (so === undefined) return null;
  const sp = ptr(p, 'sequence');
  const sd = so as Record<string, unknown> & SequenceDef;
  const frames = optStringArray(ctx, sd, 'frames', sp);
  const count = optNumber(ctx, sd, 'count', sp);
  const start = optNumber(ctx, sd, 'start', sp) ?? 1;
  const digits = optNumber(ctx, sd, 'digits', sp) ?? 0;
  let names: string[];
  if (frames !== undefined) {
    names = frames;
  } else if (count !== undefined && count >= 1) {
    names = SequenceData.frameNames(path, Math.trunc(count), start, digits);
  } else {
    ctx.issue(sp, 'one of "count" (>= 1) or "frames" is required; sequence ignored');
    return null;
  }
  if (names.length === 0) {
    ctx.issue(sp, 'sequence needs at least one frame; sequence ignored');
    return null;
  }
  let setup = optNumber(ctx, sd, 'setup', sp) ?? 0;
  if (setup < 0 || setup >= names.length) {
    ctx.issue(ptr(sp, 'setup'), `setup ${setup} outside 0..${names.length - 1}; using 0`);
    setup = 0;
  }
  const seq = new SequenceData(names, start, digits, Math.trunc(setup));
  for (let i = 0; i < names.length; i++) {
    // Generated names have no `frames` in the file: point at `path` instead (spec 7.10).
    const fp = frames !== undefined ? ptr(sp, 'frames', i) : ptr(p, 'path');
    if (!ctx.imageName(fp, names[i])) continue; // refused name: frame stays invisible (spec 7.2)
    if (ctx.atlases === null) continue;
    const r = findAtlasRegion(ctx.atlases, names[i]);
    if (r === null) ctx.missingImage(fp, names[i]);
    seq.regions[i] = r;
  }
  return seq;
}

function resolveImage(b: Build, p: string, name: string): AtlasRegionData | null {
  const ctx = b.ctx;
  if (!ctx.imageName(ptr(p, 'path'), name)) return null;
  if (ctx.atlases === null) return null;
  const r = findAtlasRegion(ctx.atlases, name);
  if (r === null) ctx.missingImage(ptr(p, 'path'), name);
  return r;
}

const BOUNDING_BOX_SHAPES = ['polygon', 'rectangle', 'ellipse'] as const;

/** Types whose `path` names an image (spec 7.2); elsewhere `path` is ignored (L2). */
// `BONE_particle` carries a `path` too: the emitter's image (extension 9.8).
const PATH_TYPES = ['region', 'mesh', 'linkedmesh', PARTICLE_ATTACHMENT_TYPE];

function loadAttachment(b: Build, o: Record<string, unknown> & AttachmentDef, name: string, p: string): Attachment | null {
  const ctx = b.ctx;
  const color = optColor4(ctx, o, 'color', p);
  const type = o.type as string;
  if (!PATH_TYPES.includes(type) && o['path'] !== undefined) ctx.warn(ptr(p, 'path'), `"path" is ignored on a "${type}" attachment`);
  switch (type) {
    case 'region': {
      const path = optString(ctx, o, 'path', p) ?? name;
      const att = new RegionAttachment(name, {
        path, color,
        x: optNumber(ctx, o, 'x', p), y: optNumber(ctx, o, 'y', p),
        rotation: optNumber(ctx, o, 'rotation', p),
        scaleX: optNumber(ctx, o, 'scaleX', p), scaleY: optNumber(ctx, o, 'scaleY', p),
        width: optNumber(ctx, o, 'width', p), height: optNumber(ctx, o, 'height', p),
        sequence: loadSequence(b, o, p, path),
      });
      att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
      return att;
    }
    case 'mesh': {
      const path = optString(ctx, o, 'path', p) ?? name;
      const src = loadVertexSource(b, o, p, 3);
      if (src === null) return null;
      const n = src.binding !== null ? src.binding.counts.length : (src.vertices as number[]).length / 2;
      const uvs = reqNumberArray(ctx, o, 'uvs', p);
      if (uvs.length !== n * 2) {
        ctx.issue(ptr(p, 'uvs'), `uvs has ${uvs.length} numbers, expected ${n * 2}; attachment ignored`);
        return null;
      }
      const triangles = reqNumberArray(ctx, o, 'triangles', p);
      if (triangles.length < 3 || triangles.length % 3 !== 0) {
        ctx.issue(ptr(p, 'triangles'), 'triangles must hold at least one triple of indices; attachment ignored');
        return null;
      }
      for (let i = 0; i < triangles.length; i++) {
        if (!Number.isInteger(triangles[i]) || triangles[i] < 0 || triangles[i] >= n) {
          ctx.issue(ptr(p, 'triangles', i), `vertex index ${triangles[i]} out of range; attachment ignored`);
          return null;
        }
      }
      let hull = optNumber(ctx, o, 'hull', p) ?? n;
      if (hull < 1 || hull > n) {
        ctx.issue(ptr(p, 'hull'), `hull ${hull} outside 1..${n}; clamped`);
        hull = Math.min(Math.max(hull, 1), n);
      }
      const att = new MeshAttachment(name, {
        path, color, vertices: src.vertices, binding: src.binding, uvs, triangles, hull: Math.trunc(hull),
        edges: optNumberArray(ctx, o, 'edges', p),
        width: optNumber(ctx, o, 'width', p), height: optNumber(ctx, o, 'height', p),
        sequence: loadSequence(b, o, p, path),
      });
      att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
      return att;
    }
    case 'boundingbox': {
      const shapeName = optString(ctx, o, 'shape', p) ?? 'polygon';
      if (!(BOUNDING_BOX_SHAPES as readonly string[]).includes(shapeName)) {
        ctx.warn(ptr(p, 'shape'), `unknown shape "${shapeName}"; attachment ignored`);
        return null;
      }
      const shape = shapeName as (typeof BOUNDING_BOX_SHAPES)[number];
      if (shape === 'polygon') {
        const src = loadVertexSource(b, o, p, 3);
        if (src === null) return null;
        return new BoundingBoxAttachment(name, { color, shape, vertices: src.vertices, binding: src.binding });
      }
      const width = optNumber(ctx, o, 'width', p);
      const height = optNumber(ctx, o, 'height', p);
      if (width === undefined || height === undefined) {
        ctx.issue(p, `"${shape}" needs width and height; attachment ignored`);
        return null;
      }
      return new BoundingBoxAttachment(name, {
        color, shape, width, height,
        x: optNumber(ctx, o, 'x', p), y: optNumber(ctx, o, 'y', p), rotation: optNumber(ctx, o, 'rotation', p),
      });
    }
    case 'clipping': {
      const src = loadVertexSource(b, o, p, 3);
      if (src === null) return null;
      let endSlot: SlotData | null = null;
      const endName = optString(ctx, o, 'end', p);
      if (endName !== undefined) {
        endSlot = b.slotMap.get(endName) ?? null;
        if (endSlot === null) ctx.issue(ptr(p, 'end'), `slot "${endName}" does not exist; ignored`);
      }
      let slots: SlotData[] | null = null;
      const slotNames = optStringArray(ctx, o, 'slots', p);
      if (slotNames !== undefined) {
        slots = [];
        for (let i = 0; i < slotNames.length; i++) {
          const s = b.slotMap.get(slotNames[i]);
          if (s === undefined) ctx.issue(ptr(p, 'slots', i), `slot "${slotNames[i]}" does not exist; ignored`);
          else slots.push(s);
        }
      }
      const clip = new ClippingAttachment(name, {
        color, vertices: src.vertices, binding: src.binding, endSlot, slots, invert: optBoolean(ctx, o, 'invert', p),
      });
      // Spec 7.7: the polygon must not cross itself (L2 when detected). Only an
      // unweighted polygon is checked: with a binding the shape depends on the
      // pose, and a warning that guesses is worse than none (rule 21).
      if (src.binding === null) {
        const crossing = selfIntersection(src.vertices as ArrayLike<number>);
        if (crossing !== null) {
          ctx.warn(ptr(p, 'vertices'), `CLIP_SELF_INTERSECT: the clipping polygon crosses itself (edges ${crossing[0]} and ${crossing[1]}); the cut may not be what was drawn (spec 7.7)`);
        }
      }
      return clip;
    }
    case 'path': {
      const src = loadVertexSource(b, o, p, 6);
      if (src === null) return null;
      const n = src.binding !== null ? src.binding.counts.length : (src.vertices as number[]).length / 2;
      if (n % 3 !== 0) {
        ctx.issue(p, `a path needs 3 points per anchor (got ${n} points); attachment ignored`);
        return null;
      }
      const closed = optBoolean(ctx, o, 'closed', p) ?? false;
      const lengths = reqNumberArray(ctx, o, 'lengths', p);
      const curves = closed ? n / 3 : n / 3 - 1;
      if (lengths.length !== curves) ctx.issue(ptr(p, 'lengths'), `lengths has ${lengths.length} entries, expected ${curves}`);
      return new PathAttachment(name, {
        color, vertices: src.vertices, binding: src.binding, closed,
        constantSpeed: optBoolean(ctx, o, 'constantSpeed', p), lengths,
      });
    }
    case 'point':
      return new PointAttachment(name, {
        color, x: optNumber(ctx, o, 'x', p), y: optNumber(ctx, o, 'y', p), rotation: optNumber(ctx, o, 'rotation', p),
      });
    case 'skeleton': {
      const uri = reqString(ctx, o, 'uri', p);
      const problem = validateUri(uri);
      if (problem !== null) {
        ctx.issue(ptr(p, 'uri'), `invalid uri "${uri}": ${problem}; placeholder treated as empty`);
        return null;
      }
      return new SkeletonAttachment(name, {
        color, uri,
        skins: optStringArray(ctx, o, 'skins', p),
        animation: optString(ctx, o, 'animation', p) ?? null,
        loop: optBoolean(ctx, o, 'loop', p), timeScale: optNumber(ctx, o, 'timeScale', p),
        x: optNumber(ctx, o, 'x', p), y: optNumber(ctx, o, 'y', p), rotation: optNumber(ctx, o, 'rotation', p),
        scaleX: optNumber(ctx, o, 'scaleX', p), scaleY: optNumber(ctx, o, 'scaleY', p),
        inheritColor: optBoolean(ctx, o, 'inheritColor', p),
        inheritAnimation: optBoolean(ctx, o, 'inheritAnimation', p),
        baseAnimation: optString(ctx, o, 'baseAnimation', p) ?? null,
        around: optString(ctx, o, 'around', p) ?? null,
      });
    }
    case PARTICLE_ATTACHMENT_TYPE:
      return loadParticle(b, o, name, p);
    default:
      ctx.warn(ptr(p, 'type'), `unknown attachment type "${type}"; placeholder treated as empty`);
      return null;
  }
}

/**
 * `BONE_particle` — the emitter of the `BONE_particles` extension.
 *
 * Every field of extension 9 is read once here, with the defaults of that
 * section, and the five unknown-value rules of extension 7.4 are applied
 * exactly as written: four of them fall back to a declared default AND warn,
 * and `shape` — the only one that would change the whole picture — does NOT
 * fall back. A shape this reader does not know means the emitter is not drawn
 * and the warning says so, because inventing a point at the origin is a guess
 * the user has no way of noticing (house rule 21).
 */
function loadParticle(b: Build, o: Record<string, unknown>, name: string, p: string): Attachment {
  const ctx = b.ctx;
  const path = optString(ctx, o, 'path', p) ?? name;

  /** One of the four enums that DO have a declared default: fall back and warn. */
  const enumField = <T extends string>(key: string, allowed: readonly T[], fallback: T): T => {
    const raw = optString(ctx, o, key, p);
    if (raw === undefined) return fallback;
    if ((allowed as readonly string[]).includes(raw)) return raw as T;
    ctx.warn(ptr(p, key), `unknown ${key} "${raw}"; using "${fallback}"`);
    return fallback;
  };

  // `shape` is the exception of extension 7.4: no silent default.
  let shape: ParticleShape = 'point';
  let shapeKnown = true;
  const rawShape = optString(ctx, o, 'shape', p);
  if (rawShape !== undefined) {
    if ((PARTICLE_SHAPES as readonly string[]).includes(rawShape)) shape = rawShape as ParticleShape;
    else {
      shapeKnown = false;
      ctx.warn(ptr(p, 'shape'), `unknown particle shape "${rawShape}"; emitter "${name}" is NOT drawn (extension BONE_particles 7.4)`);
    }
  }

  const bursts: ParticleBurst[] = [];
  const burstList = optArray(ctx, o, 'bursts', p);
  if (burstList !== undefined) {
    for (let i = 0; i < burstList.length; i++) {
      const bp = ptr(p, 'bursts', i);
      const raw = expectObject(ctx, burstList[i], bp);
      const interval = optNumber(ctx, raw, 'interval', bp) ?? 1;
      bursts.push({
        time: optNumber(ctx, raw, 'time', bp) ?? 0,
        count: Math.max(1, Math.trunc(optNumber(ctx, raw, 'count', bp) ?? 1)),
        cycles: Math.max(1, Math.trunc(optNumber(ctx, raw, 'cycles', bp) ?? 1)),
        interval: interval > 0 ? interval : 1,
        probability: optNumber(ctx, raw, 'probability', bp) ?? 1,
      });
    }
  }

  // L1 RANGE_PARTICLE_RATE (extension 4.2): a negative rate becomes 0 BEFORE
  // anything is integrated, so no index is ever born from it.
  let rate = optNumber(ctx, o, 'rate', p) ?? 10;
  if (rate < 0) {
    ctx.issue(ptr(p, 'rate'), `RANGE_PARTICLE_RATE: rate ${rate} is negative; using 0`);
    rate = 0;
  }

  const looping = optBoolean(ctx, o, 'looping', p) ?? true;
  const prewarm = optNumber(ctx, o, 'prewarm', p) ?? 0;
  // Extension 6: with the loop on, `prewarm` is ignored — the loop already
  // fills the emitter — and the reader SHOULD say so once.
  if (looping && prewarm > 0) {
    ctx.warn(ptr(p, 'prewarm'), 'prewarm only applies with looping: false; ignored');
  }

  const att = new ParticleAttachment(name, {
    color: optColor4(ctx, o, 'color', p), path,
    // Extension 9.10: where the emitter is in its bone, like a `region`.
    x: optNumber(ctx, o, 'x', p),
    y: optNumber(ctx, o, 'y', p),
    rotation: optNumber(ctx, o, 'rotation', p),
    emitting: optBoolean(ctx, o, 'emitting', p),
    rate,
    bursts,
    explosiveness: optNumber(ctx, o, 'explosiveness', p),
    duration: optNumber(ctx, o, 'duration', p),
    randomness: optNumber(ctx, o, 'randomness', p),
    startDelay: optNumber(ctx, o, 'startDelay', p),
    lifetime: optNumberArray(ctx, o, 'lifetime', p),
    maxParticles: optNumber(ctx, o, 'maxParticles', p),
    speed: optNumberArray(ctx, o, 'speed', p),
    direction: optNumber(ctx, o, 'direction', p),
    spread: optNumber(ctx, o, 'spread', p),
    spherizeDirection: optNumber(ctx, o, 'spherizeDirection', p),
    alignToVelocity: optBoolean(ctx, o, 'alignToVelocity', p),
    shape, shapeKnown,
    radius: optNumber(ctx, o, 'radius', p),
    radiusThickness: optNumber(ctx, o, 'radiusThickness', p),
    arc: optNumber(ctx, o, 'arc', p),
    size: optNumberArray(ctx, o, 'size', p),
    edge: optNumberArray(ctx, o, 'edge', p),
    mesh: optString(ctx, o, 'mesh', p) ?? null,
    meshMode: enumField('meshMode', PARTICLE_MESH_MODES, 'vertex'),
    curve: optString(ctx, o, 'curve', p) ?? null,
    gravity: optNumberArray(ctx, o, 'gravity', p),
    drag: optNumber(ctx, o, 'drag', p),
    angle: optNumberArray(ctx, o, 'angle', p),
    angularVelocity: optNumberArray(ctx, o, 'angularVelocity', p),
    scale: optNumberArray(ctx, o, 'scale', p),
    scaleOverLifetime: loadOverLifetime(b, o, 'scaleOverLifetime', p, readOverLifetimeNumber),
    startColor: optArray(ctx, o, 'startColor', p) as ArrayLike<number>[] | undefined,
    colorOverLifetime: loadOverLifetime(b, o, 'colorOverLifetime', p, readOverLifetimeColor),
    alphaOverLifetime: loadOverLifetime(b, o, 'alphaOverLifetime', p, readOverLifetimeNumber),
    sequence: loadSequence(b, o, p, path),
    frameMode: enumField('frameMode', PARTICLE_FRAME_MODES, 'lifetime'),
    cycles: optNumber(ctx, o, 'cycles', p),
    fps: optNumber(ctx, o, 'fps', p),
    startFrame: optNumberArray(ctx, o, 'startFrame', p),
    space: enumField('space', PARTICLE_SPACES, 'local'),
    seed: optNumber(ctx, o, 'seed', p),
    looping, prewarm,
    sortMode: enumField('sortMode', PARTICLE_SORT_MODES, 'youngestInFront'),
  });
  att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
  return att;
}

function readOverLifetimeNumber(ctx: Context, value: unknown, p: string): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    ctx.issue(p, 'over-lifetime value must be a number; key ignored');
    return undefined;
  }
  return value;
}

function readOverLifetimeColor(ctx: Context, value: unknown, p: string): Float64Array | undefined {
  if (!Array.isArray(value) || value.length < 4) {
    ctx.issue(p, 'over-lifetime color must be four numbers; key ignored');
    return undefined;
  }
  return new Float64Array([value[0] as number, value[1] as number, value[2] as number, value[3] as number]);
}

/**
 * `scaleOverLifetime`, `colorOverLifetime` and `alphaOverLifetime` (extension
 * 9.6, 9.7): the key format of spec 9.2 and 9.3 with `time` in `0..1` of the
 * life instead of seconds. Nothing about keys is reinvented here.
 */
function loadOverLifetime<T>(
  b: Build, o: Record<string, unknown>, key: string, p: string,
  read: (ctx: Context, value: unknown, pointer: string) => T | undefined,
): OverLifetimeKey<T>[] | null {
  const ctx = b.ctx;
  const list = optArray(ctx, o, key, p);
  if (list === undefined) return null;
  const out: OverLifetimeKey<T>[] = [];
  for (let i = 0; i < list.length; i++) {
    const kp = ptr(p, key, i);
    const raw = expectObject(ctx, list[i], kp);
    const time = optNumber(ctx, raw, 'time', kp) ?? 0;
    const value = read(ctx, raw['value'], ptr(kp, 'value'));
    if (value === undefined) continue;
    const curve = raw['curve'];
    out.push({
      time,
      value,
      curve: typeof curve === 'string' || Array.isArray(curve) ? (curve as string | number[]) : 'linear',
    });
  }
  out.sort((a, c) => a.time - c.time);
  return out;
}

function loadLinkedMesh(b: Build, item: PendingLinkedMesh): Attachment | null {
  const ctx = b.ctx;
  const { def: o, pointer: p, name, slot } = item;
  const parentName = reqString(ctx, o, 'parent', p);
  const skinName = optString(ctx, o, 'skin', p) ?? 'default';
  const parentSkin = b.skinMap.get(skinName);
  if (parentSkin === undefined) {
    ctx.issue(ptr(p, 'skin'), `skin "${skinName}" does not exist; linked mesh ignored`);
    return null;
  }
  const parent = parentSkin.getAttachment(slot.index, parentName);
  if (!(parent instanceof MeshAttachment)) {
    ctx.issue(ptr(p, 'parent'), `parent "${parentName}" is not a mesh in skin "${skinName}" of slot "${slot.name}"; linked mesh ignored`);
    return null;
  }
  const path = optString(ctx, o, 'path', p) ?? name;
  const att = new LinkedMeshAttachment(name, parent, {
    path, color: optColor4(ctx, o, 'color', p), skin: skinName,
    inheritDeform: optBoolean(ctx, o, 'inheritDeform', p),
    width: optNumber(ctx, o, 'width', p), height: optNumber(ctx, o, 'height', p),
    sequence: loadSequence(b, o, p, path),
  });
  att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
  return att;
}

// -- morphs (8.3) -----------------------------------------------------------------

function loadMorphs(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/morphs', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & MorphDef;
    const name = reqString(ctx, o, 'name', p);
    if (b.morphMap.has(name)) ctx.issue(ptr(p, 'name'), `duplicate morph name "${name}"`);
    const min = optNumber(ctx, o, 'min', p) ?? 0;
    const max = optNumber(ctx, o, 'max', p) ?? 1;
    if (max <= min) ctx.issue(ptr(p, 'max'), `max (${max}) must be greater than min (${min})`);
    const morph = new MorphData(b.morphs.length, name, {
      weight: optNumber(ctx, o, 'weight', p), min, max, group: optString(ctx, o, 'group', p) ?? null,
    });
    const targets = optArray(ctx, o, 'targets', p) ?? [];
    if (targets.length === 0) ctx.issue(ptr(p, 'targets'), 'a morph needs at least one target');
    for (let j = 0; j < targets.length; j++) {
      const tp = ptr(p, 'targets', j);
      const t = expectObject(ctx, targets[j], tp);
      const slotName = reqString(ctx, t, 'slot', tp);
      const attName = reqString(ctx, t, 'attachment', tp);
      const skinName = optString(ctx, t, 'skin', tp) ?? 'default';
      const offsets = reqNumberArray(ctx, t, 'offsets', tp);
      const slot = b.slotMap.get(slotName);
      const skin = b.skinMap.get(skinName);
      if (slot === undefined) { ctx.issue(ptr(tp, 'slot'), `slot "${slotName}" does not exist; target ignored`); continue; }
      if (skin === undefined) { ctx.issue(ptr(tp, 'skin'), `skin "${skinName}" does not exist; target ignored`); continue; }
      const att = skin.getAttachment(slot.index, attName);
      if (!(att instanceof MeshAttachment)) {
        ctx.issue(ptr(tp, 'attachment'), `"${attName}" is not a mesh in skin "${skinName}" of slot "${slotName}"; target ignored`);
        continue;
      }
      let offs = offsets;
      if (offs.length > att.deformLength) {
        ctx.issue(ptr(tp, 'offsets'), `offsets has ${offs.length} numbers, more than the deform layout (${att.deformLength}); truncated`);
        offs = offs.slice(0, att.deformLength);
      }
      const target = new MorphTargetData(slot, skin, att, offs);
      morph.targets.push(target);
      att.morphInfluences.push({ morph, offsets: target.offsets });
    }
    b.morphs.push(morph);
    if (!b.morphMap.has(name)) b.morphMap.set(name, morph);
  }
}

// -- constraints (6, 8.2) -----------------------------------------------------------

const POSITION_MODES: readonly PathPositionMode[] = ['fixed', 'percent'];
const SPACING_MODES: readonly PathSpacingMode[] = ['length', 'fixed', 'percent', 'proportional'];
const ROTATE_MODES: readonly PathRotateMode[] = ['tangent', 'chain', 'chainScale'];
const DRIVER_MODES: readonly DriverMode[] = ['replace', 'add'];

function resolveBoneList(b: Build, o: Record<string, unknown>, p: string, min: number, max: number): BoneData[] | null {
  const ctx = b.ctx;
  const names = optStringArray(ctx, o, 'bones', p);
  if (names === undefined) { ctx.issue(ptr(p, 'bones'), 'bones is required; constraint ignored'); return null; }
  if (names.length < min || names.length > max) {
    ctx.issue(ptr(p, 'bones'), `expected ${min}..${max} bones, got ${names.length}; constraint ignored`);
    return null;
  }
  const bones: BoneData[] = [];
  for (let i = 0; i < names.length; i++) {
    const bone = b.boneMap.get(names[i]);
    if (bone === undefined) { ctx.issue(ptr(p, 'bones', i), `bone "${names[i]}" does not exist; constraint ignored`); return null; }
    bones.push(bone);
  }
  return bones;
}

function isDescendant(bone: BoneData, ancestor: BoneData): boolean {
  for (let p = bone.parent; p !== null; p = p.parent) if (p === ancestor) return true;
  return false;
}

/** A driver held back for the second pass of `loadConstraints`. */
type DeferredDriver = {
  readonly deferred: true;
  readonly o: Record<string, unknown> & ConstraintDef;
  readonly p: string;
  readonly name: string;
  readonly common: Common;
};

/**
 * Loads the `constraints` array (spec 6) in two passes: every other type
 * first, drivers after. A driver target may name a constraint declared
 * *later* in the array — spec 8.2 calls that the useful case (driving the
 * `mix` of an IK), and a single pass would drop it. The array order (which is
 * the application order of 5.6) is preserved; only the resolution is deferred.
 *
 * A driver naming a driver declared after it is still dropped: drivers are
 * resolved in file order.
 */
function loadConstraints(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  const slots: (ConstraintData | DeferredDriver)[] = [];
  const names = new Set<string>();
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/constraints', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & ConstraintDef;
    const type = reqString(ctx, o, 'type', p);
    const name = reqString(ctx, o, 'name', p);
    if (names.has(name)) ctx.issue(ptr(p, 'name'), `duplicate constraint name "${name}"`);
    const common = { mix: optNumber(ctx, o, 'mix', p), skinRequired: optBoolean(ctx, o, 'skinRequired', p) };
    const index = slots.length;
    let c: ConstraintData | null = null;
    switch (type) {
      case 'ik': c = loadIk(b, o, p, index, name, common); break;
      case 'transform': c = loadTransform(b, o, p, index, name, common); break;
      case 'path': c = loadPath(b, o, p, index, name, common); break;
      case 'physics': c = loadPhysics(b, o, p, index, name, common); break;
      case 'driver':
        names.add(name);
        slots.push({ deferred: true, o, p, name, common });
        continue;
      default:
        ctx.warn(ptr(p, 'type'), `unknown constraint type "${type}"; constraint ignored`);
    }
    if (c === null) continue;
    names.add(name);
    slots.push(c);
    if (!b.constraintMap.has(name)) b.constraintMap.set(name, c);
  }

  // Second pass: the drivers, in file order, now that every other constraint
  // is in `constraintMap`.
  for (const s of slots) {
    if (s instanceof ConstraintData) {
      b.constraints.push(s);
      continue;
    }
    const c = loadDriver(b, s.o, s.p, b.constraints.length, s.name, s.common);
    if (c === null) continue;
    b.constraints.push(c);
    if (!b.constraintMap.has(s.name)) b.constraintMap.set(s.name, c);
  }

  // `index` is the final position in the array; a dropped driver shifts the
  // constraints declared after it, so the first-pass values are fixed here.
  for (let i = 0; i < b.constraints.length; i++) {
    (b.constraints[i] as { index: number }).index = i;
  }
}

type Common = { mix?: number; skinRequired?: boolean };

function loadIk(b: Build, o: Record<string, unknown>, p: string, index: number, name: string, common: Common): ConstraintData | null {
  const ctx = b.ctx;
  const bones = resolveBoneList(b, o, p, 1, 2);
  if (bones === null) return null;
  const targetName = reqString(ctx, o, 'target', p);
  const target = b.boneMap.get(targetName);
  if (target === undefined) { ctx.issue(ptr(p, 'target'), `bone "${targetName}" does not exist; constraint ignored`); return null; }
  if (bones[0].parent === null) { ctx.issue(ptr(p, 'bones', 0), 'the root bone cannot be constrained by IK; constraint ignored'); return null; }
  if (bones.length === 2 && bones[1].parent !== bones[0]) {
    ctx.issue(ptr(p, 'bones', 1), `"${bones[1].name}" must be a child of "${bones[0].name}"; constraint ignored`);
    return null;
  }
  for (const bone of bones) {
    if (target === bone || isDescendant(target, bone)) {
      ctx.issue(ptr(p, 'target'), `target "${targetName}" is one of the constrained bones or a descendant; constraint ignored`);
      return null;
    }
  }
  if (bones.length === 2) {
    // Spec 6.2: both bones MUST use normal inheritance (L1). The ik2 formula
    // assumes it, so the constraint is dropped like the other L1 IK rules (DUVIDAS-SPEC 9).
    for (let i = 0; i < 2; i++) {
      if (bones[i].inherit !== 'normal') {
        ctx.issue(ptr(p, 'bones', i), `"${bones[i].name}" must use normal inheritance for 2-bone IK; constraint ignored`);
        return null;
      }
    }
  }
  return new IkConstraintData(index, name, bones, target, {
    ...common,
    bendPositive: optBoolean(ctx, o, 'bendPositive', p), compress: optBoolean(ctx, o, 'compress', p),
    stretch: optBoolean(ctx, o, 'stretch', p), uniform: optBoolean(ctx, o, 'uniform', p),
    softness: optNumber(ctx, o, 'softness', p),
  });
}

function loadTransform(b: Build, o: Record<string, unknown>, p: string, index: number, name: string, common: Common): ConstraintData | null {
  const ctx = b.ctx;
  const bones = resolveBoneList(b, o, p, 1, Number.MAX_SAFE_INTEGER);
  if (bones === null) return null;
  const targetName = reqString(ctx, o, 'target', p);
  const target = b.boneMap.get(targetName);
  if (target === undefined) { ctx.issue(ptr(p, 'target'), `bone "${targetName}" does not exist; constraint ignored`); return null; }
  return new TransformConstraintData(index, name, bones, target, {
    ...common,
    local: optBoolean(ctx, o, 'local', p), relative: optBoolean(ctx, o, 'relative', p),
    offsetRotation: optNumber(ctx, o, 'offsetRotation', p), offsetX: optNumber(ctx, o, 'offsetX', p),
    offsetY: optNumber(ctx, o, 'offsetY', p), offsetScaleX: optNumber(ctx, o, 'offsetScaleX', p),
    offsetScaleY: optNumber(ctx, o, 'offsetScaleY', p), offsetShearY: optNumber(ctx, o, 'offsetShearY', p),
    mixRotation: optNumber(ctx, o, 'mixRotation', p), mixX: optNumber(ctx, o, 'mixX', p), mixY: optNumber(ctx, o, 'mixY', p),
    mixScaleX: optNumber(ctx, o, 'mixScaleX', p), mixScaleY: optNumber(ctx, o, 'mixScaleY', p),
    mixShearY: optNumber(ctx, o, 'mixShearY', p),
  });
}

function loadPath(b: Build, o: Record<string, unknown>, p: string, index: number, name: string, common: Common): ConstraintData | null {
  const ctx = b.ctx;
  const bones = resolveBoneList(b, o, p, 1, Number.MAX_SAFE_INTEGER);
  if (bones === null) return null;
  const targetName = reqString(ctx, o, 'target', p);
  const target = b.slotMap.get(targetName);
  if (target === undefined) { ctx.issue(ptr(p, 'target'), `slot "${targetName}" does not exist; constraint ignored`); return null; }
  return new PathConstraintData(index, name, bones, target, {
    ...common,
    positionMode: optEnum(ctx, o, 'positionMode', p, POSITION_MODES, 'percent'),
    spacingMode: optEnum(ctx, o, 'spacingMode', p, SPACING_MODES, 'length'),
    rotateMode: optEnum(ctx, o, 'rotateMode', p, ROTATE_MODES, 'tangent'),
    offsetRotation: optNumber(ctx, o, 'offsetRotation', p), position: optNumber(ctx, o, 'position', p),
    spacing: optNumber(ctx, o, 'spacing', p), mixRotation: optNumber(ctx, o, 'mixRotation', p),
    mixX: optNumber(ctx, o, 'mixX', p), mixY: optNumber(ctx, o, 'mixY', p),
  });
}

function loadPhysics(b: Build, o: Record<string, unknown>, p: string, index: number, name: string, common: Common): ConstraintData | null {
  const ctx = b.ctx;
  const boneName = reqString(ctx, o, 'bone', p);
  const bone = b.boneMap.get(boneName);
  if (bone === undefined) { ctx.issue(ptr(p, 'bone'), `bone "${boneName}" does not exist; constraint ignored`); return null; }
  const mass = optNumber(ctx, o, 'mass', p);
  if (mass !== undefined && mass <= 0) ctx.issue(ptr(p, 'mass'), 'mass must be > 0');
  const fps = optNumber(ctx, o, 'fps', p);
  if (fps !== undefined && fps <= 0) ctx.issue(ptr(p, 'fps'), 'fps must be > 0');
  return new PhysicsConstraintData(index, name, bone, {
    ...common,
    x: optNumber(ctx, o, 'x', p), y: optNumber(ctx, o, 'y', p), rotation: optNumber(ctx, o, 'rotation', p),
    scaleX: optNumber(ctx, o, 'scaleX', p), shearX: optNumber(ctx, o, 'shearX', p),
    inertia: optNumber(ctx, o, 'inertia', p), strength: optNumber(ctx, o, 'strength', p),
    damping: optNumber(ctx, o, 'damping', p), mass: mass !== undefined && mass > 0 ? mass : undefined,
    wind: optNumber(ctx, o, 'wind', p), gravity: optNumber(ctx, o, 'gravity', p),
    limit: optNumber(ctx, o, 'limit', p), fps: fps !== undefined && fps > 0 ? fps : undefined,
  });
}

/** Driver target types that are not allowed (spec 8.2). */
const DRIVER_FORBIDDEN_TYPES = ['event', 'sequence', 'tag'];

function loadDriver(b: Build, o: Record<string, unknown>, p: string, index: number, name: string, common: Common): ConstraintData | null {
  const ctx = b.ctx;
  const paramName = reqString(ctx, o, 'parameter', p);
  const parameter = b.parameterMap.get(paramName);
  if (parameter === undefined) { ctx.issue(ptr(p, 'parameter'), `parameter "${paramName}" does not exist; constraint ignored`); return null; }
  const targetDefs = optArray(ctx, o, 'targets', p);
  const animationName = optString(ctx, o, 'animation', p);
  if ((targetDefs === undefined) === (animationName === undefined)) {
    ctx.issue(p, 'exactly one of "targets" or "animation" is required; constraint ignored');
    return null;
  }
  if (animationName !== undefined && !b.animationNames.has(animationName)) {
    ctx.issue(ptr(p, 'animation'), `animation "${animationName}" does not exist; constraint ignored`);
    return null;
  }
  const from = optNumber(ctx, o, 'from', p) ?? parameter.min;
  const to = optNumber(ctx, o, 'to', p) ?? parameter.max;
  if (to === from) { ctx.issue(ptr(p, 'to'), 'to must differ from from; constraint ignored'); return null; }
  const mode = optEnum(ctx, o, 'mode', p, DRIVER_MODES, 'replace');

  let targets: DriverTargetData[] | null = null;
  if (targetDefs !== undefined) {
    targets = [];
    if (targetDefs.length === 0) ctx.issue(ptr(p, 'targets'), 'a driver needs at least one target');
    for (let i = 0; i < targetDefs.length; i++) {
      const tp = ptr(p, 'targets', i);
      const t = expectObject(ctx, targetDefs[i], tp) as Record<string, unknown> & DriverTargetDef;
      const type = reqString(ctx, t, 'type', tp);
      if (DRIVER_FORBIDDEN_TYPES.includes(type)) { ctx.issue(ptr(tp, 'type'), `"${type}" is not allowed as a driver target; target ignored`); continue; }
      const targetMode = optEnum(ctx, t, 'mode', tp, DRIVER_MODES, 'replace');
      const tl = loadTimeline(b, t as unknown as Record<string, unknown> & TimelineDef, tp, 'input');
      if (tl === null) continue;
      if (targetMode === 'add' && !allowsAddMode(tl)) {
        ctx.issue(ptr(tp, 'mode'), '"add" is not allowed for this target; using "replace"');
        targets.push(new DriverTargetData(tl, 'replace'));
      } else {
        if (tl.kind === 'parameter' && tl.parameter === parameter) {
          ctx.issue(ptr(tp, 'target'), 'a driver must not write its own parameter; target ignored');
          continue;
        }
        targets.push(new DriverTargetData(tl, targetMode));
      }
    }
  }
  return new DriverConstraintData(index, name, parameter, {
    ...common, targets, animationName: animationName ?? null, from, to,
    timeFrom: optNumber(ctx, o, 'timeFrom', p), timeTo: optNumber(ctx, o, 'timeTo', p), mode,
  });
}

/** `mode: "add"` is forbidden for non-interpolable targets (spec 8.2). */
function allowsAddMode(tl: TimelineData): boolean {
  switch (tl.kind) {
    case 'slot.attachment': case 'slot.visible': case 'drawOrder': case 'nested.animation':
    case 'bone.inherit': case 'bone.parent': case 'variable.stepped': case 'constraint.boolean': case 'constraint.reset':
      return false;
    default:
      return true;
  }
}

function linkSkinConstraints(b: Build, skinDefs: unknown[]): void {
  const ctx = b.ctx;
  const seen = new Set<string>();
  for (let i = 0; i < skinDefs.length; i++) {
    const o = skinDefs[i];
    if (!isObject(o) || typeof o['name'] !== 'string') continue;
    const name = o['name'];
    if (seen.has(name)) continue;
    seen.add(name);
    const skin = b.skinMap.get(name);
    if (skin === undefined) continue;
    const p = ptr('/skins', i);
    const names = optStringArray(ctx, o, 'constraints', p) ?? [];
    for (let j = 0; j < names.length; j++) {
      const c = b.constraintMap.get(names[j]);
      if (c === undefined) { ctx.issue(ptr(p, 'constraints', j), `constraint "${names[j]}" does not exist; ignored`); continue; }
      if (!c.skinRequired) ctx.warn(ptr(p, 'constraints', j), `constraint "${names[j]}" is not skinRequired`);
      skin.constraints.push(c);
    }
  }
}

/**
 * Fills `animation` / `timeTo` of continuous-mode drivers. The animation name
 * was already checked by `loadDriver` (constraint indices never change here).
 */
function bindDriverAnimations(b: Build): void {
  for (const c of b.constraints) {
    if (!(c instanceof DriverConstraintData) || c.animationName === null) continue;
    const anim = b.animationMap.get(c.animationName);
    if (anim === undefined) continue; // cannot happen: `loadDriver` verified the name
    c.animation = anim;
    if (Number.isNaN(c.timeTo)) c.timeTo = anim.duration;
  }
}

// -- animations and timelines (9) ------------------------------------------------------

const ANIMATION_BLENDS: readonly AnimationBlend[] = ['replace', 'add', 'multiply'];

function loadAnimations(b: Build, defs: unknown[]): void {
  const ctx = b.ctx;
  for (let i = 0; i < defs.length; i++) {
    const p = ptr('/animations', i);
    const o = expectObject(ctx, defs[i], p) as Record<string, unknown> & AnimationDef;
    const name = reqString(ctx, o, 'name', p);
    if (b.animationMap.has(name)) ctx.issue(ptr(p, 'name'), `duplicate animation name "${name}"`);
    const tlDefs = optArray(ctx, o, 'timelines', p) ?? [];
    const timelines: TimelineData[] = [];
    const keys = new Map<string, number>();
    // Spec 4.7: a target that is missing HERE is not L1 when the animation says
    // where it lives — the host of an external animation (4.8) or another body
    // named by a `body` key (9.13).
    const hasBody = tlDefs.some((t) => isObject(t) && t['type'] === 'body');
    b.unmetCode = b.externalAnimations?.has(o) === true ? 'RIG_UNMET'
      : hasBody ? 'BODY_UNMET' : (b.baseUnmetCode ?? null);
    for (let j = 0; j < tlDefs.length; j++) {
      const tp = ptr(p, 'timelines', j);
      const t = expectObject(ctx, tlDefs[j], tp) as Record<string, unknown> & TimelineDef;
      const tl = loadTimeline(b, t, tp, 'time');
      if (tl === null) continue;
      const identity = timelineIdentity(t);
      const previous = keys.get(identity);
      if (previous !== undefined) {
        ctx.issue(tp, `duplicate timeline ${identity}; the last one is used`);
        timelines[previous] = tl;
        continue;
      }
      keys.set(identity, timelines.length);
      timelines.push(tl);
    }
    const duration = optNumber(ctx, o, 'duration', p);
    if (duration !== undefined) {
      if (duration < 0) ctx.issue(ptr(p, 'duration'), 'duration must be >= 0');
      for (let j = 0; j < timelines.length; j++) {
        if (timelines[j].lastTime > duration) {
          ctx.issue(ptr(p, 'duration'), `duration ${duration} is smaller than the last key time ${timelines[j].lastTime}`);
          break;
        }
      }
    }
    b.unmetCode = null;
    const anim = new AnimationData(b.animations.length, name, timelines, {
      duration: duration !== undefined ? Math.max(0, duration) : undefined,
      loop: optBoolean(ctx, o, 'loop', p),
      blend: optEnum(ctx, o, 'blend', p, ANIMATION_BLENDS, 'replace'),
      defaultMix: optNumber(ctx, o, 'defaultMix', p) ?? null,
      tags: optStringArray(ctx, o, 'tags', p),
      crop: loadCrop(ctx, o, p),
      source: o,
    });
    b.animations.push(anim);
    if (!b.animationMap.has(name)) b.animationMap.set(name, anim);
  }
}

/**
 * `(type, target, property, skin, attachment)` of spec 9.1, normalized:
 * `skin` defaults to `"default"` and only counts for `deform` / `sequence`;
 * `property` only counts for the types that have one.
 */
function timelineIdentity(t: Record<string, unknown>): string {
  const s = (k: string): string => (typeof t[k] === 'string' ? (t[k] as string) : '');
  const type = s('type');
  const hasAttachment = type === 'deform' || type === 'sequence' || type === 'weights';
  const hasProperty = type === 'bone' || type === 'slot' || type === 'constraint' || type === 'nested';
  const skin = hasAttachment ? (s('skin') || 'default') : '';
  const attachment = hasAttachment ? s('attachment') : '';
  const property = hasProperty ? s('property') : '';
  return `(${type}, ${s('target')}, ${property}, ${skin}, ${attachment})`;
}

type TimeKey = 'time' | 'input';

/** Raw keys after validation of the time column. */
interface RawKeys {
  objs: Record<string, unknown>[];
  times: Float64Array;
  pointer: string;
}

/**
 * Reads `keys[]`, validates and orders the time column. Times must be strictly
 * increasing (non-decreasing when `allowEqual`). In lenient mode keys are
 * sorted and exact duplicates keep the last one.
 */
function readKeys(b: Build, o: Record<string, unknown>, p: string, timeKey: TimeKey, allowEqual: boolean): RawKeys | null {
  const ctx = b.ctx;
  const arr = optArray(ctx, o, 'keys', p);
  const kp = ptr(p, 'keys');
  if (arr === undefined || arr.length === 0) {
    ctx.issue(kp, 'at least one key is required; timeline ignored');
    return null;
  }
  let objs = arr.map((k, i) => expectObject(ctx, k, ptr(kp, i)));
  let times = objs.map((k, i) => reqNumber(ctx, k, timeKey, ptr(kp, i)));
  let ordered = true;
  for (let i = 1; i < times.length; i++) {
    if (times[i] < times[i - 1] || (!allowEqual && times[i] === times[i - 1])) { ordered = false; break; }
  }
  if (!ordered) {
    ctx.issue(kp, `${timeKey} must be ${allowEqual ? 'non-decreasing' : 'strictly increasing'}; keys reordered`);
    const order = times.map((t, i) => i).sort((x, y) => times[x] - times[y] || x - y);
    objs = order.map((i) => objs[i]);
    times = order.map((i) => times[i]);
    if (!allowEqual) {
      const dedupObjs: Record<string, unknown>[] = [];
      const dedupTimes: number[] = [];
      for (let i = 0; i < times.length; i++) {
        if (dedupTimes.length > 0 && dedupTimes[dedupTimes.length - 1] === times[i]) {
          dedupObjs[dedupObjs.length - 1] = objs[i];
        } else {
          dedupObjs.push(objs[i]);
          dedupTimes.push(times[i]);
        }
      }
      objs = dedupObjs;
      times = dedupTimes;
    }
  }
  if (timeKey === 'time') {
    for (let i = 0; i < times.length; i++) if (times[i] < 0) { ctx.issue(ptr(kp, i, 'time'), 'time must be >= 0'); break; }
  }
  return { objs, times: Float64Array.from(times), pointer: kp };
}

function curveWarner(ctx: Context, pointer: string): (message: string) => void {
  return (message) => ctx.warn(ptr(pointer, 'curve'), message);
}

/** Numeric keys with `components` values each (number, or array of `components` numbers). */
function numericKeys(b: Build, raw: RawKeys, components: number): NumericKeys | null {
  const ctx = b.ctx;
  const n = raw.objs.length;
  const values = new Float64Array(n * components);
  const curves: CurveData[] = new Array(n);
  for (let i = 0; i < n; i++) {
    const k = raw.objs[i];
    const kp = ptr(raw.pointer, i);
    const v = k['value'];
    if (components === 1) {
      if (typeof v !== 'number' || !Number.isFinite(v)) { ctx.issue(ptr(kp, 'value'), 'expected a number; timeline ignored'); return null; }
      values[i] = v;
    } else {
      if (!Array.isArray(v) || v.length !== components) { ctx.issue(ptr(kp, 'value'), `expected ${components} numbers; timeline ignored`); return null; }
      const nums = numberArray(ctx, v, ptr(kp, 'value'));
      for (let j = 0; j < components; j++) values[i * components + j] = nums[j];
    }
    curves[i] = i < n - 1
      ? normalizeCurve(k['curve'] as CurveDef | undefined, components, true, raw.times[i], raw.times[i + 1], curveWarner(ctx, kp))
      : LINEAR_CURVE;
  }
  return { times: raw.times, values, components, curves };
}

/** Non-interpolable keys; `read` returns `undefined` for an invalid value. */
function steppedKeys<T>(b: Build, raw: RawKeys, read: (v: unknown, pointer: string) => T | undefined, describe: string): SteppedKeys<T> | null {
  const ctx = b.ctx;
  const values: T[] = [];
  for (let i = 0; i < raw.objs.length; i++) {
    const k = raw.objs[i];
    const kp = ptr(raw.pointer, i);
    const v = read(k['value'], ptr(kp, 'value'));
    if (v === undefined) { ctx.issue(ptr(kp, 'value'), `expected ${describe}; timeline ignored`); return null; }
    const curve = k['curve'];
    if (curve !== undefined && curve !== 'stepped') ctx.warn(ptr(kp, 'curve'), 'non-numeric value: curve treated as "stepped"');
    values.push(v);
  }
  return { times: raw.times, values };
}

const readBoolean = (v: unknown): boolean | undefined => (typeof v === 'boolean' ? v : undefined);
const readStringOrNull = (v: unknown): string | null | undefined => (v === null || typeof v === 'string' ? v : undefined);

/** Loads one timeline (or driver target, with `timeKey = 'input'`). Returns `null` when ignored. */
function loadTimeline(b: Build, t: Record<string, unknown> & TimelineDef, p: string, timeKey: TimeKey): TimelineData | null {
  const ctx = b.ctx;
  const type = reqString(ctx, t, 'type', p);
  const target = optString(ctx, t, 'target', p);
  const property = optString(ctx, t, 'property', p);
  const needTarget = (): string | null => {
    if (target === undefined) { ctx.issue(ptr(p, 'target'), `"${type}" timeline needs a target; timeline ignored`); return null; }
    return target;
  };
  const needProperty = (): string | null => {
    if (property === undefined) { ctx.issue(ptr(p, 'property'), `"${type}" timeline needs a property; timeline ignored`); return null; }
    return property;
  };

  switch (type) {
    case 'bone': {
      const tn = needTarget(); const pn = needProperty();
      if (tn === null || pn === null) return null;
      const bone = b.boneMap.get(tn);
      if (bone === undefined) { missingTarget(b, ptr(p, 'target'), `bone "${tn}" does not exist; timeline ignored`); return null; }
      if ((BONE_NUMERIC_PROPERTIES as readonly string[]).includes(pn)) {
        const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
        const keys = numericKeys(b, raw, 1); if (keys === null) return null;
        return new BoneNumberTimelineData(bone, pn as BoneNumericProperty, keys);
      }
      if ((BONE_INHERIT_PROPERTIES as readonly string[]).includes(pn)) {
        const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
        const keys = steppedKeys(b, raw, readBoolean, 'a boolean'); if (keys === null) return null;
        return new BoneInheritTimelineData(bone, pn as BoneInheritProperty, keys);
      }
      if (pn === 'parent') {
        // Spec 9.4: stepped only; a bone name or null (= the parent of the file).
        const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
        const keys = steppedKeys<BoneData | null>(b, raw, (v, kp) => {
          if (v === null) return null;
          if (typeof v !== 'string') return undefined;
          const target = b.boneMap.get(v);
          if (target === undefined) { ctx.issue(kp, `bone "${v}" does not exist`); return undefined; }
          return target;
        }, 'a bone name or null'); if (keys === null) return null;
        return new BoneParentTimelineData(bone, keys);
      }
      ctx.warn(ptr(p, 'property'), `unknown bone property "${pn}"; timeline ignored`);
      return null;
    }
    case 'slot': {
      const tn = needTarget(); const pn = needProperty();
      if (tn === null || pn === null) return null;
      const slot = b.slotMap.get(tn);
      if (slot === undefined) { missingTarget(b, ptr(p, 'target'), `slot "${tn}" does not exist; timeline ignored`); return null; }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      switch (pn) {
        case 'bone': {
          // Spec 9.5: stepped; a bone name or null (= the bone of the file), with
          // the `transform` of the attachment on that bone.
          const values: SlotBoneKey[] = [];
          for (let i = 0; i < raw.objs.length; i++) {
            const k = raw.objs[i];
            const kp = ptr(raw.pointer, i);
            const v = k['value'];
            const curve = k['curve'];
            if (curve !== undefined && curve !== 'stepped') ctx.warn(ptr(kp, 'curve'), 'a slot/bone key is stepped only; curve treated as "stepped"');
            if (v === null) { values.push({ bone: null, transform: null }); continue; }
            if (typeof v !== 'string') { ctx.issue(ptr(kp, 'value'), 'expected a bone name or null; timeline ignored'); return null; }
            const bone = b.boneMap.get(v);
            if (bone === undefined) {
              // Spec 9.5: the key is ignored and the bone before it holds.
              ctx.warn(ptr(kp, 'value'), `SLOT_BONE_UNMET: bone "${v}" does not exist in this body; the bone before the key holds`);
              values.push(i === 0 ? { bone: null, transform: null } : values[i - 1]);
              continue;
            }
            values.push({ bone, transform: loadKeyTransform(ctx, k, kp) });
          }
          return new SlotBoneTimelineData(slot, { times: raw.times, values });
        }
        case 'attachment': {
          const keys = steppedKeys(b, raw, readStringOrNull, 'a placeholder name or null'); if (keys === null) return null;
          return new SlotAttachmentTimelineData(slot, keys);
        }
        case 'color': {
          const keys = numericKeys(b, raw, 4); if (keys === null) return null;
          return new SlotColorTimelineData(slot, keys);
        }
        case 'darkColor': {
          const n = raw.objs.length;
          const values: (Float64Array | null)[] = [];
          for (let i = 0; i < n; i++) {
            const v = raw.objs[i]['value'];
            if (v === null) { values.push(null); continue; }
            if (!Array.isArray(v) || v.length !== 3) { ctx.issue(ptr(raw.pointer, i, 'value'), 'expected 3 numbers or null; timeline ignored'); return null; }
            values.push(Float64Array.from(numberArray(ctx, v, ptr(raw.pointer, i, 'value'))));
          }
          const curves: CurveData[] = [];
          for (let i = 0; i < n; i++) {
            const interpolable = i < n - 1 && values[i] !== null && values[i + 1] !== null;
            curves.push(i < n - 1
              ? normalizeCurve(raw.objs[i]['curve'] as CurveDef | undefined, 3, interpolable, raw.times[i], raw.times[i + 1], curveWarner(ctx, ptr(raw.pointer, i)))
              : STEPPED_CURVE);
          }
          return new SlotDarkColorTimelineData(slot, raw.times, values, curves);
        }
        case 'visible': {
          const keys = steppedKeys(b, raw, readBoolean, 'a boolean'); if (keys === null) return null;
          return new SlotVisibleTimelineData(slot, keys);
        }
        default:
          ctx.warn(ptr(p, 'property'), `unknown slot property "${pn}"; timeline ignored`);
          return null;
      }
    }
    case 'drawOrder': {
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const orders: (Int32Array | null)[] = [];
      const entries: (DrawOrderOffset[] | null)[] = [];
      for (let i = 0; i < raw.objs.length; i++) {
        const kp = ptr(raw.pointer, i, 'value');
        const v = raw.objs[i]['value'];
        if (!Array.isArray(v)) { ctx.issue(kp, 'expected an array of {slot, offset}; timeline ignored'); return null; }
        orders.push(v.length === 0 ? null : computeDrawOrder(b, v, kp));
        entries.push(v.length === 0 ? null : readDrawOrderEntries(b, v));
      }
      return new DrawOrderTimelineData(raw.times, orders, entries);
    }
    case 'deform': {
      const tn = needTarget(); if (tn === null) return null;
      const res = resolveTimelineAttachment(b, t, p, tn); if (res === null) return null;
      const { slot, skin, attachment } = res;
      if (!(attachment instanceof VertexAttachment)) { ctx.issue(ptr(p, 'attachment'), 'deform needs a vertex attachment; timeline ignored'); return null; }
      if (attachment instanceof LinkedMeshAttachment && attachment.inheritDeform) {
        ctx.issue(ptr(p, 'attachment'), 'a linked mesh with inheritDeform cannot have its own deform; timeline ignored');
        return null;
      }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const n = raw.objs.length;
      const layout = attachment.deformLength;
      const vertices: Float64Array[] = [];
      const curves: CurveData[] = [];
      for (let i = 0; i < n; i++) {
        const k = raw.objs[i];
        const kp = ptr(raw.pointer, i);
        const v = k['value'];
        if (!Array.isArray(v)) { ctx.issue(ptr(kp, 'value'), 'expected an array of numbers; timeline ignored'); return null; }
        const nums = numberArray(ctx, v, ptr(kp, 'value'));
        if (nums.length === 0) {
          vertices.push(new Float64Array(0));
        } else {
          let offset = optNumber(ctx, k, 'offset', kp) ?? 0;
          if (offset < 0 || !Number.isInteger(offset)) { ctx.issue(ptr(kp, 'offset'), 'offset must be a non-negative integer; using 0'); offset = 0; }
          const expanded = new Float64Array(layout);
          if (offset + nums.length > layout) ctx.issue(ptr(kp, 'value'), `deform of ${nums.length} numbers at offset ${offset} exceeds the layout (${layout}); truncated`);
          for (let j = 0; j < nums.length && offset + j < layout; j++) expanded[offset + j] = nums[j];
          vertices.push(expanded);
        }
        curves.push(i < n - 1
          ? normalizeCurve(k['curve'] as CurveDef | undefined, 1, true, raw.times[i], raw.times[i + 1], curveWarner(ctx, kp))
          : LINEAR_CURVE);
      }
      return new DeformTimelineData(slot, skin, attachment, raw.times, vertices, curves);
    }
    case 'weights': {
      // Spec 9.6 (F9): the weights of the binding, one curve for the array.
      const tn = needTarget(); if (tn === null) return null;
      const res = resolveTimelineAttachment(b, t, p, tn); if (res === null) return null;
      const { slot, skin, attachment } = res;
      if (!(attachment instanceof VertexAttachment) || attachment.binding === null
        || (attachment instanceof LinkedMeshAttachment && attachment.inheritDeform)) {
        ctx.issue(ptr(p, 'attachment'), 'ORDER_TIMELINE_TARGET: weights needs an attachment with a binding; timeline ignored');
        return null;
      }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const size = attachment.binding.weights.length;
      const times: number[] = [];
      const weights: Float64Array[] = [];
      const kept: Record<string, unknown>[] = [];
      for (let i = 0; i < raw.objs.length; i++) {
        const k = raw.objs[i];
        const kp = ptr(raw.pointer, i);
        const v = k['value'];
        if (!Array.isArray(v)) { ctx.issue(ptr(kp, 'value'), 'expected an array of weights; key ignored'); continue; }
        const nums = numberArray(ctx, v, ptr(kp, 'value'));
        if (nums.length !== size) {
          ctx.issue(ptr(kp, 'value'), `RANGE_WEIGHTS_SIZE: ${nums.length} weights, the binding has ${size}; key ignored`);
          continue;
        }
        times.push(raw.times[i]);
        weights.push(Float64Array.from(nums));
        kept.push(k);
      }
      if (weights.length === 0) { ctx.warn(raw.pointer, 'weights timeline without valid keys; timeline ignored'); return null; }
      const curves: CurveData[] = [];
      for (let i = 0; i < kept.length; i++) {
        curves.push(i < kept.length - 1
          ? normalizeCurve(kept[i]['curve'] as CurveDef | undefined, 1, true, times[i], times[i + 1], curveWarner(ctx, ptr(raw.pointer, i)))
          : LINEAR_CURVE);
      }
      return new WeightsTimelineData(slot, skin, attachment, Float64Array.from(times), weights, curves);
    }
    case 'body': {
      // Spec 9.13: the body from the key on; stepped only.
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const values: BodyKey[] = [];
      for (let i = 0; i < raw.objs.length; i++) {
        const k = raw.objs[i];
        const kp = ptr(raw.pointer, i);
        const v = k['value'];
        const curve = k['curve'];
        if (curve !== undefined && curve !== 'stepped') ctx.warn(ptr(kp, 'curve'), 'a body key is stepped only; curve treated as "stepped"');
        const keepSkins = optBoolean(ctx, k, 'keepSkins', kp) ?? true;
        if (v === null) { values.push({ value: null, uri: null, keepSkins }); continue; }
        if (typeof v !== 'string') { ctx.issue(ptr(kp, 'value'), 'expected a body uri or null; timeline ignored'); return null; }
        const problem = validateUri(v);
        if (problem !== null) { ctx.issue(ptr(kp, 'value'), `invalid uri "${v}": ${problem}; timeline ignored`); return null; }
        if (raw.times[i] === 0) ctx.warn(ptr(kp, 'time'), 'BODY_AT_START: this animation belongs to another body; keep it there (spec 9.13)');
        values.push({ value: v, uri: joinUri(b.skeletonsBase ?? '', v), keepSkins });
      }
      return new BodyTimelineData({ times: raw.times, values });
    }
    case 'sequence': {
      const tn = needTarget(); if (tn === null) return null;
      const res = resolveTimelineAttachment(b, t, p, tn); if (res === null) return null;
      const { slot, skin, attachment } = res;
      if (!(attachment instanceof RegionAttachment || attachment instanceof MeshAttachment || attachment instanceof LinkedMeshAttachment) || attachment.sequence === null) {
        ctx.issue(ptr(p, 'attachment'), 'sequence timeline needs an attachment with a sequence; timeline ignored');
        return null;
      }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const count = attachment.sequence.count;
      const keys = steppedKeys<SequenceKey>(b, raw, (v, vp) => {
        if (!isObject(v)) return undefined;
        const sv = v as Record<string, unknown> & SequenceKeyValue;
        let index = Math.trunc(optNumber(ctx, sv, 'index', vp) ?? 0);
        if (index < 0 || index >= count) {
          ctx.issue(ptr(vp, 'index'), `index ${index} outside 0..${count - 1}; clamped`);
          index = index < 0 ? 0 : count - 1;
        }
        let delay = optNumber(ctx, sv, 'delay', vp) ?? 0;
        if (delay < 0) {
          ctx.issue(ptr(vp, 'delay'), `delay ${delay} must be >= 0; using 0`);
          delay = 0;
        }
        return { mode: optEnum(ctx, sv, 'mode', vp, SEQUENCE_MODES, 'hold'), index, delay };
      }, 'an object {mode, index, delay}');
      if (keys === null) return null;
      return new SequenceTimelineData(slot, skin, attachment as SequenceCapableAttachment, keys);
    }
    case 'event': {
      const raw = readKeys(b, t, p, timeKey, true); if (raw === null) return null;
      const events: EventKey[] = [];
      const times: number[] = [];
      for (let i = 0; i < raw.objs.length; i++) {
        const k = raw.objs[i];
        const kp = ptr(raw.pointer, i);
        const evName = optString(ctx, k, 'event', kp);
        if (evName === undefined) { ctx.issue(ptr(kp, 'event'), 'event key needs "event"; key ignored'); continue; }
        const ev = b.eventMap.get(evName);
        if (ev === undefined) { ctx.issue(ptr(kp, 'event'), `event "${evName}" does not exist; key ignored`); continue; }
        events.push({
          time: raw.times[i], event: ev,
          int: optNumber(ctx, k, 'int', kp) ?? ev.int,
          float: optNumber(ctx, k, 'float', kp) ?? ev.float,
          string: optString(ctx, k, 'string', kp) ?? ev.string,
          volume: optNumber(ctx, k, 'volume', kp) ?? ev.volume,
          balance: optNumber(ctx, k, 'balance', kp) ?? ev.balance,
        });
        times.push(raw.times[i]);
      }
      if (events.length === 0) { ctx.warn(raw.pointer, 'event timeline without valid keys; timeline ignored'); return null; }
      return new EventTimelineData(Float64Array.from(times), events);
    }
    case 'constraint': {
      const tn = needTarget(); const pn = needProperty();
      if (tn === null || pn === null) return null;
      const c = b.constraintMap.get(tn);
      if (c === undefined) { missingTarget(b, ptr(p, 'target'), `constraint "${tn}" does not exist; timeline ignored`); return null; }
      const kind = constraintPropertyKind(c, pn);
      if (kind === null) { ctx.issue(ptr(p, 'property'), `property "${pn}" does not belong to a "${c.type}" constraint; timeline ignored`); return null; }
      if (kind === 'reset') {
        const raw = readKeys(b, t, p, timeKey, true); if (raw === null) return null;
        return new ConstraintResetTimelineData(c as PhysicsConstraintData, raw.times);
      }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      if (kind === 'number') {
        const keys = numericKeys(b, raw, 1); if (keys === null) return null;
        return new ConstraintNumberTimelineData(c, pn, keys);
      }
      const keys = steppedKeys(b, raw, readBoolean, 'a boolean'); if (keys === null) return null;
      return new ConstraintBooleanTimelineData(c, pn, keys);
    }
    case 'parameter': {
      const tn = needTarget(); if (tn === null) return null;
      if (property !== undefined && property !== 'value') { ctx.warn(ptr(p, 'property'), `unknown parameter property "${property}"; timeline ignored`); return null; }
      const param = b.parameterMap.get(tn);
      if (param === undefined) { missingTarget(b, ptr(p, 'target'), `parameter "${tn}" does not exist; timeline ignored`); return null; }
      if (param.source !== null && timeKey === 'time') ctx.issue(ptr(p, 'target'), `parameter "${tn}" has a source and must not be keyed`);
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const keys = numericKeys(b, raw, 1); if (keys === null) return null;
      return new ParameterTimelineData(param, keys);
    }
    case 'morph': {
      const tn = needTarget(); if (tn === null) return null;
      if (property !== undefined && property !== 'weight') { ctx.warn(ptr(p, 'property'), `unknown morph property "${property}"; timeline ignored`); return null; }
      const morph = b.morphMap.get(tn);
      if (morph === undefined) { missingTarget(b, ptr(p, 'target'), `morph "${tn}" does not exist; timeline ignored`); return null; }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const keys = numericKeys(b, raw, 1); if (keys === null) return null;
      return new MorphTimelineData(morph, keys);
    }
    case 'variable': {
      const tn = needTarget(); if (tn === null) return null;
      if (property !== undefined && property !== 'value') { ctx.warn(ptr(p, 'property'), `unknown variable property "${property}"; timeline ignored`); return null; }
      const variable = b.variableMap.get(tn);
      if (variable === undefined) { missingTarget(b, ptr(p, 'target'), `variable "${tn}" does not exist (or has an unknown type); timeline ignored`); return null; }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      if (variable.isNumeric) {
        const keys = numericKeys(b, raw, 1); if (keys === null) return null;
        return new VariableNumberTimelineData(variable, keys);
      }
      const keys = steppedKeys<string | boolean>(b, raw, (v) => (variableValueMatches(variable.type, v) ? (v as string | boolean) : undefined), `a ${variable.type}`);
      if (keys === null) return null;
      return new VariableSteppedTimelineData(variable, keys);
    }
    case 'tag': {
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      const keys = steppedKeys<readonly string[]>(b, raw, (v) => (Array.isArray(v) && v.every((s) => typeof s === 'string') ? (v as string[]) : undefined), 'an array of strings');
      if (keys === null) return null;
      return new TagTimelineData(keys);
    }
    case 'nested': {
      const tn = needTarget(); const pn = needProperty();
      if (tn === null || pn === null) return null;
      const slot = b.slotMap.get(tn);
      if (slot === undefined) { missingTarget(b, ptr(p, 'target'), `slot "${tn}" does not exist; timeline ignored`); return null; }
      const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
      if (pn === 'animation') {
        const keys = steppedKeys(b, raw, readStringOrNull, 'an animation name or null'); if (keys === null) return null;
        return new NestedAnimationTimelineData(slot, keys);
      }
      if (pn === 'time' || pn === 'timeScale') {
        const keys = numericKeys(b, raw, 1); if (keys === null) return null;
        return new NestedNumberTimelineData(slot, pn, keys);
      }
      ctx.warn(ptr(p, 'property'), `unknown nested property "${pn}"; timeline ignored`);
      return null;
    }
    case PARTICLE_ATTACHMENT_TYPE: {
      // Extension `BONE_particles`, 9: an animable field of the emitter rides a
      // PREFIXED timeline, so a reader without the extension ignores it by the
      // `timeline.type` rule of spec 2.5. In the 1st phase the only one is
      // `emitting`; `rate` is fixed on the attachment (extension 4.1).
      const tn = needTarget(); const pn = needProperty();
      if (tn === null || pn === null) return null;
      const found = resolveTimelineAttachment(b, t, p, tn);
      if (found === null) return null;
      if (!(found.attachment instanceof ParticleAttachment)) {
        ctx.issue(ptr(p, 'attachment'), `attachment "${found.attachment.name}" is not a ${PARTICLE_ATTACHMENT_TYPE}; timeline ignored`);
        return null;
      }
      if (pn === 'emitting') {
        const raw = readKeys(b, t, p, timeKey, false); if (raw === null) return null;
        const keys = steppedKeys(b, raw, readBoolean, 'a boolean'); if (keys === null) return null;
        return new ParticleEmittingTimelineData(found.slot, found.skin, found.attachment.name, keys);
      }
      if (pn === 'rate') {
        // Extension 4.2 and 12: an animated `rate` is the `linear` branch of
        // the integral, and that is 2nd PHASE. The conta is written whole in
        // the spec so the second reader does not invent its own; no code here
        // implements it, and case P-002 is its case, empty on purpose.
        ctx.warn(ptr(p, 'property'), 'an animated "rate" is 2nd phase of BONE_particles (extension 4.2); timeline ignored, the fixed rate of the attachment is used');
        return null;
      }
      ctx.warn(ptr(p, 'property'), `"${pn}" is not animable in the 1st phase of BONE_particles; timeline ignored`);
      return null;
    }
    default:
      ctx.warn(ptr(p, 'type'), `unknown timeline type "${type}"; timeline ignored`);
      return null;
  }
}

const SEQUENCE_MODES: readonly SequenceMode[] = ['hold', 'once', 'loop', 'pingpong', 'onceReverse', 'loopReverse', 'pingpongReverse'];

function resolveTimelineAttachment(b: Build, t: Record<string, unknown>, p: string, slotName: string): { slot: SlotData; skin: SkinData; attachment: Attachment } | null {
  const ctx = b.ctx;
  const slot = b.slotMap.get(slotName);
  if (slot === undefined) { missingTarget(b, ptr(p, 'target'), `slot "${slotName}" does not exist; timeline ignored`); return null; }
  const skinName = optString(ctx, t, 'skin', p) ?? 'default';
  const skin = b.skinMap.get(skinName);
  if (skin === undefined) { missingTarget(b, ptr(p, 'skin'), `skin "${skinName}" does not exist; timeline ignored`); return null; }
  const attName = optString(ctx, t, 'attachment', p);
  if (attName === undefined) { ctx.issue(ptr(p, 'attachment'), 'attachment is required; timeline ignored'); return null; }
  const att = skin.getAttachment(slot.index, attName);
  if (att === undefined || att === null) {
    missingTarget(b, ptr(p, 'attachment'), `attachment "${attName}" not found in skin "${skinName}" of slot "${slotName}"; timeline ignored`);
    return null;
  }
  return { slot, skin, attachment: att };
}

/** Which kind of timeline a constraint property accepts (spec 9.8), or `null` if it does not apply. */
function constraintPropertyKind(c: ConstraintData, property: string): 'number' | 'boolean' | 'reset' | null {
  if (property === 'mix') return 'number';
  switch (c.type) {
    case 'ik':
      if (property === 'softness') return 'number';
      if (['bendPositive', 'compress', 'stretch', 'uniform'].includes(property)) return 'boolean';
      return null;
    case 'transform':
      return ['mixRotation', 'mixX', 'mixY', 'mixScaleX', 'mixScaleY', 'mixShearY'].includes(property) ? 'number' : null;
    case 'path':
      return ['mixRotation', 'mixX', 'mixY', 'position', 'spacing'].includes(property) ? 'number' : null;
    case 'physics':
      if (property === 'reset') return 'reset';
      return ['inertia', 'strength', 'damping', 'mass', 'wind', 'gravity'].includes(property) ? 'number' : null;
    default:
      return null;
  }
}

/** Spec 9.5 draw order algorithm with the reader rules (unknown slot ignored, index clamped, last wins). */
/**
 * The `{slot, offset}` list of a draw-order key as written, unknown slots
 * skipped (`computeDrawOrder` already reported them). The runtime applies it
 * over the base order of spec 4.4.
 */
function readDrawOrderEntries(b: Build, entries: unknown[]): DrawOrderOffset[] {
  const out: DrawOrderOffset[] = [];
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    if (!isObject(e)) continue;
    const slot = typeof e['slot'] === 'string' ? b.slotMap.get(e['slot']) : undefined;
    const offset = typeof e['offset'] === 'number' ? Math.trunc(e['offset']) : 0;
    if (slot === undefined) continue;
    out.push({ slot, offset });
  }
  return out;
}

function computeDrawOrder(b: Build, entries: unknown[], p: string): Int32Array {
  const ctx = b.ctx;
  const n = b.slots.length;
  const order = new Int32Array(n).fill(-1);
  const cited = new Uint8Array(n);
  for (let i = 0; i < entries.length; i++) {
    const ep = ptr(p, i);
    const e = expectObject(ctx, entries[i], ep) as Record<string, unknown> & DrawOrderEntry;
    const slotName = reqString(ctx, e, 'slot', ep);
    const offset = reqNumber(ctx, e, 'offset', ep);
    const slot = b.slotMap.get(slotName);
    if (slot === undefined) { ctx.issue(ptr(ep, 'slot'), `slot "${slotName}" does not exist; entry ignored`); continue; }
    let target = slot.index + Math.trunc(offset);
    if (target < 0 || target >= n) {
      ctx.issue(ptr(ep, 'offset'), `index ${target} outside 0..${n - 1}; clamped`);
      target = Math.min(Math.max(target, 0), n - 1);
    }
    const previous = order[target];
    if (previous !== -1) {
      ctx.issue(ptr(ep, 'offset'), `slot "${slotName}" collides with "${b.slots[previous].name}" at index ${target}; the last entry wins`);
      cited[previous] = 0;
    }
    order[target] = slot.index;
    cited[slot.index] = 1;
  }
  let j = 0;
  for (let i = 0; i < n; i++) {
    if (order[i] !== -1) continue;
    while (j < n && cited[j] === 1) j++;
    order[i] = j;
    j++;
  }
  return order;
}

// ---------------------------------------------------------------------------
// Atlas loader (spec 10)
// ---------------------------------------------------------------------------

const ATLAS_FORMATS: readonly AtlasFormat[] = ['rgba8', 'rgb8', 'rgba4', 'rgb565', 'alpha8'];
const ATLAS_MIN_FILTERS: readonly AtlasMinFilter[] = ['nearest', 'linear', 'mipmap'];
const ATLAS_MAG_FILTERS: readonly AtlasMagFilter[] = ['nearest', 'linear'];
const ATLAS_WRAPS: readonly AtlasWrap[] = ['clamp', 'repeat', 'mirror'];

/** Loads a parsed `.atlas.json` value into `AtlasData`. */
export function loadAtlas(json: unknown, options: { strict?: boolean } = {}): AtlasData {
  const ctx = new Context({ strict: options.strict });
  const root = expectObject(ctx, json, '') as Record<string, unknown> & AtlasFile;
  const headerObj = expectObject(ctx, root['atlas'], '/atlas');
  const version = reqString(ctx, headerObj, 'version', '/atlas');
  const v = parseVersion(version);
  if (v === null) return ctx.fail('/atlas/version', `invalid version "${version}"`);
  if (v.major > READER_VERSION.major) ctx.issue('/atlas/version', `atlas version ${version} newer than reader; best effort`);

  const scale = optNumber(ctx, root, 'scale', '') ?? 1;
  if (scale <= 0) ctx.fail('/scale', 'scale must be > 0');

  const pageDefs = expectArray(ctx, root['pages'], '/pages');
  if (pageDefs.length === 0) ctx.fail('/pages', 'at least one page is required');
  const pages: AtlasPageData[] = [];
  const pageNames = new Set<string>();
  for (let i = 0; i < pageDefs.length; i++) {
    const p = ptr('/pages', i);
    const o = expectObject(ctx, pageDefs[i], p);
    const name = reqString(ctx, o, 'name', p);
    if (pageNames.has(name)) ctx.issue(ptr(p, 'name'), `duplicate page name "${name}"`);
    pageNames.add(name);
    const image = reqString(ctx, o, 'image', p);
    ctx.uri(ptr(p, 'image'), image, { allowData: true }); // spec 10.3: `data:` allowed only here
    pages.push(new AtlasPageData(i, name, image, reqNumber(ctx, o, 'width', p), reqNumber(ctx, o, 'height', p), {
      format: optEnum(ctx, o, 'format', p, ATLAS_FORMATS, 'rgba8'),
      minFilter: optEnum(ctx, o, 'minFilter', p, ATLAS_MIN_FILTERS, 'linear'),
      magFilter: optEnum(ctx, o, 'magFilter', p, ATLAS_MAG_FILTERS, 'linear'),
      wrapU: optEnum(ctx, o, 'wrapU', p, ATLAS_WRAPS, 'clamp'),
      wrapV: optEnum(ctx, o, 'wrapV', p, ATLAS_WRAPS, 'clamp'),
      premultiplied: optBoolean(ctx, o, 'premultiplied', p),
    }));
  }

  const regionDefs = expectArray(ctx, root['regions'], '/regions');
  const regions: AtlasRegionData[] = [];
  const regionNames = new Set<string>();
  for (let i = 0; i < regionDefs.length; i++) {
    const p = ptr('/regions', i);
    const o = expectObject(ctx, regionDefs[i], p);
    const name = reqString(ctx, o, 'name', p);
    if (regionNames.has(name)) ctx.issue(ptr(p, 'name'), `duplicate region name "${name}"`);
    regionNames.add(name);
    const pageIndex = reqNumber(ctx, o, 'page', p);
    const page = pages[pageIndex];
    if (page === undefined) { ctx.issue(ptr(p, 'page'), `page index ${pageIndex} out of range; region ignored`); continue; }
    const x = reqNumber(ctx, o, 'x', p);
    const y = reqNumber(ctx, o, 'y', p);
    const width = reqNumber(ctx, o, 'width', p);
    const height = reqNumber(ctx, o, 'height', p);
    let rotation = optNumber(ctx, o, 'rotation', p) ?? 0;
    if (rotation !== 0 && rotation !== 90) {
      ctx.issue(ptr(p, 'rotation'), `rotation must be 0 or 90 (got ${rotation}); using 0`);
      rotation = 0;
    }
    const offsetX = optNumber(ctx, o, 'offsetX', p) ?? 0;
    const offsetY = optNumber(ctx, o, 'offsetY', p) ?? 0;
    const originalWidth = optNumber(ctx, o, 'originalWidth', p) ?? width;
    const originalHeight = optNumber(ctx, o, 'originalHeight', p) ?? height;
    const onPageW = rotation === 90 ? height : width;
    const onPageH = rotation === 90 ? width : height;
    if (x + onPageW > page.width) ctx.issue(p, `region "${name}" exceeds the page width`);
    if (y + onPageH > page.height) ctx.issue(p, `region "${name}" exceeds the page height`);
    if (originalWidth < offsetX + width) ctx.issue(ptr(p, 'originalWidth'), `originalWidth must be >= offsetX + width for "${name}"`);
    if (originalHeight < offsetY + height) ctx.issue(ptr(p, 'originalHeight'), `originalHeight must be >= offsetY + height for "${name}"`);
    const aliases = optStringArray(ctx, o, 'aliases', p) ?? [];
    for (let j = 0; j < aliases.length; j++) {
      if (regionNames.has(aliases[j])) ctx.issue(ptr(p, 'aliases', j), `alias "${aliases[j]}" collides with a region name`);
      regionNames.add(aliases[j]);
    }
    // 10.3: informative. Carried for editors and tools; no pose reads it.
    const pivotX = optNumber(ctx, o, 'pivotX', p);
    const pivotY = optNumber(ctx, o, 'pivotY', p);
    regions.push(new AtlasRegionData(regions.length, name, page, scale, {
      aliases, x, y, width, height, rotation: rotation as 0 | 90, offsetX, offsetY, originalWidth, originalHeight,
      pivotX, pivotY,
    }));
  }
  return new AtlasData(scale, pages, regions, ctx.warnings);
}

/** UV of a point of the original image on the atlas page (spec 10.4). */
export function computeRegionUV(region: AtlasRegionData, u0: number, v0: number, out?: Float64Array | number[], offset = 0): Float64Array | number[] {
  return region.computeUV(u0, v0, out, offset);
}

// -- 0.2 draft: rig, crop, key transform, clipping check -------------------------------

/**
 * The `rig` block (spec 4.8). `reference.length <= 0` is L1 `RIG_REFERENCE`,
 * and the reference is then dropped (`k = 1`, spec 2.8).
 */
function loadRig(ctx: Context, root: Record<string, unknown>): RigData | null {
  const o = optObject(ctx, root, 'rig', '');
  if (o === undefined) return null;
  let reference: RigData['reference'] = null;
  const ref = optObject(ctx, o, 'reference', '/rig');
  if (ref !== undefined) {
    const bone = reqString(ctx, ref, 'bone', '/rig/reference');
    const length = reqNumber(ctx, ref, 'length', '/rig/reference');
    if (!(length > 0)) ctx.issue('/rig/reference/length', `RIG_REFERENCE: length must be > 0 (got ${length}); reference ignored`);
    else reference = { bone, length };
  }
  return {
    name: optString(ctx, o, 'name', '/rig') ?? null,
    bones: optStringArray(ctx, o, 'bones', '/rig') ?? [],
    slots: optStringArray(ctx, o, 'slots', '/rig') ?? [],
    reference,
  };
}

/** `animation.crop` (spec 4.6): read and kept, used by no pose reader. */
function loadCrop(ctx: Context, o: Record<string, unknown>, p: string): AnimationCrop | null {
  const c = optObject(ctx, o, 'crop', p);
  if (c === undefined) return null;
  const cp = ptr(p, 'crop');
  const width = optNumber(ctx, c, 'width', cp) ?? 0;
  const height = optNumber(ctx, c, 'height', cp) ?? 0;
  if (width < 0 || height < 0) ctx.issue(cp, `RANGE_CROP: width and height must be >= 0 (got ${width} x ${height})`);
  return { x: optNumber(ctx, c, 'x', cp) ?? 0, y: optNumber(ctx, c, 'y', cp) ?? 0, width: Math.max(0, width), height: Math.max(0, height) };
}

/**
 * The `transform` of a `slot` / `bone` key (spec 9.5): `T(x, y) R(rotation)
 * S(scaleX, scaleY)`, in that order. Absent = identity, returned as `null`.
 */
function loadKeyTransform(ctx: Context, k: Record<string, unknown>, kp: string): Matrix2x3 | null {
  const t = optObject(ctx, k, 'transform', kp);
  if (t === undefined) return null;
  const tp = ptr(kp, 'transform');
  return composeMatrix(
    optNumber(ctx, t, 'x', tp) ?? 0, optNumber(ctx, t, 'y', tp) ?? 0, optNumber(ctx, t, 'rotation', tp) ?? 0,
    optNumber(ctx, t, 'scaleX', tp) ?? 1, optNumber(ctx, t, 'scaleY', tp) ?? 1,
  );
}

/**
 * First pair of edges of a closed polygon that cross each other, or `null`
 * (spec 7.7: a clipping polygon must not cross itself). Adjacent edges share a
 * corner and do not count. `O(n^2)`, run once at load.
 */
export function selfIntersection(vertices: ArrayLike<number>): [number, number] | null {
  const n = vertices.length >> 1;
  if (n < 4) return null;
  const x = (i: number): number => vertices[(i % n) * 2];
  const y = (i: number): number => vertices[(i % n) * 2 + 1];
  const cross = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): number =>
    (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (j === i + 1 || (i === 0 && j === n - 1)) continue;
      const d1 = cross(x(i), y(i), x(i + 1), y(i + 1), x(j), y(j));
      const d2 = cross(x(i), y(i), x(i + 1), y(i + 1), x(j + 1), y(j + 1));
      const d3 = cross(x(j), y(j), x(j + 1), y(j + 1), x(i), y(i));
      const d4 = cross(x(j), y(j), x(j + 1), y(j + 1), x(i + 1), y(i + 1));
      if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return [i, j];
    }
  }
  return null;
}
