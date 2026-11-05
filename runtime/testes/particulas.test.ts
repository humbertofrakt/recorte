// SPDX-License-Identifier: Apache-2.0
/**
 * The side module P — extension `BONE_particles`.
 *
 * Nothing here is checked against `runtime-python/`: the Python runtime writes
 * the same spec at the same time WITHOUT looking at this one, and that is the
 * whole point. Two readers of the same sentence is what found C-299 and C-300.
 * If the two disagree, the case decides and the spec gains a line — the test is
 * never fixed so the code can pass.
 */

import { existsSync, readFileSync } from 'node:fs';
import { loadSkeletonData } from '../src/loader.js';
import { pcg, particleRandom, particleRange, PARTICLE_CHANNEL } from '../src/particles/hash.js';
import { EmissionCurve, collectBirths, type ParticleBirth, type RateKeys, type EmittingKeys } from '../src/particles/emission.js';
import { computeParticles, type EmitterFrame, type EmitterPose, type ParticleSample } from '../src/particles/emitter.js';
import type { Matrix2x3 } from '../src/math.js';
import { Skeleton } from '../src/skeleton.js';
import { collectDrawables } from '../src/render-list.js';
import { SequenceData } from '../src/attachments/sequence.js';
import { ParticleAttachment } from '../src/attachments/particle.js';
import type { SkeletonData } from '../src/data.js';

// Os casos P entraram em `conformidade/casos/` em 18/09/2026, quando os três
// leitores independentes bateram — quem os escreveu, este runtime e o Python.
// O P-002 voltou para `casos-pendentes/` no mesmo dia: ele passava sem exercitar
// o que o nome dele promete. Voltou para `casos/` em 05/11/2026, com a 2ª fase
// (a taxa animada, §4.2) em serviço e o esperado preenchido por conta à parte.
const CASOS = process.cwd().replace(/\\/g, '/') + '/conformidade/casos/';
const PENDENTES = process.cwd().replace(/\\/g, '/') + '/conformidade/casos-pendentes/';

/**
 * Onde um caso P mora AGORA. Um caso muda de pasta por decisão do Planejador, e
 * isso é normal: quem lê os casos procura nos DOIS lugares, senão o teste
 * prende o lugar em vez da coisa que o caso prova.
 */
function pastaDoCaso(folder: string): string {
  return existsSync(`${CASOS}${folder}`) ? `${CASOS}${folder}` : `${PENDENTES}${folder}`;
}

function caso(folder: string): SkeletonData {
  return loadSkeletonData(JSON.parse(readFileSync(`${pastaDoCaso(folder)}/entrada.bone`, 'utf8')) as Record<string, unknown>);
}

function esperado(folder: string): { samples: { time: number; particles: Record<string, unknown[]> }[] } {
  return JSON.parse(readFileSync(`${pastaDoCaso(folder)}/esperado.json`, 'utf8')) as never;
}

/** The emitter of a case: every one of the eight puts it in slot `fx`, placeholder `jato`. */
function emissor(data: SkeletonData, slot = 'fx', placeholder = 'jato'): ParticleAttachment {
  const s = data.findSlot(slot);
  expect(s).not.toBeNull();
  const att = data.skins[0].getAttachment(s!.index, placeholder);
  expect(att).toBeInstanceOf(ParticleAttachment);
  return att as ParticleAttachment;
}

/** Every warning the loader wrote, as one block of text. */
function avisos(data: SkeletonData): string {
  return data.warnings.map((w) => `${w.pointer}: ${w.message}`).join(' | ');
}

function births(att: ParticleAttachment, time: number, duration = 0): ParticleBirth[] {
  return collectBirths(att, new EmissionCurve(att, null), { time, duration });
}

// ---------------------------------------------------------------------------
// The chance (extension 3.2)
// ---------------------------------------------------------------------------

describe('o acaso: PCG de 32 bits (extensão BONE_particles 3.2)', () => {
  // "Um runtime que não reproduza estes cinco números NÃO implementa P. É a
  // primeira coisa a conferir, antes de qualquer caso."
  it('reproduz os cinco números de referência, exatos', () => {
    expect(pcg(0)).toBe(129708002);
    expect(pcg(42)).toBe(1223963391);
    expect(pcg(0xFFFFFFFF)).toBe(3861530882);
    expect(particleRandom(42, 0, 7, 0)).toBe(0.4190843105316162);
    expect(particleRandom(42, 0, -3, 0)).toBe(0.5181800723075867);
  });

  it('o índice negativo entra por complemento de dois, não pelo módulo', () => {
    // Case P-004 exists for exactly this: a reader that took the modulus would
    // make the previous lap a copy of the current one.
    expect(particleRandom(42, 0, -3, 0)).not.toBe(particleRandom(42, 0, 3, 0));
    expect(particleRandom(42, 0, 3, 0)).toBe(0.350787878036499);
    expect(particleRandom(42, 0, -3, 0)).toBe(particleRandom(42, 0, -3 >>> 0, 0));
  });

  it('o u fica em [0, 1) e tem 24 bits exatos', () => {
    for (let i = -50; i < 50; i++) {
      for (let c = 0; c <= 12; c++) {
        const u = particleRandom(7, 1, i, c);
        expect(u).toBeGreaterThanOrEqual(0);
        expect(u).toBeLessThan(1);
        expect(Number.isInteger(u * 16777216)).toBe(true);
      }
    }
  });

  it('os oito u da partícula 7 do P-001 batem com o leiame do caso', () => {
    const want = [
      0.4190843105316162, 0.23967969417572021, 0.343410849571228, 0.08769738674163818,
      0.19983172416687012, 0.6782218217849731, 0.7587399482727051, 0.40017545223236084,
    ];
    for (let c = 0; c < want.length; c++) expect(particleRandom(42, 0, 7, c)).toBe(want[c]);
  });

  it('0 é semente válida e dá outro resultado que 1', () => {
    expect(particleRandom(0, 0, 0, 0)).not.toBe(particleRandom(1, 0, 0, 0));
  });

  it('a tabela de canais está congelada: um número nunca muda de sentido', () => {
    expect(PARTICLE_CHANNEL).toEqual({
      LIFETIME: 0, SPEED: 1, SPREAD: 2, SHAPE_A: 3, SHAPE_B: 4, ANGLE: 5,
      ANGULAR_VELOCITY: 6, SCALE: 7, START_COLOR: 8, START_FRAME: 9,
      RANDOMNESS: 10, PROBABILITY: 11, MESH_PICK: 12,
    });
  });

  it('uma faixa [min, max] lê min + (max − min)·u', () => {
    expect(particleRange([1, 1.5], 0.4190843105316162)).toBeCloseTo(1.209542, 6);
    expect(particleRange([1, 1], 0.7)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Loading (extension 2.1, 7.4, 9)
// ---------------------------------------------------------------------------

describe('o anexo BONE_particle na carga', () => {
  it('lê os campos do P-001 com os padrões da §9', () => {
    const att = emissor(caso('P-001-posicao-fechada'));
    expect(att.type).toBe('BONE_particle');
    expect(att.seed).toBe(42);
    expect(att.rate).toBe(20);
    expect(Array.from(att.lifetime)).toEqual([1, 1.5]);
    expect(att.shape).toBe('circle');
    expect(att.shapeKnown).toBe(true);
    expect(att.radiusThickness).toBe(1);
    expect(att.space).toBe('local');
    expect(att.looping).toBe(false);
    // Not written in the file: the defaults of extension 9 fill in.
    expect(att.emitting).toBe(true);
    expect(att.prewarm).toBe(0);
    expect(att.sortMode).toBe('youngestInFront');
    expect(att.explosiveness).toBe(0);
    expect(att.randomness).toBe(0);
    expect(att.startDelay).toBe(0);
    expect(Array.from(att.gravity)).toEqual([0, -200]);
  });

  it('um tipo prefixado que este leitor NÃO conhece continua caindo no vazio da §2.5', () => {
    const data = loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
      extensionsUsed: ['ACME_glow'],
      bones: [{ name: 'root' }],
      slots: [{ name: 's', bone: 'root', attachment: 'x' }],
      skins: [{ name: 'default', attachments: { s: { x: { type: 'ACME_ribbon' } } } }],
    });
    expect(data.skins[0].getAttachment(0, 'x')).toBeNull();
    expect(avisos(data)).toContain('unknown attachment type "ACME_ribbon"');
  });

  it('shape desconhecida NÃO cai para point: o emissor não desenha, e avisa (§7.4)', () => {
    const data = loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
      extensionsUsed: ['BONE_particles'],
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'jato' }],
      skins: [{ name: 'default', attachments: { fx: { jato: { type: 'BONE_particle', shape: 'triangulo' } } } }],
    });
    const att = emissor(data, 'fx', 'jato');
    expect(att.shapeKnown).toBe(false);
    expect(avisos(data)).toContain('is NOT drawn');
  });

  it('space, sortMode, frameMode e meshMode desconhecidos caem para o padrão E avisam (§7.4)', () => {
    const data = loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
      extensionsUsed: ['BONE_particles'],
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'jato' }],
      skins: [{ name: 'default', attachments: { fx: { jato: {
        type: 'BONE_particle', space: 'galaxia', sortMode: 'aleatorio', frameMode: 'quadros', meshMode: 'pixel',
      } } } }],
    });
    const att = emissor(data, 'fx', 'jato');
    expect(att.space).toBe('local');
    expect(att.sortMode).toBe('youngestInFront');
    expect(att.frameMode).toBe('lifetime');
    expect(att.meshMode).toBe('vertex');
    const text = avisos(data);
    for (const key of ['space', 'sortMode', 'frameMode', 'meshMode']) expect(text).toContain(`unknown ${key}`);
  });

  it('rate negativo vira 0 na chave, antes de integrar (L1 RANGE_PARTICLE_RATE)', () => {
    const data = loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
      extensionsUsed: ['BONE_particles'],
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'jato' }],
      skins: [{ name: 'default', attachments: { fx: { jato: { type: 'BONE_particle', rate: -5 } } } }],
    });
    expect(emissor(data, 'fx', 'jato').rate).toBe(0);
    expect(avisos(data)).toContain('RANGE_PARTICLE_RATE');
  });

  it('prewarm com looping: true é ignorado, e o leitor avisa (§6)', () => {
    const data = loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
      extensionsUsed: ['BONE_particles'],
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'jato' }],
      skins: [{ name: 'default', attachments: { fx: { jato: { type: 'BONE_particle', looping: true, prewarm: 2 } } } }],
    });
    expect(avisos(data)).toContain('prewarm only applies with looping: false');
  });
});

