/**
 * Animation keys, timelines and pose mode (owner A).
 *
 * Two contracts are pinned here, and both are about the file:
 *
 *   1. What a key looks like on disk. Several tests compare the whole JSON of a
 *      timeline against the literal of spec 9, because "the document is the
 *      file" is only true while the editor writes exactly what the format says.
 *
 *   2. The rule of pose mode. With an animation open, changing a value must not
 *      move `file.bones[i].rotation` by a hair. That is the last test of the
 *      file, and it is the reason the module exists.
 *
 * No DOM: this suite covers `anim/`, not the dopesheet.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { breakdownNotice, breakdownValues } from '../src/anim/breakdown.js';

import type { BoneFile, KeyDef, TimelineDef } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { getAtPointer } from '../src/doc/commands.js';
import { emptySelection } from '../src/contract.js';
import { selectChildren } from '../src/doc/duplicate.js';
import {
  allKeyTimes, bodyShortName, bodyTarget, boneTarget, cloneKeys, constraintTarget, copyKeys,
  dopesheetGroups, durationOf, eventTarget, findTimeline, groupOf, hasSteppedCells, isKeyed,
  keyRefsForTargets, keyTimes, lastKeyTime, moveKeys, nestedTarget, nextKeyTime, normalizeTarget,
  pasteKeys, previousKeyTime, removeKey, scaleKeys, setKey, setupValueFor, slotTarget,
  steppedCells, targetInfo, targetKey, timelinePointerFor, valueAt, weightsTarget,
} from '../src/anim/keying.js';
import {
  RemoveKey, SetKey, keyTargetsNow, setPropertyOrKey,
  targetsForSelection, unkeyTargetsNow,
} from '../src/anim/pose-mode.js';
import * as poseMode from '../src/anim/pose-mode.js';
import { formatSeconds, fpsOf, frameStepFor, snapToFrame, spanOf } from '../src/panels/dopesheet.js';
import { runReparent } from '../src/doc/reparent.js';
// P12 (chat D, lote 2a): mostrar a chave que acabou de nascer.
import { keyCreatedNotice, newKeysNotice, onRevealKey, revealKey } from '../src/anim/keying.js';

// ---------------------------------------------------------------------------
// Fixture
// ---------------------------------------------------------------------------

/**
 * A skeleton with one empty animation. Empty on purpose: most tests here are
 * about what the FIRST key writes into the file, and an animation that already
 * had timelines would hide that.
 */
function sampleFile(): BoneFile {
  const box = { type: 'boundingbox' as const, vertices: [0, 0, 10, 0, 10, 10, 0, 10] };
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'teste', fps: 30 },
    bones: [
      { name: 'root' },
      { name: 'braco', parent: 'root', rotation: 20, length: 50 },
      { name: 'alvo', parent: 'root', x: 40 },
    ],
    slots: [
      { name: 'corpo', bone: 'braco', attachment: 'tronco' },
    ],
    constraints: [
      { type: 'ik', name: 'braco-ik', bones: ['braco'], target: 'alvo' },
    ],
    skins: [
      { name: 'default', attachments: { corpo: { tronco: { ...box } } } },
    ],
    events: [
      { name: 'passo' },
    ],
    animations: [
      { name: 'andar' },
    ],
  };
}

function sampleDoc(): Doc {
  return new Doc(sampleFile());
}

/** The timeline of a target, as plain JSON, for a literal comparison. */
function timelineJson(file: BoneFile, animation: string, target: Parameters<typeof findTimeline>[2]): unknown {
  const timeline = findTimeline(file, animation, target);
  return timeline === null ? null : JSON.parse(JSON.stringify(timeline));
}

const ROT = boneTarget('braco', 'rotation');
const POS_X = boneTarget('braco', 'x');

// ---------------------------------------------------------------------------

describe('endereço de uma timeline', () => {
  it('a tupla de 9.1 é a chave, e deform ganha a skin padrão', () => {
    expect(targetKey(ROT)).toBe('bone|braco|rotation||');
    expect(targetKey({ type: 'deform', target: 'corpo', attachment: 'tronco' }))
      .toBe('deform|corpo||default|tronco');
    expect(targetKey({ type: 'drawOrder' })).toBe('drawOrder||||');
  });

  it('diz quantos componentes a curva tem, por propriedade', () => {
    expect(targetInfo(ROT).components).toBe(1);
    expect(targetInfo(slotTarget('corpo', 'color')).components).toBe(4);
    expect(targetInfo(slotTarget('corpo', 'darkColor')).components).toBe(3);
    expect(targetInfo(slotTarget('corpo', 'attachment')).interpolable).toBe(false);
    expect(targetInfo(eventTarget()).valueless).toBe(true);
  });

  it('devolve o ponteiro da timeline e cria o caminho quando pedido', () => {
    const file = sampleFile();
    expect(timelinePointerFor(file, 'andar', ROT)).toBeNull();
    expect(timelinePointerFor(file, 'andar', ROT, true)).toBe('/animations/0/timelines/0');
    // Pedir de novo não cria uma segunda.
    expect(timelinePointerFor(file, 'andar', ROT, true)).toBe('/animations/0/timelines/0');
    expect(file.animations?.[0].timelines).toHaveLength(1);
  });

  it('não acha timeline em animação que não existe', () => {
    const file = sampleFile();
    expect(timelinePointerFor(file, 'correr', ROT, true)).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe('criar chave', () => {
  it('em animação vazia gera a timeline no formato exato da spec', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 45);

    expect(timelineJson(file, 'andar', ROT)).toEqual({
      type: 'bone',
      target: 'braco',
      property: 'rotation',
      keys: [{ time: 0, value: 45 }],
    });
    // A chave nova não grava `curve`: ausente já quer dizer "linear" (9.3).
    const keys = (file.animations?.[0].timelines?.[0] as TimelineDef).keys;
    expect(Object.keys(keys[0])).toEqual(['time', 'value']);
  });

  it('a animação que não tinha timelines ganha o campo, e só ele', () => {
    const file = sampleFile();
    expect(file.animations?.[0].timelines).toBeUndefined();
    setKey(file, 'andar', 0, ROT, 45);
    expect(Object.keys(file.animations?.[0] ?? {})).toEqual(['name', 'timelines']);
  });

  it('chavear duas vezes no mesmo tempo atualiza em vez de duplicar', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0.5, ROT, 45);
    setKey(file, 'andar', 0.5, ROT, 90);

    expect(keyTimes(file, 'andar', ROT)).toEqual([0.5]);
    expect(timelineJson(file, 'andar', ROT)).toEqual({
      type: 'bone',
      target: 'braco',
      property: 'rotation',
      keys: [{ time: 0.5, value: 90 }],
    });
  });

  it('atualizar uma chave preserva a curva que o usuário desenhou', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0, { curve: [0.1, 0, 0.3, 45] });
    setKey(file, 'andar', 0, ROT, 10);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0]);
    const key = (findTimeline(file, 'andar', ROT) as TimelineDef).keys[0];
    expect(key.value).toBe(10);
    expect(key.curve).toEqual([0.1, 0, 0.3, 45]);
    // Só quando o chamador pede é que a curva some.
    setKey(file, 'andar', 0, ROT, 20, { keepCurve: false });
    expect((findTimeline(file, 'andar', ROT) as TimelineDef).keys[0].curve).toBeUndefined();
  });

  it('mantém as chaves em ordem, seja qual for a ordem em que foram criadas', () => {
    const file = sampleFile();
    setKey(file, 'andar', 1, ROT, 30);
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 0.5, ROT, 90);
    setKey(file, 'andar', 0.25, ROT, 45);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 0.25, 0.5, 1]);
  });

  it('tempo negativo é preso em zero (9.2 pede time >= 0)', () => {
    const file = sampleFile();
    setKey(file, 'andar', -3, ROT, 10);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0]);
  });

  it('a duração escrita cresce para a chave nunca cair fora dela', () => {
    const file = sampleFile();
    (file.animations ?? [])[0].duration = 1;
    setKey(file, 'andar', 2.5, ROT, 10);
    expect(file.animations?.[0].duration).toBe(2.5);
    // Uma chave antes do fim não encolhe a duração: ela é da animação (9.11).
    setKey(file, 'andar', 0, ROT, 0);
    expect(file.animations?.[0].duration).toBe(2.5);
  });

  it('sem duração escrita, a duração é a maior chave (9.11)', () => {
    const file = sampleFile();
    const animation = (file.animations ?? [])[0];
    expect(durationOf(animation)).toBe(0);
    setKey(file, 'andar', 0.75, ROT, 10);
    expect(lastKeyTime(animation)).toBe(0.75);
    expect(durationOf(animation)).toBe(0.75);
  });

  it('uma cor grava as quatro componentes', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, slotTarget('corpo', 'color'), [1, 0.5, 0, 1]);
    expect(timelineJson(file, 'andar', slotTarget('corpo', 'color'))).toEqual({
      type: 'slot',
      target: 'corpo',
      property: 'color',
      keys: [{ time: 0, value: [1, 0.5, 0, 1] }],
    });
  });

  it('event grava chave sem value, e duas no mesmo tempo são legais (9.7)', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0.2, eventTarget(), undefined, { event: 'passo' });
    setKey(file, 'andar', 0.2, eventTarget(), undefined, { event: 'som', volume: 0.5 });
    expect(timelineJson(file, 'andar', eventTarget())).toEqual({
      type: 'event',
      keys: [
        { time: 0.2, event: 'passo' },
        { time: 0.2, event: 'som', volume: 0.5 },
      ],
    });
  });

  it('deform grava o offset só quando ele é maior que zero', () => {
    const file = sampleFile();
    const alvo = { type: 'deform', target: 'corpo', attachment: 'tronco' } as const;
    setKey(file, 'andar', 0, alvo, [1, 2], { offset: 4 });
    expect(timelineJson(file, 'andar', alvo)).toEqual({
      type: 'deform',
      target: 'corpo',
      attachment: 'tronco',
      keys: [{ time: 0, value: [1, 2], offset: 4 }],
    });
  });

  it('isKeyed responde pelo tempo exato', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0.5, ROT, 45);
    expect(isKeyed(file, 'andar', 0.5, ROT)).toBe(true);
    expect(isKeyed(file, 'andar', 0.25, ROT)).toBe(false);
    expect(isKeyed(file, 'andar', 0.5, POS_X)).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe('apagar chave', () => {
  it('some com a timeline vazia e com o campo timelines', () => {
    const file = sampleFile();
    const before = JSON.stringify(file);
    setKey(file, 'andar', 0, ROT, 45);
    expect(removeKey(file, 'andar', 0, ROT)).toBe(true);
    expect(JSON.stringify(file)).toBe(before);
  });

  it('deixa as outras chaves em paz', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 1, ROT, 90);
    expect(removeKey(file, 'andar', 0, ROT)).toBe(true);
    expect(keyTimes(file, 'andar', ROT)).toEqual([1]);
  });

  it('responde false quando não havia chave ali', () => {
    const file = sampleFile();
    expect(removeKey(file, 'andar', 0, ROT)).toBe(false);
    setKey(file, 'andar', 0, ROT, 0);
    expect(removeKey(file, 'andar', 0.5, ROT)).toBe(false);
  });
});

