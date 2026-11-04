// SPDX-License-Identifier: Apache-2.0
/**
 * `linkedmesh` attachment: borrows the geometry of a `mesh` and changes only
 * the image (spec 7.5). Vertices, binding, UVs, triangles, hull and edges are
 * the parent's arrays, shared by reference. Own: `path`, `color`, `sequence`
 * (spec 7.10), with per-frame page UVs like `MeshAttachment`.
 */

import { VertexAttachment } from './vertex-attachment.js';
import { computeMeshRegionUVs, type MeshAttachment } from './mesh.js';
import type { SequenceData } from './sequence.js';
import type { AtlasRegionData } from '../data.js';
import type { Slot } from '../skeleton.js';

export class LinkedMeshAttachment extends VertexAttachment {
  readonly type = 'linkedmesh' as const;
  readonly path: string;
  readonly parent: MeshAttachment;
  /** Name of the skin where `parent` lives. */
  readonly parentSkin: string;
  readonly inheritDeform: boolean;
  readonly width: number;
  readonly height: number;
  readonly sequence: SequenceData | null;

  /** Atlas region of the setup frame (`null` = image missing). */
  region: AtlasRegionData | null = null;
  /** Page UVs of the setup frame. */
  readonly regionUVs: Float64Array;
  /** Per sequence frame: page UVs (empty without a sequence). */
  readonly frameRegionUVs: Float64Array[] = [];

  constructor(
    name: string,
    parent: MeshAttachment,
    options: {
      path?: string; color?: ArrayLike<number>; skin?: string; inheritDeform?: boolean;
      width?: number; height?: number; sequence?: SequenceData | null;
    } = {},
  ) {
    super(name, options.color, parent.binding === null ? parent.vertices : null, parent.binding);
    this.parent = parent;
    this.path = options.path ?? name;
    this.parentSkin = options.skin ?? 'default';
    this.inheritDeform = options.inheritDeform ?? true;
    this.width = options.width ?? 0;
    this.height = options.height ?? 0;
    this.sequence = options.sequence ?? null;
    if (this.inheritDeform) this.timelineAttachment = parent;
    this.regionUVs = new Float64Array(parent.uvs.length);
    this.updateRegion();
  }

  get uvs(): Float64Array {
    return this.parent.uvs;
  }

  get triangles(): Int32Array {
    return this.parent.triangles;
  }

  get hull(): number {
    return this.parent.hull;
  }

  get edges(): Int32Array {
    return this.parent.edges;
  }

  get triangleCount(): number {
    return this.parent.triangleCount;
  }

  /** Sets the setup region and recomputes the page UVs (every frame with a sequence). Loader / editor only. */
  setRegion(region: AtlasRegionData | null): void {
    this.region = region;
    this.updateRegion();
  }

  updateRegion(): void {
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
  frameIndexFor(slot: Slot): number {
    return this.sequence === null ? -1 : this.sequence.frameIndexFor(slot);
  }

  /** Atlas region drawn for `slot` (the current frame, or the setup region). */
  regionFor(slot: Slot): AtlasRegionData | null {
    const sequence = this.sequence;
    if (sequence === null) return this.region;
    return sequence.regions[sequence.frameIndexFor(slot)] ?? null;
  }

  /** Page UVs for `slot` (read only; the current frame with a sequence). */
  regionUVsFor(slot: Slot): Float64Array {
    const sequence = this.sequence;
    if (sequence === null) return this.regionUVs;
    return this.frameRegionUVs[sequence.frameIndexFor(slot)] ?? this.regionUVs;
  }
}
