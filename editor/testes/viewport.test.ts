/**
 * Viewport, camera, picking and transform tools (owner B).
 *
 * No DOM here: the camera, the picking and the tool maths are all plain
 * functions over numbers, and the tools only need an `EditorDoc`. Every
 * expected number is worked out by hand in the comment above the assertion,
 * so a failing test says which rule broke, not just which number moved.
 */

import { describe, expect, it, beforeEach } from 'vitest';

import {
  loadAnimationsFor,
  loadSkeletonData,
  Skeleton,
  type AtlasData,
  type AtlasPageData,
  type BoneFile,
  type SkeletonData,
} from '../../runtime/src/index.js';
import {
  emptySelection,
  type Command,
  type EditorDoc,
  type Selection,
  type ToolEvent,
} from '../src/contract.js';
import { Camera, MAX_ZOOM, MIN_ZOOM, gridStep } from '../src/viewport/camera.js';
import {
  distanceToSegment,
  pickAll,
  pickAt,
  pointInTriangle,
  selectionFor,
} from '../src/viewport/picking.js';
import { readBone, SetProperty, setProperties } from '../src/viewport/tools/select.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { drifted, gripOfLabel, heldNotice, rulesOn, type BoneNumbers } from '../src/viewport/held-by-rule.js';
import { translateTool, lockAxis } from '../src/viewport/tools/translate.js';
import { rotateTool, snapAngle } from '../src/viewport/tools/rotate.js';
import { scaleTool } from '../src/viewport/tools/scale.js';
import { createBoneTool, describeBone } from '../src/viewport/tools/create-bone.js';
import { Doc } from '../src/doc/document.js';
import { GestureNotice } from '../src/viewport/gesture-notice.js';

// ---------------------------------------------------------------------------
// A document to test against
// ---------------------------------------------------------------------------

/**
 * Skeleton used by the tool tests:
 *
 *   root                 origin, no rotation
 *   +-- hips             at (0, 90)
 *   |   +-- torso        rotated 90 degrees, so it points up
 *   +-- espelho          scaleX -1: it MIRRORS its children
 *   |   +-- filho        a bone under the mirror
 *   +-- caixa_osso       carries the bounding box used by the picking tests
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', x: 0, y: 90, length: 10 },
      { name: 'torso', parent: 'hips', rotation: 90, length: 70 },
      { name: 'espelho', parent: 'root', scaleX: -1 },
      { name: 'filho', parent: 'espelho', length: 20 },
      { name: 'caixa_osso', parent: 'root', x: 200, y: 0 },
    ],
    slots: [{ name: 'caixa', bone: 'caixa_osso', attachment: 'caixa' }],
    skins: [{
      name: 'default',
      attachments: {
        caixa: { caixa: { type: 'boundingbox', shape: 'rectangle', width: 20, height: 20 } },
      },
    }],
  } as BoneFile;
}

/** The smallest `EditorDoc` the tools need. Commands behave as in the editor. */
class TestDoc implements EditorDoc {
  file: BoneFile;
  path: string | null = null;
  dirty = false;
  atlases: readonly AtlasData[] = [];
  selection: Selection = emptySelection();
  time = 0;
  animation: string | null = null;
  warnings: readonly string[] = [];
  visibleSkins: string[] = [];

  private skeletonData: SkeletonData | null = null;
  private instance: Skeleton | null = null;
  private done: Command[] = [];
  private undone: Command[] = [];

  constructor(file: BoneFile) {
    this.file = file;
    this.rebuild();
  }

  get data(): SkeletonData | null { return this.skeletonData; }
  get skeleton(): Skeleton | null { return this.instance; }

  imageFor(_page: AtlasPageData): CanvasImageSource | null { return null; }

  select(selection: Selection): void { this.selection = selection; }

  notices: string[] = [];
  notice(text: string): void { this.notices.push(text); }

  run(command: Command): void {
    const previous = this.done[this.done.length - 1];
    if (previous !== undefined && command.mergeWith?.(previous) === true) this.done.pop();
    command.apply(this);
    this.done.push(command);
    this.undone.length = 0;
    this.dirty = true;
    if (command.animationOnly !== undefined) this.rebuildAnimations();
    else if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }

  undo(): void {
    const command = this.done.pop();
    if (command === undefined) return;
    command.revert(this);
    this.undone.push(command);
    if (command.animationOnly !== undefined) this.rebuildAnimations();
    else if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }

  redo(): void {
    const command = this.undone.pop();
    if (command === undefined) return;
    command.apply(this);
    this.done.push(command);
    if (command.animationOnly !== undefined) this.rebuildAnimations();
    else if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }

  get canUndo(): boolean { return this.done.length > 0; }
  get canRedo(): boolean { return this.undone.length > 0; }
  get undoLabel(): string | null { return this.done[this.done.length - 1]?.label ?? null; }
  get redoLabel(): string | null { return this.undone[this.undone.length - 1]?.label ?? null; }
  /** Number of undo entries, so a test can check that a drag merged into one. */
  get undoCount(): number { return this.done.length; }

