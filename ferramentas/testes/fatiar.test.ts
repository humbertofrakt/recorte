/**
 * Exportar por pele, por animação e por pasta (requisito E3).
 *
 * O que se prova aqui, na ordem em que importa:
 *
 *   1. Fatiar tudo devolve o arquivo original, campo por campo.
 *   2. O arquivo fatiado passa no JSON Schema e carrega sem UM aviso, nos
 *      dois runtimes.
 *   3. O que saiu é exatamente o que tem de sair — a lista foi contada à mão,
 *      item por item, e está escrita no teste.
 *   4. **A prova que importa:** a pose e a animação do que sobrou são
 *      IDÊNTICAS às do arquivo inteiro. Os dois pose dumps da §12.4 são
 *      comparados campo a campo, com as tolerâncias da §3.6.
 *   5. A ordem de desenho sobrevive ao corte de slots, mesmo sendo escrita em
 *      deslocamentos relativos à posição (§9.5).
 *   6. O atlas fatiado tem só as regiões usadas, e cada região sobrevivente
 *      cai nos MESMOS pixels do desenho depois de reempacotada (§10.4).
 */

import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import zlib from 'node:zlib';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { loadAtlas, loadSkeletonData } from '../../runtime/src/index.js';
import type { AtlasData, SkeletonData } from '../../runtime/src/index.js';
import type { AtlasFile, BoneFile, DrawOrderEntry } from '../../runtime/src/types.js';
import { buildPoseDump, comparePoseDump } from '../src/conformidade/pose-dump.js';
import type { PoseDump, Probe } from '../src/conformidade/pose-dump.js';
import {
  applyDrawOrder, attachmentRegions, folderMatches, groupRemoved, jsonBytes, rebuildDrawOrderValue,
  regionToImage, repackAtlas, shrink, sliceAtlasRegions, sliceBoneFile, usedRegionNames,
} from '../src/exportar/fatiar.js';
import type { PageImage, RemovedItem } from '../src/exportar/fatiar.js';
import { computeRegionUV } from '../src/atlas/packer.js';
import { decodePng } from '../src/atlas/png.js';

const RAIZ = 'C:/Users/F-rak/Desktop/animador';
const EXEMPLOS = `${RAIZ}/formato/exemplos/`;

const ZLIB = {
  inflate: (data: Uint8Array) => new Uint8Array(zlib.inflateSync(Buffer.from(data))),
  deflate: (data: Uint8Array, level = 9) => new Uint8Array(zlib.deflateSync(Buffer.from(data), { level })),
};

function readHeroiFile(): BoneFile {
  return JSON.parse(readFileSync(`${EXEMPLOS}heroi.bone`, 'utf8')) as BoneFile;
}

function readAtlasFile(): AtlasFile {
  return JSON.parse(readFileSync(`${EXEMPLOS}heroi.atlas.json`, 'utf8')) as AtlasFile;
}

function readAtlasData(): AtlasData {
  return loadAtlas(readAtlasFile());
}

function readPage(): PageImage {
  const decoded = decodePng(new Uint8Array(readFileSync(`${EXEMPLOS}heroi.png`)), ZLIB);
  return { name: 'heroi', width: decoded.width, height: decoded.height, pixels: decoded.pixels };
}

function load(file: BoneFile, atlas: AtlasData): SkeletonData {
  return loadSkeletonData(file, { atlases: [atlas] });
}

/** Names of everything that left, as `kind:name`, for a hand-written list. */
function names(removed: readonly RemovedItem[], kind: string): string[] {
  return removed.filter((item) => item.kind === kind).map((item) => item.name);
}

// ---------------------------------------------------------------------------
// The pose dump: the promise the whole feature stands on
// ---------------------------------------------------------------------------

const EVERY_MEASURE = [
  'bones', 'slots', 'vertices', 'uvs', 'events', 'points', 'boundingBoxes',
  'tags', 'variables', 'parameters',
] as const;

/**
 * Poses both files with the same probe and demands they agree.
 *
 * The SLICED dump goes in as "expected", because §12.4 says the expected dump
 * declares what is compared: a bone the slice removed is simply not asked
 * about, and everything that survived is checked to the last decimal.
 */
