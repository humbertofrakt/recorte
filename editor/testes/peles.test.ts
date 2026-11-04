/**
 * Peles — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote27-peles`, `lote39-peles-na-tela`, `lote40-ponto-no-slot`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadSkeletonData } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { DeleteSkin, DuplicateSkin, RenameSkin, SKIN_HELP, canDeleteSkin, skinTabRows, PICK_SKIN_NOTICE, SetSkinRequired, SwapImageEverywhere, ToggleSkinBone, ToggleSkinConstraint, skinForRequired, skinsListing, skinsWithImage, swapNotice, swapPickFor } from '../src/panels/skins-model.js';
import { deleteSkinLead, skinDependents } from '../src/panels/skins-model.js';
import { hierarchyRows, AddAttachmentToSlot, attachmentNameInSlot, boxAttachment, boxVertices, inSlotNotice, pointAttachment, shapeTarget } from '../src/panels/tree-model.js';
import { RIGHT_GROUPS, defaultLayout, sideOf } from '../src/ui/layout-model.js';
import { WINDOW_PANELS, allMenus, flatEntries, skeletonMenu, skinsMenu } from '../src/ui/menus.js';
import type { MenuEntry, MenuGroupDef, MenuItem, MenuState } from '../src/ui/menus.js';
import { setEditableSkin, toggleSkin } from '../src/viewport/onion.js';
// Degrau 9: a pilha e o lapis, separados.
import {
  editingSkinOf, setEditingSkin, setSkinStack, skinStackOf,
} from '../src/viewport/onion.js';
import {
  activeStackRows, lostSkins, skinOff, skinOnly, stackAddOnTop, stackDrop, stackRemove,
} from '../src/panels/skins-model.js';
// Defeito 4 (21/09/2026): o que o arrasto decide, e a frase honesta do rodape.
import { dropAt, dropOnColumn, skinOnNotice, skinShowing } from '../src/panels/skins-model.js';
import { readEditorState, writeEditorState } from '../src/contract.js';
// Degrau 9, lote 2: o lapis cria osso e regra; a ficha da virada.
import { BornInSkin, bornInSkinNotice } from '../src/panels/skins-model.js';
import { addBone } from '../src/panels/tree-actions.js';
import { AddBone } from '../src/panels/tree-commands.js';
import { skinOnlyHint } from '../src/panels/tree-rows.js';
import { bodyKeys, setBodyKey } from '../src/anim/body.js';
import {
  KEEP_SKINS_HINT, KEEP_SKINS_LABEL, SetKeepSkins, bodyKeyView,
} from '../src/panels/properties-model.js';
// Degrau 9, lote 3: a pele de uma pasta, a pele em arquivo, a pele que vira base.
import {
  MakeSkinFromFolder, bakeSkinBase, baseNameOf, folderOf, folderSkinNotice, folderSkinPlan,
  imageFolders, promoteSkinNotice,
} from '../src/panels/skins-model.js';
import {
  ImportSkinFile, buildSkinFile, importSkinNotice, importedSkinUris, skinFileNotice, unmetRig,
} from '../src/io/export-skin.js';
// Lote 3 do chat I (29/09/2026): o desfazer leva a pilha junto (I5, M1), e o passo seguinte (I7).
import {
  IMPORT_SKIN_ASK, KeepSkinStack, ChangeSkinStack, putSkinStack, takeOffSkin, addSkin as addSkinI, dropSkin, emptySkinHint, importSkin, importSkinFromDisk,
  newSkinNotice, renameInView,
} from '../src/panels/skins-actions.js';
import { viewMenuState } from './ajuda-view.js';
import { describeManual, itManual } from './manual-pausado.js';
import { emptySelection } from '../src/contract.js';
import type { Command, EditorDoc, Selection, ToolEvent } from '../src/contract.js';
import { boneFields, constraintFields, skinFieldCommand } from '../src/panels/properties-model.js';
import type { FieldDef } from '../src/panels/properties-model.js';
import { CONTEXT_ACTIONS } from '../src/ui/action-audit.js';
import { pointTool } from '../src/viewport/tools/point-tool.js';
import { boxTool } from '../src/viewport/tools/box-tool.js';
import { buildPoseDump } from '../../ferramentas/src/conformidade/pose-dump.js';
// Rodada 12 (04/10/2026): esconder, ignorar, e o osso que some com a skin.
import {
  NO_SKIN_FOR_VERDICT, SetSkinVerdict, pairsOfSelection, skinEffects, skinVerdict, verdictNotice,
} from '../src/panels/skins-model.js';
import { canSetVerdict, setVerdict, setVerdictOnSelection, verdictSkin } from '../src/panels/skins-actions.js';
import { bonesGone, removedBonesOf, writeRemovedBones } from '../src/doc/skin-bones.js';
import { currentLocks, isBoneHidden, isBoneLocked, setSkinGoneBones } from '../src/viewport/onion.js';
import { DeleteInSkin, deleteInSkinNotice, planDeleteInSkin } from '../src/panels/skins-delete.js';
import { deleteSelected } from '../src/panels/tree-actions.js';
import { DeleteItems } from '../src/panels/tree-commands.js';
import { restoreBone } from '../src/panels/skins-actions.js';

// ---------------------------------------------------------------------------
// peles (lote 27) — era `lote27-peles.test.ts`
// ---------------------------------------------------------------------------

describe('peles (lote 27)', () => {
/**
 * Lote 27 (v5.0): a anotação 12 do Humberto — a aba **Peles**.
 *
 * Nas palavras dele, 09/09/2026: *"não sei onde estão as skins e como faço para
 * usar. Skin é importante, não deixa escondido."*
 *
 * A pele morava em três lugares:
 *
 * | Onde | O que dava para fazer |
 * |:---|:---|
 * | Seção **Peles** da Árvore | ver os nomes |
 * | Painel **Exibição** | ligar "Mostrar", escolher "Editar aqui" |
 * | **Novo ▾ → Pele** | criar |
 *
 * Agora é uma aba só, na coluna da direita. Regra 5 da casa: uma função, um
 * dono — e por isso a seção saiu da Árvore e as caixas saíram do Exibição.
 *
 * Sem DOM.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');
const VIEW_SOURCE = resolve(__dirname, '../src/panels/view-panel.ts');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

function menus(): MenuGroupDef[] {
  return allMenus({
    canRepack: false,
    canUndo: false,
    undoLabel: null,
    canRedo: false,
    redoLabel: null,
    view: viewMenuState(),
    lockBones: false,
    lockDrawings: false,
    space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    animating: true,
    loop: false,
    open: {},
  });
}

// ---------------------------------------------------------------------------
// A lista
// ---------------------------------------------------------------------------

describe('anotação 12 — a lista da aba Peles', () => {
  it('uma linha por pele, com quantos slots cada uma veste', () => {
    const doc = heroi();
    const rows = skinTabRows(doc.file, ['default']);
    expect(rows.map((r) => r.name)).toEqual(['default', 'armadura', 'armadura_capa']);
    expect(rows.map((r) => r.slots)).toEqual([23, 3, 1]);
  });

  it('a `default` começa na pilha, e não se apaga', () => {
    const doc = heroi();
    const rows = skinTabRows(doc.file, ['default']);
    const padrao = rows[0]!;
    expect(padrao.isDefault).toBe(true);
    expect(padrao.visible).toBe(true);
    expect(canDeleteSkin('default')).toBe(false);
    expect(canDeleteSkin('armadura')).toBe(true);
  });

  it('ligar duas mantém a ordem em que foram ligadas: a de cima cobre', () => {
    const doc = heroi();
    // A conta velha (`toggleSkin` sobre a lista sem a `default`) continua de
    // pé para quem ainda fala a vista velha; o degrau 9 põe a `default` DENTRO
    // da pilha, e por isso a lista de ligadas é lida da pilha.
    let visible: string[] = [];
    visible = toggleSkin(visible, 'armadura_capa', true);
    visible = toggleSkin(visible, 'armadura', true);
    expect(visible).toEqual(['armadura_capa', 'armadura']);

    const rows = skinTabRows(doc.file, ['default', ...visible]);
    expect(rows.filter((r) => r.visible).map((r) => r.name))
      .toEqual(['default', 'armadura', 'armadura_capa']);
  });

  it('o lápis é um só, e agora é dito por fora da pilha', () => {
    const doc = heroi();
    const rows = skinTabRows(doc.file, ['default', 'armadura', 'armadura_capa'], 'armadura_capa');
    const editaveis = rows.filter((r) => r.editable).map((r) => r.name);
    expect(editaveis).toEqual(['armadura_capa']);
  });

  it('a frase de ajuda existe e diz o que uma pele é', () => {
    expect(SKIN_HELP).toContain('roupa');
    expect(SKIN_HELP).toContain('Nova skin');
  });
});

// ---------------------------------------------------------------------------
// Os comandos
// ---------------------------------------------------------------------------

describe('anotação 12 — criar, copiar, renomear e apagar', () => {
  it('duplicar copia os anexos, e desfazer devolve o arquivo', () => {
    const doc = heroi();
    const antes = texto(doc);
    const command = new DuplicateSkin(doc.file, 'armadura');
    doc.run(command);

    const nova = (doc.file.skins ?? []).find((s) => s.name === command.name);
    expect(nova).toBeDefined();
    expect(Object.keys(nova?.attachments ?? {}).sort())
      .toEqual(Object.keys(
        (doc.file.skins ?? []).find((s) => s.name === 'armadura')?.attachments ?? {},
      ).sort());
    expect(doc.undoLabel).toBe('Duplicar skin');

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('a cópia é FUNDA: mexer nela não mexe na original', () => {
    const doc = heroi();
    const command = new DuplicateSkin(doc.file, 'armadura');
    doc.run(command);
    const nova = (doc.file.skins ?? []).find((s) => s.name === command.name);
    const velha = (doc.file.skins ?? []).find((s) => s.name === 'armadura');
    const slot = Object.keys(nova?.attachments ?? {})[0]!;
    delete nova!.attachments![slot];
    expect(Object.keys(velha?.attachments ?? {})).toContain(slot);
  });

  it('renomear troca o nome também nas linhas de tempo que citam a pele', () => {
    const doc = heroi();
    // Uma linha de tempo de deformação que diz de qual pele ela é.
    const animation = (doc.file.animations ?? [])[0]!;
    animation.timelines = animation.timelines ?? [];
    animation.timelines.push({
      type: 'deform', target: 'body', skin: 'armadura', attachment: 'body', keys: [],
    } as never);
    const antes = texto(doc);

    const command = new RenameSkin(doc.file, 'armadura', 'ferro');
    doc.run(command);
    expect((doc.file.skins ?? []).map((s) => s.name)).toContain('ferro');
    expect((doc.file.skins ?? []).map((s) => s.name)).not.toContain('armadura');
    const linha = (doc.file.animations ?? [])[0]!.timelines!
      .find((t) => (t as { attachment?: string }).attachment === 'body');
    expect((linha as { skin?: string }).skin).toBe('ferro');

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('renomear não aceita um nome que já existe', () => {
    const doc = heroi();
    const command = new RenameSkin(doc.file, 'armadura', 'armadura_capa');
    expect(command.to).not.toBe('armadura_capa');
  });

  it('apagar leva junto as linhas de tempo que só aquela pele tinha', () => {
    const doc = heroi();
    const animation = (doc.file.animations ?? [])[0]!;
    animation.timelines = animation.timelines ?? [];
    const quantasAntes = animation.timelines.length;
    animation.timelines.push({
      type: 'deform', target: 'body', skin: 'armadura', attachment: 'body', keys: [],
    } as never);
    const antes = texto(doc);

    doc.run(new DeleteSkin('armadura'));
    expect((doc.file.skins ?? []).map((s) => s.name)).not.toContain('armadura');
    expect((doc.file.animations ?? [])[0]!.timelines!.length).toBe(quantasAntes);

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('a pele `default` não sai nem se mandarem', () => {
    const doc = heroi();
    const antes = texto(doc);
    doc.run(new DeleteSkin('default'));
    expect(texto(doc)).toBe(antes);
    expect((doc.file.skins ?? []).map((s) => s.name)).toContain('default');
  });
});

// ---------------------------------------------------------------------------
// Um lugar só
// ---------------------------------------------------------------------------

describe('anotação 12 — a pele mora num lugar só', () => {
  // Lote 64: a Árvore é uma árvore só; nenhuma linha de pele.
  it('a Árvore não tem mais a seção Peles', () => {
    const rows = hierarchyRows(heroi().file);
    expect(rows.map((r) => r.kind)).not.toContain('skin');
    expect(rows.map((r) => r.name)).not.toContain('armadura');
  });

  it('os desenhos continuam na Árvore: nada some', () => {
    const desenhos = hierarchyRows(heroi().file).filter((r) => r.kind === 'slot');
    expect(desenhos.length).toBeGreaterThan(20);
    expect(desenhos.some((row) => row.attachment === 'face')).toBe(true);
  });

  it('o painel Exibição não tem mais a lista de peles', () => {
    const fonte = readFileSync(VIEW_SOURCE, 'utf8');
    expect(fonte).not.toContain('this.skinGroup()');
  });

  it('a aba está no menu Janela e nasce na coluna da direita', () => {
    expect(WINDOW_PANELS.map((p) => p.id)).toContain('peles');
    const janela = menus().find((g) => g.label === 'Janela');
    const acoes = flatEntries(janela?.entries ?? []).map((e) => e.action);
    expect(acoes).toContain('painel-peles');

    const known = [
      'arvore', 'ordem', 'propriedades', 'animacoes', 'exibicao', 'malha',
      'historico', 'imagens', 'previa', 'peles', 'regras',
    ];
    expect(sideOf(defaultLayout(known), 'peles')).toBe('right');
    expect(RIGHT_GROUPS.flat()).toContain('peles');
  });

  it('o menu Janela continua sem bloco de mais de seis', () => {
    const janela = menus().find((g) => g.label === 'Janela');
    let bloco = 0;
    let maior = 0;
    for (const entry of janela?.entries ?? []) {
      if ((entry as { separator?: boolean }).separator === true) {
        maior = Math.max(maior, bloco);
        bloco = 0;
      } else bloco += 1;
    }
    maior = Math.max(maior, bloco);
    expect(maior).toBeLessThanOrEqual(6);
  });
});
});

// ---------------------------------------------------------------------------
// peles na tela (lote 39) — era `lote39-peles-na-tela.test.ts`
// ---------------------------------------------------------------------------

describe('peles na tela (lote 39)', () => {
/**
 * Lote 39 — rodada 4: `skin.bones` e `skin.constraints` na tela, e trocar a
 * imagem em todas as peles (Spine 3, Spriter 7).
 *
 * Sem DOM: os comandos são do documento, a decisão das caixas é pura.
 *
 * O herói não tem a pele `inverno` do plano: as contas usam `armadura` (que
 * tem `bones: []` escrito) e `armadura_capa` (que não tem o campo). Os dois
 * casos importam — um `revert` que devolve `[]` onde não havia nada muda o
 * arquivo.
 */
const RAIZ = resolve(__dirname, '..', '..');
const HEROI = resolve(RAIZ, 'formato', 'exemplos', 'heroi.bone');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(HEROI, 'utf8')) as BoneFile;
}

/** O mínimo de documento que um comando precisa: o arquivo. */
function doc(file: BoneFile): EditorDoc {
  return { file } as unknown as EditorDoc;
}

function run(file: BoneFile, command: Command): void {
  command.apply(doc(file));
}

function undo(file: BoneFile, command: Command): void {
  command.revert(doc(file));
}

function pele(file: BoneFile, name: string) {
  return (file.skins ?? []).find((s) => s.name === name)!;
}

function avisosDePele(file: BoneFile): string[] {
  return loadSkeletonData(file).warnings
    .map((w) => w.message)
    .filter((m) => m.includes('is not skinRequired'));
}

function campo(groups: ReturnType<typeof boneFields>, key: string): FieldDef | undefined {
  return groups.flatMap((g) => g.fields).find((f) => f.key === key);
}

// ---------------------------------------------------------------------------
// ToggleSkinBone e ToggleSkinConstraint
// ---------------------------------------------------------------------------

