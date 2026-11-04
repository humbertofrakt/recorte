/**
 * Lote A1 (v10.4) — toda tecla numa tabela só, `ui/keys.ts`.
 *
 * Sem DOM. O Humberto, 11/09/2026: *"as teclas deveriam estar em um lugar para
 * conferir de forma rápida, e não espalhadas no código"*. A tabela diz qual
 * tecla, onde vale e o que faz; `keyConflicts` é o árbitro. O que se prova aqui:
 * a tabela não briga, a Ajuda → Atalhos é a mesma de antes, nenhuma tecla mudou
 * de dono, e os cinco que decidem perguntam à tabela.
 */

import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { panelKeyRows, prettyKey as prettyKeyPL21 } from '../src/ui/key-swaps.js';

import type { BoneFile } from '../../runtime/src/index.js';
import { emptySelection } from '../src/contract.js';
import { Doc } from '../src/doc/document.js';
import {
  KEY_TABLE, SCENE_GESTURE_ROWS, TOOL_KEYS, actionsFor, bindingsFor, isTyping, keyConflicts, keyMap, keyOf,
  keyTable, shortcutRows,
} from '../src/ui/keys.js';
import type { KeyBinding } from '../src/ui/keys.js';
import { liveShortcut, toolIdOfKey } from '../src/ui/keys.js';
import {
  SWAPS_KEY, applySwaps, bindingId, isFixed, parseSwaps, prettyKey, proposeSwap, restoreSwap, setKeySwaps, swappedRows,
} from '../src/ui/key-swaps.js';
import { VIEW_ACTIONS, allMenus, normalizeShortcut, shortcutMap, shortcutTable } from '../src/ui/menus.js';
import type { MenuState } from '../src/ui/menus.js';
import { toolShortcutRows } from '../src/ui/toolbar-model.js';
import { judgeShortcut, silentKeyNotice } from '../src/ui/shell-keys.js';
import { actionRow } from '../src/ui/actions-table.js';
import type { KeyJudge } from '../src/ui/shell-keys.js';
import { VIEW_TOGGLE_KEYS, viewSettings } from '../src/viewport/onion.js';
import { nudgeFor } from '../src/viewport/tools/select.js';
import { orderDirOfActions, orderKeyDir, orderTargets, runOrderStep } from '../src/panels/draw-order-model.js';
import { getTools } from '../src/contract.js';
import { viewMenuState } from './ajuda-view.js';
// Registra as ferramentas, como o programa faz ao montar a cena.
import '../src/viewport/viewport.js';

const SRC = resolve(__dirname, '../src');
const HEROI = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
const ler = (caminho: string): string => readFileSync(resolve(SRC, caminho), 'utf8').replace(/\r\n/g, '\n');

/** Os menus de um programa parado, como os testes do menu montam. */
function menus(patch: Partial<MenuState> = {}): ReturnType<typeof allMenus> {
  const view = viewSettings();
  return allMenus({
    canRepack: false, canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
    view: viewMenuState(), lockBones: view.lockBones, lockDrawings: view.lockDrawings,
    space: 'local', compensation: { children: false, drawings: false, boxes: false },
    animating: true, loop: false, open: {}, ...patch,
  });
}

/** O que um `KeyboardEvent` manda, com os modificadores que se pedir. */
function tecla(key: string, mods: Partial<{ ctrl: boolean; alt: boolean; shift: boolean }> = {}) {
  return { key, ctrlKey: mods.ctrl === true, metaKey: false, altKey: mods.alt === true, shiftKey: mods.shift === true };
}

