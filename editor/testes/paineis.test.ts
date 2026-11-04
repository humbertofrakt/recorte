/**
 * Painéis — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `paineis`, `lote38-escondido-e-escondido`, `lote52-altura-dos-paineis`, `lote65-paineis-que-cabem`.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { BoneFile } from '../../runtime/src/index.js';
import { emptySelection } from '../src/contract.js';
import type { EditorDoc, Selection } from '../src/contract.js';
import { deleteAtPointer, escapeToken, getAtPointer, hasAtPointer, parsePointer, pointerOf, setAtPointer } from '../src/panels/json-pointer.js';
import { AddBone, AddSlot, DeleteItems, MoveSlot, RenameItem, AddConstraint, AddEvent, AddParameter, AddSkin, CONSTRAINT_TYPES, boneRows, hierarchyRows, canDeleteSelection, canReparent, constraintRows, constraintTypeLabel, attachmentRows, isDescendantBone, selectionForRow, slotRows } from '../src/panels/tree-model.js';
import { Reparent } from '../src/doc/reparent.js';
import { SetProperty, buildProperties, constraintFields, evalNumberExpression, fieldValue, findAttachment, formatNumberField, setFieldCommand } from '../src/panels/properties-model.js';
import type { FieldDef, FieldGroup } from '../src/panels/properties-model.js';
import { skeletonFields as skeletonFieldsR47 } from '../src/panels/properties-model.js';
import { REGUA, comRegua, medidaDe, medidaDoCaminho } from '../src/panels/regua-numeros.js';
// Extensão `BONE_particles`, lote 1: a ficha do emissor.
import { alphaDragSays, alphaShown, alphaTip, attachmentFields, emptyGradientSays, EMPTY_GRADIENT_SHORT, meshOptionsInSlot, rangeFieldCommand } from '../src/panels/properties-model.js';
import { AddAnimation, DeleteAnimation, DuplicateAnimation, animationDuration, clampTime, findAnimation, formatTime, listAnimations, parseTime, progressOf, timeAt } from '../src/panels/animations-model.js';
import { join, resolve, sep } from 'node:path';
import { quickFields as quickFieldsL8, quickSubject as quickSubjectL8, readQuickNow as readQuickNowL8, writeQuickValue as writeQuickValueL8 } from '../src/panels/quick-model.js';
import { emitterRows as emitterRowsR15, selectionForRow as selectionForRowR15 } from '../src/panels/particles-model.js';
import { EMPTY_PRESET as EMPTY_PRESET_R15, boneForNewEmitter as boneForNewEmitterR15, presetActionId as presetActionIdR15 } from '../src/panels/particle-presets.js';
import { addParticleEmitter as addParticleEmitterR15 } from '../src/panels/tree-actions.js';
import { RIGHT_GROUPS as RIGHT_GROUPS_R15 } from '../src/ui/layout-model.js';
import { WINDOW_GROUPS as WINDOW_GROUPS_R15, WINDOW_PANELS as WINDOW_PANELS_R15, particlesMenu } from '../src/ui/menus.js';
import { Duplicate as DuplicateR15 } from '../src/doc/duplicate.js';
import { Doc as DocR15 } from '../src/doc/document.js';
import { emitterWarningLines as emitterWarningLinesR15 } from '../src/viewport/particles-view.js';
import { GROUP_MIN_PX, SPLIT_MAX, SPLIT_MIN, resizeSplit, DEFAULT_SPLIT } from '../src/ui/panel-groups.js';
import { LEFT_SPLIT, defaultLayout, defaultSplit, parseSavedSplits, splitsToSave, withSavedSplits } from '../src/ui/layout-model.js';
import { meshPanelSections } from '../src/panels/mesh-panel-model.js';
import { LABEL_MAX, labelFor } from '../src/panels/label-model.js';
import { ChooseShape as ChooseShapeR16, capCutting as capCuttingR16, shapeNameLine as shapeNameLineR16, shapeSummaryLine as shapeSummaryLineR16, shapeExitTitle, MEDIDA, LINHAS_DA_FICHA_RAPIDA as LINHAS_DA_FICHA_RAPIDA_R16, LINHAS_POR_ABA as LINHAS_POR_ABA_R16, particleSheetTabs as particleSheetTabsR16, type SheetTab as SheetTabR16 } from '../src/panels/particle-sheet.js';
import { hasIcon as hasIconR16 } from '../src/ui/icons.js';
import {
  addColorKey as addColorKeyR16, addLifeKey as addLifeKeyR16, gradientCss as gradientCssR16, moveLifeKey as moveLifeKeyR16,
  removeLifeKey as removeLifeKeyR16, sampleLife as sampleLifeR16, sampleLifeColor as sampleLifeColorR16, setColorKey as setColorKeyR16,
} from '../src/panels/life-curve.js';
import {
  addBurst as addBurstR16, burstSummary as burstSummaryR16, burstsLine as burstsLineR16, readBursts as readBurstsR16,
  removeBurst as removeBurstR16, setBurstField as setBurstFieldR16,
} from '../src/panels/burst-list.js';
import { edgeFieldCommand as edgeFieldCommandR16 } from '../src/panels/properties-model.js';
import { emittersOnBone as emittersOnBoneR16 } from '../src/panels/particle-presets.js';
import { burstWindowPlace as burstWindowPlaceR16 } from '../src/panels/burst-list.js';
import { pathOptions as pathOptionsR16 } from '../src/panels/properties-model.js';
import { emitterProblem as emitterProblemR16, pathExists as pathExistsR16 } from '../src/viewport/particles-view.js';
import { pathPolyline as pathPolylineR16 } from '../src/viewport/emitter-shape.js';
import {
  copyKeys as copyKeysR16, dopesheetGroups as dopesheetGroupsR16, moveKeys as moveKeysR16, pasteKeys as pasteKeysR16,
  removeKey as removeKeyR16, setupPointerFor as setupPointerForR16, targetForPointer as targetForPointerR16,
} from '../src/anim/keying.js';
import { sequenceCommand as sequenceCommandR16, writeFieldValue as writeFieldValueR16 } from '../src/panels/properties-model.js';
import {
  emitterLiveEstimate as emitterLiveEstimateR16, emitterWeight as emitterWeightR16, skeletonWeight as skeletonWeightR16,
  weightBadge as weightBadgeR16, weightHint as weightHintR16, weightWarningLines as weightWarningLinesR16,
} from '../src/panels/particle-weight.js';

// ---------------------------------------------------------------------------
// paineis — era `paineis.test.ts`
// ---------------------------------------------------------------------------

describe('paineis', () => {
/**
 * Tests for the right-hand panels.
 *
 * There is no jsdom in this project, so the panels keep every decision in pure
 * model functions (`tree-model`, `properties-model`, `animations-model`) and
 * the DOM files only draw. These tests cover the models and the commands
 * against the real example file.
 */
const EXAMPLE = process.cwd().replace(/\\/g, '/') + '/formato/exemplos/heroi.bone';
const RAW = readFileSync(EXAMPLE, 'utf8');

/** A fresh copy of the example, so tests never share state. */
function example(): BoneFile {
  return JSON.parse(RAW) as BoneFile;
}

/** The panels only ever touch `doc.file` and `doc.selection`. */
function fakeDoc(file: BoneFile): EditorDoc {
  return { file, selection: emptySelection() } as unknown as EditorDoc;
}

function selectionOf(part: Partial<Selection>): Selection {
  return { ...emptySelection(), ...part };
}

/** All fields of a model, flattened, for easy lookup by key. */
function allFields(groups: FieldGroup[]): Map<string, FieldDef> {
  const map = new Map<string, FieldDef>();
  for (const group of groups) for (const field of group.fields) map.set(field.key, field);
  return map;
}

// ---------------------------------------------------------------------------

describe('JSON Pointer', () => {
  it('escapes and parses the awkward characters', () => {
    expect(escapeToken('a/b~c')).toBe('a~1b~0c');
    expect(pointerOf('skins', 0, 'attachments', 'a/b')).toBe('/skins/0/attachments/a~1b');
    expect(parsePointer('/skins/0/attachments/a~1b')).toEqual(['skins', '0', 'attachments', 'a/b']);
    expect(parsePointer('')).toEqual([]);
  });

  it('reads a value out of the real file', () => {
    const file = example();
    expect(getAtPointer(file, '/bones/0/name')).toBe('root');
    expect(getAtPointer(file, '/bones/99/name')).toBeUndefined();
  });

  it('writes, tells apart absent from present, and deletes', () => {
    const file = example();
    expect(hasAtPointer(file, '/bones/1/shearX')).toBe(false);
    setAtPointer(file, '/bones/1/shearX', 12);
    expect(hasAtPointer(file, '/bones/1/shearX')).toBe(true);
    expect(getAtPointer(file, '/bones/1/shearX')).toBe(12);
    deleteAtPointer(file, '/bones/1/shearX');
    expect(hasAtPointer(file, '/bones/1/shearX')).toBe(false);
  });

  it('creates the containers it needs and reports them', () => {
    const file = { bone: { version: '1', minVersion: '1', generator: 't' }, bones: [] } as unknown as BoneFile;
    const created = setAtPointer(file, '/skeleton/fps', 24);
    expect(created).toEqual(['/skeleton']);
    expect(getAtPointer(file, '/skeleton/fps')).toBe(24);
  });
});

// ---------------------------------------------------------------------------

describe('conta simples nos campos numéricos', () => {
  it('resolve as quatro operações', () => {
    expect(evalNumberExpression('100/2')).toBe(50);
    expect(evalNumberExpression('10+5')).toBe(15);
    expect(evalNumberExpression('10 - 4')).toBe(6);
    expect(evalNumberExpression('2*3+4')).toBe(10);
    expect(evalNumberExpression('(1+2)*3')).toBe(9);
  });

  it('aceita vírgula e sinal', () => {
    expect(evalNumberExpression('4,5')).toBe(4.5);
    expect(evalNumberExpression('-4,5')).toBe(-4.5);
    expect(evalNumberExpression('-2*3')).toBe(-6);
  });

  it('devolve nulo quando não é conta', () => {
    expect(evalNumberExpression('')).toBeNull();
    expect(evalNumberExpression('abc')).toBeNull();
    expect(evalNumberExpression('1+')).toBeNull();
    expect(evalNumberExpression('(1+2')).toBeNull();
    expect(evalNumberExpression('1/0')).toBeNull();
  });

  it('mostra o número com vírgula', () => {
    expect(formatNumberField(1.5)).toBe('1,5');
    expect(formatNumberField(90)).toBe('90');
  });
});

// ---------------------------------------------------------------------------

describe('árvore', () => {
  it('mostra os ossos em profundidade, com recuo por nível', () => {
    const rows = boneRows(example());
    const byName = new Map(rows.map((row) => [row.name, row]));
    expect(rows[0]!.name).toBe('root');
    expect(byName.get('hips')!.depth).toBe(1);
    expect(byName.get('torso')!.depth).toBe(2);
    expect(byName.get('head')!.depth).toBe(3);
    expect(byName.get('hair')!.depth).toBe(4);
    expect(byName.get('forearm')!.depth).toBe(4);
    expect(rows).toHaveLength(example().bones.length);
    // Every parent comes before its child.
    for (const row of rows) {
      if (row.parent === undefined) continue;
      expect(rows.findIndex((r) => r.name === row.parent))
        .toBeLessThan(rows.findIndex((r) => r.name === row.name));
    }
  });

  it('lista os slots na ordem de desenho', () => {
    const file = example();
    const rows = slotRows(file);
    expect(rows.map((row) => row.name)).toEqual(file.slots!.map((slot) => slot.name));
    expect(rows[0]!.index).toBe(0);
  });

  // Lote 27, anotação 12: as PELES saíram da Árvore e viraram a aba Peles.
  // Os anexos ficaram: são a única porta para escolher um desenho pelo nome.
  it('lista os desenhos, com o slot e a pele ao lado', () => {
    const rows = attachmentRows(example());
    expect(rows.every((row) => row.kind === 'attachment')).toBe(true);
    // Nenhuma linha de pele sobrou.
    expect(rows.some((row) => row.name === 'armadura')).toBe(false);

    const face = rows.find((row) => row.name === 'face' && row.skin === 'default');
    expect(face?.slot).toBe('head');
    expect(face?.detail).toBe('head');
    expect(face?.depth).toBe(0);

    // O mesmo nome noutra pele diz de qual pele ele é.
    const outra = rows.find((row) => row.name === 'face' && row.skin === 'armadura');
    expect(outra?.detail).toBe('head · armadura');
  });

  it('lista as regras com o tipo em português', () => {
    const rows = constraintRows(example());
    expect(rows.map((row) => row.name))
      .toEqual(['ik_arm', 'head_lean', 'cape_follow', 'hair_physics', 'look_driver']);
    expect(rows[0]!.detail).toBe('cinemática inversa');
    expect(constraintTypeLabel('physics')).toBe('física');
  });

  // Eram quatro seções. As **Peles** viraram aba no lote 27, as **Regras** no
  // 28, e no lote 64 a Árvore virou uma árvore só: ossos, e por baixo os desenhos.
  it('é uma árvore só: ossos e desenhos, sem seção', () => {
    const rows = hierarchyRows(example());
    expect(new Set(rows.map((row) => row.kind))).toEqual(new Set(['bone', 'slot']));
    expect(rows.filter((row) => row.kind === 'slot')).toHaveLength(example().slots!.length);
  });

  it('clicar numa linha seleciona aquele item', () => {
    const rows = hierarchyRows(example());
    const bone = rows.find((row) => row.name === 'hips')!;
    expect(selectionForRow(bone).bones).toEqual(['hips']);
    const drawing = rows.find((row) => row.id === 'slot:head')!;
    expect(selectionForRow(drawing).attachments).toEqual([{ slot: 'head', attachment: 'face' }]);
  });
});

// ---------------------------------------------------------------------------

describe('arrastar na árvore', () => {
  it('sabe quem está debaixo de quem', () => {
    const file = example();
    expect(isDescendantBone(file, 'hair', 'torso')).toBe(true);
    expect(isDescendantBone(file, 'leg', 'torso')).toBe(false);
  });

  it('não deixa criar um laço nem mover a raiz', () => {
    const file = example();
    expect(canReparent(file, 'head', 'leg')).toBe(true);
    expect(canReparent(file, 'torso', 'hair')).toBe(false);
    expect(canReparent(file, 'root', 'hips')).toBe(false);
    expect(canReparent(file, 'hips', 'hips')).toBe(false);
  });

  it('muda o pai e mantém a ordem que o carregador exige', () => {
    const file = example();
    const doc = fakeDoc(file);
    // Um comando só desde o lote 34, e é ele que guarda a pose de mundo.
    const command = new Reparent(file, { ...emptySelection(), bones: ['head'] }, 'leg');
    command.apply(doc);

    const head = file.bones.find((bone) => bone.name === 'head')!;
    expect(head.parent).toBe('leg');
    const at = (name: string): number => file.bones.findIndex((bone) => bone.name === name);
    expect(at('leg')).toBeLessThan(at('head'));
    expect(at('head')).toBeLessThan(at('hair'));

    command.revert(doc);
    expect(file.bones.find((bone) => bone.name === 'head')!.parent).toBe('torso');
    expect(file.bones.map((bone) => bone.name)).toEqual(example().bones.map((bone) => bone.name));
  });

  it('muda a ordem de desenho de um slot e desfaz', () => {
    const file = example();
    const doc = fakeDoc(file);
    const before = file.slots!.map((slot) => slot.name);
    const command = new MoveSlot(0, 3);
    command.apply(doc);
    expect(file.slots!.map((slot) => slot.name)[3]).toBe(before[0]);
    command.revert(doc);
    expect(file.slots!.map((slot) => slot.name)).toEqual(before);
  });
});

// ---------------------------------------------------------------------------

describe('criar e apagar na árvore', () => {
  it('cria um osso com nome livre e desfaz', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new AddBone(file, 'hips');
    command.apply(doc);
    const added = file.bones.find((bone) => bone.name === command.name)!;
    expect(added.parent).toBe('hips');
    command.revert(doc);
    expect(file.bones.some((bone) => bone.name === command.name)).toBe(false);
  });

  it('cria um slot no fim da ordem de desenho', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new AddSlot(file, 'torso');
    command.apply(doc);
    expect(file.slots!.at(-1)!.name).toBe(command.name);
    command.revert(doc);
    expect(file.slots!.some((slot) => slot.name === command.name)).toBe(false);
  });

  it('apagar um osso leva junto os filhos, os slots e as regras', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new DeleteItems(selectionOf({ bones: ['torso'] }));
    command.apply(doc);

    const names = file.bones.map((bone) => bone.name);
    expect(names).not.toContain('torso');
    expect(names).not.toContain('hair');
    expect(names).toContain('leg');
    expect(file.slots!.some((slot) => slot.name === 'hair')).toBe(false);
    expect(file.constraints!.some((c) => c.name === 'hair_physics')).toBe(false);

    command.revert(doc);
    expect(file.bones.map((bone) => bone.name)).toEqual(example().bones.map((bone) => bone.name));
    expect(file.slots!.length).toBe(example().slots!.length);
  });

  it('nunca apaga o osso raiz', () => {
    const file = example();
    const doc = fakeDoc(file);
    new DeleteItems(selectionOf({ bones: ['root'] })).apply(doc);
    expect(file.bones[0]!.name).toBe('root');
  });

  // E11: com só a raiz escolhida o comando rodava, sujava o arquivo e entrava
  // na pilha de desfazer sem apagar nada. O botão agora nasce desligado.
  it('sabe dizer quando não há nada para apagar, para o botão ficar desligado', () => {
    const file = example();
    expect(canDeleteSelection(file, emptySelection())).toBe(false);
    expect(canDeleteSelection(file, selectionOf({ bones: ['root'] }))).toBe(false);
    expect(canDeleteSelection(file, selectionOf({ bones: ['root', 'torso'] }))).toBe(true);
    expect(canDeleteSelection(file, selectionOf({ bones: ['torso'] }))).toBe(true);
    expect(canDeleteSelection(file, selectionOf({ slots: ['hair'] }))).toBe(true);
    expect(canDeleteSelection(file, selectionOf({ constraints: ['head_lean'] }))).toBe(true);
  });

  // O que a checagem evita, medido no documento: 18 ossos antes, 18 depois.
  it('apagar só a raiz não muda uma vírgula do arquivo', () => {
    const file = example();
    const doc = fakeDoc(file);
    const antes = JSON.stringify(file);
    new DeleteItems(selectionOf({ bones: ['root'] })).apply(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------

describe('renomear', () => {
  it('leva junto todas as referências a um osso', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new RenameItem(file, { kind: 'bone', from: 'torso' }, 'tronco');
    expect(command.to).toBe('tronco');
    command.apply(doc);

    expect(file.bones.some((bone) => bone.name === 'tronco')).toBe(true);
    expect(file.bones.find((bone) => bone.name === 'head')!.parent).toBe('tronco');
    expect(file.slots!.some((slot) => slot.bone === 'torso')).toBe(false);
    const lean = file.constraints!.find((c) => c.name === 'head_lean')!;
    expect(JSON.stringify(lean)).not.toContain('"torso"');
    const keyed = file.animations![0]!.timelines!
      .filter((t) => t.type === 'bone' && t.target === 'tronco');
    expect(keyed.length).toBeGreaterThan(0);

    command.revert(doc);
    expect(JSON.parse(JSON.stringify(file))).toEqual(example());
  });

  it('leva junto as referências a um slot, inclusive a chave da pele', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new RenameItem(file, { kind: 'slot', from: 'cape_path' }, 'caminho_capa');
    command.apply(doc);

    expect(Object.keys(file.skins![0]!.attachments!)).toContain('caminho_capa');
    const path = file.constraints!.find((c) => c.name === 'cape_follow')!;
    expect((path as { target: string }).target).toBe('caminho_capa');

    command.revert(doc);
    expect(JSON.parse(JSON.stringify(file))).toEqual(example());
  });

  it('renomeia um anexo dentro do slot dele', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new RenameItem(file, { kind: 'attachment', slot: 'head', from: 'face' }, 'rosto');
    command.apply(doc);
    expect(Object.keys(file.skins![0]!.attachments!['head']!)).toContain('rosto');
    command.revert(doc);
    expect(JSON.parse(JSON.stringify(file))).toEqual(example());
  });

  it('não deixa dois nomes iguais', () => {
    const file = example();
    const command = new RenameItem(file, { kind: 'bone', from: 'head' }, 'hips');
    expect(command.to).not.toBe('hips');
    expect(command.to).toBe('hips2');
  });
});

// ---------------------------------------------------------------------------

describe('propriedades', () => {
  it('sem seleção mostra o esqueleto', () => {
    const model = buildProperties(example(), emptySelection());
    expect(model.subject).toBe('skeleton');
    expect(model.title).toBe('Base');
    expect(allFields(model.groups).get('fps')!.pointer).toBe('/skeleton/fps');
  });

  it('com vários itens pede que se escolha um só', () => {
    const model = buildProperties(example(), selectionOf({ bones: ['hips', 'torso'] }));
    expect(model.subject).toBe('many');
    expect(model.message).toBeDefined();
    expect(model.groups).toHaveLength(0);
  });

  it('mostra os campos do osso com o ponteiro certo', () => {
    const file = example();
    const model = buildProperties(file, selectionOf({ bones: ['hips'] }));
    expect(model.subject).toBe('bone');
    const fields = allFields(model.groups);
    const index = file.bones.findIndex((bone) => bone.name === 'hips');
    expect(fields.get('x')!.pointer).toBe(`/bones/${index}/x`);
    expect(fields.get('rotation')!.label).toBe('Rotação');
    expect(fields.get('name')!.renameOf).toBe('bone');
    for (const key of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearX', 'shearY', 'length',
      'inheritRotation', 'inheritScale', 'inheritReflection']) {
      expect(fields.has(key)).toBe(true);
    }
  });

  it('usa o padrão do formato quando o campo não está escrito', () => {
    const file = example();
    const model = buildProperties(file, selectionOf({ bones: ['hips'] }));
    const scaleX = allFields(model.groups).get('scaleX')!;
    expect(fieldValue(file, scaleX)).toBe(1);
    setAtPointer(file, scaleX.pointer, 2);
    expect(fieldValue(file, scaleX)).toBe(2);
  });

  it('mostra os campos do slot, com cor e mistura', () => {
    const file = example();
    const model = buildProperties(file, selectionOf({ slots: ['body'] }));
    expect(model.subject).toBe('slot');
    const fields = allFields(model.groups);
    const index = file.slots!.findIndex((slot) => slot.name === 'body');
    expect(fields.get('bone')!.pointer).toBe(`/slots/${index}/bone`);
    expect(fields.get('color')!.kind).toBe('color');
    expect(fields.get('darkColor')!.kind).toBe('color3');
    expect(fields.get('blend')!.options!.map((o) => o.value))
      .toEqual(['normal', 'additive', 'multiply', 'screen']);
    expect(fields.get('visible')!.kind).toBe('checkbox');
  });

  it('mostra os campos de um anexo region, apontando para dentro da pele', () => {
    const file = example();
    const model = buildProperties(file, selectionOf({
      attachments: [{ slot: 'body', attachment: 'body' }],
    }));
    expect(model.subject).toBe('attachment');
    const fields = allFields(model.groups);
    expect(fields.get('x')!.pointer).toBe('/skins/0/attachments/body/body/x');
    expect(fields.get('path')!.pointer).toBe('/skins/0/attachments/body/body/path');
    for (const key of ['name', 'path', 'x', 'y', 'rotation', 'scaleX', 'scaleY', 'width', 'height', 'color']) {
      expect(fields.has(key)).toBe(true);
    }
    expect(fields.get('name')!.renameOf).toBe('attachment');
    expect(fields.get('name')!.renameScope).toEqual({ slot: 'body', skin: 'default' });
  });

  it('num mesh mostra tamanho e cor, sem posição', () => {
    const file = example();
    const model = buildProperties(file, selectionOf({
      attachments: [{ slot: 'head', attachment: 'face' }],
    }));
    const fields = allFields(model.groups);
    expect(fields.has('width')).toBe(true);
    expect(fields.has('color')).toBe(true);
    expect(fields.has('x')).toBe(false);
    expect(findAttachment(file, 'head', 'face')!.def.type).toBe('mesh');
  });

  it('cobre os campos de cada tipo de regra', () => {
    const file = example();
    const ik = allFields(constraintFields(file, 'ik_arm'));
    expect(ik.get('softness')!.kind).toBe('number');
    expect(ik.get('bendPositive')!.kind).toBe('checkbox');
    expect(ik.get('mix')!.fallback).toBe(1);

    const transform = allFields(constraintFields(file, 'head_lean'));
    for (const key of ['offsetRotation', 'offsetX', 'offsetY', 'offsetScaleX', 'offsetScaleY',
      'offsetShearY', 'mixRotation', 'mixX', 'mixY', 'mixScaleX', 'mixScaleY', 'mixShearY']) {
      expect(transform.has(key)).toBe(true);
    }

    const path = allFields(constraintFields(file, 'cape_follow'));
    expect(path.get('target')!.options!.map((o) => o.value)).toContain('cape_path');
    expect(path.get('rotateMode')!.options!.map((o) => o.value))
      .toEqual(['tangent', 'chain', 'chainScale']);

    const physics = allFields(constraintFields(file, 'hair_physics'));
    for (const key of ['inertia', 'strength', 'damping', 'mass', 'wind', 'gravity', 'limit', 'fps']) {
      expect(physics.has(key)).toBe(true);
    }

    // Porta D3 (degrau 12): o parâmetro era um campo de TEXTO — errar uma
    // letra dava uma regra que o runtime ignora, calada. Virou a lista do que
    // existe. E o `mode` da constraint é do **modo contínuo** (§8.2): no modo
    // alvos quem tem modo é cada alvo, e um campo que não mexe em nada saiu
    // da tela em vez de ficar de enfeite.
    const driver = allFields(constraintFields(file, 'look_driver'));
    expect(driver.get('parameter')!.kind).toBe('select');
    expect(driver.get('parameter')!.options!.map((o) => o.value)).toEqual(['lookX']);
    expect(driver.get('alvo0-modo')!.options!.map((o) => o.value)).toEqual(['replace', 'add']);
  });

  it('todo ponteiro de campo aponta para um lugar que existe', () => {
    const file = example();
    const models = [
      buildProperties(file, selectionOf({ bones: ['hips'] })),
      buildProperties(file, selectionOf({ slots: ['body'] })),
      buildProperties(file, selectionOf({ constraints: ['ik_arm'] })),
      buildProperties(file, selectionOf({ attachments: [{ slot: 'body', attachment: 'body' }] })),
    ];
    for (const model of models) {
      for (const field of allFields(model.groups).values()) {
        if (field.pointer === '') continue;
        const parent = field.pointer.slice(0, field.pointer.lastIndexOf('/'));
        expect(getAtPointer(file, parent)).toBeTypeOf('object');
      }
    }
  });
});

