/**
 * Cena: escolher, ver e travar — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote0-selecao-e-trava`, `lote7-ver-e-travar`, `lote42-clonar-guias-familia`.
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { loadAnimationsFor, loadSkeletonData, Skeleton } from '../../runtime/src/index.js';
import type { AtlasData, AtlasPageData, BoneFile, SkeletonData } from '../../runtime/src/index.js';
import { emptySelection, readEditorState } from '../src/contract.js';
import type { Command, EditorDoc, Selection, ToolEvent } from '../src/contract.js';
import { NO_LOCKS, pickAll, pickInRect, selectionForPicks, pickAt } from '../src/viewport/picking.js';
import { DEFAULT_VIEW, changeViewSettings, currentLocks, isBoneLocked, isSlotLocked, parseViewSettings, readViewState, resetViewSettings, setBoneLocked, setSlotLocked, toggleViewKey, viewSettings, CLEAN_KEYS, hideSelected, isBoneHidden, isSlotHidden, lockOthers, lockSelected, namesOfSelection, showAll, soloSelected, toggleCleanView, unlockAll, setViewSettings, writeViewState } from '../src/viewport/onion.js';
import type { ViewSettings } from '../src/viewport/onion.js';
import { selectTool } from '../src/viewport/tools/select.js';
import { Reparent, setupWorldMatrices } from '../src/doc/reparent.js';
import { itManual } from './manual-pausado.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Doc } from '../src/doc/document.js';
import { CloneDrag, ancestorsOf, descendantsOf, selectChildren, selectParents } from '../src/doc/duplicate.js';
import { addGuide, guideFromRuler, guideLabel, parseGuides, rulerAt, snapPoint, snapToGuides } from '../src/viewport/guides-model.js';
import { clonesUnderPointer, snapDelta, translateTool } from '../src/viewport/tools/translate.js';
import { editMenu, flatEntries, viewMenu } from '../src/ui/menus.js';

// ---------------------------------------------------------------------------
// selecao e trava (lote 0) — era `lote0-selecao-e-trava.test.ts`
// ---------------------------------------------------------------------------

describe('selecao e trava (lote 0)', () => {
/**
 * Lote 0 da pesquisa de menus: retângulo de seleção, travar ossos e desenhos,
 * e "virar filho" com a tecla P.
 *
 * Sem DOM. Cada número esperado está contado à mão no comentário acima da
 * asserção, para um teste que falha dizer qual regra quebrou.
 */
// ---------------------------------------------------------------------------
// Um esqueleto pequeno para os testes
// ---------------------------------------------------------------------------