describe('a tabela', () => {
  it('tem pelo menos 60 linhas, e toda linha tem tecla, escopo, ação e nome', () => {
    expect(KEY_TABLE.length).toBeGreaterThanOrEqual(60);
    for (const row of KEY_TABLE) {
      expect(row.key, JSON.stringify(row)).not.toBe('');
      expect(row.action, JSON.stringify(row)).not.toBe('');
      expect(row.label.trim(), JSON.stringify(row)).not.toBe('');
    }
  });

  it('não briga: nenhuma tecla com dois donos no mesmo lugar', () => {
    const brigas = keyConflicts(KEY_TABLE).map(([a, b]) => `${a.scope} ${a.key}: ${a.action} × ${b.action}`);
    expect(brigas).toEqual([]);
    // A tabela com os menus de agora também não, em Montagem e em Animando.
    expect(keyConflicts(keyTable(menus({ animating: false })))).toEqual([]);
  });

  it('o árbitro acusa: Ctrl+↑ duas vezes na cena, com donos diferentes, é uma briga', () => {
    const teste: KeyBinding[] = [
      { key: 'ctrl+arrowup', scope: 'cena', action: 'subir-ordem', label: 'Trazer para a frente' },
      { key: 'ctrl+arrowup', scope: 'cena', action: 'chave-anterior', label: 'Chave anterior' },
      // Com uma condição que separa, não é briga.
      { key: 'ctrl+arrowdown', scope: 'cena', action: 'descer-ordem', label: 'Mandar para trás', when: 'desenho escolhido' },
      { key: 'ctrl+arrowdown', scope: 'cena', action: 'marca-seguinte', label: 'Marca seguinte' },
      // Em escopos diferentes, também não.
      { key: 'm', scope: 'linha-do-tempo', action: 'nova-marca', label: 'Marca' },
      { key: 'm', scope: 'arvore', action: 'outra', label: 'Outra' },
    ];
    const brigas = keyConflicts(teste);
    expect(brigas).toHaveLength(1);
    expect(brigas[0]!.map((row) => row.action)).toEqual(['subir-ordem', 'chave-anterior']);
  });

  it('bindingsFor pergunta primeiro ao lugar e depois a toda parte: Ctrl+↑ na cena', () => {
    const linhas = bindingsFor('cena', 'ctrl+arrowup');
    expect(linhas.map((row) => [row.action, row.when])).toEqual([
      ['subir-ordem', 'desenho escolhido'],
      ['marca-anterior', undefined],
    ]);
    // Em toda parte, só as de toda parte.
    expect(bindingsFor('toda-parte', 'ctrl+arrowup').map((row) => row.action)).toEqual(['marca-anterior']);
  });

  it('isTyping: campo, área de texto, lista e texto editável; botão e nada, não', () => {
    expect(isTyping({ tagName: 'INPUT' })).toBe(true);
    expect(isTyping({ tagName: 'TEXTAREA' })).toBe(true);
    expect(isTyping({ tagName: 'SELECT' })).toBe(true);
    expect(isTyping({ tagName: 'DIV', isContentEditable: true })).toBe(true);
    expect(isTyping({ tagName: 'BUTTON' })).toBe(false);
    expect(isTyping({ tagName: 'CANVAS', isContentEditable: false })).toBe(false);
    expect(isTyping(null)).toBe(false);
    expect(isTyping(undefined)).toBe(false);
  });
});

