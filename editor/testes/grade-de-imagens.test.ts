/**
 * Grade de imagens e botão direito — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote60b-grade-de-imagens`, `lote60b-primeiro-a-arte`, `lote60c-botao-direito-e-transparente`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { takenBaseUris } from '../src/panels/slot-base-model.js';
import { allSameNotice, everywhereNotice } from '../src/panels/image-picker-model.js';
import { describe, expect, it, afterEach } from 'vitest';
import { loadAtlas } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { withProvisional } from '../src/io/project-folder.js';
import { SwapSlotImage, DropImageAsSlot, dropPlace } from '../src/panels/palette-model.js';
import { Camera } from '../src/viewport/camera.js';
import { GRID_CELL, GRID_FOOT, GRID_GAP, GRID_PAD, gridAnchor, gridEntries, gridLayout, gridSize, nextGridIndex, parseGridSource, slotImages } from '../src/panels/image-grid-model.js';
import { DEFAULT_VIEW, parseViewSettings } from '../src/viewport/onion.js';
import { emptySelection, getTools } from '../src/contract.js';
import type { ToolEvent } from '../src/contract.js';
import { CreateBoneAndGrab, createBonePlan, describeBone, grabNotice, newBoneParent } from '../src/viewport/tools/create-bone.js';
import { CREATE_BONE_FOOTER, toolbarItems } from '../src/ui/toolbar-model.js';
import { ALPHA_PICK_MIN, pickAt, pickInRect, setAlphaSampler, uvAt } from '../src/viewport/picking.js';
import { transformTool } from '../src/viewport/tools/transform-tool.js';

// ---------------------------------------------------------------------------
// grade de imagens (lote 60b) — era `lote60b-grade-de-imagens.test.ts`
// ---------------------------------------------------------------------------

describe('grade de imagens (lote 60b)', () => {
/**
 * Lote 60b (plano consertos do teste): a troca de imagem como no Spriter.
 *
 * Sem DOM. Foto do Spriter, 11/09/2026: com a mão escolhida aparece, na cena,
 * embaixo do desenho, a faixa de miniaturas da mesma pasta e o seletor
 * "fonte: pasta | objeto". Do nosso, o Humberto: *"o seu é um menu dos
 * satanás"*; e *"a nossa pode ser em grade"*. O que se prova aqui: o que a
 * grade mostra, quantas linhas ela tem, onde fica, e que o clique numa
 * miniatura troca pelo pivô, num passo de desfazer.
 */
const SRC = resolve(__dirname, '../src');

const PASTA = ['maos/mao (10)', 'maos/mao (2)', 'maos/mao (1)', 'maos/mao (3)', 'maos/mao (4)', 'maos/mao (5)', 'cabecas/c'];

/** A mão mostra `mao (2)`; na pele `luva`, `mao (5)`. Com `fechada`, um terceiro desenho, só usado por chave. */
function arquivo(fechada = false): BoneFile {
  const padrao: Record<string, unknown> = {
    mao: { type: 'region', path: 'maos/mao (2)', width: 10, height: 10 },
    alvo: { type: 'point' },
  };
  if (fechada) padrao['fechada'] = { type: 'region', path: 'maos/mao (3)', width: 10, height: 10 };
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'mao', bone: 'root', attachment: 'mao' }],
    skins: [
      { name: 'default', attachments: { mao: padrao } },
      { name: 'luva', attachments: { mao: { mao: { type: 'region', path: 'maos/mao (5)', width: 10, height: 10 } } } },
    ],
    animations: fechada
      ? [{ name: 'abre', timelines: [{ type: 'slot', target: 'mao', property: 'attachment', keys: [{ time: 0.5, value: 'fechada' }] }] }]
      : [],
  } as unknown as BoneFile;
}

describe('o que a grade mostra', () => {
  it('fonte pasta: as 6 mãos da subpasta, em ordem natural, a atual marcada', () => {
    const entradas = gridEntries(arquivo(), PASTA, 'mao', 'pasta', { current: 'maos/mao (2)', folderOpen: true });
    expect(entradas.map((e) => e.name)).toEqual([
      'maos/mao (1)', 'maos/mao (2)', 'maos/mao (3)', 'maos/mao (4)', 'maos/mao (5)', 'maos/mao (10)',
    ]);
    expect(entradas.map((e) => e.current)).toEqual([false, true, false, false, false, false]);
    expect(entradas[0]!.label).toBe('mao (1)');
  });

  it('fonte objeto: só as que o slot já usou — duas, uma por pele; o ponto não conta', () => {
    const entradas = gridEntries(arquivo(), PASTA, 'mao', 'objeto', { current: 'maos/mao (2)' });
    expect(entradas.map((e) => e.name)).toEqual(['maos/mao (2)', 'maos/mao (5)']);
    expect(entradas.map((e) => e.current)).toEqual([true, false]);
  });

  it('fonte objeto: a imagem que só uma chave de Desenho mostra também entra', () => {
    expect(slotImages(arquivo(true), 'mao')).toEqual(['maos/mao (2)', 'maos/mao (3)', 'maos/mao (5)']);
  });

  it('imagem sem pasta aberta: as do mesmo prefixo até a última /', () => {
    const entradas = gridEntries(arquivo(), ['a/x/um', 'a/x/dois', 'a/y/tres', 'solta'], 'mao', 'pasta', { current: 'a/x/um' });
    expect(entradas.map((e) => e.name)).toEqual(['a/x/dois', 'a/x/um']);
  });

  it('a fonte guardada no navegador: só "objeto" muda; o resto é "pasta"', () => {
    expect(parseGridSource('objeto')).toBe('objeto');
    expect(parseGridSource('pasta')).toBe('pasta');
    expect(parseGridSource(null)).toBe('pasta');
    expect(parseGridSource('satanás')).toBe('pasta');
  });
});

describe('a grade: linhas, tamanho e lugar', () => {
  it('gridLayout: 14 → três linhas (6, 6, 2); 5 → uma; 0 → nenhuma', () => {
    expect(gridLayout(14)).toEqual([6, 6, 2]);
    expect(gridLayout(5)).toEqual([5]);
    expect(gridLayout(6)).toEqual([6]);
    expect(gridLayout(0)).toEqual([]);
  });

  it('gridSize bate com o CSS: 40 px, 4 de espaço, 6 de borda, 26 da fonte', () => {
    expect([GRID_CELL, GRID_GAP, GRID_PAD, GRID_FOOT]).toEqual([40, 4, 6, 26]);
    expect(gridSize([6, 6, 2])).toEqual({ width: 272, height: 166 });
    const css = readFileSync(resolve(SRC, 'viewport/viewport.css'), 'utf8');
    const bloco = css.slice(css.indexOf('.grade-imagens {'));
    expect(bloco).toContain('padding: 6px;');
    expect(bloco).toContain('gap: 4px;');
    expect(bloco).toContain('width: 40px;');
    expect(bloco).toContain('height: 22px;');
    expect(bloco).toContain('margin-top: 4px;');
    expect(bloco).toContain('overflow-x: hidden;');
  });

  function camera(): Camera {
    const c = new Camera();
    c.setViewSize(800, 600);
    return c;
  }

  it('desenho no meio da cena: embaixo dele, centrada', () => {
    const lugar = gridAnchor({ minX: -20, minY: -10, maxX: 20, maxY: 10 }, camera(), [6]);
    expect(lugar).toEqual({ left: 264, top: 318, width: 272, height: 78, side: 'baixo' });
  });

  it('desenho colado no rodapé: a grade vai para cima dele', () => {
    const lugar = gridAnchor({ minX: -20, minY: -290, maxX: 20, maxY: -270 }, camera(), [6]);
    expect(lugar.side).toBe('cima');
    expect(lugar.top).toBe(484);
  });

  it('nunca fora da cena: encosta na borda que faltar', () => {
    const naBorda = gridAnchor({ minX: -395, minY: -10, maxX: -385, maxY: 10 }, camera(), [6]);
    expect(naBorda.left).toBe(0);
    const enorme = gridAnchor({ minX: -20, minY: -10, maxX: 20, maxY: 10 }, camera(), gridLayout(120));
    expect(enorme.top).toBe(0);
    expect(enorme.left).toBeGreaterThanOrEqual(0);
  });

  it('as setas: ← → uma, ↑ ↓ uma linha, sem sair da grade', () => {
    expect(nextGridIndex(-1, 'ArrowRight', 14)).toBe(0);
    expect(nextGridIndex(0, 'ArrowRight', 14)).toBe(1);
    expect(nextGridIndex(5, 'ArrowDown', 14)).toBe(11);
    expect(nextGridIndex(12, 'ArrowDown', 14)).toBe(12);
    expect(nextGridIndex(0, 'ArrowLeft', 14)).toBe(0);
    expect(nextGridIndex(7, 'ArrowUp', 14)).toBe(1);
    expect(nextGridIndex(3, 'a', 14)).toBeNull();
  });
});

