/**
 * The body switch (spec 9.13) and the `Actor`.
 *
 * What is proved here:
 *   1. `corpoEm` is the file before the first `body` key, and a pure function
 *      of `t` after it — also in a loop.
 *   2. No skeleton is rebuilt: each body is one `Skeleton` for the whole life
 *      of the actor, and going back returns the very same object.
 *   3. Timelines match the body of the instant by name; a name the body lacks
 *      is dropped with `BODY_UNMET`, once, and is not L1 even in strict mode.
 *   4. `keepSkins` passes the stack by name or resets it to `["default"]`.
 *   5. A body that was not loaded keeps the body before it, with a warning.
 *   6. A body that comes back has its physics reset; one entering for the
 *      first time is already fresh (6.5, Appendix C rule 12).
 *   7. An entity goes on in a slot of the same name with the same `uri`, and
 *      is gone, with a warning, where the new body has no such slot (7.11).
 *   8. `AnimationState.apply` and `CanvasRenderer.draw` accept the actor.
 */

import { describe, expect, it, vi } from 'vitest';

import {
  Actor, AnimationState, AnimationStateData, CanvasRenderer, NestedSkeleton, loadSkeletonData,
  type SkeletonData,
} from '../src/index.js';

const header = { version: '1.0', minVersion: '1.0', generator: 'teste virada' };

/** The man: `tronco (0, 100)` -> `braco`; one region 20x40; skins default and armadura. */
function homem(timelines: unknown[], extra: Record<string, unknown> = {}): SkeletonData {
  return loadSkeletonData({
    bone: header,
    bones: [{ name: 'root' }, { name: 'tronco', parent: 'root', y: 100 }, { name: 'braco', parent: 'tronco' }],
    slots: [{ name: 'corpo', bone: 'tronco', attachment: 'corpo' }],
    skins: [
      { name: 'default', attachments: { corpo: { corpo: { type: 'region', width: 20, height: 40 } } } },
      { name: 'armadura', attachments: { corpo: { corpo: { type: 'region', width: 24, height: 48 } } } },
    ],
    animations: [{ name: 'virar', duration: 1, timelines }],
    ...extra,
  }, { strict: true });
}

/** The werewolf: `tronco (0, 120)` -> `rabo (-10, 0)`; region 30x60; only the default skin. */
function lobisomem(): SkeletonData {
  return loadSkeletonData({
    bone: header,
    bones: [{ name: 'root' }, { name: 'tronco', parent: 'root', y: 120 }, { name: 'rabo', parent: 'tronco', x: -10 }],
    slots: [{ name: 'corpo', bone: 'tronco', attachment: 'corpo' }],
    skins: [{ name: 'default', attachments: { corpo: { corpo: { type: 'region', width: 30, height: 60 } } } }],
  });
}

const virada = { type: 'body', keys: [{ time: 0.5, value: 'lobisomem.bone' }] };

function corners(actor: Actor): number[] {
  const slot = actor.skeleton.findSlot('corpo')!;
  const att = slot.attachment as unknown as { computeWorldVertices(s: unknown): Float64Array };
  return Array.from(att.computeWorldVertices(slot), (v) => Math.round(v * 1e6) / 1e6);
}

