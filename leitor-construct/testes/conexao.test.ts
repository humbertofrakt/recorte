// SPDX-License-Identifier: Apache-2.0
/**
 * A conexão no leitor do Construct (rodada K5, 05/10/2026).
 *
 * Parte 1 — o desenhador pela lista nova (7.11, "Este boneco"). Os casos
 * C-310 a C-319 (em `conformidade/casos/` ou ainda em `casos-pendentes/`; a conta à mão está no
 * `leiame.md` de cada um) rodam pelo desenhador do leitor, e a lista dele tem
 * de bater, peça a peça e máscara a máscara, com DUAS coisas: a `drawList` do
 * `esperado.json` (a mão de quem escreveu o caso) e a `collectDrawList` do
 * runtime (o canal do dump, 12.4).
 *
 * Os casos não trazem atlas (o dump não precisa de imagem). O desenhador
 * precisa: sem região a peça não é desenhada, e avisa. Por isso, SÓ AQUI, na
 * memória, cada `.bone` lido ganha um atlas de mentira com uma região para
 * cada `path` do caso. O caso no disco não muda.
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadAtlas, loadSkeletonFile } from '../../runtime/src/index.js';
import { collectDrawList } from '../../runtime/src/render-list.js';
import { Avisos, noLayout, pecasDoQuadro, type Vista } from '../src/desenhador.js';
import { Tocador } from '../src/tocador.js';
import { carregarBoneco } from '../src/carregar.js';
import type { NestedSkeleton } from '../../runtime/src/nested.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const CONFORMIDADE = join(AQUI, '..', '..', 'conformidade');

/**
 * A pasta de um caso. Os casos nascem em `casos-pendentes/` e passam a `casos/`
 * quando os dois runtimes os passam: procura primeiro em `casos/`, depois em
 * `casos-pendentes/`, para o teste valer antes e depois da mudança. Sumiu dos
 * dois: vermelho, com o nome (não um verde por falta de caso).
 */
function pastaDoCaso(nome: string): string {
  const achada = ['casos', 'casos-pendentes'].map((p) => join(CONFORMIDADE, p, nome)).find((d) => existsSync(d));
  if (achada === undefined) throw new Error(`o caso ${nome} sumiu de casos/ e de casos-pendentes/`);
  return achada;
}

/** Toda string `path` (ou nome de anexo de região/malha sem `path`) de uma árvore `.bone`. */
function caminhosDeImagem(arvore: any, saida: Set<string>): void {
  for (const pele of arvore.skins ?? []) {
    for (const porSlot of Object.values(pele.attachments ?? {}) as any[]) {
      for (const [nome, a] of Object.entries(porSlot) as [string, any][]) {
        if (a === null) continue;
        const tipo = a.type ?? 'region';
        if (tipo === 'region' || tipo === 'mesh') saida.add(a.path ?? nome);
      }
    }
  }
}

/** Abre a pasta de um caso com o atlas de mentira em todo `.bone`. */
function abrirCaso(pasta: string) {
  const arquivos = readdirSync(pasta).filter((n) => n.endsWith('.bone'));
  const caminhos = new Set<string>();
  for (const n of arquivos) caminhosDeImagem(JSON.parse(readFileSync(join(pasta, n), 'utf8')), caminhos);
  const regioes = [...caminhos].map((name, i) => ({ name, page: 0, x: (i % 16) * 10, y: Math.floor(i / 16) * 10, width: 10, height: 10 }));
  const atlasTexto = JSON.stringify({ atlas: { version: '1.0' }, pages: [{ name: 'p', image: 'p.png', width: 256, height: 256 }], regions: regioes });
  const comAtlas = (nome: string): Uint8Array => {
    const arvore = JSON.parse(readFileSync(join(pasta, nome), 'utf8'));
    arvore.assets = { ...(arvore.assets ?? {}), atlases: ['mentira.atlas.json'] };
    return new TextEncoder().encode(JSON.stringify(arvore));
  };
  const arquivo = loadSkeletonFile(comAtlas('entrada.bone'), {
    atlases: [loadAtlas(JSON.parse(atlasTexto))],
    files: (pedido) => {
      if (pedido.endsWith('mentira.atlas.json')) return new TextEncoder().encode(atlasTexto);
      return arquivos.includes(pedido) ? comAtlas(pedido) : null;
    },
  });
  const esperado = JSON.parse(readFileSync(join(pasta, 'esperado.json'), 'utf8'));
  return { data: arquivo.data, esperado };
}

