/**
 * Eixos, compensação e edições em bloco da linha do tempo.
 *
 * Requirements R7 (spaces and compensation), A1 (stretch and mirror), A6 (close
 * the loop) and R2 (bone colour and icon).
 *
 * No DOM: everything under test is a pure function over the `.bone` JSON, or a
 * function over an `EditorDoc` that only needs the runtime. Every expected
 * number is worked out by hand in the comment above the assertion, so a failing
 * test says which rule broke, not just which number moved.
 */

import { describe, expect, it } from 'vitest';

import {
  cosDeg, loadAnimationsFor, loadSkeletonData, sinDeg, Skeleton,
  type AtlasData, type AtlasPageData, type BoneFile, type Matrix2x3,
  type SkeletonData,
} from '../../runtime/src/index.js';
import {
  emptySelection, type Command, type EditorDoc, type Selection, type ToolEvent,
} from '../src/contract.js';
import { translateTool } from '../src/viewport/tools/translate.js';
import { rotateTool } from '../src/viewport/tools/rotate.js';
import { scaleTool } from '../src/viewport/tools/scale.js';
import { boneFrame, parentFrame, readBone } from '../src/viewport/tools/select.js';
import {
  frameAngle, frameAxes, getHandleSpace, lockAxisInFrame, resetSpaceState,
  setCompensation, setHandleSpace, spaceFrame, getCompensation, compensationOn,
} from '../src/viewport/tools/space.js';
import {
  applyCompensation, attachmentsToFix, decomposeTrs, fixAttachment, fixMatrix,
  fixPoint, localFromWorld, planCompensation,
} from '../src/viewport/tools/compensate.js';
import { snapAngleFrom } from '../src/viewport/tools/rotate.js';
import {
  boneColorCss, boneIconGlyph, boneIconLabel, BONE_ICONS, DEFAULT_BONE_COLOR,
} from '../src/viewport/bone-icons.js';
import {
  allTargetsOf, animatedBones, closeLoop, closeLoopOn, closingCurve,
  findMirrorPairs, mirrorClipboard, mirrorKeysInTime, mirrorNameUnder, outgoingTangent,
  parseMirrorRules, stretchSelection, swapMirroredBones, timeSpanOf,
} from '../src/anim/timeline-tools.js';
import {
  boneTarget, copyKeys, durationOf, findAnimation, findTimeline, keyTimes, pasteKeys, valueAt,
} from '../src/anim/keying.js';
import { boneFields } from '../src/panels/properties-model.js';

// ---------------------------------------------------------------------------
// A document to test against
// ---------------------------------------------------------------------------

/**
 * The rig every compensation test uses:
 *
 *   root                       origin
 *   +-- pai       x 10, y 20, rotation 30, scaleX 1.5, scaleY 0.8
 *   |   +-- filho x 40, rotation 15, shearX 20  (the shear is on purpose)
 *   |   +-- neto  under `filho`, to prove the whole branch follows
 *   +-- solto     a bone with inheritRotation false, which must NOT be touched
 *
 * `pai` carries the slot `capa`, so the drawing compensation has something to
 * hold in place: a region, an unweighted box, and a mesh weighted half to `pai`
 * and half to `filho`.
 */
function rigFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'pai', parent: 'root', x: 10, y: 20, rotation: 30, scaleX: 1.5, scaleY: 0.8, length: 50 },
      { name: 'filho', parent: 'pai', x: 40, rotation: 15, shearX: 20, length: 30 },
      { name: 'neto', parent: 'filho', x: 25, rotation: -10, length: 20 },
      { name: 'solto', parent: 'pai', x: 5, inheritRotation: false },
    ],
    slots: [{ name: 'capa', bone: 'pai', attachment: 'pano' }],
    skins: [{
      name: 'default',
      attachments: {
        capa: {
          pano: { type: 'region', x: 12, y: -4, rotation: 20, scaleX: 2, scaleY: 2, width: 10, height: 10 },
          caixa: { type: 'boundingbox', shape: 'polygon', vertices: [0, 0, 10, 0, 10, 10, 0, 10] },
          malha: {
            type: 'mesh',
            uvs: [0, 0, 1, 0],
            triangles: [0, 1, 0],
            binding: {
              counts: [2, 1],
              // Bone indices are the file order: pai = 1, filho = 2.
              bones: [1, 2, 1],
              positions: [3, 4, 5, 6, 7, 8],
              weights: [0.5, 0.5, 1],
            },
          },
        },
      },
    }],
  } as unknown as BoneFile;
}

/** The smallest `EditorDoc` the tools need. */
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
  notices: string[] = [];

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
  get undoCount(): number { return this.done.length; }
  /** O contrato pede a pilha só de leitura desde o lote 19 (o Histórico). */
  get history(): { entries(): Array<{ label: string; index: number; undone: boolean }>; cursor(): number } {
    return {
      entries: () => [
        ...this.done.map((c, i) => ({ label: c.label, index: i, undone: false })),
        ...[...this.undone].reverse().map((c, i) => ({
          label: c.label, index: this.done.length + i, undone: true,
        })),
      ],
      cursor: () => this.done.length - 1,
    };
  }

  rebuild(): void {
    this.skeletonData = loadSkeletonData(this.file);
    this.instance = new Skeleton(this.skeletonData);
    this.instance.updateWorldTransform(this.time);
  }

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

/** Every number of a matrix, so a comparison names the field that drifted. */
function sameMatrix(actual: Matrix2x3, expected: Matrix2x3, digits = 8): void {
  expect(actual.a).toBeCloseTo(expected.a, digits);
  expect(actual.b).toBeCloseTo(expected.b, digits);
  expect(actual.c).toBeCloseTo(expected.c, digits);
  expect(actual.d).toBeCloseTo(expected.d, digits);
  expect(actual.worldX).toBeCloseTo(expected.worldX, digits);
  expect(actual.worldY).toBeCloseTo(expected.worldY, digits);
}

/** A pointer event already in world coordinates, as the viewport builds it. */
function event(x: number, y: number, extra: Partial<ToolEvent> = {}): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1, ...extra };
}

/** Writes a bone property straight into the file and re-poses. */
function setBone(doc: TestDoc, name: string, values: Record<string, number>): void {
  const def = (doc.file.bones ?? []).find((bone) => bone.name === name);
  if (def === undefined) throw new Error(`osso ${name} não existe`);
  Object.assign(def, values);
  doc.rebuild();
}

// ---------------------------------------------------------------------------
// R7 — the space of the handles
// ---------------------------------------------------------------------------

