/**
 * Menus — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote-menus`, `lote12-abas-e-tab`, `lote29-escondidas`.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { describe, expect, it, beforeEach } from 'vitest';
import { END_MODES } from '../src/anim/transport.js';
import { COMPENSATION_ACTIONS, KEY_HINTS, NEUTRAL_MENU_STATE, VIEW_ACTIONS, WINDOW_PANELS, allMenus, animationMenu, flatEntries, isSeparator, normalizeShortcut, shortcutMap, shortcutOfEvent, shortcutTable, skeletonMenu, viewMenu } from '../src/ui/menus.js';
import type { MenuEntry, MenuGroupDef, MenuItem, MenuState } from '../src/ui/menus.js';
import { DEFAULT_WIDTH } from '../src/ui/layout-model.js';
import {
  MAX_ARRANGEMENTS, allArrangements, arrangementHint, arrangementId, deleteArrangement,
  factoryArrangements, layoutOf, parseArrangements, saveArrangement, savedList,
} from '../src/ui/arrangements.js';
import { fixHint, problemsSummary } from '../src/ui/problems-dialog.js';
import { actionState, clearActions, hasAction, registerAction, registeredActions, runAction } from '../src/ui/actions.js';
import { DEFAULT_VIEW, resetViewSettings, setViewSettings, viewSettings, parseViewSettings } from '../src/viewport/onion.js';
import { viewMenuState } from './ajuda-view.js';
import { previousToolFor, TOOL_BACK_NOTICE } from '../src/viewport/viewport.js';
import { noToolBackNotice } from '../src/viewport/tools/registry.js';
import { greyItemSays } from '../src/ui/menus.js';
import { DEFAULT_GROUPS, DEFAULT_SPLIT, SPLIT_MAX, SPLIT_MIN, defaultColumnState, groupOf, moveTab, parseColumnState, selectTab, setSplit, toggleHidden } from '../src/ui/panel-groups.js';
import { CLOSED_PANELS, DOCK_PANELS, TOOL_PANELS } from '../src/ui/shell.js';
import { RIGHT_GROUPS } from '../src/ui/layout-model.js';
import { ONION_ROWS, SCENE_ROWS, TYPE_ROWS } from '../src/panels/view-panel.js';
import { KEY_HINT } from '../src/panels/dopesheet-model.js';
import { hasIcon } from '../src/ui/icons.js';
import { CONTEXT_ACTIONS, EXEMPT, hiddenFunctions } from '../src/ui/action-audit.js';
import { EXEMPT_COMMANDS, commandDefs, commandsWithoutDoor } from '../src/ui/command-audit.js';
import { filterCommands } from '../src/ui/palette.js';
import { EXEMPT_CALLS, swallowedClicks } from '../src/ui/call-audit.js';
import { actionBarItems } from '../src/ui/action-bar-model.js';
import { CREATE_BONE_FOOTER, toolFooter } from '../src/ui/toolbar-model.js';
import { getTools } from '../src/contract.js';
import '../src/panels/index.js';

// ---------------------------------------------------------------------------
// menus (lote menus) — era `lote-menus.test.ts`
// ---------------------------------------------------------------------------

describe('menus (lote menus)', () => {
/**
 * Lote menus (v1.6): os sete menus, o registro de ações e o botão direito.
 *
 * Não há jsdom no projeto, então nada aqui abre um menu na tela. O que se prova
 * é a parte que decide: o que os sete menus oferecem, que nenhuma tecla está
 * escrita duas vezes, que a tabela de atalhos sai dos próprios menus, e que
 * `documentos/planos/PROJETO DO MENU 2026-09-08.md` — que é quem manda — não
 * ficou para trás do código.
 */
const PROJETO = resolve(__dirname, '../../documentos/planos/PROJETO DO MENU 2026-09-08.md');

/** Um estado de programa parado: nada aberto, nada desfeito, nada trancado. */
function state(patch: Partial<MenuState> = {}): MenuState {
  const view = viewSettings();
  return {
    canRepack: false,
    canUndo: false,
    undoLabel: null,
    canRedo: false,
    redoLabel: null,
    view: viewMenuState(),
    lockBones: view.lockBones,
    lockDrawings: view.lockDrawings,
    space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    animating: true,
    loop: false,
    open: {},
    ...patch,
  };
}

function menus(patch: Partial<MenuState> = {}): MenuGroupDef[] {
  return allMenus(state(patch));
}

/** Toda entrada dos sete menus, com o nome do menu de onde ela veio. */
function everyEntry(groups: readonly MenuGroupDef[]): Array<{ menu: string; entry: ReturnType<typeof flatEntries>[number] }> {
  const out: Array<{ menu: string; entry: ReturnType<typeof flatEntries>[number] }> = [];
  for (const group of groups) {
    for (const entry of flatEntries(group.entries)) out.push({ menu: group.label, entry });
  }
  return out;
}

beforeEach(() => {
  resetViewSettings();
  clearActions();
});

// ---------------------------------------------------------------------------
// A barra
// ---------------------------------------------------------------------------

describe('a barra de menus', () => {
  // Rodada 6 (05/10/2026), `05 O DESENHO DOS MENUS`: a ordem do trabalho,
  // como no Spriter — imagens, base, malha e regras, animar, vestir, encaixar,
  // efeito — e então olhar. Eram sete: Arquivo · Editar · Esqueleto ·
  // Animação · Exibir · Janela · Ajuda. Esqueleto passou a se chamar Base.
  it('tem doze menus, na ordem do trabalho, e Esqueleto virou Base', () => {
    expect(menus().map((group) => group.label)).toEqual([
      'Arquivo', 'Editar', 'Imagens', 'Base', 'Malha e regras', 'Animação',
      'Skins', 'Tomadas', 'Partículas', 'Exibir', 'Janela', 'Ajuda',
    ]);
    expect(menus().some((group) => group.label === 'Esqueleto')).toBe(false);
  });

  it('toda entrada tem nome e ação, e nenhuma delas está vazia', () => {
    for (const { menu, entry } of everyEntry(menus())) {
      expect(entry.label.trim(), `${menu}: entrada sem nome`).not.toBe('');
      expect(entry.action.trim(), `${menu} › ${entry.label}: entrada sem ação`).not.toBe('');
    }
  });

  it('nenhuma ação aparece duas vezes nos doze menus', () => {
    const seen = new Map<string, string>();
    for (const { menu, entry } of everyEntry(menus())) {
      const before = seen.get(entry.action);
      expect(before, `a ação "${entry.action}" está em ${before} e em ${menu} › ${entry.label}`)
        .toBeUndefined();
      seen.set(entry.action, `${menu} › ${entry.label}`);
    }
  });

  it('nenhuma tecla aparece duas vezes nos doze menus', () => {
    const seen = new Map<string, string>();
    for (const { menu, entry } of everyEntry(menus())) {
      if (entry.shortcut === undefined) continue;
      const key = normalizeShortcut(entry.shortcut);
      const before = seen.get(key);
      expect(
        before,
        `a tecla ${entry.shortcut} está em ${before} e em ${menu} › ${entry.label}`,
      ).toBeUndefined();
      seen.set(key, `${menu} › ${entry.label}`);
    }
  });

  it('toda entrada cinza diz por que está cinza, nos dois modos', () => {
    for (const patch of [{}, { animating: false }]) {
      for (const { menu, entry } of everyEntry(menus(patch))) {
        if (entry.enabled) continue;
        // "Desfazer" e "Refazer" ficam cinza por não haver o que desfazer, e
        // isso a própria palavra já diz. As outras precisam de uma frase.
        if (entry.action === 'desfazer' || entry.action === 'refazer') continue;
        expect(entry.hint, `${menu} › ${entry.label} está cinza e não explica`).toBeDefined();
      }
    }
  });

  it('um separador não é uma entrada: ele não tem nome nem ação', () => {
    const arquivo = menus()[0].entries;
    const separators = arquivo.filter((item: MenuItem) => isSeparator(item));
    expect(separators.length).toBeGreaterThan(0);
    // + os filhos dos submenus, sem os separadores de dentro (P41, 29/09/2026):
    // Importar 5 (três de arte e dois "de outro boneco") e Exportar 8 (seis
    // para o jogo e dois para outro boneco). "Trazer para o projeto" (2) saiu
    // na rodada 6: os dois de dentro foram para Base e Entidades.
    expect(flatEntries(arquivo).length).toBe(arquivo.length - separators.length + 13);
  });
});

// ---------------------------------------------------------------------------
// Exibir lê o mesmo dado do painel Exibição
// ---------------------------------------------------------------------------

describe('o menu Exibir', () => {
  it('a marca de cada caixa é o valor de `viewSettings()`, não uma cópia', () => {
    setViewSettings({ bones: true, grid: false });
    const ligado = flatEntries(viewMenu(viewMenuState(viewSettings())));
    expect(ligado.find((e) => e.action === VIEW_ACTIONS['bones'])?.checked).toBe(true);
    expect(ligado.find((e) => e.action === VIEW_ACTIONS['grid'])?.checked).toBe(false);

    setViewSettings({ bones: false, grid: true });
    const desligado = flatEntries(viewMenu(viewMenuState(viewSettings())));
    expect(desligado.find((e) => e.action === VIEW_ACTIONS['bones'])?.checked).toBe(false);
    expect(desligado.find((e) => e.action === VIEW_ACTIONS['grid'])?.checked).toBe(true);
  });

  it('oferece uma entrada para cada caixa do painel, e todas ligadas', () => {
    const acoes = flatEntries(viewMenu(viewMenuState())).map((e) => e.action);
    for (const key of ['bones', 'drawings', 'boneNames', 'points', 'boundingBoxes',
      'meshes', 'edges', 'weights', 'grid', 'axes', 'onion']) {
      expect(acoes, `falta ${key} no menu Exibir`).toContain(VIEW_ACTIONS[key]);
    }
  });
});

// ---------------------------------------------------------------------------
// Esqueleto e Animação
// ---------------------------------------------------------------------------

describe('o menu Base (era Esqueleto)', () => {
  it('as três compensações e os três eixos são liga-desliga com marca', () => {
    const entries = flatEntries(skeletonMenu(state({
      compensation: { children: true, drawings: false, boxes: false },
      space: 'mundo',
    }) as MenuState));
    expect(entries.find((e) => e.action === COMPENSATION_ACTIONS.children)?.checked).toBe(true);
    expect(entries.find((e) => e.action === COMPENSATION_ACTIONS.drawings)?.checked).toBe(false);
    expect(entries.find((e) => e.action === 'eixos-mundo')?.checked).toBe(true);
    expect(entries.find((e) => e.action === 'eixos-local')?.checked).toBe(false);
  });

  it('"Reempacotar atlas" saiu dos menus: o atlas nasce ao Salvar (lote 62)', () => {
    // Rodada 6: por nome, e em todos — o índice 3 deixou de ser o Esqueleto.
    for (const group of menus()) {
      expect(flatEntries(group.entries).map((e) => e.action), group.label).not.toContain('reempacotar');
    }
  });
});

describe('o menu Animação', () => {
  it('com a base aberta quase tudo fica cinza, com a dica; o que abre uma animação não', () => {
    const parado = flatEntries(animationMenu({ animating: false, loop: false }));
    const byAction = new Map(parado.map((e) => [e.action, e]));
    // Degrau 11: o interruptor saiu. Com a base aberta, Abrir a base fica cinza
    // e a dica diz por quê; com uma animação aberta, acende. Rodada 6: o
    // "Abrir a base" mora no menu Base, e saiu do Animação.
    expect(byAction.get('alternar-modo')).toBeUndefined();
    expect(byAction.get('abrir-a-base')).toBeUndefined();
    const base = (animating: boolean): Map<string, MenuEntry> => new Map(flatEntries(
      skeletonMenu({ ...state(), animating } as MenuState),
    ).map((e) => [e.action, e]));
    expect(base(false).get('abrir-a-base')?.enabled).toBe(false);
    expect(base(false).get('abrir-a-base')?.hint).toBe('A base já está aberta');
    expect(base(true).get('abrir-a-base')?.enabled).toBe(true);
    expect(byAction.get('nova-animacao')?.enabled).toBe(true);
    expect(byAction.get('chavear')?.enabled).toBe(false);
    expect(byAction.get('tocar')?.enabled).toBe(false);
    // O cinza diz por quê: com a base aberta, mexer já grava na base.
    expect(byAction.get('chavear')?.hint).toBe(KEY_HINTS.base);
  });

  it('Repetir carrega a marca do estado; Gravar sozinho e a tecla A saíram (degrau 4a, M6)', () => {
    const entries = flatEntries(animationMenu({ animating: true, loop: true }));
    expect(entries.find((e) => e.action === 'repetir')?.checked).toBe(true);
    expect(entries.find((e) => e.action === 'gravar-sozinho')).toBeUndefined();
    expect(entries.some((e) => e.shortcut === 'A')).toBe(false);
    // Os dois de Chavear ficam, com a dica de proteger a pose.
    expect(entries.find((e) => e.action === 'chavear')?.hint).toBe(KEY_HINTS.chavear);
    expect(entries.find((e) => e.action === 'chavear-tudo')?.hint).toBe(KEY_HINTS.tudo);
  });
});

