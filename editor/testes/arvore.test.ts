/**
 * Árvore — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote31-pegar-filhos`, `lote34-trocar-de-pai`, `lote60a-raiz-invisivel`, `lote63a-um-gesto`, `lote64-arvore-unica`.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { loadAnimationsFor, loadSkeletonData, Skeleton, AtlasRegionData, computeMeshRegionUVs, computeRegionFrame } from '../../runtime/src/index.js';
import type { AtlasData, AtlasPageData, BoneFile, SkeletonData, Matrix2x3 } from '../../runtime/src/index.js';
import { emptySelection } from '../src/contract.js';
import type { Command, EditorDoc, Selection, ToolEvent, Tool } from '../src/contract.js';
import { ChildGrab, chooseBoneNotice, grabChildren, grabCloseNotice, grabMenuNotice, grabOpenNotice, parentGesture, stepNotice } from '../src/viewport/parent-gesture.js';
import { resetViewSettings } from '../src/viewport/onion.js';
import { selectTool, nudgeSelection } from '../src/viewport/tools/select.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Reparent, reparentTargets, setupWorldMatrices, liveWorldMatrices, runReparent } from '../src/doc/reparent.js';
import { findTimeline, slotTarget } from '../src/anim/keying.js';
import { Doc } from '../src/doc/document.js';
import { canReparent, reparentVerdict } from '../src/doc/bones.js';
import type { ParentMap } from '../src/doc/bones.js';
import { KEYED_PARENT_HINT } from '../src/panels/tree-model.js';
import { shapeTarget } from '../src/panels/tree-commands.js';
// Extensão `BONE_particles`, lote 1: o emissor.
import { AddParticleEmitter, AddPointAttachment, freshSeed, usedSeeds } from '../src/panels/tree-commands.js';
import { addParticleEmitter, registerTreeActions } from '../src/panels/tree-actions.js';
import { clearActions, hasAction, runAction } from '../src/ui/actions.js';
import { thumbnailKind } from '../src/panels/thumbnail-kind.js';
import { hasIcon, iconSvg } from '../src/ui/icons.js';
import { pickAt, pickInRect, selectionFor } from '../src/viewport/picking.js';
import { transformBox, transformHit } from '../src/viewport/transform-box.js';
import type { Point } from '../src/viewport/transform-box.js';
import { transformTool } from '../src/viewport/tools/transform-tool.js';
import { nudgeDrawings } from '../src/viewport/tools/drawing-group.js';
import { ROOT_HINT, CleanEmptySlots, boneRows, emptySlots, hierarchyRows, rootHidden, slotRows, attachmentRows, treeDropAction, FOLD_STORAGE_PREFIX, foldKey, hierarchyDropAction, parseFolded, rootDropAction, searchHierarchy, selectionForRow, slotDrawing, unfoldedRows } from '../src/panels/tree-model.js';
import type { TreeRow } from '../src/panels/tree-model.js';
import { slotFields, constraintFields } from '../src/panels/properties-model.js';
import { switchAnimation } from '../src/anim/transport.js';
import { CreateBoneAndGrab, newBoneParent } from '../src/viewport/tools/create-bone.js';
import { regionToMesh } from '../src/mesh/mesh-edit.js';
// Lote 1 do chat D (28/09): o grupo "Eventos e parâmetros".
import { EVENTS_GROUP_ID, EVENTS_GROUP_LABEL, eventParameterRows, eyeNotice, foldable, newKeyItemRow, selectionKey } from '../src/panels/tree-rows.js';
import { addBone, addEvent, addParameter, addedEventNotice, addedParameterNotice, newBoneNotice } from '../src/panels/tree-actions.js';
import { currentEventChoice } from '../src/panels/event-key-editor.js';
import { eventFocused, focusEvent, onEventFocus, releaseEventFocus } from '../src/panels/event-key-editor.js';
import { AddConstraint, AddEvent, AddParameter, AddSkin, NEW_BONE_LENGTH } from '../src/panels/tree-commands.js';

// ---------------------------------------------------------------------------
// pegar filhos (lote 31) — era `lote31-pegar-filhos.test.ts`
// ---------------------------------------------------------------------------

describe('pegar filhos (lote 31)', () => {
/**
 * Lote 31 — anotação 17: o pai pega os filhos, como o B do Spriter.
 *
 * Escolhe o pai, segura P, clica em cada filho. Cada clique prende um; clicar
 * de novo solta; soltar a tecla termina. Com dois ou mais escolhidos, P
 * continua sendo o gesto de antes — e quem decide é a seleção no momento em
 * que a tecla desce.
 *
 * Sem DOM. O módulo puro é `viewport/parent-gesture.ts`; a ferramenta é
 * exercitada pelos mesmos `onKey`/`onDown` que a cena chama.
 */
// ---------------------------------------------------------------------------
// O mesmo esqueleto pequeno do lote 0
// ---------------------------------------------------------------------------

/**
 *   root            na origem
 *   +-- hips        em (0, 90), comprimento 10
 *   |   +-- torso   90 graus, comprimento 70: aponta para cima
 *   +-- braco       em (200, 0), comprimento 40
 *   +-- caixa_osso  em (-200, 0), carrega a caixa de colisão
 *   +-- perna       em (0, -100), comprimento 50: nenhum desenho em cima
 *
 * Slot `caixa` no `caixa_osso`, com uma caixa 20x20 centrada no osso.
 * Slot `desenho` no `braco`, com uma região 30x30.
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
      { name: 'perna', parent: 'root', x: 0, y: -100, length: 50 },
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
  get labels(): string[] { return this.done.map((command) => command.label); }

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

function boneOfSlot(doc: TestDoc, slot: string): string | undefined {
  return doc.file.slots?.find((s) => s.name === slot)?.bone;
}

/** Um clique na cena, com o botão esquerdo, do jeito que a cena entrega. */
function click(doc: TestDoc, x: number, y: number): void {
  selectTool.onDown?.(doc, event(x, y));
  selectTool.onUp?.(doc, event(x, y));
}

/** Sai de qualquer gesto pendente: a ferramenta é uma só para todo o teste. */
beforeEach(() => {
  resetViewSettings();
  selectTool.onExit();
});

// ---------------------------------------------------------------------------
// O módulo puro
// ---------------------------------------------------------------------------

// Lote 63a: o P é um gesto só. O "escolher-pai" saiu; o que não é um osso só
// escolhido é `nada`, e o P só dá o recado.
describe('parentGesture: uma tecla, um gesto', () => {
  it('um osso escolhido é o pai; dois ou mais só recebem o recado', () => {
    const um: Selection = { ...emptySelection(), bones: ['hips'] };
    const dois: Selection = { ...emptySelection(), bones: ['hips', 'torso'] };
    expect(parentGesture(um)).toBe('pegar-filhos');
    expect(parentGesture(dois)).toBe('nada');
    expect(parentGesture(emptySelection())).toBe('nada');
  });

  it('um desenho junto também é só o recado: desenho não é pai de ninguém', () => {
    const comSlot: Selection = { ...emptySelection(), bones: ['hips'], slots: ['caixa'] };
    const soSlot: Selection = { ...emptySelection(), slots: ['caixa'] };
    const comAnexo: Selection = {
      ...emptySelection(),
      bones: ['hips'],
      attachments: [{ slot: 'caixa', attachment: 'caixa' }],
    };
    expect(parentGesture(comSlot)).toBe('nada');
    expect(parentGesture(soSlot)).toBe('nada');
    expect(parentGesture(comAnexo)).toBe('nada');
  });
});

describe('ChildGrab: prende, solta, e diz não', () => {
  it('o primeiro clique prende e guarda o pai antigo; o segundo devolve', () => {
    const file = testFile();
    const grab = new ChildGrab('hips');
    const alvo = { kind: 'bone', name: 'braco' } as const;
    expect(grab.click(file, alvo)).toEqual({ do: 'prender', target: alvo, from: 'root' });
    expect(grab.count).toBe(1);
    expect(grab.holds(alvo)).toBe(true);
    // O gesto guarda o pai antigo; o arquivo só muda quando o comando roda.
    expect(grab.click(file, alvo)).toEqual({ do: 'soltar', target: alvo, back: 'root' });
    expect(grab.count).toBe(0);
    expect(grab.holds(alvo)).toBe(false);
  });

  it('osso e slot com o mesmo nome são dois alvos diferentes', () => {
    const file = testFile();
    const grab = new ChildGrab('hips');
    grab.click(file, { kind: 'bone', name: 'caixa_osso' });
    expect(grab.holds({ kind: 'slot', name: 'caixa_osso' })).toBe(false);
    expect(grab.count).toBe(1);
  });

  it('a raiz e o próprio pai: não. O antepassado troca de lugar, o filho desafilha', () => {
    const file = testFile();
    const grab = new ChildGrab('torso');
    expect(grab.click(file, { kind: 'bone', name: 'root' }))
      .toEqual({ do: 'nada', why: 'root é a raiz: a raiz não vira filho de ninguém' });
    expect(grab.click(file, { kind: 'bone', name: 'torso' }))
      .toEqual({ do: 'nada', why: 'torso não pode ser filho de si mesmo' });
    // Item P2: hips é o pai de torso. Pendurar um debaixo do outro seria um
    // ciclo; agora o gesto troca os dois de lugar, como o arrasto da Árvore.
    expect(grab.click(file, { kind: 'bone', name: 'hips' }))
      .toEqual({ do: 'trocar', target: { kind: 'bone', name: 'hips' }, from: 'root' });
    // Item P1: quem já era filho antes do gesto agora **desafilha** no clique.
    const filho = new ChildGrab('hips');
    expect(filho.click(file, { kind: 'bone', name: 'torso' }))
      .toEqual({ do: 'desafilhar', target: { kind: 'bone', name: 'torso' }, to: 'root' });
    // Nem trocar nem desafilhar entram na conta dos filhos novos.
    expect(grab.count).toBe(0);
    expect(filho.count).toBe(0);
  });

  it('P1: com a raiz de pai, quem já está solto não tem para onde ir', () => {
    const file = testFile();
    const grab = new ChildGrab('root');
    expect(grab.click(file, { kind: 'bone', name: 'braco' }))
      .toEqual({ do: 'nada', why: 'braco já está solto na raiz' });
  });

  it('P1: a pintura diz quem já é filho — os ossos e os desenhos', () => {
    const file = testFile();
    expect(grabChildren(file, 'root')).toEqual({
      bones: ['hips', 'braco', 'caixa_osso', 'perna'], slots: [],
    });
    expect(grabChildren(file, 'braco')).toEqual({ bones: [], slots: ['desenho'] });
    expect(grabChildren(file, 'hips')).toEqual({ bones: ['torso'], slots: [] });
    // Só os filhos diretos: torso é filho de hips, não de root.
    expect(grabChildren(file, 'root').bones).not.toContain('torso');
  });

  it('clique no vazio, e nome que não está no arquivo', () => {
    const file = testFile();
    const grab = new ChildGrab('hips');
    expect(grab.click(file, null).do).toBe('nada');
    expect(grab.click(file, { kind: 'slot', name: 'não_existe' }))
      .toEqual({ do: 'nada', why: 'não_existe não está no arquivo' });
  });

  it('os recados dizem o nome do pai e o do filho', () => {
    // Lote 63a: a frase do planejador, a mesma do item de menu.
    expect(grabOpenNotice('hips'))
      .toBe('Segure P: o que está pintado já é filho de hips. Clique para prender ou soltar');
    expect(grabCloseNotice('hips', 0)).toBe('Terminou sem pegar ninguém');
    expect(grabCloseNotice('hips', 1)).toBe('hips ficou com 1 filho novo');
    expect(grabCloseNotice('hips', 2)).toBe('hips ficou com 2 filhos novos');
    const alvo = { kind: 'bone', name: 'braco' } as const;
    expect(stepNotice({ do: 'prender', target: alvo, from: 'root' }, 'hips'))
      .toBe('braco virou filho de hips');
    expect(stepNotice({ do: 'soltar', target: alvo, back: 'root' }, 'hips'))
      .toBe('braco voltou para root');
    expect(stepNotice({ do: 'desafilhar', target: alvo, to: 'root' }, 'hips'))
      .toBe('braco saiu de hips e ficou solto');
    expect(stepNotice({ do: 'trocar', target: alvo, from: 'root' }, 'hips'))
      .toBe('braco e hips trocaram de lugar: braco agora é filho de hips');
    expect(stepNotice({ do: 'nada', why: 'porque não' }, 'hips')).toBe('porque não');
  });
});

// ---------------------------------------------------------------------------
// O gesto inteiro, pela ferramenta
// ---------------------------------------------------------------------------

describe('segurar P e clicar nos filhos', () => {
  it('a sequência do plano: prende dois, solta um, e três desfazeres devolvem o arquivo', () => {
    const doc = new TestDoc(testFile());
    const antes = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
    doc.select({ ...emptySelection(), bones: ['hips'] });
    expect(selectTool.onKey?.(doc, 'p')).toBe(true);
    expect(doc.notices.at(-1)).toBe(grabOpenNotice('hips'));

    // (235, 0) é o traço do braco, longe do desenho que ele carrega;
    // (25, -100) é o da perna, que não tem desenho nenhum em cima.
    click(doc, 235, 0);
    expect(parentOf(doc, 'braco')).toBe('hips');
    click(doc, 25, -100);
    expect(parentOf(doc, 'perna')).toBe('hips');
    // O mesmo osso de novo solta: ele volta para o pai que tinha. Desde o lote
    // 34 ele **não sai do lugar** ao trocar de pai — a pose de mundo é
    // guardada —, então o clique vai no mesmo ponto de antes.
    click(doc, 235, 0);
    expect(parentOf(doc, 'braco')).toBe('root');
    expect(parentOf(doc, 'perna')).toBe('hips');
    expect(doc.notices.at(-1)).toBe('braco voltou para root');

    // Três cliques, três passos, cada um com o nome do filho.
    expect(doc.undoCount).toBe(3);
    expect(doc.labels).toEqual([
      'braco vira filho de hips',
      'perna vira filho de hips',
      'braco volta para root',
    ]);
    expect(selectTool.onKeyUp?.(doc, 'p')).toBe(true);
    // Um preso no fim: o braco entrou e saiu.
    expect(doc.notices.at(-1)).toBe('hips ficou com 1 filho novo');

    doc.undo();
    doc.undo();
    doc.undo();
    expect(doc.file).toEqual(antes);
  });

  it('clicar num desenho prende o slot, não o osso do desenho', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey?.(doc, 'p');
    // (-200, 0) tem a caixa do slot `caixa` por cima do osso.
    click(doc, -200, 0);
    expect(boneOfSlot(doc, 'caixa')).toBe('hips');
    expect(parentOf(doc, 'caixa_osso')).toBe('root');
    expect(doc.notices.at(-1)).toBe('caixa virou filho de hips');
    selectTool.onKeyUp?.(doc, 'p');
  });

  it('P2: clicar no pai do pai troca os dois de lugar, num passo de desfazer', () => {
    const doc = new TestDoc(testFile());
    const antes = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
    // torso é filho de hips. Com torso escolhido, clicar em hips pedia o
    // impossível — um ciclo — e o gesto recusava. Agora os dois trocam.
    doc.select({ ...emptySelection(), bones: ['torso'] });
    selectTool.onKey?.(doc, 'p');
    expect(selectTool.grabFromTree(doc, { kind: 'bone', name: 'hips' })).toBe(true);

    expect(parentOf(doc, 'hips')).toBe('torso');
    expect(parentOf(doc, 'torso')).toBe('root');
    expect(doc.notices.at(-1))
      .toBe('hips e torso trocaram de lugar: hips agora é filho de torso');
    expect(doc.undoCount).toBe(1);
    expect(doc.labels).toEqual(['hips e torso trocam de lugar']);
    selectTool.onKeyUp?.(doc, 'p');

    doc.undo();
    expect(doc.file).toEqual(antes);
  });

  it('P1: clicar em quem já era filho desafilha — ele fica solto na raiz', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey?.(doc, 'p');
    // torso já é filho de hips desde o arquivo: o clique agora solta.
    expect(selectTool.grabFromTree(doc, { kind: 'bone', name: 'torso' })).toBe(true);
    expect(parentOf(doc, 'torso')).toBe('root');
    expect(doc.notices.at(-1)).toBe('torso saiu de hips e ficou solto');
    // Clicar de novo prende de volta: o gesto é um interruptor.
    expect(selectTool.grabFromTree(doc, { kind: 'bone', name: 'torso' })).toBe(true);
    expect(parentOf(doc, 'torso')).toBe('hips');
    selectTool.onKeyUp?.(doc, 'p');
  });

  it('o pai continua escolhido: o clique do gesto não mexe na seleção', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey?.(doc, 'p');
    click(doc, 235, 0);
    expect(doc.selection.bones).toEqual(['hips']);
    selectTool.onKeyUp?.(doc, 'p');
    // Terminado o gesto, o clique volta a escolher. O braco continua onde
    // estava na tela: trocar de pai não move nada desde o lote 34.
    click(doc, 235, 0);
    expect(doc.selection.bones).toEqual(['braco']);
  });

  it('a tecla repetida não desliga o gesto debaixo do dedo', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey?.(doc, 'p');
    selectTool.onKey?.(doc, 'p');
    selectTool.onKey?.(doc, 'P');
    expect(selectTool.grabbingChildren).toBe(true);
    click(doc, 235, 0);
    expect(parentOf(doc, 'braco')).toBe('hips');
    selectTool.onKeyUp?.(doc, 'p');
    expect(selectTool.grabbingChildren).toBe(false);
  });

  it('Esc termina o gesto, e o que já foi preso fica preso', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey?.(doc, 'p');
    click(doc, 235, 0);
    expect(selectTool.onKey?.(doc, 'Escape')).toBe(true);
    expect(selectTool.grabbingChildren).toBe(false);
    expect(parentOf(doc, 'braco')).toBe('hips');
    expect(doc.selection.bones).toEqual(['hips']);
  });

  it('soltar P sem gesto não é nosso; com dois escolhidos, P só dá o recado (lote 63a)', () => {
    const doc = new TestDoc(testFile());
    // Sem gesto nenhum, a subida não é nossa.
    expect(selectTool.onKeyUp?.(doc, 'p')).toBe(false);
    expect(selectTool.onKeyUp?.(doc, 'a')).toBe(false);
    // Dois escolhidos: o interruptor "clique no pai" saiu. P só diz o que fazer.
    doc.select({ ...emptySelection(), bones: ['torso', 'caixa_osso'] });
    selectTool.onKey?.(doc, 'p');
    expect(doc.notices.at(-1)).toBe(chooseBoneNotice());
    expect(selectTool.onKeyUp?.(doc, 'p')).toBe(false);
    expect(selectTool.grabbingChildren).toBe(false);
    click(doc, 200, 0);
    expect(parentOf(doc, 'torso')).toBe('hips');
  });

  it('o cursor muda com o gesto', () => {
    const doc = new TestDoc(testFile());
    expect(selectTool.cursorClass?.()).toBe(null);
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey?.(doc, 'p');
    expect(selectTool.cursorClass?.()).toBe('is-pegando-filhos');
    selectTool.onKeyUp?.(doc, 'p');
    expect(selectTool.cursorClass?.()).toBe(null);
    // Lote 63a: com dois escolhidos não há mais modo, então nem cursor.
    doc.select({ ...emptySelection(), bones: ['torso', 'caixa_osso'] });
    selectTool.onKey?.(doc, 'p');
    expect(selectTool.cursorClass?.()).toBe(null);
  });

  it('clique no vazio dentro do gesto avisa e não muda nada', () => {
    const doc = new TestDoc(testFile());
    doc.select({ ...emptySelection(), bones: ['hips'] });
    selectTool.onKey?.(doc, 'p');
    click(doc, 900, 900);
    expect(doc.undoCount).toBe(0);
    expect(doc.notices.at(-1)).toContain('Nenhum osso nem desenho aqui');
    selectTool.onKeyUp?.(doc, 'p');
    expect(doc.notices.at(-1)).toBe('Terminou sem pegar ninguém');
  });

  it('sem nada escolhido, P avisa e não entra em gesto nenhum', () => {
    const doc = new TestDoc(testFile());
    expect(selectTool.onKey?.(doc, 'p')).toBe(true);
    expect(doc.notices.at(-1)).toContain('Escolha um osso');
    expect(selectTool.grabbingChildren).toBe(false);
  });
});
});