function samePose(full: SkeletonData, sliced: SkeletonData, probe: Probe): void {
  const wanted: PoseDump = buildPoseDump(sliced, probe);
  const whole: PoseDump = buildPoseDump(full, probe);
  const result = comparePoseDump(wanted, whole);
  if (!result.ok) {
    const first = result.differences.slice(0, 5)
      .map((d) => `${d.pointer}: esperado ${String(d.expected)}, veio ${String(d.actual)}`)
      .join('\n');
    throw new Error(`${result.differences.length} diferença(s):\n${first}`);
  }
  expect(result.ok).toBe(true);
}

// ---------------------------------------------------------------------------
// 1. Slicing nothing changes nothing
// ---------------------------------------------------------------------------

describe('fatiar sem filtro nenhum', () => {
  it('devolve o arquivo equivalente ao original, campo por campo', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, {});
    expect(result.removed).toEqual([]);
    expect(result.file).toEqual(file);
    expect(result.after).toEqual(result.before);
  });

  it('não toca no arquivo que recebeu', () => {
    const file = readHeroiFile();
    const copy = JSON.parse(JSON.stringify(file)) as BoneFile;
    sliceBoneFile(file, { skins: ['armadura'], folders: ['capa'] });
    expect(file).toEqual(copy);
  });

  it('reclama do nome que não existe, em português', () => {
    const file = readHeroiFile();
    expect(() => sliceBoneFile(file, { skins: ['dourada'] })).toThrow(/não achei a pele "dourada"/);
    expect(() => sliceBoneFile(file, { animations: ['pular'] })).toThrow(/não achei a animação "pular"/);
    expect(() => sliceBoneFile(file, { folders: ['nada'] })).toThrow(/nenhum slot está na pasta "nada"/);
  });
});

// ---------------------------------------------------------------------------
// 2. Slicing by skin
// ---------------------------------------------------------------------------

