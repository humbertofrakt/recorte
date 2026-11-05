/**
 * Linha do tempo — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote9-laco-e-marcas`, `lote10-chaves-em-bloco`, `lote14-linha-limpa`.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { addMarker, insideLoop, markerAt, markerLabel, nextMarker, parseTimelineStates, previousMarker, readTimelineStates, removeMarker, renameMarker, setLoopFrom, setLoopTo, stateOf, writeTimelineStates } from '../src/anim/markers.js';
import { END_MODES, boundsOf, createTransport, landAt } from '../src/anim/transport.js';
import { dopesheetGroups, allKeyTimes, cleanRepeatedKeys, clearAnimation, pasteKeys, pasteToAllKeys, poseAt, removeTimelines, rippleMove, valueAt } from '../src/anim/keying.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { EditKeys } from '../src/anim/pose-mode.js';
// Rodada 8c, C13 e C14.
import { activeRuns as activeRunsFaixa, cycleLength as cycleLengthFaixa, entityBand as entityBandFaixa, entitySlots as entitySlotsFaixa, moveBandRun as moveBandRunFaixa, timeScaleForTip as timeScaleForTipFaixa, writeBandTimeScale as writeBandTimeScaleFaixa } from '../src/anim/entity-band.js';
// Rodada 8c, C15.
import { SetEntityLoop as SetEntityLoopFaixa, seamWarning as seamWarningFaixa, snapTipToEnd as snapTipToEndFaixa, stretchEntityBands as stretchEntityBandsFaixa } from '../src/anim/entity-band.js';
// Rodada 8c, C11.
import { ENTITY_ROW_HEIGHT as ENTITY_ROW_HEIGHT_FECHADA } from '../src/panels/dock-model.js';
import { readFileSync as readFileSyncFaixa } from 'node:fs';
import { resolve as resolveFaixa } from 'node:path';
import { CLOSED_HEIGHT, DEFAULT_OPEN_HEIGHT, OPEN_AT, OPEN_MIN, defaultDockState, detailsButton, dockFromDrag, dockHeightFor, dockState, onDockChange, parseDockState, resetDockState, setDockHeight, setDockState, toggleDock, visibleGroups } from '../src/panels/dock-model.js';
import { KEY_HINT, clonesOnDrag, selectionModeOf, startsKeyDrag } from '../src/panels/dopesheet-model.js';
import { allKeyRefs, moveKeys, cloneKeys, keyRefKey } from '../src/anim/keying.js';
import { DOCK_PANELS, DOCK_STATE_KEY } from '../src/ui/shell.js';
import { allMenus, flatEntries } from '../src/ui/menus.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { viewMenuState } from './ajuda-view.js';
// K15 (chat D, lote 2a): o começo da entidade.
import { entityStartValue, keyMenuPlan, popupPlacement } from '../src/panels/dopesheet-model.js';
import { bodyKeys, removeKeyRef, setBodyKey } from '../src/anim/body.js';
import { DEFAULT_MIRROR_RULES, mirrorClipboardIn, mirroredPasteNotice, parseMirrorRules } from '../src/anim/timeline-tools.js';
import { bodyRemovalNotice } from '../src/panels/dopesheet-edit.js';

// ---------------------------------------------------------------------------
// laco e marcas (lote 9) — era `lote9-laco-e-marcas.test.ts`
// ---------------------------------------------------------------------------

describe('laco e marcas (lote 9)', () => {
/**
 * Lote 9 (v2.6): trecho de laço, marcas e modos de fim.
 *
 * Sem DOM, e sem esperar relógio: a conta do fim é `landAt`, pura, e é ela que
 * junta os quatro modos do item 100 com o trecho do item 81. As marcas são
 * listas e funções que devolvem listas novas.
 *
 * Nada disto vai para o jogo: mora em `RECORTE_editor_state.timeline`, que os
 * leitores ignoram.
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', y: 90 },
      { name: 'braco', parent: 'root', x: 200 },
    ],
    slots: [{ name: 'desenho', bone: 'braco', attachment: 'desenho' }],
    skins: [{
      name: 'default',
      attachments: { desenho: { desenho: { type: 'region', path: 'x', width: 10, height: 10 } } },
    }],
    animations: [{
      name: 'walk',
      duration: 1,
      timelines: [
        {
          type: 'bone', target: 'hips', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.5, value: 10 }],
        },
        {
          type: 'bone', target: 'braco', property: 'rotation',
          keys: [{ time: 0, value: 0 }],
        },
        {
          type: 'slot', target: 'desenho', property: 'attachment',
          keys: [{ time: 0, value: 'desenho' }],
        },
      ],
    }],
  } as BoneFile;
}

function fakeClock(): {
  now(): number; schedule(run: (ms: number) => void): number; cancel(id: number): void;
  fire(ms: number): void;
} {
  let next = 1;
  const jobs = new Map<number, (ms: number) => void>();
  return {
    now: () => 0,
    schedule(run) { const id = next++; jobs.set(id, run); return id; },
    cancel(id) { jobs.delete(id); },
    fire(ms) { const todo = [...jobs.values()]; jobs.clear(); for (const run of todo) run(ms); },
  };
}

// ---------------------------------------------------------------------------
// Item 82 — marcas
// ---------------------------------------------------------------------------

describe('as marcas', () => {
  it('entram em ordem de tempo, não de criação', () => {
    let marks = addMarker([], 0.5, 'meio');
    marks = addMarker(marks, 0.1, 'início');
    expect(marks.map((m) => m.time)).toEqual([0.1, 0.5]);
  });

  it('duas no mesmo instante não existem: a segunda troca o nome da primeira', () => {
    let marks = addMarker([], 0.5, 'meio');
    marks = addMarker(marks, 0.5, 'outro');
    expect(marks).toHaveLength(1);
    expect(marks[0].name).toBe('outro');
  });

  it('tirar e renomear devolvem listas novas, sem mexer na de entrada', () => {
    const marks = addMarker([], 0.5, 'meio');
    expect(removeMarker(marks, 0.5)).toEqual([]);
    expect(renameMarker(marks, 0.5, 'pé no chão')[0].name).toBe('pé no chão');
    expect(marks[0].name).toBe('meio');
  });

  it('pular de marca em marca acha a próxima e a anterior', () => {
    let marks = addMarker([], 0.2, 'a');
    marks = addMarker(marks, 0.6, 'b');
    expect(nextMarker(marks, 0)?.time).toBe(0.2);
    expect(nextMarker(marks, 0.2)?.time).toBe(0.6);
    expect(nextMarker(marks, 0.6)).toBeNull();
    expect(previousMarker(marks, 0.6)?.time).toBe(0.2);
    expect(previousMarker(marks, 0)).toBeNull();
  });

  it('uma marca sem nome não fica muda na tela', () => {
    expect(markerLabel({ time: 0, name: '' })).toBe('marca');
    expect(markerLabel({ time: 0, name: 'pé' })).toBe('pé');
  });

  it('`markerAt` acha pelo instante, com folga de ponto flutuante', () => {
    const marks = addMarker([], 0.1 + 0.2, 'x');
    expect(markerAt(marks, 0.3)).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Guardar no arquivo
// ---------------------------------------------------------------------------

describe('o que fica guardado no arquivo', () => {
  it('vai e volta igual', () => {
    const doc = new Doc(testFile());
    writeTimelineStates(doc.file, {
      walk: { loop: { from: 0.2, to: 0.6 }, markers: [{ time: 0.3, name: 'pé' }] },
    });
    const lido = readTimelineStates(doc.file);
    expect(lido['walk'].loop).toEqual({ from: 0.2, to: 0.6 });
    expect(lido['walk'].markers).toEqual([{ time: 0.3, name: 'pé' }]);
  });

  it('animação sem marca e sem trecho não deixa resto guardado', () => {
    const doc = new Doc(testFile());
    writeTimelineStates(doc.file, {
      walk: { markers: [{ time: 0.3, name: 'pé' }] },
    });
    // A palavra "timeline" também aparece nas `timelines` da animação, então a
    // prova olha a extensão do editor, e não o arquivo inteiro como texto.
    const guardado = (): Record<string, unknown> =>
      ((doc.file as { extensions?: Record<string, Record<string, unknown>> })
        .extensions?.['RECORTE_editor_state'] ?? {});
    expect('timeline' in guardado()).toBe(true);

    // Tirando a última marca, a chave inteira sai: um arquivo que carrega
    // restos vazios cresce a cada sessão e não diz nada a mais.
    writeTimelineStates(doc.file, { walk: {} });
    expect('timeline' in guardado()).toBe(false);
    expect(readTimelineStates(doc.file)).toEqual({});
  });

  it('lixo no guardado vira vazio, e nada estoura', () => {
    expect(parseTimelineStates(null)).toEqual({});
    expect(parseTimelineStates('sim')).toEqual({});
    expect(parseTimelineStates({ walk: 'sim' })).toEqual({});
    // Um trecho ao contrário não é trecho.
    expect(parseTimelineStates({ walk: { loop: { from: 9, to: 1 } } })).toEqual({});
    // Uma marca sem tempo é descartada; a boa fica.
    expect(parseTimelineStates({
      walk: { markers: [{ name: 'x' }, { time: 0.5 }] },
    })['walk'].markers).toEqual([{ time: 0.5, name: '' }]);
  });

  it('`stateOf` de uma animação que não tem nada devolve vazio', () => {
    expect(stateOf({}, 'walk')).toEqual({});
    expect(stateOf({}, null)).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Item 81 — o trecho
// ---------------------------------------------------------------------------

describe('o trecho de laço', () => {
  it('o começo depois do fim não é trecho: ele some', () => {
    expect(setLoopFrom({ from: 0.2, to: 0.6 }, 0.9)).toBeNull();
    expect(setLoopTo({ from: 0.5, to: 0.8 }, 0.1)).toBeNull();
  });

  it('marcar o fim sem ter começo começa em zero', () => {
    expect(setLoopTo(undefined, 0.4)).toEqual({ from: 0, to: 0.4 });
  });

  it('um começo negativo é aparado em zero', () => {
    expect(setLoopFrom({ from: 0, to: 1 }, -5)).toEqual({ from: 0, to: 1 });
  });

  it('sem trecho, tudo está "dentro"', () => {
    expect(insideLoop(undefined, 99)).toBe(true);
    expect(insideLoop({ from: 0.2, to: 0.6 }, 0.4)).toBe(true);
    expect(insideLoop({ from: 0.2, to: 0.6 }, 0.7)).toBe(false);
  });

  it('o trecho é aparado pela duração da animação', () => {
    expect(boundsOf(1, { from: 0.2, to: 5 })).toEqual({ from: 0.2, to: 1 });
    expect(boundsOf(1, null)).toEqual({ from: 0, to: 1 });
  });
});

// ---------------------------------------------------------------------------
// Item 100 — os modos de fim
// ---------------------------------------------------------------------------

describe('o que acontece no fim', () => {
  it('parar: fica no fim, e para', () => {
    expect(landAt(1.4, 0, 1, 'parar', true, 1))
      .toEqual({ time: 1, playing: false, direction: 1 });
  });

  it('repetir: dá a volta e continua', () => {
    const land = landAt(1.25, 0, 1, 'repetir', false, 1);
    expect(land.time).toBeCloseTo(0.25, 6);
    expect(land.playing).toBe(true);
  });

  it('voltar ao início: volta a zero e para', () => {
    expect(landAt(1.4, 0, 1, 'voltar', true, 1))
      .toEqual({ time: 0, playing: false, direction: 1 });
  });

  it('vai e volta: passa do fim e troca o sentido', () => {
    const land = landAt(1.1, 0, 1, 'vai-e-volta', false, 1);
    expect(land.time).toBeCloseTo(0.9, 6);
    expect(land.direction).toBe(-1);
    expect(land.playing).toBe(true);

    // E na volta, passar do começo troca de novo.
    const back = landAt(-0.1, 0, 1, 'vai-e-volta', false, -1);
    expect(back.time).toBeCloseTo(0.1, 6);
    expect(back.direction).toBe(1);
  });

  it('"como o arquivo diz" obedece ao Repetir da animação', () => {
    expect(landAt(1.2, 0, 1, 'arquivo', true, 1).playing).toBe(true);
    expect(landAt(1.2, 0, 1, 'arquivo', false, 1).playing).toBe(false);
  });

  it('dentro do TRECHO, o fim é o fim do trecho', () => {
    // Trecho de 0,2 a 0,6, repetindo: passar de 0,6 volta para 0,2.
    const land = landAt(0.7, 0.2, 0.6, 'repetir', false, 1);
    expect(land.time).toBeCloseTo(0.3, 6);
    expect(land.playing).toBe(true);
  });

  it('um trecho de tamanho zero não toca', () => {
    expect(landAt(1, 0.5, 0.5, 'repetir', true, 1).playing).toBe(false);
  });

  it('são cinco escolhas, e cada uma se explica', () => {
    expect(END_MODES).toHaveLength(5);
    for (const mode of END_MODES) {
      expect(mode.label.trim()).not.toBe('');
      expect(mode.hint.trim()).not.toBe('');
    }
    expect(END_MODES[0].value).toBe('arquivo');
  });
});

describe('o motor com trecho e modo', () => {
  it('tocar dentro do trecho repete só ele', () => {
    const doc = new Doc(testFile());
    doc.animation = 'walk';
    doc.time = 0.2;
    const clock = fakeClock();
    const player = createTransport(clock);
    player.setRange({ from: 0.2, to: 0.6 });
    player.setEndMode('repetir');
    player.play(doc);
    // 500 ms numa janela de 0,4 s: 0,2 + 0,5 = 0,7, que dá a volta para 0,3.
    clock.fire(500);
    expect(doc.time).toBeCloseTo(0.3, 6);
    expect(player.isPlaying()).toBe(true);
  });

  it('a agulha fora do trecho entra nele antes de andar', () => {
    const doc = new Doc(testFile());
    doc.animation = 'walk';
    doc.time = 0.9;
    const clock = fakeClock();
    const player = createTransport(clock);
    player.setRange({ from: 0.2, to: 0.6 });
    player.setEndMode('repetir');
    player.play(doc);
    clock.fire(100);
    // Entrou em 0,2 e andou 0,1.
    expect(doc.time).toBeCloseTo(0.3, 6);
  });

  it('tirar o trecho volta a tocar a animação inteira', () => {
    const player = createTransport(fakeClock());
    player.setRange({ from: 0.2, to: 0.6 });
    expect(player.range()).toEqual({ from: 0.2, to: 0.6 });
    player.setRange(null);
    expect(player.range()).toBeNull();
  });

  // Lote 25, anotação 14: *"quando clico numa animação sem laço, ela roda uma
  // vez. Deveria rodar sempre enquanto o play estiver ligado"*. O `loop` do
  // arquivo continua sendo o que o JOGO faz; o tocador do editor é outra coisa.
  it('o modo de fim nasce em "Repetir", e não no que o arquivo diz', () => {
    expect(createTransport(fakeClock()).endMode()).toBe('repetir');
  });
});

// ---------------------------------------------------------------------------
// Item 95 — mostrar só os escolhidos
// ---------------------------------------------------------------------------

describe('mostrar só as linhas do escolhido', () => {
  it('sem filtro, todos os grupos', () => {
    const groups = dopesheetGroups(testFile(), 'walk');
    expect(groups.length).toBeGreaterThan(1);
  });

  it('com um osso escolhido, só o grupo dele', () => {
    const groups = dopesheetGroups(testFile(), 'walk', { bones: ['hips'], slots: [] });
    expect(groups).toHaveLength(1);
    expect(groups[0].rows.every((row) => row.target.target === 'hips')).toBe(true);
  });

  it('um slot escolhido traz a linha do slot', () => {
    const groups = dopesheetGroups(testFile(), 'walk', { bones: [], slots: ['desenho'] });
    expect(groups).toHaveLength(1);
    expect(groups[0].rows[0].target.type).toBe('slot');
  });

  it('sem nada escolhido, o filtro não deixa nada — e é isso mesmo', () => {
    // A folha fica vazia, e a linha Resumo continua mostrando todas as chaves:
    // ela é o mapa, e um mapa filtrado não serve para achar o caminho.
    expect(dopesheetGroups(testFile(), 'walk', { bones: [], slots: [] })).toEqual([]);
  });
});
});

// ---------------------------------------------------------------------------
// chaves em bloco (lote 10) — era `lote10-chaves-em-bloco.test.ts`
// ---------------------------------------------------------------------------

describe('chaves em bloco (lote 10)', () => {
/**
 * Lote 10 (v2.7): chaves em bloco.
 *
 * Sem DOM. Oito gestos, e todos passam pelas mesmas funções de `anim/keying.ts`
 * — copiar a pose, colar em todas, apagar as linhas, empurrar as seguintes.
 * Cada um é um `EditKeys`, ou seja, um passo de desfazer.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

/** `walk` com três chaves de rotação e duas de x, e um evento em 0,17. */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'braco', parent: 'root', x: 100 }],
    events: [{ name: 'passo' }],
    animations: [{
      name: 'walk',
      duration: 1,
      timelines: [
        {
          type: 'bone', target: 'braco', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.17, value: 20 }, { time: 0.5, value: 0 }],
        },
        {
          type: 'bone', target: 'braco', property: 'x',
          keys: [{ time: 0, value: 100 }, { time: 0.5, value: 120 }],
        },
        { type: 'event', keys: [{ time: 0.17, event: 'passo' }] },
      ],
    }, {
      name: 'idle',
      duration: 1,
      timelines: [
        { type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 5 }] },
      ],
    }],
  } as BoneFile;
}

