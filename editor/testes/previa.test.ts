/**
 * Model behind the "Prévia" panel: layers, the runtime state they build and
 * the copy into the timeline (requirements A5 and A7).
 *
 * There is no jsdom in this project, so `preview.ts` only draws and everything
 * that has to be proved lives in `preview-model.ts`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { effectiveLayers, followNotice } from '../src/panels/preview-model.js';

import type { BoneFile, SkeletonData } from '../../runtime/src/index.js';
import { loadSkeletonData } from '../../runtime/src/index.js';
import type { EditorDoc } from '../src/contract.js';
import { emptySelection } from '../src/contract.js';
import {
  AddBakedAnimation, BAKED_PROPERTIES, BAKE_LOSSES, LAYER_COUNT, bakeMix, bakedName,
  buildPreviewState, defaultLayers, findAnimationData, hasAnyLayer, previewDuration,
  type LayerConfig,
} from '../src/panels/preview-model.js';

const header = { version: '1.0', minVersion: '1.0', generator: 'test' };

/**
 * `andar` gira o braço e a perna, `atirar` gira só o braço. Valores achatados,
 * para a conta sair de cabeça.
 */
function file(): BoneFile {
  return {
    bone: header,
    bones: [{ name: 'root' }, { name: 'braco', parent: 'root' }, { name: 'perna', parent: 'root' }],
    animations: [
      {
        name: 'andar', duration: 1, loop: true,
        timelines: [
          { type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 10 }] },
          { type: 'bone', target: 'perna', property: 'rotation', keys: [{ time: 0, value: 40 }] },
        ],
      },
      {
        name: 'atirar', duration: 1,
        timelines: [
          { type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 90 }] },
        ],
      },
      {
        name: 'girar', duration: 1,
        timelines: [
          { type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 100 }] },
        ],
      },
    ],
  } as unknown as BoneFile;
}

function data(): SkeletonData {
  return loadSkeletonData(file() as unknown as Record<string, unknown>);
}

function layers(...changes: Array<Partial<LayerConfig>>): LayerConfig[] {
  const out = defaultLayers();
  changes.forEach((change, i) => Object.assign(out[i], change));
  return out;
}

/** The command only ever touches `doc.file`. */
function fakeDoc(f: BoneFile): EditorDoc {
  return { file: f, selection: emptySelection() } as unknown as EditorDoc;
}

// ---------------------------------------------------------------------------

describe('camadas da prévia', () => {
  it('começa com quatro camadas desligadas', () => {
    const list = defaultLayers();
    expect(list).toHaveLength(LAYER_COUNT);
    expect(list.every((l) => l.animation === null)).toBe(true);
    expect(list.every((l) => l.bones === null)).toBe(true);
    expect(hasAnyLayer(data(), list)).toBe(false);
  });

  it('acha a animação pelo nome', () => {
    const d = data();
    expect(findAnimationData(d, 'andar')?.name).toBe('andar');
    expect(findAnimationData(d, 'não existe')).toBe(null);
    expect(findAnimationData(d, null)).toBe(null);
  });

  it('monta uma faixa por camada, com peso, velocidade e máscara', () => {
    const d = data();
    const state = buildPreviewState(d, layers(
      { animation: 'andar' },
      { animation: 'atirar', alpha: 0.5, speed: 2, bones: ['braco'] },
    ));
    const base = state.getCurrent(0);
    const cima = state.getCurrent(1);
    expect(base?.animation.name).toBe('andar');
    expect(cima?.animation.name).toBe('atirar');
    expect(cima?.alpha).toBe(0.5);
    expect(cima?.timeScale).toBe(2);
    expect([...(cima?.boneMask ?? [])]).toEqual(['braco']);
    expect(state.getCurrent(2)).toBe(null);
  });

  it('a duração é a da camada mais longa, medida na velocidade dela', () => {
    const d = data();
    expect(previewDuration(d, layers())).toBe(0);
    expect(previewDuration(d, layers({ animation: 'andar' }))).toBe(1);
    expect(previewDuration(d, layers({ animation: 'andar', speed: 2 }))).toBe(0.5);
    expect(previewDuration(d, layers({ animation: 'andar', speed: 2 }, { animation: 'atirar' }))).toBe(1);
  });
});

