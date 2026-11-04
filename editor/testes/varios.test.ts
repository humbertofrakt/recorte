/**
 * Vários — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `fase6`, `lote8-montar`, `lote37-duplicar`.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Doc } from '../src/doc/document.js';
import { createEmptyFile } from '../src/doc/new-file.js';
import { addImportedItems, hasImportedImages, importedItems, importedStock, restoreImportedStock, setImportedAtlas } from '../src/io/import-images.js';
import type { ImportedAtlas } from '../src/io/import-images.js';
import { renameClashingLayers } from '../src/io/import-psd.js';
import { CLOSED_PANELS, DOCK_PANELS } from '../src/ui/shell.js';
import { fileMenu, flatEntries } from '../src/ui/menus.js';
import type { PackerItem } from '../../ferramentas/src/atlas/packer.js';
import type { PsdDocument, PsdLayer } from '../../ferramentas/src/importar/psd.js';
import { loadSkeletonData, Skeleton, loadAnimationsFor } from '../../runtime/src/index.js';
import type { BoneFile, AtlasData, AtlasPageData, SkeletonData } from '../../runtime/src/index.js';
import { emptySelection } from '../src/contract.js';
import type { Selection, Command, EditorDoc } from '../src/contract.js';
import { RenameMany, invertSelection, renameMany } from '../src/panels/tree-model.js';
import { CreateBoneForSlots, RedrawBone, describeBone, redrawPlan } from '../src/viewport/tools/create-bone.js';
import { nudgeFor, nudgeSelection } from '../src/viewport/tools/select.js';
import { resetToSetup } from '../src/anim/pose-mode.js';
import { isKeyed, valueAt } from '../src/anim/keying.js';
import { Duplicate, duplicateTargets, runDuplicate } from '../src/doc/duplicate.js';
import { setupWorldMatrices } from '../src/doc/reparent.js';

// ---------------------------------------------------------------------------
// fase 6 — era `fase6.test.ts`
// ---------------------------------------------------------------------------

describe('fase 6', () => {
/**
 * Fase 6 — o que foi ligado no fim, e o que ficou combinado entre os módulos.
 *
 * Tudo aqui é puro: o projeto não tem jsdom, então nada monta uma tela. O que
 * precisa de DOM (a janela de pergunta, o painel Prévia desenhando) foi
 * conferido no navegador e está anotado no ESTADO.md.
 */
const AQUI = resolve(__dirname, '..', 'src');

function novoDoc(): Doc {
  return new Doc(createEmptyFile());
}

function item(nome: string, largura = 4, altura = 4): PackerItem {
  return {
    name: nome,
    width: largura,
    height: altura,
    pixels: new Uint8Array(largura * altura * 4).fill(255),
  };
}

function camada(nome: string): PsdLayer {
  return {
    name: nome,
    folder: '',
    leaf: nome,
    x: 0,
    y: 0,
    width: 2,
    height: 2,
    pixels: new Uint8Array(16),
    opacity: 1,
    visible: true,
    blendMode: 'norm',
    hasMask: false,
  };
}

function psdCom(...nomes: string[]): PsdDocument {
  return {
    width: 10, height: 10, channels: 4, depth: 8, colorMode: 3, psb: false,
    // Degrau 8: todo PSD lido traz as guias, ainda que vazias — sem guia, o
    // arquivo entra pelo meio da tela, como sempre entrou.
    layers: nomes.map(camada), guides: { vertical: [], horizontal: [] }, warnings: [],
  };
}

// ---------------------------------------------------------------------------
// Um atlas só por documento (pedido do lote do PSD)
// ---------------------------------------------------------------------------

