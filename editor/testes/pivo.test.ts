/**
 * Pivô — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote56-pivo-carimbo`, `lote58-pivo-a-mao`, `lote61-pivo-por-pasta`.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { loadAtlas } from '../../runtime/src/index.js';
import type { AtlasData, BoneFile } from '../../runtime/src/index.js';
import { packAtlas } from '../../ferramentas/src/atlas/packer.js';
import type { AtlasJson } from '../../ferramentas/src/atlas/packer.js';
import { setImportedAtlas } from '../src/io/import-images.js';
import { readEditorState } from '../src/contract.js';
import type { EditorDoc } from '../src/contract.js';
import { duplicateRegion, pivotOf, placeByPivot, regionUses, stampNotice, stampPivots, swapImage, NINE_POINTS, ninePoint, pastePivot, pivotFromClick, pivotNotice, pivotUsers } from '../src/io/pivot-model.js';
import { DuplicateInAtlasCommand, StampPivotsCommand, atlasFilesForDisk, atlasTreesOf, isAtlasEdited, SetPivotCommand, SetFolderPivotCommand } from '../src/io/pivot-atlas.js';
import { SwapSlotImage, imageOnSlotDef } from '../src/panels/palette-model.js';
import { SwapImageEverywhere } from '../src/panels/skins-model.js';
import { pivotInThumb } from '../src/panels/thumbnails.js';
import { STAMP_HINT, duplicateNotice, PIVOT_HINT } from '../src/panels/palette.js';
import { pivotLead, repeatLabel } from '../src/panels/pivot-dialog.js';
import { resolve } from 'node:path';
import { Doc } from '../src/doc/document.js';
import { FOLDER_PIVOTS, folderPivotNotice, folderPivotPlan, imagesInUse, keepFolderPivots, readFolderPivots, withProvisional } from '../src/io/project-folder.js';
import { pruneFolderPivots } from '../src/io/folder-atlas.js';

// ---------------------------------------------------------------------------
// pivo carimbo (lote 56) — era `lote56-pivo-carimbo.test.ts`
// ---------------------------------------------------------------------------

describe('pivo carimbo (lote 56)', () => {
/**
 * Lote 56 — o editor carimba o pivô, e a troca de imagem cai no lugar.
 * Plano: `documentos/planos/PLANO pivô e Animando 2026-09-10.md`.
 *
 * A conta de ida e volta da §10.3, o carimbo tirado do rig (um pivô por
 * imagem), o aviso quando o rig discorda, o Duplicar no atlas, as duas trocas
 * de imagem recolocando pelo pivô, o que vai para o disco, e a cruz da
 * miniatura. Tudo sem navegador (regra 8): os comandos rodam num documento de
 * teste que só tem `file`, `atlases` e `setAssets`.
 */
const EXEMPLOS = process.cwd().replace(/\\/g, '/') + '/formato/exemplos/';

function heroiFile(): BoneFile {
  return JSON.parse(readFileSync(`${EXEMPLOS}heroi.bone`, 'utf8')) as BoneFile;
}

/** O atlas do herói SEM pivô, como era antes deste lote. */
function heroiAtlas(): AtlasJson {
  const tree = JSON.parse(readFileSync(`${EXEMPLOS}heroi.atlas.json`, 'utf8')) as AtlasJson;
  for (const region of tree.regions) {
    delete region.pivotX;
    delete region.pivotY;
  }
  return tree;
}

/** Um documento de teste: o bastante para os comandos do pivô. */
type TestDoc = EditorDoc & { setAssets(atlases: readonly AtlasData[]): void };
function testDoc(file: BoneFile, trees: readonly object[]): TestDoc {
  const doc = {
    file,
    atlases: trees.map((tree) => loadAtlas(JSON.parse(JSON.stringify(tree)))) as readonly AtlasData[],
    imageFor: () => null,
    setAssets(atlases: readonly AtlasData[]) { this.atlases = atlases; },
  };
  return doc as unknown as TestDoc;
}

/** Mão aberta 24×24 e mão fechada 30×20, desenhadas com o pulso em lugares diferentes. */
const MAOS: AtlasJson = {
  atlas: { version: '1.0', generator: 'teste' },
  pages: [{ name: 'p', image: 'p.png', width: 128, height: 128 }],
  regions: [
    { name: 'mao_aberta', page: 0, x: 0, y: 0, width: 24, height: 24 },
    { name: 'mao_fechada', page: 0, x: 30, y: 0, width: 30, height: 20 },
  ],
};

function maosFile(): BoneFile {
  return {
    skins: [
      {
        name: 'default',
        attachments: {
          hand: {
            hand: { type: 'region', path: 'mao_aberta', x: 30, y: 5, rotation: 20, width: 24, height: 24 },
            fist: { type: 'region', path: 'mao_fechada', x: 26, y: 3, rotation: 20 },
          },
        },
      },
      {
        name: 'inverno',
        attachments: { hand: { hand: { type: 'region', path: 'mao_aberta', x: 30, y: 5, rotation: 20 } } },
      },
    ],
  } as unknown as BoneFile;
}

function def(file: BoneFile, skin: string, slot: string, name: string): Record<string, unknown> {
  const found = file.skins?.find((s) => s.name === skin)?.attachments?.[slot]?.[name];
  if (found === undefined || found === null) throw new Error(`sem ${skin}/${slot}/${name}`);
  return found as unknown as Record<string, unknown>;
}

// ---------------------------------------------------------------------------

describe('a conta da §10.3', () => {
  const region = { width: 100, height: 50 };

  it('ida: x 10, y −20 dá (40, 45); girado 90° dá (70, 35); esticado 2× dá (45, 35)', () => {
    expect(pivotOf({ x: 10, y: -20 }, region)).toEqual({ x: 40, y: 45 });
    const girado = pivotOf({ x: 10, y: -20, rotation: 90 }, region)!;
    expect(girado.x).toBeCloseTo(70, 9);
    expect(girado.y).toBeCloseTo(35, 9);
    expect(pivotOf({ x: 10, y: -20, width: 200, height: 100 }, region)).toEqual({ x: 45, y: 35 });
  });

  it('volta: o pivô (40, 45) põe o anexo em x 10, y −20', () => {
    const at = placeByPivot({ ...region, pivotX: 40, pivotY: 45 });
    expect(at.x).toBeCloseTo(10, 9);
    expect(at.y).toBeCloseTo(-20, 9);
    expect(placeByPivot(region)).toEqual({ x: -0, y: -0 });
  });

  it('com escala zero não há pivô', () => {
    expect(pivotOf({ scaleX: 0 }, region)).toBeNull();
  });

  it('ida e volta em todo anexo region do heroi.bone fecha em 1e-9', () => {
    const atlas = heroiAtlas();
    const uses = regionUses(heroiFile(), [atlas]);
    expect(uses.length).toBeGreaterThanOrEqual(20);
    for (const use of uses) {
      const target = atlas.regions[use.region]!;
      const pivot = pivotOf(use.def, target)!;
      const back = placeByPivot({ ...target, pivotX: pivot.x, pivotY: pivot.y }, use.def);
      expect(Math.abs(back.x - (use.def.x ?? 0)), `${use.ref.slot}/${use.ref.attachment}`).toBeLessThan(1e-9);
      expect(Math.abs(back.y - (use.def.y ?? 0)), `${use.ref.slot}/${use.ref.attachment}`).toBeLessThan(1e-9);
    }
  });
});

describe('stampPivots', () => {
  it('no herói: toda região usada por desenho region ganha pivô, sem aviso', () => {
    const result = stampPivots(heroiFile(), [heroiAtlas()]);
    expect(result.warnings).toEqual([]);
    const semPivo = result.atlases[0]!.regions.filter((r) => r.pivotX === undefined).map((r) => r.name);
    // `face` é malha (vértices e UV): fica de fora, como o plano manda.
    expect(semPivo).toEqual(['face']);
    expect(result.stamped).toBe(20);
    expect(result.changed).toBe(20);
    const body = result.atlases[0]!.regions.find((r) => r.name === 'body')!;
    expect([body.pivotX, body.pivotY]).toEqual([38, 7]);
    // A mão da sequência e a mão fechada concordam: o mesmo pivô.
    const quadros = result.atlases[0]!.regions.filter((r) => r.name.startsWith('hand_0'));
    expect(quadros.map((r) => [r.pivotX, r.pivotY])).toEqual([[-23, 12], [-23, 12], [-23, 12]]);
  });

  it('carimbar de novo dá o mesmo número, e nada muda', () => {
    const once = stampPivots(heroiFile(), [heroiAtlas()]);
    const twice = stampPivots(heroiFile(), once.atlases);
    expect(twice.changed).toBe(0);
    expect(JSON.stringify(twice.atlases)).toBe(JSON.stringify(once.atlases));
  });

  it('não mexe nas árvores de entrada', () => {
    const atlas = heroiAtlas();
    const antes = JSON.stringify(atlas);
    stampPivots(heroiFile(), [atlas]);
    expect(JSON.stringify(atlas)).toBe(antes);
  });

  it('dois anexos na mesma região, mesmo x/y: carimba, sem aviso', () => {
    const file = maosFile();
    def(file, 'default', 'hand', 'fist')['path'] = 'mao_aberta';
    def(file, 'default', 'hand', 'fist')['x'] = 30;
    def(file, 'default', 'hand', 'fist')['y'] = 5;
    const result = stampPivots(file, [MAOS]);
    expect(result.warnings).toEqual([]);
    expect(result.atlases[0]!.regions[0]!.pivotX).toBeDefined();
  });

  it('dois anexos com x diferindo em 3 px: não carimba, e avisa com o nome e N = 2', () => {
    const file = maosFile();
    def(file, 'inverno', 'hand', 'hand')['x'] = 33;
    const result = stampPivots(file, [MAOS]);
    expect(result.warnings).toEqual(['imagem "mao_aberta" é usada em 2 lugares com pivôs diferentes; duplique no atlas']);
    expect(result.atlases[0]!.regions[0]!.pivotX).toBeUndefined();
    expect(result.conflicts[0]!.groups.map((g) => g.map((r) => r.skin))).toEqual([['default'], ['inverno']]);
    // A outra imagem, sem briga, carimba normalmente.
    expect(result.atlases[0]!.regions[1]!.pivotX).toBeDefined();
  });

  it('a frase do rodapé', () => {
    expect(stampNotice({ stamped: 20, changed: 20, conflicts: [] })).toBe('20 pivôs carimbados (20 mudaram)');
    expect(stampNotice({ stamped: 0, changed: 0, conflicts: [] })).toMatch(/não há pivô/);
    const um = stampPivots((() => { const f = maosFile(); def(f, 'inverno', 'hand', 'hand')['x'] = 33; return f; })(), [MAOS]);
    expect(stampNotice(um)).toBe('1 pivô carimbado (1 mudou). 1 imagem tem pivôs diferentes: veja o painel Imagens');
  });
});

describe('duplicateRegion', () => {
  const tree: AtlasJson = {
    atlas: { version: '1.0' },
    pages: [{ name: 'p', image: 'p.png', width: 64, height: 64 }],
    regions: [
      { name: 'mao', aliases: ['mao_esq'], page: 0, x: 4, y: 6, width: 10, height: 12, pivotX: 3, pivotY: 1 },
      { name: 'pe', page: 0, x: 20, y: 0, width: 8, height: 8 },
    ],
  };

  it('copia para mao_2, logo depois, com o mesmo retângulo e sem apelidos', () => {
    const made = duplicateRegion(tree, 'mao')!;
    expect(made.name).toBe('mao_2');
    expect(made.atlas.regions.map((r) => r.name)).toEqual(['mao', 'mao_2', 'pe']);
    const copy = made.atlas.regions[1]!;
    expect([copy.page, copy.x, copy.y, copy.width, copy.height]).toEqual([0, 4, 6, 10, 12]);
    expect(copy.aliases).toBeUndefined();
    expect(Object.keys(copy)[0]).toBe('name');
    expect(tree.regions.length).toBe(2);
  });

  it('nome único mesmo se mao_2 já existir: sai mao_3', () => {
    const once = duplicateRegion(tree, 'mao')!;
    expect(duplicateRegion(once.atlas, 'mao')!.name).toBe('mao_3');
    expect(duplicateRegion(tree, 'mao', ['mao_2'])!.name).toBe('mao_3');
  });

  it('acha pelo apelido, e devolve null para quem não existe', () => {
    expect(duplicateRegion(tree, 'mao_esq')!.atlas.regions[1]!.x).toBe(4);
    expect(duplicateRegion(tree, 'nada')).toBeNull();
  });
});

