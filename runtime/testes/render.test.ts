/**
 * Canvas 2D renderer: what can be checked without a browser.
 *
 * - `triangleAffine`: the matrix that takes a source triangle (page pixels) to
 *   a destination triangle (world vertices), verified with points worked out
 *   by hand from the barycentric coordinates.
 * - `blendComposite`: the `blend` of spec 7.12 as a `globalCompositeOperation`.
 * - `collectDrawables` + `computeFinalColor` on `heroi.bone`: the exact list a
 *   renderer receives, with the clipping mask of spec 7.7 and the colors of
 *   spec 7.12.
 */

import { readFileSync } from 'node:fs';
import { loadSkeletonData, loadAtlas } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { collectDrawables } from '../src/render-list.js';
import { computeFinalColor } from '../src/color.js';
import { transformPoint } from '../src/math.js';
import { RegionAttachment } from '../src/attachments/region.js';
import { BLEND_COMPOSITE, blendComposite, triangleAffine } from '../src/render/canvas.js';
import '../src/constraints/ik.js';
import '../src/constraints/transform.js';
import '../src/constraints/physics.js';

const EXAMPLES = process.cwd().replace(/\\/g, '/') + '/formato/exemplos/';

function heroi(): Skeleton {
  const atlas = loadAtlas(JSON.parse(readFileSync(EXAMPLES + 'heroi.atlas.json', 'utf8')));
  const data = loadSkeletonData(JSON.parse(readFileSync(EXAMPLES + 'heroi.bone', 'utf8')), { atlases: [atlas] });
  return new Skeleton(data);
}

// ---------------------------------------------------------------------------

describe('triangleAffine', () => {
  // src = (0,0) (2,0) (0,2); dst = (10,10) (10,14) (4,10).
  // u1 = (2,0), u2 = (0,2), det = 4; v1 = (0,4), v2 = (-6,0).
  // By hand: x' = -3y + 10, y' = 2x + 10.
  const src = [0, 0, 2, 0, 0, 2];
  const dst = [10, 10, 10, 14, 4, 10];

  it('gives the matrix worked out by hand', () => {
    const m = triangleAffine(src, dst);
    expect(m).not.toBeNull();
    expect(m!.a).toBeCloseTo(0, 12);
    expect(m!.b).toBeCloseTo(-3, 12);
    expect(m!.c).toBeCloseTo(2, 12);
    expect(m!.d).toBeCloseTo(0, 12);
    expect(m!.worldX).toBeCloseTo(10, 12);
    expect(m!.worldY).toBeCloseTo(10, 12);
  });

  it('maps the three corners onto the destination corners', () => {
    const m = triangleAffine(src, dst)!;
    for (let i = 0; i < 6; i += 2) {
      const p = transformPoint(m, src[i], src[i + 1]);
      expect(p.x).toBeCloseTo(dst[i], 12);
      expect(p.y).toBeCloseTo(dst[i + 1], 12);
    }
  });

  it('maps an interior point to the point with the same barycentric weights', () => {
    const m = triangleAffine(src, dst)!;
    // (1, 0.5) = src0 + 0.5*u1 + 0.25*u2, so the image is
    // dst0 + 0.5*v1 + 0.25*v2 = (10,10) + (0,2) + (-1.5,0) = (8.5, 12).
    const p = transformPoint(m, 1, 0.5);
    expect(p.x).toBeCloseTo(8.5, 12);
    expect(p.y).toBeCloseTo(12, 12);
    // Centroid -> centroid.
    const c = transformPoint(m, 2 / 3, 2 / 3);
    expect(c.x).toBeCloseTo((10 + 10 + 4) / 3, 12);
    expect(c.y).toBeCloseTo((10 + 14 + 10) / 3, 12);
  });

  it('handles a flip (the y-up skeleton against a y-down texture)', () => {
    // Texture pixels (0,0) (4,0) (0,4) onto world (0,0) (4,0) (0,-4): y flips.
    const m = triangleAffine([0, 0, 4, 0, 0, 4], [0, 0, 4, 0, 0, -4])!;
    expect(m.a).toBeCloseTo(1, 12);
    expect(m.b).toBeCloseTo(0, 12);
    expect(m.c).toBeCloseTo(0, 12);
    expect(m.d).toBeCloseTo(-1, 12);
    const p = transformPoint(m, 2, 3);
    expect(p.x).toBeCloseTo(2, 12);
    expect(p.y).toBeCloseTo(-3, 12);
  });

  it('returns null for a degenerate source triangle', () => {
    expect(triangleAffine([0, 0, 1, 1, 2, 2], [0, 0, 1, 0, 0, 1])).toBeNull();
    expect(triangleAffine([5, 5, 5, 5, 5, 5], [0, 0, 1, 0, 0, 1])).toBeNull();
  });

  it('writes into the matrix it is given', () => {
    const out = { a: 0, b: 0, c: 0, d: 0, worldX: 0, worldY: 0 };
    const m = triangleAffine(src, dst, out);
    expect(m).toBe(out);
  });
});