/**
 *   root            na origem
 *   +-- hips        em (0, 90), comprimento 10
 *   |   +-- torso   90 graus, comprimento 70: aponta para cima
 *   +-- braco       em (200, 0), comprimento 40
 *   +-- caixa_osso  em (-200, 0), carrega a caixa de colisão
 *
 * Slot `caixa` no `caixa_osso`, com uma caixa 20x20 centrada no osso.
 * Slot `desenho` no `braco`, com uma região 30x30 (sem imagem: não desenha,
 * mas o `computeWorldVertices` existe e o retângulo a encontra).
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', x: 0, y: 90, length: 10 },
      { name: 'torso', parent: 'hips', rotation: 90, length: 70 },
      { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 },
      { name: 'caixa_osso', parent: 'root', x: -200, y: 0 },
    ],
    slots: [
      { name: 'caixa', bone: 'caixa_osso', attachment: 'caixa' },
      { name: 'desenho', bone: 'braco', attachment: 'desenho' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        caixa: { caixa: { type: 'boundingbox', shape: 'rectangle', width: 20, height: 20 } },
        desenho: { desenho: { type: 'region', path: 'x', width: 30, height: 30 } },
      },
    }],
  } as BoneFile;
}

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
    command.apply(this);
    this.done.push(command);
    this.undone.length = 0;
    this.dirty = true;
    if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }
  undo(): void {
    const command = this.done.pop();
    if (command === undefined) return;
    command.revert(this);
    this.undone.push(command);
    if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }
  redo(): void {
    const command = this.undone.pop();
    if (command === undefined) return;
    command.apply(this);
    this.done.push(command);
    if (command.kind === 'structure') this.rebuild();
    else this.repose();
  }
  get canUndo(): boolean { return this.done.length > 0; }
  get canRedo(): boolean { return this.undone.length > 0; }
  get undoLabel(): string | null { return this.done[this.done.length - 1]?.label ?? null; }
  get redoLabel(): string | null { return this.undone[this.undone.length - 1]?.label ?? null; }
  get undoCount(): number { return this.done.length; }

  rebuild(): void {
    this.skeletonData = loadSkeletonData(this.file);
    this.instance = new Skeleton(this.skeletonData);
    this.instance.updateWorldTransform(this.time);
  }
  rebuildAnimations(): void {
    const data = this.skeletonData;
    if (data === null) { this.rebuild(); return; }
    data.replaceAnimations(loadAnimationsFor(data, this.file).animations);
    this.repose();
  }
  repose(): void { this.instance?.updateWorldTransform(this.time); }
  on(): () => void { return () => {}; }
}

function event(x: number, y: number, extra: Partial<ToolEvent> = {}): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1, ...extra };
}

function parentOf(doc: TestDoc, bone: string): string | undefined {
  return doc.file.bones.find((b) => b.name === bone)?.parent;
}

beforeEach(() => {
  resetViewSettings();
});

// ---------------------------------------------------------------------------
// O retângulo
// ---------------------------------------------------------------------------

describe('retângulo de seleção (pickInRect)', () => {
  it('pega os ossos cuja raiz cai dentro, em qualquer ordem de cantos', () => {
    const doc = new TestDoc(testFile());
    // root em (0,0), hips em (0,90), torso em (0,100). Caixa de -10..10 x -10..120
    // cobre os três; braco (200,0) e caixa_osso (-200,0) ficam fora.
    const hits = pickInRect(doc.skeleton, { x1: 10, y1: 120, x2: -10, y2: -10 });
    const bones = hits.filter((h) => h.kind === 'bone').map((h) => h.bone);
    // Lote 60a: a raiz é o mundo, e o retângulo não a pega mais.
    expect(bones).toEqual(['hips', 'torso']);
  });

  it('pega um desenho quando o retângulo só encosta num canto dele', () => {
    const doc = new TestDoc(testFile());
    // A região 30x30 no braco vai de x 185..215. Um retângulo 210..260 toca o
    // canto direito dela, e não toca a raiz do braco (200,0)? Toca sim, x=200
    // está fora de 210..260. Então só o desenho entra, não o osso.
    const hits = pickInRect(doc.skeleton, { x1: 210, y1: -50, x2: 260, y2: 50 });
    expect(hits.map((h) => `${h.kind}:${h.slot ?? h.bone}`)).toEqual(['attachment:desenho']);
  });

  it('pega a caixa de colisão como caixa, não como desenho', () => {
    const doc = new TestDoc(testFile());
    const hits = pickInRect(doc.skeleton, { x1: -230, y1: -30, x2: -170, y2: 30 });
    expect(hits.map((h) => h.kind)).toEqual(['boundingbox', 'bone']);
    expect(hits[0].slot).toBe('caixa');
    expect(hits[1].bone).toBe('caixa_osso');
  });

  it('um retângulo vazio não pega nada', () => {
    const doc = new TestDoc(testFile());
    expect(pickInRect(doc.skeleton, { x1: 500, y1: 500, x2: 600, y2: 600 })).toEqual([]);
    expect(pickInRect(null, { x1: 0, y1: 0, x2: 1, y2: 1 })).toEqual([]);
  });
});

describe('selectionForPicks', () => {
  const hitsAB = [
    { kind: 'bone' as const, bone: 'hips', slot: null, attachment: null },
    { kind: 'attachment' as const, bone: 'braco', slot: 'desenho', attachment: 'desenho' },
  ];

  it('replace troca a seleção inteira', () => {
    const before: Selection = { ...emptySelection(), bones: ['torso'], vertices: [3] };
    const after = selectionForPicks(before, hitsAB, 'replace');
    expect(after.bones).toEqual(['hips']);
    expect(after.slots).toEqual(['desenho']);
    expect(after.attachments).toEqual([{ slot: 'desenho', attachment: 'desenho' }]);
    expect(after.vertices).toEqual([]);
  });

  it('add soma sem repetir', () => {
    const before: Selection = { ...emptySelection(), bones: ['hips', 'torso'] };
    const after = selectionForPicks(before, hitsAB, 'add');
    expect(after.bones).toEqual(['hips', 'torso']);
    expect(after.slots).toEqual(['desenho']);
  });

  it('remove tira o que estava e deixa o resto', () => {
    const before: Selection = {
      ...emptySelection(), bones: ['hips', 'torso'], slots: ['desenho'],
      attachments: [{ slot: 'desenho', attachment: 'desenho' }],
    };
    const after = selectionForPicks(before, hitsAB, 'remove');
    expect(after.bones).toEqual(['torso']);
    expect(after.slots).toEqual([]);
    expect(after.attachments).toEqual([]);
  });
});

describe('ferramenta Selecionar com o retângulo', () => {
  it('arrastar em área vazia seleciona o que o retângulo toca', () => {
    const doc = new TestDoc(testFile());
    selectTool.onDown?.(doc, event(-10, -10));
    selectTool.onMove?.(doc, event(10, 120));
    selectTool.onUp?.(doc, event(10, 120));
    // Lote 60a: sem a raiz.
    expect(doc.selection.bones).toEqual(['hips', 'torso']);
  });

  it('clique seco em área vazia limpa; com Shift, deixa como está', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onDown?.(doc, event(500, 500, { shift: true }));
    selectTool.onUp?.(doc, event(501, 500, { shift: true }));
    expect(doc.selection.bones).toEqual(['hips']);
    selectTool.onDown?.(doc, event(500, 500));
    selectTool.onUp?.(doc, event(501, 500));
    expect(doc.selection.bones).toEqual([]);
  });

  it('Shift soma e Ctrl tira', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['braco'] });
    selectTool.onDown?.(doc, event(-10, -10, { shift: true }));
    selectTool.onMove?.(doc, event(10, 120, { shift: true }));
    selectTool.onUp?.(doc, event(10, 120, { shift: true }));
    expect(doc.selection.bones).toEqual(['braco', 'hips', 'torso']);
    selectTool.onDown?.(doc, event(-10, 80, { ctrl: true }));
    selectTool.onMove?.(doc, event(10, 120, { ctrl: true }));
    selectTool.onUp?.(doc, event(10, 120, { ctrl: true }));
    expect(doc.selection.bones).toEqual(['braco']);
  });

  it('um clique em cima de um osso continua escolhendo só ele', () => {
    const doc = new TestDoc(testFile());
    selectTool.onDown?.(doc, event(0, 90));
    selectTool.onUp?.(doc, event(0, 90));
    expect(doc.selection.bones).toEqual(['hips']);
  });
});

// ---------------------------------------------------------------------------
// Travar
// ---------------------------------------------------------------------------

describe('travar ossos e desenhos', () => {
  it('as travas entram e saem do JSON, e um JSON quebrado vira o padrão', () => {
    const parsed = parseViewSettings({ lockBones: true, lockedBones: ['a', 3, 'b'], lockedSlots: 'x' });
    expect(parsed.lockBones).toBe(true);
    expect(parsed.lockDrawings).toBe(false);
    expect(parsed.lockedBones).toEqual(['a', 'b']);
    expect(parsed.lockedSlots).toEqual([]);
    expect(parsed.drawings).toBe(true);
    expect(parseViewSettings(null)).toEqual(DEFAULT_VIEW);
  });

  it('a trava é gravada no arquivo, na extensão do editor', () => {
    const doc = new TestDoc(testFile());
    setBoneLocked('hips', true, doc);
    expect(readViewState(doc.file).lockedBones).toEqual(['hips']);
    setBoneLocked('hips', false, doc);
    expect(readViewState(doc.file).lockedBones).toEqual([]);
  });

  it('um osso travado não responde ao clique nem ao retângulo', () => {
    const doc = new TestDoc(testFile());
    const locks = { ...NO_LOCKS, lockedBones: new Set(['hips']) };
    // O torso nasce na raiz do quadril: os dois respondem ao mesmo ponto, e o
    // quadril vem primeiro por estar antes no arquivo. Travado, sobra o torso.
    expect(pickAll(doc.skeleton, 0, 90, 1).map((h) => h.bone)).toEqual(['hips', 'torso']);
    expect(pickAll(doc.skeleton, 0, 90, 1, locks).map((h) => h.bone)).toEqual(['torso']);
    const inRect = pickInRect(doc.skeleton, { x1: -10, y1: -10, x2: 10, y2: 120 }, locks);
    // Lote 60a: a raiz nunca entra no retângulo.
    expect(inRect.map((h) => h.bone)).toEqual(['torso']);
  });

  it('travar todos os desenhos deixa a caixa e o desenho fora, e os ossos dentro', () => {
    const doc = new TestDoc(testFile());
    const locks = { ...NO_LOCKS, lockDrawings: true };
    const hits = pickInRect(doc.skeleton, { x1: -300, y1: -50, x2: 300, y2: 50 }, locks);
    expect(hits.every((h) => h.kind === 'bone')).toBe(true);
    // root, braco e caixa_osso têm y = 0; hips e torso estão acima de 50.
    // Lote 60a: a raiz também tem y = 0, mas é o mundo e não entra.
    expect(hits.map((h) => h.bone)).toEqual(['braco', 'caixa_osso']);
  });

  it('a ferramenta Selecionar respeita a trava em vigor', () => {
    const doc = new TestDoc(testFile());
    changeViewSettings({ lockBones: true }, doc);
    selectTool.onDown?.(doc, event(0, 90));
    selectTool.onUp?.(doc, event(0, 90));
    expect(doc.selection.bones).toEqual([]);
    expect(isBoneLocked('qualquer')).toBe(true);
    expect(isSlotLocked('desenho')).toBe(false);
  });

  it('ligar a trava tira da seleção o que ficou travado', () => {
    const doc = new TestDoc(testFile());
    doc.select({
      ...emptySelection(), bones: ['hips', 'braco'], slots: ['desenho'],
      attachments: [{ slot: 'desenho', attachment: 'desenho' }],
    });
    setBoneLocked('hips', true, doc);
    expect(doc.selection.bones).toEqual(['braco']);
    setSlotLocked('desenho', true, doc);
    expect(doc.selection.slots).toEqual([]);
    expect(doc.selection.attachments).toEqual([]);
    expect(currentLocks().lockedSlots.has('desenho')).toBe(true);
  });

  it('7 8 9 0 ligam e desligam ver e travar', () => {
    const doc = new TestDoc(testFile());
    expect(toggleViewKey('x', doc)).toBe(false);
    expect(toggleViewKey('8', doc)).toBe(true);
    expect(viewSettings().lockBones).toBe(true);
    expect(toggleViewKey('8', doc)).toBe(true);
    expect(viewSettings().lockBones).toBe(false);
    toggleViewKey('0', doc);
    expect(viewSettings().lockDrawings).toBe(true);
    toggleViewKey('7', doc);
    expect(viewSettings().bones).toBe(false);
    toggleViewKey('9', doc);
    expect(viewSettings().drawings).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Virar filho (P)
// ---------------------------------------------------------------------------

describe('virar filho com P', () => {
  it('Reparent muda o pai dos ossos e o osso dos slots num passo só', () => {
    const doc = new TestDoc(testFile());
    const selection: Selection = {
      ...emptySelection(), bones: ['torso', 'root', 'braco'], slots: ['caixa'],
    };
    const command = new Reparent(doc.file, selection, 'braco');
    // root não pode (é a raiz); braco não pode (é o próprio pai). Sobra torso.
    expect(command.bones).toEqual(['torso']);
    expect(command.skipped).toEqual(['root', 'braco']);
    expect(command.slots).toEqual(['caixa']);
    doc.run(command);
    expect(parentOf(doc, 'torso')).toBe('braco');
    expect(doc.file.slots?.find((s) => s.name === 'caixa')?.bone).toBe('braco');
    // Os ossos continuam com pai antes de filho.
    const names = doc.file.bones.map((b) => b.name);
    expect(names.indexOf('braco')).toBeLessThan(names.indexOf('torso'));
    doc.undo();
    expect(parentOf(doc, 'torso')).toBe('hips');
    expect(doc.file.slots?.find((s) => s.name === 'caixa')?.bone).toBe('caixa_osso');
    expect(doc.file.bones.map((b) => b.name)).toEqual(['root', 'hips', 'torso', 'braco', 'caixa_osso']);
  });

  // Lote 63a: o P é um gesto só — o de pegar filhos, em
  // `lote31-pegar-filhos.test.ts`. O gesto de antes (dois escolhidos, P,
  // clique no pai) saiu. Estes quatro testes eram dele e agora provam que ele
  // não volta.
  it('P com dois escolhidos só dá o recado, e o clique escolhe como sempre', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['torso', 'caixa_osso'] });
    expect(selectTool.onKey?.(doc, 'p')).toBe(true);
    expect(doc.notices.at(-1)).toContain('Escolha um osso');
    // O clique em (200, 0) cai na raiz do braco: escolhe, não pendura.
    selectTool.onDown?.(doc, event(200, 0));
    selectTool.onUp?.(doc, event(200, 0));
    expect(parentOf(doc, 'torso')).toBe('hips');
    expect(parentOf(doc, 'caixa_osso')).toBe('root');
    expect(doc.selection.bones).toEqual(['braco']);
    expect(doc.undoCount).toBe(0);
  });

  it('P sem seleção avisa e não entra no modo', () => {
    const doc = new TestDoc(testFile());
    expect(selectTool.onKey?.(doc, 'p')).toBe(true);
    expect(doc.notices.at(-1)).toContain('Escolha um osso');
    selectTool.onDown?.(doc, event(200, 0));
    expect(doc.selection.bones).toEqual(['braco']);
    expect(doc.undoCount).toBe(0);
  });

  it('Esc depois do P limpa a seleção, como sempre: não há modo para cancelar', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['torso', 'caixa_osso'] });
    selectTool.onKey?.(doc, 'p');
    selectTool.onKey?.(doc, 'Escape');
    expect(doc.selection.bones).toEqual([]);
    expect(parentOf(doc, 'torso')).toBe('hips');
    expect(doc.undoCount).toBe(0);
  });

  it('um osso travado ainda vira filho: a trava é do clique de mover, não de prender', () => {
    const doc = new TestDoc(testFile());
    changeViewSettings({ lockBones: true }, doc);
    doc.select({ ...emptySelection(), bones: ['braco'] });
    selectTool.onKey?.(doc, 'p');
    // (0, 130) cai no traço do torso, que aponta para cima.
    selectTool.onDown?.(doc, event(0, 130));
    selectTool.onKeyUp?.(doc, 'p');
    expect(parentOf(doc, 'torso')).toBe('braco');
  });
});
});

// ---------------------------------------------------------------------------
// ver e travar (lote 7) — era `lote7-ver-e-travar.test.ts`
// ---------------------------------------------------------------------------

describe('ver e travar (lote 7)', () => {
/**
 * Lote 7 (v2.4): ver e travar um a um.
 *
 * Sem DOM. Tudo o que decide o que aparece e o que pega clique é função pura em
 * `viewport/onion.ts`; o painel e a Árvore só desenham o que elas dizem.
 *
 * **Escondido é diferente de travado**, e é a coisa que estes testes mais
 * protegem: travado aparece e não pega clique; escondido não aparece e também
 * não pega.
 */