  rebuild(): void {
    this.skeletonData = loadSkeletonData(this.file);
    this.instance = new Skeleton(this.skeletonData);
    this.instance.updateWorldTransform(this.time);
  }

  /** The cheap path `Doc` takes after a key: only the timelines are re-read. */
  rebuildAnimations(): void {
    const data = this.skeletonData;
    if (data === null) {
      this.rebuild();
      return;
    }
    data.replaceAnimations(loadAnimationsFor(data, this.file).animations);
    this.repose();
  }

  repose(): void {
    this.instance?.updateWorldTransform(this.time);
  }

  on(): () => void { return () => {}; }
}

/** A pointer event already in world coordinates, as the viewport builds it. */
function event(x: number, y: number, scale = 1, extra: Partial<ToolEvent> = {}): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale, ...extra };
}

// ---------------------------------------------------------------------------
// Camera
// ---------------------------------------------------------------------------

describe('camera', () => {
  it('screenToWorld undoes worldToScreen', () => {
    const camera = new Camera();
    camera.setViewSize(800, 600);
    for (const [x, y, zoom] of [[0, 0, 1], [37, -12, 2], [-410, 250, 0.25], [5, 5, 7.5]]) {
      camera.centerOn(x / 2, y / 2);
      camera.setZoom(zoom);
      const screen = camera.worldToScreen(x, y);
      const back = camera.screenToWorld(screen.x, screen.y);
      expect(back.x).toBeCloseTo(x, 9);
      expect(back.y).toBeCloseTo(y, 9);
    }
  });

  it('puts world (0, 0) at the centre of the view and points Y up', () => {
    const camera = new Camera();
    camera.setViewSize(800, 600);
    // Centre of an 800x600 view is (400, 300).
    expect(camera.worldToScreen(0, 0)).toEqual({ x: 400, y: 300 });
    // World Y up = screen Y down: 100 units up is 100 pixels higher on screen.
    expect(camera.worldToScreen(0, 100)).toEqual({ x: 400, y: 200 });
  });

  it('zooming with the wheel keeps the point under the cursor', () => {
    const camera = new Camera();
    camera.setViewSize(800, 600);
    camera.centerOn(30, -20);
    camera.setZoom(1.5);
    const cursor = { x: 610, y: 120 };
    const before = camera.screenToWorld(cursor.x, cursor.y);
    camera.zoomAtScreen(cursor.x, cursor.y, 2);
    expect(camera.zoom).toBeCloseTo(3, 9);
    const after = camera.screenToWorld(cursor.x, cursor.y);
    expect(after.x).toBeCloseTo(before.x, 9);
    expect(after.y).toBeCloseTo(before.y, 9);
  });

  it('keeps the zoom inside its limits', () => {
    const camera = new Camera();
    camera.setViewSize(800, 600);
    camera.setZoom(1e9);
    expect(camera.zoom).toBe(MAX_ZOOM);
    camera.setZoom(1e-9);
    expect(camera.zoom).toBe(MIN_ZOOM);
  });

  it('fits bounds with a margin', () => {
    const camera = new Camera();
    camera.setViewSize(800, 600);
    // Usable area with a 10% margin on each side: 800*0.8 = 640, 600*0.8 = 480.
    // 640/200 = 3.2 and 480/100 = 4.8, so the width decides: zoom 3.2.
    camera.fit({ x: -100, y: 0, width: 200, height: 100 }, 0.1);
    expect(camera.zoom).toBeCloseTo(3.2, 9);
    // The centre of the bounds goes to the centre of the view: (0, 50).
    expect(camera.x).toBeCloseTo(0, 9);
    expect(camera.y).toBeCloseTo(50, 9);
  });

  it('fit on empty bounds only re-centres', () => {
    const camera = new Camera();
    camera.setViewSize(800, 600);
    camera.setZoom(2);
    camera.fit({ x: 10, y: 20, width: 0, height: 0 });
    expect(camera.zoom).toBe(2);
    expect(camera.x).toBe(10);
    expect(camera.y).toBe(20);
  });

  it('applyTo builds the same mapping as worldToScreen', () => {
    const camera = new Camera();
    camera.setViewSize(800, 600);
    camera.centerOn(-15, 40);
    camera.setZoom(2.5);
    const dpr = 2;
    let m = [1, 0, 0, 1, 0, 0];
    const fake = {
      setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
        m = [a, b, c, d, e, f];
      },
    } as unknown as CanvasRenderingContext2D;
    camera.applyTo(fake, dpr);
    for (const [wx, wy] of [[0, 0], [100, -60], [-33, 7]]) {
      const device = { x: m[0] * wx + m[2] * wy + m[4], y: m[1] * wx + m[3] * wy + m[5] };
      const screen = camera.worldToScreen(wx, wy);
      expect(device.x).toBeCloseTo(screen.x * dpr, 6);
      expect(device.y).toBeCloseTo(screen.y * dpr, 6);
    }
  });

  it('gridStep gives round numbers that stay readable on screen', () => {
    for (const zoom of [0.05, 0.3, 1, 2, 9, 40]) {
      const step = gridStep(zoom, 48);
      const pixels = step * zoom;
      expect(pixels).toBeGreaterThanOrEqual(48);
      expect(pixels).toBeLessThan(48 * 10);
      const mantissa = step / Math.pow(10, Math.floor(Math.log10(step)));
      expect([1, 2, 5, 10]).toContain(Math.round(mantissa * 1e6) / 1e6);
    }
  });
});