// ---------------------------------------------------------------------------

describe('comando SetProperty', () => {
  it('escreve e desfaz um campo que não existia', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new SetProperty('/bones/1/shearX', 15, 'Mudar Inclinação X');
    command.apply(doc);
    expect(getAtPointer(file, '/bones/1/shearX')).toBe(15);
    command.revert(doc);
    expect(hasAtPointer(file, '/bones/1/shearX')).toBe(false);
  });

  it('devolve o valor antigo de um campo que já existia', () => {
    const file = example();
    const doc = fakeDoc(file);
    const before = getAtPointer(file, '/bones/1/y');
    const command = new SetProperty('/bones/1/y', 999, 'Mudar Posição Y');
    command.apply(doc);
    expect(getAtPointer(file, '/bones/1/y')).toBe(999);
    command.revert(doc);
    expect(getAtPointer(file, '/bones/1/y')).toBe(before);
  });

  it('junta arrastos seguidos no mesmo campo num só desfazer', () => {
    const file = example();
    const doc = fakeDoc(file);
    const before = getAtPointer(file, '/bones/1/y');
    const first = new SetProperty('/bones/1/y', 10, 'a');
    first.apply(doc);
    const second = new SetProperty('/bones/1/y', 20, 'a');
    expect(second.mergeWith(first)).toBe(true);
    second.apply(doc);
    second.revert(doc);
    expect(getAtPointer(file, '/bones/1/y')).toBe(before);
  });

  it('não junta campos diferentes', () => {
    const a = new SetProperty('/bones/1/y', 1, 'a');
    const b = new SetProperty('/bones/1/x', 2, 'b');
    expect(b.mergeWith(a)).toBe(false);
  });

  it('desfaz também os contêineres que precisou criar', () => {
    const file = { bone: { version: '1', minVersion: '1', generator: 't' }, bones: [] } as unknown as BoneFile;
    const doc = fakeDoc(file);
    const command = new SetProperty('/skeleton/fps', 24, 'Mudar fps');
    command.apply(doc);
    expect(getAtPointer(file, '/skeleton/fps')).toBe(24);
    command.revert(doc);
    expect(getAtPointer(file, '/skeleton')).toBeUndefined();
  });

  it('o campo produz o comando com o rótulo em português', () => {
    const file = example();
    const field = allFields(buildProperties(file, selectionOf({ bones: ['hips'] })).groups).get('x')!;
    const command = setFieldCommand(field, 5);
    expect(command.label).toBe('Mudar Posição X');
    expect(command.pointer).toBe(field.pointer);
  });
});

// ---------------------------------------------------------------------------

describe('animações', () => {
  it('lista as animações do arquivo', () => {
    const rows = listAnimations(example());
    expect(rows.map((row) => row.name)).toEqual(['idle', 'walk', 'attack']);
    expect(rows[0]!.duration).toBe(2);
    expect(rows[0]!.timelines).toBeGreaterThan(0);
  });

  it('quando a duração não está escrita, usa a última chave', () => {
    expect(animationDuration({ name: 'x', timelines: [
      { type: 'bone', target: 'a', property: 'x', keys: [{ time: 0 }, { time: 1.5 }] },
    ] })).toBe(1.5);
    expect(animationDuration({ name: 'x' })).toBe(0);
  });

  it('acha uma animação pelo nome', () => {
    const file = example();
    expect(findAnimation(file, 'walk')?.name).toBe('walk');
    expect(findAnimation(file, 'não existe')).toBeNull();
    expect(findAnimation(file, null)).toBeNull();
  });

  it('mostra e lê o tempo com vírgula', () => {
    expect(formatTime(1.5)).toBe('1,50 s');
    expect(parseTime('1,5')).toBe(1.5);
    expect(parseTime('1,50 s')).toBe(1.5);
    expect(parseTime('3/2')).toBe(1.5);
    expect(parseTime('abc')).toBeNull();
    expect(parseTime('-3')).toBe(0);
  });

  it('mantém o tempo dentro da animação', () => {
    expect(clampTime(2.5, 2, true)).toBeCloseTo(0.5);
    expect(clampTime(2.5, 2, false)).toBe(2);
    expect(clampTime(-1, 2, false)).toBe(0);
    expect(clampTime(1, 0, true)).toBe(0);
  });

  it('converte tempo e barra de progresso nos dois sentidos', () => {
    expect(progressOf(1, 2)).toBe(0.5);
    expect(progressOf(5, 2)).toBe(1);
    expect(progressOf(1, 0)).toBe(0);
    expect(timeAt(0.5, 2)).toBe(1);
    expect(timeAt(2, 2)).toBe(2);
  });

  it('cria, duplica e apaga, e desfaz cada um', () => {
    const file = example();
    const doc = fakeDoc(file);

    const add = new AddAnimation(file);
    add.apply(doc);
    expect(file.animations!.some((a) => a.name === add.name)).toBe(true);
    add.revert(doc);
    expect(file.animations!.some((a) => a.name === add.name)).toBe(false);

    const copy = new DuplicateAnimation(file, 'walk');
    copy.apply(doc);
    const made = file.animations!.find((a) => a.name === copy.name)!;
    expect(made.timelines!.length).toBe(findAnimation(file, 'walk')!.timelines!.length);
    copy.revert(doc);

    const remove = new DeleteAnimation('walk');
    remove.apply(doc);
    expect(file.animations!.map((a) => a.name)).toEqual(['idle', 'attack']);
    remove.revert(doc);
    expect(file.animations!.map((a) => a.name)).toEqual(['idle', 'walk', 'attack']);
  });

  it('renomear a animação também move quem aponta para ela', () => {
    const file = example();
    const doc = fakeDoc(file);
    const command = new RenameItem(file, { kind: 'animation', from: 'idle' }, 'parado');
    command.apply(doc);
    expect(file.animations!.map((a) => a.name)).toContain('parado');
    command.revert(doc);
    expect(JSON.parse(JSON.stringify(file))).toEqual(example());
  });
});


// ---------------------------------------------------------------------------
// E1: criar regra, evento, pele e parâmetro pelo editor
// ---------------------------------------------------------------------------

describe('criar regra, evento, pele e parâmetro', () => {
  it('os cinco tipos de regra têm um comando', () => {
    expect([...CONSTRAINT_TYPES]).toEqual(['ik', 'transform', 'path', 'physics', 'driver']);
  });

  // O buraco que isto fecha: `constraints.push` não existia em lugar nenhum do
  // editor, então um personagem novo nunca ganhava IK nem física.
  it('cada tipo nasce ligado em ossos que existem, e desfazer não deixa rastro', () => {
    for (const type of CONSTRAINT_TYPES) {
      const file = example();
      const doc = fakeDoc(file);
      const antes = JSON.stringify(file);
      const nomes = file.bones.map((b) => b.name);

      const command = new AddConstraint(file, type, ['torso']);
      command.apply(doc);

      const criada = file.constraints!.find((c) => c.name === command.name)!;
      expect(criada).toBeDefined();
      expect(criada.type).toBe(type);
      expect(criada.mix).toBe(1);
      if ('bones' in criada) {
        expect(criada.bones).toEqual(['torso']);
        expect(nomes).toContain(criada.target);
        // O alvo nunca é um osso da própria cadeia.
        expect(criada.bones).not.toContain(criada.target);
      }
      if (criada.type === 'physics') expect(criada.bone).toBe('torso');

      command.revert(doc);
      expect(JSON.stringify(file)).toBe(antes);
    }
  });

  it('sem nada escolhido a regra cai no primeiro osso do arquivo', () => {
    const file = example();
    const command = new AddConstraint(file, 'ik', []);
    command.apply(fakeDoc(file));
    const criada = file.constraints!.find((c) => c.name === command.name)!;
    expect('bones' in criada && criada.bones).toEqual([file.bones[0]!.name]);
  });

  it('o nome da regra nova nunca repete o de uma que já existe', () => {
    const file = example();
    const doc = fakeDoc(file);
    const a = new AddConstraint(file, 'ik', []);
    a.apply(doc);
    const b = new AddConstraint(file, 'ik', []);
    b.apply(doc);
    expect(b.name).not.toBe(a.name);
    expect(file.constraints!.filter((c) => c.name === a.name)).toHaveLength(1);
  });

  it('evento, pele e parâmetro também nascem e desfazem sem rastro', () => {
    const file = example();
    const doc = fakeDoc(file);
    const antes = JSON.stringify(file);

    const evento = new AddEvent(file);
    const pele = new AddSkin(file);
    const parametro = new AddParameter(file);
    for (const c of [evento, pele, parametro]) c.apply(doc);

    expect(file.events!.some((e) => e.name === evento.name)).toBe(true);
    expect(file.skins!.some((s) => s.name === pele.name)).toBe(true);
    const p = file.parameters!.find((x) => x.name === parametro.name)!;
    expect(p).toEqual({ name: parametro.name, min: -1, max: 1, default: 0 });

    for (const c of [parametro, pele, evento]) c.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });
});
});

// ---------------------------------------------------------------------------
// escondido e escondido (lote 38) — era `lote38-escondido-e-escondido.test.ts`
// ---------------------------------------------------------------------------

describe('escondido e escondido (lote 38)', () => {
/**
 * Lote 38 — anotação 27: escondido é escondido.
 *
 * A mesma família de defeito voltou **cinco vezes**, sempre do mesmo jeito:
 * `[hidden] { display: none }` é regra da folha do NAVEGADOR, e qualquer regra
 * de autor com `display` passa por cima dela. O elemento fica marcado como
 * escondido no código, continua desenhado na tela, e continua recebendo
 * clique.
 *
 * | Lote | O que ficou desenhado por cima |
 * |:---:|:---|
 * | 14 | o menu do ⋯ Mais, em cima da cena |
 * | 16 | a barra da faixa de baixo |
 * | 19 | três listas de painel |
 * | 30 | as cinco ferramentas de estrutura, em Animando |
 * | 37 | a caixa de boas-vindas, com o personagem carregado |
 *
 * Cada vez custou um lote para achar, e o conserto era sempre local — o que
 * garante que a próxima folha nova traga o defeito de volta. Este teste fecha
 * a família: uma regra global com `!important`, e nenhum `display` de autor num
 * seletor `[hidden]` em folha nenhuma.
 */
const RAIZ = resolve(__dirname, '..', 'src');

function folhas(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) folhas(full, out);
    else if (entry.endsWith('.css')) out.push(full);
  }
  return out;
}

/** Os blocos de uma folha, como `{ seletor, corpo }`. Sem comentários. */
function blocos(css: string): Array<{ seletor: string; corpo: string }> {
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const saida: Array<{ seletor: string; corpo: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let achado: RegExpExecArray | null = re.exec(semComentario);
  while (achado !== null) {
    saida.push({ seletor: achado[1]!.trim(), corpo: achado[2]! });
    achado = re.exec(semComentario);
  }
  return saida;
}

describe('escondido é escondido', () => {
  it('a regra global existe, com `!important`, no `shell.css`', () => {
    const css = readFileSync(resolve(RAIZ, 'ui', 'shell.css'), 'utf8');
    expect(css).toMatch(/\[hidden\]\s*\{\s*display:\s*none\s*!important\s*;?\s*\}/);
  });

  it('nenhuma folha do editor declara `display` diferente de `none` num `[hidden]`', () => {
    const erradas: string[] = [];
    for (const arquivo of folhas(RAIZ)) {
      const css = readFileSync(arquivo, 'utf8');
      for (const bloco of blocos(css)) {
        if (!bloco.seletor.includes('[hidden]')) continue;
        const display = /(^|[;\s])display\s*:\s*([^;]+)/i.exec(bloco.corpo);
        if (display === null) continue;
        const valor = display[2]!.trim().toLowerCase().replace(/\s*!important$/, '');
        if (valor === 'none') continue;
        erradas.push(`${arquivo.slice(RAIZ.length + 1)}: ${bloco.seletor} → display: ${valor}`);
      }
    }
    expect(erradas).toEqual([]);
  });

  it('os consertos locais saíram: a regra é UMA', () => {
    const comRegra: string[] = [];
    for (const arquivo of folhas(RAIZ)) {
      const css = readFileSync(arquivo, 'utf8');
      for (const bloco of blocos(css)) {
        if (!bloco.seletor.includes('[hidden]')) continue;
        if (!/display\s*:/i.test(bloco.corpo)) continue;
        comRegra.push(arquivo.slice(RAIZ.length + 1));
      }
    }
    // Uma folha, uma regra: a do `shell.css`. Qualquer outra é conserto local
    // voltando, e conserto local é o que deixou a família nascer cinco vezes.
    expect([...new Set(comRegra)]).toEqual([`ui${sep}shell.css`]);
    expect(comRegra.length).toBe(1);
  });

  it('a regra chega ao PROGRAMA MONTADO, e não só ao código', () => {
    // Uma regra que existe na fonte e não chega ao `programa/` não esconde
    // nada: é lá que o Humberto abre o editor.
    const assets = resolve(__dirname, '..', '..', 'programa', 'assets');
    const marca = /\[hidden\]\s*\{\s*display:\s*none\s*!important/;
    let achou = false;
    for (const arquivo of readdirSync(assets)) {
      if (!arquivo.endsWith('.css')) continue;
      if (marca.test(readFileSync(join(assets, arquivo), 'utf8'))) achou = true;
    }
    expect(achou, 'programa/assets/*.css').toBe(true);
  });
});
});

// ---------------------------------------------------------------------------
// altura dos paineis (lote 52) — era `lote52-altura-dos-paineis.test.ts`
// ---------------------------------------------------------------------------

describe('altura dos paineis (lote 52)', () => {
/**
 * Lote 52 — a altura dos painéis da coluna, arrastável e guardada.
 * Plano: `documentos/planos/PLANO rodada 5 - acabamento 2026-09-10.md`.
 *
 * A alça entre os dois grupos de cada coluna já existia (item 19). Este lote
 * completa o que o plano pede dela: o mínimo em pixels, os dois cliques que
 * devolvem o padrão, e a divisão guardada no navegador, que sobrevive a
 * recarregar e a abrir outro arquivo. A tela é DOM (regra 8); aqui fica a conta.
 */
const KNOWN = ['arvore', 'ordem', 'propriedades', 'imagens', 'exibicao', 'previa', 'animacoes', 'peles'];

describe('arrastar a alça', () => {
  it('tira de um grupo e dá ao outro', () => {
    // 600 px, meio a meio: +60 px leva o de cima a 360 px = 0,6.
    expect(resizeSplit(0.5, 60, 600)).toBeCloseTo(0.6, 9);
    expect(resizeSplit(0.5, -60, 600)).toBeCloseTo(0.4, 9);
  });

  it('nenhum grupo fica com menos de 80 px, e os limites de sempre valem', () => {
    expect(GROUP_MIN_PX).toBe(80);
    // Coluna de 400 px: o de baixo precisa de 80, então o de cima vai até 320 = 0,8.
    expect(resizeSplit(0.5, 500, 400)).toBeCloseTo(0.8, 9);
    expect(resizeSplit(0.5, -500, 400)).toBeCloseTo(0.2, 9);
    // Coluna alta: quem segura é o SPLIT_MAX / SPLIT_MIN.
    expect(resizeSplit(0.5, 5000, 2000)).toBe(SPLIT_MAX);
    expect(resizeSplit(0.5, -5000, 2000)).toBe(SPLIT_MIN);
  });

  it('coluna sem altura não mexe na divisão', () => {
    expect(resizeSplit(0.5, 60, 0)).toBe(0.5);
  });

  it('pronto quando: dá para dar 60% da coluna à Árvore', () => {
    const layout = defaultLayout(KNOWN);
    const room = 700;
    const dy = 0.6 * room - layout.left.split * room;
    expect(resizeSplit(layout.left.split, dy, room)).toBeCloseTo(0.6, 9);
  });
});

describe('dois cliques devolvem o padrão', () => {
  it('cada lado tem o seu', () => {
    expect(defaultSplit('left')).toBe(LEFT_SPLIT);
    expect(defaultSplit('right')).toBe(DEFAULT_SPLIT);
  });
});

describe('guardada no navegador', () => {
  it('ida e volta, e as do navegador ganham das do arquivo', () => {
    // 13/09/2026: o que se guarda deixou de ser o número solto e passou a ser
    // `{ split, auto }` — sem o `auto`, o número de fábrica voltaria mandando
    // e a divisão automática nunca valeria da segunda vez que o editor abrisse.
    const layout = defaultLayout(KNOWN);
    const mudada = withSavedSplits(layout, { left: { split: 0.6, auto: false } });
    expect(mudada.left.split).toBe(0.6);
    expect(mudada.left.autoSplit).toBe(false);
    expect(mudada.right.split).toBe(layout.right.split);
    const texto = splitsToSave(mudada);
    expect(parseSavedSplits(texto)).toEqual({
      left: { split: 0.6, auto: false },
      right: { split: layout.right.split, auto: true },
    });
    // Recarregar: a bancada do arquivo nasce de fábrica, e o navegador devolve os 60%.
    expect(withSavedSplits(defaultLayout(KNOWN), parseSavedSplits(texto)).left.split).toBe(0.6);
  });

  it('o lado que nunca foi arrastado volta automático', () => {
    const texto = splitsToSave(defaultLayout(KNOWN));
    const volta = withSavedSplits(defaultLayout(KNOWN), parseSavedSplits(texto));
    expect(volta.left.autoSplit).toBe(true);
    expect(volta.right.autoSplit).toBe(true);
  });

  it('o número solto, de antes do `auto`, vale como mão', () => {
    // Um navegador guardado antes de 13/09/2026 só gravava depois de um
    // arrasto: aquele número É uma escolha, e continua mandando.
    expect(parseSavedSplits('{"left": 0.6}')).toEqual({ left: { split: 0.6, auto: false } });
  });

  it('lixo, nada guardado, ou número fora da faixa', () => {
    expect(parseSavedSplits(null)).toEqual({});
    expect(parseSavedSplits('{quebrado')).toEqual({});
    expect(parseSavedSplits('"texto"')).toEqual({});
    expect(parseSavedSplits('{"left": 5, "right": "x"}')).toEqual({ left: { split: SPLIT_MAX, auto: false } });
  });
});
});

// ---------------------------------------------------------------------------
// paineis que cabem (lote 65) — era `lote65-paineis-que-cabem.test.ts`
// ---------------------------------------------------------------------------