/** O atlas provisório do lote 60: três mãos 100×50, pivô no pulso. */
function maos(): ReturnType<typeof loadAtlas> {
  let tree = withProvisional(null, { name: 'maos/mao_aberta', path: 'maos/mao_aberta.png', width: 100, height: 50 }, [40, 45]);
  tree = withProvisional(tree, { name: 'maos/mao_fechada', path: 'maos/mao_fechada.png', width: 100, height: 50 }, [40, 45]);
  tree = withProvisional(tree, { name: 'maos/mao_2', path: 'maos/mao_2.png', width: 100, height: 50 }, [40, 45]);
  return loadAtlas(JSON.parse(JSON.stringify(tree)));
}

describe('clicar numa miniatura', () => {
  it('a 3ª: o desenho aponta para ela, cai pelo pivô, sem tamanho; um desfazer volta por texto', () => {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }],
      slots: [{ name: 'mao', bone: 'root', attachment: 'mao' }],
      skins: [{ name: 'default', attachments: { mao: { mao: { type: 'region', path: 'maos/mao_aberta', x: 5, y: 5, width: 10, height: 10 } } } }],
    } as unknown as BoneFile;
    const doc = new Doc(file, { atlases: [maos()] });
    const antes = JSON.stringify(doc.file);
    const nomes = doc.atlases.flatMap((a) => a.regions.map((r) => r.name));
    const entradas = gridEntries(doc.file, nomes, 'mao', 'pasta', { current: 'maos/mao_aberta', folderOpen: true });
    expect(entradas.map((e) => e.name)).toEqual(['maos/mao_2', 'maos/mao_aberta', 'maos/mao_fechada']);
    // O clique da grade é o `chooseImage` do lote 60; em Montagem, ele roda este comando.
    doc.run(new SwapSlotImage('mao', entradas[2]!.name, 'default', 'mao'));
    const def = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['mao']!['mao']!;
    expect(def['path']).toBe('maos/mao_fechada');
    // Fecho 3 (29/09/2026, chat H), P15(a): o pivô da nova cai ONDE ESTAVA o da
    // velha, e não na origem do osso. A velha, 100×50 esticada em 10×10, tinha
    // o pulso (40, 45) em (5 − 1; 5 + 4) = (4; 9) no osso; a nova, sem esticar,
    // põe o centro em (4 + 10; 9 − 20) = (14; −11). Antes: (10; −20).
    expect(def['x']).toBeCloseTo(14, 6);
    expect(def['y']).toBeCloseTo(-11, 6);
    expect(def).not.toHaveProperty('width');
    expect(def).not.toHaveProperty('height');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

describe('na cena', () => {
  it('a cena põe a grade a cada quadro, esconde no arrasto, e não abre mais a lista no clique parado', () => {
    // Lote A5c: a cena mora em três arquivos; o desenho, em viewport-draw.ts,
    // onde `this` virou `panel`.
    const cena = ['viewport', 'viewport-toolbar', 'viewport-draw']
      .map((nome) => readFileSync(resolve(SRC, `viewport/${nome}.ts`), 'utf8')).join('\n');
    expect(cena).toMatch(/(this|panel)\.syncImageGridLayer\(\);/);
    expect(cena).toMatch(/syncImageGrid\(doc, stage, (this|panel)\.camera/);
    expect(cena).toMatch(/!(this|panel)\.pointerDown/);
    expect(cena).not.toContain('opensPicker(');
    // Lote 60c: quem abre a grade é o botão direito no desenho.
    expect(cena).toContain('requestImageGrid');
  });

  // Rodada 44, lote 2: a fonte NÃO fica mais no navegador — a grade abre
  // sempre em "pasta" (a "objeto" de uma peça voltava na seguinte, doc 55).
  it('o clique troca, Shift ou "Em todas as peles" troca em todas, Esc fecha, e a fonte vale só na grade aberta', () => {
    const grade = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(grade).toContain('setImageGridSync(syncImageGridIn);');
    // Lote 60c: trocar fecha a grade; "Em todas as peles" vale como o Shift.
    expect(grade).toContain('const todas = everywhere || event.shiftKey;');
    expect(grade).toContain('void chooseImage(doc, target, entry.name, todas);');
    expect(grade).toContain("event.key === 'Escape'");
    expect(grade).not.toContain("'recorte-grade-fonte'");
    expect(grade).toContain("gridSource = 'pasta';");
  });

  // Lote 60c: a grade não aparece mais sozinha, então a opção de desligá-la
  // saiu de Exibição. Este teste provava a opção; agora prova que ela saiu.
  it('Exibição → Grade de imagens saiu: a grade só abre pelo botão direito', () => {
    expect('imageGrid' in DEFAULT_VIEW).toBe(false);
    expect(parseViewSettings({ imageGrid: false })).not.toHaveProperty('imageGrid');
    const menu = readFileSync(resolve(SRC, 'ui/menus.ts'), 'utf8');
    expect(menu).not.toContain("'Grade de imagens'");
    const painel = readFileSync(resolve(SRC, 'panels/view-panel.ts'), 'utf8');
    expect(painel).not.toContain('ver-grade-imagens');
  });
});
});

// ---------------------------------------------------------------------------
// primeiro a arte (lote 60b) — era `lote60b-primeiro-a-arte.test.ts`
// ---------------------------------------------------------------------------

describe('primeiro a arte (lote 60b)', () => {
/**
 * Acréscimo ao lote 60 (plano pasta do projeto): primeiro a arte, depois os
 * ossos.
 *
 * Sem DOM. O Humberto, 10/09/2026: *"quero montar como no Spriter: a arte das
 * peças para dentro, e depois faço os ossos. Hoje, quando arrasto a imagem
 * para a tela, ela fica presa a um osso inicial. Não quero isso."* O que se
 * prova aqui: a imagem solta nasce na raiz, seja qual for o osso escolhido; o
 * Criar osso com desenhos escolhidos os pega **sem mover**, num passo só.
 */
const SRC = resolve(__dirname, '../src');

/**
 * A raiz na origem; `arm` deslocado e girado 90°. Dois desenhos soltos na
 * raiz (a arte que entrou primeiro) e um terceiro já no `arm`.
 */
function boneco(): Doc {
  return new Doc({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'arm', parent: 'root', x: 50, y: 10, rotation: 90 }],
    slots: [
      { name: 'a', bone: 'root', attachment: 'a' },
      { name: 'b', bone: 'root', attachment: 'b' },
      { name: 'c', bone: 'arm', attachment: 'c' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        a: { a: { type: 'region', path: 'a', x: 30, y: 40, width: 10, height: 10 } },
        b: { b: { type: 'region', path: 'b', x: -20, y: 5, rotation: 15, width: 10, height: 10 } },
        c: { c: { type: 'region', path: 'c', x: 3, y: 4, width: 10, height: 10 } },
      },
    }],
  } as unknown as BoneFile);
}

/** Onde o desenho do slot está no mundo: a origem dele, pelo osso do slot. */
function mundo(doc: Doc, slot: string): { x: number; y: number } {
  const bone = doc.skeleton!.findSlot(slot)!.bone;
  const def = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, { x?: number; y?: number }>>)[slot]![slot]!;
  return bone.localToWorld(def.x ?? 0, def.y ?? 0);
}

describe('a imagem solta nasce na raiz', () => {
  it('com o osso arm escolhido, o slot nasce em root, e x/y é o ponto do mundo', () => {
    const doc = boneco();
    doc.select({ ...emptySelection(), bones: ['arm'] });
    const lugar = dropPlace(doc.skeleton, doc.file, 30, 40);
    expect(lugar.bone).toBe('root');
    expect(lugar.x).toBeCloseTo(30, 9);
    expect(lugar.y).toBeCloseTo(40, 9);
    const command = new DropImageAsSlot(doc.file, 'mao', lugar.bone, doc.visibleSkins, lugar.x, lugar.y);
    doc.run(command);
    expect(doc.file.slots!.find((s) => s.name === command.name)!.bone).toBe('root');
  });

  it('a cena não olha mais o osso escolhido ao soltar', () => {
    const cena = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8');
    // Degrau 4b: a peça cai no corpo do instante (9.13).
    expect(cena).toContain('dropPlace(doc.skeleton, corpoDe(doc).file');
    expect(cena).not.toContain("const boneName = doc.selection.bones[0] ?? doc.file.bones?.[0]?.name ?? 'root';");
  });
});

