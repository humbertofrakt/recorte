/**
 * Colunas e barra de ações — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote16-duas-colunas`, `lote17-barra`, `lote24-anotacoes`.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { DEFAULT_WIDTH, LEFT_GROUPS, RIGHT_GROUPS, WIDTH_MAX, WIDTH_MIN, allTabs, columnOf, defaultLayout, missingTabs, moveToOtherColumn, parseLayout, selectInLayout, setWidth, sideOf, toggleLayoutHidden } from '../src/ui/layout-model.js';
import { ORDER_THUMB, orderPieces, stepIndex } from '../src/panels/draw-order.js';
import { MoveSlot } from '../src/panels/tree-model.js';
import { THUMB_SIZE } from '../src/panels/thumbnails.js';
import { WINDOW_PANELS, allMenus, flatEntries } from '../src/ui/menus.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { viewMenuState } from './ajuda-view.js';
import { EDIT_ITEMS, FILE_ITEMS, FIRST_INTO_MORE, MORE_HINT, MORE_LABEL, MOVED_OUT_OF_TOOLBAR, NEVER_IN_MORE, SEE_LOCK_ITEMS, actionBarGroups, actionBarItems, auditActionBar, fitBar } from '../src/ui/action-bar-model.js';
import type { BarSlot } from '../src/ui/action-bar-model.js';
import { VIEW_ITEMS } from '../src/ui/action-bar-model.js';
import { CLOSED_HEIGHT, dockHeightFor, toggleDock, OPEN_AT, OPEN_MIN, defaultDockState, dockFromDrag } from '../src/panels/dock-model.js';
import { toolbarItems } from '../src/ui/toolbar-model.js';
import * as toolbarModel from '../src/ui/toolbar-model.js';
import {
  FLOAT_KEEP, FLOAT_MAX_FRACTION, FLOAT_MIN_H, FLOAT_MIN_W, FOCUS_SPLIT, clampFloat,
  closeGroup, closePanel, defaultColumnState, dockAllFloating, dockPanel, dockedPanels,
  dropIndex, floatBoxOf, floatPanel, groupShares, insertionIndex, isCollapsed,
  isPanelClosed, isPanelFloating, moveTab, openPanels, parseColumnState, reopenPanel,
  restoreAutoSplit, selectTab, setFloatBox, setSplit, toggleCollapsed,
  SNAP_WORDS, SNAP_ZONE, floatSnapOf, isFloatSnap, setFloatSnap, snapFloat, snapOf, snappedBox,
} from '../src/ui/panel-groups.js';
import { hasIcon, iconNames } from '../src/ui/icons.js';
import type { Tool } from '../src/contract.js';
import { WHERE_DOORS, bodyTitle, whereLabel } from '../src/ui/where-model.js';
import { KEY_TABLE } from '../src/ui/keys.js';
import { moreHint, planTabStrip } from '../src/ui/tab-strip-model.js';
import { escolherQueCabe, versoesDaFrase } from '../src/ui/shell-status.js';
import { createTransport, switchAnimation } from '../src/anim/transport.js';
import type { TransportClock } from '../src/anim/transport.js';
import { MORE_CONTROLS, moreButtonHint } from '../src/panels/dopesheet-model.js';
import { playheadLabel, playheadOnKey } from '../src/panels/dopesheet.js';
import { summaryTimes } from '../src/anim/summary.js';

// ---------------------------------------------------------------------------
// duas colunas (lote 16) — era `lote16-duas-colunas.test.ts`
// ---------------------------------------------------------------------------

describe('duas colunas (lote 16)', () => {
/**
 * Lote 16 (v3.8): duas colunas laterais, e a aba **Ordem**.
 *
 * Sem DOM. *"Ele usa as laterais, por isso a cena é muito mais espaçosa"*: a
 * bancada passa a ter uma coluna de cada lado da cena, e a ordem de desenho
 * sai de dentro da Árvore e vira aba própria, com miniatura de 40px.
 *
 * O que se prova aqui é a CONTA: a migração do que já está gravado, para onde
 * uma aba vai quando muda de lado, os limites da largura, e que arrastar na
 * aba Ordem é a MESMA `MoveSlot` de sempre — um passo de desfazer, e volta.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

/** Os painéis de coluna que o programa tem hoje. */
// A `previa` entra aqui desde o lote 25: ela voltou a ser painel de coluna.
const KNOWN = ['arvore', 'ordem', 'propriedades', 'animacoes', 'exibicao', 'malha',
  'previa', 'peles', 'regras'];

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

function state(patch: Partial<MenuState> = {}): MenuState {
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
    ...patch,
  };
}

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

// ---------------------------------------------------------------------------
// A bancada de fábrica
// ---------------------------------------------------------------------------

describe('as duas colunas de fábrica', () => {
  it('a Árvore e as Propriedades ficam à esquerda; as Animações, à direita', () => {
    const layout = defaultLayout(KNOWN);
    expect(sideOf(layout, 'arvore')).toBe('left');
    expect(sideOf(layout, 'ordem')).toBe('left');
    expect(sideOf(layout, 'propriedades')).toBe('left');
    expect(sideOf(layout, 'animacoes')).toBe('right');
    expect(sideOf(layout, 'exibicao')).toBe('right');
    expect(sideOf(layout, 'malha')).toBe('right');
  });

  it('cada lado tem dois grupos, com a primeira aba de cada um à frente', () => {
    const layout = defaultLayout(KNOWN);
    expect(layout.left.groups.length).toBe(2);
    expect(layout.right.groups.length).toBe(2);
    expect(layout.left.active[0]).toBe('arvore');
    expect(layout.right.active[1]).toBe('animacoes');
  });

  it('nasce com 260px de cada lado e nada escondido', () => {
    const layout = defaultLayout(KNOWN);
    expect(layout.widths).toEqual([DEFAULT_WIDTH, DEFAULT_WIDTH]);
    expect(layout.widths).toEqual([260, 260]);
    expect(layout.hidden).toBe(false);
  });

  it('a aba que o programa ainda não tem é pulada, sem estourar', () => {
    const layout = defaultLayout(KNOWN);
    // `imagens` chega no lote 20, `historico` no 19, `entidades` no degrau 5
    // e `pivos` no degrau 8 (18/09/2026): os quatro já estão reservados na
    // arrumação de fábrica, e o `KNOWN` deste teste é o do lote 16, de quando
    // nenhum dos quatro existia.
    // A rodada 15 (04/10/2026) pôs `particulas` no mesmo grupo: a quinta.
    expect(missingTabs(KNOWN).sort()).toEqual(['entidades', 'historico', 'imagens', 'particulas', 'pivos']);
    for (const aba of ['imagens', 'historico', 'entidades', 'pivos', 'particulas']) {
      expect(allTabs(layout)).not.toContain(aba);
    }
    // E nenhuma aba conhecida se perdeu no caminho.
    expect(allTabs(layout).sort()).toEqual([...KNOWN].sort());
  });

  it('nenhum painel aparece nos dois lados', () => {
    const layout = defaultLayout(KNOWN);
    const todas = allTabs(layout);
    expect(new Set(todas).size).toBe(todas.length);
    for (const id of LEFT_GROUPS.flat()) expect(RIGHT_GROUPS.flat()).not.toContain(id);
  });
});

// ---------------------------------------------------------------------------
// A migração — nada do que já está gravado se perde
// ---------------------------------------------------------------------------

describe('o que já estava gravado', () => {
  it('a coluna única de antes do lote 16 vira a coluna da DIREITA', () => {
    const antigo = {
      groups: [['arvore', 'propriedades'], ['animacoes']],
      active: ['propriedades', 'animacoes'],
      split: 0.4,
      hidden: false,
    };
    const layout = parseLayout(antigo, KNOWN);
    expect(layout.right.groups[0]).toContain('arvore');
    expect(layout.right.groups[0]).toContain('propriedades');
    expect(layout.right.groups[1]).toContain('animacoes');
    expect(layout.right.split).toBeCloseTo(0.4, 6);
    // A esquerda nasce de fábrica, sem roubar nada da direita.
    expect(layout.left.groups.flat().length).toBeGreaterThan(0);
    for (const id of layout.left.groups.flat()) {
      expect(layout.right.groups.flat()).not.toContain(id);
    }
  });

  it('sem nada gravado, os dois lados nascem de fábrica', () => {
    const layout = parseLayout(undefined, KNOWN);
    expect(layout).toEqual(defaultLayout(KNOWN));
    expect(parseLayout(null, KNOWN)).toEqual(defaultLayout(KNOWN));
    expect(parseLayout({}, KNOWN)).toEqual(defaultLayout(KNOWN));
  });

  it('ida e volta pelo formato novo devolve a mesma bancada', () => {
    const antes = setWidth(moveToOtherColumn(defaultLayout(KNOWN), 'propriedades'), 'left', 300);
    const guardado = {
      left: { groups: antes.left.groups, active: antes.left.active, split: antes.left.split },
      right: { groups: antes.right.groups, active: antes.right.active, split: antes.right.split },
      widths: antes.widths,
      hidden: antes.hidden,
    };
    const lido = parseLayout(JSON.parse(JSON.stringify(guardado)), KNOWN);
    expect(lido.left.groups).toEqual(antes.left.groups);
    expect(lido.right.groups).toEqual(antes.right.groups);
    expect(lido.widths).toEqual(antes.widths);
  });

  it('largura fora dos limites fica dentro deles', () => {
    const layout = parseLayout({ left: {}, right: {}, widths: [100, 900] }, KNOWN);
    expect(layout.widths).toEqual([WIDTH_MIN, WIDTH_MAX]);
    expect(layout.widths).toEqual([180, 480]);
    expect(setWidth(defaultLayout(KNOWN), 'left', 10).widths[0]).toBe(WIDTH_MIN);
    expect(setWidth(defaultLayout(KNOWN), 'right', 9999).widths[1]).toBe(WIDTH_MAX);
  });
});

// ---------------------------------------------------------------------------
// Mudar de lado
// ---------------------------------------------------------------------------

describe('mover uma aba para a outra coluna', () => {
  it('ela some de um lado e entra no FIM do último grupo do outro, à frente', () => {
    const antes = defaultLayout(KNOWN);
    const depois = moveToOtherColumn(antes, 'propriedades');
    expect(sideOf(depois, 'propriedades')).toBe('right');
    expect(depois.left.groups.flat()).not.toContain('propriedades');
    const ultimo = depois.right.groups[depois.right.groups.length - 1]!;
    expect(ultimo[ultimo.length - 1]).toBe('propriedades');
    expect(depois.right.active[depois.right.groups.length - 1]).toBe('propriedades');
  });

  it('o grupo que ficou sem a aba à frente escolhe outra', () => {
    const antes = defaultLayout(KNOWN);
    expect(antes.left.active[1]).toBe('propriedades');
    const depois = moveToOtherColumn(antes, 'propriedades');
    expect(depois.left.active[1]).toBeNull();
  });

  it('ir e voltar não perde a aba', () => {
    const antes = defaultLayout(KNOWN);
    const ida = moveToOtherColumn(antes, 'arvore');
    const volta = moveToOtherColumn(ida, 'arvore');
    expect(sideOf(volta, 'arvore')).toBe('left');
    expect(allTabs(volta).sort()).toEqual(allTabs(antes).sort());
  });

  it('mover uma aba que não existe não muda nada', () => {
    const antes = defaultLayout(KNOWN);
    expect(moveToOtherColumn(antes, 'nao-existe')).toBe(antes);
    expect(selectInLayout(antes, 'nao-existe')).toBe(antes);
  });

  it('Tab esconde os dois lados de uma vez', () => {
    const escondida = toggleLayoutHidden(defaultLayout(KNOWN));
    expect(escondida.hidden).toBe(true);
    expect(toggleLayoutHidden(escondida).hidden).toBe(false);
  });

  it('escolher uma aba mexe só no lado dela', () => {
    const antes = defaultLayout(KNOWN);
    const depois = selectInLayout(antes, 'ordem');
    expect(columnOf(depois, 'left').active[0]).toBe('ordem');
    expect(depois.right).toBe(antes.right);
  });
});