describe('copiar para a linha do tempo', () => {
  it('sem camada não copia nada', () => {
    expect(bakeMix(data(), layers(), { fps: 10, name: 'x' })).toBe(null);
  });

  it('grava só os ossos que saem da pose de repouso', () => {
    const baked = bakeMix(data(), layers({ animation: 'andar' }), { fps: 10, name: 'copia' });
    expect(baked).not.toBe(null);
    const timelines = baked?.timelines ?? [];
    // `andar` mexe só na rotação de dois ossos: nada mais é gravado
    expect(timelines).toHaveLength(2);
    expect(timelines.every((tl) => tl.type === 'bone' && tl.property === 'rotation')).toBe(true);
    expect(timelines.map((tl) => tl.target).sort()).toEqual(['braco', 'perna']);
    // valor constante vira uma chave só
    const braco = timelines.find((tl) => tl.target === 'braco');
    expect(braco?.keys).toEqual([{ time: 0, value: 10 }]);
  });

  it('a mistura de duas camadas com máscara é o que fica gravado', () => {
    const baked = bakeMix(data(), layers(
      { animation: 'andar' },
      { animation: 'atirar', bones: ['braco'] },
    ), { fps: 10, name: 'copia' });
    const timelines = baked?.timelines ?? [];
    const braco = timelines.find((tl) => tl.target === 'braco');
    const perna = timelines.find((tl) => tl.target === 'perna');
    expect(braco?.keys?.[0]?.value).toBe(90); // a camada de cima venceu no braço
    expect(perna?.keys?.[0]?.value).toBe(40); // a perna continua andando
  });

  it('peso 0,5 na camada de cima dá o valor do meio', () => {
    const baked = bakeMix(data(), layers(
      { animation: 'andar' },
      { animation: 'atirar', alpha: 0.5 },
    ), { fps: 10, name: 'copia' });
    const braco = (baked?.timelines ?? []).find((tl) => tl.target === 'braco');
    // 10 + (90 - 10) * 0,5 = 50
    expect(braco?.keys?.[0]?.value).toBe(50);
  });

  it('uma chave por quadro quando o valor muda', () => {
    const baked = bakeMix(data(), layers({ animation: 'girar' }), { fps: 10, name: 'copia' });
    const braco = (baked?.timelines ?? []).find((tl) => tl.target === 'braco');
    const keys = braco?.keys ?? [];
    expect(keys).toHaveLength(11); // 0 a 1 s de 0,1 em 0,1
    expect(keys[0]).toEqual({ time: 0, value: 0 });
    expect(keys[5]).toEqual({ time: 0.5, value: 50 });
    expect(keys[10]).toEqual({ time: 1, value: 100 });
    expect(baked?.duration).toBe(1);
  });

  it('a velocidade encurta a cópia', () => {
    const baked = bakeMix(data(), layers({ animation: 'girar', speed: 2 }), { fps: 10, name: 'copia' });
    expect(baked?.duration).toBe(0.5);
    const braco = (baked?.timelines ?? []).find((tl) => tl.target === 'braco');
    expect(braco?.keys).toHaveLength(6);
    expect(braco?.keys?.[4]).toEqual({ time: 0.4, value: 80 });
    // a camada tem laço: no quadro 0,5 s ela já deu a volta e voltou ao começo
    expect(braco?.keys?.[5]).toEqual({ time: 0.5, value: 0 });
  });

  it('as sete propriedades de osso estão previstas e as perdas estão escritas', () => {
    expect([...BAKED_PROPERTIES]).toEqual(['x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearX', 'shearY']);
    expect(BAKE_LOSSES.length).toBeGreaterThanOrEqual(4);
    expect(BAKE_LOSSES.every((line) => line.length > 0)).toBe(true);
  });
});

