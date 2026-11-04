// SPDX-License-Identifier: Apache-2.0
/**
 * As partículas no leitor do Construct (rodada K6).
 *
 * O leitor desenha pela MESMA conta do editor (`particleFrame`, sem estado).
 * A prova: TODOS os casos P de `conformidade/casos/`, e o exemplo `particulas.bone`, em
 * vários instantes, comparados com o desenhador do editor partícula a
 * partícula — lugar, tamanho, giro (os quatro cantos dizem os três), uv,
 * transparência, ordem e mistura. E o mesmo instante, pedido de novo depois
 * de andar para a frente, dá o mesmo desenho.
 *
 * Os casos P medem posição, não desenho: não trazem atlas. Aqui cada um ganha
 * um, só no teste, com uma região por imagem que ele pede.
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// As regras do runtime (ik, física, caminho…) só existem depois deste import, como no addon:
// sem ele o esqueleto roda com regras 'noop' e o herói NÃO é o do jogo (achado na K5).
import '../src/pacote.js';
import { abertas, comparar, compararListas, oQueOEditorDesenha } from './ajuda-editor.js';
import { carregarBoneco } from '../src/carregar.js';
import { Avisos, montarLotes, pecasDoQuadro, TETO_DE_PARTICULAS, type Peca } from '../src/desenhador.js';
import { Tocador } from '../src/tocador.js';
import { ParticleCache } from '../../runtime/src/particles/frame.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CASOS = join(RAIZ, 'conformidade', 'casos');
const EXEMPLOS = join(RAIZ, 'formato', 'exemplos');

/** Lê o `.bone` e devolve o texto com um atlas de mentira que tem toda imagem que ele cita. */
function comAtlas(doc: any): { bone: string; atlas: string } {
  const caminhos = new Set<string>();
  for (const s of doc.skins ?? []) {
    for (const m of Object.values<any>(s.attachments ?? {})) {
      for (const [n, a] of Object.entries<any>(m)) if (a && a.type !== 'clipping' && a.type !== 'skeleton') caminhos.add(a.path ?? n);
    }
  }
  doc.assets = { ...(doc.assets ?? {}), atlases: ['t.atlas.json'] };
  const regioes = [...caminhos].map((name, i) => ({ name, page: 0, x: (i % 8) * 32, y: Math.floor(i / 8) * 32, width: 20, height: 12, pivotX: 6, pivotY: 4 }));
  const atlas = { atlas: { version: '1.0' }, scale: 1, pages: [{ name: 't', image: 't.png', width: 256, height: 256 }], regions: regioes };
  return { bone: JSON.stringify(doc), atlas: JSON.stringify(atlas) };
}

async function carregar(pasta: string, arquivo: string) {
  const { bone, atlas } = comAtlas(JSON.parse(readFileSync(join(pasta, arquivo), 'utf8')));
  const ler = async (c: string) => {
    if (c === arquivo) return new TextEncoder().encode(bone);
    if (c === 't.atlas.json') return new TextEncoder().encode(atlas);
    try { return new Uint8Array(readFileSync(join(pasta, c))); } catch { return null; }
  };
  return carregarBoneco(arquivo, ler);
}

/** O boneco posado no instante `t` da sua primeira animação (ou do relógio, sem animação). */
function posadoEm(dados: any, t: number): Tocador {
  const toc = new Tocador(dados);
  if (toc.animacoes.length > 0) toc.tocar(toc.animacoes[0], true);
  toc.avancar(t);
  return toc;
}

const particulasDe = (pecas: Peca[]) => pecas.filter((p) => p.tipo === 'BONE_particle');
const contar = (pecas: Peca[]) => particulasDe(pecas).reduce((n, p) => n + p.mundo.length / 8, 0);
const assinatura = (pecas: Peca[]) => JSON.stringify(pecas.map((p) => [p.slot, Array.from(p.mundo), Array.from(p.uvs), Array.from(p.coresPorVertice ?? [])]));

const INSTANTES = [0.05, 0.2, 0.37, 0.8, 1.3, 2.6];
const casosP = readdirSync(CASOS).filter((n) => n.startsWith('P-')).sort();

