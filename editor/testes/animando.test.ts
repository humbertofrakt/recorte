/**
 * Animando — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote44-padrao`, `lote46-troca`, `lote57-animando-livre`, `lote68-roteiro-consertos`.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { Skeleton, loadSkeletonData, pose } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { emptySelection, getTool } from '../src/contract.js';
import type { EditorDoc } from '../src/contract.js';
import { MoveAnimationToTop, defaultAnimation, SetDefaultMixAll, animationDuration, commonDefaultMix, findAnimation, formatMix, parseMixAnswer } from '../src/panels/animations-model.js';
import { animationMenu, fileMenu, flatEntries } from '../src/ui/menus.js';
import type { MenuEntry, MenuItem } from '../src/ui/menus.js';
// Degrau 12, parte `B` (18/09/2026): a biblioteca de animações.
import { ACTION_TABLE } from '../src/ui/actions-table.js';
import { exportAnimation, importAnimation, openEntityAnimation, pickEntitySlots, returnToHost } from '../src/panels/animations-actions.js';
// Rodada 8b, C10.
import { hostOfEntityView, SetAnimationLoop as SetAnimationLoopC10 } from '../src/panels/animations-model.js';
import { cenaMontadaDe } from '../src/doc/projeto.js';
import { rememberEntityFile } from '../src/doc/entity-files.js';
// Rodada 8b, C9.
import { entityBaseHint, listEntityBases } from '../src/panels/animations-model.js';
import { DropEntityAsSlot as DropEntityAsSlotAnim } from '../src/doc/drop-entity.js';
import {
  forgetAnimationNames, importedAnimationUris, rememberAnimationNames, ImportAnimationFile,
} from '../src/io/export-animation.js';
// Lote 2: a biblioteca de fábrica e a seção "De fora".
import { factoryLibrary, libraryNotice } from '../src/io/animation-library.js';
import { openAnimationLibrary } from '../src/panels/animations-actions.js';
import {
  externalCount, externalHint, listExternalAnimations,
} from '../src/panels/animations-model.js';
import { Doc } from '../src/doc/document.js';
import { SWITCH_HINT, SWITCH_MODES, arrivalPlan, createTransport, switchAnimation, switchPlan } from '../src/anim/transport.js';
import type { TransportClock } from '../src/anim/transport.js';
import { DEFAULT_VIEW, parseViewSettings } from '../src/viewport/onion.js';
import { DropImageAsSlot, appearKeys, appearNotice } from '../src/panels/palette-model.js';
import { DeleteItems } from '../src/panels/tree-model.js';
import { toolOfKey } from '../src/viewport/viewport.js';
import { NEW_BONE_IN_ANIMATION, describeBone } from '../src/viewport/tools/create-bone.js';
import '../src/viewport/tools/point-tool.js';
import '../src/viewport/tools/box-tool.js';
import '../src/viewport/tools/mesh-tool.js';
import '../src/viewport/tools/weights-tool.js';
import { createEmptyFile } from '../src/doc/new-file.js';
import { boneTarget, keepStartKey } from '../src/anim/keying.js';
import { setPropertyOrKey } from '../src/anim/pose-mode.js';
import { writeBoneValues } from '../src/viewport/tools/select.js';
import { SPACE_PAN_PIXELS, spaceGesture } from '../src/viewport/space-gesture.js';
import { START_TOOL } from '../src/ui/toolbar-model.js';
import { SCENE_GESTURE_ROWS } from '../src/ui/keys.js';
import { isEmptyDocument } from '../src/viewport/welcome-model.js';

// ---------------------------------------------------------------------------
// padrao (lote 44) — era `lote44-padrao.test.ts`
// ---------------------------------------------------------------------------

describe('padrao (lote 44)', () => {
/**
 * Lote 44 — rodada 4: a primeira animação da lista é a padrão (§4.6, F4).
 *
 * Sem DOM: o que se prova é o comando `MoveAnimationToTop`, com o `revert`
 * exato texto contra texto, e o item no menu Animação.
 */
const EXEMPLOS = resolve(__dirname, '..', '..', 'formato', 'exemplos');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(join(EXEMPLOS, 'heroi.bone'), 'utf8')) as BoneFile;
}

/** O comando só mexe em `doc.file`: um documento de uma linha basta. */
function docDe(file: BoneFile): EditorDoc {
  return { file } as unknown as EditorDoc;
}

const nomes = (file: BoneFile): string[] => (file.animations ?? []).map((a) => a.name);

describe('MoveAnimationToTop', () => {
  it("attack vai para o topo; a ordem das outras não muda", () => {
    const file = heroi();
    const antes = nomes(file);
    expect(antes).toContain('attack');
    expect(antes[0]).not.toBe('attack');

    new MoveAnimationToTop('attack').apply(docDe(file));

    expect(file.animations![0]!.name).toBe('attack');
    expect(nomes(file).slice(1)).toEqual(antes.filter((n) => n !== 'attack'));
    expect(defaultAnimation(file)).toBe('attack');
  });

  it('revert devolve o arquivo igual, texto contra texto', () => {
    const file = heroi();
    const texto = JSON.stringify(file);
    const command = new MoveAnimationToTop('attack');
    command.apply(docDe(file));
    expect(JSON.stringify(file)).not.toBe(texto);
    command.revert(docDe(file));
    expect(JSON.stringify(file)).toBe(texto);
  });

  it('refazer depois de desfazer dá o mesmo arquivo da primeira vez', () => {
    const file = heroi();
    const command = new MoveAnimationToTop('attack');
    command.apply(docDe(file));
    const depois = JSON.stringify(file);
    command.revert(docDe(file));
    command.apply(docDe(file));
    expect(JSON.stringify(file)).toBe(depois);
  });

  it('já sendo a primeira: não faz nada, nem na ida nem na volta', () => {
    const file = heroi();
    const texto = JSON.stringify(file);
    const primeira = nomes(file)[0]!;
    const command = new MoveAnimationToTop(primeira);
    command.apply(docDe(file));
    expect(JSON.stringify(file)).toBe(texto);
    command.revert(docDe(file));
    expect(JSON.stringify(file)).toBe(texto);
  });

  it('animação que não existe: não faz nada', () => {
    const file = heroi();
    const texto = JSON.stringify(file);
    const command = new MoveAnimationToTop('nao-existe');
    command.apply(docDe(file));
    command.revert(docDe(file));
    expect(JSON.stringify(file)).toBe(texto);
  });

  it('o nome no desfazer é o do botão', () => {
    expect(new MoveAnimationToTop('attack').label).toBe('Mandar para o topo');
  });
});

describe('defaultAnimation', () => {
  it('é a primeira da lista, e null sem nenhuma', () => {
    expect(defaultAnimation(heroi())).toBe(nomes(heroi())[0]);
    expect(defaultAnimation({ ...heroi(), animations: [] })).toBeNull();
  });
});

describe('Animação → Mandar para o topo', () => {
  const itens = (animating: boolean) =>
    // P41 (29/09/2026): a lista mora em Animação → Animações ▸, e é lá dentro
    // que se procura.
    dentroDe(animationMenu({ animating, loop: false }), 'Animações');

  it('está no menu, em Animação → Animações ▸, com a ação do painel', () => {
    const item = itens(true).find((entry) => entry.action === 'mandar-para-o-topo');
    expect(item?.label).toBe('Mandar para o topo');
    expect(item?.enabled).toBe(true);
  });

  it('em Montagem fica cinza, e a dica diz por quê', () => {
    const item = itens(false).find((entry) => entry.action === 'mandar-para-o-topo');
    expect(item?.enabled).toBe(false);
    expect((item as { hint?: string } | undefined)?.hint).toBe('Abra uma animação primeiro');
  });
});
});

// ---------------------------------------------------------------------------
// troca (lote 46) — era `lote46-troca.test.ts`
// ---------------------------------------------------------------------------