// ---------------------------------------------------------------------------

describe('valor no tempo', () => {
  it('entre duas chaves lineares bate com a conta à mão', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 1, ROT, 100);
    // reta: v = v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    expect(valueAt(file, 'andar', 0.25, ROT)).toBeCloseTo(25, 10);
    expect(valueAt(file, 'andar', 0.5, ROT)).toBeCloseTo(50, 10);
  });

  it('a curva Bézier bate com a conta à mão da spec 9.3', () => {
    const file = sampleFile();
    // Controles simétricos com cx no meio: em t = 0.5 o parâmetro s vale 0.5.
    setKey(file, 'andar', 0, ROT, 0, { curve: [0.5, 0, 0.5, 100] });
    setKey(file, 'andar', 1, ROT, 100);
    // x(s) = 3(1-s)^2 s (0.5) + 3(1-s) s^2 (0.5) + s^3, que em s = 0.5 dá 0.5.
    // y(0.5) = 3 (0.5)^2 (0.5) (0) + 3 (0.5) (0.5)^2 (100) + (0.5)^3 (100)
    //        = 37.5 + 12.5 = 50
    expect(valueAt(file, 'andar', 0.5, ROT)).toBeCloseTo(50, 6);
    // Um ponto fora do meio, ainda pela conta exata do polinômio.
    const s = 0.25;
    const u = 1 - s;
    const t = 3 * u * u * s * 0.5 + 3 * u * s * s * 0.5 + s * s * s;
    const y = 3 * u * s * s * 100 + s * s * s * 100;
    expect(valueAt(file, 'andar', t, ROT)).toBeCloseTo(y, 6);
  });

  it('stepped segura o valor da chave até a próxima', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0, { curve: 'stepped' });
    setKey(file, 'andar', 1, ROT, 100);
    expect(valueAt(file, 'andar', 0.9, ROT)).toBe(0);
    expect(valueAt(file, 'andar', 1, ROT)).toBe(100);
  });

  it('antes da primeira chave vale a primeira chave, não a pose de repouso', () => {
    const file = sampleFile();
    // A pose de repouso do braço é 20 graus; a animação começa em 90.
    setKey(file, 'andar', 0.5, ROT, 90);
    setKey(file, 'andar', 1, ROT, 120);
    expect(valueAt(file, 'andar', 0, ROT)).toBe(90);
    expect(valueAt(file, 'andar', 5, ROT)).toBe(120);
  });

  it('rotação não faz a volta: 350 para 10 desce por -340', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 350);
    setKey(file, 'andar', 1, ROT, 10);
    expect(valueAt(file, 'andar', 0.5, ROT)).toBeCloseTo(180, 10);
  });

  it('a cor interpola componente a componente', () => {
    const file = sampleFile();
    const alvo = slotTarget('corpo', 'color');
    setKey(file, 'andar', 0, alvo, [0, 0, 0, 1]);
    setKey(file, 'andar', 1, alvo, [1, 0.5, 0, 0]);
    const meio = valueAt(file, 'andar', 0.5, alvo) as number[];
    expect(meio[0]).toBeCloseTo(0.5, 10);
    expect(meio[1]).toBeCloseTo(0.25, 10);
    expect(meio[2]).toBeCloseTo(0, 10);
    expect(meio[3]).toBeCloseTo(0.5, 10);
  });

  it('valor não interpolável é sempre degrau', () => {
    const file = sampleFile();
    const alvo = slotTarget('corpo', 'attachment');
    setKey(file, 'andar', 0, alvo, 'tronco');
    setKey(file, 'andar', 1, alvo, null);
    expect(valueAt(file, 'andar', 0.9, alvo)).toBe('tronco');
  });

  it('sem timeline não há valor: a pose de repouso responde', () => {
    const file = sampleFile();
    expect(valueAt(file, 'andar', 0, ROT)).toBeUndefined();
    expect(setupValueFor(file, ROT)).toBe(20);
    // Uma propriedade que o arquivo não escreveu cai no padrão da spec.
    expect(setupValueFor(file, POS_X)).toBe(0);
    expect(setupValueFor(file, boneTarget('braco', 'scaleX'))).toBe(1);
    expect(setupValueFor(file, constraintTarget('braco-ik', 'mix'))).toBe(1);
    expect(setupValueFor(file, slotTarget('corpo', 'color'))).toEqual([1, 1, 1, 1]);
  });
});

// ---------------------------------------------------------------------------

