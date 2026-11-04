/**
 * Animation tracks, crossfade and per-property mixing (requirements A5 / T5).
 *
 * Every expected number is derived by hand from the formulas written in the
 * header of `src/animation-state.ts`:
 *
 *   setup    setup   + (value - setup)   * alpha
 *   replace  current + (value - current) * alpha
 *   add      current + (value - setup)   * alpha
 *
 * and, for a crossfade of progress `m` on a track of alpha `a`,
 *
 *   a1 = a * (1 - m) / (1 - a * m)     applied first (outgoing)
 *   a2 = a * m                         applied on top (incoming)
 */

import { loadSkeletonData } from '../src/loader.js';
import { Skeleton } from '../src/skeleton.js';
import { applyAnimation } from '../src/animation.js';
import {
  AnimationState, AnimationStateData, EMPTY_ANIMATION, applyAnimationMixed, animationKeys,
  mixNumber, timelineKey, type FiredEvent,
} from '../src/index.js';
import type { AnimationData, SkeletonData } from '../src/data.js';

const header = { version: '1.0', minVersion: '1.0', generator: 'test' };

/**
 * Three bones and four animations, all with flat values so a mix is one
 * subtraction away from being checked by hand.
 *
 *  andar   arm 10, leg 40, event `passo` at 0.5, duration 1, loops
 *  atirar  arm 20, duration 1
 *  acenar  arm 30, leg 60, duration 1
 *  girar   arm keyed 0 -> 100 over 1 s, duration 1
 */
function rig(): SkeletonData {
  return loadSkeletonData({
    bone: header,
    bones: [
      { name: 'root' },
      { name: 'arm', parent: 'root', rotation: 5 },
      { name: 'leg', parent: 'root' },
    ],
    slots: [{ name: 'corpo', bone: 'root' }],
    events: [{ name: 'passo' }],
    animations: [
      {
        name: 'andar', duration: 1, loop: true,
        timelines: [
          { type: 'bone', target: 'arm', property: 'rotation', keys: [{ time: 0, value: 10 }] },
          { type: 'bone', target: 'leg', property: 'rotation', keys: [{ time: 0, value: 40 }] },
          { type: 'event', keys: [{ time: 0.5, event: 'passo' }] },
        ],
      },
      {
        name: 'atirar', duration: 1,
        timelines: [
          { type: 'bone', target: 'arm', property: 'rotation', keys: [{ time: 0, value: 20 }] },
        ],
      },
      {
        name: 'acenar', duration: 1,
        timelines: [
          { type: 'bone', target: 'arm', property: 'rotation', keys: [{ time: 0, value: 30 }] },
          { type: 'bone', target: 'leg', property: 'rotation', keys: [{ time: 0, value: 60 }] },
        ],
      },
      {
        name: 'girar', duration: 1,
        timelines: [
          { type: 'bone', target: 'arm', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 100 }] },
        ],
      },
    ],
  });
}

function anim(data: SkeletonData, name: string): AnimationData {
  const a = data.animations.find((x) => x.name === name);
  if (a === undefined) throw new Error(`animação ${name}`);
  return a;
}

function rotationOf(skeleton: Skeleton, bone: string): number {
  const b = skeleton.findBone(bone);
  if (b === null) throw new Error(bone);
  return b.rotation;
}

// ---------------------------------------------------------------------------

describe('mixNumber e timelineKey', () => {
  it('as quatro fórmulas', () => {
    expect(mixNumber(2, 1, 10, 0.5, 'setup')).toBe(1 + (10 - 1) * 0.5);
    expect(mixNumber(2, 1, 10, 0.5, 'replace')).toBe(2 + (10 - 2) * 0.5);
    expect(mixNumber(2, 1, 10, 0.5, 'add')).toBe(2 + (10 - 1) * 0.5);
    // alpha 1 escreve o valor cru, menos em `add`, que soma
    expect(mixNumber(2, 1, 10, 1, 'replace')).toBe(10);
    expect(mixNumber(2, 1, 10, 1, 'setup')).toBe(10);
    expect(mixNumber(2, 1, 10, 1, 'add')).toBe(2 + (10 - 1));
    // alpha 0 não muda nada
    expect(mixNumber(2, 1, 10, 0, 'replace')).toBe(2);
  });

  it('cada timeline tem uma identidade estável', () => {
    const data = rig();
    const andar = anim(data, 'andar');
    expect(timelineKey(andar.timelines[0])).toBe('bone:1:rotation');
    expect(timelineKey(andar.timelines[1])).toBe('bone:2:rotation');
    expect(timelineKey(andar.timelines[2])).toBe(''); // event não escreve pose
    expect([...animationKeys(andar)].sort()).toEqual(['bone:1:rotation', 'bone:2:rotation']);
  });
});