describe('o osso novo pega os desenhos escolhidos', () => {
  it('dois desenhos, Criar osso de (0,0) a (100,0): o osso em root, os dois nele, sem sair do lugar', () => {
    const doc = boneco();
    const antes = { a: mundo(doc, 'a'), b: mundo(doc, 'b') };
    const texto = JSON.stringify(doc.file);
    const selecao = { ...emptySelection(), bones: ['root'], slots: ['a', 'b'] };
    const def = describeBone(doc.skeleton!, newBoneParent(selecao, doc.file), ['root', 'arm'], 0, 0, 100, 0, 1);
    const command = new CreateBoneAndGrab(def, ['a', 'b']);
    doc.run(command);

    expect(def.parent).toBe('root');
    expect(command.grabbed).toBe(2);
    expect(doc.file.slots!.find((s) => s.name === 'a')!.bone).toBe(def.name);
    expect(doc.file.slots!.find((s) => s.name === 'b')!.bone).toBe(def.name);
    for (const slot of ['a', 'b'] as const) {
      const depois = mundo(doc, slot);
      expect(depois.x, slot).toBeCloseTo(antes[slot].x, 6);
      expect(depois.y, slot).toBeCloseTo(antes[slot].y, 6);
    }
    // Um passo de desfazer devolve os três: o osso e os dois desenhos.
    expect(doc.undoLabel).toBe('Criar osso e pegar os desenhos');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('com o osso arm escolhido, o novo nasce filho de arm, e os desenhos vão para o novo', () => {
    const doc = boneco();
    const selecao = { ...emptySelection(), bones: ['arm'], slots: ['a'] };
    const antes = mundo(doc, 'a');
    const def = describeBone(doc.skeleton!, newBoneParent(selecao, doc.file), ['root', 'arm'], 60, 10, 60, 60, 1);
    doc.run(new CreateBoneAndGrab(def, ['a']));
    expect(def.parent).toBe('arm');
    expect(doc.file.slots!.find((s) => s.name === 'a')!.bone).toBe(def.name);
    expect(mundo(doc, 'a').x).toBeCloseTo(antes.x, 6);
    expect(mundo(doc, 'a').y).toBeCloseTo(antes.y, 6);
  });

  it('o plano do arrasto: sem desenho, como hoje; Ctrl cria sem pegar; com animação aberta também pega (degrau 4a)', () => {
    expect(createBonePlan(0, false)).toBe('sozinho');
    expect(createBonePlan(2, false)).toBe('pegar');
    expect(createBonePlan(2, true)).toBe('sozinho');
    // O plano não pergunta mais o modo: não existe a saída 'animando', que
    // mandava pegar os desenhos "na Montagem". A troca vai para a base.
    expect(createBonePlan.length).toBe(2);
    expect(newBoneParent(emptySelection(), { bones: [{ name: 'root' }] })).toBe('root');
  });

  it('o rodapé e a dica dizem o gesto', () => {
    expect(grabNotice(3, false)).toBe('Osso novo pegou 3 desenhos, sem mover');
    expect(grabNotice(1, false)).toBe('Osso novo pegou 1 desenho, sem mover');
    expect(CREATE_BONE_FOOTER).toContain('Com desenhos escolhidos, o osso novo pega os desenhos');
    const botao = toolbarItems(getTools()).find((item) => item.id === 'create-bone');
    expect(botao?.hint ?? '').toContain('Arraste para criar. Com desenhos escolhidos, o osso novo pega os desenhos');
  });
});
});

// ---------------------------------------------------------------------------
// botao direito e transparente (lote 60c) — era `lote60c-botao-direito-e-transparente.test.ts`
// ---------------------------------------------------------------------------

describe('botao direito e transparente (lote 60c)', () => {
/**
 * Lote 60c — dois recados do Humberto, 11/09/2026, com fotos:
 *
 * - *"joga isso [a grade] pro outro botão, o de opções, é o botão direito … e
 *   não sei por que tem trocar pivô no botão direito; era para ser trocar
 *   imagens e algumas opções como no Spriter"*;
 * - *"se eu clicar em uma parte sem imagem eu quero que o clique passe direto
 *   como no Spriter"*.
 *
 * Sem DOM. O leitor de pixel é de mentira: metade esquerda da imagem
 * transparente, metade direita opaca.
 */
const SRC = resolve(__dirname, '../src');

/** Uma peça de 100×50 na raiz, no meio do mundo: de (−50, −25) a (50, 25). */
function cena(): Doc {
  const tree = withProvisional(null, { name: 'pecas/peca', path: 'pecas/peca.png', width: 100, height: 50 });
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'peca', bone: 'root', attachment: 'peca' }],
    skins: [{ name: 'default', attachments: { peca: { peca: { type: 'region', path: 'pecas/peca' } } } }],
  } as unknown as BoneFile;
  return new Doc(file, { atlases: [loadAtlas(JSON.parse(JSON.stringify(tree)))] });
}

/** Metade esquerda da página transparente, a direita opaca. */
const METADE = (_page: object, u: number): number => (u < 0.5 ? 0 : 255);

function ev(x: number, y: number): ToolEvent {
  return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 };
}

afterEach(() => setAlphaSampler(null));

describe('o clique passa pela parte transparente', () => {
  it('uvAt: o ponto dentro do quadrado dá o UV pelos pesos do triângulo', () => {
    const uv = uvAt([0, 0, 10, 0, 10, 10, 0, 10], [0, 1, 2, 0, 2, 3], [0, 1, 1, 1, 1, 0, 0, 0], 2.5, 7.5)!;
    expect(uv.u).toBeCloseTo(0.25, 9);
    expect(uv.v).toBeCloseTo(0.25, 9);
    expect(uvAt([0, 0, 10, 0, 10, 10], [0, 1, 2], [0, 0, 1, 0, 1, 1], 50, 50)).toBeNull();
  });

  it('sem leitor de pixel, a peça pega em qualquer parte do retângulo, como antes', () => {
    const doc = cena();
    expect(pickAt(doc.skeleton, -25, 0, 1)?.slot).toBe('peca');
    expect(pickAt(doc.skeleton, 25, 0, 1)?.slot).toBe('peca');
  });

  it('com o leitor: no transparente o clique passa direto; no opaco, pega', () => {
    const doc = cena();
    setAlphaSampler(METADE);
    expect(pickAt(doc.skeleton, -25, 0, 1)).toBeNull();
    expect(pickAt(doc.skeleton, 25, 0, 1)?.slot).toBe('peca');
    expect(ALPHA_PICK_MIN).toBe(16);
  });

  it('imagem que ainda não chegou (o leitor não sabe): pega, como antes', () => {
    const doc = cena();
    setAlphaSampler(() => null);
    expect(pickAt(doc.skeleton, -25, 0, 1)?.slot).toBe('peca');
  });

  it('o retângulo de seleção continua pegando a peça que ele encosta', () => {
    const doc = cena();
    setAlphaSampler(METADE);
    expect(pickInRect(doc.skeleton, { x1: -60, y1: -30, x2: -20, y2: 30 }).map((h) => h.slot)).toEqual(['peca']);
  });

  it('Transformar com a peça escolhida: clique no miolo transparente passa direto e limpa a escolha', () => {
    const doc = cena();
    setAlphaSampler(METADE);
    doc.select({ ...emptySelection(), slots: ['peca'], attachments: [{ slot: 'peca', attachment: 'peca' }] });
    transformTool.onDown!(doc, ev(-25, 0));
    transformTool.onUp!(doc, ev(-25, 0));
    doc.endMerge();
    expect(doc.selection.attachments).toEqual([]);
  });

  it('Transformar: arrastar pelo pixel opaco da peça escolhida continua movendo', () => {
    const doc = cena();
    setAlphaSampler(METADE);
    doc.select({ ...emptySelection(), slots: ['peca'], attachments: [{ slot: 'peca', attachment: 'peca' }] });
    transformTool.onDown!(doc, ev(25, 0));
    for (let i = 1; i <= 4; i++) transformTool.onMove!(doc, ev(25 + (10 * i) / 4, 0));
    transformTool.onUp!(doc, ev(35, 0));
    doc.endMerge();
    const def = (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, number>>>)['peca']!['peca']!;
    expect(def['x']).toBeCloseTo(10, 6);
  });

  it('a cena instala o leitor de pixel, e o desinstala ao desmontar', () => {
    const cenaFonte = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8');
    expect(cenaFonte).toContain('setAlphaSampler((page, u, v) => this.alphaAt(page, u, v));');
    expect(cenaFonte).toContain('setAlphaSampler(null);');
  });
});

describe('o botão direito no desenho: trocar a imagem e algumas opções', () => {
  it('a cena abre a grade com as opções; cada opção escolhe só o desenho antes de rodar', () => {
    const cenaFonte = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8');
    expect(cenaFonte).toContain('requestImageGrid(doc, stage, this.camera');
    expect(cenaFonte).toContain('doc.select(soDesenho); runAction(acao);');
    for (const nome of ['Trazer para a frente', 'Mandar para trás', 'Duplicar', 'Apagar']) {
      expect(cenaFonte).toContain(`opcao('${nome}'`);
    }
    expect(cenaFonte).not.toContain("'Definir pivô…'");
  });

  it('a grade só aparece para o desenho do botão direito, e fecha ao escolher outro, trocar ou usar opção', () => {
    const grade = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(grade).toContain('setImageGridOpener(openImageGridIn);');
    expect(grade).toContain('if (chosen !== openFor) closeGrid();');
    expect(grade).toContain("'Em todas as skins'");
    expect(grade).toContain("window.addEventListener('pointerdown', onOutsideGrid, true);");
  });

  it('o tamanho da grade conta as opções: 5 opções de 22 px, 10 de espaço, no mínimo 150 de largura', () => {
    expect(gridSize([6], 5)).toEqual({ width: 272, height: 198 });
    expect(gridSize([1], 5).width).toBe(150);
    expect(gridSize([6])).toEqual({ width: 272, height: 78 });
  });
});
});

// ---------------------------------------------------------------------------
// A grade lista entidades (degrau 8, tarefa 8.1 — E6 e E7)
// ---------------------------------------------------------------------------