describe('paineis que cabem (lote 65)', () => {
/**
 * Lote 65 — painéis que cabem.
 *
 * Sem DOM. O Humberto, 11/09/2026, com a foto da aba Malha e pesos: *"esses
 * menus estão impossíveis de usar"*. Regra: nenhum painel é mais largo que a
 * coluna, e nunca há rolagem de lado. A medição de verdade (as abas, nos dois
 * tamanhos) é do `medir-paineis.mjs`, num Chrome sem janela; o resultado está
 * nos Desvios do plano. Aqui ficam as contas puras e as regras escritas.
 */
const SRC = resolve(__dirname, '../src');
const ler = (caminho: string): string => readFileSync(resolve(SRC, caminho), 'utf8').replace(/\r\n/g, '\n');

describe('a aba Malha e pesos começa pelo de todo dia', () => {
  it('a ordem: desenho, forma, ossos, pesos, pincel, e a malha ligada no fim, dobrada', () => {
    const secoes = meshPanelSections();
    expect(secoes.map((s) => s.id)).toEqual(['desenho', 'forma', 'ossos', 'pesos', 'pincel', 'ligada']);
    expect(secoes.find((s) => s.id === 'ligada')!.collapsed).toBe(true);
    // 13/09/2026: a aba não cabia na altura (961 px de sobra em 1440×900,
    // com o painel cheio) mesmo depois do lote dos nomes. O Pincel — 270 px
    // sozinho — é ajuste fino: dobra por padrão, e abre sozinho com a
    // ferramenta Pesos na mão. "A malha" (Forma) e "os pesos" (Ossos que
    // influenciam, Pesos) continuam abertos — é o que se usa a toda hora.
    expect(secoes.find((s) => s.id === 'pincel')!.collapsed).toBe(true);
    expect(secoes.filter((s) => s.collapsed).map((s) => s.id)).toEqual(['pincel', 'ligada']);
  });

  it('o painel desenha nessa ordem; a malha ligada é um <details> fechado, com a frase curta', () => {
    const painel = ler('panels/mesh-panel.ts');
    expect(painel).toContain('for (const secao of meshPanelSections())');
    expect(painel).toContain("el('details', 'malha-secao malha-avancado')");
    expect(painel).toContain("'Avançado: malha ligada'");
    // A frase "Empresta a forma..." saiu do corpo — repetia a dica do
    // título, palavra por palavra (pedido do Humberto, 13/09/2026: "isto é
    // um botão, ou é explicação? Se for explicação, sai do painel e vira
    // dica"). A explicação inteira mora agora só na dica do título.
    expect(painel).toContain('empresta a forma de outra malha do mesmo slot e troca só a imagem');
    // O Virar malha mora na seção Forma.
    expect(painel).toContain('private buildRegionShape(doc: EditorDoc)');
    // O Pincel também é um <details>, dobrado por padrão — mesma marca da
    // malha ligada, mas sem abrir sozinho para sempre: com a ferramenta
    // Pesos na mão ele já nasce aberto.
    // Rodada 17, L5: ganhou a classe que o traz ao alto quando aberto pela mão.
    expect(painel).toContain("const section = el('details', 'malha-secao malha-secao-pincel') as HTMLDetailsElement;");
    expect(painel).toContain("pincelOpen ?? getActiveToolId() === 'weights'");
  });
});

describe('nome comprido corta, e o inteiro vai para a dica', () => {
  it('labelFor com 40 letras: corta com reticências; a dica tem o nome inteiro', () => {
    const nome = 'Forma de outra malha do mesmo slot aqui!';
    expect(nome).toHaveLength(40);
    const r = labelFor(nome);
    expect(r.text).toHaveLength(LABEL_MAX);
    expect(r.text.endsWith('…')).toBe(true);
    expect(r.title).toBe(nome);
  });

  it('nome que cabe fica inteiro', () => {
    expect(labelFor('01 (1)')).toEqual({ text: '01 (1)', title: '01 (1)' });
    expect(labelFor('abcdef', 4)).toEqual({ text: 'abc…', title: 'abcdef' });
  });
});

describe('as regras de CSS do plano, dentro das colunas', () => {
  it('panels.css: min-width 0, sem rolagem de lado, texto que quebra, campo e botão até 100%, botões que quebram', () => {
    const css = ler('panels/panels.css');
    const bloco = css.slice(css.indexOf('Lote 65 — painéis que cabem'));
    expect(bloco).toContain('min-width: 0;');
    expect(bloco).toContain('overflow-x: hidden;');
    expect(bloco).toContain('overflow-wrap: anywhere;');
    expect(bloco).toContain('max-width: 100%;');
    expect(bloco).toContain('flex-wrap: wrap;');
    // Só nas colunas: a linha do tempo, embaixo, rola de lado de propósito.
    expect(bloco).toContain('.panel-column .panel-body');
  });

  it('mesh-panel.css: a linha do pincel quebra e encolhe; o nome do osso corta', () => {
    const css = ler('panels/mesh-panel.css');
    const linha = css.slice(css.indexOf('.malha-linha {'), css.indexOf('.malha-rotulo {'));
    expect(linha).toContain('flex-wrap: wrap;');
    const regua = css.slice(css.indexOf('.malha-campo input[type="range"]'));
    expect(regua.slice(0, regua.indexOf('}'))).toContain('min-width: 0;');
    const nome = css.slice(css.indexOf('.malha-osso-nome {'));
    expect(nome.slice(0, nome.indexOf('}'))).toContain('text-overflow: ellipsis;');
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 4b (17/09/2026): as Propriedades leem o corpo do instante (9.13, M12)
// ---------------------------------------------------------------------------

import { parseBoneText } from '../../runtime/src/index.js';
import { Projeto, emptyManifest, readProjectLists, writeProjectLists } from '../src/doc/projeto.js';
import { Doc } from '../src/doc/document.js';
import { createEmptyFile } from '../src/doc/new-file.js';
import { corpoDe } from '../src/contract.js';
import { currentValueOf } from '../src/anim/pose-mode.js';
import { boneTarget } from '../src/anim/keying.js';
import { writeFieldValue } from '../src/panels/properties-model.js';

describe('as Propriedades são as do corpo do instante', () => {
  const C290 = resolve(__dirname, '../../conformidade/casos/C-290-virada-corte-seco');
  const lerCorpo = (nome: string): BoneFile => parseBoneText(readFileSync(resolve(C290, nome), 'utf8')) as BoneFile;

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

  it('em 0,75 o rabo tem ficha, com o ponteiro dentro do arquivo do lobisomem', () => {
    const doc = projeto();
    doc.time = 0.75;
    const model = buildProperties(corpoDe(doc).file, { ...emptySelection(), bones: ['rabo'] });
    expect(model.title).toContain('rabo');
    expect(model.message).toBeUndefined();
    const campos = model.groups.flatMap((g) => g.fields);
    expect(campos.some((f) => f.pointer === '/bones/2/rotation')).toBe(true);
    // No homem, o rabo não existe: nenhum campo aponta para um osso que não está lá.
    doc.time = 0.25;
    const noHomem = buildProperties(corpoDe(doc).file, { ...emptySelection(), bones: ['rabo'] });
    expect(noHomem.groups.flatMap((g) => g.fields).some((f) => f.pointer === '/bones/2/rotation')).toBe(false);
  });

  it('o valor de base que o campo mostra é o do corpo do instante: o tronco do lobisomem está em y 120', () => {
    const doc = projeto();
    doc.time = 0.25;
    expect(currentValueOf(doc, boneTarget('tronco', 'y'))).toBe(100);
    doc.time = 0.75;
    expect(currentValueOf(doc, boneTarget('tronco', 'y'))).toBe(120);
    // A linha `tronco/x` é da animação do homem, e vale nos dois corpos.
    expect(currentValueOf(doc, boneTarget('tronco', 'x'))).toBe(30);
  });

  it('um campo sem timeline (o comprimento) escrito em 0,75 vai para a base do lobisomem', () => {
    const doc = projeto();
    doc.time = 0.75;
    const lobo = corpoDe(doc);
    const antesHomem = JSON.stringify(doc.file);
    const campo = buildProperties(lobo.file, { ...emptySelection(), bones: ['rabo'] })
      .groups.flatMap((g) => g.fields).find((f) => f.pointer === '/bones/2/length')!;
    expect(writeFieldValue(doc, campo, 40)).toBe(null);
    expect((lobo.file.bones ?? [])[2]?.length).toBe(40);
    expect(JSON.stringify(doc.file)).toBe(antesHomem);
    doc.undo();
    expect((lobo.file.bones ?? [])[2]?.length).toBe(25);
  });

  it('um campo animável escrito em 0,75 vira chave na animação do homem, e o lobisomem não muda', () => {
    const doc = projeto();
    doc.time = 0.75;
    const lobo = corpoDe(doc);
    const antesLobo = JSON.stringify(lobo.file);
    const campo = buildProperties(lobo.file, { ...emptySelection(), bones: ['rabo'] })
      .groups.flatMap((g) => g.fields).find((f) => f.pointer === '/bones/2/rotation')!;
    expect(writeFieldValue(doc, campo, 90)).toBe(null);
    expect(JSON.stringify(lobo.file)).toBe(antesLobo);
    expect(currentValueOf(doc, boneTarget('rabo', 'rotation'))).toBe(90);
    expect(doc.skeleton?.findBone('rabo')?.rotation).toBe(90);
  });
});

// ---------------------------------------------------------------------------
// A medição mede painel CHEIO — A10, degrau 11, lote 8 (18/09/2026)
// ---------------------------------------------------------------------------

describe('a prova da medição não mede painel vazio (A10)', () => {
  const prova = readFileSync(resolve(__dirname, '../../ferramentas/provas/medir-paineis.mjs'), 'utf8');

  it('ela sabe dizer que um painel está vazio, e diz o motivo', () => {
    expect(prova).toContain('m.vazio =');
    expect(prova).toContain('no lugar do conteúdo');
    expect(prova).toContain('Nenhuma pasta aberta');
  });

  it('painel vazio NÃO conta como medido: o número honesto cai', () => {
    expect(prova).toContain('não medido');
    expect(prova).toContain('NÃO FEITAS, porque o painel estava vazio');
    expect(prova).toContain('medir isso é o falso verde');
  });

  it('a frase só conta quando está NO LUGAR do conteúdo', () => {
    // A aba Imagens diz "Nenhuma pasta aberta" na linha da pasta e mostra a
    // grade cheia logo abaixo: ali a frase é recado, não painel vazio.
    expect(prova).toContain('const MINIMO = 160;');
    expect(prova).toContain('painel.scrollHeight < MINIMO');
  });

  it('a prova enche o painel antes de medir, e não esvazia um para encher outro', () => {
    expect(prova).toContain('const PREENCHER');
    // A pasta é adotada pela troca de pasta de origem: "Abrir pasta…" abriria
    // um projeto novo e levaria o herói junto.
    expect(prova).toContain('imagens-trocar-pasta');
    expect(prova).toContain('const MEXER');
    // Uma animação aberta, a pilha de peles cheia, e passos no histórico.
    expect(prova).toContain('doc.animation = anim.name');
    expect(prova).toContain('doc.pilha = peles');
  });

  it('o painel medido é o DAQUELA aba, e não o primeiro da coluna', () => {
    // O mesmo engano que já tinha posto o conteúdo da Exibição debaixo do nome
    // "Prévia" no `detalhar`.
    expect(prova).toContain("corpo.querySelectorAll('.panel-body')");
    expect(prova).toContain('!c.hidden && c.clientHeight > 0');
  });
});

// ---------------------------------------------------------------------------
// A ficha do emissor de partículas — extensão `BONE_particles`, lote 1
// ---------------------------------------------------------------------------

describe('a ficha do emissor de partículas (BONE_particles), lote 1', () => {
/**
 * A **ficha mínima**: quem é, em que slot está, e a semente.
 *
 * Antes dela, um emissor caía no `identity` do fim de `attachmentFields` —
 * "Nome" e "Imagem" —, e aquele campo "Imagem" é uma mentira num emissor: o
 * `path` dele é a imagem de **cada partícula** (§9.8), não o desenho do anexo.
 * Um campo que parece fazer uma coisa e faz outra é o que a regra 21 da casa
 * proíbe, e está fotografado em `backup/fotos-particulas/lote-1_antes.png`.
 *
 * Os campos da 1ª fase — taxa, vida, velocidade, forma, cor — vêm no lote 3.
 */

/** Um arquivo com um emissor num slot, na pele `default`. */
function comEmissor(extra: Record<string, unknown> = {}): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'fogo', bone: 'root', attachment: 'fogo' }],
    skins: [{
      name: 'default',
      attachments: { fogo: { fogo: { type: 'BONE_particle', seed: 7, ...extra } } },
    }],
    extensionsUsed: ['BONE_particles'],
  } as unknown as BoneFile;
}

/** Os campos de um grupo, pela chave. */
const chaves = (grupos: FieldGroup[], titulo: string): string[] =>
  (grupos.find((g) => g.title === titulo)?.fields ?? []).map((f) => f.key);

  it('tem os grupos da 1ª fase, e o campo "Imagem" do anexo comum NÃO está entre eles', () => {
    const grupos = attachmentFields(comEmissor(), 'fogo', 'fogo');
    // Rodada 15 (reescrito de propósito): o grupo "Onde está" — Osso, X, Y e
    // Giro (§9.10) — entrou, e o "No slot" só de leitura saiu de "O emissor".
    // Rodada 4, consertos (05/10/2026), reescrito de propósito: o primeiro
    // grupo de um emissor se chama "Emissor", e não "Anexo" (conferência da
    // rodada 24, linha A8: o título dizia "Emissor" e a seção, "ANEXO").
    expect(grupos.map((g) => g.title)).toEqual([
      'Emissor', 'Onde está', 'O emissor', 'Quando nasce', 'Vida e teto', 'Para onde vai',
      'De onde sai', 'Forças', 'Giro e tamanho', 'Cor',
      'A imagem de cada partícula', 'A volta e a ordem',
    ]);
    expect(chaves(grupos, 'Onde está')).toEqual(['bone', 'x', 'y', 'rotation']);
    expect(chaves(grupos, 'O emissor')).toEqual(['seed', 'space']);
    // O `path` está, e com OUTRO rótulo: num emissor ele é a imagem de cada
    // partícula (§9.8), não o desenho do anexo — e é por isso que o grupo
    // "Emissor" (era "Anexo") continua sem ele.
    expect(chaves(grupos, 'Emissor')).toEqual(['name']);
    const path = grupos.flatMap((g) => g.fields).find((f) => f.key === 'path')!;
    expect(path.label).toBe('Imagem da partícula');
  });

  it.skipIf(!existsSync(resolve(__dirname, '../../backup')))('o defeito EXISTIA: sem o ramo, a ficha era "Nome" e "Imagem"', () => {
    // A prova de que o teste de cima pega alguma coisa. Um tipo que
    // `attachmentFields` não conhece cai no `identity` do fim — e é ali que o
    // emissor caía. A cópia de antes do lote está no `backup/` e não cita o
    // tipo do emissor.
    const outro = comEmissor();
    (outro.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)
      .fogo!.fogo!['type'] = 'BONE_naoexiste';
    const grupos = attachmentFields(outro, 'fogo', 'fogo');
    // Rodada 43, lote 1: o grupo se chama "Desenho" na tela (era "Anexo").
    expect(grupos.map((g) => g.title)).toEqual(['Desenho']);
    expect(grupos[0]!.fields.map((f) => f.key)).toEqual(['name', 'path']);
    const antes = readFileSync(
      resolve(__dirname, '../../backup/properties-model_2026-09-22_antes-do-lote-1-das-particulas.ts'),
      'utf8',
    );
    expect(antes).not.toContain('PARTICLE_TYPE');
  });

  it('a semente aparece com o número do arquivo, e escreve no lugar certo', () => {
    const file = comEmissor();
    const grupos = attachmentFields(file, 'fogo', 'fogo');
    const seed = grupos.flatMap((g) => g.fields).find((f) => f.key === 'seed')!;
    expect(seed.kind).toBe('number');
    expect(seed.pointer).toBe('/skins/0/attachments/fogo/fogo/seed');
    expect(fieldValue(file, seed)).toBe(7);
    // A faixa da §9.9: inteiro de 0 a 4294967295, e `0` é semente válida.
    expect(seed.min).toBe(0);
    expect(seed.max).toBe(4294967295);
    expect(seed.fallback).toBe(0);
  });

  it('sem semente escrita, a ficha mostra o padrão 0 da §9.9 — nunca vazio', () => {
    const file = comEmissor();
    delete (file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)
      .fogo!.fogo!['seed'];
    const seed = attachmentFields(file, 'fogo', 'fogo')
      .flatMap((g) => g.fields).find((f) => f.key === 'seed')!;
    expect(fieldValue(file, seed)).toBe(0);
  });

  it('escrever a semente na ficha muda o arquivo, e só ela', () => {
    const file = comEmissor();
    const seed = attachmentFields(file, 'fogo', 'fogo')
      .flatMap((g) => g.fields).find((f) => f.key === 'seed')!;
    const cmd = setFieldCommand(seed, 42);
    const doc = { file } as unknown as EditorDoc;
    cmd.apply(doc);
    expect(getAtPointer(file, seed.pointer)).toBe(42);
    cmd.revert(doc);
    expect(getAtPointer(file, seed.pointer)).toBe(7);
  });

  it('rodada 15 (reescrito de propósito): o OSSO se troca na ficha, pelo ponteiro do slot', () => {
    // Era "No slot", só leitura — o Humberto não conseguia prender o emissor a
    // um osso. Agora o campo Osso aponta para `/slots/i/bone`, e o painel o
    // passa pelo `runReparent` (a mesma porta da tecla P): o emissor fica onde está.
    const campos = attachmentFields(comEmissor(), 'fogo', 'fogo').flatMap((g) => g.fields);
    expect(campos.find((f) => f.key === 'slot')).toBeUndefined();
    const osso = campos.find((f) => f.key === 'bone')!;
    expect(osso.pointer).toBe('/slots/0/bone');
    expect(osso.fallback).toBe('root');
    expect(osso.kind).toBe('select');
    // X, Y e Giro no anexo (§9.10), e nada de escala.
    expect(campos.find((f) => f.key === 'x')!.pointer).toBe('/skins/0/attachments/fogo/fogo/x');
    expect(campos.find((f) => f.key === 'rotation')!.pointer).toBe('/skins/0/attachments/fogo/fogo/rotation');
    expect(campos.some((f) => f.key === 'scaleX')).toBe(false);
  });

  it('a linha "a cena ainda não desenha" SAIU, porque a cena passou a desenhar', () => {
    // No lote 1 a ficha dizia, por escrito, que o desenho vinha no lote
    // seguinte — regra 21: onde o programa não faz, ele avisa. No lote 2 a cena
    // passou a desenhar (e descobriu-se que já desenhava). **Uma promessa
    // cumprida que fica na tela vira mentira**, e mentira pior que a falta que
    // ela cobria: quem a lesse desconfiaria do jorro que está vendo.
    const campos = attachmentFields(comEmissor(), 'fogo', 'fogo').flatMap((g) => g.fields);
    expect(campos.find((f) => f.key === 'aviso')).toBeUndefined();
    for (const campo of campos) expect(String(campo.fallback)).not.toContain('não desenha');
  });

  it('o nome do emissor renomeia como anexo, com o slot e a pele certos', () => {
    const nome = attachmentFields(comEmissor(), 'fogo', 'fogo')
      .flatMap((g) => g.fields).find((f) => f.key === 'name')!;
    expect(nome.renameOf).toBe('attachment');
    expect(nome.renameScope).toEqual({ slot: 'fogo', skin: 'default' });
  });

  it('a ficha acha o emissor numa pele que NÃO é a default', () => {
    const file = comEmissor();
    file.skins![0]!.name = 'armadura';
    const grupos = attachmentFields(file, 'fogo', 'fogo');
    // Rodada 4, consertos (05/10/2026), reescrito de propósito: "Anexo" → "Emissor" (A8).
    expect(grupos.map((g) => g.title).slice(0, 3)).toEqual(['Emissor', 'Onde está', 'O emissor']);
    const seed = grupos.flatMap((g) => g.fields).find((f) => f.key === 'seed')!;
    expect(seed.pointer).toBe('/skins/0/attachments/fogo/fogo/seed');
  });
});

// ---------------------------------------------------------------------------
// A ficha da 1ª fase do emissor — extensão `BONE_particles`, lote 3
// ---------------------------------------------------------------------------

describe('a ficha da 1ª fase do emissor (BONE_particles), lote 3', () => {
/**
 * Os campos da 1ª fase, e o que quase quebrou o arquivo em silêncio.
 *
 * **As faixas `[min, max]`.** Meia dúzia de campos do emissor são faixas —
 * `lifetime`, `speed`, `angle`, `angularVelocity`, `scale`, `startFrame` — e
 * mais os pares `gravity` e `size`. Cada um é **um** campo no arquivo e **dois**
 * na ficha, e o jeito óbvio de ligar os dois é apontar para `/…/lifetime/0`.
 *
 * **O jeito óbvio quebra o arquivo, e foi medido antes de se escrever a ficha.**
 * O `setAtPointer` cria o recipiente que falta e, vendo um índice numérico
 * adiante, cria um array — com **um** elemento. O schema exige `minItems: 2` e o
 * runtime lê `faixa[1]` para o máximo: um `"lifetime": [2]` daria máximo
 * `undefined` e a vida de toda partícula sairia `NaN`. **Inválido de um jeito
 * que a tela não mostra**, que é a pior espécie.
 *
 * Então a faixa se grava INTEIRA, sempre: `rangeFieldCommand` lê o par que está
 * lá (ou o padrão da extensão), troca um componente e grava os dois.
 */

/** Os campos de um grupo da ficha, pela chave. */
const fichaDe = (extra: Record<string, unknown> = {}): FieldDef[] =>
  attachmentFields(comEmissorP3(extra), 'fogo', 'fogo').flatMap((g) => g.fields);

function comEmissorP3(extra: Record<string, unknown> = {}): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'fogo', bone: 'root', attachment: 'fogo' }],
    skins: [{
      name: 'default',
      attachments: { fogo: { fogo: { type: 'BONE_particle', seed: 0, ...extra } } },
    }],
    extensionsUsed: ['BONE_particles'],
  } as unknown as BoneFile;
}

/** O campo de uma ponta de faixa. */
const ponta = (campos: FieldDef[], nome: string, qual: 0 | 1): FieldDef =>
  campos.filter((f) => f.label.startsWith(nome))[qual]!;

  it('o DEFEITO EXISTIA: apontar para /lifetime/0 deixa um array de UM elemento', () => {
    // A prova de que a máquina das faixas precisa existir. É o que um ponteiro
    // direto faria, e o schema exige dois elementos.
    const file = comEmissorP3();
    const criados = setAtPointer(file, '/skins/0/attachments/fogo/fogo/lifetime/0', 2);
    expect(getAtPointer(file, '/skins/0/attachments/fogo/fogo/lifetime')).toEqual([2]);
    expect(criados.length).toBeGreaterThan(0);
    // E o máximo, que o runtime lê em `faixa[1]`, sai indefinido.
    expect((getAtPointer(file, '/skins/0/attachments/fogo/fogo/lifetime') as number[])[1])
      .toBeUndefined();
  });

  it('e o comando da faixa grava os DOIS, com o padrão da extensão na outra ponta', () => {
    const file = comEmissorP3();
    const cmd = rangeFieldCommand(
      file, '/skins/0/attachments/fogo/fogo/lifetime', 0, 2, [1, 1], 'Mudar Vida',
    );
    cmd.apply({ file } as unknown as EditorDoc);
    expect(getAtPointer(file, '/skins/0/attachments/fogo/fogo/lifetime')).toEqual([2, 1]);
  });

  it('mexer no máximo não estraga o mínimo que já estava escrito', () => {
    const file = comEmissorP3({ speed: [40, 60] });
    rangeFieldCommand(file, '/skins/0/attachments/fogo/fogo/speed', 1, 300, [100, 100], 'x')
      .apply({ file } as unknown as EditorDoc);
    expect(getAtPointer(file, '/skins/0/attachments/fogo/fogo/speed')).toEqual([40, 300]);
  });

  it('um par TORTO no arquivo volta ao padrão, em vez de gravar outro torto', () => {
    // Um `[5]` vindo de fora, ou de uma versão de antes desta máquina. A ponta
    // que a pessoa digitou manda; a outra volta ao padrão da extensão.
    const file = comEmissorP3({ scale: [5] });
    rangeFieldCommand(file, '/skins/0/attachments/fogo/fogo/scale', 1, 3, [1, 1], 'x')
      .apply({ file } as unknown as EditorDoc);
    expect(getAtPointer(file, '/skins/0/attachments/fogo/fogo/scale')).toEqual([5, 3]);
  });

  it('e um valor que não é número cai no padrão daquela ponta, nunca em NaN', () => {
    const file = comEmissorP3();
    rangeFieldCommand(file, '/skins/0/attachments/fogo/fogo/lifetime', 1, 'abacaxi', [1, 2], 'x')
      .apply({ file } as unknown as EditorDoc);
    expect(getAtPointer(file, '/skins/0/attachments/fogo/fogo/lifetime')).toEqual([1, 2]);
  });

  it('o desfazer de uma faixa devolve o arquivo letra por letra', () => {
    const file = comEmissorP3();
    const antes = JSON.stringify(file);
    const doc = { file } as unknown as EditorDoc;
    const cmd = rangeFieldCommand(
      file, '/skins/0/attachments/fogo/fogo/speed', 0, 250, [100, 100], 'x',
    );
    cmd.apply(doc);
    expect(JSON.stringify(file)).not.toBe(antes);
    cmd.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('a ficha MOSTRA o componente, e não o par inteiro', () => {
    // Sem o `component`, o campo "Vida (mínimo)" mostraria `1,1`.
    const campos = fichaDe({ lifetime: [0.5, 2] });
    const file = comEmissorP3({ lifetime: [0.5, 2] });
    expect(fieldValue(file, ponta(campos, 'Vida', 0))).toBe(0.5);
    expect(fieldValue(file, ponta(campos, 'Vida', 1))).toBe(2);
  });

  it('faixa ausente mostra o padrão da extensão nas duas pontas', () => {
    const campos = fichaDe();
    const file = comEmissorP3();
    expect(fieldValue(file, ponta(campos, 'Velocidade', 0))).toBe(100);
    expect(fieldValue(file, ponta(campos, 'Velocidade', 1))).toBe(100);
    expect(fieldValue(file, ponta(campos, 'Tamanho', 0))).toBe(1);
    expect(fieldValue(file, ponta(campos, 'Gravidade', 0))).toBe(0);
  });

  it('as duas pontas da mesma faixa têm chaves DIFERENTES', () => {
    // Duas linhas com a mesma chave é uma linha que escreve na outra.
    const campos = fichaDe();
    const chavesTodas = campos.map((f) => f.key);
    expect(new Set(chavesTodas).size).toBe(chavesTodas.length);
  });

  it('os padrões da ficha são os da extensão, campo por campo', () => {
    const campos = fichaDe();
    const padrao = (chave: string): unknown => campos.find((f) => f.key === chave)!.fallback;
    expect(padrao('rate')).toBe(10);
    expect(padrao('emitting')).toBe(true);
    expect(padrao('direction')).toBe(90);
    expect(padrao('spread')).toBe(0);
    expect(padrao('maxParticles')).toBe(1000);
    expect(padrao('shape')).toBe('point');
    expect(padrao('space')).toBe('local');
    expect(padrao('looping')).toBe(true);
    expect(padrao('sortMode')).toBe('youngestInFront');
    expect(padrao('radiusThickness')).toBe(1);
    expect(padrao('arc')).toBe(360);
    expect(padrao('drag')).toBe(0);
    expect(padrao('frameMode')).toBe('lifetime');
    expect(padrao('fps')).toBe(12);
  });

  it('o teto do maxParticles é o do formato: 10 000 (§10)', () => {
    const campo = fichaDe().find((f) => f.key === 'maxParticles')!;
    expect(campo.min).toBe(1);
    expect(campo.max).toBe(10000);
  });

  it('nenhum campo da 2ª fase entrou na ficha', () => {
    // A tabela da 1ª fase está em `documentos/programa-novo/07`. Sub-emissor,
    // rastro e ruído ficam para o glacê; a taxa ANIMADA também — na 1ª fase
    // `rate` é fixo e quem anima é `emitting`, e o rótulo diz isso.
    const campos = fichaDe();
    for (const fora of ['subEmitter', 'trail', 'noise', 'rateCurve']) {
      expect(campos.map((f) => f.key)).not.toContain(fora);
    }
    const emitting = campos.find((f) => f.key === 'emitting')!;
    expect(emitting.label).toContain('se anima');
  });

  it('as escolhas de "Forma" são as SETE da §9.4, e nenhuma inventada', () => {
    // Rodada 16, lote 8 (reescrito de propósito): a extensão 1.1 trouxe a forma
    // "caminho" (§9.4.2). Eram seis.
    const shape = fichaDe().find((f) => f.key === 'shape')!;
    expect(shape.options!.map((o) => o.value))
      .toEqual(['point', 'circle', 'rectangle', 'edge', 'bone', 'mesh', 'path']);
  });

  it('a malha se escolhe entre as do MESMO slot, e nunca as do arquivo inteiro', () => {
    // §9.4 exige a malha no slot do emissor. Uma lista com as do boneco todo
    // deixaria escolher uma que o leitor recusa, e a recusa só apareceria
    // depois, na barra de avisos.
    const file = comEmissorP3();
    const skin = file.skins![0]!.attachments as Record<string, Record<string, unknown>>;
    skin['fogo']!['chama_malha'] = { type: 'mesh', path: 'chama' };
    skin['outro'] = { longe: { type: 'mesh', path: 'longe' } };
    expect(meshOptionsInSlot(file, 'fogo').map((o) => o.value)).toEqual(['chama_malha']);
    const campo = attachmentFields(file, 'fogo', 'fogo')
      .flatMap((g) => g.fields).find((f) => f.key === 'mesh')!;
    expect(campo.options!.map((o) => o.value)).toEqual(['', 'chama_malha']);
  });

  it('a cor ao nascer são DUAS cores, uma por ponta do par (§9.7)', () => {
    const campos = fichaDe();
    const de = campos.find((f) => f.key === 'startColor0')!;
    const ate = campos.find((f) => f.key === 'startColor1')!;
    expect(de.kind).toBe('color');
    expect(de.pointer).toBe('/skins/0/attachments/fogo/fogo/startColor/0');
    expect(ate.pointer).toBe('/skins/0/attachments/fogo/fogo/startColor/1');
  });

  it('o rótulo da abertura diz que ela é para CADA lado', () => {
    // §9.3: `spread` é MEIA-abertura. Quem espera a abertura inteira põe o
    // dobro sem saber, e o efeito sai com o dobro do leque.
    expect(fichaDe().find((f) => f.key === 'spread')!.label).toContain('cada lado');
  });

  it('o rótulo do pré-aquecimento diz que ele só vale sem repetir (§6)', () => {
    expect(fichaDe().find((f) => f.key === 'prewarm')!.label).toContain('só sem repetir');
  });

  it('a janela da explosividade se chama pelo que é, e não "duração"', () => {
    // §9.1: `duration` é **só** para a explosividade; o laço usa a duração da
    // animação. Um campo chamado "Duração" numa ficha de emissor seria lido
    // como "quanto tempo o efeito dura", que é outra coisa.
    const campo = fichaDe().find((f) => f.key === 'duration')!;
    expect(campo.label).toContain('explosiv');
    expect(campo.label).not.toMatch(/^Duração/);
  });
});

// ---------------------------------------------------------------------------
// Os modelos prontos de partícula — rodada final, Ficha B, lote 1 (28/09/2026)
// ---------------------------------------------------------------------------

import {
  AddPresetEmitter, EMPTY_PRESET, PARTICLE_PRESETS, SOFT_DOT_REGION, SOFT_DOT_SIZE, hasSoftDot,
  particleMenuItems, presetAttachment, presetById, softDotPixels,
} from '../src/panels/particle-presets.js';
import { AddParticleEmitter } from '../src/panels/tree-commands.js';
import { loadAtlas as loadAtlasModelo } from '../../runtime/src/index.js';
import { ParticleCache as ParticleCacheModelo, particleFrame as particleFrameModelo } from '../../runtime/src/particles/frame.js';
import { emitterProblem } from '../src/viewport/particles-view.js';
import type { ImportedAtlas } from '../src/io/import-images.js';