/**
 *   root
 *   +-- hips            em (0, 90)
 *   |   +-- torso       90 graus, comprimento 70
 *   +-- braco           em (200, 0), comprimento 40, carrega o slot `desenho`
 *   +-- caixa_osso      em (-200, 0), carrega o slot `caixa`
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', x: 0, y: 90, length: 10 },
      { name: 'torso', parent: 'hips', rotation: 90, length: 70 },
      { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 },
      { name: 'caixa_osso', parent: 'root', x: -200, y: 0 },
    ],
    slots: [
      { name: 'caixa', bone: 'caixa_osso', attachment: 'caixa' },
      { name: 'desenho', bone: 'braco', attachment: 'desenho' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        caixa: { caixa: { type: 'boundingbox', shape: 'rectangle', width: 20, height: 20 } },
        desenho: { desenho: { type: 'region', path: 'x', width: 30, height: 30 } },
      },
    }],
  } as BoneFile;
}

function posed(): Skeleton {
  const skeleton = new Skeleton(loadSkeletonData(testFile()));
  skeleton.updateWorldTransform();
  return skeleton;
}

function pick(patch: Partial<Selection>): Selection {
  return { ...emptySelection(), ...patch };
}

/** Um `ViewSettings` de partida, para as funções puras. */
function view(patch: Partial<ViewSettings> = {}): ViewSettings {
  return { ...DEFAULT_VIEW, onion: { ...DEFAULT_VIEW.onion }, ...patch };
}