describe('Peles que ativam — as listas da pele', () => {
  it('ToggleSkinBone põe o osso na pele, e o revert devolve o texto de antes', () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    const cmd = new ToggleSkinBone('armadura', 'cape1');
    run(file, cmd);
    expect(pele(file, 'armadura').bones).toEqual(['cape1']);
    undo(file, cmd);
    expect(JSON.stringify(file)).toBe(antes);
    // `armadura` tinha `bones: []` escrito, e continua tendo.
    expect(pele(file, 'armadura').bones).toEqual([]);
  });

  it('numa pele sem o campo, o revert tira o campo em vez de deixar []', () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    expect(pele(file, 'armadura_capa').bones).toBeUndefined();
    const cmd = new ToggleSkinBone('armadura_capa', 'cape1');
    run(file, cmd);
    expect(pele(file, 'armadura_capa').bones).toEqual(['cape1']);
    undo(file, cmd);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('marcar duas vezes tira; o nome nunca entra repetido', () => {
    const file = heroi();
    run(file, new ToggleSkinBone('armadura', 'cape1'));
    expect(pele(file, 'armadura').bones).toEqual(['cape1']);
    run(file, new ToggleSkinBone('armadura', 'cape1'));
    expect(pele(file, 'armadura').bones ?? []).not.toContain('cape1');
    run(file, new ToggleSkinBone('armadura', 'cape1'));
    expect(pele(file, 'armadura').bones).toEqual(['cape1']);
  });

  it('a lista fica na ordem do arquivo, e não na dos cliques', () => {
    const file = heroi();
    run(file, new ToggleSkinBone('armadura', 'cape2'));
    run(file, new ToggleSkinBone('armadura', 'cape1'));
    expect(pele(file, 'armadura').bones).toEqual(['cape1', 'cape2']);
  });

  it('ToggleSkinConstraint faz o mesmo em skin.constraints', () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    const cmd = new ToggleSkinConstraint('armadura', 'cape_follow');
    run(file, cmd);
    expect(pele(file, 'armadura').constraints).toEqual(['cape_follow']);
    expect(skinsListing(file, 'constraints', 'cape_follow')).toEqual(['armadura']);
    undo(file, cmd);
    expect(JSON.stringify(file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// Só com a pele
// ---------------------------------------------------------------------------

describe('Só com a pele — a caixa arruma as peles junto', () => {
  it('a pele do lápis recebe o osso; a default não conta como lápis', () => {
    const file = heroi();
    expect(skinForRequired(file, ['armadura'])).toBe('armadura');
    expect(skinForRequired(file, [])).toBeNull();
    expect(skinForRequired(file, ['default'])).toBeNull();
    expect(skinForRequired(file, ['nao_existe'])).toBeNull();
  });

  it('marcar com a armadura no lápis: osso marcado e já na pele, um passo de desfazer', () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    const flag = campo(boneFields(file, 'cape1'), 'skinRequired')!;
    const { command, notice } = skinFieldCommand(file, ['armadura'], flag, true);
    expect(notice).toBeNull();
    run(file, command!);
    const bone = file.bones.find((b) => b.name === 'cape1')!;
    expect(bone.skinRequired).toBe(true);
    expect(pele(file, 'armadura').bones).toEqual(['cape1']);
    undo(file, command!);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('sem pele no lápis, o rodapé pede a pele', () => {
    const file = heroi();
    const flag = campo(boneFields(file, 'cape1'), 'skinRequired')!;
    const { command, notice } = skinFieldCommand(file, [], flag, true);
    expect(notice).toBe(PICK_SKIN_NOTICE);
    expect(notice).toBe('Marque em que skin, em Propriedades');
    run(file, command!);
    expect(file.bones.find((b) => b.name === 'cape1')!.skinRequired).toBe(true);
    expect(skinsListing(file, 'bones', 'cape1')).toEqual([]);
  });

  it('Peles que ativam só aparece com a caixa marcada, sem a default', () => {
    const file = heroi();
    expect(campo(boneFields(file, 'cape1'), 'skinMembers')).toBeUndefined();
    run(file, new SetSkinRequired('bones', 'cape1', true, 'armadura'));
    const lista = campo(boneFields(file, 'cape1'), 'skinMembers')!;
    expect(lista.label).toBe('Skins que ativam');
    expect(lista.kind).toBe('checklist');
    expect(lista.options!.map((o) => o.value)).toEqual(['armadura', 'armadura_capa']);
    expect(lista.fallback).toEqual(['armadura']);
  });

  it('cada caixa de Peles que ativam é um ToggleSkinBone', () => {
    const file = heroi();
    run(file, new SetSkinRequired('bones', 'cape1', true, 'armadura'));
    const lista = campo(boneFields(file, 'cape1'), 'skinMembers')!;
    const { command } = skinFieldCommand(file, [], lista, ['armadura', 'armadura_capa']);
    run(file, command!);
    expect(skinsListing(file, 'bones', 'cape1')).toEqual(['armadura', 'armadura_capa']);
    const tirar = skinFieldCommand(file, [], lista, ['armadura_capa']).command!;
    run(file, tirar);
    expect(skinsListing(file, 'bones', 'cape1')).toEqual(['armadura_capa']);
  });

  it('a regra ganha as mesmas duas linhas', () => {
    const file = heroi();
    const flag = campo(constraintFields(file, 'hair_physics'), 'skinRequired')!;
    expect(flag.skinRequiredOf).toEqual({ kind: 'constraints', name: 'hair_physics' });
    run(file, skinFieldCommand(file, ['armadura'], flag, true).command!);
    expect(pele(file, 'armadura').constraints).toEqual(['hair_physics']);
    expect(campo(constraintFields(file, 'hair_physics'), 'skinMembers')!.fallback)
      .toEqual(['armadura']);
  });

  it('validador: zero avisos de pele depois de marcar, e depois de desmarcar', () => {
    const file = heroi();
    expect(avisosDePele(file)).toEqual([]);
    run(file, new SetSkinRequired('bones', 'cape1', true, 'armadura'));
    run(file, new ToggleSkinBone('armadura_capa', 'cape1'));
    expect(avisosDePele(file)).toEqual([]);
    // Desmarcar tira de TODA pele. Se sobrasse numa, o validador avisaria
    // `bone "cape1" is not skinRequired` (HINT_SKIN_BONE).
    const tira = new SetSkinRequired('bones', 'cape1', false, null);
    run(file, tira);
    expect(skinsListing(file, 'bones', 'cape1')).toEqual([]);
    expect(file.bones.find((b) => b.name === 'cape1')!.skinRequired).toBeUndefined();
    expect(avisosDePele(file)).toEqual([]);
    undo(file, tira);
    expect(skinsListing(file, 'bones', 'cape1')).toEqual(['armadura', 'armadura_capa']);
  });
});

// ---------------------------------------------------------------------------
// Trocar a imagem em todas as peles
// ---------------------------------------------------------------------------

describe('Trocar a imagem em todas as peles', () => {
  it("SwapImageEverywhere('body', 'body', 'body_armor'): só onde a imagem é body", () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    const armadura = JSON.stringify(pele(file, 'armadura'));
    const capa = JSON.stringify(pele(file, 'armadura_capa'));
    const cmd = new SwapImageEverywhere('body', 'body', 'body_armor');
    run(file, cmd);
    expect((pele(file, 'default').attachments!['body']!['body'] as { path: string }).path)
      .toBe('body_armor');
    // A armadura mostra `armadura/body` no mesmo slot: outra imagem, fica.
    expect(JSON.stringify(pele(file, 'armadura'))).toBe(armadura);
    // A capa não tem o slot: intacta.
    expect(JSON.stringify(pele(file, 'armadura_capa'))).toBe(capa);
    expect(cmd.changed).toBe(1);
    undo(file, cmd);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('troca em várias peles de uma vez', () => {
    const file = heroi();
    // Uma segunda pele com o mesmo `hand` na mão: a troca pega as duas.
    file.skins!.push({
      name: 'inverno',
      attachments: { hand: { hand: { type: 'region', path: 'hand_' } } },
    } as never);
    expect(skinsWithImage(file, 'hand', 'hand_')).toEqual(['default', 'inverno']);
    const antes = JSON.stringify(file);
    const cmd = new SwapImageEverywhere('hand', 'hand_', 'luva');
    run(file, cmd);
    expect(cmd.changed).toBe(2);
    expect(skinsWithImage(file, 'hand', 'luva')).toEqual(['default', 'inverno']);
    // A mão fechada tem outra imagem: não muda.
    expect((pele(file, 'default').attachments!['hand']!['hand_fist'] as { path: string }).path)
      .toBe('hand_03');
    undo(file, cmd);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('sem path escrito, a imagem é o nome; o revert tira o path de novo', () => {
    const file = heroi();
    delete (pele(file, 'default').attachments!['leg_front']!['thigh'] as { path?: string }).path;
    const antes = JSON.stringify(file);
    const cmd = new SwapImageEverywhere('leg_front', 'thigh', 'thigh_nova');
    run(file, cmd);
    expect((pele(file, 'default').attachments!['leg_front']!['thigh'] as { path: string }).path)
      .toBe('thigh_nova');
    undo(file, cmd);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('o desenho escolhido prepara a troca; ponto e caixa não têm imagem', () => {
    const file = heroi();
    const pick = swapPickFor(file, 'hand', 'hand_fist')!;
    expect(pick).toEqual({ slot: 'hand', attachment: 'hand_fist', from: 'hand_03', skins: ['default'] });
    expect(swapPickFor(file, 'hand_point', 'hand_point')).toBeNull();
    expect(swapPickFor(file, 'hitbox', 'hitbox')).toBeNull();
    expect(swapNotice(pick, 'hand_04', 1)).toBe('hand_03 → hand_04 no slot hand, em 1 skin');
    expect(swapNotice(pick, 'hand_03', 0)).toContain('Nada mudou');
  });

  // P33 (29/09/2026), a5: as portas de pele do Esqueleto moravam em Peles ▸.
  // Rodada 6 (05/10/2026): o submenu virou o menu Skins, na barra.
  it('a porta: botão direito da Árvore e menu Skins → Trocar imagem nas skins…', () => {
    expect(CONTEXT_ACTIONS.map((c) => c.action)).toContain('trocar-imagem-todas-peles');
    const item = skinsMenu().find((i) => 'action' in i && i.action === 'trocar-imagem-todas-peles') as
      MenuEntry | undefined;
    expect(item?.label).toBe('Trocar imagem nas skins…');
    // E não ficou uma cópia no menu Base.
    const base = skeletonMenu({
      lockBones: false, lockDrawings: false, canRepack: false, space: 'local',
      compensation: { children: false, drawings: false, boxes: false },
    } as never);
    expect(flatEntries(base).some((e) => e.action === 'trocar-imagem-todas-peles')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// O manual
// ---------------------------------------------------------------------------

describeManual('o manual do capítulo 3 acompanha', () => {
  // Espaços achatados: o manual quebra a linha no meio da frase.
  const ler = (...partes: string[]): string =>
    readFileSync(resolve(RAIZ, 'documentos', 'manual', ...partes), 'utf8').replace(/\s+/g, ' ');
  const pt = ler('03-peles.md');
  const en = ler('en', '03-skins.md');
  const pendencias = (texto: string, marca: string): string =>
    texto.slice(texto.indexOf(marca));

  it('as duas linhas saíram de "O que ainda não funciona"', () => {
    const resto = pendencias(pt, '## O que ainda não funciona');
    expect(resto).not.toContain('skin.bones');
    expect(resto).not.toContain('trocar a imagem em todas as skins');
    const rest = pendencias(en, '## What does not work yet');
    expect(rest).not.toContain('skin.bones');
    expect(rest).not.toContain('swap this image');
  });

  it('os dois passos novos estão escritos, nas duas línguas', () => {
    for (const texto of [pt, en]) {
      expect(texto).toContain('Skins que ativam');
      expect(texto).toContain('Trocar a imagem em todas as skins');
      expect(texto).toContain('Marque em que skin, em Propriedades');
    }
  });
});
});

// ---------------------------------------------------------------------------
// ponto no slot (lote 40) — era `lote40-ponto-no-slot.test.ts`
// ---------------------------------------------------------------------------

describe('ponto no slot (lote 40)', () => {
/**
 * Lote 40 — rodada 4: ponto e caixa dentro de um slot que já existe (Spine 4).
 *
 * No formato, ponto e caixa **sempre foram** anexos (§7.1): trocam por chave
 * `slot/attachment` e por pele. O editor é que criava um slot novo para cada
 * um. Aqui se prova o caminho "neste slot": o anexo nasce no slot, não vira o
 * ativo, e o runtime de referência só o mostra depois da chave.
 *
 * Sem DOM. O mundo sai pelo `pose-dump`, o mesmo caminho da conformidade.
 */
const RAIZ = resolve(__dirname, '..', '..');
const HEROI = resolve(RAIZ, 'formato', 'exemplos', 'heroi.bone');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(HEROI, 'utf8')) as BoneFile;
}

function doc(file: BoneFile): EditorDoc {
  return { file } as unknown as EditorDoc;
}

function pele(file: BoneFile, name: string) {
  return (file.skins ?? []).find((s) => s.name === name);
}

function sel(parte: Partial<Selection>): Selection {
  return { ...emptySelection(), ...parte };
}

/** Um evento de ferramenta no mundo, com escala 1. */
function ev(x: number, y: number, alt = false): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt, button: 0, scale: 1 };
}

/** Troca a chave do meio da mão, na `walk`, por `valor`. */
function chaveNaMao(file: BoneFile, valor: string): void {
  const walk = file.animations!.find((a) => a.name === 'walk')!;
  const linha = walk.timelines!.find((t) =>
    (t as { target?: string; property?: string }).target === 'hand'
    && (t as { property?: string }).property === 'attachment') as { keys: Array<{ time: number; value: string | null }> };
  linha.keys[1]!.value = valor;
}

function dump(file: BoneFile, canal: 'points' | 'boundingBoxes', times: number[]) {
  const data = loadSkeletonData(JSON.parse(JSON.stringify(file)) as unknown);
  return buildPoseDump(data, { animation: 'walk', times, measure: [canal] as never });
}

// ---------------------------------------------------------------------------
// O comando
// ---------------------------------------------------------------------------

describe('AddAttachmentToSlot', () => {
  it("('hand', 'default', 'hand_ponto', ponto): uma chave a mais; o slot não muda", () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    const slots = file.slots!.length;
    const cmd = new AddAttachmentToSlot('hand', 'default', 'hand_ponto', pointAttachment(10, 0, 0));
    cmd.apply(doc(file));
    expect(Object.keys(pele(file, 'default')!.attachments!['hand']!))
      .toEqual(['hand', 'hand_fist', 'hand_ponto']);
    expect(pele(file, 'default')!.attachments!['hand']!['hand_ponto'])
      .toEqual({ type: 'point', x: 10, y: 0, rotation: 0 });
    // O desenho ativo continua a mão: o ponto nasce com a bolinha ○.
    expect(file.slots!.find((s) => s.name === 'hand')!.attachment).toBe('hand');
    expect(file.slots!.length).toBe(slots);
    cmd.revert(doc(file));
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('nome repetido no slot vira hand_ponto_2', () => {
    const file = heroi();
    new AddAttachmentToSlot('hand', 'default', 'hand_ponto', pointAttachment(0, 0, 0)).apply(doc(file));
    const segundo = new AddAttachmentToSlot('hand', 'default', 'hand_ponto', pointAttachment(0, 0, 0));
    segundo.apply(doc(file));
    expect(segundo.name).toBe('hand_ponto_2');
    expect(attachmentNameInSlot(file, 'hand', 'hand_ponto')).toBe('hand_ponto_3');
  });

  it('o nome olha todas as peles do slot, e refazer dá o mesmo nome', () => {
    const file = heroi();
    // `hand` já é nome de desenho do slot `hand` na default.
    const cmd = new AddAttachmentToSlot('hand', 'armadura', 'hand', pointAttachment(0, 0, 0));
    cmd.apply(doc(file));
    expect(cmd.name).toBe('hand_2');
    cmd.revert(doc(file));
    cmd.apply(doc(file));
    expect(cmd.name).toBe('hand_2');
  });

  it('pele sem o slot, e pele que não existe: o revert devolve o texto', () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    const naArmadura = new AddAttachmentToSlot('hand', 'armadura', 'hand_caixa', boxAttachment([0, 0, 10, 0, 10, 10, 0, 10]));
    naArmadura.apply(doc(file));
    expect(Object.keys(pele(file, 'armadura')!.attachments!['hand']!)).toEqual(['hand_caixa']);
    naArmadura.revert(doc(file));
    expect(JSON.stringify(file)).toBe(antes);

    const noInverno = new AddAttachmentToSlot('hand', 'inverno', 'hand_ponto', pointAttachment(0, 0, 0));
    noInverno.apply(doc(file));
    expect(pele(file, 'inverno')!.attachments!['hand']!['hand_ponto']).toBeDefined();
    noInverno.revert(doc(file));
    expect(JSON.stringify(file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// Onde nasce
// ---------------------------------------------------------------------------

describe('shapeTarget — a seleção escolhe o caminho', () => {
  const file = heroi();
  it('um slot escolhido, sem osso: dentro dele, no osso dele', () => {
    expect(shapeTarget(file, sel({ slots: ['hand'] })))
      .toEqual({ kind: 'slot', slot: 'hand', bone: 'forearm' });
  });
  it('com osso junto (o clique na cena): slot novo, como sempre', () => {
    expect(shapeTarget(file, sel({ bones: ['forearm'], slots: ['hand'] })))
      .toEqual({ kind: 'bone', bone: 'forearm' });
  });
  it('nada escolhido: o primeiro osso', () => {
    expect(shapeTarget(file, sel({}))).toEqual({ kind: 'bone', bone: 'root' });
  });
  it('dois slots: não dá para saber qual; slot novo no primeiro osso', () => {
    expect(shapeTarget(file, sel({ slots: ['hand', 'arm'] }))).toEqual({ kind: 'bone', bone: 'root' });
  });
});

// ---------------------------------------------------------------------------
// O runtime de referência
// ---------------------------------------------------------------------------

describe('a chave slot/attachment troca o ponto e a caixa', () => {
  it('o canal points traz hand/hand_ponto no tempo da chave, e não antes', () => {
    const file = heroi();
    new AddAttachmentToSlot('hand', 'default', 'hand_ponto', pointAttachment(12, 3, 45)).apply(doc(file));
    chaveNaMao(file, 'hand_ponto');
    const out = dump(file, 'points', [0, 0.4, 0.5]);
    const pontos = out.samples.map((s) => Object.keys(s.points ?? {}));
    expect(pontos[0]).not.toContain('hand/hand_ponto');
    expect(pontos[1]).not.toContain('hand/hand_ponto');
    expect(pontos[2]).toContain('hand/hand_ponto');
    // O ponto do slot próprio, `hand_point`, continua lá o tempo todo.
    for (const lista of pontos) expect(lista).toContain('hand_point/hand_point');
  });

  it('o canal boundingBoxes traz hand/hand_caixa no tempo da chave, e não antes', () => {
    const file = heroi();
    new AddAttachmentToSlot('hand', 'default', 'hand_caixa',
      boxAttachment(boxVertices(0, 0, 20, 10))).apply(doc(file));
    chaveNaMao(file, 'hand_caixa');
    const out = dump(file, 'boundingBoxes', [0.4, 0.5]);
    expect(Object.keys(out.samples[0]!.boundingBoxes ?? {})).not.toContain('hand/hand_caixa');
    expect(Object.keys(out.samples[1]!.boundingBoxes ?? {})).toContain('hand/hand_caixa');
  });

  it('o arquivo com o anexo novo carrega sem aviso', () => {
    const file = heroi();
    const antes = loadSkeletonData(file).warnings.length;
    new AddAttachmentToSlot('hand', 'default', 'hand_ponto', pointAttachment(0, 0, 0)).apply(doc(file));
    chaveNaMao(file, 'hand_ponto');
    expect(loadSkeletonData(file).warnings.length).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// As ferramentas
// ---------------------------------------------------------------------------

describe('as ferramentas escolhem o caminho pela seleção', () => {
  it('Ponto com o slot hand escolhido: anexo no slot, um passo de desfazer', () => {
    const d = new Doc(heroi());
    const antes = JSON.stringify(d.file);
    const slots = d.file.slots!.length;
    d.select(sel({ slots: ['hand'] }));
    pointTool.onDown!(d, ev(100, 100, true));
    pointTool.onUp!(d, ev(160, 100, true));
    expect(d.file.slots!.length).toBe(slots);
    expect(pele(d.file, 'default')!.attachments!['hand']!['hand_ponto']).toMatchObject({ type: 'point' });
    expect(d.file.slots!.find((s) => s.name === 'hand')!.attachment).toBe('hand');
    // O slot continua escolhido, junto com o ponto novo.
    expect(d.selection.slots).toEqual(['hand']);
    expect(d.selection.attachments).toEqual([{ slot: 'hand', attachment: 'hand_ponto' }]);
    d.undo();
    expect(JSON.stringify(d.file)).toBe(antes);
  });

  it('Ponto com osso e slot escolhidos (clique na cena): slot novo, como antes', () => {
    const d = new Doc(heroi());
    const slots = d.file.slots!.length;
    d.select(sel({ bones: ['forearm'], slots: ['hand'] }));
    pointTool.onDown!(d, ev(100, 100, true));
    pointTool.onUp!(d, ev(100, 100, true));
    expect(d.file.slots!.length).toBe(slots + 1);
    expect(d.file.slots!.some((s) => s.name === 'forearm_ponto')).toBe(true);
  });

  it('Caixa com o slot hand escolhido: anexo no slot', () => {
    const d = new Doc(heroi());
    const slots = d.file.slots!.length;
    d.select(sel({ slots: ['hand'] }));
    boxTool.onDown!(d, ev(0, 0, true));
    boxTool.onUp!(d, ev(40, 30, true));
    expect(d.file.slots!.length).toBe(slots);
    expect(pele(d.file, 'default')!.attachments!['hand']!['hand_caixa'])
      .toMatchObject({ type: 'boundingbox', shape: 'polygon' });
  });

  // Lote 64: a bolinha ○ saiu da Árvore, que tem uma linha por slot; quem
  // troca o desenho do slot é o campo Anexo das Propriedades.
  it('a frase do rodapé diz o slot e onde escolher o desenho', () => {
    expect(inSlotNotice('Ponto', 'hand_ponto', 'hand')).toContain('entrou no slot hand');
    expect(inSlotNotice('Ponto', 'hand_ponto', 'hand')).toContain('campo Anexo das Propriedades');
  });
});

// ---------------------------------------------------------------------------
// As portas e o manual
// ---------------------------------------------------------------------------

describe('menu e manual', () => {
  it('Esqueleto → Novo tem Ponto neste slot e Caixa neste slot', () => {
    const menu = skeletonMenu({
      lockBones: false, lockDrawings: false, canRepack: false, space: 'local',
      compensation: { children: false, drawings: false, boxes: false },
    } as never);
    const novo = menu.find((item) => 'label' in item && item.label === 'Novo') as { children: Array<{ action: string }> };
    const acoes = novo.children.map((c) => c.action);
    expect(acoes).toContain('novo-ponto-no-slot');
    expect(acoes).toContain('novo-caixa-no-slot');
  });

  itManual('o capítulo 2 diz os dois caminhos, nas duas línguas', () => {
    const ler = (...partes: string[]): string =>
      readFileSync(resolve(RAIZ, 'documentos', 'manual', ...partes), 'utf8').replace(/\s+/g, ' ');
    for (const texto of [ler('02-montar-o-personagem.md'), ler('en', '02-build-the-character.md')]) {
      expect(texto).toContain('Ponto neste slot');
      expect(texto).toContain('Caixa neste slot');
      expect(texto).toContain('○');
    }
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 9 (18/09/2026) — Feitas e Ativas, a pilha e o lápis separados
// ---------------------------------------------------------------------------

describe('degrau 9 — a pilha e o lápis', () => {
/**
 * *"No lugar do olho, eu queria poder clicar na skin e arrastar"* — Humberto,
 * 17/09/2026. E, de 16/09: *"o esqueleto em cima e o anjo embaixo dá tronco de
 * esqueleto e pernas de anjo"* — **a de cima vence**.
 *
 * Até o D8 havia uma lista só, `visibleSkins`, que era três coisas ao mesmo
 * tempo: quem está ligada, quem vence, e onde o desenho novo nasce. Este
 * degrau separou em duas — a **pilha** (spec §4.4, de baixo para cima, com a
 * `default` dentro e podendo sair) e o **lápis**.
 *
 * Sem DOM: as contas são puras, e o documento é um `Doc` de verdade.
 */

const D9_EXEMPLO = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const D9_TEXTO = readFileSync(D9_EXEMPLO, 'utf8');

function corpo(): Doc {
  return new Doc(JSON.parse(D9_TEXTO) as BoneFile, { path: D9_EXEMPLO });
}

// --- a pilha, como conta pura ---------------------------------------------

describe('arrastar liga, tira e reordena', () => {
  it('a pilha nasce com a `default` dentro, e não por fora', () => {
    const doc = corpo();
    expect(skinStackOf(doc)).toEqual(['default']);
    expect(editingSkinOf(doc)).toBe(null);
  });

  it('soltar em Ativas liga a pele, e ela entra onde foi solta', () => {
    // A posição é a da TELA: 0 é o topo, que é quem vence.
    expect(stackDrop(['default'], 'armadura', 0)).toEqual(['default', 'armadura']);
    expect(stackDrop(['default'], 'armadura', 1)).toEqual(['armadura', 'default']);
  });

  it('soltar uma que já está na pilha move, não duplica', () => {
    const pilha = ['default', 'armadura', 'armadura_capa'];
    expect(stackDrop(pilha, 'default', 0)).toEqual(['armadura', 'armadura_capa', 'default']);
    expect(stackDrop(pilha, 'armadura_capa', 2)).toEqual(['armadura_capa', 'default', 'armadura']);
  });

  it('arrastar para fora de Ativas desliga, e só isso', () => {
    expect(stackRemove(['default', 'armadura'], 'armadura')).toEqual(['default']);
    expect(stackRemove(['default'], 'armadura')).toEqual(['default']);
  });

  it('ligar sem dizer onde põe no topo: a última a entrar vence', () => {
    expect(stackAddOnTop(['default'], 'armadura')).toEqual(['default', 'armadura']);
    expect(stackAddOnTop(['default', 'armadura'], 'default')).toEqual(['armadura', 'default']);
  });

  it('a coluna Ativas mostra a de CIMA primeiro — a pilha de cabeça para baixo', () => {
    const doc = corpo();
    const rows = activeStackRows(doc.file, ['default', 'armadura', 'armadura_capa']);
    expect(rows.map((r) => r.name)).toEqual(['armadura_capa', 'armadura', 'default']);
  });

  it('nome de pele que o corpo não tem fica fora da lista, e é contado para o aviso', () => {
    const doc = corpo();
    const pilha = ['default', 'asas_do_anjo'];
    expect(activeStackRows(doc.file, pilha).map((r) => r.name)).toEqual(['default']);
    expect(lostSkins(doc.file, pilha)).toEqual(['asas_do_anjo']);
  });
});


// --- o defeito 4: a pele liga, diz "ligada", e nada muda -------------------

/*
 * Achado ABRINDO O PROGRAMA em 21/09/2026, com 3.801 verdes na suite. Arrastar
 * a `armadura` para a coluna Ativas dizia *"Pele 'armadura' ligada"* e o
 * personagem nao mudava nada: a pele caia EMBAIXO, e embaixo a `default`
 * cobre os tres desenhos dela (§4.4, a de cima vence).
 *
 * Dois testes, e eles sao diferentes: um julga ONDE a pele cai, outro julga O
 * QUE O RODAPE DIZ. O segundo e a regra 21 — a frase nao pode afirmar um
 * efeito que nao houve.
 */
describe('soltar na coluna Ativas liga a pele, e ligar tem de APARECER', () => {
  it('a armadura embaixo da default nao vale em lugar nenhum: os tres sao cobertos', () => {
    const doc = corpo();
    // A pilha do defeito, escrita a mao: a armadura no fundo.
    const showing = skinShowing(doc.file, 'armadura', ['armadura', 'default']);
    expect(showing.wins).toBe(0);
    // Tres lugares: `body` e `head` com desenho, e `hair` com o `null` do elmo.
    expect(showing.covered).toBe(3);
    expect(showing.coveredBy).toEqual(['default']);
  });

  it('a armadura no topo vale nos tres: e o que a foto 3 do Planejador mostra', () => {
    const doc = corpo();
    const showing = skinShowing(doc.file, 'armadura', ['default', 'armadura']);
    expect(showing.wins).toBe(3);
    expect(showing.covered).toBe(0);
    expect(showing.coveredBy).toEqual([]);
  });

  it('esconder com `null` TAMBEM e um efeito: o elmo tira o cabelo da cena', () => {
    const doc = corpo();
    // `armadura.hair` e `null` (§4.4): o elmo tapa o cabelo. Contar so os
    // desenhos diria "nada dela aparece" numa pele que MUDA a cena — a mesma
    // mentira deste lote, do outro lado.
    const capa = skinShowing(doc.file, 'armadura_capa', ['default', 'armadura_capa']);
    expect(capa.wins).toBe(1);
    expect(skinOnNotice(doc.file, 'armadura_capa', ['default', 'armadura_capa']))
      .toBe('Skin "armadura_capa" ligada');
  });

  it('soltar na COLUNA poe no topo, e por isso a pele aparece', () => {
    const doc = corpo();
    const drop = dropOnColumn(doc.file, ['default'], 'armadura');
    expect(drop.stack).toEqual(['default', 'armadura']);
    expect(skinShowing(doc.file, 'armadura', drop.stack).wins).toBe(3);
    expect(drop.notice).toBe('Skin "armadura" ligada');
  });

  it('soltar numa posicao ESCOLHIDA continua valendo: e o gesto de ordenar', () => {
    const doc = corpo();
    // Posicao de tela 1, com uma pele na pilha: embaixo da `default`.
    const drop = dropAt(doc.file, ['default'], 'armadura', 1);
    expect(drop.stack).toEqual(['armadura', 'default']);
  });

  it('caiu onde nada dela aparece: o rodape DIZ isso, e nao "ligada" (regra 21)', () => {
    const doc = corpo();
    const drop = dropAt(doc.file, ['default'], 'armadura', 1);
    expect(drop.notice).toContain('nada dela aparece');
    expect(drop.notice).toContain('3 lugares');
    expect(drop.notice).toContain('"default"');
    expect(drop.notice).toContain('topo');
  });

  it('a pele que ja estava na pilha foi MOVIDA, e a frase nao diz "ligada"', () => {
    const doc = corpo();
    const drop = dropOnColumn(doc.file, ['default', 'armadura'], 'default');
    expect(drop.stack).toEqual(['armadura', 'default']);
    expect(drop.notice).toContain('movida');
    expect(drop.notice).not.toContain('ligada');
  });

  it('a `armadura_capa` herda da `armadura` pelo `includes`, e a conta segue a §4.4', () => {
    const doc = corpo();
    // A `armadura` embaixo da capa: o `hair` passa a ser da capa, e sobram dois.
    const sob = skinShowing(doc.file, 'armadura', ['default', 'armadura', 'armadura_capa']);
    expect(sob.wins).toBe(2);
    expect(sob.covered).toBe(1);
    expect(sob.coveredBy).toEqual(['armadura_capa']);
  });

  it('pele que o arquivo nao tem (a de fora, F23) nao se conta: a frase fica seca', () => {
    const doc = corpo();
    const showing = skinShowing(doc.file, 'asas_do_anjo', ['default', 'asas_do_anjo']);
    expect(showing.unknown).toBe(true);
    expect(skinOnNotice(doc.file, 'asas_do_anjo', ['default', 'asas_do_anjo']))
      .toBe('Skin "asas_do_anjo" ligada');
  });
});

// --- rodada 17: ligar e desligar entra no Desfazer --------------------------

describe('rodada 17: tirar a skin pelo × é um passo do Desfazer', () => {
  it('o × tira a skin; o Ctrl+Z a devolve (e não desfaz o passo de antes); o Ctrl+Y tira de novo', () => {
    const doc = corpo();
    setSkinStack(doc, ['default', 'armadura']);
    setEditingSkin(doc, 'armadura');
    const passos = doc.history?.entries().length ?? 0;
    takeOffSkin(doc, 'armadura');
    expect(skinStackOf(doc)).toEqual(['default']);
    expect(editingSkinOf(doc)).toBe(null);
    expect(doc.undoLabel).toBe('Desligar a skin "armadura"');
    expect(doc.history?.entries().length ?? 0).toBe(passos + 1);
    doc.undo();
    expect(skinStackOf(doc)).toEqual(['default', 'armadura']);
    expect(editingSkinOf(doc)).toBe('armadura');
    expect(doc.skeleton!.skinStack.map((skin) => skin.name)).toEqual(['default', 'armadura']);
    doc.redo();
    expect(skinStackOf(doc)).toEqual(['default']);
    expect(doc.skeleton!.skinStack.map((skin) => skin.name)).toEqual(['default']);
  });

  it('tirar a `default` também volta, com a arte dela', () => {
    const doc = corpo();
    setSkinStack(doc, ['default']);
    takeOffSkin(doc, 'default');
    expect(doc.skeleton!.skinStack).toEqual([]);
    doc.undo();
    expect(doc.skeleton!.skinStack.map((skin) => skin.name)).toEqual(['default']);
  });

  it('soltar na coluna Ativas (a pilha nova) também se desfaz, e o lápis fica onde estava', () => {
    const doc = corpo();
    setSkinStack(doc, ['default']);
    putSkinStack(doc, ['default', 'armadura'], 'Mudar a pilha de skins');
    expect(skinStackOf(doc)).toEqual(['default', 'armadura']);
    doc.undo();
    expect(skinStackOf(doc)).toEqual(['default']);
    expect(new ChangeSkinStack('x', (v) => v).kind).toBe('structure');
  });
});

// --- a de cima vence, na cena ---------------------------------------------

describe('a de cima vence, e a `default` pode sair', () => {
  it('a pilha vai INTEIRA para o esqueleto, na ordem de baixo para cima', () => {
    const doc = corpo();
    setSkinStack(doc, ['default', 'armadura']);
    expect(doc.skeleton!.skinStack.map((skin) => skin.name)).toEqual(['default', 'armadura']);
  });

  it('tirar a `default` da pilha tira a arte dela da cena (I10)', () => {
    const doc = corpo();
    setSkinStack(doc, ['armadura']);
    expect(doc.skeleton!.skinStack.map((skin) => skin.name)).toEqual(['armadura']);
    // O que a `default` vestia e a armadura não veste fica sem desenho: é o
    // lobisomem que troca quase tudo, e não um homem com armadura por cima.
    const armadura = doc.file.skins!.find((skin) => skin.name === 'armadura')!;
    const vestidos = new Set(Object.keys(armadura.attachments ?? {}));
    const semDesenho = (doc.file.slots ?? [])
      .filter((slot) => !vestidos.has(slot.name))
      .map((slot) => slot.name);
    expect(semDesenho.length).toBeGreaterThan(0);
    for (const nome of semDesenho) {
      expect(doc.skeleton!.findSlot(nome)?.attachment ?? null).toBe(null);
    }
  });

  it('a pilha vazia é uma pilha: o corpo fica sem arte nenhuma', () => {
    const doc = corpo();
    setSkinStack(doc, []);
    expect(doc.skeleton!.skinStack).toEqual([]);
  });

  it('pele que sumiu entre dois redesenhos não derruba a pilha inteira', () => {
    const doc = corpo();
    setSkinStack(doc, ['default', 'asas_do_anjo', 'armadura']);
    expect(doc.skeleton!.skinStack.map((skin) => skin.name)).toEqual(['default', 'armadura']);
  });
});

// --- o lápis ---------------------------------------------------------------

describe('um lápis só, separado da pilha (I5, I6, E10)', () => {
  it('acender o lápis numa pele desligada LIGA a pele (I6)', () => {
    const doc = corpo();
    setEditingSkin(doc, 'armadura');
    expect(editingSkinOf(doc)).toBe('armadura');
    expect(skinStackOf(doc)).toEqual(['default', 'armadura']);
  });

  it('o lápis não muda a ordem de quem já está na pilha', () => {
    const doc = corpo();
    setSkinStack(doc, ['default', 'armadura', 'armadura_capa']);
    setEditingSkin(doc, 'armadura');
    expect(skinStackOf(doc)).toEqual(['default', 'armadura', 'armadura_capa']);
    expect(editingSkinOf(doc)).toBe('armadura');
  });

  it('o osso e a regra novos nascem na pele do lápis, e não na primeira ligada', () => {
    const doc = corpo();
    setSkinStack(doc, ['default', 'armadura', 'armadura_capa']);
    setEditingSkin(doc, 'armadura_capa');
    expect(skinForRequired(doc.file, editingSkinOf(doc))).toBe('armadura_capa');
  });

  it('sem lápis aceso, a tela pergunta em vez de adivinhar', () => {
    const doc = corpo();
    setSkinStack(doc, ['default', 'armadura']);
    expect(skinForRequired(doc.file, editingSkinOf(doc))).toBe(null);
    expect(PICK_SKIN_NOTICE).toContain('skin');
  });

  it('a `default` não recebe "só com a pele": um osso assim seria um osso comum', () => {
    const doc = corpo();
    setEditingSkin(doc, 'default');
    expect(skinForRequired(doc.file, editingSkinOf(doc))).toBe(null);
  });
});

// --- o estado do editor ----------------------------------------------------

describe('a pilha e o lápis no `RECORTE_editor_state` (E10)', () => {
  it('o padrão não se escreve: pilha só com a `default` e sem lápis não vai ao arquivo', () => {
    const doc = corpo();
    doc.captureEditorState();
    const state = readEditorState(doc.file);
    expect(state.pilha).toBeUndefined();
    expect(state.emEdicao).toBeUndefined();
  });

  it('pele ligada que este corpo não tem é dita na barra de avisos (regra 21)', () => {
    const doc = corpo();
    setSkinStack(doc, ['default', 'asas_do_anjo']);
    doc.rebuild();
    expect(doc.warnings.some((aviso) => aviso.includes('asas_do_anjo'))).toBe(true);
    expect(doc.warnings.some((aviso) => aviso.includes('está ligada e esta base não a tem')))
      .toBe(true);
  });

  it('saem em dois campos, e a vista velha continua sendo escrita', () => {
    const doc = corpo();
    setSkinStack(doc, ['armadura', 'default']);
    setEditingSkin(doc, 'armadura');
    doc.captureEditorState();
    const state = readEditorState(doc.file);
    expect(state.pilha).toEqual(['armadura', 'default']);
    expect(state.emEdicao).toBe('armadura');
    // `skins` é a vista velha, para um editor de antes do degrau abrir igual.
    expect(state.skins).toEqual(['armadura']);
  });

  it('reabrir devolve a pilha, inclusive uma `default` que tinha saído', () => {
    const doc = corpo();
    setSkinStack(doc, ['armadura']);
    setEditingSkin(doc, 'armadura');
    doc.captureEditorState();
    const outro = new Doc(JSON.parse(JSON.stringify(doc.file)) as BoneFile);
    expect(skinStackOf(outro)).toEqual(['armadura']);
    expect(editingSkinOf(outro)).toBe('armadura');
  });

  it('arquivo de antes do degrau, só com `skins`, abre pela conta velha', () => {
    const doc = corpo();
    const file = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
    writeEditorState(file, { skins: ['armadura'] });
    const outro = new Doc(file);
    expect(skinStackOf(outro)).toEqual(['default', 'armadura']);
    expect(editingSkinOf(outro)).toBe('armadura');
  });
});

// --- desligar diz o que sumiu ----------------------------------------------

describe('desligar a pele some com o que só existia nela (I6, regra 21)', () => {
  function comRabo(): Doc {
    const doc = corpo();
    doc.file.bones!.push({ name: 'rabo', parent: 'root', skinRequired: true } as never);
    doc.file.skins!.push({
      name: 'lobisomem',
      bones: ['rabo'],
      attachments: { cabeca: { cabeca: { type: 'region', path: 'lobo_cabeca' } } },
    } as never);
    doc.rebuild();
    return doc;
  }

  it('conta o osso, a regra e o desenho que só aquela pele trazia', () => {
    const doc = comRabo();
    const only = skinOnly(doc.file, 'lobisomem', ['default', 'lobisomem']);
    expect(only.bones).toEqual(['rabo']);
    expect(only.constraints).toEqual([]);
  });

  it('a frase do rodapé diz o que saiu, e não só "desligada"', () => {
    const doc = comRabo();
    const frase = skinOff(doc.file, 'lobisomem', ['default', 'lobisomem']);
    expect(frase).toContain('lobisomem');
    expect(frase).toContain('1 osso');
    expect(frase).toContain('só existiam nela');
  });

  it('pele que não trazia nada de exclusivo desliga sem alarde', () => {
    const doc = corpo();
    expect(skinOff(doc.file, 'armadura_capa', ['default', 'armadura_capa']))
      .toBe('Skin "armadura_capa" desligada');
  });

  it('o osso da pele desligada some da cena — quem faz sumir é o runtime', () => {
    const doc = comRabo();
    setSkinStack(doc, ['default', 'lobisomem']);
    expect(doc.skeleton!.findBone('rabo')).not.toBe(null);
    setSkinStack(doc, ['default']);
    // `skinRequired`: o osso continua no arquivo, e não é ativado por pele
    // nenhuma — é o `activeSkinBones` do runtime que decide isso (§7.1).
    const rabo = doc.skeleton!.findBone('rabo');
    expect(rabo).not.toBe(null);
    expect([...doc.skeleton!.activeSkinBones].map((b) => b.name)).not.toContain('rabo');
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 9, lote 2 — o lápis cria, e a virada guarda a pilha
// ---------------------------------------------------------------------------

describe('degrau 9 — um lápis só: o osso e a regra nascem na pele', () => {
/**
 * O teste ao vivo de 16/09/2026, nas palavras do Humberto: *"o lápis não faz
 * nada"*. Ele acendeu o lápis na pele `lobisomem`, criou um osso, e o osso
 * nasceu do corpo — igual ao homem, presente em toda pele.
 *
 * O desenho já nascia na pele desde o lote 27. O **osso** e a **regra** não,
 * porque nasciam por comandos que não sabiam que peles existiam. Agora nascem
 * `skinRequired` e já listados na pele do lápis, **num passo de desfazer só**:
 * um `Ctrl+Z` tira o osso e a marca juntos, como entraram (regra 6 da casa).
 */

const L2_EXEMPLO = resolve(__dirname, '../../formato/exemplos/heroi.bone');

function corpo(): Doc {
  return new Doc(JSON.parse(readFileSync(L2_EXEMPLO, 'utf8')) as BoneFile, { path: L2_EXEMPLO });
}

function peleDe(doc: Doc, nome: string): { bones?: string[]; constraints?: string[] } {
  return (doc.file.skins ?? []).find((skin) => skin.name === nome)!;
}

describe('nascer na pele do lápis (I5)', () => {
  it('o osso novo nasce `skinRequired` e listado na pele', () => {
    const doc = corpo();
    setEditingSkin(doc, 'armadura');
    addBone(doc);
    const novo = doc.file.bones!.find((b) => b.name.startsWith('osso'))!;
    expect(novo.skinRequired).toBe(true);
    expect(peleDe(doc, 'armadura').bones).toContain(novo.name);
  });

  it('e sai inteiro num desfazer só: o osso e a marca juntos', () => {
    const doc = corpo();
    const antes = JSON.stringify(doc.file);
    setEditingSkin(doc, 'armadura');
    addBone(doc);
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('sem lápis aceso, o osso nasce do corpo, como sempre', () => {
    const doc = corpo();
    addBone(doc);
    const novo = doc.file.bones!.find((b) => b.name.startsWith('osso'))!;
    expect(novo.skinRequired).toBeUndefined();
    for (const skin of doc.file.skins ?? []) {
      expect(skin.bones ?? []).not.toContain(novo.name);
    }
  });

  it('com o lápis na `default`, também nasce do corpo: seria um osso comum', () => {
    const doc = corpo();
    setEditingSkin(doc, 'default');
    addBone(doc);
    const novo = doc.file.bones!.find((b) => b.name.startsWith('osso'))!;
    expect(novo.skinRequired).toBeUndefined();
  });

  it('o `BornInSkin` devolve o arquivo exatamente como estava', () => {
    const doc = corpo();
    const antes = JSON.stringify(doc.file, null, 2);
    const command = new AddBone(doc.file, null);
    const wrapped = new BornInSkin(command, 'bones', command.name, 'armadura');
    doc.run(wrapped);
    doc.undo();
    expect(JSON.stringify(doc.file, null, 2)).toBe(antes);
  });

  it('a frase do rodapé diz em que pele ele nasceu, e o que isso custa', () => {
    const frase = bornInSkinNotice('O osso "rabo"', 'lobisomem');
    expect(frase).toContain('lobisomem');
    expect(frase).toContain('some quando ela sai da pilha');
  });
});

describe('o sinal na Árvore (I5, B2)', () => {
  it('o osso só da pele leva na linha o nome da pele que o liga', () => {
    const doc = corpo();
    setEditingSkin(doc, 'armadura');
    addBone(doc);
    const novo = doc.file.bones!.find((b) => b.name.startsWith('osso'))!;
    const linha = hierarchyRows(doc.file).find((row) => row.name === novo.name)!;
    expect(linha.skinOf).toBe('armadura');
  });

  it('o osso comum não leva sinal nenhum — a marca é para o que some', () => {
    const doc = corpo();
    const linha = hierarchyRows(doc.file).find((row) => row.kind === 'bone')!;
    expect(linha.skinOf).toBeUndefined();
  });

  it('duas peles ligando o mesmo osso saem as duas na dica', () => {
    const doc = corpo();
    doc.file.bones!.push({ name: 'rabo', parent: 'root', skinRequired: true } as never);
    peleDe(doc, 'armadura').bones = ['rabo'];
    peleDe(doc, 'armadura_capa').bones = ['rabo'];
    const linha = hierarchyRows(doc.file).find((row) => row.name === 'rabo')!;
    expect(linha.skinOf).toBe('armadura, armadura_capa');
    expect(skinOnlyHint(linha.skinOf!)).toContain('armadura, armadura_capa');
  });

  it('`skinRequired` sem pele nenhuma é dito como o que é: um osso que nunca aparece', () => {
    const doc = corpo();
    doc.file.bones!.push({ name: 'orfao', parent: 'root', skinRequired: true } as never);
    const linha = hierarchyRows(doc.file).find((row) => row.name === 'orfao')!;
    expect(linha.skinOf).toBeUndefined();
    expect(skinOnlyHint('')).toContain('nunca aparece');
  });
});

describe('a ficha da virada: a pilha passa? (9.9, I14)', () => {
  function comVirada(): Doc {
    const doc = corpo();
    const animacao = doc.file.animations![0]!.name;
    setBodyKey(doc.file, animacao, 0.5, 'lobisomem.bone');
    doc.animation = animacao;
    doc.time = 0.5;
    return doc;
  }

  it('a ficha só aparece com o cursor EM CIMA da virada', () => {
    const doc = comVirada();
    expect(bodyKeyView(doc.file, doc.animation, 0.5)).not.toBe(null);
    expect(bodyKeyView(doc.file, doc.animation, 0.25)).toBe(null);
    expect(bodyKeyView(doc.file, null, 0.5)).toBe(null);
  });

  it('o padrão do formato é a pilha PASSAR (§9.13)', () => {
    const doc = comVirada();
    expect(bodyKeyView(doc.file, doc.animation, 0.5)!.keepSkins).toBe(true);
  });

  it('desligar grava `false`; religar apaga o campo, em vez de escrever o padrão', () => {
    const doc = comVirada();
    const animacao = doc.animation!;
    doc.run(new SetKeepSkins(animacao, 0.5, false));
    expect(bodyKeys(doc.file, animacao)[0]!.keepSkins).toBe(false);
    doc.run(new SetKeepSkins(animacao, 0.5, true));
    expect(Object.prototype.hasOwnProperty.call(bodyKeys(doc.file, animacao)[0]!, 'keepSkins'))
      .toBe(false);
  });

  it('desfazer devolve o arquivo letra por letra', () => {
    const doc = comVirada();
    const antes = JSON.stringify(doc.file, null, 2);
    doc.run(new SetKeepSkins(doc.animation!, 0.5, false));
    doc.undo();
    expect(JSON.stringify(doc.file, null, 2)).toBe(antes);
  });

  it('a frase explica a escolha com o caso dele: o lobisomem sem a armadura', () => {
    expect(KEEP_SKINS_LABEL).toContain('pilha');
    expect(KEEP_SKINS_HINT).toContain('lobisomem');
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 9, lote 3 — a pele de uma pasta, a pele em arquivo, a pele que vira base
// ---------------------------------------------------------------------------

describe('degrau 9 — fazer, levar e promover a pele', () => {
/**
 * As três portas que faltavam, todas com palavra dele:
 *
 * | # | O quê | A palavra |
 * |:---:|:---|:---|
 * | I9 | fazer a pele **de uma pasta inteira**, como o Spriter | *"trocar uma imagem por vez ou a pasta inteira"* |
 * | I12, F23 | **Exportar / Importar pele**: a pele de fora, com osso | *"a pele de fora é a mesma pele salva em arquivo"* |
 * | I13, F25 | **Promover pele a base** | *"Lobisomem: os dois"* |
 */

const L3_EXEMPLO = resolve(__dirname, '../../formato/exemplos/heroi.bone');

function corpo(): Doc {
  return new Doc(JSON.parse(readFileSync(L3_EXEMPLO, 'utf8')) as BoneFile, { path: L3_EXEMPLO });
}

// --- a pele de uma pasta (I9) ---------------------------------------------

describe('fazer a pele de uma pasta, como o Spriter (I9)', () => {
  const IMAGENS = [
    'cabeca', 'tronco', 'mao_e',
    'lobisomem/cabeca', 'lobisomem/tronco', 'lobisomem/rabo',
  ];

  it('a pasta de uma imagem é lida do nome, e o grupo do PSD chega assim', () => {
    expect(folderOf('lobisomem/cabeca')).toBe('lobisomem');
    expect(folderOf('cabeca')).toBe('');
    expect(baseNameOf('lobisomem/cabeca')).toBe('cabeca');
    expect(imageFolders(IMAGENS)).toEqual(['lobisomem']);
  });

  it('o plano casa por NOME DE ARQUIVO — é o que o Spriter não faz', () => {
    const doc = corpo();
    // Um corpo pequeno, para a conta caber na cabeça de quem lê o teste.
    doc.file.slots = [{ name: 'cabeca', bone: 'root' }, { name: 'tronco', bone: 'root' }] as never;
    doc.file.skins = [{
      name: 'default',
      attachments: {
        cabeca: { cabeca: { type: 'region', path: 'cabeca' } },
        tronco: { tronco: { type: 'region', path: 'tronco' } },
      },
    }] as never;
    const plano = folderSkinPlan(doc.file, 'default', 'lobisomem', IMAGENS);
    expect(plano.matched.map((m) => m.to)).toEqual(['lobisomem/cabeca', 'lobisomem/tronco']);
    expect(plano.missing).toEqual([]);
  });

  it('o que a pasta NÃO tem é dito, e não some em silêncio (regra 21)', () => {
    const doc = corpo();
    doc.file.slots = [{ name: 'cabeca', bone: 'root' }, { name: 'mao_e', bone: 'root' }] as never;
    doc.file.skins = [{
      name: 'default',
      attachments: {
        cabeca: { cabeca: { type: 'region', path: 'cabeca' } },
        mao_e: { mao_e: { type: 'region', path: 'mao_e' } },
      },
    }] as never;
    const plano = folderSkinPlan(doc.file, 'default', 'lobisomem', IMAGENS);
    expect(plano.matched).toHaveLength(1);
    expect(plano.missing).toEqual(['mao_e/mao_e']);
    expect(folderSkinNotice('lobisomem', plano)).toContain('continua o de baixo');
  });

  it('ponto, caixa e máscara não contam: eles não têm imagem para trocar', () => {
    const doc = corpo();
    doc.file.slots = [{ name: 'mira', bone: 'root' }] as never;
    doc.file.skins = [{
      name: 'default', attachments: { mira: { mira: { type: 'point' } } },
    }] as never;
    const plano = folderSkinPlan(doc.file, 'default', 'lobisomem', IMAGENS);
    expect(plano.matched).toEqual([]);
    expect(plano.missing).toEqual([]);
  });

  it('a pele nova fica com a geometria da de origem, e só o `path` muda', () => {
    const doc = corpo();
    doc.file.slots = [{ name: 'cabeca', bone: 'root' }] as never;
    doc.file.skins = [{
      name: 'default',
      attachments: { cabeca: { cabeca: { type: 'region', path: 'cabeca', x: 12, y: 30, width: 40, height: 44 } } },
    }] as never;
    const plano = folderSkinPlan(doc.file, 'default', 'lobisomem', IMAGENS);
    doc.run(new MakeSkinFromFolder(doc.file, 'default', plano, 'lobisomem'));
    const peles = doc.file.skins as unknown as Array<{ name: string; attachments: Record<string, Record<string, unknown>> }>;
    const nova = peles.find((skin) => skin.name === 'lobisomem')!;
    const anexo = nova.attachments['cabeca']!['cabeca'] as Record<string, unknown>;
    expect(anexo['path']).toBe('lobisomem/cabeca');
    expect(anexo['x']).toBe(12);
    expect(anexo['width']).toBe(40);
  });

  it('desfazer tira a pele inteira', () => {
    const doc = corpo();
    const antes = JSON.stringify(doc.file, null, 2);
    const plano = folderSkinPlan(doc.file, 'default', 'lobisomem', IMAGENS);
    doc.run(new MakeSkinFromFolder(doc.file, 'default', plano, 'lobisomem'));
    doc.undo();
    expect(JSON.stringify(doc.file, null, 2)).toBe(antes);
  });

  it('pasta sem nenhum nome em comum é dita, e nenhuma pele vazia é criada', () => {
    const doc = corpo();
    const plano = folderSkinPlan(doc.file, 'default', 'vazia', IMAGENS);
    expect(plano.matched).toEqual([]);
    expect(folderSkinNotice('vazia', plano)).toContain('não tem nenhum desenho');
  });
});

// --- exportar e importar (I12, F23) ---------------------------------------

describe('Exportar pele… e Importar pele… (I12, F23)', () => {
  function comRabo(): Doc {
    const doc = corpo();
    doc.file.bones!.push(
      { name: 'rabo', parent: 'hips', skinRequired: true, length: 40 } as never,
    );
    doc.file.slots!.push({ name: 'rabo', bone: 'rabo' } as never);
    doc.file.skins!.push({
      name: 'lobisomem',
      bones: ['rabo'],
      attachments: {
        rabo: { rabo: { type: 'region', path: 'hair', width: 50, height: 24 } },
        head: { head: { type: 'region', path: 'hair' } },
      },
    } as never);
    return doc;
  }

  it('o arquivo da pele leva os ossos e os slots que ela traz (§5.2)', () => {
    const doc = comRabo();
    const saida = buildSkinFile(doc.file, 'lobisomem')!;
    expect(saida.report.bones).toEqual(['rabo']);
    expect(saida.report.slots).toEqual(['rabo']);
    expect(saida.file.skins!.map((s) => s.name)).toEqual(['lobisomem']);
    // Só a pele: o corpo inteiro é o outro comando (Exportar por pele…).
    expect(saida.file.animations).toBeUndefined();
  });

  it('o `rig` sai do conteúdo: o que ela EXIGE de quem a usar (4.8)', () => {
    const doc = comRabo();
    const saida = buildSkinFile(doc.file, 'lobisomem')!;
    const rig = (saida.file as unknown as { rig: { bones?: string[]; slots?: string[] } }).rig;
    // O rabo pendura em `hip`, que é do hospedeiro; e ela veste o slot `head`,
    // que também é de lá.
    expect(rig.bones).toContain('hips');
    expect(rig.slots).toContain('head');
    // O que ela leva junto NÃO entra no contrato: ela não exige o próprio rabo.
    expect(rig.bones ?? []).not.toContain('rabo');
    expect(rig.slots ?? []).not.toContain('rabo');
  });

  it('a frase diz o que foi junto e o que o arquivo exige', () => {
    const doc = comRabo();
    const saida = buildSkinFile(doc.file, 'lobisomem')!;
    const frase = skinFileNotice('lobisomem', saida.report);
    expect(frase).toContain('1 osso');
    expect(frase).toContain('exige');
  });

  it('pele que não existe não grava arquivo nenhum', () => {
    expect(buildSkinFile(corpo().file, 'nao-existe')).toBe(null);
  });

  it('importar põe o uri em `assets.skins`, e desfazer tira', () => {
    const doc = corpo();
    const antes = JSON.stringify(doc.file, null, 2);
    doc.run(new ImportSkinFile('lobisomem-rabo.bone'));
    expect(importedSkinUris(doc.file)).toEqual(['lobisomem-rabo.bone']);
    doc.undo();
    expect(JSON.stringify(doc.file, null, 2)).toBe(antes);
  });

  it('importar duas vezes o mesmo arquivo não escreve duas linhas', () => {
    const doc = corpo();
    doc.run(new ImportSkinFile('rabo.bone'));
    doc.run(new ImportSkinFile('rabo.bone'));
    expect(importedSkinUris(doc.file)).toEqual(['rabo.bone']);
  });

  it('o que a pele de fora exige e o corpo não tem é DITO antes (4.8, regra 21)', () => {
    const doc = corpo();
    const externa = {
      rig: { bones: ['hips', 'asa_inexistente'], slots: ['head', 'slot_inexistente'] },
      skins: [{ name: 'asas', attachments: {} }],
    } as unknown as BoneFile;
    const falta = unmetRig(doc.file, externa);
    expect(falta).toEqual(['osso "asa_inexistente"', 'slot "slot_inexistente"']);
    expect(importSkinNotice('asas.bone', ['asas'], falta)).toContain('asa_inexistente');
  });

  it('sem nada faltando, a frase é curta e diz onde a pele foi parar', () => {
    expect(importSkinNotice('rabo.bone', ['lobisomem'], []))
      .toBe('rabo.bone: a skin "lobisomem", agora na lista de Feitas');
  });

  it('a pele de fora aparece em Feitas, marcada como de fora (F23)', () => {
    const doc = corpo();
    const linhas = skinTabRows(doc.file, ['default'], null, ['lobisomem']);
    const deFora = linhas.find((row) => row.name === 'lobisomem')!;
    expect(deFora.external).toBe(true);
    expect(linhas.find((row) => row.name === 'armadura')!.external).toBeUndefined();
  });

  it('e ela entra na pilha como as outras, sem virar "pele perdida"', () => {
    const doc = corpo();
    const pilha = ['default', 'lobisomem'];
    expect(lostSkins(doc.file, pilha, ['lobisomem'])).toEqual([]);
    expect(activeStackRows(doc.file, pilha, null, ['lobisomem']).map((r) => r.name))
      .toEqual(['lobisomem', 'default']);
  });

  it('o arquivo exportado é lido de volta pelo runtime, com o rabo na pilha', () => {
    const doc = comRabo();
    const saida = buildSkinFile(doc.file, 'lobisomem')!;
    // Uma volta inteira: o que saiu tem de carregar. Um arquivo de pele que o
    // runtime recusa é o pior dos casos — ele só falha na máquina do outro.
    const data = loadSkeletonData(JSON.parse(JSON.stringify(saida.file)) as unknown);
    expect(data.skins.map((skin) => skin.name)).toContain('lobisomem');
    expect(data.bones.map((bone) => bone.name)).toContain('rabo');
  });
});

// --- promover pele a base (I13, F25) --------------------------------------

describe('Promover pele a base: "Lobisomem: os dois" (I13, F25)', () => {
  function comLobisomem(): Doc {
    const doc = corpo();
    doc.file.bones!.push({ name: 'rabo', parent: 'hips', skinRequired: true } as never);
    doc.file.skins!.push({
      name: 'lobisomem',
      bones: ['rabo'],
      attachments: { head: { head: { type: 'region', path: 'lobo_cabeca' } } },
    } as never);
    return doc;
  }

  it('a pilha é assada na `default`, e a de cima vence', () => {
    const doc = comLobisomem();
    const novo = bakeSkinBase(doc.file, ['default', 'lobisomem'], 'lobisomem');
    const base = novo.skins!.find((skin) => skin.name === 'default')!;
    const head = base.attachments!['head']!['head'] as { path?: string };
    expect(head.path).toBe('lobo_cabeca');
  });

  it('o osso que era só da pele passa a ser do corpo', () => {
    const doc = comLobisomem();
    const novo = bakeSkinBase(doc.file, ['default', 'lobisomem'], 'lobisomem');
    const rabo = novo.bones!.find((bone) => bone.name === 'rabo')!;
    expect(rabo.skinRequired).toBeUndefined();
  });

  it('as peles assadas saem da lista; as outras ficam inteiras', () => {
    const doc = comLobisomem();
    const novo = bakeSkinBase(doc.file, ['default', 'lobisomem'], 'lobisomem');
    const nomes = novo.skins!.map((skin) => skin.name);
    expect(nomes).toContain('default');
    expect(nomes).not.toContain('lobisomem');
    expect(nomes).toContain('armadura');
  });

  it('o corpo de origem não muda uma vírgula', () => {
    const doc = comLobisomem();
    const antes = JSON.stringify(doc.file, null, 2);
    bakeSkinBase(doc.file, ['default', 'lobisomem'], 'lobisomem');
    expect(JSON.stringify(doc.file, null, 2)).toBe(antes);
  });

  it('o corpo novo carrega no runtime, que é o que prova que ele é um corpo', () => {
    const doc = comLobisomem();
    const novo = bakeSkinBase(doc.file, ['default', 'lobisomem'], 'lobisomem');
    const data = loadSkeletonData(JSON.parse(JSON.stringify(novo)) as unknown);
    expect(novo.skeleton!.name).toBe('lobisomem');
    expect(data.bones.map((bone) => bone.name)).toContain('rabo');
  });

  it('o `drawOrder` da pele assada vira a ordem do array `slots`', () => {
    const doc = corpo();
    doc.file.slots = [
      { name: 'a', bone: 'root' }, { name: 'b', bone: 'root' }, { name: 'c', bone: 'root' },
    ] as never;
    doc.file.skins = [
      { name: 'default', attachments: {} },
      { name: 'capa', attachments: {}, drawOrder: [{ slot: 'c', offset: -2 }] },
    ] as never;
    const novo = bakeSkinBase(doc.file, ['default', 'capa'], 'com-capa');
    expect(novo.slots!.map((slot) => slot.name)).toEqual(['c', 'a', 'b']);
  });

  it('a linha de tempo que citava a pele assada passa a citar a `default`', () => {
    const doc = comLobisomem();
    const animacao = doc.file.animations![0]!;
    animacao.timelines = [
      { type: 'deform', target: 'head', skin: 'lobisomem', attachment: 'head', keys: [] },
    ] as never;
    const novo = bakeSkinBase(doc.file, ['default', 'lobisomem'], 'lobisomem');
    expect(novo.animations![0]!.timelines![0]!.skin).toBe('default');
  });

  it('o arranjo de tela do corpo de origem não vai junto', () => {
    const doc = comLobisomem();
    doc.captureEditorState();
    const novo = bakeSkinBase(doc.file, ['default', 'lobisomem'], 'lobisomem');
    expect((novo as { extensions?: Record<string, unknown> }).extensions?.['RECORTE_editor_state'])
      .toBeUndefined();
  });

  it('a frase do rodapé diz o que entrou em Corpos', () => {
    expect(promoteSkinNotice('lobisomem', ['lobisomem']))
      .toBe('"lobisomem" entrou em Bases, com a skin "lobisomem" assada na base');
    expect(promoteSkinNotice('anjo', ['asas', 'armadura'])).toContain('2 skins');
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 9 — a pele de fora de verdade: `formato/rigs/lobisomem-rabo.bone`
// ---------------------------------------------------------------------------

describe('degrau 9 — o rabo do lobisomem, no arquivo publicado com a spec', () => {
/**
 * O "pronto quando" do encargo cita **este arquivo**, e não um de mentira:
 * *"Importar pele traz `lobisomem-rabo.bone` com o rabo na pilha"*.
 *
 * Ele é o exemplo da §2.8 e o par do caso de conformidade C-294. Ler o arquivo
 * de verdade prende duas coisas que um objeto escrito à mão no teste não
 * prenderia: que o formato do arquivo publicado é o que o editor espera, e que
 * o `rig` dele bate com a convenção de nomes (`formato/rigs/humanoide-v1`).
 */

const RABO = resolve(__dirname, '../../formato/rigs/lobisomem-rabo.bone');

function rabo(): BoneFile {
  return JSON.parse(readFileSync(RABO, 'utf8')) as BoneFile;
}

it('o arquivo publicado traz a pele, o osso do rabo e o contrato de rig', () => {
  const file = rabo();
  expect((file.skins ?? []).map((skin) => skin.name)).toEqual(['lobisomem']);
  expect((file.bones ?? []).some((bone) => bone.name === 'rabo')).toBe(true);
  const rig = (file as unknown as { rig: { bones?: string[] } }).rig;
  expect(rig.bones).toEqual(['quadril']);
});

it('num corpo que cumpre o contrato, nada falta — e a pele entra', () => {
  const hospedeiro = {
    bone: { version: '1.0', minVersion: '1.0' },
    skeleton: { name: 'homem' },
    bones: [{ name: 'root' }, { name: 'quadril', parent: 'root' }],
    slots: [],
    skins: [{ name: 'default', attachments: {} }],
  } as unknown as BoneFile;
  expect(unmetRig(hospedeiro, rabo())).toEqual([]);

  const doc = new Doc(hospedeiro);
  doc.run(new ImportSkinFile('lobisomem-rabo.bone'));
  expect(importedSkinUris(doc.file)).toEqual(['lobisomem-rabo.bone']);
  // A pele de fora aparece em Feitas como as outras (F23), e liga na pilha.
  const linhas = skinTabRows(doc.file, ['default'], null, ['lobisomem']);
  expect(linhas.map((row) => row.name)).toEqual(['default', 'lobisomem']);
  expect(linhas[1]!.external).toBe(true);
  expect(activeStackRows(doc.file, ['default', 'lobisomem'], null, ['lobisomem'])
    .map((row) => row.name)).toEqual(['lobisomem', 'default']);
});

it('num corpo que NÃO cumpre o contrato, o que falta é dito pelo nome', () => {
  const doc = new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
  // O herói chama o quadril de `hips`, e o arquivo da pele pede `quadril`.
  const falta = unmetRig(doc.file, rabo());
  expect(falta).toEqual(['osso "quadril"']);
  const frase = importSkinNotice('lobisomem-rabo.bone', ['lobisomem'], falta);
  expect(frase).toContain('quadril');
  expect(frase).toContain('entra assim mesmo');
});
});

// ---------------------------------------------------------------------------
// I5 e M1 — o desfazer leva a pilha junto (chat I, lote 3, 29/09/2026)
// ---------------------------------------------------------------------------

describe('I5 e M1: o desfazer leva a pilha e o lápis junto', () => {
  /**
   * A forma do defeito, a do P11: *o desfazer devolve o valor e não o lugar.*
   * A pele mora no arquivo; a pilha e o lápis moram no documento. O comando
   * só levava o arquivo, e o rebuild via uma pilha citando pele que não
   * existia — o aviso nascia do próprio gesto.
   */
  const EXEMPLO_I = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  const heroiI = (): Doc => new Doc(JSON.parse(readFileSync(EXEMPLO_I, 'utf8')) as BoneFile, { path: EXEMPLO_I });
  const citaPeleFaltando = (doc: Doc): string[] => doc.warnings.filter((w) => /esta base não a tem/.test(w));

  it('prova de que o defeito existia: renomear e só DEPOIS arrumar a pilha deixa o aviso com o nome velho (M1)', () => {
    const doc = heroiI();
    setEditingSkin(doc, 'armadura');
    const command = new RenameSkin(doc.file, 'armadura', 'camisa_azul');
    doc.run(command);
    // O caminho de antes: a pilha arrumada depois do rebuild.
    setSkinStack(doc, skinStackOf(doc).map((n) => (n === 'armadura' ? command.to : n)));
    expect(citaPeleFaltando(doc).length).toBe(1);
    expect(citaPeleFaltando(doc)[0]).toContain('"armadura"');
  });

  it('renomear pelo KeepSkinStack não deixa aviso, e o Ctrl+Z devolve o nome velho à pilha (M1)', () => {
    const doc = heroiI();
    setEditingSkin(doc, 'armadura');
    const command = new RenameSkin(doc.file, 'armadura', 'camisa_azul');
    doc.run(new KeepSkinStack(command, renameInView('armadura', command.to)));
    expect(citaPeleFaltando(doc)).toEqual([]);
    expect(skinStackOf(doc)).toContain('camisa_azul');
    expect(editingSkinOf(doc)).toBe('camisa_azul');
    doc.undo();
    expect(skinStackOf(doc)).toContain('armadura');
    expect(skinStackOf(doc)).not.toContain('camisa_azul');
    expect(editingSkinOf(doc)).toBe('armadura');
    expect(citaPeleFaltando(doc)).toEqual([]);
  });

  it('Nova pele → Ctrl+Z tira a pele da pilha e o lápis dela; Ctrl+Y devolve os dois (I5)', () => {
    const doc = heroiI();
    const antes = skinStackOf(doc);
    addSkinI(doc);
    expect(editingSkinOf(doc)).toBe('skin');
    expect(skinStackOf(doc)).toContain('skin');
    doc.undo();
    expect(skinStackOf(doc)).toEqual(antes);
    expect(editingSkinOf(doc)).toBe(null);
    expect(citaPeleFaltando(doc)).toEqual([]);
    doc.redo();
    expect(skinStackOf(doc)).toContain('skin');
    expect(editingSkinOf(doc)).toBe('skin');
    expect(citaPeleFaltando(doc)).toEqual([]);
  });

  it('o passo de desfazer tem o nome do comando de dentro', () => {
    const doc = heroiI();
    addSkinI(doc);
    expect(doc.undoLabel).toBe('Nova skin');
  });

  it('apagar pelo KeepSkinStack tira a pele da pilha antes do rebuild, e o Ctrl+Z a devolve ao lugar', () => {
    const doc = heroiI();
    setEditingSkin(doc, 'armadura');
    const antes = skinStackOf(doc);
    doc.run(new KeepSkinStack(new DeleteSkin('armadura'), dropSkin('armadura')));
    expect(citaPeleFaltando(doc)).toEqual([]);
    doc.undo();
    expect(skinStackOf(doc)).toEqual(antes);
    expect(editingSkinOf(doc)).toBe('armadura');
  });
});

describe('I7: o passo seguinte depois de Nova pele', () => {
  it('a pele do lápis vazia ganha a frase com o gesto; com desenho, ou na default, nada', () => {
    const vazia = [{ name: 'default', editable: false, slots: 23 }, { name: 'pele', editable: true, slots: 0 }];
    expect(emptySkinHint(vazia)).toContain('A skin "pele" está vazia');
    expect(emptySkinHint([{ name: 'pele', editable: true, slots: 1 }])).toBeNull();
    expect(emptySkinHint([{ name: 'default', editable: true, slots: 0 }])).toBeNull();
    expect(emptySkinHint([{ name: 'pele', editable: false, slots: 0 }])).toBeNull();
  });

  it('o rodapé de Nova pele diz o passo seguinte, e não só que criou', () => {
    expect(newSkinNotice('pele')).toMatch(/criada/);
    expect(newSkinNotice('pele')).toMatch(/Agora /);
  });
});

describe('M11: Importar pele… fala antes e depois do seletor', () => {
  const EXEMPLO_M = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  const heroiM = (): Doc => new Doc(JSON.parse(readFileSync(EXEMPLO_M, 'utf8')) as BoneFile, { path: EXEMPLO_M });
  function ouvindo(doc: Doc): string[] {
    const ditos: string[] = [];
    const notice = doc.notice.bind(doc);
    doc.notice = (text: string) => { ditos.push(text); notice(text); };
    return ditos;
  }

  it('prova de que o defeito existia: a conta de antes, com o seletor cancelado, não dizia nada', async () => {
    const doc = heroiM();
    const ditos = ouvindo(doc);
    await importSkin(doc, async () => null);
    expect(ditos).toEqual([]);
  });

  it('cancelado: diz o que escolher ANTES, e "Nada mudou" depois', async () => {
    const doc = heroiM();
    const ditos = ouvindo(doc);
    const antes = JSON.stringify(doc.file);
    expect(await importSkinFromDisk(doc, async () => null)).toBeNull();
    expect(ditos[0]).toBe(IMPORT_SKIN_ASK);
    expect(ditos.at(-1)).toMatch(/Nada mudou/);
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('com um arquivo de pele: a pele entra, e o rodapé diz qual', async () => {
    const doc = heroiM();
    const ditos = ouvindo(doc);
    const pele = { skeleton: { name: 'roupa' }, bones: [{ name: 'root' }], skins: [{ name: 'roupa', attachments: {} }] } as unknown as BoneFile;
    const uri = await importSkinFromDisk(doc, async () => ({ path: 'roupa.bone', file: pele }) as never);
    expect(uri).toBe('roupa.bone');
    expect(ditos[0]).toBe(IMPORT_SKIN_ASK);
    expect(ditos.at(-1)).toMatch(/roupa/);
    expect(ditos.some((d) => /Nada mudou/.test(d))).toBe(false);
  });

  it('o seletor que falha não cala: diz que parou, e por quê', async () => {
    const doc = heroiM();
    const ditos = ouvindo(doc);
    expect(await importSkinFromDisk(doc, async () => { throw new Error('sem tela'); })).toBeNull();
    expect(ditos.at(-1)).toBe('Importar skin parou: sem tela');
  });
});

// ---------------------------------------------------------------------------
// Rodada 12 (04/10/2026) — a skin que falta: esconder, ignorar, o osso some
// ---------------------------------------------------------------------------

describe('rodada 12 — S4 e S3: esconder e ignorar uma imagem na skin do lápis', () => {
  const EXEMPLO_12 = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  const heroi12 = (): Doc => new Doc(JSON.parse(readFileSync(EXEMPLO_12, 'utf8')) as BoneFile, { path: EXEMPLO_12 });
  const corpoEscolhido = (doc: Doc): void => doc.select({
    ...emptySelection(), slots: ['body'], attachments: [{ slot: 'body', attachment: 'body' }],
  });
  const peleDe = (doc: Doc, nome: string) => (doc.file.skins ?? []).find((s) => s.name === nome)!;
  const desenha = (doc: Doc, slot: string): string | null => doc.skeleton?.findSlot(slot)?.attachment?.name ?? null;
  const ouvirAvisos = (doc: Doc): string[] => {
    const avisos: string[] = [];
    doc.notice = (texto: string) => { avisos.push(texto); };
    return avisos;
  };

  it('o formato já dizia as três coisas (§4.4): a armadura do herói troca o tronco e esconde o cabelo', () => {
    const doc = heroi12();
    expect(skinVerdict(doc.file, 'armadura', 'hair', 'hair')).toBe('esconde');
    expect(skinVerdict(doc.file, 'armadura', 'body', 'body')).toBe('troca');
    expect(skinVerdict(doc.file, 'armadura', 'hand', 'hand')).toBe('ignora');
  });

  it('Esconder grava null na skin do lápis: com ela vestida o desenho some, e a base não muda (S4)', () => {
    const doc = heroi12();
    addSkinI(doc);
    const base = JSON.stringify(peleDe(doc, 'default'));
    const antes = JSON.stringify(doc.file);
    corpoEscolhido(doc);
    expect(canSetVerdict(doc)).toBe(true);
    expect(desenha(doc, 'body')).toBe('body');
    setVerdictOnSelection(doc, 'esconde');
    expect(peleDe(doc, 'skin').attachments?.['body']?.['body']).toBeNull();
    expect(JSON.stringify(peleDe(doc, 'default'))).toBe(base);
    expect(desenha(doc, 'body')).toBe(null);
    // Tirada a skin, o tronco volta: quem esconde é ela.
    setSkinStack(doc, ['default']);
    expect(desenha(doc, 'body')).toBe('body');
    setSkinStack(doc, ['default', 'skin']);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(desenha(doc, 'body')).toBe('body');
  });

  it('Esconder por cima de uma troca tira a troca; Ignorar devolve o desenho da base (S3)', () => {
    const doc = heroi12();
    setEditingSkin(doc, 'armadura');
    const antes = JSON.stringify(doc.file);
    setVerdict(doc, 'armadura', [{ slot: 'body', attachment: 'body' }], 'esconde');
    expect(skinVerdict(doc.file, 'armadura', 'body', 'body')).toBe('esconde');
    setVerdict(doc, 'armadura', [{ slot: 'body', attachment: 'body' }], 'ignora');
    expect(skinVerdict(doc.file, 'armadura', 'body', 'body')).toBe('ignora');
    // O slot sem nada na pele sai da pele: nenhum `{}` sobra no arquivo.
    expect(Object.keys(peleDe(doc, 'armadura').attachments ?? {})).not.toContain('body');
    doc.undo();
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('Ignorar o que a skin esconde faz o desenho voltar: o cabelo debaixo do elmo (S3)', () => {
    const doc = heroi12();
    setSkinStack(doc, ['default', 'armadura']);
    setEditingSkin(doc, 'armadura');
    expect(desenha(doc, 'hair')).toBe(null);
    setVerdict(doc, 'armadura', [{ slot: 'hair', attachment: 'hair' }], 'ignora');
    expect(desenha(doc, 'hair')).toBe('hair');
  });

  it('nada a mudar não vira passo de desfazer, e o rodapé diz que nada mudou', () => {
    const doc = heroi12();
    addSkinI(doc);
    const passo = doc.undoLabel;
    const avisos = ouvirAvisos(doc);
    setVerdict(doc, 'skin', [{ slot: 'body', attachment: 'body' }], 'ignora');
    expect(doc.undoLabel).toBe(passo);
    expect(avisos.at(-1)).toContain('nada mudou');
  });

  it('sem lápis numa skin (ou com ele na default) recusa, e diz por quê — regra 21', () => {
    const doc = heroi12();
    corpoEscolhido(doc);
    expect(verdictSkin(doc)).toBe(null);
    expect(canSetVerdict(doc)).toBe(false);
    const antes = JSON.stringify(doc.file);
    const avisos = ouvirAvisos(doc);
    setVerdictOnSelection(doc, 'esconde');
    expect(avisos).toEqual([NO_SKIN_FOR_VERDICT]);
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a linha da Árvore (só o slot) também vale: o desenho de setup dele', () => {
    const doc = heroi12();
    expect(pairsOfSelection(doc.file, { slots: ['hand'], attachments: [] }))
      .toEqual([{ slot: 'hand', attachment: 'hand' }]);
  });

  it('a frase do rodapé diz o que houve', () => {
    const par = [{ slot: 'body', attachment: 'body' }];
    expect(verdictNotice('aguia', par, 'esconde', 1)).toContain('escondida na skin "aguia"');
    expect(verdictNotice('aguia', par, 'esconde', 1)).toContain('A base não muda');
    expect(verdictNotice('aguia', par, 'ignora', 1)).toContain('deixa de mexer nela');
  });

  it('"Nesta pele" lista o que a skin troca e esconde, desenho por desenho', () => {
    const doc = heroi12();
    const linhas = skinEffects(doc.file, 'armadura');
    expect(linhas.map((l) => [l.kind, l.slot])).toEqual([['troca', 'body'], ['troca', 'head'], ['esconde', 'hair']]);
    expect(linhas[0]!.text).toBe('body → armadura/body');
  });

  // Rodada 6 (05/10/2026): o submenu Peles ▸ do Esqueleto virou o menu
  // Skins, e os dois itens ganharam o nome do desenho dos menus.
  it('as portas: menu Skins → Esconder esta imagem e Ignorar esta imagem', () => {
    const porAcao = new Map(flatEntries(skinsMenu()).map((e) => [e.action, e.label]));
    expect(porAcao.get('esconder-na-pele')).toBe('Esconder esta imagem');
    expect(porAcao.get('ignorar-na-pele')).toBe('Ignorar esta imagem');
  });

  it('o revert de SetSkinVerdict devolve até a ordem das chaves', () => {
    const doc = heroi12();
    const antes = JSON.stringify(doc.file);
    const cmd = new SetSkinVerdict('armadura', [{ slot: 'head', attachment: 'face' }, { slot: 'body', attachment: 'body' }], 'ignora');
    doc.run(cmd);
    expect(cmd.changed).toBe(2);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

describe('rodada 12 — S8: tirar a skin, o osso dela some junto', () => {
  const EXEMPLO_12 = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  const heroi12 = (): Doc => new Doc(JSON.parse(readFileSync(EXEMPLO_12, 'utf8')) as BoneFile, { path: EXEMPLO_12 });
  const linhasDeOsso = (rows: ReturnType<typeof hierarchyRows>): string[] =>
    rows.filter((r) => r.kind === 'bone').map((r) => r.name);

  /** Uma skin nova com o lápis nela, e um osso nascido nela, filho do tronco. */
  const comOssoDaSkin = (): Doc => {
    const doc = heroi12();
    addSkinI(doc);
    doc.select({ ...emptySelection(), bones: ['torso'] });
    addBone(doc);
    return doc;
  };

  it('prova de que o defeito existia: sem a conta da pilha, a Árvore mostra o osso da skin que saiu', () => {
    const doc = comOssoDaSkin();
    setEditingSkin(doc, null);
    setSkinStack(doc, ['default']);
    // O caminho de antes: a Árvore não sabia da pilha.
    expect(linhasDeOsso(hierarchyRows(doc.file, 'default'))).toContain('osso');
  });

  it('com a skin fora da pilha o osso dela sai da Árvore; vestida, ele volta', () => {
    const doc = comOssoDaSkin();
    expect(bonesGone(doc.file, skinStackOf(doc)).has('osso')).toBe(false);
    setEditingSkin(doc, null);
    setSkinStack(doc, ['default']);
    const gone = bonesGone(doc.file, skinStackOf(doc));
    expect([...gone]).toEqual(['osso']);
    expect(linhasDeOsso(hierarchyRows(doc.file, 'default', undefined, gone))).not.toContain('osso');
    setSkinStack(doc, ['default', 'skin']);
    expect(bonesGone(doc.file, skinStackOf(doc)).size).toBe(0);
  });

  it('os filhos do osso da skin somem junto, como no Spine (pág. 118)', () => {
    const doc = comOssoDaSkin();
    doc.select({ ...emptySelection(), bones: ['osso'] });
    addBone(doc);
    setEditingSkin(doc, null);
    setSkinStack(doc, ['default']);
    expect([...bonesGone(doc.file, skinStackOf(doc))].sort()).toEqual(['osso', 'osso2']);
  });

  it('a pele incluída liga os ossos dela (§4.4, includes)', () => {
    const doc = comOssoDaSkin();
    const file = doc.file;
    file.skins!.push({ name: 'roupa', includes: ['skin'], attachments: {} } as never);
    expect(bonesGone(file, ['default', 'roupa']).has('osso')).toBe(false);
  });

  it('a cena não desenha nem deixa clicar o osso que a pilha tirou', () => {
    setSkinGoneBones(new Set(['osso']));
    try {
      expect(isBoneHidden('osso', currentLocks())).toBe(true);
      expect(isBoneLocked('osso', currentLocks())).toBe(true);
      expect(isBoneHidden('torso', currentLocks())).toBe(false);
    } finally {
      setSkinGoneBones(new Set());
    }
  });

  it('o rodapé de tirar a skin diz o osso que saiu, no singular quando é um só', () => {
    const doc = comOssoDaSkin();
    expect(skinOff(doc.file, 'skin', skinStackOf(doc))).toBe('Skin "skin" desligada: saiu 1 osso que só existia nela');
  });

  it('a marca de osso apagado volta a sumir do arquivo quando a lista esvazia', () => {
    const doc = heroi12();
    const antes = JSON.stringify(doc.file);
    writeRemovedBones(doc.file, 'armadura', ['arm_b']);
    expect(removedBonesOf(doc.file, 'armadura')).toEqual(['arm_b']);
    expect([...bonesGone(doc.file, ['default', 'armadura'])].sort()).toEqual(['arm_b', 'forearm_b']);
    expect(bonesGone(doc.file, ['default']).size).toBe(0);
    writeRemovedBones(doc.file, 'armadura', []);
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

describe('rodada 12 — S11: duas skins na mesma imagem, a de cima vence', () => {
  const EXEMPLO_12 = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  it('trocar embaixo e esconder em cima esconde; ao contrário, troca', () => {
    const file = JSON.parse(readFileSync(EXEMPLO_12, 'utf8')) as BoneFile;
    file.skins!.push({ name: 'luva', attachments: { hand: { hand: { type: 'region', path: 'hand_fist' } } } } as never);
    file.skins!.push({ name: 'sem_mao', attachments: { hand: { hand: null } } } as never);
    const doc = new Doc(file, { path: EXEMPLO_12 });
    setSkinStack(doc, ['default', 'luva', 'sem_mao']);
    expect(doc.skeleton?.findSlot('hand')?.attachment ?? null).toBe(null);
    setSkinStack(doc, ['default', 'sem_mao', 'luva']);
    expect((doc.skeleton?.findSlot('hand')?.attachment as { path?: string } | null)?.path).toBe('hand_fist');
  });
});

describe('rodada 12 — S9: apagar um osso da base com a skin no lápis apaga só nela', () => {
  const EXEMPLO_12 = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  const heroi12 = (): Doc => new Doc(JSON.parse(readFileSync(EXEMPLO_12, 'utf8')) as BoneFile, { path: EXEMPLO_12 });
  const ouvir = (doc: Doc): string[] => {
    const avisos: string[] = [];
    doc.notice = (texto: string) => { avisos.push(texto); };
    return avisos;
  };
  const apagarOBraco = (doc: Doc): void => {
    doc.select({ ...emptySelection(), bones: ['arm_b'] });
    deleteSelected(doc);
  };

  it('prova de que o defeito existia: sem o caminho da skin, o Delete apaga da base', () => {
    const doc = heroi12();
    addSkinI(doc);
    doc.select({ ...emptySelection(), bones: ['arm_b'] });
    doc.run(new DeleteItems(doc.selection));
    expect(doc.file.bones.some((b) => b.name === 'arm_b')).toBe(false);
  });

  it('com a skin no lápis o osso e os filhos ficam no arquivo; na skin, os desenhos deles somem', () => {
    const doc = heroi12();
    addSkinI(doc);
    const base = JSON.stringify(doc.file.skins!.find((s) => s.name === 'default'));
    const ossos = doc.file.bones.length;
    const avisos = ouvir(doc);
    apagarOBraco(doc);
    expect(doc.file.bones.length).toBe(ossos);
    expect(JSON.stringify(doc.file.skins!.find((s) => s.name === 'default'))).toBe(base);
    expect(removedBonesOf(doc.file, 'skin')).toEqual(['arm_b']);
    const pele = doc.file.skins!.find((s) => s.name === 'skin')!;
    expect(pele.attachments?.['arm_back']).toEqual({ arm_back: null });
    expect(pele.attachments?.['hand_back']).toEqual({ hand_back: null });
    // Na cena: a skin vestida não desenha o braço de trás; tirada, ele volta.
    expect(doc.skeleton?.findSlot('arm_back')?.attachment ?? null).toBe(null);
    setSkinStack(doc, ['default']);
    expect(doc.skeleton?.findSlot('arm_back')?.attachment?.name).toBe('arm_back');
    // A Árvore e a cena deixam de mostrar o osso com a skin vestida.
    expect([...bonesGone(doc.file, ['default', 'skin'])].sort()).toEqual(['arm_b', 'forearm_b']);
    expect(avisos.at(-1)).toBe('Saíram da skin "skin" 2 ossos (arm_b, forearm_b) e 3 imagens '
      + '(arm_back, forearm_back, hand_back). Na base e nas outras skins continuam');
  });

  it('um Ctrl+Z devolve o arquivo letra por letra', () => {
    const doc = heroi12();
    addSkinI(doc);
    const antes = JSON.stringify(doc.file);
    apagarOBraco(doc);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a mão que troca de desenho na animação também some: todo nome que o slot pode mostrar', () => {
    const doc = heroi12();
    addSkinI(doc);
    doc.select({ ...emptySelection(), bones: ['forearm'] });
    deleteSelected(doc);
    const pele = doc.file.skins!.find((s) => s.name === 'skin')!;
    expect(pele.attachments?.['hand']).toEqual({ hand: null, hand_fist: null });
  });

  it('osso que nasceu nesta skin, e só ela o liga, apaga de verdade', () => {
    const doc = heroi12();
    addSkinI(doc);
    doc.select({ ...emptySelection(), bones: ['torso'] });
    addBone(doc);
    const avisos = ouvir(doc);
    doc.select({ ...emptySelection(), bones: ['osso'] });
    deleteSelected(doc);
    expect(doc.file.bones.some((b) => b.name === 'osso')).toBe(false);
    expect(avisos.at(-1)).toContain('Eram só dela');
  });

  it('osso desta skin que o clone também liga (S10) sai só da lista desta', () => {
    const doc = heroi12();
    addSkinI(doc);
    doc.select({ ...emptySelection(), bones: ['torso'] });
    addBone(doc);
    doc.run(new DuplicateSkin(doc.file, 'skin'));
    setEditingSkin(doc, 'skin');
    doc.select({ ...emptySelection(), bones: ['osso'] });
    deleteSelected(doc);
    expect(doc.file.bones.some((b) => b.name === 'osso')).toBe(true);
    expect(doc.file.skins!.find((s) => s.name === 'skin')!.bones ?? []).toEqual([]);
    expect(doc.file.skins!.find((s) => s.name === 'skin2')!.bones).toEqual(['osso']);
  });

  it('com o lápis na default, apaga da base como sempre', () => {
    const doc = heroi12();
    apagarOBraco(doc);
    expect(doc.file.bones.some((b) => b.name === 'arm_b')).toBe(false);
  });

  it('Devolver o osso tira a marca e os null: o arquivo volta letra por letra', () => {
    const doc = heroi12();
    addSkinI(doc);
    const antes = JSON.stringify(doc.file);
    apagarOBraco(doc);
    restoreBone(doc, 'skin', 'arm_b');
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(skinEffects(doc.file, 'skin', removedBonesOf(doc.file, 'skin'))).toEqual([]);
  });

  it('"Nesta pele" mostra o osso apagado na frente', () => {
    const doc = heroi12();
    addSkinI(doc);
    apagarOBraco(doc);
    const linhas = skinEffects(doc.file, 'skin', removedBonesOf(doc.file, 'skin'));
    expect(linhas[0]).toEqual({ kind: 'osso', slot: 'arm_b', attachment: '', text: 'osso arm_b apagado' });
  });

  it('o plano conta os nomes que se veem: o osso próprio de uma imagem (8d) não entra', () => {
    const doc = heroi12();
    const file = doc.file;
    file.bones.push({ name: 'hand_back_osso', parent: 'forearm_b', visible: false,
      extensions: { RECORTE_editor_state: { ossoProprio: true } } } as never);
    const plan = planDeleteInSkin(file, 'armadura', ['arm_b'])!;
    expect(plan.bones).toEqual(['arm_b', 'forearm_b']);
    expect(deleteInSkinNotice(plan)).toContain('2 ossos (arm_b, forearm_b)');
  });
});

describe('rodada 12 — o exemplo do Humberto: a pele "aguia" apaga os braços e cria a asa', () => {
  const EXEMPLO_12 = resolve(__dirname, '../../formato/exemplos/heroi.bone');

  /** O herói com a pele "aguia" e a mão com osso próprio (rodada 8d). */
  const aguia = (): Doc => {
    const file = JSON.parse(readFileSync(EXEMPLO_12, 'utf8')) as BoneFile;
    file.bones.push({ name: 'hand_osso', parent: 'forearm', visible: false,
      extensions: { RECORTE_editor_state: { ossoProprio: true } } } as never);
    file.slots!.find((s) => s.name === 'hand')!.bone = 'hand_osso';
    file.skins!.push({ name: 'aguia', attachments: {} } as never);
    const doc = new Doc(file, { path: EXEMPLO_12 });
    setEditingSkin(doc, 'aguia');
    return doc;
  };
  const desenha = (doc: Doc, slot: string): boolean => (doc.skeleton?.findSlot(slot)?.attachment ?? null) !== null;
  const BRACO = ['arm', 'forearm', 'sword_blade', 'weapon', 'hand'];

  it('apagar o braço na aguia leva antebraço, mão, a espada encaixada e o osso próprio; a asa nasce nela', () => {
    const doc = aguia();
    const avisos: string[] = [];
    doc.notice = (texto: string) => { avisos.push(texto); };
    doc.select({ ...emptySelection(), bones: ['arm'] });
    deleteSelected(doc);
    expect(avisos.at(-1)).toContain('Saíram da skin "aguia" 2 ossos (arm, forearm)');
    expect(avisos.at(-1)).toContain('weapon');
    expect(avisos.at(-1)).toContain('Na base e nas outras skins continuam');
    for (const slot of BRACO) expect(desenha(doc, slot)).toBe(false);
    expect([...bonesGone(doc.file, skinStackOf(doc))].sort()).toEqual(['arm', 'forearm', 'hand_osso']);

    // A asa: um osso novo, com o lápis na aguia.
    doc.select({ ...emptySelection(), bones: ['torso'] });
    addBone(doc);
    const asa = doc.selection.bones[0]!;
    expect(doc.file.skins!.find((s) => s.name === 'aguia')!.bones).toEqual([asa]);

    // Tirar a pele: os braços voltam e a asa some.
    setEditingSkin(doc, null);
    setSkinStack(doc, ['default']);
    for (const slot of BRACO) expect(desenha(doc, slot)).toBe(true);
    expect([...bonesGone(doc.file, skinStackOf(doc))]).toEqual([asa]);

    // Vestir de novo: os braços somem e a asa volta.
    setSkinStack(doc, ['default', 'aguia']);
    for (const slot of BRACO) expect(desenha(doc, slot)).toBe(false);
    const gone = bonesGone(doc.file, skinStackOf(doc));
    expect(gone.has(asa)).toBe(false);
    expect(gone.has('arm')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// M17 (rodada 3, 04/10/2026): "exportei a roupa, apaguei, importei de volta,
// e ela não voltou. O programa disse só uma frase em inglês."
// A forma: o que eu gravo, eu não consigo ler. O gravador esquecia `bones`
// (obrigatório, 2.2), e a Importar só citava o uri — que o editor não lê.
// ---------------------------------------------------------------------------
import { ImportSkinCopy as ImportSkinCopyM17, buildSkinFile as buildSkinFileM17 } from '../src/io/export-skin.js';
import { importSkin as importSkinM17 } from '../src/panels/skins-actions.js';

describe('M17: a pele exportada volta ao importar, igualzinha', () => {
  const heroi = (): Doc => new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
  /** O texto que a Exportar grava, lido de volta como a Importar o lê. */
  const gravadoELido = (file: BoneFile, pele: string): BoneFile =>
    JSON.parse(JSON.stringify(buildSkinFileM17(file, pele)!.file, null, 2)) as BoneFile;
  const ouvir = (doc: Doc): string[] => {
    const ditos: string[] = [];
    const notice = doc.notice.bind(doc);
    doc.notice = (t: string) => { ditos.push(t); notice(t); };
    return ditos;
  };

  it('o arquivo da Exportar abre sozinho: tem `bones`, com o osso raiz primeiro (2.2, 2.8)', () => {
    const arquivo = gravadoELido(heroi().file, 'armadura');
    expect(arquivo.bones).toEqual([{ name: 'root' }]);
    expect(() => loadSkeletonData(JSON.parse(JSON.stringify(arquivo)))).not.toThrow();
  });

  it('exportar → apagar → importar: o arquivo volta letra por letra, menos a POSIÇÃO da pele na lista', async () => {
    const doc = heroi();
    const original = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
    const arquivo = gravadoELido(doc.file, 'armadura');
    doc.run(new DeleteSkin('armadura'));
    expect(doc.file.skins!.map((s) => s.name)).not.toContain('armadura');
    const ditos = ouvir(doc);
    expect(await importSkinM17(doc, async () => ({ uri: 'armadura.bone', file: arquivo }))).toBe('armadura.bone');
    // A diferença, dita: a pele volta no FIM da lista (ela era a 2ª).
    expect(doc.file.skins!.map((s) => s.name)).toEqual(['default', 'armadura_capa', 'armadura']);
    const ordenado = (f: BoneFile): string => JSON.stringify({ ...f, skins: [...f.skins!].sort((a, b) => a.name.localeCompare(b.name)) }, null, 2);
    expect(ordenado(doc.file)).toBe(ordenado(original));
    // Os avisos são os do corpo original (aqui sem atlas), só com o índice novo.
    const semIndice = (ws: readonly string[]): string[] => ws.map((w) => w.replace(/\/skins\/\d+\//, '/skins/N/')).sort();
    expect(semIndice(doc.warnings)).toEqual(semIndice(heroi().warnings));
    expect(ditos.at(-1)).toBe('armadura.bone: a skin "armadura" entrou nesta base, e está vestida, no topo de Ativas');
  });

  it('o que a pele esconde e o que ela apaga (rodada 12) vêm junto', async () => {
    const doc = heroi();
    const pele = doc.file.skins!.find((s) => s.name === 'armadura')! as unknown as Record<string, unknown>;
    (pele['attachments'] as Record<string, Record<string, unknown>>)['arm'] = { arm: null };
    pele['extensions'] = { RECORTE_editor_state: { ossosApagados: ['arm_b'] } };
    const antes = JSON.stringify(pele);
    const arquivo = gravadoELido(doc.file, 'armadura');
    doc.run(new DeleteSkin('armadura'));
    await importSkinM17(doc, async () => ({ uri: 'armadura.bone', file: arquivo }));
    expect(JSON.stringify(doc.file.skins!.find((s) => s.name === 'armadura'))).toBe(antes);
  });

  it('levar a roupa para OUTRO boneco: o osso, o slot e a imagem dela entram; Ctrl+Z tira tudo', async () => {
    const a = heroi();
    a.file.bones!.push({ name: 'rabo', parent: 'hips', skinRequired: true, length: 40 } as never);
    a.file.slots!.push({ name: 'rabo', bone: 'rabo' } as never);
    a.file.skins!.push({ name: 'lobisomem', bones: ['rabo'], attachments: { rabo: { rabo: { type: 'region', path: 'hair', width: 50, height: 24 } } } } as never);
    const arquivo = gravadoELido(a.file, 'lobisomem');
    const b = heroi();
    const antes = JSON.stringify(b.file, null, 2);
    const ditos = ouvir(b);
    await importSkinM17(b, async () => ({ uri: 'lobisomem.bone', file: arquivo }));
    expect(b.file.bones!.at(-1)).toEqual({ name: 'rabo', parent: 'hips', skinRequired: true, length: 40 });
    expect(b.file.slots!.at(-1)).toEqual({ name: 'rabo', bone: 'rabo' });
    expect(b.file.skins!.at(-1)).toEqual(a.file.skins!.at(-1));
    expect(b.data!.findBone('rabo')).not.toBeNull();
    expect(ditos.at(-1)).toBe('lobisomem.bone: a skin "lobisomem" entrou nesta base, com 1 osso, 1 slot, e está vestida, no topo de Ativas');
    b.undo();
    expect(JSON.stringify(b.file, null, 2)).toBe(antes);
  });

  it('a pele que já existe aqui não entra por cima: o rodapé diz, e nada muda', async () => {
    const doc = heroi();
    const antes = JSON.stringify(doc.file);
    const ditos = ouvir(doc);
    expect(await importSkinM17(doc, async () => ({ uri: 'armadura.bone', file: gravadoELido(doc.file, 'armadura') }))).toBeNull();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(ditos.at(-1)).toBe('armadura.bone: a skin "armadura" já existe nesta base. Apague ou renomeie a daqui, e importe de novo. Nada mudou');
  });

  it('o comando de copiar desfaz e refaz exato', () => {
    const doc = heroi();
    const arquivo = gravadoELido(doc.file, 'armadura');
    doc.run(new DeleteSkin('armadura'));
    const apagada = JSON.stringify(doc.file);
    doc.run(new ImportSkinCopyM17('armadura.bone', arquivo));
    const importada = JSON.stringify(doc.file);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(apagada);
    doc.redo();
    expect(JSON.stringify(doc.file)).toBe(importada);
  });
});

describe('rodada 23, defeito 3: o que deixa de existir sai da seleção, na hora', () => {
  const heroiD3 = (): BoneFile => JSON.parse(readFileSync(resolve(import.meta.dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
  /** O herói com uma skin "nova" que tem um osso só dela, `osso`, filho da raiz. */
  const comOssoNaSkin = (): BoneFile => {
    const file = heroiD3();
    const raiz = file.bones![0]!.name;
    file.bones!.push({ name: 'osso', parent: raiz, skinRequired: true } as never);
    file.skins!.push({ name: 'nova', bones: ['osso'], attachments: {} } as never);
    return file;
  };
  const so = (bones: string[]) => ({ ...emptySelectionD3(), bones });
  const emptySelectionD3 = () => ({ bones: [] as string[], slots: [] as string[], attachments: [] as Array<{ slot: string; attachment: string }>, constraints: [] as string[], vertices: [] as number[], parameters: [] as string[], variables: [] as string[] });

  it('a conta: com a skin fora da pilha, o osso dela sai; com ela dentro, fica; nada mudou dá null', async () => {
    const { pruneSelection } = await import('../src/doc/prune-selection.js');
    const file = comOssoNaSkin();
    expect(pruneSelection(file, ['default', 'nova'], so(['osso', 'forearm']))).toBeNull();
    expect(pruneSelection(file, ['default'], so(['osso', 'forearm']))!.bones).toEqual(['forearm']);
    // Um nome que nunca existiu (o desfazer de um osso novo) também sai.
    expect(pruneSelection(file, ['default'], so(['osso9']))!.bones).toEqual([]);
    // O slot de um osso que sumiu sai junto, e com ele o anexo e os vértices.
    const comSlot = comOssoNaSkin();
    comSlot.slots!.push({ name: 'placa', bone: 'osso' } as never);
    const s = { ...emptySelectionD3(), slots: ['placa'], attachments: [{ slot: 'placa', attachment: 'a' }], vertices: [0, 1] };
    const p = pruneSelection(comSlot, ['default'], s)!;
    expect([p.slots, p.attachments, p.vertices]).toEqual([[], [], []]);
  });

  it('o caso do 07: tirar a skin da pilha tira o osso da seleção (setSkinStack)', async () => {
    const { setSkinStack } = await import('../src/viewport/onion.js');
    const doc = new Doc(comOssoNaSkin());
    setSkinStack(doc, ['default', 'nova']);
    doc.select(so(['osso']));
    let avisos = 0;
    doc.on((c) => { if (c.kind === 'selection') avisos++; });
    setSkinStack(doc, ['default']);
    expect(doc.selection.bones).toEqual([]);
    expect(avisos).toBeGreaterThan(0);
  });

  it('o vizinho: desfazer a criação de um osso escolhido tira o osso da seleção', () => {
    const doc = new Doc(heroiD3());
    const raiz = doc.file.bones![0]!.name;
    doc.run({
      label: 'Novo osso', kind: 'structure',
      apply: (d) => { d.file.bones!.push({ name: 'osso2', parent: raiz } as never); },
      revert: (d) => { d.file.bones!.pop(); },
    });
    doc.select(so(['osso2', 'forearm']));
    const ordem: string[] = [];
    doc.on((c) => { ordem.push(c.label ?? c.kind); });
    doc.undo();
    expect(doc.selection.bones).toEqual(['forearm']);
    // A seleção avisa antes; a última frase, a do rodapé, é a do desfazer.
    expect(ordem).toEqual(['selection', 'Desfeito: Novo osso']);
    // E o refazer não a devolve sozinho: escolher é do usuário.
    doc.redo();
    expect(doc.selection.bones).toEqual(['forearm']);
  });

  it('o documento só conta com o próprio corpo: com a virada, a seleção é do outro arquivo', () => {
    const fonte = readFileSync(resolve(import.meta.dirname, '../src/doc/document.ts'), 'utf8');
    expect(fonte).toContain("kind === 'structure' && this.corpo() === this");
  });
});

describe('rodada 23, defeito 2: a skin nova nasce "skin", e a tela diz base e boneco', () => {
  it('Nova skin nasce "skin", depois "skin2": nunca mais "pele"', () => {
    const doc = new Doc(JSON.parse(readFileSync(resolve(import.meta.dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    addSkinI(doc);
    addSkinI(doc);
    const nomes = (doc.file.skins ?? []).map((s) => s.name);
    expect(nomes).toContain('skin');
    expect(nomes).toContain('skin2');
    expect(nomes.some((n) => n.startsWith('pele'))).toBe(false);
  });

  it('as seis sobras de "esqueleto" da tabela M2 do 07 saíram da tela, cada uma pelo sentido', () => {
    const ler = (p: string): string => readFileSync(resolve(import.meta.dirname, '../src', p), 'utf8');
    const sobras: Array<[string, string, string]> = [
      ['panels/properties-model.ts', "title: 'Esqueleto'", "title: 'Base'"],
      ['ui/action-bar-model.ts', 'Começa um esqueleto vazio', 'Começa um boneco novo, vazio'],
      ['viewport/viewport.ts', 'Área de desenho do esqueleto', 'Área de desenho do boneco'],
      ['panels/tree-rows.ts', 'parâmetros do esqueleto', 'parâmetros do boneco'],
      ['panels/skins-model.ts', 'O esqueleto é o mesmo', 'A base é a mesma'],
      ['panels/rules.ts', 'faz o esqueleto se mexer', 'faz o boneco se mexer'],
      ['io/import-psd.ts', 'Já existe um esqueleto', 'Já existe uma base'],
      ['ui/shell-drop.ts', 'Qual esqueleto abrir?', 'Qual boneco abrir?'],
    ];
    for (const [arquivo, velho, novo] of sobras) {
      expect(ler(arquivo), arquivo).not.toContain(velho);
      expect(ler(arquivo), arquivo).toContain(novo);
    }
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, M12a: apagar uma skin de que outra depende cita quem depende
// ---------------------------------------------------------------------------

describe('rodada 17, M12a: quem inclui a skin, na pergunta de apagar; e o renomear leva o includes', () => {
  const ler = (): BoneFile => JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;

  it('a armadura_capa inclui a armadura: a pergunta diz o nome dela', () => {
    const file = ler();
    expect(skinDependents(file, 'armadura')).toEqual(['armadura_capa']);
    expect(skinDependents(file, 'armadura_capa')).toEqual([]);
    expect(deleteSkinLead(3, ['armadura_capa'])).toContain('A skin "armadura_capa" inclui esta');
    // Rodada 44, lote 5: o plural certo.
    expect(deleteSkinLead(3, [])).toBe('Ela veste 3 slots. As linhas de tempo que só ela tinha saem junto. Ctrl+Z devolve tudo.');
    expect(deleteSkinLead(1, [])).toContain('Ela veste 1 slot.');
  });

  it('renomear a armadura troca o nome no includes da capa (antes: a capa incluía um nome que não existia mais)', () => {
    const doc = new Doc(ler());
    doc.run(new RenameSkin(doc.file, 'armadura', 'couraca'));
    const capa = doc.file.skins!.find((s) => s.name === 'armadura_capa') as unknown as { includes?: string[] };
    expect(capa.includes).toEqual(['couraca']);
    doc.undo();
    expect((doc.file.skins!.find((s) => s.name === 'armadura_capa') as unknown as { includes?: string[] }).includes).toEqual(['armadura']);
  });

  it('apagar NÃO tira a inclusão: a volta pelo importar (M17) continua letra por letra, e o aviso diz o que falta', () => {
    const doc = new Doc(ler());
    doc.run(new DeleteSkin('armadura'));
    expect((doc.file.skins!.find((s) => s.name === 'armadura_capa') as unknown as { includes?: string[] }).includes).toEqual(['armadura']);
    expect(doc.warnings.some((w) => w.includes('"armadura"'))).toBe(true);
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 4 (06/10/2026) — a aba Skins cabe e liga por clique
// ---------------------------------------------------------------------------

import { SKIN_BAR_HINTS as barraR44, pencilNotice as lapisR44 } from '../src/panels/skins.js';
import { addSkin as novaR44 } from '../src/panels/skins-actions.js';

describe('a aba Skins: ligar com um clique, nome na hora (rodada 44, lote 4)', () => {
  /**
   * Na conferência (doc 55, fotos 27, 32 e 42): a barra de sete ícones em duas
   * linhas comia a lista (75 px em 1920, 20 px em 1280); ligar só arrastando,
   * com Feitas e Ativas sem caber juntas; a skin nova nascia "skin"; o lápis
   * ficava mudo quando a skin já estava ligada; "Duplicar" na aba e "Clonar"
   * no menu.
   */
  it('sete ícones, cada um com a frase do que faz, e "Clonar" como no menu', () => {
    expect(barraR44.map(([n]) => n)).toEqual([
      'Nova skin', 'Clonar skin', 'Fazer a skin de uma pasta…', 'Importar skin…',
      'Exportar skin…', 'Promover skin a base…', 'Apagar skin',
    ]);
    for (const [, frase] of barraR44) expect(frase.length).toBeGreaterThan(20);
  });

  it('o lápis fala nos três casos', () => {
    expect(lapisR44('inverno', false, true)).toBe('Lápis na skin "inverno": o que se cria daqui em diante nasce nela');
    expect(lapisR44('inverno', false, false)).toContain('ligada');
    expect(lapisR44('inverno', true, true)).toContain('default');
  });

  it('a skin nova devolve o nome, para quem chamou pedir o nome na hora', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }], slots: [], skins: [{ name: 'default', attachments: {} }],
    } as unknown as BoneFile;
    const doc = new Doc(file, { atlases: [] });
    const nome = novaR44(doc);
    expect(typeof nome).toBe('string');
    expect(doc.file.skins!.map((s) => s.name)).toContain(nome);
  });

  it('em Feitas a skin desligada tem o olho de ligar; a barra numa linha', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/skins.ts'), 'utf8');
    expect(fonte).toContain("if (coluna === 'feitas' && !row.visible) {");
    expect(fonte).toContain("ligar.addEventListener('click', () => this.dropOnTop(doc, row.name));");
    // Doc 67: o nome vem ANTES de a skin nascer.
    expect(fonte).toContain('addSkinNamed(doc, resposta');
    const css = readFileSync(resolve(__dirname, '../src/panels/skins.css'), 'utf8');
    expect(css).toContain('flex-wrap: nowrap;');
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 5 (06/10/2026) — o arquivo da skin diz o que leva
// ---------------------------------------------------------------------------

import { looseImagesIn as soltasR44, skinFileNotice as fraseR44 } from '../src/io/export-skin.js';

describe('exportar a skin: o que ela exige e o que fica de fora (rodada 44, lote 5)', () => {
  /**
   * Na conferência (doc 55, foto 34): "ela exige 6 nomes de quem a usar" —
   * jargão; e as imagens de inverno, soltas na janela, não iam no arquivo
   * sem que o rodapé dissesse.
   */
  const relato = { bones: [], slots: [], constraints: [], needsBones: ['torso', 'cape2', 'hair'], needsSlots: ['body', 'cape_lower', 'hair'] };

  it('diz quantos ossos e quantos slots, e não "nomes"', () => {
    const frase = fraseR44('inverno', relato);
    expect(frase).toContain('exige de quem a usar 3 ossos e 3 slots com estes mesmos nomes');
    expect(frase).not.toContain('6 nomes');
  });

  it('as imagens soltas: conta e diz que não vão junto', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0' }, bones: [{ name: 'root' }],
      skins: [{ name: 'inverno', attachments: {
        body: { body: { type: 'region', path: 'body_inverno' } },
        hair: { hair: { type: 'region', path: 'hair_inverno' } },
        cape: { cape: { type: 'region', path: 'cape' } },
        weapon: { sword: { type: 'skeleton', uri: 'espada.bone' } },
      } }],
    } as unknown as BoneFile;
    expect(soltasR44(file, ['body_inverno', 'hair_inverno', 'outra'])).toBe(2);
    expect(fraseR44('inverno', relato, 2)).toContain('2 imagens soltas não vão junto');
    expect(fraseR44('inverno', relato, 2)).toContain('para elas entrarem no atlas');
    expect(fraseR44('inverno', relato, 1)).toContain('1 imagem solta não vai junto: salve o projeto antes, para ela entrar no atlas');
    expect(fraseR44('inverno', relato, 0)).not.toContain('soltas');
  });

  it('o Exportar passa as soltas para a frase', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/skins-actions.ts'), 'utf8');
    expect(fonte).toContain('looseImagesIn(saida.file, provisionalNames(doc))');
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 5 (06/10/2026) — a pele de uma pasta enxerga a pasta
// ---------------------------------------------------------------------------

describe('fazer a skin de uma pasta: a pasta do projeto conta (rodada 44, lote 5)', () => {
  /**
   * Na prova final (doc 55): com a pasta do herói como origem, a subpasta
   * `inverno/` estava na aba Imagens, mas a janela listava só "armadura,
   * armas" — as pastas de imagens já num atlas. O caminho do Spriter (a roupa
   * inteira de uma pasta) não se fazia.
   */
  it('a janela soma as imagens da pasta, e prepara as escolhidas antes', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/skins.ts'), 'utf8');
    expect(fonte).toContain('...folderImageNames(doc),');
    expect(fonte).toContain('const faltam = await ensureProvisionalMany(doc, plano.matched.map((m) => m.to));');
  });

  it('o plano acha a roupa de inverno pelos nomes de arquivo', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0' }, bones: [{ name: 'root' }],
      slots: [{ name: 'body', bone: 'root' }, { name: 'hair', bone: 'root' }, { name: 'face', bone: 'root' }],
      skins: [{ name: 'default', attachments: {
        body: { body: { type: 'region' } }, hair: { hair: { type: 'region' } }, face: { face: { type: 'region' } },
      } }],
    } as unknown as BoneFile;
    const plano = folderSkinPlan(file, 'default', 'inverno', ['body', 'hair', 'face', 'inverno/body', 'inverno/hair']);
    expect(plano.matched.map((m) => m.to)).toEqual(['inverno/body', 'inverno/hair']);
    expect(plano.missing).toEqual(['face/face']);
  });
});


// ---------------------------------------------------------------------------
// Rodada 44 (06/10/2026) — a conferência da v33.3 (doc 67)
// ---------------------------------------------------------------------------

import { SKIN_HELP_SHORT as curtaR44 } from '../src/panels/skins.js';
import { AddNamedSkin as nomeadaR44, addSkinNamed as criaR44, proposedSkinName as propostaR44 } from '../src/panels/skins-actions.js';

describe('a aba Skins: ajuda curta, nome antes de nascer (rodada 44, doc 67)', () => {
  const vazio = (): BoneFile => ({
    bone: { version: '1.0', minVersion: '1.0' }, bones: [{ name: 'root' }], slots: [],
    skins: [{ name: 'default', attachments: {} }, { name: 'skin', attachments: {} }],
  } as unknown as BoneFile);

  it('a ajuda curta cabe numa linha; a inteira continua na dica', () => {
    expect(curtaR44.length).toBeLessThanOrEqual(36);
    expect(curtaR44).toContain('roupa');
    const fonte = readFileSync(resolve(__dirname, '../src/panels/skins.ts'), 'utf8');
    expect(fonte).toContain('this.help.title = SKIN_HELP;');
  });

  it('o nome proposto é o próximo livre; a skin nasce com o nome escolhido', () => {
    const doc = new Doc(vazio(), { atlases: [] });
    expect(propostaR44(doc.file)).toBe('skin2');
    const antes = JSON.stringify(doc.file);
    expect(criaR44(doc, ' inverno ')).toBe('inverno');
    expect(doc.file.skins!.map((s) => s.name)).toContain('inverno');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(new nomeadaR44(doc.file, '').name).toBe('skin2');
  });

  it('a janela vem antes, com o nome selecionado, e Esc não cria nada', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/skins.ts'), 'utf8');
    expect(fonte).toContain("doc.notice('Nova skin: nada foi criado');");
    expect(fonte).toContain(".dialog-box .dialog-form-campo') as HTMLInputElement | null)?.select();");
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 6 (06/10/2026) — a conferência da prova final (doc 71)
// ---------------------------------------------------------------------------

import { firstFreeFolder as pastaR44 } from '../src/panels/skins.js';
import { wearOnTop as vesteR44 } from '../src/panels/skins-actions.js';

describe('a prova final: a pasta é lista, importar veste (rodada 44, lote 6)', () => {
  it('a pasta de partida é a primeira que não é skin', () => {
    expect(pastaR44(['armadura', 'armas', 'inverno'], ['default', 'armadura'])).toBe('armas');
    expect(pastaR44(['armadura'], ['armadura'])).toBe('armadura');
    expect(pastaR44([], [])).toBe('');
  });

  it('a janela da pasta é uma lista', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/skins.ts'), 'utf8');
    expect(fonte).toContain('choices: pastas.map((p) => ({ value: p, label: p })),');
  });

  it('importar veste: a pele no topo da pilha, o lápis onde estava', () => {
    expect(vesteR44('inverno')({ pilha: ['default', 'armadura'], lapis: 'armadura' }))
      .toEqual({ pilha: ['default', 'armadura', 'inverno'], lapis: 'armadura' });
    expect(vesteR44('inverno')({ pilha: ['inverno', 'default'], lapis: null }))
      .toEqual({ pilha: ['default', 'inverno'], lapis: null });
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 7 (06/10/2026) — os pesos vão e voltam (doc 75)
// ---------------------------------------------------------------------------

import { FitToPrevious as caberCmdR44 } from '../src/panels/image-picker-model.js';
import { MakeSkinFromFolder as pastaCmdR44, DeleteSkin as apagaR44 } from '../src/panels/skins-model.js';
import { ImportSkinCopy as importaR44, buildSkinFile as exportaR44, importSkinCopyNotice as fraseImportR44 } from '../src/io/export-skin.js';

describe('exportar, apagar e importar uma skin com malha de pesos (rodada 44, lote 7, doc 75)', () => {
  /**
   * A prova final refeita: a skin importada deixava o herói sem rosto, e a
   * barra dizia "Nenhum aviso". O rosto é uma malha com pesos em `head` e
   * `neck`; o `binding.bones` saía com os números do CORPO num arquivo que só
   * tem o `root`, e na volta ia todo para o índice 0. Este teste faz o
   * caminho inteiro e compara os ossos dos pesos pelo NOME.
   */
  const heroiR44 = (): Doc => new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile, {});
  const ossosDoRosto = (doc: Doc, pele: string): string[] => {
    const skin = doc.file.skins!.find((s) => s.name === pele)!;
    const face = (skin.attachments as unknown as Record<string, Record<string, { binding?: { bones: number[] } }>>)['head']!['face']!;
    return face.binding!.bones.map((i) => doc.file.bones![i]!.name);
  };

  it('o rosto volta preso aos mesmos ossos', () => {
    const doc = heroiR44();
    const imagens = ['face', 'hair', 'inverno/face', 'inverno/hair'];
    const plano = folderSkinPlan(doc.file, 'default', 'inverno', imagens);
    doc.run(new pastaCmdR44(doc.file, 'default', plano, 'inverno'));
    const antes = ossosDoRosto(doc, 'inverno');
    expect(antes).not.toEqual(antes.map(() => doc.file.bones![0]!.name));
    const saida = exportaR44(doc.file, 'inverno')!;
    doc.run(new apagaR44('inverno'));
    const copia = new importaR44('inverno.bone', JSON.parse(JSON.stringify(saida.file)));
    doc.run(copia);
    expect(ossosDoRosto(doc, 'inverno')).toEqual(antes);
    expect(copia.warnings.filter((w) => w.includes('do binding de'))).toEqual([]);
  });

  it('o aviso dos pesos não se engole na frase do Importar', () => {
    const falso = { brought: { skins: ['x'], bones: [], slots: [], constraints: [] },
      warnings: ['RIG_UNMET: o osso "neck" do binding de "face" (x.bone) não existe neste corpo; vai para o índice 0 (2.8)',
        'EXTERNAL_BONE_NOT_SKIN: o osso "neck" de "x.bone" não é skinRequired; ignorado (2.8)'] };
    const frase = fraseImportR44('x.bone', falso as never, []);
    expect(frase).toContain('do binding de "face"');
    expect(frase).not.toContain('não é skinRequired');
  });

  it('caber no lugar da antiga: a escala vezes o fator, e o desfazer devolve', () => {
    const doc = heroiR44();
    const antes = JSON.stringify(doc.file);
    const comando = new caberCmdR44('body', 'body', 'default', 0.5);
    // A escala do desenho só entra na cena com o rebuild: tem de ser 'structure'.
    expect(comando.kind).toBe('structure');
    doc.run(comando);
    const def = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['body']!['body']!;
    expect(def['scaleX']).toBeCloseTo(((JSON.parse(antes).skins[0].attachments.body.body.scaleX as number | undefined) ?? 1) * 0.5, 4);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});
