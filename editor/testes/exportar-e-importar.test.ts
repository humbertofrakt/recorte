/**
 * Exportar e importar — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote20-imagens`, `lote32-miniaturas`, `lote41-exportar`, `lote43-webm`, `lote51-sequencia-em-zip`.
 */

import { readFileSync, existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadAtlas, loadSkeletonData } from '../../runtime/src/index.js';
import type { BoneFile, AttachmentDef } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { DRAG_TYPE, DropImageAsSlot, NO_ATLAS, SwapSlotImage, fold, paletteEntries } from '../src/panels/palette-model.js';
import { PALETTE_THUMB } from '../src/panels/palette.js';
import { ORDER_THUMB } from '../src/panels/draw-order.js';
import { WINDOW_PANELS } from '../src/ui/menus.js';
import { RIGHT_GROUPS, defaultLayout, missingTabs, sideOf } from '../src/ui/layout-model.js';
import { findAttachment } from '../src/panels/properties-model.js';
import { sequenceCount, sequenceFrameName, thumbnailKind } from '../src/panels/thumbnail-kind.js';
import { hasIcon } from '../src/ui/icons.js';
import { describeManual } from './manual-pausado.js';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import zlib from 'node:zlib';
import { readBonez, writeBonez } from '../../runtime/src/binario/bonez.js';
import { decodePng, encodePng } from '../../ferramentas/src/atlas/png.js';
import { exportPlan, formatSeconds, FORMAT_LABELS, WEBM_CLOCK_NOTE, canRecordWebm, defaultImageOptions, frameSizeLines, imageExportReport, outputNames, webmPlan, webmSupport, wantsZip, zipPlan } from '../src/io/export-image.js';
import type { ImageExportOptions, ImageExportResult } from '../src/io/export-image.js';
import { DOWNLOAD_FOLDER_LINE, exportPreviewLine, forgetImageOptions, rememberImageOptions, withRememberedOptions } from '../src/io/export-image.js';
import { skinExportReport, skinPackageFiles, sliceDoc, suggestedName } from '../src/io/export-skin.js';
// Degrau 12, parte `B` (18/09/2026): a biblioteca de animações.
import {
  ImportAnimationFile, animationFileNotice, animationFileReport, buildAnimationFile,
  importAnimationLines, importAnimationNotice, importedAnimationUris, referenceFactorFor,
  referenceOf, rigOfAnimations, suggestedAnimationName, unmetRig,
} from '../src/io/export-animation.js';
// Lote 2: as quatro animações de fábrica e a janela da biblioteca.
import { factorLine, factoryLibrary, libraryRow } from '../src/io/animation-library.js';
import { Skeleton, pose } from '../../runtime/src/index.js';
import type { PackageAtlasSource } from '../src/io/export-skin.js';
import { readBonez as readBonez__2, writeBonez as writeBonez__2, writeZip } from '../../ferramentas/src/binario/bonez.js';
import { frameFileName } from '../../ferramentas/src/exportar/quadros.js';

// ---------------------------------------------------------------------------
// imagens (lote 20) — era `lote20-imagens.test.ts`
// ---------------------------------------------------------------------------

describe('imagens (lote 20)', () => {
/**
 * Lote 20 (v4.2): o painel **Imagens**, e arrastar para a cena.
 *
 * Sem DOM. A `Palette` do Spriter: todas as imagens do atlas, com miniatura,
 * e **arrastar uma para a cena cria o desenho ali**. O que se prova aqui é a
 * conta — quais imagens, quantos slots usam cada uma, a busca sem acento — e
 * que o comando do arrasto desfaz **letra por letra**.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

/** Os nomes do atlas do herói, na ordem em que ele os traz. */
const ATLAS = [
  'body', 'armadura/body', 'face', 'hair', 'arm', 'forearm', 'hand_01', 'hand_02',
  'hand_03', 'arm_back', 'forearm_back', 'hand_back', 'thigh', 'shin', 'foot',
  'thigh_back', 'shin_back', 'foot_back', 'blade', 'cape_upper', 'cape_lower',
];

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

// ---------------------------------------------------------------------------
// A lista
// ---------------------------------------------------------------------------

describe('a lista de imagens', () => {
  it('traz uma linha por região do atlas, na ordem do atlas', () => {
    const doc = heroi();
    const linhas = paletteEntries(ATLAS, doc.file);
    expect(linhas.length).toBe(ATLAS.length);
    expect(linhas.map((l) => l.name)).toEqual(ATLAS);
  });

  it('diz quantos slots usam cada imagem, contando as peles', () => {
    const doc = heroi();
    const porNome = new Map(paletteEntries(ATLAS, doc.file).map((l) => [l.name, l.usedBy]));
    // `body` está na pele de repouso e na de armadura: dois usos.
    expect(porNome.get('body')).toBe(2);
    expect(porNome.get('face')).toBe(3);
    expect(porNome.get('armadura/body')).toBe(1);
    // `hand_01` e `hand_02` estão no atlas e ninguém aponta para eles: são as
    // imagens de uma SEQUÊNCIA, que o anexo pega pelo prefixo `hand_`. Zero
    // aqui é a resposta certa, e é ela que diz "esta imagem está sobrando".
    expect(porNome.get('hand_01')).toBe(0);
    expect(porNome.get('hand_02')).toBe(0);
    for (const linha of paletteEntries(ATLAS, doc.file)) {
      expect(linha.usedBy, linha.name).toBeGreaterThanOrEqual(0);
    }
  });

  it('a soma dos usos bate com o número de anexos que apontam para o atlas', () => {
    const doc = heroi();
    const total = paletteEntries(ATLAS, doc.file).reduce((s, l) => s + l.usedBy, 0);
    expect(total).toBeGreaterThan(0);
  });

  it('um anexo NULO não derruba a conta', () => {
    // `null` é como o formato diz "esta pele esconde este slot" (§7.1). Ler
    // `path` dele derrubou o painel na primeira montagem deste lote.
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 's', bone: 'root' }],
      skins: [{ name: 'default', attachments: { s: { desenho: null } } }],
    } as unknown as BoneFile;
    expect(() => paletteEntries(['desenho'], file)).not.toThrow();
    expect(paletteEntries(['desenho'], file)[0]?.usedBy).toBe(1);
  });

  it('a busca ignora acento e caixa', () => {
    expect(fold('MÃO')).toBe('mao');
    expect(fold('Coração')).toBe('coracao');
    const nomes = ['mao_aberta', 'mão_fechada', 'pé'];
    const file = { bone: {}, bones: [] } as unknown as BoneFile;
    expect(paletteEntries(nomes, file, 'MAO').map((l) => l.name))
      .toEqual(['mao_aberta', 'mão_fechada']);
    expect(paletteEntries(nomes, file, 'PE').map((l) => l.name)).toEqual(['pé']);
  });

  it('a busca vazia devolve tudo, e uma sem resultado devolve nada', () => {
    const doc = heroi();
    expect(paletteEntries(ATLAS, doc.file, '   ').length).toBe(ATLAS.length);
    expect(paletteEntries(ATLAS, doc.file, 'zzz').length).toBe(0);
  });

  it('sem atlas, a frase diz o que fazer em vez de deixar a lista vazia', () => {
    // Rodada 6: o caminho de verdade no menu — "Importar PSD…" não é item
    // nenhum; o item é PSD…, dentro de Arquivo → Importar ▸.
    expect(NO_ATLAS).toContain('Arquivo → Importar → PSD…');
    // Lote 59: a porta de trazer imagens é a pasta do projeto.
    expect(NO_ATLAS).toContain('Abrir pasta');
    expect(paletteEntries([], heroi().file)).toEqual([]);
  });

  it('a miniatura desta lista é a maior das três', () => {
    expect(PALETTE_THUMB).toBe(48);
    expect(PALETTE_THUMB).toBeGreaterThan(ORDER_THUMB);
  });
});

// ---------------------------------------------------------------------------
// Arrastar para a cena
// ---------------------------------------------------------------------------

