// SPDX-License-Identifier: Apache-2.0
/**
 * Canvas 2D renderer (spec 7.7, 7.12, 7.13).
 *
 * `CanvasRenderer.draw(skeleton)` walks `collectDrawables` and paints every
 * `region`, `mesh` and `linkedmesh` with the atlas page images given at
 * construction. It draws in SKELETON space (`y` up): the caller sets the view
 * on the context before calling (`translate` + `scale(s, -s)`), the renderer
 * never touches it except to save / restore.
 *
 * Region: the four corners of spec 7.3 are an affine image of a rectangle, so
 * one affine transform (`triangleAffine`) takes the page pixels to the world
 * quad; the quad itself is the clip.
 *
 * Mesh: one affine transform per triangle (the classic technique) — clip to
 * the destination triangle, concatenate the matrix that takes the triangle's
 * page pixels to it, then `drawImage` of the whole page.
 *
 * Color of spec 7.12 (`light` tint and `dark` tint black) needs more than
 * `globalAlpha`, so a tinted drawable is painted into a scratch canvas first;
 * see `applyTint`. Blend modes map to `globalCompositeOperation`.
 */
import { identityMatrix } from '../math.js';
import { aroundMarker, collectDrawGroups } from '../render-list.js';
import { MAX_NESTED_DEPTH } from '../nested.js';
import { computeFinalColor, createFinalColor } from '../color.js';
import { RegionAttachment } from '../attachments/region.js';
import { MeshAttachment } from '../attachments/mesh.js';
import { LinkedMeshAttachment } from '../attachments/linkedmesh.js';
import { BoundingBoxAttachment } from '../attachments/boundingbox.js';
import { PathAttachment } from '../attachments/path.js';
import { PointAttachment } from '../attachments/point.js';
import { ClippingAttachment } from '../attachments/clipping.js';
import { ParticleAttachment } from '../attachments/particle.js';
import { computeRegionFrame } from '../attachments/region.js';
import { particleFrame, particleRegion, ParticleCache } from '../particles/frame.js';
import { cosDeg, sinDeg } from '../math.js';
// ---------------------------------------------------------------------------
// Blend modes
// ---------------------------------------------------------------------------
/**
 * `blend` of spec 7.12 as a `globalCompositeOperation`.
 *
 * Canvas has no `glBlendFunc`, so these are the closest separable blend modes.
 * `normal` and `additive` match the spec factors for a premultiplied source;
 * `multiply` and `screen` are the CSS blend modes of the same name, which
 * agree with the spec table where the source is opaque and differ slightly
 * where it is not. A mode with no mapping falls back to `normal` (spec 7.12).
 */
export const BLEND_COMPOSITE = Object.freeze({
    normal: 'source-over',
    additive: 'lighter',
    multiply: 'multiply',
    screen: 'screen',
});
export function blendComposite(mode) {
    return BLEND_COMPOSITE[mode] ?? 'source-over';
}
/**
 * `imageSmoothingEnabled` for a skeleton (spec 4.1 `pixelArt`): `false` with
 * `pixelArt: true`, so an enlarged texel stays a hard square instead of a
 * blurred average of its neighbours; `true` otherwise. Takes `SkeletonData.meta`
 * or the `skeleton` object of a `.bone` file, which carry the same field.
 */
export function smoothingFor(meta) {
    return meta?.pixelArt !== true;
}
// ---------------------------------------------------------------------------
// Affine transform of a triangle
// ---------------------------------------------------------------------------
/**
 * Matrix that takes the source triangle `src` to the destination triangle
 * `dst` (`[x0, y0, x1, y1, x2, y2]` each). Row-major like the rest of the
 * runtime: `x' = a*x + b*y + worldX`, `y' = c*x + d*y + worldY`.
 *
 * Returns `null` when the source triangle is degenerate (zero area), which is
 * the case a renderer must skip instead of dividing by zero.
 */
export function triangleAffine(src, dst, out = identityMatrix()) {
    const u1x = src[2] - src[0], u1y = src[3] - src[1];
    const u2x = src[4] - src[0], u2y = src[5] - src[1];
    const det = u1x * u2y - u2x * u1y;
    if (det === 0 || !Number.isFinite(det))
        return null;
    const v1x = dst[2] - dst[0], v1y = dst[3] - dst[1];
    const v2x = dst[4] - dst[0], v2y = dst[5] - dst[1];
    const id = 1 / det;
    const a = (v1x * u2y - v2x * u1y) * id;
    const b = (v2x * u1x - v1x * u2x) * id;
    const c = (v1y * u2y - v2y * u1y) * id;
    const d = (v2y * u1x - v1y * u2x) * id;
    out.a = a;
    out.b = b;
    out.c = c;
    out.d = d;
    out.worldX = dst[0] - (a * src[0] + b * src[1]);
    out.worldY = dst[1] - (c * src[0] + d * src[1]);
    return out;
}
/**
 * Multiplies a runtime matrix onto the current context transform, so the view
 * set by the caller is kept. The canvas argument order (`a, b, c, d, e, f`
 * column-major) is not the runtime one (row-major), hence `a, c, b, d`.
 */
