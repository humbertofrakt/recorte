// SPDX-License-Identifier: Apache-2.0
/**
 * Where a particle IS — extension `BONE_particles`, sections 7, 8 and 9.
 *
 * The position is a closed form of the age, never a sum of steps. That single
 * sentence is what separates this format from Godot and Unity, which both
 * simulate forward: here `t = 0.5` gives this frame the first time and the
 * thousandth, and dragging the cursor backwards gives back exactly the frame
 * that was there (case P-008).
 *
 * Nothing in this module keeps state. Everything a particle knows comes from
 * `hash(seed, flow, index, channel)` and from its age, and the only thing the
 * skeleton contributes is a bone matrix, asked for at a time this module names.
 *
 * The `physics` constraint of the project is NOT a model for any of this: it
 * keeps state on purpose, and it is the thing this module exists not to be.
 */
import { atan2Deg, cosDeg, sinDeg, matrixRotationDeg, matrixScaleX, invertMatrix, multiplyMatrix, composeMatrix, } from '../math.js';
import { sampleCurve, normalizeCurve } from '../curve.js';
import { particleRandom, particleRange, PARTICLE_CHANNEL } from './hash.js';
import { collectBirths, newBirthReport, } from './emission.js';
/**
 * The threshold of spec 3.6, below which the drag branch of extension 8 is
 * replaced by the plain ballistic one. A runtime MUST use exactly this number.
 */
const DRAG_EPSILON = 0.00001;
/**
 * The guard of spec 9.6, reused whole by the frame sheet of extension 9.8: it
 * keeps a frame boundary that lands exactly on an integer from falling back one
 * frame through the last bit of a division.
 */
const FRAME_GUARD = 0.00001;
// ---------------------------------------------------------------------------
// Over-lifetime keys (extension 9.6, 9.7)
// ---------------------------------------------------------------------------
/**
 * Evaluates a `…OverLifetime` list at `a / life` (extension 9.6). It reuses
 * spec 9.2 and 9.3 whole and only swaps seconds for a fraction of the life:
 * before the first key the first key holds, after the last the last holds.
 */
function overLifetime(keys, u) {
    const n = keys.length;
    if (n === 0)
        return 1;
    if (u <= keys[0].time)
        return keys[0].value;
    if (u >= keys[n - 1].time)
        return keys[n - 1].value;
    let lo = 0;
    let hi = n - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (keys[mid].time <= u)
            lo = mid;
        else
            hi = mid - 1;
    }
    const a = keys[lo];
    const b = keys[lo + 1];
    return sampleCurve(resolvedCurve(a, b), 0, a.time, b.time, a.value, b.value, u);
}
/**
 * The colour gradient of extension 9.7: the same key format, the same curves,
 * with `time` in `0..1` of the life. Four components, one curve each.
 */
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
        const mid = (lo + hi + 1) >> 1;
        if (keys[mid].time <= u)
            lo = mid;
        else
            hi = mid - 1;
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
const curveCache = new WeakMap();
const colorCurveCache = new WeakMap();
function colorCurve(key, next) {
    let c = colorCurveCache.get(key);
    if (c === undefined) {
        c = normalizeCurve(key.curve, 4, true, key.time, next.time);
        colorCurveCache.set(key, c);
    }
    return c;
}
/**
 * Which frame of the sequence a particle shows (extension 9.8).
 *
 * `lifetime` spreads `cycles` passes over the whole life; `fps` walks at a
 * fixed rate. `startFrame` is drawn once, at birth, on channel 9, and added on
 * top. `-1` when the emitter has no sequence.
 */