// ---------------------------------------------------------------------------
// The tap: `emitting` (extension 4.1)
// ---------------------------------------------------------------------------

function comEmitting(keys: { time: number; value: boolean }[]): SkeletonData {
  const data = loadSkeletonData({
    bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
    extensionsUsed: ['BONE_particles'],
    bones: [{ name: 'root' }],
    slots: [{ name: 'fx', bone: 'root', attachment: 'jato' }],
    skins: [{ name: 'default', attachments: { fx: { jato: { type: 'BONE_particle', rate: 10, looping: false } } } }],
    animations: [{
      name: 'fumar', duration: 2,
      timelines: [{
        type: 'BONE_particle', target: 'fx', skin: 'default', attachment: 'jato', property: 'emitting',
        keys: keys.map((k) => ({ ...k, curve: 'stepped' })),
      }],
    }],
  });
  return data;
}

describe('a torneira: emitting liga e desliga (extensão 4.1)', () => {
  it('a timeline prefixada é lida, e não vira pose nenhuma', () => {
    const data = comEmitting([{ time: 0, value: true }, { time: 1, value: false }]);
    const tl = data.animations[0].timelines;
    expect(tl).toHaveLength(1);
    expect(tl[0].kind).toBe('particle.emitting');
    expect(tl[0].type).toBe('BONE_particle');
  });

  it('a integral com emitting em degraus é uma soma de retângulos, e a inversa é uma divisão', () => {
    const data = comEmitting([{ time: 0, value: true }, { time: 1, value: false }, { time: 1.5, value: true }]);
    const att = emissor(data, 'fx', 'jato');
    const tl = data.animations[0].timelines[0] as { keys: { times: Float64Array; values: readonly boolean[] } };
    const curve = new EmissionCurve(att, tl.keys);
    // rate 10 on [0,1), 0 on [1,1.5), 10 from 1.5 on.
    expect(curve.countAt(0)).toBeCloseTo(0, 12);
    expect(curve.countAt(1)).toBeCloseTo(10, 12);
    expect(curve.countAt(1.4)).toBeCloseTo(10, 12);   // the tap is shut: E is flat
    expect(curve.countAt(2)).toBeCloseTo(15, 12);
    expect(curve.rateAt(1.2)).toBe(0);
    // Index 12 is born in the stretch after the tap opens again: 1.5 + 2/10.
    expect(curve.timeOf(12)).toBeCloseTo(1.7, 12);
    // Index 10 lands exactly where the tap shuts, and the flat stretch produces
    // nobody: it is born at the start of the NEXT open stretch.
    expect(curve.timeOf(10)).toBeCloseTo(1.5, 12);
  });

  it('a timeline de emitting é lida no RELÓGIO DO ESQUELETO, e não em t − startDelay', () => {
    // A régua: o `startDelay` desloca NASCIMENTOS, que o programa gera; ele não
    // desloca CHAVES, que uma pessoa põe à mão. Se a timeline seguisse o
    // relógio do emissor, mexer no `startDelay` faria todas as chaves de
    // `emitting` andarem sem se moverem na tela — o animador veria a chave
    // parada e o efeito acontecendo noutro instante.
    const att = new ParticleAttachment('x', {
      rate: 10, lifetime: [5, 5], speed: [0, 0], startDelay: 0.2, looping: false,
    });
    const keys = { times: Float64Array.from([0, 0.5]), values: [true, false] };
    const curve = new EmissionCurve(att, keys);
    const lista = collectBirths(att, curve, { time: 1, duration: 0 })
      .map((b) => Number(b.birth.toFixed(6)))
      .sort((a, b) => a - b);
    // A torneira fecha em 0.5 DO ESQUELETO: nascem 0.2, 0.3 e 0.4, e mais
    // nenhuma. Lida em `t − startDelay`, a chave valeria em 0.7 e a lista iria
    // até 0.6 — é essa a diferença que este teste prende.
    expect(lista).toEqual([0.2, 0.3, 0.4]);
    expect(curve.rateAt(0.6)).toBe(0);
    expect(curve.rateAt(0.4)).toBe(10);
  });

  it('mexer no startDelay move os nascimentos, e NÃO move a chave', () => {
    const keys = { times: Float64Array.from([0, 0.5]), values: [true, false] };
    const fechaEm = (startDelay: number): number => {
      const att = new ParticleAttachment('x', { rate: 10, lifetime: [5, 5], speed: [0, 0], startDelay, looping: false });
      const curve = new EmissionCurve(att, keys);
      // O instante em que a torneira fecha, medido no esqueleto.
      return curve.rateAt(0.49) > 0 && curve.rateAt(0.51) === 0 ? 0.5 : -1;
    };
    // A chave fica em 0.5 para todo startDelay: ela é da pessoa, não do programa.
    expect(fechaEm(0)).toBe(0.5);
    expect(fechaEm(0.2)).toBe(0.5);
    expect(fechaEm(0.4)).toBe(0.5);
  });

  /** A rate timeline on the emitter `fx/jato`, with the given keys. */
  function comRate(keys: Record<string, unknown>[], extra: Record<string, unknown> = {}): SkeletonData {
    return loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
      extensionsUsed: ['BONE_particles'],
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'jato' }],
      skins: [{ name: 'default', attachments: { fx: { jato: { type: 'BONE_particle', ...extra } } } }],
      animations: [{
        name: 'engrossa', duration: 1,
        timelines: [{ type: 'BONE_particle', target: 'fx', skin: 'default', attachment: 'jato', property: 'rate', keys }],
      }],
    });
  }
  function curvaRate(data: SkeletonData): EmissionCurve {
    const tl = data.animations[0].timelines;
    expect(tl).toHaveLength(1);
    expect(tl[0].kind).toBe('particle.rate');
    return new EmissionCurve(emissor(data), null, (tl[0] as { keys: RateKeys }).keys);
  }

  it('2ª fase: a timeline de rate é lida, e a rampa vira parábola (E = 20·t²)', () => {
    // Extension 4.2: `rate` 0 → 40 between t = 0 and t = 1, `linear`.
    const c = curvaRate(comRate([{ time: 0, value: 0, curve: 'linear' }, { time: 1, value: 40 }]));
    expect(c.countAt(0.5)).toBeCloseTo(5, 12);
    expect(c.countAt(1)).toBeCloseTo(20, 12);
    // After the last key the last key holds: 40/s, a straight line again.
    expect(c.countAt(1.5)).toBeCloseTo(40, 12);
    expect(c.rateAt(0.25)).toBeCloseTo(10, 12);
  });

  it('P-002: a partícula 7 nasce em sqrt(7/20) = 0.591608, pela inversa estável', () => {
    const c = curvaRate(caso('P-002-taxa-em-rampa'));
    expect(c.timeOf(7)).toBeCloseTo(Math.sqrt(7 / 20), 12);
    // Index 0 sits on the boundary with rate 0: `2d / (r0 + ...)` is 0/0 there,
    // and it is born on the boundary, where E reaches it.
    expect(c.timeOf(0)).toBe(0);
    // Index 20 falls in the stretch AFTER the ramp, where s = 0: the forbidden
    // form `(−r0 + sqrt(…)) / s` gives NaN there. This is where it breaks.
    expect(c.timeOf(20)).toBe(1);
    expect(c.timeOf(32)).toBeCloseTo(1.3, 12);
  });

  it('2ª fase não muda a 1ª: rate constante em chaves dá os MESMOS bits do rate fixo', () => {
    const fixo = new EmissionCurve(emissor(comRate([], { rate: 20 })), null);
    const chaves = curvaRate(comRate([{ time: 0, value: 20, curve: 'linear' }, { time: 1, value: 20 }]));
    for (let i = 0; i < 40; i++) expect(chaves.timeOf(i)).toBe(fixo.timeOf(i));
  });

  it('chave stepped em rate: degrau, e a inversa é uma divisão', () => {
    const c = curvaRate(comRate([{ time: 0, value: 10, curve: 'stepped' }, { time: 0.5, value: 30 }]));
    expect(c.countAt(0.5)).toBeCloseTo(5, 12);
    expect(c.timeOf(4)).toBeCloseTo(0.4, 12);
    expect(c.timeOf(8)).toBeCloseTo(0.6, 12);
  });

  it('rate negativo na chave vira 0 com L1 RANGE_PARTICLE_RATE; Bézier vira linear com L2', () => {
    const data = comRate([
      { time: 0, value: -5, curve: [0.25, 0, 0.75, 1] },
      { time: 1, value: 40 },
    ]);
    expect(avisos(data)).toContain('RANGE_PARTICLE_RATE:');
    expect(avisos(data)).toContain('RANGE_PARTICLE_RATE_CURVE');
    const c = curvaRate(data);
    // 0 → 40 linear, the same parabola as P-002.
    expect(c.timeOf(7)).toBeCloseTo(Math.sqrt(7 / 20), 12);
  });

  it('emitting fechado no meio da rampa: o trecho fechado não consome índice', () => {
    const data = loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'test' },
      extensionsUsed: ['BONE_particles'],
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'jato' }],
      skins: [{ name: 'default', attachments: { fx: { jato: { type: 'BONE_particle' } } } }],
      animations: [{
        name: 'a', duration: 1,
        timelines: [
          { type: 'BONE_particle', target: 'fx', skin: 'default', attachment: 'jato', property: 'rate',
            keys: [{ time: 0, value: 0, curve: 'linear' }, { time: 1, value: 40 }] },
          { type: 'BONE_particle', target: 'fx', skin: 'default', attachment: 'jato', property: 'emitting',
            keys: [{ time: 0, value: true }, { time: 0.5, value: false }, { time: 0.75, value: true }] },
        ],
      }],
    });
    const tls = data.animations[0].timelines;
    const rate = tls.find((t) => t.kind === 'particle.rate') as unknown as { keys: RateKeys };
    const em = tls.find((t) => t.kind === 'particle.emitting') as unknown as { keys: EmittingKeys };
    const c = new EmissionCurve(emissor(data), em.keys, rate.keys);
    // E(0.5) = 20·0.25 = 5; closed until 0.75; then the ramp at 30/s, slope 40.
    expect(c.countAt(0.6)).toBeCloseTo(5, 12);
    expect(c.timeOf(5)).toBe(0.75);
    // d = 1: τ = 2 / (30 + sqrt(900 + 80)).
    expect(c.timeOf(6)).toBeCloseTo(0.75 + 2 / (30 + Math.sqrt(980)), 12);
  });
});