// ---------------------------------------------------------------------------
// trocar de pai (lote 34) — era `lote34-trocar-de-pai.test.ts`
// ---------------------------------------------------------------------------

describe('trocar de pai (lote 34)', () => {
/**
 * Lote 34 — anotação 19: trocar de pai não move nada na tela.
 *
 * Reparentar guardava a pose LOCAL, e o filho pulava de lugar. Agora guarda a
 * pose de MUNDO: `L' = P'⁻¹ · W`, a mesma conta do Compensar. Estes testes
 * medem o mundo antes e depois, com 1e-6 de tolerância — que é o que "não
 * mexeu" quer dizer num programa que escreve números em arquivo.
 *
 * Sem DOM: o comando é do documento, e a conta é de matriz.
 */
const HEROI = resolve(__dirname, '..', '..', 'formato', 'exemplos', 'heroi.bone');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(HEROI, 'utf8')) as BoneFile;
}

/**
 *   root
 *   +-- hips     em (0, 90)
 *   |   +-- torso  90 graus, comprimento 70
 *   |       +-- arm  em (55, -10), girado -160
 *   +-- braco    em (200, 0), girado 25, **escala 0,8 só em Y**
 *
 * Slot `desenho` no `arm`, com uma região deslocada e girada: um desenho que
 * não está na origem do osso é o que pega uma conta errada.
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', x: 0, y: 90 },
      { name: 'torso', parent: 'hips', rotation: 90, length: 70 },
      { name: 'arm', parent: 'torso', x: 55, y: -10, rotation: -160, length: 40 },
      { name: 'braco', parent: 'root', x: 200, y: 0, rotation: 25, scaleY: 0.8 },
    ],
    slots: [{ name: 'desenho', bone: 'arm', attachment: 'desenho' }],
    skins: [{
      name: 'default',
      attachments: {
        desenho: {
          desenho: {
            type: 'region', path: 'x', x: 12, y: -7, rotation: 33,
            scaleX: 1.1, scaleY: 0.9, width: 30, height: 30,
          },
        },
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
    this.dirty = true;
    this.rebuild();
  }
  undo(): void {
    const command = this.done.pop();
    if (command === undefined) return;
    command.revert(this);
    this.rebuild();
  }
  redo(): void {}
  get canUndo(): boolean { return this.done.length > 0; }
  get canRedo(): boolean { return false; }
  get undoLabel(): string | null { return this.done[this.done.length - 1]?.label ?? null; }
  get redoLabel(): string | null { return null; }

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

/** A matriz de mundo de um osso, na pose de repouso, lida do arquivo. */
function mundoDo(file: BoneFile, bone: string): Matrix2x3 {
  const mapa = setupWorldMatrices(file);
  const m = mapa?.get(bone);
  if (m === undefined) throw new Error(`sem mundo para ${bone}`);
  return m;
}

/** Os quatro cantos de uma região, no mundo, na pose de repouso. */
function cantosDo(file: BoneFile, slot: string, attachment: string): number[] {
  const skeleton = new Skeleton(loadSkeletonData(file));
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform();
  const alvo = skeleton.findSlot(slot);
  if (alvo === null) throw new Error(`sem slot ${slot}`);
  const def = alvo.attachment;
  if (def === null) throw new Error(`slot ${slot} sem desenho ${attachment}`);
  const saida: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
  (def as unknown as {
    computeWorldVertices(slot: unknown, out: number[], offset: number, stride: number): void;
  }).computeWorldVertices(alvo, saida, 0, 2);
  return saida;
}

function perto(a: number, b: number, tol = 1e-6): boolean {
  return Math.abs(a - b) <= tol;
}

function esperaMundoIgual(antes: Matrix2x3, depois: Matrix2x3, tol = 1e-6): void {
  for (const chave of ['a', 'b', 'c', 'd', 'worldX', 'worldY'] as const) {
    expect(perto(antes[chave], depois[chave], tol), `${chave}: ${antes[chave]} vs ${depois[chave]}`)
      .toBe(true);
  }
}

describe('trocar de pai guarda a pose de mundo', () => {
  it('o osso fica onde está, e o número local é OUTRO', () => {
    const doc = new TestDoc(testFile());
    const antes = mundoDo(doc.file, 'arm');
    const localAntes = { ...doc.file.bones.find((b) => b.name === 'arm')! };

    doc.run(new Reparent(doc.file, { ...emptySelection(), bones: ['arm'] }, 'hips'));

    const depois = mundoDo(doc.file, 'arm');
    esperaMundoIgual(antes, depois);
    const localDepois = doc.file.bones.find((b) => b.name === 'arm')!;
    expect(localDepois.parent).toBe('hips');
    // O mundo é o mesmo; os números escritos no arquivo, não.
    expect(localDepois.x).not.toBe(localAntes.x);
    expect(localDepois.rotation).not.toBe(localAntes.rotation);
  });

  it('desfazer devolve o número local exato, e a ordem do array', () => {
    const doc = new TestDoc(testFile());
    const antes = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
    doc.run(new Reparent(doc.file, { ...emptySelection(), bones: ['arm'] }, 'hips'));
    doc.undo();
    expect(doc.file).toEqual(antes);
  });

  it('o desenho de um slot fica onde está quando o slot troca de osso', () => {
    const doc = new TestDoc(testFile());
    const antes = cantosDo(doc.file, 'desenho', 'desenho');
    const comando = new Reparent(doc.file, { ...emptySelection(), slots: ['desenho'] }, 'torso');
    doc.run(comando);
    expect(doc.file.slots?.find((s) => s.name === 'desenho')?.bone).toBe('torso');
    expect(comando.distorted).toBe(false);
    const depois = cantosDo(doc.file, 'desenho', 'desenho');
    for (let i = 0; i < antes.length; i++) {
      expect(perto(antes[i]!, depois[i]!, 1e-6), `canto ${i}: ${antes[i]} vs ${depois[i]}`).toBe(true);
    }
    doc.undo();
    const voltou = cantosDo(doc.file, 'desenho', 'desenho');
    for (let i = 0; i < antes.length; i++) expect(perto(antes[i]!, voltou[i]!, 1e-9)).toBe(true);
  });

  it('osso com escala diferente nos dois eixos: a posição fica, o desenho entorta — e a tela é avisada', () => {
    // `braco` tem scaleY 0,8. Uma `region` tem giro e duas escalas, e mais
    // nada: a conta exata pediria uma inclinação que o formato não escreve.
    const doc = new TestDoc(testFile());
    const comando = new Reparent(doc.file, { ...emptySelection(), slots: ['desenho'] }, 'braco');
    doc.run(comando);
    expect(comando.distorted).toBe(true);
    // O canto de referência do desenho — o pivô — continua no lugar certo.
    const pivo = doc.file.skins?.[0]?.attachments?.['desenho']?.['desenho'] as { x: number; y: number };
    expect(Number.isFinite(pivo.x)).toBe(true);
    // E o osso, esse sim, fica exato: `shearY` existe para ele.
    const antesOsso = mundoDo(testFile(), 'arm');
    const doc2 = new TestDoc(testFile());
    doc2.run(new Reparent(doc2.file, { ...emptySelection(), bones: ['arm'] }, 'braco'));
    esperaMundoIgual(antesOsso, mundoDo(doc2.file, 'arm'));
  });

  it('no herói: a espada muda de osso e não anda um pixel', () => {
    const doc = new TestDoc(heroi());
    const antes = cantosDo(doc.file, 'sword_blade', 'blade');
    doc.run(new Reparent(doc.file, { ...emptySelection(), slots: ['sword_blade'] }, 'forearm'));
    const depois = cantosDo(doc.file, 'sword_blade', 'blade');
    for (let i = 0; i < antes.length; i++) {
      expect(perto(antes[i]!, depois[i]!, 1e-6), `canto ${i}`).toBe(true);
    }
  });

  it('no herói: um osso com filhos leva os filhos junto, e nada anda', () => {
    const doc = new TestDoc(heroi());
    const nomes = ['arm', 'forearm', 'hand_target', 'head'];
    const antes = new Map(nomes.map((n) => [n, mundoDo(doc.file, n)]));
    doc.run(new Reparent(doc.file, { ...emptySelection(), bones: ['arm'] }, 'hips'));
    for (const nome of nomes) {
      esperaMundoIgual(antes.get(nome)!, mundoDo(doc.file, nome), 1e-6);
    }
    // `forearm` continua pendurado no `arm`: o que mudou foi só o pai do `arm`.
    expect(doc.file.bones.find((b) => b.name === 'forearm')?.parent).toBe('arm');
    expect(doc.file.bones.find((b) => b.name === 'arm')?.parent).toBe('hips');
  });

  it('vários ossos de uma vez, e os ossos ficam em ordem de leitura', () => {
    const doc = new TestDoc(heroi());
    const nomes = ['arm', 'leg', 'cape1'];
    const antes = new Map(nomes.map((n) => [n, mundoDo(doc.file, n)]));
    doc.run(new Reparent(doc.file, { ...emptySelection(), bones: nomes }, 'root'));
    for (const nome of nomes) esperaMundoIgual(antes.get(nome)!, mundoDo(doc.file, nome), 1e-6);
    // Pai antes de filho, que é o que o leitor exige (§7.2).
    const ordem = doc.file.bones.map((b) => b.name);
    for (const bone of doc.file.bones) {
      if (bone.parent === undefined) continue;
      expect(ordem.indexOf(bone.parent), bone.name).toBeLessThan(ordem.indexOf(bone.name));
    }
  });

  it('a malha COM PESOS não é mexida: quem manda nela é o binding', () => {
    const doc = new TestDoc(heroi());
    const antes = cantosDo(doc.file, 'head', 'face');
    const defAntes = JSON.parse(JSON.stringify(
      doc.file.skins?.[0]?.attachments?.['head']?.['face'],
    )) as unknown;
    doc.run(new Reparent(doc.file, { ...emptySelection(), slots: ['head'] }, 'hips'));
    const depois = cantosDo(doc.file, 'head', 'face');
    for (let i = 0; i < antes.length; i++) expect(perto(antes[i]!, depois[i]!, 1e-9)).toBe(true);
    // O desenho não foi tocado: o mundo dele já não dependia do osso do slot.
    expect(doc.file.skins?.[0]?.attachments?.['head']?.['face']).toEqual(defAntes);
  });
});

describe('o que pode e o que não pode virar filho', () => {
  it('a raiz, o próprio pai e um antepassado ficam de fora', () => {
    const file = testFile();
    const alvos = reparentTargets(
      file,
      { ...emptySelection(), bones: ['root', 'torso', 'arm', 'hips'] },
      'torso',
    );
    // `root` é a raiz; `torso` é o próprio pai; `hips` é antepassado do torso.
    expect(alvos.bones).toEqual(['arm']);
    expect(alvos.skipped).toEqual(['root', 'torso', 'hips']);
  });

  it('um desenho escolhido leva o slot dele', () => {
    const file = testFile();
    const alvos = reparentTargets(
      file,
      { ...emptySelection(), attachments: [{ slot: 'desenho', attachment: 'desenho' }] },
      'braco',
    );
    expect(alvos.slots).toEqual(['desenho']);
    expect(alvos.bones).toEqual([]);
  });

  it('sem nada que possa mover, o comando diz que não tem trabalho', () => {
    const file = testFile();
    const cmd = new Reparent(file, { ...emptySelection(), bones: ['root'] }, 'torso');
    expect(cmd.hasWork).toBe(false);
    expect(cmd.skipped).toEqual(['root']);
  });
});
});

// ---------------------------------------------------------------------------
// raiz invisivel (lote 60a) — era `lote60a-raiz-invisivel.test.ts`
// ---------------------------------------------------------------------------

describe('raiz invisivel (lote 60a)', () => {
/**
 * Lote 60a (plano pasta do projeto, "A raiz é invisível").
 *
 * Sem DOM. O Humberto, 10/09/2026, com duas imagens soltas escolhidas:
 * *"estão presas a um osso maldito, eu não fiz esse osso"*. Era a raiz: o
 * clique no desenho escolhia também o osso dele, e a caixa do Transformar
 * englobava o pivô da raiz, na origem. O que se prova aqui: a raiz não pega
 * clique nem se desenha; com só desenhos escolhidos, a caixa e o pivô são
 * deles, e girar e escalar mexem em cada um em volta do centro comum; a
 * Árvore e as Propriedades não mostram mais a raiz como osso.
 */
const SRC = resolve(__dirname, '../src');
const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');

/** Só a raiz, e duas imagens soltas nela: (10,10)–(110,60) e (210,10)–(310,60). */
function solto(root: Record<string, unknown> = {}): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root', ...root }],
    slots: [
      { name: 'a', bone: 'root', attachment: 'a' },
      { name: 'b', bone: 'root', attachment: 'b' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        a: { a: { type: 'region', path: 'a', x: 60, y: 35, width: 100, height: 50 } },
        b: { b: { type: 'region', path: 'b', x: 260, y: 35, width: 100, height: 50 } },
      },
    }],
  } as unknown as BoneFile);
}

/** Os dois desenhos escolhidos, e nenhum osso. */
function osDois(doc: Doc): Doc {
  doc.select({
    ...emptySelection(), slots: ['a', 'b'],
    attachments: [{ slot: 'a', attachment: 'a' }, { slot: 'b', attachment: 'b' }],
  });
  return doc;
}

function anexo(doc: Doc, slot: string): Record<string, number> {
  const skin = doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, number>>>;
  return skin[slot]![slot]!;
}

function ev(p: Point, extra: Partial<ToolEvent> = {}): ToolEvent {
  return { x: p.x, y: p.y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1, ...extra };
}

/** Um arrasto de verdade: descer, andar em quatro passos, subir. */
function arrastar(tool: Tool, doc: Doc, de: Point, ate: Point): void {
  tool.onDown!(doc, ev(de));
  for (let i = 1; i <= 4; i++) {
    tool.onMove!(doc, ev({ x: de.x + ((ate.x - de.x) * i) / 4, y: de.y + ((ate.y - de.y) * i) / 4 }));
  }
  tool.onUp!(doc, ev(ate));
  doc.endMerge();
}

describe('a raiz não pega clique e não se desenha', () => {
  it('pick na origem do mundo, sem osso além da raiz: nada', () => {
    expect(pickAt(solto().skeleton, 0, 0, 1)).toBeNull();
  });

  it('o retângulo sobre tudo escolhe os 2 desenhos e nenhum osso', () => {
    const hits = pickInRect(solto().skeleton, { x1: -500, y1: -500, x2: 500, y2: 500 });
    expect(hits.map((h) => h.kind)).toEqual(['attachment', 'attachment']);
  });

  it('clicar num desenho solto escolhe o desenho, e não a raiz; com Shift, os dois', () => {
    const doc = solto();
    const um = selectionFor(emptySelection(), pickAt(doc.skeleton, 60, 35, 1), false, 'root');
    expect(um.bones).toEqual([]);
    expect(um.attachments).toEqual([{ slot: 'a', attachment: 'a' }]);
    const dois = selectionFor(um, pickAt(doc.skeleton, 260, 35, 1), true, 'root');
    expect(dois.bones).toEqual([]);
    expect(dois.attachments).toHaveLength(2);
    // Rodada 8d, reescrito de propósito: desenho num osso de verdade também
    // escolhe só o desenho, como no Spriter. Era `['arm']`.
    const noArm = selectionFor(emptySelection(), { kind: 'attachment', bone: 'arm', slot: 'c', attachment: 'c' }, false, 'root');
    expect(noArm.bones).toEqual([]);
    // A raiz nunca vem, nem para a imagem que levaria o osso junto.
    expect(selectionFor(emptySelection(), pickAt(doc.skeleton, 60, 35, 1), false, 'root', () => true).bones).toEqual([]);
  });

  it('o clique do Selecionar na cena não escolhe a raiz', () => {
    const doc = solto();
    selectTool.onDown(doc, ev({ x: 60, y: 35 }));
    selectTool.onUp(doc, ev({ x: 60, y: 35 }));
    expect(doc.selection.bones).toEqual([]);
    expect(doc.selection.attachments).toEqual([{ slot: 'a', attachment: 'a' }]);
  });

  it('a cena, os nomes, os ícones e o fantasma pulam a raiz', () => {
    // Lote A5c: a cena mora em três arquivos (o desenho foi para viewport-draw.ts).
    const cena = ['viewport', 'viewport-toolbar', 'viewport-draw']
      .map((nome) => readFileSync(resolve(SRC, `viewport/${nome}.ts`), 'utf8')).join('\n');
    expect(cena.split('if (bone === skeleton.root) continue;').length - 1).toBe(3);
    const fantasma = readFileSync(resolve(SRC, 'viewport/onion.ts'), 'utf8');
    expect(fantasma).toContain('if (bone === skeleton.bones[0]) continue;');
  });
});

