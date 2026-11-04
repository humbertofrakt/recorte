/**
 * Inclinar e escalar — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote13-inclinar-e-curvas`, `lote26-inclinar-e-escalar`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { CURVE_KINDS, allKeyTimes, curveKindOf, keysAfter, setDuration, setKeyCurve, smoothCurve, valueAt } from '../src/anim/keying.js';
import { EditKeys, BONE_KEY_PROPERTIES } from '../src/anim/pose-mode.js';
import { lockedAxis, shearAngle, shearTool } from '../src/viewport/tools/shear.js';
import { boneFrame } from '../src/viewport/tools/select.js';
import { translateTool } from '../src/viewport/tools/translate.js';
import { rotateTool } from '../src/viewport/tools/rotate.js';
import { scaleTool } from '../src/viewport/tools/scale.js';
import { resetSpaceState, setCompensation } from '../src/viewport/tools/space.js';
import { emptySelection, type ToolEvent } from '../src/contract.js';
import { ANCHOR_FIELDS, PasteAnchor, anchorLine, pasteAnchor, readAnchor, writeAnchor } from '../src/panels/anchor-clipboard.js';
import { allMenus, flatEntries } from '../src/ui/menus.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { viewMenuState } from './ajuda-view.js';
import type { Tool } from '../src/contract.js';
import { NEEDS_BONE, TOOL_ORDER, toolFooter, toolbarItems } from '../src/ui/toolbar-model.js';
import { hasIcon } from '../src/ui/icons.js';
import { redrawPlan, signature } from '../src/panels/list-redraw.js';
import { actionBarItems } from '../src/ui/action-bar-model.js';

// ---------------------------------------------------------------------------
// inclinar e curvas (lote 13) — era `lote13-inclinar-e-curvas.test.ts`
// ---------------------------------------------------------------------------

describe('inclinar e curvas (lote 13)', () => {
/**
 * Lote 13 (v3.0): inclinar, curvas, duração e âncora.
 *
 * Sem DOM. O que se prova é a conta: quanto um arrasto inclina, o que fica
 * escrito em `key.curve`, o que a duração faz com as chaves, e que colar a
 * âncora em cinco desenhos é um passo de desfazer só.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function state(): MenuState {
  return {
    canRepack: false,
    canUndo: false,
    undoLabel: null,
    canRedo: false,
    redoLabel: null,
    view: viewMenuState(),
    lockBones: false,
    lockDrawings: false,
    space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    animating: true,
    loop: false,
    open: {},
  };
}

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

/** `walk` com três chaves de rotação e duas de x, e um evento em 0,17. */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'braco', parent: 'root', x: 100 }],
    events: [{ name: 'passo' }],
    animations: [{
      name: 'walk',
      duration: 1,
      timelines: [
        {
          type: 'bone', target: 'braco', property: 'rotation',
          keys: [{ time: 0, value: 0 }, { time: 0.5, value: 20 }, { time: 1, value: 0 }],
        },
        { type: 'event', keys: [{ time: 0.25, event: 'passo' }] },
      ],
    }],
  } as BoneFile;
}

const rot = { type: 'bone' as const, target: 'braco', property: 'rotation' };

function keysOf(file: BoneFile): Array<Record<string, unknown>> {
  const timelines = (file.animations ?? [])[0].timelines ?? [];
  const line = timelines.find((t) => (t as { property?: string }).property === 'rotation');
  return ((line as unknown as { keys?: Array<Record<string, unknown>> }).keys ?? []);
}

// ---------------------------------------------------------------------------
// Item 21 — a ferramenta Inclinar
// ---------------------------------------------------------------------------