/** As travas montadas à mão, sem tocar no estado global. */
function locks(patch: Partial<ViewSettings>): ReturnType<typeof currentLocks> {
  return currentLocks(view(patch));
}

beforeEach(() => {
  // Estas provas são todas sobre funções puras; nada aqui mexe no estado
  // global de exibição, e por isso nada precisa ser desfeito depois.
});

// ---------------------------------------------------------------------------
// Item 57 — esconder
// ---------------------------------------------------------------------------

describe('esconder o escolhido', () => {
  it('junta o osso escolhido à lista', () => {
    const patch = hideSelected(view(), pick({ bones: ['hips'] }));
    expect(patch.hiddenBones).toEqual(['hips']);
    expect(patch.hiddenSlots).toEqual([]);
  });

  it('um desenho escolhido esconde o SLOT dele', () => {
    const patch = hideSelected(view(), pick({
      attachments: [{ slot: 'desenho', attachment: 'desenho' }],
    }));
    expect(patch.hiddenSlots).toEqual(['desenho']);
  });

  it('esconder duas vezes não repete o nome na lista', () => {
    const uma = hideSelected(view(), pick({ bones: ['hips'] }));
    const duas = hideSelected(view(uma), pick({ bones: ['hips'] }));
    expect(duas.hiddenBones).toEqual(['hips']);
  });

  it('a lista sai em ordem: o arquivo não muda quando ninguém mudou nada', () => {
    const patch = hideSelected(view(), pick({ bones: ['torso', 'hips'] }));
    expect(patch.hiddenBones).toEqual(['hips', 'torso']);
  });
});

describe('só este', () => {
  it('esconde todo o resto', () => {
    const patch = soloSelected(view(), testFile(), pick({ bones: ['braco'] }));
    expect(patch.hiddenBones).not.toContain('braco');
    expect(patch.hiddenBones).toContain('hips');
    expect(patch.hiddenBones).toContain('torso');
  });

  it('os ANCESTRAIS de quem ficou continuam à vista', () => {
    // `torso` é filho de `hips`, que é filho de `root`. Esconder os dois
    // deixaria o `torso` pendurado no nada, e a hierarquia é justamente o que
    // se está olhando quando se pede "só este".
    const patch = soloSelected(view(), testFile(), pick({ bones: ['torso'] }));
    expect(patch.hiddenBones).not.toContain('hips');
    expect(patch.hiddenBones).not.toContain('root');
    expect(patch.hiddenBones).toContain('braco');
  });

  it('um slot escolhido segura o osso dele à vista', () => {
    const patch = soloSelected(view(), testFile(), pick({ slots: ['desenho'] }));
    expect(patch.hiddenSlots).toEqual(['caixa']);
    // `desenho` está no `braco`: sem ele o desenho não teria onde se pendurar.
    expect(patch.hiddenBones).not.toContain('braco');
    expect(patch.hiddenBones).not.toContain('root');
  });

  it('sem nada escolhido, esconde tudo — e "Mostrar tudo" devolve', () => {
    const patch = soloSelected(view(), testFile(), emptySelection());
    expect(patch.hiddenBones).toHaveLength(5);
    expect(showAll()).toEqual({ hiddenBones: [], hiddenSlots: [] });
  });
});

// ---------------------------------------------------------------------------
// Item 58 — travar
// ---------------------------------------------------------------------------

describe('travar', () => {
  it('trava o escolhido, sem mexer no resto', () => {
    const patch = lockSelected(view(), pick({ bones: ['hips'] }));
    expect(patch.lockedBones).toEqual(['hips']);
  });

  it('travar o resto trava todos menos o escolhido', () => {
    const patch = lockOthers(testFile(), pick({ bones: ['braco'] }));
    expect(patch.lockedBones).not.toContain('braco');
    expect(patch.lockedBones).toContain('hips');
    expect(patch.lockedSlots).toEqual(['caixa', 'desenho']);
  });

  it('destravar tudo apaga as quatro travas, inclusive as de tipo inteiro', () => {
    expect(unlockAll()).toEqual({
      lockBones: false, lockDrawings: false, lockedBones: [], lockedSlots: [],
    });
  });
});