describe('arrastar uma imagem para a cena', () => {
  it('cria um slot com aquele desenho, no osso escolhido', () => {
    const doc = heroi();
    const antes = (doc.file.slots ?? []).length;
    const command = new DropImageAsSlot(doc.file, 'blade', 'hand', doc.visibleSkins, 10, 20);
    doc.run(command);

    const slots = doc.file.slots ?? [];
    expect(slots.length).toBe(antes + 1);
    const novo = slots[slots.length - 1]!;
    expect(novo.name).toBe(command.name);
    expect(novo.bone).toBe('hand');
    expect(novo.attachment).toBe(command.name);
    expect(doc.undoLabel).toBe('Trazer imagem para a cena');
  });

  it('o anexo aponta para a imagem, e guarda o ponto onde caiu', () => {
    const doc = heroi();
    const command = new DropImageAsSlot(doc.file, 'blade', 'hand', doc.visibleSkins, 100, 50);
    doc.run(command);
    const skin = (doc.file.skins ?? []).find((s) => s.name === command.skin);
    const anexo = skin?.attachments?.[command.name]?.[command.name] as {
      type?: string; path?: string; x?: number; y?: number;
    };
    expect(anexo.type).toBe('region');
    // Sem o `path`, um slot chamado `blade2` procuraria uma imagem `blade2`.
    expect(anexo.path).toBe('blade');
    expect(anexo.x).toBeCloseTo(100, 6);
    expect(anexo.y).toBeCloseTo(50, 6);
  });

  it('sem osso escolhido, o desenho nasce na raiz', () => {
    const doc = heroi();
    const raiz = doc.file.bones?.[0]?.name ?? 'root';
    const command = new DropImageAsSlot(doc.file, 'blade', raiz, doc.visibleSkins, 0, 0);
    doc.run(command);
    expect((doc.file.slots ?? []).slice(-1)[0]?.bone).toBe(raiz);
  });

  it('duas vezes a mesma imagem dá dois nomes diferentes', () => {
    const doc = heroi();
    const um = new DropImageAsSlot(doc.file, 'blade', 'hand', doc.visibleSkins, 0, 0);
    doc.run(um);
    const dois = new DropImageAsSlot(doc.file, 'blade', 'hand', doc.visibleSkins, 0, 0);
    doc.run(dois);
    expect(um.name).not.toBe(dois.name);
    expect(um.name).toBe('blade');
    // `uniqueName` do contrato numera sem separador: `blade`, `blade2`.
    expect(dois.name).toBe('blade2');
  });

  it('desfazer devolve o arquivo LETRA POR LETRA', () => {
    const doc = heroi();
    const antes = JSON.stringify(doc.file);
    doc.run(new DropImageAsSlot(doc.file, 'blade', 'hand', doc.visibleSkins, 12, 34));
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('desfazer também tira a pele quando foi o comando que a criou', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [],
    } as unknown as BoneFile;
    const doc = new Doc(file);
    const antes = JSON.stringify(doc.file);
    doc.run(new DropImageAsSlot(doc.file, 'desenho', 'root', [], 0, 0));
    expect((doc.file.skins ?? []).length).toBe(1);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// Soltar em cima de um slot troca o desenho
// ---------------------------------------------------------------------------

describe('soltar em cima de um slot', () => {
  it('troca o desenho e não mexe em mais nada', () => {
    const doc = heroi();
    const criar = new DropImageAsSlot(doc.file, 'blade', 'hand', doc.visibleSkins, 0, 0);
    doc.run(criar);
    const antesSlots = JSON.stringify(doc.file.slots);

    doc.run(new SwapSlotImage(criar.name, 'face', criar.skin));
    const skin = (doc.file.skins ?? []).find((s) => s.name === criar.skin);
    const anexo = skin?.attachments?.[criar.name]?.[criar.name] as { path?: string };
    expect(anexo.path).toBe('face');
    // A ordem de desenho, o osso e o nome do slot ficaram como estavam.
    expect(JSON.stringify(doc.file.slots)).toBe(antesSlots);

    doc.undo();
    expect((skin?.attachments?.[criar.name]?.[criar.name] as { path?: string }).path)
      .toBe('blade');
  });

  it('um slot que não existe não muda nada e não estoura', () => {
    const doc = heroi();
    const antes = JSON.stringify(doc.file);
    doc.run(new SwapSlotImage('nao-existe', 'face', 'default'));
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// O painel entrou na bancada
// ---------------------------------------------------------------------------

describe('o painel Imagens entrou na bancada', () => {
  it('está no menu Janela e nasce à direita, em cima', () => {
    expect(WINDOW_PANELS.map((p) => p.id)).toContain('imagens');
    const known = [
      'arvore', 'ordem', 'propriedades', 'animacoes', 'exibicao', 'malha',
      'historico', 'imagens', 'previa', 'peles', 'regras',
    ];
    expect(sideOf(defaultLayout(known), 'imagens')).toBe('right');
    expect(RIGHT_GROUPS[0]).toContain('imagens');
    // A arrumação de fábrica do lote 16 não tem mais nenhuma aba por construir.
    // A **Entidades** é de outra época (degrau 5, 17/09/2026) e o **Pivôs** de
    // outra ainda (degrau 8, 18/09/2026): por isso faltam nesta lista de
    // painéis do lote 20. O que este teste prova é que o Imagens nasce à
    // direita, e isso não mudou.
    // E a **Partículas**, da rodada 15 (04/10/2026).
    expect(missingTabs(known).sort()).toEqual(['entidades', 'particulas', 'pivos']);
  });

  it('o arrasto tem um tipo só dele: a cena não responde a mais nada', () => {
    expect(DRAG_TYPE).toBe('text/x-recorte-imagem');
  });
});
});

// ---------------------------------------------------------------------------
// miniaturas (lote 32) — era `lote32-miniaturas.test.ts`
// ---------------------------------------------------------------------------

describe('miniaturas (lote 32)', () => {
/**
 * Lote 32 — anotação 18: miniatura para todo tipo de desenho.
 *
 * O Humberto viu `hand` e `weapon` com o quadrado vazio na aba Ordem e
 * perguntou *"o que é isso?"*. `hand` é uma sequência cujo `path` (`"hand_"`)
 * não é nome de região nenhuma; `weapon` mostra um esqueleto filho, que não tem
 * imagem para recortar. Estes testes pinam a regra: **nunca caixa vazia**.
 *
 * Sem DOM: quem decide é o módulo puro `thumbnail-kind.ts`. O desenho em si —
 * o `<img>`, o cantinho com o número, o ícone — é conferido sem cabeça pelo
 * `conferir-editor.mjs`, no editor de verdade.
 */
const HEROI = resolve(__dirname, '..', '..', 'formato', 'exemplos', 'heroi.bone');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(HEROI, 'utf8')) as BoneFile;
}

/** A definição de um desenho do herói, pelo par slot/desenho. */
function doHeroi(slot: string, attachment: string): AttachmentDef {
  const achado = findAttachment(heroi(), slot, attachment);
  if (achado === null) throw new Error(`o herói não tem ${slot}/${attachment}`);
  return achado.def;
}

describe('thumbnailKind: o que cada tipo mostra', () => {
  it('a sequência do herói mostra o quadro setup, com quantos quadros tem', () => {
    // `hand` é region, path "hand_", frames hand_01..03, setup 0.
    expect(thumbnailKind(doHeroi('hand', 'hand'), 'hand'))
      .toEqual({ kind: 'imagem', source: 'hand_01', badge: 3 });
  });

  it('o esqueleto filho do herói mostra o esqueleto, e o uri é a fonte', () => {
    expect(thumbnailKind(doHeroi('weapon', 'sword'), 'sword'))
      .toEqual({ kind: 'esqueleto', source: 'espada.bone' });
  });

  it('region e mesh mostram o path; sem path, o próprio nome', () => {
    expect(thumbnailKind(doHeroi('body', 'body'), 'body'))
      .toEqual({ kind: 'imagem', source: 'body' });
    // `face` é malha, com path "face": a malha mostra a imagem do path.
    expect(thumbnailKind(doHeroi('head', 'face'), 'face'))
      .toEqual({ kind: 'imagem', source: 'face' });
    // A malha ligada da pele armadura aponta para a mesma imagem.
    expect(thumbnailKind({ type: 'linkedmesh', parent: 'face', path: 'face' } as AttachmentDef, 'x'))
      .toEqual({ kind: 'imagem', source: 'face' });
    // Sem `path`, o nome do desenho é o nome da imagem (§7.8).
    expect(thumbnailKind({ type: 'region' } as AttachmentDef, 'bota'))
      .toEqual({ kind: 'imagem', source: 'bota' });
  });

  it('os quatro tipos sem imagem mostram o ícone do tipo, com o nome do tipo', () => {
    expect(thumbnailKind(doHeroi('hitbox', 'hitbox'), 'hitbox'))
      .toEqual({ kind: 'icone', icon: 'box', tipo: 'caixa de colisão' });
    expect(thumbnailKind(doHeroi('hand_point', 'hand_point'), 'hand_point'))
      .toEqual({ kind: 'icone', icon: 'point', tipo: 'ponto' });
    expect(thumbnailKind(doHeroi('cape_path', 'cape_path'), 'cape_path'))
      .toEqual({ kind: 'icone', icon: 'path', tipo: 'caminho' });
    expect(thumbnailKind(doHeroi('mask', 'mask'), 'mask'))
      .toEqual({ kind: 'icone', icon: 'mask', tipo: 'máscara' });
  });

  it('slot vazio e tipo desconhecido também têm ícone: nunca caixa vazia', () => {
    expect(thumbnailKind(null)).toEqual({ kind: 'icone', icon: 'image', tipo: 'sem desenho' });
    expect(thumbnailKind(undefined)).toEqual({ kind: 'icone', icon: 'image', tipo: 'sem desenho' });
    // Um tipo que este editor não conhece — o arquivo pode ser mais novo.
    expect(thumbnailKind({ type: 'holograma' } as unknown as AttachmentDef, 'h'))
      .toEqual({ kind: 'icone', icon: 'image', tipo: 'holograma' });
  });

  it('todo ícone que o plano pede existe no conjunto de ícones', () => {
    for (const nome of ['box', 'point', 'path', 'mask', 'bone', 'image']) {
      expect(hasIcon(nome), nome).toBe(true);
    }
  });

  it('NENHUM desenho do herói fica sem plano de miniatura', () => {
    const file = heroi();
    const vazios: string[] = [];
    for (const skin of file.skins ?? []) {
      for (const [slot, desenhos] of Object.entries(skin.attachments ?? {})) {
        for (const [nome, def] of Object.entries(desenhos ?? {})) {
          const plano = thumbnailKind(def as AttachmentDef, nome);
          const bom = plano.kind === 'icone'
            ? plano.icon !== '' && plano.tipo !== ''
            : plano.source !== '';
          if (!bom) vazios.push(`${skin.name}/${slot}/${nome}`);
        }
      }
    }
    expect(vazios).toEqual([]);
  });
});

describe('o nome do quadro de uma sequência (§7.10)', () => {
  it('com `frames`, é o nome escrito; o setup escolhe qual', () => {
    const frames = ['a1', 'a2', 'a3'];
    expect(sequenceFrameName('x', { frames })).toBe('a1');
    expect(sequenceFrameName('x', { frames, setup: 2 })).toBe('a3');
    // Um setup fora da lista não estoura: ele encosta na ponta.
    expect(sequenceFrameName('x', { frames, setup: 9 })).toBe('a3');
    expect(sequenceFrameName('x', { frames, setup: -1 })).toBe('a1');
  });

  it('sem `frames`, é o path com o número colado, com os zeros da spec', () => {
    // O exemplo da própria §7.10: path "olho_", start 1, digits 2, i = 3.
    expect(sequenceFrameName('olho_', { count: 4, start: 1, digits: 2, setup: 3 })).toBe('olho_04');
    // Sem `digits`, número puro; sem `start`, ele começa em 1.
    expect(sequenceFrameName('olho_', { count: 4 })).toBe('olho_1');
    expect(sequenceFrameName('olho_', { count: 4, setup: 2 })).toBe('olho_3');
  });

  it('a conta de quadros: frames mandam, senão count, senão não é sequência', () => {
    expect(sequenceCount({ frames: ['a', 'b'] })).toBe(2);
    expect(sequenceCount({ frames: ['a', 'b'], count: 7 })).toBe(2);
    expect(sequenceCount({ count: 5 })).toBe(5);
    expect(sequenceCount(undefined)).toBe(0);
    expect(sequenceCount({})).toBe(0);
    // `count: 0` não é sequência: uma sequência tem pelo menos uma imagem.
    expect(thumbnailKind({ type: 'region', path: 'p', sequence: { count: 0 } } as AttachmentDef, 'p'))
      .toEqual({ kind: 'imagem', source: 'p' });
  });
});
});

// ---------------------------------------------------------------------------
// exportar (lote 41) — era `lote41-exportar.test.ts`
// ---------------------------------------------------------------------------

describe('exportar (lote 41)', () => {
/**
 * Lote 41 — rodada 4: exportar trecho e todas as animações pela janela,
 * pacote `.bonez` por pele, e `fatiar` lendo e gravando `.bonez`
 * (Spine 7, Nenhum 6, Nenhum 7).
 *
 * Sem DOM: o que se prova é a parte que decide — o plano da exportação, o
 * pacote montado em memória, e a linha de comando de verdade.
 *
 * O herói não tem a pele `inverno` do plano: o pacote usa `armadura`.
 */
const RAIZ = resolve(__dirname, '..', '..');
const EXEMPLOS = resolve(RAIZ, 'formato', 'exemplos');

const ZLIB = {
  inflate: (d: Uint8Array) => new Uint8Array(zlib.inflateSync(d)),
  deflate: (d: Uint8Array, level = 9) => new Uint8Array(zlib.deflateSync(d, { level })),
};
const ZIP = {
  deflateRaw: (d: Uint8Array) => new Uint8Array(zlib.deflateRawSync(d)),
  inflateRaw: (d: Uint8Array) => new Uint8Array(zlib.inflateRawSync(d)),
};

function heroi(): BoneFile {
  return JSON.parse(readFileSync(join(EXEMPLOS, 'heroi.bone'), 'utf8')) as BoneFile;
}

/** As animações do herói, com as durações que o runtime lê. */
function animacoes(): Array<{ name: string; duration: number }> {
  return loadSkeletonData(heroi()).animations.map((a) => ({ name: a.name, duration: a.duration }));
}

// ---------------------------------------------------------------------------
// Exportar imagem: De, Até e Todas as animações
// ---------------------------------------------------------------------------

describe('exportPlan — o que a janela Exportar imagem vai desenhar', () => {
  it('walk de 0,2 a 0,5 s, a 10 por segundo: 3 quadros, 0,2 · 0,3 · 0,4', () => {
    const plan = exportPlan({ animation: 'walk', from: 0.2, to: 0.5, fps: 10 }, animacoes(), 'heroi');
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.tasks).toHaveLength(1);
    expect(plan.tasks[0]!.times).toEqual([0.2, 0.3, 0.4]);
    expect(plan.tasks[0]!.base).toBe('heroi');
  });

  it('Todas as animações: uma tarefa por animação, com o nome de cada uma', () => {
    const plan = exportPlan({ animation: 'walk', fps: 10, all: true }, animacoes(), 'heroi');
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.tasks.map((t) => t.base)).toEqual(['heroi-idle', 'heroi-walk', 'heroi-attack']);
    // Cada uma inteira: idle 2 s = 20 quadros; walk 1 s = 10; attack 0,6 s = 6.
    expect(plan.tasks.map((t) => t.times.length)).toEqual([20, 10, 6]);
  });

  it('De maior que Até: recusado por escrito, e os dois campos voltam', () => {
    const plan = exportPlan({ animation: 'walk', from: 0.6, to: 0.3, fps: 10 }, animacoes(), 'heroi');
    expect(plan).toEqual({
      ok: false, field: 'range', message: 'De (0,6 s) tem de ser menor que Até (0,3 s).',
    });
  });

  it('Até depois do fim, e De negativo, também são recusados', () => {
    const depois = exportPlan({ animation: 'attack', from: 0, to: 2, fps: 10 }, animacoes(), 'heroi');
    expect(depois.ok).toBe(false);
    if (!depois.ok) {
      expect(depois.field).toBe('to');
      expect(depois.message).toContain('0,6 s');
    }
    const antes = exportPlan({ animation: 'walk', from: -1, fps: 10 }, animacoes(), 'heroi');
    expect(antes.ok).toBe(false);
    if (!antes.ok) expect(antes.field).toBe('from');
  });

  it('sem De nem Até é a animação inteira, como antes do lote', () => {
    const plan = exportPlan({ animation: 'walk', fps: 30 }, animacoes(), 'heroi');
    expect(plan.ok && plan.tasks[0]!.times.length).toBe(30);
  });

  it('os segundos se escrevem com vírgula', () => {
    expect(formatSeconds(0.25)).toBe('0,25');
    expect(formatSeconds(2)).toBe('2');
  });
});

// ---------------------------------------------------------------------------
// Exportar por pele: o pacote .bonez com o atlas
// ---------------------------------------------------------------------------

/** O atlas do herói, como o editor o teria: a árvore e os pixels da página. */
function fontesDoHeroi(): PackageAtlasSource[] {
  const json = JSON.parse(readFileSync(join(EXEMPLOS, 'heroi.atlas.json'), 'utf8')) as PackageAtlasSource['json'];
  const pages = json.pages.map((page) => {
    const image = decodePng(new Uint8Array(readFileSync(join(EXEMPLOS, page.image))), ZLIB);
    return { name: page.name, width: image.width, height: image.height, pixels: image.pixels };
  });
  return [{ json, pages }];
}

describe('Exportar por pele — o pacote .bonez com o atlas', () => {
  it('pele armadura: manifest, um .bone, um .atlas.json, um .png, e abre sem aviso', async () => {
    const doc = new Doc(heroi());
    const result = sliceDoc(doc, { skins: ['default', 'armadura'], animations: ['idle', 'walk', 'attack'] });
    const nome = suggestedName(doc, { skins: ['default', 'armadura'], animations: [] }, '.bonez');
    expect(nome).toBe('heroi-armadura.bonez');

    const pkg = await skinPackageFiles(result, 'heroi-armadura', fontesDoHeroi(),
      (page) => encodePng({ width: page.width, height: page.height, pixels: page.pixels }, ZLIB));
    expect(pkg.warnings).toEqual([]);
    const bytes = writeBonez({ manifest: pkg.manifest, files: pkg.files }, ZIP);

    const pacote = readBonez(bytes, ZIP);
    expect(pacote.manifest.main).toBe('heroi-armadura.bone');
    const nomes = pacote.names().filter((n) => n !== 'mimetype' && n !== 'manifest.json');
    expect(nomes.filter((n) => n.endsWith('.bone'))).toEqual(['heroi-armadura.bone']);
    expect(nomes.filter((n) => n.endsWith('.atlas.json'))).toEqual(['heroi-armadura.atlas.json']);
    expect(nomes.filter((n) => n.endsWith('.png'))).toHaveLength(1);

    // Regiões do atlas = só as que os anexos que sobraram citam.
    const atlasJson = JSON.parse(new TextDecoder().decode(pacote.read('heroi-armadura.atlas.json')!)) as {
      regions: Array<{ name: string; aliases?: string[] }>;
    };
    const respondidas = new Set(atlasJson.regions.flatMap((r) => [r.name, ...(r.aliases ?? [])]));
    for (const usada of result.regions) expect(respondidas.has(usada), usada).toBe(true);
    for (const r of atlasJson.regions) {
      const citada = result.regions.includes(r.name) || (r.aliases ?? []).some((a) => result.regions.includes(a));
      expect(citada, r.name).toBe(true);
    }

    // Abre no runtime de referência, com o atlas de dentro, sem um aviso.
    const file = JSON.parse(new TextDecoder().decode(pacote.readMain())) as BoneFile;
    expect(file.assets?.atlases).toEqual(['heroi-armadura.atlas.json']);
    expect(file.assets?.imagesBase).toBe('');
    const atlas = loadAtlas(atlasJson);
    expect(loadSkeletonData(file, { atlases: [atlas] }).warnings).toEqual([]);
  });

  it('o relatório diz o que foi no pacote', () => {
    const doc = new Doc(heroi());
    const result = sliceDoc(doc, { skins: ['default'], animations: ['idle'] });
    const linhas = skinExportReport({
      choice: { skins: ['default'], animations: ['idle'] }, result, name: 'heroi.bonez', size: 1,
      entries: ['heroi.bone', 'heroi.atlas.json', 'heroi.png'],
    });
    expect(linhas[0]).toBe('No pacote: heroi.bone, heroi.atlas.json, heroi.png');
  });
});

// ---------------------------------------------------------------------------
// fatiar lê e grava .bonez
// ---------------------------------------------------------------------------

describe('npm run fatiar com .bonez', () => {
  it('fatiar heroi.bonez --peles armadura: mesmas contagens que a partir do .bone, e sai .bonez', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'fatiar-bonez-'));
    try {
      const pacote = join(pasta, 'heroi.bonez');
      execFileSync(process.execPath, [
        join(RAIZ, 'ferramentas', 'converter.mjs'), join(EXEMPLOS, 'heroi.bone'), pacote,
      ], { encoding: 'utf8' });

      const texto = execFileSync(process.execPath, [
        join(RAIZ, 'ferramentas', 'fatiar.mjs'), pacote, join(pasta, 'do-pacote'), '--peles', 'armadura',
      ], { encoding: 'utf8' });
      expect(texto).not.toContain('ainda não entra');
      expect(texto).toContain('Pacote');
      expect(existsSync(join(pasta, 'do-pacote.bonez'))).toBe(true);
      expect(existsSync(join(pasta, 'do-pacote.bone'))).toBe(false);

      execFileSync(process.execPath, [
        join(RAIZ, 'ferramentas', 'fatiar.mjs'), join(EXEMPLOS, 'heroi.bone'), join(pasta, 'do-texto'),
        '--peles', 'armadura',
      ], { encoding: 'utf8' });

      const saida = readBonez(new Uint8Array(readFileSync(join(pasta, 'do-pacote.bonez'))), ZIP);
      const doPacote = JSON.parse(new TextDecoder().decode(saida.readMain())) as BoneFile;
      const doTexto = JSON.parse(readFileSync(join(pasta, 'do-texto.bone'), 'utf8')) as BoneFile;
      expect(doPacote.bones.length).toBe(doTexto.bones.length);
      expect(doPacote.slots!.length).toBe(doTexto.slots!.length);
      expect(doPacote.animations!.length).toBe(doTexto.animations!.length);

      // Válido no validador. O validador de linha de comando não abre `.bonez`
      // — nem o que o `converter` grava; ver Desvios do lote 41 —, então o
      // esqueleto e o atlas de dentro do pacote vão para o disco e passam por ele.
      const uri = doPacote.assets!.atlases![0]!;
      const principal = join(pasta, 'dentro.bone');
      const atlasDentro = join(pasta, 'dentro.atlas.json');
      writeFileSync(principal, saida.readMain());
      writeFileSync(atlasDentro, saida.read(uri)!);
      const veredito = execFileSync(process.execPath, [
        join(RAIZ, 'ferramentas', 'validador', 'validar.mjs'), principal, atlasDentro,
      ], { encoding: 'utf8' });
      expect(veredito).toMatch(/2 válido\(s\), 0 com erro/);

      // E abre com o atlas de dentro, sem aviso.
      const atlas = loadAtlas(JSON.parse(new TextDecoder().decode(saida.read(uri)!)));
      expect(loadSkeletonData(doPacote, { atlases: [atlas] }).warnings).toEqual([]);
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  }, 120_000);
});

// ---------------------------------------------------------------------------
// O manual
// ---------------------------------------------------------------------------

describeManual('o manual acompanha', () => {
  const ler = (...partes: string[]): string =>
    readFileSync(resolve(RAIZ, 'documentos', 'manual', ...partes), 'utf8').replace(/\s+/g, ' ');
  const pendencias = (texto: string, marca: string): string => texto.slice(texto.indexOf(marca));

  it('as três linhas saíram de "O que ainda não funciona"', () => {
    const cap7 = pendencias(ler('07-exportar-e-usar-no-jogo.md'), '## O que ainda não funciona');
    expect(cap7).not.toContain('não tem trecho');
    expect(cap7).not.toContain('não lê `.bonez`');
    const cap3 = pendencias(ler('03-peles.md'), '## O que ainda não funciona');
    expect(cap3).not.toContain('grava só o `.bone`');
    const ch7 = pendencias(ler('en', '07-export-and-use-in-a-game.md'), '## What does not work yet');
    expect(ch7).not.toContain('no range');
    expect(ch7).not.toContain('does not read `.bonez`');
    const ch3 = pendencias(ler('en', '03-skins.md'), '## What does not work yet');
    expect(ch3).not.toContain('writes only the `.bone`');
  });

  it('os campos novos estão escritos, nas duas línguas', () => {
    for (const texto of [ler('07-exportar-e-usar-no-jogo.md'), ler('en', '07-export-and-use-in-a-game.md')]) {
      expect(texto).toContain('Todas as animações');
      expect(texto).toContain('Pacote .bonez com o atlas');
      expect(texto).toContain('heroi.bonez');
    }
  });
});
});