// ---------------------------------------------------------------------------

describe('blend mode -> globalCompositeOperation', () => {
  it('maps the four modes of spec 7.12', () => {
    expect(BLEND_COMPOSITE.normal).toBe('source-over');
    expect(BLEND_COMPOSITE.additive).toBe('lighter');
    expect(BLEND_COMPOSITE.multiply).toBe('multiply');
    expect(BLEND_COMPOSITE.screen).toBe('screen');
  });

  it('blendComposite reads the table and falls back to normal', () => {
    expect(blendComposite('additive')).toBe('lighter');
    expect(blendComposite('screen')).toBe('screen');
    // Spec 7.12: a runtime without a mode falls back to `normal`.
    expect(blendComposite('inexistente' as never)).toBe('source-over');
  });
});

// ---------------------------------------------------------------------------

describe('a region quad is affine', () => {
  it('the matrix from three corners also lands the fourth (plain region)', () => {
    const skeleton = heroi();
    const slot = skeleton.slots.find((s) => s.data.name === 'body')!;
    const att = slot.attachment as RegionAttachment;
    expect(att).toBeInstanceOf(RegionAttachment);
    const world = att.computeWorldVertices(slot) as Float64Array;
    const uvs = att.uvsFor(slot);
    const page = att.regionFor(slot)!.page;
    const src: number[] = [];
    for (let i = 0; i < 6; i += 2) src.push(uvs[i] * page.width, uvs[i + 1] * page.height);
    const m = triangleAffine(src, [world[0], world[1], world[2], world[3], world[4], world[5]])!;
    const tl = transformPoint(m, uvs[6] * page.width, uvs[7] * page.height);
    expect(tl.x).toBeCloseTo(world[6], 9);
    expect(tl.y).toBeCloseTo(world[7], 9);
  });

  it('also with a region rotated 90 in the atlas (spec 10.3, 10.4)', () => {
    const skeleton = heroi();
    const slot = skeleton.slots.find((s) => s.data.name === 'arm')!;
    const att = slot.attachment as RegionAttachment;
    const region = att.regionFor(slot)!;
    expect(region.rotation).toBe(90);
    const world = att.computeWorldVertices(slot) as Float64Array;
    const uvs = att.uvsFor(slot);
    const page = region.page;
    const src: number[] = [];
    for (let i = 0; i < 6; i += 2) src.push(uvs[i] * page.width, uvs[i + 1] * page.height);
    const m = triangleAffine(src, [world[0], world[1], world[2], world[3], world[4], world[5]])!;
    const tl = transformPoint(m, uvs[6] * page.width, uvs[7] * page.height);
    expect(tl.x).toBeCloseTo(world[6], 9);
    expect(tl.y).toBeCloseTo(world[7], 9);
  });
});