describe('os modelos prontos de partícula (rodada final, lote 1)', () => {
  /** Só `file` e `selection`, como o `fakeDoc` do começo do arquivo, que mora dentro de outro `describe`. */
  const docDe = (file: BoneFile): EditorDoc => ({ file, selection: emptySelection() } as unknown as EditorDoc);

  /** Um esqueleto cru: dois ossos, uma animação de um segundo, nenhum slot. */
  function cru(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'mao', parent: 'root', x: 50, y: 20 }],
      animations: [{ name: 'anda', duration: 1, timelines: [] }],
    } as unknown as BoneFile;
  }

  /** O atlas que o empacotador daria: uma página, a região do ponto suave. */
  const ATLAS_PONTO = loadAtlasModelo({
    atlas: { version: '1.0', generator: 'teste' },
    pages: [{ name: 'particulas', image: 'particulas.png', width: 32, height: 32 }],
    regions: [{ name: SOFT_DOT_REGION, page: 0, x: 0, y: 0, width: 32, height: 32 }],
  });

  /** O pacote pronto, como o gesto o monta no navegador — sem o `<canvas>`. */
  function pacote(): { atlas: ImportedAtlas; item: { name: string; width: number; height: number; pixels: Uint8Array } } {
    return {
      atlas: {
        fileName: 'particulas.atlas.json', packed: {} as never, data: ATLAS_PONTO,
        images: new Map(), options: {},
      },
      item: { name: SOFT_DOT_REGION, width: SOFT_DOT_SIZE, height: SOFT_DOT_SIZE, pixels: softDotPixels() },
    };
  }

  const defDe = (file: BoneFile, slot: string): Record<string, unknown> =>
    (file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)[slot]![slot]!;

  it('são quatro, na ordem da ficha: fogo, fumaça, faísca, poeira', () => {
    expect(PARTICLE_PRESETS.map((p) => p.id)).toEqual(['fogo', 'fumaca', 'faisca', 'poeira']);
    expect(PARTICLE_PRESETS.map((p) => p.label)).toEqual(['Fogo', 'Fumaça', 'Faísca', 'Poeira']);
    expect(presetById('fogo')!.label).toBe('Fogo');
    expect(presetById('nada')).toBeNull();
  });

  it('o menu do botão tem o emissor vazio primeiro, e os quatro depois, todos com dica', () => {
    const itens = particleMenuItems();
    // Rodada 38, lote 5 (reescrito de propósito): a porta diz que é um emissor NOVO, começado de um exemplo.
    expect(itens.map((i) => i.label)).toEqual(['Novo: vazio', 'Novo: fogo', 'Novo: fumaça', 'Novo: faísca', 'Novo: poeira']);
    expect(itens[0]!.preset).toBeNull();
    for (const item of itens) expect(item.hint.length).toBeGreaterThan(20);
    // P5: cada linha roda uma AÇÃO — a mesma do menu Animação → Efeitos de chave.
    expect(itens.map((i) => i.action)).toEqual([
      'novo-emissor', 'particulas-fogo', 'particulas-fumaca', 'particulas-faisca', 'particulas-poeira',
    ]);
  });

  it('nenhum modelo escreve campo que a §9 da extensão não conhece (regra 7 da casa)', () => {
    // A lista é a §9 de `formato/extensions/BONE_particles.md`, campo por campo.
    const SECAO_9 = new Set([
      'emitting', 'rate', 'bursts', 'explosiveness', 'duration', 'randomness', 'startDelay',
      'lifetime', 'maxParticles', 'speed', 'direction', 'spread', 'spherizeDirection', 'alignToVelocity',
      'shape', 'radius', 'radiusThickness', 'arc', 'size', 'edge', 'mesh', 'meshMode',
      'gravity', 'drag', 'angle', 'angularVelocity', 'scale', 'scaleOverLifetime',
      'startColor', 'colorOverLifetime', 'alphaOverLifetime',
      'path', 'sequence', 'frameMode', 'cycles', 'fps', 'startFrame',
      'space', 'seed', 'looping', 'prewarm', 'sortMode',
    ]);
    for (const preset of PARTICLE_PRESETS) {
      for (const key of Object.keys(preset.fields)) expect(SECAO_9.has(key), `${preset.id}.${key}`).toBe(true);
      // Os três que o comando põe não vêm do modelo.
      expect(preset.fields).not.toHaveProperty('type');
      expect(preset.fields).not.toHaveProperty('seed');
      expect(preset.fields).not.toHaveProperty('path');
    }
  });

  it('o ponto suave é branco, cheio no centro e vazio nos cantos', () => {
    const px = softDotPixels(32);
    expect(px.length).toBe(32 * 32 * 4);
    const alfa = (x: number, y: number): number => px[(y * 32 + x) * 4 + 3]!;
    expect(alfa(16, 16)).toBeGreaterThan(220);
    expect(alfa(0, 0)).toBe(0);
    expect(alfa(31, 31)).toBe(0);
    expect(alfa(8, 16)).toBe(alfa(23, 16)); // simétrico
    for (let i = 0; i < px.length; i += 4) expect([px[i], px[i + 1], px[i + 2]]).toEqual([255, 255, 255]);
  });

  it('o anexo do modelo é cópia funda: dois fogos não dividem a mesma lista de chaves', () => {
    const fogo = presetById('fogo')!;
    const a = presetAttachment(fogo, 0) as unknown as Record<string, unknown>;
    const b = presetAttachment(fogo, 1) as unknown as Record<string, unknown>;
    expect(a['type']).toBe('BONE_particle');
    expect(a['seed']).toBe(0);
    expect(a['path']).toBe(SOFT_DOT_REGION);
    expect(a['colorOverLifetime']).not.toBe(b['colorOverLifetime']);
    expect(a['colorOverLifetime']).not.toBe(fogo.fields['colorOverLifetime']);
  });

  it('criar um fogo e desfazer devolve o arquivo letra por letra', () => {
    const file = cru();
    const antes = JSON.stringify(file);
    const doc = docDe(file);
    const command = new AddPresetEmitter(file, 'mao', [], presetById('fogo')!, null);
    command.apply(doc);
    expect(defDe(file, command.name)['rate']).toBe(40);
    expect(defDe(file, command.name)['path']).toBe(SOFT_DOT_REGION);
    expect((file as { extensionsUsed?: string[] }).extensionsUsed).toEqual(['BONE_particles']);
    command.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('nenhum modelo mexe na mistura do slot: aditivo no fundo claro da cena vira borrão branco', () => {
    for (const id of ['fogo', 'fumaca', 'faisca', 'poeira']) {
      const file = cru();
      const command = new AddPresetEmitter(file, 'mao', [], presetById(id)!, null);
      command.apply(docDe(file));
      expect(file.slots!.find((s) => s.name === command.name)!.blend).toBeUndefined();
    }
  });

  it('com a imagem junto, o atlas entra no arquivo e na cena, e o desfazer tira os dois', () => {
    const doc = new Doc(cru());
    const antes = JSON.stringify(doc.file);
    expect(hasSoftDot(doc.atlases)).toBe(false);
    doc.run(new AddPresetEmitter(doc.file, 'mao', [], presetById('fumaca')!, pacote()));
    expect(doc.file.assets?.atlases).toEqual(['particulas.atlas.json']);
    expect(hasSoftDot(doc.atlases)).toBe(true);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(hasSoftDot(doc.atlases)).toBe(false);
    doc.redo();
    expect(hasSoftDot(doc.atlases)).toBe(true);
  });

  it('UM CLIQUE JÁ MOSTRA ALGO: o modelo desenha e jorra; o emissor vazio, no mesmo lugar, não', () => {
    // A metade de "antes" (regra 26): o emissor que já existia, criado pela
    // mesma porta, no mesmo documento com o mesmo atlas — não tem imagem.
    const vazio = new Doc(cru());
    vazio.setAssets([ATLAS_PONTO], new Map());
    const cmdVazio = new AddParticleEmitter(vazio.file, 'mao', []);
    vazio.run(cmdVazio);
    vazio.animation = 'anda';
    vazio.time = 0.5;
    const slotVazio = vazio.skeleton!.slots.find((s) => s.data.name === cmdVazio.name)!;
    expect(emitterProblem(slotVazio.attachment as never)?.short).toBe('sem imagem');

    // A metade de "depois": cada um dos quatro modelos, pelo mesmo caminho.
    for (const preset of PARTICLE_PRESETS) {
      const doc = new Doc(cru());
      const command = new AddPresetEmitter(doc.file, 'mao', [], preset, pacote());
      doc.run(command);
      doc.animation = 'anda';
      // A faísca estoura em 0 e vive até 0,6 s; os outros jorram sem parar.
      doc.time = preset.id === 'faisca' ? 0.2 : 0.5;
      const sk = doc.skeleton!;
      const slot = sk.slots.find((s) => s.data.name === command.name)!;
      expect(emitterProblem(slot.attachment as never), preset.id).toBeNull();
      const frame = particleFrameModelo(sk, slot, slot.attachment as never, new ParticleCacheModelo());
      expect(frame.silence, preset.id).toBeNull();
      expect(frame.particles.length, preset.id).toBeGreaterThan(3);
      for (const p of frame.particles) expect(Number.isFinite(p.x) && Number.isFinite(p.y), preset.id).toBe(true);
      expect(doc.warnings.filter((w) => /particle|partícula|emissor/i.test(w)), preset.id).toEqual([]);
    }
  });

  it('dois fogos seguidos ganham sementes diferentes (§9.9)', () => {
    const file = cru();
    const doc = docDe(file);
    const um = new AddPresetEmitter(file, 'mao', [], presetById('fogo')!, null);
    um.apply(doc);
    const dois = new AddPresetEmitter(file, 'mao', [], presetById('fogo')!, null);
    dois.apply(doc);
    expect(dois.seed).not.toBe(um.seed);
    expect(dois.name).not.toBe(um.name);
  });

  // Rodada 38, lote 1 (06/10/2026). O Humberto: "vi os exemplos mas não sei
  // como usar" — na foto `06_exemplos_todos` o fogo era uma chama de ~30 px, a
  // fumaça uma mancha cinza-clara sobre a grade cinza, e a faísca sumia depois
  // de 0,5 s. Régua dos outros: o demo 2D do Godot põe a fumaça num disco de
  // 30 px; o tutorial 1260 do Construct, partículas de 200 px.
  it('os exemplos se veem de primeira: tamanho, contraste e repetição', () => {
    const faixa = (v: unknown): [number, number] => (Array.isArray(v) ? [Number(v[0]), Number(v[1])] : [1, 1]);
    const pico = (v: unknown): number => (Array.isArray(v)
      ? Math.max(...v.map((k) => Number((k as { value: number }).value))) : 1);
    const fogo = presetById('fogo')!.fields;
    // O fogo nasce com pelo menos 48 px (a imagem tem SOFT_DOT_SIZE px).
    expect(SOFT_DOT_SIZE * faixa(fogo['scale'])[0]).toBeGreaterThanOrEqual(48);

    const fumaca = presetById('fumaca')!.fields;
    // A fumaça chega a 150 px no auge da vida…
    expect(SOFT_DOT_SIZE * faixa(fumaca['scale'])[1] * pico(fumaca['scaleOverLifetime'])).toBeGreaterThanOrEqual(150);
    // …com alfa de 0,7 no auge, e cinza escuro o bastante para o fundo claro.
    expect(pico(fumaca['alphaOverLifetime'])).toBeGreaterThanOrEqual(0.7);
    const cores = fumaca['startColor'] as number[][];
    for (const cor of cores) expect(Math.max(cor[0]!, cor[1]!, cor[2]!)).toBeLessThanOrEqual(0.55);

    // A faísca estoura mais de uma vez por segundo: não some depois do começo.
    const rajadas = presetById('faisca')!.fields['bursts'] as Array<{ cycles?: number; interval?: number }>;
    const vezes = rajadas.reduce((n, b) => n + (b.cycles ?? 1), 0);
    expect(vezes).toBeGreaterThanOrEqual(2);
    for (const b of rajadas) expect(b.interval ?? 1).toBeLessThanOrEqual(0.5);
  });
});

// ---------------------------------------------------------------------------
// Lote 2 do chat B (rodada final): o Compensar que tapa a ficha, e a ficha
// rápida que mostra o QUADRO (29/09/2026)
// ---------------------------------------------------------------------------

import { compensationApplies } from '../src/panels/properties-model.js';
import { quickTarget, readQuickNow } from '../src/panels/quick-model.js';
import { quickFields as quickFieldsL2, quickSubject as quickSubjectL2, readQuickValue as readQuickValueL2 } from '../src/panels/quick-model.js';
import { writeFieldValue as writeFieldValueL2 } from '../src/panels/properties-model.js';

describe('o Compensar só aparece com osso escolhido (P6, defeitos D1 e B3)', () => {
  const sel = (part: Partial<Selection>): Selection => ({ ...emptySelection(), ...part });

  it('com um OSSO escolhido e Transformar na mão, aparece', () => {
    expect(compensationApplies('transform', sel({ bones: ['arm'] }))).toBe(true);
    expect(compensationApplies('rotate', sel({ bones: ['arm'] }))).toBe(true);
  });

  it('com parâmetro, emissor, evento ou nada escolhido, NÃO aparece — era o que tapava a ficha', () => {
    expect(compensationApplies('transform', sel({ parameters: ['p'] }))).toBe(false);
    expect(compensationApplies('transform', sel({ attachments: [{ slot: 'fx', attachment: 'fx' }] }))).toBe(false);
    expect(compensationApplies('transform', sel({ slots: ['fx'] }))).toBe(false);
    expect(compensationApplies('transform', sel({}))).toBe(false);
  });

  it('com a ferramenta que não arrasta osso, também não', () => {
    expect(compensationApplies('create-bone', sel({ bones: ['arm'] }))).toBe(false);
    expect(compensationApplies('weights', sel({ bones: ['arm'] }))).toBe(false);
  });
});

describe('a ficha rápida mostra o valor DO QUADRO, e a base ao lado (K8, P24)', () => {
  /** Um osso com ângulo −95 na base, e uma animação que o põe em −55 em 0,5 s. */
  function perna(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'perna', parent: 'root', rotation: -95, length: 40 }],
      slots: [{ name: 'pe', bone: 'perna', color: [1, 1, 1, 1] }],
      animations: [{
        name: 'andar', duration: 1, timelines: [
          { type: 'bone', target: 'perna', property: 'rotation', keys: [{ time: 0.5, value: -55 }] },
          { type: 'slot', target: 'pe', property: 'color', keys: [{ time: 0.5, value: [1, 1, 1, 0.25] }] },
        ],
      }],
    } as unknown as BoneFile;
  }
  const campo = (doc: Doc, sujeito: Partial<Selection>, key: string) =>
    quickFieldsL2(doc.file, quickSubjectL2({ ...emptySelection(), ...sujeito })).find((f) => f.key === key)!;

  it('ANTES (o defeito): a leitura velha dá a base mesmo com a agulha na chave', () => {
    const doc = new Doc(perna());
    doc.animation = 'andar';
    doc.time = 0.5;
    expect(readQuickValueL2(doc.file, campo(doc, { bones: ['perna'] }, 'rotation'))).toBe(-95);
  });

  it('DEPOIS: o ângulo mostrado é o do quadro, e a base vem junto', () => {
    const doc = new Doc(perna());
    doc.animation = 'andar';
    doc.time = 0.5;
    const r = readQuickNow(doc, campo(doc, { bones: ['perna'] }, 'rotation'));
    expect(r.frame).toBeCloseTo(-55, 6);
    expect(r.base).toBe(-95);
    expect(r.animated).toBe(true);
  });

  it('sem animação aberta, é a base, e não há o que mostrar ao lado', () => {
    const doc = new Doc(perna());
    doc.animation = null;
    const r = readQuickNow(doc, campo(doc, { bones: ['perna'] }, 'rotation'));
    expect(r).toEqual({ frame: -95, base: -95, animated: false });
  });

  it('o alfa do slot segue o quadro também: é o 4º número da cor', () => {
    const doc = new Doc(perna());
    doc.animation = 'andar';
    doc.time = 0.5;
    const alfa = campo(doc, { slots: ['pe'] }, 'alpha');
    expect(quickTarget(doc.file, alfa)?.component).toBe(3);
    expect(readQuickNow(doc, alfa).frame).toBeCloseTo(0.25, 6);
  });

  it('ANTES (a outra metade): gravar o alfa pelo ponteiro color/3 com animação aberta ia para a BASE', () => {
    // `targetForPointer` só conhece ponteiros de três partes; `…/color/3` tem
    // quatro, e a gravação caía no `setFieldCommand` — mexer gravava na base.
    const doc = new Doc(perna());
    doc.animation = 'andar';
    doc.time = 0.25;
    const alfa = campo(doc, { slots: ['pe'] }, 'alpha');
    writeFieldValueL2(doc, {
      key: 'alpha', label: 'Alfa', kind: 'number', pointer: alfa.pointer!, fallback: 1, changeKind: 'transform',
    }, 0.5);
    expect((doc.file.slots![0] as { color: number[] }).color[3]).toBe(0.5);
  });
});

describe('o alfa da ficha, com animação aberta, grava CHAVE e não a base (K8)', () => {
  it('DEPOIS: a cor inteira vira chave no quadro, só o 4º número muda, e a base fica', async () => {
    const { writeQuickValue } = await import('../src/panels/quick-model.js');
    const doc = new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'pe', bone: 'root', color: [1, 0.5, 0.25, 1] }],
      animations: [{ name: 'andar', duration: 1, timelines: [] }],
    } as unknown as BoneFile);
    doc.animation = 'andar';
    doc.time = 0.25;
    const alfa = quickFieldsL2(doc.file, quickSubjectL2({ ...emptySelection(), slots: ['pe'] })).find((f) => f.key === 'alpha')!;
    writeQuickValue(doc, alfa, 0.5);
    expect((doc.file.slots![0] as { color: number[] }).color).toEqual([1, 0.5, 0.25, 1]);
    const r = readQuickNow(doc, alfa);
    expect(r.frame).toBeCloseTo(0.5, 6);
    expect(r.base).toBe(1);
  });
});

describe('a chave de VARIÁVEL criada em Propriedades se mostra (P12)', () => {
  it('gravar o valor com animação aberta pede à linha do tempo que mostre a chave, e o rodapé diz', async () => {
    const { onRevealKey } = await import('../src/anim/keying.js');
    const vistas: Array<{ type: string; target?: string; time: number }> = [];
    const parar = onRevealKey((ref) => vistas.push({ type: ref.target.type, target: ref.target.target, time: ref.time }));
    const avisos: string[] = [];
    const doc = new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root', rotation: 0 }],
      variables: [{ name: 'vida', type: 'float', default: 1 }],
      animations: [{ name: 'andar', duration: 1, timelines: [] }],
    } as unknown as BoneFile);
    const aviso = doc.notice.bind(doc);
    doc.notice = (texto: string) => { avisos.push(texto); aviso(texto); };
    doc.animation = 'andar';
    doc.time = 0.5;
    writeFieldValueL2(doc, {
      key: 'default', label: 'Valor', kind: 'number', pointer: '/variables/0/default', fallback: 0, changeKind: 'structure',
    }, 3);
    // Um número de OSSO, no mesmo quadro, não pula a linha do tempo.
    writeFieldValueL2(doc, {
      key: 'rotation', label: 'Ângulo', kind: 'number', pointer: '/bones/0/rotation', fallback: 0, changeKind: 'transform',
    }, 10);
    parar();
    expect(vistas).toEqual([{ type: 'variable', target: 'vida', time: 0.5 }]);
    expect(avisos.some((a) => a.includes('vida') && a.includes('0,50'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Rodada 8a (04/10/2026): Propriedades dizem o nome da entidade, e os números dela
// ---------------------------------------------------------------------------

import { attachmentFields as campos8a, buildProperties as ficha8a, entityShownName as nome8a } from '../src/panels/properties-model.js';
import { emptySelection as vazia8a } from '../src/contract.js';
import type { BoneFile as Arquivo8a } from '../../runtime/src/index.js';

describe('rodada 8a — Propriedades da entidade', () => {
  const arquivo = (): Arquivo8a => ({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'cabeca', parent: 'root' }],
    slots: [{ name: 'cabeca', bone: 'cabeca', attachment: 'rosto' }],
    skins: [{ name: 'default', attachments: { cabeca: { rosto: { type: 'skeleton', uri: 'armas/espada.bone', x: 4, y: 2 } } } }],
  }) as unknown as Arquivo8a;

  it('o nome que se lê é o da entidade, e não o do anexo que a troca guardou', () => {
    expect(nome8a(arquivo(), 'cabeca', 'rosto')).toBe('espada');
    const so = ficha8a(arquivo(), { ...vazia8a(), slots: ['cabeca'], attachments: [{ slot: 'cabeca', attachment: 'rosto' }] });
    expect(so.title).toBe('Entidade: espada (em cabeca)');
    // O clique na cena escolhe o osso junto, como numa imagem: o título diz os dois.
    const clique = ficha8a(arquivo(), { ...vazia8a(), bones: ['cabeca'], slots: ['cabeca'], attachments: [{ slot: 'cabeca', attachment: 'rosto' }] });
    expect(clique.title).toBe('Osso: cabeca · entidade espada');
    // A linha da Ordem escolhe o slot.
    // Rodada 43, lote 1: "Desenho", como pela Árvore (era "Slot").
    expect(ficha8a(arquivo(), { ...vazia8a(), slots: ['cabeca'] }).title).toBe('Desenho: cabeca · entidade espada');
  });

  it('X, Y, giro e escala aparecem e apontam para o anexo — antes eram "—"', () => {
    const grupos = campos8a(arquivo(), 'cabeca', 'rosto');
    const chaves = grupos.flatMap((g) => g.fields.map((f) => f.key));
    for (const k of ['x', 'y', 'rotation', 'scaleX', 'scaleY']) expect(chaves).toContain(k);
    const x = grupos.flatMap((g) => g.fields).find((f) => f.key === 'x')!;
    expect(x.pointer).toBe('/skins/0/attachments/cabeca/rosto/x');
    // Sem o campo "Imagem": ele dizia o nome do desenho que saiu.
    expect(chaves).not.toContain('path');
  });

  it('a Ficha rápida e a Ordem dizem o nome da entidade', () => {
    const props = readFileSync(resolve(__dirname, '../src/panels/properties.ts'), 'utf8');
    expect(props).toContain("const nome = el('span', 'ficha-nome', 'Entidade');");
    const ordem = readFileSync(resolve(__dirname, '../src/panels/draw-order.ts'), 'utf8');
    expect(ordem).toContain('entidade !== null ? `entidade ${entidade}`');
  });
});

// ---------------------------------------------------------------------------
// Rodada 15 (04/10/2026), lote 2: o painel Partículas, o nascer onde se vê,
// o emissor vazio com imagem, a semente nova ao duplicar e os avisos.
// ---------------------------------------------------------------------------

describe('rodada 15, lote 2: as partículas com lugar próprio', () => {
  /** Um herói mínimo: raiz, tronco (0,90→0,160) e braço (40,120→80,120). */
  const heroi = (): BoneFile => ({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'torso', parent: 'root', y: 90, rotation: 90, length: 70 },
      { name: 'braco', parent: 'root', x: 40, y: 120, length: 40 },
    ],
    slots: [{ name: 'fx', bone: 'torso', attachment: 'fx' }, { name: 'luz', bone: 'braco', attachment: 'luz' }],
    skins: [{ name: 'default', attachments: {
      fx: { fx: { type: 'BONE_particle', seed: 0 } },
      luz: { luz: { type: 'BONE_particle', seed: 3, path: 'chama' } },
    } }],
    extensionsUsed: ['BONE_particles'],
  } as unknown as BoneFile);

  it('linha 5: a lista tem um emissor por linha, com o osso e se está escolhido', () => {
    const file = heroi();
    const sel = { ...emptySelection(), attachments: [{ slot: 'luz', attachment: 'luz' }] };
    const rows = emitterRowsR15(file, sel, new Map([['fx/fx', 'sem imagem']]));
    expect(rows.map((r) => [r.attachment, r.bone, r.selected, r.short])).toEqual([
      ['fx', 'torso', false, 'sem imagem'],
      ['luz', 'braco', true, null],
    ]);
    // Clicar na linha escolhe só o emissor, como o clique na cena.
    expect(selectionForRowR15(rows[0]!)).toEqual({ ...emptySelection(), slots: ['fx'], attachments: [{ slot: 'fx', attachment: 'fx' }] });
  });

  it('linha 5: o painel nasce na coluna (RIGHT_GROUPS) e está no menu Janela', () => {
    expect(RIGHT_GROUPS_R15.flat()).toContain('particulas');
    expect(WINDOW_PANELS_R15.map((p) => p.id)).toContain('particulas');
    expect(WINDOW_GROUPS_R15.flat()).toContain('particulas');
    const fonte = readFileSync(resolve(__dirname, '../src/panels/index.ts'), 'utf8');
    expect(fonte).toContain("import { particlesPanel } from './particles-panel.js';");
  });

  it('linha 6: sem nada escolhido, nasce no osso mais perto do meio da cena — nunca na raiz', () => {
    const file = heroi();
    const ossos = [
      { name: 'root', x: 0, y: 0, tipX: 0, tipY: 0, visible: true },
      { name: 'torso', x: 0, y: 90, tipX: 0, tipY: 160, visible: true },
      { name: 'braco', x: 40, y: 120, tipX: 80, tipY: 120, visible: true },
    ];
    // O meio da cena em (2, 130): o tronco passa a 2 px; o braço, a 38.
    expect(boneForNewEmitterR15(file, emptySelection(), ossos, { x: 2, y: 130 })).toEqual({ bone: 'torso', nearCenter: true });
    // Em (70, 118): o braço.
    expect(boneForNewEmitterR15(file, emptySelection(), ossos, { x: 70, y: 118 })!.bone).toBe('braco');
    // Mesmo com o meio da cena EM CIMA da raiz, a raiz não: ela não se vê.
    expect(boneForNewEmitterR15(file, emptySelection(), ossos, { x: 0, y: 0 })!.bone).not.toBe('root');
    // Sem cena (teste, ou cena fechada): o primeiro osso que se vê.
    expect(boneForNewEmitterR15(file, emptySelection(), ossos, null)).toEqual({ bone: 'torso', nearCenter: false });
    // Osso escolhido: nele. Imagem escolhida: no osso dela.
    expect(boneForNewEmitterR15(file, { ...emptySelection(), bones: ['braco'] }, ossos, { x: 0, y: 0 })!.bone).toBe('braco');
    expect(boneForNewEmitterR15(file, { ...emptySelection(), attachments: [{ slot: 'luz', attachment: 'luz' }] }, ossos, null)!.bone).toBe('braco');
    // Só a raiz no arquivo: ela, que é o único lugar.
    expect(boneForNewEmitterR15(file, emptySelection(), [ossos[0]!], { x: 5, y: 5 })).toEqual({ bone: 'root', nearCenter: false });
  });

  it('linha 6: o gesto inteiro, sem nada escolhido, não põe o emissor na raiz', () => {
    const doc = new DocR15({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'mao', parent: 'root', x: 30, length: 20 }],
    } as unknown as BoneFile);
    addParticleEmitterR15(doc);
    expect(doc.file.slots!.map((s) => [s.name, s.bone])).toEqual([['mao_particulas', 'mao']]);
    expect(doc.selection.attachments).toEqual([{ slot: 'mao_particulas', attachment: 'mao_particulas' }]);
  });

  it('linha 7: o emissor vazio nasce com o ponto suave, e só o caminho dele no arquivo', () => {
    const doc = new DocR15({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'mao', parent: 'root' }],
    } as unknown as BoneFile);
    addParticleEmitterR15(doc);
    const def = (doc.file.skins![0]!.attachments as Record<string, Record<string, unknown>>)['mao_particulas']!['mao_particulas'];
    // Rodada 38, lote 5 (reescrito de propósito): o vazio nasce com o que se vê (doc 35).
    expect(def).toEqual({ type: 'BONE_particle', seed: 0, path: 'fx/ponto-suave', rate: 20, scale: [1.2, 1.6], startColor: [[0.85, 0.2, 0.6, 1], [0.95, 0.3, 0.7, 1]], alphaOverLifetime: [{ time: 0, value: 1 }, { time: 1, value: 0 }] });
    expect(presetActionIdR15(EMPTY_PRESET_R15)).toBe('novo-emissor');
  });

  it('linha 5: Duplicar dá SEMENTE NOVA ao emissor (§9.9), e o desfazer volta', () => {
    const doc = new DocR15(heroi());
    const antes = JSON.stringify(doc.file);
    doc.run(new DuplicateR15(doc.file, { bones: [], slots: ['luz'], attachments: [{ slot: 'luz', attachment: 'luz' }] }));
    const skin = doc.file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>;
    const copia = Object.keys(skin).find((k) => k !== 'fx' && k !== 'luz')!;
    expect(skin['luz']!['luz']!['seed']).toBe(3);
    // Usadas: 0 e 3. A menor livre é 1.
    expect(skin[copia]!['luz']!['seed']).toBe(1);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    doc.redo();
    expect((doc.file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)[copia]!['luz']!['seed']).toBe(1);
  });

  it('linha 8: os avisos do emissor vão para o botão de avisos, com ponteiro (Ir para)', () => {
    const doc = new DocR15(heroi());
    const sk = doc.skeleton!;
    const linhas = emitterWarningLinesR15(doc.file, sk, [], () => ({ cut: 12 }));
    expect(linhas[0]).toBe('/skins/0/attachments/fx/fx: o emissor "fx" não tem imagem: escolha uma em Propriedades');
    // O "sem imagem" não se repete quando o carregador já avisou daquele desenho.
    const ja = ['/skins/0/attachments/fx/fx: image "fx" not found in any atlas; attachment will be invisible'];
    expect(emitterWarningLinesR15(doc.file, sk, ja, null).some((l) => l.startsWith('/skins/0/attachments/fx/fx'))).toBe(false);
  });

  it('linha 8: o emissor sadio que o teto corta diz quantas', () => {
    const doc = new DocR15(heroi());
    const sk = doc.skeleton!;
    // Finge as imagens resolvidas: o que importa aqui é a frase do corte.
    for (const slot of sk.slots) (slot.attachment as unknown as { region: unknown }).region = {};
    const linhas = emitterWarningLinesR15(doc.file, sk, [], () => ({ cut: 12 }));
    expect(linhas).toContain('/skins/0/attachments/luz/luz: 12 partículas cortadas neste quadro: o emissor "luz" desenha no máximo 1000 (Máximo de vivas, em Propriedades)');
    expect(emitterWarningLinesR15(doc.file, sk, [], () => ({ cut: 0 }))).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Rodada 3, J9 (04/10/2026): "digitei 90 no Ângulo e nada mexeu".
// A forma: o comando escrevia SÓ no arquivo e dizia `transform`, e um
// `transform` só repõe a pose — lida dos dados já carregados, com o número
// velho. O arquivo dizia 90; a cena, -160.
// ---------------------------------------------------------------------------
import { writeQuickValue as writeQuickValueJ9 } from '../src/panels/quick-model.js';
import { boneFields as boneFieldsJ9 } from '../src/panels/properties-model.js';

function bracoJ9(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'arm', parent: 'root', x: 10, y: 0, rotation: -90, length: 40 },
      { name: 'forearm', parent: 'arm', x: 40, y: 0 },
    ],
    slots: [{ name: 'pele', bone: 'arm', color: [1, 1, 1, 1] }],
    animations: [{ name: 'andar', duration: 1, timelines: [] }],
  } as unknown as BoneFile;
}