describe('o acervo de imagens é um só, e o PSD entra nele', () => {
  it('addImportedItems põe itens no acervo e importedItems devolve todos', () => {
    const doc = novoDoc();
    expect(importedItems(doc)).toEqual([]);
    expect(hasImportedImages(doc)).toBe(false);

    addImportedItems(doc, [item('cabeca'), item('corpo')]);
    expect(importedItems(doc).map((i) => i.name)).toEqual(['cabeca', 'corpo']);
    expect(hasImportedImages(doc)).toBe(true);
  });

  it('um item de mesmo nome substitui o anterior, sem duplicar a região', () => {
    const doc = novoDoc();
    addImportedItems(doc, [item('mao', 4, 4)]);
    addImportedItems(doc, [item('mao', 8, 8)]);
    const itens = importedItems(doc);
    expect(itens).toHaveLength(1);
    expect(itens[0].width).toBe(8);
  });

  it('importedStock e restoreImportedStock desfazem uma importação inteira', () => {
    const doc = novoDoc();
    addImportedItems(doc, [item('braco')]);
    const antes = importedStock(doc);

    addImportedItems(doc, [item('perna'), item('pe')]);
    expect(importedItems(doc)).toHaveLength(3);

    restoreImportedStock(doc, antes);
    expect(importedItems(doc).map((i) => i.name)).toEqual(['braco']);
  });

  it('o acervo de um documento não vaza para outro', () => {
    const a = novoDoc();
    const b = novoDoc();
    addImportedItems(a, [item('so-do-a')]);
    expect(importedItems(b)).toEqual([]);
  });

  it('setImportedAtlas registra o atlas empacotado por outro importador', () => {
    const doc = novoDoc();
    const falso = {
      fileName: 'psd.atlas.json',
      packed: { atlas: {}, pages: [], regions: [], scale: 1, usage: 1 },
      data: {},
      images: new Map(),
      options: {},
    } as unknown as ImportedAtlas;
    setImportedAtlas(doc, falso);
    // `atlasFileText` lê o mesmo lugar: é assim que o PSD passa a ser salvo.
    const texto = readFileSync(resolve(AQUI, 'io/import-images.ts'), 'utf8');
    expect(texto).toContain('export function setImportedAtlas');
    expect(importedStock(doc).current).toBe(falso);
  });
});

// ---------------------------------------------------------------------------
// Nome de camada que bate com um desenho que já existe
// ---------------------------------------------------------------------------

describe('camada do PSD com nome já usado', () => {
  it('renomeia a camada e devolve um aviso em português', () => {
    const psd = psdCom('corpo', 'cabeca');
    const avisos = renameClashingLayers(psd, ['corpo']);

    expect(psd.layers[0].name).toBe('corpo2');
    expect(psd.layers[0].leaf).toBe('corpo2');
    expect(psd.layers[1].name).toBe('cabeca');
    expect(avisos).toHaveLength(1);
    expect(avisos[0]).toContain('"corpo"');
    expect(avisos[0]).toContain('"corpo2"');
  });

  it('duas camadas de mesmo nome dentro do próprio PSD também são separadas', () => {
    const psd = psdCom('mao', 'mao');
    const avisos = renameClashingLayers(psd, []);
    expect(psd.layers.map((c) => c.name)).toEqual(['mao', 'mao2']);
    expect(avisos).toHaveLength(1);
  });

  it('sem choque nenhum, nada é renomeado e nenhum aviso sai', () => {
    const psd = psdCom('corpo', 'cabeca');
    expect(renameClashingLayers(psd, ['perna'])).toEqual([]);
    expect(psd.layers.map((c) => c.name)).toEqual(['corpo', 'cabeca']);
  });
});

// ---------------------------------------------------------------------------
// A ligação da concha
// ---------------------------------------------------------------------------