describe('AddBakedAnimation', () => {
  it('põe a animação no arquivo e o desfazer a tira', () => {
    const f = file();
    const doc = fakeDoc(f);
    const name = bakedName(f);
    expect(name).toBe('prévia misturada');
    const baked = bakeMix(data(), layers({ animation: 'andar' }), { fps: 10, name });
    if (baked === null) throw new Error('bake');
    const command = new AddBakedAnimation(baked);
    command.apply(doc);
    expect((f.animations ?? []).map((a) => a.name)).toContain(name);
    command.revert(doc);
    expect((f.animations ?? []).map((a) => a.name)).not.toContain(name);
  });

  it('o nome não repete um que já existe', () => {
    const f = file();
    (f.animations ?? []).push({ name: 'prévia misturada', duration: 0, timelines: [] });
    expect(bakedName(f)).toBe('prévia misturada2');
  });
});


// ---------------------------------------------------------------------------
// A altura do painel — 13/09/2026
// ---------------------------------------------------------------------------

describe('a Prévia cabe: o que não é de todo dia nasce dobrado', () => {
/**
 * O Humberto, sobre o painel de malha: *"é uma wikipédia"*. A medição de
 * altura (`ferramentas/provas/medir-paineis.mjs`) mostrou que a Prévia era
 * pior: **1.933 px de conteúdo** num painel que recebe de 108 a 213 px, com as
 * QUATRO camadas e a caixa de copiar abertas o tempo todo.
 *
 * Dobrando o que não é de todo dia, o conteúdo caiu para **692 px** — 64% a
 * menos. Estes testes prendem essa decisão; a régua de verdade, com o navegador
 * aberto e as duas medidas, é o `npm run medir`, que não roda aqui.
 *
 * Sem jsdom no projeto, `preview.ts` só desenha, e o que se lê aqui é o fonte.
 */
  const FONTE = resolve(__dirname, '../src/panels/preview.ts');
  const FOLHA = resolve(__dirname, '../src/panels/preview.css');
  const ts = readFileSync(FONTE, 'utf8');
  const css = readFileSync(FOLHA, 'utf8');

  it('só a camada 0 nasce aberta; as outras três e o copiar nascem dobrados', () => {
    expect(ts).toContain('const aberto = { camadas: [true, false, false, false], copiar: false };');
  });

  it('uma camada com animação escolhida abre sozinha: o que foi configurado não some', () => {
    expect(ts).toContain('if (layer.animation !== null) aberto.camadas[index] = true;');
  });

  it('há uma camada dobrável por camada, e o número delas bate com o modelo', () => {
    const aberto = /const aberto = \{ camadas: \[([^\]]+)\]/.exec(ts);
    expect(aberto).not.toBeNull();
    expect(aberto![1]!.split(',').length).toBe(LAYER_COUNT);
  });

  it('o título fechado diz o que tem dentro: o nome da animação, ou "vazia"', () => {
    expect(ts).toContain("`${title} — vazia`");
    expect(ts).toContain("`${title} — ${layer.animation}`");
  });

  it('a dobra tem folha própria, e o grupo de dentro não repete a moldura', () => {
    expect(css).toContain('.previa-dobra {');
    expect(css).toContain('.previa-dobra-titulo {');
    expect(css).toContain('.previa-dobra > .prop-grupo {');
  });

  it('o estado de aberto mora no módulo, e não no documento: é tela, não é arquivo', () => {
    // Se isto virar um campo do `.bone`, um leitor teria de conhecer um campo
    // que não diz nada sobre a animação. É a regra 7 da casa.
    expect(ts).not.toMatch(/extensions[^\n]*aberto/);
    expect(ts).toContain('const aberto =');
  });
});

// ---------------------------------------------------------------------------
// A Prévia com vários corpos — degrau 5 (17/09/2026)
// ---------------------------------------------------------------------------

import { readFileSync as lerD5 } from 'node:fs';
import { join as juntarD5, resolve as resolverD5 } from 'node:path';
import { parseBoneText as lerBoneD5 } from '../../runtime/src/index.js';
import type { BoneFile as BoneFileD5 } from '../../runtime/src/index.js';
import { Doc as DocD5 } from '../src/doc/document.js';
import { createEmptyFile as arquivoVazioD5 } from '../src/doc/new-file.js';
import {
  Projeto as ProjetoD5, emptyManifest as manifestoVazioD5,
  readProjectLists as lerListasD5, writeProjectLists as gravarListasD5,
} from '../src/doc/projeto.js';
import { openBody as abrirCorpoD5 } from '../src/panels/animations-actions.js';