describe('J9: o número digitado na ficha GIRA o osso na cena, com a base aberta', () => {
  const quick = (doc: Doc, sujeito: Partial<Selection>, key: string) =>
    quickFieldsL2(doc.file, quickSubjectL2({ ...emptySelection(), ...sujeito })).find((f) => f.key === key)!;

  it('Ângulo 90: o osso vivo vira 90 e o filho (o desenho junto) vai para cima', () => {
    const doc = new Doc(bracoJ9());
    writeQuickValueJ9(doc, quick(doc, { bones: ['arm'] }, 'rotation'), 90);
    expect((doc.file.bones![1] as { rotation: number }).rotation).toBe(90);
    expect(doc.skeleton!.findBone('arm')!.rotation).toBe(90);
    const filho = doc.skeleton!.findBone('forearm')!;
    expect(filho.worldX).toBeCloseTo(10, 6);
    expect(filho.worldY).toBeCloseTo(40, 6);
  });

  it('X, Y, Escala X e Escala Y da ficha chegam à cena; o Alfa também', () => {
    const doc = new Doc(bracoJ9());
    const arm = (): { x: number; y: number; scaleX: number; scaleY: number } => doc.skeleton!.findBone('arm')! as never;
    writeQuickValueJ9(doc, quick(doc, { bones: ['arm'] }, 'x'), 30);
    writeQuickValueJ9(doc, quick(doc, { bones: ['arm'] }, 'y'), 7);
    writeQuickValueJ9(doc, quick(doc, { bones: ['arm'] }, 'scaleX'), 2);
    writeQuickValueJ9(doc, quick(doc, { bones: ['arm'] }, 'scaleY'), 3);
    expect([arm().x, arm().y, arm().scaleX, arm().scaleY]).toEqual([30, 7, 2, 3]);
    writeQuickValueJ9(doc, quick(doc, { slots: ['pele'] }, 'alpha'), 0.25);
    expect((doc.skeleton!.findSlot('pele')!.color as ArrayLike<number>)[3]).toBeCloseTo(0.25, 6);
  });

  it('Ctrl+Z volta a cena junto com o arquivo', () => {
    const doc = new Doc(bracoJ9());
    writeQuickValueJ9(doc, quick(doc, { bones: ['arm'] }, 'rotation'), 90);
    doc.undo();
    expect(doc.skeleton!.findBone('arm')!.rotation).toBe(-90);
  });

  it('os campos de número da ficha de baixo (osso) também chegam à cena', () => {
    const doc = new Doc(bracoJ9());
    const valores: Record<string, number> = { x: 12, y: 3, rotation: 45, scaleX: 1.5, scaleY: 0.5, shearX: 10, shearY: 5, length: 55 };
    const campos = boneFieldsJ9(doc.file, 'arm').flatMap((g) => g.fields).filter((f) => f.key in valores);
    expect(campos.map((f) => f.key).sort()).toEqual(Object.keys(valores).sort());
    for (const f of campos) writeFieldValueL2(doc, f, valores[f.key]);
    const vivo = doc.skeleton!.findBone('arm')! as unknown as Record<string, number>;
    for (const k of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearX', 'shearY']) expect([k, vivo[k]]).toEqual([k, valores[k]]);
    expect(doc.skeleton!.findBone('arm')!.data.length).toBe(55);
  });

  it('com animação aberta continua gravando CHAVE, e a base não muda', () => {
    const doc = new Doc(bracoJ9());
    doc.animation = 'andar';
    doc.time = 0.5;
    writeQuickValueJ9(doc, quick(doc, { bones: ['arm'] }, 'rotation'), 90);
    expect((doc.file.bones![1] as { rotation: number }).rotation).toBe(-90);
    expect(doc.skeleton!.findBone('arm')!.rotation).toBe(90);
  });
});

describe('J9: quando uma REGRA desfaz o número digitado, o rodapé diz qual', () => {
  it('no herói, Ângulo 90 no arm: o ik_arm manda nele, e a frase diz isso', async () => {
    const { heldByRuleAfterWrite } = await import('../src/panels/quick-model.js');
    const doc = new Doc(parseBoneText(readFileSync(process.cwd().replace(/\\/g, '/') + '/formato/exemplos/heroi.bone', 'utf8')) as BoneFile);
    const angulo = quickFieldsL2(doc.file, quickSubjectL2({ ...emptySelection(), bones: ['arm'] })).find((f) => f.key === 'rotation')!;
    writeQuickValueJ9(doc, angulo, 90);
    expect(doc.skeleton!.findBone('arm')!.rotation).toBe(90);
    expect(heldByRuleAfterWrite(doc, angulo.pointer)).toBe(
      'arm não girou: a regra ik_arm manda nele. Desligue o olho dela na aba Regras. Ficou na base: Ctrl+Z desfaz');
  });

  it('osso sem regra que o segure: nenhum recado; ponteiro que não é de osso: nenhum', async () => {
    const { heldByRuleAfterWrite } = await import('../src/panels/quick-model.js');
    const doc = new Doc(bracoJ9());
    const angulo = quickFieldsL2(doc.file, quickSubjectL2({ ...emptySelection(), bones: ['arm'] })).find((f) => f.key === 'rotation')!;
    writeQuickValueJ9(doc, angulo, 90);
    expect(heldByRuleAfterWrite(doc, angulo.pointer)).toBeNull();
    expect(heldByRuleAfterWrite(doc, '/slots/0/color/3')).toBeNull();
    expect(heldByRuleAfterWrite(doc, null)).toBeNull();
  });
});

describe('rodada 23, defeito 10: o emissor se diz emissor', () => {
  it('Propriedades diz "Emissor:", e mover diz "Mover emissor"', () => {
    const ler = (p: string): string => readFileSync(resolve(import.meta.dirname, '../src', p), 'utf8');
    // Rodada 43, lote 1: o emissor continua "Emissor"; o resto virou "Desenho".
    expect(ler('panels/properties-model.ts')).toContain("ehEmissor ? `Emissor: ${attachment.attachment}` : `Desenho: ${attachment.slot}`");
    expect(ler('viewport/tools/attachment-edit.ts')).toContain("label.replace('desenho', 'emissor')");
  });
});

// ---------------------------------------------------------------------------
// A ficha do emissor em abas — rodada 16, lote 1
// ---------------------------------------------------------------------------

/** Um emissor sozinho num slot — o mesmo de `comEmissor`, que mora dentro de outro `describe`. */
function comEmissorR16(extra: Record<string, unknown> = {}): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'fogo', bone: 'root', attachment: 'fogo' }],
    skins: [{
      name: 'default',
      attachments: { fogo: { fogo: { type: 'BONE_particle', seed: 7, ...extra } } },
    }],
    extensionsUsed: ['BONE_particles'],
  } as unknown as BoneFile;
}

describe('a ficha do emissor em abas (rodada 16, lote 1)', () => {
  // Lote 8 (reescrito de propósito): 'path', a forma da extensão 1.1.
  const formas = ['point', 'circle', 'rectangle', 'edge', 'bone', 'mesh', 'path', 'forma-que-ninguem-conhece', 'anel', 'arco', 'com-folha'];
  // 'anel' e 'arco' não são formas do arquivo: são o círculo com valores (conserto 3).
  // 'com-folha' (lote 9, reescrito de propósito): sem folha de quadros, "a folha
  // corre", as voltas e o quadro de partida não aparecem — com ela, sim.
  const estado = (shape: string): Record<string, unknown> => (shape === 'anel'
    ? { shape: 'circle', radiusThickness: 0.2 }
    : shape === 'arco' ? { shape: 'circle', radiusThickness: 0.2, arc: 90 }
      : shape === 'com-folha' ? { sequence: { count: 4 } } : { shape });
  const abasDe = (extra: Record<string, unknown> = {}): SheetTabR16[] => {
    const model = buildProperties(comEmissorR16(extra), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] });
    expect(model.tabs, 'o emissor tem de vir em abas').toBeDefined();
    return model.tabs!;
  };
  const linhas = (abas: SheetTabR16[], id: string): string[] =>
    (abas.find((a) => a.id === id)?.rows ?? []).map((r) => r.label);

  it('nenhuma aba passa de LINHAS_POR_ABA linhas, em nenhuma forma, folha ou laço', () => {
    for (const shape of formas) {
      for (const frameMode of ['lifetime', 'fps']) {
        for (const looping of [true, false]) {
          for (const aba of abasDe({ ...estado(shape), frameMode, looping })) {
            // A Ficha rápida, dentro da aba Lugar, conta as linhas dela.
            // Lote 4: a curva e o seletor de forma valem duas linhas cada.
            const total = aba.rows.reduce((n, r) => n + (r.lines ?? 1), 0) + (aba.quick === true ? LINHAS_DA_FICHA_RAPIDA_R16 : 0);
            expect(total, `${aba.name} com ${shape}, ${frameMode}, laço ${looping}`).toBeLessThanOrEqual(LINHAS_POR_ABA_R16);
          }
        }
      }
    }
  });

  it('nenhum campo da ficha some: cada um está numa aba em algum estado, e nenhum cai na sobra', () => {
    const todos = new Set(attachmentFields(comEmissorR16(), 'fogo', 'fogo').flatMap((g) => g.fields).map((f) => f.key));
    const vistos = new Set<string>();
    for (const shape of formas) {
      for (const frameMode of ['lifetime', 'fps']) {
        for (const looping of [true, false]) {
          const abas = abasDe({ ...estado(shape), frameMode, looping });
          for (const aba of abas) for (const row of [...aba.rows, ...(aba.quickFallback ?? [])]) for (const f of row.fields) vistos.add(f.key);
          // A sobra vai para o fim da última aba; a Mais acaba em "Na frente".
          expect(linhas(abas, 'mais').at(-1)).toBe('Na frente');
        }
      }
    }
    expect([...todos].filter((k) => !vistos.has(k))).toEqual([]);
  });

  it('a forma mostra só os campos dela', () => {
    expect(linhas(abasDe({ shape: 'point' }), 'forma')).toEqual(['Forma']);
    // Conserto 3 da conferência: cada variante do círculo, só os campos dela.
    // Rodada 38, lote 3 (reescrito de propósito): o raio diz a unidade.
    // Rodada 38, lote 4 (reescrito de propósito): toda forma que tem área diz, NA
    // aba Forma, se as partículas saem para fora dela. O ponto não tem para onde.
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    expect(linhas(abasDe({ shape: 'circle' }), 'forma')).toEqual(['Forma', 'Raio', 'Para fora']);
    expect(linhas(abasDe({ shape: 'circle', radiusThickness: 0.2 }), 'forma')).toEqual(['Forma', 'Raio', 'Espessura', 'Para fora']);
    expect(linhas(abasDe({ shape: 'circle', radiusThickness: 0.2, arc: 90 }), 'forma')).toEqual(['Forma', 'Raio', 'Borda · trecho', 'Para fora']);
    expect(linhas(abasDe({ shape: 'rectangle' }), 'forma')).toEqual(['Forma', 'Retângulo', 'Para fora']);
    expect(linhas(abasDe({ shape: 'mesh' }), 'forma')).toEqual(['Forma', 'Malha', 'Onde na malha', 'Para fora']);
    // E a aba Movimento não o repete.
    expect(linhas(abasDe({ shape: 'circle' }), 'movimento')).not.toContain('Sair do centro');
    // Sem `shape` no arquivo vale o padrão da extensão: ponto (§9.4).
    expect(linhas(abasDe(), 'forma')).toEqual(['Forma']);
  });

  it('pré-aquecer só sem repetir; voltas ou quadros por segundo conforme a folha corre', () => {
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    expect(linhas(abasDe(), 'tempo')).not.toContain('Pré-aquecer');
    expect(linhas(abasDe({ looping: false }), 'tempo')).toContain('Pré-aquecer');
    // Lote 9 (reescrito de propósito): voltas e quadros/s só com a folha de quadros.
    const folha = { sequence: { count: 4 } };
    expect(linhas(abasDe(folha), 'imagem')).toContain('Voltas na vida');
    expect(linhas(abasDe({ ...folha, frameMode: 'fps' }), 'imagem')).toContain('Quadros');
    expect(linhas(abasDe({ ...folha, frameMode: 'fps' }), 'imagem')).not.toContain('Voltas na vida');
    expect(linhas(abasDe(), 'imagem')).not.toContain('Voltas na vida');
  });

  it('uma faixa [min, max] mora numa linha só, com os dois componentes na ordem', () => {
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    const vida = abasDe().find((a) => a.id === 'nascer')!.rows.find((r) => r.label === 'Vida')!;
    expect(vida.fields.map((f) => f.component)).toEqual([0, 1]);
    expect(vida.fields.map((f) => f.unit)).toEqual(['s', 's']);
    // X·Y e o giro são a reserva da Ficha rápida, na aba Lugar.
    const xy = abasDe().find((a) => a.id === 'lugar')!.quickFallback!.find((r) => r.label === 'X · Y')!;
    expect(xy.fields.map((f) => f.key)).toEqual(['x', 'y']);
  });

  it('toda aba é ícone que existe, com nome; e só o emissor ganha abas', () => {
    const abas = abasDe();
    expect(abas.map((a) => a.id)).toEqual(['nascer', 'tempo', 'lugar', 'forma', 'movimento', 'forcas', 'tamanho', 'cor', 'imagem', 'mais']);
    expect(abas.filter((a) => a.quick === true).map((a) => a.id)).toEqual(['lugar']);
    for (const aba of abas) {
      expect(hasIconR16(aba.icon), aba.icon).toBe(true);
      expect(aba.name.length).toBeGreaterThan(0);
    }
    const imagem = comEmissorR16();
    (imagem.skins as unknown as Array<{ attachments: Record<string, Record<string, unknown>> }>)[0]!.attachments.fogo!.fogo = { type: 'region' };
    expect(buildProperties(imagem, { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] }).tabs).toBeUndefined();
  });

  it('o rótulo curto leva o inteiro na dica: nada da explicação se perde', () => {
    const tempo = abasDe({ looping: false }).find((a) => a.id === 'tempo')!;
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    const pre = tempo.rows.find((r) => r.label === 'Pré-aquecer')!;
    // Lote 5: a explosividade divide a linha com a janela dela.
    const explosao = tempo.rows.find((r) => r.label === 'Explosão · janela')!;
    expect(explosao.fields.map((f) => f.key)).toEqual(['explosiveness', 'duration']);
    // Rodada 38, lote 3 (reescrito de propósito): a dica COMEÇA pelo nome inteiro, e a medida vem depois.
    expect(pre.fields[0]!.hint).toMatch(/^Pré-aquecer \(só sem repetir\) — em segundos/);
    const vida = abasDe().find((a) => a.id === 'nascer')!.rows.find((r) => r.label === 'Vida')!;
    expect(vida.fields.map((f) => f.hint!.split(' — ')[0])).toEqual(['Vida (mínimo)', 'Vida (máximo)']);
    // Nenhum rótulo de linha passa de 17 letras: é o que cabe em 1280×720.
    for (const aba of abasDe({ looping: false, shape: 'circle', radiusThickness: 0.2, arc: 90 })) {
      for (const row of aba.rows) expect(row.label.length, row.label).toBeLessThanOrEqual(17);
    }
  });

  it('o campo que nenhuma aba conhece não some calado: vai para o fim da última aba (regra 21)', () => {
    const estranho: FieldGroup = { title: 'x', fields: [{ key: 'campoNovo', label: 'Campo novo', kind: 'number', pointer: '/x' }] };
    const abas = particleSheetTabsR16([estranho], {});
    expect(abas.at(-1)!.rows.map((r) => r.label)).toEqual(['Campo novo']);
  });

  // Rodada 38, lote 2 (06/10/2026). O Humberto, na Vida "0,5 · 0,9": "eu não
  // entendi quando tava usando". As duas caixas de uma faixa diziam "mínimo" e
  // "máximo" só na dica. Agora a palavra fica entre elas: "de 0,5 a 0,9".
  it('toda faixa diz "de … a …" entre as caixas, e todo par diz o que é cada caixa', () => {
    const vistas = new Map<string, string[]>();
    for (const shape of formas) {
      for (const aba of abasDe({ ...estado(shape), sequence: { count: 4 } })) {
        for (const row of aba.rows) {
          if (row.fields.length !== 2) continue;
          vistas.set(row.label, row.fields.map((f) => f.short ?? ''));
        }
      }
    }
    // As faixas [mín, máx] da §9.
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    for (const rotulo of ['Vida', 'Velocidade', 'Tamanho', 'Giro inicial', 'Giro']) {
      expect(vistas.get(rotulo), rotulo).toEqual(['de', 'a']);
    }
    // Os pares que não são faixa dizem o eixo, ou a medida.
    expect(vistas.get('Gravidade')).toEqual(['X', 'Y']);
    expect(vistas.get('Início')).toEqual(['X', 'Y']);
    expect(vistas.get('Retângulo')).toEqual(['larg.', 'alt.']);
    // E nenhuma linha de duas caixas fica sem nome entre elas.
    for (const [rotulo, nomes] of vistas) expect(nomes.every((n) => n !== ''), rotulo).toBe(true);
  });

  // Rodada 38, lote 3 (06/10/2026), a régua do `26`: "todo campo numérico diz a
  // unidade e a faixa, no rótulo ou na dica; nenhum valor solto". Na conferência
  // (doc 27, §2.1), 15 dos 24 números da ficha não diziam — o "Arrasto (1/s) 0,5"
  // e a "Sair do centro 0" entre eles.
  it('todo número da ficha diz a unidade e a faixa, no rótulo ou na dica', () => {
    const UNIDADE = /px|°|\bs\b|segundo|partículas|fator|quadros|voltas|dígitos|número|0 a 1/;
    const FAIXA = /de -?\d|0 a 1|0 a 180|0 a 360|para cima|1 a \d/;
    const vistos = new Set<string>();
    for (const shape of formas) {
      for (const aba of abasDe({ ...estado(shape), sequence: { count: 4 }, frameMode: 'fps', looping: false })) {
        for (const row of aba.rows) {
          for (const f of row.fields) {
            if (f.kind !== 'number') continue;
            // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
            const texto = `${row.label} ${f.label} ${f.unit ?? ''} ${f.hint ?? ''}`;
            vistos.add(f.key);
            expect(UNIDADE.test(texto), `unidade de ${row.label} / ${f.key}: ${texto}`).toBe(true);
            expect(FAIXA.test(texto), `faixa de ${row.label} / ${f.key}: ${texto}`).toBe(true);
          }
        }
      }
    }
    // A conta passou pelos números que a conferência apontou.
    for (const k of ['drag', 'spherizeDirection', 'radius', 'direction', 'randomness', 'seed']) expect(vistos.has(k), k).toBe(true);
  });

  it("o freio diz quanto ele tira em um segundo, pela conta da §9 (v' = −k·v)", () => {
    const forcas = abasDe({ drag: 0.5 }).find((a) => a.id === 'forcas')!;
    const freio = forcas.rows.find((r) => r.fields[0]?.key === 'drag')!;
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    expect(freio.label).toBe('Freio');
    expect(freio.fields[0]!.unit).toBe('/s');
    // 1 − e^(−0,5) = 39 %; 1 − e^(−1) = 63 %; 1 − e^(−2) = 86 %.
    expect(freio.fields[0]!.hint).toMatch(/0,5.*39 %.*1.*63 %.*2.*86 %/);
  });
});

// ---------------------------------------------------------------------------
// O seletor de forma e a linha — rodada 16, lote 2
// ---------------------------------------------------------------------------