describe('applyAnimationMixed', () => {
  const data = rig();

  it('alpha 1 sobre a setup pose é igual a applyAnimation (spec 9.10)', () => {
    const a = new Skeleton(data);
    const b = new Skeleton(data);
    a.setToSetupPose();
    b.setToSetupPose();
    applyAnimation(a, anim(data, 'girar'), 0.25);
    applyAnimationMixed(b, anim(data, 'girar'), 0.25, { alpha: 1, blend: 'setup' });
    expect(rotationOf(b, 'arm')).toBe(rotationOf(a, 'arm'));
    expect(rotationOf(b, 'arm')).toBe(25);
  });

  it('máscara de ossos: fora da máscara nada é escrito', () => {
    const s = new Skeleton(data);
    s.setToSetupPose();
    applyAnimationMixed(s, anim(data, 'acenar'), 0, { boneMask: new Set([1]) });
    expect(rotationOf(s, 'arm')).toBe(30);
    expect(rotationOf(s, 'leg')).toBe(0); // setup
  });

  it('blend `first`: a primeira animação a pegar a propriedade fica com ela', () => {
    const s = new Skeleton(data);
    s.setToSetupPose();
    const written = new Set<string>();
    applyAnimationMixed(s, anim(data, 'andar'), 0, { written });
    applyAnimationMixed(s, anim(data, 'atirar'), 0, { blend: 'first', written });
    expect(rotationOf(s, 'arm')).toBe(10); // `atirar` perdeu a disputa
  });
});

describe('AnimationStateData', () => {
  it('par, depois defaultMix do arquivo, depois o padrão da tabela', () => {
    const data = loadSkeletonData({
      bone: header,
      bones: [{ name: 'root' }],
      animations: [
        { name: 'a', duration: 1, timelines: [] },
        { name: 'b', duration: 1, defaultMix: 0.3, timelines: [] },
      ],
    });
    const a = anim(data, 'a');
    const b = anim(data, 'b');
    const table = new AnimationStateData();
    table.defaultMix = 0.1;
    expect(table.getMix(a, b)).toBe(0.3); // dica do próprio arquivo (spec 4.6)
    expect(table.getMix(b, a)).toBe(0.1); // `a` não tem dica: o padrão
    table.setMix('a', 'b', 0.75);
    expect(table.getMix(a, b)).toBe(0.75); // o par vence tudo
    table.clearMix('a', 'b');
    expect(table.getMix(a, b)).toBe(0.3);
  });
});

describe('mistura entre duas animações da mesma camada (crossfade)', () => {
  const data = rig();

  it('no meio da transição o valor é o calculado à mão', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    state.setAnimation(0, anim(data, 'atirar'), false, 0.4);
    state.update(0.2); // m = 0.2 / 0.4 = 0.5
    state.apply(s);
    // a = 1 -> a1 = (1 * 0.5) / (1 - 0.5) = 1, a2 = 0.5
    // arm = 10, depois 10 + (20 - 10) * 0.5 = 15
    expect(state.getCurrent(0)?.mixProgress).toBeCloseTo(0.5, 12);
    expect(rotationOf(s, 'arm')).toBeCloseTo(15, 12);
  });

  it('a um quarto da transição', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    state.setAnimation(0, anim(data, 'atirar'), false, 0.4);
    state.update(0.1); // m = 0.25
    state.apply(s);
    expect(rotationOf(s, 'arm')).toBeCloseTo(10 + (20 - 10) * 0.25, 12);
  });

  it('propriedade que só a animação de saída escreve volta para a setup pose', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    state.setAnimation(0, anim(data, 'atirar'), false, 0.4);
    state.update(0.2); // m = 0.5
    state.apply(s);
    // `atirar` não mexe na perna: ela desliza de 40 para a setup (0) com
    // alpha = a * (1 - m) = 0.5  ->  0 + (40 - 0) * 0.5 = 20
    expect(rotationOf(s, 'leg')).toBeCloseTo(20, 12);
  });

  it('no fim da transição só a animação de entrada vale', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    state.setAnimation(0, anim(data, 'atirar'), false, 0.4);
    state.update(0.4);
    state.apply(s);
    expect(state.getCurrent(0)?.mixingFrom).toBe(null);
    expect(rotationOf(s, 'arm')).toBeCloseTo(20, 12);
    expect(rotationOf(s, 'leg')).toBe(0); // de volta à setup pose
  });

  it('sem duração de mistura a troca é seca', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    state.setAnimation(0, anim(data, 'atirar'), false, 0);
    state.apply(s);
    expect(rotationOf(s, 'arm')).toBe(20);
  });
});