describe('mover e escalar chaves', () => {
  function keyed(): BoneFile {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 0.5, ROT, 45);
    setKey(file, 'andar', 1, ROT, 90);
    return file;
  }

  it('mover desloca no tempo e mantém a ordem', () => {
    const file = keyed();
    moveKeys(file, 'andar', [{ target: ROT, time: 0.5 }], 0.75);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 1, 1.25]);
    expect(valueAt(file, 'andar', 1.25, ROT)).toBe(45);
  });

  it('mover para cima de outra chave substitui a que estava lá', () => {
    const file = keyed();
    moveKeys(file, 'andar', [{ target: ROT, time: 0 }], 0.5);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0.5, 1]);
    expect(valueAt(file, 'andar', 0.5, ROT)).toBe(0);
  });

  it('mover para trás de zero prende em zero', () => {
    const file = keyed();
    moveKeys(file, 'andar', [{ target: ROT, time: 1 }], -5);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 0.5]);
    expect(valueAt(file, 'andar', 0, ROT)).toBe(90);
  });

  it('mover várias de uma vez preserva o espaçamento', () => {
    const file = keyed();
    const refs = [
      { target: ROT, time: 0 },
      { target: ROT, time: 0.5 },
      { target: ROT, time: 1 },
    ];
    const moved = moveKeys(file, 'andar', refs, 0.25);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0.25, 0.75, 1.25]);
    expect(moved.map((ref) => ref.time)).toEqual([0.25, 0.75, 1.25]);
  });

  it('escalar estica em volta do pivô', () => {
    const file = keyed();
    scaleKeys(file, 'andar', [
      { target: ROT, time: 0 },
      { target: ROT, time: 0.5 },
      { target: ROT, time: 1 },
    ], 0, 2);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 1, 2]);
    expect(valueAt(file, 'andar', 1, ROT)).toBe(45);
  });

  it('escalar com pivô no meio empurra os dois lados', () => {
    const file = keyed();
    scaleKeys(file, 'andar', [
      { target: ROT, time: 0 },
      { target: ROT, time: 1 },
    ], 0.5, 0.5);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0.25, 0.5, 0.75]);
  });

  it('mover cresce a duração escrita', () => {
    const file = keyed();
    (file.animations ?? [])[0].duration = 1;
    moveKeys(file, 'andar', [{ target: ROT, time: 1 }], 1);
    expect(file.animations?.[0].duration).toBe(2);
  });
});

// ---------------------------------------------------------------------------

describe('copiar e colar chaves', () => {
  it('cola o bloco inteiro com a forma preservada', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0, { curve: 'stepped' });
    setKey(file, 'andar', 0.5, ROT, 45);

    const clip = copyKeys(file, 'andar', [
      { target: ROT, time: 0 },
      { target: ROT, time: 0.5 },
    ]);
    expect(clip.base).toBe(0);
    expect(clip.items.map((item) => item.offset)).toEqual([0, 0.5]);

    pasteKeys(file, 'andar', clip, 2);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 0.5, 2, 2.5]);
    const colada = (findTimeline(file, 'andar', ROT) as TimelineDef).keys[2];
    expect(colada).toEqual({ time: 2, value: 0, curve: 'stepped' });
  });

  it('a área de transferência guarda cópias, não referências', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 10);
    const clip = copyKeys(file, 'andar', [{ target: ROT, time: 0 }]);
    setKey(file, 'andar', 0, ROT, 999);
    pasteKeys(file, 'andar', clip, 1);
    expect(valueAt(file, 'andar', 1, ROT)).toBe(10);
  });

  it('colar por cima de uma chave existente a substitui', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 10);
    setKey(file, 'andar', 1, ROT, 90);
    const clip = copyKeys(file, 'andar', [{ target: ROT, time: 0 }]);
    pasteKeys(file, 'andar', clip, 1);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 1]);
    expect(valueAt(file, 'andar', 1, ROT)).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Item 11 — Copiar valendo a seleção da cena
// ---------------------------------------------------------------------------

describe('as chaves de um alvo escolhido na cena (item 11)', () => {
  it('junta as chaves de todas as linhas dos alvos, em qualquer tempo', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 0.5, ROT, 45);
    setKey(file, 'andar', 0, POS_X, 10);

    const refs = keyRefsForTargets(file, 'andar', [ROT, POS_X]);
    expect(refs).toEqual([
      { target: ROT, time: 0 },
      { target: ROT, time: 0.5 },
      { target: POS_X, time: 0 },
    ]);
  });

  it('um alvo sem linha na animação não aparece, e não é erro', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    const semLinha = boneTarget('alvo', 'rotation');
    expect(keyRefsForTargets(file, 'andar', [ROT, semLinha])).toEqual([{ target: ROT, time: 0 }]);
  });

  it('sem alvo nenhum, devolve lista vazia', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    expect(keyRefsForTargets(file, 'andar', [])).toEqual([]);
  });

  it('copiar e colar o resultado funciona como copiar chave por chave', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 20, { curve: 'stepped' });
    setKey(file, 'andar', 1, ROT, 90);

    const refs = keyRefsForTargets(file, 'andar', [ROT]);
    const clip = copyKeys(file, 'andar', refs);
    pasteKeys(file, 'andar', clip, 2);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 1, 2, 3]);
    expect(valueAt(file, 'andar', 2, ROT)).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Item 1 — Copiar o membro inteiro
// ---------------------------------------------------------------------------

describe('copiar o membro inteiro (item 1)', () => {
  /** braço -> antebraço -> mão, uma corrente de três, para "o galho inteiro". */
  function memberFile(): BoneFile {
    const file = sampleFile();
    file.bones.push(
      { name: 'antebraco', parent: 'braco', rotation: 0, length: 30 },
      { name: 'mao', parent: 'antebraco', rotation: 0 },
    );
    return file;
  }

  it('escolher o ombro leva as chaves dele E as dos filhos', () => {
    const file = memberFile();
    const antebracoRot = boneTarget('antebraco', 'rotation');
    const maoRot = boneTarget('mao', 'rotation');
    setKey(file, 'andar', 0, ROT, 10);
    setKey(file, 'andar', 0, antebracoRot, 20);
    setKey(file, 'andar', 0.5, maoRot, 5);

    const membro = selectChildren(file, { ...emptySelection(), bones: ['braco'] });
    const refs = keyRefsForTargets(file, 'andar', targetsForSelection(membro));

    expect(refs).toContainEqual({ target: ROT, time: 0 });
    expect(refs).toContainEqual({ target: antebracoRot, time: 0 });
    expect(refs).toContainEqual({ target: maoRot, time: 0.5 });
  });

  it('escolher só a mão não traz o ombro nem o antebraço junto', () => {
    const file = memberFile();
    const maoRot = boneTarget('mao', 'rotation');
    setKey(file, 'andar', 0, ROT, 10);
    setKey(file, 'andar', 0, maoRot, 5);

    const membro = selectChildren(file, { ...emptySelection(), bones: ['mao'] });
    const refs = keyRefsForTargets(file, 'andar', targetsForSelection(membro));
    expect(refs).toEqual([{ target: maoRot, time: 0 }]);
  });

  it('copiar e colar o membro leva o que cada filho tinha, para outro tempo', () => {
    const file = memberFile();
    const antebracoRot = boneTarget('antebraco', 'rotation');
    setKey(file, 'andar', 0, ROT, 10);
    setKey(file, 'andar', 0, antebracoRot, 20);

    const membro = selectChildren(file, { ...emptySelection(), bones: ['braco'] });
    const refs = keyRefsForTargets(file, 'andar', targetsForSelection(membro));
    const clip = copyKeys(file, 'andar', refs);
    pasteKeys(file, 'andar', clip, 1);

    expect(valueAt(file, 'andar', 1, ROT)).toBe(10);
    expect(valueAt(file, 'andar', 1, antebracoRot)).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// Item 6 — Ctrl ao arrastar clona a chave
// ---------------------------------------------------------------------------

describe('clonar chaves (item 6)', () => {
  function keyed(): BoneFile {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 0.5, ROT, 45, { curve: 'stepped' });
    return file;
  }

  it('a chave nasce no tempo novo, e a original não se move', () => {
    const file = keyed();
    const clonadas = cloneKeys(file, 'andar', [{ target: ROT, time: 0.5 }], 0.25);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 0.5, 0.75]);
    expect(clonadas).toEqual([{ target: ROT, time: 0.75 }]);
    expect(valueAt(file, 'andar', 0.75, ROT)).toBe(45);
    // A original continua com a curva que tinha.
    const original = (findTimeline(file, 'andar', ROT) as TimelineDef).keys[1];
    expect(original).toEqual({ time: 0.5, value: 45, curve: 'stepped' });
  });

  it('clonar várias mantém o espaçamento entre elas, deslocado por `delta`', () => {
    const file = keyed();
    const refs = [{ target: ROT, time: 0 }, { target: ROT, time: 0.5 }];
    cloneKeys(file, 'andar', refs, 1);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 0.5, 1, 1.5]);
  });

  it('clonar em cima de uma chave existente a substitui, como o Colar', () => {
    const file = keyed();
    cloneKeys(file, 'andar', [{ target: ROT, time: 0 }], 0.5);
    expect(keyTimes(file, 'andar', ROT)).toEqual([0, 0.5]);
    expect(valueAt(file, 'andar', 0.5, ROT)).toBe(0);
  });

  it('delta negativo clona para trás, preso em zero', () => {
    const file = keyed();
    const clonadas = cloneKeys(file, 'andar', [{ target: ROT, time: 0.5 }], -1);
    expect(clonadas).toEqual([{ target: ROT, time: 0 }]);
  });
});