describe('o seletor de forma e a linha do emissor (rodada 16, lote 2)', () => {
  const abasDe = (extra: Record<string, unknown> = {}, file?: BoneFile): SheetTabR16[] =>
    buildProperties(file ?? comEmissorR16(extra), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] }).tabs!;
  const seletor = (abas: SheetTabR16[]) => abas.find((a) => a.id === 'forma')!.rows[0]!.shapes!;
  const acesos = (abas: SheetTabR16[]): string[] => seletor(abas).buttons.filter((b) => b.active).map((b) => b.id);

  it('nove botões, na ordem, cada um com desenho e nome', () => {
    const botoes = seletor(abasDe()).buttons;
    expect(botoes.map((b) => b.id)).toEqual(['point', 'rectangle', 'circle', 'ring', 'arc', 'edge', 'bone', 'mesh', 'path']);
    for (const b of botoes) {
      expect(hasIconR16(b.icon), b.icon).toBe(true);
      expect(b.name.length).toBeGreaterThan(0);
    }
  });

  it('acende a forma de agora; anel e arco são o círculo com valores', () => {
    expect(acesos(abasDe())).toEqual(['point']);
    expect(acesos(abasDe({ shape: 'circle' }))).toEqual(['circle']);
    expect(acesos(abasDe({ shape: 'circle', radiusThickness: 0.3 }))).toEqual(['ring']);
    expect(acesos(abasDe({ shape: 'circle', arc: 120, radiusThickness: 0.3 }))).toEqual(['arc']);
    expect(acesos(abasDe({ shape: 'forma-que-ninguem-conhece' }))).toEqual([]);
  });

  it('o caminho fica cinza e diz por quê; a malha, só sem malha no slot', () => {
    const botoes = seletor(abasDe()).buttons;
    expect(botoes.find((b) => b.id === 'path')!.disabled).toMatch(/ainda não/);
    expect(botoes.find((b) => b.id === 'mesh')!.disabled).toMatch(/não tem malha/);
    const comMalha = comEmissorR16();
    (comMalha.skins as unknown as Array<{ attachments: Record<string, Record<string, unknown>> }>)[0]!.attachments.fogo!.pano =
      { type: 'mesh', uvs: [0, 0, 1, 0, 0, 1], triangles: [0, 1, 2], vertices: [0, 0, 10, 0, 0, 10], hull: 3 };
    const malha = seletor(abasDe({}, comMalha)).buttons.find((b) => b.id === 'mesh')!;
    expect(malha.disabled).toBeUndefined();
    expect(malha.writes).toEqual({ shape: 'mesh', mesh: 'pano' });
  });

  it('escolher o anel grava três campos num passo só, e desfazer devolve o arquivo letra por letra', () => {
    const file = comEmissorR16({ shape: 'circle', radius: 40 });
    const antes = JSON.stringify(file);
    const doc = { file } as unknown as EditorDoc;
    const { base, buttons } = seletor(abasDe({}, file));
    const cmd = new ChooseShapeR16(base, buttons.find((b) => b.id === 'ring')!);
    cmd.apply(doc);
    const def = (file.skins as unknown as Array<{ attachments: Record<string, Record<string, Record<string, unknown>>> }>)[0]!.attachments.fogo!.fogo!;
    expect([def.shape, def.radiusThickness, def.arc, def.radius]).toEqual(['circle', 0.2, 360, 40]);
    cmd.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('a linha tem início e fim, e cada número grava a linha inteira', () => {
    const forma = abasDe({ shape: 'edge' }).find((a) => a.id === 'forma')!;
    // Rodada 38, lote 4 (reescrito de propósito): e o "para fora" da forma.
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    expect(forma.rows.map((r) => r.label)).toEqual(['Forma', 'Início', 'Fim', 'Para fora']);
    expect(forma.rows[2]!.fields.map((f) => f.component)).toEqual([2, 3]);
    const file = comEmissorR16({ shape: 'edge', edge: [1, 2, 3, 4] });
    const ponteiro = forma.rows[2]!.fields[0]!.pointer;
    const cmd = edgeFieldCommandR16(file, ponteiro, 2, 30, 'Mudar fim X');
    cmd.apply({ file } as unknown as EditorDoc);
    expect(getAtPointer(file, ponteiro)).toEqual([1, 2, 30, 4]);
    // Sem `edge` no arquivo, o resto vem do padrão [0,0,0,0], nunca um array de um número só.
    const vazio = comEmissorR16({ shape: 'edge' });
    edgeFieldCommandR16(vazio, ponteiro, 1, 7, 'x').apply({ file: vazio } as unknown as EditorDoc);
    expect(getAtPointer(vazio, ponteiro)).toEqual([0, 7, 0, 0]);
  });
});

// ---------------------------------------------------------------------------
// As curvas, o gradiente e as rajadas — rodada 16, lotes 4 e 5
// ---------------------------------------------------------------------------

describe('as curvas ao longo da vida e o gradiente (rodada 16, lote 4)', () => {
  const abasDe = (extra: Record<string, unknown> = {}): SheetTabR16[] =>
    buildProperties(comEmissorR16(extra), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] }).tabs!;
  const linhas = (abas: SheetTabR16[], id: string): string[] => abas.find((a) => a.id === id)!.rows.map((r) => r.label);

  it('a aba Tamanho e giro tem a curva; a aba Cor tem o gradiente, a transparência e a cor do emissor', () => {
    const abas = abasDe();
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    expect(linhas(abas, 'tamanho')).toEqual(['Tamanho', 'Tamanho na vida', 'Giro inicial', 'Giro']);
    expect(linhas(abas, 'cor')).toEqual(['Cor ao nascer', 'Cor na vida', 'Some na vida', 'Cor do emissor']);
    const cor = abas.find((a) => a.id === 'cor')!.rows;
    expect(cor.map((r) => r.fields[0]!.kind)).toEqual(['color', 'lifeGradient', 'lifeCurve', 'color']);
    expect(cor.find((r) => r.label === 'Some na vida')!.lines).toBe(2);
    expect(cor.find((r) => r.label === 'Cor do emissor')!.fields[0]!.pointer).toBe('/skins/0/attachments/fogo/fogo/color');
  });

  it('a curva se lê pela conta do runtime: reta, degrau, antes da primeira e depois da última', () => {
    const reta = [{ time: 0, value: 1 }, { time: 1, value: 0 }];
    expect(sampleLifeR16(reta, 0.25)).toBeCloseTo(0.75, 12);
    expect(sampleLifeR16([{ time: 0.2, value: 3 }, { time: 0.8, value: 5 }], 0)).toBe(3);
    expect(sampleLifeR16([{ time: 0.2, value: 3 }, { time: 0.8, value: 5 }], 1)).toBe(5);
    expect(sampleLifeR16([{ time: 0, value: 2, curve: 'stepped' }, { time: 1, value: 9 }], 0.9)).toBe(2);
    expect(sampleLifeR16([], 0.5)).toBe(1);
    const cor = sampleLifeColorR16([{ time: 0, value: [1, 0, 0, 1] }, { time: 1, value: [0, 0, 1, 0] }], 0.5);
    expect(cor.map((c) => Math.round(c * 100) / 100)).toEqual([0.5, 0, 0.5, 0.5]);
  });

  it('pôr, mover e tirar um ponto: a ordem nunca se inverte, as pontas ficam', () => {
    const vazia = addLifeKeyR16([], 0.5, 0.2, 1);
    expect(vazia).toEqual([{ time: 0, value: 1 }, { time: 0.5, value: 0.2 }, { time: 1, value: 1 }]);
    // Mover o do meio para além da última: para antes dela.
    const movida = moveLifeKeyR16(vazia, 1, 2, 9, [0, 2]);
    expect(movida[1]!.time).toBeLessThan(1);
    expect(movida[1]!.value).toBe(2);
    expect(removeLifeKeyR16(vazia, 0)).toBeNull();
    expect(removeLifeKeyR16(vazia, 1)!.map((k) => k.time)).toEqual([0, 1]);
  });

  it('o gradiente: a cor nova é a que já estava ali, e trocar a cor guarda o alfa', () => {
    const keys = [{ time: 0, value: [1, 1, 0, 1] as [number, number, number, number] }, { time: 1, value: [1, 0, 0, 0.5] as [number, number, number, number] }];
    const com = addColorKeyR16(keys, 0.5);
    expect(com[1]!.value).toEqual([1, 0.5, 0, 0.75]);
    expect(setColorKeyR16(com, 1, [0, 0, 1])[1]!.value).toEqual([0, 0, 1, 0.75]);
    expect(gradientCssR16(keys).split('%').length - 1).toBe(17);
  });

  it('o nome da forma escolhida, escrito embaixo dos botões', () => {
    const forma = (extra: Record<string, unknown>) => abasDe(extra).find((a) => a.id === 'forma')!.rows[0]!;
    expect(shapeNameLineR16(forma({ shape: 'circle', radiusThickness: 0.3 }).shapes!.buttons)).toBe('Forma: anel — nasce na borda do círculo');
    expect(shapeNameLineR16(forma({ shape: 'forma-que-ninguem-conhece' }).shapes!.buttons)).toBe('Forma: desconhecida — escolha uma acima');
    expect(forma({}).lines).toBe(2);
  });

  // Rodada 38, lote 4 (06/10/2026). O Humberto: "a linha gera na linha, mas o
  // círculo e o quadrado não sei o que fazem nem como controlar". A forma diz
  // onde nasce; agora diz também PARA ONDE sai — a Direção, ou para fora dela.
  it('a linha da forma diz para onde as partículas saem', () => {
    const forma = (extra: Record<string, unknown>) => abasDe(extra).find((a) => a.id === 'forma')!.rows[0]!.shapes!;
    expect(forma({ shape: 'circle' }).exit).toBe('sai para cima');
    expect(forma({ shape: 'circle', direction: 0 }).exit).toBe('sai para a direita');
    expect(forma({ shape: 'circle', direction: 270 }).exit).toBe('sai para baixo');
    expect(forma({ shape: 'circle', direction: 45 }).exit).toBe('sai a 45°');
    expect(forma({ shape: 'rectangle', spherizeDirection: 1 }).exit).toBe('sai para fora');
    expect(forma({ shape: 'circle', spherizeDirection: 0.5 }).exit).toBe('sai meio para fora');
    // A linha que se vê é curta, para caber inteira em 1280×720 (~40 letras).
    const linha = (extra: Record<string, unknown>): string => { const s = forma(extra); return shapeSummaryLineR16(s.buttons, s.exit!); };
    expect(linha({ shape: 'circle' })).toBe('Círculo: nasce no disco, sai para cima');
    expect(linha({ shape: 'circle', radiusThickness: 0.2, arc: 90, spherizeDirection: 1 })).toBe('Arco: nasce no arco, sai para fora');
    for (const shape of ['point', 'rectangle', 'circle', 'edge', 'bone', 'path']) expect(linha({ shape, direction: 45 }).length, shape).toBeLessThanOrEqual(40);
  });

  it('escolher o Arco dá um arco cheio, venha de onde vier (antes herdava a espessura do Anel)', () => {
    const arco = abasDe({ shape: 'circle', radiusThickness: 0.2 }).find((a) => a.id === 'forma')!.rows[0]!.shapes!.buttons.find((b) => b.id === 'arc')!;
    expect(arco.writes).toMatchObject({ shape: 'circle', arc: 90, radiusThickness: 1 });
  });
});

describe('as rajadas (rodada 16, lote 5)', () => {
  it('moram na aba Nascer, numa linha só', () => {
    const nascer = buildProperties(comEmissorR16(), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] })
      .tabs!.find((a) => a.id === 'nascer')!;
    const linha = nascer.rows.find((r) => r.label === 'Rajadas')!;
    expect(linha.fields[0]!.kind).toBe('bursts');
    expect(linha.lines ?? 1).toBe(1);
  });

  it('ler com os padrões, resumir numa frase, contar as partículas', () => {
    const lista = readBurstsR16([{ time: 0.5, count: 12, cycles: 3, interval: 0.2, probability: 0.5 }, { count: 4 }]);
    expect(lista[1]).toEqual({ time: 0, count: 4, cycles: 1, interval: 1, probability: 1 });
    expect(burstSummaryR16(lista[0]!)).toBe('em 0,5 s · 12 · ×3 a cada 0,2 s · 50%');
    expect(burstSummaryR16(lista[1]!)).toBe('em 0 s · 4');
    expect(burstsLineR16(lista)).toBe('2 rajadas · 40 partículas');
    expect(burstsLineR16([])).toBe('nenhuma');
  });

  it('pôr, tirar e mudar, dentro dos limites do schema', () => {
    const uma = addBurstR16([]);
    expect(uma).toEqual([{ time: 0, count: 10, cycles: 1, interval: 1, probability: 1 }]);
    expect(addBurstR16(uma)[1]!.time).toBe(0.5);
    expect(removeBurstR16(addBurstR16(uma), 0).map((b) => b.time)).toEqual([0.5]);
    expect(setBurstFieldR16(uma, 0, 'count', 2.6)[0]!.count).toBe(3);
    expect(setBurstFieldR16(uma, 0, 'count', -5)[0]!.count).toBe(1);
    expect(setBurstFieldR16(uma, 0, 'interval', 0)[0]!.interval).toBe(1);
    expect(setBurstFieldR16(uma, 0, 'probability', 7)[0]!.probability).toBe(1);
    expect(setBurstFieldR16(uma, 0, 'time', -1)[0]!.time).toBe(0);
    expect(setBurstFieldR16(uma, 0, 'cycles', 5e9)[0]!.cycles).toBe(1048576);
  });
});

// ---------------------------------------------------------------------------
// Os seis consertos da conferência — rodada 16 (05/10/2026)
// ---------------------------------------------------------------------------

describe('os consertos da conferência das partículas (rodada 16)', () => {
  const seletorDe = (extra: Record<string, unknown>) =>
    buildProperties(comEmissorR16(extra), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] })
      .tabs!.find((a) => a.id === 'forma')!.rows[0]!.shapes!.buttons;
  const botao = (extra: Record<string, unknown>, id: string) => seletorDe(extra).find((b) => b.id === id)!;

  it('1. retângulo, linha e círculo nascem com um tamanho que se vê — só quando o de agora é zero', () => {
    expect(botao({}, 'rectangle').writes).toEqual({ shape: 'rectangle', size: [60, 40] });
    expect(botao({}, 'edge').writes).toEqual({ shape: 'edge', edge: [-30, 0, 30, 0] });
    expect(botao({}, 'circle').writes).toEqual({ shape: 'circle', radius: 30, radiusThickness: 1, arc: 360 });
    // O número que a pessoa pôs fica.
    expect(botao({ size: [80, 40] }, 'rectangle').writes).toEqual({ shape: 'rectangle' });
    expect(botao({ edge: [0, 0, 5, 0] }, 'edge').writes).toEqual({ shape: 'edge' });
    expect(botao({ radius: 8 }, 'ring').writes).toEqual({ shape: 'circle', radiusThickness: 0.2, arc: 360 });
  });

  it('2. digitar e puxar são passos separados no desfazer', () => {
    const doc = new DocR15(comEmissorR16({ shape: 'rectangle' }));
    const ptr = '/skins/0/attachments/fogo/fogo/size';
    doc.run(new SetProperty(ptr, [80, 40], 'Mudar Retângulo', 'structure'));
    doc.endMerge(); // o que o painel faz depois de cada escrita fora do arrasto
    doc.run(new SetProperty(ptr, [90, 40], 'Mudar retângulo', 'structure'));
    doc.run(new SetProperty(ptr, [100, 50], 'Mudar retângulo', 'structure'));
    doc.undo();
    expect(getAtPointer(doc.file, ptr)).toEqual([80, 40]);
    // E o defeito existia: sem fechar a junção, um desfazer voltava a 0·0 (regra 26).
    const sem = new DocR15(comEmissorR16({ shape: 'rectangle' }));
    sem.run(new SetProperty(ptr, [80, 40], 'x', 'structure'));
    sem.run(new SetProperty(ptr, [100, 50], 'x', 'structure'));
    sem.undo();
    expect(getAtPointer(sem.file, ptr)).toBeUndefined();
  });

  it('5. o teto que corta é dito na linha do Máximo de vivas, com o número', () => {
    const nascer = (extra: Record<string, unknown>) =>
      buildProperties(comEmissorR16(extra), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] })
        .tabs!.find((a) => a.id === 'nascer')!.rows;
    const corta = nascer({ rate: 200, lifetime: [0.5, 2], maxParticles: 200 }).find((r) => r.fields[0]!.key === 'maxParticles')!;
    // Segunda conferência, defeito 7 (reescrito de propósito): o rótulo diz o
    // nome do campo, "Máximo de vivas", e o número, em duas linhas curtas.
    expect(corta.label).toBe('Máximo de vivas\ncorta 200');
    expect(corta.problem).toContain('~400 vivas');
    expect(corta.problem).toContain('Máximo de vivas é 200');
    const cabe = nascer({ rate: 40, lifetime: [0.5, 0.9], maxParticles: 200 }).find((r) => r.fields[0]!.key === 'maxParticles')!;
    expect(cabe.problem).toBeUndefined();
    expect(capCuttingR16({ rate: 0, bursts: [{ count: 30, cycles: 2 }], maxParticles: 50 })).toEqual({ vivas: 60, teto: 50 });
    expect(capCuttingR16({ emitting: false, rate: 999, maxParticles: 5 })).toBeNull();
  });

  it('6. o Espaço tem rótulo curto na lista, e a frase inteira na dica', () => {
    const espaco = attachmentFields(comEmissorR16(), 'fogo', 'fogo').flatMap((g) => g.fields).find((f) => f.key === 'space')!;
    expect(espaco.options!.map((o) => o.label)).toEqual(['do emissor', 'do mundo']);
    expect(espaco.hint).toContain('a gravidade fica no mundo');
    const file = comEmissorR16();
    expect(emittersOnBoneR16(file, 'root')).toEqual(['fogo']);
    expect(emittersOnBoneR16(file, 'outro')).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// O selo de peso — rodada 16, lote 6
// ---------------------------------------------------------------------------

describe('o selo de peso do emissor (rodada 16, lote 6)', () => {
  it('as vivas: taxa vezes a vida mais longa, mais a pior janela de rajadas, até o teto', () => {
    expect(emitterLiveEstimateR16({ rate: 40, lifetime: [0.5, 0.9] })).toBe(36);
    const duas = [{ time: 0, count: 10 }, { time: 0.5, count: 10 }];
    expect(emitterLiveEstimateR16({ rate: 40, lifetime: [0.5, 0.9], bursts: duas })).toBe(56);
    // Uma vida inteira separa as duas: nunca vivas juntas.
    expect(emitterLiveEstimateR16({ rate: 0, lifetime: [0.9, 0.9], bursts: [{ time: 0, count: 10 }, { time: 0.9, count: 10 }] })).toBe(10);
    expect(emitterLiveEstimateR16({ rate: 0, lifetime: [1, 1], bursts: [{ time: 0, count: 10, probability: 0.5 }] })).toBe(5);
    expect(emitterLiveEstimateR16({ rate: 40, lifetime: [1, 1], maxParticles: 30 })).toBe(30);
    expect(emitterLiveEstimateR16({ emitting: false, rate: 999, lifetime: [1, 1], bursts: [{ count: 7 }] })).toBe(7);
    // Sem nada: os padrões da extensão (taxa 10, vida 1).
    expect(emitterLiveEstimateR16({})).toBe(10);
  });

  it('a palavra: leve até 60, médio até 150, pesado acima; o boneco 100 e 300', () => {
    const w = (n: number) => emitterWeightR16({ rate: n, lifetime: [1, 1], maxParticles: 10000 }).palavra;
    expect([w(60), w(61), w(150), w(151)]).toEqual(['leve', 'médio', 'médio', 'pesado']);
    expect(emitterWeightR16({ rate: 100, lifetime: [1, 1] }).ms).toBe(5);
    const dois = comEmissorR16({ rate: 160, lifetime: [1, 1] });
    (dois.skins as unknown as Array<{ attachments: Record<string, Record<string, unknown>> }>)[0]!.attachments.fogo!.outro =
      { type: 'BONE_particle', rate: 160, lifetime: [1, 1] };
    expect(skeletonWeightR16(dois)).toEqual({ vivas: 320, palavra: 'pesado', ms: 16 });
  });

  it('a barra de avisos diz o pesado, com o número; o médio fica no selo', () => {
    const leve = comEmissorR16({ rate: 40, lifetime: [1, 1] });
    expect(weightWarningLinesR16(leve)).toEqual([]);
    const pesado = comEmissorR16({ rate: 400, lifetime: [1, 1] });
    const linhas = weightWarningLinesR16(pesado);
    expect(linhas[0]).toContain('pesado — ~400 partículas');
    expect(linhas[1]).toContain('o boneco: pesado');
  });

  it('a ficha leva o selo com palavra, e a dica diz de onde vem a conta', () => {
    const model = buildProperties(comEmissorR16({ rate: 100, lifetime: [1, 1] }), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] });
    expect(weightBadgeR16(model.weight!.emissor)).toBe('médio · 100');
    const dica = weightHintR16(model.weight!.emissor, model.weight!.boneco);
    expect(dica).toContain('~50 µs');
    expect(dica).toContain('~5 ms por quadro');
    expect(dica).toContain('Só avisa');
  });
});

// ---------------------------------------------------------------------------
// Emitindo na linha do tempo e a folha de quadros — rodada 16, lote 9
// ---------------------------------------------------------------------------

describe('Emitindo vira chave, e a folha de quadros (rodada 16, lote 9)', () => {
  const comAnimacao = (): BoneFile => {
    const file = comEmissorR16();
    (file as unknown as { animations: unknown[] }).animations = [{ name: 'soprar', timelines: [] }];
    return file;
  };
  const alvo = { type: 'BONE_particle', target: 'fogo', skin: 'default', attachment: 'fogo', property: 'emitting' };

  it('o ponteiro do Emitindo é a timeline BONE_particle da extensão, e volta', () => {
    const file = comEmissorR16();
    expect(targetForPointerR16(file, '/skins/0/attachments/fogo/fogo/emitting')).toEqual(alvo);
    expect(targetForPointerR16(file, '/skins/0/attachments/fogo/fogo/rate')).toBeNull();
    expect(setupPointerForR16(file, alvo)).toBe('/skins/0/attachments/fogo/fogo/emitting');
    const imagem = comEmissorR16();
    (imagem.skins as unknown as Array<{ attachments: Record<string, Record<string, unknown>> }>)[0]!.attachments.fogo!.fogo = { type: 'region' };
    expect(targetForPointerR16(imagem, '/skins/0/attachments/fogo/fogo/emitting')).toBeNull();
  });

  it('numa animação, desmarcar Emitindo grava CHAVE no formato da conformidade (P-016), e a base fica', () => {
    const doc = new DocR15(comAnimacao());
    doc.animation = 'soprar';
    doc.time = 0.5;
    const campo = attachmentFields(doc.file, 'fogo', 'fogo').flatMap((g) => g.fields).find((f) => f.key === 'emitting')!;
    writeFieldValueR16(doc, campo, false);
    const tl = (doc.file.animations![0]!.timelines as unknown as Array<Record<string, unknown>>)[0]!;
    expect({ ...tl, keys: undefined }).toEqual({ ...alvo, keys: undefined });
    // A chave do começo nasce junto, com o valor da base (ligado), para o antes
    // de 0,5 s ficar como estava — o mesmo par do caso P-016.
    const chaves = tl.keys as Array<Record<string, unknown>>;
    expect(chaves.map((k) => [k.time, k.value])).toEqual([[0, true], [0.5, false]]);
    for (const k of chaves) expect(k.curve === undefined || k.curve === 'stepped').toBe(true);
    // A base não muda: o anexo continua sem `emitting` (o padrão, ligado).
    expect(getAtPointer(doc.file, '/skins/0/attachments/fogo/fogo/emitting')).toBeUndefined();
    doc.undo();
    expect(((doc.file.animations![0]!.timelines ?? []) as unknown[]).length).toBe(0);
  });

  it('a linha aparece na folha de chaves, com o nome do emissor; apaga, copia e arrasta como as outras', () => {
    const doc = new DocR15(comAnimacao());
    doc.animation = 'soprar';
    const campo = attachmentFields(doc.file, 'fogo', 'fogo').flatMap((g) => g.fields).find((f) => f.key === 'emitting')!;
    doc.time = 0;
    writeFieldValueR16(doc, campo, true);
    doc.time = 0.5;
    writeFieldValueR16(doc, campo, false);
    const grupos = dopesheetGroupsR16(doc.file, 'soprar');
    expect(grupos.map((g) => g.label)).toEqual(['Emissor fogo / fogo']);
    expect(grupos[0]!.rows.map((r) => [r.label, r.times])).toEqual([['Emitindo', [0, 0.5]]]);
    const file = doc.file;
    const refs = [{ target: alvo, time: 0.5 }];
    moveKeysR16(file, 'soprar', refs, 0.25);
    expect(grupos.length).toBe(1);
    expect(dopesheetGroupsR16(file, 'soprar')[0]!.rows[0]!.times).toEqual([0, 0.75]);
    const clip = copyKeysR16(file, 'soprar', [{ target: alvo, time: 0.75 }]);
    pasteKeysR16(file, 'soprar', clip, 1.5);
    expect(dopesheetGroupsR16(file, 'soprar')[0]!.rows[0]!.times).toEqual([0, 0.75, 1.5]);
    expect(removeKeyR16(file, 'soprar', 0.75, alvo)).toBe(true);
    expect(dopesheetGroupsR16(file, 'soprar')[0]!.rows[0]!.times).toEqual([0, 1.5]);
  });

  it('a folha de quadros: três números numa linha; zero quadros tira a folha; sem folha, os campos dela esperam', () => {
    const abas = (extra: Record<string, unknown>) => buildProperties(comEmissorR16(extra), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] })
      .tabs!.find((a) => a.id === 'imagem')!.rows;
    expect(abas({}).map((r) => r.label)).toEqual(['Imagem', 'Folha de quadros']);
    expect(abas({}).find((r) => r.label === 'Folha de quadros')!.fields.map((f) => f.key)).toEqual(['sequenceCount', 'sequenceStart', 'sequenceDigits']);
    expect(abas({ sequence: { count: 8 } }).map((r) => r.label)).toEqual(['Imagem', 'Folha de quadros', 'A folha corre', 'Voltas na vida', 'Quadro inicial']);
    const file = comEmissorR16({ sequence: { count: 8, start: 1, digits: 2 } });
    const ptr = '/skins/0/attachments/fogo/fogo/sequence';
    const doc = { file } as unknown as EditorDoc;
    sequenceCommandR16(file, ptr, 'count', 12).apply(doc);
    expect(getAtPointer(file, ptr)).toEqual({ count: 12, start: 1, digits: 2 });
    sequenceCommandR16(file, ptr, 'count', 0).apply(doc);
    expect(getAtPointer(file, ptr)).toBeUndefined();
    const nova = comEmissorR16();
    sequenceCommandR16(nova, ptr, 'digits', 2).apply({ file: nova } as unknown as EditorDoc);
    expect(getAtPointer(nova, ptr)).toEqual({ digits: 2, count: 1 });
  });
});