describe('camadas', () => {
  const data = rig();

  it('camada de cima com alpha 0,5 sobre a de baixo', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    const cima = state.setAnimation(1, anim(data, 'atirar'), false);
    cima.alpha = 0.5;
    state.apply(s);
    // 10 + (20 - 10) * 0.5
    expect(rotationOf(s, 'arm')).toBeCloseTo(15, 12);
    expect(rotationOf(s, 'leg')).toBe(40); // só a camada 0 mexe na perna
  });

  it('máscara de ossos: atirar só nos braços', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    const cima = state.setAnimation(1, anim(data, 'acenar'), false);
    cima.boneMask = new Set(['arm']);
    state.apply(s);
    expect(rotationOf(s, 'arm')).toBe(30); // a camada de cima venceu
    expect(rotationOf(s, 'leg')).toBe(40); // a perna continua andando
  });

  it('blend `add` soma a diferença para a setup pose', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    const cima = state.setAnimation(1, anim(data, 'atirar'), false);
    cima.mixBlend = 'add';
    state.apply(s);
    // setup do braço = 5; 10 + (20 - 5) * 1 = 25
    expect(rotationOf(s, 'arm')).toBe(25);
  });

  it('blend `first` perde para a camada de baixo, não para a própria', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    const cima = state.setAnimation(1, anim(data, 'acenar'), false);
    cima.mixBlend = 'first';
    state.apply(s);
    expect(rotationOf(s, 'arm')).toBe(10); // camada 0 já tinha pegado
    expect(rotationOf(s, 'leg')).toBe(40); // idem
  });

  it('alpha 0 não escreve nada', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    const cima = state.setAnimation(1, anim(data, 'atirar'), false);
    cima.alpha = 0;
    state.apply(s);
    expect(rotationOf(s, 'arm')).toBe(10);
  });
});

describe('fila de animações', () => {
  const data = rig();

  it('addAnimation com atraso troca sozinha na hora certa', () => {
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), true);
    state.addAnimation(0, anim(data, 'atirar'), false, 0.3, 0);
    expect(state.getCurrent(0)?.animation.name).toBe('andar');
    state.update(0.2);
    expect(state.getCurrent(0)?.animation.name).toBe('andar');
    state.update(0.2); // trackTime 0.4 >= 0.3
    expect(state.getCurrent(0)?.animation.name).toBe('atirar');
    expect(state.getCurrent(0)?.trackTime).toBe(0);
  });

  it('atraso 0 espera a anterior acabar, menos a mistura', () => {
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    const fila = state.addAnimation(0, anim(data, 'atirar'), false, 0, 0.25);
    expect(fila.delay).toBeCloseTo(1 - 0.25, 12); // duração 1
  });

  it('a fila anda em cadeia', () => {
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), true);
    state.addAnimation(0, anim(data, 'atirar'), false, 0.2, 0);
    state.addAnimation(0, anim(data, 'acenar'), false, 0.2, 0);
    state.update(0.25);
    expect(state.getCurrent(0)?.animation.name).toBe('atirar');
    state.update(0.25);
    expect(state.getCurrent(0)?.animation.name).toBe('acenar');
  });

  it('addAnimation numa camada vazia toca na hora', () => {
    const state = new AnimationState();
    const e = state.addAnimation(0, anim(data, 'andar'), false, 5);
    expect(state.getCurrent(0)).toBe(e);
  });
});

