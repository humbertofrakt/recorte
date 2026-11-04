// SPDX-License-Identifier: Apache-2.0
/**
 * `path` attachment: cubic Bezier curve that guides the `path` constraint
 * (spec 7.8). Never drawn. Vertices come in groups of three per anchor:
 * `inX, inY, x, y, outX, outY`.
 */
import { VertexAttachment } from './vertex-attachment.js';
export class PathAttachment extends VertexAttachment {
    type = 'path';
    closed;
    constantSpeed;
    /** Accumulated length up to the end of each curve, setup pose. One entry per curve. */
    lengths;
    constructor(name, options = {}) {
        super(name, options.color, options.vertices ?? null, options.binding ?? null);
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
}
