/**
 * Document, commands and undo (owner A).
 *
 * The contract that matters: after `undo()` the JSON must be byte-identical to
 * what it was before the command. Every test below compares
 * `JSON.stringify(file)` around the edit, because "the document is the file"
 * only holds if a botched revert cannot leave a trace.
 *
 * No DOM here — this suite covers `doc/`, not the shell.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';
import { DRAFT_FAILED, armUnloadGuard, saveDraft } from '../src/ui/shell-drop.js';

import { loadSkeletonData, parseBoneText } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { createEmptyFile } from '../src/doc/new-file.js';
import {
  AddAnimation, AddBone, AddSlot, RemoveAnimation, RemoveBone, RemoveSlot,
  RenameNode, SetProperties, SetProperty, SnapshotCommand,
  getAtPointer, pointerOf, setAtPointer,
} from '../src/doc/commands.js';
import { Reparent } from '../src/doc/reparent.js';
import { UndoStack } from '../src/doc/undo.js';
import {
  DRAFT_KEY, DRAFT_THROTTLE_MS, clearDraft, describeDraftTime, readDraft,
  shouldWriteDraft, writeDraft,
  KEPT_DRAFTS_KEY, clearAllDrafts, draftLabels, draftsToOffer, keepCurrentDraft, readKeptDrafts, takeKeptDraft,
} from '../src/doc/rascunho.js';
import type { Draft, DraftStorage } from '../src/doc/rascunho.js';
import { emptySelection } from '../src/contract.js';
// A propriedade da pilha de desfazer — defeito 1 (19/09/2026). Os comandos vem
// das partes porque o gesto vem das partes; a pilha e do documento.
import {
  CreateBone, CreateBoneAndGrab, MIN_LENGTH_PIXELS, describeBone,
} from '../src/viewport/tools/create-bone.js';
import { runDuplicate } from '../src/doc/duplicate.js';
import { DropEntityAsSlot } from '../src/doc/drop-entity.js';
import {
  AddBone as TreeAddBone, AddPointAttachment, AddSlot as TreeAddSlot,
} from '../src/panels/tree-commands.js';
import { DropImageAsSlot } from '../src/panels/palette-model.js';
import { ReorderSlots } from '../src/panels/draw-order-model.js';
import { DuplicateSkin } from '../src/panels/skins-model.js';

const ROOT = process.cwd().replace(/\\/g, '/') + '/';
const HEROI = `${ROOT}formato/exemplos/heroi.bone`;
const SCHEMA = `${ROOT}formato/bone.schema.json`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const validateAgainstSchema = (() => {
  const schema = JSON.parse(readFileSync(SCHEMA, 'utf8')) as object;
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
  addFormats(ajv);
  return ajv.compile(schema);
})();

function readHeroi(): BoneFile {
  return parseBoneText(readFileSync(HEROI, 'utf8')) as BoneFile;
}

/** Runs a command, undoes it, and fails unless the JSON came back untouched. */
function roundTrip(doc: Doc, make: () => { apply: unknown }): void {
  const before = JSON.stringify(doc.file);
  doc.run(make() as never);
  const after = JSON.stringify(doc.file);
  expect(after, 'o comando não mudou nada').not.toBe(before);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(before);
  doc.redo();
  expect(JSON.stringify(doc.file)).toBe(after);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(before);
}

/**
 * A small but complete skeleton: bones, slots, a constraint, a skin and five
 * kinds of timeline. It loads with zero warnings, so any warning a test sees
 * was caused by the command under test.
 *
 * Slot names and attachment names are kept different on purpose ("rosto" holds
 * "face"), because a rename that confuses the two is exactly the bug to catch.
 * The attachments are bounding boxes so no atlas is needed.
 */
function sampleFile(): BoneFile {
  const box = { type: 'boundingbox' as const, vertices: [0, 0, 10, 0, 10, 10, 0, 10] };
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', y: 90 },
      { name: 'torso', parent: 'hips', rotation: 90, length: 70, skinRequired: true },
      { name: 'head', parent: 'torso', x: 70, skinRequired: true },
      { name: 'alvo', parent: 'root', x: 30 },
    ],
    slots: [
      { name: 'corpo', bone: 'torso', attachment: 'tronco' },
      { name: 'rosto', bone: 'head', attachment: 'face' },
    ],
    constraints: [
      { type: 'ik', name: 'braco-ik', bones: ['torso'], target: 'alvo' },
    ],
    skins: [
      {
        name: 'default',
        bones: ['torso', 'head'],
        attachments: {
          corpo: { tronco: { ...box } },
          rosto: { face: { ...box } },
        },
      },
    ],
    animations: [
      {
        name: 'andar',
        duration: 1,
        timelines: [
          { type: 'bone', target: 'torso', property: 'rotation', keys: [{ time: 0, value: 90 }, { time: 1, value: 100 }] },
          { type: 'bone', target: 'head', property: 'x', keys: [{ time: 0, value: 70 }] },
          { type: 'slot', target: 'rosto', property: 'attachment', keys: [{ time: 0, value: 'face' }] },
          { type: 'constraint', target: 'braco-ik', property: 'mix', keys: [{ time: 0, value: 1 }] },
          { type: 'drawOrder', keys: [{ time: 0, value: [{ slot: 'rosto', offset: -1 }] }] },
        ],
      },
    ],
  };
}

function sampleDoc(): Doc {
  return new Doc(sampleFile());
}

// ---------------------------------------------------------------------------

describe('documento vazio', () => {
  it('cria um arquivo mínimo que carrega sem aviso', () => {
    const doc = new Doc(createEmptyFile('teste'));
    expect(doc.file.bones).toHaveLength(1);
    expect(doc.file.bones[0].name).toBe('root');
    expect(doc.data).not.toBeNull();
    expect(doc.warnings).toEqual([]);
    expect(doc.dirty).toBe(false);
    expect(doc.canUndo).toBe(false);
  });

  it('passa pelo schema do formato', () => {
    const ok = validateAgainstSchema(createEmptyFile());
    expect(validateAgainstSchema.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('constrói o esqueleto e a árvore de ossos', () => {
    const doc = sampleDoc();
    expect(doc.skeleton).not.toBeNull();
    expect(doc.skeleton?.findBone('head')).not.toBeNull();
    expect(doc.data?.bones).toHaveLength(5);
  });
});

describe('ponteiros JSON', () => {
  it('lê e escreve pelo caminho', () => {
    const file = sampleFile();
    expect(getAtPointer(file, '/bones/1/name')).toBe('hips');
    setAtPointer(file, '/bones/1/y', 120);
    expect(file.bones[1].y).toBe(120);
  });

  it('apagar é escrever undefined', () => {
    const file = sampleFile();
    setAtPointer(file, '/bones/1/y', undefined);
    expect('y' in file.bones[1]).toBe(false);
  });

  it('escapa ~ e / no caminho', () => {
    const file = { 'a/b': { 'c~d': 1 } };
    expect(pointerOf('a/b', 'c~d')).toBe('/a~1b/c~0d');
    expect(getAtPointer(file, '/a~1b/c~0d')).toBe(1);
  });
});

describe('SetProperty', () => {
  it('muda um valor e volta exatamente', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new SetProperty('/bones/1/y', 150, { label: 'Mover osso' }));
  });

  it('cria e remove uma propriedade que não existia', () => {
    const doc = sampleDoc();
    expect('scaleX' in doc.file.bones[1]).toBe(false);
    roundTrip(doc, () => new SetProperty('/bones/1/scaleX', 2));
    expect('scaleX' in doc.file.bones[1]).toBe(false);
  });

  it('junta um arrasto inteiro num passo só', () => {
    const doc = sampleDoc();
    const before = JSON.stringify(doc.file);
    for (const y of [91, 95, 100, 130]) {
      doc.run(new SetProperty('/bones/1/y', y, { label: 'Mover osso' }));
    }
    expect(doc.file.bones[1].y).toBe(130);
    expect(doc.undoLabel).toBe('Mover osso');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(before);
    expect(doc.canUndo).toBe(false);
  });

  it('não junta caminhos diferentes', () => {
    const doc = sampleDoc();
    doc.run(new SetProperty('/bones/1/y', 100));
    doc.run(new SetProperty('/bones/1/x', 10));
    doc.undo();
    expect(doc.file.bones[1].x).toBeUndefined();
    expect(doc.file.bones[1].y).toBe(100);
  });

  it('endMerge fecha o passo, e o arrasto seguinte é outro', () => {
    const doc = sampleDoc();
    doc.run(new SetProperty('/bones/1/y', 100));
    doc.endMerge();
    doc.run(new SetProperty('/bones/1/y', 200));
    doc.undo();
    expect(doc.file.bones[1].y).toBe(100);
    doc.undo();
    expect(doc.file.bones[1].y).toBe(90);
  });

  it('SetProperties move várias coisas num passo só', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new SetProperties([
      ['/bones/1/x', 5],
      ['/bones/1/y', 95],
      ['/bones/1/rotation', 12],
    ], { label: 'Mover osso' }));
  });
});

describe('adicionar', () => {
  it('adiciona um osso e desfaz', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new AddBone({ name: 'mao', parent: 'head', x: 10 }));
  });

  it('nunca põe um osso antes da raiz', () => {
    const doc = sampleDoc();
    doc.run(new AddBone({ name: 'mao', parent: 'root' }, 0));
    expect(doc.file.bones[0].name).toBe('root');
    expect(doc.file.bones[1].name).toBe('mao');
  });

  it('adiciona um slot e desfaz', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new AddSlot({ name: 'chapeu', bone: 'head' }));
  });

  it('adiciona uma animação e desfaz', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new AddAnimation({ name: 'pular', duration: 0.5, timelines: [] }));
  });

  it('remove o array que ele mesmo criou', () => {
    const doc = new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
    });
    const before = JSON.stringify(doc.file);
    doc.run(new AddSlot({ name: 'corpo', bone: 'root' }));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(before);
    expect('slots' in doc.file).toBe(false);
  });
});