describe('a virada de corpo: corpoEm (9.13)', () => {
  it('antes da primeira chave body vale o arquivo, e não a primeira chave', () => {
    const data = homem([virada]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const anim = data.findAnimation('virar')!;
    expect(actor.corpoEm(anim, 0).body).toBeNull();
    expect(actor.corpoEm(anim, 0.49).body).toBeNull();
    expect(actor.corpoEm(anim, 0.5).body).toBe('lobisomem.bone');
    expect(actor.corpoEm(anim, 1).body).toBe('lobisomem.bone');
  });

  it('a chave null volta ao arquivo, e a pose depende só do t (para trás e para a frente)', () => {
    const data = homem([{ type: 'body', keys: [{ time: 0.3, value: 'lobisomem.bone' }, { time: 0.6, value: null }] }]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const anim = data.findAnimation('virar')!;
    const at = (t: number): number[] => { actor.pose(anim, t); return corners(actor); };
    const homemBase = [-10, 80, 10, 80, 10, 120, -10, 120];
    const loboBase = [-15, 90, 15, 90, 15, 150, -15, 150];
    expect(at(0.8)).toEqual(homemBase);
    expect(at(0.4)).toEqual(loboBase);
    expect(at(0.1)).toEqual(homemBase);
    expect(at(0.4)).toEqual(loboBase);
    expect(actor.body).toBe('lobisomem.bone');
  });

  it('um projeto de um corpo só, sem chave body, é o esqueleto do arquivo', () => {
    const data = homem([{ type: 'bone', target: 'tronco', property: 'x', keys: [{ time: 0, value: 0 }, { time: 1, value: 40 }] }]);
    const actor = new Actor(data);
    const skeleton = actor.pose(data.findAnimation('virar')!, 0.5);
    expect(actor.body).toBeNull();
    expect(skeleton).toBe(actor.esqueletos.get(null));
    expect(skeleton.findBone('tronco')!.worldX).toBeCloseTo(20, 9);
  });
});

describe('a virada de corpo: nenhum esqueleto remontado (9.13)', () => {
  it('cada corpo é um Skeleton só, do começo ao fim, e voltar devolve o mesmo objeto', () => {
    const data = homem([virada]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const anim = data.findAnimation('virar')!;
    const homemSk = actor.esqueletos.get(null)!;
    const loboSk = actor.esqueletos.get('lobisomem.bone')!;
    expect(actor.pose(anim, 0.2)).toBe(homemSk);
    expect(actor.pose(anim, 0.7)).toBe(loboSk);
    expect(actor.pose(anim, 0.2)).toBe(homemSk);
    expect(actor.esqueletos.size).toBe(2);
    expect(actor.esqueletos.get(null)).toBe(homemSk);
    expect(actor.esqueletos.get('lobisomem.bone')).toBe(loboSk);
  });

  it('a animação é casada com cada corpo uma vez, e a mesma cópia volta do cache', () => {
    const data = homem([virada]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const anim = data.findAnimation('virar')!;
    const um = actor.animationFor(anim, 'lobisomem.bone');
    expect(um).not.toBeNull();
    expect(actor.animationFor(anim, 'lobisomem.bone')).toBe(um);
    expect(actor.animationFor(anim, null)).toBe(anim);
  });
});

describe('a virada de corpo: casamento por nome (9.13)', () => {
  const tl = [
    virada,
    { type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 90 }] },
    { type: 'bone', target: 'rabo', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 60 }] },
    { type: 'bone', target: 'tronco', property: 'x', keys: [{ time: 0, value: 0 }, { time: 1, value: 40 }] },
  ];

  it('o rabo que o homem não tem não é L1 nem em modo estrito, e avisa BODY_UNMET', () => {
    const data = homem(tl);
    expect(data.warnings.some((w) => w.message.startsWith('BODY_UNMET') && w.message.includes('"rabo"'))).toBe(true);
    expect(data.findAnimation('virar')!.timelines.some((t) => t.kind === 'bone.number' && t.bone.name === 'braco')).toBe(true);
  });

  it('depois da virada o rabo vale, o braço deixa de ser lido e o tronco vale nos dois', () => {
    const data = homem(tl);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const anim = data.findAnimation('virar')!;
    const antes = actor.pose(anim, 0.25);
    expect(antes.findBone('braco')!.arotation).toBeCloseTo(22.5, 9);
    expect(antes.findBone('rabo')).toBeNull();
    expect(antes.findBone('tronco')!.worldX).toBeCloseTo(10, 9);
    const depois = actor.pose(anim, 0.75);
    expect(depois.findBone('braco')).toBeNull();
    expect(depois.findBone('rabo')!.arotation).toBeCloseTo(45, 9);
    expect(depois.findBone('tronco')!.worldX).toBeCloseTo(30, 9);
    expect(depois.findBone('tronco')!.worldY).toBeCloseTo(120, 9);
  });

  it('o aviso BODY_UNMET do corpo novo sai uma vez só, por mais quadros que passem', () => {
    const data = homem(tl);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const anim = data.findAnimation('virar')!;
    for (let t = 0; t <= 1; t += 0.05) actor.pose(anim, t);
    const braco = actor.warnings.filter((w) => w.startsWith('BODY_UNMET') && w.includes('"braco"'));
    expect(braco).toHaveLength(1);
  });
});