import {
  SwapForEntity, SwapForImage, entityEntries, entitySwapNotice, gridNow, gridTarget,
} from '../src/panels/image-picker-model.js';
import { gridCells, gridEntityStart } from '../src/panels/image-grid-model.js';
import { pivotInBone, placeAtPivot } from '../src/io/pivot-model.js';

describe('a grade do botão direito lista entidades (degrau 8)', () => {
/**
 * E6 e E7, palavra do Humberto: *"a grade do botão direito lista entidades, e
 * trocar imagem por entidade herda osso, pivô, ordem e chaves"*.
 *
 * Sem DOM (regra 8): prova-se a conta — quem a grade lista, o que a troca
 * escreve no arquivo, e onde a raiz do filho cai. O desenho da célula é
 * conferido no texto de `image-picker.ts`, como o resto deste arquivo faz.
 */
const SRC8 = resolve(__dirname, '../src');

/**
 * Um atlas com a mão de 40×40 e o **pivô no pulso**: `(20, 4)`, quatro pixels
 * acima da borda de baixo, no meio. É o caso real: a mão gira no pulso, não no
 * centro do quadro.
 */
function atlasDoPulso(comPivo = true): ReturnType<typeof loadAtlas> {
  const pivo = comPivo ? [20, 4] as [number, number] : undefined;
  let tree = withProvisional(null, { name: 'maos/mao (2)', path: 'maos/mao (2).png', width: 40, height: 40 }, pivo);
  tree = withProvisional(tree, { name: 'maos/mao (5)', path: 'maos/mao (5).png', width: 40, height: 40 }, pivo);
  return loadAtlas(JSON.parse(JSON.stringify(tree)) as never);
}

/** Um slot `mao`, com a imagem posta PELO PIVÔ, e uma chave que a mostra. */
function comMao(): { doc: Doc; ditos: string[] } {
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'costas', bone: 'root', attachment: 'costas' }, { name: 'mao', bone: 'root', attachment: 'mao' }],
    skins: [{
      name: 'default',
      attachments: {
        costas: { costas: { type: 'point' } },
        // O pivô em (20, 4) numa imagem 40×40 põe o centro 16 px acima do pulso.
        mao: { mao: { type: 'region', path: 'maos/mao (2)', x: 0, y: 16 } },
      },
    }],
    animations: [{
      name: 'acenar',
      duration: 1,
      timelines: [{
        type: 'slot', target: 'mao', property: 'attachment',
        keys: [{ time: 0, value: 'mao' }, { time: 0.5, value: null }],
      }],
    }],
  } as unknown as BoneFile;
  const doc = new Doc(file, { atlases: [atlasDoPulso()] });
  const ditos: string[] = [];
  const dizer = doc.notice.bind(doc);
  doc.notice = (texto: string): void => { ditos.push(texto); dizer(texto); };
  return { doc, ditos };
}

/** O anexo `mao` da pele `default`, cru. */
function anexoDaMao(doc: Doc): Record<string, unknown> {
  const porSlot = doc.file.skins![0]!.attachments!['mao'] as unknown as Record<string, Record<string, unknown>>;
  return porSlot['mao']!;
}

it('as entidades vêm DEPOIS das imagens, e nunca no meio delas', () => {
  const imagens = [
    { name: 'maos/mao (2)', label: 'mao (2)', current: true },
    { name: 'maos/mao (5)', label: 'mao (5)', current: false },
  ];
  const entidades = entityEntries([{ uri: 'espada.bone', name: 'espada' }], null);
  const celulas = gridCells(imagens, entidades);
  expect(celulas.map((c) => c.name)).toEqual(['maos/mao (2)', 'maos/mao (5)', 'espada.bone']);
  expect(gridEntityStart(celulas)).toBe(2);
  // Sem entidade nenhuma, a grade é a de sempre, célula por célula.
  expect(gridCells(imagens, [])).toEqual(imagens);
  expect(gridEntityStart(imagens)).toBe(2);
});

it('a entidade de agora vem marcada; com uma imagem na mão, nenhuma fica', () => {
  const entidades = entityEntries(
    [{ uri: 'espada.bone', name: 'espada' }, { uri: 'escudo.bone', name: 'escudo' }],
    { kind: 'entidade', name: 'escudo.bone' },
  );
  expect(entidades.map((e) => e.current)).toEqual([false, true]);
  expect(entidades[0]!.kind).toBe('entidade');
  expect(entityEntries([{ uri: 'espada.bone', name: 'espada' }], { kind: 'imagem', name: 'maos/mao (2)' })
    .map((e) => e.current)).toEqual([false]);
});

it('a grade sabe o que o desenho mostra: imagem, entidade, ou nada', () => {
  const { doc } = comMao();
  expect(gridNow(doc.file as never, 'default', 'mao', 'mao')).toEqual({ kind: 'imagem', name: 'maos/mao (2)' });
  // Um ponto não mostra nem imagem nem entidade: a grade não abre nele.
  expect(gridNow(doc.file as never, 'default', 'costas', 'costas')).toBe(null);
  doc.run(new SwapForEntity('mao', 'mao', 'default', 'espada.bone'));
  expect(gridNow(doc.file as never, 'default', 'mao', 'mao')).toEqual({ kind: 'entidade', name: 'espada.bone' });
});

it('trocar por entidade herda OSSO, ORDEM e CHAVES: o slot não se mexe', () => {
  const { doc } = comMao();
  const ordem = (): string[] => (doc.file.slots ?? []).map((s) => s.name);
  const antes = ordem();
  const chaves = JSON.stringify(doc.file.animations);
  doc.run(new SwapForEntity('mao', 'mao', 'default', 'espada.bone'));
  const anexo = anexoDaMao(doc);
  expect(anexo['type']).toBe('skeleton');
  expect(anexo['uri']).toBe('espada.bone');
  // O slot é o mesmo, no mesmo osso e no mesmo lugar da ordem de desenho…
  expect(ordem()).toEqual(antes);
  expect(doc.file.slots!.find((s) => s.name === 'mao')!.bone).toBe('root');
  // …e o NOME do anexo ficou, que é o que faz as chaves continuarem valendo.
  expect(JSON.stringify(doc.file.animations)).toBe(chaves);
});

it('a raiz do filho cai no PIVÔ da imagem, não no centro dela', () => {
  const { doc } = comMao();
  const command = new SwapForEntity('mao', 'mao', 'default', 'espada.bone');
  doc.run(command);
  // A imagem estava posta pelo pivô: o pulso na origem do osso.
  expect(command.pin).toEqual({ x: 0, y: 0 });
  expect(anexoDaMao(doc)['x']).toBe(0);
  expect(anexoDaMao(doc)['y']).toBe(0);
});

it('a mão fora do lugar leva a entidade para onde o PULSO está, não o centro', () => {
  const { doc } = comMao();
  // Alguém arrastou o desenho: o centro foi para (30, 66), e o pulso para (30, 50).
  const anexo = anexoDaMao(doc);
  anexo['x'] = 30;
  anexo['y'] = 66;
  const command = new SwapForEntity('mao', 'mao', 'default', 'espada.bone');
  doc.run(command);
  expect(command.pin).toEqual({ x: 30, y: 50 });
});

it('a conta do pivô no espaço do osso é a volta exata da conta do lugar', () => {
  const regiao = { width: 40, height: 40, pivotX: 20, pivotY: 4 };
  const pose = { x: 30, y: 66, rotation: 0, scaleX: 1, scaleY: 1 };
  expect(pivotInBone(regiao, pose)).toEqual({ x: 30, y: 50 });
  expect(placeAtPivot({ x: 30, y: 50 }, regiao, pose)).toEqual({ x: 30, y: 66 });
  // Com giro e escala, a volta continua fechando.
  const torto = { x: 12, y: -5, rotation: 37, scaleX: 1.5, scaleY: 1.5 };
  const volta = placeAtPivot(pivotInBone(regiao, torto), regiao, torto);
  expect(volta.x).toBeCloseTo(12, 3);
  expect(volta.y).toBeCloseTo(-5, 3);
});

it('sem pivô carimbado, a raiz cai no `x, y` do anexo — a letra da §7.11', () => {
  const { doc } = comMao();
  const outro = new Doc(doc.file, { atlases: [atlasDoPulso(false)] });
  const command = new SwapForEntity('mao', 'mao', 'default', 'espada.bone');
  outro.run(command);
  expect(command.pin).toEqual({ x: 0, y: 16 });
});

it('desfazer devolve o anexo palavra por palavra, num passo só', () => {
  const { doc } = comMao();
  const texto = JSON.stringify(doc.file);
  doc.run(new SwapForEntity('mao', 'mao', 'default', 'espada.bone'));
  expect(JSON.stringify(doc.file)).not.toBe(texto);
  doc.undo();
  expect(JSON.stringify(doc.file)).toBe(texto);
});

it('a entidade volta a ser imagem, e a imagem nova entra pelo pivô', () => {
  const { doc } = comMao();
  doc.run(new SwapForEntity('mao', 'mao', 'default', 'espada.bone'));
  doc.run(new SwapForImage('mao', 'mao', 'default', 'maos/mao (5)'));
  const def = anexoDaMao(doc);
  expect(def['type']).toBe('region');
  expect(def['path']).toBe('maos/mao (5)');
  expect(def['uri']).toBeUndefined();
  // O pulso da imagem nova cai onde estava a raiz da entidade: (0, 0).
  expect(def['x']).toBe(0);
  expect(def['y']).toBe(16);
});

