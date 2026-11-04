/**
 * Tema, painéis limpos e ficha rápida — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote18-tema`, `lote19-paineis-limpos`, `lote22-ficha-rapida`.
 */

import { describe, expect, it } from 'vitest';
import { DARK, LIGHT, THEMES, contrastRatio, cssVarOf, isThemeName, luminance, parseHex, themeKeys } from '../src/ui/theme.js';
import type { Theme, ThemeName } from '../src/ui/theme.js';
import { DEFAULT_PREFS, parsePrefs } from '../src/ui/prefs.js';
import { allMenus, flatEntries, WINDOW_PANELS, isSeparator } from '../src/ui/menus.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { viewMenuState } from './ajuda-view.js';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { BoneFile } from '../../runtime/src/index.js';
import { Doc } from '../src/doc/document.js';
import { UndoStack } from '../src/doc/undo.js';
import { AddBone } from '../src/panels/tree-model.js';
import { historyRows, jumpNotice, stepsTo } from '../src/panels/history-model.js';
import type { UndoView } from '../src/panels/history-model.js';
import { LONG_MENU, MAX_CHARS, MAX_GROUP, MENU_ORDER, auditMenus, groupSizes, labelLength } from '../src/ui/menu-audit.js';
import { hasIcon } from '../src/ui/icons.js';
import { RIGHT_GROUPS, defaultLayout, missingTabs, sideOf } from '../src/ui/layout-model.js';
import { emptySelection } from '../src/contract.js';
import type { Selection } from '../src/contract.js';
import { alphaFromSlider, angleFromDial, attachmentPointer, dialPoint, formatQuick, quickFields, quickSubject, readQuickValue, sliderFromAlpha } from '../src/panels/quick-model.js';
import { getAtPointer } from '../src/panels/json-pointer.js';

// ---------------------------------------------------------------------------
// tema (lote 18) — era `lote18-tema.test.ts`
// ---------------------------------------------------------------------------

