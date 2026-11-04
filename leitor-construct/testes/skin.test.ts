// SPDX-License-Identifier: Apache-2.0
/**
 * A skin no leitor do Construct (rodada K4): vestir, tirar, empilhar, a de
 * cima vence, a skin que esconde imagem, a skin que traz osso, a skin de
 * outro arquivo. Cada pilha é desenhada e comparada com o desenhador do
 * editor, peça a peça.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
// As regras do runtime (ik, física, caminho…) só existem depois deste import, como no addon:
// sem ele o esqueleto roda com regras 'noop' e o herói NÃO é o do jogo (achado na K5).
import '../src/pacote.js';
import { comparar } from './ajuda-editor.js';
import { carregarBoneco } from '../src/carregar.js';
import { pecasDoQuadro } from '../src/desenhador.js';
import { Tocador } from '../src/tocador.js';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EXEMPLOS = join(RAIZ, 'formato', 'exemplos');

function leitor(pasta: string, trocas: Record<string, string> = {}) {
  return async (c: string): Promise<Uint8Array | null> => {
    if (c in trocas) return new TextEncoder().encode(trocas[c]);
    try { return new Uint8Array(readFileSync(join(pasta, c))); } catch { return null; }
  };
}

const slots = (t: Tocador) => pecasDoQuadro(t.esqueleto).map((p) => p.slot);

describe('vestir e tirar, no herói', () => {
  it('começa com "default"; vestir põe no topo; tirar tira só aquela', async () => {
    const b = await carregarBoneco('heroi.bone', leitor(EXEMPLOS));
    const t = new Tocador(b.arquivo.data);
    expect(t.skins).toEqual(['default', 'armadura', 'armadura_capa']);
    expect(t.pilha).toEqual(['default']);
    expect(t.vestir('armadura')).toBe(true);
    expect(t.pilha).toEqual(['default', 'armadura']);
    expect(t.vestir('armadura_capa')).toBe(true);
    expect(t.pilha).toEqual(['default', 'armadura', 'armadura_capa']);
    expect(t.tirar('armadura')).toBe(true);
    expect(t.pilha).toEqual(['default', 'armadura_capa']);
    expect(t.tirar('armadura')).toBe(true); // tirar o que não está: nada muda, não é erro
    expect(t.pilha).toEqual(['default', 'armadura_capa']);
  });

  it('vestir de novo a que já está: ela sobe para o topo e passa a vencer', async () => {
    const b = await carregarBoneco('heroi.bone', leitor(EXEMPLOS));
    const t = new Tocador(b.arquivo.data);
    t.vestir('armadura');
    t.vestir('armadura_capa');
    t.vestir('armadura');
    expect(t.pilha).toEqual(['default', 'armadura_capa', 'armadura']);
  });

  it('a armadura esconde o cabelo; tirada, o cabelo volta — e cada pilha bate com o editor', async () => {
    const b = await carregarBoneco('heroi.bone', leitor(EXEMPLOS));
    const t = new Tocador(b.arquivo.data);
    t.tocar('walk', true);
    t.avancar(0.3);
    expect(slots(t)).toContain('hair');
    comparar(t.esqueleto);
    t.vestir('armadura');
    expect(slots(t)).not.toContain('hair');
    comparar(t.esqueleto);
    t.avancar(0.2);
    comparar(t.esqueleto);
    t.tirar('armadura');
    expect(slots(t)).toContain('hair');
    comparar(t.esqueleto);
  });

  it('a skin vestida muda o desenho de verdade (a prova não está comparando duas vezes a mesma coisa)', async () => {
    const b = await carregarBoneco('heroi.bone', leitor(EXEMPLOS));
    const t = new Tocador(b.arquivo.data);
    const sem = JSON.stringify(pecasDoQuadro(t.esqueleto).map((p) => [p.slot, p.anexo, Array.from(p.uvs)]));
    t.vestir('armadura');
    const com = JSON.stringify(pecasDoQuadro(t.esqueleto).map((p) => [p.slot, p.anexo, Array.from(p.uvs)]));
    expect(com).not.toBe(sem);
  });

  it('skin que o boneco não tem: nada muda, e avisa com a lista do que tem (regra 21)', async () => {
    const b = await carregarBoneco('heroi.bone', leitor(EXEMPLOS));
    const t = new Tocador(b.arquivo.data);
    expect(t.vestir('aguia')).toBe(false);
    expect(t.tirar('aguia')).toBe(false);
    expect(t.pilha).toEqual(['default']);
    expect(t.avisos.todos()).toEqual(['O boneco não tem a skin "aguia". Tem: "default", "armadura", "armadura_capa".']);
  });
});

describe('a skin de outro arquivo', () => {
  it('o mecha veste "inverno", que mora em mecha-pele-inverno.bone; bate com o editor', async () => {
    const b = await carregarBoneco('mecha.bone', leitor(EXEMPLOS));
    expect(b.arquivo.missingFiles).toEqual([]);
    const t = new Tocador(b.arquivo.data);
    expect(t.skins).toContain('inverno');
    const antes = JSON.stringify(pecasDoQuadro(t.esqueleto).map((p) => [p.slot, p.anexo]));
    comparar(t.esqueleto);
    expect(t.vestir('inverno')).toBe(true);
    comparar(t.esqueleto);
    expect(JSON.stringify(pecasDoQuadro(t.esqueleto).map((p) => [p.slot, p.anexo]))).not.toBe(antes);
  });
});

describe('a skin que traz osso (C-294: o rabo do lobisomem)', () => {
  const caso = join(RAIZ, 'conformidade', 'casos', 'C-294-pele-externa-com-osso');
  // O caso não tem atlas (ele mede ossos, não desenho). Aqui ganha um, só no teste:
  // uma página com as duas regiões que o corpo e o rabo pedem.
  async function lobisomem() {
    const doc = JSON.parse(readFileSync(join(caso, 'entrada.bone'), 'utf8'));
    doc.assets.atlases = ['t.atlas.json'];
    const rabo = JSON.parse(readFileSync(join(caso, 'rabo.bone'), 'utf8'));
    const caminhos = new Set<string>(['base']);
    for (const s of rabo.skins ?? []) for (const m of Object.values<any>(s.attachments ?? {})) for (const [n, a] of Object.entries<any>(m)) if (a) caminhos.add(a.path ?? n);
    const atlas = {
      atlas: { version: '1.0' }, scale: 1,
      pages: [{ name: 't', image: 't.png', width: 64, height: 64 }],
      regions: [...caminhos].map((nome, i) => ({ name: nome, page: 0, x: i * 16, y: 0, width: 16, height: 16 })),
    };
    rabo.assets = { ...(rabo.assets ?? {}), atlases: ['t.atlas.json'] };
    const b = await carregarBoneco('entrada.bone', leitor(caso, {
      'entrada.bone': JSON.stringify(doc), 'rabo.bone': JSON.stringify(rabo), 't.atlas.json': JSON.stringify(atlas),
    }));
    return new Tocador(b.arquivo.data);
  }

  it('vestida, o osso e o rabo aparecem; tirada, somem os dois — e bate com o editor', async () => {
    const t = await lobisomem();
    const osso = () => t.esqueleto.bones.find((o) => o.data.name === 'rabo');
    expect(t.skins).toContain('lobisomem');
    expect(slots(t)).not.toContain('rabo');
    expect(t.esqueleto.activeSkinBones.size).toBe(0);
    comparar(t.esqueleto);
    t.vestir('lobisomem');
    expect(slots(t)).toContain('rabo');
    expect(t.esqueleto.activeSkinBones.has(osso()!.data)).toBe(true);
    comparar(t.esqueleto);
    t.tirar('lobisomem');
    expect(slots(t)).not.toContain('rabo');
    expect(t.esqueleto.activeSkinBones.size).toBe(0);
    comparar(t.esqueleto);
  });
});
