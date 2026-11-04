// SPDX-License-Identifier: Apache-2.0
/**
 * `measure: "particles"` — the measure the pose dump of spec 12.4 did not have.
 *
 * The eight cases of `conformidade/casos-pendentes/` asked for it, its shape is
 * written in section 14.1 of `formato/extensions/BONE_particles.md`, and **the
 * cases are the contract it fulfils**: nothing here invents a field.
 *
 * The seventeen cases moved from `conformidade/casos-pendentes/` to
 * `conformidade/casos/` on 18/09/2026, once three independent readers agreed —
 * the case author, this runtime and the Python one — and the official suite
 * went from 71 to 88 cases. This file measures THIS side of that agreement.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { loadSkeletonData } from '../../runtime/src/loader.js';
import {
  buildPoseDump, comparePoseDump, TOLERANCES, ANGLE_FIELDS,
  type Probe, type PoseDump, type ParticleDumpSample,
} from '../src/conformidade/pose-dump.js';

const CASOS = 'C:/Users/F-rak/Desktop/animador/conformidade/casos';
const PENDENTES = 'C:/Users/F-rak/Desktop/animador/conformidade/casos-pendentes';

/**
 * Onde um caso P mora AGORA. Os dois lugares são legítimos e querem dizer
 * coisas diferentes: `casos/` é a suíte oficial, `casos-pendentes/` guarda o
 * caso completo que nenhum runtime passa ainda — e que o executor NÃO varre,
 * para que um leitor sem o módulo P continue verde.
 */
function pastaDoCaso(folder: string): string {
  return existsSync(join(CASOS, folder)) ? join(CASOS, folder) : join(PENDENTES, folder);
}

function rodar(folder: string): { esperado: PoseDump; obtido: PoseDump } {
  const pasta = pastaDoCaso(folder);
  const esperado = JSON.parse(readFileSync(join(pasta, 'esperado.json'), 'utf8')) as PoseDump & { probe: Probe };
  const data = loadSkeletonData(JSON.parse(readFileSync(join(pasta, 'entrada.bone'), 'utf8')) as Record<string, unknown>);
  return { esperado, obtido: buildPoseDump(data, esperado.probe) };
}

function particulas(dump: PoseDump, sample: number): ParticleDumpSample[] {
  return (dump.samples[sample] as { particles: Record<string, ParticleDumpSample[]> }).particles['fx/jato'];
}

/** Os casos P de uma pasta, por nome, em ordem. */
function casosPEm(pasta: string): string[] {
  return readdirSync(pasta, { withFileTypes: true })
    .filter((e) => e.isDirectory() && e.name.startsWith('P-'))
    .map((e) => e.name)
    .sort();
}