describe('troca (lote 46)', () => {
/**
 * Lote 46 — rodada 4: Configurações ganha "Ao trocar de animação tocando" e o
 * "Tempo de mistura" (respostas D8 e D2 do Humberto).
 *
 * Sem DOM. O tocador recebe um relógio de mentira, que diz que horas são; o
 * `defaultMix` é conferido comparando o arquivo POR TEXTO antes e depois de
 * desfazer.
 */
const RAW = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile);
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

/** Um relógio de mentira: agora é a última batida que o teste disparou. */
function fakeClock(): TransportClock & { fire(stampMs: number): void } {
  let at = 0;
  let next = 1;
  const jobs = new Map<number, (stampMs: number) => void>();
  return {
    now: () => at,
    schedule(run) {
      const id = next++;
      jobs.set(id, run);
      return id;
    },
    cancel(id) {
      jobs.delete(id);
    },
    fire(stampMs) {
      at = stampMs;
      const todo = [...jobs.values()];
      jobs.clear();
      for (const run of todo) run(stampMs);
    },
  };
}

/** A maior diferença de posição entre os ossos de dois documentos. */
function diferenca(a: Doc, b: Doc): number {
  const ossosA = a.skeleton!.bones;
  const ossosB = b.skeleton!.bones;
  let pior = 0;
  for (let i = 0; i < ossosA.length; i++) {
    pior = Math.max(pior, Math.abs(ossosA[i]!.worldX - ossosB[i]!.worldX), Math.abs(ossosA[i]!.worldY - ossosB[i]!.worldY));
  }
  return pior;
}

/** Um documento parado na animação e no tempo dados, sem mistura. */
function pura(animation: string, time: number): Doc {
  const doc = heroi();
  doc.animation = animation;
  doc.time = time;
  return doc;
}

// ---------------------------------------------------------------------------
// A conta do clique
// ---------------------------------------------------------------------------

describe('switchPlan — o que um clique faz', () => {
  it('terminar, tocando walk, clique em attack: attack vai para a fila', () => {
    expect(switchPlan(true, 'walk', 'attack', 'terminar')).toEqual({ queued: 'attack' });
  });

  it('na hora, tocando: troca já, do começo', () => {
    expect(switchPlan(true, 'walk', 'attack', 'na-hora')).toEqual({ switchTo: 'attack', time: 0 });
  });

  it('parado, qualquer modo: troca na hora', () => {
    expect(switchPlan(false, 'walk', 'attack', 'terminar')).toEqual({ switchTo: 'attack', time: 0 });
    expect(switchPlan(false, 'walk', 'attack', 'na-hora')).toEqual({ switchTo: 'attack', time: 0 });
  });

  it('tocando em terminar, clicar na própria atual tira a fila', () => {
    expect(switchPlan(true, 'walk', 'walk', 'terminar')).toEqual({ queued: null });
  });

  it('voltar à Montagem é sempre na hora', () => {
    expect(switchPlan(true, 'walk', null, 'terminar')).toEqual({ switchTo: null, time: 0 });
  });
});

describe('arrivalPlan — a próxima entra quando a atual passa do fim', () => {
  it('passou do fim, para a frente: entra em 0', () => {
    expect(arrivalPlan('attack', 1.05, 1, 1)).toEqual({ switchTo: 'attack', time: 0 });
  });

  it('antes do fim, sem fila, ou tocando para trás: nada', () => {
    expect(arrivalPlan('attack', 0.95, 1, 1)).toBeNull();
    expect(arrivalPlan(null, 1.05, 1, 1)).toBeNull();
    expect(arrivalPlan('attack', 1.05, 1, -1)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// O tocador com a fila
// ---------------------------------------------------------------------------

describe('o tocador: terminar a atual antes', () => {
  it('walk em 0,4 s, clique em attack: walk continua; passou do fim, attack em 0, tocando', () => {
    const doc = heroi();
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'walk';
    const walk = animationDuration(findAnimation(doc.file, 'walk')!);
    player.play(doc);
    clock.fire(400);
    expect(doc.time).toBeCloseTo(0.4, 6);

    switchAnimation(doc, 'attack', player, 'terminar');
    expect(player.queued()).toBe('attack');
    expect(doc.animation).toBe('walk');
    expect(player.isPlaying()).toBe(true);

    clock.fire((walk - 0.1) * 1000);
    expect(doc.animation).toBe('walk');
    expect(doc.time).toBeCloseTo(walk - 0.1, 6);

    clock.fire((walk + 0.05) * 1000);
    expect(doc.animation).toBe('attack');
    expect(doc.time).toBe(0);
    expect(player.isPlaying()).toBe(true);
    expect(player.queued()).toBeNull();
  });

  it('na hora: troca já, e continua tocando', () => {
    const doc = heroi();
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'walk';
    player.play(doc);
    clock.fire(400);
    switchAnimation(doc, 'attack', player, 'na-hora');
    expect(doc.animation).toBe('attack');
    expect(doc.time).toBe(0);
    expect(player.isPlaying()).toBe(true);
    expect(player.queued()).toBeNull();
  });

  it('parado: troca na hora, e continua parado', () => {
    const doc = heroi();
    const player = createTransport(fakeClock());
    doc.animation = 'walk';
    doc.time = 0.4;
    switchAnimation(doc, 'attack', player, 'terminar');
    expect(doc.animation).toBe('attack');
    expect(doc.time).toBe(0);
    expect(player.isPlaying()).toBe(false);
  });

  it('pausar tira a fila', () => {
    const doc = heroi();
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'walk';
    player.play(doc);
    switchAnimation(doc, 'attack', player, 'terminar');
    expect(player.queued()).toBe('attack');
    player.pause();
    expect(player.queued()).toBeNull();
  });

  it('sem dizer o modo, troca na hora, como sempre', () => {
    const doc = heroi();
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'walk';
    player.play(doc);
    switchAnimation(doc, 'attack', player);
    expect(doc.animation).toBe('attack');
  });
});

// ---------------------------------------------------------------------------
// A mistura na troca
// ---------------------------------------------------------------------------

describe('a mistura na troca, pelo defaultMix', () => {
  it('0,2 s: no meio da mistura a pose é outra; depois dela, é a attack pura', () => {
    const doc = heroi();
    doc.run(new SetDefaultMixAll(0.2));
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'walk';
    player.play(doc);
    clock.fire(300);
    switchAnimation(doc, 'attack', player, 'na-hora');

    clock.fire(400);
    expect(doc.time).toBeCloseTo(0.1, 6);
    expect(diferenca(doc, pura('attack', 0.1))).toBeGreaterThan(0.5);

    clock.fire(550);
    expect(doc.time).toBeCloseTo(0.25, 6);
    expect(diferenca(doc, pura('attack', 0.25))).toBeLessThan(1e-9);
  });

  it('tempo zero: troca seca, a pose já é a attack pura', () => {
    const doc = heroi();
    doc.run(new SetDefaultMixAll(0));
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'walk';
    player.play(doc);
    clock.fire(300);
    switchAnimation(doc, 'attack', player, 'na-hora');
    clock.fire(400);
    expect(diferenca(doc, pura('attack', 0.1))).toBeLessThan(1e-9);
  });

  it('na chegada da fila também mistura', () => {
    const doc = heroi();
    doc.run(new SetDefaultMixAll(0.2));
    const clock = fakeClock();
    const player = createTransport(clock);
    doc.animation = 'walk';
    const walk = animationDuration(findAnimation(doc.file, 'walk')!);
    player.play(doc);
    clock.fire(400);
    switchAnimation(doc, 'attack', player, 'terminar');
    clock.fire((walk + 0.01) * 1000);
    expect(doc.animation).toBe('attack');
    clock.fire((walk + 0.11) * 1000);
    expect(diferenca(doc, pura('attack', doc.time))).toBeGreaterThan(0.5);
  });
});

// ---------------------------------------------------------------------------
// O tempo de mistura no arquivo
// ---------------------------------------------------------------------------

describe('SetDefaultMixAll — o tempo de mistura em todas as animações', () => {
  it('0,2 no herói: todas com 0,2; desfazer devolve cada uma, inclusive a que não tinha o campo', () => {
    const doc = heroi();
    const animations = doc.file.animations!;
    delete animations[0]!.defaultMix;
    animations[1]!.defaultMix = 0.1;
    const antes = texto(doc);

    doc.run(new SetDefaultMixAll(0.2));
    expect(animations.map((a) => a.defaultMix)).toEqual(animations.map(() => 0.2));

    doc.undo();
    expect(texto(doc)).toBe(antes);
    expect(Object.prototype.hasOwnProperty.call(animations[0], 'defaultMix')).toBe(false);
  });

  it('valores diferentes: o campo mostra "vários", e aplicar sem mexer não grava nada', () => {
    const file = JSON.parse(RAW) as BoneFile;
    file.animations![0]!.defaultMix = 0.1;
    file.animations![1]!.defaultMix = 0.3;
    expect(commonDefaultMix(file)).toBeNull();
    expect(formatMix(file)).toBe('vários');
    expect(parseMixAnswer(file, 'vários')).toBeNull();
    expect(parseMixAnswer(file, '0,25')).toBe(0.25);
  });

  it('todas iguais: o número com vírgula; o mesmo número, ou lixo, não grava', () => {
    const file = JSON.parse(RAW) as BoneFile;
    for (const a of file.animations!) a.defaultMix = 0.25;
    expect(formatMix(file)).toBe('0,25');
    expect(parseMixAnswer(file, '0,25')).toBeNull();
    expect(parseMixAnswer(file, '0.25')).toBeNull();
    expect(parseMixAnswer(file, '')).toBeNull();
    expect(parseMixAnswer(file, '-1')).toBeNull();
    expect(parseMixAnswer(file, 'abc')).toBeNull();
    expect(parseMixAnswer(file, '0')).toBe(0);
  });

  it('nenhuma com o campo: mostra 0, e 0 não grava', () => {
    const file = JSON.parse(RAW) as BoneFile;
    for (const a of file.animations!) delete a.defaultMix;
    expect(formatMix(file)).toBe('0');
    expect(parseMixAnswer(file, '0')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Onde a escolha mora, e o que a dica diz
// ---------------------------------------------------------------------------

describe('Configurações: a troca mora nas opções de ver', () => {
  it('nasce "terminar"; lê "na-hora"; lixo volta ao padrão', () => {
    expect(DEFAULT_VIEW.switchMode).toBe('terminar');
    expect(parseViewSettings({ switchMode: 'na-hora' }).switchMode).toBe('na-hora');
    expect(parseViewSettings({ switchMode: 'sim' }).switchMode).toBe('terminar');
  });

  it('as duas opções têm nome escrito, e a dica diz que isto não é o Repetir', () => {
    expect(SWITCH_MODES.map((m) => m.label)).toEqual(['Terminar a atual antes', 'Trocar na hora']);
    expect(SWITCH_HINT).toContain('Repetir');
    expect(SWITCH_HINT).toContain('loop');
  });
});
});

// ---------------------------------------------------------------------------
// animando livre (lote 57) — era `lote57-animando-livre.test.ts`
// ---------------------------------------------------------------------------

describe('animando livre (lote 57)', () => {
/**
 * Lote 57 — criar osso, Ponto e Caixa, e trazer imagem, também em Animando.
 * Plano: `documentos/planos/PLANO pivô e Animando 2026-09-10.md`.
 *
 * Como no Spriter, dá para montar enquanto anima. O que nasce entra na
 * base; a imagem solta com uma animação aberta APARECE só na animação
 * aberta, a partir do tempo da agulha. E apagar um osso animado passa a levar
 * as linhas dele junto — antes elas ficavam órfãs.
 */
const EXEMPLOS = process.cwd().replace(/\\/g, '/') + '/formato/exemplos/';

function heroi(): BoneFile {
  return JSON.parse(readFileSync(`${EXEMPLOS}heroi.bone`, 'utf8')) as BoneFile;
}

/** Os comandos daqui só leem e escrevem `doc.file`. */
function docOf(file: BoneFile): EditorDoc {
  return { file } as unknown as EditorDoc;
}

interface TimelineLike { type: string; target?: string; property?: string; keys?: Array<{ time?: number; value?: unknown }> }

function timelinesOf(file: BoneFile, animation: string): TimelineLike[] {
  const found = file.animations?.find((a) => a.name === animation);
  return (found?.timelines ?? []) as unknown as TimelineLike[];
}

/** Um osso que a `walk` anima, e que não é a raiz. */
function animatedBone(file: BoneFile): string {
  const root = file.bones[0]!.name;
  const timeline = timelinesOf(file, 'walk').find((t) => t.type === 'bone' && t.target !== root);
  if (timeline?.target === undefined) throw new Error('a walk não anima osso nenhum');
  return timeline.target;
}

// ---------------------------------------------------------------------------

describe('as teclas e a barra com uma animação aberta', () => {
  // Degrau 7, tarefa 7.1 (G1): a tecla do Criar osso passou de `N` para `B`,
  // e o `N` ficou livre. O que este teste prova continua sendo o mesmo — a
  // tecla não pergunta o modo —, com a letra de hoje.
  it('B, O e X escolhem Criar osso, Ponto e Caixa — a tecla não pergunta o modo', () => {
    expect(toolOfKey('b')?.id).toBe('create-bone');
    expect(toolOfKey('o')?.id).toBe('point');
    expect(toolOfKey('x')?.id).toBe('box');
    expect(toolOfKey('n')).toBe(null);
  });

  it('Malha e Pesos valem sempre: `modes` saiu do contrato (degrau 4a, M4)', () => {
    expect(toolOfKey('m')?.id).toBe('mesh');
    expect(toolOfKey('g')?.id).toBe('weights');
    for (const id of ['mesh', 'weights', 'create-bone', 'point', 'box']) {
      expect(getTool(id), id).not.toBeNull();
      expect('modes' in getTool(id)!, id).toBe(false);
    }
  });

  it('o rodapé do osso novo com uma animação aberta diz que foi para a base', () => {
    expect(NEW_BONE_IN_ANIMATION).toBe('Osso novo foi para a base e vale em todas as animações');
  });
});

describe('criar osso em Animando', () => {
  function posed(t: number | null): Skeleton {
    const data = loadSkeletonData(heroi());
    const skeleton = new Skeleton(data);
    if (t === null) {
      skeleton.setToSetupPose();
      skeleton.updateWorldTransform(0);
    } else {
      pose(skeleton, data.animations.find((a) => a.name === 'walk')!, t, 0);
    }
    return skeleton;
  }

  it('o osso é medido contra a pose ANIMADA do pai: nasce onde foi desenhado', () => {
    const animado = posed(0.4);
    const repousado = posed(null);
    // Um pai que a walk GIRA de verdade em 0,4 s: ângulo no mundo mudado em
    // mais de 5° contra a Montagem. (O `hips` só sobe e desce.)
    const angle = (b: { a: number; c: number }): number => Math.atan2(b.c, b.a) * 180 / Math.PI;
    const pai = animado.bones.map((b) => b.data.name).find((name) => {
      const diff = angle(animado.findBone(name)!) - angle(repousado.findBone(name)!);
      return Math.abs(((diff + 540) % 360) - 180) > 5;
    })!;
    expect(pai).toBeDefined();
    const bone = animado.findBone(pai)!;
    // Um arrasto pela direção do próprio pai, como a cena o mostra em 0,4 s.
    const from = { x: bone.worldX, y: bone.worldY };
    const to = { x: bone.worldX + 50 * bone.a, y: bone.worldY + 50 * bone.c };
    const def = describeBone(animado, pai, [], from.x, from.y, to.x, to.y, 1);
    expect(def.parent).toBe(pai);
    expect(def.x).toBeCloseTo(0, 3);
    expect(def.y).toBeCloseTo(0, 3);
    expect(def.rotation ?? 0).toBeCloseTo(0, 2);

    // O mesmo arrasto medido contra a Montagem daria outro ângulo: a animação
    // gira o pai, e é contra ela que se mede.
    const repouso = describeBone(posed(null), pai, [], from.x, from.y, to.x, to.y, 1);
    expect(Math.abs(repouso.rotation ?? 0)).toBeGreaterThan(1);
  });
});

describe('imagem solta com uma animação aberta (sempre grava: degrau 4a)', () => {
  it('appearKeys: em 0 uma chave; depois de 0, null em 0 e o nome em t', () => {
    expect(appearKeys(0, 'mao')).toEqual([{ time: 0, value: 'mao' }]);
    expect(appearKeys(0.4, 'mao')).toEqual([{ time: 0, value: null }, { time: 0.4, value: 'mao' }]);
  });

  it('o slot nasce vazio, a pele ganha o desenho, e só a walk ganha as chaves', () => {
    const file = heroi();
    const antes = JSON.stringify(file);
    const idle = JSON.stringify(file.animations!.find((a) => a.name === 'idle'));
    const command = new DropImageAsSlot(file, 'blade', 'root', [], 10, 5, { animation: 'walk', time: 0.4 });
    command.apply(docOf(file));

    expect(command.name).toBe('blade');
    expect(command.label).toBe('Trazer imagem para esta animação');
    expect(file.slots!.at(-1)).toEqual({ name: 'blade', bone: 'root' });
    const pele = file.skins!.find((s) => s.name === 'default')!;
    expect(pele.attachments!['blade']!['blade']).toMatchObject({ type: 'region', path: 'blade' });
    const linha = timelinesOf(file, 'walk')
      .find((t) => t.type === 'slot' && t.target === 'blade' && t.property === 'attachment')!;
    expect(linha.keys!.map((k) => [k.time, k.value])).toEqual([[0, null], [0.4, 'blade']]);
    expect(JSON.stringify(file.animations!.find((a) => a.name === 'idle'))).toBe(idle);

    command.revert(docOf(file));
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('em t = 0 é uma chave só', () => {
    const file = heroi();
    new DropImageAsSlot(file, 'blade', 'root', [], 0, 0, { animation: 'walk', time: 0 }).apply(docOf(file));
    const linha = timelinesOf(file, 'walk').find((t) => t.type === 'slot' && t.target === 'blade')!;
    expect(linha.keys!.map((k) => [k.time, k.value])).toEqual([[0, 'blade']]);
  });

  it('com a base aberta, como sempre: aparece em tudo', () => {
    const file = heroi();
    new DropImageAsSlot(file, 'blade', 'root', [], 0, 0).apply(docOf(file));
    expect(file.slots!.at(-1)).toEqual({ name: 'blade', bone: 'root', attachment: 'blade' });
    expect(timelinesOf(file, 'walk').some((t) => t.target === 'blade')).toBe(false);
  });

  it('o rodapé', () => {
    expect(appearNotice('mao', 0.4))
      .toBe('"mao" entra nesta animação a partir de 0,40 s. A base e as outras animações ficam sem ela');
  });
});

describe('apagar um osso animado poda as linhas dele', () => {
  it('as linhas do osso e dos filhos saem de toda animação; desfazer devolve por texto', () => {
    const file = heroi();
    const alvo = animatedBone(file);
    const antes = JSON.stringify(file);
    const doc = docOf(file);
    const command = new DeleteItems({ ...emptySelection(), bones: [alvo] });
    command.apply(doc);

    const vivos = new Set(file.bones.map((b) => b.name));
    const slots = new Set((file.slots ?? []).map((s) => s.name));
    expect(vivos.has(alvo)).toBe(false);
    for (const animation of file.animations ?? []) {
      for (const t of timelinesOf(file, animation.name)) {
        if (t.type === 'bone') expect(vivos.has(t.target!), `${animation.name}: ${t.target}`).toBe(true);
        if (t.type === 'slot' || t.type === 'deform' || t.type === 'sequence') {
          expect(slots.has(t.target!), `${animation.name}: ${t.target}`).toBe(true);
        }
      }
    }
    // O arquivo continua abrindo.
    expect(() => loadSkeletonData(file)).not.toThrow();

    command.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });
});
});

// ---------------------------------------------------------------------------
// roteiro consertos (lote 68) — era `lote68-roteiro-consertos.test.ts`
// ---------------------------------------------------------------------------

describe('roteiro consertos (lote 68)', () => {
/**
 * Lote 68 — os consertos da rodada 1 do roteiro dos 30 minutos.
 *
 * Sem DOM. O `npm run roteiro` (lote 67) deu 9 de 14. O planejador decidiu
 * três, no ROTEIRO, seção "Rodada 1 do roteiro: os consertos — lote 68":
 *
 * - passo 1: o programa abre vazio, em Montagem, com o Transformar;
 * - passo 10: o começo da animação se guarda sozinho, como o Spriter;
 * - passo 12: o Espaço toca e pausa em toda parte; Espaço + arrastar move a vista.
 */
const SRC = resolve(__dirname, '../src');

/** `torso` em x 5, sem giro; a `walk` já tem uma linha de `y` no torso, e nenhuma de `rotation` nem de `x`. */
function boneco(): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'torso', parent: 'root', x: 5, length: 50 }],
    animations: [{
      name: 'walk',
      duration: 1,
      timelines: [{ type: 'bone', target: 'torso', property: 'y', keys: [{ time: 0.3, value: 4 }] }],
    }],
  } as unknown as BoneFile);
}

type Chave = { time: number; value: unknown };

function chaves(doc: Doc, property: string): Chave[] | null {
  const walk = doc.file.animations!.find((a) => a.name === 'walk')!;
  const linha = (walk.timelines ?? []).find((t) => (t as { target?: string }).target === 'torso'
    && (t as { property?: string }).property === property) as { keys: Chave[] } | undefined;
  return linha === undefined ? null : linha.keys.map((k) => ({ time: k.time, value: k.value }));
}

/** O ângulo de mundo do torso, em graus, no tempo `t` da `walk`. */
function anguloEm(doc: Doc, t: number): number {
  doc.time = t;
  (doc as unknown as { repose?: () => void }).repose?.();
  const b = doc.skeleton!.findBone('torso')!;
  return (Math.atan2(b.c, b.a) * 180) / Math.PI;
}

describe('passo 1: o programa abre vazio, em Montagem, com o Transformar', () => {
  it('o documento do começo: um root, nenhum slot, Montagem; a ferramenta é Transformar', () => {
    const doc = new Doc(createEmptyFile());
    expect(doc.file.bones.map((b) => b.name)).toEqual(['root']);
    expect(doc.file.slots ?? []).toEqual([]);
    expect(doc.animation).toBeNull();
    expect(START_TOOL).toBe('transform');
  });

  it('o main.ts não abre mais o herói ao começar; o Abrir exemplo cai em Montagem', () => {
    const main = readFileSync(resolve(SRC, 'main.ts'), 'utf8');
    expect(main).not.toContain('await abrirExemplo();');
    expect(main).toContain("registerAction('abrir-exemplo'");
    expect(main).toContain('switchAnimation(doc, null);');
    const cena = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8');
    expect(cena).toContain("'Arquivo → Abrir pasta do projeto… e arraste as peças'");
  });

  it('a cena vazia mostra as boas-vindas já ao abrir, sem esperar o documento mudar', () => {
    // Achado no roteiro: sem o herói entrando, nada chamava o `syncWelcome`.
    expect(isEmptyDocument(createEmptyFile(), false)).toBe(true);
    // O arquivo tem fim de linha do Windows: compara com o \n normalizado.
    const cena = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8').replace(/\r\n/g, '\n');
    expect(cena).toContain('stage.appendChild(this.welcome);\n    // Lote 68');
    expect(cena).toContain('requestAnimationFrame(() => this.syncWelcome());');
  });
});

describe('passo 10: o começo se guarda sozinho', () => {
  it('girar em 0,5 s para 30°: chave em 0 com o setup e em 0,5 com 30; em 0,25 são 15°', () => {
    const doc = boneco();
    switchAnimation(doc, 'walk');
    doc.time = 0.5;
    writeBoneValues(doc, 'Girar osso', 'giro', [{ bone: 'torso', key: 'rotation', value: 30 }]);
    expect(chaves(doc, 'rotation')).toEqual([{ time: 0, value: 0 }, { time: 0.5, value: 30 }]);
    expect(anguloEm(doc, 0)).toBeCloseTo(0, 6);
    expect(anguloEm(doc, 0.25)).toBeCloseTo(15, 6);
    expect(anguloEm(doc, 0.5)).toBeCloseTo(30, 6);
  });

  it('um desfazer apaga as duas chaves', () => {
    const doc = boneco();
    switchAnimation(doc, 'walk');
    const antes = JSON.stringify(doc.file);
    doc.time = 0.5;
    writeBoneValues(doc, 'Girar osso', 'giro', [{ bone: 'torso', key: 'rotation', value: 30 }]);
    doc.undo();
    expect(chaves(doc, 'rotation')).toBeNull();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('girar de novo em 0,8 s: só a chave de 0,8, porque a linha já existe', () => {
    const doc = boneco();
    switchAnimation(doc, 'walk');
    doc.time = 0.5;
    writeBoneValues(doc, 'Girar osso', 'giro-1', [{ bone: 'torso', key: 'rotation', value: 30 }]);
    doc.endMerge();
    doc.time = 0.8;
    writeBoneValues(doc, 'Girar osso', 'giro-2', [{ bone: 'torso', key: 'rotation', value: 10 }]);
    expect(chaves(doc, 'rotation')!.map((k) => k.time)).toEqual([0, 0.5, 0.8]);
  });

  it('pelo campo (setPropertyOrKey): linha nova ganha o começo; linha que já existe, não', () => {
    const doc = boneco();
    switchAnimation(doc, 'walk');
    doc.time = 0.5;
    setPropertyOrKey(doc, boneTarget('torso', 'x'), 12);
    expect(chaves(doc, 'x')).toEqual([{ time: 0, value: 5 }, { time: 0.5, value: 12 }]);
    doc.time = 0.7;
    setPropertyOrKey(doc, boneTarget('torso', 'y'), 9);
    expect(chaves(doc, 'y')!.map((k) => k.time)).toEqual([0.3, 0.7]);
  });

  it('em 0 não há começo a guardar: uma chave só', () => {
    const doc = boneco();
    switchAnimation(doc, 'walk');
    doc.time = 0;
    writeBoneValues(doc, 'Girar osso', 'giro', [{ bone: 'torso', key: 'rotation', value: 30 }]);
    expect(chaves(doc, 'rotation')).toEqual([{ time: 0, value: 30 }]);
    expect(keepStartKey(doc.file, 'walk', 0, boneTarget('torso', 'x'))).toBe(false);
  });
});

describe('passo 12: o Espaço toca em toda parte', () => {
  it('spaceGesture: soltar sem arrastar toca; depois de arrastar 4 px, foi mover a vista', () => {
    expect(SPACE_PAN_PIXELS).toBe(4);
    expect(spaceGesture(0, 100, 0)).toBe('tocar');
    expect(spaceGesture(0, 100, 3.9)).toBe('tocar');
    expect(spaceGesture(0, 400, 4)).toBe('pan');
    // Segurar parado e soltar ainda é tocar: só o arrasto decide.
    expect(spaceGesture(0, 3000, 0)).toBe('tocar');
  });

  it('a cena toca na subida do Espaço sem arrasto; a decisão antiga saiu', () => {
    // Normalizado: com \r\n, o `not.toContain` de duas linhas passaria sem provar nada.
    const cena = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8').replace(/\r\n/g, '\n');
    expect(cena).toContain("spaceGesture(this.spaceDownAt, e.timeStamp, this.spaceMoved) === 'tocar') runAction('tocar')");
    expect(cena).not.toContain('quem está com o\n      // foco decide');
    expect(cena).not.toContain('fora dela ele toca');
    const folha = readFileSync(resolve(SRC, 'panels/dopesheet-model.ts'), 'utf8');
    expect(folha).toContain('Espaço, em qualquer lugar');
  });

  it('Ajuda → Atalhos lista o Espaço + arrastar', () => {
    expect(SCENE_GESTURE_ROWS[0]).toEqual({ menu: 'Cena', item: 'Mover a vista', shortcut: 'Espaço + arrastar' });
    // Lote 66: as quatro teclas da ordem entraram depois do Espaço.
    expect(SCENE_GESTURE_ROWS.map((row) => row.shortcut))
      .toEqual(['Espaço + arrastar', 'Ctrl+↑', 'Ctrl+↓', 'Ctrl+→', 'Ctrl+←']);
    // Lote A5a: Ajuda → Atalhos mora em `shell-actions.ts`, com a casca por parâmetro.
    const casca = readFileSync(resolve(SRC, 'ui/shell-actions.ts'), 'utf8');
    // Lote A1: menus, ferramentas e cena saem da mesma tabela, `ui/keys.ts`.
    // Degrau 11, lote 2: a mesma tabela vai para a janela que também troca tecla.
    expect(casca).toContain('showKeysDialog({ table: keyTable(shell.groups()) })');
    const menus = readFileSync(resolve(SRC, 'ui/menus.ts'), 'utf8');
    expect(menus).toContain("open('Tocar / Pausar', 'tocar', 'Espaço')");
  });
});
});


// ---------------------------------------------------------------------------
// A altura do painel — 13/09/2026
// ---------------------------------------------------------------------------

describe('a aba Animações cabe: o recheio do corpo foi para a lista', () => {
/**
 * A medição de altura achou 21 px de sobra em 1280×720 — pequeno e real. A
 * causa não era a lista: essa já rola, e está marcada como lista. Era o
 * `padding: 4px 0 16px` do `.painel-corpo`, que **não encolhe**: num painel
 * baixo esses 20 px eram o mínimo irredutível do corpo, e faziam o painel
 * INTEIRO passar da altura.
 *
 * O mesmo espaço foi para dentro da lista, que rola: ele continua embaixo da
 * última animação, e o corpo já pode encolher até sumir. A régua de verdade é
 * o `npm run medir`, com o navegador aberto nas duas medidas.
 */
  const ts = readFileSync(resolve(__dirname, '../src/panels/animations.ts'), 'utf8');
  const css = readFileSync(resolve(__dirname, '../src/panels/animations.css'), 'utf8');

  it('o corpo da aba tem classe própria, ao lado da comum', () => {
    expect(ts).toContain("el('div', 'painel-corpo anim-corpo')");
  });

  it('o corpo não tem recheio em cima nem embaixo', () => {
    expect(css).toMatch(/\.anim-corpo\s*\{[^}]*padding-top:\s*0/);
    expect(css).toMatch(/\.anim-corpo\s*\{[^}]*padding-bottom:\s*0/);
  });

  it('a lista recebeu o recheio de volta, e continua rolando', () => {
    const bloco = /\.anim-lista\s*\{([^}]*)\}/.exec(css);
    expect(bloco).not.toBeNull();
    expect(bloco![1]).toContain('padding: 4px 0 16px;');
    expect(bloco![1]).toContain('overflow-y: auto;');
  });

  it('as linhas de referência continuam: as duas listas somam o mínimo de antes', () => {
    // Foi uma decisão, e está no comentário da folha desde o lote 65: com uma
    // linha só, o animador perde a referência de onde está. O degrau 5 pôs a
    // lista Corpos em cima (M8), e o mínimo passou a ser a SOMA das duas — a
    // regra é a mesma, e o número que ela protege não caiu.
    const animacoes = /\.anim-lista\s*\{[^}]*min-height:\s*(\d+)px/.exec(css);
    const corpos = /\.anim-corpos\s*\{[^}]*min-height:\s*(\d+)px/.exec(css);
    expect(animacoes).not.toBeNull();
    expect(corpos).not.toBeNull();
    expect(Number(animacoes![1]) + Number(corpos![1])).toBeGreaterThanOrEqual(136);
  });

  it('a lista é marcada como lista, e a medição de altura a deixa em paz', () => {
    expect(ts).toContain("body.dataset.rolagem = 'lista';");
  });
});

// ---------------------------------------------------------------------------
// A janela Animação — degrau 5 (17/09/2026): Corpos em cima, Animações embaixo
// ---------------------------------------------------------------------------

import { parseBoneText } from '../../runtime/src/index.js';
import { Projeto, emptyManifest, readProjectLists, writeProjectLists } from '../src/doc/projeto.js';
import type { ProjectManifest } from '../src/doc/projeto.js';
import {
  bakeBaseAt, bodyUriFor, listBodies, listEntityUris, newBaseNotice,
} from '../src/panels/animations-model.js';
import { demoteBody, openBody, promoteEntity, saveAsNewBase } from '../src/panels/animations-actions.js';
import { bodyHint } from '../src/panels/animations.js';
import { AddBone as AddBoneNaArvoreD5 } from '../src/panels/tree-commands.js';

/**
 * As entradas DE DENTRO de um submenu, achado pelo rótulo no nível de cima do
 * menu — 29/09/2026, apontado pelo chat G (regra 28). Um teste cujo nome diz
 * "em X → Y ▸" tem de olhar dentro de Y: `flatEntries` sozinho acha o item
 * onde quer que ele more, e o nome passaria a mentir se o item mudasse de
 * submenu. Vazio quando o submenu não existe.
 */
function dentroDe(menu: readonly MenuItem[], submenu: string): MenuEntry[] {
  const pai = menu.find((item): item is MenuEntry => 'label' in item && item.label === submenu);
  return flatEntries(pai?.children ?? []);
}


describe('a janela Animação: Corpos em cima, Animações embaixo (degrau 5)', () => {
/**
 * Degrau 5 — a ordem do Humberto: *"a lista Corpos em cima, Animações do corpo
 * embaixo; clicar no corpo sem animação abre a base. Salvar como base nova.
 * Promover e rebaixar, entidade e corpo."*
 *
 * Sem DOM, como manda a regra 8: o que se prova é o modelo (`listBodies`,
 * `bakeBaseAt`), as ações (`openBody`, `saveAsNewBase`, `demoteBody`,
 * `promoteEntity`) e o projeto por baixo delas. A folha e o `.ts` do painel
 * entram como TEXTO, que é como os outros painéis se provam aqui.
 */
const CASO290 = resolve(__dirname, '..', '..', 'conformidade', 'casos', 'C-290-virada-corte-seco');

function corpoDoCaso(nome: string): BoneFile {
  return parseBoneText(readFileSync(join(CASO290, nome), 'utf8')) as BoneFile;
}

function manifestoDeDois(): ProjectManifest {
  return writeProjectLists(emptyManifest('entrada.bone'), {
    corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
  });
}

/** O projeto do homem e do lobisomem, montado como a casca monta. */
function projetoDeDois(): { doc: Doc; projeto: Projeto } {
  const doc = new Doc(createEmptyFile());
  const projeto = new Projeto(doc);
  const manifest = manifestoDeDois();
  projeto.open(manifest, readProjectLists(manifest), new Map([
    ['entrada.bone', { file: corpoDoCaso('entrada.bone'), options: {} }],
    ['lobisomem.bone', { file: corpoDoCaso('lobisomem.bone'), options: {} }],
  ]));
  return { doc, projeto };
}

// --- 5.1 · a lista Corpos --------------------------------------------------

it('um documento sem projeto é um corpo só, e ele está em foco', () => {
  const doc = new Doc(corpoDoCaso('entrada.bone'), { path: 'entrada.bone' });
  const rows = listBodies(doc);
  expect(rows).toHaveLength(1);
  expect(rows[0]!.uri).toBe('entrada.bone');
  expect(rows[0]!.name).toBe('homem');
  expect(rows[0]!.focused).toBe(true);
  expect(rows[0]!.animations).toBe(1);
});

it('um projeto de dois corpos mostra os dois, com as animações de cada um', () => {
  const { doc } = projetoDeDois();
  expect(listBodies(doc).map((row) => [row.name, row.animations, row.focused]))
    .toEqual([['homem', 1, true], ['lobisomem', 0, false]]);
});

it('clicar no corpo troca o foco e abre a base dele', () => {
  const { doc, projeto } = projetoDeDois();
  doc.animation = 'transformar';
  expect(openBody(doc, 'lobisomem.bone')).toBe(true);
  // A base aberta é `doc.animation === null` — o quadro 0 de §5.1.
  expect(doc.animation).toBeNull();
  // O objeto que a casca segura é o MESMO; o corpo dentro dele é outro.
  expect(projeto.emFoco).toBe(doc);
  expect(doc.file.skeleton?.name).toBe('lobisomem');
  expect(doc.path).toBe('lobisomem.bone');
  // O rabo é do lobisomem, e agora ele está na cena.
  expect(doc.skeleton?.findBone('rabo')).not.toBeNull();
  expect(listBodies(doc).map((row) => [row.name, row.focused]))
    .toEqual([['homem', false], ['lobisomem', true]]);
});

it('a lista Corpos não muda de ordem quando o foco troca', () => {
  const { doc } = projetoDeDois();
  openBody(doc, 'lobisomem.bone');
  expect(listBodies(doc).map((row) => row.uri)).toEqual(['entrada.bone', 'lobisomem.bone']);
});

it('o corpo que sai guarda a animação e o segundo em que se estava', () => {
  const { doc, projeto } = projetoDeDois();
  doc.animation = 'transformar';
  doc.time = 0.25;
  openBody(doc, 'lobisomem.bone');
  // O homem não foi fechado: ele saiu de cena com a animação dele aberta e a
  // agulha onde estava. É o documento inteiro que trocou de lugar.
  const homem = projeto.docOf('entrada.bone')!;
  expect(homem.animation).toBe('transformar');
  expect(homem.time).toBe(0.25);
  // Voltar abre a BASE, que é o que o clique promete — agulha em 0.
  openBody(doc, 'entrada.bone');
  expect(doc.file.skeleton?.name).toBe('homem');
  expect(doc.animation).toBeNull();
  expect(doc.time).toBe(0);
});

it('clicar no corpo que já está em foco só abre a base, e a barra diz isso', () => {
  const { doc } = projetoDeDois();
  doc.animation = 'transformar';
  const recados: string[] = [];
  doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });
  expect(openBody(doc, 'entrada.bone')).toBe(false);
  expect(doc.animation).toBeNull();
  expect(recados.some((texto) => texto.includes('já era a base em foco'))).toBe(true);
});

it('desfazer depois da troca de foco reverte no corpo certo', () => {
  const { doc, projeto } = projetoDeDois();
  // Um osso novo no HOMEM, com a base aberta.
  doc.animation = null;
  const passo = new AddBoneNaArvoreD5(doc.file, 'root');
  doc.run(passo);
  expect(doc.file.bones?.some((osso) => osso.name === passo.name)).toBe(true);
  // Troca para o lobisomem e desfaz: o passo é do homem, e é lá que ele volta.
  openBody(doc, 'lobisomem.bone');
  doc.undo();
  const homem = projeto.docOf('entrada.bone')!;
  expect(homem.file.skeleton?.name).toBe('homem');
  expect(homem.file.bones?.map((osso) => osso.name)).toEqual(['root', 'tronco', 'braco']);
  // E o lobisomem, que está na tela, não perdeu nem ganhou nada.
  expect(doc.file.bones?.map((osso) => osso.name)).toEqual(['root', 'tronco', 'rabo']);
});

// --- 5.3 · promover e rebaixar --------------------------------------------

it('rebaixar tira o corpo de Corpos e o põe em Entidades; promover devolve', () => {
  const { doc, projeto } = projetoDeDois();
  expect(demoteBody(doc, 'lobisomem.bone')).toBe(true);
  expect(listBodies(doc).map((row) => row.uri)).toEqual(['entrada.bone']);
  expect(listEntityUris(doc)).toEqual(['lobisomem.bone']);
  // Nada mudou no dado: o arquivo dele continua inteiro, guardado.
  expect(projeto.guardados.get('lobisomem.bone')?.file.bones).toHaveLength(3);
  expect(promoteEntity(doc, 'lobisomem.bone')).toBe(true);
  expect(listBodies(doc).map((row) => row.uri)).toEqual(['entrada.bone', 'lobisomem.bone']);
  expect(listEntityUris(doc)).toEqual([]);
});

it('rebaixar o corpo em foco é recusado, e a barra diz por quê', () => {
  const { doc } = projetoDeDois();
  const recados: string[] = [];
  doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });
  expect(demoteBody(doc, 'entrada.bone')).toBe(false);
  expect(listBodies(doc)).toHaveLength(2);
  expect(recados.some((texto) => texto.includes('abra outra base antes'))).toBe(true);
});

it('rebaixar o único corpo é recusado: um projeto sem corpo não abre', () => {
  const { doc, projeto } = projetoDeDois();
  demoteBody(doc, 'lobisomem.bone');
  expect(projeto.rebaixar('entrada.bone')).toBe('e-o-foco');
  expect(listBodies(doc)).toHaveLength(1);
});

it('promover uma entidade sem arquivo aberto não acontece, e a barra explica', () => {
  const { doc } = projetoDeDois();
  const recados: string[] = [];
  doc.on((change) => { if (change.label !== undefined) recados.push(change.label); });
  // Uma entidade que veio montada dentro de outro `.bone`: não há `.bone` dela.
  expect(promoteEntity(doc, 'espada.bone')).toBe(false);
  expect(listBodies(doc).map((row) => row.uri)).toEqual(['entrada.bone', 'lobisomem.bone']);
  expect(recados.some((texto) => texto.includes('o arquivo dele não está aberto'))).toBe(true);
});

// --- 5.2 · Salvar como base nova ------------------------------------------

it('o uri de um corpo novo limpa o nome, e não repete', () => {
  expect(bodyUriFor('lobisomem', [])).toBe('lobisomem.bone');
  expect(bodyUriFor(' lobisomem.bone ', [])).toBe('lobisomem.bone');
  expect(bodyUriFor('lobi/somem', [])).toBe('lobisomem.bone');
  expect(bodyUriFor('lobisomem', ['lobisomem.bone'])).toBe('lobisomem2.bone');
  expect(bodyUriFor('   ', [])).toBe('corpo.bone');
});

it('a base nova grava a pose de t, e a animação de origem não muda', () => {
  const { doc } = projetoDeDois();
  doc.animation = 'transformar';
  doc.time = 0.25;
  const antes = JSON.stringify(doc.file);
  const novo = bakeBaseAt(doc, 'meio');
  // Em 0,25 s: `tronco.x` vai de 0 a 40 em 1 s, `braco.rotation` de 0 a 90.
  const tronco = novo.bones!.find((osso) => osso.name === 'tronco')!;
  const braco = novo.bones!.find((osso) => osso.name === 'braco')!;
  expect(tronco.x).toBe(10);
  expect(tronco.y).toBe(100);
  expect(braco.rotation).toBe(22.5);
  expect(novo.skeleton?.name).toBe('meio');
  // O corpo de onde ela saiu não foi tocado, nem por uma vírgula.
  expect(JSON.stringify(doc.file)).toBe(antes);
});

it('o valor de fábrica sai do arquivo em vez de entrar escrito', () => {
  const { doc } = projetoDeDois();
  doc.animation = 'transformar';
  doc.time = 0;
  const novo = bakeBaseAt(doc, 'zero');
  const braco = novo.bones!.find((osso) => osso.name === 'braco')!;
  // Em 0 s o braço está como nasceu: sem giro, sem escala. Escrever
  // `"rotation": 0` e `"scaleX": 1` em cada osso não deixa o arquivo mais certo.
  expect(braco.rotation).toBeUndefined();
  expect(braco.scaleX).toBeUndefined();
  expect(Object.keys(braco).sort()).toEqual(['length', 'name', 'parent']);
});

it('o desenho à vista naquele instante é o que entra na base nova', () => {
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'troca' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'mao', bone: 'root', attachment: 'aberta' }],
    skins: [{
      name: 'default',
      attachments: {
        mao: {
          aberta: { type: 'region', width: 10, height: 10 },
          fechada: { type: 'region', width: 10, height: 10 },
        },
      },
    }],
    animations: [{
      name: 'fechar', duration: 1,
      timelines: [{
        type: 'slot', target: 'mao', property: 'attachment',
        keys: [{ time: 0, value: 'aberta' }, { time: 0.5, value: 'fechada' }],
      }],
    }],
  } as unknown as BoneFile;
  const doc = new Doc(file, { path: 'troca.bone' });
  doc.animation = 'fechar';
  doc.time = 0.75;
  const novo = bakeBaseAt(doc, 'punho');
  expect(novo.slots![0]!.attachment).toBe('fechada');
});

it('o deform daquele instante vira forma: os números entram em vertices', () => {
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    skeleton: { name: 'pano' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'pano', bone: 'root', attachment: 'pano' }],
    skins: [{
      name: 'default',
      attachments: {
        pano: {
          pano: {
            type: 'mesh',
            vertices: [0, 0, 10, 0, 10, 10, 0, 10],
            uvs: [0, 0, 1, 0, 1, 1, 0, 1],
            triangles: [0, 1, 2, 0, 2, 3],
            hull: 4,
            width: 10,
            height: 10,
          },
        },
      },
    }],
    animations: [{
      name: 'tremer', duration: 1,
      timelines: [{
        type: 'deform', target: 'pano', skin: 'default', attachment: 'pano',
        keys: [
          { time: 0, value: [0, 0, 0, 0, 0, 0, 0, 0] },
          { time: 1, value: [4, 0, 0, 0, 0, 0, 0, 0] },
        ],
      }],
    }],
  } as unknown as BoneFile;
  const doc = new Doc(file, { path: 'pano.bone' });
  doc.animation = 'tremer';
  doc.time = 0.5;
  const novo = bakeBaseAt(doc, 'pano-torto');
  const anexo = novo.skins![0]!.attachments!['pano']!['pano'] as unknown as { vertices: number[] };
  // Metade do caminho: o primeiro x anda 2 e mais nada se mexe.
  expect(anexo.vertices).toEqual([2, 0, 10, 0, 10, 10, 0, 10]);
  // E a malha do corpo de origem continua onde estava.
  const origem = doc.file.skins![0]!.attachments!['pano']!['pano'] as unknown as { vertices: number[] };
  expect(origem.vertices).toEqual([0, 0, 10, 0, 10, 10, 0, 10]);
});