describe('a coluna da direita e o menu Arquivo', () => {
  it('nada mais nasce dobrado: a coluna virou dois grupos de abas', () => {
    // Até o lote 11 eram ['malha', 'exibicao', 'previa']. No lote 12 (item 19)
    // a coluna virou dois grupos de ABAS: numa tira de abas só uma aparece por
    // vez, e ela leva a altura inteira do grupo. Dobrar era a resposta certa
    // para o problema errado — o que faltava era altura, não esconderijo.
    expect(CLOSED_PANELS).toEqual([]);
  });

  it('a Linha do tempo e as Curvas ficam na tira de baixo', () => {
    // A Prévia entrou aqui no lote 12 (item 30), com o argumento de que ela é
    // sobre TEMPO. O Humberto olhou e discordou (anotação 5, lote 25): ela é
    // uma janelinha do personagem, e voltou para a coluna da direita.
    expect(DOCK_PANELS).toEqual(['linha-do-tempo', 'curvas']);
  });

  it('o menu Arquivo tem "Importar ▸ PSD…", ligado', () => {
    const entrada = flatEntries(fileMenu()).find((e) => e.action === 'importar-psd');
    expect(entrada?.label).toBe('PSD…');
    expect(entrada?.enabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Nenhuma janela do navegador no lugar de uma janela do editor
// ---------------------------------------------------------------------------

describe('as perguntas usam a janela do editor', () => {
  it('dialog.ts tem askUser, com o rótulo escrito em cada botão', () => {
    const texto = readFileSync(resolve(AQUI, 'ui/dialog.ts'), 'utf8');
    expect(texto).toContain('export function askUser');
    expect(texto).toContain('yesLabel');
    expect(texto).toContain('noLabel');
  });

  it('a Linha do tempo não chama window.confirm para trocar os lados', () => {
    // Lote A5b: a linha do tempo mora em quatro arquivos; lê os quatro.
    const texto = ['dopesheet', 'dopesheet-player', 'dopesheet-edit', 'dopesheet-pointer']
      .map((nome) => readFileSync(resolve(AQUI, `panels/${nome}.ts`), 'utf8')).join('\n');
    expect(texto).not.toContain('window.confirm');
    expect(texto).toContain('askUser(');
    expect(texto).toContain('Trocar os lados');
  });

  it('nenhum arquivo do editor usa window.confirm', () => {
    const arquivos = [
      'panels/dopesheet.ts', 'panels/graph.ts', 'panels/tree.ts',
      'panels/properties.ts', 'panels/animations.ts', 'panels/mesh-panel.ts',
      'panels/view-panel.ts', 'panels/preview.ts', 'io/import-psd.ts',
    ];
    for (const nome of arquivos) {
      const texto = readFileSync(resolve(AQUI, nome), 'utf8');
      expect(`${nome}: ${texto.includes('window.confirm')}`).toBe(`${nome}: false`);
    }
  });
});

// ---------------------------------------------------------------------------
// A janela não rola: cada painel rola dentro de si
// ---------------------------------------------------------------------------

describe('a página inteira não rola', () => {
  it('o estilo da concha prende html e body', () => {
    const css = readFileSync(resolve(AQUI, 'ui/shell.css'), 'utf8');
    const bloco = css.slice(css.indexOf('html,'), css.indexOf('html,') + 700);
    expect(bloco).toContain('overflow: hidden');
  });

  it('a concha é presa na janela, e não só alta como ela', () => {
    // `overflow: hidden` segura a roda do mouse mas não segura
    // `scrollIntoView`, que rola a página por script. Presa, não há para onde.
    const css = readFileSync(resolve(AQUI, 'ui/shell.css'), 'utf8');
    const inicio = css.indexOf('.shell {');
    const bloco = css.slice(inicio, css.indexOf('}', inicio));
    expect(bloco).toContain('position: fixed');
    expect(bloco).toContain('inset: 0');
  });
});

// ---------------------------------------------------------------------------
// Todo estilo de painel entra pelo main.ts, antes da primeira pintura
// ---------------------------------------------------------------------------

describe('os estilos dos painéis', () => {
  it('os seis CSS de painel são importados no main.ts', () => {
    const texto = readFileSync(resolve(AQUI, 'main.ts'), 'utf8');
    for (const folha of [
      'panels.css', 'mesh-panel.css', 'view-panel.css',
      'dopesheet.css', 'graph.css', 'preview.css',
    ]) {
      expect(texto).toContain(`./panels/${folha}`);
    }
  });

  it('o painel Prévia não importa mais a própria folha', () => {
    const texto = readFileSync(resolve(AQUI, 'panels/preview.ts'), 'utf8');
    expect(texto).not.toContain("import './preview.css'");
  });
});
});

// ---------------------------------------------------------------------------
// montar (lote 8) — era `lote8-montar.test.ts`
// ---------------------------------------------------------------------------

describe('montar (lote 8)', () => {
/**
 * Lote 8 (v2.5): montar mais rápido.
 *
 * Sem DOM. Sete itens, e o que se prova de cada um é a conta: o osso que nasce
 * já preso, o osso redesenhado com os filhos parados, a volta à pose de
 * repouso, a troca de nomes em bloco, o passo de 1 px e a inversão da seleção.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

/**
 *   root
 *   +-- braco    em (200, 0), comprimento 40
 *   |   +-- mao  em (40, 0) dentro do braço: no mundo, (240, 0)
 *   +-- solto    em (0, 100)
 *
 * Slot `desenho` no `solto`.
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 },
      { name: 'mao', parent: 'braco', x: 40, y: 0 },
      { name: 'solto', parent: 'root', x: 0, y: 100 },
    ],
    slots: [{ name: 'desenho', bone: 'solto', attachment: 'desenho' }],
    skins: [{
      name: 'default',
      attachments: { desenho: { desenho: { type: 'region', path: 'x', width: 30, height: 30 } } },
    }],
  } as BoneFile;
}

function testDoc(): Doc {
  const doc = new Doc(testFile());
  doc.rebuild();
  return doc;
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

function posed(file: BoneFile): Skeleton {
  const skeleton = new Skeleton(loadSkeletonData(JSON.parse(JSON.stringify(file)) as unknown));
  skeleton.updateWorldTransform();
  return skeleton;
}

function pick(patch: Partial<Selection>): Selection {
  return { ...emptySelection(), ...patch };
}

/** Onde um osso está no mundo, depois de posar. */
function worldOf(file: BoneFile, name: string): { x: number; y: number } {
  const bone = posed(file).findBone(name);
  return { x: bone?.worldX ?? NaN, y: bone?.worldY ?? NaN };
}

// ---------------------------------------------------------------------------
// Item 66 — osso já preso à imagem
// ---------------------------------------------------------------------------

describe('criar o osso já preso ao desenho', () => {
  it('cria o osso E troca o slot, num passo de desfazer só', () => {
    const doc = testDoc();
    const antes = texto(doc);
    const def = describeBone(
      posed(doc.file), 'root', doc.file.bones.map((b) => b.name), 0, 0, 50, 0, 1,
    );
    doc.run(new CreateBoneForSlots(def, ['desenho']));

    expect(doc.file.bones.some((b) => b.name === def.name)).toBe(true);
    expect((doc.file.slots ?? [])[0].bone).toBe(def.name);

    // UM Ctrl+Z devolve os dois: um osso criado com o slot ainda no osso velho
    // é um estado que ninguém pediu.
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('mais de um desenho escolhido: todos passam para o osso novo', () => {
    const doc = testDoc();
    (doc.file.slots ?? []).push({ name: 'outro', bone: 'braco', attachment: 'desenho' });
    const def = describeBone(
      posed(doc.file), 'root', doc.file.bones.map((b) => b.name), 0, 0, 50, 0, 1,
    );
    doc.run(new CreateBoneForSlots(def, ['desenho', 'outro']));
    expect((doc.file.slots ?? []).map((s) => s.bone)).toEqual([def.name, def.name]);
  });

  it('um slot que não existe é ignorado, e não estoura', () => {
    const doc = testDoc();
    const def = describeBone(
      posed(doc.file), 'root', doc.file.bones.map((b) => b.name), 0, 0, 50, 0, 1,
    );
    expect(() => doc.run(new CreateBoneForSlots(def, ['nao-existe']))).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Item 67 — redesenhar o osso
// ---------------------------------------------------------------------------

describe('redesenhar o osso', () => {
  it('refaz posição, ângulo e comprimento a partir do arrasto', () => {
    const doc = testDoc();
    // Arrasta de (200, 0) até (200, 60): o braço passa a apontar para cima.
    const plan = redrawPlan(posed(doc.file), 'braco', 200, 0, 200, 60, 1);
    expect(plan).not.toBeNull();
    expect(plan?.next.length).toBeCloseTo(60, 3);
    expect(plan?.next.rotation).toBeCloseTo(90, 3);
    expect(plan?.next.x).toBeCloseTo(200, 3);
  });

  it('o FILHO fica no mesmo lugar do mundo', () => {
    const doc = testDoc();
    // `mao` está em (240, 0) no mundo antes de qualquer coisa.
    const antes = worldOf(doc.file, 'mao');
    expect(antes.x).toBeCloseTo(240, 6);

    const plan = redrawPlan(posed(doc.file), 'braco', 200, 0, 200, 60, 1);
    doc.run(new RedrawBone('braco', plan!.next, plan!.children));

    const depois = worldOf(doc.file, 'mao');
    expect(depois.x).toBeCloseTo(antes.x, 6);
    expect(depois.y).toBeCloseTo(antes.y, 6);
  });

  it('desfazer devolve o arquivo letra por letra, pai e filhos', () => {
    const doc = testDoc();
    const antes = texto(doc);
    const plan = redrawPlan(posed(doc.file), 'braco', 200, 0, 120, 90, 1);
    doc.run(new RedrawBone('braco', plan!.next, plan!.children));
    expect(texto(doc)).not.toBe(antes);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('arrasto curto tira o comprimento em vez de deixar um osso de 0,2', () => {
    const doc = testDoc();
    const plan = redrawPlan(posed(doc.file), 'braco', 200, 0, 200.1, 0, 5);
    expect(plan?.next.length).toBeUndefined();
    expect(plan?.next.rotation).toBeUndefined();
  });

  it('um osso que não existe não dá plano', () => {
    expect(redrawPlan(posed(testFile()), 'nao-existe', 0, 0, 10, 0, 1)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Item 72 — voltar à pose de repouso
// ---------------------------------------------------------------------------

describe('voltar à pose de repouso', () => {
  it('em Montagem não faz nada: a pose de repouso já é esta', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    doc.animation = null;
    expect(resetToSetup(doc, ['hips'])).toBe(0);
  });

  it('em Animando grava a chave com o valor da MONTAGEM', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    doc.animation = 'walk';
    doc.time = 0.5;
    const setup = (doc.file.bones ?? []).find((b) => b.name === 'hips');
    const rotacaoDeRepouso = setup?.rotation ?? 0;

    const quantos = resetToSetup(doc, ['hips']);
    expect(quantos).toBeGreaterThan(0);

    const alvo = { type: 'bone' as const, target: 'hips', property: 'rotation' };
    expect(isKeyed(doc.file, 'walk', 0.5, alvo)).toBe(true);
    expect(valueAt(doc.file, 'walk', 0.5, alvo)).toBeCloseTo(rotacaoDeRepouso, 6);
  });

  it('desfazer devolve o arquivo', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    doc.animation = 'walk';
    doc.time = 0.5;
    const antes = texto(doc);
    resetToSetup(doc, ['hips', 'torso']);
    expect(texto(doc)).not.toBe(antes);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('sem osso nenhum, nada acontece', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    doc.animation = 'walk';
    expect(resetToSetup(doc, [])).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Item 73 — substituir nomes
// ---------------------------------------------------------------------------

describe('substituir nomes', () => {
  it('troca o pedaço em ossos, slots e regras', () => {
    const file = testFile();
    const plan = renameMany(file, 'braco', 'brazo');
    expect(plan.renomeados.map((r) => `${r.from}→${r.to}`)).toEqual(['braco→brazo']);
    expect(plan.pulados).toEqual([]);
  });

  it('no herói, trocar `_b` por `_tras` pega todos os de trás', () => {
    const file = JSON.parse(RAW) as BoneFile;
    const plan = renameMany(file, '_b', '_tras');
    expect(plan.renomeados.length).toBeGreaterThan(3);
    for (const item of plan.renomeados) {
      expect(item.from).toContain('_b');
      expect(item.to).toContain('_tras');
    }
  });

  it('um nome que colidiria é PULADO, com o motivo escrito', () => {
    const file = testFile();
    // `solto` → `braco`, e `braco` já existe.
    const plan = renameMany(file, 'solto', 'braco');
    expect(plan.renomeados).toEqual([]);
    expect(plan.pulados).toHaveLength(1);
    expect(plan.pulados[0].porque).toContain('já existe');
  });

  it('um nome que ficaria vazio é pulado', () => {
    const file = testFile();
    const plan = renameMany(file, 'braco', '');
    expect(plan.pulados.some((p) => p.porque.includes('vazio'))).toBe(true);
  });

  it('o comando aplica tudo num passo, e desfazer devolve', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    const antes = texto(doc);
    const plan = renameMany(doc.file, '_b', '_tras');
    const command = new RenameMany(plan);
    doc.run(command);

    expect(command.count).toBe(plan.renomeados.length);
    expect(texto(doc)).not.toBe(antes);
    // As chaves também foram junto: o texto novo não pode ter sobrado um `_b`
    // solto onde havia um osso.
    for (const item of plan.renomeados) {
      expect(doc.file.bones.some((b) => b.name === item.from)).toBe(false);
    }

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('um pedaço que ninguém tem não muda nada', () => {
    const file = testFile();
    expect(renameMany(file, 'zzz', 'yyy').renomeados).toEqual([]);
  });

  it('trocar por vazio o pedaço inteiro é pulado, não apaga o nome', () => {
    const file = testFile();
    const plan = renameMany(file, '', 'x');
    expect(plan.renomeados).toEqual([]);
    expect(plan.pulados).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Item 53 — as setas andam 1 px
// ---------------------------------------------------------------------------

describe('as setas', () => {
  it('cada uma anda para o seu lado, e Y aponta para cima', () => {
    expect(nudgeFor('ArrowLeft', false)).toEqual({ dx: -1, dy: 0 });
    expect(nudgeFor('ArrowRight', false)).toEqual({ dx: 1, dy: 0 });
    expect(nudgeFor('ArrowUp', false)).toEqual({ dx: 0, dy: 1 });
    expect(nudgeFor('ArrowDown', false)).toEqual({ dx: 0, dy: -1 });
  });

  it('com Shift, dez de uma vez', () => {
    expect(nudgeFor('ArrowRight', true)).toEqual({ dx: 10, dy: 0 });
  });

  it('outra tecla não é seta', () => {
    expect(nudgeFor('k', false)).toBeNull();
    expect(nudgeFor('Home', false)).toBeNull();
  });

  it('anda com o osso escolhido, no espaço do pai', () => {
    const doc = testDoc();
    doc.select(pick({ bones: ['solto'] }));
    const antes = (doc.file.bones.find((b) => b.name === 'solto')?.x ?? 0);
    expect(nudgeSelection(doc, 1, 0)).toBe(1);
    expect(doc.file.bones.find((b) => b.name === 'solto')?.x).toBeCloseTo(antes + 1, 6);
  });

  it('sem nada escolhido, não anda nada', () => {
    const doc = testDoc();
    doc.select(emptySelection());
    expect(nudgeSelection(doc, 1, 0)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Item 56 — inverter a seleção
// ---------------------------------------------------------------------------

describe('inverter a seleção', () => {
  const tudoVale = { bone: () => true, slot: () => true };

  it('devolve tudo menos o que estava escolhido', () => {
    const file = testFile();
    const out = invertSelection(file, pick({ bones: ['braco'] }), tudoVale);
    expect(out.bones).toEqual(['root', 'mao', 'solto']);
    expect(out.slots).toEqual(['desenho']);
  });

  it('travado e escondido ficam de fora: não dá para mexer neles', () => {
    const file = testFile();
    const out = invertSelection(file, pick({ bones: ['braco'] }), {
      bone: (name) => name !== 'mao',
      slot: () => false,
    });
    expect(out.bones).toEqual(['root', 'solto']);
    expect(out.slots).toEqual([]);
  });

  it('um desenho escolhido tira o SLOT dele da inversão', () => {
    const file = testFile();
    const out = invertSelection(file, pick({
      attachments: [{ slot: 'desenho', attachment: 'desenho' }],
    }), tudoVale);
    expect(out.slots).toEqual([]);
  });

  it('sem nada escolhido, escolhe tudo', () => {
    const file = testFile();
    const out = invertSelection(file, emptySelection(), tudoVale);
    expect(out.bones).toHaveLength(4);
    expect(out.slots).toHaveLength(1);
  });
});
});

// ---------------------------------------------------------------------------
// duplicar (lote 37) — era `lote37-duplicar.test.ts`
// ---------------------------------------------------------------------------

describe('duplicar (lote 37)', () => {
/**
 * Lote 37 — anotação 26: Duplicar.
 *
 * `Copiar` e `Colar` ficavam cinzas com um osso escolhido — eles são só de
 * chaves —, e `Duplicar` só existia para animação e para pele. Montar a metade
 * de trás de um personagem era refazer braço, antebraço e mão à mão.
 *
 * Sem DOM: o comando é do documento.
 */
const HEROI = resolve(__dirname, '..', '..', 'formato', 'exemplos', 'heroi.bone');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(HEROI, 'utf8')) as BoneFile;
}

class TestDoc implements EditorDoc {
  file: BoneFile;
  path: string | null = null;
  dirty = false;
  atlases: readonly AtlasData[] = [];
  selection: Selection = emptySelection();
  time = 0;
  animation: string | null = null;
  warnings: readonly string[] = [];
  visibleSkins: string[] = [];
  notices: string[] = [];

  private skeletonData: SkeletonData | null = null;
  private instance: Skeleton | null = null;
  private done: Command[] = [];

  constructor(file: BoneFile) {
    this.file = file;
    this.rebuild();
  }

  get data(): SkeletonData | null { return this.skeletonData; }
  get skeleton(): Skeleton | null { return this.instance; }
  imageFor(_page: AtlasPageData): CanvasImageSource | null { return null; }
  select(selection: Selection): void { this.selection = selection; }
  notice(text: string): void { this.notices.push(text); }

  run(command: Command): void {
    command.apply(this);
    this.done.push(command);
    this.dirty = true;
    this.rebuild();
  }
  undo(): void {
    const command = this.done.pop();
    if (command === undefined) return;
    command.revert(this);
    this.rebuild();
  }
  redo(): void {}
  get canUndo(): boolean { return this.done.length > 0; }
  get canRedo(): boolean { return false; }
  get undoLabel(): string | null { return this.done[this.done.length - 1]?.label ?? null; }
  get redoLabel(): string | null { return null; }
  get undoCount(): number { return this.done.length; }

  rebuild(): void {
    this.skeletonData = loadSkeletonData(this.file);
    this.instance = new Skeleton(this.skeletonData);
    this.instance.updateWorldTransform(this.time);
  }
  rebuildAnimations(): void {
    const data = this.skeletonData;
    if (data === null) { this.rebuild(); return; }
    data.replaceAnimations(loadAnimationsFor(data, this.file).animations);
    this.repose();
  }
  repose(): void { this.instance?.updateWorldTransform(this.time); }
  on(): () => void { return () => {}; }
}

const soOsso = (nome: string): Selection => ({ ...emptySelection(), bones: [nome] });

describe('o que uma seleção duplica', () => {
  it('um osso leva os filhos e os desenhos de todos eles', () => {
    const file = heroi();
    const alvos = duplicateTargets(file, soOsso('arm'));
    // `arm` tem um filho, `forearm`; e quatro slots pendem do antebraço.
    expect(alvos.bones).toEqual(['arm', 'forearm']);
    expect(alvos.slots).toEqual(['arm', 'forearm', 'sword_blade', 'weapon', 'hand', 'hand_point']);
  });

  it('as regras que falam do que vai ser duplicado ficam de fora, nomeadas', () => {
    const file = heroi();
    // `ik_arm` puxa a cadeia arm/forearm: duplicá-la às cegas faria duas
    // regras puxarem o mesmo alvo.
    expect(duplicateTargets(file, soOsso('arm')).constraints).toEqual(['ik_arm']);
    expect(duplicateTargets(file, soOsso('cape1')).constraints).toEqual(['cape_follow']);
    expect(duplicateTargets(file, soOsso('shin')).constraints).toEqual([]);
  });

  it('a RAIZ nunca duplica: um arquivo tem um chão só', () => {
    const file = heroi();
    const alvos = duplicateTargets(file, soOsso('root'));
    expect(alvos.bones).toEqual([]);
    expect(new Duplicate(file, soOsso('root')).hasWork).toBe(false);
  });

  it('um desenho escolhido duplica o slot dele, e nenhum osso', () => {
    const file = heroi();
    const alvos = duplicateTargets(file, {
      ...emptySelection(), attachments: [{ slot: 'body', attachment: 'body' }],
    });
    expect(alvos.bones).toEqual([]);
    expect(alvos.slots).toEqual(['body']);
  });
});

describe('duplicar no herói', () => {
  it('o membro inteiro nasce com nomes novos, e o filho pende do pai novo', () => {
    const doc = new TestDoc(heroi());
    doc.select(soOsso('arm'));

    expect(runDuplicate(doc)).toBe(true);

    const nomes = doc.file.bones.map((bone) => bone.name);
    expect(nomes).toContain('arm_2');
    expect(nomes).toContain('forearm_2');
    // O filho novo pende do pai novo, e não do original.
    expect(doc.file.bones.find((b) => b.name === 'forearm_2')?.parent).toBe('arm_2');
    expect(doc.file.bones.find((b) => b.name === 'arm_2')?.parent).toBe('torso');
  });

  it('a cópia nasce 20 px à direita, no mundo, e igual em tudo o mais', () => {
    // `leg` de propósito: o `arm` do herói é puxado pela regra `ik_arm`, e a
    // cópia não tem regra nenhuma — comparar os dois mundos mediria a regra,
    // e não o deslocamento.
    const doc = new TestDoc(heroi());
    const antesMundo = setupWorldMatrices(doc.file)!.get('leg')!;
    doc.select(soOsso('leg'));
    runDuplicate(doc);

    const depois = setupWorldMatrices(doc.file)!.get('leg_2')!;
    expect(Math.abs(depois.worldX - (antesMundo.worldX + 20))).toBeLessThan(1e-6);
    expect(Math.abs(depois.worldY - antesMundo.worldY)).toBeLessThan(1e-6);
    // Só o lugar muda: giro e escala saem idênticos.
    for (const chave of ['a', 'b', 'c', 'd'] as const) {
      expect(Math.abs(depois[chave] - antesMundo[chave]), chave).toBeLessThan(1e-9);
    }
    // E os filhos vão junto, mantendo a distância.
    const filhoAntes = setupWorldMatrices(new TestDoc(heroi()).file)!.get('shin')!;
    const filhoDepois = setupWorldMatrices(doc.file)!.get('shin_2')!;
    expect(Math.abs(filhoDepois.worldX - (filhoAntes.worldX + 20))).toBeLessThan(1e-6);
  });

  it('os slots novos vêm com os desenhos, e ficam vizinhos dos originais', () => {
    const doc = new TestDoc(heroi());
    doc.select(soOsso('arm'));
    runDuplicate(doc);

    const slots = (doc.file.slots ?? []).map((slot) => slot.name);
    expect(slots).toContain('arm_2');
    expect(slots).toContain('hand_2');
    // Vizinho: a cópia entra logo depois do original na ordem de desenho.
    expect(slots.indexOf('arm_2')).toBe(slots.indexOf('arm') + 1);
    // O slot novo pende do osso novo.
    expect(doc.file.slots?.find((s) => s.name === 'hand_2')?.bone).toBe('forearm_2');
    // E o desenho veio junto, com o mesmo nome de anexo (a chave é o slot).
    const pele = doc.file.skins?.[0]?.attachments;
    expect(pele?.['arm_2']).toBeDefined();
    expect(Object.keys(pele?.['arm_2'] ?? {})).toEqual(Object.keys(pele?.['arm'] ?? {}));
  });

  it('a regra continua apontando para o ORIGINAL, e a tela diz isso', () => {
    const doc = new TestDoc(heroi());
    doc.select(soOsso('arm'));
    runDuplicate(doc);
    const regra = doc.file.constraints?.find((c) => c.name === 'ik_arm') as
      { bones?: string[] } | undefined;
    expect(regra?.bones).toEqual(['arm', 'forearm']);
    // Nenhuma regra nova nasceu.
    expect(doc.file.constraints?.filter((c) => c.name.endsWith('_2'))).toEqual([]);
    expect(doc.notices.at(-1)).toContain('ik_arm');
    expect(doc.notices.at(-1)).toContain('20 px à direita');
  });

  it('o que nasceu fica escolhido', () => {
    const doc = new TestDoc(heroi());
    doc.select(soOsso('arm'));
    runDuplicate(doc);
    expect(doc.selection.bones).toEqual(['arm_2', 'forearm_2']);
    expect(doc.selection.slots).toContain('hand_2');
  });

  it('duplicar duas vezes dá _2 e _3, e nunca dois nomes iguais', () => {
    const doc = new TestDoc(heroi());
    doc.select(soOsso('arm'));
    runDuplicate(doc);
    doc.select(soOsso('arm'));
    runDuplicate(doc);
    const nomes = doc.file.bones.map((b) => b.name);
    // O sufixo é TROCADO, e não empilhado: `arm_2`, `arm_3`, e nunca
    // `arm_2_2`, que ninguém lê.
    expect(nomes).toContain('arm_2');
    expect(nomes).toContain('arm_3');
    expect(new Set(nomes).size).toBe(nomes.length);
    const slots = (doc.file.slots ?? []).map((s) => s.name);
    expect(new Set(slots).size).toBe(slots.length);
  });

  it('um passo de desfazer devolve o arquivo IGUAL, texto contra texto', () => {
    const doc = new TestDoc(heroi());
    const antes = JSON.stringify(doc.file);
    doc.select(soOsso('arm'));
    runDuplicate(doc);
    expect(doc.undoCount).toBe(1);
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('o arquivo continua carregando: pai antes de filho, e sem aviso', () => {
    const doc = new TestDoc(heroi());
    doc.select(soOsso('arm'));
    runDuplicate(doc);
    const ordem = doc.file.bones.map((b) => b.name);
    for (const bone of doc.file.bones) {
      if (bone.parent === undefined) continue;
      expect(ordem.indexOf(bone.parent), bone.name).toBeLessThan(ordem.indexOf(bone.name));
    }
    expect(doc.data?.warnings ?? []).toEqual([]);
  });

  it('sem nada escolhido, ele não faz nada e diz o que fazer', () => {
    const doc = new TestDoc(heroi());
    expect(runDuplicate(doc)).toBe(false);
    expect(doc.undoCount).toBe(0);
    expect(doc.notices.at(-1)).toContain('Escolha um osso');
  });
});
});