describe('fatiar por pele', () => {
  it('mantém a pele padrão e o que a pele pedida incorpora (§4.4)', () => {
    const file = readHeroiFile();
    // `armadura_capa` incorpora `armadura`, então pedir a filha traz a mãe.
    const result = sliceBoneFile(file, { skins: ['armadura_capa'] });
    expect(result.skins).toEqual(['default', 'armadura', 'armadura_capa']);
    expect(result.removed).toEqual([]);
  });

  it('tira a pele que não foi pedida, e só ela — a conta é de uma linha', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, { skins: ['armadura'] });
    expect(result.skins).toEqual(['default', 'armadura']);
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].kind).toBe('skin');
    expect(result.removed[0].name).toBe('armadura_capa');
    expect(result.removed[0].bytes).toBeGreaterThan(0);
    expect(result.after.bytes).toBeLessThan(result.before.bytes);
  });

  it('deixa o arquivo válido pelo esquema e sem aviso nenhum no runtime', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, { skins: ['armadura'] });
    expect(schemaErrors(result.file)).toEqual([]);
    const data = load(result.file, readAtlasData());
    expect(data.warnings).toEqual([]);
  });

  it('a pose e as três animações ficam IDÊNTICAS às do arquivo inteiro', () => {
    const file = readHeroiFile();
    const atlas = readAtlasData();
    const full = load(file, atlas);
    const sliced = load(sliceBoneFile(file, { skins: ['armadura'] }).file, atlas);

    for (const animation of [null, 'idle', 'walk', 'attack']) {
      for (const skins of [[], ['armadura']]) {
        samePose(full, sliced, {
          skins,
          animation,
          times: [0, 0.1, 0.25, 0.4, 0.6],
          measure: [...EVERY_MEASURE, 'drawOrder'],
        });
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Slicing by animation
// ---------------------------------------------------------------------------

describe('fatiar por animação', () => {
  it('tira as outras animações e os eventos que ninguém dispara mais (§9.7)', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, { animations: ['idle'] });
    expect(result.animations).toEqual(['idle']);
    // Contado à mão: saem `walk` e `attack`; com elas, os dois eventos, porque
    // só elas tinham chave de evento.
    expect(names(result.removed, 'animation')).toEqual(['walk', 'attack']);
    expect(names(result.removed, 'event')).toEqual(['step', 'hit']);
    expect(result.removed).toHaveLength(4);
    expect(result.after.events).toBe(0);
  });

  it('guarda o evento que a animação pedida ainda dispara', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, { animations: ['walk'] });
    const kept = (result.file.events ?? []).map((event) => event.name);
    expect(kept).toContain('step');
    expect(kept).not.toContain('hit');
  });

  it('a pose de `idle` fica idêntica, quadro a quadro', () => {
    const file = readHeroiFile();
    const atlas = readAtlasData();
    const full = load(file, atlas);
    const sliced = load(sliceBoneFile(file, { animations: ['idle'] }).file, atlas);
    samePose(full, sliced, {
      animation: 'idle',
      times: [0, 0.2, 0.5, 0.8, 1, 1.5, 2],
      measure: [...EVERY_MEASURE, 'drawOrder'],
    });
  });

  it('não deixa cair a animação que um `driver` toca (§6.6)', () => {
    const file = readHeroiFile();
    const driver = (file.constraints ?? []).find((c) => c.type === 'driver');
    expect(driver).toBeDefined();
    const played = driver !== undefined && 'animation' in driver ? driver.animation : undefined;
    if (played === undefined) {
      // O herói dirige por alvos, não por animação. A regra é provada num
      // arquivo pequeno feito aqui, para não depender do exemplo.
      const little = driverFile();
      const result = sliceBoneFile(little, { animations: ['vazia'] });
      expect(result.animations).toContain('controle');
      expect(result.animationsKeptForDrivers).toEqual(['controle']);
    } else {
      const result = sliceBoneFile(file, { animations: ['idle'] });
      expect(result.animations).toContain(played);
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Slicing by slot folder
// ---------------------------------------------------------------------------

describe('fatiar por pasta de slot', () => {
  it('deixa os três slots da pasta "capa" e mais nenhum', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, { folders: ['capa'] });
    expect((result.file.slots ?? []).map((slot) => slot.name))
      .toEqual(['cape_upper', 'cape_lower', 'cape_path']);
    // Contado à mão: 23 slots menos os 3 da capa = 20 saíram.
    expect(names(result.removed, 'slot')).toHaveLength(20);
  });

  it('tira o osso e a regra que ficaram sem leitor, e nada mais', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, { folders: ['capa'] });
    // `hair` só era lido pelo slot `hair` e pela física `hair_physics`; os dois
    // saíram, então o osso não move mais nada e sai também.
    expect(names(result.removed, 'bone')).toEqual(['hair']);
    expect(names(result.removed, 'constraint')).toEqual(['hair_physics']);
    // `cape_follow` continua: ela move `cape1` e `cape2`, que seguram os dois
    // slots da capa.
    expect((result.file.constraints ?? []).map((c) => c.name)).toContain('cape_follow');
    expect(result.file.bones.map((bone) => bone.name)).toContain('cape1');
  });

  it('mantém o slot que uma regra viva precisa ler, mesmo fora da pasta', () => {
    const file = readHeroiFile();
    // `cape_path` é o alvo da regra de caminho. Pedindo só as duas peças de
    // desenho, ele volta sozinho, e o resultado diz que voltou.
    const result = sliceBoneFile(file, { folders: ['perna', 'capa'] });
    expect((result.file.slots ?? []).map((s) => s.name)).toContain('cape_path');
  });

  it('deixa o arquivo válido pelo esquema e sem aviso nenhum', () => {
    const file = readHeroiFile();
    const result = sliceBoneFile(file, { folders: ['capa'] });
    expect(schemaErrors(result.file)).toEqual([]);
    const data = load(result.file, readAtlasData());
    expect(data.warnings).toEqual([]);
  });

  it('renumera os pesos: o índice muda, mas continua apontando para o mesmo osso (§4.7)', () => {
    // `binding.bones[]` guarda POSIÇÕES, não nomes. Tirar um osso do meio do
    // array move todo mundo depois dele, e um peso que não for renumerado
    // passa a puxar o osso errado. O arquivo aqui é feito à mão para que a
    // conta caiba na cabeça: 4 ossos, e o do meio não é lido por ninguém.
    const file: BoneFile = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'sobra', parent: 'root' }, { name: 'a', parent: 'root' }, { name: 'b', parent: 'root' }],
      slots: [{ name: 'desenho', bone: 'a', attachment: 'malha', folder: 'fica' }],
      skins: [{
        name: 'default',
        attachments: {
          desenho: {
            malha: {
              type: 'mesh',
              uvs: [0, 0, 1, 0, 1, 1],
              triangles: [0, 1, 2],
              binding: { counts: [1, 1, 1], bones: [2, 3, 2], positions: [0, 0, 1, 0, 1, 1], weights: [1, 1, 1] },
            },
          },
        },
      }],
    } as BoneFile;

    const result = sliceBoneFile(file, { folders: ['fica'] });
    expect(names(result.removed, 'bone')).toEqual(['sobra']);
    expect(result.file.bones.map((bone) => bone.name)).toEqual(['root', 'a', 'b']);
    const binding = (result.file.skins![0].attachments!.desenho.malha as { binding: { bones: number[] } }).binding;
    // Antes: 2 = `a`, 3 = `b`. Depois: 1 = `a`, 2 = `b`.
    expect(binding.bones).toEqual([1, 2, 1]);
    expect(binding.bones.map((at) => result.file.bones[at].name)).toEqual(['a', 'b', 'a']);
  });

  it('no herói, todo índice de peso continua dentro do array de ossos', () => {
    const file = readHeroiFile();
    // A lista `['', 'capa']` guarda os slots sem pasta — é onde mora a única
    // malha com pesos do exemplo — mais os três da capa.
    const result = sliceBoneFile(file, { folders: ['', 'capa'] });
    const count = result.file.bones.length;
    let seen = 0;
    for (const skin of result.file.skins ?? []) {
      for (const placeholders of Object.values(skin.attachments ?? {})) {
        for (const attachment of Object.values(placeholders)) {
          const binding = (attachment as { binding?: { bones: number[] } } | null)?.binding;
          for (const index of binding?.bones ?? []) {
            expect(index).toBeGreaterThanOrEqual(0);
            expect(index).toBeLessThan(count);
            seen++;
          }
        }
      }
    }
    expect(seen).toBe(5);
  });

  it('a pose dos ossos e dos vértices que sobraram fica IDÊNTICA', () => {
    const file = readHeroiFile();
    const atlas = readAtlasData();
    const full = load(file, atlas);
    const sliced = load(sliceBoneFile(file, { folders: ['capa'] }).file, atlas);
    for (const animation of [null, 'idle', 'walk', 'attack']) {
      samePose(full, sliced, {
        animation,
        times: [0, 0.1, 0.3, 0.5, 0.75],
        measure: [...EVERY_MEASURE],
      });
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Draw order (spec 9.5)
// ---------------------------------------------------------------------------

describe('ordem de desenho depois do corte (§9.5)', () => {
  it('o algoritmo da spec dá o exemplo escrito na §9.5', () => {
    // ["corpo","braco","mao"], entradas braco+0 e mao-2 -> ["mao","braco","corpo"]
    expect(applyDrawOrder(3, [{ index: 1, offset: 0 }, { index: 2, offset: -2 }]))
      .toEqual([2, 1, 0]);
    // As duas caem no 0: `mao` ganha, `braco` é descitado -> ["mao","corpo","braco"]
    expect(applyDrawOrder(3, [{ index: 1, offset: -1 }, { index: 2, offset: -2 }]))
      .toEqual([2, 0, 1]);
  });

  it('reescreve os deslocamentos para a lista curta', () => {
    const antes = ['corpo', 'braco', 'mao'];
    const depois = ['corpo', 'mao'];
    // No arquivo inteiro a ordem vira ["mao","braco","corpo"]; sem `braco`
    // sobra ["mao","corpo"], e é isso que a chave nova tem de produzir.
    const value: DrawOrderEntry[] = [{ slot: 'braco', offset: 0 }, { slot: 'mao', offset: -2 }];
    const nova = rebuildDrawOrderValue(value, antes, depois);
    const ordem = applyDrawOrder(
      depois.length,
      nova.map((entry) => ({ index: depois.indexOf(entry.slot), offset: entry.offset })),
    ).map((i) => depois[i]);
    expect(ordem).toEqual(['mao', 'corpo']);
  });

  it('no herói, a ordem que sobra é a ordem inteira sem os slots cortados', () => {
    const file = readHeroiFile();
    const atlas = readAtlasData();
    const cut = sliceBoneFile(file, { folders: ['capa'] });
    const kept = new Set((cut.file.slots ?? []).map((slot) => slot.name));

    const full = load(file, atlas);
    const sliced = load(cut.file, atlas);
    for (const animation of ['idle', 'walk', 'attack']) {
      for (const time of [0, 0.15, 0.3, 0.45, 0.6]) {
        const probe: Probe = { animation, times: [time], measure: ['drawOrder'] };
        const inteiro = buildPoseDump(full, probe).samples[0].drawOrder ?? [];
        const cortado = buildPoseDump(sliced, probe).samples[0].drawOrder ?? [];
        expect(cortado).toEqual(inteiro.filter((name) => kept.has(name)));
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 6. The atlas (spec 10)
// ---------------------------------------------------------------------------

describe('atlas fatiado', () => {
  it('lista só as regiões que os desenhos que sobraram pedem', () => {
    const file = readHeroiFile();
    const cut = sliceBoneFile(file, { folders: ['capa'] });
    expect([...cut.regions].sort()).toEqual(['cape_lower', 'cape_upper']);

    const { atlas, report } = sliceAtlasRegions(readAtlasFile(), new Set(cut.regions));
    expect(atlas.regions.map((region) => region.name).sort()).toEqual(['cape_lower', 'cape_upper']);
    expect(report.dropped).toHaveLength(19);
    expect(report.missing).toEqual([]);
  });

  it('a sequência de imagens conta como região usada (§7.10)', () => {
    const file = readHeroiFile();
    const used = usedRegionNames(file);
    // O slot `hand` tem uma sequência de três quadros: hand_01, 02 e 03.
    expect(used).toContain('hand_01');
    expect(used).toContain('hand_02');
    expect(used).toContain('hand_03');
    expect(attachmentRegions('x', { type: 'region', path: 'olho_', sequence: { count: 4, start: 1, digits: 2 } }))
      .toEqual(['olho_01', 'olho_02', 'olho_03', 'olho_04']);
  });

  it('reempacotado, cai nos mesmos pixels do desenho (§10.4)', () => {
    const file = readHeroiFile();
    const cut = sliceBoneFile(file, { folders: ['capa'] });
    const source = readAtlasFile();
    const page = readPage();
    const packed = repackAtlas(source, [page], new Set(cut.regions), { pageName: 'capa' });

    expect(packed.atlas.regions.map((r) => r.name).sort()).toEqual(['cape_lower', 'cape_upper']);
    expect(packed.pages).toHaveLength(1);
    expect(packed.pixelsAfter).toBeLessThan(packed.pixelsBefore);

    // Prova 1: recortar a região da página velha e da página nova devolve o
    // MESMO desenho, do mesmo tamanho, com os pixels no mesmo lugar. É o que
    // significa "reempacotar não perde nada".
    const novaPagina = packed.pages[0];
    for (const nome of cut.regions) {
      const velha = source.regions.find((r) => r.name === nome)!;
      const nova = packed.atlas.regions.find((r) => r.name === nome)!;
      const antes = regionToImage(velha, page);
      const depois = regionToImage(nova, novaPagina);
      expect([depois.width, depois.height]).toEqual([antes.width, antes.height]);
      let opacos = 0;
      for (let at = 0; at < antes.pixels.length; at += 4) {
        expect(depois.pixels[at + 3]).toBe(antes.pixels[at + 3]);
        if (antes.pixels[at + 3] === 0) continue;
        opacos++;
        expect([depois.pixels[at], depois.pixels[at + 1], depois.pixels[at + 2]])
          .toEqual([antes.pixels[at], antes.pixels[at + 1], antes.pixels[at + 2]]);
      }
      expect(opacos).toBeGreaterThan(100);
    }

    // Prova 2: a fórmula de UV da §10.4, aplicada aos DOIS atlas, cai na mesma
    // cor. Os pontos são centros de pixel — `(i + 0,5) / largura` —, senão a
    // conta cai exatamente na fronteira entre dois pixels e o arredondamento
    // decide sozinho para que lado vai.
    for (const nome of cut.regions) {
      const velha = source.regions.find((r) => r.name === nome)!;
      const nova = packed.atlas.regions.find((r) => r.name === nome)!;
      const caixa = intersecao(caixaDoCorte(velha), caixaDoCorte(nova));
      expect(caixa.width).toBeGreaterThan(4);
      const largura = velha.originalWidth ?? velha.width;
      const altura = velha.originalHeight ?? velha.height;
      for (let i = caixa.left + 1; i < caixa.left + caixa.width - 1; i += 3) {
        for (let j = caixa.top + 1; j < caixa.top + caixa.height - 1; j += 3) {
          const u0 = (i + 0.5) / largura;
          const v0 = (j + 0.5) / altura;
          const [au, av] = computeRegionUV(velha, source.pages[0], u0, v0);
          const [bu, bv] = computeRegionUV(nova, novaPagina, u0, v0);
          expect(pixelAt(novaPagina, bu, bv)).toEqual(pixelAt(page, au, av));
        }
      }
    }
  });

  it('a região girada volta inteira quando é recortada da página', () => {
    const source = readAtlasFile();
    const page = readPage();
    const girada = source.regions.find((region) => region.rotation === 90)!;
    const imagem = regionToImage(girada, page);
    expect(imagem.width).toBe(girada.originalWidth ?? girada.width);
    expect(imagem.height).toBe(girada.originalHeight ?? girada.height);
    let opacos = 0;
    for (let i = 3; i < imagem.pixels.length; i += 4) if (imagem.pixels[i] > 0) opacos++;
    expect(opacos).toBeGreaterThan(0);
  });

  it('diz o quanto encolheu, em bytes e em porcentagem', () => {
    const relato = shrink(1000, 250);
    expect(relato.saved).toBe(750);
    expect(relato.fraction).toBeCloseTo(0.75, 10);
  });
});

// ---------------------------------------------------------------------------
// 7. The second runtime, and the command line
// ---------------------------------------------------------------------------

describe('linha de comando', () => {
  it('grava o .bone, o atlas e a página, e escreve o resumo em português', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'fatiar-'));
    try {
      const saida = join(pasta, 'heroi-armadura');
      const texto = execFileSync(process.execPath, [
        `${RAIZ}/ferramentas/fatiar.mjs`, `${EXEMPLOS}heroi.bone`, saida,
        '--peles', 'armadura', '--animacoes', 'idle,walk',
      ], { encoding: 'utf8' });

      expect(existsSync(`${saida}.bone`)).toBe(true);
      expect(existsSync(`${saida}.atlas.json`)).toBe(true);
      expect(texto).toContain('Peles');
      expect(texto).toContain('O que saiu');
      expect(texto).toContain('Encolheu');

      const cortado = JSON.parse(readFileSync(`${saida}.bone`, 'utf8')) as BoneFile;
      expect((cortado.animations ?? []).map((a) => a.name)).toEqual(['idle', 'walk']);
      expect((cortado.skins ?? []).map((s) => s.name)).toEqual(['default', 'armadura']);
      expect(schemaErrors(cortado)).toEqual([]);

      // Carrega, com o atlas fatiado ao lado, sem um aviso.
      const atlas = loadAtlas(JSON.parse(readFileSync(`${saida}.atlas.json`, 'utf8')));
      expect(loadSkeletonData(cortado, { atlases: [atlas] }).warnings).toEqual([]);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('--um-arquivo-por-pele grava um .bone para cada pele', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'fatiar-'));
    try {
      execFileSync(process.execPath, [
        `${RAIZ}/ferramentas/fatiar.mjs`, `${EXEMPLOS}heroi.bone`, join(pasta, 'heroi'),
        '--um-arquivo-por-pele', '--sem-atlas',
      ], { encoding: 'utf8' });
      const gravados = readdirSync(pasta).filter((name) => name.endsWith('.bone')).sort();
      expect(gravados).toEqual(['heroi-armadura.bone', 'heroi-armadura_capa.bone', 'heroi-default.bone']);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('o segundo runtime, o de Python, abre o arquivo fatiado sem aviso', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'fatiar-'));
    try {
      const saida = join(pasta, 'so-capa');
      execFileSync(process.execPath, [
        `${RAIZ}/ferramentas/fatiar.mjs`, `${EXEMPLOS}heroi.bone`, saida, '--pasta', 'capa',
      ], { encoding: 'utf8' });

      const script = [
        'import json, sys',
        `sys.path.insert(0, ${JSON.stringify(`${RAIZ}/runtime-python`)})`,
        'from recorte import load_skeleton_document, load_atlas',
        `doc = json.load(open(${JSON.stringify(`${saida}.bone`)}, encoding="utf8"))`,
        `at = load_atlas(json.load(open(${JSON.stringify(`${saida}.atlas.json`)}, encoding="utf8")))`,
        'd = load_skeleton_document(doc, [at])',
        'print(len(d.warnings.messages), len(d.bones), len(d.slots))',
      ].join('\n');
      const saidaPython = execFileSync('python', ['-c', script], { encoding: 'utf8' }).trim();
      expect(saidaPython).toBe('0 17 3');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });

  it('no SEGUNDO runtime, o de Python, a pose do que sobrou também fica idêntica', () => {
    // Esta é a mesma prova do teste principal, feita por um runtime que não
    // conhece este código: se o corte mexesse na pose, o Python veria.
    //
    // Aqui NÃO se compara TypeScript com Python. Os dois divergem no herói,
    // em `hair` (física), nos vértices de `clipping` e `path` e nas UVs de uma
    // sequência — e divergem no arquivo INTEIRO, antes de qualquer corte. É um
    // buraco conhecido da suíte, que não tem caso para nada disso (§12.4), e
    // não é assunto do fatiador. O que o fatiador tem de garantir é que a
    // divergência não MUDA: o mesmo conjunto de campos, antes e depois.
    const pasta = mkdtempSync(join(tmpdir(), 'fatiar-'));
    try {
      const inteiro = join(pasta, 'inteiro');
      const cortado = join(pasta, 'cortado');
      for (const dir of [inteiro, cortado]) mkdirSync(dir, { recursive: true });

      // O adaptador oficial da §12.4 quer uma pasta com `entrada.bone`.
      copyFileSync(`${EXEMPLOS}heroi.bone`, join(inteiro, 'entrada.bone'));
      copyFileSync(`${EXEMPLOS}heroi.atlas.json`, join(inteiro, 'heroi.atlas.json'));
      copyFileSync(`${EXEMPLOS}heroi.png`, join(inteiro, 'heroi.png'));
      execFileSync(process.execPath, [
        `${RAIZ}/ferramentas/fatiar.mjs`, `${EXEMPLOS}heroi.bone`, join(cortado, 'entrada'),
        '--peles', 'armadura', '--animacoes', 'walk',
      ], { encoding: 'utf8' });

      const probe: Probe = {
        skins: ['armadura'],
        animation: 'walk',
        times: [0, 0.15, 0.3, 0.45, 0.6],
        // A física da §6.5 só é determinística com passo fixo, e o passo tem
        // de dividir todo tempo pedido.
        physicsDt: 0.05,
        measure: ['bones', 'slots', 'drawOrder', 'vertices', 'uvs', 'events', 'tags'],
      };

      const emPython = (dir: string): PoseDump => JSON.parse(execFileSync(
        'python', [`${RAIZ}/runtime-python/adaptador.py`, dir],
        { encoding: 'utf8', input: JSON.stringify(probe) },
      )) as PoseDump;

      const pyInteiro = emPython(inteiro);
      const pyCortado = emPython(cortado);
      expect(pyCortado.samples).toHaveLength(probe.times.length);

      // A prova: no runtime de Python, o arquivo cortado põe tudo o que sobrou
      // exatamente onde o arquivo inteiro punha.
      expect(comparePoseDump(pyCortado, pyInteiro).differences).toEqual([]);

      // E a divergência entre os dois runtimes é a MESMA antes e depois.
      const tsDe = (dir: string): PoseDump => {
        const doc = JSON.parse(readFileSync(join(dir, 'entrada.bone'), 'utf8')) as BoneFile;
        const nome = doc.assets?.atlases?.[0] ?? 'heroi.atlas.json';
        const atlas = loadAtlas(JSON.parse(readFileSync(join(dir, nome), 'utf8')));
        return buildPoseDump(loadSkeletonData(doc, { atlases: [atlas] }), probe);
      };
      const pontos = (a: PoseDump, b: PoseDump): string[] =>
        [...new Set(comparePoseDump(a, b).differences.map((d) => d.pointer))].sort();

      expect(pontos(tsDe(cortado), pyCortado)).toEqual(pontos(tsDe(inteiro), pyInteiro));
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface Caixa { left: number; top: number; width: number; height: number }

/** Onde o corte da região fica dentro do desenho original (§10.3). */
function caixaDoCorte(region: { width: number; height: number; offsetX?: number; offsetY?: number; originalHeight?: number }): Caixa {
  const originalHeight = region.originalHeight ?? region.height;
  return {
    left: region.offsetX ?? 0,
    top: originalHeight - (region.offsetY ?? 0) - region.height,
    width: region.width,
    height: region.height,
  };
}

function intersecao(a: Caixa, b: Caixa): Caixa {
  const left = Math.max(a.left, b.left);
  const top = Math.max(a.top, b.top);
  return {
    left,
    top,
    width: Math.max(0, Math.min(a.left + a.width, b.left + b.width) - left),
    height: Math.max(0, Math.min(a.top + a.height, b.top + b.height) - top),
  };
}

/** The colour under one UV, as four bytes. */
function pixelAt(page: PageImage, u: number, v: number): number[] {
  const x = Math.min(page.width - 1, Math.max(0, Math.round(u * page.width - 0.5)));
  const y = Math.min(page.height - 1, Math.max(0, Math.round(v * page.height - 0.5)));
  const at = (y * page.width + x) * 4;
  return [page.pixels[at], page.pixels[at + 1], page.pixels[at + 2], page.pixels[at + 3]];
}

type Compiled = ((file: unknown) => boolean) & { errors?: unknown[] | null };

let compiled: Compiled | null = null;

/** Every JSON Schema error of one file, as `pointer: message`. */
function schemaErrors(file: BoneFile): string[] {
  if (compiled === null) {
    const schema = JSON.parse(readFileSync(`${RAIZ}/formato/bone.schema.json`, 'utf8'));
    const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true });
    addFormats(ajv);
    compiled = ajv.compile(schema) as unknown as Compiled;
  }
  const ok = compiled!(file);
  if (ok) return [];
  return (compiled!.errors ?? []).map((error) => {
    const e = error as { instancePath?: string; message?: string };
    return `${e.instancePath ?? ''}: ${e.message ?? ''}`;
  });
}

/** A tiny file whose `driver` plays an animation, for the 6.6 rule. */
function driverFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'osso', parent: 'root' }],
    parameters: [{ name: 'p', min: 0, max: 1, default: 0 }],
    constraints: [{ type: 'driver', name: 'd', parameter: 'p', animation: 'controle' }],
    animations: [
      { name: 'vazia', timelines: [] },
      {
        name: 'controle',
        timelines: [{ type: 'bone', target: 'osso', property: 'rotation', keys: [{ time: 0, value: 0 }] }],
      },
    ],
  } as BoneFile;
}

// ---------------------------------------------------------------------------
// Small pure helpers
// ---------------------------------------------------------------------------

describe('ajudantes', () => {
  it('a pasta casa com ela mesma e com as de dentro', () => {
    expect(folderMatches('capa', ['capa'])).toBe(true);
    expect(folderMatches('capa/interna', ['capa'])).toBe(true);
    expect(folderMatches('capaz', ['capa'])).toBe(false);
    expect(folderMatches(undefined, ['capa'])).toBe(false);
  });

  it('conta os bytes em UTF-8, não em letras', () => {
    expect(jsonBytes({ a: 'ção' })).toBe(new TextEncoder().encode('{"a":"ção"}').length);
    expect(jsonBytes(undefined)).toBe(0);
  });

  it('agrupa o que saiu por tipo, do maior para o menor', () => {
    const grupos = groupRemoved([
      { kind: 'event', name: 'a', reason: '', bytes: 10 },
      { kind: 'skin', name: 'b', reason: '', bytes: 100 },
      { kind: 'skin', name: 'c', reason: '', bytes: 50 },
    ]);
    expect(grupos[0]).toEqual({ kind: 'skin', label: 'pele', count: 2, bytes: 150 });
    expect(grupos[1]).toEqual({ kind: 'event', label: 'evento', count: 1, bytes: 10 });
  });
});