describe('a medida particles do pose-dump (extensão BONE_particles 14.1)', () => {
  const oficiais = casosPEm(CASOS);
  const pendentes = casosPEm(PENDENTES);
  const casos = [...oficiais, ...pendentes].sort();

  it('a numeração dos casos P não tem buraco — contando AS DUAS pastas', () => {
    // A propriedade que este teste prende é "nada sumiu", e ela é verdadeira
    // sobre o CONJUNTO dos dois lugares, nunca sobre um deles. A primeira
    // versão amarrou-a a `casos/` e quebrou no dia em que o P-002 voltou para
    // `casos-pendentes/` — prendeu o LUGAR em vez da PROPRIEDADE.
    //
    // Um caso pode mudar de pasta por decisão do Planejador, e isso é normal.
    // O que não pode é o `P-00i` desaparecer dos dois lugares sem ninguém ver.
    expect(casos.length).toBeGreaterThanOrEqual(17);
    casos.forEach((nome, i) => {
      expect(nome.startsWith(`P-${String(i + 1).padStart(3, '0')}-`)).toBe(true);
    });
  });

  it('`casos-pendentes/` guarda EXATAMENTE o P-002, e o leiame diz por quê', () => {
    // O P-002 voltou para cá em 18/09/2026, depois de ter entrado em `casos/`
    // por engano. O motivo é o mais fino que esta rodada achou: **ele passa sem
    // exercitar o que o nome dele promete.** O anexo tem `rate: 0`, a prova
    // está numa timeline de `rate` que nenhum runtime de 1ª fase implementa, e
    // o esperado traz lista vazia — então um runtime de 1ª fase produz zero
    // partículas e passa.
    //
    // Ele não é mudo: prende a regra da §14.1 (emissor sem ninguém vivo sai
    // como lista VAZIA e não some da chave). Mas não é isso que o nome dele
    // diz. Um caso mudo não engana — vê-se a lista vazia e desconfia-se. Um
    // caso que passa por OUTRO MOTIVO que não o do nome engana, porque quem lê
    // "P-002 taxa em rampa: passou" conclui que a inversa estável da integral
    // está coberta. O nome mente, e o nome é o que se lê num relatório.
    //
    // Este teste é o guarda de que ninguém o promova de novo por engano: ele só
    // sai daqui quando a 2ª fase abrir e os números dele forem preenchidos.
    expect(pendentes).toEqual(['P-002-taxa-em-rampa']);
  });

  it('o P-002 continua com a lista VAZIA — não se preenche para ele passar', () => {
    const want = JSON.parse(
      readFileSync(join(PENDENTES, 'P-002-taxa-em-rampa', 'esperado.json'), 'utf8'),
    ) as { samples: { particles: Record<string, unknown[]> }[] };
    expect(want.samples[0].particles['fx/jato']).toEqual([]);
  });

  for (const nome of casos) {
    it(`${nome}: o runtime TypeScript bate com o esperado do caso`, () => {
      const { esperado, obtido } = rodar(nome);
      const r = comparePoseDump(esperado, obtido, TOLERANCES);
      expect(r.differences.map((d) => `${d.pointer}: esperado ${String(d.expected)}, obtido ${String(d.actual)}`)).toEqual([]);
      expect(r.ok).toBe(true);
    });
  }

  it('o bloco tem exatamente os campos da §14.1, e nada mais', () => {
    const { obtido } = rodar('P-001-posicao-fechada');
    const p = particulas(obtido, 0)[0];
    expect(Object.keys(p)).toEqual(['flow', 'index', 'birth', 'life', 'age', 'x', 'y', 'angle', 'scale']);
    // The key is `<slot>/<placeholder>`, the emitter.
    const bloco = (obtido.samples[0] as { particles: Record<string, unknown> }).particles;
    expect(Object.keys(bloco)).toEqual(['fx/jato']);
  });

  it('emissor sem ninguém vivo sai como lista VAZIA, e não some da chave', () => {
    // Confusing "there is no particle" with "this reader does not implement P"
    // is exactly the kind of quiet green house rule 21 is about. The P-002 is
    // the live example: its rate is fixed at 0, so nobody is born.
    //
    // And this IS the one thing P-002 proves — a reader without the P module
    // writes no `fx/jato` key at all and the comparison says `<emissor
    // ausente>`. It is not what the case's NAME promises, which is why the case
    // sits in `casos-pendentes/`; but the property is real and worth a test of
    // its own, right here, where it is not pretending to be about a ramp.
    const { obtido } = rodar('P-002-taxa-em-rampa');
    const bloco = (obtido.samples[0] as { particles: Record<string, unknown> }).particles;
    expect(Object.keys(bloco)).toEqual(['fx/jato']);
    expect(particulas(obtido, 0)).toEqual([]);
  });

  it('o índice sai NEGATIVO no pré-aquecimento, e o birth também', () => {
    const { obtido } = rodar('P-004-pre-aquecimento');
    const lista = particulas(obtido, 0);
    expect(lista[lista.length - 1].index).toBe(-20);
    expect(lista[lista.length - 1].birth).toBe(-1);
  });

  it('P-006: o x e o y saem no espaço do ESQUELETO, e o osso solta a partícula', () => {
    // The bone turns 90° between `t_i` and `t`, and the particle does NOT turn
    // with it: (100, 0), never (0, 100). It is the easiest mistake to make here.
    const { obtido } = rodar('P-006-space-world');
    const emT1 = particulas(obtido, 1)[0];
    expect(emT1.x).toBeCloseTo(100, 6);
    expect(emT1.y).toBeCloseTo(0, 6);
  });

  it('P-006: trocar UMA palavra para "local" põe a mesma partícula em (0, 100)', () => {
    // This is the contrast that makes the case. It is measured, and not
    // asserted from the leiame, because the dump writes skeleton space in BOTH
    // spaces — that is what makes the comparison possible at all.
    const pasta = join(CASOS, 'P-006-space-world');
    const esperado = JSON.parse(readFileSync(join(pasta, 'esperado.json'), 'utf8')) as PoseDump & { probe: Probe };
    const bruto = JSON.parse(readFileSync(join(pasta, 'entrada.bone'), 'utf8')) as Record<string, never>;
    bruto['skins'][0]['attachments']['fx']['jato']['space'] = 'local';
    const dump = buildPoseDump(loadSkeletonData(bruto), esperado.probe);
    const p = particulas(dump, 1)[0];
    expect(p.x).toBeCloseTo(0, 6);
    expect(p.y).toBeCloseTo(100, 6);
  });

  it('o ângulo NÃO é comparado por distância circular: 251.145834 contra −108.854166 FALHA', () => {
    // The leiame of P-001 says it in letters. If `angle` took the circular
    // distance the two would be zero degrees apart, a wrong reader would pass,
    // and the proof would go slack for BOTH runtimes — the third face of rule
    // 21, the one that fools us instead of the user.
    const { esperado, obtido } = rodar('P-001-posicao-fechada');
    const torto = JSON.parse(JSON.stringify(obtido)) as PoseDump;
    const lista = particulas(torto, 0);
    const alvo = lista.find((p) => p.index === 7)!;
    expect(alvo.angle).toBeCloseTo(251.145834, 6);
    alvo.angle = alvo.angle - 360;
    const r = comparePoseDump(esperado, torto, TOLERANCES);
    expect(r.ok).toBe(false);
    expect(r.differences.some((d) => d.pointer.endsWith('/angle'))).toBe(true);
    // And the ruler is `1e-3`, not the `1e-2` of spec 3.6 for angles: the
    // Planejador fixed it at the tighter number on 18/09, when the confront
    // found the two runtimes had each picked their own. Two comparators with
    // two rulers are not one proof.
    expect(r.differences.find((d) => d.pointer.endsWith('/angle'))!.tolerance).toBe(TOLERANCES.position);
    expect(TOLERANCES.position).toBe(1e-3);
  });

  it('o campo "angle" NÃO está em ANGLE_FIELDS — e este teste é o guarda disso', () => {
    // A frase na §14.2 é uma frase. O ANGLE_FIELDS é um conjunto de NOMES DE
    // CAMPO — arotation, ashearX, ashearY, rotation — e o campo da partícula se
    // chama `angle`: acrescentá-lo ali é o gesto mais natural do mundo para
    // quem passar por aqui daqui a um ano, e é o gesto que apaga a prova. Com
    // este teste o vermelho aparece no mesmo minuto; sem ele, ninguém nota.
    expect(ANGLE_FIELDS.has('angle')).toBe(false);
    expect([...ANGLE_FIELDS].sort()).toEqual(['arotation', 'ashearX', 'ashearY', 'rotation']);
  });

  it('a ordem da lista importa: as mesmas partículas fora de ordem FALHAM', () => {
    // The list IS the draw order already cut by `maxParticles` (§7.1). A
    // comparison that sorted before looking would let P-005 and P-007 through.
    const { esperado, obtido } = rodar('P-005-teto-de-vivas');
    const torto = JSON.parse(JSON.stringify(obtido)) as PoseDump;
    particulas(torto, 0).reverse();
    expect(comparePoseDump(esperado, torto, TOLERANCES).ok).toBe(false);
  });

  it('uma partícula a mais ou a menos FALHA, e a mensagem diz quantas', () => {
    const { esperado, obtido } = rodar('P-007-rajada-com-probabilidade');
    const torto = JSON.parse(JSON.stringify(obtido)) as PoseDump;
    particulas(torto, 0).pop();
    const r = comparePoseDump(esperado, torto, TOLERANCES);
    expect(r.ok).toBe(false);
    expect(String(r.differences[0].expected)).toContain('6 partícula');
    expect(String(r.differences[0].actual)).toContain('5 partícula');
  });

  it('emissor ausente FALHA, e não passa por "lista vazia"', () => {
    const { esperado, obtido } = rodar('P-001-posicao-fechada');
    const torto = JSON.parse(JSON.stringify(obtido)) as PoseDump;
    delete (torto.samples[0] as { particles: Record<string, unknown> }).particles['fx/jato'];
    const r = comparePoseDump(esperado, torto, TOLERANCES);
    expect(r.ok).toBe(false);
    expect(String(r.differences[0].actual)).toContain('ausente');
  });

  it('flow e index são comparados EXATOS: são identidade, não medida', () => {
    const { esperado, obtido } = rodar('P-007-rajada-com-probabilidade');
    const torto = JSON.parse(JSON.stringify(obtido)) as PoseDump;
    particulas(torto, 0)[0].flow = 0;
    expect(comparePoseDump(esperado, torto, TOLERANCES).ok).toBe(false);
  });
});