describe('Transformar com só desenhos: a caixa e o pivô são deles', () => {
  it('2 desenhos na raiz: caixa (10,10)–(310,60), pivô (160,35); a origem fica fora', () => {
    const box = transformBox(osDois(solto()), 1)!;
    expect(box).not.toBeNull();
    const [sw, , ne] = box.corners;
    expect(sw.x).toBeCloseTo(10, 6);
    expect(sw.y).toBeCloseTo(10, 6);
    expect(ne.x).toBeCloseTo(310, 6);
    expect(ne.y).toBeCloseTo(60, 6);
    expect(box.pivot.x).toBeCloseTo(160, 6);
    expect(box.pivot.y).toBeCloseTo(35, 6);
    expect(transformHit({ x: 0, y: 0 }, box, 7)).toBe('outside');
  });

  it('arrastar por dentro move os dois; a raiz fica; um passo desfaz', () => {
    const doc = osDois(solto());
    const texto = JSON.stringify(doc.file);
    // Lote 60c: o vão vazio entre as duas peças passa direto; o arrasto pega a peça a.
    arrastar(transformTool, doc, { x: 60, y: 35 }, { x: 80, y: 45 });
    expect(anexo(doc, 'a').x).toBeCloseTo(80, 6);
    expect(anexo(doc, 'a').y).toBeCloseTo(45, 6);
    expect(anexo(doc, 'b').x).toBeCloseTo(280, 6);
    expect(doc.file.bones![0]).toEqual({ name: 'root' });
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('girar pela bolinha: cada um gira em volta do centro comum, e vira junto', () => {
    const doc = osDois(solto());
    const box = transformBox(doc, 1)!;
    const knob = box.knob;
    const alvo = { x: box.pivot.x - (knob.y - box.pivot.y), y: box.pivot.y + (knob.x - box.pivot.x) };
    arrastar(transformTool, doc, knob, alvo);
    expect(anexo(doc, 'a').x).toBeCloseTo(160, 4);
    expect(anexo(doc, 'a').y).toBeCloseTo(-65, 4);
    expect(anexo(doc, 'a').rotation).toBeCloseTo(90, 4);
    expect(anexo(doc, 'b').x).toBeCloseTo(160, 4);
    expect(anexo(doc, 'b').y).toBeCloseTo(135, 4);
    expect(anexo(doc, 'b').rotation).toBeCloseTo(90, 4);
  });

  it('escalar pelo canto: cada um se afasta do centro comum, e cresce junto', () => {
    const doc = osDois(solto());
    arrastar(transformTool, doc, { x: 310, y: 60 }, { x: 460, y: 85 });
    expect(anexo(doc, 'a').x).toBeCloseTo(-40, 4);
    expect(anexo(doc, 'a').y).toBeCloseTo(35, 4);
    expect(anexo(doc, 'a').scaleX).toBeCloseTo(2, 4);
    expect(anexo(doc, 'a').scaleY).toBeCloseTo(2, 4);
    expect(anexo(doc, 'b').x).toBeCloseTo(360, 4);
  });

  it('as setas levam os desenhos, e não a raiz', () => {
    const doc = osDois(solto());
    expect(nudgeSelection(doc, 1, 0)).toBe(0);
    expect(nudgeDrawings(doc, 1, 0)).toBe(2);
    expect(anexo(doc, 'a').x).toBe(61);
    expect(anexo(doc, 'b').x).toBe(261);
    expect(doc.file.bones![0]).toEqual({ name: 'root' });
  });
});

describe('a Árvore e as Propriedades', () => {
  it('heroi: a primeira linha não é root; os filhos da raiz no nível 0', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    const ossos = hierarchyRows(doc.file).filter((row) => row.kind === 'bone');
    expect(ossos[0]!.name).not.toBe('root');
    expect(ossos.some((row) => row.name === 'root')).toBe(false);
    expect(ossos.find((row) => row.name === 'hips')!.depth).toBe(0);
    expect(ossos.find((row) => row.name === 'torso')!.depth).toBe(1);
    // A ordem do arquivo ainda vê a raiz: `sortBonesTopologically` depende dela.
    expect(boneRows(doc.file)[0]!.name).toBe('root');
  });

  it('desenho na raiz: o slot diz livre', () => {
    // Lote 64: na árvore única, o desenho solto fica no nível 0, sem osso em cima.
    const linhas = hierarchyRows(solto().file).filter((row) => row.kind === 'slot');
    expect(linhas.map((row) => [row.depth, row.owner])).toEqual([[0, undefined], [0, undefined]]);
    // Na aba Ordem, o slot continua dizendo livre.
    expect(slotRows(solto().file).map((row) => row.detail)).toEqual(['livre', 'livre']);
  });

  it('arquivo com root movido (x 10): a linha raiz aparece, com a dica', () => {
    const file = solto({ x: 10 }).file;
    expect(rootHidden(file)).toBe(false);
    const raiz = hierarchyRows(file)[0]!;
    expect(raiz.label).toBe('raiz');
    expect(raiz.hint).toBe(ROOT_HINT);
    expect(ROOT_HINT).toContain('O mundo');
  });

  it('Propriedades de um desenho na raiz: o campo Osso diz nenhum (livre)', () => {
    const campo = slotFields(solto().file, 'a')[0]!.fields.find((f) => f.key === 'bone')!;
    expect(campo.options![0]).toEqual({ value: 'root', label: 'nenhum (livre)' });
  });
});
});

// ---------------------------------------------------------------------------
// um gesto (lote 63a) — era `lote63a-um-gesto.test.ts`
// ---------------------------------------------------------------------------

describe('um gesto (lote 63a)', () => {
/**
 * Lote 63a — "o P é um gesto só", e o prender que movia.
 *
 * Sem DOM. Três recados do Humberto, 11/09/2026:
 *
 * - *"O QUE É ISSO? ISSO NÃO TEM NO SPRITER. É SÓ ESCOLHER O OSSO, APERTAR P
 *   E IR VIRANDO PAI DE QUEM EU CLICAR."* — saíram o modo "clique no pai" e a
 *   janela "Virar filho de qual osso?";
 * - *"associei um objeto ao osso, ele arrastou o objeto"* — os quatro
 *   caminhos de prender guardam o mundo, em Montagem e em Animando;
 * - *"a Árvore está bugada, não dá para mudar o parentesco por lá"* — desenho
 *   sobre osso na Árvore agora troca o pai.
 */
const SRC = resolve(__dirname, '../src');

/**
 * O osso `b` girado 45° e com escala 1,5; o osso `o` solto na raiz. Na raiz,
 * soltos: a imagem `r` (x/y ≠ 0, girada) e a caixa de colisão `caixa`. A pele
 * `outra` tem outro desenho no mesmo slot `r`. A animação `anda` gira `b` a 80°.
 */
function cena(): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'b', parent: 'root', x: 50, y: 20, rotation: 45, scaleX: 1.5, scaleY: 1.5, length: 30 },
      { name: 'o', parent: 'root', x: -40, y: 10, rotation: 20, length: 20 },
    ],
    slots: [
      { name: 'r', bone: 'root', attachment: 'r' },
      { name: 'caixa', bone: 'root', attachment: 'caixa' },
    ],
    skins: [
      {
        name: 'default',
        attachments: {
          r: { r: { type: 'region', path: 'r', x: 30, y: 40, rotation: 10, width: 20, height: 10 } },
          caixa: { caixa: { type: 'boundingbox', shape: 'polygon', vertices: [-60, -10, -40, -10, -40, 5, -60, 5] } },
        },
      },
      {
        name: 'outra',
        attachments: {
          r: { r2: { type: 'region', path: 'r2', x: -15, y: 25, rotation: -30, scaleX: 0.8, width: 16, height: 12 } },
        },
      },
    ],
    animations: [{
      name: 'anda',
      duration: 1,
      timelines: [{ type: 'bone', target: 'b', property: 'rotation', keys: [{ time: 0, value: 80 }] }],
    }],
  } as unknown as BoneFile);
}

type Mundo = (bone: string) => Matrix2x3;

const repouso = (doc: Doc): Mundo => {
  const m = setupWorldMatrices(doc.file)!;
  return (name) => m.get(name)!;
};

const naTela = (doc: Doc): Mundo => {
  const m = liveWorldMatrices(doc)!;
  return (name) => m.get(name)!;
};

/** Os cantos (imagem) ou os vértices (caixa) de um desenho, no mundo. */
function cantos(doc: Doc, skin: number, slot: string, nome: string, mundo: Mundo): number[] {
  const osso = doc.file.slots!.find((s) => s.name === slot)!.bone;
  const m = mundo(osso);
  const skins = doc.file.skins![skin]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>;
  const def = skins[slot]![nome]! as Record<string, number> & { type: string; vertices?: number[] };
  const pontos: Array<[number, number]> = [];
  if (def.type === 'region') {
    const r = ((def.rotation ?? 0) * Math.PI) / 180;
    const sx = def.scaleX ?? 1;
    const sy = def.scaleY ?? 1;
    for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]] as const) {
      const lx = ((cx * def.width!) / 2) * sx;
      const ly = ((cy * def.height!) / 2) * sy;
      pontos.push([(def.x ?? 0) + lx * Math.cos(r) - ly * Math.sin(r), (def.y ?? 0) + lx * Math.sin(r) + ly * Math.cos(r)]);
    }
  } else {
    const v = def.vertices!;
    for (let i = 0; i + 1 < v.length; i += 2) pontos.push([v[i]!, v[i + 1]!]);
  }
  return pontos.flatMap(([x, y]) => [m.a * x + m.b * y + m.worldX, m.c * x + m.d * y + m.worldY]);
}

function mesmoLugar(antes: readonly number[], depois: readonly number[]): void {
  expect(depois).toHaveLength(antes.length);
  antes.forEach((valor, i) => expect(depois[i]).toBeCloseTo(valor, 6));
}

function matrizIgual(antes: Matrix2x3, depois: Matrix2x3): void {
  for (const k of ['a', 'b', 'c', 'd', 'worldX', 'worldY'] as const) expect(depois[k]).toBeCloseTo(antes[k], 6);
}

function ev(x: number, y: number): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 };
}

function clique(doc: Doc, x: number, y: number): void {
  selectTool.onDown(doc, ev(x, y));
  selectTool.onUp(doc, ev(x, y));
}

function boneOf(doc: Doc, slot: string): string {
  return doc.file.slots!.find((s) => s.name === slot)!.bone;
}

function parentOf(doc: Doc, bone: string): string | undefined {
  return doc.file.bones.find((b) => b.name === bone)?.parent;
}

/** Os dois desenhos do slot `r`, nas duas peles, e a caixa. */
function todos(doc: Doc, mundo: Mundo): number[][] {
  return [cantos(doc, 0, 'r', 'r', mundo), cantos(doc, 1, 'r', 'r2', mundo), cantos(doc, 0, 'caixa', 'caixa', mundo)];
}

describe('o P é um gesto só', () => {
  it('parentGesture tem dois resultados: pegar-filhos ou nada', () => {
    expect(parentGesture({ ...emptySelection(), bones: ['b'] })).toBe('pegar-filhos');
    expect(parentGesture({ ...emptySelection(), bones: ['b', 'o'] })).toBe('nada');
    expect(parentGesture({ ...emptySelection(), slots: ['r'] })).toBe('nada');
    expect(parentGesture(emptySelection())).toBe('nada');
  });

  it('as frases do rodapé', () => {
    expect(grabOpenNotice('hips'))
      .toBe('Segure P: o que está pintado já é filho de hips. Clique para prender ou soltar');
    expect(chooseBoneNotice()).toBe('Escolha um osso. Depois segure P e clique em quem vira filho dele');
  });

  it('dois ossos escolhidos: P só dá o recado, e nada vira filho', () => {
    const doc = cena();
    const texto = JSON.stringify(doc.file);
    doc.select({ ...emptySelection(), bones: ['b', 'o'] });
    selectTool.onKey(doc, 'p');
    expect(selectTool.grabbingChildren).toBe(false);
    clique(doc, 30, 40);
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('a janela saiu da cena e da Árvore; o item do menu abre o MESMO gesto (rodada 17, J2)', () => {
    const cenaFonte = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8');
    expect(cenaFonte).not.toContain('Virar filho de qual osso?');
    expect(cenaFonte).toContain('private reparentHint(doc: EditorDoc)');
    expect(cenaFonte).toContain('selectTool.openGrabFromMenu(doc);');
    const arvore = readFileSync(resolve(SRC, 'panels/tree.ts'), 'utf8');
    expect(arvore).not.toContain("'virar-filho'");
    const menu = readFileSync(resolve(SRC, 'ui/menus.ts'), 'utf8');
    expect(menu).toContain("hint: 'Com um osso escolhido: clique em quem vira filho dele, até o Esc. O mesmo que segurar P'");
  });

  it('rodada 17, J2: o item do menu prende de verdade, sem segurar P, até o Esc', () => {
    const doc = cena();
    doc.select({ ...emptySelection(), bones: ['b'] });
    expect(selectTool.openGrabFromMenu(doc)).toBe(true);
    expect(selectTool.grabbingChildren).toBe(true);
    expect(grabMenuNotice('b')).toBe('Virar filho de b: clique em quem vira filho (clicar de novo solta). Esc termina');
    clique(doc, 30, 40); // a imagem r
    expect(doc.file.slots!.find((s) => s.name === 'r')!.bone).toBe('b');
    // Continua aberto: o dedo não está em tecla nenhuma.
    expect(selectTool.grabbingChildren).toBe(true);
    expect(selectTool.onKey(doc, 'Escape')).toBe(true);
    expect(selectTool.grabbingChildren).toBe(false);
    // Sem um osso só escolhido, não abre (quem chama dá o recado).
    doc.select({ ...emptySelection(), bones: ['b', 'o'] });
    expect(selectTool.openGrabFromMenu(doc)).toBe(false);
    expect(selectTool.grabbingChildren).toBe(false);
  });
});

describe('prender não move: os quatro caminhos, em Montagem', () => {
  it('(a) P + clique: a imagem (nas duas peles), a caixa e um osso ficam onde estavam', () => {
    const doc = cena();
    const texto = JSON.stringify(doc.file);
    const antes = todos(doc, repouso(doc));
    const osso = repouso(doc)('o');
    doc.select({ ...emptySelection(), bones: ['b'] });
    selectTool.onKey(doc, 'p');
    clique(doc, 30, 40); // a imagem r
    clique(doc, -50, -2); // a caixa
    clique(doc, -30.6, 13.4); // o traço do osso o
    selectTool.onKeyUp(doc, 'p');
    expect([boneOf(doc, 'r'), boneOf(doc, 'caixa'), parentOf(doc, 'o')]).toEqual(['b', 'b', 'b']);
    todos(doc, repouso(doc)).forEach((depois, i) => mesmoLugar(antes[i]!, depois));
    matrizIgual(osso, repouso(doc)('o'));
    doc.undo();
    doc.undo();
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('(b) Árvore: o slot, a linha do desenho e o osso soltos em cima de b', () => {
    const doc = cena();
    const antes = todos(doc, repouso(doc));
    const osso = repouso(doc)('o');
    // Lote 64: a Árvore é uma árvore só; a linha do slot r é a do desenho dele.
    const linhas = hierarchyRows(doc.file);
    const slots = slotRows(doc.file);
    const b = linhas.find((row) => row.id === 'bone:b')!;
    const pelaLinhaDoSlot = treeDropAction(doc.file, linhas.find((row) => row.id === 'slot:r')!, b)!;
    expect(pelaLinhaDoSlot).toEqual({ kind: 'reparent', selection: { ...emptySelection(), slots: ['r'] }, parent: 'b' });
    const pelaLinhaDoDesenho = treeDropAction(doc.file, attachmentRows(doc.file).find((row) => row.slot === 'caixa')!, b)!;
    expect(pelaLinhaDoDesenho.kind).toBe('reparent');
    const texto = JSON.stringify(doc.file);
    for (const acao of [pelaLinhaDoSlot, pelaLinhaDoDesenho]) {
      if (acao.kind === 'reparent') runReparent(doc, acao.selection, acao.parent);
    }
    const doOsso = treeDropAction(doc.file, linhas.find((row) => row.id === 'bone:o')!, b)!;
    if (doOsso.kind === 'reparent') runReparent(doc, doOsso.selection, doOsso.parent);
    expect([boneOf(doc, 'r'), boneOf(doc, 'caixa'), parentOf(doc, 'o')]).toEqual(['b', 'b', 'b']);
    todos(doc, repouso(doc)).forEach((depois, i) => mesmoLugar(antes[i]!, depois));
    matrizIgual(osso, repouso(doc)('o'));
    doc.undo();
    doc.undo();
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
    // Slot sobre slot continua mudando a ordem; desenho no próprio osso, nada.
    expect(treeDropAction(doc.file, slots[0]!, slots[1]!)).toEqual({ kind: 'order', from: 0, to: 1 });
    expect(treeDropAction(doc.file, slots[0]!, linhas.find((row) => row.id === 'bone:o')!)).not.toBeNull();
  });

  it('(c) campo Osso das Propriedades: a mesma porta, o mesmo lugar', () => {
    const doc = cena();
    const antes = todos(doc, repouso(doc));
    const campo = slotFields(doc.file, 'r')[0]!.fields.find((f) => f.key === 'bone')!;
    expect(campo.options!.map((o) => o.value)).toContain('b');
    runReparent(doc, { ...emptySelection(), slots: ['r', 'caixa'] }, 'b');
    todos(doc, repouso(doc)).forEach((depois, i) => mesmoLugar(antes[i]!, depois));
  });

  it('(d) Criar osso com os desenhos escolhidos: o osso novo pega sem mover', () => {
    const doc = cena();
    const texto = JSON.stringify(doc.file);
    const antes = todos(doc, repouso(doc));
    const def = { name: 'novo', parent: 'root', x: 50, y: 20, rotation: 45, scaleX: 1.5, scaleY: 1.5, length: 30 };
    doc.run(new CreateBoneAndGrab(def as never, ['r', 'caixa']));
    expect([boneOf(doc, 'r'), boneOf(doc, 'caixa')]).toEqual(['novo', 'novo']);
    todos(doc, repouso(doc)).forEach((depois, i) => mesmoLugar(antes[i]!, depois));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });
});

describe('prender não move, em Animando', () => {
  // Degrau 7, tarefa 7.3 (F8, spec 9.5): com uma animação aberta, o desenho
  // troca de osso **por chave**, e não mais na base. O teste de antes provava o
  // modo antigo — `slots[].bone` mudava no arquivo —, e foi reescrito: a base
  // fica intacta, a chave `slot/bone` grava o osso novo, e o desenho continua
  // exatamente onde estava no quadro que se vê.
  it('só desenhos: a base não muda, a chave grava, e o mundo é o do quadro que se vê', () => {
    const doc = cena();
    switchAnimation(doc, 'anda');
    const b = naTela(doc)('b');
    // A pose da tela não é a de repouso: sem isso o teste não provaria nada.
    expect(b.a).not.toBeCloseTo(repouso(doc)('b').a, 3);
    const antes = todos(doc, naTela(doc));
    doc.select({ ...emptySelection(), bones: ['b'] });
    selectTool.onKey(doc, 'p');
    clique(doc, 30, 40);
    clique(doc, -50, -2);
    selectTool.onKeyUp(doc, 'p');
    expect(doc.animation).toBe('anda');
    // A base do corpo continua dizendo `root`: quem trocou foi a animação.
    expect([boneOf(doc, 'r'), boneOf(doc, 'caixa')]).toEqual(['root', 'root']);
    for (const slot of ['r', 'caixa']) {
      const chave = chaveDoSlot(doc, slot, doc.time);
      expect(chave?.value, slot).toBe('b');
      expect(chave?.transform, slot).toBeDefined();
    }
    todos(doc, naTela(doc)).forEach((depois, i) => mesmoLugar(antes[i]!, depois));
  });

  it('um desfazer só devolve tudo: o osso e o desenho vão no mesmo comando', () => {
    const doc = cena();
    switchAnimation(doc, 'anda');
    const texto = JSON.stringify(doc.file);
    doc.select({ ...emptySelection(), bones: ['o'], slots: ['r'] });
    runReparent(doc, { ...emptySelection(), bones: ['o'], slots: ['r'] }, 'b');
    expect(JSON.stringify(doc.file)).not.toBe(texto);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('antes da chave o desenho ainda é do osso do arquivo: nasce um `null` em 0', () => {
    const doc = cena();
    switchAnimation(doc, 'anda');
    doc.time = 0.5;
    runReparent(doc, { ...emptySelection(), slots: ['r'] }, 'b');
    expect(chaveDoSlot(doc, 'r', 0)?.value ?? null).toBe(null);
    expect(chaveDoSlot(doc, 'r', 0.5)?.value).toBe('b');
  });

  it('voltar ao osso do arquivo grava `null`, e sem `transform`', () => {
    const doc = cena();
    switchAnimation(doc, 'anda');
    doc.time = 0.5;
    runReparent(doc, { ...emptySelection(), slots: ['r'] }, 'root');
    const chave = chaveDoSlot(doc, 'r', 0.5);
    expect(chave?.value ?? null).toBe(null);
    expect(chave?.transform).toBeUndefined();
  });

  it('a conta do `transform` é T depois R (C-295): o desenho não salta', () => {
    const doc = cena();
    switchAnimation(doc, 'anda');
    doc.time = 0.5;
    const antes = todos(doc, naTela(doc));
    runReparent(doc, { ...emptySelection(), slots: ['r', 'caixa'] }, 'b');
    todos(doc, naTela(doc)).forEach((depois, i) => mesmoLugar(antes[i]!, depois));
  });

  it('com a base aberta, nada disso muda: o osso do slot é reescrito como sempre', () => {
    const doc = cena();
    const antes = todos(doc, repouso(doc));
    runReparent(doc, { ...emptySelection(), slots: ['r'] }, 'b');
    expect(boneOf(doc, 'r')).toBe('b');
    todos(doc, repouso(doc)).forEach((depois, i) => mesmoLugar(antes[i]!, depois));
  });
});

/** A chave `slot/bone` de um slot num instante, ou `null`. */
function chaveDoSlot(
  doc: Doc, slot: string, time: number,
): { value?: unknown; transform?: unknown } | null {
  const linha = findTimeline(doc.file, doc.animation!, slotTarget(slot, 'bone'));
  if (linha === null) return null;
  const keys = (linha as unknown as { keys: Array<{ time: number }> }).keys;
  return (keys.find((key) => Math.abs(key.time - time) < 1e-6) ?? null) as never;
}

describe('virar malha não foge', () => {
  /** Uma região de atlas numa página 512×512. */
  function regiao(o: {
    w: number; h: number; ox: number; oy: number; OW: number; OH: number; scale?: number; rot?: 0 | 90;
  }): AtlasRegionData {
    return new AtlasRegionData(0, 'mao', { width: 512, height: 512 } as never, o.scale ?? 1, {
      x: 10, y: 20, width: o.w, height: o.h, rotation: o.rot ?? 0,
      offsetX: o.ox, offsetY: o.oy, originalWidth: o.OW, originalHeight: o.OH,
    });
  }

  const atlas = {
    cortado: regiao({ w: 40, h: 30, ox: 7, oy: 5, OW: 60, OH: 44 }),
    escalaEDeitado: regiao({ w: 80, h: 60, ox: 14, oy: 10, OW: 120, OH: 88, scale: 2, rot: 90 }),
    daPasta: regiao({ w: 64, h: 48, ox: 0, oy: 0, OW: 64, OH: 48 }),
  };
  const ossos: Record<string, Matrix2x3> = {
    solto: { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 },
    preso: (() => {
      const r = Math.PI / 4;
      return { a: 1.5 * Math.cos(r), b: -1.5 * Math.sin(r), c: 1.5 * Math.sin(r), d: 1.5 * Math.cos(r), worldX: 50, worldY: 20 };
    })(),
  };
  const mundo = (m: Matrix2x3, v: ArrayLike<number>): number[] => {
    const out: number[] = [];
    for (let i = 0; i + 1 < v.length; i += 2) out.push(m.a * v[i]! + m.b * v[i + 1]! + m.worldX, m.c * v[i]! + m.d * v[i + 1]! + m.worldY);
    return out;
  };

  for (const [nomeAtlas, reg] of Object.entries(atlas)) {
    for (const giro of [0, 30]) {
      for (const [nomeOsso, m] of Object.entries(ossos)) {
        it(`${nomeAtlas}, giro ${giro}, ${nomeOsso}: os 4 cantos e os UV iguais, sem width/height no desenho`, () => {
          const def = { type: 'region' as const, path: 'mao', x: 12, y: -8, rotation: giro, scaleX: 1.2, scaleY: 0.9 };
          const antes = new Float64Array(8);
          const uvAntes = new Float64Array(8);
          computeRegionFrame({ x: 12, y: -8, rotation: giro, scaleX: 1.2, scaleY: 0.9, width: 0, height: 0 }, reg, antes, uvAntes);
          const malha = regionToMesh(def, undefined, reg);
          mesmoLugar(mundo(m, antes), mundo(m, malha.vertices!));
          const uvDepois = new Float64Array(8);
          computeMeshRegionUVs(Float64Array.from(malha.uvs!), reg, uvDepois);
          [...uvAntes].forEach((v, i) => expect(uvDepois[i]).toBeCloseTo(v, 9));
        });
      }
    }
  }

  it('sem atlas, com width/height no desenho: como antes, de −W/2 a W/2', () => {
    const malha = regionToMesh({ type: 'region', width: 20, height: 10 });
    expect(malha.vertices).toEqual([-10, -5, 10, -5, 10, 5, -10, 5]);
    expect(malha.uvs).toEqual([0, 1, 1, 1, 1, 0, 0, 0]);
  });

});

describe('a raiz fora das listas de ossos', () => {
  it('as listas de uma regra não mostram a raiz; ela só fica se já for o valor', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'a', parent: 'root', length: 10 }, { name: 'c', parent: 'root', length: 10 }],
      constraints: [
        { type: 'ik', name: 'ik', bones: ['a'], target: 'c', mix: 1 },
        { type: 'ik', name: 'velho', bones: ['a'], target: 'root', mix: 1 },
      ],
    } as unknown as BoneFile;
    const campos = constraintFields(file, 'ik').flatMap((g) => g.fields);
    expect(campos.find((f) => f.key === 'target')!.options!.map((o) => o.value)).toEqual(['a', 'c']);
    expect(campos.find((f) => f.key === 'bones')!.options!.map((o) => o.value)).toEqual(['a', 'c']);
    const velho = constraintFields(file, 'velho').flatMap((g) => g.fields);
    expect(velho.find((f) => f.key === 'target')!.options!.map((o) => o.value)).toEqual(['root', 'a', 'c']);
  });
});
});