it('Salvar como base nova põe o terceiro corpo em Corpos, com a pose de t', () => {
  const { doc, projeto } = projetoDeDois();
  doc.animation = 'transformar';
  doc.time = 0.25;
  const uri = saveAsNewBase(doc, 'meio');
  expect(uri).toBe('meio.bone');
  expect(listBodies(doc).map((row) => row.name)).toEqual(['homem', 'lobisomem', 'meio']);
  const novo = projeto.docOf('meio.bone')!;
  expect(novo.file.bones!.find((osso) => osso.name === 'tronco')!.x).toBe(10);
  // E o corpo em foco continua sendo o homem: criar não é abrir.
  expect(doc.file.skeleton?.name).toBe('homem');
});

it('o rodapé da base nova diz o instante e o que veio junto', () => {
  expect(newBaseNotice('meio', 0.25, 0)).toContain('pose de 0,25 s');
  expect(newBaseNotice('meio', 0.25, 0)).toContain('sem animação nenhuma');
  expect(newBaseNotice('meio', 0.5, 1)).toContain('com 1 animação copiada');
  expect(newBaseNotice('meio', 0.5, 3)).toContain('com 3 animações copiadas');
  expect(newBaseNotice('meio', 0.5, 3)).toContain('a animação de origem não mudou');
});