// ---------------------------------------------------------------------------

describe('linhas da linha do tempo', () => {
  it('agrupa por osso, slot e regra, com o nome escrito', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 0.5, POS_X, 10);
    setKey(file, 'andar', 0, slotTarget('corpo', 'color'), [1, 1, 1, 1]);
    setKey(file, 'andar', 0, constraintTarget('braco-ik', 'mix'), 1);
    setKey(file, 'andar', 0.3, eventTarget(), undefined, { event: 'passo' });

    const grupos = dopesheetGroups(file, 'andar');
    expect(grupos.map((grupo) => grupo.label)).toEqual([
      'Osso braco', 'Slot corpo', 'Regra braco-ik', 'Geral',
    ]);
    expect(grupos[0].rows.map((linha) => linha.label)).toEqual(['Rotação', 'Posição X']);
    expect(grupos[0].rows[0].times).toEqual([0]);
    expect(grupos[3].rows[0].label).toBe('Eventos');
  });

  it('navega para a chave anterior e para a próxima', () => {
    const file = sampleFile();
    setKey(file, 'andar', 0, ROT, 0);
    setKey(file, 'andar', 0.5, POS_X, 10);
    setKey(file, 'andar', 1, ROT, 90);

    const tempos = allKeyTimes(file, 'andar');
    expect(tempos).toEqual([0, 0.5, 1]);
    expect(nextKeyTime(tempos, 0)).toBe(0.5);
    expect(nextKeyTime(tempos, 1)).toBeNull();
    expect(previousKeyTime(tempos, 0.5)).toBe(0);
    expect(previousKeyTime(tempos, 0)).toBeNull();
  });
});

// ---------------------------------------------------------------------------

describe('desfazer volta o JSON exatamente ao anterior', () => {
  /** Runs a command, undoes it, and fails unless the JSON came back untouched. */
  function roundTrip(doc: Doc, make: () => SetKey | RemoveKey): void {
    const before = JSON.stringify(doc.file);
    doc.run(make());
    const after = JSON.stringify(doc.file);
    expect(after, 'o comando não mudou nada').not.toBe(before);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(before);
    doc.redo();
    expect(JSON.stringify(doc.file)).toBe(after);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(before);
  }

  it('a primeira chave da animação', () => {
    const doc = sampleDoc();
    roundTrip(doc, () => new SetKey('andar', 0, ROT, 45));
  });

  it('uma chave a mais numa timeline que já existia', () => {
    const doc = sampleDoc();
    doc.run(new SetKey('andar', 0, ROT, 0));
    roundTrip(doc, () => new SetKey('andar', 1, ROT, 90));
  });

  it('atualizar uma chave que já estava lá', () => {
    const doc = sampleDoc();
    doc.run(new SetKey('andar', 0, ROT, 0));
    // Fecha o arrasto: sem isso as duas chavagens no mesmo tempo viram um passo
    // só, que é justamente o que o teste seguinte cobre.
    doc.endMerge();
    roundTrip(doc, () => new SetKey('andar', 0, ROT, 90));
  });

  it('apagar a única chave, timeline e tudo', () => {
    const doc = sampleDoc();
    doc.run(new SetKey('andar', 0, ROT, 45));
    roundTrip(doc, () => new RemoveKey('andar', 0, ROT));
  });

  it('um arrasto inteiro vira um passo só', () => {
    const doc = sampleDoc();
    const before = JSON.stringify(doc.file);
    doc.run(new SetKey('andar', 0, ROT, 10));
    doc.run(new SetKey('andar', 0, ROT, 20));
    doc.run(new SetKey('andar', 0, ROT, 30));
    expect(valueAt(doc.file, 'andar', 0, ROT)).toBe(30);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(before);
    expect(doc.canUndo).toBe(false);
  });

  it('duas chaves em tempos diferentes são dois passos', () => {
    const doc = sampleDoc();
    doc.run(new SetKey('andar', 0, ROT, 10));
    doc.run(new SetKey('andar', 1, ROT, 20));
    doc.undo();
    expect(keyTimes(doc.file, 'andar', ROT)).toEqual([0]);
  });
});

// ---------------------------------------------------------------------------
// The point of the whole module
// ---------------------------------------------------------------------------

describe('modo de pose', () => {
  it('sem animação aberta, mudar a rotação escreve a pose de repouso', () => {
    const doc = sampleDoc();
    doc.animation = null;
    expect(setPropertyOrKey(doc, ROT, 90)).toBe('montagem');
    expect(getAtPointer(doc.file, '/bones/1/rotation')).toBe(90);
    expect(doc.file.animations?.[0].timelines).toBeUndefined();
  });

  it('COM animação aberta, mudar a rotação NÃO altera a pose e CRIA a chave', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    doc.time = 0.5;

    const poseAntes = JSON.stringify(doc.file.bones);
    expect(setPropertyOrKey(doc, ROT, 90)).toBe('chave');

    // 1. A pose de repouso ficou intocada, byte a byte.
    expect(JSON.stringify(doc.file.bones)).toBe(poseAntes);
    expect(doc.file.bones[1].rotation).toBe(20);

    // 2. A chave certa nasceu, no tempo certo, no formato da spec. Lote 68:
    // a primeira chave depois de 0 leva junto a do começo, com o valor de
    // montagem (20), como o Spriter — o começo da animação se guarda sozinho.
    expect(timelineJson(doc.file, 'andar', ROT)).toEqual({
      type: 'bone',
      target: 'braco',
      property: 'rotation',
      keys: [{ time: 0, value: 20 }, { time: 0.5, value: 90 }],
    });
    expect(valueAt(doc.file, 'andar', 0, ROT)).toBe(20);
    expect(valueAt(doc.file, 'andar', 0.5, ROT)).toBe(90);
  });

  it('o mesmo vale para slot e para regra', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    const antes = JSON.stringify({ slots: doc.file.slots, constraints: doc.file.constraints });

    setPropertyOrKey(doc, slotTarget('corpo', 'color'), [1, 0, 0, 1]);
    setPropertyOrKey(doc, constraintTarget('braco-ik', 'mix'), 0.25);

    expect(JSON.stringify({ slots: doc.file.slots, constraints: doc.file.constraints })).toBe(antes);
    expect(valueAt(doc.file, 'andar', 0, slotTarget('corpo', 'color'))).toEqual([1, 0, 0, 1]);
    expect(valueAt(doc.file, 'andar', 0, constraintTarget('braco-ik', 'mix'))).toBe(0.25);
  });

  it('editar sempre grava: não há gravação a desligar, e a pose de repouso fica (M6)', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    const repouso = JSON.stringify(doc.file.bones);
    // Degrau 4a: o interruptor saiu do módulo; não há como recusar a edição.
    expect('setAutoKey' in poseMode).toBe(false);
    expect('isAutoKeyOn' in poseMode).toBe(false);
    expect(setPropertyOrKey(doc, ROT, 90)).toBe('chave');
    expect(valueAt(doc.file, 'andar', 0, ROT)).toBe(90);
    expect(JSON.stringify(doc.file.bones)).toBe(repouso);
    // Onde não há onde escrever, diz: a animação sumiu do arquivo (regra 21).
    doc.animation = 'nao-existe';
    const antes = JSON.stringify(doc.file);
    expect(setPropertyOrKey(doc, ROT, 45)).toBe('recusado');
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('o botão Chavear grava o valor que está na tela', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    doc.time = 0.25;
    // Nada foi animado ainda: o valor da tela é o da pose de repouso.
    expect(keyTargetsNow(doc, [ROT, POS_X])).toBe(2);
    expect(valueAt(doc.file, 'andar', 0.25, ROT)).toBe(20);
    expect(valueAt(doc.file, 'andar', 0.25, POS_X)).toBe(0);
    expect(doc.file.bones[1].rotation).toBe(20);

    // Um passo só de desfazer para as duas chaves.
    doc.undo();
    expect(doc.file.animations?.[0].timelines).toBeUndefined();
  });

  it('o botão Apagar chave só apaga o que está no tempo', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    doc.time = 0;
    keyTargetsNow(doc, [ROT, POS_X]);
    doc.time = 0.5;
    expect(unkeyTargetsNow(doc, [ROT, POS_X])).toBe(0);
    doc.time = 0;
    expect(unkeyTargetsNow(doc, [ROT, POS_X])).toBe(2);
    expect(doc.file.animations?.[0].timelines).toBeUndefined();
  });

  it('chavear roda o esqueleto vivo com o novo valor', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    doc.time = 0;
    setPropertyOrKey(doc, ROT, 90);
    expect(doc.warnings).toEqual([]);
    expect(doc.skeleton?.findBone('braco')?.rotation).toBeCloseTo(90, 6);
  });
});

