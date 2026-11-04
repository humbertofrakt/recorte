/**
 * A folha animada do Aseprite — §6 item 1, a outra metade.
 *
 * A **pasta numerada** já virava sequência desde o degrau 8 (`numberedSequence`
 * de `io/drop-plan.ts`, com porta no menu da subpasta e no arrasto). O que
 * faltava é a **folha**: um PNG com todos os quadros lado a lado e um `.json`
 * do Aseprite ao lado, dizendo onde cada quadro está.
 *
 * **O defeito que este lote conserta, medido antes de consertar:** soltar o par
 * hoje cai em `{kind: 'outro'}`, o `detectFormat` devolve `null` porque não é
 * Spine, DragonBones nem Spriter, e a pessoa leva um *"não sei de que programa
 * é"* — com o PNG que veio junto jogado fora. O programa não improvisa (regra
 * 21), mas também não faz.
 *
 * **A conta é direta, e isso não é sorte:** a §10.1 põe a origem da região do
 * atlas no canto **superior esquerdo, Y para baixo**, que é o sistema do
 * Aseprite. Os retângulos entram um para um.
 */

import { existsSync, readFileSync } from 'node:fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { describe, expect, it } from 'vitest';

import type { AnimationDef } from '../../runtime/src/index.js';
import {
  asepriteFrameNames, asepriteSheet, isAsepriteSheet,
} from '../src/io/aseprite-sheet.js';
import type { SheetTag } from '../src/io/aseprite-sheet.js';
import {
  ASEPRITE_DIRECTIONS, AddSheetAnimations, SheetDropCommand, tagAnimations, tagAnimationsNotice,
  tagFrameOrder,
} from '../src/io/aseprite-tags.js';
import { Doc } from '../src/doc/document.js';
import { createEmptyFile } from '../src/doc/new-file.js';
import { DropImageAsSlot } from '../src/panels/palette-model.js';

/** O schema do formato, o mesmo de `documento.test.ts`. */
const validateAgainstSchema = (() => {
  const schema = JSON.parse(readFileSync(process.cwd().replace(/\\/g, '/') + '/formato/bone.schema.json', 'utf8')) as object;
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
  addFormats(ajv);
  return ajv.compile(schema);
})();
import { asepritePair, dropPlan, numberedSequence } from '../src/io/drop-plan.js';
import { detectFormat } from '../src/io/import-foreign.js';
import { withSheet } from '../src/io/project-folder.js';

// ---------------------------------------------------------------------------
// Fixtures: as duas saídas do Aseprite
// ---------------------------------------------------------------------------

/** "Array" — `frames` é uma lista, e cada item traz o `filename`. */
const COMO_LISTA = JSON.stringify({
  frames: [
    { filename: 'fogo 0.aseprite', frame: { x: 0, y: 0, w: 16, h: 24 }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: 16, h: 24 }, sourceSize: { w: 16, h: 24 }, duration: 100 },
    { filename: 'fogo 1.aseprite', frame: { x: 16, y: 0, w: 16, h: 24 }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: 16, h: 24 }, sourceSize: { w: 16, h: 24 }, duration: 100 },
    { filename: 'fogo 2.aseprite', frame: { x: 32, y: 0, w: 16, h: 24 }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: 16, h: 24 }, sourceSize: { w: 16, h: 24 }, duration: 150 },
  ],
  meta: {
    app: 'https://www.aseprite.org/', version: '1.3', image: 'fogo.png',
    format: 'RGBA8888', size: { w: 48, h: 24 }, scale: '1',
    frameTags: [{ name: 'subindo', from: 0, to: 1, direction: 'forward' }],
  },
});

/** "Hash" — `frames` é um objeto, e a chave é o nome. É o padrão do Aseprite. */
const COMO_OBJETO = JSON.stringify({
  frames: {
    'fogo 0.aseprite': { frame: { x: 0, y: 0, w: 16, h: 24 }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: 16, h: 24 }, sourceSize: { w: 16, h: 24 }, duration: 100 },
    'fogo 1.aseprite': { frame: { x: 16, y: 0, w: 16, h: 24 }, rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: 16, h: 24 }, sourceSize: { w: 16, h: 24 }, duration: 100 },
  },
  meta: { app: 'https://www.aseprite.org/', image: 'fogo.png', size: { w: 32, h: 24 } },
});