describe('nada mudou de dono', () => {
  it('Ajuda → Atalhos é a mesma de antes: menus, ferramentas e cena, mesma ordem, mesmos textos', () => {
    const grupos = menus();
    const antes = [
      ...shortcutTable(grupos),
      ...toolShortcutRows(),
      { menu: 'Cena', item: 'Mover a vista', shortcut: 'Espaço + arrastar' },
      { menu: 'Cena', item: 'Trazer para a frente (desenho escolhido)', shortcut: 'Ctrl+↑' },
      { menu: 'Cena', item: 'Mandar para trás (desenho escolhido)', shortcut: 'Ctrl+↓' },
      { menu: 'Cena', item: 'Frente de tudo (desenho escolhido)', shortcut: 'Ctrl+→' },
      { menu: 'Cena', item: 'Fundo de tudo (desenho escolhido)', shortcut: 'Ctrl+←' },
    ];
    expect(shortcutRows(keyTable(grupos))).toEqual(antes);
    expect(SCENE_GESTURE_ROWS).toEqual(antes.slice(-5));
  });

  it('as letras das ferramentas da tabela são as que as ferramentas declaram', () => {
    const tabela = TOOL_KEYS.map((row) => ({ menu: row.help!.menu, item: row.label, shortcut: row.help!.shortcut }));
    expect(tabela).toEqual(toolShortcutRows());
    for (const tool of getTools()) {
      if (tool.shortcut === null) continue;
      const linha = TOOL_KEYS.find((row) => row.action === `local:ferramenta-${tool.id}`);
      expect(linha?.key, tool.id).toBe(tool.shortcut.toLowerCase());
    }
  });

  it('o mapa da casca é o dos menus, mais o Ctrl+Shift+Z do refazer', () => {
    const grupos = menus();
    const esperado = new Map(shortcutMap(grupos));
    esperado.set('ctrl+shift+z', 'refazer');
    expect(keyMap(keyTable(grupos))).toEqual(esperado);
  });

  it('7 8 9 0 na cena são as mesmas quatro caixas do menu', () => {
    for (const [key, field] of Object.entries(VIEW_TOGGLE_KEYS)) {
      expect(actionsFor('cena', key), key).toEqual([VIEW_ACTIONS[field]]);
    }
  });

  it('as setas da cena são as do andar: 1 px, e 10 com Shift', () => {
    const doEvento: Record<string, string> = {
      arrowleft: 'ArrowLeft', arrowright: 'ArrowRight', arrowup: 'ArrowUp', arrowdown: 'ArrowDown',
    };
    for (const row of KEY_TABLE.filter((r) => r.scope === 'cena' && r.action.startsWith('local:andar'))) {
      const shift = row.key.startsWith('shift+');
      const passo = nudgeFor(doEvento[row.key.replace('shift+', '')] ?? '', shift);
      expect(passo, row.key).not.toBeNull();
      expect(Math.abs(passo!.dx) + Math.abs(passo!.dy)).toBe(row.action === 'local:andar-10' ? 10 : 1);
    }
  });

  it('a ordem: a tabela e orderKeyDir dizem a mesma direção, na cena e na aba', () => {
    const casos: Array<[string, boolean]> = [
      ['ArrowUp', false], ['ArrowDown', false], ['ArrowRight', false], ['ArrowLeft', false],
      ['ArrowUp', true], ['ArrowDown', true], ['ArrowRight', true], ['ArrowLeft', true],
    ];
    for (const [key, shift] of casos) {
      const nome = keyOf(tecla(key, { ctrl: true, shift }));
      const esperado = orderKeyDir(key, true, shift, false);
      expect(orderDirOfActions(actionsFor('cena', nome)), `cena ${nome}`).toBe(esperado);
      expect(orderDirOfActions(actionsFor('ordem', nome)), `ordem ${nome}`).toBe(esperado);
    }
    // O Alt não conta na ordem.
    expect(orderDirOfActions(actionsFor('ordem', keyOf(tecla('ArrowUp', { ctrl: true, alt: true }), true)))).toBe('frente-1');
  });

  it('a linha do tempo: Alt não conta; Shift que a tabela não escreve, também não', () => {
    expect(actionsFor('linha-do-tempo', keyOf(tecla('M', { shift: true }), true))).toEqual(['nova-marca']);
    expect(actionsFor('linha-do-tempo', keyOf(tecla('ArrowUp', { ctrl: true, shift: true }), true))).toEqual(['marca-anterior']);
    expect(actionsFor('linha-do-tempo', keyOf(tecla('ArrowLeft', { alt: true }), true))).toEqual(['quadro-anterior']);
    expect(actionsFor('linha-do-tempo', keyOf(tecla('ArrowLeft', { shift: true }), true))).toEqual(['local:dez-quadros-antes']);
    expect(actionsFor('linha-do-tempo', keyOf(tecla('c', { ctrl: true, shift: true }), true))).toEqual(['copiar-pose']);
    expect(actionsFor('linha-do-tempo', keyOf(tecla('Delete', { ctrl: true }), true))).toEqual([]);
    // Na Árvore o P com Ctrl não é o gesto; com Shift é.
    expect(actionsFor('arvore', keyOf(tecla('P', { shift: true })))).toEqual(['local:pegar-filhos']);
    expect(actionsFor('arvore', keyOf(tecla('p', { ctrl: true })))).toEqual([]);
  });
});