describe('a Prévia segue o corpo em foco (degrau 5)', () => {
/**
 * A Prévia monta o esqueleto e as camadas a partir de `doc.data` e das
 * animações de `doc.file`. Trocar o corpo em foco na janela Animação troca as
 * duas coisas — e é isso que se prova aqui: a Prévia não precisou saber de
 * projeto nenhum, mas ela **não pode** continuar oferecendo as animações do
 * homem depois que o lobisomem entrou.
 */
const CASO290_PREVIA = resolverD5(__dirname, '..', '..', 'conformidade', 'casos', 'C-290-virada-corte-seco');

function corpoPrevia(nome: string): BoneFileD5 {
  return lerBoneD5(lerD5(juntarD5(CASO290_PREVIA, nome), 'utf8')) as BoneFileD5;
}

function projetoPrevia(): DocD5 {
  const doc = new DocD5(arquivoVazioD5());
  const projeto = new ProjetoD5(doc);
  const manifest = gravarListasD5(manifestoVazioD5('entrada.bone'), {
    corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
  });
  projeto.open(manifest, lerListasD5(manifest), new Map([
    ['entrada.bone', { file: corpoPrevia('entrada.bone'), options: {} }],
    ['lobisomem.bone', { file: corpoPrevia('lobisomem.bone'), options: {} }],
  ]));
  return doc;
}

it('a camada que escolhe transformar deixa de achar a animação no lobisomem', () => {
  const doc = projetoPrevia();
  const camadas = defaultLayers();
  camadas[0]!.animation = 'transformar';
  expect(findAnimationData(doc.data!, 'transformar')).not.toBeNull();
  expect(hasAnyLayer(doc.data!, camadas)).toBe(true);

  abrirCorpoD5(doc, 'lobisomem.bone');
  // O lobisomem não tem animação nenhuma. A Prévia não toca a animação do corpo
  // que saiu de cena: ela simplesmente não a acha mais, que é a verdade.
  expect(findAnimationData(doc.data!, 'transformar')).toBeNull();
  expect(hasAnyLayer(doc.data!, camadas)).toBe(false);
  expect(doc.data!.animations.map((a) => a.name)).toEqual([]);
});

it('o esqueleto que a Prévia monta é o do corpo em foco', () => {
  const doc = projetoPrevia();
  expect(doc.data!.findBone('braco')).not.toBeNull();
  expect(doc.data!.findBone('rabo')).toBeNull();
  abrirCorpoD5(doc, 'lobisomem.bone');
  expect(doc.data!.findBone('rabo')).not.toBeNull();
  expect(doc.data!.findBone('braco')).toBeNull();
});

it('a duração que a Prévia mostra é a do corpo em foco', () => {
  const doc = projetoPrevia();
  const camadas = defaultLayers();
  camadas[0]!.animation = 'transformar';
  expect(previewDuration(doc.data!, camadas)).toBe(1);
  abrirCorpoD5(doc, 'lobisomem.bone');
  expect(previewDuration(doc.data!, camadas)).toBe(0);
});
});

// ---------------------------------------------------------------------------
// A tela cheia da Visualização — degrau 11, lote 5 (18/09/2026), C5
// ---------------------------------------------------------------------------