describe('os casos P, partícula a partícula contra o editor', () => {
  it('são TODOS os casos P de conformidade/casos/, sem número fixo', () => {
    // Dizia "os 19 de hoje" e caiu quando a rodada 16 pôs mais cinco. O número
    // não é o que este teste prova: o que ele prova é que NENHUM caso P fica de
    // fora da comparação partícula a partícula. Um caso sem entrada é uma pasta
    // quebrada, e tem de aparecer aqui, não sumir calado.
    expect(casosP.length).toBeGreaterThan(0);
    for (const caso of casosP) expect(existsSync(join(CASOS, caso, 'entrada.bone')), caso).toBe(true);
  });

  for (const caso of casosP) {
    it(caso, async () => {
      const b = await carregar(join(CASOS, caso), 'entrada.bone');
      let vistas = 0;
      for (const t of INSTANTES) {
        const toc = posadoEm(b.arquivo.data, t);
        comparar(toc.esqueleto);
        vistas += contar(pecasDoQuadro(toc.esqueleto));
      }
      // A prova olhou partícula de verdade (um verde com a lista vazia não prova nada).
      expect(vistas).toBeGreaterThan(0);
    });
  }
});

describe('o exemplo particulas.bone (fumaça do cachimbo, mistura screen, espaço do mundo)', () => {
  it('bate com o editor em seis instantes, e a fumaça cresce e some como no editor', async () => {
    const b = await carregar(EXEMPLOS, 'particulas.bone');
    for (const t of INSTANTES) comparar(posadoEm(b.arquivo.data, t).esqueleto);
    expect(contar(pecasDoQuadro(posadoEm(b.arquivo.data, 1.3).esqueleto))).toBeGreaterThan(10);
  });

  it('todas as partículas do emissor vão num drawMesh só', async () => {
    const b = await carregar(EXEMPLOS, 'particulas.bone');
    const pecas = pecasDoQuadro(posadoEm(b.arquivo.data, 1.3).esqueleto);
    expect(particulasDe(pecas)).toHaveLength(1);
    const lotes = montarLotes(pecas);
    expect(lotes).toHaveLength(1);
    expect(lotes[0].mistura).toBe('screen');
    expect(lotes[0].posicoes.length / 3).toBe(contar(pecas) * 4);
  });

  it('cada partícula leva a SUA cor nos vértices (não uma cor só para o emissor)', async () => {
    const b = await carregar(EXEMPLOS, 'particulas.bone');
    const [p] = particulasDe(pecasDoQuadro(posadoEm(b.arquivo.data, 1.3).esqueleto));
    const alfas = new Set<string>();
    for (let v = 0; v < p.mundo.length / 2; v += 4) alfas.add(p.coresPorVertice![v * 4 + 3].toFixed(4));
    expect(alfas.size).toBeGreaterThan(3);
  });
});

describe('o mesmo instante dá o mesmo desenho (a regra da casa)', () => {
  it('andar até 2,6 s e voltar a 0,8 s: o quadro de 0,8 s é o mesmo, com ou sem contas guardadas', async () => {
    for (const [pasta, arquivo] of [[EXEMPLOS, 'particulas.bone'], [join(CASOS, 'P-020-emissor-world-osso-andando'), 'entrada.bone']]) {
      const b = await carregar(pasta, arquivo);
      const guardadas = new ParticleCache();
      const antes = assinatura(pecasDoQuadro(posadoEm(b.arquivo.data, 0.8).esqueleto, undefined, { particulas: guardadas }));
      pecasDoQuadro(posadoEm(b.arquivo.data, 2.6).esqueleto, undefined, { particulas: guardadas });
      const depois = assinatura(pecasDoQuadro(posadoEm(b.arquivo.data, 0.8).esqueleto, undefined, { particulas: guardadas }));
      const semGuardar = assinatura(pecasDoQuadro(posadoEm(b.arquivo.data, 0.8).esqueleto));
      expect(depois).toBe(antes);
      expect(semGuardar).toBe(antes);
    }
  });

  it('e o desenho muda com o tempo (a prova acima não compara duas fotos paradas)', async () => {
    const b = await carregar(EXEMPLOS, 'particulas.bone');
    expect(assinatura(pecasDoQuadro(posadoEm(b.arquivo.data, 0.8).esqueleto)))
      .not.toBe(assinatura(pecasDoQuadro(posadoEm(b.arquivo.data, 0.9).esqueleto)));
  });
});