describe('trocar a imagem cai no lugar pelo pivô', () => {
  const stamped = (): AtlasJson[] => stampPivots(maosFile(), [MAOS]).atlases;

  it('swapImage: com pivô, x/y novos e sem width/height; giro fica', () => {
    const anexo = { type: 'region', path: 'mao_aberta', x: 30, y: 5, rotation: 20, width: 24, height: 24 };
    const fechada = stamped()[0]!.regions[1]!;
    swapImage(anexo, 'mao_fechada', fechada);
    // O pivô é gravado com 4 casas (-10,4581; 16,0734), então a mão cai a
    // 0,0001 px do lugar da fechada (26; 3): conferido à mão.
    expect(anexo).toEqual({ type: 'region', path: 'mao_fechada', x: 26, y: 3.0001, rotation: 20 });
  });

  it('swapImage: sem pivô, x/y ficam e width/height saem; malha só troca o path', () => {
    const anexo = { type: 'region', path: 'a', x: 30, y: 5, width: 24, height: 24 };
    swapImage(anexo, 'b', { width: 30, height: 20 });
    expect(anexo).toEqual({ type: 'region', path: 'b', x: 30, y: 5 });
    const malha = { type: 'mesh', path: 'a', width: 24, height: 24 };
    swapImage(malha, 'b', { width: 30, height: 20, pivotX: 1, pivotY: 1 });
    expect(malha).toEqual({ type: 'mesh', path: 'b', width: 24, height: 24 });
  });

  it('pronto quando: aberta → fechada deixa o pulso parado, sem esticar, e desfazer devolve tudo', () => {
    const file = maosFile();
    const doc = testDoc(file, stamped());
    const antes = JSON.stringify(file);
    const aberta = doc.atlases[0]!.findRegion('mao_aberta')!;
    const pulso = pivotOf(def(file, 'default', 'hand', 'hand'), aberta)!;

    const command = new SwapImageEverywhere('hand', 'mao_aberta', 'mao_fechada');
    command.apply(doc);
    expect(command.changed).toBe(2);
    const novo = def(file, 'default', 'hand', 'hand');
    expect(novo['width']).toBeUndefined();
    expect(novo['height']).toBeUndefined();
    // O pulso: a origem do osso cai no pivô da fechada, que é o mesmo pulso.
    const fechada = doc.atlases[0]!.findRegion('mao_fechada')!;
    const agora = pivotOf(novo, fechada)!;
    expect(agora.x).toBeCloseTo(fechada.pivotX!, 3);
    expect(agora.y).toBeCloseTo(fechada.pivotY!, 3);
    expect(pulso.x).toBeCloseTo(aberta.pivotX!, 3);

    command.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('SwapSlotImage num desenho escolhido: o mesmo, e o revert por texto', () => {
    const file = maosFile();
    const doc = testDoc(file, stamped());
    const antes = JSON.stringify(file);
    const command = new SwapSlotImage('hand', 'mao_fechada', 'default', 'hand');
    command.apply(doc);
    expect(def(file, 'default', 'hand', 'hand')).toEqual(
      { type: 'region', path: 'mao_fechada', x: 26, y: 3.0001, rotation: 20 });
    // A outra pele não muda: a troca é de um desenho só.
    expect(def(file, 'inverno', 'hand', 'hand')['path']).toBe('mao_aberta');
    command.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
  });

  it('imagem solta num slot: nasce pelo pivô, ou no centro do osso sem ele', () => {
    const doc = testDoc(maosFile(), stamped());
    // Sem giro: (x, y) = −(pivô − centro) = −(−10,4581 − 15; 16,0734 − 10).
    expect(imageOnSlotDef(doc.atlases, 'mao_fechada')).toEqual(
      { type: 'region', path: 'mao_fechada', x: 25.4581, y: -6.0734 });
    const cru = testDoc(maosFile(), [MAOS]);
    expect(imageOnSlotDef(cru.atlases, 'mao_fechada')).toEqual({ type: 'region', path: 'mao_fechada' });
  });
});

describe('os comandos no documento', () => {
  it('Carimbar pivôs: os atlas ganham pivô, e desfazer devolve os de antes', () => {
    const doc = testDoc(heroiFile(), [heroiAtlas()]);
    const antes = doc.atlases;
    const command = new StampPivotsCommand();
    command.apply(doc);
    expect(command.result!.stamped).toBe(20);
    expect(doc.atlases[0]!.findRegion('body')!.pivotX).toBe(38);
    expect(isAtlasEdited(doc.atlases[0]!)).toBe(true);
    command.revert(doc);
    expect(doc.atlases).toBe(antes);
    expect(doc.atlases[0]!.findRegion('body')!.pivotX).toBeUndefined();
  });

  it('Duplicar no atlas resolve o aviso: cada grupo ganha a sua cópia, carimbada', () => {
    const file = maosFile();
    def(file, 'inverno', 'hand', 'hand')['x'] = 33;
    const doc = testDoc(file, [MAOS]);
    const conflict = stampPivots(file, atlasTreesOf(doc)).conflicts[0]!;
    const antes = JSON.stringify(file);

    const command = new DuplicateInAtlasCommand(conflict.image, conflict.groups.slice(1));
    command.apply(doc);
    expect(command.names).toEqual(['mao_aberta_2']);
    expect(def(file, 'inverno', 'hand', 'hand')['path']).toBe('mao_aberta_2');
    expect(def(file, 'default', 'hand', 'hand')['path']).toBe('mao_aberta');
    const after = stampPivots(file, atlasTreesOf(doc));
    expect(after.warnings).toEqual([]);
    expect(after.changed).toBe(0);
    expect(doc.atlases[0]!.findRegion('mao_aberta_2')!.pivotX).toBeDefined();

    command.revert(doc);
    expect(JSON.stringify(file)).toBe(antes);
    expect(doc.atlases[0]!.findRegion('mao_aberta_2')).toBeNull();
  });

  it('a frase do Duplicar', () => {
    expect(duplicateNotice('mao', ['mao_2'], 1)).toBe('"mao" ganhou a cópia "mao_2" no atlas; 1 desenho passou a usá-la');
    expect(duplicateNotice('mao', ['mao_2'], 0)).toBe('"mao" ganhou a cópia "mao_2" no atlas');
  });

  it('a dica do Carimbar traz a regra da arte', () => {
    expect(STAMP_HINT).toMatch(/articulação no mesmo pixel/);
  });
});

describe('o atlas que vai para o disco', () => {
  it('carimbado; o aberto do disco só conta como mudado quando o carimbo mudou algo', () => {
    const file = heroiFile();
    file.assets = { ...(file.assets ?? {}), atlases: ['heroi.atlas.json'] };
    const cru = atlasFilesForDisk(testDoc(file, [heroiAtlas()]));
    expect(cru.fromImport).toBe(false);
    expect(cru.files[0]!.name).toBe('heroi.atlas.json');
    expect(cru.files[0]!.changed).toBe(true);
    expect(cru.files[0]!.text).toContain('"pivotX": 38');

    const carimbado = stampPivots(file, [heroiAtlas()]).atlases;
    expect(atlasFilesForDisk(testDoc(file, carimbado)).files[0]!.changed).toBe(false);
  });

  it('com o atlas do arquivo e o pacote importado lado a lado, cada um sai com o seu nome', () => {
    const file = heroiFile();
    file.assets = { ...(file.assets ?? {}), atlases: ['heroi.atlas.json', 'heroi-imagens.atlas.json'] };
    const pixels = new Uint8Array(4 * 4 * 4).fill(255);
    const packed = packAtlas([{ name: 'espada', width: 4, height: 4, pixels }], { pageName: 'heroi-imagens' });
    const data = loadAtlas(JSON.parse(JSON.stringify(packed.atlas)));
    const doc = testDoc(file, [heroiAtlas()]);
    doc.setAssets([...doc.atlases, data]);
    setImportedAtlas(doc, { fileName: 'heroi-imagens.atlas.json', packed, data, images: new Map(), options: {} });

    const disk = atlasFilesForDisk(doc);
    expect(disk.fromImport).toBe(true);
    expect(disk.files.map((f) => [f.name, f.fromImport])).toEqual(
      [['heroi.atlas.json', false], ['heroi-imagens.atlas.json', true]]);
    expect(disk.files[0]!.changed).toBe(true);   // o do herói ganhou pivô
    expect(disk.files[1]!.changed).toBe(false);  // a espada ninguém usa: nada a carimbar
    expect(disk.files[1]!.text).toBe(`${JSON.stringify(packed.atlas, null, 2)}\n`);
  });

  it('depois de um Carimbar, o atlas vai para o disco mesmo sem mudança nova', () => {
    const doc = testDoc(heroiFile(), [heroiAtlas()]);
    new StampPivotsCommand().apply(doc);
    expect(atlasFilesForDisk(doc).files[0]!.changed).toBe(true);
  });
});

describe('a cruz na miniatura', () => {
  const base = { rotation: 0 as const, offsetX: 0, offsetY: 0 };

  it('no centro de uma imagem quadrada, no centro da miniatura', () => {
    expect(pivotInThumb({ ...base, width: 24, height: 24, originalWidth: 24, originalHeight: 24, pivotX: 12, pivotY: 12 }, 48))
      .toEqual({ x: 24, y: 24 });
  });

  it('com o recorte deitado na página (rotation 90), o canto de cima à esquerda vai para a direita', () => {
    // §10.4: o canto superior esquerdo do recorte cai em (x + height, y).
    expect(pivotInThumb({ ...base, rotation: 90, width: 10, height: 20, originalWidth: 10, originalHeight: 20, pivotX: 0, pivotY: 20 }, 48))
      .toEqual({ x: 48, y: 12 });
  });

  it('sem pivô, sem cruz', () => {
    expect(pivotInThumb({ ...base, width: 24, height: 24, originalWidth: 24, originalHeight: 24 }, 48)).toBeNull();
  });
});
});

// ---------------------------------------------------------------------------
// pivo a mao (lote 58) — era `lote58-pivo-a-mao.test.ts`
// ---------------------------------------------------------------------------

