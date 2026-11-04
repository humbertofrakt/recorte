var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// recorte-pacote:pacote
var require_pacote = __commonJS({
  "recorte-pacote:pacote"(exports, module) {
    module.exports = globalThis.RecorteRuntime;
  }
});

// ferramentas/src/conformidade/pose-dump.ts
var import_src = __toESM(require_pacote(), 1);
var import_render_list = __toESM(require_pacote(), 1);
var import_math = __toESM(require_pacote(), 1);
var import_vertex_attachment = __toESM(require_pacote(), 1);
var import_region = __toESM(require_pacote(), 1);
var import_mesh = __toESM(require_pacote(), 1);
var import_linkedmesh = __toESM(require_pacote(), 1);
var import_boundingbox = __toESM(require_pacote(), 1);
var import_point = __toESM(require_pacote(), 1);
var import_particle = __toESM(require_pacote(), 1);
var import_emission = __toESM(require_pacote(), 1);
var import_emitter = __toESM(require_pacote(), 1);
var import_bone_poser = __toESM(require_pacote(), 1);
var POSE_DUMP_VERSION = "1.0";
var DUMP_DECIMALS = 6;
var DEFAULT_MEASURE = ["bones", "slots", "drawOrder", "events", "tags"];
var TOLERANCES = Object.freeze({
  position: 1e-3,
  angle: 0.01,
  matrix: 1e-4,
  color: 1e-3,
  uv: 1e-6
});
var PHYSICS_TOLERANCES = Object.freeze({
  position: 0.01,
  angle: 0.01,
  matrix: 1e-4,
  color: 1e-3,
  uv: 1e-6
});
function round(value) {
  if (!Number.isFinite(value)) return 0;
  const k = 10 ** DUMP_DECIMALS;
  const r = Math.round(value * k) / k;
  return r === 0 ? 0 : r;
}
function animationTime(now, duration, loop) {
  if (!loop || duration <= 0) return now;
  const t = now - Math.floor(now / duration) * duration;
  return t;
}
function measureSet(probe) {
  return new Set(probe.measure ?? DEFAULT_MEASURE);
}
function boneSample(bone) {
  return {
    a: round(bone.a),
    b: round(bone.b),
    c: round(bone.c),
    d: round(bone.d),
    worldX: round(bone.worldX),
    worldY: round(bone.worldY),
    ax: round(bone.ax),
    ay: round(bone.ay),
    arotation: round((0, import_math.normalizeAngle)(bone.arotation)),
    ascaleX: round(bone.ascaleX),
    ascaleY: round(bone.ascaleY),
    ashearX: round((0, import_math.normalizeAngle)(bone.ashearX)),
    ashearY: round((0, import_math.normalizeAngle)(bone.ashearY))
  };
}
function sequenceFrame(slot) {
  const att = slot.attachment;
  const sequence = att === null ? null : att.sequence ?? null;
  return sequence === null || sequence === void 0 ? -1 : sequence.frameIndexFor(slot);
}
function slotSample(slot) {
  return {
    attachment: slot.attachment === null ? null : slot.attachment.name,
    color: Array.from(slot.color, round),
    darkColor: slot.darkColor === null ? null : Array.from(slot.darkColor, round),
    visible: slot.visible,
    sequenceIndex: sequenceFrame(slot),
    bone: slot.bone.data.name
  };
}
function buildPoseDump(data, probe, bodies = /* @__PURE__ */ new Map()) {
  const actor = new import_src.Actor(data, bodies);
  actor.setSkinStack(probe.skins ?? ["default"]);
  let animation = null;
  if (probe.animation !== void 0 && probe.animation !== null) {
    animation = data.findAnimation(probe.animation);
    if (animation === null) throw new Error(`anima\xE7\xE3o n\xE3o encontrada: "${probe.animation}"`);
  }
  const duration = animation === null ? 0 : animation.duration;
  const loop = probe.loop ?? false;
  const want = measureSet(probe);
  const times = probe.times;
  const dt = probe.physicsDt ?? 0;
  const samples = [];
  let previous = -Infinity;
  let lastStep = -Infinity;
  const childClocks = /* @__PURE__ */ new Map();
  const poser = want.has("particles") ? new import_bone_poser.BonePoser(data, animation, { skins: probe.skins ?? ["default"], bodies, loop }) : null;
  const take = (now) => {
    samples.push(makeSample(actor, animation, now, duration, loop, previous, want, childClocks, poser));
    previous = now;
  };
  const posePose = (now) => {
    const skeleton = actor.prepare(animation, animationTime(now, duration, loop), loop);
    skeleton.time = now;
    const bound = actor.boundAnimation;
    if (bound !== null) (0, import_src.applyResets)(skeleton, bound, lastStep, now, loop);
    lastStep = now;
    skeleton.updateWorldTransform(now);
  };
  if (dt > 0) {
    const last = times.length === 0 ? 0 : Math.max(...times);
    const steps = Math.round(last / dt);
    let next = 0;
    for (let i = 0; i <= steps; i++) {
      const now = i * dt;
      posePose(now);
      while (next < times.length && Math.abs(times[next] - now) <= dt * 1e-6) {
        take(now);
        next++;
      }
    }
    if (next < times.length) {
      throw new Error(`com physicsDt cada tempo pedido tem que ser m\xFAltiplo do passo; falta ${times[next]}`);
    }
  } else {
    for (const now of times) {
      posePose(now);
      take(now);
    }
  }
  return { version: POSE_DUMP_VERSION, samples };
}
function eachSkeleton(skeleton, prefix, visit, owner = null) {
  visit(skeleton, prefix, owner);
  for (const slot of skeleton.slots) {
    const nested = slot.nested;
    if (nested === null || slot.attachment !== nested.attachment) continue;
    eachSkeleton(nested.skeleton, `${prefix}${slot.data.name}/`, visit, slot);
  }
}
function emittingKeys(animation, slotName, attachmentName) {
  if (animation === null) return null;
  for (const tl of animation.timelines) {
    if (tl.kind !== "particle.emitting") continue;
    if (tl.slot.name !== slotName || tl.attachmentName !== attachmentName) continue;
    return tl.keys;
  }
  return null;
}
function emitterPose(slot, att, prefix, poser) {
  const needsPast = att.space === "world" || att.shape === "mesh" || att.shape === "path";
  if (!needsPast) {
    return { matrixAt: () => slot.boneMatrix, boneLength: () => slot.bone.data.length };
  }
  if (poser === null || prefix !== "") {
    throw new Error(`o emissor "${prefix}${slot.data.name}/${att.name}" pede a pose de um instante passado dentro de um esqueleto aninhado; o dump ainda n\xE3o mede isso`);
  }
  return poser.poseFor(slot.data.name, att.mesh, att.curve);
}
function particleSample(p) {
  return {
    flow: p.flow,
    index: p.index,
    birth: round(p.birth),
    life: round(p.life),
    age: round(p.age),
    x: round(p.x),
    y: round(p.y),
    // NOT normalized. `251.145834`, not `−108.854166`.
    angle: round(p.angle),
    scale: round(p.scale)
  };
}
function makeSample(actor, animation, now, duration, loop, previous, want, childClocks, poser) {
  const top = actor.skeleton;
  const sample = { time: round(now), body: actor.body };
  if (want.has("bones")) {
    const bones = {};
    eachSkeleton(top, "", (skeleton, prefix) => {
      for (const bone of skeleton.bones) bones[prefix + bone.data.name] = boneSample(bone);
    });
    sample.bones = bones;
  }
  if (want.has("slots")) {
    const slots = {};
    eachSkeleton(top, "", (skeleton, prefix) => {
      for (const slot of skeleton.slots) slots[prefix + slot.data.name] = slotSample(slot);
    });
    sample.slots = slots;
  }
  if (want.has("drawOrder")) {
    sample.drawOrder = top.drawOrder.map((slot) => slot.data.name);
  }
  if (want.has("drawList")) {
    sample.drawList = (0, import_render_list.collectDrawList)(top).map((piece) => ({
      piece: piece.name,
      clips: piece.clips.map((clip) => clip.name)
    }));
  }
  if (want.has("vertices") || want.has("boundingBoxes")) {
    const vertices = {};
    const boxes = {};
    eachSkeleton(top, "", (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (att === null) continue;
        const key = `${prefix}${slot.data.name}/${att.name}`;
        if (att instanceof import_boundingbox.BoundingBoxAttachment) {
          boxes[key] = Array.from(att.computeWorldVertices(slot), round);
        } else if (att instanceof import_vertex_attachment.VertexAttachment) {
          vertices[key] = Array.from(att.computeWorldVertices(slot), round);
        } else if (att instanceof import_region.RegionAttachment) {
          vertices[key] = Array.from(att.computeWorldVertices(slot), round);
        }
      }
    });
    if (want.has("vertices")) sample.vertices = vertices;
    if (want.has("boundingBoxes")) sample.boundingBoxes = boxes;
  }
  if (want.has("uvs")) {
    const uvs = {};
    eachSkeleton(top, "", (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (att === null) continue;
        const key = `${prefix}${slot.data.name}/${att.name}`;
        if (att instanceof import_region.RegionAttachment) {
          uvs[key] = Array.from(att.uvsFor(slot), round);
        } else if (att instanceof import_mesh.MeshAttachment || att instanceof import_linkedmesh.LinkedMeshAttachment) {
          uvs[key] = Array.from(att.regionUVsFor(slot), round);
        }
      }
    });
    sample.uvs = uvs;
  }
  if (want.has("points")) {
    const points = {};
    eachSkeleton(top, "", (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (!(att instanceof import_point.PointAttachment)) continue;
        const matrix = slot.boneMatrix;
        const p = att.computeWorldPosition(matrix);
        points[`${prefix}${slot.data.name}/${att.name}`] = {
          x: round(p.x),
          y: round(p.y),
          rotation: round((0, import_math.normalizeAngle)(att.computeWorldRotation(matrix)))
        };
      }
    });
    sample.points = points;
  }
  if (want.has("particles")) {
    const at = animationTime(now, duration, loop);
    const bound = actor.boundAnimation;
    const out = {};
    eachSkeleton(top, "", (skeleton, prefix) => {
      for (const slot of skeleton.slots) {
        const att = slot.attachment;
        if (!(att instanceof import_particle.ParticleAttachment)) continue;
        const key = `${prefix}${slot.data.name}/${att.name}`;
        const curve = new import_emission.EmissionCurve(att, emittingKeys(bound, slot.data.name, att.name));
        const pose = emitterPose(slot, att, prefix, poser);
        const frame = (0, import_emitter.computeParticles)(att, curve, { time: at, duration }, pose);
        out[key] = frame.particles.map(particleSample);
      }
    });
    sample.particles = out;
  }
  if (want.has("events")) {
    const out = [];
    const push = (fired, name, time = fired.time) => {
      out.push({
        time: round(time),
        event: name,
        int: fired.key.int,
        float: round(fired.key.float),
        string: fired.key.string,
        volume: round(fired.key.volume),
        balance: round(fired.key.balance)
      });
    };
    if (animation !== null) {
      for (const fired of (0, import_src.fireEvents)(animation, previous, now, loop)) push(fired, fired.key.event.name);
    }
    eachSkeleton(top, "", (_skeleton, prefix, owner) => {
      if (owner === null || !(owner.nested instanceof import_src.NestedSkeleton)) return;
      const child = owner.nested;
      const before = childClocks.get(child);
      const scale = child.clockScale === 0 ? 1 : child.clockScale;
      const name = (event) => `${prefix}${event}`;
      const inParent = (childNow, eventTime) => now - (childNow - eventTime) / scale;
      if (child.baseAnimation !== null) {
        const from = before === void 0 || before.base > child.baseTime ? -Infinity : before.base;
        for (const fired of (0, import_src.fireEvents)(child.baseAnimation, from, child.baseTime, true)) {
          push(fired, name(fired.key.event.name), inParent(child.baseTime, fired.time));
        }
      }
      if (child.animation !== null) {
        const from = before === void 0 || before.name !== child.animationName || before.top > child.time ? -Infinity : before.top;
        for (const fired of (0, import_src.fireEvents)(child.animation, from, child.time, child.topLoop)) {
          push(fired, name(fired.key.event.name), inParent(child.time, fired.time));
        }
      }
      childClocks.set(child, { top: child.time, base: child.baseTime, name: child.animationName });
    });
    sample.events = out;
  }
  if (want.has("tags")) {
    sample.tags = animation === null ? [] : Array.from((0, import_src.activeTags)(animation, animationTime(now, duration, loop)));
  }
  if (want.has("variables")) {
    const out = {};
    const list = top.data.variables;
    for (let i = 0; i < list.length; i++) {
      const v = top.variables[i];
      out[list[i].name] = typeof v === "number" ? round(v) : v;
    }
    sample.variables = out;
  }
  if (want.has("parameters")) {
    const out = {};
    const list = top.data.parameters;
    for (let i = 0; i < list.length; i++) out[list[i].name] = round(top.parameters[i]);
    sample.parameters = out;
  }
  return sample;
}
var ANGLE_FIELDS = /* @__PURE__ */ new Set(["arotation", "ashearX", "ashearY", "rotation"]);
var MATRIX_FIELDS = /* @__PURE__ */ new Set(["a", "b", "c", "d", "ascaleX", "ascaleY"]);
function toleranceFor(field, tol) {
  if (ANGLE_FIELDS.has(field)) return tol.angle;
  if (MATRIX_FIELDS.has(field)) return tol.matrix;
  return tol.position;
}
var Comparator = class {
  constructor(tol) {
    this.tol = tol;
  }
  differences = [];
  worstRatio = 0;
  worstDelta = 0;
  add(pointer, delta, tolerance, expected, actual) {
    this.differences.push({ pointer, delta, tolerance, expected, actual });
    const ratio = tolerance > 0 ? delta / tolerance : delta;
    if (ratio > this.worstRatio) this.worstRatio = ratio;
    if (Number.isFinite(delta) && delta > this.worstDelta) this.worstDelta = delta;
  }
  /** Records how far a matching number was, even when it passes. */
  seen(delta, tolerance) {
    const ratio = tolerance > 0 ? delta / tolerance : delta;
    if (ratio > this.worstRatio && delta > tolerance) this.worstRatio = ratio;
    if (delta > this.worstDelta) this.worstDelta = delta;
  }
  number(pointer, field, expected, actual, angle) {
    if (typeof actual !== "number" || !Number.isFinite(actual)) {
      this.add(pointer, Infinity, 0, expected, actual);
      return;
    }
    const tolerance = angle ? this.tol.angle : toleranceFor(field, this.tol);
    const delta = angle || ANGLE_FIELDS.has(field) ? (0, import_math.angleDistance)(expected, actual) : Math.abs(expected - actual);
    if (delta > tolerance) this.add(pointer, delta, tolerance, expected, actual);
    else this.seen(delta, tolerance);
  }
  exact(pointer, expected, actual) {
    if (expected !== actual) this.add(pointer, Infinity, 0, expected, actual);
  }
  /** Numeric array compared element by element with one tolerance. */
  numbers(pointer, expected, actual, tolerance) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      this.add(pointer, Infinity, 0, expected, actual);
      return;
    }
    for (let i = 0; i < expected.length; i++) {
      const a = actual[i];
      if (typeof a !== "number" || !Number.isFinite(a)) {
        this.add(`${pointer}/${i}`, Infinity, 0, expected[i], a);
        continue;
      }
      const delta = Math.abs(expected[i] - a);
      if (delta > tolerance) this.add(`${pointer}/${i}`, delta, tolerance, expected[i], a);
      else this.seen(delta, tolerance);
    }
  }
  /**
   * A particle field that missed. It goes through its own door because the
   * particle comparison picks the ruler itself — above all for `angle`, which
   * must NOT take the circular distance (extension 14.1, leiame of P-001).
   */
  particleOff(pointer, delta, tolerance, expected, actual) {
    this.add(pointer, delta, tolerance, expected, actual);
  }
  /** A particle field that matched, so the worst ratio still sees how close it was. */
  particleSeen(delta, tolerance) {
    this.seen(delta, tolerance);
  }
  strings(pointer, expected, actual) {
    if (!Array.isArray(actual) || actual.length !== expected.length) {
      this.add(pointer, Infinity, 0, expected, actual);
      return;
    }
    for (let i = 0; i < expected.length; i++) this.exact(`${pointer}/${i}`, expected[i], actual[i]);
  }
};
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function compareBones(cmp, pointer, expected, actual) {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) {
    cmp.exact(pointer, "<objeto de ossos>", actual);
    return;
  }
  for (const [name, want] of Object.entries(expected)) {
    const got = actual[name];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) {
      cmp.exact(`${pointer}/${name}`, "<osso>", got);
      continue;
    }
    for (const [field, value] of Object.entries(want)) {
      if (typeof value !== "number") {
        cmp.exact(`${pointer}/${name}/${field}`, value, got[field]);
        continue;
      }
      cmp.number(`${pointer}/${name}/${field}`, field, value, got[field], ANGLE_FIELDS.has(field));
    }
  }
}
function compareSlots(cmp, pointer, expected, actual, tol) {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) {
    cmp.exact(pointer, "<objeto de slots>", actual);
    return;
  }
  for (const [name, want] of Object.entries(expected)) {
    const got = actual[name];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) {
      cmp.exact(`${pointer}/${name}`, "<slot>", got);
      continue;
    }
    for (const [field, value] of Object.entries(want)) {
      const p = `${pointer}/${name}/${field}`;
      if (field === "color" || field === "darkColor") {
        if (value === null || got[field] === null) {
          cmp.exact(p, value, got[field]);
          continue;
        }
        cmp.numbers(p, value, got[field], tol.color);
      } else if (typeof value === "number") {
        cmp.number(p, field, value, got[field], false);
      } else {
        cmp.exact(p, value, got[field]);
      }
    }
  }
}
function compareVectorMap(cmp, pointer, expected, actual, tolerance) {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) {
    cmp.exact(pointer, "<objeto>", actual);
    return;
  }
  for (const [name, want] of Object.entries(expected)) {
    cmp.numbers(`${pointer}/${name}`, want, actual[name], tolerance);
  }
}
function comparePoints(cmp, pointer, expected, actual) {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) {
    cmp.exact(pointer, "<objeto de pontos>", actual);
    return;
  }
  for (const [name, want] of Object.entries(expected)) {
    const got = actual[name];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) {
      cmp.exact(`${pointer}/${name}`, "<ponto>", got);
      continue;
    }
    for (const [field, value] of Object.entries(want)) {
      if (typeof value !== "number") {
        cmp.exact(`${pointer}/${name}/${field}`, value, got[field]);
        continue;
      }
      cmp.number(`${pointer}/${name}/${field}`, field, value, got[field], field === "rotation");
    }
  }
}
function compareEvents(cmp, pointer, expected, actual) {
  if (!Array.isArray(expected)) return;
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    cmp.exact(pointer, `${expected.length} evento(s)`, Array.isArray(actual) ? `${actual.length} evento(s)` : actual);
    return;
  }
  for (let i = 0; i < expected.length; i++) {
    const want = expected[i];
    const got = actual[i];
    if (!isPlainObject(want)) continue;
    if (!isPlainObject(got)) {
      cmp.exact(`${pointer}/${i}`, "<evento>", got);
      continue;
    }
    for (const [field, value] of Object.entries(want)) {
      const p = `${pointer}/${i}/${field}`;
      if (field === "time" || field === "float" || field === "volume" || field === "balance") {
        cmp.number(p, "time", value, got[field], false);
      } else {
        cmp.exact(p, value, got[field]);
      }
    }
  }
}
function compareParticles(cmp, pointer, expected, actual, tol) {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) {
    cmp.exact(pointer, "<objeto de emissores>", actual);
    return;
  }
  for (const [name, want] of Object.entries(expected)) {
    const p = `${pointer}/${name}`;
    const got = actual[name];
    if (!Array.isArray(want)) continue;
    if (!Array.isArray(got)) {
      cmp.exact(p, `${want.length} part\xEDcula(s)`, got === void 0 ? "<emissor ausente>" : got);
      continue;
    }
    if (got.length !== want.length) {
      cmp.exact(p, `${want.length} part\xEDcula(s)`, `${got.length} part\xEDcula(s)`);
      continue;
    }
    for (let i = 0; i < want.length; i++) {
      const w = want[i];
      const g = got[i];
      if (!isPlainObject(w)) continue;
      if (!isPlainObject(g)) {
        cmp.exact(`${p}/${i}`, "<part\xEDcula>", g);
        continue;
      }
      for (const [field, value] of Object.entries(w)) {
        const q = `${p}/${i}/${field}`;
        if (field === "flow" || field === "index") {
          cmp.exact(q, value, g[field]);
          continue;
        }
        if (typeof value !== "number") {
          cmp.exact(q, value, g[field]);
          continue;
        }
        const a = g[field];
        if (typeof a !== "number" || !Number.isFinite(a)) {
          cmp.number(q, field, value, a, false);
          continue;
        }
        const tolerance = tol.position;
        const delta = Math.abs(value - a);
        if (delta > tolerance) cmp.particleOff(q, delta, tolerance, value, a);
        else cmp.particleSeen(delta, tolerance);
      }
    }
  }
}
function compareVariables(cmp, pointer, expected, actual) {
  if (!isPlainObject(expected)) return;
  if (!isPlainObject(actual)) {
    cmp.exact(pointer, "<objeto>", actual);
    return;
  }
  for (const [name, value] of Object.entries(expected)) {
    const p = `${pointer}/${name}`;
    if (typeof value === "number") cmp.number(p, "value", value, actual[name], false);
    else cmp.exact(p, value, actual[name]);
  }
}
function compareDrawList(cmp, pointer, expected, actual) {
  if (!Array.isArray(expected)) return;
  if (!Array.isArray(actual) || actual.length !== expected.length) {
    const names = (list) => Array.isArray(list) ? list.map((e) => isPlainObject(e) ? e.piece : e).join(" \xB7 ") : list;
    cmp.exact(pointer, names(expected), actual === void 0 ? "<sem drawList>" : names(actual));
    return;
  }
  for (let i = 0; i < expected.length; i++) {
    const want = expected[i];
    const got = actual[i];
    if (!isPlainObject(got)) {
      cmp.exact(`${pointer}/${i}`, want.piece, got);
      continue;
    }
    cmp.exact(`${pointer}/${i}/piece`, want.piece, got.piece);
    if ("clips" in want) cmp.strings(`${pointer}/${i}/clips`, want.clips, got.clips);
  }
}
var SAMPLE_KEYS = /* @__PURE__ */ new Set([
  "time",
  "body",
  "bones",
  "slots",
  "drawOrder",
  "drawList",
  "vertices",
  "uvs",
  "boundingBoxes",
  "points",
  "particles",
  "events",
  "tags",
  "variables",
  "parameters"
]);
function comparePoseDump(expected, actual, tolerances = TOLERANCES) {
  const cmp = new Comparator(tolerances);
  if (expected.samples.length !== actual.samples.length) {
    cmp.exact("/samples", `${expected.samples.length} amostra(s)`, `${actual.samples.length} amostra(s)`);
  }
  const n = Math.min(expected.samples.length, actual.samples.length);
  for (let i = 0; i < n; i++) {
    const want = expected.samples[i];
    const got = actual.samples[i];
    const p = `/samples/${i}`;
    if (typeof want.time === "number") cmp.number(`${p}/time`, "time", want.time, got.time, false);
    if ("body" in want) cmp.exact(`${p}/body`, want.body, got.body === void 0 ? "<sem body>" : got.body);
    if ("bones" in want) compareBones(cmp, `${p}/bones`, want.bones, got.bones);
    if ("slots" in want) compareSlots(cmp, `${p}/slots`, want.slots, got.slots, tolerances);
    for (const key of Object.keys(want)) {
      if (!SAMPLE_KEYS.has(key)) cmp.exact(`${p}/${key}`, "<canal que o executor n\xE3o conhece>", null);
    }
    if ("drawOrder" in want) cmp.strings(`${p}/drawOrder`, want.drawOrder, got.drawOrder);
    if ("drawList" in want) compareDrawList(cmp, `${p}/drawList`, want.drawList, got.drawList);
    if ("vertices" in want) compareVectorMap(cmp, `${p}/vertices`, want.vertices, got.vertices, tolerances.position);
    if ("uvs" in want) compareVectorMap(cmp, `${p}/uvs`, want.uvs, got.uvs, tolerances.uv);
    if ("boundingBoxes" in want) compareVectorMap(cmp, `${p}/boundingBoxes`, want.boundingBoxes, got.boundingBoxes, tolerances.position);
    if ("points" in want) comparePoints(cmp, `${p}/points`, want.points, got.points);
    if ("particles" in want) compareParticles(cmp, `${p}/particles`, want.particles, got.particles, tolerances);
    if ("events" in want) compareEvents(cmp, `${p}/events`, want.events, got.events);
    if ("tags" in want) cmp.strings(`${p}/tags`, want.tags, got.tags);
    if ("variables" in want) compareVariables(cmp, `${p}/variables`, want.variables, got.variables);
    if ("parameters" in want) compareVariables(cmp, `${p}/parameters`, want.parameters, got.parameters);
  }
  return {
    ok: cmp.differences.length === 0,
    differences: cmp.differences,
    worstRatio: cmp.worstRatio,
    worstDelta: cmp.worstDelta
  };
}
function formatPoseDump(dump) {
  const text = JSON.stringify(dump, null, 2);
  return text.replace(/\[\s*\n\s*(-?[\d.eE+-]+(?:,\s*\n\s*-?[\d.eE+-]+)*)\s*\n\s*\]/g, (_all, body) => `[${body.split(/,\s*\n\s*/).join(", ")}]`) + "\n";
}
export {
  ANGLE_FIELDS,
  DEFAULT_MEASURE,
  DUMP_DECIMALS,
  PHYSICS_TOLERANCES,
  POSE_DUMP_VERSION,
  TOLERANCES,
  buildPoseDump,
  comparePoseDump,
  formatPoseDump
};