/** Um quadro CORTADO: o Aseprite tirou a borda transparente. */
const CORTADO = JSON.stringify({
  frames: [{
    filename: 'gota 0', frame: { x: 4, y: 6, w: 8, h: 10 }, rotated: false, trimmed: true,
    // O desenho inteiro tem 20x30; o que sobrou começa a 3 px da esquerda e a
    // 5 px DO TOPO. O formato conta o `offsetY` de BAIXO.
    spriteSourceSize: { x: 3, y: 5, w: 8, h: 10 }, sourceSize: { w: 20, h: 30 }, duration: 100,
  }],
  meta: { app: 'https://www.aseprite.org/', image: 'gota.png', size: { w: 64, h: 64 } },
});

// ---------------------------------------------------------------------------
// O caminho de HOJE, medido antes de mudá-lo
// ---------------------------------------------------------------------------

/*
 * **Regra 26: antes de provar que consertou, prove que o defeito existia.**
 * Sem estes três casos, os de baixo seriam só a descrição do que eu escrevi —
 * um teste que nunca se viu falhar não é um teste.
 *
 * Os três medem o programa como ele era antes deste lote, e **continuam
 * valendo depois**: o `.json` do Aseprite não é de outro programa, e os três
 * importadores que disputam a extensão continuam sem reconhecê-lo. O que muda
 * é que agora alguém o reconhece.
 */
describe('o que acontecia ao soltar a folha do Aseprite', () => {
  it('nenhum dos três importadores reconhece o `.json` do Aseprite', () => {
    expect(detectFormat(COMO_LISTA)).toBeNull();
    expect(detectFormat(COMO_OBJETO)).toBeNull();
  });

  it('e o PNG que veio junto some do plano: o `.json` leva tudo', () => {
    const plano = dropPlan(['fogo.png', 'fogo.json']);
    expect(plano.kind).toBe('outro');
    // `fogo.png` não está aqui. O importador de outro programa recebe só o
    // `.json`, não sabe o que ele é, e a folha inteira se perde.
    expect(plano).toMatchObject({ files: ['fogo.json'] });
  });

  it('o `.json` sozinho, sem PNG, dá no mesmo lugar', () => {
    expect(dropPlan(['fogo.json']).kind).toBe('outro');
  });
});

// ---------------------------------------------------------------------------
// Reconhecer
// ---------------------------------------------------------------------------