// ---------------------------------------------------------------------------
// Birth (extension 4, 5, 6)
// ---------------------------------------------------------------------------

describe('quando nasce (extensão 4, 5 e 6)', () => {
  it('P-001: onze nascem em t = 0.5 com rate 20, e t_i = i / 20', () => {
    const att = emissor(caso('P-001-posicao-fechada'));
    const list = births(att, 0.5).sort((a, b) => b.birth - a.birth);
    expect(list.map((p) => p.index)).toEqual([10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0]);
    expect(list[3].birth).toBeCloseTo(0.35, 12);
    expect(list.every((p) => p.flow === 0)).toBe(true);
  });

  it('P-004: o pré-aquecimento traz 23, e os índices são NEGATIVOS até −20', () => {
    const att = emissor(caso('P-004-pre-aquecimento'));
    expect(att.prewarm).toBe(1);
    const list = births(att, 0.1).sort((a, b) => b.birth - a.birth);
    expect(list).toHaveLength(23);
    expect(list[0].index).toBe(2);
    expect(list[list.length - 1].index).toBe(-20);
    expect(list[list.length - 1].birth).toBeCloseTo(-1, 12);
    // The index −3 of the leiame: `t_i = −3/20` and the reference `u`.
    const tres = list.find((p) => p.index === -3)!;
    expect(tres.birth).toBeCloseTo(-0.15, 12);
    expect(particleRandom(att.seed, 0, -3, 0)).toBe(0.5181800723075867);
  });

  it('P-005: o teto NÃO bloqueia o nascimento — doze nascem com maxParticles 5', () => {
    const att = emissor(caso('P-005-teto-de-vivas'));
    expect(att.maxParticles).toBe(5);
    const list = births(att, 0.55);
    expect(list).toHaveLength(12);
  });

  it('P-003: o laço traz as voltas de trás, e a emenda não aparece', () => {
    const att = emissor(caso('P-003-laco'));
    const list = births(att, 0.02, 1).sort((a, b) => b.birth - a.birth);
    expect(list).toHaveLength(24);
    expect(list[0]).toMatchObject({ index: 0 });
    expect(list[0].birth).toBeCloseTo(0, 12);
    expect(list[1].index).toBe(19);
    expect(list[1].birth).toBeCloseTo(-0.05, 12);
    expect(list[list.length - 1].index).toBe(17);
    expect(list[list.length - 1].birth).toBeCloseTo(-1.15, 12);
  });

  it('P-003: o acaso NÃO inclui o número da volta — só o t_i muda', () => {
    const att = emissor(caso('P-003-laco'));
    const list = births(att, 0.02, 1);
    const três = list.filter((p) => p.index === 3);
    // Whatever lap it comes from, index 3 draws the same `u` and the same life.
    for (const p of três) expect(particleRandom(att.seed, p.flow, p.index, 0)).toBe(particleRandom(42, 0, 3, 0));
  });

  it('P-003: t e t + D dão exatamente a mesma lista (a função é pura)', () => {
    const att = emissor(caso('P-003-laco'));
    // The caller wraps the time; what is proved here is that the same wrapped
    // time gives the same answer no matter how often it is asked.
    expect(births(att, 0.02, 1)).toEqual(births(att, 0.02, 1));
  });

  it('P-007: a rajada sorteia POR PARTÍCULA, no canal 11 e no fluxo dela — 6 de 10', () => {
    const att = emissor(caso('P-007-rajada-com-probabilidade'));
    expect(att.bursts).toHaveLength(1);
    expect(att.rate).toBe(0);
    const list = births(att, 0.5);
    expect(list.map((p) => p.index).sort((a, b) => a - b)).toEqual([1, 3, 5, 6, 7, 8]);
    expect(list.every((p) => p.flow === 1)).toBe(true);
    for (const p of list) expect(p.birth).toBeCloseTo(0.1, 12);
  });

  it('meia probabilidade não é metade exata: 6, e não 5', () => {
    const att = emissor(caso('P-007-rajada-com-probabilidade'));
    expect(births(att, 0.5)).toHaveLength(6);
  });

  it('a janela vem de lifetime.max: quem nasceu antes dela nem é candidato', () => {
    const att = emissor(caso('P-005-teto-de-vivas'));
    // lifetime [1, 1]: at t = 5 only the last second can still be alive.
    const list = births(att, 5);
    for (const p of list) expect(p.birth).toBeGreaterThan(4);
  });

  it('arrastar para trás e voltar devolve a MESMA lista, campo a campo (P-008)', () => {
    const att = emissor(caso('P-008-arrastar-para-tras'));
    const primeiro = births(att, 0.9, 1);
    births(att, 0.3, 1);
    const terceiro = births(att, 0.9, 1);
    expect(terceiro).toEqual(primeiro);
  });
});

