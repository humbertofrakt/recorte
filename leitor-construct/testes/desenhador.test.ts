// SPDX-License-Identifier: Apache-2.0
/**
 * O desenhador do Construct, no Node, sem o Construct (rodada K2, item 4).
 *
 * A prova principal: para o herói de exemplo, as listas do `drawMesh` batem com
 * o que o desenhador do EDITOR (`runtime/src/render/canvas.ts`) desenha. O
 * editor não faz listas: ele pinta um Canvas 2D. Então ele pinta aqui num
 * Canvas de mentira, que só anota — para cada `drawImage`, o contorno do
 * pedaço e a matriz que leva a imagem até ele. Da matriz se tiram os uv. As
 * duas contas têm de dar a mesma peça, na mesma ordem, no mesmo lugar, com o
 * mesmo uv, a mesma transparência e a mesma mistura.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
// As regras do runtime (ik, física, caminho…) só existem depois deste import, como no addon:
// sem ele o esqueleto roda com regras 'noop' e o herói NÃO é o do jogo (achado na K5).
import '../src/pacote.js';
import { abertas, comparar, compararListas, oQueOEditorDesenha } from './ajuda-editor.js';
import { carregarBoneco, type Boneco } from '../src/carregar.js';
import {
  Avisos, caixaDaInstancia, MISTURA_DO_CONSTRUCT, montarLotes, paraConstruct, pecasDoQuadro, type Peca,
} from '../src/desenhador.js';
import { Tocador } from '../src/tocador.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXEMPLOS = join(RAIZ, 'formato', 'exemplos');

/** Lê da pasta de exemplos como o addon lê da pasta Files. */
async function lerExemplo(caminho: string): Promise<Uint8Array | null> {
  try {
    return new Uint8Array(readFileSync(join(EXEMPLOS, caminho)));
  } catch {
    return null;
  }
}

// -----------------------------------------------------------------------------

let heroi: Boneco;
beforeAll(async () => {
  heroi = await carregarBoneco('heroi.bone', lerExemplo);
});

describe('carregar o herói pela leitura assíncrona (como da pasta Files)', () => {
  it('lê o herói, a espada aninhada e o atlas, e sabe onde está a imagem de cada página', () => {
    expect(heroi.arquivo.data.animations.map((a) => a.name)).toEqual(['idle', 'walk', 'attack']);
    expect(heroi.imagens.get('heroi')).toBe('heroi.png');
    expect(heroi.arquivo.missingFiles).toEqual([]);
    const tocador = new Tocador(heroi.arquivo.data);
    const espada = tocador.esqueleto.slots.find((s) => s.data.name === 'weapon')?.nested;
    expect(espada?.skeleton.data.meta.name).toBe('espada');
  });

  it('arquivo que não está na pasta: erro em português, com o nome', async () => {
    await expect(carregarBoneco('nao-existe.bone', lerExemplo)).rejects.toThrow('"nao-existe.bone" não está na pasta Files');
  });

  it('o aninhado que falta vira aviso, não silêncio (regra 21)', async () => {
    const semEspada = (c: string) => (c === 'espada.bone' ? Promise.resolve(null) : lerExemplo(c));
    const b = await carregarBoneco('heroi.bone', semEspada);
    expect(b.arquivo.missingFiles).toContain('espada.bone');
    expect(b.avisos.join('\n')).toContain('espada.bone');
    const avisos = new Avisos();
    pecasDoQuadro(new Tocador(b.arquivo.data).esqueleto, avisos);
    expect(avisos.todos().join('\n')).toContain('não foi carregado');
  });
});