// ---------------------------------------------------------------------------

describe('a régua da linha do tempo', () => {
  it('lê o fps do esqueleto e cai em 30 quando não há', () => {
    const doc = sampleDoc();
    expect(fpsOf(doc)).toBe(30);
    delete doc.file.skeleton?.fps;
    expect(fpsOf(doc)).toBe(30);
    (doc.file.skeleton ?? {}).fps = 24;
    expect(fpsOf(doc)).toBe(24);
  });

  it('a faixa de tempo é a duração, e nunca menor que um segundo', () => {
    const doc = sampleDoc();
    expect(spanOf(doc)).toBe(1);
    doc.animation = 'andar';
    expect(spanOf(doc)).toBe(1);
    doc.run(new SetKey('andar', 2.5, ROT, 10));
    expect(spanOf(doc)).toBe(2.5);
  });

  it('o passo da régua abre espaço para o rótulo', () => {
    // 1 s de largura 600 px: 0,1 s (3 quadros) dá 60 px, pouco; 0,2 s (6) dá 120.
    // Rodada 40, lote 5: o passo é em SEGUNDOS redondos (era 5 quadros, 0,17 s).
    expect(frameStepFor(30, 1, 600)).toBe(6);
    // Apertada, a régua salta de 5 em 5 segundos (era 4 s, 120 quadros).
    expect(frameStepFor(30, 10, 300)).toBe(150);
    // Sem largura ainda medida, o passo é um segundo.
    expect(frameStepFor(30, 1, 0)).toBe(30);
  });

  it('escreve o tempo com vírgula, e prende o tempo no quadro', () => {
    expect(formatSeconds(0.5)).toBe('0,50 s');
    expect(formatSeconds(0)).toBe('0,00 s');
    expect(snapToFrame(0.51, 30)).toBe(0.5);
    expect(snapToFrame(0.52, 30)).toBeCloseTo(0.533333, 5);
    expect(snapToFrame(0.5, 2)).toBe(0.5);
  });
});

// ---------------------------------------------------------------------------