// ---------------------------------------------------------------------------
// Where it is (extension 7, 8, 9)
// ---------------------------------------------------------------------------

/** The bone of P-001, P-003, P-004, P-005, P-007 and P-008: identity, never animated. */
const IDENTIDADE: Matrix2x3 = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
const POSE_PARADA: EmitterPose = { matrixAt: () => IDENTIDADE, boneLength: () => 0 };

function quadro(att: ParticleAttachment, time: number, duration = 0): EmitterFrame {
  return computeParticles(att, new EmissionCurve(att, null), { time, duration }, POSE_PARADA);
}

/** The `particles` list of one sample of an `esperado.json`, as the case wrote it. */
function esperadas(folder: string, sample: number): Record<string, number>[] {
  return esperado(folder).samples[sample].particles['fx/jato'] as never;
}

/** Six decimals, the same rounding the whole pose dump uses (spec 3.6). */
function seis(v: number): number {
  const r = Math.round(v * 1e6) / 1e6;
  return r === 0 ? 0 : r;
}

function confere(got: readonly ParticleSample[], want: Record<string, number>[]): void {
  expect(got).toHaveLength(want.length);
  for (let i = 0; i < want.length; i++) {
    const g = got[i];
    const w = want[i];
    const onde = `partícula ${i} (fluxo ${w.flow}, índice ${w.index})`;
    expect({ onde, flow: g.flow, index: g.index }).toEqual({ onde, flow: w.flow, index: w.index });
    expect({ onde, birth: seis(g.birth) }).toEqual({ onde, birth: w.birth });
    expect({ onde, life: seis(g.life) }).toEqual({ onde, life: w.life });
    expect({ onde, age: seis(g.age) }).toEqual({ onde, age: w.age });
    expect(g.x).toBeCloseTo(w.x, 3);
    expect(g.y).toBeCloseTo(w.y, 3);
    // NOT a circular distance: a reader that reduced the angle to −180..180
    // has to FAIL, and 251.145834 against −108.854166 is zero degrees apart
    // the circular way (leiame of P-001).
    expect(Math.abs(g.angle - w.angle)).toBeLessThan(1e-2);
    expect(g.scale).toBeCloseTo(w.scale, 4);
  }
}

describe('onde está: a conta fechada (extensão 7, 8 e 9)', () => {
  it('P-001: as onze partículas batem campo a campo com o esperado do caso', () => {
    const att = emissor(caso('P-001-posicao-fechada'));
    confere(quadro(att, 0.5).particles, esperadas('P-001-posicao-fechada', 0));
  });

  it('P-001: a partícula 7 é a do leiame, número por número', () => {
    const att = emissor(caso('P-001-posicao-fechada'));
    const p = quadro(att, 0.5).particles.find((q) => q.index === 7)!;
    expect(p.birth).toBeCloseTo(0.35, 12);
    expect(p.life).toBeCloseTo(1.209542, 6);
    expect(p.age).toBeCloseTo(0.15, 12);
    expect(p.x).toBeCloseTo(3.559924, 6);
    expect(p.y).toBeCloseTo(16.586731, 6);
    expect(p.angle).toBeCloseTo(251.145834, 6);
    expect(p.scale).toBeCloseTo(0.700088, 6);
  });

  it('P-001: o ângulo sai como está, e NÃO reduzido a −180..180', () => {
    const att = emissor(caso('P-001-posicao-fechada'));
    const p = quadro(att, 0.5).particles.find((q) => q.index === 7)!;
    expect(p.angle).toBeGreaterThan(180);
    expect(p.angle).not.toBeCloseTo(-108.854166, 3);
  });

  it('P-003: o laço — 24 partículas, e t e t + D dão o mesmo quadro', () => {
    const att = emissor(caso('P-003-laco'));
    confere(quadro(att, 0.02, 1).particles, esperadas('P-003-laco', 0));
    // The caller wraps the time; `1.02` and `0.02` are the same instant of the
    // lap, and the case writes the two samples as the same text on purpose.
    confere(quadro(att, 0.02, 1).particles, esperadas('P-003-laco', 1));
  });

  it('P-004: o pré-aquecimento — 23 partículas, índices até −20', () => {
    const att = emissor(caso('P-004-pre-aquecimento'));
    confere(quadro(att, 0.1).particles, esperadas('P-004-pre-aquecimento', 0));
  });

  it('P-005: o teto leva as CINCO mais novas, e conta as que cortou', () => {
    const att = emissor(caso('P-005-teto-de-vivas'));
    const f = quadro(att, 0.55);
    confere(f.particles, esperadas('P-005-teto-de-vivas', 0));
    expect(f.particles.map((p) => p.index)).toEqual([11, 10, 9, 8, 7]);
    // 12 were alive; the cap drew 5 and the other 7 are still alive, just not
    // drawn. The reader that cuts SHOULD say how many.
    expect(f.cut).toBe(7);
  });

  it('P-007: a rajada — seis, e o desempate é pelo índice DECRESCENTE', () => {
    const att = emissor(caso('P-007-rajada-com-probabilidade'));
    const f = quadro(att, 0.5);
    confere(f.particles, esperadas('P-007-rajada-com-probabilidade', 0));
    expect(f.particles.map((p) => p.index)).toEqual([8, 7, 6, 5, 3, 1]);
  });

  it('P-008: 0.9 → 0.3 → 0.9 devolve o primeiro quadro, campo a campo', () => {
    const att = emissor(caso('P-008-arrastar-para-tras'));
    const primeiro = quadro(att, 0.9, 1).particles;
    confere(primeiro, esperadas('P-008-arrastar-para-tras', 0));
    confere(quadro(att, 0.3, 1).particles, esperadas('P-008-arrastar-para-tras', 1));
    const terceiro = quadro(att, 0.9, 1).particles;
    confere(terceiro, esperadas('P-008-arrastar-para-tras', 2));
    // Not "close enough": the same numbers, field by field.
    expect(terceiro).toEqual(primeiro);
  });

  it('o arrasto usa expm1, e com k pequeno cai no ramo balístico da §8', () => {
    // The threshold is 0.00001 and a runtime MUST use exactly that number.
    const sem = new ParticleAttachment('x', {
      seed: 1, rate: 10, lifetime: [5, 5], speed: [100, 100], direction: 0, drag: 0, gravity: [0, -100], looping: false,
    });
    const quase = new ParticleAttachment('x', {
      seed: 1, rate: 10, lifetime: [5, 5], speed: [100, 100], direction: 0, drag: 0.000009, gravity: [0, -100], looping: false,
    });
    const a = quadro(sem, 1).particles[0];
    const b = quadro(quase, 1).particles[0];
    expect(b.x).toBe(a.x);
    expect(b.y).toBe(a.y);
  });

  it('a forma desconhecida não desenha nada, e diz por quê (§7.4)', () => {
    const att = new ParticleAttachment('fumaca', { shapeKnown: false, rate: 10, looping: false });
    const f = quadro(att, 1);
    expect(f.particles).toEqual([]);
    expect(f.silence?.reason).toBe('shape');
    expect(f.silence?.message).toContain('fumaca');
  });

  it('sortMode oldestInFront vira a lista, e o padrão é youngestInFront', () => {
    const data = caso('P-005-teto-de-vivas');
    const att = emissor(data);
    const novas = quadro(att, 0.55).particles.map((p) => p.index);
    const velho = new ParticleAttachment('jato', {
      seed: 42, rate: 20, lifetime: [1, 1], speed: [100, 150], direction: 90, spread: 30,
      looping: false, maxParticles: 5, sortMode: 'oldestInFront',
    });
    expect(quadro(velho, 0.55).particles.map((p) => p.index)).toEqual([...novas].reverse());
  });
});