describe('eixos: local, pai e mundo', () => {
  it('o padrão é Local, que é o que as ferramentas já faziam', () => {
    resetSpaceState();
    expect(getHandleSpace()).toBe('local');
    // E nenhuma compensação ligada: mexer num osso mexe no galho, como sempre.
    expect(compensationOn(getCompensation())).toBe(false);
  });

  it('recusa um espaço que não existe', () => {
    resetSpaceState();
    setHandleSpace('inventado' as never);
    expect(getHandleSpace()).toBe('local');
    setHandleSpace('mundo');
    expect(getHandleSpace()).toBe('mundo');
    resetSpaceState();
  });

  it('cada espaço dá a matriz certa, com a origem sempre no osso', () => {
    const doc = new TestDoc(rigFile());
    const skeleton = doc.skeleton!;
    const pivot = boneFrame(skeleton, 'filho');

    // Mundo: eixos da tela, origem no osso.
    const world = spaceFrame(skeleton, 'filho', 'mundo');
    expect(world.a).toBeCloseTo(1, 12);
    expect(world.b).toBeCloseTo(0, 12);
    expect(world.c).toBeCloseTo(0, 12);
    expect(world.d).toBeCloseTo(1, 12);
    expect(world.worldX).toBeCloseTo(pivot.worldX, 12);
    expect(world.worldY).toBeCloseTo(pivot.worldY, 12);

    // Local: a própria matriz do osso.
    sameMatrix(spaceFrame(skeleton, 'filho', 'local'), pivot, 12);
    // Pai: a matriz do pai.
    sameMatrix(spaceFrame(skeleton, 'filho', 'pai'), boneFrame(skeleton, 'pai'), 12);
  });

  it('os eixos desenhados são unitários e seguem o quadro', () => {
    // Um quadro girado de 90 graus: X vira (0, 1) e Y vira (-1, 0).
    const frame: Matrix2x3 = { a: 0, b: -3, c: 2, d: 0, worldX: 7, worldY: 9 };
    const axes = frameAxes(frame);
    expect(axes.x.x).toBeCloseTo(0, 12);
    expect(axes.x.y).toBeCloseTo(1, 12);
    expect(axes.y.x).toBeCloseTo(-1, 12);
    expect(axes.y.y).toBeCloseTo(0, 12);
  });

  it('um eixo degenerado cai no eixo do mundo em vez de sumir', () => {
    const axes = frameAxes({ a: 0, b: 0, c: 0, d: 0, worldX: 0, worldY: 0 });
    expect(axes.x).toEqual({ x: 1, y: 0 });
    expect(axes.y).toEqual({ x: 0, y: 1 });
  });

  it('sem Shift o movimento passa inteiro, em qualquer espaço', () => {
    const frame: Matrix2x3 = { a: 0, b: -1, c: 1, d: 0, worldX: 0, worldY: 0 };
    expect(lockAxisInFrame(frame, 3, 7, false, 'none')).toEqual({ dx: 3, dy: 7, axis: 'none' });
  });

  it('com Shift o movimento gruda no eixo DO QUADRO, não no do mundo', () => {
    // Quadro girado de 90 graus: F = [[0, -1], [1, 0]].
    // Movimento do mundo d = (2, 10).
    // F⁻¹ d = (10, -2): o componente maior é o X do quadro, então o eixo é X.
    // De volta ao mundo: F (10, 0) = (0, 10).
    const frame: Matrix2x3 = { a: 0, b: -1, c: 1, d: 0, worldX: 0, worldY: 0 };
    const locked = lockAxisInFrame(frame, 2, 10, true, 'none');
    expect(locked.axis).toBe('x');
    expect(locked.dx).toBeCloseTo(0, 12);
    expect(locked.dy).toBeCloseTo(10, 12);

    // No mundo o MESMO movimento gruda em Y, porque lá o maior é o Y.
    const identity: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
    const straight = lockAxisInFrame(identity, 2, 10, true, 'none');
    expect(straight.axis).toBe('y');
    expect(straight.dx).toBeCloseTo(0, 12);
    expect(straight.dy).toBeCloseTo(10, 12);
  });

  it('o eixo escolhido não muda no meio do arrasto', () => {
    const identity: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
    // Já travado em X: mesmo com dy muito maior, continua em X.
    const locked = lockAxisInFrame(identity, 1, 50, true, 'x');
    expect(locked.axis).toBe('x');
    expect(locked.dx).toBeCloseTo(1, 12);
    expect(locked.dy).toBeCloseTo(0, 12);
  });

  it('um quadro sem inversa deixa o movimento passar', () => {
    const flat: Matrix2x3 = { a: 0, b: 0, c: 0, d: 0, worldX: 0, worldY: 0 };
    expect(lockAxisInFrame(flat, 4, 5, true, 'none')).toEqual({ dx: 4, dy: 5, axis: 'none' });
  });

  it('o giro gruda em passos contados a partir do espaço', () => {
    // Mundo: origem 0, passo 15. 37 -> 30.
    expect(snapAngleFrom(37, 0, true)).toBeCloseTo(30, 12);
    // Um rig inclinado de 7 graus: origem -7 (o giro cancela o pai).
    // -7 + round((37 + 7) / 15) * 15 = -7 + 3 * 15 = 38.
    expect(snapAngleFrom(37, -7, true)).toBeCloseTo(38, 12);
    // Sem Shift nada gruda.
    expect(snapAngleFrom(37.4, -7, false)).toBeCloseTo(37.4, 12);
  });

  it('frameAngle devolve o ângulo do eixo X do quadro', () => {
    expect(frameAngle({ a: cosDeg(30), b: 0, c: sinDeg(30), d: 1, worldX: 0, worldY: 0 }))
      .toBeCloseTo(30, 9);
  });
});

// ---------------------------------------------------------------------------
// R7 — the maths of the compensation
// ---------------------------------------------------------------------------

describe('compensação: a conta', () => {
  it('localFromWorld desfaz a passada 5.4, com pai girado e escalado', () => {
    const doc = new TestDoc(rigFile());
    const skeleton = doc.skeleton!;

    // O que o runtime calculou para `filho`, e o quadro em que ele vive.
    const world = boneFrame(skeleton, 'filho');
    const frame = parentFrame(skeleton, 'filho');
    const pose = localFromWorld(world, frame);

    // A decomposição de 5.5 sempre põe shearX em zero, então é a POSE que muda,
    // não a matriz: escrevemos a pose de volta e a matriz tem que voltar igual.
    setBone(doc, 'filho', {
      x: pose.x, y: pose.y, rotation: pose.rotation,
      scaleX: pose.scaleX, scaleY: pose.scaleY, shearX: 0, shearY: pose.shearY,
    });
    sameMatrix(boneFrame(doc.skeleton!, 'filho'), world, 8);
  });

  it('localFromWorld num osso raiz usa a colocação do esqueleto', () => {
    const doc = new TestDoc(rigFile());
    const skeleton = doc.skeleton!;
    const world = boneFrame(skeleton, 'pai');
    const pose = localFromWorld(world, parentFrame(skeleton, 'pai'));
    // `pai` é filho de `root`, que está na origem sem giro: a pose volta igual
    // ao que está escrito no arquivo.
    expect(pose.x).toBeCloseTo(10, 9);
    expect(pose.y).toBeCloseTo(20, 9);
    expect(pose.rotation).toBeCloseTo(30, 9);
    expect(pose.scaleX).toBeCloseTo(1.5, 9);
    expect(pose.scaleY).toBeCloseTo(0.8, 9);
    expect(pose.shearY).toBeCloseTo(0, 9);
  });

  it('um quadro achatado devolve a pose neutra em vez de NaN', () => {
    const flat: Matrix2x3 = { a: 0, b: 0, c: 0, d: 0, worldX: 0, worldY: 0 };
    const pose = localFromWorld({ a: 1, b: 0, c: 0, d: 1, worldX: 5, worldY: 5 }, flat);
    expect(pose).toEqual({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, shearY: 0 });
  });

  it('F = depois⁻¹ · antes leva um ponto de volta ao lugar', () => {
    // antes: gira 0, escala 1, na origem. depois: desloca (10, 0).
    // F = depois⁻¹ · antes = desloca (-10, 0).
    // Um ponto local (3, 4) valia (3, 4) no mundo e, depois do deslocamento,
    // valeria (13, 4). Com F ele vira (-7, 4), e depois · (-7, 4) = (3, 4).
    const before: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
    const after: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 10, worldY: 0 };
    const fix = fixMatrix(before, after);
    const moved = fixPoint(fix, 3, 4);
    expect(moved.x).toBeCloseTo(-7, 12);
    expect(moved.y).toBeCloseTo(4, 12);
    // De volta ao mundo pela matriz NOVA: (-7 + 10, 4) = (3, 4), o lugar antigo.
    expect(after.a * moved.x + after.b * moved.y + after.worldX).toBeCloseTo(3, 12);
    expect(after.c * moved.x + after.d * moved.y + after.worldY).toBeCloseTo(4, 12);
  });

  it('decomposeTrs desfaz T · R · S', () => {
    // R(30) · S(2, 3): a = cos30·2, b = -sin30·3, c = sin30·2, d = cos30·3.
    const m: Matrix2x3 = {
      a: cosDeg(30) * 2, b: -sinDeg(30) * 3,
      c: sinDeg(30) * 2, d: cosDeg(30) * 3,
      worldX: 7, worldY: -2,
    };
    const trs = decomposeTrs(m);
    expect(trs.x).toBeCloseTo(7, 12);
    expect(trs.y).toBeCloseTo(-2, 12);
    expect(trs.rotation).toBeCloseTo(30, 9);
    expect(trs.scaleX).toBeCloseTo(2, 9);
    expect(trs.scaleY).toBeCloseTo(3, 9);
  });
});