describe('pivo a mao (lote 58)', () => {
/**
 * Lote 58 — o pivô à mão, para a imagem que ainda não tem rig.
 * Plano: `documentos/planos/PLANO pivô e Animando 2026-09-10.md`.
 *
 * Os nove pontos, o clique na janela (y conta de baixo), colar entre tamanhos
 * diferentes (a proporção viaja), e o Definir pivô recolocando os desenhos
 * que usam a imagem, num passo de desfazer. A janela em si é DOM: fica fora
 * (regra 8); a frase dela está aqui.
 */
type TestDoc = EditorDoc & { setAssets(atlases: readonly AtlasData[]): void };
function testDoc(file: BoneFile, trees: readonly object[]): TestDoc {
  const doc = {
    file,
    atlases: trees.map((tree) => loadAtlas(JSON.parse(JSON.stringify(tree)))) as readonly AtlasData[],
    imageFor: () => null,
    setAssets(atlases: readonly AtlasData[]) { this.atlases = atlases; },
  };
  return doc as unknown as TestDoc;
}

const ATLAS: AtlasJson = {
  atlas: { version: '1.0', generator: 'teste' },
  pages: [{ name: 'p', image: 'p.png', width: 128, height: 128 }],
  regions: [{ name: 'espada', page: 0, x: 0, y: 0, width: 100, height: 50 }],
};

/** Duas mãos seguram a mesma espada: uma girada e esticada, outra não. */
function file(): BoneFile {
  return {
    skins: [{
      name: 'default',
      attachments: {
        mao_d: { espada: { type: 'region', path: 'espada', x: 30, y: 4, rotation: 30, width: 200, height: 100 } },
        mao_e: { espada: { type: 'region', path: 'espada', x: -8, y: 2 } },
      },
    }],
  } as unknown as BoneFile;
}

function def(f: BoneFile, slot: string): Record<string, unknown> {
  return f.skins![0]!.attachments![slot]!['espada'] as unknown as Record<string, unknown>;
}

// ---------------------------------------------------------------------------

describe('os nove pontos e o clique', () => {
  it('ninePoint: nw (0, 50); c (50, 25); se (100, 0)', () => {
    expect(ninePoint('nw', 100, 50)).toEqual({ x: 0, y: 50 });
    expect(ninePoint('c', 100, 50)).toEqual({ x: 50, y: 25 });
    expect(ninePoint('se', 100, 50)).toEqual({ x: 100, y: 0 });
    expect(NINE_POINTS.map((p) => p.id)).toEqual(['nw', 'n', 'ne', 'w', 'c', 'e', 'sw', 's', 'se']);
    for (const p of NINE_POINTS) expect(p.label.length).toBeGreaterThan(4);
  });

  it('clique em (30, 10) da imagem de tela 200×100 mostrando 100×50: pivô (15, 45), y de baixo', () => {
    expect(pivotFromClick(30, 10, 200, 100, 100, 50)).toEqual({ x: 15, y: 45 });
  });

  it('colar de 100×50 para 200×100 leva a proporção: (40, 45) vira (80, 90)', () => {
    expect(pastePivot({ x: 40, y: 45 }, { ow: 100, oh: 50 }, { ow: 200, oh: 100 })).toEqual({ x: 80, y: 90 });
  });
});

describe('Definir pivô: quem usa a imagem fica parado (desde a rodada 13)', () => {
  /*
   * REESCRITO DE PROPÓSITO na rodada 13 (05/10/2026). Este teste provava o
   * contrário da decisão do Humberto: *"os dois com x/y novos"* — o desenho
   * andava até o pivô novo cair na origem do osso. Agora os dois desenhos
   * ficam onde estavam, e o pivô vai para a lista dos pivôs à mão, que o
   * carimbo respeita.
   */
  it('numa região usada por 2 desenhos: os dois ficam onde estavam; o pivô vai para a lista; revert devolve tudo', () => {
    const f = file();
    const doc = testDoc(f, [ATLAS]);
    const antes = JSON.stringify(f);
    expect(pivotUsers(f, atlasTreesOf(doc), 'espada')).toHaveLength(2);
    const mao_e = JSON.stringify(def(f, 'mao_e'));
    const mao_d = JSON.stringify(def(f, 'mao_d'));

    const command = new SetPivotCommand('espada', { x: 10, y: 25 });
    command.apply(doc);
    expect(command.moved).toBe(0);
    expect(command.still).toBe(2);
    expect(command.hand).toBe(true);
    const region = doc.atlases[0]!.findRegion('espada')!;
    expect([region.pivotX, region.pivotY]).toEqual([10, 25]);
    // Os dois desenhos, letra por letra como estavam.
    expect(JSON.stringify(def(f, 'mao_e'))).toBe(mao_e);
    expect(JSON.stringify(def(f, 'mao_d'))).toBe(mao_d);
    expect(readHandR13b(f)).toEqual({ espada: [10, 25] });
    // O carimbo respeita a lista: dá o pivô novo, não o do rig.
    const again = stampPivots(f, atlasTreesOf(doc));
    expect(again.atlases[0]!.regions[0]!.pivotX).toBe(10);
    expect(again.atlases[0]!.regions[0]!.pivotY).toBe(25);
    expect(again.skipped).toEqual(['espada']);

    command.revert(doc);
    expect(JSON.stringify(f)).toBe(antes);
    expect(doc.atlases[0]!.findRegion('espada')!.pivotX).toBeUndefined();
  });

  it('placeByPivot com keepSize usa o width/height do desenho', () => {
    const region = { width: 100, height: 50, pivotX: 10, pivotY: 25 };
    expect(placeByPivot(region, { width: 200, height: 100 }, 1, true)).toEqual({ x: 80, y: -0 });
    expect(placeByPivot(region, { width: 200, height: 100 })).toEqual({ x: 40, y: -0 });
  });

  it('imagem que ninguém usa: só o pivô muda', () => {
    const f = { skins: [] } as unknown as BoneFile;
    const doc = testDoc(f, [ATLAS]);
    const command = new SetPivotCommand('espada', { x: 0, y: 50 }, 'Colar pivô');
    command.apply(doc);
    expect(command.moved).toBe(0);
    expect(command.label).toBe('Colar pivô');
    expect(doc.atlases[0]!.findRegion('espada')!.pivotY).toBe(50);
  });
});

describe('as frases', () => {
  // REESCRITO DE PROPÓSITO no conserto 2 da conferência da rodada 13: era "a
  // janela avisa quantos desenhos serão recolocados", e a frase dizia
  // "será recolocado pelo pivô novo" — o contrário do que o programa faz.
  it('a janela diz quantos desenhos usam a imagem, e que eles ficam parados', () => {
    expect(pivotLead(2)).toBe('2 desenhos usam esta imagem. Eles ficam parados: só o ponto do pivô muda de lugar.');
    expect(pivotLead(1)).toBe('1 desenho usa esta imagem. Ele fica parado: só o ponto do pivô muda de lugar.');
    expect(pivotLead(0)).toMatch(/Nenhum desenho/);
    expect(pivotLead(1)).not.toMatch(/recoloc/);
  });

  it('o rodapé e a dica do botão', () => {
    expect(pivotNotice('espada', { x: 10.5, y: 25 }, 2)).toBe('Pivô de "espada": 10,5, 25. 2 desenhos recolocados');
    expect(PIVOT_HINT).toMatch(/nove pontos/);
  });
});
});

// ---------------------------------------------------------------------------
// pivo por pasta (lote 61) — era `lote61-pivo-por-pasta.test.ts`
// ---------------------------------------------------------------------------

describe('pivo por pasta (lote 61)', () => {
/**
 * Lote 61 (plano pasta do projeto): o pivô por pasta.
 *
 * Sem DOM. O Humberto, 10/09/2026: *"as mãos saem do Photoshop alinhadas, eu
 * clico no pivô de uma e peço para repetir para todas da mesma pasta. Não
 * conflita com braço nem arma: cada um tem a sua pasta."* O que se prova aqui:
 * a conta do Repetir (mesmo pixel, ou mesma proporção), que nada atravessa
 * pastas, onde mora o pivô da imagem que ainda está fora da cena, os desenhos
 * recolocados num passo só, e o desfazer por texto.
 */
const SRC = resolve(__dirname, '../src');

/** A pasta `maos/` com três 100×50 e uma 200×100, e uma cabeça. */
const MAOS = [
  { name: 'maos/mao_1', width: 100, height: 50 },
  { name: 'maos/mao_2', width: 100, height: 50 },
  { name: 'maos/mao_3', width: 100, height: 50 },
  { name: 'maos/mao_grande', width: 200, height: 100 },
  { name: 'cabecas/feliz', width: 100, height: 50 },
];

/**
 * Um boneco com duas mãos da pasta já na cena (regiões provisórias sem pivô),
 * cada uma num slot, com tamanho escrito — o Definir pivô mantém o tamanho.
 */
function boneco(): Doc {
  let tree = withProvisional(null, { name: 'maos/mao_1', path: 'maos/mao_1.png', width: 100, height: 50 });
  tree = withProvisional(tree, { name: 'maos/mao_2', path: 'maos/mao_2.png', width: 100, height: 50 });
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'a', bone: 'root', attachment: 'a' }, { name: 'b', bone: 'root', attachment: 'b' }],
    skins: [{
      name: 'default',
      attachments: {
        a: { a: { type: 'region', path: 'maos/mao_1', x: 0, y: 0, width: 100, height: 50 } },
        b: { b: { type: 'region', path: 'maos/mao_2', x: 0, y: 0 } },
      },
    }],
  } as unknown as BoneFile;
  return new Doc(file, { atlases: [loadAtlas(JSON.parse(JSON.stringify(tree)))] });
}

describe('a conta do Repetir para a pasta', () => {
  it('mesmo tamanho, mesmo pixel; tamanho diferente, mesma proporção; outra pasta, intocada', () => {
    const plano = folderPivotPlan(MAOS, 'maos/mao_1', { x: 40, y: 45 });
    const porNome = new Map(plano.map((p) => [p.name, [p.x, p.y]]));
    expect(porNome.get('maos/mao_1')).toEqual([40, 45]);
    expect(porNome.get('maos/mao_2')).toEqual([40, 45]);
    expect(porNome.get('maos/mao_3')).toEqual([40, 45]);
    expect(porNome.get('maos/mao_grande')).toEqual([80, 90]);
    expect(porNome.has('cabecas/feliz')).toBe(false);
    expect(plano).toHaveLength(4);
  });

  it('imagem da raiz não tem grupo: o plano é só ela', () => {
    expect(folderPivotPlan([{ name: 'solta', width: 10, height: 10 }, { name: 'outra', width: 10, height: 10 }],
      'solta', { x: 1, y: 2 })).toEqual([{ name: 'solta', x: 1, y: 2 }]);
  });

  it('a caixa da janela: ligada numa subpasta; desligada na raiz e sozinha, dizendo por quê', () => {
    expect(repeatLabel({ folder: 'maos', count: 6 })).toMatchObject({ enabled: true });
    expect(repeatLabel({ folder: 'maos', count: 6 }).text).toContain('maos (6 imagens)');
    expect(repeatLabel({ folder: '', count: 3 })).toMatchObject({ enabled: false });
    expect(repeatLabel({ folder: '', count: 3 }).text).toContain('raiz');
    expect(repeatLabel({ folder: 'maos', count: 1 }).enabled).toBe(false);
  });

  it('a frase do rodapé', () => {
    expect(folderPivotNotice('maos', 6, 2)).toBe('Pivô repetido para a pasta maos: 6 imagens. 2 desenhos recolocados');
    expect(folderPivotNotice('maos', 1, 0)).toBe('Pivô repetido para a pasta maos: 1 imagem');
  });
});

describe('o comando', () => {
  // REESCRITO DE PROPÓSITO na rodada 13 (05/10/2026): era "os 2 desenhos são
  // recolocados" — a mão ia de (0, 0) para (10, −20). Agora fica parada, e o
  // pivô das duas mãos vai para a lista dos pivôs à mão.
  it('as imagens na cena ganham o pivô na região, e os 2 desenhos ficam parados', () => {
    const doc = boneco();
    const plano = folderPivotPlan(MAOS, 'maos/mao_1', { x: 40, y: 45 });
    const command = new SetFolderPivotCommand(plano);
    doc.run(command);
    expect(command.count).toBe(4);
    expect(command.moved).toBe(0);
    expect(command.still).toBe(2);
    const region = doc.atlases[0]!.findRegion('maos/mao_2');
    expect([region?.pivotX, region?.pivotY]).toEqual([40, 45]);
    const a = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, number>>>)['a']!['a']!;
    expect(a['x']).toBe(0);
    expect(a['y']).toBe(0);
    // O tamanho escrito continua.
    expect(a['width']).toBe(100);
    expect(readHandR13b(doc.file)).toEqual({ 'maos/mao_1': [40, 45], 'maos/mao_2': [40, 45] });
  });

  it('as que ainda estão fora da cena vão para folderPivots, no estado do editor', () => {
    const doc = boneco();
    doc.run(new SetFolderPivotCommand(folderPivotPlan(MAOS, 'maos/mao_1', { x: 40, y: 45 })));
    expect(readFolderPivots(doc.file)).toEqual({ 'maos/mao_3': [40, 45], 'maos/mao_grande': [80, 90] });
    expect(doc.file.extensionsUsed).toContain('RECORTE_editor_state');
    // As que estão na cena não entram na lista: o pivô delas está na região.
    expect(readFolderPivots(doc.file)).not.toHaveProperty('maos/mao_1');
  });

  it('desfazer devolve os pivôs, a lista e os dois desenhos, por texto', () => {
    const doc = boneco();
    const antes = JSON.stringify(doc.file);
    doc.run(new SetFolderPivotCommand(folderPivotPlan(MAOS, 'maos/mao_1', { x: 40, y: 45 })));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(doc.atlases[0]!.findRegion('maos/mao_2')?.pivotX).toBeUndefined();
    doc.redo();
    expect(doc.atlases[0]!.findRegion('maos/mao_2')?.pivotX).toBe(40);
  });

  it('o pivô guardado vai para a região quando a imagem entra na cena', () => {
    const tree = withProvisional(null, { name: 'maos/mao_3', path: 'maos/mao_3.png', width: 100, height: 50 }, [40, 45]);
    expect(tree.regions[0]).toMatchObject({ pivotX: 40, pivotY: 45 });
    const texto = readFileSync(resolve(SRC, 'io/folder-atlas.ts'), 'utf8');
    expect(texto).toContain('readFolderPivots(doc.file)[name]');
  });
});

describe('ao salvar', () => {
  it('a lista fica só com as não usadas', () => {
    expect(keepFolderPivots({ a: [1, 2], b: [3, 4] }, new Set(['a']))).toEqual({ b: [3, 4] });
    const doc = boneco();
    doc.run(new SetFolderPivotCommand([
      { name: 'maos/mao_1', x: 1, y: 1 }, { name: 'maos/mao_3', x: 2, y: 2 },
    ]));
    // Alguém ainda guardou um pivô para `mao_1` (já na cena): o Salvar tira.
    const state = readEditorState(doc.file) as Record<string, unknown>;
    (state[FOLDER_PIVOTS] as Record<string, [number, number]>)['maos/mao_1'] = [9, 9];
    pruneFolderPivots(doc);
    expect(readFolderPivots(doc.file)).toEqual({ 'maos/mao_3': [2, 2] });
    expect([...imagesInUse(doc.file)].sort()).toEqual(['maos/mao_1', 'maos/mao_2']);
  });

  it('valor estragado na lista é ignorado', () => {
    const file = {
      bone: { version: '1.0' }, bones: [{ name: 'root' }],
      extensions: { RECORTE_editor_state: { folderPivots: { a: [1, 2], b: 'x', c: [1], d: [1, Number.NaN] } } },
    } as unknown as BoneFile;
    expect(readFolderPivots(file)).toEqual({ a: [1, 2] });
  });
});
});