describe('o menu Janela', () => {
  it('lista os oito painéis, cada um com a marca de aberto ou fechado', () => {
    // Rodada 6: pelo nome — o índice 5 deixou de ser o Janela.
    const entries = flatEntries(menus({ open: { exibicao: false, arvore: true } })
      .find((g) => g.label === 'Janela')!.entries);
    for (const panel of WINDOW_PANELS) {
      expect(entries.map((e) => e.action)).toContain(`painel-${panel.id}`);
    }
    expect(entries.find((e) => e.action === 'painel-exibicao')?.checked).toBe(false);
    expect(entries.find((e) => e.action === 'painel-arvore')?.checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Teclas
// ---------------------------------------------------------------------------

describe('o mapa de teclas', () => {
  it('sai dos próprios menus: F1 é o manual, Espaço toca, K chaveia', () => {
    const map = shortcutMap(menus());
    expect(map.get('f1')).toBe('manual');
    expect(map.get(' ')).toBe('tocar');
    expect(map.get('k')).toBe('chavear');
  });

  it('o mesmo gesto escrito de dois jeitos dá o mesmo nome', () => {
    expect(normalizeShortcut('Ctrl+Shift+S')).toBe(normalizeShortcut('shift+ctrl+s'));
    expect(normalizeShortcut('Espaço')).toBe(' ');
    expect(normalizeShortcut('Shift+↑')).toBe('shift+arrowup');
    // "+" e "−" são teclas de um caractere, e "+" é também o separador.
    expect(normalizeShortcut('+')).toBe('+');
    expect(normalizeShortcut('−')).toBe('-');
    expect(normalizeShortcut('Ctrl+−')).toBe('ctrl+-');
  });

  it('o que o teclado manda cai no mesmo nome que o menu escreve', () => {
    const key = (
      k: string, mods: Partial<{ ctrl: boolean; alt: boolean; shift: boolean }> = {},
    ): string => shortcutOfEvent({
      key: k,
      ctrlKey: mods.ctrl === true,
      metaKey: false,
      altKey: mods.alt === true,
      shiftKey: mods.shift === true,
    });

    expect(key('S', { ctrl: true, shift: true })).toBe(normalizeShortcut('Ctrl+Shift+S'));
    expect(key('s', { ctrl: true })).toBe(normalizeShortcut('Ctrl+S'));
    expect(key('F1', { shift: true })).toBe(normalizeShortcut('Shift+F1'));
    expect(key('ArrowUp', { shift: true })).toBe(normalizeShortcut('Shift+↑'));
    expect(key(' ', { shift: true })).toBe(normalizeShortcut('Shift+Espaço'));
    expect(key('k')).toBe(normalizeShortcut('K'));
    expect(key('Escape')).toBe(normalizeShortcut('Esc'));
    expect(key('=', { ctrl: true })).toBe(normalizeShortcut('Ctrl+='));
  });

  it('Ctrl+S e Ctrl+Shift+S não são o mesmo gesto', () => {
    expect(normalizeShortcut('Ctrl+S')).not.toBe(normalizeShortcut('Ctrl+Shift+S'));
  });
});

describe('a tabela de Ajuda → Atalhos', () => {
  it('tem uma linha por entrada com tecla, e nada além disso', () => {
    const groups = menus();
    const rows = shortcutTable(groups);
    const comTecla = everyEntry(groups).filter(({ entry }) => entry.shortcut !== undefined);
    expect(rows).toHaveLength(comTecla.length);
    expect(rows.length).toBeGreaterThan(30);
  });

  it('cada linha diz de que menu veio, o nome do item e a tecla', () => {
    const manual = shortcutTable(menus()).find((row) => row.shortcut === 'F1');
    expect(manual).toEqual({ menu: 'Ajuda', item: 'Manual', shortcut: 'F1' });
  });
});

// ---------------------------------------------------------------------------
// O registro de ações
// ---------------------------------------------------------------------------

describe('o registro de ações', () => {
  it('roda a função uma vez, e uma ação que não existe não é rodada', () => {
    let contou = 0;
    registerAction('teste', { run: () => { contou += 1; } });
    expect(hasAction('teste')).toBe(true);
    expect(runAction('teste')).toBe(true);
    expect(contou).toBe(1);

    expect(hasAction('nao-existe')).toBe(false);
    expect(runAction('nao-existe')).toBe(false);
    expect(contou).toBe(1);
  });

  it('uma ação desligada não roda', () => {
    let contou = 0;
    registerAction('teste', { run: () => { contou += 1; }, enabled: () => false });
    expect(runAction('teste')).toBe(false);
    expect(contou).toBe(0);
    expect(actionState('teste')).toEqual({ exists: true, enabled: false, checked: undefined });
  });

  it('registrar de novo substitui, e a função devolvida tira do registro', () => {
    const forget = registerAction('teste', { run: () => {} });
    let novo = 0;
    registerAction('teste', { run: () => { novo += 1; } });
    runAction('teste');
    expect(novo).toBe(1);
    // A primeira já foi substituída: esquecer a primeira não pode levar embora
    // a segunda, senão um painel remontado apagaria a ação de quem ficou.
    forget();
    expect(hasAction('teste')).toBe(true);
  });

  // Rodada 6 (05/10/2026), régua 3: o item cinza diz por quê NO CASO DE
  // AGORA. A dica fixa diz o que o item faz; o motivo vem da própria ação, e
  // só quando ela está desligada — ligada, não há o que explicar.
  it('a ação desligada diz por que, na hora; ligada, não diz nada', () => {
    let pode = false;
    registerAction('teste', {
      run: () => {},
      enabled: () => pode,
      why: () => (pode ? 'nunca dito' : 'falta escolher um osso'),
    });
    expect(actionState('teste')).toEqual({ exists: true, enabled: false, checked: undefined, why: 'falta escolher um osso' });
    pode = true;
    expect(actionState('teste').why).toBeUndefined();
    // Quem não sabe dizer devolve null, e a dica fixa do menu vale.
    registerAction('mudo', { run: () => {}, enabled: () => false, why: () => null });
    expect(actionState('mudo').why).toBeUndefined();
  });

  it('uma ação que não existe é dita cinza, não é dita ligada', () => {
    expect(actionState('nao-existe')).toEqual({ exists: false, enabled: false, checked: undefined });
    expect(registeredActions()).toEqual([]);
  });

  it('o liga-desliga é lido na hora, não guardado', () => {
    let ligado = false;
    registerAction('teste', { run: () => { ligado = !ligado; }, checked: () => ligado });
    expect(actionState('teste').checked).toBe(false);
    runAction('teste');
    expect(actionState('teste').checked).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Botão direito na cena
// ---------------------------------------------------------------------------

describe('o botão direito volta à ferramenta anterior', () => {
  it('Girar, depois Mover: o direito leva a Girar, e de novo a Mover', () => {
    // Escolheu Girar, depois Mover. O anterior é Girar.
    expect(previousToolFor('translate', 'rotate')).toBe('rotate');
    // Depois de voltar, o atual é Girar e o anterior virou Mover.
    expect(previousToolFor('rotate', 'translate')).toBe('translate');
  });

  it('sem ferramenta anterior, o botão direito não faz nada', () => {
    expect(previousToolFor('select', null)).toBeNull();
  });

  it('voltar para a mesma ferramenta não é voltar', () => {
    expect(previousToolFor('rotate', 'rotate')).toBeNull();
  });

  it('rodada 17, M15: sem para onde voltar, o rodapé diz o gesto e a ferramenta que segue (não soa a erro)', () => {
    expect(noToolBackNotice('Transformar'))
      .toBe('O botão direito volta à ferramenta de antes, e ainda não houve outra: segue Transformar');
    expect(noToolBackNotice(null)).toBe('O botão direito volta à ferramenta de antes, e ainda não houve outra');
    const cena = readFileSync(resolve(__dirname, '../src/viewport/viewport.ts'), 'utf8');
    expect(cena).not.toContain("'Não há ferramenta anterior para voltar'");
  });
});

// ---------------------------------------------------------------------------
// O projeto do menu manda
// ---------------------------------------------------------------------------

/**
 * As teclas escritas na seção 3 do PROJETO DO MENU.
 *
 * As tabelas de lá têm três colunas — Item, Atalho, Hoje —, e uma linha pode
 * juntar dois itens ("Início · Fim" com "Home · End"). Uma célula às vezes traz
 * a tecla e mais uma frase ("Ctrl+A na linha do tempo"); vale a tecla.
 */
function shortcutsInProject(): string[] {
  const text = readFileSync(PROJETO, 'utf8');
  const start = text.indexOf('## 3. O menu do Recorte');
  const end = text.indexOf('## 4. As teclas');
  expect(start, 'a seção 3 do PROJETO DO MENU sumiu').toBeGreaterThan(0);
  expect(end).toBeGreaterThan(start);

  const keys: string[] = [];
  for (const line of text.slice(start, end).split('\n')) {
    if (!line.startsWith('|')) continue;
    const cells = line.split('|').map((cell) => cell.trim());
    if (cells.length < 4) continue;
    const cell = cells[2];
    if (cell === '' || cell === 'Atalho' || cell.startsWith(':')) continue;
    for (const piece of cell.split('·')) {
      const token = piece.trim().split(/\s+/)[0];
      if (token !== undefined && token !== '') keys.push(token);
    }
  }
  return keys;
}

/**
 * Teclas do PROJETO DO MENU (08/09) que saíram **por decisão** depois dele.
 * O projeto é documento datado e não se reescreve; a decisão fica escrita aqui.
 */
const REMOVED_BY_DECISION: ReadonlyArray<{ key: string; why: string }> = [
  { key: 'A', why: 'Gravar sozinho saiu no degrau 4a (M6, 17/09/2026): editar sempre grava' },
];

describe('o PROJETO DO MENU e o menus.ts não podem discordar', () => {
  it('toda tecla escrita no projeto existe no menu, com o mesmo gesto — menos as que saíram por decisão', () => {
    const map = shortcutMap(menus());
    const saiu = new Set(REMOVED_BY_DECISION.map((r) => normalizeShortcut(r.key)));
    const faltando: string[] = [];
    for (const written of shortcutsInProject()) {
      if (saiu.has(normalizeShortcut(written))) continue;
      if (!map.has(normalizeShortcut(written))) faltando.push(written);
    }
    expect(faltando, `teclas do projeto que o menu não tem: ${faltando.join(', ')}`).toEqual([]);
    // E as que saíram, saíram mesmo: nenhuma voltou ao menu sem querer.
    for (const { key, why } of REMOVED_BY_DECISION) {
      expect(map.has(normalizeShortcut(key)), why).toBe(false);
    }
  });

  it('o projeto lista pelo menos quarenta teclas, e todas foram lidas', () => {
    expect(shortcutsInProject().length).toBeGreaterThan(40);
  });
});

// ---------------------------------------------------------------------------
// O padrão de exibição não foi mexido por engano
// ---------------------------------------------------------------------------

describe('o padrão da exibição', () => {
  it('continua o que era antes do lote', () => {
    resetViewSettings();
    expect(viewSettings().bones).toBe(DEFAULT_VIEW.bones);
    expect(viewSettings().grid).toBe(DEFAULT_VIEW.grid);
  });
});
});

// ---------------------------------------------------------------------------
// abas e tab (lote 12) — era `lote12-abas-e-tab.test.ts`
// ---------------------------------------------------------------------------

describe('abas e tab (lote 12)', () => {
/**
 * Lote 12 (v2.9): abas na coluna, Tab, Exibição em três colunas e a cebola na
 * régua.
 *
 * Sem DOM. O que se prova é a CONTA: onde cada aba está depois de arrastada,
 * o que sobra quando um painel some do programa, que tipo tem que caixa na
 * Exibição, e que a cebola saiu do painel e foi para a régua.
 */
const KNOWN = ['arvore', 'propriedades', 'animacoes', 'exibicao', 'malha'];

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

beforeEach(() => {
  resetViewSettings();
});

// ---------------------------------------------------------------------------
// Item 19 — a coluna em dois grupos de abas
// ---------------------------------------------------------------------------

describe('a coluna em dois grupos', () => {
  it('de fábrica são dois grupos, com a primeira aba de cada um à frente', () => {
    const s = defaultColumnState();
    expect(s.groups).toHaveLength(2);
    expect(s.groups[0]).toEqual(['arvore', 'propriedades']);
    expect(s.active).toEqual(['arvore', 'animacoes']);
    expect(s.hidden).toBe(false);
    expect(s.split).toBe(DEFAULT_SPLIT);
  });

  it('arrastar uma aba para o outro grupo tira ela do primeiro', () => {
    const s = moveTab(defaultColumnState(), 'propriedades', 1);
    expect(s.groups[0]).toEqual(['arvore']);
    expect(s.groups[1]).toContain('propriedades');
    // A aba que chegou fica à frente: quem arrastou quer vê-la.
    expect(s.active[1]).toBe('propriedades');
    // E o grupo de origem passa para a que sobrou.
    expect(s.active[0]).toBe('arvore');
  });

  it('a aba vai para a posição pedida, e nunca fica em dois grupos', () => {
    const s = moveTab(defaultColumnState(), 'arvore', 1, 0);
    expect(s.groups[1][0]).toBe('arvore');
    expect(s.groups[0]).not.toContain('arvore');
    const todas = s.groups.flat();
    expect(new Set(todas).size).toBe(todas.length);
  });

  it('mover uma aba que não existe não muda nada', () => {
    const antes = defaultColumnState();
    expect(moveTab(antes, 'nao-existe', 1)).toBe(antes);
    expect(selectTab(antes, 'nao-existe')).toBe(antes);
  });

  it('um grupo pode ficar vazio, e ainda aceita aba de volta', () => {
    let s = defaultColumnState();
    for (const id of ['arvore', 'propriedades']) s = moveTab(s, id, 1);
    expect(s.groups[0]).toEqual([]);
    expect(s.active[0]).toBeNull();
    s = moveTab(s, 'arvore', 0);
    expect(s.groups[0]).toEqual(['arvore']);
  });

  it('escolher uma aba muda só o grupo dela', () => {
    const s = selectTab(defaultColumnState(), 'propriedades');
    expect(s.active[0]).toBe('propriedades');
    expect(s.active[1]).toBe('animacoes');
  });

  it('`Tab` esconde e traz de volta', () => {
    const s = toggleHidden(defaultColumnState());
    expect(s.hidden).toBe(true);
    expect(toggleHidden(s).hidden).toBe(false);
  });

  it('a divisão é cortada nas pontas', () => {
    expect(setSplit(defaultColumnState(), 0).split).toBe(SPLIT_MIN);
    expect(setSplit(defaultColumnState(), 9).split).toBe(SPLIT_MAX);
    expect(setSplit(defaultColumnState(), 0.4).split).toBeCloseTo(0.4, 6);
  });

  it('`groupOf` diz onde a aba está, e -1 quando não está', () => {
    const s = defaultColumnState();
    expect(groupOf(s, 'arvore')).toBe(0);
    expect(groupOf(s, 'exibicao')).toBe(1);
    expect(groupOf(s, 'previa')).toBe(-1);
  });
});

describe('ler a arrumação guardada', () => {
  it('lixo vira a arrumação de fábrica, com todo painel numa aba', () => {
    const s = parseColumnState(null, KNOWN);
    expect(s.groups.flat().sort()).toEqual([...KNOWN].sort());
    expect(s.split).toBe(DEFAULT_SPLIT);
  });

  it('aba de painel que não existe mais é jogada fora', () => {
    const s = parseColumnState(
      { groups: [['arvore', 'painel-fantasma'], ['exibicao']], active: ['arvore', 'exibicao'] },
      KNOWN,
    );
    expect(s.groups.flat()).not.toContain('painel-fantasma');
  });

  it('painel que existe e não estava em grupo nenhum entra na casa dele', () => {
    const s = parseColumnState({ groups: [['arvore'], []] }, KNOWN);
    // `propriedades` nasce no grupo 0, `animacoes` e `exibicao` no 1.
    expect(s.groups[0]).toContain('propriedades');
    expect(s.groups[1]).toContain('animacoes');
    expect(s.groups.flat().sort()).toEqual([...KNOWN].sort());
  });

  it('a mesma aba escrita duas vezes só entra uma', () => {
    const s = parseColumnState({ groups: [['arvore', 'arvore'], ['arvore']] }, KNOWN);
    expect(s.groups.flat().filter((id) => id === 'arvore')).toHaveLength(1);
  });

  it('aba à frente que não está no grupo vira a primeira dele', () => {
    const s = parseColumnState(
      { groups: [['arvore', 'propriedades'], ['exibicao']], active: ['exibicao', 'arvore'] },
      KNOWN,
    );
    expect(s.active[0]).toBe('arvore');
    expect(s.active[1]).toBe('exibicao');
  });

  it('divisão absurda é cortada, e `hidden` só é verdade se for `true`', () => {
    expect(parseColumnState({ split: 99 }, KNOWN).split).toBe(SPLIT_MAX);
    expect(parseColumnState({ split: 'muito' }, KNOWN).split).toBe(DEFAULT_SPLIT);
    expect(parseColumnState({ hidden: 'sim' }, KNOWN).hidden).toBe(false);
    expect(parseColumnState({ hidden: true }, KNOWN).hidden).toBe(true);
  });

  it('a arrumação lida de volta é a mesma que foi guardada', () => {
    const guardado = moveTab(defaultColumnState(), 'propriedades', 1);
    const lido = parseColumnState(guardado, KNOWN);
    expect(lido.groups).toEqual(guardado.groups);
    expect(lido.active).toEqual(guardado.active);
  });
});

describe('as listas que o shell lê', () => {
  // Era o desvio 1 do lote 12. O Humberto desfez no lote 25 (anotação 5):
  // *"muda isso de lugar, não faz sentido tá aí"*.
  it('a Prévia é aba da coluna, e não da faixa de baixo', () => {
    expect(DOCK_PANELS).not.toContain('previa');
    expect(RIGHT_GROUPS.flat()).toContain('previa');
  });

  it('nada nasce dobrado: dobrar acabou no lote 12', () => {
    expect(CLOSED_PANELS).toEqual([]);
  });

  // Lote 29, anotação 15, item j: ela **fica sempre**. Uma aba que some é uma
  // função que deixou de existir para quem não sabia dela — não havia como
  // descobrir que o programa faz malha olhando a tela. Sem a ferramenta na
  // mão, a aba diz o que fazer em vez de sumir.
  it('"Malha e pesos" não some mais da tira de abas', () => {
    expect(TOOL_PANELS['malha']).toBeUndefined();
    expect(Object.keys(TOOL_PANELS)).toEqual([]);
    expect(TOOL_PANELS['arvore']).toBeUndefined();
  });

  it('o menu Janela liga "Esconder painéis" no `Tab` e "Voltar ao padrão"', () => {
    const janela = menus().find((group) => group.label === 'Janela');
    const entradas = flatEntries(janela?.entries ?? []);
    const esconder = entradas.find((e) => e.action === 'esconder-paineis');
    expect(esconder?.enabled).toBe(true);
    expect(esconder?.shortcut).toBe('Tab');
    expect(entradas.find((e) => e.action === 'layout-padrao')?.enabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Item 20 — a Exibição em três colunas
// ---------------------------------------------------------------------------

describe('Exibição em três colunas', () => {
  it('seis tipos, um por linha', () => {
    expect(TYPE_ROWS.map((r) => r.label)).toEqual([
      'Ossos', 'Desenhos', 'Pontos', 'Caixas', 'Máscaras', 'Malhas',
    ]);
  });

  it('travar só existe para osso e para desenho', () => {
    const comTrava = TYPE_ROWS.filter((r) => r.lock !== null).map((r) => r.label);
    expect(comTrava).toEqual(['Ossos', 'Desenhos']);
  });

  it('máscara e malha não têm caixa de nome', () => {
    const semNome = TYPE_ROWS.filter((r) => r.name === null).map((r) => r.label);
    expect(semNome).toEqual(['Máscaras', 'Malhas']);
  });

  it('toda caixa de ver e de nome aponta para um campo que existe', () => {
    for (const linha of TYPE_ROWS) {
      for (const key of [linha.show, linha.lock, linha.name]) {
        if (key === null) continue;
        expect(Object.prototype.hasOwnProperty.call(DEFAULT_VIEW, key)).toBe(true);
      }
    }
  });

  it('os três nomes novos existem, começam desligados e sobrevivem ao arquivo velho', () => {
    expect(DEFAULT_VIEW.slotNames).toBe(false);
    expect(DEFAULT_VIEW.pointNames).toBe(false);
    expect(DEFAULT_VIEW.boxNames).toBe(false);
    const velho = parseViewSettings({ grid: true });
    expect(velho.slotNames).toBe(false);
    expect(velho.pointNames).toBe(false);
    expect(velho.boxNames).toBe(false);
    expect(parseViewSettings({ slotNames: true }).slotNames).toBe(true);
  });

  it('o que não é tipo de desenho ficou solto, e sem repetir', () => {
    expect(SCENE_ROWS.map((r) => r.key)).toEqual(['edges', 'weights', 'grid', 'rulers', 'axes']);
    const daTabela = TYPE_ROWS.flatMap((r) => [r.show, r.name]).filter((k) => k !== null);
    for (const linha of SCENE_ROWS) expect(daTabela).not.toContain(linha.key);
  });
});

// ---------------------------------------------------------------------------
// Item 28 — a cebola na régua
// ---------------------------------------------------------------------------

describe('a casca de cebola na régua', () => {
  it('os seis números continuam os mesmos, e agora moram na régua', () => {
    expect(ONION_ROWS.map((r) => r.key)).toEqual([
      'before', 'after', 'step', 'opacity', 'offsetX', 'offsetY',
    ]);
  });

  it('existe um ícone de cebola para o botão da régua', () => {
    expect(hasIcon('onion')).toBe(true);
  });

  it('o menu Exibir continua ligando a cebola, pela mesma ação', () => {
    const exibir = menus().find((group) => group.label === 'Exibir');
    const entradas = flatEntries(exibir?.entries ?? []);
    expect(entradas.some((e) => e.label === 'Casca de cebola')).toBe(true);
    // "opções…" continua existindo: ela abre o painel, que é onde o resto das
    // opções de ver mora. Os campos da cebola em si estão na régua.
    expect(entradas.some((e) => e.action === 'cebola-opcoes')).toBe(true);
  });
});
});

// ---------------------------------------------------------------------------
// escondidas (lote 29) — era `lote29-escondidas.test.ts`
// ---------------------------------------------------------------------------

describe('escondidas (lote 29)', () => {
/**
 * Lote 29 (v5.2): a anotação 15 do Humberto — as funções escondidas.
 *
 * *"Aproveite e veja se tem outras funções extremamente importantes
 * escondidas."*
 *
 * A varredura achou dez, e nenhuma estava escondida do jeito esperado:
 * **nenhuma faltava num menu**. Elas eram gestos sem ação nenhuma registrada —
 * `Alt` + clique na régua, `M` com o foco na faixa, botão direito no losango,
 * `Ctrl` + arrastar no Criar osso. Não havia o que pôr num menu, porque não
 * havia função: havia um `if` no meio de um manipulador de evento.
 *
 * Sem DOM. A lista de ações registradas sai do **código-fonte**, para ela não
 * poder envelhecer.
 */
const SRC = resolve(__dirname, '../src');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else if (full.endsWith('.ts')) out.push(full);
  }
  return out;
}

/** Toda ação que o programa registra, lida do código-fonte. */
function registeredActions(): string[] {
  const ids = new Set<string>();
  for (const file of walk(SRC)) {
    const text = readFileSync(file, 'utf8');
    for (const m of text.matchAll(/registerAction\('([^']+)'/g)) ids.add(m[1]!);
    // O `shell.ts` registra por um ajudante chamado `add(id, () => …)`. O
    // ponto antes do nome é recusado, senão `classList.add('alt')` entraria.
    for (const m of text.matchAll(/(?<![.\w])add\('([^']+)'\s*,\s*\(/g)) ids.add(m[1]!);
  }
  return [...ids];
}

function state(): MenuState {
  return {
    canRepack: false, canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
    view: viewMenuState(), lockBones: false, lockDrawings: false, space: 'local',
    compensation: { children: false, drawings: false, boxes: false },
    animating: true, loop: false, open: {},
  };
}

function menus(): MenuGroupDef[] {
  return allMenus(state());
}

// ---------------------------------------------------------------------------
// A auditoria
// ---------------------------------------------------------------------------

describe('anotação 15 — nenhuma função sem porta', () => {
  it('toda ação registrada aparece em menu, na barra ou no botão direito', () => {
    const sobraram = hiddenFunctions(
      registeredActions(), menus(), actionBarItems(getTools()),
    );
    expect(sobraram.map((h) => h.action)).toEqual([]);
  });

  it('a lista de dispensadas explica cada uma', () => {
    expect(EXEMPT.length).toBeGreaterThan(0);
    for (const item of EXEMPT) {
      expect(item.why.length, item.action).toBeGreaterThan(20);
    }
  });

  it('o que está no botão direito está mesmo no código do painel', () => {
    const arvore = readFileSync(resolve(SRC, 'panels/tree.ts'), 'utf8');
    for (const item of CONTEXT_ACTIONS) {
      expect(arvore, `${item.action} não está no menu da Árvore`).toContain(`'${item.action}'`);
    }
    // E a Árvore tem mesmo um menu de botão direito. Desde o lote 60 ele é o
    // menu flutuante único (`ui/floating-menu.ts`), e não um `arvore-menu` próprio.
    expect(arvore).toContain('contextmenu');
    expect(arvore).toContain('openFloatingMenu');
  });
});

// ---------------------------------------------------------------------------
// As portas novas, uma a uma
// ---------------------------------------------------------------------------

describe('anotação 15 — cada gesto escondido ganhou uma porta', () => {
  const acoes = new Set(menus().flatMap((g) => flatEntries(g.entries)).map((e) => e.action));

  it('a: o trecho de laço tem menu, e não só Alt + clique', () => {
    expect(acoes.has('laco-inicio')).toBe(true);
    expect(acoes.has('laco-fim')).toBe(true);
    // "Tirar" já tinha porta: havia como desfazer o que não havia como fazer.
    expect(acoes.has('tirar-trecho')).toBe(true);
    expect(hasIcon('bracket-open')).toBe(true);
    expect(hasIcon('bracket-close')).toBe(true);
  });

  it('b: as marcas têm menu, e não só a tecla M', () => {
    expect(acoes.has('nova-marca')).toBe(true);
    expect(acoes.has('marca-anterior')).toBe(true);
    expect(acoes.has('marca-seguinte')).toBe(true);
    expect(hasIcon('marker')).toBe(true);
  });

  it('b: renomear a marca não usa mais o prompt do navegador', () => {
    const fonte = readFileSync(resolve(SRC, 'panels/dopesheet.ts'), 'utf8');
    expect(fonte).not.toContain("globalThis.prompt?.('Nome da marca:'");
    expect(fonte).toContain("title: 'Nome da marca'");
  });

  it('d: Criar osso diz no rodapé o que Ctrl e Alt fazem', () => {
    expect(toolFooter('create-bone', true)).toBe(CREATE_BONE_FOOTER);
    expect(CREATE_BONE_FOOTER).toContain('Ctrl');
    expect(CREATE_BONE_FOOTER).toContain('Alt');
  });

  // Lote 63a: a lista saiu. O Humberto: "ISSO NÃO TEM NO SPRITER". O item do
  // menu ficou como porta, e só diz a frase do P.
  it('e: "Virar filho de…" não abre mais lista: o P é um gesto só', () => {
    const fonte = readFileSync(resolve(SRC, 'viewport/viewport.ts'), 'utf8');
    expect(fonte).not.toContain('askPick');
    expect(fonte).not.toContain('Virar filho de qual osso?');
    // Rodada 17, J2: sem um osso só, o recado diz o filho escolhido (o mesmo do P).
    expect(fonte).toContain('chooseBoneNotice(childInSelection(doc.selection))');
  });

  it('f: a palavra "âncora" saiu dos nomes de menu', () => {
    const nomes = menus().flatMap((g) => flatEntries(g.entries)).map((e) => e.label);
    expect(nomes.some((nome) => nome.toLowerCase().includes('âncora'))).toBe(false);
    expect(nomes).toContain('Copiar posição no osso');
    expect(nomes).toContain('Colar posição no osso');
  });

  it('g: a curva da chave saiu do cinza e virou menu de verdade', () => {
    const animacao = menus().find((g) => g.label === 'Animação');
    const entradas = flatEntries(animacao?.entries ?? []);
    for (const acao of ['interp-linear', 'interp-suave', 'interp-parada', 'interp-curva']) {
      const entrada = entradas.find((e) => e.action === acao);
      expect(entrada, acao).toBeDefined();
      // Cinza por falta de animação aberta, e não por "vem no lote 12".
      expect(entrada?.hint ?? '', acao).not.toContain('lote 12');
    }
    expect(menus().flatMap((g) => flatEntries(g.entries)).map((e) => e.label))
      .toContain('Curva da chave');
  });

  it('g: o losango diz os gestos na dica — agora os cinco', () => {
    // Reescrito no degrau 6 (17/09/2026). O teste antigo procurava a frase
    // `'Botão direito: curva · Duplo clique: apagar'` dentro de
    // `panels/dopesheet.ts`. Duas coisas mudaram, e as duas de propósito:
    //
    //  - a dica virou DADO, em `panels/dopesheet-model.ts` (`KEY_HINT`), como
    //    o resto do que a folha escreve na tela — a fonte do painel já não
    //    carrega a frase;
    //  - ela ganhou o gesto que faltava e que mais se usa: **com várias
    //    chaves escolhidas, arrastar uma leva todas**, e as teclas que escolhem
    //    (`Ctrl` soma, `Shift` tira). Era o único gesto da folha capaz de
    //    surpreender sem nada na tela explicando por quê (regra 21).
    //
    // A anotação 15 do Humberto continua atendida, e com mais do que ela
    // pedia: nenhum dos cinco gestos do losango é adivinhação.
    for (const gesto of ['Arrastar move as escolhidas', 'Ctrl soma', 'Shift tira',
      'clona', 'Botão direito: curva', 'Duplo clique: apagar']) {
      expect(KEY_HINT, gesto).toContain(gesto);
    }
    // E a dica chega mesmo ao losango: o painel a lê de lá, não a reescreve.
    // Rodada 40, lote 1: ela é a SEGUNDA linha; a primeira diz o que a chave é
    // (tempo, valor com unidade, curva — `keyTitle`).
    const fonte = readFileSync(resolve(SRC, 'panels/dopesheet.ts'), 'utf8');
    expect(fonte).toContain('node.title = `${oQue}\\n${KEY_HINT}`;');
  });

  it('j: a aba Malha e pesos não some mais', () => {
    expect(Object.keys(TOOL_PANELS)).toEqual([]);
  });

  it('k: "Novo → Regra" abre a janela guiada, e não cinco tipos às cegas', () => {
    expect(acoes.has('nova-regra-guiada')).toBe(true);
    // Os cinco itens que criavam adivinhando saíram do menu.
    for (const acao of ['nova-regra-ik', 'nova-regra-transform', 'nova-regra-path']) {
      expect(acoes.has(acao), acao).toBe(false);
    }
    const arvore = readFileSync(resolve(SRC, 'panels/tree.ts'), 'utf8');
    expect(arvore).toContain("runAction('nova-regra-guiada')");
  });
});

// ---------------------------------------------------------------------------
// As três menores
// ---------------------------------------------------------------------------

describe('anotação 15 — as três menores', () => {
  it('Shift+Delete está escrita ao lado do item', () => {
    const entrada = menus()
      .flatMap((g) => flatEntries(g.entries))
      .find((e) => e.action === 'apagar-linhas');
    expect(entrada?.shortcut).toBe('Shift+Delete');
  });

  it('o botão direito na cena se explica na primeira vez', () => {
    expect(TOOL_BACK_NOTICE).toContain('Botão direito');
    expect(TOOL_BACK_NOTICE).toContain('ferramenta de antes');
  });

  it('Imagem de referência ganhou botão na barra', () => {
    const naBarra = actionBarItems(getTools());
    const botao = naBarra.find((i) => i.actionId === 'imagem-referencia');
    expect(botao).toBeDefined();
    expect(botao?.icon).not.toBe('');
    expect(hasIcon(botao?.icon ?? '')).toBe(true);
    // E o item do menu continua: nada some.
    expect(menus().flatMap((g) => flatEntries(g.entries)).map((e) => e.action))
      .toContain('imagem-referencia');
  });
});
});

// ---------------------------------------------------------------------------
// Arranjos com nome — degrau 11, lote 4 (18/09/2026), C6
// ---------------------------------------------------------------------------

describe('arranjos com nome no menu Janela', () => {
  const PAINEIS = [
    'arvore', 'ordem', 'propriedades', 'imagens', 'entidades', 'pivos',
    'animacoes', 'peles', 'regras', 'historico', 'exibicao', 'previa', 'malha',
  ];

  it('os dois de fábrica existem, com nome e com dica', () => {
    const fabrica = factoryArrangements();
    expect(fabrica.map((item) => item.name)).toEqual(['Pivô', 'Visualização']);
    expect(fabrica.map((item) => item.id)).toEqual(['arranjo-pivo', 'arranjo-visualizacao']);
    for (const item of fabrica) {
      expect(item.factory, item.name).toBe(true);
      expect(arrangementHint(item.id).length, item.name).toBeGreaterThan(20);
    }
  });

  it('o arranjo Pivô põe a grade dos pivôs grande, e o Visualização põe a Prévia', () => {
    const pivo = layoutOf('arranjo-pivo', PAINEIS)!;
    expect(pivo.right.groups[0]).toEqual(['pivos', 'imagens']);
    expect(pivo.right.active[0]).toBe('pivos');
    // A coluna dos pivôs é mais larga que a de fábrica: é a grade que se olha.
    expect(pivo.widths[1]).toBeGreaterThan(DEFAULT_WIDTH);
    const ver = layoutOf('arranjo-visualizacao', PAINEIS)!;
    expect(ver.right.groups[0]).toEqual(['previa']);
    expect(ver.right.groups[1]).toEqual(['animacoes', 'peles']);
  });

  it('nada some sem porta: o que o arranjo não cita fica FECHADO, e o menu Janela traz de volta', () => {
    const pivo = layoutOf('arranjo-pivo', PAINEIS)!;
    const naTela = new Set([...pivo.left.groups.flat(), ...pivo.right.groups.flat()]);
    const fechados = new Set(pivo.left.closed.map((item) => item.id));
    for (const id of PAINEIS) {
      expect(naTela.has(id) || fechados.has(id), id).toBe(true);
    }
    // E os dois painéis que a tarefa pede estão à vista.
    expect(naTela.has('pivos')).toBe(true);
    expect(naTela.has('imagens')).toBe(true);
  });

  it('o arranjo é receita, e não fotografia: painel que não existe é pulado', () => {
    const magro = layoutOf('arranjo-pivo', ['arvore', 'imagens'])!;
    expect(magro.right.groups.flat()).toEqual(['imagens']);
    expect(magro.left.groups.flat()).toEqual(['arvore']);
  });

  it('arranjo que não existe devolve null, e não uma tela inventada (regra 21)', () => {
    expect(layoutOf('arranjo-que-nao-ha', PAINEIS)).toBeNull();
    expect(layoutOf('arranjo-meu', PAINEIS, {})).toBeNull();
  });

  it('guardar com nome: entra na lista, e o nome vira o id', () => {
    expect(arrangementId('Pintar pesos')).toBe('arranjo-pintar-pesos');
    expect(arrangementId('Pivô')).toBe('arranjo-pivo');
    expect(arrangementId('   ')).toBe('arranjo-sem-nome');
    const r = saveArrangement({}, 'Pintar pesos', { left: {}, right: {} });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(savedList(r.arranjos).map((item) => item.name)).toEqual(['Pintar pesos']);
    expect(r.notice).toContain('guardado');
    // E o menu mostra os de fábrica primeiro, os guardados depois.
    expect(allArrangements(r.arranjos).map((item) => item.name))
      .toEqual(['Pivô', 'Visualização', 'Pintar pesos']);
  });

  it('nome repetido REGRAVA e diz isso; nome de fábrica é recusado com a razão', () => {
    const um = saveArrangement({}, 'Pintar pesos', { a: 1 });
    if (!um.ok) throw new Error(um.notice);
    const dois = saveArrangement(um.arranjos, 'Pintar pesos', { a: 2 });
    expect(dois.ok).toBe(true);
    if (dois.ok) {
      expect(Object.keys(dois.arranjos).length).toBe(1);
      expect(dois.notice).toContain('regravado');
    }
    const fabrica = saveArrangement({}, 'Pivô', { a: 1 });
    expect(fabrica.ok).toBe(false);
    if (!fabrica.ok) expect(fabrica.notice).toContain('de fábrica');
    const vazio = saveArrangement({}, '   ', { a: 1 });
    expect(vazio.ok).toBe(false);
  });

  it('há um teto de arranjos guardados, e ele avisa em vez de engolir', () => {
    let saved: Record<string, { name: string; layout: unknown }> = {};
    for (let i = 0; i < MAX_ARRANGEMENTS; i++) {
      const r = saveArrangement(saved, `Arranjo ${i}`, { i });
      if (!r.ok) throw new Error(r.notice);
      saved = { ...r.arranjos };
    }
    const demais = saveArrangement(saved, 'Mais um', { a: 1 });
    expect(demais.ok).toBe(false);
    if (!demais.ok) expect(demais.notice).toContain('Apague um');
    // Regravar um que já existe continua valendo mesmo no teto.
    expect(saveArrangement(saved, 'Arranjo 0', { novo: true }).ok).toBe(true);
  });

  it('apagar tira só os guardados; os de fábrica ficam', () => {
    const um = saveArrangement({}, 'Pintar pesos', { a: 1 });
    if (!um.ok) throw new Error(um.notice);
    const fora = deleteArrangement(um.arranjos, 'arranjo-pintar-pesos');
    expect(fora.ok).toBe(true);
    if (fora.ok) expect(Object.keys(fora.arranjos)).toEqual([]);
    const fabrica = deleteArrangement(um.arranjos, 'arranjo-pivo');
    expect(fabrica.ok).toBe(false);
    if (!fabrica.ok) expect(fabrica.notice).toContain('fábrica');
    expect(deleteArrangement({}, 'arranjo-sumido').ok).toBe(false);
  });

  it('o que estava gravado e não presta sai CONTADO, e nunca estoura', () => {
    const lido = parseArrangements({
      'arranjo-bom': { name: 'Bom', layout: { left: {} } },
      'arranjo-sem-nome-nenhum': { layout: {} },
      'sem-prefixo': { name: 'X', layout: {} },
      'arranjo-texto': 'nada disso',
    });
    expect(Object.keys(lido.arranjos)).toEqual(['arranjo-bom']);
    expect(lido.dropped).toBe(3);
    for (const lixo of [null, 'texto', 42, [1, 2]]) {
      expect(parseArrangements(lixo)).toEqual({ arranjos: {}, dropped: 0 });
    }
  });

  it('o arranjo guardado volta consertado contra os painéis de hoje', () => {
    const guardado = saveArrangement({}, 'Meu', {
      left: { groups: [['arvore', 'painel-que-sumiu'], ['propriedades']], active: ['arvore', 'propriedades'] },
      right: { groups: [['imagens'], ['animacoes']], active: ['imagens', 'animacoes'] },
      widths: [240, 300],
    });
    if (!guardado.ok) throw new Error(guardado.notice);
    const layout = layoutOf('arranjo-meu', PAINEIS, guardado.arranjos)!;
    expect(layout.left.groups.flat()).not.toContain('painel-que-sumiu');
    expect(layout.left.groups.flat()).toContain('arvore');
    expect(layout.widths).toEqual([240, 300]);
  });

  it('os arranjos moram na máquina, nunca no `.bone`', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/arrangements.ts'), 'utf8');
    expect(fonte).toContain("ARRANGEMENTS_KEY = 'RECORTE_arranjos'");
    expect(fonte).not.toContain('writeEditorState');
    expect(fonte).not.toMatch(/from '\.\.\/contract/);
  });

  it('o menu Janela mostra o submenu Arranjos, com os dois de fábrica e as duas portas', () => {
    const janela = allMenus(NEUTRAL_MENU_STATE).find((g) => g.label === 'Janela')!;
    const arranjos = flatEntries(janela.entries).find((e) => e.action === 'arranjos');
    expect(arranjos?.label).toBe('Arranjos');
    const dentro = (arranjos?.children ?? []).filter((item): item is MenuEntry => !('separator' in item));
    // Rodada 6: "Voltar ao padrão" entrou no submenu, por último — no
    // Photoshop o "Redefinir" mora dentro da Área de trabalho.
    // Rodada 4, lote 8 (05/10/2026), reescrito de propósito: os três contextos
    // (Montar · Animar · Pesos) entraram em cima, como as áreas de trabalho do
    // Photoshop. Os dois de fábrica e as portas continuam, na mesma ordem.
    expect(dentro.map((e) => e.action)).toEqual([
      'contexto-montar', 'contexto-animar', 'contexto-pesos',
      'arranjo-pivo', 'arranjo-visualizacao', 'guardar-arranjo', 'apagar-arranjo', 'layout-padrao',
    ]);
    for (const item of dentro) expect(item.enabled, item.action).toBe(true);
    // E fora do submenu ele não aparece de novo.
    expect(janela.entries.some((e) => !isSeparator(e) && e.action === 'layout-padrao')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// A Janela de Problemas — degrau 11, lote 6 (18/09/2026), regra 21 com tela
// ---------------------------------------------------------------------------

describe('a Janela de Problemas', () => {
  const fonte = readFileSync(resolve(__dirname, '../src/ui/problems-dialog.ts'), 'utf8');

  it('a conta do pé diz quantos problemas e quantos têm conserto', () => {
    expect(problemsSummary([])).toBe('Nenhum problema. O arquivo foi lido inteiro.');
    const semConserto = [{ text: 'a', pointer: null, target: null, fix: null }] as const;
    expect(problemsSummary(semConserto)).toContain('1 problema');
    expect(problemsSummary(semConserto)).toContain('na mão');
    const comConserto = [
      { text: 'a', pointer: '/x', target: null, fix: { label: 'Gravar o padrão', action: 'write-fallback', value: 'normal' } },
      { text: 'b', pointer: null, target: null, fix: null },
    ] as const;
    expect(problemsSummary(comConserto)).toBe('2 problemas, 1 com conserto aqui. O resto é na mão.');
  });

  it('o conserto tem nome escrito e uma frase que diz o que ele vai fazer', () => {
    expect(fixHint({ label: 'Trocar imagem…', action: 'swap-image' })).toContain('painel Imagens');
    const grava = fixHint({ label: 'Gravar o padrão', action: 'write-fallback', value: 'normal' });
    expect(grava).toContain('"normal"');
    expect(grava).toContain('no lugar do valor que ninguém conhece');
  });

  it('a janela mostra o texto por extenso, o Ir para e o conserto só onde há', () => {
    // Uma linha por problema, e os botões com PALAVRA — na tira do rodapé
    // eles eram ícones, e o nome do conserto só aparecia na dica.
    expect(fonte).toContain("el('div', { class: 'dialog-problema' })");
    expect(fonte).toContain('`Ir para ${onde}`');
    expect(fonte).toContain('text: fix.label');
    expect(fonte).toContain('if (row.fix !== null)');
  });

  it('a janela diz que nada foi adivinhado: é a regra 21 com tela', () => {
    expect(fonte).toContain('nunca um palpite silencioso no desenho');
    expect(fonte).toContain('Problemas do arquivo');
  });

  it('sem problema nenhum, ela diz isso em vez de abrir vazia', () => {
    expect(fonte).toContain('o arquivo foi lido inteiro, sem nenhum valor desconhecido');
  });

  it('duas portas: o botão do rodapé e Ajuda → Problemas do arquivo…', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('this.showProblems();');
    expect(casca).toContain('showProblemsDialog({');
    const ajuda = flatEntries(allMenus(NEUTRAL_MENU_STATE).find((g) => g.label === 'Ajuda')!.entries);
    const item = ajuda.find((e) => e.action === 'problemas');
    expect(item?.label).toBe('Problemas do arquivo…');
    expect(item?.enabled).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// O vigia que parte do COMANDO — 21/09/2026, plano
// `COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`, parte 1
// ---------------------------------------------------------------------------

/**
 * A auditoria de cima parte das **ações registradas**. Um comando que nunca
 * virou ação passa por baixo dela: tem teste verde, o relatório diz "feito", e
 * não há botão nenhum que o construa. A pesquisa de 18/09 achou seis assim.
 *
 * Aqui a régua está invertida: **todo `Command` do documento é construído pelo
 * programa, ou está em `EXEMPT_COMMANDS` com o motivo escrito.**
 *
 * As fontes saem do disco, como no `registeredActions()` acima, e por `src`
 * só — se `editor/testes` entrasse na conta, todo comando com teste verde
 * passaria por "usado", que é o engano inteiro.
 */
const RAIZ = resolve(__dirname, '../src');

function sourcesOfSrc(): Map<string, string> {
  const out = new Map<string, string>();
  const pilha = [RAIZ];
  while (pilha.length > 0) {
    const dir = pilha.pop()!;
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) pilha.push(full);
      else if (full.endsWith('.ts') && !full.endsWith('.d.ts')) {
        // A chave vai com `/`, no Windows também: o endereço que o relatório
        // imprime é o mesmo em qualquer máquina, e a linha de
        // EXEMPT_COMMANDS não passa a mentir por causa da barra.
        out.set(full.slice(RAIZ.length + 1).split(/[\\/]/).join('/'), readFileSync(full, 'utf8'));
      }
    }
  }
  return out;
}

describe('o vigia do comando sem porta — a régua invertida', () => {
  const fontes = sourcesOfSrc();

  it('todo comando do documento é construído pelo programa, ou tem motivo escrito', () => {
    const sobraram = commandsWithoutDoor(fontes);
    expect(sobraram.map((c) => `${c.command} (${c.where})`)).toEqual([]);
  });

  /**
   * **A prova de que ele acusa** — regra 26. Um teste que nunca se viu falhar
   * não é um teste.
   *
   * Com a lista de dispensados VAZIA, o vigia tem de ficar vermelho contra o
   * código de hoje, e com os nomes na cara. Os seis primeiros são os achados
   * da pesquisa de 18/09, que leu o código à mão: as duas contas bateram sem
   * uma olhar para a outra — e é isso que diz que a régua mede o que o nome
   * dela promete, e não outra coisa que também dá verde.
   *
   * **Rodada final (28/09):** cada achado que ganha porta sai desta lista, e
   * por isso o nome não diz mais "os seis" — diria um número que já não é o
   * da lista (regra 28). `DeleteTag` e `RenameTag` saíram no lote 1 do chat C; `SetRuleChain`, no lote 2; `KeyDriverTarget`, no lote 3;
   * `removeBodyKey`, no lote 2a do chat D.
   */
  it('com a lista vazia, ele acusa os achados da pesquisa de 18/09 que ainda estão sem porta', () => {
    const nus = commandsWithoutDoor(fontes, undefined, []).map((c) => c.command);
    for (const nome of [
      'ImportImagesCommand',
    ]) {
      expect(nus, `${nome} tinha de aparecer: é achado da pesquisa de 18/09`).toContain(nome);
    }
  });

  it('com a lista vazia, ele acusa também os restos antigos e os apelidos', () => {
    const nus = commandsWithoutDoor(fontes, undefined, []).map((c) => c.command);
    for (const nome of [
      'RemoveBone', 'RemoveSlot', 'RemoveAnimation', 'RenameNode',
      'ToggleSkinBone', 'ToggleSkinConstraint',
    ]) {
      expect(nus, nome).toContain(nome);
    }
  });

  /**
   * E ele acusa uma coisa **inventada agora**, num código de mentira. A prova
   * de cima mostra que ele pega os catorze de hoje; esta mostra que ele pega o
   * décimo quinto, o que alguém escrever no ano que vem.
   */
  it('num código de mentira, ele separa o comando usado do comando morto', () => {
    const falsas = new Map<string, string>([
      ['doc/inventado.ts', [
        "import type { Command } from '../contract.js';",
        'export class ComandoUsado implements Command {',
        "  readonly label = 'Usado';",
        '  apply(): void {}',
        '  revert(): void {}',
        '}',
        'export class ComandoMorto implements Command {',
        "  readonly label = 'Morto';",
        '  apply(): void {}',
        '  revert(): void {}',
        '}',
        'export class HerdeiroMorto extends ComandoMorto {',
        '  apply(): void {}',
        '}',
      ].join('\n')],
      ['panels/chama.ts', [
        "import { ComandoUsado } from '../doc/inventado.js';",
        'export function porta(): void { doc.run(new ComandoUsado()); }',
      ].join('\n')],
    ]);
    const nus = commandsWithoutDoor(falsas, undefined, []);
    expect(nus.map((c) => c.command).sort()).toEqual(['ComandoMorto', 'HerdeiroMorto']);
    // O que ficou tem endereço e regra: uma lista sem onde nem o que fazer
    // manda a pessoa procurar, e procurar é o que este vigia existe para evitar.
    expect(nus.find((c) => c.command === 'HerdeiroMorto')?.where).toBe('doc/inventado.ts:12');
    expect(nus.every((c) => c.regra.length > 20)).toBe(true);
  });

  it('a herança conta: quem estende um comando é um comando', () => {
    // `ImportImagesCommand` é `extends SnapshotCommand`, e não
    // `implements Command`. Uma régua que só olhasse o `implements` não o veria
    // — e ele é o sexto achado da pesquisa.
    const defs = commandDefs(fontes);
    const importar = defs.find((d) => d.name === 'ImportImagesCommand');
    expect(importar?.kind).toBe('classe');
    expect(importar?.file).toBe('io/import-images.ts');
  });

  it('o mutador entra pelo que ESCREVE, não por devolver dados', () => {
    const defs = commandDefs(fontes);
    // `removeBodyKey` escreve no `.bone`: é o quinto achado.
    expect(defs.find((d) => d.name === 'removeBodyKey')?.kind).toBe('mutador');
    // `bodyAt` e `hasTimeline` só leem, e ficam de fora — senão a lista viraria
    // um inventário de código morto, e o nome dela deixaria de dizer a verdade.
    expect(defs.some((d) => d.name === 'bodyAt')).toBe(false);
    expect(defs.some((d) => d.name === 'hasTimeline')).toBe(false);
  });

  it('a lista de dispensados explica cada um, e sem repetir o nome', () => {
    expect(EXEMPT_COMMANDS.length).toBeGreaterThan(0);
    for (const item of EXEMPT_COMMANDS) {
      expect(item.why.length, item.command).toBeGreaterThan(40);
      // Um motivo que só repete o nome do comando não é motivo.
      expect(item.why.replace(item.command, '').length, item.command).toBeGreaterThan(40);
    }
    expect(new Set(EXEMPT_COMMANDS.map((i) => i.command)).size).toBe(EXEMPT_COMMANDS.length);
  });

  /**
   * **A linha que venceu sai.** Um dispensado que já ganhou porta continuaria
   * na lista dizendo que não tem, e a lista passaria a mentir — que é o jeito
   * de uma lista de exceções apodrecer sem ninguém notar.
   */
  it('nenhum dispensado está na lista já tendo ganhado porta', () => {
    const nus = new Set(commandsWithoutDoor(fontes, undefined, []).map((c) => c.command));
    for (const item of EXEMPT_COMMANDS) {
      expect(nus.has(item.command), `${item.command} já tem porta: tire a linha de EXEMPT_COMMANDS`)
        .toBe(true);
    }
  });

  it('o vigia acha os comandos de verdade, e são muitos', () => {
    // Uma régua que achasse três comandos daria verde por não olhar. O número
    // exato não importa e sobe a cada lote; a ordem de grandeza importa.
    const defs = commandDefs(fontes);
    expect(defs.filter((d) => d.kind === 'classe').length).toBeGreaterThan(90);
    expect(defs.filter((d) => d.kind === 'fabrica').length).toBeGreaterThan(0);
    expect(defs.filter((d) => d.kind === 'mutador').length).toBeGreaterThan(50);
  });
});

// ---------------------------------------------------------------------------
// A paleta deixa de ser segredo — 22/09/2026, lote 2 do plano
// `COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`
// ---------------------------------------------------------------------------

/**
 * A busca de comandos existe desde o item 110: **Ajuda → Paleta de comandos**,
 * `Ctrl+Shift+P`. Ela ignora acento e filtra por pedaço do nome, e responde
 * exatamente a pergunta do Humberto — *"eu sei que existe, mas em qual menu
 * está?"*.
 *
 * **E ele não sabia que existia.** Porta que ninguém encontra é porta que não
 * conta, e é o que este lote conserta: sem código novo de busca, só tela.
 *
 * Nada aqui mede a busca em si — isso é dos testes do `filterCommands`. Aqui
 * se mede se **alguém perdido a encontra**.
 */
describe('a paleta deixa de ser segredo', () => {
  const ajuda = (): MenuEntry[] => flatEntries(
    allMenus(NEUTRAL_MENU_STATE).find((g) => g.label === 'Ajuda')!.entries,
  );

  it('a linha do menu diz o que ela faz, na língua de quem está perdido', () => {
    const item = ajuda().find((e) => e.action === 'paleta');
    expect(item?.label).toBe('Paleta de comandos');
    expect(item?.shortcut).toBe('Ctrl+Shift+P');
    // "Paleta de comandos" é palavra de programador. A dica é que carrega a
    // pergunta dele, com as palavras dele.
    expect(item?.hint).toContain('Sei que existe, mas em qual menu está?');
    // E diz as duas coisas que fazem a busca funcionar para quem tem pressa:
    // pedaço do nome basta, e acento não é preciso.
    expect(item?.hint).toContain('parte do nome');
    expect(item?.hint).toContain('sem acento');
  });

  it('a linha dos Atalhos avisa que a janela dela também procura', () => {
    const item = ajuda().find((e) => e.action === 'atalhos');
    expect(item?.hint).toContain('procurar um comando');
  });

  /**
   * **A segunda porta.** A janela Ajuda → Atalhos é onde para quem procura
   * *onde fica* uma coisa: corre a lista com o olho, não acha o nome, e fica
   * sem saída. O botão põe a paleta a um clique dali.
   *
   * Lido do código-fonte, como os outros testes de janela deste arquivo: não
   * há navegador aqui, e uma janela montada à mão num teste não provaria que é
   * ESTA que o programa abre.
   */
  it('a janela dos Atalhos tem o botão de procurar, e ele é o MESMO id', () => {
    const fonte = readFileSync(resolve(RAIZ, 'ui/keys-dialog.ts'), 'utf8');
    expect(fonte).toContain("text: 'Procurar um comando…'");
    // Id de ação nenhum foi criado: é o `paleta` do menu Ajuda, e é por isso
    // que o `hiddenFunctions` continua achando uma porta só para ela.
    expect(fonte).toContain("runAction('paleta')");
    expect(fonte).toContain('[resetAll, findCommand, closeButton]');
  });

  it('a janela fecha ANTES de abrir a paleta: uma modal de cada vez', () => {
    const fonte = readFileSync(resolve(RAIZ, 'ui/keys-dialog.ts'), 'utf8');
    // Duas janelas modais empilhadas tirariam o `Esc` de dono.
    // `lastIndexOf`: a primeira aparição do nome está no cabeçalho, que
    // EXPLICA a chamada. O que se mede é a chamada de verdade, a última.
    const i = fonte.lastIndexOf("runAction('paleta')");
    const antes = fonte.slice(0, i);
    expect(antes.lastIndexOf('close();')).toBeGreaterThan(antes.lastIndexOf('findCommand.addEventListener'));
  });

  it('sem a ação registrada, o botão DIZ onde ela está (regra 21)', () => {
    // Uma aba fechada, um teste sem casca: o clique não pode fechar calado
    // sem ter feito nada. Ele diz o caminho e a tecla.
    const fonte = readFileSync(resolve(RAIZ, 'ui/keys-dialog.ts'), 'utf8');
    expect(fonte).toContain("hasAction('paleta')");
    expect(fonte).toContain('Ajuda → Paleta de comandos, ou Ctrl+Shift+P');
  });

  it('o texto de cima da janela manda procurar quando a lista não bastou', () => {
    const fonte = readFileSync(resolve(RAIZ, 'ui/keys-dialog.ts'), 'utf8');
    expect(fonte).toContain('Não achou o que procurava aqui?');
  });

  /**
   * A paleta tem de se achar **nela mesma**: quem digita "paleta", "comando"
   * ou "procurar" sem acento chega nela. É a prova de que a porta que ensina a
   * usar a porta está lá dentro — e sai do `filterCommands` de verdade, não de
   * uma lista escrita à mão.
   */
  it('a própria paleta se acha, e os Atalhos também', () => {
    const menus = allMenus(NEUTRAL_MENU_STATE);
    for (const digitado of ['paleta', 'comandos', 'PALETA']) {
      expect(filterCommands(menus, digitado).map((c) => c.action), digitado)
        .toContain('paleta');
    }
    expect(filterCommands(menus, 'atalho').map((c) => c.action)).toContain('atalhos');
  });

  /**
   * **A dica de um item LIGADO chega à tela.**
   *
   * Até 22/09 ela não chegava: o `whyDisabled` da casca devolve `null` para um
   * item vivo, e o `title` caía na linha que escreve só o nome e a tecla.
   * **Toda dica de item ligado estava escrita e invisível** — a de "Problemas
   * do arquivo…" desde o degrau 11, e a da Paleta assim que foi escrita.
   *
   * Achado ao ir FOTOGRAFAR a dica nova e não a encontrar na tela. Uma dica
   * que ninguém lê é uma porta que ninguém encontra, com uma volta a mais.
   */
  it('a casca põe a dica no title de um item ligado, e não só nos cinzas', () => {
    const casca = readFileSync(resolve(RAIZ, 'ui/shell.ts'), 'utf8');
    expect(casca).toContain('} else if (item.hint !== undefined) {');
    expect(casca).toContain('button.title = `${item.hint}${tecla}`;');
    // A tecla continua junto: quem lê a dica duas vezes devia usar a tecla.
    expect(casca).toContain('const tecla = item.shortcut === undefined');
  });

  it('e os outros itens com dica ligada ganham junto', () => {
    // "Problemas do arquivo…" tinha dica desde o degrau 11 e ela nunca apareceu.
    const item = flatEntries(
      allMenus(NEUTRAL_MENU_STATE).find((g) => g.label === 'Ajuda')!.entries,
    ).find((e) => e.action === 'problemas');
    expect(item?.enabled).toBe(true);
    expect(item?.hint).toContain('O que o programa não entendeu');
  });
});

// ---------------------------------------------------------------------------
// A porta que engole o clique — a terceira régua, provada SÓ em código de
// mentira — 22/09/2026
// ---------------------------------------------------------------------------

/**
 * **Nada aqui mede o código de verdade, e é de propósito.**
 *
 * O outro chat está mexendo em `shell-actions.ts`, `register-actions.ts` e
 * `panels/rules*` neste minuto. Medir chão em movimento é o que a regra 24
 * proíbe — e pior, os casos conhecidos desta régua são justamente os que ele
 * está consertando: ela nasceria **verde** por o defeito ter acabado de sair.
 *
 * > Uma régua que nasce verde porque o defeito acabou de ser consertado é uma
 * > régua que ninguém viu funcionar.
 *
 * Então ela se prova primeiro contra **código de mentira**, que não depende do
 * chão de ninguém: quatro arquivos, um por forma, e a exigência de que ela
 * acuse **só os dois que apertam e calam** — cada um com o seu tipo.
 *
 * Quando o chão parar, ela roda contra `editor/src` e a lista que sair vai
 * para o `EXEMPT_CALLS` ou para o conserto. O desenho está em
 * `documentos/planos/A PORTA QUE ENGOLE O CLIQUE 2026-09-22.md`.
 */
describe('a porta que engole o clique — provada em código de mentira', () => {
  /** A quebra de linha, fora das aspas: um literal com barra invertida aqui
   * atravessa três camadas de ferramenta e chega torto. */
  const NL = String.fromCharCode(10);
  /** As quatro formas, uma por arquivo. */
  const FORMAS = new Map<string, string>([
    // 1. Pergunta antes, e DIZ. É o desenho da paleta e da janela de Atalhos.
    ['panels/pergunta.ts', [
      'export function abrir(doc) {',
      "  if (!hasAction('nova-regra')) {",
      "    doc.notice('A aba Regras está fechada; abra-a para usar isto');",
      '    return;',
      '  }',
      "  runAction('nova-regra');",
      '}',
    ].join('\n')],

    // 2. Olha depois, e DIZ.
    ['panels/olha-e-diz.ts', [
      'export function abrir(doc) {',
      "  if (!runAction('nova-pele')) {",
      "    doc.notice('A aba Peles está fechada; abra-a para usar isto');",
      '  }',
      '}',
    ].join('\n')],

    // 3. Olha depois, e CALA. Melhor que largar, e ainda mudo.
    ['panels/olha-e-cala.ts', [
      'export function abrir() {',
      "  if (!runAction('nova-marca')) return;",
      '}',
    ].join('\n')],

    // 4. Larga o `false`. O dedo aperta e o programa cala.
    ['panels/larga.ts', [
      'export function abrir() {',
      "  runAction('nova-regra-guiada');",
      '}',
    ].join('\n')],
  ]);

  it('ela acusa SÓ os dois que calam, e cada um com o seu tipo', () => {
    const achados = swallowedClicks(FORMAS, []);
    expect(achados.map((c) => `${c.file}:${c.line}`)).toEqual([
      'panels/larga.ts:2', 'panels/olha-e-cala.ts:2',
    ]);
    expect(achados.map((c) => c.fault)).toEqual(['engole', 'olha-e-cala']);
    // E diz de QUE ação se trata: uma lista sem o nome manda a pessoa procurar.
    expect(achados.map((c) => c.action)).toEqual(['nova-regra-guiada', 'nova-marca']);
    for (const c of achados) expect(c.regra.length).toBeGreaterThan(40);
  });

  /**
   * **E a fala é o que decide entre os dois inocentes e os dois culpados.**
   *
   * Os dois arquivos que passam acima passam por **dizerem** alguma coisa. Se
   * a única diferença for tirada — a mesma linha, sem o `notice` —, o arquivo
   * tem de passar a ser acusado, e como `olha-e-cala`.
   *
   * Sem esta prova, o verde de cima seria explicável e não diria o que o nome
   * dele promete: eu saberia que a régua separa quatro arquivos, e não **por
   * quê** ela os separa. É a regra 28 — *"por que este verde é explicável?" e
   * "o que este verde prova?" são perguntas diferentes*.
   */
  it('tire a fala do que passa, e ele passa a ser acusado', () => {
    const mudo = new Map<string, string>([['panels/olha-e-diz.ts', [
      'export function abrir(doc) {',
      "  if (!runAction('nova-pele')) {",
      '  }',
      '}',
    ].join('\n')]]);
    const achados = swallowedClicks(mudo, []);
    expect(achados.map((c) => c.fault)).toEqual(['olha-e-cala']);
    // E o mesmo arquivo COM a fala continua passando: a diferença é a fala, e
    // não outra coisa que mudou junto.
    expect(swallowedClicks(
      new Map([['panels/olha-e-diz.ts', FORMAS.get('panels/olha-e-diz.ts')!]]), [],
    )).toEqual([]);
  });

  /**
   * **Perguntar de um e rodar outro.** Uma régua frouxa veria o `hasAction` na
   * vizinhança e absolveria — e o clique continuaria sendo engolido, com um
   * guarda que olha para o lado errado. É a forma do erro que já nos custou
   * uma lista hoje: *olhar metade*.
   */
  it('perguntar de UMA ação e rodar OUTRA não absolve', () => {
    const torto = new Map<string, string>([['panels/torto.ts', [
      'export function abrir(doc) {',
      "  if (!hasAction('nova-pele')) {",
      "    doc.notice('A aba Peles está fechada');",
      '    return;',
      '  }',
      "  runAction('nova-regra');",
      '}',
    ].join('\n')]]);
    const achados = swallowedClicks(torto, []);
    expect(achados.map((c) => c.action)).toEqual(['nova-regra']);
    expect(achados[0]?.fault).toBe('engole');
  });

  /**
   * **O próximo**, o que ninguém escreveu ainda: um caminho novo, inventado
   * aqui, com o id vindo de uma variável em vez de escrito na linha. É como o
   * menu flutuante da Árvore chama — `run: () => runAction(acao)` — e é onde a
   * régua tinha mais chance de cegar.
   */
  it('acusa o caminho novo, mesmo sem o id escrito na linha', () => {
    const novo = new Map<string, string>([['panels/novo.ts', [
      'export function montar(itens) {',
      '  for (const item of itens) {',
      '    botao(item.label, () => runAction(item.acao));',
      '  }',
      '}',
    ].join('\n')]]);
    const achados = swallowedClicks(novo, []);
    expect(achados.map((c) => c.fault)).toEqual(['engole']);
    expect(achados[0]?.action).toBe(null);
    expect(achados[0]?.line).toBe(3);
  });

  it('a lista de dispensados perdoa pelo lugar, e o teste exige o motivo', () => {
    const achados = swallowedClicks(FORMAS, [
      { where: 'panels/larga.ts:2', why: 'de mentira: existe só para provar que o perdão funciona pelo lugar' },
    ]);
    expect(achados.map((c) => c.file)).toEqual(['panels/olha-e-cala.ts']);
    for (const item of EXEMPT_CALLS) {
      expect(item.why.length, item.where).toBeGreaterThan(40);
      expect(item.where, item.where).toMatch(/^[\w./-]+:\d+$/);
    }
  });

  /**
   * **Comentário não é código** — achado ao MEDIR, em 22/09.
   *
   * A primeira passada contra `editor/src` acusou três lugares que não apertam
   * coisa nenhuma: o texto de `ui/actions.ts` que **explica** o registro, o
   * cabeçalho de `ui/keys-dialog.ts` que explica o botão da paleta, e a
   * **própria declaração** de `runAction`.
   *
   * A forma, para quem escrever a próxima régua: **eu li o texto que fala do
   * código como se fosse o código.** Um medidor que varre fonte tem de saber o
   * que é comentário e o que é comando — senão acusa a documentação de fazer o
   * que ela só descreve. E uma lista com três inocentes dentro ensina a
   * desconfiar da própria lista.
   */
  it('não acusa o que está em comentário, nem a declaração do runAction', () => {
    const texto = new Map<string, string>([['ui/actions.ts', [
      '/**',
      " * O menu só pede `runAction('chavear')` sem saber de onde a função veio.",
      ' */',
      'export function runAction(id) {',
      '  return false;',
      '}',
      "// runAction('comentado') também não conta",
      'export function porta() {',
      "  runAction('de-verdade');",
      '}',
    ].join(NL)]]);
    const achados = swallowedClicks(texto, []);
    expect(achados.map((c) => c.action)).toEqual(['de-verdade']);
    expect(achados[0]?.line).toBe(9);
  });

  it('e uma barra dupla dentro de aspas não come o resto do arquivo', () => {
    // `stripComments` pula texto entre aspas inteiro. Sem isso, um endereço
    // com `//` apagaria daí para baixo — e o arquivo ficaria limpo por
    // engano, que é o verde mais perigoso de todos.
    const comEndereco = new Map<string, string>([['panels/x.ts', [
      "const doc = 'https://exemplo/nao-e-comentario';",
      "runAction('depois-do-endereco');",
    ].join(NL)]]);
    expect(swallowedClicks(comEndereco, []).map((c) => c.action))
      .toEqual(['depois-do-endereco']);
  });

  /**
   * **A régua não se mede junto com o que mede.** Este arquivo e os dois vigias
   * irmãos escrevem `runAction` dezenas de vezes, em texto que os EXPLICA. Sem
   * a linha que os tira da varredura, eles se acusariam.
   *
   * É a mesma armadilha de 22/09, do outro lado: lá o instrumento se media e
   * dava **verde**; aqui daria **vermelho**. A forma é a mesma, e é ela que se
   * guarda — *todo instrumento que se mede junto com o que mede dá um número
   * errado.*
   */
  it('as três réguas não se acusam umas às outras', () => {
    const reguas = new Map<string, string>([
      ['ui/call-audit.ts', "runAction('x'); runAction('y');"],
      ['ui/command-audit.ts', "runAction('x');"],
      ['ui/action-audit.ts', "runAction('x');"],
      ['panels/de-verdade.ts', "runAction('x');"],
    ]);
    expect(swallowedClicks(reguas, []).map((c) => c.file)).toEqual(['panels/de-verdade.ts']);
  });
});

// ---------------------------------------------------------------------------
// A paleta passa a ler as DICAS — 22/09/2026, 01:10
// ---------------------------------------------------------------------------

/**
 * **A metade de graça de uma coisa cara.**
 *
 * A parte 2 do plano `COMO SABER O QUE O PROGRAMA TEM` é uma folha *"por
 * tarefa, na língua dele"*, e o caro dela é a coluna 1: dar nome de tarefa a
 * cada ação. **Metade dessa coluna já está escrita e ninguém a lia** — são as
 * 55 dicas dos menus, todas em português de quem usa.
 *
 * A pergunta que uma pessoa faz não é *"onde está o Duplicar?"*. É *"como eu
 * faço uma cópia com os filhos junto?"* — e o nome do comando é justamente o
 * que ela não sabe. Até hoje a paleta só achava por esse nome.
 *
 * Achado pelo chat da folha por tarefa, ao medir o `filterCommands`. Nenhuma
 * lista nova e nenhum cadastro: a dica já estava lá.
 */
describe('a paleta acha pela dica, e não só pelo nome do comando', () => {
  const menus = (): MenuGroupDef[] => allMenus(NEUTRAL_MENU_STATE);

  /**
   * **A prova pela pinça** (regra 26 e 28). Não basta mostrar que a busca acha:
   * é preciso mostrar que acha **por causa da dica**, e não por outro motivo
   * que também daria verde.
   *
   * Então a mesma busca corre duas vezes sobre o mesmo menu — uma com a dica,
   * outra sem — e exige-se que ela ache na primeira e **não ache na segunda**.
   * É o vermelho de ontem, guardado onde ele não se perde.
   */
  it('a palavra que SÓ existe na dica acha o comando — e sem ela, não acha', () => {
    const comDica: MenuGroupDef[] = [{
      label: 'Esqueleto',
      entries: [{
        label: 'Duplicar',
        action: 'duplicar',
        enabled: true,
        hint: 'O osso escolhido, todos os descendentes e os desenhos deles',
      }],
    }];
    const semDica: MenuGroupDef[] = [{
      label: 'Esqueleto',
      entries: [{ label: 'Duplicar', action: 'duplicar', enabled: true }],
    }];

    // "descendentes" não está no nome do comando nem no nome do menu.
    expect(filterCommands(comDica, 'descendentes').map((c) => c.action)).toEqual(['duplicar']);
    expect(filterCommands(semDica, 'descendentes')).toEqual([]);
    // E o nome continua achando, com dica ou sem: nada foi trocado por isto.
    expect(filterCommands(semDica, 'duplicar').map((c) => c.action)).toEqual(['duplicar']);
  });

  it('nos menus de verdade, uma palavra de dica acha o comando', () => {
    // "zipa" só aparece na dica de Salvar como pacote.
    const achados = filterCommands(menus(), 'zipa');
    expect(achados.length).toBeGreaterThan(0);
    expect(achados.map((c) => c.label).join(' ')).toContain('pacote');
  });

  it('sem acento, como o resto da paleta: o `fold` vale para a dica também', () => {
    // A dica do Duplicar tem "descendentes"; a de outro item tem "animação".
    expect(filterCommands(menus(), 'animacao').length).toBeGreaterThan(0);
  });

  /**
   * **A dica chega à TELA, e não só à busca.**
   *
   * Se ela não aparecesse, a pessoa digitaria uma palavra, o comando surgiria,
   * e ela não veria **por que**. É a regra 21 pelo avesso: não é o programa
   * adivinhando — é ele acertando e não contando por quê.
   */
  it('a linha da paleta mostra a dica ao lado do menu', () => {
    const fonte = readFileSync(resolve(RAIZ, 'ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('`${command.menu} · ${command.hint}`');
    // E quem não tem dica continua mostrando só o menu, sem um ponto solto.
    expect(fonte).toContain('command.hint === null ? command.menu');
  });

  it('a busca carrega a dica junto, para a tela ter o que mostrar', () => {
    const comDica = filterCommands(menus(), 'zipa')[0];
    expect(comDica?.hint).toContain('Zipa o projeto');
  });
});

// ---------------------------------------------------------------------------
// a4 — No fim ▸, no menu Animação, logo depois de Repetir (29/09/2026)
// ---------------------------------------------------------------------------

describe('No fim ▸ no menu Animação (a4)', () => {
  const menu = animationMenu({ animating: true, loop: false });
  const pai = menu.find((item): item is MenuEntry => 'action' in item && item.action === 'no-fim');
  /** As entradas DE DENTRO do submenu: o nome diz "No fim ▸", o teste olha lá. */
  const dentro = flatEntries(pai?.children ?? []);

  it('mora em Animação, no nível de cima, logo depois de Repetir', () => {
    const acoes = menu.map((item) => ('action' in item ? item.action : '‖'));
    expect(pai?.label).toBe('No fim');
    expect(acoes.indexOf('no-fim')).toBe(acoes.indexOf('repetir') + 1);
  });

  it('dentro dele, os cinco modos do tocador, na ordem do tocador', () => {
    expect(dentro.map((e) => e.action)).toEqual(
      ['fim-arquivo', 'fim-parar', 'fim-repetir', 'fim-vai-e-volta', 'fim-voltar'],
    );
  });

  it('um nome só nos dois lugares: o rótulo de cada um é o do END_MODES', () => {
    expect(dentro.map((e) => e.label)).toEqual(END_MODES.map((modo) => modo.label));
    expect(dentro.map((e) => e.action)).toEqual(END_MODES.map((modo) => `fim-${modo.value}`));
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, lote 3: o item cinza que sabe por quê diz no rodapé
// ---------------------------------------------------------------------------

describe('rodada 17: o item cinza com motivo, clicado, diz o motivo no rodapé', () => {
  it('cinza com motivo fala; vivo roda; cinza sem motivo fica mudo e disabled', () => {
    expect(greyItemSays(false, 'hitbox não mostra uma imagem: só imagem vira slot'))
      .toBe('hitbox não mostra uma imagem: só imagem vira slot');
    expect(greyItemSays(true, null)).toBeNull();
    expect(greyItemSays(false, null)).toBeNull();
    expect(greyItemSays(false, '  ')).toBeNull();
  });

  it('a casca liga: o botão não fica disabled, e o clique escreve o motivo em vez de rodar', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('disabled: !enabled && falaNoRodape === null,');
    expect(casca).toContain('this.doc.notice(falaNoRodape);');
    const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
    expect(css).toContain('.menu-item.menu-item-cinza {');
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, J11: o texto cita o menu pelo nome que o menu tem
// ---------------------------------------------------------------------------

describe('rodada 17, J11: nenhum texto manda para "Arquivo → Abrir pasta…" (o item se chama "Abrir pasta do projeto…")', () => {
  it('o item existe com o nome novo, e nenhum texto do editor cita o velho', () => {
    const menuFonte = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');
    expect(menuFonte).toContain("label: 'Abrir pasta do projeto…',");
    expect(menuFonte).not.toContain("label: 'Abrir pasta…'");
    const raiz = resolve(__dirname, '../src');
    const achados: string[] = [];
    const varrer = (pasta: string): void => {
      for (const nome of readdirSync(pasta)) {
        const caminho = join(pasta, nome);
        if (statSync(caminho).isDirectory()) { varrer(caminho); continue; }
        if (!nome.endsWith('.ts')) continue;
        const texto = readFileSync(caminho, 'utf8');
        for (const m of texto.matchAll(/Arquivo → Abrir pasta…/g)) {
          const linha = texto.slice(texto.lastIndexOf('\n', m.index) + 1, texto.indexOf('\n', m.index));
          // Comentário pode contar a história; texto que a pessoa lê, não.
          if (/^\s*(\*|\/\/)/.test(linha)) continue;
          achados.push(`${caminho}: ${linha.trim()}`);
        }
      }
    };
    varrer(raiz);
    expect(achados).toEqual([]);
  });
});

// Rodada 47, lote 5 (nota do doc 54)
describe('rodada 47, lote 5: o Colar espelhado mora ao lado do Colar', () => {
  it('no menu Editar, logo depois de Colar; e saiu do submenu Pose', async () => {
    const { editMenu } = await import('../src/ui/menus.js');
    const itens = editMenu({ canUndo: false, canRedo: false, undoLabel: null, redoLabel: null, animating: true } as never);
    const rotulos = itens.map((i) => ('label' in i ? i.label : '—'));
    expect(rotulos[rotulos.indexOf('Colar') + 1]).toBe('Colar espelhado');
    const pose = itens.find((i) => 'label' in i && i.label === 'Pose') as { children?: Array<{ label?: string }> };
    expect((pose.children ?? []).map((c) => c.label)).not.toContain('Colar espelhado');
  });
});

// ---------------------------------------------------------------------------
// O dicionário da tela — noite de 05/11/2026
// ---------------------------------------------------------------------------

import { DICIONARIO, ESPERANDO, esperando, jargaoNaFrase, jargaoNoNome } from '../src/ui/jargao.js';
import { ACTION_TABLE as TABELA_DICIONARIO } from '../src/ui/actions-table.js';
import { KEY_TABLE as TECLAS_DICIONARIO } from '../src/ui/keys.js';
import { TOOL_ORDER as ORDEM_DICIONARIO } from '../src/ui/toolbar-model.js';
import { readdirSync as lerPasta, statSync as estado } from 'node:fs';

describe('o dicionário da tela: toda função tem porta, e a porta fala a língua da pessoa', () => {
  const grupos = allMenus({ ...NEUTRAL_MENU_STATE, animating: true, canUndo: true, canRedo: true } as MenuState);
  const entradas = grupos.flatMap((g) => flatEntries(g.entries).map((e) => ({ grupo: g.label, ...e })));

  it('a régua acusa: "slot" no nome, e "atlas" fora de parênteses na dica (regra 26)', () => {
    expect(jargaoNoNome('Ponto neste slot')).toEqual(['slot']);
    expect(jargaoNaFrase('Grava no atlas onde cada imagem encaixa')).toEqual(['atlas']);
    // Entre parênteses ou crases, o termo técnico pode morar; nome de arquivo não é jargão.
    expect(jargaoNaFrase('Grava na folha de imagens (atlas), no .bonez e no manifest.json')).toEqual([]);
    expect(jargaoNaFrase('o campo `slot` do arquivo')).toEqual([]);
    // "Slots" com maiúscula e no plural também.
    expect(jargaoNoNome('Limpar Slots')).toEqual(['slot']);
    // Palavra que só CONTÉM o termo não é ele: "região", "rigoroso".
    expect(jargaoNaFrase('uma região rigorosa')).toEqual([]);
  });

  it('toda ação da tabela tem porta à vista: um item de menu, com nome de gente', () => {
    const semPorta: string[] = [];
    for (const row of TABELA_DICIONARIO) {
      if (row.where === 'submenu') continue;
      const entrada = entradas.find((e) => e.action === row.id);
      const nome = entrada?.label.trim() ?? '';
      // Um nome: pelo menos uma palavra de três letras, não só símbolo.
      if (entrada === undefined || !/\p{L}{3,}/u.test(nome)) semPorta.push(row.id);
    }
    expect(semPorta, 'ação sem item de menu com nome').toEqual([]);
  });

  it('nenhum NOME de menu, aba, ferramenta ou tecla leva termo técnico', () => {
    const nomes = [
      ...grupos.map((g) => `menu ${g.label}`),
      ...entradas.map((e) => `${e.grupo} → ${e.label}`),
      ...WINDOW_PANELS.map((p) => `aba ${p.label}`),
      ...TECLAS_DICIONARIO.map((k) => `tecla ${k.label}`),
      ...ORDEM_DICIONARIO.map((id) => `ferramenta ${getTools().find((t) => t.id === id)?.label ?? ''}`),
    ];
    const ruins = nomes.filter((n) => !esperando(n) && jargaoNoNome(n.replace(/^(menu|aba|tecla|ferramenta) /, '')).length > 0);
    expect(ruins).toEqual([]);
  });

  it('nas dicas dos menus, o termo técnico só entre parênteses, depois da palavra da pessoa', () => {
    const ruins = entradas
      .filter((e) => e.hint !== undefined && !esperando(e.hint) && jargaoNaFrase(e.hint).length > 0)
      .map((e) => `${e.grupo} → ${e.label}: ${jargaoNaFrase(e.hint!).join(', ')}`);
    expect(ruins).toEqual([]);
  });

  it('nos textos da casca e da cena (dica, rodapé, janela), o mesmo', () => {
    const raiz = resolve(__dirname, '../src');
    const arquivos: string[] = [];
    const anda = (d: string): void => {
      for (const f of lerPasta(d)) {
        const p = resolve(d, f);
        if (estado(p).isDirectory()) anda(p);
        else if (p.endsWith('.ts')) arquivos.push(p);
      }
    };
    anda(resolve(raiz, 'ui'));
    anda(resolve(raiz, 'viewport'));
    // O dicionário cita os termos; as auditorias falam com quem programa, e não aparecem na tela.
    const fora = new Set(['jargao.ts', 'command-audit.ts', 'call-audit.ts']);
    const ruins: string[] = [];
    for (const arquivo of arquivos) {
      if (fora.has(arquivo.split(/[\\/]/).pop()!)) continue;
      const fonte = readFileSync(arquivo, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
      for (const m of fonte.matchAll(/'((?:[^'\\\n]|\\.)*)'|`((?:[^`\\]|\\.)*)`/g)) {
        const texto = (m[1] ?? m[2] ?? '').replace(/\$\{[^}]*\}/g, 'X');
        // Só frase de gente: duas palavras com letra minúscula. Nome de campo e caminho ficam de fora.
        if (!/\p{Ll}{3,} \p{Ll}{2,}/u.test(texto) || esperando(texto)) continue;
        const termos = jargaoNaFrase(texto);
        if (termos.length > 0) ruins.push(`${arquivo.slice(raiz.length + 1)}: ${termos.join(', ')} | ${texto.slice(0, 80)}`);
      }
    }
    expect(ruins).toEqual([]);
  });

  it('a lista do que espera outro dono não mente: cada linha ainda tem o termo, e diz quem paga', () => {
    for (const e of ESPERANDO) {
      expect(jargaoNaFrase(e.texto).length + jargaoNoNome(e.texto).length, e.texto).toBeGreaterThan(0);
      expect(e.dono.length).toBeGreaterThan(5);
      expect(e.porque.length).toBeGreaterThan(20);
    }
    // E todo verbete diz de onde veio a palavra: o dicionário não inventa.
    for (const v of DICIONARIO) expect(v.fonte.length, v.termo).toBeGreaterThan(10);
  });
});

// Noite de 04/11/2026: o aviso do leitor chegava em inglês no rodapé, porque
// quatro lugares punham `warnings[0]` cru. Regra 26: a forma crua existia
// (`warnings[0]` sem tradução), e a frase crua é inglesa.
import { avisoNoRodape } from '../src/panels/warning-model.js';
describe('o rodapé fala português quando o arquivo abre com aviso', () => {
  it('a frase do leitor vira português, e o ponteiro sai', () => {
    const cru = '/animations/0/timelines/3: deform needs a vertex attachment; timeline ignored';
    expect(avisoNoRodape(cru)).toBe('chaves de deformação num desenho que não é malha: ficam sem efeito');
    expect(avisoNoRodape('A pasta abriu.')).toBe('A pasta abriu.');
  });
  it('nenhum lugar da casca põe o aviso cru no rodapé', () => {
    for (const nome of ['shell-file.ts', 'shell-drop.ts']) {
      const fonte = readFileSync(resolve(__dirname, '../src/ui', nome), 'utf8');
      expect(fonte, nome).not.toMatch(/textContent = (aberto|opened)\.warnings\[0\](;|\s*\?\?)/);
      expect(fonte, nome).not.toMatch(/\$\{lido\.warnings\[0\]\}/);
    }
  });
});

describe('o rodapé apertado: o essencial antes dos dois-pontos (prova de pessoa, 05/11/2026)', () => {
  it('nenhuma frase de rodapé da casca e da cena fica com UMA palavra antes dos dois-pontos', () => {
    // O rodapé encolhe a frase até caber (`ui/shell-status.ts`): a inteira, a
    // primeira frase, ou o que vem antes dos dois-pontos. "Malha: escolha um
    // desenho…" aparecia como só "Malha", e "Recorte: 167 × 283 px…" como só
    // "Recorte". Esta régua lê o código: a parte de antes dos dois-pontos de
    // um `notice` escrito ali tem de ter pelo menos duas palavras.
    const raiz = resolve(__dirname, '../src');
    const ruins: string[] = [];
    for (const pasta of ['ui', 'viewport']) {
      const anda = (d: string): void => {
        for (const f of lerPasta(d)) {
          const p = resolve(d, f);
          if (estado(p).isDirectory()) { anda(p); continue; }
          if (!p.endsWith('.ts')) continue;
          const fonte = readFileSync(p, 'utf8');
          for (const m of fonte.matchAll(/(?:notice|statusState\.textContent\s*=)\s*\(?\s*(['`])((?:(?!\1)[^\\\n]|\\.)*)\1/g)) {
            const frase = m[2]!;
            if (!frase.includes(':')) continue;
            const antes = frase.split(':')[0]!.replace(/\$\{[^}]*\}/g, 'X').trim();
            if (antes.split(/\s+/).length <= 1) ruins.push(`${p.slice(raiz.length + 1)}: "${frase.slice(0, 60)}"`);
          }
        }
      };
      anda(resolve(raiz, pasta));
    }
    // Os que sobram dizem um título e a mensagem dele; quem chama escolhe o título.
    expect(ruins.filter((r) => !r.includes('${title}: ${message}'))).toEqual([]);
  });
});
