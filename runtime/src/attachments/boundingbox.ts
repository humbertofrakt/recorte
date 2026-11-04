// SPDX-License-Identifier: Apache-2.0
/**
 * `boundingbox` attachment: collision / hit-test shape, never drawn (spec 7.6).
 *
 * `polygon` uses the vertices (or binding) as written. `rectangle` and
 * `ellipse` are converted at load into local polygons in the slot bone space
 * (4 corners, or 16 points for the ellipse, as the spec allows), so the same
 * skinning of spec 7.4 brings them to the world.
 */

import { VertexAttachment, BindingData } from './vertex-attachment.js';
import type { BoundingBoxShape } from '../types.js';
import { cosDeg, sinDeg } from '../math.js';

export const ELLIPSE_SEGMENTS = 16;

export class BoundingBoxAttachment extends VertexAttachment {
  readonly type = 'boundingbox' as const;
  readonly shape: BoundingBoxShape;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly rotation: number;

  constructor(
    name: string,
    options: {
      color?: ArrayLike<number>; shape?: BoundingBoxShape;
      vertices?: ArrayLike<number> | null; binding?: BindingData | null;
      x?: number; y?: number; width?: number; height?: number; rotation?: number;
    } = {},
  ) {
    const shape = options.shape ?? 'polygon';
    const x = options.x ?? 0;
    const y = options.y ?? 0;
    const width = options.width ?? 0;
    const height = options.height ?? 0;
    const rotation = options.rotation ?? 0;
    let vertices: ArrayLike<number> | null = options.vertices ?? null;
    let binding: BindingData | null = options.binding ?? null;
    if (shape !== 'polygon') {
      binding = null;
      vertices = shape === 'rectangle'
        ? rectangleVertices(x, y, width, height, rotation)
        : ellipseVertices(x, y, width, height, rotation, ELLIPSE_SEGMENTS);
    }
    super(name, options.color, vertices, binding);
    this.shape = shape;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.rotation = rotation;
  }
}

function rectangleVertices(x: number, y: number, width: number, height: number, rotation: number): number[] {
  const hw = width / 2;
  const hh = height / 2;
  const c = cosDeg(rotation);
  const s = sinDeg(rotation);
  const corners = [-hw, -hh, hw, -hh, hw, hh, -hw, hh];
  const out: number[] = [];
  for (let i = 0; i < 8; i += 2) {
    const px = corners[i];
    const py = corners[i + 1];
    out.push(px * c - py * s + x, px * s + py * c + y);
  }
  return out;
}

function ellipseVertices(x: number, y: number, width: number, height: number, rotation: number, segments: number): number[] {
  const rx = width / 2;
  const ry = height / 2;
  const c = cosDeg(rotation);
  const s = sinDeg(rotation);
  const out: number[] = [];
  for (let i = 0; i < segments; i++) {
    const t = (i / segments) * Math.PI * 2;
    const px = Math.cos(t) * rx;
    const py = Math.sin(t) * ry;
    out.push(px * c - py * s + x, px * s + py * c + y);
  }
  return out;
}