// ---------------------------------------------------------------------------
// O painel Pivôs, e o pivô do corpo do instante (degrau 8, tarefas 8.5 e 8.7)
// ---------------------------------------------------------------------------

import { readFileSync as lerC4, existsSync as existeC4 } from 'node:fs';
import { resolve as resolverC4 } from 'node:path';
import { RIGHT_GROUPS as GRUPOS_C4 } from '../src/ui/layout-model.js';
import { WINDOW_PANELS as PAINEIS_C4, WINDOW_GROUPS as BLOCOS_C4 } from '../src/ui/menus.js';
import { corpoDe as corpoC4, getPanel as painelC4 } from '../src/contract.js';
import { NO_PIVOT_IMAGES, PIVOT_GRID_HINT, PIVOT_THUMB, pivotPanel } from '../src/panels/pivot-panel.js';
import { folderSizeWarning as avisoDeTamanhoC4 } from '../src/io/project-folder.js';
import {
  Projeto as ProjetoC4, emptyManifest as manifestoC4, readProjectLists as lerListasC4,
  writeProjectLists as gravarListasC4,
} from '../src/doc/projeto.js';
import { createEmptyFile as vazioC4 } from '../src/doc/new-file.js';

describe('o painel Pivôs (degrau 8, C4)', () => {
/**
 * Palavra do Humberto (RESPOSTAS lote 3, Q37): acertar o pivô de umas trinta
 * peças **rápido, "igual programa de edição"**, dentro do programa. A pesquisa
 * dos modos recomendou e ele aprovou: **painel**, a pasta inteira em grade, e
 * **sem janela que tranca**.
 *
 * Sem DOM (regra 8): prova-se que o painel existe e nasce na coluna — que é o
 * que a prova `npm run medir` cobra —, e o texto do arquivo prova as três
 * promessas que não são conta: nada de modal, nada de botão de gravar, e a
 * cruz em toda miniatura.
 */
const SRC_C4 = resolverC4(__dirname, '../src');

it('o painel existe, com id e nome', () => {
  expect(pivotPanel.id).toBe('pivos');
  expect(pivotPanel.title).toBe('Pivôs');
  expect(painelC4('pivos')).toBe(pivotPanel);
});

it('ele NASCE NA COLUNA, ao lado do Imagens — senão a medição não o mede', () => {
  /*
   * A armadilha do degrau 5, escrita no `QUEM E QUEM`: um painel que está só
   * no menu Janela **não nasce na coluna**, porque quem monta a arrumação de
   * fábrica é o `RIGHT_GROUPS` do `layout-model.ts`. E painel que não nasce na
   * coluna a prova `npm run medir` não mede — uma porta prometida e não
   * entregue, que é o defeito da regra 21.
   */
  const comImagens = GRUPOS_C4.map((grupo) => [...grupo]).find((grupo) => grupo.includes('imagens'));
  expect(comImagens).toBeDefined();
  expect(comImagens!).toContain('pivos');
  expect(comImagens!.indexOf('pivos')).toBe(comImagens!.indexOf('entidades') + 1);
  // E ele está no menu Janela, no bloco de montar: painel fechado por engano
  // nunca some de verdade.
  expect(PAINEIS_C4.map((p) => p.id)).toContain('pivos');
  expect(PAINEIS_C4.find((p) => p.id === 'pivos')!.label).toBe('Pivôs');
  expect([...BLOCOS_C4[0]!]).toContain('pivos');
});

it('SEM JANELA QUE TRANCA: nada de modal, e nada para confirmar', () => {
  const fonte = lerC4(resolverC4(SRC_C4, 'panels/pivot-panel.ts'), 'utf8');
  // A janela do lote 58 usa `dialog-veil` e `aria-modal`. Aqui não há nenhum.
  expect(fonte).not.toContain('dialog-veil');
  expect(fonte).not.toContain('aria-modal');
  expect(fonte).not.toContain('askPivot');
  // E não há botão de gravar: o que grava é o clique.
  expect(fonte).not.toContain('Gravar o pivô');
  expect(fonte).toContain('o clique já é o passo de desfazer');
  // A janela do lote 58 CONTINUA existindo: ela não foi arrancada de quem
  // chega pelo botão direito numa imagem.
  expect(existeC4(resolverC4(SRC_C4, 'panels/pivot-dialog.ts'))).toBe(true);
});

it('a pasta inteira em grade, com a cruz em CADA miniatura', () => {
  const fonte = lerC4(resolverC4(SRC_C4, 'panels/pivot-panel.ts'), 'utf8');
  expect(fonte).toContain('pivos-grade');
  expect(fonte).toContain('pivos-cruz-mini');
  // A grade é a parte que cresce, e por isso é a única que rola: a prova
  // `medir-paineis.mjs` lê esta marca.
  expect(fonte).toContain('grade.dataset.rolagem');
  const folha = lerC4(resolverC4(SRC_C4, 'panels/pivot-panel.css'), 'utf8');
  expect(folha).toMatch(/\.pivos-grade\s*\{/);
  expect(folha).toMatch(/\.pivos-cruz\s*\{/);
  expect(folha).toContain('overflow-x: hidden;');
  // A folha entra no programa: sem isto o painel nasce sem estilo nenhum.
  expect(lerC4(resolverC4(SRC_C4, 'main.ts'), 'utf8')).toContain('panels/pivot-panel.css');
});

it('a miniatura da grade é menor que a da aba Imagens: cabem mais peças', () => {
  expect(PIVOT_THUMB).toBe(44);
  expect(PIVOT_GRID_HINT).toContain('Ctrl+Z desfaz');
  expect(NO_PIVOT_IMAGES).toContain('Abrir pasta');
});

it('tamanho diferente avisa, e o aviso fica À VISTA no painel (I8)', () => {
  expect(avisoDeTamanhoC4('maos', [
    { name: 'maos/a', width: 40, height: 40 },
    { name: 'maos/b', width: 40, height: 40 },
  ])).toBe(null);
  const aviso = avisoDeTamanhoC4('maos', [
    { name: 'maos/a', width: 40, height: 40 },
    { name: 'maos/b', width: 64, height: 40 },
  ])!;
  expect(aviso).toContain('MESMA tela');
  const fonte = lerC4(resolverC4(SRC_C4, 'panels/pivot-panel.ts'), 'utf8');
  expect(fonte).toContain('folderSizeWarning');
  expect(fonte).toContain('pivos-aviso');
});
});

describe('o pivô é o do corpo do instante (degrau 8, tarefa 8.7)', () => {
/**
 * Suposição 12 do degrau 4b: *"pivô e atlas continuam do arquivo em foco"* —
 * e ela mesma diz quem fecha isso: o degrau 8.
 *
 * Num projeto de vários corpos, o Carimbar tira o pivô **do personagem
 * montado**. Se ele lesse o arquivo em foco com o lobisomem na tela, gravaria
 * os números do homem no atlas do lobisomem: a arte do lobisomem cairia torta,
 * e ninguém saberia por quê.
 */
const C290_C4 = resolverC4(__dirname, '../../conformidade/casos/C-290-virada-corte-seco');

it('o painel Imagens carimba e conta o pivô do corpo do instante, não do foco', () => {
  const fonte = lerC4(resolverC4(__dirname, '../src/panels/palette.ts'), 'utf8');
  // O carimbo inteiro passa pelo corpo do instante: a leitura, a prévia, o
  // comando e os atlas.
  expect(fonte).toContain('stampPivots(corpo.file, atlasTreesOf(corpo))');
  expect(fonte).toContain('corpo.run(new StampPivotsCommand())');
  expect(fonte).toContain('if (corpo.atlases.length === 0)');
  // E a conta de quantos desenhos serão recolocados, idem.
  expect(fonte).toContain('pivotUsers(corpoDe(doc).file, atlasTreesOf(corpoDe(doc)), image)');
  // Nenhum dos caminhos do pivô lê mais o arquivo em foco cru.
  expect(fonte).not.toContain('stampPivots(doc.file');
  expect(fonte).not.toContain('pivotUsers(doc.file');
});

it('com o lobisomem na tela, o corpo do instante é o lobisomem — e é dele o atlas', () => {
  const doc = new Doc(vazioC4());
  const projeto = new ProjetoC4(doc);
  const ler = (nome: string): BoneFile =>
    JSON.parse(lerC4(resolverC4(C290_C4, nome), 'utf8')) as BoneFile;
  const manifesto = gravarListasC4(manifestoC4('entrada.bone'), {
    corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
  });
  projeto.open(manifesto, lerListasC4(manifesto), new Map([
    ['entrada.bone', { file: ler('entrada.bone'), options: {} }],
    ['lobisomem.bone', { file: ler('lobisomem.bone'), options: {} }],
  ]));
  doc.animation = 'transformar';
  // Antes da virada, o corpo do instante é o próprio arquivo…
  doc.time = 0.25;
  expect(corpoC4(doc).file.skeleton?.name).toBe(doc.file.skeleton?.name);
  // …e depois dela é o outro corpo, que é de quem o pivô tem de sair.
  doc.time = 0.75;
  expect(corpoC4(doc)).not.toBe(doc);
  expect(corpoC4(doc).file.skeleton?.name).toBe(ler('lobisomem.bone').skeleton?.name);
});
});

// ---------------------------------------------------------------------------
// Rodada final, chat H, lote 3 (29/09/2026): a fila de trazer a arte e marcar
// o pivô, consertada onde quebrava. Cada teste diz o defeito que ele pega.
// ---------------------------------------------------------------------------

import { SwapSlotImage as TrocarH, attachmentNameFor as nomeH } from '../src/panels/palette-model.js';
import { SwapImageAsKey as TrocarComChaveH } from '../src/panels/image-picker-model.js';
import { naPele as naPeleH, swapSkinFor as peleDaTrocaH } from '../src/panels/image-picker.js';
import {
  NUDGE_BIG as PASSO_GRANDE_H, NUDGE_HINT as DICA_SETAS_H, NUDGE_STEP as PASSO_H,
  nudgePivot as setaH, snapPivot as pixelH,
} from '../src/panels/pivot-dialog.js';
import {
  DOUBLE_CLICK_HINT as DICA_DUPLO_H, SWAP_FOLDER_ASK as TROCAR_PERGUNTA_H, swapFolderOf as trocarOrigemH, copyNotice as copiarH, crossInThumb as cruzH,
} from '../src/panels/palette.js';
import { IMAGE_ACTION_IDS as ACOES_H, registerImageActions as registrarH } from '../src/panels/palette-actions.js';
import { actionState as estadoH } from '../src/ui/actions.js';

describe('rodada final, chat H — trocar a imagem', () => {
  /** Um boneco de uma mão, a pele `roupa` vazia, e a animação `andar`. */
  function bonecoH(): Doc {
    let tree = withProvisional(null, { name: 'maos/aberta', path: 'maos/aberta.png', width: 24, height: 24 }, [12, 24]);
    tree = withProvisional(tree, { name: 'maos/fechada', path: 'maos/fechada.png', width: 24, height: 24 }, [12, 24]);
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'mao', bone: 'root', attachment: 'mao' }],
      skins: [
        { name: 'default', attachments: { mao: { mao: { type: 'region', path: 'maos/aberta', x: 0, y: -12 } } } },
        { name: 'roupa' },
      ],
      animations: [{ name: 'andar' }],
    } as unknown as BoneFile;
    return new Doc(file, { atlases: [loadAtlas(JSON.parse(JSON.stringify(tree)))] });
  }
  const chaves = (doc: Doc): Array<{ time?: number; value?: unknown }> => {
    const linha = (doc.file.animations![0] as unknown as { timelines?: Array<{ keys: Array<{ time?: number; value?: unknown }> }> })
      .timelines?.[0];
    return linha?.keys ?? [];
  };
  const mapaDe = (doc: Doc, pele: string): Record<string, Record<string, unknown>> | undefined =>
    (doc.file.skins!.find((s) => s.name === pele) as unknown as {
      attachments?: Record<string, Record<string, Record<string, unknown>>>;
    }).attachments?.['mao'];

  it('K15: trocar em 0,5 s grava a imagem de ANTES em 0 s — a troca não vale para trás', () => {
    const doc = bonecoH();
    const antes = JSON.stringify(doc.file);
    const troca = new TrocarComChaveH('mao', 'mao', 'default', 'maos/fechada', 'andar', 0.5);
    doc.run(troca);
    // Antes do conserto havia UMA chave, em 0,5; o runtime a segurava desde 0.
    expect(chaves(doc).map((k) => [k.time ?? 0, k.value])).toEqual([[0, 'mao'], [0.5, troca.name]]);
    // Um passo de desfazer leva as duas chaves, e o arquivo volta letra por letra.
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('K15: a segunda troca na mesma animação não mexe na chave do começo', () => {
    const doc = bonecoH();
    doc.run(new TrocarComChaveH('mao', 'mao', 'default', 'maos/fechada', 'andar', 0.5));
    doc.run(new TrocarComChaveH('mao', 'mao', 'default', 'maos/aberta', 'andar', 1));
    expect(chaves(doc).map((k) => [k.time ?? 0, k.value])).toEqual([[0, 'mao'], [0.5, 'fechada'], [1, 'mao']]);
  });

  it('M2 / I-O2: com o lápis na pele `roupa`, a troca grava NA ROUPA, e a default fica intacta', () => {
    const doc = bonecoH();
    const antes = JSON.stringify(doc.file);
    const defaultAntes = JSON.stringify(mapaDe(doc, 'default'));
    const troca = new TrocarH('mao', 'maos/fechada', 'default', 'mao', 'roupa');
    expect(troca.skin).toBe('roupa');
    doc.run(troca);
    // Antes do conserto a troca caía na default, e a roupa ficava com 0 desenhos.
    expect(JSON.stringify(mapaDe(doc, 'default'))).toBe(defaultAntes);
    expect(mapaDe(doc, 'roupa')?.['mao']?.['path']).toBe('maos/fechada');
    // Mesmo pivô, mesmo tamanho: a cópia fica no mesmo lugar.
    expect(mapaDe(doc, 'roupa')?.['mao']?.['y']).toBeCloseTo(-12, 6);
    // A cópia e a troca são UM passo; o desfazer não deixa desenho órfão.
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(doc.file.skins!.find((s) => s.name === 'roupa')).not.toHaveProperty('attachments');
  });

  it('M2: a roupa que JÁ tem o desenho troca o dela, e o desfazer devolve o mapa no mesmo lugar', () => {
    const doc = bonecoH();
    doc.run(new TrocarH('mao', 'maos/fechada', 'default', 'mao', 'roupa'));
    const meio = JSON.stringify(doc.file);
    doc.run(new TrocarH('mao', 'maos/aberta', 'default', 'mao', 'roupa'));
    expect(mapaDe(doc, 'roupa')?.['mao']?.['path']).toBe('maos/aberta');
    expect(mapaDe(doc, 'default')?.['mao']?.['path']).toBe('maos/aberta');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(meio);
  });

  it('M2 com animação aberta: o desenho novo nasce na roupa, a chave na animação, e a default não muda', () => {
    const doc = bonecoH();
    const antes = JSON.stringify(doc.file);
    const defaultAntes = JSON.stringify(mapaDe(doc, 'default'));
    const troca = new TrocarComChaveH('mao', 'mao', 'default', 'maos/fechada', 'andar', 0.5, 'roupa');
    doc.run(troca);
    expect(JSON.stringify(mapaDe(doc, 'default'))).toBe(defaultAntes);
    expect(mapaDe(doc, 'roupa')?.[troca.name]?.['path']).toBe('maos/fechada');
    // O nome novo não bate com nenhum da default: a pele não cobre um desenho que não é seu.
    expect(troca.name).toBe(nomeH('maos/fechada'));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a pele da troca é a do lápis; sem lápis, ou lápis numa pele que o corpo não tem, a de origem', () => {
    const doc = bonecoH() as Doc & { pilha?: string[]; emEdicao?: string | null };
    const alvo = { slot: 'mao', attachment: 'mao', skin: 'default' };
    doc.pilha = ['default', 'roupa'];
    doc.emEdicao = 'roupa';
    expect(peleDaTrocaH(doc, alvo)).toBe('roupa');
    doc.emEdicao = null;
    expect(peleDaTrocaH(doc, alvo)).toBe('default');
    doc.emEdicao = 'nao-existe';
    expect(peleDaTrocaH(doc, alvo)).toBe('default');
  });

  it('o rodapé diz em que pele a troca gravou (P27)', () => {
    expect(naPeleH('roupa')).toBe(', na skin "roupa"');
    expect(naPeleH('default')).toContain('default');
    const fonte = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(fonte).toContain('naPele(pele)');
    expect(fonte).toContain('new SwapSlotImage(target.slot, image, target.skin, target.attachment, pele)');
  });

  it('K12: a troca na animação mostra a chave nova na linha do tempo, logo depois de gravar', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    const grava = fonte.indexOf('new SwapImageAsKey(');
    const mostra = fonte.indexOf("revealKey({ target: slotTarget(target.slot, 'attachment'), time: roundTime(doc.time) })");
    expect(grava).toBeGreaterThan(0);
    expect(mostra).toBeGreaterThan(grava);
  });
});