describe('a virada de corpo: a pilha passa ou não passa (9.13, keepSkins)', () => {
  it('keepSkins true leva a pilha pelo nome; o nome que o corpo não tem fica fora, com aviso', () => {
    const data = homem([virada]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    actor.setSkinStack(['default', 'armadura']);
    const anim = data.findAnimation('virar')!;
    actor.pose(anim, 0.2);
    expect(corners(actor)).toEqual([-12, 76, 12, 76, 12, 124, -12, 124]);
    actor.pose(anim, 0.7);
    expect(actor.skeleton.skinStack.map((s) => s.name)).toEqual(['default']);
    expect(actor.warnings.some((w) => w.startsWith('SKIN_UNMET') && w.includes('"armadura"'))).toBe(true);
  });

  it('keepSkins false entra só com a default, e a volta ao arquivo não recupera a armadura', () => {
    const data = homem([{ type: 'body', keys: [
      { time: 0.3, value: 'lobisomem.bone', keepSkins: false },
      { time: 0.6, value: null },
    ] }]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    actor.setSkinStack(['default', 'armadura']);
    const anim = data.findAnimation('virar')!;
    expect(actor.corpoEm(anim, 0.1).stack).toEqual(['default', 'armadura']);
    expect(actor.corpoEm(anim, 0.4).stack).toEqual(['default']);
    expect(actor.corpoEm(anim, 0.7).stack).toEqual(['default']);
    actor.pose(anim, 0.7);
    expect(corners(actor)).toEqual([-10, 80, 10, 80, 10, 120, -10, 120]);
  });

  it('a pilha do jogo recusa nome que o arquivo não tem', () => {
    const actor = new Actor(homem([virada]));
    expect(() => actor.setSkinStack(['nenhuma'])).toThrow(/skin not found/);
  });
});

describe('a virada de corpo: o que falta avisa e não inventa (9.13, regra 21)', () => {
  it('corpo não carregado: fica o corpo de antes, com aviso BODY_MISSING uma vez', () => {
    const data = homem([virada]);
    const actor = new Actor(data);
    const anim = data.findAnimation('virar')!;
    actor.pose(anim, 0.7);
    actor.pose(anim, 0.9);
    expect(actor.body).toBeNull();
    expect(actor.skeleton).toBe(actor.esqueletos.get(null));
    expect(actor.warnings.filter((w) => w.startsWith('BODY_MISSING'))).toHaveLength(1);
  });

  it('física: o corpo que entra pela primeira vez já está do zero; o que VOLTA é zerado (6.5, Apêndice C 12)', () => {
    const data = homem([virada]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const anim = data.findAnimation('virar')!;
    const lobo = actor.esqueletos.get('lobisomem.bone')!;
    const homemSk = actor.esqueletos.get(null)!;
    actor.pose(anim, 0.1);
    const resetLobo = vi.spyOn(lobo, 'physicsReset');
    const resetHomem = vi.spyOn(homemSk, 'physicsReset');
    actor.pose(anim, 0.6);
    actor.pose(anim, 0.7);
    expect(resetLobo).toHaveBeenCalledTimes(0);
    actor.pose(anim, 0.2);
    expect(resetHomem).toHaveBeenCalledTimes(1);
    actor.pose(anim, 0.8);
    expect(resetLobo).toHaveBeenCalledTimes(1);
  });
});

describe('a virada de corpo: a entidade continua (7.11, 9.13)', () => {
  const espada = (): SkeletonData => loadSkeletonData({
    bone: header,
    bones: [{ name: 'root' }, { name: 'lamina', parent: 'root', x: 20 }],
    animations: [{ name: 'girar', duration: 1, timelines: [
      { type: 'bone', target: 'lamina', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 90 }] },
    ] }],
  });
  const corpoCom = (osso: string, comEspada: boolean, timelines: unknown[] = []): SkeletonData => loadSkeletonData({
    bone: header,
    bones: [{ name: 'root' }, { name: osso, parent: 'root', x: 30 }],
    slots: comEspada ? [{ name: 'espada', bone: osso, attachment: 'espada' }] : [],
    skins: comEspada
      ? [{ name: 'default', attachments: { espada: { espada: { type: 'skeleton', uri: 'espada.bone', animation: 'girar', loop: true } } } }]
      : [],
    animations: [{ name: 'virar', duration: 1, timelines }],
  }, { skeletons: new Map([['espada.bone', espada()]]) });

  it('mesmo slot e mesma uri: a instância nova herda o relógio da velha', () => {
    const data = corpoCom('mao', true, [{ type: 'body', keys: [{ time: 0.4, value: 'lobisomem.bone' }] }]);
    const actor = new Actor(data, new Map([['lobisomem.bone', corpoCom('garra', true)]]));
    const anim = data.findAnimation('virar')!;
    actor.pose(anim, 0.3);
    const velha = actor.esqueletos.get(null)!.findSlot('espada')!.nested as NestedSkeleton;
    const spy = vi.spyOn(NestedSkeleton.prototype, 'continueFrom');
    actor.pose(anim, 0.6);
    expect(spy).toHaveBeenCalledWith(velha);
    spy.mockRestore();
    const nova = actor.skeleton.findSlot('espada')!.nested as NestedSkeleton;
    expect(nova).not.toBe(velha);
    expect(nova.skeleton.findBone('lamina')!.arotation).toBeCloseTo(54, 6);
  });

  it('corpo sem o slot: a entidade some, com aviso NESTED_GONE, e nada é desenhado no lugar', () => {
    const data = corpoCom('mao', true, [{ type: 'body', keys: [{ time: 0.8, value: 'lobo.bone' }] }]);
    const actor = new Actor(data, new Map([['lobo.bone', corpoCom('tronco', false)]]));
    const anim = data.findAnimation('virar')!;
    actor.pose(anim, 0.5);
    actor.pose(anim, 0.9);
    expect(actor.skeleton.findSlot('espada')).toBeNull();
    expect(actor.warnings.some((w) => w.startsWith('NESTED_GONE') && w.includes('"espada"'))).toBe(true);
  });
});

describe('a virada de corpo: AnimationState e o desenho aceitam o actor', () => {
  it('AnimationState.apply(actor) troca para o corpo da track 0 e aplica a animação casada', () => {
    const data = homem([
      virada,
      { type: 'bone', target: 'rabo', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 60 }] },
    ]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    const state = new AnimationState(new AnimationStateData());
    state.setAnimation(0, data.findAnimation('virar')!, false);
    state.update(0.75);
    expect(state.apply(actor)).toBe(true);
    expect(actor.body).toBe('lobisomem.bone');
    actor.skeleton.updateWorldTransform(0.75);
    expect(actor.skeleton.findBone('rabo')!.arotation).toBeCloseTo(45, 6);
  });

  it('CanvasRenderer.draw(actor) desenha o corpo vivo', () => {
    const data = homem([virada]);
    const actor = new Actor(data, new Map([['lobisomem.bone', lobisomem()]]));
    actor.pose(data.findAnimation('virar')!, 0.7);
    const calls: string[] = [];
    const ctx = new Proxy({}, {
      get: (_t, key) => (key === 'canvas' ? {} : (...args: unknown[]) => { calls.push(String(key)); return args.length; }),
      set: () => true,
    }) as unknown as CanvasRenderingContext2D;
    const renderer = new CanvasRenderer(ctx);
    const drawList = vi.spyOn(renderer as unknown as { drawList: (s: unknown, d: number) => void }, 'drawList');
    renderer.draw(actor);
    expect(drawList).toHaveBeenCalledWith(actor.esqueletos.get('lobisomem.bone'), 0);
  });
});