// ---------------------------------------------------------------------------
// Picking
// ---------------------------------------------------------------------------

describe('picking geometry', () => {
  // Triangle with corners (0, 0), (10, 0) and (0, 10).
  const inside = (x: number, y: number): boolean => pointInTriangle(x, y, 0, 0, 10, 0, 0, 10);

  it('says which points are inside a known triangle', () => {
    expect(inside(2, 2)).toBe(true);      // well inside
    expect(inside(0, 0)).toBe(true);      // a corner counts as inside
    expect(inside(5, 5)).toBe(true);      // exactly on the long edge
    expect(inside(8, 8)).toBe(false);     // past the long edge
    expect(inside(-1, 5)).toBe(false);    // left of the triangle
    expect(inside(3, -0.5)).toBe(false);  // below it
  });

  it('measures the distance from a point to a bone segment', () => {
    // Segment (0, 0) -> (10, 0).
    expect(distanceToSegment(5, 3, 0, 0, 10, 0)).toBeCloseTo(3, 9);
    // Beyond the tip: the distance is to the tip itself, 5 units away.
    expect(distanceToSegment(15, 0, 0, 0, 10, 0)).toBeCloseTo(5, 9);
    // Behind the root, a 3-4-5 triangle.
    expect(distanceToSegment(-3, 4, 0, 0, 10, 0)).toBeCloseTo(5, 9);
    // A zero-length bone is just its origin.
    expect(distanceToSegment(0, 7, 0, 0, 0, 0)).toBeCloseTo(7, 9);
  });
});

describe('picking on a skeleton', () => {
  let doc: TestDoc;

  beforeEach(() => { doc = new TestDoc(testFile()); });

  it('finds the bone under the pointer', () => {
    // "torso" starts at (0, 90) and points up for 70 units: it covers (0, 120).
    const hit = pickAt(doc.skeleton, 0, 120, 1);
    expect(hit?.kind).toBe('bone');
    expect(hit?.bone).toBe('torso');
  });

  it('finds nothing far away from everything', () => {
    expect(pickAt(doc.skeleton, 5000, 5000, 1)).toBeNull();
  });

  it('prefers a bounding box over the bone that carries it', () => {
    // The box is 20x20 around the bone "caixa_osso" at (200, 0).
    const hits = pickAll(doc.skeleton, 200, 0, 1);
    expect(hits[0].kind).toBe('boundingbox');
    expect(hits[0].slot).toBe('caixa');
    expect(hits.some((hit) => hit.kind === 'bone' && hit.bone === 'caixa_osso')).toBe(true);
  });

  it('the radius of a bone shrinks as the zoom grows', () => {
    // 10 units away from the bone "torso" (which runs up the line x = 0).
    // At 1 pixel per unit the radius is 9 units, so 10 units misses.
    expect(pickAt(doc.skeleton, 10, 120, 1)).toBeNull();
    // At 0.5 pixels per unit the same 9 pixels cover 18 units, so it hits.
    expect(pickAt(doc.skeleton, 10, 120, 0.5)?.bone).toBe('torso');
  });

  it('Alt cycles through what is stacked under the pointer', () => {
    const hits = pickAll(doc.skeleton, 200, 0, 1);
    expect(hits.length).toBeGreaterThan(1);
    expect(pickAt(doc.skeleton, 200, 0, 1, 0)).toEqual(hits[0]);
    expect(pickAt(doc.skeleton, 200, 0, 1, 1)).toEqual(hits[1]);
    // Cycling past the end starts over.
    expect(pickAt(doc.skeleton, 200, 0, 1, hits.length)).toEqual(hits[0]);
  });
});

