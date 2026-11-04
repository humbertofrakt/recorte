// SPDX-License-Identifier: Apache-2.0
/**
 * `linkedmesh` attachment: borrows the geometry of a `mesh` and changes only
 * the image (spec 7.5). Vertices, binding, UVs, triangles, hull and edges are
 * the parent's arrays, shared by reference. Own: `path`, `color`, `sequence`
 * (spec 7.10), with per-frame page UVs like `MeshAttachment`.
 */
import { VertexAttachment } from './vertex-attachment.js';
import { computeMeshRegionUVs } from './mesh.js';
export class LinkedMeshAttachment extends VertexAttachment {
    type = 'linkedmesh';
    path;
    parent;
    /** Name of the skin where `parent` lives. */
    parentSkin;
    inheritDeform;
    width;
    height;
    sequence;
    /** Atlas region of the setup frame (`null` = image missing). */
    region = null;
    /** Page UVs of the setup frame. */
    regionUVs;
    /** Per sequence frame: page UVs (empty without a sequence). */
    frameRegionUVs = [];
    constructor(name, parent, options = {}) {
        super(name, options.color, parent.binding === null ? parent.vertices : null, parent.binding);
        this.parent = parent;
        this.path = options.path ?? name;
        this.parentSkin = options.skin ?? 'default';
        this.inheritDeform = options.inheritDeform ?? true;
        this.width = options.width ?? 0;
        this.height = options.height ?? 0;
        this.sequence = options.sequence ?? null;
        if (this.inheritDeform)
            this.timelineAttachment = parent;
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
        if (sequence === null)
            return;
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
        if (sequence === null)
            return this.region;
        return sequence.regions[sequence.frameIndexFor(slot)] ?? null;
    }
    /** Page UVs for `slot` (read only; the current frame with a sequence). */
    regionUVsFor(slot) {
        const sequence = this.sequence;
        if (sequence === null)
            return this.regionUVs;
        return this.frameRegionUVs[sequence.frameIndexFor(slot)] ?? this.regionUVs;
    }
}