it('o alvo da grade vale para o desenho que JÁ é entidade: a porta não se fecha', () => {
  const { doc } = comMao();
  doc.run(new SwapForEntity('mao', 'mao', 'default', 'espada.bone'));
  expect(gridTarget(doc.file as never, [], 'mao', 'mao'))
    .toEqual({ slot: 'mao', attachment: 'mao', skin: 'default' });
  // Um ponto continua sem grade: não há o que trocar nele.
  expect(gridTarget(doc.file as never, [], 'costas', 'costas')).toBe(null);
});

it('o rodapé diz onde a raiz caiu, e que ela caiu no pivô', () => {
  const frase = entitySwapNotice('mao', 'espada', { x: 30, y: 50 }, ' (foi para a base)');
  expect(frase).toContain('espada');
  expect(frase).toContain('pivô');
  expect(frase).toContain('30, 50');
  expect(frase).toContain('(foi para a base)');
});

it('a grade desenha a entidade com a miniatura parada, e o clique troca por ela', () => {
  const fonte = readFileSync(resolve(SRC8, 'panels/image-picker.ts'), 'utf8');
  expect(fonte).toContain('entityEntries(listEntities(doc)');
  expect(fonte).toContain('if (entidade) swapForEntity(doc, target, entry.name, entry.label);');
  expect(fonte).toContain("else if (now.kind === 'entidade') swapForImage(doc, target, entry.name);");
  // A miniatura é a mesma do painel Entidades, e ela é PARADA (E16).
  expect(fonte).toContain("from './entity-thumb.js'");
  expect(fonte).not.toContain('requestAnimationFrame');
});
});

// ---------------------------------------------------------------------------
// Rodada final, chat H, lote 3 (29/09/2026): o slot sozinho também é alvo (Q5)
// ---------------------------------------------------------------------------

import { targetOfSlot as alvoDoSlotH } from '../src/panels/image-picker-model.js';

describe('rodada final, chat H — "Usar no desenho escolhido" com o slot escolhido', () => {
  /*
   * A imagem solta na cena nasce com o SLOT escolhido, e a troca só aceitava o
   * DESENHO: o item ficava apagado justo no passo seguinte ao de trazer a
   * imagem (foto `lote-2_12`). Agora o slot vale, pelo desenho que ele mostra.
   */
  const arquivo = {
    slots: [{ name: 'mao', bone: 'root', attachment: 'mao' }, { name: 'vazio', bone: 'root' }],
    skins: [{ name: 'default', attachments: { mao: { mao: { type: 'region', path: 'maos/aberta' }, fechada: { type: 'region', path: 'maos/fechada' } } } }],
  };
  it('o slot com desenho: o da Montagem, ou o que ele mostra agora', () => {
    expect(alvoDoSlotH(arquivo, ['default'], 'mao', null)).toEqual({ slot: 'mao', attachment: 'mao', skin: 'default' });
    expect(alvoDoSlotH(arquivo, ['default'], 'mao', 'fechada')).toEqual({ slot: 'mao', attachment: 'fechada', skin: 'default' });
  });
  it('o slot vazio, ou o que não existe, não é alvo', () => {
    expect(alvoDoSlotH(arquivo, ['default'], 'vazio', null)).toBeNull();
    expect(alvoDoSlotH(arquivo, ['default'], 'nao-ha', null)).toBeNull();
  });
  it('a troca do menu e o botão Definir pivô usam o mesmo alvo', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(fonte).toContain('return targetOfSlot(corpo.file as never, doc.visibleSkins, slot, shown);');
    const aba = readFileSync(resolve(__dirname, '../src/panels/palette.ts'), 'utf8');
    expect(aba).toContain('const alvo = targetOfSelection(doc);');
  });
});

// ---------------------------------------------------------------------------
// Rodada 8a (04/10/2026): a imagem de antes volta, e o que não passa se diz
// ---------------------------------------------------------------------------

import {
  IMAGE_BEFORE, TakeOutEntity, canTakeOutEntity, entityLossNotice, entityLosses, imageBeforeOf,
  takeOutEntity, takeOutTarget, whyCannotTakeOutEntity,
} from '../src/panels/image-picker-model.js';
import { emptySelection as vazia8a } from '../src/contract.js';