describe('rodada final, chat H — o pivô à mão', () => {
  it('Q2: as setas andam a cruz 1 px, e 10 com Shift; o y conta de baixo, e a cruz não se prende na borda', () => {
    expect(PASSO_H).toBe(1);
    expect(PASSO_GRANDE_H).toBe(10);
    expect(setaH({ x: 12, y: 12 }, 'ArrowRight', false)).toEqual({ x: 13, y: 12 });
    expect(setaH({ x: 12, y: 12 }, 'ArrowLeft', true)).toEqual({ x: 2, y: 12 });
    expect(setaH({ x: 12, y: 12 }, 'ArrowUp', false)).toEqual({ x: 12, y: 13 });
    expect(setaH({ x: 0, y: 0 }, 'ArrowDown', true)).toEqual({ x: 0, y: -10 });
    expect(setaH({ x: 12, y: 12 }, 'Enter', false)).toBeNull();
    expect(DICA_SETAS_H).toContain('Shift');
  });

  it('Q2: a janela e o painel Pivôs escutam as setas, e param a tecla ali', () => {
    const janela = readFileSync(resolve(__dirname, '../src/panels/pivot-dialog.ts'), 'utf8');
    expect(janela).toContain('nudgePivot(current, event.key, event.shiftKey)');
    const painel = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
    expect(painel).toContain('nudgePivot(pivot, event.key, event.shiftKey)');
    expect(painel).toContain('quadro.tabIndex = 0');
    expect(painel).toContain('event.stopPropagation()');
  });

  it('o clique cai no pixel inteiro: o rodapé dizia "30, 1,8381"', () => {
    expect(pixelH({ x: 29.6, y: 1.8381 })).toEqual({ x: 30, y: 2 });
  });

  it('Q1 / J7: duplo clique na miniatura abre o pivô, como no Spriter, e a dica ensina', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/palette.ts'), 'utf8');
    expect(fonte).toContain("node.addEventListener('dblclick'");
    expect(fonte).toContain('void this.definePivot(doc, entry.name)');
    expect(DICA_DUPLO_H).toContain('Duplo clique');
    expect(PIVOT_HINT).toContain('Duplo clique');
  });

  it('Q3: Copiar pivô sempre diz o que copiou — o centro, quando a imagem não tem pivô', () => {
    expect(copiarH('maos/aberta', true)).toMatch(/^Pivô de "maos\/aberta" copiado/);
    expect(copiarH('maos/aberta', false)).toContain('ainda não tem pivô: copiado o centro');
    const fonte = readFileSync(resolve(__dirname, '../src/panels/palette.ts'), 'utf8');
    // Antes: `if (region === null) return;` — a imagem só da pasta calava.
    expect(fonte).not.toMatch(/copyPivot[^]*?if \(region === null\) return;[^]*?pastePivotOn/);
    expect(fonte).toContain("doc.run(new SetFolderPivotCommand([{ name: image, x: pivot.x, y: pivot.y }], 'Colar pivô'))");
  });

  it('Q4: a cruz na miniatura cai onde a do painel Pivôs cai', () => {
    // Quadrada, no meio de cima: o meio da borda de cima da miniatura.
    expect(cruzH({ x: 12, y: 24 }, { width: 24, height: 24 }, 48)).toEqual({ x: 24, y: 0 });
    // Alta (20×60) numa miniatura de 48: 16 px de largura, centrada.
    expect(cruzH({ x: 10, y: 0 }, { width: 20, height: 60 }, 48)).toEqual({ x: 24, y: 48 });
    const fonte = readFileSync(resolve(__dirname, '../src/panels/palette.ts'), 'utf8');
    expect(fonte).toContain('imagens-cruz');
  });

  it('Q6 / J7: os botões da linha da busca não encolhem até virar pontinho', () => {
    const folha = readFileSync(resolve(__dirname, '../src/panels/palette.css'), 'utf8');
    expect(folha).toMatch(/\.imagens-busca > \.painel-botao,\s*\.imagens-pasta > \.painel-botao\s*\{\s*flex: 0 0 auto;/);
  });

  it('Q7: no painel Pivôs, a prévia e os nove pontos lado a lado, e nada cai por cima do vizinho', () => {
    const painel = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
    expect(painel).toContain("el('div', 'pivos-corpo')");
    const folha = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.css'), 'utf8');
    expect(folha).toMatch(/\.pivos-corpo\s*\{/);
    expect(folha).toMatch(/\.pivos-previa\s*\{[^}]*overflow: hidden;/);
  });
});

describe('rodada final, chat H — o pivô com a aba fechada (P33)', () => {
  it('as quatro ações nascem com o documento, sem a aba Imagens montada', () => {
    expect([...ACOES_H]).toEqual(['definir-pivo', 'carimbar-pivos', 'recarregar-pasta', 'trocar-pasta-origem']);
    const doc = new Doc({ bone: { version: '1.0', minVersion: '1.0', generator: 'teste' }, bones: [{ name: 'root' }] } as unknown as BoneFile);
    const tirar = registrarH(doc);
    for (const id of ACOES_H) expect(estadoH(id).exists).toBe(true);
    for (const t of tirar) t();
    for (const id of ACOES_H) expect(estadoH(id).exists).toBe(false);
  });

  it('Trocar origem diz para quê ANTES de abrir o seletor, e diz quando nada mudou', () => {
    expect(TROCAR_PERGUNTA_H).toBe('Escolha a pasta nova. As imagens trocam pelo nome do arquivo.');
    const fonte = readFileSync(resolve(__dirname, '../src/panels/palette.ts'), 'utf8');
    const aviso = fonte.indexOf('doc.notice(SWAP_FOLDER_ASK)');
    const seletor = fonte.indexOf('await pickProjectFolder()');
    expect(aviso).toBeGreaterThan(0);
    expect(aviso).toBeLessThan(seletor);
    expect(fonte).toContain("doc.notice('Nada mudou.')");
  });

  it('sem navegador, Trocar origem DIZ que o seletor não abriu — e não solta erro depois do teste', async () => {
    const doc = new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    const ditos: string[] = [];
    doc.notice = (texto: string) => { ditos.push(texto); };
    // Antes: a promessa rejeitava com "document is not defined" e ninguém a pegava.
    await expect(trocarOrigemH(doc)).resolves.toBeUndefined();
    expect(ditos[0]).toBe(TROCAR_PERGUNTA_H);
    expect(ditos[ditos.length - 1]).toMatch(/O seletor de pasta não abriu: .*Nada mudou\./);
  });
});

// ---------------------------------------------------------------------------
// Rodada final, chat H, fecho 3 (29/09/2026): os dois consertos do chat E à vista
// ---------------------------------------------------------------------------

import { SwapFolderImages as TrocarPastaH3 } from '../src/panels/palette-model.js';

describe('rodada final, chat H, fecho 3 — a troca não pula (H1, P15a)', () => {
  /** Uma mão SOLTA em (150, 100), longe da origem; as duas imagens com o mesmo pivô. */
  function soltaH3(): Doc {
    let tree = withProvisional(null, { name: 'maos/aberta', path: 'maos/aberta.png', width: 24, height: 24 }, [12, 24]);
    tree = withProvisional(tree, { name: 'maos/fechada', path: 'maos/fechada.png', width: 24, height: 24 }, [12, 24]);
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'mao', bone: 'root', attachment: 'mao' }],
      skins: [{ name: 'default', attachments: { mao: { mao: { type: 'region', path: 'maos/aberta', x: 150, y: 100 } } } }],
      animations: [{ name: 'andar' }],
    } as unknown as BoneFile;
    return new Doc(file, { atlases: [loadAtlas(JSON.parse(JSON.stringify(tree)))] });
  }
  const anexoH3 = (doc: Doc, nome = 'mao'): Record<string, unknown> =>
    (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['mao']![nome]!;

  it('Usar no desenho escolhido: mesmo pivô, a mão solta fica em (150, 100) — antes ia para (0, −12)', () => {
    const doc = soltaH3();
    const antes = JSON.stringify(doc.file);
    doc.run(new TrocarH('mao', 'maos/fechada', 'default', 'mao'));
    expect(anexoH3(doc)['path']).toBe('maos/fechada');
    expect(anexoH3(doc)['x']).toBeCloseTo(150, 6);
    expect(anexoH3(doc)['y']).toBeCloseTo(100, 6);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a troca na animação: o desenho novo nasce no lugar do velho', () => {
    const doc = soltaH3();
    const troca = new TrocarComChaveH('mao', 'mao', 'default', 'maos/fechada', 'andar', 0.5);
    doc.run(troca);
    expect(anexoH3(doc, troca.name)['x']).toBeCloseTo(150, 6);
    expect(anexoH3(doc, troca.name)['y']).toBeCloseTo(100, 6);
  });

  it('Trocar pasta de origem: o acervo novo entra no lugar do velho', () => {
    const doc = soltaH3();
    doc.run(new TrocarPastaH3([{ from: 'maos/aberta', to: 'maos/fechada' }]));
    expect(anexoH3(doc)['x']).toBeCloseTo(150, 6);
    expect(anexoH3(doc)['y']).toBeCloseTo(100, 6);
  });
});