// ---------------------------------------------------------------------------
// R7 — the compensation at work
// ---------------------------------------------------------------------------

describe('compensação: os filhos ficam onde estão', () => {
  const flags = { children: true, drawings: false, boxes: false };

  /** Moves `pai` by hand, exactly as the tool does, with compensation on. */
  function moveParent(doc: TestDoc, dx: number, dy: number): void {
    const plan = planCompensation(doc, ['pai'], flags);
    const x = readBone(doc, 'pai', 'x');
    const y = readBone(doc, 'pai', 'y');
    setBone(doc, 'pai', { x: x + dx, y: y + dy });
    applyCompensation(doc, plan, 'teste');
  }

  it('mover o pai devolve a MESMA matriz de mundo para o filho', () => {
    const doc = new TestDoc(rigFile());
    const before = boneFrame(doc.skeleton!, 'filho');
    moveParent(doc, 37, -19);
    sameMatrix(boneFrame(doc.skeleton!, 'filho'), before, 8);
  });

  it('sem compensação o filho vai junto — é o que a compensação evita', () => {
    const doc = new TestDoc(rigFile());
    const before = boneFrame(doc.skeleton!, 'filho');
    const x = readBone(doc, 'pai', 'x');
    setBone(doc, 'pai', { x: x + 37 });
    // O pai não gira nem escala aqui, então o filho anda os mesmos 37 em X.
    expect(boneFrame(doc.skeleton!, 'filho').worldX).toBeCloseTo(before.worldX + 37, 8);
  });

  it('girar o pai devolve a mesma matriz de mundo para o filho', () => {
    const doc = new TestDoc(rigFile());
    const before = boneFrame(doc.skeleton!, 'filho');
    const plan = planCompensation(doc, ['pai'], flags);
    setBone(doc, 'pai', { rotation: 30 + 47 });
    applyCompensation(doc, plan, 'teste');
    sameMatrix(boneFrame(doc.skeleton!, 'filho'), before, 8);
  });

  it('escalar o pai, mesmo torto, devolve a mesma matriz para o filho', () => {
    const doc = new TestDoc(rigFile());
    const before = boneFrame(doc.skeleton!, 'filho');
    const plan = planCompensation(doc, ['pai'], flags);
    // Escala desigual: é o caso que exige o shear na pose compensada.
    setBone(doc, 'pai', { scaleX: 2.7, scaleY: 0.35 });
    applyCompensation(doc, plan, 'teste');
    sameMatrix(boneFrame(doc.skeleton!, 'filho'), before, 8);
  });

  it('o neto também fica parado, porque o filho ficou', () => {
    const doc = new TestDoc(rigFile());
    const before = boneFrame(doc.skeleton!, 'neto');
    moveParent(doc, -12, 44);
    sameMatrix(boneFrame(doc.skeleton!, 'neto'), before, 8);
  });

  /*
   * A5 (29/09/2026, regra 28). Este teste se chamava *"a compensação é um
   * passo de desfazer que volta a pose inteira"*, e provava outra coisa: o pai
   * é mexido POR FORA de comando (`setBone`), então o desfazer só volta o
   * filho, e a pose inteira não volta. E com UM movimento só, ele passava com
   * dois passos na pilha. O que "um arrasto = um Ctrl+Z" prova de verdade está
   * em `inclinar.test.ts` e `documento.test.ts` (o `GestureGroup`, 28/09).
   * O nome agora diz o que ele olha, e ele confere as três coisas.
   */
  it('desfazer a compensação devolve o FILHO num passo só; o pai, mexido fora de comando, fica', () => {
    const doc = new TestDoc(rigFile());
    const filhoX = readBone(doc, 'filho', 'x');
    const paiX = readBone(doc, 'pai', 'x');
    moveParent(doc, 60, 0);
    expect(readBone(doc, 'filho', 'x')).not.toBeCloseTo(filhoX, 6);
    // A compensação é UM comando na pilha: o pai não entrou nela.
    expect(doc.undoCount).toBe(1);
    doc.undo();
    expect(doc.undoCount).toBe(0);
    expect(readBone(doc, 'filho', 'x')).toBeCloseTo(filhoX, 9);
    expect(readBone(doc, 'pai', 'x')).toBeCloseTo(paiX + 60, 9);
  });

  it('um osso que não herda o giro do pai não é mexido', () => {
    const doc = new TestDoc(rigFile());
    const plan = planCompensation(doc, ['pai'], flags);
    const before = readBone(doc, 'solto', 'x');
    setBone(doc, 'pai', { rotation: 90 });
    applyCompensation(doc, plan, 'teste');
    // `solto` pediu para não herdar o giro; a compensação não sabe recompor a
    // pose dele e o deixa exatamente como estava.
    expect(readBone(doc, 'solto', 'x')).toBeCloseTo(before, 12);
  });

  it('com as três chaves desligadas não há plano nenhum', () => {
    const doc = new TestDoc(rigFile());
    const plan = planCompensation(doc, ['pai'], { children: false, drawings: false, boxes: false });
    expect(plan.bones).toHaveLength(0);
    expect(applyCompensation(doc, plan, 'teste')).toEqual({ bones: 0, attachments: 0 });
  });

  it('as chaves da barra de ferramentas guardam e avisam', () => {
    resetSpaceState();
    const seen: boolean[] = [];
    setCompensation({ children: true });
    seen.push(getCompensation().children);
    expect(seen).toEqual([true]);
    expect(compensationOn(getCompensation())).toBe(true);
    resetSpaceState();
    expect(compensationOn(getCompensation())).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// R7 — the tools, end to end
// ---------------------------------------------------------------------------

describe('as três ferramentas usam os eixos e a compensação', () => {
  it('Mover com "Não mexer nos filhos" deixa o filho parado', () => {
    resetSpaceState();
    setCompensation({ children: true });
    const doc = new TestDoc(rigFile());
    doc.select({ ...emptySelection(), bones: ['pai'] });
    const before = boneFrame(doc.skeleton!, 'filho');

    const start = doc.skeleton!.findBone('pai')!;
    const paiX = start.worldX;
    const paiY = start.worldY;
    translateTool.onDown?.(doc, event(paiX, paiY));
    translateTool.onMove?.(doc, event(paiX + 55, paiY - 30));
    translateTool.onUp?.(doc, event(paiX + 55, paiY - 30));

    // O pai andou de verdade, exatamente o que o ponteiro andou...
    expect(doc.skeleton!.findBone('pai')!.worldX).toBeCloseTo(paiX + 55, 6);
    expect(doc.skeleton!.findBone('pai')!.worldY).toBeCloseTo(paiY - 30, 6);
    // ...e o filho não saiu do lugar.
    sameMatrix(boneFrame(doc.skeleton!, 'filho'), before, 7);
    resetSpaceState();
  });

  it('Girar com "Não mexer nos filhos" deixa o filho parado', () => {
    resetSpaceState();
    setCompensation({ children: true });
    const doc = new TestDoc(rigFile());
    doc.select({ ...emptySelection(), bones: ['pai'] });
    const before = boneFrame(doc.skeleton!, 'filho');
    const pivot = doc.skeleton!.findBone('pai')!;

    rotateTool.onDown?.(doc, event(pivot.worldX + 100, pivot.worldY));
    rotateTool.onMove?.(doc, event(pivot.worldX, pivot.worldY + 100));
    rotateTool.onUp?.(doc, event(pivot.worldX, pivot.worldY + 100));

    expect(readBone(doc, 'pai', 'rotation')).toBeCloseTo(120, 6);
    sameMatrix(boneFrame(doc.skeleton!, 'filho'), before, 7);
    resetSpaceState();
  });

  it('Escalar com "Não mexer nos filhos" deixa o filho parado', () => {
    resetSpaceState();
    setCompensation({ children: true });
    const doc = new TestDoc(rigFile());
    doc.select({ ...emptySelection(), bones: ['pai'] });
    const before = boneFrame(doc.skeleton!, 'filho');
    const bone = doc.skeleton!.findBone('pai')!;
    // Um ponto 100 unidades ao longo do eixo X do osso, e depois 160.
    const ux = bone.a / Math.hypot(bone.a, bone.c);
    const uy = bone.c / Math.hypot(bone.a, bone.c);
    scaleTool.onDown?.(doc, event(bone.worldX + ux * 100, bone.worldY + uy * 100));
    scaleTool.onMove?.(doc, event(bone.worldX + ux * 160, bone.worldY + uy * 160));
    scaleTool.onUp?.(doc, event(bone.worldX + ux * 160, bone.worldY + uy * 160));

    expect(readBone(doc, 'pai', 'scaleX')).toBeGreaterThan(1.5);
    sameMatrix(boneFrame(doc.skeleton!, 'filho'), before, 7);
    resetSpaceState();
  });

  it('sem nenhuma caixa marcada, o galho anda junto como sempre', () => {
    resetSpaceState();
    const doc = new TestDoc(rigFile());
    doc.select({ ...emptySelection(), bones: ['pai'] });
    const before = boneFrame(doc.skeleton!, 'filho');
    const start = doc.skeleton!.findBone('pai')!;
    translateTool.onDown?.(doc, event(start.worldX, start.worldY));
    translateTool.onMove?.(doc, event(start.worldX + 55, start.worldY));
    translateTool.onUp?.(doc, event(start.worldX + 55, start.worldY));
    expect(boneFrame(doc.skeleton!, 'filho').worldX).toBeCloseTo(before.worldX + 55, 6);
  });
});

// ---------------------------------------------------------------------------
// R7 — drawings and boxes
// ---------------------------------------------------------------------------

describe('compensação: desenhos e caixas', () => {
  it('acha só o que cada caixa de seleção pede', () => {
    const file = rigFile();
    const drawings = attachmentsToFix(file, 'pai', { children: false, drawings: true, boxes: false });
    expect(drawings.map((entry) => entry.attachment).sort()).toEqual(['malha', 'pano']);

    const boxes = attachmentsToFix(file, 'pai', { children: false, drawings: false, boxes: true });
    expect(boxes.map((entry) => entry.attachment)).toEqual(['caixa']);

    // `filho` não carrega slot nenhum, mas PESA na malha: ela aparece por peso.
    const byWeight = attachmentsToFix(file, 'filho', { children: false, drawings: true, boxes: true });
    expect(byWeight.map((entry) => entry.attachment)).toEqual(['malha']);

    // Com as duas desligadas não se procura nada.
    expect(attachmentsToFix(file, 'pai', { children: false, drawings: false, boxes: false }))
      .toHaveLength(0);
  });

  it('vértices soltos andam com F, e voltam ao mesmo lugar do mundo', () => {
    const before: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
    const after: Matrix2x3 = { a: 0, b: -1, c: 1, d: 0, worldX: 5, worldY: 5 };
    const fix = fixMatrix(before, after);
    const box = { type: 'boundingbox', vertices: [0, 0, 10, 0] } as never;
    const fixed = fixAttachment(box, fix, 1, true) as unknown as { vertices: number[] };
    // Vértice (0, 0): valia (0, 0) no mundo. Depois: after · F · (0,0) = (0,0).
    const v0 = { x: fixed.vertices[0]!, y: fixed.vertices[1]! };
    expect(after.a * v0.x + after.b * v0.y + after.worldX).toBeCloseTo(0, 12);
    expect(after.c * v0.x + after.d * v0.y + after.worldY).toBeCloseTo(0, 12);
    // Vértice (10, 0): valia (10, 0).
    const v1 = { x: fixed.vertices[2]!, y: fixed.vertices[3]! };
    expect(after.a * v1.x + after.b * v1.y + after.worldX).toBeCloseTo(10, 12);
    expect(after.c * v1.x + after.d * v1.y + after.worldY).toBeCloseTo(0, 12);
  });

  it('numa malha com peso só as influências DESTE osso andam', () => {
    const file = rigFile();
    const malha = file.skins![0]!.attachments!['capa']!['malha']!;
    const fix: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 100, worldY: 0 };
    // Índice 1 é `pai`. As influências 0 e 2 são dele; a 1 é de `filho`.
    const fixed = fixAttachment(malha, fix, 1, true) as unknown as {
      binding: { positions: number[] };
    };
    expect(fixed.binding.positions[0]).toBeCloseTo(103, 12);
    expect(fixed.binding.positions[1]).toBeCloseTo(4, 12);
    // A influência de `filho` fica intocada.
    expect(fixed.binding.positions[2]).toBeCloseTo(5, 12);
    expect(fixed.binding.positions[3]).toBeCloseTo(6, 12);
    expect(fixed.binding.positions[4]).toBeCloseTo(107, 12);
    // O original não foi mexido: `fixAttachment` devolve uma cópia.
    const original = malha as unknown as { binding: { positions: number[] } };
    expect(original.binding.positions[0]).toBe(3);
  });

  it('um desenho preso ao osso não sai do lugar quando o osso anda', () => {
    const doc = new TestDoc(rigFile());
    const skeleton = doc.skeleton!;
    const slot = skeleton.findSlot('capa')!;
    const before = Array.from(
      (slot.attachment as unknown as {
        computeWorldVertices(s: unknown): Float64Array;
      }).computeWorldVertices(slot),
    );

    const plan = planCompensation(doc, ['pai'], { children: false, drawings: true, boxes: false });
    setBone(doc, 'pai', { x: 10 + 63, y: 20 - 21 });
    applyCompensation(doc, plan, 'teste');

    const slotNow = doc.skeleton!.findSlot('capa')!;
    const after = Array.from(
      (slotNow.attachment as unknown as {
        computeWorldVertices(s: unknown): Float64Array;
      }).computeWorldVertices(slotNow),
    );
    expect(after).toHaveLength(before.length);
    for (let i = 0; i < before.length; i++) expect(after[i]).toBeCloseTo(before[i]!, 8);
  });

  it('com uma animação aberta os desenhos ficam de fora: não há timeline para eles', () => {
    const doc = new TestDoc(rigFile());
    doc.file.animations = [{ name: 'andar', duration: 1 }] as never;
    doc.rebuild();
    doc.animation = 'andar';
    const plan = planCompensation(doc, ['pai'], { children: true, drawings: true, boxes: true });
    // Um só osso no plano, e nenhum anexo.
    expect(plan.bones).toHaveLength(1);
    expect(plan.bones[0]!.attachments).toHaveLength(0);
    expect(plan.bones[0]!.children.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// A1 — stretch and mirror in time
// ---------------------------------------------------------------------------

/** A file with one animation and two mirrored bones. */
function animFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'perna_e', parent: 'root' },
      { name: 'perna_d', parent: 'root' },
      { name: 'cauda', parent: 'root' },
    ],
    animations: [{
      name: 'andar',
      duration: 1,
      timelines: [
        {
          type: 'bone', target: 'perna_e', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.25, value: 30 }, { time: 0.5, value: 0 }],
        },
        {
          type: 'bone', target: 'perna_d', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.25, value: -30 }, { time: 0.5, value: 0 }],
        },
        {
          type: 'bone', target: 'cauda', property: 'x',
          keys: [{ time: 0, value: 5 }, { time: 0.5, value: 9 }],
        },
      ],
    }],
  } as unknown as BoneFile;
}

