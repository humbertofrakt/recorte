// SPDX-License-Identifier: Apache-2.0
/**
 * O tocador do objeto Recorte, o que entrou na rodada K7: velocidade, pausar e
 * continuar, "está tocando", o fim da animação e os eventos do `.bone`
 * chegando como ocorrências (que o addon vira gatilho no Construct).
 *
 * As contas de referência vêm do próprio arquivo do herói: o "walk" dura 1 s e
 * tem a chave "step" em 0,25 s (int 1) e 0,75 s (int 2); o "attack" dura 0,6 s,
 * sem laço no exemplo, com a chave "hit" em 0,2 s (texto "sword", número 1,5).
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
// As regras do runtime (ik, física, caminho…) só existem depois deste import, como no addon:
// sem ele o esqueleto roda com regras 'noop' e o herói NÃO é o do jogo (achado na K5).
import '../src/pacote.js';
import { carregarBoneco, type Boneco } from '../src/carregar.js';
import { pecasDoQuadro } from '../src/desenhador.js';
import { Tocador } from '../src/tocador.js';

const EXEMPLOS = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'formato', 'exemplos');
let heroi: Boneco;
beforeAll(async () => {
  heroi = await carregarBoneco('heroi.bone', async (c) => { try { return new Uint8Array(readFileSync(join(EXEMPLOS, c))); } catch { return null; } });
});

const pose = (t: Tocador) => JSON.stringify(pecasDoQuadro(t.esqueleto).map((p) => Array.from(p.mundo)));

/**
 * A maior distância entre as peças de dois tocadores, por slot. Com as regras
 * ligadas (a física do cabelo), dois caminhos até o mesmo instante dão o mesmo
 * desenho só até o ruído da conta: comparar o TEXTO exato era verde porque a
 * física não rodava no teste (achado na K5).
 */
function distancia(a: Tocador, b: Tocador, fora: readonly string[] = []): number {
  const pa = pecasDoQuadro(a.esqueleto);
  const pb = pecasDoQuadro(b.esqueleto);
  expect(pa.map((p) => p.nome)).toEqual(pb.map((p) => p.nome));
  let m = 0;
  pa.forEach((p, i) => {
    if (fora.includes(p.slot)) return;
    p.mundo.forEach((x, k) => { m = Math.max(m, Math.abs(x - pb[i].mundo[k])); });
  });
  return m;
}

describe('velocidade, pausar e continuar', () => {
  it('na velocidade 2, 0,2 s andam o que 0,4 s andam na velocidade 1', () => {
    const a = new Tocador(heroi.arquivo.data);
    const b = new Tocador(heroi.arquivo.data);
    a.tocar('walk', true);
    b.tocar('walk', true);
    a.velocidade = 2;
    a.avancar(0.2);
    b.avancar(0.4);
    // A animação anda o dobro; a física do cabelo anda no relógio de verdade
    // (0,2 s num, 0,4 s no outro), então só o cabelo fica diferente.
    expect(distancia(a, b, ['hair'])).toBeLessThan(1e-9);
    expect(distancia(a, b)).toBeGreaterThan(0.01);
    expect(a.velocidade).toBe(2);
  });

  it('pausado, o tempo não anda; continuando, anda de onde parou', () => {
    const a = new Tocador(heroi.arquivo.data);
    const b = new Tocador(heroi.arquivo.data);
    a.tocar('walk', true);
    b.tocar('walk', true);
    a.avancar(0.1);
    a.pausado = true;
    const parada = pose(a);
    a.avancar(0.5);
    expect(pose(a)).toBe(parada);
    a.pausado = false;
    a.avancar(0.2);
    // Os mesmos passos (0,1 e 0,2), sem a pausa no meio: a física do herói depende
    // do tamanho do passo, então 0,3 de uma vez daria outro número.
    b.avancar(0.1);
    b.avancar(0.2);
    expect(distancia(a, b)).toBeLessThan(1e-9);
  });

  it('velocidade que não serve (negativa, não número): fica a de antes, e avisa', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.velocidade = 1.5;
    t.velocidade = -1;
    t.velocidade = Number.NaN;
    expect(t.velocidade).toBe(1.5);
    expect(t.avisos.todos().join('\n')).toContain('Velocidade -1 não serve');
  });
});