describe('remover', () => {
  it('remove um osso com filhos e desfaz exatamente', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new RemoveBone('torso'));
  });

  it('leva junto slots, restrições, skins e timelines', () => {
    const doc = sampleDoc();
    doc.run(new RemoveBone('torso'));

    const names = doc.file.bones.map((b) => b.name);
    expect(names).toEqual(['root', 'hips', 'alvo']);
    // "head" era filho de "torso"; "corpo" e "rosto" viviam nos dois.
    expect(doc.file.slots).toEqual([]);
    // A restrição usava "torso", então sumiu.
    expect(doc.file.constraints).toEqual([]);
    expect(doc.file.skins?.[0].bones).toEqual([]);
    expect(doc.file.skins?.[0].attachments).toEqual({});
    // Sobraram só timelines que não apontam para nada removido.
    expect(doc.file.animations?.[0].timelines).toHaveLength(1);
    expect(doc.file.animations?.[0].timelines?.[0].type).toBe('drawOrder');
    expect(doc.file.animations?.[0].timelines?.[0].keys[0].value).toEqual([]);
    expect(doc.warnings).toEqual([]);
  });

  it('recusa remover a raiz', () => {
    const doc = sampleDoc();
    const before = JSON.stringify(doc.file);
    expect(() => doc.run(new RemoveBone('root'))).toThrow();
    expect(JSON.stringify(doc.file)).toBe(before);
  });

  it('remove um slot e desfaz exatamente', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new RemoveSlot('rosto'));
  });

  it('o slot removido some das skins e das timelines', () => {
    const doc = sampleDoc();
    doc.run(new RemoveSlot('rosto'));
    expect(doc.file.slots?.map((s) => s.name)).toEqual(['corpo']);
    expect(Object.keys(doc.file.skins?.[0].attachments ?? {})).toEqual(['corpo']);
    const types = doc.file.animations?.[0].timelines?.map((t) => t.type) ?? [];
    expect(types).not.toContain('slot');
    expect(doc.file.animations?.[0].timelines?.at(-1)?.keys[0].value).toEqual([]);
  });

  it('remove uma animação e desfaz exatamente', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new RemoveAnimation('andar'));
  });
});

describe('mudar de pai', () => {
  it('troca o pai e desfaz exatamente', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new Reparent(doc.file, { ...emptySelection(), bones: ['head'] }, 'hips'));
  });

  it('deixa cada osso depois do pai dele', () => {
    const doc = sampleDoc();
    doc.run(new Reparent(doc.file, { ...emptySelection(), bones: ['hips'] }, 'alvo'));
    const at = new Map(doc.file.bones.map((b, i) => [b.name, i]));
    for (const bone of doc.file.bones) {
      if (bone.parent === undefined) continue;
      expect(at.get(bone.parent)!).toBeLessThan(at.get(bone.name)!);
    }
    expect(doc.warnings).toEqual([]);
  });

  it('recusa pendurar um osso dentro de si mesmo, sem estourar', () => {
    // Antes do lote 34 isto passava pelo comando e o LEITOR é que estourava,
    // com o ciclo já escrito no arquivo. Agora o comando não escreve: ele diz
    // que não pode, o arquivo fica igual, e ninguém vê um erro de programa.
    const doc = sampleDoc();
    const before = JSON.stringify(doc.file);
    const comando = new Reparent(doc.file, { ...emptySelection(), bones: ['torso'] }, 'head');
    expect(comando.hasWork).toBe(false);
    expect(comando.skipped).toEqual(['torso']);
    doc.run(comando);
    expect(JSON.stringify(doc.file)).toBe(before);
  });
});

describe('renomear', () => {
  it('renomeia um osso e conserta todas as referências', () => {
    const doc = sampleDoc();
    doc.run(new RenameNode('bone', 'torso', 'tronco'));

    expect(doc.file.bones.map((b) => b.name)).toContain('tronco');
    expect(doc.file.bones.find((b) => b.name === 'head')?.parent).toBe('tronco');
    expect(doc.file.slots?.[0].bone).toBe('tronco');
    expect(doc.file.constraints?.[0]).toMatchObject({ bones: ['tronco'] });
    expect(doc.file.skins?.[0].bones).toEqual(['tronco', 'head']);
    expect(doc.file.animations?.[0].timelines?.[0].target).toBe('tronco');
    // Nada ficou apontando para o nome velho.
    expect(JSON.stringify(doc.file)).not.toContain('torso');
    // E o arquivo continua carregando limpo.
    expect(doc.warnings).toEqual([]);
  });

  it('renomear um osso desfaz exatamente', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new RenameNode('bone', 'torso', 'tronco'));
  });

  it('renomeia o alvo de uma restrição', () => {
    const doc = sampleDoc();
    doc.run(new RenameNode('bone', 'alvo', 'mira'));
    expect(doc.file.constraints?.[0]).toMatchObject({ target: 'mira' });
    expect(doc.warnings).toEqual([]);
  });

  it('renomeia um slot em toda parte', () => {
    const doc = sampleDoc();
    doc.run(new RenameNode('slot', 'rosto', 'cara'));
    expect(doc.file.slots?.map((s) => s.name)).toEqual(['corpo', 'cara']);
    expect(Object.keys(doc.file.skins?.[0].attachments ?? {})).toContain('cara');
    const drawOrder = doc.file.animations?.[0].timelines?.at(-1);
    expect(drawOrder?.keys[0].value).toEqual([{ slot: 'cara', offset: -1 }]);
    expect(JSON.stringify(doc.file)).not.toContain('"rosto"');
    // O nome do attachment é outra coisa e não pode ter sido tocado.
    expect(doc.file.slots?.[1].attachment).toBe('face');
    expect(doc.warnings).toEqual([]);
  });

  it('renomeia uma restrição e a timeline que a controla', () => {
    const doc = sampleDoc();
    doc.run(new RenameNode('constraint', 'braco-ik', 'ik-braco'));
    expect(doc.file.constraints?.[0].name).toBe('ik-braco');
    const timeline = doc.file.animations?.[0].timelines?.find((t) => t.type === 'constraint');
    expect(timeline?.target).toBe('ik-braco');
    expect(doc.warnings).toEqual([]);
  });

  it('renomeia uma animação e desfaz exatamente', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new RenameNode('animation', 'andar', 'caminhar'));
  });
});

describe('pilha de desfazer', () => {
  it('respeita o limite e esquece os mais velhos', () => {
    const stack = new UndoStack(3);
    for (let i = 0; i < 10; i++) {
      stack.push({ label: `passo ${i}`, kind: 'transform', apply: () => {}, revert: () => {} });
    }
    expect(stack.depth).toBe(3);
    expect(stack.undoLabel).toBe('passo 9');
  });

  it('um comando novo apaga o que estava refeito', () => {
    const doc = sampleDoc();
    doc.run(new SetProperty('/bones/1/y', 100));
    doc.undo();
    expect(doc.canRedo).toBe(true);
    doc.run(new SetProperty('/bones/1/x', 4));
    expect(doc.canRedo).toBe(false);
  });

  it('mostra os rótulos em português', () => {
    const doc = sampleDoc();
    doc.run(new RemoveBone('head'));
    expect(doc.undoLabel).toBe('Remover osso');
    doc.undo();
    expect(doc.redoLabel).toBe('Remover osso');
  });
});

// --- o gesto de várias partes (28/09/2026) ---------------------------------

/*
 * Um arrasto com "Não mexer nos filhos" grava DOIS comandos por movimento: o
 * osso (chave `K`) e a compensação (chave `K:filhos`). A pilha só juntava com
 * o vizinho de cima, e o vizinho era sempre o outro: nada se juntava.
 *
 * Os comandos daqui são de brinquedo, e de propósito: a regra é da PILHA, e
 * tem de valer para qualquer comando que traga a chave — não só para os dois
 * que existem hoje.
 */
describe('a pilha junta o gesto de várias partes', () => {
  /** Um comando que soma num contador e se junta com o de mesma chave. */
  function passo(
    estado: Record<string, number>, campo: string, mergeKey: string, para: number,
  ): { label: string; kind: 'transform'; mergeKey: string; de: number;
    apply(): void; revert(): void; mergeWith(previous: unknown): boolean; } {
    return {
      label: `mexer em ${campo}`,
      kind: 'transform',
      mergeKey,
      de: estado[campo] ?? 0,
      apply() { estado[campo] = para; },
      revert() { estado[campo] = this.de; },
      mergeWith(previous: unknown): boolean {
        const outro = previous as { mergeKey?: string; de?: number };
        if (outro.mergeKey !== this.mergeKey || outro.de === undefined) return false;
        this.de = outro.de;
        return true;
      },
    };
  }

  /** Aplica e entrega à pilha, como o `Doc.run` faz. */
  function rodar(stack: UndoStack, comando: ReturnType<typeof passo>): void {
    comando.apply();
    stack.push(comando);
  }

  const doc = {} as never;

  it('osso, filhos, osso, filhos: UM passo, e um desfazer volta os dois', () => {
    const estado = { osso: 0, filho: 0 };
    const stack = new UndoStack();
    for (let i = 1; i <= 4; i++) {
      rodar(stack, passo(estado, 'osso', 'mover:1', i * 10));
      rodar(stack, passo(estado, 'filho', 'mover:1:filhos', -i * 10));
    }
    expect(stack.depth).toBe(1);
    expect(stack.undoLabel).toBe('mexer em osso');
    stack.undo(doc);
    expect(estado).toEqual({ osso: 0, filho: 0 });
    stack.redo(doc);
    expect(estado).toEqual({ osso: 40, filho: -40 });
  });

  it('três partes — osso, filhos e desenhos — continuam sendo um passo', () => {
    const estado = { osso: 0, filho: 0, desenho: 0 };
    const stack = new UndoStack();
    for (let i = 1; i <= 3; i++) {
      rodar(stack, passo(estado, 'osso', 'girar:2', i));
      rodar(stack, passo(estado, 'filho', 'girar:2:filhos', i * 2));
      rodar(stack, passo(estado, 'desenho', 'girar:2:desenhos', i * 3));
    }
    expect(stack.depth).toBe(1);
    stack.undo(doc);
    expect(estado).toEqual({ osso: 0, filho: 0, desenho: 0 });
  });

  it('o arrasto SEGUINTE é outro passo: soltar o mouse fecha o gesto', () => {
    const estado = { osso: 0, filho: 0 };
    const stack = new UndoStack();
    rodar(stack, passo(estado, 'osso', 'mover:1', 10));
    rodar(stack, passo(estado, 'filho', 'mover:1:filhos', -10));
    stack.breakMerge();
    rodar(stack, passo(estado, 'osso', 'mover:2', 20));
    rodar(stack, passo(estado, 'filho', 'mover:2:filhos', -20));
    expect(stack.depth).toBe(2);
    stack.undo(doc);
    expect(estado).toEqual({ osso: 10, filho: -10 });
  });

  it('chave que NÃO é filha não entra no gesto de ninguém', () => {
    const estado = { osso: 0, outro: 0, parecido: 0 };
    const stack = new UndoStack();
    rodar(stack, passo(estado, 'osso', 'mover:1', 10));
    // `mover:12` começa com `mover:1`, e NÃO é filha dela: falta o `:`.
    rodar(stack, passo(estado, 'parecido', 'mover:12', 5));
    rodar(stack, passo(estado, 'outro', 'girar:3', 7));
    expect(stack.depth).toBe(3);
  });

  it('comando sem chave nenhuma nunca é engolido por um gesto', () => {
    const estado = { osso: 0, filho: 0 };
    const stack = new UndoStack();
    rodar(stack, passo(estado, 'osso', 'mover:1', 10));
    rodar(stack, passo(estado, 'filho', 'mover:1:filhos', -10));
    stack.push({ label: 'solto', kind: 'structure', apply: () => {}, revert: () => {} });
    expect(stack.depth).toBe(2);
    expect(stack.undoLabel).toBe('solto');
  });
});