describe('ouvintes', () => {
  const data = rig();

  it('disparam na ordem certa numa troca com mistura', () => {
    const log: string[] = [];
    const state = new AnimationState();
    state.addListener({
      start: (e) => log.push(`start:${e.animation.name}`),
      interrupt: (e) => log.push(`interrupt:${e.animation.name}`),
      end: (e) => log.push(`end:${e.animation.name}`),
      complete: (e) => log.push(`complete:${e.animation.name}`),
      dispose: (e) => log.push(`dispose:${e.animation.name}`),
    });
    state.setAnimation(0, anim(data, 'andar'), false);
    expect(log).toEqual(['start:andar']);
    state.setAnimation(0, anim(data, 'atirar'), false, 0.4);
    expect(log).toEqual(['start:andar', 'interrupt:andar', 'start:atirar']);
    log.length = 0;
    state.update(0.4); // a mistura acaba
    expect(log).toEqual(['end:andar', 'dispose:andar']);
  });

  it('`complete` uma vez por volta e `end`/`dispose` ao limpar a camada', () => {
    const log: string[] = [];
    const state = new AnimationState();
    state.addListener({
      complete: (e) => log.push(`complete:${e.animation.name}`),
      end: (e) => log.push(`end:${e.animation.name}`),
      dispose: (e) => log.push(`dispose:${e.animation.name}`),
    });
    state.setAnimation(0, anim(data, 'andar'), true);
    for (let i = 0; i < 25; i++) state.update(0.1); // 2,5 s de uma animação de 1 s
    expect(log).toEqual(['complete:andar', 'complete:andar']);
    log.length = 0;
    state.clearTrack(0);
    expect(log).toEqual(['end:andar', 'dispose:andar']);
    expect(state.getCurrent(0)).toBe(null);
  });

  it('o ouvinte da própria entrada vem antes do ouvinte do estado', () => {
    const log: string[] = [];
    const state = new AnimationState();
    const entrada = state.setAnimation(0, anim(data, 'andar'), false);
    entrada.listener = { complete: () => log.push('entrada') };
    state.addListener({ complete: () => log.push('estado') });
    state.update(1);
    expect(log).toEqual(['entrada', 'estado']);
  });
});

describe('laço e eventos', () => {
  const data = rig();

  it('o tempo da animação dá a volta quando a entrada tem laço', () => {
    const state = new AnimationState();
    const e = state.setAnimation(0, anim(data, 'andar'), true);
    state.update(1.5);
    expect(e.trackTime).toBeCloseTo(1.5, 12);
    expect(e.animationTime).toBeCloseTo(0.5, 12);
    expect(e.isComplete).toBe(false);
  });

  it('sem laço o tempo trava na duração', () => {
    const state = new AnimationState();
    const e = state.setAnimation(0, anim(data, 'andar'), false);
    state.update(1.5);
    expect(e.animationTime).toBeCloseTo(1, 12);
    expect(e.isComplete).toBe(true);
  });

  it('velocidade da camada multiplica o tempo', () => {
    const state = new AnimationState();
    const e = state.setAnimation(0, anim(data, 'andar'), true);
    e.timeScale = 0.5;
    state.update(1);
    expect(e.trackTime).toBeCloseTo(0.5, 12);
  });

  it('um evento dispara uma vez só por volta', () => {
    const fired: FiredEvent[] = [];
    const state = new AnimationState();
    state.addListener({ event: (_e, f) => fired.push(f) });
    state.setAnimation(0, anim(data, 'andar'), true);
    for (let i = 0; i < 20; i++) state.update(0.1); // 2 s = duas voltas
    expect(fired.map((f) => f.key.event.name)).toEqual(['passo', 'passo']);
    expect(fired.map((f) => f.time)).toEqual([0.5, 1.5]);
  });

  it('sem laço o evento dispara uma vez só', () => {
    const fired: string[] = [];
    const state = new AnimationState();
    state.addListener({ event: (_e, f) => fired.push(f.key.event.name) });
    state.setAnimation(0, anim(data, 'andar'), false);
    for (let i = 0; i < 30; i++) state.update(0.1);
    expect(fired).toEqual(['passo']);
  });
});

describe('animação vazia', () => {
  const data = rig();

  it('devolve a camada à setup pose, com transição', () => {
    const s = new Skeleton(data);
    const state = new AnimationState();
    state.setAnimation(0, anim(data, 'andar'), false);
    state.setEmptyAnimation(0, 0.4);
    expect(state.getCurrent(0)?.animation).toBe(EMPTY_ANIMATION);
    state.update(0.2); // m = 0.5
    state.apply(s);
    // nada em comum: o braço desliza de 10 para a setup (5) com alpha 0,5
    expect(rotationOf(s, 'arm')).toBeCloseTo(5 + (10 - 5) * 0.5, 12);
    state.update(0.2);
    state.apply(s);
    expect(rotationOf(s, 'arm')).toBe(5);
    expect(rotationOf(s, 'leg')).toBe(0);
  });
});