// ---------------------------------------------------------------------------
// webm (lote 43) — era `lote43-webm.test.ts`
// ---------------------------------------------------------------------------

describe('webm (lote 43)', () => {
/**
 * Lote 43 — rodada 4: vídeo WebM pela janela Exportar imagem.
 *
 * Sem DOM: quem grava é o `MediaRecorder` do navegador, e aqui não há
 * navegador. O que se prova é a parte que decide — quanto o vídeo dura, se o
 * navegador grava, e o que a janela e o resumo dizem.
 */
describe('webmPlan — quanto o vídeo grava', () => {
  it('1,0 s a 30 por segundo, 2 voltas: grava 2,0 s e 60 quadros', () => {
    const plan = webmPlan({ duration: 1.0, fps: 30, loops: 2 });
    expect(plan.seconds).toBe(2.0);
    expect(plan.frames).toBe(60);
    expect(plan.loops).toBe(2);
    expect(plan.frameMs).toBeCloseTo(1000 / 30, 9);
  });

  it('sem voltas: uma só', () => {
    expect(webmPlan({ duration: 0.6, fps: 30 }).seconds).toBeCloseTo(0.6, 9);
    expect(webmPlan({ duration: 0.6, fps: 30 }).loops).toBe(1);
  });

  it('voltas e quadros por segundo errados voltam ao menor que faz sentido', () => {
    expect(webmPlan({ duration: 1, fps: 30, loops: 0 }).loops).toBe(1);
    expect(webmPlan({ duration: 1, fps: 30, loops: Number.NaN }).loops).toBe(1);
    expect(webmPlan({ duration: 1, fps: 30, loops: 2.6 }).loops).toBe(3);
    expect(webmPlan({ duration: 1, fps: 0, loops: 1 }).frameMs).toBeCloseTo(1000 / 30, 9);
  });
});

describe('canRecordWebm — o navegador grava?', () => {
  it('sem MediaRecorder: não, e o motivo diz qual navegador usar', () => {
    expect(canRecordWebm({})).toBe(false);
    const support = webmSupport({});
    expect(support.ok).toBe(false);
    if (!support.ok) expect(support.reason).toContain('MediaRecorder');
  });

  it('com video/webm suportado: sim', () => {
    const env = { MediaRecorder: { isTypeSupported: (type: string) => type === 'video/webm' } };
    expect(canRecordWebm(env)).toBe(true);
    const support = webmSupport(env);
    expect(support.ok && support.mimeType).toBe('video/webm');
  });

  it('prefere vp9, depois vp8, depois o simples', () => {
    const all = { MediaRecorder: { isTypeSupported: () => true } };
    expect(webmSupport(all)).toEqual({ ok: true, mimeType: 'video/webm;codecs=vp9' });
    const vp8 = { MediaRecorder: { isTypeSupported: (t: string) => t !== 'video/webm;codecs=vp9' } };
    expect(webmSupport(vp8)).toEqual({ ok: true, mimeType: 'video/webm;codecs=vp8' });
  });

  it('grava vídeo, mas não WebM: não', () => {
    const env = { MediaRecorder: { isTypeSupported: (t: string) => t === 'video/mp4' } };
    expect(canRecordWebm(env)).toBe(false);
  });

  it('canvas sem captureStream: não', () => {
    const env = { MediaRecorder: { isTypeSupported: () => true }, captureStream: false };
    expect(canRecordWebm(env)).toBe(false);
  });

  it('Node, onde estes testes rodam, não tem gravador', () => {
    const scope = globalThis as { MediaRecorder?: unknown };
    expect(canRecordWebm({ MediaRecorder: scope.MediaRecorder as undefined })).toBe(false);
  });
});

describe('a janela e o resumo', () => {
  it('o formato novo tem nome escrito, e sai um arquivo .webm', () => {
    expect(FORMAT_LABELS.webm).toBe('Vídeo WebM');
    expect(outputNames('heroi', 'webm', 30)).toEqual(['heroi.webm']);
  });

  it('as opções padrão gravam uma volta', () => {
    const doc = { data: null, animation: 'walk', visibleSkins: [] } as unknown as Parameters<typeof defaultImageOptions>[0];
    expect(defaultImageOptions(doc).videoLoops).toBe(1);
  });

  it('o resumo do WebM diz a frase do relógio e não dá linha de ffmpeg', () => {
    const options: ImageExportOptions = {
      animation: 'walk', format: 'webm', fps: 30, scale: 1, background: null, autoCrop: true,
      columns: null, loop: 0, maxColors: 256, bones: false, videoLoops: 2,
    };
    const result: ImageExportResult = {
      files: [{ name: 'heroi.webm', blob: new Blob(['x']) }], frameCount: 30, width: 100, height: 80,
      index: null, warnings: [], animations: ['walk'], bases: ['heroi'],
    };
    const lines = imageExportReport(result, options, 'heroi');
    expect(lines).toContain(WEBM_CLOCK_NOTE);
    expect(lines).toContain('Voltas no vídeo: 2');
    expect(lines).toContain('Arquivos: heroi.webm');
    expect(lines.some((line) => line.startsWith('ffmpeg'))).toBe(false);
    expect(WEBM_CLOCK_NOTE).toBe(
      'O tempo é o do relógio do navegador, não quadro a quadro. Para quadro exato, use a sequência de PNG.');
  });
});
});

// ---------------------------------------------------------------------------
// sequencia em zip (lote 51) — era `lote51-sequencia-em-zip.test.ts`
// ---------------------------------------------------------------------------

describe('sequencia em zip (lote 51)', () => {
/**
 * Lote 51 — a sequência de PNG num `.zip` só.
 * Plano: `documentos/planos/PLANO rodada 5 - acabamento 2026-09-10.md`.
 *
 * Os nomes dentro do zip, o ZIP gravado e lido de volta byte a byte, a caixa
 * desligada (um download por quadro, como antes), e o `.bonez` intacto depois
 * de o gravador ganhar a porta do ZIP simples.
 */
const readBonez = readBonez__2;
const writeBonez = writeBonez__2;
/** Lê um ZIP guardado sem compressão, entrada por entrada, pelos cabeçalhos locais. */
function readStoredZip(bytes: Uint8Array): Array<{ name: string; data: Uint8Array }> {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const out: Array<{ name: string; data: Uint8Array }> = [];
  let at = 0;
  while (at + 30 <= bytes.length && view.getUint32(at, true) === 0x04034b50) {
    expect(view.getUint16(at + 8, true)).toBe(0); // guardado, sem compressão
    const size = view.getUint32(at + 18, true);
    const nameLength = view.getUint16(at + 26, true);
    const extraLength = view.getUint16(at + 28, true);
    const name = new TextDecoder().decode(bytes.subarray(at + 30, at + 30 + nameLength));
    const start = at + 30 + nameLength + extraLength;
    out.push({ name, data: bytes.slice(start, start + size) });
    at = start + size;
  }
  return out;
}

const DOZE = Array.from({ length: 12 }, (_, i) => frameFileName('heroi', i));

/** Doze "PNG" diferentes, para conferir que cada um volta no seu lugar. */
const pngs = DOZE.map((_, i) => Uint8Array.from([0x89, 0x50, 0x4e, 0x47, i, i * 3, 255 - i]));

describe('zipPlan', () => {
  it('doze quadros viram um heroi.zip, com as doze entradas na pasta heroi/, na ordem', () => {
    const plan = zipPlan(DOZE, 'heroi');
    expect(plan.file).toBe('heroi.zip');
    expect(plan.entries).toHaveLength(12);
    expect(plan.entries).toEqual(DOZE.map((name) => `heroi/${name}`));
    expect(plan.entries[0]).toMatch(/^heroi\/heroi_/);
  });
});

describe('writeZip', () => {
  it('ZIP gravado e lido de volta: 12 entradas, bytes iguais aos PNG soltos', () => {
    const plan = zipPlan(DOZE, 'heroi');
    const bytes = writeZip(pngs.map((data, i) => ({ name: plan.entries[i]!, data, compress: false })));
    expect([...bytes.subarray(0, 4)]).toEqual([0x50, 0x4b, 0x03, 0x04]);
    const back = readStoredZip(bytes);
    expect(back.map((entry) => entry.name)).toEqual(plan.entries);
    back.forEach((entry, i) => expect([...entry.data]).toEqual([...pngs[i]!]));
    // Sem `mimetype` nem manifesto: é um ZIP comum, não um `.bonez`.
    expect(back.some((entry) => entry.name === 'mimetype' || entry.name === 'manifest.json')).toBe(false);
    // O fim do diretório central conta as doze.
    const eocd = new DataView(bytes.buffer, bytes.byteOffset + bytes.length - 22, 22);
    expect(eocd.getUint32(0, true)).toBe(0x06054b50);
    expect(eocd.getUint16(10, true)).toBe(12);
  });

  it('mesma entrada, mesmos bytes; nome repetido ou com ".." é recusado', () => {
    const files = [{ name: 'a/b.png', data: pngs[0]! }];
    expect([...writeZip(files)]).toEqual([...writeZip(files)]);
    expect(() => writeZip([...files, ...files])).toThrow();
    expect(() => writeZip([{ name: '../x.png', data: pngs[0]! }])).toThrow();
  });

  it('o .bonez continua saindo e sendo lido como antes', () => {
    const data = new TextEncoder().encode('{"bone":{"version":"1.0"}}');
    const bytes = writeBonez({ manifest: { bonez: { version: '1.0' }, main: 'a.bone' }, files: [{ name: 'a.bone', data }] });
    expect([...readBonez(bytes).readMain()]).toEqual([...data]);
  });
});

describe('a caixa', () => {
  it('ligada por padrão; desligada, um download por quadro, como antes', () => {
    const doc = { data: null, animation: null } as unknown as Doc;
    expect(defaultImageOptions(doc).zip).toBe(true);
    expect(wantsZip({ format: 'png', zip: true }, 12)).toBe(true);
    expect(wantsZip({ format: 'png' }, 12)).toBe(true);
    expect(wantsZip({ format: 'png', zip: false }, 12)).toBe(false);
    expect(wantsZip({ format: 'gif', zip: true }, 1)).toBe(false);
    expect(wantsZip({ format: 'png', zip: true }, 1)).toBe(false);
  });
});
});