// ---------------------------------------------------------------------------
// Escondido não pega clique
// ---------------------------------------------------------------------------

describe('escondido também não pega clique', () => {
  it('um osso escondido não aparece no que está sob o ponteiro', () => {
    const skeleton = posed();
    // A raiz do `braco` está em (200, 0).
    const semEsconder = pickAll(skeleton, 200, 0, 1, NO_LOCKS);
    expect(semEsconder.some((hit) => hit.bone === 'braco')).toBe(true);

    const escondido = pickAll(skeleton, 200, 0, 1, locks({ hiddenBones: ['braco'] }));
    expect(escondido.some((hit) => hit.kind === 'bone' && hit.bone === 'braco')).toBe(false);
  });

  it('o retângulo de seleção pula o que está escondido', () => {
    const skeleton = posed();
    const caixa = { x1: -300, y1: -100, x2: 300, y2: 200 };
    const todos = pickInRect(skeleton, caixa, NO_LOCKS);
    const ossos = todos.filter((hit) => hit.kind === 'bone').length;

    const menosUm = pickInRect(skeleton, caixa, locks({ hiddenBones: ['hips'] }));
    expect(menosUm.filter((hit) => hit.kind === 'bone')).toHaveLength(ossos - 1);
  });

  it('travado e escondido são estados diferentes, e os dois recusam o clique', () => {
    expect(isBoneLocked('hips', locks({ lockedBones: ['hips'] }))).toBe(true);
    expect(isBoneHidden('hips', locks({ lockedBones: ['hips'] }))).toBe(false);

    expect(isBoneHidden('hips', locks({ hiddenBones: ['hips'] }))).toBe(true);
    expect(isBoneLocked('hips', locks({ hiddenBones: ['hips'] }))).toBe(true);
  });

  it('o mesmo vale para o slot', () => {
    expect(isSlotHidden('desenho', locks({ hiddenSlots: ['desenho'] }))).toBe(true);
    expect(isSlotLocked('desenho', locks({ hiddenSlots: ['desenho'] }))).toBe(true);
    expect(isSlotHidden('desenho', locks({ lockedSlots: ['desenho'] }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Item 61 — ver só o resultado
// ---------------------------------------------------------------------------

describe('ver só o resultado', () => {
  it('liga: desliga os dez interruptores e guarda como estavam', () => {
    const antes = view({ bones: true, grid: true, edges: false });
    const patch = toggleCleanView(antes);
    for (const key of CLEAN_KEYS) {
      expect(patch[key], `${key} deveria ficar desligado`).toBe(false);
    }
    expect(patch.cleanView?.bones).toBe(true);
    expect(patch.cleanView?.edges).toBe(false);
  });

  it('desliga duas vezes devolve o `view` igual, campo a campo', () => {
    const antes = view({ bones: true, grid: false, edges: true, weights: false });
    const ligado = view({ ...antes, ...toggleCleanView(antes) });
    const voltou = view({ ...ligado, ...toggleCleanView(ligado) });
    for (const key of CLEAN_KEYS) {
      expect(voltou[key], `${key} não voltou`).toBe(antes[key]);
    }
    expect(voltou.cleanView).toBeNull();
  });

  it('não mexe no que não é dele: os desenhos continuam ligados', () => {
    const patch = toggleCleanView(view());
    // `drawings` fica de fora de propósito: "ver só o resultado" é ver o
    // personagem, e sem os desenhos não sobraria resultado nenhum.
    expect('drawings' in patch).toBe(false);
    expect(CLEAN_KEYS).not.toContain('drawings' as never);
  });

  it('o que a pessoa mudou com o modo ligado não é desfeito ao sair', () => {
    const antes = view({ bones: true });
    const ligado = view({ ...antes, ...toggleCleanView(antes) });
    // Com o modo ligado, ela liga a grade de propósito. `grid` está guardado
    // como estava antes, então sair devolve o valor de antes — que é o
    // combinado: sair é voltar ao que era, não guardar o que se fez no modo.
    const mexido = view({ ...ligado, grid: true });
    const voltou = view({ ...mexido, ...toggleCleanView(mexido) });
    expect(voltou.grid).toBe(antes.grid);
    expect(voltou.bones).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Um arquivo velho continua abrindo
// ---------------------------------------------------------------------------

describe('um `view` gravado antes deste lote', () => {
  it('não quebra: os campos novos voltam vazios', () => {
    const lido = parseViewSettings({ bones: false, lockedBones: ['hips'] });
    expect(lido.hiddenBones).toEqual([]);
    expect(lido.hiddenSlots).toEqual([]);
    expect(lido.cleanView).toBeNull();
    expect(lido.hoverNames).toBe(false);
    // E o que ele tinha continua lá.
    expect(lido.bones).toBe(false);
    expect(lido.lockedBones).toEqual(['hips']);
  });

  it('um `cleanView` com lixo dentro vira `null`, e não meio estado', () => {
    expect(parseViewSettings({ cleanView: 'sim' }).cleanView).toBeNull();
    expect(parseViewSettings({ cleanView: {} }).cleanView).toBeNull();
    expect(parseViewSettings({ cleanView: { bones: 'talvez' } }).cleanView).toBeNull();
    expect(parseViewSettings({ cleanView: { bones: true } })
      .cleanView).toEqual({ bones: true });
  });
});

// ---------------------------------------------------------------------------
// A conta que todas usam
// ---------------------------------------------------------------------------

describe('o que a seleção tem', () => {
  it('conta o slot de cada desenho escolhido, sem repetir', () => {
    const names = namesOfSelection(pick({
      slots: ['desenho'],
      attachments: [
        { slot: 'desenho', attachment: 'desenho' },
        { slot: 'caixa', attachment: 'caixa' },
      ],
    }));
    expect(names.slots.sort()).toEqual(['caixa', 'desenho']);
  });

  it('sem nada escolhido, nada', () => {
    expect(namesOfSelection(emptySelection())).toEqual({ bones: [], slots: [] });
  });
});
});

// ---------------------------------------------------------------------------
// clonar guias familia (lote 42) — era `lote42-clonar-guias-familia.test.ts`
// ---------------------------------------------------------------------------

describe('clonar guias familia (lote 42)', () => {
/**
 * Lote 42 — rodada 4, Spriter 8: Ctrl + arrastar clona, guias na cena, e
 * Escolher → Os filhos / Os pais.
 *
 * Sem DOM. A ferramenta Mover é chamada com eventos de mundo, como a cena
 * chamaria; as guias e as famílias são contas puras.
 *
 * A tecla: `Z` é de Inclinar. Os filhos ficou em `]` e Os pais em `[` — os
 * colchetes do Photoshop, que estavam livres (Desvios do lote 42).
 */
const RAIZ = resolve(__dirname, '..', '..');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(resolve(RAIZ, 'formato', 'exemplos', 'heroi.bone'), 'utf8')) as BoneFile;
}

function sel(parte: Partial<Selection>): Selection {
  return { ...emptySelection(), ...parte };
}

function ev(x: number, y: number, ctrl = false): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl, alt: false, button: 0, scale: 1 };
}

/** O `.bone` sem a extensão do editor: o que o jogo lê. */
function nucleo(file: BoneFile): string {
  const copia = JSON.parse(JSON.stringify(file)) as { extensions?: unknown };
  delete copia.extensions;
  return JSON.stringify(copia);
}

afterEach(() => resetViewSettings());

// ---------------------------------------------------------------------------
// Guias
// ---------------------------------------------------------------------------

describe('guias — as contas', () => {
  it('snapToGuides(103, [100], 6) dá 100; com 108 dá 108', () => {
    expect(snapToGuides(103, [100], 6)).toBe(100);
    expect(snapToGuides(108, [100], 6)).toBe(108);
    // A mais perto ganha.
    expect(snapToGuides(103, [100, 105], 6)).toBe(105);
  });

  it('snapPoint leva x às guias em pé e y às deitadas', () => {
    const guias = [{ axis: 'x' as const, value: 50 }, { axis: 'y' as const, value: -10 }];
    expect(snapPoint(52, -7, guias, 6)).toEqual({ x: 50, y: -10 });
    expect(snapPoint(70, 20, guias, 6)).toEqual({ x: 70, y: 20 });
  });

  it('da régua de cima nasce deitada; da esquerda, em pé; o canto não é régua', () => {
    expect(guideFromRuler('top', 12.345, 67.891)).toEqual({ axis: 'y', value: 67.89 });
    expect(guideFromRuler('left', 12.345, 67.891)).toEqual({ axis: 'x', value: 12.35 });
    expect(rulerAt(100, 5, 20)).toBe('top');
    expect(rulerAt(5, 100, 20)).toBe('left');
    expect(rulerAt(5, 5, 20)).toBeNull();
    expect(rulerAt(100, 100, 20)).toBeNull();
    expect(guideLabel({ axis: 'y', value: 0.5 })).toBe('Guia deitada em y = 0,5');
  });

  it('guia repetida não entra duas vezes; lixo no JSON fica de fora', () => {
    const uma = addGuide([], { axis: 'y', value: 10 });
    expect(addGuide(uma, { axis: 'y', value: 10 })).toHaveLength(1);
    expect(addGuide(uma, { axis: 'x', value: 10 })).toHaveLength(2);
    expect(parseGuides([{ axis: 'y', value: 3 }, { axis: 'z', value: 1 }, 'x', { axis: 'x' }]))
      .toEqual([{ axis: 'y', value: 3 }]);
    expect(parseGuides(null)).toEqual([]);
  });

  it('guias no arquivo: view.guides tem as guias, e o núcleo do .bone não muda um byte', () => {
    const file = heroi();
    const antes = nucleo(file);
    const guias = [{ axis: 'y' as const, value: 0 }, { axis: 'x' as const, value: 120 }];
    writeViewState(file, { ...parseViewSettings(null), guides: guias });
    expect(nucleo(file)).toBe(antes);
    const view = (readEditorState(file) as { view?: { guides?: unknown } }).view;
    expect(view?.guides).toEqual(guias);
    expect(readViewState(file).guides).toEqual(guias);
  });

  it('um view gravado antes do lote 42 abre sem guia, com as caixas no padrão', () => {
    const view = parseViewSettings({ grid: false });
    expect(view.guides).toEqual([]);
    expect(view.showGuides).toBe(true);
    expect(view.lockGuides).toBe(false);
  });

  it('o ímã da ferramenta Mover: 6 px de tela, e só com as guias à vista', () => {
    setViewSettings({ guides: [{ axis: 'x', value: 100 }], showGuides: true });
    expect(snapDelta({ x: 97, y: 0 }, 0, 0, 1)).toEqual({ dx: 3, dy: 0 });
    expect(snapDelta({ x: 90, y: 0 }, 0, 0, 1)).toEqual({ dx: 0, dy: 0 });
    // Afastado (zoom 0,25), os mesmos 6 px de tela são 24 no mundo.
    expect(snapDelta({ x: 80, y: 0 }, 0, 0, 0.25)).toEqual({ dx: 20, dy: 0 });
    setViewSettings({ showGuides: false });
    expect(snapDelta({ x: 97, y: 0 }, 0, 0, 1)).toEqual({ dx: 0, dy: 0 });
  });
});

// ---------------------------------------------------------------------------
// Escolher → Os filhos / Os pais
// ---------------------------------------------------------------------------

describe('Escolher → Os filhos e Os pais', () => {
  it('os filhos de arm: forearm e os desenhos deles, arm incluído', () => {
    const file = heroi();
    expect(descendantsOf(file, 'arm')).toEqual(['arm', 'forearm']);
    const escolha = selectChildren(file, sel({ bones: ['arm'] }));
    expect(escolha.bones).toEqual(['arm', 'forearm']);
    expect(escolha.slots).toEqual(['arm', 'forearm', 'sword_blade', 'weapon', 'hand', 'hand_point']);
  });

  it('os pais de hand (o slot): forearm, arm, torso, hips, root', () => {
    const file = heroi();
    const escolha = selectParents(file, sel({ slots: ['hand'] }));
    expect(new Set(escolha.bones)).toEqual(new Set(['forearm', 'arm', 'torso', 'hips', 'root']));
    // Na ordem do arquivo, como toda seleção do editor.
    expect(escolha.bones).toEqual(['root', 'hips', 'torso', 'arm', 'forearm']);
    expect(ancestorsOf(file, 'forearm')).toEqual(['root', 'hips', 'torso', 'arm', 'forearm']);
    // De um desenho escolhido, a corrente começa no osso dele.
    expect(selectParents(file, sel({ attachments: [{ slot: 'hand', attachment: 'hand_fist' }] })).bones)
      .toEqual(escolha.bones);
  });

  it('as duas portas: Editar → Escolher, com ] e [, sem tecla repetida', () => {
    const menu = editMenu({ canUndo: false, undoLabel: null, canRedo: false, redoLabel: null });
    const escolher = menu.find((item) => 'label' in item && item.label === 'Escolher') as
      { children: Array<{ label: string; shortcut?: string; action: string }> };
    expect(escolher.children.map((c) => [c.label, c.shortcut, c.action])).toEqual([
      ['Os filhos', ']', 'escolher-filhos'],
      ['Os pais', '[', 'escolher-pais'],
    ]);
    const teclas = flatEntries(menu).map((e) => e.shortcut).filter((s) => s === ']' || s === '[');
    expect(teclas).toEqual([']', '[']);
  });
});

// ---------------------------------------------------------------------------
// Ctrl + arrastar clona
// ---------------------------------------------------------------------------

describe('Ctrl + arrastar clona, na ferramenta Mover', () => {
  it('só clona com o ponteiro em cima do escolhido', () => {
    const escolha = sel({ bones: ['arm'] });
    expect(clonesUnderPointer(escolha, { kind: 'bone', bone: 'arm', slot: null, attachment: null })).toBe(true);
    expect(clonesUnderPointer(escolha, { kind: 'attachment', bone: 'torso', slot: 'body', attachment: 'body' }))
      .toBe(false);
    expect(clonesUnderPointer(escolha, null)).toBe(false);
    expect(clonesUnderPointer(sel({ slots: ['body'] }),
      { kind: 'attachment', bone: 'torso', slot: 'body', attachment: 'body' })).toBe(true);
  });

  it('Ctrl + arrastar arm 40 px: nasce arm_2 com o membro, 40 px à direita; um passo; arm parado', () => {
    const doc = new Doc(heroi());
    const antes = JSON.stringify(doc.file);
    const armAntes = JSON.stringify(doc.file.bones.find((b) => b.name === 'arm'));
    doc.select(sel({ bones: ['arm'] }));

    // Um ponto do osso arm onde o clique pega o que está escolhido.
    const skeleton = doc.skeleton!;
    const osso = skeleton.findBone('arm')!;
    const comprimento = osso.data.length || 40;
    let ponto: { x: number; y: number } | null = null;
    for (const t of [0.5, 0.3, 0.7, 0.1, 0.9, 0]) {
      const x = osso.worldX + osso.a * comprimento * t;
      const y = osso.worldY + osso.c * comprimento * t;
      if (clonesUnderPointer(doc.selection, pickAt(skeleton, x, y, 1))) { ponto = { x, y }; break; }
    }
    expect(ponto, 'nenhum ponto do osso arm pega o arm').not.toBeNull();
    const p = ponto!;

    translateTool.onDown!(doc, ev(p.x, p.y, true));
    translateTool.onMove!(doc, ev(p.x + 15, p.y, true));
    translateTool.onMove!(doc, ev(p.x + 40, p.y, true));
    translateTool.onUp!(doc, ev(p.x + 40, p.y, true));

    const nomes = doc.file.bones.map((b) => b.name);
    expect(nomes).toContain('arm_2');
    expect(nomes).toContain('forearm_2');
    expect(nomes.filter((n) => n === 'arm_3')).toEqual([]);
    const mundo = setupWorldMatrices(doc.file)!;
    expect(mundo.get('arm_2')!.worldX).toBeCloseTo(mundo.get('arm')!.worldX + 40, 4);
    expect(mundo.get('arm_2')!.worldY).toBeCloseTo(mundo.get('arm')!.worldY, 4);
    expect(JSON.stringify(doc.file.bones.find((b) => b.name === 'arm'))).toBe(armAntes);
    expect(doc.selection.bones).toEqual(['arm_2', 'forearm_2']);

    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('Ctrl + clique sem arrastar não clona nada', () => {
    const doc = new Doc(heroi());
    const antes = JSON.stringify(doc.file);
    doc.select(sel({ bones: ['arm'] }));
    translateTool.onDown!(doc, ev(0, 0, true));
    translateTool.onUp!(doc, ev(0, 0, true));
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('um desenho solto clonado anda junto: o body_2 fica 30 px à direita do body', () => {
    const file = heroi();
    const doc = { file } as never;
    const cmd = new CloneDrag(file, sel({ slots: ['body'] }), { x: 30, y: 0 });
    cmd.apply(doc);
    const mundo = setupWorldMatrices(file)!;
    const m = mundo.get('torso')!;
    const onde = (slot: string): { x: number; y: number } => {
      const def = file.skins!.find((s) => s.name === 'default')!.attachments![slot]!['body'] as { x?: number; y?: number };
      const x = def.x ?? 0;
      const y = def.y ?? 0;
      return { x: m.a * x + m.b * y + m.worldX, y: m.c * x + m.d * y + m.worldY };
    };
    expect(onde('body_2').x).toBeCloseTo(onde('body').x + 30, 4);
    expect(onde('body_2').y).toBeCloseTo(onde('body').y, 4);
    expect(cmd.label).toBe('Clonar arrastando');
  });
});

// ---------------------------------------------------------------------------
// Portas e manual
// ---------------------------------------------------------------------------

describe('menu Exibir e manual', () => {
  it('Exibir → Guias, Travar guias e Limpar guias', () => {
    const view = parseViewSettings(null);
    const labels = flatEntries(viewMenu(view)).map((e) => e.label);
    for (const nome of ['Guias', 'Travar guias', 'Limpar guias']) expect(labels).toContain(nome);
  });

  itManual('o capítulo 1 diz os três gestos, nas duas línguas', () => {
    const ler = (...partes: string[]): string =>
      readFileSync(resolve(RAIZ, 'documentos', 'manual', ...partes), 'utf8').replace(/\s+/g, ' ');
    // D13: montar o personagem é o capítulo 1 desde a v36.5.
    for (const texto of [ler('01-montar-um-corpo.md'), ler('en', '01-build-a-body.md')]) {
      for (const trecho of ['Os filhos', 'Os pais', 'Travar guias', 'Limpar guias', 'RECORTE_editor_state']) {
        expect(texto, trecho).toContain(trecho);
      }
      expect(texto).toMatch(/`Ctrl` \+ (arrastar|drag) \*\*/);
    }
  });
});
});

// ---------------------------------------------------------------------------
// Rodada 8a (04/10/2026): a entidade se escolhe, se move e volta
// ---------------------------------------------------------------------------

import { attachmentWorldPoints, nestedBox, selectionFor } from '../src/viewport/picking.js';
import { selectionBounds } from '../src/viewport/zoom-model.js';
import { pickedAttachment } from '../src/viewport/tools/attachment-edit.js';

describe('rodada 8a — a entidade na cena', () => {
  const pick = (patch: Partial<Selection>): Selection => ({ ...emptySelection(), ...patch });
  /**
   * A espada: uma lâmina de 40×10 com o centro a 20 px da raiz do filho. No
   * mundo ela vai de x 200..240 (o braço está em 200) e y -5..5.
   */
  function filho(): SkeletonData {
    return loadSkeletonData({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'lamina', bone: 'root', attachment: 'lamina' }],
      skins: [{ name: 'default', attachments: { lamina: { lamina: { type: 'region', path: 'x', x: 20, width: 40, height: 10 } } } }],
    } as BoneFile);
  }
  function comEntidade(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 }],
      slots: [{ name: 'mao', bone: 'braco', attachment: 'mao' }],
      skins: [{ name: 'default', attachments: { mao: { mao: { type: 'skeleton', uri: 'espada.bone' } } } }],
    } as BoneFile;
  }
  function posada(): Skeleton {
    const skeleton = new Skeleton(loadSkeletonData(comEntidade(), { skeletons: new Map([['espada.bone', filho()]]) }));
    skeleton.updateWorldTransform();
    return skeleton;
  }
  function docComEntidade(): Doc {
    return new Doc(comEntidade(), { skeletons: new Map([['espada.bone', filho()]]) });
  }

  it('o clique na lâmina ACHA a entidade — antes ele pulava quem não tem contorno (C16)', () => {
    const hits = pickAll(posada(), 230, 2, 1);
    // Rodada 11: o acerto numa entidade diz também QUAL imagem de dentro (`inner`).
    expect(hits[0]).toEqual({ kind: 'attachment', bone: 'braco', slot: 'mao', attachment: 'mao', inner: 'lamina' });
  });

  it('fora do que o filho desenha, o clique passa direto', () => {
    expect(pickAll(posada(), 230, 30, 1).some((h) => h.slot === 'mao')).toBe(false);
  });

  // Rodada 8d, reescrito de propósito: era "o osso, o slot e a entidade".
  it('o clique escolhe como numa imagem: o slot e a entidade, sem o osso (rodada 8d)', () => {
    const hit = pickAll(posada(), 230, 2, 1)[0]!;
    expect(selectionFor(emptySelection(), hit, false, 'root')).toEqual({
      ...emptySelection(), slots: ['mao'], attachments: [{ slot: 'mao', attachment: 'mao' }],
    });
  });

  it('a caixa da entidade é a caixa do que o filho desenha — enquadrar e a grade usam', () => {
    const skeleton = posada();
    const slot = skeleton.findSlot('mao')!;
    expect(nestedBox(slot, slot.attachment)).toEqual({ minX: 200, minY: -5, maxX: 240, maxY: 5 });
    expect(attachmentWorldPoints(slot, slot.attachment)?.count).toBe(4);
    const caixa = selectionBounds(skeleton, pick({ attachments: [{ slot: 'mao', attachment: 'mao' }] }));
    expect(caixa).toEqual({ x: 200, y: -5, width: 40, height: 10 });
  });

  it('o retângulo de seleção pega a entidade', () => {
    const hits = pickInRect(posada(), { x1: 225, y1: -20, x2: 260, y2: 20 });
    expect(hits.some((h) => h.kind === 'attachment' && h.slot === 'mao')).toBe(true);
  });

  it('a entidade escolhida sozinha é o que Mover, Girar e Escalar mexem — pela Árvore ou pela Ordem', () => {
    const doc = docComEntidade();
    doc.select(pick({ slots: ['mao'], attachments: [{ slot: 'mao', attachment: 'mao' }] }));
    expect(pickedAttachment(doc)?.attachment).toBe('mao');
    // A linha da Ordem escolhe só o SLOT: vale pelo desenho que ele mostra.
    doc.select(pick({ slots: ['mao'] }));
    expect(pickedAttachment(doc)?.anchor).toEqual({ x: 200, y: 0 });
  });

  it('Mover arrasta a entidade: x e y do anexo, num passo de desfazer', () => {
    const doc = docComEntidade();
    const antes = JSON.stringify(doc.file);
    doc.select(pick({ slots: ['mao'] }));
    translateTool.onDown!(doc, { x: 230, y: 0, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    translateTool.onMove!(doc, { x: 245, y: 10, dx: 15, dy: 10, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    translateTool.onMove!(doc, { x: 260, y: 20, dx: 15, dy: 10, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    translateTool.onUp!(doc, { x: 260, y: 20, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    const def = (doc.file.skins![0]!.attachments!['mao'] as Record<string, Record<string, unknown>>)['mao']!;
    expect([def['x'], def['y']]).toEqual([30, 20]);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('rodada 8d: clicar na entidade numa animação e arrastar cria chave SÓ dela, pelo osso próprio', () => {
    const file = comEntidade();
    (file as { animations?: unknown[] }).animations = [{ name: 'golpe', duration: 1, timelines: [] }];
    const doc = new Doc(file, { skeletons: new Map([['espada.bone', filho()]]) });
    doc.animation = 'golpe';
    doc.time = 0.5;
    doc.repose();
    const ev8 = (x: number, y: number): ToolEvent => ({ x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    // Em 238, perto da ponta do `braco`: ali o osso não pega o clique por cima.
    selectTool.onDown(doc, ev8(238, 2));
    selectTool.onUp(doc, ev8(238, 2));
    expect(doc.selection.bones).toEqual([]);
    expect(doc.selection.slots).toEqual(['mao']);
    translateTool.onDown!(doc, ev8(238, 2));
    translateTool.onMove!(doc, ev8(248, 2));
    translateTool.onMove!(doc, ev8(258, 12));
    translateTool.onUp!(doc, ev8(258, 12));
    const linhas = (doc.file.animations![0]!.timelines ?? []).map((t) => `${(t as { target?: string }).target}.${(t as { property?: string }).property}`);
    expect(linhas.sort()).toEqual(['mao_osso.x', 'mao_osso.y']);
    expect(doc.file.bones.find((b) => b.name === 'braco')!.x).toBe(200);
  });
});