function sequenceFrame(attachment, age, life, u9) {
    const sequence = attachment.sequence;
    if (sequence === null)
        return -1;
    const n = sequence.count;
    if (n <= 0)
        return -1;
    const k = attachment.frameMode === 'fps'
        ? Math.floor(age * attachment.fps + FRAME_GUARD)
        : Math.floor((age / life) * attachment.cycles * n + FRAME_GUARD);
    const start = Math.floor(particleRange(attachment.startFrame, u9));
    const frame = (k + start) % n;
    return frame < 0 ? frame + n : frame;
}
function resolvedCurve(key, next) {
    let c = curveCache.get(key);
    if (c === undefined) {
        c = normalizeCurve(key.curve, 1, true, key.time, next.time);
        curveCache.set(key, c);
    }
    return c;
}
// ---------------------------------------------------------------------------
// The frame
// ---------------------------------------------------------------------------
/** `p0` of one particle, in the emitter's own frame (extension 9.4). */
function shapePosition(attachment, u3, u4, u12, pose, birth, out) {
    switch (attachment.shape) {
        case 'point':
            out.x = 0;
            out.y = 0;
            return true;
        case 'circle': {
            // Uniform over the AREA, with `radiusThickness` opening the hole:
            // `r = R·sqrt((1−T)² + u3·(1 − (1−T)²))`.
            const inner = 1 - attachment.radiusThickness;
            const i2 = inner * inner;
            const r = attachment.radius * Math.sqrt(i2 + u3 * (1 - i2));
            const phi = u4 * attachment.arc;
            out.x = r * cosDeg(phi);
            out.y = r * sinDeg(phi);
            return true;
        }
        case 'rectangle':
            out.x = (u3 - 0.5) * attachment.size[0];
            out.y = (u4 - 0.5) * attachment.size[1];
            return true;
        case 'edge': {
            const e = attachment.edge;
            out.x = e[0] + (e[2] - e[0]) * u3;
            out.y = e[1] + (e[3] - e[1]) * u3;
            return true;
        }
        case 'bone': {
            // Extension 9.4: the `edge` from `(0,0)` to `(length, 0)` of the bone
            // itself, with the length read at `t_i`. A word none of the three
            // reference programs has — none of them has bones.
            const length = pose.boneLength === undefined ? 0 : pose.boneLength(birth);
            out.x = length * u3;
            out.y = 0;
            return true;
        }
        case 'mesh': {
            const mesh = pose.meshAt === undefined ? null : pose.meshAt(birth);
            if (mesh === null)
                return false;
            if (!sampleMesh(attachment, mesh, u3, u4, u12, out))
                return false;
            backToEmitter(attachment, pose, birth, out);
            return true;
        }
        case 'path': {
            // Extension 1.1, 9.4.2: always by LENGTH, on the polyline of 10 segments
            // per curve, with the path read at `t_i`.
            const path = pose.pathAt === undefined ? null : pose.pathAt(birth);
            if (path === null)
                return false;
            if (!samplePath(path.points, path.closed, u3, out))
                return false;
            backToEmitter(attachment, pose, birth, out);
            return true;
        }
        default:
            return false;
    }
}
const INVERSE_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
/**
 * Extension 9.4.2, step 7: a mesh or a path arrives in skeleton space, and the
 * point comes back to the EMITTER's frame through the inverse of
 * `M_emissor(t_i)` — in BOTH spaces. From here on it is a `p0` like any other
 * shape's: `spherizeDirection` measures its outward angle from the emitter's
 * origin (extension 9.3.1), and in `world` extension 7.2 carries it to the
 * skeleton by the same matrix, so it lands back ON the mesh or the path.
 *
 * This reader used to skip the inverse in `world`, and 7.2 then carried a point
 * that was already in the skeleton a second time (case P-026, found by the
 * Python runtime on 05/10/2026). Done HERE, once, so no host has to know.
 */