describe('o arquivo continua legível pelo runtime', () => {
  it('uma animação inteira montada por chaves carrega sem aviso', () => {
    const doc = sampleDoc();
    doc.animation = 'andar';
    for (const [time, value] of [[0, 0], [0.5, 45], [1, 0]] as Array<[number, number]>) {
      doc.time = time;
      setPropertyOrKey(doc, ROT, value);
    }
    doc.rebuild();
    expect(doc.warnings).toEqual([]);
    const keys = (findTimeline(doc.file, 'andar', ROT) as TimelineDef).keys as KeyDef[];
    expect(keys.map((key) => key.time)).toEqual([0, 0.5, 1]);
    expect(doc.data?.findAnimation('andar')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// A chave `parent` — §9.4, lote 1 de 14/09/2026
// ---------------------------------------------------------------------------

describe('trocar de pai vira chave (§9.4)', () => {
/**
 * O caso do Humberto, 14/09/2026: *"o personagem segura a arma e guarda ela
 * nas costas no meio da animação"*. A arma muda de pai e de ordem de desenho.
 * A ordem já era chave desde o lote 66; o pai é o que faltava.
 *
 * A lei: *"como o Spriter faz? Isso é lei."* Lá a hierarquia é definida por
 * chave, e o programa nunca pergunta nada. Aqui também: em Animando, trocar de
 * pai grava a chave, sem janelinha e sem mandar ninguém de volta à Montagem.
 *
 * O rig é o do caso de conformidade **C-281**, que prova a mesma coisa do lado
 * do runtime.
 */

  /** root · torso (0,100) girado 90 · mao (50,0) no torso · costas (−30,10). */
  function rigDaArma(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      skeleton: { name: 'teste', fps: 30 },
      bones: [
        { name: 'root' },
        { name: 'torso', parent: 'root', x: 0, y: 100, rotation: 90 },
        { name: 'mao', parent: 'torso', x: 50 },
        { name: 'costas', parent: 'root', x: -30, y: 10 },
      ],
      slots: [{ name: 'arma', bone: 'mao', attachment: 'arma' }],
      skins: [{
        name: 'default',
        attachments: { arma: { arma: { type: 'region', path: 'x', width: 10, height: 10 } } },
      }],
      animations: [{ name: 'guardar' }],
    } as unknown as BoneFile;
  }

  /** Um documento com a animação aberta no tempo pedido. */
  function animando(file: BoneFile, time: number): Doc {
    const doc = new Doc(file);
    doc.animation = 'guardar';
    doc.time = time;
    return doc;
  }

  /** O mundo de um osso como a tela mostra agora. */
  function mundoNaTela(doc: Doc, bone: string): { x: number; y: number } {
    const alvo = doc.skeleton?.findBone(bone);
    if (alvo === undefined || alvo === null) throw new Error(`sem osso ${bone}`);
    return { x: alvo.worldX, y: alvo.worldY };
  }

  const linha = (file: BoneFile, bone: string, property: string): unknown =>
    timelineJson(file, 'guardar', boneTarget(bone, property));

  it('grava a chave de pai no tempo de agora, e um null em 0', () => {
    const doc = animando(rigDaArma(), 0.5);
    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');

    // A linha nasce com o começo guardado: `null` é o pai do arquivo (§9.4).
    expect(linha(doc.file, 'mao', 'parent')).toEqual({
      type: 'bone',
      target: 'mao',
      property: 'parent',
      keys: [{ time: 0, value: null }, { time: 0.5, value: 'costas' }],
    });
    // E o arquivo NÃO mudou: a estrutura continua a de sempre.
    expect(doc.file.bones.find((b) => b.name === 'mao')?.parent).toBe('torso');
  });

  it('a arma não salta: o mundo no quadro da troca é o mesmo de antes', () => {
    const doc = animando(rigDaArma(), 0.5);
    const antes = mundoNaTela(doc, 'mao');

    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');

    const depois = mundoNaTela(doc, 'mao');
    expect(depois.x).toBeCloseTo(antes.x, 6);
    expect(depois.y).toBeCloseTo(antes.y, 6);
    // Os locais foram medidos do pai NOVO, e o runtime não converte nada.
    const x = linha(doc.file, 'mao', 'x') as { keys: KeyDef[] };
    expect(x.keys.at(-1)!.time).toBe(0.5);
    expect(x.keys.at(-1)!.value).toBeCloseTo(30, 6);
    // A mão está no mundo em (0, 150); as costas, em (−30, 10). Medida do pai
    // novo, ela é (30, 140) — e é isso que a chave grava.
    const y = linha(doc.file, 'mao', 'y') as { keys: KeyDef[] };
    expect(y.keys.at(-1)!.value).toBeCloseTo(140, 6);
  });

  it('o osso inclinado não perde o shearX — a conta é exata', () => {
    const file = rigDaArma();
    // Um `shearX` que a decomposição de §5.5 zeraria se ninguém cuidasse.
    (file.bones.find((b) => b.name === 'mao') as { shearX?: number }).shearX = 30;
    const doc = animando(file, 0.5);
    const antes = doc.skeleton!.findBone('mao')!;
    const matriz = { a: antes.a, b: antes.b, c: antes.c, d: antes.d };

    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');

    // O `shearX` do arquivo fica onde estava: nenhuma chave o zera.
    expect(findTimeline(doc.file, 'guardar', boneTarget('mao', 'shearX'))).toBeNull();
    expect((doc.file.bones.find((b) => b.name === 'mao') as { shearX?: number }).shearX).toBe(30);
    // E a pose na tela é a MESMA matriz, não só a mesma posição.
    const depois = doc.skeleton!.findBone('mao')!;
    expect(depois.a).toBeCloseTo(matriz.a, 6);
    expect(depois.b).toBeCloseTo(matriz.b, 6);
    expect(depois.c).toBeCloseTo(matriz.c, 6);
    expect(depois.d).toBeCloseTo(matriz.d, 6);
  });

  it('um passo de desfazer devolve o arquivo letra por letra', () => {
    const doc = animando(rigDaArma(), 0.5);
    const antes = JSON.stringify(doc.file);
    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('em Montagem nada disso acontece: o arquivo é que muda', () => {
    const doc = new Doc(rigDaArma());
    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');
    expect(doc.file.bones.find((b) => b.name === 'mao')?.parent).toBe('costas');
    expect(doc.file.animations?.[0]?.timelines ?? []).toHaveLength(0);
  });

  // Degrau 7, tarefa 7.3 (F8, spec 9.5): o desenho deixou de trocar de osso na
  // BASE e passou a trocar por CHAVE. O teste de antes provava o degrau 4a, em
  // que a chave `slot/bone` ainda não existia e a troca do desenho ia para a
  // base — com dois passos de desfazer (desvio 4 do Chat C). Reescrito para o
  // que vale agora: a base fica intacta, a chave carrega o `transform`, e o
  // gesto inteiro é um passo de desfazer só.
  it('seleção mista: o osso ganha chave de pai, o desenho ganha chave slot/bone, num desfazer só (7.3)', () => {
    const doc = animando(rigDaArma(), 0.5);
    const antes = JSON.stringify(doc.file);
    const recados: string[] = [];
    doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });

    runReparent(doc, { ...emptySelection(), bones: ['mao'], slots: ['arma'] }, 'costas');

    expect(findTimeline(doc.file, 'guardar', boneTarget('mao', 'parent'))).not.toBeNull();
    // A base do corpo não muda: o desenho continua dizendo o osso do arquivo.
    expect(doc.file.slots?.find((s) => s.name === 'arma')?.bone).toBe('mao');
    // Quem troca é a chave, e ela carrega a posição medida do osso novo (9.5).
    const linhaDoSlot = findTimeline(doc.file, 'guardar', slotTarget('arma', 'bone'));
    expect(linhaDoSlot).not.toBeNull();
    const chaves = (linhaDoSlot as unknown as { keys: KeyDef[] }).keys;
    const naTroca = chaves.find((key) => Math.abs(key.time - 0.5) < 1e-6);
    expect(naTroca?.value).toBe('costas');
    expect(naTroca?.transform).toBeDefined();
    // Antes da troca vale o osso do arquivo.
    expect(chaves[0]!.time).toBe(0);
    expect(chaves[0]!.value ?? null).toBe(null);

    expect(recados.at(-1)).toContain('por chave');
    expect(recados.at(-1)).not.toContain('Montagem');

    // Um passo de desfazer devolve as duas coisas: elas foram no mesmo comando.
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a espada não sai da mão antes da hora: a chave de segurar no quadro anterior', () => {
    // Achado na TELA, 14/09/2026, não nos testes: com só duas chaves (a de 0 e
    // a da troca), os locais rampavam do valor velho para o novo durante o
    // caminho inteiro — medidos do pai VELHO —, e a espada ia deslizando para
    // as costas desde o começo da animação.
    const doc = animando(rigDaArma(), 0.5);
    const naMao = mundoNaTela(doc, 'mao');

    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');

    // 30 quadros por segundo: o quadro anterior a 0,5 s é 0,466667.
    const x = linha(doc.file, 'mao', 'x') as { keys: KeyDef[] };
    expect(x.keys.map((k) => k.time)).toEqual([0, 0.466667, 0.5]);
    expect(x.keys[1]!.value).toBe(50);
    expect(x.keys[1]!.curve).toBe('stepped');

    // E a prova que importa: um quadro antes da troca, a mão ainda está onde
    // sempre esteve; no quadro da troca, no mesmo lugar do mundo.
    doc.time = 0.466667;
    expect(mundoNaTela(doc, 'mao').x).toBeCloseTo(naMao.x, 6);
    expect(mundoNaTela(doc, 'mao').y).toBeCloseTo(naMao.y, 6);
    doc.time = 0.5;
    expect(mundoNaTela(doc, 'mao').x).toBeCloseTo(naMao.x, 6);
    expect(mundoNaTela(doc, 'mao').y).toBeCloseTo(naMao.y, 6);
  });

  it('as chaves de depois vão junto: a pose de cada uma fica onde estava', () => {
    // O rig com a animação já feita: o torso gira, e a mão tem pose gravada
    // em 0,8 s — depois da troca. Antes desta peça, essa chave continuava
    // medida do pai velho e o braço saltava sem explicação.
    const file = rigDaArma();
    file.animations = [{
      name: 'guardar',
      timelines: [
        { type: 'bone', target: 'torso', property: 'rotation', keys: [{ time: 0, value: 90 }, { time: 1, value: 150 }] },
        { type: 'bone', target: 'mao', property: 'x', keys: [{ time: 0, value: 50 }, { time: 0.8, value: 70 }] },
        { type: 'bone', target: 'mao', property: 'rotation', keys: [{ time: 0.8, value: 45 }] },
      ],
    }] as never;

    // Onde a mão está em 0,8 s HOJE, antes de mexer em nada.
    const antes = animando(file, 0.8);
    const naTela = mundoNaTela(antes, 'mao');
    const matriz = antes.skeleton!.findBone('mao')!;
    const eram = { a: matriz.a, b: matriz.b, c: matriz.c, d: matriz.d };

    const doc = animando(JSON.parse(JSON.stringify(file)) as BoneFile, 0.5);
    const recados: string[] = [];
    doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });
    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');

    // A barra diz o número, não um adjetivo.
    expect(recados.at(-1)).toContain('1 chave depois desta foi convertida');

    // E a prova: em 0,8 s a mão está exatamente onde estava, na posição e na
    // matriz inteira — com outro pai debaixo dela.
    doc.time = 0.8;
    const agora = mundoNaTela(doc, 'mao');
    expect(agora.x).toBeCloseTo(naTela.x, 6);
    expect(agora.y).toBeCloseTo(naTela.y, 6);
    const depois = doc.skeleton!.findBone('mao')!;
    expect(depois.parent?.data.name).toBe('costas');
    expect(depois.a).toBeCloseTo(eram.a, 6);
    expect(depois.b).toBeCloseTo(eram.b, 6);
    expect(depois.c).toBeCloseTo(eram.c, 6);
    expect(depois.d).toBeCloseTo(eram.d, 6);

    // As seis propriedades ganharam chave naquele instante: uma que faltasse
    // continuaria interpolando um valor escrito para o pai velho.
    for (const property of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearY']) {
      const tl = linha(doc.file, 'mao', property) as { keys: KeyDef[] } | null;
      expect(tl?.keys.some((k) => Math.abs(k.time - 0.8) < 1e-9), property).toBe(true);
    }
  });

  it('a segunda troca manda no trecho dela: a conversão para na próxima chave de pai', () => {
    const file = rigDaArma();
    file.animations = [{
      name: 'guardar',
      timelines: [
        { type: 'bone', target: 'mao', property: 'parent', keys: [{ time: 0, value: null }, { time: 0.9, value: 'torso' }] },
        { type: 'bone', target: 'mao', property: 'x', keys: [{ time: 0.7, value: 70 }, { time: 0.95, value: 80 }] },
      ],
    }] as never;
    const doc = animando(file, 0.5);
    const recados: string[] = [];
    doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });

    runReparent(doc, { ...emptySelection(), bones: ['mao'] }, 'costas');

    // Só a de 0,7 s: a de 0,95 s já está no reinado da troca de 0,9 s.
    expect(recados.at(-1)).toContain('1 chave depois desta foi convertida');
    const x = linha(doc.file, 'mao', 'x') as { keys: KeyDef[] };
    expect(x.keys.find((k) => k.time === 0.95)!.value).toBe(80);
    expect(x.keys.find((k) => k.time === 0.7)!.value).not.toBe(70);
  });

  it('a linha do Pai aparece na folha com o nome certo, e é stepped', () => {
    const alvo = boneTarget('mao', 'parent');
    expect(targetInfo(alvo).label).toBe('Pai');
    expect(targetInfo(alvo).interpolable).toBe(false);
    expect(targetInfo(alvo).components).toBe(0);
  });
});