describe('estado do documento', () => {
  it('fica sujo depois de um comando e limpo depois de salvar', () => {
    const doc = sampleDoc();
    expect(doc.dirty).toBe(false);
    doc.run(new SetProperty('/bones/1/y', 100));
    expect(doc.dirty).toBe(true);
    doc.markSaved('teste.bone');
    expect(doc.dirty).toBe(false);
    expect(doc.name).toBe('teste.bone');
  });

  it('avisa quem escuta, com o tipo da mudança', () => {
    const doc = sampleDoc();
    const seen: string[] = [];
    const off = doc.on((change) => seen.push(change.kind));
    doc.run(new SetProperty('/bones/1/y', 100));
    doc.run(new AddBone({ name: 'mao', parent: 'head' }));
    doc.select({ ...emptySelection(), bones: ['head'] });
    off();
    doc.run(new SetProperty('/bones/1/y', 5));
    expect(seen).toEqual(['transform', 'structure', 'selection']);
  });

  // E12: a barra de estado imprime `change.label` no lugar da última ação.
  // Com o nome cru da animação a linha virava "walk. Arquivo não salvo.",
  // que não é uma frase.
  it('trocar de animação diz uma frase inteira, não o nome cru', () => {
    const doc = sampleDoc();
    const labels: (string | undefined)[] = [];
    doc.on((change) => labels.push(change.label));
    doc.animation = 'andar';
    doc.animation = null;
    expect(labels).toEqual(['Abriu a animação "andar"', 'Abriu a base']);
  });

  // Recado de barra de estado: sem comando, sem desfazer, sem marca de sujo.
  it('notice fala na barra de estado sem sujar o arquivo', () => {
    const doc = sampleDoc();
    const labels: (string | undefined)[] = [];
    doc.on((change) => labels.push(change.label));
    doc.notice('O osso raiz não pode ser apagado');
    expect(labels).toEqual(['O osso raiz não pode ser apagado']);
    expect(doc.dirty).toBe(false);
    expect(doc.canUndo).toBe(false);
  });

  it('a seleção troca por select, nunca por dentro', () => {
    const doc = sampleDoc();
    doc.select({ ...emptySelection(), bones: ['head'] });
    expect(doc.selection.bones).toEqual(['head']);
  });

  it('reposiciona o esqueleto quando o tempo anda', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    const at0 = doc.skeleton?.findBone('torso')?.rotation;
    doc.time = 1;
    const at1 = doc.skeleton?.findBone('torso')?.rotation;
    expect(at0).toBe(90);
    expect(at1).toBe(100);
  });

  it('guarda câmera, seleção e animação dentro do arquivo ao salvar', () => {
    const doc = sampleDoc();
    doc.camera = { x: 10, y: -5, zoom: 2 };
    doc.animation = 'andar';
    doc.select({ ...emptySelection(), bones: ['head'] });

    const saved = JSON.parse(doc.serialize()) as BoneFile;
    const state = (saved.extensions ?? {})['RECORTE_editor_state'] as Record<string, unknown>;
    expect(state['camera']).toEqual({ x: 10, y: -5, zoom: 2 });
    expect(state['animation']).toBe('andar');
    expect((state['selection'] as { bones: string[] }).bones).toEqual(['head']);
    expect(saved.extensionsUsed).toContain('RECORTE_editor_state');

    // E ao reabrir esse arquivo o editor volta onde estava.
    const reopened = new Doc(saved);
    expect(reopened.camera).toEqual({ x: 10, y: -5, zoom: 2 });
    expect(reopened.animation).toBe('andar');
    expect(reopened.selection.bones).toEqual(['head']);
  });

  it('guarda o que outro painel escreveu na extensão ao salvar', () => {
    // Pedido 10: o painel Exibição grava `view` na mesma extensão, e um
    // salvamento que montasse o objeto do zero apagava a chave.
    const doc = sampleDoc();
    const file = doc.file as { extensions?: Record<string, unknown> };
    file.extensions = { RECORTE_editor_state: { view: { grid: false } } };

    const saved = JSON.parse(doc.serialize()) as BoneFile;
    const state = (saved.extensions ?? {})['RECORTE_editor_state'] as Record<string, unknown>;
    expect(state['view']).toEqual({ grid: false });
  });

  it('trocar de arquivo zera desfazer, seleção e sujeira', () => {
    const doc = sampleDoc();
    doc.run(new SetProperty('/bones/1/y', 100));
    doc.setFile(createEmptyFile('outro'));
    expect(doc.canUndo).toBe(false);
    expect(doc.dirty).toBe(false);
    expect(doc.selection.bones).toEqual([]);
    expect(doc.file.bones).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// O caminho barato: recarregar só as animações (PEDIDOS-FASE3B, pedido 6)
// ---------------------------------------------------------------------------

describe('rebuildAnimations', () => {
  it('vê a chave nova sem recarregar o arquivo inteiro', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    doc.time = 0;
    const data = doc.data;
    const skeleton = doc.skeleton;
    expect(doc.skeleton?.findBone('torso')?.rotation).toBe(90);

    // Escreve direto no arquivo, como um comando faria, e pede o barato.
    const timeline = doc.file.animations?.[0].timelines?.[0] as { keys: Array<{ value: number }> };
    timeline.keys[0].value = 45;
    doc.rebuildAnimations();

    expect(doc.skeleton?.findBone('torso')?.rotation).toBe(45);
    // Os mesmos objetos: nada foi reconstruído do arquivo.
    expect(doc.data).toBe(data);
    expect(doc.skeleton).toBe(skeleton);
    expect(doc.warnings).toEqual([]);
  });

  it('uma timeline nova aparece sem recarregar tudo', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    const data = doc.data;
    doc.file.animations?.[0].timelines?.push({
      type: 'bone', target: 'hips', property: 'y', keys: [{ time: 0, value: 200 }],
    } as never);
    doc.rebuildAnimations();

    expect(doc.data).toBe(data);
    expect(doc.skeleton?.findBone('hips')?.y).toBe(200);
    expect(doc.data?.findAnimation('andar')?.timelines).toHaveLength(6);
  });

  it('uma chave escrita por SetKey usa o caminho barato', async () => {
    const { SetKey } = await import('../src/anim/pose-mode.js');
    const doc = sampleDoc();
    doc.animation = 'andar';
    const data = doc.data;
    doc.run(new SetKey('andar', 0, { type: 'bone', target: 'torso', property: 'rotation' }, 12));

    expect(doc.skeleton?.findBone('torso')?.rotation).toBe(12);
    expect(doc.data).toBe(data);
    doc.undo();
    expect(doc.skeleton?.findBone('torso')?.rotation).toBe(90);
    expect(doc.data).toBe(data);
  });
});

// ---------------------------------------------------------------------------
// Ida e volta com o exemplo de verdade
// ---------------------------------------------------------------------------

describe('heroi.bone do disco', () => {
  it('abre, não mexe, salva e continua válido pelo schema', () => {
    const doc = new Doc(readHeroi());
    const saved = JSON.parse(doc.serialize()) as BoneFile;

    const ok = validateAgainstSchema(saved);
    expect(validateAgainstSchema.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });

  it('o que sai carrega igual ao que entrou', () => {
    const original = readHeroi();
    const doc = new Doc(readHeroi());
    const saved = parseBoneText(doc.serialize());

    const before = loadSkeletonData(original);
    const after = loadSkeletonData(saved);
    expect(after.bones.map((b) => b.name)).toEqual(before.bones.map((b) => b.name));
    expect(after.slots.map((s) => s.name)).toEqual(before.slots.map((s) => s.name));
    expect(after.animations.map((a) => a.name)).toEqual(before.animations.map((a) => a.name));
    expect(after.constraints.map((c) => c.name)).toEqual(before.constraints.map((c) => c.name));
    expect(after.warnings.length).toBe(before.warnings.length);
  });

  it('só mexe no que o editor guarda: o resto do JSON fica igual', () => {
    const original = readHeroi();
    const doc = new Doc(readHeroi());
    const saved = JSON.parse(doc.serialize()) as BoneFile;

    // O editor grava a sua extensão e a data de modificação. Fora isso, nada.
    delete (saved.extensions ?? {})['RECORTE_editor_state'];
    delete (original.extensions ?? {})['RECORTE_editor_state'];
    saved.bone.modified = original.bone.modified;
    if (Object.keys(saved.extensions ?? {}).length === 0) delete saved.extensions;
    if (Object.keys(original.extensions ?? {}).length === 0) delete original.extensions;

    expect(JSON.stringify(saved)).toBe(JSON.stringify(original));
  });

  it('renomear um osso do exemplo não deixa referência quebrada', () => {
    const doc = new Doc(readHeroi());
    const antes = doc.warnings.length;
    // No heroi há um osso "forearm", um slot "forearm" e uma imagem "forearm".
    // Renomear o osso só pode mexer no osso — os outros dois são outra coisa.
    doc.run(new RenameNode('bone', 'forearm', 'antebraco'));

    expect(doc.warnings.length).toBe(antes);
    expect(doc.file.bones.some((b) => b.name === 'forearm')).toBe(false);
    expect(doc.file.bones.some((b) => b.parent === 'forearm')).toBe(false);
    expect(doc.file.slots?.some((s) => s.bone === 'forearm')).toBe(false);
    for (const constraint of doc.file.constraints ?? []) {
      const any = constraint as unknown as Record<string, unknown>;
      expect(any['bones'] ?? []).not.toContain('forearm');
      expect(any['bone']).not.toBe('forearm');
    }
    for (const animation of doc.file.animations ?? []) {
      for (const timeline of animation.timelines ?? []) {
        if (timeline.type === 'bone') expect(timeline.target).not.toBe('forearm');
      }
    }
    // E o slot e a imagem continuam com o nome deles.
    expect(doc.file.slots?.some((s) => s.name === 'forearm')).toBe(true);
  });

  it('remover um osso do exemplo desfaz exatamente', () => {
    const doc = new Doc(readHeroi());
    roundTrip(doc, () => new RemoveBone('arm'));
  });

  it('depois de remover um osso o arquivo ainda passa no schema', () => {
    const doc = new Doc(readHeroi());
    doc.run(new RemoveBone('cape1'));
    const ok = validateAgainstSchema(JSON.parse(doc.serialize()));
    expect(validateAgainstSchema.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
  });
});


// ---------------------------------------------------------------------------
// E6: o trabalho não some ao fechar a aba
// ---------------------------------------------------------------------------

class GuardadorFalso implements DraftStorage {
  readonly mapa = new Map<string, string>();
  /** Quando ligado, recusa gravar — é o que a aba anônima faz. */
  recusa = false;

  getItem(key: string): string | null {
    return this.mapa.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.recusa) throw new Error('sem espaço');
    this.mapa.set(key, value);
  }

  removeItem(key: string): void {
    this.mapa.delete(key);
  }
}

describe('rascunho automático', () => {
  const agora = Date.parse('2026-09-08T14:30:00');

  function rascunho(json = '{"bone":{"version":"1.0"}}', savedAt = agora): Draft {
    return { savedAt, name: 'heroi.bone', path: '/tmp/heroi.bone', json };
  }

  it('grava e lê de volta o mesmo trabalho', () => {
    const g = new GuardadorFalso();
    expect(writeDraft(g, rascunho())).toBe(true);
    const lido = readDraft(g, agora + 1000);
    expect(lido?.json).toBe('{"bone":{"version":"1.0"}}');
    expect(lido?.name).toBe('heroi.bone');
    expect(lido?.path).toBe('/tmp/heroi.bone');
  });

  it('salvar apaga o rascunho', () => {
    const g = new GuardadorFalso();
    writeDraft(g, rascunho());
    clearDraft(g);
    expect(readDraft(g, agora)).toBe(null);
  });

  it('um guardador que recusa não derruba o editor', () => {
    const g = new GuardadorFalso();
    g.recusa = true;
    expect(writeDraft(g, rascunho())).toBe(false);
    expect(readDraft(g, agora)).toBe(null);
  });

  it('não oferece lixo: texto quebrado, campos faltando, rascunho vazio', () => {
    const g = new GuardadorFalso();
    g.mapa.set(DRAFT_KEY, 'isto não é json');
    expect(readDraft(g, agora)).toBe(null);
    g.mapa.set(DRAFT_KEY, '{"savedAt":1}');
    expect(readDraft(g, agora)).toBe(null);
    g.mapa.set(DRAFT_KEY, '{"json":"{}"}');
    expect(readDraft(g, agora)).toBe(null);
    g.mapa.set(DRAFT_KEY, '{"json":"","savedAt":1}');
    expect(readDraft(g, agora)).toBe(null);
  });

  it('não acorda um rascunho de duas semanas atrás', () => {
    const g = new GuardadorFalso();
    writeDraft(g, rascunho('{"a":1}', agora - 14 * 24 * 60 * 60 * 1000));
    expect(readDraft(g, agora)).toBe(null);
    // Dentro do prazo, ele volta.
    writeDraft(g, rascunho('{"a":1}', agora - 60 * 60 * 1000));
    expect(readDraft(g, agora)?.json).toBe('{"a":1}');
  });

  it('a espera evita gravar o arquivo inteiro a cada movimento do mouse', () => {
    expect(shouldWriteDraft(null, agora)).toBe(true);
    expect(shouldWriteDraft(agora, agora + 100)).toBe(false);
    expect(shouldWriteDraft(agora, agora + DRAFT_THROTTLE_MS)).toBe(true);
  });

  it('diz a hora em português, do jeito que o dono lê', () => {
    expect(describeDraftTime(Date.parse('2026-09-08T09:05:00'), agora)).toBe('hoje às 09:05');
    expect(describeDraftTime(Date.parse('2026-09-07T22:10:00'), agora)).toBe('ontem às 22:10');
    expect(describeDraftTime(Date.parse('2026-09-03T22:10:00'), agora)).toContain('às 22:10');
    expect(describeDraftTime(Date.parse('2026-09-03T22:10:00'), agora)).toContain('em ');
  });
});

// ---------------------------------------------------------------------------
// Degrau 4b (17/09/2026): o documento vira projeto; a virada de corpo (9.13)
// ---------------------------------------------------------------------------

import { Projeto, emptyManifest, isProjectManifest, readProjectLists, writeProjectLists, bodyLabel } from '../src/doc/projeto.js';
// Rodada 8b, C18.
import { garantirAninhado as garantirAninhadoC18 } from '../src/doc/projeto.js';
import { rememberEntityFile as rememberEntityFileC18 } from '../src/doc/entity-files.js';
import { readOpenedFiles } from '../src/io/open-save.js';
import { loadAtlas as loadAtlasC18 } from '../../runtime/src/index.js';
import type { ProjectManifest } from '../src/doc/projeto.js';
import { AddBone as AddBoneNaArvore } from '../src/panels/tree-commands.js';
import { corpoDe, wentToBase } from '../src/contract.js';
import type { DocChange } from '../src/contract.js';
import { bodyAt, bodyKeys, pasteBodyHere, removeBodyKey, setBodyKey } from '../src/anim/body.js';

const C290 = `${ROOT}conformidade/casos/C-290-virada-corte-seco/`;

/** O homem e o lobisomem do caso C-290: duas bases, uma animação com a virada em 0,5 s. */
function lerCorpo(nome: string): BoneFile {
  return parseBoneText(readFileSync(`${C290}${nome}`, 'utf8')) as BoneFile;
}

/** Um manifesto de dois corpos, com as listas do editor. */
function manifestoDoisCorpos(): ProjectManifest {
  return writeProjectLists(emptyManifest('entrada.bone'), {
    corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
  });
}

/** O projeto de dois corpos montado em volta de um documento, como a casca faz. */
function projetoDoisCorpos(): { doc: Doc; projeto: Projeto; mudancas: DocChange[] } {
  const doc = new Doc(createEmptyFile());
  const projeto = new Projeto(doc);
  const manifest = manifestoDoisCorpos();
  projeto.open(manifest, readProjectLists(manifest), new Map([
    ['entrada.bone', { file: lerCorpo('entrada.bone'), options: {} }],
    ['lobisomem.bone', { file: lerCorpo('lobisomem.bone'), options: {} }],
  ]));
  const mudancas: DocChange[] = [];
  doc.on((change) => mudancas.push(change));
  return { doc, projeto, mudancas };
}

describe('o projeto: vários corpos, uma pilha (degrau 4b)', () => {
  it('nasce em volta do documento, como projeto de um corpo só', () => {
    const doc = new Doc(readHeroi(), { path: 'heroi.bone' });
    const projeto = new Projeto(doc);
    expect(projeto.emFoco).toBe(doc);
    expect(projeto.emFocoUri).toBe('heroi.bone');
    expect([...projeto.corpos.keys()]).toEqual(['heroi.bone']);
    expect(projeto.temVarios).toBe(false);
    expect(doc.project).toBe(projeto);
    // Sem virada, o corpo do instante é o próprio documento.
    expect(doc.body).toBe(null);
    expect(corpoDe(doc)).toBe(doc);
  });

  it('abre dois corpos: o foco é o homem, o outro é um Doc com a mesma pilha', () => {
    const { doc, projeto } = projetoDoisCorpos();
    expect(doc.path).toBe('entrada.bone');
    expect(doc.file.skeleton?.name).toBe('homem');
    expect(projeto.outrosCorpos).toEqual(['lobisomem.bone']);
    const lobo = projeto.docOf('lobisomem.bone');
    expect(lobo).not.toBe(null);
    expect(lobo?.file.skeleton?.name).toBe('lobisomem');
    expect(lobo?.stackForProject()).toBe(doc.stackForProject());
    expect(projeto.temVarios).toBe(true);
    // O documento em foco abre na primeira animação, como sempre.
    expect(doc.animation).toBe('transformar');
  });

  it('corpoEm(t): antes da chave vale o arquivo; da chave em diante, o lobisomem', () => {
    const { doc, projeto } = projetoDoisCorpos();
    doc.time = 0.25;
    expect(doc.body).toBe(null);
    expect(corpoDe(doc)).toBe(doc);
    doc.time = 0.75;
    expect(doc.body).toBe('lobisomem.bone');
    expect(corpoDe(doc)).toBe(projeto.docOf('lobisomem.bone'));
    // A volta também vale: a virada é uma função de t.
    doc.time = 0.1;
    expect(doc.body).toBe(null);
  });

  it('a cena lê o Actor: em 0,75 o esqueleto vivo é o do lobisomem, com o rabo e sem o braço', () => {
    const { doc } = projetoDoisCorpos();
    doc.time = 0.25;
    expect(doc.skeleton?.findBone('braco')).not.toBe(null);
    expect(doc.skeleton?.findBone('rabo')).toBe(null);
    // A base do homem: o tronco em y 100, andando em x (C-290, conta 1).
    expect(doc.skeleton?.findBone('tronco')?.worldX).toBeCloseTo(10, 5);
    expect(doc.skeleton?.findBone('tronco')?.worldY).toBeCloseTo(100, 5);
    doc.time = 0.75;
    expect(doc.skeleton?.findBone('rabo')).not.toBe(null);
    expect(doc.skeleton?.findBone('braco')).toBe(null);
    // A base do lobisomem: o tronco em y 120; a mesma linha `tronco/x` vale nos dois.
    expect(doc.skeleton?.findBone('tronco')?.worldX).toBeCloseTo(30, 5);
    expect(doc.skeleton?.findBone('tronco')?.worldY).toBeCloseTo(120, 5);
    // O rabo girou 45° pela linha `rabo/rotation`, que o homem ignorava.
    expect(doc.skeleton?.findBone('rabo')?.worldX).toBeCloseTo(20, 5);
  });

  it('o rodapé sabe para que base a mexida foi', () => {
    const { doc } = projetoDoisCorpos();
    doc.time = 0.25;
    expect(wentToBase(doc)).toBe(' (foi para a base)');
    doc.time = 0.75;
    expect(wentToBase(doc)).toBe(' (foi para a base de lobisomem)');
    doc.animation = null;
    expect(wentToBase(doc)).toBe('');
  });

  it('a mexida estrutural vai para a base do corpo do instante, e o foco fica sabendo', () => {
    const { doc, projeto, mudancas } = projetoDoisCorpos();
    const lobo = projeto.docOf('lobisomem.bone')!;
    const antesLobo = JSON.stringify(lobo.file);
    const antesHomem = JSON.stringify(doc.file);
    doc.time = 0.75;
    mudancas.length = 0;
    const corpo = corpoDe(doc);
    expect(corpo).toBe(lobo);
    const comando = new AddBoneNaArvore(corpo.file, 'tronco');
    corpo.run(comando);
    // O osso nasceu no lobisomem, e o homem não mudou uma vírgula.
    expect((lobo.file.bones ?? []).map((b) => b.name)).toContain(comando.name);
    expect(JSON.stringify(doc.file)).toBe(antesHomem);
    // O foco ouviu, com o nome do corpo no rótulo, e o ator foi refeito.
    expect(mudancas.some((m) => m.kind === 'structure' && m.label === 'Novo osso (na base de lobisomem)')).toBe(true);
    expect(doc.skeleton?.findBone(comando.name)).not.toBe(null);
    // Sujo é o projeto: o foco diz "não salvo" mesmo sem mexer no próprio arquivo.
    expect(doc.dirty).toBe(true);
    expect(lobo.dirty).toBe(true);
    // Uma pilha só: o Ctrl+Z do foco desfaz o passo dado no lobisomem.
    expect(doc.canUndo).toBe(true);
    expect(doc.undoLabel).toBe('Novo osso');
    doc.undo();
    expect(JSON.stringify(lobo.file)).toBe(antesLobo);
    expect(doc.skeleton?.findBone(comando.name)).toBe(null);
    expect(mudancas.some((m) => m.label === 'Desfeito: Novo osso (na base de lobisomem)')).toBe(true);
    doc.redo();
    expect((lobo.file.bones ?? []).map((b) => b.name)).toContain(comando.name);
    doc.undo();
    expect(JSON.stringify(lobo.file)).toBe(antesLobo);
  });

  it('salvar o projeto limpa a marca de todos os corpos', () => {
    const { doc, projeto } = projetoDoisCorpos();
    doc.time = 0.75;
    const corpo = corpoDe(doc);
    corpo.run(new AddBoneNaArvore(corpo.file, 'tronco'));
    expect(doc.dirty).toBe(true);
    projeto.markSaved('entrada.bone');
    expect(doc.dirty).toBe(false);
    expect(projeto.docOf('lobisomem.bone')?.dirty).toBe(false);
  });

  it('abrir outro arquivo no foco zera o projeto: um corpo só, as entidades do arquivo', () => {
    const { doc, projeto } = projetoDoisCorpos();
    const espada = loadSkeletonData(JSON.parse(readFileSync(`${ROOT}formato/exemplos/espada.bone`, 'utf8')));
    doc.setFile(readHeroi(), { path: 'heroi.bone', skeletons: new Map([['espada.bone', espada]]) });
    expect([...projeto.corpos.keys()]).toEqual(['heroi.bone']);
    expect([...projeto.entidades]).toEqual(['espada.bone']);
    expect(projeto.emFocoUri).toBe('heroi.bone');
    expect(projeto.manifesto.main).toBe('heroi.bone');
    expect(doc.body).toBe(null);
  });

  it('sem o outro corpo carregado, a chave body avisa e o arquivo fica (regra 21)', () => {
    const doc = new Doc(lerCorpo('entrada.bone'), { path: 'entrada.bone' });
    doc.animation = 'transformar';
    doc.time = 0.75;
    expect(doc.body).toBe(null);
    expect(doc.skeleton?.findBone('braco')).not.toBe(null);
    expect(doc.warnings.some((w) => w.includes('BODY_MISSING') && w.includes('lobisomem.bone'))).toBe(true);
  });

  it('as peles visíveis passam pelo ator: a pilha da tela não se perde ao posar', () => {
    const doc = new Doc(readHeroi(), { path: 'heroi.bone' });
    doc.animation = 'walk';
    doc.visibleSkins = ['armadura'];
    doc.repose();
    expect(doc.skeleton?.skinStack.map((skin) => skin.name)).toEqual(['default', 'armadura']);
    doc.time = 0.3;
    expect(doc.skeleton?.skinStack.map((skin) => skin.name)).toEqual(['default', 'armadura']);
    // Nome que o arquivo não tem fica fora, sem derrubar nada.
    doc.visibleSkins = ['nao-existe', 'armadura'];
    doc.repose();
    expect(doc.skeleton?.skinStack.map((skin) => skin.name)).toEqual(['default', 'armadura']);
  });
});

describe('o manifesto e as listas Corpos e Entidades (spec 2.9)', () => {
  it('sem RECORTE_projeto vale a regra do leitor: main é corpo, o resto é entidade', () => {
    const lists = readProjectLists({ bonez: { version: '1.0' }, main: 'heroi.bone', skeletons: ['heroi.bone', 'espada.bone'] });
    expect(lists).toEqual({ corpos: ['heroi.bone'], entidades: ['espada.bone'], emFoco: 'heroi.bone' });
  });

  it('com as listas, elas mandam; emFoco que não é corpo cai no main', () => {
    const manifest = writeProjectLists(emptyManifest('a.bone'), { corpos: ['a.bone', 'b.bone'], entidades: ['e.bone'], emFoco: 'b.bone' });
    expect(manifest.main).toBe('b.bone');
    expect(manifest.skeletons).toEqual(['a.bone', 'b.bone', 'e.bone']);
    expect(manifest.extras).toEqual({ RECORTE_projeto: { corpos: ['a.bone', 'b.bone'], entidades: ['e.bone'], emFoco: 'b.bone' } });
    expect(readProjectLists(manifest)).toEqual({ corpos: ['a.bone', 'b.bone'], entidades: ['e.bone'], emFoco: 'b.bone' });
    const torto = { ...manifest, extras: { RECORTE_projeto: { corpos: ['a.bone'], entidades: ['a.bone', 'x.bone'], emFoco: 'zzz' } } };
    expect(readProjectLists(torto)).toEqual({ corpos: ['b.bone', 'a.bone'], entidades: ['x.bone'], emFoco: 'b.bone' });
  });

  it('o que é e o que não é manifesto; o nome do corpo para o rodapé', () => {
    expect(isProjectManifest({ bonez: { version: '1.0' }, main: 'x.bone' })).toBe(true);
    expect(isProjectManifest({ main: 'x.bone' })).toBe(false);
    expect(isProjectManifest({ bone: { version: '1.0' }, bones: [] })).toBe(false);
    expect(isProjectManifest(null)).toBe(false);
    expect(bodyLabel('pasta/lobisomem.bone', null)).toBe('lobisomem.bone');
    expect(bodyLabel('lobisomem.bone', new Doc(lerCorpo('lobisomem.bone')))).toBe('lobisomem');
  });
});

describe('a chave body: Colar corpo aqui (M10, spec 9.13)', () => {
  it('bodyAt lê o arquivo como o runtime: antes da primeira chave, o arquivo', () => {
    const file = lerCorpo('entrada.bone');
    expect(bodyAt(file, 'transformar', 0.25)).toBe(null);
    expect(bodyAt(file, 'transformar', 0.5)).toBe('lobisomem.bone');
    expect(bodyAt(file, 'transformar', 0.75)).toBe('lobisomem.bone');
    expect(bodyAt(file, null, 0.75)).toBe(null);
    expect(bodyKeys(file, 'transformar')).toEqual([{ time: 0.5, value: 'lobisomem.bone' }]);
  });

  it('setBodyKey: uma timeline por animação, chave no mesmo tempo é atualizada, a lista fica em ordem', () => {
    const file = readHeroi();
    setBodyKey(file, 'walk', 0.6, 'lobisomem.bone');
    setBodyKey(file, 'walk', 0.2, 'lobo.bone', false);
    setBodyKey(file, 'walk', 0.6, null);
    expect(bodyKeys(file, 'walk')).toEqual([{ time: 0.2, value: 'lobo.bone', keepSkins: false }, { time: 0.6, value: null }]);
    const walk = (file.animations ?? []).find((a) => a.name === 'walk')!;
    expect((walk.timelines ?? []).filter((line) => (line as { type: string }).type === 'body')).toHaveLength(1);
    expect(bodyAt(file, 'walk', 0.4)).toBe('lobo.bone');
    expect(bodyAt(file, 'walk', 0.9)).toBe(null);
    // Chave depois do fim estica a duração, como toda chave.
    setBodyKey(file, 'walk', 2, 'x.bone');
    expect(walk.duration).toBe(2);
    expect(removeBodyKey(file, 'walk', 2)).toBe(true);
    expect(removeBodyKey(file, 'walk', 2)).toBe(false);
  });

  it('Colar corpo aqui grava a chave em doc.time, e desfazer devolve o JSON exato', () => {
    const { doc, projeto } = projetoDoisCorpos();
    // Um homem sem virada: a animação nasce sem chave body.
    const limpo = lerCorpo('entrada.bone');
    for (const a of limpo.animations ?? []) a.timelines = (a.timelines ?? []).filter((line) => (line as { type: string }).type !== 'body');
    doc.setFile(limpo, { path: 'entrada.bone' });
    projeto.open(manifestoDoisCorpos(), readProjectLists(manifestoDoisCorpos()), new Map([
      ['entrada.bone', { file: limpo, options: {} }],
      ['lobisomem.bone', { file: lerCorpo('lobisomem.bone'), options: {} }],
    ]));
    doc.animation = 'transformar';
    doc.time = 0.5;
    expect(doc.body).toBe(null);
    const antes = JSON.stringify(doc.file);
    const frase = pasteBodyHere(doc, 'lobisomem.bone', 'lobisomem');
    expect(frase).toBe('Base lobisomem colada em 0,50 s: dali em diante a cena mostra ela');
    expect(bodyKeys(doc.file, 'transformar')).toEqual([{ time: 0.5, value: 'lobisomem.bone' }]);
    // A cena troca de corpo ali mesmo, sem remontar nada.
    expect(doc.body).toBe('lobisomem.bone');
    expect(doc.skeleton?.findBone('rabo')).not.toBe(null);
    doc.time = 0.25;
    expect(doc.body).toBe(null);
    expect(doc.undoLabel).toBe('Colar base aqui');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    doc.time = 0.75;
    expect(doc.body).toBe(null);
    // Sem animação aberta não há onde colar.
    doc.animation = null;
    expect(pasteBodyHere(doc, 'lobisomem.bone', 'lobisomem')).toBe(null);
  });

  it('a volta: colar o corpo do arquivo é a chave null', () => {
    const { doc } = projetoDoisCorpos();
    doc.time = 0.8;
    expect(pasteBodyHere(doc, null, '')).toBe('De 0,80 s em diante vale a base do arquivo');
    expect(bodyAt(doc.file, 'transformar', 0.9)).toBe(null);
    expect(bodyAt(doc.file, 'transformar', 0.6)).toBe('lobisomem.bone');
    doc.time = 0.9;
    expect(doc.body).toBe(null);
    expect(doc.skeleton?.findBone('braco')).not.toBe(null);
  });
});

// ---------------------------------------------------------------------------
// O rascunho que falha avisa (A1), e a janela de recuperar (A2)
// — degrau 11, lote 7 (18/09/2026)
// ---------------------------------------------------------------------------

describe('o rascunho que não grava AVISA (A1)', () => {
  const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-drop.ts'), 'utf8');

  it('o recado diz o que deixou de valer e o que fazer', () => {
    expect(DRAFT_FAILED).toContain('não pôde ser gravado');
    expect(DRAFT_FAILED).toContain('NÃO será recuperado');
    expect(DRAFT_FAILED).toContain('Ctrl+S');
  });

  it('falhar ao gravar não é mais silêncio, e o aviso não vira ruído', () => {
    // Antes: `if (ok) shell.lastDraftAt = at;` e mais nada — a falha passava
    // calada, e quem trabalhava seguia achando que havia rede embaixo.
    expect(fonte).toContain('failedDraft(shell)');
    // Uma vez só: `draftWarned` segura o recado até voltar a gravar.
    expect(fonte).toContain('if (shell.draftWarned) return;');
    expect(fonte).toContain('shell.draftWarned = false;');
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('draftWarned = false;');
  });

  it('o serialize que estoura também avisa, e não só o armazenamento cheio', () => {
    const trecho = fonte.slice(fonte.indexOf('export function saveDraft'));
    expect(trecho.slice(0, 900)).toContain('} catch {\n    failedDraft(shell);');
  });
});

describe('a janela de recuperar o rascunho (A2)', () => {
  const main = readFileSync(resolve(__dirname, '../src/main.ts'), 'utf8');
  const dialog = readFileSync(resolve(__dirname, '../src/ui/dialog.ts'), 'utf8');

  it('os botões dizem o que fazem: nada de OK e Cancelar', () => {
    expect(main).not.toContain('globalThis.confirm(');
    expect(main).toContain('Recuperar este trabalho');
    expect(main).toContain('Agora não — guardar o rascunho');
    expect(main).toContain('Apagar o rascunho');
    // E cada um tem a frase do que acontece.
    expect(main).toContain('O arquivo no disco não é tocado até você salvar.');
    expect(main).toContain('Joga este trabalho fora. Não tem volta.');
  });

  it('CANCELAR NÃO APAGA: fechar a janela guarda o rascunho', () => {
    expect(main).toContain("cancelId: 'guardar'");
    // Só o caminho escrito apaga. Desde o P55 (29/09/2026) ele apaga o atual E
    // os guardados, com `clearAllDrafts`; e continua sendo UM lugar só.
    const apaga = main.slice(main.indexOf("if (escolha === 'apagar')"), main.indexOf("if (escolha === 'guardar')"));
    expect(apaga).toContain('clearAllDrafts(storage)');
    expect(main.match(/clearAllDrafts\(storage\)/g)?.length).toBe(1);
    expect(main).not.toMatch(/clearDraft\(storage\)/);
  });

  it('o rascunho que não abre também não é apagado sem alguém mandar', () => {
    expect(main).toContain('O rascunho não abriu');
    expect(main).toContain('Ele continua guardado');
  });

  it('a janela de escolha tem o `cancelId` escrito, que é o que impede o erro do A2', () => {
    expect(dialog).toContain('export function askChoice');
    expect(dialog).toContain('cancelId: string;');
    expect(dialog).toContain('finish(options.cancelId)');
    // Esc e clique fora vão pelo mesmo caminho inofensivo.
    expect(dialog.match(/finish\(options\.cancelId\)/g)?.length).toBe(2);
  });

  it('o roteiro prova o A2 no programa de verdade', () => {
    const roteiro = readFileSync(resolve(__dirname, '../../ferramentas/provas/roteiro-30.mjs'), 'utf8');
    expect(roteiro).toContain('A2: "Agora não" apagou o rascunho');
    expect(roteiro).toContain("localStorage.getItem(\"recorte.rascunho\")");
  });
});

// ---------------------------------------------------------------------------
// A propriedade da pilha de desfazer — defeito 1 (19/09/2026)
// ---------------------------------------------------------------------------

/*
 * **Faz A, faz B, desfaz duas vezes, e o documento tem de voltar IGUAL.**
 *
 * O defeito 1 foi achado ABRINDO O PROGRAMA, com 3.801 verdes na suíte: criar
 * osso (`B`) → `Ctrl+D` → desfazer duas vezes deixava o osso no arquivo com a
 * pilha vazia; refazer criava um gêmeo de mesmo nome e o arquivo ficava
 * inválido. Cada comando, sozinho, ida e volta, estava certo — e esta suíte já
 * provava isso, comando por comando, desde sempre.
 *
 * **A forma só aparece no PAR:** um `revert` que acha o seu pelo OBJETO
 * (`indexOf(this.def)`) quebra quando outro comando, desfeito depois dele,
 * repôs a lista com CÓPIAS. Nenhum teste de um comando só pode ver isso.
 *
 * Por que uma propriedade e não uma lista de casos: há 78 `revert(` em 28
 * arquivos. Lê-los um a um acha o que há HOJE e custa uma hora; a propriedade
 * pega as formas que a busca de texto não sabe escrever, e as que alguém
 * escrever no ano que vem. É a lição do degrau 12 — prender a propriedade, não
 * o lugar.
 */

/** Um gesto do programa, do jeito que a mão o faz: ou ele acontece, ou não. */
interface Gesto {
  nome: string;
  /** Faz o gesto. `false` = não havia o que fazer neste documento. */
  fazer(doc: Doc): boolean;
}

/** Escolhe um osso que não seja a raiz, para o gesto ter onde pegar. */
function algumOsso(doc: Doc): string | null {
  return doc.file.bones[doc.file.bones.length - 1]?.name ?? null;
}

const GESTOS: Gesto[] = [
  {
    nome: 'criar osso na cena (B)',
    fazer: (doc) => {
      const pai = doc.file.bones[0]?.name ?? null;
      const def = describeBone(
        doc.skeleton!, pai, doc.file.bones.map((b) => b.name), 0, 0, 60, 0, MIN_LENGTH_PIXELS,
      );
      doc.run(new CreateBone(def));
      return true;
    },
  },
  {
    nome: 'criar osso e pegar os desenhos',
    fazer: (doc) => {
      const slot = doc.file.slots?.[0]?.name;
      if (slot === undefined) return false;
      const pai = doc.file.bones[0]?.name ?? null;
      const def = describeBone(
        doc.skeleton!, pai, doc.file.bones.map((b) => b.name), 0, 0, 60, 0, MIN_LENGTH_PIXELS,
      );
      doc.run(new CreateBoneAndGrab(def, [slot]));
      return true;
    },
  },
  {
    nome: 'duplicar o escolhido (Ctrl+D)',
    fazer: (doc) => {
      const osso = algumOsso(doc);
      if (osso === null) return false;
      doc.select({ ...emptySelection(), bones: [osso] });
      return runDuplicate(doc);
    },
  },
  {
    nome: 'novo osso pelo menu da Árvore',
    fazer: (doc) => {
      doc.run(new TreeAddBone(doc.file, doc.file.bones[0]?.name ?? null));
      return true;
    },
  },
  {
    nome: 'trocar de pai (arrastar na Árvore)',
    fazer: (doc) => {
      const osso = algumOsso(doc);
      const pai = doc.file.bones[0]?.name;
      if (osso === null || pai === undefined || osso === pai) return false;
      doc.run(new Reparent(doc.file, { ...emptySelection(), bones: [osso] }, pai));
      return true;
    },
  },
  {
    nome: 'pendurar entidade (soltar um .bone na cena)',
    fazer: (doc) => {
      const osso = doc.file.bones[0]?.name;
      if (osso === undefined) return false;
      doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', osso, ['default'], 10, 20));
      return true;
    },
  },
  {
    nome: 'novo slot pelo menu da Árvore',
    fazer: (doc) => {
      const osso = doc.file.bones[0]?.name;
      if (osso === undefined) return false;
      doc.run(new TreeAddSlot(doc.file, osso));
      return true;
    },
  },
  {
    nome: 'novo ponto pelo menu da Árvore',
    fazer: (doc) => {
      const osso = doc.file.bones[0]?.name;
      if (osso === undefined) return false;
      doc.run(new AddPointAttachment(doc.file, osso, ['default'], 5, 6, 0));
      return true;
    },
  },
  {
    nome: 'soltar uma imagem na cena',
    fazer: (doc) => {
      const osso = doc.file.bones[0]?.name;
      if (osso === undefined) return false;
      doc.run(new DropImageAsSlot(doc.file, 'body', osso, ['default'], 3, 4));
      return true;
    },
  },
  {
    nome: 'apagar osso',
    fazer: (doc) => {
      const osso = algumOsso(doc);
      if (osso === null || osso === doc.file.bones[0]?.name) return false;
      doc.run(new RemoveBone(osso));
      return true;
    },
  },
  {
    nome: 'renomear osso',
    fazer: (doc) => {
      const osso = algumOsso(doc);
      if (osso === null) return false;
      doc.run(new RenameNode('bone', osso, `${osso}_x`));
      return true;
    },
  },
  {
    nome: 'mudar a ordem de desenho',
    fazer: (doc) => {
      const nomes = (doc.file.slots ?? []).map((s) => s.name);
      if (nomes.length < 2) return false;
      const trocada = [nomes[1]!, nomes[0]!, ...nomes.slice(2)];
      doc.run(new ReorderSlots(trocada));
      return true;
    },
  },
  {
    nome: 'duplicar pele',
    fazer: (doc) => {
      const pele = doc.file.skins?.[0]?.name;
      if (pele === undefined) return false;
      doc.run(new DuplicateSkin(doc.file, pele));
      return true;
    },
  },
];

describe('a pilha de desfazer: faz A, faz B, desfaz 2×, e o arquivo volta igual', () => {
  /*
   * O par de fora para dentro: A e B com TODAS as ordens, inclusive A com ele
   * mesmo. São 10 gestos, logo 100 pares — e cada par é um documento novo,
   * lido do herói, para que um par não contamine o seguinte.
   */
  for (const a of GESTOS) {
    for (const b of GESTOS) {
      it(`${a.nome} → ${b.nome}`, () => {
        const doc = new Doc(readHeroi());
        const antes = JSON.stringify(doc.file);

        if (!a.fazer(doc)) return; // o gesto não cabia neste documento
        if (!b.fazer(doc)) return;

        doc.undo();
        doc.undo();

        // Byte a byte: "o documento É o arquivo" só vale se um `revert`
        // malfeito não puder deixar rastro.
        expect(JSON.stringify(doc.file)).toBe(antes);
        // E a pilha tem de estar vazia: um passo que sobra é um passo que a
        // pessoa vai dar sem saber para onde ele leva.
        expect(doc.canUndo).toBe(false);
      });
    }
  }

  it('o gesto exato do defeito 1: criar osso → Ctrl+D → desfazer duas vezes', () => {
    const doc = new Doc(readHeroi());
    const antes = JSON.stringify(doc.file);
    const nomes = doc.file.bones.map((bone) => bone.name);

    const def = describeBone(
      doc.skeleton!, 'hips', nomes, 0, 0, 60, 0, MIN_LENGTH_PIXELS,
    );
    doc.run(new CreateBone(def));
    doc.select({ ...emptySelection(), bones: [def.name] });
    expect(runDuplicate(doc)).toBe(true);

    doc.undo();
    doc.undo();

    // O que o defeito deixava: o osso no arquivo, com a pilha vazia.
    expect(doc.file.bones.map((bone) => bone.name)).toEqual(nomes);
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(doc.canUndo).toBe(false);

    // E refazer os dois tem de dar UM osso novo, nunca dois de mesmo nome —
    // era o gêmeo que deixava o arquivo inválido (`duplicate bone name`).
    doc.redo();
    expect(doc.file.bones.filter((bone) => bone.name === def.name)).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// A3 — o rascunho trocado por um vazio (29/09/2026)
// ---------------------------------------------------------------------------

/**
 * Medido por Chrome sem janela, 29/09/2026, 00:20: herói mexido → recarregar →
 * "Agora não" → trocar a ferramenta → o rascunho do herói SUMIU; recarregar de
 * novo → a janela oferecia "sem nome", 749 letras. Duas formas, as duas em
 * `armUnloadGuard`:
 *
 * - *o ouvinte trata "limpo" como "acabei de salvar"*: qualquer mudança com o
 *   documento limpo (escolher, trocar de ferramenta, abrir outro) apagava;
 * - *a saída grava o rascunho mesmo limpo*: fechar a aba escrevia o documento
 *   limpo por cima do rascunho que havia.
 *
 * O J13 do chat J (salvar → recarregar → "havia trabalho não salvo… sem nome")
 * é a segunda forma.
 */
describe('o rascunho de um trabalho não é trocado por um vazio (A3)', () => {
  const heroi: Draft = { savedAt: Date.now(), name: 'heroi.bone', path: 'heroi.bone', json: '{"bone":{"version":"1.0"},"tronco":1}' };

  /** A casca, só com o que o `armUnloadGuard` usa. */
  function casca(doc: Doc, g: DraftStorage) {
    const shell = {
      doc,
      lastDraftAt: null as number | null,
      draftWarned: false,
      draftStorage: (): DraftStorage => g,
      saveDraft(now: boolean): void { saveDraft(shell as never, now); },
    };
    return shell;
  }

  /** Arma a guarda e devolve o ouvinte do `beforeunload`, que o Node não tem. */
  function armar(doc: Doc, g: DraftStorage): () => void {
    const antes = (globalThis as { addEventListener?: unknown }).addEventListener;
    let saida: ((e: unknown) => void) | null = null;
    (globalThis as { addEventListener?: unknown }).addEventListener = (tipo: string, f: (e: unknown) => void) => {
      if (tipo === 'beforeunload') saida = f;
    };
    try {
      armUnloadGuard(casca(doc, g) as never);
    } finally {
      (globalThis as { addEventListener?: unknown }).addEventListener = antes;
    }
    return () => saida?.({ preventDefault() {}, returnValue: '' });
  }

  it('escolher, com o documento limpo, NÃO apaga o rascunho de outro trabalho', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    const doc = new Doc(createEmptyFile());
    armar(doc, g);
    doc.select({ ...emptySelection(), bones: ['root'] });
    expect(readDraft(g)?.name).toBe('heroi.bone');
  });

  it('abrir outro arquivo também não apaga: só salvar apaga', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    const doc = new Doc(createEmptyFile());
    armar(doc, g);
    doc.setFile(createEmptyFile(), { path: 'outro.bone' });
    expect(readDraft(g)?.name).toBe('heroi.bone');
  });

  it('fechar a aba com o documento limpo NÃO grava o vazio por cima (J13)', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    const doc = new Doc(createEmptyFile());
    const fechar = armar(doc, g);
    fechar();
    expect(readDraft(g)?.name).toBe('heroi.bone');
    expect(readDraft(g)?.json).toContain('tronco');
  });

  it('com mudança de verdade, grava; e salvar apaga — o que já valia continua', () => {
    const g = new GuardadorFalso();
    const doc = new Doc(createEmptyFile());
    const fechar = armar(doc, g);
    doc.run(new AddBone({ name: 'osso', parent: 'root' }));
    fechar();
    expect(readDraft(g)?.json).toContain('"osso"');
    doc.markSaved('boneco.bone');
    expect(readDraft(g)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// P11 — o desfazer devolve o valor E o lugar (29/09/2026)
// ---------------------------------------------------------------------------

/**
 * Achado pelo chat E (E1): PSD substituir → Ctrl+Z, e o arquivo não voltava
 * letra por letra. A forma: *o desfazer devolvia o VALOR e não o LUGAR* — o
 * `SnapshotCommand.revert` repunha a chave apagada com `file[nome] = valor`, e
 * num objeto do JavaScript a chave reposta vai para o FIM. O boneco era o
 * mesmo; o `.bone` salvo depois, não. É a mesma cara do A4 (`shearX: 0`).
 */
describe('o desfazer devolve a chave no MESMO lugar do arquivo (P11)', () => {
  /** Um comando de brinquedo que APAGA uma chave do meio do arquivo. */
  class ApagaSlots extends SnapshotCommand {
    readonly label = 'Apagar os slots';
    protected readonly keys = ['slots'] as const;
    protected mutate(file: BoneFile): void {
      delete (file as { slots?: unknown }).slots;
    }
  }

  it('apagar uma chave do meio e desfazer devolve o arquivo letra por letra', () => {
    const doc = new Doc(parseBoneText(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    const antes = JSON.stringify(doc.file);
    const ordem = Object.keys(doc.file);
    expect(ordem.indexOf('slots')).toBeLessThan(ordem.length - 1);
    doc.run(new ApagaSlots());
    expect(Object.keys(doc.file)).not.toContain('slots');
    doc.undo();
    expect(Object.keys(doc.file)).toEqual(ordem);
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('refazer e desfazer de novo continua no mesmo lugar', () => {
    const doc = new Doc(parseBoneText(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    const antes = JSON.stringify(doc.file);
    doc.run(new ApagaSlots());
    doc.undo();
    doc.redo();
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// A2 — o herói abre com o nome do arquivo, e não do endereço (29/09/2026)
// ---------------------------------------------------------------------------

describe('o exemplo abre com o nome heroi.bone, no montado também (A2, N-12)', () => {
  const main = readFileSync(resolve(__dirname, '../src/main.ts'), 'utf8');

  it('o nome vem de uma constante com o nome do arquivo, e não do endereço', () => {
    // No programa montado o endereço vem carimbado pelo empacotador
    // (`heroi-DUlefYnW.bone`), e `opened.path` é tirado do endereço.
    expect(main).toContain("const EXAMPLE_NAME = 'heroi.bone';");
    expect(main).toContain('path: EXAMPLE_NAME');
    expect(main).not.toContain('path: opened.path');
  });
});

// ---------------------------------------------------------------------------
// P55 — o rascunho recusado não some quando o trabalho novo grava (29/09/2026)
// ---------------------------------------------------------------------------

describe('"Agora não" guarda o rascunho à parte, e a janela mostra os dois (P55, A2-1)', () => {
  const agora = Date.parse('2026-09-29T10:00:00');
  const heroi: Draft = { savedAt: agora - 60_000, name: 'heroi.bone', path: 'heroi.bone', json: '{"heroi":1}' };
  const novo: Draft = { savedAt: agora, name: 'sem nome', path: null, json: '{"novo":1}' };

  it('o caminho velho: o trabalho novo gravava por cima do recusado, calado', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    // "Agora não" deixava o rascunho onde estava, e o trabalho novo gravava ali.
    writeDraft(g, novo);
    expect(readDraft(g, agora)?.name).toBe('sem nome');
    expect(draftsToOffer(g, agora).map((d) => d.name)).toEqual(['sem nome']);
  });

  it('com "Agora não", o recusado fica guardado, e a janela oferece os dois', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    expect(keepCurrentDraft(g, agora)).toBe(true);
    // O atual CONTINUA no lugar (o roteiro confere isso desde o A2).
    expect(readDraft(g, agora)?.name).toBe('heroi.bone');
    writeDraft(g, novo);
    expect(draftsToOffer(g, agora).map((d) => d.name)).toEqual(['sem nome', 'heroi.bone']);
  });

  it('o mesmo rascunho não aparece duas vezes, nem guardado duas vezes', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    keepCurrentDraft(g, agora);
    keepCurrentDraft(g, agora);
    expect(readKeptDrafts(g, agora)).toHaveLength(1);
    expect(draftsToOffer(g, agora).map((d) => d.name)).toEqual(['heroi.bone']);
  });

  it('recuperar um guardado troca de lugar com o atual: nenhum dos dois some', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    keepCurrentDraft(g, agora);
    writeDraft(g, novo);
    expect(takeKeptDraft(g, heroi.savedAt, agora)?.name).toBe('heroi.bone');
    expect(readDraft(g, agora)?.name).toBe('heroi.bone');
    expect(readKeptDrafts(g, agora).map((d) => d.name)).toEqual(['sem nome']);
  });

  it('salvar apaga só o atual; os guardados ficam até a pessoa mandar apagar', () => {
    const g = new GuardadorFalso();
    writeDraft(g, heroi);
    keepCurrentDraft(g, agora);
    clearDraft(g);
    expect(draftsToOffer(g, agora).map((d) => d.name)).toEqual(['heroi.bone']);
    clearAllDrafts(g);
    expect(draftsToOffer(g, agora)).toEqual([]);
    expect(g.getItem(KEPT_DRAFTS_KEY)).toBeNull();
  });

  it('guardado de mais de sete dias sai sozinho, como o atual', () => {
    const g = new GuardadorFalso();
    writeDraft(g, { ...heroi, savedAt: agora - 8 * 24 * 60 * 60 * 1000 });
    g.setItem(KEPT_DRAFTS_KEY, g.getItem(DRAFT_KEY) === null ? '[]' : `[${g.getItem(DRAFT_KEY)}]`);
    expect(readKeptDrafts(g, agora)).toEqual([]);
  });

  it('a janela de recuperar usa a lista, e "Agora não" guarda a cópia', () => {
    const main = readFileSync(resolve(__dirname, '../src/main.ts'), 'utf8');
    expect(main).toContain('const rascunhos = draftsToOffer(storage);');
    expect(main).toContain("if (escolha === 'guardar') {");
    expect(main).toContain('if (!keepCurrentDraft(storage)) {');
    expect(main).toContain('clearAllDrafts(storage);');
  });
});

describe('"Reabrir o fechado" também acha o guardado (P55)', () => {
  it('com o atual vazio, a porta usa o guardado mais novo, e não diz "nada guardado"', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('const draft = atual ?? (storage === null ? null : draftsToOffer(storage)[0] ?? null);');
    expect(fonte).toContain('if (atual === null && storage !== null) takeKeptDraft(storage, draft.savedAt);');
  });
});

describe('os botões dos rascunhos nunca saem iguais (P55, visto na foto)', () => {
  const agora = Date.parse('2026-09-29T10:24:50');
  const um: Draft = { savedAt: Date.parse('2026-09-29T10:24:07'), name: 'heroi.bone', path: null, json: '{"a":1}' };
  const dois: Draft = { savedAt: Date.parse('2026-09-29T10:24:41'), name: 'heroi.bone', path: null, json: '{"b":1}' };

  it('o mesmo nome no mesmo minuto: entram os segundos, e o primeiro diz que é o mais recente', () => {
    const nomes = draftLabels([dois, um], agora);
    expect(new Set(nomes).size).toBe(2);
    expect(nomes[0]).toBe('"heroi.bone", hoje às 10:24:41 — o mais recente');
    expect(nomes[1]).toBe('"heroi.bone", hoje às 10:24:07');
  });

  it('nomes ou minutos diferentes ficam curtos, como antes', () => {
    const outro: Draft = { ...um, name: 'boneco.bone' };
    expect(draftLabels([dois, outro], agora)).toEqual([
      '"heroi.bone", hoje às 10:24 — o mais recente', '"boneco.bone", hoje às 10:24',
    ]);
  });

  it('se ainda empatar no segundo, um número separa', () => {
    const gemeo: Draft = { ...um, json: '{"c":1}' };
    const nomes = draftLabels([um, gemeo], agora);
    expect(new Set(nomes).size).toBe(2);
  });
});


// ---------------------------------------------------------------------------
// Rodada 8b, C18: a entidade com entidade dentro
// ---------------------------------------------------------------------------

describe('a entidade com entidade dentro (rodada 8b, C18)', () => {
  const textoDe = (nome: string): string => readFileSync(`${ROOT}formato/exemplos/${nome}`, 'utf8');
  const atlasHeroi = loadAtlasC18(parseBoneText(textoDe('heroi.atlas.json')));

  function projetoComEspada(): { doc: Doc; projeto: Projeto } {
    const espada = loadSkeletonData(parseBoneText(textoDe('espada.bone')), { atlases: [atlasHeroi] });
    const doc = new Doc(readHeroi(), {
      path: 'heroi.bone', atlases: [atlasHeroi], skeletons: new Map([['espada.bone', espada]]),
    });
    return { doc, projeto: new Projeto(doc) };
  }

  it('o herói aberto como entidade, sem a espada escolhida, traz a espada que o projeto já abriu', async () => {
    rememberEntityFileC18('espada.bone', textoDe('espada.bone'));
    const aberto = await readOpenedFiles([new File([textoDe('heroi.bone')], 'heroi.bone')], {
      atlases: [atlasHeroi], images: new Map(),
    });
    expect(aberto!.skeletons.has('espada.bone')).toBe(true);
    // Rodada 13: a frase passou a dizer "A entidade … não foi aberta"; o teste
    // olha as duas, para não ficar verde por não achar a frase velha.
    expect(aberto!.warnings.some((w) => w.includes('não foi aberta') || w.includes('não foi aberto'))).toBe(false);
  });

  it('o arquivo que veio sozinho procura as imagens nos atlas que o projeto já tem, e diz isso', async () => {
    const aberto = await readOpenedFiles([new File([textoDe('heroi.bone')], 'heroi.bone')], {
      atlases: [atlasHeroi], images: new Map(),
    });
    expect(aberto!.atlases).toEqual([atlasHeroi]);
    expect(aberto!.warnings).toContain('heroi.bone pede heroi.atlas.json, que não veio junto: as imagens foram '
      + 'procuradas nos atlas que o projeto já tem abertos.');
    expect(aberto!.warnings.some((w) => w.includes('as imagens ficaram de fora'))).toBe(false);
  });

  it('sem atlas nenhum no projeto, o aviso de antes continua (nada é inventado)', async () => {
    const aberto = await readOpenedFiles([new File([textoDe('heroi.bone')], 'heroi.bone')]);
    expect(aberto!.warnings.some((w) => w.includes('as imagens ficaram de fora'))).toBe(true);
  });

  it('adicionarEntidade põe na lista e avisa quem ouve: o cartão aparece na hora', () => {
    const { doc, projeto } = projetoComEspada();
    const mudancas: string[] = [];
    doc.on((c) => mudancas.push(c.kind));
    const outro = new Doc(readHeroi(), { path: 'heroi-2.bone', undo: projeto.undo });
    expect(projeto.adicionarEntidade('heroi-2.bone', outro)).toBe(true);
    expect([...projeto.entidades]).toContain('heroi-2.bone');
    expect(projeto.guardados.get('heroi-2.bone')).toBe(outro);
    expect(mudancas).toContain('structure');
    // Um uri que já é base não vira entidade.
    expect(projeto.adicionarEntidade('heroi.bone', outro)).toBe(false);
  });

  it('pendurar o herói-2 desenha o herói-2 inteiro, com a espada dele dentro', () => {
    const { doc, projeto } = projetoComEspada();
    const espada = doc.skeletons.get('espada.bone')!;
    const outro = new Doc(readHeroi(), {
      path: 'heroi-2.bone', undo: projeto.undo, atlases: [atlasHeroi], skeletons: new Map([['espada.bone', espada]]),
    });
    projeto.adicionarEntidade('heroi-2.bone', outro);
    expect(garantirAninhadoC18(doc, 'heroi-2.bone')).toBe(true);
    doc.run(new DropEntityAsSlot(doc.file, 'heroi-2.bone', 'root', ['default'], -150, 0));
    const filho = doc.skeleton!.findSlot('heroi-2')!.nestedSkeleton()!;
    const neto = filho.skeleton.findSlot('weapon')!.nestedSkeleton();
    expect(neto).not.toBeNull();
    expect(neto!.skeleton.bones.map((b) => b.data.name)).toEqual(['cabo', 'lamina']);
    // Já conhecida, não acrescenta de novo.
    expect(garantirAninhadoC18(doc, 'heroi-2.bone')).toBe(false);
  });
});

describe('QA 04/11/2026 — D4: o rascunho recuperado não está salvo', () => {
  // A prova (Chromium sem janela): mexer, recarregar, "Recuperar este
  // trabalho". O rodapé dizia "Sem mudanças por salvar." e o Abrir pasta
  // seguinte trocava o trabalho recuperado sem perguntar — o trabalho que o
  // rascunho existe para salvar se perdia de novo, calado.
  it('setFile com unsaved: o documento nasce sujo, e desfazer não o limpa', () => {
    const doc = new Doc(createEmptyFile('teste'));
    doc.setFile(createEmptyFile('recuperado'), { path: 'copia.bone', unsaved: true } as never);
    expect(doc.dirty).toBe(true);
    doc.undo();
    expect(doc.dirty).toBe(true);
    doc.markSaved('copia.bone');
    expect(doc.dirty).toBe(false);
  });

  it('sem a marca, abrir continua limpo, como sempre', () => {
    const doc = new Doc(createEmptyFile('teste'));
    doc.setFile(createEmptyFile('aberto'), { path: 'a.bone' });
    expect(doc.dirty).toBe(false);
  });

  it('o Recuperar do arranque abre o rascunho com a marca', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/main.ts'), 'utf8');
    expect(fonte).toMatch(/doc\.setFile\(file, \{ path: rascunho\.path, atlases: \[\], images: new Map\(\), unsaved: true \}\)/);
  });
});