// ---------------------------------------------------------------------------
// Degrau 10 (18/09/2026): as duas opções de recorte e a virada no glTF
// ---------------------------------------------------------------------------

import { CROP_LABELS, cropChoice } from '../src/io/export-image.js';
import { CROP_COLOR, cropOfOpenAnimation } from '../src/viewport/viewport-draw.js';
import { bodySwitchWarnings } from '../src/io/export-gltf.js';
import type { EditorDoc } from '../src/contract.js';
import type { SkeletonData } from '../../runtime/src/index.js';

describe('exportar imagem: as duas opcoes de recorte (degrau 10, 10.4)', () => {
  const area = { x: -80, y: -10, width: 240, height: 200 };

  it('o padrao e a borda automatica: sem escolha, nada de retangulo', () => {
    expect(cropChoice({}, { name: 'attack', crop: area })).toEqual({ box: null, warnings: [] });
    expect(cropChoice({ crop: 'borda' }, { name: 'attack', crop: area })).toEqual({ box: null, warnings: [] });
  });

  it('pedindo a area da animacao, vale o retangulo gravado nela (spec 4.6)', () => {
    const escolha = cropChoice({ crop: 'animacao' }, { name: 'attack', crop: area });
    expect(escolha.box).toEqual(area);
    expect(escolha.warnings).toEqual([]);
  });

  it('animacao SEM area nao vira palpite: cai na borda e AVISA (regra 21)', () => {
    const escolha = cropChoice({ crop: 'animacao' }, { name: 'idle', crop: null });
    expect(escolha.box).toBe(null);
    expect(escolha.warnings[0]).toContain('idle');
    expect(escolha.warnings[0]).toContain('corte automático da borda');
  });

  it('area de lado zero tambem avisa, com os numeros dentro', () => {
    const escolha = cropChoice({ crop: 'animacao' }, { name: 'attack', crop: { x: 0, y: 0, width: 0, height: 10 } });
    expect(escolha.box).toBe(null);
    expect(escolha.warnings[0]).toContain('0 × 10');
  });

  it('as duas opcoes tem nome por extenso, e a padrao diz que e automatica', () => {
    expect(CROP_LABELS.borda).toContain('automático');
    expect(CROP_LABELS.animacao).toContain('animação');
  });
});

describe('o retangulo magenta na cena (degrau 10, 10.4)', () => {
  const doc = (animation: string | null, crop: unknown): EditorDoc => ({
    animation, data: { animations: [{ name: 'attack', crop }] },
  } as unknown as EditorDoc);

  it('a cor e magenta: nenhum desenho a usa (Spriter cap. 26)', () => {
    expect(CROP_COLOR).toBe('#ff00c8');
  });

  it('com area gravada na animacao aberta, o retangulo existe', () => {
    expect(cropOfOpenAnimation(doc('attack', { x: 1, y: 2, width: 30, height: 40 })))
      .toEqual({ x: 1, y: 2, width: 30, height: 40 });
  });

  it('sem area, com a base aberta, ou com lado zero: nao se desenha promessa nenhuma', () => {
    expect(cropOfOpenAnimation(doc('attack', null))).toBe(null);
    expect(cropOfOpenAnimation(doc(null, { x: 0, y: 0, width: 30, height: 40 }))).toBe(null);
    expect(cropOfOpenAnimation(doc('attack', { x: 0, y: 0, width: 0, height: 40 }))).toBe(null);
  });
});

describe('glTF: a virada de corpo vira aviso (degrau 10, 10.6)', () => {
  const dados = (keys: Array<{ value: string | null }>, times: number[]): SkeletonData => ({
    animations: [{ name: 'transformar', body: { keys: { values: keys, times } } }],
  } as unknown as SkeletonData);

  it('a animacao que troca de corpo diz o segundo e o nome do corpo', () => {
    const avisos = bodySwitchWarnings(dados([{ value: null }, { value: 'lobisomem.bone' }], [0, 0.5]));
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toContain('transformar');
    expect(avisos[0]).toContain('lobisomem.bone');
    expect(avisos[0]).toContain('0,50 s');
    expect(avisos[0]).toContain('um esqueleto só');
  });

  it('sem virada nenhuma, o glTF nao inventa aviso', () => {
    expect(bodySwitchWarnings({ animations: [{ name: 'idle', body: null }] } as unknown as SkeletonData)).toEqual([]);
    expect(bodySwitchWarnings(dados([{ value: null }], [0]))).toEqual([]);
  });
});

describe('Salvar como pacote: o .bonez é o PROJETO inteiro (degrau 10, 10.1)', () => {
  const C290 = resolve(__dirname, '../../conformidade/casos/C-290-virada-corte-seco');
  const enc = new TextEncoder();

  it('o pacote de dois corpos abre no validador com três vereditos', () => {
    // O manifesto é o que `packageBytes` monta desde o degrau 10: o corpo em
    // foco no `main`, TODOS os corpos em `skeletons` (2.9 cobra isso de todo
    // corpo que uma chave `body` cite) e as listas da janela em `extras`.
    const manifest = {
      bonez: { version: '1.0' },
      main: 'entrada.bone',
      skeletons: ['entrada.bone', 'lobisomem.bone'],
      atlases: [], images: [],
      extras: {
        RECORTE_projeto: {
          corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
        },
      },
    };
    const files = [
      { name: 'entrada.bone', data: enc.encode(readFileSync(join(C290, 'entrada.bone'), 'utf8')) },
      { name: 'lobisomem.bone', data: enc.encode(readFileSync(join(C290, 'lobisomem.bone'), 'utf8')) },
    ];
    const bytes = writeBonez({ manifest, files }, { deflateRaw: (d) => zlib.deflateRawSync(d) });

    const pasta = mkdtempSync(join(tmpdir(), 'recorte-pacote-'));
    try {
      const caminho = join(pasta, 'projeto.bonez');
      writeFileSync(caminho, bytes);
      const saida = execFileSync(
        process.execPath,
        [resolve(__dirname, '../../ferramentas/validador/validar.mjs'), caminho],
        { encoding: 'utf8' },
      );
      // Três vereditos: o manifesto e os dois corpos, cada um na sua linha.
      expect(saida).toContain('manifest.json   (manifesto)');
      expect(saida).toContain('entrada.bone   (esqueleto)');
      expect(saida).toContain('lobisomem.bone   (esqueleto)');
      expect(saida).toContain('1 válido(s), 0 com erro');
      // O corpo da chave `body` foi achado DENTRO do pacote: nada de BODY_MISSING.
      expect(saida).not.toContain('BODY_MISSING');
    } finally {
      rmSync(pasta, { recursive: true, force: true });
    }
  });
});

// ---------------------------------------------------------------------------
// A exportação segue a PILHA de peles — degrau 9 (§4.4) visto pelo degrau 10
// ---------------------------------------------------------------------------

import { freshSkeleton } from '../src/io/export-image.js';