describe('rodada final, chat H, fecho 3 — o rodapé do pivô diz de onde para onde', () => {
  it('as três portas do Definir pivô passam os movimentos ao rodapé', () => {
    const aba = readFileSync(resolve(__dirname, '../src/panels/palette.ts'), 'utf8');
    const painel = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
    // Rodada 13: as portas passam o comando inteiro — `moves`, e também o que
    // ficou parado e as animações com giro (`PivotNoticeExtra`).
    const com = /pivotNotice\([^)]*command\.moved, command\)/g;
    const sem = /pivotNotice\([^)]*command\.moved\)/g;
    expect([...aba.matchAll(com)].length).toBe(2);
    expect([...painel.matchAll(com)].length).toBe(1);
    // Antes: "1 desenho recolocado", sem dizer para onde.
    expect([...aba.matchAll(sem)].length + [...painel.matchAll(sem)].length).toBe(0);
    expect(pivotNotice('corpo/cabeca', { x: 30, y: 0 }, 2, {
      moves: [{ from: { x: 150, y: 100 }, to: { x: 0, y: 20 } }],
    })).toBe('Pivô de "corpo/cabeca": 30, 0. 2 desenhos recolocados, de (150; 100) para (0; 20) e mais 1');
  });
});

// ---------------------------------------------------------------------------
// Rodada 13 — mudar o pivô e o desenho ficar parado
// ---------------------------------------------------------------------------

import { pivotStillTail as caudaR13 } from '../src/io/pivot-model.js';
import { linearTimes as linearR13 } from '../src/io/pivot-still.js';

describe('rodada 13 — acertei o pivô de uma imagem presa a um osso: o desenho fica parado', () => {
/**
 * A decisão do Humberto (`02 AS DECISOES`, o quadro, linha "Pivô"). Até a
 * rodada 13 o Definir pivô punha o pivô novo na origem do osso, e o desenho
 * andava até lá. Agora a imagem com osso próprio (8d) fica parada: o osso
 * próprio vai para o pivô novo, o anexo volta a mesma distância, e cada chave
 * de posição do osso ganha o deslocamento daquele instante.
 *
 * A CONTA À MÃO, feita antes do código (ficha da rodada, "Caso 2: a conta"):
 *
 *   osso próprio `mao_osso`: x 10, y −5, giro 30°, escala (2, 1), filho de
 *   `braco` (giro 90°, em 100, 50). A espada (100 × 50) está em x 10, y 5 no
 *   osso próprio, sem giro. Pivô novo: (20, 40) da imagem, de baixo.
 *
 *   q, o pivô novo no osso próprio = centro + (pivô − meio)
 *     = (10, 5) + (20 − 50, 40 − 25) = (−20, 20)
 *   o anexo vai para (10, 5) − q = (30, −15)
 *   L(30°, 2, 1) = | cos30·2  cos120·1 | = | 1,7320508  −0,5       |
 *                  | sin30·2  sin120·1 |   | 1          0,8660254  |
 *   L·q = (1,7320508·−20 − 0,5·20, 1·−20 + 0,8660254·20) = (−44,641016, −2,679492)
 *   o osso próprio vai para (10 − 44,641016, −5 − 2,679492) = (−34,641016, −7,679492)
 *   o ponto `ponto` do mesmo slot, em (3, 4), vai para (3 + 20, 4 − 20) = (23, −16)
 */
const ATLAS_R13: AtlasJson = {
  atlas: { version: '1.0', generator: 'teste' },
  pages: [{ name: 'p', image: 'p.png', width: 128, height: 128 }],
  regions: [{ name: 'espada', page: 0, x: 0, y: 0, width: 100, height: 50 }],
};

function bonecoR13(extraBone: Record<string, unknown> = {}): Doc {
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    extensionsUsed: ['RECORTE_editor_state'],
    bones: [
      { name: 'root' },
      { name: 'braco', parent: 'root', x: 100, y: 50, rotation: 90 },
      {
        name: 'mao_osso', parent: 'braco', x: 10, y: -5, rotation: 30, scaleX: 2, visible: false,
        extensions: { RECORTE_editor_state: { ossoProprio: true } }, ...extraBone,
      },
    ],
    slots: [{ name: 'mao', bone: 'mao_osso', attachment: 'espada' }],
    skins: [{
      name: 'default',
      attachments: {
        mao: {
          espada: { type: 'region', path: 'espada', x: 10, y: 5 },
          ponto: { type: 'point', x: 3, y: 4 },
        },
      },
    }],
    animations: [
      {
        // Giro com chave: o L muda de instante para instante.
        name: 'gira',
        timelines: [
          { type: 'bone', target: 'mao_osso', property: 'rotation', keys: [
            { time: 0, value: 30 }, { time: 0.5, value: 90 }, { time: 1, value: 30 },
          ] },
          { type: 'bone', target: 'mao_osso', property: 'scaleX', keys: [{ time: 0.25, value: 1.5 }] },
          { type: 'bone', target: 'mao_osso', property: 'x', keys: [
            { time: 0, value: 10, curve: [0.3, 30, 0.6, -10] }, { time: 1, value: 20 },
          ] },
        ],
      },
      {
        // Só posição, com uma Bézier que faz barriga: o L é o da base.
        name: 'anda',
        timelines: [
          { type: 'bone', target: 'mao_osso', property: 'x', keys: [
            { time: 0, value: 10, curve: [0.3, 10, 0.7, 60] }, { time: 1, value: 40 },
          ] },
          { type: 'bone', target: 'mao_osso', property: 'y', keys: [{ time: 0, value: -5 }, { time: 1, value: 15 }] },
        ],
      },
    ],
  } as unknown as BoneFile;
  return new Doc(file, { atlases: [loadAtlas(JSON.parse(JSON.stringify(ATLAS_R13)))] });
}

/** Os quatro cantos da espada no mundo, na animação e no instante dados (`null` = a base). */
function cantosR13(doc: Doc, animation: string | null, time: number): number[] {
  doc.animation = animation;
  doc.time = time;
  doc.repose();
  const slot = doc.skeleton!.findSlot('mao')!;
  return Array.from((slot.attachment as unknown as {
    computeWorldVertices(s: unknown): ArrayLike<number>;
  }).computeWorldVertices(slot));
}

function maiorDiferencaR13(a: number[], b: number[]): number {
  expect(b).toHaveLength(a.length);
  let max = 0;
  for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i]! - b[i]!));
  return max;
}

type DefR13 = Record<string, number>;
const anexoR13 = (doc: Doc, name: string): DefR13 =>
  (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, DefR13>>)['mao']![name]!;
const ossoR13 = (doc: Doc): DefR13 => doc.file.bones.find((b) => b.name === 'mao_osso') as unknown as DefR13;

const INSTANTES_DE_CHAVE: ReadonlyArray<readonly [string, number]> = [
  ['gira', 0], ['gira', 0.25], ['gira', 0.5], ['gira', 1],
  ['anda', 0], ['anda', 0.2], ['anda', 0.5], ['anda', 0.77], ['anda', 1],
];

it('a conta à mão: L·q com giro 30° e escala (2, 1)', () => {
  const d = linearR13(30, 2, 1, 0, 0, { x: -20, y: 20 });
  expect(d.x).toBeCloseTo(-44.641016, 5);
  expect(d.y).toBeCloseTo(-2.679492, 5);
});

it('o pivô novo deixa a espada parada: na base, e na mesma conta do papel', () => {
  const doc = bonecoR13();
  const antes = cantosR13(doc, null, 0);
  const command = new SetPivotCommand('espada', { x: 20, y: 40 });
  doc.run(command);
  expect(maiorDiferencaR13(antes, cantosR13(doc, null, 0))).toBeLessThan(1e-4);
  // Os números do papel.
  expect(anexoR13(doc, 'espada')['x']).toBeCloseTo(30, 6);
  expect(anexoR13(doc, 'espada')['y']).toBeCloseTo(-15, 6);
  expect(ossoR13(doc)['x']).toBeCloseTo(-34.641016, 5);
  expect(ossoR13(doc)['y']).toBeCloseTo(-7.679492, 5);
  // O outro anexo do slot também fica onde estava.
  expect(anexoR13(doc, 'ponto')['x']).toBeCloseTo(23, 6);
  expect(anexoR13(doc, 'ponto')['y']).toBeCloseTo(-16, 6);
  // O pivô foi para a região, e o rig continua sendo a verdade: carimbar dá o mesmo.
  const region = doc.atlases[0]!.findRegion('espada')!;
  expect([region.pivotX, region.pivotY]).toEqual([20, 40]);
  const carimbo = stampPivots(doc.file, atlasTreesOf(doc)).atlases[0]!.regions[0]!;
  expect(carimbo.pivotX).toBeCloseTo(20, 3);
  expect(carimbo.pivotY).toBeCloseTo(40, 3);
  expect(command.moved).toBe(0);
  expect(command.still).toBe(1);
});

it('parada em CADA chave das animações, e em todo instante onde não há giro com chave', () => {
  const doc = bonecoR13();
  const antes = INSTANTES_DE_CHAVE.map(([a, t]) => cantosR13(doc, a, t));
  doc.animation = null;
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  INSTANTES_DE_CHAVE.forEach(([a, t], i) => {
    expect(maiorDiferencaR13(antes[i]!, cantosR13(doc, a, t)), `${a} em ${t}`).toBeLessThan(1e-4);
  });
});

it('entre as chaves com giro ela passa a girar em volta do pivô novo — e o número é medido', () => {
  const doc = bonecoR13();
  const meio = cantosR13(doc, 'gira', 0.375);
  doc.animation = null;
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  const depois = maiorDiferencaR13(meio, cantosR13(doc, 'gira', 0.375));
  // Medido em 05/10/2026, de 0,01 em 0,01 s, por fora (vite-node): o pior
  // instante é t = 0,66, com 4,44 px do caminho de antes, num giro de 60° com
  // escala de 1,5 a 2 e o pivô a 28 px do centro. Nas chaves: 4e-7. Não é
  // zero entre elas, e não pode ser: girar em volta de outro ponto é o que o
  // pivô quer dizer.
  expect(depois).toBeGreaterThan(0.01);
  expect(depois).toBeLessThan(6);
});

it('Ctrl+Z devolve o arquivo letra por letra, e o pivô de antes', () => {
  const doc = bonecoR13();
  const texto = JSON.stringify(doc.file);
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  expect(JSON.stringify(doc.file)).not.toBe(texto);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(texto);
  expect(doc.atlases[0]!.findRegion('espada')!.pivotX).toBeUndefined();
});

it('Repetir o pivô para a pasta faz a mesma conta', () => {
  const um = bonecoR13();
  um.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  const dois = bonecoR13();
  const command = new SetFolderPivotCommand([{ name: 'espada', x: 20, y: 40 }]);
  dois.run(command);
  expect(JSON.stringify(dois.file)).toBe(JSON.stringify(um.file));
  expect(command.still).toBe(1);
  const texto = JSON.stringify(bonecoR13().file);
  dois.undo();
  expect(JSON.stringify(dois.file)).toBe(texto);
});