// ---------------------------------------------------------------------------
// The drawing and the order (extension 7.1, 9.7, 9.8, 9.9)
// ---------------------------------------------------------------------------

describe('o desenho e a ordem (extensão 7, 9.7, 9.8, 9.9)', () => {
  it('o emissor entra na lista de desenho, no lugar do slot na drawOrder', () => {
    const data = caso('P-001-posicao-fechada');
    const skeleton = new Skeleton(data);
    skeleton.updateWorldTransform(0);
    const lista = collectDrawables(skeleton);
    expect(lista).toHaveLength(1);
    expect(lista[0].attachment.type).toBe('BONE_particle');
    expect(lista[0].slot.data.name).toBe('fx');
  });

  it('spherizeDirection mistura PRIMEIRO, e o leque abre em volta da base misturada', () => {
    // The confront of 18/09 decided this order, and the finding is the reason:
    // opening the fan first and mixing afterwards shrinks it by `(1 − spherize)`
    // without anybody asking, so one field would quietly resize another.
    const base = {
      seed: 5, rate: 40, lifetime: [2, 2] as number[], speed: [100, 100] as number[],
      direction: 90, spread: 45, shape: 'circle' as const, radius: 10, looping: false,
    };
    const leque = (spherize: number): number[] => {
      const att = new ParticleAttachment('x', { ...base, spherizeDirection: spherize });
      // Direction of travel: with no gravity and no drag, `p − p0` points along `v0`.
      return quadro(att, 0.5).particles.map((p) => Math.atan2(p.y, p.x));
    };
    const abertura = (angulos: number[]): number => Math.max(...angulos) - Math.min(...angulos);
    // With `spherize: 1` the fan must NOT collapse: the half-aperture is still
    // 45°, measured around the outward direction of each particle.
    expect(abertura(leque(1))).toBeGreaterThan(abertura(leque(0)) * 0.5);
  });

  it('spherizeDirection 0 deixa tudo como estava — é o caso dos oito', () => {
    const semMistura = new ParticleAttachment('x', {
      seed: 5, rate: 40, lifetime: [2, 2], speed: [100, 100], direction: 90, spread: 45,
      shape: 'circle', radius: 10, looping: false, spherizeDirection: 0,
    });
    const semCampo = new ParticleAttachment('x', {
      seed: 5, rate: 40, lifetime: [2, 2], speed: [100, 100], direction: 90, spread: 45,
      shape: 'circle', radius: 10, looping: false,
    });
    expect(quadro(semMistura, 0.5).particles).toEqual(quadro(semCampo, 0.5).particles);
  });

  it('a cor é startColor × colorOverLifetime × alphaOverLifetime (§9.7)', () => {
    const att = new ParticleAttachment('x', {
      seed: 3, rate: 10, lifetime: [1, 1], speed: [0, 0], looping: false,
      startColor: [[1, 0, 0, 1], [1, 0, 0, 1]],
      colorOverLifetime: [
        { time: 0, value: new Float64Array([1, 1, 1, 0]), curve: 'linear' },
        { time: 1, value: new Float64Array([1, 1, 1, 1]), curve: 'linear' },
      ],
      alphaOverLifetime: [
        { time: 0, value: 1, curve: 'linear' },
        { time: 1, value: 0.5, curve: 'linear' },
      ],
    });
    // The particle born at 0 is half-way through its life at t = 0.5.
    const p = quadro(att, 0.5).particles.find((q) => q.index === 0)!;
    expect(p.age).toBeCloseTo(0.5, 12);
    expect(Array.from(p.color.subarray(0, 3))).toEqual([1, 0, 0]);
    // gradient alpha 0.5, times alphaOverLifetime 0.75.
    expect(p.color[3]).toBeCloseTo(0.5 * 0.75, 10);
  });

  it('uma só u para os quatro componentes de startColor (§9.7)', () => {
    const att = new ParticleAttachment('x', {
      seed: 9, rate: 10, lifetime: [1, 1], speed: [0, 0], looping: false,
      startColor: [[0, 0, 0, 0], [1, 1, 1, 1]],
    });
    for (const p of quadro(att, 0.5).particles) {
      // One draw means the four channels come out equal, never four draws.
      expect(p.color[1]).toBe(p.color[0]);
      expect(p.color[2]).toBe(p.color[0]);
      expect(p.color[3]).toBe(p.color[0]);
      expect(p.color[0]).toBe(particleRandom(9, p.flow, p.index, 8));
    }
  });

  it('sem sequence o quadro é −1, e com sequence anda pela vida (§9.8)', () => {
    const semFolha = new ParticleAttachment('x', { seed: 1, rate: 10, lifetime: [1, 1], speed: [0, 0], looping: false });
    expect(quadro(semFolha, 0.5).particles[0].frame).toBe(-1);

    const folha = new SequenceData(['a', 'b', 'c', 'd'], 1, 0, 0);
    const comFolha = new ParticleAttachment('x', {
      seed: 1, rate: 10, lifetime: [1, 1], speed: [0, 0], looping: false, sequence: folha,
    });
    const lista = quadro(comFolha, 0.5).particles;
    // `lifetime` mode, one cycle over four frames: k = floor((a/life)·1·4).
    for (const p of lista) expect(p.frame).toBe(Math.floor((p.age / p.life) * 1 * 4 + 0.00001) % 4);
  });

  it('frameMode fps anda pelo relógio, e não pela vida (§9.8)', () => {
    const folha = new SequenceData(['a', 'b', 'c', 'd'], 1, 0, 0);
    const att = new ParticleAttachment('x', {
      seed: 1, rate: 10, lifetime: [4, 4], speed: [0, 0], looping: false,
      sequence: folha, frameMode: 'fps', fps: 10,
    });
    // The `+ 0.00001` guard of spec 9.6 is part of the conta, not a detail: an
    // age of `0.5 − 0.4` comes out as `0.09999999999999998`, and without the
    // guard the frame boundary that should land on 1 falls back to 0 through
    // the last bit of a subtraction. A reader that drops it drifts one frame on
    // exactly the boundaries an animator lines up on.
    const idade = quadro(att, 0.5).particles.map((p) => p.age);
    expect(idade.some((a) => a * 10 < 1 && a * 10 > 0.999999)).toBe(true);
    for (const p of quadro(att, 0.5).particles) {
      expect(p.frame).toBe(Math.floor(p.age * 10 + 0.00001) % 4);
    }
  });

  it('startFrame soma por cima, e o resultado volta ao intervalo (§9.8)', () => {
    const folha = new SequenceData(['a', 'b', 'c', 'd'], 1, 0, 0);
    const att = new ParticleAttachment('x', {
      seed: 1, rate: 10, lifetime: [1, 1], speed: [0, 0], looping: false,
      sequence: folha, startFrame: [3, 3],
    });
    for (const p of quadro(att, 0.5).particles) {
      expect(p.frame).toBe((Math.floor((p.age / p.life) * 4 + 0.00001) + 3) % 4);
      expect(p.frame).toBeGreaterThanOrEqual(0);
      expect(p.frame).toBeLessThan(4);
    }
  });

  it('não existe campo de mistura no emissor: a mistura é a do slot (§9.9)', () => {
    const att = emissor(caso('P-001-posicao-fechada'));
    expect(att).not.toHaveProperty('blend');
  });
});

// ---------------------------------------------------------------------------
// The three lines the spec gained from the confront (9.3.1, 9.4.1, 6)
// ---------------------------------------------------------------------------