// ---------------------------------------------------------------------------
// Degrau 6 — as linhas novas da folha: a virada, `slot/bone`, `weights`
// ---------------------------------------------------------------------------

describe('a virada de corpo na folha — tarefa 6.3, spec 9.13', () => {
/**
 * A timeline `body` existe no arquivo desde o degrau 4b (o comando **Colar
 * corpo aqui**), e a folha já a desenhava — **muda**: `labelOf` não a conhecia
 * e devolvia string vazia, então a linha aparecia sem nome nenhum, no grupo
 * "Geral", entre os eventos e a ordem de desenho. É o caso da regra 21 em
 * estado puro: o programa desenhando o que não sabe nomear.
 */
  function comVirada(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'hips', parent: 'root' }],
      animations: [{
        name: 'transformar',
        duration: 2,
        timelines: [
          {
            type: 'bone', target: 'hips', property: 'rotation',
            keys: [{ time: 0, value: 0 }, { time: 1, value: 30 }],
          },
          {
            type: 'body',
            keys: [{ time: 0.5, value: 'lobisomem.bone' }, { time: 1.5, value: null }],
          },
        ],
      }],
    } as unknown as BoneFile;
  }

  it('a linha tem nome, e não mais o nome vazio de antes', () => {
    expect(targetInfo(bodyTarget()).label).toBe('Virada de base');
  });

  it('é só parada: o rabo nasce, não cresce', () => {
    expect(targetInfo(bodyTarget()).interpolable).toBe(false);
    expect(targetInfo(bodyTarget()).components).toBe(0);
  });

  it('tem grupo próprio, e não cai no "Geral" com os eventos', () => {
    expect(groupOf(bodyTarget())).toEqual({ id: 'body', label: 'Virada de base' });
  });

  it('a folha mostra a linha da virada com o nome do lobisomem na célula', () => {
    const file = comVirada();
    const grupos = dopesheetGroups(file, 'transformar');
    const virada = grupos.find((g) => g.id === 'body');
    expect(virada?.label).toBe('Virada de base');
    expect(virada?.rows[0].label).toBe('Virada de base');

    const celulas = steppedCells(file, 'transformar', bodyTarget());
    expect(celulas.map((c) => c.text)).toEqual(['lobisomem', 'o arquivo']);
    expect(celulas[0].from).toBe(0.5);
    expect(celulas[0].to).toBe(1.5);
    // A última vai até o fim da animação, não até a última chave.
    expect(celulas[1].to).toBe(2);
  });

  it('a dica da célula diz o uri inteiro, que não cabe escrito nela', () => {
    const celulas = steppedCells(comVirada(), 'transformar', bodyTarget());
    expect(celulas[0].title).toContain('lobisomem.bone');
    expect(celulas[0].title).toContain('0,50 s');
  });

  it('o uri vira nome curto: pasta e extensão saem, e `null` é o arquivo', () => {
    expect(bodyShortName('personagens/lobisomem.bone')).toBe('lobisomem');
    expect(bodyShortName('a\\b\\rabo.bonez')).toBe('rabo');
    expect(bodyShortName(null)).toBe('o arquivo');
    expect(bodyShortName('')).toBe('o arquivo');
  });

  it('antes da primeira chave vale o ARQUIVO, e não a primeira chave (9.13)', () => {
    // A única exceção à regra de 9.10, e ela existe porque toda animação nasce
    // no corpo em que foi gravada.
    const file = comVirada();
    expect(valueAt(file, 'transformar', 0.2, bodyTarget())).toBe(null);
    expect(valueAt(file, 'transformar', 0.5, bodyTarget())).toBe('lobisomem.bone');
    expect(valueAt(file, 'transformar', 1.2, bodyTarget())).toBe('lobisomem.bone');
    expect(valueAt(file, 'transformar', 1.8, bodyTarget())).toBe(null);
  });

  it('"mostrar só os escolhidos" não esconde a virada', () => {
    // Ela não é de osso nenhum, e dali em diante o personagem é outro.
    const grupos = dopesheetGroups(comVirada(), 'transformar', { bones: [], slots: [] });
    expect(grupos.map((g) => g.id)).toEqual(['body']);
  });
});

describe('o desenho troca de osso, e os pesos animam — tarefa 6.5', () => {
/**
 * Duas linhas que o formato ganhou no rascunho 0.2 e que a folha ainda não
 * sabia ler: `slot/bone` (spec 9.5, o desenho troca de osso sem saltar) e
 * `weights` (spec 9.6, pesos animados). A primeira saía com o rótulo `bone`
 * cru; a segunda, com rótulo vazio, como a virada.
 */
  it('a linha do osso do desenho tem nome que não se confunde com a do osso', () => {
    const alvo = slotTarget('espada', 'bone');
    expect(targetInfo(alvo).label).toBe('Osso do desenho');
    expect(targetInfo(alvo).interpolable).toBe(false);
  });

  it('a célula diz para qual osso o desenho foi, e quando ele volta', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'mao' }, { name: 'costas' }],
      slots: [{ name: 'espada', bone: 'mao' }],
      animations: [{
        name: 'guardar',
        duration: 1,
        timelines: [{
          type: 'slot', target: 'espada', property: 'bone',
          keys: [
            { time: 0.5, value: 'costas', transform: { x: 10, y: 0, rotation: -90 } },
            { time: 0.9, value: null },
          ],
        }],
      }],
    } as unknown as BoneFile;

    const celulas = steppedCells(file, 'guardar', slotTarget('espada', 'bone'));
    expect(celulas.map((c) => c.text)).toEqual(['costas', 'o osso do arquivo']);
    expect(celulas[0].title).toContain('costas');
    expect(celulas[1].title).toContain('volta ao osso do arquivo');
  });

  it('`weights` tem o mesmo endereço de três partes do `deform` (9.6)', () => {
    const alvo = weightsTarget('capa', 'capa');
    expect(normalizeTarget({ type: 'weights', target: 'capa', attachment: 'capa' }).skin).toBe('default');
    expect(targetKey(alvo)).toBe('weights|capa||default|capa');
    expect(groupOf(alvo)).toEqual({ id: 'weights:capa:capa', label: 'Pesos capa / capa' });
    expect(targetInfo(alvo).label).toBe('Pesos');
  });

  it('`weights` interpola o array INTEIRO, como o deform — não só o primeiro peso', () => {
    // Sem esta regra o array cairia no ramo de `components`, que corta em um
    // número: a malha animaria um vértice e ficaria parada no resto.
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'capa', bone: 'root' }],
      animations: [{
        name: 'voar',
        duration: 1,
        timelines: [{
          type: 'weights', target: 'capa', skin: 'default', attachment: 'capa',
          keys: [{ time: 0, value: [1, 0, 1, 0] }, { time: 1, value: [0, 1, 0, 1] }],
        }],
      }],
    } as unknown as BoneFile;

    const meio = valueAt(file, 'voar', 0.5, weightsTarget('capa', 'capa')) as number[];
    expect(meio).toEqual([0.5, 0.5, 0.5, 0.5]);
  });

  it('a timeline nova nasce com skin e anexo escritos na ordem da spec', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'capa', bone: 'root' }],
      animations: [{ name: 'voar', duration: 1 }],
    } as unknown as BoneFile;

    setKey(file, 'voar', 0, weightsTarget('capa', 'capa', 'inverno'), [1, 0]);
    const linha = findTimeline(file, 'voar', weightsTarget('capa', 'capa', 'inverno'));
    expect(JSON.parse(JSON.stringify(linha))).toEqual({
      type: 'weights', target: 'capa', skin: 'inverno', attachment: 'capa',
      keys: [{ time: 0, value: [1, 0] }],
    });
  });

  it('a skin `default` não é escrita, como no deform: o padrão fica implícito', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'capa', bone: 'root' }],
      animations: [{ name: 'voar', duration: 1 }],
    } as unknown as BoneFile;

    setKey(file, 'voar', 0, weightsTarget('capa', 'capa'), [1, 0]);
    const linha = findTimeline(file, 'voar', weightsTarget('capa', 'capa'));
    expect((linha as unknown as { skin?: string }).skin).toBeUndefined();
  });
});