// --- a tela ----------------------------------------------------------------

it('a dica de um corpo diz quantas animações ele tem e o que o clique faz', () => {
  expect(bodyHint({ uri: 'a.bone', name: 'homem', animations: 0, focused: false }))
    .toBe('homem: sem animação. Clique para abrir a base desta base');
  expect(bodyHint({ uri: 'a.bone', name: 'homem', animations: 1, focused: false }))
    .toContain('1 animação');
  expect(bodyHint({ uri: 'a.bone', name: 'homem', animations: 3, focused: true }))
    .toContain('a base em foco');
});

it('a janela tem as duas listas, Corpos em cima e Animações embaixo', () => {
  const fonte = readFileSync(resolve(__dirname, '../src/panels/animations.ts'), 'utf8');
  const folha = readFileSync(resolve(__dirname, '../src/panels/animations.css'), 'utf8');
  // A ordem no DOM é a ordem na tela: Corpos, Animações, e — desde o degrau 12,
  // parte `B`, lote 2 — as que vêm **De fora** (`assets.animations`, 2.8), por
  // último, porque não são deste arquivo e não se editam aqui.
  expect(fonte).toContain('body.append(tiraCorpos, corpos, tiraAnimacoes, list, tiraDeFora, deFora)');
  expect(fonte).toContain("el('ul', 'anim-corpos')");
  expect(folha).toMatch(/\.anim-corpos\s*\{/);
  expect(folha).toMatch(/\.anim-corpo-item\s*\{/);
});

it('os dois botões do corpo nascem em ícone, com o nome na dica', () => {
  const fonte = readFileSync(resolve(__dirname, '../src/panels/animations.ts'), 'utf8');
  expect(fonte).toContain("iconButton('back-to-setup', 'Salvar como base nova'");
  expect(fonte).toContain("iconButton('ordem-fundo', 'Rebaixar a entidade'");
  expect(fonte).toContain('baseNova.title = BASE_NOVA_DICA');
  expect(fonte).toContain('rebaixar.title = REBAIXAR_DICA');
});
});