describe('o aviso de peso (regra 21: avisa, não corta calado)', () => {
  it(`acima de ${TETO_DE_PARTICULAS} vivas num emissor: desenha TODAS e avisa, com o número`, async () => {
    const doc = JSON.parse(readFileSync(join(EXEMPLOS, 'particulas.bone'), 'utf8'));
    const emissor = doc.skins[0].attachments.cachimbo_fumaca.fumaca;
    emissor.rate = 600;
    emissor.maxParticles = 2000;
    const { bone, atlas } = comAtlas(doc);
    const b = await carregarBoneco('p.bone', async (c) => new TextEncoder().encode(c === 'p.bone' ? bone : atlas));
    const avisos = new Avisos();
    const toc = posadoEm(b.arquivo.data, 1.3);
    const pecas = pecasDoQuadro(toc.esqueleto, avisos);
    const n = contar(pecas);
    expect(n).toBeGreaterThan(TETO_DE_PARTICULAS);
    const aviso = avisos.todos().find((a) => a.includes('partículas vivas'))!;
    // O número do aviso é o de VIVAS: conta também as que nasceram transparentes
    // (a fumaça começa com alpha 0), que não viram quadrado. Por isso >= desenhadas.
    const vivas = Number(/chegou a (\d+) partículas vivas/.exec(aviso)![1]);
    expect(vivas).toBeGreaterThanOrEqual(n);
    expect(vivas).toBeGreaterThan(TETO_DE_PARTICULAS);
    expect(aviso).toContain('Todas foram desenhadas');
    comparar(toc.esqueleto);
  });

  it('abaixo do teto: nenhum aviso de peso', async () => {
    const b = await carregar(EXEMPLOS, 'particulas.bone');
    const avisos = new Avisos();
    pecasDoQuadro(posadoEm(b.arquivo.data, 1.3).esqueleto, avisos);
    expect(avisos.todos().filter((a) => a.includes('partículas vivas'))).toEqual([]);
  });

  it('o corte pelo maxParticles do arquivo (o que o formato manda) também avisa, com o número', async () => {
    const b = await carregar(join(CASOS, 'P-005-teto-de-vivas'), 'entrada.bone');
    const avisos = new Avisos();
    for (const t of INSTANTES) pecasDoQuadro(posadoEm(b.arquivo.data, t).esqueleto, avisos);
    expect(avisos.todos().join('\n')).toMatch(/teve \d+ partícula\(s\) cortada\(s\) num quadro pelo maxParticles/);
  });
});

describe('a régua pega partícula errada (regra 26)', () => {
  it('uma partícula fora do lugar, uma a menos, ou com outro alpha: a comparação reprova', async () => {
    const b = await carregar(EXEMPLOS, 'particulas.bone');
    const esq = posadoEm(b.arquivo.data, 1.3).esqueleto;
    const editor = oQueOEditorDesenha(esq);
    const certas = () => abertas(pecasDoQuadro(esq, undefined, { cortar: false }));
    expect(compararListas(editor, certas())).toBe(editor.length);
    const fora = certas();
    fora[5].pontos[2][0] += 0.01;
    expect(() => compararListas(editor, fora)).toThrow();
    expect(() => compararListas(editor, certas().slice(0, -1))).toThrow();
    const alpha = certas();
    alpha[7].alpha *= 0.5;
    expect(() => compararListas(editor, alpha)).toThrow();
  });
});