describe('Ctrl+↑ na cena, pela tabela', () => {
  /** O que a cena faz com a tecla: a mesma pergunta do `viewport.onKeyDown`. */
  function cena(doc: Doc, alvo: unknown): string {
    const nome = keyOf(tecla('ArrowUp', { ctrl: true }), true);
    const dir = isTyping(alvo) ? null : orderDirOfActions(actionsFor('cena', nome));
    if (dir !== null && orderTargets(doc.file, doc.selection).length > 0) {
      runOrderStep(doc, dir);
      return 'ordem';
    }
    // A cena não atendeu: a tecla segue para toda parte.
    return bindingsFor('toda-parte', nome)[0]?.action ?? 'nada';
  }

  it('com desenho escolhido, mexe na ordem', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    doc.select({ ...emptySelection(), slots: ['arm_back'] });
    const antes = (doc.file.slots ?? []).map((slot) => slot.name);
    expect(cena(doc, { tagName: 'CANVAS' })).toBe('ordem');
    const depois = (doc.file.slots ?? []).map((slot) => slot.name);
    expect(depois.indexOf('arm_back')).toBe(antes.indexOf('arm_back') + 1);
  });

  it('sem desenho escolhido, passa e vira Marca anterior; num campo de texto, nada na ordem', () => {
    const doc = new Doc(JSON.parse(HEROI) as BoneFile);
    const texto = JSON.stringify(doc.file.slots);
    expect(cena(doc, { tagName: 'CANVAS' })).toBe('marca-anterior');
    doc.select({ ...emptySelection(), slots: ['arm_back'] });
    // No campo, a cena não mexe na ordem; a tecla é do campo (a casca também não atende).
    expect(cena(doc, { tagName: 'INPUT' })).toBe('marca-anterior');
    expect(JSON.stringify(doc.file.slots)).toBe(texto);
  });
});