// ---------------------------------------------------------------------------
// arvore unica (lote 64) — era `lote64-arvore-unica.test.ts`
// ---------------------------------------------------------------------------

describe('arvore unica (lote 64)', () => {
/**
 * Lote 64 — uma árvore só, como a Hierarchy do Spriter.
 *
 * Sem DOM. O Humberto, 10/09/2026, com a foto da Árvore: *"são três listas que
 * não dizem nada: que osso manda em qual peça?"*. Agora cada osso tem por
 * baixo, primeiro, os desenhos dele e, depois, os ossos filhos.
 */
const SRC = resolve(__dirname, '../src');
const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
const heroi = (): BoneFile => JSON.parse(HEROI) as BoneFile;
const ler = (caminho: string): string => readFileSync(resolve(SRC, caminho), 'utf8').replace(/\r\n/g, '\n');

function linha(rows: readonly TreeRow[], id: string): TreeRow {
  const achada = rows.find((row) => row.id === id);
  if (achada === undefined) throw new Error(`sem a linha ${id}`);
  return achada;
}

const CABECALHO = { version: '1.0', minVersion: '1.0', generator: 'teste' };
const imagem = (path: string): Record<string, unknown> => ({ type: 'region', path, width: 10, height: 10 });

/** Um osso `o` na raiz, e dois desenhos soltos na raiz: `a` e `b`. */
function solto(): BoneFile {
  return {
    bone: CABECALHO,
    bones: [{ name: 'root' }, { name: 'o', parent: 'root', length: 20 }],
    slots: [{ name: 'a', bone: 'root', attachment: 'a' }, { name: 'b', bone: 'root', attachment: 'b' }],
    skins: [{ name: 'default', attachments: { a: { a: imagem('a') }, b: { b: imagem('b') } } }],
  } as unknown as BoneFile;
}

/** A mão aberta na `default`, a fechada na `armadura`; e um slot sem desenho nenhum. */
function duasPeles(): BoneFile {
  return {
    bone: CABECALHO,
    bones: [{ name: 'root' }, { name: 'braco', parent: 'root', length: 30 }],
    slots: [{ name: 'hand', bone: 'braco', attachment: 'mao_aberta' }, { name: 'vazio', bone: 'braco' }],
    skins: [
      { name: 'default', attachments: { hand: { mao_aberta: imagem('mao_aberta') } } },
      { name: 'armadura', attachments: { hand: { mao_fechada: imagem('mao_fechada') } } },
    ],
  } as unknown as BoneFile;
}

function matrizIgual(antes: Matrix2x3, depois: Matrix2x3): void {
  for (const k of ['a', 'b', 'c', 'd', 'worldX', 'worldY'] as const) expect(depois[k]).toBeCloseTo(antes[k], 6);
}

function noMundo(m: Matrix2x3, x: number, y: number): [number, number] {
  return [m.a * x + m.b * y + m.worldX, m.c * x + m.d * y + m.worldY];
}

function origem(doc: Doc, slot: string, nome: string): { x: number; y: number } {
  const mapa = doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, { x?: number; y?: number }>>;
  const def = mapa[slot]![nome]!;
  return { x: def.x ?? 0, y: def.y ?? 0 };
}

describe('uma árvore só: que osso manda em qual peça', () => {
  it('herói: sem root; hips no nível 0; torso sob hips; os desenhos do torso antes dos ossos filhos', () => {
    const rows = hierarchyRows(heroi(), 'default');
    expect(rows.some((row) => row.name === 'root')).toBe(false);
    expect(linha(rows, 'bone:hips').depth).toBe(0);
    const torso = linha(rows, 'bone:torso');
    expect(torso.depth).toBe(1);
    expect(torso.owner).toBe('bone:hips');
    const corpo = linha(rows, 'slot:body');
    expect([corpo.depth, corpo.owner, corpo.attachment]).toEqual([2, 'bone:torso', 'body']);
    // Primeiro os desenhos do torso, depois os ossos filhos dele.
    const doTorso = rows.filter((row) => row.owner === 'bone:torso');
    const primeiroOsso = doTorso.findIndex((row) => row.kind === 'bone');
    expect(doTorso.slice(0, primeiroOsso).map((row) => row.name)).toEqual(['mask', 'body', 'hitbox', 'cape_path']);
    expect(doTorso.slice(primeiroOsso).every((row) => row.kind === 'bone')).toBe(true);
  });

  it('nenhuma linha de seção, regra ou pele; cada slot tem a sua linha, uma só', () => {
    const rows = hierarchyRows(heroi());
    expect(rows.every((row) => row.kind === 'bone' || row.kind === 'slot')).toBe(true);
    expect(rows.some((row) => ['ik_arm', 'armadura', 'Ossos', 'Desenhos'].includes(row.name))).toBe(false);
    const slots = rows.filter((row) => row.kind === 'slot').map((row) => row.name);
    expect(slots.sort()).toEqual(heroi().slots!.map((slot) => slot.name).sort());
  });

  it('o osso com gente embaixo tem o triângulo; o sem ninguém, não', () => {
    const rows = hierarchyRows(heroi());
    expect(linha(rows, 'bone:torso').hasChildren).toBe(true);
    expect(linha(rows, 'bone:hand_target').hasChildren).toBeFalsy();
  });

  it('dois desenhos soltos na raiz: nível 0, depois dos ossos de nível 0', () => {
    const file = solto();
    const rows = hierarchyRows(file);
    expect(rows.map((row) => [row.id, row.depth, row.owner])).toEqual([
      ['bone:o', 0, undefined], ['slot:a', 0, undefined], ['slot:b', 0, undefined],
    ]);
    // Já solto: soltar de novo no vazio não tem o que fazer.
    expect(rootDropAction(file, linha(rows, 'slot:a'))).toBeNull();
    expect(rootDropAction(file, linha(rows, 'bone:o'))).toBeNull();
  });
});

describe('a miniatura é a da pele em edição', () => {
  it('trocar a pele em edição troca o desenho da linha', () => {
    const file = duasPeles();
    expect(linha(hierarchyRows(file, 'default'), 'slot:hand').attachment).toBe('mao_aberta');
    const armada = linha(hierarchyRows(file, 'armadura'), 'slot:hand');
    expect([armada.attachment, armada.skin]).toEqual(['mao_fechada', 'armadura']);
    // O que a pele não tem, ela pega da default, como o leitor (§4.4).
    const arm = heroi().slots!.find((slot) => slot.name === 'arm')!;
    expect(slotDrawing(heroi(), arm, 'armadura')).toEqual({ attachment: 'arm', skin: 'default' });
  });

  it('slot sem desenho nesta pele: a linha está lá, em cinza', () => {
    const vazio = linha(hierarchyRows(duasPeles(), 'default'), 'slot:vazio');
    expect(vazio.empty).toBe(true);
    expect(vazio.attachment).toBeUndefined();
    expect(vazio.owner).toBe('bone:braco');
  });
});

describe('busca e dobra', () => {
  it('buscar: só o caminho até o acerto fica aberto', () => {
    const rows = hierarchyRows(heroi());
    expect(searchHierarchy(rows, 'blade').map((row) => row.name))
      .toEqual(['hips', 'torso', 'arm', 'forearm', 'sword_blade']);
    expect(searchHierarchy(rows, '  ')).toHaveLength(rows.length);
  });

  it('dobrar o torso esconde tudo o que mora nele; o resto fica', () => {
    const rows = hierarchyRows(heroi());
    const dobrado = unfoldedRows(rows, new Set(['bone:torso']));
    expect(dobrado.some((row) => row.id === 'bone:head' || row.id === 'slot:body')).toBe(false);
    expect(dobrado.some((row) => row.id === 'bone:torso')).toBe(true);
    expect(dobrado.some((row) => row.id === 'bone:leg')).toBe(true);
    expect(unfoldedRows(rows, new Set())).toHaveLength(rows.length);
  });

  it('a dobra fica no navegador, por arquivo; texto estragado dá dobra nenhuma', () => {
    expect(foldKey('C:/x/heroi.bone', heroi())).toBe(`${FOLD_STORAGE_PREFIX}C:/x/heroi.bone`);
    expect(foldKey(null, heroi())).toBe(`${FOLD_STORAGE_PREFIX}${heroi().skeleton?.name ?? 'sem nome'}`);
    expect([...parseFolded('["bone:torso", 3]')]).toEqual(['bone:torso']);
    expect(parseFolded('lixo').size).toBe(0);
    expect(parseFolded(null).size).toBe(0);
  });
});

describe('os gestos, no lugar novo', () => {
  it('clicar na linha do desenho escolhe o slot e o desenho', () => {
    const rows = hierarchyRows(heroi());
    expect(selectionForRow(linha(rows, 'slot:head')))
      .toEqual({ ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] });
    expect(selectionForRow(linha(rows, 'bone:hips')).bones).toEqual(['hips']);
  });

  it('arrastar o osso leg para o torso: vira filho, mundo igual, um passo de desfazer', () => {
    const doc = new Doc(heroi());
    const texto = JSON.stringify(doc.file);
    const antes = setupWorldMatrices(doc.file)!.get('leg')!;
    const rows = hierarchyRows(doc.file);
    const acao = hierarchyDropAction(doc.file, linha(rows, 'bone:leg'), linha(rows, 'bone:torso'))!;
    expect(acao).toEqual({ kind: 'reparent', selection: { ...emptySelection(), bones: ['leg'] }, parent: 'torso' });
    if (acao.kind === 'reparent') runReparent(doc, acao.selection, acao.parent);
    expect(doc.file.bones!.find((bone) => bone.name === 'leg')!.parent).toBe('torso');
    matrizIgual(antes, setupWorldMatrices(doc.file)!.get('leg')!);
    expect(linha(hierarchyRows(doc.file), 'bone:leg').owner).toBe('bone:torso');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('arrastar o desenho cape_upper para o vazio: fica solto, na raiz, sem mover', () => {
    const doc = new Doc(heroi());
    const texto = JSON.stringify(doc.file);
    const deAntes = origem(doc, 'cape_upper', 'cape_upper');
    const antes = noMundo(setupWorldMatrices(doc.file)!.get('cape1')!, deAntes.x, deAntes.y);
    const acao = hierarchyDropAction(doc.file, linha(hierarchyRows(doc.file), 'slot:cape_upper'), null)!;
    expect(acao).toEqual({ kind: 'reparent', selection: { ...emptySelection(), slots: ['cape_upper'] }, parent: 'root' });
    if (acao.kind === 'reparent') runReparent(doc, acao.selection, acao.parent);
    expect(doc.file.slots!.find((slot) => slot.name === 'cape_upper')!.bone).toBe('root');
    const deDepois = origem(doc, 'cape_upper', 'cape_upper');
    const depois = noMundo(setupWorldMatrices(doc.file)!.get('root')!, deDepois.x, deDepois.y);
    expect(depois[0]).toBeCloseTo(antes[0], 4);
    expect(depois[1]).toBeCloseTo(antes[1], 4);
    const nova = linha(hierarchyRows(doc.file), 'slot:cape_upper');
    expect([nova.depth, nova.owner]).toEqual([0, undefined]);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('soltar em cima de um desenho não faz nada: a ordem de desenho mora na aba Ordem', () => {
    const file = heroi();
    const rows = hierarchyRows(file);
    expect(hierarchyDropAction(file, linha(rows, 'slot:body'), linha(rows, 'slot:mask'))).toBeNull();
  });
});

describe('o painel desenha a árvore única', () => {
  it('tree.ts: uma lista, a dobra, a busca que abre, o vazio do fim e o P', () => {
    const fonte = ler('panels/tree.ts');
    // Lote 1 de 14/09: as linhas passam a levar o pai do instante (§9.4).
    // Degrau 4b: a Árvore lê o corpo do instante (9.13), não o arquivo.
    // Rodada 12 (S8, S9): e os ossos que a pilha de peles tira (`bonesGone`).
    expect(fonte).toContain('corpoDe(doc).file, skinForNew(corpoDe(doc).file, doc.visibleSkins), this.parentsNow(doc),');
    expect(fonte).toContain('bonesGone(corpoDe(doc).file, skinStackOf(doc))');
    expect(fonte).toContain('searchHierarchy(todas, busca, this.keepShown)');
    expect(fonte).toContain('unfoldedRows(todas, this.foldState())');
    expect(fonte).toContain("el('div', 'arvore-vazio-fim')");
    expect(fonte).toContain('selectTool.grabFromTree(doc, alvo)');
    expect(fonte).not.toContain('renderSection');
    expect(fonte).not.toContain("'Slots (ordem de desenho)'");
    expect(ler('panels/tree-model.ts')).not.toContain('export function buildTree');
  });
});
});

// ---------------------------------------------------------------------------
// Limpar desenhos vazios — 13/09/2026
// ---------------------------------------------------------------------------

/**
 * O Humberto: *"eu imagino que eu vou criar imagem, tirar imagens, e vai
 * acabar tendo muitos slots soltos. Porque eu não sei como é que eu vou
 * administrar eles."*
 *
 * A porta que fazia lixo — **Novo → Slot** — saiu. Para o que já ficou, e para
 * os arquivos que vêm de fora, existe a vassoura.
 */
describe('limpar desenhos vazios', () => {
  const CABEC = { version: '1.0', minVersion: '1.0', generator: 'teste' };
  const regiao = (path: string) => ({ type: 'region', path });
  const fonte = (caminho: string): string =>
    readFileSync(resolve(__dirname, '../src', caminho), 'utf8').replace(/\r\n/g, '\n');

  /** Um arquivo com um slot vestido, um vazio, e o que o teste mandar. */
  function comSlots(extra: Partial<BoneFile> = {}): BoneFile {
    return {
      bone: CABEC,
      bones: [{ name: 'root' }, { name: 'braco', parent: 'root' }],
      slots: [
        { name: 'mao', bone: 'braco', attachment: 'mao' },
        { name: 'vazio', bone: 'braco' },
      ],
      skins: [{ name: 'default', attachments: { mao: { mao: regiao('mao') } } }],
      ...extra,
    } as unknown as BoneFile;
  }

  it('acha o slot que pele nenhuma veste, e só ele', () => {
    expect(emptySlots(comSlots())).toEqual(['vazio']);
  });

  it('ponto e caixa são anexos: o slot que os tem não é vazio', () => {
    const file = comSlots({
      skins: [{
        name: 'default',
        attachments: {
          mao: { mao: regiao('mao') },
          vazio: { mira: { type: 'point' } },
        },
      }],
    } as unknown as Partial<BoneFile>);
    expect(emptySlots(file)).toEqual([]);
  });

  it('vazio numa pele e vestido na outra não é lixo: é o trabalho das peles', () => {
    const file = comSlots({
      skins: [
        { name: 'default', attachments: { mao: { mao: regiao('mao') } } },
        { name: 'armadura', attachments: { vazio: { luva: regiao('luva') } } },
      ],
    } as unknown as Partial<BoneFile>);
    expect(emptySlots(file)).toEqual([]);
  });

  it('anexo `null` é a pele que ESCONDE: esconder não é vestir', () => {
    const file = comSlots({
      skins: [{
        name: 'default',
        attachments: { mao: { mao: regiao('mao') }, vazio: { luva: null } },
      }],
    } as unknown as Partial<BoneFile>);
    expect(emptySlots(file)).toEqual(['vazio']);
  });

  it('slot vazio que uma máscara, uma regra de caminho ou um morph cita é marco, não lixo', () => {
    const porMascara = comSlots({
      skins: [{
        name: 'default',
        attachments: { mao: { mao: { type: 'clipping', end: 'vazio' } } },
      }],
    } as unknown as Partial<BoneFile>);
    expect(emptySlots(porMascara)).toEqual([]);

    const porLista = comSlots({
      skins: [{
        name: 'default',
        attachments: { mao: { mao: { type: 'clipping', slots: ['vazio'] } } },
      }],
    } as unknown as Partial<BoneFile>);
    expect(emptySlots(porLista)).toEqual([]);

    const porRegra = comSlots({
      constraints: [{ type: 'path', name: 'capa', bones: ['braco'], target: 'vazio' }],
    } as unknown as Partial<BoneFile>);
    expect(emptySlots(porRegra)).toEqual([]);

    const porMorph = comSlots({
      morphs: [{ name: 'sorriso', targets: [{ slot: 'vazio', attachment: 'x', offsets: [] }] }],
    } as unknown as Partial<BoneFile>);
    expect(emptySlots(porMorph)).toEqual([]);
  });

  it('apaga todos num passo, e o desfazer devolve o arquivo igual', () => {
    const doc = new Doc(comSlots());
    const antes = JSON.stringify(doc.file);
    const command = new CleanEmptySlots(doc.file);
    expect(command.hasWork).toBe(true);
    expect(command.names).toEqual(['vazio']);

    doc.run(command);
    expect(doc.file.slots!.map((slot) => slot.name)).toEqual(['mao']);

    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('leva junto a timeline órfã do slot apagado', () => {
    const doc = new Doc(comSlots({
      animations: [{
        name: 'andar',
        duration: 1,
        timelines: [
          { type: 'slot', target: 'vazio', property: 'attachment', keys: [{ time: 0, value: null }] },
          { type: 'bone', target: 'braco', property: 'rotate', keys: [{ time: 0, value: 0 }] },
        ],
      }],
    } as unknown as Partial<BoneFile>));

    doc.run(new CleanEmptySlots(doc.file));
    const linhas = doc.file.animations![0]!.timelines as Array<{ target: string }>;
    expect(linhas.map((t) => t.target)).toEqual(['braco']);
  });

  it('sem nenhum vazio a ação não tem trabalho: o botão fica cinza', () => {
    const file = comSlots({ slots: [{ name: 'mao', bone: 'braco', attachment: 'mao' }] } as unknown as Partial<BoneFile>);
    const command = new CleanEmptySlots(file);
    expect(command.hasWork).toBe(false);
    expect(emptySlots(file)).toEqual([]);
  });

  it('o menu Novo não tem mais Slot, nem na Árvore nem no Esqueleto', () => {
    expect(fonte('ui/menus.ts')).not.toContain("action: 'novo-slot'");
    expect(fonte('panels/tree.ts')).not.toContain("linha('Slot'");
    expect(fonte('ui/actions-table.ts')).not.toContain("'novo-slot'");
    expect(fonte('ui/actions-table.ts')).toContain("'limpar-slots-vazios'");
  });
});

// ---------------------------------------------------------------------------
// Criar e parentesco (chat 3 do plano da caixa, ossos e malha — 13/09/2026)
// ---------------------------------------------------------------------------

describe('criar e parentesco (13/09/2026)', () => {
/**
 * Os dois pedidos do Humberto de 13/09/2026 — itens 3.1 e 3.2 do plano.
 *
 * 3.1 — *"quando crio objetos, as coisas ficam se enganchando; vira parente de
 * coisa que não estava selecionada"*. O osso novo, o ponto e a caixa só entram
 * debaixo de um osso escolhido com a mão. Clicar numa imagem na cena põe o
 * osso dela na seleção junto com o desenho, e isso **não** conta como escolher
 * osso: *"por que uma imagem escolhe um osso? o que um novo osso tem a ver com
 * isso?"*
 *
 * 3.2 — *"mandei um osso filho virar o pai do pai dele e ele não virou"*.
 * Soltar um osso em cima de um descendente dele **troca os dois de lugar**.
 *
 * Sem DOM: `Doc` de verdade, e os módulos puros.
 */

  /** raiz → hips → torso, mais o braço com um desenho em cima. */
  function ossos(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'hips', parent: 'root', x: 0, y: 90, length: 10 },
        { name: 'torso', parent: 'hips', rotation: 90, length: 70 },
        { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 },
      ],
      slots: [{ name: 'desenho', bone: 'braco', attachment: 'desenho' }],
      skins: [{
        name: 'default',
        attachments: { desenho: { desenho: { type: 'region', path: 'x', width: 30, height: 30 } } },
      }],
    } as unknown as BoneFile;
  }

  const paiDe = (file: BoneFile, nome: string): string | undefined =>
    file.bones.find((b) => b.name === nome)?.parent;

  /** A matriz de mundo de um osso, na pose de repouso, lida do arquivo. */
  function mundoDe(file: BoneFile, bone: string): Matrix2x3 {
    const m = setupWorldMatrices(file)?.get(bone);
    if (m === undefined) throw new Error(`sem mundo para ${bone}`);
    return m;
  }

  /** O que a cena escolhe ao clicar no desenho do braço: o slot e o desenho (rodada 8d; eram os três). */
  const cliqueNoDesenho = (): Selection => selectionFor(emptySelection(), {
    kind: 'attachment', bone: 'braco', slot: 'desenho', attachment: 'desenho',
  } as never, false, 'root');

  /** Um `Doc` com os recados do rodapé guardados numa lista. */
  function comRecados(file: BoneFile): { doc: Doc; recados: string[] } {
    const doc = new Doc(file);
    const recados: string[] = [];
    doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });
    return { doc, recados };
  }

  it('3.1 sem nada escolhido, o osso novo nasce solto, na raiz', () => {
    expect(newBoneParent(emptySelection(), ossos())).toBe('root');
  });

  it('3.1 com um osso escolhido com a mão, o osso novo é filho dele: a cadeia continua', () => {
    expect(newBoneParent({ ...emptySelection(), bones: ['braco'] }, ossos())).toBe('braco');
  });

  it('3.1 clicar numa imagem na cena não escolhe osso: o osso novo nasce solto', () => {
    const clique = cliqueNoDesenho();
    // Rodada 8d: o clique já não traz o osso (era `['braco']`). A regra 3.1
    // continua valendo, e agora por dois motivos.
    expect(clique.bones).toEqual([]);
    expect(newBoneParent(clique, ossos())).toBe('root');
  });

  it('3.1 o ponto e a caixa seguem a mesma regra', () => {
    const file = ossos();
    // Antes: `{ kind: 'bone', bone: 'braco' }` — o ponto nascia no osso do
    // desenho que a pessoa tinha clicado para outra coisa.
    //
    // Rodada 8d, reescrito de propósito: clicar na imagem na cena escolhe o
    // MESMO que a linha dela na Árvore (o slot e a imagem, sem osso). O ponto
    // entra no slot da imagem escolhida, como pela Árvore. Era `root`.
    expect(shapeTarget(file, cliqueNoDesenho())).toEqual({ kind: 'slot', slot: 'desenho', bone: 'braco' });
    // O osso que vinha de carona não volta a mandar.
    expect(shapeTarget(file, { ...cliqueNoDesenho(), bones: ['braco'] })).toEqual({ kind: 'bone', bone: 'root' });
    expect(shapeTarget(file, { ...emptySelection(), bones: ['braco'] }))
      .toEqual({ kind: 'bone', bone: 'braco' });
    // O slot escolhido sozinho continua mandando o anexo para dentro dele.
    expect(shapeTarget(file, { ...emptySelection(), slots: ['desenho'] }))
      .toEqual({ kind: 'slot', slot: 'desenho', bone: 'braco' });
  });

  it('3.2 o veredito diz qual dos três gestos é', () => {
    const file = ossos();
    expect(reparentVerdict(file, 'braco', 'hips')).toBe('ok');
    expect(reparentVerdict(file, 'hips', 'torso')).toBe('swap');
    expect(reparentVerdict(file, 'root', 'torso')).toBe('no');
    expect(reparentVerdict(file, 'hips', 'hips')).toBe('no');
    expect(reparentVerdict(file, 'hips', 'nao_existe')).toBe('no');
    // `canReparent` continua respondendo o que sempre respondeu.
    expect(canReparent(file, 'hips', 'torso')).toBe(false);
    expect(canReparent(file, 'braco', 'hips')).toBe(true);
  });

  it('3.2 o filho vira pai do pai: os dois trocam de lugar, num passo de desfazer', () => {
    const { doc, recados } = comRecados(ossos());
    const antes = JSON.stringify(doc.file);
    const mundoAntes = {
      hips: mundoDe(doc.file, 'hips'),
      torso: mundoDe(doc.file, 'torso'),
    };

    runReparent(doc, { ...emptySelection(), bones: ['hips'] }, 'torso');

    expect(paiDe(doc.file, 'torso')).toBe('root');
    expect(paiDe(doc.file, 'hips')).toBe('torso');
    // Ninguém pula: a pose de mundo dos dois fica onde estava.
    for (const nome of ['hips', 'torso'] as const) {
      const depois = mundoDe(doc.file, nome);
      expect(depois.worldX, nome).toBeCloseTo(mundoAntes[nome]!.worldX, 6);
      expect(depois.worldY, nome).toBeCloseTo(mundoAntes[nome]!.worldY, 6);
    }
    expect(recados.at(-1)).toBe('torso e hips trocaram de lugar: hips agora é filho de torso');
    // Um passo só: um desfazer devolve o arquivo letra por letra.
    expect(doc.undoLabel).toBe('torso e hips trocaram de lugar');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(doc.undoLabel).toBe(null);
  });

  it('3.2 vale para o avô também: a cadeia continua de pé, sem órfão', () => {
    const file = ossos();
    // raiz → hips → torso → mao
    file.bones.push({ name: 'mao', parent: 'torso', x: 70, y: 0 });
    const doc = new Doc(file);

    runReparent(doc, { ...emptySelection(), bones: ['hips'] }, 'mao');

    expect(paiDe(doc.file, 'mao')).toBe('root');
    expect(paiDe(doc.file, 'hips')).toBe('mao');
    expect(paiDe(doc.file, 'torso')).toBe('hips');
    // Pai sempre antes do filho, como o formato pede (§2.2).
    const ordem = doc.file.bones.map((b) => b.name);
    expect(ordem.indexOf('mao')).toBeLessThan(ordem.indexOf('hips'));
    expect(ordem.indexOf('hips')).toBeLessThan(ordem.indexOf('torso'));
  });

  it('3.2 arrastar na Árvore dá no mesmo: o arrasto deixa de ser recusado', () => {
    const file = ossos();
    const linha = (nome: string): TreeRow =>
      ({ kind: 'bone', id: `bone:${nome}`, name: nome, depth: 0, index: 0 });
    // Antes: `null` — a Árvore recusava sem explicar.
    expect(treeDropAction(file, linha('hips'), linha('torso'))).toEqual({
      kind: 'reparent', selection: { ...emptySelection(), bones: ['hips'] }, parent: 'torso',
    });
    // A raiz continua sem sair do lugar.
    expect(treeDropAction(file, linha('root'), linha('torso'))).toBe(null);
  });

  it('3.2 com dois ossos escolhidos nada troca de lugar: quem não pode fica de fora', () => {
    const { doc, recados } = comRecados(ossos());
    runReparent(doc, { ...emptySelection(), bones: ['hips', 'braco'] }, 'torso');
    expect(paiDe(doc.file, 'braco')).toBe('torso');
    expect(paiDe(doc.file, 'hips')).toBe('root');
    expect(recados.at(-1)).toContain('hips ficou onde estava');
  });
});