// ---------------------------------------------------------------------------
// as duas portas da biblioteca — degrau 12, parte `B` (18/09/2026)
// ---------------------------------------------------------------------------

describe('as duas portas da biblioteca (degrau 12)', () => {
/**
 * **Exportar animação… e Importar animação…** são as duas portas do que a §2.8
 * já fazia e a tela não oferecia. A conta mora em `io/export-animation.ts`; o
 * que se prova aqui é o GESTO:
 *
 * - a lista do que este corpo não tem aparece **antes** de aplicar, e a pessoa
 *   pode dizer que não — e aí nada muda no arquivo;
 * - um `.bone` sem animação nenhuma é recusado com a razão dita, e não entra
 *   calado em `assets.animations` (regra 21);
 * - os dois ids existem, um por gesto (regra 17).
 */

/** Um corpo com a convenção do humanoide e um arquivo de animações de fora. */
function corpoDaConvencao(): BoneFile {
  return JSON.parse(
    readFileSync(resolve(__dirname, '../../formato/rigs/humanoide-v1.bone'), 'utf8'),
  ) as BoneFile;
}

/** O `.bone` de fora: uma animação que mexe num osso que o corpo pode não ter. */
function deFora(osso: string): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0' },
    skeleton: { name: 'andar' },
    rig: { name: 'humanoide-v1', bones: [osso] },
    bones: [{ name: 'raiz' }],
    animations: [{
      name: 'andar',
      duration: 1,
      timelines: [
        { type: 'bone', target: osso, property: 'rotation', keys: [{ time: 0, value: 0 }] },
      ],
    }],
  } as unknown as BoneFile;
}