describe('reconhecer a folha, sem confundir com os outros `.json`', () => {
  it('reconhece as duas saídas do Aseprite', () => {
    expect(isAsepriteSheet(COMO_LISTA)).toBe(true);
    expect(isAsepriteSheet(COMO_OBJETO)).toBe(true);
  });

  /*
   * **O `.json` é a extensão mais disputada do arrasto:** Spine, DragonBones e
   * o `.scon` do Spriter terminam todos nela, e o atlas do próprio Recorte
   * também. Reconhecer pela extensão seria roubar o arquivo de outro
   * importador — então o que manda é o CONTEÚDO, e o `meta.app` do Aseprite.
   */
  it('não rouba o `.json` de ninguém', () => {
    expect(isAsepriteSheet(JSON.stringify({ skeleton: { spine: '4.1' }, bones: [] }))).toBe(false);
    expect(isAsepriteSheet(JSON.stringify({ armature: [{ name: 'a' }] }))).toBe(false);
    expect(isAsepriteSheet(JSON.stringify({ spriter_data: {} }))).toBe(false);
    expect(isAsepriteSheet(JSON.stringify({ atlas: { version: '1.0' }, pages: [], regions: [] }))).toBe(false);
    expect(isAsepriteSheet('não é json')).toBe(false);
    expect(isAsepriteSheet('')).toBe(false);
  });

  it('um `frames` vazio não é folha: não há quadro nenhum a cortar', () => {
    expect(isAsepriteSheet(JSON.stringify({ frames: [], meta: { app: 'https://www.aseprite.org/' } }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Cortar
// ---------------------------------------------------------------------------

describe('cortar os quadros', () => {
  it('lê a folha em lista, com a página, os quadros e as durações', () => {
    const folha = asepriteSheet(COMO_LISTA, 'fogo.png');
    expect(folha).not.toBeNull();
    expect(folha!.image).toBe('fogo.png');
    expect(folha!.width).toBe(48);
    expect(folha!.height).toBe(24);
    expect(folha!.frames.map((f) => [f.x, f.y, f.width, f.height])).toEqual([
      [0, 0, 16, 24], [16, 0, 16, 24], [32, 0, 16, 24],
    ]);
    expect(folha!.durations).toEqual([100, 100, 150]);
  });

  it('lê a folha em objeto, e a ORDEM é a das chaves', () => {
    const folha = asepriteSheet(COMO_OBJETO, 'fogo.png');
    expect(folha!.frames).toHaveLength(2);
    expect(folha!.frames.map((f) => f.x)).toEqual([0, 16]);
  });

  it('as etiquetas do Aseprite vêm junto: elas são as animações', () => {
    const folha = asepriteSheet(COMO_LISTA, 'fogo.png');
    expect(folha!.tags).toEqual([
      { name: 'subindo', from: 0, to: 1, direction: 'forward', repeat: null },
    ]);
  });

  /**
   * O `offsetY` do formato conta de **baixo** (§10.3, igual ao Spine); o
   * `spriteSourceSize.y` do Aseprite conta de **cima**. Trocar os dois põe o
   * desenho de cabeça para baixo dentro do próprio quadro — e só aparece em
   * arte cortada, que é a que ninguém testa.
   */
  it('o quadro cortado converte o offset de cima para baixo', () => {
    const folha = asepriteSheet(CORTADO, 'gota.png');
    const quadro = folha!.frames[0];
    expect(quadro.originalWidth).toBe(20);
    expect(quadro.originalHeight).toBe(30);
    expect(quadro.offsetX).toBe(3);
    // 30 (altura original) − 5 (cortado em cima) − 10 (o que sobrou) = 15.
    expect(quadro.offsetY).toBe(15);
  });

  it('quadro sem corte não carrega offset nenhum: campo ausente diz o mesmo', () => {
    const folha = asepriteSheet(COMO_LISTA, 'fogo.png');
    expect(folha!.frames[0].offsetX).toBeUndefined();
    expect(folha!.frames[0].offsetY).toBeUndefined();
    expect(folha!.frames[0].originalWidth).toBeUndefined();
  });

  it('a página que o `meta.image` diz vence o nome do arquivo solto', () => {
    expect(asepriteSheet(COMO_LISTA, 'outro-nome.png')!.image).toBe('fogo.png');
  });

  it('sem `meta.image`, vale o PNG que veio no arrasto', () => {
    const sem = JSON.stringify({
      frames: [{ filename: 'a 0', frame: { x: 0, y: 0, w: 8, h: 8 }, sourceSize: { w: 8, h: 8 } }],
      meta: { app: 'https://www.aseprite.org/', size: { w: 8, h: 8 } },
    });
    expect(asepriteSheet(sem, 'chuva.png')!.image).toBe('chuva.png');
  });
});

// ---------------------------------------------------------------------------
// Nomear
// ---------------------------------------------------------------------------

describe('os nomes dos quadros são uma corrida numerada', () => {
  /*
   * **A folha não inventa um caminho novo: ela desemboca no que já existe.**
   * Os nomes saem na convenção da §7.10 (`fogo_01`, `fogo_02`, …), e por isso
   * o `numberedSequence` do degrau 8 os reconhece sem uma linha de código
   * nova. O anexo `sequence`, o menu do botão direito e o comando de soltar
   * continuam sendo os mesmos.
   */
  it('saem como `base_01`, `base_02`, … e o `numberedSequence` os aceita', () => {
    const nomes = asepriteFrameNames('fogo', 3);
    expect(nomes).toEqual(['fogo_01', 'fogo_02', 'fogo_03']);
    const corrida = numberedSequence(nomes);
    expect(corrida).not.toBeNull();
    expect(corrida!.path).toBe('fogo_');
    expect(corrida!.start).toBe(1);
    expect(corrida!.digits).toBe(2);
    expect(corrida!.count).toBe(3);
  });

  it('cem quadros pedem três algarismos, e continuam uma corrida', () => {
    const nomes = asepriteFrameNames('chuva', 100);
    expect(nomes[0]).toBe('chuva_001');
    expect(nomes[99]).toBe('chuva_100');
    expect(numberedSequence(nomes)!.digits).toBe(3);
  });

  it('o nome da base sai do PNG, sem a extensão e sem a pasta', () => {
    const folha = asepriteSheet(COMO_LISTA, 'imagens/fogo.png');
    expect(folha!.names).toEqual(['fogo_01', 'fogo_02', 'fogo_03']);
  });
});

// ---------------------------------------------------------------------------
// Virar atlas
// ---------------------------------------------------------------------------

describe('a folha vira uma página com N regiões', () => {
  it('uma página só, e uma região por quadro', () => {
    const folha = asepriteSheet(COMO_LISTA, 'fogo.png')!;
    const tree = withSheet(null, folha, 'imagens/fogo.png');
    expect(tree.pages).toHaveLength(1);
    expect(tree.pages[0].width).toBe(48);
    expect(tree.regions).toHaveLength(3);
    expect(tree.regions.map((r) => r.name)).toEqual(['fogo_01', 'fogo_02', 'fogo_03']);
    expect(tree.regions.every((r) => r.page === 0)).toBe(true);
    expect(tree.regions[1]).toMatchObject({ x: 16, y: 0, width: 16, height: 24 });
  });

  it('entra ao lado do que a pasta já tinha, sem derrubar nada', () => {
    const antes = withSheet(null, asepriteSheet(COMO_LISTA, 'fogo.png')!, 'fogo.png');
    const depois = withSheet(antes, asepriteSheet(CORTADO, 'gota.png')!, 'gota.png');
    expect(depois.pages).toHaveLength(2);
    expect(depois.regions.map((r) => r.name)).toEqual(['fogo_01', 'fogo_02', 'fogo_03', 'gota_01']);
    expect(depois.regions[3].page).toBe(1);
  });

  it('a mesma folha duas vezes troca no lugar, e não duplica', () => {
    const folha = asepriteSheet(COMO_LISTA, 'fogo.png')!;
    const tree = withSheet(withSheet(null, folha, 'fogo.png'), folha, 'fogo.png');
    expect(tree.pages).toHaveLength(1);
    expect(tree.regions).toHaveLength(3);
  });

  it('o quadro cortado leva os quatro campos da §10.3 para a região', () => {
    const tree = withSheet(null, asepriteSheet(CORTADO, 'gota.png')!, 'gota.png');
    expect(tree.regions[0]).toMatchObject({
      x: 4, y: 6, width: 8, height: 10,
      offsetX: 3, offsetY: 15, originalWidth: 20, originalHeight: 30,
    });
  });
});

// ---------------------------------------------------------------------------
// O par no arrasto
// ---------------------------------------------------------------------------

describe('achar o par (PNG, .json) no que foi solto', () => {
  it('acha o par de mesmo nome', () => {
    expect(asepritePair(['fogo.png', 'fogo.json'])).toEqual({ image: 'fogo.png', json: 'fogo.json' });
  });

  it('com uma imagem só, ela é a folha mesmo com outro nome', () => {
    expect(asepritePair(['folha.png', 'dados.json'])).toEqual({ image: 'folha.png', json: 'dados.json' });
  });

  /*
   * Com várias imagens de nomes diferentes não dá para saber qual é a folha —
   * e adivinhar aqui seria pôr o palpite no desenho (regra 21). Quem soltou
   * continua no caminho de hoje, que ao menos DIZ que não sabe.
   */
  it('com várias imagens e nenhuma de mesmo nome, não adivinha', () => {
    expect(asepritePair(['a.png', 'b.png', 'dados.json'])).toBeNull();
  });

  it('um esqueleto ou um PSD no arrasto manda: a folha não disputa', () => {
    expect(asepritePair(['fogo.png', 'fogo.json', 'heroi.bone'])).toBeNull();
    expect(asepritePair(['fogo.png', 'fogo.json', 'arte.psd'])).toBeNull();
  });

  it('dois `.json` não formam par, e o `.atlas.json` não conta como um', () => {
    expect(asepritePair(['fogo.png', 'a.json', 'b.json'])).toBeNull();
    expect(asepritePair(['fogo.png', 'fogo.json', 'heroi.atlas.json']))
      .toEqual({ image: 'fogo.png', json: 'fogo.json' });
  });

  it('sem imagem, não há folha: o `.json` sozinho segue o caminho de antes', () => {
    expect(asepritePair(['fogo.json'])).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Rodada final, lote 2 (28/09/2026): as etiquetas viram animação (D3)
// ---------------------------------------------------------------------------

/*
 * A referência está em `documentos/pesquisa/nova pesquisa/REFERENCIA arquivo e
 * importar 2026-09-28.md`: as quatro direções saem de `src/doc/anidir.cpp` do
 * Aseprite, e a conta do vai-e-volta de `src/doc/playback.cpp`.
 */

/** Uma folha de `n` quadros de 16 px, com as durações e as etiquetas dadas. */
function folhaCom(durations: number[], frameTags: unknown[]): string {
  return JSON.stringify({
    frames: durations.map((duration, i) => ({
      filename: `heroi ${i}.aseprite`, frame: { x: i * 16, y: 0, w: 16, h: 16 },
      rotated: false, trimmed: false, spriteSourceSize: { x: 0, y: 0, w: 16, h: 16 },
      sourceSize: { w: 16, h: 16 }, duration,
    })),
    meta: { app: 'https://www.aseprite.org/', image: 'heroi.png', size: { w: durations.length * 16, h: 16 }, frameTags },
  });
}

const tag = (over: Partial<SheetTag>): SheetTag => ({
  name: 'andar', from: 0, to: 3, direction: 'forward', repeat: null, ...over,
});

const ALVO = { slot: 'heroi', attachment: 'heroi', skin: 'default' };

/** Os `index` das chaves, na ordem — o que a pessoa vê trocar na cena. */
const indices = (animation: AnimationDef): number[] =>
  animation.timelines![0]!.keys.map((key) => (key.value as { index?: number }).index ?? 0);

describe('o que acontecia com as etiquetas antes do lote 2', () => {
  /*
   * Regra 26. O leitor da v22.5 guardava só `name`, `from` e `to`: a direção e
   * o `repeat` caíam no chão. Sem a direção, uma etiqueta `pingpong` só podia
   * virar uma ida — um vai-e-volta errado que ninguém veria no teste.
   */
  it.skipIf(!existsSync(new URL('../../backup', import.meta.url)))('o leitor antigo jogava fora a direção: `pingpong` e `forward` saíam iguais', async () => {
    // O caminho numa variável: backup/ fica fora do GitHub, e o tsc não deve procurá-lo.
    const copia: string = '../../backup/aseprite-sheet_2026-09-28_antes-do-lote-2-das-etiquetas.js';
    const antigo = await import(/* @vite-ignore */ copia) as { asepriteSheet: (t: string, p: string) => { tags: unknown } | null };
    const texto = folhaCom([100, 100], [{ name: 'vai', from: 0, to: 1, direction: 'pingpong' }]);
    expect(antigo.asepriteSheet(texto, 'heroi.png')!.tags).toEqual([{ name: 'vai', from: 0, to: 1 }]);
  });
});

describe('ler a direção e o repeat da etiqueta', () => {
  it('lê as quatro direções como o Aseprite as escreve', () => {
    const texto = folhaCom([100, 100, 100, 100], ASEPRITE_DIRECTIONS.map((direction, i) => ({
      name: `t${i}`, from: 0, to: 3, direction,
    })));
    expect(asepriteSheet(texto, 'heroi.png')!.tags.map((t) => t.direction))
      .toEqual(['forward', 'reverse', 'pingpong', 'pingpong_reverse']);
  });

  it('sem `direction` no JSON, vale `forward`', () => {
    const texto = folhaCom([100, 100], [{ name: 'a', from: 0, to: 1 }]);
    expect(asepriteSheet(texto, 'heroi.png')!.tags[0]!.direction).toBe('forward');
  });

  it('o `repeat` vem entre aspas no Aseprite, e é lido como número', () => {
    const texto = folhaCom([100, 100], [{ name: 'a', from: 0, to: 1, direction: 'forward', repeat: '3' }]);
    expect(asepriteSheet(texto, 'heroi.png')!.tags[0]!.repeat).toBe(3);
  });

  it('`repeat` ausente, zero ou lixo é "repete sempre"', () => {
    for (const repeat of [undefined, '0', 'muitas', -2]) {
      const texto = folhaCom([100, 100], [{ name: 'a', from: 0, to: 1, repeat }]);
      expect(asepriteSheet(texto, 'heroi.png')!.tags[0]!.repeat).toBeNull();
    }
  });

  it('uma direção desconhecida fica como veio: quem traduz é que diz "não sei"', () => {
    const texto = folhaCom([100, 100], [{ name: 'a', from: 0, to: 1, direction: 'aleatorio' }]);
    expect(asepriteSheet(texto, 'heroi.png')!.tags[0]!.direction).toBe('aleatorio');
  });
});

describe('a ordem dos quadros de cada direção', () => {
  it('ida: 0 1 2 3', () => {
    expect(tagFrameOrder(tag({ direction: 'forward' }))).toEqual([0, 1, 2, 3]);
  });
  it('volta: 3 2 1 0', () => {
    expect(tagFrameOrder(tag({ direction: 'reverse' }))).toEqual([3, 2, 1, 0]);
  });
  it('vai e volta, sem as pontas da volta, para o laço emendar: 0 1 2 3 2 1', () => {
    expect(tagFrameOrder(tag({ direction: 'pingpong' }))).toEqual([0, 1, 2, 3, 2, 1]);
  });
  it('vai e volta de trás: 3 2 1 0 1 2', () => {
    expect(tagFrameOrder(tag({ direction: 'pingpong_reverse' }))).toEqual([3, 2, 1, 0, 1, 2]);
  });
  it('um trecho no meio da folha usa os índices da folha, e não do trecho', () => {
    expect(tagFrameOrder(tag({ from: 4, to: 6 }))).toEqual([4, 5, 6]);
  });
  it('com `repeat`, a ida e a volta se escrevem N vezes', () => {
    expect(tagFrameOrder(tag({ to: 2, repeat: 2 }))).toEqual([0, 1, 2, 0, 1, 2]);
    expect(tagFrameOrder(tag({ to: 2, repeat: 2, direction: 'reverse' }))).toEqual([2, 1, 0, 2, 1, 0]);
  });
  it('no vai e volta cada SENTIDO gasta uma repetição, e a ponta não se repete', () => {
    expect(tagFrameOrder(tag({ direction: 'pingpong', repeat: 3 })))
      .toEqual([0, 1, 2, 3, 2, 1, 0, 1, 2, 3]);
    expect(tagFrameOrder(tag({ direction: 'pingpong_reverse', repeat: 2 })))
      .toEqual([3, 2, 1, 0, 1, 2, 3]);
  });
  it('um quadro só é um quadro só, em qualquer direção', () => {
    for (const direction of ASEPRITE_DIRECTIONS) {
      expect(tagFrameOrder(tag({ from: 2, to: 2, direction }))).toEqual([2]);
    }
  });
  it('dois quadros no vai e volta: 0 1, e o laço emenda', () => {
    expect(tagFrameOrder(tag({ to: 1, direction: 'pingpong' }))).toEqual([0, 1]);
  });
  it('direção desconhecida devolve `null`, nunca um palpite', () => {
    expect(tagFrameOrder(tag({ direction: 'aleatorio' }))).toBeNull();
  });
});

describe('cada etiqueta vira uma animação', () => {
  it('uma timeline `sequence` no desenho da folha, uma chave `hold` por quadro', () => {
    const folha = asepriteSheet(folhaCom([100, 100, 100, 100], [
      { name: 'andar', from: 0, to: 3, direction: 'forward' },
    ]), 'heroi.png')!;
    const { animations, skipped } = tagAnimations(folha, ALVO, []);
    expect(skipped).toEqual([]);
    expect(animations).toHaveLength(1);
    const timeline = animations[0]!.timelines![0]!;
    expect(timeline).toMatchObject({ type: 'sequence', target: 'heroi', skin: 'default', attachment: 'heroi' });
    expect(timeline.keys.every((key) => (key.value as { mode?: string }).mode === undefined)).toBe(true);
    expect(indices(animations[0]!)).toEqual([0, 1, 2, 3]);
  });

  it('o tempo de cada chave é a soma das durações, sem erro de vírgula', () => {
    const folha = asepriteSheet(folhaCom([100, 100, 100, 250], [
      { name: 'andar', from: 0, to: 3 },
    ]), 'heroi.png')!;
    const [andar] = tagAnimations(folha, ALVO, []).animations;
    expect(andar!.timelines![0]!.keys.map((key) => key.time)).toEqual([0, 0.1, 0.2, 0.3]);
    expect(andar!.duration).toBe(0.55);
  });

  it('a duração é a do quadro que TOCA, na volta também', () => {
    const folha = asepriteSheet(folhaCom([100, 200, 300], [
      { name: 'vai', from: 0, to: 2, direction: 'pingpong' },
    ]), 'heroi.png')!;
    const [vai] = tagAnimations(folha, ALVO, []).animations;
    // 0 1 2 1: 100 + 200 + 300 + 200.
    expect(indices(vai!)).toEqual([0, 1, 2, 1]);
    expect(vai!.timelines![0]!.keys.map((key) => key.time)).toEqual([0, 0.1, 0.3, 0.6]);
    expect(vai!.duration).toBe(0.8);
  });

  it('sem `repeat` a animação repete; com `repeat` ela toca e para', () => {
    const folha = asepriteSheet(folhaCom([100, 100], [
      { name: 'sempre', from: 0, to: 1 },
      { name: 'duas', from: 0, to: 1, repeat: '2' },
    ]), 'heroi.png')!;
    const [sempre, duas] = tagAnimations(folha, ALVO, []).animations;
    expect(sempre!.loop).toBe(true);
    expect(duas!.loop).toBe(false);
    expect(indices(duas!)).toEqual([0, 1, 0, 1]);
  });

  it('um nome que já existe não é trocado: a da folha entra como `andar2`', () => {
    const folha = asepriteSheet(folhaCom([100, 100], [{ name: 'andar', from: 0, to: 1 }]), 'heroi.png')!;
    expect(tagAnimations(folha, ALVO, ['andar']).animations[0]!.name).toBe('andar2');
  });

  it('duas etiquetas de mesmo nome na folha viram dois nomes', () => {
    const folha = asepriteSheet(folhaCom([100, 100], [
      { name: 'a', from: 0, to: 0 }, { name: 'a', from: 1, to: 1 },
    ]), 'heroi.png')!;
    expect(tagAnimations(folha, ALVO, []).animations.map((a) => a.name)).toEqual(['a', 'a2']);
  });

  it('etiqueta fora da folha, ao contrário, sem nome ou de direção estranha NÃO vira nada, e diz', () => {
    const folha = asepriteSheet(folhaCom([100, 100], [
      { name: 'longe', from: 0, to: 5 },
      { name: 'torta', from: 1, to: 0 },
      { name: '  ', from: 0, to: 1 },
      { name: 'estranha', from: 0, to: 1, direction: 'aleatorio' },
      { name: 'boa', from: 0, to: 1 },
    ]), 'heroi.png')!;
    const resultado = tagAnimations(folha, ALVO, []);
    expect(resultado.animations.map((a) => a.name)).toEqual(['boa']);
    expect(resultado.skipped).toHaveLength(4);
    expect(resultado.skipped[0]).toContain('"longe"');
    expect(resultado.skipped[3]).toContain('aleatorio');
    const frase = tagAnimationsNotice(resultado);
    expect(frase).toContain('1 etiqueta virou animação (boa)');
    expect(frase).toContain('Ficou de fora');
  });

  it('a frase do rodapé conta e dá os nomes', () => {
    const folha = asepriteSheet(folhaCom([100, 100], [
      { name: 'andar', from: 0, to: 0 }, { name: 'correr', from: 1, to: 1 },
    ]), 'heroi.png')!;
    expect(tagAnimationsNotice(tagAnimations(folha, ALVO, [])))
      .toBe('2 etiquetas viraram animação (andar, correr)');
  });
});

describe('o gesto inteiro é UM passo de desfazer', () => {
  /** O que o `dropAsepriteSheet` da casca faz, sem o navegador. */
  function soltarFolha(doc: Doc, texto: string): { drop: DropImageAsSlot; animacoes: string[] } {
    const folha = asepriteSheet(texto, 'heroi.png')!;
    const run = { path: 'heroi_', start: 1, digits: 2, count: folha.names.length, frames: folha.names };
    const drop = new DropImageAsSlot(doc.file, folha.names[0]!, 'root', doc.visibleSkins, 0, 0, null, run);
    const { animations } = tagAnimations(
      folha, { slot: drop.name, attachment: drop.name, skin: drop.skin },
      (doc.file.animations ?? []).map((a) => a.name),
    );
    doc.run(new SheetDropCommand(drop.label, drop, new AddSheetAnimations(animations)));
    return { drop, animacoes: animations.map((a) => a.name) };
  }

  const TEXTO = folhaCom([100, 100, 100, 100], [
    { name: 'andar', from: 0, to: 1 }, { name: 'pular', from: 2, to: 3, direction: 'pingpong' },
  ]);

  it('um `Ctrl+Z` tira o desenho E as animações; o refazer devolve os dois', () => {
    const doc = new Doc(createEmptyFile());
    const antes = JSON.stringify(doc.file);
    const { drop, animacoes } = soltarFolha(doc, TEXTO);
    expect(animacoes).toEqual(['andar', 'pular']);
    expect(doc.file.slots!.map((s) => s.name)).toContain(drop.name);
    expect(doc.file.animations!.map((a) => a.name)).toEqual(['andar', 'pular']);

    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(doc.canUndo).toBe(false);

    doc.redo();
    expect(doc.file.animations!.map((a) => a.name)).toEqual(['andar', 'pular']);
    expect(doc.file.slots!.map((s) => s.name)).toContain(drop.name);
  });

  it('o arquivo que sai passa no schema, e o runtime lê as animações sem aviso', () => {
    const doc = new Doc(createEmptyFile());
    soltarFolha(doc, TEXTO);
    const ok = validateAgainstSchema(doc.file);
    expect(validateAgainstSchema.errors ?? []).toEqual([]);
    expect(ok).toBe(true);
    expect(doc.data).not.toBeNull();
    expect(doc.data!.animations.map((a) => a.name)).toEqual(['andar', 'pular']);
    expect(doc.warnings.filter((w) => /sequence|sequência|andar|pular/i.test(w))).toEqual([]);
  });

  it('num arquivo que já tem animações, as da folha vão para o fim e o desfazer não leva as velhas', () => {
    const doc = new Doc(createEmptyFile());
    doc.file.animations = [{ name: 'andar', timelines: [] }];
    doc.rebuild();
    soltarFolha(doc, TEXTO);
    expect(doc.file.animations!.map((a) => a.name)).toEqual(['andar', 'andar2', 'pular']);
    doc.undo();
    expect(doc.file.animations!.map((a) => a.name)).toEqual(['andar']);
  });
});