// ---------------------------------------------------------------------------
// A Árvore do quadro de agora (lote 1 de 14/09/2026, §9.4)
// ---------------------------------------------------------------------------

describe('a Árvore mostra o pai do quadro de agora', () => {
/**
 * O pedido, em uma frase: *"no quadro 12 a arma está nas costas, e a Árvore
 * precisa dizer isso."* A chave `parent` (§9.4) muda quem é pai de quem dentro
 * da animação; a Árvore lia só `file.bones[].parent` e mostrava, em qualquer
 * quadro, a hierarquia do arquivo.
 *
 * O mapa do instante sai do esqueleto vivo (`appliedParents`), que já aplica a
 * chave. Aqui ele entra à mão: estas funções são puras.
 */

  /** root → torso → mao, e costas pendurada na raiz. */
  function rig(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'torso', parent: 'root', x: 0, y: 100 },
        { name: 'mao', parent: 'torso', x: 50 },
        { name: 'costas', parent: 'root', x: -30, y: 10 },
      ],
      slots: [{ name: 'arma', bone: 'mao', attachment: 'arma' }],
      skins: [{
        name: 'default',
        attachments: { arma: { arma: { type: 'region', path: 'x', width: 10, height: 10 } } },
      }],
    } as unknown as BoneFile;
  }

  /** O que o quadro 12 tem: a mão pendurada nas costas, por chave. */
  const noQuadro12 = (): ParentMap => new Map([['mao', 'costas']]);

  const linhaDe = (rows: TreeRow[], nome: string): TreeRow | undefined =>
    rows.find((row) => row.kind === 'bone' && row.name === nome);

  it('sem mapa, é a árvore do arquivo — a Montagem não muda de cara', () => {
    const rows = boneRows(rig());
    expect(linhaDe(rows, 'mao')?.parent).toBe('torso');
    expect(linhaDe(rows, 'mao')?.detail).toBeUndefined();
  });

  it('com o mapa do instante, a mão aparece debaixo das costas', () => {
    const rows = boneRows(rig(), noQuadro12());
    const mao = linhaDe(rows, 'mao');
    expect(mao?.parent).toBe('costas');
    // Quem está ali por causa de uma chave diz isso na linha.
    expect(mao?.detail).toBe('por chave');
    expect(mao?.hint).toBe(KEYED_PARENT_HINT);
    // E a ordem das linhas segue a árvore do quadro: a mão vem depois das
    // costas, não depois do torso.
    const nomes = rows.filter((r) => r.kind === 'bone').map((r) => r.name);
    expect(nomes.indexOf('costas')).toBeLessThan(nomes.indexOf('mao'));
  });

  it('o desenho vai junto: a arma aparece debaixo da mão, onde a mão estiver', () => {
    const rows = hierarchyRows(rig(), 'default', noQuadro12());
    const arma = rows.findIndex((row) => row.kind === 'slot' && row.name === 'arma');
    const mao = rows.findIndex((row) => row.kind === 'bone' && row.name === 'mao');
    expect(mao).toBeGreaterThanOrEqual(0);
    expect(arma).toBe(mao + 1);
  });

  it('o ciclo é medido na árvore do quadro, não na do arquivo', () => {
    const file = rig();
    // No arquivo, `costas` não está debaixo de `torso`: pendurar torso em
    // costas seria uma troca comum.
    expect(reparentVerdict(file, 'torso', 'costas')).toBe('ok');
    // No quadro 12, a mão está nas costas. Pendurar as COSTAS na mão fecharia
    // um ciclo naquele quadro — e o runtime ignoraria a chave com
    // `PARENT_CYCLE`. O editor não pode oferecer isso como troca comum.
    expect(reparentVerdict(file, 'costas', 'mao')).toBe('ok');
    expect(reparentVerdict(file, 'costas', 'mao', noQuadro12())).toBe('swap');
  });

  it('a Árvore anda no tempo — mas só quando há chave de pai', () => {
    // Achado na TELA, 14/09/2026: a Árvore não ouvia `time`, então mostrava a
    // hierarquia do instante em que tinha sido desenhada pela última vez, em
    // todos os outros quadros. O contrário também importa: arrastar o cursor
    // não pode redesenhar a Árvore inteira quadro a quadro à toa.
    const fonte = readFileSync(resolve(__dirname, '../src/panels/tree.ts'), 'utf8');
    // Rodada 12 (S8): `transform` entrou só para ver a pilha de peles mudar, e
    // a Árvore só se redesenha quando ela muda de fato (`stackKey`).
    expect(fonte).toContain("readonly listensTo = ['file', 'structure', 'selection', 'assets', 'time', 'transform']");
    expect(fonte).toContain('this.stackKey(doc) === this.drawnStack) return;');
    expect(fonte).toContain("if (change.kind === 'time' && !this.hierarchyIsKeyed()) return;");
    expect(fonte).toContain("t.type === 'bone' && t.property === 'parent'");
  });

  it('arrastar na Árvore também olha o quadro: o alvo do arrasto muda', () => {
    const file = rig();
    const linha = (nome: string): TreeRow =>
      ({ kind: 'bone', id: `bone:${nome}`, name: nome, depth: 0, index: 0 });
    expect(treeDropAction(file, linha('costas'), linha('mao'), noQuadro12()))
      .toEqual({
        kind: 'reparent', selection: { ...emptySelection(), bones: ['costas'] }, parent: 'mao',
      });
  });
});

// ---------------------------------------------------------------------------
// Degrau 4b (17/09/2026): a Árvore mostra o corpo do instante (9.13, M12)
// ---------------------------------------------------------------------------