// ---------------------------------------------------------------------------
// A segunda conferência das partículas — rodada 16 (05/10/2026)
// ---------------------------------------------------------------------------

describe('os consertos da segunda conferência das partículas (rodada 16)', () => {
  it('1. a janela das rajadas fica inteira dentro da tela: embaixo quando cabe, senão em cima', () => {
    const janela = { width: 400, height: 200 };
    expect(burstWindowPlaceR16({ left: 100, top: 300, bottom: 324 }, janela, 1920, 1080)).toEqual({ left: 100, top: 326 });
    // Perto do pé da tela (o caso da conferência): abre em cima do botão.
    expect(burstWindowPlaceR16({ left: 100, top: 950, bottom: 974 }, janela, 1920, 1080)).toEqual({ left: 100, top: 748 });
    // Perto da borda direita: encosta nela, sem passar.
    expect(burstWindowPlaceR16({ left: 1700, top: 300, bottom: 324 }, janela, 1920, 1080).left).toBe(1516);
    // Tela baixa demais para os dois lados: fica dentro, de cima para baixo.
    expect(burstWindowPlaceR16({ left: 10, top: 100, bottom: 124 }, { width: 400, height: 700 }, 1280, 720).top).toBe(4);
  });

  it('5. os três números da folha têm nome curto ao lado: qtd. · 1º · díg.', () => {
    const imagem = buildProperties(comEmissorR16(), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] })
      .tabs!.find((a) => a.id === 'imagem')!;
    const folha = imagem.rows.find((r) => r.label === 'Folha de quadros')!;
    expect(folha.fields.map((f) => f.short)).toEqual(['qtd.', '1º', 'díg.']);
    // Rodada 38, lote 3 (reescrito de propósito): o nome inteiro, e depois a medida.
    expect(folha.fields.map((f) => (f.hint ?? f.label).split(' — ')[0])).toEqual(['Folha: quadros', 'Folha: primeiro número', 'Folha: dígitos']);
  });

  it('7. o Máximo de vivas que corta: cada linha do rótulo cabe na coluna (17 letras)', () => {
    const nascer = buildProperties(comEmissorR16({ rate: 10000, lifetime: [1, 1], maxParticles: 200 }), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] })
      .tabs!.find((a) => a.id === 'nascer')!;
    const corta = nascer.rows.find((r) => r.fields[0]!.key === 'maxParticles')!;
    expect(corta.label).toBe('Máximo de vivas\ncorta 9800');
    for (const linha of corta.label.split('\n')) expect(linha.length).toBeLessThanOrEqual(17);
    expect(corta.problem).toMatch(/^O Máximo de vivas corta/);
  });
});

// ---------------------------------------------------------------------------
// O caminho no editor — rodada 16, lote 8
// ---------------------------------------------------------------------------

describe('a forma caminho no editor (rodada 16, lote 8)', () => {
  /** Um emissor no slot "fogo" e um caminho reto de 300 px no slot "trilha". */
  const comCaminho = (extra: Record<string, unknown> = {}): BoneFile => {
    const file = comEmissorR16(extra);
    (file.slots as unknown as Array<Record<string, unknown>>).push({ name: 'trilha', bone: 'root', attachment: 'reta' });
    (file.skins as unknown as Array<{ attachments: Record<string, Record<string, unknown>> }>)[0]!.attachments.trilha = {
      reta: { type: 'path', vertices: [0, 0, 0, 0, 100, 0, 200, 0, 300, 0, 300, 0], lengths: [300] },
    };
    return file;
  };
  const forma = (file: BoneFile) => buildProperties(file, { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] })
    .tabs!.find((a) => a.id === 'forma')!;
  const botao = (file: BoneFile) => forma(file).rows[0]!.shapes!.buttons.find((b) => b.id === 'path')!;

  it('a lista dos caminhos vem de QUALQUER slot, com o nome que a pessoa conhece', () => {
    const file = comCaminho();
    expect(pathOptionsR16(file)).toEqual([{ value: 'trilha/reta', label: 'reta (slot trilha)' }]);
    const igual = comCaminho();
    const pele = (igual.skins as unknown as Array<{ attachments: Record<string, Record<string, unknown>> }>)[0]!.attachments;
    pele.capa = { capa: { type: 'path', vertices: [], lengths: [] } };
    expect(pathOptionsR16(igual).map((o) => o.label)).toEqual(['reta (slot trilha)', 'capa']);
  });

  it('o botão Caminho acende com um caminho no boneco, e grava o primeiro; sem nenhum, cinza dizendo por quê', () => {
    expect(botao(comEmissorR16()).disabled).toMatch(/não tem nenhum caminho/);
    const aceso = botao(comCaminho());
    expect(aceso.disabled).toBeUndefined();
    expect(aceso.writes).toEqual({ shape: 'path', curve: 'trilha/reta' });
    // O caminho escolhido antes fica.
    expect(botao(comCaminho({ curve: 'outro/qualquer' })).writes).toEqual({ shape: 'path' });
    // Rodada 38, lote 4 (reescrito de propósito): e o "para fora" da forma.
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    expect(forma(comCaminho({ shape: 'path', curve: 'trilha/reta' })).rows.map((r) => r.label)).toEqual(['Forma', 'Caminho', 'Para fora']);
  });

  it('sem caminho escolhido, ou com o caminho apagado ou renomeado: o programa diz, e não finge', () => {
    const sem = new DocR15(comCaminho({ shape: 'path' }));
    const emSem = sem.skeleton!.findSlot('fogo')!.attachment;
    expect(emitterProblemR16(emSem as never, sem.skeleton!)?.short).toBe('sem caminho');
    const certo = new DocR15(comCaminho({ shape: 'path', curve: 'trilha/reta' }));
    // O emissor de teste não tem imagem (o aviso "sem imagem" é outro): aqui só
    // importa que o caminho que existe não acende aviso de caminho.
    expect(['sem caminho', 'caminho sumiu']).not.toContain(emitterProblemR16(certo.skeleton!.findSlot('fogo')!.attachment as never, certo.skeleton!)?.short);
    const sumiu = new DocR15(comCaminho({ shape: 'path', curve: 'trilha/curva-velha' }));
    const mal = emitterProblemR16(sumiu.skeleton!.findSlot('fogo')!.attachment as never, sumiu.skeleton!)!;
    expect(mal.short).toBe('caminho sumiu');
    expect(mal.problem).toContain('"trilha/curva-velha"');
    expect(pathExistsR16(certo.skeleton!, 'trilha/reta')).toBe(true);
    expect(pathExistsR16(certo.skeleton!, 'fogo/fogo')).toBe(false);
  });

  it('a cena destaca o caminho: 10 retas por curva, a régua do leitor (§9.4.2)', () => {
    // Âncoras (0,0) e (300,0), alças nos terços: a reta cai em x = 0, 30 … 300.
    const linha = pathPolylineR16([0, 0, 0, 0, 100, 0, 200, 0, 300, 0, 300, 0], false);
    expect(linha.length).toBe(22);
    expect(linha.filter((_, i) => i % 2 === 0).map((x) => Math.round(x))).toEqual([0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300]);
    // Fechado: a curva que volta entra (mais 10 pontos).
    expect(pathPolylineR16([0, 0, 0, 0, 100, 0, 200, 0, 300, 0, 300, 0], true).length).toBe(42);
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, lote 3: os pequenos da ficha
// ---------------------------------------------------------------------------

describe('rodada 17, lote 3: a ficha', () => {
  const ficha = readFileSync(resolve(__dirname, '../src/panels/properties.ts'), 'utf8');

  it('o Esc fecha a janela das Rajadas de onde estiver o foco (antes: só com o foco dentro dela)', () => {
    expect(ficha).toContain("document.addEventListener('keydown', escDaJanela, true);");
    expect(ficha).toContain("document.removeEventListener('keydown', escDaJanela, true);");
    expect(ficha).not.toContain("janela.addEventListener('keydown', (e) => {");
  });

  it('a linha de três números põe o rótulo em cima (o último nome não corta mais)', () => {
    expect(ficha).toContain("if (campos.length > 2) row.classList.add('prop-linha-faixa-larga');");
    const css = readFileSync(resolve(__dirname, '../src/panels/properties.css'), 'utf8');
    expect(css).toContain('.prop-linha.prop-linha-faixa-larga {');
  });

  it('decisão do Diretor (05/10): o X e o Y da ficha de uma imagem com osso próprio são o PIVÔ — não mudam ao escalar nem ao girar', () => {
    // O gesto da conferência (R7 da rodada 29): idle, quadro 10, leg_front.
    const doc = new DocR15(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    doc.animation = 'idle';
    doc.time = 10 / 30;
    doc.repose();
    const subject = quickSubjectL8({ ...emptySelection(), slots: ['leg_front'], attachments: [{ slot: 'leg_front', attachment: Object.keys(doc.file.skins![0]!.attachments!['leg_front']!)[0]! }] });
    const campo = (key: string) => quickFieldsL8(doc.file, subject!).find((f) => f.key === key)!;
    writeQuickValueL8(doc, campo('x'), 40);
    expect(readQuickNowL8(doc, campo('x')).frame).toBeCloseTo(40, 6);
    writeQuickValueL8(doc, campo('scaleX'), 1.5);
    expect(readQuickNowL8(doc, campo('scaleX')).frame).toBeCloseTo(1.5, 6);
    // Antes: 50,5 — o X era o centro da imagem, que anda quando a escala gira em volta do pivô.
    expect(readQuickNowL8(doc, campo('x')).frame).toBeCloseTo(40, 6);
    writeQuickValueL8(doc, campo('rotation'), 30);
    expect(readQuickNowL8(doc, campo('x')).frame).toBeCloseTo(40, 6);
    expect(readQuickNowL8(doc, campo('y')).frame).toBeCloseTo(0, 6);
    const quick = readFileSync(resolve(__dirname, '../src/panels/quick-model.ts'), 'utf8');
    expect(quick).not.toContain('centerMovedNotice');
  });
});

// Rodada 38, lote 3 (conferência da v30.3, doc 31): a barrinha ao lado da cor
// só dizia "transparência", sem número nem faixa. A régua do `26` pede os dois.
describe('a barrinha da cor diz o número e a faixa', () => {
  it('diz quanto está, de 0 a 100 %, e o que são as pontas', () => {
    expect(alphaTip('Cor do emissor', 100)).toBe('Cor do emissor, opacidade: 100 % (de 0 a 100 %: 0 é invisível, 100 é cheia)');
    expect(alphaTip('Cor ao nascer (de)', 35)).toMatch(/opacidade: 35 % \(de 0 a 100 %/);
  });
});

// Rodada 38, lote 4b — conferência da v30.5 (doc 33). Três números sem unidade
// ou faixa (Lugar X·Y, o Giro do emissor, o Tremor), o número da opacidade que
// não aparecia na tela, e quatro dicas que não explicavam a um usuário novo.
describe('as dicas que explicam, e os números do Lugar (doc 33)', () => {
  const sel = { ...emptySelection(), slots: ['fogo'] };
  it('X, Y e o Ângulo do emissor dizem a unidade e a faixa', () => {
    const campos = quickFieldsL8(comEmissorR16(), quickSubjectL8(sel));
    const dica = (k: string): string => campos.find((f) => f.key === k)!.hint;
    expect(dica('x')).toMatch(/px/);
    expect(dica('x')).toMatch(/qualquer número/);
    expect(dica('rotation')).toMatch(/graus, de 0 a 360/);
  });

  it('o Tremor diz a unidade; Explosão, Vira com o voo e Na frente explicam numa frase inteira', () => {
    const abas = buildProperties(comEmissorR16(), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] }).tabs!;
    const campo = (k: string) => abas.flatMap((a) => a.rows).flatMap((r) => r.fields).find((f) => f.key === k)!;
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    expect(campo('randomness').hint).toMatch(/em % do intervalo/);
    expect([campo('randomness').unit, campo('randomness').scale]).toEqual(['%', 100]);
    expect(campo('explosiveness').hint).toMatch(/no mesmo instante/);
    expect(campo('alignToVelocity').hint).toMatch(/aponta para onde vai/);
    expect(campo('sortMode').hint).toMatch(/acabaram de nascer/);
  });

  it('a opacidade se lê na tela, ao lado da barrinha: "100 %"', () => {
    expect(alphaShown(100)).toBe('100 %');
    expect(alphaShown(34.6)).toBe('35 %');
  });
});

// Rodada 38, lote 5 — o objetivo da rodada: fazer fumaça, fogo e faísca do
// zero. Os tropeços do conferente da v30.7 (doc 35): o vazio quase não se via,
// nada dizia quanto é muita velocidade, a Cor na vida era uma barra branca sem
// marcas, e não se via que os exemplos são um ponto de partida.
describe('do zero até a fumaça: a porta, o vazio e as dicas (rodada 38, lote 5)', () => {
  it('cada exemplo diz na dica que é um emissor novo, e o que o faz ser o que é', () => {
    const itens = particleMenuItems();
    for (const item of itens.slice(1)) expect(item.hint, item.label).toMatch(/^Um emissor novo, já como/);
    const fumaca = itens.find((i) => i.label === 'Novo: fumaça')!.hint;
    expect(fumaca).toMatch(/vida longa \(1,8 a 2,6 s\)/);
    expect(fumaca).toMatch(/sobe devagar \(30 a 55 px\/s\)/);
  });

  it('o emissor vazio nasce com valores que se veem no fundo claro', () => {
    const f = EMPTY_PRESET.fields as Record<string, unknown>;
    expect(f['rate']).toBeGreaterThanOrEqual(15);
    expect((f['scale'] as number[])[0]).toBeGreaterThanOrEqual(1.2);
    for (const cor of f['startColor'] as number[][]) expect(Math.min(cor[0]!, cor[1]!, cor[2]!)).toBeLessThanOrEqual(0.6);
  });

  it('a Velocidade diz o que é típico, e a frase da saída diz onde se muda a direção', () => {
    expect(MEDIDA['speed']).toMatch(/fumaça 30 a 60/);
    expect(shapeExitTitle('Forma: linha — nasce ao longo de um segmento', 'sai para cima')).toBe(
      'Forma: linha — nasce ao longo de um segmento · sai para cima. A direção se muda na aba Movimento; "Para fora" faz sair da forma');
  });

  it('a Cor na vida sem cor nenhuma diz o que vale e como pôr uma', () => {
    expect(emptyGradientSays()).toBe('Sem cor na vida: vale a Cor ao nascer. Clique na barra para pôr uma cor');
    // Doc 37: a barrinha da faixa de duas cores não mostrava o número. Arrastando, o rodapé diz.
    expect(alphaDragSays('Cor ao nascer (até)', 42.4)).toBe('Cor ao nascer (até): opacidade 42 %');
    // E a janela da explosão diz que é o tempo da explosão INTEIRA (doc 37).
    expect(MEDIDA['duration']).toMatch(/explosão inteira/);
    expect(MEDIDA['duration']).toMatch(/Não é a Vida/);
    // Dentro da barra cabe pouco: a versão curta, e a frase inteira na dica.
    expect(EMPTY_GRADIENT_SHORT.length).toBeLessThanOrEqual(20);
  });
});

// Rodada 38, lote 6 — a prova final (doc 38): a Faísca pronta era quase
// invisível; a dica do menu de cima dizia o que é, e não os números; o Tamanho
// não dizia o que é típico, como a Velocidade já diz.
describe('a prova final das partículas (rodada 38, lote 6)', () => {
  it('a faísca pronta se vê de primeira: mais faíscas, maiores, de cor cheia', () => {
    const f = presetById('faisca')!.fields as Record<string, unknown>;
    const rajada = (f['bursts'] as Array<{ count: number }>)[0]!;
    expect(rajada.count).toBeGreaterThanOrEqual(36);
    expect(SOFT_DOT_SIZE * (f['scale'] as number[])[0]!).toBeGreaterThanOrEqual(22);
    // Cor cheia, e não pálida: o fundo da cena é claro.
    for (const cor of f['startColor'] as number[][]) expect(Math.min(cor[1]!, cor[2]!)).toBeLessThanOrEqual(0.3);
  });

  it('as portas do menu de cima dizem os números, como as da barra', () => {
    const itens = particlesMenu().filter((i) => 'action' in i && String((i as { action: string }).action).startsWith('particulas-'));
    expect(itens).toHaveLength(4);
    for (const i of itens) expect((i as { hint: string }).hint, (i as { label: string }).label).toMatch(/vida .*s\).*px\/s/);
  });

  it('o Tamanho diz o que é típico', () => {
    expect(MEDIDA['scale']).toMatch(/Típico: fumaça 1,6 a 2,2.*fogo 1,6 a 2,4.*faísca 0,7 a 1,1/);
  });
});

// Rodada 42, lote 1 — as sobras das partículas (doc 41). A faísca do vazio
// custou 16 passos e saiu numa coluna: ninguém dizia da Abertura. A faísca,
// pronta ou do vazio, sumia no fundo claro. A dica da Poeira não dizia a cor.
describe('as sobras das partículas (rodada 42, lote 1)', () => {
  const abasR42 = (): SheetTabR16[] => buildProperties(comEmissorR16({}), { ...emptySelection(), attachments: [{ slot: 'fogo', attachment: 'fogo' }] }).tabs!;

  it('a receita da faísca diz a Abertura: na porta, na Velocidade e no Tamanho', () => {
    const porta = particlesMenu().find((i) => 'action' in i && (i as { action: string }).action === 'particulas-faisca') as { hint: string };
    expect(porta.hint).toMatch(/Abertura 180/);
    expect(presetById('faisca')!.hint).toMatch(/Abertura 180/);
    expect(MEDIDA['speed']).toMatch(/faísca 180 a 320.*Abertura 180/);
    expect(MEDIDA['scale']).toMatch(/faísca 0,7 a 1,1.*Abertura 180/);
  });

  it('o campo Abertura tem dica com a unidade, a faixa e o típico, e diz o que é o 0', () => {
    // Rodada 47, lote 2 (reescrito de propósito): a unidade saiu do rótulo e mora depois da caixa (R2 do doc 68).
    const linha = abasR42().find((a) => a.id === 'movimento')!.rows.find((r) => r.label === 'Abertura ±')!;
    const dica = linha.fields[0]!.hint!;
    expect(dica).toMatch(/em graus, de 0 a 180/);
    expect(dica).toMatch(/Típico: fogo 12, fumaça 20, poeira 60, faísca 180/);
    expect(dica).toMatch(/0 .*coluna/);
  });

  it('a faísca pronta escurece no fim da vida e não some antes: se vê no fundo claro', () => {
    const f = presetById('faisca')!.fields as Record<string, unknown>;
    const cor = (f['startColor'] as number[][])[0]!;
    const naVida = f['colorOverLifetime'] as Array<{ time: number; value: number[] }>;
    expect(naVida, 'a faísca pronta precisa de cor na vida').toBeDefined();
    const fim = naVida.at(-1)!;
    // A cor que se desenha no fim: cor ao nascer × cor na vida (§9.7).
    const lum = 0.2126 * cor[0]! * fim.value[0]! + 0.7152 * cor[1]! * fim.value[1]! + 0.0722 * cor[2]! * fim.value[2]!;
    expect(lum, 'escura no fim, contra o fundo claro').toBeLessThanOrEqual(0.25);
    // A opacidade aguenta até 70 % da vida: o escuro chega a ser visto.
    const alfa = f['alphaOverLifetime'] as Array<{ time: number; value: number }>;
    const em = (t: number): number => {
      const i = alfa.findIndex((k) => k.time >= t);
      if (i <= 0) return alfa[Math.max(i, 0)]!.value;
      const a = alfa[i - 1]!, b = alfa[i]!;
      return a.value + (b.value - a.value) * ((t - a.time) / (b.time - a.time));
    };
    expect(em(0.7)).toBeGreaterThanOrEqual(0.8);
  });

  it('a dica da Poeira diz a cor, na porta e no modelo', () => {
    const porta = particlesMenu().find((i) => 'action' in i && (i as { action: string }).action === 'particulas-poeira') as { hint: string };
    expect(porta.hint).toMatch(/bege/);
    expect(presetById('poeira')!.hint).toMatch(/bege/);
    expect(MEDIDA['scale']).toMatch(/poeira 0,5 a 0,9/);
  });

  it('a receita da faísca do vazio diz cores que se veem: laranja e vermelho, nunca branco', () => {
    expect(MEDIDA['spread']).toMatch(/faísca 180/);
    const porta = particlesMenu().find((i) => 'action' in i && (i as { action: string }).action === 'particulas-faisca') as { hint: string };
    expect(porta.hint).toMatch(/escurece/);
  });
});

// Rodada 42, v32.1 — a ressalva do doc 48: a receita diz COMO escurecer, e a
// caixa da Abertura tem a dica, não só a palavra.
describe('a receita diz como escurecer, e a caixa tem dica (rodada 42, doc 48)', () => {
  it('a porta da Faísca e a do Fogo dizem como se mexe na barra Cor na vida', () => {
    for (const acao of ['particulas-faisca', 'particulas-fogo']) {
      const porta = particlesMenu().find((i) => 'action' in i && (i as { action: string }).action === acao) as { hint: string };
      expect(porta.hint, acao).toMatch(/Cor na vida.*clique põe as duas pontas.*duplo clique/);
    }
    expect(presetById('faisca')!.hint).toMatch(/Cor na vida.*duplo clique/);
  });

  it('a caixa de um campo de linha só leva a dica dele (a Abertura, ao passar o mouse na caixa)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/properties.ts'), 'utf8');
    expect(fonte).toMatch(/if \(field\.hint !== undefined && controle\.title === ''\) controle\.title = field\.hint;/);
  });
});

// ---------------------------------------------------------------------------
// Rodada 43, lote 1 — a ficha diz o que é, uma vez (doc `51`)
// ---------------------------------------------------------------------------

import * as PM43 from '../src/panels/properties-model.js';
import * as QM43 from '../src/panels/quick-model.js';

const heroi43 = (): BoneFile => JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
const UNIDADES43 = ['px', '°', '×', '%'];
const numeros43 = (grupos: FieldGroup[]): FieldDef[] => grupos.flatMap((g) => g.fields).filter((f) => f.kind === 'number');