it('o rodapé diz que ficou parado, e avisa do giro entre as chaves', () => {
  const doc = bonecoR13();
  const command = new SetPivotCommand('espada', { x: 20, y: 40 });
  doc.run(command);
  expect(command.turning).toEqual(['gira']);
  expect(pivotNotice('espada', { x: 20, y: 40 }, command.moved, command)).toBe(
    'Pivô de "espada": 20, 40. 1 desenho ficou parado. Entre as chaves de "gira", '
    + 'a imagem passa a girar em volta do pivô novo',
  );
  expect(caudaR13({})).toBe('');
});

it('a imagem com osso próprio não entra na lista dos pivôs à mão: o rig continua dizendo o pivô', () => {
  const doc = bonecoR13();
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  expect(readHandR13b(doc.file)).toEqual({});
  expect(JSON.stringify(doc.file)).not.toContain(HAND_PIVOTS);
});

// Reescrito no caso (b), mesma rodada: antes do "sim" do Diretor, este osso
// recolocava o desenho e dizia "Não ficou parado". Agora ele cai no caso (b).
it('osso próprio que a conta não sabe mover (não herda o giro): o osso fica, o desenho fica, e o pivô vai para a lista', () => {
  const doc = bonecoR13({ inheritRotation: false });
  const texto = JSON.stringify(doc.file.bones);
  const antes = cantosR13(doc, null, 0);
  const command = new SetPivotCommand('espada', { x: 20, y: 40 });
  doc.run(command);
  expect(JSON.stringify(doc.file.bones)).toBe(texto);
  expect(maiorDiferencaR13(antes, cantosR13(doc, null, 0))).toBeLessThan(1e-9);
  expect(command.still).toBe(1);
  expect(command.hand).toBe(true);
  expect(readHandR13b(doc.file)).toEqual({ espada: [20, 40] });
  expect(pivotNotice('espada', { x: 20, y: 40 }, command.moved, command)).toContain('guardado à mão');
});
});

// ---------------------------------------------------------------------------
// Rodada 13, caso (b) — a imagem SEM osso próprio, e a lista dos pivôs à mão
// ---------------------------------------------------------------------------

import { HAND_PIVOTS, readHandPivots as readHandR13b } from '../src/io/pivot-model.js';
import { ResetPivotToBone } from '../src/io/pivot-atlas.js';
import { HAND_PIVOT_MARK } from '../src/panels/pivot-panel.js';
import { NO_HAND_PIVOT } from '../src/panels/palette.js';

describe('rodada 13, caso (b) — sem osso próprio: o desenho fica, e o pivô fica "à mão"', () => {
/**
 * O Diretor, 05/10/2026: a imagem que não tem osso próprio fica parada; o
 * pivô novo é guardado onde o pivô mora (a região do atlas) e numa lista do
 * estado do editor, `pivosAMao`, porque o rig deixou de dizê-lo. Salvar,
 * Exportar skin e Carimbar respeitam a lista. "Voltar o pivô para o osso" a
 * desfaz. Nenhum campo no núcleo.
 */
const ATLAS_B: AtlasJson = {
  atlas: { version: '1.0', generator: 'teste' },
  pages: [{ name: 'p', image: 'p.png', width: 128, height: 128 }],
  regions: [{ name: 'espada', page: 0, x: 0, y: 0, width: 100, height: 50 }],
};

/** A espada presa ao braço, girado 90°, SEM osso próprio. */
function bonecoB(atlas: AtlasJson = ATLAS_B, file?: BoneFile): Doc {
  const f = file ?? {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'braco', parent: 'root', x: 100, y: 50, rotation: 90 }],
    slots: [{ name: 'mao', bone: 'braco', attachment: 'espada' }],
    skins: [{ name: 'default', attachments: { mao: { espada: { type: 'region', path: 'espada', x: 10, y: 5 } } } }],
    animations: [{ name: 'gira', timelines: [
      { type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 90 }, { time: 1, value: 180 }] },
    ] }],
  } as unknown as BoneFile;
  return new Doc(f, { atlases: [loadAtlas(JSON.parse(JSON.stringify(atlas)))] });
}

function cantosB(doc: Doc, animation: string | null, time: number): number[] {
  doc.animation = animation;
  doc.time = time;
  doc.repose();
  const slot = doc.skeleton!.findSlot('mao')!;
  return Array.from((slot.attachment as unknown as {
    computeWorldVertices(s: unknown): ArrayLike<number>;
  }).computeWorldVertices(slot));
}

it('o desenho não anda, na base nem na animação; o pivô novo vai para a região e para a lista', () => {
  const doc = bonecoB();
  const antes = [cantosB(doc, null, 0), cantosB(doc, 'gira', 0), cantosB(doc, 'gira', 0.5), cantosB(doc, 'gira', 1)];
  doc.animation = null;
  const command = new SetPivotCommand('espada', { x: 20, y: 40 });
  doc.run(command);
  const depois = [cantosB(doc, null, 0), cantosB(doc, 'gira', 0), cantosB(doc, 'gira', 0.5), cantosB(doc, 'gira', 1)];
  expect(depois).toEqual(antes);
  expect(command.still).toBe(1);
  expect(command.moved).toBe(0);
  expect(doc.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 20, pivotY: 40 });
  expect(readHandR13b(doc.file)).toEqual({ espada: [20, 40] });
  expect(pivotNotice('espada', { x: 20, y: 40 }, command.moved, command)).toBe(
    'Pivô de "espada": 20, 40. 1 desenho ficou parado. O pivô fica guardado à mão: o osso não está nele',
  );
});

it('definir o pivô, SALVAR e REABRIR: o pivô é o novo, e o desenho não andou', () => {
  const doc = bonecoB();
  const antes = cantosB(doc, null, 0);
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  // Salvar: o `.bone` é `JSON.stringify`; o atlas sai pelo mesmo carimbo de sempre.
  const texto = JSON.stringify(doc.file);
  const disco = atlasFilesForDisk(doc).files[0]!;
  const reaberto = bonecoB(JSON.parse(disco.text) as AtlasJson, JSON.parse(texto) as BoneFile);
  expect(reaberto.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 20, pivotY: 40 });
  expect(maiorDiferencaB(antes, cantosB(reaberto, null, 0))).toBe(0);
  // E salvar de novo, reaberto, não volta o pivô para o osso.
  const deNovo = JSON.parse(atlasFilesForDisk(reaberto).files[0]!.text) as AtlasJson;
  expect(deNovo.regions[0]).toMatchObject({ pivotX: 20, pivotY: 40 });
});

it('PROVA DO DEFEITO que a lista conserta: sem ela, o próximo carimbo devolvia o pivô do osso', () => {
  const doc = bonecoB();
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  // Tira só a lista, à mão: é o arquivo que um editor sem o caso (b) gravaria.
  const semLista = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
  const state = (semLista as { extensions?: Record<string, Record<string, unknown>> }).extensions!['RECORTE_editor_state']!;
  delete state[HAND_PIVOTS];
  const carimbo = stampPivots(semLista, atlasTreesOf(doc)).atlases[0]!.regions[0]!;
  // O rig diz onde a origem do braço cai na espada: (40, 20) — e não (20, 40).
  expect([carimbo.pivotX, carimbo.pivotY]).toEqual([40, 20]);
});

it('o Carimbar pula a imagem com pivô à mão, e o rodapé diz quantas e como desfazer', () => {
  const doc = bonecoB();
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  const result = stampPivots(doc.file, atlasTreesOf(doc));
  expect(result.skipped).toEqual(['espada']);
  expect(stampNotice(result)).toBe(
    '1 pivô carimbado (nenhum mudou). 1 imagem tem pivô à mão e ficou com ele: "Voltar o pivô para o osso" desfaz',
  );
});

it('arquivo sem a lista: nada muda — o carimbo é o de antes, e o estado do editor não ganha campo', () => {
  const doc = bonecoB();
  const texto = JSON.stringify(doc.file);
  const result = stampPivots(doc.file, atlasTreesOf(doc));
  expect(result.skipped).toEqual([]);
  expect(result.atlases[0]!.regions[0]).toMatchObject({ pivotX: 40, pivotY: 20 });
  expect(stampNotice(result)).toBe('1 pivô carimbado (1 mudou)');
  expect(JSON.stringify(doc.file)).toBe(texto);
  expect(texto).not.toContain(HAND_PIVOTS);
});

it('Voltar o pivô para o osso: sai da lista, o pivô volta a ser o do rig, nada anda, e o Ctrl+Z devolve', () => {
  const doc = bonecoB();
  const antes = cantosB(doc, null, 0);
  doc.run(new SetPivotCommand('espada', { x: 20, y: 40 }));
  const marcado = JSON.stringify(doc.file);
  const command = new ResetPivotToBone();
  doc.run(command);
  expect(command.done).toEqual(['espada']);
  expect(readHandR13b(doc.file)).toEqual({});
  expect(JSON.stringify(doc.file)).not.toContain(HAND_PIVOTS);
  expect(doc.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 40, pivotY: 20 });
  expect(maiorDiferencaB(antes, cantosB(doc, null, 0))).toBe(0);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(marcado);
  expect(doc.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 20, pivotY: 40 });
});

it('a marca se vê: no painel Pivôs, e o item cinza diz por quê', () => {
  expect(HAND_PIVOT_MARK).toContain('Voltar o pivô para o osso');
  const painel = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
  expect(painel).toContain("el('span', 'pivos-mao-marca')");
  expect(NO_HAND_PIVOT).toContain('pivô à mão');
  const row = ACTION_ROWS_B.find((r) => r.id === 'voltar-pivo-osso');
  expect(row).toMatchObject({ owner: 'imagens', where: 'arranque', label: 'Voltar o pivô para o osso' });
});

it('CONSERTO 1: salvar o .bone, fechar e reabrir com o atlas de ANTES: o pivô lido é o à mão, não o do atlas', () => {
  const doc = bonecoB({ ...ATLAS_B, regions: [{ ...ATLAS_B.regions[0]!, pivotX: 4, pivotY: 13 }] });
  doc.run(new SetPivotCommand('espada', { x: 27, y: 17 }));
  expect(doc.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 27, pivotY: 17 });
  // O atlas no disco ficou o de antes (4, 13) — é o caso da conferência.
  const atlasVelho = { ...ATLAS_B, regions: [{ ...ATLAS_B.regions[0]!, pivotX: 4, pivotY: 13 }] };
  const reaberto = bonecoB(atlasVelho, JSON.parse(JSON.stringify(doc.file)) as BoneFile);
  expect(reaberto.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 27, pivotY: 17 });
  // As outras duas portas de atlas: trocar o arquivo, e trocar os atlas.
  const outro = bonecoB();
  outro.setFile(JSON.parse(JSON.stringify(doc.file)) as BoneFile, { atlases: [loadAtlas(JSON.parse(JSON.stringify(atlasVelho)))] });
  expect(outro.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 27, pivotY: 17 });
  outro.setAssets([loadAtlas(JSON.parse(JSON.stringify(atlasVelho)))], new Map());
  expect(outro.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 27, pivotY: 17 });
  // Sem a lista, o atlas manda, como sempre.
  const semLista = bonecoB(atlasVelho);
  expect(semLista.atlases[0]!.findRegion('espada')).toMatchObject({ pivotX: 4, pivotY: 13 });
});

it('CONSERTO 3: escolher uma imagem na cena ou na Árvore leva o painel Pivôs para ela (era assim desde a v27.3)', () => {
  const doc = bonecoB();
  expect(pivotPanelPick(doc)).toBeNull();
  doc.select({ ...emptySelectionB(), slots: ['mao'], attachments: [{ slot: 'mao', attachment: 'espada' }] });
  expect(pivotPanelPick(doc)).toBe('espada');
  // O slot sozinho também vale, como no Definir pivô….
  doc.select({ ...emptySelectionB(), slots: ['mao'] });
  expect(pivotPanelPick(doc)).toBe('espada');
  // Um osso escolhido não é imagem: o painel fica onde estava.
  doc.select({ ...emptySelectionB(), bones: ['braco'] });
  expect(pivotPanelPick(doc)).toBeNull();
  const painel = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
  expect(painel).toContain("readonly listensTo = ['file', 'structure', 'assets', 'selection'] as const;");
  expect(painel).toContain('const image = pivotPanelPick(this.doc);');
});

