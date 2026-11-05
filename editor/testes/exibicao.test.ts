/**
 * Onion skin, the "Posar" tool, the handles and the "Exibição" panel (owner D).
 *
 * No DOM: every number below is worked out by hand in the comment above the
 * assertion, and the two-bone solver of the tool is checked against the
 * `IkConstraint` of the runtime — not against numbers someone typed, but
 * against the code a game will actually run. When those two disagree, the
 * editor is lying about the pose it shows, which is the worst bug this file
 * can catch.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { resetViewGroups, telaBaixa, toggleViewGroup, viewGroupFolded, viewGroupHint } from '../src/panels/view-panel-actions.js';

import {
  applyAnimation,
  loadAnimationsFor,
  loadSkeletonData,
  normalizeAngle,
  Skeleton,
  type AnimationDef,
  type AtlasData,
  type AtlasPageData,
  type BoneFile,
  type SkeletonData,
} from '../../runtime/src/index.js';
import {
  emptySelection,
  readEditorState,
  type Command,
  type EditorDoc,
  type Selection,
  type ToolEvent,
} from '../src/contract.js';
import {
  DEFAULT_ONION,
  DEFAULT_VIEW,
  animationKeyTimes,
  combinedSkins,
  editableSkin,
  ghostAlpha,
  ghostColor,
  ghostTimes,
  parseViewSettings,
  readViewState,
  resetViewSettings,
  setEditableSkin,
  setViewSettings,
  skinChoices,
  toggleSkin,
  viewSettings,
  writeViewState,
  type OnionSettings,
} from '../src/viewport/onion.js';
import {
  BEND_PIXELS,
  FORCE_SCALE,
  beginHandleDrag,
  collectHandles,
  handleAt,
  moveHandleDrag,
  pathPositionFromDrag,
  readConstraint,
  resolveHandles,
  sideOfLine,
} from '../src/viewport/handles.js';
import {
  bendOf,
  chainFor,
  poseChain,
  poseTool,
  solveOneBone,
  solveTwoBone,
} from '../src/viewport/tools/pose-tool.js';
import { SHOW_ROWS, ONION_ROWS } from '../src/panels/view-panel.js';
// Lote 3 do chat I (29/09/2026): ver e travar desde o arranque (I3), a recusa
// sem escolha (I2) e a conta de peças (I1).
import {
  NOTHING_PICKED, NO_GUIDES, hiddenNotice, lockedNotice, pickedCount, registerViewActions,
} from '../src/panels/view-panel-actions.js';
import { hasAction, runAction } from '../src/ui/actions.js';
import { actionRow } from '../src/ui/actions-table.js';
import { VIEW_ACTIONS } from '../src/ui/menus.js';
import { soloSelected } from '../src/viewport/onion.js';

// ---------------------------------------------------------------------------
// A document to test against
// ---------------------------------------------------------------------------

/**
 * The skeleton every test below uses.
 *
 *   root                       origin, identity
 *   +-- coxa                   at (0, 200), 100 long        \ the IK chain
 *   |   +-- canela             at (100, 0), 100 long        /
 *   +-- alvo                   at (0, 400): the IK target, exactly in reach
 *   +-- alvoT                  at (-30, 10): the transform target
 *   +-- seguidor               at (40, 40): what the transform constraint moves
 *   +-- trilhoOsso             at (-200, 0), 60 long: the path chain
 *   +-- pendulo                at (150, -80): the physics bone
 *
 * The IK target sits exactly `100 + 100` from the shoulder, so the leg goes
 * straight up and every world position in the handle tests is a whole number.
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'coxa', parent: 'root', x: 0, y: 200, length: 100 },
      { name: 'canela', parent: 'coxa', x: 100, y: 0, length: 100 },
      { name: 'alvo', parent: 'root', x: 0, y: 400 },
      { name: 'alvoT', parent: 'root', x: -30, y: 10 },
      { name: 'seguidor', parent: 'root', x: 40, y: 40, length: 20 },
      { name: 'trilhoOsso', parent: 'root', x: -200, y: 0, length: 60 },
      { name: 'pendulo', parent: 'root', x: 150, y: -80, length: 30 },
    ],
    slots: [{ name: 'trilho', bone: 'root' }],
    skins: [
      { name: 'default', attachments: {} },
      { name: 'roupa-azul', attachments: {} },
      { name: 'chapeu', attachments: {} },
    ],
    constraints: [
      { name: 'perna', type: 'ik', bones: ['coxa', 'canela'], target: 'alvo' },
      { name: 'copia', type: 'transform', bones: ['seguidor'], target: 'alvoT' },
      { name: 'caminho', type: 'path', bones: ['trilhoOsso'], target: 'trilho', position: 0.25 },
      { name: 'balanco', type: 'physics', bone: 'pendulo', wind: 40, gravity: 20 },
    ],
    animations: [{
      name: 'andar',
      duration: 1,
      timelines: [
        {
          type: 'bone',
          target: 'coxa',
          property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.25, value: 30 }, { time: 0.75, value: -30 }],
        },
        {
          type: 'bone',
          target: 'canela',
          property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.5, value: 40 }, { time: 1, value: 0 }],
        },
      ],
    }],
  } as unknown as BoneFile;
}

/** A leg with no constraint at all, for testing what the tool writes. */
function legFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'coxa', parent: 'root', x: 0, y: 200, length: 100 },
      { name: 'canela', parent: 'coxa', x: 100, y: 0, length: 100 },
      { name: 'pe', parent: 'canela', x: 100, y: 0, length: 30 },
    ],
    slots: [],
    skins: [{ name: 'default', attachments: {} }],
  } as unknown as BoneFile;
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
  /** The same field `Doc` keeps; `onion.ts` reads it through a cast. */
  visibleSkins: string[] = [];

  private skeletonData: SkeletonData | null = null;
  private instance: Skeleton | null = null;
  private done: Command[] = [];

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
    this.dirty = true;
    if (command.animationOnly !== undefined) this.rebuildAnimations();
    else if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }

  undo(): void {
    const command = this.done.pop();
    if (command === undefined) return;
    command.revert(this);
    if (command.animationOnly !== undefined) this.rebuildAnimations();
    else if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }

  redo(): void { /* not needed here */ }

  get canUndo(): boolean { return this.done.length > 0; }
  get canRedo(): boolean { return false; }
  get undoLabel(): string | null { return this.done[this.done.length - 1]?.label ?? null; }
  get redoLabel(): string | null { return null; }
  /** Undo entries, so a test can check that a whole drag merged into one. */
  get undoCount(): number { return this.done.length; }

  rebuild(): void {
    this.skeletonData = loadSkeletonData(this.file);
    this.instance = new Skeleton(this.skeletonData);
    this.repose();
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

  /** The real thing: setup pose, then the animation, then the world pass. */
  repose(): void {
    const skeleton = this.instance;
    if (skeleton === null) return;
    skeleton.setToSetupPose();
    const animation = this.animation === null
      ? null
      : this.skeletonData?.findAnimation(this.animation) ?? null;
    if (animation !== null) applyAnimation(skeleton, animation, this.time);
    skeleton.updateWorldTransform(this.time);
  }

  on(): () => void { return () => {}; }
}