describe('está tocando, e o fim da animação', () => {
  it('o "attack" sem laço: está tocando até 0,6 s; ao passar, "terminou" uma vez só', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.tocar('attack', false);
    expect(t.estaTocando('attack')).toBe(true);
    expect(t.estaTocando('walk')).toBe(false);
    t.avancar(0.5);
    expect(t.tirarOcorrencias().filter((o) => o.tipo === 'terminou')).toEqual([]);
    expect(t.estaTocando('attack')).toBe(true);
    t.avancar(0.15);
    expect(t.tirarOcorrencias().filter((o) => o.tipo === 'terminou')).toEqual([{ tipo: 'terminou', animacao: 'attack' }]);
    expect(t.estaTocando('attack')).toBe(false);
    t.avancar(1);
    expect(t.tirarOcorrencias().filter((o) => o.tipo === 'terminou')).toEqual([]);
    expect(t.nomeTocando).toBe('attack'); // fica na última pose, como o Sprite do Construct
  });

  it('o "walk" em laço não termina: dá a volta, sem "terminou"', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.tocar('walk', true);
    t.avancar(2.5);
    expect(t.tirarOcorrencias().filter((o) => o.tipo === 'terminou')).toEqual([]);
    expect(t.estaTocando('walk')).toBe(true);
  });
});

describe('os eventos do .bone', () => {
  it('o "walk" dispara "step" em 0,25 s (int 1) e em 0,75 s (int 2), uma vez por volta', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.tocar('walk', true);
    t.avancar(0.2);
    expect(t.tirarOcorrencias()).toEqual([]);
    t.avancar(0.1);
    expect(t.tirarOcorrencias()).toEqual([{ tipo: 'evento', animacao: 'walk', nome: 'step', inteiro: 1, numero: 0, texto: '' }]);
    t.avancar(0.5);
    expect(t.tirarOcorrencias().map((o) => (o.tipo === 'evento' ? o.inteiro : -1))).toEqual([2]);
    t.avancar(1);
    expect(t.tirarOcorrencias().map((o) => (o.tipo === 'evento' ? o.inteiro : -1))).toEqual([1, 2]);
  });

  it('o "attack" dispara "hit" com o texto e o número da chave, e depois termina', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.tocar('attack', false);
    t.avancar(0.7);
    expect(t.tirarOcorrencias()).toEqual([
      { tipo: 'evento', animacao: 'attack', nome: 'hit', inteiro: 10, numero: 1.5, texto: 'sword' },
      { tipo: 'terminou', animacao: 'attack' },
    ]);
  });

  it('pausado, nenhum evento passa', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.tocar('walk', true);
    t.pausado = true;
    t.avancar(2);
    expect(t.tirarOcorrencias()).toEqual([]);
  });
});

describe('a chave reset da física (rodada K5: o achado 2 da G6)', () => {
  // O caso C-262 da conformidade: uma haste com física e a chave `reset` em
  // 0,1 s (FORA do tempo 0, onde o herói tem a dele e ninguém via a falta).
  // O Tocador anda de 1/60 em 1/60, como o jogo, e a haste tem de cair onde o
  // `esperado.json` diz — que é o que sai quando a chave dispara.
  it('a haste do C-262, passo a passo, bate com o esperado.json', async () => {
    const pasta = join(EXEMPLOS, '..', '..', 'conformidade', 'casos', 'C-262-fisica-reset-em-laco');
    const caso = await carregarBoneco('entrada.bone', async (c) => { try { return new Uint8Array(readFileSync(join(pasta, c))); } catch { return null; } });
    const esperado = JSON.parse(readFileSync(join(pasta, 'esperado.json'), 'utf8'));
    const t = new Tocador(caso.arquivo.data);
    expect(t.tocar('gira', true)).toBe(true);
    const dt = esperado.probe.physicsDt;
    let passos = 0;
    for (const amostra of esperado.samples) {
      while (passos * dt < amostra.time - dt * 1e-6) { t.avancar(dt); passos++; }
      const h = t.esqueleto.findBone('haste')!;
      expect(h.a, `t = ${amostra.time}`).toBeCloseTo(amostra.bones.haste.a, 5);
      expect(h.c, `t = ${amostra.time}`).toBeCloseTo(amostra.bones.haste.c, 5);
    }
  });
});