describe('§9.3.1 — mistura primeiro, leque depois (normativo)', () => {
  /** Short way between two angles, the mix the spec names. */
  const curto = (a: number, b: number, k: number): number => {
    let d = b - a;
    d -= Math.floor(d / 360 + 0.5) * 360;
    return a + d * k;
  };

  it('o desvio do leque NÃO encolhe com o spherize — e na ordem contrária encolheria', () => {
    // O primeiro teste que alguém escreveu para isto DEU VERDE FALSO, porque
    // modelou a ordem errada de um jeito errado e o encolhimento não aparecia.
    // Este mede o desvio direto: na ordem certa ele é δ para todo spherize; na
    // ordem contrária vira δ·(1 − spherize) e ZERA com spherize 1.
    const direction = 90;
    const spread = 30;
    const saida = 0;
    const desvio = spread * (2 * 0.9 - 1);
    for (const spherize of [0, 0.25, 0.5, 0.75, 1]) {
      const base = curto(direction, saida, spherize);
      const certo = base + desvio;
      const errado = curto(direction + desvio, saida, spherize);
      expect(certo - base).toBeCloseTo(desvio, 9);
      expect(errado - base).toBeCloseTo(desvio * (1 - spherize), 9);
    }
    // e com spherize 1 a ordem contrária fecha o leque de vez
    expect(curto(direction + desvio, saida, 1) - curto(direction, saida, 1)).toBeCloseTo(0, 9);
  });

  it('o runtime faz a ordem da spec: θ − base misturada é sempre spread·(2u2 − 1)', () => {
    // Medido no runtime, não modelado: sem gravidade e sem arrasto a posição é
    // `p0 + v0·a`, então `v0` sai da conta e com ele o θ de cada partícula.
    const direction = 90;
    const spread = 30;
    const radius = 12;
    for (const spherize of [0, 0.5, 1]) {
      const att = new ParticleAttachment('x', {
        seed: 11, rate: 30, lifetime: [3, 3], speed: [100, 100], direction, spread,
        shape: 'circle', radius, radiusThickness: 1, arc: 360,
        gravity: [0, 0], drag: 0, looping: false, spherizeDirection: spherize,
      });
      const lista = quadro(att, 0.5).particles.filter((p) => p.age > 0);
      expect(lista.length).toBeGreaterThan(5);
      for (const p of lista) {
        const u3 = particleRandom(11, p.flow, p.index, 3);
        const u4 = particleRandom(11, p.flow, p.index, 4);
        const u2 = particleRandom(11, p.flow, p.index, 2);
        const r = radius * Math.sqrt(u3);
        const phi = u4 * 360;
        const p0x = r * Math.cos((phi * Math.PI) / 180);
        const p0y = r * Math.sin((phi * Math.PI) / 180);
        const theta = (Math.atan2(p.y - p0y, p.x - p0x) * 180) / Math.PI;
        const saida = (Math.atan2(p0y, p0x) * 180) / Math.PI;
        const base = curto(direction, saida, spherize);
        let delta = theta - base;
        delta -= Math.floor(delta / 360 + 0.5) * 360;
        expect(delta).toBeCloseTo(spread * (2 * u2 - 1), 6);
      }
    }
  });
});

describe('§9.4.1 — as contas da malha, por extenso (normativo)', () => {
  /** A square of two triangles, 100 px on a side, in skeleton space. */
  const malha = {
    vertices: [0, 0, 100, 0, 100, 100, 0, 100],
    triangles: [0, 1, 2, 0, 2, 3],
  };
  const comMalha = (meshMode: 'vertex' | 'edge' | 'triangle'): ParticleAttachment => new ParticleAttachment('x', {
    seed: 21, rate: 40, lifetime: [3, 3], speed: [0, 0], looping: false,
    shape: 'mesh', mesh: 'pano', meshMode,
  });
  const poseComMalha: EmitterPose = {
    matrixAt: () => IDENTIDADE,
    boneLength: () => 0,
    meshAt: () => malha,
  };
  const comMalhaQuadro = (att: ParticleAttachment, t: number): EmitterFrame =>
    computeParticles(att, new EmissionCurve(att, null), { time: t, duration: 0 }, poseComMalha);

  it('vertex: cada partícula cai EM CIMA de um vértice, escolhido pelo canal 12', () => {
    const att = comMalha('vertex');
    const lista = comMalhaQuadro(att, 0.5).particles;
    expect(lista.length).toBeGreaterThan(5);
    for (const p of lista) {
      const u12 = particleRandom(21, p.flow, p.index, 12);
      const k = Math.min(3, Math.floor(u12 * 4));
      expect(p.x).toBeCloseTo(malha.vertices[k * 2], 9);
      expect(p.y).toBeCloseTo(malha.vertices[k * 2 + 1], 9);
    }
  });

  it('edge: as arestas são as ÚNICAS da triangulação — cinco, e não seis', () => {
    // Dois triângulos partilham a diagonal 0–2: ela entra UMA vez.
    // (0,1) (1,2) (0,2) (2,3) (0,3) = 5 arestas únicas, em ordem crescente.
    const att = comMalha('edge');
    const lista = comMalhaQuadro(att, 0.5).particles;
    const esperadas = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3]];
    expect(lista.length).toBeGreaterThan(5);
    for (const p of lista) {
      const u12 = particleRandom(21, p.flow, p.index, 12);
      const u3 = particleRandom(21, p.flow, p.index, 3);
      const e = Math.min(4, Math.floor(u12 * 5));
      const [a, b] = esperadas[e];
      const ax = malha.vertices[a * 2]; const ay = malha.vertices[a * 2 + 1];
      const bx = malha.vertices[b * 2]; const by = malha.vertices[b * 2 + 1];
      expect(p.x).toBeCloseTo(ax + (bx - ax) * u3, 9);
      expect(p.y).toBeCloseTo(ay + (by - ay) * u3, 9);
    }
  });

  it('edge: NUNCA o campo `edges` da malha — o núcleo o declara "só editor"', () => {
    // A malha entregue não tem campo `edges` nenhum, e o emissor emite. Um
    // leitor amarrado a `edges` não emitiria nada num arquivo normal, e a
    // pessoa não teria como saber por quê.
    expect(malha).not.toHaveProperty('edges');
    expect(comMalhaQuadro(comMalha('edge'), 0.5).particles.length).toBeGreaterThan(0);
  });

  it('triangle: é a fórmula de DOBRAR, e não a da raiz quadrada', () => {
    const att = comMalha('triangle');
    const lista = comMalhaQuadro(att, 0.5).particles;
    expect(lista.length).toBeGreaterThan(5);
    let algumDobrou = false;
    for (const p of lista) {
      const u12 = particleRandom(21, p.flow, p.index, 12);
      const u3 = particleRandom(21, p.flow, p.index, 3);
      const u4 = particleRandom(21, p.flow, p.index, 4);
      // Áreas iguais: o primeiro triângulo leva u12 < 0.5.
      const t = u12 < 0.5 ? 0 : 1;
      const idx = malha.triangles.slice(t * 3, t * 3 + 3);
      const ax = malha.vertices[idx[0] * 2]; const ay = malha.vertices[idx[0] * 2 + 1];
      const bx = malha.vertices[idx[1] * 2]; const by = malha.vertices[idx[1] * 2 + 1];
      const cx = malha.vertices[idx[2] * 2]; const cy = malha.vertices[idx[2] * 2 + 1];
      let s = u3; let w = u4;
      if (s + w > 1) { s = 1 - s; w = 1 - w; algumDobrou = true; }
      expect(p.x).toBeCloseTo(ax + s * (bx - ax) + w * (cx - ax), 9);
      expect(p.y).toBeCloseTo(ay + s * (by - ay) + w * (cy - ay), 9);
    }
    // e a dobra acontece de verdade nesta amostra, senão o teste não provava nada
    expect(algumDobrou).toBe(true);
  });

  it('triangle: a da raiz quadrada daria outro ponto, a mais de 1 px', () => {
    // Não é diferença de arredondamento: é ponto diferente. Por isso a spec
    // precisava escrever qual, e por isso este runtime se recusou a escolher
    // antes de a linha existir.
    const u3 = 0.7; const u4 = 0.6;
    const ponto = (s: number, w: number): [number, number] => [100 * s, 100 * w];
    let s = u3; let w = u4;
    if (s + w > 1) { s = 1 - s; w = 1 - w; }
    const dobrar = ponto(s, w);
    const r = Math.sqrt(u3);
    const raiz = ponto(1 - r, u4 * r);
    expect(Math.hypot(dobrar[0] - raiz[0], dobrar[1] - raiz[1])).toBeGreaterThan(1);
  });

  it('a ORDEM da lista de arestas é a conta: outra escrita da mesma malha dá a mesma lista', () => {
    // Como a escolha é `floor(u12 · M)`, a ORDEM é parte da conta. A mesma
    // triangulação escrita com os triângulos noutra sequência escolheria outra
    // aresta para o mesmo `u12`, e NADA a jusante mostraria — defeito invisível.
    // A §9.4.1 manda ordenar pelo par crescente, e é isso que se confere aqui.
    const outraEscrita = {
      vertices: malha.vertices,
      // os mesmos dois triângulos, trocados de lugar e com os índices rodados
      triangles: [2, 3, 0, 1, 2, 0],
    };
    const att = comMalha('edge');
    const poseOutra: EmitterPose = { matrixAt: () => IDENTIDADE, boneLength: () => 0, meshAt: () => outraEscrita };
    const a = comMalhaQuadro(att, 0.5).particles;
    const b = computeParticles(att, new EmissionCurve(att, null), { time: 0.5, duration: 0 }, poseOutra).particles;
    expect(a.length).toBeGreaterThan(5);
    expect(b).toEqual(a);
  });

  it('sem malha em mãos o emissor NÃO desenha, e diz por quê', () => {
    const att = comMalha('vertex');
    const f = quadro(att, 0.5);
    expect(f.particles).toEqual([]);
    expect(f.silence?.reason).toBe('mesh');
  });
});