describe('exportar imagem: a pilha manda, e a default pode sair dela', () => {
  /**
   * Um corpo com duas peles. O slot desenha o placeholder `mao`; a `default`
   * lhe dá a mão do homem (10 px) e a `lobisomem` lhe dá a garra (30 px) —
   * é assim que uma pele troca a arte (§4.4): mesmo placeholder, outro `path`.
   */
  const corpo = (): BoneFile => ({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'raiz' }],
    slots: [
      { name: 'mao', bone: 'raiz', attachment: 'mao' },
      // O tronco do homem: só a `default` o veste. É a peça que denuncia o
      // defeito — com a `default` por baixo à força, ele continuaria na imagem.
      { name: 'tronco', bone: 'raiz', attachment: 'tronco' },
    ],
    skins: [
      {
        name: 'default',
        attachments: {
          mao: { mao: { type: 'region', path: 'mao_homem', width: 10, height: 10 } },
          tronco: { tronco: { type: 'region', path: 'tronco_homem', width: 50, height: 50 } },
        },
      },
      { name: 'lobisomem', attachments: { mao: { mao: { type: 'region', path: 'garra', width: 30, height: 30 } } } },
    ],
  } as unknown as BoneFile);

  /** Qual arte um slot desenharia na imagem exportada: a largura dela. */
  const larguraDesenhada = (doc: Doc, slotName = 'mao'): number | null => {
    const skeleton = freshSkeleton(doc);
    const slot = skeleton?.slots.find((s) => s.data.name === slotName) ?? null;
    const anexo = slot?.attachment as { width?: number } | null | undefined;
    return anexo?.width ?? null;
  };

  it('a pilha só com a default: sai a arte da default, como sempre', () => {
    const doc = new Doc(corpo());
    expect(doc.pilha).toEqual(['default']);
    expect(larguraDesenhada(doc)).toBe(10);
  });

  it('a default por baixo e a pele por cima: vence a de cima (§4.4)', () => {
    const doc = new Doc(corpo());
    doc.pilha = ['default', 'lobisomem'];
    expect(larguraDesenhada(doc)).toBe(30);
    // O tronco vem da `default`, que está na pilha: continua na imagem.
    expect(larguraDesenhada(doc, 'tronco')).toBe(50);
  });

  /**
   * O defeito que este teste pega, achado pelo D9 em 18/09/2026: a exportação
   * chamava `setSkin`, a compatibilidade que põe a `default` por baixo SEMPRE.
   * Com a `default` fora da pilha (I10) a imagem saía com a arte que a cena já
   * não mostrava — e ninguém descobriria no editor, só no jogo.
   */
  it('a default FORA da pilha: só a pele de cima desenha (I10)', () => {
    const doc = new Doc(corpo());
    doc.pilha = ['lobisomem'];
    expect(larguraDesenhada(doc)).toBe(30);
    // E o tronco do homem, que só a `default` vestia, **some**: é a asserção
    // que o caminho velho (`setSkin`) reprovava, porque ele punha a `default`
    // por baixo à força e o tronco continuava na imagem.
    expect(larguraDesenhada(doc, 'tronco')).toBe(null);
    // Com a pilha vazia não sobra arte nenhuma, e a `default` não volta só.
    doc.pilha = [];
    expect(larguraDesenhada(doc)).toBe(null);
    expect(larguraDesenhada(doc, 'tronco')).toBe(null);
  });

  it('pele que já não existe no arquivo não derruba a exportação', () => {
    const doc = new Doc(corpo());
    doc.pilha = ['default', 'pele-apagada', 'lobisomem'];
    expect(larguraDesenhada(doc)).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// a biblioteca de animações (degrau 12, parte `B`) — `io/export-animation.ts`
// ---------------------------------------------------------------------------

describe('a biblioteca de animações (degrau 12)', () => {
/**
 * **Exportar animação… / Importar animação…** — 18/09/2026.
 *
 * O formato e os dois runtimes já faziam tudo (§2.8 `assets.animations`, §4.8
 * `rig`, `RIG_UNMET`, `rig.reference`, casos C-275 a C-297). O buraco era só a
 * tela: o editor exportava e importava PELE e não exportava nem importava
 * ANIMAÇÃO.
 *
 * O que se prova aqui é o que o EDITOR gera — e caso de conformidade não cobre
 * o que o editor gera. O `rig` sai do conteúdo, o `reference` sai da convenção
 * do corpo, e a lista do que o hospedeiro não tem aparece **antes** de aplicar.
 */
const HUMANOIDE = resolve(__dirname, '../../formato/rigs/humanoide-v1.bone');

/** Um corpo com a convenção do `humanoide-v1` e duas animações. */
function comAnimacoes(): BoneFile {
  const file = JSON.parse(readFileSync(HUMANOIDE, 'utf8')) as BoneFile;
  (file as unknown as { animations: unknown[] }).animations = [
    {
      name: 'andar',
      duration: 1,
      timelines: [
        { type: 'bone', target: 'coxa_e', property: 'rotation', keys: [{ time: 0, value: 0 }, { time: 1, value: 20 }] },
        { type: 'bone', target: 'coxa_e', property: 'x', keys: [{ time: 0, value: 0 }, { time: 1, value: 7 }] },
        { type: 'bone', target: 'coxa_d', property: 'rotation', keys: [{ time: 0, value: 0 }] },
        { type: 'slot', target: 'arma_d', property: 'visible', keys: [{ time: 0, value: true }] },
        { type: 'drawOrder', keys: [{ time: 0, value: [] }] },
      ],
    },
    {
      name: 'parado',
      duration: 2,
      timelines: [
        { type: 'bone', target: 'tronco', property: 'rotation', keys: [{ time: 0, value: 90 }] },
      ],
    },
  ];
  return file;
}

it('o `rig` sai do conteúdo: todo alvo de timeline `bone`, e os slots (4.8)', () => {
  const saida = buildAnimationFile(comAnimacoes(), ['andar'])!;
  expect(saida.report.needsBones).toEqual(['coxa_e', 'coxa_d']);
  expect(saida.report.needsSlots).toEqual(['arma_d']);
  const rig = (saida.file as unknown as { rig: { bones: string[]; slots: string[] } }).rig;
  expect(rig.bones).toEqual(['coxa_e', 'coxa_d']);
  expect(rig.slots).toEqual(['arma_d']);
});

it('o `rig.reference` sai da convenção do corpo: o tronco, e o tamanho que ele tem AQUI', () => {
  const saida = buildAnimationFile(comAnimacoes(), ['andar'])!;
  // `extras.convencao.referencia_para_rig_reference` = { bone: tronco, length: 70 }
  expect(saida.report.reference).toEqual({ bone: 'tronco', length: 70 });
  const rig = (saida.file as unknown as { rig: { reference?: unknown } }).rig;
  expect(rig.reference).toEqual({ bone: 'tronco', length: 70 });
});

it('corpo sem osso de referência sai SEM `reference`, e a frase diz isso (regra 21)', () => {
  const file = comAnimacoes();
  // Tira a convenção e o tronco: um corpo que não segue o humanoide-v1.
  delete (file as unknown as { extras?: unknown }).extras;
  file.bones = (file.bones ?? []).filter((bone) => bone.name !== 'tronco');
  const saida = buildAnimationFile(file, ['andar'])!;
  expect(saida.report.reference).toBe(null);
  expect((saida.file as unknown as { rig: { reference?: unknown } }).rig.reference).toBeUndefined();
  expect(animationFileNotice('andar.bone', saida.report)).toContain('Sem osso de referência');
  expect(animationFileReport(saida.report)).toContain(
    'Sem rig.reference: a animação entra no tamanho em que foi gravada',
  );
});

it('osso de referência de comprimento zero não vira `reference`: a spec pede length > 0', () => {
  const file = comAnimacoes();
  const tronco = (file.bones ?? []).find((bone) => bone.name === 'tronco')!;
  (tronco as { length?: number }).length = 0;
  expect(referenceOf(file)).toBe(null);
  expect(buildAnimationFile(file, ['andar'])!.report.reference).toBe(null);
});

it('o arquivo leva as animações e SÓ a raiz: §2.8 ignora o corpo de um arquivo de animações', () => {
  const saida = buildAnimationFile(comAnimacoes(), ['andar', 'parado'])!;
  expect(saida.file.animations!.map((a) => a.name)).toEqual(['andar', 'parado']);
  // `bones` é obrigatório (2.2), mas o corpo inteiro só engordaria o arquivo.
  expect(saida.file.bones!.map((b) => b.name)).toEqual(['raiz']);
  expect(saida.file.slots).toBeUndefined();
  expect(saida.file.skins).toBeUndefined();
  // O cabeçalho vem do corpo de origem: sem `minVersion` o arquivo não carrega.
  expect(saida.file.bone!.minVersion).toBe('1.0');
  expect(saida.file.bone!.generator).toBe('Recorte');
});

it('nenhuma animação pedida existe: não sai arquivo nenhum', () => {
  expect(buildAnimationFile(comAnimacoes(), ['nao-existe'])).toBe(null);
  expect(buildAnimationFile(comAnimacoes(), [])).toBe(null);
});

it('o que a §2.8 vai jogar fora aparece no relatório, por extenso', () => {
  const file = comAnimacoes();
  file.animations![0]!.timelines!.push(
    { type: 'event', keys: [{ time: 0, event: 'passo' }] } as never,
    { type: 'constraint', target: 'olhar', property: 'mix', keys: [{ time: 0, value: 1 }] } as never,
  );
  const saida = buildAnimationFile(file, ['andar'])!;
  expect(saida.report.dropped).toEqual(['evento "passo"', 'regra "olhar"']);
  expect(animationFileReport(saida.report)).toContain('Fica de fora: evento "passo" (2.8 ignora)');
  // E uma regra citada por timeline NÃO vira exigência de rig: ela é ignorada,
  // e pedi-la ao hospedeiro seria pedir um nome que nunca vai ser usado.
  expect(saida.report.needsBones).not.toContain('olhar');
  expect(saida.report.needsSlots).not.toContain('olhar');
});

it('importar põe o uri em `assets.animations`, e desfazer tira', () => {
  const doc = new Doc(comAnimacoes());
  doc.run(new ImportAnimationFile('parado.bone'));
  expect(importedAnimationUris(doc.file)).toEqual(['parado.bone']);
  doc.undo();
  expect(importedAnimationUris(doc.file)).toEqual([]);
  expect((doc.file as unknown as { assets?: { animations?: unknown } }).assets?.animations)
    .toBeUndefined();
});

it('o mesmo uri duas vezes entra uma vez só', () => {
  const doc = new Doc(comAnimacoes());
  doc.run(new ImportAnimationFile('parado.bone'));
  doc.run(new ImportAnimationFile('parado.bone'));
  expect(importedAnimationUris(doc.file)).toEqual(['parado.bone']);
});

it('a lista de ANTES de aplicar diz o que entra, o que falta e em que tamanho', () => {
  const hospedeiro = comAnimacoes();
  // Um corpo sem a coxa esquerda e sem a tomada da arma direita.
  hospedeiro.bones = (hospedeiro.bones ?? []).filter((b) => b.name !== 'coxa_e');
  hospedeiro.slots = (hospedeiro.slots ?? []).filter((s) => s.name !== 'arma_d');
  const externo = buildAnimationFile(comAnimacoes(), ['andar'])!.file;
  const linhas = importAnimationLines(hospedeiro, externo, ['andar']);
  expect(linhas[0]).toBe('Entra a animação "andar"');
  expect(linhas).toContain('Esta base NÃO tem o osso "coxa_e": o que depender dele fica de fora');
  expect(linhas).toContain('Esta base NÃO tem o slot "arma_d": o que depender dele fica de fora');
  expect(linhas[linhas.length - 1]).toContain('k = 1');
});

it('o fator de tamanho é o do runtime: hospedeiro / referência (2.8, F24)', () => {
  const externo = buildAnimationFile(comAnimacoes(), ['andar'])!.file;
  // Um gigante: o tronco dele mede 140, o dobro dos 70 da referência.
  const gigante = comAnimacoes();
  (gigante.bones ?? []).find((b) => b.name === 'tronco')!.length = 140;
  expect(referenceFactorFor(gigante, externo)).toBe(2);
  expect(importAnimationLines(gigante, externo, ['andar']).at(-1))
    .toContain('multiplicadas por 2,000');
  // Sem o osso da referência, k = 1 — e o aviso já está no `unmetRig`.
  const semTronco = comAnimacoes();
  semTronco.bones = (semTronco.bones ?? []).filter((b) => b.name !== 'tronco');
  expect(referenceFactorFor(semTronco, externo)).toBe(1);
});

it('a frase do rodapé diz quantas, quantas chaves, o contrato e a escala', () => {
  const saida = buildAnimationFile(comAnimacoes(), ['andar', 'parado'])!;
  const frase = animationFileNotice('humanoide-v1-animacoes.bone', saida.report);
  expect(frase).toContain('2 animações');
  expect(frase).toContain('8 chave(s)');
  expect(frase).toContain('exigem');
  expect(frase).toContain('"tronco"');
});

it('a frase de importar diz o que falta, e a sem falta não inventa aviso', () => {
  expect(importAnimationNotice('andar.bone', ['andar'], []))
    .toBe('andar.bone: a animação "andar", agora na lista de Animações');
  expect(importAnimationNotice('andar.bone', ['andar'], ['osso "coxa_e"']))
    .toContain('coxa_e');
});

it('o nome sugerido: uma leva o nome dela; várias levam o nome do rig', () => {
  const file = comAnimacoes();
  expect(suggestedAnimationName(file, { animations: ['andar'] })).toBe('andar.bone');
  expect(suggestedAnimationName(file, { animations: ['andar', 'parado'] }))
    .toBe('humanoide-v1-animacoes.bone');
});

it('o runtime lê o que o editor gerou: as animações entram pelo nome (2.8)', () => {
  const saida = buildAnimationFile(comAnimacoes(), ['andar'])!;
  // O arquivo que sai daqui tem de carregar sozinho, como qualquer `.bone`.
  const data = loadSkeletonData(saida.file);
  expect(data.animations.map((a) => a.name)).toContain('andar');
});
});

// ---------------------------------------------------------------------------
// as animações de fábrica — degrau 12, parte `B`, lote 2 (18/09/2026)
// ---------------------------------------------------------------------------

describe('as animações de fábrica (degrau 12)', () => {
/**
 * **parado, andar, correr e pular**, em
 * `formato/rigs/humanoide-v1-animacoes.bone`, gravadas contra a convenção de
 * nomes `formato/rigs/humanoide-v1.bone`.
 *
 * 🗣️ *"o que você acha do Mixamo?"* — e a pesquisa: *"o que o Mixamo realmente
 * vende não é a tecnologia, é a biblioteca"*.
 *
 * Caso de conformidade não cobre o que o EDITOR gera nem o que o PROJETO
 * publica, então as quatro precisam da prova aqui: que o arquivo é válido, que
 * o `rig` bate com o conteúdo, que os nomes de osso existem na convenção, e que
 * o runtime as junta ao corpo e as poses de fato se mexem.
 */
const RIGS = resolve(__dirname, '../../formato/rigs');
const FABRICA = join(RIGS, 'humanoide-v1-animacoes.bone');
const CONVENCAO = join(RIGS, 'humanoide-v1.bone');

const fabrica = (): BoneFile => JSON.parse(readFileSync(FABRICA, 'utf8')) as BoneFile;
const convencao = (): BoneFile => JSON.parse(readFileSync(CONVENCAO, 'utf8')) as BoneFile;

it('as quatro estão lá, com as durações e o repetir escritos', () => {
  const nomes = (fabrica().animations ?? []).map((a) => a.name);
  expect(nomes).toEqual(['parado', 'andar', 'correr', 'pular']);
  const porNome = new Map(
    (fabrica().animations ?? []).map((a) => [a.name, a as unknown as Record<string, unknown>]),
  );
  expect(porNome.get('parado')!['duration']).toBe(2);
  expect(porNome.get('andar')!['duration']).toBe(1);
  expect(porNome.get('correr')!['duration']).toBe(0.6);
  // O pulo NÃO repete, e é de propósito: um pulo que volta ao começo sozinho
  // vira um pula-pula.
  expect(porNome.get('pular')!['loop']).toBe(false);
  for (const nome of ['parado', 'andar', 'correr']) {
    expect(porNome.get(nome)!['loop']).toBe(true);
  }
});

it('o `rig` do arquivo é exatamente o que o conteúdo pede (4.8)', () => {
  const file = fabrica();
  const calculado = rigOfAnimations(file.animations ?? []);
  const gravado = (file as unknown as { rig: { bones: string[]; slots?: string[] } }).rig;
  // A mesma conta do editor: um `rig` que cita menos do que o arquivo usa é L2
  // `RIG_INCOMPLETE`, e um arquivo que o projeto publica não pode ter esse
  // defeito — é ele que serve de exemplo a quem for gravar o seu.
  expect(gravado.bones).toEqual(calculado.bones);
  expect(gravado.slots).toBeUndefined();
  expect(calculado.slots).toEqual([]);
});

it('todo osso que ele pede existe na convenção: nada de RIG_UNMET contra o humanoide-v1', () => {
  const falta = unmetRig(convencao(), fabrica());
  expect(falta).toEqual([]);
});

it('o `rig.reference` aponta para o tronco de 70, que é o da convenção', () => {
  const rig = (fabrica() as unknown as {
    rig: { name: string; reference: { bone: string; length: number } };
  }).rig;
  expect(rig.name).toBe('humanoide-v1');
  expect(rig.reference).toEqual({ bone: 'tronco', length: 70 });
  // E o número não foi inventado: é o comprimento do tronco na convenção.
  const tronco = (convencao().bones ?? []).find((b) => b.name === 'tronco');
  expect(tronco!.length).toBe(70);
  // Num corpo do dobro do tamanho, k = 2 — e é isso que a janela escreve.
  const gigante = convencao();
  (gigante.bones ?? []).find((b) => b.name === 'tronco')!.length = 140;
  expect(referenceFactorFor(gigante, fabrica())).toBe(2);
  expect(factorLine(referenceFactorFor(gigante, fabrica()))).toContain('2,000');
});

it('o arquivo carrega sozinho, e as quatro posam de verdade', () => {
  // Junta as animações de fábrica ao corpo da convenção, como a §2.8 manda o
  // leitor fazer, e confere que a pose MUDA no tempo. Uma animação que carrega
  // e não mexe em nada seria um verde que não é verde.
  const corpo = convencao();
  (corpo as unknown as { animations: unknown[] }).animations = fabrica().animations!;
  const data = loadSkeletonData(corpo);
  expect(data.animations.map((a) => a.name)).toEqual(['parado', 'andar', 'correr', 'pular']);

  for (const nome of ['parado', 'andar', 'correr', 'pular']) {
    const animacao = data.animations.find((a) => a.name === nome)!;
    const esqueleto = new Skeleton(data);
    esqueleto.setToSetupPose();
    pose(esqueleto, animacao, 0);
    esqueleto.updateWorldTransform();
    const inicio = esqueleto.bones.map((b) => `${b.worldX.toFixed(3)},${b.worldY.toFixed(3)}`).join('|');
    esqueleto.setToSetupPose();
    pose(esqueleto, animacao, animacao.duration / 2);
    esqueleto.updateWorldTransform();
    const meio = esqueleto.bones.map((b) => `${b.worldX.toFixed(3)},${b.worldY.toFixed(3)}`).join('|');
    expect(meio, `${nome} não mexeu nada entre 0 e a metade`).not.toBe(inicio);
  }
});

it('andar e correr fecham o ciclo: o fim é igual ao começo', () => {
  const corpo = convencao();
  (corpo as unknown as { animations: unknown[] }).animations = fabrica().animations!;
  const data = loadSkeletonData(corpo);
  for (const nome of ['parado', 'andar', 'correr']) {
    const animacao = data.animations.find((a) => a.name === nome)!;
    const esqueleto = new Skeleton(data);
    const em = (t: number): string => {
      esqueleto.setToSetupPose();
      pose(esqueleto, animacao, t);
      esqueleto.updateWorldTransform();
      return esqueleto.bones.map((b) => `${b.worldX.toFixed(4)},${b.worldY.toFixed(4)}`).join('|');
    };
    // Uma animação que repete e não fecha dá um tranco a cada volta.
    expect(em(0), `${nome} não fecha o ciclo`).toBe(em(animacao.duration));
  }
});

it('a biblioteca de fábrica oferece o arquivo das quatro, e NÃO a convenção vazia', () => {
  const lista = factoryLibrary();
  expect(lista.map((entry) => entry.uri)).toContain('humanoide-v1-animacoes.bone');
  // O `humanoide-v1.bone` é o corpo da convenção, com `animations` vazio de
  // propósito; o `lobisomem-rabo.bone` é uma pele. Oferecê-los aqui seria
  // oferecer uma biblioteca vazia.
  expect(lista.map((entry) => entry.uri)).not.toContain('humanoide-v1.bone');
  expect(lista.map((entry) => entry.uri)).not.toContain('lobisomem-rabo.bone');
  const quatro = lista.find((entry) => entry.uri === 'humanoide-v1-animacoes.bone')!;
  expect(quatro.animations).toEqual(['parado', 'andar', 'correr', 'pular']);
});

it('a linha da janela diz o que traz, o que falta e em que tamanho', () => {
  const quatro = factoryLibrary().find((e) => e.uri === 'humanoide-v1-animacoes.bone')!;
  // Contra a convenção inteira: nada falta.
  const inteiro = libraryRow(convencao(), quatro);
  expect(inteiro.rigName).toBe('humanoide-v1');
  expect(inteiro.unmet).toEqual([]);
  expect(inteiro.factor).toBe(1);
  expect(inteiro.animations[0]).toBe('parado — 2,00 s, repete');
  expect(inteiro.animations[3]).toBe('pular — 0,90 s, não repete');
  // Contra um corpo sem as pernas: a lista do que falta, por extenso.
  const semPernas = convencao();
  semPernas.bones = (semPernas.bones ?? []).filter((b) => !b.name.startsWith('coxa_'));
  const curto = libraryRow(semPernas, quatro);
  expect(curto.unmet).toContain('osso "coxa_e"');
  expect(curto.unmet).toContain('osso "coxa_d"');
});
});

describe('o aviso da exportação diz a verdade sobre o tamanho (N-6) e não repete o ffmpeg (N-14)', () => {
  const opcoes = (format: ImageExportOptions['format']): ImageExportOptions => ({
    animation: 'idle', format, fps: 30, scale: 1, background: null, autoCrop: true,
    columns: null, loop: 0, maxColors: 256, bones: false, all: true,
  });
  const resultado = (sizes: Array<[string, number, number]>): ImageExportResult => ({
    files: [{ name: 'heroi.gif', blob: new Blob(['x']) }], frameCount: 60,
    width: sizes[0]![1], height: sizes[0]![2], index: null, warnings: [],
    animations: sizes.map(([a]) => a), bases: sizes.map(([a]) => `heroi-${a}`),
    sizes: sizes.map(([animation, width, height]) => ({ animation, width, height })),
  });

  it('o caso do chat N: três animações, três tamanhos — um por animação, e nenhum "cada quadro"', () => {
    // Medido pelo chat N, 29/09: o aviso dizia 114×242 e saíam 156 e 295.
    const linhas = imageExportReport(resultado([['idle', 114, 242], ['walk', 156, 242], ['attack', 295, 281]]), opcoes('gif'), 'heroi');
    expect(linhas).toContain('  idle: 114 por 242 pixels');
    expect(linhas).toContain('  walk: 156 por 242 pixels');
    expect(linhas).toContain('  attack: 295 por 281 pixels');
    expect(linhas.some((l) => l.startsWith('Tamanho de cada quadro'))).toBe(false);
  });

  it('todas do mesmo tamanho: uma linha, e diz que é igual nas N', () => {
    expect(frameSizeLines(resultado([['a', 10, 20], ['b', 10, 20]])))
      .toEqual(['Tamanho de cada quadro: 10 por 20 pixels, igual nas 2 animações']);
  });

  it('uma animação: a linha de sempre', () => {
    expect(frameSizeLines(resultado([['idle', 114, 242]]))).toEqual(['Tamanho de cada quadro: 114 por 242 pixels']);
  });

  it('GIF e folha não levam mais a receita do ffmpeg; a sequência de PNG leva', () => {
    for (const format of ['gif', 'folha'] as const) {
      const linhas = imageExportReport(resultado([['idle', 1, 1]]), opcoes(format), 'heroi');
      expect(linhas.some((l) => l.includes('ffmpeg') || l.includes('MP4')), format).toBe(false);
    }
    const png = imageExportReport(resultado([['idle', 1, 1]]), opcoes('png'), 'heroi');
    expect(png.some((l) => l.startsWith('ffmpeg'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// E6 (rodada 3, 05/10/2026): "soltei um projeto grande do Spriter e o programa
// travou". A forma: o peso só aparecia depois de pago. 9 MB no disco são
// 801 MB abertos — e o programa lia tudo sem dizer nada.
// ---------------------------------------------------------------------------
import { readdirSync as readdirSyncE6, statSync as statSyncE6, readFileSync as readFileSyncE6 } from 'node:fs';
import { join as joinE6, resolve as resolveE6 } from 'node:path';
import { HEAVY_OPEN_BYTES, isHeavy, pngSize, weighImages, weightLead, weightOptions } from '../src/io/import-weight.js';
import type { WeighedImage } from '../src/io/import-weight.js';

describe('E6: o peso do projeto de fora, antes de ler as imagens', () => {
  const GAME = resolveE6(__dirname, '../../exemplo/game');
  const pngs = (dir: string): string[] => readdirSyncE6(dir).flatMap((nome) => {
    const caminho = joinE6(dir, nome);
    if (statSyncE6(caminho).isDirectory()) return pngs(caminho);
    return nome.toLowerCase().endsWith('.png') ? [caminho] : [];
  });
  const pesar = (caminhos: readonly string[]): WeighedImage[] => caminhos.map((caminho) => ({
    name: caminho, size: statSyncE6(caminho).size, head: new Uint8Array(readFileSyncE6(caminho).subarray(0, 24)),
  }));

  it('o cabeçalho do PNG dá largura e altura; o que não é PNG, não', () => {
    const cabeca = new Uint8Array(readFileSyncE6(pngs(GAME).find((c) => c.includes('bot'))!).subarray(0, 24));
    expect(pngSize(cabeca)).toEqual({ width: 1664, height: 1157 });
    expect(pngSize(new TextEncoder().encode('<?xml version="1.0"?><spriter_data>'))).toBeNull();
    expect(pngSize(new Uint8Array(10))).toBeNull();
  });

  it('o projeto do Humberto: 128 imagens, 9 MB no disco, 801 MB abertas — pesado', () => {
    const peso = weighImages(pesar(pngs(GAME)));
    expect(peso.images).toBe(128);
    expect(Math.round(peso.openBytes / 2 ** 20)).toBe(801);
    expect(Math.round(peso.diskBytes / 1e6)).toBe(9);
    expect(peso.biggest).toEqual({ width: 1664, height: 1157 });
    expect(isHeavy(peso)).toBe(true);
  });

  it('a frase diz o NÚMERO, a maior imagem e a memória da máquina — e que a livre não se sabe', () => {
    const peso = weighImages(pesar(pngs(GAME)));
    expect(weightLead('Spriter', peso, 8)).toBe(
      'Este projeto do Spriter tem 128 imagens: 9 MB no disco, e perto de 801 MB abertas na memória. '
      + 'A maior tem 1664×1157. A sua máquina tem perto de 8 GB de memória; o navegador não diz quanto dela está livre. '
      + 'Acima de 100 MB o programa pode parar de responder enquanto lê.');
    expect(weightLead(null, peso, null)).toContain('O navegador não diz quanta memória a sua máquina tem');
    expect(weightLead(null, peso, null)).not.toMatch(/pode demorar/);
  });

  it('dez imagens do jogo (73 MB, as que entraram em 28/09) não perguntam; vinte (147 MB, as que travaram), sim', () => {
    const doJogo = pngs(GAME).filter((c) => {
      const t = pngSize(new Uint8Array(readFileSyncE6(c).subarray(0, 24)));
      return t !== null && t.width === 1664 && t.height === 1157;
    });
    const dez = doJogo.slice(0, 10);
    const peso = weighImages(pesar(dez));
    expect(Math.round(peso.openBytes / 2 ** 20)).toBe(73);
    expect(isHeavy(peso)).toBe(false);
    const vinte = weighImages(pesar(doJogo.slice(0, 20)));
    expect(Math.round(vinte.openBytes / 2 ** 20)).toBe(147);
    expect(isHeavy(vinte)).toBe(true);
    expect(HEAVY_OPEN_BYTES).toBe(100 * 2 ** 20);
  });

  it('três caminhos, cada um dizendo o que faz; fechar a janela é "Não abrir"', () => {
    const peso = weighImages(pesar(pngs(GAME)));
    const opcoes = weightOptions(peso);
    expect(opcoes.map((o) => o.id)).toEqual(['abrir', 'sem', 'cancelar']);
    expect(opcoes[0]!.hint).toContain('801 MB');
    const fonte = readFileSyncE6(resolveE6(__dirname, '../src/ui/shell-drop.ts'), 'utf8');
    expect(fonte).toContain("cancelId: 'cancelar'");
  });

  it('o arrasto e o menu perguntam ANTES de ler as imagens', () => {
    const drop = readFileSyncE6(resolveE6(__dirname, '../src/ui/shell-drop.ts'), 'utf8');
    const caso = drop.slice(drop.indexOf("case 'outro':"));
    expect(caso.indexOf('gateHeavyForeign(shell, files)')).toBeGreaterThan(0);
    expect(caso.indexOf('gateHeavyForeign(shell, files)')).toBeLessThan(caso.indexOf('importForeignProject('));
    const menu = readFileSyncE6(resolveE6(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(menu).toContain('importFromOtherProgram(undefined, (files) => gateHeavyForeign(shell, files)');
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, lote 4: a janela Exportar imagem (N-16b, N-10, N-5, N-8)
// ---------------------------------------------------------------------------

describe('rodada 17, lote 4: a janela Exportar imagem', () => {
  const ANIMS = [{ name: 'idle', duration: 2 }, { name: 'walk', duration: 1 }];
  const base: ImageExportOptions = {
    animation: 'idle', format: 'gif', fps: 30, scale: 1, background: null, autoCrop: true,
    columns: null, loop: 0, maxColors: 256, bones: false, videoLoops: 1, zip: true,
  };

  it('N-5: antes de exportar, a janela diz o que vai sair', () => {
    expect(exportPreviewLine(base, ANIMS, 'heroi')).toBe('Vai sair: heroi.gif — idle, 60 quadros a 30 por segundo');
    expect(exportPreviewLine({ ...base, format: 'png' }, ANIMS, 'heroi')).toBe('Vai sair: heroi.zip (60 PNG) — idle, 60 quadros a 30 por segundo');
    expect(exportPreviewLine({ ...base, format: 'png', zip: false }, ANIMS, 'heroi'))
      .toBe('Vai sair: heroi_0000.png … heroi_0059.png (60 PNG) — idle, 60 quadros a 30 por segundo');
    expect(exportPreviewLine({ ...base, all: true }, ANIMS, 'heroi'))
      .toBe('Vai sair: heroi-idle.gif, heroi-walk.gif — 2 animações, 90 quadros a 30 por segundo');
    // A recusa também é dita antes do clique.
    expect(exportPreviewLine({ ...base, from: 1.5, to: 1 }, ANIMS, 'heroi')).toContain('tem de ser menor que Até');
  });

  it('N-10: a escolha da vez passada volta; a animação e o trecho, não', () => {
    forgetImageOptions();
    expect(withRememberedOptions(base)).toEqual(base);
    rememberImageOptions({ ...base, animation: 'walk', format: 'png', fps: 12, from: 0.2, to: 0.8, zip: false });
    const volta = withRememberedOptions({ ...base, animation: 'idle' });
    expect(volta.format).toBe('png');
    expect(volta.fps).toBe(12);
    expect(volta.zip).toBe(false);
    expect(volta.animation).toBe('idle');
    expect(volta.from).toBeNull();
    expect(volta.to).toBeNull();
    forgetImageOptions();
  });

  it('N-8: o aviso do fim diz a pasta', () => {
    const result: ImageExportResult = {
      files: [{ name: 'heroi.gif', blob: new Blob(['x']) }], frameCount: 60, width: 100, height: 80,
      index: null, warnings: [], animations: ['idle'], bases: ['heroi'],
    };
    const lines = imageExportReport(result, base, 'heroi');
    expect(lines).toContain(DOWNLOAD_FOLDER_LINE);
    expect(lines.indexOf(DOWNLOAD_FOLDER_LINE)).toBe(lines.indexOf('Arquivos: heroi.gif') + 1);
  });

  it('N-16b e N-10 ligados: a janela abre no começo, lembra ao fechar, e a linha se refaz a cada mudança', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).toContain('go.focus({ preventScroll: true });');
    expect(fonte).toContain('box.scrollTop = 0;');
    expect(fonte).not.toContain("'Nada foi desenhado ainda.'");
    expect(fonte).toContain('const options = withRememberedOptions(defaultImageOptions(doc));');
    expect(fonte).toContain('if (value === null && animations.length > 0) rememberImageOptions(readForm());');
    expect(fonte).toContain("box.addEventListener('change', () => { if (!running) preview(); });");
  });
});

describe('rodada 17, N-16b (a segunda volta): a janela Exportar imagem cabe inteira, com os botões sempre à vista', () => {
  it('a caixa não rola inteira: o meio rola, e o rodapé (Andamento e botões) fica fora da rolagem', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).not.toContain("box.style.overflowY = 'auto';");
    expect(fonte).toContain("const meio = el('div', 'dialog-rolagem');");
    expect(fonte.indexOf('box.append(meio);')).toBeLessThan(fonte.indexOf('box.append(barRow, barLine);'));
    expect(fonte.indexOf('box.append(barRow, barLine);')).toBeLessThan(fonte.indexOf('box.append(buttons);'));
    const css = readFileSync(resolve(__dirname, '../src/ui/dialog.css'), 'utf8');
    const regra = css.slice(css.indexOf('.dialog-rolagem {'));
    expect(regra).toContain('overflow-y: auto;');
    expect(regra).toContain('min-height: 0;');
  });
});

// ---------------------------------------------------------------------------
// Rodada 45, lote 2 — exportar a pose, com a janela que cabe (doc 57, §5)
// ---------------------------------------------------------------------------

describe('rodada 45, lote 2: exportar a pose, com a janela que cabe', () => {
  const anims = [{ name: 'idle', duration: 2 }, { name: 'attack', duration: 0.6 }];

  it('Só este quadro: uma imagem, a pose de um segundo (antes "De 0 até 0" era recusado)', async () => {
    const { exportPlan } = await import('../src/io/export-image.js');
    const plan = exportPlan({ animation: 'idle', fps: 30, frame: 0.5 }, anims, 'heroi');
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.tasks).toEqual([{ animation: 'idle', base: 'heroi', times: [0.5] }]);
    const zero = exportPlan({ animation: 'idle', fps: 30, frame: 0, from: 0, to: 0 }, anims, 'heroi');
    expect(zero.ok && zero.tasks[0]!.times).toEqual([0]);
    const longe = exportPlan({ animation: 'attack', fps: 30, frame: 1.5 }, anims, 'heroi');
    expect(longe.ok).toBe(false);
    if (!longe.ok) {
      expect(longe.field).toBe('frame');
      expect(longe.message).toContain('entre 0 e 0,6 s');
    }
    // Todas as animações manda: o quadro só não vale ali.
    const todas = exportPlan({ animation: 'idle', fps: 30, frame: 0.5, all: true }, anims, 'heroi');
    expect(todas.ok && todas.tasks).toHaveLength(2);
  });

  it('todo campo tem dica; todo número diz a faixa "de … a …"; De, Até, Escala e Margem dizem a unidade', async () => {
    const { EXPORT_FIELDS } = await import('../src/io/export-image.js');
    const campos = Object.entries(EXPORT_FIELDS) as Array<[string, { label: string; hint: string; range?: unknown }]>;
    expect(campos.length).toBeGreaterThanOrEqual(18);
    for (const [, campo] of campos) expect(campo.hint.length).toBeGreaterThan(20);
    for (const [, campo] of campos.filter(([, c]) => c.range !== undefined)) expect(campo.hint).toMatch(/de [\d,.]+.* a ([\d,.]+|\{fim\} s)/);
    expect(EXPORT_FIELDS.de.label).toContain('(s)');
    expect(EXPORT_FIELDS.ate.label).toContain('(s)');
    expect(EXPORT_FIELDS.escala.label).toContain('(×)');
    expect(EXPORT_FIELDS.margem.label).toContain('(px)');
  });

  it('a janela lê os rótulos da tabela, e os dois botões têm a frase na dica', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    const janela = fonte.slice(fonte.indexOf('export function exportImageWindow'));
    // Nenhum rótulo escrito à mão: todo `row(` usa uma chave da tabela.
    expect(janela).not.toMatch(/\brow\('[A-ZÁÉÍÓÚ]/);
    expect(janela).toContain('go.title = EXPORT_BUTTON_HINTS.exportar;');
    expect(janela).toContain('cancel.title = EXPORT_BUTTON_HINTS.fechar;');
    // A caixa "Cortar a borda vazia", que repetia a lista Recorte, saiu.
    expect(janela).not.toContain("'exp-cortar'");
    expect(janela).toContain("row('margem', marginField, 'exp-margem')");
  });

  it('o recorte é uma escolha só, de três, e volta igual', async () => {
    const { cropFromMode, modeFromCrop, CROP_MODE_LABELS } = await import('../src/io/export-image.js');
    expect(Object.keys(CROP_MODE_LABELS)).toEqual(['borda', 'animacao', 'nenhum']);
    for (const mode of ['borda', 'animacao', 'nenhum'] as const) expect(modeFromCrop(cropFromMode(mode))).toBe(mode);
    expect(cropFromMode('nenhum')).toEqual({ autoCrop: false, crop: 'borda' });
    // As opções guardadas antes deste lote (sem `crop`) continuam valendo.
    expect(modeFromCrop({ autoCrop: true })).toBe('borda');
    expect(modeFromCrop({ autoCrop: false })).toBe('nenhum');
  });

  it('a margem em px cresce o quadro dos dois lados, transparente ou da cor do fundo', async () => {
    const { withMargin } = await import('../src/io/export-image.js');
    const frame = { width: 2, height: 1, rgba: new Uint8Array([10, 20, 30, 255, 40, 50, 60, 255]) };
    const vazio = withMargin(frame, 3, null);
    expect([vazio.width, vazio.height]).toEqual([8, 7]);
    expect([...vazio.rgba.subarray(0, 4)]).toEqual([0, 0, 0, 0]);
    const meio = ((3 * 8) + 3) * 4;
    expect([...vazio.rgba.subarray(meio, meio + 8)]).toEqual([10, 20, 30, 255, 40, 50, 60, 255]);
    const cor = withMargin(frame, 1, '#ff0000');
    expect([...cor.rgba.subarray(0, 4)]).toEqual([255, 0, 0, 255]);
    expect(withMargin(frame, 0, null)).toBe(frame);
    expect(withMargin(frame, 500, null).width).toBe(2 + 2 * 64);
  });

  it('o relatório diz o quadro só e a pasta onde a exportação caiu', async () => {
    const { imageExportReport, exportFolderLine, DOWNLOAD_FOLDER_LINE, defaultImageOptions } = await import('../src/io/export-image.js');
    const result = {
      files: [{ name: 'heroi_0000.png', blob: new Blob([]) }], frameCount: 1, width: 110, height: 241,
      index: null, warnings: [], animations: ['idle'], bases: ['heroi'],
    };
    const base = defaultImageOptions(new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile));
    const opcoes = { ...base, animation: 'idle', format: 'png' as const, frame: 0.5 };
    const linhas = imageExportReport(result, opcoes, 'heroi', exportFolderLine('meu-heroi'));
    expect(linhas).toContain('Só o quadro de 0,5 s');
    expect(linhas).toContain('Pasta: exportar/, dentro da pasta do projeto meu-heroi');
    expect(imageExportReport(result, { ...opcoes, frame: null }, 'heroi')).toContain(DOWNLOAD_FOLDER_LINE);
  });

  it('a gravação vai para exportar/ da pasta do projeto quando ela existe', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).toMatch(/getDirectoryHandle\(EXPORT_SUBFOLDER, \{ create: true \}\)/);
    expect(fonte).toContain('const where = await saveExport(result, chosen, stem(doc), doc);');
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(casca).toContain('imageExportReport(run.result, run.options, run.base, run.where)');
  });

  it('a janela larga, em duas colunas, para caber em 1280×720', () => {
    const css = readFileSync(resolve(__dirname, '../src/ui/dialog.css'), 'utf8');
    const regra = css.slice(css.indexOf('.dialog-exportar .dialog-rolagem {'));
    expect(regra).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
    expect(css).toContain('.dialog-close.dialog-close-secundario {');
  });
});

describe('rodada 45, lote 2: uma imagem só fala no singular, sem receita de vídeo', () => {
  it('"1 imagem" antes, "1 quadro" no rodapé, e nada de ffmpeg', async () => {
    const { exportPreviewLine, imageExportLine, imageExportReport, defaultImageOptions } = await import('../src/io/export-image.js');
    const base = { ...defaultImageOptions(new Doc()), animation: 'idle', format: 'png' as const, frame: 0 };
    // Rodada 50, lote 2: reescrito de propósito — uma imagem só sai heroi.png.
    expect(exportPreviewLine(base, [{ name: 'idle', duration: 2 }], 'heroi')).toBe('Vai sair: heroi.png — idle, 1 imagem');
    const result = {
      files: [{ name: 'heroi_0000.png', blob: new Blob(['x']) }], frameCount: 1, width: 126, height: 257,
      index: null, warnings: [], animations: ['idle'], bases: ['heroi'],
    };
    expect(imageExportLine(result, base)).toContain('1 quadro de 126x257');
    expect(imageExportReport(result, base, 'heroi').some((linha) => linha.includes('ffmpeg'))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rodada 45, lote 3 — importar do Spriter pela pasta (doc 57, §5)
// ---------------------------------------------------------------------------

describe('rodada 45, lote 3: importar do Spriter pela pasta', () => {
  /** Uma pasta de mentira, com a forma do `showDirectoryPicker`. */
  const pasta = (name: string, filhos: Array<{ name: string; filhos?: unknown[] }>): unknown => ({
    kind: 'directory',
    name,
    async *values() {
      for (const f of filhos) {
        yield f.filhos === undefined
          ? { kind: 'file', name: f.name, getFile: async () => new File(['x'], f.name) }
          : pasta(f.name, f.filhos as Array<{ name: string; filhos?: unknown[] }>);
      }
    },
  });

  it('a pasta é lida com as subpastas e o caminho de cada arquivo (o Spriter procura a partir da raiz)', async () => {
    const { arquivosDaPasta } = await import('../src/io/import-foreign.js');
    const game = pasta('game', [
      { name: 'bcp.scml' }, { name: 'bcp.scon' }, { name: 'leia.txt' }, { name: 'notas.docx' },
      { name: 'bot', filhos: [{ name: '01 (6).png' }, { name: '01 (7).png' }] },
      { name: 'rino', filhos: [{ name: '01 (6).png' }] },
      { name: '.git', filhos: [{ name: 'x.png' }] },
    ]);
    const lidos = await arquivosDaPasta(game as never);
    // O mesmo nome em duas subpastas continua dois arquivos: o caminho os separa.
    expect(lidos.map((entry) => entry.path)).toEqual(['bcp.scml', 'bcp.scon', 'leia.txt', 'bot/01 (6).png', 'bot/01 (7).png', 'rino/01 (6).png']);
  });

  it('os projetos da raiz: .scml, .scon e o .json; não a textura nem o atlas', async () => {
    const { projetosNaRaiz } = await import('../src/io/import-foreign.js');
    expect(projetosNaRaiz(['bcp.scml', 'bcp.scon', 'bot/x.scml', 'heroi.json', 'heroi_tex.json', 'heroi.atlas.json', 'heroi.atlas', 'a.png']))
      .toEqual(['bcp.scml', 'bcp.scon', 'heroi.json']);
  });

  it('com as imagens pela pasta, o caminho que o .scml escreve bate (antes: 2 de 88)', async () => {
    const { importForeignProject } = await import('../src/io/import-foreign.js');
    const scml = readFileSync(resolve(__dirname, '../../exemplo/game/bcp.scml'), 'utf8');
    const files = [new File([scml], 'bcp.scml'), new File(['x'], '01 (6).png'), new File(['x'], '01 (6).png')];
    const projeto = await importForeignProject(files, ['game/bcp.scml', 'game/bot/01 (6).png', 'game/rino/01 (6).png']);
    expect(projeto.folderName).toBe('game');
    expect(projeto.looseImages.map((image) => image.name)).toEqual(['bot/01 (6)', 'rino/01 (6)']);
  });

  it('o relatório agrupa as linhas que só mudam no nome, sem número de seção nem "timeline"', async () => {
    const { agruparAvisos } = await import('../src/io/import-foreign.js');
    const linhas = [
      ...['bone_000', 'bone_002', 'bone_004', 'bone_005', 'bone_006', 'bone_007'].map((n) =>
        `O osso "${n}" troca de pai no meio da animação. O pai do arquivo é o mais usado; as outras chaves viram uma timeline "parent" (9.4).`),
      'O desenho "Camada 87" troca de osso no meio da animação. O osso do arquivo é o mais usado; as outras chaves viram uma timeline "slot/bone" (9.5), com o local do desenho no osso novo.',
    ];
    const saida = agruparAvisos(linhas);
    expect(saida).toHaveLength(2);
    expect(saida[0]).toMatch(/^6 vezes: O osso "bone_000" \(e mais 5: bone_002, bone_004, bone_005, bone_006, bone_007\) troca de pai/);
    expect(saida[0]).not.toContain('…');
    expect(saida.join('\n')).not.toMatch(/timeline|\(9\.\d\)/);
    expect(saida[1]).toContain('chaves de troca de osso');
  });

  it('a casca pede a pasta, pergunta qual projeto, agrupa o relatório; o projeto fica na pasta escolhida', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(casca).toContain("title: 'Qual projeto abrir?'");
    expect(casca).toContain('const lines = agruparAvisos(imported.warnings);');
    const io = readFileSync(resolve(__dirname, '../src/io/import-foreign.ts'), 'utf8');
    expect(io).toContain('if (hasForeignFolderPicker()) {');
    expect(io).toContain('handle: imported.folderHandle ?? null,');
  });

  it('as portas do Importar têm dica', async () => {
    const { fileMenu } = await import('../src/ui/menus.js');
    const importar = fileMenu().find((e) => 'action' in e && e.action === 'importar') as { children: Array<{ action?: string; hint?: string }> };
    for (const acao of ['importar-programa', 'importar-psd', 'importar-psd-ossos']) {
      expect(importar.children.find((c) => c.action === acao)?.hint ?? '').not.toBe('');
    }
  });
});

describe('rodada 45, lote 3: o rodapé das imagens quando a pasta foi escolhida', () => {
  it('não manda soltar a pasta que já veio; diz onde pôr; "Falta 1" no singular; nomes sem repetir', async () => {
    const { looseImagesNotice, agruparAvisos } = await import('../src/io/import-foreign.js');
    const frase = looseImagesNotice('Spriter', 87, ['mao/x'], 'game', true);
    expect(frase).toContain('Falta 1: "mao/x"');
    expect(frase).not.toContain('Solte a PASTA');
    expect(frase).toContain('aperte Recarregar');
    expect(looseImagesNotice('Spriter', 0, ['a', 'b'], 'game')).toContain('Solte a PASTA');
    const linhas = ['01', '01', '02'].map((n) => `O desenho "${n}" troca de osso no meio da animação.`);
    expect(agruparAvisos(linhas)[0]).toBe('3 vezes: O desenho "01" (e mais 1: 02) troca de osso no meio da animação.');
  });
});

describe('rodada 45, lote 4: a janela de exportar, pela conferência da v33.5 (doc 70)', () => {
  it('todo número diz a unidade no rótulo', async () => {
    const { EXPORT_FIELDS } = await import('../src/io/export-image.js');
    for (const campo of Object.values(EXPORT_FIELDS) as Array<{ label: string; range?: unknown }>) {
      if (campo.range !== undefined) expect(campo.label).toMatch(/\(.+\)$/);
    }
  });
  it('o .zip some quando sai uma imagem só', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).toContain("show(zipRow, format === 'png' && !(frameField.checked && !allField.checked));");
    expect(fonte).toContain("frameField.addEventListener('change', syncRows);");
  });
  it('exportar de novo ganha um número, o mesmo para o conjunto, e não pisa no de antes', async () => {
    const { nomesSemPisar } = await import('../src/io/export-image.js');
    expect(nomesSemPisar(['heroi_0000.png'], [])).toEqual(['heroi_0000.png']);
    expect(nomesSemPisar(['heroi_0000.png'], ['heroi_0000.png'])).toEqual(['heroi_0000 (2).png']);
    expect(nomesSemPisar(['heroi_0000.png'], ['heroi_0000.png', 'heroi_0000 (2).png'])).toEqual(['heroi_0000 (3).png']);
    expect(nomesSemPisar(['a.png', 'a.json'], ['a.json'])).toEqual(['a (2).png', 'a (2).json']);
  });
});

describe('rodada 45, lote 5: a pose da base se exporta, mesmo sem animação', () => {
  it('a base é uma tarefa de uma imagem, no tempo 0', async () => {
    const { exportPlan, BASE_POSE } = await import('../src/io/export-image.js');
    const plan = exportPlan({ animation: BASE_POSE, fps: 30 }, [], 'meu-projeto');
    expect(plan.ok).toBe(true);
    if (plan.ok) expect(plan.tasks).toEqual([{ animation: BASE_POSE, base: 'meu-projeto', times: [0] }]);
  });
  it('sem animação, a janela abre na base, com o Exportar ligado', async () => {
    const { defaultImageOptions, BASE_POSE } = await import('../src/io/export-image.js');
    expect(defaultImageOptions(new Doc()).animation).toBe(BASE_POSE);
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).not.toContain('go.disabled = animations.length === 0;');
    expect(fonte).toContain("{ value: BASE_POSE, label: BASE_POSE_LABEL }");
    expect(fonte).not.toContain('Este arquivo não tem animação nenhuma para exportar.');
  });
});

// Rodada 48, lote 3 (doc 95): sem pasta, só a JANELA dizia que o arquivo foi
// para os Downloads; o rodapé, que fica depois que a janela fecha, não dizia.
describe('rodada 48, lote 3: o rodapé do exportar diz para onde foi', () => {
  it('Downloads sem pasta; a pasta exportar/ com pasta', async () => {
    const { imageExportLine, defaultImageOptions, DOWNLOAD_FOLDER_LINE, exportFolderLine } = await import('../src/io/export-image.js');
    const base = { ...defaultImageOptions(new Doc()), animation: 'idle', format: 'png' as const, frame: 0 };
    const result = {
      files: [{ name: 'heroi_0000.png', blob: new Blob(['x']) }], frameCount: 1, width: 126, height: 257,
      index: null, warnings: [], animations: ['idle'], bases: ['heroi'],
    };
    expect(imageExportLine(result, base, DOWNLOAD_FOLDER_LINE)).toMatch(/ Foi para Downloads \(Ctrl\+J mostra\)\.$/);
    expect(imageExportLine(result, base, exportFolderLine('heroi'))).toMatch(/ Foi para exportar\/, na pasta heroi\.$/);
    expect(imageExportLine(result, base)).toMatch(/bytes\.$/);
  });
});

// ---------------------------------------------------------------------------
// Rodada 50, lote 2 — "Só este quadro" sai PNG (doc 98, item A)
// ---------------------------------------------------------------------------

describe('rodada 50, lote 2: Só este quadro leva o formato para PNG', () => {
  it('marcar Só este quadro com GIF, folha ou WebM troca para PNG e guarda o de antes', async () => {
    const { formatoComQuadro } = await import('../src/io/export-image.js');
    expect(formatoComQuadro('gif', true, null)).toEqual({ format: 'png', antes: 'gif' });
    expect(formatoComQuadro('webm', true, null)).toEqual({ format: 'png', antes: 'webm' });
    expect(formatoComQuadro('folha', true, null)).toEqual({ format: 'png', antes: 'folha' });
    expect(formatoComQuadro('png', true, null)).toEqual({ format: 'png', antes: null });
  });

  it('desmarcar devolve o formato de antes; quem escolheu outro formato depois manda', async () => {
    const { formatoComQuadro } = await import('../src/io/export-image.js');
    expect(formatoComQuadro('png', false, 'gif')).toEqual({ format: 'gif', antes: null });
    expect(formatoComQuadro('gif', true, 'webm')).toEqual({ format: 'gif', antes: 'webm' });
    expect(formatoComQuadro('gif', false, 'webm')).toEqual({ format: 'gif', antes: null });
  });

  it('o nome do arquivo bate: um quadro em PNG sai heroi.png, e o rodapé diz "Imagem PNG"', async () => {
    const { imageExportLine } = await import('../src/io/export-image.js');
    expect(outputNames('heroi', 'png', 1)).toEqual(['heroi.png']);
    const opcoes = { ...defaultImageOptions(new Doc()), animation: 'idle', format: 'png' as const, frame: 0 };
    const result: ImageExportResult = {
      files: [{ name: 'heroi.png', blob: new Blob(['x']) }], frameCount: 1, width: 110, height: 241,
      index: null, warnings: [], animations: ['idle'], bases: ['heroi'], sizes: [{ animation: 'idle', width: 110, height: 241 }],
    };
    expect(imageExportLine(result, opcoes)).toMatch(/^Imagem PNG: 1 quadro de 110x241/);
  });

  it('a janela chama a troca quando a caixa muda (e quando a pose da base marca a caixa sozinha)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).toMatch(/formatoComQuadro\(formatField\.value as ImageFormat, one, formatoAntes\)/);
  });
});

describe('rodada 50, lote 4: a janela do exportar não pula quando muda de altura (doc 100)', () => {
  it('a janela mora no topo da tela: trocar o formato não muda o lugar da caixa "Só este quadro"', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).toContain("const veil = el('div', 'dialog-veil dialog-veil-topo');");
    const css = readFileSync(resolve(__dirname, '../src/ui/dialog.css'), 'utf8');
    expect(css).toMatch(/\.dialog-veil\.dialog-veil-topo\s*\{[^}]*align-items:\s*flex-start/);
  });
});

describe('QA 04/11/2026 — D6: a janela do PNG em .zip conta o que saiu', () => {
  // A prova (Chromium sem janela): Exportar → "GIF, PNG, folha, vídeo…" →
  // Sequência de PNG. Saiu UM heroi.zip; o rodapé dizia "1 .zip com 60 PNG",
  // e a janela, "60 arquivo(s) gravado(s)" e "Arquivos: heroi_0000.png, …"
  // — 60 nomes de arquivos que não estão no disco.
  const opcoes: ImageExportOptions = {
    animation: 'idle', format: 'png', fps: 30, scale: 1, background: null, autoCrop: true,
    columns: null, loop: 0, maxColors: 256, bones: false,
  };
  const sessenta = (): ImageExportResult => ({
    files: Array.from({ length: 60 }, (_, i) => ({ name: `heroi_${String(i).padStart(4, '0')}.png`, blob: new Blob(['x']) })),
    frameCount: 60, width: 114, height: 242, index: null, warnings: [],
    animations: ['idle'], bases: ['heroi'], sizes: [{ animation: 'idle', width: 114, height: 242 }],
  });

  it('a frase de cima: 1 arquivo, o .zip, com os 60 PNG dentro', async () => {
    const { imageExportLead } = await import('../src/io/export-image.js');
    expect(imageExportLead(sessenta(), opcoes, 'heroi')).toBe('1 arquivo gravado: heroi.zip, com 60 PNG dentro.');
    expect(imageExportLead(sessenta(), { ...opcoes, zip: false }, 'heroi')).toBe('60 arquivos gravados.');
    const um = { ...sessenta(), files: sessenta().files.slice(0, 1) };
    expect(imageExportLead(um, { ...opcoes, format: 'gif' }, 'heroi')).toBe('1 arquivo gravado.');
  });

  it('a linha Arquivos diz o .zip e o primeiro e o último de dentro', () => {
    const linhas = imageExportReport(sessenta(), opcoes, 'heroi');
    expect(linhas).toContain('Arquivos: heroi.zip, com heroi/heroi_0000.png … heroi/heroi_0059.png dentro');
    expect(linhas.some((l) => l.includes('heroi_0030.png'))).toBe(false);
  });

  it('a casca usa a frase nova', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('lead: imageExportLead(run.result, run.options, run.base),');
  });
});

describe('QA 04/11/2026 — D7: o projeto importado de outro programa nasce "não salvo"', () => {
  // A prova (Chromium sem janela): Importar → De outro programa… → exemplo/game
  // → bcp.scml. O documento abria com path "bcp.bone" e dirty=false: o rodapé
  // diria "Sem mudanças por salvar." de um arquivo que não existe no disco, e
  // fechar a aba não perguntava nada. O PSD importado já nascia sujo.
  const fonte = (arquivo: string): string => readFileSync(resolve(__dirname, '../src/ui', arquivo), 'utf8');

  it('pelo menu: o setFile do importado leva unsaved', () => {
    const f = fonte('shell-file.ts');
    const corpo = f.slice(f.indexOf('export async function importForeign('), f.indexOf('const program = FORMAT_LABELS[imported.format]'));
    expect(corpo).toMatch(/shell\.doc\.setFile\(imported\.file, \{[^}]*unsaved: true/);
  });

  it('pelo arrasto da pasta: o mesmo', () => {
    const f = fonte('shell-drop.ts');
    const corpo = f.slice(f.indexOf("case 'outro': {"), f.indexOf('const programa = FORMAT_LABELS[importado.format]'));
    expect(corpo).toMatch(/shell\.doc\.setFile\(importado\.file, \{[^}]*unsaved: true/);
  });
});

describe('QA 04/11/2026 — D12: a exportação de imagem conta as partículas na caixa', () => {
  // A prova (Chromium sem janela): Abrir pasta com o fogo.bone gravado pelo
  // editor (fumaça, fogo e faísca, nenhum desenho) → Exportar → "GIF, PNG,
  // folha, vídeo…" → Só este quadro (0,4 s). Saiu "1 quadro de 1x1, 88 bytes":
  // a caixa era a do `getBounds`, que conta desenhos e não partículas — a mesma
  // forma do D10 na linha de comando.
  const PASTA = resolve(__dirname, '../../ferramentas/testes/dados/particulas-do-editor');
  const posado = (t: number) => {
    const file = JSON.parse(readFileSync(join(PASTA, 'fogo.bone'), 'utf8'));
    const atlas = loadAtlas(JSON.parse(readFileSync(join(PASTA, 'particulas.atlas.json'), 'utf8')));
    const data = loadSkeletonData(file, { atlases: [atlas] });
    return { data, t };
  };

  it('em 0,4 s a caixa tem o tamanho do fogo, e não 1x1', async () => {
    const { boxWithParticles } = await import('../src/io/export-image.js');
    const { Skeleton, pose } = await import('../../runtime/src/index.js');
    const { data } = posado(0.4);
    const sk = new Skeleton(data);
    sk.setToSetupPose();
    sk.updateWorldTransform(0);
    expect(sk.getBounds()?.width ?? 0).toBe(0);
    pose(sk, data.animations[0]!, 0.4, 0.4);
    const caixa = boxWithParticles(sk);
    expect(caixa).not.toBeNull();
    expect(caixa!.width).toBeGreaterThan(40);
    expect(caixa!.height).toBeGreaterThan(40);
  });

  it('as duas caixas da janela usam a conta nova', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    const base = fonte.slice(fonte.indexOf('function baseBounds('), fonte.indexOf('/** The box every frame'));
    expect(base).toContain('boxWithParticles(');
    const anim = fonte.slice(fonte.indexOf('export function boundsOverAnimation('), fonte.indexOf('/** A canvas of the camera'));
    expect(anim.match(/boxWithParticles\(skeleton\)/g)?.length).toBe(2);
  });
});

describe('QA 04/11/2026 — D13: o nome sugerido das animações de uma base sem rig', () => {
  // A prova (Chromium sem janela): herói aberto → Exportar → Animações, para
  // outra base… → idle, walk, attack. O seletor sugeriu "animacoes-animacoes.bone":
  // o herói não tem `rig`, e a palavra de reserva entrava duas vezes.
  it('sem rig, vale o nome da base: heroi-animacoes.bone', () => {
    const file = { skeleton: { name: 'heroi' }, bones: [{ name: 'root' }] } as unknown as BoneFile;
    expect(suggestedAnimationName(file, { animations: ['idle', 'walk', 'attack'] })).toBe('heroi-animacoes.bone');
  });

  it('sem rig e sem nome: animacoes.bone, uma vez só', () => {
    const file = { bones: [{ name: 'root' }] } as unknown as BoneFile;
    expect(suggestedAnimationName(file, { animations: ['a', 'b'] })).toBe('animacoes.bone');
  });
});

describe('QA 04/11/2026 — o rodapé do PSD diz o resultado com a janela aberta', () => {
  // A prova (Chromium sem janela): Importar → PSD…; com a janela de avisos
  // aberta, o rodapé dizia "Importar PSD." (o nome do passo), e o resumo
  // ("19 camadas lidas, 19 slots criados…") só chegava depois de Fechar.
  const fonte = (arquivo: string): string => readFileSync(resolve(__dirname, '../src/ui', arquivo), 'utf8');
  it('pelo menu e pelo arrasto: primeiro o rodapé, depois a janela', () => {
    for (const [arquivo, resumo] of [['shell-file.ts', 'result.summary'], ['shell-drop.ts', 'feito.summary']] as const) {
      const f = fonte(arquivo);
      const rodape = f.indexOf(`shell.statusState.textContent = ${resumo};`);
      const janela = f.indexOf('if (aviso !== null) await tellUser(aviso);', f.indexOf('psdWarningsNote(', f.indexOf('import { importPsd') + 40));
      expect(rodape, arquivo).toBeGreaterThan(0);
      expect(rodape, arquivo).toBeLessThan(janela);
    }
  });
});