describe('as listas batem com o desenhador do editor', () => {
  it('o herói parado: mesma peça, mesma ordem, mesmo lugar, mesmo uv, mesmo alpha, mesma mistura', () => {
    const t = new Tocador(heroi.arquivo.data);
    const n = comparar(t.esqueleto);
    // 19 peças; a cabeça é malha e o editor a pinta triângulo a triângulo (2).
    expect(n).toBe(20);
    expect(pecasDoQuadro(t.esqueleto)).toHaveLength(19);
  });

  it('o herói andando, a 0,25 s e a 0,6 s', () => {
    const t = new Tocador(heroi.arquivo.data);
    expect(t.tocar('walk', true)).toBe(true);
    t.avancar(0.25);
    comparar(t.esqueleto);
    t.avancar(0.35);
    comparar(t.esqueleto);
  });

  it('a cor RGB de cada peça é a do 7.12 (o editor a pinta por outra superfície, que o teste não tem)', () => {
    const t = new Tocador(heroi.arquivo.data);
    for (const p of pecasDoQuadro(t.esqueleto)) {
      for (const c of p.cor) expect(c >= 0 && c <= 1).toBe(true);
    }
  });

  it('o comparador pega uma peça fora do lugar (regra 26)', () => {
    const t = new Tocador(heroi.arquivo.data);
    const editor = oQueOEditorDesenha(t.esqueleto);
    expect(compararListas(editor, abertas(pecasDoQuadro(t.esqueleto, undefined, { cortar: false })))).toBe(editor.length);
    const fora = abertas(pecasDoQuadro(t.esqueleto, undefined, { cortar: false }));
    fora[3].pontos[0][1] += 0.001;
    expect(() => compararListas(editor, fora)).toThrow();
    const trocadas = abertas(pecasDoQuadro(t.esqueleto, undefined, { cortar: false }));
    [trocadas[4], trocadas[5]] = [trocadas[5], trocadas[4]];
    expect(() => compararListas(editor, trocadas)).toThrow();
    const semUma = abertas(pecasDoQuadro(t.esqueleto, undefined, { cortar: false })).slice(1);
    expect(() => compararListas(editor, semUma)).toThrow();
  });
});

describe('a virada para o Construct', () => {
  it('o Y vira num lugar só: um ponto acima do (0, 0) do boneco cai ACIMA da instância no layout', () => {
    const s = new Float32Array(3);
    paraConstruct({ x: 100, y: 200, angulo: 0, escalaX: 1, escalaY: 1 }, 10, 30, s, 0);
    expect([...s]).toEqual([110, 170, 0]);
  });

  it('o ângulo do Construct gira no sentido do relógio na tela, e a escala multiplica', () => {
    const s = new Float32Array(3);
    paraConstruct({ x: 0, y: 0, angulo: Math.PI / 2, escalaX: 2, escalaY: 2, z: 5 }, 10, 0, s, 0);
    expect(s[0]).toBeCloseTo(0, 5);
    expect(s[1]).toBeCloseTo(20, 5); // a ponta da direita desce
    expect(s[2]).toBe(5);
  });

  it('os lotes guardam a ordem, juntam o que é da mesma página e mistura, e os índices apontam para o vértice certo', () => {
    const t = new Tocador(heroi.arquivo.data);
    const pecas = pecasDoQuadro(t.esqueleto);
    const vista = { x: 300, y: 400, angulo: 0, escalaX: 1, escalaY: 1 };
    const lotes = montarLotes(pecas, vista);
    expect(lotes.flatMap((l) => l.pecas)).toEqual(pecas.map((p) => `${p.slot}/${p.anexo}`));
    for (let i = 1; i < lotes.length; i++) {
      const mesmo = lotes[i].pagina.name === lotes[i - 1].pagina.name && lotes[i].mistura === lotes[i - 1].mistura;
      expect(mesmo).toBe(false);
    }
    // A primeira peça: o vértice 0 dela é o (x, -y) do esqueleto, mais a posição.
    const p0 = pecas[0];
    const l0 = lotes[0];
    expect(l0.posicoes[0]).toBeCloseTo(300 + p0.mundo[0], 4);
    expect(l0.posicoes[1]).toBeCloseTo(400 - p0.mundo[1], 4);
    expect(l0.uvs[0]).toBeCloseTo(p0.uvs[0], 6);
    for (const l of lotes) {
      const n = l.posicoes.length / 3;
      expect(l.uvs.length).toBe(n * 2);
      expect(l.cores.length).toBe(n * 4);
      expect(Math.max(...l.indices)).toBe(n - 1);
      expect(l.indices.length % 3).toBe(0);
    }
  });

  it('a cor vai multiplicada pelo alpha, e a da instância multiplica tudo', () => {
    const t = new Tocador(heroi.arquivo.data);
    const pecas = pecasDoQuadro(t.esqueleto);
    const [l] = montarLotes(pecas.slice(0, 1), { x: 0, y: 0, angulo: 0, escalaX: 1, escalaY: 1, cor: [1, 0.5, 1, 0.5] });
    const c = pecas[0].cor;
    const a = c[3] * 0.5;
    expect(l.cores[3]).toBeCloseTo(a, 6);
    expect(l.cores[0]).toBeCloseTo(c[0] * a, 6);
    expect(l.cores[1]).toBeCloseTo(c[1] * 0.5 * a, 6);
  });

  it('as quatro misturas do formato têm nome no Construct', () => {
    expect(Object.keys(MISTURA_DO_CONSTRUCT).sort()).toEqual(['additive', 'multiply', 'normal', 'screen']);
  });

  it('a caixa da instância cobre o boneco inteiro, centrada no (0, 0)', () => {
    expect(caixaDaInstancia({ x: -70, y: -8, width: 150, height: 240 }, 1)).toEqual({ largura: 160, altura: 464 });
    expect(caixaDaInstancia({ x: -70, y: -8, width: 150, height: 240 }, -0.5)).toEqual({ largura: 80, altura: 232 });
  });
});