describe('§6 — os ciclos de rajada que passam de D', () => {
  const comRajada = (cycles: number, interval: number, time: number): ParticleAttachment =>
    new ParticleAttachment('x', {
      seed: 42, rate: 0, lifetime: [5, 5], speed: [0, 0], looping: true,
      bursts: [{ time, count: 1, cycles, interval, probability: 1 }],
    });

  it('o exemplo da spec: 2 ciclos ficam, 3 ficam de fora, e o leitor diz quantos', () => {
    // time 0.1, cycles 5, interval 0.5, D 1: os ciclos caem em
    // 0.1, 0.6, 1.1, 1.6, 2.1. Só os dois primeiros estão em [0, 1).
    const att = comRajada(5, 0.5, 0.1);
    const f = computeParticles(att, new EmissionCurve(att, null), { time: 0.2, duration: 1 }, POSE_PARADA);
    expect(f.births.cyclesDropped).toBe(3);
    expect(f.births.burstsCut).toEqual([0]);
    const desta = f.particles.filter((p) => p.birth >= 0);
    expect(desta.map((p) => Number(p.birth.toFixed(6)))).toEqual([0.1]);
  });

  it('a fronteira tem o D ABERTO: o ciclo que cai exatamente em D fica de fora', () => {
    // O caso mais banal que alguém vai escrever: um interval que divide a
    // duração certinho. time 0, interval 0.5, D 1 => 0, 0.5, 1.0. O terceiro
    // está exatamente em D, e é o primeiro da volta SEGUINTE.
    const att = comRajada(3, 0.5, 0);
    const f = computeParticles(att, new EmissionCurve(att, null), { time: 0.9, duration: 1 }, POSE_PARADA);
    expect(f.births.cyclesDropped).toBe(1);
    const desta = f.particles.filter((p) => p.birth >= 0).map((p) => Number(p.birth.toFixed(6)));
    expect(desta.sort((a, b) => a - b)).toEqual([0, 0.5]);
  });

  it('o startDelay TOCA a rajada, e entra no corte pela mesma expressão', () => {
    // O caso que separa as duas leituras, da §4.3: startDelay 0.3, rajada em
    // time 0.8, D = 1. O instante é 1.1 e o ciclo fica FORA da volta. Pela
    // letra antiga (sem o startDelay) seria 0.8 e ficaria dentro.
    const att = new ParticleAttachment('x', {
      seed: 42, rate: 0, lifetime: [5, 5], speed: [0, 0], looping: true, startDelay: 0.3,
      bursts: [{ time: 0.8, count: 1, cycles: 1, interval: 1, probability: 1 }],
    });
    const f = computeParticles(att, new EmissionCurve(att, null), { time: 0.9, duration: 1 }, POSE_PARADA);
    expect(f.births.cyclesDropped).toBe(1);
    expect(f.particles.filter((p) => p.birth >= 0)).toEqual([]);

    // E sem o startDelay o mesmo ciclo fica DENTRO, em 0.8.
    const sem = new ParticleAttachment('x', {
      seed: 42, rate: 0, lifetime: [5, 5], speed: [0, 0], looping: true,
      bursts: [{ time: 0.8, count: 1, cycles: 1, interval: 1, probability: 1 }],
    });
    const g = computeParticles(sem, new EmissionCurve(sem, null), { time: 0.9, duration: 1 }, POSE_PARADA);
    expect(g.births.cyclesDropped).toBe(0);
    expect(g.particles.filter((p) => p.birth >= 0).map((p) => Number(p.birth.toFixed(6)))).toEqual([0.8]);
  });

  it('sem laço NENHUM ciclo se corta: é o laço que corta', () => {
    const att = new ParticleAttachment('x', {
      seed: 42, rate: 0, lifetime: [5, 5], speed: [0, 0], looping: false,
      bursts: [{ time: 0.1, count: 1, cycles: 5, interval: 0.5, probability: 1 }],
    });
    const f = computeParticles(att, new EmissionCurve(att, null), { time: 2.5, duration: 1 }, POSE_PARADA);
    expect(f.births.cyclesDropped).toBe(0);
    expect(f.particles).toHaveLength(5);
  });

  it('sem o corte, a volta de trás cairia EM CIMA da volta atual', () => {
    // É o defeito que o corte existe para matar: o terceiro ciclo (1.1),
    // deslocado de −D, daria 0.1 — o mesmo t_i do primeiro desta volta, com
    // índice diferente. Duas partículas no mesmo instante que ninguém pediu.
    const att = comRajada(5, 0.5, 0.1);
    const f = computeParticles(att, new EmissionCurve(att, null), { time: 0.2, duration: 1 }, POSE_PARADA);
    const em01 = f.particles.filter((p) => Math.abs(p.birth - 0.1) < 1e-9);
    expect(em01).toHaveLength(1);
  });

  it('a rajada VOLTA na volta de trás — a explosão não some ao virar a volta', () => {
    const att = comRajada(1, 1, 0.1);
    const f = computeParticles(att, new EmissionCurve(att, null), { time: 0.2, duration: 1 }, POSE_PARADA);
    // a desta volta (0.1) e as das voltas de trás (−0.9, −1.9, ...)
    expect(f.particles.length).toBeGreaterThan(1);
    expect(f.particles.some((p) => p.birth < 0)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A cor da partícula no desenhador — rodada final, chat B, defeito B1 (29/09/2026)
// ---------------------------------------------------------------------------

import { CanvasRenderer } from '../src/render/canvas.js';
import { loadAtlas } from '../src/index.js';

describe('o desenhador pinta a COR da partícula, e não só o alfa (extensão 9.7)', () => {
  /**
   * Um contexto de mentira que grava o que foi pintado: cada `fillRect` sai
   * como `modo:cor`. É o bastante para ver se a cor de uma partícula chegou
   * ao `multiply` da §7.12 — o mesmo passo do desenho comum tingido.
   */
  function gravador(log: string[], nome: string): CanvasRenderingContext2D {
    const estado: Record<string, unknown> = { globalCompositeOperation: 'source-over', fillStyle: '#000', globalAlpha: 1 };
    const canvas = { width: 64, height: 64 };
    return new Proxy(estado, {
      get: (alvo, key) => {
        if (key === 'canvas') return canvas;
        if (key in alvo) return alvo[key as string];
        if (key === 'getTransform') return () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
        return (..._args: unknown[]) => {
          if (key === 'fillRect') log.push(`${nome}:${String(alvo['globalCompositeOperation'])}:${String(alvo['fillStyle'])}`);
          if (key === 'drawImage') log.push(`${nome}:drawImage`);
        };
      },
      set: (alvo, key, valor) => { alvo[key as string] = valor; return true; },
    }) as unknown as CanvasRenderingContext2D;
  }

  function comEmissor(cor: number[][]): Skeleton {
    const data = loadSkeletonData({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'fogo' }],
      skins: [{ name: 'default', attachments: { fx: { fogo: {
        type: 'BONE_particle', seed: 0, path: 'ponto', rate: 20, lifetime: [1, 1],
        speed: [10, 10], startColor: cor,
      } } } }],
      extensionsUsed: ['BONE_particles'],
    } as never, {
      atlases: [loadAtlas({
        atlas: { version: '1.0', generator: 'teste' },
        pages: [{ name: 'p', image: 'p.png', width: 8, height: 8 }],
        regions: [{ name: 'ponto', page: 0, x: 0, y: 0, width: 8, height: 8 }],
      })],
    });
    const sk = new Skeleton(data);
    sk.setToSetupPose();
    sk.time = 0.5;
    sk.updateWorldTransform(0);
    return sk;
  }

  function desenhar(sk: Skeleton): string[] {
    const log: string[] = [];
    const renderer = new CanvasRenderer(gravador(log, 'tela'), {
      images: { p: {} as CanvasImageSource },
      createScratch: () => gravador(log, 'rascunho'),
    });
    renderer.draw(sk);
    return log;
  }

  it('uma partícula VERMELHA passa pelo multiply da §7.12 com o vermelho dela', () => {
    const log = desenhar(comEmissor([[1, 0, 0, 1], [1, 0, 0, 1]]));
    // Há partícula viva, e ela foi pintada — sem isto o teste passaria vazio.
    expect(log.filter((l) => l === 'tela:drawImage').length).toBeGreaterThan(0);
    expect(log).toContain('rascunho:multiply:rgb(255, 0, 0)');
  });

  it('uma partícula BRANCA não paga o rascunho: vai direto, como o desenho sem tinta', () => {
    const log = desenhar(comEmissor([[1, 1, 1, 1], [1, 1, 1, 1]]));
    expect(log.filter((l) => l === 'tela:drawImage').length).toBeGreaterThan(0);
    expect(log.some((l) => l.startsWith('rascunho:'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rodada 16, lote 7: o desenhador esquecia de esquecer (canvas.ts:214)
// ---------------------------------------------------------------------------

import { BonePoser } from '../src/particles/bone-poser.js';
import { particleFrame, ParticleCache } from '../src/particles/frame.js';

describe('o desenhador não guarda a curva de emissão de um arquivo que já saiu', () => {
  /**
   * O defeito, pela forma: o cache de partículas do desenhador era chaveado
   * pelo NOME (animação, slot, anexo) e nunca esquecia. Recarregar um arquivo
   * com os mesmos nomes no mesmo desenhador desenhava com a curva do arquivo
   * velho — medido no editor: 0 px de diferença ao mudar a taxa. O editor
   * contornou trocando de desenhador.
   */
  function comTaxa(rate: number): Skeleton {
    const data = loadSkeletonData({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'fogo' }],
      skins: [{ name: 'default', attachments: { fx: { fogo: {
        type: 'BONE_particle', seed: 0, rate, lifetime: [1, 1], speed: [10, 10], looping: false,
      } } } }],
      extensionsUsed: ['BONE_particles'],
    } as never);
    const sk = new Skeleton(data);
    sk.setToSetupPose();
    sk.updateWorldTransform(0);
    sk.time = 0.5;
    return sk;
  }

  /** As vivas de `sk`, pelo cache que o desenhador guarda (canvas.ts). */
  function vivas(sk: Skeleton, cache: ParticleCache | null): number {
    const slot = sk.slots[0];
    return particleFrame(sk, slot, slot.attachment as ParticleAttachment, cache).particles.length;
  }

  it('o mesmo cache, com o arquivo trocado por outro de taxa diferente, dá a taxa NOVA', () => {
    const cache = new ParticleCache();
    const lento = vivas(comTaxa(4), cache);
    const rapido = vivas(comTaxa(20), cache);
    const rapidoSemCache = vivas(comTaxa(20), null);
    // Os dois arquivos dão números diferentes: sem isto o teste passaria vazio.
    expect(rapidoSemCache).toBeGreaterThan(lento);
    expect(rapido).toBe(rapidoSemCache);
  });

  it('o desenhador guarda o cache dele: dois arquivos no mesmo desenhador não se misturam', () => {
    // O cache vive no desenhador (canvas.ts) e é o mesmo objeto entre quadros.
    const renderer = new CanvasRenderer({ canvas: { width: 8, height: 8 } } as unknown as CanvasRenderingContext2D);
    const cache = (renderer as unknown as { particleCache: ParticleCache }).particleCache;
    expect(cache).toBeInstanceOf(ParticleCache);
    vivas(comTaxa(4), cache);
    expect(vivas(comTaxa(20), cache)).toBe(vivas(comTaxa(20), null));
  });
});

// ---------------------------------------------------------------------------
// Rodada 16, lote 7: a forma "ao longo de um caminho" (extensão 1.1, §9.4.2)
// ---------------------------------------------------------------------------

describe('§9.4.2 — shape "path": ao longo de um caminho (extensão 1.1)', () => {
  function comCaminho(jato: Record<string, unknown>, trilha: Record<string, unknown> = {}): SkeletonData {
    return loadSkeletonData({
      bone: { version: '1.1', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'trilha', bone: 'root', attachment: 'a/b' }, { name: 'fx', bone: 'root', attachment: 'jato' }],
      skins: [{ name: 'default', attachments: {
        trilha: {
          'a/b': { type: 'path', lengths: [300], vertices: [0, 0, 0, 0, 100, 0, 200, 0, 300, 0, 300, 0], ...trilha },
          'nao-e-caminho': { type: 'point' },
        },
        fx: { jato: {
          type: 'BONE_particle', seed: 42, rate: 10, lifetime: [2, 2], speed: [0, 0], shape: 'path',
          looping: false, ...jato,
        } },
      } }],
      extensionsUsed: ['BONE_particles'],
    } as never);
  }

  function quadro(data: SkeletonData): EmitterFrame {
    const att = emissor(data);
    const poser = new BonePoser(data, null);
    return computeParticles(att, new EmissionCurve(att, null), { time: 0.55, duration: 0 }, poser.poseFor('fx', att.mesh, att.curve));
  }

  it('o loader lê `curve` e conhece a forma `path`', () => {
    const data = comCaminho({ curve: 'trilha/a/b' });
    const att = emissor(data);
    expect(att.shape).toBe('path');
    expect(att.shapeKnown).toBe(true);
    expect(att.curve).toBe('trilha/a/b');
    expect(avisos(data)).not.toContain('shape');
  });

  it('o slot é o que vem antes da PRIMEIRA barra: o placeholder "a/b" é achado', () => {
    const f = quadro(comCaminho({ curve: 'trilha/a/b' }));
    expect(f.silence).toBeNull();
    expect(f.particles.length).toBe(6);
    // Alças nos terços: x = 300·u3, y = 0 (a conta do P-022 sem o deform).
    const i0 = f.particles.find((p) => p.index === 0)!;
    expect(i0.x).toBeCloseTo(300 * particleRandom(42, 0, 0, PARTICLE_CHANNEL.SHAPE_A), 9);
    expect(i0.y).toBeCloseTo(0, 9);
  });

  it.each([
    ['sem curve', {}],
    ['slot que não existe', { curve: 'outro/a/b' }],
    ['placeholder que não existe', { curve: 'trilha/c' }],
    ['anexo que não é path', { curve: 'trilha/nao-e-caminho' }],
    ['sem barra', { curve: 'trilha' }],
  ])('%s: NÃO desenha e avisa (regra 21), nunca cai para point', (_nome, jato) => {
    const f = quadro(comCaminho(jato));
    expect(f.particles).toEqual([]);
    expect(f.silence?.reason).toBe('path');
    expect(f.silence?.message).toContain('jato');
  });

  it('caminho com uma âncora só: não desenha e avisa', () => {
    const f = quadro(comCaminho({ curve: 'trilha/a/b' }, { lengths: [], vertices: [0, 0, 0, 0, 0, 0] }));
    expect(f.particles).toEqual([]);
    expect(f.silence?.reason).toBe('path');
  });

  it('`constantSpeed` do caminho NÃO muda o ponto: é sempre por comprimento', () => {
    const alcas = { vertices: [0, 0, 0, 0, 0, 0, 300, 0, 300, 0, 300, 0] };
    const sim = quadro(comCaminho({ curve: 'trilha/a/b' }, { ...alcas, constantSpeed: true }));
    const nao = quadro(comCaminho({ curve: 'trilha/a/b' }, { ...alcas, constantSpeed: false }));
    expect(nao.particles.map((p) => p.x)).toEqual(sim.particles.map((p) => p.x));
  });

  it('um arquivo sem `shape: "path"` não pede caminho nenhum ao hospedeiro', () => {
    const data = comCaminho({ shape: 'point', curve: 'trilha/a/b' });
    const att = emissor(data);
    let pediu = 0;
    const f = computeParticles(att, new EmissionCurve(att, null), { time: 0.55, duration: 0 }, {
      matrixAt: () => ({ a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 }),
      pathAt: () => { pediu++; return null; },
    });
    expect(f.silence).toBeNull();
    expect(f.particles.length).toBe(6);
    expect(pediu).toBe(0);
  });
});