function backToEmitter(attachment, pose, birth, out) {
    const inv = invertMatrix(emitterMatrix(attachment, pose.matrixAt(birth), MESH_SCRATCH), INVERSE_SCRATCH);
    const lx = inv.a * out.x + inv.b * out.y + inv.worldX;
    const ly = inv.c * out.x + inv.d * out.y + inv.worldY;
    out.x = lx;
    out.y = ly;
}
/** Segments per curve: the length ruler of spec 6.4, and of extension 9.4.2. */
const PATH_SEGMENTS = 10;
/**
 * `p0` on a path, by extension 9.4.2 — normative, written out step by step
 * because other readers have to land on the same digit:
 *
 * 1. the curves: `K − 1` open, `K` closed (the last joins anchor `K−1` to 0,
 *    with the out-handle of `K−1` and the in-handle of 0 — spec 6.4);
 * 2. each curve cut into 10 straight segments at `t = 0, 0.1 … 1`;
 * 3. `s = u3 · total`, and the point at `s` ON THE POLYLINE — straight
 *    interpolation inside the segment, never `B(t)` and never the exact arc.
 *
 * `constantSpeed` and `lengths` of the path are NOT read: the spread is always
 * by length. `false` = fewer than two anchors, and the emitter draws nothing.
 */
function samplePath(w, closed, u3, out) {
    const k = Math.floor(w.length / 6);
    if (k < 2)
        return false;
    const curves = closed ? k : k - 1;
    const pts = new Float64Array((curves * PATH_SEGMENTS + 1) * 2);
    let o = 0;
    for (let c = 0; c < curves; c++) {
        const a = c * 6;
        const b = ((c + 1) % k) * 6;
        const x0 = w[a + 2], y0 = w[a + 3], h1x = w[a + 4], h1y = w[a + 5];
        const h2x = w[b], h2y = w[b + 1], x1 = w[b + 2], y1 = w[b + 3];
        // The first point of a curve is the last of the one before: written once.
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
    for (let i = 0; i < n; i++)
        total += Math.hypot(pts[i * 2 + 2] - pts[i * 2], pts[i * 2 + 3] - pts[i * 2 + 1]);
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
        if (length === 0)
            continue;
        if (acc + length >= s) {
            const f = (s - acc) / length;
            out.x = pts[i * 2] + dx * f;
            out.y = pts[i * 2 + 1] + dy * f;
            return true;
        }
        acc += length;
    }
    // `u3 < 1`, so only rounding gets here: the end of the path.
    out.x = pts[n * 2];
    out.y = pts[n * 2 + 1];
    return true;
}
// ---------------------------------------------------------------------------
// The emitter's matrix (extension 9.10)
// ---------------------------------------------------------------------------
/**
 * `M_emissor = M_osso × T(x, y) · R(rotation)` — extension 9.10, the order of a
 * `region` (spec 7.3) without scale.
 *
 * The rule is one: wherever this extension says "the bone's matrix", it means
 * this one. With `x = y = rotation = 0` it IS the bone's matrix — the same
 * object, untouched, so a file without the three fields draws exactly what it
 * drew before, digit for digit (no `1·a + 0·b` that could flip a `−0`).
 *
 * `out` is the caller's own scratch: the frame keeps the matrix at `t` alive
 * while it asks for the one at `t_i`, so the two must never share one.
 */
export function emitterMatrix(attachment, bone, out) {
    if (attachment.x === 0 && attachment.y === 0 && attachment.rotation === 0)
        return bone;
    const local = composeMatrix(attachment.x, attachment.y, attachment.rotation, 1, 1, LOCAL_SCRATCH);
    return multiplyMatrix(bone, local, out);
}
const LOCAL_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
const NOW_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
const BIRTH_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
const MESH_SCRATCH = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
/** Unique edges of a triangulation, cached per `triangles` array. */
const edgeCache = new WeakMap();
/**
 * The unique edges of the triangulation (extension 9.4.1): pairs `(a, b)` with
 * `a < b`, taken from `triangles`, WITHOUT repeats — an edge shared by two
 * triangles enters ONCE — sorted by the pair `(a, b)` ascending.
 *
 * This is the triangulation's list, and NEVER the `mesh.edges` field: the core
 * spec calls that one "pairs of indices, editor only", optional, defaulting to
 * `[]`, so an emitter tied to it would emit NOTHING in an ordinary file, with
 * no visible reason — the worst kind of silence.
 */