describe('o herói do exemplo com fogo na mão (skin "fogo" do heroi-fogo.bone)', () => {
  it('vestida, as faíscas aparecem, aditivas, e batem com o editor andando; tirada, somem', async () => {
    const pasta = join(RAIZ, 'leitor-construct', 'exemplo', 'heroi-andando', 'files');
    const b = await carregarBoneco('heroi-fogo.bone', async (c) => { try { return new Uint8Array(readFileSync(join(pasta, c))); } catch { return null; } });
    const toc = new Tocador(b.arquivo.data);
    toc.tocar('walk', true);
    expect(particulasDe(pecasDoQuadro(toc.esqueleto))).toHaveLength(0);
    toc.vestir('fogo');
    for (const dt of [0.1, 0.25, 0.4, 0.9]) {
      toc.avancar(dt);
      comparar(toc.esqueleto);
    }
    const fogo = particulasDe(pecasDoQuadro(toc.esqueleto));
    expect(fogo).toHaveLength(1);
    expect(fogo[0].mistura).toBe('additive');
    expect(contar(fogo)).toBeGreaterThan(5);
    toc.tirar('fogo');
    expect(particulasDe(pecasDoQuadro(toc.esqueleto))).toHaveLength(0);
  });
});

describe('a partícula com folha de quadros (extensão 9.8), com a conta feita à mão antes', () => {
  // Uma partícula só: rajada em 0 s, vida 2 s, velocidade 0, na origem. A folha
  // tem 3 quadros, q_a, q_b, q_c, que no atlas começam em u = 0; 0,25; 0,5
  // (página de 128 px, cada quadro com 16 px, um ao lado do outro de 32 em 32).
  function boneco(modo: Record<string, unknown>) {
    const doc = {
      bone: { version: '1.1', minVersion: '1.0', generator: 'teste do leitor' },
      extensionsUsed: ['BONE_particles'],
      assets: { atlases: ['q.atlas.json'] },
      bones: [{ name: 'root' }],
      slots: [{ name: 'fx', bone: 'root', attachment: 'folha' }],
      skins: [{ name: 'default', attachments: { fx: { folha: {
        type: 'BONE_particle', path: 'q', sequence: { frames: ['q_a', 'q_b', 'q_c'], setup: 0 },
        seed: 1, rate: 0, lifetime: [2, 2], speed: [0, 0], shape: 'point', looping: false, maxParticles: 10,
        bursts: [{ time: 0, count: 1, cycles: 1, interval: 0, probability: 1 }], ...modo,
      } } } }],
      animations: [{ name: 'folha', duration: 2, timelines: [] }],
    };
    const atlas = {
      atlas: { version: '1.0' }, scale: 1, pages: [{ name: 'p', image: 'p.png', width: 128, height: 32 }],
      regions: ['q_a', 'q_b', 'q_c', 'q'].map((name, i) => ({ name, page: 0, x: i * 32, y: 0, width: 16, height: 16 })),
    };
    return carregarBoneco('f.bone', async (c) => new TextEncoder().encode(JSON.stringify(c === 'f.bone' ? doc : atlas)));
  }

  /** Em que instante, qual quadro (pelo u de onde a imagem começa). */
  async function quadros(modo: Record<string, unknown>, instantes: number[]) {
    const b = await boneco(modo);
    const saida: number[] = [];
    for (const t of instantes) {
      const toc = new Tocador(b.arquivo.data);
      toc.tocar('folha', false);
      toc.avancar(t);
      comparar(toc.esqueleto);
      const [p] = particulasDe(pecasDoQuadro(toc.esqueleto));
      expect(p.mundo.length / 8, `t = ${t}`).toBe(1);
      saida.push(Math.min(p.uvs[0], p.uvs[2], p.uvs[4], p.uvs[6]));
    }
    return saida;
  }

  it('por segundo (fps 10): 0,05 s → q_a; 0,15 → q_b; 0,25 → q_c; 0,35 → q_a; 1,15 → q_c', async () => {
    expect(await quadros({ frameMode: 'fps', fps: 10 }, [0.05, 0.15, 0.25, 0.35, 1.15])).toEqual([0, 0.25, 0.5, 0, 0.5]);
  });

  it('pela vida (1 volta em 2 s): 0,5 s → q_a; 0,7 → q_b; 1,4 → q_c', async () => {
    expect(await quadros({ frameMode: 'lifetime', cycles: 1 }, [0.5, 0.7, 1.4])).toEqual([0, 0.25, 0.5]);
  });

  it('o quadro inicial soma (startFrame 1): 0,05 s → q_b em vez de q_a', async () => {
    expect(await quadros({ frameMode: 'fps', fps: 10, startFrame: [1, 1] }, [0.05])).toEqual([0.25]);
  });
});