// ---------------------------------------------------------------------------
// A aba Ordem
// ---------------------------------------------------------------------------

describe('a aba Ordem', () => {
  // Desde o lote 25 (anotação 9) só desenho entra, e `orderPieces` devolve as
  // peças na ordem do ARRAY. A leitura invertida é do `orderEntries`.
  it('uma linha por desenho, na ordem de desenho do arquivo', () => {
    const doc = heroi();
    const rows = orderPieces(doc.file);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThan((doc.file.slots ?? []).length);
    // Os índices só crescem: a conta não embaralha a ordem do array.
    for (let i = 1; i < rows.length; i++) {
      expect(rows[i]!.index).toBeGreaterThan(rows[i - 1]!.index);
    }
  });

  it('cada linha traz o osso e o desenho de repouso', () => {
    const doc = heroi();
    const rows = orderPieces(doc.file);
    for (const row of rows) {
      const slot = doc.file.slots?.[row.index];
      expect(row.bone).toBe(slot?.bone);
      expect(row.attachment).toBe(slot?.attachment ?? null);
    }
  });

  it('a miniatura é bem maior que a da Árvore', () => {
    expect(ORDER_THUMB).toBe(40);
    expect(ORDER_THUMB).toBeGreaterThan(THUMB_SIZE);
  });

  // Lote 25: o argumento passou a ser "para a frente?", e para a frente é
  // para o FIM do array — anotação 8.
  it('frente e trás param nas pontas, sem gastar um passo de desfazer', () => {
    expect(stepIndex(0, false, 23)).toBeNull();
    expect(stepIndex(22, true, 23)).toBeNull();
    expect(stepIndex(0, true, 23)).toBe(1);
    expect(stepIndex(22, false, 23)).toBe(21);
    expect(stepIndex(-1, true, 23)).toBeNull();
  });

  it('um passo é a mesma MoveSlot de sempre, e Ctrl+Z devolve', () => {
    const doc = heroi();
    const antes = (doc.file.slots ?? []).map((s) => s.name);
    const alvo = stepIndex(0, true, antes.length);
    expect(alvo).toBe(1);

    doc.run(new MoveSlot(0, alvo as number));
    const depois = (doc.file.slots ?? []).map((s) => s.name);
    expect(depois[0]).toBe(antes[1]);
    expect(depois[1]).toBe(antes[0]);
    expect(doc.undoLabel).toBe('Mudar a ordem de desenho');

    doc.undo();
    expect((doc.file.slots ?? []).map((s) => s.name)).toEqual(antes);
  });
});

// ---------------------------------------------------------------------------
// Nada some do menu
// ---------------------------------------------------------------------------

describe('o menu conhece a aba nova', () => {
  it('Janela lista a Ordem, e sabe mover um painel de lado', () => {
    expect(WINDOW_PANELS.map((p) => p.id)).toContain('ordem');
    const janela = menus().find((g) => g.label === 'Janela');
    const acoes = flatEntries(janela?.entries ?? []).map((e) => e.action);
    expect(acoes).toContain('painel-ordem');
    expect(acoes).toContain('mover-de-coluna');
  });

  it('subir e descer na ordem de desenho deixaram de ser itens cinza', () => {
    // Rodada 6: o menu Esqueleto passou a se chamar Base.
    const base = menus().find((g) => g.label === 'Base');
    const itens = flatEntries(base?.entries ?? []);
    const subir = itens.find((e) => e.action === 'subir-ordem');
    const descer = itens.find((e) => e.action === 'descer-ordem');
    expect(subir?.enabled).toBe(true);
    expect(descer?.enabled).toBe(true);
    expect(subir?.shortcut).toBe('+');
    expect(descer?.shortcut).toBe('−');
  });
});
});

// ---------------------------------------------------------------------------
// barra (lote 17) — era `lote17-barra.test.ts`
// ---------------------------------------------------------------------------