/** A pointer event already in world coordinates, as the viewport builds it. */
function event(x: number, y: number, scale = 1, extra: Partial<ToolEvent> = {}): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale, ...extra };
}

/** The onion settings of a test, on top of the defaults. */
function onion(patch: Partial<OnionSettings> = {}): OnionSettings {
  return { ...DEFAULT_ONION, enabled: true, ...patch };
}

// ---------------------------------------------------------------------------
// Onion skin: which times the ghosts sit at
// ---------------------------------------------------------------------------

describe('casca de cebola: os tempos dos fantasmas', () => {
  it('draws nothing while it is off', () => {
    expect(ghostTimes({ ...DEFAULT_ONION, enabled: false }, 0.5, 1)).toEqual([]);
  });

  it('puts the ghosts one step apart, on both sides', () => {
    // time 0.5, step 0.1, two before and two after:
    //   before -> 0.4 and 0.3      after -> 0.6 and 0.7
    const ghosts = ghostTimes(onion({ before: 2, after: 2, step: 0.1 }), 0.5, 1);
    expect(ghosts.map((g) => g.time)).toEqual([0.4, 0.3, 0.6, 0.7]);
    expect(ghosts.map((g) => g.direction)).toEqual([-1, -1, 1, 1]);
    expect(ghosts.map((g) => g.order)).toEqual([1, 2, 1, 2]);
  });

  it('rounds the times instead of trailing 0.30000000000000004', () => {
    const ghosts = ghostTimes(onion({ before: 2, after: 0, step: 0.1 }), 0.5, 1);
    expect(ghosts[1].time).toBe(0.3);
  });

  it('drops a ghost before zero and a ghost past the end', () => {
    // time 0.15, step 0.1: 0.05 is inside, -0.05 and -0.15 are not.
    const back = ghostTimes(onion({ before: 3, after: 0, step: 0.1 }), 0.15, 1);
    expect(back.map((g) => g.time)).toEqual([0.05]);
    // time 0.95, duration 1: 1.05 and 1.15 are both past the end.
    const forward = ghostTimes(onion({ before: 0, after: 2, step: 0.1 }), 0.95, 1);
    expect(forward).toEqual([]);
  });

  it('"só nas chaves" uses the nearest key times, however uneven they are', () => {
    const keys = [0, 0.25, 0.5, 0.75, 1];
    const ghosts = ghostTimes(onion({ before: 2, after: 2, onlyKeys: true }), 0.5, 1, keys);
    // Backwards from 0.5: 0.25 then 0; forwards: 0.75 then 1. The key AT 0.5
    // is not a ghost, because that is the pose being edited.
    expect(ghosts.map((g) => g.time)).toEqual([0.25, 0, 0.75, 1]);
  });

  it('"só nas chaves" ignores a step that would not fit the keys', () => {
    const keys = [0, 0.9];
    const ghosts = ghostTimes(onion({ before: 1, after: 1, onlyKeys: true, step: 0.1 }), 0.5, 1, keys);
    expect(ghosts.map((g) => g.time)).toEqual([0, 0.9]);
  });

  it('reads the key times of the animation, sorted and without repeats', () => {
    const animation = testFile().animations?.[0] as AnimationDef;
    // coxa keys at 0, 0.25, 0.75; canela keys at 0, 0.5, 1. The two zeros are one time.
    expect(animationKeyTimes(animation)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(animationKeyTimes(null)).toEqual([]);
  });

  it('fades the far ghosts and keeps the near one at full opacity', () => {
    // opacity 0.5, two ghosts a side: (2-1+1)/2 = 1 and (2-2+1)/2 = 0.5.
    expect(ghostAlpha(0.5, 1, 2)).toBeCloseTo(0.5, 12);
    expect(ghostAlpha(0.5, 2, 2)).toBeCloseTo(0.25, 12);
    expect(ghostAlpha(0.5, 0, 0)).toBe(0);
  });

  it('gives the past one colour and the future another', () => {
    const settings = onion({ before: 1, after: 1, step: 0.1 });
    const ghosts = ghostTimes(settings, 0.5, 1);
    expect(ghostColor(settings, ghosts[0])).toBe(settings.colorBefore);
    expect(ghostColor(settings, ghosts[1])).toBe(settings.colorAfter);
    expect(settings.colorBefore).not.toBe(settings.colorAfter);
  });

  it('pushes each ghost sideways by its order, so two passes can be compared', () => {
    // offsetX 20: the first ghost back is at -20, the second at -40, and the
    // ghosts ahead go the other way.
    const ghosts = ghostTimes(onion({ before: 2, after: 2, step: 0.1, offsetX: 20, offsetY: 5 }), 0.5, 1);
    expect(ghosts.map((g) => g.offsetX)).toEqual([-20, -40, 20, 40]);
    expect(ghosts.map((g) => g.offsetY)).toEqual([-5, -10, 5, 10]);
  });
});

// ---------------------------------------------------------------------------
// The two-bone solver against the runtime
// ---------------------------------------------------------------------------

/** The leg posed by the runtime's own IK, with the target at `(tx, ty)`. */
function runtimeIk(tx: number, ty: number, bendPositive: boolean): {
  coxa: number; canela: number;
} {
  const file = testFile();
  const ik = (file.constraints ?? [])[0] as { bendPositive?: boolean };
  ik.bendPositive = bendPositive;
  const doc = new TestDoc(file);
  const skeleton = doc.skeleton as Skeleton;
  const alvo = skeleton.findBone('alvo');
  if (alvo === null) throw new Error('a test skeleton without "alvo"');
  alvo.x = tx;
  alvo.y = ty;
  skeleton.updateWorldTransform(0);
  return {
    coxa: normalizeAngle((skeleton.findBone('coxa') as { arotation: number }).arotation),
    canela: normalizeAngle((skeleton.findBone('canela') as { arotation: number }).arotation),
  };
}

describe('ferramenta Posar: o solver bate com a IkConstraint do runtime', () => {
  // The shoulder sits at (0, 200) and both bones are 100 long, so the target
  // is measured from (0, 200) and anything farther than 200 is out of reach.
  const targets: Array<[number, number]> = [
    [0, 400],     // straight up: exactly in reach
    [60, 300],    // a normal bend
    [-40, 250],   // bent the other way round the shoulder
    [150, 120],   // below and to the side
    [0, 1000],    // far out of reach: the chain goes straight
    [10, 205],    // almost on top of the shoulder: the chain folds
  ];

  for (const [tx, ty] of targets) {
    for (const bendPositive of [true, false]) {
      it(`alvo (${tx}, ${ty}), dobra ${bendPositive ? 'positiva' : 'negativa'}`, () => {
        const runtime = runtimeIk(tx, ty, bendPositive);
        // The tool's own solver, given the same chain: the child sits at
        // (100, 0) inside the parent and is 100 long, and the target is
        // measured from the parent's origin at (0, 200).
        const mine = solveTwoBone({
          childX: 100,
          childY: 0,
          childLength: 100,
          targetX: tx - 0,
          targetY: ty - 200,
          bendPositive,
        });
        expect(mine.rotation1).toBeCloseTo(runtime.coxa, 9);
        expect(mine.rotation2).toBeCloseTo(runtime.canela, 9);
      });
    }
  }

  it('says when the target is out of reach', () => {
    expect(solveTwoBone({
      childX: 100, childY: 0, childLength: 100, targetX: 0, targetY: 800, bendPositive: true,
    }).reached).toBe(false);
    expect(solveTwoBone({
      childX: 100, childY: 0, childLength: 100, targetX: 0, targetY: 150, bendPositive: true,
    }).reached).toBe(true);
  });

  it('a one-bone chain simply points at the target', () => {
    // Straight up is 90 degrees; straight left is 180.
    expect(solveOneBone(0, 50)).toBeCloseTo(90, 12);
    expect(solveOneBone(-50, 0)).toBeCloseTo(180, 12);
    expect(solveOneBone(0, 0)).toBe(0);
  });

  it('a chain with no length falls back to aiming', () => {
    const solution = solveTwoBone({
      childX: 0, childY: 0, childLength: 100, targetX: 0, targetY: 40, bendPositive: true,
    });
    expect(solution.rotation1).toBeCloseTo(90, 12);
    expect(solution.rotation2).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// The chain and what the tool writes
// ---------------------------------------------------------------------------

describe('ferramenta Posar: a cadeia', () => {
  it('takes the bone and its parent, and never the root of the skeleton', () => {
    const doc = new TestDoc(legFile());
    const skeleton = doc.skeleton as Skeleton;
    expect(chainFor(skeleton, 'pe')).toEqual(['canela', 'pe']);
    expect(chainFor(skeleton, 'canela')).toEqual(['coxa', 'canela']);
    // "coxa" hangs straight off the root, so its chain is itself alone.
    expect(chainFor(skeleton, 'coxa')).toEqual(['coxa']);
    expect(chainFor(skeleton, 'nao-existe')).toEqual([]);
  });

  it('reads the side the chain is already bent to', () => {
    const doc = new TestDoc(legFile());
    const skeleton = doc.skeleton as Skeleton;
    const canela = skeleton.findBone('canela') as { arotation: number };
    canela.arotation = 40;
    expect(bendOf(canela as never)).toBe(true);
    canela.arotation = -40;
    expect(bendOf(canela as never)).toBe(false);
  });

  it('puts the tip of the chain on the point that was dragged', () => {
    const doc = new TestDoc(legFile());
    const skeleton = doc.skeleton as Skeleton;
    // A point inside the leg's reach: 140 to the right of the shoulder.
    const values = poseChain(skeleton, ['coxa', 'canela'], 140, 200, true);
    expect(values.map((v) => v.bone)).toEqual(['coxa', 'canela']);
    for (const value of values) {
      const bone = skeleton.findBone(value.bone) as { rotation: number };
      bone.rotation = value.value;
    }
    skeleton.updateWorldTransform(0);
    const canela = skeleton.findBone('canela');
    if (canela === null) throw new Error('a test skeleton without "canela"');
    // The tip of the second bone is its origin plus its length along its X axis.
    expect(canela.worldX + canela.a * 100).toBeCloseTo(140, 6);
    expect(canela.worldY + canela.c * 100).toBeCloseTo(200, 6);
  });

  it('writes rotations only, never a position', () => {
    const doc = new TestDoc(legFile());
    const values = poseChain(doc.skeleton as Skeleton, ['coxa', 'canela'], 140, 200, true);
    expect(values.every((value) => value.key === 'rotation')).toBe(true);
  });

  it('a whole drag is one step of undo, and it writes the rest pose in montagem', () => {
    const doc = new TestDoc(legFile());
    poseTool.onDown?.(doc, event(200, 200));
    poseTool.onMove?.(doc, event(150, 220));
    poseTool.onMove?.(doc, event(140, 240));
    poseTool.onUp?.(doc, event(140, 240));
    expect(doc.undoCount).toBe(1);
    const canela = doc.file.bones.find((bone) => bone.name === 'canela');
    expect(typeof canela?.rotation).toBe('number');
  });

  it('with an animation open it keys instead of touching the rest pose', () => {
    const file = legFile();
    (file as { animations?: unknown[] }).animations = [{ name: 'andar', duration: 1, timelines: [] }];
    const doc = new TestDoc(file);
    doc.animation = 'andar';
    doc.time = 0.5;
    poseTool.onDown?.(doc, event(200, 200));
    poseTool.onMove?.(doc, event(150, 220));
    poseTool.onUp?.(doc, event(150, 220));

    // The rest pose is untouched: no bone gained a `rotation`.
    for (const bone of doc.file.bones) expect(bone.rotation).toBeUndefined();
    // And the animation gained one key per bone of the chain, at 0.5 — and,
    // since lote 68, the start key at 0 with the rest value, like Spriter.
    const animation = (doc.file.animations ?? [])[0] as AnimationDef;
    const rotations = (animation.timelines ?? []).filter((t) => t.property === 'rotation');
    expect(rotations.length).toBe(2);
    for (const timeline of rotations) {
      expect(timeline.keys?.map((key) => key.time)).toEqual([0, 0.5]);
    }
  });
});

// ---------------------------------------------------------------------------
// Handles
// ---------------------------------------------------------------------------

describe('alças: onde cada uma fica, em coordenadas de mundo', () => {
  it('has one handle per thing that can be grabbed, in file order', () => {
    const doc = new TestDoc(testFile());
    expect(collectHandles(doc).map((handle) => handle.id)).toEqual([
      'ikTarget:perna',
      'ikBend:perna',
      'transformTarget:copia',
      'pathPosition:caminho',
      'physicsWind:balanco',
      'physicsGravity:balanco',
    ]);
  });

  it('every handle carries its name written out, never an icon alone', () => {
    const doc = new TestDoc(testFile());
    for (const handle of collectHandles(doc)) {
      expect(handle.label.length).toBeGreaterThan(3);
      expect(handle.label).toContain(handle.constraint);
    }
  });

  it('puts the IK target on the target bone', () => {
    const doc = new TestDoc(testFile());
    const handle = collectHandles(doc).find((item) => item.kind === 'ikTarget');
    // "alvo" hangs off the root at (0, 400), so that is where it is in the world.
    expect(handle?.x).toBeCloseTo(0, 9);
    expect(handle?.y).toBeCloseTo(400, 9);
    expect(handle?.bone).toBe('alvo');
  });

  it('puts the bend handle on the joint, with the chain as its guide line', () => {
    const doc = new TestDoc(testFile());
    const handle = collectHandles(doc).find((item) => item.kind === 'ikBend');
    // The target is exactly 200 above the shoulder and each bone is 100 long,
    // so the leg is straight up: the joint is at (0, 300), the shoulder at
    // (0, 200), and the tip lands on the target at (0, 400).
    expect(handle?.x).toBeCloseTo(0, 9);
    expect(handle?.y).toBeCloseTo(300, 9);
    expect(handle?.anchorX).toBeCloseTo(0, 9);
    expect(handle?.anchorY).toBeCloseTo(200, 9);
    expect(handle?.tipY).toBeCloseTo(400, 9);
  });

  it('pushes the bend handle off the joint by a fixed number of pixels', () => {
    const doc = new TestDoc(testFile());
    const handle = resolveHandles(doc, 1).find((item) => item.kind === 'ikBend');
    // The chain points straight up, so "sideways" is straight left, and
    // `bendPositive` is on by default. At zoom 1 that is BEND_PIXELS units.
    expect(handle?.x).toBeCloseTo(-BEND_PIXELS, 9);
    expect(handle?.y).toBeCloseTo(300, 9);
    // At twice the zoom the handle is half as far in world units, which is
    // the same distance on screen.
    const zoomed = resolveHandles(doc, 2).find((item) => item.kind === 'ikBend');
    expect(zoomed?.x).toBeCloseTo(-BEND_PIXELS / 2, 9);
  });

  it('puts the transform target on its target bone', () => {
    const doc = new TestDoc(testFile());
    const handle = collectHandles(doc).find((item) => item.kind === 'transformTarget');
    expect(handle?.x).toBeCloseTo(-30, 9);
    expect(handle?.y).toBeCloseTo(10, 9);
  });

  it('puts the path handle on the tip of the first bone of the chain', () => {
    const doc = new TestDoc(testFile());
    const handle = collectHandles(doc).find((item) => item.kind === 'pathPosition');
    // "trilhoOsso" starts at (-200, 0), is 60 long and is not rotated.
    expect(handle?.x).toBeCloseTo(-140, 9);
    expect(handle?.y).toBeCloseTo(0, 9);
    expect(handle?.anchorX).toBeCloseTo(-200, 9);
  });

  it('draws wind along +X and gravity down, scaled so they stay on screen', () => {
    const doc = new TestDoc(testFile());
    const handles = collectHandles(doc);
    const wind = handles.find((item) => item.kind === 'physicsWind');
    const gravity = handles.find((item) => item.kind === 'physicsGravity');
    // "pendulo" is at (150, -80). Wind is 40 and gravity is 20, and one unit
    // of force is FORCE_SCALE world units: 40 * 0.25 = 10, 20 * 0.25 = 5.
    expect(wind?.x).toBeCloseTo(150 + 40 * FORCE_SCALE, 9);
    expect(wind?.y).toBeCloseTo(-80, 9);
    expect(gravity?.x).toBeCloseTo(150, 9);
    expect(gravity?.y).toBeCloseTo(-80 - 20 * FORCE_SCALE, 9);
  });

  it('finds the handle under the pointer, with a radius that is a screen size', () => {
    const doc = new TestDoc(testFile());
    const handles = collectHandles(doc);
    expect(handleAt(handles, 0, 400, 1)?.id).toBe('ikTarget:perna');
    // 60 world units away at zoom 1 is 60 pixels: too far for a 14px handle.
    expect(handleAt(handles, 60, 400, 1)).toBeNull();
    // The same 60 units at zoom 0.1 are 6 pixels away, which is a hit.
    const alvo = handles.filter((item) => item.kind === 'ikTarget');
    expect(handleAt(alvo, 60, 400, 0.1)?.id).toBe('ikTarget:perna');
  });

  it('when two handles overlap, the one drawn last is the one that is grabbed', () => {
    const doc = new TestDoc(testFile());
    const handles = collectHandles(doc);
    // At zoom 0.1 the radius is 140 world units, and both the IK target at
    // (0, 400) and the bend on the joint at (0, 300) are inside it. The bend
    // comes second in the list, so it is on top and it wins.
    expect(handleAt(handles, 0, 380, 0.1)?.id).toBe('ikBend:perna');
  });

  it('knows which side of the chain a point is on', () => {
    // The line goes from (0, 0) up to (0, 100); left is positive, right negative.
    expect(sideOfLine(0, 0, 0, 100, -10, 50)).toBe(1);
    expect(sideOfLine(0, 0, 0, 100, 10, 50)).toBe(-1);
  });

  it('moves the path position along the bone, and clamps it in percent mode', () => {
    // percent: dragging the length of the reference moves the position by 1.
    expect(pathPositionFromDrag(0.25, 'percent', 30, 60)).toBeCloseTo(0.75, 12);
    expect(pathPositionFromDrag(0.9, 'percent', 60, 60)).toBe(1);
    expect(pathPositionFromDrag(0.1, 'percent', -60, 60)).toBe(0);
    // fixed: the drag is a length in pixels and nothing is clamped.
    expect(pathPositionFromDrag(120, 'fixed', -200, 60)).toBeCloseTo(-80, 12);
  });
});

describe('alças: o que uma arrastada escreve', () => {
  it('moves the IK target bone by writing its local position', () => {
    const doc = new TestDoc(testFile());
    const handle = collectHandles(doc).find((item) => item.kind === 'ikTarget');
    if (handle === undefined) throw new Error('no IK handle');
    const drag = beginHandleDrag(doc, handle, handle.x, handle.y);
    expect(moveHandleDrag(doc, drag, 120, 260)).toBe(true);
    // "alvo" hangs off the root, which is the identity, so world is local.
    const alvo = doc.file.bones.find((bone) => bone.name === 'alvo');
    expect(alvo?.x).toBeCloseTo(120, 9);
    expect(alvo?.y).toBeCloseTo(260, 9);
    expect(doc.undoCount).toBe(1);
  });

  it('a whole drag of one handle is one step of undo', () => {
    const doc = new TestDoc(testFile());
    const handle = collectHandles(doc).find((item) => item.kind === 'ikTarget');
    if (handle === undefined) throw new Error('no IK handle');
    const drag = beginHandleDrag(doc, handle, handle.x, handle.y);
    moveHandleDrag(doc, drag, 100, 300);
    moveHandleDrag(doc, drag, 110, 310);
    moveHandleDrag(doc, drag, 120, 320);
    expect(doc.undoCount).toBe(1);
    doc.undo();
    // Undo puts the target back exactly where the file had it.
    const alvo = doc.file.bones.find((bone) => bone.name === 'alvo');
    expect(alvo?.x).toBeCloseTo(0, 9);
    expect(alvo?.y).toBeCloseTo(400, 9);
  });

  it('writes the wind and the gravity of the physics constraint', () => {
    const doc = new TestDoc(testFile());
    const handles = collectHandles(doc);
    const wind = handles.find((item) => item.kind === 'physicsWind');
    if (wind === undefined) throw new Error('no wind handle');
    const drag = beginHandleDrag(doc, wind, wind.x, wind.y);
    // Dragging to x = 175 means (175 - 150) / 0.25 = 100 units of wind.
    moveHandleDrag(doc, drag, 175, -80);
    expect(readConstraint(doc, 'balanco', 'wind', 0)).toBeCloseTo(100, 9);
    // The live constraint agrees, or the next frame would show the old value.
    const live = doc.skeleton?.findConstraint('balanco') as { wind?: number } | null;
    expect(live?.wind).toBeCloseTo(100, 9);
  });

  it('flips the bend when the pointer crosses the chain', () => {
    const doc = new TestDoc(testFile());
    const handle = resolveHandles(doc, 1).find((item) => item.kind === 'ikBend');
    if (handle === undefined) throw new Error('no bend handle');
    const drag = beginHandleDrag(doc, handle, handle.x, handle.y);
    // The chain points straight up; a point to the RIGHT of it is the negative
    // side, so `bendPositive` has to become false.
    expect(moveHandleDrag(doc, drag, 50, 300)).toBe(true);
    expect(readConstraint(doc, 'perna', 'bendPositive', true)).toBe(false);
    // Dragging further on the same side changes nothing.
    expect(moveHandleDrag(doc, drag, 80, 300)).toBe(false);
  });

  it('with an animation open a handle keys instead of touching the rest pose', () => {
    const doc = new TestDoc(testFile());
    doc.animation = 'andar';
    doc.time = 0.5;
    const handles = collectHandles(doc);
    const wind = handles.find((item) => item.kind === 'physicsWind');
    if (wind === undefined) throw new Error('no wind handle');
    const drag = beginHandleDrag(doc, wind, wind.x, wind.y);
    moveHandleDrag(doc, drag, 175, -80);

    // The constraint in the file still has the wind it was built with.
    const def = (doc.file.constraints ?? []).find((item) => item.name === 'balanco');
    expect((def as { wind?: number }).wind).toBe(40);
    // The key went on a constraint timeline, at the time of the cursor.
    const animation = (doc.file.animations ?? [])[0] as AnimationDef;
    const timeline = (animation.timelines ?? []).find((item) => item.type === 'constraint');
    expect(timeline?.target).toBe('balanco');
    expect(timeline?.property).toBe('wind');
    // Lote 68: the first key after 0 brings the start key along, with the
    // rest value (40), so the animation begins where the rig is.
    expect(timeline?.keys?.map((key) => key.time)).toEqual([0, 0.5]);
    expect(timeline?.keys?.[0].value).toBe(40);
    expect(timeline?.keys?.[1].value).toBeCloseTo(100, 9);
  });
});

// ---------------------------------------------------------------------------
// Skins (spec 7.1)
// ---------------------------------------------------------------------------

describe('painel Exibição: as peles', () => {
  const file = testFile();

  it('combines the chosen skins in the order they were chosen', () => {
    // The last skin wins where two of them fill the same slot, so the order
    // the user chose IS the order they are applied in.
    expect(combinedSkins(file, ['roupa-azul', 'chapeu'])).toEqual(['roupa-azul', 'chapeu']);
    expect(combinedSkins(file, ['chapeu', 'roupa-azul'])).toEqual(['chapeu', 'roupa-azul']);
  });

  it('drops the default skin, a repeat and a name that is not in the file', () => {
    expect(combinedSkins(file, ['default', 'chapeu', 'chapeu', 'sumiu']))
      .toEqual(['chapeu']);
  });

  it('the editable skin is the first visible one, and default when there is none', () => {
    expect(editableSkin(file, ['chapeu', 'roupa-azul'])).toBe('chapeu');
    expect(editableSkin(file, [])).toBe('default');
    expect(editableSkin(file, ['sumiu'])).toBe('default');
  });

  it('lists every skin of the file, saying which are on and which is editable', () => {
    const list = skinChoices(file, ['chapeu']);
    expect(list.map((item) => item.name)).toEqual(['default', 'roupa-azul', 'chapeu']);
    // "default" is always drawn and its checkbox is the one that is disabled.
    expect(list[0]).toMatchObject({ visible: true, isDefault: true });
    expect(list[1]).toMatchObject({ visible: false, editable: false });
    expect(list[2]).toMatchObject({ visible: true, editable: true });
  });

  it('turning a skin on puts it last, and turning it off keeps the others', () => {
    expect(toggleSkin(['chapeu'], 'roupa-azul', true)).toEqual(['chapeu', 'roupa-azul']);
    expect(toggleSkin(['chapeu', 'roupa-azul'], 'chapeu', false)).toEqual(['roupa-azul']);
    // "default" cannot be turned off: it is always underneath.
    expect(toggleSkin(['chapeu'], 'default', false)).toEqual(['chapeu']);
  });

  it('choosing the editable skin puts it first and shows it', () => {
    expect(setEditableSkin(['chapeu', 'roupa-azul'], 'roupa-azul')).toEqual(['roupa-azul', 'chapeu']);
    // A skin that was not on becomes visible as well as editable.
    expect(setEditableSkin(['chapeu'], 'roupa-azul')).toEqual(['roupa-azul', 'chapeu']);
  });

  it('the runtime accepts the combined list as it stands', () => {
    const doc = new TestDoc(testFile());
    const skeleton = doc.skeleton as Skeleton;
    skeleton.setSkin(combinedSkins(doc.file, ['chapeu', 'roupa-azul']));
    expect(skeleton.activeSkins.map((skin) => skin.name)).toEqual(['chapeu', 'roupa-azul']);
  });
});

// ---------------------------------------------------------------------------
// The settings themselves
// ---------------------------------------------------------------------------

describe('painel Exibição: as opções', () => {
  it('has one checkbox per thing the drawing area can show', () => {
    // Requirement D7 lists them; the panel must not quietly lose one.
    // `clippings` entrou no lote 6 (v2.3): uma máscara não desenha nada no jogo,
    // e sem esta caixa o artista veria o corte e não veria o que o faz.
    expect(SHOW_ROWS.map((row) => row.key)).toEqual([
      'drawings', 'bones', 'boneNames', 'boundingBoxes', 'points', 'clippings',
      'meshes', 'edges', 'weights', 'grid', 'rulers', 'axes',
    ]);
    // Every one carries a written label, never an icon alone.
    for (const row of SHOW_ROWS) expect(row.label.length).toBeGreaterThan(2);
  });

  it('has a field for every onion number, each with a range that makes sense', () => {
    expect(ONION_ROWS.map((row) => row.key)).toEqual([
      'before', 'after', 'step', 'opacity', 'offsetX', 'offsetY',
    ]);
    for (const row of ONION_ROWS) expect(row.max).toBeGreaterThan(row.min);
  });

  it('changes one setting without touching the others', () => {
    resetViewSettings();
    setViewSettings({ boneNames: true });
    expect(viewSettings().boneNames).toBe(true);
    expect(viewSettings().grid).toBe(DEFAULT_VIEW.grid);
    setViewSettings({ onion: { enabled: true } });
    expect(viewSettings().onion.enabled).toBe(true);
    expect(viewSettings().onion.step).toBe(DEFAULT_ONION.step);
    resetViewSettings();
    expect(viewSettings().boneNames).toBe(DEFAULT_VIEW.boneNames);
  });

  it('replaces a broken or missing setting with its default', () => {
    const settings = parseViewSettings({ grid: 'sim', background: 'azul', onion: { before: -3 } });
    expect(settings.grid).toBe(DEFAULT_VIEW.grid);
    expect(settings.background).toBe(DEFAULT_VIEW.background);
    expect(settings.onion.before).toBe(0);
    expect(parseViewSettings(null)).toEqual(DEFAULT_VIEW);
  });

  it('saves the settings in the editor extension and reads them back', () => {
    resetViewSettings();
    setViewSettings({ boneNames: true, onion: { enabled: true, before: 4 } });
    const file = testFile();
    writeViewState(file, viewSettings() as never);
    // The extension a reader ignores, exactly where the camera lives.
    expect((readEditorState(file) as Record<string, unknown>).view).toBeDefined();
    const back = readViewState(file);
    expect(back.boneNames).toBe(true);
    expect(back.onion.before).toBe(4);
    resetViewSettings();
  });
});

// ---------------------------------------------------------------------------
// I1, I2 e I3 — ver e travar, desde o arranque (chat I, lote 3, 29/09/2026)
// ---------------------------------------------------------------------------

/** Um documento mínimo: só o que as ações de ver leem e escrevem. */
function docDasAcoes(): EditorDoc & { avisos: string[] } {
  const file = testFile();
  const avisos: string[] = [];
  let selection = emptySelection();
  return {
    file,
    avisos,
    get selection() { return selection; },
    select(s: Selection) { selection = s; },
    notice(text: string) { avisos.push(text); },
  } as unknown as EditorDoc & { avisos: string[] };
}

describe('I3: as ações de ver e travar valem sem a aba Exibição montada', () => {
  it('prova de que o defeito existia: sem ninguém registrar, o id não existe — o estado com a aba fechada', () => {
    expect(hasAction('esconder-escolhido')).toBe(false);
    expect(hasAction('ver-ossos')).toBe(false);
  });

  it('registradas pelo arranque, existem sem painel, e a tabela diz "arranque"', () => {
    const forget = registerViewActions(docDasAcoes());
    try {
      for (const id of ['ver-ossos', 'travar-ossos', 'ver-desenhos', 'travar-desenhos', 'ver-cebola',
        'esconder-escolhido', 'so-este', 'mostrar-tudo', 'destravar-tudo']) {
        expect(hasAction(id), id).toBe(true);
      }
      // O menu Exibir chama pelos ids de `VIEW_ACTIONS`: todos têm de existir.
      for (const id of Object.values(VIEW_ACTIONS)) expect(hasAction(id), id).toBe(true);
      expect(actionRow('ver-ossos')?.where).toBe('arranque');
      expect(actionRow('esconder-escolhido')?.where).toBe('arranque');
      expect(actionRow('importar-pele')?.where).toBe('arranque');
    } finally {
      for (const stop of forget) stop();
    }
  });

  it('o botão Ver ossos escreve e diz o que fez, com a tecla da volta', () => {
    resetViewSettings();
    const doc = docDasAcoes();
    const forget = registerViewActions(doc);
    try {
      runAction('ver-ossos');
      expect(viewSettings().bones).toBe(false);
      expect(doc.avisos.at(-1)).toBe('Ossos escondidos. 7 traz de volta');
      runAction('ver-ossos');
      expect(viewSettings().bones).toBe(true);
    } finally {
      for (const stop of forget) stop();
      resetViewSettings();
    }
  });
});

describe('I2: esconder e travar "o escolhido" sem nada escolhido recusa em voz alta', () => {
  it('prova de que o defeito existia: a conta "só este" com a seleção vazia esconde TUDO', () => {
    const file = testFile();
    const patch = soloSelected(DEFAULT_VIEW, file, emptySelection());
    expect(patch.hiddenSlots?.length).toBe((file.slots ?? []).length);
  });

  it('Shift+H, H, Ctrl+2 e Ctrl+Shift+2 sem escolha: nada muda, e o rodapé diz o que fazer', () => {
    resetViewSettings();
    const doc = docDasAcoes();
    const forget = registerViewActions(doc);
    try {
      for (const id of ['so-este', 'esconder-escolhido', 'travar-escolhido', 'travar-resto']) {
        runAction(id);
        expect(doc.avisos.at(-1), id).toBe(NOTHING_PICKED);
      }
      expect(viewSettings().hiddenSlots).toEqual([]);
      expect(viewSettings().hiddenBones).toEqual([]);
      expect(viewSettings().lockedSlots).toEqual([]);
    } finally {
      for (const stop of forget) stop();
      resetViewSettings();
    }
  });
});

describe('I1: esconder conta PEÇAS, e um desenho é uma peça', () => {
  it('um desenho escolhido (slot e anexo) conta 1, e não 2', () => {
    const umDesenho = { ...emptySelection(), slots: ['body'], attachments: [{ slot: 'body', attachment: 'body' }] };
    expect(pickedCount(umDesenho)).toBe(1);
    expect(pickedCount({ ...emptySelection(), bones: ['a', 'b'], slots: ['c'] })).toBe(3);
  });

  it('a frase concorda com o número', () => {
    expect(hiddenNotice(1)).toBe('1 peça escondida. Ctrl+Alt+3 mostra tudo');
    expect(hiddenNotice(3)).toBe('3 peças escondidas. Ctrl+Alt+3 mostra tudo');
    expect(lockedNotice(1)).toBe('1 peça travada. Ctrl+Alt+2 destrava tudo');
  });
});

describe('as ações de ver levadas ao arranque, EXERCITADAS com o estado de que precisam (P58)', () => {
  /*
   * O vigia `existir-nao-e-funcionar` só vê o herói recém-aberto, sem escolha:
   * ali, "esconder o escolhido" passa pela RECUSA (disse), e não pelo efeito.
   * Passar pela recusa é carona. Aqui cada uma roda com o estado montado, e o
   * teste confere o EFEITO — não só que respondeu.
   */
  function comEscolha(sel: Partial<Selection>): EditorDoc & { avisos: string[] } {
    const doc = docDasAcoes();
    doc.select({ ...emptySelection(), ...sel });
    return doc;
  }

  it('limpar-guias: com duas guias, elas saem e o rodapé diz quantas; sem guia, diz por que nada', () => {
    resetViewSettings();
    const doc = docDasAcoes();
    const forget = registerViewActions(doc);
    try {
      expect(runAction('limpar-guias')).toBe(true);
      expect(doc.avisos.at(-1)).toBe(NO_GUIDES);
      setViewSettings({ guides: [{ axis: 'x', value: 10 }, { axis: 'y', value: -4 }] as never });
      expect(runAction('limpar-guias')).toBe(true);
      expect(viewSettings().guides).toEqual([]);
      expect(doc.avisos.at(-1)).toBe('2 guias apagadas');
    } finally {
      for (const stop of forget) stop();
      resetViewSettings();
    }
  });

  it('esconder, só este e mostrar tudo, com um slot escolhido: o efeito, e não a recusa', () => {
    resetViewSettings();
    const file = testFile();
    const slot = (file.slots ?? [])[0]!.name;
    const doc = comEscolha({ slots: [slot] });
    const forget = registerViewActions(doc);
    try {
      runAction('esconder-escolhido');
      expect(viewSettings().hiddenSlots).toEqual([slot]);
      expect(doc.avisos.at(-1)).toBe(hiddenNotice(1));
      runAction('mostrar-tudo');
      expect(viewSettings().hiddenSlots).toEqual([]);
      doc.select({ ...emptySelection(), slots: [slot] });
      runAction('so-este');
      expect(viewSettings().hiddenSlots).not.toContain(slot);
      expect(viewSettings().hiddenSlots.length).toBe((doc.file.slots ?? []).length - 1);
    } finally {
      for (const stop of forget) stop();
      resetViewSettings();
    }
  });

  it('travar o escolhido, travar o resto e destravar tudo, com um slot escolhido', () => {
    resetViewSettings();
    const file = testFile();
    const slot = (file.slots ?? [])[0]!.name;
    const doc = comEscolha({ slots: [slot] });
    const forget = registerViewActions(doc);
    try {
      runAction('travar-escolhido');
      expect(viewSettings().lockedSlots).toEqual([slot]);
      expect(doc.avisos.at(-1)).toBe(lockedNotice(1));
      runAction('destravar-tudo');
      expect(viewSettings().lockedSlots).toEqual([]);
      doc.select({ ...emptySelection(), slots: [slot] });
      runAction('travar-resto');
      expect(viewSettings().lockedSlots).not.toContain(slot);
    } finally {
      for (const stop of forget) stop();
      resetViewSettings();
    }
  });

  it('ver só o resultado liga e, no segundo aperto, devolve o que estava', () => {
    resetViewSettings();
    const doc = docDasAcoes();
    const forget = registerViewActions(doc);
    try {
      runAction('ver-resultado');
      expect(viewSettings().bones).toBe(false);
      runAction('ver-resultado');
      expect(viewSettings().bones).toBe(DEFAULT_VIEW.bones);
    } finally {
      for (const stop of forget) stop();
      resetViewSettings();
    }
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, I8: os grupos da aba Exibição dobram
// ---------------------------------------------------------------------------

describe('rodada 17, I8: os grupos da aba Exibição dobram pelo título', () => {
  it('o clique dobra e abre; o estado fica entre um desenho e outro da aba', () => {
    resetViewGroups();
    expect(viewGroupFolded('A cena')).toBe(false);
    expect(toggleViewGroup('A cena')).toBe(true);
    expect(viewGroupFolded('A cena')).toBe(true);
    expect(viewGroupFolded('Mostrar na tela')).toBe(false);
    expect(toggleViewGroup('A cena')).toBe(false);
    expect(viewGroupHint('A cena', false)).toBe('Dobrar o grupo A cena');
    expect(viewGroupHint('A cena', true)).toBe('Abrir o grupo A cena');
  });

  it('04/11/2026: na tela baixa (até 800 px) "A cena" nasce dobrada; a mão manda acima disso', () => {
    resetViewGroups();
    expect(telaBaixa(720)).toBe(true);
    expect(telaBaixa(800)).toBe(true);
    expect(telaBaixa(900)).toBe(false);
    // Tela grande: tudo nasce aberto, como sempre.
    expect(viewGroupFolded('A cena', false)).toBe(false);
    expect(viewGroupFolded('Mostrar na tela', false)).toBe(false);
    // Tela baixa: só "A cena" nasce dobrada; a tabela continua aberta.
    expect(viewGroupFolded('A cena', true)).toBe(true);
    expect(viewGroupFolded('Mostrar na tela', true)).toBe(false);
    // Um clique abre, e o que a mão escolheu vale nas duas telas.
    expect(toggleViewGroup('A cena', true)).toBe(false);
    expect(viewGroupFolded('A cena', true)).toBe(false);
    expect(viewGroupFolded('A cena', false)).toBe(false);
    resetViewGroups();
  });

  it('a aba usa o grupo que dobra nos três grupos (antes: o título não fazia nada)', () => {
    const aba = readFileSync(resolve(__dirname, '../src/panels/view-panel.ts'), 'utf8');
    for (const titulo of ['Mostrar na tela', 'A cena', 'Skins']) {
      expect(aba).toContain(`const box = foldGroup('${titulo}');`);
      expect(aba).not.toContain(`const box = group('${titulo}');`);
    }
    const css = readFileSync(resolve(__dirname, '../src/panels/view-panel.css'), 'utf8');
    expect(css).toContain('.prop-grupo.is-dobrado > :not(legend)');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 4: os botões da Exibição dizem o que fazem (R5)', () => {
  it('Voltar ao padrão e Editar aqui têm dica', () => {
    const exibicao = fonteR47L4('panels/view-panel.ts');
    expect(exibicao).toContain('voltar.title = ');
    expect(exibicao).toContain('edit.title = choice.editable');
  });
});

// Rodada 47, lote 5b (notas do doc 86)
describe('rodada 47, lote 5b: a Cor do fundo tem dica', () => {
  const fonteR47L5b = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

  it('a linha da Cor do fundo diz o que é', () => {
    expect(fonteR47L5b('panels/view-panel.ts')).toContain("fundo.title = 'Cor do fundo: ");
  });
});