import { parseBoneText } from '../../runtime/src/index.js';
import { Projeto, emptyManifest, readProjectLists, writeProjectLists } from '../src/doc/projeto.js';
import { appliedParents } from '../src/doc/reparent.js';
import { corpoDe } from '../src/contract.js';
import { createEmptyFile } from '../src/doc/new-file.js';

describe('a Árvore mostra o rabo só depois da virada', () => {
  const C290 = resolve(__dirname, '../../conformidade/casos/C-290-virada-corte-seco');
  const lerCorpo = (nome: string): BoneFile => parseBoneText(readFileSync(resolve(C290, nome), 'utf8')) as BoneFile;

  /** O homem e o lobisomem num projeto, com a animação `transformar` aberta. */
  function projeto(): Doc {
    const doc = new Doc(createEmptyFile());
    const projeto = new Projeto(doc);
    const manifest = writeProjectLists(emptyManifest('entrada.bone'), {
      corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
    });
    projeto.open(manifest, readProjectLists(manifest), new Map([
      ['entrada.bone', { file: lerCorpo('entrada.bone'), options: {} }],
      ['lobisomem.bone', { file: lerCorpo('lobisomem.bone'), options: {} }],
    ]));
    doc.animation = 'transformar';
    return doc;
  }

  /** As linhas como o painel as monta: o corpo do instante, com o pai do quadro. */
  const linhas = (doc: Doc): TreeRow[] =>
    hierarchyRows(corpoDe(doc).file, 'default', doc.animation === null ? undefined : appliedParents(doc));
  const ossos = (rows: TreeRow[]): string[] => rows.filter((r) => r.kind === 'bone').map((r) => r.name);

  it('em 0,25 a Árvore é a do homem: braço, sem rabo', () => {
    const doc = projeto();
    doc.time = 0.25;
    expect(ossos(linhas(doc))).toEqual(['tronco', 'braco']);
  });

  it('em 0,75 a Árvore é a do lobisomem: o rabo debaixo do tronco, e o braço some', () => {
    const doc = projeto();
    doc.time = 0.75;
    const rows = linhas(doc);
    expect(ossos(rows)).toEqual(['tronco', 'rabo']);
    const rabo = rows.find((r) => r.kind === 'bone' && r.name === 'rabo');
    expect(rabo?.parent).toBe('tronco');
    // O desenho `corpo` continua pendurado no tronco — o do lobisomem.
    const corpo = rows.find((r) => r.kind === 'slot' && r.name === 'corpo');
    expect(corpo).toBeDefined();
    expect(corpoDe(doc).file.skeleton?.name).toBe('lobisomem');
  });

  it('com a base aberta é a árvore do arquivo, como sempre', () => {
    const doc = projeto();
    doc.time = 0.75;
    doc.animation = null;
    expect(ossos(linhas(doc))).toEqual(['tronco', 'braco']);
  });

  it('a Árvore anda no tempo também quando há chave body', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/tree.ts'), 'utf8');
    expect(fonte).toContain("|| t.type === 'body'");
    // E lê o corpo do instante, nunca o arquivo, nas linhas e nos comandos.
    expect(fonte).toContain('new AddConstraint(corpoDe(doc).file');
    // Rodada 43, lote 3: o comando nasce antes (o rodapé lê o nome final), e vai pelo corpo.
    expect(fonte).toContain('new RenameItem(corpoDe(doc).file');
    expect(fonte).toContain('corpoDe(doc).run(comando)');
    expect(fonte).not.toContain('doc.run(new RenameItem(doc.file');
  });
});

// ---------------------------------------------------------------------------
// O emissor de partículas na Árvore — extensão `BONE_particles`, lote 1
// ---------------------------------------------------------------------------

describe('o emissor de partículas (BONE_particles), lote 1', () => {
/**
 * **O volante.** O motor das partículas estava pronto dos dois lados — a
 * extensão escrita, os dois runtimes calculando, 16 casos de conformidade — e
 * no editor não havia um botão para criar um emissor: 🗣️ *"o carro sem o
 * volante. Você está brincando sozinho."*
 *
 * O que se prova aqui é a **criação** e o **se ver que existe**: o comando
 * escreve o anexo, o slot, a semente e — o que nenhum irmão dele faz — a
 * declaração em `extensionsUsed`, que a §2.7 da spec exige de todo `type`
 * prefixado; o desfazer devolve o arquivo letra por letra; a semente é
 * diferente por emissor (§9.9, o defeito do Unity); e a linha da Árvore diz
 * "emissor de partículas" em vez do nome cru do tipo.
 *
 * **O defeito foi visto antes de ser consertado**, e está fotografado:
 * `backup/fotos-particulas/lote-1_antes.png` — a Árvore com o ícone genérico e
 * a ficha sem uma palavra sobre o emissor.
 */

/** A pasta do código, para os testes que leem a fonte. */
const FONTE = resolve(__dirname, '../src');

/** Um esqueleto com dois ossos e nada mais: o mínimo para pendurar um emissor. */
function comDoisOssos(): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'mao', parent: 'root' }],
  } as unknown as BoneFile);
}

/** O anexo do emissor, como ele ficou no arquivo. */
function emissorDe(doc: Doc, slot: string): Record<string, unknown> | undefined {
  for (const skin of doc.file.skins ?? []) {
    const porSlot = (skin.attachments ?? {})[slot] as Record<string, Record<string, unknown>> | undefined;
    const def = porSlot?.[slot];
    if (def !== undefined) return def;
  }
  return undefined;
}

/** O rodapé desta janela, gravado numa lista para o teste poder lê-lo. */
function ouvindo(doc: Doc): string[] {
  const ditos: string[] = [];
  const original = doc.notice.bind(doc);
  doc.notice = (t: string): void => { ditos.push(t); original(t); };
  return ditos;
}

  // --- o que a linha da Árvore mostra ------------------------------------

  it('a linha diz "emissor de partículas", e não o nome cru do tipo', () => {
    const plano = thumbnailKind({ type: 'BONE_particle' } as never, 'fumaca');
    expect(plano).toEqual({ kind: 'icone', icon: 'particle', tipo: 'emissor de partículas' });
  });

  it('o defeito EXISTIA: sem a linha do POR_TIPO, o tipo caía no buraco do fim', () => {
    // Esta é a prova de que o teste de cima pega alguma coisa. O `POR_TIPO` do
    // `thumbnail-kind.ts` é o que tapa o buraco; a cópia de antes do lote está
    // no `backup/`, e ela NÃO cita o emissor — era o buraco.
    const fonteAntes = readFileSync(
      resolve(__dirname, '../../backup/thumbnail-kind_2026-09-22_antes-do-lote-1-das-particulas.ts'),
      'utf8',
    );
    expect(fonteAntes).not.toContain('BONE_particle');
    // E o que um tipo FORA do POR_TIPO recebe hoje é o que o emissor recebia:
    // o ícone de imagem e o nome cru, em inglês e com prefixo.
    expect(thumbnailKind({ type: 'BONE_naoexiste' } as never, 'x'))
      .toEqual({ kind: 'icone', icon: 'image', tipo: 'BONE_naoexiste' });
  });

  it('o ícone do emissor NÃO é o do Ponto: dois nomes, dois desenhos', () => {
    expect(thumbnailKind({ type: 'BONE_particle' } as never)).toHaveProperty('icon', 'particle');
    expect(thumbnailKind({ type: 'point' } as never)).toHaveProperty('icon', 'point');
    expect(hasIcon('particle')).toBe(true);
    expect(iconSvg('particle')).not.toBe(iconSvg('point'));
  });

  // --- o comando ---------------------------------------------------------

  it('cria o slot no osso escolhido e o anexo na pele, num passo só', () => {
    const doc = comDoisOssos();
    const cmd = new AddParticleEmitter(doc.file, 'mao', []);
    doc.run(cmd);
    expect(cmd.name).toBe('mao_particulas');
    const slot = (doc.file.slots ?? []).find((s) => s.name === 'mao_particulas');
    expect(slot).toEqual({ name: 'mao_particulas', bone: 'mao', attachment: 'mao_particulas' });
    expect(emissorDe(doc, 'mao_particulas')).toEqual({ type: 'BONE_particle', seed: 0 });
  });

  it('declara a extensão em extensionsUsed — a §2.7 EXIGE de todo type prefixado', () => {
    const doc = comDoisOssos();
    expect((doc.file as { extensionsUsed?: string[] }).extensionsUsed).toBeUndefined();
    doc.run(new AddParticleEmitter(doc.file, 'root', []));
    expect((doc.file as { extensionsUsed?: string[] }).extensionsUsed).toEqual(['BONE_particles']);
  });

  it('o desfazer devolve o arquivo letra por letra, inclusive a extensão', () => {
    const doc = comDoisOssos();
    const antes = JSON.stringify(doc.file);
    doc.run(new AddParticleEmitter(doc.file, 'mao', []));
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('desfazer e refazer duas vezes dá SEMPRE o mesmo arquivo — a semente vem do construtor', () => {
    // A forma do defeito 1 de 19/09: *guardei uma chave que o próprio programa
    // pode reescrever*. Se a semente fosse lida do arquivo vivo dentro do
    // `apply`, o refazer tiraria um número novo e deixaria de ser o inverso do
    // desfazer.
    const doc = comDoisOssos();
    doc.run(new AddParticleEmitter(doc.file, 'mao', []));
    const depois = JSON.stringify(doc.file);
    for (let i = 0; i < 2; i++) {
      doc.undo();
      doc.redo();
      expect(JSON.stringify(doc.file)).toBe(depois);
    }
  });

  it('a extensão FICA quando outro emissor ainda a usa', () => {
    // O desfazer tira a declaração só se este comando a pôs. Um arquivo que já
    // tinha um emissor continua declarando: ela ainda é usada, e tirá-la
    // deixaria o arquivo inválido de um jeito que só o validador vê.
    const doc = comDoisOssos();
    doc.run(new AddParticleEmitter(doc.file, 'root', []));
    doc.run(new AddParticleEmitter(doc.file, 'mao', []));
    doc.undo();
    expect((doc.file as { extensionsUsed?: string[] }).extensionsUsed).toEqual(['BONE_particles']);
    doc.undo();
    expect((doc.file as { extensionsUsed?: string[] }).extensionsUsed).toBeUndefined();
  });

  // --- a semente (§9.9): o defeito do Unity ------------------------------

  it('dois emissores no mesmo arquivo têm sementes DIFERENTES', () => {
    // §9.9, com essas palavras: *"duas fogueiras lado a lado parecerem a mesma
    // fogueira"*. É regra de EDITOR — um leitor só lê o número do arquivo.
    const doc = comDoisOssos();
    const a = new AddParticleEmitter(doc.file, 'root', []);
    doc.run(a);
    const b = new AddParticleEmitter(doc.file, 'mao', []);
    doc.run(b);
    expect(a.seed).toBe(0);
    expect(b.seed).toBe(1);
    expect(b.seed).not.toBe(a.seed);
  });

  it('freshSeed pula os números já usados, em QUALQUER pele', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      skins: [
        { name: 'default', attachments: { a: { a: { type: 'BONE_particle', seed: 0 } } } },
        { name: 'armadura', attachments: { b: { b: { type: 'BONE_particle', seed: 2 } } } },
      ],
    } as unknown as BoneFile;
    expect(usedSeeds(file)).toEqual(new Set([0, 2]));
    expect(freshSeed(file)).toBe(1);
  });

  it('a semente NÃO é sorteada: o mesmo arquivo dá sempre o mesmo número', () => {
    // §3.4 proíbe semente automática, e um sorteio aqui faria o mesmo gesto
    // gravar arquivos diferentes. O teste não teria o que prender.
    const primeiro = new AddParticleEmitter(comDoisOssos().file, 'root', []).seed;
    const segundo = new AddParticleEmitter(comDoisOssos().file, 'root', []).seed;
    expect(primeiro).toBe(segundo);
    // E os números saem na MESMA ordem, sempre: 0, 1, 2. Isto se prova pelo
    // comportamento, e não procurando `Math.random` na fonte — a fonte fala
    // dele num comentário, e **comentário não é código**. Procurar a palavra
    // acusaria o texto que explica por que ela não está lá.
    const doc = comDoisOssos();
    const tres = [0, 1, 2].map(() => {
      const cmd = new AddParticleEmitter(doc.file, 'root', []);
      doc.run(cmd);
      return cmd.seed;
    });
    expect(tres).toEqual([0, 1, 2]);
  });

  // --- a porta: um id, e ela não depende da Árvore estar na tela ---------

  it('a ação chama o comando de verdade e deixa o emissor escolhido', () => {
    const doc = comDoisOssos();
    doc.select({ ...emptySelection(), bones: ['mao'] });
    addParticleEmitter(doc);
    expect(doc.selection.attachments).toEqual([{ slot: 'mao_particulas', attachment: 'mao_particulas' }]);
    expect(emissorDe(doc, 'mao_particulas')).toBeDefined();
  });

  it('sem osso nenhum, DIZ por que não fez — nunca um verde calado', () => {
    const doc = new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [],
    } as unknown as BoneFile);
    const ditos = ouvindo(doc);
    addParticleEmitter(doc);
    expect(ditos).toEqual(['Crie um osso antes de criar um emissor de partículas']);
    expect(doc.file.slots ?? []).toEqual([]);
  });

  it('o rodapé diz a semente: é ela que distingue dois emissores', () => {
    const doc = comDoisOssos();
    const ditos = ouvindo(doc);
    addParticleEmitter(doc);
    addParticleEmitter(doc);
    expect(ditos[0]).toContain('semente 0');
    expect(ditos[1]).toContain('semente 1');
  });

  it('o corpo da ação NÃO depende da tela: ela é de arranque, como os irmãos', () => {
    // *Existir não é funcionar* — a régua 4 do encargo. Dar porta à ação e
    // deixar o corpo dela dependendo do painel dá verde e não faz nada com a
    // aba fechada. `addParticleEmitter` mora em `tree-actions.ts`, que não lê
    // DOM nenhum, e o id está no grupo de ARRANQUE da tabela.
    const registro = readFileSync(resolve(FONTE, 'ui/actions-table.ts'), 'utf8');
    const arvore = registro.slice(registro.indexOf("owner: 'arvore', where: 'arranque'"));
    expect(arvore.slice(0, arvore.indexOf('}'))).toContain("'novo-emissor'");
    const acoes = readFileSync(resolve(FONTE, 'panels/tree-actions.ts'), 'utf8');
    expect(acoes).toContain("registerAction('novo-emissor'");
    expect(acoes).not.toContain('querySelector');
  });

  it('o CORPO da ação é exercitado: `runAction` cria o emissor de verdade', () => {
    // *Existir não é funcionar.* Um id na tabela e uma linha no menu dão verde
    // sem que ninguém tenha experimentado o corpo da ação — o vigia do comando
    // sem porta prende, por escrito, a lista das ações de arranque que nunca
    // foram exercitadas, e o `novo-emissor` entrou nela em 22/09, às 00h52.
    //
    // Esta é a resposta: o mesmo `runAction` que o Novo ▾ e o menu chamam, com
    // o estado de que a ação precisa, exigindo EFEITO no arquivo.
    clearActions();
    const doc = comDoisOssos();
    const soltar = registerTreeActions(doc);
    try {
      expect(hasAction('novo-emissor')).toBe(true);
      doc.select({ ...emptySelection(), bones: ['mao'] });
      expect(runAction('novo-emissor')).toBe(true);
      // O efeito: o slot, o anexo, a extensão declarada e o emissor escolhido.
      expect((doc.file.slots ?? []).map((s) => s.name)).toEqual(['mao_particulas']);
      // Rodada 15, linha 7 (reescrito de propósito): o vazio nasce COM o ponto
      // suave, e os outros campos continuam ausentes (padrão da extensão).
      // Rodada 38, lote 5 (reescrito de propósito): e com o que se vê (doc 35).
      expect(emissorDe(doc, 'mao_particulas')).toEqual({ type: 'BONE_particle', seed: 0, path: 'fx/ponto-suave', rate: 20, scale: [1.2, 1.6], startColor: [[0.85, 0.2, 0.6, 1], [0.95, 0.3, 0.7, 1]], alphaOverLifetime: [{ time: 0, value: 1 }, { time: 1, value: 0 }] });
      expect((doc.file as { extensionsUsed?: string[] }).extensionsUsed).toEqual(['BONE_particles']);
      expect(doc.selection.attachments).toEqual([{ slot: 'mao_particulas', attachment: 'mao_particulas' }]);
      // E o passo de desfazer existe, com o nome que vai no menu Editar.
      expect(doc.undoLabel).toBe('Novo emissor de partículas');
    } finally {
      for (const f of soltar) f();
      clearActions();
    }
  });

  it('o Novo ▾ da Árvore e o menu Esqueleto usam o MESMO id', () => {
    const arvore = readFileSync(resolve(FONTE, 'panels/tree.ts'), 'utf8');
    expect(arvore).toContain("runAction('novo-emissor')");
    expect(arvore).toContain('Emissor de partículas');
    expect(readFileSync(resolve(FONTE, 'ui/menus.ts'), 'utf8')).toContain("action: 'novo-emissor'");
    // Um id só, e nenhum segundo caminho que crie emissor por fora.
    const todos = readFileSync(resolve(FONTE, 'ui/actions-table.ts'), 'utf8');
    expect(todos.match(/'novo-emissor'/g)).toHaveLength(1);
  });

  it('o MESMO desfazer vale para o Ponto: a forma era mais larga que o emissor', () => {
    // *Criei duas listas e só cuidei de uma no desfazer.* O `AddSlotWithAttachment`
    // é a base do Ponto, da Caixa e da Máscara, e nenhum teste partia de um
    // arquivo SEM `slots` — o herói já tem vinte. O emissor só foi o primeiro
    // a passar por um arquivo cru.
    const doc = comDoisOssos();
    const antes = JSON.stringify(doc.file);
    doc.run(new AddPointAttachment(doc.file, 'mao', [], 10, 20, 0));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('e um arquivo que JÁ tinha slots vazios continua tendo depois do desfazer', () => {
    // O outro lado da mesma moeda: apagar uma lista que este comando não criou
    // seria a mesma classe de erro, de costas.
    const doc = new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [],
    } as unknown as BoneFile);
    doc.run(new AddParticleEmitter(doc.file, 'root', []));
    doc.undo();
    expect((doc.file as { slots?: unknown }).slots).toEqual([]);
  });

  it('o botão Novo tem o nome na dica, e a dica cita o emissor', () => {
    const fonte = readFileSync(resolve(FONTE, 'panels/tree.ts'), 'utf8');
    const dica = /botao\.title = '([^']+)'/.exec(fonte)?.[1] ?? '';
    expect(dica).toContain('emissor de partículas');
  });
});

// ---------------------------------------------------------------------------
// Evento e Parâmetro na Árvore — lote 1 do chat D, rodada final (28/09/2026)
// ---------------------------------------------------------------------------