it('K8: a imagem que é SEQUÊNCIA leva o painel Pivôs ao primeiro quadro dela; com um osso escolhido ele fica, e diz', () => {
  const f = JSON.parse(JSON.stringify(bonecoB().file)) as BoneFile;
  const def = (f.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['mao']!['espada']!;
  def['sequence'] = { count: 2, start: 1, digits: 0 };
  const atlas = { ...ATLAS_B, regions: [
    { name: 'espada1', page: 0, x: 0, y: 0, width: 100, height: 50 },
    { name: 'espada2', page: 0, x: 0, y: 50, width: 100, height: 50 },
  ] };
  const doc = bonecoB(atlas as AtlasJson, f);
  doc.select({ ...emptySelectionB(), slots: ['mao'], attachments: [{ slot: 'mao', attachment: 'espada' }] });
  expect(pivotPanelPick(doc)).toBe('espada1');
  expect(pivotPanelShowsLast(doc)).toBe(false);
  doc.select({ ...emptySelectionB(), bones: ['braco'] });
  expect(pivotPanelPick(doc)).toBeNull();
  expect(pivotPanelShowsLast(doc)).toBe(true);
  doc.select(emptySelectionB());
  expect(pivotPanelShowsLast(doc)).toBe(false);
});

it('fecho da v27.6: "Este boneco" é o PRIMEIRO item da grade, antes das miniaturas', () => {
  const run = (): void => {};
  const { top, bottom } = splitGridOptions([
    { label: 'Trazer para a frente', hint: '', run },
    { label: 'Este boneco', hint: '', run, first: true },
    { label: 'Apagar', hint: '', run },
  ]);
  expect(top.map((o) => o.label)).toEqual(['Este boneco']);
  expect(bottom.map((o) => o.label)).toEqual(['Trazer para a frente', 'Apagar']);
  const cena = readFileSync(resolve(__dirname, '../src/viewport/viewport.ts'), 'utf8');
  // v27.7: são até DOIS itens no alto (Tirar, e trocar o meio), todos primeiros.
  expect(cena).toContain('...esteBoneco.map((item) => ({');
  expect(cena).toContain('label: item.label, hint: item.hint, first: true,');
  const grade = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
  // As de cima entram na caixa ANTES das células.
  expect(grade.indexOf('box.append(primeiras)')).toBeLessThan(grade.indexOf('box.append(cells)'));
});

it('fecho da v27.6: o nome do meio do "Este boneco" fica EMBAIXO do contorno, longe das alças', () => {
  const v = [0, 0, 100, 0, 100, 50, 0, 50];
  expect(aroundLabelAt(v, 1)).toEqual({ x: 0, y: -16 });
  expect(aroundLabelAt(v, 2)).toEqual({ x: 0, y: -8 });
});

it('rodada 17: com a peça girada, o nome do meio fica abaixo também das ALÇAS da caixa', () => {
  // O meio de 0..100 x 0..50; a caixa do Transformar, girada, desce até y = -30
  // (uma alça de baixo). A régua de antes olhava só o contorno: punha o nome
  // em y = -16, por cima da alça — o "m… · o meio (…o é desenhado)" da foto.
  const v = [0, 0, 100, 0, 100, 50, 0, 50];
  const alcas = [{ x: 10, y: -30 }, { x: 60, y: -5 }, { x: 90, y: 70 }];
  const at = aroundLabelAt(v, 1, alcas);
  expect(at.y).toBeLessThanOrEqual(-30 - 7 - 16);
  expect(at.y).toBe(-30 - 7 - 16);
  expect(at.x).toBe(0);
  // Sem caixa, como antes.
  expect(aroundLabelAt(v, 1, [])).toEqual({ x: 0, y: -16 });
});

it('as palavras: "entidade" na dica do mini-ícone e no aviso; o manifesto sozinho no singular', () => {
  expect(thumbnailKindB({ type: 'skeleton', uri: 'espada.bone' } as never, 'w')).not.toHaveProperty('tipo', 'esqueleto filho');
  const icone = readFileSync(resolve(__dirname, '../src/panels/thumbnails.ts'), 'utf8');
  expect(icone).not.toContain("'esqueleto filho'");
  const kinds = readFileSync(resolve(__dirname, '../src/panels/thumbnail-kind.ts'), 'utf8');
  expect(kinds).toContain("skeleton: { icon: 'bone', tipo: 'entidade' }");
  const abrir = readFileSync(resolve(__dirname, '../src/io/open-save.ts'), 'utf8');
  expect(abrir).toContain('A entidade ${attachment.resolvedUri} não foi aberta');
  expect(abrir).toContain("const gravados = quantos === 0 ? 'gravado' : 'gravados';");
  expect(abrir).not.toContain('${frase} baixados');
});

function maiorDiferencaB(a: number[], b: number[]): number {
  let max = 0;
  for (let i = 0; i < a.length; i++) max = Math.max(max, Math.abs(a[i]! - b[i]!));
  return max;
}
});

import { ACTION_TABLE as ACTION_ROWS_B } from '../src/ui/actions-table.js';
import { pivotPanelPick, pivotPanelShowsLast } from '../src/panels/pivot-panel.js';
import { splitGridOptions } from '../src/panels/image-grid-model.js';
import { aroundLabelAt } from '../src/viewport/viewport-draw.js';
import { thumbnailKind as thumbnailKindB } from '../src/panels/thumbnail-kind.js';
import { emptySelection as emptySelectionB } from '../src/contract.js';


// ---------------------------------------------------------------------------
// Rodada 44, lote 0 (06/10/2026) — o painel Pivôs não trava com a pasta
// ---------------------------------------------------------------------------

import { PivotSizes as tamanhosR44 } from '../src/panels/pivot-sizes.js';

describe('o painel Pivôs pede cada tamanho uma vez (rodada 44, lote 0)', () => {
  /**
   * O defeito (achado da rodada 45; a 44 viu a página parar 3 em 3): cada
   * redesenho pedia de novo toda imagem não lida, e cada resposta redesenhava.
   * Simulado sem DOM, o algoritmo velho fazia 105 leituras e 106 redesenhos
   * para 14 imagens — a soma 14+13+…+1, que com 1664×1157 trava a página.
   * Este teste faz o painel de verdade: um "redesenho" que pede TODAS as
   * imagens ainda sem tamanho, e que roda de novo a cada tamanho que chega.
   */
  const NOMES = Array.from({ length: 14 }, (_, i) => `mao/mao_${i}`);

  it('14 imagens: 14 leituras, e os redesenhos não multiplicam', async () => {
    let redesenhos = 0;
    let leituras = 0;
    const tamanhos: InstanceType<typeof tamanhosR44> = new tamanhosR44(() => desenhar());
    const carregar = (): Promise<{ width: number; height: number }> => {
      leituras += 1;
      return new Promise((ok) => { setTimeout(() => ok({ width: 392, height: 390 }), 1); });
    };
    function desenhar(): void {
      redesenhos += 1;
      for (const nome of NOMES) if (tamanhos.get(nome) === undefined) tamanhos.request(nome, carregar);
    }
    desenhar();
    desenhar();
    desenhar();
    await new Promise((ok) => { setTimeout(ok, 60); });
    expect(leituras).toBe(14);
    expect(tamanhos.requests).toBe(14);
    for (const nome of NOMES) expect(tamanhos.get(nome)).toEqual({ name: nome, width: 392, height: 390 });
    // 3 à mão + no máximo 1 por imagem (as que chegam juntas viram um só).
    expect(redesenhos).toBeLessThanOrEqual(3 + 14);
  });

  it('a que não abre não é pedida de novo a cada redesenho', async () => {
    let leituras = 0;
    const tamanhos = new tamanhosR44(() => {});
    const falha = (): Promise<null> => { leituras += 1; return Promise.resolve(null); };
    tamanhos.request('quebrada', falha);
    await Promise.resolve();
    await Promise.resolve();
    tamanhos.request('quebrada', falha);
    tamanhos.request('quebrada', falha);
    expect(leituras).toBe(1);
  });

  it('as respostas de uma leva pedem um redesenho só', async () => {
    let redesenhos = 0;
    const tamanhos = new tamanhosR44(() => { redesenhos += 1; });
    for (const nome of NOMES) tamanhos.request(nome, () => Promise.resolve({ width: 1, height: 1 }));
    await new Promise((ok) => { setTimeout(ok, 10); });
    expect(redesenhos).toBe(1);
  });

  it('o painel usa o cache, e não o mapa sem marca de antes', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
    expect(fonte).toContain('private sizes = new PivotSizes(() => this.render());');
    expect(fonte).toContain('return this.sizes.request(name, () => folderBitmap(own));');
    expect(fonte).not.toContain('this.sizes.set(name, { name, width: bitmap.width');
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 3 (06/10/2026) — o pivô se lê e se digita
// ---------------------------------------------------------------------------

import { PIVOT_NEXT_SWAP as proximaR44, parsePivotField as campoR44, pivotSizeLine as tamanhoR44 } from '../src/panels/pivot-dialog.js';

describe('o pivô se lê e se digita (rodada 44, lote 3)', () => {
  /**
   * Na conferência (doc 55, fotos 17 e 18): a janela dizia "X 35 · Y 16,5 —
   * px da imagem" sem o tamanho dela, sem campo, com os dois botões da mesma
   * cor; e o rodapé dizia "o osso não está nele" sem dizer quando o pivô vale.
   */
  it('a linha diz o tamanho e a faixa, em px', () => {
    const linha = tamanhoR44(70, 33);
    expect(linha).toContain('Imagem de 70 × 33 px');
    expect(linha).toContain('X de 0 a 70, Y de 0 a 33');
    expect(linha).toContain('da esquerda e de baixo');
    expect(tamanhoR44(25, 12.5)).toContain('12,5');
  });

  it('o campo aceita vírgula e recusa o que não é número', () => {
    expect(campoR44('12,5')).toBe(12.5);
    expect(campoR44(' 10 ')).toBe(10);
    expect(campoR44('-3')).toBe(-3);
    expect(campoR44('')).toBeNull();
    expect(campoR44('-')).toBeNull();
    expect(campoR44('abc')).toBeNull();
  });

  it('a janela tem os dois campos, e o "Deixar" não tem a cor do "Gravar"', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/pivot-dialog.ts'), 'utf8');
    expect(fonte).toContain("const campoX = campo('X', ow);");
    expect(fonte).toContain("el('button', 'dialog-close dialog-secundario', 'Deixar como está')");
    expect(fonte).toContain('corpo, campos, leitura,');
  });

  it('o rodapé do pivô diz quando ele vale, nas duas portas', () => {
    expect(proximaR44).toContain('Quando esta imagem entrar numa troca');
    for (const arquivo of ['palette.ts', 'pivot-panel.ts']) {
      const fonte = readFileSync(resolve(__dirname, `../src/panels/${arquivo}`), 'utf8');
      expect(fonte).toContain('command.moved, command)}${PIVOT_NEXT_SWAP}`');
    }
  });

  it('a aba Pivôs mostra px à vista; o aviso numa linha; a miniatura diz o tamanho', () => {
    const painel = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
    expect(painel).toContain('`X ${texto(pivot.x)} px · Y ${texto(pivot.y)} px`');
    const css = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.css'), 'utf8');
    expect(css).toContain('-webkit-line-clamp: 1;');
    const paleta = readFileSync(resolve(__dirname, '../src/panels/palette.ts'), 'utf8');
    expect(paleta).toContain('const tamanho = imageSizeText(doc, entry.name);');
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 5 (06/10/2026) — a conferência da v33.0 (doc 63)
// ---------------------------------------------------------------------------

import { pivotFieldProblem as problemaR44 } from '../src/panels/pivot-dialog.js';

describe('o pivô: campo inválido, tamanho na dica, raiz curta (rodada 44, lote 5, doc 63)', () => {
  it('"abc" no X não grava calado: a janela diz qual campo e como escrever', () => {
    expect(problemaR44('10', '7')).toBeNull();
    expect(problemaR44('12,5', '-3')).toBeNull();
    expect(problemaR44('abc', '7')).toBe('X "abc" não é número. Escreva em px, como 12 ou 12,5');
    expect(problemaR44('', 'x')).toBe('X "" e Y "x" não são números. Escreva em px, como 12 ou 12,5');
  });

  it('o Gravar e o Enter passam pela conferência', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/pivot-dialog.ts'), 'utf8');
    expect(fonte).toContain("yes.addEventListener('click', () => gravar());");
    expect(fonte).toContain("if (event.key === 'Enter') gravar();");
  });

  it('a grade de Pivôs traz o tamanho na dica, e a raiz numa linha', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/pivot-panel.ts'), 'utf8');
    expect(fonte).toContain('`${name}${tamanho}: pivô em ${texto(pivot.x)}, ${texto(pivot.y)} px. Clique para acertar`');
    expect(fonte).toContain("'Repetir para a pasta: não vale na raiz'");
  });
});