// ---------------------------------------------------------------------------

describe('the render list of heroi.bone', () => {
  const skeleton = heroi();
  const drawables = collectDrawables(skeleton);

  it('draws only the drawable attachments, in the file order', () => {
    expect(drawables.map((d) => d.slot.data.name)).toEqual([
      'cape_upper', 'cape_lower', 'hair',
      'arm_back', 'forearm_back', 'hand_back',
      'leg_back', 'shin_back', 'foot_back',
      'body', 'head',
      'leg_front', 'shin_front', 'foot_front',
      'arm', 'forearm', 'sword_blade', 'weapon', 'hand',
    ]);
    expect(drawables.map((d) => d.attachment.type)).toEqual([
      'region', 'region', 'region',
      'region', 'region', 'region',
      'region', 'region', 'region',
      'region', 'mesh',
      'region', 'region', 'region',
      'region', 'region', 'region', 'skeleton', 'region',
    ]);
  });

  it('leaves clipping, boundingbox, point and path out of the list', () => {
    const names = drawables.map((d) => d.slot.data.name);
    expect(names).not.toContain('mask');
    expect(names).not.toContain('hitbox');
    expect(names).not.toContain('hand_point');
    expect(names).not.toContain('cape_path');
  });

  it('the mask clips up to the slot named in `end` (spec 7.7)', () => {
    const clipped = drawables.filter((d) => d.clip !== null).map((d) => d.slot.data.name);
    expect(clipped).toEqual(['body', 'head']);
    const clip = drawables.find((d) => d.slot.data.name === 'body')!.clip!;
    expect(clip.slot.data.name).toBe('mask');
    expect(clip.end?.name).toBe('head');
    expect(clip.invert).toBe(false);
    // The mask polygon is the world image of [-30,-70, 150,-70, 150,70, -30,70].
    expect(clip.polygon.length).toBe(8);
  });

  it('every drawable resolves to an atlas region on the heroi page', () => {
    for (const d of drawables) {
      if (d.attachment.type === 'skeleton') continue;
      const att = d.attachment as unknown as { regionFor(slot: typeof d.slot): { page: { name: string } } | null };
      const region = att.regionFor(d.slot);
      expect(region).not.toBeNull();
      expect(region!.page.name).toBe('heroi');
    }
  });

  it('computeFinalColor gives white for the plain slots and the dark tint for hair', () => {
    const body = drawables.find((d) => d.slot.data.name === 'body')!;
    const bodyColor = computeFinalColor(body.slot, body.attachment);
    expect(Array.from(bodyColor.light)).toEqual([1, 1, 1, 1]);
    expect(bodyColor.tintBlack).toBe(false);
    expect(Array.from(bodyColor.dark)).toEqual([0, 0, 0]);

    const hair = drawables.find((d) => d.slot.data.name === 'hair')!;
    const hairColor = computeFinalColor(hair.slot, hair.attachment);
    expect(hairColor.tintBlack).toBe(true);
    expect(Array.from(hairColor.dark)).toEqual([0.1, 0, 0.1]);
    expect(Array.from(hairColor.light)).toEqual([1, 1, 1, 1]);
  });

  it('a slot tint multiplies the attachment color (spec 7.12)', () => {
    const head = drawables.find((d) => d.slot.data.name === 'head')!;
    head.slot.color.set([0.5, 1, 1, 0.25]);
    head.attachment.color.set([1, 0.5, 1, 0.5]);
    const c = computeFinalColor(head.slot, head.attachment);
    expect(Array.from(c.light)).toEqual([0.5, 0.5, 1, 0.125]);
  });

  it('the blend of every slot maps to a composite operation', () => {
    for (const d of drawables) {
      expect(typeof blendComposite(d.slot.blend)).toBe('string');
    }
    expect(blendComposite(skeleton.slots[0].blend)).toBe('source-over');
  });
});