describe('Evento e Parâmetro ganham linha na Árvore (chat D, lote 1)', () => {
  /*
   * A auditoria de 27/09, bloco 1: "nascem pelo Novo ▾ da Árvore, mas não viram
   * linha nenhuma". O modelo é o nó `Events` do Spine: um grupo no FIM, fora da
   * hierarquia dos ossos. A referência está em
   * `documentos/pesquisa/nova pesquisa/REFERENCIA arvore malha e linha do tempo 2026-09-28.md`.
   */
  it('herói: o grupo no fim, com os dois eventos e o parâmetro dentro', () => {
    const rows = eventParameterRows(heroiD());
    expect(rows.map((row) => row.id)).toEqual([
      EVENTS_GROUP_ID, 'event:step', 'event:hit', 'parameter:lookX',
    ]);
    const grupo = rows[0]!;
    expect([grupo.kind, grupo.depth, grupo.hasChildren, grupo.name]).toEqual(['group', 0, true, EVENTS_GROUP_LABEL]);
    for (const row of rows.slice(1)) {
      expect([row.depth, row.owner]).toEqual([1, EVENTS_GROUP_ID]);
    }
    expect(linhaD(rows, 'event:step').kind).toBe('event');
    expect(linhaD(rows, 'parameter:lookX').kind).toBe('parameter');
  });

  it('um evento e um parâmetro NOVOS aparecem na hora — era o defeito', () => {
    const doc = new Doc(heroiD());
    doc.run(new AddEvent(doc.file));
    doc.run(new AddParameter(doc.file));
    const ids = eventParameterRows(doc.file).map((row) => row.id);
    expect(ids).toContain('event:evento');
    expect(ids).toContain('parameter:parametro');
  });

  it('arquivo sem evento e sem parâmetro: nem o grupo aparece', () => {
    expect(eventParameterRows(doisOssosD().file)).toEqual([]);
  });

  it('o grupo dobra como um osso: dobrado, as linhas de dentro somem', () => {
    const rows = eventParameterRows(heroiD());
    expect(foldable(rows[0]!)).toBe(true);
    expect(foldable(linhaD(rows, 'event:step'))).toBe(false);
    expect(unfoldedRows(rows, new Set([EVENTS_GROUP_ID])).map((row) => row.id)).toEqual([EVENTS_GROUP_ID]);
    expect(unfoldedRows(rows, new Set()).length).toBe(rows.length);
  });

  it('a busca acha o evento e abre o grupo até ele', () => {
    const rows = [...hierarchyRows(heroiD()), ...eventParameterRows(heroiD())];
    expect(searchHierarchy(rows, 'step').map((row) => row.id)).toEqual([EVENTS_GROUP_ID, 'event:step']);
  });

  it('o clique no parâmetro escolhe o parâmetro; no evento, a seleção fica vazia', () => {
    const rows = eventParameterRows(heroiD());
    expect(selectionForRow(linhaD(rows, 'parameter:lookX')).parameters).toEqual(['lookX']);
    expect(selectionForRow(linhaD(rows, 'event:step'))).toEqual(emptySelection());
  });

  it('o ícone do evento existe, e a Árvore liga o grupo nas linhas dela', () => {
    expect(hasIcon('event')).toBe(true);
    const fonte = readFileSync(resolve(__dirname, '../src/panels/tree.ts'), 'utf8');
    expect(fonte).toContain('...eventParameterRows(file)');
  });

  /*
   * Achado no caminho: "criei a lista e não cuidei dela no desfazer" — a MESMA
   * forma que o lote 1 das partículas achou no `AddSlotWithAttachment` em 22/09.
   * Num arquivo sem `events`, criar e desfazer deixava `"events": []`.
   */
  it('criar evento e desfazer, num arquivo SEM eventos, devolve o mesmo texto', () => {
    const doc = doisOssosD();
    const antes = JSON.stringify(doc.file);
    doc.run(new AddEvent(doc.file));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('criar parâmetro e desfazer, num arquivo SEM parâmetros, devolve o mesmo texto', () => {
    const doc = doisOssosD();
    const antes = JSON.stringify(doc.file);
    doc.run(new AddParameter(doc.file));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a mesma forma, procurada na casa: regra nova e pele nova também devolvem o texto', () => {
    const doc = doisOssosD();
    const antes = JSON.stringify(doc.file);
    doc.run(new AddConstraint(doc.file, 'ik', ['mao']));
    doc.undo();
    doc.run(new AddSkin(doc.file));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  /*
   * A régua do arroz (encargo, 28/09): "o que eu criei apareceu na tela?" e
   * "o programa disse o que aconteceu?".
   */
  it('a linha que acabou de nascer é achada — uma só; abrir arquivo não conta', () => {
    const doc = new Doc(heroiD());
    const antes = new Set([...hierarchyRows(doc.file), ...eventParameterRows(doc.file)].map((row) => row.id));
    doc.run(new AddEvent(doc.file));
    const depois = [...hierarchyRows(doc.file), ...eventParameterRows(doc.file)];
    expect(newKeyItemRow(antes, depois)?.id).toBe('event:evento');
    expect(newKeyItemRow(null, depois)).toBeNull();
    expect(newKeyItemRow(new Set(), depois)).toBeNull();
  });

  it('pelo Novo ▾: o evento nasce escolhido, e o rodapé diz onde ele está', () => {
    const doc = new Doc(heroiD());
    const avisos: string[] = [];
    doc.notice = (texto: string) => { avisos.push(texto); };
    addEvent(doc);
    expect(currentEventChoice()).toBe('evento');
    expect(doc.selection).toEqual(emptySelection());
    expect(avisos.at(-1)).toBe(addedEventNotice('evento'));
    expect(avisos.at(-1)).toContain('no fim da Árvore');
  });

  it('pelo Novo ▾: o parâmetro nasce escolhido, e o rodapé diz onde ele está', () => {
    const doc = new Doc(heroiD());
    const avisos: string[] = [];
    doc.notice = (texto: string) => { avisos.push(texto); };
    addParameter(doc);
    expect(doc.selection.parameters).toEqual(['parametro']);
    expect(avisos.at(-1)).toBe(addedParameterNotice('parametro'));
  });

  it('e uma lista que JÁ existia vazia continua existindo depois do desfazer', () => {
    const doc = new Doc({ ...CABECALHO_D, bones: [{ name: 'root' }], events: [], parameters: [] } as unknown as BoneFile);
    doc.run(new AddEvent(doc.file));
    doc.run(new AddParameter(doc.file));
    doc.undo();
    doc.undo();
    expect([doc.file.events, doc.file.parameters]).toEqual([[], []]);
  });
});

const CABECALHO_D = { bone: { version: '1.0', minVersion: '1.0', generator: 'teste' } };

/** O herói, lido do disco a cada vez. */
function heroiD(): BoneFile {
  return JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
}

function linhaD(rows: readonly TreeRow[], id: string): TreeRow {
  const achada = rows.find((row) => row.id === id);
  if (achada === undefined) throw new Error(`sem a linha ${id}`);
  return achada;
}

/** Dois ossos e nada mais — sem `events` e sem `parameters`. */
function doisOssosD(): Doc {
  return new Doc({ ...CABECALHO_D, bones: [{ name: 'root' }, { name: 'mao', parent: 'root' }] } as unknown as BoneFile);
}

// ---------------------------------------------------------------------------
// Lote 2b do chat D (29/09/2026) — J3, B2 + F7, I-O1
// ---------------------------------------------------------------------------

describe('J3: o osso do menu nasce à vista, na ponta do escolhido, escolhido e dito', () => {
  it('com um osso escolhido: filho dele, na PONTA dele, com tamanho que se vê', () => {
    const doc = new Doc(heroiD());
    const pai = doc.file.bones!.find((b) => b.name === 'torso')!;
    doc.select({ ...emptySelection(), bones: ['torso'] });
    addBone(doc);
    const novo = doc.file.bones!.at(-1)!;
    expect([novo.parent, novo.length, novo.x]).toEqual(['torso', NEW_BONE_LENGTH, pai.length]);
    expect(doc.selection.bones).toEqual([novo.name]);
  });

  it('sem nada escolhido: solto, na origem — mas com tamanho — e o rodapé diz onde', () => {
    const doc = new Doc(heroiD());
    const avisos: string[] = [];
    doc.notice = (texto: string) => { avisos.push(texto); };
    doc.select(emptySelection());
    addBone(doc);
    const novo = doc.file.bones!.at(-1)!;
    expect([novo.parent, novo.length, novo.x]).toEqual(['root', NEW_BONE_LENGTH, undefined]);
    expect(avisos.at(-1)).toBe(newBoneNotice(novo.name, null));
    expect(avisos.at(-1)).toContain('solto, na origem');
  });

  it('o rodapé com pai diz de quem é filho', () => {
    expect(newBoneNotice('osso3', 'osso2')).toBe('Osso "osso3" criado, filho de "osso2", na ponta dele. Arraste a ponta para esticar');
  });
});

describe('B2 + F7: a Árvore abre e rola até o escolhido que veio de fora', () => {
  it('a escolha vira texto sem os vértices: escolher vértice não é escolher outra linha', () => {
    const a = { ...emptySelection(), bones: ['arm'] };
    expect(selectionKey({ ...a, vertices: [3, 4] })).toBe(selectionKey(a));
    expect(selectionKey({ ...a, bones: ['leg'] })).not.toBe(selectionKey(a));
  });

  it('a Árvore compara a escolha, abre o caminho e rola — só quando ela MUDOU', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/tree.ts'), 'utf8');
    expect(fonte).toContain('const mudou = escolha !== this.lastSelection;');
    expect(fonte).toContain('for (let at = achado.owner; at !== undefined; at = byId.get(at)?.owner) this.foldState().delete(at);');
    expect(fonte).toContain("node?.scrollIntoView?.({ block: 'nearest' });");
  });
});

describe('I-O1: o olho da Árvore diz o que fez', () => {
  it('esconder diz que não aparece e não pega clique; mostrar diz que voltou', () => {
    expect(eyeNotice('slot', 'hair', true)).toBe('O desenho "hair" está escondido: não aparece e não pega clique. O olho de novo mostra');
    expect(eyeNotice('bone', 'arm', false)).toBe('O osso "arm" está à vista de novo');
  });
});

// ---------------------------------------------------------------------------
// Rodada 12 (04/10/2026) — a Árvore e a pilha de peles (S4, S8, S9)
// ---------------------------------------------------------------------------

describe('rodada 12 — a Árvore com a pele no lápis', () => {
  const heroi12 = (): BoneFile =>
    JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;

  it('o desenho que a pele esconde fica na Árvore, em cinza e escolhível (S4)', () => {
    const linha = hierarchyRows(heroi12(), 'armadura').find((row) => row.id === 'slot:hair')!;
    expect(linha.empty).toBe(true);
    expect(linha.detail).toBe('escondida');
    expect(linha.attachment).toBe('hair');
    expect(linha.skin).toBe('armadura');
    expect(selectionForRow(linha).attachments).toEqual([{ slot: 'hair', attachment: 'hair' }]);
  });

  it('na default o cabelo continua como sempre', () => {
    const linha = hierarchyRows(heroi12(), 'default').find((row) => row.id === 'slot:hair')!;
    expect(linha.empty).toBeUndefined();
    expect(linha.detail).toBeUndefined();
  });

  it('os ossos que a pilha tira saem com os desenhos deles; o nível dos outros não muda (S8, S9)', () => {
    const file = heroi12();
    const todas = hierarchyRows(file, 'default');
    const sem = hierarchyRows(file, 'default', undefined, new Set(['arm_b', 'forearm_b']));
    expect(sem.some((row) => row.name === 'arm_b' || row.name === 'forearm_b')).toBe(false);
    expect(sem.some((row) => row.id === 'slot:hand_back' || row.id === 'slot:arm_back')).toBe(false);
    const nivel = (rows: typeof todas, id: string): number | undefined => rows.find((row) => row.id === id)?.depth;
    expect(nivel(sem, 'bone:leg')).toBe(nivel(todas, 'bone:leg'));
    expect(todas.length - sem.length).toBe(5);
  });
});

describe('rodada 23, defeito 7: a tecla P com o emissor escolhido — uma ordem só, e nada calado', () => {
  it('os recados: o P sem osso diz o nome do filho e a ordem; o clique no osso diz o passo que falta', async () => {
    const { boneFirstNotice, childInSelection } = await import('../src/viewport/parent-gesture.js');
    // Sem filho na seleção, o recado de sempre, letra por letra.
    expect(chooseBoneNotice()).toBe('Escolha um osso. Depois segure P e clique em quem vira filho dele');
    expect(chooseBoneNotice('torso_particulas')).toBe('Para prender torso_particulas: o osso vem primeiro. Escolha o osso, depois segure P e clique em torso_particulas');
    expect(boneFirstNotice('head', 'torso_particulas')).toBe('head escolhido. Agora segure P de novo e clique em torso_particulas: ele vira filho de head');
    const emissor = { ...emptySelection(), attachments: [{ slot: 'torso_particulas', attachment: 'torso_particulas' }] };
    expect(childInSelection(emissor)).toBe('torso_particulas');
    expect(childInSelection({ ...emptySelection(), slots: ['caixa'] })).toBe('caixa');
    expect(childInSelection({ ...emptySelection(), bones: ['torso', 'hips'] })).toBeNull();
  });

  it('no documento de verdade: emissor escolhido, P embaixo, osso escolhido → o rodapé diz o passo; P em cima cala', async () => {
    const { Doc } = await import('../src/doc/document.js');
    const doc = new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'hips', parent: 'root', y: 90, length: 10 }, { name: 'torso', parent: 'hips', length: 70 }],
      slots: [{ name: 'caixa', bone: 'root', attachment: 'caixa' }],
      skins: [{ name: 'default', attachments: { caixa: { caixa: { type: 'boundingbox', shape: 'rectangle', width: 20, height: 20 } } } }],
    } as BoneFile);
    const rodape: string[] = [];
    doc.on((c) => { if (c.label !== undefined) rodape.push(c.label); });
    doc.select({ ...emptySelection(), slots: ['caixa'], attachments: [{ slot: 'caixa', attachment: 'caixa' }] });
    selectTool.onKey?.(doc, 'p');
    expect(rodape.at(-1)).toBe(chooseBoneNotice('caixa'));
    // A forma do defeito: antes, este clique escolhia o osso e ninguém dizia nada.
    doc.select({ ...emptySelection(), bones: ['hips'] });
    expect(rodape.at(-1)).toBe('hips escolhido. Agora segure P de novo e clique em caixa: ele vira filho de hips');
    expect(selectTool.onKeyUp?.(doc, 'p')).toBe(false);
    // Com o P em cima, escolher outro osso não fala mais.
    const antes = rodape.length;
    doc.select({ ...emptySelection(), bones: ['torso'] });
    expect(rodape.length).toBe(antes);
  });
});

describe('rodada 23, defeito 9: depois de Devolver o osso, a Árvore não mostra 🚫', () => {
  it('a Árvore põe em dia os ossos que a pilha tira antes de desenhar o olho (era a cena, depois)', async () => {
    const { currentLocks, isBoneHidden, setSkinGoneBones } = await import('../src/viewport/onion.js');
    // A forma: a lista velha dizia "tirado" de um osso que já tinha voltado.
    setSkinGoneBones(new Set(['shin_b']));
    expect(isBoneHidden('shin_b', currentLocks())).toBe(true);
    setSkinGoneBones(new Set());
    expect(isBoneHidden('shin_b', currentLocks())).toBe(false);
    const fonte = readFileSync(resolve(import.meta.dirname, '../src/panels/tree.ts'), 'utf8').replace(/\r\n/g, '\n');
    expect(fonte).toMatch(/const gone = bonesGone\(corpoDe\(doc\)\.file, skinStackOf\(doc\)\);\n\s+setSkinGoneBones\(gone\);/);
  });
});

// ---------------------------------------------------------------------------
// Rodada 13 — peça tirada da base: as chaves ficam guardadas, e voltam
// ---------------------------------------------------------------------------

import { DeleteItems, AddBone as AddBoneR13, AddSlot as AddSlotR13 } from '../src/panels/tree-commands.js';
import { RenameItem as RenameR13 } from '../src/panels/rename.js';
import { DiscardGuarded, GUARDED_FIELD, guardNotice, readGuarded } from '../src/doc/guarded-keys.js';
import { NO_GUARDED_KEYS, deleteSelected as deleteSelectedR13, guardedLines } from '../src/panels/tree-actions.js';
import { readEditorState as readStateR13 } from '../src/contract.js';
import { ACTION_TABLE as TABELA_R13 } from '../src/ui/actions-table.js';

describe('rodada 13 — peça tirada da base: as chaves ficam guardadas, e voltam', () => {
/**
 * O Humberto (`02 AS DECISOES`, seção 1, regra 5): *"Peça tirada da base: as
 * chaves dela nas animações ficam guardadas, sem fazer nada. Se a peça volta,
 * as chaves voltam. Como dois saves: um não apaga o outro."*
 *
 * Antes desta rodada o Delete levava as linhas do tempo junto, e só o Ctrl+Z
 * as trazia. O boneco: `braco` com `mao` embaixo, e a `luva` (um ponto) na mão.
 */
function bonecoR13(): Doc {
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'braco', parent: 'root', length: 40 },
      { name: 'mao', parent: 'braco', x: 40, length: 10 },
    ],
    slots: [{ name: 'luva', bone: 'mao', attachment: 'p' }, { name: 'fundo', bone: 'root' }],
    skins: [{ name: 'default', attachments: { luva: { p: { type: 'point', x: 1 } } } }],
    animations: [
      {
        name: 'andar',
        timelines: [
          { type: 'bone', target: 'braco', property: 'rotation', keys: [
            { time: 0, value: 0 }, { time: 0.5, value: 45, curve: 'stepped' }, { time: 1, value: 0 },
          ] },
          { type: 'bone', target: 'mao', property: 'x', keys: [{ time: 0, value: 40 }, { time: 1, value: 50 }] },
          { type: 'slot', target: 'luva', property: 'color', keys: [{ time: 0.25, value: [1, 0, 0, 1] }] },
          { type: 'drawOrder', keys: [{ time: 0, value: [{ slot: 'luva', offset: -1 }] }] },
        ],
      },
      {
        name: 'pular',
        timelines: [
          { type: 'bone', target: 'braco', property: 'y', keys: [{ time: 0, value: 0 }, { time: 0.3, value: 12 }] },
        ],
      },
    ],
  } as unknown as BoneFile;
  return new Doc(file);
}

const linhasR13 = (doc: Doc, animation: string): Array<Record<string, unknown>> =>
  ((doc.file.animations ?? []).find((a) => a.name === animation)?.timelines ?? []) as unknown as Array<Record<string, unknown>>;
const apagarBracoR13 = (doc: Doc): DeleteItems => {
  const command = new DeleteItems({ ...emptySelection(), bones: ['braco'] });
  doc.run(command);
  return command;
};
/** Um osso novo, e o nome dele trocado para `nome` — o gesto de quem refaz a peça. */
const refazerOssoR13 = (doc: Doc, nome: string): void => {
  const add = new AddBoneR13(doc.file, null);
  doc.run(add);
  doc.run(new RenameR13(doc.file, { kind: 'bone', from: add.name } as never, nome));
};

