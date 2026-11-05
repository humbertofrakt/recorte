/**
 * Ferramentas da cena — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote5-ponto-e-caixa`, `lote6-mascara-e-desenho`, `lote47-transformar`.
 */

import { describe, expect, it } from 'vitest';
import { Skeleton, applyAnimation, loadAtlas, loadSkeletonData } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { AddBoundingBox, AddPointAttachment, boxVertices, AddClipping, DEFAULT_MASK_SIZE } from '../src/panels/tree-model.js';
import { pointWorld } from '../src/viewport/tools/point-tool.js';
import { buildPoseDump } from '../../ferramentas/src/conformidade/pose-dump.js';
import { attachmentFields, buildProperties, silhouetteSources, writeFieldValue, type FieldDef } from '../src/panels/properties-model.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { emptySelection, getTool, getTools } from '../src/contract.js';
import { toolOfKey } from '../src/viewport/tools/registry.js';
import { TOOL_KEYS } from '../src/ui/keys.js';
import type { Selection, Tool, ToolEvent } from '../src/contract.js';
import { DEFAULT_VIEW, currentLocks, parseViewSettings, resetViewSettings } from '../src/viewport/onion.js';
import { ownBoneBirthPoint, pickedAttachment, pickedFor, worldDeltaToBone, writeAttachmentValues } from '../src/viewport/tools/attachment-edit.js';
import { boxFromCorners, cursorForHandle, transformBox, transformHit } from '../src/viewport/transform-box.js';
import type { Point } from '../src/viewport/transform-box.js';
import { axisOfHandle, shearAxisOfHandle, transformTool } from '../src/viewport/tools/transform-tool.js';
import { draggedBones, topLevelBones, translateTool } from '../src/viewport/tools/translate.js';
import { rotateTool } from '../src/viewport/tools/rotate.js';
import { scaleTool } from '../src/viewport/tools/scale.js';
import { shearTool } from '../src/viewport/tools/shear.js';
import { SCALE_HANDLES } from '../src/viewport/transform-box.js';
import { selectTool, setProperties } from '../src/viewport/tools/select.js';
import { nudgeDrawings, selectedDrawings } from '../src/viewport/tools/drawing-group.js';
import { START_TOOL, TOOL_ORDER, toolShortcutRows, toolbarItems } from '../src/ui/toolbar-model.js';
import { getActiveToolId } from '../src/viewport/viewport.js';
import { CreateOwnBones, clickKeepsBone, clickKeepsBoneNotice, isOwnBone, ownBoneRefusal } from '../src/doc/own-bone.js';
import { hierarchyRows } from '../src/panels/tree-rows.js';
import { emitterPlace as emitterPlaceR15 } from '../src/viewport/particles-view.js';
import { runReparent as runReparentR15 } from '../src/doc/reparent.js';
import { placementFor as placementForR15 } from '../src/panels/particle-presets.js';
import { dopesheetGroups } from '../src/anim/keying.js';
import { NO_LOCKS, pickAll, selectionFor } from '../src/viewport/picking.js';
import { quickFields, quickSubject, readQuickNow, writeQuickValue } from '../src/panels/quick-model.js';
import { DeleteItems } from '../src/panels/tree-commands.js';
import { Duplicate } from '../src/doc/duplicate.js';
import { Reparent } from '../src/doc/reparent.js';
import { moveFooter, nudgeLabel, rotateFooter, scaleFooter, shearFooter } from '../src/viewport/tools/gesture-footer.js';
import { SHEAR_HOVER_NOTICE, transformCursor } from '../src/viewport/tools/transform-tool.js';
import { toolFooter } from '../src/ui/toolbar-model.js';
import * as escala from '../src/viewport/tools/scale.js';
import * as caixaDoOsso from '../src/viewport/tools/transform-tool.js';
import * as palavras from '../src/viewport/tools/creation-words.js';
import * as regua from '../src/viewport/rulers.js';
import * as zoomModelo from '../src/viewport/zoom-model.js';
import * as espaco from '../src/viewport/space-gesture.js';
import { describeBone } from '../src/viewport/tools/create-bone.js';
import { GestureNotice } from '../src/viewport/gesture-notice.js';
import { gripOfLabel } from '../src/viewport/held-by-rule.js';
import { nudgeSelection } from '../src/viewport/tools/select.js';

// ---------------------------------------------------------------------------
// ponto e caixa (lote 5) — era `lote5-ponto-e-caixa.test.ts`
// ---------------------------------------------------------------------------