describe('rodada 8a — a entidade volta a ser a imagem de antes', () => {
  const SRC8 = resolve(__dirname, '../src');
  /** Um rosto que é MALHA, com deformação na animação, malha ligada noutra pele e morph. */
  function comRosto(): { doc: Doc; ditos: string[] } {
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'cabeca', parent: 'root', y: 100 }],
      slots: [{ name: 'cabeca', bone: 'cabeca', attachment: 'rosto' }],
      skins: [
        {
          name: 'default',
          attachments: {
            cabeca: {
              rosto: {
                type: 'mesh', path: 'rosto', width: 10, height: 10, uvs: [0, 1, 1, 1, 1, 0, 0, 0],
                vertices: [-5, -5, 5, -5, 5, 5, -5, 5], triangles: [0, 1, 2, 0, 2, 3], hull: 4,
              },
            },
          },
        },
        { name: 'elmo', attachments: { cabeca: { rosto: { type: 'linkedmesh', parent: 'rosto', skin: 'default', path: 'rosto2' } } } },
      ],
      morphs: [{ name: 'sorriso', targets: [{ slot: 'cabeca', attachment: 'rosto', skin: 'default', vertices: [0, 0, 0, 0, 0, 1, 0, 1] }] }],
      animations: [{
        name: 'piscar', duration: 1,
        timelines: [{ type: 'deform', target: 'cabeca', skin: 'default', attachment: 'rosto', keys: [{ time: 0, value: [] }, { time: 0.5, offset: 4, value: [0, 1, 0, 1] }] }],
      }],
    } as unknown as BoneFile;
    const doc = new Doc(file);
    const ditos: string[] = [];
    const dizer = doc.notice.bind(doc);
    doc.notice = (texto: string): void => { ditos.push(texto); dizer(texto); };
    return { doc, ditos };
  }
  const rosto = (doc: Doc): Record<string, unknown> =>
    (doc.file.skins![0]!.attachments!['cabeca'] as unknown as Record<string, Record<string, unknown>>)['rosto']!;

  it('a troca GUARDA a imagem que sai, inteira, no estado do editor do anexo', () => {
    const { doc } = comRosto();
    const antes = JSON.stringify(rosto(doc));
    doc.run(new SwapForEntity('cabeca', 'rosto', 'default', 'espada.bone'));
    const def = rosto(doc);
    expect(def['type']).toBe('skeleton');
    expect(JSON.stringify(imageBeforeOf(def))).toBe(antes);
    // Fora do núcleo: em `extensions.RECORTE_editor_state`, que leitor nenhum lê (§2.7).
    expect(Object.keys(def['extensions'] as object)).toEqual(['RECORTE_editor_state']);
    expect(IMAGE_BEFORE).toBe('imagemDeAntes');
  });

  it('Tirar a entidade devolve a imagem de antes LETRA POR LETRA — a malha volta malha', () => {
    const { doc } = comRosto();
    const antes = JSON.stringify(doc.file);
    doc.run(new SwapForEntity('cabeca', 'rosto', 'default', 'espada.bone'));
    doc.run(new TakeOutEntity('cabeca', 'rosto', 'default'));
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('um desfazer por gesto: Ctrl+Z desfaz o tirar, outro desfaz a troca', () => {
    const { doc } = comRosto();
    const antes = JSON.stringify(doc.file);
    doc.run(new SwapForEntity('cabeca', 'rosto', 'default', 'espada.bone'));
    const trocado = JSON.stringify(doc.file);
    doc.run(new TakeOutEntity('cabeca', 'rosto', 'default'));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(trocado);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('entidade trocada por outra entidade: a imagem de antes continua a do começo', () => {
    const { doc } = comRosto();
    const antes = JSON.stringify(rosto(doc));
    doc.run(new SwapForEntity('cabeca', 'rosto', 'default', 'espada.bone'));
    doc.run(new SwapForEntity('cabeca', 'rosto', 'default', 'escudo.bone'));
    expect(rosto(doc)['uri']).toBe('escudo.bone');
    expect(JSON.stringify(imageBeforeOf(rosto(doc)))).toBe(antes);
  });

  it('o gesto pela seleção: acende só com entidade que tem imagem de antes, e diz o que fez', () => {
    const { doc, ditos } = comRosto();
    doc.select({ ...vazia8a(), slots: ['cabeca'], attachments: [{ slot: 'cabeca', attachment: 'rosto' }] });
    expect(canTakeOutEntity(doc)).toBe(false);
    expect(takeOutEntity(doc)).toBe(false);
    expect(ditos.at(-1)).toContain('não mostra uma entidade');
    doc.run(new SwapForEntity('cabeca', 'rosto', 'default', 'espada.bone'));
    expect(canTakeOutEntity(doc)).toBe(true);
    expect(takeOutTarget(doc.file as never, [], 'cabeca', 'rosto')?.image).toBe('rosto');
    expect(takeOutEntity(doc)).toBe(true);
    expect(rosto(doc)['type']).toBe('mesh');
    expect(ditos.at(-1)).toContain('volta a mostrar a imagem de antes, "rosto"');
  });

  it('entidade que entrou direto (sem imagem antes): o gesto diz por que não há volta (regra 21)', () => {
    const { doc, ditos } = comRosto();
    const porSlot = doc.file.skins![0]!.attachments!['cabeca'] as unknown as Record<string, unknown>;
    porSlot['rosto'] = { type: 'skeleton', uri: 'espada.bone' };
    doc.rebuild();
    doc.select({ ...vazia8a(), slots: ['cabeca'] });
    expect(canTakeOutEntity(doc)).toBe(false);
    expect(takeOutEntity(doc)).toBe(false);
    expect(ditos.at(-1)).toContain('não substituiu imagem nenhuma');
  });

  // Rodada 6 (05/10/2026), régua 3. Achado do Diretor na 8a: com a espada
  // ORIGINAL do herói escolhida, o menu deixava "Tirar a entidade" cinza com a
  // dica fixa — "com uma entidade escolhida" — e a entidade ESTAVA escolhida.
  it('o cinza do menu diz por quê, caso a caso: nada escolhido, não é entidade, sem imagem de antes', () => {
    const { doc } = comRosto();
    doc.select(vazia8a());
    expect(whyCannotTakeOutEntity(doc)).toBe('Escolha uma entidade na cena primeiro (clique nela)');
    doc.select({ ...vazia8a(), slots: ['cabeca'], attachments: [{ slot: 'cabeca', attachment: 'rosto' }] });
    expect(whyCannotTakeOutEntity(doc)).toBe('cabeca não mostra uma entidade: não há o que tirar');
    const porSlot = doc.file.skins![0]!.attachments!['cabeca'] as unknown as Record<string, unknown>;
    porSlot['rosto'] = { type: 'skeleton', uri: 'espada.bone' };
    doc.rebuild();
    expect(whyCannotTakeOutEntity(doc))
      .toBe('Esta entidade não tem imagem de antes: ela entrou em cabeca sem substituir imagem nenhuma');
    // Com imagem de antes, o item acende e não há motivo a dizer.
    const { doc: outro } = comRosto();
    outro.run(new SwapForEntity('cabeca', 'rosto', 'default', 'espada.bone'));
    outro.select({ ...vazia8a(), slots: ['cabeca'] });
    expect(canTakeOutEntity(outro)).toBe(true);
    expect(whyCannotTakeOutEntity(outro)).toBeNull();
  });

  it('o que não passa para a entidade se CONTA antes da troca: deformação, malha ligada, morph', () => {
    const { doc } = comRosto();
    const perdas = entityLosses(doc.file as never, 'cabeca', 'rosto');
    expect(perdas).toEqual({ deformKeys: 2, deformAnimations: ['piscar'], linked: 1, morphTargets: 1 });
    const frase = entityLossNotice(perdas, 'rosto', 'espada');
    expect(frase).toBe('Não passam para "espada": 2 chaves de deformação (animação piscar), 1 malha ligada e '
      + '1 alvo de morph. "rosto" era malha, e a entidade não tem malha. Ficam no arquivo, sem efeito, e voltam a valer com a imagem');
    // Uma imagem simples não perde nada: a frase some.
    expect(entityLossNotice({ deformKeys: 0, deformAnimations: [], linked: 0, morphTargets: 0 }, 'mao', 'espada')).toBe('');
  });

  it('a cena abre a grade também sobre a entidade, com "Tirar a entidade" embaixo', () => {
    const fonte = readFileSync(resolve(SRC8, 'viewport/viewport.ts'), 'utf8');
    expect(fonte).toContain('const target = gridTarget(corpoDe(doc).file as never, doc.visibleSkins, slot, attachment);');
    expect(fonte).toContain("opcao('Tirar a entidade',");
    const grade = readFileSync(resolve(SRC8, 'panels/image-picker.ts'), 'utf8');
    expect(grade).toContain('entityLossNotice(perdas, target.attachment, label)');
  });
});

/**
 * Rodada 9, lote 1 (05/10/2026) — **Marcar a imagem como slot: ela vira base.**
 * Nada muda no desenho; o slot ganha o nome; a base nova entra no projeto; o
 * Ctrl+Z devolve o arquivo letra por letra; Desmarcar devolve a imagem.
 */
import { collectDrawList as listaR9 } from '../../runtime/src/render-list.js';
import { Projeto as ProjetoR9 } from '../src/doc/projeto.js';
import {
  MarkAsSlot, UnmarkSlot, innerImageDef, markTarget, slotMarkOf, unmarkTarget, whyBadName, whyCannotMark,
} from '../src/panels/slot-base-model.js';
import { emptySelection as vaziaR9 } from '../src/contract.js';

describe('rodada 9 — marcar a imagem como slot', () => {
  const EX = resolve(import.meta.dirname, '../../formato/exemplos');
  function heroiR9(): { doc: Doc; projeto: ProjetoR9 } {
    const file = JSON.parse(readFileSync(resolve(EX, 'heroi.bone'), 'utf8')) as BoneFile;
    const atlas = loadAtlas(JSON.parse(readFileSync(resolve(EX, 'heroi.atlas.json'), 'utf8')));
    const doc = new Doc(file, { atlases: [atlas], path: 'heroi.bone' });
    return { doc, projeto: new ProjetoR9(doc) };
  }
  const cantos = (doc: Doc, att: string): number[] => {
    doc.repose();
    const peca = listaR9(doc.skeleton!).find((p) => p.attachment.name === att)!;
    return Array.from((peca.attachment as unknown as { computeWorldVertices(s: unknown): ArrayLike<number> }).computeWorldVertices(peca.slot));
  };
  const ordem = (doc: Doc): string[] => listaR9(doc.skeleton!).map((p) => p.attachment.name);

  it('a conta de dentro: T(pino) R S aplicado à imagem de dentro dá o mesmo ponto', () => {
    const def = { x: 10, y: -4, rotation: 30, scaleX: 2, scaleY: 0.5, width: 20, height: 10 };
    const pin = { x: 3, y: 7 };
    const inner = innerImageDef(def, pin)!;
    const r = (30 * Math.PI) / 180;
    const ix = (inner['x'] as number) * 2;
    const iy = (inner['y'] as number) * 0.5;
    expect(pin.x + ix * Math.cos(r) - iy * Math.sin(r)).toBeCloseTo(10, 5);
    expect(pin.y + ix * Math.sin(r) + iy * Math.cos(r)).toBeCloseTo(-4, 5);
    expect(inner['rotation']).toBeUndefined();
    expect(innerImageDef({ ...def, scaleX: 0 }, pin)).toBeNull();
  });

  it('o cabelo vira a base "cabelo": nada muda no desenho, o slot ganha o nome, a base entra no projeto', () => {
    const { doc, projeto } = heroiR9();
    const antes = cantos(doc, 'hair');
    const ordemAntes = ordem(doc);
    const texto = JSON.stringify(doc.file);
    doc.select({ ...vaziaR9(), slots: ['hair'], attachments: [{ slot: 'hair', attachment: 'hair' }] });
    expect(whyCannotMark(doc)).toBeNull();
    const alvo = markTarget(doc)!;
    const cmd = new MarkAsSlot(alvo, 'cabelo', doc.atlases, doc.pageImages);
    doc.run(cmd);
    expect(doc.file.slots!.some((s) => s.name === 'cabelo')).toBe(true);
    expect(doc.file.slots!.some((s) => s.name === 'hair')).toBe(false);
    const def = doc.file.skins![0]!.attachments!['cabelo']!['hair'] as unknown as Record<string, unknown>;
    expect(def['type']).toBe('skeleton');
    expect(def['uri']).toBe('cabelo.bone');
    expect(slotMarkOf(def)).toEqual({ nome: 'cabelo', slotDeAntes: 'hair' });
    expect(projeto.corpos.has('cabelo.bone')).toBe(true);
    expect(cmd.child!.file.slots!.map((s) => s.name)).toEqual(['cabelo']);
    // O contorno escuro do cabelo (darkColor) não passa do pai ao filho (7.11): vai junto.
    expect((cmd.child!.file.slots![0] as unknown as { darkColor?: number[] }).darkColor).toEqual([0.1, 0, 0.1]);
    const depois = cantos(doc, 'hair');
    expect(depois.length).toBe(antes.length);
    for (let i = 0; i < antes.length; i++) expect(depois[i]).toBeCloseTo(antes[i]!, 2);
    expect(ordem(doc)).toEqual(ordemAntes);
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
    expect(projeto.corpos.has('cabelo.bone')).toBe(false);
    doc.redo();
    expect(projeto.corpos.has('cabelo.bone')).toBe(true);
    expect(projeto.corpos.get('cabelo.bone')).toBe(cmd.child);
  });

  it('Desmarcar devolve a imagem e o nome; Ctrl+Z do Desmarcar devolve a base', () => {
    const { doc, projeto } = heroiR9();
    doc.select({ ...vaziaR9(), slots: ['hair'], attachments: [{ slot: 'hair', attachment: 'hair' }] });
    const original = JSON.stringify(doc.file.skins![0]!.attachments!['hair']);
    doc.run(new MarkAsSlot(markTarget(doc)!, 'cabelo', doc.atlases, doc.pageImages));
    doc.select({ ...vaziaR9(), slots: ['cabelo'], attachments: [{ slot: 'cabelo', attachment: 'hair' }] });
    const alvo = unmarkTarget(doc)!;
    expect(alvo.mark.slotDeAntes).toBe('hair');
    doc.run(new UnmarkSlot(alvo));
    expect(JSON.stringify(doc.file.skins![0]!.attachments!['hair'])).toBe(original);
    expect(projeto.corpos.has('cabelo.bone')).toBe(false);
    doc.undo();
    expect(projeto.corpos.has('cabelo.bone')).toBe(true);
    expect(doc.file.slots!.some((s) => s.name === 'cabelo')).toBe(true);
  });

  it('as recusas dizem por quê: nada escolhido, entidade, slot já marcado, nome repetido', () => {
    const { doc } = heroiR9();
    expect(whyCannotMark(doc)).toMatch(/Escolha uma imagem/);
    doc.select({ ...vaziaR9(), slots: ['weapon'], attachments: [{ slot: 'weapon', attachment: 'sword' }] });
    expect(whyCannotMark(doc)).toMatch(/só imagem vira base/);
    doc.select({ ...vaziaR9(), slots: ['head'], attachments: [{ slot: 'head', attachment: 'face' }] });
    expect(whyCannotMark(doc)).toMatch(/malha: por enquanto só a imagem simples/);
    expect(whyBadName('arm', ['arm', 'head'], 'head', [])).toMatch(/Já existe um desenho chamado arm/);
    expect(whyBadName('head', ['arm', 'head'], 'head', [])).toBeNull();
    expect(whyBadName('espada', [], 'head', ['espada.bone'])).toMatch(/espada.bone/);
    expect(whyBadName('a/b', [], 'head', [])).toMatch(/nome de arquivo/);
    expect(whyBadName('  ', [], 'head', [])).toMatch(/vazio/);
  });
});

/**
 * Rodada 9, lote 2 (05/10/2026) — **as armas e as rodas**: duas peças com a
 * mesma entidade trocam SEPARADAS por padrão; a grade oferece "Trocar todas
 * as iguais (N)", desligada, e ligada troca todas num passo só de desfazer.
 */
import { SwapForEntity as TrocaR9b, sameEntityTargets, swapAllSame } from '../src/panels/image-picker-model.js';

describe('rodada 9, lote 2 — trocar todas as iguais', () => {
  const EX = resolve(import.meta.dirname, '../../formato/exemplos');
  function motoR9(): Doc {
    const file = JSON.parse(readFileSync(resolve(EX, 'heroi.bone'), 'utf8')) as BoneFile;
    const atlas = loadAtlas(JSON.parse(readFileSync(resolve(EX, 'heroi.atlas.json'), 'utf8')));
    const doc = new Doc(file, { atlases: [atlas], path: 'heroi.bone' });
    // Duas "rodas": o pé de trás e o da frente viram a mesma entidade.
    doc.run(new TrocaR9b('foot_back', 'foot_back', 'default', 'espada.bone'));
    doc.run(new TrocaR9b('foot_front', 'foot', 'default', 'espada.bone'));
    return doc;
  }

  it('acha as outras peças com a mesma entidade, na mesma skin, e conta todas', () => {
    const doc = motoR9();
    const alvo = { slot: 'foot_back', attachment: 'foot_back', skin: 'default' };
    const iguais = sameEntityTargets(doc.file as never, alvo);
    // weapon/sword já era espada.bone no herói: três peças iguais.
    expect(iguais.map((t) => t.slot).sort()).toEqual(['foot_back', 'foot_front', 'weapon']);
    expect(sameEntityTargets(doc.file as never, { slot: 'body', attachment: 'body', skin: 'default' })).toEqual([]);
  });

  it('ligada, troca todas num passo só; o Ctrl+Z desfaz todas juntas', () => {
    const doc = motoR9();
    const texto = JSON.stringify(doc.file.skins);
    const alvo = { slot: 'foot_back', attachment: 'foot_back', skin: 'default' };
    const passos = doc.history?.entries().length ?? 0;
    doc.run(swapAllSame(sameEntityTargets(doc.file as never, alvo), { kind: 'entidade', name: 'capacete.bone' }));
    const uris = ['foot_back', 'foot_front', 'weapon'].map((s) => Object.values(doc.file.skins![0]!.attachments![s]!)[0] as { uri?: string });
    expect(uris.map((u) => u.uri)).toEqual(['capacete.bone', 'capacete.bone', 'capacete.bone']);
    expect(doc.history?.entries().length ?? 0).toBe(passos + 1);
    doc.undo();
    expect(JSON.stringify(doc.file.skins)).toBe(texto);
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, M13: o interruptor "Em todas as skins" diz o que mudou
// ---------------------------------------------------------------------------

describe('rodada 17, M13: ligar e desligar "Em todas as skins" fala no rodapé', () => {
  it('as duas frases, e a de "Trocar todas as iguais"', () => {
    expect(everywhereNotice(true)).toContain('Em todas as skins: ligado');
    expect(everywhereNotice(false)).toContain('Em todas as skins: desligado');
    expect(allSameNotice(true, 3)).toContain('nas 3 peças iguais');
    expect(allSameNotice(false, 3)).toContain('desligado');
  });

  it('o clique chama a frase (antes: o rodapé ficava em "Arquivo salvo.")', () => {
    const grade = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(grade).toContain('doc.notice(everywhereNotice(everywhere));');
    expect(grade).toContain('doc.notice(allSameNotice(allSame, iguais.length));');
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, lote 3: as sobras do Marcar como slot
// ---------------------------------------------------------------------------

describe('rodada 17: o nome não fica preso depois do Ctrl+Z, e a lista de Bases abre por dentro', () => {
  it('o que está guardado só para o refazer não toma o nome; corpo, entidade e esqueleto de verdade tomam', () => {
    const tomados = takenBaseUris(['heroi.bone'], ['espada.bone'], ['espada.bone', 'peito.bone'], ['espada.bone', 'peito.bone', 'poder5.bone']);
    expect(tomados).toContain('heroi.bone');
    expect(tomados).toContain('espada.bone');
    expect(tomados).toContain('poder5.bone');
    // peito.bone: o Marcar como slot desfeito. Marcar de novo com "peito" pode.
    expect(tomados).not.toContain('peito.bone');
  });

  it('as duas portas: o Marcar usa a conta nova; o nome na lista de Bases abre por dentro', () => {
    const acoes = readFileSync(resolve(__dirname, '../src/panels/entities-actions.ts'), 'utf8');
    expect(acoes).toContain('takenBaseUris(projeto.corpos.keys(), projeto.entidades, projeto.guardados.keys(), skeletonsDe(corpo).keys())');
    const lista = readFileSync(resolve(__dirname, '../src/panels/animations.ts'), 'utf8');
    expect(lista).toContain('const slotMarcado = !row.focused && isMarkedSlotBase(doc, row.uri);');
    expect(lista).toContain('if (slotMarcado) openEntityAnimation(doc, row.uri, null);');
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 1 (06/10/2026) — soltar imagem num slot de ENTIDADE
// ---------------------------------------------------------------------------

import { swapCommandFor as trocaR44 } from '../src/panels/image-picker-model.js';
import { isEntityDef as entidadeR44 } from '../src/panels/palette-model.js';

describe('soltar imagem num slot de entidade (rodada 44, lote 1)', () => {
  /**
   * Na conferência (doc 55, fotos 12 e 13): o machado solto na linha `weapon`
   * do herói, onde mora a espada-ENTIDADE, gravava `path` no anexo
   * `skeleton`. O leitor ignora, a cena não mudava, o rodapé dizia "agora
   * mostra", e nascia um aviso em inglês. Regra 21.
   */
  const comEntidade = (): BoneFile => ({
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'weapon', bone: 'root', attachment: 'sword' }],
    skins: [{ name: 'default', attachments: { weapon: { sword: { type: 'skeleton', uri: 'espada.bone', x: 35, y: 0 } } } }],
  } as unknown as BoneFile);
  const anexo = (doc: Doc): Record<string, unknown> =>
    (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, unknown>>>)['weapon']!['sword']!;

  it('SwapSlotImage num anexo de entidade NÃO escreve path: o arquivo fica igual', () => {
    const doc = new Doc(comEntidade(), { atlases: [] });
    const antes = JSON.stringify(doc.file);
    doc.run(new SwapSlotImage('weapon', 'armas/machado', 'default', 'sword'));
    expect(anexo(doc)).not.toHaveProperty('path');
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('a troca certa: a entidade vira a imagem, e um desfazer devolve o texto', () => {
    const doc = new Doc(comEntidade(), { atlases: [] });
    const antes = JSON.stringify(doc.file);
    const troca = trocaR44(doc, 'weapon', 'armas/machado', 'default', 'sword');
    expect(troca.entidade).toBe(true);
    doc.run(troca.command);
    expect(anexo(doc)['type']).toBe('region');
    expect(anexo(doc)['path']).toBe('armas/machado');
    expect(anexo(doc)).not.toHaveProperty('uri');
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });

  it('num desenho de imagem a troca é a de sempre', () => {
    const file = comEntidade() as unknown as { skins: Array<{ attachments: Record<string, Record<string, unknown>> }> };
    file.skins[0]!.attachments['weapon']!['sword'] = { type: 'region', path: 'blade', x: 0, y: 0 };
    const doc = new Doc(file as unknown as BoneFile, { atlases: [] });
    const troca = trocaR44(doc, 'weapon', 'armas/machado', 'default', 'sword');
    expect(troca.entidade).toBe(false);
    expect(troca.command).toBeInstanceOf(SwapSlotImage);
  });

  it('isEntityDef reconhece só o tipo skeleton', () => {
    expect(entidadeR44({ type: 'skeleton' })).toBe(true);
    expect(entidadeR44({ type: 'region' })).toBe(false);
    expect(entidadeR44({})).toBe(false);
  });

  it('a Árvore usa a troca certa e fala quando a linha não aceita', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/tree.ts'), 'utf8');
    expect(fonte).toContain('const troca = swapCommandFor(corpoDe(doc), row.name, image, row.skin, row.attachment);');
    expect(fonte).toContain('Solte a imagem na linha de um slot');
    // A linha que não é de slot recebe a soltura só para dizer isso.
    expect(fonte).toContain("    if (row.kind === 'slot') this.acceptImage(node, row);\n    else this.refuseImage(node, row);");
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 2 (06/10/2026) — a grade mostra as outras pastas
// ---------------------------------------------------------------------------

import { GRID_SOURCES as fontesR44, gridEmptyText as vaziaR44, gridSourceHint as dicaR44 } from '../src/panels/image-grid-model.js';

describe('a grade: todas as pastas, e o que o slot mostrou (rodada 44, lote 2)', () => {
  /**
   * Na conferência (doc 55, fotos 10 e 20): com a espada na raiz, o machado
   * de `armas/` não estava na grade; com o machado, só `armas/`. E a fonte
   * "objeto" esqueceu o `blade` que o slot mostrou um momento antes (foto 21).
   */
  const file = {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
    slots: [{ name: 'weapon', bone: 'root', attachment: 'sword' }],
    skins: [{ name: 'default', attachments: { weapon: { sword: { type: 'region', path: 'blade' } } } }],
  } as unknown as BoneFile;
  const ACERVO = ['blade', 'body', 'armas/machado', 'inverno/body'];

  it('três fontes, cada uma com a sua dica', () => {
    expect([...fontesR44]).toEqual(['pasta', 'todas', 'objeto']);
    for (const f of fontesR44) expect(dicaR44(f).length).toBeGreaterThan(10);
    expect(parseGridSource('todas')).toBe('todas');
  });

  it('"pasta" só a raiz; "todas" traz armas/ e inverno/, com o caminho no rótulo', () => {
    const pasta = gridEntries(file, ACERVO, 'weapon', 'pasta', { current: 'blade', folderOpen: true });
    expect(pasta.map((e) => e.name)).not.toContain('armas/machado');
    const todas = gridEntries(file, ACERVO, 'weapon', 'todas', { current: 'blade', folderOpen: true });
    // Lote 4 (doc 61): a raiz primeiro, depois cada subpasta.
    expect(todas.map((e) => e.name)).toEqual(['blade', 'body', 'armas/machado', 'inverno/body']);
    expect(todas.find((e) => e.name === 'inverno/body')!.label).toBe('inverno/body');
    expect(todas.find((e) => e.name === 'blade')!.current).toBe(true);
  });

  it('"objeto" soma o que o slot mostrou nesta sessão', () => {
    const sem = gridEntries(file, ACERVO, 'weapon', 'objeto', { current: 'blade' });
    expect(sem.map((e) => e.name)).toEqual(['blade']);
    const com = gridEntries(file, ACERVO, 'weapon', 'objeto', { current: 'blade', recent: ['armas/machado', 'blade'] });
    expect(com.map((e) => e.name)).toEqual(['armas/machado', 'blade']);
  });

  it('a grade vazia diz o que fazer', () => {
    expect(vaziaR44('pasta')).toContain('todas');
    expect(vaziaR44('todas')).toContain('abra a pasta');
  });

  it('a grade abre sempre em "pasta", e lembra a imagem que sai', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(fonte).toContain("gridSource = 'pasta';");
    expect(fonte).toContain('gridSource = qual;');
    expect(fonte).toContain("if (now.kind === 'imagem') rememberShown(target.slot, now.name);");
    expect(fonte).not.toContain('localStorage.setItem(GRID_SOURCE_KEY');
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 4 (06/10/2026) — a grade numa entidade, e "todas" por pasta
// ---------------------------------------------------------------------------

import { NO_FOLDER_NOW_HINT as semPastaR44, byFolderThenName as ordemR44, gridFolderBreaks as quebrasR44, gridSourceFor as fonteR44 } from '../src/panels/image-grid-model.js';

describe('a grade numa entidade e "todas" por pasta (rodada 44, lote 4, doc 61)', () => {
  it('numa entidade, "pasta" vira "todas"; as outras fontes ficam', () => {
    expect(fonteR44('pasta', true)).toBe('todas');
    expect(fonteR44('pasta', false)).toBe('pasta');
    expect(fonteR44('objeto', true)).toBe('objeto');
    expect(semPastaR44).toContain('Mostrando todas');
  });

  it('"todas": a raiz primeiro, e um cabeçalho por pasta', () => {
    const nomes = ['inverno/body', 'body', 'armas/machado', 'blade'].sort(ordemR44);
    expect(nomes).toEqual(['blade', 'body', 'armas/machado', 'inverno/body']);
    expect(quebrasR44(nomes)).toEqual([{ at: 0, folder: '' }, { at: 2, folder: 'armas' }, { at: 3, folder: 'inverno' }]);
    expect(quebrasR44(['a', 'b'])).toEqual([]);
  });

  it('a grade desenha o cabeçalho e usa a fonte de fato', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(fonte).toContain("const source = gridSourceFor(gridSource, now.kind === 'entidade');");
    expect(fonte).toContain("el('p', 'grade-imagens-pasta', pasta === '' ? 'raiz' : `${pasta}/`);");
  });
});


describe('a grade: as entidades com cabeçalho (rodada 44, doc 67)', () => {
  it('a marca laranja da entidade de agora tem um cabeçalho que diz', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(fonte).toContain("el('p', 'grade-imagens-pasta', 'entidades');");
    expect(fonte).toContain("'As entidades do projeto. A marcada em laranja é a de agora'");
  });
});


// ---------------------------------------------------------------------------
// Rodada 44, lote 6 (06/10/2026) — a laranja escrita, e o tamanho da trocada
// ---------------------------------------------------------------------------

import { swapSizeTail as tamanhoR44, fitFactor as caberR44 } from '../src/panels/image-picker-model.js';

describe('a grade: legenda, o tamanho da trocada e o caber (rodada 44, lotes 6 e 7)', () => {
  it('a frase do tamanho é curta, e diz onde está o Caber', () => {
    const t = { width: 1275, height: 1027 };
    expect(tamanhoR44(70, 80, { width: 80, height: 40 })).toBe('');
    expect(tamanhoR44(70, 1275, t)).toBe('entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga');
    expect(tamanhoR44(null, 1275, t)).toContain('entrou no tamanho dela, 1275 × 1027 px');
    expect(tamanhoR44(null, 70, { width: 70, height: 33 })).toBe('');
    expect(tamanhoR44(70, 1275, null)).toBe('');
    expect(tamanhoR44(70, 1275, t).length).toBeLessThanOrEqual(100);
  });

  it('caber: o fator que leva o lado maior ao da antiga', () => {
    expect(caberR44(100, 1275)).toBeCloseTo(0.0784, 4);
    expect(caberR44(100, 100)).toBeNull();
    expect(caberR44(undefined, 100)).toBeNull();
    expect(caberR44(100, null)).toBeNull();
  });

  it('as duas trocas da grade guardam a antiga e falam do tamanho; a laranja tem legenda; o Caber está na grade', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/panels/image-picker.ts'), 'utf8');
    expect(fonte.split('rememberSizeBefore(doc, target);').length - 1).toBe(2);
    expect(fonte.split('const tamanho = swapSizeNote(doc, target, image);').length - 1).toBe(2);
    expect(fonte).toContain("el('p', 'grade-imagens-legenda', 'Laranja: a de agora');");
    expect(fonte).toContain("el('button', 'grade-imagens-opcao', 'Caber no lugar da antiga')");
  });
});

// Rodada 47, lote 5b (notas do doc 86)
describe('rodada 47, lote 5b: a busca de imagem tem dica', () => {
  const fonteR47L5b = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

  it('a caixa de busca diz como se usa', () => {
    expect(fonteR47L5b('panels/palette.ts')).toContain("field.title = 'Buscar imagem: escreva um pedaço do nome;");
  });
});