describe('a ferramenta Inclinar', () => {
  it('está registrada, com a tecla Z e o nome por extenso', () => {
    expect(shearTool.id).toBe('shear');
    expect(shearTool.label).toBe('Inclinar');
    expect(shearTool.shortcut).toBe('z');
  });

  it('só vale em Montagem e em Animando: ela não declara modo', () => {
    // Inclinar é transformação, como Girar: vale nos dois modos.
    expect((shearTool as { modes?: readonly string[] }).modes).toBeUndefined();
  });

  it('andar de lado a mesma altura que se subiu dá 45 graus', () => {
    expect(shearAngle(10, 10)).toBeCloseTo(45, 6);
    expect(shearAngle(-10, 10)).toBeCloseTo(-45, 6);
  });

  it('sem altura não há inclinação', () => {
    expect(shearAngle(10, 0)).toBe(0);
  });

  it('a altura conta pelo módulo: puxar por baixo inclina para o mesmo lado', () => {
    expect(shearAngle(10, -10)).toBeCloseTo(45, 6);
  });

  it('o `Alt` só escolhe eixo depois de a mão andar de verdade', () => {
    expect(lockedAxis(1, 1, 1)).toBeNull();
    expect(lockedAxis(20, 3, 1)).toBe('x');
    expect(lockedAxis(3, 20, 1)).toBe('y');
  });

  it('Chavear passou a gravar as duas inclinações', () => {
    expect(BONE_KEY_PROPERTIES).toContain('shearX');
    expect(BONE_KEY_PROPERTIES).toContain('shearY');
    // E não perdeu nenhuma das cinco de antes.
    for (const key of ['rotation', 'x', 'y', 'scaleX', 'scaleY']) {
      expect(BONE_KEY_PROPERTIES).toContain(key);
    }
  });
});

// ---------------------------------------------------------------------------
// Item 26 — a curva pelo botão direito
// ---------------------------------------------------------------------------