const perna = boneTarget('perna_e', 'rotation');
const pernaD = boneTarget('perna_d', 'rotation');
const cauda = boneTarget('cauda', 'x');

describe('A1 — esticar e espelhar no tempo', () => {
  it('timeSpanOf acha a primeira e a última', () => {
    expect(timeSpanOf([])).toBeNull();
    expect(timeSpanOf([
      { target: perna, time: 0.5 }, { target: perna, time: 0 }, { target: perna, time: 0.25 },
    ])).toEqual({ first: 0, last: 0.5 });
  });

  it('esticar por 2 segura a primeira chave e dobra o resto', () => {
    const file = animFile();
    const refs = [
      { target: perna, time: 0 }, { target: perna, time: 0.25 }, { target: perna, time: 0.5 },
    ];
    // t -> 0 + (t - 0) * 2: 0, 0.5, 1.
    stretchSelection(file, 'andar', refs, 2);
    expect(keyTimes(file, 'andar', perna)).toEqual([0, 0.5, 1]);
  });

  it('esticar por 0,5 encolhe, e a primeira chave não sai do lugar', () => {
    const file = animFile();
    const refs = [
      { target: perna, time: 0.25 }, { target: perna, time: 0.5 },
    ];
    // A primeira DA SELEÇÃO é 0,25: t -> 0,25 + (t - 0,25) * 0,5.
    // 0,25 fica; 0,5 vira 0,375.
    stretchSelection(file, 'andar', refs, 0.5);
    expect(keyTimes(file, 'andar', perna)).toEqual([0, 0.25, 0.375]);
  });

  it('esticar levanta a duração quando a chave passa do fim', () => {
    const file = animFile();
    const refs = [
      { target: perna, time: 0 }, { target: perna, time: 0.5 },
    ];
    stretchSelection(file, 'andar', refs, 4);
    // 0,5 * 4 = 2, que passa da duração escrita (1). A chave de 0,25 não estava
    // na seleção e por isso não se mexe.
    expect(keyTimes(file, 'andar', perna)).toEqual([0, 0.25, 2]);
    expect(durationOf(findAnimation(file, 'andar')!)).toBeCloseTo(2, 9);
  });

  it('um fator inválido não mexe em nada', () => {
    const file = animFile();
    const refs = [{ target: perna, time: 0 }, { target: perna, time: 0.5 }];
    expect(stretchSelection(file, 'andar', refs, 0)).toEqual([]);
    expect(stretchSelection(file, 'andar', refs, Number.NaN)).toEqual([]);
    expect(keyTimes(file, 'andar', perna)).toEqual([0, 0.25, 0.5]);
  });

  it('espelhar no tempo inverte a ordem sem tirar o bloco do lugar', () => {
    const file = animFile();
    const refs = [
      { target: perna, time: 0 }, { target: perna, time: 0.25 }, { target: perna, time: 0.5 },
    ];
    // pivô = (0 + 0,5) / 2 = 0,25. t -> 0,25 - (t - 0,25).
    // 0 -> 0,5 ; 0,25 -> 0,25 ; 0,5 -> 0.
    mirrorKeysInTime(file, 'andar', refs);
    expect(keyTimes(file, 'andar', perna)).toEqual([0, 0.25, 0.5]);
    // Os TEMPOS são os mesmos; os VALORES é que trocaram de ponta.
    expect(valueAt(file, 'andar', 0, perna)).toBeCloseTo(0, 9);
    expect(valueAt(file, 'andar', 0.25, perna)).toBeCloseTo(30, 9);

    // Com valores diferentes nas pontas a inversão fica visível.
    const outro = animFile();
    const refsCauda = [{ target: cauda, time: 0 }, { target: cauda, time: 0.5 }];
    mirrorKeysInTime(outro, 'andar', refsCauda);
    expect(valueAt(outro, 'andar', 0, cauda)).toBeCloseTo(9, 9);
    expect(valueAt(outro, 'andar', 0.5, cauda)).toBeCloseTo(5, 9);
  });

  it('espelhar no tempo com nada escolhido não faz nada', () => {
    const file = animFile();
    expect(mirrorKeysInTime(file, 'andar', [])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// A1 — mirrored left / right names
// ---------------------------------------------------------------------------

describe('A1 — pares de nome espelhado', () => {
  it('lê a regra que o usuário escreve, e ignora o que está pela metade', () => {
    expect(parseMirrorRules('_e/_d, _l/_r')).toEqual([
      { left: '_e', right: '_d' }, { left: '_l', right: '_r' },
    ]);
    // Sem barra, lados iguais, e um lado vazio: os dois primeiros somem, o
    // terceiro vale.
    expect(parseMirrorRules('sem-barra, _x/_x, /_b')).toEqual([{ left: '', right: '_b' }]);
    expect(parseMirrorRules('')).toEqual([]);
  });

  it('acha o nome espelhado dos dois lados', () => {
    const regra = { left: '_e', right: '_d' };
    expect(mirrorNameUnder('braco_e', regra)).toBe('braco_d');
    expect(mirrorNameUnder('braco_d', regra)).toBe('braco_e');
    // Nenhum dos dois finais: nada casa.
    expect(mirrorNameUnder('cauda', regra)).toBeNull();
  });

  it('a regra de lado vazio tira o final antes de acrescentar', () => {
    // "leg" e "leg_b": a regra é `/_b`.
    const regra = { left: '', right: '_b' };
    expect(mirrorNameUnder('leg_b', regra)).toBe('leg');
    expect(mirrorNameUnder('leg', regra)).toBe('leg_b');
  });

  it('lista os pares que existem, cada nome uma vez só', () => {
    const nomes = ['perna_e', 'perna_d', 'braco_l', 'braco_r', 'cauda', 'sozinho_e'];
    const pares = findMirrorPairs(nomes, parseMirrorRules('_e/_d, _l/_r'));
    expect(pares.map((par) => `${par.a}+${par.b}`)).toEqual(['perna_e+perna_d', 'braco_l+braco_r']);
    // `sozinho_e` não tem par no arquivo, então não entra; `cauda` também não.
  });

  it('com a regra de lado vazio, um nome não vira par de si mesmo', () => {
    const pares = findMirrorPairs(['leg', 'leg_b', 'leg_b_b'], parseMirrorRules('/_b'));
    expect(pares.map((par) => `${par.a}+${par.b}`)).toEqual(['leg+leg_b']);
  });

  it('animatedBones lista os ossos que a animação mexe, sem repetir', () => {
    expect(animatedBones(animFile(), 'andar')).toEqual(['perna_e', 'perna_d', 'cauda']);
  });

  it('espelhar esquerda e direita troca as duas linhas de tempo', () => {
    const file = animFile();
    const pares = findMirrorPairs(animatedBones(file, 'andar'), parseMirrorRules('_e/_d'));
    expect(swapMirroredBones(file, 'andar', pares)).toBe(2);

    // O que era da perna esquerda agora é da direita.
    expect(valueAt(file, 'andar', 0.25, pernaD)).toBeCloseTo(30, 9);
    expect(valueAt(file, 'andar', 0.25, perna)).toBeCloseTo(-30, 9);
    // A cauda, que não tem par, ficou onde estava.
    expect(valueAt(file, 'andar', 0, cauda)).toBeCloseTo(5, 9);
  });

  it('espelhar duas vezes devolve tudo ao lugar', () => {
    const file = animFile();
    const pares = findMirrorPairs(animatedBones(file, 'andar'), parseMirrorRules('_e/_d'));
    swapMirroredBones(file, 'andar', pares);
    swapMirroredBones(file, 'andar', pares);
    expect(valueAt(file, 'andar', 0.25, perna)).toBeCloseTo(30, 9);
    expect(valueAt(file, 'andar', 0.25, pernaD)).toBeCloseTo(-30, 9);
  });

  it('sem par nenhum, nada troca de mãos', () => {
    const file = animFile();
    expect(swapMirroredBones(file, 'andar', [])).toBe(0);
  });

  // -- item 2: colar espelhado ---------------------------------------------

  it('mirrorClipboard troca o alvo pelo par, sem tocar no valor', () => {
    const file = animFile();
    const clip = copyKeys(file, 'andar', [
      { target: perna, time: 0 },
      { target: perna, time: 0.25 },
    ]);
    const espelhado = mirrorClipboard(clip, parseMirrorRules('_e/_d'));
    expect(espelhado.items.map((item) => item.target)).toEqual([pernaD, pernaD]);
    // O valor atravessa direto — pose de repouso já espelhada (§ swapMirroredBones).
    expect(espelhado.items.map((item) => item.key.value)).toEqual([0, 30]);
  });

  it('um alvo sem par cola com o mesmo nome', () => {
    const file = animFile();
    const clip = copyKeys(file, 'andar', [{ target: cauda, time: 0 }]);
    const espelhado = mirrorClipboard(clip, parseMirrorRules('_e/_d'));
    expect(espelhado.items[0].target).toEqual(cauda);
  });

  it('colar espelhado escreve no osso par, sem mexer no original', () => {
    const file = animFile();
    const clip = copyKeys(file, 'andar', [{ target: perna, time: 0.25 }]);
    const espelhado = mirrorClipboard(clip, parseMirrorRules('_e/_d'));
    pasteKeys(file, 'andar', espelhado, 0.5);

    expect(valueAt(file, 'andar', 0.5, pernaD)).toBe(30);
    expect(keyTimes(file, 'andar', perna)).toEqual([0, 0.25, 0.5]);
  });
});

// ---------------------------------------------------------------------------
// A6 — closing the loop
// ---------------------------------------------------------------------------

/** The `curve` of the key at `time`, straight from the file. */
function curveAt(file: BoneFile, animation: string, target = cauda, time = 0): unknown {
  const timeline = findTimeline(file, animation, target) as unknown as {
    keys: Array<{ time: number; curve?: unknown }>;
  } | null;
  return timeline?.keys.find((key) => Math.abs(key.time - time) < 1e-9)?.curve;
}

describe('A6 — fechar o ciclo', () => {
  it('copia a primeira chave para o fim da animação', () => {
    const file = animFile();
    const report = closeLoopOn(file, 'andar', cauda);
    expect(report.keyed).toBe(true);
    // A duração é 1; a primeira chave vale 5, então em 1 s o valor volta a 5.
    expect(keyTimes(file, 'andar', cauda)).toEqual([0, 0.5, 1]);
    expect(valueAt(file, 'andar', 1, cauda)).toBeCloseTo(5, 9);
  });

  it('casa as tangentes: a chegada tem a mesma velocidade da saída', () => {
    const file = animFile();
    // Uma curva bem torta na primeira chave, para a tangente ser reconhecível.
    const timeline = findTimeline(file, 'andar', cauda) as unknown as {
      keys: Array<{ time: number; value: number; curve?: number[] }>;
    };
    // Chave em 0 (t=0, v=5) até 0,5 (v=9). Ponto de controle 1 em (0,1; 6).
    timeline.keys[0]!.curve = [0.1, 6, 0.4, 8];

    const report = closeLoopOn(file, 'andar', cauda);
    expect(report.keyed).toBe(true);
    expect(report.tangent).toBe(true);

    // Tangente de saída da primeira chave: T = P1 - P0 = (0,1 - 0 ; 6 - 5)
    //                                        = (0,1 ; 1).
    // Segmento de fecho: de (0,5 ; 9) até (1 ; 5). O segundo ponto de controle
    // tem que ser P3 - T = (1 - 0,1 ; 5 - 1) = (0,9 ; 4).
    const closing = curveAt(file, 'andar', cauda, 0.5) as number[];
    expect(closing[2]).toBeCloseTo(0.9, 9);
    expect(closing[3]).toBeCloseTo(4, 9);
  });

  it('encurta a tangente, sem torcer a direção, quando não cabe', () => {
    // Saída com uma alça enorme (0,8 de largura) e um fecho estreito.
    // t0 = 0, v0 = 0; t1 = 1, v1 = 10; P1 = (0,8 ; 4) -> T = (0,8 ; 4).
    // Fecho de tPrev = 0,9 até tEnd = 1: largura 0,1.
    // cx1 do fecho, vindo de um segmento linear, é 0,9 + 0,1/3 = 0,9333333.
    // room = 1 - 0,9333333 = 0,0666667; k = room / 0,8 = 0,0833333.
    // cx2 = 1 - 0,8·k = 1 - 0,0666667 = 0,9333333 (encosta em cx1).
    // cy2 = vEnd - 4·k = 0 - 0,3333333 = -0,3333333.
    const tangent = outgoingTangent([0.8, 4, 0.9, 9], 1, 0, [0], 1, [10]);
    expect(tangent).not.toBeNull();
    expect(tangent![0]!.dx).toBeCloseTo(0.8, 12);
    expect(tangent![0]!.dy).toBeCloseTo(4, 12);

    const curve = closingCurve(undefined, tangent!, 1, 0.9, [10], 1, [0]) as number[];
    expect(curve[2]).toBeCloseTo(0.9333333333, 8);
    expect(curve[3]).toBeCloseTo(-0.3333333333, 8);
    // A direção da tangente é a mesma: (cx2 - tEnd, cy2 - vEnd) é T · (-k).
    const dx = 1 - curve[2]!;
    const dy = 0 - curve[3]!;
    expect(dy / dx).toBeCloseTo(4 / 0.8, 6);
  });

  it('uma primeira chave em degrau não ganha tangente, só o valor', () => {
    const file = animFile();
    const timeline = findTimeline(file, 'andar', cauda) as unknown as {
      keys: Array<{ time: number; curve?: unknown }>;
    };
    timeline.keys[0]!.curve = 'stepped';
    const report = closeLoopOn(file, 'andar', cauda);
    expect(report.keyed).toBe(true);
    expect(report.tangent).toBe(false);
  });

  it('uma linha com uma chave só é fechada em valor, sem tangente', () => {
    const file = animFile();
    const timeline = findTimeline(file, 'andar', cauda) as unknown as {
      keys: Array<{ time: number; value: number }>;
    };
    timeline.keys.length = 1;
    const report = closeLoopOn(file, 'andar', cauda);
    expect(report.keyed).toBe(true);
    expect(report.tangent).toBe(false);
    expect(keyTimes(file, 'andar', cauda)).toEqual([0, 1]);
  });

  it('recusa quando a linha não existe, e diz por quê', () => {
    const file = animFile();
    const report = closeLoopOn(file, 'andar', boneTarget('nao_existe', 'x'));
    expect(report.keyed).toBe(false);
    expect(report.refusal).toBe('sem linha');
  });

  it('recusa quando a duração não passa da primeira chave', () => {
    const file = animFile();
    findAnimation(file, 'andar')!.duration = 0;
    const report = closeLoopOn(file, 'andar', cauda);
    expect(report.keyed).toBe(false);
    expect(report.refusal).toBe('duração curta');
  });

  it('fecha várias linhas de uma vez e devolve um relatório por linha', () => {
    const file = animFile();
    const targets = allTargetsOf(file, 'andar');
    expect(targets).toHaveLength(3);
    const reports = closeLoop(file, 'andar', targets);
    expect(reports.filter((report) => report.keyed)).toHaveLength(3);
    // Cada linha ganhou a chave do fim.
    expect(keyTimes(file, 'andar', perna)).toEqual([0, 0.25, 0.5, 1]);
    expect(valueAt(file, 'andar', 1, perna)).toBeCloseTo(0, 9);
  });

  it('fechar duas vezes não cria uma segunda chave no fim', () => {
    const file = animFile();
    closeLoopOn(file, 'andar', cauda);
    closeLoopOn(file, 'andar', cauda);
    expect(keyTimes(file, 'andar', cauda)).toEqual([0, 0.5, 1]);
  });
});

// ---------------------------------------------------------------------------
// R2 — bone colour and icon
// ---------------------------------------------------------------------------

describe('R2 — cor e ícone do osso', () => {
  it('a lista de ícones começa em "Nenhum" e não repete id', () => {
    expect(BONE_ICONS[0]!.id).toBe('');
    expect(BONE_ICONS[0]!.label).toBe('Nenhum');
    const ids = BONE_ICONS.map((icon) => icon.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Toda entrada tem palavra escrita: nunca só o desenho.
    for (const icon of BONE_ICONS) expect(icon.label.length).toBeGreaterThan(0);
  });

  it('um ícone desconhecido vira a primeira letra, em vez de nada', () => {
    expect(boneIconGlyph('ik')).toBe('◈');
    expect(boneIconGlyph('')).toBe('');
    expect(boneIconGlyph(null)).toBe('');
    expect(boneIconGlyph('inventado')).toBe('I');
    expect(boneIconLabel('mao')).toBe('Mão');
    expect(boneIconLabel(null)).toBe('Nenhum');
    expect(boneIconLabel('inventado')).toBe('inventado');
  });

  it('a cor do osso vira CSS, e nunca fica invisível', () => {
    expect(boneColorCss([1, 0, 0, 1])).toBe('rgba(255, 0, 0, 1)');
    // Alfa zero seria um osso que some da tela e não dá para escolher de volta.
    expect(boneColorCss([0, 0, 0, 0])).toBe('rgba(0, 0, 0, 0.35)');
    // Sem cor escrita, o padrão do formato (spec 4.2).
    expect(boneColorCss(null)).toBe('rgba(156, 156, 156, 1)');
    expect(DEFAULT_BONE_COLOR[3]).toBe(1);
  });

  it('o painel Propriedades mostra os dois campos, com rótulo em português', () => {
    const groups = boneFields(rigFile(), 'pai');
    const marking = groups.find((group) => group.title === 'Marcação no editor');
    expect(marking).toBeDefined();
    const keys = marking!.fields.map((field) => field.key);
    expect(keys).toEqual(['boneColor', 'icon']);

    const color = marking!.fields[0]!;
    expect(color.label).toBe('Cor do osso');
    expect(color.kind).toBe('color');
    expect(color.pointer).toBe('/bones/1/color');

    const icon = marking!.fields[1]!;
    expect(icon.label).toBe('Ícone');
    expect(icon.kind).toBe('select');
    expect(icon.pointer).toBe('/bones/1/icon');
    // "Nenhum" apaga o campo em vez de gravar uma string vazia.
    expect(icon.dropWhenEmpty).toBe(true);
    expect(icon.options).toHaveLength(BONE_ICONS.length);
  });
});


// ---------------------------------------------------------------------------
// Degrau 6 — a faixa da entidade (6.4) e a chave de sequência (6.6)
// ---------------------------------------------------------------------------

import {
  activeRuns, bandMenu, entityBand, entityShortName, entitySlots, missingChildNotice,
} from '../src/anim/entity-band.js';
import {
  DEFAULT_SEQUENCE_MODE, SEQUENCE_MODES, activeAttachmentOf, describeSequenceKey,
  findSequence, noSequenceNotice, sequenceCount, sequenceKeyValue, sequenceModeLabel,
} from '../src/anim/sequence-key.js';

/** Um herói com uma mochila (entidade) e uma boca (sequência de imagens). */
function comEntidade(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'costas', parent: 'root' }, { name: 'cabeca', parent: 'root' }],
    slots: [
      { name: 'mochila', bone: 'costas' },
      { name: 'boca', bone: 'cabeca', attachment: 'boca' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        mochila: {
          jetpack: {
            type: 'skeleton', uri: 'entidades/jetpack.bone',
            animation: 'parado', timeScale: 1, loop: true,
          },
        },
        boca: {
          boca: {
            type: 'region', path: 'boca_',
            sequence: { count: 6, start: 1, digits: 2, setup: 0 },
          },
        },
      },
    }],
    animations: [{
      name: 'voar',
      duration: 2,
      timelines: [
        {
          type: 'slot', target: 'mochila', property: 'attachment',
          keys: [{ time: 0, value: null }, { time: 0.5, value: 'jetpack' }, { time: 1.2, value: null }],
        },
      ],
    }],
  } as unknown as BoneFile;
}

describe('a faixa da entidade — tarefa 6.4, spec 7.11', () => {
/**
 * A entidade é uma imagem com relógio: o slot mostra um esqueleto inteiro. Na
 * folha ela não é uma fileira de losangos — é uma FAIXA, que começa onde ela
 * foi solta, acaba onde sai de cena, e traz escrito o nome da animação que o
 * filho toca. Nenhum campo novo (E13): tudo sai da chave `slot/attachment`, de
 * `nested/animation` e de `nested/timeScale`.
 */
  it('acha os slots que mostram um esqueleto, e só eles', () => {
    const achadas = entitySlots(comEntidade());
    expect(achadas).toHaveLength(1);
    expect(achadas[0].slot).toBe('mochila');
    expect(achadas[0].uri).toBe('entidades/jetpack.bone');
    expect(achadas[0].animation).toBe('parado');
    expect(achadas[0].timeScale).toBe(1);
  });

  it('a faixa começa na chave que mostra a entidade, e acaba onde ela sai', () => {
    const file = comEntidade();
    const entidade = entitySlots(file)[0];
    const faixa = entityBand(file, 'voar', entidade);
    expect(faixa).toHaveLength(1);
    expect(faixa[0].from).toBe(0.5);
    expect(faixa[0].to).toBe(1.2);
  });

  it('sem chave de troca, a faixa mostra a animação que o anexo pede', () => {
    const file = comEntidade();
    const faixa = entityBand(file, 'voar', entitySlots(file)[0]);
    expect(faixa[0].animation).toBe('parado');
    expect(faixa[0].source).toBe('anexo');
    expect(faixa[0].text).toBe('jetpack: parado');
  });

  it('a chave `nested/animation` ganha do anexo, e corta a faixa em dois', () => {
    const file = comEntidade();
    const voar = file.animations![0] as unknown as { timelines: unknown[] };
    voar.timelines.push({
      type: 'nested', target: 'mochila', property: 'animation',
      keys: [{ time: 0.5, value: 'parado' }, { time: 0.8, value: 'acender' }],
    });
    const faixa = entityBand(file, 'voar', entitySlots(file)[0]);
    expect(faixa.map((s) => [s.from, s.to, s.animation]))
      .toEqual([[0.5, 0.8, 'parado'], [0.8, 1.2, 'acender']]);
    expect(faixa[1].source).toBe('chave');
    expect(faixa[1].text).toBe('jetpack: acender');
  });

  it('a chave com valor vazio ganha, e não cai de volta para o anexo (9.9)', () => {
    const file = comEntidade();
    const voar = file.animations![0] as unknown as { timelines: unknown[] };
    voar.timelines.push({
      type: 'nested', target: 'mochila', property: 'animation',
      keys: [{ time: 0.5, value: null }],
    });
    const faixa = entityBand(file, 'voar', entitySlots(file)[0]);
    expect(faixa[0].animation).toBe(null);
    expect(faixa[0].source).toBe('chave');
    expect(faixa[0].text).toContain('(nenhuma)');
  });

  it('a velocidade vai escrita quando não é 1, e só então', () => {
    const file = comEntidade();
    const voar = file.animations![0] as unknown as { timelines: unknown[] };
    voar.timelines.push({
      type: 'nested', target: 'mochila', property: 'timeScale',
      keys: [{ time: 0.5, value: 2 }],
    });
    const faixa = entityBand(file, 'voar', entitySlots(file)[0]);
    expect(faixa[0].timeScale).toBe(2);
    expect(faixa[0].text).toContain('×2');
    expect(faixa[0].title).toContain('2× a velocidade');
  });

  it('com `inheritAnimation` a faixa diz "pelo pai", e NÃO inventa um nome', () => {
    // Regra 21. Qual animação o filho toca depende de qual o PAI está tocando,
    // e isso não é dado desta animação: escrever um nome seria improvisar.
    const file = comEntidade();
    const anexo = file.skins![0].attachments!['mochila']['jetpack'] as unknown as Record<string, unknown>;
    anexo['inheritAnimation'] = true;
    const faixa = entityBand(file, 'voar', entitySlots(file)[0]);
    expect(faixa[0].source).toBe('pai');
    expect(faixa[0].text).toContain('pelo pai');
    expect(faixa[0].title).toContain('não vai escrita aqui');
  });

  it('a corrida é a unidade: duas chaves seguidas com o mesmo anexo são um trecho só', () => {
    // Apêndice C 1: o relógio do filho começa no INÍCIO da corrida. Duas
    // chaves iguais seguidas não zeram o relógio duas vezes.
    const file = comEntidade();
    const linha = (file.animations![0] as unknown as { timelines: Array<{ keys: unknown[] }> }).timelines[0];
    linha.keys = [
      { time: 0, value: null }, { time: 0.5, value: 'jetpack' },
      { time: 0.8, value: 'jetpack' }, { time: 1.2, value: null },
    ];
    expect(activeRuns(file, 'voar', 'mochila', 'jetpack')).toEqual([{ from: 0.5, to: 1.2 }]);
  });

  it('sem chave de anexo nenhuma, vale o setup do slot', () => {
    const file = comEntidade();
    (file.animations![0] as unknown as { timelines: unknown[] }).timelines = [];
    // O slot `mochila` nasce vazio: a entidade não entra nesta animação.
    expect(activeRuns(file, 'voar', 'mochila', 'jetpack')).toEqual([]);
    file.slots![0].attachment = 'jetpack';
    expect(activeRuns(file, 'voar', 'mochila', 'jetpack')).toEqual([{ from: 0, to: 2 }]);
  });

  it('a primeira chave já mostrando a entidade faz a faixa começar em ZERO (9.10)', () => {
    const file = comEntidade();
    const linha = (file.animations![0] as unknown as { timelines: Array<{ keys: unknown[] }> }).timelines[0];
    linha.keys = [{ time: 0.3, value: 'jetpack' }, { time: 1, value: null }];
    expect(activeRuns(file, 'voar', 'mochila', 'jetpack')).toEqual([{ from: 0, to: 1 }]);
  });

  it('o uri vira nome curto na faixa', () => {
    expect(entityShortName('entidades/jetpack.bone')).toBe('jetpack');
    expect(entityShortName('tocha.bonez')).toBe('tocha');
  });
});

describe('o botão direito na faixa lista as animações do filho — E12b', () => {
  it('a primeira opção é sempre (nenhuma), e ela grava o valor vazio', () => {
    const itens = bandMenu(['parado', 'acender'], 'parado');
    expect(itens[0].animation).toBe(null);
    expect(itens[0].label).toBe('(nenhuma)');
    expect(itens.map((i) => i.label)).toEqual(['(nenhuma)', 'parado', 'acender']);
  });

  it('a que vale agora vem marcada, e só ela', () => {
    const itens = bandMenu(['parado', 'acender'], 'acender');
    expect(itens.filter((i) => i.current).map((i) => i.label)).toEqual(['acender']);
    expect(bandMenu(['parado'], null)[0].current).toBe(true);
  });

  it('cada item se explica: nenhum entra mudo no menu', () => {
    for (const item of bandMenu(['acender'], null)) {
      expect(item.hint.length, item.label).toBeGreaterThan(10);
    }
  });

  it('filho que o editor não abriu: o menu DIZ isso, e não fica mudo', () => {
    // Regra 21. Um menu vazio faria pensar que a entidade não tem animação
    // nenhuma, quando o que houve foi o editor não achar o arquivo.
    expect(bandMenu([], null)).toHaveLength(1);
    const recado = missingChildNotice('entidades/jetpack.bone');
    expect(recado).toContain('entidades/jetpack.bone');
    expect(recado).toContain('Abra a pasta do projeto');
  });
});

describe('a chave de sequência de imagens — tarefa 6.6, G12, spec 7.10 e 9.6', () => {
/**
 * *"A boca: uma chave para cada vez que a imagem muda — como opção"*, palavra
 * do Humberto. A sequência já existia no formato, no runtime e como alvo em
 * `keying.ts`; o que faltava era **porta**: quem quisesse fazer a boca falar
 * tinha de escrever a timeline à mão no `.bone`.
 */
  it('acha a sequência do desenho, com a skin e quantas imagens', () => {
    const achada = findSequence(comEntidade(), 'boca', 'boca');
    expect(achada).toEqual({ skin: 'default', count: 6, setup: 0 });
  });

  it('um desenho comum não tem sequência, e o programa DIZ por quê', () => {
    // Regra 21: uma chave `sequence` num desenho sem `sequence` seria recusada
    // ao ler (L1 de 9.6). A janela não abre, e o rodapé explica.
    const file = comEntidade();
    delete (file.skins![0].attachments!['boca']['boca'] as unknown as Record<string, unknown>)['sequence'];
    expect(findSequence(file, 'boca', 'boca')).toBe(null);
    expect(noSequenceNotice('boca')).toContain('não é uma sequência');
    expect(noSequenceNotice('boca')).toContain('7.10');
    expect(noSequenceNotice(null)).toContain('não está mostrando desenho nenhum');
  });

  it('`frames` manda sobre `count`, como 7.10 diz', () => {
    expect(sequenceCount({ count: 6 })).toBe(6);
    expect(sequenceCount({ count: 6, frames: ['a', 'b'] })).toBe(2);
    expect(sequenceCount(undefined)).toBe(0);
  });

  it('o desenho ativo sai da chave de anexo, e sem ela do setup', () => {
    const file = comEntidade();
    expect(activeAttachmentOf(file, 'voar', 0.6, 'mochila')).toBe('jetpack');
    expect(activeAttachmentOf(file, 'voar', 1.5, 'mochila')).toBe(null);
    // A boca não tem timeline de anexo: vale o setup.
    expect(activeAttachmentOf(file, 'voar', 1.5, 'boca')).toBe('boca');
    expect(activeAttachmentOf(file, null, 0, 'boca')).toBe('boca');
  });

  it('o valor da chave deixa de fora o que já é o padrão', () => {
    // Um arquivo não deve carregar um campo que diz o que o padrão já diz.
    expect(sequenceKeyValue('hold', 0, 0, 6)).toEqual({});
    expect(sequenceKeyValue('loop', 2, 0.08, 6)).toEqual({ mode: 'loop', index: 2, delay: 0.08 });
  });

  it('a imagem é presa à sequência, e a espera nunca é negativa', () => {
    expect(sequenceKeyValue('loop', 99, 0, 6).index).toBe(5);
    expect(sequenceKeyValue('loop', -3, 0, 6).index).toBeUndefined();
    expect(sequenceKeyValue('loop', 1, -1, 6).delay).toBeUndefined();
  });

  it('são os sete modos da spec, cada um com nome e explicação em português', () => {
    expect(SEQUENCE_MODES.map((m) => m.id)).toEqual([
      'hold', 'once', 'loop', 'pingpong', 'onceReverse', 'loopReverse', 'pingpongReverse',
    ]);
    expect(SEQUENCE_MODES[0].id).toBe(DEFAULT_SEQUENCE_MODE);
    for (const mode of SEQUENCE_MODES) {
      expect(mode.label, mode.id).not.toBe(mode.id);
      expect(mode.hint.length, mode.id).toBeGreaterThan(10);
    }
    expect(sequenceModeLabel('loop')).toBe('Repetir');
    expect(sequenceModeLabel('inventado')).toBe('inventado');
  });

  it('o rodapé diz o que a chave vai fazer, e não só "pronto"', () => {
    // Uma chave de sequência é invisível na cena até o tocador andar: sem a
    // frase não há como conferir que o modo escolhido foi o que entrou.
    const parada = describeSequenceKey('boca', sequenceKeyValue('hold', 2, 0, 6), 6, 0.5);
    expect(parada).toContain('imagem 3 de 6');
    expect(parada).toContain('0,50 s');
    expect(parada).toContain('parada nessa imagem');

    const andando = describeSequenceKey('boca', sequenceKeyValue('loop', 0, 0.08, 6), 6, 0.5);
    expect(andando).toContain('repetir');
    expect(andando).toContain('0,08 s');
  });
});