it('a lista do que falta chega à pergunta ANTES de o arquivo entrar', async () => {
  const doc = new Doc(corpoDaConvencao());
  let vistas: string[] = [];
  let quantas = -1;
  const entrou = await importAnimation(
    doc,
    async () => ({ uri: 'andar.bone', file: deFora('asa_inexistente') }),
    async (linhas, conta) => { vistas = linhas; quantas = conta; return true; },
  );
  expect(entrou).toBe('andar.bone');
  expect(quantas).toBe(1);
  expect(vistas).toContain('Entra a animação "andar"');
  expect(vistas.some((l) => l.includes('asa_inexistente'))).toBe(true);
  // M17 (rodada 3): reescrito de propósito. Era `assets.animations` =
  // ['andar.bone'] — só a citação, que o editor não lê. Agora ela ENTRA.
  expect(importedAnimationUris(doc.file)).toEqual([]);
  expect((doc.file.animations ?? []).map((a) => a.name)).toContain('andar');
});

it('dizer que não deixa o arquivo como estava, e o rodapé diz isso', async () => {
  const doc = new Doc(corpoDaConvencao());
  const entrou = await importAnimation(
    doc,
    async () => ({ uri: 'andar.bone', file: deFora('asa_inexistente') }),
    async () => false,
  );
  expect(entrou).toBe(null);
  expect(importedAnimationUris(doc.file)).toEqual([]);
  expect(doc.canUndo).toBe(false);
});

it('um `.bone` sem animação nenhuma é recusado com a razão dita', async () => {
  const doc = new Doc(corpoDaConvencao());
  const vazio = { ...deFora('tronco'), animations: [] } as unknown as BoneFile;
  let perguntou = false;
  const entrou = await importAnimation(
    doc,
    async () => ({ uri: 'vazio.bone', file: vazio }),
    async () => { perguntou = true; return true; },
  );
  expect(entrou).toBe(null);
  expect(perguntou).toBe(false);
  expect(importedAnimationUris(doc.file)).toEqual([]);
});

it('corpo sem animação nenhuma não abre a janela de exportar: diz por quê', async () => {
  const doc = new Doc(corpoDaConvencao());
  expect(doc.file.animations).toEqual([]);
  expect(await exportAnimation(doc)).toBe(null);
});

it('os dois gestos são dois ids, no dono `animacoes` (regra 17)', () => {
  const ids = ACTION_TABLE.filter((row) => row.owner === 'animacoes').map((row) => row.id);
  expect(ids).toContain('exportar-animacao');
  expect(ids).toContain('importar-animacao');
});

// P41 (29/09/2026): todo exportar e importar mora no menu Arquivo. As duas
// portas da biblioteca saíram de Animação e entraram nos blocos "de outro
// boneco" de Arquivo → Exportar ▸ e Arquivo → Importar ▸, com o nome dizendo
// o destino, e a dica guarda o nome velho.
it('os dois itens estão em Arquivo → Exportar ▸ e Importar ▸, com a dica dizendo o que fazem', () => {
  const exportar = dentroDe(fileMenu(), 'Exportar').find((e) => e.action === 'exportar-animacao');
  const importar = dentroDe(fileMenu(), 'Importar').find((e) => e.action === 'importar-animacao');
  // Rodada 6: "corpo" virou "base" no nome (decisão 3 do Humberto).
  expect(exportar?.label).toBe('Animações, para outra base…');
  expect(importar?.label).toBe('Animações, de outra base…');
  expect(importar?.hint).toContain('antes de aplicar');
  expect(flatEntries(animationMenu({ animating: true, loop: false })).map((e) => e.action))
    .not.toContain('exportar-animacao');
});
});

// ---------------------------------------------------------------------------
// a biblioteca na janela Animação — degrau 12, parte `B`, lote 2
// ---------------------------------------------------------------------------

describe('a biblioteca na janela Animação (degrau 12)', () => {
/**
 * **Onde as animações de fábrica aparecem**, decidido depois de olhar os três
 * programas (regra 9 da casa). O que cada um faz está escrito no cabeçalho de
 * `io/animation-library.ts`, e em uma linha:
 *
 * | Programa | O que ele faz |
 * |:---|:---|
 * | **Spine** | `File → Import → Project`, com *Animation* e *"Import into an existing skeleton"*. A importada entra na **lista normal** |
 * | **Spriter** | **não importa animação**: a *Animation palette* lista só as do projeto, e reaproveitar é `Ctrl+C` na mão |
 * | **DragonBones** | a biblioteca dele é de **recursos** (imagens). O painel Animações tem só nova · clonar · renomear · apagar |
 *
 * Segue o Spine: um botão na janela Animação, e o que chega aparece na mesma
 * janela, numa seção **De fora** com o nome do arquivo.
 */

/** O corpo da convenção, sem animação nenhuma. */
function convencao(): BoneFile {
  return JSON.parse(
    readFileSync(resolve(__dirname, '../../formato/rigs/humanoide-v1.bone'), 'utf8'),
  ) as BoneFile;
}

it('a seção "De fora" lista o que `assets.animations` cita', () => {
  const doc = new Doc(convencao());
  // Sem arquivo externo nenhum, não há linha nenhuma — e a tira fica escondida.
  expect(listExternalAnimations(doc.file)).toEqual([]);
  doc.run(new ImportAnimationFile('humanoide-v1-animacoes.bone'));
  const rows = listExternalAnimations(doc.file);
  expect(rows.map((row) => row.uri)).toEqual(['humanoide-v1-animacoes.bone']);
});

it('o editor diz o que NÃO sabe: arquivo que ele não abriu vem sem os nomes', () => {
  forgetAnimationNames();
  const doc = new Doc(convencao());
  doc.run(new ImportAnimationFile('de-outra-pessoa.bone'));
  const row = listExternalAnimations(doc.file)[0]!;
  // Nada de palpite: `null` quer dizer "o editor não abriu este arquivo".
  expect(row.names).toBe(null);
  expect(externalCount(row)).toBe('?');
  expect(externalHint(row)).toContain('não o abriu nesta sessão');
});

it('o que passou pelas mãos do editor aparece com os nomes', () => {
  forgetAnimationNames();
  rememberAnimationNames('humanoide-v1-animacoes.bone', ['parado', 'andar', 'correr', 'pular']);
  const doc = new Doc(convencao());
  doc.run(new ImportAnimationFile('humanoide-v1-animacoes.bone'));
  const row = listExternalAnimations(doc.file)[0]!;
  expect(row.names).toEqual(['parado', 'andar', 'correr', 'pular']);
  expect(externalCount(row)).toBe('4');
  expect(externalHint(row)).toContain('parado, andar, correr, pular');
});

it('a lista se redesenha quando um arquivo de fora entra (a assinatura o vê)', () => {
  // Sem as de fora na assinatura, importar não refaria a lista, e a seção "De
  // fora" só apareceria no desenho seguinte, por outro motivo.
  const fonte = readFileSync(resolve(__dirname, '../src/panels/animations.ts'), 'utf8');
  const inicio = fonte.indexOf('private shapeNow');
  const assinatura = fonte.slice(inicio, fonte.indexOf('private ', inicio + 10));
  expect(assinatura).toContain('listExternalAnimations');
});

it('trazer da biblioteca cita o nome COM QUE O ARQUIVO FOI GRAVADO, e anota os nomes', async () => {
  // Sem jsdom (regra 8): a janela é injetada, como o `pick` do importar. O que
  // se prova é o gesto — o uri que entra em `assets.animations` e o mapa de
  // nomes que faz a seção "De fora" ter o que dizer.
  forgetAnimationNames();
  const doc = new Doc(convencao());
  const quatro = factoryLibrary().find((e) => e.uri === 'humanoide-v1-animacoes.bone')!;
  const entrou = await openAnimationLibrary(
    doc, async () => ({ entry: quatro, savedAs: 'animacoes-do-heroi.bone' }),
  );
  // O uri é o nome com que a PESSOA gravou, e não o nome de dentro do
  // programa: o caminho é relativo ao `.bone` do projeto (2.8).
  expect(entrou).toBe('animacoes-do-heroi.bone');
  expect(importedAnimationUris(doc.file)).toEqual(['animacoes-do-heroi.bone']);
  const row = listExternalAnimations(doc.file)[0]!;
  expect(row.names).toEqual(['parado', 'andar', 'correr', 'pular']);
  // E desfazer tira: é um comando como qualquer outro.
  doc.undo();
  expect(importedAnimationUris(doc.file)).toEqual([]);
});

it('fechar a biblioteca sem trazer não muda o arquivo, e o rodapé diz isso', async () => {
  const doc = new Doc(convencao());
  expect(await openAnimationLibrary(doc, async () => null)).toBe(null);
  expect(importedAnimationUris(doc.file)).toEqual([]);
  expect(doc.canUndo).toBe(false);
});

it('a frase do rodapé nomeia as quatro e diz o que falta', () => {
  const quatro = factoryLibrary().find((e) => e.uri === 'humanoide-v1-animacoes.bone')!;
  const semFalta = libraryNotice({ entry: quatro, savedAs: 'animacoes.bone' }, []);
  expect(semFalta).toContain('4 animações');
  expect(semFalta).toContain('parado, andar, correr, pular');
  expect(semFalta).toContain('De fora');
  const comFalta = libraryNotice({ entry: quatro, savedAs: 'animacoes.bone' }, ['osso "coxa_e"']);
  expect(comFalta).toContain('coxa_e');
});

it('o botão da biblioteca nasce em ícone, com o nome na dica (regra 12)', () => {
  const fonte = readFileSync(resolve(__dirname, '../src/panels/animations.ts'), 'utf8');
  // Reaproveitar (04/11/2026): o ícone abre "Usar animações de outro boneco",
  // que tem as quatro de fábrica como primeira fonte (o Esqueleto padrão).
  expect(fonte).toContain("iconButton('pasta', 'Usar animações de outro boneco'");
  expect(fonte).toContain('biblioteca.title = BIBLIOTECA_DICA');
});

it('o gesto é UM id, no dono `animacoes`, e um item de menu em Animação → Animações ▸ (regras 17 e 12)', () => {
  const ids = ACTION_TABLE.filter((row) => row.owner === 'animacoes').map((row) => row.id);
  expect(ids).toContain('biblioteca-animacoes');
  // P41 (29/09/2026): a Biblioteca ficou no submenu Animações ▸.
  const entradas = dentroDe(animationMenu({ animating: true, loop: false }), 'Animações');
  const item = entradas.find((e) => e.label === 'Biblioteca de animações…');
  expect(item).toBeDefined();
  expect((item as { hint?: string }).hint).toContain('antes de trazer');
});
});