describe('ponto e caixa (lote 5)', () => {
/**
 * Lote 5 (v2.2): as ferramentas Ponto e Caixa.
 *
 * Sem DOM. O que se prova é o que vai para o arquivo e o que sai dele no
 * **mundo** — e sai pelo `pose-dump`, que é o mesmo caminho por onde a
 * conformidade confere os dois runtimes. Cada número esperado está contado à
 * mão no comentário acima da asserção.
 */
// ---------------------------------------------------------------------------
// O esqueleto pequeno do lote 0
// ---------------------------------------------------------------------------

/**
 *   root            na origem
 *   +-- braco       em (200, 0), comprimento 40, sem giro
 *   +-- girado      em (0, 100), girado 90 graus
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 },
      { name: 'girado', parent: 'root', x: 0, y: 100, rotation: 90 },
    ],
    slots: [],
    skins: [{ name: 'default', attachments: {} }],
  } as BoneFile;
}

function testDoc(): Doc {
  return new Doc(testFile());
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

/**
 * O `pose-dump` do arquivo, na pose de repouso, com os canais pedidos.
 *
 * É o MESMO caminho por onde a conformidade confere os dois runtimes: se o
 * ponto sai daqui no lugar certo, ele sai no lugar certo no jogo.
 */
function dump(file: BoneFile, canais: string[]): ReturnType<typeof buildPoseDump> {
  const data = loadSkeletonData(JSON.parse(JSON.stringify(file)) as unknown);
  return buildPoseDump(data, { times: [0], measure: canais as never });
}

/** Um `point` do dump, pelo seu `slot/anexo`. Falha claro quando não está lá. */
function pontoDoDump(
  file: BoneFile, id: string,
): { x: number; y: number; rotation: number } {
  const points = dump(file, ['points']).samples[0]?.points;
  expect(points, `o dump não trouxe o canal points`).toBeDefined();
  const found = (points as Record<string, { x: number; y: number; rotation: number }>)[id];
  expect(found, `o dump não tem o ponto ${id}`).toBeDefined();
  return found;
}

/** Os vértices de mundo de uma caixa do dump, pelo seu `slot/anexo`. */
function caixaDoDump(file: BoneFile, id: string): number[] {
  const boxes = dump(file, ['boundingBoxes']).samples[0]?.boundingBoxes;
  expect(boxes, 'o dump não trouxe o canal boundingBoxes').toBeDefined();
  const found = (boxes as Record<string, number[]>)[id];
  expect(found, `o dump não tem a caixa ${id}`).toBeDefined();
  return found;
}

// ---------------------------------------------------------------------------
// Ponto
// ---------------------------------------------------------------------------

describe('criar um ponto', () => {
  it('cria o slot E o anexo, num passo só, e desfazer devolve o arquivo', () => {
    const doc = testDoc();
    const antes = texto(doc);
    const command = new AddPointAttachment(doc.file, 'braco', [], 40, 0, 0);
    doc.run(command);

    expect(command.name).toBe('braco_ponto');
    const slot = (doc.file.slots ?? []).find((s) => s.name === 'braco_ponto');
    expect(slot?.bone).toBe('braco');
    expect(slot?.attachment).toBe('braco_ponto');
    const skin = (doc.file.skins ?? []).find((s) => s.name === 'default');
    expect(skin?.attachments?.['braco_ponto']?.['braco_ponto']).toEqual({
      type: 'point', x: 40, y: 0, rotation: 0,
    });

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('o nome não repete: dois pontos no mesmo osso viram _ponto e _ponto2', () => {
    const doc = testDoc();
    doc.run(new AddPointAttachment(doc.file, 'braco', [], 0, 0, 0));
    const segundo = new AddPointAttachment(doc.file, 'braco', [], 10, 0, 0);
    doc.run(segundo);
    expect(segundo.name).toBe('braco_ponto2');
  });

  it('nasce na pele visível, e não sempre na default', () => {
    const doc = testDoc();
    (doc.file.skins ?? []).push({ name: 'armadura', attachments: {} });
    const command = new AddPointAttachment(doc.file, 'braco', ['armadura'], 5, 6, 0);
    doc.run(command);
    expect(command.skin).toBe('armadura');
    const armadura = (doc.file.skins ?? []).find((s) => s.name === 'armadura');
    expect(armadura?.attachments?.['braco_ponto']).toBeDefined();
  });

  it('uma pele que o comando criou não sobrevive ao desfazer', () => {
    const doc = testDoc();
    const antes = texto(doc);
    doc.run(new AddPointAttachment(doc.file, 'braco', ['nao-existe'], 0, 0, 0));
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });
});

describe('onde o ponto está no mundo', () => {
  it('num osso sem giro, o mundo é a soma: `braco` em 200 mais 40 dá 240', () => {
    const doc = testDoc();
    doc.run(new AddPointAttachment(doc.file, 'braco', [], 40, 0, 0));
    const ponto = pontoDoDump(doc.file, 'braco_ponto/braco_ponto');
    expect(ponto.x).toBeCloseTo(240, 6);
    expect(ponto.y).toBeCloseTo(0, 6);
    expect(ponto.rotation).toBeCloseTo(0, 6);
  });

  it('num osso girado 90°, o x local vira y no mundo', () => {
    const doc = testDoc();
    // `girado` está em (0, 100) e girado 90°: o eixo X local aponta para cima.
    // Um ponto em (30, 0) local cai em (0, 130) no mundo, virado 90°.
    doc.run(new AddPointAttachment(doc.file, 'girado', [], 30, 0, 0));
    const ponto = pontoDoDump(doc.file, 'girado_ponto/girado_ponto');
    expect(ponto.x).toBeCloseTo(0, 6);
    expect(ponto.y).toBeCloseTo(130, 6);
    expect(ponto.rotation).toBeCloseTo(90, 6);
  });

  it('a rotação do anexo soma com a do osso', () => {
    const doc = testDoc();
    doc.run(new AddPointAttachment(doc.file, 'girado', [], 0, 0, 45));
    const ponto = pontoDoDump(doc.file, 'girado_ponto/girado_ponto');
    // 90 do osso mais 45 do anexo.
    expect(ponto.rotation).toBeCloseTo(135, 6);
  });

  it('`pointWorld` do editor dá o mesmo que o pose-dump', () => {
    const doc = testDoc();
    doc.run(new AddPointAttachment(doc.file, 'girado', [], 30, 12, 45));
    const skeleton = new Skeleton(loadSkeletonData(
      JSON.parse(JSON.stringify(doc.file)) as unknown,
    ));
    skeleton.updateWorldTransform();
    const bone = skeleton.findBone('girado');
    expect(bone).not.toBeNull();
    const meu = pointWorld(bone as never, 30, 12, 45);
    const dele = pontoDoDump(doc.file, 'girado_ponto/girado_ponto');
    expect(meu.x).toBeCloseTo(dele.x, 6);
    expect(meu.y).toBeCloseTo(dele.y, 6);
    expect(meu.rotation).toBeCloseTo(dele.rotation, 6);
  });
});

// ---------------------------------------------------------------------------
// Caixa
// ---------------------------------------------------------------------------

describe('os vértices de uma caixa', () => {
  it('saem em ordem e sem se cruzar, seja qual for o canto arrastado', () => {
    // Da esquerda de baixo para a direita de cima.
    expect(boxVertices(0, 0, 10, 20)).toEqual([0, 0, 10, 0, 10, 20, 0, 20]);
    // E o mesmo retângulo arrastado ao contrário dá os mesmos quatro cantos.
    expect(boxVertices(10, 20, 0, 0)).toEqual([0, 0, 10, 0, 10, 20, 0, 20]);
  });

  it('são quatro cantos, que é o mínimo do formato com folga', () => {
    expect(boxVertices(-5, -5, 5, 5)).toHaveLength(8);
  });
});

describe('criar uma caixa', () => {
  it('cria o slot e o anexo `boundingbox`, e desfazer devolve o arquivo', () => {
    const doc = testDoc();
    const antes = texto(doc);
    const command = new AddBoundingBox(
      doc.file, 'braco', [], boxVertices(0, -10, 40, 10),
    );
    doc.run(command);

    expect(command.name).toBe('braco_caixa');
    const def = (doc.file.skins ?? [])[0].attachments?.['braco_caixa']?.['braco_caixa'];
    expect(def).toEqual({
      type: 'boundingbox',
      shape: 'polygon',
      vertices: [0, -10, 40, -10, 40, 10, 0, 10],
    });

    doc.undo();
    expect(texto(doc)).toBe(antes);
  });

  it('o canal `boundingBoxes` traz os quatro cantos no mundo', () => {
    const doc = testDoc();
    // `braco` está em (200, 0) sem giro: os cantos locais somam 200 no x.
    doc.run(new AddBoundingBox(doc.file, 'braco', [], boxVertices(0, -10, 40, 10)));
    const caixa = caixaDoDump(doc.file, 'braco_caixa/braco_caixa');
    expect(caixa).toHaveLength(8);
    expect(caixa[0]).toBeCloseTo(200, 6);
    expect(caixa[1]).toBeCloseTo(-10, 6);
    expect(caixa[2]).toBeCloseTo(240, 6);
    expect(caixa[5]).toBeCloseTo(10, 6);
  });

  it('num osso girado 90°, a caixa vira junto', () => {
    const doc = testDoc();
    // Canto local (10, 0) no `girado`, que está em (0, 100) virado 90°:
    // o x local vai para cima, então o mundo é (0, 110).
    doc.run(new AddBoundingBox(doc.file, 'girado', [], [10, 0, 20, 0, 20, 5, 10, 5]));
    const caixa = caixaDoDump(doc.file, 'girado_caixa/girado_caixa');
    expect(caixa[0]).toBeCloseTo(0, 6);
    expect(caixa[1]).toBeCloseTo(110, 6);
  });
});

// ---------------------------------------------------------------------------
// O painel Propriedades
// ---------------------------------------------------------------------------

describe('os campos do painel', () => {
  it('um ponto tem nome, x, y e rotação — e NÃO tem "Imagem"', () => {
    const doc = testDoc();
    doc.run(new AddPointAttachment(doc.file, 'braco', [], 40, 0, 0));
    const campos = attachmentFields(doc.file, 'braco_ponto', 'braco_ponto')
      .flatMap((group) => group.fields)
      .map((field) => field.key);
    expect(campos).toContain('name');
    expect(campos).toContain('x');
    expect(campos).toContain('y');
    expect(campos).toContain('rotation');
    // Um ponto não desenha nada: um campo "Imagem" nele não mudaria coisa alguma.
    expect(campos).not.toContain('path');
  });

  it('uma caixa mostra quantos cantos tem, e não os números soltos', () => {
    const doc = testDoc();
    doc.run(new AddBoundingBox(doc.file, 'braco', [], boxVertices(0, -10, 40, 10)));
    const campo = attachmentFields(doc.file, 'braco_caixa', 'braco_caixa')
      .flatMap((group) => group.fields)
      .find((field) => field.key === 'vertices');
    expect(campo?.label).toBe('Cantos');
    expect(String(campo?.fallback)).toContain('4 cantos');
    // Só leitura: sem ponteiro, ninguém escreve dezesseis números à mão.
    expect(campo?.pointer).toBe('');
  });
});
});

// ---------------------------------------------------------------------------
// mascara e desenho (lote 6) — era `lote6-mascara-e-desenho.test.ts`
// ---------------------------------------------------------------------------

describe('mascara e desenho (lote 6)', () => {
/**
 * Lote 6 (v2.3): máscara, silhueta e mover o desenho sem mover o osso.
 *
 * Sem DOM. Três coisas se provam aqui: que a máscara nasce onde recorta alguma
 * coisa, que o campo de exibição novo não quebra um arquivo velho, e que mexer
 * num desenho escreve no ANEXO e deixa o osso onde estava.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

/**
 *   root
 *   +-- braco    em (200, 0), sem giro, com o slot `desenho`
 *   +-- girado   em (0, 100), girado 90 graus
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 },
      { name: 'girado', parent: 'root', x: 0, y: 100, rotation: 90 },
    ],
    slots: [
      { name: 'corpo', bone: 'root', attachment: 'corpo' },
      { name: 'desenho', bone: 'braco', attachment: 'desenho' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        corpo: { corpo: { type: 'region', path: 'x', width: 20, height: 20 } },
        desenho: { desenho: { type: 'region', path: 'x', width: 30, height: 30 } },
      },
    }],
  } as BoneFile;
}

function testDoc(): Doc {
  const doc = new Doc(testFile());
  return doc;
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file, null, 2);
}

function pick(doc: Doc, patch: Partial<Selection>): void {
  doc.select({ ...emptySelection(), ...patch });
}

/** O anexo, como está no arquivo agora. */
function attachmentOf(doc: Doc, slot: string, name: string): Record<string, unknown> {
  const skin = (doc.file.skins ?? [])[0];
  return (skin.attachments?.[slot]?.[name] ?? {}) as Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Item 47 — a máscara
// ---------------------------------------------------------------------------

describe('criar uma máscara', () => {
  it('nasce como polígono de quatro cantos, do tamanho padrão', () => {
    const doc = testDoc();
    const command = new AddClipping(doc.file, 'braco', []);
    doc.run(command);
    const half = DEFAULT_MASK_SIZE / 2;
    expect(attachmentOf(doc, command.name, command.name)).toEqual({
      type: 'clipping',
      vertices: boxVertices(-half, -half, half, half),
      end: 'desenho',
    });
  });

  it('entra na FRENTE da ordem de desenho: no fim ela não recortaria nada', () => {
    const doc = testDoc();
    const command = new AddClipping(doc.file, 'braco', []);
    doc.run(command);
    expect((doc.file.slots ?? [])[0]?.name).toBe(command.name);
  });

  it('`end` é o último slot que existia antes dela: recorta tudo', () => {
    const doc = testDoc();
    const command = new AddClipping(doc.file, 'braco', []);
    doc.run(command);
    // §7.7: sem `end` nem `slots`, uma máscara não recorta nada. Nascer sem
    // recortar nada seria nascer parecendo quebrada.
    expect(attachmentOf(doc, command.name, command.name)['end']).toBe('desenho');
  });

  it('num arquivo sem slot nenhum, ela nasce sem `end` em vez de mentir', () => {
    const doc = new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      skins: [{ name: 'default', attachments: {} }],
    } as BoneFile);
    const command = new AddClipping(doc.file, 'root', []);
    doc.run(command);
    expect('end' in attachmentOf(doc, command.name, command.name)).toBe(false);
  });

  it('desfazer devolve o arquivo letra por letra', () => {
    const doc = testDoc();
    const antes = texto(doc);
    doc.run(new AddClipping(doc.file, 'braco', []));
    expect(texto(doc)).not.toBe(antes);
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });
});

describe('os campos da máscara', () => {
  it('tem "Recorta até", "Só estes" e "Inverter" — e nenhum campo de imagem', () => {
    const doc = testDoc();
    const command = new AddClipping(doc.file, 'braco', []);
    doc.run(command);
    const campos = attachmentFields(doc.file, command.name, command.name)
      .flatMap((group) => group.fields);
    const chaves = campos.map((field) => field.key);
    expect(chaves).toContain('end');
    expect(chaves).toContain('slots');
    expect(chaves).toContain('invert');
    expect(chaves).not.toContain('path');
  });

  it('"Só estes" é uma lista de caixas, e ela some do arquivo quando vazia', () => {
    const doc = testDoc();
    const command = new AddClipping(doc.file, 'braco', []);
    doc.run(command);
    const campo = attachmentFields(doc.file, command.name, command.name)
      .flatMap((group) => group.fields)
      .find((field) => field.key === 'slots');
    expect(campo?.kind).toBe('checklist');
    // Um array vazio e a ausência querem dizer coisas diferentes em §7.7.
    expect(campo?.dropWhenEmpty).toBe(true);
    expect(campo?.options?.map((o) => o.value)).toContain('desenho');
  });
});

// ---------------------------------------------------------------------------
// Item 48 — a silhueta
// ---------------------------------------------------------------------------

describe('as fontes da silhueta', () => {
  it('são só os desenhos com imagem', () => {
    const doc = testDoc();
    const command = new AddClipping(doc.file, 'braco', []);
    doc.run(command);
    const fontes = silhouetteSources(doc.file, []).map((o) => o.value);
    expect(fontes).toContain('desenho/desenho');
    expect(fontes).toContain('corpo/corpo');
    // A própria máscara não tem silhueta a emprestar: ela não desenha nada.
    expect(fontes.some((v) => v.startsWith(command.name))).toBe(false);
  });

  it('no herói, todas as fontes são `slot/anexo` e nenhuma se repete', () => {
    const file = JSON.parse(RAW) as BoneFile;
    const fontes = silhouetteSources(file, ['default']).map((o) => o.value);
    expect(fontes.length).toBeGreaterThan(5);
    expect(new Set(fontes).size).toBe(fontes.length);
    for (const value of fontes) expect(value).toContain('/');
  });

  it('sem pele visível, olha a default', () => {
    const file = JSON.parse(RAW) as BoneFile;
    expect(silhouetteSources(file, [])).toEqual(silhouetteSources(file, ['default']));
  });
});

// ---------------------------------------------------------------------------
// A caixa "Máscaras" do painel Exibição
// ---------------------------------------------------------------------------

describe('ver as máscaras', () => {
  it('nasce ligada: uma máscara que não se vê é um corte sem causa na tela', () => {
    expect(DEFAULT_VIEW.clippings).toBe(true);
  });

  it('um `view` gravado antes do lote 6 não quebra: o campo volta no padrão', () => {
    const velho = { bones: false, grid: false };
    const lido = parseViewSettings(velho);
    expect(lido.clippings).toBe(DEFAULT_VIEW.clippings);
    expect(lido.bones).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Item 2 — mexer no desenho sem mexer no osso
// ---------------------------------------------------------------------------

describe('o desenho escolhido', () => {
  it('só é pego com um desenho e NENHUM osso', () => {
    const doc = testDoc();
    doc.rebuild();
    pick(doc, { attachments: [{ slot: 'desenho', attachment: 'desenho' }] });
    expect(pickedAttachment(doc)).not.toBeNull();

    // Com um osso junto, as ferramentas voltam a ser do osso.
    pick(doc, {
      bones: ['braco'],
      attachments: [{ slot: 'desenho', attachment: 'desenho' }],
    });
    expect(pickedAttachment(doc)).toBeNull();
  });

  it('traz a âncora no mundo: a raiz do osso mais o x/y do anexo', () => {
    const doc = testDoc();
    doc.rebuild();
    pick(doc, { attachments: [{ slot: 'desenho', attachment: 'desenho' }] });
    const found = pickedAttachment(doc);
    // `braco` está em (200, 0) e o anexo em (0, 0): a âncora é (200, 0).
    expect(found?.anchor.x).toBeCloseTo(200, 6);
    expect(found?.anchor.y).toBeCloseTo(0, 6);
  });

  it('dois desenhos escolhidos não pegam: não há um só para mexer', () => {
    const doc = testDoc();
    doc.rebuild();
    pick(doc, {
      attachments: [
        { slot: 'desenho', attachment: 'desenho' },
        { slot: 'corpo', attachment: 'corpo' },
      ],
    });
    expect(pickedAttachment(doc)).toBeNull();
  });

  it('uma máscara não é desenho: as ferramentas não mexem nela', () => {
    const doc = testDoc();
    const command = new AddClipping(doc.file, 'braco', []);
    doc.run(command);
    doc.rebuild();
    pick(doc, { attachments: [{ slot: command.name, attachment: command.name }] });
    expect(pickedAttachment(doc)).toBeNull();
  });
});

describe('mover o desenho', () => {
  it('escreve no ANEXO, e o osso fica onde estava', () => {
    const doc = testDoc();
    doc.rebuild();
    pick(doc, { attachments: [{ slot: 'desenho', attachment: 'desenho' }] });
    const found = pickedAttachment(doc);
    expect(found).not.toBeNull();

    const antesDoOsso = JSON.stringify(doc.file.bones);
    const local = worldDeltaToBone((found as never as { bone: never }).bone, 40, 0);
    writeAttachmentValues(doc, found as never, 'Mover desenho', [
      { field: 'x', value: (found as never as { x: number }).x + local.x },
      { field: 'y', value: (found as never as { y: number }).y + local.y },
    ]);

    // O osso `braco` não tem giro: 40 no mundo são 40 no espaço dele.
    expect(attachmentOf(doc, 'desenho', 'desenho')['x']).toBeCloseTo(40, 6);
    expect(JSON.stringify(doc.file.bones)).toBe(antesDoOsso);
  });

  it('num osso girado 90°, mover para a direita no mundo vira -y no anexo', () => {
    const doc = testDoc();
    doc.rebuild();
    const skeleton = new Skeleton(loadSkeletonData(
      JSON.parse(JSON.stringify(doc.file)) as unknown,
    ));
    skeleton.updateWorldTransform();
    const bone = skeleton.findBone('girado');
    expect(bone).not.toBeNull();
    // O X local do `girado` aponta para cima. Andar 10 para a direita no mundo
    // é andar -10 no Y local dele.
    const local = worldDeltaToBone(bone as never, 10, 0);
    expect(local.x).toBeCloseTo(0, 6);
    expect(local.y).toBeCloseTo(-10, 6);
  });

  it('desfazer devolve o arquivo', () => {
    const doc = testDoc();
    doc.rebuild();
    const antes = texto(doc);
    pick(doc, { attachments: [{ slot: 'desenho', attachment: 'desenho' }] });
    const found = pickedAttachment(doc);
    writeAttachmentValues(doc, found as never, 'Mover desenho', [
      { field: 'x', value: 25 },
      { field: 'y', value: -7 },
    ]);
    expect(texto(doc)).not.toBe(antes);
    doc.undo();
    doc.undo();
    expect(texto(doc)).toBe(antes);
  });
});
});

// ---------------------------------------------------------------------------
// transformar (lote 47) — era `lote47-transformar.test.ts`
// ---------------------------------------------------------------------------

describe('transformar (lote 47)', () => {
/**
 * Lote 47 — rodada 4: Transformar, mover, girar e escalar numa ferramenta só,
 * como o Spriter.
 *
 * Sem DOM. A regra do lote é "nenhuma conta nova": por isso cada arrasto é
 * feito DUAS vezes, no Transformar e na ferramenta de sempre, e o arquivo tem
 * de sair igual, texto contra texto.
 */
const RAW = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile);
}

function texto(doc: Doc): string {
  return JSON.stringify(doc.file);
}

function ev(p: Point, extra: Partial<ToolEvent> = {}): ToolEvent {
  return { x: p.x, y: p.y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1, ...extra };
}

/** Um arrasto de verdade: descer, andar em quatro passos, subir. */
function arrastar(tool: Tool, doc: Doc, de: Point, ate: Point, extra: Partial<ToolEvent> = {}): void {
  tool.onDown!(doc, ev(de, extra));
  for (let i = 1; i <= 4; i++) {
    tool.onMove!(doc, ev({ x: de.x + ((ate.x - de.x) * i) / 4, y: de.y + ((ate.y - de.y) * i) / 4 }, extra));
  }
  tool.onUp!(doc, ev(ate, extra));
  doc.endMerge();
}

/** O herói com o braço escolhido. */
function comArm(): Doc {
  const doc = heroi();
  doc.select({ ...emptySelection(), bones: ['arm'] });
  return doc;
}

/** O meio do osso `arm`, em mundo. */
function meioDoArm(doc: Doc): Point {
  const arm = doc.skeleton!.findBone('arm')!;
  const length = arm.data.length;
  return { x: arm.worldX + (arm.a * length) / 2, y: arm.worldY + (arm.c * length) / 2 };
}

function girar(q: Point, pivo: Point, graus: number): Point {
  const r = (graus * Math.PI) / 180;
  const dx = q.x - pivo.x;
  const dy = q.y - pivo.y;
  return { x: pivo.x + dx * Math.cos(r) - dy * Math.sin(r), y: pivo.y + dx * Math.sin(r) + dy * Math.cos(r) };
}

function armDef(doc: Doc): Record<string, unknown> {
  return doc.file.bones.find((b) => b.name === 'arm') as unknown as Record<string, unknown>;
}

/**
 * O herói com um DESENHO escolhido, e não um osso — item 1.3, 13/09/2026.
 *
 * Desde esse item o osso mostra três quadradinhos (`w`, `e`, `n`) e o canto
 * não responde mais nele: canto não quer dizer nada numa linha. Quem continua
 * com os **oito** é o desenho, e é nele que os testes de canto trabalham
 * agora.
 */
function comHair(): Doc {
  const doc = heroi();
  doc.select({ ...emptySelection(), attachments: [{ slot: 'hair', attachment: 'hair' }] });
  return doc;
}

/** Os campos do desenho `hair`, na pele de sempre. */
function hairDef(doc: Doc): Record<string, unknown> {
  const pele = doc.file.skins![0] as unknown as {
    attachments: Record<string, Record<string, Record<string, unknown>>>;
  };
  return pele.attachments['hair']!['hair']!;
}

// ---------------------------------------------------------------------------
// A caixa, pura
// ---------------------------------------------------------------------------

describe('transformHit — o que o ponteiro pega', () => {
  const box = boxFromCorners(
    { x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 50 }, { x: 0, y: 50 }, { x: 0, y: 25 }, { x: 60, y: 25 },
  );

  it('os valores do plano', () => {
    expect(transformHit({ x: 50, y: 25 }, box, 7)).toBe('move');
    expect(transformHit({ x: 67, y: 25 }, box, 7)).toBe('rotate');
    expect(transformHit({ x: 60, y: 18 }, box, 7)).toBe('rotate');
    expect(transformHit({ x: 100, y: 50 }, box, 7)).toEqual({ scale: 'ne' });
    expect(transformHit({ x: 100, y: 25 }, box, 7)).toEqual({ scale: 'e' });
    expect(transformHit({ x: 300, y: 300 }, box, 7)).toBe('outside');
  });

  it('os oito quadradinhos, com os nomes do mundo (y para cima)', () => {
    expect(transformHit({ x: 0, y: 0 }, box, 7)).toEqual({ scale: 'sw' });
    expect(transformHit({ x: 50, y: 0 }, box, 7)).toEqual({ scale: 's' });
    expect(transformHit({ x: 50, y: 50 }, box, 7)).toEqual({ scale: 'n' });
    expect(transformHit({ x: 0, y: 25 }, box, 7)).toEqual({ scale: 'w' });
  });

  it('o cursor de cada quadradinho segue a direção na tela', () => {
    expect(cursorForHandle(box, 'e')).toBe('ew');
    expect(cursorForHandle(box, 'n')).toBe('ns');
    expect(cursorForHandle(box, 'ne')).toBe('nesw');
    expect(cursorForHandle(box, 'se')).toBe('nwse');
  });

  it('nada escolhido: sem caixa', () => {
    expect(transformBox(heroi(), 1)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Cada gesto é a ferramenta de sempre
// ---------------------------------------------------------------------------

describe('Transformar repassa o arrasto: o arquivo sai igual, texto contra texto', () => {
  it('arrastar por dentro é o Mover', () => {
    const a = comArm();
    const b = comArm();
    const de = meioDoArm(a);
    expect(transformHit(de, transformBox(a, 1)!, 7)).toBe('move');
    const ate = { x: de.x + 20, y: de.y };
    arrastar(transformTool, a, de, ate);
    arrastar(translateTool, b, de, ate);
    expect(texto(a)).toBe(texto(b));
    expect(texto(a)).not.toBe(texto(heroi()));
  });

  it('arrastar a bolinha da haste 90° é o Girar: rotation muda 90', () => {
    const a = comArm();
    const b = comArm();
    const antes = Number(armDef(a)['rotation'] ?? 0);
    const box = transformBox(a, 1)!;
    const ate = girar(box.knob, box.pivot, 90);
    arrastar(transformTool, a, box.knob, ate);
    arrastar(rotateTool, b, box.knob, ate);
    expect(texto(a)).toBe(texto(b));
    expect(Math.abs(Math.abs(Number(armDef(a)['rotation']) - antes) - 90)).toBeLessThan(1e-9);
  });

  it('arrastar o canto para o dobro da distância do pivô é o Escalar: 2 e 2', () => {
    // Num DESENHO: desde o item 1.3 o osso não tem canto (só `w`, `e`, `n`).
    const a = comHair();
    const b = comHair();
    const box = transformBox(a, 1)!;
    expect(box.visibleHandles).toContain('ne');
    const canto = box.handles.ne;
    const ate = { x: box.pivot.x + 2 * (canto.x - box.pivot.x), y: box.pivot.y + 2 * (canto.y - box.pivot.y) };
    arrastar(transformTool, a, canto, ate);
    arrastar(scaleTool, b, canto, ate);
    expect(texto(a)).toBe(texto(b));
    expect(Number(hairDef(a)['scaleX'])).toBeCloseTo(2, 9);
    expect(Number(hairDef(a)['scaleY'])).toBeCloseTo(2, 9);
  });

  it('o osso não tem canto nenhum: três quadradinhos, e o desenho continua com oito', () => {
    // 'n' e 's' são a espessura (um de cada lado), 'e' é o comprimento, pela
    // ponta. 'w' fica de fora: ele é sempre o mesmo ponto que o pivô (a base
    // do osso), não a "largura" — achado do chat 1, 13/09/2026, depois da v12.1.
    expect(transformBox(comArm(), 1)!.visibleHandles).toEqual(['n', 's', 'e']);
    expect(transformBox(comHair(), 1)!.visibleHandles.length).toBe(8);
  });

  it('canto com Shift: proporção, igual ao Escalar com Shift', () => {
    const a = comHair();
    const b = comHair();
    const box = transformBox(a, 1)!;
    const canto = box.handles.ne;
    const ate = { x: box.pivot.x + 3 * (canto.x - box.pivot.x), y: box.pivot.y + 1.2 * (canto.y - box.pivot.y) };
    arrastar(transformTool, a, canto, ate, { shift: true });
    arrastar(scaleTool, b, canto, ate, { shift: true });
    expect(texto(a)).toBe(texto(b));
    expect(hairDef(a)['scaleX']).toBe(hairDef(a)['scaleY']);
  });

  it('meio do lado direito: só scaleX muda, mesmo com o ponteiro escorregando', () => {
    const a = comArm();
    const antesY = armDef(a)['scaleY'];
    const box = transformBox(a, 1)!;
    const lado = box.handles.e;
    const escorrega = { x: -(lado.y - box.pivot.y), y: lado.x - box.pivot.x };
    const n = Math.hypot(escorrega.x, escorrega.y);
    const ate = {
      x: box.pivot.x + 2 * (lado.x - box.pivot.x) + (escorrega.x / n) * 3,
      y: box.pivot.y + 2 * (lado.y - box.pivot.y) + (escorrega.y / n) * 3,
    };
    arrastar(transformTool, a, lado, ate);
    expect(Number(armDef(a)['scaleX'])).toBeCloseTo(2, 9);
    expect(armDef(a)['scaleY']).toBe(antesY);
  });

  it('arrastar fora da caixa é o retângulo: a mesma seleção que o Selecionar dá', () => {
    const a = heroi();
    const b = heroi();
    const de = { x: -150, y: 260 };
    const ate = { x: 150, y: -40 };
    arrastar(transformTool, a, de, ate);
    arrastar(selectTool as Tool, b, de, ate);
    expect(a.selection).toEqual(b.selection);
    expect(a.selection.bones.length).toBeGreaterThan(0);
    expect(texto(a)).toBe(texto(b));
  });

  it('clicar dentro sem arrastar escolhe o que está embaixo, como o Selecionar', () => {
    const a = comArm();
    const b = comArm();
    const ponto = meioDoArm(a);
    transformTool.onDown(a, ev(ponto));
    transformTool.onUp(a, ev(ponto));
    selectTool.onDown(b, ev(ponto));
    selectTool.onUp(b, ev(ponto));
    expect(a.selection).toEqual(b.selection);
    expect(texto(a)).toBe(texto(heroi()));
  });

  it('descer em algo não escolhido e arrastar: escolhe e move, sem trocar de ferramenta', () => {
    const a = heroi();
    const b = heroi();
    const de = meioDoArm(a);
    const ate = { x: de.x + 15, y: de.y - 5 };
    arrastar(transformTool, a, de, ate);
    selectTool.onDown(b, ev(de));
    selectTool.onUp(b, ev(de));
    arrastar(translateTool, b, de, ate);
    expect(a.selection).toEqual(b.selection);
    expect(texto(a)).toBe(texto(b));
    expect(texto(a)).not.toBe(texto(heroi()));
  });
});

describe('um passo de desfazer por arrasto, com o nome do gesto, e o rodapé', () => {
  it('Mover: um passo; desfazer devolve o arquivo', () => {
    const a = comArm();
    const de = meioDoArm(a);
    arrastar(transformTool, a, de, { x: de.x + 20, y: de.y + 10 });
    expect(a.undoLabel).toBe('Mover osso');
    a.undo();
    expect(texto(a)).toBe(texto(heroi()));
  });

  it('Girar e Escalar também: um passo cada', () => {
    const a = comArm();
    const box = transformBox(a, 1)!;
    arrastar(transformTool, a, box.knob, girar(box.knob, box.pivot, 30));
    expect(a.undoLabel).toBe('Girar osso');
    // Pelo MEIO DO LADO, e não pelo canto: o osso não tem canto desde o item
    // 1.3. O que se prova aqui é o passo de desfazer, não o número de eixos.
    const box2 = transformBox(a, 1)!;
    arrastar(transformTool, a, box2.handles.e, {
      x: box2.pivot.x + 1.5 * (box2.handles.e.x - box2.pivot.x),
      y: box2.pivot.y + 1.5 * (box2.handles.e.y - box2.pivot.y),
    });
    expect(a.undoLabel).toBe('Escalar osso');
    a.undo();
    a.undo();
    // Os números voltam. O texto não é conferido aqui: o herói não escreve
    // `scaleX`, e o desfazer do Escalar (de antes deste lote) grava o `1` que
    // estava valendo — é o mesmo com a ferramenta Escalar sozinha.
    const original = armDef(heroi());
    for (const campo of ['x', 'y', 'rotation']) expect(armDef(a)[campo]).toBe(original[campo]);
    expect(Number(armDef(a)['scaleX'] ?? 1)).toBe(1);
    expect(Number(armDef(a)['scaleY'] ?? 1)).toBe(1);
    expect(a.canUndo).toBe(false);
  });

  it('o rodapé diz o gesto e o número', () => {
    const a = comArm();
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    const box = transformBox(a, 1)!;
    arrastar(transformTool, a, box.knob, girar(box.knob, box.pivot, 90));
    // Rodada 47, lote 4 (reescrito de propósito, nota a do doc 82): o braço é da
    // regra ik_arm, que segura o giro; a frase do gesto já diz isso.
    expect(ditos.at(-1)).toMatch(/^Girar −?90° \(agora −?[\d,]+° local\) \(a regra ik_arm manda nele\)$/);
    const box2 = transformBox(a, 1)!;
    const lado = box2.handles.e;
    arrastar(transformTool, a, lado, {
      x: box2.pivot.x + 1.4 * (lado.x - box2.pivot.x), y: box2.pivot.y + 1.4 * (lado.y - box2.pivot.y),
    });
    expect(ditos.at(-1)).toBe('Escalar X × 1,4');
    const de = meioDoArm(a);
    arrastar(transformTool, a, de, { x: de.x + 10, y: de.y });
    expect(ditos.at(-1)).toMatch(/^Mover X −?[\d,]+ px · Y −?[\d,]+ px$/);
  });
});

// ---------------------------------------------------------------------------
// Rodada 46, lote 1 (doc `66`, §4): o número durante o gesto, com a unidade
// ---------------------------------------------------------------------------

describe('rodada 46, lote 1 — o rodapé diz quanto, com a unidade, enquanto arrasta', () => {
  it('as frases puras têm px, ° e ×', () => {
    expect(moveFooter(12, -4)).toBe('Mover X 12 px · Y −4 px');
    expect(rotateFooter(30, 50)).toBe('Girar 30° (agora 50° local)');
    expect(scaleFooter('x', 1.34, 1)).toBe('Escalar X × 1,34');
    expect(scaleFooter(null, 1.5, 0.5)).toBe('Escalar X × 1,5 · Y × 0,5');
    expect(shearFooter('y', -21.6, -21.6)).toBe('Inclinar Y −21,6° (agora −21,6°)');
    expect(nudgeLabel(0, -10, 'o osso')).toBe('Andar 10 px para baixo com o osso');
  });

  it('o Transformar diz o número e a unidade: Girar, Escalar e Mover', () => {
    const a = comArm();
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    const box = transformBox(a, 1)!;
    arrastar(transformTool, a, box.knob, girar(box.knob, box.pivot, 90));
    // Rodada 47, lote 4 (reescrito de propósito, nota a do doc 82): o braço é da
    // regra ik_arm, que segura o giro; a frase do gesto já diz isso.
    expect(ditos.at(-1)).toMatch(/^Girar −?90° \(agora −?[\d,]+° local\) \(a regra ik_arm manda nele\)$/);
    const box2 = transformBox(a, 1)!;
    const lado = box2.handles.e;
    arrastar(transformTool, a, lado, {
      x: box2.pivot.x + 1.4 * (lado.x - box2.pivot.x), y: box2.pivot.y + 1.4 * (lado.y - box2.pivot.y),
    });
    expect(ditos.at(-1)).toBe('Escalar X × 1,4');
    const antes = { x: Number(armDef(a)['x'] ?? 0), y: Number(armDef(a)['y'] ?? 0) };
    const de = meioDoArm(a);
    arrastar(transformTool, a, de, { x: de.x + 10, y: de.y });
    const dx = Number(armDef(a)['x'] ?? 0) - antes.x;
    const dy = Number(armDef(a)['y'] ?? 0) - antes.y;
    // O número é o que a ficha mostra: os campos X e Y do osso, no pai.
    expect(ditos.at(-1)).toBe(moveFooter(dx, dy));
    expect(ditos.at(-1)).toMatch(/^Mover X −?[\d,]+ px · Y −?[\d,]+ px$/);
  });

  it('uma frase por movimento: o Transformar fala pela ferramenta de dentro', () => {
    const a = comArm();
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    const box = transformBox(a, 1)!;
    arrastar(transformTool, a, box.knob, girar(box.knob, box.pivot, 40));
    expect(ditos.filter((d) => d.startsWith('Girar'))).toHaveLength(4);
  });

  it('as quatro ferramentas soltas (W, E, R, Z) dizem a mesma frase', () => {
    const casos: Array<[Tool, RegExp]> = [
      [translateTool, /^Mover X −?[\d,]+ px · Y −?[\d,]+ px$/],
      [rotateTool, /^Girar −?[\d,]+° \(agora −?[\d,]+° local\) \(a regra ik_arm manda nele\)$/], // rodada 47, lote 4 (reescrito de propósito)
      // Rodada 46, lote 3: o meio do osso está sobre a linha dele; o Y fica parado e o rodapé diz.
      [scaleTool, /^Escalar X × [\d,]+ · Y × [\d,]+( · perto do pivô.*)?$/],
      [shearTool, /^Inclinar X −?[\d,]+° \(agora −?[\d,]+°\) · Y −?[\d,]+° \(agora −?[\d,]+°\)$/],
    ];
    for (const [tool, frase] of casos) {
      const a = comArm();
      const ditos: string[] = [];
      a.notice = (linha: string) => { ditos.push(linha); };
      const de = meioDoArm(a);
      arrastar(tool, a, de, { x: de.x + 15, y: de.y + 9 });
      expect(ditos.at(-1), tool.label).toMatch(frase);
    }
  });

  it('o repose do quadro carrega o recado do gesto, e o recado não vira comando', () => {
    const a = heroi();
    const nomes: Array<string | undefined> = [];
    a.on((change) => { if (change.kind === 'transform') nomes.push(change.label); });
    a.repose();
    a.repose('Girar 30° (agora 50°)');
    expect(nomes).toEqual([undefined, 'Girar 30° (agora 50°)']);

    const gesto = new GestureNotice();
    gesto.press();
    gesto.hear({ kind: 'file', label: 'Girar osso' });
    gesto.hear({ kind: 'selection', label: 'Girar 30° (agora 50°)' });
    expect(gesto.current()).toBe('Girar 30° (agora 50°)');
    // O repose seguinte repete a frase com o tipo `transform`: não é comando.
    gesto.hear({ kind: 'transform', label: 'Girar 30° (agora 50°)' });
    expect(gesto.release()).toBe('Girar 30° (agora 50°)');
    expect(gesto.lastCommand()).toBe('Girar osso');
    expect(gesto.current()).toBeNull();
  });

  it('a seta diz quantos px: o passo de desfazer é "Andar 10 px com o osso"', () => {
    const a = comArm();
    nudgeSelection(a, 10, 0);
    expect(a.undoLabel).toBe('Andar 10 px para a direita com o osso');
    nudgeSelection(a, 0, -1);
    expect(a.undoLabel).toBe('Andar 1 px para baixo com o osso');
    expect(gripOfLabel('Andar 10 px para a direita com o osso')).toBe('position');
  });
});

describe('rodada 46, lote 3 — a caixa do osso dá controle', () => {
  function docCom(nome: string): Doc {
    const doc = heroi();
    doc.select({ ...emptySelection(), bones: [nome] });
    return doc;
  }
  function campo(doc: Doc, osso: string, chave: string, padrao: number): number {
    const def = (doc.file.bones ?? []).find((b) => b.name === osso) as Record<string, unknown> | undefined;
    return Number(def?.[chave] ?? padrao);
  }

  it('os quadradinhos do meio de um osso ficam a pelo menos 32 px um do outro', () => {
    const box = transformBox(docCom('head'), 1)!;
    const n = box.handles.n;
    const s2 = box.handles.s;
    expect(Math.hypot(n.x - s2.x, n.y - s2.y)).toBeGreaterThan(31.9);
  });

  it('a escala com partida curta anda devagar e nunca explode', () => {
    const f = (escala as unknown as { dampedFactor(r: number, c: number, m: number): number }).dampedFactor;
    expect(typeof f).toBe('function');
    expect(f(16, 36, 40)).toBeCloseTo(1.5);
    expect(f(0.001, 20, 40)).toBeCloseTo(1.5);
    expect(f(80, 120, 40)).toBeCloseTo(1.5);
    expect(f(-16, -36, 40)).toBeCloseTo(1.5);
  });

  it('20 px no meio do lado de um osso não dão 3×', () => {
    const a = docCom('head');
    const box = transformBox(a, 1)!;
    const lado = box.handles.n;
    const ox = lado.x - box.pivot.x - (box.handles.e.x - box.pivot.x) / 2;
    const oy = lado.y - box.pivot.y - (box.handles.e.y - box.pivot.y) / 2;
    const l = Math.hypot(ox, oy);
    // Sem Alt o meio de cima escala: 20 px para fora, perpendicular ao osso.
    const fora = { x: lado.x + (ox / l) * 20, y: lado.y + (oy / l) * 20 };
    arrastar(transformTool, a, lado, fora);
    const sy = campo(a, 'head', 'scaleY', 1);
    expect(sy).toBeGreaterThan(1);
    expect(sy).toBeLessThan(2);
  });

  it('Escalar começando sobre a linha da origem não dá × −79 (nota a do doc 73)', () => {
    const a = docCom('head');
    const head = a.skeleton!.findBone('head')!;
    const de = { x: head.worldX + head.a * 30 + 0.2 * -head.c, y: head.worldY + head.c * 30 + 0.2 * head.a };
    const ate = { x: de.x - head.c * 15, y: de.y + head.a * 15 };
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    arrastar(scaleTool, a, de, ate);
    expect(Math.abs(campo(a, 'head', 'scaleY', 1))).toBeLessThan(3);
    expect(ditos.at(-1)).toContain('perto do pivô');
  });

  it('Alt no meio do lado de um osso em pé inclina puxando AO LONGO do lado, nos eixos da caixa', () => {
    const a = docCom('torso');
    const box = transformBox(a, 1)!;
    const lado = box.handles.n;
    const ax = box.handles.e.x - box.pivot.x;
    const ay = box.handles.e.y - box.pivot.y;
    const l = Math.hypot(ax, ay);
    // Ao longo do osso (o lado da caixa é paralelo a ele).
    arrastar(transformTool, a, lado, { x: lado.x + (ax / l) * 30, y: lado.y + (ay / l) * 30 }, { alt: true });
    expect(Math.abs(campo(a, 'torso', 'shearX', 0))).toBeGreaterThan(5);
  });

  it('puxar para fora do lado não inclina, e o rodapé diz o gesto certo', () => {
    const a = docCom('torso');
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    const box = transformBox(a, 1)!;
    const lado = box.handles.n;
    const ox = lado.x - box.pivot.x - (box.handles.e.x - box.pivot.x) / 2;
    const oy = lado.y - box.pivot.y - (box.handles.e.y - box.pivot.y) / 2;
    const l = Math.hypot(ox, oy);
    arrastar(transformTool, a, lado, { x: lado.x + (ox / l) * 30, y: lado.y + (oy / l) * 30 }, { alt: true });
    expect(Math.abs(campo(a, 'torso', 'shearX', 0))).toBeLessThan(0.05);
    expect(ditos.at(-1)).toContain('puxe ao longo do lado');
  });

  it('um clique rente à caixa do osso ainda é dentro: arrasta o osso, não faz retângulo', () => {
    const t = caixaDoOsso as unknown as { distanceToBox?: unknown };
    expect(typeof t.distanceToBox).toBe('function');
    const a = docCom('torso');
    const box = transformBox(a, 1)!;
    const lado = box.handles.n;
    const ox = lado.x - box.pivot.x - (box.handles.e.x - box.pivot.x) / 2;
    const oy = lado.y - box.pivot.y - (box.handles.e.y - box.pivot.y) / 2;
    const l = Math.hypot(ox, oy);
    // Meio da borda + 3 px para fora, longe do quadradinho: (meio do comprimento é onde está n).
    const quarto = { x: box.pivot.x + (box.handles.e.x - box.pivot.x) * 0.2 + (ox / l) * (l + 3),
      y: box.pivot.y + (box.handles.e.y - box.pivot.y) * 0.2 + (oy / l) * (l + 3) };
    const antes = campo(a, 'torso', 'x', 0) + campo(a, 'torso', 'y', 0);
    arrastar(transformTool, a, quarto, { x: quarto.x + 20, y: quarto.y + 20 });
    expect(a.selection.bones).toEqual(['torso']);
    expect(campo(a, 'torso', 'x', 0) + campo(a, 'torso', 'y', 0)).not.toBe(antes);
  });
});
describe('rodada 46, lote 4 — escolher, criar e ver', () => {
  type Fn = (...a: unknown[]) => unknown;
  const f = (mod: unknown, nome: string): Fn => {
    const g = (mod as Record<string, unknown>)[nome];
    expect(typeof g, nome).toBe('function');
    return g as Fn;
  };

  it('Ctrl+clique soma, como no Spine, e o rodapé diz quantos e quais', () => {
    const a = heroi();
    a.select({ ...emptySelection(), bones: ['leg'] });
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    const p = meioDoArm(a);
    selectTool.onDown(a, ev(p, { ctrl: true }));
    selectTool.onUp(a, ev(p, { ctrl: true }));
    const tudo = JSON.stringify(a.selection);
    expect(tudo).toContain('leg');
    expect(tudo).toContain('arm');
    expect(ditos.some((d) => /^\d+ escolhidos: /.test(d))).toBe(true);
  });

  it('as frases de quem nasce: solto na raiz, filho de, e a caixa que caiu na raiz', () => {
    expect(f(palavras, 'newBoneWhere')(undefined, 'root')).toBe('solto, na raiz');
    expect(f(palavras, 'newBoneWhere')('root', 'root')).toBe('solto, na raiz');
    expect(f(palavras, 'newBoneWhere')('torso', 'root')).toBe('filho de torso');
    const sel = { slots: ['osso_ponto'], attachments: [{ slot: 'osso_ponto', attachment: 'osso_ponto' }] };
    expect(f(palavras, 'looseShapeHint')(sel, 'root', 'root', true)).toContain('Ficou solta, na raiz');
    expect(f(palavras, 'looseShapeHint')(sel, 'torso', 'root', true)).toBe('');
    expect(f(palavras, 'looseShapeHint')({ slots: [], attachments: [] }, 'root', 'root', false)).toBe('');
    expect(f(palavras, 'chosenNotice')(['cape_upper', 'cape_lower'])).toBe('2 escolhidos: cape_upper, cape_lower');
    expect(f(palavras, 'chosenNotice')(['a'])).toBeNull();
  });

  it('o osso que pega desenhos ganha o nome do primeiro (Spine)', () => {
    const a = heroi();
    const def = (describeBone as unknown as Fn)(
      a.skeleton!, null, a.file.bones.map((b) => b.name), 0, 0, 0, 50, 2, 'cape_upper',
    ) as { name: string };
    expect(def.name).toBe('cape_upper');
  });

  it('a régua diz onde está o ponteiro, em px, com o menos de verdade', () => {
    expect(f(regua, 'pointerRulerLabel')(123.4, -45.6)).toBe('X 123 · Y −46 px');
  });

  it('o zoom pelo teclado diz o %; o Espaço segurado em outro painel move a vista', () => {
    expect(f(zoomModelo, 'zoomNotice')(2.45)).toBe('Zoom: 245%');
    expect(f(espaco, 'startsPan')(0, true)).toBe(true);
    expect(f(espaco, 'startsPan')(1, false)).toBe(true);
    expect(f(espaco, 'startsPan')(0, false)).toBe(false);
  });

  it('a frase do Alt fala de topo e base só no meio de cima e de baixo (nota do doc 76)', () => {
    const g = f(caixaDoOsso, 'shearHoverNotice');
    expect(g('x')).toContain('o topo anda');
    expect(g('y')).not.toContain('topo');
    expect(g('y')).toContain('este lado anda');
  });

  it('o meio do lado amortecido não diz "perto do pivô"; só o eixo parado diz (nota do doc 77)', () => {
    const a = heroi();
    a.select({ ...emptySelection(), bones: ['head'] });
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    const box = transformBox(a, 1)!;
    const lado = box.handles.n;
    const ox = lado.x - box.pivot.x - (box.handles.e.x - box.pivot.x) / 2;
    const oy = lado.y - box.pivot.y - (box.handles.e.y - box.pivot.y) / 2;
    const l = Math.hypot(ox, oy);
    arrastar(transformTool, a, lado, { x: lado.x + (ox / l) * 20, y: lado.y + (oy / l) * 20 });
    expect(ditos.at(-1)).toMatch(/^Escalar Y × /);
    expect(ditos.at(-1)).not.toContain('perto do pivô');
  });
});

// ---------------------------------------------------------------------------
// Na barra e ao abrir
// ---------------------------------------------------------------------------

describe('a barra, a tecla e a ferramenta de partida', () => {
  it('abre com o Transformar na mão', () => {
    expect(START_TOOL).toBe('transform');
    expect(getActiveToolId()).toBe('transform');
  });

  it('é o PRIMEIRO botão da barra, com ícone, nome e tecla T na dica', () => {
    // Item 2.2, 13/09/2026: ela abre o programa, e agora abre a barra também.
    expect(TOOL_ORDER[0]).toBe('transform');
    expect(TOOL_ORDER.indexOf('select')).toBe(1);
    expect(toolbarItems()[0]!.id).toBe('transform');
    const item = toolbarItems().find((i) => i.id === 'transform')!;
    expect(item.icon).toBe('transform');
    expect(item.label).toBe('Transformar');
    expect(item.hint).toContain('Transformar (T)');
  });

  it('Mover, Girar, Escalar e Inclinar continuam na barra', () => {
    const ids = toolbarItems().map((i) => i.id);
    for (const id of ['translate', 'rotate', 'scale', 'shear']) expect(ids).toContain(id);
  });

  it('Ajuda → Atalhos lista o T, e as teclas das outras ferramentas', () => {
    const rows = toolShortcutRows();
    expect(rows).toContainEqual({ menu: 'Ferramentas', item: 'Transformar', shortcut: 'T' });
    expect(rows).toContainEqual({ menu: 'Ferramentas', item: 'Mover', shortcut: 'W' });
    const teclas = rows.map((r) => r.shortcut);
    expect(new Set(teclas).size).toBe(teclas.length);
  });
});


// ---------------------------------------------------------------------------
// Itens 2.1 a 2.4 do plano "a caixa, os ossos e a malha" — 13/09/2026
// ---------------------------------------------------------------------------

describe('mover vários não bagunça — item 2.1', () => {
/**
 * O Humberto: *"seleciono vários objetos e eles viram bagunça quando movo"*.
 *
 * A causa: um osso filho já anda junto com o pai, porque a pose dele é
 * relativa ao pai. Escrever o mesmo deslocamento nos dois faz o filho andar
 * DUAS vezes. A regra nova: quem tem ancestral dentro da própria seleção não
 * recebe a conta.
 *
 * O `heroi.bone` serve de campo de prova: `arm` é pai de `forearm`, `torso` é
 * avô de `forearm`, e `arm` e `leg` não são parentes um do outro.
 */
  const RAW2 = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
  const arquivo = (): BoneFile => JSON.parse(RAW2) as BoneFile;
  const docCom = (...bones: string[]): Doc => {
    const doc = new Doc(arquivo());
    doc.select({ ...emptySelection(), bones });
    return doc;
  };
  const osso = (doc: Doc, nome: string): Record<string, unknown> =>
    doc.file.bones.find((b) => b.name === nome) as unknown as Record<string, unknown>;
  const pontoDe = (doc: Doc, nome: string): Point => {
    const b = doc.skeleton!.findBone(nome)!;
    return { x: b.worldX + (b.a * b.data.length) / 2, y: b.worldY + (b.c * b.data.length) / 2 };
  };

  it('pai e filho juntos: só o pai recebe a conta', () => {
    expect(topLevelBones(arquivo(), ['arm', 'forearm'])).toEqual(['arm']);
    // E ao contrário na lista: quem sai é o filho, não o primeiro da lista.
    expect(topLevelBones(arquivo(), ['forearm', 'arm'])).toEqual(['arm']);
  });

  it('neto com o avô escolhido e o pai de fora: o neto sai também', () => {
    expect(topLevelBones(arquivo(), ['torso', 'forearm'])).toEqual(['torso']);
  });

  it('quem não é parente fica: os dois recebem a conta', () => {
    expect(topLevelBones(arquivo(), ['arm', 'leg'])).toEqual(['arm', 'leg']);
  });

  it('a ordem da lista não muda, e nada escolhido é lista vazia', () => {
    expect(topLevelBones(arquivo(), ['leg', 'arm'])).toEqual(['leg', 'arm']);
    expect(topLevelBones(arquivo(), [])).toEqual([]);
  });

  it('`draggedBones` lê a seleção do documento', () => {
    expect(draggedBones(docCom('arm', 'forearm'))).toEqual(['arm']);
    expect(draggedBones(docCom('arm', 'leg'))).toEqual(['arm', 'leg']);
  });

  it('Mover: o filho não anda duas vezes — o arquivo sai igual ao de mover só o pai', () => {
    const dois = docCom('arm', 'forearm');
    const um = docCom('arm');
    const de = pontoDe(dois, 'arm');
    const ate = { x: de.x + 30, y: de.y + 12 };
    arrastar(translateTool, dois, de, ate);
    arrastar(translateTool, um, de, ate);
    // O `x`/`y` LOCAL do filho não foi tocado: ele anda de carona no pai.
    expect(osso(dois, 'forearm')['x']).toEqual(osso(um, 'forearm')['x']);
    expect(osso(dois, 'forearm')['y']).toEqual(osso(um, 'forearm')['y']);
    expect(osso(dois, 'arm')['x']).toEqual(osso(um, 'arm')['x']);
    expect(Number(osso(dois, 'arm')['x'])).not.toEqual(Number(osso(docCom('arm'), 'arm')['x']));
  });

  it('Girar: o mesmo — o giro do pai já leva o filho', () => {
    const dois = docCom('arm', 'forearm');
    const antes = osso(dois, 'forearm')['rotation'];
    const de = pontoDe(dois, 'arm');
    arrastar(rotateTool, dois, de, { x: de.x + 40, y: de.y + 40 });
    expect(osso(dois, 'forearm')['rotation']).toEqual(antes);
    expect(osso(dois, 'arm')['rotation']).not.toEqual(osso(docCom('arm'), 'arm')['rotation']);
  });

  it('Escalar: o filho não cresce duas vezes', () => {
    const dois = docCom('arm', 'forearm');
    const de = pontoDe(dois, 'arm');
    arrastar(scaleTool, dois, de, { x: de.x * 2, y: de.y * 2 });
    expect(Number(osso(dois, 'forearm')['scaleX'] ?? 1)).toBe(1);
    expect(Number(osso(dois, 'forearm')['scaleY'] ?? 1)).toBe(1);
    expect(Number(osso(dois, 'arm')['scaleX'] ?? 1)).not.toBe(1);
  });

  it('Inclinar: o filho não inclina duas vezes', () => {
    const dois = docCom('arm', 'forearm');
    const de = pontoDe(dois, 'arm');
    arrastar(shearTool, dois, de, { x: de.x + 35, y: de.y + 35 });
    expect(Number(osso(dois, 'forearm')['shearX'] ?? 0)).toBe(0);
    expect(Number(osso(dois, 'forearm')['shearY'] ?? 0)).toBe(0);
    expect(Number(osso(dois, 'arm')['shearX'] ?? 0)).not.toBe(0);
  });

  it('dois que não são parentes andam os dois: o filtro não come ninguém à toa', () => {
    const doc = docCom('arm', 'leg');
    // O par `x`/`y`, e não só o `x`: o valor gravado é LOCAL, e o pai de cada
    // um pode estar girado — andar para a direita na tela vira `y` no arquivo.
    const par = (nome: string): string => `${osso(doc, nome)['x']},${osso(doc, nome)['y']}`;
    const antesArm = par('arm');
    const antesLeg = par('leg');
    const de = pontoDe(doc, 'arm');
    arrastar(translateTool, doc, de, { x: de.x + 25, y: de.y + 25 });
    expect(par('arm')).not.toBe(antesArm);
    expect(par('leg')).not.toBe(antesLeg);
  });
});

describe('o Inclinar entrou no Transformar — item 2.3', () => {
/**
 * Sem alça nova: `Alt` + o meio de um lado da caixa inclina, em vez de
 * escalar. O eixo é o CONTRÁRIO do Escalar — puxar o topo para o lado inclina
 * em X, puxar um lado para cima inclina em Y — e o canto continua escalando.
 */
  it('o eixo que cada alça inclina é o contrário do que ela escala', () => {
    expect(shearAxisOfHandle('n')).toBe('x');
    expect(shearAxisOfHandle('s')).toBe('x');
    expect(shearAxisOfHandle('e')).toBe('y');
    expect(shearAxisOfHandle('w')).toBe('y');
    for (const h of ['n', 's', 'e', 'w'] as const) {
      expect(shearAxisOfHandle(h)).not.toBe(axisOfHandle(h));
    }
  });

  it('canto não inclina: continua escalando os dois eixos', () => {
    for (const h of SCALE_HANDLES.filter((n) => n.length === 2)) {
      expect(shearAxisOfHandle(h)).toBeNull();
      expect(axisOfHandle(h)).toBeNull();
    }
  });

  it('Alt no meio do lado direito escreve a inclinação Y, e não a escala', () => {
    const a = comArm();
    const box = transformBox(a, 1)!;
    const lado = box.handles.e;
    arrastar(transformTool, a, lado, { x: lado.x, y: lado.y + 40 }, { alt: true });
    expect(Number(armDef(a)['shearY'] ?? 0)).not.toBe(0);
    expect(Number(armDef(a)['shearX'] ?? 0)).toBe(0);
    expect(Number(armDef(a)['scaleX'] ?? 1)).toBe(1);
    expect(Number(armDef(a)['scaleY'] ?? 1)).toBe(1);
  });

  it('Alt no meio de cima escreve a inclinação X: o topo anda, a base fica', () => {
    const a = comArm();
    const box = transformBox(a, 1)!;
    const cima = box.handles.n;
    arrastar(transformTool, a, cima, { x: cima.x + 40, y: cima.y }, { alt: true });
    expect(Number(armDef(a)['shearX'] ?? 0)).not.toBe(0);
    expect(Number(armDef(a)['shearY'] ?? 0)).toBe(0);
    expect(Number(armDef(a)['scaleX'] ?? 1)).toBe(1);
  });

  it('Alt no canto NÃO inclina: escala os dois eixos, como sempre', () => {
    // No DESENHO, que é quem tem canto (item 1.3) — num osso o canto não
    // responde, e o teste passaria à toa, sem arrastar nada.
    const a = comHair();
    const b = comHair();
    const box = transformBox(a, 1)!;
    const canto = box.handles.ne;
    const ate = { x: box.pivot.x + 2 * (canto.x - box.pivot.x), y: box.pivot.y + 2 * (canto.y - box.pivot.y) };
    arrastar(transformTool, a, canto, ate, { alt: true });
    arrastar(transformTool, b, canto, ate);
    expect(texto(a)).toBe(texto(b));
    expect(texto(a)).not.toBe(texto(heroi()));
    expect(Number(hairDef(a)['scaleX'])).toBeCloseTo(2, 9);
  });

  it('sem osso escolhido o Alt não faz nada: a alça escala o desenho', () => {
    const a = heroi();
    a.select({ ...emptySelection(), attachments: [{ slot: 'hair', attachment: 'hair' }] });
    const b = heroi();
    b.select({ ...emptySelection(), attachments: [{ slot: 'hair', attachment: 'hair' }] });
    const box = transformBox(a, 1)!;
    const lado = box.handles.e;
    const ate = { x: box.pivot.x + 1.5 * (lado.x - box.pivot.x), y: box.pivot.y + 1.5 * (lado.y - box.pivot.y) };
    arrastar(transformTool, a, lado, ate, { alt: true });
    arrastar(transformTool, b, lado, ate);
    expect(texto(a)).toBe(texto(b));
    expect(texto(a)).not.toBe(texto(heroi()));
  });

  it('um passo de desfazer, com o nome do gesto, e o rodapé diz o número', () => {
    const a = comArm();
    const ditos: string[] = [];
    a.notice = (linha: string) => { ditos.push(linha); };
    const box = transformBox(a, 1)!;
    const lado = box.handles.e;
    arrastar(transformTool, a, lado, { x: lado.x, y: lado.y + 40 }, { alt: true });
    expect(a.undoLabel).toBe('Inclinar osso');
    expect(ditos.at(-1)).toMatch(/^Inclinar Y −?\d/);
    a.undo();
    expect(Number(armDef(a)['shearY'] ?? 0)).toBe(0);
  });

  it('a dica do botão conta a tecla: quem não abre o código precisa saber dela', () => {
    const item = toolbarItems().find((i) => i.id === 'transform')!;
    expect(item.hint).toContain('Alt');
    expect(item.hint.toLowerCase()).toContain('inclina');
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 7, tarefa 7.1 (G1): B cria osso, Y posa, N livre
//
// O Humberto, 16/09: `B` de *bone*, como no Spriter, e o Alt sai — "não
// repetir o erro do Spriter". O Posar desce para `Y`, que fecha a fila
// Q W E R T Y das ferramentas de mexer, e o `N` fica livre.
// ---------------------------------------------------------------------------

describe('B cria osso, Y posa, N livre (7.1)', () => {
  it('a tecla de cada ferramenta é a nova', () => {
    expect(toolOfKey('b')?.id).toBe('create-bone');
    expect(toolOfKey('y')?.id).toBe('pose');
    expect(toolOfKey('n')).toBe(null);
  });

  it('maiúscula ou minúscula dá na mesma', () => {
    expect(toolOfKey('B')?.id).toBe('create-bone');
    expect(toolOfKey('Y')?.id).toBe('pose');
  });

  it('a tabela de teclas e as ferramentas dizem o mesmo', () => {
    for (const row of TOOL_KEYS) {
      const id = row.action.replace('local:ferramenta-', '');
      expect(getTool(id)?.shortcut, id).toBe(row.key);
    }
  });

  it('nenhuma outra ferramenta ficou com o B ou o Y', () => {
    const teclas = getTools().map((tool) => tool.shortcut).filter((key) => key !== null);
    expect(teclas.filter((key) => key === 'b')).toHaveLength(1);
    expect(teclas.filter((key) => key === 'y')).toHaveLength(1);
    expect(teclas).not.toContain('n');
  });
});

// ---------------------------------------------------------------------------
// Desfazer devolve o arquivo letra por letra — rodada final, defeito A4 (29/09/2026)
// ---------------------------------------------------------------------------

describe('desfazer não escreve campo que não existia (A4)', () => {
  /**
   * Achado pelo chat A: inclinar um osso e desfazer deixava `shearX: 0` escrito
   * onde o campo não existia. O boneco é o mesmo; o arquivo não volta letra
   * por letra. A forma: **o `revert` escrevia o valor PADRÃO em vez de tirar
   * o campo** — `readBone` lê "ausente" como 0, e o 0 voltava como número.
   */
  const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
  const ossoDe = (doc: Doc, nome: string): Record<string, unknown> =>
    doc.file.bones.find((b) => b.name === nome) as unknown as Record<string, unknown>;

  it('pelo comando: inclinar `leg` e desfazer tira o `shearX` que ele não tinha', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    const antes = JSON.stringify(doc.file);
    expect('shearX' in ossoDe(doc, 'leg')).toBe(false);
    doc.run(setProperties(doc, 'Inclinar osso', 'a4', [{ bone: 'leg', key: 'shearX', value: 12 }]));
    expect(ossoDe(doc, 'leg')['shearX']).toBe(12);
    doc.undo();
    expect('shearX' in ossoDe(doc, 'leg')).toBe(false);
    expect(JSON.stringify(doc.file)).toBe(antes);
    // E refazer põe o campo de volta.
    doc.redo();
    expect(ossoDe(doc, 'leg')['shearX']).toBe(12);
  });

  it('pela mão: o gesto do chat A — Inclinar arrastando, e Ctrl+Z', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    const antes = JSON.stringify(doc.file);
    doc.select({ ...emptySelection(), bones: ['leg'] });
    const leg = doc.skeleton!.findBone('leg')!;
    const de = { x: leg.worldX + leg.a * 20, y: leg.worldY + leg.c * 20 };
    const ev = (x: number, y: number): ToolEvent => ({ x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    shearTool.onDown!(doc, ev(de.x, de.y));
    for (let i = 1; i <= 4; i++) shearTool.onMove!(doc, ev(de.x + 8 * i, de.y + 8 * i));
    shearTool.onUp!(doc, ev(de.x + 32, de.y + 32));
    doc.endMerge();
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('campo que JÁ existia continua existindo, com o número de antes', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    const torso = ossoDe(doc, 'torso');
    const tinha = 'rotation' in torso;
    const antes = torso['rotation'];
    doc.run(setProperties(doc, 'Girar osso', 'a4b', [{ bone: 'torso', key: 'rotation', value: 33 }]));
    doc.undo();
    expect('rotation' in ossoDe(doc, 'torso')).toBe(tinha);
    expect(ossoDe(doc, 'torso')['rotation']).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// A seta empurra a imagem que acabou de entrar — rodada final, defeito H3 (29/09/2026)
// ---------------------------------------------------------------------------

describe('a seta empurra o desenho escolhido como slot (H3)', () => {
  /**
   * Achado pelo chat H: soltar uma imagem na cena (ela nasce escolhida) e
   * apertar a seta não mexia nada. Duas causas, medidas uma a uma no editor
   * da porta 5206: o foco ficava na aba Imagens (a seta não chegava à cena —
   * `viewport.ts`, `onDrop`, agora dá o foco à cena), e a imagem nasce
   * escolhida como **slot**, sem o anexo — e a seta só empurrava anexo.
   */
  const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');

  it('só o slot escolhido: a seta anda com o desenho que ele mostra', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    doc.select({ ...emptySelection(), slots: ['shin_front'] });
    expect(selectedDrawings(doc).map((d) => `${d.slot}/${d.attachment}`)).toEqual(['shin_front/shin']);
    expect(nudgeDrawings(doc, 1, 0)).toBe(1);
  });

  it('slot e anexo escolhidos juntos: um desenho só, não dois', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    doc.select({ ...emptySelection(), slots: ['shin_front'], attachments: [{ slot: 'shin_front', attachment: 'shin' }] });
    expect(selectedDrawings(doc)).toHaveLength(1);
  });

  it('com osso escolhido quem anda é o osso, como antes', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    doc.select({ ...emptySelection(), bones: ['shin'], slots: ['shin_front'] });
    expect(selectedDrawings(doc)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Rodada 8d — mover a imagem cria chave, como no Spriter (04/10/2026)
// ---------------------------------------------------------------------------

describe('rodada 8d: o osso próprio da imagem', () => {
  /**
   * `braco` girado e esticado, com DUAS imagens: `mao` e `manga`. A `mao` tem
   * outra imagem na skin `luva`, em outro lugar — a conta tem de valer para as
   * duas. A animação `anda` já gira o braço.
   */
  function arquivo(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'braco', parent: 'root', x: 100, y: 20, rotation: 30, scaleX: 1.5, scaleY: 0.8, length: 60 },
      ],
      slots: [
        { name: 'manga', bone: 'braco', attachment: 'manga' },
        { name: 'mao', bone: 'braco', attachment: 'mao' },
      ],
      skins: [
        {
          name: 'default',
          attachments: {
            manga: { manga: { type: 'region', path: 'manga', x: 10, width: 30, height: 12 } },
            mao: { mao: { type: 'region', path: 'mao', x: 50, y: 6, rotation: 15, width: 16, height: 16 } },
          },
        },
        {
          name: 'luva',
          attachments: { mao: { mao: { type: 'region', path: 'luva', x: 44, y: -3, rotation: -20, scaleX: 1.2, width: 18, height: 14 } } },
        },
      ],
      animations: [{
        name: 'anda',
        duration: 1,
        timelines: [{ type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 30 }, { time: 1, value: 60 }] }],
      }],
    } as BoneFile;
  }

  function aberto(tempo = 0.5): Doc {
    const doc = new Doc(arquivo());
    doc.animation = 'anda';
    doc.time = tempo;
    doc.repose();
    return doc;
  }

  const e8 = (x: number, y: number): ToolEvent => ({ x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
  const mao = (doc: Doc): void => doc.select({ ...emptySelection(), slots: ['mao'], attachments: [{ slot: 'mao', attachment: 'mao' }] });

  /** Os quatro cantos de uma imagem no mundo, na pose de agora. */
  function cantos(doc: Doc, slot: string, skin?: string): number[] {
    const file = JSON.parse(JSON.stringify(doc.file)) as BoneFile;
    const skeleton = new Skeleton(loadSkeletonData(file));
    if (skin !== undefined) skeleton.setSkin(skin);
    skeleton.setToSetupPose();
    const anim = doc.animation === null ? null : skeleton.data.findAnimation(doc.animation);
    if (anim !== null) applyAnimation(skeleton, anim, doc.time);
    skeleton.updateWorldTransform();
    const s = skeleton.findSlot(slot)!;
    const v = (s.attachment as unknown as { computeWorldVertices(s: unknown): ArrayLike<number> }).computeWorldVertices(s);
    return Array.from(v).map((n) => Math.round(n * 1e4) / 1e4);
  }

  function anexo(doc: Doc, slot: string, name: string): Record<string, unknown> {
    return (doc.file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)[slot]![name]!;
  }

  function chavesDe(doc: Doc): string[] {
    const anim = doc.file.animations!.find((a) => a.name === 'anda')!;
    return (anim.timelines ?? []).map((t) => `${(t as { target?: string }).target}.${(t as { property?: string }).property}`).sort();
  }

  it('criar o osso próprio não move um pixel: as duas skins, na base e na animação', () => {
    const doc = aberto();
    const antes = { base: cantos(new Doc(arquivo()), 'mao'), anim: cantos(doc, 'mao'), luva: cantos(doc, 'mao', 'luva') };
    const command = new CreateOwnBones([{ slot: 'mao', anchor: { x: 50, y: 6, rotation: 15 } }]);
    doc.run(command);
    const osso = command.bones.get('mao')!;
    expect(osso).toBe('mao_osso');
    expect(doc.file.slots!.find((s) => s.name === 'mao')!.bone).toBe('mao_osso');
    const base = new Doc(JSON.parse(JSON.stringify(doc.file)) as BoneFile);
    expect(cantos(base, 'mao')).toEqual(antes.base);
    expect(cantos(doc, 'mao')).toEqual(antes.anim);
    expect(cantos(doc, 'mao', 'luva')).toEqual(antes.luva);
    // A luva é mesmo outra imagem, noutro lugar: a conta valeu para as duas.
    expect(antes.luva).not.toEqual(antes.anim);
    // No fim da lista: nenhum índice de osso andou. E é do editor, escondido.
    expect(doc.file.bones.map((b) => b.name)).toEqual(['root', 'braco', 'mao_osso']);
    expect(isOwnBone(doc.file, 'mao_osso')).toBe(true);
    expect(isOwnBone(doc.file, 'braco')).toBe(false);
    // Quem usa a extensão do editor a declara: o validador cobra.
    expect((doc.file as { extensionsUsed?: string[] }).extensionsUsed).toContain('RECORTE_editor_state');
  });

  it('mover a mão numa animação cria chave SÓ do osso dela: o braço e a manga não andam', () => {
    const doc = aberto();
    const manga = cantos(doc, 'manga');
    mao(doc);
    const p = pickedAttachment(doc)!;
    translateTool.onDown!(doc, e8(p.anchor.x, p.anchor.y));
    translateTool.onMove!(doc, e8(p.anchor.x + 12, p.anchor.y - 5));
    translateTool.onMove!(doc, e8(p.anchor.x + 20, p.anchor.y + 4));
    translateTool.onUp!(doc, e8(p.anchor.x + 20, p.anchor.y + 4));
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.x', 'mao_osso.y']);
    expect(cantos(doc, 'manga')).toEqual(manga);
    // A âncora da mão foi para onde o ponteiro levou.
    const depois = pickedAttachment(doc)!;
    expect(depois.anchor.x).toBeCloseTo(p.anchor.x + 20, 3);
    expect(depois.anchor.y).toBeCloseTo(p.anchor.y + 4, 3);
    // A escolha continua sendo a imagem, sem osso.
    expect(doc.selection.bones).toEqual([]);
  });

  it('Ctrl+Z do primeiro movimento tira o osso próprio E devolve os anexos das duas skins, letra por letra', () => {
    const doc = aberto();
    const antes = JSON.stringify(doc.file);
    mao(doc);
    const p = pickedAttachment(doc)!;
    translateTool.onDown!(doc, e8(p.anchor.x, p.anchor.y));
    translateTool.onMove!(doc, e8(p.anchor.x + 9, p.anchor.y));
    translateTool.onMove!(doc, e8(p.anchor.x + 15, p.anchor.y + 2));
    translateTool.onUp!(doc, e8(p.anchor.x + 15, p.anchor.y + 2));
    expect(JSON.stringify(doc.file)).not.toBe(antes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    doc.redo();
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.x', 'mao_osso.y']);
  });

  it('o osso próprio sem chave nenhuma (apaguei a última) desenha igual à imagem de antes', () => {
    const doc = aberto();
    const antes = cantos(doc, 'mao');
    mao(doc);
    const p = pickedAttachment(doc)!;
    translateTool.onDown!(doc, e8(p.anchor.x, p.anchor.y));
    translateTool.onMove!(doc, e8(p.anchor.x + 30, p.anchor.y));
    translateTool.onUp!(doc, e8(p.anchor.x + 30, p.anchor.y));
    expect(cantos(doc, 'mao')).not.toEqual(antes);
    const anim = doc.file.animations!.find((a) => a.name === 'anda')!;
    anim.timelines = (anim.timelines ?? []).filter((t) => (t as { target?: string }).target !== 'mao_osso');
    doc.rebuild();
    expect(cantos(doc, 'mao')).toEqual(antes);
  });

  /*
   * REESCRITO DE PROPÓSITO na rodada 13, ponto 3 (05/10/2026). Era "gira em
   * volta dela mesma": o osso próprio nascia no CENTRO da imagem, e o teste
   * conferia que o centro não andava. Agora ele nasce no PIVÔ, como no
   * Spriter; sem pivô à mão, o pivô é o que o rig diz — a origem do braço.
   */
  it('girar a mão numa animação gira em volta do PIVÔ dela (a origem do braço), com chave só do osso dela', () => {
    const doc = aberto();
    const braco = doc.skeleton!.findBone('braco')!;
    const pivo = { x: braco.worldX, y: braco.worldY };
    mao(doc);
    const p = pickedAttachment(doc)!;
    rotateTool.onDown!(doc, e8(pivo.x + 20, pivo.y));
    rotateTool.onMove!(doc, e8(pivo.x, pivo.y + 20));
    rotateTool.onUp!(doc, e8(pivo.x, pivo.y + 20));
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.rotation']);
    // O osso próprio nasceu na origem do braço, e ela não andou com o giro.
    expect(doc.file.bones.find((b) => b.name === 'mao_osso')).not.toHaveProperty('x');
    expect(doc.file.bones.find((b) => b.name === 'mao_osso')).not.toHaveProperty('y');
    const osso = doc.skeleton!.findBone('mao_osso')!;
    expect(osso.worldX).toBeCloseTo(pivo.x, 3);
    expect(osso.worldY).toBeCloseTo(pivo.y, 3);
    // O centro da mão, sim, andou: ela girou em volta do pivô, e não de si.
    const depois = pickedAttachment(doc)!;
    expect(Math.hypot(depois.anchor.x - p.anchor.x, depois.anchor.y - p.anchor.y)).toBeGreaterThan(1);
  });

  it('rodada 13, conserto 4: DIGITAR o Ângulo na ficha rápida dá o mesmo que arrastar — chave do osso próprio, e a base não muda', () => {
    const doc = aberto();
    const texto = JSON.stringify(doc.file);
    mao(doc);
    const campo = quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'rotation')!;
    // Antes do conserto o campo apontava para o anexo e gravava NA BASE.
    expect(campo.pointer).toMatch(/^\/skins\/0\/attachments\/mao\/mao\/rotation$/);
    expect(writeQuickValue(doc, campo, 60)).toBeNull();
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.rotation']);
    // A base da imagem não mudou: o anexo, reescrito no osso próprio, tem giro 0
    // e o osso nasceu com os 15° dele.
    expect(anexo(doc, 'mao', 'mao')).not.toHaveProperty('rotation');
    expect(doc.file.bones.find((b) => b.name === 'mao_osso')!.rotation).toBe(15);
    // A chave: 15 + (60 − 15) = 60, no instante aberto.
    const linha = doc.file.animations![0]!.timelines!.find((t) => (t as { target?: string }).target === 'mao_osso')! as { keys: Array<{ time: number; value: number }> };
    expect(linha.keys.find((k) => k.time === 0.5)!.value).toBe(60);
    // E a ficha, agora no osso próprio, mostra 60.
    const depois = quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'rotation')!;
    expect(readQuickNow(doc, depois).frame).toBeCloseTo(60, 6);
    // Um passo de desfazer, como o gesto: o osso e a chave saem juntos.
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('rodada 13, conserto 4: X digitado anda a mesma diferença que arrastar; com a base aberta, segue indo para a base', () => {
    const doc = aberto();
    mao(doc);
    const campo = quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'x')!;
    const centro = cantos(doc, 'mao');
    writeQuickValue(doc, campo, 50 + 10);
    // A imagem anda 10 no eixo X do braço: cada canto anda o mesmo vetor.
    const agora = cantos(doc, 'mao');
    const dx = agora[0]! - centro[0]!;
    const dy = agora[1]! - centro[1]!;
    for (let i = 0; i < agora.length; i += 2) {
      expect(agora[i]! - centro[i]!).toBeCloseTo(dx, 3);
      expect(agora[i + 1]! - centro[i + 1]!).toBeCloseTo(dy, 3);
    }
    expect(Math.hypot(dx, dy)).toBeGreaterThan(1);
    // E andou por CHAVE do osso próprio: a base da imagem não mudou (antes do
    // conserto, o 60 ia para o anexo, e valia em todas as animações).
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.x']);
    expect(new Doc(JSON.parse(JSON.stringify(doc.file)) as BoneFile).file.bones.find((b) => b.name === 'mao_osso')).toBeDefined();
    // Na base, nada de osso próprio: o anexo recebe o número, como sempre.
    const base = new Doc(arquivo());
    mao(base);
    const campoBase = quickFields(base.file, quickSubject(base.selection)).find((f) => f.key === 'x')!;
    writeQuickValue(base, campoBase, 77);
    expect(anexo(base, 'mao', 'mao')['x']).toBe(77);
    expect(base.file.bones.map((b) => b.name)).toEqual(['root', 'braco']);
  });

  it('K9: o painel Propriedades DE BAIXO, numa animação, dá o mesmo que a ficha — chave do osso próprio, base intacta, um Ctrl+Z', () => {
    const doc = aberto();
    const texto = JSON.stringify(doc.file);
    const rotacao: FieldDef = { key: 'rotation', label: 'Rotação', kind: 'number', pointer: '/skins/0/attachments/mao/mao/rotation', fallback: 0 };
    expect(writeFieldValue(doc, rotacao, 60)).toBeNull();
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.rotation']);
    expect(anexo(doc, 'mao', 'mao')).not.toHaveProperty('rotation');
    expect(doc.file.bones.find((b) => b.name === 'mao_osso')!.rotation).toBe(15);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
    // Com a base aberta, vai para a base, como sempre.
    const base = new Doc(arquivo());
    writeFieldValue(base, rotacao, 33);
    expect(anexo(base, 'mao', 'mao')['rotation']).toBe(33);
    expect(base.file.bones.map((b) => b.name)).toEqual(['root', 'braco']);
  });

  it('K9: com o osso próprio já feito, a Posição X DE DENTRO no painel de baixo anda por chave do osso, no eixo dele', () => {
    const doc = aberto();
    const rotacao: FieldDef = { key: 'rotation', label: 'Rotação', kind: 'number', pointer: '/skins/0/attachments/mao/mao/rotation', fallback: 0 };
    writeFieldValue(doc, rotacao, 60);
    const antes = cantos(doc, 'mao');
    const base = JSON.stringify(doc.file.skins);
    const x: FieldDef = { key: 'x', label: 'Posição X', kind: 'number', pointer: '/skins/0/attachments/mao/mao/x', fallback: 0 };
    const dentro = Number(anexo(doc, 'mao', 'mao')['x'] ?? 0);
    writeFieldValue(doc, x, dentro + 10);
    expect(JSON.stringify(doc.file.skins)).toBe(base);
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.rotation', 'mao_osso.x', 'mao_osso.y']);
    // Todos os cantos andaram o mesmo vetor, de 10 × a escala do braço no eixo da mão.
    const agora = cantos(doc, 'mao');
    const dx = agora[0]! - antes[0]!;
    const dy = agora[1]! - antes[1]!;
    for (let i = 0; i < agora.length; i += 2) {
      expect(agora[i]! - antes[i]!).toBeCloseTo(dx, 3);
      expect(agora[i + 1]! - antes[i + 1]!).toBeCloseTo(dy, 3);
    }
    expect(Math.hypot(dx, dy)).toBeGreaterThan(5);
  });

  it('a ficha LÊ o que se digitou: X = 60 na imagem com osso próprio lê 60, e não o pivô (era 7 contra 25)', () => {
    const doc = aberto();
    mao(doc);
    const x0 = quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'x')!;
    writeQuickValue(doc, x0, 60);
    const x1 = quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'x')!;
    expect(readQuickNow(doc, x1).frame).toBeCloseTo(60, 6);
    // De novo, agora com o osso próprio já feito: digitar 25, ler 25.
    writeQuickValue(doc, x1, 25);
    expect(readQuickNow(doc, quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'x')!).frame).toBeCloseTo(25, 6);
    // O giro e a escala também são os da imagem.
    const giro = quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'rotation')!;
    writeQuickValue(doc, giro, 40);
    expect(readQuickNow(doc, quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'rotation')!).frame).toBeCloseTo(40, 6);
    const escala = quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'scaleX')!;
    writeQuickValue(doc, escala, 2);
    expect(readQuickNow(doc, quickFields(doc.file, quickSubject(doc.selection)).find((f) => f.key === 'scaleX')!).frame).toBeCloseTo(2, 6);
  });

  it('rodada 13: com pivô à mão, o osso próprio nasce NELE; na imagem solta, no centro como antes', () => {
    const atlas = loadAtlas({
      atlas: { version: '1.0', generator: 'teste' },
      pages: [{ name: 'p', image: 'p.png', width: 64, height: 64 }],
      regions: [{ name: 'mao', page: 0, x: 0, y: 0, width: 16, height: 16 }],
    } as never);
    const file = arquivo();
    // A `mao` tem 16 × 16, giro 15° e está em (50, 6): pivô à mão no canto (0, 0).
    (file as { extensions?: Record<string, unknown> }).extensions = { RECORTE_editor_state: { pivosAMao: { mao: [0, 0] } } };
    const doc = new Doc(file, { atlases: [atlas] });
    const p = pickedFor(doc, 'mao', 'mao')!;
    const at = ownBoneBirthPoint(doc, p);
    // O canto de baixo à esquerda, a (−8, −8) do centro, girado 15°.
    const c = Math.cos(15 * Math.PI / 180);
    const s = Math.sin(15 * Math.PI / 180);
    expect(at.x).toBeCloseTo(50 + (-8 * c - -8 * s), 3);
    expect(at.y).toBeCloseTo(6 + (-8 * s + -8 * c), 3);
    // Sem pivô à mão, presa ao braço: a origem do braço.
    const semMarca = new Doc(arquivo(), { atlases: [atlas] });
    expect(ownBoneBirthPoint(semMarca, pickedFor(semMarca, 'mao', 'mao')!)).toEqual({ x: 0, y: 0 });
    // Solta (no osso raiz): o centro, como antes da rodada 13.
    const solta = arquivo();
    solta.slots!.find((s2) => s2.name === 'mao')!.bone = 'root';
    const docSolta = new Doc(solta, { atlases: [atlas] });
    expect(ownBoneBirthPoint(docSolta, pickedFor(docSolta, 'mao', 'mao')!)).toEqual({ x: 50, y: 6 });
  });

  it('escalar a mão numa animação: chave de escala do osso dela', () => {
    const doc = aberto();
    mao(doc);
    const p = pickedAttachment(doc)!;
    scaleTool.onDown!(doc, e8(p.anchor.x + 10, p.anchor.y + 10));
    scaleTool.onMove!(doc, e8(p.anchor.x + 20, p.anchor.y + 20));
    scaleTool.onUp!(doc, e8(p.anchor.x + 20, p.anchor.y + 20));
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.scaleX', 'mao_osso.scaleY']);
  });

  it('a seta numa animação também vira chave da imagem, e cada tecla é um passo', () => {
    const doc = aberto();
    const antes = JSON.stringify(doc.file);
    mao(doc);
    expect(nudgeDrawings(doc, 1, 0)).toBe(1);
    expect(nudgeDrawings(doc, 1, 0)).toBe(1);
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.x', 'mao_osso.y']);
    doc.undo();
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('duas imagens escolhidas andam juntas numa animação: um osso para cada, num passo', () => {
    const doc = aberto();
    const antes = JSON.stringify(doc.file);
    doc.select({ ...emptySelection(), attachments: [{ slot: 'mao', attachment: 'mao' }, { slot: 'manga', attachment: 'manga' }] });
    translateTool.onDown!(doc, e8(0, 0));
    translateTool.onMove!(doc, e8(10, 0));
    translateTool.onMove!(doc, e8(25, 5));
    translateTool.onUp!(doc, e8(25, 5));
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'manga_osso.x', 'manga_osso.y', 'mao_osso.x', 'mao_osso.y']);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('na base, a imagem com osso próprio anda pelo osso dela; sem osso próprio, pelo anexo, como sempre', () => {
    const doc = new Doc(arquivo());
    mao(doc);
    const p = pickedAttachment(doc)!;
    translateTool.onDown!(doc, e8(p.anchor.x, p.anchor.y));
    translateTool.onMove!(doc, e8(p.anchor.x + 10, p.anchor.y));
    translateTool.onUp!(doc, e8(p.anchor.x + 10, p.anchor.y));
    expect(doc.file.bones.length).toBe(2);
    expect(anexo(doc, 'mao', 'mao')['x']).not.toBe(50);

    const com = new Doc(arquivo());
    com.run(new CreateOwnBones([{ slot: 'mao', anchor: { x: 50, y: 6, rotation: 15 } }]));
    mao(com);
    const q = pickedAttachment(com)!;
    const guardado = JSON.stringify(anexo(com, 'mao', 'mao'));
    translateTool.onDown!(com, e8(q.anchor.x, q.anchor.y));
    translateTool.onMove!(com, e8(q.anchor.x + 10, q.anchor.y));
    translateTool.onUp!(com, e8(q.anchor.x + 10, q.anchor.y));
    expect(JSON.stringify(anexo(com, 'mao', 'mao'))).toBe(guardado);
    expect(com.file.bones.find((b) => b.name === 'mao_osso')!.x).not.toBe(50);
    expect((com.file.animations![0]!.timelines ?? []).length).toBe(1);
  });

  it('a imagem que tem malha em outra skin é recusada, com o aviso dizendo o que fazer', () => {
    const file = arquivo();
    (file.skins![1]!.attachments as Record<string, unknown>)['mao'] = {
      mao: { type: 'mesh', path: 'luva', uvs: [0, 0, 1, 0, 1, 1], triangles: [0, 1, 2], vertices: [0, 0, 10, 0, 10, 10], hull: 3 },
    };
    expect(ownBoneRefusal(file, 'mao')).toContain('uma malha');
    expect(ownBoneRefusal(file, 'mao')).toContain('Mova pelo osso dela');
    const doc = new Doc(file);
    doc.animation = 'anda';
    doc.time = 0.5;
    doc.repose();
    const antes = JSON.stringify(doc.file);
    const avisos: string[] = [];
    const notice = doc.notice.bind(doc);
    doc.notice = (t: string) => { avisos.push(t); notice(t); };
    mao(doc);
    const p = pickedAttachment(doc)!;
    translateTool.onDown!(doc, e8(p.anchor.x, p.anchor.y));
    translateTool.onMove!(doc, e8(p.anchor.x + 10, p.anchor.y));
    translateTool.onUp!(doc, e8(p.anchor.x + 10, p.anchor.y));
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(avisos.some((t) => t.includes('uma malha'))).toBe(true);
  });

  it('a imagem que troca de osso por chave é recusada', () => {
    const file = arquivo();
    file.animations![0]!.timelines!.push({ type: 'slot', target: 'mao', property: 'bone', keys: [{ time: 0, value: { bone: 'root' } }] } as never);
    expect(ownBoneRefusal(file, 'mao')).toContain('troca de osso na animação "anda"');
  });

  it('a Árvore não mostra o osso próprio: a imagem fica debaixo do osso que se vê', () => {
    const doc = new Doc(arquivo());
    doc.run(new CreateOwnBones([{ slot: 'mao', anchor: { x: 50, y: 6, rotation: 15 } }]));
    const rows = hierarchyRows(doc.file);
    expect(rows.some((r) => r.name === 'mao_osso')).toBe(false);
    const braco = rows.findIndex((r) => r.kind === 'bone' && r.name === 'braco');
    const linhaMao = rows.findIndex((r) => r.kind === 'slot' && r.name === 'mao');
    expect(linhaMao).toBeGreaterThan(braco);
    expect(rows[linhaMao]!.depth).toBe(rows[braco]!.depth + 1);
  });

  it('a folha chama a linha do osso próprio pelo nome da imagem', () => {
    const doc = aberto();
    mao(doc);
    expect(nudgeDrawings(doc, 3, 0)).toBe(1);
    const grupos = dopesheetGroups(doc.file, 'anda');
    expect(grupos.map((g) => g.label)).toEqual(['Osso braco', 'Imagem mao']);
    // "Mostrar só os escolhidos" com a mão escolhida mostra a linha dela.
    expect(dopesheetGroups(doc.file, 'anda', { bones: [], slots: ['mao'] }).map((g) => g.label)).toEqual(['Imagem mao']);
  });

  it('lote 2: clicar na mão na cena escolhe SÓ a mão; arrastar numa animação chaveia só ela', () => {
    const doc = aberto();
    const manga = cantos(doc, 'manga');
    const ancora = (() => { mao(doc); const p = pickedAttachment(doc)!; doc.select(emptySelection()); return p.anchor; })();
    selectTool.onDown(doc, e8(ancora.x, ancora.y));
    selectTool.onUp(doc, e8(ancora.x, ancora.y));
    expect(doc.selection).toEqual({ ...emptySelection(), slots: ['mao'], attachments: [{ slot: 'mao', attachment: 'mao' }] });
    translateTool.onDown!(doc, e8(ancora.x, ancora.y));
    translateTool.onMove!(doc, e8(ancora.x + 15, ancora.y));
    translateTool.onUp!(doc, e8(ancora.x + 15, ancora.y));
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.x', 'mao_osso.y']);
    expect(cantos(doc, 'manga')).toEqual(manga);
  });

  it('lote 2: a imagem que não anda sozinha (malha em alguma skin) ainda leva o osso no clique', () => {
    const file = arquivo();
    (file.skins![1]!.attachments as Record<string, unknown>)['mao'] = {
      mao: { type: 'mesh', path: 'luva', uvs: [0, 0, 1, 0, 1, 1], triangles: [0, 1, 2], vertices: [0, 0, 10, 0, 10, 10], hull: 3 },
    };
    expect(clickKeepsBone(file, 'mao')).toBe(true);
    expect(clickKeepsBone(file, 'manga')).toBe(false);
    const hit = { kind: 'attachment' as const, bone: 'braco', slot: 'mao', attachment: 'mao' };
    expect(selectionFor(emptySelection(), hit, false, 'root', (slot) => clickKeepsBone(file, slot)).bones).toEqual(['braco']);
  });

  it('a cabeça-malha: o clique escolhe o osso junto, e o rodapé diz por quê ("head é uma malha: ela se move pelo osso dela")', () => {
    const heroi = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
    const doc = new Doc(JSON.parse(heroi) as BoneFile);
    doc.rebuild();
    const avisos: string[] = [];
    const notice = doc.notice.bind(doc);
    doc.notice = (t: string) => { avisos.push(t); notice(t); };
    // A vista de fábrica (ossos à vista, nada travado): outro teste pode ter mudado.
    resetViewSettings();
    // No rosto, mas FORA da linha do osso: ali o corpo do osso pegaria o clique.
    const head = doc.skeleton!.findBone('head')!;
    const at = head.localToWorld(20, 14);
    const hits = pickAll(doc.skeleton, at.x, at.y, 1);
    expect(hits[0]).toMatchObject({ kind: 'attachment', slot: 'head', bone: 'head' });
    selectTool.onDown(doc, { x: at.x, y: at.y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    selectTool.onUp(doc, { x: at.x, y: at.y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
    expect(doc.selection.bones).toEqual(['head']);
    expect(doc.selection.slots).toEqual(['head']);
    expect(avisos.at(-1)).toBe('"head" é uma malha: ela se move pelo osso dela (head)');
    // A imagem que anda sozinha não ganha recado.
    expect(clickKeepsBoneNotice(doc.file, 'hand', 'forearm')).toBeNull();
  });

  it('lote 2: com os ossos à vista, o CORPO do osso pega o clique por cima da imagem; a ponta não', () => {
    // `braco` em (0,0), comprimento 40, deitado; uma imagem grande em cima dele todo.
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'braco', parent: 'root', length: 40 }],
      slots: [{ name: 'pano', bone: 'braco', attachment: 'pano' }],
      skins: [{ name: 'default', attachments: { pano: { pano: { type: 'region', path: 'pano', x: 20, width: 60, height: 20 } } } }],
    } as BoneFile;
    const skeleton = new Skeleton(loadSkeletonData(file));
    skeleton.updateWorldTransform();
    const vista = { ...NO_LOCKS, bonesOnTop: true };
    expect(pickAll(skeleton, 10, 0, 1, vista)[0]).toMatchObject({ kind: 'bone', bone: 'braco' });
    // Na ponta (39 de 40), a imagem vem antes: ali costuma estar a peça seguinte.
    expect(pickAll(skeleton, 39, 0, 1, vista)[0]).toMatchObject({ kind: 'attachment', slot: 'pano' });
    // "Ver ossos" desligado, ou sem travas (os testes, o P): a ordem de sempre.
    expect(pickAll(skeleton, 10, 0, 1, { ...NO_LOCKS, bonesOnTop: false })[0]).toMatchObject({ kind: 'attachment' });
    expect(pickAll(skeleton, 10, 0, 1)[0]).toMatchObject({ kind: 'attachment' });
    expect(currentLocks(parseViewSettings({ bones: false })).bonesOnTop).toBe(false);
  });

  /** O arquivo com a mão já tendo andado numa animação: o osso próprio e uma chave dele. */
  function comOssoProprio(): Doc {
    const doc = aberto();
    mao(doc);
    expect(nudgeDrawings(doc, 4, 0)).toBe(1);
    return doc;
  }

  it('lote 3: as Propriedades da imagem mostram e escrevem os números do osso próprio (na animação, chave dele)', () => {
    const doc = comOssoProprio();
    const ficha = buildProperties(doc.file, doc.selection);
    const campo = (key: string) => ficha.groups.flatMap((g) => g.fields).find((f) => f.key === key)!;
    const indice = doc.file.bones.findIndex((b) => b.name === 'mao_osso');
    expect(campo('x').pointer).toBe(`/bones/${indice}/x`);
    expect(campo('rotation').pointer).toBe(`/bones/${indice}/rotation`);
    // Largura e altura continuam sendo do anexo.
    expect(campo('width').pointer).toContain('/skins/');
    writeFieldValue(doc, campo('rotation'), 33);
    expect(chavesDe(doc)).toEqual(['braco.rotation', 'mao_osso.rotation', 'mao_osso.x', 'mao_osso.y']);
    // A ficha rápida também.
    const rapida = quickFields(doc.file, { kind: 'slot', name: 'mao' });
    expect(rapida.find((f) => f.key === 'x')!.pointer).toBe(`/bones/${indice}/x`);
  });

  it('lote 3: apagar a imagem leva o osso próprio e as chaves dele; desfazer devolve tudo', () => {
    const doc = comOssoProprio();
    const antes = JSON.stringify(doc.file);
    doc.run(new DeleteItems({ ...emptySelection(), slots: ['mao'] }));
    expect(doc.file.bones.map((b) => b.name)).toEqual(['root', 'braco']);
    expect(chavesDe(doc)).toEqual(['braco.rotation']);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('lote 3: duplicar a imagem duplica o osso próprio: a cópia não divide o da original', () => {
    const doc = comOssoProprio();
    const command = new Duplicate(doc.file, doc.selection);
    doc.run(command);
    const copia = command.newSlots.get('mao')!;
    const osso = doc.file.slots!.find((s) => s.name === copia)!.bone;
    expect(osso).not.toBe('mao_osso');
    expect(isOwnBone(doc.file, osso)).toBe(true);
    // A seleção depois é a imagem nova, sem o osso escondido.
    expect(command.selectionAfter().bones).toEqual([]);
    expect(command.selectionAfter().slots).toEqual([copia]);
  });

  it('lote 3: pendurar a imagem em outro osso pendura o osso próprio, e a imagem continua nele', () => {
    const file = arquivo();
    file.bones.push({ name: 'outro', parent: 'root', x: -50 } as never);
    const doc = new Doc(file);
    doc.run(new CreateOwnBones([{ slot: 'mao', anchor: { x: 50, y: 6, rotation: 15 } }]));
    const command = new Reparent(doc.file, { ...emptySelection(), slots: ['mao'] }, 'outro');
    expect(command.slots).toEqual([]);
    expect(command.bones).toEqual(['mao_osso']);
    const antes = cantos(doc, 'mao');
    doc.run(command);
    expect(doc.file.bones.find((b) => b.name === 'mao_osso')!.parent).toBe('outro');
    expect(doc.file.slots!.find((s) => s.name === 'mao')!.bone).toBe('mao_osso');
    expect(cantos(doc, 'mao')).toEqual(antes);
  });

  it('lote 3: o "_osso" de um arquivo que veio do Spriter antes da marca é reconhecido; o mesmo nome noutro arquivo não', () => {
    const spriter = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'Spriter r11' },
      bones: [{ name: 'root' }, { name: 'osso_raiz', parent: 'root' }, { name: 'corpo_osso', parent: 'osso_raiz' }],
      slots: [{ name: 'corpo', bone: 'corpo_osso', attachment: 'corpo' }],
    } as BoneFile;
    expect(isOwnBone(spriter, 'corpo_osso')).toBe(true);
    expect(isOwnBone(spriter, 'osso_raiz')).toBe(false);
    const outro = { ...spriter, bone: { ...spriter.bone, generator: 'Recorte' } } as BoneFile;
    expect(isOwnBone(outro, 'corpo_osso')).toBe(false);
  });

  it('o clique não pega o osso próprio: ele não se desenha, então não se clica', () => {
    const doc = new Doc(arquivo());
    doc.run(new CreateOwnBones([{ slot: 'mao', anchor: { x: 50, y: 6, rotation: 15 } }]));
    doc.rebuild();
    const osso = doc.skeleton!.findBone('mao_osso')!;
    const hits = pickAll(doc.skeleton, osso.worldX, osso.worldY, 1);
    expect(hits.some((h) => h.kind === 'bone' && h.bone === 'mao_osso')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rodada 15, lote 4 (04/10/2026): mover, girar e prender o emissor
// ---------------------------------------------------------------------------

describe('rodada 15, lote 4: o emissor se move, gira e se prende, como a imagem', () => {
  /** `braco` girado 30°, com um emissor; `perna` noutro lugar; `anda` gira o braço. */
  function arquivo(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'braco', parent: 'root', x: 100, y: 20, rotation: 30, length: 60 },
        { name: 'perna', parent: 'root', x: -50, y: -40, rotation: -45, length: 50 },
      ],
      slots: [{ name: 'fogo', bone: 'braco', attachment: 'fogo' }],
      skins: [{ name: 'default', attachments: { fogo: { fogo: { type: 'BONE_particle', seed: 0, path: 'fx' } } } }],
      animations: [{
        name: 'anda', duration: 1,
        timelines: [{ type: 'bone', target: 'braco', property: 'rotation', keys: [{ time: 0, value: 30 }, { time: 1, value: 60 }] }],
      }],
      extensionsUsed: ['BONE_particles'],
    } as unknown as BoneFile;
  }
  /** Descer, andar em quatro passos, subir — o mesmo arrasto dos outros blocos. */
  const ev = (p: { x: number; y: number }): ToolEvent => ({ x: p.x, y: p.y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 });
  function arrastar(tool: Tool, doc: Doc, de: { x: number; y: number }, ate: { x: number; y: number }): void {
    tool.onDown!(doc, ev(de));
    for (let i = 1; i <= 4; i++) tool.onMove!(doc, ev({ x: de.x + ((ate.x - de.x) * i) / 4, y: de.y + ((ate.y - de.y) * i) / 4 }));
    tool.onUp!(doc, ev(ate));
    doc.endMerge();
  }
  const emissor = (doc: Doc): Record<string, unknown> =>
    (doc.file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)['fogo']!['fogo']!;
  const escolhe = (doc: Doc): void => doc.select({ ...emptySelection(), slots: ['fogo'], attachments: [{ slot: 'fogo', attachment: 'fogo' }] });
  const lugar = (doc: Doc): { x: number; y: number; direction: number } => {
    const s = doc.skeleton!.findSlot('fogo')!;
    return emitterPlaceR15(s, s.attachment as never);
  };

  it('linha 3: o emissor escolhido é um "desenho" para as ferramentas, sem escala', () => {
    const doc = new Doc(arquivo());
    escolhe(doc);
    const p = pickedAttachment(doc)!;
    expect(p).not.toBeNull();
    expect(p.emitter).toBe(true);
    expect([p.scaleX, p.scaleY]).toEqual([1, 1]);
  });

  it('linha 3: Mover na BASE escreve x e y no emissor (§9.10), e a marca anda junto', () => {
    const doc = new Doc(arquivo());
    escolhe(doc);
    const antes = lugar(doc);
    arrastar(translateTool, doc, { x: antes.x, y: antes.y }, { x: antes.x + 20, y: antes.y - 10 });
    const def = emissor(doc);
    expect(typeof def['x']).toBe('number');
    expect(typeof def['y']).toBe('number');
    const depois = lugar(doc);
    expect(depois.x).toBeCloseTo(antes.x + 20, 3);
    expect(depois.y).toBeCloseTo(antes.y - 10, 3);
    // Um passo de desfazer, e o arquivo volta letra por letra.
    doc.undo();
    expect(emissor(doc)).toEqual({ type: 'BONE_particle', seed: 0, path: 'fx' });
  });

  it('linha 3: Girar na BASE escreve rotation, e o jato gira junto', () => {
    const doc = new Doc(arquivo());
    escolhe(doc);
    const o = lugar(doc);
    // Gira 90° em volta da origem do emissor: do ponto à direita ao de cima.
    arrastar(rotateTool, doc, { x: o.x + 40, y: o.y }, { x: o.x, y: o.y + 40 });
    expect(Number(emissor(doc)['rotation'])).toBeCloseTo(90, 1);
    expect(lugar(doc).direction).toBeCloseTo(o.direction + 90, 1);
  });

  it('linha 3: numa ANIMAÇÃO, mover cria chave só do emissor, pelo osso próprio (8d)', () => {
    const doc = new Doc(arquivo());
    doc.animation = 'anda';
    doc.time = 0.5;
    doc.repose();
    escolhe(doc);
    const antes = lugar(doc);
    arrastar(translateTool, doc, { x: antes.x, y: antes.y }, { x: antes.x + 15, y: antes.y + 5 });
    const slot = doc.file.slots!.find((s) => s.name === 'fogo')!;
    expect(isOwnBone(doc.file, slot.bone)).toBe(true);
    // O braço não ganhou chave nova; o osso próprio, sim.
    const tls = (doc.file.animations![0] as unknown as { timelines: Array<{ target: string; property: string }> }).timelines;
    expect(tls.filter((t) => t.target === 'braco')).toHaveLength(1);
    expect(tls.some((t) => t.target === slot.bone)).toBe(true);
    const depois = lugar(doc);
    expect(depois.x).toBeCloseTo(antes.x + 15, 2);
    expect(depois.y).toBeCloseTo(antes.y + 5, 2);
  });

  it('linha 3: Escalar o emissor é recusado, e o rodapé diz por quê', () => {
    const doc = new Doc(arquivo());
    escolhe(doc);
    const ditos: string[] = [];
    const notice = doc.notice.bind(doc);
    doc.notice = (t: string) => { ditos.push(t); notice(t); };
    const antes = JSON.stringify(doc.file);
    const o = lugar(doc);
    arrastar(scaleTool, doc, { x: o.x + 30, y: o.y }, { x: o.x + 60, y: o.y });
    expect(JSON.stringify(doc.file)).toBe(antes);
    expect(ditos.some((t) => t.startsWith('O emissor não tem escala'))).toBe(true);
  });

  it('linha 4: prender a outro osso (a tecla P, a Árvore e o campo Osso) deixa o emissor onde está', () => {
    const doc = new Doc(arquivo());
    Object.assign(emissor(doc), { x: 12, y: -4, rotation: 20 });
    doc.rebuild();
    const antes = lugar(doc);
    runReparentR15(doc, { bones: [], slots: ['fogo'], attachments: [] }, 'perna');
    expect(doc.file.slots!.find((s) => s.name === 'fogo')!.bone).toBe('perna');
    const depois = lugar(doc);
    expect(depois.x).toBeCloseTo(antes.x, 3);
    expect(depois.y).toBeCloseTo(antes.y, 3);
    expect(depois.direction).toBeCloseTo(antes.direction, 3);
    // Sem escala no emissor: a conta não escreve uma.
    expect(emissor(doc)['scaleX']).toBeUndefined();
  });

  it('linha 4: a ficha tem o campo Osso, e ele passa pelo runReparent', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/properties.ts'), 'utf8');
    expect(fonte).toContain('runReparent(doc, { ...emptySelection(), slots: [slot] }, value)');
    const osso = attachmentFields(arquivo(), 'fogo', 'fogo').flatMap((g) => g.fields).find((f) => f.key === 'bone')!;
    expect(osso.pointer).toBe('/slots/0/bone');
  });

  it('o emissor novo nasce apontando para CIMA no mundo, e no meio da cena quando o programa escolhe o osso', () => {
    // O tronco do herói é girado 90°: sem o giro, `direction 90` saía para a esquerda (foto 21).
    const tronco = { a: 0, b: -1, c: 1, d: 0, worldX: 0, worldY: 90 };
    expect(placementForR15(tronco, null)).toEqual({ x: 0, y: 0, rotation: -90 });
    // O meio da cena em (30, 150): no tronco, x 60 (para cima) e y −30.
    expect(placementForR15(tronco, { x: 30, y: 150 })).toEqual({ x: 60, y: -30, rotation: -90 });
    // Osso reto: nada a girar.
    expect(placementForR15({ a: 1, b: 0, c: 0, d: 1, worldX: 5, worldY: 5 }, null)).toEqual({ x: 0, y: 0, rotation: 0 });
  });
});

describe('rodada 46, lote 2 — toda ferramenta se explica', () => {
  it('toda ferramenta da barra tem dica com mais que o nome e a tecla', () => {
    const sem = toolbarItems(getTools()).filter((item) => !item.hint.includes('. '));
    expect(sem.map((item) => item.id)).toEqual([]);
  });

  it('toda ferramenta diz uma frase no rodapé ao ser pega, sem osso escolhido', () => {
    const caladas = getTools().map((tool) => tool.id).filter((id) => toolFooter(id, false) === null);
    expect(caladas).toEqual([]);
  });

  it('Ponto e Caixa dizem o Alt na dica, não só no rodapé', () => {
    for (const id of ['point', 'box']) {
      const item = toolbarItems(getTools()).find((i) => i.id === id);
      expect(item?.hint, id).toContain('Alt + arrastar');
    }
  });

  it('Alt sobre o meio de um lado troca o cursor para o de inclinar; canto com Alt continua escalando', () => {
    const box = boxFromCorners(
      { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 0, y: 5 }, { x: 15, y: 5 },
    );
    expect(transformCursor({ scale: 'n' }, box, true)).toBe('is-transform-shear-x');
    expect(transformCursor({ scale: 'e' }, box, true)).toBe('is-transform-shear-y');
    expect(transformCursor({ scale: 'n' }, box, false)).toMatch(/^is-transform-scale-/);
    expect(transformCursor({ scale: 'ne' }, box, true)).toMatch(/^is-transform-scale-/);
    expect(SHEAR_HOVER_NOTICE).toContain('Puxe ao longo do lado');
  });

  it('o CSS tem o cursor de inclinar e a mão do botão do meio, que vence a caixa', () => {
    const css = readFileSync(resolve(__dirname, '../src/viewport/viewport.css'), 'utf8');
    expect(css).toContain('.viewport-canvas.is-transform-shear-x');
    expect(css).toContain('.viewport-canvas.is-transform-shear-y');
    expect(css).toContain('.viewport-canvas.is-panning[class]');
  });
});

describe('rodada 46, lote 5 — o herói se deixa posar', () => {
  it('o osso preso por regra ganha a porta: a aba Regras vem para a frente', async () => {
    const mod = await import('../src/viewport/held-by-rule.js') as Record<string, unknown>;
    expect(String(mod['HELD_DOOR'] ?? '')).toContain('aba Regras veio para a frente');
    const vp = readFileSync(resolve(__dirname, '../src/viewport/viewport.ts'), 'utf8');
    expect(vp).toContain("runAction('mostrar-painel-regras')");
  });

  it('a Ficha rápida mostra a Inclinação em ° quando ela não é zero, e só então', () => {
    const doc = new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile);
    const sem = quickFields(doc.file, quickSubject({ ...emptySelection(), bones: ['torso'] }));
    expect(sem.some((f) => f.key === 'shearX')).toBe(false);
    const torso = doc.file.bones.find((b) => b.name === 'torso') as unknown as Record<string, unknown>;
    torso['shearX'] = 12;
    const com = quickFields(doc.file, quickSubject({ ...emptySelection(), bones: ['torso'] }));
    const campo = com.find((f) => f.key === 'shearX');
    expect(campo?.unit).toBe('°');
    expect(campo?.label).toBe('Inclinação X');
  });

  it('o herói abre ajustado à cena, e a caixa do zoom encolhe em tela pequena', () => {
    const main = readFileSync(resolve(__dirname, '../src/main.ts'), 'utf8');
    const abrir = main.slice(main.indexOf('const abrirExemplo'), main.indexOf("registerAction('abrir-exemplo'"));
    expect(abrir).toContain("runAction('ajustar')");
    const css = readFileSync(resolve(__dirname, '../src/viewport/viewport.css'), 'utf8');
    expect(css).toContain('@media (max-width: 1440px), (max-height: 800px)');
  });
});

describe('rodada 46, lote 5 — as notas do doc 80: o osso escolhido junto dos desenhos', () => {
  const heroiArquivo = (): BoneFile => JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile;
  const capa = { slot: 'cape_lower', attachment: 'cape_lower' };

  it('B com um osso escolhido à mão junto dos desenhos nasce NELE; o osso de carona não conta', async () => {
    const { newBoneParent } = await import('../src/viewport/tools/create-bone.js');
    const file = heroiArquivo();
    expect(newBoneParent({ ...emptySelection(), bones: ['arm'], attachments: [capa] }, file)).toBe('arm');
    // O osso `arm` veio de carona com o desenho `arm` (mesmo nome): não é escolha.
    expect(newBoneParent({ ...emptySelection(), bones: ['arm'], attachments: [{ slot: 'arm', attachment: 'arm' } as { slot: string }] }, file))
      .toBe(file.bones[0]!.name);
  });

  it('Ponto e Caixa seguem a mesma regra', async () => {
    const { shapeTarget } = await import('../src/panels/tree-commands.js');
    const file = heroiArquivo();
    expect(shapeTarget(file, { ...emptySelection(), bones: ['arm'], attachments: [capa] })).toEqual({ kind: 'bone', bone: 'arm' });
  });

  it('o nome do osso novo é o do PRIMEIRO desenho escolhido, e a dica diz isso', async () => {
    const m = await import('../src/viewport/tools/creation-words.js') as Record<string, unknown>;
    const primeiro = m['firstChosenSlot'] as ((s: unknown) => string | null) | undefined;
    expect(typeof primeiro).toBe('function');
    expect(primeiro!({ slots: [], attachments: [{ slot: 'cape_upper' }, { slot: 'cape_lower' }] })).toBe('cape_upper');
    const dica = toolbarItems(getTools()).find((i) => i.id === 'create-bone')?.hint ?? '';
    expect(dica).toContain('nome do primeiro escolhido');
  });

  it('osso e desenho somados: o rodapé fala dos dois', async () => {
    const m = await import('../src/viewport/tools/creation-words.js') as Record<string, unknown>;
    const mao = m['handPickedBones'] as ((s: unknown, f: (x: string) => string | null) => string[]) | undefined;
    expect(typeof mao).toBe('function');
    const file = heroiArquivo();
    const boneOf = (slot: string): string | null => (file.slots ?? []).find((s) => s.name === slot)?.bone ?? null;
    const sel = { bones: ['arm'], slots: [], attachments: [capa] };
    expect(palavras.chosenNotice([...mao!(sel, boneOf), 'cape_lower'])).toBe('2 escolhidos: arm, cape_lower');
  });

  it('Ponto e Caixa num slot dizem "no slot"', async () => {
    const { inSlotNotice } = await import('../src/panels/tree-commands.js');
    expect(inSlotNotice('Ponto', 'hair_ponto', 'hair')).toContain('no slot hair');
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 4 (doc 68): a barrinha, a dica e a linha de ajuda
// ---------------------------------------------------------------------------
const fonteR47L4 = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

describe('rodada 47, lote 4: o rodapé do gesto diz que a regra manda (nota a do doc 82)', () => {
  it('a frase do gesto ganha "(a regra X manda nele)" quando uma regra leva o osso', async () => {
    const { footerFor, heldTag } = await import('../src/viewport/tools/gesture-footer.js');
    expect(heldTag([])).toBe('');
    expect(heldTag(['ik_arm'])).toBe(' (a regra ik_arm manda nele)');
    expect(heldTag(['a', 'b'])).toBe(' (as regras a, b mandam nele)');
    const v = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0 };
    expect(footerFor({ kind: 'rotate' }, v, { ...v, rotation: 26.3 }, { dx: 0, dy: 0 }, ['ik_arm']))
      .toBe('Girar 26,3° (agora 26,3° local) (a regra ik_arm manda nele)');
  });

  it('o Transformar e as quatro ferramentas soltas passam as regras do osso', () => {
    expect(fonteR47L4('viewport/tools/transform-tool.ts')).toContain('rulesOfGesture(doc, g.bone, what)');
    expect(fonteR47L4('viewport/tools/gesture-footer.ts')).toContain('rulesOfGesture(doc, this.bone, what)');
  });

  it('só a regra que segura A PARTE do gesto: a IK gira o braço, mas não o tira do lugar (regra 21)', async () => {
    const { rulesHolding } = await import('../src/viewport/tools/gesture-footer.js');
    const file = { constraints: [
      { type: 'ik', name: 'ik_arm', bones: ['arm', 'forearm'], target: 'alvo' },
      { type: 'transform', name: 'tr', bones: ['arm'], target: 'x', mixX: 0, mixY: 0 },
      { type: 'physics', name: 'fi', bone: 'arm', rotation: 0.5 },
      { type: 'ik', name: 'desligada', bones: ['arm'], target: 'alvo', mix: 0 },
    ] };
    expect(rulesHolding(file, 'arm', 'rotation')).toEqual(['ik_arm', 'tr', 'fi']);
    expect(rulesHolding(file, 'arm', 'position')).toEqual([]);
    expect(rulesHolding(file, 'arm', 'scale')).toEqual(['tr']);
  });
});

// ---------------------------------------------------------------------------
// Prova de pessoa (05/11/2026): o retângulo de seleção diz o que pegou
// ---------------------------------------------------------------------------

describe('prova de pessoa: o retângulo de seleção fala', () => {
  it('diz quantos ficaram escolhidos, e o que fazer com eles; vazio diz como', async () => {
    const { boxSelectSays, selectionSize } = await import('../src/viewport/tools/select.js');
    expect(boxSelectSays(3, 14)).toBe('14 itens escolhidos pelo retângulo: Delete apaga, Esc tira a escolha');
    expect(boxSelectSays(1, 1)).toContain('1 item escolhido');
    expect(boxSelectSays(0, 0)).toBe('Retângulo vazio: arraste por cima das peças');
    // O desenho escolhido como slot e como imagem conta uma vez só.
    expect(selectionSize({
      bones: ['a', 'b'], slots: ['s'], attachments: [{ slot: 's', attachment: 'i' }, { slot: 't', attachment: 'j' }],
      constraints: ['r'], vertices: [],
    })).toBe(5);
  });

  it('o Selecionar chama a frase no fim do retângulo (antes: calado)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/viewport/tools/select.ts'), 'utf8');
    expect(fonte).toContain('doc.notice(boxSelectSays(hits.length, selectionSize(doc.selection)));');
  });
});

describe('prova de pessoa: Malha e Pesos sem nada escolhido falam, e o essencial vem antes dos dois-pontos', () => {
  it('o rodapé apertado mostra só o que vem antes dos dois-pontos: ali tem de estar o que falta', async () => {
    const { NO_DRAWING_FOR_MESH } = await import('../src/viewport/tools/mesh-tool.js');
    const { NO_MESH_FOR_WEIGHTS } = await import('../src/viewport/tools/weights-tool.js');
    const { boxSelectSays } = await import('../src/viewport/tools/select.js');
    const { versoesDaFrase } = await import('../src/ui/shell-status.js');
    const menor = (f: string): string => versoesDaFrase(f).at(-1)!;
    expect(menor(NO_DRAWING_FOR_MESH)).toBe('Malha sem desenho escolhido');
    expect(menor(NO_MESH_FOR_WEIGHTS)).toBe('Pesos sem malha escolhida');
    expect(menor(boxSelectSays(2, 14))).toBe('14 itens escolhidos pelo retângulo');
    expect(menor(boxSelectSays(0, 0))).toBe('Retângulo vazio');
  });

  it('as duas ferramentas dizem a frase no clique sem escolha (antes: caladas)', () => {
    const malha = readFileSync(resolve(__dirname, '../src/viewport/tools/mesh-tool.ts'), 'utf8');
    const pesos = readFileSync(resolve(__dirname, '../src/viewport/tools/weights-tool.ts'), 'utf8');
    expect(malha).toContain('(nada ? NO_DRAWING_FOR_MESH : null)');
    expect(pesos).toContain('doc.notice(NO_MESH_FOR_WEIGHTS);');
  });
});
