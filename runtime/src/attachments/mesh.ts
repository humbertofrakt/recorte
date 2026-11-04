// SPDX-License-Identifier: Apache-2.0
/**
 * `mesh` attachment: textured, deformable polygon (spec 7.4).
 *
 * `uvs` are in the original image (`v = 0` at the top); `regionUVs` are the
 * same points mapped to the atlas page (spec 10.4) for the setup region,
 * recomputed by `updateRegion()`. With a sequence (spec 7.10) every frame gets
 * its own page UVs (`frameRegionUVs`); `regionUVsFor(slot)` picks the frame
 * from `slot.sequenceIndex` without mutating the attachment.
 */

import { VertexAttachment, BindingData } from './vertex-attachment.js';
import type { SequenceData } from './sequence.js';
import type { AtlasRegionData } from '../data.js';
import type { Slot } from '../skeleton.js';

/** Maps `uvs` (original image) to the page of `region` (spec 10.4); identity without a region. */
export function computeMeshRegionUVs(uvs: Float64Array, region: AtlasRegionData | null, out: Float64Array): void {
  if (region === null) {
    out.set(uvs);
    return;
  }
  for (let i = 0; i < uvs.length; i += 2) region.computeUV(uvs[i], uvs[i + 1], out, i);
}

export class MeshAttachment extends VertexAttachment {
  readonly type = 'mesh' as const;
  readonly path: string;
  /** `2N` numbers, original image space, `v` down. */
  readonly uvs: Float64Array;
  /** `3T` vertex indices, counter-clockwise in skeleton space. */
  readonly triangles: Int32Array;
  readonly hull: number;
  /** Pairs of vertex indices. Editor only. */
  readonly edges: Int32Array;
  readonly width: number;
  readonly height: number;
  readonly sequence: SequenceData | null;

  /** Atlas region of the setup frame (`null` = image missing). */
  region: AtlasRegionData | null = null;
  /** Page UVs (`2N`) of the setup frame; equals `uvs` when `region === null`. */
  readonly regionUVs: Float64Array;
  /** Per sequence frame: page UVs (empty without a sequence). */
  readonly frameRegionUVs: Float64Array[] = [];

  constructor(
    name: string,
    options: {
      path?: string; color?: ArrayLike<number>;
      vertices?: ArrayLike<number> | null; binding?: BindingData | null;
      uvs: ArrayLike<number>; triangles: ArrayLike<number>;
      hull?: number; edges?: ArrayLike<number>;
      width?: number; height?: number; sequence?: SequenceData | null;
    },
  ) {
    super(name, options.color, options.vertices ?? null, options.binding ?? null);
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
  setRegion(region: AtlasRegionData | null): void {
    this.region = region;
    this.updateRegion();
  }

  /** Maps `uvs` (original image) to the page (spec 10.4), for the setup region and every frame. */
  updateRegion(): void {
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

  /** Number of triangles `T`. */
  get triangleCount(): number {
    return this.triangles.length / 3;
  }
}