describe('tema (lote 18)', () => {
/**
 * Lote 18 (v4.0): os dois temas, e o escuro como padrão.
 *
 * Sem DOM. Um tema é uma tabela de cores, e o que se prova aqui é que ela está
 * inteira: as mesmas chaves nos dois, na mesma ordem, e **todo par de texto
 * sobre fundo passa em 4,5 de contraste** — o mínimo do WCAG AA.
 *
 * Nenhuma cor deste projeto foi escolhida por parecer bonita numa foto: o
 * teste é que diz se ela entra.
 */
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

const NOMES: ThemeName[] = ['claro', 'escuro'];

// ---------------------------------------------------------------------------
// Os dois têm as mesmas chaves
// ---------------------------------------------------------------------------

describe('os dois temas', () => {
  it('têm as mesmas chaves, na mesma ordem', () => {
    expect(Object.keys(THEMES.escuro)).toEqual(Object.keys(THEMES.claro));
  });

  it('nenhuma cor ficou vazia, e toda uma é um `#rrggbb` de verdade', () => {
    for (const nome of NOMES) {
      for (const chave of themeKeys()) {
        const cor = THEMES[nome][chave];
        expect(cor, `${nome}.${chave}`).toMatch(/^#[0-9a-f]{6}$/);
        expect(parseHex(cor), `${nome}.${chave}`).not.toBeNull();
      }
    }
  });

  it('o nome da variável CSS sai do nome da chave', () => {
    expect(cssVarOf('ink')).toBe('--ink');
    expect(cssVarOf('inkSoft')).toBe('--ink-soft');
    expect(cssVarOf('sceneGridStrong')).toBe('--scene-grid-strong');
    expect(cssVarOf('toggleOn')).toBe('--toggle-on');
  });

  it('o laranja do ligado é o MESMO nos dois: é a cor do Spriter', () => {
    expect(DARK.toggleOn).toBe(LIGHT.toggleOn);
    expect(DARK.toggleOn).toBe('#d98a2b');
  });

  it('a cena continua CLARA no tema escuro, como no Spriter', () => {
    // O personagem é desenhado com linha escura; linha escura sobre fundo
    // escuro não se vê. O que muda de cor é o painel em volta.
    expect(luminance(DARK.sceneBackground)).toBeGreaterThan(luminance(DARK.panel));
    expect(luminance(DARK.panel)).toBeLessThan(luminance(LIGHT.panel));
  });
});

// ---------------------------------------------------------------------------
// Contraste
// ---------------------------------------------------------------------------

describe('contraste, pela conta do WCAG', () => {
  it('a conta bate nos casos que se sabem de cor', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 5);
    expect(contrastRatio('#ffffff', '#ffffff')).toBeCloseTo(1, 5);
    // A ordem não importa: é uma razão entre a mais clara e a mais escura.
    expect(contrastRatio('#10151c', '#ffffff'))
      .toBeCloseTo(contrastRatio('#ffffff', '#10151c'), 9);
  });

  it('o par do plano passa: texto claro sobre painel escuro', () => {
    expect(contrastRatio('#e6e6e6', '#3a3a3a')).toBeGreaterThanOrEqual(4.5);
  });

  it('texto sobre painel passa em 4,5 nos DOIS temas', () => {
    for (const nome of NOMES) {
      const t = THEMES[nome];
      expect(contrastRatio(t.ink, t.panel), `${nome}: ink/panel`)
        .toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.ink, t.paper), `${nome}: ink/paper`)
        .toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.inkSoft, t.panel), `${nome}: ink-soft/panel`)
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  it('o texto do botão aceso, e o do aviso, também passam', () => {
    for (const nome of NOMES) {
      const t = THEMES[nome];
      expect(contrastRatio(t.accentInk, t.accent), `${nome}: accent`)
        .toBeGreaterThanOrEqual(4.5);
      expect(contrastRatio(t.warn, t.warnBg), `${nome}: warn`)
        .toBeGreaterThanOrEqual(4.5);
    }
  });

  it('a linha se separa do painel o bastante para ser uma linha', () => {
    for (const nome of NOMES) {
      const t = THEMES[nome];
      expect(contrastRatio(t.line, t.panel), `${nome}: line/panel`)
        .toBeGreaterThan(1.2);
    }
  });
});

// ---------------------------------------------------------------------------
// A preferência
// ---------------------------------------------------------------------------