describe('o que ainda não desenha, avisa (regra 21)', () => {
  it('o herói avisa a cor escura do cabelo, uma vez', () => {
    const t = new Tocador(heroi.arquivo.data);
    const avisos = new Avisos();
    pecasDoQuadro(t.esqueleto, avisos);
    pecasDoQuadro(t.esqueleto, avisos);
    const textos = avisos.todos();
    expect(textos.filter((a) => a.includes('"hair"') && a.includes('cor escura'))).toHaveLength(1);
    expect(new Set(textos).size).toBe(textos.length);
    expect(avisos.novos()).toEqual(textos);
    expect(avisos.novos()).toEqual([]);
  });
});

describe('o tocador', () => {
  it('toca, diz o nome, e anda', () => {
    const t = new Tocador(heroi.arquivo.data);
    expect(t.nomeTocando).toBe('');
    expect(t.tocar('walk', true)).toBe(true);
    expect(t.nomeTocando).toBe('walk');
    expect(t.emLacoTocando).toBe(true);
    t.tocar('attack', false);
    expect(t.emLacoTocando).toBe(false);
    t.tocar('walk', true);
    const antes = pecasDoQuadro(t.esqueleto)[0].mundo.slice();
    t.avancar(0.3);
    const depois = pecasDoQuadro(t.esqueleto)[0].mundo;
    expect(Array.from(depois)).not.toEqual(Array.from(antes));
  });

  it('nome que o boneco não tem: não troca, e avisa com a lista do que tem', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.tocar('idle', true);
    expect(t.tocar('correr', true)).toBe(false);
    expect(t.nomeTocando).toBe('idle');
    expect(t.avisos.todos().join('\n')).toBe('O boneco não tem a animação "correr". Tem: "idle", "walk", "attack".');
  });
});

describe('a sequência (rodada K3): o quadro da imagem troca com o tempo, como no editor', () => {
  it('B-105: o olho que pisca, quadro a quadro — o uv muda, e bate com o editor em cada instante', async () => {
    const caso = join(RAIZ, 'conformidade', 'casos', 'B-105-sequence-uv-por-quadro');
    const ler = async (c: string) => { try { return new Uint8Array(readFileSync(join(caso, c))); } catch { return null; } };
    const b = await carregarBoneco('entrada.bone', ler);
    const t = new Tocador(b.arquivo.data);
    expect(t.tocar('pisca', true)).toBe(true);
    const vistos = new Set<string>();
    for (let i = 0; i < 8; i++) {
      comparar(t.esqueleto);
      const olho = pecasDoQuadro(t.esqueleto).find((p) => p.slot === 'olho')!;
      vistos.add(Array.from(olho.uvs).map((u) => u.toFixed(6)).join(','));
      t.avancar(0.05);
    }
    expect(vistos.size).toBeGreaterThan(1);
  });

  it('o herói parado (idle): a mão em sequência troca de quadro, e bate com o editor', () => {
    const t = new Tocador(heroi.arquivo.data);
    t.tocar('idle', true);
    const quadros = new Set<string>();
    for (let i = 0; i < 6; i++) {
      comparar(t.esqueleto);
      const mao = pecasDoQuadro(t.esqueleto).find((p) => p.slot === 'hand')!;
      quadros.add(Array.from(mao.uvs).map((u) => u.toFixed(6)).join(','));
      t.avancar(0.25);
    }
    expect(quadros.size).toBe(3); // hand_01, hand_02, hand_03
  });
});