function uniqueEdges(triangles) {
    const key = triangles;
    const hit = edgeCache.get(key);
    if (hit !== undefined)
        return hit;
    const seen = new Set();
    const pairs = [];
    const push = (x, y) => {
        const a = x < y ? x : y;
        const b = x < y ? y : x;
        if (a === b)
            return;
        const id = a * 4294967296 + b;
        if (seen.has(id))
            return;
        seen.add(id);
        pairs.push(a, b);
    };
    for (let t = 0; t + 2 < triangles.length; t += 3) {
        push(triangles[t], triangles[t + 1]);
        push(triangles[t + 1], triangles[t + 2]);
        push(triangles[t + 2], triangles[t]);
    }
    const order = Array.from({ length: pairs.length / 2 }, (_, i) => i)
        .sort((i, j) => (pairs[i * 2] - pairs[j * 2]) || (pairs[i * 2 + 1] - pairs[j * 2 + 1]));
    const out = new Int32Array(order.length * 2);
    for (let i = 0; i < order.length; i++) {
        out[i * 2] = pairs[order[i] * 2];
        out[i * 2 + 1] = pairs[order[i] * 2 + 1];
    }
    edgeCache.set(key, out);
    return out;
}
/** `p0` on a mesh, by the three normative countings of extension 9.4.1. */
function sampleMesh(attachment, mesh, u3, u4, u12, out) {
    const v = mesh.vertices;
    const n = v.length / 2;
    if (n < 1)
        return false;
    if (attachment.meshMode === 'vertex') {
        const k = Math.min(n - 1, Math.floor(u12 * n));
        out.x = v[k * 2];
        out.y = v[k * 2 + 1];
        return true;
    }
    if (attachment.meshMode === 'edge') {
        const edges = uniqueEdges(mesh.triangles);
        const m = edges.length / 2;
        if (m < 1)
            return false;
        const e = Math.min(m - 1, Math.floor(u12 * m));
        const a = edges[e * 2] * 2;
        const b = edges[e * 2 + 1] * 2;
        out.x = v[a] + (v[b] - v[a]) * u3;
        out.y = v[a + 1] + (v[b + 1] - v[a + 1]) * u3;
        return true;
    }
    // `triangle`: pick by ACCUMULATED AREA with channel 12, so a big triangle
    // gets more, then a uniform point inside it with channels 3 and 4.
    const tris = mesh.triangles;
    const count = Math.floor(tris.length / 3);
    if (count < 1)
        return false;
    let total = 0;
    const areas = new Float64Array(count);
    for (let t = 0; t < count; t++) {
        const a = tris[t * 3] * 2;
        const b = tris[t * 3 + 1] * 2;
        const c = tris[t * 3 + 2] * 2;
        const area = Math.abs((v[b] - v[a]) * (v[c + 1] - v[a + 1]) - (v[c] - v[a]) * (v[b + 1] - v[a + 1])) / 2;
        total += area;
        areas[t] = total;
    }
    if (total <= 0)
        return false;
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
    // The FOLD, and not the square root. Both give a uniform distribution and
    // both are defensible, but they do NOT give the same point for the same two
    // `u`. Extension 9.4.1 chose this one because it spends the two channels the
    // section already names and calls no square root the section does not ask
    // for. It is not "more right": it is the one that was written down, so that
    // it stops being guessed.
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
/**
 * Why `shape: "mesh"` may draw nothing here, written out because a silent
 * nothing is exactly what house rule 21 forbids.
 *
 * All three `meshMode` values are pinned by extension 9.4.1 since 18/09/2026.
 * Before that line existed this reader refused to draw `edge` and `triangle`
 * rather than pick one of two uniform-point formulas that give DIFFERENT points
 * from the same two `u` — and the refusal is what gave the confront a
 * divergence to decide instead of a silent tie. What is left here is the honest
 * case: this host cannot hand over the mesh at all.
 */
function meshSilence(attachment, pose) {
    if (attachment.shape !== 'mesh')
        return null;
    if (attachment.mesh === null || pose.meshAt === undefined || pose.meshAt(0) === null) {
        return {
            reason: 'mesh',
            message: `emissor "${attachment.name}": a malha "${attachment.mesh ?? ''}" não foi encontrada no mesmo slot (nível B); o emissor não é desenhado`,
        };
    }
    return null;
}
/**
 * Why `shape: "path"` may draw nothing here (extension 9.4.2): no `curve`, or
 * the host cannot hand over a `path` by that name — missing slot, missing
 * placeholder, an attachment that is not a path, or fewer than two anchors.
 * Not drawing and saying so is the rule; falling back to `point` would be a
 * guess nobody could notice (house rule 21).
 */
function pathSilence(attachment, pose) {
    if (attachment.shape !== 'path')
        return null;
    const path = attachment.curve === null || pose.pathAt === undefined ? null : pose.pathAt(0);
    if (path === null || path.points.length < 12) {
        return {
            reason: 'path',
            message: `emissor "${attachment.name}": o caminho "${attachment.curve ?? ''}" não foi encontrado (um anexo path, "<slot>/<anexo>"); o emissor não é desenhado`,
        };
    }
    return null;
}
/**
 * The live particles at `window.time`, in draw order, already cut to
 * `maxParticles` — the whole frame of one emitter, as a pure function.
 *
 * The cap of extension 7.1 does NOT block birth, the way Unity and Godot do:
 * blocking is state, because who is born starts depending on who was alive
 * before. Here the particle is always born and the DRAWING takes the newest
 * `maxParticles`. The price is written in the spec: with a low cap an old
 * particle disappears all at once, and the reader that cuts SHOULD say how
 * many — that is what `cut` is for.
 */
export function computeParticles(attachment, curve, window, pose) {
    const empty = [];
    const report = newBirthReport();
    if (!attachment.shapeKnown) {
        return {
            particles: empty, cut: 0, births: report,
            silence: { reason: 'shape', message: `emissor "${attachment.name}": forma desconhecida; o emissor não é desenhado (§7.4)` },
        };
    }
    const silence = meshSilence(attachment, pose) ?? pathSilence(attachment, pose);
    if (silence !== null)
        return { particles: empty, cut: 0, silence, births: report };
    const now = window.time;
    const seed = attachment.seed;
    const world = attachment.space === 'world';
    const births = collectBirths(attachment, curve, window, [], report);
    const alive = [];
    const p0 = { x: 0, y: 0 };
    // In `local` the bone goes on commanding the particle after it is born; in
    // `world` it lets go at the instant of birth and never touches it again.
    // Extension 9.10: "the bone's matrix" is the EMITTER's matrix everywhere.
    const matrixNow = world ? null : emitterMatrix(attachment, pose.matrixAt(now), NOW_SCRATCH);
    for (let b = 0; b < births.length; b++) {
        const born = births[b];
        const { flow, index, birth } = born;
        const u = (channel) => particleRandom(seed, flow, index, channel);
        const life = particleRange(attachment.lifetime, u(PARTICLE_CHANNEL.LIFETIME));
        const age = now - birth;
        // `E` only picks candidates; the `t_i` decides (extension 5).
        if (life <= 0 || age < 0 || age >= life)
            continue;
        if (!shapePosition(attachment, u(PARTICLE_CHANNEL.SHAPE_A), u(PARTICLE_CHANNEL.SHAPE_B), u(PARTICLE_CHANNEL.MESH_PICK), pose, birth, p0))
            continue;
        const speed = particleRange(attachment.speed, u(PARTICLE_CHANNEL.SPEED));
        // Extension 9.3, and the ORDER matters: `spherizeDirection` mixes FIRST —
        // `0` keeps `direction`, `1` goes straight out of the shape's centre, and
        // the mix of the two angles takes the SHORT way — and only then does
        // `spread` open the fan around the base that came out of the mix.
        //
        // This reader originally did it the other way round, and the confront of
        // 18/09 with the Python runtime caught it. Opening the fan first and mixing
        // afterwards SHRINKS the fan by `(1 − spherize)` without anybody asking:
        // with `spherize: 1` it closes altogether. `spread` is a HALF-APERTURE
        // (extension 9.3), and a half-aperture is measured around the direction in
        // force — one field must not quietly resize another. With `spherize: 0`,
        // which is all eight cases, the two orders agree, so no case separates them.
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
            // Extension 7.2: `p0` and `v0` are carried into skeleton space by the
            // bone's matrix at `t_i`. `g` is already in skeleton space, and the
            // particle then walks on its own.
            const m = emitterMatrix(attachment, pose.matrixAt(birth), BIRTH_SCRATCH);
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
        }
        else {
            extraAngle = 0;
            boneScale = 1;
        }
        // --- the closed form of extension 8 -------------------------------------
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
        }
        else {
            // `F = −expm1(−k·a)/k`, and not `(1 − e^(−k·a))/k`: with a small `k·a`
            // the second form loses the last digits to cancellation.
            const F = -Math.expm1(-k * age) / k;
            const decay = Math.exp(-k * age);
            const tx = gx / k;
            const ty = gy / k;
            x = px + tx * age + (vx - tx) * F;
            y = py + ty * age + (vy - ty) * F;
            velX = tx + (vx - tx) * decay;
            velY = ty + (vy - ty) * decay;
        }
        let angle = particleRange(attachment.angle, u(PARTICLE_CHANNEL.ANGLE))
            + particleRange(attachment.angularVelocity, u(PARTICLE_CHANNEL.ANGULAR_VELOCITY)) * age;
        if (attachment.alignToVelocity)
            angle += atan2Deg(velY, velX);
        let scale = particleRange(attachment.scale, u(PARTICLE_CHANNEL.SCALE));
        if (attachment.scaleOverLifetime !== null)
            scale *= overLifetime(attachment.scaleOverLifetime, age / life);
        if (matrixNow !== null) {
            // `local`: the whole thing rides the bone's matrix AT `t`.
            const wx = matrixNow.a * x + matrixNow.b * y + matrixNow.worldX;
            const wy = matrixNow.c * x + matrixNow.d * y + matrixNow.worldY;
            x = wx;
            y = wy;
            extraAngle = matrixRotationDeg(matrixNow);
            boneScale = matrixScaleX(matrixNow);
        }
        // Extension 9.7: ONE `u` for the four components of `startColor`.
        const u8 = u(PARTICLE_CHANNEL.START_COLOR);
        const c0 = attachment.startColor[0];
        const c1 = attachment.startColor[1];
        const color = new Float64Array(4);
        if (attachment.colorOverLifetime !== null)
            overLifetimeColor(attachment.colorOverLifetime, age / life, color);
        else {
            color[0] = 1;
            color[1] = 1;
            color[2] = 1;
            color[3] = 1;
        }
        for (let j = 0; j < 4; j++)
            color[j] *= c0[j] + (c1[j] - c0[j]) * u8;
        if (attachment.alphaOverLifetime !== null)
            color[3] *= overLifetime(attachment.alphaOverLifetime, age / life);
        alive.push({
            flow, index, birth, life, age,
            color,
            frame: sequenceFrame(attachment, age, life, u(PARTICLE_CHANNEL.START_FRAME)),
            x, y,
            // NOT normalized: `251.145834`, not `−108.854166`. A reader that reduces
            // the angle fails P-001, and only on `angle`, by multiples of 360.
            angle: angle + extraAngle,
            scale: scale * boneScale,
        });
    }
    // Extension 7.1: order by `(t_i descending, flow ascending, index
    // descending)` and draw the first `maxParticles`.
    alive.sort(newestFirst);
    const cut = Math.max(0, alive.length - attachment.maxParticles);
    const kept = cut > 0 ? alive.slice(0, attachment.maxParticles) : alive;
    // Extension 9.9: `sortMode` decides which end of that list is in FRONT. The
    // list is written front first, which is the order cases P-001 and P-005 show.
    if (attachment.sortMode === 'oldestInFront')
        kept.reverse();
    return { particles: kept, cut, silence: null, births: report };
}
function newestFirst(a, b) {
    if (a.birth !== b.birth)
        return b.birth - a.birth;
    if (a.flow !== b.flow)
        return a.flow - b.flow;
    return b.index - a.index;
}