function concatMatrix(ctx, m) {
    ctx.transform(m.a, m.c, m.b, m.d, m.worldX, m.worldY);
}
// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------
/** Anything `drawImage` accepts as a source. */
/**
 * A particle's image has no offset, no rotation and no scale of its own: the
 * quad is the plain image, centred on its pivot, and the particle's own angle
 * and scale are applied to the corners afterwards (extension 9.6).
 */
const PARTICLE_FRAME_PARAMS = Object.freeze({
    x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, width: 0, height: 0,
});
const DEFAULT_DEBUG = {
    lineWidth: 1.5,
    boneColor: '#1d4ed8',
    boneOriginColor: '#f59e0b',
    boundingBoxColor: '#16a34a',
    pointColor: '#db2777',
    pathColor: '#ea580c',
    meshColor: '#0891b2',
    clippingColor: '#7c3aed',
};
export class CanvasRenderer {
    ctx;
    images;
    seamExpand;
    debug;
    createScratch;
    onWarning;
    warned = new Set();
    drawables = [];
    color = createFinalColor();
    matrix = identityMatrix();
    srcTri = new Float64Array(6);
    /** Emission curves and the `t_i` poser, kept between frames (extension 7.2). */
    particleCache = new ParticleCache();
    /** The final colour of the particle being drawn (extension 9.7), reused. */
    particleColor = createFinalColor();
    /** Local quad of one particle image: BL, BR, TR, TL (spec 7.3). */
    particleQuad = new Float64Array(8);
    particleUVs = new Float64Array(8);
    particleWorld = new Float64Array(8);
    dstTri = new Float64Array(6);
    world = new Float64Array(16);
    /** `imageSmoothingEnabled` of the frame being drawn, for the scratch surfaces too. */
    smoothing = true;
    /** Scratch surfaces for tinted drawables: texels, alpha mask, dark term. */
    scratchTex = null;
    scratchMask = null;
    scratchDark = null;
    constructor(ctx, options = {}) {
        this.ctx = ctx;
        this.images = options.images ?? new Map();
        this.seamExpand = options.seamExpand ?? 0.35;
        this.debug = options.debug ?? {};
        this.createScratch = options.createScratch ?? defaultScratch;
        this.onWarning = options.onWarning ?? (() => { });
    }
    /** Image of an atlas page, or `null` (warned once). */
    imageFor(page) {
        const images = this.images;
        let image;
        if (typeof images === 'function')
            image = images(page);
        else if (images instanceof Map)
            image = images.get(page.name);
        else
            image = images[page.name];
        if (image === null || image === undefined) {
            this.warn(`page:${page.name}`, `atlas page "${page.name}" has no image; nothing drawn from it`);
            return null;
        }
        return image;
    }
    warn(key, message) {
        if (this.warned.has(key))
            return;
        this.warned.add(key);
        this.onWarning(message);
    }
    /** Scale of the current view (canvas px per skeleton px). */
    viewScale() {
        const m = this.ctx.getTransform();
        const det = Math.abs(m.a * m.d - m.b * m.c);
        const s = Math.sqrt(det);
        return s > 1e-9 ? s : 1;
    }
    // -- main ------------------------------------------------------------------
    /**
     * Draws one frame of `skeleton` with the view already set on the context
     * (spec 7.13). An `Actor` (spec 9.13) draws the body alive right now. The
     * context transform, alpha and composite mode are restored before returning.
     */
    draw(target) {
        const skeleton = 'esqueletos' in target ? target.skeleton : target;
        const ctx = this.ctx;
        ctx.save();
        try {
            // The root decides for the whole frame, nested children included: one
            // character drawn half smooth and half hard would read as a bug.
            this.smoothing = smoothingFor(skeleton.data.meta);
            ctx.imageSmoothingEnabled = this.smoothing;
            this.drawList(skeleton, 0);
        }
        finally {
            ctx.restore();
        }
        this.drawDebug(skeleton);
    }
    /**
     * One walk over a draw order (spec 7.13), recursing into the nested children
     * of spec 7.11. The scratch array is reused only at depth 0; deeper levels
     * get their own, so the parent's list survives the recursion.
     */
    drawList(skeleton, depth, cut = null) {
        const drawables = depth === 0 ? this.drawables : [];
        drawables.length = 0;
        // The three groups of spec 7.11: a child with `around` comes out twice,
        // behind the whole skeleton and in front of it. Without one, this is
        // `collectDrawables`, entry by entry.
        collectDrawGroups(skeleton, cut, drawables);
        for (const drawable of drawables) {
            if (drawable.attachment.type === 'skeleton')
                this.drawNested(drawable, depth);
            else if (drawable.attachment instanceof ParticleAttachment)
                this.drawParticles(skeleton, drawable);
            else
                this.drawOne(drawable);
        }
    }
    /**
     * Draws a nested child as one block, in the parent's draw order (spec 7.11).
     * The child is already posed: `Skeleton.updateWorldTransform` places it under
     * the slot bone and multiplies the parent's `light` into its slots.
     */
    drawNested(drawable, depth) {
        const { slot, attachment, clip } = drawable;
        const nested = slot.nested;
        if (nested === null) {
            this.warn(`nested:${attachment.name}`, `nested skeleton "${attachment.name}" is not loaded; nothing drawn (spec 7.11)`);
            return;
        }
        if (depth + 1 > MAX_NESTED_DEPTH)
            return;
        const ctx = this.ctx;
        ctx.save();
        try {
            if (clip !== null)
                this.applyClip(ctx, clip);
            // `part` is only there on a child drawn around this skeleton (7.11): then
            // only that half of the child is walked, cut at its marker slot.
            const marker = drawable.part === undefined ? null : aroundMarker(slot);
            const cut = marker === null || drawable.part === undefined ? null : { marker, part: drawable.part };
            this.drawList(nested.skeleton, depth + 1, cut);
        }
        finally {
            ctx.restore();
        }
    }
    /**
     * One emitter of the `BONE_particles` extension, drawn in its slot's place in
     * the `drawOrder` (spec 9.5) like any other attachment.
     *
     * Every particle is one quad of the same atlas region, put where the closed
     * form of extension 8 says and turned by the angle of extension 9.6. There is
     * no per-frame state anywhere: the list comes back identical when the same
     * instant is asked for again, which is what case P-008 is about.
     *
     * There is NO blend field on an emitter (extension 9.9): it uses the slot's
     * `blend`, like every other attachment (spec 7.12). Additive smoke lives in an
     * additive slot.
     *
     * Colour, extension 9.7: `light = slot.color × attachment.color ×
     * particle.color`, and then EXACTLY spec 7.12 with the slot's `darkColor`.
     * A particle whose light is white and whose slot has no `darkColor` goes
     * straight to the canvas with its alpha, like an untinted region. Any other
     * goes through `drawTintedParticle`, which uses the SAME `applyTint` as every
     * tinted region and mesh: one colour path for the whole renderer.
     *
     * Until 29/09/2026 this comment said the particle's colour was applied, and
     * the code used only its alpha: a red fire came out white, in the editor's
     * scene, in its preview and in the image export (defect B1 of the final
     * round). The test that caught it is in `testes/particulas.test.ts`.
     */
    drawParticles(skeleton, drawable) {
        const { slot, clip } = drawable;
        const attachment = drawable.attachment;
        const frame = particleFrame(skeleton, slot, attachment, this.particleCache);
        if (frame.silence !== null) {
            this.warn(`particle:${attachment.name}`, frame.silence.message);
            return;
        }
        if (frame.births.cyclesDropped > 0) {
            // Extension 6: cutting in silence drops a cycle the author wrote and
            // gives no sign — wrong for the same reason as not cutting at all.
            this.warn(`particle-cycles:${attachment.name}`, `${frame.births.cyclesDropped} ciclo(s) de rajada ficaram fora da volta: o instante deles cai fora de [0, D) (extensao BONE_particles 6)`);
        }
        if (frame.cut > 0) {
            this.warn(`particle-cut:${attachment.name}`, `${frame.cut} partícula(s) cortada(s) neste quadro pelo maxParticles ${attachment.maxParticles} (extensão BONE_particles 7.1)`);
        }
        if (frame.particles.length === 0)
            return;
        const color = computeFinalColor(slot, attachment, this.color);
        const own = this.particleColor;
        const fallback = attachment.region;
        const composite = blendComposite(slot.blend);
        const ctx = this.ctx;
        const quad = this.particleQuad;
        const uvs = this.particleUVs;
        const world = this.particleWorld;
        for (const particle of frame.particles) {
            const region = particleRegion(attachment, particle, fallback);
            if (region === null) {
                this.warn(`missing:${attachment.name}`, `emitter "${attachment.name}" has no atlas region; not drawn`);
                return;
            }
            const image = this.imageFor(region.page);
            if (image === null)
                return;
            const alpha = color.light[3] * particle.color[3];
            if (alpha <= 0)
                continue;
            // Extension 9.7: the particle's colour multiplies the slot and attachment
            // light; the dark term is the slot's, untouched.
            for (let i = 0; i < 3; i++)
                own.light[i] = color.light[i] * particle.color[i];
            own.light[3] = alpha;
            own.tintBlack = color.tintBlack;
            for (let i = 0; i < 3; i++)
                own.dark[i] = color.dark[i];
            const tinted = own.tintBlack || own.light[0] !== 1 || own.light[1] !== 1 || own.light[2] !== 1;
            // The image's own quad, centred on its pivot, exactly as a `region` with
            // no offset would get it (spec 7.3).
            computeRegionFrame(PARTICLE_FRAME_PARAMS, region, quad, uvs);
            const cos = cosDeg(particle.angle) * particle.scale;
            const sin = sinDeg(particle.angle) * particle.scale;
            for (let i = 0; i < 8; i += 2) {
                world[i] = particle.x + quad[i] * cos - quad[i + 1] * sin;
                world[i + 1] = particle.y + quad[i] * sin + quad[i + 1] * cos;
            }
            if (tinted) {
                this.drawTintedParticle(world, uvs, region, image, own, clip, composite, alpha);
                continue;
            }
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = composite;
            if (clip !== null)
                this.applyClip(ctx, clip);
            this.paintQuad(ctx, world, uvs, region, image);
            ctx.restore();
        }
    }
    /**
     * One tinted particle: `drawTinted`, with the particle's quad painted into
     * the scratch instead of a whole attachment. The colour goes through the
     * same `applyTint` (spec 7.12), and `light.a` through `globalAlpha` when
     * compositing, exactly as for a region.
     */
    drawTintedParticle(world, uvs, region, image, color, clip, composite, alpha) {
        const ctx = this.ctx;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const tex = this.scratch('tex', width, height);
        if (tex === null) {
            this.warn('scratch', 'no scratch canvas available; slot tint and dark color are ignored');
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = composite;
            if (clip !== null)
                this.applyClip(ctx, clip);
            this.paintQuad(ctx, world, uvs, region, image);
            ctx.restore();
            return;
        }
        const view = ctx.getTransform();
        tex.setTransform(1, 0, 0, 1, 0, 0);
        tex.globalAlpha = 1;
        tex.globalCompositeOperation = 'source-over';
        tex.clearRect(0, 0, width, height);
        tex.setTransform(view);
        tex.save();
        tex.imageSmoothingEnabled = this.smoothing;
        if (clip !== null)
            this.applyClip(tex, clip);
        this.paintQuad(tex, world, uvs, region, image);
        tex.restore();
        this.applyTint(tex, color, width, height);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = composite;
        ctx.drawImage(tex.canvas, 0, 0);
        ctx.restore();
    }
    /** One textured quad, the same affine map `paintRegion` uses (spec 7.3). */
    paintQuad(ctx, world, uvs, region, image) {
        const pw = region.page.width;
        const ph = region.page.height;
        const src = this.srcTri;
        const dst = this.dstTri;
        src[0] = uvs[0] * pw;
        src[1] = uvs[1] * ph;
        src[2] = uvs[2] * pw;
        src[3] = uvs[3] * ph;
        src[4] = uvs[4] * pw;
        src[5] = uvs[5] * ph;
        dst[0] = world[0];
        dst[1] = world[1];
        dst[2] = world[2];
        dst[3] = world[3];
        dst[4] = world[4];
        dst[5] = world[5];
        const m = triangleAffine(src, dst, this.matrix);
        if (m === null)
            return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(world[0], world[1]);
        ctx.lineTo(world[2], world[3]);
        ctx.lineTo(world[4], world[5]);
        ctx.lineTo(world[6], world[7]);
        ctx.closePath();
        ctx.clip();
        concatMatrix(ctx, m);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
    }
    drawOne(drawable) {
        const { slot, attachment, clip } = drawable;
        const region = regionOf(slot, attachment);
        if (region === null) {
            this.warn(`missing:${attachment.name}`, `attachment "${attachment.name}" has no atlas region; not drawn`);
            return;
        }
        const image = this.imageFor(region.page);
        if (image === null)
            return;
        const color = computeFinalColor(slot, attachment, this.color);
        const alpha = color.light[3];
        if (alpha <= 0)
            return;
        const tinted = color.tintBlack || color.light[0] !== 1 || color.light[1] !== 1 || color.light[2] !== 1;
        const composite = blendComposite(slot.blend);
        if (!tinted) {
            const ctx = this.ctx;
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = composite;
            if (clip !== null)
                this.applyClip(ctx, clip);
            this.paint(ctx, slot, attachment, region, image);
            ctx.restore();
            return;
        }
        this.drawTinted(slot, attachment, region, image, color, clip, composite, alpha);
    }
    /** Paints the texels of one drawable into `ctx` with no tint (spec 7.3, 7.4). */
    paint(ctx, slot, attachment, region, image) {
        if (attachment instanceof RegionAttachment)
            this.paintRegion(ctx, slot, attachment, region, image);
        else
            this.paintMesh(ctx, slot, attachment, region, image);
    }
    paintRegion(ctx, slot, attachment, region, image) {
        const world = attachment.computeWorldVertices(slot, this.ensureWorld(8), 0, 2);
        const uvs = attachment.uvsFor(slot);
        const pw = region.page.width;
        const ph = region.page.height;
        const src = this.srcTri;
        const dst = this.dstTri;
        // Corners BL BR TR: an affine map of the whole quad (spec 7.3).
        src[0] = uvs[0] * pw;
        src[1] = uvs[1] * ph;
        src[2] = uvs[2] * pw;
        src[3] = uvs[3] * ph;
        src[4] = uvs[4] * pw;
        src[5] = uvs[5] * ph;
        dst[0] = world[0];
        dst[1] = world[1];
        dst[2] = world[2];
        dst[3] = world[3];
        dst[4] = world[4];
        dst[5] = world[5];
        const m = triangleAffine(src, dst, this.matrix);
        if (m === null)
            return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(world[0], world[1]);
        ctx.lineTo(world[2], world[3]);
        ctx.lineTo(world[4], world[5]);
        ctx.lineTo(world[6], world[7]);
        ctx.closePath();
        ctx.clip();
        concatMatrix(ctx, m);
        ctx.drawImage(image, 0, 0);
        ctx.restore();
    }
    paintMesh(ctx, slot, attachment, region, image) {
        const count = attachment.vertexCount * 2;
        const world = attachment.computeWorldVertices(slot, this.ensureWorld(count), 0, 2);
        const uvs = attachment.regionUVsFor(slot);
        const triangles = attachment.triangles;
        const pw = region.page.width;
        const ph = region.page.height;
        const src = this.srcTri;
        const dst = this.dstTri;
        const grow = this.seamExpand > 0 ? this.seamExpand / this.viewScale() : 0;
        for (let t = 0; t < triangles.length; t += 3) {
            for (let k = 0; k < 3; k++) {
                const v = triangles[t + k] * 2;
                src[k * 2] = uvs[v] * pw;
                src[k * 2 + 1] = uvs[v + 1] * ph;
                dst[k * 2] = world[v];
                dst[k * 2 + 1] = world[v + 1];
            }
            const m = triangleAffine(src, dst, this.matrix);
            if (m === null)
                continue;
            ctx.save();
            ctx.beginPath();
            if (grow > 0)
                expandTriangle(dst, grow);
            ctx.moveTo(dst[0], dst[1]);
            ctx.lineTo(dst[2], dst[3]);
            ctx.lineTo(dst[4], dst[5]);
            ctx.closePath();
            ctx.clip();
            concatMatrix(ctx, m);
            ctx.drawImage(image, 0, 0);
            ctx.restore();
        }
    }
    ensureWorld(count) {
        if (this.world.length < count)
            this.world = new Float64Array(count);
        return this.world;
    }
    // -- clipping (spec 7.7) ---------------------------------------------------
    /**
     * Clips `ctx` to the mask polygon. `invert: true` clips to everything
     * OUTSIDE it: the polygon plus the visible rectangle with the even-odd rule.
     */
    applyClip(ctx, clip) {
        const p = clip.polygon;
        if (p.length < 6)
            return;
        ctx.beginPath();
        if (clip.invert) {
            const r = viewportRect(ctx);
            ctx.moveTo(r[0], r[1]);
            ctx.lineTo(r[2], r[1]);
            ctx.lineTo(r[2], r[3]);
            ctx.lineTo(r[0], r[3]);
            ctx.closePath();
        }
        ctx.moveTo(p[0], p[1]);
        for (let i = 2; i < p.length; i += 2)
            ctx.lineTo(p[i], p[i + 1]);
        ctx.closePath();
        ctx.clip(clip.invert ? 'evenodd' : 'nonzero');
    }
    // -- tint (spec 7.12) ------------------------------------------------------
    /**
     * Tinted drawable: the texels go to a scratch canvas, the color of spec 7.12
     * is applied there, and the result is composited onto the target with the
     * slot blend mode.
     */
    drawTinted(slot, attachment, region, image, color, clip, composite, alpha) {
        const ctx = this.ctx;
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const tex = this.scratch('tex', width, height);
        if (tex === null) {
            // No scratch available: fall back to alpha only, once.
            this.warn('scratch', 'no scratch canvas available; slot tint and dark color are ignored');
            ctx.save();
            ctx.globalAlpha = alpha;
            ctx.globalCompositeOperation = composite;
            if (clip !== null)
                this.applyClip(ctx, clip);
            this.paint(ctx, slot, attachment, region, image);
            ctx.restore();
            return;
        }
        const view = ctx.getTransform();
        tex.setTransform(1, 0, 0, 1, 0, 0);
        tex.globalAlpha = 1;
        tex.globalCompositeOperation = 'source-over';
        tex.clearRect(0, 0, width, height);
        tex.setTransform(view);
        tex.save();
        tex.imageSmoothingEnabled = this.smoothing;
        if (clip !== null)
            this.applyClip(tex, clip);
        this.paint(tex, slot, attachment, region, image);
        tex.restore();
        this.applyTint(tex, color, width, height);
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalAlpha = alpha;
        ctx.globalCompositeOperation = composite;
        ctx.drawImage(tex.canvas, 0, 0);
        ctx.restore();
    }
    /**
     * `out.rgb = tex.rgb * light.rgb + (1 - tex.rgb) * dark.rgb` (spec 7.12) on
     * the pixels already in `tex`. `light.a` is not applied here: the caller
     * puts it in `globalAlpha` when compositing.
     *
     * The `light` term is a `multiply` fill followed by `destination-in` with a
     * copy of the original alpha (a plain fill would paint the empty pixels).
     * The `dark` term is built in a third scratch as `dark * (1 - tex)` and
     * added with `lighter`.
     */
    applyTint(tex, color, width, height) {
        const mask = this.scratch('mask', width, height);
        if (mask === null)
            return;
        resetScratch(mask, width, height);
        mask.drawImage(tex.canvas, 0, 0);
        let dark = null;
        if (color.tintBlack && (color.dark[0] !== 0 || color.dark[1] !== 0 || color.dark[2] !== 0)) {
            dark = this.scratch('dark', width, height);
            if (dark !== null) {
                resetScratch(dark, width, height);
                dark.drawImage(tex.canvas, 0, 0);
                // rgb <- 1 - tex.rgb
                dark.globalCompositeOperation = 'difference';
                dark.fillStyle = '#ffffff';
                dark.fillRect(0, 0, width, height);
                // rgb <- dark.rgb * (1 - tex.rgb)
                dark.globalCompositeOperation = 'multiply';
                dark.fillStyle = cssColor(color.dark);
                dark.fillRect(0, 0, width, height);
                // alpha <- tex.a
                dark.globalCompositeOperation = 'destination-in';
                dark.drawImage(mask.canvas, 0, 0);
                dark.globalCompositeOperation = 'source-over';
            }
        }
        tex.save();
        tex.setTransform(1, 0, 0, 1, 0, 0);
        tex.globalAlpha = 1;
        if (color.light[0] !== 1 || color.light[1] !== 1 || color.light[2] !== 1) {
            tex.globalCompositeOperation = 'multiply';
            tex.fillStyle = cssColor(color.light);
            tex.fillRect(0, 0, width, height);
            tex.globalCompositeOperation = 'destination-in';
            tex.drawImage(mask.canvas, 0, 0);
        }
        if (dark !== null) {
            tex.globalCompositeOperation = 'lighter';
            tex.drawImage(dark.canvas, 0, 0);
        }
        tex.globalCompositeOperation = 'source-over';
        tex.restore();
    }
    scratch(kind, width, height) {
        let ctx = kind === 'tex' ? this.scratchTex : kind === 'mask' ? this.scratchMask : this.scratchDark;
        if (ctx === null) {
            try {
                ctx = this.createScratch();
            }
            catch {
                return null;
            }
            if (kind === 'tex')
                this.scratchTex = ctx;
            else if (kind === 'mask')
                this.scratchMask = ctx;
            else
                this.scratchDark = ctx;
        }
        if (ctx.canvas.width !== width || ctx.canvas.height !== height) {
            ctx.canvas.width = width;
            ctx.canvas.height = height;
        }
        return ctx;
    }
    // -- debug drawing ---------------------------------------------------------
    /** Optional overlay: bones, bounding boxes, points, paths, mesh wireframe, masks. */
    drawDebug(skeleton) {
        const d = this.debug;
        if (!d.bones && !d.boundingBoxes && !d.points && !d.paths && !d.meshes && !d.clipping)
            return;
        const ctx = this.ctx;
        const scale = this.viewScale();
        ctx.save();
        try {
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = (d.lineWidth ?? DEFAULT_DEBUG.lineWidth) / scale;
            this.drawAttachmentDebug(skeleton, scale);
            if (d.bones)
                this.drawBones(skeleton, scale);
        }
        finally {
            ctx.restore();
        }
    }
    drawBones(skeleton, scale) {
        const ctx = this.ctx;
        const d = this.debug;
        const radius = 3 / scale;
        ctx.strokeStyle = d.boneColor ?? DEFAULT_DEBUG.boneColor;
        ctx.beginPath();
        for (const bone of skeleton.bones) {
            const length = bone.data.length;
            if (length === 0)
                continue;
            ctx.moveTo(bone.worldX, bone.worldY);
            ctx.lineTo(bone.a * length + bone.worldX, bone.c * length + bone.worldY);
        }
        ctx.stroke();
        ctx.fillStyle = d.boneOriginColor ?? DEFAULT_DEBUG.boneOriginColor;
        for (const bone of skeleton.bones) {
            ctx.beginPath();
            ctx.arc(bone.worldX, bone.worldY, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    drawAttachmentDebug(skeleton, scale) {
        const d = this.debug;
        const ctx = this.ctx;
        for (const slot of skeleton.drawOrder) {
            const att = slot.attachment;
            if (att === null || !slot.visible)
                continue;
            if (d.boundingBoxes && att instanceof BoundingBoxAttachment) {
                ctx.strokeStyle = d.boundingBoxColor ?? DEFAULT_DEBUG.boundingBoxColor;
                this.strokePolygon(att.computeWorldVertices(slot, this.ensureWorld(att.vertexCount * 2), 0, 2), att.vertexCount * 2, true);
            }
            else if (d.clipping && att instanceof ClippingAttachment) {
                ctx.strokeStyle = d.clippingColor ?? DEFAULT_DEBUG.clippingColor;
                this.strokePolygon(att.computeWorldVertices(slot, this.ensureWorld(att.vertexCount * 2), 0, 2), att.vertexCount * 2, true);
            }
            else if (d.paths && att instanceof PathAttachment) {
                ctx.strokeStyle = d.pathColor ?? DEFAULT_DEBUG.pathColor;
                this.strokePath(slot, att, scale);
            }
            else if (d.points && att instanceof PointAttachment) {
                ctx.strokeStyle = d.pointColor ?? DEFAULT_DEBUG.pointColor;
                this.strokePoint(slot, att, scale);
            }
            else if (d.meshes && (att instanceof MeshAttachment || att instanceof LinkedMeshAttachment)) {
                ctx.strokeStyle = d.meshColor ?? DEFAULT_DEBUG.meshColor;
                this.strokeMesh(slot, att);
            }
        }
    }
    strokePolygon(points, count, close) {
        if (count < 4)
            return;
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        for (let i = 2; i < count; i += 2)
            ctx.lineTo(points[i], points[i + 1]);
        if (close)
            ctx.closePath();
        ctx.stroke();
    }
    strokeMesh(slot, attachment) {
        const ctx = this.ctx;
        const count = attachment.vertexCount * 2;
        const w = attachment.computeWorldVertices(slot, this.ensureWorld(count), 0, 2);
        const tri = attachment.triangles;
        ctx.beginPath();
        for (let t = 0; t < tri.length; t += 3) {
            const a = tri[t] * 2, b = tri[t + 1] * 2, c = tri[t + 2] * 2;
            ctx.moveTo(w[a], w[a + 1]);
            ctx.lineTo(w[b], w[b + 1]);
            ctx.lineTo(w[c], w[c + 1]);
            ctx.closePath();
        }
        ctx.stroke();
    }
    /** `path` attachment as its cubic curves plus a dot per anchor (spec 7.8). */
    strokePath(slot, attachment, scale) {
        const ctx = this.ctx;
        const anchors = attachment.anchorCount;
        if (anchors < 2)
            return;
        const count = attachment.vertexCount * 2;
        const w = attachment.computeWorldVertices(slot, this.ensureWorld(count), 0, 2);
        const curves = attachment.curveCount;
        ctx.beginPath();
        for (let i = 0; i < curves; i++) {
            const j = (i + 1) % anchors;
            const p = i * 6 + 2; // anchor i: point
            const out = i * 6 + 4; // anchor i: out handle
            const inn = j * 6; // anchor j: in handle
            const q = j * 6 + 2; // anchor j: point
            ctx.moveTo(w[p], w[p + 1]);
            ctx.bezierCurveTo(w[out], w[out + 1], w[inn], w[inn + 1], w[q], w[q + 1]);
        }
        ctx.stroke();
        const radius = 2.5 / scale;
        ctx.fillStyle = ctx.strokeStyle;
        for (let i = 0; i < anchors; i++) {
            const p = i * 6 + 2;
            ctx.beginPath();
            ctx.arc(w[p], w[p + 1], radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    /** `point` attachment as a cross plus a tick along its world rotation (spec 7.9). */
    strokePoint(slot, attachment, scale) {
        const ctx = this.ctx;
        const p = attachment.computeWorldPosition(slot.boneMatrix);
        const angle = (attachment.computeWorldRotation(slot.boneMatrix) * Math.PI) / 180;
        const arm = 5 / scale;
        ctx.beginPath();
        ctx.moveTo(p.x - arm, p.y);
        ctx.lineTo(p.x + arm, p.y);
        ctx.moveTo(p.x, p.y - arm);
        ctx.lineTo(p.x, p.y + arm);
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + Math.cos(angle) * arm * 2.5, p.y + Math.sin(angle) * arm * 2.5);
        ctx.stroke();
    }
}
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/**
 * Atlas region a drawable attachment shows right now (sequence frame
 * included). Exported: every renderer needs it, not just this one
 * (`ferramentas/render-png.mjs`).
 */
export function regionOf(slot, attachment) {
    if (attachment instanceof RegionAttachment)
        return attachment.regionFor(slot);
    if (attachment instanceof MeshAttachment)
        return attachment.regionFor(slot);
    if (attachment instanceof LinkedMeshAttachment)
        return attachment.regionFor(slot);
    return null;
}
/** Pushes each vertex of `tri` away from the centroid by `amount`. */
function expandTriangle(tri, amount) {
    const cx = (tri[0] + tri[2] + tri[4]) / 3;
    const cy = (tri[1] + tri[3] + tri[5]) / 3;
    for (let i = 0; i < 6; i += 2) {
        const dx = tri[i] - cx;
        const dy = tri[i + 1] - cy;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len < 1e-9)
            continue;
        tri[i] += (dx / len) * amount;
        tri[i + 1] += (dy / len) * amount;
    }
}
/** Visible rectangle in the current user space: `[minX, minY, maxX, maxY]`. */
function viewportRect(ctx) {
    const out = new Float64Array(4);
    const m = ctx.getTransform();
    const det = m.a * m.d - m.b * m.c;
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;
    if (Math.abs(det) < 1e-12) {
        out[0] = -1e7;
        out[1] = -1e7;
        out[2] = 1e7;
        out[3] = 1e7;
        return out;
    }
    const id = 1 / det;
    const ia = m.d * id, ib = -m.c * id, ic = -m.b * id, idd = m.a * id;
    const ie = (m.c * m.f - m.d * m.e) * id;
    const iff = (m.b * m.e - m.a * m.f) * id;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const corners = [0, 0, w, 0, w, h, 0, h];
    for (let i = 0; i < 8; i += 2) {
        const x = ia * corners[i] + ib * corners[i + 1] + ie;
        const y = ic * corners[i] + idd * corners[i + 1] + iff;
        if (x < minX)
            minX = x;
        if (x > maxX)
            maxX = x;
        if (y < minY)
            minY = y;
        if (y > maxY)
            maxY = y;
    }
    // A margin so the even-odd rectangle never coincides with the polygon edge.
    const pad = Math.max(maxX - minX, maxY - minY) * 0.5 + 1;
    out[0] = minX - pad;
    out[1] = minY - pad;
    out[2] = maxX + pad;
    out[3] = maxY + pad;
    return out;
}
function resetScratch(ctx, width, height) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, width, height);
}
/** `[r, g, b]` in 0..1 as `rgb(...)`, clamped and rounded like a texel byte. */
function cssColor(c) {
    const to255 = (v) => Math.round(Math.min(1, Math.max(0, v)) * 255);
    return `rgb(${to255(c[0])}, ${to255(c[1])}, ${to255(c[2])})`;
}
function defaultScratch() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx === null)
        throw new Error('2d context not available');
    return ctx;
}