describe('picking turns into a selection', () => {
  it('a plain click replaces the selection', () => {
    const current: Selection = { ...emptySelection(), bones: ['hips'] };
    const next = selectionFor(current, { kind: 'bone', bone: 'torso', slot: null, attachment: null }, false);
    expect(next.bones).toEqual(['torso']);
  });

  it('Shift adds and removes', () => {
    const hit = { kind: 'bone' as const, bone: 'torso', slot: null, attachment: null };
    const added = selectionFor({ ...emptySelection(), bones: ['hips'] }, hit, true);
    expect(added.bones).toEqual(['hips', 'torso']);
    const removed = selectionFor(added, hit, true);
    expect(removed.bones).toEqual(['hips']);
  });

  it('a click on nothing clears the selection', () => {
    const next = selectionFor({ ...emptySelection(), bones: ['hips'] }, null, false);
    expect(next.bones).toEqual([]);
  });

  // Rodada 8d (04/10/2026), reescrito de propósito: era "selects its slot and
  // its bone as well". Agora o clique na imagem escolhe SÓ a imagem, como no
  // Spriter; o osso vem junto apenas para a imagem que não anda sozinha.
  it('clicking an attachment selects its slot and the image, and NOT its bone (rodada 8d)', () => {
    const hit = { kind: 'attachment', bone: 'caixa_osso', slot: 'caixa', attachment: 'caixa' } as const;
    const next = selectionFor(emptySelection(), hit, false);
    expect(next.bones).toEqual([]);
    expect(next.slots).toEqual(['caixa']);
    expect(next.attachments).toEqual([{ slot: 'caixa', attachment: 'caixa' }]);
    // A que não anda sozinha (uma malha, uma caixa) ainda leva o osso.
    expect(selectionFor(emptySelection(), hit, false, null, () => true).bones).toEqual(['caixa_osso']);
  });
});

// ---------------------------------------------------------------------------
// Tools
// ---------------------------------------------------------------------------

describe('tool "Mover"', () => {
  let doc: TestDoc;

  beforeEach(() => {
    doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
  });

  it('a 10 pixel drag at zoom 2 moves the bone by 5 units', () => {
    // The viewport hands the tool world coordinates. A camera at zoom 2 turns
    // 10 screen pixels into 10 / 2 = 5 world units.
    const camera = new Camera();
    camera.setViewSize(800, 600);
    camera.setZoom(2);
    const start = camera.screenToWorld(400, 300);   // the centre: world (0, 0)
    const end = camera.screenToWorld(410, 300);     // 10 pixels to the right
    expect(end.x - start.x).toBeCloseTo(5, 9);

    translateTool.onDown?.(doc, event(start.x, start.y, camera.zoom));
    translateTool.onMove?.(doc, event(end.x, end.y, camera.zoom));
    translateTool.onUp?.(doc, event(end.x, end.y, camera.zoom));

    // "hips" started at (0, 90) under a parent with no rotation or scale.
    expect(readBone(doc, 'hips', 'x')).toBeCloseTo(5, 9);
    expect(readBone(doc, 'hips', 'y')).toBeCloseTo(90, 9);
  });

  it('writes into the file, the setup data and the live bone at once', () => {
    translateTool.onDown?.(doc, event(0, 0));
    translateTool.onMove?.(doc, event(12, -7));
    translateTool.onUp?.(doc, event(12, -7));
    expect(doc.file.bones[1].x).toBeCloseTo(12, 9);
    expect(doc.data?.findBone('hips')?.x).toBeCloseTo(12, 9);
    // (0, 90) moved by (12, -7) puts the bone's world origin at (12, 83).
    expect(doc.skeleton?.findBone('hips')?.worldX).toBeCloseTo(12, 6);
    expect(doc.skeleton?.findBone('hips')?.worldY).toBeCloseTo(83, 6);
  });

  it('a movement in world space is written in the parent axes', () => {
    // "torso" hangs from "hips", which has no rotation, so its parent frame is
    // the identity: dragging right by 20 adds 20 to the LOCAL x.
    doc.select({ ...emptySelection(), bones: ['torso'] });
    translateTool.onDown?.(doc, event(0, 90));
    translateTool.onMove?.(doc, event(20, 90));
    translateTool.onUp?.(doc, event(20, 90));
    expect(readBone(doc, 'torso', 'x')).toBeCloseTo(20, 9);

    // "filho" hangs from "espelho", which mirrors X: dragging right by 20 has
    // to become -20 in the local pose for the bone to follow the pointer.
    doc.select({ ...emptySelection(), bones: ['filho'] });
    translateTool.onDown?.(doc, event(0, 0));
    translateTool.onMove?.(doc, event(20, 0));
    translateTool.onUp?.(doc, event(20, 0));
    expect(readBone(doc, 'filho', 'x')).toBeCloseTo(-20, 9);
    expect(doc.skeleton?.findBone('filho')?.worldX).toBeCloseTo(20, 6);
  });

  it('the whole drag is a single undo entry', () => {
    const before = doc.undoCount;
    translateTool.onDown?.(doc, event(0, 0));
    translateTool.onMove?.(doc, event(3, 0));
    translateTool.onMove?.(doc, event(6, 0));
    translateTool.onMove?.(doc, event(9, 0));
    translateTool.onUp?.(doc, event(9, 0));
    expect(doc.undoCount).toBe(before + 1);
    expect(readBone(doc, 'hips', 'x')).toBeCloseTo(9, 9);
    doc.undo();
    // Undo goes back to the value before the FIRST step, not the previous one.
    expect(readBone(doc, 'hips', 'x')).toBeCloseTo(0, 9);
    expect(readBone(doc, 'hips', 'y')).toBeCloseTo(90, 9);
  });

  it('two separate drags stay two undo entries', () => {
    translateTool.onDown?.(doc, event(0, 0));
    translateTool.onMove?.(doc, event(4, 0));
    translateTool.onUp?.(doc, event(4, 0));
    const middle = doc.undoCount;
    translateTool.onDown?.(doc, event(4, 0));
    translateTool.onMove?.(doc, event(4, 6));
    translateTool.onUp?.(doc, event(4, 6));
    expect(doc.undoCount).toBe(middle + 1);
    doc.undo();
    expect(readBone(doc, 'hips', 'x')).toBeCloseTo(4, 9);
    expect(readBone(doc, 'hips', 'y')).toBeCloseTo(90, 9);
  });

  it('Shift locks the drag to one world axis', () => {
    expect(lockAxis(10, 3, true, 'none')).toEqual({ dx: 10, dy: 0, axis: 'x' });
    expect(lockAxis(3, 10, true, 'none')).toEqual({ dx: 0, dy: 10, axis: 'y' });
    // Once an axis is chosen it stays chosen for the rest of the drag.
    expect(lockAxis(2, 40, true, 'x')).toEqual({ dx: 2, dy: 0, axis: 'x' });
    expect(lockAxis(2, 40, false, 'x')).toEqual({ dx: 2, dy: 40, axis: 'none' });
  });

  it('does nothing with an empty selection', () => {
    doc.select(emptySelection());
    const before = doc.undoCount;
    translateTool.onDown?.(doc, event(0, 0));
    translateTool.onMove?.(doc, event(50, 50));
    translateTool.onUp?.(doc, event(50, 50));
    expect(doc.undoCount).toBe(before);
  });
});