function testDoc(): Doc {
  return new Doc(testFile());
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

const rot = { type: 'bone' as const, target: 'braco', property: 'rotation' };
const posX = { type: 'bone' as const, target: 'braco', property: 'x' };

// ---------------------------------------------------------------------------
// Item 85 — copiar a pose inteira
// ---------------------------------------------------------------------------

describe('copiar a pose inteira', () => {
  it('num tempo ENTRE chaves, os valores vêm interpolados', () => {
    const file = testFile();
    // A rotação vai de 20 em 0,17 até 0 em 0,5. Em 0,335, metade: 10.
    const pose = poseAt(file, 'walk', 0.335);
    const item = pose.items.find((i) => i.target.property === 'rotation');
    expect(item?.key.value).toBeCloseTo(10, 3);
  });

  it('um item por linha, e todos no mesmo instante', () => {
    const pose = poseAt(testFile(), 'walk', 0.25);
    // Duas linhas de osso. O evento fica de fora: ele acontece ou não acontece,
    // e copiar a pose não pode inventar um disparo.
    expect(pose.items).toHaveLength(2);
    expect(pose.items.every((i) => i.offset === 0)).toBe(true);
    expect(pose.base).toBeCloseTo(0.25, 6);
  });

  // -- item 9: só a pose do escolhido ---------------------------------------

  it('com `targets`, só as linhas pedidas entram na pose', () => {
    const pose = poseAt(testFile(), 'walk', 0.25, [rot]);
    expect(pose.items).toHaveLength(1);
    expect(pose.items[0]!.target).toEqual(rot);
  });

  it('um alvo sem valor naquele tempo simplesmente não aparece', () => {
    const pose = poseAt(testFile(), 'walk', 0.25, [posX, { type: 'bone', target: 'nada', property: 'rotation' }]);
    expect(pose.items).toHaveLength(1);
    expect(pose.items[0]!.target).toEqual(posX);
  });

  it('`targets` vazio dá uma pose vazia; omitido, a pose inteira', () => {
    expect(poseAt(testFile(), 'walk', 0.25, []).items).toHaveLength(0);
    expect(poseAt(testFile(), 'walk', 0.25, null).items).toHaveLength(2);
    expect(poseAt(testFile(), 'walk', 0.25).items).toHaveLength(2);
  });

  it('colar essa pose em outra animação cria as chaves', () => {
    const doc = testDoc();
    const pose = poseAt(doc.file, 'walk', 0.335);
    const antes = texto(doc);

    doc.run(new EditKeys('idle', 'Colar pose', (file, name) => {
      pasteKeys(file, name, pose, 0);
    }));

    expect(valueAt(doc.file, 'idle', 0, rot)).toBeCloseTo(10, 3);
    // A linha de `x` não existia no `idle`: ela nasceu com a colagem. `x` vai de
    // 100 em 0 a 120 em 0,5; em 0,335 isso dá 100 + 20 × 0,67 = 113,4.
    expect(valueAt(doc.file, 'idle', 0, posX)).toBeCloseTo(113.4, 3);

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('numa animação sem linha nenhuma, a pose sai vazia', () => {
    const file = testFile();
    (file.animations ?? [])[1].timelines = [];
    expect(poseAt(file, 'idle', 0).items).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Item 86 — colar em todas as chaves
// ---------------------------------------------------------------------------

describe('colar em todas as chaves', () => {
  it('escreve o valor em toda chave da linha, sem mexer no tempo', () => {
    const doc = testDoc();
    const antesTempos = allKeyTimes(doc.file, 'walk');
    const pose = poseAt(doc.file, 'walk', 0.17);

    doc.run(new EditKeys('walk', 'Colar em todas', (file, name) => {
      expect(pasteToAllKeys(file, name, pose)).toBe(5);
    }));

    // As três chaves de rotação passaram a valer 20.
    for (const t of [0, 0.17, 0.5]) {
      expect(valueAt(doc.file, 'walk', t, rot)).toBeCloseTo(20, 6);
    }
    // E nenhum tempo mudou.
    expect(allKeyTimes(doc.file, 'walk')).toEqual(antesTempos);
  });

  it('desfazer devolve o arquivo', () => {
    const doc = testDoc();
    const antes = texto(doc);
    const pose = poseAt(doc.file, 'walk', 0.17);
    doc.run(new EditKeys('walk', 'Colar em todas', (file, name) => {
      pasteToAllKeys(file, name, pose);
    }));
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('uma linha que não existe na animação de destino é ignorada', () => {
    const doc = testDoc();
    const pose = poseAt(doc.file, 'walk', 0.17);
    doc.run(new EditKeys('idle', 'Colar em todas', (file, name) => {
      // `idle` só tem a rotação: uma chave escrita, e não duas.
      expect(pasteToAllKeys(file, name, pose)).toBe(1);
    }));
  });
});

// ---------------------------------------------------------------------------
// Item 87 e 88 — apagar linhas, limpar a animação
// ---------------------------------------------------------------------------

describe('apagar linhas do tempo', () => {
  it('tira a linha inteira, e as outras ficam', () => {
    const doc = testDoc();
    doc.run(new EditKeys('walk', 'Apagar linhas', (file, name) => {
      expect(removeTimelines(file, name, [rot])).toBe(1);
    }));
    expect(valueAt(doc.file, 'walk', 0, rot)).toBeUndefined();
    expect(valueAt(doc.file, 'walk', 0, posX)).toBeCloseTo(100, 6);
  });

  it('desfazer devolve o arquivo', () => {
    const doc = testDoc();
    const antes = texto(doc);
    doc.run(new EditKeys('walk', 'Apagar linhas', (file, name) => {
      removeTimelines(file, name, [rot, posX]);
    }));
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('limpar a animação tira todas as linhas, e só dela', () => {
    const doc = testDoc();
    doc.run(new EditKeys('walk', 'Limpar', (file, name) => {
      expect(clearAnimation(file, name)).toBe(3);
    }));
    expect(allKeyTimes(doc.file, 'walk')).toEqual([]);
    expect(allKeyTimes(doc.file, 'idle')).toEqual([0]);
  });

  it('uma animação que não existe não quebra', () => {
    const file = testFile();
    expect(clearAnimation(file, 'nao-existe')).toBe(0);
    expect(removeTimelines(file, 'nao-existe', [rot])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Item 89 — empurrar as seguintes
// ---------------------------------------------------------------------------

describe('mover empurrando as seguintes', () => {
  it('mover 0,17 por +0,1 leva 0,5 junto, e 0 fica', () => {
    const doc = testDoc();
    doc.run(new EditKeys('walk', 'Ripple', (file, name) => {
      rippleMove(file, name, [{ target: rot, time: 0.17 }], 0.1);
    }));
    // A linha da rotação foi de [0, 0.17, 0.5] para [0, 0.27, 0.6].
    const rotTimes = ((doc.file.animations ?? [])[0].timelines ?? [])
      .filter((t) => (t as { property?: string }).property === 'rotation')
      .flatMap((t) => ((t as { keys?: Array<{ time: number }> }).keys ?? []).map((k) => k.time));
    expect(rotTimes).toEqual([0, 0.27, 0.6]);

    // O 0,17 continua existindo na animação — mas é o do EVENTO, que não estava
    // na seleção. Empurrar linha que ninguém escolheu seria mexer no que não
    // foi pedido.
    expect(allKeyTimes(doc.file, 'walk')).toContain(0.17);
  });

  it('só as linhas escolhidas são empurradas', () => {
    const doc = testDoc();
    doc.run(new EditKeys('walk', 'Ripple', (file, name) => {
      rippleMove(file, name, [{ target: rot, time: 0.17 }], 0.1);
    }));
    // A linha de `x` não estava na seleção: as chaves dela não andaram.
    expect(valueAt(doc.file, 'walk', 0.5, posX)).toBeCloseTo(120, 6);
  });

  it('para a esquerda também funciona, sem duas chaves brigarem pelo lugar', () => {
    const doc = testDoc();
    doc.run(new EditKeys('walk', 'Ripple', (file, name) => {
      rippleMove(file, name, [{ target: rot, time: 0.17 }], -0.07);
    }));
    const times = allKeyTimes(doc.file, 'walk');
    expect(times).toContain(0.1);
    expect(times).toContain(0.43);
  });

  it('desfazer devolve o arquivo', () => {
    const doc = testDoc();
    const antes = texto(doc);
    doc.run(new EditKeys('walk', 'Ripple', (file, name) => {
      rippleMove(file, name, [{ target: rot, time: 0.17 }], 0.1);
    }));
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('sem chave escolhida, não faz nada', () => {
    const file = testFile();
    expect(rippleMove(file, 'walk', [], 0.1)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Item 8 — limpar chaves repetidas
// ---------------------------------------------------------------------------

describe('limpar chaves repetidas (item 8)', () => {
  /** Uma animação `walk` com uma linha só, a rotação do `braco`. */
  function rotFile(keys: ReadonlyArray<{ time: number; value: number; curve?: 'stepped' }>): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'braco', parent: 'root' }],
      animations: [{
        name: 'walk',
        duration: 1,
        timelines: [{ type: 'bone', target: 'braco', property: 'rotation', keys }],
      }],
    } as BoneFile;
  }

  it('tira a chave do meio quando a de antes e a de depois já têm o mesmo valor', () => {
    const file = rotFile([
      { time: 0, value: 0 }, { time: 0.2, value: 10 }, { time: 0.4, value: 10 },
      { time: 0.6, value: 10 }, { time: 0.8, value: 20 },
    ]);
    const report = cleanRepeatedKeys(file, 'walk', [rot]);
    expect(report).toEqual({ removed: 1, edges: 0 });
    expect(allKeyTimes(file, 'walk')).toEqual([0, 0.2, 0.6, 0.8]);
    // O valor em 0,4 continua o mesmo de antes: 10.
    expect(valueAt(file, 'walk', 0.4, rot)).toBeCloseTo(10, 6);
  });

  it('um patamar de só duas chaves iguais não mexe em nada — tirar uma ponta mudaria o tempo', () => {
    const file = rotFile([{ time: 0, value: 0 }, { time: 0.2, value: 10 }, { time: 0.4, value: 20 }]);
    expect(cleanRepeatedKeys(file, 'walk', [rot])).toEqual({ removed: 0, edges: 0 });
    expect(allKeyTimes(file, 'walk')).toEqual([0, 0.2, 0.4]);
  });

  it('tira a primeira chave quando ela já vale o mesmo que a seguinte, e conta como ponta', () => {
    const file = rotFile([{ time: 0, value: 10 }, { time: 0.2, value: 10 }, { time: 0.4, value: 20 }]);
    const report = cleanRepeatedKeys(file, 'walk', [rot]);
    expect(report).toEqual({ removed: 1, edges: 1 });
    expect(allKeyTimes(file, 'walk')).toEqual([0.2, 0.4]);
    // Antes e depois: em 0, o valor continua 10.
    expect(valueAt(file, 'walk', 0, rot)).toBeCloseTo(10, 6);
  });

  it('tira a última chave quando ela já vale o mesmo que a anterior, e conta como ponta', () => {
    const file = rotFile([{ time: 0, value: 0 }, { time: 0.2, value: 10 }, { time: 0.4, value: 10 }]);
    const report = cleanRepeatedKeys(file, 'walk', [rot]);
    expect(report).toEqual({ removed: 1, edges: 1 });
    expect(allKeyTimes(file, 'walk')).toEqual([0, 0.2]);
  });

  it('uma linha toda constante encolhe até UMA chave, nunca até zero', () => {
    const file = rotFile([
      { time: 0, value: 5 }, { time: 0.2, value: 5 }, { time: 0.4, value: 5 }, { time: 0.6, value: 5 },
    ]);
    const report = cleanRepeatedKeys(file, 'walk', [rot]);
    expect(report.removed).toBe(3);
    expect(allKeyTimes(file, 'walk')).toEqual([0.6]);
  });

  it('a chave que RECEBE um degrau parado nunca sai, mesmo com o mesmo valor', () => {
    // 0 é 'stepped' (segura o valor até 0,2): 0,2 recebe esse degrau, e fica,
    // mesmo valendo o mesmo. O fim (0,4) é outro valor, então não entra em
    // jogo — o teste é só sobre a chave que recebe o degrau.
    const file = rotFile([
      { time: 0, value: 5, curve: 'stepped' }, { time: 0.2, value: 5 }, { time: 0.4, value: 20 },
    ]);
    expect(cleanRepeatedKeys(file, 'walk', [rot])).toEqual({ removed: 0, edges: 0 });
    expect(allKeyTimes(file, 'walk')).toEqual([0, 0.2, 0.4]);
  });

  it('a própria chave `stepped` fica, e a que ela alimenta também — mesmo no meio de um valor repetido', () => {
    // Cinco chaves, todas as três do meio valendo 5: sem a marca `stepped`,
    // a de 0,4 e a de 0,6 seriam candidatas (vizinhas iguais). Com 0,4
    // marcada, nem ela nem a de 0,6 (que recebe o degrau dela) saem.
    const file = rotFile([
      { time: 0, value: 0 }, { time: 0.2, value: 5 }, { time: 0.4, value: 5, curve: 'stepped' },
      { time: 0.6, value: 5 }, { time: 0.8, value: 20 },
    ]);
    expect(cleanRepeatedKeys(file, 'walk', [rot])).toEqual({ removed: 0, edges: 0 });
    expect(allKeyTimes(file, 'walk')).toEqual([0, 0.2, 0.4, 0.6, 0.8]);
  });

  it('linha não numérica (attachment) nunca entra, por mais repetida que esteja', () => {
    const file: BoneFile = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'rosto', bone: 'root', attachment: 'feliz' }],
      animations: [{
        name: 'walk',
        duration: 1,
        timelines: [{
          type: 'slot', target: 'rosto', property: 'attachment',
          keys: [{ time: 0, value: 'feliz' }, { time: 0.2, value: 'feliz' }, { time: 0.4, value: 'feliz' }],
        }],
      }],
    } as BoneFile;
    const alvo = { type: 'slot' as const, target: 'rosto', property: 'attachment' };
    expect(cleanRepeatedKeys(file, 'walk', [alvo])).toEqual({ removed: 0, edges: 0 });
    expect(allKeyTimes(file, 'walk')).toEqual([0, 0.2, 0.4]);
  });

  it('sem `targets`, limpa a animação inteira; com `targets`, só as linhas pedidas', () => {
    const file: BoneFile = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'braco', parent: 'root' }],
      animations: [{
        name: 'walk',
        duration: 1,
        timelines: [
          {
            type: 'bone', target: 'braco', property: 'rotation',
            keys: [
              { time: 0, value: 0 }, { time: 0.2, value: 10 }, { time: 0.4, value: 10 },
              { time: 0.6, value: 10 }, { time: 0.8, value: 20 },
            ],
          },
          {
            type: 'bone', target: 'braco', property: 'x',
            keys: [
              { time: 0, value: 0 }, { time: 0.2, value: 5 }, { time: 0.4, value: 5 },
              { time: 0.6, value: 5 }, { time: 0.8, value: 20 },
            ],
          },
        ],
      }],
    } as BoneFile;

    const soRotacao = cleanRepeatedKeys(file, 'walk', [rot]);
    expect(soRotacao.removed).toBe(1);
    // A linha de x nem foi tocada: o tempo 0,4 continua na animação, porque
    // a chave dela ali ainda existe (só a da rotação saiu).
    expect(allKeyTimes(file, 'walk')).toContain(0.4);

    const restoInteiro = cleanRepeatedKeys(file, 'walk');
    expect(restoInteiro.removed).toBe(1); // só a linha de x, que ainda tinha o que tirar
  });

  it('um comando só, e desfazer devolve o arquivo inteiro', () => {
    const file = rotFile([
      { time: 0, value: 0 }, { time: 0.2, value: 10 }, { time: 0.4, value: 10 },
      { time: 0.6, value: 10 }, { time: 0.8, value: 20 },
    ]);
    const doc = new Doc(file);
    const antes = texto(doc);
    doc.run(new EditKeys('walk', 'Limpar chaves repetidas', (f, name) => {
      cleanRepeatedKeys(f, name, [rot]);
    }));
    expect(allKeyTimes(doc.file, 'walk')).toEqual([0, 0.2, 0.6, 0.8]);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// No arquivo de verdade
// ---------------------------------------------------------------------------

describe('no herói', () => {
  it('a pose do `walk` no meio tem um valor por linha animada', () => {
    const file = JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
    const pose = poseAt(file, 'walk', 0.33);
    expect(pose.items.length).toBeGreaterThan(10);
    for (const item of pose.items) {
      expect(item.key.value).toBeDefined();
      expect(item.offset).toBe(0);
    }
  });

  it('colar a pose do `walk` no `idle` não muda o `walk`', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    const antesWalk = JSON.stringify(
      (doc.file.animations ?? []).find((a) => a.name === 'walk'),
    );
    const pose = poseAt(doc.file, 'walk', 0.33);
    doc.run(new EditKeys('idle', 'Colar pose', (file, name) => {
      pasteKeys(file, name, pose, 0);
    }));
    expect(JSON.stringify(
      (doc.file.animations ?? []).find((a) => a.name === 'walk'),
    )).toBe(antesWalk);
  });
});
});

// ---------------------------------------------------------------------------
// linha limpa (lote 14) — era `lote14-linha-limpa.test.ts`
// ---------------------------------------------------------------------------

describe('linha limpa (lote 14)', () => {
/**
 * Lote 14 (v3.6): a linha do tempo nasce FECHADA, e o botão Detalhes abre.
 *
 * Sem DOM. O que se prova aqui é a CONTA: quanto a faixa mede fechada, quanto
 * ela mede aberta, o que a folha desenha em cada caso, e que abrir e fechar de
 * novo devolve exatamente o estado de antes.
 *
 * O pedido do Humberto, com a tela do Spriter aberta ao lado da nossa:
 * *"a linha do tempo mostra só a linha principal, e só mostra os detalhes
 * quando você clica para mostrar os detalhes"*.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const HEROI = JSON.parse(readFileSync(EXAMPLE, 'utf8')) as BoneFile;

function state(patch: Partial<MenuState> = {}): MenuState {
  return {
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
    ...patch,
  };
}

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

beforeEach(() => {
  resetDockState();
});

// ---------------------------------------------------------------------------
// De fábrica: fechada
// ---------------------------------------------------------------------------

describe('a faixa de baixo nasce fechada', () => {
  it('de fábrica ela está fechada, com a altura de abertura guardada', () => {
    const s = defaultDockState();
    expect(s.open).toBe(false);
    expect(s.height).toBe(DEFAULT_OPEN_HEIGHT);
  });

  it('um arquivo sem nada gravado abre com a faixa fechada', () => {
    expect(parseDockState(undefined).open).toBe(false);
    expect(parseDockState({}).open).toBe(false);
    expect(parseDockState(null).open).toBe(false);
  });

  it('lê o que estava gravado, e conserta o que vier torto', () => {
    expect(parseDockState({ open: true, height: 320 })).toEqual({ open: true, height: 320 });
    // Valor de outro tipo vira o padrão daquele campo; nada estoura.
    expect(parseDockState({ open: 'sim', height: 'alta' })).toEqual(defaultDockState());
    // Altura menor que o mínimo sobe para o mínimo: uma faixa de 40px aberta
    // não mostra linha nenhuma, e seria uma faixa aberta com cara de quebrada.
    expect(parseDockState({ open: true, height: 40 }).height).toBe(OPEN_MIN);
  });

  it('a arrumação da faixa mora ao lado da coluna, dentro do arquivo', () => {
    expect(DOCK_STATE_KEY).toBe('dock');
  });
});

// ---------------------------------------------------------------------------
// A altura
// ---------------------------------------------------------------------------

describe('quanto a faixa mede', () => {
  it('fechada mede sempre o mesmo, não importa quantas linhas a animação tem', () => {
    const fechada = { open: false, height: 400 };
    expect(dockHeightFor(fechada, 0)).toBe(CLOSED_HEIGHT);
    expect(dockHeightFor(fechada, 30)).toBe(CLOSED_HEIGHT);
    expect(dockHeightFor(fechada, 300)).toBe(CLOSED_HEIGHT);
  });

  it('aberta nunca fica abaixo do mínimo', () => {
    expect(dockHeightFor({ open: true, height: 100 }, 30)).toBe(OPEN_MIN);
    expect(dockHeightFor({ open: true, height: 400 }, 30)).toBe(400);
  });

  it('a faixa fechada é bem menor que a aberta — que é o ponto do lote', () => {
    expect(CLOSED_HEIGHT).toBeLessThan(OPEN_MIN);
    // Mais de 100px de desenho a mais, em toda janela.
    expect(OPEN_MIN - CLOSED_HEIGHT).toBeGreaterThanOrEqual(100);
  });

  it('guardar a altura respeita o mínimo e aguenta um número quebrado', () => {
    expect(setDockHeight(defaultDockState(), 500).height).toBe(500);
    expect(setDockHeight(defaultDockState(), 10).height).toBe(OPEN_MIN);
    expect(setDockHeight(defaultDockState(), Number.NaN).height).toBe(DEFAULT_OPEN_HEIGHT);
  });
});

// ---------------------------------------------------------------------------
// Abrir e fechar
// ---------------------------------------------------------------------------

describe('abrir e fechar', () => {
  it('abrir e fechar de novo devolve o estado de antes, com a altura inteira', () => {
    const antes = { open: false, height: 377 };
    const aberta = toggleDock(antes);
    expect(aberta.open).toBe(true);
    expect(aberta.height).toBe(377);
    const depois = toggleDock(aberta);
    expect(depois).toEqual(antes);
  });

  it('puxar a alça para cima abre; empurrar para baixo fecha', () => {
    const fechada = defaultDockState();
    // Um tremor de alguns pixels não abre a faixa sem querer.
    expect(dockFromDrag(fechada, CLOSED_HEIGHT + 3).open).toBe(false);
    // Anotação 4: fechada, ela só abre com a alça puxada até `OPEN_MIN`. Os
    // 40px de `OPEN_AT` eram folga de esbarrão, e a faixa abria sozinha.
    expect(dockFromDrag(fechada, OPEN_AT + 1).open).toBe(false);
    expect(dockFromDrag(fechada, CLOSED_HEIGHT + 100).open).toBe(false);
    expect(dockFromDrag(fechada, OPEN_MIN - 1).open).toBe(false);
    expect(dockFromDrag(fechada, OPEN_MIN).open).toBe(true);
    expect(dockFromDrag(fechada, OPEN_MIN + 200).height).toBe(OPEN_MIN + 200);

    const aberta = { open: true, height: 400 };
    // Aberta, fechar continua sendo perto do chão: aí o gesto é claro.
    expect(dockFromDrag(aberta, CLOSED_HEIGHT + 10).open).toBe(false);
    expect(dockFromDrag(aberta, OPEN_AT + 1).open).toBe(true);
    // Fechar pela alça também não perde a altura de aberta.
    expect(dockFromDrag(aberta, CLOSED_HEIGHT + 10).height).toBe(400);
  });

  it('o estado em uso avisa quem desenha, e volta ao padrão no reset', () => {
    const vistos: boolean[] = [];
    const parar = onDockChange((s) => vistos.push(s.open));
    setDockState({ open: true, height: 300 });
    expect(dockState().open).toBe(true);
    resetDockState();
    expect(dockState().open).toBe(false);
    parar();
    setDockState({ open: true, height: 300 });
    expect(vistos).toEqual([true, false]);
    resetDockState();
  });
});

// ---------------------------------------------------------------------------
// O que a folha desenha
// ---------------------------------------------------------------------------

describe('o que a folha desenha', () => {
  it('o herói tem grupos para desenhar quando a faixa está aberta', () => {
    const grupos = dopesheetGroups(HEROI, 'walk', null);
    expect(grupos.length).toBeGreaterThan(0);
    expect(visibleGroups(true, grupos)).toBe(grupos);
  });

  it('fechada, nenhuma linha por alvo é desenhada — só o Resumo, que é do cabeçalho', () => {
    const grupos = dopesheetGroups(HEROI, 'walk', null);
    expect(visibleGroups(false, grupos)).toEqual([]);
    const linhas = visibleGroups(false, grupos)
      .reduce((total, grupo) => total + grupo.rows.length, 0);
    expect(linhas).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// O botão Detalhes
// ---------------------------------------------------------------------------

describe('o botão Detalhes', () => {
  it('a dica diz o que vai aparecer, e muda com o estado', () => {
    const fechado = detailsButton(false);
    expect(fechado.label).toBe('Detalhes');
    expect(fechado.expanded).toBe(false);
    expect(fechado.hint).toContain('Detalhes');
    expect(fechado.hint).toContain('osso');

    const aberto = detailsButton(true);
    expect(aberto.label).toBe('Detalhes');
    expect(aberto.expanded).toBe(true);
    expect(aberto.hint).toContain('Detalhes');
    expect(aberto.hint).not.toBe(fechado.hint);
  });

  it('o `aria-expanded` acompanha aberta ou fechada', () => {
    expect(String(detailsButton(false).expanded)).toBe('false');
    expect(String(detailsButton(true).expanded)).toBe('true');
  });
});


// ---------------------------------------------------------------------------
// Degrau 6 — as três teclas da seleção de chaves (G2) e o arrasto (G11)
// ---------------------------------------------------------------------------

describe('as três teclas da seleção de chaves — G2, degrau 6', () => {
/**
 * 17/09/2026. A ordem do Humberto: *"Ctrl mais clique soma, Ctrl mais arrastar
 * clona, o Shift sai da seleção"*. Até aqui era o contrário — `Shift` somava,
 * `Ctrl` tirava —, e a pesquisa da casa (`O QUE O SPRITER TEM E NOS FALTA`,
 * 14/09, linha 84) já tinha anotado a divergência: no Spriter é `Ctrl` que
 * pega vários (manual, cap. 11 *Editing Timing*).
 *
 * A decisão é pura e mora em `panels/dopesheet-model.ts`, por isto: sem jsdom,
 * o ponteiro não se testa, mas a regra que ele obedece se testa inteira.
 */
  it('Ctrl soma, Shift tira, sem tecla troca', () => {
    expect(selectionModeOf({ ctrlKey: true, shiftKey: false })).toBe('somar');
    expect(selectionModeOf({ ctrlKey: false, shiftKey: true })).toBe('tirar');
    expect(selectionModeOf({ ctrlKey: false, shiftKey: false })).toBe('trocar');
  });

  it('com as duas apertadas, Ctrl manda — é dele o gesto que continua', () => {
    expect(selectionModeOf({ ctrlKey: true, shiftKey: true })).toBe('somar');
  });

  it('tirar não começa arrasto: soltar não é pegar', () => {
    expect(startsKeyDrag('tirar')).toBe(false);
    expect(startsKeyDrag('somar')).toBe(true);
    expect(startsKeyDrag('trocar')).toBe(true);
  });

  it('só o Ctrl clona ao arrastar — item 6', () => {
    expect(clonesOnDrag('somar')).toBe(true);
    expect(clonesOnDrag('trocar')).toBe(false);
    expect(clonesOnDrag('tirar')).toBe(false);
  });

  it('a dica do losango diz os três gestos, e o que o arrasto leva', () => {
    // Regra 21: o que o arrasto leva não pode ser adivinhação. Com várias
    // chaves escolhidas ele leva todas, e antes do degrau 6 nada dizia isso.
    expect(KEY_HINT).toContain('Arrastar move as escolhidas');
    expect(KEY_HINT).toContain('Ctrl soma');
    expect(KEY_HINT).toContain('Shift tira');
    expect(KEY_HINT).toContain('clona');
  });
});

describe('arrastar chave: move as escolhidas, e nunca empurra as seguintes — G11', () => {
/**
 * **Conferido no Spriter antes**, como o Humberto mandou. Manual, cap. 11:
 * *"arrastar quadro-chave; Ctrl para pegar vários"* — as várias andam juntas,
 * e **não existe modo `ripple` em lugar nenhum do manual dele**.
 *
 * O Recorte também nunca empurrou pelo arrasto: a `rippleMove` só tem porta
 * por comando (**Animação → Empurrar as chaves…**, v13.1). Estes testes
 * fecham essa porta por escrito, para quem vier depois não "consertar" o que
 * está certo.
 */
  /** Um arquivo com UMA linha de três chaves: 0 · 0,3 · 0,6. */
  function tresChaves(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'hips', parent: 'root' }],
      animations: [{
        name: 'walk',
        duration: 1,
        timelines: [{
          type: 'bone', target: 'hips', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.3, value: 10 }, { time: 0.6, value: 20 }],
        }],
      }],
    } as BoneFile;
  }

  const alvo = { type: 'bone', target: 'hips', property: 'rotation' } as const;
  const tempos = (file: BoneFile): number[] =>
    allKeyRefs(file, 'walk').filter((r) => r.target.target === 'hips').map((r) => r.time);

  it('uma chave escolhida anda sozinha: as de depois ficam onde estavam', () => {
    const file = tresChaves();
    moveKeys(file, 'walk', [{ target: alvo, time: 0.3 }], 0.1);
    expect(tempos(file)).toEqual([0, 0.4, 0.6]);
  });

  it('duas escolhidas andam juntas, e a terceira não se mexe', () => {
    const file = tresChaves();
    moveKeys(file, 'walk', [{ target: alvo, time: 0 }, { target: alvo, time: 0.3 }], 0.1);
    expect(tempos(file)).toEqual([0.1, 0.4, 0.6]);
  });

  it('empurrar as seguintes é OUTRO comando, e é ele que muda a terceira', () => {
    // A diferença entre os dois, lado a lado: o arrasto (`moveKeys`) deixa a
    // chave de 0,6 quieta; "Empurrar as chaves…" (`rippleMove`) a leva junto.
    const arrastado = tresChaves();
    moveKeys(arrastado, 'walk', [{ target: alvo, time: 0.3 }], 0.1);
    expect(tempos(arrastado)).toEqual([0, 0.4, 0.6]);

    const empurrado = tresChaves();
    rippleMove(empurrado, 'walk', [{ target: alvo, time: 0.3 }], 0.1);
    expect(tempos(empurrado)).toEqual([0, 0.4, 0.7]);
  });

  it('o Ctrl clona: os originais ficam parados e as cópias nascem adiante', () => {
    const file = tresChaves();
    const nascidas = cloneKeys(file, 'walk', [{ target: alvo, time: 0 }, { target: alvo, time: 0.3 }], 0.1);
    expect(tempos(file)).toEqual([0, 0.1, 0.3, 0.4, 0.6]);
    expect(nascidas.map((r) => r.time)).toEqual([0.1, 0.4]);
    // As cópias é que ficam escolhidas, pelo `keyRefKey` que o painel guarda.
    expect(nascidas.map(keyRefKey)).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// Nada some: o menu continua com tudo
// ---------------------------------------------------------------------------

describe('nada some da vista sem ter onde voltar', () => {
  it('o menu Janela tem a segunda porta do botão Detalhes', () => {
    const janela = menus().find((g) => g.label === 'Janela');
    expect(janela).toBeDefined();
    const acoes = flatEntries(janela?.entries ?? []).map((e) => e.action);
    expect(acoes).toContain('detalhes-faixa');
  });

  it('as abas da faixa continuam existindo; fechada mostra a Linha do tempo', () => {
    // Duas desde o lote 25: a Prévia voltou para a coluna — anotação 5.
    expect(DOCK_PANELS).toEqual(['linha-do-tempo', 'curvas']);
    expect(DOCK_PANELS[0]).toBe('linha-do-tempo');
  });
});
});

// ---------------------------------------------------------------------------
// K15 — a troca de animação da entidade vale DAQUELE tempo em diante (chat D, 2a)
// ---------------------------------------------------------------------------

describe('K15: a entidade guarda o que tocava antes da primeira troca', () => {
  it('pelo anexo: o nome que o anexo pede; nenhum, nenhum', () => {
    expect(entityStartValue({ animation: 'girar', inheritAnimation: false }, 'andar', null)).toEqual({ value: 'girar' });
    expect(entityStartValue({ animation: null, inheritAnimation: false }, 'andar', null)).toEqual({ value: null });
  });

  it('pelo pai: o nome DESTA animação, se o filho a tem; se não tem, cai no anexo', () => {
    expect(entityStartValue({ animation: null, inheritAnimation: true }, 'andar', ['andar', 'parar'])).toEqual({ value: 'andar' });
    expect(entityStartValue({ animation: 'parar', inheritAnimation: true }, 'correr', ['andar', 'parar'])).toEqual({ value: 'parar' });
  });

  it('pelo pai, sem o filho aberto: não se sabe, e não inventa (regra 21)', () => {
    expect(entityStartValue({ animation: 'parar', inheritAnimation: true }, 'andar', null)).toBeNull();
  });

  it('a linha do tempo grava o começo ANTES da troca, no mesmo passo', () => {
    // Rodada 6 (05/10/2026): a conta saiu do painel para `dopesheet-actions.ts`
    // (`setEntityAnimationAt`), e o menu Entidades chama a mesma. O painel só
    // a chama — e isso também se confere.
    const painel = readFileSync(resolve(__dirname, '../src/panels/dopesheet.ts'), 'utf8');
    const metodo = painel.slice(painel.indexOf('private setEntityAnimation'), painel.indexOf('private setEntityAnimation') + 600);
    expect(metodo).toContain('setEntityAnimationAt(doc, entity, animation)');
    const fonte = readFileSync(resolve(__dirname, '../src/panels/dopesheet-actions.ts'), 'utf8');
    const trecho = fonte.slice(fonte.indexOf('export function setEntityAnimationAt'), fonte.indexOf('export function setEntityAnimationAt') + 1400);
    expect(trecho).toContain('entityStartValue(');
    expect(trecho.indexOf('setKey(file, name, 0, alvo, inicio.value)')).toBeGreaterThan(0);
    expect(trecho.indexOf('setKey(file, name, 0, alvo, inicio.value)'))
      .toBeLessThan(trecho.indexOf('setKey(file, name, time, alvo, animation)'));
  });
});

// ---------------------------------------------------------------------------
// G1 e P9 — o botão direito no losango, e a virada que sai pelo dono dela
// ---------------------------------------------------------------------------

describe('o menu do losango: o apagar à vista, e a virada sem curva (G1, P9)', () => {
  it('uma chave comum: as curvas e "Apagar chave"; várias: "Apagar as N chaves"', () => {
    expect(keyMenuPlan([{ type: 'bone' }])).toMatchObject({ curves: true, remove: { label: 'Apagar chave' } });
    expect(keyMenuPlan([{ type: 'bone' }, { type: 'slot' }, { type: 'body' }]).remove.label).toBe('Apagar as 3 chaves');
  });

  it('só virada de corpo: sem curvas (ela só aceita "parada"), e o item diz o que sai', () => {
    expect(keyMenuPlan([{ type: 'body' }])).toMatchObject({ curves: false, remove: { label: 'Tirar a virada de base' } });
  });

  it('o Delete tira a virada pelo removeBodyKey, e o rodapé diz qual e quando', () => {
    const file = JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
    const anim = file.animations![0]!.name;
    setBodyKey(file, anim, 0.5, 'personagens/lobisomem.bone');
    const ref = { target: { type: 'body' } as const, time: 0.5 };
    expect(bodyRemovalNotice(file, anim, [ref])).toBe('Tirada a virada para lobisomem, em 0,50 s');
    expect(removeKeyRef(file, anim, ref)).toBe(true);
    expect(bodyKeys(file, anim)).toEqual([]);
    expect(JSON.stringify(file.animations![0])).not.toContain('"body"');
  });

  it('as três portas de apagar passam pelo removeKeyRef, e o Resumo abre o mesmo menu', () => {
    const ler = (nome: string): string => readFileSync(resolve(__dirname, '../src/panels', nome), 'utf8');
    expect(ler('dopesheet-edit.ts')).toContain('removeKeyRef(file, animation, ref)');
    expect(ler('dopesheet.ts')).toContain('removeKeyRef(file, name, ref)');
    expect(ler('dopesheet-player.ts')).toContain('panel.openKeyMenu(refs[0]!, event.clientX, event.clientY)');
  });
});

// ---------------------------------------------------------------------------
// K5 — colar espelhado no herói, e o rodapé que diz quem ficou sem par
// ---------------------------------------------------------------------------

describe('K5: colar a pose espelhada funciona no herói e diz o que fez', () => {
  const heroi = JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
  const present = new Set([...(heroi.bones ?? []).map((b) => b.name), ...(heroi.slots ?? []).map((s) => s.name)]);
  const rules = parseMirrorRules(DEFAULT_MIRROR_RULES);
  const item = (type: string, target: string, property: string) => ({ target: { type, target, property }, offset: 0, value: 1 }) as never;

  it('as pernas trocam de lado — ossos (leg/leg_b) e desenhos (leg_front/leg_back)', () => {
    const clip = { base: 0, items: [item('bone', 'leg', 'rotation'), item('bone', 'shin_b', 'rotation'), item('slot', 'leg_front', 'color')] };
    const r = mirrorClipboardIn(clip as never, rules, present);
    expect(r.clipboard.items.map((i: { target: { target?: string } }) => i.target.target)).toEqual(['leg_b', 'shin', 'leg_back']);
    expect([r.swapped, r.unpaired]).toEqual([3, []]);
  });

  it('quem não tem par cola igual, e NÃO vira um nome inventado (torso não vira torso_b)', () => {
    const clip = { base: 0, items: [item('bone', 'torso', 'rotation'), item('bone', 'arm', 'rotation')] };
    const r = mirrorClipboardIn(clip as never, rules, present);
    expect(r.clipboard.items.map((i: { target: { target?: string } }) => i.target.target)).toEqual(['torso', 'arm_b']);
    expect(r.unpaired).toEqual(['torso']);
  });

  it('o rodapé diz o que trocou, quem ficou sem par e o que procurou', () => {
    expect(mirroredPasteNotice(2, ['torso'], rules))
      .toBe('Colado espelhado: 2 valores trocados de lado. Sem par, colados iguais: torso. Procurei _e/_d, _l/_r, _esq/_dir, _front/_back, /_b');
    expect(mirroredPasteNotice(0, ['torso'], rules)).toContain('Nenhum par de nome achado');
  });
});

describe('I-O4: a lista da cebola abre inteira, para o lado que tem espaço', () => {
  it('no pé da tela (a linha do tempo): abre PARA CIMA, com a altura que sobra em cima', () => {
    const lugar = popupPlacement({ left: 20, top: 780, bottom: 806 }, 1440, 900);
    expect(lugar.top).toBeUndefined();
    expect(lugar.bottom).toBe(900 - 780 + 4);
    expect(lugar.maxHeight).toBe(780 - 8 - 4);
  });

  it('no alto da tela: abre para baixo; e nunca sai pela direita', () => {
    const lugar = popupPlacement({ left: 1400, top: 100, bottom: 126 }, 1440, 900);
    expect(lugar.top).toBe(130);
    expect(lugar.left).toBe(1440 - 280 - 8);
  });

  it('a lista é presa à janela, e não à folha que rola', () => {
    const css = readFileSync(resolve(__dirname, '../src/panels/dopesheet.css'), 'utf8');
    const bloco = css.slice(css.indexOf('.dope-cebola-lista {'), css.indexOf('}', css.indexOf('.dope-cebola-lista {')));
    expect(bloco).toContain('position: fixed;');
  });
});

// ---------------------------------------------------------------------------
// Rodada 8c, C13 e C14: puxar a ponta e arrastar a faixa da entidade
// ---------------------------------------------------------------------------

describe('a faixa de verdade: puxar a ponta e arrastar (rodada 8c, C13 e C14)', () => {
  type Chave = { time: number; value?: unknown; curve?: unknown };
  function arquivo(chaves: Chave[] | null, extra: Record<string, unknown>[] = []): Record<string, unknown> {
    const timelines: Record<string, unknown>[] = [...extra];
    if (chaves !== null) timelines.push({ type: 'slot', target: 'mao', property: 'attachment', keys: chaves });
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'mao', bone: 'root', ...(chaves === null ? { attachment: 'espada' } : {}) }],
      skins: [{ name: 'default', attachments: { mao: { espada: { type: 'skeleton', uri: 'espada.bone' } } } }],
      animations: [{ name: 'anda', duration: 1, timelines }],
    };
  }
  const ent = (file: unknown) => entitySlotsFaixa(file as never)[0]!;
  const linha = (file: Record<string, unknown>, tipo: string, prop: string): Chave[] => {
    const anim = (file['animations'] as Array<{ timelines: Array<Record<string, unknown>> }>)[0]!;
    const tl = anim.timelines.find((t) => t['type'] === tipo && t['target'] === 'mao' && t['property'] === prop);
    return ((tl?.['keys'] ?? []) as Chave[]).map((k) => ({ ...k }));
  };
  const tempos = (ks: Chave[]) => ks.map((k) => [k.time, k.value]);

  it('C13: uma volta mede duração ÷ velocidade; a ponta mais longe dá mais devagar', () => {
    expect(cycleLengthFaixa(0.6, 1)).toBeCloseTo(0.6, 9);
    expect(cycleLengthFaixa(0.6, 2)).toBeCloseTo(0.3, 9);
    expect(cycleLengthFaixa(null, 1)).toBeNull();
    // Começa em 0,5; a ponta puxada para 1,7 = uma volta de 1,2 s para uma animação de 0,6 s.
    expect(timeScaleForTipFaixa(0.5, 1.7, 0.6)).toBe(0.5);
    expect(timeScaleForTipFaixa(0.5, 0.8, 0.6)).toBe(2);
    // Presa entre os limites; ponta antes do começo não vale.
    expect(timeScaleForTipFaixa(0, 0.001, 0.6)).toBe(20);
    expect(timeScaleForTipFaixa(0.5, 0.4, 0.6)).toBeNull();
  });

  it('C13: a velocidade vai numa chave em degrau no começo da faixa, com o que valia antes em 0', () => {
    const file = arquivo([{ time: 0, value: null }, { time: 0.5, value: 'espada' }]);
    writeBandTimeScaleFaixa(file as never, 'anda', ent(file), 0.5, 0.5);
    expect(linha(file, 'nested', 'timeScale')).toEqual([
      { time: 0, value: 1, curve: 'stepped' }, { time: 0.5, value: 0.5, curve: 'stepped' },
    ]);
    const faixa = entityBandFaixa(file as never, 'anda', ent(file));
    expect(faixa[0]!.timeScale).toBe(0.5);
  });

  it('C14: arrastar para a direita move a entrada e as chaves da faixa juntas', () => {
    const file = arquivo([{ time: 0, value: null }, { time: 0.5, value: 'espada' }], [
      { type: 'nested', target: 'mao', property: 'animation', keys: [{ time: 0, value: null }, { time: 0.5, value: 'brilho' }] },
    ]);
    const run = activeRunsFaixa(file as never, 'anda', 'mao', 'espada')[0]!;
    expect(moveBandRunFaixa(file as never, 'anda', ent(file), run, 0.2, 1 / 30)).toBeCloseTo(0.2, 6);
    expect(tempos(linha(file, 'slot', 'attachment'))).toEqual([[0, null], [0.7, 'espada']]);
    expect(tempos(linha(file, 'nested', 'animation'))).toEqual([[0, null], [0.7, 'brilho']]);
  });

  it('C14: a entidade que vinha da base ganha as duas chaves ao andar para a direita', () => {
    const file = arquivo(null);
    const run = activeRunsFaixa(file as never, 'anda', 'mao', 'espada')[0]!;
    expect(run).toEqual({ from: 0, to: 1 });
    moveBandRunFaixa(file as never, 'anda', ent(file), run, 0.3, 1 / 30);
    expect(tempos(linha(file, 'slot', 'attachment'))).toEqual([[0, null], [0.3, 'espada']]);
  });

  it('C14: para a esquerda até 0, a chave vazia de 0 sai e a entidade entra desde o começo', () => {
    const file = arquivo([{ time: 0, value: null }, { time: 0.5, value: 'espada' }]);
    const run = activeRunsFaixa(file as never, 'anda', 'mao', 'espada')[0]!;
    moveBandRunFaixa(file as never, 'anda', ent(file), run, -0.9, 1 / 30);
    expect(tempos(linha(file, 'slot', 'attachment'))).toEqual([[0, 'espada']]);
  });

  it('C14: não passa da chave de antes, nem leva a saída para fora da animação', () => {
    const file = arquivo([
      { time: 0, value: 'mao_imagem' }, { time: 0.2, value: null }, { time: 0.5, value: 'espada' }, { time: 0.8, value: null },
    ]);
    const run = activeRunsFaixa(file as never, 'anda', 'mao', 'espada')[0]!;
    // Para a esquerda: para um quadro depois da chave de 0,2.
    moveBandRunFaixa(file as never, 'anda', ent(file), run, -0.5, 0.1);
    expect(tempos(linha(file, 'slot', 'attachment'))).toEqual([[0, 'mao_imagem'], [0.2, null], [0.3, 'espada'], [0.6, null]]);
    // Para a direita: a saída para no fim (1,0), e a faixa guarda o tamanho dela.
    const run2 = activeRunsFaixa(file as never, 'anda', 'mao', 'espada')[0]!;
    moveBandRunFaixa(file as never, 'anda', ent(file), run2, 5, 0.1);
    expect(tempos(linha(file, 'slot', 'attachment'))).toEqual([[0, 'mao_imagem'], [0.2, null], [0.7, 'espada'], [1, null]]);
  });

  it('C14: arrastar a faixa é UM passo de Ctrl+Z, e ele devolve o arquivo letra por letra', () => {
    const file = arquivo([{ time: 0, value: null }, { time: 0.5, value: 'espada' }]);
    const doc = new Doc(file as never, { path: 'teste.bone' });
    const texto = JSON.stringify(doc.file);
    const run = activeRunsFaixa(doc.file, 'anda', 'mao', 'espada')[0]!;
    doc.run(new EditKeys('anda', 'Arrastar a faixa da entidade', (f, nome) => {
      moveBandRunFaixa(f, nome, ent(f), run, 0.2, 1 / 30);
    }));
    expect(JSON.stringify(doc.file)).not.toBe(texto);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('a folha liga a ponta e o arrasto na faixa (o desenho chama o modelo)', () => {
    const fonte = readFileSyncFaixa(resolveFaixa(import.meta.dirname, '../src/panels/dopesheet.ts'), 'utf8');
    expect(fonte).toContain('dope-entidade-ponta');
    expect(fonte).toContain('writeBandTimeScale(file, name, entity, segment.from, ts)');
    expect(fonte).toContain('moveBandRun(file, name, entity, run, dt, 1 / fps)');
  });
});

// ---------------------------------------------------------------------------
// Rodada 8c, C15: laço e tamanho, o grude no fim, o aviso da emenda, esticar junto
// ---------------------------------------------------------------------------

describe('o laço da faixa, o grude e a emenda (rodada 8c, C15)', () => {
  function heroiDeTeste(loopAnim: boolean, chaves: Array<{ time: number; value: unknown }> | null): Record<string, unknown> {
    const timelines: Record<string, unknown>[] = [];
    if (chaves !== null) timelines.push({ type: 'nested', target: 'mao', property: 'animation', keys: chaves });
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'mao', bone: 'root', attachment: 'espada' }],
      skins: [{ name: 'default', attachments: { mao: { espada: { type: 'skeleton', uri: 'espada.bone' } } } }],
      animations: [{ name: 'andar', duration: 1, loop: loopAnim, timelines }],
    };
  }
  const ent = (file: unknown) => entitySlotsFaixa(file as never)[0]!;
  const duracoes: Record<string, number> = { brilho: 0.7, ciclo: 0.5 };

  it('soltar a ponta perto de fechar voltas inteiras no fim gruda; longe, fica', () => {
    // Faixa de 0 a 1: uma volta (1,0) e duas voltas (0,5) são os pontos de grude.
    expect(snapTipToEndFaixa(0, 0.97, 1, 1 / 30)).toBeCloseTo(1, 9);
    expect(snapTipToEndFaixa(0, 0.52, 1, 1 / 30)).toBeCloseTo(0.5, 9);
    expect(snapTipToEndFaixa(0, 0.8, 1, 1 / 30)).toBeCloseTo(0.8, 9);
  });

  it('o aviso da emenda diz os dois números e o que fazer (régua 5)', () => {
    const file = heroiDeTeste(true, [{ time: 0, value: 'brilho' }]);
    expect(seamWarningFaixa(file as never, 'andar', ent(file), (n) => duracoes[n] ?? null))
      .toBe('espada dura 0,7 s e andar dura 1 s: ela dá um salto na emenda. Puxe a ponta até o fim');
  });

  it('sem salto não há aviso: voltas inteiras, animação sem laço, ou entidade sem laço', () => {
    const inteiras = heroiDeTeste(true, [{ time: 0, value: 'ciclo' }]);
    expect(seamWarningFaixa(inteiras as never, 'andar', ent(inteiras), (n) => duracoes[n] ?? null)).toBeNull();
    const semLacoNaAnimacao = heroiDeTeste(false, [{ time: 0, value: 'brilho' }]);
    expect(seamWarningFaixa(semLacoNaAnimacao as never, 'andar', ent(semLacoNaAnimacao), (n) => duracoes[n] ?? null)).toBeNull();
    const semLacoNaEntidade = heroiDeTeste(true, [{ time: 0, value: 'brilho' }]);
    ((semLacoNaEntidade['skins'] as Array<{ attachments: Record<string, Record<string, Record<string, unknown>>> }>)[0]!
      .attachments['mao']!['espada']!)['loop'] = false;
    expect(seamWarningFaixa(semLacoNaEntidade as never, 'andar', ent(semLacoNaEntidade), (n) => duracoes[n] ?? null)).toBeNull();
  });

  it('puxar a ponta até o fim tira o aviso: a velocidade que fecha uma volta no fim', () => {
    const file = heroiDeTeste(true, [{ time: 0, value: 'brilho' }]);
    const ts = timeScaleForTipFaixa(0, 1, 0.7)!;
    writeBandTimeScaleFaixa(file as never, 'andar', ent(file), 0, ts);
    expect(seamWarningFaixa(file as never, 'andar', ent(file), (n) => duracoes[n] ?? null)).toBeNull();
  });

  it('Em laço / sem laço é o `loop` do anexo, e o desfazer devolve letra por letra', () => {
    const doc = new Doc(heroiDeTeste(true, null) as never, { path: 'teste.bone' });
    const texto = JSON.stringify(doc.file);
    doc.run(new SetEntityLoopFaixa('mao', 'espada', 'default', false));
    expect(ent(doc.file).loop).toBe(false);
    doc.run(new SetEntityLoopFaixa('mao', 'espada', 'default', true));
    expect(ent(doc.file).loop).toBe(true);
    // `true` é o de fábrica: sai do arquivo.
    expect(JSON.stringify(doc.file)).toBe(texto);
    doc.undo();
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('esticar a animação estica junto a faixa em que se escolheu a animação', () => {
    const file = heroiDeTeste(true, [{ time: 0, value: 'brilho' }]);
    expect(stretchEntityBandsFaixa(file as never, 'andar', 2)).toBe(1);
    expect(entityBandFaixa(file as never, 'andar', ent(file))[0]!.timeScale).toBe(0.5);
    // A que segue o anexo (ninguém escolheu) não estica.
    const semEscolha = heroiDeTeste(true, null);
    expect(stretchEntityBandsFaixa(semEscolha as never, 'andar', 2)).toBe(0);
  });

  it('a folha e a barra ligam o laço, o grude e a emenda', () => {
    const fonte = readFileSyncFaixa(resolveFaixa(import.meta.dirname, '../src/panels/dopesheet.ts'), 'utf8');
    expect(fonte).toContain('dope-entidade-parada');
    expect(fonte).toContain('snapTipToEnd(segment.from');
    expect(fonte).toContain('toggleEntityLoop(doc, entity)');
    const casca = readFileSyncFaixa(resolveFaixa(import.meta.dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('seamWarnings(doc.file, doc.animation');
    const tocador = readFileSyncFaixa(resolveFaixa(import.meta.dirname, '../src/panels/dopesheet-player.ts'), 'utf8');
    expect(tocador).toContain('stretchEntityBands(file, animationName, seconds / old)');
  });
});

// ---------------------------------------------------------------------------
// Rodada 8c, C11: a faixa da entidade à vista sem os Detalhes
// ---------------------------------------------------------------------------

describe('a faixa da entidade com os Detalhes fechados (rodada 8c, C11)', () => {
  it('fechada, a faixa ganha UMA linha quando a animação aberta tem entidade, e só uma', () => {
    const fechada = { ...defaultDockState(), open: false };
    expect(dockHeightFor(fechada, 0)).toBe(CLOSED_HEIGHT);
    expect(dockHeightFor(fechada, 0, true)).toBe(CLOSED_HEIGHT + ENTITY_ROW_HEIGHT_FECHADA);
    expect(ENTITY_ROW_HEIGHT_FECHADA).toBe(35);
    // Aberta, a linha não conta: a altura é a que se guardou.
    const aberta = { open: true, height: 380 };
    expect(dockHeightFor(aberta, 0, true)).toBe(dockHeightFor(aberta, 0, false));
  });

  it('a folha desenha a faixa fechada (a da escolhida, ou a primeira), e a casca mede a linha', () => {
    const folha = readFileSyncFaixa(resolveFaixa(import.meta.dirname, '../src/panels/dopesheet.ts'), 'utf8');
    expect(folha).toContain('else body.append(...this.buildClosedEntityBand())');
    expect(folha).toContain('entidades.find((e) => escolhidos.has(e.slot)) ?? entidades[0]!');
    const casca = readFileSyncFaixa(resolveFaixa(import.meta.dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('dockHeightFor(this.dockView, this.dockRows(), this.dockEntityRow())');
  });
});

describe('rodada 23, defeito 1: o Delete com uma chave escolhida apaga a CHAVE, e não o osso', () => {
  const folhaD1 = (): string => readFileSync(resolve(__dirname, '../src/panels/dopesheet.ts'), 'utf8').replace(/\r\n/g, '\n');

  it('a forma: o clique que escolhe na folha leva o teclado junto (na captura, antes do losango parar o evento)', () => {
    const folha = folhaD1();
    // O losango para o evento, para não selecionar texto no arrasto: é por isso
    // que o foco ficava na Árvore ou na cena, e o Delete apagava o osso.
    expect(readFileSync(resolve(__dirname, '../src/panels/dopesheet-pointer.ts'), 'utf8')).toMatch(/onKeyDownPointer[\s\S]{0,120}event\.preventDefault\(\)/);
    expect(folha).toContain("host.addEventListener('pointerdown', this.takeFocus, true);");
    expect(folha).toContain("this.host?.removeEventListener('pointerdown', this.takeFocus, true);");
    expect(folha).toMatch(/takeFocus = \(event: PointerEvent\): void => \{[\s\S]{0,200}isTyping\(event\.target\)[\s\S]{0,120}host\.focus\(\{ preventScroll: true \}\)/);
  });

  it('com chave escolhida a folha atende; sem nenhuma, o Delete segue para a casca e apaga o escolhido na cena', async () => {
    const { deleteKeyGoesTo } = await import('../src/panels/dopesheet-model.js');
    expect(deleteKeyGoesTo(1)).toBe('chaves');
    expect(deleteKeyGoesTo(7)).toBe('chaves');
    expect(deleteKeyGoesTo(0)).toBe('cena');
    // E a folha não engole a tecla quando não é dela: sai antes do stopPropagation.
    expect(folhaD1()).toMatch(/case 'local:apagar-chaves':\n\s+if \(deleteKeyGoesTo\(this\.selectedRefs\.length\) === 'cena'\) return;/);
  });

  it('a mesma forma no Ctrl+D: com chave escolhida, a folha diz como se duplica, e não duplica o osso', async () => {
    const { DUPLICATE_IN_TIMELINE_NOTICE } = await import('../src/panels/dopesheet-model.js');
    const { TIMELINE_KEYS } = await import('../src/ui/keys.js');
    expect(TIMELINE_KEYS.find((k) => k.key === 'ctrl+d')?.action).toBe('local:duplicar-na-folha');
    expect(DUPLICATE_IN_TIMELINE_NOTICE).toContain('Ctrl+C');
    expect(folhaD1()).toMatch(/case 'local:duplicar-na-folha':\n\s+if \(deleteKeyGoesTo\(this\.selectedRefs\.length\) === 'cena'\) return;\n\s+doc\.notice\(DUPLICATE_IN_TIMELINE_NOTICE\);/);
  });
});

describe('rodada 23, defeito 10: o rodapé da chave diz o nome da linha do tempo, e não o de dentro', () => {
  it('a mão com osso próprio: "Imagem hand: Posição Y", e nunca "de hand_osso"', async () => {
    const { newKeysNotice } = await import('../src/anim/keying.js');
    const { OWN_BONE_FIELD: OWN_BONE_FIELD_D10, ownBoneLabel, slotKindWord } = await import('../src/doc/own-bone.js');
    const file = JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
    // O osso próprio da mão, como a rodada 8d o cria.
    const raiz = file.bones![0]!.name;
    expect(raiz).toBeDefined();
    file.bones!.push({ name: 'hand_osso', parent: 'forearm', extensions: { RECORTE_editor_state: { [OWN_BONE_FIELD_D10]: true } } } as never);
    file.slots!.find((s) => s.name === 'hand')!.bone = 'hand_osso';
    expect(ownBoneLabel(file, 'hand_osso')).toBe('Imagem hand');
    const frase = newKeysNotice([{ target: { type: 'bone', target: 'hand_osso', property: 'y' }, time: 0.5 } as never], file)!;
    expect(frase).toContain('Imagem hand');
    expect(frase).not.toContain('hand_osso');
    expect(slotKindWord(file, 'weapon')).toBe('Entidade');
  });
});

describe('rodada 23, defeitos 11 e 12: a chave do quadro 0 à vista, e a frase da faixa que não anda', () => {
  it('a régua e as faixas têm a mesma folga no começo: a chave do 0 não fica sob os nomes', () => {
    const css = readFileSync(resolve(__dirname, '../src/panels/dopesheet.css'), 'utf8').replace(/\r\n/g, '\n');
    expect(css).toMatch(/\.dope-regua \{[^}]*margin-left: 12px;/);
    expect(css).toMatch(/\.dope-faixa \{[^}]*margin-left: 12px;/);
  });

  it('arrastar a faixa no limite diz para onde ela não vai, e onde se encurta', async () => {
    const { bandLimitNotice } = await import('../src/panels/dopesheet-model.js');
    expect(bandLimitNotice('espada', -0.2)).toContain('já começa o mais cedo que pode');
    expect(bandLimitNotice('espada', 0.2)).toContain('já vai até o fim da animação');
    expect(bandLimitNotice('espada', -0.2)).toContain('puxe a ponta');
  });
});

// ---------------------------------------------------------------------------
// Rodada 40, lote 2 — a folha cabe (doc 39, §2.4)
// ---------------------------------------------------------------------------

import { eventFoldOpen as eventFoldOpen40 } from '../src/anim/event-keys.js';

describe('rodada 40, lote 2: a folha cabe', () => {
  it('o quadro "Chave de evento" nasce FECHADO na Linha do tempo, e lembra quem o abriu', () => {
    // Aberto, ele comia 115 px da faixa em 1920×1080 e sobrava UMA linha de
    // chave (foto `07`). Fechado, é uma linha de título.
    expect(eventFoldOpen40(undefined)).toBe(false);
    expect(eventFoldOpen40(true)).toBe(true);
    expect(eventFoldOpen40(false)).toBe(false);
  });

  it('o estilo da folha não volta a engordar a barra, o título do grupo e o quadro de evento', () => {
    const css = readFileSync(resolve(__dirname, '../src/panels/dopesheet.css'), 'utf8');
    const regra = (seletor: string): string => {
      const i = css.indexOf(`${seletor} {`);
      expect(i, seletor).toBeGreaterThanOrEqual(0);
      return css.slice(i, css.indexOf('}', i));
    };
    // As alturas medidas no Chrome em 06/10 (doc 39): barra 58 px, grupo 38 px.
    expect(regra('.dope-barra')).toContain('padding: 3px 10px');
    expect(regra('.dope-barra .dope-botao')).toContain('min-height: 28px');
    expect(regra('.dope-grupo')).toContain('padding: 2px 10px');
    expect(regra('.dope-eventos')).toContain('padding: 2px 10px');
  });
});

// ---------------------------------------------------------------------------
// Rodada 40, lote 3 — Ctrl e Shift iguais em todo lugar, o arrasto fala, o
// duplo clique apaga (doc 39, §2.1 e §2.6)
// ---------------------------------------------------------------------------

import { dragReadout as dragReadout40, isDoubleClick as isDoubleClick40 } from '../src/panels/dopesheet-model.js';

describe('rodada 40, lote 3: as teclas e o arrasto', () => {
  it('o Resumo escolhe pela MESMA regra do losango: Ctrl soma, Shift tira', () => {
    // Antes: `event.ctrlKey ? 'tirar' : event.shiftKey ? 'somar'` — o contrário,
    // provado na tela (doc 39, foto `10`).
    const fonte = readFileSync(resolve(__dirname, '../src/panels/dopesheet-player.ts'), 'utf8');
    const i = fonte.indexOf('export function onSummaryDown');
    const corpo = fonte.slice(i, fonte.indexOf('\n}\n', i));
    expect(corpo).toContain('selectionModeOf(event)');
    expect(corpo).not.toMatch(/ctrlKey \? 'tirar'/);
  });

  it('o arrasto diz o tempo novo, o quadro e quanto andou', () => {
    expect(dragReadout40(0.5, 0.0667, 30)).toBe('0,57 s · q 17 · +2 quadros');
    expect(dragReadout40(0.5, -0.5, 30)).toBe('0,00 s · q 0 · −15 quadros');
    // 0,25 s fica entre os quadros 7 e 8 a 30 por segundo; mais um quadro dá 8,5, que é o 9.
    expect(dragReadout40(0.25, 1 / 30, 30)).toBe('0,28 s · q 9 · +1 quadro');
    expect(dragReadout40(0.25, 0, 30)).toBe('0,25 s · q 8 · no lugar');
  });

  it('o duplo clique se conta no próprio toque: mesma chave, perto, depressa', () => {
    // O `dblclick` do navegador nunca chegava: o primeiro toque redesenha a
    // folha, o losango debaixo do mouse é outro, e não há clique (doc 39, §2.6).
    const a = { id: 'k1', at: 1000, x: 100, y: 50 };
    expect(isDoubleClick40(null, a)).toBe(false);
    expect(isDoubleClick40(a, { id: 'k1', at: 1300, x: 102, y: 51 })).toBe(true);
    expect(isDoubleClick40(a, { id: 'k1', at: 1600, x: 100, y: 50 })).toBe(false);
    expect(isDoubleClick40(a, { id: 'k2', at: 1100, x: 100, y: 50 })).toBe(false);
    expect(isDoubleClick40(a, { id: 'k1', at: 1100, x: 120, y: 50 })).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rodada 40, lote 4 — o ciclo de andar (doc 39, §3 e §5; notas do doc 45)
// ---------------------------------------------------------------------------

import {
  copyKeys as copyKeys40, moveKeys as moveKeys40, offsetInLoop as offsetInLoop40,
  pasteKeys as pasteKeys40, pasteKeysInLoop as pasteKeysInLoop40, setKeyCurve as setKeyCurve40,
} from '../src/anim/keying.js';
import { copyNotice as copyNotice40, framesAndSeconds as framesAndSeconds40, pushNotice as pushNotice40 } from '../src/panels/dopesheet-model.js';

describe('rodada 40, lote 4: o ciclo de andar', () => {
  const leg = { type: 'bone' as const, target: 'leg', property: 'rotation' };
  const legB = { type: 'bone' as const, target: 'leg_b', property: 'rotation' };
  function andar(): BoneFile {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'leg', parent: 'root' }, { name: 'leg_b', parent: 'root' }],
      animations: [{
        name: 'andar', duration: 1, loop: true,
        timelines: [{ type: 'bone', target: 'leg', property: 'rotation',
          keys: [{ time: 0, value: -60 }, { time: 0.5, value: -110 }, { time: 1, value: -60 }] }],
      }],
    } as unknown as BoneFile;
    setKeyCurve40(file, 'andar', [{ target: leg, time: 0 }, { target: leg, time: 0.5 }], 'suave');
    return file;
  }
  const chaves = (file: BoneFile, alvo: string): Array<Record<string, unknown>> => {
    const line = (file.animations ?? [])[0]!.timelines!.find((t) => (t as { target?: string }).target === alvo);
    return ((line as unknown as { keys?: Array<Record<string, unknown>> })?.keys ?? []);
  };
  const perto = (a: unknown, b: number[]): void => {
    expect(Array.isArray(a), String(a)).toBe(true);
    (b).forEach((n, i) => expect((a as number[])[i]).toBeCloseTo(n, 6));
  };

  it('colar uma chave Suave meio segundo depois: as alças andam junto com ela', () => {
    const file = andar();
    const clip = copyKeys40(file, 'andar', [{ target: leg, time: 0 }, { target: leg, time: 0.5 }]);
    const paraB = { ...clip, items: clip.items.map((item) => ({ ...item, target: legB })) };
    pasteKeys40(file, 'andar', paraB, 0.25);
    // De 0,25 (−60) a 0,75 (−110): a Suave é 0,42 e 0,58 do caminho NO TRECHO NOVO.
    perto(chaves(file, 'leg_b')[0]!['curve'], [0.25 + 0.21, -60, 0.25 + 0.29, -110]);
  });

  it('mover uma chave refaz a curva no trecho novo, em vez de deixar as alças no lugar velho', () => {
    const file = andar();
    moveKeys40(file, 'andar', [{ target: leg, time: 0 }], 0.1);
    // Trecho de 0,1 a 0,5 (0,4 s).
    perto(chaves(file, 'leg')[0]!['curve'], [0.1 + 0.42 * 0.4, -60, 0.1 + 0.58 * 0.4, -110]);
  });

  it('colar espelhado numa animação que repete DÁ A VOLTA: a duração não muda', () => {
    const file = andar();
    const clip = copyKeys40(file, 'andar', [0, 0.5, 1].map((time) => ({ target: leg, time })));
    const paraB = { ...clip, items: clip.items.map((item) => ({ ...item, target: legB })) };
    pasteKeysInLoop40(file, 'andar', paraB, 0.5);
    expect((file.animations ?? [])[0]!.duration).toBe(1);
    const b = chaves(file, 'leg_b');
    expect(b.map((k) => [k['time'], k['value']])).toEqual([[0, -110], [0.5, -60], [1, -110]]);
    // A chave de 0,5 veio da de 0 (Suave): a curva vai de 0,5 a 1.
    perto(b[1]!['curve'], [0.5 + 0.21, -60, 0.5 + 0.29, -110]);
  });

  it('"Deslocar em laço": as linhas andam e o que passa do fim volta no começo', () => {
    const file = andar();
    offsetInLoop40(file, 'andar', [leg], 0.25);
    expect((file.animations ?? [])[0]!.duration).toBe(1);
    const a = chaves(file, 'leg');
    expect(a.map((k) => k['time'])).toEqual([0, 0.25, 0.75, 1]);
    expect(a.map((k) => k['value'])).toEqual([-85, -60, -110, -85]);
  });

  it('o Empurrar fala em quadros E segundos, e diz quando a animação cresceu', () => {
    expect(framesAndSeconds40(6, 30)).toBe('6 quadros = 0,20 s');
    expect(framesAndSeconds40(1, 30)).toBe('1 quadro = 0,03 s');
    expect(pushNotice40(2, 6, 'frente', 30, 2, 2)).toBe('2 chaves andaram 6 quadros (0,20 s) para a frente');
    expect(pushNotice40(2, 4, 'frente', 30, 2, 2.13))
      .toBe('2 chaves andaram 4 quadros (0,13 s) para a frente. A animação cresceu de 2,00 s para 2,13 s');
    expect(pushNotice40(1, 3, 'tras', 30, 1, 1)).toBe('1 chave andou 3 quadros (0,10 s) para trás');
  });

  it('Copiar diz no rodapé o que copiou', () => {
    expect(copyNotice40(3)).toBe('3 chaves copiadas. Ctrl+V cola na agulha');
    expect(copyNotice40(1)).toBe('1 chave copiada. Ctrl+V cola na agulha');
    expect(copyNotice40(0)).toBe('Nenhuma chave escolhida para copiar');
  });
});

// ---------------------------------------------------------------------------
// Rodada 40, lote 5 — o padrão (doc 39, §4; notas do doc 47)
// ---------------------------------------------------------------------------

import { loopClosedNotice as loopClosedNotice40, shouldAnnounceNewKeys as shouldAnnounce40 } from '../src/panels/dopesheet-model.js';
import { frameStepFor as frameStepFor40 } from '../src/panels/dopesheet.js';
import { axisNumber as axisNumber40, unitOfLines as unitOfLines40 } from '../src/panels/graph.js';

describe('rodada 40, lote 5: o padrão da linha do tempo', () => {
  it('a régua anda em segundos redondos: 0,10 · 0,20…, nunca 0,07 · 0,13', () => {
    expect(frameStepFor40(30, 1, 1700)).toBe(3);   // 0,1 s
    expect(frameStepFor40(24, 1, 1700)).toBe(6);   // 0,25 s: 0,1 s não cai num quadro a 24
    for (const fps of [12, 24, 25, 30, 60]) {
      for (const width of [300, 700, 1200, 1700, 2400]) {
        for (const span of [0.6, 1, 2, 5]) {
          const step = frameStepFor40(fps, span, width);
          const centesimos = (step / fps) * 100;
          expect(Math.abs(centesimos - Math.round(centesimos)), `${fps} fps, ${width} px, ${span} s`).toBeLessThan(1e-6);
        }
      }
    }
  });

  it('o eixo do gráfico diz a unidade do que está à vista, sem casas que ninguém pediu', () => {
    const rot = { type: 'bone' as const, target: 'leg', property: 'rotation' };
    const x = { type: 'bone' as const, target: 'leg', property: 'x' };
    const esc = { type: 'bone' as const, target: 'leg', property: 'scaleX' };
    expect(unitOfLines40([{ target: rot, visible: true }, { target: rot, visible: true }])).toBe('°');
    expect(unitOfLines40([{ target: x, visible: true }])).toBe(' px');
    expect(unitOfLines40([{ target: esc, visible: true }])).toBe('×');
    expect(unitOfLines40([{ target: rot, visible: true }, { target: x, visible: true }])).toBe('');
    expect(unitOfLines40([{ target: rot, visible: true }, { target: x, visible: false }])).toBe('°');
    expect(axisNumber40(-60, '°')).toBe('−60°');
    expect(axisNumber40(12.5, ' px')).toBe('12,5 px');
    expect(axisNumber40(0.25, '')).toBe('0,25');
  });

  it('o rodapé do Fechar ciclo concorda no número', () => {
    expect(loopClosedNotice40(0, 0)).toBe('Nenhuma linha pôde ser fechada');
    expect(loopClosedNotice40(1, 1)).toBe('1 linha fechada, 1 com as tangentes casadas');
    expect(loopClosedNotice40(3, 2)).toBe('3 linhas fechadas, 2 com as tangentes casadas');
  });

  it('desfazer e refazer não ganham a frase de chave nova por cima do "Desfeito: …" (nota do doc 47)', () => {
    expect(shouldAnnounce40('Desfeito: Apagar chave')).toBe(false);
    expect(shouldAnnounce40('Refeito: Apagar chave')).toBe(false);
    expect(shouldAnnounce40('Chavear ângulo')).toBe(true);
    expect(shouldAnnounce40(undefined)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Rodada 40, lote 5 — as notas da conferência da v32.0 (doc 50)
// ---------------------------------------------------------------------------

import { parseFramesOrSeconds as parseFramesOrSeconds40, pastedKeysSummary as pastedKeysSummary40 } from '../src/panels/dopesheet-model.js';
import { animationMenu as animationMenu40, flatEntries as flatEntries40 } from '../src/ui/menus.js';

describe('rodada 40, lote 5: as notas do doc 50', () => {
  it('(a) a caixa do Empurrar aceita quadros E segundos, e recusa o que não sabe ler', () => {
    expect(parseFramesOrSeconds40('6', 30)).toBe(6);
    expect(parseFramesOrSeconds40('6 quadros', 30)).toBe(6);
    expect(parseFramesOrSeconds40('6 q', 30)).toBe(6);
    expect(parseFramesOrSeconds40('0,2 s', 30)).toBe(6);
    expect(parseFramesOrSeconds40('0,2s', 30)).toBe(6);
    expect(parseFramesOrSeconds40('0.2 s', 30)).toBe(6);
    expect(parseFramesOrSeconds40('1 s', 24)).toBe(24);
    // "0,2" sem unidade: quadro ou segundo? Não adivinha.
    expect(parseFramesOrSeconds40('0,2', 30)).toBeNull();
    expect(parseFramesOrSeconds40('', 30)).toBeNull();
    expect(parseFramesOrSeconds40('abc', 30)).toBeNull();
    expect(parseFramesOrSeconds40('0', 30)).toBeNull();
    expect(parseFramesOrSeconds40('-3', 30)).toBeNull();
  });

  it('(b) o Colar espelhado diz para onde as chaves foram, e em que tempos', () => {
    const legB = { type: 'bone' as const, target: 'leg_b', property: 'rotation' };
    expect(pastedKeysSummary40([{ target: legB, time: 0 }, { target: legB, time: 0.5 }, { target: legB, time: 1 }]))
      .toBe('3 chaves: leg_b em 0,00 · 0,50 · 1,00 s');
  });

  it('(c) com a animação aberta, os itens do menu Chaves não dizem "Abra uma animação primeiro"', () => {
    const ids = ['empurrar-chaves', 'deslocar-em-laco', 'fechar-ciclo', 'espelhar-tempo', 'limpar-chaves-repetidas'];
    const aberta = flatEntries40(animationMenu40({ animating: true, loop: false })).filter((e) => ids.includes(e.action));
    expect(aberta.length).toBe(ids.length);
    for (const entry of aberta) expect(entry.hint ?? '', entry.action).not.toContain('Abra uma animação primeiro');
    const base = flatEntries40(animationMenu40({ animating: false, loop: false })).filter((e) => ids.includes(e.action));
    for (const entry of base) expect(entry.hint ?? '', entry.action).toContain('Abra uma animação primeiro');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 3 (doc 68, R7): o número da casa fora da ficha
// ---------------------------------------------------------------------------
const fonteR47 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');
/** Quantas caixas de número cruas (`type = 'number'`) o arquivo ainda tem. */
const cruasR47 = (texto: string): number => (texto.match(/\.type = 'number'|type: 'number'|type="number"/g) ?? []).length;

describe('rodada 47, lote 3: a chave de evento e as janelas que não fecham erradas', () => {
  it('Inteiro, Decimal, Volume e Balanço com dica; volume e balanço em %', () => {
    const evento = fonteR47('panels/event-key-editor.ts');
    expect((evento.match(/campoNumero\(\{/g) ?? []).length).toBe(2);
    expect(evento).toContain('dica: field.hint ?? field.label, unidade: field.unit');
    expect(cruasR47(evento)).toBe(0);
    const modelo = fonteR47('anim/event-keys.ts');
    expect(modelo).toContain("key: 'volume', label: 'Volume', kind: 'decimal', min: 0, max: 1, unit: '%', scale: 100");
    expect(modelo).toContain('Volume do som, em %, de 0 a 100');
  });

  it('a janela de campos aceita uma validação; errada, fica aberta com o botão cinza (doc 54)', () => {
    const janela = fonteR47('ui/dialog.ts');
    const form = janela.slice(janela.indexOf('export function askForm'), janela.indexOf('export function askForm') + 4000);
    expect(form).toContain('erro = options.validate?.(values) ?? null;');
    expect(form).toContain('yes.disabled = erro !== null;');
    expect(form).toContain('if (erro !== null) return;');
  });

  it('Empurrar e Deslocar passam a conta dos quadros como validação', () => {
    const edit = fonteR47('panels/dopesheet-edit.ts');
    expect((edit.match(/validate: \(v\) => \(parseFramesOrSeconds\(/g) ?? []).length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 4: os botões da chave de evento têm dica (R5)', () => {
  it('Chavear evento e Apagar esta chave dizem o que fazem, e o apagado diz por quê', () => {
    const evento = fonteR47L4('panels/event-key-editor.ts');
    expect(evento).toContain('write.title = already');
    expect(evento).toContain('erase.title = already');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 5 (doc 68, opção A; notas do doc 85)
// ---------------------------------------------------------------------------
const fonteR47L5 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 5: a Cebola legível, com unidade, e "Quanto aparece" em % (notas 1 e 2 do doc 85)', () => {
  it('cada número da Cebola tem dica com a faixa; Passo em s, deslocar em px, Quanto aparece em %', async () => {
    const { ONION_ROWS } = await import('../src/panels/view-panel.js');
    for (const r of ONION_ROWS) expect(r.hint, r.key).toMatch(/de [−-]?[\d,]+ a [−+]?[\d,]+/);
    const por = Object.fromEntries(ONION_ROWS.map((r) => [r.key, r]));
    expect([por['step']!.unit, por['offsetX']!.unit, por['opacity']!.unit, por['opacity']!.scale]).toEqual(['s', 'px', '%', 100]);
  });

  it('a lista da Cebola usa o número da casa, e as cores da casa (o texto saía cinza sobre branco)', () => {
    expect(fonteR47L5('panels/dopesheet-player.ts')).toContain("id: `cebola-${item.key}`");
    const css = fonteR47L5('panels/dopesheet.css');
    const lista = css.slice(css.indexOf('.dope-cebola-lista {'), css.indexOf('}', css.indexOf('.dope-cebola-lista {')));
    expect(lista).toContain('color: var(--ink, #10151c);');
    expect(lista).toContain('background: var(--panel, #fff);');
  });
});

// Rodada 47, lote 6d (doc 90, nota 4; o detalhe do conferente): Evento, Som e
// Texto não tinham dica, e nada dizia o que é um evento.
describe('rodada 47, lote 6d: a chave de evento diz o que é cada coisa', () => {
  it('todo campo do evento tem dica, o Texto também', async () => {
    const { EVENT_FIELDS, EVENT_DEF_FIELDS } = await import('../src/anim/event-keys.js');
    for (const f of [...EVENT_FIELDS, ...EVENT_DEF_FIELDS]) expect(f.hint, f.label).toBeTruthy();
  });

  it('o rótulo Evento diz o que é um evento; Som e Pasta dos sons têm dica', async () => {
    const { EVENT_HINT } = await import('../src/anim/event-keys.js');
    expect(EVENT_HINT).toMatch(/jogo/);
    const ed = readFileSync(resolve(__dirname, '../src/panels/event-key-editor.ts'), 'utf8');
    expect(ed).toContain('label.title = EVENT_HINT;');
    expect(ed).toContain('SOUND_HINT');
    expect(ed).toContain('SOUND_BASE_HINT');
  });
});

// Rodada 48, item 6 (ressalva do doc 93, defeito 2): o "Texto" da chave de
// evento tinha a dica no modelo, mas o ramo de texto não a punha no rótulo nem
// na caixa. O Inteiro e o Decimal tinham (pelo campo da casa); o Texto, não.
describe('rodada 48 — o Texto da chave de evento com dica', () => {
  it('o ramo de texto põe a dica no rótulo e na caixa', () => {
    const ed = readFileSync(resolve(__dirname, '../src/panels/event-key-editor.ts'), 'utf8');
    const corpo = ed.slice(ed.indexOf('function numberOrTextRow('), ed.indexOf('function buildSounds('));
    const ramo = corpo.slice(corpo.indexOf("const input = el('input'"));
    expect(ramo).toContain('rotulo.title = dica');
    expect(ramo).toContain('input.title = dica');
  });
});

// ---------------------------------------------------------------------------
// Rodada 50, lote 3 — Ctrl+C / Ctrl+V das chaves, pelo Spine (doc 98, item B11)
// ---------------------------------------------------------------------------

import { clipThatFits as clipThatFits50, pasteDoneNotice as pasteDoneNotice50, pasteEnd as pasteEnd50 } from '../src/panels/dopesheet-model.js';
import type { KeyClipboard as KeyClipboard50 } from '../src/anim/keying.js';

describe('rodada 50, lote 3: copiar o quadro, colar sem esticar escondido', () => {
  const ROT50 = { type: 'bone' as const, target: 'body', property: 'rotation' };
  const BRACO50 = { type: 'bone' as const, target: 'arm', property: 'rotation' };
  const clip: KeyClipboard50 = {
    base: 0,
    items: [
      { target: ROT50, offset: 0, key: { time: 0, value: 0 } },
      { target: BRACO50, offset: 0, key: { time: 0, value: 0 } },
      { target: ROT50, offset: 0.5, key: { time: 0.5, value: 25 } },
      { target: BRACO50, offset: 0.5, key: { time: 0.5, value: 25 } },
    ],
  } as unknown as KeyClipboard50;

  it('o colar sabe ANTES até onde vai: chaves de 0 e 0,5 coladas em 1,0 vão até 1,5', () => {
    expect(pasteEnd50(clip, 1)).toBeCloseTo(1.5, 6);
    expect(pasteEnd50(clip, 0)).toBeCloseTo(0.5, 6);
  });

  it('"colar só o que cabe" deixa de fora o que passaria do fim', () => {
    const cabe = clipThatFits50(clip, 1, 1);
    expect(cabe.items.map((i) => i.offset)).toEqual([0, 0]);
    expect(clipThatFits50(clip, 0, 1).items).toHaveLength(4);
  });

  it('o rodapé conta TODAS as coladas, nos dois tempos, e diz quando a animação cresceu', () => {
    const escritas = [
      { target: ROT50, time: 1 }, { target: BRACO50, time: 1 },
      { target: ROT50, time: 1.5 }, { target: BRACO50, time: 1.5 },
    ];
    const frase = pasteDoneNotice50(escritas, 1, 1.5);
    expect(frase).toMatch(/^4 chaves coladas/);
    expect(frase).toContain('1,00');
    expect(frase).toContain('1,50');
    expect(frase).toContain('A animação cresceu de 1,00 s para 1,50 s');
    expect(pasteDoneNotice50(escritas.slice(0, 2), 1, 1)).not.toContain('cresceu');
  });

  it('Ctrl+C sem chave marcada copia a pose do escolhido NA AGULHA; Ctrl+V que vai esticar pergunta antes', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/dopesheet-edit.ts'), 'utf8');
    const copiar = fonte.slice(fonte.indexOf('export function copySelected'), fonte.indexOf('export async function pasteHere'));
    expect(copiar).toMatch(/poseAt\(doc\.file, doc\.animation, doc\.time, targets\)/);
    expect(copiar).not.toMatch(/keyRefsForTargets/);
    const colar = fonte.slice(fonte.indexOf('export async function pasteHere'), fonte.indexOf('export function pasteMirrored'));
    expect(colar.indexOf('askChoice')).toBeGreaterThan(-1);
    expect(colar.indexOf('askChoice')).toBeLessThan(colar.indexOf('doc.run('));
    expect(colar).toMatch(/pasteDoneNotice\(/);
  });
});

describe('rodada 50, lote 4: "Colar só o que cabe" diz quantas ficaram de fora (doc 101)', () => {
  it('o rodapé conta as coladas E as que ficaram de fora', () => {
    const ROT = { type: 'bone' as const, target: 'root', property: 'rotation' };
    const frase = pasteDoneNotice50([{ target: ROT, time: 1 }], 1, 1, 1);
    expect(frase).toMatch(/^1 chave colada: root em 1,00 s/);
    expect(frase).toContain('1 ficou de fora: passava do fim');
    expect(pasteDoneNotice50([{ target: ROT, time: 1 }], 1, 1, 2)).toContain('2 ficaram de fora');
    expect(pasteDoneNotice50([{ target: ROT, time: 1 }], 1, 1)).not.toContain('de fora');
  });
});

// QA da noite de 04/11/2026 (obra/qa-animar): o menu do botão direito no
// losango (Linear, Suave, … Apagar chave) não fechava com Esc. Agora a folha
// arma um só fecho para os seus menus: clique fora, ou Esc.
import { closesPopup as closesPopupQA } from '../src/panels/dopesheet-model.js';
describe('Esc fecha o menu do losango (QA da noite)', () => {
  it('Esc fecha; Enter e as setas não', () => {
    expect(closesPopupQA('Escape')).toBe(true);
    expect(closesPopupQA('Enter')).toBe(false);
    expect(closesPopupQA('ArrowDown')).toBe(false);
  });
  it('os dois menus da folha passam pelo mesmo fecho, que escuta o Esc', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/dopesheet.ts'), 'utf8');
    expect(fonte.match(/this\.armMenuClose\(menu\)/g)?.length).toBe(2);
    expect(fonte).toMatch(/addEventListener\('keydown', tecla, true\)/);
  });
});

// QA da noite de 04/11/2026 (obra/qa-animar): arrastar a chave de 0,20 s
// para cima da de 0,50 s apagava a de 0,50 s, e o rodapé dizia só "Mover
// chaves." Substituir é o que o Spine faz; calar é a regra 21 ao contrário.
import { keysCoveredByMove as keysCoveredByMoveQA, setKey as setKeyQA, boneTarget as boneTargetQA } from '../src/anim/keying.js';
import { coveredKeysNotice as coveredKeysNoticeQA } from '../src/panels/dopesheet-model.js';
describe('arrastar uma chave para cima de outra diz o que cobriu (QA da noite)', () => {
  const alvo = boneTargetQA('coxa', 'rotation');
  const arquivo = (): BoneFile => {
    const file = { bone: { version: '1.0' }, bones: [{ name: 'root' }, { name: 'coxa', parent: 'root' }], animations: [{ name: 'a' }] } as unknown as BoneFile;
    for (const [t, v] of [[0, 0], [0.2, 10], [0.5, 20]] as const) setKeyQA(file, 'a', t, alvo, v);
    return file;
  };
  it('a chave que estava no destino é contada; as que andam juntas, não', () => {
    const file = arquivo();
    expect(keysCoveredByMoveQA(file, 'a', [{ target: alvo, time: 0.2 }], 0.3)).toEqual([{ target: alvo, time: 0.5 }]);
    // As duas andam juntas: a de 0,5 sai do lugar, a de 0,2 entra — ninguém é coberto.
    expect(keysCoveredByMoveQA(file, 'a', [{ target: alvo, time: 0.2 }, { target: alvo, time: 0.5 }], 0.3)).toEqual([]);
    expect(keysCoveredByMoveQA(file, 'a', [{ target: alvo, time: 0.2 }], 0.1)).toEqual([]);
  });
  it('clonar: as de origem ficam, e a clonada de 0,2 cobre a de 0,5 que ficou', () => {
    const file = arquivo();
    expect(keysCoveredByMoveQA(file, 'a', [{ target: alvo, time: 0.2 }, { target: alvo, time: 0.5 }], 0.3, true))
      .toEqual([{ target: alvo, time: 0.5 }]);
  });
  it('a frase diz quantas, onde, e o caminho de volta', () => {
    expect(coveredKeysNoticeQA([{ target: alvo, time: 0.5 }], 'Mover chaves'))
      .toBe('Mover chaves: a chave que já estava em 0,50 s (coxa) foi substituída. Ctrl+Z volta');
    expect(coveredKeysNoticeQA([{ target: alvo, time: 0.5 }, { target: boneTargetQA('perna', 'x'), time: 1 }], 'Clonar chaves'))
      .toBe('Clonar chaves: 2 chaves que já estavam no destino foram substituídas. Ctrl+Z volta');
  });
});
