// SPDX-License-Identifier: Apache-2.0
// Recorte — o runtime do formato .bone, empacotado para o Construct 3.
// GERADO por leitor-construct/montar.mjs a partir de runtime/src e
// leitor-construct/src. Não edite à mão: rode "npm run leitor:construct".

"use strict";
var RecorteRuntime = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);
  var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);

  // leitor-construct/src/pacote.ts
  var pacote_exports = {};
  __export(pacote_exports, {
    APPLIED_BONE_INHERIT: () => APPLIED_BONE_INHERIT,
    APPLIED_BONE_PROPERTY: () => APPLIED_BONE_PROPERTY,
    Actor: () => Actor,
    AnimationData: () => AnimationData,
    AnimationState: () => AnimationState,
    AnimationStateData: () => AnimationStateData,
    AtlasData: () => AtlasData,
    AtlasPageData: () => AtlasPageData,
    AtlasRegionData: () => AtlasRegionData,
    Attachment: () => Attachment,
    Avisos: () => Avisos,
    BindingData: () => BindingData,
    BodyTimelineData: () => BodyTimelineData,
    Bone: () => Bone,
    BoneData: () => BoneData,
    BoneInheritTimelineData: () => BoneInheritTimelineData,
    BoneNumberTimelineData: () => BoneNumberTimelineData,
    BoneParentTimelineData: () => BoneParentTimelineData,
    BonePoser: () => BonePoser,
    BoundingBoxAttachment: () => BoundingBoxAttachment,
    ClippingAttachment: () => ClippingAttachment,
    ConstraintBooleanTimelineData: () => ConstraintBooleanTimelineData,
    ConstraintData: () => ConstraintData,
    ConstraintNumberTimelineData: () => ConstraintNumberTimelineData,
    ConstraintResetTimelineData: () => ConstraintResetTimelineData,
    DEG_TO_RAD: () => DEG_TO_RAD,
    DeformTimelineData: () => DeformTimelineData,
    DrawOrderTimelineData: () => DrawOrderTimelineData,
    DriverConstraint: () => DriverConstraint,
    DriverConstraintData: () => DriverConstraintData,
    DriverTargetData: () => DriverTargetData,
    ELLIPSE_SEGMENTS: () => ELLIPSE_SEGMENTS,
    EMPTY_ANIMATION: () => EMPTY_ANIMATION,
    EPSILON_DET: () => EPSILON_DET,
    EPSILON_SCALE: () => EPSILON_SCALE,
    EmissionCurve: () => EmissionCurve,
    EventData: () => EventData,
    EventTimelineData: () => EventTimelineData,
    IkConstraint: () => IkConstraint,
    IkConstraintData: () => IkConstraintData,
    LINEAR_CURVE: () => LINEAR_CURVE,
    LinkedMeshAttachment: () => LinkedMeshAttachment,
    LoadError: () => LoadError,
    MAXIMO_DE_VERTICES: () => MAXIMO_DE_VERTICES,
    MAXIMO_DE_VOLTAS: () => MAXIMO_DE_VOLTAS,
    MAX_NESTED_DEPTH: () => MAX_NESTED_DEPTH,
    MISTURA_DO_CONSTRUCT: () => MISTURA_DO_CONSTRUCT,
    MeshAttachment: () => MeshAttachment,
    MorphData: () => MorphData,
    MorphTargetData: () => MorphTargetData,
    MorphTimelineData: () => MorphTimelineData,
    NestedAnimationTimelineData: () => NestedAnimationTimelineData,
    NestedNumberTimelineData: () => NestedNumberTimelineData,
    NestedSkeleton: () => NestedSkeleton,
    NoopConstraint: () => NoopConstraint,
    PARTICLE_ATTACHMENT_TYPE: () => PARTICLE_ATTACHMENT_TYPE,
    PARTICLE_CHANNEL: () => PARTICLE_CHANNEL,
    PARTICLE_FRAME_MODES: () => PARTICLE_FRAME_MODES,
    PARTICLE_MESH_MODES: () => PARTICLE_MESH_MODES,
    PARTICLE_SHAPES: () => PARTICLE_SHAPES,
    PARTICLE_SORT_MODES: () => PARTICLE_SORT_MODES,
    PARTICLE_SPACES: () => PARTICLE_SPACES,
    PI: () => PI,
    PI2: () => PI2,
    ParameterData: () => ParameterData,
    ParameterSourceData: () => ParameterSourceData,
    ParameterTimelineData: () => ParameterTimelineData,
    ParticleAttachment: () => ParticleAttachment,
    ParticleCache: () => ParticleCache,
    ParticleEmittingTimelineData: () => ParticleEmittingTimelineData,
    ParticleRateTimelineData: () => ParticleRateTimelineData,
    PathAttachment: () => PathAttachment,
    PathConstraint: () => PathConstraint,
    PathConstraintData: () => PathConstraintData,
    PhysicsConstraint: () => PhysicsConstraint,
    PhysicsConstraintData: () => PhysicsConstraintData,
    PointAttachment: () => PointAttachment,
    RAD_TO_DEG: () => RAD_TO_DEG,
    READER_VERSION: () => READER_VERSION,
    REGION_BL: () => REGION_BL,
    REGION_BR: () => REGION_BR,
    REGION_TL: () => REGION_TL,
    REGION_TR: () => REGION_TR,
    REGION_TRIANGLES: () => REGION_TRIANGLES,
    RegionAttachment: () => RegionAttachment,
    SKIN_DOS_ENCAIXES: () => SKIN_DOS_ENCAIXES,
    STEPPED_CURVE: () => STEPPED_CURVE,
    SUPPORTED_EXTENSIONS: () => SUPPORTED_EXTENSIONS,
    SequenceData: () => SequenceData,
    SequenceTimelineData: () => SequenceTimelineData,
    Skeleton: () => Skeleton,
    SkeletonAttachment: () => SkeletonAttachment,
    SkeletonData: () => SkeletonData,
    SkinData: () => SkinData,
    Slot: () => Slot,
    SlotAttachmentTimelineData: () => SlotAttachmentTimelineData,
    SlotBoneTimelineData: () => SlotBoneTimelineData,
    SlotColorTimelineData: () => SlotColorTimelineData,
    SlotDarkColorTimelineData: () => SlotDarkColorTimelineData,
    SlotData: () => SlotData,
    SlotVisibleTimelineData: () => SlotVisibleTimelineData,
    TETO_DE_PARTICULAS: () => TETO_DE_PARTICULAS,
    TagTimelineData: () => TagTimelineData,
    TimelineBase: () => TimelineBase,
    Tocador: () => Tocador,
    TrackEntry: () => TrackEntry,
    TransformConstraint: () => TransformConstraint,
    TransformConstraintData: () => TransformConstraintData,
    URI_MAX_LENGTH: () => URI_MAX_LENGTH,
    VISTA_PARADA: () => VISTA_PARADA,
    VariableData: () => VariableData,
    VariableNumberTimelineData: () => VariableNumberTimelineData,
    VariableSteppedTimelineData: () => VariableSteppedTimelineData,
    VertexAttachment: () => VertexAttachment,
    WeightsTimelineData: () => WeightsTimelineData,
    activeTags: () => activeTags,
    angleDistance: () => angleDistance,
    animationKeys: () => animationKeys,
    applyAnimation: () => applyAnimation,
    applyAnimationMixed: () => applyAnimationMixed,
    applyDrawOrder: () => applyDrawOrder,
    applyParentKey: () => applyParentKey,
    applyResets: () => applyResets,
    applySlotBoneKey: () => applySlotBoneKey,
    areaComSinal: () => areaComSinal,
    aroundMarker: () => aroundMarker,
    atan2: () => atan2,
    atan2Deg: () => atan2Deg,
    blendFactors: () => blendFactors,
    boneApplied: () => boneApplied,
    caixaDaInstancia: () => caixaDaInstancia,
    carregarBoneco: () => carregarBoneco,
    clamp: () => clamp,
    collectBirths: () => collectBirths,
    collectDrawGroups: () => collectDrawGroups,
    collectDrawList: () => collectDrawList,
    collectDrawables: () => collectDrawables,
    composeExternals: () => composeExternals,
    composeMatrix: () => composeMatrix,
    computeFinalColor: () => computeFinalColor,
    computeMeshRegionUVs: () => computeMeshRegionUVs,
    computeParticles: () => computeParticles,
    computeRegionFrame: () => computeRegionFrame,
    computeRegionUV: () => computeRegionUV,
    computeSequenceFrame: () => computeSequenceFrame,
    cortarPeca: () => cortarPeca,
    cosDeg: () => cosDeg,
    createConstraint: () => createConstraint,
    createFinalColor: () => createFinalColor,
    createNestedSkeleton: () => createNestedSkeleton,
    degToRad: () => degToRad,
    detectEncoding: () => detectEncoding,
    emitterMatrix: () => emitterMatrix,
    entityRunStart: () => entityRunStart,
    escapePointer: () => escapePointer,
    evaluateComponent: () => evaluateComponent,
    evaluateComponents: () => evaluateComponents,
    evaluateDarkColor: () => evaluateDarkColor,
    evaluateDeform: () => evaluateDeform,
    evaluateNumber: () => evaluateNumber,
    evaluateStepped: () => evaluateStepped,
    evaluateWeights: () => evaluateWeights,
    findAtlasRegion: () => findAtlasRegion,
    findDuplicateKey: () => findDuplicateKey,
    findKeyIndex: () => findKeyIndex,
    finishWorldWrite: () => finishWorldWrite,
    fireEvents: () => fireEvents,
    folderOfEntry: () => folderOfEntry,
    formatNumber: () => formatNumber,
    getConstraintFactory: () => getConstraintFactory,
    identityMatrix: () => identityMatrix,
    inheritMode: () => inheritMode,
    inverseTransformPoint: () => inverseTransformPoint,
    invertMatrix: () => invertMatrix,
    isNearZero: () => isNearZero,
    isParticleAttachment: () => isParticleAttachment,
    isPoseTimeline: () => isPoseTimeline,
    isValidUri: () => isValidUri,
    joinUri: () => joinUri,
    loadAnimationsFor: () => loadAnimationsFor,
    loadAtlas: () => loadAtlas,
    loadAtlasFromText: () => loadAtlasFromText,
    loadSkeletonData: () => loadSkeletonData,
    loadSkeletonFile: () => loadSkeletonFile,
    loadSkeletonFileAsync: () => loadSkeletonFileAsync,
    loadSkeletonFromText: () => loadSkeletonFromText,
    matrixDeterminant: () => matrixDeterminant,
    matrixRotationDeg: () => matrixRotationDeg,
    matrixScaleX: () => matrixScaleX,
    matrixScaleY: () => matrixScaleY,
    mixNumber: () => mixNumber,
    mixTakes: () => mixTakes,
    montarLotes: () => montarLotes,
    multiplyMatrix: () => multiplyMatrix,
    nestedAttachments: () => nestedAttachments,
    nestedEventName: () => nestedEventName,
    newBirthReport: () => newBirthReport,
    noLayout: () => noLayout,
    normalizeAngle: () => normalizeAngle,
    normalizeCurve: () => normalizeCurve,
    normalizeRadians: () => normalizeRadians,
    paraConstruct: () => paraConstruct,
    parameterFromSource: () => parameterFromSource,
    parameterValue: () => parameterValue,
    parseBoneText: () => parseBoneText,
    parseVersion: () => parseVersion,
    particleFrame: () => particleFrame,
    particleRandom: () => particleRandom,
    particleRange: () => particleRange,
    pcg: () => pcg,
    pecasDoQuadro: () => pecasDoQuadro,
    pose: () => pose,
    poseActor: () => poseActor,
    radToDeg: () => radToDeg,
    referenceFactor: () => referenceFactor,
    refreshParameter: () => refreshParameter,
    refreshSourceParameters: () => refreshSourceParameters,
    registerConstraint: () => registerConstraint,
    registerNestedFactory: () => registerNestedFactory,
    resolveNestedSkeletons: () => resolveNestedSkeletons,
    runStart: () => runStart,
    sampleCurve: () => sampleCurve,
    sanitize: () => sanitize,
    scaleTranslations: () => scaleTranslations,
    seCruza: () => seCruza,
    selfIntersection: () => selfIntersection,
    sequenceFrameAt: () => sequenceFrameAt,
    setBoneApplied: () => setBoneApplied,
    shadeTexel: () => shadeTexel,
    sinDeg: () => sinDeg,
    skinsDaPropriedade: () => skinsDaPropriedade,
    solveBezierParameter: () => solveBezierParameter,
    stripBom: () => stripBom,
    timelineKey: () => timelineKey,
    transformPoint: () => transformPoint,
    translateBindings: () => translateBindings,
    triangularMascara: () => triangularMascara,
    validateUri: () => validateUri
  });

  // runtime/src/math.ts
  var PI = Math.PI;
  var PI2 = Math.PI * 2;
  var DEG_TO_RAD = Math.PI / 180;
  var RAD_TO_DEG = 180 / Math.PI;
  var EPSILON_DET = 1e-4;
  var EPSILON_SCALE = 1e-5;
  function degToRad(degrees) {
    return degrees * DEG_TO_RAD;
  }
  function radToDeg(radians) {
    return radians * RAD_TO_DEG;
  }
  function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
  }
  function normalizeAngle(degrees) {
    let r = degrees % 360;
    if (r <= -180) r += 360;
    else if (r > 180) r -= 360;
    if (r === -180) r = 180;
    return r === 0 ? 0 : r;
  }
  function normalizeRadians(radians) {
    let r = radians % PI2;
    if (r <= -PI) r += PI2;
    else if (r > PI) r -= PI2;
    if (r === -PI) r = PI;
    return r === 0 ? 0 : r;
  }
  function isNearZero(value, threshold = EPSILON_DET) {
    return Math.abs(value) <= threshold;
  }
  function sanitize(value) {
    return Number.isFinite(value) ? value : 0;
  }
  function cosDeg(degrees) {
    return Math.cos(degrees * DEG_TO_RAD);
  }
  function sinDeg(degrees) {
    return Math.sin(degrees * DEG_TO_RAD);
  }
  function atan2(y, x) {
    if (y === 0 && x === 0) return 0;
    return Math.atan2(y, x);
  }
  function atan2Deg(y, x) {
    return atan2(y, x) * RAD_TO_DEG;
  }
  function angleDistance(a, b) {
    return Math.abs(normalizeAngle(a - b));
  }
  function identityMatrix() {
    return { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  }
  function matrixDeterminant(m) {
    return m.a * m.d - m.b * m.c;
  }
  function invertMatrix(m, out = identityMatrix()) {
    const det = matrixDeterminant(m);
    if (Math.abs(det) <= EPSILON_DET) {
      out.a = 0;
      out.b = 0;
      out.c = 0;
      out.d = 0;
      out.worldX = 0;
      out.worldY = 0;
      return out;
    }
    const id = 1 / det;
    const a = m.d * id;
    const b = -m.b * id;
    const c = -m.c * id;
    const d = m.a * id;
    out.a = a;
    out.b = b;
    out.c = c;
    out.d = d;
    out.worldX = -(a * m.worldX + b * m.worldY);
    out.worldY = -(c * m.worldX + d * m.worldY);
    return out;
  }
  function multiplyMatrix(m1, m2, out = identityMatrix()) {
    const a = m1.a * m2.a + m1.b * m2.c;
    const b = m1.a * m2.b + m1.b * m2.d;
    const c = m1.c * m2.a + m1.d * m2.c;
    const d = m1.c * m2.b + m1.d * m2.d;
    const x = m1.a * m2.worldX + m1.b * m2.worldY + m1.worldX;
    const y = m1.c * m2.worldX + m1.d * m2.worldY + m1.worldY;
    out.a = a;
    out.b = b;
    out.c = c;
    out.d = d;
    out.worldX = x;
    out.worldY = y;
    return out;
  }
  function composeMatrix(x, y, rotation, scaleX, scaleY, out = identityMatrix()) {
    const c = cosDeg(rotation);
    const s = sinDeg(rotation);
    out.a = c * scaleX;
    out.b = -s * scaleY;
    out.c = s * scaleX;
    out.d = c * scaleY;
    out.worldX = x;
    out.worldY = y;
    return out;
  }
  function transformPoint(m, lx, ly, out = { x: 0, y: 0 }) {
    out.x = m.a * lx + m.b * ly + m.worldX;
    out.y = m.c * lx + m.d * ly + m.worldY;
    return out;
  }
  function inverseTransformPoint(m, wx, wy, out = { x: 0, y: 0 }) {
    const det = matrixDeterminant(m);
    if (Math.abs(det) <= EPSILON_DET) {
      out.x = 0;
      out.y = 0;
      return out;
    }
    const x = wx - m.worldX;
    const y = wy - m.worldY;
    out.x = (x * m.d - y * m.b) / det;
    out.y = (y * m.a - x * m.c) / det;
    return out;
  }
  function matrixRotationDeg(m) {
    return atan2Deg(m.c, m.a);
  }
  function matrixScaleX(m) {
    return Math.sqrt(m.a * m.a + m.c * m.c);
  }
  function matrixScaleY(m) {
    return Math.sqrt(m.b * m.b + m.d * m.d);
  }

  // runtime/src/curve.ts
  var LINEAR_CURVE = Object.freeze({ kind: "linear", controls: null });
  var STEPPED_CURVE = Object.freeze({ kind: "stepped", controls: null });
  function normalizeCurve(curve, components, interpolable, t0, t1, warn) {
    if (!interpolable) return STEPPED_CURVE;
    if (curve === void 0 || curve === "linear") return LINEAR_CURVE;
    if (curve === "stepped") return STEPPED_CURVE;
    if (typeof curve === "string") {
      warn?.(`unknown curve "${curve}", using "linear"`);
      return LINEAR_CURVE;
    }
    if (!Array.isArray(curve)) {
      warn?.('curve must be a string or an array, using "linear"');
      return LINEAR_CURVE;
    }
    if (curve.length !== 4 * components) {
      warn?.(`curve has ${curve.length} numbers, expected ${4 * components}, using "linear"`);
      return LINEAR_CURVE;
    }
    for (let i = 0; i < curve.length; i++) {
      const v = curve[i];
      if (typeof v !== "number" || !Number.isFinite(v)) {
        warn?.(`curve has a non-numeric entry at index ${i}, using "linear"`);
        return LINEAR_CURVE;
      }
    }
    const controls = new Float64Array(curve.length);
    for (let j = 0; j < components; j++) {
      const base = j * 4;
      let cx1 = curve[base];
      const cy1 = curve[base + 1];
      let cx2 = curve[base + 2];
      const cy2 = curve[base + 3];
      const c1 = clamp(cx1, t0, t1);
      if (c1 !== cx1) warn?.(`curve cx1 ${cx1} outside [${t0}, ${t1}], clamped`);
      cx1 = c1;
      const c2 = clamp(cx2, cx1, t1);
      if (c2 !== cx2) warn?.(`curve cx2 ${cx2} outside [${cx1}, ${t1}], clamped`);
      cx2 = c2;
      controls[base] = cx1;
      controls[base + 1] = cy1;
      controls[base + 2] = cx2;
      controls[base + 3] = cy2;
    }
    return { kind: "bezier", controls };
  }
  function solveBezierParameter(t0, cx1, cx2, t1, t) {
    const span = t1 - t0;
    if (span <= 0) return 0;
    if (t <= t0) return 0;
    if (t >= t1) return 1;
    const epsilon = 1e-12;
    let s = (t - t0) / span;
    let lo = 0;
    let hi = 1;
    for (let i = 0; i < 64; i++) {
      const u = 1 - s;
      const x = u * u * u * t0 + 3 * u * u * s * cx1 + 3 * u * s * s * cx2 + s * s * s * t1;
      const err = x - t;
      if (err === 0) return s;
      if (err > 0) hi = s;
      else lo = s;
      if (hi - lo <= epsilon) break;
      const dx = 3 * u * u * (cx1 - t0) + 6 * u * s * (cx2 - cx1) + 3 * s * s * (t1 - cx2);
      let next = dx > 1e-12 ? s - err / dx : (lo + hi) / 2;
      if (next <= lo || next >= hi) next = (lo + hi) / 2;
      if (Math.abs(next - s) <= epsilon) {
        s = next;
        break;
      }
      s = next;
    }
    return clamp(s, 0, 1);
  }
  function sampleCurve(curve, j, t0, t1, v0, v1, t) {
    if (curve.kind === "stepped") return v0;
    if (curve.kind === "linear" || curve.controls === null) {
      if (t1 === t0) return v0;
      return v0 + (v1 - v0) * (t - t0) / (t1 - t0);
    }
    const c = curve.controls;
    const base = j * 4;
    const s = solveBezierParameter(t0, c[base], c[base + 2], t1, t);
    const u = 1 - s;
    return u * u * u * v0 + 3 * u * u * s * c[base + 1] + 3 * u * s * s * c[base + 3] + s * s * s * v1;
  }

  // runtime/src/attachments/attachment.ts
  var Attachment = class {
    constructor(name, color = [1, 1, 1, 1]) {
      /** Placeholder name (key inside the skin). */
      __publicField(this, "name");
      /** `[r, g, b, a]`, straight alpha, 0..1. */
      __publicField(this, "color");
      this.name = name;
      this.color = new Float64Array([color[0] ?? 1, color[1] ?? 1, color[2] ?? 1, color[3] ?? 1]);
    }
  };

  // runtime/src/attachments/vertex-attachment.ts
  var BindingData = class {
    constructor(counts, bones, positions, weights) {
      /** Influences per vertex. Length `N`. */
      __publicField(this, "counts");
      /** Bone index per influence. Length `sum(counts)`. */
      __publicField(this, "bones");
      /** `[x, y]` per influence in that bone's local space. Length `2 x sum(counts)`. */
      __publicField(this, "positions");
      /** Weight per influence. Length `sum(counts)`. */
      __publicField(this, "weights");
      this.counts = Int32Array.from(counts);
      this.bones = Int32Array.from(bones);
      this.positions = Float64Array.from(positions);
      this.weights = Float64Array.from(weights);
    }
    get influenceCount() {
      return this.bones.length;
    }
  };
  var VertexAttachment = class extends Attachment {
    constructor(name, color, vertices, binding) {
      super(name, color);
      /** Number of vertices `N`. */
      __publicField(this, "vertexCount");
      /**
       * Unweighted: `2N` numbers `[x, y]` in the slot bone space.
       * Weighted: unused (`binding.positions` holds the data). Empty array in that case.
       */
      __publicField(this, "vertices");
      __publicField(this, "binding");
      /** Length of the deform / morph offsets layout: `2N` or `2 x sum(counts)` (spec 7.4). */
      __publicField(this, "deformLength");
      /**
       * Attachment whose deform timelines and morphs apply to this one. Itself,
       * except for a linked mesh with `inheritDeform: true` (spec 7.5).
       */
      __publicField(this, "timelineAttachment");
      /** Morph targets pointing at this attachment. Filled by the loader. */
      __publicField(this, "morphInfluences", []);
      this.binding = binding;
      if (binding !== null) {
        this.vertices = new Float64Array(0);
        this.vertexCount = binding.counts.length;
        this.deformLength = binding.positions.length;
      } else {
        this.vertices = vertices === null ? new Float64Array(0) : vertices instanceof Float64Array ? vertices : Float64Array.from(vertices);
        this.vertexCount = this.vertices.length >> 1;
        this.deformLength = this.vertices.length;
      }
      this.timelineAttachment = this;
    }
    /**
     * Computes the world position of every vertex (spec 7.4 `worldVertices`).
     * Writes `x, y` pairs into `out` starting at `offset`, advancing `stride`
     * per vertex. Returns `out`.
     */
    computeWorldVertices(slot, out = new Float64Array(this.vertexCount * 2), offset = 0, stride = 2) {
      const delta = this.computeDelta(slot);
      const binding = this.binding;
      const n = this.vertexCount;
      if (binding === null) {
        const bone = slot.boneMatrix;
        const a = bone.a, b = bone.b, c = bone.c, d = bone.d, wx = bone.worldX, wy = bone.worldY;
        const verts = this.vertices;
        for (let v = 0, j2 = 0, o = offset; v < n; v++, j2 += 2, o += stride) {
          let lx = verts[j2];
          let ly = verts[j2 + 1];
          if (delta !== null) {
            lx += delta[j2];
            ly += delta[j2 + 1];
          }
          out[o] = a * lx + b * ly + wx;
          out[o + 1] = c * lx + d * ly + wy;
        }
        return out;
      }
      const bones = slot.skeleton.bones;
      const counts = binding.counts;
      const boneIndices = binding.bones;
      const positions = binding.positions;
      const weights = slot.weights !== null && slot.weightsAttachment === this.timelineAttachment && slot.weights.length === binding.weights.length ? slot.weights : binding.weights;
      let j = 0;
      for (let v = 0, o = offset; v < n; v++, o += stride) {
        let wx = 0;
        let wy = 0;
        const count = counts[v];
        for (let k = 0; k < count; k++, j++) {
          const bone = bones[boneIndices[j]];
          let px = positions[j * 2];
          let py = positions[j * 2 + 1];
          if (delta !== null) {
            px += delta[j * 2];
            py += delta[j * 2 + 1];
          }
          const w = weights[j];
          wx += (bone.a * px + bone.b * py + bone.worldX) * w;
          wy += (bone.c * px + bone.d * py + bone.worldY) * w;
        }
        out[o] = wx;
        out[o + 1] = wy;
      }
      return out;
    }
    /**
     * `delta(j) = deform[j] + morphSum[j]` (spec 7.4, 8.3), or `null` when both
     * are absent (fast path). Missing entries count as 0.
     *
     * The result lives in `slot.deltaScratch`, reused between calls (no
     * allocation per frame); it is valid only until the next call for that slot.
     */
    computeDelta(slot) {
      const length = this.deformLength;
      const timelineAttachment = this.timelineAttachment;
      const deform = slot.deformAttachment === timelineAttachment ? slot.deform : null;
      const influences = timelineAttachment.morphInfluences;
      const weights = slot.skeleton.morphWeights;
      let hasMorph = false;
      for (let i = 0; i < influences.length; i++) {
        const m = influences[i].morph;
        if (clamp(weights[m.index], m.min, m.max) !== 0) {
          hasMorph = true;
          break;
        }
      }
      if ((deform === null || deform.length === 0) && !hasMorph) return null;
      let delta = slot.deltaScratch;
      if (delta === null || delta.length < length) {
        delta = new Float64Array(length);
        slot.deltaScratch = delta;
      }
      let j = 0;
      if (deform !== null) {
        const n = Math.min(deform.length, length);
        for (; j < n; j++) delta[j] = deform[j];
      }
      for (; j < length; j++) delta[j] = 0;
      if (hasMorph) {
        for (let i = 0; i < influences.length; i++) {
          const { morph, offsets } = influences[i];
          const w = clamp(weights[morph.index], morph.min, morph.max);
          if (w === 0) continue;
          const n = Math.min(offsets.length, length);
          for (let j2 = 0; j2 < n; j2++) delta[j2] += w * offsets[j2];
        }
      }
      return delta;
    }
  };

  // runtime/src/attachments/region.ts
  var REGION_BL = 0;
  var REGION_BR = 2;
  var REGION_TR = 4;
  var REGION_TL = 6;
  var REGION_TRIANGLES = Object.freeze([0, 1, 2, 0, 2, 3]);
  function computeRegionFrame(params, region, outOffsets, outUVs) {
    let originalW, originalH, cropW, cropH, offX, offY;
    if (region !== null) {
      const s2 = region.scale;
      originalW = region.originalWidth / s2;
      originalH = region.originalHeight / s2;
      cropW = region.width / s2;
      cropH = region.height / s2;
      offX = region.offsetX / s2;
      offY = region.offsetY / s2;
    } else {
      originalW = params.width;
      originalH = params.height;
      cropW = originalW;
      cropH = originalH;
      offX = 0;
      offY = 0;
    }
    const W = params.width !== 0 ? params.width : originalW;
    const H = params.height !== 0 ? params.height : originalH;
    const kx = originalW !== 0 ? W / originalW : 1;
    const ky = originalH !== 0 ? H / originalH : 1;
    const x0 = (-originalW / 2 + offX) * kx;
    const x1 = x0 + cropW * kx;
    const y0 = (-originalH / 2 + offY) * ky;
    const y1 = y0 + cropH * ky;
    const c = cosDeg(params.rotation);
    const s = sinDeg(params.rotation);
    const sx = params.scaleX;
    const sy = params.scaleY;
    const x = params.x;
    const y = params.y;
    const o = outOffsets;
    o[0] = x0 * sx * c - y0 * sy * s + x;
    o[1] = x0 * sx * s + y0 * sy * c + y;
    o[2] = x1 * sx * c - y0 * sy * s + x;
    o[3] = x1 * sx * s + y0 * sy * c + y;
    o[4] = x1 * sx * c - y1 * sy * s + x;
    o[5] = x1 * sx * s + y1 * sy * c + y;
    o[6] = x0 * sx * c - y1 * sy * s + x;
    o[7] = x0 * sx * s + y1 * sy * c + y;
    const uv = outUVs;
    if (region !== null) {
      const ow = region.originalWidth;
      const oh = region.originalHeight;
      const u0 = ow !== 0 ? region.offsetX / ow : 0;
      const u1 = ow !== 0 ? (region.offsetX + region.width) / ow : 1;
      const v1 = oh !== 0 ? 1 - region.offsetY / oh : 1;
      const v0 = oh !== 0 ? 1 - (region.offsetY + region.height) / oh : 0;
      region.computeUV(u0, v1, uv, 0);
      region.computeUV(u1, v1, uv, 2);
      region.computeUV(u1, v0, uv, 4);
      region.computeUV(u0, v0, uv, 6);
    } else {
      uv[0] = 0;
      uv[1] = 1;
      uv[2] = 1;
      uv[3] = 1;
      uv[4] = 1;
      uv[5] = 0;
      uv[6] = 0;
      uv[7] = 0;
    }
  }
  var RegionAttachment = class extends Attachment {
    constructor(name, options = {}) {
      super(name, options.color);
      __publicField(this, "type", "region");
      __publicField(this, "path");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "rotation");
      __publicField(this, "scaleX");
      __publicField(this, "scaleY");
      /** Original image size in skeleton px. `0` = take it from the atlas. */
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "sequence");
      /** Atlas region of the setup frame (`null` = image missing; nothing is drawn). */
      __publicField(this, "region", null);
      /** Local corners `[x, y] x 4` of the setup frame in the slot bone space. */
      __publicField(this, "offsets", new Float64Array(8));
      /** Page UVs `[u, v] x 4` of the setup frame, matching `offsets` (spec 10.4). */
      __publicField(this, "uvs", new Float64Array(8));
      /** Per sequence frame: local corners (empty without a sequence). */
      __publicField(this, "frameOffsets", []);
      /** Per sequence frame: page UVs (empty without a sequence). */
      __publicField(this, "frameUVs", []);
      this.path = options.path ?? name;
      this.x = options.x ?? 0;
      this.y = options.y ?? 0;
      this.rotation = options.rotation ?? 0;
      this.scaleX = options.scaleX ?? 1;
      this.scaleY = options.scaleY ?? 1;
      this.width = options.width ?? 0;
      this.height = options.height ?? 0;
      this.sequence = options.sequence ?? null;
      this.updateRegion();
    }
    /**
     * Sets the atlas region of the setup frame and recomputes corners and UVs.
     * With a sequence, every frame is recomputed from `sequence.regions`.
     * Loader and editor use only; never called while rendering.
     */
    setRegion(region) {
      this.region = region;
      this.updateRegion();
    }
    /** Effective original width in skeleton px (spec 7.3 `W`). */
    get effectiveWidth() {
      if (this.width !== 0) return this.width;
      const r = this.region;
      return r === null ? 0 : r.originalWidth / r.scale;
    }
    get effectiveHeight() {
      if (this.height !== 0) return this.height;
      const r = this.region;
      return r === null ? 0 : r.originalHeight / r.scale;
    }
    /** Recomputes `offsets` / `uvs` and, with a sequence, every frame. */
    updateRegion() {
      computeRegionFrame(this, this.region, this.offsets, this.uvs);
      const sequence = this.sequence;
      if (sequence === null) return;
      const count = sequence.count;
      this.frameOffsets.length = count;
      this.frameUVs.length = count;
      for (let i = 0; i < count; i++) {
        const o = this.frameOffsets[i] ?? (this.frameOffsets[i] = new Float64Array(8));
        const uv = this.frameUVs[i] ?? (this.frameUVs[i] = new Float64Array(8));
        computeRegionFrame(this, sequence.regions[i] ?? null, o, uv);
      }
    }
    /** Sequence frame shown for `slot`, or `-1` without a sequence. */
    frameIndexFor(slot) {
      return this.sequence === null ? -1 : this.sequence.frameIndexFor(slot);
    }
    /** Atlas region drawn for `slot` (the current frame, or the setup region). */
    regionFor(slot) {
      const sequence = this.sequence;
      if (sequence === null) return this.region;
      return sequence.regions[sequence.frameIndexFor(slot)] ?? null;
    }
    /** Local corners for `slot` (read only; the current frame with a sequence). */
    offsetsFor(slot) {
      const sequence = this.sequence;
      if (sequence === null) return this.offsets;
      return this.frameOffsets[sequence.frameIndexFor(slot)] ?? this.offsets;
    }
    /** Page UVs for `slot` (read only; the current frame with a sequence). */
    uvsFor(slot) {
      const sequence = this.sequence;
      if (sequence === null) return this.uvs;
      return this.frameUVs[sequence.frameIndexFor(slot)] ?? this.uvs;
    }
    /**
     * World position of the four corners (spec 7.3). Writes `x, y` pairs into
     * `out` from `offset`, advancing `stride` per corner. Uses the current
     * sequence frame of the slot when the attachment has a sequence. Never
     * mutates the attachment.
     */
    computeWorldVertices(slot, out = new Float64Array(8), offset = 0, stride = 2) {
      const bone = slot.boneMatrix;
      const a = bone.a, b = bone.b, c = bone.c, d = bone.d, wx = bone.worldX, wy = bone.worldY;
      const o = this.offsetsFor(slot);
      for (let i = 0, j = offset; i < 8; i += 2, j += stride) {
        const lx = o[i];
        const ly = o[i + 1];
        out[j] = a * lx + b * ly + wx;
        out[j + 1] = c * lx + d * ly + wy;
      }
      return out;
    }
  };

  // runtime/src/attachments/mesh.ts
  function computeMeshRegionUVs(uvs, region, out) {
    if (region === null) {
      out.set(uvs);
      return;
    }
    for (let i = 0; i < uvs.length; i += 2) region.computeUV(uvs[i], uvs[i + 1], out, i);
  }
  var MeshAttachment = class extends VertexAttachment {
    constructor(name, options) {
      super(name, options.color, options.vertices ?? null, options.binding ?? null);
      __publicField(this, "type", "mesh");
      __publicField(this, "path");
      /** `2N` numbers, original image space, `v` down. */
      __publicField(this, "uvs");
      /** `3T` vertex indices, counter-clockwise in skeleton space. */
      __publicField(this, "triangles");
      __publicField(this, "hull");
      /** Pairs of vertex indices. Editor only. */
      __publicField(this, "edges");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "sequence");
      /** Atlas region of the setup frame (`null` = image missing). */
      __publicField(this, "region", null);
      /** Page UVs (`2N`) of the setup frame; equals `uvs` when `region === null`. */
      __publicField(this, "regionUVs");
      /** Per sequence frame: page UVs (empty without a sequence). */
      __publicField(this, "frameRegionUVs", []);
      this.path = options.path ?? name;
      this.uvs = Float64Array.from(options.uvs);
      this.triangles = Int32Array.from(options.triangles);
      this.hull = options.hull ?? this.vertexCount;
      this.edges = options.edges ? Int32Array.from(options.edges) : new Int32Array(0);
      this.width = options.width ?? 0;
      this.height = options.height ?? 0;
      this.sequence = options.sequence ?? null;
      this.regionUVs = new Float64Array(this.uvs.length);
      this.updateRegion();
    }
    /** Sets the setup region and recomputes the page UVs (every frame with a sequence). Loader / editor only. */
    setRegion(region) {
      this.region = region;
      this.updateRegion();
    }
    /** Maps `uvs` (original image) to the page (spec 10.4), for the setup region and every frame. */
    updateRegion() {
      computeMeshRegionUVs(this.uvs, this.region, this.regionUVs);
      const sequence = this.sequence;
      if (sequence === null) return;
      const count = sequence.count;
      this.frameRegionUVs.length = count;
      for (let i = 0; i < count; i++) {
        const out = this.frameRegionUVs[i] ?? (this.frameRegionUVs[i] = new Float64Array(this.uvs.length));
        computeMeshRegionUVs(this.uvs, sequence.regions[i] ?? null, out);
      }
    }
    /** Sequence frame shown for `slot`, or `-1` without a sequence. */
    frameIndexFor(slot) {
      return this.sequence === null ? -1 : this.sequence.frameIndexFor(slot);
    }
    /** Atlas region drawn for `slot` (the current frame, or the setup region). */
    regionFor(slot) {
      const sequence = this.sequence;
      if (sequence === null) return this.region;
      return sequence.regions[sequence.frameIndexFor(slot)] ?? null;
    }
    /** Page UVs for `slot` (read only; the current frame with a sequence). */
    regionUVsFor(slot) {
      const sequence = this.sequence;
      if (sequence === null) return this.regionUVs;
      return this.frameRegionUVs[sequence.frameIndexFor(slot)] ?? this.regionUVs;
    }
    /** Number of triangles `T`. */
    get triangleCount() {
      return this.triangles.length / 3;
    }
  };

  // runtime/src/attachments/linkedmesh.ts
  var LinkedMeshAttachment = class extends VertexAttachment {
    constructor(name, parent, options = {}) {
      super(name, options.color, parent.binding === null ? parent.vertices : null, parent.binding);
      __publicField(this, "type", "linkedmesh");
      __publicField(this, "path");
      __publicField(this, "parent");
      /** Name of the skin where `parent` lives. */
      __publicField(this, "parentSkin");
      __publicField(this, "inheritDeform");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "sequence");
      /** Atlas region of the setup frame (`null` = image missing). */
      __publicField(this, "region", null);
      /** Page UVs of the setup frame. */
      __publicField(this, "regionUVs");
      /** Per sequence frame: page UVs (empty without a sequence). */
      __publicField(this, "frameRegionUVs", []);
      this.parent = parent;
      this.path = options.path ?? name;
      this.parentSkin = options.skin ?? "default";
      this.inheritDeform = options.inheritDeform ?? true;
      this.width = options.width ?? 0;
      this.height = options.height ?? 0;
      this.sequence = options.sequence ?? null;
      if (this.inheritDeform) this.timelineAttachment = parent;
      this.regionUVs = new Float64Array(parent.uvs.length);
      this.updateRegion();
    }
    get uvs() {
      return this.parent.uvs;
    }
    get triangles() {
      return this.parent.triangles;
    }
    get hull() {
      return this.parent.hull;
    }
    get edges() {
      return this.parent.edges;
    }
    get triangleCount() {
      return this.parent.triangleCount;
    }
    /** Sets the setup region and recomputes the page UVs (every frame with a sequence). Loader / editor only. */
    setRegion(region) {
      this.region = region;
      this.updateRegion();
    }
    updateRegion() {
      const uvs = this.parent.uvs;
      computeMeshRegionUVs(uvs, this.region, this.regionUVs);
      const sequence = this.sequence;
      if (sequence === null) return;
      const count = sequence.count;
      this.frameRegionUVs.length = count;
      for (let i = 0; i < count; i++) {
        const out = this.frameRegionUVs[i] ?? (this.frameRegionUVs[i] = new Float64Array(uvs.length));
        computeMeshRegionUVs(uvs, sequence.regions[i] ?? null, out);
      }
    }
    /** Sequence frame shown for `slot`, or `-1` without a sequence. */
    frameIndexFor(slot) {
      return this.sequence === null ? -1 : this.sequence.frameIndexFor(slot);
    }
    /** Atlas region drawn for `slot` (the current frame, or the setup region). */
    regionFor(slot) {
      const sequence = this.sequence;
      if (sequence === null) return this.region;
      return sequence.regions[sequence.frameIndexFor(slot)] ?? null;
    }
    /** Page UVs for `slot` (read only; the current frame with a sequence). */
    regionUVsFor(slot) {
      const sequence = this.sequence;
      if (sequence === null) return this.regionUVs;
      return this.frameRegionUVs[sequence.frameIndexFor(slot)] ?? this.regionUVs;
    }
  };

  // runtime/src/attachments/boundingbox.ts
  var ELLIPSE_SEGMENTS = 16;
  var BoundingBoxAttachment = class extends VertexAttachment {
    constructor(name, options = {}) {
      const shape = options.shape ?? "polygon";
      const x = options.x ?? 0;
      const y = options.y ?? 0;
      const width = options.width ?? 0;
      const height = options.height ?? 0;
      const rotation = options.rotation ?? 0;
      let vertices = options.vertices ?? null;
      let binding = options.binding ?? null;
      if (shape !== "polygon") {
        binding = null;
        vertices = shape === "rectangle" ? rectangleVertices(x, y, width, height, rotation) : ellipseVertices(x, y, width, height, rotation, ELLIPSE_SEGMENTS);
      }
      super(name, options.color, vertices, binding);
      __publicField(this, "type", "boundingbox");
      __publicField(this, "shape");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "rotation");
      this.shape = shape;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.rotation = rotation;
    }
  };
  function rectangleVertices(x, y, width, height, rotation) {
    const hw = width / 2;
    const hh = height / 2;
    const c = cosDeg(rotation);
    const s = sinDeg(rotation);
    const corners = [-hw, -hh, hw, -hh, hw, hh, -hw, hh];
    const out = [];
    for (let i = 0; i < 8; i += 2) {
      const px = corners[i];
      const py = corners[i + 1];
      out.push(px * c - py * s + x, px * s + py * c + y);
    }
    return out;
  }
  function ellipseVertices(x, y, width, height, rotation, segments) {
    const rx = width / 2;
    const ry = height / 2;
    const c = cosDeg(rotation);
    const s = sinDeg(rotation);
    const out = [];
    for (let i = 0; i < segments; i++) {
      const t = i / segments * Math.PI * 2;
      const px = Math.cos(t) * rx;
      const py = Math.sin(t) * ry;
      out.push(px * c - py * s + x, px * s + py * c + y);
    }
    return out;
  }

  // runtime/src/attachments/clipping.ts
  var ClippingAttachment = class extends VertexAttachment {
    constructor(name, options = {}) {
      super(name, options.color, options.vertices ?? null, options.binding ?? null);
      __publicField(this, "type", "clipping");
      /** Last clipped slot (inclusive) in the current draw order. `null` = none. */
      __publicField(this, "endSlot");
      /** Explicit list of clipped slots. When present `endSlot` is ignored. */
      __publicField(this, "slots");
      __publicField(this, "invert");
      this.endSlot = options.endSlot ?? null;
      this.slots = options.slots ?? null;
      this.invert = options.invert ?? false;
    }
    /** Whether this mask clips anything at all (spec 7.7). */
    get clipsAnything() {
      return this.slots !== null || this.endSlot !== null;
    }
  };

  // runtime/src/attachments/path.ts
  var PathAttachment = class extends VertexAttachment {
    constructor(name, options = {}) {
      super(name, options.color, options.vertices ?? null, options.binding ?? null);
      __publicField(this, "type", "path");
      __publicField(this, "closed");
      __publicField(this, "constantSpeed");
      /** Accumulated length up to the end of each curve, setup pose. One entry per curve. */
      __publicField(this, "lengths");
      this.closed = options.closed ?? false;
      this.constantSpeed = options.constantSpeed ?? true;
      this.lengths = options.lengths ? Float64Array.from(options.lengths) : new Float64Array(0);
    }
    /** Number of anchors `K` (`vertexCount / 3`). */
    get anchorCount() {
      return Math.floor(this.vertexCount / 3);
    }
    /** Number of curves: `K - 1` open, `K` closed. */
    get curveCount() {
      const k = this.anchorCount;
      return this.closed ? k : Math.max(0, k - 1);
    }
  };

  // runtime/src/attachments/point.ts
  var PointAttachment = class extends Attachment {
    constructor(name, options = {}) {
      super(name, options.color);
      __publicField(this, "type", "point");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "rotation");
      this.x = options.x ?? 0;
      this.y = options.y ?? 0;
      this.rotation = options.rotation ?? 0;
    }
    /** World position (spec 7.9 `pointWorld`). */
    computeWorldPosition(bone, out = { x: 0, y: 0 }) {
      out.x = bone.a * this.x + bone.b * this.y + bone.worldX;
      out.y = bone.c * this.x + bone.d * this.y + bone.worldY;
      return out;
    }
    /** World rotation in degrees (spec 7.9 `pointWorld`). */
    computeWorldRotation(bone) {
      const cos = cosDeg(this.rotation);
      const sin = sinDeg(this.rotation);
      return atan2Deg(cos * bone.c + sin * bone.d, cos * bone.a + sin * bone.b);
    }
  };

  // runtime/src/attachments/skeleton-attachment.ts
  var SkeletonAttachment = class extends Attachment {
    constructor(name, options) {
      super(name, options.color);
      __publicField(this, "type", "skeleton");
      __publicField(this, "uri");
      __publicField(this, "skins");
      __publicField(this, "animation");
      __publicField(this, "loop");
      __publicField(this, "timeScale");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "rotation");
      __publicField(this, "scaleX");
      __publicField(this, "scaleY");
      __publicField(this, "inheritColor");
      /** Spec 7.11 channel 2: play the animation with the name the parent is playing. */
      __publicField(this, "inheritAnimation");
      /** Spec 7.11 background channel: child animation always running underneath, looping. */
      __publicField(this, "baseAnimation");
      /**
       * Spec 7.11, "around": the child's slot that marks the middle. The child is
       * drawn around the skeleton that receives it — what comes before that slot
       * behind the whole of it, what comes after in front. `null` = one block.
       */
      __publicField(this, "around");
      /**
       * `uri` resolved against `assets.skeletonsBase` (spec 2.8). Written by the
       * loader; equal to `uri` while nothing resolved it.
       */
      __publicField(this, "resolvedUri");
      /** The loaded child file, or `null` while `uri` did not resolve (spec 7.11). */
      __publicField(this, "child", null);
      /** `T(x, y) R(rotation) S(scaleX, scaleY)`, precomputed. */
      __publicField(this, "localMatrix");
      this.uri = options.uri;
      this.resolvedUri = options.uri;
      this.skins = options.skins ?? [];
      this.animation = options.animation ?? null;
      this.loop = options.loop ?? true;
      this.timeScale = options.timeScale ?? 1;
      this.x = options.x ?? 0;
      this.y = options.y ?? 0;
      this.rotation = options.rotation ?? 0;
      this.scaleX = options.scaleX ?? 1;
      this.scaleY = options.scaleY ?? 1;
      this.inheritColor = options.inheritColor ?? true;
      this.inheritAnimation = options.inheritAnimation ?? false;
      this.baseAnimation = options.baseAnimation ?? null;
      this.around = options.around ?? null;
      this.localMatrix = composeMatrix(this.x, this.y, this.rotation, this.scaleX, this.scaleY);
    }
    /**
     * Matrix the child root bone uses as its parent (spec 7.11):
     * `P = M x T(x, y) R(rotation) S(scaleX, scaleY)`, with `M` the matrix of the
     * slot's APPLIED bone — `Slot.boneMatrix`, which already carries the
     * `transform` of a `slot/bone` key (9.5). The entity follows the image.
     */
    computeParentMatrix(bone, out = identityMatrix()) {
      return multiplyMatrix(bone, this.localMatrix, out);
    }
  };

  // runtime/src/attachments/sequence.ts
  var SequenceData = class {
    constructor(frames, start, digits, setup) {
      /** Number of frames. */
      __publicField(this, "count");
      /** Frame image names, already generated (`frames[]` or `path + number`). */
      __publicField(this, "frames");
      __publicField(this, "start");
      __publicField(this, "digits");
      /** Frame shown in the setup pose. */
      __publicField(this, "setup");
      /** Atlas region per frame, resolved by the loader (`null` = missing image). */
      __publicField(this, "regions");
      this.frames = frames;
      this.count = frames.length;
      this.start = start;
      this.digits = digits;
      this.setup = setup;
      this.regions = new Array(frames.length).fill(null);
    }
    /**
     * Frame shown for `slot` (spec 7.10, 9.6): `slot.sequenceIndex` when set
     * by a `sequence` timeline, otherwise `setup`. Always inside `0..count-1`.
     */
    frameIndexFor(slot) {
      const index = slot.sequenceIndex >= 0 ? slot.sequenceIndex : this.setup;
      return index < 0 ? 0 : index >= this.count ? this.count - 1 : index;
    }
    /**
     * Builds the frame names of a sequence (spec 7.10): `frames[i]`, or
     * `path + format(start + i, digits)`.
     */
    static frameNames(path, count, start, digits, frames) {
      if (frames !== void 0) return frames.slice();
      const out = new Array(count);
      for (let i = 0; i < count; i++) out[i] = path + formatNumber(start + i, digits);
      return out;
    }
  };
  function formatNumber(value, digits) {
    const s = String(Math.trunc(value));
    if (digits <= 0 || s.length >= digits) return s;
    return "0".repeat(digits - s.length) + s;
  }

  // runtime/src/data.ts
  function inheritMode(inheritRotation, inheritScale, inheritReflection) {
    if (inheritRotation) {
      if (inheritScale) return inheritReflection ? "normal" : "noReflection";
      return inheritReflection ? "noScale" : "noScaleOrReflection";
    }
    if (inheritScale) return inheritReflection ? "noRotation" : "noRotationOrReflection";
    return inheritReflection ? "onlyReflection" : "onlyTranslation";
  }
  var BoneData = class {
    constructor(index, name, parent, values = {}) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "parent");
      __publicField(this, "length");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "rotation");
      __publicField(this, "scaleX");
      __publicField(this, "scaleY");
      __publicField(this, "shearX");
      __publicField(this, "shearY");
      __publicField(this, "inheritRotation");
      __publicField(this, "inheritScale");
      __publicField(this, "inheritReflection");
      __publicField(this, "skinRequired");
      __publicField(this, "color");
      __publicField(this, "icon");
      __publicField(this, "visible");
      __publicField(this, "folder");
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
  };
  var SlotData = class {
    constructor(index, name, bone, values = {}) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "bone");
      /** Setup placeholder name. `null` = empty slot. */
      __publicField(this, "attachmentName");
      __publicField(this, "color");
      __publicField(this, "darkColor");
      __publicField(this, "blend");
      __publicField(this, "visible");
      __publicField(this, "folder");
      this.index = index;
      this.name = name;
      this.bone = bone;
      this.attachmentName = values.attachmentName ?? null;
      this.color = values.color ?? [1, 1, 1, 1];
      this.darkColor = values.darkColor ?? null;
      this.blend = values.blend ?? "normal";
      this.visible = values.visible ?? true;
      this.folder = values.folder ?? null;
    }
  };
  var SkinData = class {
    constructor(index, name, displayName = null) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "displayName");
      /** Skins this one incorporates, in order (filled by the loader after all skins exist). */
      __publicField(this, "includes", []);
      __publicField(this, "bones", []);
      __publicField(this, "constraints", []);
      /** Draw-order offsets applied while this skin is active (spec 4.4). */
      __publicField(this, "drawOrder", []);
      /** slot index -> placeholder -> attachment (`null` hides the placeholder). */
      __publicField(this, "attachments", /* @__PURE__ */ new Map());
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
      if (map === void 0) {
        map = /* @__PURE__ */ new Map();
        this.attachments.set(slotIndex, map);
      }
      map.set(name, attachment);
    }
    /**
     * This skin's activation list: its includes expanded (recursively, in order)
     * followed by itself (spec 4.4). Cycles are cut.
     */
    expand(out = [], visiting = /* @__PURE__ */ new Set()) {
      if (visiting.has(this)) return out;
      visiting.add(this);
      for (const inc of this.includes) inc.expand(out, visiting);
      out.push(this);
      visiting.delete(this);
      return out;
    }
  };
  var ConstraintData = class {
    constructor(index, name, mix, skinRequired) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "mix");
      __publicField(this, "skinRequired");
      this.index = index;
      this.name = name;
      this.mix = mix;
      this.skinRequired = skinRequired;
    }
  };
  var IkConstraintData = class extends ConstraintData {
    constructor(index, name, bones, target, values = {}) {
      super(index, name, values.mix ?? 1, values.skinRequired ?? false);
      __publicField(this, "type", "ik");
      __publicField(this, "bones");
      __publicField(this, "target");
      __publicField(this, "bendPositive");
      __publicField(this, "compress");
      __publicField(this, "stretch");
      __publicField(this, "uniform");
      __publicField(this, "softness");
      this.bones = bones;
      this.target = target;
      this.bendPositive = values.bendPositive ?? true;
      this.compress = values.compress ?? false;
      this.stretch = values.stretch ?? false;
      this.uniform = values.uniform ?? false;
      this.softness = values.softness ?? 0;
    }
  };
  var TransformConstraintData = class extends ConstraintData {
    constructor(index, name, bones, target, values = {}) {
      super(index, name, values.mix ?? 1, values.skinRequired ?? false);
      __publicField(this, "type", "transform");
      __publicField(this, "bones");
      __publicField(this, "target");
      __publicField(this, "local");
      __publicField(this, "relative");
      __publicField(this, "offsetRotation");
      __publicField(this, "offsetX");
      __publicField(this, "offsetY");
      __publicField(this, "offsetScaleX");
      __publicField(this, "offsetScaleY");
      __publicField(this, "offsetShearY");
      __publicField(this, "mixRotation");
      __publicField(this, "mixX");
      __publicField(this, "mixY");
      __publicField(this, "mixScaleX");
      __publicField(this, "mixScaleY");
      __publicField(this, "mixShearY");
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
  };
  var PathConstraintData = class extends ConstraintData {
    constructor(index, name, bones, target, values = {}) {
      super(index, name, values.mix ?? 1, values.skinRequired ?? false);
      __publicField(this, "type", "path");
      __publicField(this, "bones");
      /** Slot whose current attachment must be a `path`. */
      __publicField(this, "target");
      __publicField(this, "positionMode");
      __publicField(this, "spacingMode");
      __publicField(this, "rotateMode");
      __publicField(this, "offsetRotation");
      __publicField(this, "position");
      __publicField(this, "spacing");
      __publicField(this, "mixRotation");
      __publicField(this, "mixX");
      __publicField(this, "mixY");
      this.bones = bones;
      this.target = target;
      this.positionMode = values.positionMode ?? "percent";
      this.spacingMode = values.spacingMode ?? "length";
      this.rotateMode = values.rotateMode ?? "tangent";
      this.offsetRotation = values.offsetRotation ?? 0;
      this.position = values.position ?? 0;
      this.spacing = values.spacing ?? 0;
      this.mixRotation = values.mixRotation ?? 1;
      this.mixX = values.mixX ?? 1;
      this.mixY = values.mixY ?? 1;
    }
  };
  var PhysicsConstraintData = class extends ConstraintData {
    constructor(index, name, bone, values = {}) {
      super(index, name, values.mix ?? 1, values.skinRequired ?? false);
      __publicField(this, "type", "physics");
      __publicField(this, "bone");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "rotation");
      __publicField(this, "scaleX");
      __publicField(this, "shearX");
      __publicField(this, "inertia");
      __publicField(this, "strength");
      __publicField(this, "damping");
      __publicField(this, "mass");
      __publicField(this, "wind");
      __publicField(this, "gravity");
      __publicField(this, "limit");
      __publicField(this, "fps");
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
      this.limit = values.limit ?? 5e3;
      this.fps = values.fps ?? 60;
    }
  };
  var DriverTargetData = class {
    constructor(timeline, mode) {
      /** Keys resolved like a timeline; `times` hold the `input` values. */
      __publicField(this, "timeline");
      __publicField(this, "mode");
      this.timeline = timeline;
      this.mode = mode;
    }
  };
  var DriverConstraintData = class extends ConstraintData {
    constructor(index, name, parameter, values = {}) {
      super(index, name, values.mix ?? 1, values.skinRequired ?? false);
      __publicField(this, "type", "driver");
      __publicField(this, "parameter");
      /** Targets mode (`null` in continuous mode). */
      __publicField(this, "targets");
      /** Continuous mode animation. Bound by the loader after animations are read. */
      __publicField(this, "animation");
      /** Continuous mode: name written in the file, kept for late binding. */
      __publicField(this, "animationName");
      __publicField(this, "from");
      __publicField(this, "to");
      __publicField(this, "timeFrom");
      /** `NaN` until bound to the animation (default: animation duration). */
      __publicField(this, "timeTo");
      __publicField(this, "mode");
      this.parameter = parameter;
      this.targets = values.targets ?? null;
      this.animation = null;
      this.animationName = values.animationName ?? null;
      this.from = values.from ?? parameter.min;
      this.to = values.to ?? parameter.max;
      this.timeFrom = values.timeFrom ?? 0;
      this.timeTo = values.timeTo ?? Number.NaN;
      this.mode = values.mode ?? "replace";
    }
  };
  var EventData = class {
    constructor(index, name, values = {}) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "int");
      __publicField(this, "float");
      __publicField(this, "string");
      __publicField(this, "audio");
      __publicField(this, "volume");
      __publicField(this, "balance");
      this.index = index;
      this.name = name;
      this.int = values.int ?? 0;
      this.float = values.float ?? 0;
      this.string = values.string ?? "";
      this.audio = values.audio ?? null;
      this.volume = values.volume ?? 1;
      this.balance = values.balance ?? 0;
    }
  };
  var ParameterSourceData = class {
    constructor(bone, property, from = 0, to = 1) {
      __publicField(this, "bone");
      __publicField(this, "property");
      __publicField(this, "from");
      __publicField(this, "to");
      this.bone = bone;
      this.property = property;
      this.from = from;
      this.to = to;
    }
  };
  var ParameterData = class {
    constructor(index, name, values = {}) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "min");
      __publicField(this, "max");
      __publicField(this, "default");
      __publicField(this, "repeat");
      __publicField(this, "group");
      __publicField(this, "displayName");
      __publicField(this, "source");
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
      if (this.max <= this.min) return this.min;
      if (this.repeat) {
        const r = this.max - this.min;
        return this.min + ((value - this.min) % r + r) % r;
      }
      return value < this.min ? this.min : value > this.max ? this.max : value;
    }
  };
  var MorphTargetData = class {
    constructor(slot, skin, attachment, offsets) {
      __publicField(this, "slot");
      __publicField(this, "skin");
      __publicField(this, "attachment");
      __publicField(this, "offsets");
      this.slot = slot;
      this.skin = skin;
      this.attachment = attachment;
      this.offsets = Float64Array.from(offsets);
    }
  };
  var MorphData = class {
    constructor(index, name, values = {}) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "weight");
      __publicField(this, "min");
      __publicField(this, "max");
      __publicField(this, "group");
      /** Filled by the loader after the attachments exist. */
      __publicField(this, "targets", []);
      this.index = index;
      this.name = name;
      this.weight = values.weight ?? 0;
      this.min = values.min ?? 0;
      this.max = values.max ?? 1;
      this.group = values.group ?? null;
    }
  };
  var VariableData = class _VariableData {
    constructor(index, name, type, defaultValue) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "type");
      __publicField(this, "default");
      this.index = index;
      this.name = name;
      this.type = type;
      this.default = defaultValue ?? _VariableData.defaultFor(type);
    }
    static defaultFor(type) {
      switch (type) {
        case "string":
          return "";
        case "bool":
          return false;
        default:
          return 0;
      }
    }
    get isNumeric() {
      return this.type === "float" || this.type === "int";
    }
  };
  var TimelineBase = class {
    get keyCount() {
      return this.times.length;
    }
    /** Time of the last key (0 when empty). */
    get lastTime() {
      const t = this.times;
      return t.length === 0 ? 0 : t[t.length - 1];
    }
  };
  var BoneNumberTimelineData = class extends TimelineBase {
    constructor(bone, property, keys) {
      super();
      this.bone = bone;
      this.property = property;
      this.keys = keys;
      __publicField(this, "kind", "bone.number");
      __publicField(this, "type", "bone");
    }
    get times() {
      return this.keys.times;
    }
  };
  var BoneInheritTimelineData = class extends TimelineBase {
    constructor(bone, property, keys) {
      super();
      this.bone = bone;
      this.property = property;
      this.keys = keys;
      __publicField(this, "kind", "bone.inherit");
      __publicField(this, "type", "bone");
    }
    get times() {
      return this.keys.times;
    }
  };
  var BoneParentTimelineData = class extends TimelineBase {
    constructor(bone, keys) {
      super();
      this.bone = bone;
      this.keys = keys;
      __publicField(this, "kind", "bone.parent");
      __publicField(this, "type", "bone");
      __publicField(this, "property", "parent");
    }
    get times() {
      return this.keys.times;
    }
  };
  var SlotAttachmentTimelineData = class extends TimelineBase {
    constructor(slot, keys) {
      super();
      this.slot = slot;
      this.keys = keys;
      __publicField(this, "kind", "slot.attachment");
      __publicField(this, "type", "slot");
      __publicField(this, "property", "attachment");
    }
    get times() {
      return this.keys.times;
    }
  };
  var SlotColorTimelineData = class extends TimelineBase {
    /** 4 components per key. */
    constructor(slot, keys) {
      super();
      this.slot = slot;
      this.keys = keys;
      __publicField(this, "kind", "slot.color");
      __publicField(this, "type", "slot");
      __publicField(this, "property", "color");
    }
    get times() {
      return this.keys.times;
    }
  };
  var SlotDarkColorTimelineData = class extends TimelineBase {
    constructor(slot, times, values, curves) {
      super();
      this.slot = slot;
      __publicField(this, "kind", "slot.darkColor");
      __publicField(this, "type", "slot");
      __publicField(this, "property", "darkColor");
      __publicField(this, "times");
      /** `[r, g, b]` per key or `null` (tint black off). */
      __publicField(this, "values");
      /** Stepped whenever either end of the segment is `null` (spec 9.5). */
      __publicField(this, "curves");
      this.times = times;
      this.values = values;
      this.curves = curves;
    }
  };
  var SlotVisibleTimelineData = class extends TimelineBase {
    constructor(slot, keys) {
      super();
      this.slot = slot;
      this.keys = keys;
      __publicField(this, "kind", "slot.visible");
      __publicField(this, "type", "slot");
      __publicField(this, "property", "visible");
    }
    get times() {
      return this.keys.times;
    }
  };
  var DrawOrderTimelineData = class extends TimelineBase {
    constructor(times, orders, entries) {
      super();
      __publicField(this, "kind", "drawOrder");
      __publicField(this, "type", "drawOrder");
      __publicField(this, "times");
      /** Per key: slot indices in draw order over the `slots` ARRAY order (spec 9.5 algorithm applied), or `null` = base order. Kept for tools; the runtime applies `entries` over the base order of spec 4.4. */
      __publicField(this, "orders");
      /** Per key: the `{slot, offset}` list as written (`null` = `[]`, back to the base order). */
      __publicField(this, "entries");
      this.times = times;
      this.orders = orders;
      this.entries = entries;
    }
  };
  var DeformTimelineData = class extends TimelineBase {
    constructor(slot, skin, attachment, times, vertices, curves) {
      super();
      this.slot = slot;
      this.skin = skin;
      this.attachment = attachment;
      __publicField(this, "kind", "deform");
      __publicField(this, "type", "deform");
      __publicField(this, "times");
      /**
       * Per key: the deform expanded to `attachment.deformLength` (spec 9.6),
       * or an empty array for `value: []` (no deform).
       */
      __publicField(this, "vertices");
      /** One curve (1 component) per key. */
      __publicField(this, "curves");
      this.times = times;
      this.vertices = vertices;
      this.curves = curves;
    }
  };
  var SequenceTimelineData = class extends TimelineBase {
    constructor(slot, skin, attachment, keys) {
      super();
      this.slot = slot;
      this.skin = skin;
      this.attachment = attachment;
      this.keys = keys;
      __publicField(this, "kind", "sequence");
      __publicField(this, "type", "sequence");
    }
    get times() {
      return this.keys.times;
    }
  };
  var EventTimelineData = class extends TimelineBase {
    constructor(times, events) {
      super();
      __publicField(this, "kind", "event");
      __publicField(this, "type", "event");
      __publicField(this, "times");
      /** Non-decreasing times; several keys may share a time (spec 9.7). */
      __publicField(this, "events");
      this.times = times;
      this.events = events;
    }
  };
  var ConstraintNumberTimelineData = class extends TimelineBase {
    constructor(constraint, property, keys) {
      super();
      this.constraint = constraint;
      this.property = property;
      this.keys = keys;
      __publicField(this, "kind", "constraint.number");
      __publicField(this, "type", "constraint");
    }
    get times() {
      return this.keys.times;
    }
  };
  var ConstraintBooleanTimelineData = class extends TimelineBase {
    constructor(constraint, property, keys) {
      super();
      this.constraint = constraint;
      this.property = property;
      this.keys = keys;
      __publicField(this, "kind", "constraint.boolean");
      __publicField(this, "type", "constraint");
    }
    get times() {
      return this.keys.times;
    }
  };
  var ConstraintResetTimelineData = class extends TimelineBase {
    constructor(constraint, times) {
      super();
      this.constraint = constraint;
      __publicField(this, "kind", "constraint.reset");
      __publicField(this, "type", "constraint");
      __publicField(this, "property", "reset");
      __publicField(this, "times");
      this.times = times;
    }
  };
  var ParameterTimelineData = class extends TimelineBase {
    constructor(parameter, keys) {
      super();
      this.parameter = parameter;
      this.keys = keys;
      __publicField(this, "kind", "parameter");
      __publicField(this, "type", "parameter");
      __publicField(this, "property", "value");
    }
    get times() {
      return this.keys.times;
    }
  };
  var MorphTimelineData = class extends TimelineBase {
    constructor(morph, keys) {
      super();
      this.morph = morph;
      this.keys = keys;
      __publicField(this, "kind", "morph");
      __publicField(this, "type", "morph");
      __publicField(this, "property", "weight");
    }
    get times() {
      return this.keys.times;
    }
  };
  var VariableNumberTimelineData = class extends TimelineBase {
    constructor(variable, keys) {
      super();
      this.variable = variable;
      this.keys = keys;
      __publicField(this, "kind", "variable.number");
      __publicField(this, "type", "variable");
      __publicField(this, "property", "value");
    }
    get times() {
      return this.keys.times;
    }
  };
  var VariableSteppedTimelineData = class extends TimelineBase {
    constructor(variable, keys) {
      super();
      this.variable = variable;
      this.keys = keys;
      __publicField(this, "kind", "variable.stepped");
      __publicField(this, "type", "variable");
      __publicField(this, "property", "value");
    }
    get times() {
      return this.keys.times;
    }
  };
  var TagTimelineData = class extends TimelineBase {
    constructor(keys) {
      super();
      this.keys = keys;
      __publicField(this, "kind", "tag");
      __publicField(this, "type", "tag");
    }
    get times() {
      return this.keys.times;
    }
  };
  var NestedAnimationTimelineData = class extends TimelineBase {
    constructor(slot, keys) {
      super();
      this.slot = slot;
      this.keys = keys;
      __publicField(this, "kind", "nested.animation");
      __publicField(this, "type", "nested");
      __publicField(this, "property", "animation");
    }
    get times() {
      return this.keys.times;
    }
  };
  var NestedNumberTimelineData = class extends TimelineBase {
    constructor(slot, property, keys) {
      super();
      this.slot = slot;
      this.property = property;
      this.keys = keys;
      __publicField(this, "kind", "nested.number");
      __publicField(this, "type", "nested");
    }
    get times() {
      return this.keys.times;
    }
  };
  var SlotBoneTimelineData = class extends TimelineBase {
    constructor(slot, keys) {
      super();
      this.slot = slot;
      this.keys = keys;
      __publicField(this, "kind", "slot.bone");
      __publicField(this, "type", "slot");
      __publicField(this, "property", "bone");
    }
    get times() {
      return this.keys.times;
    }
  };
  var WeightsTimelineData = class extends TimelineBase {
    constructor(slot, skin, attachment, times, weights, curves) {
      super();
      this.slot = slot;
      this.skin = skin;
      this.attachment = attachment;
      __publicField(this, "kind", "weights");
      __publicField(this, "type", "weights");
      __publicField(this, "times");
      /** Per key: `sum(counts)` weights, in `binding.weights` order. */
      __publicField(this, "weights");
      /** One curve (1 component) per key. */
      __publicField(this, "curves");
      this.times = times;
      this.weights = weights;
      this.curves = curves;
    }
  };
  var BodyTimelineData = class extends TimelineBase {
    constructor(keys) {
      super();
      this.keys = keys;
      __publicField(this, "kind", "body");
      __publicField(this, "type", "body");
    }
    get times() {
      return this.keys.times;
    }
  };
  var ParticleEmittingTimelineData = class extends TimelineBase {
    constructor(slot, skin, attachmentName, keys) {
      super();
      this.slot = slot;
      this.skin = skin;
      this.attachmentName = attachmentName;
      this.keys = keys;
      __publicField(this, "kind", "particle.emitting");
      __publicField(this, "type", "BONE_particle");
      __publicField(this, "property", "emitting");
    }
    get times() {
      return this.keys.times;
    }
  };
  var ParticleRateTimelineData = class extends TimelineBase {
    constructor(slot, skin, attachmentName, keys) {
      super();
      this.slot = slot;
      this.skin = skin;
      this.attachmentName = attachmentName;
      this.keys = keys;
      __publicField(this, "kind", "particle.rate");
      __publicField(this, "type", "BONE_particle");
      __publicField(this, "property", "rate");
    }
    get times() {
      return this.keys.times;
    }
  };
  var AnimationData = class {
    constructor(index, name, timelines, values = {}) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "duration");
      __publicField(this, "loop");
      __publicField(this, "blend");
      __publicField(this, "defaultMix");
      __publicField(this, "tags");
      __publicField(this, "timelines");
      /** Image export crop (spec 4.6). Read and kept; no pose reader uses it. */
      __publicField(this, "crop");
      /**
       * The animation as written in the file (the JSON object), kept so the
       * `Actor` can bind it BY NAME to another body of the project (spec 9.13).
       * `null` for an animation built in code.
       */
      __publicField(this, "source");
      /** The `body` timeline, or `null` when the animation never changes body. */
      __publicField(this, "body");
      this.index = index;
      this.name = name;
      this.timelines = timelines;
      let duration = values.duration;
      if (duration === void 0) {
        duration = 0;
        for (const tl of timelines) duration = Math.max(duration, tl.lastTime);
      }
      this.duration = duration;
      this.loop = values.loop ?? false;
      this.blend = values.blend ?? "replace";
      this.defaultMix = values.defaultMix ?? null;
      this.tags = values.tags ?? [];
      this.crop = values.crop ?? null;
      this.source = values.source ?? null;
      let body = null;
      for (const tl of timelines) if (tl.kind === "body") body = tl;
      this.body = body;
    }
  };
  var SkeletonData = class {
    constructor(values) {
      __publicField(this, "header");
      __publicField(this, "meta");
      __publicField(this, "assets");
      /** The `rig` block, or `null` (spec 4.8). */
      __publicField(this, "rig");
      __publicField(this, "extensionsUsed");
      __publicField(this, "extensionsRequired");
      __publicField(this, "bones");
      __publicField(this, "slots");
      __publicField(this, "skins");
      /** The `"default"` skin. Created empty by the loader when the file has none. */
      __publicField(this, "defaultSkin");
      __publicField(this, "constraints");
      __publicField(this, "events");
      __publicField(this, "parameters");
      __publicField(this, "morphs");
      __publicField(this, "variables");
      __publicField(this, "tags");
      __publicField(this, "animations");
      /** Non-fatal problems found while loading. */
      __publicField(this, "warnings");
      /** Image / region names that no atlas provided (spec 2.8). */
      __publicField(this, "missingImages");
      /**
       * `true` when a required extension is not supported and the caller asked
       * for a degraded load anyway (spec 2.7, `LoadOptions.allowMissingRequiredExtensions`).
       * A degraded skeleton must not be reported as loaded correctly.
       */
      __publicField(this, "degraded");
      __publicField(this, "boneMap", /* @__PURE__ */ new Map());
      __publicField(this, "slotMap", /* @__PURE__ */ new Map());
      __publicField(this, "skinMap", /* @__PURE__ */ new Map());
      __publicField(this, "constraintMap", /* @__PURE__ */ new Map());
      __publicField(this, "eventMap", /* @__PURE__ */ new Map());
      __publicField(this, "parameterMap", /* @__PURE__ */ new Map());
      __publicField(this, "morphMap", /* @__PURE__ */ new Map());
      __publicField(this, "variableMap", /* @__PURE__ */ new Map());
      __publicField(this, "animationMap", /* @__PURE__ */ new Map());
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
    findBone(name) {
      return this.boneMap.get(name) ?? null;
    }
    findSlot(name) {
      return this.slotMap.get(name) ?? null;
    }
    findSkin(name) {
      return this.skinMap.get(name) ?? null;
    }
    findConstraint(name) {
      return this.constraintMap.get(name) ?? null;
    }
    findEvent(name) {
      return this.eventMap.get(name) ?? null;
    }
    findParameter(name) {
      return this.parameterMap.get(name) ?? null;
    }
    findMorph(name) {
      return this.morphMap.get(name) ?? null;
    }
    findVariable(name) {
      return this.variableMap.get(name) ?? null;
    }
    findAnimation(name) {
      return this.animationMap.get(name) ?? null;
    }
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
      this.animations = animations;
      this.animationMap.clear();
      for (const a of animations) if (!this.animationMap.has(a.name)) this.animationMap.set(a.name, a);
    }
    /** The root bone (`bones[0]`, spec 2.2). */
    get root() {
      return this.bones[0];
    }
  };
  var AtlasPageData = class {
    constructor(index, name, image, width, height, values = {}) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "image");
      __publicField(this, "width");
      __publicField(this, "height");
      __publicField(this, "format");
      __publicField(this, "minFilter");
      __publicField(this, "magFilter");
      __publicField(this, "wrapU");
      __publicField(this, "wrapV");
      __publicField(this, "premultiplied");
      this.index = index;
      this.name = name;
      this.image = image;
      this.width = width;
      this.height = height;
      this.format = values.format ?? "rgba8";
      this.minFilter = values.minFilter ?? "linear";
      this.magFilter = values.magFilter ?? "linear";
      this.wrapU = values.wrapU ?? "clamp";
      this.wrapV = values.wrapV ?? "clamp";
      this.premultiplied = values.premultiplied ?? false;
    }
  };
  var AtlasRegionData = class {
    constructor(index, name, page, scale, values) {
      __publicField(this, "index");
      __publicField(this, "name");
      __publicField(this, "aliases");
      __publicField(this, "page");
      /** Atlas `scale`: page px per skeleton px (spec 10.2). */
      __publicField(this, "scale");
      __publicField(this, "x");
      __publicField(this, "y");
      __publicField(this, "width");
      __publicField(this, "height");
      /** `0` or `90` (clockwise, spec 10.3). */
      __publicField(this, "rotation");
      __publicField(this, "offsetX");
      __publicField(this, "offsetY");
      __publicField(this, "originalWidth");
      __publicField(this, "originalHeight");
      /**
       * Pivot in px of the ORIGINAL image, from the left and from the bottom, like
       * `offsetX/offsetY` (spec 10.3). `undefined` = the centre. Informative: the
       * pose never reads it; an editor uses it to put a new image in place.
       */
      __publicField(this, "pivotX");
      __publicField(this, "pivotY");
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
      } else {
        out[offset] = (this.x + px) / pw;
        out[offset + 1] = (this.y + py) / ph;
      }
      return out;
    }
  };
  var AtlasData = class {
    constructor(scale, pages, regions, warnings = []) {
      __publicField(this, "scale");
      __publicField(this, "pages");
      __publicField(this, "regions");
      __publicField(this, "warnings");
      __publicField(this, "regionMap", /* @__PURE__ */ new Map());
      this.scale = scale;
      this.pages = pages;
      this.regions = regions;
      this.warnings = warnings;
      for (const r of regions) if (!this.regionMap.has(r.name)) this.regionMap.set(r.name, r);
      for (const r of regions) for (const a of r.aliases) if (!this.regionMap.has(a)) this.regionMap.set(a, r);
    }
    /** Finds a region by name or alias (spec 10.5). */
    findRegion(name) {
      return this.regionMap.get(name) ?? null;
    }
  };
  function findAtlasRegion(atlases, name) {
    for (const atlas of atlases) {
      const r = atlas.findRegion(name);
      if (r !== null) return r;
    }
    return null;
  }

  // runtime/src/attachments/particle.ts
  var PARTICLE_ATTACHMENT_TYPE = "BONE_particle";
  var PARTICLE_SHAPES = ["point", "circle", "rectangle", "edge", "bone", "mesh", "path"];
  var PARTICLE_MESH_MODES = ["vertex", "edge", "triangle"];
  var PARTICLE_SPACES = ["local", "world"];
  var PARTICLE_SORT_MODES = ["youngestInFront", "oldestInFront"];
  var PARTICLE_FRAME_MODES = ["lifetime", "fps"];
  function pair(value, a, b) {
    if (value === void 0) return new Float64Array([a, b]);
    return new Float64Array([value[0] ?? a, value[1] ?? b]);
  }
  var ParticleAttachment = class extends Attachment {
    constructor(name, options = {}) {
      super(name, options.color);
      __publicField(this, "type", PARTICLE_ATTACHMENT_TYPE);
      /** Region of the atlas, like `region.path` (extension 9.8). */
      __publicField(this, "path");
      // Where the emitter is (extension 9.10, 04/10/2026): `M_emissor = M_osso ×
      // T(x, y) · R(rotation)`, the order of a `region`, without scale. Not animable.
      __publicField(this, "x");
      __publicField(this, "y");
      /** Degrees, counter-clockwise. Turns the emitter's frame. */
      __publicField(this, "rotation");
      // Emission (extension 9.1)
      /** Setup value; `emitting` is animable, read at birth, with `stepped` keys. */
      __publicField(this, "emitting");
      /** particles/s. Fixed in the 1st phase: what animates is `emitting`. */
      __publicField(this, "rate");
      __publicField(this, "bursts");
      __publicField(this, "explosiveness");
      /** ONLY for `explosiveness`. The loop uses the animation's duration (extension 6). */
      __publicField(this, "duration");
      __publicField(this, "randomness");
      __publicField(this, "startDelay");
      // Life and cap (extension 9.2)
      /** `[min, max]` seconds. NOT animable: `max` is the search window of extension 5. */
      __publicField(this, "lifetime");
      __publicField(this, "maxParticles");
      // Speed, direction, spread (extension 9.3)
      __publicField(this, "speed");
      __publicField(this, "direction");
      /** HALF-spread, in degrees: `θ = direction + spread·(2·u2 − 1)`. */
      __publicField(this, "spread");
      __publicField(this, "spherizeDirection");
      __publicField(this, "alignToVelocity");
      // Shape (extension 9.4)
      __publicField(this, "shape");
      /** `false` = the file named a shape this reader does not know: do not draw (extension 7.4). */
      __publicField(this, "shapeKnown");
      __publicField(this, "radius");
      __publicField(this, "radiusThickness");
      __publicField(this, "arc");
      __publicField(this, "size");
      __publicField(this, "edge");
      /** Placeholder of a `mesh` of the SAME slot, for `shape: "mesh"`. Level B. */
      __publicField(this, "mesh");
      __publicField(this, "meshMode");
      /**
       * `"<slot>/<placeholder>"` of a `path` attachment of ANY slot, for
       * `shape: "path"` (extension 1.1, 9.4.2). The slot is what comes before the
       * FIRST slash; the placeholder is all the rest, slashes included.
       */
      __publicField(this, "curve");
      // Forces (extension 9.5)
      __publicField(this, "gravity");
      /** Linear drag `k`, 1/s: `v' = g − k·v`. */
      __publicField(this, "drag");
      // Rotation and size (extension 9.6)
      __publicField(this, "angle");
      __publicField(this, "angularVelocity");
      __publicField(this, "scale");
      __publicField(this, "scaleOverLifetime");
      // Color (extension 9.7)
      __publicField(this, "startColor");
      __publicField(this, "colorOverLifetime");
      __publicField(this, "alphaOverLifetime");
      // Image and frame sheet (extension 9.8)
      __publicField(this, "sequence");
      __publicField(this, "frameMode");
      __publicField(this, "cycles");
      __publicField(this, "fps");
      __publicField(this, "startFrame");
      // Space, seed, loop, order (extension 9.9)
      __publicField(this, "space");
      /** ALWAYS fixed. There is no automatic seed, and `0` is a valid seed. */
      __publicField(this, "seed");
      __publicField(this, "looping");
      /** Seconds. Only with `looping: false`. */
      __publicField(this, "prewarm");
      __publicField(this, "sortMode");
      /**
       * Atlas region of `path`, resolved by the loader exactly as a `region`'s is
       * (spec 2.8). With a `sequence` every particle picks its own frame instead,
       * and this holds the setup frame.
       */
      __publicField(this, "region", null);
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
      this.maxParticles = options.maxParticles ?? 1e3;
      this.speed = pair(options.speed, 100, 100);
      this.direction = options.direction ?? 90;
      this.spread = options.spread ?? 0;
      this.spherizeDirection = options.spherizeDirection ?? 0;
      this.alignToVelocity = options.alignToVelocity ?? false;
      this.shape = options.shape ?? "point";
      this.shapeKnown = options.shapeKnown ?? true;
      this.radius = options.radius ?? 0;
      this.radiusThickness = options.radiusThickness ?? 1;
      this.arc = options.arc ?? 360;
      this.size = pair(options.size, 0, 0);
      this.edge = new Float64Array([
        options.edge?.[0] ?? 0,
        options.edge?.[1] ?? 0,
        options.edge?.[2] ?? 0,
        options.edge?.[3] ?? 0
      ]);
      this.mesh = options.mesh ?? null;
      this.meshMode = options.meshMode ?? "vertex";
      this.curve = options.curve ?? null;
      this.gravity = pair(options.gravity, 0, 0);
      this.drag = options.drag ?? 0;
      this.angle = pair(options.angle, 0, 0);
      this.angularVelocity = pair(options.angularVelocity, 0, 0);
      this.scale = pair(options.scale, 1, 1);
      this.scaleOverLifetime = options.scaleOverLifetime ?? null;
      const sc = options.startColor;
      this.startColor = [
        new Float64Array(sc?.[0] !== void 0 ? Array.from(sc[0]) : [1, 1, 1, 1]),
        new Float64Array(sc?.[1] !== void 0 ? Array.from(sc[1]) : [1, 1, 1, 1])
      ];
      this.colorOverLifetime = options.colorOverLifetime ?? null;
      this.alphaOverLifetime = options.alphaOverLifetime ?? null;
      this.sequence = options.sequence ?? null;
      this.frameMode = options.frameMode ?? "lifetime";
      this.cycles = options.cycles ?? 1;
      this.fps = options.fps ?? 12;
      this.startFrame = pair(options.startFrame, 0, 0);
      this.space = options.space ?? "local";
      this.seed = options.seed ?? 0;
      this.looping = options.looping ?? true;
      this.prewarm = options.prewarm ?? 0;
      this.sortMode = options.sortMode ?? "youngestInFront";
    }
    /** Called by the loader once the atlases are known. */
    setRegion(region) {
      this.region = region;
    }
  };
  function isParticleAttachment(att) {
    return att !== null && att.type === PARTICLE_ATTACHMENT_TYPE;
  }

  // runtime/src/uri.ts
  var URI_MAX_LENGTH = 1024;
  var RESERVED_ENCODED = /%(2f|5c|00|3a|0[0-9a-f]|1[0-9a-f]|7f)/i;
  function validateUri(value, options = {}) {
    if (value.length === 0) return options.allowEmpty === true ? null : "uri is empty";
    if (/^data:/i.test(value)) return options.allowData === true ? null : '"data:" uri is not allowed here (spec 2.8 rule 6)';
    if (codePointLength(value) > URI_MAX_LENGTH) return `uri longer than ${URI_MAX_LENGTH} code points (spec 2.8 rule 7)`;
    const reserved = RESERVED_ENCODED.exec(value);
    if (reserved !== null) return `uri contains the reserved encoded byte "${reserved[0]}" (spec 2.8 rule 8)`;
    let decoded;
    try {
      decoded = decodeURIComponent(value);
    } catch {
      return "uri has an invalid percent-encoding (spec 2.8 rule 4)";
    }
    if (decoded.includes("\\")) return 'uri contains a backslash; the separator is "/" (spec 2.8 rule 2)';
    if (decoded.includes(":")) return 'uri contains ":" (absolute path or scheme, spec 2.8 rules 1 and 8)';
    if (decoded.startsWith("/")) return "uri is absolute; it must be relative (spec 2.8 rule 1)";
    for (let i = 0; i < decoded.length; i++) {
      const c = decoded.charCodeAt(i);
      if (c < 32 || c === 127) return "uri contains a control character (spec 2.8 rule 8)";
    }
    const segments = decoded.split("/");
    for (const s of segments) {
      if (s === "." || s === "..") return `uri contains the segment "${s}" (spec 2.8 rule 3)`;
    }
    return null;
  }
  function isValidUri(value, options = {}) {
    return validateUri(value, options) === null;
  }
  function joinUri(base, name) {
    if (base.length === 0) return name;
    return base.endsWith("/") ? base + name : base + "/" + name;
  }
  function codePointLength(s) {
    let n = 0;
    for (const _ of s) n++;
    return n;
  }

  // runtime/src/json-text.ts
  function stripBom(text) {
    return text.charCodeAt(0) === 65279 ? text.slice(1) : text;
  }
  function escapeSegment(segment) {
    return segment.replace(/~/g, "~0").replace(/\//g, "~1");
  }
  function findDuplicateKey(text) {
    const stack = [];
    const n = text.length;
    let i = 0;
    const top = () => stack[stack.length - 1];
    const childPointer = () => {
      const f = top();
      if (f === void 0) return "";
      return f.kind === "object" ? f.pointer + "/" + escapeSegment(f.currentKey) : f.pointer + "/" + f.index;
    };
    while (i < n) {
      const ch = text[i];
      if (ch === " " || ch === "	" || ch === "\n" || ch === "\r") {
        i++;
        continue;
      }
      if (ch === "{" || ch === "[") {
        const pointer = childPointer();
        stack.push({ kind: ch === "{" ? "object" : "array", pointer, keys: ch === "{" ? /* @__PURE__ */ new Set() : null, currentKey: "", index: 0, expectKey: ch === "{" });
        i++;
        continue;
      }
      if (ch === "}" || ch === "]") {
        if (stack.length === 0) return null;
        stack.pop();
        i++;
        continue;
      }
      if (ch === '"') {
        const end = scanString(text, i);
        if (end < 0) return null;
        const f = top();
        if (f !== void 0 && f.kind === "object" && f.expectKey) {
          let key;
          try {
            key = JSON.parse(text.slice(i, end));
          } catch {
            return null;
          }
          if (f.keys.has(key)) return { pointer: f.pointer + "/" + escapeSegment(key), key };
          f.keys.add(key);
          f.currentKey = key;
          f.expectKey = false;
        }
        i = end;
        continue;
      }
      if (ch === ",") {
        const f = top();
        if (f !== void 0) {
          if (f.kind === "object") f.expectKey = true;
          else f.index++;
        }
        i++;
        continue;
      }
      if (ch === ":") {
        i++;
        continue;
      }
      while (i < n) {
        const c = text[i];
        if (c === "," || c === "}" || c === "]" || c === " " || c === "	" || c === "\n" || c === "\r") break;
        i++;
      }
    }
    return null;
  }
  function scanString(text, start) {
    let i = start + 1;
    const n = text.length;
    while (i < n) {
      const c = text[i];
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === '"') return i + 1;
      i++;
    }
    return -1;
  }

  // runtime/src/loader.ts
  var READER_VERSION = { major: 1, minor: 1 };
  var SUPPORTED_EXTENSIONS = ["BONE_particles"];
  var LoadError = class extends Error {
    constructor(pointer, message) {
      super(`${pointer}: ${message}`);
      __publicField(this, "pointer");
      this.name = "LoadError";
      this.pointer = pointer;
    }
  };
  var Context = class {
    constructor(options) {
      __publicField(this, "warnings", []);
      __publicField(this, "strict");
      __publicField(this, "atlases");
      __publicField(this, "missingImages", []);
      this.strict = options.strict ?? false;
      this.atlases = options.atlases ?? null;
    }
    /** Records a warning (never throws). */
    warn(pointer, message) {
      this.warnings.push({ pointer, message });
    }
    /** L1 problem with a defined fallback: throws in strict mode, warns otherwise. */
    issue(pointer, message) {
      if (this.strict) throw new LoadError(pointer, message);
      this.warnings.push({ pointer, message });
    }
    /** Fatal problem: always throws. */
    fail(pointer, message) {
      throw new LoadError(pointer, message);
    }
    /** Records a missing image once (spec 2.8). */
    missingImage(pointer, name) {
      if (this.missingImages.includes(name)) return;
      this.missingImages.push(name);
      this.warn(pointer, `image "${name}" not found in any atlas; attachment will be invisible`);
    }
    /**
     * Image name that breaks the uri rules (spec 7.2, 2.8): L1, the name is
     * refused and the attachment is invisible. Returns `false` when refused.
     */
    imageName(pointer, name) {
      const problem = validateUri(name);
      if (problem === null) return true;
      this.issue(pointer, `image name "${name}" refused: ${problem}; attachment will be invisible`);
      if (!this.missingImages.includes(name)) this.missingImages.push(name);
      return false;
    }
    /** Any other uri of the file (`assets`, `event.audio`, `page.image`): L1 warning. */
    uri(pointer, value, options = {}) {
      const problem = validateUri(value, options);
      if (problem !== null) this.issue(pointer, `invalid uri "${value}": ${problem}`);
    }
  };
  function parseBoneText(text) {
    const clean = stripBom(text);
    const dup = findDuplicateKey(clean);
    if (dup !== null) throw new LoadError(dup.pointer, `duplicate key "${dup.key}" in the same object`);
    try {
      return JSON.parse(clean);
    } catch (e) {
      throw new LoadError("", `invalid JSON: ${e.message}`);
    }
  }
  function loadSkeletonFromText(text, options = {}) {
    return loadSkeletonData(parseBoneText(text), options);
  }
  function loadAtlasFromText(text, options = {}) {
    return loadAtlas(parseBoneText(text), options);
  }
  function escapePointer(segment) {
    return String(segment).replace(/~/g, "~0").replace(/\//g, "~1");
  }
  function ptr(base, ...segments) {
    let out = base;
    for (const s of segments) out += "/" + escapePointer(s);
    return out;
  }
  function isObject(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
  }
  function expectObject(ctx, v, pointer) {
    if (!isObject(v)) ctx.fail(pointer, "expected an object");
    return v;
  }
  function expectArray(ctx, v, pointer) {
    if (!Array.isArray(v)) ctx.fail(pointer, "expected an array");
    return v;
  }
  function optObject(ctx, o, key, pointer) {
    const v = o[key];
    if (v === void 0) return void 0;
    return expectObject(ctx, v, ptr(pointer, key));
  }
  function optArray(ctx, o, key, pointer) {
    const v = o[key];
    if (v === void 0) return void 0;
    return expectArray(ctx, v, ptr(pointer, key));
  }
  function reqString(ctx, o, key, pointer) {
    const v = o[key];
    if (typeof v !== "string") ctx.fail(ptr(pointer, key), "expected a string");
    return v;
  }
  function optString(ctx, o, key, pointer) {
    const v = o[key];
    if (v === void 0) return void 0;
    if (typeof v !== "string") ctx.fail(ptr(pointer, key), "expected a string");
    return v;
  }
  function reqNumber(ctx, o, key, pointer) {
    const v = o[key];
    if (typeof v !== "number" || !Number.isFinite(v)) ctx.fail(ptr(pointer, key), "expected a finite number");
    return v;
  }
  function optNumber(ctx, o, key, pointer) {
    const v = o[key];
    if (v === void 0) return void 0;
    if (typeof v !== "number" || !Number.isFinite(v)) ctx.fail(ptr(pointer, key), "expected a finite number");
    return v;
  }
  function optBoolean(ctx, o, key, pointer) {
    const v = o[key];
    if (v === void 0) return void 0;
    if (typeof v !== "boolean") ctx.fail(ptr(pointer, key), "expected a boolean");
    return v;
  }
  function optStringArray(ctx, o, key, pointer) {
    const arr = optArray(ctx, o, key, pointer);
    if (arr === void 0) return void 0;
    const p = ptr(pointer, key);
    return arr.map((v, i) => {
      if (typeof v !== "string") ctx.fail(ptr(p, i), "expected a string");
      return v;
    });
  }
  function optNumberArray(ctx, o, key, pointer) {
    const arr = optArray(ctx, o, key, pointer);
    if (arr === void 0) return void 0;
    return numberArray(ctx, arr, ptr(pointer, key));
  }
  function numberArray(ctx, arr, pointer) {
    return arr.map((v, i) => {
      if (typeof v !== "number" || !Number.isFinite(v)) ctx.fail(ptr(pointer, i), "expected a finite number");
      return v;
    });
  }
  function reqNumberArray(ctx, o, key, pointer) {
    const arr = optArray(ctx, o, key, pointer);
    if (arr === void 0) ctx.fail(ptr(pointer, key), "required array missing");
    return numberArray(ctx, arr, ptr(pointer, key));
  }
  function optColor4(ctx, o, key, pointer) {
    const arr = optNumberArray(ctx, o, key, pointer);
    if (arr === void 0) return void 0;
    if (arr.length !== 4) ctx.fail(ptr(pointer, key), "expected 4 numbers");
    return [arr[0], arr[1], arr[2], arr[3]];
  }
  function optColor3(ctx, o, key, pointer) {
    const arr = optNumberArray(ctx, o, key, pointer);
    if (arr === void 0) return void 0;
    if (arr.length !== 3) ctx.fail(ptr(pointer, key), "expected 3 numbers");
    return [arr[0], arr[1], arr[2]];
  }
  function optEnum(ctx, o, key, pointer, allowed, fallback) {
    const v = optString(ctx, o, key, pointer);
    if (v === void 0) return fallback;
    if (allowed.includes(v)) return v;
    ctx.warn(ptr(pointer, key), `unknown value "${v}", using "${fallback}"`);
    return fallback;
  }
  function parseVersion(text) {
    const m = /^(\d+)\.(\d+)$/.exec(text);
    if (m === null) return null;
    return { major: Number(m[1]), minor: Number(m[2]) };
  }
  function checkVersion(ctx, header, pointer) {
    const file = parseVersion(header.version);
    const min = parseVersion(header.minVersion);
    if (file === null) ctx.fail(ptr(pointer, "version"), `invalid version "${header.version}"`);
    if (min === null) ctx.fail(ptr(pointer, "minVersion"), `invalid minVersion "${header.minVersion}"`);
    if (min.major > file.major || min.major === file.major && min.minor > file.minor) {
      ctx.issue(ptr(pointer, "minVersion"), `minVersion ${header.minVersion} is greater than version ${header.version}`);
    }
    const r = READER_VERSION;
    if (file.major > r.major) {
      ctx.issue(ptr(pointer, "version"), `file version ${header.version} is newer than reader ${r.major}.${r.minor}; best effort`);
      return;
    }
    if (file.major === r.major && file.minor > r.minor) {
      if (min.major < r.major || min.major === r.major && min.minor <= r.minor) {
        ctx.warn(ptr(pointer, "version"), `file version ${header.version} newer than reader ${r.major}.${r.minor}: partial read`);
      } else {
        ctx.warn(ptr(pointer, "minVersion"), `file requires ${header.minVersion}, reader is ${r.major}.${r.minor}: best effort`);
      }
    }
  }
  function missingTarget(b, pointer, message) {
    const code = b.unmetCode ?? null;
    if (code === null) b.ctx.issue(pointer, `TARGET_MISSING: ${message}`);
    else b.ctx.warn(pointer, `${code}: ${message}`);
  }
  function loadSkeletonData(json, options = {}) {
    const ctx = new Context(options);
    const root = expectObject(ctx, json, "");
    const headerObj = expectObject(ctx, root["bone"], "/bone");
    const header = {
      version: reqString(ctx, headerObj, "version", "/bone"),
      minVersion: reqString(ctx, headerObj, "minVersion", "/bone"),
      generator: reqString(ctx, headerObj, "generator", "/bone"),
      id: optString(ctx, headerObj, "id", "/bone"),
      created: optString(ctx, headerObj, "created", "/bone"),
      modified: optString(ctx, headerObj, "modified", "/bone"),
      license: optString(ctx, headerObj, "license", "/bone"),
      copyright: optString(ctx, headerObj, "copyright", "/bone")
    };
    checkVersion(ctx, header, "/bone");
    const extensionsUsed = optStringArray(ctx, root, "extensionsUsed", "") ?? [];
    const extensionsRequired = optStringArray(ctx, root, "extensionsRequired", "") ?? [];
    const unsupported = extensionsRequired.filter((ext) => !SUPPORTED_EXTENSIONS.includes(ext));
    let degraded = false;
    if (unsupported.length > 0) {
      const message = `required extensions not supported: ${unsupported.join(", ")}`;
      if (options.allowMissingRequiredExtensions !== true || ctx.strict) throw new LoadError("/extensionsRequired", message);
      ctx.warn("/extensionsRequired", `${message}; loading in degraded mode as requested`);
      degraded = true;
    }
    const metaObj = optObject(ctx, root, "skeleton", "") ?? {};
    const meta = {
      name: optString(ctx, metaObj, "name", "/skeleton") ?? null,
      x: optNumber(ctx, metaObj, "x", "/skeleton") ?? 0,
      y: optNumber(ctx, metaObj, "y", "/skeleton") ?? 0,
      width: optNumber(ctx, metaObj, "width", "/skeleton") ?? 0,
      height: optNumber(ctx, metaObj, "height", "/skeleton") ?? 0,
      fps: optNumber(ctx, metaObj, "fps", "/skeleton") ?? 30,
      referenceScale: optNumber(ctx, metaObj, "referenceScale", "/skeleton") ?? 100,
      pixelArt: optBoolean(ctx, metaObj, "pixelArt", "/skeleton") ?? false,
      hash: optString(ctx, metaObj, "hash", "/skeleton") ?? null
    };
    const assetsObj = optObject(ctx, root, "assets", "") ?? {};
    const assets = {
      atlases: optStringArray(ctx, assetsObj, "atlases", "/assets") ?? [],
      imagesBase: optString(ctx, assetsObj, "imagesBase", "/assets") ?? "",
      audioBase: optString(ctx, assetsObj, "audioBase", "/assets") ?? "",
      skeletonsBase: optString(ctx, assetsObj, "skeletonsBase", "/assets") ?? "",
      animations: optStringArray(ctx, assetsObj, "animations", "/assets") ?? [],
      skins: optStringArray(ctx, assetsObj, "skins", "/assets") ?? []
    };
    for (let i = 0; i < assets.atlases.length; i++) ctx.uri(ptr("/assets/atlases", i), assets.atlases[i]);
    for (let i = 0; i < assets.animations.length; i++) ctx.uri(ptr("/assets/animations", i), assets.animations[i]);
    for (let i = 0; i < assets.skins.length; i++) ctx.uri(ptr("/assets/skins", i), assets.skins[i]);
    const rig = loadRig(ctx, root);
    ctx.uri("/assets/imagesBase", assets.imagesBase, { allowEmpty: true });
    ctx.uri("/assets/audioBase", assets.audioBase, { allowEmpty: true });
    ctx.uri("/assets/skeletonsBase", assets.skeletonsBase, { allowEmpty: true });
    const b = {
      ctx,
      bones: [],
      boneMap: /* @__PURE__ */ new Map(),
      slots: [],
      slotMap: /* @__PURE__ */ new Map(),
      skins: [],
      skinMap: /* @__PURE__ */ new Map(),
      defaultSkin: null,
      events: [],
      eventMap: /* @__PURE__ */ new Map(),
      parameters: [],
      parameterMap: /* @__PURE__ */ new Map(),
      morphs: [],
      morphMap: /* @__PURE__ */ new Map(),
      variables: [],
      variableMap: /* @__PURE__ */ new Map(),
      constraints: [],
      constraintMap: /* @__PURE__ */ new Map(),
      animations: [],
      animationMap: /* @__PURE__ */ new Map(),
      animationNames: /* @__PURE__ */ new Set(),
      baseUnmetCode: options.unmetCode ?? null,
      externalAnimations: options.externalAnimations ?? null,
      skeletonsBase: assets.skeletonsBase
    };
    loadBones(b, expectArray(ctx, root["bones"], "/bones"));
    loadSlots(b, optArray(ctx, root, "slots", "") ?? []);
    loadEvents(b, optArray(ctx, root, "events", "") ?? []);
    loadParameters(b, optArray(ctx, root, "parameters", "") ?? []);
    loadVariables(b, optArray(ctx, root, "variables", "") ?? []);
    const tags = optStringArray(ctx, root, "tags", "") ?? [];
    const skinDefs = optArray(ctx, root, "skins", "") ?? [];
    loadSkins(b, skinDefs);
    loadMorphs(b, optArray(ctx, root, "morphs", "") ?? []);
    const animationDefs = optArray(ctx, root, "animations", "") ?? [];
    for (const a of animationDefs) if (isObject(a) && typeof a["name"] === "string") b.animationNames.add(a["name"]);
    loadConstraints(b, optArray(ctx, root, "constraints", "") ?? []);
    linkSkinConstraints(b, skinDefs);
    loadAnimations(b, animationDefs);
    bindDriverAnimations(b);
    checkPlaceholders(b);
    const data = new SkeletonData({
      header,
      meta,
      assets,
      rig,
      extensionsUsed,
      extensionsRequired,
      bones: b.bones,
      slots: b.slots,
      skins: b.skins,
      defaultSkin: b.defaultSkin,
      constraints: b.constraints,
      events: b.events,
      parameters: b.parameters,
      morphs: b.morphs,
      variables: b.variables,
      tags,
      animations: b.animations,
      warnings: ctx.warnings,
      missingImages: ctx.missingImages,
      degraded
    });
    resolveNestedSkeletons(data, options.skeletons ?? null, { strict: ctx.strict, warnings: ctx.warnings });
    return data;
  }
  function nestedAttachments(data) {
    const out = [];
    for (const skin of data.skins) {
      for (const bySlot of skin.attachments.values()) {
        for (const att of bySlot.values()) {
          if (att instanceof SkeletonAttachment && !out.includes(att)) out.push(att);
        }
      }
    }
    return out;
  }
  function resolveNestedSkeletons(data, source, options = {}) {
    const found = [];
    const lookup = source === null ? null : typeof source === "function" ? source : (uri) => source.get(uri);
    for (const att of nestedAttachments(data)) {
      att.resolvedUri = joinUri(data.assets.skeletonsBase, att.uri);
      if (lookup === null) continue;
      const child = lookup(att.resolvedUri) ?? lookup(att.uri) ?? null;
      if (child === null) {
        const problem = {
          pointer: `/skins/.../${att.name}/uri`,
          message: `nested skeleton "${att.resolvedUri}" was not provided; placeholder treated as empty (spec 7.11)`
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
  function loadAnimationsFor(data, json, options = {}) {
    const ctx = new Context(options);
    const root = expectObject(ctx, json, "");
    const defs = optArray(ctx, root, "animations", "") ?? [];
    const byName = (list) => {
      const map = /* @__PURE__ */ new Map();
      for (const item of list) if (!map.has(item.name)) map.set(item.name, item);
      return map;
    };
    const b = {
      ctx,
      bones: [...data.bones],
      boneMap: byName(data.bones),
      slots: [...data.slots],
      slotMap: byName(data.slots),
      skins: [...data.skins],
      skinMap: byName(data.skins),
      defaultSkin: data.defaultSkin,
      events: [...data.events],
      eventMap: byName(data.events),
      parameters: [...data.parameters],
      parameterMap: byName(data.parameters),
      morphs: [...data.morphs],
      morphMap: byName(data.morphs),
      variables: [...data.variables],
      variableMap: byName(data.variables),
      constraints: [...data.constraints],
      constraintMap: byName(data.constraints),
      animations: [],
      animationMap: /* @__PURE__ */ new Map(),
      animationNames: /* @__PURE__ */ new Set(),
      baseUnmetCode: options.unmetCode ?? null,
      externalAnimations: options.externalAnimations ?? null,
      skeletonsBase: data.assets.skeletonsBase
    };
    for (const a of defs) if (isObject(a) && typeof a["name"] === "string") b.animationNames.add(a["name"]);
    loadAnimations(b, defs);
    bindDriverAnimations(b);
    return { animations: b.animations, warnings: ctx.warnings };
  }
  function checkPlaceholders(b) {
    const ctx = b.ctx;
    const known = b.slots.map(() => /* @__PURE__ */ new Set());
    for (const skin of b.skins) {
      for (const [slotIndex, map] of skin.attachments) {
        const set = known[slotIndex];
        if (set !== void 0) for (const name of map.keys()) set.add(name);
      }
    }
    for (const slot of b.slots) {
      const name = slot.attachmentName;
      if (name !== null && !known[slot.index].has(name)) {
        ctx.warn(ptr("/slots", slot.index, "attachment"), `placeholder "${name}" is not defined in any skin`);
      }
    }
    for (let a = 0; a < b.animations.length; a++) {
      const timelines = b.animations[a].timelines;
      for (let t = 0; t < timelines.length; t++) {
        const tl = timelines[t];
        if (tl.kind !== "slot.attachment") continue;
        const values = tl.keys.values;
        for (let k = 0; k < values.length; k++) {
          const name = values[k];
          if (name !== null && !known[tl.slot.index].has(name)) {
            ctx.warn(ptr("/animations", a, "timelines", t, "keys", k, "value"), `placeholder "${name}" is not defined in any skin`);
          }
        }
      }
    }
  }
  function loadBones(b, defs) {
    const ctx = b.ctx;
    if (defs.length === 0) ctx.fail("/bones", "at least one bone is required");
    const objs = defs.map((d, i) => expectObject(ctx, d, ptr("/bones", i)));
    const names = objs.map((o, i) => reqString(ctx, o, "name", ptr("/bones", i)));
    const nameIndex = /* @__PURE__ */ new Map();
    names.forEach((n, i) => {
      if (!nameIndex.has(n)) nameIndex.set(n, i);
    });
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      const p = ptr("/bones", i);
      const name = names[i];
      if (nameIndex.get(name) !== i) ctx.issue(ptr(p, "name"), `duplicate bone name "${name}"`);
      const parentName = optString(ctx, o, "parent", p);
      let parent = null;
      if (i === 0) {
        if (parentName !== void 0) ctx.issue(ptr(p, "parent"), "the first bone is the root and must not have a parent; ignored");
      } else if (parentName === void 0) {
        ctx.issue(ptr(p, "parent"), `bone "${name}" has no parent but is not the first bone (two roots); attached to "${names[0]}"`);
        parent = b.bones[0];
      } else {
        const pi = nameIndex.get(parentName);
        if (pi === void 0) {
          ctx.issue(ptr(p, "parent"), `parent bone "${parentName}" does not exist; attached to "${names[0]}"`);
          parent = b.bones[0];
        } else if (pi >= i) {
          const cyclic = hasParentCycle(objs, nameIndex, i);
          ctx.issue(ptr(p, "parent"), cyclic ? `parent cycle through bone "${name}"; attached to "${names[0]}"` : `parent "${parentName}" comes after bone "${name}" (parents must come first); attached to "${names[0]}"`);
          parent = b.bones[0];
        } else {
          parent = b.bones[pi];
        }
      }
      const inheritRotation = optBoolean(ctx, o, "inheritRotation", p) ?? true;
      const inheritScale = optBoolean(ctx, o, "inheritScale", p) ?? true;
      const inheritReflection = optBoolean(ctx, o, "inheritReflection", p) ?? true;
      const length = optNumber(ctx, o, "length", p) ?? 0;
      if (length < 0) ctx.issue(ptr(p, "length"), "length must be >= 0");
      const bone = new BoneData(i, name, parent, {
        length: Math.max(0, length),
        x: optNumber(ctx, o, "x", p),
        y: optNumber(ctx, o, "y", p),
        rotation: optNumber(ctx, o, "rotation", p),
        scaleX: optNumber(ctx, o, "scaleX", p),
        scaleY: optNumber(ctx, o, "scaleY", p),
        shearX: optNumber(ctx, o, "shearX", p),
        shearY: optNumber(ctx, o, "shearY", p),
        inheritRotation,
        inheritScale,
        inheritReflection,
        skinRequired: optBoolean(ctx, o, "skinRequired", p),
        color: optColor4(ctx, o, "color", p),
        icon: optString(ctx, o, "icon", p) ?? null,
        visible: optBoolean(ctx, o, "visible", p),
        folder: optString(ctx, o, "folder", p) ?? null
      });
      b.bones.push(bone);
      if (!b.boneMap.has(name)) b.boneMap.set(name, bone);
    }
  }
  function hasParentCycle(objs, nameIndex, start) {
    const seen = /* @__PURE__ */ new Set();
    let i = start;
    while (i !== void 0) {
      if (seen.has(i)) return true;
      seen.add(i);
      const parentName = objs[i]["parent"];
      i = typeof parentName === "string" ? nameIndex.get(parentName) : void 0;
    }
    return false;
  }
  var BLEND_MODES = ["normal", "additive", "multiply", "screen"];
  function loadSlots(b, defs) {
    const ctx = b.ctx;
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/slots", i);
      const o = expectObject(ctx, defs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (b.slotMap.has(name)) ctx.issue(ptr(p, "name"), `duplicate slot name "${name}"`);
      const boneName = reqString(ctx, o, "bone", p);
      let bone = b.boneMap.get(boneName);
      if (bone === void 0) {
        ctx.issue(ptr(p, "bone"), `bone "${boneName}" does not exist; slot attached to "${b.bones[0].name}"`);
        bone = b.bones[0];
      }
      const slot = new SlotData(i, name, bone, {
        attachmentName: optString(ctx, o, "attachment", p) ?? null,
        color: optColor4(ctx, o, "color", p),
        darkColor: optColor3(ctx, o, "darkColor", p) ?? null,
        blend: optEnum(ctx, o, "blend", p, BLEND_MODES, "normal"),
        visible: optBoolean(ctx, o, "visible", p),
        folder: optString(ctx, o, "folder", p) ?? null
      });
      b.slots.push(slot);
      if (!b.slotMap.has(name)) b.slotMap.set(name, slot);
    }
  }
  function loadEvents(b, defs) {
    const ctx = b.ctx;
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/events", i);
      const o = expectObject(ctx, defs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (b.eventMap.has(name)) ctx.issue(ptr(p, "name"), `duplicate event name "${name}"`);
      const audio = optString(ctx, o, "audio", p);
      if (audio !== void 0) ctx.uri(ptr(p, "audio"), audio);
      const ev = new EventData(i, name, {
        int: optNumber(ctx, o, "int", p),
        float: optNumber(ctx, o, "float", p),
        string: optString(ctx, o, "string", p),
        audio: audio ?? null,
        volume: optNumber(ctx, o, "volume", p),
        balance: optNumber(ctx, o, "balance", p)
      });
      b.events.push(ev);
      if (!b.eventMap.has(name)) b.eventMap.set(name, ev);
    }
  }
  var BONE_NUMERIC_PROPERTIES = ["x", "y", "rotation", "scaleX", "scaleY", "shearX", "shearY"];
  var BONE_INHERIT_PROPERTIES = ["inheritRotation", "inheritScale", "inheritReflection"];
  function loadParameters(b, defs) {
    const ctx = b.ctx;
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/parameters", i);
      const o = expectObject(ctx, defs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (b.parameterMap.has(name)) ctx.issue(ptr(p, "name"), `duplicate parameter name "${name}"`);
      const min = optNumber(ctx, o, "min", p) ?? 0;
      let max = optNumber(ctx, o, "max", p) ?? 1;
      if (max <= min) {
        ctx.issue(ptr(p, "max"), `max (${max}) must be greater than min (${min}); parameter fixed at min`);
        max = min;
      }
      let def = optNumber(ctx, o, "default", p) ?? 0;
      if (def < min || def > max) {
        ctx.issue(ptr(p, "default"), `default ${def} outside [${min}, ${max}]; clamped`);
        def = Math.min(Math.max(def, min), max);
      }
      let source = null;
      const so = optObject(ctx, o, "source", p);
      if (so !== void 0) {
        const sp = ptr(p, "source");
        const boneName = reqString(ctx, so, "bone", sp);
        const property = reqString(ctx, so, "property", sp);
        const bone = b.boneMap.get(boneName);
        const from = optNumber(ctx, so, "from", sp) ?? 0;
        const to = optNumber(ctx, so, "to", sp) ?? 1;
        if (bone === void 0) {
          ctx.issue(ptr(sp, "bone"), `bone "${boneName}" does not exist; source ignored`);
        } else if (!BONE_NUMERIC_PROPERTIES.includes(property)) {
          ctx.warn(ptr(sp, "property"), `unknown property "${property}"; source ignored`);
        } else if (to === from) {
          ctx.issue(ptr(sp, "to"), "to must differ from from; source ignored");
        } else {
          source = new ParameterSourceData(bone, property, from, to);
        }
      }
      const param = new ParameterData(i, name, {
        min,
        max,
        default: def,
        repeat: optBoolean(ctx, o, "repeat", p),
        group: optString(ctx, o, "group", p) ?? null,
        displayName: optString(ctx, o, "displayName", p) ?? null,
        source
      });
      b.parameters.push(param);
      if (!b.parameterMap.has(name)) b.parameterMap.set(name, param);
    }
  }
  var VARIABLE_TYPES = ["float", "int", "string", "bool"];
  function loadVariables(b, defs) {
    const ctx = b.ctx;
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/variables", i);
      const o = expectObject(ctx, defs[i], p);
      const name = reqString(ctx, o, "name", p);
      const type = reqString(ctx, o, "type", p);
      if (!VARIABLE_TYPES.includes(type)) {
        ctx.warn(ptr(p, "type"), `unknown variable type "${type}"; variable ignored`);
        continue;
      }
      if (b.variableMap.has(name)) ctx.issue(ptr(p, "name"), `duplicate variable name "${name}"`);
      let def = o["default"];
      if (def !== void 0 && !variableValueMatches(type, def)) {
        ctx.issue(ptr(p, "default"), `default does not match type "${type}"; using the type default`);
        def = void 0;
      }
      if (type === "int" && typeof def === "number") def = Math.trunc(def);
      const v = new VariableData(b.variables.length, name, type, def);
      b.variables.push(v);
      if (!b.variableMap.has(name)) b.variableMap.set(name, v);
    }
  }
  function variableValueMatches(type, value) {
    switch (type) {
      case "float":
      case "int":
        return typeof value === "number" && Number.isFinite(value);
      case "string":
        return typeof value === "string";
      case "bool":
        return typeof value === "boolean";
    }
  }
  function loadSkins(b, defs) {
    const ctx = b.ctx;
    const objs = [];
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/skins", i);
      const o = expectObject(ctx, defs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (b.skinMap.has(name)) {
        ctx.issue(ptr(p, "name"), `duplicate skin name "${name}"; ignored`);
        objs.push(o);
        continue;
      }
      const skin = new SkinData(b.skins.length, name, optString(ctx, o, "displayName", p) ?? null);
      b.skins.push(skin);
      b.skinMap.set(name, skin);
      objs.push(o);
    }
    let defaultSkin = b.skinMap.get("default");
    if (defaultSkin === void 0) {
      defaultSkin = new SkinData(b.skins.length, "default");
      b.skins.push(defaultSkin);
      b.skinMap.set("default", defaultSkin);
    }
    b.defaultSkin = defaultSkin;
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      const p = ptr("/skins", i);
      const skin = b.skinMap.get(o.name);
      if (skin === void 0 || skin.index !== indexOfSkinObj(b, objs, i)) continue;
      const includes = optStringArray(ctx, o, "includes", p) ?? [];
      for (let j = 0; j < includes.length; j++) {
        const inc = b.skinMap.get(includes[j]);
        if (inc === void 0) {
          ctx.issue(ptr(p, "includes", j), `skin "${includes[j]}" does not exist; ignored`);
          continue;
        }
        if (inc === skin) {
          ctx.issue(ptr(p, "includes", j), "a skin cannot include itself; ignored");
          continue;
        }
        skin.includes.push(inc);
      }
      const bones = optStringArray(ctx, o, "bones", p) ?? [];
      for (let j = 0; j < bones.length; j++) {
        const bone = b.boneMap.get(bones[j]);
        if (bone === void 0) {
          ctx.issue(ptr(p, "bones", j), `bone "${bones[j]}" does not exist; ignored`);
          continue;
        }
        if (!bone.skinRequired) ctx.warn(ptr(p, "bones", j), `bone "${bones[j]}" is not skinRequired`);
        skin.bones.push(bone);
      }
      const drawOrder = optArray(ctx, o, "drawOrder", p);
      if (drawOrder !== void 0) {
        const dp = ptr(p, "drawOrder");
        for (let j = 0; j < drawOrder.length; j++) {
          const ep = ptr(dp, j);
          const e = expectObject(ctx, drawOrder[j], ep);
          const slotName = reqString(ctx, e, "slot", ep);
          const offset = reqNumber(ctx, e, "offset", ep);
          const slot = b.slotMap.get(slotName);
          if (slot === void 0) {
            ctx.issue(ptr(ep, "slot"), `slot "${slotName}" does not exist; entry ignored`);
            continue;
          }
          skin.drawOrder.push({ slot, offset: Math.trunc(offset) });
        }
      }
    }
    for (const skin of b.skins) {
      while (reachesItself(skin, skin, /* @__PURE__ */ new Set())) {
        const idx = skin.includes.findIndex((inc) => reachesItself(inc, skin, /* @__PURE__ */ new Set()));
        if (idx < 0) break;
        ctx.issue(ptr("/skins", skin.index, "includes"), `skin include cycle through "${skin.name}" via "${skin.includes[idx].name}"; cut`);
        skin.includes.splice(idx, 1);
      }
    }
    const pending = [];
    for (let i = 0; i < objs.length; i++) {
      const o = objs[i];
      const p = ptr("/skins", i);
      const skin = b.skinMap.get(o.name);
      if (skin === void 0 || skin.index !== indexOfSkinObj(b, objs, i)) continue;
      const attachments = optObject(ctx, o, "attachments", p);
      if (attachments === void 0) continue;
      for (const slotName of Object.keys(attachments)) {
        const sp = ptr(p, "attachments", slotName);
        const slot = b.slotMap.get(slotName);
        if (slot === void 0) {
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
          const type = reqString(ctx, def, "type", ap);
          if (type === "linkedmesh") {
            pending.push({ skin, slot, name: placeholder, def, pointer: ap });
            continue;
          }
          const att = loadAttachment(b, def, placeholder, ap);
          skin.setAttachment(slot.index, placeholder, att);
        }
      }
    }
    for (const item of pending) {
      const att = loadLinkedMesh(b, item);
      item.skin.setAttachment(item.slot.index, item.name, att);
    }
  }
  function indexOfSkinObj(b, objs, i) {
    const name = objs[i].name;
    for (let j = 0; j < i; j++) if (objs[j].name === name) return -1;
    return b.skinMap.get(name)?.index ?? -1;
  }
  function reachesItself(current, target, visited) {
    if (visited.has(current)) return false;
    visited.add(current);
    for (const inc of current.includes) {
      if (inc === target) return true;
      if (reachesItself(inc, target, visited)) return true;
    }
    return false;
  }
  function loadVertexSource(b, o, p, minVertices) {
    const ctx = b.ctx;
    const vertices = optNumberArray(ctx, o, "vertices", p) ?? null;
    const bindingObj = optObject(ctx, o, "binding", p);
    if (vertices === null && bindingObj === void 0) {
      ctx.issue(p, 'one of "vertices" or "binding" is required; attachment ignored');
      return null;
    }
    if (vertices !== null && bindingObj !== void 0) {
      ctx.issue(p, 'only one of "vertices" or "binding" is allowed; using "binding"');
    }
    if (bindingObj !== void 0) {
      const bp = ptr(p, "binding");
      const bd = bindingObj;
      const counts = reqNumberArray(ctx, bd, "counts", bp);
      const bones = reqNumberArray(ctx, bd, "bones", bp);
      const positions = reqNumberArray(ctx, bd, "positions", bp);
      const weights = reqNumberArray(ctx, bd, "weights", bp);
      let total = 0;
      for (let i = 0; i < counts.length; i++) {
        if (!Number.isInteger(counts[i]) || counts[i] < 1) {
          ctx.issue(ptr(bp, "counts", i), "each vertex needs at least one influence; attachment ignored");
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
          ctx.issue(ptr(bp, "bones", i), `bone index ${bones[i]} out of range; attachment ignored`);
          return null;
        }
      }
      let j = 0;
      for (let v = 0; v < counts.length; v++) {
        let sum = 0;
        for (let k = 0; k < counts[v]; k++, j++) sum += weights[j];
        if (Math.abs(sum - 1) > 1e-4) ctx.issue(ptr(bp, "weights"), `weights of vertex ${v} sum to ${sum}, expected 1 (used as written)`);
      }
      if (counts.length < minVertices) {
        ctx.issue(bp, `at least ${minVertices} vertices are required; attachment ignored`);
        return null;
      }
      return { vertices: null, binding: new BindingData(counts, bones, positions, weights) };
    }
    const verts = vertices;
    if (verts.length % 2 !== 0) {
      ctx.issue(ptr(p, "vertices"), "vertices must hold x, y pairs; attachment ignored");
      return null;
    }
    if (verts.length / 2 < minVertices) {
      ctx.issue(ptr(p, "vertices"), `at least ${minVertices} vertices are required; attachment ignored`);
      return null;
    }
    return { vertices: verts, binding: null };
  }
  function loadSequence(b, o, p, path) {
    const ctx = b.ctx;
    const so = optObject(ctx, o, "sequence", p);
    if (so === void 0) return null;
    const sp = ptr(p, "sequence");
    const sd = so;
    const frames = optStringArray(ctx, sd, "frames", sp);
    const count = optNumber(ctx, sd, "count", sp);
    const start = optNumber(ctx, sd, "start", sp) ?? 1;
    const digits = optNumber(ctx, sd, "digits", sp) ?? 0;
    let names;
    if (frames !== void 0) {
      names = frames;
    } else if (count !== void 0 && count >= 1) {
      names = SequenceData.frameNames(path, Math.trunc(count), start, digits);
    } else {
      ctx.issue(sp, 'one of "count" (>= 1) or "frames" is required; sequence ignored');
      return null;
    }
    if (names.length === 0) {
      ctx.issue(sp, "sequence needs at least one frame; sequence ignored");
      return null;
    }
    let setup = optNumber(ctx, sd, "setup", sp) ?? 0;
    if (setup < 0 || setup >= names.length) {
      ctx.issue(ptr(sp, "setup"), `setup ${setup} outside 0..${names.length - 1}; using 0`);
      setup = 0;
    }
    const seq = new SequenceData(names, start, digits, Math.trunc(setup));
    for (let i = 0; i < names.length; i++) {
      const fp = frames !== void 0 ? ptr(sp, "frames", i) : ptr(p, "path");
      if (!ctx.imageName(fp, names[i])) continue;
      if (ctx.atlases === null) continue;
      const r = findAtlasRegion(ctx.atlases, names[i]);
      if (r === null) ctx.missingImage(fp, names[i]);
      seq.regions[i] = r;
    }
    return seq;
  }
  function resolveImage(b, p, name) {
    const ctx = b.ctx;
    if (!ctx.imageName(ptr(p, "path"), name)) return null;
    if (ctx.atlases === null) return null;
    const r = findAtlasRegion(ctx.atlases, name);
    if (r === null) ctx.missingImage(ptr(p, "path"), name);
    return r;
  }
  var BOUNDING_BOX_SHAPES = ["polygon", "rectangle", "ellipse"];
  var PATH_TYPES = ["region", "mesh", "linkedmesh", PARTICLE_ATTACHMENT_TYPE];
  function loadAttachment(b, o, name, p) {
    const ctx = b.ctx;
    const color = optColor4(ctx, o, "color", p);
    const type = o.type;
    if (!PATH_TYPES.includes(type) && o["path"] !== void 0) ctx.warn(ptr(p, "path"), `"path" is ignored on a "${type}" attachment`);
    switch (type) {
      case "region": {
        const path = optString(ctx, o, "path", p) ?? name;
        const att = new RegionAttachment(name, {
          path,
          color,
          x: optNumber(ctx, o, "x", p),
          y: optNumber(ctx, o, "y", p),
          rotation: optNumber(ctx, o, "rotation", p),
          scaleX: optNumber(ctx, o, "scaleX", p),
          scaleY: optNumber(ctx, o, "scaleY", p),
          width: optNumber(ctx, o, "width", p),
          height: optNumber(ctx, o, "height", p),
          sequence: loadSequence(b, o, p, path)
        });
        att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
        return att;
      }
      case "mesh": {
        const path = optString(ctx, o, "path", p) ?? name;
        const src = loadVertexSource(b, o, p, 3);
        if (src === null) return null;
        const n = src.binding !== null ? src.binding.counts.length : src.vertices.length / 2;
        const uvs = reqNumberArray(ctx, o, "uvs", p);
        if (uvs.length !== n * 2) {
          ctx.issue(ptr(p, "uvs"), `uvs has ${uvs.length} numbers, expected ${n * 2}; attachment ignored`);
          return null;
        }
        const triangles = reqNumberArray(ctx, o, "triangles", p);
        if (triangles.length < 3 || triangles.length % 3 !== 0) {
          ctx.issue(ptr(p, "triangles"), "triangles must hold at least one triple of indices; attachment ignored");
          return null;
        }
        for (let i = 0; i < triangles.length; i++) {
          if (!Number.isInteger(triangles[i]) || triangles[i] < 0 || triangles[i] >= n) {
            ctx.issue(ptr(p, "triangles", i), `vertex index ${triangles[i]} out of range; attachment ignored`);
            return null;
          }
        }
        let hull = optNumber(ctx, o, "hull", p) ?? n;
        if (hull < 1 || hull > n) {
          ctx.issue(ptr(p, "hull"), `hull ${hull} outside 1..${n}; clamped`);
          hull = Math.min(Math.max(hull, 1), n);
        }
        const att = new MeshAttachment(name, {
          path,
          color,
          vertices: src.vertices,
          binding: src.binding,
          uvs,
          triangles,
          hull: Math.trunc(hull),
          edges: optNumberArray(ctx, o, "edges", p),
          width: optNumber(ctx, o, "width", p),
          height: optNumber(ctx, o, "height", p),
          sequence: loadSequence(b, o, p, path)
        });
        att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
        return att;
      }
      case "boundingbox": {
        const shapeName = optString(ctx, o, "shape", p) ?? "polygon";
        if (!BOUNDING_BOX_SHAPES.includes(shapeName)) {
          ctx.warn(ptr(p, "shape"), `unknown shape "${shapeName}"; attachment ignored`);
          return null;
        }
        const shape = shapeName;
        if (shape === "polygon") {
          const src = loadVertexSource(b, o, p, 3);
          if (src === null) return null;
          return new BoundingBoxAttachment(name, { color, shape, vertices: src.vertices, binding: src.binding });
        }
        const width = optNumber(ctx, o, "width", p);
        const height = optNumber(ctx, o, "height", p);
        if (width === void 0 || height === void 0) {
          ctx.issue(p, `"${shape}" needs width and height; attachment ignored`);
          return null;
        }
        return new BoundingBoxAttachment(name, {
          color,
          shape,
          width,
          height,
          x: optNumber(ctx, o, "x", p),
          y: optNumber(ctx, o, "y", p),
          rotation: optNumber(ctx, o, "rotation", p)
        });
      }
      case "clipping": {
        const src = loadVertexSource(b, o, p, 3);
        if (src === null) return null;
        let endSlot = null;
        const endName = optString(ctx, o, "end", p);
        if (endName !== void 0) {
          endSlot = b.slotMap.get(endName) ?? null;
          if (endSlot === null) ctx.issue(ptr(p, "end"), `slot "${endName}" does not exist; ignored`);
        }
        let slots = null;
        const slotNames = optStringArray(ctx, o, "slots", p);
        if (slotNames !== void 0) {
          slots = [];
          for (let i = 0; i < slotNames.length; i++) {
            const s = b.slotMap.get(slotNames[i]);
            if (s === void 0) ctx.issue(ptr(p, "slots", i), `slot "${slotNames[i]}" does not exist; ignored`);
            else slots.push(s);
          }
        }
        const clip = new ClippingAttachment(name, {
          color,
          vertices: src.vertices,
          binding: src.binding,
          endSlot,
          slots,
          invert: optBoolean(ctx, o, "invert", p)
        });
        if (src.binding === null) {
          const crossing = selfIntersection(src.vertices);
          if (crossing !== null) {
            ctx.warn(ptr(p, "vertices"), `CLIP_SELF_INTERSECT: the clipping polygon crosses itself (edges ${crossing[0]} and ${crossing[1]}); the cut may not be what was drawn (spec 7.7)`);
          }
        }
        return clip;
      }
      case "path": {
        const src = loadVertexSource(b, o, p, 6);
        if (src === null) return null;
        const n = src.binding !== null ? src.binding.counts.length : src.vertices.length / 2;
        if (n % 3 !== 0) {
          ctx.issue(p, `a path needs 3 points per anchor (got ${n} points); attachment ignored`);
          return null;
        }
        const closed = optBoolean(ctx, o, "closed", p) ?? false;
        const lengths = reqNumberArray(ctx, o, "lengths", p);
        const curves = closed ? n / 3 : n / 3 - 1;
        if (lengths.length !== curves) ctx.issue(ptr(p, "lengths"), `lengths has ${lengths.length} entries, expected ${curves}`);
        return new PathAttachment(name, {
          color,
          vertices: src.vertices,
          binding: src.binding,
          closed,
          constantSpeed: optBoolean(ctx, o, "constantSpeed", p),
          lengths
        });
      }
      case "point":
        return new PointAttachment(name, {
          color,
          x: optNumber(ctx, o, "x", p),
          y: optNumber(ctx, o, "y", p),
          rotation: optNumber(ctx, o, "rotation", p)
        });
      case "skeleton": {
        const uri = reqString(ctx, o, "uri", p);
        const problem = validateUri(uri);
        if (problem !== null) {
          ctx.issue(ptr(p, "uri"), `invalid uri "${uri}": ${problem}; placeholder treated as empty`);
          return null;
        }
        return new SkeletonAttachment(name, {
          color,
          uri,
          skins: optStringArray(ctx, o, "skins", p),
          animation: optString(ctx, o, "animation", p) ?? null,
          loop: optBoolean(ctx, o, "loop", p),
          timeScale: optNumber(ctx, o, "timeScale", p),
          x: optNumber(ctx, o, "x", p),
          y: optNumber(ctx, o, "y", p),
          rotation: optNumber(ctx, o, "rotation", p),
          scaleX: optNumber(ctx, o, "scaleX", p),
          scaleY: optNumber(ctx, o, "scaleY", p),
          inheritColor: optBoolean(ctx, o, "inheritColor", p),
          inheritAnimation: optBoolean(ctx, o, "inheritAnimation", p),
          baseAnimation: optString(ctx, o, "baseAnimation", p) ?? null,
          around: optString(ctx, o, "around", p) ?? null
        });
      }
      case PARTICLE_ATTACHMENT_TYPE:
        return loadParticle(b, o, name, p);
      default:
        ctx.warn(ptr(p, "type"), `unknown attachment type "${type}"; placeholder treated as empty`);
        return null;
    }
  }
  function loadParticle(b, o, name, p) {
    const ctx = b.ctx;
    const path = optString(ctx, o, "path", p) ?? name;
    const enumField = (key, allowed, fallback) => {
      const raw = optString(ctx, o, key, p);
      if (raw === void 0) return fallback;
      if (allowed.includes(raw)) return raw;
      ctx.warn(ptr(p, key), `unknown ${key} "${raw}"; using "${fallback}"`);
      return fallback;
    };
    let shape = "point";
    let shapeKnown = true;
    const rawShape = optString(ctx, o, "shape", p);
    if (rawShape !== void 0) {
      if (PARTICLE_SHAPES.includes(rawShape)) shape = rawShape;
      else {
        shapeKnown = false;
        ctx.warn(ptr(p, "shape"), `unknown particle shape "${rawShape}"; emitter "${name}" is NOT drawn (extension BONE_particles 7.4)`);
      }
    }
    const bursts = [];
    const burstList = optArray(ctx, o, "bursts", p);
    if (burstList !== void 0) {
      for (let i = 0; i < burstList.length; i++) {
        const bp = ptr(p, "bursts", i);
        const raw = expectObject(ctx, burstList[i], bp);
        const interval = optNumber(ctx, raw, "interval", bp) ?? 1;
        bursts.push({
          time: optNumber(ctx, raw, "time", bp) ?? 0,
          count: Math.max(1, Math.trunc(optNumber(ctx, raw, "count", bp) ?? 1)),
          cycles: Math.max(1, Math.trunc(optNumber(ctx, raw, "cycles", bp) ?? 1)),
          interval: interval > 0 ? interval : 1,
          probability: optNumber(ctx, raw, "probability", bp) ?? 1
        });
      }
    }
    let rate = optNumber(ctx, o, "rate", p) ?? 10;
    if (rate < 0) {
      ctx.issue(ptr(p, "rate"), `RANGE_PARTICLE_RATE: rate ${rate} is negative; using 0`);
      rate = 0;
    }
    const looping = optBoolean(ctx, o, "looping", p) ?? true;
    const prewarm = optNumber(ctx, o, "prewarm", p) ?? 0;
    if (looping && prewarm > 0) {
      ctx.warn(ptr(p, "prewarm"), "prewarm only applies with looping: false; ignored");
    }
    const att = new ParticleAttachment(name, {
      color: optColor4(ctx, o, "color", p),
      path,
      // Extension 9.10: where the emitter is in its bone, like a `region`.
      x: optNumber(ctx, o, "x", p),
      y: optNumber(ctx, o, "y", p),
      rotation: optNumber(ctx, o, "rotation", p),
      emitting: optBoolean(ctx, o, "emitting", p),
      rate,
      bursts,
      explosiveness: optNumber(ctx, o, "explosiveness", p),
      duration: optNumber(ctx, o, "duration", p),
      randomness: optNumber(ctx, o, "randomness", p),
      startDelay: optNumber(ctx, o, "startDelay", p),
      lifetime: optNumberArray(ctx, o, "lifetime", p),
      maxParticles: optNumber(ctx, o, "maxParticles", p),
      speed: optNumberArray(ctx, o, "speed", p),
      direction: optNumber(ctx, o, "direction", p),
      spread: optNumber(ctx, o, "spread", p),
      spherizeDirection: optNumber(ctx, o, "spherizeDirection", p),
      alignToVelocity: optBoolean(ctx, o, "alignToVelocity", p),
      shape,
      shapeKnown,
      radius: optNumber(ctx, o, "radius", p),
      radiusThickness: optNumber(ctx, o, "radiusThickness", p),
      arc: optNumber(ctx, o, "arc", p),
      size: optNumberArray(ctx, o, "size", p),
      edge: optNumberArray(ctx, o, "edge", p),
      mesh: optString(ctx, o, "mesh", p) ?? null,
      meshMode: enumField("meshMode", PARTICLE_MESH_MODES, "vertex"),
      curve: optString(ctx, o, "curve", p) ?? null,
      gravity: optNumberArray(ctx, o, "gravity", p),
      drag: optNumber(ctx, o, "drag", p),
      angle: optNumberArray(ctx, o, "angle", p),
      angularVelocity: optNumberArray(ctx, o, "angularVelocity", p),
      scale: optNumberArray(ctx, o, "scale", p),
      scaleOverLifetime: loadOverLifetime(b, o, "scaleOverLifetime", p, readOverLifetimeNumber),
      startColor: optArray(ctx, o, "startColor", p),
      colorOverLifetime: loadOverLifetime(b, o, "colorOverLifetime", p, readOverLifetimeColor),
      alphaOverLifetime: loadOverLifetime(b, o, "alphaOverLifetime", p, readOverLifetimeNumber),
      sequence: loadSequence(b, o, p, path),
      frameMode: enumField("frameMode", PARTICLE_FRAME_MODES, "lifetime"),
      cycles: optNumber(ctx, o, "cycles", p),
      fps: optNumber(ctx, o, "fps", p),
      startFrame: optNumberArray(ctx, o, "startFrame", p),
      space: enumField("space", PARTICLE_SPACES, "local"),
      seed: optNumber(ctx, o, "seed", p),
      looping,
      prewarm,
      sortMode: enumField("sortMode", PARTICLE_SORT_MODES, "youngestInFront")
    });
    att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
    return att;
  }
  function readOverLifetimeNumber(ctx, value, p) {
    if (typeof value !== "number" || !Number.isFinite(value)) {
      ctx.issue(p, "over-lifetime value must be a number; key ignored");
      return void 0;
    }
    return value;
  }
  function readOverLifetimeColor(ctx, value, p) {
    if (!Array.isArray(value) || value.length < 4) {
      ctx.issue(p, "over-lifetime color must be four numbers; key ignored");
      return void 0;
    }
    return new Float64Array([value[0], value[1], value[2], value[3]]);
  }
  function loadOverLifetime(b, o, key, p, read) {
    const ctx = b.ctx;
    const list = optArray(ctx, o, key, p);
    if (list === void 0) return null;
    const out = [];
    for (let i = 0; i < list.length; i++) {
      const kp = ptr(p, key, i);
      const raw = expectObject(ctx, list[i], kp);
      const time = optNumber(ctx, raw, "time", kp) ?? 0;
      const value = read(ctx, raw["value"], ptr(kp, "value"));
      if (value === void 0) continue;
      const curve = raw["curve"];
      out.push({
        time,
        value,
        curve: typeof curve === "string" || Array.isArray(curve) ? curve : "linear"
      });
    }
    out.sort((a, c) => a.time - c.time);
    return out;
  }
  function loadLinkedMesh(b, item) {
    const ctx = b.ctx;
    const { def: o, pointer: p, name, slot } = item;
    const parentName = reqString(ctx, o, "parent", p);
    const skinName = optString(ctx, o, "skin", p) ?? "default";
    const parentSkin = b.skinMap.get(skinName);
    if (parentSkin === void 0) {
      ctx.issue(ptr(p, "skin"), `skin "${skinName}" does not exist; linked mesh ignored`);
      return null;
    }
    const parent = parentSkin.getAttachment(slot.index, parentName);
    if (!(parent instanceof MeshAttachment)) {
      ctx.issue(ptr(p, "parent"), `parent "${parentName}" is not a mesh in skin "${skinName}" of slot "${slot.name}"; linked mesh ignored`);
      return null;
    }
    const path = optString(ctx, o, "path", p) ?? name;
    const att = new LinkedMeshAttachment(name, parent, {
      path,
      color: optColor4(ctx, o, "color", p),
      skin: skinName,
      inheritDeform: optBoolean(ctx, o, "inheritDeform", p),
      width: optNumber(ctx, o, "width", p),
      height: optNumber(ctx, o, "height", p),
      sequence: loadSequence(b, o, p, path)
    });
    att.setRegion(att.sequence !== null ? att.sequence.regions[att.sequence.setup] : resolveImage(b, p, path));
    return att;
  }
  function loadMorphs(b, defs) {
    const ctx = b.ctx;
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/morphs", i);
      const o = expectObject(ctx, defs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (b.morphMap.has(name)) ctx.issue(ptr(p, "name"), `duplicate morph name "${name}"`);
      const min = optNumber(ctx, o, "min", p) ?? 0;
      const max = optNumber(ctx, o, "max", p) ?? 1;
      if (max <= min) ctx.issue(ptr(p, "max"), `max (${max}) must be greater than min (${min})`);
      const morph = new MorphData(b.morphs.length, name, {
        weight: optNumber(ctx, o, "weight", p),
        min,
        max,
        group: optString(ctx, o, "group", p) ?? null
      });
      const targets = optArray(ctx, o, "targets", p) ?? [];
      if (targets.length === 0) ctx.issue(ptr(p, "targets"), "a morph needs at least one target");
      for (let j = 0; j < targets.length; j++) {
        const tp = ptr(p, "targets", j);
        const t = expectObject(ctx, targets[j], tp);
        const slotName = reqString(ctx, t, "slot", tp);
        const attName = reqString(ctx, t, "attachment", tp);
        const skinName = optString(ctx, t, "skin", tp) ?? "default";
        const offsets = reqNumberArray(ctx, t, "offsets", tp);
        const slot = b.slotMap.get(slotName);
        const skin = b.skinMap.get(skinName);
        if (slot === void 0) {
          ctx.issue(ptr(tp, "slot"), `slot "${slotName}" does not exist; target ignored`);
          continue;
        }
        if (skin === void 0) {
          ctx.issue(ptr(tp, "skin"), `skin "${skinName}" does not exist; target ignored`);
          continue;
        }
        const att = skin.getAttachment(slot.index, attName);
        if (!(att instanceof MeshAttachment)) {
          ctx.issue(ptr(tp, "attachment"), `"${attName}" is not a mesh in skin "${skinName}" of slot "${slotName}"; target ignored`);
          continue;
        }
        let offs = offsets;
        if (offs.length > att.deformLength) {
          ctx.issue(ptr(tp, "offsets"), `offsets has ${offs.length} numbers, more than the deform layout (${att.deformLength}); truncated`);
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
  var POSITION_MODES = ["fixed", "percent"];
  var SPACING_MODES = ["length", "fixed", "percent", "proportional"];
  var ROTATE_MODES = ["tangent", "chain", "chainScale"];
  var DRIVER_MODES = ["replace", "add"];
  function resolveBoneList(b, o, p, min, max) {
    const ctx = b.ctx;
    const names = optStringArray(ctx, o, "bones", p);
    if (names === void 0) {
      ctx.issue(ptr(p, "bones"), "bones is required; constraint ignored");
      return null;
    }
    if (names.length < min || names.length > max) {
      ctx.issue(ptr(p, "bones"), `expected ${min}..${max} bones, got ${names.length}; constraint ignored`);
      return null;
    }
    const bones = [];
    for (let i = 0; i < names.length; i++) {
      const bone = b.boneMap.get(names[i]);
      if (bone === void 0) {
        ctx.issue(ptr(p, "bones", i), `bone "${names[i]}" does not exist; constraint ignored`);
        return null;
      }
      bones.push(bone);
    }
    return bones;
  }
  function isDescendant(bone, ancestor) {
    for (let p = bone.parent; p !== null; p = p.parent) if (p === ancestor) return true;
    return false;
  }
  function loadConstraints(b, defs) {
    const ctx = b.ctx;
    const slots = [];
    const names = /* @__PURE__ */ new Set();
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/constraints", i);
      const o = expectObject(ctx, defs[i], p);
      const type = reqString(ctx, o, "type", p);
      const name = reqString(ctx, o, "name", p);
      if (names.has(name)) ctx.issue(ptr(p, "name"), `duplicate constraint name "${name}"`);
      const common = { mix: optNumber(ctx, o, "mix", p), skinRequired: optBoolean(ctx, o, "skinRequired", p) };
      const index = slots.length;
      let c = null;
      switch (type) {
        case "ik":
          c = loadIk(b, o, p, index, name, common);
          break;
        case "transform":
          c = loadTransform(b, o, p, index, name, common);
          break;
        case "path":
          c = loadPath(b, o, p, index, name, common);
          break;
        case "physics":
          c = loadPhysics(b, o, p, index, name, common);
          break;
        case "driver":
          names.add(name);
          slots.push({ deferred: true, o, p, name, common });
          continue;
        default:
          ctx.warn(ptr(p, "type"), `unknown constraint type "${type}"; constraint ignored`);
      }
      if (c === null) continue;
      names.add(name);
      slots.push(c);
      if (!b.constraintMap.has(name)) b.constraintMap.set(name, c);
    }
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
    for (let i = 0; i < b.constraints.length; i++) {
      b.constraints[i].index = i;
    }
  }
  function loadIk(b, o, p, index, name, common) {
    const ctx = b.ctx;
    const bones = resolveBoneList(b, o, p, 1, 2);
    if (bones === null) return null;
    const targetName = reqString(ctx, o, "target", p);
    const target = b.boneMap.get(targetName);
    if (target === void 0) {
      ctx.issue(ptr(p, "target"), `bone "${targetName}" does not exist; constraint ignored`);
      return null;
    }
    if (bones[0].parent === null) {
      ctx.issue(ptr(p, "bones", 0), "the root bone cannot be constrained by IK; constraint ignored");
      return null;
    }
    if (bones.length === 2 && bones[1].parent !== bones[0]) {
      ctx.issue(ptr(p, "bones", 1), `"${bones[1].name}" must be a child of "${bones[0].name}"; constraint ignored`);
      return null;
    }
    for (const bone of bones) {
      if (target === bone || isDescendant(target, bone)) {
        ctx.issue(ptr(p, "target"), `target "${targetName}" is one of the constrained bones or a descendant; constraint ignored`);
        return null;
      }
    }
    if (bones.length === 2) {
      for (let i = 0; i < 2; i++) {
        if (bones[i].inherit !== "normal") {
          ctx.issue(ptr(p, "bones", i), `"${bones[i].name}" must use normal inheritance for 2-bone IK; constraint ignored`);
          return null;
        }
      }
    }
    return new IkConstraintData(index, name, bones, target, {
      ...common,
      bendPositive: optBoolean(ctx, o, "bendPositive", p),
      compress: optBoolean(ctx, o, "compress", p),
      stretch: optBoolean(ctx, o, "stretch", p),
      uniform: optBoolean(ctx, o, "uniform", p),
      softness: optNumber(ctx, o, "softness", p)
    });
  }
  function loadTransform(b, o, p, index, name, common) {
    const ctx = b.ctx;
    const bones = resolveBoneList(b, o, p, 1, Number.MAX_SAFE_INTEGER);
    if (bones === null) return null;
    const targetName = reqString(ctx, o, "target", p);
    const target = b.boneMap.get(targetName);
    if (target === void 0) {
      ctx.issue(ptr(p, "target"), `bone "${targetName}" does not exist; constraint ignored`);
      return null;
    }
    return new TransformConstraintData(index, name, bones, target, {
      ...common,
      local: optBoolean(ctx, o, "local", p),
      relative: optBoolean(ctx, o, "relative", p),
      offsetRotation: optNumber(ctx, o, "offsetRotation", p),
      offsetX: optNumber(ctx, o, "offsetX", p),
      offsetY: optNumber(ctx, o, "offsetY", p),
      offsetScaleX: optNumber(ctx, o, "offsetScaleX", p),
      offsetScaleY: optNumber(ctx, o, "offsetScaleY", p),
      offsetShearY: optNumber(ctx, o, "offsetShearY", p),
      mixRotation: optNumber(ctx, o, "mixRotation", p),
      mixX: optNumber(ctx, o, "mixX", p),
      mixY: optNumber(ctx, o, "mixY", p),
      mixScaleX: optNumber(ctx, o, "mixScaleX", p),
      mixScaleY: optNumber(ctx, o, "mixScaleY", p),
      mixShearY: optNumber(ctx, o, "mixShearY", p)
    });
  }
  function loadPath(b, o, p, index, name, common) {
    const ctx = b.ctx;
    const bones = resolveBoneList(b, o, p, 1, Number.MAX_SAFE_INTEGER);
    if (bones === null) return null;
    const targetName = reqString(ctx, o, "target", p);
    const target = b.slotMap.get(targetName);
    if (target === void 0) {
      ctx.issue(ptr(p, "target"), `slot "${targetName}" does not exist; constraint ignored`);
      return null;
    }
    return new PathConstraintData(index, name, bones, target, {
      ...common,
      positionMode: optEnum(ctx, o, "positionMode", p, POSITION_MODES, "percent"),
      spacingMode: optEnum(ctx, o, "spacingMode", p, SPACING_MODES, "length"),
      rotateMode: optEnum(ctx, o, "rotateMode", p, ROTATE_MODES, "tangent"),
      offsetRotation: optNumber(ctx, o, "offsetRotation", p),
      position: optNumber(ctx, o, "position", p),
      spacing: optNumber(ctx, o, "spacing", p),
      mixRotation: optNumber(ctx, o, "mixRotation", p),
      mixX: optNumber(ctx, o, "mixX", p),
      mixY: optNumber(ctx, o, "mixY", p)
    });
  }
  function loadPhysics(b, o, p, index, name, common) {
    const ctx = b.ctx;
    const boneName = reqString(ctx, o, "bone", p);
    const bone = b.boneMap.get(boneName);
    if (bone === void 0) {
      ctx.issue(ptr(p, "bone"), `bone "${boneName}" does not exist; constraint ignored`);
      return null;
    }
    const mass = optNumber(ctx, o, "mass", p);
    if (mass !== void 0 && mass <= 0) ctx.issue(ptr(p, "mass"), "mass must be > 0");
    const fps = optNumber(ctx, o, "fps", p);
    if (fps !== void 0 && fps <= 0) ctx.issue(ptr(p, "fps"), "fps must be > 0");
    return new PhysicsConstraintData(index, name, bone, {
      ...common,
      x: optNumber(ctx, o, "x", p),
      y: optNumber(ctx, o, "y", p),
      rotation: optNumber(ctx, o, "rotation", p),
      scaleX: optNumber(ctx, o, "scaleX", p),
      shearX: optNumber(ctx, o, "shearX", p),
      inertia: optNumber(ctx, o, "inertia", p),
      strength: optNumber(ctx, o, "strength", p),
      damping: optNumber(ctx, o, "damping", p),
      mass: mass !== void 0 && mass > 0 ? mass : void 0,
      wind: optNumber(ctx, o, "wind", p),
      gravity: optNumber(ctx, o, "gravity", p),
      limit: optNumber(ctx, o, "limit", p),
      fps: fps !== void 0 && fps > 0 ? fps : void 0
    });
  }
  var DRIVER_FORBIDDEN_TYPES = ["event", "sequence", "tag"];
  function loadDriver(b, o, p, index, name, common) {
    const ctx = b.ctx;
    const paramName = reqString(ctx, o, "parameter", p);
    const parameter = b.parameterMap.get(paramName);
    if (parameter === void 0) {
      ctx.issue(ptr(p, "parameter"), `parameter "${paramName}" does not exist; constraint ignored`);
      return null;
    }
    const targetDefs = optArray(ctx, o, "targets", p);
    const animationName = optString(ctx, o, "animation", p);
    if (targetDefs === void 0 === (animationName === void 0)) {
      ctx.issue(p, 'exactly one of "targets" or "animation" is required; constraint ignored');
      return null;
    }
    if (animationName !== void 0 && !b.animationNames.has(animationName)) {
      ctx.issue(ptr(p, "animation"), `animation "${animationName}" does not exist; constraint ignored`);
      return null;
    }
    const from = optNumber(ctx, o, "from", p) ?? parameter.min;
    const to = optNumber(ctx, o, "to", p) ?? parameter.max;
    if (to === from) {
      ctx.issue(ptr(p, "to"), "to must differ from from; constraint ignored");
      return null;
    }
    const mode = optEnum(ctx, o, "mode", p, DRIVER_MODES, "replace");
    let targets = null;
    if (targetDefs !== void 0) {
      targets = [];
      if (targetDefs.length === 0) ctx.issue(ptr(p, "targets"), "a driver needs at least one target");
      for (let i = 0; i < targetDefs.length; i++) {
        const tp = ptr(p, "targets", i);
        const t = expectObject(ctx, targetDefs[i], tp);
        const type = reqString(ctx, t, "type", tp);
        if (DRIVER_FORBIDDEN_TYPES.includes(type)) {
          ctx.issue(ptr(tp, "type"), `"${type}" is not allowed as a driver target; target ignored`);
          continue;
        }
        const targetMode = optEnum(ctx, t, "mode", tp, DRIVER_MODES, "replace");
        const tl = loadTimeline(b, t, tp, "input");
        if (tl === null) continue;
        if (targetMode === "add" && !allowsAddMode(tl)) {
          ctx.issue(ptr(tp, "mode"), '"add" is not allowed for this target; using "replace"');
          targets.push(new DriverTargetData(tl, "replace"));
        } else {
          if (tl.kind === "parameter" && tl.parameter === parameter) {
            ctx.issue(ptr(tp, "target"), "a driver must not write its own parameter; target ignored");
            continue;
          }
          targets.push(new DriverTargetData(tl, targetMode));
        }
      }
    }
    return new DriverConstraintData(index, name, parameter, {
      ...common,
      targets,
      animationName: animationName ?? null,
      from,
      to,
      timeFrom: optNumber(ctx, o, "timeFrom", p),
      timeTo: optNumber(ctx, o, "timeTo", p),
      mode
    });
  }
  function allowsAddMode(tl) {
    switch (tl.kind) {
      case "slot.attachment":
      case "slot.visible":
      case "drawOrder":
      case "nested.animation":
      case "bone.inherit":
      case "bone.parent":
      case "variable.stepped":
      case "constraint.boolean":
      case "constraint.reset":
        return false;
      default:
        return true;
    }
  }
  function linkSkinConstraints(b, skinDefs) {
    const ctx = b.ctx;
    const seen = /* @__PURE__ */ new Set();
    for (let i = 0; i < skinDefs.length; i++) {
      const o = skinDefs[i];
      if (!isObject(o) || typeof o["name"] !== "string") continue;
      const name = o["name"];
      if (seen.has(name)) continue;
      seen.add(name);
      const skin = b.skinMap.get(name);
      if (skin === void 0) continue;
      const p = ptr("/skins", i);
      const names = optStringArray(ctx, o, "constraints", p) ?? [];
      for (let j = 0; j < names.length; j++) {
        const c = b.constraintMap.get(names[j]);
        if (c === void 0) {
          ctx.issue(ptr(p, "constraints", j), `constraint "${names[j]}" does not exist; ignored`);
          continue;
        }
        if (!c.skinRequired) ctx.warn(ptr(p, "constraints", j), `constraint "${names[j]}" is not skinRequired`);
        skin.constraints.push(c);
      }
    }
  }
  function bindDriverAnimations(b) {
    for (const c of b.constraints) {
      if (!(c instanceof DriverConstraintData) || c.animationName === null) continue;
      const anim = b.animationMap.get(c.animationName);
      if (anim === void 0) continue;
      c.animation = anim;
      if (Number.isNaN(c.timeTo)) c.timeTo = anim.duration;
    }
  }
  var ANIMATION_BLENDS = ["replace", "add", "multiply"];
  function loadAnimations(b, defs) {
    const ctx = b.ctx;
    for (let i = 0; i < defs.length; i++) {
      const p = ptr("/animations", i);
      const o = expectObject(ctx, defs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (b.animationMap.has(name)) ctx.issue(ptr(p, "name"), `duplicate animation name "${name}"`);
      const tlDefs = optArray(ctx, o, "timelines", p) ?? [];
      const timelines = [];
      const keys = /* @__PURE__ */ new Map();
      const hasBody = tlDefs.some((t) => isObject(t) && t["type"] === "body");
      b.unmetCode = b.externalAnimations?.has(o) === true ? "RIG_UNMET" : hasBody ? "BODY_UNMET" : b.baseUnmetCode ?? null;
      for (let j = 0; j < tlDefs.length; j++) {
        const tp = ptr(p, "timelines", j);
        const t = expectObject(ctx, tlDefs[j], tp);
        const tl = loadTimeline(b, t, tp, "time");
        if (tl === null) continue;
        const identity = timelineIdentity(t);
        const previous = keys.get(identity);
        if (previous !== void 0) {
          ctx.issue(tp, `duplicate timeline ${identity}; the last one is used`);
          timelines[previous] = tl;
          continue;
        }
        keys.set(identity, timelines.length);
        timelines.push(tl);
      }
      const duration = optNumber(ctx, o, "duration", p);
      if (duration !== void 0) {
        if (duration < 0) ctx.issue(ptr(p, "duration"), "duration must be >= 0");
        for (let j = 0; j < timelines.length; j++) {
          if (timelines[j].lastTime > duration) {
            ctx.issue(ptr(p, "duration"), `duration ${duration} is smaller than the last key time ${timelines[j].lastTime}`);
            break;
          }
        }
      }
      b.unmetCode = null;
      const anim = new AnimationData(b.animations.length, name, timelines, {
        duration: duration !== void 0 ? Math.max(0, duration) : void 0,
        loop: optBoolean(ctx, o, "loop", p),
        blend: optEnum(ctx, o, "blend", p, ANIMATION_BLENDS, "replace"),
        defaultMix: optNumber(ctx, o, "defaultMix", p) ?? null,
        tags: optStringArray(ctx, o, "tags", p),
        crop: loadCrop(ctx, o, p),
        source: o
      });
      b.animations.push(anim);
      if (!b.animationMap.has(name)) b.animationMap.set(name, anim);
    }
  }
  function timelineIdentity(t) {
    const s = (k) => typeof t[k] === "string" ? t[k] : "";
    const type = s("type");
    const particle = type === "BONE_particle";
    const hasAttachment = type === "deform" || type === "sequence" || type === "weights" || particle;
    const hasProperty = type === "bone" || type === "slot" || type === "constraint" || type === "nested" || particle;
    const skin = hasAttachment ? s("skin") || "default" : "";
    const attachment = hasAttachment ? s("attachment") : "";
    const property = hasProperty ? s("property") : "";
    return `(${type}, ${s("target")}, ${property}, ${skin}, ${attachment})`;
  }
  function readKeys(b, o, p, timeKey, allowEqual) {
    const ctx = b.ctx;
    const arr = optArray(ctx, o, "keys", p);
    const kp = ptr(p, "keys");
    if (arr === void 0 || arr.length === 0) {
      ctx.issue(kp, "at least one key is required; timeline ignored");
      return null;
    }
    let objs = arr.map((k, i) => expectObject(ctx, k, ptr(kp, i)));
    let times = objs.map((k, i) => reqNumber(ctx, k, timeKey, ptr(kp, i)));
    let ordered = true;
    for (let i = 1; i < times.length; i++) {
      if (times[i] < times[i - 1] || !allowEqual && times[i] === times[i - 1]) {
        ordered = false;
        break;
      }
    }
    if (!ordered) {
      ctx.issue(kp, `${timeKey} must be ${allowEqual ? "non-decreasing" : "strictly increasing"}; keys reordered`);
      const order = times.map((t, i) => i).sort((x, y) => times[x] - times[y] || x - y);
      objs = order.map((i) => objs[i]);
      times = order.map((i) => times[i]);
      if (!allowEqual) {
        const dedupObjs = [];
        const dedupTimes = [];
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
    if (timeKey === "time") {
      for (let i = 0; i < times.length; i++) if (times[i] < 0) {
        ctx.issue(ptr(kp, i, "time"), "time must be >= 0");
        break;
      }
    }
    return { objs, times: Float64Array.from(times), pointer: kp };
  }
  function curveWarner(ctx, pointer) {
    return (message) => ctx.warn(ptr(pointer, "curve"), message);
  }
  function numericKeys(b, raw, components) {
    const ctx = b.ctx;
    const n = raw.objs.length;
    const values = new Float64Array(n * components);
    const curves = new Array(n);
    for (let i = 0; i < n; i++) {
      const k = raw.objs[i];
      const kp = ptr(raw.pointer, i);
      const v = k["value"];
      if (components === 1) {
        if (typeof v !== "number" || !Number.isFinite(v)) {
          ctx.issue(ptr(kp, "value"), "expected a number; timeline ignored");
          return null;
        }
        values[i] = v;
      } else {
        if (!Array.isArray(v) || v.length !== components) {
          ctx.issue(ptr(kp, "value"), `expected ${components} numbers; timeline ignored`);
          return null;
        }
        const nums = numberArray(ctx, v, ptr(kp, "value"));
        for (let j = 0; j < components; j++) values[i * components + j] = nums[j];
      }
      curves[i] = i < n - 1 ? normalizeCurve(k["curve"], components, true, raw.times[i], raw.times[i + 1], curveWarner(ctx, kp)) : LINEAR_CURVE;
    }
    return { times: raw.times, values, components, curves };
  }
  function steppedKeys(b, raw, read, describe) {
    const ctx = b.ctx;
    const values = [];
    for (let i = 0; i < raw.objs.length; i++) {
      const k = raw.objs[i];
      const kp = ptr(raw.pointer, i);
      const v = read(k["value"], ptr(kp, "value"));
      if (v === void 0) {
        ctx.issue(ptr(kp, "value"), `expected ${describe}; timeline ignored`);
        return null;
      }
      const curve = k["curve"];
      if (curve !== void 0 && curve !== "stepped") ctx.warn(ptr(kp, "curve"), 'non-numeric value: curve treated as "stepped"');
      values.push(v);
    }
    return { times: raw.times, values };
  }
  var readBoolean = (v) => typeof v === "boolean" ? v : void 0;
  var readStringOrNull = (v) => v === null || typeof v === "string" ? v : void 0;
  function loadTimeline(b, t, p, timeKey) {
    const ctx = b.ctx;
    const type = reqString(ctx, t, "type", p);
    const target = optString(ctx, t, "target", p);
    const property = optString(ctx, t, "property", p);
    const needTarget = () => {
      if (target === void 0) {
        ctx.issue(ptr(p, "target"), `"${type}" timeline needs a target; timeline ignored`);
        return null;
      }
      return target;
    };
    const needProperty = () => {
      if (property === void 0) {
        ctx.issue(ptr(p, "property"), `"${type}" timeline needs a property; timeline ignored`);
        return null;
      }
      return property;
    };
    switch (type) {
      case "bone": {
        const tn = needTarget();
        const pn = needProperty();
        if (tn === null || pn === null) return null;
        const bone = b.boneMap.get(tn);
        if (bone === void 0) {
          missingTarget(b, ptr(p, "target"), `bone "${tn}" does not exist; timeline ignored`);
          return null;
        }
        if (BONE_NUMERIC_PROPERTIES.includes(pn)) {
          const raw = readKeys(b, t, p, timeKey, false);
          if (raw === null) return null;
          const keys = numericKeys(b, raw, 1);
          if (keys === null) return null;
          return new BoneNumberTimelineData(bone, pn, keys);
        }
        if (BONE_INHERIT_PROPERTIES.includes(pn)) {
          const raw = readKeys(b, t, p, timeKey, false);
          if (raw === null) return null;
          const keys = steppedKeys(b, raw, readBoolean, "a boolean");
          if (keys === null) return null;
          return new BoneInheritTimelineData(bone, pn, keys);
        }
        if (pn === "parent") {
          const raw = readKeys(b, t, p, timeKey, false);
          if (raw === null) return null;
          const keys = steppedKeys(b, raw, (v, kp) => {
            if (v === null) return null;
            if (typeof v !== "string") return void 0;
            const target2 = b.boneMap.get(v);
            if (target2 === void 0) {
              ctx.issue(kp, `bone "${v}" does not exist`);
              return void 0;
            }
            return target2;
          }, "a bone name or null");
          if (keys === null) return null;
          return new BoneParentTimelineData(bone, keys);
        }
        ctx.warn(ptr(p, "property"), `unknown bone property "${pn}"; timeline ignored`);
        return null;
      }
      case "slot": {
        const tn = needTarget();
        const pn = needProperty();
        if (tn === null || pn === null) return null;
        const slot = b.slotMap.get(tn);
        if (slot === void 0) {
          missingTarget(b, ptr(p, "target"), `slot "${tn}" does not exist; timeline ignored`);
          return null;
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        switch (pn) {
          case "bone": {
            const values = [];
            for (let i = 0; i < raw.objs.length; i++) {
              const k = raw.objs[i];
              const kp = ptr(raw.pointer, i);
              const v = k["value"];
              const curve = k["curve"];
              if (curve !== void 0 && curve !== "stepped") ctx.warn(ptr(kp, "curve"), 'a slot/bone key is stepped only; curve treated as "stepped"');
              if (v === null) {
                values.push({ bone: null, transform: null });
                continue;
              }
              if (typeof v !== "string") {
                ctx.issue(ptr(kp, "value"), "expected a bone name or null; timeline ignored");
                return null;
              }
              const bone = b.boneMap.get(v);
              if (bone === void 0) {
                ctx.warn(ptr(kp, "value"), `SLOT_BONE_UNMET: bone "${v}" does not exist in this body; the bone before the key holds`);
                values.push(i === 0 ? { bone: null, transform: null } : values[i - 1]);
                continue;
              }
              values.push({ bone, transform: loadKeyTransform(ctx, k, kp) });
            }
            return new SlotBoneTimelineData(slot, { times: raw.times, values });
          }
          case "attachment": {
            const keys = steppedKeys(b, raw, readStringOrNull, "a placeholder name or null");
            if (keys === null) return null;
            return new SlotAttachmentTimelineData(slot, keys);
          }
          case "color": {
            const keys = numericKeys(b, raw, 4);
            if (keys === null) return null;
            return new SlotColorTimelineData(slot, keys);
          }
          case "darkColor": {
            const n = raw.objs.length;
            const values = [];
            for (let i = 0; i < n; i++) {
              const v = raw.objs[i]["value"];
              if (v === null) {
                values.push(null);
                continue;
              }
              if (!Array.isArray(v) || v.length !== 3) {
                ctx.issue(ptr(raw.pointer, i, "value"), "expected 3 numbers or null; timeline ignored");
                return null;
              }
              values.push(Float64Array.from(numberArray(ctx, v, ptr(raw.pointer, i, "value"))));
            }
            const curves = [];
            for (let i = 0; i < n; i++) {
              const interpolable = i < n - 1 && values[i] !== null && values[i + 1] !== null;
              curves.push(i < n - 1 ? normalizeCurve(raw.objs[i]["curve"], 3, interpolable, raw.times[i], raw.times[i + 1], curveWarner(ctx, ptr(raw.pointer, i))) : STEPPED_CURVE);
            }
            return new SlotDarkColorTimelineData(slot, raw.times, values, curves);
          }
          case "visible": {
            const keys = steppedKeys(b, raw, readBoolean, "a boolean");
            if (keys === null) return null;
            return new SlotVisibleTimelineData(slot, keys);
          }
          default:
            ctx.warn(ptr(p, "property"), `unknown slot property "${pn}"; timeline ignored`);
            return null;
        }
      }
      case "drawOrder": {
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const orders = [];
        const entries = [];
        for (let i = 0; i < raw.objs.length; i++) {
          const kp = ptr(raw.pointer, i, "value");
          const v = raw.objs[i]["value"];
          if (!Array.isArray(v)) {
            ctx.issue(kp, "expected an array of {slot, offset}; timeline ignored");
            return null;
          }
          orders.push(v.length === 0 ? null : computeDrawOrder(b, v, kp));
          entries.push(v.length === 0 ? null : readDrawOrderEntries(b, v));
        }
        return new DrawOrderTimelineData(raw.times, orders, entries);
      }
      case "deform": {
        const tn = needTarget();
        if (tn === null) return null;
        const res = resolveTimelineAttachment(b, t, p, tn);
        if (res === null) return null;
        const { slot, skin, attachment } = res;
        if (!(attachment instanceof VertexAttachment)) {
          ctx.issue(ptr(p, "attachment"), "deform needs a vertex attachment; timeline ignored");
          return null;
        }
        if (attachment instanceof LinkedMeshAttachment && attachment.inheritDeform) {
          ctx.issue(ptr(p, "attachment"), "a linked mesh with inheritDeform cannot have its own deform; timeline ignored");
          return null;
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const n = raw.objs.length;
        const layout = attachment.deformLength;
        const vertices = [];
        const curves = [];
        for (let i = 0; i < n; i++) {
          const k = raw.objs[i];
          const kp = ptr(raw.pointer, i);
          const v = k["value"];
          if (!Array.isArray(v)) {
            ctx.issue(ptr(kp, "value"), "expected an array of numbers; timeline ignored");
            return null;
          }
          const nums = numberArray(ctx, v, ptr(kp, "value"));
          if (nums.length === 0) {
            vertices.push(new Float64Array(0));
          } else {
            let offset = optNumber(ctx, k, "offset", kp) ?? 0;
            if (offset < 0 || !Number.isInteger(offset)) {
              ctx.issue(ptr(kp, "offset"), "offset must be a non-negative integer; using 0");
              offset = 0;
            }
            const expanded = new Float64Array(layout);
            if (offset + nums.length > layout) ctx.issue(ptr(kp, "value"), `deform of ${nums.length} numbers at offset ${offset} exceeds the layout (${layout}); truncated`);
            for (let j = 0; j < nums.length && offset + j < layout; j++) expanded[offset + j] = nums[j];
            vertices.push(expanded);
          }
          curves.push(i < n - 1 ? normalizeCurve(k["curve"], 1, true, raw.times[i], raw.times[i + 1], curveWarner(ctx, kp)) : LINEAR_CURVE);
        }
        return new DeformTimelineData(slot, skin, attachment, raw.times, vertices, curves);
      }
      case "weights": {
        const tn = needTarget();
        if (tn === null) return null;
        const res = resolveTimelineAttachment(b, t, p, tn);
        if (res === null) return null;
        const { slot, skin, attachment } = res;
        if (!(attachment instanceof VertexAttachment) || attachment.binding === null || attachment instanceof LinkedMeshAttachment && attachment.inheritDeform) {
          ctx.issue(ptr(p, "attachment"), "ORDER_TIMELINE_TARGET: weights needs an attachment with a binding; timeline ignored");
          return null;
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const size = attachment.binding.weights.length;
        const times = [];
        const weights = [];
        const kept = [];
        for (let i = 0; i < raw.objs.length; i++) {
          const k = raw.objs[i];
          const kp = ptr(raw.pointer, i);
          const v = k["value"];
          if (!Array.isArray(v)) {
            ctx.issue(ptr(kp, "value"), "expected an array of weights; key ignored");
            continue;
          }
          const nums = numberArray(ctx, v, ptr(kp, "value"));
          if (nums.length !== size) {
            ctx.issue(ptr(kp, "value"), `RANGE_WEIGHTS_SIZE: ${nums.length} weights, the binding has ${size}; key ignored`);
            continue;
          }
          times.push(raw.times[i]);
          weights.push(Float64Array.from(nums));
          kept.push(k);
        }
        if (weights.length === 0) {
          ctx.warn(raw.pointer, "weights timeline without valid keys; timeline ignored");
          return null;
        }
        const curves = [];
        for (let i = 0; i < kept.length; i++) {
          curves.push(i < kept.length - 1 ? normalizeCurve(kept[i]["curve"], 1, true, times[i], times[i + 1], curveWarner(ctx, ptr(raw.pointer, i))) : LINEAR_CURVE);
        }
        return new WeightsTimelineData(slot, skin, attachment, Float64Array.from(times), weights, curves);
      }
      case "body": {
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const values = [];
        for (let i = 0; i < raw.objs.length; i++) {
          const k = raw.objs[i];
          const kp = ptr(raw.pointer, i);
          const v = k["value"];
          const curve = k["curve"];
          if (curve !== void 0 && curve !== "stepped") ctx.warn(ptr(kp, "curve"), 'a body key is stepped only; curve treated as "stepped"');
          const keepSkins = optBoolean(ctx, k, "keepSkins", kp) ?? true;
          if (v === null) {
            values.push({ value: null, uri: null, keepSkins });
            continue;
          }
          if (typeof v !== "string") {
            ctx.issue(ptr(kp, "value"), "expected a body uri or null; timeline ignored");
            return null;
          }
          const problem = validateUri(v);
          if (problem !== null) {
            ctx.issue(ptr(kp, "value"), `invalid uri "${v}": ${problem}; timeline ignored`);
            return null;
          }
          if (raw.times[i] === 0) ctx.warn(ptr(kp, "time"), "BODY_AT_START: this animation belongs to another body; keep it there (spec 9.13)");
          values.push({ value: v, uri: joinUri(b.skeletonsBase ?? "", v), keepSkins });
        }
        return new BodyTimelineData({ times: raw.times, values });
      }
      case "sequence": {
        const tn = needTarget();
        if (tn === null) return null;
        const res = resolveTimelineAttachment(b, t, p, tn);
        if (res === null) return null;
        const { slot, skin, attachment } = res;
        if (!(attachment instanceof RegionAttachment || attachment instanceof MeshAttachment || attachment instanceof LinkedMeshAttachment) || attachment.sequence === null) {
          ctx.issue(ptr(p, "attachment"), "sequence timeline needs an attachment with a sequence; timeline ignored");
          return null;
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const count = attachment.sequence.count;
        const keys = steppedKeys(b, raw, (v, vp) => {
          if (!isObject(v)) return void 0;
          const sv = v;
          let index = Math.trunc(optNumber(ctx, sv, "index", vp) ?? 0);
          if (index < 0 || index >= count) {
            ctx.issue(ptr(vp, "index"), `index ${index} outside 0..${count - 1}; clamped`);
            index = index < 0 ? 0 : count - 1;
          }
          let delay = optNumber(ctx, sv, "delay", vp) ?? 0;
          if (delay < 0) {
            ctx.issue(ptr(vp, "delay"), `delay ${delay} must be >= 0; using 0`);
            delay = 0;
          }
          return { mode: optEnum(ctx, sv, "mode", vp, SEQUENCE_MODES, "hold"), index, delay };
        }, "an object {mode, index, delay}");
        if (keys === null) return null;
        return new SequenceTimelineData(slot, skin, attachment, keys);
      }
      case "event": {
        const raw = readKeys(b, t, p, timeKey, true);
        if (raw === null) return null;
        const events = [];
        const times = [];
        for (let i = 0; i < raw.objs.length; i++) {
          const k = raw.objs[i];
          const kp = ptr(raw.pointer, i);
          const evName = optString(ctx, k, "event", kp);
          if (evName === void 0) {
            ctx.issue(ptr(kp, "event"), 'event key needs "event"; key ignored');
            continue;
          }
          const ev = b.eventMap.get(evName);
          if (ev === void 0) {
            ctx.issue(ptr(kp, "event"), `event "${evName}" does not exist; key ignored`);
            continue;
          }
          events.push({
            time: raw.times[i],
            event: ev,
            int: optNumber(ctx, k, "int", kp) ?? ev.int,
            float: optNumber(ctx, k, "float", kp) ?? ev.float,
            string: optString(ctx, k, "string", kp) ?? ev.string,
            volume: optNumber(ctx, k, "volume", kp) ?? ev.volume,
            balance: optNumber(ctx, k, "balance", kp) ?? ev.balance
          });
          times.push(raw.times[i]);
        }
        if (events.length === 0) {
          ctx.warn(raw.pointer, "event timeline without valid keys; timeline ignored");
          return null;
        }
        return new EventTimelineData(Float64Array.from(times), events);
      }
      case "constraint": {
        const tn = needTarget();
        const pn = needProperty();
        if (tn === null || pn === null) return null;
        const c = b.constraintMap.get(tn);
        if (c === void 0) {
          missingTarget(b, ptr(p, "target"), `constraint "${tn}" does not exist; timeline ignored`);
          return null;
        }
        const kind = constraintPropertyKind(c, pn);
        if (kind === null) {
          ctx.issue(ptr(p, "property"), `property "${pn}" does not belong to a "${c.type}" constraint; timeline ignored`);
          return null;
        }
        if (kind === "reset") {
          const raw2 = readKeys(b, t, p, timeKey, true);
          if (raw2 === null) return null;
          return new ConstraintResetTimelineData(c, raw2.times);
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        if (kind === "number") {
          const keys2 = numericKeys(b, raw, 1);
          if (keys2 === null) return null;
          return new ConstraintNumberTimelineData(c, pn, keys2);
        }
        const keys = steppedKeys(b, raw, readBoolean, "a boolean");
        if (keys === null) return null;
        return new ConstraintBooleanTimelineData(c, pn, keys);
      }
      case "parameter": {
        const tn = needTarget();
        if (tn === null) return null;
        if (property !== void 0 && property !== "value") {
          ctx.warn(ptr(p, "property"), `unknown parameter property "${property}"; timeline ignored`);
          return null;
        }
        const param = b.parameterMap.get(tn);
        if (param === void 0) {
          missingTarget(b, ptr(p, "target"), `parameter "${tn}" does not exist; timeline ignored`);
          return null;
        }
        if (param.source !== null && timeKey === "time") ctx.issue(ptr(p, "target"), `parameter "${tn}" has a source and must not be keyed`);
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const keys = numericKeys(b, raw, 1);
        if (keys === null) return null;
        return new ParameterTimelineData(param, keys);
      }
      case "morph": {
        const tn = needTarget();
        if (tn === null) return null;
        if (property !== void 0 && property !== "weight") {
          ctx.warn(ptr(p, "property"), `unknown morph property "${property}"; timeline ignored`);
          return null;
        }
        const morph = b.morphMap.get(tn);
        if (morph === void 0) {
          missingTarget(b, ptr(p, "target"), `morph "${tn}" does not exist; timeline ignored`);
          return null;
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const keys = numericKeys(b, raw, 1);
        if (keys === null) return null;
        return new MorphTimelineData(morph, keys);
      }
      case "variable": {
        const tn = needTarget();
        if (tn === null) return null;
        if (property !== void 0 && property !== "value") {
          ctx.warn(ptr(p, "property"), `unknown variable property "${property}"; timeline ignored`);
          return null;
        }
        const variable = b.variableMap.get(tn);
        if (variable === void 0) {
          missingTarget(b, ptr(p, "target"), `variable "${tn}" does not exist (or has an unknown type); timeline ignored`);
          return null;
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        if (variable.isNumeric) {
          const keys2 = numericKeys(b, raw, 1);
          if (keys2 === null) return null;
          return new VariableNumberTimelineData(variable, keys2);
        }
        const keys = steppedKeys(b, raw, (v) => variableValueMatches(variable.type, v) ? v : void 0, `a ${variable.type}`);
        if (keys === null) return null;
        return new VariableSteppedTimelineData(variable, keys);
      }
      case "tag": {
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        const keys = steppedKeys(b, raw, (v) => Array.isArray(v) && v.every((s) => typeof s === "string") ? v : void 0, "an array of strings");
        if (keys === null) return null;
        return new TagTimelineData(keys);
      }
      case "nested": {
        const tn = needTarget();
        const pn = needProperty();
        if (tn === null || pn === null) return null;
        const slot = b.slotMap.get(tn);
        if (slot === void 0) {
          missingTarget(b, ptr(p, "target"), `slot "${tn}" does not exist; timeline ignored`);
          return null;
        }
        const raw = readKeys(b, t, p, timeKey, false);
        if (raw === null) return null;
        if (pn === "animation") {
          const keys = steppedKeys(b, raw, readStringOrNull, "an animation name or null");
          if (keys === null) return null;
          return new NestedAnimationTimelineData(slot, keys);
        }
        if (pn === "time" || pn === "timeScale") {
          const keys = numericKeys(b, raw, 1);
          if (keys === null) return null;
          return new NestedNumberTimelineData(slot, pn, keys);
        }
        ctx.warn(ptr(p, "property"), `unknown nested property "${pn}"; timeline ignored`);
        return null;
      }
      case PARTICLE_ATTACHMENT_TYPE: {
        const tn = needTarget();
        const pn = needProperty();
        if (tn === null || pn === null) return null;
        const found = resolveTimelineAttachment(b, t, p, tn);
        if (found === null) return null;
        if (!(found.attachment instanceof ParticleAttachment)) {
          ctx.issue(ptr(p, "attachment"), `attachment "${found.attachment.name}" is not a ${PARTICLE_ATTACHMENT_TYPE}; timeline ignored`);
          return null;
        }
        if (pn === "emitting") {
          const raw = readKeys(b, t, p, timeKey, false);
          if (raw === null) return null;
          const keys = steppedKeys(b, raw, readBoolean, "a boolean");
          if (keys === null) return null;
          return new ParticleEmittingTimelineData(found.slot, found.skin, found.attachment.name, keys);
        }
        if (pn === "rate") {
          const raw = readKeys(b, t, p, timeKey, false);
          if (raw === null) return null;
          const keys = numericKeys(b, raw, 1);
          if (keys === null) return null;
          const values = new Float64Array(keys.values);
          const curves = keys.curves.slice();
          for (let i = 0; i < values.length; i++) {
            const kp = ptr(ptr(ptr(p, "keys"), i), "value");
            if (values[i] < 0) {
              ctx.issue(kp, `RANGE_PARTICLE_RATE: rate ${values[i]} is negative; using 0`);
              values[i] = 0;
            }
            if (curves[i].kind === "bezier") {
              ctx.warn(ptr(ptr(ptr(p, "keys"), i), "curve"), 'RANGE_PARTICLE_RATE_CURVE: a B\xE9zier on rate has no closed integral; using "linear"');
              curves[i] = LINEAR_CURVE;
            }
          }
          return new ParticleRateTimelineData(found.slot, found.skin, found.attachment.name, { times: keys.times, values, components: 1, curves });
        }
        ctx.warn(ptr(p, "property"), `"${pn}" is not animable in BONE_particles; timeline ignored`);
        return null;
      }
      default:
        ctx.warn(ptr(p, "type"), `unknown timeline type "${type}"; timeline ignored`);
        return null;
    }
  }
  var SEQUENCE_MODES = ["hold", "once", "loop", "pingpong", "onceReverse", "loopReverse", "pingpongReverse"];
  function resolveTimelineAttachment(b, t, p, slotName) {
    const ctx = b.ctx;
    const slot = b.slotMap.get(slotName);
    if (slot === void 0) {
      missingTarget(b, ptr(p, "target"), `slot "${slotName}" does not exist; timeline ignored`);
      return null;
    }
    const skinName = optString(ctx, t, "skin", p) ?? "default";
    const skin = b.skinMap.get(skinName);
    if (skin === void 0) {
      missingTarget(b, ptr(p, "skin"), `skin "${skinName}" does not exist; timeline ignored`);
      return null;
    }
    const attName = optString(ctx, t, "attachment", p);
    if (attName === void 0) {
      ctx.issue(ptr(p, "attachment"), "attachment is required; timeline ignored");
      return null;
    }
    const att = skin.getAttachment(slot.index, attName);
    if (att === void 0 || att === null) {
      missingTarget(b, ptr(p, "attachment"), `attachment "${attName}" not found in skin "${skinName}" of slot "${slotName}"; timeline ignored`);
      return null;
    }
    return { slot, skin, attachment: att };
  }
  function constraintPropertyKind(c, property) {
    if (property === "mix") return "number";
    switch (c.type) {
      case "ik":
        if (property === "softness") return "number";
        if (["bendPositive", "compress", "stretch", "uniform"].includes(property)) return "boolean";
        return null;
      case "transform":
        return ["mixRotation", "mixX", "mixY", "mixScaleX", "mixScaleY", "mixShearY"].includes(property) ? "number" : null;
      case "path":
        return ["mixRotation", "mixX", "mixY", "position", "spacing"].includes(property) ? "number" : null;
      case "physics":
        if (property === "reset") return "reset";
        return ["inertia", "strength", "damping", "mass", "wind", "gravity"].includes(property) ? "number" : null;
      default:
        return null;
    }
  }
  function readDrawOrderEntries(b, entries) {
    const out = [];
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (!isObject(e)) continue;
      const slot = typeof e["slot"] === "string" ? b.slotMap.get(e["slot"]) : void 0;
      const offset = typeof e["offset"] === "number" ? Math.trunc(e["offset"]) : 0;
      if (slot === void 0) continue;
      out.push({ slot, offset });
    }
    return out;
  }
  function computeDrawOrder(b, entries, p) {
    const ctx = b.ctx;
    const n = b.slots.length;
    const order = new Int32Array(n).fill(-1);
    const cited = new Uint8Array(n);
    for (let i = 0; i < entries.length; i++) {
      const ep = ptr(p, i);
      const e = expectObject(ctx, entries[i], ep);
      const slotName = reqString(ctx, e, "slot", ep);
      const offset = reqNumber(ctx, e, "offset", ep);
      const slot = b.slotMap.get(slotName);
      if (slot === void 0) {
        ctx.issue(ptr(ep, "slot"), `slot "${slotName}" does not exist; entry ignored`);
        continue;
      }
      let target = slot.index + Math.trunc(offset);
      if (target < 0 || target >= n) {
        ctx.issue(ptr(ep, "offset"), `index ${target} outside 0..${n - 1}; clamped`);
        target = Math.min(Math.max(target, 0), n - 1);
      }
      const previous = order[target];
      if (previous !== -1) {
        ctx.issue(ptr(ep, "offset"), `slot "${slotName}" collides with "${b.slots[previous].name}" at index ${target}; the last entry wins`);
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
  var ATLAS_FORMATS = ["rgba8", "rgb8", "rgba4", "rgb565", "alpha8"];
  var ATLAS_MIN_FILTERS = ["nearest", "linear", "mipmap"];
  var ATLAS_MAG_FILTERS = ["nearest", "linear"];
  var ATLAS_WRAPS = ["clamp", "repeat", "mirror"];
  function loadAtlas(json, options = {}) {
    const ctx = new Context({ strict: options.strict });
    const root = expectObject(ctx, json, "");
    const headerObj = expectObject(ctx, root["atlas"], "/atlas");
    const version = reqString(ctx, headerObj, "version", "/atlas");
    const v = parseVersion(version);
    if (v === null) return ctx.fail("/atlas/version", `invalid version "${version}"`);
    if (v.major > READER_VERSION.major) ctx.issue("/atlas/version", `atlas version ${version} newer than reader; best effort`);
    const scale = optNumber(ctx, root, "scale", "") ?? 1;
    if (scale <= 0) ctx.fail("/scale", "scale must be > 0");
    const pageDefs = expectArray(ctx, root["pages"], "/pages");
    if (pageDefs.length === 0) ctx.fail("/pages", "at least one page is required");
    const pages = [];
    const pageNames = /* @__PURE__ */ new Set();
    for (let i = 0; i < pageDefs.length; i++) {
      const p = ptr("/pages", i);
      const o = expectObject(ctx, pageDefs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (pageNames.has(name)) ctx.issue(ptr(p, "name"), `duplicate page name "${name}"`);
      pageNames.add(name);
      const image = reqString(ctx, o, "image", p);
      ctx.uri(ptr(p, "image"), image, { allowData: true });
      pages.push(new AtlasPageData(i, name, image, reqNumber(ctx, o, "width", p), reqNumber(ctx, o, "height", p), {
        format: optEnum(ctx, o, "format", p, ATLAS_FORMATS, "rgba8"),
        minFilter: optEnum(ctx, o, "minFilter", p, ATLAS_MIN_FILTERS, "linear"),
        magFilter: optEnum(ctx, o, "magFilter", p, ATLAS_MAG_FILTERS, "linear"),
        wrapU: optEnum(ctx, o, "wrapU", p, ATLAS_WRAPS, "clamp"),
        wrapV: optEnum(ctx, o, "wrapV", p, ATLAS_WRAPS, "clamp"),
        premultiplied: optBoolean(ctx, o, "premultiplied", p)
      }));
    }
    const regionDefs = expectArray(ctx, root["regions"], "/regions");
    const regions = [];
    const regionNames = /* @__PURE__ */ new Set();
    for (let i = 0; i < regionDefs.length; i++) {
      const p = ptr("/regions", i);
      const o = expectObject(ctx, regionDefs[i], p);
      const name = reqString(ctx, o, "name", p);
      if (regionNames.has(name)) ctx.issue(ptr(p, "name"), `duplicate region name "${name}"`);
      regionNames.add(name);
      const pageIndex = reqNumber(ctx, o, "page", p);
      const page = pages[pageIndex];
      if (page === void 0) {
        ctx.issue(ptr(p, "page"), `page index ${pageIndex} out of range; region ignored`);
        continue;
      }
      const x = reqNumber(ctx, o, "x", p);
      const y = reqNumber(ctx, o, "y", p);
      const width = reqNumber(ctx, o, "width", p);
      const height = reqNumber(ctx, o, "height", p);
      let rotation = optNumber(ctx, o, "rotation", p) ?? 0;
      if (rotation !== 0 && rotation !== 90) {
        ctx.issue(ptr(p, "rotation"), `rotation must be 0 or 90 (got ${rotation}); using 0`);
        rotation = 0;
      }
      const offsetX = optNumber(ctx, o, "offsetX", p) ?? 0;
      const offsetY = optNumber(ctx, o, "offsetY", p) ?? 0;
      const originalWidth = optNumber(ctx, o, "originalWidth", p) ?? width;
      const originalHeight = optNumber(ctx, o, "originalHeight", p) ?? height;
      const onPageW = rotation === 90 ? height : width;
      const onPageH = rotation === 90 ? width : height;
      if (x + onPageW > page.width) ctx.issue(p, `region "${name}" exceeds the page width`);
      if (y + onPageH > page.height) ctx.issue(p, `region "${name}" exceeds the page height`);
      if (originalWidth < offsetX + width) ctx.issue(ptr(p, "originalWidth"), `originalWidth must be >= offsetX + width for "${name}"`);
      if (originalHeight < offsetY + height) ctx.issue(ptr(p, "originalHeight"), `originalHeight must be >= offsetY + height for "${name}"`);
      const aliases = optStringArray(ctx, o, "aliases", p) ?? [];
      for (let j = 0; j < aliases.length; j++) {
        if (regionNames.has(aliases[j])) ctx.issue(ptr(p, "aliases", j), `alias "${aliases[j]}" collides with a region name`);
        regionNames.add(aliases[j]);
      }
      const pivotX = optNumber(ctx, o, "pivotX", p);
      const pivotY = optNumber(ctx, o, "pivotY", p);
      regions.push(new AtlasRegionData(regions.length, name, page, scale, {
        aliases,
        x,
        y,
        width,
        height,
        rotation,
        offsetX,
        offsetY,
        originalWidth,
        originalHeight,
        pivotX,
        pivotY
      }));
    }
    return new AtlasData(scale, pages, regions, ctx.warnings);
  }
  function computeRegionUV(region, u0, v0, out, offset = 0) {
    return region.computeUV(u0, v0, out, offset);
  }
  function loadRig(ctx, root) {
    const o = optObject(ctx, root, "rig", "");
    if (o === void 0) return null;
    let reference = null;
    const ref = optObject(ctx, o, "reference", "/rig");
    if (ref !== void 0) {
      const bone = reqString(ctx, ref, "bone", "/rig/reference");
      const length = reqNumber(ctx, ref, "length", "/rig/reference");
      if (!(length > 0)) ctx.issue("/rig/reference/length", `RIG_REFERENCE: length must be > 0 (got ${length}); reference ignored`);
      else reference = { bone, length };
    }
    return {
      name: optString(ctx, o, "name", "/rig") ?? null,
      bones: optStringArray(ctx, o, "bones", "/rig") ?? [],
      slots: optStringArray(ctx, o, "slots", "/rig") ?? [],
      reference
    };
  }
  function loadCrop(ctx, o, p) {
    const c = optObject(ctx, o, "crop", p);
    if (c === void 0) return null;
    const cp = ptr(p, "crop");
    const width = optNumber(ctx, c, "width", cp) ?? 0;
    const height = optNumber(ctx, c, "height", cp) ?? 0;
    if (width < 0 || height < 0) ctx.issue(cp, `RANGE_CROP: width and height must be >= 0 (got ${width} x ${height})`);
    return { x: optNumber(ctx, c, "x", cp) ?? 0, y: optNumber(ctx, c, "y", cp) ?? 0, width: Math.max(0, width), height: Math.max(0, height) };
  }
  function loadKeyTransform(ctx, k, kp) {
    const t = optObject(ctx, k, "transform", kp);
    if (t === void 0) return null;
    const tp = ptr(kp, "transform");
    return composeMatrix(
      optNumber(ctx, t, "x", tp) ?? 0,
      optNumber(ctx, t, "y", tp) ?? 0,
      optNumber(ctx, t, "rotation", tp) ?? 0,
      optNumber(ctx, t, "scaleX", tp) ?? 1,
      optNumber(ctx, t, "scaleY", tp) ?? 1
    );
  }
  function selfIntersection(vertices) {
    const n = vertices.length >> 1;
    if (n < 4) return null;
    const x = (i) => vertices[i % n * 2];
    const y = (i) => vertices[i % n * 2 + 1];
    const cross = (ax, ay, bx, by, cx, cy) => (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        if (j === i + 1 || i === 0 && j === n - 1) continue;
        const d1 = cross(x(i), y(i), x(i + 1), y(i + 1), x(j), y(j));
        const d2 = cross(x(i), y(i), x(i + 1), y(i + 1), x(j + 1), y(j + 1));
        const d3 = cross(x(j), y(j), x(j + 1), y(j + 1), x(i), y(i));
        const d4 = cross(x(j), y(j), x(j + 1), y(j + 1), x(i + 1), y(i + 1));
        if ((d1 > 0 && d2 < 0 || d1 < 0 && d2 > 0) && (d3 > 0 && d4 < 0 || d3 < 0 && d4 > 0)) return [i, j];
      }
    }
    return null;
  }

  // runtime/src/draw-order.ts
  function orderFromOffsets(base, entries) {
    const n = base.length;
    const out = new Array(n).fill(-1);
    const position = new Int32Array(n);
    for (let i = 0; i < n; i++) position[base[i]] = i;
    const cited = new Uint8Array(n);
    for (let i = 0; i < entries.length; i++) {
      const e = entries[i];
      if (e.slot < 0 || e.slot >= n) continue;
      let target = position[e.slot] + Math.trunc(e.offset);
      if (target < 0) target = 0;
      else if (target >= n) target = n - 1;
      const previous = out[target];
      if (previous !== -1) cited[previous] = 0;
      out[target] = e.slot;
      cited[e.slot] = 1;
    }
    let j = 0;
    for (let i = 0; i < n; i++) {
      if (out[i] !== -1) continue;
      while (j < n && cited[base[j]] === 1) j++;
      out[i] = base[j];
      j++;
    }
    return out;
  }

  // runtime/src/constraints/constraint.ts
  function finishWorldWrite(bone) {
    bone.updateAppliedTransform();
    bone.dirty = false;
    const children = bone.children;
    for (let i = 0; i < children.length; i++) children[i].dirty = true;
  }
  var registry = /* @__PURE__ */ new Map();
  function registerConstraint(type, factory) {
    registry.set(type, factory);
  }
  function getConstraintFactory(type) {
    return registry.get(type) ?? null;
  }
  function createConstraint(data, skeleton) {
    const factory = registry.get(data.type);
    return factory === void 0 ? null : factory(data, skeleton);
  }
  var NoopConstraint = class {
    constructor(data) {
      __publicField(this, "data");
      __publicField(this, "active", true);
      __publicField(this, "mix");
      this.data = data;
      this.mix = data.mix;
    }
    update(_skeleton, _now) {
    }
    reset() {
    }
    setToSetupPose() {
      this.mix = this.data.mix;
    }
  };
  var noopFactory = (data) => new NoopConstraint(data);
  registerConstraint("ik", noopFactory);
  registerConstraint("transform", noopFactory);
  registerConstraint("path", noopFactory);
  registerConstraint("physics", noopFactory);
  registerConstraint("driver", noopFactory);

  // runtime/src/skeleton.ts
  var Bone = class {
    constructor(data, skeleton, parent) {
      __publicField(this, "data");
      __publicField(this, "skeleton");
      /** Current parent. A `parent` key (spec 9.4) can change it; `null` = root. */
      __publicField(this, "parent");
      /** The parent written in the file (spec 5.1). */
      __publicField(this, "setupParent");
      __publicField(this, "children", []);
      // Local pose (spec 5.2): written by setup pose and animations only.
      __publicField(this, "x", 0);
      __publicField(this, "y", 0);
      __publicField(this, "rotation", 0);
      __publicField(this, "scaleX", 1);
      __publicField(this, "scaleY", 1);
      __publicField(this, "shearX", 0);
      __publicField(this, "shearY", 0);
      __publicField(this, "inheritRotation", true);
      __publicField(this, "inheritScale", true);
      __publicField(this, "inheritReflection", true);
      // Applied pose (spec 5.2): copy of the local pose, then constraints.
      __publicField(this, "ax", 0);
      __publicField(this, "ay", 0);
      __publicField(this, "arotation", 0);
      __publicField(this, "ascaleX", 1);
      __publicField(this, "ascaleY", 1);
      __publicField(this, "ashearX", 0);
      __publicField(this, "ashearY", 0);
      __publicField(this, "ainheritRotation", true);
      __publicField(this, "ainheritScale", true);
      __publicField(this, "ainheritReflection", true);
      // World matrix (spec 3.2), always computed from the applied pose.
      __publicField(this, "a", 1);
      __publicField(this, "b", 0);
      __publicField(this, "c", 0);
      __publicField(this, "d", 1);
      __publicField(this, "worldX", 0);
      __publicField(this, "worldY", 0);
      /** `true` when the world matrix must be recomputed before being read (spec 5.6). */
      __publicField(this, "dirty", true);
      this.data = data;
      this.skeleton = skeleton;
      this.parent = parent;
      this.setupParent = parent;
      if (parent !== null) parent.children.push(this);
      this.setToSetupPose();
    }
    /**
     * Re-parents the bone (spec 9.4 `parent` timeline). Refuses a cycle — the
     * new parent being this bone or one of its descendants — and returns
     * `false`; the caller warns once (L2 `PARENT_CYCLE`). Nothing is converted:
     * from now on the local values are measured from the new parent, as in
     * Spriter. The skeleton recomputes its update order (spec 5.6).
     */
    setParent(parent) {
      if (parent === this.parent) return true;
      for (let p = parent; p !== null; p = p.parent) if (p === this) return false;
      const old = this.parent;
      if (old !== null) {
        const i = old.children.indexOf(this);
        if (i >= 0) old.children.splice(i, 1);
      }
      this.parent = parent;
      if (parent !== null) parent.children.push(this);
      this.dirty = true;
      this.skeleton.orderDirty = true;
      return true;
    }
    /** Restores the local pose from the file (spec 5.1), the parent included. */
    setToSetupPose() {
      if (this.parent !== this.setupParent) this.setParent(this.setupParent);
      const d = this.data;
      this.x = d.x;
      this.y = d.y;
      this.rotation = d.rotation;
      this.scaleX = d.scaleX;
      this.scaleY = d.scaleY;
      this.shearX = d.shearX;
      this.shearY = d.shearY;
      this.inheritRotation = d.inheritRotation;
      this.inheritScale = d.inheritScale;
      this.inheritReflection = d.inheritReflection;
      this.dirty = true;
    }
    /** `applied = local` (spec 5.6 step 1). */
    updateAppliedFromLocal() {
      this.ax = this.x;
      this.ay = this.y;
      this.arotation = this.rotation;
      this.ascaleX = this.scaleX;
      this.ascaleY = this.scaleY;
      this.ashearX = this.shearX;
      this.ashearY = this.shearY;
      this.ainheritRotation = this.inheritRotation;
      this.ainheritScale = this.inheritScale;
      this.ainheritReflection = this.inheritReflection;
      this.dirty = true;
    }
    /** Inheritance mode from the **applied** booleans (spec 5.3). */
    get inherit() {
      return inheritMode(this.ainheritRotation, this.ainheritScale, this.ainheritReflection);
    }
    /**
     * Applied pose -> world matrix (spec 5.4, normative port of Spine 4.2
     * `Bone.updateWorldTransform`). Marks the children dirty.
     */
    updateWorldTransform() {
      const skeleton = this.skeleton;
      const nestedParent = skeleton.parentMatrix;
      const sx = nestedParent === null ? skeleton.scaleX : 1;
      const sy = nestedParent === null ? skeleton.scaleY : 1;
      const rotation = this.arotation;
      const scaleX = this.ascaleX;
      const scaleY = this.ascaleY;
      const shearX = this.ashearX;
      const shearY = this.ashearY;
      const rotY = rotation + 90 + shearY;
      let la = cosDeg(rotation + shearX) * scaleX;
      let lb = cosDeg(rotY) * scaleY;
      let lc = sinDeg(rotation + shearX) * scaleX;
      let ld = sinDeg(rotY) * scaleY;
      const parent = this.parent ?? nestedParent;
      if (parent === null) {
        this.worldX = this.ax * sx + skeleton.x;
        this.worldY = this.ay * sy + skeleton.y;
        this.a = la * sx;
        this.b = lb * sx;
        this.c = lc * sy;
        this.d = ld * sy;
        this.finishWorld();
        return;
      }
      let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
      this.worldX = pa * this.ax + pb * this.ay + parent.worldX;
      this.worldY = pc * this.ax + pd * this.ay + parent.worldY;
      const mode = this.parent === null ? "normal" : this.inherit;
      const flip = pa * pd - pb * pc < 0 !== (sx < 0 !== sy < 0);
      switch (mode) {
        case "normal":
        case "noReflection": {
          if (mode === "noReflection" && flip) {
            pb = -pb;
            pd = -pd;
          }
          this.a = pa * la + pb * lc;
          this.b = pa * lb + pb * ld;
          this.c = pc * la + pd * lc;
          this.d = pc * lb + pd * ld;
          this.finishWorld();
          return;
        }
        case "onlyTranslation":
        case "onlyReflection": {
          if (mode === "onlyReflection" && flip) {
            lb = -lb;
            ld = -ld;
          }
          this.a = la;
          this.b = lb;
          this.c = lc;
          this.d = ld;
          break;
        }
        case "noRotationOrReflection":
        case "noRotation": {
          let s = pa * pa + pc * pc;
          let prx;
          if (s > EPSILON_DET) {
            s = Math.abs(pa * pd - pb * pc) / s;
            if (mode === "noRotation" && flip) s = -s;
            pa /= sx;
            pc /= sy;
            pb = pc * s;
            pd = pa * s;
            prx = atan2Deg(pc, pa);
          } else {
            pa = 0;
            pc = 0;
            prx = 90 - atan2Deg(pd, pb);
          }
          const rx = rotation + shearX - prx;
          const ry = rotation + shearY - prx + 90;
          la = cosDeg(rx) * scaleX;
          lb = cosDeg(ry) * scaleY;
          lc = sinDeg(rx) * scaleX;
          ld = sinDeg(ry) * scaleY;
          this.a = pa * la - pb * lc;
          this.b = pa * lb - pb * ld;
          this.c = pc * la + pd * lc;
          this.d = pc * lb + pd * ld;
          break;
        }
        case "noScale":
        case "noScaleOrReflection": {
          const cos = cosDeg(rotation);
          const sin = sinDeg(rotation);
          let za = (pa * cos + pb * sin) / sx;
          let zc = (pc * cos + pd * sin) / sy;
          let s = Math.sqrt(za * za + zc * zc);
          if (s > EPSILON_SCALE) s = 1 / s;
          za *= s;
          zc *= s;
          s = Math.sqrt(za * za + zc * zc);
          if (mode === "noScale" && pa * pd - pb * pc < 0 !== (sx < 0 !== sy < 0)) s = -s;
          const r = atan2(zc, za) + PI / 2;
          const zb = Math.cos(r) * s;
          const zd = Math.sin(r) * s;
          la = cosDeg(shearX) * scaleX;
          lb = cosDeg(90 + shearY) * scaleY;
          lc = sinDeg(shearX) * scaleX;
          ld = sinDeg(90 + shearY) * scaleY;
          this.a = za * la + zb * lc;
          this.b = za * lb + zb * ld;
          this.c = zc * la + zd * lc;
          this.d = zc * lb + zd * ld;
          break;
        }
      }
      this.a *= sx;
      this.b *= sx;
      this.c *= sy;
      this.d *= sy;
      this.finishWorld();
    }
    /**
     * Recomputes this bone and every descendant, in skeleton array order
     * (parents first). For constraints that write a bone and then read one of
     * its descendants inside the same `update` (spec 5.6 dirty rule).
     */
    updateWorldTransformWithChildren() {
      this.updateWorldTransform();
      const bones = this.skeleton.bones;
      for (let i = this.data.index + 1; i < bones.length; i++) {
        const b = bones[i];
        if (b.isDescendantOf(this)) b.updateWorldTransform();
      }
    }
    /** `true` when `ancestor` is a (transitive) parent of this bone. */
    isDescendantOf(ancestor) {
      for (let p = this.parent; p !== null; p = p.parent) if (p === ancestor) return true;
      return false;
    }
    /** Sanitizes the matrix, clears the dirty flag and dirties the children. */
    finishWorld() {
      this.a = sanitize(this.a);
      this.b = sanitize(this.b);
      this.c = sanitize(this.c);
      this.d = sanitize(this.d);
      this.worldX = sanitize(this.worldX);
      this.worldY = sanitize(this.worldY);
      this.dirty = false;
      const children = this.children;
      for (let i = 0; i < children.length; i++) children[i].dirty = true;
    }
    /**
     * World matrix -> applied pose (spec 5.5 `appliedFromWorld`, port of Spine
     * 4.2 `updateAppliedTransform`), with the determinant guards of spec 5.5.
     */
    updateAppliedTransform() {
      const skeleton = this.skeleton;
      const sx = skeleton.scaleX;
      const sy = skeleton.scaleY;
      const parent = this.parent;
      if (parent === null) {
        this.ax = sanitize((this.worldX - skeleton.x) / sx);
        this.ay = sanitize((this.worldY - skeleton.y) / sy);
        this.arotation = sanitize(atan2Deg(this.c, this.a));
        this.ascaleX = sanitize(Math.sqrt(this.a * this.a + this.c * this.c));
        this.ascaleY = sanitize(Math.sqrt(this.b * this.b + this.d * this.d));
        this.ashearX = 0;
        this.ashearY = sanitize(atan2Deg(this.a * this.b + this.c * this.d, this.a * this.d - this.b * this.c));
        return;
      }
      let pa = parent.a, pb = parent.b, pc = parent.c, pd = parent.d;
      let pid = safeInverse(pa * pd - pb * pc);
      let ia = pd * pid, ib = pb * pid, ic = pc * pid, id = pa * pid;
      const dx = this.worldX - parent.worldX;
      const dy = this.worldY - parent.worldY;
      this.ax = sanitize(dx * ia - dy * ib);
      this.ay = sanitize(dy * id - dx * ic);
      let ra, rb, rc, rd;
      const mode = this.inherit;
      const flip = pa * pd - pb * pc < 0 !== (sx < 0 !== sy < 0);
      if (mode === "onlyTranslation" || mode === "onlyReflection") {
        ra = this.a;
        rb = this.b;
        rc = this.c;
        rd = this.d;
        if (mode === "onlyReflection" && flip) {
          rb = -rb;
          rd = -rd;
        }
      } else {
        if (mode === "noReflection") {
          if (flip) {
            pb = -pb;
            pd = -pd;
            pid = safeInverse(pa * pd - pb * pc);
            ia = pd * pid;
            ib = pb * pid;
            ic = pc * pid;
            id = pa * pid;
          }
        } else if (mode === "noRotationOrReflection" || mode === "noRotation") {
          const den = pa * pa + pc * pc;
          let s = den > EPSILON_DET ? Math.abs(pa * pd - pb * pc) / den : 0;
          if (mode === "noRotation" && flip) s = -s;
          const sa = pa / sx;
          const sc = pc / sy;
          pb = -sc * s * sx;
          pd = sa * s * sy;
          pid = safeInverse(pa * pd - pb * pc);
          ia = pd * pid;
          ib = pb * pid;
        } else if (mode === "noScale" || mode === "noScaleOrReflection") {
          const cos = cosDeg(this.arotation);
          const sin = sinDeg(this.arotation);
          pa = (pa * cos + pb * sin) / sx;
          pc = (pc * cos + pd * sin) / sy;
          let s = Math.sqrt(pa * pa + pc * pc);
          if (s > EPSILON_SCALE) s = 1 / s;
          pa *= s;
          pc *= s;
          s = Math.sqrt(pa * pa + pc * pc);
          if (mode === "noScale" && pid < 0 !== (sx < 0 !== sy < 0)) s = -s;
          const r = PI / 2 + atan2(pc, pa);
          pb = Math.cos(r) * s;
          pd = Math.sin(r) * s;
          pid = safeInverse(pa * pd - pb * pc);
          ia = pd * pid;
          ib = pb * pid;
          ic = pc * pid;
          id = pa * pid;
        }
        ra = ia * this.a - ib * this.c;
        rb = ia * this.b - ib * this.d;
        rc = id * this.c - ic * this.a;
        rd = id * this.d - ic * this.b;
      }
      this.ashearX = 0;
      this.ascaleX = Math.sqrt(ra * ra + rc * rc);
      if (this.ascaleX > EPSILON_DET) {
        const det = ra * rd - rb * rc;
        this.ascaleY = sanitize(det / this.ascaleX);
        this.ashearY = sanitize(-atan2Deg(ra * rb + rc * rd, det));
        this.arotation = sanitize(atan2Deg(rc, ra));
      } else {
        this.ascaleX = 0;
        this.ascaleY = sanitize(Math.sqrt(rb * rb + rd * rd));
        this.ashearY = 0;
        this.arotation = sanitize(90 - atan2Deg(rd, rb));
      }
      this.ascaleX = sanitize(this.ascaleX);
    }
    /** Local point -> world (spec 5.5 `localToWorld`). */
    localToWorld(lx, ly, out = { x: 0, y: 0 }) {
      out.x = this.a * lx + this.b * ly + this.worldX;
      out.y = this.c * lx + this.d * ly + this.worldY;
      return out;
    }
    /** World point -> local (spec 5.5 `worldToLocal`); `(0, 0)` when `|det| <= 0.0001`. */
    worldToLocal(wx, wy, out = { x: 0, y: 0 }) {
      const det = this.a * this.d - this.b * this.c;
      if (Math.abs(det) <= EPSILON_DET) {
        out.x = 0;
        out.y = 0;
        return out;
      }
      const x = wx - this.worldX;
      const y = wy - this.worldY;
      out.x = (x * this.d - y * this.b) / det;
      out.y = (y * this.a - x * this.c) / det;
      return out;
    }
    /**
     * World rotation (degrees) that a value of the bone `rotation` property
     * would produce (Spine 4.2 `localToWorldRotation`).
     */
    localToWorldRotation(localRotation) {
      const r = localRotation - (this.arotation - this.ashearX);
      const cos = cosDeg(r);
      const sin = sinDeg(r);
      return atan2Deg(cos * this.c + sin * this.d, cos * this.a + sin * this.b);
    }
    /** Value of the bone `rotation` property that yields `worldRotation` (Spine 4.2 `worldToLocalRotation`). */
    worldToLocalRotation(worldRotation) {
      const cos = cosDeg(worldRotation);
      const sin = sinDeg(worldRotation);
      return atan2Deg(this.a * sin - this.c * cos, this.d * cos - this.b * sin) + this.arotation - this.ashearX;
    }
    /** Rotation of the world X axis in degrees (spec 3.2). */
    get worldRotationX() {
      return atan2Deg(this.c, this.a);
    }
    get worldRotationY() {
      return atan2Deg(this.d, this.b);
    }
    get worldScaleX() {
      return Math.sqrt(this.a * this.a + this.c * this.c);
    }
    get worldScaleY() {
      return Math.sqrt(this.b * this.b + this.d * this.d);
    }
  };
  function safeInverse(det) {
    return Math.abs(det) <= EPSILON_DET ? 0 : 1 / det;
  }
  var nestedFactory = () => null;
  function registerNestedFactory(factory) {
    nestedFactory = factory;
  }
  var Slot = class {
    constructor(data, skeleton, bone) {
      __publicField(this, "data");
      __publicField(this, "skeleton");
      /**
       * The APPLIED bone (spec 9.5): the bone of the file, or the one a
       * `slot/bone` key hangs the slot from. `setToSetupPose` restores the file's.
       * The slot never enters the bone tree: this only says whose matrix the
       * attachment reads.
       */
      __publicField(this, "bone");
      /** The bone written in the file (spec 5.1). */
      __publicField(this, "setupBone");
      /**
       * `T(x, y) R(rotation) S(scaleX, scaleY)` of the active `slot/bone` key, or
       * `null` = identity (spec 9.5). Multiplied between the bone and the
       * attachment of `region`, unweighted mesh, `point`, box and `skeleton`.
       */
      __publicField(this, "boneTransform", null);
      /** Scratch for `boneMatrix` when `boneTransform` is set. */
      __publicField(this, "boneMatrixScratch", identityMatrix());
      /**
       * Weights of this frame (spec 9.6 `weights`), in `binding.weights` order, for
       * `weightsAttachment`. `null` = the weights of the file.
       */
      __publicField(this, "weights", null);
      /** Attachment (its `timelineAttachment`) the weights belong to. */
      __publicField(this, "weightsAttachment", null);
      /** Placeholder currently requested (setup or animation). `null` = empty. */
      __publicField(this, "attachmentName", null);
      /** Attachment resolved through the active skins. `null` = nothing drawn. */
      __publicField(this, "attachment", null);
      /** `[r, g, b, a]` tint, straight alpha. */
      __publicField(this, "color", new Float64Array(4));
      /** `[r, g, b]` tint black, or `null` = off. */
      __publicField(this, "darkColor", null);
      __publicField(this, "visible", true);
      /** Current deform (layout of spec 7.4) for `deformAttachment`, or `null`. */
      __publicField(this, "deform", null);
      /** Attachment (its `timelineAttachment`) the deform belongs to. */
      __publicField(this, "deformAttachment", null);
      /** Current sequence frame; `-1` = show `sequence.setup`. */
      __publicField(this, "sequenceIndex", -1);
      /**
       * Scratch buffer for `VertexAttachment.computeDelta` (deform + morph sum),
       * reused between frames so no array is allocated per attachment per frame.
       */
      __publicField(this, "deltaScratch", null);
      // Nested skeleton control (spec 9.9 `nested`), written by timelines. `null`
      // / `NaN` = not driven: the child uses its `skeleton` attachment defaults.
      /** Animation name requested for the child skeleton (`null` = its setup pose). */
      __publicField(this, "nestedAnimation", null);
      /** `true` when a `nested/animation` timeline has written `nestedAnimation`. */
      __publicField(this, "nestedAnimationSet", false);
      /** Child time driven by a `nested/time` timeline (`NaN` = free-running clock). */
      __publicField(this, "nestedTime", Number.NaN);
      /** Multiplier of the child clock (`NaN` = the attachment `timeScale`). */
      __publicField(this, "nestedTimeScale", Number.NaN);
      /**
       * Parent animation time the entity shown here became active (Appendix C
       * rule 1): the start of the run of `slot/attachment` keys with the value in
       * force, or 0 without such a timeline. Written by `applyAnimation`.
       */
      __publicField(this, "nestedOrigin", 0);
      /** Start of the run of `nested/animation` keys with the value in force (spec 9.9). */
      __publicField(this, "nestedAnimationOrigin", 0);
      /**
       * Live child instance for the current `skeleton` attachment, created on
       * demand by `nested.ts`. Survives `setToSetupPose` (rebuilding it every
       * frame would throw the child's physics away), and is dropped when the
       * attachment changes.
       */
      __publicField(this, "nested", null);
      this.data = data;
      this.skeleton = skeleton;
      this.bone = bone;
      this.setupBone = bone;
      this.setToSetupPose();
    }
    /**
     * World matrix the attachment of this slot is measured from (spec 9.5):
     * the applied bone, times the `transform` of the active `slot/bone` key.
     * Weighted vertices do not use it: they are measured from their own bones.
     * Read it after the world transform is up to date; it is not stored.
     */
    get boneMatrix() {
      const t = this.boneTransform;
      return t === null ? this.bone : multiplyMatrix(this.bone, t, this.boneMatrixScratch);
    }
    /**
     * Hangs the slot from `bone` with the key `transform` (spec 9.5). `null` =
     * the bone of the file, and the transform is dropped with it.
     */
    setBone(bone, transform) {
      if (bone === null) {
        this.bone = this.setupBone;
        this.boneTransform = null;
        return;
      }
      this.bone = bone;
      this.boneTransform = transform;
    }
    /** Restores bone, color, dark color, visibility, deform, weights, sequence and the setup attachment (spec 5.1). */
    setToSetupPose() {
      const d = this.data;
      this.bone = this.setupBone;
      this.boneTransform = null;
      this.weights = null;
      this.weightsAttachment = null;
      this.color.set(d.color);
      this.darkColor = d.darkColor === null ? null : Float64Array.from(d.darkColor);
      this.visible = d.visible;
      this.deform = null;
      this.deformAttachment = null;
      this.sequenceIndex = -1;
      this.nestedAnimation = null;
      this.nestedAnimationSet = false;
      this.nestedTime = Number.NaN;
      this.nestedTimeScale = Number.NaN;
      this.nestedOrigin = 0;
      this.nestedAnimationOrigin = 0;
      this.setAttachmentName(d.attachmentName);
    }
    /** Blend mode (setup value; not animatable). */
    get blend() {
      return this.data.blend;
    }
    /** Requests a placeholder; the attachment is resolved through the active skins. */
    setAttachmentName(name) {
      this.attachmentName = name;
      this.setAttachment(name === null ? null : this.skeleton.getAttachment(this.data.index, name));
    }
    /** Sets the attachment object directly. Resets deform and sequence state when it changes. */
    setAttachment(attachment) {
      if (this.attachment === attachment) return;
      const oldTimeline = this.attachment instanceof VertexAttachment ? this.attachment.timelineAttachment : null;
      const newTimeline = attachment instanceof VertexAttachment ? attachment.timelineAttachment : null;
      if (oldTimeline !== newTimeline) {
        this.deform = null;
        this.deformAttachment = null;
        this.weights = null;
        this.weightsAttachment = null;
      }
      this.attachment = attachment;
      this.sequenceIndex = -1;
    }
    /**
     * Live child of a `skeleton` attachment (spec 7.11), built on first use.
     * `null` when the attachment is not a nested skeleton, when its `uri` did
     * not resolve, or when the chain would loop or go past depth 8.
     */
    nestedSkeleton() {
      if (this.attachment === null || this.attachment.type !== "skeleton") return null;
      if (this.nested !== null && this.nested.attachment !== this.attachment && this.nested.rebind(this.attachment)) {
        return this.nested;
      }
      if (this.nested === null || this.nested.attachment !== this.attachment) this.nested = nestedFactory(this);
      return this.nested;
    }
    /** Re-resolves `attachmentName` after a skin change. */
    refreshAttachment() {
      const name = this.attachmentName;
      this.setAttachment(name === null ? null : this.skeleton.getAttachment(this.data.index, name));
    }
  };
  var Skeleton = class {
    /**
     * `nestedOwner` is the slot this instance hangs from when it is a child of
     * spec 7.11. It is set before anything else so the child, while building
     * ITS own children, already knows the chain that leads to it (cycle and
     * depth detection).
     */
    constructor(data, nestedOwner = null) {
      __publicField(this, "data");
      __publicField(this, "bones");
      /**
       * Bones in calculation order (spec 5.6): parents before children. Equal to
       * `bones` until a `parent` key (spec 9.4) moves a bone; rebuilt on demand.
       */
      __publicField(this, "updateOrder");
      /** `true` when a re-parent happened since `updateOrder` was built. */
      __publicField(this, "orderDirty", false);
      /** Once-per-skeleton runtime notices (L2, spec 12.3), in Portuguese. */
      __publicField(this, "warnings", []);
      __publicField(this, "slots");
      /** Current draw order (spec 9.5). Setup: `baseDrawOrder`. */
      __publicField(this, "drawOrder");
      /**
       * Base draw order (spec 4.4): the `slots` array order with the `drawOrder`
       * of the active skins applied on top. What `[]` in a `drawOrder` timeline
       * returns to, and what its offsets are measured from. Rebuilt by `setSkin`.
       */
      __publicField(this, "baseDrawOrder");
      /** Constraint instances in file order (unknown types skipped). */
      __publicField(this, "constraints");
      /** Skeleton position and scale given by the game (spec 5.4 `skX, skY, sx, sy`). */
      __publicField(this, "x", 0);
      __publicField(this, "y", 0);
      __publicField(this, "scaleX", 1);
      __publicField(this, "scaleY", 1);
      /**
       * Matrix the root bones hang from when this skeleton is nested in a slot
       * (spec 7.11): `M_slotBone x T(x, y) R(rotation) S(scaleX, scaleY)`. While
       * it is set, `x`, `y`, `scaleX` and `scaleY` are ignored, as spec 7.11 asks.
       * `null` = a top-level skeleton.
       */
      __publicField(this, "parentMatrix", null);
      /** Slot this skeleton is nested in, or `null` at the top level (spec 7.11). */
      __publicField(this, "nestedOwner");
      /** Things the nested machinery wants the user to know, in Portuguese. */
      __publicField(this, "nestedWarnings", []);
      /** Current parameter values, by parameter index (spec 8.1). */
      __publicField(this, "parameters");
      /** Current morph weights, by morph index (spec 8.3). */
      __publicField(this, "morphWeights");
      /** Current variable values, by variable index (spec 8.4). */
      __publicField(this, "variables");
      /** Tags active at the moment (spec 8.5). */
      __publicField(this, "tags", []);
      /**
       * The animation `Pose` is applying to this skeleton, and its time: "the one
       * the parent is playing" of spec 7.11 (`inheritAnimation`). Written by
       * `applyAnimation` (by `AnimationState` for track 0), cleared by
       * `setToSetupPose`.
       */
      __publicField(this, "playingAnimation", null);
      /** Time inside `playingAnimation`, loop already applied. */
      __publicField(this, "playingTime", 0);
      /** Whether `playingAnimation` loops (Appendix C rule 4). Set by the caller that knows. */
      __publicField(this, "playingLoop", false);
      /**
       * Skeleton time in seconds (spec 5.6 / 6.5 `now`): monotonic, written by
       * `updateWorldTransform(now)` or `advance(dt)`. Physics reads it.
       */
      __publicField(this, "time", 0);
      /**
       * The skin STACK (spec 4.4), bottom to top: where two skins give the same
       * placeholder, the one on top wins. `default` is a skin like the others and
       * is active only while it is in here. A new skeleton starts with
       * `[default]`, so a file with no skin choice opens as it always did.
       */
      __publicField(this, "skinStack", []);
      /** Bones activated by the active skins (union). */
      __publicField(this, "activeSkinBones", /* @__PURE__ */ new Set());
      /** Constraints activated by the active skins (union). */
      __publicField(this, "activeSkinConstraints", /* @__PURE__ */ new Set());
      /** Per slot: placeholder -> attachment (`null` = hidden), combined across skins. */
      __publicField(this, "attachmentLookup");
      /** `ConstraintData` -> runtime instance (types without a factory are absent). */
      __publicField(this, "constraintByData", /* @__PURE__ */ new Map());
      this.data = data;
      this.nestedOwner = nestedOwner;
      if (nestedOwner !== null) this.parentMatrix = identityMatrix();
      this.bones = new Array(data.bones.length);
      for (let i = 0; i < data.bones.length; i++) {
        const bd = data.bones[i];
        const parent = bd.parent === null ? null : this.bones[bd.parent.index];
        this.bones[i] = new Bone(bd, this, parent);
      }
      this.updateOrder = this.bones.slice();
      this.orderDirty = false;
      this.parameters = new Float64Array(data.parameters.length);
      this.morphWeights = new Float64Array(data.morphs.length);
      this.variables = data.variables.map((v) => v.default);
      this.attachmentLookup = data.slots.map(() => /* @__PURE__ */ new Map());
      this.skinStack.push(data.defaultSkin);
      this.rebuildSkinLookup();
      this.slots = data.slots.map((sd) => new Slot(sd, this, this.bones[sd.bone.index]));
      this.baseDrawOrder = this.slots.slice();
      this.rebuildBaseDrawOrder();
      this.drawOrder = this.baseDrawOrder.slice();
      this.constraints = [];
      for (const cd of data.constraints) {
        const c = createConstraint(cd, this);
        if (c !== null) {
          this.constraints.push(c);
          this.constraintByData.set(cd, c);
        }
      }
      this.setToSetupPose();
      this.updateWorldTransform(0);
      this.physicsReset();
    }
    // -- setup pose ------------------------------------------------------------
    /** Everything back to the file values (spec 5.1). */
    setToSetupPose() {
      this.setBonesToSetupPose();
      this.setSlotsToSetupPose();
      for (const c of this.constraints) c.setToSetupPose();
      const params = this.data.parameters;
      for (let i = 0; i < params.length; i++) this.parameters[i] = params[i].default;
      const morphs = this.data.morphs;
      for (let i = 0; i < morphs.length; i++) this.morphWeights[i] = morphs[i].weight;
      const vars = this.data.variables;
      for (let i = 0; i < vars.length; i++) this.variables[i] = vars[i].default;
      this.tags = [];
      this.playingAnimation = null;
      this.playingTime = 0;
      this.playingLoop = false;
    }
    setBonesToSetupPose() {
      for (const b of this.bones) b.setToSetupPose();
    }
    /** Slots back to setup, including the draw order. */
    setSlotsToSetupPose() {
      for (const s of this.slots) s.setToSetupPose();
      this.drawOrder = this.baseDrawOrder.slice();
    }
    // -- world transform (spec 5.6) ----------------------------------------------
    /**
     * Reference `updatePose(skeleton, now)` (spec 5.6): applied = local,
     * constraints in file order (each reading up-to-date bones), final world
     * pass. `now` is the skeleton time in seconds (spec 6.5), stored in `time`;
     * omitted = pose only, the clock does not move. Use `advance(dt)` when only
     * a delta is known.
     */
    updateWorldTransform(now = this.time) {
      this.time = now;
      if (this.orderDirty) this.rebuildUpdateOrder();
      const bones = this.updateOrder;
      for (let i = 0; i < bones.length; i++) bones[i].updateAppliedFromLocal();
      this.updateDirtyBones();
      const constraints = this.constraints;
      for (let i = 0; i < constraints.length; i++) {
        const c = constraints[i];
        const d = c.data;
        if (d.skinRequired && !this.activeSkinConstraints.has(d)) continue;
        if (!c.active || c.mix === 0) continue;
        this.updateDirtyBones();
        c.update(this, now);
      }
      this.updateDirtyBones();
      this.updateNested(now);
    }
    /**
     * Poses every nested child (spec 7.11), after the bones of this skeleton are
     * final: the child hangs from the world matrix of its slot bone. Recursive
     * through the child's own `updateWorldTransform`; the depth is bounded when
     * the instances are created.
     */
    updateNested(now) {
      const slots = this.slots;
      for (let i = 0; i < slots.length; i++) {
        const slot = slots[i];
        const att = slot.attachment;
        if (slot.nested !== null && slot.nested.attachment !== att && (att === null || !slot.nested.rebind(att))) {
          const uri = slot.nested.attachment.uri ?? slot.nested.attachment.name;
          this.nestedRoot.warnNested(`NESTED_GONE: a entidade "${uri}" deixou de ser mostrada no slot "${slot.data.name}" (7.11)`);
          slot.nested = null;
        }
        if (att === null || att.type !== "skeleton" || !slot.visible) continue;
        const nested = slot.nestedSkeleton();
        if (nested !== null) nested.update(slot, now);
      }
    }
    /** The top-level skeleton of the nesting chain this one belongs to. */
    get nestedRoot() {
      let root = this;
      while (root.nestedOwner !== null) root = root.nestedOwner.skeleton;
      return root;
    }
    /** Records a nested notice once, in `nestedWarnings`. */
    warnNested(message) {
      if (!this.nestedWarnings.includes(message)) this.nestedWarnings.push(message);
    }
    /** Depth of this instance in the nesting chain: `0` at the top (spec 7.11). */
    get nestedDepth() {
      let depth = 0;
      for (let owner = this.nestedOwner; owner !== null; owner = owner.skeleton.nestedOwner) depth++;
      return depth;
    }
    /** `updateWorldTransform(time + dt)`: moves the clock by `dt` seconds (`dt < 0` is treated as 0). */
    advance(dt) {
      this.updateWorldTransform(this.time + (dt > 0 ? dt : 0));
    }
    /**
     * Recomputes every dirty bone in array order (parents first). Constraints
     * call this before reading bones they did not write themselves.
     */
    updateDirtyBones() {
      if (this.orderDirty) this.rebuildUpdateOrder();
      const bones = this.updateOrder;
      for (let i = 0; i < bones.length; i++) {
        const b = bones[i];
        if (b.dirty) b.updateWorldTransform();
      }
    }
    /**
     * Spec 5.6: parents before children, in file order among siblings, walked
     * from the roots through the CURRENT `children` lists. Called when a
     * `parent` key changed the tree (spec 9.4), and kept until it changes again.
     */
    rebuildUpdateOrder() {
      const out = [];
      const visit = (b) => {
        out.push(b);
        const children = b.children;
        for (let i = 0; i < children.length; i++) visit(children[i]);
      };
      const bones = this.bones;
      for (let i = 0; i < bones.length; i++) if (bones[i].parent === null) visit(bones[i]);
      if (out.length !== bones.length) {
        for (let i = 0; i < bones.length; i++) if (!out.includes(bones[i])) out.push(bones[i]);
      }
      this.updateOrder = out;
      this.orderDirty = false;
    }
    /** Records a runtime notice once (spec 12.2, item 9: avisar uma vez). */
    warnOnce(message) {
      if (!this.warnings.includes(message)) this.warnings.push(message);
    }
    /** Resets the state of every constraint (spec 6.5 `physicsReset`). */
    physicsReset() {
      for (const c of this.constraints) c.reset();
    }
    // -- skins (spec 4.4, 7.1) ---------------------------------------------------
    /**
     * Skins of the stack above `default`, bottom to top: the view the editor
     * has always read. `default` is left out wherever it sits.
     */
    get activeSkins() {
      return this.skinStack.filter((skin) => skin !== this.data.defaultSkin);
    }
    /**
     * Replaces the skin STACK, bottom to top (spec 4.4): exactly the list, and
     * nothing else. `default` is active only if it is listed; an empty list
     * shows no skin at all. The skin on top wins. Accepts names or `SkinData`;
     * an unknown name throws. Slots keep the placeholder they requested and
     * re-resolve it. The skeleton is not rebuilt.
     */
    setSkinStack(skins) {
      const stack = [];
      for (const s of skins) {
        const skin = typeof s === "string" ? this.data.findSkin(s) : s;
        if (skin === null) throw new Error(`skin not found: "${String(s)}"`);
        stack.push(skin);
      }
      this.skinStack.length = 0;
      this.skinStack.push(...stack);
      this.refreshSkins();
    }
    /**
     * COMPATIBILIDADE COM O EDITOR ATÉ O D9 (a pilha na tela). `default` at the
     * bottom, then the given skins, bottom to top (`null` / empty = only
     * `default`). This is NOT the stack of spec 4.4: the editor still counts on
     * `default` being underneath. The pure stack, the one the conformance suite
     * uses, is `setSkinStack`. Remove this when the editor moves to the stack.
     */
    setSkin(skins) {
      const list = skins === null ? [] : Array.isArray(skins) ? skins.slice() : [skins];
      const stack = [this.data.defaultSkin];
      for (const s of list) {
        const skin = typeof s === "string" ? this.data.findSkin(s) : s;
        if (skin === null) throw new Error(`skin not found: "${String(s)}"`);
        if (skin !== this.data.defaultSkin) stack.push(skin);
      }
      this.setSkinStack(stack);
    }
    /** Re-resolves every slot and the base draw order after the stack changed. */
    refreshSkins() {
      this.rebuildSkinLookup();
      for (const slot of this.slots) slot.refreshAttachment();
      this.rebuildBaseDrawOrder();
      this.drawOrder = this.baseDrawOrder.slice();
    }
    /**
     * The resolution list of spec 4.4: for each skin of the stack, bottom to
     * top, its includes expanded in order, then the skin itself.
     */
    skinResolutionList() {
      const out = [];
      for (const s of this.skinStack) s.expand(out);
      return out;
    }
    /**
     * Spec 4.4 base order: the array order, then the `drawOrder` of every skin
     * in the resolution list, each applied with the 9.5 algorithm over the
     * order the previous ones left.
     */
    rebuildBaseDrawOrder() {
      let order = this.slots.map((_, i) => i);
      const skins = this.skinResolutionList();
      for (const skin of skins) {
        if (skin.drawOrder.length === 0) continue;
        order = orderFromOffsets(order, skin.drawOrder.map((e) => ({ slot: e.slot.index, offset: e.offset })));
      }
      this.baseDrawOrder = order.map((i) => this.slots[i]);
    }
    /** Adds one skin on top of the stack (mix and match). */
    addSkin(skin) {
      this.setSkinStack([...this.skinStack, skin]);
    }
    rebuildSkinLookup() {
      const lookup = this.attachmentLookup;
      for (const m of lookup) m.clear();
      this.activeSkinBones.clear();
      this.activeSkinConstraints.clear();
      const order = this.skinResolutionList();
      for (const skin of order) {
        for (const [slotIndex, map] of skin.attachments) {
          const target = lookup[slotIndex];
          if (target === void 0) continue;
          for (const [name, att] of map) target.set(name, att);
        }
        for (const b of skin.bones) this.activeSkinBones.add(b);
        for (const c of skin.constraints) this.activeSkinConstraints.add(c);
      }
    }
    /**
     * Attachment for `(slot, placeholder)` through the skin stack. `null` when
     * hidden or undefined (spec 4.4, 7.1).
     */
    getAttachment(slot, name) {
      const index = typeof slot === "number" ? slot : this.data.findSlot(slot)?.index ?? -1;
      if (index < 0 || index >= this.attachmentLookup.length) return null;
      return this.attachmentLookup[index].get(name) ?? null;
    }
    /** Requests a placeholder for a slot by name (`null` = empty). */
    setAttachment(slotName, attachmentName) {
      const slot = this.findSlot(slotName);
      if (slot === null) throw new Error(`slot not found: "${slotName}"`);
      slot.setAttachmentName(attachmentName);
    }
    // -- lookups -----------------------------------------------------------------
    findBone(name) {
      const d = this.data.findBone(name);
      return d === null ? null : this.bones[d.index];
    }
    findSlot(name) {
      const d = this.data.findSlot(name);
      return d === null ? null : this.slots[d.index];
    }
    findConstraint(name) {
      for (const c of this.constraints) if (c.data.name === name) return c;
      return null;
    }
    /** Runtime instance of `data`, or `null` when its type has no factory. */
    constraintFor(data) {
      return this.constraintByData.get(data) ?? null;
    }
    /** Writes a parameter value through `ParameterData.constrain` (spec 8.1). Returns `false` when the name is unknown. */
    setParameter(name, value) {
      const p = this.data.findParameter(name);
      if (p === null) return false;
      this.parameters[p.index] = p.constrain(value);
      return true;
    }
    get root() {
      return this.bones[0];
    }
    // -- bounds --------------------------------------------------------------------
    /**
     * Axis-aligned bounds of the visible `region`, `mesh`, `linkedmesh` and
     * `boundingbox` attachments in world space. All zeros when nothing is visible.
     */
    getBounds(out = { x: 0, y: 0, width: 0, height: 0 }) {
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      let scratch = new Float64Array(8);
      for (const slot of this.drawOrder) {
        const att = slot.attachment;
        if (att === null || !slot.visible) continue;
        let count = 0;
        if (att instanceof RegionAttachment) {
          att.computeWorldVertices(slot, scratch, 0, 2);
          count = 8;
        } else if (att instanceof MeshAttachment || att instanceof LinkedMeshAttachment || att instanceof BoundingBoxAttachment) {
          count = att.vertexCount * 2;
          if (scratch.length < count) scratch = new Float64Array(count);
          att.computeWorldVertices(slot, scratch, 0, 2);
        } else if (att.type === "skeleton" && slot.nested !== null) {
          const box = slot.nested.skeleton.getBounds();
          if (box.width !== 0 || box.height !== 0) {
            if (box.x < minX) minX = box.x;
            if (box.x + box.width > maxX) maxX = box.x + box.width;
            if (box.y < minY) minY = box.y;
            if (box.y + box.height > maxY) maxY = box.y + box.height;
          }
          continue;
        } else {
          continue;
        }
        for (let i = 0; i < count; i += 2) {
          const x = scratch[i];
          const y = scratch[i + 1];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      if (minX === Infinity) {
        out.x = 0;
        out.y = 0;
        out.width = 0;
        out.height = 0;
      } else {
        out.x = minX;
        out.y = minY;
        out.width = maxX - minX;
        out.height = maxY - minY;
      }
      return out;
    }
  };

  // runtime/src/sequence-frame.ts
  function computeSequenceFrame(mode, index, delay, t0, t, count) {
    const n = count;
    if (n <= 0) return 0;
    if (mode === "hold" || delay === 0) return clampFrame(index, n);
    const k = Math.floor((t - t0) / delay + 1e-5);
    switch (mode) {
      case "once":
        return Math.min(index + k, n - 1);
      case "loop":
        return mod(index + k, n);
      case "pingpong": {
        const p = 2 * n - 2;
        if (p === 0) return 0;
        let frame = mod(index + k, p);
        if (frame >= n) frame = p - frame;
        return frame;
      }
      case "onceReverse":
        return Math.max(n - 1 - (index + k), 0);
      case "loopReverse":
        return n - 1 - mod(index + k, n);
      case "pingpongReverse": {
        const p = 2 * n - 2;
        if (p === 0) return 0;
        let frame = mod(index + k + n - 1, p);
        if (frame >= n) frame = p - frame;
        return frame;
      }
      default:
        return clampFrame(index, n);
    }
  }
  function sequenceFrameAt(timeline, t) {
    const times = timeline.times;
    if (times.length === 0 || t < times[0]) return -1;
    let lo = 0;
    let hi = times.length - 1;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (times[mid] <= t) lo = mid;
      else hi = mid - 1;
    }
    const key = timeline.keys.values[lo];
    const sequence = timeline.attachment.sequence;
    const count = sequence === null ? 0 : sequence.count;
    return computeSequenceFrame(key.mode, key.index, key.delay, times[lo], t, count);
  }
  function mod(a, n) {
    const r = a % n;
    return r < 0 ? r + n : r;
  }
  function clampFrame(index, n) {
    return index < 0 ? 0 : index >= n ? n - 1 : index;
  }

  // runtime/src/animation.ts
  function findKeyIndex(times, t) {
    let lo = 0;
    let hi = times.length - 1;
    if (hi < 0 || t < times[0]) return -1;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (times[mid] <= t) lo = mid;
      else hi = mid - 1;
    }
    return lo;
  }
  function evaluateComponent(keys, t, j) {
    const times = keys.times;
    const n = times.length;
    const c = keys.components;
    const values = keys.values;
    if (n === 0) return 0;
    if (t <= times[0]) return values[j];
    if (t >= times[n - 1]) return values[(n - 1) * c + j];
    const i = findKeyIndex(times, t);
    const v0 = values[i * c + j];
    const v1 = values[(i + 1) * c + j];
    return sampleCurve(keys.curves[i], j, times[i], times[i + 1], v0, v1, t);
  }
  function evaluateNumber(keys, t) {
    return evaluateComponent(keys, t, 0);
  }
  function evaluateComponents(keys, t, out) {
    for (let j = 0; j < keys.components; j++) out[j] = evaluateComponent(keys, t, j);
    return out;
  }
  function evaluateStepped(keys, t) {
    const i = findKeyIndex(keys.times, t);
    return keys.values[i < 0 ? 0 : i];
  }
  function evaluateDarkColor(tl, t, out) {
    const times = tl.times;
    const n = times.length;
    if (n === 0) return null;
    let i;
    if (t <= times[0]) i = 0;
    else if (t >= times[n - 1]) i = n - 1;
    else i = findKeyIndex(times, t);
    const v0 = tl.values[i];
    if (v0 === null) return null;
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
    for (let j = 0; j < 3; j++) out[j] = sampleCurve(curve, j, times[i], times[i + 1], v0[j], v1[j], t);
    return out;
  }
  function evaluateDeform(tl, t, out) {
    const times = tl.times;
    const n = times.length;
    if (n === 0) return null;
    const length = tl.attachment.deformLength;
    let i;
    if (t <= times[0]) i = 0;
    else if (t >= times[n - 1]) i = n - 1;
    else i = findKeyIndex(times, t);
    const k = tl.vertices[i];
    if (i === n - 1 || t <= times[0] || t >= times[n - 1]) {
      if (k.length === 0) return null;
      copyPadded(k, out, length);
      return out;
    }
    const next = tl.vertices[i + 1];
    if (k.length === 0 && next.length === 0) return null;
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
    for (let j = 0; j < n; j++) out[j] = src[j];
    for (let j = n; j < length; j++) out[j] = 0;
  }
  var scratch3 = new Float64Array(3);
  function applyAnimation(skeleton, animation, t) {
    const timelines = animation.timelines;
    let tagsWritten = false;
    skeleton.playingAnimation = animation.name;
    skeleton.playingTime = t;
    for (let i = 0; i < timelines.length; i++) {
      const tl = timelines[i];
      switch (tl.kind) {
        case "bone.number":
          skeleton.bones[tl.bone.index][tl.property] = evaluateNumber(tl.keys, t);
          break;
        case "bone.inherit":
          skeleton.bones[tl.bone.index][tl.property] = evaluateStepped(tl.keys, t);
          break;
        case "bone.parent":
          applyParentKey(skeleton, skeleton.bones[tl.bone.index], evaluateStepped(tl.keys, t));
          break;
        case "slot.attachment": {
          const slot = skeleton.slots[tl.slot.index];
          slot.setAttachmentName(evaluateStepped(tl.keys, t));
          slot.nestedOrigin = entityRunStart(skeleton, tl.slot.index, tl.keys, t);
          break;
        }
        case "slot.color": {
          const slot = skeleton.slots[tl.slot.index];
          evaluateComponents(tl.keys, t, slot.color);
          break;
        }
        case "slot.darkColor": {
          const slot = skeleton.slots[tl.slot.index];
          const v = evaluateDarkColor(tl, t, scratch3);
          if (v === null) slot.darkColor = null;
          else if (slot.darkColor === null) slot.darkColor = Float64Array.from(v);
          else slot.darkColor.set(v);
          break;
        }
        case "slot.visible":
          skeleton.slots[tl.slot.index].visible = evaluateStepped(tl.keys, t);
          break;
        case "slot.bone":
          applySlotBoneKey(skeleton, skeleton.slots[tl.slot.index], evaluateStepped(tl.keys, t));
          break;
        case "drawOrder": {
          const i2 = findKeyIndex(tl.times, t);
          applyDrawOrder(skeleton, tl.entries[i2 < 0 ? 0 : i2]);
          break;
        }
        case "constraint.number": {
          const c = skeleton.constraintFor(tl.constraint);
          if (c !== null) c[tl.property] = evaluateNumber(tl.keys, t);
          break;
        }
        case "constraint.boolean": {
          const c = skeleton.constraintFor(tl.constraint);
          if (c !== null) c[tl.property] = evaluateStepped(tl.keys, t);
          break;
        }
        case "parameter":
          skeleton.parameters[tl.parameter.index] = tl.parameter.constrain(evaluateNumber(tl.keys, t));
          break;
        case "morph": {
          const m = tl.morph;
          skeleton.morphWeights[m.index] = clamp(evaluateNumber(tl.keys, t), m.min, m.max);
          break;
        }
        case "variable.number": {
          const v = evaluateNumber(tl.keys, t);
          skeleton.variables[tl.variable.index] = tl.variable.type === "int" ? Math.trunc(v) : v;
          break;
        }
        case "variable.stepped":
          skeleton.variables[tl.variable.index] = evaluateStepped(tl.keys, t);
          break;
        case "tag":
          skeleton.tags = activeTagsOf(animation, tl.keys, t);
          tagsWritten = true;
          break;
        case "nested.animation": {
          const slot = skeleton.slots[tl.slot.index];
          slot.nestedAnimation = evaluateStepped(tl.keys, t);
          slot.nestedAnimationSet = true;
          slot.nestedAnimationOrigin = runStart(tl.keys, t);
          break;
        }
        case "nested.number": {
          const slot = skeleton.slots[tl.slot.index];
          const v = evaluateNumber(tl.keys, t);
          if (tl.property === "time") slot.nestedTime = v;
          else slot.nestedTimeScale = v;
          break;
        }
        case "event":
        case "constraint.reset":
        case "body":
        case "deform":
        case "weights":
        case "sequence":
          break;
      }
    }
    if (!tagsWritten && animation.tags.length > 0) skeleton.tags = animation.tags;
    for (let i = 0; i < timelines.length; i++) {
      const tl = timelines[i];
      if (tl.kind === "deform") applyDeform(skeleton.slots[tl.slot.index], tl, t);
      else if (tl.kind === "weights") applyWeights(skeleton.slots[tl.slot.index], tl, t);
      else if (tl.kind === "sequence") {
        const slot = skeleton.slots[tl.slot.index];
        if (slot.attachment === tl.attachment) slot.sequenceIndex = sequenceFrameAt(tl, t);
      }
    }
  }
  function applyDeform(slot, tl, t) {
    const current = slot.attachment;
    if (!(current instanceof VertexAttachment) || current.timelineAttachment !== tl.attachment.timelineAttachment) return;
    const length = tl.attachment.deformLength;
    let buffer = slot.deform;
    if (buffer === null || buffer.length !== length || slot.deformAttachment !== tl.attachment.timelineAttachment) {
      buffer = new Float64Array(length);
    }
    const v = evaluateDeform(tl, t, buffer);
    if (v === null) {
      slot.deform = null;
      slot.deformAttachment = null;
    } else {
      slot.deform = v;
      slot.deformAttachment = tl.attachment.timelineAttachment;
    }
  }
  function runStart(keys, t) {
    const i = findKeyIndex(keys.times, t);
    if (i < 0) return 0;
    const value = keys.values[i];
    let j = i;
    while (j > 0 && keys.values[j - 1] === value) j--;
    return keys.times[j];
  }
  function entityRunStart(skeleton, slotIndex, keys, t) {
    const i = findKeyIndex(keys.times, t);
    if (i < 0) return 0;
    const value = keys.values[i];
    const uriOf = (name) => {
      if (name === null) return null;
      const att = skeleton.getAttachment(slotIndex, name);
      return att instanceof SkeletonAttachment ? att.resolvedUri : null;
    };
    const uri = uriOf(value);
    let j = i;
    while (j > 0) {
      const before = keys.values[j - 1];
      if (before !== value && (uri === null || uriOf(before) !== uri)) break;
      j--;
    }
    return keys.times[j];
  }
  function applySlotBoneKey(skeleton, slot, key) {
    slot.setBone(key.bone === null ? null : skeleton.bones[key.bone.index], key.transform);
  }
  function evaluateWeights(tl, t, out) {
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
    for (let j = 0; j < out.length; j++) out[j] = k[j] + (next[j] - k[j]) * s;
    return out;
  }
  function applyWeights(slot, tl, t) {
    const current = slot.attachment;
    const target = tl.attachment.timelineAttachment;
    if (!(current instanceof VertexAttachment) || current.timelineAttachment !== target) return;
    const length = tl.weights[0].length;
    let buffer = slot.weights;
    if (buffer === null || buffer.length !== length || slot.weightsAttachment !== target) buffer = new Float64Array(length);
    slot.weights = evaluateWeights(tl, t, buffer);
    slot.weightsAttachment = target;
  }
  function applyParentKey(skeleton, bone, target) {
    const parent = target === null ? bone.setupParent : skeleton.bones[target.index];
    if (!bone.setParent(parent)) {
      skeleton.warnOnce(`PARENT_CYCLE: "${bone.data.name}" n\xE3o pode virar filho de "${parent === null ? "" : parent.data.name}" (9.4); chave ignorada`);
    }
  }
  function applyDrawOrder(skeleton, entries) {
    const base = skeleton.baseDrawOrder;
    const out = skeleton.drawOrder;
    out.length = base.length;
    if (entries === null) {
      for (let i = 0; i < base.length; i++) out[i] = base[i];
      return;
    }
    const order = orderFromOffsets(base.map((s) => s.data.index), entries.map((e) => ({ slot: e.slot.index, offset: e.offset })));
    const slots = skeleton.slots;
    for (let i = 0; i < order.length; i++) out[i] = slots[order[i]];
  }
  function pose(skeleton, animation, t, now = skeleton.time) {
    skeleton.setToSetupPose();
    applyAnimation(skeleton, animation, t);
    skeleton.updateWorldTransform(now);
  }
  function activeTags(animation, t) {
    for (const tl of animation.timelines) if (tl.kind === "tag") return activeTagsOf(animation, tl.keys, t);
    return animation.tags;
  }
  function activeTagsOf(animation, keys, t) {
    const i = findKeyIndex(keys.times, t);
    if (i < 0) return animation.tags;
    const fromKey = keys.values[i];
    if (animation.tags.length === 0) return fromKey;
    const out = animation.tags.slice();
    for (const tag of fromKey) if (!out.includes(tag)) out.push(tag);
    return out;
  }
  function crossings(times, prev, now, loop, duration, deliver) {
    const hits = [];
    for (let i = 0; i < times.length; i++) {
      const kt = times[i];
      if (!loop || duration === 0) {
        if (prev < kt && kt <= now) hits.push({ index: i, time: kt });
        continue;
      }
      let n = prev === -Infinity ? 0 : Math.max(0, Math.ceil((prev - kt) / duration));
      while (kt + n * duration <= prev) n++;
      for (; kt + n * duration <= now; n++) hits.push({ index: i, time: kt + n * duration });
    }
    hits.sort((a, b) => a.time - b.time || a.index - b.index);
    for (const h of hits) deliver(h.index, h.time);
  }
  function fireEvents(animation, prev, now, loop, out = []) {
    for (const tl of animation.timelines) {
      if (tl.kind !== "event") continue;
      crossings(tl.times, prev, now, loop, animation.duration, (index, time) => out.push({ key: tl.events[index], time }));
    }
    return out;
  }
  function applyResets(skeleton, animation, prev, now, loop) {
    let count = 0;
    for (const tl of animation.timelines) {
      if (tl.kind !== "constraint.reset") continue;
      const c = skeleton.constraintFor(tl.constraint);
      crossings(tl.times, prev, now, loop, animation.duration, () => {
        count++;
        if (c !== null) c.reset();
      });
    }
    return count;
  }
  function isPoseTimeline(tl) {
    return tl.kind !== "event" && tl.kind !== "constraint.reset" && tl.kind !== "body" && tl.kind !== "particle.emitting" && tl.kind !== "particle.rate";
  }

  // runtime/src/color.ts
  function createFinalColor() {
    return { light: new Float64Array(4), dark: new Float64Array(3), tintBlack: false };
  }
  function unit(v) {
    return v < 0 ? 0 : v > 1 ? 1 : v;
  }
  function computeFinalColor(slot, attachment, out = createFinalColor()) {
    const sc = slot.color;
    const ac = attachment.color;
    for (let i = 0; i < 4; i++) out.light[i] = unit(sc[i]) * unit(ac[i]);
    const dark = slot.darkColor;
    out.tintBlack = dark !== null;
    for (let i = 0; i < 3; i++) out.dark[i] = dark === null ? 0 : unit(dark[i]);
    return out;
  }
  function shadeTexel(tex, color, premultiplied, out = new Float64Array(4)) {
    const l = color.light;
    const d = color.dark;
    const a = tex[3];
    if (!premultiplied) {
      for (let i = 0; i < 3; i++) out[i] = tex[i] * l[i] + (1 - tex[i]) * d[i];
    } else {
      for (let i = 0; i < 3; i++) out[i] = tex[i] * l[i] * l[3] + (a - tex[i]) * d[i] * l[3];
    }
    out[3] = a * l[3];
    return out;
  }
  var STRAIGHT = {
    normal: { src: "SRC_ALPHA", dst: "ONE_MINUS_SRC_ALPHA" },
    additive: { src: "SRC_ALPHA", dst: "ONE" },
    multiply: { src: "DST_COLOR", dst: "ONE_MINUS_SRC_ALPHA" },
    screen: { src: "ONE", dst: "ONE_MINUS_SRC_COLOR" }
  };
  var PREMULTIPLIED = {
    normal: { src: "ONE", dst: "ONE_MINUS_SRC_ALPHA" },
    additive: { src: "ONE", dst: "ONE" },
    multiply: { src: "DST_COLOR", dst: "ONE_MINUS_SRC_ALPHA" },
    screen: { src: "ONE", dst: "ONE_MINUS_SRC_COLOR" }
  };
  function blendFactors(mode, premultiplied) {
    return (premultiplied ? PREMULTIPLIED : STRAIGHT)[mode] ?? STRAIGHT.normal;
  }

  // runtime/src/nested.ts
  var MAX_NESTED_DEPTH = 8;
  var NestedSkeleton = class {
    constructor(slot, attachment, data) {
      /** The attachment in force. `rebind` swaps it for another one of the same `uri`. */
      __publicField(this, "attachment");
      __publicField(this, "skeleton");
      /** Animation playing on top in the child, or `null` = none (spec 7.11). */
      __publicField(this, "animation", null);
      /** Name asked for, whether or not it exists in the child. */
      __publicField(this, "animationName", null);
      /** Child clock of the animation on top, in seconds, before its loop. */
      __publicField(this, "time", 0);
      /** Whether the animation on top loops: the attachment's `loop`, or the parent's for `inheritAnimation` (rules 3, 4). */
      __publicField(this, "topLoop", true);
      /** The `baseAnimation` of the attachment, or `null` (spec 7.11). */
      __publicField(this, "baseAnimation");
      /** Background clock in seconds (spec 7.11 `tBase`), before the loop. */
      __publicField(this, "baseTime", 0);
      /** Multiplier from the parent clock to the child clock used this frame (1 when `nested/time` drives it). */
      __publicField(this, "clockScale", 1);
      /**
       * The clocks of the previous `update`, for the `(previous, now]` window of
       * the child's `reset` keys (spec 9.8, 8.6). The child's animation counts in
       * full (7.11), so its physics resets fire like the parent's (case C-326).
       * `-Infinity` = a new run: keys at 0 fire on the first frame.
       */
      __publicField(this, "resetTop", { animation: null, time: -Infinity });
      __publicField(this, "resetBase", { animation: null, time: -Infinity });
      __publicField(this, "parentLight", createFinalColor());
      this.attachment = attachment;
      this.skeleton = new Skeleton(data, slot);
      this.applySkins(slot);
      this.setAnimation(attachment.animation);
      const base = attachment.baseAnimation;
      this.baseAnimation = base === null ? null : data.findAnimation(base);
      if (base !== null && this.baseAnimation === null) {
        warnNested(slot, `O esqueleto "${attachment.uri}" n\xE3o tem a anima\xE7\xE3o de fundo "${base}" (7.11).`);
      }
    }
    /**
     * Takes over the state of the instance that lived in a slot of the same name
     * and the same `uri` in the body the animation left (spec 7.11, 9.13). The
     * clocks are derived, so this only carries what the previous frame chose;
     * the next `update` recomputes the same numbers from `t`.
     */
    continueFrom(other) {
      this.setAnimation(other.animationName);
      this.time = other.time;
      this.baseTime = other.baseTime;
      this.topLoop = other.topLoop;
      this.clockScale = other.clockScale;
      this.resetTop = { ...other.resetTop };
      this.resetBase = { ...other.resetBase };
    }
    /**
     * The slot moved to another `skeleton` attachment (spec 7.11). Same resolved
     * `uri` and same loaded file: this instance goes on — its skeleton, its
     * physics, its clocks — reading the fields of the new attachment from now on.
     * Anything else: `false`, and the caller lets the instance go.
     */
    rebind(attachment) {
      if (!(attachment instanceof SkeletonAttachment)) return false;
      const old = this.attachment;
      if (attachment.resolvedUri !== old.resolvedUri || attachment.child !== old.child) return false;
      this.attachment = attachment;
      const slot = this.skeleton.nestedOwner;
      const sameSkins = attachment.skins.length === old.skins.length && attachment.skins.every((s, i) => s === old.skins[i]);
      if (!sameSkins && slot !== null) this.applySkins(slot);
      const base = attachment.baseAnimation;
      this.baseAnimation = base === null ? null : this.skeleton.data.findAnimation(base);
      return true;
    }
    /** Skins asked for by the attachment; a name the child does not have is a warning. */
    applySkins(slot) {
      const wanted = this.attachment.skins;
      if (wanted.length === 0) return;
      const found = [];
      for (const name of wanted) {
        const skin = this.skeleton.data.findSkin(name);
        if (skin === null) {
          warnNested(slot, `O esqueleto "${this.attachment.uri}" n\xE3o tem a pele "${name}".`);
          continue;
        }
        found.push(skin);
      }
      if (found.length > 0) this.skeleton.setSkin(found);
    }
    /** Names the animation on top (spec 9.9); `null` = none. The clock is not stored here. */
    setAnimation(name) {
      if (name === this.animationName && (name === null || this.animation !== null)) return;
      this.animationName = name;
      this.animation = name === null ? null : this.skeleton.data.findAnimation(name);
    }
    /**
     * Places and poses the child for the parent clock `now` (spec 7.11, 9.9,
     * Appendix C rules 1 to 5). Called by `Skeleton.updateNested` once the
     * parent's bones are final.
     */
    update(slot, now) {
      const att = this.attachment;
      const parent = slot.skeleton;
      const parentTime = parent.playingAnimation !== null ? parent.playingTime : now;
      const scale = Number.isFinite(slot.nestedTimeScale) ? slot.nestedTimeScale : att.timeScale;
      const attached = slot.nestedOrigin;
      let topTime;
      if (slot.nestedAnimationSet) {
        this.setAnimation(slot.nestedAnimation);
        topTime = (parentTime - Math.max(attached, slot.nestedAnimationOrigin)) * scale;
        this.topLoop = att.loop;
      } else if (att.inheritAnimation && parent.playingAnimation !== null && this.skeleton.data.findAnimation(parent.playingAnimation) !== null) {
        this.setAnimation(parent.playingAnimation);
        topTime = parentTime * scale;
        this.topLoop = parent.playingLoop;
      } else {
        this.setAnimation(att.animation);
        topTime = (parentTime - attached) * scale;
        this.topLoop = att.loop;
      }
      const driven = Number.isFinite(slot.nestedTime);
      this.time = driven ? slot.nestedTime : topTime;
      this.clockScale = driven ? 1 : scale;
      this.baseTime = (parentTime - attached) * scale;
      const child = this.skeleton;
      if (child.parentMatrix === null) child.parentMatrix = identityMatrix();
      att.computeParentMatrix(slot.boneMatrix, child.parentMatrix);
      child.setToSetupPose();
      const base = this.baseAnimation;
      if (base !== null) applyAnimation(child, base, loopTime(this.baseTime, base.duration));
      const animation = this.animation;
      if (animation !== null) {
        applyAnimation(child, animation, this.animationTime(animation));
        child.playingLoop = this.topLoop;
      }
      if (att.inheritColor && slot.attachment !== null) this.inheritColor(slot);
      fireResets(child, base, this.baseTime, true, this.resetBase);
      fireResets(child, animation, this.time, this.topLoop, this.resetTop);
      child.updateWorldTransform(this.time);
    }
    /** Time inside the animation on top, wrapped when it loops (spec 9.11). */
    animationTime(animation) {
      if (!this.topLoop) return this.time;
      return loopTime(this.time, animation.duration);
    }
    /**
     * Spec 7.11: the parent slot's `light` (7.12) multiplies the `light` of
     * every slot of the child. `darkColor` is not inherited.
     */
    inheritColor(slot) {
      computeFinalColor(slot, slot.attachment, this.parentLight);
      const l = this.parentLight.light;
      for (const s of this.skeleton.slots) {
        s.color[0] *= l[0];
        s.color[1] *= l[1];
        s.color[2] *= l[2];
        s.color[3] *= l[3];
      }
    }
  };
  function fireResets(child, animation, now, loop, last) {
    if (animation !== last.animation || now < last.time) last.time = -Infinity;
    last.animation = animation;
    if (animation !== null) applyResets(child, animation, last.time, now, loop);
    last.time = now;
  }
  function loopTime(t, duration) {
    if (duration <= 0) return t;
    return t - Math.floor(t / duration) * duration;
  }
  function nestedEventName(slot, eventName) {
    return slot.data.name + "/" + eventName;
  }
  function createNestedSkeleton(slot) {
    const att = slot.attachment;
    if (!(att instanceof SkeletonAttachment)) return null;
    const data = att.child;
    const owner = slot.skeleton;
    if (data === null) {
      warnNested(slot, `O slot "${slot.data.name}" aponta para o esqueleto "${att.uri}", que n\xE3o foi carregado. Nada \xE9 desenhado nele.`);
      return null;
    }
    if (owner.nestedDepth + 1 > MAX_NESTED_DEPTH) {
      warnNested(slot, `Entidade passou da profundidade m\xE1xima de ${MAX_NESTED_DEPTH} (12.6) em "${att.uri}".`);
      return null;
    }
    for (let s = slot; s !== null; s = s.skeleton.nestedOwner) {
      if (s.skeleton.data === data) {
        warnNested(slot, `Ciclo de entidade em "${att.uri}": o arquivo j\xE1 est\xE1 na cadeia (7.11).`);
        return null;
      }
    }
    return new NestedSkeleton(slot, att, data);
  }
  function warnNested(slot, message) {
    let root = slot.skeleton;
    while (root.nestedOwner !== null) root = root.nestedOwner.skeleton;
    if (!root.nestedWarnings.includes(message)) root.nestedWarnings.push(message);
  }
  registerNestedFactory(createNestedSkeleton);

  // runtime/src/actor.ts
  var Actor = class {
    constructor(file, bodies = /* @__PURE__ */ new Map()) {
      /** The body of the file itself. */
      __publicField(this, "arquivo");
      /** One skeleton per body, built once. Key `null` = the file; the others by key `value`. */
      __publicField(this, "esqueletos");
      /** Warnings of the switch (`BODY_UNMET`, `BODY_MISSING`, `SKIN_UNMET`, `NESTED_GONE`), each once. */
      __publicField(this, "warnings", []);
      /** The skeleton alive right now. */
      __publicField(this, "skeleton");
      /** Key `value` of the body alive right now; `null` = the file. */
      __publicField(this, "body", null);
      /** The skin stack the game chose, by name (spec 4.4). */
      __publicField(this, "gameStack");
      /** Animation -> body -> the animation bound to that body by name (`null` = could not bind). */
      __publicField(this, "bound", /* @__PURE__ */ new Map());
      /** Skeleton the actor left on the last switch, until its entities are carried over. */
      __publicField(this, "leaving", null);
      /** Skeletons already posed in this playback (Appendix C rule 12). */
      __publicField(this, "posed", /* @__PURE__ */ new Set());
      /** The animation `prepare` applied last, bound to the live body; `null` = setup pose. */
      __publicField(this, "boundAnimation", null);
      this.arquivo = file;
      const map = /* @__PURE__ */ new Map();
      map.set(null, new Skeleton(file));
      for (const [key, data] of bodies) map.set(key, new Skeleton(data));
      this.esqueletos = map;
      this.skeleton = map.get(null);
      this.gameStack = this.skeleton.skinStack.map((skin) => skin.name);
    }
    /**
     * The skin stack the game chooses, bottom to top (spec 4.4). Every name must
     * be a skin of the file (unknown throws, as `Skeleton.setSkinStack`). It
     * holds until a `body` key with `keepSkins: false` resets it.
     */
    setSkinStack(names) {
      for (const name of names) {
        if (this.arquivo.findSkin(name) === null) throw new Error(`skin not found: "${name}"`);
      }
      this.gameStack = names.slice();
      this.applyStack(this.skeleton, this.body, this.gameStack);
    }
    /** The stack the game chose, by name. */
    get skinStack() {
      return this.gameStack;
    }
    /**
     * `corpoEm(animation, t)` of spec 9.13, with the stack of that instant.
     * `t` is animation time, the loop already applied. A key that names a body
     * that was not loaded is skipped: the body before it holds (warning once).
     */
    corpoEm(animation, t) {
      let body = null;
      let stack = this.gameStack;
      const tl = animation === null ? null : animation.body;
      if (tl === null) return { body, stack };
      const last = findKeyIndex(tl.times, t);
      for (let i = 0; i <= last; i++) {
        const key = tl.keys.values[i];
        if (key.value !== null && !this.esqueletos.has(key.value)) {
          this.warn(`BODY_MISSING: o corpo "${key.value}" da anima\xE7\xE3o "${animation.name}" n\xE3o foi carregado; fica o corpo de antes (9.13)`);
          continue;
        }
        body = key.value;
        if (!key.keepSkins) stack = ["default"];
      }
      return { body, stack };
    }
    /**
     * `animation` bound BY NAME to `body` (spec 9.13), built once and cached.
     * `body: null` is the file, and the animation itself. `null` when the body
     * is unknown or the animation was built in code (no JSON to bind).
     */
    animationFor(animation, body) {
      if (body === null) return animation;
      const skeleton = this.esqueletos.get(body);
      if (skeleton === void 0) return null;
      let perBody = this.bound.get(animation);
      if (perBody === void 0) {
        perBody = /* @__PURE__ */ new Map();
        this.bound.set(animation, perBody);
      }
      if (perBody.has(body)) return perBody.get(body);
      let result = null;
      if (animation.source === null) {
        this.warn(`BODY_UNBOUND: a anima\xE7\xE3o "${animation.name}" n\xE3o veio de um arquivo e n\xE3o pode valer no corpo "${body}"`);
      } else {
        const loaded = loadAnimationsFor(skeleton.data, { animations: [animation.source] }, { unmetCode: "BODY_UNMET" });
        result = loaded.animations[0] ?? null;
        for (const w of loaded.warnings) {
          if (w.message.startsWith("BODY_UNMET")) this.warn(`${w.message} (corpo "${body}", anima\xE7\xE3o "${animation.name}")`);
        }
      }
      perBody.set(body, result);
      return result;
    }
    /**
     * Makes the body of `(animation, t)` the live one, with the stack of that
     * instant, and returns its skeleton. Does not pose it. A body that comes
     * back has its physics reset (6.5, Appendix C rule 12). Call `settle` after
     * the animation is applied, so the entities can go on (7.11).
     */
    enter(animation, t) {
      const { body, stack } = this.corpoEm(animation, t);
      const next = this.esqueletos.get(body) ?? this.skeleton;
      const previous = this.skeleton;
      if (next !== previous) {
        if (this.posed.has(next)) next.physicsReset();
        this.leaving = previous;
      }
      this.posed.add(next);
      this.skeleton = next;
      this.body = body;
      this.applyStack(next, this.body, stack);
      return next;
    }
    /**
     * After the animation was applied to the skeleton that just entered: every
     * entity that lived in a slot of the same name with the same `uri` in the
     * body that was left goes on with its clocks (spec 7.11, 9.13). An entity
     * with nowhere to go is gone, with a warning once. Nothing is invented.
     */
    settle() {
      const from = this.leaving;
      this.leaving = null;
      if (from === null) return;
      const to = this.skeleton;
      for (const oldSlot of from.slots) {
        const old = oldSlot.nested;
        if (!(old instanceof NestedSkeleton)) continue;
        const slot = to.findSlot(oldSlot.data.name);
        const att = slot === null ? null : slot.attachment;
        if (slot === null || !(att instanceof SkeletonAttachment) || att.resolvedUri !== old.attachment.resolvedUri) {
          this.warn(`NESTED_GONE: a entidade do slot "${oldSlot.data.name}" (${old.attachment.resolvedUri}) n\xE3o tem lugar no corpo "${this.body ?? "(o arquivo)"}"; some (7.11)`);
          continue;
        }
        const instance = slot.nestedSkeleton();
        if (instance instanceof NestedSkeleton) instance.continueFrom(old);
      }
    }
    /**
     * `Pose(projeto, animation, t, now)` of spec 9.10: the body of the instant,
     * its base, the animation bound to it, the entities carried over, and the
     * world transform at `now`. `t` is animation time (loop applied by the
     * caller); `now` is the skeleton clock (6.5), `t` when omitted. Returns the
     * skeleton that was posed.
     */
    pose(animation, t, now = t, loop = false) {
      const skeleton = this.prepare(animation, t, loop);
      skeleton.updateWorldTransform(now);
      return skeleton;
    }
    /**
     * `pose` without the world transform: for a caller that still has work to
     * do between the two (physics `reset` keys, a parameter from the game).
     * Returns the live skeleton; `boundAnimation` says what was applied.
     * `loop` says whether the animation is playing in a loop: an entity with
     * `inheritAnimation` follows it (Appendix C rule 4).
     */
    prepare(animation, t, loop = false) {
      const skeleton = this.enter(animation, t);
      skeleton.setToSetupPose();
      const bound = animation === null ? null : this.animationFor(animation, this.body);
      this.boundAnimation = bound;
      if (bound !== null) {
        applyAnimation(skeleton, bound, t);
        skeleton.playingLoop = loop;
      }
      this.settle();
      return skeleton;
    }
    /** Sets the stack on a body by name, dropping the names it lacks (warning once). Re-resolves only on change. */
    applyStack(skeleton, body, names) {
      const known = [];
      for (const name of names) {
        if (skeleton.data.findSkin(name) === null) {
          this.warn(`SKIN_UNMET: o corpo "${body ?? "(o arquivo)"}" n\xE3o tem a pele "${name}"; ela fica fora da pilha (9.13)`);
          continue;
        }
        known.push(name);
      }
      const same = skeleton.skinStack.length === known.length && skeleton.skinStack.every((skin, i) => skin.name === known[i]);
      if (!same) skeleton.setSkinStack(known);
    }
    warn(message) {
      if (!this.warnings.includes(message)) this.warnings.push(message);
    }
  };
  function poseActor(actor, animation, t, now = t, loop = false) {
    return actor.pose(animation, t, now, loop);
  }

  // runtime/src/animation-state.ts
  function mixNumber(current, setup, value, alpha, blend) {
    if (alpha >= 1 && blend !== "add") return value;
    switch (blend) {
      case "setup":
        return setup + (value - setup) * alpha;
      case "add":
        return current + (value - setup) * alpha;
      default:
        return current + (value - current) * alpha;
    }
  }
  function mixTakes(alpha) {
    return alpha >= 0.5;
  }
  function timelineKey(tl) {
    switch (tl.kind) {
      case "bone.number":
      case "bone.inherit":
      case "bone.parent":
        return `bone:${tl.bone.index}:${tl.property}`;
      case "slot.attachment":
        return `slot:${tl.slot.index}:attachment`;
      case "slot.color":
        return `slot:${tl.slot.index}:color`;
      case "slot.darkColor":
        return `slot:${tl.slot.index}:darkColor`;
      case "slot.visible":
        return `slot:${tl.slot.index}:visible`;
      case "slot.bone":
        return `slot:${tl.slot.index}:bone`;
      case "drawOrder":
        return "drawOrder";
      case "deform":
        return `deform:${tl.slot.index}:${tl.attachment.name}`;
      case "weights":
        return `weights:${tl.slot.index}:${tl.attachment.name}`;
      case "sequence":
        return `sequence:${tl.slot.index}:${tl.attachment.name}`;
      case "constraint.number":
      case "constraint.boolean":
        return `constraint:${tl.constraint.index}:${tl.property}`;
      case "parameter":
        return `parameter:${tl.parameter.index}`;
      case "morph":
        return `morph:${tl.morph.index}`;
      case "variable.number":
      case "variable.stepped":
        return `variable:${tl.variable.index}`;
      case "tag":
        return "tag";
      case "nested.animation":
        return `nested:${tl.slot.index}:animation`;
      case "nested.number":
        return `nested:${tl.slot.index}:${tl.property}`;
      default:
        return "";
    }
  }
  var keyCache = /* @__PURE__ */ new WeakMap();
  function animationKeys(animation) {
    let set = keyCache.get(animation);
    if (set === void 0) {
      const out = /* @__PURE__ */ new Set();
      for (const tl of animation.timelines) {
        const key = timelineKey(tl);
        if (key !== "") out.add(key);
      }
      set = out;
      keyCache.set(animation, out);
    }
    return set;
  }
  function constraintBones(data) {
    const d = data;
    if (d.bones !== void 0) return d.bones;
    if (d.bone !== void 0) return [d.bone];
    return [];
  }
  function timelineBone(tl) {
    switch (tl.kind) {
      case "bone.number":
      case "bone.inherit":
      case "bone.parent":
        return tl.bone.index;
      case "slot.attachment":
      case "slot.color":
      case "slot.darkColor":
      case "slot.visible":
      case "slot.bone":
      case "deform":
      case "weights":
      case "sequence":
      case "nested.animation":
      case "nested.number":
        return tl.slot.bone.index;
      default:
        return null;
    }
  }
  var deformScratch = new Float64Array(0);
  var color4 = new Float64Array(4);
  var color3 = new Float64Array(3);
  function scratchFor(length) {
    if (deformScratch.length < length) deformScratch = new Float64Array(length);
    return deformScratch.length === length ? deformScratch : deformScratch.subarray(0, length);
  }
  function applyAnimationMixed(skeleton, animation, t, options = {}) {
    const baseAlpha = options.alpha ?? 1;
    const blend = options.blend ?? "replace";
    const mask = options.boneMask ?? null;
    const shared = options.shared ?? null;
    const holdAlpha = options.holdAlpha ?? baseAlpha;
    const written = options.written ?? null;
    const blocked = options.blocked ?? written;
    const timelines = animation.timelines;
    let tagsWritten = false;
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < timelines.length; i++) {
        const tl = timelines[i];
        const second = tl.kind === "deform" || tl.kind === "weights" || tl.kind === "sequence";
        if (pass === 1 !== second) continue;
        const key = timelineKey(tl);
        if (key === "") continue;
        if (mask !== null) {
          const bone = timelineBone(tl);
          if (bone !== null) {
            if (!mask.has(bone)) continue;
          } else if (tl.kind === "constraint.number" || tl.kind === "constraint.boolean") {
            let touched = false;
            for (const b of constraintBones(tl.constraint)) if (mask.has(b.index)) {
              touched = true;
              break;
            }
            if (!touched) continue;
          } else {
            continue;
          }
        }
        if (blend === "first" && blocked !== null && blocked.has(key)) continue;
        const alpha = shared !== null && !shared.has(key) ? holdAlpha : baseAlpha;
        if (alpha <= 0) continue;
        if (written !== null) written.add(key);
        applyTimeline(skeleton, animation, tl, t, alpha, blend, () => {
          tagsWritten = true;
        });
      }
    }
    if (!tagsWritten && animation.tags.length > 0 && mask === null && mixTakes(baseAlpha)) {
      skeleton.tags = animation.tags;
    }
  }
  function applyTimeline(skeleton, animation, tl, t, alpha, blend, markTags) {
    switch (tl.kind) {
      case "bone.number": {
        const bone = skeleton.bones[tl.bone.index];
        bone[tl.property] = mixNumber(
          bone[tl.property],
          tl.bone[tl.property],
          evaluateNumber(tl.keys, t),
          alpha,
          blend
        );
        break;
      }
      case "bone.inherit": {
        const bone = skeleton.bones[tl.bone.index];
        if (mixTakes(alpha)) bone[tl.property] = evaluateStepped(tl.keys, t);
        else if (blend === "setup") bone[tl.property] = tl.bone[tl.property];
        break;
      }
      case "bone.parent": {
        const bone = skeleton.bones[tl.bone.index];
        if (mixTakes(alpha)) applyParentKey(skeleton, bone, evaluateStepped(tl.keys, t));
        else if (blend === "setup") applyParentKey(skeleton, bone, null);
        break;
      }
      case "slot.attachment": {
        const slot = skeleton.slots[tl.slot.index];
        if (mixTakes(alpha)) {
          slot.setAttachmentName(evaluateStepped(tl.keys, t));
          slot.nestedOrigin = runStart(tl.keys, t);
        } else if (blend === "setup") {
          slot.setAttachmentName(tl.slot.attachmentName);
        }
        break;
      }
      case "slot.color": {
        const slot = skeleton.slots[tl.slot.index];
        const setup = tl.slot.color;
        for (let j = 0; j < 4; j++) {
          slot.color[j] = mixNumber(slot.color[j], setup[j], evaluateComponent(tl.keys, t, j), alpha, blend);
        }
        break;
      }
      case "slot.darkColor": {
        const slot = skeleton.slots[tl.slot.index];
        const v = evaluateDarkColor(tl, t, color3);
        const setup = tl.slot.darkColor;
        const current = slot.darkColor;
        if (v === null || current === null || blend !== "replace" && setup === null) {
          if (mixTakes(alpha)) {
            if (v === null) slot.darkColor = null;
            else if (current === null) slot.darkColor = Float64Array.from(v);
            else current.set(v);
          }
          break;
        }
        for (let j = 0; j < 3; j++) {
          current[j] = mixNumber(current[j], setup === null ? current[j] : setup[j], v[j], alpha, blend);
        }
        break;
      }
      case "slot.visible": {
        const slot = skeleton.slots[tl.slot.index];
        if (mixTakes(alpha)) slot.visible = evaluateStepped(tl.keys, t);
        else if (blend === "setup") slot.visible = tl.slot.visible;
        break;
      }
      case "slot.bone": {
        const slot = skeleton.slots[tl.slot.index];
        if (mixTakes(alpha)) applySlotBoneKey(skeleton, slot, evaluateStepped(tl.keys, t));
        else if (blend === "setup") slot.setBone(null, null);
        break;
      }
      case "weights":
        applyWeightsMixed(skeleton.slots[tl.slot.index], tl, t, alpha, blend);
        break;
      case "drawOrder": {
        if (!mixTakes(alpha)) break;
        const i = findKeyIndex(tl.times, t);
        applyDrawOrder(skeleton, tl.entries[i < 0 ? 0 : i]);
        break;
      }
      case "constraint.number": {
        const c = skeleton.constraintFor(tl.constraint);
        if (c === null) break;
        const setup = tl.constraint[tl.property] ?? 0;
        c[tl.property] = mixNumber(c[tl.property], setup, evaluateNumber(tl.keys, t), alpha, blend);
        break;
      }
      case "constraint.boolean": {
        const c = skeleton.constraintFor(tl.constraint);
        if (c === null || !mixTakes(alpha)) break;
        c[tl.property] = evaluateStepped(tl.keys, t);
        break;
      }
      case "parameter": {
        const p = tl.parameter;
        const v = mixNumber(skeleton.parameters[p.index], p.default, evaluateNumber(tl.keys, t), alpha, blend);
        skeleton.parameters[p.index] = p.constrain(v);
        break;
      }
      case "morph": {
        const m = tl.morph;
        const v = mixNumber(skeleton.morphWeights[m.index], m.weight, evaluateNumber(tl.keys, t), alpha, blend);
        skeleton.morphWeights[m.index] = clamp(v, m.min, m.max);
        break;
      }
      case "variable.number": {
        const variable = tl.variable;
        const setup = typeof variable.default === "number" ? variable.default : 0;
        const current = skeleton.variables[variable.index];
        const v = mixNumber(typeof current === "number" ? current : 0, setup, evaluateNumber(tl.keys, t), alpha, blend);
        skeleton.variables[variable.index] = variable.type === "int" ? Math.trunc(v) : v;
        break;
      }
      case "variable.stepped": {
        if (!mixTakes(alpha)) break;
        skeleton.variables[tl.variable.index] = evaluateStepped(tl.keys, t);
        break;
      }
      case "tag": {
        if (!mixTakes(alpha)) break;
        skeleton.tags = activeTagsFor(animation, tl.keys.times, tl.keys.values, t);
        markTags();
        break;
      }
      case "nested.animation": {
        if (!mixTakes(alpha)) break;
        const slot = skeleton.slots[tl.slot.index];
        slot.nestedAnimation = evaluateStepped(tl.keys, t);
        slot.nestedAnimationSet = true;
        slot.nestedAnimationOrigin = runStart(tl.keys, t);
        break;
      }
      case "nested.number": {
        const slot = skeleton.slots[tl.slot.index];
        const v = evaluateNumber(tl.keys, t);
        const current = tl.property === "time" ? slot.nestedTime : slot.nestedTimeScale;
        const setup = tl.property === "time" ? 0 : 1;
        const mixed = mixNumber(Number.isNaN(current) ? setup : current, setup, v, alpha, blend);
        if (tl.property === "time") slot.nestedTime = mixed;
        else slot.nestedTimeScale = mixed;
        break;
      }
      case "deform":
        applyDeformMixed(skeleton.slots[tl.slot.index], tl, t, alpha, blend);
        break;
      case "sequence": {
        if (!mixTakes(alpha)) break;
        const slot = skeleton.slots[tl.slot.index];
        if (slot.attachment === tl.attachment) slot.sequenceIndex = sequenceFrameAt(tl, t);
        break;
      }
      default:
        break;
    }
  }
  function activeTagsFor(animation, times, values, t) {
    const i = findKeyIndex(times, t);
    if (i < 0) return animation.tags;
    const fromKey = values[i];
    if (animation.tags.length === 0) return fromKey;
    const out = animation.tags.slice();
    for (const tag of fromKey) if (!out.includes(tag)) out.push(tag);
    return out;
  }
  function applyWeightsMixed(slot, tl, t, alpha, blend) {
    const current = slot.attachment;
    const target = tl.attachment.timelineAttachment;
    const binding = tl.attachment.binding;
    if (binding === null || !(current instanceof VertexAttachment) || current.timelineAttachment !== target) return;
    const length = binding.weights.length;
    const value = evaluateWeights(tl, t, new Float64Array(length));
    const held = slot.weights !== null && slot.weights.length === length && slot.weightsAttachment === target ? slot.weights : null;
    const out = held ?? Float64Array.from(binding.weights);
    for (let j = 0; j < length; j++) out[j] = mixNumber(out[j], binding.weights[j], value[j], alpha, blend);
    slot.weights = out;
    slot.weightsAttachment = target;
  }
  function applyDeformMixed(slot, tl, t, alpha, blend) {
    const current = slot.attachment;
    if (!(current instanceof VertexAttachment) || current.timelineAttachment !== tl.attachment.timelineAttachment) return;
    const length = tl.attachment.deformLength;
    const value = evaluateDeform(tl, t, scratchFor(length));
    const held = slot.deform !== null && slot.deform.length === length && slot.deformAttachment === tl.attachment.timelineAttachment ? slot.deform : null;
    if (value === null && held === null) return;
    if (value === null && blend === "setup") {
      slot.deform = null;
      slot.deformAttachment = null;
      return;
    }
    const out = held ?? new Float64Array(length);
    for (let j = 0; j < length; j++) {
      const c = held === null ? 0 : held[j];
      out[j] = mixNumber(c, 0, value === null ? 0 : value[j], alpha, blend);
    }
    slot.deform = out;
    slot.deformAttachment = tl.attachment.timelineAttachment;
  }
  var AnimationStateData = class {
    constructor() {
      /** Used when the pair is not in the table and the animation has no hint. */
      __publicField(this, "defaultMix", 0);
      __publicField(this, "pairs", /* @__PURE__ */ new Map());
    }
    /** Crossfade from `from` to `to`, in seconds. Names, not objects. */
    setMix(from, to, duration) {
      this.pairs.set(`${from}\0${to}`, duration);
    }
    /** Removes one pair from the table. */
    clearMix(from, to) {
      this.pairs.delete(`${from}\0${to}`);
    }
    getMix(from, to) {
      if (from !== null) {
        const v = this.pairs.get(`${from.name}\0${to.name}`);
        if (v !== void 0) return v;
      }
      if (to.defaultMix !== null) return to.defaultMix;
      return this.defaultMix;
    }
  };
  var EMPTY_ANIMATION = new AnimationData(-1, "<vazia>", [], { duration: 0 });
  var TrackEntry = class {
    constructor(trackIndex, animation, loop) {
      __publicField(this, "trackIndex");
      __publicField(this, "animation");
      /** Repeats when the duration runs out. */
      __publicField(this, "loop");
      /** Multiplies the delta. 1 is normal speed, 0.5 is half. */
      __publicField(this, "timeScale", 1);
      /** How much of this track reaches the skeleton, 0 to 1. */
      __publicField(this, "alpha", 1);
      /** How this track enters over the tracks below it. */
      __publicField(this, "mixBlend", "replace");
      /**
       * Bone NAMES this entry may write, or `null` for the whole skeleton. Lives on
       * the track, never in the file: a mask is a decision of the game.
       */
      __publicField(this, "boneMask", null);
      /** Seconds played, without the loop folded in. */
      __publicField(this, "trackTime", 0);
      /** Seconds of crossfade already elapsed. */
      __publicField(this, "mixTime", 0);
      /** Total crossfade, resolved from the table when the entry starts. */
      __publicField(this, "mixDuration", 0);
      /** The entry being faded out, or `null`. */
      __publicField(this, "mixingFrom", null);
      /** The entry queued after this one, or `null`. */
      __publicField(this, "next", null);
      /** Track time of the PREVIOUS entry at which this queued entry starts. */
      __publicField(this, "delay", 0);
      /** Listener for this entry only. Called before the state's listeners. */
      __publicField(this, "listener", null);
      /** Crossfade asked for by the caller; `null` means "read the table". */
      __publicField(this, "requestedMix", null);
      /** Last `trackTime` events were fired up to. */
      __publicField(this, "lastEventTime", -Infinity);
      /** Loops already reported by `complete`. */
      __publicField(this, "completedLoops", 0);
      this.trackIndex = trackIndex;
      this.animation = animation;
      this.loop = loop;
    }
    /** Time inside the animation: wrapped when looping, clamped when not. */
    get animationTime() {
      const d = this.animation.duration;
      if (d <= 0) return 0;
      if (!this.loop) return clamp(this.trackTime, 0, d);
      const t = this.trackTime % d;
      return t < 0 ? t + d : t;
    }
    /** `true` when a non-looping entry has run past its duration. */
    get isComplete() {
      return !this.loop && this.trackTime >= this.animation.duration;
    }
    /** How far the crossfade got, 0 to 1. 1 when there is nothing to fade. */
    get mixProgress() {
      if (this.mixingFrom === null) return 1;
      if (this.mixDuration <= 0) return 1;
      return clamp(this.mixTime / this.mixDuration, 0, 1);
    }
  };
  var AnimationState = class {
    constructor(data = new AnimationStateData()) {
      __publicField(this, "data");
      /** Multiplies every delta, for slow motion over the whole state. */
      __publicField(this, "timeScale", 1);
      /**
       * `apply` puts the skeleton in the setup pose first. Turn it off only when
       * something else already posed the skeleton this frame.
       */
      __publicField(this, "resetToSetupPose", true);
      __publicField(this, "trackList", []);
      __publicField(this, "listeners", []);
      __publicField(this, "queue", []);
      __publicField(this, "draining", false);
      __publicField(this, "firedScratch", []);
      __publicField(this, "maskScratch", /* @__PURE__ */ new Set());
      this.data = data;
    }
    /** The tracks, in order. A hole is a track with nothing playing. */
    get tracks() {
      return this.trackList;
    }
    /** The entry playing on a track, or `null`. */
    getCurrent(trackIndex) {
      return this.trackList[trackIndex] ?? null;
    }
    addListener(listener) {
      this.listeners.push(listener);
      return () => this.removeListener(listener);
    }
    removeListener(listener) {
      const i = this.listeners.indexOf(listener);
      if (i >= 0) this.listeners.splice(i, 1);
    }
    // -------------------------------------------------------------------------
    // Setting animations
    // -------------------------------------------------------------------------
    /**
     * Plays `animation` on `trackIndex` now. Whatever was there is interrupted
     * and crossfades out over `mixDuration` seconds (the table, when omitted).
     */
    setAnimation(trackIndex, animation, loop = animation.loop, mixDuration = null) {
      const entry = new TrackEntry(trackIndex, animation, loop);
      entry.requestedMix = mixDuration;
      const current = this.getCurrent(trackIndex);
      this.grow(trackIndex);
      if (current !== null) {
        const stale = current.mixingFrom;
        current.mixingFrom = null;
        if (stale !== null) this.disposeEntry(stale, true);
        this.disposeQueue(current.next);
        current.next = null;
        entry.mixingFrom = current;
        entry.mixDuration = mixDuration ?? this.data.getMix(current.animation, animation);
        entry.mixTime = 0;
        this.enqueue("interrupt", current);
        if (entry.mixDuration <= 0) {
          entry.mixingFrom = null;
          this.enqueue("end", current);
          this.enqueue("dispose", current);
        }
      } else {
        entry.mixDuration = mixDuration ?? 0;
      }
      this.trackList[trackIndex] = entry;
      this.enqueue("start", entry);
      this.drain();
      return entry;
    }
    /**
     * Queues `animation` after what is playing on the track. `delay` is measured
     * in track time of the entry it follows: it starts when that entry's
     * `trackTime` reaches `delay`. `delay <= 0` means "when the one before it
     * ends", i.e. its duration minus the crossfade.
     */
    addAnimation(trackIndex, animation, loop = animation.loop, delay = 0, mixDuration = null) {
      this.grow(trackIndex);
      const entry = new TrackEntry(trackIndex, animation, loop);
      entry.requestedMix = mixDuration;
      let last = this.getCurrent(trackIndex);
      if (last === null) {
        const started = this.setAnimation(trackIndex, animation, loop, mixDuration);
        started.delay = 0;
        return started;
      }
      while (last.next !== null) last = last.next;
      const mix = mixDuration ?? this.data.getMix(last.animation, animation);
      entry.delay = delay > 0 ? delay : Math.max(0, last.animation.duration - mix);
      last.next = entry;
      return entry;
    }
    /**
     * Fades the track back to the setup pose over `mixDuration` seconds. Nothing
     * plays afterwards.
     */
    setEmptyAnimation(trackIndex, mixDuration = 0) {
      return this.setAnimation(trackIndex, EMPTY_ANIMATION, false, mixDuration);
    }
    /** Stops a track at once. Listeners get `end` and then `dispose`. */
    clearTrack(trackIndex) {
      const entry = this.trackList[trackIndex] ?? null;
      if (entry === null) return;
      this.trackList[trackIndex] = null;
      this.disposeQueue(entry.next);
      entry.next = null;
      if (entry.mixingFrom !== null) {
        this.disposeEntry(entry.mixingFrom, true);
        entry.mixingFrom = null;
      }
      this.disposeEntry(entry, true);
      this.drain();
    }
    /** Stops every track. */
    clearTracks() {
      for (let i = 0; i < this.trackList.length; i++) this.clearTrack(i);
    }
    // -------------------------------------------------------------------------
    // The frame
    // -------------------------------------------------------------------------
    /** Advances every clock by `delta` seconds and fires the listeners. */
    update(delta) {
      const dt = delta * this.timeScale;
      for (let i = 0; i < this.trackList.length; i++) {
        const entry = this.trackList[i];
        if (entry === null) continue;
        const from = entry.mixingFrom;
        if (from !== null) {
          entry.mixTime += dt;
          if (entry.mixDuration <= 0 || entry.mixTime >= entry.mixDuration) {
            entry.mixTime = entry.mixDuration;
            entry.mixingFrom = null;
            this.disposeEntry(from, true);
          } else {
            this.advance(from, dt);
          }
        }
        this.advance(entry, dt);
        const next = entry.next;
        if (next !== null && entry.trackTime >= next.delay) {
          entry.next = null;
          next.mixDuration = next.requestedMix ?? this.data.getMix(entry.animation, next.animation);
          next.mixTime = 0;
          if (next.mixDuration > 0) {
            next.mixingFrom = entry;
            this.enqueue("interrupt", entry);
          } else {
            this.enqueue("interrupt", entry);
            this.disposeEntry(entry, true);
          }
          this.trackList[i] = next;
          this.enqueue("start", next);
        }
      }
      this.drain();
    }
    advance(entry, dt) {
      const before = entry.trackTime;
      entry.trackTime += dt * entry.timeScale;
      const animation = entry.animation;
      const duration = animation.duration;
      const prev = entry.lastEventTime;
      this.firedScratch.length = 0;
      fireEvents(animation, prev, entry.trackTime, entry.loop, this.firedScratch);
      for (const fired of this.firedScratch) this.enqueueEvent(entry, fired);
      entry.lastEventTime = entry.trackTime;
      if (duration > 0) {
        const loops = Math.floor(entry.trackTime / duration);
        const cap = entry.loop ? loops : Math.min(loops, 1);
        while (entry.completedLoops < cap) {
          entry.completedLoops++;
          this.enqueue("complete", entry);
        }
      } else if (entry.completedLoops === 0 && entry.trackTime > 0 && before <= 0) {
        entry.completedLoops = 1;
        this.enqueue("complete", entry);
      }
    }
    /**
     * Writes every track into `skeleton`, from 0 upwards. Returns `true` when at
     * least one track wrote something.
     *
     * With an `Actor` (spec 9.13) the body is the one track 0 is in at its time:
     * the actor switches to it first, every animation of every track is bound to
     * that body by name, and the entities are carried over at the end.
     */
    apply(target) {
      let skeleton;
      let bind = (animation) => animation;
      if (target instanceof Actor) {
        const first = this.trackList[0] ?? null;
        skeleton = target.enter(first === null ? null : first.animation, first === null ? 0 : first.animationTime);
        bind = (animation) => target.animationFor(animation, target.body);
      } else {
        skeleton = target;
      }
      const applied = this.applyBound(skeleton, bind);
      if (target instanceof Actor) target.settle();
      return applied;
    }
    applyBound(skeleton, bind) {
      if (this.resetToSetupPose) skeleton.setToSetupPose();
      const written = /* @__PURE__ */ new Set();
      let applied = false;
      for (let i = 0; i < this.trackList.length; i++) {
        const entry = this.trackList[i];
        if (entry === null || entry.alpha <= 0) continue;
        applied = true;
        const blocked = new Set(written);
        const from = entry.mixingFrom;
        const a = clamp(entry.alpha, 0, 1);
        if (i === 0) {
          skeleton.playingAnimation = entry.animation.name;
          skeleton.playingTime = entry.animationTime;
          skeleton.playingLoop = entry.loop;
        }
        const animation = bind(entry.animation);
        if (animation === null) continue;
        if (from === null) {
          applyAnimationMixed(skeleton, animation, entry.animationTime, {
            alpha: a,
            blend: entry.mixBlend,
            boneMask: this.maskOf(skeleton, entry),
            blocked,
            written
          });
          continue;
        }
        const fromAnimation = bind(from.animation);
        const m = entry.mixProgress;
        const denominator = 1 - a * m;
        const outgoing = denominator <= 1e-9 ? 0 : a * (1 - m) / denominator;
        if (fromAnimation !== null) {
          applyAnimationMixed(skeleton, fromAnimation, from.animationTime, {
            alpha: outgoing,
            blend: from.mixBlend,
            boneMask: this.maskOf(skeleton, from),
            shared: animationKeys(animation),
            holdAlpha: a * (1 - m),
            blocked,
            written
          });
        }
        applyAnimationMixed(skeleton, animation, entry.animationTime, {
          alpha: a * m,
          blend: entry.mixBlend,
          boneMask: this.maskOf(skeleton, entry),
          blocked,
          written
        });
      }
      return applied;
    }
    /** Bone names of a track turned into indices for this skeleton. */
    maskOf(skeleton, entry) {
      const names = entry.boneMask;
      if (names === null) return null;
      const out = this.maskScratch;
      out.clear();
      for (const name of names) {
        const bone = skeleton.findBone(name);
        if (bone !== null) out.add(bone.data.index);
      }
      return new Set(out);
    }
    // -------------------------------------------------------------------------
    // Listener queue
    // -------------------------------------------------------------------------
    grow(trackIndex) {
      while (this.trackList.length <= trackIndex) this.trackList.push(null);
    }
    disposeQueue(entry) {
      let e = entry;
      while (e !== null) {
        const next = e.next;
        e.next = null;
        this.enqueue("dispose", e);
        e = next;
      }
    }
    disposeEntry(entry, ended) {
      if (ended) this.enqueue("end", entry);
      this.enqueue("dispose", entry);
    }
    enqueue(type, entry) {
      this.queue.push({ type, entry });
    }
    enqueueEvent(entry, fired) {
      this.queue.push({ type: "event", entry, fired });
    }
    drain() {
      if (this.draining) return;
      this.draining = true;
      try {
        while (this.queue.length > 0) {
          const item = this.queue.shift();
          const entry = item.entry;
          if (entry.listener !== null) this.deliver(entry.listener, item);
          for (const listener of this.listeners.slice()) this.deliver(listener, item);
        }
      } finally {
        this.draining = false;
      }
    }
    deliver(listener, item) {
      switch (item.type) {
        case "start":
          listener.start?.(item.entry);
          break;
        case "interrupt":
          listener.interrupt?.(item.entry);
          break;
        case "end":
          listener.end?.(item.entry);
          break;
        case "complete":
          listener.complete?.(item.entry);
          break;
        case "dispose":
          listener.dispose?.(item.entry);
          break;
        case "event":
          listener.event?.(item.entry, item.fired);
          break;
      }
    }
  };

  // runtime/src/render-list.ts
  var DRAWABLE_TYPES = /* @__PURE__ */ new Set(["region", "mesh", "linkedmesh", "skeleton", "BONE_particle"]);
  function collectDrawables(skeleton, out = []) {
    walk(skeleton, null, (drawable) => out.push(drawable));
    return out;
  }
  function walk(skeleton, marker, visit) {
    let clip = null;
    let passed = false;
    for (const slot of skeleton.drawOrder) {
      const isMarker = marker !== null && slot.data.name === marker;
      if (isMarker) passed = true;
      const att = slot.attachment;
      if (att === null || !slot.visible) continue;
      if (att instanceof ClippingAttachment) {
        if (!att.clipsAnything) {
          clip = null;
          continue;
        }
        const polygon = att.computeWorldVertices(slot);
        clip = {
          slot,
          attachment: att,
          polygon,
          end: att.endSlot,
          slots: att.slots === null ? null : new Set(att.slots),
          invert: att.invert
        };
        continue;
      }
      if (DRAWABLE_TYPES.has(att.type) && (!isMarker || aroundMarker(slot) !== null)) {
        const clipped = clip !== null && (clip.slots === null || clip.slots.has(slot.data));
        visit({ slot, attachment: att, clip: clipped ? clip : null }, passed);
      }
      if (clip !== null && clip.slots === null && slot.data === clip.end) clip = null;
    }
  }
  function aroundMarker(slot) {
    const att = slot.attachment;
    if (!(att instanceof SkeletonAttachment) || att.around === null) return null;
    const nested = slot.nested;
    if (nested === null) return null;
    if (nested.skeleton.findSlot(att.around) === null) {
      slot.skeleton.nestedRoot.warnNested(
        `AROUND_SLOT_MISSING: a entidade "${att.uri}" (slot "${slot.data.name}") pede around "${att.around}", e ela n\xE3o tem esse slot: desenhada em bloco (7.11)`
      );
      return null;
    }
    return att.around;
  }
  function collectDrawGroups(skeleton, cut = null, out = []) {
    const back = [];
    const before = [];
    const after = [];
    const front = [];
    walk(skeleton, cut === null ? null : cut.marker, (drawable, passed) => {
      if (aroundMarker(drawable.slot) !== null) {
        back.unshift({ slot: drawable.slot, attachment: drawable.attachment, clip: null, part: "back" });
        front.push({ slot: drawable.slot, attachment: drawable.attachment, clip: null, part: "front" });
        return;
      }
      (passed ? after : before).push(drawable);
    });
    if (cut === null || cut.part === "back") {
      for (const d of back) out.push(d);
      for (const d of before) out.push(d);
    }
    if (cut === null || cut.part === "front") {
      for (const d of after) out.push(d);
      for (const d of front) out.push(d);
    }
    return out;
  }
  function collectDrawList(skeleton, out = []) {
    openInto(skeleton, null, "", [], 0, out);
    return out;
  }
  function openInto(skeleton, cut, prefix, clips, depth, out) {
    for (const { slot, attachment, clip, part } of collectDrawGroups(skeleton, cut)) {
      const chain = clip === null ? clips : [...clips, { name: `${prefix}${clip.slot.data.name}/${clip.attachment.name}`, state: clip }];
      if (attachment.type === "skeleton") {
        const nested = slot.nested;
        if (nested === null || depth + 1 > MAX_NESTED_DEPTH) continue;
        const marker = part === void 0 ? null : aroundMarker(slot);
        openInto(
          nested.skeleton,
          marker === null || part === void 0 ? null : { marker, part },
          `${prefix}${slot.data.name}/`,
          chain,
          depth + 1,
          out
        );
        continue;
      }
      if (attachment instanceof ParticleAttachment && !attachment.shapeKnown) continue;
      out.push({ skeleton, slot, attachment, name: `${prefix}${slot.data.name}/${attachment.name}`, clips: chain });
    }
  }

  // runtime/src/externos.ts
  function isObj(v) {
    return typeof v === "object" && v !== null && !Array.isArray(v);
  }
  function strings(v) {
    return Array.isArray(v) ? v.filter((s) => typeof s === "string") : [];
  }
  function objects(v) {
    return Array.isArray(v) ? v.filter(isObj) : [];
  }
  function nameOf(o) {
    return typeof o["name"] === "string" ? o["name"] : null;
  }
  function folderOfEntry(name) {
    const cut = name.lastIndexOf("/");
    return cut < 0 ? "" : name.slice(0, cut);
  }
  function composeExternals(tree, base, read) {
    const warnings = [];
    const missing = [];
    const externalAnimations = /* @__PURE__ */ new Set();
    const skinOrigins = /* @__PURE__ */ new Map();
    const nothing = { tree, externalAnimations, skinOrigins, warnings, missing };
    if (!isObj(tree)) return nothing;
    const assets = isObj(tree["assets"]) ? tree["assets"] : {};
    const skinUris = strings(assets["skins"]);
    const animationUris = strings(assets["animations"]);
    if (skinUris.length === 0 && animationUris.length === 0) return nothing;
    const root = { ...tree };
    const bones = objects(tree["bones"]).slice();
    const slots = objects(tree["slots"]).slice();
    const constraints = objects(tree["constraints"]).slice();
    const skins = objects(tree["skins"]).slice();
    const animations = objects(tree["animations"]).slice();
    const skeletonsBase = typeof assets["skeletonsBase"] === "string" ? assets["skeletonsBase"] : "";
    const names = (list) => new Set(list.map(nameOf).filter((n) => n !== null));
    const boneNames = names(bones);
    const slotNames = names(slots);
    const constraintNames = names(constraints);
    const localSkins = names(skins);
    const localAnimations = names(animations);
    const externalSkins = /* @__PURE__ */ new Set();
    const externalAnimationNames = /* @__PURE__ */ new Set();
    const open = (uri, list) => {
      const entry = joinUri(base, joinUri(skeletonsBase, uri));
      let file;
      try {
        file = read(entry);
      } catch (error) {
        warnings.push(`EXTERNAL_UNREADABLE: n\xE3o deu para ler "${entry}" (assets.${list}): ${error instanceof Error ? error.message : String(error)}`);
        return null;
      }
      if (file === null || file === void 0) {
        missing.push(entry);
        warnings.push(`EXTERNAL_MISSING: o arquivo "${entry}" de assets.${list} n\xE3o foi achado; o que ele traria fica de fora (2.8)`);
        return null;
      }
      if (!isObj(file)) {
        warnings.push(`EXTERNAL_UNREADABLE: "${entry}" (assets.${list}) n\xE3o \xE9 um arquivo .bone`);
        return null;
      }
      const ext = isObj(file["assets"]) ? file["assets"] : {};
      if (strings(ext["animations"]).length > 0 || strings(ext["skins"]).length > 0) {
        warnings.push(`EXTERNAL_CHAIN: "${entry}" tem assets.animations ou assets.skins pr\xF3prios; as listas dele s\xE3o ignoradas (2.8, profundidade 1)`);
      }
      return { entry, file };
    };
    const checkRig = (entry, rig) => {
      for (const bone of strings(rig["bones"])) {
        if (!boneNames.has(bone)) warnings.push(`RIG_UNMET: "${entry}" exige o osso "${bone}", que este corpo n\xE3o tem (4.8)`);
      }
      for (const slot of strings(rig["slots"])) {
        if (!slotNames.has(slot)) warnings.push(`RIG_UNMET: "${entry}" exige o slot "${slot}", que este corpo n\xE3o tem (4.8)`);
      }
    };
    for (const uri of skinUris) {
      const opened = open(uri, "skins");
      if (opened === null) continue;
      const { entry, file } = opened;
      const rig = isObj(file["rig"]) ? file["rig"] : {};
      checkRig(entry, rig);
      if (isObj(rig["reference"])) warnings.push(`RIG_REFERENCE_IGNORED: "${entry}" \xE9 uma pele; rig.reference s\xF3 vale num arquivo de anima\xE7\xF5es (4.8)`);
      const rigBones = new Set(strings(rig["bones"]));
      const brought = /* @__PURE__ */ new Set();
      objects(file["bones"]).forEach((bone, index) => {
        const name = nameOf(bone);
        if (name === null) return;
        if (bone["skinRequired"] !== true) {
          if (index !== 0) warnings.push(`EXTERNAL_BONE_NOT_SKIN: o osso "${name}" de "${entry}" n\xE3o \xE9 skinRequired; ignorado (2.8)`);
          return;
        }
        if (boneNames.has(name)) {
          warnings.push(`EXTERNAL_DUPLICATE: o osso "${name}" de "${entry}" j\xE1 existe aqui; vale o daqui (2.8)`);
          return;
        }
        const parent = typeof bone["parent"] === "string" ? bone["parent"] : null;
        if (parent === null || !(rigBones.has(parent) || brought.has(parent))) {
          warnings.push(`REF_BONE_MISSING: o pai "${parent ?? ""}" do osso "${name}" de "${entry}" n\xE3o est\xE1 no rig nem \xE9 trazido pela pele (2.8)`);
        }
        bones.push({ ...bone });
        boneNames.add(name);
        brought.add(name);
      });
      for (const slot of objects(file["slots"])) {
        const name = nameOf(slot);
        if (name === null) continue;
        if (slotNames.has(name)) {
          warnings.push(`EXTERNAL_DUPLICATE: o slot "${name}" de "${entry}" j\xE1 existe aqui; vale o daqui (2.8)`);
          continue;
        }
        slots.push({ ...slot });
        slotNames.add(name);
      }
      for (const constraint of objects(file["constraints"])) {
        const name = nameOf(constraint);
        if (name === null) continue;
        if (constraint["skinRequired"] !== true) {
          warnings.push(`EXTERNAL_BONE_NOT_SKIN: a regra "${name}" de "${entry}" n\xE3o \xE9 skinRequired; ignorada (2.8)`);
          continue;
        }
        if (constraintNames.has(name)) {
          warnings.push(`EXTERNAL_DUPLICATE: a regra "${name}" de "${entry}" j\xE1 existe aqui; vale a daqui (2.8)`);
          continue;
        }
        constraints.push({ ...constraint });
        constraintNames.add(name);
      }
      const fileAssets = isObj(file["assets"]) ? file["assets"] : {};
      const origin = {
        entry,
        folder: folderOfEntry(entry),
        skeletonsBase: typeof fileAssets["skeletonsBase"] === "string" ? fileAssets["skeletonsBase"] : "",
        atlases: strings(fileAssets["atlases"])
      };
      const fileBones = objects(file["bones"]).map(nameOf);
      const translate = (skin) => translateBindings(skin, fileBones, bones.map(nameOf), entry, warnings);
      for (const rawSkin of objects(file["skins"])) {
        const skin = translate(rawSkin);
        const name = nameOf(skin);
        if (name === null) continue;
        if (localSkins.has(name)) {
          warnings.push(`EXTERNAL_DUPLICATE: a skin "${name}" de "${entry}" j\xE1 existe aqui; vale a daqui (2.8)`);
          continue;
        }
        if (externalSkins.has(name)) {
          warnings.push(`EXTERNAL_DUPLICATE: a pele "${name}" de "${entry}" j\xE1 veio de outro arquivo; vale a primeira (2.8)`);
          continue;
        }
        skins.push(skin);
        externalSkins.add(name);
        skinOrigins.set(name, origin);
      }
    }
    for (const uri of animationUris) {
      const opened = open(uri, "animations");
      if (opened === null) continue;
      const { entry, file } = opened;
      const rig = isObj(file["rig"]) ? file["rig"] : {};
      checkRig(entry, rig);
      const k = referenceFactor(entry, rig, bones, warnings);
      for (const animation of objects(file["animations"])) {
        const name = nameOf(animation);
        if (name === null) continue;
        if (localAnimations.has(name)) {
          warnings.push(`EXTERNAL_DUPLICATE: a anima\xE7\xE3o "${name}" de "${entry}" j\xE1 existe aqui; vale a daqui (2.8)`);
          continue;
        }
        if (externalAnimationNames.has(name)) {
          warnings.push(`EXTERNAL_DUPLICATE: a anima\xE7\xE3o "${name}" de "${entry}" j\xE1 veio de outro arquivo; vale a primeira (2.8)`);
          continue;
        }
        const copy = k === 1 ? animation : scaleTranslations(animation, k);
        animations.push(copy);
        externalAnimations.add(copy);
        externalAnimationNames.add(name);
      }
    }
    root["bones"] = bones;
    if (slots.length > 0 || tree["slots"] !== void 0) root["slots"] = slots;
    if (constraints.length > 0 || tree["constraints"] !== void 0) root["constraints"] = constraints;
    if (skins.length > 0 || tree["skins"] !== void 0) root["skins"] = skins;
    if (animations.length > 0 || tree["animations"] !== void 0) root["animations"] = animations;
    return { tree: root, externalAnimations, skinOrigins, warnings, missing };
  }
  function translateBindings(skin, fileBones, hostBones, entry, warnings = []) {
    const attachments = skin["attachments"];
    if (!isObj(attachments)) return skin;
    let changed = false;
    const outSlots = {};
    for (const [slot, placeholders] of Object.entries(attachments)) {
      if (!isObj(placeholders)) {
        outSlots[slot] = placeholders;
        continue;
      }
      const outPlaceholders = {};
      for (const [placeholder, att] of Object.entries(placeholders)) {
        const binding = isObj(att) ? att["binding"] : void 0;
        if (!isObj(att) || !isObj(binding) || !Array.isArray(binding["bones"])) {
          outPlaceholders[placeholder] = att;
          continue;
        }
        const translated = binding["bones"].map((index) => {
          if (typeof index !== "number") return index;
          const boneName = fileBones[index] ?? null;
          const hostIndex = boneName === null ? -1 : hostBones.indexOf(boneName);
          if (hostIndex < 0) {
            const message = `RIG_UNMET: o osso ${boneName === null ? `de \xEDndice ${index}` : `"${boneName}"`} do binding de "${placeholder}" (${entry}) n\xE3o existe neste corpo; vai para o \xEDndice 0 (2.8)`;
            if (!warnings.includes(message)) warnings.push(message);
            return 0;
          }
          return hostIndex;
        });
        outPlaceholders[placeholder] = { ...att, binding: { ...binding, bones: translated } };
        changed = true;
      }
      outSlots[slot] = outPlaceholders;
    }
    return changed ? { ...skin, attachments: outSlots } : skin;
  }
  function referenceFactor(entry, rig, hostBones, warnings = []) {
    const ref = rig["reference"];
    if (!isObj(ref)) return 1;
    const boneName = typeof ref["bone"] === "string" ? ref["bone"] : "";
    const length = typeof ref["length"] === "number" ? ref["length"] : 0;
    if (!(length > 0)) {
      warnings.push(`RIG_REFERENCE: rig.reference.length de "${entry}" tem de ser > 0; k = 1 (4.8)`);
      return 1;
    }
    const host = hostBones.find((b) => nameOf(b) === boneName);
    const hostLength = host !== void 0 && typeof host["length"] === "number" ? host["length"] : 0;
    if (host === void 0 || hostLength === 0) {
      warnings.push(`RIG_UNMET: o osso "${boneName}" de rig.reference de "${entry}" n\xE3o existe aqui ou tem length 0; k = 1 (2.8)`);
      return 1;
    }
    return hostLength / length;
  }
  function scaleTranslations(animation, k) {
    const timelines = Array.isArray(animation["timelines"]) ? animation["timelines"] : [];
    return {
      ...animation,
      timelines: timelines.map((tl) => {
        if (!isObj(tl) || tl["type"] !== "bone" || tl["property"] !== "x" && tl["property"] !== "y") return tl;
        const keys = Array.isArray(tl["keys"]) ? tl["keys"] : [];
        return {
          ...tl,
          keys: keys.map((key) => {
            if (!isObj(key)) return key;
            const out = { ...key };
            if (typeof key["value"] === "number") out["value"] = key["value"] * k;
            const curve = key["curve"];
            if (Array.isArray(curve)) {
              out["curve"] = curve.map((c, i) => typeof c === "number" && i % 2 === 1 ? c * k : c);
            }
            return out;
          })
        };
      })
    };
  }

  // runtime/src/binario/ler.ts
  var MAGIC = [137, 66, 79, 78, 69, 13, 10, 26];
  var SUPPORTED_LAYOUT_VERSION = 1;
  var ALIGN = 16;
  var HEADER_SIZE = 32;
  var SECTION_ENTRY_SIZE = 24;
  var MAX_TREE_DEPTH = 64;
  var T_NULL = 0;
  var T_FALSE = 1;
  var T_TRUE = 2;
  var T_INT = 3;
  var T_FLOAT = 4;
  var T_DOUBLE = 5;
  var T_STRING = 6;
  var T_ARRAY = 7;
  var T_OBJECT = 8;
  var T_F32_ARRAY = 9;
  var T_U32_ARRAY = 10;
  var T_I32_ARRAY = 11;
  var T_U16_ARRAY = 12;
  var T_U8_ARRAY = 13;
  var T_BLOB_REF = 14;
  var T_INT64 = 15;
  var BLOB_F32 = 1;
  var BLOB_U32 = 2;
  var BLOB_I32 = 3;
  var BLOB_U16 = 4;
  var BLOB_U8 = 5;
  var BLOB_TKEY = 16;
  var BLOB_BIND = 17;
  var BLOB_VERT = 18;
  var UNKNOWN = Symbol("boneb.desconhecido");
  var BonebReadError = class extends Error {
    constructor(code, message) {
      super(message);
      __publicField(this, "code");
      this.name = "BonebReadError";
      this.code = code;
    }
  };
  var utf8 = new TextDecoder("utf-8", { fatal: true });
  function u32ToTag(value) {
    let out = "";
    for (let i = 0; i < 4; i++) out += String.fromCharCode(value >>> 8 * i & 255);
    return out;
  }
  function fail(code, message) {
    throw new BonebReadError(code, message);
  }
  var Decoder = class {
    constructor(bytes) {
      __publicField(this, "bytes");
      __publicField(this, "view");
      __publicField(this, "strings", []);
      __publicField(this, "blobHeaders", []);
      __publicField(this, "blobBase", 0);
      __publicField(this, "blobCache", []);
      __publicField(this, "blobDone", []);
      __publicField(this, "treeEnd", 0);
      __publicField(this, "pos", 0);
      __publicField(this, "warnings", []);
      __publicField(this, "warned", /* @__PURE__ */ new Set());
      this.bytes = bytes;
      this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    }
    warn(message) {
      if (this.warned.has(message)) return;
      this.warned.add(message);
      this.warnings.push(message);
    }
    f32At(at) {
      const value = this.view.getFloat32(at, true);
      if (Number.isFinite(value)) return value;
      this.warn("Havia NaN ou Infinity em um n\xFAmero; virou 0 (12.6).");
      return 0;
    }
    // -- string table (spec 11.4) --------------------------------------------
    decodeStrings(offset, length) {
      if (length < 8) fail("BIN_STRS", "Se\xE7\xE3o STRS curta demais.");
      const count = this.view.getUint32(offset, true);
      const tableSize = 4 + 4 * (count + 1);
      if (count > length || tableSize > length) fail("BIN_STRS", "Se\xE7\xE3o STRS com contagem imposs\xEDvel.");
      const dataStart = offset + tableSize;
      const dataLength = length - tableSize;
      const offsets = new Array(count + 1);
      let previous = -1;
      for (let i = 0; i <= count; i++) {
        const value = this.view.getUint32(offset + 4 + 4 * i, true);
        if (value < previous) fail("BIN_STRS", "Offsets de STRS fora de ordem.");
        if (value > dataLength) fail("BIN_STRS", "Offset de STRS fora da se\xE7\xE3o.");
        offsets[i] = value;
        previous = value;
      }
      if (offsets[0] !== 0) fail("BIN_STRS", "O primeiro offset de STRS tem que ser 0.");
      if (offsets[count] !== dataLength) fail("BIN_STRS", "O \xFAltimo offset de STRS n\xE3o bate com o tamanho.");
      this.strings = new Array(count);
      for (let i = 0; i < count; i++) {
        const slice = this.bytes.subarray(dataStart + offsets[i], dataStart + offsets[i + 1]);
        for (let k = 0; k < slice.length; k++) {
          if (slice[k] === 0) fail("BIN_STRS", "Texto com byte NUL na tabela de strings.");
        }
        try {
          this.strings[i] = utf8.decode(slice);
        } catch {
          fail("BIN_STRS", "Texto que n\xE3o \xE9 UTF-8 v\xE1lido na tabela de strings.");
        }
      }
      if (count > 0 && this.strings[0] !== "") {
        fail("BIN_STRS", "O \xEDndice 0 da tabela de strings tem que ser o texto vazio.");
      }
    }
    stringAt(index) {
      if (index >= this.strings.length) {
        fail("BIN_STRING_INDEX", `\xCDndice de texto ${index} fora da tabela (${this.strings.length}).`);
      }
      return this.strings[index];
    }
    // -- blob section (spec 11.6) --------------------------------------------
    decodeBlobHeaders(offset, length) {
      if (length < 4) fail("BIN_BLOB", "Se\xE7\xE3o BLOB curta demais.");
      const count = this.view.getUint32(offset, true);
      const tableSize = 4 + count * 24;
      if (count > length / 24 + 1 || tableSize > length) fail("BIN_BLOB", "Se\xE7\xE3o BLOB com contagem imposs\xEDvel.");
      this.blobBase = offset;
      this.blobHeaders = new Array(count);
      for (let i = 0; i < count; i++) {
        const at = offset + 4 + i * 24;
        const kind = this.view.getUint32(at, true);
        const elemCount = this.view.getUint32(at + 4, true);
        const blobOffset = Number(this.view.getBigUint64(at + 8, true));
        const byteLength = Number(this.view.getBigUint64(at + 16, true));
        if (blobOffset % ALIGN !== 0) fail("BIN_BLOB", `Bloco ${i} n\xE3o come\xE7a em m\xFAltiplo de 16.`);
        if (blobOffset + byteLength > length) fail("BIN_BLOB", `Bloco ${i} sai da se\xE7\xE3o BLOB.`);
        this.blobHeaders[i] = { kind, elemCount, offset: blobOffset, byteLength };
      }
      this.blobCache = new Array(count);
      this.blobDone = new Array(count).fill(false);
    }
    numbersFromBlock(header, size, read) {
      if (header.elemCount * size > header.byteLength) {
        fail("BIN_BLOB_SIZE", "Bloco num\xE9rico menor do que a contagem declarada.");
      }
      const base = this.blobBase + header.offset;
      const out = new Array(header.elemCount);
      for (let i = 0; i < header.elemCount; i++) out[i] = read(base + i * size);
      return out;
    }
    decodeTkey(header) {
      const base = this.blobBase + header.offset;
      if (header.byteLength < 12) fail("BIN_BLOB_SIZE", "Bloco TKEY curto demais.");
      const keyCount = this.view.getUint32(base, true);
      const components = this.view.getUint32(base + 4, true);
      const nullable = this.view.getUint32(base + 8, true) !== 0;
      if (keyCount !== header.elemCount) {
        fail("BIN_BLOB_SIZE", "Bloco TKEY com elemCount diferente de keyCount (11.5).");
      }
      if (components < 1 || components > 16) fail("BIN_BLOB_SIZE", "Bloco TKEY com n\xFAmero de componentes fora de 1..16.");
      let at = 12;
      const timesAt = at;
      at += keyCount * 4;
      const valuesAt = at;
      at += keyCount * components * 4;
      const curvesAt = at;
      at += keyCount;
      at += (ALIGN - at % ALIGN) % ALIGN;
      const bezierCountAt = at;
      at += 4;
      if (at > header.byteLength) fail("BIN_BLOB_SIZE", "Bloco TKEY menor do que o layout de 11.6.");
      const bezierCount = this.view.getUint32(base + bezierCountAt, true);
      const bezierAt = at;
      if (bezierAt + bezierCount * 4 * components * 4 > header.byteLength) {
        fail("BIN_BLOB_SIZE", "Bloco TKEY com curvas B\xE9zier fora do tamanho declarado.");
      }
      const keys = new Array(keyCount);
      let bezierUsed = 0;
      for (let i = 0; i < keyCount; i++) {
        const key = { time: this.f32At(base + timesAt + i * 4) };
        const first = this.view.getFloat32(base + valuesAt + i * components * 4, true);
        if (nullable && Number.isNaN(first)) {
          key["value"] = null;
        } else if (components === 1) {
          key["value"] = this.f32At(base + valuesAt + i * 4);
        } else {
          const value = new Array(components);
          for (let c = 0; c < components; c++) {
            value[c] = this.f32At(base + valuesAt + (i * components + c) * 4);
          }
          key["value"] = value;
        }
        const type = this.view.getUint8(base + curvesAt + i);
        if (type === 1) {
          key["curve"] = "stepped";
        } else if (type === 2) {
          if (bezierUsed >= bezierCount) {
            this.warn("Bloco TKEY com menos curvas B\xE9zier do que chaves marcadas; usando linear.");
          } else {
            const curve = new Array(4 * components);
            for (let c = 0; c < 4 * components; c++) {
              curve[c] = this.f32At(base + bezierAt + (bezierUsed * 4 * components + c) * 4);
            }
            key["curve"] = curve;
            bezierUsed += 1;
          }
        }
        keys[i] = key;
      }
      return keys;
    }
    decodeBind(header) {
      const base = this.blobBase + header.offset;
      if (header.byteLength < 8) fail("BIN_BLOB_SIZE", "Bloco BIND curto demais.");
      const vertexCount = this.view.getUint32(base, true);
      const total = this.view.getUint32(base + 4, true);
      if (vertexCount !== header.elemCount) {
        fail("BIN_BLOB_SIZE", "Bloco BIND com elemCount diferente de vertexCount (11.5).");
      }
      let at = 8;
      const countsAt = at;
      at += vertexCount * 4;
      const bonesAt = at;
      at += total * 4;
      at += (ALIGN - at % ALIGN) % ALIGN;
      const positionsAt = at;
      at += total * 8;
      const weightsAt = at;
      at += total * 4;
      if (at > header.byteLength) fail("BIN_BLOB_SIZE", "Bloco BIND menor do que o layout de 11.6.");
      const counts = new Array(vertexCount);
      for (let i = 0; i < vertexCount; i++) counts[i] = this.view.getUint32(base + countsAt + i * 4, true);
      const bones = new Array(total);
      for (let i = 0; i < total; i++) bones[i] = this.view.getUint32(base + bonesAt + i * 4, true);
      const positions = new Array(total * 2);
      for (let i = 0; i < total * 2; i++) positions[i] = this.f32At(base + positionsAt + i * 4);
      const weights = new Array(total);
      for (let i = 0; i < total; i++) weights[i] = this.f32At(base + weightsAt + i * 4);
      return { counts, bones, positions, weights };
    }
    blob(index) {
      if (index >= this.blobHeaders.length) {
        fail("BIN_BLOB_INDEX", `Refer\xEAncia a bloco ${index}, mas h\xE1 ${this.blobHeaders.length} blocos.`);
      }
      if (this.blobDone[index]) return this.blobCache[index];
      const header = this.blobHeaders[index];
      let value;
      switch (header.kind) {
        case BLOB_F32:
        case BLOB_VERT:
          value = this.numbersFromBlock(header, 4, (at) => this.f32At(at));
          break;
        case BLOB_U32:
          value = this.numbersFromBlock(header, 4, (at) => this.view.getUint32(at, true));
          break;
        case BLOB_I32:
          value = this.numbersFromBlock(header, 4, (at) => this.view.getInt32(at, true));
          break;
        case BLOB_U16:
          value = this.numbersFromBlock(header, 2, (at) => this.view.getUint16(at, true));
          break;
        case BLOB_U8:
          value = this.numbersFromBlock(header, 1, (at) => this.view.getUint8(at));
          break;
        case BLOB_TKEY:
          value = this.decodeTkey(header);
          break;
        case BLOB_BIND:
          value = this.decodeBind(header);
          break;
        default:
          this.warn(`Bloco de tipo ${header.kind} \xE9 desconhecido; foi pulado (11.6).`);
          value = UNKNOWN;
      }
      this.blobCache[index] = value;
      this.blobDone[index] = true;
      return value;
    }
    // -- tree (spec 11.5) -----------------------------------------------------
    need(count) {
      if (this.pos + count > this.treeEnd) {
        fail("BIN_TREE_TRUNCATED", "A se\xE7\xE3o TREE acaba no meio de um valor.");
      }
    }
    countFits(count, size) {
      if (count * size > this.treeEnd - this.pos) {
        fail("BIN_TREE_COUNT", "Contagem maior do que o resto da se\xE7\xE3o TREE.");
      }
    }
    readValue(depth) {
      if (depth > MAX_TREE_DEPTH) fail("LIMIT_DEPTH", `\xC1rvore com mais de ${MAX_TREE_DEPTH} n\xEDveis (12.6).`);
      this.need(1);
      const type = this.view.getUint8(this.pos);
      this.pos += 1;
      switch (type) {
        case T_NULL:
          return null;
        case T_FALSE:
          return false;
        case T_TRUE:
          return true;
        case T_INT: {
          this.need(4);
          const value = this.view.getInt32(this.pos, true);
          this.pos += 4;
          return value;
        }
        case T_FLOAT: {
          this.need(4);
          const value = this.f32At(this.pos);
          this.pos += 4;
          return value;
        }
        case T_DOUBLE: {
          this.need(8);
          const value = this.view.getFloat64(this.pos, true);
          this.pos += 8;
          if (!Number.isFinite(value)) {
            this.warn("Havia NaN ou Infinity em um n\xFAmero; virou 0 (12.6).");
            return 0;
          }
          return value;
        }
        case T_INT64: {
          this.need(8);
          const value = this.view.getBigInt64(this.pos, true);
          this.pos += 8;
          const asNumber = Number(value);
          if (!Number.isSafeInteger(asNumber)) {
            this.warn("Inteiro de 64 bits grande demais para um n\xFAmero JSON; foi arredondado.");
          }
          return asNumber;
        }
        case T_STRING: {
          this.need(4);
          const index = this.view.getUint32(this.pos, true);
          this.pos += 4;
          return this.stringAt(index);
        }
        case T_ARRAY: {
          this.need(4);
          const count = this.view.getUint32(this.pos, true);
          this.pos += 4;
          this.countFits(count, 1);
          const out = new Array(count);
          for (let i = 0; i < count; i++) {
            const value = this.readValue(depth + 1);
            out[i] = value === UNKNOWN ? null : value;
          }
          return out;
        }
        case T_OBJECT: {
          this.need(4);
          const count = this.view.getUint32(this.pos, true);
          this.pos += 4;
          this.countFits(count, 5);
          const out = {};
          for (let i = 0; i < count; i++) {
            this.need(4);
            const keyIndex = this.view.getUint32(this.pos, true);
            this.pos += 4;
            const key = this.stringAt(keyIndex);
            const value = this.readValue(depth + 1);
            if (value === UNKNOWN) {
              this.warn(`A propriedade "${key}" usa um tipo desconhecido e foi pulada (11.9).`);
              continue;
            }
            out[key] = value;
          }
          return out;
        }
        case T_F32_ARRAY:
          return this.typedArray(4, (at) => this.f32At(at));
        case T_U32_ARRAY:
          return this.typedArray(4, (at) => this.view.getUint32(at, true));
        case T_I32_ARRAY:
          return this.typedArray(4, (at) => this.view.getInt32(at, true));
        case T_U16_ARRAY:
          return this.typedArray(2, (at) => this.view.getUint16(at, true));
        case T_U8_ARRAY:
          return this.typedArray(1, (at) => this.view.getUint8(at));
        case T_BLOB_REF: {
          this.need(4);
          const index = this.view.getUint32(this.pos, true);
          this.pos += 4;
          if (this.blobHeaders.length === 0) {
            fail("BIN_BLOB_INDEX", "A \xE1rvore cita um bloco, mas o arquivo n\xE3o tem se\xE7\xE3o BLOB (11.5).");
          }
          return this.blob(index);
        }
        default:
          if (type >= 16 && type <= 31) {
            fail("BIN_TREE_TYPE_RESERVED", `Tipo 0x${type.toString(16)} \xE9 reservado: o arquivo usa um layout mais novo (11.5).`);
          }
          this.need(4);
          {
            const byteLength = this.view.getUint32(this.pos, true);
            this.pos += 4;
            this.need(byteLength);
            this.pos += byteLength;
          }
          this.warn(`Valor de tipo 0x${type.toString(16)} \xE9 desconhecido e foi pulado (11.5).`);
          return UNKNOWN;
      }
    }
    typedArray(size, read) {
      this.need(4);
      const count = this.view.getUint32(this.pos, true);
      this.pos += 4;
      this.countFits(count, size);
      const out = new Array(count);
      for (let i = 0; i < count; i++) out[i] = read(this.pos + i * size);
      this.pos += count * size;
      return out;
    }
    decodeTree(offset, length) {
      this.pos = offset;
      this.treeEnd = offset + length;
      this.need(1);
      if (this.view.getUint8(this.pos) !== T_OBJECT) {
        fail("BIN_ROOT_TYPE", "O valor raiz da se\xE7\xE3o TREE tem que ser um objeto (11.5).");
      }
      const value = this.readValue(0);
      return value;
    }
    decodeIndex(offset, length) {
      if (length < 4) return [];
      const count = this.view.getUint32(offset, true);
      if (4 + count * 24 > length) {
        this.warn("Se\xE7\xE3o INDX com contagem imposs\xEDvel; foi ignorada.");
        return [];
      }
      const out = [];
      for (let i = 0; i < count; i++) {
        const at = offset + 4 + i * 24;
        out.push({
          kind: this.view.getUint32(at, true),
          name: this.stringAt(this.view.getUint32(at + 4, true)),
          offset: Number(this.view.getBigUint64(at + 8, true)),
          length: Number(this.view.getBigUint64(at + 16, true))
        });
      }
      return out;
    }
  };
  function readBoneb(bytes, options = {}) {
    return readBonebWithReport(bytes, options).value;
  }
  function readBonebWithReport(bytes, options = {}) {
    const maxFileSize = options.maxFileSize ?? 1024 * 1024 * 1024;
    if (bytes.length < HEADER_SIZE) fail("BIN_MAGIC", "Arquivo curto demais para ser um .boneb.");
    for (let i = 0; i < MAGIC.length; i++) {
      if (bytes[i] !== MAGIC[i]) fail("BIN_MAGIC", "Assinatura do arquivo n\xE3o \xE9 .boneb (11.3).");
    }
    if (bytes.length > maxFileSize) {
      fail("LIMIT_FILE_SIZE", `Arquivo com ${bytes.length} bytes, acima do limite de ${maxFileSize} (12.6).`);
    }
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const layoutVersion = view.getUint16(8, true);
    if (layoutVersion > SUPPORTED_LAYOUT_VERSION) {
      fail(
        "BIN_LAYOUT_VERSION",
        `Layout bin\xE1rio ${layoutVersion}; este leitor entende at\xE9 ${SUPPORTED_LAYOUT_VERSION} (11.3).`
      );
    }
    const flags = view.getUint16(10, true);
    const formatMajor = view.getUint16(12, true);
    const formatMinor = view.getUint16(14, true);
    const minMajor = view.getUint16(16, true);
    const minMinor = view.getUint16(18, true);
    const sectionCount = view.getUint32(20, true);
    const fileSize = Number(view.getBigUint64(24, true));
    if (fileSize !== bytes.length) {
      fail("BIN_FILE_SIZE", `O cabe\xE7alho diz ${fileSize} bytes, mas o arquivo tem ${bytes.length} (11.3).`);
    }
    const tableEnd = HEADER_SIZE + sectionCount * SECTION_ENTRY_SIZE;
    if (sectionCount > (bytes.length - HEADER_SIZE) / SECTION_ENTRY_SIZE || tableEnd > bytes.length) {
      fail("BIN_SECTION_TABLE", "Tabela de se\xE7\xF5es n\xE3o cabe no arquivo (11.4).");
    }
    const sections = [];
    const seen = /* @__PURE__ */ new Set();
    const ranges = [];
    for (let i = 0; i < sectionCount; i++) {
      const at = HEADER_SIZE + i * SECTION_ENTRY_SIZE;
      const tag = u32ToTag(view.getUint32(at, true));
      const offset = Number(view.getBigUint64(at + 8, true));
      const length = Number(view.getBigUint64(at + 16, true));
      if (offset % ALIGN !== 0) fail("BIN_SECTION_ALIGN", `Se\xE7\xE3o "${tag}" n\xE3o come\xE7a em m\xFAltiplo de 16 (11.2).`);
      if (offset < tableEnd || offset + length > fileSize) {
        fail("BIN_SECTION_RANGE", `Se\xE7\xE3o "${tag}" sai do arquivo (11.4).`);
      }
      if (seen.has(tag)) fail("BIN_SECTION_DUPLICATE", `Se\xE7\xE3o "${tag}" aparece duas vezes (11.4).`);
      seen.add(tag);
      for (const [start, end] of ranges) {
        if (offset < end && start < offset + length) {
          fail("BIN_SECTION_OVERLAP", `Se\xE7\xE3o "${tag}" se sobrep\xF5e a outra (11.4).`);
        }
      }
      if (length > 0) ranges.push([offset, offset + length]);
      sections.push({ tag, offset, length, bytes: bytes.subarray(offset, offset + length) });
    }
    const find = (tag) => sections.find((s) => s.tag === tag);
    const strs = find("STRS");
    const tree = find("TREE");
    if (!strs) fail("BIN_SECTION_MISSING", "Falta a se\xE7\xE3o STRS, que \xE9 obrigat\xF3ria (11.4).");
    if (!tree) fail("BIN_SECTION_MISSING", "Falta a se\xE7\xE3o TREE, que \xE9 obrigat\xF3ria (11.4).");
    const decoder2 = new Decoder(bytes);
    decoder2.decodeStrings(strs.offset, strs.length);
    const blob = find("BLOB");
    if (blob) decoder2.decodeBlobHeaders(blob.offset, blob.length);
    const value = decoder2.decodeTree(tree.offset, tree.length);
    const indexSection = find("INDX");
    const index = indexSection ? decoder2.decodeIndex(indexSection.offset, indexSection.length) : [];
    if (indexSection && (flags & 1) === 0) {
      decoder2.warnings.push("O cabe\xE7alho n\xE3o marca o bit de INDX, mas a se\xE7\xE3o existe (11.3).");
    }
    const known = /* @__PURE__ */ new Set(["STRS", "TREE", "BLOB", "INDX", "JSON"]);
    const unknownSections = sections.filter((section) => !known.has(section.tag));
    for (const section of unknownSections) {
      decoder2.warnings.push(`Se\xE7\xE3o "${section.tag}" \xE9 desconhecida; foi pulada e preservada (11.4).`);
    }
    const header = isRecord(value["bone"]) ? value["bone"] : void 0;
    const headerVersion = `${formatMajor}.${formatMinor}`;
    if (header && typeof header["version"] === "string" && header["version"] !== headerVersion) {
      decoder2.warnings.push(
        `O cabe\xE7alho bin\xE1rio diz vers\xE3o ${headerVersion} e a \xE1rvore diz ${header["version"]}; vale a \xE1rvore (11.3).`
      );
    }
    return {
      value,
      header: {
        layoutVersion,
        flags,
        formatVersion: headerVersion,
        minVersion: `${minMajor}.${minMinor}`,
        sectionCount,
        fileSize
      },
      unknownSections,
      index,
      warnings: decoder2.warnings
    };
  }
  function isRecord(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value);
  }

  // runtime/src/binario/bonez.ts
  var BONEZ_MIMETYPE = "application/vnd.bone+zip";
  var BONEZ_MIMETYPE_ENTRY = "mimetype";
  var BONEZ_MANIFEST_ENTRY = "manifest.json";
  var SIG_LOCAL = 67324752;
  var SIG_CENTRAL = 33639248;
  var SIG_EOCD = 101010256;
  var SIG_ZIP64_EOCD = 101075792;
  var SIG_ZIP64_LOCATOR = 117853008;
  var METHOD_STORE = 0;
  var METHOD_DEFLATE = 8;
  var FLAG_DATA_DESCRIPTOR = 1 << 3;
  var FLAG_UTF8 = 1 << 11;
  var BONEZ_MAX_ENTRIES = 65535;
  var BONEZ_MAX_TOTAL_UNCOMPRESSED = 4 * 1024 * 1024 * 1024;
  var BONEZ_MAX_RATIO = 200;
  var RATIO_FLOOR = 1024;
  var MAX_NAME_LENGTH = 1024;
  var BonezError = class extends Error {
    constructor(code, message) {
      super(message);
      __publicField(this, "code");
      this.name = "BonezError";
      this.code = code;
    }
  };
  function fail2(code, message) {
    throw new BonezError(code, message);
  }
  var crcTable = null;
  function getCrcTable() {
    if (crcTable) return crcTable;
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let value = i;
      for (let bit = 0; bit < 8; bit++) {
        value = value & 1 ? 3988292384 ^ value >>> 1 : value >>> 1;
      }
      table[i] = value >>> 0;
    }
    crcTable = table;
    return table;
  }
  function crc32(data) {
    const table = getCrcTable();
    let crc = 4294967295;
    for (let i = 0; i < data.length; i++) {
      crc = crc >>> 8 ^ table[(crc ^ data[i]) & 255];
    }
    return (crc ^ 4294967295) >>> 0;
  }
  var ENCODED_RESERVED = ["%2f", "%5c", "%00", "%3a"];
  function checkEntryName(name) {
    if (name.length === 0) return "Nome de entrada vazio.";
    if ([...name].length > MAX_NAME_LENGTH) {
      return `Nome de entrada com mais de ${MAX_NAME_LENGTH} caracteres.`;
    }
    for (let i = 0; i < name.length; i++) {
      const code = name.charCodeAt(i);
      if (code < 32 || code === 127) return "Nome de entrada com caractere de controle.";
    }
    if (name.includes("\\")) return 'Nome de entrada com barra invertida. Use apenas "/".';
    if (name.includes(":")) return "Nome de entrada com dois-pontos, que \xE9 proibido em qualquer posi\xE7\xE3o.";
    if (name.startsWith("/")) return "Nome de entrada absoluto. S\xF3 caminho relativo.";
    if (name.includes("..")) return 'Nome de entrada com "..", que \xE9 proibido (path traversal).';
    const lower = name.toLowerCase();
    for (const bad of ENCODED_RESERVED) {
      if (lower.includes(bad)) return `Nome de entrada com "${bad}" codificado, que \xE9 proibido.`;
    }
    for (const segment of name.split("/")) {
      if (segment.length === 0) return "Nome de entrada com segmento vazio.";
      if (segment === ".") return 'Nome de entrada com segmento ".", que \xE9 proibido.';
    }
    return null;
  }
  var textEncoder = new TextEncoder();
  var textDecoder = new TextDecoder("utf-8");
  function findEocd(view, size) {
    const lowest = Math.max(0, size - 22 - 65535);
    for (let at = size - 22; at >= lowest; at--) {
      if (view.getUint32(at, true) === SIG_EOCD) return at;
    }
    fail2("ZIP_EOCD", "N\xE3o achei o fim do diret\xF3rio central: n\xE3o parece um ZIP.");
  }
  function readZip64Extra(extra, entry) {
    const view = new DataView(extra.buffer, extra.byteOffset, extra.byteLength);
    let at = 0;
    while (at + 4 <= extra.length) {
      const id = view.getUint16(at, true);
      const size = view.getUint16(at + 2, true);
      if (at + 4 + size > extra.length) return;
      if (id === 1) {
        let field = at + 4;
        const rest = () => field + 8 <= at + 4 + size;
        if (entry.uncompressedSize === 4294967295 && rest()) {
          entry.uncompressedSize = Number(view.getBigUint64(field, true));
          field += 8;
        }
        if (entry.compressedSize === 4294967295 && rest()) {
          entry.compressedSize = Number(view.getBigUint64(field, true));
          field += 8;
        }
        if (entry.localOffset === 4294967295 && rest()) {
          entry.localOffset = Number(view.getBigUint64(field, true));
          field += 8;
        }
        return;
      }
      at += 4 + size;
    }
  }
  function readBonez(bytes, codec = {}, options = {}) {
    const maxEntries = options.maxEntries ?? BONEZ_MAX_ENTRIES;
    const maxTotal = options.maxTotalUncompressed ?? BONEZ_MAX_TOTAL_UNCOMPRESSED;
    const maxRatio = options.maxRatio ?? BONEZ_MAX_RATIO;
    const warnings = [];
    if (bytes.length < 22) fail2("ZIP_EOCD", "Arquivo curto demais para ser um ZIP.");
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const head = textDecoder.decode(bytes.subarray(30, 38));
    const mime = textDecoder.decode(bytes.subarray(38, 38 + BONEZ_MIMETYPE.length));
    if (view.getUint32(0, true) !== SIG_LOCAL || head !== BONEZ_MIMETYPE_ENTRY || mime !== BONEZ_MIMETYPE) {
      fail2("ZIP_MIMETYPE", 'A primeira entrada n\xE3o \xE9 o "mimetype" exigido por 2.9.');
    }
    const eocd = findEocd(view, bytes.length);
    let entryCount = view.getUint16(eocd + 10, true);
    let centralSize = view.getUint32(eocd + 12, true);
    let centralOffset = view.getUint32(eocd + 16, true);
    if (entryCount === 65535 || centralSize === 4294967295 || centralOffset === 4294967295) {
      const locator = eocd - 20;
      if (locator < 0 || view.getUint32(locator, true) !== SIG_ZIP64_LOCATOR) {
        fail2("ZIP_ZIP64", "O ZIP diz que \xE9 ZIP64, mas n\xE3o achei o localizador.");
      }
      const zip64At = Number(view.getBigUint64(locator + 8, true));
      if (zip64At < 0 || zip64At + 56 > bytes.length || view.getUint32(zip64At, true) !== SIG_ZIP64_EOCD) {
        fail2("ZIP_ZIP64", "Registro ZIP64 de fim de diret\xF3rio inv\xE1lido.");
      }
      entryCount = Number(view.getBigUint64(zip64At + 32, true));
      centralSize = Number(view.getBigUint64(zip64At + 40, true));
      centralOffset = Number(view.getBigUint64(zip64At + 48, true));
    }
    if (entryCount > maxEntries) {
      fail2("LIMIT_ZIP_ENTRIES", `Pacote com ${entryCount} entradas, acima do limite de ${maxEntries} (12.6).`);
    }
    if (centralOffset + centralSize > bytes.length) {
      fail2("ZIP_CENTRAL", "Diret\xF3rio central fora do arquivo.");
    }
    const entries = [];
    const byName = /* @__PURE__ */ new Map();
    let totalUncompressed = 0;
    let at = centralOffset;
    for (let i = 0; i < entryCount; i++) {
      if (at + 46 > centralOffset + centralSize) fail2("ZIP_CENTRAL", "Diret\xF3rio central acaba no meio de uma entrada.");
      if (view.getUint32(at, true) !== SIG_CENTRAL) fail2("ZIP_CENTRAL", "Assinatura errada no diret\xF3rio central.");
      const flags = view.getUint16(at + 8, true);
      const method = view.getUint16(at + 10, true);
      const crc = view.getUint32(at + 16, true);
      const nameLength = view.getUint16(at + 28, true);
      const extraLength = view.getUint16(at + 30, true);
      const commentLength = view.getUint16(at + 32, true);
      const sizes = {
        compressedSize: view.getUint32(at + 20, true),
        uncompressedSize: view.getUint32(at + 24, true),
        localOffset: view.getUint32(at + 42, true)
      };
      const nameAt = at + 46;
      if (nameAt + nameLength + extraLength + commentLength > centralOffset + centralSize) {
        fail2("ZIP_CENTRAL", "Nome ou extra fora do diret\xF3rio central.");
      }
      const nameBytes = bytes.subarray(nameAt, nameAt + nameLength);
      if (extraLength > 0) {
        readZip64Extra(bytes.subarray(nameAt + nameLength, nameAt + nameLength + extraLength), sizes);
      }
      at = nameAt + nameLength + extraLength + commentLength;
      if ((flags & FLAG_UTF8) === 0) {
        for (const byte of nameBytes) {
          if (byte > 127) {
            warnings.push("Entrada com nome fora do ASCII sem a marca de UTF-8; li como UTF-8 mesmo assim.");
            break;
          }
        }
      }
      const name = textDecoder.decode(nameBytes);
      if (name.endsWith("/")) continue;
      const problem = checkEntryName(name);
      if (problem) fail2("URI_INVALID", `Entrada "${name}": ${problem}`);
      if (name !== name.normalize("NFC")) {
        warnings.push(`Entrada "${name}" n\xE3o est\xE1 na forma NFC (2.9).`);
      }
      if (method !== METHOD_STORE && method !== METHOD_DEFLATE) {
        fail2("ZIP_METHOD", `Entrada "${name}" usa o m\xE9todo ${method}; s\xF3 Store e Deflate s\xE3o v\xE1lidos (2.9).`);
      }
      if (byName.has(name)) {
        fail2("ZIP_DUPLICATE_ENTRY", `A entrada "${name}" aparece duas vezes (2.9).`);
      }
      totalUncompressed += sizes.uncompressedSize;
      if (totalUncompressed > maxTotal) {
        fail2("LIMIT_ZIP_TOTAL", `O pacote descompactado passaria de ${maxTotal} bytes (12.6).`);
      }
      if (sizes.uncompressedSize > RATIO_FLOOR && sizes.compressedSize > 0) {
        const ratio = sizes.uncompressedSize / sizes.compressedSize;
        if (ratio > maxRatio) {
          fail2(
            "LIMIT_ZIP_RATIO",
            `A entrada "${name}" infla ${Math.round(ratio)} vezes, acima do limite de ${maxRatio}:1 (12.6).`
          );
        }
      }
      const entry = {
        name,
        method,
        crc32: crc,
        compressedSize: sizes.compressedSize,
        uncompressedSize: sizes.uncompressedSize,
        flags,
        localOffset: sizes.localOffset,
        nameBytes
      };
      entries.push(entry);
      byName.set(name, entry);
    }
    const cache = /* @__PURE__ */ new Map();
    function readEntry(name) {
      const cached = cache.get(name);
      if (cached) return cached;
      const entry = byName.get(name);
      if (!entry) return void 0;
      const local = entry.localOffset;
      if (local + 30 > bytes.length || view.getUint32(local, true) !== SIG_LOCAL) {
        fail2("ZIP_LOCAL", `Cabe\xE7alho local da entrada "${name}" inv\xE1lido.`);
      }
      const localFlags = view.getUint16(local + 6, true);
      const localNameLength = view.getUint16(local + 26, true);
      const localExtraLength = view.getUint16(local + 28, true);
      const localNameAt = local + 30;
      if (localNameAt + localNameLength > bytes.length) {
        fail2("ZIP_LOCAL", `Nome da entrada "${name}" fora do arquivo.`);
      }
      const localName = bytes.subarray(localNameAt, localNameAt + localNameLength);
      if (localName.length !== entry.nameBytes.length) {
        fail2("ZIP_LOCAL", `A entrada "${name}" tem nomes diferentes no cabe\xE7alho local e no diret\xF3rio central.`);
      }
      for (let i = 0; i < localName.length; i++) {
        if (localName[i] !== entry.nameBytes[i]) {
          fail2("ZIP_LOCAL", `A entrada "${name}" tem nomes diferentes no cabe\xE7alho local e no diret\xF3rio central.`);
        }
      }
      if ((localFlags & FLAG_DATA_DESCRIPTOR) === 0) {
        const localCrc = view.getUint32(local + 14, true);
        const localCompressed = view.getUint32(local + 18, true);
        if (localCrc !== entry.crc32 && localCrc !== 0) {
          fail2("ZIP_LOCAL", `A entrada "${name}" tem CRC diferente no cabe\xE7alho local e no diret\xF3rio central.`);
        }
        if (localCompressed !== 4294967295 && localCompressed !== entry.compressedSize && localCompressed !== 0) {
          fail2("ZIP_LOCAL", `A entrada "${name}" tem tamanho diferente no cabe\xE7alho local e no diret\xF3rio central.`);
        }
      }
      const dataAt = localNameAt + localNameLength + localExtraLength;
      if (dataAt + entry.compressedSize > bytes.length) {
        fail2("ZIP_LOCAL", `Os dados da entrada "${name}" saem do arquivo.`);
      }
      const payload = bytes.subarray(dataAt, dataAt + entry.compressedSize);
      let data;
      if (entry.method === METHOD_STORE) {
        data = payload.slice();
      } else {
        if (!codec.inflateRaw) {
          fail2("ZIP_NO_CODEC", `A entrada "${name}" est\xE1 comprimida e nenhum descompactador foi fornecido.`);
        }
        data = codec.inflateRaw(payload, entry.uncompressedSize);
      }
      if (data.length !== entry.uncompressedSize) {
        fail2("ZIP_SIZE", `A entrada "${name}" descompactou ${data.length} bytes em vez de ${entry.uncompressedSize}.`);
      }
      if (crc32(data) !== entry.crc32) {
        fail2("ZIP_CRC", `A entrada "${name}" n\xE3o bate com o CRC gravado: o arquivo est\xE1 corrompido.`);
      }
      cache.set(name, data);
      return data;
    }
    const manifestBytes = readEntry(BONEZ_MANIFEST_ENTRY);
    if (!manifestBytes) fail2("ZIP_MANIFEST", 'Falta a entrada "manifest.json" (2.9).');
    let manifest;
    try {
      manifest = JSON.parse(textDecoder.decode(manifestBytes));
    } catch {
      fail2("ZIP_MANIFEST", 'O "manifest.json" n\xE3o \xE9 JSON v\xE1lido.');
    }
    if (!manifest || typeof manifest !== "object" || typeof manifest.main !== "string") {
      fail2("ZIP_MANIFEST", 'O "manifest.json" precisa de "main" com o nome do arquivo principal (2.9).');
    }
    const mainProblem = checkEntryName(manifest.main);
    if (mainProblem) fail2("URI_INVALID", `"main" do manifesto: ${mainProblem}`);
    if (!byName.has(manifest.main)) {
      fail2("ZIP_MANIFEST", `O manifesto aponta para "${manifest.main}", que n\xE3o est\xE1 no pacote.`);
    }
    if (!manifest.bonez || typeof manifest.bonez.version !== "string") {
      warnings.push('O manifesto n\xE3o traz "bonez.version" (2.9).');
    }
    const listed = /* @__PURE__ */ new Set([manifest.main]);
    for (const list of [manifest.skeletons, manifest.atlases, manifest.images, manifest.audio]) {
      for (const item of list ?? []) listed.add(item);
    }
    for (const entry of entries) {
      if (entry.name === BONEZ_MIMETYPE_ENTRY || entry.name === BONEZ_MANIFEST_ENTRY) continue;
      if (!listed.has(entry.name)) {
        warnings.push(`A entrada "${entry.name}" n\xE3o est\xE1 listada no manifesto (ZIP_UNLISTED, L2).`);
      }
    }
    return {
      manifest,
      mainName: manifest.main,
      entries: entries.map((entry) => ({
        name: entry.name,
        method: entry.method,
        compressedSize: entry.compressedSize,
        uncompressedSize: entry.uncompressedSize,
        crc32: entry.crc32
      })),
      names: () => entries.map((entry) => entry.name),
      has: (name) => byName.has(name),
      read: readEntry,
      readMain: () => {
        const data = readEntry(manifest.main);
        if (!data) fail2("ZIP_MANIFEST", `N\xE3o consegui ler "${manifest.main}".`);
        return data;
      },
      warnings
    };
  }
  function decompressionStreamCtor() {
    const ctor = globalThis.DecompressionStream;
    return typeof ctor === "function" ? ctor : null;
  }
  async function inflateRawWithStream(data, expectedSize) {
    const Ctor = decompressionStreamCtor();
    if (Ctor === null) {
      fail2("ZIP_NO_CODEC", "Este ambiente n\xE3o tem DecompressionStream; passe um descompactador em codec.inflateRawAsync.");
    }
    const stream = new Ctor("deflate-raw");
    const writer = stream.writable.getWriter();
    const pump = (async () => {
      await writer.write(data);
      await writer.close();
    })();
    pump.catch(() => {
    });
    const reader = stream.readable.getReader();
    const chunks = [];
    let length = 0;
    const cap = expectedSize > 0 ? expectedSize : Number.MAX_SAFE_INTEGER;
    try {
      for (; ; ) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value === void 0) continue;
        chunks.push(value);
        length += value.length;
        if (length > cap) {
          await reader.cancel();
          fail2("LIMIT_ZIP_RATIO", `Uma entrada inflou mais do que os ${expectedSize} bytes declarados (12.6).`);
        }
      }
    } catch (error) {
      if (error instanceof BonezError) throw error;
      fail2("ZIP_INFLATE", `N\xE3o deu para descompactar uma entrada: ${error.message}`);
    }
    const out = new Uint8Array(length);
    let at = 0;
    for (const chunk of chunks) {
      out.set(chunk, at);
      at += chunk.length;
    }
    return out;
  }
  function scanDeflatedEntries(bytes) {
    const out = [];
    try {
      if (bytes.length < 22) return out;
      const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
      const eocd = findEocd(view, bytes.length);
      let count = view.getUint16(eocd + 10, true);
      let centralOffset = view.getUint32(eocd + 16, true);
      if (count === 65535 || centralOffset === 4294967295) {
        const locator = eocd - 20;
        if (locator < 0 || view.getUint32(locator, true) !== SIG_ZIP64_LOCATOR) return out;
        const at64 = Number(view.getBigUint64(locator + 8, true));
        if (at64 < 0 || at64 + 56 > bytes.length || view.getUint32(at64, true) !== SIG_ZIP64_EOCD) return out;
        count = Number(view.getBigUint64(at64 + 32, true));
        centralOffset = Number(view.getBigUint64(at64 + 48, true));
      }
      let at = centralOffset;
      for (let i = 0; i < count; i++) {
        if (at + 46 > bytes.length || view.getUint32(at, true) !== SIG_CENTRAL) return out;
        const method = view.getUint16(at + 10, true);
        const nameLength = view.getUint16(at + 28, true);
        const extraLength = view.getUint16(at + 30, true);
        const commentLength = view.getUint16(at + 32, true);
        const sizes = {
          compressedSize: view.getUint32(at + 20, true),
          uncompressedSize: view.getUint32(at + 24, true),
          localOffset: view.getUint32(at + 42, true)
        };
        const nameAt = at + 46;
        if (nameAt + nameLength + extraLength + commentLength > bytes.length) return out;
        const name = textDecoder.decode(bytes.subarray(nameAt, nameAt + nameLength));
        if (extraLength > 0) {
          readZip64Extra(bytes.subarray(nameAt + nameLength, nameAt + nameLength + extraLength), sizes);
        }
        at = nameAt + nameLength + extraLength + commentLength;
        if (method !== METHOD_DEFLATE) continue;
        const local = sizes.localOffset;
        if (local + 30 > bytes.length || view.getUint32(local, true) !== SIG_LOCAL) return out;
        const dataAt = local + 30 + view.getUint16(local + 26, true) + view.getUint16(local + 28, true);
        if (dataAt + sizes.compressedSize > bytes.length) return out;
        out.push({
          name,
          payload: bytes.subarray(dataAt, dataAt + sizes.compressedSize),
          uncompressedSize: sizes.uncompressedSize
        });
      }
    } catch {
      return out;
    }
    return out;
  }
  async function readBonezAsync(bytes, codec = {}, options = {}) {
    if (codec.inflateRaw) return readBonez(bytes, codec, options);
    const entries = scanDeflatedEntries(bytes);
    if (entries.length === 0) return readBonez(bytes, codec, options);
    const maxTotal = options.maxTotalUncompressed ?? BONEZ_MAX_TOTAL_UNCOMPRESSED;
    const maxRatio = options.maxRatio ?? BONEZ_MAX_RATIO;
    let total = 0;
    for (const entry of entries) {
      total += entry.uncompressedSize;
      if (total > maxTotal) {
        fail2("LIMIT_ZIP_TOTAL", `O pacote descompactado passaria de ${maxTotal} bytes (12.6).`);
      }
      if (entry.uncompressedSize > RATIO_FLOOR && entry.payload.length > 0) {
        const ratio = entry.uncompressedSize / entry.payload.length;
        if (ratio > maxRatio) {
          fail2(
            "LIMIT_ZIP_RATIO",
            `A entrada "${entry.name}" infla ${Math.round(ratio)} vezes, acima do limite de ${maxRatio}:1 (12.6).`
          );
        }
      }
    }
    const inflate = codec.inflateRawAsync ?? inflateRawWithStream;
    const ready = /* @__PURE__ */ new Map();
    for (const entry of entries) {
      ready.set(entry.payload.byteOffset, await inflate(entry.payload, entry.uncompressedSize));
    }
    return readBonez(bytes, {
      ...codec,
      inflateRaw: (data, expectedSize) => {
        const done = ready.get(data.byteOffset);
        if (done === void 0) {
          fail2("ZIP_NO_CODEC", "Uma entrada comprimida n\xE3o foi descompactada antes da leitura.");
        }
        if (done.length !== expectedSize) {
          fail2("ZIP_SIZE", `Uma entrada descompactou ${done.length} bytes em vez de ${expectedSize}.`);
        }
        return done;
      }
    }, options);
  }

  // runtime/src/file.ts
  var BONEB_SIGNATURE = [137, 66, 79, 78, 69, 13, 10, 26];
  var ZIP_SIGNATURE = [80, 75, 3, 4];
  function startsWith(bytes, signature) {
    if (bytes.length < signature.length) return false;
    for (let i = 0; i < signature.length; i++) {
      if (bytes[i] !== signature[i]) return false;
    }
    return true;
  }
  function detectEncoding(bytes) {
    if (startsWith(bytes, ZIP_SIGNATURE)) return "bonez";
    if (startsWith(bytes, BONEB_SIGNATURE)) return "boneb";
    return "bone";
  }
  var decoder = new TextDecoder("utf-8");
  function loadSkeletonFile(bytes, options = {}) {
    const encoding = detectEncoding(bytes);
    const archive = encoding === "bonez" ? readBonez(bytes, options.codec ?? {}) : null;
    return finishLoad(bytes, encoding, archive, options);
  }
  async function loadSkeletonFileAsync(bytes, options = {}) {
    const encoding = detectEncoding(bytes);
    const archive = encoding === "bonez" ? await readBonezAsync(bytes, options.codec ?? {}) : null;
    return finishLoad(bytes, encoding, archive, options);
  }
  function finishLoad(bytes, encoding, archive, options) {
    const warnings = [];
    const atlases = [...options.atlases ?? []];
    let file;
    const files = options.files;
    const read = archive !== null ? (name) => archive.read(name) : files !== void 0 ? (name) => files(name) ?? void 0 : null;
    const load = { read, options, warnings, missing: [], cache: /* @__PURE__ */ new Map() };
    const mainName = archive !== null ? archive.mainName : "";
    const base = folderOf(mainName);
    if (archive !== null) {
      warnings.push(...archive.warnings);
      file = readEntryAsTree(archive.readMain());
      const base2 = folderOf(archive.mainName);
      for (const name of atlasNamesOf(archive, file)) {
        const entry = archive.read(joinUri(base2, name));
        if (entry === void 0) {
          warnings.push(`O pacote n\xE3o traz o atlas "${name}".`);
          continue;
        }
        try {
          atlases.push(loadAtlas(parseBoneText(decoder.decode(entry))));
        } catch (error) {
          warnings.push(`N\xE3o deu para ler o atlas "${name}": ${messageOf(error)}`);
        }
      }
    } else if (encoding === "boneb") {
      file = readBoneb(bytes);
    } else {
      file = parseBoneText(decoder.decode(bytes));
    }
    const data = loadTree(load, file, base, atlases, [mainName], 0);
    const bodies = read === null ? /* @__PURE__ */ new Map() : loadBodies(load, data, base);
    return { data, encoding, file, atlases, archive, bodies, missingFiles: load.missing, warnings };
  }
  function loadTree(load, tree, base, atlases, chain, depth) {
    const read = load.read;
    let composedTree = tree;
    let externalAnimations;
    const origins = /* @__PURE__ */ new Map();
    const extraWarnings = [];
    if (read !== null) {
      const composed = composeExternals(tree, base, (name) => {
        const bytes = read(name);
        return bytes === void 0 ? null : readEntryAsTree(bytes);
      });
      composedTree = composed.tree;
      externalAnimations = composed.externalAnimations;
      extraWarnings.push(...composed.warnings);
      load.missing.push(...composed.missing);
      for (const [skin, origin] of composed.skinOrigins) {
        origins.set(skin, origin);
        for (const name of origin.atlases) {
          const bytes = read(joinUri(origin.folder, name));
          if (bytes === void 0) {
            extraWarnings.push(`EXTERNAL_MISSING: o atlas "${name}" da pele "${skin}" (${origin.entry}) n\xE3o foi achado`);
            continue;
          }
          try {
            atlases.push(loadAtlas(parseBoneText(decoder.decode(bytes))));
          } catch (error) {
            extraWarnings.push(`N\xE3o deu para ler o atlas "${name}" da pele "${skin}": ${messageOf(error)}`);
          }
        }
      }
    }
    const data = loadSkeletonData(composedTree, { ...load.options, atlases, externalAnimations });
    if (extraWarnings.length > 0) {
      data.warnings.push(...extraWarnings.map((message) => ({ pointer: "/assets", message })));
      for (const w of extraWarnings) if (!load.warnings.includes(w)) load.warnings.push(w);
    }
    if (read !== null) loadNested(load, data, base, origins, chain, depth);
    return data;
  }
  function loadNested(load, data, base, origins, chain, depth) {
    if (load.read === null) return;
    const seen = /* @__PURE__ */ new Set();
    for (const skin of data.skins) {
      const origin = origins.get(skin.name);
      for (const bySlot of skin.attachments.values()) {
        for (const att of bySlot.values()) {
          if (!(att instanceof SkeletonAttachment) || seen.has(att)) continue;
          seen.add(att);
          const entryName = origin === void 0 ? joinUri(base, att.resolvedUri) : joinUri(origin.folder, joinUri(origin.skeletonsBase, att.uri));
          loadOneNested(load, att, entryName, chain, depth);
        }
      }
    }
  }
  function loadOneNested(load, att, entryName, chain, depth) {
    const read = load.read;
    const { options, cache, warnings } = load;
    const refuse = (message) => {
      if (options.strict === true) throw new LoadError("/skins", message);
      if (!warnings.includes(message)) warnings.push(message);
    };
    if (chain.includes(entryName)) {
      refuse(`Ciclo de entidade: "${entryName}" j\xE1 est\xE1 na cadeia ${chain.join(" -> ")} (7.11).`);
      return;
    }
    if (depth + 1 > MAX_NESTED_DEPTH) {
      refuse(`Entidade passou da profundidade m\xE1xima de ${MAX_NESTED_DEPTH} (12.6) em "${entryName}".`);
      return;
    }
    const cached = cache.get(entryName);
    if (cached !== void 0) {
      att.child = cached;
      return;
    }
    const entry = read(entryName);
    if (entry === void 0) {
      load.missing.push(entryName);
      refuse(`O pacote n\xE3o traz a entidade "${entryName}" (7.11).`);
      return;
    }
    let child;
    try {
      child = loadEntry(load, entryName, entry, [...chain, entryName], depth + 1);
    } catch (error) {
      refuse(`N\xE3o deu para ler a entidade "${entryName}": ${messageOf(error)}`);
      return;
    }
    for (const w of child.warnings) warnings.push(`${entryName}: ${w.pointer} ${w.message}`);
    att.child = child;
  }
  function loadEntry(load, entryName, entry, chain, depth) {
    const read = load.read;
    const childBase = folderOf(entryName);
    const tree = readEntryAsTree(entry);
    const childAtlases = [];
    for (const name of atlasNamesOfTree(tree)) {
      const bytes = read(joinUri(childBase, name)) ?? read(name);
      if (bytes === void 0) {
        load.warnings.push(`O pacote n\xE3o traz o atlas "${name}" do esqueleto "${entryName}".`);
        continue;
      }
      childAtlases.push(loadAtlas(parseBoneText(decoder.decode(bytes))));
    }
    const child = loadTree(load, tree, childBase, childAtlases, chain, depth);
    load.cache.set(entryName, child);
    return child;
  }
  function loadBodies(load, data, base) {
    const bodies = /* @__PURE__ */ new Map();
    const read = load.read;
    for (const animation of data.animations) {
      const tl = animation.body;
      if (tl === null) continue;
      for (const key of tl.keys.values) {
        if (key.value === null || key.uri === null || bodies.has(key.value)) continue;
        const entryName = joinUri(base, key.uri);
        const cached = load.cache.get(entryName);
        if (cached !== void 0) {
          bodies.set(key.value, cached);
          continue;
        }
        const entry = read(entryName);
        if (entry === void 0) {
          load.missing.push(entryName);
          const message = `BODY_MISSING: o corpo "${key.value}" da anima\xE7\xE3o "${animation.name}" n\xE3o foi achado; fica o corpo de antes (9.13)`;
          if (!load.warnings.includes(message)) load.warnings.push(message);
          continue;
        }
        try {
          bodies.set(key.value, loadEntry(load, entryName, entry, [entryName], 0));
        } catch (error) {
          load.warnings.push(`N\xE3o deu para ler a base "${key.value}": ${messageOf(error)}`);
        }
      }
    }
    return bodies;
  }
  function atlasNamesOfTree(file) {
    const names = [];
    const assets = file?.assets;
    for (const name of Array.isArray(assets?.atlases) ? assets.atlases : []) {
      if (typeof name === "string" && !names.includes(name)) names.push(name);
    }
    return names;
  }
  function atlasNamesOf(archive, file) {
    const names = atlasNamesOfTree(file);
    for (const name of archive.manifest.atlases ?? []) {
      if (typeof name === "string" && !names.includes(name)) names.push(name);
    }
    return names;
  }
  function readEntryAsTree(entry) {
    if (startsWith(entry, BONEB_SIGNATURE)) return readBoneb(entry);
    return parseBoneText(decoder.decode(entry));
  }
  function folderOf(name) {
    return folderOfEntry(name);
  }
  function messageOf(error) {
    return error instanceof Error ? error.message : String(error);
  }

  // runtime/src/parameters.ts
  var APPLIED_BONE_PROPERTY = {
    x: "ax",
    y: "ay",
    rotation: "arotation",
    scaleX: "ascaleX",
    scaleY: "ascaleY",
    shearX: "ashearX",
    shearY: "ashearY"
  };
  var APPLIED_BONE_INHERIT = {
    inheritRotation: "ainheritRotation",
    inheritScale: "ainheritScale",
    inheritReflection: "ainheritReflection"
  };
  function boneApplied(bone, property) {
    return bone[APPLIED_BONE_PROPERTY[property]];
  }
  function setBoneApplied(bone, property, value) {
    bone[APPLIED_BONE_PROPERTY[property]] = value;
  }
  function parameterFromSource(skeleton, parameter) {
    const source = parameter.source;
    if (source === null) return null;
    const span = source.to - source.from;
    if (span === 0) return parameter.constrain(parameter.min);
    const bone = skeleton.bones[source.bone.index];
    const read = boneApplied(bone, source.property);
    return parameter.constrain(parameter.min + (read - source.from) / span * (parameter.max - parameter.min));
  }
  function parameterValue(skeleton, parameter) {
    const fromSource = parameterFromSource(skeleton, parameter);
    if (fromSource !== null) return fromSource;
    return parameter.constrain(skeleton.parameters[parameter.index]);
  }
  function refreshParameter(skeleton, parameter) {
    const v = parameterValue(skeleton, parameter);
    skeleton.parameters[parameter.index] = v;
    return v;
  }
  function refreshSourceParameters(skeleton) {
    for (const p of skeleton.data.parameters) {
      if (p.source !== null) skeleton.parameters[p.index] = parameterValue(skeleton, p);
    }
  }

  // runtime/src/constraints/ik.ts
  var IkConstraint = class {
    constructor(data, skeleton) {
      __publicField(this, "data");
      /** Constrained bones: 1 or 2 (`bones[1]` is a child of `bones[0]`). */
      __publicField(this, "bones");
      __publicField(this, "target");
      __publicField(this, "active", true);
      __publicField(this, "mix");
      __publicField(this, "bendPositive");
      __publicField(this, "compress");
      __publicField(this, "stretch");
      __publicField(this, "uniform");
      __publicField(this, "softness");
      this.data = data;
      this.bones = data.bones.map((bd) => skeleton.bones[bd.index]);
      this.target = skeleton.bones[data.target.index];
      this.mix = data.mix;
      this.bendPositive = data.bendPositive;
      this.compress = data.compress;
      this.stretch = data.stretch;
      this.uniform = data.uniform;
      this.softness = data.softness;
    }
    reset() {
    }
    setToSetupPose() {
      const d = this.data;
      this.mix = d.mix;
      this.bendPositive = d.bendPositive;
      this.compress = d.compress;
      this.stretch = d.stretch;
      this.uniform = d.uniform;
      this.softness = d.softness;
    }
    update(_skeleton, _now) {
      const target = this.target;
      const bones = this.bones;
      switch (bones.length) {
        case 1:
          apply1(bones[0], target.worldX, target.worldY, this.compress, this.stretch, this.uniform, this.mix);
          break;
        case 2:
          apply2(
            bones[0],
            bones[1],
            target.worldX,
            target.worldY,
            this.bendPositive,
            this.stretch,
            this.uniform,
            this.softness,
            this.mix
          );
          break;
        default:
          break;
      }
    }
  };
  function apply1(bone, tx, ty, compress, stretch, uniform, mix) {
    const skeleton = bone.skeleton;
    const sx = skeleton.scaleX;
    const sy = skeleton.scaleY;
    const p = bone.parent;
    let pa = 1, pb = 0, pc = 0, pd = 1, pwx = 0, pwy = 0;
    if (p !== null) {
      pa = p.a;
      pb = p.b;
      pc = p.c;
      pd = p.d;
      pwx = p.worldX;
      pwy = p.worldY;
    }
    let rot = -bone.ashearX - bone.arotation;
    let lx = 0, ly = 0;
    const mode = bone.inherit;
    const flip = pa * pd - pb * pc < 0 !== (sx < 0 !== sy < 0);
    switch (mode) {
      case "onlyTranslation":
      case "onlyReflection":
        lx = (tx - bone.worldX) * Math.sign(sx);
        ly = (ty - bone.worldY) * Math.sign(sy);
        break;
      case "noReflection": {
        if (flip) {
          pb = -pb;
          pd = -pd;
        }
        const x = tx - bone.worldX;
        const y = ty - bone.worldY;
        const det = pa * pd - pb * pc;
        if (Math.abs(det) <= EPSILON_DET) {
          lx = 0;
          ly = 0;
        } else {
          lx = (x * pd - y * pb) / det;
          ly = (y * pa - x * pc) / det;
        }
        break;
      }
      case "noRotation":
      case "noRotationOrReflection": {
        let s = Math.abs(pa * pd - pb * pc) / Math.max(EPSILON_DET, pa * pa + pc * pc);
        if (mode === "noRotation" && flip) s = -s;
        const sa = pa / sx;
        const sc = pc / sy;
        pb = -sc * s * sx;
        pd = sa * s * sy;
        rot += atan2Deg(sc, sa);
      }
      // eslint-disable-next-line no-fallthrough
      default: {
        const x = tx - pwx;
        const y = ty - pwy;
        const det = pa * pd - pb * pc;
        if (Math.abs(det) <= EPSILON_DET) {
          lx = 0;
          ly = 0;
        } else {
          lx = (x * pd - y * pb) / det - bone.ax;
          ly = (y * pa - x * pc) / det - bone.ay;
        }
      }
    }
    rot += atan2Deg(ly, lx);
    if (bone.ascaleX < 0) rot += 180;
    rot = normalizeAngle(rot);
    let scX = bone.ascaleX;
    let scY = bone.ascaleY;
    if (compress || stretch) {
      if (mode === "noScale" || mode === "noScaleOrReflection") {
        lx = tx - bone.worldX;
        ly = ty - bone.worldY;
      }
      const b = bone.data.length * scX;
      if (b > EPSILON_DET) {
        const dd = lx * lx + ly * ly;
        if (compress && dd < b * b || stretch && dd > b * b) {
          const s = (Math.sqrt(dd) / b - 1) * mix + 1;
          scX *= s;
          if (uniform) scY *= s;
        }
      }
    }
    bone.arotation = sanitize(bone.arotation + rot * mix);
    bone.ascaleX = sanitize(scX);
    bone.ascaleY = sanitize(scY);
    bone.updateWorldTransform();
  }
  function apply2(parent, child, tx, ty, bendPositive, stretch, uniform, softness, mix) {
    const bendDir = bendPositive ? 1 : -1;
    const px = parent.ax;
    const py = parent.ay;
    let psx = parent.ascaleX;
    let psy = parent.ascaleY;
    let csx = child.ascaleX;
    let sxP = psx;
    let syP = psy;
    let os1 = 0, s2 = 1, os2 = 0;
    if (psx < 0) {
      psx = -psx;
      os1 = 180;
      s2 = -1;
    }
    if (psy < 0) {
      psy = -psy;
      s2 = -s2;
    }
    if (csx < 0) {
      csx = -csx;
      os2 = 180;
    }
    const cx = child.ax;
    let cy, cwx, cwy;
    const u = Math.abs(psx - psy) <= EPSILON_DET;
    if (!u || stretch) {
      cy = 0;
      cwx = parent.a * cx + parent.worldX;
      cwy = parent.c * cx + parent.worldY;
    } else {
      cy = child.ay;
      cwx = parent.a * cx + parent.b * cy + parent.worldX;
      cwy = parent.c * cx + parent.d * cy + parent.worldY;
    }
    const pp = parent.parent;
    let a, b, c, d, ppx, ppy;
    if (pp !== null) {
      a = pp.a;
      b = pp.b;
      c = pp.c;
      d = pp.d;
      ppx = pp.worldX;
      ppy = pp.worldY;
    } else {
      a = 1;
      b = 0;
      c = 0;
      d = 1;
      ppx = 0;
      ppy = 0;
    }
    let id = a * d - b * c;
    id = Math.abs(id) <= EPSILON_DET ? 0 : 1 / id;
    let x = cwx - ppx;
    let y = cwy - ppy;
    const dx = (x * d - y * b) * id - px;
    const dy = (y * a - x * c) * id - py;
    const l1 = Math.sqrt(dx * dx + dy * dy);
    let l2 = child.data.length * csx;
    if (l1 < EPSILON_DET) {
      apply1(parent, tx, ty, false, stretch, false, mix);
      child.arotation = 0;
      child.updateWorldTransform();
      return;
    }
    x = tx - ppx;
    y = ty - ppy;
    let ttx = (x * d - y * b) * id - px;
    let tty = (y * a - x * c) * id - py;
    let dd = ttx * ttx + tty * tty;
    if (softness !== 0) {
      softness *= psx * (csx + 1) / 2;
      const td = Math.sqrt(dd);
      const sd = td - l1 - l2 * psx + softness;
      if (sd > 0) {
        let pz = Math.min(1, sd / (softness * 2)) - 1;
        pz = (sd - softness * (1 - pz * pz)) / td;
        ttx -= pz * ttx;
        tty -= pz * tty;
        dd = ttx * ttx + tty * tty;
      }
    }
    let a1;
    let a2;
    if (u) {
      l2 *= psx;
      let cos = (dd - l1 * l1 - l2 * l2) / (2 * l1 * l2);
      if (cos < -1) {
        cos = -1;
        a2 = PI * bendDir;
      } else if (cos > 1) {
        cos = 1;
        a2 = 0;
        if (stretch) {
          const k = (Math.sqrt(dd) / (l1 + l2) - 1) * mix + 1;
          sxP *= k;
          if (uniform) syP *= k;
        }
      } else {
        a2 = Math.acos(cos) * bendDir;
      }
      a = l1 + l2 * cos;
      b = l2 * Math.sin(a2);
      a1 = atan2(tty * a - ttx * b, ttx * a + tty * b);
    } else {
      a = psx * l2;
      b = psy * l2;
      const aa = a * a;
      const bb = b * b;
      const ta = atan2(tty, ttx);
      c = bb * l1 * l1 + aa * dd - aa * bb;
      const c1 = -2 * bb * l1;
      const c2 = bb - aa;
      d = c1 * c1 - 4 * c2 * c;
      let solved = false;
      a1 = 0;
      a2 = 0;
      if (d >= 0) {
        let q = Math.sqrt(d);
        if (c1 < 0) q = -q;
        q = -(c1 + q) / 2;
        let r0 = q / c2;
        const r12 = c / q;
        const r = Math.abs(r0) < Math.abs(r12) ? r0 : r12;
        r0 = dd - r * r;
        if (r0 >= 0) {
          y = Math.sqrt(r0) * bendDir;
          a1 = ta - atan2(y, r);
          a2 = atan2(y / psy, (r - l1) / psx);
          solved = true;
        }
      }
      if (!solved) {
        let minAngle = PI, minX = l1 - a, minDist = minX * minX, minY = 0;
        let maxAngle = 0, maxX = l1 + a, maxDist = maxX * maxX, maxY = 0;
        c = -a * l1 / (aa - bb);
        if (c >= -1 && c <= 1) {
          c = Math.acos(c);
          x = a * Math.cos(c) + l1;
          y = b * Math.sin(c);
          d = x * x + y * y;
          if (d < minDist) {
            minAngle = c;
            minDist = d;
            minX = x;
            minY = y;
          }
          if (d > maxDist) {
            maxAngle = c;
            maxDist = d;
            maxX = x;
            maxY = y;
          }
        }
        if (dd <= (minDist + maxDist) / 2) {
          a1 = ta - atan2(minY * bendDir, minX);
          a2 = minAngle * bendDir;
        } else {
          a1 = ta - atan2(maxY * bendDir, maxX);
          a2 = maxAngle * bendDir;
        }
      }
    }
    const os = atan2(cy, cx) * s2;
    const r1 = normalizeAngle((a1 - os) * RAD_TO_DEG + os1 - parent.arotation);
    parent.arotation = sanitize(parent.arotation + r1 * mix);
    parent.ascaleX = sanitize(sxP);
    parent.ascaleY = sanitize(syP);
    parent.ashearX = 0;
    parent.ashearY = 0;
    parent.updateWorldTransform();
    const r2 = normalizeAngle(((a2 + os) * RAD_TO_DEG - child.ashearX) * s2 + os2 - child.arotation);
    child.arotation = sanitize(child.arotation + r2 * mix);
    child.updateWorldTransform();
  }
  registerConstraint("ik", (data, skeleton) => {
    if (!(data instanceof IkConstraintData)) throw new Error(`ik constraint "${data.name}" has wrong data type "${data.type}"`);
    return new IkConstraint(data, skeleton);
  });

  // runtime/src/constraints/transform.ts
  var TransformConstraint = class {
    constructor(data, skeleton) {
      __publicField(this, "data");
      /** Constrained bones, in file order. */
      __publicField(this, "bones");
      /** Source bone. */
      __publicField(this, "target");
      __publicField(this, "active", true);
      /** General mix (spec 6.1). Multiplies every per-property mix. */
      __publicField(this, "mix");
      __publicField(this, "mixRotation");
      __publicField(this, "mixX");
      __publicField(this, "mixY");
      __publicField(this, "mixScaleX");
      __publicField(this, "mixScaleY");
      __publicField(this, "mixShearY");
      __publicField(this, "temp", { x: 0, y: 0 });
      this.data = data;
      this.bones = data.bones.map((bd) => skeleton.bones[bd.index]);
      this.target = skeleton.bones[data.target.index];
      this.mix = data.mix;
      this.mixRotation = data.mixRotation;
      this.mixX = data.mixX;
      this.mixY = data.mixY;
      this.mixScaleX = data.mixScaleX;
      this.mixScaleY = data.mixScaleY;
      this.mixShearY = data.mixShearY;
    }
    reset() {
    }
    setToSetupPose() {
      const d = this.data;
      this.mix = d.mix;
      this.mixRotation = d.mixRotation;
      this.mixX = d.mixX;
      this.mixY = d.mixY;
      this.mixScaleX = d.mixScaleX;
      this.mixScaleY = d.mixScaleY;
      this.mixShearY = d.mixShearY;
    }
    update(_skeleton, _now) {
      const mix = this.mix;
      const mR = mix * this.mixRotation;
      const mX = mix * this.mixX;
      const mY = mix * this.mixY;
      const mSX = mix * this.mixScaleX;
      const mSY = mix * this.mixScaleY;
      const mSH = mix * this.mixShearY;
      if (mR === 0 && mX === 0 && mY === 0 && mSX === 0 && mSY === 0 && mSH === 0) return;
      const d = this.data;
      if (d.local) {
        if (d.relative) this.applyRelativeLocal(mR, mX, mY, mSX, mSY, mSH);
        else this.applyAbsoluteLocal(mR, mX, mY, mSX, mSY, mSH);
      } else {
        if (d.relative) this.applyRelativeWorld(mR, mX, mY, mSX, mSY, mSH);
        else this.applyAbsoluteWorld(mR, mX, mY, mSX, mSY, mSH);
      }
    }
    // -- world modes -------------------------------------------------------------
    /** `local: false, relative: false` (spec 6.3 `transformWorldAbsolute`). */
    applyAbsoluteWorld(mR, mX, mY, mSX, mSY, mSH) {
      const d = this.data;
      const target = this.target;
      const ta = target.a, tb = target.b, tc = target.c, td = target.d;
      const reflect = ta * td - tb * tc > 0 ? DEG_TO_RAD : -DEG_TO_RAD;
      const offsetRotation = d.offsetRotation * reflect;
      const offsetShearY = d.offsetShearY * reflect;
      const temp = this.temp;
      const bones = this.bones;
      for (let i = 0, n = bones.length; i < n; i++) {
        const bone = bones[i];
        if (mR !== 0) {
          const a = bone.a, b = bone.b, c = bone.c, dd = bone.d;
          const r = normalizeRadians(atan2(tc, ta) - atan2(c, a) + offsetRotation) * mR;
          const cos = Math.cos(r), sin = Math.sin(r);
          bone.a = cos * a - sin * c;
          bone.b = cos * b - sin * dd;
          bone.c = sin * a + cos * c;
          bone.d = sin * b + cos * dd;
        }
        if (mX !== 0 || mY !== 0) {
          target.localToWorld(d.offsetX, d.offsetY, temp);
          bone.worldX += (temp.x - bone.worldX) * mX;
          bone.worldY += (temp.y - bone.worldY) * mY;
        }
        if (mSX !== 0) {
          let s = Math.sqrt(bone.a * bone.a + bone.c * bone.c);
          if (s !== 0) s = (s + (Math.sqrt(ta * ta + tc * tc) - s + d.offsetScaleX) * mSX) / s;
          bone.a *= s;
          bone.c *= s;
        }
        if (mSY !== 0) {
          let s = Math.sqrt(bone.b * bone.b + bone.d * bone.d);
          if (s !== 0) s = (s + (Math.sqrt(tb * tb + td * td) - s + d.offsetScaleY) * mSY) / s;
          bone.b *= s;
          bone.d *= s;
        }
        if (mSH > 0) {
          const b = bone.b, dd = bone.d;
          const by = atan2(dd, b);
          let r = normalizeRadians(atan2(td, tb) - atan2(tc, ta) - (by - atan2(bone.c, bone.a)));
          r = by + (r + offsetShearY) * mSH;
          const s = Math.sqrt(b * b + dd * dd);
          bone.b = Math.cos(r) * s;
          bone.d = Math.sin(r) * s;
        }
        finishWorldWrite(bone);
      }
    }
    /** `local: false, relative: true` (spec 6.3, world relative). */
    applyRelativeWorld(mR, mX, mY, mSX, mSY, mSH) {
      const d = this.data;
      const target = this.target;
      const ta = target.a, tb = target.b, tc = target.c, td = target.d;
      const reflect = ta * td - tb * tc > 0 ? DEG_TO_RAD : -DEG_TO_RAD;
      const offsetRotation = d.offsetRotation * reflect;
      const offsetShearY = d.offsetShearY * reflect;
      const temp = this.temp;
      const bones = this.bones;
      for (let i = 0, n = bones.length; i < n; i++) {
        const bone = bones[i];
        if (mR !== 0) {
          const a = bone.a, b = bone.b, c = bone.c, dd = bone.d;
          const r = normalizeRadians(atan2(tc, ta) + offsetRotation) * mR;
          const cos = Math.cos(r), sin = Math.sin(r);
          bone.a = cos * a - sin * c;
          bone.b = cos * b - sin * dd;
          bone.c = sin * a + cos * c;
          bone.d = sin * b + cos * dd;
        }
        if (mX !== 0 || mY !== 0) {
          target.localToWorld(d.offsetX, d.offsetY, temp);
          bone.worldX += temp.x * mX;
          bone.worldY += temp.y * mY;
        }
        if (mSX !== 0) {
          const s = (Math.sqrt(ta * ta + tc * tc) - 1 + d.offsetScaleX) * mSX + 1;
          bone.a *= s;
          bone.c *= s;
        }
        if (mSY !== 0) {
          const s = (Math.sqrt(tb * tb + td * td) - 1 + d.offsetScaleY) * mSY + 1;
          bone.b *= s;
          bone.d *= s;
        }
        if (mSH > 0) {
          let r = normalizeRadians(atan2(td, tb) - atan2(tc, ta));
          const b = bone.b, dd = bone.d;
          r = atan2(dd, b) + (r - PI / 2 + offsetShearY) * mSH;
          const s = Math.sqrt(b * b + dd * dd);
          bone.b = Math.cos(r) * s;
          bone.d = Math.sin(r) * s;
        }
        finishWorldWrite(bone);
      }
    }
    // -- local modes -------------------------------------------------------------
    /** `local: true, relative: false` (spec 6.3, degrees, applied pose, no rotation wrap). */
    applyAbsoluteLocal(mR, mX, mY, mSX, mSY, mSH) {
      const d = this.data;
      const t = this.target;
      const bones = this.bones;
      for (let i = 0, n = bones.length; i < n; i++) {
        const bone = bones[i];
        bone.arotation += (t.arotation - bone.arotation + d.offsetRotation) * mR;
        bone.ax += (t.ax - bone.ax + d.offsetX) * mX;
        bone.ay += (t.ay - bone.ay + d.offsetY) * mY;
        bone.ascaleX += (t.ascaleX - bone.ascaleX + d.offsetScaleX) * mSX;
        bone.ascaleY += (t.ascaleY - bone.ascaleY + d.offsetScaleY) * mSY;
        bone.ashearY += (t.ashearY - bone.ashearY + d.offsetShearY) * mSH;
        bone.updateWorldTransform();
      }
    }
    /** `local: true, relative: true` (spec 6.3). */
    applyRelativeLocal(mR, mX, mY, mSX, mSY, mSH) {
      const d = this.data;
      const t = this.target;
      const bones = this.bones;
      for (let i = 0, n = bones.length; i < n; i++) {
        const bone = bones[i];
        bone.arotation += (t.arotation + d.offsetRotation) * mR;
        bone.ax += (t.ax + d.offsetX) * mX;
        bone.ay += (t.ay + d.offsetY) * mY;
        bone.ascaleX *= (t.ascaleX - 1 + d.offsetScaleX) * mSX + 1;
        bone.ascaleY *= (t.ascaleY - 1 + d.offsetScaleY) * mSY + 1;
        bone.ashearY += (t.ashearY + d.offsetShearY) * mSH;
        bone.updateWorldTransform();
      }
    }
  };
  registerConstraint("transform", (data, skeleton) => {
    if (!(data instanceof TransformConstraintData)) {
      throw new Error(`constraint "${data.name}": expected TransformConstraintData for type "transform"`);
    }
    return new TransformConstraint(data, skeleton);
  });

  // runtime/src/constraints/path.ts
  var SEGMENTS = 10;
  var CURVE_EPSILON = 1e-5;
  var PathConstraint = class {
    constructor(data, skeleton) {
      __publicField(this, "data");
      /** Constrained bones, in file order. */
      __publicField(this, "bones");
      /** Slot whose current attachment must be a `path` (spec 6.4). */
      __publicField(this, "target");
      __publicField(this, "active", true);
      /** General mix (spec 6.1). Multiplies every per-property mix. */
      __publicField(this, "mix");
      __publicField(this, "mixRotation");
      __publicField(this, "mixX");
      __publicField(this, "mixY");
      /** Position of the first bone, in the unit of `positionMode`. Animatable. */
      __publicField(this, "position");
      /** Space between bones, in the unit of `spacingMode`. Animatable. */
      __publicField(this, "spacing");
      // -- scratch buffers, reused between frames (no allocation per frame) --------
      /** `spaces[0] = 0`; `spaces[i + 1]` is the gap before bone `i`. Length `n + 1`. */
      __publicField(this, "spaces", new Float64Array(0));
      /** World length of each bone, only filled in `chainScale` (spec 6.4 `lengths`). */
      __publicField(this, "boneLengths", new Float64Array(0));
      /** World position of the `3K` path points, `x, y` pairs. */
      __publicField(this, "world", new Float64Array(0));
      /** `x, y, tangentAngle` per sample. `n + 1` samples (spec 6.4 step 2). */
      __publicField(this, "positions", new Float64Array(0));
      /** Cumulative arc length at the end of each of the `curveCount * 10` segments. */
      __publicField(this, "segmentLengths", new Float64Array(0));
      /** The eight numbers of the current curve: `x1 y1 cx1 cy1 cx2 cy2 x2 y2`. */
      __publicField(this, "controls", new Float64Array(8));
      this.data = data;
      this.bones = data.bones.map((bd) => skeleton.bones[bd.index]);
      this.target = skeleton.slots[data.target.index];
      this.mix = data.mix;
      this.mixRotation = data.mixRotation;
      this.mixX = data.mixX;
      this.mixY = data.mixY;
      this.position = data.position;
      this.spacing = data.spacing;
    }
    reset() {
    }
    setToSetupPose() {
      const d = this.data;
      this.mix = d.mix;
      this.mixRotation = d.mixRotation;
      this.mixX = d.mixX;
      this.mixY = d.mixY;
      this.position = d.position;
      this.spacing = d.spacing;
    }
    /** The `path` attachment the target slot shows, or `null` (spec 6.4: then nothing happens). */
    get pathAttachment() {
      const attachment = this.target.attachment;
      return attachment instanceof PathAttachment ? attachment : null;
    }
    update(_skeleton, _now) {
      const path = this.pathAttachment;
      if (path === null) return;
      const mix = this.mix;
      const mR = mix * this.mixRotation;
      const mX = mix * this.mixX;
      const mY = mix * this.mixY;
      if (mR === 0 && mX === 0 && mY === 0) return;
      const bones = this.bones;
      const n = bones.length;
      if (n === 0) return;
      if (path.curveCount < 1 || path.vertexCount < path.anchorCount * 3) return;
      const d = this.data;
      const scale = d.rotateMode === "chainScale";
      const tangents = d.rotateMode === "tangent";
      this.computeSpaces(n, scale, tangents);
      const positions = this.computeWorldPositions(path, n);
      if (positions === null) return;
      const spaces = this.spaces;
      const boneLengths = this.boneLengths;
      let bx = positions[0];
      let by = positions[1];
      let offR = d.offsetRotation;
      let tip = false;
      if (offR === 0) {
        tip = d.rotateMode === "chain";
      } else {
        const pb = this.target.boneMatrix;
        offR *= pb.a * pb.d - pb.b * pb.c > 0 ? DEG_TO_RAD : -DEG_TO_RAD;
      }
      for (let i = 0; i < n; i++) {
        const bone = bones[i];
        bone.worldX += (bx - bone.worldX) * mX;
        bone.worldY += (by - bone.worldY) * mY;
        const p = (i + 1) * 3;
        const x = positions[p];
        const y = positions[p + 1];
        const dx = x - bx;
        const dy = y - by;
        if (scale) {
          const length = boneLengths[i];
          if (length !== 0) {
            const s = (Math.sqrt(dx * dx + dy * dy) / length - 1) * mR + 1;
            bone.a *= s;
            bone.c *= s;
          }
        }
        bx = x;
        by = y;
        if (mR > 0) {
          const a = bone.a, b = bone.b, cc = bone.c, dd = bone.d;
          let r;
          if (tangents) r = positions[i * 3 + 2];
          else if (spaces[i + 1] === 0) r = positions[p + 2];
          else r = atan2(dy, dx);
          r -= atan2(cc, a);
          if (tip) {
            const cos2 = Math.cos(r), sin2 = Math.sin(r);
            const length = bone.data.length;
            bx += (length * (cos2 * a - sin2 * cc) - dx) * mR;
            by += (length * (sin2 * a + cos2 * cc) - dy) * mR;
          } else {
            r += offR;
          }
          r = normalizeRadians(r) * mR;
          const cos = Math.cos(r), sin = Math.sin(r);
          bone.a = cos * a - sin * cc;
          bone.b = cos * b - sin * dd;
          bone.c = sin * a + cos * cc;
          bone.d = sin * b + cos * dd;
        }
        finishWorldWrite(bone);
      }
    }
    // -- step 1: spaces between bones (spec 6.4) ---------------------------------
    computeSpaces(n, scale, tangents) {
      if (this.spaces.length < n + 1) this.spaces = new Float64Array(n + 1);
      if (scale && this.boneLengths.length < n) this.boneLengths = new Float64Array(n);
      const spaces = this.spaces;
      const boneLengths = this.boneLengths;
      const spacing = this.spacing;
      const mode = this.data.spacingMode;
      const bones = this.bones;
      spaces[0] = 0;
      for (let i = 0; i < n; i++) {
        const bone = bones[i];
        const setupLength = bone.data.length;
        const worldLength = setupLength * Math.sqrt(bone.a * bone.a + bone.c * bone.c);
        if (scale) boneLengths[i] = setupLength < EPSILON_SCALE ? 0 : worldLength;
        const tiny = setupLength < EPSILON_SCALE;
        switch (mode) {
          case "percent":
            spaces[i + 1] = spacing;
            break;
          case "fixed":
            spaces[i + 1] = tiny ? spacing : spacing * worldLength / setupLength;
            break;
          case "proportional":
            spaces[i + 1] = tiny ? spacing : worldLength;
            break;
          default:
            spaces[i + 1] = tiny ? spacing : (setupLength + spacing) * worldLength / setupLength;
            break;
        }
      }
      if (mode === "proportional") {
        const m = tangents ? n : n + 1;
        let sum = 0;
        for (let i = 1; i <= n; i++) sum += spaces[i];
        if (sum > 0) {
          const k = m / sum * spacing;
          for (let i = 1; i <= n; i++) spaces[i] *= k;
        }
      }
    }
    // -- step 2: sample the path (spec 6.4) --------------------------------------
    /**
     * Fills `positions` with `n + 1` samples `x, y, tangentAngle` (radians).
     * Returns `null` when the path has no measurable length.
     *
     * The tangent angle is computed for **every** sample: step 3 reads `T[i]`
     * in tangent mode and `T[i + 1]` when the space is 0 (DUVIDAS-SPEC 14).
     */
    computeWorldPositions(path, n) {
      const slot = this.target;
      const pointCount = path.anchorCount * 3;
      if (this.world.length < pointCount * 2) this.world = new Float64Array(pointCount * 2);
      path.computeWorldVertices(slot, this.world, 0, 2);
      const closed = path.closed;
      const curveCount = path.curveCount;
      const setupLengths = path.lengths;
      const constantSpeed = path.constantSpeed || setupLengths.length < curveCount;
      let total;
      let table;
      if (constantSpeed) {
        table = this.measureCurves(curveCount, pointCount);
        total = table.length === 0 ? 0 : table[curveCount * SEGMENTS - 1];
      } else {
        table = setupLengths;
        total = setupLengths[curveCount - 1];
      }
      if (!(total > 0)) return null;
      if (this.positions.length < (n + 1) * 3) this.positions = new Float64Array((n + 1) * 3);
      const positions = this.positions;
      const spaces = this.spaces;
      let pos = this.position;
      if (this.data.positionMode === "percent") pos *= total;
      if (this.data.spacingMode === "percent") {
        for (let i = 1; i <= n; i++) spaces[i] *= total;
      }
      const controls = this.controls;
      for (let i = 0, o = 0; i <= n; i++, o += 3) {
        pos += spaces[i];
        let q = pos;
        if (closed) {
          q %= total;
          if (q < 0) q += total;
        } else if (q < 0) {
          this.extrapolateBefore(q, positions, o);
          continue;
        } else if (q > total) {
          this.extrapolateAfter(q - total, positions, o, pointCount);
          continue;
        }
        let curve;
        let t;
        if (constantSpeed) {
          let j = 0;
          while (j < curveCount * SEGMENTS - 1 && table[j] < q) j++;
          const prev = j === 0 ? 0 : table[j - 1];
          const segment = table[j] - prev;
          const local = segment > 0 ? (q - prev) / segment : 0;
          curve = Math.floor(j / SEGMENTS);
          t = (j % SEGMENTS + local) / SEGMENTS;
        } else {
          let k = 0;
          while (k < curveCount - 1 && table[k] < q) k++;
          const prev = k === 0 ? 0 : table[k - 1];
          const span = table[k] - prev;
          curve = k;
          t = span > 0 ? (q - prev) / span : 0;
        }
        this.curveControls(curve, pointCount, controls);
        addCurvePosition(controls, t, positions, o);
      }
      return positions;
    }
    /** Cumulative arc length of every segment, `SEGMENTS` per curve (spec 6.4). */
    measureCurves(curveCount, pointCount) {
      const count = curveCount * SEGMENTS;
      if (this.segmentLengths.length < count) this.segmentLengths = new Float64Array(count);
      const table = this.segmentLengths;
      const c = this.controls;
      let total = 0;
      for (let k = 0; k < curveCount; k++) {
        this.curveControls(k, pointCount, c);
        let px = c[0];
        let py = c[1];
        for (let s = 1; s <= SEGMENTS; s++) {
          const t = s / SEGMENTS;
          const u = 1 - t;
          const uu = u * u, tt = t * t;
          const ut3 = u * t * 3;
          const x = c[0] * uu * u + c[2] * u * ut3 + c[4] * t * ut3 + c[6] * tt * t;
          const y = c[1] * uu * u + c[3] * u * ut3 + c[5] * t * ut3 + c[7] * tt * t;
          const dx = x - px, dy = y - py;
          total += Math.sqrt(dx * dx + dy * dy);
          table[k * SEGMENTS + s - 1] = total;
          px = x;
          py = y;
        }
      }
      return table;
    }
    /**
     * The four control points of curve `k`: anchor `k` (point `3k+1`), its out
     * handle (`3k+2`), the in handle of anchor `k+1` (`3k+3`) and anchor `k+1`
     * (`3k+4`). On a closed path the last curve wraps to points `0` and `1`.
     */
    curveControls(k, pointCount, out) {
      const w = this.world;
      const base = k * 3 + 1;
      for (let i = 0; i < 4; i++) {
        const point = (base + i) % pointCount;
        out[i * 2] = w[point * 2];
        out[i * 2 + 1] = w[point * 2 + 1];
      }
    }
    /** `q < 0` on an open path: straight line out of anchor 0 along its out handle (spec 6.4). */
    extrapolateBefore(q, out, o) {
      const w = this.world;
      const x1 = w[2], y1 = w[3];
      const dx = w[4] - x1, dy = w[5] - y1;
      const r = atan2(dy, dx);
      out[o] = x1 + q * Math.cos(r);
      out[o + 1] = y1 + q * Math.sin(r);
      out[o + 2] = r;
    }
    /** `q > total` on an open path: straight line out of the last anchor, along its in handle (spec 6.4). */
    extrapolateAfter(q, out, o, pointCount) {
      const w = this.world;
      const anchor = (pointCount - 2) * 2;
      const handle = (pointCount - 3) * 2;
      const x1 = w[anchor], y1 = w[anchor + 1];
      const dx = x1 - w[handle], dy = y1 - w[handle + 1];
      const r = atan2(dy, dx);
      out[o] = x1 + q * Math.cos(r);
      out[o + 1] = y1 + q * Math.sin(r);
      out[o + 2] = r;
    }
  };
  function addCurvePosition(c, t, out, o) {
    const x1 = c[0], y1 = c[1], cx1 = c[2], cy1 = c[3], cx2 = c[4], cy2 = c[5], x2 = c[6], y2 = c[7];
    if (!(t >= CURVE_EPSILON)) {
      out[o] = x1;
      out[o + 1] = y1;
      out[o + 2] = atan2(cy1 - y1, cx1 - x1);
      return;
    }
    const tt = t * t, ttt = tt * t;
    const u = 1 - t, uu = u * u, uuu = uu * u;
    const ut = u * t, ut3 = ut * 3, uut3 = u * ut3, ttu3 = t * ut3;
    const x = x1 * uuu + cx1 * uut3 + cx2 * ttu3 + x2 * ttt;
    const y = y1 * uuu + cy1 * uut3 + cy2 * ttu3 + y2 * ttt;
    out[o] = x;
    out[o + 1] = y;
    if (t < 1e-3) {
      out[o + 2] = atan2(cy1 - y1, cx1 - x1);
    } else {
      out[o + 2] = atan2(y - (y1 * uu + cy1 * ut * 2 + cy2 * tt), x - (x1 * uu + cx1 * ut * 2 + cx2 * tt));
    }
  }
  registerConstraint("path", (data, skeleton) => {
    if (!(data instanceof PathConstraintData)) {
      throw new Error(`constraint "${data.name}": expected PathConstraintData for type "path"`);
    }
    return new PathConstraint(data, skeleton);
  });

  // runtime/src/constraints/physics.ts
  var PhysicsConstraint = class {
    constructor(data, skeleton) {
      __publicField(this, "data");
      __publicField(this, "bone");
      __publicField(this, "active", true);
      __publicField(this, "mix");
      // Animatable values (spec 9.8). Restored by `setToSetupPose`.
      __publicField(this, "inertia");
      __publicField(this, "strength");
      __publicField(this, "damping");
      __publicField(this, "mass");
      __publicField(this, "wind");
      __publicField(this, "gravity");
      // Simulation state (spec 6.5, not stored in the file).
      __publicField(this, "xOffset", 0);
      __publicField(this, "xVelocity", 0);
      __publicField(this, "yOffset", 0);
      __publicField(this, "yVelocity", 0);
      __publicField(this, "rotateOffset", 0);
      __publicField(this, "rotateVelocity", 0);
      __publicField(this, "scaleOffset", 0);
      __publicField(this, "scaleVelocity", 0);
      /** Accumulated time not yet simulated (seconds). */
      __publicField(this, "remaining", 0);
      /** Skeleton time of the previous update (spec 6.5 `lastTime`); `NaN` before the first one. */
      __publicField(this, "lastTime", Number.NaN);
      /** Bone world position used by the translation lag (`ux uy`). */
      __publicField(this, "ux", 0);
      __publicField(this, "uy", 0);
      /** Bone world position at the end of the previous frame (`cx cy`). */
      __publicField(this, "cx", 0);
      __publicField(this, "cy", 0);
      /** Bone tip after the physics of the previous frame (`tx ty`). */
      __publicField(this, "tx", 0);
      __publicField(this, "ty", 0);
      __publicField(this, "pendingReset", true);
      this.data = data;
      this.bone = skeleton.bones[data.bone.index];
      this.mix = data.mix;
      this.inertia = data.inertia;
      this.strength = data.strength;
      this.damping = data.damping;
      this.mass = data.mass;
      this.wind = data.wind;
      this.gravity = data.gravity;
    }
    /** `1 / mass` (spec 6.5 `massInverse`); `0` when `mass` is not positive. */
    get massInverse() {
      return this.mass > 0 ? 1 / this.mass : 0;
    }
    /** Simulation step in seconds (`1 / fps`). */
    get step() {
      return 1 / this.data.fps;
    }
    /** Spec 6.5 `physicsReset`: next `update` re-anchors the bone and nothing is simulated. */
    reset() {
      this.pendingReset = true;
      this.remaining = 0;
      this.lastTime = this.bone.skeleton.time;
      this.xOffset = 0;
      this.xVelocity = 0;
      this.yOffset = 0;
      this.yVelocity = 0;
      this.rotateOffset = 0;
      this.rotateVelocity = 0;
      this.scaleOffset = 0;
      this.scaleVelocity = 0;
    }
    setToSetupPose() {
      const d = this.data;
      this.mix = d.mix;
      this.inertia = d.inertia;
      this.strength = d.strength;
      this.damping = d.damping;
      this.mass = d.mass;
      this.wind = d.wind;
      this.gravity = d.gravity;
    }
    /** Spec 6.5 `physicsApply`. `now` = skeleton time in seconds. */
    update(skeleton, now) {
      const mix = this.mix;
      if (mix === 0) return;
      const data = this.data;
      const bone = this.bone;
      const l = bone.data.length;
      const f = skeleton.data.meta.referenceScale;
      const step = this.step;
      const massInverse = this.massInverse;
      const useX = data.x > 0;
      const useY = data.y > 0;
      const useRot = data.rotation > 0 || data.shearX > 0;
      const useScale = data.scaleX > 0;
      const delta = Number.isNaN(this.lastTime) ? 0 : Math.max(now - this.lastTime, 0);
      this.remaining += delta;
      this.lastTime = now;
      const bx = bone.worldX;
      const by = bone.worldY;
      if (this.pendingReset) {
        this.pendingReset = false;
        this.ux = bx;
        this.uy = by;
        this.remaining = 0;
      } else {
        let a = this.remaining;
        const i = this.inertia;
        let d = -1;
        let qx = data.limit * delta;
        const qy = qx * Math.abs(skeleton.scaleY);
        qx *= Math.abs(skeleton.scaleX);
        if (useX || useY) {
          if (useX) {
            this.xOffset += clamp((this.ux - bx) * i, -qx, qx);
            this.ux = bx;
          }
          if (useY) {
            this.yOffset += clamp((this.uy - by) * i, -qy, qy);
            this.uy = by;
          }
          if (a >= step) {
            d = Math.pow(this.damping, 60 * step);
            const m = massInverse * step;
            const e = this.strength;
            const w = this.wind * f;
            const g = this.gravity * f;
            do {
              if (useX) {
                this.xVelocity += (w - this.xOffset * e) * m;
                this.xOffset += this.xVelocity * step;
                this.xVelocity *= d;
              }
              if (useY) {
                this.yVelocity -= (g + this.yOffset * e) * m;
                this.yOffset += this.yVelocity * step;
                this.yVelocity *= d;
              }
              a -= step;
            } while (a >= step);
          }
        }
        if (useX) bone.worldX += this.xOffset * mix * data.x;
        if (useY) bone.worldY += this.yOffset * mix * data.y;
        if (useRot || useScale) {
          const ca = atan2(bone.c, bone.a);
          let mr = 0;
          let co;
          let si;
          const dx = clamp(this.cx - bone.worldX, -qx, qx);
          const dy = clamp(this.cy - bone.worldY, -qy, qy);
          if (useRot) {
            mr = (data.rotation + data.shearX) * mix;
            let r = atan2(dy + this.ty, dx + this.tx) - ca - this.rotateOffset * mr;
            this.rotateOffset += (r - Math.ceil(r / PI2 - 0.5) * PI2) * i;
            r = this.rotateOffset * mr + ca;
            co = Math.cos(r);
            si = Math.sin(r);
            if (useScale) {
              r = l * Math.sqrt(bone.a * bone.a + bone.c * bone.c);
              if (r > 0) this.scaleOffset += (dx * co + dy * si) * i / r;
            }
          } else {
            co = Math.cos(ca);
            si = Math.sin(ca);
            const r = l * Math.sqrt(bone.a * bone.a + bone.c * bone.c);
            if (r > 0) this.scaleOffset += (dx * co + dy * si) * i / r;
          }
          a = this.remaining;
          if (a >= step) {
            if (d === -1) d = Math.pow(this.damping, 60 * step);
            const m = massInverse * step;
            const e = this.strength;
            const w = this.wind;
            const g = this.gravity;
            const h = l / f;
            for (; ; ) {
              a -= step;
              if (useScale) {
                this.scaleVelocity += (w * co - g * si - this.scaleOffset * e) * m;
                this.scaleOffset += this.scaleVelocity * step;
                this.scaleVelocity *= d;
              }
              if (useRot) {
                this.rotateVelocity -= ((w * si + g * co) * h + this.rotateOffset * e) * m;
                this.rotateOffset += this.rotateVelocity * step;
                this.rotateVelocity *= d;
                if (a < step) break;
                const r = this.rotateOffset * mr + ca;
                co = Math.cos(r);
                si = Math.sin(r);
              } else if (a < step) {
                break;
              }
            }
          }
        }
        this.remaining = a;
      }
      this.cx = bone.worldX;
      this.cy = bone.worldY;
      if (useRot) {
        let o = this.rotateOffset * mix;
        if (data.shearX > 0) {
          let r = 0;
          if (data.rotation > 0) {
            r = o * data.rotation;
            const si2 = Math.sin(r);
            const co2 = Math.cos(r);
            const b = bone.b;
            bone.b = co2 * b - si2 * bone.d;
            bone.d = si2 * b + co2 * bone.d;
          }
          r += o * data.shearX;
          const si = Math.sin(r);
          const co = Math.cos(r);
          const a = bone.a;
          bone.a = co * a - si * bone.c;
          bone.c = si * a + co * bone.c;
        } else {
          o *= data.rotation;
          const si = Math.sin(o);
          const co = Math.cos(o);
          const a = bone.a;
          bone.a = co * a - si * bone.c;
          bone.c = si * a + co * bone.c;
          const b = bone.b;
          bone.b = co * b - si * bone.d;
          bone.d = si * b + co * bone.d;
        }
      }
      if (useScale) {
        const s = 1 + this.scaleOffset * mix * data.scaleX;
        bone.a *= s;
        bone.c *= s;
      }
      bone.a = sanitize(bone.a);
      bone.b = sanitize(bone.b);
      bone.c = sanitize(bone.c);
      bone.d = sanitize(bone.d);
      bone.worldX = sanitize(bone.worldX);
      bone.worldY = sanitize(bone.worldY);
      this.tx = l * bone.a;
      this.ty = l * bone.c;
      bone.updateAppliedTransform();
      const children = bone.children;
      for (let k = 0; k < children.length; k++) children[k].dirty = true;
    }
  };
  function physicsFactory(data, skeleton) {
    if (!(data instanceof PhysicsConstraintData)) throw new Error(`physics factory received "${data.type}" data`);
    return new PhysicsConstraint(data, skeleton);
  }
  registerConstraint("physics", physicsFactory);

  // runtime/src/constraints/driver.ts
  function isValueTimeline(tl) {
    return tl.kind !== "event" && tl.kind !== "sequence" && tl.kind !== "tag" && tl.kind !== "constraint.reset";
  }
  var DriverConstraint = class {
    constructor(data, _skeleton) {
      __publicField(this, "data");
      __publicField(this, "active", true);
      __publicField(this, "mix");
      /** Bones written this frame; recomputed (with their descendants) at the end of `update`. */
      __publicField(this, "touched", []);
      /** Reused buffer for `deform` targets. */
      __publicField(this, "deformScratch", null);
      /** Reused buffer for `slot.darkColor` targets. */
      __publicField(this, "color3", new Float64Array(3));
      this.data = data;
      this.mix = data.mix;
      if (data.targets !== null) {
        if (data.targets.length === 0) this.active = false;
      } else if (data.animation === null || data.to === data.from) {
        this.active = false;
      }
    }
    /** Parameter value driving this constraint right now (spec 8.1). */
    input(skeleton) {
      return refreshParameter(skeleton, this.data.parameter);
    }
    /**
     * Time inside the control animation for the parameter value `v`
     * (continuous mode, spec 8.2), clamped to `[min(timeFrom, timeTo),
     * max(timeFrom, timeTo)]`.
     */
    animationTime(v) {
      const d = this.data;
      const span = d.to - d.from;
      if (span === 0) return d.timeFrom;
      const t = d.timeFrom + (v - d.from) / span * (d.timeTo - d.timeFrom);
      return clamp(t, Math.min(d.timeFrom, d.timeTo), Math.max(d.timeFrom, d.timeTo));
    }
    update(skeleton, _now) {
      const d = this.data;
      const mix = this.mix;
      if (mix === 0) return;
      const v = this.input(skeleton);
      if (d.targets !== null) {
        for (const target of d.targets) this.applyTimeline(skeleton, target.timeline, v, target.mode, mix);
      } else {
        const animation = d.animation;
        if (animation === null) return;
        const t = this.animationTime(v);
        for (const tl of animation.timelines) {
          if (isValueTimeline(tl)) this.applyTimeline(skeleton, tl, t, d.mode, mix);
        }
      }
      const touched = this.touched;
      if (touched.length > 0) {
        for (const bone of touched) bone.dirty = true;
        touched.length = 0;
        skeleton.updateDirtyBones();
      }
    }
    reset() {
      this.touched.length = 0;
    }
    setToSetupPose() {
      this.mix = this.data.mix;
    }
    // -- one target (spec 8.2 `aplicarAlvo`) -----------------------------------
    applyTimeline(skeleton, tl, input, mode, mix) {
      switch (tl.kind) {
        case "bone.number": {
          const bone = skeleton.bones[tl.bone.index];
          const field = APPLIED_BONE_PROPERTY[tl.property];
          const val = evaluateNumber(tl.keys, input);
          bone[field] = blendNumber(bone[field], val, tl.bone[tl.property], mode, mix);
          this.touch(bone);
          break;
        }
        case "bone.inherit": {
          if (mix < 0.5) break;
          const bone = skeleton.bones[tl.bone.index];
          bone[APPLIED_BONE_INHERIT[tl.property]] = evaluateStepped(tl.keys, input);
          this.touch(bone);
          break;
        }
        case "bone.parent": {
          if (mix < 0.5) break;
          const bone = skeleton.bones[tl.bone.index];
          applyParentKey(skeleton, bone, evaluateStepped(tl.keys, input));
          this.touch(bone);
          break;
        }
        case "slot.attachment": {
          if (mix < 0.5) break;
          skeleton.slots[tl.slot.index].setAttachmentName(evaluateStepped(tl.keys, input));
          break;
        }
        case "slot.color": {
          const color = skeleton.slots[tl.slot.index].color;
          const setup = tl.slot.color;
          for (let j = 0; j < 4; j++) {
            color[j] = blendNumber(color[j], evaluateComponent(tl.keys, input, j), setup[j], mode, mix);
          }
          break;
        }
        case "slot.darkColor": {
          this.applyDarkColor(skeleton.slots[tl.slot.index], tl, input, mode, mix);
          break;
        }
        case "slot.visible": {
          if (mix < 0.5) break;
          skeleton.slots[tl.slot.index].visible = evaluateStepped(tl.keys, input);
          break;
        }
        case "drawOrder": {
          if (mix < 0.5) break;
          const i = findKeyIndex(tl.times, input);
          applyDrawOrder(skeleton, tl.entries[i < 0 ? 0 : i]);
          break;
        }
        case "deform": {
          this.applyDeform(skeleton.slots[tl.slot.index], tl, input, mode, mix);
          break;
        }
        case "constraint.number": {
          const c = skeleton.constraintFor(tl.constraint);
          if (c === null) break;
          const holder = c;
          const cur = holder[tl.property];
          if (typeof cur !== "number") break;
          const setup = tl.constraint[tl.property];
          holder[tl.property] = blendNumber(cur, evaluateNumber(tl.keys, input), typeof setup === "number" ? setup : cur, mode, mix);
          break;
        }
        case "constraint.boolean": {
          if (mix < 0.5) break;
          const c = skeleton.constraintFor(tl.constraint);
          if (c === null) break;
          c[tl.property] = evaluateStepped(tl.keys, input);
          break;
        }
        case "parameter": {
          const p = tl.parameter;
          const cur = skeleton.parameters[p.index];
          skeleton.parameters[p.index] = p.constrain(blendNumber(cur, evaluateNumber(tl.keys, input), p.default, mode, mix));
          break;
        }
        case "morph": {
          const m = tl.morph;
          const cur = skeleton.morphWeights[m.index];
          skeleton.morphWeights[m.index] = clamp(blendNumber(cur, evaluateNumber(tl.keys, input), m.weight, mode, mix), m.min, m.max);
          break;
        }
        case "variable.number": {
          const variable = tl.variable;
          const raw = skeleton.variables[variable.index];
          const cur = typeof raw === "number" ? raw : 0;
          const setup = typeof variable.default === "number" ? variable.default : 0;
          const v = blendNumber(cur, evaluateNumber(tl.keys, input), setup, mode, mix);
          skeleton.variables[variable.index] = variable.type === "int" ? Math.trunc(v) : v;
          break;
        }
        case "variable.stepped": {
          if (mix < 0.5) break;
          skeleton.variables[tl.variable.index] = evaluateStepped(tl.keys, input);
          break;
        }
        case "nested.animation": {
          if (mix < 0.5) break;
          const slot = skeleton.slots[tl.slot.index];
          slot.nestedAnimation = evaluateStepped(tl.keys, input);
          slot.nestedAnimationSet = true;
          break;
        }
        case "nested.number": {
          const slot = skeleton.slots[tl.slot.index];
          const val = evaluateNumber(tl.keys, input);
          const raw = tl.property === "time" ? slot.nestedTime : slot.nestedTimeScale;
          const cur = Number.isFinite(raw) ? raw : mode === "add" ? 0 : val;
          const v = blendNumber(cur, val, 0, mode, mix);
          if (tl.property === "time") slot.nestedTime = v;
          else slot.nestedTimeScale = v;
          break;
        }
        case "event":
        case "sequence":
        case "tag":
        case "constraint.reset":
          break;
      }
    }
    touch(bone) {
      if (!this.touched.includes(bone)) this.touched.push(bone);
    }
    applyDarkColor(slot, tl, input, mode, mix) {
      const val = evaluateDarkColor(tl, input, this.color3);
      const setup = tl.slot.darkColor;
      if (val === null) {
        if (mix >= 0.5) slot.darkColor = null;
        return;
      }
      if (slot.darkColor === null) {
        if (mix >= 0.5) slot.darkColor = Float64Array.from(val);
        return;
      }
      const cur = slot.darkColor;
      for (let j = 0; j < 3; j++) cur[j] = blendNumber(cur[j], val[j], setup === null ? 0 : setup[j], mode, mix);
    }
    applyDeform(slot, tl, input, mode, mix) {
      const current = slot.attachment;
      if (!(current instanceof VertexAttachment) || current.timelineAttachment !== tl.attachment.timelineAttachment) return;
      const length = tl.attachment.deformLength;
      if (this.deformScratch === null || this.deformScratch.length < length) this.deformScratch = new Float64Array(length);
      const val = evaluateDeform(tl, input, this.deformScratch);
      const timelineAttachment = tl.attachment.timelineAttachment;
      let out = slot.deform;
      const hadDeform = out !== null && out.length === length && slot.deformAttachment === timelineAttachment;
      if (!hadDeform) out = new Float64Array(length);
      const buffer = out;
      for (let j = 0; j < length; j++) {
        const cur = hadDeform ? buffer[j] : 0;
        buffer[j] = blendNumber(cur, val === null ? 0 : val[j], 0, mode, mix);
      }
      slot.deform = buffer;
      slot.deformAttachment = timelineAttachment;
    }
  };
  function blendNumber(cur, val, setup, mode, mix) {
    if (mode === "add") return cur + (val - setup) * mix;
    return cur + (val - cur) * mix;
  }
  function driverFactory(data, skeleton) {
    if (!(data instanceof DriverConstraintData)) throw new Error(`driver factory received "${data.type}" data`);
    return new DriverConstraint(data, skeleton);
  }
  registerConstraint("driver", driverFactory);

  // runtime/src/particles/hash.ts
  function pcg(v) {
    const state = Math.imul(v >>> 0, 747796405) + 2891336453 >>> 0;
    const shift = (state >>> 28) + 4 >>> 0;
    const word = Math.imul((state >>> shift ^ state) >>> 0, 277803737) >>> 0;
    return (word >>> 22 ^ word) >>> 0;
  }
  function particleRandom(seed, flow, index, channel) {
    let h = pcg(seed >>> 0);
    h = pcg((h ^ flow >>> 0) >>> 0);
    h = pcg((h ^ index >>> 0) >>> 0);
    h = pcg((h ^ channel >>> 0) >>> 0);
    return (h >>> 8) / 16777216;
  }
  var PARTICLE_CHANNEL = Object.freeze({
    LIFETIME: 0,
    SPEED: 1,
    SPREAD: 2,
    SHAPE_A: 3,
    SHAPE_B: 4,
    ANGLE: 5,
    ANGULAR_VELOCITY: 6,
    SCALE: 7,
    START_COLOR: 8,
    START_FRAME: 9,
    RANDOMNESS: 10,
    PROBABILITY: 11,
    MESH_PICK: 12
  });
  function particleRange(range, u) {
    const min = range[0];
    return min + (range[1] - min) * u;
  }

  // runtime/src/particles/emission.ts
  var COUNT_EPSILON = 1e-9;
  var CANDIDATE_CAP = 2e5;
  var EmissionCurve = class {
    constructor(attachment, emitting, rate = null) {
      /** `E(origin) = 0`. */
      __publicField(this, "origin");
      /** Effective rate for `t < origin`, from the first key. */
      __publicField(this, "rateBefore");
      /** Segment starts, ascending; `boundaries[0] === origin`. */
      __publicField(this, "boundaries");
      /** Effective rate at the START of `[boundaries[k], boundaries[k+1])`. */
      __publicField(this, "rates");
      /** Slope of the effective rate inside the segment; `0` in the 1st phase. */
      __publicField(this, "slopes");
      /** `E(boundaries[k])`, summed once here and never per frame. */
      __publicField(this, "totals");
      const fixed = attachment.rate > 0 ? attachment.rate : 0;
      this.origin = attachment.startDelay;
      const on = (t) => {
        if (emitting === null || emitting.times.length === 0) return attachment.emitting;
        const times = emitting.times;
        if (t < times[0]) return emitting.values[0];
        let lo = 0;
        let hi = times.length - 1;
        while (lo < hi) {
          const mid = lo + hi + 1 >> 1;
          if (times[mid] <= t) lo = mid;
          else hi = mid - 1;
        }
        return emitting.values[lo];
      };
      const rateKey = (t) => {
        const times = rate.times;
        if (t < times[0]) return -1;
        let lo = 0;
        let hi = times.length - 1;
        while (lo < hi) {
          const mid = lo + hi + 1 >> 1;
          if (times[mid] <= t) lo = mid;
          else hi = mid - 1;
        }
        return lo;
      };
      const animated = rate !== null && rate.times.length > 0;
      const rateAt = (t) => {
        if (!animated) return [fixed, 0];
        const k = rateKey(t);
        const values = rate.values;
        if (k < 0) return [values[0], 0];
        const last = rate.times.length - 1;
        if (k >= last || rate.curves[k].kind === "stepped") return [values[k], 0];
        const t0 = rate.times[k];
        const t1 = rate.times[k + 1];
        const slope = (values[k + 1] - values[k]) / (t1 - t0);
        return [values[k] + slope * (t - t0), slope];
      };
      this.rateBefore = on(-Infinity) ? animated ? rate.values[0] : fixed : 0;
      const marks = [this.origin];
      if (emitting !== null) {
        for (let i = 0; i < emitting.times.length; i++) {
          const t = emitting.times[i];
          if (t > this.origin) marks.push(t);
        }
      }
      if (animated) {
        for (let i = 0; i < rate.times.length; i++) {
          const t = rate.times[i];
          if (t > this.origin) marks.push(t);
        }
      }
      marks.sort((a, b) => a - b);
      const boundaries = [];
      for (const t of marks) if (boundaries.length === 0 || t > boundaries[boundaries.length - 1]) boundaries.push(t);
      const rates = new Float64Array(boundaries.length);
      const slopes = new Float64Array(boundaries.length);
      const totals = new Float64Array(boundaries.length);
      for (let k = 0; k < boundaries.length; k++) {
        if (on(boundaries[k])) {
          const [r, s] = rateAt(boundaries[k]);
          rates[k] = r > 0 ? r : 0;
          slopes[k] = s;
        }
        if (k > 0) {
          const dt = boundaries[k] - boundaries[k - 1];
          totals[k] = totals[k - 1] + rates[k - 1] * dt + slopes[k - 1] * dt * dt / 2;
        }
      }
      this.boundaries = new Float64Array(boundaries);
      this.rates = rates;
      this.slopes = slopes;
      this.totals = totals;
    }
    /** The effective rate in force at `t` (extension 4.1 and 4.2). */
    rateAt(t) {
      if (t < this.boundaries[0]) return this.rateBefore;
      const k = this.segmentAt(t);
      const r = this.rates[k] + this.slopes[k] * (t - this.boundaries[k]);
      return r > 0 ? r : 0;
    }
    /** `E(t)`: how many births up to `t`, counted from the origin. Negative before it. */
    countAt(t) {
      if (t < this.boundaries[0]) return -this.rateBefore * (this.boundaries[0] - t);
      const k = this.segmentAt(t);
      const dt = t - this.boundaries[k];
      return this.totals[k] + this.rates[k] * dt + this.slopes[k] * dt * dt / 2;
    }
    /**
     * `τ(i)`: the time at which `E` reaches `i`, or `null` when the rate never
     * gets there (a stretch with `emitting` off never produces anyone).
     */
    timeOf(index) {
      if (index < this.totals[0]) {
        if (this.rateBefore <= 0) return null;
        return this.boundaries[0] + index / this.rateBefore;
      }
      let lo = 0;
      let hi = this.totals.length - 1;
      while (lo < hi) {
        const mid = lo + hi + 1 >> 1;
        if (this.totals[mid] <= index) lo = mid;
        else hi = mid - 1;
      }
      const r0 = this.rates[lo];
      const s = this.slopes[lo];
      const d = index - this.totals[lo];
      if (r0 <= 0 && s <= 0) return null;
      if (d === 0) return this.boundaries[lo];
      const disc = r0 * r0 + 2 * s * d;
      return this.boundaries[lo] + 2 * d / (r0 + Math.sqrt(disc > 0 ? disc : 0));
    }
    segmentAt(t) {
      let lo = 0;
      let hi = this.boundaries.length - 1;
      while (lo < hi) {
        const mid = lo + hi + 1 >> 1;
        if (this.boundaries[mid] <= t) lo = mid;
        else hi = mid - 1;
      }
      return lo;
    }
  };
  function newBirthReport() {
    return { cyclesDropped: 0, burstsCut: [] };
  }
  function shiftBirth(attachment, curve, index, continuous) {
    let t = continuous;
    const e = attachment.explosiveness;
    if (e > 0 && attachment.duration > 0) {
      const start = Math.floor(continuous / attachment.duration) * attachment.duration;
      t = start + (1 - e) * (continuous - start);
    }
    const r = attachment.randomness;
    if (r > 0) {
      const local = curve.rateAt(continuous);
      if (local > 0) t += r * particleRandom(attachment.seed, 0, index, PARTICLE_CHANNEL.RANDOMNESS) / local;
    }
    return t;
  }
  function collectBirths(attachment, curve, window, out = [], report = null) {
    const now = window.time;
    const lifeMax = attachment.lifetime[1];
    const oldest = now - lifeMax;
    const looping = attachment.looping && window.duration > 0;
    const duration = window.duration;
    let budget = CANDIDATE_CAP;
    const add = (flow, index, birth) => {
      if (birth > now || birth <= oldest) return;
      out.push({ flow, index: index === 0 ? 0 : index, birth: birth === 0 ? 0 : birth });
    };
    if (looping) {
      const perLap = Math.ceil(curve.countAt(duration) - COUNT_EPSILON);
      if (perLap > 0) {
        const laps = Math.ceil((lifeMax + duration) / duration) + 1;
        for (let lap = 0; lap < laps && budget > 0; lap++) {
          const shift = lap * duration;
          for (let i = 0; i < perLap && budget > 0; i++) {
            budget--;
            const base = curve.timeOf(i);
            if (base === null) continue;
            add(0, i, shiftBirth(attachment, curve, i, base) - shift);
          }
        }
      }
    } else {
      const first = Math.ceil(curve.countAt(curve.origin - attachment.prewarm) - COUNT_EPSILON);
      const lo = Math.max(first, Math.ceil(curve.countAt(oldest)) - 1);
      const hi = Math.floor(curve.countAt(now)) + 1;
      for (let i = lo; i <= hi && budget > 0; i++) {
        budget--;
        const base = curve.timeOf(i);
        if (base === null) continue;
        add(0, i, shiftBirth(attachment, curve, i, base));
      }
    }
    const lapsBack = looping ? Math.ceil((lifeMax + duration) / duration) + 1 : 1;
    for (let b = 0; b < attachment.bursts.length; b++) {
      const burst = attachment.bursts[b];
      const flow = 1 + b;
      const origin = curve.origin;
      const lastCycle = looping ? cyclesInLap(burst, origin, duration, report, b) : burst.cycles - 1;
      for (let lap = 0; lap < lapsBack && budget > 0; lap++) {
        const shift = looping ? lap * duration : 0;
        const base = origin + burst.time;
        const cLo = Math.max(0, Math.ceil((oldest - base + shift) / burst.interval - COUNT_EPSILON));
        const cHi = Math.min(lastCycle, Math.floor((now - base + shift) / burst.interval + COUNT_EPSILON));
        for (let c = cLo; c <= cHi && budget > 0; c++) {
          const birth = base + c * burst.interval - shift;
          for (let j = 0; j < burst.count && budget > 0; j++) {
            budget--;
            const index = c * burst.count + j;
            if (particleRandom(attachment.seed, flow, index, PARTICLE_CHANNEL.PROBABILITY) >= burst.probability) continue;
            add(flow, index, birth);
          }
        }
        if (!looping) break;
      }
    }
    return out;
  }
  function cyclesInLap(burst, origin, duration, report, index) {
    const first = origin + burst.time;
    if (first < 0 || first >= duration) {
      if (report !== null) {
        report.cyclesDropped += burst.cycles;
        report.burstsCut.push(index);
      }
      return -1;
    }
    const limit = Math.ceil((duration - first) / burst.interval - COUNT_EPSILON) - 1;
    const last = Math.min(burst.cycles - 1, limit);
    if (report !== null && last < burst.cycles - 1) {
      report.cyclesDropped += burst.cycles - 1 - last;
      report.burstsCut.push(index);
    }
    return last;
  }

  // runtime/src/particles/emitter.ts
  var DRAG_EPSILON = 1e-5;
  var FRAME_GUARD = 1e-5;
  function overLifetime(keys, u) {
    const n = keys.length;
    if (n === 0) return 1;
    if (u <= keys[0].time) return keys[0].value;
    if (u >= keys[n - 1].time) return keys[n - 1].value;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (keys[mid].time <= u) lo = mid;
      else hi = mid - 1;
    }
    const a = keys[lo];
    const b = keys[lo + 1];
    return sampleCurve(resolvedCurve(a, b), 0, a.time, b.time, a.value, b.value, u);
  }
  function overLifetimeColor(keys, u, out) {
    const n = keys.length;
    if (n === 0) {
      out[0] = 1;
      out[1] = 1;
      out[2] = 1;
      out[3] = 1;
      return;
    }
    if (u <= keys[0].time) {
      out.set(keys[0].value);
      return;
    }
    if (u >= keys[n - 1].time) {
      out.set(keys[n - 1].value);
      return;
    }
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (keys[mid].time <= u) lo = mid;
      else hi = mid - 1;
    }
    const a = keys[lo];
    const b = keys[lo + 1];
    const t0 = a.time;
    const t1 = b.time;
    const curve = t1 === t0 ? null : colorCurve(a, b);
    for (let j = 0; j < 4; j++) {
      out[j] = curve === null ? a.value[j] : sampleCurve(curve, j, t0, t1, a.value[j], b.value[j], u);
    }
  }
  var curveCache = /* @__PURE__ */ new WeakMap();
  var colorCurveCache = /* @__PURE__ */ new WeakMap();
  function colorCurve(key, next) {
    let c = colorCurveCache.get(key);
    if (c === void 0) {
      c = normalizeCurve(key.curve, 4, true, key.time, next.time);
      colorCurveCache.set(key, c);
    }
    return c;
  }
  function sequenceFrame(attachment, age, life, u9) {
    const sequence = attachment.sequence;
    if (sequence === null) return -1;
    const n = sequence.count;
    if (n <= 0) return -1;
    const k = attachment.frameMode === "fps" ? Math.floor(age * attachment.fps + FRAME_GUARD) : Math.floor(age / life * attachment.cycles * n + FRAME_GUARD);
    const start = Math.floor(particleRange(attachment.startFrame, u9));
    const frame = (k + start) % n;
    return frame < 0 ? frame + n : frame;
  }
  function resolvedCurve(key, next) {
    let c = curveCache.get(key);
    if (c === void 0) {
      c = normalizeCurve(key.curve, 1, true, key.time, next.time);
      curveCache.set(key, c);
    }
    return c;
  }
  function shapePosition(attachment, u3, u4, u12, pose2, birth, out) {
    switch (attachment.shape) {
      case "point":
        out.x = 0;
        out.y = 0;
        return true;
      case "circle": {
        const inner = 1 - attachment.radiusThickness;
        const i2 = inner * inner;
        const r = attachment.radius * Math.sqrt(i2 + u3 * (1 - i2));
        const phi = u4 * attachment.arc;
        out.x = r * cosDeg(phi);
        out.y = r * sinDeg(phi);
        return true;
      }
      case "rectangle":
        out.x = (u3 - 0.5) * attachment.size[0];
        out.y = (u4 - 0.5) * attachment.size[1];
        return true;
      case "edge": {
        const e = attachment.edge;
        out.x = e[0] + (e[2] - e[0]) * u3;
        out.y = e[1] + (e[3] - e[1]) * u3;
        return true;
      }
      case "bone": {
        const length = pose2.boneLength === void 0 ? 0 : pose2.boneLength(birth);
        out.x = length * u3;
        out.y = 0;
        return true;
      }
      case "mesh": {
        const mesh = pose2.meshAt === void 0 ? null : pose2.meshAt(birth);
        if (mesh === null) return false;
        if (!sampleMesh(attachment, mesh, u3, u4, u12, out)) return false;
        backToEmitter(attachment, pose2, birth, out);
        return true;
      }
      case "path": {
        const path = pose2.pathAt === void 0 ? null : pose2.pathAt(birth);
        if (path === null) return false;
        if (!samplePath(path.points, path.closed, u3, out)) return false;
        backToEmitter(attachment, pose2, birth, out);
        return true;
      }
      default:
        return false;
    }
  }
  var INVERSE_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  function backToEmitter(attachment, pose2, birth, out) {
    const inv = invertMatrix(emitterMatrix(attachment, pose2.matrixAt(birth), MESH_SCRATCH), INVERSE_SCRATCH);
    const lx = inv.a * out.x + inv.b * out.y + inv.worldX;
    const ly = inv.c * out.x + inv.d * out.y + inv.worldY;
    out.x = lx;
    out.y = ly;
  }
  var PATH_SEGMENTS = 10;
  function samplePath(w, closed, u3, out) {
    const k = Math.floor(w.length / 6);
    if (k < 2) return false;
    const curves = closed ? k : k - 1;
    const pts = new Float64Array((curves * PATH_SEGMENTS + 1) * 2);
    let o = 0;
    for (let c = 0; c < curves; c++) {
      const a = c * 6;
      const b = (c + 1) % k * 6;
      const x0 = w[a + 2], y0 = w[a + 3], h1x = w[a + 4], h1y = w[a + 5];
      const h2x = w[b], h2y = w[b + 1], x1 = w[b + 2], y1 = w[b + 3];
      for (let j = c === 0 ? 0 : 1; j <= PATH_SEGMENTS; j++) {
        const t = j / PATH_SEGMENTS;
        const m = 1 - t;
        const c0 = m * m * m, c1 = 3 * m * m * t, c2 = 3 * m * t * t, c3 = t * t * t;
        pts[o++] = c0 * x0 + c1 * h1x + c2 * h2x + c3 * x1;
        pts[o++] = c0 * y0 + c1 * h1y + c2 * h2y + c3 * y1;
      }
    }
    const n = o / 2 - 1;
    let total = 0;
    for (let i = 0; i < n; i++) total += Math.hypot(pts[i * 2 + 2] - pts[i * 2], pts[i * 2 + 3] - pts[i * 2 + 1]);
    if (total === 0) {
      out.x = pts[0];
      out.y = pts[1];
      return true;
    }
    const s = u3 * total;
    let acc = 0;
    for (let i = 0; i < n; i++) {
      const dx = pts[i * 2 + 2] - pts[i * 2];
      const dy = pts[i * 2 + 3] - pts[i * 2 + 1];
      const length = Math.hypot(dx, dy);
      if (length === 0) continue;
      if (acc + length >= s) {
        const f = (s - acc) / length;
        out.x = pts[i * 2] + dx * f;
        out.y = pts[i * 2 + 1] + dy * f;
        return true;
      }
      acc += length;
    }
    out.x = pts[n * 2];
    out.y = pts[n * 2 + 1];
    return true;
  }
  function emitterMatrix(attachment, bone, out) {
    if (attachment.x === 0 && attachment.y === 0 && attachment.rotation === 0) return bone;
    const local = composeMatrix(attachment.x, attachment.y, attachment.rotation, 1, 1, LOCAL_SCRATCH);
    return multiplyMatrix(bone, local, out);
  }
  var LOCAL_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  var NOW_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  var BIRTH_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  var MESH_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  var edgeCache = /* @__PURE__ */ new WeakMap();
  function uniqueEdges(triangles) {
    const key = triangles;
    const hit = edgeCache.get(key);
    if (hit !== void 0) return hit;
    const seen = /* @__PURE__ */ new Set();
    const pairs = [];
    const push = (x, y) => {
      const a = x < y ? x : y;
      const b = x < y ? y : x;
      if (a === b) return;
      const id = a * 4294967296 + b;
      if (seen.has(id)) return;
      seen.add(id);
      pairs.push(a, b);
    };
    for (let t = 0; t + 2 < triangles.length; t += 3) {
      push(triangles[t], triangles[t + 1]);
      push(triangles[t + 1], triangles[t + 2]);
      push(triangles[t + 2], triangles[t]);
    }
    const order = Array.from({ length: pairs.length / 2 }, (_, i) => i).sort((i, j) => pairs[i * 2] - pairs[j * 2] || pairs[i * 2 + 1] - pairs[j * 2 + 1]);
    const out = new Int32Array(order.length * 2);
    for (let i = 0; i < order.length; i++) {
      out[i * 2] = pairs[order[i] * 2];
      out[i * 2 + 1] = pairs[order[i] * 2 + 1];
    }
    edgeCache.set(key, out);
    return out;
  }
  function sampleMesh(attachment, mesh, u3, u4, u12, out) {
    const v = mesh.vertices;
    const n = v.length / 2;
    if (n < 1) return false;
    if (attachment.meshMode === "vertex") {
      const k = Math.min(n - 1, Math.floor(u12 * n));
      out.x = v[k * 2];
      out.y = v[k * 2 + 1];
      return true;
    }
    if (attachment.meshMode === "edge") {
      const edges = uniqueEdges(mesh.triangles);
      const m = edges.length / 2;
      if (m < 1) return false;
      const e = Math.min(m - 1, Math.floor(u12 * m));
      const a2 = edges[e * 2] * 2;
      const b2 = edges[e * 2 + 1] * 2;
      out.x = v[a2] + (v[b2] - v[a2]) * u3;
      out.y = v[a2 + 1] + (v[b2 + 1] - v[a2 + 1]) * u3;
      return true;
    }
    const tris = mesh.triangles;
    const count = Math.floor(tris.length / 3);
    if (count < 1) return false;
    let total = 0;
    const areas = new Float64Array(count);
    for (let t = 0; t < count; t++) {
      const a2 = tris[t * 3] * 2;
      const b2 = tris[t * 3 + 1] * 2;
      const c2 = tris[t * 3 + 2] * 2;
      const area = Math.abs((v[b2] - v[a2]) * (v[c2 + 1] - v[a2 + 1]) - (v[c2] - v[a2]) * (v[b2 + 1] - v[a2 + 1])) / 2;
      total += area;
      areas[t] = total;
    }
    if (total <= 0) return false;
    const target = u12 * total;
    let pick = count - 1;
    for (let t = 0; t < count; t++) {
      if (target < areas[t]) {
        pick = t;
        break;
      }
    }
    const a = tris[pick * 3] * 2;
    const b = tris[pick * 3 + 1] * 2;
    const c = tris[pick * 3 + 2] * 2;
    let sw = u3;
    let ww = u4;
    if (sw + ww > 1) {
      sw = 1 - sw;
      ww = 1 - ww;
    }
    out.x = v[a] + sw * (v[b] - v[a]) + ww * (v[c] - v[a]);
    out.y = v[a + 1] + sw * (v[b + 1] - v[a + 1]) + ww * (v[c + 1] - v[a + 1]);
    return true;
  }
  function meshSilence(attachment, pose2) {
    if (attachment.shape !== "mesh") return null;
    if (attachment.mesh === null || pose2.meshAt === void 0 || pose2.meshAt(0) === null) {
      return {
        reason: "mesh",
        message: `emissor "${attachment.name}": a malha "${attachment.mesh ?? ""}" n\xE3o foi encontrada no mesmo slot (n\xEDvel B); o emissor n\xE3o \xE9 desenhado`
      };
    }
    return null;
  }
  function pathSilence(attachment, pose2) {
    if (attachment.shape !== "path") return null;
    const path = attachment.curve === null || pose2.pathAt === void 0 ? null : pose2.pathAt(0);
    if (path === null || path.points.length < 12) {
      return {
        reason: "path",
        message: `emissor "${attachment.name}": o caminho "${attachment.curve ?? ""}" n\xE3o foi encontrado (um anexo path, "<slot>/<anexo>"); o emissor n\xE3o \xE9 desenhado`
      };
    }
    return null;
  }
  function computeParticles(attachment, curve, window, pose2) {
    const empty = [];
    const report = newBirthReport();
    if (!attachment.shapeKnown) {
      return {
        particles: empty,
        cut: 0,
        births: report,
        silence: { reason: "shape", message: `emissor "${attachment.name}": forma desconhecida; o emissor n\xE3o \xE9 desenhado (\xA77.4)` }
      };
    }
    const silence = meshSilence(attachment, pose2) ?? pathSilence(attachment, pose2);
    if (silence !== null) return { particles: empty, cut: 0, silence, births: report };
    const now = window.time;
    const seed = attachment.seed;
    const world = attachment.space === "world";
    const births = collectBirths(attachment, curve, window, [], report);
    const alive = [];
    const p0 = { x: 0, y: 0 };
    const matrixNow = world ? null : emitterMatrix(attachment, pose2.matrixAt(now), NOW_SCRATCH);
    for (let b = 0; b < births.length; b++) {
      const born = births[b];
      const { flow, index, birth } = born;
      const u = (channel) => particleRandom(seed, flow, index, channel);
      const life = particleRange(attachment.lifetime, u(PARTICLE_CHANNEL.LIFETIME));
      const age = now - birth;
      if (life <= 0 || age < 0 || age >= life) continue;
      if (!shapePosition(attachment, u(PARTICLE_CHANNEL.SHAPE_A), u(PARTICLE_CHANNEL.SHAPE_B), u(PARTICLE_CHANNEL.MESH_PICK), pose2, birth, p0)) continue;
      const speed = particleRange(attachment.speed, u(PARTICLE_CHANNEL.SPEED));
      let base = attachment.direction;
      if (attachment.spherizeDirection > 0 && (p0.x !== 0 || p0.y !== 0)) {
        const outward = atan2Deg(p0.y, p0.x);
        let delta = outward - base;
        delta -= Math.floor(delta / 360 + 0.5) * 360;
        base += attachment.spherizeDirection * delta;
      }
      const theta = base + attachment.spread * (2 * u(PARTICLE_CHANNEL.SPREAD) - 1);
      let px = p0.x;
      let py = p0.y;
      let vx = speed * cosDeg(theta);
      let vy = speed * sinDeg(theta);
      let gx = attachment.gravity[0];
      let gy = attachment.gravity[1];
      let extraAngle;
      let boneScale;
      if (world) {
        const m = emitterMatrix(attachment, pose2.matrixAt(birth), BIRTH_SCRATCH);
        const wx = m.a * px + m.b * py + m.worldX;
        const wy = m.c * px + m.d * py + m.worldY;
        const wvx = m.a * vx + m.b * vy;
        const wvy = m.c * vx + m.d * vy;
        px = wx;
        py = wy;
        vx = wvx;
        vy = wvy;
        extraAngle = matrixRotationDeg(m);
        boneScale = matrixScaleX(m);
      } else {
        extraAngle = 0;
        boneScale = 1;
      }
      const k = attachment.drag;
      let x;
      let y;
      let velX;
      let velY;
      if (k < DRAG_EPSILON) {
        x = px + vx * age + 0.5 * gx * age * age;
        y = py + vy * age + 0.5 * gy * age * age;
        velX = vx + gx * age;
        velY = vy + gy * age;
      } else {
        const F = -Math.expm1(-k * age) / k;
        const decay = Math.exp(-k * age);
        const tx = gx / k;
        const ty = gy / k;
        x = px + tx * age + (vx - tx) * F;
        y = py + ty * age + (vy - ty) * F;
        velX = tx + (vx - tx) * decay;
        velY = ty + (vy - ty) * decay;
      }
      let angle = particleRange(attachment.angle, u(PARTICLE_CHANNEL.ANGLE)) + particleRange(attachment.angularVelocity, u(PARTICLE_CHANNEL.ANGULAR_VELOCITY)) * age;
      if (attachment.alignToVelocity) angle += atan2Deg(velY, velX);
      let scale = particleRange(attachment.scale, u(PARTICLE_CHANNEL.SCALE));
      if (attachment.scaleOverLifetime !== null) scale *= overLifetime(attachment.scaleOverLifetime, age / life);
      if (matrixNow !== null) {
        const wx = matrixNow.a * x + matrixNow.b * y + matrixNow.worldX;
        const wy = matrixNow.c * x + matrixNow.d * y + matrixNow.worldY;
        x = wx;
        y = wy;
        extraAngle = matrixRotationDeg(matrixNow);
        boneScale = matrixScaleX(matrixNow);
      }
      const u8 = u(PARTICLE_CHANNEL.START_COLOR);
      const c0 = attachment.startColor[0];
      const c1 = attachment.startColor[1];
      const color = new Float64Array(4);
      if (attachment.colorOverLifetime !== null) overLifetimeColor(attachment.colorOverLifetime, age / life, color);
      else {
        color[0] = 1;
        color[1] = 1;
        color[2] = 1;
        color[3] = 1;
      }
      for (let j = 0; j < 4; j++) color[j] *= c0[j] + (c1[j] - c0[j]) * u8;
      if (attachment.alphaOverLifetime !== null) color[3] *= overLifetime(attachment.alphaOverLifetime, age / life);
      alive.push({
        flow,
        index,
        birth,
        life,
        age,
        color,
        frame: sequenceFrame(attachment, age, life, u(PARTICLE_CHANNEL.START_FRAME)),
        x,
        y,
        // NOT normalized: `251.145834`, not `−108.854166`. A reader that reduces
        // the angle fails P-001, and only on `angle`, by multiples of 360.
        angle: angle + extraAngle,
        scale: scale * boneScale
      });
    }
    alive.sort(newestFirst);
    const cut = Math.max(0, alive.length - attachment.maxParticles);
    const kept = cut > 0 ? alive.slice(0, attachment.maxParticles) : alive;
    if (attachment.sortMode === "oldestInFront") kept.reverse();
    return { particles: kept, cut, silence: null, births: report };
  }
  function newestFirst(a, b) {
    if (a.birth !== b.birth) return b.birth - a.birth;
    if (a.flow !== b.flow) return a.flow - b.flow;
    return b.index - a.index;
  }

  // runtime/src/particles/bone-poser.ts
  var BonePoser = class {
    constructor(data, animation, options = {}) {
      __publicField(this, "actor");
      __publicField(this, "animation");
      __publicField(this, "duration");
      __publicField(this, "loop");
      __publicField(this, "cache", /* @__PURE__ */ new Map());
      this.actor = new Actor(data, options.bodies ?? /* @__PURE__ */ new Map());
      this.actor.setSkinStack(options.skins ?? ["default"]);
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
      if (bySlot === void 0) {
        bySlot = /* @__PURE__ */ new Map();
        this.cache.set(slotName, bySlot);
      }
      const hit = bySlot.get(t);
      if (hit !== void 0) return hit;
      const at = this.animationTime(t);
      const skeleton = this.actor.prepare(this.animation, at, this.loop);
      skeleton.time = t;
      skeleton.updateWorldTransform(t);
      const slot = skeleton.slots.find((s) => s.data.name === slotName);
      const source = slot === void 0 ? null : slot.boneMatrix;
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
      if (slot === void 0) return null;
      for (const skin of skeleton.skinStack) {
        const att = skin.getAttachment(slot.data.index, meshName);
        if (att === void 0 || att === null) continue;
        const mesh = att;
        if (mesh.type !== "mesh" && mesh.type !== "linkedmesh") return null;
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
      const bar = curve.indexOf("/");
      if (bar <= 0 || bar === curve.length - 1) return null;
      const slotName = curve.slice(0, bar);
      const pathName = curve.slice(bar + 1);
      const at = this.animationTime(t);
      const skeleton = this.actor.prepare(this.animation, at, this.loop);
      skeleton.time = t;
      skeleton.updateWorldTransform(t);
      const slot = skeleton.slots.find((s) => s.data.name === slotName);
      if (slot === void 0) return null;
      for (const skin of skeleton.skinStack) {
        const att = skin.getAttachment(slot.data.index, pathName);
        if (att === void 0 || att === null) continue;
        const path = att;
        if (path.type !== "path") return null;
        const out = new Float64Array(path.vertexCount * 2);
        path.computeWorldVertices(slot, out, 0, 2);
        return { points: out, closed: path.closed };
      }
      return null;
    }
    /** Length of the slot's bone, for `shape: "bone"` (extension 9.4). */
    lengthFor(slotName) {
      const slot = this.actor.skeleton.slots.find((s) => s.data.name === slotName);
      return slot === void 0 ? 0 : slot.bone.data.length;
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
      const pose2 = {
        matrixAt: (t) => this.matrixFor(slotName, t),
        boneLength: () => this.lengthFor(slotName)
      };
      const withMesh = meshName === null ? pose2 : { ...pose2, meshAt: (t) => this.meshFor(slotName, meshName, t) };
      if (curve === null) return withMesh;
      return { ...withMesh, pathAt: (t) => this.pathFor(curve, t) };
    }
    animationTime(t) {
      if (!this.loop || this.duration <= 0) return t;
      return t - Math.floor(t / this.duration) * this.duration;
    }
  };

  // runtime/src/particles/frame.ts
  var ParticleCache = class {
    constructor() {
      __publicField(this, "curves", /* @__PURE__ */ new WeakMap());
      __publicField(this, "posers", /* @__PURE__ */ new WeakMap());
    }
    /** Drops everything. Call it when the file or the animation changed. */
    clear() {
      this.curves = /* @__PURE__ */ new WeakMap();
      this.posers = /* @__PURE__ */ new WeakMap();
    }
    curveFor(skeleton, slot, attachment, animation) {
      let byAnimation = this.curves.get(attachment);
      if (byAnimation === void 0) {
        byAnimation = /* @__PURE__ */ new Map();
        this.curves.set(attachment, byAnimation);
      }
      let c = byAnimation.get(animation);
      if (c === void 0) {
        c = new EmissionCurve(attachment, emittingKeysOf(animation, slot.data.name, attachment.name), rateKeysOf(animation, slot.data.name, attachment.name));
        byAnimation.set(animation, c);
      }
      return c;
    }
    poserFor(skeleton, animation, loop) {
      let byAnimation = this.posers.get(skeleton.data);
      if (byAnimation === void 0) {
        byAnimation = /* @__PURE__ */ new Map();
        this.posers.set(skeleton.data, byAnimation);
      }
      let byRest = byAnimation.get(animation);
      if (byRest === void 0) {
        byRest = /* @__PURE__ */ new Map();
        byAnimation.set(animation, byRest);
      }
      const skins = skeleton.skinStack.map((sk) => sk.name);
      const key = `${loop ? "1" : "0"} ${JSON.stringify(skins)}`;
      let p = byRest.get(key);
      if (p === void 0) {
        p = new BonePoser(skeleton.data, animation, { skins, loop });
        byRest.set(key, p);
      }
      return p;
    }
  };
  function emittingKeysOf(animation, slotName, attachmentName) {
    if (animation === null) return null;
    for (const tl of animation.timelines) {
      if (tl.kind !== "particle.emitting") continue;
      if (tl.slot.name !== slotName || tl.attachmentName !== attachmentName) continue;
      return tl.keys;
    }
    return null;
  }
  function rateKeysOf(animation, slotName, attachmentName) {
    if (animation === null) return null;
    for (const tl of animation.timelines) {
      if (tl.kind !== "particle.rate") continue;
      if (tl.slot.name !== slotName || tl.attachmentName !== attachmentName) continue;
      return tl.keys;
    }
    return null;
  }
  function particleFrame(skeleton, slot, attachment, cache = null) {
    const animation = skeleton.playingAnimation === null ? null : skeleton.data.findAnimation(skeleton.playingAnimation);
    const duration = animation === null ? 0 : animation.duration;
    const time = animation === null ? skeleton.time : skeleton.playingTime;
    const curve = cache === null ? new EmissionCurve(attachment, emittingKeysOf(animation, slot.data.name, attachment.name), rateKeysOf(animation, slot.data.name, attachment.name)) : cache.curveFor(skeleton, slot, attachment, animation);
    const needsPast = attachment.space === "world" || attachment.shape === "mesh" || attachment.shape === "path";
    if (!needsPast) {
      return computeParticles(attachment, curve, { time, duration }, {
        matrixAt: () => slot.boneMatrix,
        boneLength: () => slot.bone.data.length
      });
    }
    const poser = (cache ?? new ParticleCache()).poserFor(skeleton, animation, skeleton.playingLoop);
    return computeParticles(attachment, curve, { time, duration }, poser.poseFor(slot.data.name, attachment.mesh, attachment.curve));
  }
  function particleRegion(attachment, particle, fallback) {
    const sequence = attachment.sequence;
    if (sequence === null || particle.frame < 0) return fallback;
    return sequence.regions[particle.frame] ?? null;
  }

  // leitor-construct/src/recorte.ts
  function areaComSinal(p) {
    let a = 0;
    const n = p.length / 2;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      a += p[i * 2] * p[j * 2 + 1] - p[j * 2] * p[i * 2 + 1];
    }
    return a / 2;
  }
  function cruz(ax, ay, bx, by, cx, cy) {
    return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
  }
  function triangularMascara(poligono) {
    let idx = [];
    const n = Math.floor(poligono.length / 2);
    if (seCruza(poligono)) return null;
    for (let i = 0; i < n; i++) idx.push(i);
    if (n < 3) return [];
    if (areaComSinal(poligono) < 0) idx.reverse();
    const x = (i) => poligono[i * 2];
    const y = (i) => poligono[i * 2 + 1];
    const saida = [];
    let guarda = 0;
    while (idx.length > 3) {
      if (guarda++ > n * n + 10) return null;
      let achou = false;
      for (let k = 0; k < idx.length; k++) {
        const a2 = idx[(k + idx.length - 1) % idx.length];
        const b2 = idx[k];
        const c2 = idx[(k + 1) % idx.length];
        const giro = cruz(x(a2), y(a2), x(b2), y(b2), x(c2), y(c2));
        if (giro === 0) {
          idx.splice(k, 1);
          achou = true;
          break;
        }
        if (giro < 0) continue;
        let dentro = false;
        for (const p of idx) {
          if (p === a2 || p === b2 || p === c2) continue;
          if (cruz(x(a2), y(a2), x(b2), y(b2), x(p), y(p)) >= 0 && cruz(x(b2), y(b2), x(c2), y(c2), x(p), y(p)) >= 0 && cruz(x(c2), y(c2), x(a2), y(a2), x(p), y(p)) >= 0) {
            dentro = true;
            break;
          }
        }
        if (dentro) continue;
        saida.push(Float64Array.of(x(a2), y(a2), x(b2), y(b2), x(c2), y(c2)));
        idx.splice(k, 1);
        achou = true;
        break;
      }
      if (!achou) return null;
    }
    const [a, b, c] = idx;
    if (cruz(x(a), y(a), x(b), y(b), x(c), y(c)) > 0) saida.push(Float64Array.of(x(a), y(a), x(b), y(b), x(c), y(c)));
    return saida;
  }
  function seCruza(p) {
    const n = Math.floor(p.length / 2);
    const lado = (ax, ay, bx, by, cx, cy) => Math.sign(cruz(ax, ay, bx, by, cx, cy));
    for (let i = 0; i < n; i++) {
      const i2 = (i + 1) % n;
      for (let j = i + 1; j < n; j++) {
        const j2 = (j + 1) % n;
        if (j === i2 || j2 === i) continue;
        const a = lado(p[i * 2], p[i * 2 + 1], p[i2 * 2], p[i2 * 2 + 1], p[j * 2], p[j * 2 + 1]);
        const b = lado(p[i * 2], p[i * 2 + 1], p[i2 * 2], p[i2 * 2 + 1], p[j2 * 2], p[j2 * 2 + 1]);
        const c = lado(p[j * 2], p[j * 2 + 1], p[j2 * 2], p[j2 * 2 + 1], p[i * 2], p[i * 2 + 1]);
        const d = lado(p[j * 2], p[j * 2 + 1], p[j2 * 2], p[j2 * 2 + 1], p[i2 * 2], p[i2 * 2 + 1]);
        if (a * b < 0 && c * d < 0) return true;
      }
    }
    return false;
  }
  function meioPlano(p, ax, ay, bx, by, esquerda) {
    const saida = [];
    const lado = (v) => {
      const c = cruz(ax, ay, bx, by, v[0], v[1]);
      return esquerda ? c : -c;
    };
    for (let i = 0; i < p.length; i++) {
      const cur = p[i];
      const prox = p[(i + 1) % p.length];
      const dc = lado(cur);
      const dp = lado(prox);
      if (dc >= 0) saida.push(cur);
      if (dc >= 0 !== dp >= 0) {
        const t = dc / (dc - dp);
        saida.push([
          cur[0] + (prox[0] - cur[0]) * t,
          cur[1] + (prox[1] - cur[1]) * t,
          cur[2] + (prox[2] - cur[2]) * t,
          cur[3] + (prox[3] - cur[3]) * t
        ]);
      }
    }
    return saida;
  }
  var AREA_MINIMA = 1e-9;
  function areaV(p) {
    let a = 0;
    for (let i = 0; i < p.length; i++) {
      const j = (i + 1) % p.length;
      a += p[i][0] * p[j][1] - p[j][0] * p[i][1];
    }
    return a / 2;
  }
  function lados(t) {
    return [[t[0], t[1], t[2], t[3]], [t[2], t[3], t[4], t[5]], [t[4], t[5], t[0], t[1]]];
  }
  function cortarPoligono(p, m) {
    if (!m.inverter) {
      const saida = [];
      for (const t of m.triangulos) {
        let q = p;
        for (const [ax, ay, bx, by] of lados(t)) {
          q = meioPlano(q, ax, ay, bx, by, true);
          if (q.length < 3) break;
        }
        if (q.length >= 3 && Math.abs(areaV(q)) > AREA_MINIMA) saida.push(q);
      }
      return saida;
    }
    let pedacos = [p];
    for (const t of m.triangulos) {
      const proximos = [];
      for (const pedaco of pedacos) {
        let resto = pedaco;
        for (const [ax, ay, bx, by] of lados(t)) {
          const fora = meioPlano(resto, ax, ay, bx, by, false);
          if (fora.length >= 3 && Math.abs(areaV(fora)) > AREA_MINIMA) proximos.push(fora);
          resto = meioPlano(resto, ax, ay, bx, by, true);
          if (resto.length < 3) break;
        }
      }
      pedacos = proximos;
    }
    return pedacos;
  }
  function cortarPeca(mundo, uvs, triangulos, mascaras) {
    if (mascaras.length === 0) {
      return { mundo: Float64Array.from(mundo), uvs: Float64Array.from(uvs), triangulos: Array.from(triangulos) };
    }
    const vert = (i) => [mundo[i * 2], mundo[i * 2 + 1], uvs[i * 2], uvs[i * 2 + 1]];
    let poligonos = [];
    for (let k2 = 0; k2 + 2 < triangulos.length; k2 += 3) {
      let tri = [vert(triangulos[k2]), vert(triangulos[k2 + 1]), vert(triangulos[k2 + 2])];
      const a = areaV(tri);
      if (Math.abs(a) <= AREA_MINIMA) continue;
      if (a < 0) tri = [tri[0], tri[2], tri[1]];
      poligonos.push(tri);
    }
    for (const m of mascaras) poligonos = poligonos.flatMap((p) => cortarPoligono(p, m));
    let n = 0;
    let t = 0;
    for (const p of poligonos) {
      n += p.length;
      t += (p.length - 2) * 3;
    }
    const m2 = new Float64Array(n * 2);
    const u2 = new Float64Array(n * 2);
    const t2 = new Array(t);
    let v = 0;
    let k = 0;
    for (const p of poligonos) {
      for (let i = 0; i < p.length; i++) {
        m2[(v + i) * 2] = p[i][0];
        m2[(v + i) * 2 + 1] = p[i][1];
        u2[(v + i) * 2] = p[i][2];
        u2[(v + i) * 2 + 1] = p[i][3];
      }
      for (let i = 1; i + 1 < p.length; i++) {
        t2[k++] = v;
        t2[k++] = v + i;
        t2[k++] = v + i + 1;
      }
      v += p.length;
    }
    return { mundo: m2, uvs: u2, triangulos: t2 };
  }

  // leitor-construct/src/desenhador.ts
  var Avisos = class {
    constructor() {
      __publicField(this, "vistos", /* @__PURE__ */ new Set());
      __publicField(this, "textos", []);
      __publicField(this, "lidos", 0);
    }
    avisar(chave, texto) {
      if (this.vistos.has(chave)) return;
      this.vistos.add(chave);
      this.textos.push(texto);
    }
    /** Todos, do primeiro ao último. */
    todos() {
      return this.textos;
    }
    /** Só os que chegaram desde a última chamada (para o console). */
    novos() {
      const n = this.textos.slice(this.lidos);
      this.lidos = this.textos.length;
      return n;
    }
  };
  function regiaoDe(slot, anexo) {
    if (anexo instanceof RegionAttachment) return anexo.regionFor(slot);
    if (anexo instanceof MeshAttachment) return anexo.regionFor(slot);
    if (anexo instanceof LinkedMeshAttachment) return anexo.regionFor(slot);
    return null;
  }
  var TETO_DE_PARTICULAS = 300;
  function pecasDoQuadro(esqueleto, avisos = new Avisos(), opcoes = {}) {
    const saida = [];
    const cache = /* @__PURE__ */ new Map();
    const contexto = { avisos, saida, cortar: opcoes.cortar !== false, cache, particulas: opcoes.particulas ?? new ParticleCache() };
    juntarPecas(esqueleto, null, "", 0, [], contexto);
    avisosDoAninhado(esqueleto, avisos);
    return saida;
  }
  function avisosDoAninhado(esqueleto, avisos) {
    for (const m of esqueleto.nestedRoot.nestedWarnings) {
      if (m.startsWith("NESTED_GONE")) continue;
      avisos.avisar(`aninhado:${m}`, m);
    }
  }
  function mascarasDe(recortes, nome, ctx) {
    const mascaras = [];
    for (const r of recortes) {
      let m = ctx.cache.get(r.poligono);
      if (m === void 0) {
        const tri = triangularMascara(r.poligono);
        m = tri === null ? null : { triangulos: tri, inverter: r.inverter };
        ctx.cache.set(r.poligono, m);
      }
      if (m === null) {
        ctx.avisos.avisar(
          `mascara-cruza:${r.nome}`,
          `A m\xE1scara "${r.nome}" se cruza (7.7 n\xE3o deixa): o leitor n\xE3o sabe cortar por ela, e "${nome}" sai sem esse corte.`
        );
        continue;
      }
      mascaras.push(m);
    }
    return mascaras;
  }
  function juntarPecas(esqueleto, corte, prefixo, profundidade, doPai, ctx) {
    const { avisos, saida, cortar } = ctx;
    const cor = createFinalColor();
    for (const { slot, attachment, clip, part } of collectDrawGroups(esqueleto, corte)) {
      const nome = slot.data.name;
      const recortes = clip === null ? doPai : [...doPai, { nome: clip.attachment.name, poligono: clip.polygon, inverter: clip.invert }];
      if (attachment.type === "skeleton") {
        const filho = slot.nested;
        if (filho === null) {
          avisos.avisar(
            `aninhado:${attachment.name}`,
            `O esqueleto aninhado "${attachment.name}" (slot "${nome}") n\xE3o foi carregado: nada desenhado no lugar dele (7.11).`
          );
          continue;
        }
        if (profundidade + 1 > MAX_NESTED_DEPTH) continue;
        const marca = part === void 0 ? null : aroundMarker(slot);
        juntarPecas(
          filho.skeleton,
          marca === null || part === void 0 ? null : { marker: marca, part },
          `${prefixo}${nome}/`,
          profundidade + 1,
          recortes,
          ctx
        );
        continue;
      }
      if (attachment instanceof ParticleAttachment) {
        juntarParticulas(esqueleto, slot, attachment, recortes, prefixo, profundidade, ctx);
        continue;
      }
      const regiao = regiaoDe(slot, attachment);
      if (regiao === null) {
        avisos.avisar(
          `regiao:${attachment.name}`,
          `O anexo "${attachment.name}" (slot "${nome}") n\xE3o tem regi\xE3o no atlas: n\xE3o foi desenhado.`
        );
        continue;
      }
      computeFinalColor(slot, attachment, cor);
      if (cor.light[3] <= 0) continue;
      if (cor.tintBlack) {
        avisos.avisar(
          `escura:${nome}`,
          `O slot "${nome}" tem cor escura (tint black, 7.12): o Construct ainda desenha s\xF3 a cor clara dele.`
        );
      }
      let mundo;
      let uvs;
      let triangulos;
      if (attachment instanceof RegionAttachment) {
        mundo = attachment.computeWorldVertices(slot, new Float64Array(8), 0, 2);
        uvs = Float64Array.from(attachment.uvsFor(slot));
        triangulos = REGION_TRIANGLES;
      } else {
        const malha = attachment;
        mundo = malha.computeWorldVertices(slot, new Float64Array(malha.vertexCount * 2), 0, 2);
        uvs = Float64Array.from(malha.regionUVsFor(slot));
        triangulos = malha.triangles;
      }
      if (cortar && recortes.length > 0) {
        const cortada = cortarPeca(mundo, uvs, triangulos, mascarasDe(recortes, nome, ctx));
        mundo = cortada.mundo;
        uvs = cortada.uvs;
        triangulos = cortada.triangulos;
        if (triangulos.length === 0) continue;
      }
      saida.push({
        slot: nome,
        nome: `${prefixo}${nome}/${attachment.name}`,
        anexo: attachment.name,
        tipo: attachment.type,
        pagina: regiao.page,
        mistura: slot.blend,
        mundo,
        uvs,
        triangulos,
        cor: [cor.light[0], cor.light[1], cor.light[2], cor.light[3]],
        profundidade,
        recortes
      });
    }
  }
  var QUADRO_DA_PARTICULA = Object.freeze({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, width: 0, height: 0 });
  function juntarParticulas(esqueleto, slot, emissor, recortes, prefixo, profundidade, ctx) {
    const { avisos, saida } = ctx;
    const nome = slot.data.name;
    const quadro = particleFrame(esqueleto, slot, emissor, ctx.particulas);
    if (quadro.silence !== null) {
      avisos.avisar(`particula:${emissor.name}`, quadro.silence.message);
      return;
    }
    if (quadro.births.cyclesDropped > 0) {
      avisos.avisar(
        `particula-ciclos:${emissor.name}`,
        `${quadro.births.cyclesDropped} ciclo(s) de rajada do emissor "${emissor.name}" ficaram fora da volta: o instante deles cai fora de [0, D) (extens\xE3o BONE_particles 6).`
      );
    }
    if (quadro.cut > 0) {
      avisos.avisar(
        `particula-corte:${emissor.name}`,
        `O emissor "${emissor.name}" teve ${quadro.cut} part\xEDcula(s) cortada(s) num quadro pelo maxParticles ${emissor.maxParticles} (extens\xE3o BONE_particles 7.1).`
      );
    }
    if (quadro.particles.length > TETO_DE_PARTICULAS) {
      avisos.avisar(
        `particula-peso:${emissor.name}`,
        `O emissor "${emissor.name}" (slot "${nome}") chegou a ${quadro.particles.length} part\xEDculas vivas num quadro. O manual do Construct diz que passar de algumas centenas pode derrubar o quadro; o leitor avisa acima de ${TETO_DE_PARTICULAS}. Todas foram desenhadas.`
      );
    }
    if (quadro.particles.length === 0) return;
    const cor = computeFinalColor(slot, emissor, createFinalColor());
    if (cor.tintBlack) {
      avisos.avisar(
        `escura:${nome}`,
        `O slot "${nome}" tem cor escura (tint black, 7.12): o Construct ainda desenha s\xF3 a cor clara dele.`
      );
    }
    const mascaras = ctx.cortar && recortes.length > 0 ? mascarasDe(recortes, nome, ctx) : [];
    const q = new Float64Array(8);
    const quv = new Float64Array(8);
    let pagina = null;
    let mundo = [];
    let uvs = [];
    let cores = [];
    const fechar = () => {
      if (pagina === null || mundo.length === 0) return;
      const n = mundo.length / 2;
      const tri = [];
      for (let k = 0; k < n; k += 4) tri.push(k, k + 1, k + 2, k, k + 2, k + 3);
      saida.push({
        slot: nome,
        nome: `${prefixo}${nome}/${emissor.name}`,
        anexo: emissor.name,
        tipo: emissor.type,
        pagina,
        mistura: slot.blend,
        mundo: Float64Array.from(mundo),
        uvs: Float64Array.from(uvs),
        triangulos: tri,
        cor: [cor.light[0], cor.light[1], cor.light[2], cor.light[3]],
        profundidade,
        recortes,
        coresPorVertice: Float64Array.from(cores)
      });
      mundo = [];
      uvs = [];
      cores = [];
    };
    for (const p of quadro.particles) {
      const regiao = particleRegion(emissor, p, emissor.region);
      if (regiao === null) {
        avisos.avisar(
          `regiao:${emissor.name}`,
          `O emissor "${emissor.name}" (slot "${nome}") n\xE3o tem regi\xE3o no atlas: n\xE3o foi desenhado.`
        );
        fechar();
        return;
      }
      const alpha = cor.light[3] * p.color[3];
      if (alpha <= 0) continue;
      const r = cor.light[0] * p.color[0];
      const g = cor.light[1] * p.color[1];
      const b = cor.light[2] * p.color[2];
      computeRegionFrame(QUADRO_DA_PARTICULA, regiao, q, quv);
      const c = cosDeg(p.angle) * p.scale;
      const s = sinDeg(p.angle) * p.scale;
      const canto = [];
      for (let i = 0; i < 8; i += 2) canto.push(p.x + q[i] * c - q[i + 1] * s, p.y + q[i] * s + q[i + 1] * c);
      if (mascaras.length > 0) {
        fechar();
        const cortada = cortarPeca(canto, quv, [0, 1, 2, 0, 2, 3], mascaras);
        if (cortada.triangulos.length === 0) continue;
        const nv = cortada.mundo.length / 2;
        const cv = new Float64Array(nv * 4);
        for (let v = 0; v < nv; v++) {
          cv[v * 4] = r;
          cv[v * 4 + 1] = g;
          cv[v * 4 + 2] = b;
          cv[v * 4 + 3] = alpha;
        }
        saida.push({
          slot: nome,
          nome: `${prefixo}${nome}/${emissor.name}`,
          anexo: emissor.name,
          tipo: emissor.type,
          pagina: regiao.page,
          mistura: slot.blend,
          mundo: cortada.mundo,
          uvs: cortada.uvs,
          triangulos: cortada.triangulos,
          cor: [r, g, b, alpha],
          profundidade,
          recortes,
          coresPorVertice: cv
        });
        continue;
      }
      if (pagina !== null && pagina.name !== regiao.page.name) fechar();
      pagina = regiao.page;
      mundo.push(...canto);
      for (let i = 0; i < 8; i++) uvs.push(quv[i]);
      for (let v = 0; v < 4; v++) cores.push(r, g, b, alpha);
    }
    fechar();
  }
  var VISTA_PARADA = Object.freeze({ x: 0, y: 0, angulo: 0, escalaX: 1, escalaY: 1 });
  function paraConstruct(vista, ex, ey, saida, i) {
    const lx = ex * vista.escalaX;
    const ly = -ey * vista.escalaY;
    const c = Math.cos(vista.angulo);
    const s = Math.sin(vista.angulo);
    saida[i] = vista.x + lx * c - ly * s;
    saida[i + 1] = vista.y + lx * s + ly * c;
    saida[i + 2] = vista.z ?? 0;
  }
  function noLayout(vista, m) {
    const p = new Float64Array(6);
    paraConstruct(vista, m.worldX, m.worldY, p, 0);
    paraConstruct(vista, m.worldX + m.a, m.worldY + m.c, p, 3);
    const graus = Math.atan2(p[4] - p[1], p[3] - p[0]) * 180 / Math.PI;
    return { x: p[0], y: p[1], angulo: graus < 0 ? graus + 360 : graus };
  }
  var MAXIMO_DE_VERTICES = 65536;
  function montarLotes(pecas, vista = VISTA_PARADA) {
    const lotes = [];
    const corVista = vista.cor ?? [1, 1, 1, 1];
    let i = 0;
    while (i < pecas.length) {
      const primeira = pecas[i];
      let fim = i;
      let vertices = 0;
      let indices = 0;
      while (fim < pecas.length) {
        const p = pecas[fim];
        if (p.pagina.name !== primeira.pagina.name || p.mistura !== primeira.mistura) break;
        const n = p.mundo.length / 2;
        if (vertices + n > MAXIMO_DE_VERTICES && fim > i) break;
        vertices += n;
        indices += p.triangulos.length;
        fim++;
      }
      const posicoes = new Float32Array(vertices * 3);
      const uvs = new Float32Array(vertices * 2);
      const cores = new Float32Array(vertices * 4);
      const ind = new Uint16Array(indices);
      const nomes = [];
      let v = 0;
      let k = 0;
      for (let j = i; j < fim; j++) {
        const p = pecas[j];
        nomes.push(`${p.slot}/${p.anexo}`);
        const a = p.cor[3] * corVista[3];
        const r = p.cor[0] * corVista[0] * a;
        const g = p.cor[1] * corVista[1] * a;
        const b = p.cor[2] * corVista[2] * a;
        const cpv = p.coresPorVertice;
        const n = p.mundo.length / 2;
        for (const t of p.triangulos) ind[k++] = v + t;
        for (let q = 0; q < n; q++) {
          paraConstruct(vista, p.mundo[q * 2], p.mundo[q * 2 + 1], posicoes, (v + q) * 3);
          uvs[(v + q) * 2] = p.uvs[q * 2];
          uvs[(v + q) * 2 + 1] = p.uvs[q * 2 + 1];
          const c = (v + q) * 4;
          if (cpv === void 0) {
            cores[c] = r;
            cores[c + 1] = g;
            cores[c + 2] = b;
            cores[c + 3] = a;
          } else {
            const av = cpv[q * 4 + 3] * corVista[3];
            cores[c] = cpv[q * 4] * corVista[0] * av;
            cores[c + 1] = cpv[q * 4 + 1] * corVista[1] * av;
            cores[c + 2] = cpv[q * 4 + 2] * corVista[2] * av;
            cores[c + 3] = av;
          }
        }
        v += n;
      }
      lotes.push({ pagina: primeira.pagina, mistura: primeira.mistura, posicoes, uvs, indices: ind, cores, pecas: nomes });
      i = fim;
    }
    return lotes;
  }
  var MISTURA_DO_CONSTRUCT = Object.freeze({
    normal: "normal",
    additive: "additive",
    multiply: "multiply",
    screen: "screen"
  });
  function caixaDaInstancia(r, escala) {
    const meiaL = Math.max(Math.abs(r.x), Math.abs(r.x + r.width));
    const meiaA = Math.max(Math.abs(r.y), Math.abs(r.y + r.height));
    return { largura: Math.max(1, 2 * meiaL * Math.abs(escala)), altura: Math.max(1, 2 * meiaA * Math.abs(escala)) };
  }

  // leitor-construct/src/carregar.ts
  var MAXIMO_DE_VOLTAS = 12;
  var decodificador = new TextDecoder("utf-8");
  function pastaDe(caminho) {
    const i = caminho.lastIndexOf("/");
    return i < 0 ? "" : caminho.slice(0, i + 1);
  }
  function comoAtlas(bytes) {
    let arvore;
    try {
      arvore = parseBoneText(decodificador.decode(bytes));
    } catch {
      return null;
    }
    if (typeof arvore !== "object" || arvore === null) return null;
    const o = arvore;
    if (!Array.isArray(o.pages) || !Array.isArray(o.regions)) return null;
    return loadAtlas(arvore);
  }
  async function carregarBoneco(caminho, ler) {
    const avisos = [];
    const base = pastaDe(caminho);
    const bytes = await ler(caminho);
    if (bytes === null) throw new Error(`O arquivo "${caminho}" n\xE3o est\xE1 na pasta Files do projeto.`);
    const codificacao = detectEncoding(bytes);
    if (codificacao === "bonez") {
      throw new Error(`"${caminho}" \xE9 um pacote .bonez: o leitor do Construct ainda n\xE3o abre pacote (rodada K7). Use o .bone com o atlas e a imagem ao lado.`);
    }
    const imagens = /* @__PURE__ */ new Map();
    const anotarPaginas = (atlas, caminhoDoAtlas) => {
      for (const pagina of atlas.pages) {
        const img = joinUri(pastaDe(caminhoDoAtlas), pagina.image);
        const ja = imagens.get(pagina.name);
        if (ja !== void 0 && ja !== img) {
          avisos.push(`Duas imagens diferentes para a p\xE1gina "${pagina.name}" do atlas: "${ja}" e "${img}". Fica a primeira.`);
          continue;
        }
        imagens.set(pagina.name, img);
      }
    };
    const atlases = [];
    if (codificacao === "bone") {
      const arvore = parseBoneText(decodificador.decode(bytes));
      const nomes = Array.isArray(arvore.assets?.atlases) ? arvore.assets.atlases : [];
      for (const nome of nomes) {
        if (typeof nome !== "string") continue;
        const rel = joinUri(base, nome);
        const b = await ler(rel);
        if (b === null) {
          avisos.push(`O atlas "${nome}" n\xE3o est\xE1 na pasta Files: as imagens do boneco n\xE3o v\xE3o aparecer.`);
          continue;
        }
        const atlas = comoAtlas(b);
        if (atlas === null) {
          avisos.push(`"${nome}" n\xE3o \xE9 um atlas que o leitor entenda.`);
          continue;
        }
        atlases.push(atlas);
        anotarPaginas(atlas, rel);
      }
    }
    const lidos = /* @__PURE__ */ new Map();
    let arquivo = null;
    for (let volta = 0; volta < MAXIMO_DE_VOLTAS; volta++) {
      const pedidos = /* @__PURE__ */ new Set();
      arquivo = loadSkeletonFile(bytes, {
        atlases,
        files: (pedido) => {
          if (lidos.has(pedido)) return lidos.get(pedido);
          pedidos.add(pedido);
          return null;
        }
      });
      if (pedidos.size === 0) break;
      for (const pedido of pedidos) {
        const rel = joinUri(base, pedido);
        const b = await ler(rel);
        lidos.set(pedido, b);
        if (b !== null && /\.atlas(\.json)?$/i.test(pedido)) {
          const atlas = comoAtlas(b);
          if (atlas !== null) anotarPaginas(atlas, rel);
        }
      }
      if (volta === MAXIMO_DE_VOLTAS - 1) {
        avisos.push(`O boneco pediu arquivos por mais de ${MAXIMO_DE_VOLTAS} voltas; parei de buscar.`);
      }
    }
    const final = arquivo;
    for (const w of final.warnings) avisos.push(w);
    for (const w of final.data.warnings) avisos.push(`${w.pointer} ${w.message}`);
    for (const f of final.missingFiles) avisos.push(`Falta o arquivo "${joinUri(base, f)}" na pasta Files.`);
    for (const img of final.data.missingImages) avisos.push(`O atlas n\xE3o tem a imagem "${img}".`);
    if (final.bodies.size > 0) {
      avisos.push(`O boneco troca de base (9.13) em ${final.bodies.size} anima\xE7\xE3o(\xF5es): o Construct ainda n\xE3o troca a base; toca tudo na base principal.`);
    }
    return { arquivo: final, imagens, avisos: [...new Set(avisos)] };
  }

  // leitor-construct/src/tocador.ts
  function skinsDaPropriedade(texto) {
    return texto.split(",").map((s) => s.trim()).filter((s) => s !== "");
  }
  var SKIN_DOS_ENCAIXES = "(encaixes do jogo)";
  var Tocador = class {
    constructor(dados, avisos = new Avisos()) {
      __publicField(this, "esqueleto");
      __publicField(this, "estado", new AnimationState());
      __publicField(this, "avisos");
      /** `true`: o tempo do boneco não anda (a pose fica). */
      __publicField(this, "pausado", false);
      /**
       * A pasta do `.bone` dentro de *Files* (`""` = a raiz). A `uri` de uma
       * entidade do arquivo é relativa a ela; o jogo fala pelo caminho inteiro.
       */
      __publicField(this, "pasta", "");
      __publicField(this, "fila", []);
      /** As entidades que o jogo já carregou, por caminho. */
      __publicField(this, "entidades", /* @__PURE__ */ new Map());
      /** slot → o que o jogo encaixou nele. */
      __publicField(this, "encaixes", /* @__PURE__ */ new Map());
      /** slot → a ordem do jogo para a peça dele. */
      __publicField(this, "ordens", /* @__PURE__ */ new Map());
      /** A skin feita na hora, no topo da pilha; `null` sem nenhum encaixe. */
      __publicField(this, "skinDosEncaixes", null);
      /** A entrada da trilha 0 e o tempo dela no passo anterior, para os `reset` da física (9.8). */
      __publicField(this, "ultimaEntrada", null);
      __publicField(this, "ultimoTempo", Number.NEGATIVE_INFINITY);
      this.avisos = avisos;
      this.esqueleto = new Skeleton(dados);
      this.esqueleto.setToSetupPose();
      this.esqueleto.updateWorldTransform();
      this.estado.addListener({
        // "Terminou" só existe para quem não está em laço: o laço não termina,
        // ele dá a volta (é o "Ao terminar" do Sprite do Construct).
        complete: (entrada) => {
          if (!entrada.loop) this.fila.push({ tipo: "terminou", animacao: entrada.animation.name });
        },
        event: (entrada, disparo) => {
          const k = disparo.key;
          this.fila.push({
            tipo: "evento",
            animacao: entrada.animation.name,
            nome: k.event.name,
            inteiro: k.int,
            numero: k.float,
            texto: k.string
          });
        }
      });
    }
    /** O que aconteceu desde a última chamada, na ordem; a fila fica vazia. */
    tirarOcorrencias() {
      return this.fila.splice(0, this.fila.length);
    }
    /** A velocidade da animação: 1 é a do editor, 2 é o dobro, 0,5 a metade. */
    get velocidade() {
      return this.estado.timeScale;
    }
    set velocidade(v) {
      if (!Number.isFinite(v) || v < 0) {
        this.avisos.avisar(`velocidade:${v}`, `Velocidade ${v} n\xE3o serve (tem de ser um n\xFAmero de 0 para cima): fica ${this.estado.timeScale}.`);
        return;
      }
      this.estado.timeScale = v;
    }
    /** Está tocando `nome` agora? Uma animação sem laço que já chegou ao fim não está mais tocando. */
    estaTocando(nome) {
      const atual = this.estado.getCurrent(0);
      return atual !== null && atual.animation.name === nome && !atual.isComplete;
    }
    /** Os nomes das animações do boneco, na ordem do arquivo. */
    get animacoes() {
      return this.esqueleto.data.animations.map((a) => a.name);
    }
    /**
     * Toca a animação `nome`, do começo, em laço ou não. Nome que o boneco não
     * tem: não troca nada, avisa (regra 21) e devolve `false`.
     */
    tocar(nome, emLaco) {
      const anim = this.esqueleto.data.animations.find((a) => a.name === nome);
      if (anim === void 0) {
        const tem = this.animacoes.map((n) => `"${n}"`).join(", ") || "nenhuma";
        this.avisos.avisar(`tocar:${nome}`, `O boneco n\xE3o tem a anima\xE7\xE3o "${nome}". Tem: ${tem}.`);
        return false;
      }
      this.estado.setAnimation(0, anim, emLaco, 0);
      this.estado.apply(this.esqueleto);
      this.aplicarOrdens();
      this.esqueleto.updateWorldTransform();
      return true;
    }
    /** O nome da animação que está tocando, ou `""` quando nenhuma. */
    get nomeTocando() {
      return this.estado.getCurrent(0)?.animation.name ?? "";
    }
    /** Se a animação que está tocando volta ao começo quando acaba. */
    get emLacoTocando() {
      return this.estado.getCurrent(0)?.loop ?? false;
    }
    /** As skins que o boneco tem, na ordem do arquivo (as de outro arquivo, no fim). */
    get skins() {
      return this.esqueleto.data.skins.map((k) => k.name);
    }
    /** A pilha vestida agora, de baixo para cima (a skin dos encaixes fica de fora: é do leitor). */
    get pilha() {
      return this.pilhaDoJogo().map((k) => k.name);
    }
    /** As skins que o jogo vestiu, sem a dos encaixes. */
    pilhaDoJogo() {
      return this.esqueleto.skinStack.filter((k) => k !== this.skinDosEncaixes);
    }
    /**
     * Veste a skin `nome`: ela vai para o topo da pilha e vence as de baixo.
     * Nome que o boneco não tem: não muda nada, avisa e devolve `false`.
     */
    vestir(nome) {
      const skin = this.esqueleto.data.findSkin(nome);
      if (skin === null) {
        this.avisarSkin(nome);
        return false;
      }
      this.trocarPilha([...this.pilhaDoJogo().filter((k) => k !== skin), skin]);
      return true;
    }
    /**
     * Tira a skin `nome` da pilha. Se ela não estava vestida, nada muda (não é
     * erro: o jogo pode tirar por garantia). Nome que o boneco não tem: avisa.
     */
    tirar(nome) {
      const skin = this.esqueleto.data.findSkin(nome);
      if (skin === null) {
        this.avisarSkin(nome);
        return false;
      }
      if (!this.pilhaDoJogo().includes(skin)) return true;
      this.trocarPilha(this.pilhaDoJogo().filter((k) => k !== skin));
      return true;
    }
    avisarSkin(nome) {
      const tem = this.skins.map((n) => `"${n}"`).join(", ") || "nenhuma";
      this.avisos.avisar(`skin:${nome}`, `O boneco n\xE3o tem a skin "${nome}". Tem: ${tem}.`);
    }
    /**
     * Troca a pilha do JOGO e repõe a pose do mesmo instante, para o desenho
     * seguinte já sair certo. A skin dos encaixes volta sempre por cima.
     */
    trocarPilha(pilha) {
      const comEncaixes = this.skinDosEncaixes === null ? pilha : [...pilha, this.skinDosEncaixes];
      this.esqueleto.setSkinStack(comEncaixes);
      this.reposar();
    }
    /** Repõe a pose do mesmo instante (depois de uma pilha ou de uma ordem nova). */
    reposar() {
      this.esqueleto.setToSetupPose();
      if (this.estado.getCurrent(0) !== null) this.estado.apply(this.esqueleto);
      this.aplicarOrdens();
      this.esqueleto.updateWorldTransform();
    }
    /** Anda `dt` segundos: a animação, o relógio da física e a pose de mundo. */
    avancar(dt) {
      const passo = !this.pausado && dt > 0 && Number.isFinite(dt) ? dt : 0;
      this.estado.update(passo);
      const atual = this.estado.getCurrent(0);
      if (atual === null) this.esqueleto.setToSetupPose();
      else this.estado.apply(this.esqueleto);
      this.soltarResets(atual);
      for (const ordem of this.ordens.values()) ordem.relogio += passo * this.estado.timeScale;
      this.aplicarOrdens();
      this.esqueleto.advance(passo);
    }
    /**
     * As chaves `reset` da física (9.8) que a agulha cruzou neste passo, em
     * `(antes, agora]`, como o `pose-dump` da conformidade faz: na primeira vez
     * de uma entrada, `antes` é -∞, e uma chave no tempo 0 dispara uma vez. O
     * `AnimationState` solta os eventos, mas não os `reset` (achado 2 da G6).
     */
    soltarResets(atual) {
      if (atual === null) {
        this.ultimaEntrada = null;
        return;
      }
      const antes = atual === this.ultimaEntrada ? this.ultimoTempo : Number.NEGATIVE_INFINITY;
      applyResets(this.esqueleto, atual.animation, antes, atual.trackTime, atual.loop);
      this.ultimaEntrada = atual;
      this.ultimoTempo = atual.trackTime;
    }
    // -------------------------------------------------------------------------
    // A conexão (rodada K5)
    // -------------------------------------------------------------------------
    /** Guarda uma entidade que o jogo carregou da pasta *Files*. Carregar é do `instance.js` (assíncrono). */
    registrarEntidade(caminho, dados) {
      this.entidades.set(caminho, dados);
    }
    /** Já carregada? */
    temEntidade(caminho) {
      return this.entidades.has(caminho);
    }
    /** As entidades carregadas pelo jogo, na ordem em que chegaram. */
    get entidadesCarregadas() {
      return [...this.entidades.keys()];
    }
    /** Os slots do boneco, na ordem do arquivo. */
    get slots() {
      return this.esqueleto.slots.map((s) => s.data.name);
    }
    /** Os encaixes feitos pelo jogo, por slot, na ordem em que foram feitos. */
    get encaixesDoJogo() {
      return this.encaixes;
    }
    /** As ordens do jogo para as peças, por slot. */
    get ordensDoJogo() {
      return this.ordens;
    }
    /** O slot `nome`, ou `null` com aviso (regra 21). */
    slotOuAviso(nome, gesto) {
      const slot = this.esqueleto.data.findSlot(nome);
      if (slot !== null) return slot;
      const tem = this.slots.map((n) => `"${n}"`).join(", ") || "nenhum";
      this.avisos.avisar(`slot:${gesto}:${nome}`, `${gesto}: o boneco n\xE3o tem o slot "${nome}". Tem: ${tem}.`);
      return null;
    }
    /**
     * ENCAIXAR: a entidade `caminho` no slot `slot`. Com `emVolta` (o "Este
     * boneco", 7.11 `around`), o nome do slot DA ENTIDADE que marca o meio: o que
     * ela tem antes dele vai para trás do boneco inteiro, o que tem depois vai
     * para a frente. Vazio: em bloco. Só aquele slot muda (as duas armas iguais).
     * O leitor não recusa encaixe: o limite é do jogo, pelo gatilho "Ao encaixar".
     */
    encaixar(slot, caminho, emVolta = "") {
      const dados = this.slotOuAviso(slot, `Encaixar "${caminho}"`);
      if (dados === null) return false;
      const entidade = this.entidades.get(caminho);
      if (entidade === void 0) {
        this.avisos.avisar(
          `entidade:${caminho}`,
          `Encaixar: a pe\xE7a "${caminho}" n\xE3o foi carregada (n\xE3o est\xE1 na pasta Files, ou n\xE3o abriu). O slot "${slot}" ficou como estava.`
        );
        return false;
      }
      const meio = emVolta.trim() === "" ? null : emVolta.trim();
      if (meio !== null && entidade.findSlot(meio) === null) {
        this.avisos.avisar(
          `em-volta:${caminho}:${meio}`,
          `Encaixar em volta: a pe\xE7a "${caminho}" n\xE3o tem o slot "${meio}" para marcar o meio. Ela \xE9 desenhada em bloco (7.11).`
        );
      }
      if (this.nomesDoSlot(dados).length === 0) {
        this.avisos.avisar(
          `slot-vazio:${slot}`,
          `Encaixar: o slot "${slot}" nunca mostra imagem (nem no repouso, nem numa skin, nem numa chave). A pe\xE7a "${caminho}" fica guardada nele, mas n\xE3o aparece.`
        );
      }
      this.encaixes.delete(slot);
      this.encaixes.set(slot, { caminho, emVolta: meio });
      this.ordens.delete(slot);
      this.refazerEncaixes();
      this.fila.push({ tipo: "encaixou", slot, caminho });
      return true;
    }
    /** DESENCAIXAR: tira o que o jogo encaixou no slot. A imagem de antes volta. */
    desencaixar(slot) {
      if (this.slotOuAviso(slot, "Desencaixar") === null) return false;
      const tinhaOrdem = this.ordens.delete(slot);
      if (!this.encaixes.delete(slot)) {
        if (tinhaOrdem) this.reposar();
        return true;
      }
      this.refazerEncaixes();
      return true;
    }
    /**
     * ENCAIXAR TODAS (as rodas): troca a entidade `de` pela `para` em TODO slot
     * que a mostra agora — os que o jogo encaixou e os que o arquivo traz.
     * Devolve quantos slots trocou; nenhum é aviso.
     */
    encaixarTodas(de, para, emVolta = "") {
      const alvos = this.esqueleto.slots.map((s) => s.data.name).filter((nome) => this.pecaDoSlot(nome) === de);
      if (alvos.length === 0 || de === "") {
        this.avisos.avisar(`todas:${de}`, `Encaixar todas: nenhum slot mostra a pe\xE7a "${de}" agora. Nada mudou.`);
        return 0;
      }
      let n = 0;
      for (const nome of alvos) if (this.encaixar(nome, para, emVolta)) n++;
      return n;
    }
    /**
     * O que o slot mostra agora: o caminho da entidade (a partir de *Files*), o
     * nome da imagem, ou `""` quando nada.
     */
    pecaDoSlot(slot) {
      if (this.slotOuAviso(slot, "PecaDoSlot") === null) return "";
      const att = this.esqueleto.findSlot(slot).attachment;
      if (att === null) return "";
      if (att instanceof SkeletonAttachment) {
        const doJogo = this.encaixes.get(slot);
        return doJogo !== void 0 ? doJogo.caminho : joinUri(this.pasta, att.resolvedUri);
      }
      return att.name;
    }
    /**
     * ANIMAR A PEÇA: a entidade do slot toca `animacao`, do começo, num relógio
     * dela (a velocidade do boneco vale; a pausa também). Vale para a peça que o
     * jogo encaixou e para a que o arquivo traz. Uma chave `nested/animation` da
     * animação de quem recebe vence (quem escolheu na faixa manda, `02`; `08`
     * 6.2): a ordem espera, e o leitor avisa. Animação que a peça não tem: ela
     * fica parada, e avisa. `relogio` só o jogo salvo usa: de onde a peça volta.
     */
    animarPeca(slot, animacao, laco, relogio = 0) {
      if (this.slotOuAviso(slot, "Animar a pe\xE7a") === null) return false;
      const peca = this.dadosDaPeca(slot);
      if (peca === null) {
        this.avisos.avisar(`sem-peca:${slot}`, `Animar a pe\xE7a: o slot "${slot}" n\xE3o mostra entidade agora. Nada mudou.`);
        return false;
      }
      if (peca.findAnimation(animacao) === null) {
        const tem = peca.animations.map((a) => `"${a.name}"`).join(", ") || "nenhuma";
        this.avisos.avisar(
          `anim-peca:${slot}:${animacao}`,
          `Animar a pe\xE7a: a pe\xE7a do slot "${slot}" n\xE3o tem a anima\xE7\xE3o "${animacao}". Ela fica parada. Tem: ${tem}.`
        );
      }
      this.ordens.set(slot, { animacao, laco, relogio: Number.isFinite(relogio) && relogio > 0 ? relogio : 0 });
      this.reposar();
      return true;
    }
    /** SOLTAR A PEÇA: ninguém manda nela — nenhuma animação por cima, a pose de repouso dela. */
    soltarPeca(slot) {
      if (this.slotOuAviso(slot, "Soltar a pe\xE7a") === null) return false;
      this.ordens.set(slot, { animacao: null, laco: false, relogio: 0 });
      this.reposar();
      return true;
    }
    /**
     * A matriz de mundo do osso `nome`, no espaço do esqueleto (para OssoX,
     * OssoY, OssoAngulo). Osso que não existe: `null`, e avisa.
     */
    matrizDoOsso(nome) {
      const osso = this.esqueleto.findBone(nome);
      if (osso !== null) return osso;
      const tem = this.esqueleto.bones.map((b) => `"${b.data.name}"`).join(", ") || "nenhum";
      this.avisos.avisar(`osso:${nome}`, `OssoX/OssoY/OssoAngulo: o boneco n\xE3o tem o osso "${nome}". Tem: ${tem}.`);
      return null;
    }
    /**
     * A matriz do PINO da peça do slot (para SlotX, SlotY, SlotAngulo): o osso
     * do slot (com a chave `slot/bone`, 9.5) vezes o `x, y, rotation, scale` da
     * imagem ou da entidade que ele mostra agora — onde a peça está. Malha ou
     * slot vazio: o osso do slot. Slot que não existe: `null`, e avisa.
     */
    matrizDoSlot(nome) {
      if (this.slotOuAviso(nome, "SlotX/SlotY/SlotAngulo") === null) return null;
      const slot = this.esqueleto.findSlot(nome);
      const att = slot.attachment;
      const osso = slot.boneMatrix;
      if (att === null || typeof att.scaleX !== "number") return multiplyMatrix(osso, composeMatrix(0, 0, 0, 1, 1));
      return multiplyMatrix(osso, composeMatrix(att.x ?? 0, att.y ?? 0, att.rotation ?? 0, att.scaleX, att.scaleY ?? 1));
    }
    /** Os dados da entidade que o slot mostra agora, ou `null`. */
    dadosDaPeca(slot) {
      const att = this.esqueleto.findSlot(slot)?.attachment ?? null;
      return att instanceof SkeletonAttachment ? att.child : null;
    }
    /**
     * Todo placeholder que o slot pode pedir: o do repouso, os de toda skin do
     * arquivo, os das chaves `slot/attachment` de toda animação. A skin dos
     * encaixes cobre todos: é assim que nenhuma chave desfaz o encaixe.
     */
    nomesDoSlot(slot) {
      const nomes = /* @__PURE__ */ new Set();
      if (slot.attachmentName !== null) nomes.add(slot.attachmentName);
      for (const skin of this.esqueleto.data.skins) {
        for (const nome of skin.attachments.get(slot.index)?.keys() ?? []) nomes.add(nome);
      }
      for (const anim of this.esqueleto.data.animations) {
        for (const tl of anim.timelines) {
          if (tl.kind !== "slot.attachment" || tl.slot !== slot) continue;
          for (const v of tl.keys.values) if (v !== null) nomes.add(v);
        }
      }
      return [...nomes];
    }
    /** Refaz a skin dos encaixes a partir do mapa, e a põe no topo da pilha. */
    refazerEncaixes() {
      const jogo = this.pilhaDoJogo();
      const resolucao = [];
      for (const k of jogo) k.expand(resolucao);
      const debaixo = (slot, nome) => {
        for (let i = resolucao.length - 1; i >= 0; i--) {
          const a = resolucao[i].getAttachment(slot, nome);
          if (a !== void 0) return a;
        }
        return void 0;
      };
      let skin = null;
      for (const [nomeDoSlot, encaixe] of this.encaixes) {
        const slot = this.esqueleto.data.findSlot(nomeDoSlot);
        const filho = this.entidades.get(encaixe.caminho);
        for (const nome of this.nomesDoSlot(slot)) {
          const imagem = debaixo(slot.index, nome);
          if (imagem === null) continue;
          const pino = imagem !== void 0 && "scaleX" in imagem ? imagem : {};
          const att = new SkeletonAttachment(nome, {
            uri: encaixe.caminho,
            around: encaixe.emVolta,
            loop: false,
            x: pino.x ?? 0,
            y: pino.y ?? 0,
            rotation: pino.rotation ?? 0,
            scaleX: pino.scaleX ?? 1,
            scaleY: pino.scaleY ?? 1
          });
          att.resolvedUri = encaixe.caminho;
          att.child = filho;
          skin ??= new SkinData(-1, SKIN_DOS_ENCAIXES);
          skin.setAttachment(slot.index, nome, att);
        }
      }
      this.skinDosEncaixes = skin;
      this.trocarPilha(jogo);
    }
    /**
     * Escreve as ordens do jogo nos slots, DEPOIS da animação de quem recebe e
     * ANTES da pose de mundo, pelo canal das chaves `nested/animation` e
     * `nested/time` (9.9) — que é o que a 7.11 lê para escolher a animação e o
     * tempo do filho. Nenhuma linha do runtime muda.
     */
    aplicarOrdens() {
      for (const [nome, ordem] of this.ordens) {
        const slot = this.esqueleto.findSlot(nome);
        if (slot === null) continue;
        if (slot.nestedAnimationSet) {
          this.avisos.avisar(
            `ordem-chave:${nome}:${this.nomeTocando}`,
            `A anima\xE7\xE3o "${this.nomeTocando}" escolhe a anima\xE7\xE3o da pe\xE7a do slot "${nome}" (chave nested/animation): ela manda, e a ordem do jogo espera (08, 6.2).`
          );
          continue;
        }
        slot.nestedAnimationSet = true;
        slot.nestedAnimation = ordem.animacao;
        const att = slot.attachment;
        const anim = ordem.animacao === null || !(att instanceof SkeletonAttachment) || att.child === null ? null : att.child.findAnimation(ordem.animacao);
        if (anim === null) {
          slot.nestedTime = 0;
          continue;
        }
        const d = anim.duration;
        let t = ordem.relogio;
        if (d > 0) t = ordem.laco ? t - Math.floor(t / d) * d : Math.min(t, d);
        if (!ordem.laco && att instanceof SkeletonAttachment && att.loop && d > 0 && t >= d) t = d - d * Number.EPSILON;
        slot.nestedTime = t;
      }
    }
  };
  return __toCommonJS(pacote_exports);
})();
globalThis.RecorteRuntime = RecorteRuntime;