describe('tool "Girar"', () => {
  let doc: TestDoc;

  beforeEach(() => { doc = new TestDoc(testFile()); });

  it('turns around the pivot the parent gives the bone', () => {
    // "torso" sits at the world origin of "hips", which is (0, 90).
    doc.select({ ...emptySelection(), bones: ['torso'] });
    // Pointer starts to the right of the pivot: world angle 0 degrees.
    rotateTool.onDown?.(doc, event(100, 90));
    // Pointer moves straight above the pivot: world angle 90 degrees.
    rotateTool.onMove?.(doc, event(0, 190));
    rotateTool.onUp?.(doc, event(0, 190));
    // The bone started at 90 degrees, so 90 + 90 = 180.
    expect(readBone(doc, 'torso', 'rotation')).toBeCloseTo(180, 6);
  });

  it('a mirroring parent reverses the local value', () => {
    // "espelho" has scaleX -1, so its determinant is negative: turning the
    // pointer 90 degrees counter-clockwise means -90 in the child's own pose.
    doc.select({ ...emptySelection(), bones: ['filho'] });
    rotateTool.onDown?.(doc, event(100, 0));
    rotateTool.onMove?.(doc, event(0, 100));
    rotateTool.onUp?.(doc, event(0, 100));
    expect(readBone(doc, 'filho', 'rotation')).toBeCloseTo(-90, 6);

    // And the bone really did follow the pointer. The mirror makes it point
    // LEFT at rest (world angle 180), so a quarter turn counter-clockwise,
    // the way the pointer went, leaves it pointing DOWN (180 + 90 = 270).
    // Tip = origin + X axis * length, with length 20.
    const bone = doc.skeleton?.findBone('filho');
    expect(bone).not.toBeNull();
    expect((bone?.worldX ?? 0) + (bone?.a ?? 0) * 20).toBeCloseTo(0, 6);
    expect((bone?.worldY ?? 0) + (bone?.c ?? 0) * 20).toBeCloseTo(-20, 6);
  });

  it('the pivot is the bone origin, not the world origin', () => {
    // Turning around (0, 0) instead of (0, 90) would give a different angle,
    // so this checks the pivot directly: the pointer starts exactly ABOVE the
    // pivot (angle 90) and ends to its right (angle 0), a turn of -90.
    doc.select({ ...emptySelection(), bones: ['torso'] });
    rotateTool.onDown?.(doc, event(0, 190));
    rotateTool.onMove?.(doc, event(100, 90));
    rotateTool.onUp?.(doc, event(100, 90));
    expect(readBone(doc, 'torso', 'rotation')).toBeCloseTo(0, 6);
  });

  it('Shift snaps to steps of 15 degrees', () => {
    expect(snapAngle(37, true)).toBe(30);
    expect(snapAngle(38, true)).toBe(45);
    expect(snapAngle(37, false)).toBe(37);
  });

  it('the whole turn is a single undo entry', () => {
    doc.select({ ...emptySelection(), bones: ['torso'] });
    const before = doc.undoCount;
    rotateTool.onDown?.(doc, event(100, 90));
    rotateTool.onMove?.(doc, event(100, 190));
    rotateTool.onMove?.(doc, event(0, 190));
    rotateTool.onUp?.(doc, event(0, 190));
    expect(doc.undoCount).toBe(before + 1);
    doc.undo();
    expect(readBone(doc, 'torso', 'rotation')).toBeCloseTo(90, 9);
  });
});