it('apagar o braço tira as chaves das animações e as GUARDA no arquivo, com o rodapé dizendo', () => {
  const doc = bonecoR13();
  const command = apagarBracoR13(doc);
  for (const name of ['andar', 'pular']) {
    for (const tl of linhasR13(doc, name)) expect(['braco', 'mao', 'luva']).not.toContain(tl['target']);
  }
  // A ordem de desenho perde a luva — e a guarda.
  expect(linhasR13(doc, 'andar').find((tl) => tl['type'] === 'drawOrder')!['keys']).toEqual([{ time: 0, value: [] }]);
  // braço 3 + 2, mão 2, luva 1 de cor + 1 de ordem = 9 chaves, em 2 animações.
  expect(command.guarded).toEqual({ keys: 9, animations: 2, names: ['braco', 'mao', 'luva'] });
  expect(guardNotice(command.guarded)).toBe(
    '9 chaves de 3 peças guardadas em 2 animações. Crie de novo com o mesmo nome e elas voltam',
  );
  expect(readGuarded(doc.file)).toHaveLength(5);
  expect(Object.keys(readStateR13(doc.file))).toContain(GUARDED_FIELD);
  expect(doc.file.extensionsUsed).toContain('RECORTE_editor_state');
  // Nenhum leitor tropeça: o runtime não avisa de alvo que não existe.
  expect(doc.warnings.filter((w) => /braco|mao|luva/.test(w))).toEqual([]);
});

it('o Delete da cena e da Árvore diz no rodapé quantas guardou', () => {
  const doc = bonecoR13();
  const ditos: string[] = [];
  doc.on((change) => { if (change.label !== undefined) ditos.push(change.label); });
  doc.select({ ...emptySelection(), bones: ['braco'] });
  deleteSelectedR13(doc);
  // Rodada 43, lote 4: o rodapé diz quem e quanto, e as chaves guardadas no fim.
  expect(ditos.at(-1)).toMatch(/^Apaguei braco: \d+ ossos?.*\. Ctrl\+Z volta\. 9 chaves de 3 peças guardadas em 2 animações\. Crie de novo com o mesmo nome e elas voltam$/);
});

it('Ctrl+Z do Apagar devolve o arquivo letra por letra', () => {
  const doc = bonecoR13();
  const texto = JSON.stringify(doc.file);
  apagarBracoR13(doc);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(texto);
});

it('salvar, fechar e reabrir no meio: a peça volta com o mesmo nome e as chaves voltam, como eram', () => {
  const doc = bonecoR13();
  const andarAntes = JSON.stringify(linhasR13(doc, 'andar').find((tl) => tl['target'] === 'braco'));
  const pularAntes = JSON.stringify(linhasR13(doc, 'pular').find((tl) => tl['target'] === 'braco'));
  apagarBracoR13(doc);
  // Salvar é `JSON.stringify`; reabrir é ler o texto.
  const reaberto = new Doc(JSON.parse(JSON.stringify(doc.file)) as BoneFile);
  expect(readGuarded(reaberto.file)).toHaveLength(5);
  const ditos: string[] = [];
  reaberto.on((change) => { if (change.label !== undefined) ditos.push(change.label); });
  const antesDeVoltar = JSON.stringify(reaberto.file);
  refazerOssoR13(reaberto, 'braco');
  expect(JSON.stringify(linhasR13(reaberto, 'andar').find((tl) => tl['target'] === 'braco'))).toBe(andarAntes);
  expect(JSON.stringify(linhasR13(reaberto, 'pular').find((tl) => tl['target'] === 'braco'))).toBe(pularAntes);
  expect(ditos.at(-1)).toBe('5 chaves guardadas voltaram de "braco", em 2 animações');
  // A mão e a luva continuam guardadas: só o braço voltou.
  expect(readGuarded(reaberto.file).map((e) => e.nome)).toEqual(['mao', 'luva', 'luva']);
  // E a cena anima o braço de novo.
  reaberto.animation = 'andar';
  reaberto.time = 0.75;
  expect(reaberto.skeleton!.findBone('braco')!.arotation).toBeCloseTo(45, 6);
  // Um Ctrl+Z desfaz o nome e as chaves juntas: um passo só.
  reaberto.undo();
  expect(reaberto.file.bones.some((b) => b.name === 'braco')).toBe(false);
  expect(readGuarded(reaberto.file)).toHaveLength(5);
  reaberto.undo();
  expect(JSON.stringify(reaberto.file)).toBe(antesDeVoltar);
});

it('a imagem volta, e a ordem de desenho dela também', () => {
  const doc = bonecoR13();
  apagarBracoR13(doc);
  const add = new AddSlotR13(doc.file, 'root');
  doc.run(add);
  doc.run(new RenameR13(doc.file, { kind: 'slot', from: add.name } as never, 'luva'));
  const andar = linhasR13(doc, 'andar');
  expect(andar.find((tl) => tl['type'] === 'slot' && tl['target'] === 'luva')).toBeDefined();
  expect(andar.find((tl) => tl['type'] === 'drawOrder')!['keys']).toEqual([{ time: 0, value: [{ slot: 'luva', offset: -1 }] }]);
});

it('de outro tipo não religa, e o rodapé diz', () => {
  const doc = bonecoR13();
  apagarBracoR13(doc);
  const ditos: string[] = [];
  doc.on((change) => { if (change.label !== undefined) ditos.push(change.label); });
  const add = new AddSlotR13(doc.file, 'root');
  doc.run(add);
  doc.run(new RenameR13(doc.file, { kind: 'slot', from: add.name } as never, 'braco'));
  expect(linhasR13(doc, 'pular')).toEqual([]);
  expect(ditos.at(-1)).toBe('"braco" tem chaves guardadas de um osso: com outro tipo elas não voltam');
  expect(readGuarded(doc.file)).toHaveLength(5);
  // E não repete a cada mexida depois.
  doc.run(new AddBoneR13(doc.file, null));
  expect(ditos.at(-1)).not.toContain('com outro tipo');
});

it('um não apaga o outro: a linha que a peça nova já tem fica, e a guardada continua guardada', () => {
  const doc = bonecoR13();
  apagarBracoR13(doc);
  const add = new AddBoneR13(doc.file, null);
  doc.run(add);
  // A peça nova ganha um giro próprio em "andar", antes de ganhar o nome.
  const nova = { type: 'bone', target: add.name, property: 'rotation', keys: [{ time: 0, value: 90 }] };
  (doc.file.animations![0]!.timelines as unknown as unknown[]).push(nova);
  const ditos: string[] = [];
  doc.on((change) => { if (change.label !== undefined) ditos.push(change.label); });
  doc.run(new RenameR13(doc.file, { kind: 'bone', from: add.name } as never, 'braco'));
  const giro = linhasR13(doc, 'andar').filter((tl) => tl['target'] === 'braco' && tl['property'] === 'rotation');
  expect(giro).toHaveLength(1);
  expect(giro[0]!['keys']).toEqual([{ time: 0, value: 90 }]);
  expect(linhasR13(doc, 'pular').find((tl) => tl['target'] === 'braco')).toBeDefined();
  expect(ditos.at(-1)).toBe('2 chaves guardadas voltaram de "braco", em 1 animação. '
    + '1 linha guardada continua guardada: a animação já tem chave nova ali');
  expect(readGuarded(doc.file).filter((e) => e.nome === 'braco')).toHaveLength(1);
});

it('jogar fora de propósito: pelo menu Chaves guardadas…, com o Ctrl+Z devolvendo', () => {
  const doc = bonecoR13();
  apagarBracoR13(doc);
  expect(guardedLines(doc.file)).toEqual([
    'osso "braco": 5 chaves, em 2 animações',
    'osso "mao": 2 chaves, em 1 animação',
    'imagem "luva": 2 chaves, em 1 animação',
  ]);
  const texto = JSON.stringify(doc.file);
  const command = new DiscardGuarded();
  doc.run(command);
  expect(command.dropped).toBe(9);
  expect(readGuarded(doc.file)).toEqual([]);
  expect(Object.keys(readStateR13(doc.file))).not.toContain(GUARDED_FIELD);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(texto);
});

it('a porta: "Chaves guardadas…" no menu Base, com id na tabela, e cinza dizendo por quê', () => {
  const row = TABELA_R13.find((r) => r.id === 'chaves-guardadas');
  expect(row?.label).toBe('Chaves guardadas…');
  expect(row?.owner).toBe('arvore');
  clearActions();
  const doc = bonecoR13();
  registerTreeActions(doc);
  expect(hasAction('chaves-guardadas')).toBe(true);
  expect(NO_GUARDED_KEYS).toContain('tira da base');
});
});

// ---------------------------------------------------------------------------
// Rodada 17, D2: o evento escolhido na Árvore abre a ficha dele
// ---------------------------------------------------------------------------

describe('rodada 17, D2: o evento na Árvore abre a ficha DELE, no alto de Propriedades', () => {
  it('o foco no evento: escolhe, avisa quem ouve, e sai na próxima escolha', () => {
    let avisos = 0;
    const parar = onEventFocus(() => { avisos += 1; });
    focusEvent('step');
    expect(eventFocused()).toBe(true);
    expect(currentEventChoice()).toBe('step');
    expect(avisos).toBe(1);
    releaseEventFocus();
    expect(eventFocused()).toBe(false);
    parar();
    focusEvent('step');
    expect(avisos).toBe(1);
    releaseEventFocus();
  });

  it('a Árvore e Propriedades ligam (antes: a seleção vazia mostrava a ficha da Base)', () => {
    const arvore = readFileSync(resolve(__dirname, '../src/panels/tree.ts'), 'utf8');
    expect(arvore).toMatch(/doc\.select\(emptySelection\(\)\);\s*\n\s*focusEvent\(row\.name\);/);
    const ficha = readFileSync(resolve(__dirname, '../src/panels/properties.ts'), 'utf8');
    expect(ficha).toContain('if (eventFocused() && temEvento && isEmptySelection(doc.selection)) {');
    expect(ficha).toContain("if (change.kind === 'selection' || change.kind === 'file') releaseEventFocus();");
  });
});

// ---------------------------------------------------------------------------
// Rodada 43, lote 3 — a Árvore escolhe e anda (doc `51`)
// ---------------------------------------------------------------------------

import * as TR43 from '../src/panels/tree-rows.js';
import { readFileSync as readFileSync43 } from 'node:fs';
import { resolve as resolve43 } from 'node:path';

const heroi43 = (): BoneFile => JSON.parse(readFileSync43(resolve43(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
const linhas43 = (): TR43.TreeRow[] => TR43.hierarchyRows(heroi43(), 'default');
const linha43 = (id: string): TR43.TreeRow => linhas43().find((r) => r.id === id)!;

describe('rodada 43, lote 3: a Árvore escolhe e anda', () => {
  it('Ctrl+clique soma a linha à escolha, e tira se já estava', () => {
    const t = TR43;
    let sel = TR43.selectionForRow(linha43('slot:body'));
    sel = t.toggleRowInSelection(sel, linha43('slot:hitbox'));
    expect(sel.slots).toEqual(['body', 'hitbox']);
    sel = t.toggleRowInSelection(sel, linha43('bone:arm'));
    expect(sel.bones).toEqual(['arm']);
    sel = t.toggleRowInSelection(sel, linha43('slot:body'));
    expect(sel.slots).toEqual(['hitbox']);
    expect(sel.attachments.some((a) => a.slot === 'body')).toBe(false);
  });
  it('Shift+clique escolhe a faixa entre a âncora e a linha, na ordem da tela', () => {
    const vis = TR43.unfoldedRows(linhas43(), new Set());
    const faixa = TR43.rangeSelection(vis, 'slot:mask', 'slot:hitbox');
    expect(faixa.slots).toEqual(['mask', 'body', 'hitbox']);
    const aoContrario = TR43.rangeSelection(vis, 'slot:hitbox', 'slot:mask');
    expect(aoContrario.slots).toEqual(['mask', 'body', 'hitbox']);
  });
  it('as setas andam pelas linhas que se veem', () => {
    const vis = TR43.unfoldedRows(linhas43(), new Set(['bone:head']));
    const anda = TR43.stepRow;
    expect(anda(vis, 'bone:torso', 1)!.id).toBe('slot:mask');
    expect(anda(vis, 'slot:mask', -1)!.id).toBe('bone:torso');
    // head dobrado: o de baixo de head é o próximo depois do ramo dele
    const depoisDoHead = vis[vis.findIndex((r) => r.id === 'bone:head') + 1]!.id;
    expect(anda(vis, 'bone:head', 1)!.id).toBe(depoisDoHead);
    expect(anda(vis, vis[0]!.id, -1)).toBeNull();
  });
  it('Alt+clique no triângulo: o ramo inteiro', () => {
    const ramo = TR43.branchFoldIds(linhas43(), 'bone:torso');
    expect(ramo).toContain('bone:torso');
    expect(ramo).toContain('bone:head');
    expect(ramo).toContain('bone:forearm');
    expect(ramo).not.toContain('bone:leg');
    expect(ramo).not.toContain('slot:body');
  });
  it('o rodapé do renomear diz o nome velho e o novo, e avisa o repetido e o vazio', () => {
    const t = TR43;
    expect(t.renameSays('hand_2', 'mao_nova', 'mao_nova')).toBe('hand_2 agora se chama mao_nova');
    expect(t.renameSays('forearm', 'arm', 'arm2')).toBe('Já existe "arm": forearm ficou arm2');
    expect(t.emptyNameSays('torso')).toBe('O nome não pode ficar vazio: torso continua torso');
  });
  it('a peça renomeada fica à vista, e a busca e os outros achados ficam como estavam (doc 62, a)', () => {
    const rows = linhas43().map((r) => (r.id === 'slot:hand' ? { ...r, id: 'slot:mao_nova', name: 'mao_nova' } : r));
    const sem = TR43.searchHierarchy(rows, 'hand').map((r) => r.id);
    expect(sem).not.toContain('slot:mao_nova');
    const com = TR43.searchHierarchy(rows, 'hand', new Set(['slot:mao_nova'])).map((r) => r.id);
    expect(com).toContain('slot:mao_nova');
    expect(com).toContain('slot:hand_point');
    expect(com).toContain('bone:hand_target');
  });
  });

// ---------------------------------------------------------------------------
// Rodada 43, lote 4 — apagar diz o quê (doc `51`)
// ---------------------------------------------------------------------------

describe('rodada 43, lote 4: apagar diz o quê', () => {
  it('o plano do apagar conta os ossos e os desenhos que vão junto', () => {
    const plano = TR43.deletePlan(heroi43(), { ...emptySelection(), bones: ['arm'] });
    expect(plano.bones).toEqual(['arm', 'forearm']);
    expect(plano.slots.length).toBe(6);
    expect(TR43.deleteNeedsAsking({ ...emptySelection(), bones: ['arm'] }, plano)).toBe(true);
    const so = TR43.deletePlan(heroi43(), { ...emptySelection(), slots: ['hitbox'] });
    expect(so.bones).toEqual([]);
    expect(TR43.deleteNeedsAsking({ ...emptySelection(), slots: ['hitbox'] }, so)).toBe(false);
  });
  it('o rodapé do apagar diz o nome e quanto, e que Ctrl+Z volta', () => {
    const plano = TR43.deletePlan(heroi43(), { ...emptySelection(), bones: ['arm'] });
    expect(TR43.deleteSays({ ...emptySelection(), bones: ['arm'] }, plano)).toBe('Apaguei arm: 2 ossos, 6 desenhos e 1 regra. Ctrl+Z volta');
    const so = TR43.deletePlan(heroi43(), { ...emptySelection(), slots: ['hitbox'] });
    expect(TR43.deleteSays({ ...emptySelection(), slots: ['hitbox'] }, so)).toBe('Apaguei hitbox: 1 desenho. Ctrl+Z volta');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 4: somar pela Árvore fala como pela cena (nota b do doc 82)', () => {
  it('Ctrl e Shift na Árvore dizem "N escolhidos", com a mesma frase da cena', () => {
    const arvore = fonteR47L4('panels/tree.ts');
    expect((arvore.match(/sayChosen\(doc\);/g) ?? []).length).toBe(2);
    expect(arvore).toContain('const dito = chosenNotice(nomes);');
  });
});

// ---------------------------------------------------------------------------
// Rodada 50, lote 4 — o desenho com osso próprio na Árvore do quadro (doc 101)
// ---------------------------------------------------------------------------

describe('rodada 50, lote 4: o desenho que virou filho de outro osso numa animação aparece debaixo do pai DO QUADRO', () => {
  function comOssoProprio(): BoneFile {
    return {
      skeleton: { spine: '4.2' },
      bones: [
        { name: 'root' },
        { name: 'torso', parent: 'root' },
        { name: 'head', parent: 'root' },
        { name: 'body_osso', parent: 'torso', extensions: { RECORTE_editor_state: { ossoProprio: true } } },
      ],
      slots: [{ name: 'body', bone: 'body_osso' }],
      skins: [{ name: 'default', attachments: {} }],
      animations: [],
    } as unknown as BoneFile;
  }

  it('sem animação (o arquivo): body mora debaixo de torso', () => {
    const linhas = hierarchyRows(comOssoProprio());
    const body = linhas.findIndex((row) => row.kind === 'slot' && row.name === 'body');
    const torso = linhas.findIndex((row) => row.kind === 'bone' && row.name === 'torso');
    expect(body).toBe(torso + 1);
  });

  it('com a chave de pai do quadro (body_osso → head): body aparece debaixo de head', () => {
    const quadro = new Map<string, string | undefined>([['torso', 'root'], ['head', 'root'], ['body_osso', 'head']]);
    const linhas = hierarchyRows(comOssoProprio(), 'default', quadro);
    const body = linhas.findIndex((row) => row.kind === 'slot' && row.name === 'body');
    const head = linhas.findIndex((row) => row.kind === 'bone' && row.name === 'head');
    expect(body).toBe(head + 1);
    expect(linhas[body]!.depth).toBe(linhas[head]!.depth + 1);
  });
});

describe('rodada 50, lote 4: a chave slot/bone (o desenho troca de osso no quadro) muda o lugar dele na Árvore', () => {
  function semOssoProprio(): BoneFile {
    return {
      skeleton: { spine: '4.2' },
      bones: [{ name: 'root' }, { name: 'torso', parent: 'root' }, { name: 'head', parent: 'root' }],
      slots: [{ name: 'body', bone: 'torso' }],
      skins: [{ name: 'default', attachments: {} }],
      animations: [],
    } as unknown as BoneFile;
  }

  it('o caso do conferente (doc 101): "body virou filho de head (chave de pai em 0,00 s)" — a Árvore mostra body debaixo de head', () => {
    const quadro = new Map<string, string>([['body', 'head']]);
    const linhas = hierarchyRows(semOssoProprio(), 'default', undefined, new Set(), quadro);
    const body = linhas.findIndex((row) => row.kind === 'slot' && row.name === 'body');
    const head = linhas.findIndex((row) => row.kind === 'bone' && row.name === 'head');
    expect(body).toBe(head + 1);
  });

  it('a Árvore pede o osso de cada desenho NO QUADRO ao esqueleto vivo (o Slot.bone aplicado do runtime)', () => {
    const arvore = readFileSync(resolve(__dirname, '../src/panels/tree.ts'), 'utf8');
    expect(arvore).toMatch(/appliedSlotBones\(doc\)/);
    const reparent = readFileSync(resolve(__dirname, '../src/doc/reparent.ts'), 'utf8');
    expect(reparent).toMatch(/export function appliedSlotBones\(doc: EditorDoc\)/);
  });
});