describe('a interpolação de uma chave', () => {
  it('"Parada" grava `stepped`', () => {
    const file = testFile();
    expect(setKeyCurve(file, 'walk', [{ target: rot, time: 0 }], 'parada')).toBe(1);
    expect(keysOf(file)[0]['curve']).toBe('stepped');
  });

  it('"Linear" APAGA o campo: ausente já é linear (9.3)', () => {
    const file = testFile();
    setKeyCurve(file, 'walk', [{ target: rot, time: 0 }], 'parada');
    setKeyCurve(file, 'walk', [{ target: rot, time: 0 }], 'linear');
    expect(keysOf(file)[0]['curve']).toBeUndefined();
  });

  it('"Suave" grava a Bézier de quatro números, em coordenadas absolutas', () => {
    const file = testFile();
    setKeyCurve(file, 'walk', [{ target: rot, time: 0 }], 'suave');
    const curve = keysOf(file)[0]['curve'];
    // De (0, 0) a (0,5, 20). Rodada 40, lote 1: é a MESMA Suave do botão do
    // gráfico (0,42 e 0,58 do caminho no tempo, na altura de cada ponta).
    expect(curve).toEqual([0.21, 0, 0.29, 20]);
  });

  it('a conta da suave é uma função pura, e dá para conferir sozinha', () => {
    expect(smoothCurve(0, 0, 3, 9)).toEqual([1, 0, 2, 9]);
  });

  it('a ÚLTIMA chave da linha é pulada: ela não tem para onde curvar', () => {
    const file = testFile();
    expect(setKeyCurve(file, 'walk', [{ target: rot, time: 1 }], 'parada')).toBe(0);
    expect(keysOf(file)[2]['curve']).toBeUndefined();
  });

  it('várias chaves de uma vez, e o número devolvido conta só as que mudaram', () => {
    const file = testFile();
    const escritas = setKeyCurve(file, 'walk', [
      { target: rot, time: 0 }, { target: rot, time: 0.5 }, { target: rot, time: 1 },
    ], 'parada');
    expect(escritas).toBe(2);
  });

  it('`curveKindOf` diz o que a chave tem hoje', () => {
    const file = testFile();
    expect(curveKindOf(file, 'walk', { target: rot, time: 0 })).toBe('linear');
    setKeyCurve(file, 'walk', [{ target: rot, time: 0 }], 'parada');
    expect(curveKindOf(file, 'walk', { target: rot, time: 0 })).toBe('parada');
    setKeyCurve(file, 'walk', [{ target: rot, time: 0 }], 'suave');
    expect(curveKindOf(file, 'walk', { target: rot, time: 0 })).toBe('suave');
  });

  it('uma Bézier vinda do painel Curvas não é chamada de "Suave"', () => {
    const file = testFile();
    keysOf(file)[0]['curve'] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8];
    expect(curveKindOf(file, 'walk', { target: rot, time: 0 })).toBe('outra');
  });

  it('linha que não existe não quebra', () => {
    const file = testFile();
    expect(setKeyCurve(file, 'walk', [
      { target: { type: 'bone', target: 'perna', property: 'x' }, time: 0 },
    ], 'parada')).toBe(0);
  });

  it('o menu oferece os cinco nomes, nesta ordem (rodada 40: os mesmos do gráfico)', () => {
    expect(CURVE_KINDS.map((k) => k.label)).toEqual(['Linear', 'Suave', 'Entrada suave', 'Saída suave', 'Parada']);
    for (const kind of CURVE_KINDS) expect(kind.hint.length).toBeGreaterThan(10);
  });

  it('desfazer devolve o arquivo', () => {
    const doc = new Doc(testFile());
    const antes = JSON.stringify(doc.file);
    doc.run(new EditKeys('walk', 'Mudar a curva', (file, animation) => {
      setKeyCurve(file, animation, [{ target: rot, time: 0 }], 'parada');
    }));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// Item 11 — a duração
// ---------------------------------------------------------------------------

describe('mudar a duração', () => {
  it('esticando, todo tempo dobra e o zero fica', () => {
    const file = testFile();
    setDuration(file, 'walk', 2, true);
    expect((file.animations ?? [])[0].duration).toBe(2);
    expect(allKeyTimes(file, 'walk')).toEqual([0, 0.5, 1, 2]);
  });

  it('sem esticar, só o número muda', () => {
    const file = testFile();
    const antes = allKeyTimes(file, 'walk');
    setDuration(file, 'walk', 2, false);
    expect((file.animations ?? [])[0].duration).toBe(2);
    expect(allKeyTimes(file, 'walk')).toEqual(antes);
  });

  it('encurtar sem esticar deixa chaves depois do fim, e dá para contar antes', () => {
    const file = testFile();
    // Depois de 0,4 estão a rotação de 0,5 e a de 1. O evento em 0,25 fica.
    expect(keysAfter(file, 'walk', 0.4)).toBe(2);
    setDuration(file, 'walk', 0.4, false);
    expect(allKeyTimes(file, 'walk')).toContain(1);
  });

  it('esticando, nada fica depois do fim', () => {
    const file = testFile();
    setDuration(file, 'walk', 0.4, true);
    expect(keysAfter(file, 'walk', 0.4)).toBe(0);
  });

  it('os valores das chaves não mudam quando o tempo estica', () => {
    const file = testFile();
    setDuration(file, 'walk', 2, true);
    expect(valueAt(file, 'walk', 1, rot)).toBeCloseTo(20, 6);
  });

  it('animação que não existe, e duração negativa, não quebram', () => {
    const file = testFile();
    setDuration(file, 'nao-existe', 3, true);
    setDuration(file, 'walk', -5, false);
    expect((file.animations ?? [])[0].duration).toBe(0);
  });

  it('desfazer devolve o arquivo', () => {
    const doc = new Doc(testFile());
    const antes = JSON.stringify(doc.file);
    doc.run(new EditKeys('walk', 'Mudar a duração', (file, animation) => {
      setDuration(file, animation, 3, true);
    }));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
  });
});

// ---------------------------------------------------------------------------
// Item 33 — copiar e colar a âncora
// ---------------------------------------------------------------------------

describe('copiar e colar a âncora', () => {
  it('lê os cinco campos, com o padrão onde o arquivo não escreve', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    const skin = (doc.file.skins ?? [])[0];
    const slot = Object.keys(skin.attachments ?? {})[0];
    const name = Object.keys((skin.attachments ?? {})[slot] ?? {})[0];
    const anchor = readAnchor(doc.file, slot, name);
    expect(anchor).not.toBeNull();
    for (const field of ANCHOR_FIELDS) expect(typeof anchor?.values[field]).toBe('number');
    expect(anchor?.from).toBe(name);
  });

  it('desenho que não existe devolve nulo, e colar nele devolve falso', () => {
    const file = JSON.parse(RAW) as BoneFile;
    expect(readAnchor(file, 'nada', 'nada')).toBeNull();
    const anchor = { values: { x: 1, y: 2, rotation: 3, scaleX: 4, scaleY: 5 }, from: 'x' };
    expect(writeAnchor(file, 'nada', 'nada', anchor)).toBe(false);
  });

  it('colar escreve os cinco, inclusive os que valem o padrão', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    const skin = (doc.file.skins ?? [])[0];
    const slot = Object.keys(skin.attachments ?? {})[0];
    const name = Object.keys((skin.attachments ?? {})[slot] ?? {})[0];
    const anchor = { values: { x: 7, y: 8, rotation: 0, scaleX: 1, scaleY: 1 }, from: 'molde' };
    expect(pasteAnchor(doc.file, [{ slot, attachment: name }], anchor)).toBe(1);
    const back = readAnchor(doc.file, slot, name);
    expect(back?.values).toEqual(anchor.values);
    // Escrito de verdade, e não só lido de volta pelo padrão.
    const def = (skin.attachments ?? {})[slot][name] as unknown as Record<string, unknown>;
    expect(def['rotation']).toBe(0);
  });

  it('colar em vários é UM passo de desfazer, e cada um volta ao que era', () => {
    const doc = new Doc(JSON.parse(RAW) as BoneFile);
    const skin = (doc.file.skins ?? [])[0];
    const alvos: Array<{ slot: string; attachment: string }> = [];
    for (const slot of Object.keys(skin.attachments ?? {}).slice(0, 3)) {
      const name = Object.keys((skin.attachments ?? {})[slot] ?? {})[0];
      if (name !== undefined) alvos.push({ slot, attachment: name });
    }
    expect(alvos.length).toBeGreaterThan(1);
    const antes = JSON.stringify(doc.file);

    const anchor = { values: { x: 11, y: 22, rotation: 33, scaleX: 2, scaleY: 3 }, from: 'molde' };
    const command = new PasteAnchor(alvos, anchor);
    expect(command.count).toBe(alvos.length);
    doc.run(command);
    for (const alvo of alvos) {
      expect(readAnchor(doc.file, alvo.slot, alvo.attachment)?.values).toEqual(anchor.values);
    }

    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(antes);
    // E refazer volta a colar.
    doc.redo();
    expect(readAnchor(doc.file, alvos[0].slot, alvos[0].attachment)?.values).toEqual(anchor.values);
  });

  it('a frase da barra de baixo diz os números', () => {
    const linha = anchorLine({
      values: { x: 10, y: -4.5, rotation: 30, scaleX: 1, scaleY: 1 }, from: 'mao_esq',
    });
    expect(linha).toContain('mao_esq');
    expect(linha).toContain('x 10');
    expect(linha).toContain('-4,50');
  });

  it('o menu Editar liga as duas entradas', () => {
    const editar = menus().find((group) => group.label === 'Editar');
    const entradas = flatEntries(editar?.entries ?? []);
    for (const action of ['copiar-ancora', 'colar-ancora']) {
      expect(entradas.find((e) => e.action === action)?.enabled).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Item 31 — colar em todas as chaves (entregue no lote 10)
// ---------------------------------------------------------------------------

describe('colar em todas as chaves', () => {
  it('continua ligado, com a tecla escrita ao lado', () => {
    // O item 31 aparece nas tabelas do lote 10 e do 13. Ele foi entregue no
    // 10, junto com o item 86, que é o mesmo gesto. Aqui só se confere que
    // ninguém o desligou no caminho.
    const editar = menus().find((group) => group.label === 'Editar');
    const entrada = flatEntries(editar?.entries ?? [])
      .find((e) => e.action === 'colar-todas-chaves');
    expect(entrada?.enabled).toBe(true);
    expect(entrada?.shortcut).toBe('Ctrl+Shift+V');
  });
});
});

// ---------------------------------------------------------------------------
// inclinar e escalar (lote 26) — era `lote26-inclinar-e-escalar.test.ts`
// ---------------------------------------------------------------------------

describe('inclinar e escalar (lote 26)', () => {
/**
 * Lote 26 (v4.9): a anotação 10 do Humberto.
 *
 * Nas palavras dele, apontando o botão da ferramenta Inclinar:
 * *"Isso é ordem Z? O ícone ficou fora do padrão. Tentei usar, não entendi."*
 *
 * Três coisas erradas numa só:
 *
 * | O quê | Por quê |
 * |:---|:---|
 * | O botão mostrava a **letra Z** | Inclinar não tinha ícone, e a tecla dela é `Z`. Ele leu "ordem Z", que é outra coisa |
 * | Ela vinha **antes** de Escalar | a ordem da barra era a ordem dos `import` no `viewport.ts`, e ninguém sabia disso |
 * | Ela **não fazia nada** sem osso | e não dizia por quê. Era o desvio 6 do lote 13 |
 *
 * Sem DOM: a barra é uma lista de dados, e o rodapé é uma função pura.
 */
/** As ferramentas de mentira, na ordem TORTA em que elas se registravam. */
function tools(): Tool[] {
  const t = (id: string, label: string, shortcut: string | null): Tool => ({
    id, label, shortcut,
  });
  return [
    t('select', 'Escolher', 'v'),
    t('translate', 'Mover', 'g'),
    t('rotate', 'Girar', 'r'),
    // O `shear` se registrava aqui, antes do `scale`: era este o defeito.
    t('shear', 'Inclinar', 'z'),
    t('scale', 'Escalar', 's'),
    t('create-bone', 'Criar osso', 'b'),
  ];
}

// ---------------------------------------------------------------------------
// A ordem da barra
// ---------------------------------------------------------------------------

describe('anotação 10 — Escalar vem antes de Inclinar', () => {
  it('a barra segue a ordem escrita, e não a ordem dos imports', () => {
    const ids = toolbarItems(tools()).map((item) => item.id);
    expect(ids.indexOf('scale')).toBeLessThan(ids.indexOf('shear'));
    expect(ids).toEqual(['select', 'translate', 'rotate', 'scale', 'shear', 'create-bone']);
  });

  it('a ordem é a do gesto: escolher, mexer, e só então criar', () => {
    // Item 2.2, 13/09/2026: o Transformar é o primeiro, e Selecionar vem
    // logo atrás. Antes era o contrário.
    expect(TOOL_ORDER.slice(0, 6))
      .toEqual(['transform', 'select', 'translate', 'rotate', 'scale', 'shear']);
    // Criar osso vem depois das que mexem.
    expect(TOOL_ORDER.indexOf('create-bone')).toBeGreaterThan(TOOL_ORDER.indexOf('shear'));
  });

  it('ferramenta que não está na lista vai para o fim, sem se perder', () => {
    const extra: Tool = { id: 'inventada', label: 'Inventada', shortcut: null };
    const ids = toolbarItems([extra, ...tools()]).map((item) => item.id);
    expect(ids[ids.length - 1]).toBe('inventada');
    expect(ids.length).toBe(7);
  });

  it('a ordenação é estável entre duas de fora da lista', () => {
    const a: Tool = { id: 'aaa', label: 'A', shortcut: null };
    const b: Tool = { id: 'bbb', label: 'B', shortcut: null };
    const ids = toolbarItems([a, b]).map((item) => item.id);
    expect(ids).toEqual(['aaa', 'bbb']);
  });

  it('a barra de ações mostra a mesma ordem', () => {
    const ids = actionBarItems(tools())
      .filter((item) => item.actionId.startsWith('ferramenta-'))
      .map((item) => item.id);
    expect(ids.indexOf('scale')).toBeLessThan(ids.indexOf('shear'));
  });
});

// ---------------------------------------------------------------------------
// Os ícones
// ---------------------------------------------------------------------------

describe('anotação 10 — os dois ícones', () => {
  it('Inclinar tem ícone, e nenhum botão da barra fica sem um', () => {
    expect(hasIcon('shear')).toBe(true);
    for (const item of toolbarItems(tools())) {
      expect(item.icon, `${item.id} ficou sem ícone`).not.toBe('');
    }
  });

  it('Escalar também tem, e os dois são desenhos diferentes', () => {
    expect(hasIcon('scale')).toBe(true);
    expect(hasIcon('rotate')).toBe(true);
    expect(hasIcon('translate')).toBe(true);
  });

  it('as quatro de transformação têm ícone', () => {
    for (const id of ['translate', 'rotate', 'scale', 'shear']) {
      expect(hasIcon(id), `${id} sem ícone`).toBe(true);
    }
  });

  it('toda ferramenta tem ícone na barra — são todas, sem modo (degrau 4a)', () => {
    const itens = toolbarItems(tools());
    expect(itens.length).toBe(tools().length);
    expect(itens.length).toBeGreaterThan(0);
    expect(itens.every((item) => item.icon !== '')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// A dica e o rodapé
// ---------------------------------------------------------------------------

describe('anotação 10 — dizer o que Inclinar faz', () => {
  it('a dica do botão diz o nome, a tecla e o que acontece', () => {
    const shear = toolbarItems(tools()).find((item) => item.id === 'shear');
    // Rodada 46, lote 4 (nota do doc 76): a dica diz que se arrasta.
    expect(shear?.hint).toBe('Inclinar (Z). Arraste o osso escolhido: o topo anda, a base fica');
  });

  it('as outras dizem o gesto depois do nome e da tecla (rodada 46, lote 2)', () => {
    // Antes: "sem enfeite" — e nove das doze dicas eram só o nome (doc 66).
    const rotate = toolbarItems(tools()).find((item) => item.id === 'rotate');
    expect(rotate?.hint).toBe('Girar (R). Arraste em volta do pivô · Shift: de 15 em 15°');
  });

  it('sem osso escolhido, o rodapé diz o que fazer', () => {
    const linha = toolFooter('shear', false);
    expect(linha).toContain('escolha um osso');
    expect(linha).toContain('O topo anda, a base fica');
  });

  it('com osso escolhido, o rodapé cala', () => {
    expect(toolFooter('shear', true)).toBeNull();
  });

  it('as outras de transformação dizem o que são, com osso ou sem (rodada 46, lote 2)', () => {
    // Antes elas nunca punham linha: "não têm o que explicar". A conferência
    // da rodada 46 (doc 66) achou 7 de 12 ferramentas caladas no rodapé, e o
    // Shift e o Ctrl delas escritos em lugar nenhum.
    for (const id of ['select', 'translate', 'rotate', 'scale']) {
      const linha = toolFooter(id, false);
      expect(linha, id).not.toBeNull();
      expect(toolFooter(id, true), id).toBe(linha);
      expect(linha, id).toContain('Shift');
    }
  });

  it('só o Inclinar precisa de osso', () => {
    expect([...NEEDS_BONE]).toEqual(['shear']);
  });
});

// ---------------------------------------------------------------------------
// Anotação 16 — o clique na lista de animações, tocando
// ---------------------------------------------------------------------------

/**
 * Ele repetiu a anotação 6 depois da v4.8: *"quando tiver uma animação rodando,
 * quero poder clicar em outra e ela tocar. Atualmente isso está travado."*
 *
 * O motor estava certo. O que não acontecia era o **clique**: o painel
 * Animações escuta `time` e refazia a lista inteira a cada aviso; tocando, o
 * tempo muda a cada quadro, e o botão em que o dedo desceu já não existia
 * quando ele subiu. O navegador não dispara `click` entre dois elementos
 * diferentes.
 */
describe('anotação 16 — a lista não foge da mão', () => {
  const lista = signature([['idle', '2,00 s', true], ['walk', '1,00 s', true]]);

  it('mudar só o tempo não mexe no DOM', () => {
    const antes = { rows: lista, picked: 'idle' };
    expect(redrawPlan('time', antes, { rows: lista, picked: 'idle' })).toBe('nada');
  });

  it('sessenta avisos de tempo seguidos continuam não mexendo', () => {
    const forma = { rows: lista, picked: 'idle' };
    for (let i = 0; i < 60; i++) {
      expect(redrawPlan('time', forma, { rows: lista, picked: 'idle' })).toBe('nada');
    }
  });

  it('trocar de animação troca só o realce', () => {
    const antes = { rows: lista, picked: 'idle' };
    expect(redrawPlan('time', antes, { rows: lista, picked: 'walk' })).toBe('so-escolha');
  });

  it('animação nova, apagada ou renomeada refaz', () => {
    const antes = { rows: lista, picked: 'idle' };
    const maior = signature([['idle', '2,00 s', true], ['walk', '1,00 s', true], ['pulo', '0,50 s', false]]);
    expect(redrawPlan('structure', antes, { rows: maior, picked: 'idle' })).toBe('refazer');
  });

  it('mudar a duração refaz: ela está escrita na linha', () => {
    const antes = { rows: lista, picked: 'idle' };
    const outra = signature([['idle', '3,00 s', true], ['walk', '1,00 s', true]]);
    expect(redrawPlan('time', antes, { rows: outra, picked: 'idle' })).toBe('refazer');
  });

  it('arquivo novo e imagens novas refazem, mesmo com a lista igual', () => {
    const igual = { rows: lista, picked: 'idle' };
    expect(redrawPlan('file', igual, { rows: lista, picked: 'idle' })).toBe('refazer');
    expect(redrawPlan('assets', igual, { rows: lista, picked: 'idle' })).toBe('refazer');
  });

  it('a assinatura separa linha de linha e campo de campo', () => {
    expect(signature([['a', 1], ['b', 2]])).toBe(JSON.stringify([['a', 1], ['b', 2]]));
    // Duas listas diferentes nunca dão a mesma assinatura por acidente: um
    // nome com o separador dentro colidia, e este teste pegou o erro.
    expect(signature([['a|1']])).not.toBe(signature([['a', 1]]));
  });
});
});

// ---------------------------------------------------------------------------
// Inclinar compensa, como Mover, Girar e Escalar — 28/09/2026
// ---------------------------------------------------------------------------

/*
 * Achado na auditoria de 27/09: com "Não mexer nos filhos" LIGADO, Mover,
 * Girar e Escalar seguravam o filho no lugar, e Inclinar o arrastava junto.
 * A caixa estava marcada e o programa não fazia o que ela dizia — sem avisar
 * (regra 21). A forma: *a ferramenta nova copiou o molde e não copiou a
 * compensação*.
 */
describe('Inclinar com "não mexer nos filhos" ligado', () => {
  /*
   * Um boneco de três ossos, e NÃO o herói: o braço do herói é posado por uma
   * regra de IK, que refaz a matriz dele a cada quadro — inclinar o `arm` ali
   * não move o `forearm` com caixa ligada NEM desligada, e o teste passaria
   * sem provar nada. *O arquivo de exemplo rico esconde o caso simples.*
   */
  function boneco(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'pai', parent: 'root', x: 10, y: 20, rotation: 30, length: 50 },
        { name: 'filho', parent: 'pai', x: 50, rotation: 15, length: 30 },
        { name: 'neto', parent: 'filho', x: 30, rotation: -10, length: 20 },
      ],
    } as BoneFile;
  }

  function ev(x: number, y: number): ToolEvent {
    return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 };
  }

  type Quadro = ReturnType<typeof boneFrame>;

  /** O `pai` escolhido e inclinado por um arrasto de verdade. */
  function inclinarOPai(): { doc: Doc; filho: Quadro; neto: Quadro; ossos: string } {
    const doc = new Doc(boneco());
    doc.select({ ...emptySelection(), bones: ['pai'] });
    const filho = boneFrame(doc.skeleton!, 'filho');
    const neto = boneFrame(doc.skeleton!, 'neto');
    const ossos = JSON.stringify(doc.file.bones);
    const pai = doc.skeleton!.findBone('pai')!;
    const de = { x: pai.worldX + 40, y: pai.worldY + 40 };
    shearTool.onDown!(doc, ev(de.x, de.y));
    for (let i = 1; i <= 4; i++) shearTool.onMove!(doc, ev(de.x + 9 * i, de.y + 5 * i));
    shearTool.onUp!(doc, ev(de.x + 36, de.y + 20));
    doc.endMerge();
    return { doc, filho, neto, ossos };
  }

  function distancia(a: Quadro, b: Quadro): number {
    const chaves = Object.keys(a) as Array<keyof Quadro>;
    return Math.max(...chaves.map((k) => Math.abs(Number(a[k]) - Number(b[k]))));
  }

  function inclinou(doc: Doc): boolean {
    const pai = (doc.file.bones ?? []).find((b) => b.name === 'pai') as unknown as Record<string, unknown>;
    return Number(pai['shearX'] ?? 0) !== 0 || Number(pai['shearY'] ?? 0) !== 0;
  }

  it('DESLIGADO, o filho vai junto — é o que a caixa existe para evitar', () => {
    resetSpaceState();
    const { doc, filho } = inclinarOPai();
    expect(inclinou(doc)).toBe(true);
    expect(distancia(boneFrame(doc.skeleton!, 'filho'), filho)).toBeGreaterThan(0.01);
  });

  it('LIGADO, o filho e o neto ficam com a MESMA matriz de mundo', () => {
    resetSpaceState();
    setCompensation({ children: true });
    try {
      const { doc, filho, neto } = inclinarOPai();
      // O pai inclinou de verdade: senão o teste passaria por nada ter mudado.
      expect(inclinou(doc)).toBe(true);
      expect(distancia(boneFrame(doc.skeleton!, 'filho'), filho)).toBeLessThan(1e-6);
      expect(distancia(boneFrame(doc.skeleton!, 'neto'), neto)).toBeLessThan(1e-6);
    } finally {
      resetSpaceState();
    }
  });

  /*
   * Medido em 28/09/2026, antes do conserto: com a caixa ligada, um arrasto
   * de quatro movimentos pedia OITO desfazeres — em Mover, Girar e Escalar
   * também, desde que a compensação existe. A pilha juntava com um vizinho
   * só, e o gesto alterna dois comandos. O conserto é da pilha
   * (`doc/undo.ts`, `GestureGroup`); a prova é aqui, com a ferramenta.
   */
  it('LIGADO, o arrasto inteiro é UM passo de desfazer, e refazer devolve', () => {
    resetSpaceState();
    setCompensation({ children: true });
    try {
      const { doc, filho, ossos } = inclinarOPai();
      const feito = JSON.stringify(doc.file.bones);
      expect(feito).not.toBe(ossos);
      doc.undo();
      // Compara-se sem os zeros: o desfazer de `writeBoneValues` deixa
      // `shearX: 0` escrito onde o campo não existia. É o mesmo osso (ausente
      // já é o valor padrão, §4.2) com outra grafia — e é de antes deste lote.
      const padrao: Record<string, number> = { shearX: 0, shearY: 0, y: 0, scaleX: 1, scaleY: 1 };
      const semPadrao = JSON.stringify(doc.file.bones, (chave, valor) => (
        padrao[chave] === valor ? undefined : valor
      ));
      expect(semPadrao).toBe(ossos);
      expect(distancia(boneFrame(doc.skeleton!, 'filho'), filho)).toBeLessThan(1e-9);
      expect(doc.canUndo).toBe(false);
      doc.redo();
      expect(JSON.stringify(doc.file.bones)).toBe(feito);
    } finally {
      resetSpaceState();
    }
  });
});

// ---------------------------------------------------------------------------
// Um arrasto, um desfazer — as quatro ferramentas, nos dois modos (28/09/2026)
// ---------------------------------------------------------------------------

describe('com a compensação ligada, um arrasto é UM desfazer', () => {
  function boneco(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'pai', parent: 'root', x: 10, y: 20, rotation: 30, length: 50 },
        { name: 'filho', parent: 'pai', x: 50, rotation: 15, length: 30 },
      ],
      animations: [{ name: 'andar', duration: 1, timelines: [] }],
    } as BoneFile;
  }

  function ev(x: number, y: number): ToolEvent {
    return { x, y, dx: 0, dy: 0, shift: false, ctrl: false, alt: false, button: 0, scale: 1 };
  }

  /** O arquivo sem os valores padrão: ausente e zero são o mesmo osso (§4.2). */
  function retrato(doc: Doc): string {
    const padrao: Record<string, number> = { shearX: 0, shearY: 0, y: 0, scaleX: 1, scaleY: 1 };
    return JSON.stringify(
      { bones: doc.file.bones, animations: doc.file.animations },
      (chave, valor) => {
        if (padrao[chave] === valor) return undefined;
        return typeof valor === 'number' ? Math.round(valor * 1e9) / 1e9 : valor;
      },
    );
  }

  const FERRAMENTAS: ReadonlyArray<readonly [string, Tool]> = [
    ['Mover', translateTool], ['Girar', rotateTool], ['Escalar', scaleTool], ['Inclinar', shearTool],
  ];

  for (const modo of ['na base', 'animando'] as const) {
    for (const [nome, tool] of FERRAMENTAS) {
      it(`${nome}, ${modo}: doze movimentos do mouse, um passo na pilha`, () => {
        resetSpaceState();
        setCompensation({ children: true, drawings: true, boxes: true });
        try {
          const doc = new Doc(boneco());
          if (modo === 'animando') doc.animation = 'andar';
          doc.select({ ...emptySelection(), bones: ['pai'] });
          const antes = retrato(doc);
          const pai = doc.skeleton!.findBone('pai')!;
          const de = { x: pai.worldX + 40, y: pai.worldY + 40 };
          tool.onDown!(doc, ev(de.x, de.y));
          for (let i = 1; i <= 12; i++) tool.onMove!(doc, ev(de.x + 3 * i, de.y + 2 * i));
          tool.onUp!(doc, ev(de.x + 36, de.y + 24));
          doc.endMerge();

          const feito = retrato(doc);
          expect(feito, 'o arrasto não mudou nada').not.toBe(antes);
          expect(doc.history.entries().filter((e) => !e.undone)).toHaveLength(1);
          doc.undo();
          expect(retrato(doc)).toBe(antes);
          doc.redo();
          expect(retrato(doc)).toBe(feito);
        } finally {
          resetSpaceState();
        }
      });
    }
  }
});