describe('tool "Escalar"', () => {
  let doc: TestDoc;

  beforeEach(() => {
    doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
  });

  it('the distance to the pivot decides the factor', () => {
    // "hips" sits at (0, 90) with no rotation and scale 1. The pointer starts
    // 100 units along its X axis and ends 150 units along it: 150/100 = 1.5.
    scaleTool.onDown?.(doc, event(100, 90));
    scaleTool.onMove?.(doc, event(150, 90));
    scaleTool.onUp?.(doc, event(150, 90));
    expect(readBone(doc, 'hips', 'scaleX')).toBeCloseTo(1.5, 6);
    // The pointer never left the X axis, so Y is untouched.
    expect(readBone(doc, 'hips', 'scaleY')).toBeCloseTo(1, 6);
  });

  it('Shift keeps the proportions', () => {
    // Start 100 units from the pivot, end 50 units from it: both axes halve.
    scaleTool.onDown?.(doc, event(100, 90, 1, { shift: true }));
    scaleTool.onMove?.(doc, event(0, 140, 1, { shift: true }));
    scaleTool.onUp?.(doc, event(0, 140, 1, { shift: true }));
    expect(readBone(doc, 'hips', 'scaleX')).toBeCloseTo(0.5, 6);
    expect(readBone(doc, 'hips', 'scaleY')).toBeCloseTo(0.5, 6);
  });

  it('reads the pointer in the bone axes, not the world axes', () => {
    // "torso" is turned 90 degrees, so its own X axis points UP in the world.
    // Moving the pointer up must therefore change scaleX, never scaleY.
    doc.select({ ...emptySelection(), bones: ['torso'] });
    scaleTool.onDown?.(doc, event(0, 190));   // 100 units above the pivot (0, 90)
    scaleTool.onMove?.(doc, event(0, 290));   // 200 units above it: factor 2
    scaleTool.onUp?.(doc, event(0, 290));
    expect(readBone(doc, 'torso', 'scaleX')).toBeCloseTo(2, 6);
    expect(readBone(doc, 'torso', 'scaleY')).toBeCloseTo(1, 6);
  });

  it('the whole drag is a single undo entry', () => {
    const before = doc.undoCount;
    scaleTool.onDown?.(doc, event(100, 90));
    scaleTool.onMove?.(doc, event(120, 90));
    scaleTool.onMove?.(doc, event(150, 90));
    scaleTool.onUp?.(doc, event(150, 90));
    expect(doc.undoCount).toBe(before + 1);
    doc.undo();
    expect(readBone(doc, 'hips', 'scaleX')).toBeCloseTo(1, 9);
  });
});