describe('barra (lote 17)', () => {
/**
 * Lote 17 (v3.9): a barra de ações, e os quatro botões de ver e travar.
 *
 * Sem DOM. A barra é uma LISTA — `ui/action-bar-model.ts` —, e o que se prova
 * aqui é que ela está sã: cinco grupos na ordem do Spriter, todo botão com
 * nome, com dica, com ícone que existe e com uma ação que existe.
 *
 * O pedido do Humberto, apontando para a tela do Spriter Pro:
 * *"**Observe que não temos isso**"* — os quatro botões `Show Bones · Lock
 * Bones · Show Sprites · Lock Sprites`, em texto, acesos em laranja.
 */
/**
 * As ferramentas de mentira, na ordem em que as de verdade se registram.
 *
 * O teste não importa `viewport/tools/*`: importar um deles arrasta o canvas
 * inteiro para dentro de um teste que não tem navegador. Nenhuma declara modo:
 * o campo `modes` saiu do contrato no degrau 4a (17/09/2026).
 */
const TOOLS: Tool[] = [
  { id: 'select', label: 'Escolher', shortcut: 'V' },
  { id: 'translate', label: 'Mover', shortcut: 'W' },
  { id: 'rotate', label: 'Girar', shortcut: 'E' },
  { id: 'scale', label: 'Escalar', shortcut: 'R' },
  { id: 'pose', label: 'Posar', shortcut: 'T' },
  { id: 'create-bone', label: 'Criar osso', shortcut: 'B' },
  { id: 'point', label: 'Ponto', shortcut: 'O' },
  { id: 'box', label: 'Caixa', shortcut: 'X' },
  { id: 'mesh', label: 'Malha', shortcut: 'M' },
  { id: 'weights', label: 'Pesos', shortcut: 'G' },
];

function state(patch: Partial<MenuState> = {}): MenuState {
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
    ...patch,
  };
}

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

/**
 * As ações que existem, sem ligar o programa.
 *
 * Um teste sem navegador não tem registro de ações: nenhum painel montou. Mas
 * o menu é dado puro, e toda ação da barra tem que estar em algum menu — é a
 * regra 5 do plano, "menu e botão chamam a mesma função". Fora dele só entram
 * as ferramentas, cuja ação nasce com o próprio id.
 */
function acaoExiste(id: string): boolean {
  const doMenu = new Set(flatEntries(menus().flatMap((g) => g.entries)).map((e) => e.action));
  const daFerramenta = new Set(TOOLS.map((tool) => `ferramenta-${tool.id}`));
  return doMenu.has(id) || daFerramenta.has(id);
}

// ---------------------------------------------------------------------------
// Os cinco grupos
// ---------------------------------------------------------------------------

describe('a barra de ações', () => {
  it('são SEIS grupos, na ordem do Spriter; o modo saiu no degrau 11', () => {
    // O grupo `modo` chegou no lote 23 e SAIU no degrau 11 (18/09/2026): o
    // rodapé diz onde se está, como o Spriter. O `exibir` chegou
    // no 29 (anotação 15) com a **imagem de referência**, que só existia no
    // fim do menu Exibir e é a primeira coisa que se procura ao começar um
    // personagem em cima de um desenho.
    const grupos = actionBarGroups(TOOLS);
    expect(grupos.map((g) => g.id))
      .toEqual(['arquivo', 'editar', 'ferramentas', 'eixos', 'exibir', 'verTravar']);
  });

  it('Arquivo tem três: Novo, Abrir, Salvar', () => {
    const arquivo = actionBarGroups(TOOLS)[0]!;
    expect(arquivo.items.map((i) => i.actionId)).toEqual(['novo', 'abrir', 'salvar']);
    expect(FILE_ITEMS.length).toBe(3);
  });

  it('Editar tem seis, e Desfazer e Refazer são os dois primeiros', () => {
    const editar = actionBarGroups(TOOLS)[1]!;
    expect(editar.items.length).toBe(6);
    expect(editar.items[0]?.icon).toBe('undo');
    expect(editar.items[1]?.icon).toBe('redo');
    expect(editar.items.map((i) => i.actionId)).toEqual([
      'desfazer', 'refazer', 'recortar-chaves', 'copiar', 'colar', 'apagar',
    ]);
    expect(EDIT_ITEMS.length).toBe(6);
  });

  it('o grupo dos Eixos é a lista de três palavras, e não botões', () => {
    const eixos = actionBarGroups(TOOLS)[3]!;
    expect(eixos.id).toBe('eixos');
    expect(eixos.items).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Os quatro do pedido
// ---------------------------------------------------------------------------

describe('ver e travar: os quatro botões de texto', () => {
  it('são quatro, em texto, com as teclas 7 8 9 0 nesta ordem', () => {
    const grupo = actionBarGroups(TOOLS)[5]!;
    expect(grupo.id).toBe('verTravar');
    expect(grupo.items.length).toBe(4);
    expect(grupo.items.map((i) => i.style)).toEqual([
      'text-toggle', 'text-toggle', 'text-toggle', 'text-toggle',
    ]);
    expect(grupo.items.map((i) => i.key)).toEqual(['7', '8', '9', '0']);
  });

  it('a ordem é ver e travar dos ossos, depois dos desenhos', () => {
    expect(SEE_LOCK_ITEMS.map((i) => i.actionId)).toEqual([
      'ver-ossos', 'travar-ossos', 'ver-desenhos', 'travar-desenhos',
    ]);
    expect(SEE_LOCK_ITEMS.map((i) => i.label)).toEqual([
      'Ver ossos', 'Travar ossos', 'Ver desenhos', 'Travar desenhos',
    ]);
  });

  it('botão de texto não tem ícone, e botão de ícone tem', () => {
    for (const item of actionBarItems(TOOLS)) {
      if (item.style === 'icon') {
        expect(hasIcon(item.icon), `${item.id}: ícone ${item.icon}`).toBe(true);
      } else {
        expect(item.icon, item.id).toBe('');
      }
    }
  });

  it('as teclas batem com as do menu Exibir: uma fonte só', () => {
    const doMenu = new Map(
      flatEntries(menus().flatMap((g) => g.entries)).map((e) => [e.action, e.shortcut]),
    );
    for (const item of SEE_LOCK_ITEMS) {
      expect(doMenu.get(item.actionId), `${item.actionId} discorda do menu`).toBe(item.key);
    }
  });
});

// ---------------------------------------------------------------------------
// A barra inteira está sã
// ---------------------------------------------------------------------------

describe('a barra inteira', () => {
  it('não tem nada errado — e é uma barra só, sem pedir modo', () => {
    expect(auditActionBar(TOOLS, acaoExiste)).toEqual([]);
    // Degrau 4a: a barra não recebe mais o modo; chamar duas vezes dá o mesmo.
    expect(actionBarGroups(TOOLS)).toEqual(actionBarGroups(TOOLS));
  });

  it('nenhum botão aparece duas vezes', () => {
    const ids = actionBarItems(TOOLS).map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('todo botão diz a tecla dele na dica', () => {
    for (const item of actionBarItems(TOOLS)) {
      if (item.key === null) continue;
      expect(item.hint, item.id).toContain(item.key);
    }
  });

  it('os nove ícones novos existem, desenhados aqui', () => {
    for (const nome of ['undo', 'redo', 'cut', 'copy', 'paste', 'trash', 'new', 'open', 'save']) {
      expect(hasIcon(nome), nome).toBe(true);
      expect(iconNames()).toContain(nome);
    }
  });

  it('as cinco ferramentas de estrutura ficam na barra, com a base ou uma animação aberta (degrau 4a)', () => {
    const ferramentas = actionBarGroups(TOOLS)[2]!.items.map((i) => i.id);
    expect(ferramentas.length).toBe(10);
    for (const id of ['create-bone', 'point', 'box', 'mesh', 'weights']) {
      expect(ferramentas).toContain(id);
    }
    // Os outros grupos também.
    expect(actionBarGroups(TOOLS)[5]!.items.length).toBe(4);
    // Rodada 17, PL-31: a Imagem de referência e a Prévia.
    expect(actionBarGroups(TOOLS)[4]!.items.length).toBe(2);
    expect(actionBarGroups(TOOLS)[0]!.items.length).toBe(3);
  });

  it('o teste do lote 4, no novo: `toolsForMode` saiu, e a barra leva as dez', () => {
    expect('toolsForMode' in toolbarModel).toBe(false);
    expect(toolbarItems(TOOLS).length).toBe(10);
    expect(actionBarItems(TOOLS).filter((i) => i.actionId.startsWith('ferramenta-')).length).toBe(10);
  });

  it('o que saiu da barra continua escrito, com o motivo', () => {
    const oQue = MOVED_OUT_OF_TOOLBAR.map((linha) => linha.what);
    expect(oQue).toContain('Aproximar, Afastar, Ajustar à tela');
    expect(oQue).toContain('Os dois cadeados em ícone');
    for (const linha of MOVED_OUT_OF_TOOLBAR) {
      expect(linha.to.trim(), linha.what).not.toBe('');
    }
  });
});

// ---------------------------------------------------------------------------
// Regra 5 do plano: menu e botão são a mesma porta
// ---------------------------------------------------------------------------

describe('menu e botão chamam a mesma função', () => {
  it('toda ação da barra que não é ferramenta está num menu', () => {
    const doMenu = new Set(flatEntries(menus().flatMap((g) => g.entries)).map((e) => e.action));
    for (const item of actionBarItems(TOOLS)) {
      if (item.actionId.startsWith('ferramenta-')) continue;
      expect(doMenu.has(item.actionId), `${item.actionId} não está em menu nenhum`).toBe(true);
    }
  });

  it('a ação de uma ferramenta leva o id dela', () => {
    for (const tool of TOOLS) {
      const item = actionBarItems(TOOLS).find((i) => i.id === tool.id);
      expect(item?.actionId).toBe(`ferramenta-${tool.id}`);
    }
  });
});

// ---------------------------------------------------------------------------
// O interruptor de modo SAIU — degrau 11, lote 1 (18/09/2026). Era o lote 23.
// Estes testes provavam o interruptor; agora provam o rodapé e as portas novas.
// ---------------------------------------------------------------------------

describe('o interruptor saiu da barra, e o rodapé diz onde se está', () => {
  it('a barra não tem mais o grupo de modo; o primeiro grupo é Arquivo', () => {
    const grupos = actionBarGroups(TOOLS);
    expect(grupos.map((g) => g.id)).not.toContain('modo');
    expect(grupos[0]?.id).toBe('arquivo');
    // Nenhum botão da barra chama a ação que saiu, nem tem o estilo que saiu.
    for (const item of actionBarItems(TOOLS)) {
      expect(item.actionId, item.id).not.toBe('alternar-modo');
      expect(['icon', 'text-toggle'], item.id).toContain(item.style);
    }
  });

  it('Ctrl+Tab saiu dos menus e da tabela de teclas; Tab sozinho continua', () => {
    const doMenu = new Map(
      flatEntries(menus().flatMap((g) => g.entries)).map((e) => [e.action, e.shortcut]),
    );
    expect([...doMenu.values()]).not.toContain('Ctrl+Tab');
    expect(KEY_TABLE.some((row) => row.key === 'ctrl+tab')).toBe(false);
    expect(doMenu.get('esconder-paineis')).toBe('Tab');
  });

  it('o rodapé diz "Base: homem" e "Animação: andar", nas palavras do Humberto', () => {
    const base = whereLabel({ animation: null, body: 'homem' });
    expect(base.kind).toBe('base');
    expect(base.title).toBe('Base: homem');
    expect(base.detail).toContain('base');
    const andar = whereLabel({ animation: 'andar', body: 'homem' });
    expect(andar.kind).toBe('animacao');
    expect(andar.title).toBe('Animação: andar');
    // A da animação avisa o que muda: lá, mexer grava chave.
    expect(andar.detail).toContain('chave');
  });

  it('o nome do corpo vem sem a extensão, e nunca vazio', () => {
    expect(bodyTitle('homem.bone')).toBe('homem');
    expect(bodyTitle('Lobisomem.BONE')).toBe('Lobisomem');
    expect(bodyTitle('  ')).toBe('sem nome');
    expect(whereLabel({ animation: null, body: '' }).title).toBe('Base: sem nome');
  });

  it('nada some sem porta: a dica do rodapé diz por onde se troca', () => {
    for (const onde of [whereLabel({ animation: null, body: 'homem' }), whereLabel({ animation: 'andar', body: 'homem' })]) {
      expect(onde.hint).toContain(WHERE_DOORS);
      expect(onde.hint).toContain('janela Animação');
      expect(onde.hint).toContain('Abrir a base');
    }
  });

  it('com a virada de corpo, o rodapé diz o corpo do instante', () => {
    const virou = whereLabel({ animation: 'transformar', body: 'homem', bodyNow: 'lobisomem' });
    expect(virou.title).toBe('Animação: transformar');
    expect(virou.detail).toContain('lobisomem');
    // O mesmo corpo não é virada: a frase fica curta.
    expect(whereLabel({ animation: 'andar', body: 'homem', bodyNow: 'homem' }).detail).toBe('Mexer grava chave.');
  });

  it('a faixa de baixo abre e fecha, e a altura de aberta não muda', () => {
    const fechada = { open: false, height: 377 };
    const aberta = { ...fechada, open: true };
    expect(dockHeightFor(aberta, 0)).toBe(377);
    expect(dockHeightFor({ ...aberta, open: false }, 0)).toBe(CLOSED_HEIGHT);
    // Fechar e abrir de novo devolve exatamente a altura de antes.
    expect(toggleDock(toggleDock(fechada))).toEqual(fechada);
  });

  it('"Montagem ⇄ Animando" saiu do menu, e Abrir a base ficou, uma vez só', () => {
    const animacao = menus().find((g) => g.label === 'Animação');
    const itens = flatEntries(animacao?.entries ?? []);
    expect(itens.find((e) => e.action === 'alternar-modo')).toBeUndefined();
    // Rodada 6: "Abrir a base" mora no menu Base, e saiu do Animação.
    expect(itens.find((e) => e.action === 'abrir-a-base')).toBeUndefined();
    const doMenuBase = flatEntries(menus().find((g) => g.label === 'Base')?.entries ?? []);
    const base = doMenuBase.find((e) => e.action === 'abrir-a-base');
    expect(base?.label).toBe('Abrir a base');
    expect(base?.shortcut).toBeUndefined();
    const todas = flatEntries(menus().flatMap((g) => g.entries)).map((e) => e.action);
    expect(todas.filter((a) => a === 'abrir-a-base').length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Os botões em bloco viraram ícones — lote 23, a pedido do Humberto
// ---------------------------------------------------------------------------

describe('os ícones novos da folha de chaves', () => {
  it('os quatro desenhos novos existem', () => {
    for (const nome of ['key-remove', 'expand-h', 'contract-h', 'mirror-h']) {
      expect(hasIcon(nome), nome).toBe(true);
    }
  });
});

});

// ---------------------------------------------------------------------------
// anotacoes (lote 24) — era `lote24-anotacoes.test.ts`
// ---------------------------------------------------------------------------

describe('anotacoes (lote 24)', () => {
/**
 * Lote 24 (v4.7): as anotações 3, 4, 6 e 7 do Humberto.
 *
 * Ele usou o editor depois do lote 23 e apontou dez coisas. Quatro delas são
 * deste lote, e as quatro são a mesma queixa dita de quatro jeitos: **o
 * programa faz coisa que ele não pediu, e não diz o que está fazendo.**
 *
 * | # | Nas palavras dele |
 * |:---:|:---|
 * | 3 | a dica do ⋯ Mais não fala de "No fim" nem de "Mostrar só os escolhidos" |
 * | 4 | *"não quero que a linha do tempo fique abrindo. Se ela está fechada, não devia abrir do nada"* |
 * | 6 | *"quando dou play e mudo de animação, ele não troca a animação automaticamente"* |
 * | 7 | *"não sei qual é o quadro que eu estou mexendo. Podia estar escrito na barra"* |
 *
 * Sem DOM: tudo o que se prova aqui é conta de módulo puro. O tocador recebe
 * um relógio de mentira, então "tocou 100 ms" não espera 100 ms de verdade.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function exampleDoc(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile);
}

/** Um relógio de mentira: o teste diz que horas são. */
function fakeClock(): TransportClock & { fire(stampMs: number): void; pending(): number } {
  let next = 1;
  const jobs = new Map<number, (stampMs: number) => void>();
  return {
    now: () => 0,
    schedule(run) {
      const id = next++;
      jobs.set(id, run);
      return id;
    },
    cancel(id) {
      jobs.delete(id);
    },
    fire(stampMs) {
      const todo = [...jobs.entries()];
      jobs.clear();
      for (const [, run] of todo) run(stampMs);
    },
    pending: () => jobs.size,
  };
}

// ---------------------------------------------------------------------------
// Anotação 4 — a faixa fechada não abre sozinha
// ---------------------------------------------------------------------------

describe('anotação 4 — a faixa de baixo só abre por gesto dele', () => {
  it('fechada, a alça só abre quando puxada até OPEN_MIN', () => {
    const fechada = defaultDockState();
    expect(fechada.open).toBe(false);
    // Era aqui que ela abria sozinha: 40px acima do fechado é um esbarrão.
    expect(dockFromDrag(fechada, OPEN_AT).open).toBe(false);
    expect(dockFromDrag(fechada, CLOSED_HEIGHT + 100).open).toBe(false);
    expect(dockFromDrag(fechada, OPEN_MIN - 1).open).toBe(false);
    expect(dockFromDrag(fechada, OPEN_MIN).open).toBe(true);
  });

  it('puxar sem abrir não perde a altura que ela tinha guardada', () => {
    const fechada = { open: false, height: 420 };
    expect(dockFromDrag(fechada, CLOSED_HEIGHT + 60).height).toBe(420);
  });

  it('aberta, ela continua fechando perto do chão', () => {
    const aberta = { open: true, height: 400 };
    expect(dockFromDrag(aberta, OPEN_AT - 1).open).toBe(false);
    expect(dockFromDrag(aberta, OPEN_AT + 1).open).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Anotação 6 — trocar de animação tocando
// ---------------------------------------------------------------------------

describe('anotação 6 — tocando, trocar de animação segue tocando a nova', () => {
  it('tocando: continua tocando, e do tempo zero', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    const doc = exampleDoc();
    doc.animation = 'idle';
    doc.time = 0;
    player.play(doc);
    clock.fire(100);
    expect(player.isPlaying()).toBe(true);
    expect(doc.time).toBeGreaterThan(0);

    switchAnimation(doc, 'walk', player);
    expect(doc.animation).toBe('walk');
    expect(doc.time).toBe(0);
    expect(player.isPlaying()).toBe(true);

    // E a agulha anda mesmo, na animação NOVA.
    clock.fire(200);
    clock.fire(300);
    expect(player.isPlaying()).toBe(true);
    expect(doc.time).toBeGreaterThan(0);
  });

  it('parado: continua parado, e do tempo zero', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    const doc = exampleDoc();
    doc.animation = 'idle';
    doc.time = 0.5;
    expect(player.isPlaying()).toBe(false);

    switchAnimation(doc, 'walk', player);
    expect(doc.animation).toBe('walk');
    expect(doc.time).toBe(0);
    expect(player.isPlaying()).toBe(false);
  });

  it('voltar à Montagem para o tocador: não há tempo a andar na pose de repouso', () => {
    const clock = fakeClock();
    const player = createTransport(clock);
    const doc = exampleDoc();
    doc.animation = 'idle';
    player.play(doc);
    clock.fire(100);
    expect(player.isPlaying()).toBe(true);

    switchAnimation(doc, null, player);
    expect(doc.animation).toBeNull();
    expect(doc.time).toBe(0);
    expect(player.isPlaying()).toBe(false);
    expect(clock.pending()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Anotação 7 — o tempo e o quadro escritos na agulha
// ---------------------------------------------------------------------------

describe('anotação 7 — a bandeirinha da agulha', () => {
  it('escreve o tempo e o quadro, com vírgula', () => {
    expect(playheadLabel(0.02, 30)).toBe('0,02 s · q 1');
    expect(playheadLabel(1, 30)).toBe('1,00 s · q 30');
    expect(playheadLabel(0, 30)).toBe('0,00 s · q 0');
  });

  it('o quadro é o mesmo para onde as setas levam', () => {
    expect(playheadLabel(2, 24)).toBe('2,00 s · q 48');
    // Arredonda, como o `snapToFrame`: a bandeirinha não pode dizer um número
    // e a seta levar a outro.
    expect(playheadLabel(0.6 / 30, 30)).toBe('0,02 s · q 1');
    expect(playheadLabel(0.4 / 30, 30)).toBe('0,01 s · q 0');
  });

  it('diz se a agulha está em cima de uma chave', () => {
    const doc = exampleDoc();
    doc.animation = 'walk';
    const tempos = summaryTimes(doc.file, 'walk');
    expect(tempos.length).toBeGreaterThan(1);

    doc.time = tempos[0];
    expect(playheadOnKey(doc)).toBe(true);

    // Entre duas chaves, não.
    doc.time = (tempos[0] + tempos[1]) / 2;
    expect(playheadOnKey(doc)).toBe(false);
  });

  it('em Montagem não há chave em lugar nenhum', () => {
    const doc = exampleDoc();
    doc.animation = null;
    doc.time = 0;
    expect(playheadOnKey(doc)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Anotação 3 — a dica do ⋯ Mais lista o que tem dentro
// ---------------------------------------------------------------------------

describe('anotação 3 — a dica do ⋯ Mais', () => {
  it('lista o que ele não achava: No fim e Mostrar só os escolhidos', () => {
    const dica = moreButtonHint();
    expect(dica).toContain('No fim');
    expect(dica).toContain('mostrar só os escolhidos');
    expect(dica).toContain('tirar trecho de laço');
  });

  it('sai da própria lista de controles: controle novo entra na dica sozinho', () => {
    const dica = moreButtonHint();
    for (const control of MORE_CONTROLS) {
      if (control.hintName === undefined) continue;
      expect(dica).toContain(control.hintName);
    }
  });

  it('só Fator e Espelhar esquerda e direita ficam de fora', () => {
    const fora = MORE_CONTROLS.filter((c) => c.hintName === undefined).map((c) => c.id);
    expect(fora).toEqual(['fator', 'espelhar-lados']);
  });
});
});


// ---------------------------------------------------------------------------
// Recolher um grupo, e o espaço ir para quem está sendo usado — 13/09/2026
// ---------------------------------------------------------------------------

describe('recolher um grupo, e a altura ir para quem trabalha', () => {
/**
 * O Humberto, 13/09/2026: *"aposto que tem muito espaço mal otimizado; eu
 * arrasto quando vou usar outra coisa... podia ter também botões para recolher
 * quando não estivesse usando"*.
 *
 * A medição de altura tinha achado a mesma coisa pelo número: a divisão de
 * fábrica era 0,58 FIXA e não olhava para onde a pessoa estava trabalhando. Em
 * 1280×720 a aba Animações não mostrava **nenhuma** animação — só a barra de
 * ícones.
 *
 * Duas peças, as duas aqui, puras: o botão de recolher, e a divisão que segue
 * o grupo em uso enquanto ninguém arrastou a alça.
 */
  const KNOWN2 = ['arvore', 'propriedades', 'animacoes', 'exibicao', 'malha'];

  it('de fábrica: nada recolhido, divisão automática, e o foco no grupo de cima', () => {
    const estado = defaultColumnState();
    expect(estado.collapsed).toEqual([false, false]);
    expect(estado.autoSplit).toBe(true);
    expect(estado.focus).toBe(0);
  });

  it('a altura vai para o grupo em uso, e muda quando a pessoa muda de aba', () => {
    const estado = defaultColumnState();
    expect(groupShares(estado)).toEqual([FOCUS_SPLIT, 1 - FOCUS_SPLIT]);
    // Clicar numa aba do grupo de baixo passa a maior parte para lá.
    const embaixo = selectTab(estado, estado.groups[1]![0]!);
    expect(embaixo.focus).toBe(1);
    expect(groupShares(embaixo)).toEqual([1 - FOCUS_SPLIT, FOCUS_SPLIT]);
  });

  it('o grupo em uso fica com mais da metade: é o que faz a lista aparecer', () => {
    expect(FOCUS_SPLIT).toBeGreaterThan(0.5);
    // E não com tudo: a coluna existe para ter dois painéis à vista.
    expect(FOCUS_SPLIT).toBeLessThan(0.85);
  });

  it('recolhido: `null` de fatia, e o outro leva a altura inteira', () => {
    const estado = toggleCollapsed(defaultColumnState(), 1);
    expect(isCollapsed(estado, 1)).toBe(true);
    expect(groupShares(estado)).toEqual([1, null]);
  });

  it('recolher o grupo em que se estava trabalhando passa a vez para o outro', () => {
    const embaixo = selectTab(defaultColumnState(), defaultColumnState().groups[1]![0]!);
    expect(embaixo.focus).toBe(1);
    const recolhido = toggleCollapsed(embaixo, 1);
    expect(recolhido.focus).toBe(0);
  });

  it('o último grupo aberto NÃO se recolhe: a coluna não vira duas tiras', () => {
    const um = toggleCollapsed(defaultColumnState(), 1);
    const dois = toggleCollapsed(um, 0);
    expect(dois).toBe(um);
    expect(isCollapsed(dois, 0)).toBe(false);
  });

  it('clicar no nome de um grupo recolhido o abre: botão que mente não serve', () => {
    const recolhido = toggleCollapsed(defaultColumnState(), 1);
    const volta = selectTab(recolhido, recolhido.groups[1]![0]!);
    expect(isCollapsed(volta, 1)).toBe(false);
    expect(volta.focus).toBe(1);
  });

  it('arrastar a alça desliga o automático: a mão vence a conta', () => {
    const naMao = setSplit(defaultColumnState(), 0.3);
    expect(naMao.autoSplit).toBe(false);
    expect(groupShares(naMao)).toEqual([0.3, 0.7]);
    // E mudar de aba não desfaz o que ela escolheu.
    const depois = selectTab(naMao, naMao.groups[1]![0]!);
    expect(groupShares(depois)).toEqual([0.3, 0.7]);
  });

  it('os dois cliques na alça devolvem o automático', () => {
    const volta = restoreAutoSplit(setSplit(defaultColumnState(), 0.3));
    expect(volta.autoSplit).toBe(true);
    expect(groupShares(volta)).toEqual([FOCUS_SPLIT, 1 - FOCUS_SPLIT]);
  });

  it('o que foi guardado volta inteiro: recolhido, automático e foco', () => {
    const guardado = toggleCollapsed(
      setSplit(selectTab(defaultColumnState(), 'animacoes'), 0.4), 0,
    );
    const lido = parseColumnState(JSON.parse(JSON.stringify(guardado)), KNOWN2);
    expect(lido.collapsed).toEqual(guardado.collapsed);
    expect(lido.autoSplit).toBe(false);
    expect(lido.focus).toBe(guardado.focus);
  });

  it('um arquivo de antes deste lote nasce com o automático ligado', () => {
    const antigo = { groups: [['arvore'], ['animacoes']], active: ['arvore', 'animacoes'], split: 0.58 };
    const lido = parseColumnState(antigo, KNOWN2);
    expect(lido.autoSplit).toBe(true);
    expect(lido.collapsed.every((um) => um === false)).toBe(true);
  });

  it('um arquivo torto com TUDO recolhido se desfaz: a coluna nunca fica sem painel', () => {
    const torto = {
      groups: [['arvore'], ['animacoes']], active: ['arvore', 'animacoes'],
      collapsed: [true, true],
    };
    const lido = parseColumnState(torto, KNOWN2);
    expect(lido.collapsed[0]).toBe(false);
    expect(groupShares(lido).some((fatia) => fatia !== null)).toBe(true);
  });

  it('o botão de recolher existe na tela, e o nome do painel vai na dica', () => {
    // Regra da casa: botão nasce em ícone, com o nome na dica.
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain("class: 'panel-group-fold'");
    expect(shell).toContain('botao.title = dobrado ?');
    expect(shell).toContain("botao.setAttribute('aria-label', botao.title);");
    const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
    expect(css).toContain('.panel-group-fold {');
    expect(css).toContain('.panel-group.is-recolhido {');
  });
});


// ---------------------------------------------------------------------------
// Organizar a coluna do jeito dela — 13/09/2026
// ---------------------------------------------------------------------------

describe('a aba cai onde o dedo soltou', () => {
/**
 * O Humberto: *"quero formas de organizar o menu do meu jeito; todo programa
 * faz isso"*.
 *
 * Os três programas, olhados antes de desenhar o gesto: o **Spriter** tem
 * painéis fixos e não deixa reorganizar; o **DragonBones** também não; só o
 * **Spine** deixa, arrastando a aba de cada *view*. O Recorte já tinha tomado
 * esse caminho no lote 19 — mas pela metade: a aba mudava de grupo e caía
 * sempre no FIM, então reordenar dentro do grupo era impossível.
 *
 * Não havia gesto novo a inventar, e a régua do Spriter (o gesto mais curto,
 * sem modo novo, sem janela a mais) mandava completar o que já estava lá.
 *
 * `dropIndex` é puro: recebe os retângulos das abas e o ponto onde soltou.
 */
  // Uma tira de três abas de 100 px, numa linha só.
  const umaLinha = [
    { left: 0, right: 100, top: 0, bottom: 30 },
    { left: 100, right: 200, top: 0, bottom: 30 },
    { left: 200, right: 300, top: 0, bottom: 30 },
  ];

  it('antes da primeira, entre duas, e depois da última', () => {
    expect(dropIndex(umaLinha, 10, 15)).toBe(0);
    // Passou do meio da primeira: entra depois dela.
    expect(dropIndex(umaLinha, 60, 15)).toBe(1);
    expect(dropIndex(umaLinha, 160, 15)).toBe(2);
    expect(dropIndex(umaLinha, 290, 15)).toBe(3);
  });

  it('o meio de cada aba é a fronteira, e não a borda', () => {
    // Em cima do meio exato da segunda, ainda é "depois dela".
    expect(dropIndex(umaLinha, 149, 15)).toBe(1);
    expect(dropIndex(umaLinha, 151, 15)).toBe(2);
  });

  it('tira vazia: o único lugar que existe é o zero', () => {
    expect(dropIndex([], 50, 15)).toBe(0);
  });

  it('com a tira quebrada em duas linhas, o `y` escolhe a linha', () => {
    const duasLinhas = [
      { left: 0, right: 100, top: 0, bottom: 30 },
      { left: 100, right: 200, top: 0, bottom: 30 },
      { left: 0, right: 100, top: 30, bottom: 60 },
      { left: 100, right: 200, top: 30, bottom: 60 },
    ];
    // Na linha de cima, antes da primeira.
    expect(dropIndex(duasLinhas, 10, 10)).toBe(0);
    // Na linha de baixo, antes da terceira — e NÃO no fim da de cima.
    expect(dropIndex(duasLinhas, 10, 45)).toBe(2);
    // Na linha de baixo, depois da última.
    expect(dropIndex(duasLinhas, 190, 45)).toBe(4);
  });

  it('soltar no vão entre linhas cai na linha mais perto, sem estourar', () => {
    const comVao = [
      { left: 0, right: 100, top: 0, bottom: 30 },
      { left: 0, right: 100, top: 40, bottom: 70 },
    ];
    expect(dropIndex(comVao, 10, 33)).toBe(0);
    expect(dropIndex(comVao, 10, 37)).toBe(1);
  });

  it('arrastar para a direita no MESMO grupo desconta a aba que saiu', () => {
    // Sem o desconto, largar a aba "logo à direita" a devolve ao lugar de
    // onde ela saiu, e o arrasto parece não ter funcionado.
    const grupo = ['a', 'b', 'c'];
    expect(insertionIndex(grupo, 'a', 2)).toBe(1);
    // Para a esquerda não desconta nada.
    expect(insertionIndex(grupo, 'c', 1)).toBe(1);
    // Aba que não está no grupo (veio do outro) também não desconta.
    expect(insertionIndex(grupo, 'z', 2)).toBe(2);
  });

  it('a conta inteira: arrastar a primeira aba para o fim do grupo', () => {
    const estado = defaultColumnState();
    const grupo0 = estado.groups[0]!;
    const primeira = grupo0[0]!;
    const visual = grupo0.length;
    const depois = moveTab(estado, primeira, 0, insertionIndex(grupo0, primeira, visual));
    expect(depois.groups[0]!.at(-1)).toBe(primeira);
    expect(depois.groups[0]!.length).toBe(grupo0.length);
  });

  it('e a ordem escolhida sobrevive ao que foi guardado', () => {
    const estado = defaultColumnState();
    const grupo0 = estado.groups[0]!;
    const trocado = moveTab(estado, grupo0[0]!, 0, insertionIndex(grupo0, grupo0[0]!, grupo0.length));
    const lido = parseColumnState(JSON.parse(JSON.stringify(trocado)), grupo0.concat(estado.groups[1]!));
    expect(lido.groups[0]).toEqual(trocado.groups[0]);
  });
});


// ---------------------------------------------------------------------------
// Fechar um painel, e a porta de volta — 13/09/2026
// ---------------------------------------------------------------------------

describe('fechar um painel, e achá-lo de novo no menu Janela', () => {
/**
 * O Humberto, testando a v12.3: *"não dá pra fechar um menu e depois abrir ele
 * em 'janelas'. O menu janelas não funciona."*
 *
 * Ele estava certo, e o defeito era maior que um item quebrado. Medido no
 * navegador, com o editor aberto:
 *
 * 1. **Fechar um painel não existia.** Zero botões de fechar na tela, e o menu
 *    Janela só ABRIA — embora cada item tivesse marca de seleção, que é o
 *    desenho universal de um interruptor.
 * 2. **A marca mentia.** Ela queria dizer "está à frente do grupo", e não
 *    "está na tela": com ONZE abas na coluna, o menu marcava CINCO.
 *
 * A regra antiga, "o item só abre", não foi descuido: foi cuidado, escrito
 * quando fechar um painel era o mesmo que perdê-lo sem caminho de volta. O
 * cuidado continua certo — o que mudou é que agora existe a lista onde o
 * painel fechado fica escrito, e é ela que torna o fechar seguro.
 */
  const KNOWN3 = ['arvore', 'propriedades', 'animacoes', 'exibicao', 'malha'];
  const primeiro = (estado = defaultColumnState()): string => estado.groups[0]![0]!;

  it('de fábrica nada está fechado, e todos contam como abertos', () => {
    const estado = defaultColumnState();
    expect(estado.closed).toEqual([]);
    expect(openPanels(estado)).toEqual(estado.groups.flat());
  });

  it('fechar tira da tira de abas e põe na lista, com o lugar guardado', () => {
    const estado = defaultColumnState();
    const alvo = estado.groups[0]![1] ?? primeiro(estado);
    const depois = closePanel(estado, alvo);
    expect(depois.groups[0]).not.toContain(alvo);
    expect(isPanelClosed(depois, alvo)).toBe(true);
    expect(depois.closed[0]).toEqual({ id: alvo, group: 0, at: estado.groups[0]!.indexOf(alvo) });
  });

  it('reabrir devolve a aba EXATAMENTE de onde ela saiu', () => {
    // Porta de volta que leva a outro cômodo não é porta de volta: quem fecha
    // a aba do meio espera encontrá-la no meio quando voltar.
    const estado = defaultColumnState();
    const grupo = estado.groups[1]!;
    const alvo = grupo[1] ?? grupo[0]!;
    const volta = reopenPanel(closePanel(estado, alvo), alvo);
    expect(volta.groups[1]).toEqual(grupo);
    expect(volta.closed).toEqual([]);
  });

  it('reabrir traz à frente e DESDOBRA o grupo recolhido', () => {
    // Senão o item do menu responde e nada aparece — a queixa de origem com
    // outra roupa.
    const estado = defaultColumnState();
    const alvo = estado.groups[1]![0]!;
    const recolhido = toggleCollapsed(closePanel(estado, alvo), 1);
    const volta = reopenPanel(recolhido, alvo);
    expect(isCollapsed(volta, 1)).toBe(false);
    expect(volta.active[1]).toBe(alvo);
    expect(volta.focus).toBe(1);
  });

  it('o ÚLTIMO painel aberto não se fecha', () => {
    let estado = defaultColumnState();
    const todos = openPanels(estado);
    for (const id of todos.slice(0, -1)) estado = closePanel(estado, id);
    expect(openPanels(estado).length).toBe(1);
    const tentativa = closePanel(estado, openPanels(estado)[0]!);
    expect(tentativa).toBe(estado);
  });

  it('fechar um grupo leva as abas dele juntas, e elas voltam uma a uma', () => {
    const estado = defaultColumnState();
    const grupo0 = [...estado.groups[0]!];
    const depois = closeGroup(estado, 0);
    expect(depois.groups[0]).toEqual([]);
    for (const id of grupo0) expect(isPanelClosed(depois, id)).toBe(true);
    const uma = reopenPanel(depois, grupo0[0]!);
    expect(uma.groups[0]).toEqual([grupo0[0]]);
    expect(isPanelClosed(uma, grupo0[1] ?? 'nada')).toBe(grupo0.length > 1);
  });

  it('fechar um grupo que levaria o último painel é recusado INTEIRO', () => {
    // Recusar pela metade deixaria metade do grupo fechada, sem que ninguém
    // tivesse pedido isso.
    const estado = closeGroup(defaultColumnState(), 1);
    const tentativa = closeGroup(estado, 0);
    expect(tentativa).toBe(estado);
    expect(openPanels(tentativa).length).toBeGreaterThan(0);
  });

  it('grupo VAZIO não leva altura nenhuma, e o outro fica com tudo', () => {
    const estado = closeGroup(defaultColumnState(), 0);
    expect(groupShares(estado)).toEqual([null, 1]);
  });

  it('o que foi fechado sobrevive ao que é guardado, e não reabre sozinho', () => {
    // A regra 2 do `parseColumnState` recoloca todo painel conhecido que ficou
    // de fora dos grupos. Sem ler `closed` ANTES dela, todo painel fechado
    // reabriria na abertura seguinte — foi exatamente o que aconteceu na
    // primeira tentativa, e na tela pareceu que fechar MOVIA o painel.
    const fechado = closePanel(defaultColumnState(), 'exibicao');
    const lido = parseColumnState(JSON.parse(JSON.stringify(fechado)), KNOWN3);
    expect(isPanelClosed(lido, 'exibicao')).toBe(true);
    expect(lido.groups.flat()).not.toContain('exibicao');
  });

  it('um arquivo torto com TUDO fechado devolve um painel: a coluna nunca fica muda', () => {
    const torto = {
      groups: [[], []], active: [null, null],
      closed: KNOWN3.map((id, at) => ({ id, group: 0, at })),
    };
    const lido = parseColumnState(torto, KNOWN3);
    expect(lido.groups.flat().length).toBe(1);
    expect(openPanels(lido).length).toBe(1);
  });

  it('um arquivo de antes deste lote não traz nada fechado', () => {
    const antigo = { groups: [['arvore'], ['animacoes']], active: ['arvore', 'animacoes'] };
    expect(parseColumnState(antigo, KNOWN3).closed).toEqual([]);
  });

  it('a tela tem o × na aba, e fechar o grupo tem gesto E porta visível', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain("title: `Fechar: ${panel.title}`");
    // Fechar o GRUPO não é botão na tira desde 13/09: ele custava 27 px de
    // largura ali, a tira quebrava em duas linhas e o painel perdia 33 px de
    // altura. O gesto é o botão direito no vão da tira.
    expect(shell).not.toContain("class: 'panel-group-close'");
    expect(shell).toContain("tabs.addEventListener('contextmenu'");
    // E botão direito é gesto escondido: a barra de baixo o ensina uma vez por
    // sessão, e o menu Janela é a porta visível de quem não o descobrir.
    // Rodada 6: "Fechar o grupo" mora em Janela → Arrumar ▸.
    expect(shell).toContain('botão direito na tira, ou Janela → Arrumar → Fechar o grupo');
    expect(shell).toContain('closeFocusedGroup');
    const menus = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');
    expect(menus).toContain("action: 'fechar-grupo'");
    // A porta de volta é dita na barra de baixo, na hora.
    expect(shell).toContain('traz de volta');
    const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
    // O × aparece SÓ na aba em uso, e o lugar dele não é reservado nas outras.
    //
    // A primeira versão reservava o lugar em todas, para nenhuma aba pular. Na
    // tela isso custou caro e foi medido: 20 px por aba, 60 numa tira de três,
    // e a tira passou a QUEBRAR EM DUAS LINHAS — 33 px a menos para o painel,
    // em todo grupo com três abas ou mais. A Prévia, que tinha acabado de
    // passar na medição de altura, voltou a falhar por causa disso.
    //
    // Então o pulo ficou, pequeno e previsível: uma aba a mais de 20 px, só ao
    // TROCAR de aba. Nunca no hover, que seria o pulo constante.
    expect(css).toMatch(/\.panel-tab-x\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/\.panel-tab\[aria-selected="true"\] \.panel-tab-x\s*\{[^}]*display:\s*inline-block/);
    expect(css).not.toMatch(/\.panel-tab:hover \.panel-tab-x/);
    // E o desenho vem do CSS: um × no HTML entraria no `textContent` da aba.
    expect(css).toContain(".panel-tab-x::after {");
  });

  it('o menu Janela guarda os seis campos da coluna, e não três', () => {
    // `buildColumn` relê tudo do que foi guardado: campo que não é gravado
    // some na primeira vez que os painéis são reconstruídos. Era assim que
    // fechar um painel o MOVIA para o outro grupo.
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    for (const campo of ['groups:', 'active:', 'split:', 'collapsed:', 'autoSplit:', 'focus:', 'closed:']) {
      expect(shell).toContain(campo);
    }
  });
});


// ---------------------------------------------------------------------------
// Descolar o painel da lateral — 13/09/2026
// ---------------------------------------------------------------------------

describe('descolar o painel, e colá-lo de volta', () => {
/**
 * O Humberto testou a v12.4, arrastou a aba "Ordem" para cima da cena e nada
 * aconteceu: *"tentei mover menu pra lá, não foi"*. E antes: *"descolar os
 * menus da barra lateral; ok não fazer pop up, mas seria bom poder descolar
 * como no Photoshop"*.
 *
 * A distinção é dele: **flutuar dentro da janela do editor**, sim; janela do
 * sistema, não.
 *
 * Os programas: **Photoshop** e **Spine** descolam, arrastando a aba para
 * fora, e colam de volta arrastando a barra de título até a borda; **Spriter**
 * e **DragonBones** têm painéis fixos. O gesto é o mesmo nos dois que fazem, e
 * é o arrasto que já existia aqui — ele só passou a valer também fora da tira.
 *
 * As duas armadilhas do lote, e as duas moram em `clampFloat`: um flutuante
 * não pode cobrir a cena inteira, e não pode ficar preso fora da tela.
 */
  const KNOWN4 = ['arvore', 'propriedades', 'animacoes', 'exibicao', 'malha'];
  const caixa = { x: 100, y: 60, w: 280, h: 320 };

  it('de fábrica ninguém flutua', () => {
    expect(defaultColumnState().floating).toEqual([]);
  });

  it('descolar tira da coluna e põe a flutuar, guardando de onde saiu', () => {
    const estado = defaultColumnState();
    const alvo = estado.groups[0]![1] ?? estado.groups[0]![0]!;
    const depois = floatPanel(estado, alvo, caixa);
    expect(dockedPanels(depois)).not.toContain(alvo);
    expect(isPanelFloating(depois, alvo)).toBe(true);
    expect(floatBoxOf(depois, alvo)).toEqual(caixa);
    // Continua ABERTO: ele está na tela, só não está encostado.
    expect(openPanels(depois)).toContain(alvo);
  });

  it('colar de volta devolve ao lugar de onde saiu', () => {
    const estado = defaultColumnState();
    const grupo = [...estado.groups[0]!];
    const alvo = grupo[1] ?? grupo[0]!;
    const volta = dockPanel(floatPanel(estado, alvo, caixa), alvo);
    expect(volta.groups[0]).toEqual(grupo);
    expect(volta.floating).toEqual([]);
  });

  it('colar num grupo escolhido põe onde o dedo soltou', () => {
    const estado = defaultColumnState();
    const alvo = estado.groups[0]![0]!;
    const volta = dockPanel(floatPanel(estado, alvo, caixa), alvo, 1, 0);
    expect(volta.groups[1]![0]).toBe(alvo);
    expect(volta.active[1]).toBe(alvo);
    expect(isCollapsed(volta, 1)).toBe(false);
  });

  it('"Voltar ao padrão" resgata TODOS os flutuantes, cada um ao seu lugar', () => {
    // É a rede da armadilha: um painel que ficou onde não se pega mais volta
    // por aqui, sem a pessoa precisar acertá-lo com o ponteiro.
    const estado = defaultColumnState();
    const grupos = estado.groups.map((g) => [...g]);
    let solto = estado;
    for (const id of [grupos[0]![0]!, grupos[1]![0]!]) solto = floatPanel(solto, id, caixa);
    expect(solto.floating.length).toBe(2);
    const volta = dockAllFloating(solto);
    expect(volta.floating).toEqual([]);
    expect(volta.groups).toEqual(grupos);
  });

  it('o flutuante não cobre a cena inteira', () => {
    const dentro = clampFloat({ x: 0, y: 0, w: 5000, h: 5000 }, 1000, 800);
    expect(dentro.w).toBe(Math.floor(1000 * FLOAT_MAX_FRACTION));
    expect(dentro.h).toBe(Math.floor(800 * FLOAT_MAX_FRACTION));
  });

  it('o flutuante não fica preso fora da tela: sobra sempre onde pegar', () => {
    const longe = clampFloat({ x: 9000, y: 9000, w: 280, h: 320 }, 1000, 800);
    // Sobra ao menos a faixa de segurança dentro da área, dos dois lados.
    expect(longe.x).toBeLessThanOrEqual(1000 - FLOAT_KEEP);
    expect(longe.y).toBeLessThanOrEqual(800 - FLOAT_KEEP);
    const atras = clampFloat({ x: -9000, y: -9000, w: 280, h: 320 }, 1000, 800);
    expect(atras.x + 280).toBeGreaterThanOrEqual(FLOAT_KEEP);
    expect(atras.y).toBe(0);
  });

  it('o flutuante nunca fica menor que um painel', () => {
    const mini = clampFloat({ x: 0, y: 0, w: 10, h: 10 }, 1000, 800);
    expect(mini.w).toBe(FLOAT_MIN_W);
    expect(mini.h).toBe(FLOAT_MIN_H);
  });

  it('numa área minúscula ele ainda cabe, sem conta negativa', () => {
    const apertado = clampFloat({ x: 0, y: 0, w: 280, h: 320 }, 100, 80);
    expect(apertado.w).toBeGreaterThanOrEqual(FLOAT_MIN_W);
    expect(apertado.h).toBeGreaterThanOrEqual(FLOAT_MIN_H);
    expect(Number.isFinite(apertado.x)).toBe(true);
    expect(Number.isFinite(apertado.y)).toBe(true);
  });

  it('mover e redimensionar passam pelo limite', () => {
    const estado = defaultColumnState();
    const alvo = estado.groups[0]![0]!;
    const solto = floatPanel(estado, alvo, caixa);
    const movido = setFloatBox(solto, alvo, { x: 9000, y: 9000, w: 280, h: 320 }, 1000, 800);
    const box = floatBoxOf(movido, alvo)!;
    expect(box.x).toBeLessThanOrEqual(1000 - FLOAT_KEEP);
    expect(box.y).toBeLessThanOrEqual(800 - FLOAT_KEEP);
  });

  it('A VOLTA: o que foi descolado sobrevive ao que é guardado', () => {
    // Esta é a lição da v12.2, e é por isso que este teste existe: lá os
    // campos novos não eram gravados, e o que se entregou como "fica
    // guardado" se perdia ao reabrir o arquivo. Ninguém conferiu a volta.
    const estado = defaultColumnState();
    const alvo = estado.groups[0]![0]!;
    const solto = floatPanel(estado, alvo, { x: 120, y: 90, w: 350, h: 360 });
    const lido = parseColumnState(JSON.parse(JSON.stringify(solto)), KNOWN4);
    expect(isPanelFloating(lido, alvo)).toBe(true);
    expect(floatBoxOf(lido, alvo)).toEqual({ x: 120, y: 90, w: 350, h: 360 });
    expect(dockedPanels(lido)).not.toContain(alvo);
    // E colar de volta depois da ida e volta leva ao mesmo lugar de origem.
    expect(dockPanel(lido, alvo).groups[0]).toEqual(estado.groups[0]);
  });

  it('e a casca GRAVA o campo, que é onde a v12.2 falhou', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain('floating: column.floating.map');
  });

  it('um arquivo de antes deste lote não traz ninguém flutuando', () => {
    const antigo = { groups: [['arvore'], ['animacoes']], active: ['arvore', 'animacoes'] };
    expect(parseColumnState(antigo, KNOWN4).floating).toEqual([]);
  });

  it('a camada dos flutuantes não rouba o clique da cena', () => {
    // A pior troca possível seria descolar um painel e o desenho parar de
    // responder. A camada cobre o meio da casca inteiro; só as caixas pegam.
    const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
    expect(css).toMatch(/\.panel-float-layer\s*\{[^}]*pointer-events:\s*none/);
    expect(css).toMatch(/\.panel-float\s*\{[^}]*pointer-events:\s*auto/);
  });

  it('a caixa tem barra com nome, × que fecha e canto que muda o tamanho', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain("class: 'panel-float-bar'");
    expect(shell).toContain("class: 'panel-float-x'");
    expect(shell).toContain("class: 'panel-float-canto'");
    // E soltar a aba fora da tira é o gesto que descola — desde a rodada 4,
    // lote 1, pelo arrasto de ponteiro (`ui/panel-drag.ts`), não pelo do
    // navegador. Reescrito de propósito: o `soltouNaTira` e o `floatPanelAt`
    // eram as duas metades do arrasto antigo, e saíram com ele.
    expect(shell).toContain('this.beginPanelDrag(');
    expect(shell).toContain('this.soltarPainel(');
    expect(shell).not.toContain("tab.addEventListener('dragstart'");
  });
});


// ---------------------------------------------------------------------------
// A bancada é da máquina; o personagem é do arquivo — 13/09/2026
// ---------------------------------------------------------------------------

describe('o .bone não carrega a arrumação da tela de ninguém', () => {
/**
 * Nove campos de arranjo iam para dentro do `.bone`: os grupos, a aba à
 * frente, o recolhido, o fechado, o flutuante, as larguras, as colunas
 * escondidas e a faixa de baixo.
 *
 * **Duas coisas erradas saíam disso.** Abrir o `.bone` de outra pessoa
 * reorganizava a tela de quem abriu — e, a que decide, **o arranjo viajava
 * dentro do `.bone` que ele PUBLICA**. Um personagem entregue não pode
 * carregar quais painéis estavam fechados na máquina de quem salvou.
 *
 * COMO NASCEU: o lote 52 acertou o raciocínio para UM campo, a divisão de
 * altura, com o motivo escrito ao lado. Os outros oito vieram por cima, cada
 * um seguindo o vizinho — dois deles em 13/09, por quem escreve isto.
 * **Ninguém decidiu o errado; o errado cresceu por imitação.** A pergunta que
 * faltou não era "isto está certo?", era "por que o vizinho faz assim?".
 *
 * Estes testes são a rede da regressão: se um dia alguém "arrumar" isto de
 * volta, é aqui que aparece.
 */
  const ARRANJO = ['panels', 'dock'];

  it('a casca grava a bancada na MÁQUINA, e não no arquivo', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain("export const BENCH_STORAGE_KEY = 'RECORTE_bancada'");
    expect(shell).toContain('this.writeBench(COLUMN_STATE_KEY');
    expect(shell).toContain('this.writeBench(DOCK_STATE_KEY');
  });

  it('`saveColumnState` não escreve mais no documento', () => {
    // O corpo inteiro da função, do cabeçalho até a chave que a fecha.
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    const de = shell.indexOf('private saveColumnState()');
    expect(de).toBeGreaterThan(-1);
    const corpo = shell.slice(de, shell.indexOf('\n  }', de));
    expect(corpo).not.toContain('writeEditorState');
  });

  it('o legado é LIDO uma última vez, e nunca mais gravado', () => {
    // Ninguém perde a tela que já tem, e o campo morre sozinho na primeira
    // vez que a pessoa mexer em qualquer coisa.
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    const de = shell.indexOf('private readBench(');
    const corpo = shell.slice(de, shell.indexOf('\n  }', de));
    expect(corpo).toContain('readEditorState(this.doc.file)');
    expect(corpo).toContain('BENCH_STORAGE_KEY');
  });

  it('o bloco de arranjo de um arquivo alheio NÃO é apagado', () => {
    // Apagar o que é de alguém sem ele pedir é mexer no arquivo de alguém.
    // Ler e ignorar basta.
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    for (const chave of ARRANJO) {
      expect(shell).not.toContain(`delete state['${chave}']`);
      expect(shell).not.toContain(`delete state.${chave}`);
    }
  });

  it('o que fica no arquivo é do PERSONAGEM, e nada de arranjo', () => {
    // O contrato é a lista curta: câmera, seleção, animação, peles, exibição.
    const contrato = readFileSync(resolve(__dirname, '../src/contract.ts'), 'utf8');
    const de = contrato.indexOf('export interface EditorState');
    const corpo = contrato.slice(de, contrato.indexOf('\n}', de));
    for (const campo of ['camera', 'selection', 'animation', 'skins', 'view']) {
      expect(corpo).toContain(campo);
    }
    for (const campo of ARRANJO) {
      expect(corpo).not.toContain(`${campo}?:`);
    }
  });
});

// ---------------------------------------------------------------------------
// Colar na quina — degrau 11, lote 3 (18/09/2026), C1
// ---------------------------------------------------------------------------

describe('colar na quina: o flutuante encosta nas bordas e quinas da cena', () => {
  /** A cena, dentro da camada dos flutuantes: começa em 260, tem 900 × 600. */
  const CENA = { x: 260, y: 0, w: 900, h: 600 };
  const caixa = (x: number, y: number) => ({ x, y, w: 280, h: 320 });

  it('as quatro quinas: perto das duas bordas, cola nas duas', () => {
    expect(snapOf(caixa(270, 10), CENA)).toBe('nw');
    expect(snapOf(caixa(260 + 900 - 280 - 10, 5), CENA)).toBe('ne');
    expect(snapOf(caixa(275, 600 - 320 - 12), CENA)).toBe('sw');
    expect(snapOf(caixa(260 + 900 - 280 + 8, 600 - 320 + 20), CENA)).toBe('se');
  });

  it('as quatro bordas: perto de uma só, cola só nela e o outro eixo fica', () => {
    expect(snapOf(caixa(500, 8), CENA)).toBe('n');
    expect(snapOf(caixa(500, 600 - 320 - 8), CENA)).toBe('s');
    expect(snapOf(caixa(268, 150), CENA)).toBe('w');
    expect(snapOf(caixa(260 + 900 - 280 - 8, 150), CENA)).toBe('e');
    const colado = snapFloat(caixa(500, 8), CENA);
    expect(colado.box).toEqual({ x: 500, y: 0, w: 280, h: 320 });
  });

  it('fora de toda zona nada cola: a caixa volta igual', () => {
    const solta = caixa(500, 150);
    expect(snapFloat(solta, CENA)).toEqual({ box: solta, snap: null });
    // A zona é de 24 px: com 25 já não cola.
    expect(SNAP_ZONE).toBe(24);
    expect(snapOf(caixa(260 + 25, 150), CENA)).toBeNull();
    expect(snapOf(caixa(260 + 24, 150), CENA)).toBe('w');
  });

  it('colar encosta na borda DA CENA, e não na da janela; o tamanho não muda', () => {
    expect(snappedBox(caixa(275, 12), 'nw', CENA)).toEqual({ x: 260, y: 0, w: 280, h: 320 });
    expect(snappedBox(caixa(0, 0), 'se', CENA)).toEqual({ x: 260 + 900 - 280, y: 600 - 320, w: 280, h: 320 });
  });

  it('a régua é a borda do painel, e não o ponteiro: a quina de baixo se alcança', () => {
    // A barra de título fica em cima; o ponteiro nunca chega à borda de baixo.
    const baixo = caixa(500, 600 - 320 - 3);
    expect(snapOf(baixo, CENA)).toBe('s');
  });

  it('a quina fica guardada no flutuante, sobrevive a gravar e ler, e quina estranha não vira palpite', () => {
    const known = ['arvore', 'ordem', 'propriedades'];
    let state = parseColumnState({ groups: [['arvore', 'ordem'], ['propriedades']] }, known);
    state = floatPanel(state, 'ordem', { x: 260, y: 0, w: 280, h: 320 });
    expect(floatSnapOf(state, 'ordem')).toBeNull();
    state = setFloatSnap(state, 'ordem', 'nw');
    expect(floatSnapOf(state, 'ordem')).toBe('nw');
    const relido = parseColumnState(JSON.parse(JSON.stringify(state)), known);
    expect(floatSnapOf(relido, 'ordem')).toBe('nw');
    // Regra 21: valor que o programa não conhece não é adivinhado.
    const torto = JSON.parse(JSON.stringify(state)) as { floating: Array<{ snap?: string }> };
    torto.floating[0]!.snap = 'meio';
    expect(floatSnapOf(parseColumnState(torto, known), 'ordem')).toBeNull();
    // Arrastar para longe solta a quina.
    expect(floatSnapOf(setFloatSnap(state, 'ordem', null), 'ordem')).toBeNull();
  });

  it('colado na quina, ele segue a cena quando ela muda de tamanho', () => {
    const antes = snappedBox(caixa(0, 0), 'se', CENA);
    const menor = { x: 260, y: 0, w: 700, h: 500 };
    const depois = snappedBox(antes, 'se', menor);
    expect(depois.x + depois.w).toBe(menor.x + menor.w);
    expect(depois.y + depois.h).toBe(menor.y + menor.h);
  });

  it('toda quina tem nome para a frase do rodapé', () => {
    for (const snap of ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'] as const) {
      expect(SNAP_WORDS[snap].length, snap).toBeGreaterThan(8);
      expect(isFloatSnap(snap)).toBe(true);
    }
    expect(isFloatSnap('centro')).toBe(false);
  });

  it('a casca desenha a sombra antes de soltar, e cola ao soltar', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('panel-float-sombra');
    // Rodada 4, lote 1: a sombra e a quina saem do `dropTarget` do arrasto de
    // ponteiro (que chama o `snapFloat`); a aba é puxada por `pointerdown`.
    // Reescrito de propósito: o `drag` do navegador saiu.
    expect(casca).toContain('dropTarget(a.state, this.stripInfos(), this.dropArea())');
    expect(casca).toContain("tab.addEventListener('pointerdown'");
    expect(casca).toContain('followSnaps');
  });
});


// ---------------------------------------------------------------------------
// A tela que não pula — rodada final, chat P, lote 2 (29/09/2026)
// ---------------------------------------------------------------------------

/** O bloco de regras de um seletor em `shell.css`, do `{` ao `}`. */
function regraDoCss(css: string, seletor: string): string {
  const inicio = css.indexOf(`\n${seletor} {`);
  expect(inicio, seletor).toBeGreaterThanOrEqual(0);
  return css.slice(inicio, css.indexOf('}', inicio));
}

describe('a tela que não pula (chat P, lote 2)', () => {
  const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');

  it('J4, F5: a grade não cresce com a frase do rodapé', () => {
    // `1fr` tem mínimo "auto": a frase do Criar osso, em `nowrap`, alargava a
    // grade para 1.551 px numa janela de 1.440 (medido, foto antes-criar-osso).
    const shell = regraDoCss(css, '.shell');
    expect(shell).toContain('grid-template-columns: minmax(0, 1fr);');
    expect(shell).toContain('grid-template-rows: var(--bar) minmax(0, 1fr) auto;');
    for (const seletor of ['.status-state', '.status-tool', '.status-mode']) {
      expect(regraDoCss(css, seletor), seletor).toContain('min-width: 0;');
    }
  });

  it('L14: o rodapé é uma linha, de altura fixa, e corta com reticências', () => {
    const rodape = regraDoCss(css, '.status-bar');
    expect(rodape).toContain('height: 54px;');
    expect(rodape).toContain('flex-wrap: nowrap;');
    expect(rodape).toContain('overflow: hidden;');
    for (const seletor of ['.status-state', '.status-tool']) {
      const regra = regraDoCss(css, seletor);
      expect(regra, seletor).toContain('white-space: nowrap;');
      expect(regra, seletor).toContain('text-overflow: ellipsis;');
    }
    // O botão dos avisos é porta: nunca encolhe.
    expect(regraDoCss(css, '.status-warn')).toContain('flex: 0 0 auto;');
  });

  it('K13: a cena tem chão, e quem cede é a faixa de baixo', () => {
    expect(regraDoCss(css, '.shell-middle')).toContain('min-height: 55%;');
    expect(regraDoCss(css, '.dock')).toContain('flex: 0 1 auto;');
    // A faixa encolhida rola por dentro, e não esconde calada.
    expect(regraDoCss(css, '.dock-panel')).toContain('overflow-y: auto;');
  });

  it('F4: a Caixa e o Ponto dizem o gesto ao serem pegos, como o Criar osso', () => {
    for (const id of ['box', 'point']) {
      const frase = toolbarModel.toolFooter(id, false);
      expect(frase, id).not.toBeNull();
      expect(frase, id).toContain('Alt');
      expect(toolbarModel.toolFooter(id, true), `${id} com osso`).toBe(frase);
    }
    // Rodada 46, lote 2: o Mover também diz o gesto (antes calava; doc 66, §2.3).
    expect(toolbarModel.toolFooter('translate', false)).toContain('Shift trava um eixo');
  });
});


// ---------------------------------------------------------------------------
// O "Mais ▾" — rodada final, chat P, lote 3a (L16, I-O3), decisão P48
// ---------------------------------------------------------------------------

describe('o "Mais ▾": o que não cabe sai da barra, e a barra não rola', () => {
  const s = (id: string, width: number): BarSlot => ({ id, width });
  const barra = [
    s('novo', 30), s('recortar', 30), s('copiar', 30), s('transform', 110), s('eixos', 90),
    s('ver-ossos', 80), s('travar-desenhos', 120), s('particulas', 110),
  ];
  const keep = new Set([...NEVER_IN_MORE, 'transform']);
  const total = barra.reduce((soma, slot) => soma + slot.width, 0);

  it('cabendo, nada vai para o "Mais ▾"', () => {
    expect(fitBar(barra, total, 50, keep).more).toEqual([]);
  });

  it('saem primeiro os ícones com tecla; os quatro de texto do Humberto por último', () => {
    // Faltam 10 px, mais os 50 do próprio "Mais ▾": saem recortar e copiar
    // (60), e o "Ver ossos", pedido com a tela do Spriter aberta, fica.
    const fit = fitBar(barra, total - 10, 50, keep);
    expect(fit.more).toEqual(['recortar', 'copiar']);
    expect(fit.shown).toContain('ver-ossos');
    expect(fit.shown).toContain('travar-desenhos');
  });

  it('a ferramenta escolhida, os eixos e Partículas nunca saem', () => {
    const fit = fitBar(barra, 0, 50, keep);
    expect(fit.shown).toEqual(['transform', 'eixos', 'particulas']);
    for (const id of ['transform', 'eixos', 'particulas']) expect(fit.more).not.toContain(id);
  });

  it('o que fica, mais o próprio "Mais ▾", cabe, e a ordem é a da barra', () => {
    for (const room of [700, 600, 500, 450]) {
      const fit = fitBar(barra, room, 50, keep);
      const largura = fit.shown.reduce((soma, id) => soma + (barra.find((b) => b.id === id)?.width ?? 0), 0);
      expect(largura + (fit.more.length > 0 ? 50 : 0), `room ${room}`).toBeLessThanOrEqual(room);
      const ordem = barra.map((b) => b.id);
      expect(fit.more, `room ${room}`).toEqual([...fit.more].sort((a, b) => ordem.indexOf(a) - ordem.indexOf(b)));
    }
  });

  it('a barra da cena usa a conta, não rola de lado, e o menu chama o próprio botão', () => {
    const barraTs = readFileSync(resolve(__dirname, '../src/viewport/viewport-toolbar.ts'), 'utf8');
    expect(barraTs).toContain('fitBar(slots,');
    expect(barraTs).toContain('bar.appendChild(buildMoreGroup());');
    expect(barraTs).toContain('run: () => { item.click(); }');
    const cena = readFileSync(resolve(__dirname, '../src/viewport/viewport.css'), 'utf8');
    const regra = cena.slice(cena.indexOf('\n.viewport-toolbar {'), cena.indexOf('}', cena.indexOf('\n.viewport-toolbar {')));
    expect(regra).toContain('overflow-x: hidden;');
    expect(regra).not.toContain('overflow-x: auto;');
    expect(MORE_LABEL).toBe('Mais ▾');
    expect(MORE_HINT.length).toBeGreaterThan(20);
    expect(FIRST_INTO_MORE).not.toContain('ver-ossos');
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, L12 + PL-30 e PL-31 (decisões do Diretor, 05/10/2026)
// ---------------------------------------------------------------------------

describe('rodada 17: Malha e pesos junto de Imagens e Pivôs (só de fábrica), e a Prévia na barra', () => {
  it('de fábrica, a Malha e pesos mora no grupo de cima, depois dos Pivôs; Animações fica sozinha no de baixo', () => {
    expect(RIGHT_GROUPS[0]!.indexOf('malha')).toBe(RIGHT_GROUPS[0]!.indexOf('pivos') + 1);
    expect(RIGHT_GROUPS[1]).not.toContain('malha');
    expect(RIGHT_GROUPS[1]![0]).toBe('animacoes');
  });

  it('o arranjo que a pessoa guardou NÃO muda: a Malha continua onde ela deixou', () => {
    const CONHECIDOS = [...RIGHT_GROUPS.flat(), 'arvore', 'ordem', 'propriedades'];
    const guardado = JSON.parse(JSON.stringify(defaultLayout(CONHECIDOS)));
    // O arranjo de antes da rodada 17: a Malha no grupo de baixo, com Animações.
    const tirar = (lista: string[]) => lista.filter((id) => id !== 'malha');
    guardado.right.groups = [tirar(guardado.right.groups[0]), [...tirar(guardado.right.groups[1]), 'malha']];
    const lido = parseLayout(guardado, CONHECIDOS);
    expect(lido.right.groups[1]).toContain('malha');
    expect(lido.right.groups[0]).not.toContain('malha');
  });

  it('PL-31: o ícone Prévia na barra só ABRE a aba, e tem a mesma porta no menu Animação', () => {
    const item = VIEW_ITEMS.find((i) => i.id === 'previa');
    expect(item?.actionId).toBe('mostrar-painel-previa');
    expect(item?.style).toBe('icon');
    expect(item?.hint).toContain('Prévia');
    const menuFonte = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');
    expect(menuFonte).toContain("label: 'Abrir a Prévia', action: 'mostrar-painel-previa', enabled: true,");
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 1 (doc 68): a casca deixa o painel caber
// ---------------------------------------------------------------------------

describe('rodada 47, lote 1: a casca deixa o painel caber', () => {
  // As larguras MEDIDAS das abas do grupo de cima à direita, no programa
  // montado (v34.4, 07/10/2026): Imagens, Entidades, Pivôs, Malha e pesos,
  // Partículas, Exibição, Prévia. A tira tem 250 px úteis sem o ▾ (258 - 8).
  const IMAGENS_GRUPO = [86, 87, 56, 112, 88, 76, 66];
  const SALA = 250 - 22; // menos o ▾ do fim
  const MAIS = 26;
  const VAO = 2;

  it('C1: oito abas em 258 px cabem numa fileira; o que sobra mora no »', () => {
    const plano = planTabStrip(IMAGENS_GRUPO, SALA, MAIS, VAO, 0);
    // Numa fileira, as visíveis + o » cabem na sala.
    const usado = plano.visible.reduce((s, i) => s + IMAGENS_GRUPO[i]!, 0)
      + (plano.visible.length - 1) * VAO + VAO + MAIS;
    expect(usado).toBeLessThanOrEqual(SALA);
    expect(plano.hidden.length).toBeGreaterThan(0);
    expect([...plano.visible, ...plano.hidden].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('C1: a aba à frente fica sempre à vista, e a ordem do grupo não muda', () => {
    // A Prévia (a última) à frente: ela entra no lugar de quem cabia por último.
    const plano = planTabStrip(IMAGENS_GRUPO, SALA, MAIS, VAO, 6);
    expect(plano.visible).toContain(6);
    expect(plano.visible).toEqual([...plano.visible].sort((a, b) => a - b));
    expect(plano.hidden).not.toContain(6);
  });

  it('C1: quando tudo cabe não há », e nada muda para a coluna larga', () => {
    const plano = planTabStrip([60, 60], SALA, MAIS, VAO, 1);
    expect(plano).toEqual({ visible: [0, 1], hidden: [] });
  });

  it('C1: o » diz na dica quantas e quais abas moram nele', () => {
    expect(moreHint(['Exibição', 'Prévia'])).toBe('Mais 2 abas: Exibição, Prévia. Clique para escolher uma');
    expect(moreHint(['Prévia'])).toBe('Mais uma aba: Prévia. Clique para abrir');
    expect(moreHint([])).toBe('');
  });

  it('C1: a casca usa o plano, e a tira não quebra mais em fileiras', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
    expect(shell).toContain('planTabStrip(');
    expect(shell).toContain("'panel-tabs-mais'");
    const regra = css.slice(css.indexOf('.panel-tabs {'), css.indexOf('}', css.indexOf('.panel-tabs {')));
    expect(regra).toContain('flex-wrap: nowrap');
    // E o nome da aba não quebra em duas linhas dentro da fileira.
    const aba = css.slice(css.indexOf('.panel-tab {'), css.indexOf('}', css.indexOf('.panel-tab {')));
    expect(aba).toContain('white-space: nowrap');
  });

  it('C3: as abas da faixa de baixo moram na linha do tocador, e não numa fileira própria', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    const dope = readFileSync(resolve(__dirname, '../src/panels/dopesheet.ts'), 'utf8');
    const graph = readFileSync(resolve(__dirname, '../src/panels/graph.ts'), 'utf8');
    // O painel diz qual é a linha dele (só acrescentando); a casca põe as abas lá.
    expect(dope).toContain('data-faixa-linha');
    expect(graph).toContain('data-faixa-linha');
    expect(shell).toContain('[data-faixa-linha]');
  });

  it('C4: o rodapé tem versões curtas; à vista vai a mais longa que cabe, e a dica guarda a inteira', () => {
    const ferramenta = 'Transformar: clique escolhe. Dentro da caixa arrasta, a bolinha gira, o quadradinho escala, Alt no quadradinho do meio inclina.';
    expect(versoesDaFrase(ferramenta)).toEqual([ferramenta, 'Transformar: clique escolhe.', 'Transformar']);
    // A régua: nunca "…". Cabe a primeira que couber; se nenhuma, a menor.
    const cabe = (n: number) => (s: string) => s.length <= n;
    expect(escolherQueCabe(versoesDaFrase(ferramenta), cabe(40))).toBe('Transformar: clique escolhe.');
    expect(escolherQueCabe(versoesDaFrase(ferramenta), cabe(5))).toBe('Transformar');
    expect(escolherQueCabe(['Arquivo salvo.'], cabe(9))).toBe('Arquivo salvo.');
  });

  it('C4: o rodapé fala por um lugar, e esse lugar escolhe a versão que cabe', () => {
    const status = readFileSync(resolve(__dirname, '../src/ui/shell-status.ts'), 'utf8');
    const corpo = status.slice(status.indexOf('export function falarPorUmLugar'));
    expect(corpo).toContain('caberNoLugar(');
    expect(status).toContain('escolherQueCabe(versoesDaFrase(');
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    // O chip do modo encolhe para o nome ("Animação: idle"); a explicação vai para a dica.
    expect(shell).toContain('status-mode-explica');
    // A resposta da esquerda leva no máximo a metade: a frase da ferramenta tem lugar.
    const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
    const inicio = css.search(/^\.status-state \{/m);
    const regra = css.slice(inicio, css.indexOf('}', inicio));
    expect(regra).toContain('max-width: 50%');
  });
});

describe('rodada 47, lote 2: a dica do recolher diz para quem vai a altura (C2 do doc 68)', () => {
  it('Recolher: Propriedades. A altura vai para Árvore, Ordem', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain("const paraQuem = outros === '' ? '' : `. A altura vai para ${outros}`;");
    expect(shell).toContain('`Recolher: ${nomes}${paraQuem}`');
  });
});

// Rodada 47, lote 5b (notas do doc 86)
describe('rodada 47, lote 5b: a casca dá o foco à barrinha, e a aba e o aviso têm dica', () => {
  const fonteR47L5b = (arquivo: string): string => readFileSync(resolve(__dirname, '../src', arquivo), 'utf8');

  it('apertar uma barrinha (range) leva o foco a ela, na captura, antes de qualquer painel', () => {
    const shell = fonteR47L5b('ui/shell.ts');
    expect(shell).toContain("if (!(alvo instanceof HTMLInputElement) || alvo.type !== 'range') return;");
    expect(shell).toContain('if (document.activeElement !== alvo) alvo.focus({ preventScroll: true });');
    expect(shell).toContain('alvo.focus({ preventScroll: true });');
    // E ao soltar, se o redesenho largou o foco no BODY, ele volta à barrinha de mesma marca.
    expect(shell).toContain("window.addEventListener('pointerup', solta, true);");
  });
  it('toda aba diz os gestos dela, e "Nenhum aviso" diz o que o botão abre', () => {
    const shell = fonteR47L5b('ui/shell.ts');
    expect((shell.match(/tab\.title = `\$\{panel\.title\}: clique traz à frente/g) ?? []).length).toBe(2);
    expect(shell).toContain("? 'Nenhum aviso: o arquivo não tem nada a consertar.");
  });
});

// Rodada 47, lote 6 (doc 52, defeito 3)
describe('rodada 47, lote 6: a barra de avisos e a janela de Problemas contam igual', () => {
  it('uma frase repetida conta uma vez, e a janela refaz a barra ao abrir', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain('return [...new Set(todas)];');
    const abre = shell.slice(shell.indexOf('  showProblems(): void {'), shell.indexOf('  showProblems(): void {') + 300);
    expect(abre).toContain('this.refreshStatus();');
  });
});

describe('rodada 47, lote 6: as abas da faixa de baixo têm dica', () => {
  it('Linha do tempo e Curvas dizem o que são', () => {
    const shell = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(shell).toContain("? 'Curvas: o gráfico das chaves no tempo,");
  });
});

// ---------------------------------------------------------------------------
// Rodada 50, lote 4 — a aba que o Humberto circulou (doc 98, item E)
// ---------------------------------------------------------------------------

describe('rodada 50, lote 4: o × da aba é botão, a aba à frente não parece sublinhada, e o rodapé concorda', () => {
  const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
  const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');

  it('o × tem caixa própria e distância do nome', () => {
    const regra = /\.panel-tab-x\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(regra).toMatch(/margin-left:\s*6px/);
    expect(regra).toMatch(/border:\s*1px solid var\(--line\)/);
  });

  it('a marca da aba à frente mora no TOPO: sem linha embaixo do nome', () => {
    const regra = /\.panel-tab\.is-active\s*\{([^}]*)\}/.exec(css)?.[1] ?? '';
    expect(regra).toMatch(/border-bottom-color:\s*transparent/);
    expect(regra).toMatch(/box-shadow:\s*inset 0 3px 0 var\(--accent\)/);
  });

  it('o rodapé fala do PAINEL: "Painel Árvore fechado", "Painel Ordem solto" — nunca "Árvore fechado"', () => {
    expect(casca).toContain('`Painel ${entry.panel.title} fechado. ${volta}`');
    expect(casca).toContain('`Painel ${entry.panel.title} solto. Arraste a barra dele até uma tira de abas para colar de volta`');
    expect(casca).toContain('colado neste grupo`');
    expect(casca).not.toMatch(/`\$\{entry\.panel\.title\} fechado/);
    expect(casca).not.toMatch(/`\$\{entry\.panel\.title\} solto/);
  });
});