describe('a preferência do tema', () => {
  it('o padrão é ESCURO', () => {
    expect(DEFAULT_PREFS.theme).toBe('escuro');
    expect(parsePrefs({}).theme).toBe('escuro');
    expect(parsePrefs(null).theme).toBe('escuro');
    expect(parsePrefs(undefined).theme).toBe('escuro');
  });

  it('um nome que não existe volta ao padrão', () => {
    expect(parsePrefs({ theme: 'roxo' }).theme).toBe('escuro');
    expect(parsePrefs({ theme: 42 }).theme).toBe('escuro');
    expect(isThemeName('roxo')).toBe(false);
    expect(isThemeName('claro')).toBe(true);
    expect(isThemeName('escuro')).toBe(true);
  });

  it('o que foi escolhido de verdade é lembrado', () => {
    expect(parsePrefs({ theme: 'claro' }).theme).toBe('claro');
    // O `physicsSim` entrou no degrau 12 (porta D6): o interruptor da física
    // é preferência de quem usa, e vem junto com o resto.
    expect(parsePrefs({ theme: 'escuro', toolNames: true }))
      // `nextStep`: P19 (29/09/2026), a dica do passo seguinte, ligada de fábrica.
      .toEqual({ theme: 'escuro', toolNames: true, physicsSim: true, showVars: true, nextStep: true });
    // O `showVars` entrou no mesmo degrau (porta G9/P15): 🗣️ *"variáveis e
    // tags pela tela, com um jeito de desligar"* (RESPOSTAS Q23).
    expect(parsePrefs({ showVars: false }).showVars).toBe(false);
    expect(parsePrefs({ physicsSim: false }).physicsSim).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// O menu
// ---------------------------------------------------------------------------

describe('Exibir → Tema', () => {
  it('tem os dois filhos, e nada mais', () => {
    const exibir = menus().find((g) => g.label === 'Exibir');
    expect(exibir).toBeDefined();
    const tema = (exibir?.entries ?? []).find((e) => 'label' in e && e.label === 'Tema');
    expect(tema).toBeDefined();
    const filhos = (tema as { children?: Array<{ label: string; action: string }> }).children ?? [];
    expect(filhos.map((f) => f.label)).toEqual(['Escuro', 'Claro']);
    expect(filhos.map((f) => f.action)).toEqual(['tema-escuro', 'tema-claro']);
  });

  it('as duas ações aparecem uma vez só na barra de menus inteira', () => {
    const acoes = flatEntries(menus().flatMap((g) => g.entries)).map((e) => e.action);
    for (const acao of ['tema-claro', 'tema-escuro']) {
      expect(acoes.filter((a) => a === acao).length, acao).toBe(1);
    }
  });
});

/** Só para o TypeScript conferir que `Theme` é usado. */
const _t: Theme = { ...LIGHT };
void _t;
});

// ---------------------------------------------------------------------------
// paineis limpos (lote 19) — era `lote19-paineis-limpos.test.ts`
// ---------------------------------------------------------------------------

describe('paineis limpos (lote 19)', () => {
/**
 * Lote 19 (v4.1): painéis limpos, menus auditados, e o painel Histórico.
 *
 * Sem DOM. *"Nossos menus são muito bagunçados e não temos coisas básicas que
 * o Spriter tem"*. A parte do "não temos" foi dos lotes 15, 16 e 17; esta é a
 * parte do **bagunçados** — mais o Histórico, que o Spriter tem e nós não
 * tínhamos.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

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

/** Uma pilha de mentira, para provar a conta sem montar um documento. */
function pilha(feitos: string[], desfeitos: string[] = []): UndoView {
  return {
    entries: () => [
      ...feitos.map((label, index) => ({ label, index, undone: false })),
      ...desfeitos.map((label, i) => ({ label, index: feitos.length + i, undone: true })),
    ],
    cursor: () => feitos.length - 1,
  };
}

// ---------------------------------------------------------------------------
// A auditoria dos sete menus
// ---------------------------------------------------------------------------

describe('os sete menus', () => {
  it('não têm mais nada errado', () => {
    expect(auditMenus(menus())).toEqual([]);
  });

  it('todo menu tem a ordem escrita à mão', () => {
    for (const menu of menus()) {
      expect(MENU_ORDER[menu.label], menu.label).toBeDefined();
      expect(MENU_ORDER[menu.label]?.length, menu.label).toBeGreaterThan(10);
    }
  });

  it('nenhum menu comprido tem um bloco de mais de seis', () => {
    for (const menu of menus()) {
      const soltos = menu.entries.filter((item) => !isSeparator(item));
      if (soltos.length <= LONG_MENU) continue;
      for (const tamanho of groupSizes(menu.entries)) {
        expect(tamanho, `${menu.label}: bloco de ${tamanho}`).toBeLessThanOrEqual(MAX_GROUP);
      }
    }
  });

  it('nenhum nome passa de 28 letras, e as reticências não contam', () => {
    expect(labelLength('Salvar como…')).toBe(11);
    expect(labelLength('Novo')).toBe(4);
    for (const menu of menus()) {
      for (const item of flatEntries(menu.entries)) {
        expect(labelLength(item.label), `${menu.label} › ${item.label}`)
          .toBeLessThanOrEqual(MAX_CHARS);
      }
    }
  });

  it('nenhuma ação aparece em dois menus', () => {
    const acoes = flatEntries(menus().flatMap((g) => g.entries))
      .filter((e) => e.children === undefined || e.children.length === 0)
      .map((e) => e.action);
    const repetidas = acoes.filter((a, i) => acoes.indexOf(a) !== i);
    expect(repetidas).toEqual([]);
  });

  it('a auditoria acusa de verdade o que está errado', () => {
    // Se ela devolvesse lista vazia para tudo, o teste de cima não valeria nada.
    const ruim: MenuGroupDef[] = [{
      label: 'Inventado',
      entries: [{ label: 'Um nome bem mais comprido do que cabe', action: 'x', enabled: true }],
    }];
    const erros = auditMenus(ruim);
    expect(erros.length).toBeGreaterThanOrEqual(2);
    expect(erros.some((e) => e.regra.includes('MENU_ORDER'))).toBe(true);
    expect(erros.some((e) => e.regra.includes('letras'))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// O painel Histórico
// ---------------------------------------------------------------------------

describe('o painel Histórico', () => {
  it('três comandos dão quatro linhas, e a última é a atual', () => {
    const rows = historyRows(pilha(['Novo osso', 'Mover osso', 'Novo slot']));
    expect(rows.length).toBe(4);
    // A primeira é sempre o ponto de partida, e ela é um lugar para voltar.
    expect(rows[0]?.label).toBe('Arquivo aberto');
    expect(rows[0]?.index).toBe(-1);
    expect(rows[3]?.state).toBe('atual');
    expect(rows.filter((r) => r.state === 'atual').length).toBe(1);
  });

  it('com nada feito, a linha de partida é a atual', () => {
    const rows = historyRows(pilha([]));
    expect(rows.length).toBe(1);
    expect(rows[0]?.state).toBe('atual');
  });

  it('um desfazer deixa a segunda como atual e a terceira cinza', () => {
    const rows = historyRows(pilha(['Novo osso', 'Mover osso'], ['Novo slot']));
    expect(rows.map((r) => r.state)).toEqual(['feito', 'feito', 'atual', 'desfeito']);
  });

  it('a conta de passos nunca é negativa, e diz para que lado ir', () => {
    const p = pilha(['a', 'b', 'c']);
    expect(stepsTo(p, 0)).toEqual({ undo: 2 });
    expect(stepsTo(p, 2)).toEqual({ undo: 0 });
    expect(stepsTo(p, -1)).toEqual({ undo: 3 });
    const meio = pilha(['a', 'b'], ['c']);
    expect(stepsTo(meio, 2)).toEqual({ redo: 1 });
    expect(stepsTo(meio, 0)).toEqual({ undo: 1 });
  });

  it('a frase da barra de baixo diz quantos passos e para onde', () => {
    expect(jumpNotice({ undo: 1 }, 'Novo osso')).toBe('Voltou um passo, até Novo osso');
    expect(jumpNotice({ undo: 3 }, 'Arquivo aberto'))
      .toBe('Voltou 3 passos, até Arquivo aberto');
    expect(jumpNotice({ redo: 1 }, 'Novo slot')).toBe('Avançou um passo, até Novo slot');
    expect(jumpNotice({ undo: 0 }, 'Novo slot')).toBe('Já está em Novo slot');
  });

  it('um comando novo depois de desfazer apaga o desfeito', () => {
    const stack = new UndoStack();
    const doc = heroi();
    for (let i = 0; i < 3; i++) {
      const c = new AddBone(doc.file, null);
      c.apply(doc);
      stack.push(c);
    }
    expect(stack.entries().length).toBe(3);
    stack.undo(doc);
    expect(stack.entries().filter((e) => e.undone).length).toBe(1);

    const novo = new AddBone(doc.file, null);
    novo.apply(doc);
    stack.push(novo);
    // O desfeito sumiu: a pilha voltou a ter três, todos feitos.
    expect(stack.entries().length).toBe(3);
    expect(stack.entries().every((e) => !e.undone)).toBe(true);
    expect(stack.cursor()).toBe(2);
  });

  it('a pilha cheia não passa do limite', () => {
    const stack = new UndoStack(4);
    const doc = heroi();
    for (let i = 0; i < 10; i++) {
      const c = new AddBone(doc.file, null);
      c.apply(doc);
      stack.push(c);
    }
    expect(stack.entries().length).toBeLessThanOrEqual(4);
    expect(historyRows(stack).length).toBeLessThanOrEqual(5);
  });

  it('o documento de verdade entrega a pilha, e ela conta os passos', () => {
    const doc = heroi();
    expect(historyRows(doc.history!).length).toBe(1);
    doc.run(new AddBone(doc.file, null));
    doc.run(new AddBone(doc.file, null));
    const rows = historyRows(doc.history!);
    expect(rows.length).toBe(3);
    expect(rows[2]?.state).toBe('atual');
    expect(stepsTo(doc.history!, -1)).toEqual({ undo: 2 });
  });
});

// ---------------------------------------------------------------------------
// A aba nova, e os ícones novos
// ---------------------------------------------------------------------------

describe('o Histórico entrou na bancada', () => {
  it('está no menu Janela e na coluna da direita', () => {
    expect(WINDOW_PANELS.map((p) => p.id)).toContain('historico');
    const janela = menus().find((g) => g.label === 'Janela');
    const acoes = flatEntries(janela?.entries ?? []).map((e) => e.action);
    expect(acoes).toContain('painel-historico');

    const known = ['arvore', 'ordem', 'propriedades', 'animacoes', 'exibicao', 'malha',
      'historico', 'previa', 'peles', 'regras'];
    expect(sideOf(defaultLayout(known), 'historico')).toBe('right');
    expect(RIGHT_GROUPS.flat()).toContain('historico');
    // O painel Imagens continua reservado e por construir (ele é o lote 20); a
    // **Entidades** entrou reservada no degrau 5 (17/09/2026) e o **Pivôs** no
    // degrau 8 (18/09/2026). Nenhum dos três estava nesta lista, que é a do
    // lote 19.
    // E a **Partículas**, da rodada 15 (04/10/2026).
    expect(missingTabs(known).sort()).toEqual(['entidades', 'imagens', 'particulas', 'pivos']);
  });

  it('os seis ícones novos existem, desenhados aqui', () => {
    for (const nome of ['plus', 'chevron-down', 'duplicate', 'rename', 'back-to-setup', 'search']) {
      expect(hasIcon(nome), nome).toBe(true);
    }
  });
});
});

// ---------------------------------------------------------------------------
// ficha rapida (lote 22) — era `lote22-ficha-rapida.test.ts`
// ---------------------------------------------------------------------------

describe('ficha rapida (lote 22)', () => {
/**
 * Lote 22 (v4.4): a ficha rápida em Propriedades.
 *
 * Sem DOM. É a `Object Properties` do Spriter: seis linhas sempre iguais, no
 * alto — `x`, `y`, escala X, escala Y, o **ângulo com disco** e o **alfa com
 * barra**.
 *
 * O que se prova aqui: para onde cada linha aponta no arquivo, a conta do
 * disco (com Y para cima, §4.2), a da barra, e que o alfa de um **osso** fica
 * VAZIO em vez de cinza — o desvio 2 do lote 12.
 */
const EXAMPLE = resolve(__dirname, '../../formato/exemplos/heroi.bone');
const RAW = readFileSync(EXAMPLE, 'utf8');

function heroi(): Doc {
  return new Doc(JSON.parse(RAW) as BoneFile, { path: EXAMPLE });
}

function osso(name: string): Selection {
  return { ...emptySelection(), bones: [name] };
}

function slot(name: string): Selection {
  return { ...emptySelection(), slots: [name] };
}

// ---------------------------------------------------------------------------
// O disco
// ---------------------------------------------------------------------------

describe('o disco do ângulo', () => {
  it('direita 0, cima 90, esquerda 180, baixo −90 (§4.2)', () => {
    expect(angleFromDial(0, 0, 10, 0)).toBe(0);
    expect(angleFromDial(0, 0, 0, 10)).toBe(90);
    expect(angleFromDial(0, 0, -10, 0)).toBe(180);
    expect(angleFromDial(0, 0, 0, -10)).toBe(-90);
  });

  it('as diagonais dão os 45 certos', () => {
    expect(angleFromDial(0, 0, 10, 10)).toBeCloseTo(45, 6);
    expect(angleFromDial(0, 0, -10, 10)).toBeCloseTo(135, 6);
    expect(angleFromDial(0, 0, -10, -10)).toBeCloseTo(-135, 6);
  });

  it('o centro do disco não gira nada', () => {
    expect(angleFromDial(0, 0, 0, 0)).toBe(0);
    // E o centro pode não ser a origem.
    expect(angleFromDial(50, 50, 60, 50)).toBe(0);
    expect(angleFromDial(50, 50, 50, 60)).toBe(90);
  });

  it('a agulha volta ao ponto certo da borda', () => {
    const direita = dialPoint(0, 10);
    expect(direita.x).toBeCloseTo(10, 6);
    expect(direita.y).toBeCloseTo(0, 6);
    const cima = dialPoint(90, 10);
    expect(cima.x).toBeCloseTo(0, 6);
    expect(cima.y).toBeCloseTo(10, 6);
  });

  it('ida e volta pelo disco não muda o ângulo', () => {
    for (const graus of [-179, -90, -45, 0, 45, 90, 135, 180]) {
      const ponta = dialPoint(graus, 20);
      expect(angleFromDial(0, 0, ponta.x, ponta.y), `${graus}`).toBeCloseTo(graus, 5);
    }
  });
});

// ---------------------------------------------------------------------------
// A barra do alfa
// ---------------------------------------------------------------------------

describe('a barra do alfa', () => {
  it('0 a 100 na barra vira 0 a 1 no arquivo', () => {
    expect(alphaFromSlider(100)).toBe(1);
    expect(alphaFromSlider(0)).toBe(0);
    expect(alphaFromSlider(50)).toBe(0.5);
    expect(alphaFromSlider(33)).toBe(0.33);
  });

  it('fora dos limites fica preso: o formato não tem alfa 1,5', () => {
    expect(alphaFromSlider(150)).toBe(1);
    expect(alphaFromSlider(-20)).toBe(0);
    expect(alphaFromSlider(Number.NaN)).toBe(1);
  });

  it('o caminho de volta põe a barra onde o alfa está', () => {
    expect(sliderFromAlpha(1)).toBe(100);
    expect(sliderFromAlpha(0.5)).toBe(50);
    expect(sliderFromAlpha(9)).toBe(100);
    expect(sliderFromAlpha(Number.NaN)).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// As seis linhas
// ---------------------------------------------------------------------------

describe('as seis linhas da ficha', () => {
  it('um osso dá seis linhas, na ordem do Spriter', () => {
    const doc = heroi();
    const campos = quickFields(doc.file, quickSubject(osso('arm')));
    expect(campos.length).toBe(6);
    expect(campos.map((c) => c.key))
      .toEqual(['x', 'y', 'scaleX', 'scaleY', 'rotation', 'alpha']);
    expect(campos[4]?.control).toBe('disco');
    expect(campos[5]?.control).toBe('barra');
  });

  it('o alfa de um OSSO fica vazio, e a dica diz por quê', () => {
    const doc = heroi();
    const campos = quickFields(doc.file, quickSubject(osso('arm')));
    const alfa = campos.find((c) => c.key === 'alpha')!;
    // Vazio, e não cinza: um campo cinza que nunca acende se aprende a ignorar.
    expect(alfa.pointer).toBeNull();
    expect(alfa.hint).toContain('slot');
  });

  it('as cinco primeiras linhas de um osso apontam para o osso certo', () => {
    const doc = heroi();
    const i = (doc.file.bones ?? []).findIndex((b) => b.name === 'arm');
    const campos = quickFields(doc.file, quickSubject(osso('arm')));
    expect(campos[0]?.pointer).toBe(`/bones/${i}/x`);
    expect(campos[4]?.pointer).toBe(`/bones/${i}/rotation`);
    // E o valor lido é o que está no arquivo.
    expect(readQuickValue(doc.file, campos[0]!))
      .toBe((doc.file.bones ?? [])[i]?.x);
  });

  it('num slot, o alfa aponta para o quarto número de `color`', () => {
    const doc = heroi();
    const i = (doc.file.slots ?? []).findIndex((s) => s.name === 'weapon');
    const campos = quickFields(doc.file, quickSubject(slot('weapon')));
    const alfa = campos.find((c) => c.key === 'alpha')!;
    expect(alfa.pointer).toBe(`/slots/${i}/color/3`);
  });

  it('num slot, x e y apontam para o DESENHO, não para o slot', () => {
    const doc = heroi();
    const campos = quickFields(doc.file, quickSubject(slot('weapon')));
    const ponteiro = attachmentPointer(doc.file, 'weapon');
    if (ponteiro === null) {
      // Um slot sem desenho na pele aberta: as linhas ficam vazias.
      expect(campos[0]?.pointer).toBeNull();
      return;
    }
    expect(campos[0]?.pointer).toBe(`${ponteiro}/x`);
    expect(ponteiro.startsWith('/skins/')).toBe(true);
    // E o ponteiro leva mesmo a alguma coisa no arquivo.
    expect(getAtPointer(doc.file as never, ponteiro)).toBeDefined();
  });

  it('o valor omitido no arquivo vale o padrão do formato', () => {
    const doc = heroi();
    const campos = quickFields(doc.file, quickSubject(osso('root')));
    const escalaX = campos.find((c) => c.key === 'scaleX')!;
    // O formato omite o que é igual ao padrão: um osso sem `scaleX` tem 1.
    expect(escalaX.fallback).toBe(1);
    expect(readQuickValue(doc.file, escalaX)).toBe(1);
    // Ler `undefined` como zero encolheria o personagem no primeiro clique.
    expect(readQuickValue(doc.file, escalaX)).not.toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Quem a ficha edita
// ---------------------------------------------------------------------------

describe('quem a ficha edita', () => {
  it('um osso só, ou um slot só', () => {
    expect(quickSubject(osso('arm'))).toEqual({ kind: 'bone', name: 'arm' });
    expect(quickSubject(slot('weapon'))).toEqual({ kind: 'slot', name: 'weapon' });
  });

  it('nada escolhido, ou vários, não abre ficha', () => {
    expect(quickSubject(emptySelection()).kind).toBe('none');
    expect(quickSubject({ ...emptySelection(), bones: ['arm', 'hand'] }).kind).toBe('none');
    // Seis campos com valores diferentes por trás mostrariam o do primeiro e
    // gravariam em todos.
    expect(quickSubject({ ...emptySelection(), bones: ['arm'], slots: ['weapon'] }).kind)
      .toBe('none');
  });

  it('um nome que não existe devolve lista vazia em vez de estourar', () => {
    const doc = heroi();
    expect(quickFields(doc.file, quickSubject(osso('nao-existe')))).toEqual([]);
    expect(quickFields(doc.file, quickSubject(slot('nao-existe')))).toEqual([]);
    expect(quickFields(doc.file, { kind: 'none' })).toEqual([]);
  });

  it('o número da ficha sai com vírgula e no máximo duas casas', () => {
    expect(formatQuick(0.30000000000000004)).toBe('0,3');
    expect(formatQuick(-160)).toBe('-160');
    expect(formatQuick(1)).toBe('1');
    expect(formatQuick(Number.NaN)).toBe('0');
  });
});
});