describe('a tela cheia leva as animações e as peles dentro', () => {
  const fonte = readFileSync(resolve(__dirname, '../src/panels/preview.ts'), 'utf8');
  const css = readFileSync(resolve(__dirname, '../src/panels/preview.css'), 'utf8');

  it('vai a tela cheia uma caixa PRÓPRIA, com o palco dentro — não só o palco', () => {
    expect(fonte).toContain('buildFullscreen');
    expect(fonte).toContain("el('div', 'previa-cheia')");
    // O palco MUDA DE CASA: o canvas é o mesmo, e a animação não pisca.
    expect(fonte).toContain('caixa.append(topo, anims, palco, peles)');
    expect(fonte).toContain('this.fullHome.insertBefore(palco, this.fullAt)');
  });

  it('as duas listas estão lá: as animações do corpo e a pilha de peles', () => {
    expect(fonte).toContain('fillFullscreenLists');
    expect(fonte).toContain("'Animações'");
    expect(fonte).toContain("'Skins'");
    expect(fonte).toContain('playFullscreen');
    expect(fonte).toContain('toggleFullscreenSkin');
  });

  it('Esc volta, e a caixa vai embora junto', () => {
    // `Esc` é o jeito do navegador de sair: o painel ouve a troca e desmonta.
    expect(fonte).toContain("addEventListener('fullscreenchange', aoTrocar)");
    expect(fonte).toContain('leaveFullscreen');
    expect(fonte).toContain("'Esc volta'");
  });

  it('pôr e tirar pele na tela cheia é TESTE: o arquivo não muda', () => {
    // A pilha de teste é uma lista à parte; a do documento fica como está.
    expect(fonte).toContain('fullStack');
    expect(fonte).toContain('this.fullStack ?? skinStackOf(doc)');
    expect(fonte).toContain('Aqui é teste: pôr e tirar skin não mexe no arquivo.');
    // E não há comando nenhum sendo rodado por esse caminho.
    const trecho = fonte.slice(fonte.indexOf('toggleFullscreenSkin'), fonte.indexOf('toggleFullscreenSkin') + 700);
    expect(trecho).not.toContain('doc.run(');
  });

  it('o navegador que recusa a tela cheia não derruba o painel', () => {
    expect(fonte).toContain('void pedido.catch(() => this.leaveFullscreen())');
  });

  it('o palco cresce na tela cheia, sem esticar torto', () => {
    expect(css).toContain('.previa-cheia');
    expect(css).toContain('object-fit: contain');
    // Três colunas: animações, palco, peles.
    expect(css).toContain('grid-template-columns: 220px 1fr 220px');
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, G-Q4: a camada 0 segue a animação aberta
// ---------------------------------------------------------------------------

describe('rodada 17, G-Q4: com uma animação aberta, a Prévia a mostra', () => {
  it('a camada 0 vazia vira a aberta; escolhida pela mão, fica a dela; as de cima não mudam', () => {
    const camadas = defaultLayers(4);
    expect(effectiveLayers(camadas, 'idle')[0]!.animation).toBe('idle');
    expect(effectiveLayers(camadas, 'idle')[1]!.animation).toBeNull();
    expect(effectiveLayers(camadas, null)[0]!.animation).toBeNull();
    camadas[0]!.animation = 'walk';
    expect(effectiveLayers(camadas, 'idle')[0]!.animation).toBe('walk');
    // Não muda o que o painel guarda: a escolha dele continua vazia ou a dele.
    const vazias = defaultLayers(4);
    effectiveLayers(vazias, 'idle');
    expect(vazias[0]!.animation).toBeNull();
  });

  it('a frase, e o painel liga: o estado sai das camadas efetivas, e ela anda com a agulha', () => {
    expect(followNotice('idle')).toBe('Camada 0: segue a animação aberta (idle). Escolha outra na camada 0 para misturar');
    const painel = readFileSync(resolve(__dirname, '../src/panels/preview.ts'), 'utf8');
    expect(painel).toContain('buildPreviewState(data, effectiveLayers(this.layers, doc.animation))');
    expect(painel).toContain('entry.trackTime = doc.time;');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 3 (doc 68, R7): o número da casa fora da ficha
// ---------------------------------------------------------------------------
const fonteR47 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');
/** Quantas caixas de número cruas (`type = 'number'`) o arquivo ainda tem. */
const cruasR47 = (texto: string): number => (texto.match(/\.type = 'number'|type: 'number'|type="number"/g) ?? []).length;

describe('rodada 47, lote 3: a Mistura da Prévia é o número da casa', () => {
  it('em s, com a faixa na dica, arrasta e faz conta (nota d do doc 84)', () => {
    const previa = fonteR47('panels/preview.ts');
    expect(previa).toContain('campoNumero({');
    expect(previa).toContain("nome: 'Mistura', unidade: 's'");
    expect(cruasR47(previa)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 4: a Prévia diz numa linha, e o botão tem dica', () => {
  it('debaixo do palco, uma linha; a frase da camada 0 inteira na dica (R10)', async () => {
    const { followShort, followNotice } = await import('../src/panels/preview-model.js');
    expect(followShort('idle')).toBe('Camada 0 segue idle');
    expect(followNotice('idle')).toContain('para misturar');
    expect(fonteR47L4('panels/preview.ts')).toContain('this.message.title = ');
  });

  it('Copiar para a linha do tempo diz o que faz na dica (R5); a palavra fica (desenho não universal)', () => {
    expect(fonteR47L4('panels/preview.ts')).toMatch(/this\.copyButton\.title = /);
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 5 (doc 68, opção A; notas do doc 85)
// ---------------------------------------------------------------------------
const fonteR47L5 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 5: a Prévia (nota 3 do doc 85)', () => {
  it('o rótulo da Mistura arrasta o número, e a barra "Quanto aparece" tem dica com a faixa', () => {
    const previa = fonteR47L5('panels/preview.ts');
    expect(previa).toContain('comRotuloQueArrasta(row(\'Mistura\', misturaCampo.caixa');
    expect(previa).toContain("alpha.title = 'Quanto aparece, em %, de 0 a 100:");
  });
});

// Rodada 47, lote 5b (notas do doc 86)
describe('rodada 47, lote 5b: a Prévia: as caixas com dica, e a frase do Copiar numa linha', () => {
  const fonteR47L5b = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

  it('Animação, Repetir, Velocidade e Todos os ossos dizem o que fazem; a frase do Copiar é uma linha', () => {
    const previa = fonteR47L5b('panels/preview.ts');
    for (const d of ["animation.title = 'Animação: ", "loop.title = 'Repetir: ", "speed.title = 'Velocidade: ", "allBones.title = 'Todos os ossos: "]) {
      expect(previa).toContain(d);
    }
    // Rodada 47, lote 6b (doc 88): ainda quebrava em duas linhas; agora mais curta.
    expect(previa).toContain("'Uma chave por quadro'");
  });
});

// Rodada 47, lote 6d (doc 90, nota 4; o detalhe do conferente): jargão na
// Prévia — "cor de slot, morphs, tags" — e nada dizia o que é uma camada.
describe('rodada 47, lote 6d: a Prévia fala a língua de quem chega', () => {
  it('a lista do que fica de fora não usa slot, morph nem tag', async () => {
    const { BAKE_LOSSES } = await import('../src/panels/preview-model.js');
    const tudo = BAKE_LOSSES.join(' ');
    expect(tudo).not.toMatch(/slot|morph|tags/i);
    expect(tudo).toContain('etiquetas');
  });

  it('diz o que é uma camada, na dica de cada uma e na camada 0', async () => {
    const { LAYER_HINT, LAYER_SAYS } = await import('../src/panels/preview-model.js');
    expect(LAYER_HINT).toMatch(/por cima/);
    expect(LAYER_SAYS).toMatch(/camada/i);
    const previa = readFileSync(resolve(__dirname, '../src/panels/preview.ts'), 'utf8');
    expect(previa).toContain('dobra(resumo, LAYER_HINT,');
    expect(previa).toContain("el('p', 'previa-dica', LAYER_SAYS)");
  });
});

// QA da noite de 04/11/2026 (obra/qa-animar): na Prévia, o seletor de
// animação da camada 0 dizia "— a animação aberta —" numa caixa de 110 px, e
// aparecia "— a animaç". O título da camada já diz qual ela segue ("Camada 0
// — a de baixo — segue andar"); a opção fica curta.
import { layerNoneLabel as layerNoneLabelQA } from '../src/panels/preview-model.js';
describe('a opção vazia da camada cabe na caixa (QA da noite)', () => {
  it('camada 0: "— a aberta —"; as outras: "— nenhuma —"', () => {
    expect(layerNoneLabelQA(0)).toBe('— a aberta —');
    expect(layerNoneLabelQA(1)).toBe('— nenhuma —');
  });
  it('cabe nos 12 caracteres que a caixa de 110 px mostra', () => {
    expect(layerNoneLabelQA(0).length).toBeLessThanOrEqual(12);
  });
});