describe('rodada 43, lote 1: a ficha diz o que é, uma vez', () => {
  it('todo número das fichas de osso, desenho e malha tem unidade e dica com a unidade', () => {
    const f = heroi43();
    const todos = [...numeros43(PM43.boneFields(f, 'torso')), ...numeros43(PM43.attachmentFields(f, 'body', 'body')), ...numeros43(PM43.attachmentFields(f, 'head', 'face'))];
    expect(todos.length).toBeGreaterThan(8);
    for (const c of todos) {
      expect(UNIDADES43, c.label).toContain((c as any).unit);
      expect((c as any).hint ?? '', c.label).toContain((c as any).unit === '×' ? '×' : (c as any).unit);
    }
  });
  it('a ficha rápida diz a unidade em todo número, no osso e no desenho', () => {
    const f = heroi43();
    for (const sel of [{ kind: 'bone', name: 'torso' }, { kind: 'slot', name: 'body' }] as const) {
      for (const c of QM43.quickFields(f, sel as any).filter((c) => c.pointer !== null)) {
        expect(UNIDADES43, c.label).toContain((c as any).unit);
        expect(c.hint, c.label).toContain((c as any).unit);
      }
    }
  });
  it('a malha não mostra X, Y, Escala nem Ângulo na ficha rápida: eles não mexem nada', () => {
    const chaves = QM43.quickFields(heroi43(), { kind: 'slot', name: 'head' }).map((c) => c.key);
    for (const k of ['x', 'y', 'scaleX', 'scaleY', 'rotation']) expect(chaves).not.toContain(k);
    expect(chaves).toContain('alpha');
  });
  it('um nome só: desenho, pela Árvore e pela Ordem, com a imagem e o osso embaixo', () => {
    const f = heroi43();
    const pelaArvore = PM43.buildProperties(f, { ...emptySelection(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] });
    expect(pelaArvore.title).toBe('Desenho: head');
    expect((pelaArvore as any).subtitle).toBe('imagem face · no osso head');
    const pelaOrdem = PM43.buildProperties(f, { ...emptySelection(), slots: ['head'] });
    expect(pelaOrdem.title).toBe('Desenho: head');
    expect((pelaOrdem as any).subtitle).toBe('imagem face · no osso head');
    const grupos = [...pelaArvore.groups, ...pelaOrdem.groups].map((g) => g.title);
    expect(grupos).not.toContain('Anexo');
    expect(grupos).not.toContain('Slot');
  });
  it('embaixo da ficha rápida, o painel não repete X, Y, giro e escala', () => {
    const f = heroi43();
    const grupos = PM43.belowQuick(PM43.boneFields(f, 'torso'), ['x', 'y', 'scaleX', 'scaleY', 'rotation']);
    const chaves = grupos.flatMap((g: any) => g.fields.map((c: any) => c.key));
    for (const k of ['x', 'y', 'scaleX', 'scaleY', 'rotation']) expect(chaves).not.toContain(k);
    for (const k of ['length', 'shearX', 'shearY', 'name']) expect(chaves).toContain(k);
    expect(grupos.every((g: any) => g.fields.length > 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Rodada 43, lote 2 — o número se mexe e fala (doc `51`)
// ---------------------------------------------------------------------------

import { Doc as Doc43 } from '../src/doc/document.js';

const heroiDoc43 = (): Doc43 => new Doc43(heroi43());

describe('rodada 43, lote 2: o número se mexe e fala', () => {
  it('a conta do campo: 90+15, *2, /2 e +-10 sobre o valor de agora', () => {
    const conta = PM43.evalFieldInput;
    expect(conta('90+15', 90)).toBe(105);
    expect(conta('*2', 30)).toBe(60);
    expect(conta('/2', 30)).toBe(15);
    expect(conta('+-10', 30)).toBe(20);
    expect(conta('+10', 30)).toBe(40);
    expect(conta('-10', 30)).toBe(-10);
    expect(conta('100,5', 0)).toBe(100.5);
    expect(conta('abc', 30)).toBeNull();
    expect(conta('', 30)).toBeNull();
  });
  it('o que não é número avisa, com o valor que ficou e a unidade', () => {
    expect(PM43.notNumberSays('abc', 'Ângulo', '90', '°')).toBe('"abc" não é número: Ângulo ficou 90°');
    expect(PM43.notNumberSays('x', 'X', '0', 'px')).toBe('"x" não é número: X ficou 0 px');
  });
  it('arrastar o rótulo: um passo por pixel, Shift dez, Alt um décimo', () => {
    const arrasta = PM43.scrubValue;
    expect(arrasta(90, 12, 1, {})).toBe(102);
    expect(arrasta(90, 12, 1, { shift: true })).toBe(210);
    expect(arrasta(1, 10, 0.01, {})).toBe(1.1);
    expect(arrasta(90, 12, 1, { alt: true })).toBe(91.2);
    expect(arrasta(0, -3, 1, {})).toBe(-3);
  });
  it('o giro no mundo de um osso, só para ler: soma o giro dos pais', () => {
    const doc = heroiDoc43();
    const mundo = QM43.worldAngleOf(doc, 'torso');
    expect(typeof mundo).toBe('number');
    const raiz = QM43.worldAngleOf(doc, 'hips');
    const local = Number((doc.file.bones ?? []).find((b) => b.name === 'torso')?.rotation ?? 0);
    const hipsLocal = Number((doc.file.bones ?? []).find((b) => b.name === 'hips')?.rotation ?? 0);
    expect(raiz).toBeCloseTo(hipsLocal, 3);
    expect(mundo).toBeCloseTo(hipsLocal + local, 3);
    expect(QM43.worldAngleOf(doc, 'nao-existe')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 2 (doc 68): todo número da ficha diz a unidade e a dica
// ---------------------------------------------------------------------------

/** Um arquivo com uma regra de cada tipo: IK, transformação, caminho, física. */
function arquivoComRegras(): BoneFile {
  return {
    skeleton: { name: 'teste' },
    bones: [
      { name: 'root' }, { name: 'a', parent: 'root', length: 40 }, { name: 'b', parent: 'a', length: 40 },
      { name: 'alvo', parent: 'root' },
    ],
    slots: [{ name: 'trilho', bone: 'root' }],
    constraints: [
      { type: 'ik', name: 'ik1', bones: ['a', 'b'], target: 'alvo' },
      { type: 'transform', name: 'tr1', bones: ['b'], target: 'alvo' },
      { type: 'path', name: 'pa1', bones: ['a'], target: 'trilho' },
      { type: 'physics', name: 'fi1', bone: 'b' },
    ],
  } as unknown as BoneFile;
}

const numeros = (grupos: readonly FieldGroup[]): FieldDef[] =>
  grupos.flatMap((g) => g.fields).filter((f) => f.kind === 'number');

/** O que a régua R2/R4 do doc 68 aceita sem unidade: o rótulo já é a unidade, ou não há unidade física. */
const SEM_UNIDADE = new Set(['strength', 'mass', 'wind', 'gravity', 'fps']);

describe('rodada 47, lote 2: todo número da ficha diz a unidade e a dica', () => {
  it('as quatro regras: nenhum número sem dica, nenhum sem unidade (fora os sem unidade física)', () => {
    const file = arquivoComRegras();
    const faltam: string[] = [];
    for (const nome of ['ik1', 'tr1', 'pa1', 'fi1']) {
      for (const f of numeros(constraintFields(file, nome))) {
        if (f.hint === undefined || f.hint === '') faltam.push(`${nome}.${f.key}: sem dica`);
        if (f.unit === undefined && !SEM_UNIDADE.has(f.key)) faltam.push(`${nome}.${f.key}: sem unidade`);
      }
    }
    expect(faltam).toEqual([]);
  });

  it('o que é de 0 a 1 no arquivo aparece de 0 a 100 %', () => {
    const file = arquivoComRegras();
    const fi = numeros(constraintFields(file, 'fi1'));
    for (const chave of ['x', 'y', 'rotation', 'scaleX', 'shearX', 'inertia', 'damping']) {
      const f = fi.find((c) => c.key === chave)!;
      expect(f.unit, chave).toBe('%');
      expect(f.scale, chave).toBe(100);
      expect(f.hint, chave).toContain('de 0 a 100');
    }
    const mix = numeros(constraintFields(file, 'ik1')).find((c) => c.key === 'mix')!;
    expect([mix.unit, mix.scale]).toEqual(['%', 100]);
  });

  it('a dica segue o molde da casa: "Nome, em UNIDADE, …: o que faz"', () => {
    for (const [onde, m] of Object.entries(REGUA)) {
      if (m.unit === '') continue;
      expect(m.hint, onde).toMatch(/, em (px|graus \(°\)|%|× \(vezes\)|px\/s|px por unidade|\/s \(por segundo\))/);
    }
  });

  it('rótulo de 1 a 3 palavras, sem a unidade dentro (R1, R2)', () => {
    const file = arquivoComRegras();
    const todos = [...['ik1', 'tr1', 'pa1', 'fi1'].flatMap((n) => numeros(constraintFields(file, n))),
      ...numeros(skeletonFieldsR47(file))];
    const fora = todos.filter((f) => f.label.split(/\s+/).length > 3 || /\((s|px|°|%)\)/.test(f.label))
      .map((f) => f.label);
    expect(fora).toEqual([]);
  });

  it('o caminho: a unidade da posição e do espaço é a do modo', () => {
    expect(medidaDoCaminho('position', 'percent')).toMatchObject({ unit: '%', scale: 100 });
    expect(medidaDoCaminho('position', 'fixed').unit).toBe('px');
    expect(medidaDoCaminho('spacing', 'length').unit).toBe('px');
    expect(medidaDoCaminho('spacing', 'proportional').unit).toBe('×');
  });

  it('a base: posição, tamanho e escala da física em px, com dica', () => {
    const base = numeros(skeletonFieldsR47(arquivoComRegras()));
    for (const chave of ['x', 'y', 'width', 'height', 'referenceScale']) {
      const f = base.find((c) => c.key === chave)!;
      expect(f.unit, chave).toBe('px');
      expect(f.hint, chave).toBeTruthy();
    }
    const fps = base.find((c) => c.key === 'fps')!;
    // A Taxa das partículas: o nome curto, a unidade depois da caixa.
    const css = readFileSync(resolve(__dirname, '../src/panels/properties.css'), 'utf8');
    expect(css.slice(css.indexOf('.prop-com-unidade > .prop-campo {'), css.indexOf('}', css.indexOf('.prop-com-unidade > .prop-campo {')))).toContain('min-width: 0;');
    expect(css).toMatch(/\.prop-aba-corpo \.prop-linha:has\(\.prop-com-unidade\) \{\s+padding-right: 12px;/);
    expect([fps.label, fps.unit]).toEqual(['Quadros', '/s']);
    expect(fps.hint).toContain('Típico: 30');
  });

  it('comRegua não mexe em campo que a régua não conhece', () => {
    const campo = { key: 'zzz', label: 'Zzz' };
    expect(comRegua(campo, 'fisica')).toBe(campo);
    expect(medidaDe('fisica', 'zzz')).toBeNull();
  });

  it('a ficha mostra o número na escala da tela, e grava na do arquivo', () => {
    const ficha = readFileSync(resolve(__dirname, '../src/panels/properties.ts'), 'utf8');
    const render = ficha.slice(ficha.indexOf('private renderNumber('), ficha.indexOf('private attachDrag('));
    expect(render).toContain('field.scale');
    // Todo número com ponteiro se arrasta pelo rótulo (R7), com ou sem unidade.
    expect(ficha).toContain("if (field.kind === 'number' && field.pointer !== '') {");
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 3 (doc 68, R7): o número da casa fora da ficha
// ---------------------------------------------------------------------------
const fonteR47 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');
/** Quantas caixas de número cruas (`type = 'number'`) o arquivo ainda tem. */
const cruasR47 = (texto: string): number => (texto.match(/\.type = 'number'|type: 'number'|type="number"/g) ?? []).length;

describe('rodada 47, lote 3: o número da casa, um só, fora da ficha', () => {
  it('o campo comum existe e prende o valor na faixa', async () => {
    const { prender } = await import('../src/panels/campo-numero.js');
    expect(prender(50, 0, 30)).toBe(30);
    expect(prender(-2, 0, 30)).toBe(0);
    expect(prender(7)).toBe(7);
  });

  it('o campo comum usa as contas da ficha, e não uma cópia', () => {
    const campo = fonteR47('panels/campo-numero.ts');
    for (const conta of ['evalFieldInput', 'stepValue', 'scrubValue', 'notNumberSays', 'formatNumberField']) {
      expect(campo, conta).toContain(conta);
    }
  });

  it('a cebola: o numberField de sempre passa pelo número da casa', () => {
    const dom = fonteR47('panels/dom.ts');
    expect(dom.slice(dom.indexOf('export function numberField')).slice(0, 1500)).toContain('campoNumero(');
  });

  it('a janela do pivô já é texto com px e dica (rodada 44); nenhuma caixa crua', () => {
    const pivo = fonteR47('panels/pivot-dialog.ts');
    expect(pivo).toContain("el('span', '', 'px')");
    expect(cruasR47(pivo)).toBe(0);
  });
});

describe('rodada 47, lote 3: as notas do doc 84 na ficha', () => {
  it('(c) toda dica com unidade diz a faixa "de X a Y" (o que não tem fim diz +∞)', () => {
    const fora = Object.entries(REGUA).filter(([, m]) => m.unit !== '' && !/de [−-]?[\d∞,]+ a [−+]?[\d∞,]+/.test(m.hint)).map(([k]) => k);
    expect(fora).toEqual([]);
    for (const m of [medidaDoCaminho('position', 'fixed'), medidaDoCaminho('spacing', 'length')]) expect(m.hint).toMatch(/de [−-]?[\d∞]+ a [−+]?[\d∞]+/);
  });

  it('(e) o que vai de 0 a 100 % trava na faixa: a régua dá min e max, e a ficha prende', () => {
    for (const chave of ['regra|mix', 'fisica|inertia', 'fisica|damping', 'fisica|x']) {
      expect([REGUA[chave]!.min, REGUA[chave]!.max], chave).toEqual([0, 1]);
    }
    const ficha = fonteR47('panels/properties.ts');
    expect(ficha).toContain('this.write(field, prenderNaFaixa(v / escala, field))');
    expect((ficha.match(/prenderNaFaixa\(/g) ?? []).length).toBeGreaterThanOrEqual(4);
  });

  it('(b) os números do Comando: "Em −1", com a unidade da propriedade e a dica', async () => {
    const { medidaDoComando } = await import('../src/panels/regua-numeros.js');
    expect(medidaDoComando('rotation', '−1')).toMatchObject({ unit: '°', label: 'Em −1' });
    expect(medidaDoComando('x', '0').unit).toBe('px');
    expect(medidaDoComando('scaleY', '1').unit).toBe('×');
    expect(medidaDoComando('rotation', '1').hint).toContain('de −360 a 360');
    // O que não é osso não ganha unidade de palpite (regra 21): o "weight" do smile.
    expect(medidaDoComando('weight', '1').unit).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

/** O corpo de um método, do nome até o próximo método do mesmo recuo. */
const metodoR47 = (texto: string, nome: string): string => {
  const i = texto.indexOf(`private ${nome}(`);
  const j = texto.indexOf('\n  private ', i + 10);
  return texto.slice(i, j === -1 ? undefined : j);
};

describe('rodada 47, lote 4: a barrinha anda a cada tecla (R8)', () => {
  // A forma do defeito: gravar redesenha o painel e a barrinha com o foco some;
  // a tecla seguinte cai no BODY. Medido no montado (v34.4): na Regra e no
  // Alfa da ficha, 3 teclas = 1 casa. O conserto é o do Ctrl+seta da Ordem
  // (rodada 38, lote 4b): lembrar quem tinha o foco e devolver.
  it('o conserto mora num lugar só: lembrarFoco, em panels/dom.ts', () => {
    expect(fonteR47L4('panels/dom.ts')).toContain('export function lembrarFoco(');
  });

  it('Regras, Propriedades e Malha lembram o foco antes de redesenhar e o devolvem depois', () => {
    for (const [arquivo, chamada] of [['panels/rules.ts', 'clear(list);'], ['panels/properties.ts', 'buildProperties('], ['panels/mesh-panel.ts', 'clear(body);']] as const) {
      const render = metodoR47(fonteR47L4(arquivo), 'render');
      const lembra = render.indexOf('lembrarFoco(');
      expect(lembra, arquivo).toBeGreaterThan(-1);
      expect(lembra, arquivo).toBeLessThan(render.indexOf(chamada));
      expect(render, arquivo).toContain('voltarFoco()');
    }
  });

  it('toda barrinha dessas três abas tem um nome estável para o foco voltar a ela', () => {
    const contar = (t: string): number => (t.match(/\.type = 'range'/g) ?? []).length;
    const marcar = (t: string): number => (t.match(/dataset\.foco = /g) ?? []).length;
    for (const arquivo of ['panels/rules.ts', 'panels/properties.ts', 'panels/mesh-panel.ts']) {
      const texto = fonteR47L4(arquivo);
      expect(marcar(texto), arquivo).toBeGreaterThanOrEqual(contar(texto));
    }
  });
});

describe('rodada 47, lote 4: o Histórico tem uma linha de ajuda (R10)', () => {
  it('a linha curta à vista, a inteira na dica', async () => {
    const { HISTORY_HELP, HISTORY_HELP_SHORT } = await import('../src/panels/history.js');
    expect(HISTORY_HELP_SHORT.length).toBeLessThanOrEqual(34);
    expect(HISTORY_HELP).toContain('cinzas');
    expect(fonteR47L4('panels/history.ts')).toContain('topo.title = HISTORY_HELP;');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 5 (doc 68, opção A; notas do doc 85)
// ---------------------------------------------------------------------------
const fonteR47L5 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 5: um nome por coisa, e a faixa em toda dica da ficha', () => {
  it('a ficha de um desenho não diz "Imagem" duas vezes: o arquivo dela se chama Arquivo (R13)', () => {
    const file = {
      skeleton: { name: 't' }, bones: [{ name: 'root' }], slots: [{ name: 's', bone: 'root', attachment: 'a' }],
      skins: [{ name: 'default', attachments: { s: { a: { type: 'region' } } } }],
    } as never;
    const rotulos = attachmentFields(file, 's', 'a').flatMap((g) => g.fields).map((f) => f.label);
    expect(rotulos).toContain('Arquivo');
    expect(rotulos.filter((r) => r === 'Imagem').length).toBeLessThanOrEqual(1);
  });

  it('(nota 4 do doc 85) a ficha do osso: toda dica com unidade diz "de X a Y"', () => {
    const file = JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
    const osso = file.bones![1]!.name;
    const grupos = buildProperties(file, { ...emptySelection(), bones: [osso] }).groups;
    const fora = grupos.flatMap((g) => g.fields)
      .filter((f) => f.kind === 'number' && f.unit !== undefined && !/de [−-]?[\d∞,]+ a [−+]?[\d∞,]+/.test(f.hint ?? ''))
      .map((f) => f.key);
    expect(fora).toEqual([]);
    const ficha = quickFieldsL8(file, quickSubjectL8({ ...emptySelection(), bones: [osso] }));
    // A linha Alfa de um osso não grava nada (pointer null): só diz que o Alfa é do desenho.
    const foraFicha = ficha.filter((f) => f.pointer !== null && f.unit !== undefined && !/de [−-]?[\d∞,]+ a [−+]?[\d∞,]+/.test(f.hint)).map((f) => f.key);
    expect(foraFicha).toEqual([]);
  });
});

// Rodada 47, lote 5b (notas do doc 86)
describe('rodada 47, lote 5b: Cor do osso e Ícone com dica', () => {
  const fonteR47L5b = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

  it('os dois campos da Marcação no editor dizem o que fazem', () => {
    const file = JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
    const campos = buildProperties(file, { ...emptySelection(), bones: [file.bones![1]!.name] }).groups.flatMap((g) => g.fields);
    expect(campos.find((f) => f.key === 'boneColor')!.hint).toMatch(/^Cor do osso: /);
    expect(campos.find((f) => f.key === 'icon')!.hint).toMatch(/^Ícone: /);
  });
});

// Rodada 47, lote 6c (nota 5 do doc 90)
describe('rodada 47, lote 6c: a ficha completa dobra os grupos e abre o do nome', () => {
  it('abre o grupo do nome e o que tem problema; os outros dobram; a mão manda; com até dois grupos, nada dobra', async () => {
    const { groupsOpen } = await import('../src/panels/properties-model.js');
    const g = (title: string, keys: string[], problem?: string) => ({ title, fields: keys.map((key) => ({ key })), ...(problem === undefined ? {} : { problem }) });
    const grupos = [g('Compensar', ['a']), g('Osso', ['name', 'length']), g('Marcação', ['icon']), g('Herança', ['h'], 'X')];
    expect(groupsOpen(grupos)).toEqual([false, true, false, true]);
    expect(groupsOpen(grupos, new Map([['Marcação', true], ['Osso', false]]))).toEqual([false, false, true, true]);
    expect(groupsOpen([g('A', ['x']), g('B', ['y'])])).toEqual([true, true]);
  });

  it('a ficha usa a regra, e o título é o botão', () => {
    const ficha = readFileSync(resolve(__dirname, '../src/panels/properties.ts'), 'utf8');
    expect(ficha).toContain('const abertos = groupsOpen(juntos, gruposDaMao);');
    expect(ficha).toContain("legenda.setAttribute('role', 'button');");
    // Compensar dobra também, e nasce aberto só com alguma caixa ligada.
    expect(ficha).toContain("this.dobrarGrupo(box, 'Compensar', gruposDaMao.get('Compensar') ?? ligadas > 0);");
  });
});

// Rodada 48 (a mão do Humberto, 07/10/2026), item 1: trocou a Cor ao nascer e a
// barra da Cor na vida ficou igual; o rótulo "Só a Cor ao nascer" aparecia POR
// CIMA de um degradê. A conta é a do Unity e do Godot (§9.7 da extensão): a Cor
// na vida MULTIPLICA a Cor ao nascer. A barra mostra as duas e o resultado.
import { gradientBandsCss as gradientBandsCssR48, readStartColors as readStartColorsR48 } from '../src/panels/life-curve.js';
describe('rodada 48 — a Cor ao nascer e a Cor na vida se falam', () => {
  const fogo = [
    { time: 0, value: [1, 0.95, 0.6, 1] as [number, number, number, number] },
    { time: 1, value: [0.5, 0.1, 0.05, 0] as [number, number, number, number] },
  ];
  it('a barra tem a Cor na vida em cima e, embaixo, a cor da tela: «de» e «a»', () => {
    const css = gradientBandsCssR48([[1, 0, 0, 1], [1, 1, 1, 1]], fogo);
    expect(css.split('linear-gradient').length - 1).toBe(3);
    // A faixa de cima é a própria Cor na vida (amarelo no começo).
    expect(css.indexOf('rgba(255, 242, 153, 1)')).toBeGreaterThanOrEqual(0);
    // A do «de» vermelho: vermelho × amarelo = vermelho, sem verde.
    expect(css).toContain('rgba(255, 0, 0, 1)');
  });
  it('trocar a Cor ao nascer muda a barra (o defeito: não mudava)', () => {
    expect(gradientBandsCssR48([[1, 0, 0, 1], [1, 0, 0, 1]], fogo))
      .not.toBe(gradientBandsCssR48([[1, 1, 1, 1], [1, 1, 1, 1]], fogo));
  });
  it('sem Cor na vida, a faixa de baixo é a Cor ao nascer pura', () => {
    expect(gradientBandsCssR48([[0, 0, 1, 1], [0, 0, 1, 1]], [])).toContain('rgba(0, 0, 255, 1)');
  });
  it('lê o par do arquivo; o que falta é branco, como no runtime', () => {
    expect(readStartColorsR48(undefined)).toEqual([[1, 1, 1, 1], [1, 1, 1, 1]]);
    expect(readStartColorsR48([[1, 0, 0, 1], [0, 1, 0, 0.5]])).toEqual([[1, 0, 0, 1], [0, 1, 0, 0.5]]);
  });
  it('as dicas dizem que uma multiplica a outra, e onde ver o resultado', () => {
    expect(MEDIDA['colorOverLifetime']).toMatch(/multiplica a Cor ao nascer/);
    expect(MEDIDA['startColor0']).toMatch(/multiplica a Cor na vida/);
    expect(MEDIDA['startColor0']).toMatch(/branco/);
  });
});

// Rodada 48, item 3: 176 avisos no projeto dele. A barra contava, e só. Agora
// junta os iguais, e põe o pior primeiro.
import { avisosPeloPior as avisosPeloPiorR48, resumoDosAvisos as resumoDosAvisosR48 } from '../src/panels/warning-model.js';
describe('rodada 48 — os avisos, o pior primeiro e os iguais juntos', () => {
  const imagem = (n: number): string => `/skins/0/attachments/s${n}/a: image "img${n}" not found in any atlas; attachment will be invisible`;
  const muitos = [
    ...Array.from({ length: 170 }, (_, i) => imagem(i)),
    '/animations/0/timelines/3/property: unknown slot property "x"; timeline ignored',
    '/skeleton/version: file version 9.0 newer than reader 1.0: partial read',
  ];
  it('a barra diz quantos são iguais', () => {
    const r = resumoDosAvisosR48(muitos);
    expect(r.barra).toBe('172 avisos (170 iguais) — ver');
    expect(r.grupos[0]!.vezes).toBe(1);
    expect(r.grupos[0]!.texto).toMatch(/leitura parcial/);
    expect(r.grupos.map((g) => g.vezes)).toEqual([1, 170, 1]);
  });
  it('a dica conta os tipos, o pior primeiro', () => {
    const r = resumoDosAvisosR48(muitos);
    expect(r.dica).toMatch(/^3 tipos de aviso, o pior primeiro: 1 × arquivo na versão/);
    expect(r.dica).toContain('170 × imagem "…" não está em nenhum atlas');
  });
  it('a lista sai com o pior primeiro, e na mesma ordem entre os iguais', () => {
    const lista = avisosPeloPiorR48(muitos);
    expect(lista[0]).toMatch(/partial read/);
    expect(lista[1]).toBe(imagem(0));
    expect(lista[170]).toBe(imagem(169));
    expect(lista[171]).toMatch(/timeline ignored/);
  });
  it('poucos avisos e todos diferentes: a barra de sempre', () => {
    expect(resumoDosAvisosR48([imagem(1)]).barra).toBe('1 aviso — ver');
    expect(resumoDosAvisosR48([]).barra).toBe('Nenhum aviso');
  });
});

// Rodada 48, lote 3 (doc 95, o conferente da v35.9): "imagem não encontrada:
// NOME" (a frase curta do Salvar) leva o nome SEM aspas, e virava um tipo por
// imagem: 21 tipos para 21 imagens. Agora um tipo, com os nomes dentro.
import { abrirComParagrafo as abrirComParagrafoR48b } from '../src/panels/warning-model.js';
describe('rodada 48, lote 3 — "imagem não encontrada" é UM tipo, com os nomes', () => {
  const curtos = Array.from({ length: 21 }, (_, i) => `imagem não encontrada: peca${i}`);
  it('21 imagens, 1 tipo, e os nomes na frase', () => {
    const r = resumoDosAvisosR48(curtos);
    expect(r.grupos).toHaveLength(1);
    expect(r.barra).toBe('21 avisos (21 iguais) — ver');
    expect(r.dica).toBe('1 tipo de aviso: 21 × imagem não encontrada: peca0, peca1, peca2, peca3, peca4 e mais 16');
  });
  it('os nomes entre aspas também entram na frase do tipo', () => {
    const r = resumoDosAvisosR48([
      '/a: image "x" not found in any atlas; attachment will be invisible',
      '/b: image "y" not found in any atlas; attachment will be invisible',
    ]);
    expect(r.dica).toBe('1 tipo de aviso: 2 × imagem "…" não está em nenhum atlas; o desenho fica invisível: x, y');
  });
  it('a janela abre com UM parágrafo: o das imagens quando só há elas; o dos tipos quando há mais', () => {
    expect(abrirComParagrafoR48b(1, true)).toBe('imagens');
    expect(abrirComParagrafoR48b(3, true)).toBe('tipos');
    expect(abrirComParagrafoR48b(3, false)).toBe('tipos');
    expect(abrirComParagrafoR48b(1, false)).toBe(null);
  });
});