describe('os cinco que decidem perguntam à tabela', () => {
  it('casca, cena, linha do tempo, Ordem e Árvore; e nenhum cheque de campo de texto à mão', () => {
    // Degrau 11, lote 2: a casca lê a tabela que vale AGORA, com as trocas.
    expect(ler('ui/shell.ts')).toContain('keyMap(liveTable(keyTable(this.groups())))');
    expect(ler('viewport/viewport.ts')).toContain("actionsFor('cena', keyOf(e, true))");
    expect(ler('panels/dopesheet.ts')).toContain("actionsFor('linha-do-tempo', keyOf(event, true))");
    expect(ler('panels/draw-order.ts')).toContain("actionsFor('ordem', keyOf(event, true))");
    expect(ler('panels/tree.ts')).toContain("actionsFor('arvore', keyOf(event))");
    for (const arquivo of ['ui/shell.ts', 'viewport/viewport.ts', 'panels/draw-order.ts', 'panels/tree.ts']) {
      const texto = ler(arquivo);
      expect(texto, arquivo).not.toContain("tag === 'INPUT'");
      expect(texto, arquivo).not.toContain('instanceof HTMLInputElement || alvo instanceof HTMLTextAreaElement');
      expect(texto, arquivo).not.toContain('e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement');
    }
    // O Ctrl+Shift+Z escrito na tabela é o que a casca atende antes do mapa.
    expect(normalizeShortcut('Ctrl+Shift+Z')).toBe('ctrl+shift+z');
    expect(KEY_TABLE.some((row) => row.key === 'ctrl+shift+z' && row.action === 'refazer')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// O sistema de trocar as teclas — degrau 11, lote 2 (18/09/2026), G7
// ---------------------------------------------------------------------------

describe('trocar as teclas: a tabela de troca mora na máquina', () => {
  const idDe = (scope: string, action: string): string => {
    const row = KEY_TABLE.find((r) => r.scope === scope && r.action === action)!;
    return bindingId(row);
  };

  it('sem troca nenhuma, a tabela que vale é a de fábrica, linha por linha', () => {
    const viva = applySwaps(KEY_TABLE, {});
    expect(viva.map((r) => r.key)).toEqual(KEY_TABLE.map((r) => r.key));
    expect(viva.every((r) => !r.swapped && r.defaultKey === r.key)).toBe(true);
  });

  it('trocar vale na hora: a tecla nova atende e a velha fica livre', () => {
    const id = idDe('toda-parte', 'salvar');
    const r = proposeSwap(KEY_TABLE, {}, id, 'ctrl+alt+s');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const viva = applySwaps(KEY_TABLE, r.swaps);
    expect(keyMap(viva).get('ctrl+alt+s')).toBe('salvar');
    expect(keyMap(viva).get('ctrl+s')).toBeUndefined();
    expect(r.notice).toContain('Ctrl+Alt+S');
    expect(r.notice).toContain('era Ctrl+S');
  });

  it('o conflito AVISA e não troca: diz de quem é a tecla e onde', () => {
    const r = proposeSwap(KEY_TABLE, {}, idDe('toda-parte', 'salvar'), 'ctrl+z');
    expect(r.ok).toBe(false);
    if (r.ok) return;
    expect(r.conflict?.action).toBe('desfazer');
    expect(r.notice).toContain('Ctrl+Z já é de');
    expect(r.notice).toContain('não foi trocada');
  });

  it('a régua da troca é mais dura que a de fábrica: tecla de painel não repete uma de toda parte', () => {
    // De fábrica o M é Malha fora da linha do tempo e marca dentro dela. Uma
    // troca à mão não pode criar outra dupla dessas sem ninguém ter pensado.
    const r = proposeSwap(KEY_TABLE, {}, idDe('linha-do-tempo', 'chavear-tudo'), 'ctrl+s');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.notice).toContain('em toda parte');
  });

  it('as teclas do navegador e as fixas do programa são recusadas com a razão escrita', () => {
    const id = idDe('toda-parte', 'salvar');
    for (const tecla of ['ctrl+w', 'ctrl+tab', 'f5', 'escape', 'enter', ' ']) {
      const r = proposeSwap(KEY_TABLE, {}, id, tecla);
      expect(r.ok, tecla).toBe(false);
      if (!r.ok) expect(r.notice, tecla).toContain('não pode ser usada');
    }
    const soMod = proposeSwap(KEY_TABLE, {}, id, 'ctrl+shift');
    expect(soMod.ok).toBe(false);
  });

  it('a tecla que o programa lê direto do teclado diz que é fixa, e não finge trocar', () => {
    const espaco = KEY_TABLE.find((r) => r.scope === 'cena' && r.action === 'local:mover-vista')!;
    expect(isFixed(espaco)).toBe(true);
    const r = proposeSwap(KEY_TABLE, {}, bindingId(espaco), 'h');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.notice).toContain('fixa');
    // E uma troca gravada à força para ela não vale.
    const viva = applySwaps(KEY_TABLE, { [bindingId(espaco)]: 'h' });
    expect(viva.find((row) => row.id === bindingId(espaco))?.key).toBe(' ');
  });

  it('a Ajuda mostra as trocadas: a tecla nova escrita, a de fábrica ao lado, e a conta', () => {
    const id = idDe('toda-parte', 'local:ferramenta-create-bone');
    const r = proposeSwap(KEY_TABLE, {}, id, 'n');
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const trocadas = swappedRows(KEY_TABLE, r.swaps);
    expect(trocadas.length).toBe(1);
    expect(trocadas[0]?.help?.shortcut).toBe('N');
    expect(trocadas[0]?.defaultKey).toBe('b');
    expect(shortcutRows(applySwaps(KEY_TABLE, r.swaps)).find((row) => row.item === 'Criar osso')?.shortcut).toBe('N');
  });

  it('voltar à tecla de fábrica tira a linha da tabela de troca; se a de fábrica foi ocupada, avisa', () => {
    const salvar = idDe('toda-parte', 'salvar');
    const a = proposeSwap(KEY_TABLE, {}, salvar, 'ctrl+alt+s');
    if (!a.ok) throw new Error(a.notice);
    const volta = restoreSwap(KEY_TABLE, a.swaps, salvar);
    expect(volta.ok).toBe(true);
    if (volta.ok) expect(Object.keys(volta.swaps)).toEqual([]);
    // Outra linha pegou o Ctrl+S enquanto isso: a volta não passa por cima.
    const b = proposeSwap(KEY_TABLE, a.swaps, idDe('toda-parte', 'abrir'), 'ctrl+s');
    if (!b.ok) throw new Error(b.notice);
    const presa = restoreSwap(KEY_TABLE, b.swaps, salvar);
    expect(presa.ok).toBe(false);
    if (!presa.ok) expect(presa.notice).toContain('já é de');
  });

  it('o que estava gravado e não existe mais sai CONTADO, e nunca estoura', () => {
    const bom = idDe('toda-parte', 'salvar');
    const lido = parseSwaps({ [bom]: 'ctrl+alt+s', 'toda-parte|acao-que-sumiu|f9': 'f8', outro: 7 }, KEY_TABLE);
    expect(lido.swaps).toEqual({ [bom]: 'ctrl+alt+s' });
    expect(lido.dropped.length).toBe(2);
    for (const lixo of [null, 'texto', 42, [1, 2]]) {
      expect(parseSwaps(lixo, KEY_TABLE)).toEqual({ swaps: {}, dropped: [] });
    }
  });

  it('a tecla como se lê no menu', () => {
    expect(prettyKey('ctrl+shift+arrowup')).toBe('Ctrl+Shift+↑');
    expect(prettyKey('f2')).toBe('F2');
    expect(prettyKey('n')).toBe('N');
    expect(prettyKey('ctrl++')).toBe('Ctrl++');
    expect(prettyKey('delete')).toBe('Delete');
  });

  it('gravar, ler de volta e a ferramenta atender pela tecla nova (sobrevive a reabrir)', () => {
    const guardado = new Map<string, string>();
    const antigo = (globalThis as { localStorage?: unknown }).localStorage;
    (globalThis as { localStorage?: unknown }).localStorage = {
      getItem: (k: string) => guardado.get(k) ?? null,
      setItem: (k: string, v: string) => { guardado.set(k, v); },
      removeItem: (k: string) => { guardado.delete(k); },
    };
    try {
      const id = idDe('toda-parte', 'local:ferramenta-create-bone');
      expect(setKeySwaps({ [id]: 'n' })).toBe(true);
      // Na máquina, com a chave própria — e é JSON que `parseSwaps` relê igual.
      expect(parseSwaps(JSON.parse(guardado.get(SWAPS_KEY)!), KEY_TABLE).swaps).toEqual({ [id]: 'n' });
      expect(toolIdOfKey('n')).toBe('create-bone');
      expect(toolIdOfKey('b')).toBeNull();
      expect(toolIdOfKey('shift+n')).toBe('create-bone');
      expect(liveShortcut('salvar', 'Ctrl+S')).toBe('Ctrl+S');
      // Voltar tudo ao padrão apaga a chave do navegador.
      setKeySwaps({});
      expect(guardado.has(SWAPS_KEY)).toBe(false);
      expect(toolIdOfKey('b')).toBe('create-bone');
    } finally {
      setKeySwaps({});
      (globalThis as { localStorage?: unknown }).localStorage = antigo;
    }
  });

  it('a tabela de troca nunca vai para o `.bone`: o módulo não conhece o documento', () => {
    const fonte = ler('ui/key-swaps.ts');
    expect(fonte).not.toMatch(/from '\.\.\/contract/);
    expect(fonte).not.toContain('writeEditorState');
    expect(fonte).toContain("SWAPS_KEY = 'RECORTE_teclas'");
  });

  it('o menu escreve a tecla trocada ao lado do item', () => {
    const id = idDe('toda-parte', 'salvar');
    setKeySwaps({ [id]: 'ctrl+alt+s' });
    try {
      expect(liveShortcut('salvar', 'Ctrl+S')).toBe('Ctrl+Alt+S');
      expect(liveShortcut('abrir', 'Ctrl+O')).toBe('Ctrl+O');
      expect(liveShortcut('sem-tecla', undefined)).toBeUndefined();
    } finally {
      setKeySwaps({});
    }
  });
});

// ---------------------------------------------------------------------------
// A tecla que cala — 28/09/2026
// ---------------------------------------------------------------------------

/*
 * Decidido em 22/09 e não feito (`documentos/planos/A PORTA QUE ENGOLE O
 * CLIQUE 2026-09-22.md`, "O que FALTA", item 4): tecla na tabela cuja ação
 * não existe AVISA; tecla fora da tabela segue calada.
 *
 * As duas metades são provadas, e a segunda é a que impede o conserto de
 * virar barulho: um programa que avisa a cada letra apertada ensina a pessoa
 * a não ler o rodapé.
 */
describe('a tecla que cala', () => {
  /** Um juiz de brinquedo, que anota o que rodou. */
  function juiz(existem: readonly string[], cinzas: readonly string[] = []): KeyJudge & { rodadas: string[] } {
    const rodadas: string[] = [];
    return {
      rodadas,
      map: new Map([['ctrl+k', 'chavear-tudo'], ['f2', 'renomear'], ['ctrl+s', 'salvar']]),
      exists: (action) => existem.includes(action),
      run: (action) => {
        if (cinzas.includes(action)) return false;
        rodadas.push(action);
        return true;
      },
      labelOf: (action) => ({ 'chavear-tudo': 'Chavear tudo', renomear: 'Renomear' }[action] ?? null),
      needsPanel: (action) => action === 'renomear',
      pretty: (shortcut) => shortcut.toUpperCase(),
    };
  }

  it('tecla FORA da tabela: livre, sem aviso, e nada roda', () => {
    const j = juiz(['chavear-tudo']);
    expect(judgeShortcut('ctrl+j', j)).toEqual({ kind: 'livre' });
    expect(j.rodadas).toEqual([]);
  });

  it('tecla na tabela, ação de pé: roda, e não diz nada', () => {
    const j = juiz(['chavear-tudo']);
    expect(judgeShortcut('ctrl+k', j)).toEqual({ kind: 'rodou', action: 'chavear-tudo' });
    expect(j.rodadas).toEqual(['chavear-tudo']);
  });

  it('tecla na tabela, ação que NÃO existe: avisa, com a tecla e o nome', () => {
    const j = juiz([]);
    const veredito = judgeShortcut('ctrl+k', j);
    expect(veredito.kind).toBe('muda');
    if (veredito.kind !== 'muda') return;
    expect(veredito.notice).toContain('CTRL+K');
    expect(veredito.notice).toContain('Chavear tudo');
    // Não é ação de painel: o programa não sabe o motivo, e não inventa um.
    expect(veredito.notice).not.toContain('painel');
    // E a ação que não existe NÃO é chamada: avisar não é tentar.
    expect(j.rodadas).toEqual([]);
  });

  it('ação de PAINEL que não existe: aí o motivo é sabido, e é dito', () => {
    const veredito = judgeShortcut('f2', juiz([]));
    expect(veredito.kind).toBe('muda');
    if (veredito.kind !== 'muda') return;
    expect(veredito.notice).toContain('Renomear');
    expect(veredito.notice).toContain('está com o painel fechado');
    expect(veredito.notice).toContain('menu Janela');
  });

  it('ação sem nome em menu nenhum: a frase continua inteira', () => {
    const veredito = judgeShortcut('ctrl+s', juiz([]));
    expect(veredito.kind).toBe('muda');
    if (veredito.kind !== 'muda') return;
    expect(veredito.notice).toBe('CTRL+S: essa função não está disponível agora');
  });

  it('ação que existe e está CINZA: fica como sempre foi, livre e calada', () => {
    const j = juiz(['chavear-tudo'], ['chavear-tudo']);
    expect(judgeShortcut('ctrl+k', j)).toEqual({ kind: 'cinza', action: 'chavear-tudo' });
  });

  it('a frase cabe numa linha do rodapé', () => {
    const longa = silentKeyNotice('Ctrl+Shift+Alt+K', 'Copiar a ordem na animação', true);
    // 100 letras: o que coube numa linha do rodapé na foto de 28/09.
    expect(longa.length).toBeLessThan(100);
  });

  it('toda tecla de `toda-parte` tem nome na tabela de ações, ou o aviso sai sem nome', () => {
    // Não é exigência: é medida. Diz quantas teclas avisariam "uma função".
    const semNome = [...keyMap().values()].filter((action) => actionRow(action) === null);
    expect(semNome, `sem linha na tabela de ações: ${semNome.join(', ')}`).toEqual([]);
  });
});

describe('J9 (rodada 3): Ctrl+A, C, V e X num campo de texto são do TEXTO', () => {
  it('no campo de número, Ctrl+A seleciona o texto: não escolhe todos os ossos', async () => {
    const { textKeepsKey } = await import('../src/ui/keys.js');
    const campo = { tagName: 'INPUT', type: 'text' };
    for (const k of ['ctrl+a', 'ctrl+c', 'ctrl+v', 'ctrl+x']) expect([k, textKeepsKey(k, campo)]).toEqual([k, true]);
    expect(textKeepsKey('ctrl+a', { tagName: 'TEXTAREA' })).toBe(true);
    expect(textKeepsKey('ctrl+a', { tagName: 'DIV', isContentEditable: true })).toBe(true);
  });

  it('salvar, desfazer e abrir continuam do programa; fora do campo, Ctrl+A é do programa', async () => {
    const { textKeepsKey } = await import('../src/ui/keys.js');
    const campo = { tagName: 'INPUT', type: 'text' };
    for (const k of ['ctrl+s', 'ctrl+z', 'ctrl+y', 'ctrl+o', 'ctrl+shift+a']) expect([k, textKeepsKey(k, campo)]).toEqual([k, false]);
    expect(textKeepsKey('ctrl+a', { tagName: 'CANVAS' })).toBe(false);
    expect(textKeepsKey('ctrl+a', null)).toBe(false);
    expect(textKeepsKey('ctrl+a', { tagName: 'INPUT', type: 'checkbox' })).toBe(false);
    expect(textKeepsKey('ctrl+a', { tagName: 'SELECT' })).toBe(false);
  });

  it('a casca pergunta ANTES de rodar o atalho (a linha está no onKeyDown)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('private onKeyDown(event: KeyboardEvent)'));
    expect(corpo.indexOf('textKeepsKey(shortcutOfEvent(event), target)')).toBeGreaterThan(0);
    expect(corpo.indexOf('textKeepsKey(')).toBeLessThan(corpo.indexOf('this.runShortcut(event)'));
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, PL-21: as teclas dos painéis em Ajuda → Atalhos
// ---------------------------------------------------------------------------

describe('rodada 17, PL-21: Ajuda → Atalhos mostra as teclas dos painéis, numa seção dobrada', () => {
  it('todas as teclas da Linha do tempo, da Ordem e da Árvore, agrupadas, com a tecla escrita', () => {
    const linhas = panelKeyRows(KEY_TABLE);
    const dos = (scope: string) => KEY_TABLE.filter((k) => k.scope === scope).length;
    expect(linhas.length).toBe(dos('linha-do-tempo') + dos('ordem') + dos('arvore'));
    expect(linhas.length).toBeGreaterThan(30);
    const paineis = linhas.map((l) => l.painel);
    expect(paineis.indexOf('Ordem')).toBeGreaterThan(paineis.lastIndexOf('Linha do tempo'));
    expect(paineis.indexOf('Árvore')).toBeGreaterThan(paineis.lastIndexOf('Ordem'));
    expect(linhas.find((l) => l.label === 'Marca anterior')?.tecla).toBe(prettyKeyPL21('ctrl+arrowup'));
  });

  it('a janela desenha a seção dobrada', () => {
    const janela = readFileSync(resolve(__dirname, '../src/ui/keys-dialog.ts'), 'utf8');
    expect(janela).toContain('panelKeysSection(),');
    expect(janela).toContain("el('details', { class: 'dialog-teclas-paineis' }");
  });
});