/** O nome de cada máscara no dump é `<prefixo><slot>/<anexo>`; o desenhador guarda o anexo. */
const anexoDe = (nome: string): string => nome.slice(nome.lastIndexOf('/') + 1);

const CASOS = [
  'C-310-aninhado-em-bloco', 'C-311-este-boneco', 'C-312-este-boneco-ordem-do-filho',
  'C-313-este-boneco-ordem-do-pai', 'C-314-este-boneco-dois', 'C-315-este-boneco-niveis-bloco',
  'C-316-este-boneco-niveis-marcado', 'C-317-este-boneco-meio-some', 'C-318-este-boneco-mascara-do-filho',
  'C-319-este-boneco-mascara-do-pai',
];

describe('o desenhador pelos três grupos de 7.11 (os casos pendentes da rodada 11)', () => {
  for (const caso of CASOS) {
    it(`${caso}: a lista do desenhador é a do esperado.json e a do runtime, peça a peça`, () => {
      const { data, esperado } = abrirCaso(pastaDoCaso(caso));
      const sonda = esperado.probe;
      expect(esperado.samples.length).toBe(sonda.times.length);
      for (const amostra of esperado.samples) {
        // O mesmo caminho do jogo: um Tocador, a animação da sonda, e um passo até o tempo.
        const avisos = new Avisos();
        const t = new Tocador(data, avisos);
        if (sonda.animation !== undefined) expect(t.tocar(sonda.animation, sonda.loop !== false)).toBe(true);
        t.avancar(amostra.time);
        expect(t.esqueleto.time).toBeCloseTo(amostra.time, 12);

        const pecas = pecasDoQuadro(t.esqueleto, avisos, { cortar: false });
        const doDesenhador = pecas.map((p) => ({ piece: p.nome, clips: p.recortes.map((r) => r.nome) }));
        const daMao = amostra.drawList.map((d: any) => ({ piece: d.piece, clips: d.clips.map(anexoDe) }));
        const doRuntime = collectDrawList(t.esqueleto).map((d) => ({ piece: d.name, clips: d.clips.map((c) => anexoDe(c.name)) }));
        expect(doDesenhador).toEqual(daMao);
        expect(doDesenhador).toEqual(doRuntime);
        // Nenhuma peça ficou sem região: a lista não bate "por faltar" (regra 28).
        expect(avisos.todos().filter((a) => a.includes('não tem região'))).toEqual([]);
      }
    });
  }

  it('X-307: "around" com um slot que o filho não tem desenha em bloco e AVISA (regra 21)', () => {
    const { data, esperado } = abrirCaso(pastaDoCaso('X-307-este-boneco-slot-que-nao-existe'));
    const avisos = new Avisos();
    const t = new Tocador(data, avisos);
    t.avancar(esperado.samples[0].time);
    const pecas = pecasDoQuadro(t.esqueleto, avisos, { cortar: false });
    expect(pecas.map((p) => p.nome)).toEqual(esperado.samples[0].drawList.map((d: any) => d.piece));
    expect(avisos.todos().some((a) => a.startsWith('AROUND_SLOT_MISSING'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Parte 2 — encaixar, desencaixar, animar e soltar a peça (itens 2 a 5)
// ---------------------------------------------------------------------------

const EXEMPLOS = join(AQUI, '..', '..', 'formato', 'exemplos');

/** O herói e as entidades do disco, pelo mesmo `carregarBoneco` do addon. */
async function heroi() {
  const ler = async (c: string) => { try { return new Uint8Array(readFileSync(join(EXEMPLOS, c))); } catch { return null; } };
  const b = await carregarBoneco('heroi.bone', ler);
  const avisos = new Avisos();
  const t = new Tocador(b.arquivo.data, avisos);
  for (const nome of ['capacete.bone', 'espada.bone']) t.registrarEntidade(nome, (await carregarBoneco(nome, ler)).arquivo.data);
  return { t, avisos };
}

/** Bonecos escritos aqui, com um atlas de mentira que cobre toda imagem. */
async function naMemoria(arquivos: Record<string, any>, principal: string) {
  const caminhos = new Set<string>();
  for (const a of Object.values(arquivos)) caminhosDeImagem(a, caminhos);
  const regions = [...caminhos].map((name, i) => ({ name, page: 0, x: i * 10, y: 0, width: 10, height: 10 }));
  const atlas = { atlas: { version: '1.0' }, pages: [{ name: 'p', image: 'p.png', width: 512, height: 16 }], regions };
  const ler = async (c: string) => {
    if (c === 'm.atlas.json') return new TextEncoder().encode(JSON.stringify(atlas));
    const a = arquivos[c];
    return a === undefined ? null : new TextEncoder().encode(JSON.stringify({ ...a, assets: { atlases: ['m.atlas.json'] } }));
  };
  const avisos = new Avisos();
  const t = new Tocador((await carregarBoneco(principal, ler)).arquivo.data, avisos);
  for (const nome of Object.keys(arquivos)) if (nome !== principal) t.registrarEntidade(nome, (await carregarBoneco(nome, ler)).arquivo.data);
  return { t, avisos };
}

/** Um `.bone` pequeno: um osso, um slot por item, imagem de 10×10 ou entidade. */
function bone(nome: string, slots: [string, any][]) {
  const attachments: Record<string, any> = {};
  for (const [s, a] of slots) attachments[s] = { [s]: a ?? { type: 'region', width: 10, height: 10 } };
  return {
    bone: { version: '1.1', minVersion: '1.1', generator: 'teste da rodada K5' }, skeleton: { name: nome }, bones: [{ name: 'root' }],
    slots: slots.map(([s]) => ({ name: s, bone: 'root', attachment: s })),
    skins: [{ name: 'default', attachments }], animations: [],
  };
}

const nomes = (t: Tocador) => pecasDoQuadro(t.esqueleto, new Avisos(), { cortar: false }).map((p) => p.nome);
const raizDoFilho = (t: Tocador, slot: string) => {
  const n = t.esqueleto.findSlot(slot)!.nested!;
  return [n.skeleton.bones[0].worldX, n.skeleton.bones[0].worldY];
};

describe('Encaixar e Desencaixar (item 2)', () => {
  it('a peça entra no slot, no pino da imagem que ela substitui, e Desencaixar traz a de antes de volta', async () => {
    const { t, avisos } = await heroi();
    t.tocar('walk', true);
    t.avancar(0.3);
    const antes = nomes(t);
    const pinoAntes = raizDoFilho(t, 'weapon');
    expect(antes).toContain('weapon/lamina/lamina');

    expect(t.encaixar('weapon', 'capacete.bone')).toBe(true);
    const com = nomes(t);
    expect(com).not.toContain('weapon/lamina/lamina');
    expect(com).toContain('weapon/casco/casco');
    // O mesmo lugar na ordem: o que vinha antes e depois da espada não mudou.
    const fora = (l: string[]) => l.filter((n) => !n.startsWith('weapon/'));
    expect(fora(com)).toEqual(fora(antes));
    expect(com.indexOf('weapon/casco/casco')).toBe(antes.indexOf('weapon/lamina/lamina'));
    // O pino: a raiz da peça nova cai onde a raiz da espada estava (x 35 no forearm).
    const pinoDepois = raizDoFilho(t, 'weapon');
    expect(pinoDepois[0]).toBeCloseTo(pinoAntes[0], 9);
    expect(pinoDepois[1]).toBeCloseTo(pinoAntes[1], 9);
    // A pilha do jogo não vê a skin dos encaixes.
    expect(t.pilha).toEqual(['default']);
    expect(t.pecaDoSlot('weapon')).toBe('capacete.bone');

    expect(t.desencaixar('weapon')).toBe(true);
    expect(nomes(t)).toEqual(antes);
    expect(t.pecaDoSlot('weapon')).toBe('espada.bone');
    expect(avisos.todos()).toEqual([]);
  });

  it('nenhuma chave da animação desfaz o encaixe; vestir skin depois não o cobre', async () => {
    const { t } = await heroi();
    t.encaixar('weapon', 'capacete.bone');
    let vistos = 0;
    for (const anim of ['idle', 'walk', 'attack']) {
      t.tocar(anim, true);
      for (let i = 0; i < 12; i++) {
        t.avancar(0.1);
        if (!t.esqueleto.findSlot('weapon')!.visible) continue;
        vistos++;
        expect(t.pecaDoSlot('weapon')).toBe('capacete.bone');
      }
    }
    expect(vistos).toBeGreaterThan(20);
    t.vestir('armadura');
    expect(t.pecaDoSlot('weapon')).toBe('capacete.bone');
    expect(t.pilha).toEqual(['default', 'armadura']);
  });

  it('Animar a peça: a peça toca a animação dela, num relógio dela; Soltar: nenhuma animação', async () => {
    const { t, avisos } = await heroi();
    t.tocar('walk', true); // walk não tem chave nested na arma: o jogo manda
    t.encaixar('weapon', 'capacete.bone');
    expect(t.animarPeca('weapon', 'piscar', true)).toBe(true);
    const peca = () => t.esqueleto.findSlot('weapon')!.nested! as NestedSkeleton;
    expect(peca().animation!.name).toBe('piscar');
    const d = peca().animation!.duration;
    t.avancar(d * 0.25);
    expect(peca().time).toBeCloseTo(d * 0.25, 9);
    t.avancar(d); // em laço: deu a volta
    expect(peca().time).toBeCloseTo(d * 0.25, 9);
    // A velocidade do boneco vale para a peça.
    t.velocidade = 2;
    t.avancar(d * 0.1);
    expect(peca().time).toBeCloseTo(d * 0.45, 9);

    expect(t.soltarPeca('weapon')).toBe(true);
    expect(peca().animation).toBeNull();
    expect(avisos.todos()).toEqual([]);
  });

  it('Animar a peça: a chave nested/animation de quem recebe manda, e o leitor avisa', async () => {
    const { t, avisos } = await heroi();
    t.tocar('idle', true); // idle escolhe "idle" para a arma, por chave
    t.animarPeca('weapon', 'brilho', true);
    t.avancar(0.1);
    expect((t.esqueleto.findSlot('weapon')!.nested! as NestedSkeleton).animation!.name).toBe('idle');
    expect(avisos.todos().some((a) => a.includes('chave nested/animation'))).toBe(true);
  });

  it('o que não existe AVISA e não muda nada (regra 21): slot, peça não carregada, animação da peça', async () => {
    const { t, avisos } = await heroi();
    t.tocar('walk', true);
    const antes = nomes(t);
    expect(t.encaixar('mao', 'capacete.bone')).toBe(false);
    expect(t.encaixar('weapon', 'motosserra.bone')).toBe(false);
    expect(t.desencaixar('mao')).toBe(false);
    expect(nomes(t)).toEqual(antes);
    expect(t.animarPeca('weapon', 'ligada', true)).toBe(true); // a espada não tem "ligada": parada
    expect((t.esqueleto.findSlot('weapon')!.nested! as NestedSkeleton).animation).toBeNull();
    expect(t.animarPeca('hand', 'piscar', true)).toBe(false); // a mão é imagem
    const a = avisos.todos().join('\n');
    expect(a).toContain('não tem o slot "mao"');
    expect(a).toContain('"motosserra.bone" não foi carregada');
    expect(a).toContain('não tem a animação "ligada". Ela fica parada');
    expect(a).toContain('o slot "hand" não mostra entidade');
  });
});

describe('Encaixar: a chave que troca a imagem do slot (regra 28)', () => {
  // O herói NÃO serve para isto: nenhuma animação dele troca a imagem da arma
  // (só `visible` e `nested`). Aqui a mão abre e fecha por chave
  // `slot/attachment`, com pinos diferentes: "aberta" em x 0, "fechada" em x 20.
  const boneco = bone('boneco', [['mao', null]]);
  boneco.skins[0].attachments.mao = {
    aberta: { type: 'region', width: 10, height: 10, x: 0 },
    fechada: { type: 'region', width: 10, height: 10, x: 20 },
  };
  boneco.slots[0].attachment = 'aberta';
  (boneco as any).animations = [{
    name: 'fechar',
    timelines: [{ type: 'slot', target: 'mao', property: 'attachment', keys: [{ time: 0, value: 'aberta' }, { time: 0.5, value: 'fechada' }] }],
  }];
  const arquivos = { 'boneco.bone': boneco, 'serra.bone': bone('serra', [['lamina', null]]) };

  it('a chave troca o placeholder, a peça fica, e segue o pino da imagem da vez', async () => {
    const { t, avisos } = await naMemoria(arquivos, 'boneco.bone');
    t.tocar('fechar', false);
    t.avancar(0.1);
    expect(nomes(t)).toEqual(['mao/aberta']);
    t.encaixar('mao', 'serra.bone');
    expect(nomes(t)).toEqual(['mao/lamina/lamina']);
    expect(raizDoFilho(t, 'mao')[0]).toBeCloseTo(0, 12);
    t.avancar(0.5); // passou da chave: a mão pede "fechada"
    expect(t.esqueleto.findSlot('mao')!.attachmentName).toBe('fechada');
    expect(nomes(t)).toEqual(['mao/lamina/lamina']);
    expect(raizDoFilho(t, 'mao')[0]).toBeCloseTo(20, 12);
    t.desencaixar('mao');
    expect(nomes(t)).toEqual(['mao/fechada']);
    expect(avisos.todos()).toEqual([]);
  });
});

describe('Encaixar em volta (item 3): o "Este boneco" pelo jogo', () => {
  // A conta à mão, ANTES de rodar. O boneco: perna, tronco, mao, cabeca (nesta
  // ordem). A aura: atras, meio, frente. Encaixada na "mao":
  //   em bloco           → perna, tronco, [atras, meio, frente], cabeca
  //   em volta de "meio" → atras(aura) ++ meio(boneco) ++ frente(aura):
  //                        aura/atras, perna, tronco, cabeca, aura/frente
  //                        (a "mao" sai da ordem; o "meio" da aura não é desenhado)
  const arquivos = {
    'boneco.bone': bone('boneco', [['perna', null], ['tronco', null], ['mao', null], ['cabeca', null]]),
    'aura.bone': bone('aura', [['atras', null], ['meio', null], ['frente', null]]),
  };

  it('em bloco, sem o slot do meio', async () => {
    const { t } = await naMemoria(arquivos, 'boneco.bone');
    t.encaixar('mao', 'aura.bone');
    expect(nomes(t)).toEqual(['perna/perna', 'tronco/tronco', 'mao/atras/atras', 'mao/meio/meio', 'mao/frente/frente', 'cabeca/cabeca']);
  });

  it('em volta de "meio": atrás do boneco inteiro, e na frente dele', async () => {
    const { t, avisos } = await naMemoria(arquivos, 'boneco.bone');
    t.encaixar('mao', 'aura.bone', 'meio');
    expect(nomes(t)).toEqual(['mao/atras/atras', 'perna/perna', 'tronco/tronco', 'cabeca/cabeca', 'mao/frente/frente']);
    expect(nomes(t)).toEqual(collectDrawList(t.esqueleto).map((d) => d.name));
    expect(avisos.todos()).toEqual([]);
  });

  it('em volta de um slot que a peça não tem: em bloco, e avisa', async () => {
    const { t, avisos } = await naMemoria(arquivos, 'boneco.bone');
    t.encaixar('mao', 'aura.bone', 'centro');
    expect(nomes(t)).toEqual(['perna/perna', 'tronco/tronco', 'mao/atras/atras', 'mao/meio/meio', 'mao/frente/frente', 'cabeca/cabeca']);
    expect(avisos.todos().join('\n')).toContain('não tem o slot "centro"');
  });
});

describe('Encaixar num slot e Encaixar todas (item 4): as armas e as rodas', () => {
  const ent = (uri: string) => ({ type: 'skeleton', uri });
  const arquivos = {
    'moto.bone': bone('moto', [['roda_a', ent('roda.bone')], ['arma_a', ent('arma.bone')], ['arma_b', ent('arma.bone')], ['roda_b', ent('roda.bone')]]),
    'roda.bone': bone('roda', [['aro', null]]),
    'roda-larga.bone': bone('roda-larga', [['pneu', null]]),
    'arma.bone': bone('arma', [['cano', null]]),
    'serra.bone': bone('serra', [['lamina', null]]),
  };

  it('as duas armas iguais: encaixar numa não mexe na outra', async () => {
    const { t } = await naMemoria(arquivos, 'moto.bone');
    expect(t.pecaDoSlot('arma_a')).toBe('arma.bone');
    expect(t.pecaDoSlot('arma_b')).toBe('arma.bone');
    t.encaixar('arma_b', 'serra.bone');
    expect(t.pecaDoSlot('arma_a')).toBe('arma.bone');
    expect(t.pecaDoSlot('arma_b')).toBe('serra.bone');
    expect(nomes(t)).toEqual(['roda_a/aro/aro', 'arma_a/cano/cano', 'arma_b/lamina/lamina', 'roda_b/aro/aro']);
  });

  it('as rodas: Encaixar todas troca todo slot que mostra a peça, e só esses', async () => {
    const { t } = await naMemoria(arquivos, 'moto.bone');
    expect(t.encaixarTodas('roda.bone', 'roda-larga.bone')).toBe(2);
    expect(nomes(t)).toEqual(['roda_a/pneu/pneu', 'arma_a/cano/cano', 'arma_b/cano/cano', 'roda_b/pneu/pneu']);
    // E de volta, pelo mesmo gesto: agora quem mostra "roda-larga" são as duas.
    expect(t.encaixarTodas('roda-larga.bone', 'roda.bone')).toBe(2);
    expect(nomes(t)).toEqual(['roda_a/aro/aro', 'arma_a/cano/cano', 'arma_b/cano/cano', 'roda_b/aro/aro']);
  });

  it('o limite é do jogo (item 5): a lista dos slots, das peças carregadas, e o "Ao encaixar" de cada slot', async () => {
    const { t, avisos } = await naMemoria(arquivos, 'moto.bone');
    expect(t.slots).toEqual(['roda_a', 'arma_a', 'arma_b', 'roda_b']);
    expect(t.entidadesCarregadas).toEqual(['roda.bone', 'roda-larga.bone', 'arma.bone', 'serra.bone']);
    t.tirarOcorrencias();
    t.encaixarTodas('roda.bone', 'roda-larga.bone');
    expect(t.tirarOcorrencias()).toEqual([
      { tipo: 'encaixou', slot: 'roda_a', caminho: 'roda-larga.bone' },
      { tipo: 'encaixou', slot: 'roda_b', caminho: 'roda-larga.bone' },
    ]);
    expect(t.encaixarTodas('nada.bone', 'roda.bone')).toBe(0);
    expect(avisos.todos().join('\n')).toContain('nenhum slot mostra a peça "nada.bone"');
  });
});

// ---------------------------------------------------------------------------
// Parte 3 — um objeto do Construct seguindo um osso (item 6)
// ---------------------------------------------------------------------------

describe('OssoX, OssoY, OssoAngulo e o pino do slot (item 6): a conta à mão', () => {
  // A conta, ANTES de rodar. O osso "braco", filho da raiz: x 100, y 50,
  // giro 30°, escala X 2. No esqueleto (Y para cima): origem (100, 50); o eixo
  // X dele aponta para (2·cos 30°, 2·sin 30°) = (1,7320508, 1).
  //   Instância em (300, 400), sem giro, escala 1:
  //     x = 300 + 100 = 400 · y = 400 − 50 = 350 (o Y desce)
  //     eixo na tela (1,732, −1) → atan2(−1, 1,732) = −30° → 330°
  //   Instância girada 90° (π/2), escala 2:
  //     local (200, −100) → girado: x = 300 − (−100) = 400 · y = 400 + 200 = 600
  //     ângulo: −30° + 90° = 60°
  //   Espelhada (escala X −1, Y 1):
  //     local (−100, −50) → x = 200 · y = 350 · eixo (−1,732, −1) → −150° → 210°
  //   O slot "mao" no braço, imagem com x 10 e giro 90°: o pino fica a 10 px
  //   ao longo do eixo do braço, que com escala 2 são 20 px: (100 + 20·cos 30°,
  //   50 + 20·sin 30°) = (117,3205, 60) → tela sem giro: (417,3205, 340); o
  //   eixo da imagem gira 90° a mais: 330° − 90° = 240°.
  const arvore = bone('braco', [['mao', { type: 'region', width: 10, height: 10, x: 10, rotation: 90 }]]);
  (arvore as any).bones = [{ name: 'root' }, { name: 'braco', parent: 'root', x: 100, y: 50, rotation: 30, scaleX: 2 }];
  arvore.slots[0].bone = 'braco';

  it('na instância parada, girada e espelhada', async () => {
    const { t, avisos } = await naMemoria({ 'braco.bone': arvore }, 'braco.bone');
    const m = t.matrizDoOsso('braco')!;
    const casos: [Vista, number, number, number][] = [
      [{ x: 300, y: 400, angulo: 0, escalaX: 1, escalaY: 1 }, 400, 350, 330],
      [{ x: 300, y: 400, angulo: Math.PI / 2, escalaX: 2, escalaY: 2 }, 400, 600, 60],
      [{ x: 300, y: 400, angulo: 0, escalaX: -1, escalaY: 1 }, 200, 350, 210],
    ];
    for (const [vista, x, y, angulo] of casos) {
      const p = noLayout(vista, m);
      expect(p.x).toBeCloseTo(x, 9);
      expect(p.y).toBeCloseTo(y, 9);
      expect(p.angulo).toBeCloseTo(angulo, 9);
    }
    const pino = noLayout({ x: 300, y: 400, angulo: 0, escalaX: 1, escalaY: 1 }, t.matrizDoSlot('mao')!);
    expect(pino.x).toBeCloseTo(417.32050807568877, 9);
    expect(pino.y).toBeCloseTo(340, 9);
    expect(pino.angulo).toBeCloseTo(240, 9);
    expect(avisos.todos()).toEqual([]);
  });

  it('osso ou slot que não existe: null, e avisa', async () => {
    const { t, avisos } = await naMemoria({ 'braco.bone': arvore }, 'braco.bone');
    expect(t.matrizDoOsso('perna')).toBeNull();
    expect(t.matrizDoSlot('pe')).toBeNull();
    expect(avisos.todos().join('\n')).toContain('não tem o osso "perna"');
    expect(avisos.todos().join('\n')).toContain('não tem o slot "pe"');
  });
});