describe('quais linhas ganham célula com nome', () => {
  it('as três que carregam um NOME, e nenhuma outra', () => {
    expect(hasSteppedCells(bodyTarget())).toBe(true);
    expect(hasSteppedCells(slotTarget('espada', 'bone'))).toBe(true);
    expect(hasSteppedCells(nestedTarget('mochila', 'animation'))).toBe(true);

    // A linha Desenho fica em losango: ela é do Chat D7 nesta rodada, e mexer
    // nela seria mexer no que o vizinho está gravando.
    expect(hasSteppedCells(slotTarget('espada', 'attachment'))).toBe(false);
    expect(hasSteppedCells(boneTarget('hips', 'rotation'))).toBe(false);
    expect(hasSteppedCells(nestedTarget('mochila', 'timeScale'))).toBe(false);
  });

  it('uma linha sem timeline não tem célula nenhuma, e não estoura', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      animations: [{ name: 'parado', duration: 1 }],
    } as unknown as BoneFile;
    expect(steppedCells(file, 'parado', bodyTarget())).toEqual([]);
    expect(steppedCells(file, 'nao-existe', bodyTarget())).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// P12 — mostrar a chave que acabou de nascer (chat D, lote 2a, 29/09/2026)
// ---------------------------------------------------------------------------

describe('revealKey: quem cria uma chave que a cena não mostra pede para vê-la', () => {
  it('com a linha do tempo escutando, o pedido chega na hora', () => {
    const vistos: unknown[] = [];
    const parar = onRevealKey((ref) => vistos.push(ref));
    expect(revealKey({ target: { type: 'body' }, time: 0.5 })).toBe(true);
    parar();
    expect(vistos).toEqual([{ target: { type: 'body' }, time: 0.5 }]);
  });

  it('sem ninguém escutando, o pedido espera e é entregue a quem chegar', () => {
    expect(revealKey({ target: { type: 'drawOrder' }, time: 0.25 })).toBe(false);
    const vistos: unknown[] = [];
    const parar = onRevealKey((ref) => vistos.push(ref));
    parar();
    expect(vistos).toEqual([{ target: { type: 'drawOrder' }, time: 0.25 }]);
  });

  /*
   * Por quanto tempo espera: até a linha do tempo montar, e só UM pedido — o
   * mais novo troca o velho. Se ela nunca montar, nada acontece: o `revealKey`
   * devolveu `false`, e quem chamou já tem o próprio rodapé. Não há fila que
   * cresça nem pedido velho que acorde num arquivo que já é outro.
   */
  it('o pedido que espera é um só: o mais novo troca o velho', () => {
    expect(revealKey({ target: { type: 'drawOrder' }, time: 0.1 })).toBe(false);
    expect(revealKey({ target: { type: 'drawOrder' }, time: 0.9 })).toBe(false);
    const vistos: unknown[] = [];
    const parar = onRevealKey((ref) => vistos.push(ref));
    parar();
    expect(vistos).toEqual([{ target: { type: 'drawOrder' }, time: 0.9 }]);
    const depois: unknown[] = [];
    const parar2 = onRevealKey((ref) => depois.push(ref));
    parar2();
    expect(depois).toEqual([]);
  });

  it('o rodapé de quem não tem frase melhor diz o quê, de quem e quando', () => {
    expect(keyCreatedNotice({ type: 'bone', target: 'leg_b', property: 'rotation' }, 0.5))
      .toBe('Chave de Rotação de leg_b criada em 0,50 s');
  });
});

// ---------------------------------------------------------------------------
// K3, L17 — a chave que nasceu calada ganha a frase (chat D, lote 2a)
// ---------------------------------------------------------------------------

describe('newKeysNotice: o rodapé diz a chave que nasceu', () => {
  it('posar em 0,00 s: "Chave em 0,00 s: Rotação de leg_b"', () => {
    expect(newKeysNotice([{ target: { type: 'bone', target: 'leg_b', property: 'rotation' }, time: 0 }]))
      .toBe('Chave em 0,00 s: Rotação de leg_b');
  });

  it('a chave do começo que nasce junto não é a notícia: fala a do tempo mais tarde', () => {
    const alvo = { type: 'bone', target: 'torso', property: 'rotation' } as const;
    expect(newKeysNotice([{ target: alvo, time: 0 }, { target: alvo, time: 0.5 }]))
      .toBe('Chave em 0,50 s: Rotação de torso');
  });

  it('arrastar vértice: diz DEFORMAÇÃO (L17)', () => {
    expect(newKeysNotice([{ target: { type: 'deform', target: 'head', property: 'face' } as never, time: 0.53 }]))
      .toBe('Chave em 0,53 s: Deformação da malha de head');
  });

  it('várias no mesmo tempo: a conta e os nomes; nenhuma: nada', () => {
    const x = { type: 'bone', target: 'hips', property: 'x' } as const;
    const y = { type: 'bone', target: 'hips', property: 'y' } as const;
    expect(newKeysNotice([{ target: x, time: 0.2 }, { target: y, time: 0.2 }])).toBe('2 chaves em 0,20 s: Posição X de hips, Posição Y de hips');
    expect(newKeysNotice([])).toBeNull();
  });

  it('a linha do tempo olha as chaves antes e depois, e o laranja ganhou dica', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/dopesheet.ts'), 'utf8');
    // Rodada 40, lote 5 (nota do doc 47): desfazer e refazer não anunciam chave nova.
    expect(fonte).toContain("else if (change.kind === 'structure') this.noticeNewKeys(shouldAnnounceNewKeys(change.label));");
    expect(fonte).toContain('Laranja: há chave neste tempo');
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, PL-25: o meio-termo (breakdown)
// ---------------------------------------------------------------------------

describe('rodada 17, PL-25: o meio-termo põe a chave entre a de antes e a de depois', () => {
  const arquivo = {
    bone: { version: '1.0', minVersion: '1.0' },
    bones: [{ name: 'root' }, { name: 'b', parent: 'root' }, { name: 'c', parent: 'root' }],
    animations: [{
      name: 'a', duration: 1,
      timelines: [
        { type: 'bone', target: 'b', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 90 }] },
        { type: 'bone', target: 'c', property: 'x', keys: [{ time: 0, value: 10 }] },
      ],
    }],
  } as unknown as BoneFile;

  it('no meio, puxando para a anterior (1/3) e para a seguinte (2/3)', () => {
    expect(breakdownValues(arquivo, 'a', 0.5, ['b'], 'meio')[0]!.value).toBeCloseTo(45);
    expect(breakdownValues(arquivo, 'a', 0.5, ['b'], 'anterior')[0]!.value).toBeCloseTo(30);
    expect(breakdownValues(arquivo, 'a', 0.5, ['b'], 'seguinte')[0]!.value).toBeCloseTo(60);
  });

  it('linha sem chave dos dois lados fica; nenhum osso escolhido = a pose inteira', () => {
    expect(breakdownValues(arquivo, 'a', 0.5, ['c'], 'meio')).toEqual([]);
    expect(breakdownValues(arquivo, 'a', 0.5, [], 'meio').map((v) => v.target.target)).toEqual(['b']);
    expect(breakdownNotice('meio', 0, 0.5, false)).toContain('Nada mudou');
    expect(breakdownNotice('anterior', 1, 0.5, true)).toBe('Meio-termo puxando para a anterior em 0,50 s: 1 chave, na pose inteira (nenhum osso escolhido)');
  });

  it('a porta: Editar → Pose, três itens, e a Linha do tempo grava num passo', () => {
    const menu = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');
    for (const id of ['meio-termo', 'meio-termo-anterior', 'meio-termo-seguinte']) expect(menu).toContain(`'${id}',`);
    const folha = readFileSync(resolve(__dirname, '../src/panels/dopesheet.ts'), 'utf8');
    expect(folha).toContain('keyValuesNow(doc, valores, BREAKDOWN_LABEL[kind]');
  });
});
