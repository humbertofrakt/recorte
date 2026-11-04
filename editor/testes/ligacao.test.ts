/**
 * Wiring tests: the decisions taken when the four sets of files were joined
 * into one editor that opens in a browser.
 *
 * Everything here is pure — no DOM — because the project has no jsdom.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { emptySelection, getPanels } from '../src/contract.js';
import type { Selection } from '../src/contract.js';
import { setupPointerFor, targetForPointer, valueAt } from '../src/anim/keying.js';
import { Doc } from '../src/doc/document.js';
import { readBone, readBoneNow, writeBoneValues } from '../src/viewport/tools/select.js';
import { DOCK_PANELS } from '../src/ui/shell.js';
import { SetProperty, buildProperties, setFieldCommand } from '../src/panels/properties-model.js';
import type { BoneFile } from '../../runtime/src/index.js';

const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');

function example(): BoneFile {
  return JSON.parse(readFileSync(EXAMPLE, 'utf8')) as BoneFile;
}

function selectionOf(part: Partial<Selection>): Selection {
  return { ...emptySelection(), ...part };
}

describe('o painel de propriedades e um clique na área de desenho', () => {
  it('um clique num desenho seleciona osso, slot e anexo, e mostra o osso', () => {
    // This is exactly what `selectionFor` in viewport/picking.ts produces.
    const selection = selectionOf({
      bones: ['hair'],
      slots: ['hair'],
      attachments: [{ slot: 'hair', attachment: 'hair' }],
    });
    const model = buildProperties(example(), selection);
    expect(model.subject).toBe('bone');
    expect(model.title).toBe('Osso: hair');
  });

  it('dois ossos continuam sendo "vários itens"', () => {
    const model = buildProperties(example(), selectionOf({ bones: ['hips', 'torso'] }));
    expect(model.subject).toBe('many');
  });

  it('uma linha de anexo na árvore ainda abre os campos do anexo', () => {
    const model = buildProperties(
      example(),
      selectionOf({ attachments: [{ slot: 'hair', attachment: 'hair' }] }),
    );
    expect(model.subject).toBe('attachment');
  });
});

describe('SetProperty dos painéis', () => {
  it('pede reconstrução, senão o desenho não acompanha o número', () => {
    // The command writes into `doc.file` only. A `transform` change would just
    // re-pose the skeleton from the data already loaded, which still holds the
    // old value — the drawing would not move.
    const command = new SetProperty('/bones/2/rotation', 25, 'Mudar Rotação');
    expect(command.kind).toBe('structure');
  });

  it('o mesmo vale para o comando que um campo produz', () => {
    const field = {
      key: 'rotation', label: 'Rotação', kind: 'number' as const,
      pointer: '/bones/2/rotation', fallback: 0,
    };
    expect(setFieldCommand(field, 25).kind).toBe('structure');
  });
});

// ---------------------------------------------------------------------------
// Wave 1 of phase 3B: the timeline and the curves reach the screen
// ---------------------------------------------------------------------------

describe('os painéis novos estão ligados', () => {
  it('importar panels/index.js registra os cinco painéis', async () => {
    await import('../src/panels/index.js');
    const ids = getPanels().map((panel) => panel.id);
    expect(ids).toContain('arvore');
    expect(ids).toContain('propriedades');
    expect(ids).toContain('animacoes');
    // These two were written but never imported, so they never appeared.
    expect(ids).toContain('linha-do-tempo');
    expect(ids).toContain('curvas');
  });

  it('a linha do tempo e as curvas vão para a faixa de baixo', () => {
    // The shell reads this list; the column keeps the rest. A Prévia esteve
    // aqui do lote 12 ao 24, e voltou para a coluna no 25 — anotação 5.
    expect(DOCK_PANELS).toEqual(['linha-do-tempo', 'curvas']);
  });
});

describe('targetForPointer: do ponteiro para a timeline', () => {
  it('acha a propriedade animável de um osso', () => {
    const file = example();
    const index = file.bones.findIndex((bone) => bone.name === 'torso');
    const target = targetForPointer(file, `/bones/${index}/rotation`);
    expect(target).toEqual({ type: 'bone', target: 'torso', property: 'rotation' });
  });

  it('recusa o que nenhuma animação sabe carregar', () => {
    const file = example();
    const index = file.bones.findIndex((bone) => bone.name === 'torso');
    // Name, length and parent are structure: they keep writing the file.
    expect(targetForPointer(file, `/bones/${index}/name`)).toBeNull();
    expect(targetForPointer(file, `/bones/${index}/length`)).toBeNull();
    expect(targetForPointer(file, `/bones/${index}/parent`)).toBeNull();
    expect(targetForPointer(file, '')).toBeNull();
    expect(targetForPointer(file, '/bones/999/rotation')).toBeNull();
  });

  it('acha slot e regra', () => {
    const file = example();
    const slot = (file.slots ?? []).findIndex((s) => s.name === 'hair');
    expect(targetForPointer(file, `/slots/${slot}/color`))
      .toEqual({ type: 'slot', target: 'hair', property: 'color' });
    expect(targetForPointer(file, `/slots/${slot}/bone`)).toBeNull();

    const rule = (file.constraints ?? []).findIndex((c) => c.name === 'ik_arm');
    expect(targetForPointer(file, `/constraints/${rule}/mix`))
      .toEqual({ type: 'constraint', target: 'ik_arm', property: 'mix' });
    expect(targetForPointer(file, `/constraints/${rule}/name`)).toBeNull();
  });

  it('é o inverso de setupPointerFor', () => {
    const file = example();
    const target = { type: 'bone', target: 'torso', property: 'rotation' };
    const pointer = setupPointerFor(file, target);
    expect(pointer).not.toBeNull();
    expect(targetForPointer(file, pointer as string)).toEqual(target);
  });
});

describe('as ferramentas do viewport respeitam o modo de pose', () => {
  function docWithWalk(): Doc {
    const doc = new Doc(example());
    doc.animation = 'walk';
    doc.time = 0.5;
    return doc;
  }

  it('em montagem escreve a pose de repouso, como antes', () => {
    const doc = new Doc(example());
    const outcome = writeBoneValues(doc, 'Girar osso', 'teste:1', [
      { bone: 'torso', key: 'rotation', value: 42 },
    ]);
    expect(outcome).toBe('montagem');
    expect(readBone(doc, 'torso', 'rotation')).toBe(42);
  });

  it('com animação aberta cria chave e NÃO mexe na pose de repouso', () => {
    const doc = docWithWalk();
    const before = JSON.stringify(doc.file.bones);
    const outcome = writeBoneValues(doc, 'Girar osso', 'teste:2', [
      { bone: 'torso', key: 'rotation', value: 42 },
    ]);
    expect(outcome).toBe('chave');
    // This is the whole point of the wave.
    expect(JSON.stringify(doc.file.bones)).toBe(before);
    expect(valueAt(doc.file, 'walk', 0.5, { type: 'bone', target: 'torso', property: 'rotation' }))
      .toBe(42);
  });

  it('um arrasto inteiro continua sendo um passo de desfazer', () => {
    const doc = docWithWalk();
    const before = JSON.stringify(doc.file);
    for (const value of [10, 20, 30]) {
      writeBoneValues(doc, 'Girar osso', 'teste:3', [
        { bone: 'torso', key: 'rotation', value },
      ]);
    }
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(before);
    expect(doc.canUndo).toBe(false);
  });

  it('dois arrastos são dois passos', () => {
    const doc = docWithWalk();
    writeBoneValues(doc, 'Girar osso', 'teste:4', [{ bone: 'torso', key: 'rotation', value: 10 }]);
    writeBoneValues(doc, 'Girar osso', 'teste:5', [{ bone: 'torso', key: 'rotation', value: 20 }]);
    doc.undo();
    const target = { type: 'bone', target: 'torso', property: 'rotation' };
    expect(valueAt(doc.file, 'walk', 0.5, target)).toBe(10);
  });

  it('não há gravação a desligar: o arrasto sempre grava a chave, e a pose de repouso fica (M6)', () => {
    const doc = docWithWalk();
    const repouso = JSON.stringify(doc.file.bones);
    const outcome = writeBoneValues(doc, 'Girar osso', 'teste:6', [
      { bone: 'torso', key: 'rotation', value: 42 },
    ]);
    expect(outcome).toBe('chave');
    const target = { type: 'bone', target: 'torso', property: 'rotation' };
    expect(valueAt(doc.file, 'walk', 0.5, target)).toBe(42);
    expect(JSON.stringify(doc.file.bones)).toBe(repouso);
  });

  it('o arrasto parte do valor que a animação mostra, não do de repouso', () => {
    const doc = docWithWalk();
    const target = { type: 'bone', target: 'torso', property: 'rotation' };
    const animated = valueAt(doc.file, 'walk', 0.5, target);
    expect(readBoneNow(doc, 'torso', 'rotation')).toBe(animated);
    // In assembly mode it is the setup value again.
    doc.animation = null;
    expect(readBoneNow(doc, 'torso', 'rotation')).toBe(readBone(doc, 'torso', 'rotation'));
  });
});