describe('tool "Criar osso"', () => {
  let doc: TestDoc;

  beforeEach(() => { doc = new TestDoc(testFile()); });

  it('the drag gives the position, the angle and the length', () => {
    doc.select({ ...emptySelection(), bones: ['hips'] });
    const count = doc.file.bones.length;
    // Start on the origin of "hips", which is (0, 90) in the world.
    createBoneTool.onDown?.(doc, event(0, 90));
    createBoneTool.onMove?.(doc, event(0, 130));
    // Drag 40 units straight up: in the parent axes that is (0, 40).
    createBoneTool.onUp?.(doc, event(0, 130));

    expect(doc.file.bones.length).toBe(count + 1);
    const created = doc.file.bones[doc.file.bones.length - 1];
    expect(created.parent).toBe('hips');
    expect(created.x).toBeCloseTo(0, 6);
    expect(created.y).toBeCloseTo(0, 6);
    expect(created.length).toBeCloseTo(40, 6);
    expect(created.rotation).toBeCloseTo(90, 6);
    expect(doc.selection.bones).toEqual([created.name]);
  });

  it('undo takes the bone back out of the file', () => {
    doc.select({ ...emptySelection(), bones: ['hips'] });
    const count = doc.file.bones.length;
    createBoneTool.onDown?.(doc, event(0, 90));
    createBoneTool.onUp?.(doc, event(30, 90));
    expect(doc.file.bones.length).toBe(count + 1);
    doc.undo();
    expect(doc.file.bones.length).toBe(count);
    expect(doc.skeleton?.findBone('osso')).toBeNull();
  });

  it('a mirroring parent gets the angle it deserves', () => {
    // Under "espelho" (scaleX -1) a drag to the right is -X in the local axes,
    // so the angle written is 180 degrees, and the bone still points right.
    doc.select({ ...emptySelection(), bones: ['espelho'] });
    const def = describeBone(doc.skeleton as Skeleton, 'espelho', [], 0, 0, 50, 0, 1);
    expect(def.length).toBeCloseTo(50, 6);
    expect(Math.abs(def.rotation ?? 0)).toBeCloseTo(180, 6);
  });

  it('a click with no drag creates a bone without a length', () => {
    doc.select({ ...emptySelection(), bones: ['hips'] });
    createBoneTool.onDown?.(doc, event(0, 90, 1));
    createBoneTool.onUp?.(doc, event(0.5, 90, 1));
    const created = doc.file.bones[doc.file.bones.length - 1];
    expect(created.length).toBeUndefined();
    expect(created.rotation).toBeUndefined();
  });

  it('gives every new bone a name of its own', () => {
    doc.select({ ...emptySelection(), bones: ['hips'] });
    createBoneTool.onDown?.(doc, event(0, 90));
    createBoneTool.onUp?.(doc, event(0, 130));
    createBoneTool.onDown?.(doc, event(0, 130));
    createBoneTool.onUp?.(doc, event(0, 170));
    const names = doc.file.bones.map((bone) => bone.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toContain('osso');
    expect(names).toContain('osso2');
  });
});

describe('SetProperty', () => {
  it('only merges drags that belong together', () => {
    const doc = new TestDoc(testFile());
    const first = new SetProperty('Mover osso', [{ bone: 'hips', key: 'x', before: 0, after: 5 }], 'a');
    const second = new SetProperty('Mover osso', [{ bone: 'hips', key: 'x', before: 5, after: 9 }], 'a');
    const other = new SetProperty('Mover osso', [{ bone: 'hips', key: 'x', before: 9, after: 12 }], 'b');
    expect(second.mergeWith(first)).toBe(true);
    // The merged command undoes all the way back to the start of the drag.
    expect(second.changes[0].before).toBe(0);
    expect(other.mergeWith(second)).toBe(false);
    doc.run(second);
    expect(readBone(doc, 'hips', 'x')).toBe(9);
    doc.undo();
    expect(readBone(doc, 'hips', 'x')).toBe(0);
  });

  it('revert puts the bone back exactly where it was', () => {
    const doc = new TestDoc(testFile());
    const command = new SetProperty('Girar osso', [
      { bone: 'torso', key: 'rotation', before: 90, after: 45 },
    ], 'r');
    doc.run(command);
    expect(doc.skeleton?.findBone('torso')?.rotation).toBeCloseTo(45, 9);
    doc.undo();
    expect(doc.skeleton?.findBone('torso')?.rotation).toBeCloseTo(90, 9);
    expect(doc.file.bones[2].rotation).toBe(90);
  });
});

// ---------------------------------------------------------------------------
// O recado do gesto — rodada final, chat F, defeito F1 (29/09/2026)
// ---------------------------------------------------------------------------

describe('o recado do gesto chega ao rodapé (F1)', () => {
  /**
   * O rodapé mostra o nome da ÚLTIMA mudança do documento (`ui/shell.ts`,
   * `refreshStatus`): sem nome, ele diz só "Arquivo não salvo.". Este ouvinte
   * faz a mesma conta, sem DOM.
   */
  function rodape(doc: Doc): () => string | undefined {
    let ultimo: string | undefined;
    doc.on((change) => { ultimo = change.label; });
    return () => ultimo;
  }

  it('o defeito, pela forma: um recado dito com a mão embaixo é apagado pelo repose do quadro seguinte', () => {
    const doc = new Doc(testFile());
    const visto = rodape(doc);
    doc.notice('Segure Alt e arraste para desenhar a caixa');
    // A cena, com o botão apertado, remonta a pose a cada quadro.
    doc.repose();
    expect(visto()).toBeUndefined();
  });

  it('com o GestureNotice, o recado volta ao soltar, depois do último repose', () => {
    const doc = new Doc(testFile());
    const visto = rodape(doc);
    const gesto = new GestureNotice();
    doc.on((change) => gesto.hear(change));
    gesto.press();
    doc.notice('Segure Alt e arraste para desenhar a caixa');
    doc.repose();
    doc.repose();
    const dizer = gesto.release();
    expect(dizer).toBe('Segure Alt e arraste para desenhar a caixa');
    doc.notice(dizer!);
    expect(visto()).toBe('Segure Alt e arraste para desenhar a caixa');
  });

  it('o comando do arrasto também volta: "Girar osso"', () => {
    const doc = new Doc(testFile());
    const gesto = new GestureNotice();
    doc.on((change) => gesto.hear(change));
    gesto.press();
    doc.run(new SetProperty('Girar osso', [{ bone: 'torso', key: 'rotation', before: 90, after: 45 }], 'r'));
    doc.repose();
    expect(gesto.release()).toBe('Girar osso');
  });

  it('um clique que não disse nada não inventa recado; e fora do gesto nada é guardado', () => {
    const doc = new Doc(testFile());
    const gesto = new GestureNotice();
    doc.on((change) => gesto.hear(change));
    doc.notice('dito antes de apertar');
    gesto.press();
    doc.repose();
    expect(gesto.release()).toBeNull();
    // Depois de soltar, o recado repetido não entra num gesto que acabou.
    doc.notice('dito depois de soltar');
    expect(gesto.release()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// O osso que uma regra segura — rodada final, chat F, F3, L10 e L11 (29/09/2026)
// ---------------------------------------------------------------------------

describe('a regra que segura o osso avisa (F3, L10, L11)', () => {
  const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
  const heroi = (): Doc => new Doc(JSON.parse(HEROI) as BoneFile);
  const numeros = (doc: Doc, nome: string): BoneNumbers =>
    doc.skeleton!.findBone(nome)! as unknown as BoneNumbers;

  it('o defeito, medido: girar a cabeça na base grava no arquivo e a pose não gira', () => {
    const doc = heroi();
    doc.run(setProperties(doc, 'Girar osso', 'f3', [{ bone: 'head', key: 'rotation', value: -53.8 }]));
    doc.repose();
    expect(doc.file.bones.find((b) => b.name === 'head')!.rotation).toBe(-53.8);
    // O que a pose aplicou está longe do pedido: alguma regra mexeu.
    expect(drifted(numeros(doc, 'head'), 'rotation')).toBe(true);
  });

  it('as suspeitas são as regras que citam o osso: a cabeça tem duas, o braço tem o IK', () => {
    const file = JSON.parse(HEROI) as BoneFile;
    expect(rulesOn(file, 'head').sort()).toEqual(['head_lean', 'look_driver']);
    expect(rulesOn(file, 'forearm')).toEqual(['ik_arm']);
    // O alvo do IK puxa; ele não é segurado.
    expect(rulesOn(file, 'hand_target')).toEqual([]);
    expect(rulesOn(file, 'shin')).toEqual([]);
  });

  it('osso livre não avisa: a canela gira e a pose acompanha', () => {
    const doc = heroi();
    doc.run(setProperties(doc, 'Girar osso', 'f3b', [{ bone: 'shin', key: 'rotation', value: 39.5 }]));
    doc.repose();
    expect(drifted(numeros(doc, 'shin'), 'rotation')).toBe(false);
  });

  it('o recado nomeia a regra, diz o que fazer e, na base, que vale em todas as animações (L11)', () => {
    expect(heldNotice('forearm', ['ik_arm'], 'rotation', true)).toBe(
      'forearm não girou: a regra ik_arm manda nele. Desligue o olho dela na aba Regras. Ficou na base: Ctrl+Z desfaz',
    );
    expect(heldNotice('head', ['head_lean', 'look_driver'], 'rotation', false)).toBe(
      'head não girou: as regras head_lean, look_driver mandam nele. Desligue o olho delas na aba Regras',
    );
  });

  it('o gesto é lido pelo nome do desfazer: girar, mover, andar, escalar, inclinar', () => {
    expect(gripOfLabel('Girar osso')).toBe('rotation');
    expect(gripOfLabel('Mover osso')).toBe('position');
    expect(gripOfLabel('Andar com o osso')).toBe('position');
    expect(gripOfLabel('Escalar osso')).toBe('scale');
    expect(gripOfLabel('Inclinar osso')).toBe('shear');
    expect(gripOfLabel('Nova caixa de colisão')).toBeNull();
    expect(gripOfLabel('Mover ponto')).toBeNull();
  });

  it('359° e 1° estão a 2°: a volta inteira não é deriva', () => {
    const base = { x: 0, y: 0, rotation: 359, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0,
      ax: 0, ay: 0, arotation: -1, ascaleX: 1, ascaleY: 1, ashearX: 0, ashearY: 0 };
    expect(drifted(base, 'rotation')).toBe(false);
  });
});

describe('o gesto sabe o nome do comando, além do recado (F3)', () => {
  it('o recado pode ser "Girar 44,1°"; o comando continua sendo "Girar osso"', () => {
    const doc = new Doc(testFile());
    const gesto = new GestureNotice();
    doc.on((change) => gesto.hear(change));
    gesto.press();
    doc.run(new SetProperty('Girar osso', [{ bone: 'torso', key: 'rotation', before: 90, after: 45 }], 'g'));
    doc.notice('Girar 44,1°');
    expect(gesto.release()).toBe('Girar 44,1°');
    expect(gesto.lastCommand()).toBe('Girar osso');
    expect(gripOfLabel(gesto.lastCommand()!)).toBe('rotation');
  });

  it('um gesto só de recado não tem comando', () => {
    const doc = new Doc(testFile());
    const gesto = new GestureNotice();
    doc.on((change) => gesto.hear(change));
    gesto.press();
    doc.notice('Segure Alt e arraste para desenhar a caixa');
    gesto.release();
    expect(gesto.lastCommand()).toBeNull();
  });
});