// ---------------------------------------------------------------------------
// A fila do arroz — criar, achar e renomear a animação (chat G, lote 3, 29/09/2026)
// ---------------------------------------------------------------------------

import {
  animationRowMenu as filaMenuG, baseLineLabel as filaBaseG, renameAfter as filaNasceuG,
  renameAnswer as filaRespostaG, renamedNotice as filaRenomeouG, showBodiesList as filaCorposG,
} from '../src/panels/animations-model.js';

describe('a fila do arroz — criar, achar e renomear a animação (chat G, lote 3)', () => {
  const heroiG = (): BoneFile => JSON.parse(readFileSync(
    resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;

  it('Q1/K1: a animação pedida pela Nova animação abre à vista, com o nome aberto', () => {
    expect(filaNasceuG('structure', null, 'animação', 'animação')).toEqual({ renaming: 'animação', waiting: null });
    // Abrir o arquivo não é nascer.
    expect(filaNasceuG('file', null, 'idle', 'idle')).toEqual({ renaming: null, waiting: null });
    // A biblioteca e o renomear não pedem nome: nada abre.
    expect(filaNasceuG('structure', null, null, 'andar')).toEqual({ renaming: null, waiting: null });
  });

  it('Q1/K1: criar e abrir são dois avisos — o campo de nome espera a nova ser a aberta', () => {
    // O comando entra com a velha ainda aberta: espera.
    expect(filaNasceuG('structure', null, 'animação', 'idle')).toEqual({ renaming: null, waiting: 'animação' });
    expect(filaNasceuG('structure', null, 'animação', null)).toEqual({ renaming: null, waiting: 'animação' });
    // A nova abriu: o campo de nome abre, e a espera acaba.
    expect(filaNasceuG('time', 'animação', null, 'animação')).toEqual({ renaming: 'animação', waiting: null });
    expect(filaNasceuG('time', null, null, 'idle')).toEqual({ renaming: null, waiting: null });
  });

  it('Q1/P33: com um corpo só, a lista Corpos vira UMA linha, "Base — montar"', () => {
    expect(filaCorposG(1)).toBe(false);
    expect(filaCorposG(2)).toBe(true);
    expect(filaBaseG('heroi', false)).toBe('Base — montar');
    expect(filaBaseG('lobisomem', true)).toBe('Base — montar · lobisomem');
  });

  it('Q2/K14/K2: renomear no lugar decide sem janela, e o rodapé diz "Renomeou"', () => {
    expect(filaRespostaG('animação', 'andar', true)).toEqual({ kind: 'renomear', to: 'andar' });
    expect(filaRespostaG('animação', '  andar ', true)).toEqual({ kind: 'renomear', to: 'andar' });
    expect(filaRespostaG('animação', '   ', true)).toEqual({ kind: 'cancelar' });
    expect(filaRespostaG('animação', 'animação', true)).toEqual({ kind: 'cancelar' });
    expect(filaRespostaG('animação', 'andar', false)).toEqual({ kind: 'cancelar' });
    expect(filaRenomeouG('animação', 'andar')).toBe('Renomeou a animação "animação" para "andar"');
  });

  it('Q2/K14: o painel Animações não usa mais o prompt() do navegador', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/animations.ts'), 'utf8');
    expect(fonte).not.toMatch(/window\.prompt\(/);
  });

  it('Q3: o botão direito no nome oferece o que os ícones fazem, e o cinza diz por quê', () => {
    const file = heroiG();
    expect(filaMenuG(file, 'walk').map((item) => item.id))
      .toEqual(['renomear', 'duplicar', 'topo', 'exportar', 'apagar']);
    const topo = filaMenuG(file, 'idle').find((item) => item.id === 'topo');
    expect(topo?.enabled).toBe(false);
    expect(topo?.hint).toMatch(/já é a primeira/);
  });
});

// ---------------------------------------------------------------------------
// A fila do arroz — nasce em laço, e a lista acompanha o Repetir (chat G, lote 3)
// ---------------------------------------------------------------------------

import { AddAnimation as NovaG, createdNotice as filaCriadaG } from '../src/panels/animations-model.js';
import { animationsPanel as painelAnimG } from '../src/panels/animations.js';

describe('a fila do arroz — nasce em laço, e a lista acompanha o Repetir (chat G, lote 3)', () => {
  const heroiG2 = (): BoneFile => JSON.parse(readFileSync(
    resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;

  it('K6/P18: a animação nova nasce em laço, no campo que o formato já tem', () => {
    const file = heroiG2();
    const doc = { file } as unknown as EditorDoc;
    const nova = new NovaG(file);
    nova.apply(doc);
    const criada = (file.animations ?? []).find((a) => a.name === nova.name);
    expect(criada?.loop).toBe(true);
    // Nenhum campo novo: só os que a animação vazia já tinha, mais o laço.
    expect(Object.keys(criada ?? {}).sort()).toEqual(['duration', 'loop', 'name', 'timelines']);
    nova.revert(doc);
    expect((file.animations ?? []).some((a) => a.name === nova.name)).toBe(false);
  });

  it('K6/P18: o rodapé diz que nasceu, que nasceu em laço, e qual é o passo seguinte', () => {
    expect(filaCriadaG('animação'))
      .toBe('Animação "animação" criada, em laço. Escreva o nome e aperte Enter');
  });

  it('K7: a lista ouve a mudança do Repetir — o comando dele é "transform"', () => {
    expect(painelAnimG.listensTo).toContain('transform');
  });
});

// ---------------------------------------------------------------------------
// A fila do arroz — reabrir a pasta não é criar (chat G, lote 3; roteiro, passo 14)
// ---------------------------------------------------------------------------

import { addAnimation as novaAnimG, takeNameRequest as pedidoNomeG } from '../src/panels/animations-actions.js';
import { renameAfter as nomeDepoisG } from '../src/panels/animations-model.js';

describe('a fila do arroz — reabrir a pasta não é criar (chat G, lote 3; roteiro passo 14)', () => {
  /*
   * O roteiro caiu no passo 14 (09:43 e 09:44, chat C): depois de reabrir a
   * pasta, a lista tinha ZERO `.anim-item`. A linha estava lá — como CAMPO DE
   * NOME. A lista via `[]` antes e `['animação']` depois, com ela aberta, e o
   * lote 3 contava isso como "nasceu". A forma do erro: *tomei "a lista
   * cresceu" por "alguém criou"*.
   */
  it('trocar o arquivo do documento (reabrir a pasta) nunca abre o campo de nome', () => {
    expect(nomeDepoisG('file', null, null, 'animação')).toEqual({ renaming: null, waiting: null });
    // Um pedido de antes da troca morre com o arquivo velho.
    expect(nomeDepoisG('file', 'animação', null, 'animação')).toEqual({ renaming: null, waiting: null });
  });

  it('a lista crescer sem ninguém pedir (desfazer um Apagar, importar) não abre o campo', () => {
    expect(nomeDepoisG('structure', null, null, 'animação')).toEqual({ renaming: null, waiting: null });
  });

  it('só a Nova animação pede o nome — uma vez, e ele abre quando ela for a aberta', () => {
    const doc = new Doc(createEmptyFile());
    novaAnimG(doc);
    const pedido = pedidoNomeG();
    expect(pedido).not.toBeNull();
    expect(pedido).toBe(doc.animation);
    expect(pedidoNomeG()).toBeNull();
    // O comando entra com a velha aberta: espera.
    expect(nomeDepoisG('structure', null, pedido, 'idle')).toEqual({ renaming: null, waiting: pedido });
    // Abriu: o campo abre, e a espera acaba.
    expect(nomeDepoisG('time', pedido, null, pedido)).toEqual({ renaming: pedido, waiting: null });
  });
});

// ---------------------------------------------------------------------------
// M17 (rodada 3, 04/10/2026): a mesma forma da pele — "o que eu gravo, eu não
// consigo ler". A Importar só citava o uri, e a animação não tocava.
// ---------------------------------------------------------------------------
import { buildAnimationFile as buildAnimationFileM17 } from '../src/io/export-animation.js';
import { DeleteAnimation as DeleteAnimationM17 } from '../src/panels/animations-model.js';

describe('M17: a animação exportada volta ao importar, igualzinha', () => {
  const heroi = (): Doc => new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
  const ouvir = (doc: Doc): string[] => {
    const ditos: string[] = [];
    const notice = doc.notice.bind(doc);
    doc.notice = (t: string) => { ditos.push(t); notice(t); };
    return ditos;
  };

  it('exportar → apagar → importar: o arquivo volta letra por letra, menos a POSIÇÃO na lista', async () => {
    const doc = heroi();
    const original = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
    const arquivo = JSON.parse(JSON.stringify(buildAnimationFileM17(doc.file, ['idle'])!.file, null, 2)) as BoneFile;
    doc.run(new DeleteAnimationM17('idle'));
    expect(doc.file.animations!.map((a) => a.name)).not.toContain('idle');
    const ditos = ouvir(doc);
    expect(await importAnimation(doc, async () => ({ uri: 'idle.bone', file: arquivo }), async () => true)).toBe('idle.bone');
    // A diferença, dita: ela volta no FIM da lista.
    expect(doc.file.animations!.at(-1)!.name).toBe('idle');
    const ordenado = (f: BoneFile): string => JSON.stringify({ ...f, animations: [...f.animations!].sort((a, b) => a.name.localeCompare(b.name)) }, null, 2);
    expect(ordenado(doc.file)).toBe(ordenado(original));
    expect(doc.data!.findAnimation('idle')).not.toBeNull();
    expect(ditos.at(-1)).toBe('idle.bone: a animação "idle", agora na lista de Animações');
    doc.undo();
    expect(doc.file.animations!.map((a) => a.name)).not.toContain('idle');
  });

  it('a que já existe aqui não entra por cima: vale a daqui, e o rodapé diz', async () => {
    const doc = heroi();
    const antes = JSON.stringify(doc.file.animations);
    const arquivo = buildAnimationFileM17(doc.file, ['idle'])!.file;
    const ditos = ouvir(doc);
    expect(await importAnimation(doc, async () => ({ uri: 'idle.bone', file: arquivo }), async () => true)).toBeNull();
    expect(JSON.stringify(doc.file.animations)).toBe(antes);
    expect(doc.canUndo).toBe(false);
    expect(ditos.at(-1)).toBe('idle.bone: a animação "idle" já existe nesta base. Apague ou renomeie a daqui, e importe de novo. Nada mudou');
  });
});

// ---------------------------------------------------------------------------
// Rodada 8b, C9: a entidade na lista, como uma base, com as animações dela
// ---------------------------------------------------------------------------

describe('a entidade na lista de Animações (rodada 8b, C9)', () => {
  const EXEMPLOS = resolve(import.meta.dirname, '../../formato/exemplos');
  const ler = (nome: string): BoneFile => JSON.parse(readFileSync(join(EXEMPLOS, nome), 'utf8')) as BoneFile;
  const espada = loadSkeletonData(ler('espada.bone'));

  function heroiComEspada(): Doc {
    return new Doc(ler('heroi.bone'), { path: 'heroi.bone', skeletons: new Map([['espada.bone', espada]]) });
  }

  it('a espada do herói aparece como base, com as três animações dela', () => {
    const linhas = listEntityBases(heroiComEspada());
    expect(linhas.map((l) => l.name)).toEqual(['espada']);
    expect(linhas[0]!.uri).toBe('espada.bone');
    expect(linhas[0]!.slots).toEqual(['weapon']);
    expect(linhas[0]!.animations!.map((a) => a.name)).toEqual(espada.animations.map((a) => a.name));
    expect(linhas[0]!.animations!.length).toBe(3);
  });

  it('a espada solta na cena entra na lista; a mesma espada em dois slots é uma linha só', () => {
    const doc = heroiComEspada();
    doc.run(new DropEntityAsSlotAnim(doc.file, 'espada.bone', 'forearm', ['default'], 0, 0));
    const linhas = listEntityBases(doc);
    expect(linhas.length).toBe(1);
    expect(linhas[0]!.slots).toEqual(['weapon', 'espada']);
  });

  it('o arquivo não aberto não vira lista vazia: animations é null, e a dica diz por quê (regra 21)', () => {
    const doc = new Doc(ler('heroi.bone'), { path: 'heroi.bone' });
    const linha = listEntityBases(doc)[0]!;
    expect(linha.animations).toBeNull();
    expect(entityBaseHint(linha)).toContain('não abriu espada.bone');
  });

  it('a dica diz onde ela está e quantas animações tem', () => {
    const linha = listEntityBases(heroiComEspada())[0]!;
    expect(entityBaseHint(linha)).toContain('no slot weapon, 3 animações');
  });

  it('um arquivo sem entidade não ganha linha nenhuma', () => {
    const doc = new Doc(createEmptyFile(), { path: 'vazio.bone' });
    expect(listEntityBases(doc)).toEqual([]);
  });

  it('clicar no nome escolhe o slot da entidade, e o rodapé diz onde', () => {
    const doc = heroiComEspada();
    const ditos: string[] = [];
    doc.on(() => undefined);
    const original = doc.notice.bind(doc);
    doc.notice = (t: string) => { ditos.push(t); original(t); };
    pickEntitySlots(doc, 'espada.bone', ['weapon']);
    expect(doc.selection.slots).toEqual(['weapon']);
    expect(ditos.at(-1)).toBe('Entidade espada, encaixada no slot weapon');
  });

  it('o painel desenha as entidades na mesma lista que rola, e a assinatura as conta', () => {
    const fonte = readFileSync(resolve(import.meta.dirname, '../src/panels/animations.ts'), 'utf8');
    expect(fonte).toContain('this.renderEntities(doc, list)');
    expect(fonte).toContain('[hostOfEntityView(doc), ...listEntityBases(doc)]');
  });
});

// ---------------------------------------------------------------------------
// Rodada 8b, C10: clicar numa animação da entidade, com a cena montada
// ---------------------------------------------------------------------------

describe('animar a entidade por dentro, com a cena montada (rodada 8b, C10)', () => {
  const EXEMPLOS = resolve(import.meta.dirname, '../../formato/exemplos');
  const texto = (nome: string): string => readFileSync(join(EXEMPLOS, nome), 'utf8');
  const espada = loadSkeletonData(JSON.parse(texto('espada.bone')));

  function projetoDoHeroi(comArquivo = true): { doc: Doc; projeto: Projeto; ditos: string[] } {
    if (comArquivo) rememberEntityFile('espada.bone', texto('espada.bone'));
    const doc = new Doc(JSON.parse(texto('heroi.bone')) as BoneFile, {
      path: 'heroi.bone', skeletons: new Map([['espada.bone', espada]]),
    });
    const projeto = new Projeto(doc);
    const ditos: string[] = [];
    const original = doc.notice.bind(doc);
    doc.notice = (t: string) => { ditos.push(t); original(t); };
    return { doc, projeto, ditos };
  }

  /** A raiz da espada dentro do herói, no mundo: [x, y, giro]. */
  function raizDentro(doc: Doc): number[] {
    const filho = doc.skeleton!.findSlot('weapon')!.nestedSkeleton()!.skeleton.bones[0]!;
    return [filho.worldX, filho.worldY, filho.worldRotationX];
  }

  it('o clique abre a espada como base em foco, na animação clicada', () => {
    const { doc, projeto } = projetoDoHeroi();
    expect(openEntityAnimation(doc, 'espada.bone', 'attack')).toBe(true);
    expect(projeto.emFocoUri).toBe('espada.bone');
    expect(doc.animation).toBe('attack');
    expect(doc.file.skeleton?.name ?? doc.path).toBeTruthy();
    expect(doc.file.bones.map((b) => b.name)).toEqual(['cabo', 'lamina']);
    expect(projeto.cenaMontada).toEqual({ host: 'heroi.bone', slot: 'weapon', entity: 'espada.bone', promoted: true });
  });

  it('a espada fica na mão: a raiz dela no mundo é a mesma de dentro do herói', () => {
    const { doc } = projetoDoHeroi();
    doc.time = 0;
    doc.repose();
    const dentro = raizDentro(doc);
    openEntityAnimation(doc, 'espada.bone', 'idle');
    const raiz = doc.skeleton!.bones[0]!;
    expect(raiz.worldX).toBeCloseTo(dentro[0]!, 4);
    expect(raiz.worldY).toBeCloseTo(dentro[1]!, 4);
    expect(raiz.worldRotationX).toBeCloseTo(dentro[2]!, 4);
    // E não na origem: a âncora vale.
    expect(Math.hypot(raiz.worldX, raiz.worldY)).toBeGreaterThan(10);
  });

  it('a cena montada aponta o herói e o slot da espada, para a cena desenhar em volta', () => {
    const { doc } = projetoDoHeroi();
    expect(cenaMontadaDe(doc)).toBeNull();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    const cena = cenaMontadaDe(doc)!;
    expect(cena.slot).toBe('weapon');
    expect(cena.host.file.bones.some((b) => b.name === 'forearm')).toBe(true);
  });

  it('a lista mostra o herói como a base de onde ela saiu, com as animações dele', () => {
    const { doc } = projetoDoHeroi();
    expect(hostOfEntityView(doc)).toBeNull();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    const host = hostOfEntityView(doc)!;
    expect(host.name).toBe('heroi');
    expect(host.animations!.map((a) => a.name)).toEqual(['idle', 'walk', 'attack']);
  });

  it('clicar numa animação do herói volta: o herói em foco, a espada de volta a Entidades', () => {
    const { doc, projeto, ditos } = projetoDoHeroi();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    expect(returnToHost(doc, 'walk')).toBe(true);
    expect(projeto.emFocoUri).toBe('heroi.bone');
    expect(doc.animation).toBe('walk');
    expect(projeto.cenaMontada).toBeNull();
    expect([...projeto.corpos.keys()]).toEqual(['heroi.bone']);
    expect(projeto.entidades.has('espada.bone')).toBe(true);
    expect(ditos.at(-1)).toBe('espada voltou a ser entidade em heroi, dirigida pela faixa');
  });

  it('mexida e não salva, a espada FICA em Bases, e o rodapé diz por quê (regra 21)', () => {
    const { doc, projeto, ditos } = projetoDoHeroi();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    doc.run(new SetAnimationLoopC10('attack', true));
    returnToHost(doc, null);
    expect([...projeto.corpos.keys()]).toEqual(['heroi.bone', 'espada.bone']);
    expect(doc.dirty).toBe(true);
    expect(ditos.at(-1)).toContain('ainda não foi salvo: espada fica em Bases até o Salvar');
  });

  it('o herói passa a desenhar a espada com o que se mexeu nela', () => {
    const { doc } = projetoDoHeroi();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    doc.run(new SetAnimationLoopC10('attack', true));
    returnToHost(doc, null);
    expect(doc.skeletons.get('espada.bone')!.findAnimation('attack')!.loop).toBe(true);
  });

  it('sem o arquivo da espada guardado, o clique diz por quê e não troca nada', () => {
    const { doc, projeto, ditos } = projetoDoHeroi(false);
    expect(openEntityAnimation(doc, 'outra.bone', 'idle')).toBe(false);
    expect(projeto.emFocoUri).toBe('heroi.bone');
    expect(ditos.at(-1)).toBe('outra não está encaixada em heroi');
  });

  it('clicar no nome de uma base, de dentro da espada, volta primeiro', () => {
    const { doc, projeto } = projetoDoHeroi();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    openBody(doc, 'heroi.bone');
    expect(projeto.emFocoUri).toBe('heroi.bone');
    expect(projeto.cenaMontada).toBeNull();
    expect(doc.animation).toBeNull();
  });

  it('Ctrl+Z desfaz o que se mexeu na espada, de dentro dela, num passo', () => {
    const { doc } = projetoDoHeroi();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    const antes = JSON.stringify(doc.file);
    doc.run(new SetAnimationLoopC10('attack', true));
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a âncora sai na volta: a espada guardada é de novo um documento de topo', () => {
    const { doc, projeto } = projetoDoHeroi();
    openEntityAnimation(doc, 'espada.bone', 'attack');
    returnToHost(doc, null);
    expect(projeto.guardados.get('espada.bone')!.anchored).toBe(false);
  });
});

// Rodada 47, lote 5b (notas do doc 86)
describe('rodada 47, lote 5b: a linha da animação tem dica', () => {
  const fonteR47L5b = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

  it('a linha diz nome, duração, se repete, e o que o clique faz', () => {
    expect(fonteR47L5b('panels/animations.ts')).toContain('Clique abre a animação na linha do tempo');
  });
});

// QA da noite de 04/11/2026 (obra/qa-animar): o título "Animações" da tira
// media 68,16 px numa caixa de 68 e aparecia "Animaçõ…" nas três telas — os
// seis botões e a folga de 8 px à direita não deixavam o meio pixel.
describe('o título "Animações" cabe na tira (QA da noite)', () => {
  it('a folga da direita da tira é de 4 px; a da esquerda continua 12', () => {
    const css = readFileSync(resolve(__dirname, '../src/panels/animations.css'), 'utf8');
    const regra = css.match(/\n\.anim-secao \{[^}]*\}/)?.[0] ?? '';
    expect(regra).toMatch(/padding: 2px 4px 2px 12px;/);
  });
});

// QA da noite de 04/11/2026 (obra/qa-animar): duas frases do rodapé da aba
// Animações não diziam o que aconteceu.
// 1. Escrever "andar" numa segunda animação dava "Renomeou a animação
//    "animação" para "andar2"" — o 2 sem razão. A Árvore já diz "Já existe".
// 2. Apagar dizia só "Abriu a animação "andar2"": nenhuma palavra sobre a que
//    sumiu, nem que o Ctrl+Z volta.
import { renamedNotice as renamedNoticeQA, deletedNotice as deletedNoticeQA } from '../src/panels/animations-model.js';
describe('o rodapé da aba Animações diz o que aconteceu (QA da noite)', () => {
  it('nome repetido: diz que já existe, e o nome que ficou', () => {
    expect(renamedNoticeQA('animação', 'andar2', 'andar'))
      .toBe('Já existe "andar": a animação "animação" ficou "andar2"');
  });
  it('nome livre: a frase de sempre', () => {
    expect(renamedNoticeQA('andar', 'caminhar', 'caminhar')).toBe('Renomeou a animação "andar" para "caminhar"');
    expect(renamedNoticeQA('andar', 'caminhar')).toBe('Renomeou a animação "andar" para "caminhar"');
  });
  it('apagar diz o que sumiu, o que ficou aberto e o caminho de volta', () => {
    expect(deletedNoticeQA('caminhar', 'andar2')).toBe('Apagou a animação "caminhar" (Ctrl+Z volta). Aberta agora: "andar2"');
    expect(deletedNoticeQA('andar', null)).toBe('Apagou a animação "andar" (Ctrl+Z volta). Aberta agora: a base');
  });
});
