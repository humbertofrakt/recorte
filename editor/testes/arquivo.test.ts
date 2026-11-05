/**
 * Arquivo — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote11-arquivo-e-ajuda`, `lote33-o-basico`, `lote36-chegar-no-programa`, `conserto-atlas-e-primeira-animacao`.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { loadAtlas } from '../../runtime/src/index.js';
import type { BoneFile, AtlasData } from '../../runtime/src/index.js';
import { allMenus, flatEntries, MOVED_OUT, isSeparator } from '../src/ui/menus.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { filterCommands, fold } from '../src/ui/palette.js';
import { toolbarItems } from '../src/ui/toolbar-model.js';
import * as toolbarModel from '../src/ui/toolbar-model.js';
import * as toolRegistry from '../src/viewport/tools/registry.js';
import { actionBarGroups } from '../src/ui/action-bar-model.js';
import { getTools, EDITOR_EXTENSION } from '../src/contract.js';
import type { Tool } from '../src/contract.js';
import '../src/viewport/viewport.js';
import { toolOfKey } from '../src/viewport/viewport.js';
import { whereLabel } from '../src/ui/where-model.js';
import { EXPORT_LABELS, LAST_EXPORT_KEY, forgetLastExports, loadLastExport, loadMostRecentExport, parseLastExports, saveLastExport } from '../src/io/last-export.js';
import { DEFAULT_REFERENCE, REFERENCE_STATE_KEY, parseReference, readReference, referenceBounds, writeReference } from '../src/viewport/reference.js';
import { DEFAULT_VIEW, parseViewSettings, resetViewSettings, viewSettings } from '../src/viewport/onion.js';
import { viewMenuState } from './ajuda-view.js';
import { readFileSync, readdirSync, statSync, existsSync, mkdtempSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { auditMenus } from '../src/ui/menu-audit.js';
import type { MenuViolation } from '../src/ui/menu-audit.js';
import { matchesSearch } from '../src/panels/tree-model.js';
import type { TreeRow } from '../src/panels/tree-model.js';
import { MAX_RECENT, parseRecent, withRecent } from '../src/io/recent.js';
import type { RecentFile } from '../src/io/recent.js';
import '../src/viewport/tools/select.js';
import '../src/viewport/tools/translate.js';
import '../src/viewport/tools/rotate.js';
import '../src/viewport/tools/scale.js';
import '../src/viewport/tools/shear.js';
import '../src/viewport/tools/pose-tool.js';
import '../src/viewport/tools/create-bone.js';
import '../src/viewport/tools/point-tool.js';
import '../src/viewport/tools/box-tool.js';
import '../src/viewport/tools/mesh-tool.js';
import '../src/viewport/tools/weights-tool.js';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dropHintFor, dropPlan, isAtlasName, replacesDocument } from '../src/io/drop-plan.js';
import { WELCOME_BUTTONS, isEmptyDocument } from '../src/viewport/welcome-model.js';
import { hasIcon } from '../src/ui/icons.js';
import { Doc } from '../src/doc/document.js';
import { createEmptyFile } from '../src/doc/new-file.js';
import { ImportImagesCommand, atlasBaseName, importedAtlas, mergedAssets, setImportedAtlas } from '../src/io/import-images.js';
import type { ImportedAtlas } from '../src/io/import-images.js';
import { inflateSync } from 'node:zlib';
import { readPsd } from '../../ferramentas/src/importar/psd.js';
import type { PsdDocument } from '../../ferramentas/src/importar/psd.js';
import { packAtlas } from '../../ferramentas/src/atlas/packer.js';
import { importSpriter } from '../../ferramentas/src/importar/spriter.js';
import { ImportPsdCommand, psdPackerItems } from '../src/io/import-psd.js';
import type { PsdAtlas } from '../src/io/import-psd.js';
import { importedStock } from '../src/io/import-images.js';
import { AddBone } from '../src/doc/commands.js';
import { imageNameOf, imagesInUse, imagesOfAttachment, withProvisional, withSheet } from '../src/io/project-folder.js';
import { atlasForSave, regionCrop } from '../src/io/folder-save.js';
import { pivotNotice, pivotUsersSplit, swapImage } from '../src/io/pivot-model.js';
import { SetPivotCommand, atlasTreesOf } from '../src/io/pivot-atlas.js';
import { missingAtlasNotice, problemsQuestion } from '../src/io/open-save.js';
import { companionFiles } from '../src/io/project-folder.js';
import { asepriteSheet } from '../src/io/aseprite-sheet.js';
import {
  importForeignFiles, importForeignProject, insideProject, looseImagesNotice,
} from '../src/io/import-foreign.js';
import { isInternalDrag } from '../src/io/drop-plan.js';
import { dropEntries, filesOfEntries, hasFolder } from '../src/io/drop-folder.js';
import type { DroppedEntry } from '../src/io/drop-folder.js';

// ---------------------------------------------------------------------------
// arquivo e ajuda (lote 11) — era `lote11-arquivo-e-ajuda.test.ts`
// ---------------------------------------------------------------------------

describe('arquivo e ajuda (lote 11)', () => {
/**
 * Lote 11 (v2.8): arquivo e ajuda.
 *
 * Sem DOM. O que se prova aqui são as quatro decisões puras do lote: quais
 * comandos a paleta acha, quais ferramentas valem em cada modo, o que fica
 * guardado da última exportação, e o que o arquivo carrega sobre a imagem de
 * referência — que é a POSIÇÃO dela, nunca a imagem.
 */
// Importado só pelo efeito: é este módulo que registra as dez ferramentas, e
// sem ele `getTools()` devolveria uma lista vazia.

// ---------------------------------------------------------------------------
// Um estado de programa parado, como nos outros testes de menu
// ---------------------------------------------------------------------------

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

/** Um guardador de verdade, em memória: o Node não tem `localStorage`. */
class FakeStorage {
  private data = new Map<string, string>();
  getItem(key: string): string | null { return this.data.get(key) ?? null; }
  setItem(key: string, value: string): void { this.data.set(key, value); }
  removeItem(key: string): void { this.data.delete(key); }
  clear(): void { this.data.clear(); }
  key(index: number): string | null { return [...this.data.keys()][index] ?? null; }
  get length(): number { return this.data.size; }
}

beforeEach(() => {
  resetViewSettings();
  (globalThis as { localStorage?: Storage }).localStorage =
    new FakeStorage() as unknown as Storage;
  forgetLastExports();
});

// ---------------------------------------------------------------------------
// Item 110 — a paleta de comandos
// ---------------------------------------------------------------------------

describe('paleta de comandos', () => {
  it('"chav" acha Chavear e não acha Abrir', () => {
    const found = filterCommands(menus(), 'chav').map((c) => c.label);
    expect(found.some((label) => label.startsWith('Chavear'))).toBe(true);
    expect(found).not.toContain('Abrir…');
  });

  it('acha mais de uma entrada de chave', () => {
    const found = filterCommands(menus(), 'chave').map((c) => c.label);
    // "Apagar chave", "Recortar chaves", "Colar em todas as chaves". Basta que a
    // busca ache mais de uma: a paleta é para quem não sabe onde elas estão.
    expect(found.length).toBeGreaterThan(1);
  });

  it('sem acento e em maiúscula acha do mesmo jeito', () => {
    const alta = filterCommands(menus(), 'CEBOLA').map((c) => c.label);
    expect(alta).toContain('Casca de cebola');
    const semAcento = filterCommands(menus(), 'animacao').map((c) => c.menu);
    expect(semAcento).toContain('Animação');
  });

  it('cada palavra tem de aparecer, mas a ordem não importa', () => {
    const a = filterCommands(menus(), 'tamanho real');
    const b = filterCommands(menus(), 'real tamanho');
    expect(a.map((c) => c.action)).toEqual(b.map((c) => c.action));
    expect(a.some((c) => c.action === 'tamanho-real')).toBe(true);
  });

  it('texto vazio devolve o mapa inteiro, e não uma tela em branco', () => {
    expect(filterCommands(menus(), '', 500).length).toBeGreaterThan(60);
  });

  // Rodada 6 (05/10/2026): com os doze menus, muito item mora num submenu. A
  // paleta diz o caminho inteiro, e acha também pelo nome do submenu.
  it('o item de dentro de um submenu diz o caminho, e o nome do submenu acha', () => {
    const inicio = filterCommands(menus(), 'inicio').find((c) => c.action === 'ir-inicio');
    expect(inicio?.menu).toBe('Animação → Ir para');
    expect(filterCommands(menus(), 'ir para').map((c) => c.action)).toContain('chave-seguinte');
    const osso = filterCommands(menus(), 'osso').find((c) => c.action === 'novo-osso');
    expect(osso?.menu).toBe('Base → Novo');
    // E o que mora à vista diz só o menu.
    expect(filterCommands(menus(), 'nova animacao').find((c) => c.action === 'nova-animacao')?.menu).toBe('Animação');
  });

  it('pai de submenu fica de fora: ele não roda nada', () => {
    const acoes = filterCommands(menus(), '', 500).map((c) => c.action);
    expect(acoes).not.toContain('exportar');
    expect(acoes).not.toContain('importar');
    expect(acoes).toContain('exportar-gltf');
  });

  it('a mesma ação em dois menus aparece uma vez só', () => {
    const acoes = filterCommands(menus(), '', 500).map((c) => c.action);
    expect(new Set(acoes).size).toBe(acoes.length);
  });

  it('o limite corta, e corta pelo começo da lista', () => {
    const tudo = filterCommands(menus(), '', 500);
    const poucos = filterCommands(menus(), '', 5);
    expect(poucos).toHaveLength(5);
    expect(poucos.map((c) => c.action)).toEqual(tudo.slice(0, 5).map((c) => c.action));
  });

  it('nome que não existe devolve lista vazia', () => {
    expect(filterCommands(menus(), 'xilofone')).toEqual([]);
  });

  it('a tecla vem junto, quando a entrada tem uma', () => {
    const paleta = filterCommands(menus(), 'paleta de comandos')[0];
    expect(paleta?.shortcut).toBe('Ctrl+Shift+P');
    expect(paleta?.menu).toBe('Ajuda');
  });

  it('as entradas novas do lote estão na paleta', () => {
    const acoes = filterCommands(menus(), '', 500).map((c) => c.action);
    expect(acoes).toContain('reabrir');
    expect(acoes).toContain('repetir-exportacao');
    expect(acoes).toContain('configuracoes');
    expect(acoes).toContain('imagem-referencia');
  });

  it('`fold` tira acento e maiúscula, e mais nada', () => {
    expect(fold('Animação')).toBe('animacao');
    expect(fold('CASCA de Cebola')).toBe('casca de cebola');
    expect(fold('Ctrl+Shift+P')).toBe('ctrl+shift+p');
  });

  it('toda entrada da paleta existe mesmo nos menus', () => {
    const doMenu = new Set(
      menus().flatMap((group) => flatEntries(group.entries)).map((entry) => entry.action),
    );
    for (const command of filterCommands(menus(), '', 500)) {
      expect(doMenu.has(command.action)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Item 114 — a barra muda com o modo
// ---------------------------------------------------------------------------

/** Uma ferramenta de mentira, para provar o filtro sem depender do registro. */
function fakeTool(id: string): Tool {
  return { id, label: id, shortcut: null } as Tool;
}

/** As ferramentas de verdade. */
function realTools(): Tool[] {
  return getTools();
}

/**
 * Degrau 4a (17/09/2026, M4): **nenhuma ferramenta some por modo**. Estes
 * testes provavam a barra que escondia; foram reescritos para provar que ela
 * não esconde mais nada, com a base ou com uma animação aberta.
 */
describe('a barra não muda com o modo', () => {
  it('`modes` saiu do contrato: nenhuma ferramenta o declara, e `toolsForMode` não existe', () => {
    for (const tool of realTools()) expect('modes' in tool, tool.id).toBe(false);
    expect('toolsForMode' in toolbarModel).toBe(false);
  });

  it('a barra desenha toda ferramenta que existe, uma vez só', () => {
    const ids = toolbarItems(realTools()).map((item) => item.id);
    expect(ids).toHaveLength(realTools().length);
    expect(new Set(ids).size).toBe(ids.length);
    // Uma ferramenta de teste qualquer também entra: não há filtro nenhum.
    expect(toolbarItems([fakeTool('select'), fakeTool('translate')])).toHaveLength(2);
  });

  // Lote 57, plano pivô: Criar osso, Ponto e Caixa valem nos dois modos.
  // Plano "fluxo criar e animar", lote 2 (14/09/2026): Malha e Pesos também.
  it('Malha, Pesos, Criar osso, Ponto e Caixa estão sempre na barra', () => {
    const ids = toolbarItems(realTools()).map((t) => t.id);
    for (const id of ['mesh', 'weights', 'create-bone', 'point', 'box']) expect(ids).toContain(id);
    expect(ids).toContain('select');
    expect(ids).toContain('rotate');
  });

  it('a barra de ações leva toda ferramenta, sem pedir modo', () => {
    const grupo = actionBarGroups(realTools()).find((g) => g.id === 'ferramentas');
    expect(grupo?.items.map((i) => i.id).sort()).toEqual(realTools().map((t) => t.id).sort());
  });

  it('Posar fica sempre', () => {
    // Com a base aberta ela dobra a corrente da base; com uma animação, grava
    // chave. Escondê-la num dos dois tiraria uma função que funciona.
    expect(toolbarItems(realTools()).map((t) => t.id)).toContain('pose');
    expect(actionBarGroups(realTools()).flatMap((g) => g.items).map((i) => i.id)).toContain('pose');
  });
});

// ---------------------------------------------------------------------------
// Item 103 — a última exportação
// ---------------------------------------------------------------------------

describe('repetir a última exportação', () => {
  it('o que foi guardado é o que volta', () => {
    saveLastExport('imagem', { animation: 'walk', fps: 24, scale: 2 }, 1000);
    const back = loadLastExport('imagem');
    expect(back?.options).toEqual({ animation: 'walk', fps: 24, scale: 2 });
    expect(back?.kind).toBe('imagem');
    expect(back?.savedAt).toBe(1000);
  });

  it('um tipo não apaga o outro', () => {
    saveLastExport('imagem', { fps: 24 }, 1000);
    saveLastExport('pele', { name: 'heroi.bone' }, 2000);
    expect(loadLastExport('imagem')?.options).toEqual({ fps: 24 });
    expect(loadLastExport('pele')?.options).toEqual({ name: 'heroi.bone' });
  });

  it('a mais recente é a mais recente, não a última escrita', () => {
    saveLastExport('imagem', { fps: 24 }, 5000);
    saveLastExport('gltf', { format: 'glb' }, 1000);
    expect(loadMostRecentExport()?.kind).toBe('imagem');
  });

  it('sem nada guardado, devolve nulo — e a janela normal é que abre', () => {
    expect(loadLastExport('imagem')).toBeNull();
    expect(loadMostRecentExport()).toBeNull();
  });

  it('lixo guardado não quebra nada', () => {
    expect(parseLastExports(null)).toEqual({});
    expect(parseLastExports('isto não é objeto')).toEqual({});
    expect(parseLastExports({ imagem: 7 })).toEqual({});
    expect(parseLastExports({ imagem: { options: null } })).toEqual({});
    const meio = parseLastExports({ imagem: { options: { fps: 12 } } });
    expect(meio.imagem?.savedAt).toBe(0);
  });

  it('sem `localStorage` nenhum, nada explode', () => {
    delete (globalThis as { localStorage?: Storage }).localStorage;
    expect(() => saveLastExport('imagem', { fps: 24 })).not.toThrow();
    expect(loadLastExport('imagem')).toBeNull();
    expect(() => forgetLastExports()).not.toThrow();
  });

  it('a chave e os nomes dos tipos estão escritos num lugar só', () => {
    expect(LAST_EXPORT_KEY).toBe('RECORTE_last_export');
    expect(EXPORT_LABELS['pele']).toBe('por skin');
  });
});

// ---------------------------------------------------------------------------
// Item 62 — a imagem de referência
// ---------------------------------------------------------------------------

function emptyFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }],
  } as BoneFile;
}

describe('imagem de referência', () => {
  it('grava e lê os quatro números', () => {
    const file = emptyFile();
    writeReference(file, { name: 'guia.png', x: 10, y: -20, scale: 0.5, opacity: 0.3 });
    expect(readReference(file)).toEqual({
      name: 'guia.png', x: 10, y: -20, scale: 0.5, opacity: 0.3,
    });
  });

  it('vai para `RECORTE_editor_state`, e não para o corpo do arquivo', () => {
    const file = emptyFile();
    writeReference(file, { name: 'guia.png', ...DEFAULT_REFERENCE });
    const state = (file as unknown as {
      extensions: Record<string, Record<string, unknown>>;
    }).extensions['RECORTE_editor_state'];
    expect(state[REFERENCE_STATE_KEY]).toBeDefined();
    // A IMAGEM não está no arquivo em lugar nenhum: só o nome dela.
    expect(JSON.stringify(file)).not.toContain('data:image');
  });

  it('tirar o guia limpa o campo, e o arquivo continua inteiro', () => {
    const file = emptyFile();
    writeReference(file, { name: 'guia.png', ...DEFAULT_REFERENCE });
    writeReference(file, null);
    expect(readReference(file)).toBeNull();
    expect(file.bones).toHaveLength(1);
  });

  it('arquivo sem guia nenhum devolve nulo, sem quebrar', () => {
    expect(readReference(emptyFile())).toBeNull();
  });

  it('lixo vira o valor de fábrica, e sem nome não é guia', () => {
    expect(parseReference(null)).toBeNull();
    expect(parseReference({ x: 1 })).toBeNull();
    expect(parseReference({ name: '' })).toBeNull();
    const meio = parseReference({ name: 'g.png', x: 'muito', opacity: 9, scale: -3 });
    expect(meio?.x).toBe(DEFAULT_REFERENCE.x);
    // Opacidade fora de 0..1 e escala negativa são engano, e são cortadas.
    expect(meio?.opacity).toBe(1);
    expect(meio?.scale).toBe(0.001);
  });

  it('o retângulo do guia cresce com a escala', () => {
    const box = referenceBounds({ name: 'g.png', x: 5, y: 7, scale: 2, opacity: 1 }, 100, 50);
    expect(box).toEqual({ x: 5, y: 7, width: 200, height: 100 });
  });
});

// ---------------------------------------------------------------------------
// Item 106 — as configurações do projeto
// ---------------------------------------------------------------------------

describe('configurações do projeto', () => {
  it('a grade tem um número, e ele começa em 48 pixels', () => {
    expect(DEFAULT_VIEW.gridPixels).toBe(48);
    expect(viewSettings().gridPixels).toBe(48);
  });

  it('um `view` gravado antes deste lote continua abrindo', () => {
    const velho = parseViewSettings({ grid: true, axes: false });
    expect(velho.gridPixels).toBe(DEFAULT_VIEW.gridPixels);
    expect(velho.axes).toBe(false);
  });

  it('valor absurdo é cortado nas pontas', () => {
    expect(parseViewSettings({ gridPixels: 0 }).gridPixels).toBe(8);
    expect(parseViewSettings({ gridPixels: 9999 }).gridPixels).toBe(400);
    expect(parseViewSettings({ gridPixels: 120 }).gridPixels).toBe(120);
  });
});
});

// ---------------------------------------------------------------------------
// o basico (lote 33) — era `lote33-o-basico.test.ts`
// ---------------------------------------------------------------------------

describe('o basico (lote 33)', () => {
/**
 * Lote 33 — três consertos pequenos (anotações 20, 21 e 22).
 *
 * 20. A tecla obedece ao modo: em Animando, `N` não cria osso nenhum.
 * 21. Texto quebrado: nenhum `.ts` do projeto tem o rastro de UTF-8 lido como
 *     Latin-1: um 'c' de cedilha que passou duas vezes pelo decodificador.
 * 22. Nenhum item de menu fica cinza para sempre.
 *
 * Sem DOM. O que precisa de tela — o campo da busca, a janela dos recentes —
 * é conferido pelo módulo puro que decide, e no editor de verdade.
 */
// As ferramentas se registram ao serem importadas; sem isto `getTools()` é vazio.

// ---------------------------------------------------------------------------
// 20 — a tecla obedece ao modo
// ---------------------------------------------------------------------------

describe('a tecla de ferramenta vale sempre', () => {
  // Lote 33: a tecla diz o mesmo que a barra. Degrau 4a (17/09/2026): como a
  // barra não esconde mais nada, a tecla também não pergunta o modo.
  // Degrau 7, tarefa 7.1 (G1): a tecla do Criar osso passou de `N` para `B`,
  // e o `N` ficou livre. O que o teste prova é o mesmo — a tecla vale com a
  // base ou com uma animação aberta —, com a letra de hoje.
  it('B escolhe Criar osso e M escolhe Malha, com a base ou uma animação aberta', () => {
    expect(toolOfKey('b')?.id).toBe('create-bone');
    expect(toolOfKey('m')?.id).toBe('mesh');
    expect(toolOfKey('g')?.id).toBe('weights');
    expect(toolOfKey('n')).toBe(null);
    expect('toolForKey' in toolRegistry).toBe(false);
  });

  it('a barra e a tecla dizem a MESMA coisa, para toda ferramenta', () => {
    const tools = getTools();
    expect(tools.length).toBeGreaterThanOrEqual(10);
    const naBarra = new Set(toolbarItems(tools).map((item) => item.id));
    for (const tool of tools) {
      if (tool.shortcut === null) continue;
      expect(toolOfKey(tool.shortcut)?.id, tool.id).toBe(tool.id);
      expect(naBarra.has(tool.id), tool.id).toBe(true);
    }
  });

  it('uma tecla livre não é ferramenta nenhuma', () => {
    expect(toolOfKey('ç')).toBe(null);
    expect(toolOfKey('ç'.toUpperCase())).toBe(null);
  });

  it('o recado "é da Montagem. Ctrl+Tab troca de modo" saiu do programa', () => {
    expect('toolWrongMode' in toolRegistry).toBe(false);
    const fontes = tsFiles(resolve(__dirname, '../src'));
    const comRecado = fontes.filter((f) => /Ctrl\+Tab troca de modo|é da Montagem/.test(readFileSync(f, 'utf8')));
    expect(comRecado).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 21 — texto quebrado
// ---------------------------------------------------------------------------

/**
 * O rastro de UTF-8 lido como Latin-1.
 *
 * `Ã` seguido de um caractere de continuação (U+0080 a U+00BF) nunca é texto
 * legítimo: é o `ã`, o `ç` ou o `õ` que passaram duas vezes pelo decodificador.
 * **`Ã` sozinho é legítimo** — "NÃO", em maiúsculas, aparece em comentário — e
 * por isso a regra é a DUPLA, e não a letra.
 */
const MOJIBAKE = /[ÃÂ][-¿]/;

function tsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry === 'backup') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) tsFiles(full, out);
    else if (entry.endsWith('.ts') || entry.endsWith('.mts')) out.push(full);
  }
  return out;
}

describe('nenhum texto quebrado no código', () => {
  it('nenhum .ts do projeto tem o rastro de UTF-8 lido como Latin-1', () => {
    const raiz = resolve(__dirname, '..', '..');
    const pastas = ['editor/src', 'editor/testes', 'runtime/src', 'runtime/testes', 'ferramentas/src']
      .map((p) => resolve(raiz, p))
      .filter((p) => {
        try { return statSync(p).isDirectory(); } catch { return false; }
      });

    const sujos: string[] = [];
    for (const pasta of pastas) {
      for (const arquivo of tsFiles(pasta)) {
        const texto = readFileSync(arquivo, 'utf8');
        const linhas = texto.split('\n');
        for (let i = 0; i < linhas.length; i++) {
          if (MOJIBAKE.test(linhas[i]!)) {
            sujos.push(`${arquivo.slice(raiz.length + 1)}:${i + 1}`);
          }
        }
      }
    }
    expect(sujos).toEqual([]);
  });

  it('a regra pega a dupla, e deixa passar o NAO em maiusculas', () => {
    // Os exemplos vao em escapes de proposito: este arquivo passa pela
    // varredura que ele mesmo escreve, e um c-cedilha quebrado escrito a mao
    // aqui derrubaria o teste sem que houvesse defeito nenhum no editor.
    expect(MOJIBAKE.test('Anima\u00c3\u00a7\u00c3\u00a3o')).toBe(true);
    expect(MOJIBAKE.test('Repeti\u00c3\u00a7\u00c3\u00b5es')).toBe(true);
    expect(MOJIBAKE.test('V\u00c3\u00addeo')).toBe(true);
    // O espaco duro (nbsp) quebrado vira A-circunflexo seguido do proprio nbsp.
    expect(MOJIBAKE.test('dois\u00c2\u00a0espacos')).toBe(true);
    // A letra sozinha, em maiusculas, e portugues de verdade: NAO passa a ser
    // problema so porque comeca com a mesma letra.
    expect(MOJIBAKE.test('V\u00cdDEO (MP4) N\u00c3O SAI DAQUI')).toBe(false);
    expect(MOJIBAKE.test('Anima\u00e7\u00e3o, v\u00eddeo, repeti\u00e7\u00f5es')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 22 — nenhum item cinza para sempre
// ---------------------------------------------------------------------------

describe('nenhum item de menu fica cinza para sempre', () => {
  const menus = allMenus({
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
  });

  it('os sete menus passam na auditoria', () => {
    const erros: MenuViolation[] = auditMenus(menus);
    expect(erros).toEqual([]);
  });

  it('nenhum item nasce apagado prometendo um lote', () => {
    const prometidos: string[] = [];
    for (const menu of menus) {
      for (const item of flatEntries(menu.entries)) {
        if (item.enabled === false && /vem no lote/i.test(item.hint ?? '')) {
          prometidos.push(`${menu.label} → ${item.label}`);
        }
      }
    }
    expect(prometidos).toEqual([]);
  });

  it('a auditoria RECUSA um item cinza para sempre, se ele voltar', () => {
    const erros = auditMenus([{
      label: 'Arquivo',
      entries: [{ label: 'Um dia', action: 'um-dia', enabled: false, hint: 'Vem no lote 99' }],
    }] as Parameters<typeof auditMenus>[0]);
    expect(erros.length).toBeGreaterThan(0);
    expect(erros[0]!.regra).toContain('cinza para sempre');
  });

  it('os nove que eram cinzas estão nos menus, com ação e tecla', () => {
    const porAcao = new Map<string, { label: string; shortcut?: string; enabled: boolean }>();
    for (const menu of menus) {
      for (const item of flatEntries(menu.entries)) {
        porAcao.set(item.action, {
          label: item.label,
          ...(item.shortcut === undefined ? {} : { shortcut: item.shortcut }),
          enabled: item.enabled,
        });
      }
    }
    const esperados: Array<[string, string | undefined]> = [
      ['abrir-recente', undefined],
      ['sair', undefined],
      ['selecionar-tudo', 'Ctrl+A'],
      ['buscar', 'Ctrl+F'],
      ['novo-imagem', undefined],
      ['tocar-tras', 'Shift+Espaço'],
      ['chave-anterior-escolhido', 'Shift+↑'],
      ['chave-seguinte-escolhido', 'Shift+↓'],
      ['selecionar-chaves', undefined],
    ];
    for (const [acao, tecla] of esperados) {
      const item = porAcao.get(acao);
      expect(item, acao).toBeDefined();
      expect(item!.enabled, acao).toBe(true);
      if (tecla !== undefined) expect(item!.shortcut, acao).toBe(tecla);
    }
  });

  it('o décimo saiu do menu, e está escrito por quê', () => {
    const acoes = new Set<string>();
    for (const menu of menus) for (const item of flatEntries(menu.entries)) acoes.add(item.action);
    expect(acoes.has('novo-esqueleto-filho')).toBe(false);
    expect(MOVED_OUT.length).toBeGreaterThan(0);
    const linha = MOVED_OUT.find((item) => item.label.includes('Esqueleto filho'));
    expect(linha).toBeDefined();
    expect(linha!.why.length).toBeGreaterThan(40);
  });

  it('nenhum separador virou item, e todo item tem nome', () => {
    for (const menu of menus) {
      for (const item of menu.entries) {
        if (isSeparator(item)) continue;
        expect(item.label.trim(), menu.label).not.toBe('');
      }
    }
  });
});

// ---------------------------------------------------------------------------
// As peças puras das funções novas
// ---------------------------------------------------------------------------

describe('a lista dos arquivos recentes', () => {
  const linha = (name: string, at: number): RecentFile => ({ name, at });

  it('o mais novo fica na frente e não repete nome', () => {
    let lista: RecentFile[] = [];
    lista = withRecent(lista, 'heroi.bone', 1);
    lista = withRecent(lista, 'mecha.bone', 2);
    lista = withRecent(lista, 'heroi.bone', 3);
    expect(lista.map((item) => item.name)).toEqual(['heroi.bone', 'mecha.bone']);
    expect(lista[0]!.at).toBe(3);
  });

  it('guarda no máximo cinco, e o sexto empurra o mais velho', () => {
    let lista: RecentFile[] = [];
    for (let i = 1; i <= 7; i++) lista = withRecent(lista, `a${i}.bone`, i);
    expect(lista.length).toBe(MAX_RECENT);
    expect(lista.map((item) => item.name)).toEqual(['a7.bone', 'a6.bone', 'a5.bone', 'a4.bone', 'a3.bone']);
  });

  it('nome vazio não entra', () => {
    expect(withRecent([linha('a.bone', 1)], '   ', 2).map((i) => i.name)).toEqual(['a.bone']);
  });

  it('texto estragado devolve lista vazia, e nunca estoura', () => {
    expect(parseRecent(null)).toEqual([]);
    expect(parseRecent('')).toEqual([]);
    expect(parseRecent('{isto não é json')).toEqual([]);
    expect(parseRecent('{"name":"x"}')).toEqual([]);
    expect(parseRecent('[{"name":"a.bone","at":7},{"nao":"tem nome"},null]'))
      .toEqual([{ name: 'a.bone', at: 7 }]);
    // Sem `at`, ele vale zero: a linha continua servindo para abrir.
    expect(parseRecent('[{"name":"b.bone"}]')).toEqual([{ name: 'b.bone', at: 0 }]);
  });
});

describe('a busca da Árvore', () => {
  const row = (name: string, detail?: string): TreeRow => ({
    kind: 'bone', id: `x:${name}`, name, depth: 0, index: 0,
    ...(detail === undefined ? {} : { detail }),
  });

  it('acha sem acento e sem caixa, no nome e no detalhe', () => {
    expect(matchesSearch(row('máscara'), 'mascara')).toBe(true);
    expect(matchesSearch(row('MÃO'), 'mao')).toBe(true);
    expect(matchesSearch(row('forearm_b'), 'FORE')).toBe(true);
    expect(matchesSearch(row('ik_arm', 'cinemática inversa'), 'inversa')).toBe(true);
    expect(matchesSearch(row('hips'), 'perna')).toBe(false);
  });

  it('busca vazia mostra tudo', () => {
    expect(matchesSearch(row('hips'), '')).toBe(true);
    expect(matchesSearch(row('hips'), '   ')).toBe(true);
  });
});
});

// ---------------------------------------------------------------------------
// chegar no programa (lote 36) — era `lote36-chegar-no-programa.test.ts`
// ---------------------------------------------------------------------------

describe('chegar no programa (lote 36)', () => {
/**
 * Lote 36 — anotações 23 e 24: chegar no programa.
 *
 * 23. **Soltar arquivo na janela** não fazia nada. Agora faz o que o menu faria:
 *     `.bone` abre, `.psd` importa, projeto de outro programa importa, imagem
 *     vai para o atlas. Quem decide é o `dropPlan`, que é puro.
 * 24. **Documento novo não dizia o que fazer.** Agora mostra três botões no meio
 *     da cena, e eles somem no primeiro osso ou na primeira imagem. E nasceu o
 *     `heroi.psd`, que faltava para o passo 1 do manual ser percorrível.
 *
 * O teste do PSD é de ponta a ponta, e roda os dois programas de verdade:
 * `montar-psd.mjs` gera, `importar-psd.mjs` lê de volta, e o desenho tem que
 * cair no mesmo lugar.
 */
const RAIZ = resolve(__dirname, '..', '..');
const PSD = resolve(RAIZ, 'formato', 'exemplos', 'heroi.psd');

// ---------------------------------------------------------------------------
// 23 — o que fazer com o que caiu na janela
// ---------------------------------------------------------------------------

describe('soltar arquivo na janela', () => {
  it('um esqueleto com as imagens junto: abre, e o resto vai junto', () => {
    expect(dropPlan(['heroi.bone', 'heroi.atlas.json', 'heroi.png'])).toEqual({
      kind: 'abrir',
      skeleton: 'heroi.bone',
      images: ['heroi.atlas.json', 'heroi.png'],
    });
    expect(dropPlan(['heroi.boneb'])).toEqual({
      kind: 'abrir', skeleton: 'heroi.boneb', images: [],
    });
  });

  it('um PSD sozinho: importa', () => {
    expect(dropPlan(['personagem.psd'])).toEqual({ kind: 'psd', file: 'personagem.psd' });
    expect(dropPlan(['grande.PSB'])).toEqual({ kind: 'psd', file: 'grande.PSB' });
    expect(dropPlan(['a.psd', 'b.psd']).kind).toBe('nada');
  });

  it('dois esqueletos: PERGUNTA qual abrir, em vez de recusar', () => {
    // O plano do lote dizia "um esqueleto por vez, é erro". Recusar seria
    // errado: o próprio herói vem com a espada.bone do lado, que é um esqueleto
    // filho e faz parte do mesmo projeto.
    expect(dropPlan(['heroi.bone', 'espada.bone', 'heroi.png'])).toEqual({
      kind: 'escolher',
      skeletons: ['heroi.bone', 'espada.bone'],
      images: ['heroi.png'],
    });
  });

  it('projeto de outro programa, e imagens soltas', () => {
    expect(dropPlan(['boneco.scml'])).toEqual({ kind: 'outro', files: ['boneco.scml'] });
    expect(dropPlan(['spine.json', 'spine.atlas']).kind).toBe('outro');
    expect(dropPlan(['mao.png', 'pe.png'])).toEqual({
      kind: 'imagens', files: ['mao.png', 'pe.png'],
    });
  });

  it('o atlas sozinho não abre nada, e diz o que falta', () => {
    const plano = dropPlan(['heroi.atlas.json']);
    expect(plano.kind).toBe('nada');
    expect(plano.kind === 'nada' ? plano.why : '').toContain('.bone');
    // `.atlas.json` é atlas, e não "arquivo .json de outro programa".
    expect(isAtlasName('heroi.atlas.json')).toBe(true);
    expect(isAtlasName('spine.json')).toBe(false);
  });

  it('o que ele não conhece vira uma frase, e nunca um estouro', () => {
    const plano = dropPlan(['contrato.pdf', 'musica.mp3']);
    expect(plano.kind).toBe('nada');
    expect(plano.kind === 'nada' ? plano.why : '').toContain('pdf');
    expect(dropPlan([])).toEqual({ kind: 'nada', why: 'Nenhum arquivo veio no arrasto' });
    expect(dropPlan(['   '])).toEqual({ kind: 'nada', why: 'Nenhum arquivo veio no arrasto' });
  });

  it('a faixa diz o que VAI acontecer, com o nome do arquivo', () => {
    expect(dropHintFor(dropPlan(['heroi.bone']))).toBe('Solte para abrir heroi.bone');
    expect(dropHintFor(dropPlan(['arte.psd']))).toBe('Solte para importar arte.psd');
    // Lote 59: imagem solta vai para a aba Imagens, e não para a cena.
    expect(dropHintFor(dropPlan(['mao.png']))).toBe('Solte para pôr mao.png na aba Imagens');
    expect(dropHintFor(dropPlan(['a.png', 'b.png']))).toBe('Solte para pôr 2 imagens na aba Imagens');
    expect(dropHintFor(dropPlan(['x.pdf']))).toContain('Não sei o que fazer');
  });

  it('só quem troca o documento inteiro pergunta antes de descartar', () => {
    expect(replacesDocument(dropPlan(['heroi.bone']))).toBe(true);
    expect(replacesDocument(dropPlan(['a.bone', 'b.bone']))).toBe(true);
    expect(replacesDocument(dropPlan(['boneco.scml']))).toBe(true);
    // PSD e imagem ENTRAM no documento aberto: não há o que descartar.
    expect(replacesDocument(dropPlan(['arte.psd']))).toBe(false);
    expect(replacesDocument(dropPlan(['mao.png']))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 24 — as boas-vindas
// ---------------------------------------------------------------------------

describe('as boas-vindas do documento vazio', () => {
  const vazio = { bone: { version: '1.0' }, bones: [{ name: 'root' }] } as unknown as BoneFile;

  it('são cinco, com ícone que existe, nome e frase', () => {
    // Lote 59: Abrir pasta entrou na frente — começar como o Spriter.
    // 05/11/2026: Abrir a oficina, o exemplo com tudo junto.
    expect(WELCOME_BUTTONS.length).toBe(5);
    for (const botao of WELCOME_BUTTONS) {
      expect(hasIcon(botao.icon), botao.icon).toBe(true);
      expect(botao.label.trim()).not.toBe('');
      expect(botao.hint.length).toBeGreaterThan(15);
    }
    expect(WELCOME_BUTTONS.map((b) => b.action))
      .toEqual(['abrir-pasta', 'importar-psd', 'abrir-exemplo', 'abrir-oficina', 'comecar-vazio']);
  });

  it('um arquivo só com a raiz está vazio; com um osso a mais, não', () => {
    expect(isEmptyDocument(vazio)).toBe(true);
    expect(isEmptyDocument({ ...vazio, bones: [{ name: 'root' }, { name: 'hips' }] } as BoneFile))
      .toBe(false);
  });

  it('um slot, um desenho ou uma imagem no atlas já tiram as boas-vindas', () => {
    expect(isEmptyDocument({ ...vazio, slots: [{ name: 'corpo', bone: 'root' }] } as BoneFile))
      .toBe(false);
    const comDesenho = {
      ...vazio,
      skins: [{ name: 'default', attachments: { corpo: { corpo: { type: 'region' } } } }],
    } as unknown as BoneFile;
    expect(isEmptyDocument(comDesenho)).toBe(false);
    // Imagem importada não mora no `.bone`: ela vem de fora, e conta.
    expect(isEmptyDocument(vazio, true)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// O `heroi.psd`, de ponta a ponta
// ---------------------------------------------------------------------------

describe('o PSD de exemplo', () => {
  it('existe, e é um PSD de verdade', () => {
    expect(existsSync(PSD), 'formato/exemplos/heroi.psd').toBe(true);
    const bytes = readFileSync(PSD);
    // '8BPS', versão 1, 8 bits, modo RGB.
    expect(bytes.subarray(0, 4).toString('latin1')).toBe('8BPS');
    expect(bytes.readUInt16BE(4)).toBe(1);
    expect(bytes.readUInt16BE(22)).toBe(8);
    expect(bytes.readUInt16BE(24)).toBe(3);
    expect(statSync(PSD).size).toBeGreaterThan(10_000);
  });

  it('importado de volta, cada peça cai no MESMO lugar, até o pixel', () => {
    const pasta = mkdtempSync(join(tmpdir(), 'recorte-psd-'));
    const saida = join(pasta, 'volta');
    execFileSync('node', [resolve(RAIZ, 'ferramentas', 'importar-psd.mjs'), PSD, saida], {
      cwd: RAIZ, stdio: 'pipe',
    });
    const volta = `${saida}.bone`;
    expect(existsSync(volta)).toBe(true);

    const medida = execFileSync('node', [
      resolve(RAIZ, 'ferramentas', 'conferir-arte.mjs'),
      resolve(RAIZ, 'formato', 'exemplos', 'heroi.bone'),
      volta,
    ], { cwd: RAIZ, encoding: 'utf8' });
    const conta = JSON.parse(medida) as {
      pares: number; piorCentro: number; piorTamanho: number;
    };
    expect(conta.pares).toBe(19);
    expect(conta.piorCentro).toBeLessThanOrEqual(1);
    expect(conta.piorTamanho).toBeLessThanOrEqual(1);
  }, 120_000);
});
});

// ---------------------------------------------------------------------------
// conserto atlas e primeira animacao — era `conserto-atlas-e-primeira-animacao.test.ts`
// ---------------------------------------------------------------------------

describe('conserto atlas e primeira animacao', () => {
/**
 * Conserto de 10/09/2026 — dois pedidos do Humberto, na tela do herói.
 *
 *   1. *"Quando arrasto uma imagem para dentro as peças quebram."*
 *      Soltar um PNG na janela chamava `setAssets([o novo pacote])`, e isso
 *      trocava TODOS os atlas pelo recém-empacotado: as dezenove peças do herói
 *      ficavam sem imagem, e o rodapé contava 42 avisos. Agora o pacote entra
 *      AO LADO do atlas que veio com o arquivo, e com nome que não bate com ele.
 *
 *   2. *"E se o programa já começasse na primeira animação?"*
 *      `setFile` abre a primeira animação do arquivo. O arquivo que lembra a
 *      animação aberta ganha; sem animação nenhuma, fica a Montagem.
 */
const EXEMPLOS = resolve(__dirname, '..', '..', 'formato', 'exemplos');

function heroi(): BoneFile {
  return JSON.parse(readFileSync(resolve(EXEMPLOS, 'heroi.bone'), 'utf8')) as BoneFile;
}

function atlasDoHeroi(): AtlasData {
  return loadAtlas(JSON.parse(readFileSync(resolve(EXEMPLOS, 'heroi.atlas.json'), 'utf8')));
}

/** Uma "imagem" qualquer: o documento só a guarda, nunca a desenha no teste. */
function imagem(nome: string): CanvasImageSource {
  return { nome } as unknown as CanvasImageSource;
}

/** Um atlas de uma página e uma região, como o empacotador devolve. */
function atlasCom(pagina: string, regiao: string): AtlasData {
  return loadAtlas({
    atlas: { version: '1.0', generator: 'teste' },
    scale: 1,
    pages: [{ name: pagina, image: `${pagina}.png`, width: 8, height: 8 }],
    regions: [{ name: regiao, page: 0, x: 0, y: 0, width: 4, height: 4 }],
  });
}

/** O que `build` devolveria para um item só, sem precisar de um canvas. */
function pacote(base: string, regiao: string): ImportedAtlas {
  const data = atlasCom(base, regiao);
  return {
    fileName: `${base}.atlas.json`,
    packed: {
      atlas: {}, scale: 1, usage: 1, imageCount: 1,
      pages: [{ name: base, image: `${base}.png`, width: 8, height: 8, pixels: new Uint8Array(0) }],
      regions: [{ name: regiao, page: 0, x: 0, y: 0, width: 4, height: 4 }],
    } as unknown as ImportedAtlas['packed'],
    data,
    images: new Map([[`${base}.png`, imagem(base)]]),
    options: {},
  };
}

/** O herói como o programa o abre: com o atlas e a página dele carregados. */
function heroiAberto(): Doc {
  const doc = new Doc(createEmptyFile());
  doc.setFile(heroi(), {
    path: 'heroi.bone',
    atlases: [atlasDoHeroi()],
    images: new Map([['heroi.png', imagem('heroi')]]),
  });
  return doc;
}

// ---------------------------------------------------------------------------
// 1. Soltar uma imagem não apaga as peças
// ---------------------------------------------------------------------------

describe('mergedAssets: o pacote novo entra ao lado, e só o pacote antigo do acervo sai', () => {
  it('mantém o atlas que veio com o arquivo e acrescenta o importado', () => {
    const alheio = atlasCom('heroi', 'body');
    const novo = atlasCom('heroi-imagens', 'download');
    const atual = { atlases: [alheio], images: new Map([['heroi.png', imagem('heroi')]]) };

    const junto = mergedAssets(atual, null, { data: novo, images: new Map([['heroi-imagens.png', imagem('novo')]]) });

    expect(junto.atlases).toEqual([alheio, novo]);
    expect([...junto.images.keys()]).toEqual(['heroi.png', 'heroi-imagens.png']);
  });

  it('o pacote anterior do próprio acervo sai, porque o novo o contém inteiro', () => {
    const alheio = atlasCom('heroi', 'body');
    const meuAntigo = atlasCom('heroi-imagens', 'download');
    const meuNovo = atlasCom('heroi-imagens', 'download');
    const atual = {
      atlases: [alheio, meuAntigo],
      images: new Map([['heroi.png', imagem('heroi')], ['heroi-imagens.png', imagem('antigo')]]),
    };

    const junto = mergedAssets(atual, meuAntigo, { data: meuNovo, images: new Map([['heroi-imagens.png', imagem('novo')]]) });

    expect(junto.atlases).toEqual([alheio, meuNovo]);
    expect(junto.images.get('heroi-imagens.png')).toEqual(imagem('novo'));
    expect(junto.images.get('heroi.png')).toEqual(imagem('heroi'));
  });
});

describe('atlasBaseName: o pacote nunca leva o nome de um atlas que veio com o arquivo', () => {
  it('heroi.bone com heroi.atlas.json alheio dá heroi-imagens, e depois heroi-imagens2', () => {
    const doc = heroiAberto();
    expect(atlasBaseName(doc)).toBe('heroi-imagens');

    doc.file.assets = { atlases: ['heroi.atlas.json', 'heroi-imagens.atlas.json'] };
    expect(atlasBaseName(doc)).toBe('heroi-imagens2');
  });

  it('o atlas do próprio acervo não conta: ele é para ter o mesmo nome', () => {
    const doc = heroiAberto();
    setImportedAtlas(doc, pacote('heroi', 'download'));
    expect(atlasBaseName(doc)).toBe('heroi');
  });

  it('documento sem nome continua "atlas"', () => {
    expect(atlasBaseName(new Doc(createEmptyFile()))).toBe('atlas');
  });
});

describe('Importar imagem no herói aberto', () => {
  it('as dezenove peças continuam com imagem, e o arquivo aponta para os dois atlas', () => {
    const doc = heroiAberto();
    const antes = doc.warnings.filter((w) => w.includes('imagem não encontrada'));
    expect(antes).toEqual([]);

    doc.run(new ImportImagesCommand('Importar imagem', pacote('heroi-imagens', 'download'), ['download']));

    expect(doc.atlases).toHaveLength(2);
    expect(doc.imageFor({ name: 'heroi', image: 'heroi.png' } as never)).toEqual(imagem('heroi'));
    expect(doc.warnings.filter((w) => w.includes('imagem não encontrada'))).toEqual([]);
    expect(doc.file.assets?.atlases).toEqual(['heroi.atlas.json', 'heroi-imagens.atlas.json']);
    expect(doc.file.slots?.some((slot) => slot.name === 'download')).toBe(true);
    expect(importedAtlas(doc)?.fileName).toBe('heroi-imagens.atlas.json');
  });

  it('desfazer devolve o atlas do herói sozinho', () => {
    const doc = heroiAberto();
    doc.run(new ImportImagesCommand('Importar imagem', pacote('heroi-imagens', 'download'), ['download']));
    doc.undo();

    expect(doc.atlases).toHaveLength(1);
    expect(doc.file.assets?.atlases).toEqual(['heroi.atlas.json']);
    expect(doc.file.slots?.some((slot) => slot.name === 'download')).toBe(false);
    expect(importedAtlas(doc)).toBeNull();
  });

  it('a segunda importação troca o pacote anterior, e o do herói fica', () => {
    const doc = heroiAberto();
    doc.run(new ImportImagesCommand('Importar imagem', pacote('heroi-imagens', 'download'), ['download']));
    doc.run(new ImportImagesCommand('Importar imagem', pacote('heroi-imagens', 'outra'), ['outra']));

    expect(doc.atlases).toHaveLength(2);
    expect(doc.atlases[0].regions.some((r) => r.name === 'body')).toBe(true);
    expect(doc.atlases[1].regions.map((r) => r.name)).toEqual(['outra']);
  });
});

// ---------------------------------------------------------------------------
// 2. O programa começa na primeira animação
// ---------------------------------------------------------------------------

describe('setFile abre a primeira animação', () => {
  it('o herói abre em "idle", e o rodapé diz Animação: idle', () => {
    const doc = heroiAberto();
    expect(doc.animation).toBe('idle');
    expect(whereLabel({ animation: doc.animation, body: 'heroi' }).title).toBe('Animação: idle');
  });

  it('o arquivo que lembra a animação aberta ganha', () => {
    const file = heroi();
    (file as { extensions?: Record<string, unknown> }).extensions = { [EDITOR_EXTENSION]: { animation: 'walk' } };
    const doc = new Doc(createEmptyFile());
    doc.setFile(file);
    expect(doc.animation).toBe('walk');
  });

  it('lembrança de animação que não existe mais cai na primeira', () => {
    const file = heroi();
    (file as { extensions?: Record<string, unknown> }).extensions = { [EDITOR_EXTENSION]: { animation: 'sumida' } };
    const doc = new Doc(createEmptyFile());
    doc.setFile(file);
    expect(doc.animation).toBe('idle');
  });

  it('sem animação nenhuma, fica a base, e o rodapé diz Base', () => {
    const doc = new Doc(heroi());
    doc.setFile(createEmptyFile());
    expect(doc.animation).toBeNull();
    expect(whereLabel({ animation: doc.animation, body: 'heroi.bone' }).title).toBe('Base: heroi');
  });
});
});

// ---------------------------------------------------------------------------
// Degrau 4b (17/09/2026): a pasta com manifest.json é um projeto (spec 2.9)
// ---------------------------------------------------------------------------

import { Projeto, emptyManifest, readProjectLists, writeProjectLists } from '../src/doc/projeto.js';
import { MANIFEST_NAME, joinBase, openProjectFiles, openProjectInto, projectFilesToSave, projectOpenedNotice, readManifestInFolder, readManifestText, skeletonsBaseOf, uriOfPath } from '../src/io/project-open.js';
import { entitySaveLines, uriForOpened } from '../src/io/open-save.js';
import { fileCites } from '../src/ui/shell-file.js';
import { NEUTRAL_MENU_STATE } from '../src/ui/menus.js';
import type { FolderDirectoryHandle, FolderFileHandle } from '../src/io/project-folder.js';
import { ACTION_TABLE } from '../src/ui/actions-table.js';
import type { MenuState as EstadoDoMenu } from '../src/ui/menus.js';

describe('abrir e salvar a pasta do projeto (degrau 4b)', () => {
  const C290 = resolve(__dirname, '../../conformidade/casos/C-290-virada-corte-seco');
  const texto = (nome: string): string => readFileSync(resolve(C290, nome), 'utf8');
  const manifesto = (): string => JSON.stringify(writeProjectLists(emptyManifest('entrada.bone'), {
    corpos: ['entrada.bone', 'lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
  }));

  /** Um arquivo de mentira, como a pasta do navegador o entrega. */
  const arquivo = (name: string, conteudo: string): FolderFileHandle => ({
    kind: 'file', name, getFile: async () => new File([conteudo], name),
  });
  const pasta = (entries: Array<FolderFileHandle | FolderDirectoryHandle>): FolderDirectoryHandle => ({
    kind: 'directory', name: 'lobo', values: async function* values() { yield* entries; },
  });
  /** A mesma pasta de mentira, com subpastas — degrau 10, 10.7. */
  const pastaCom = (
    entries: Array<FolderFileHandle | FolderDirectoryHandle>,
    subpastas: Record<string, FolderDirectoryHandle>,
  ): FolderDirectoryHandle => ({
    kind: 'directory',
    name: 'lobo',
    values: async function* values() { yield* entries; yield* Object.values(subpastas); },
    getDirectoryHandle: async (name: string) => {
      const found = subpastas[name];
      if (found === undefined) throw new Error(`sem a subpasta ${name}`);
      return found;
    },
  });

  it('o manifesto se reconhece pelo texto; um .bone não é manifesto', () => {
    expect(readManifestText(manifesto())?.main).toBe('entrada.bone');
    expect(readManifestText(texto('entrada.bone'))).toBe(null);
    expect(readManifestText('isto não é json')).toBe(null);
    expect(MANIFEST_NAME).toBe('manifest.json');
  });

  it('a pasta com manifest.json: o manifesto é lido; sem ele, nulo', async () => {
    const com = pasta([arquivo('entrada.bone', texto('entrada.bone')), arquivo('manifest.json', manifesto())]);
    expect((await readManifestInFolder(com))?.main).toBe('entrada.bone');
    const sem = pasta([arquivo('entrada.bone', texto('entrada.bone'))]);
    expect(await readManifestInFolder(sem)).toBe(null);
  });

  it('abre os dois corpos da pasta e monta o projeto em volta do documento da casca', async () => {
    const dir = pasta([
      arquivo('manifest.json', manifesto()),
      arquivo('entrada.bone', texto('entrada.bone')),
      arquivo('lobisomem.bone', texto('lobisomem.bone')),
    ]);
    const manifest = (await readManifestInFolder(dir))!;
    const lido = (await openProjectFiles(dir, manifest))!;
    expect(lido).not.toBe(null);
    expect([...lido.bodies.keys()]).toEqual(['entrada.bone', 'lobisomem.bone']);
    expect(lido.mainHandle?.name).toBe('entrada.bone');
    expect(lido.lists.emFoco).toBe('entrada.bone');

    const doc = new Doc(createEmptyFile());
    const projeto = new Projeto(doc);
    openProjectInto(projeto, lido);
    expect(projeto.outrosCorpos).toEqual(['lobisomem.bone']);
    expect(doc.file.skeleton?.name).toBe('homem');
    expect(doc.animation).toBe('transformar');
    doc.time = 0.75;
    expect(doc.body).toBe('lobisomem.bone');
    expect(doc.skeleton?.findBone('rabo')).not.toBe(null);
    expect(projectOpenedNotice('lobo', lido.lists)).toBe('Pasta lobo: projeto com 2 bases reaberto, em foco entrada.bone');
  });

  it('corpo listado que a pasta não tem: aviso, e o projeto abre com os que há', async () => {
    const dir = pasta([arquivo('manifest.json', manifesto()), arquivo('entrada.bone', texto('entrada.bone'))]);
    const lido = (await openProjectFiles(dir, (await readManifestInFolder(dir))!))!;
    expect([...lido.bodies.keys()]).toEqual(['entrada.bone']);
    expect(lido.warnings[0]).toContain('lobisomem.bone');
    const doc = new Doc(createEmptyFile());
    const projeto = new Projeto(doc);
    openProjectInto(projeto, lido);
    expect([...projeto.corpos.keys()]).toEqual(['entrada.bone']);
    // O foco que falta na pasta: não é um projeto que dê para abrir.
    const semFoco = pasta([arquivo('manifest.json', manifesto()), arquivo('lobisomem.bone', texto('lobisomem.bone'))]);
    expect(await openProjectFiles(semFoco, (await readManifestInFolder(semFoco))!)).toBe(null);
  });

  it('salvar: o herói sozinho não ganha manifesto; dois corpos gravam o outro .bone e o manifest.json', () => {
    const doc = new Doc(createEmptyFile(), { path: 'heroi.bone' });
    const projeto = new Projeto(doc);
    expect(projectFilesToSave(projeto, 'heroi.bone')).toEqual([]);

    const manifest = JSON.parse(manifesto()) as ReturnType<typeof emptyManifest>;
    projeto.open(manifest, readProjectLists(manifest), new Map([
      ['entrada.bone', { file: JSON.parse(texto('entrada.bone')) as BoneFile, options: {} }],
      ['lobisomem.bone', { file: JSON.parse(texto('lobisomem.bone')) as BoneFile, options: {} }],
    ]));
    const files = projectFilesToSave(projeto, 'homem-novo.bone');
    expect(files.map((f) => f.name)).toEqual(['lobisomem.bone', 'manifest.json']);
    const salvo = JSON.parse(files[1]!.text) as ReturnType<typeof emptyManifest>;
    // O foco foi salvo com outro nome: o manifesto segue o nome novo.
    expect(salvo.main).toBe('homem-novo.bone');
    expect(salvo.skeletons).toEqual(['homem-novo.bone', 'lobisomem.bone', 'entrada.bone']);
    expect(salvo.extras).toEqual({ RECORTE_projeto: { corpos: ['homem-novo.bone', 'lobisomem.bone'], entidades: [], emFoco: 'homem-novo.bone' } });
    expect((JSON.parse(files[0]!.text) as BoneFile).skeleton?.name).toBe('lobisomem');
  });

  // -------------------------------------------------------------------------
  // Degrau 10 (18/09/2026): o projeto é a caixa — P2, P3, E4, E17, 10.7
  // -------------------------------------------------------------------------

  it('uri e caminho: a base do corpo em foco separa os dois (10.7)', () => {
    expect(skeletonsBaseOf(null)).toBe('');
    expect(skeletonsBaseOf({ bone: { version: '0.2' }, bones: [] } as unknown as BoneFile)).toBe('');
    const comBase = { bone: { version: '0.2' }, bones: [], assets: { skeletonsBase: 'corpos' } } as unknown as BoneFile;
    // A base sai sempre terminada em barra: é a junção da §2.8.
    expect(skeletonsBaseOf(comBase)).toBe('corpos/');
    expect(joinBase('corpos/', 'lobisomem.bone')).toBe('corpos/lobisomem.bone');
    expect(joinBase('', 'lobisomem.bone')).toBe('lobisomem.bone');
    expect(uriOfPath('corpos/', 'corpos/lobisomem.bone')).toBe('lobisomem.bone');
    // Caminho que não começa pela base volta inteiro: nunca se corta no escuro.
    expect(uriOfPath('corpos/', 'outra/lobisomem.bone')).toBe('outra/lobisomem.bone');
  });

  it('salvar com skeletonsBase: o manifesto lista caminhos, e a uri da chave body não muda', () => {
    const entrada = JSON.parse(texto('entrada.bone')) as BoneFile;
    entrada.assets = { ...(entrada.assets ?? {}), skeletonsBase: 'corpos/' };
    const doc = new Doc(createEmptyFile(), { path: 'entrada.bone' });
    const projeto = new Projeto(doc);
    const manifest = JSON.parse(manifesto()) as ReturnType<typeof emptyManifest>;
    projeto.open(manifest, readProjectLists(manifest), new Map([
      ['entrada.bone', { file: entrada, options: {} }],
      ['lobisomem.bone', { file: JSON.parse(texto('lobisomem.bone')) as BoneFile, options: {} }],
    ]));
    const files = projectFilesToSave(projeto, 'entrada.bone');
    // O corpo vai para a subpasta; o foco fica onde foi salvo.
    expect(files.map((f) => f.name)).toEqual(['corpos/lobisomem.bone', 'manifest.json']);
    const salvo = JSON.parse(files[1]!.text) as ReturnType<typeof emptyManifest>;
    expect(salvo.extras).toEqual({
      RECORTE_projeto: { corpos: ['entrada.bone', 'corpos/lobisomem.bone'], entidades: [], emFoco: 'entrada.bone' },
    });
    // A chave `body` continua dizendo `lobisomem.bone`: quem resolve é o disco.
    expect(files[0]!.name).not.toBe('lobisomem.bone');
    expect(projeto.corpos.has('lobisomem.bone')).toBe(true);
  });

  it('a entidade guardada é gravada junto; a que ninguém leu fica só na lista', () => {
    const doc = new Doc(createEmptyFile(), { path: 'heroi.bone' });
    const projeto = new Projeto(doc);
    // Uma entidade que o projeto abriu (E17) tem documento: o Salvar a grava.
    const espada = new Doc(JSON.parse(texto('lobisomem.bone')) as BoneFile, { path: 'espada.bone' });
    projeto.entidades.add('espada.bone');
    projeto.guardados.set('espada.bone', espada);
    // Uma entidade só listada (veio de um manifesto, ninguém a leu) não tem texto.
    projeto.entidades.add('capacete.bone');
    const files = projectFilesToSave(projeto, 'heroi.bone');
    expect(files.map((f) => f.name)).toEqual(['espada.bone', 'manifest.json']);
    const salvo = JSON.parse(files[1]!.text) as ReturnType<typeof emptyManifest>;
    expect(salvo.extras).toEqual({
      RECORTE_projeto: { corpos: ['heroi.bone'], entidades: ['espada.bone', 'capacete.bone'], emFoco: 'heroi.bone' },
    });
  });

  it('abrir um corpo em subpasta: desce, e o atlas da raiz vai junto (10.7)', async () => {
    const comBase = JSON.parse(texto('entrada.bone')) as BoneFile;
    comBase.assets = { ...(comBase.assets ?? {}), skeletonsBase: 'corpos/' };
    const sub = pasta([arquivo('lobisomem.bone', texto('lobisomem.bone'))]);
    const raiz = pastaCom([
      arquivo('manifest.json', JSON.stringify(writeProjectLists(emptyManifest('entrada.bone'), {
        corpos: ['entrada.bone', 'corpos/lobisomem.bone'], entidades: [], emFoco: 'entrada.bone',
      }))),
      arquivo('entrada.bone', JSON.stringify(comBase)),
    ], { corpos: sub });

    const lido = (await openProjectFiles(raiz, (await readManifestInFolder(raiz))!))!;
    expect(lido).not.toBe(null);
    // As chaves são URIS, não caminhos: é por elas que o Actor acha o corpo.
    expect([...lido.bodies.keys()]).toEqual(['entrada.bone', 'lobisomem.bone']);
    expect(lido.lists.corpos).toEqual(['entrada.bone', 'lobisomem.bone']);
    const doc = new Doc(createEmptyFile());
    const projeto = new Projeto(doc);
    openProjectInto(projeto, lido);
    doc.time = 0.75;
    expect(doc.body).toBe('lobisomem.bone');
    expect(doc.skeleton?.findBone('rabo')).not.toBe(null);
  });

  it('a entidade da pasta fica guardada inteira, e Promover a acha sem ler o disco', async () => {
    const dir = pasta([
      arquivo('manifest.json', JSON.stringify(writeProjectLists(emptyManifest('entrada.bone'), {
        corpos: ['entrada.bone'], entidades: ['lobisomem.bone'], emFoco: 'entrada.bone',
      }))),
      arquivo('entrada.bone', texto('entrada.bone')),
      arquivo('lobisomem.bone', texto('lobisomem.bone')),
    ]);
    const lido = (await openProjectFiles(dir, (await readManifestInFolder(dir))!))!;
    expect([...lido.entities.keys()]).toEqual(['lobisomem.bone']);
    const doc = new Doc(createEmptyFile());
    const projeto = new Projeto(doc);
    openProjectInto(projeto, lido);
    expect(projeto.guardados.has('lobisomem.bone')).toBe(true);
    expect(projeto.promover('lobisomem.bone')).toBe('feito');
    expect(projeto.corpos.has('lobisomem.bone')).toBe(true);
  });

  it('a uri de um arquivo que entra no projeto nunca pisa numa que já existe', () => {
    expect(uriForOpened('C:/arte/espada.bone', [])).toBe('espada.bone');
    expect(uriForOpened('espada.bone', ['espada.bone'])).toBe('espada-2.bone');
    expect(uriForOpened('espada.bone', ['espada.bone', 'espada-2.bone'])).toBe('espada-3.bone');
  });

  it('a pergunta do Novo/Por cima diz o que sabe e ADMITE o que não sabe (E4)', () => {
    const nenhum = entitySaveLines('espada.bone', 0);
    expect(nenhum[0]).toContain('nenhuma base aponta');
    expect(entitySaveLines('espada.bone', 1)[0]).toContain('1 base usa');
    expect(entitySaveLines('espada.bone', 3)[0]).toContain('3 bases usam');
    // Regra 21: onde o programa não sabe, ele avisa — não inventa um número.
    expect(nenhum.join(' ')).toContain('De outros projetos o editor não sabe');
    expect(nenhum.join(' ')).toContain('Por cima muda o arquivo');
  });

  it('quem cita quem: a chave body e o anexo skeleton contam, o resto não', () => {
    const entrada = JSON.parse(texto('entrada.bone')) as BoneFile;
    expect(fileCites(entrada, 'lobisomem.bone')).toBe(true);
    expect(fileCites(entrada, 'capacete.bone')).toBe(false);
    const comEntidade = {
      bone: { version: '0.2' }, bones: [{ name: 'root' }],
      skins: [{ name: 'default', attachments: { mao: { espada: { type: 'skeleton', uri: 'espada.bone' } } } }],
    } as unknown as BoneFile;
    expect(fileCites(comEntidade, 'espada.bone')).toBe(true);
    expect(fileCites(comEntidade, 'escudo.bone')).toBe(false);
  });

  it('o menu Arquivo fala de projeto e de base; trazer base e entidade de fora moram em Base e Entidades', () => {
    const menu = (label: string) => flatEntries(allMenus(NEUTRAL_MENU_STATE).find((g) => g.label === label)!.entries);
    const entries = menu('Arquivo');
    const nomes = entries.map((e) => e.label);
    expect(nomes).toContain('Novo projeto…');
    expect(nomes).toContain('Abrir projeto…');
    expect(nomes).toContain('Abrir pasta do projeto…');
    expect(nomes).toContain('Entregar uma base…');
    expect(nomes).toContain('Salvar a entidade editada…');
    // Rodada 6 (05/10/2026): "Trazer para o projeto ▸" saiu do Arquivo. Os
    // dois de dentro foram, com nome novo, para o menu do assunto deles.
    expect(entries.map((e) => e.action)).not.toContain('abrir-corpo');
    expect(entries.map((e) => e.action)).not.toContain('abrir-entidade');
    const base = menu('Base').find((e) => e.action === 'abrir-corpo');
    const entidade = menu('Tomadas').find((e) => e.action === 'abrir-entidade');
    expect(base?.label).toBe('Trazer uma base de fora…');
    expect(entidade?.label).toBe('Trazer entidade de fora…');
    // Regra 12: todo botão novo com o nome na dica — aqui, o que ele faz.
    const outros = entries.filter((e) => ['Entregar uma base…', 'Salvar a entidade editada…'].includes(e.label));
    expect(outros).toHaveLength(2);
    for (const entry of [base, entidade, ...outros]) expect(entry?.hint ?? '').not.toBe('');
    expect(entries.find((e) => e.label === 'Salvar')?.hint ?? '').toContain('pasta inteira');
  });

  it('Colar outra base aqui está em Animação → Troca de base, é da casca, e só com animação aberta', () => {
    // Rodada 6: o nome era "Colar corpo aqui" (decisão 3: corpo vira base), e
    // ele mora no submenu Troca de base ▸. O id da ação não mudou.
    const row = ACTION_TABLE.find((r) => r.id === 'colar-corpo');
    expect(row).toMatchObject({ owner: 'animacoes', where: 'casca', label: 'Colar outra base aqui' });
    const estado = (animating: boolean): EstadoDoMenu => ({
      canRepack: false, canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
      view: viewMenuState(), lockBones: false, lockDrawings: false, space: 'local',
      compensation: { children: false, drawings: false, boxes: false },
      animating, loop: false, open: {},
    });
    const menu = allMenus(estado(true)).find((g) => g.label === 'Animação')!;
    const troca = flatEntries(menu.entries).find((e) => e.action === 'troca-de-base');
    const entry = flatEntries(troca?.children ?? []).find((e) => e.action === 'colar-corpo');
    expect(entry?.label).toBe('Colar outra base aqui');
    expect(entry?.enabled).toBe(true);
    const fechado = allMenus(estado(false)).find((g) => g.label === 'Animação')!;
    expect(flatEntries(fechado.entries).find((e) => e.action === 'colar-corpo')?.enabled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rodada final, Ficha E, lote 1 (29/09/2026): o `Ctrl+Z` depois de cada gesto
// de entrada
// ---------------------------------------------------------------------------

/*
 * O encargo pedia "importar imagens vira UM passo de desfazer", ligando o
 * `ImportImagesCommand`. Medido no código, o pedido partia de um texto velho:
 * "Importar → Imagens…" saiu no lote 59, por ordem do Humberto (*"no Spriter
 * não existe importar imagens"*), e a imagem solta vai para a aba Imagens, não
 * para o `.bone`. O Planejador aprovou o desvio: o lote prova, gesto por gesto,
 * o que o `Ctrl+Z` faz depois de cada entrada que EXISTE.
 *
 * | Gesto | O que o `Ctrl+Z` deve fazer | Onde está provado |
 * |:---|:---|:---|
 * | PNG solto / Abrir pasta | nada: a imagem não entrou no arquivo | `pasta-do-projeto.test.ts`, "12 entradas na aba, NENHUM slot, câmera e desfazer intocados" |
 * | folha do Aseprite | tirar o desenho E as animações, num passo | `folha-animada.test.ts`, "o gesto inteiro é UM passo de desfazer" |
 * | PSD (acrescentar e substituir) | devolver o arquivo, os atlas e o acervo | aqui |
 * | De outro programa | nada: é um arquivo NOVO, e a pilha começa vazia | aqui |
 */
describe('o Ctrl+Z depois de cada gesto de entrada (rodada final, lote 1)', () => {
  const RAIZ_E = resolve(__dirname, '..', '..');
  const PSD_E = resolve(RAIZ_E, 'formato', 'exemplos', 'heroi.psd');
  const ZLIB = { inflate: (data: Uint8Array) => new Uint8Array(inflateSync(data)) };

  function heroiDoDisco(): Doc {
    const file = JSON.parse(readFileSync(resolve(RAIZ_E, 'formato', 'exemplos', 'heroi.bone'), 'utf8')) as BoneFile;
    return new Doc(file);
  }

  /** O atlas do PSD como o `packPsdLayers` monta, sem as páginas em canvas (não há navegador). */
  function atlasDoPsd(psd: PsdDocument, base: string): PsdAtlas {
    const options = { generator: 'Recorte editor — importar PSD', pageName: base };
    const packed = packAtlas(psdPackerItems(psd), options);
    return {
      fileName: `${base}.atlas.json`, packed,
      data: loadAtlas(JSON.parse(JSON.stringify(packed.atlas))), images: new Map(), options,
    };
  }

  function lerPsd(): PsdDocument {
    return readPsd(new Uint8Array(readFileSync(PSD_E)), ZLIB);
  }

  /*
   * O `substituir` fica VERMELHO até o conserto do E1 (decisão P11): o
   * desfazer devolve o VALOR, e não o LUGAR — `constraints` e `animations`
   * voltam no fim do arquivo. O conserto é geral, no `SnapshotCommand.revert`
   * (`doc/commands.ts`), e é da casca. Não remendar aqui.
   */
  const NOME = {
    acrescentar: 'PSD acrescentar → Ctrl+Z → o arquivo volta letra por letra, os atlas e o acervo',
    substituir: 'E1 (dono: a casca, SnapshotCommand.revert) — PSD substituir → Ctrl+Z → o arquivo volta letra por letra, com as chaves no MESMO lugar',
  } as const;
  for (const mode of ['acrescentar', 'substituir'] as const) {
    it(NOME[mode], () => {
      const doc = heroiDoDisco();
      const texto = JSON.stringify(doc.file);
      const atlas = doc.atlases;
      const acervo = importedStock(doc);
      const psd = lerPsd();
      const pacote = atlasDoPsd(psd, 'heroi-imagens');

      doc.run(new ImportPsdCommand(psd, pacote, { mode, atlasName: pacote.fileName, name: 'heroi' }));
      expect(JSON.stringify(doc.file)).not.toBe(texto);
      expect(doc.atlases).toContain(pacote.data);

      doc.undo();
      expect(JSON.stringify(doc.file)).toBe(texto);
      expect(doc.atlases).toEqual(atlas);
      expect(importedStock(doc)).toEqual(acervo);
      expect(doc.canUndo).toBe(false);
    });
  }

  it('PSD: refazer dá o MESMO arquivo que a primeira vez', () => {
    const doc = heroiDoDisco();
    const psd = lerPsd();
    const pacote = atlasDoPsd(psd, 'heroi-imagens');
    doc.run(new ImportPsdCommand(psd, pacote, { mode: 'acrescentar', atlasName: pacote.fileName, name: 'heroi' }));
    const depois = JSON.stringify(doc.file);
    doc.undo();
    doc.redo();
    expect(JSON.stringify(doc.file)).toBe(depois);
    expect(doc.atlases).toContain(pacote.data);
  });

  it('De outro programa: o arquivo é NOVO, e o Ctrl+Z não desfaz o trabalho do arquivo anterior', () => {
    const doc = new Doc(createEmptyFile());
    doc.run(new AddBone({ name: 'solto', parent: 'root' }));
    expect(doc.canUndo).toBe(true);
    // O que o arrasto `'outro'` faz com o que `importForeignFiles` devolveu.
    doc.setFile(heroiDoDisco().file, { path: 'heroi-spine.json', atlases: [], images: new Map() });
    expect(doc.canUndo).toBe(false);
    doc.undo();
    expect(doc.file.bones.map((b) => b.name)).not.toContain('solto');
  });
});

// ---------------------------------------------------------------------------
// Rodada final, Ficha E (29/09/2026): o projeto de VERDADE do Spriter entra
// visível (E2), a pasta solta desce nas subpastas (E3), e o arrasto de dentro
// do programa não é tratado duas vezes (J5)
// ---------------------------------------------------------------------------

const LISTA_SPRITER = resolve(__dirname, '..', '..', 'backup', 'fotos-rodada-final', 'arquivo', 'lote-3_spriter-lista.json');
// A lista mora em backup/, que fica fora do GitHub: sem ela, o bloco pula.
describe.skipIf(!existsSync(LISTA_SPRITER))('o projeto do Spriter do Humberto entra com as imagens (E2)', () => {
  const RAIZ_S = resolve(__dirname, '..', '..');
  const GAME = resolve(RAIZ_S, 'exemplo', 'game');
  const LISTA = existsSync(LISTA_SPRITER) ? JSON.parse(readFileSync(LISTA_SPRITER, 'utf8')) as string[] : [];

  /** Os arquivos como o arrasto da PASTA os entrega: cada um com o caminho de dentro. */
  function soltos(): File[] {
    return LISTA.map((caminho) => {
      const file = new File([readFileSync(resolve(RAIZ_S, 'exemplo', caminho))], caminho.split('/').pop()!);
      Object.defineProperty(file, 'webkitRelativePath', { value: caminho });
      return file;
    });
  }

  it('o caminho de antes: o importador sozinho não liga imagem nenhuma — sem atlas, sem região', async () => {
    // Regra 26. É o que dava a cena vazia com 176 avisos: o Spriter não tem
    // atlas, e este passo continua sem ter. Quem liga é o passo 2.
    const importado = await importForeignFiles(soltos());
    expect(importado.format).toBe('spriter');
    expect(importado.atlasFile).toBeNull();
    expect(importado.atlases).toEqual([]);
    expect(imagesInUse(importado.file).size).toBeGreaterThan(10);
  }, 60_000);

  it('o passo 1 separa as 128 imagens, com o caminho que o .scml escreve', async () => {
    const importado = await importForeignProject(soltos());
    expect(importado.folderName).toBe('game');
    expect(importado.looseImages).toHaveLength(LISTA.filter((c) => c.endsWith('.png')).length);
    expect(importado.looseImages.map((i) => i.name)).toContain('bot/01 (6)');
    expect(importado.looseImages.some((i) => i.name.startsWith('game/'))).toBe(false);
  }, 60_000);

  /*
   * Falta UMA, e é de verdade: o `.scml` cita `mao/_0000_Camada-1-copiar_tmp5068`,
   * e no disco esse arquivo existe SEM extensão — um temporário que o Spriter
   * deixou. Não é imagem para o navegador, e o aviso do rodapé diz o nome dela.
   * A outra que faltava antes do E4, `corte`, é uma CAIXA, e não imagem.
   */
  const SEM_EXTENSAO = 'mao/_0000_Camada-1-copiar_tmp5068';

  it('toda imagem que o boneco usa tem uma imagem solta de mesmo nome, menos a que não é PNG', async () => {
    const importado = await importForeignProject(soltos());
    const nomes = new Set(importado.looseImages.map((i) => i.name));
    const faltam = [...imagesInUse(importado.file)].filter((usada) => !nomes.has(usada));
    expect(faltam).toEqual([SEM_EXTENSAO]);
  }, 60_000);

  it('os nomes batem com os do importador do Spriter, lido direto do .scml', () => {
    const convertido = importSpriter(readFileSync(resolve(GAME, 'bcp.scml'), 'utf8'), {});
    const nomes = new Set(LISTA.map((c) => imageNameOf(insideProject('game/bcp.scml', c))));
    const usadas = [...imagesInUse(convertido.file as unknown as BoneFile)];
    expect(usadas.length).toBeGreaterThan(10);
    expect(usadas.filter((u) => !nomes.has(u))).toEqual([SEM_EXTENSAO]);
  });

  it('o Spine continua pelo atlas: nada de imagem solta', async () => {
    const pasta = resolve(RAIZ_S, 'ferramentas', 'testes', 'exemplos-de-fora');
    const files = ['heroi-spine.json', 'heroi.atlas'].map(
      (nome) => new File([readFileSync(resolve(pasta, nome))], nome),
    );
    const importado = await importForeignProject(files);
    expect(importado.format).toBe('spine');
    expect(importado.looseImages).toEqual([]);
  });
});

describe('o caminho visto da pasta do projeto', () => {
  it('tira a pasta do projeto da frente', () => {
    expect(insideProject('game/bcp.scml', 'game/bot/01 (6).png')).toBe('bot/01 (6).png');
  });
  it('sem pasta, o caminho fica', () => {
    expect(insideProject('bcp.scml', 'bot/01 (6).png')).toBe('bot/01 (6).png');
  });
  it('a barra do Windows e a barra do começo não atrapalham', () => {
    expect(insideProject('/game\\bcp.scml', 'game\\bot\\a.png')).toBe('bot/a.png');
  });
  it('uma imagem FORA da pasta do projeto guarda o caminho inteiro', () => {
    expect(insideProject('game/bcp.scml', 'outra/a.png')).toBe('outra/a.png');
  });
});

describe('a frase das imagens ligadas: UMA, e não uma por imagem', () => {
  it('sem falta nenhuma, diz quantas e onde estão', () => {
    expect(looseImagesNotice('Spriter', 20, [], 'game'))
      .toBe('As 20 imagens que o boneco usa vieram junto e estão na cena e na aba Imagens.');
  });
  it('com falta, diz QUAIS (as cinco primeiras) e ONDE procurou', () => {
    const frase = looseImagesNotice('Spriter', 14, ['a', 'b', 'c', 'd', 'e', 'f', 'g'], 'game');
    expect(frase).toContain('14 de 21');
    expect(frase).toContain('Faltam 7: "a", "b", "c", "d", "e" e mais 2');
    expect(frase).toContain('na pasta "game"');
    expect(frase).toContain('a.png');
  });
  it('sem pasta, diz que procurou entre os arquivos soltos', () => {
    expect(looseImagesNotice('Spriter', 0, ['a'], '')).toContain('entre os arquivos que vieram junto');
  });
});

describe('soltar uma PASTA desce nas subpastas (E3)', () => {
  /** Uma pasta de mentira, com os lotes que o Chrome dá (no máximo `lote` por leitura). */
  function pasta(caminho: string, filhos: DroppedEntry[], lote = 2): DroppedEntry {
    return {
      isFile: false, isDirectory: true, name: caminho.split('/').pop()!, fullPath: `/${caminho}`,
      createReader() {
        let i = 0;
        return {
          readEntries(ok: (entries: DroppedEntry[]) => void) {
            const parte = filhos.slice(i, i + lote);
            i += lote;
            ok(parte);
          },
        };
      },
    };
  }
  function arquivo(caminho: string, quebrado = false): DroppedEntry {
    return {
      isFile: true, isDirectory: false, name: caminho.split('/').pop()!, fullPath: `/${caminho}`,
      file(ok: (file: File) => void, fail?: (error: unknown) => void) {
        if (quebrado) fail?.(new Error('sem permissão'));
        else ok(new File(['x'], caminho.split('/').pop()!));
      },
    };
  }

  it('desce em todas as subpastas, lendo em lotes, e cada arquivo sai com o caminho de dentro', async () => {
    const game = pasta('game', [
      arquivo('game/bcp.scml'),
      pasta('game/bot', [arquivo('game/bot/01 (6).png'), arquivo('game/bot/01 (7).png'), arquivo('game/bot/01 (8).png')]),
      pasta('game/.git', [arquivo('game/.git/config')]),
    ]);
    const { files, unread } = await filesOfEntries([game]);
    expect(unread).toEqual([]);
    expect(files.map((f) => (f as File & { webkitRelativePath: string }).webkitRelativePath)).toEqual([
      'game/bcp.scml', 'game/bot/01 (6).png', 'game/bot/01 (7).png', 'game/bot/01 (8).png',
    ]);
  });

  it('o arquivo que não se deixa ler vai para a lista, com o caminho: ninguém some calado', async () => {
    const { files, unread } = await filesOfEntries([pasta('p', [arquivo('p/a.png'), arquivo('p/b.png', true)])]);
    expect(files).toHaveLength(1);
    expect(unread).toEqual(['p/b.png']);
  });

  it('só desce quando veio pasta; arquivos soltos seguem o caminho de sempre', () => {
    expect(hasFolder([arquivo('a.png')])).toBe(false);
    expect(hasFolder([arquivo('a.png'), pasta('p', [])])).toBe(true);
  });

  it('as entradas são pegas do `items` do arrasto; sem `webkitGetAsEntry`, `null`', () => {
    const entrada = arquivo('a.png');
    expect(dropEntries({ items: [{ kind: 'file', webkitGetAsEntry: () => entrada }] })).toEqual([entrada]);
    expect(dropEntries({ items: [{ kind: 'file' }] })).toBeNull();
    expect(dropEntries(null)).toBeNull();
  });
});

describe('o arrasto de DENTRO do programa não é tratado pela janela (J5)', () => {
  it('os quatro tipos de dentro, mesmo trazendo `Files`', () => {
    for (const tipo of ['text/x-recorte-imagem', 'text/x-recorte-entidade', 'text/x-recorte-pele']) {
      expect(isInternalDrag(['Files', tipo]), tipo).toBe(true);
    }
  });
  it('arquivo de fora continua sendo da janela', () => {
    expect(isInternalDrag(['Files'])).toBe(false);
    expect(isInternalDrag(['Files', 'text/uri-list'])).toBe(false);
  });
});

describe('as imagens em uso: a caixa não é imagem, e a sequência é cada quadro (E4)', () => {
  /** O arquivo da sonda de 29/09: uma sequência de três quadros e uma caixa com nome de imagem. */
  function comSequenciaECaixa(): BoneFile {
    const file = createEmptyFile();
    file.slots = [{ name: 'olho', bone: 'root', attachment: 'olho' }, { name: 'corte', bone: 'root', attachment: 'corte' }];
    file.skins = [{ name: 'default', attachments: {
      olho: { olho: { type: 'region', path: 'olho_', sequence: { count: 3, start: 1, digits: 2 } } },
      corte: { corte: { type: 'boundingbox', shape: 'rectangle', width: 1, height: 1 } },
    } }] as never;
    return file;
  }

  it('a sequência dá os quadros, e a caixa não dá nada', () => {
    // Antes do E4: `['olho_', 'corte']` — o Salvar levava a imagem da caixa e
    // deixava os três quadros de fora (medido por sonda às 05:15).
    expect([...imagesInUse(comSequenciaECaixa())]).toEqual(['olho_01', 'olho_02', 'olho_03']);
  });

  it('o Salvar leva os quadros da pasta numerada, e não a imagem que só tem nome de caixa', () => {
    let arvore: Parameters<typeof withProvisional>[0] = null;
    for (const nome of ['olho_01', 'olho_02', 'olho_03', 'corte']) {
      arvore = withProvisional(arvore, { name: nome, path: `${nome}.png`, width: 8, height: 8 });
    }
    const doc = new Doc(comSequenciaECaixa());
    doc.setAssets([loadAtlas(JSON.parse(JSON.stringify(arvore)))], new Map());
    expect(atlasForSave(doc).items.map((item) => item.name)).toEqual(['olho_01', 'olho_02', 'olho_03']);
  });

  it('`frames` explícito manda sobre `count` (§7.10)', () => {
    expect(imagesOfAttachment('x', { path: 'p_', sequence: { count: 9, frames: ['a', 'b'] } })).toEqual(['a', 'b']);
  });

  it('sem `digits`, nenhum zero à esquerda; `start` padrão é 1', () => {
    expect(imagesOfAttachment('x', { path: 'f', sequence: { count: 2 } })).toEqual(['f1', 'f2']);
  });

  it('malha e malha ligada têm imagem; ponto, recorte e caminho, não', () => {
    expect(imagesOfAttachment('m', { type: 'mesh' })).toEqual(['m']);
    expect(imagesOfAttachment('m', { type: 'linkedmesh', path: 'pele/m' })).toEqual(['pele/m']);
    for (const type of ['point', 'clipping', 'path', 'boundingbox', 'skeleton']) {
      expect(imagesOfAttachment('n', { type }), type).toEqual([]);
    }
  });
});

describe('o Salvar lê o QUADRO, e não a página inteira (E5)', () => {
  /*
   * Medido no programa montado v23.2, 29/09 10:02: a folha do Aseprite de 8
   * quadros foi salva, e o atlas gravado tinha UMA região — `boneco_01`, do
   * tamanho da tira inteira — com os outros sete de apelido. O Salvar lia a
   * página de cada região; os quadros dividem uma página.
   */
  const pagina = { width: 256, height: 32 };

  it('na pasta, a imagem é a sua página: o recorte é a página inteira, como antes', () => {
    expect(regionCrop({ x: 0, y: 0, width: 24, height: 30, page: { width: 24, height: 30 } }))
      .toEqual({ sx: 0, sy: 0, sw: 24, sh: 30, dx: 0, dy: 0, canvasWidth: 24, canvasHeight: 30 });
  });

  it('na folha, cada quadro é o SEU retângulo da página', () => {
    const quadros = [0, 1, 2].map((i) => regionCrop({ x: i * 32, y: 0, width: 32, height: 32, page: pagina }));
    expect(quadros.map((q) => q.sx)).toEqual([0, 32, 64]);
    expect(new Set(quadros.map((q) => JSON.stringify(q))).size).toBe(3);
  });

  it('o quadro que o Aseprite cortou volta ao tamanho original, no lugar do corte (§10.3: offsetY de baixo)', () => {
    // 20×30 original; sobrou 8×10 a 3 px da esquerda e 5 px DO TOPO — offsetY = 30 − 5 − 10 = 15.
    expect(regionCrop({
      x: 4, y: 6, width: 8, height: 10, offsetX: 3, offsetY: 15, originalWidth: 20, originalHeight: 30, page: pagina,
    })).toEqual({ sx: 4, sy: 6, sw: 8, sh: 10, dx: 3, dy: 5, canvasWidth: 20, canvasHeight: 30 });
  });

  it('o plano do Salvar leva o recorte de cada quadro da folha', () => {
    let arvore: Parameters<typeof withProvisional>[0] = null;
    const folha = asepriteSheet(JSON.stringify({
      frames: [0, 1, 2].map((i) => ({ filename: `b ${i}`, frame: { x: i * 32, y: 0, w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, duration: 100 })),
      meta: { app: 'https://www.aseprite.org/', image: 'b.png', size: { w: 96, h: 32 } },
    }), 'b.png')!;
    arvore = withSheet(arvore, folha, 'b.png');
    const file = createEmptyFile();
    file.slots = [{ name: 'b', bone: 'root', attachment: 'b' }];
    file.skins = [{ name: 'default', attachments: { b: { b: { type: 'region', path: 'b_', sequence: { count: 3, start: 1, digits: 2 } } } } }] as never;
    const doc = new Doc(file);
    doc.setAssets([loadAtlas(JSON.parse(JSON.stringify(arvore)))], new Map());
    const plano = atlasForSave(doc);
    expect(plano.items.map((i) => i.name)).toEqual(['b_01', 'b_02', 'b_03']);
    expect(plano.items.map((i) => i.crop.sx)).toEqual([0, 32, 64]);
  });
});

describe('trocar a imagem não faz o desenho pular (H1, P15)', () => {
  /*
   * Medido pelo chat H, 29/09 (fotos `imagens-e-pivo/lote-2_13` e `_14`): duas
   * mãos de 24×24, o mesmo pivô (meio de cima), um desenho SOLTO em y = 0,17;
   * Usar no desenho escolhido → y = −12. O pivô novo ia para a origem do osso.
   */
  const mao = (nome: string) => ({ width: 24, height: 24, pivotX: 12, pivotY: 24, nome });

  it('o caminho de antes (sem a região velha): o desenho pula para o pivô na origem', () => {
    const def: Record<string, unknown> = { type: 'region', path: 'mao_aberta', x: 0, y: 0.17 };
    swapImage(def, 'mao_fechada', mao('fechada'));
    expect(def['y']).toBe(-12);
  });

  it('com a região velha e o MESMO pivô, o desenho não se mexe', () => {
    const def: Record<string, unknown> = { type: 'region', path: 'mao_aberta', x: 0, y: 0.17 };
    swapImage(def, 'mao_fechada', mao('fechada'), 1, mao('aberta'));
    expect([def['path'], def['x'], def['y']]).toEqual(['mao_fechada', 0, 0.17]);
  });

  it('girado e escalado, com o mesmo pivô, também não se mexe', () => {
    const def: Record<string, unknown> = { path: 'a', x: 30, y: -8, rotation: 30, scaleX: 2, scaleY: 0.5 };
    swapImage(def, 'b', mao('b'), 1, mao('a'));
    expect(def['x']).toBeCloseTo(30, 2);
    expect(def['y']).toBeCloseTo(-8, 2);
  });

  it('pivôs diferentes: o pivô da nova cai onde estava o da velha', () => {
    // Velha 24×24 sem pivô (o centro) em (5, 5): o centro está em (5, 5).
    // Nova 24×24 com pivô no canto de baixo à esquerda: o canto vai para (5, 5),
    // e o centro da nova fica 12 px à direita e acima.
    const def: Record<string, unknown> = { path: 'a', x: 5, y: 5 };
    swapImage(def, 'b', { width: 24, height: 24, pivotX: 0, pivotY: 0 }, 1, { width: 24, height: 24 });
    expect([def['x'], def['y']]).toEqual([17, 17]);
  });

  it('o esticão da velha sai, e a nova entra no tamanho dela', () => {
    const def: Record<string, unknown> = { path: 'a', x: 0, y: 0, width: 48, height: 48 };
    swapImage(def, 'b', mao('b'), 1, mao('a'));
    expect(def).not.toHaveProperty('width');
    expect(def).not.toHaveProperty('height');
  });

  it('malha e sequência: só o `path`, como sempre', () => {
    const malha: Record<string, unknown> = { type: 'mesh', path: 'a', x: 3 };
    swapImage(malha, 'b', mao('b'), 1, mao('a'));
    expect([malha['path'], malha['x']]).toEqual(['b', 3]);
  });
});

describe('"salvar com avisos?" como dado, para a janela da casa (P43)', () => {
  it('traz TODOS os avisos — o confirm() antigo cortava em oito', () => {
    const avisos = Array.from({ length: 12 }, (_, i) => `aviso ${i + 1}`);
    const q = problemsQuestion(avisos);
    expect(q.lines).toHaveLength(12);
    expect(q.lines[11]).toBe('aviso 12');
    expect(q.lead).toContain('12 avisos');
  });
  it('os dois botões dizem o que fazem', () => {
    const q = problemsQuestion(['a']);
    expect([q.title, q.yes, q.no]).toEqual(['Salvar com avisos?', 'Salvar mesmo assim', 'Voltar sem salvar']);
    expect(q.lead).toContain('1 aviso.');
  });
  it('a lista devolvida é uma cópia: quem mostra pode mexer sem estragar a do Salvar', () => {
    const avisos = ['a'];
    problemsQuestion(avisos).lines.push('b');
    expect(avisos).toEqual(['a']);
  });
});

describe('abrir só o .bone traz as imagens da pasta lembrada (J1)', () => {
  /*
   * O chat J, 29/09 (fotos `uso-boneco/h13` e `h14`): Salvar → recarregar →
   * Abrir projeto… → escolher o `.bone`. Vinha sem imagem nenhuma, "8 avisos",
   * e um rodapé "Abra o atlas junto", sem dizer onde.
   */
  const arquivoFalso = (nome: string, texto = '') => ({
    kind: 'file' as const, name: nome, getFile: async () => new File([texto], nome),
  });
  function pasta(nome: string, filhos: ReturnType<typeof arquivoFalso>[], permissao = 'granted') {
    return {
      kind: 'directory' as const, name: nome,
      async *values() { for (const f of filhos) yield f; },
      queryPermission: async () => permissao,
      resolve: async (h: unknown) => (filhos.includes(h as ReturnType<typeof arquivoFalso>) ? [(h as { name: string }).name] : null),
    };
  }
  const bone = arquivoFalso('boneco.bone', '{}');
  const atlas = arquivoFalso('boneco.atlas.json', JSON.stringify({ pages: [{ image: 'boneco-atlas.png' }] }));
  const pagina = arquivoFalso('boneco-atlas.png');

  it('a pasta lembrada que tem o .bone na raiz devolve o atlas e a página', async () => {
    const achado = await companionFiles(bone, [pasta('outra', [arquivoFalso('x.bone')]), pasta('boneco', [bone, atlas, pagina])]);
    expect(achado?.folder.name).toBe('boneco');
    expect(achado?.files?.map((f) => f.name)).toEqual(['boneco.atlas.json', 'boneco-atlas.png']);
  });

  it('achou a pasta mas sem permissão: não pede — devolve o NOME, para o aviso', async () => {
    const achado = await companionFiles(bone, [pasta('boneco', [bone, atlas], 'prompt')]);
    expect(achado).toEqual({ folder: expect.objectContaining({ name: 'boneco' }), files: null });
  });

  it('nenhuma pasta lembrada tem o arquivo: null', async () => {
    expect(await companionFiles(bone, [pasta('outra', [atlas])])).toBeNull();
  });

  it('o aviso diz o gesto inteiro, e o nome da pasta quando ele é conhecido', () => {
    // Rodada 4, consertos (05/10/2026), reescrito de propósito: "esqueleto"
    // virou "base" (conferência da rodada 24, linha A6 — a última sobra na tela).
    expect(missingAtlasNotice('boneco.bone', ['boneco.atlas.json'], 'boneco'))
      .toBe('Esta base usa boneco.atlas.json, que mora na pasta do projeto, e ela veio sozinha: '
        + 'as imagens ficaram de fora. Para abrir com elas: Arquivo → Abrir pasta do projeto… e escolha a pasta "boneco".');
    expect(missingAtlasNotice('boneco.bone', ['a.atlas.json'], null)).toContain('escolha a pasta onde está o boneco.bone');
  });
});

describe('acertar o pivô DIZ para onde o desenho foi (H2, P67)', () => {
  /*
   * Medido pelo chat H, 29/09 (fotos `imagens-e-pivo/lote-2_17` e `_18`): a
   * cabeça solta em (150, 100), Definir pivô no queixo → (0, 28), e o rodapé
   * dizia só "1 desenho recolocado". O comportamento é o do plano de 10/09 (o
   * solto também é recolocado) até o Humberto responder; o que muda é DIZER.
   */
  function cena(): Doc {
    const tree = withProvisional(null, { name: 'cabeca', path: 'cabeca.png', width: 40, height: 40 });
    const file = {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'pescoco', parent: 'root' }],
      slots: [{ name: 'solta', bone: 'root', attachment: 'cabeca' }, { name: 'presa', bone: 'pescoco', attachment: 'cabeca' }],
      skins: [{ name: 'default', attachments: {
        solta: { cabeca: { type: 'region', path: 'cabeca', x: 150, y: 100 } },
        presa: { cabeca: { type: 'region', path: 'cabeca', x: 0, y: 0 } },
      } }],
    } as unknown as BoneFile;
    return new Doc(file, { atlases: [loadAtlas(JSON.parse(JSON.stringify(tree)))] });
  }
  const anexo = (doc: Doc, slot: string) =>
    (doc.file.skins![0]!.attachments as unknown as Record<string, Record<string, Record<string, number>>>)[slot]!['cabeca']!;

  /*
   * OS DOIS DE BAIXO FORAM REESCRITOS DE PROPÓSITO na rodada 13 (05/10/2026).
   * Provavam "os DOIS são recolocados" e o rodapé "2 desenhos recolocados, de
   * (150; 100) para (0; 20)". A decisão do Humberto é o contrário: *"acertei o
   * pivô de uma imagem presa a um osso: o desenho fica parado"*, e o Diretor
   * estendeu ao solto (o caso b: sem osso próprio, o desenho fica). A P67 está
   * respondida: os dois ficam.
   */
  it('desde a rodada 13: os DOIS ficam parados, o solto e o preso, e o pivô fica à mão', () => {
    const doc = cena();
    const comando = new SetPivotCommand('cabeca', { x: 20, y: 0 });
    doc.run(comando);
    expect([anexo(doc, 'solta')['x'], anexo(doc, 'solta')['y']]).toEqual([150, 100]);
    expect([anexo(doc, 'presa')['x'], anexo(doc, 'presa')['y']]).toEqual([0, 0]);
    expect(comando.moved).toBe(0);
    expect(comando.moves).toEqual([]);
    expect(comando.still).toBe(2);
    expect(comando.hand).toBe(true);
    doc.undo();
    expect([anexo(doc, 'solta')['x'], anexo(doc, 'solta')['y']]).toEqual([150, 100]);
  });

  it('o rodapé diz que ficaram parados, e que o pivô ficou à mão', () => {
    const doc = cena();
    const comando = new SetPivotCommand('cabeca', { x: 20, y: 0 });
    doc.run(comando);
    expect(pivotNotice('cabeca', { x: 20, y: 0 }, comando.moved, comando))
      .toBe('Pivô de "cabeca": 20, 0. 2 desenhos ficaram parados. O pivô fica guardado à mão: o osso não está nele');
  });

  it('uma casa depois da vírgula: nada de "30, 1,8381"', () => {
    expect(pivotNotice('cabeca', { x: 30, y: 1.8381 }, 1, { moves: [{ from: { x: 150, y: 100 }, to: { x: 0, y: 28.25 } }] }))
      .toBe('Pivô de "cabeca": 30, 1,8. 1 desenho recolocado, de (150; 100) para (0; 28,3)');
  });

  it('sem o quarto parâmetro, a frase de sempre', () => {
    expect(pivotNotice('espada', { x: 10.5, y: 25 }, 2)).toBe('Pivô de "espada": 10,5, 25. 2 desenhos recolocados');
  });

  it('os dois números para a janela do chat H: presos a osso e soltos no raiz', () => {
    const doc = cena();
    const { bound, loose } = pivotUsersSplit(doc.file, atlasTreesOf(doc), 'cabeca');
    expect(bound.map((r) => r.slot)).toEqual(['presa']);
    expect(loose.map((r) => r.slot)).toEqual(['solta']);
  });
});

describe('rodada 23, defeito 8: Salvar e Exportar skin dizem quando o seletor não grava', () => {
  it('fechado pelo usuário e bloqueado pelo navegador dão frases diferentes, e as duas dizem "Nada foi gravado"', async () => {
    const { pickerProblemText } = await import('../src/io/picker-problem.js');
    const fechou = pickerProblemText(Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' }), 'Salvar');
    expect(fechou).toBe('Salvar: a janela foi fechada sem escolher onde. Nada foi gravado');
    const barrou = pickerProblemText(Object.assign(new Error('User activation required.'), { name: 'SecurityError' }), 'Exportar a skin');
    expect(barrou).toContain('o navegador não deixou abrir');
    expect(barrou).toContain('Nada foi gravado');
    // A frase do navegador, em inglês, não chega ao rodapé.
    expect(barrou).not.toContain('activation');
  });

  it('a frase é pega uma vez só, e quem recebe o null a diz', async () => {
    const { notePickerProblem, takePickerProblem } = await import('../src/io/picker-problem.js');
    expect(takePickerProblem()).toBeNull();
    notePickerProblem(Object.assign(new Error(''), { name: 'AbortError' }), 'Salvar como');
    expect(takePickerProblem()).toContain('Salvar como');
    expect(takePickerProblem()).toBeNull();
    const ler = (p: string): string => readFileSync(resolve(__dirname, '../src', p), 'utf8');
    // A forma do defeito: o catch vazio. Os três gestos da ficha anotam o erro.
    expect(ler('io/open-save.ts')).toContain("notePickerProblem(error, options.saveAs === true ? 'Salvar como' : 'Salvar')");
    expect(ler('io/export-skin.ts')).toContain("notePickerProblem(error, 'Exportar a skin')");
    expect(ler('ui/shell-file.ts')).toContain('const problema = takePickerProblem();');
    expect(ler('panels/skins-actions.ts')).toContain('if (problema !== null) doc.notice(problema);');
  });
});

// ---------------------------------------------------------------------------
// Rodada 45, lote 1 — o Salvar diz a verdade (doc 57, §5)
// ---------------------------------------------------------------------------

describe('rodada 45, lote 1: o Salvar diz a verdade', () => {
  const HEROI = resolve(__dirname, '../../formato/exemplos/heroi.bone');
  const heroi = (): BoneFile => JSON.parse(readFileSync(HEROI, 'utf8')) as BoneFile;

  it('Salvar com avisos: a pergunta da casa, em português, sem caminho interno nem inglês', async () => {
    const { perguntaSalvarComAvisos } = await import('../src/ui/salvar-avisos.js');
    // As linhas como o `checkBeforeSaving` as monta para o herói solto (doc 57, foto 34).
    const avisos = [
      '/skins/0/attachments/hair/hair/path: image "hair" not found in any atlas; attachment will be invisible',
      '/skins/0/attachments/body/body/path: image "body" not found in any atlas; attachment will be invisible',
      '/skins/.../sword/uri: nested skeleton "espada.bone" was not provided; placeholder treated as empty (spec 7.11)',
      'imagem não encontrada: hair',
      'imagem não encontrada: body',
    ];
    const q = perguntaSalvarComAvisos(heroi(), avisos);
    const tudo = [q.title, q.lead, ...q.lines].join('\n');
    expect(tudo).not.toMatch(/not found|nested skeleton|\/skins\/|attachment/);
    expect(q.lead).toContain('Faltam 2 imagens');
    // Cada imagem uma vez, numa linha só: antes eram 4 linhas para 2 imagens.
    expect(q.lines[0]).toBe('As imagens que faltam: hair, body');
    expect(q.lines).toHaveLength(2);
    expect(q.lines[1]).toContain('espada.bone');
    expect(q.yesLabel).toBe('Salvar mesmo assim');
    expect(q.noLabel).toBe('Voltar sem salvar');
  });

  it('a casca passa a pergunta dela ao saveDocument: a caixa do navegador não aparece', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toMatch(/confirmProblems:/);
    expect(fonte).toMatch(/perguntaSalvarComAvisos\(/);
  });

  it('"Arquivo salvo." só para o que foi gravado ou aberto do disco (regra 21)', async () => {
    const { estadoDoArquivo } = await import('../src/ui/salvar-avisos.js');
    expect(estadoDoArquivo(false, null)).toBe('Arquivo ainda não salvo.');
    expect(estadoDoArquivo(true, null)).toBe('Arquivo não salvo.');
    expect(estadoDoArquivo(true, 'heroi.bone')).toBe('Arquivo não salvo.');
    // Rodada 50, lote 2 (doc 98): reescrito de propósito. O herói aberto do
    // programa dizia "Arquivo salvo." sem nada ter sido salvo; a frase do
    // arquivo limpo virou "Sem mudanças por salvar." (o Salvar diz "Salvo em …").
    expect(estadoDoArquivo(false, 'heroi.bone')).toBe('Sem mudanças por salvar.');
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toMatch(/estadoDoArquivo\(this\.doc\.dirty, this\.doc\.path\)/);
  });

  it('o pacote leva a entidade que o .bone cita, ou diz que ela ficou de fora', async () => {
    const { entidadesParaOPacote } = await import('../src/io/save-binary.js');
    const { loadSkeletonData } = await import('../../runtime/src/index.js');
    const data = loadSkeletonData(heroi() as unknown);
    const com = entidadesParaOPacote(data, new Set(['heroi.bone']), (uri) => (uri === 'espada.bone' ? '{"bone":{}}' : null));
    expect(com.files.map((f) => f.name)).toEqual(['espada.bone']);
    expect(com.warnings).toEqual([]);
    const sem = entidadesParaOPacote(data, new Set(['heroi.bone']), () => null);
    expect(sem.files).toEqual([]);
    expect(sem.warnings).toHaveLength(1);
    expect(sem.warnings[0]).toContain('espada.bone');
    // A que o projeto já pôs no pacote não entra duas vezes.
    expect(entidadesParaOPacote(data, new Set(['heroi.bone', 'espada.bone']), () => 'x').files).toEqual([]);
    expect(entidadesParaOPacote(null, new Set(), () => 'x')).toEqual({ files: [], warnings: [] });
  });

  it('o pacote chama a escolha das entidades (a espada saía calada)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/save-binary.ts'), 'utf8');
    expect(fonte).toMatch(/entidadesParaOPacote\(doc\.data/);
  });

  it('salvar numa pasta leva o atlas e as páginas que moram fora dela', async () => {
    const { faltaNaPasta } = await import('../src/io/open-save.js');
    const atlas = [{ nome: 'heroi.atlas.json', paginas: ['heroi.png'] }];
    expect(faltaNaPasta(atlas, ['heroi.bone', 'manifest.json'])).toEqual({ atlas: ['heroi.atlas.json'], paginas: ['heroi.png'] });
    expect(faltaNaPasta(atlas, ['heroi.bone', 'heroi.atlas.json', 'heroi.png'])).toEqual({ atlas: [], paginas: [] });
    expect(faltaNaPasta(atlas, ['heroi.atlas.json'])).toEqual({ atlas: [], paginas: ['heroi.png'] });
    // O atlas que cita a pasta por dentro cai ao lado do `.bone`, pelo nome.
    expect(faltaNaPasta([{ nome: 'arte/heroi.atlas.json', paginas: ['heroi.png'] }], [])).toEqual({ atlas: ['heroi.atlas.json'], paginas: ['heroi.png'] });
  });

  it('salvar numa pasta leva também a entidade que mora fora dela (a espada)', async () => {
    const { entidadesForaDaPasta } = await import('../src/io/open-save.js');
    expect(entidadesForaDaPasta(['espada.bone'], ['heroi.bone', 'heroi.atlas.json'])).toEqual(['espada.bone']);
    expect(entidadesForaDaPasta(['espada.bone', 'espada.bone'], [])).toEqual(['espada.bone']);
    expect(entidadesForaDaPasta(['espada.bone'], ['espada.bone'])).toEqual([]);
    // A que mora numa subpasta já tem lugar: não é levada para a raiz.
    expect(entidadesForaDaPasta(['armas/espada.bone', ''], [])).toEqual([]);
    const fonte = readFileSync(resolve(__dirname, '../src/io/open-save.ts'), 'utf8');
    expect(fonte).toMatch(/entidadesForaDaPasta\(citadas, raiz\)/);
  });

  it('a pasta reaberta sem o atlas diz o que falta, sem mandar abrir a mesma pasta', async () => {
    const { atlasForaDaPastaNotice } = await import('../src/io/open-save.js');
    const frase = atlasForaDaPastaNotice('heroi.bone', ['heroi.atlas.json'], 'pasta-x');
    expect(frase).toContain('heroi.atlas.json não está na pasta "pasta-x"');
    expect(frase).not.toContain('escolha a pasta "pasta-x"');
  });

  it('Salvar como de um projeto com entidade, sem pasta, pede a pasta antes (um destino só)', async () => {
    const { pedirPastaNoSalvarComo } = await import('../src/io/pedir-pasta.js');
    expect(pedirPastaNoSalvarComo({ temPasta: false, temVarios: true, seletorDePasta: true })).toBe(true);
    expect(pedirPastaNoSalvarComo({ temPasta: true, temVarios: true, seletorDePasta: true })).toBe(false);
    expect(pedirPastaNoSalvarComo({ temPasta: false, temVarios: false, seletorDePasta: true })).toBe(false);
    expect(pedirPastaNoSalvarComo({ temPasta: false, temVarios: true, seletorDePasta: false })).toBe(false);
  });

  it('a dica do Salvar diz quando o manifest.json sai', async () => {
    const { fileMenu } = await import('../src/ui/menus.js');
    const salvar = fileMenu().find((e) => 'action' in e && e.action === 'salvar') as { hint?: string };
    expect(salvar.hint).toContain('com mais de uma base ou com entidade');
  });
});

// ---------------------------------------------------------------------------
// Rodada 45, lote 4 — abrir, soltar e voltar falam claro (doc 57, §5; doc 64)
// ---------------------------------------------------------------------------

describe('rodada 45, lote 4: abrir, soltar e voltar falam claro', () => {
  it('a pasta vazia pergunta antes de trocar o personagem aberto (doc 64, a)', async () => {
    const { perguntarPastaVazia } = await import('../src/io/pedir-pasta.js');
    expect(perguntarPastaVazia({ imagens: 0, temProjeto: false, temPersonagem: true })).toBe(true);
    expect(perguntarPastaVazia({ imagens: 3, temProjeto: false, temPersonagem: true })).toBe(false);
    expect(perguntarPastaVazia({ imagens: 0, temProjeto: true, temPersonagem: true })).toBe(false);
    expect(perguntarPastaVazia({ imagens: 0, temProjeto: false, temPersonagem: false })).toBe(false);
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain("yesLabel: 'Abrir a pasta vazia',");
  });

  it('o .bone da raiz que o programa não lembra abre; com mais de um, pergunta (4.11)', async () => {
    const { boneDaPasta } = await import('../src/io/pedir-pasta.js');
    expect(boneDaPasta(['a.png', 'manifest.json'])).toEqual({ kind: 'nenhum' });
    expect(boneDaPasta(['heroi.bone', 'heroi.atlas.json'])).toEqual({ kind: 'um', nome: 'heroi.bone' });
    expect(boneDaPasta(['b.bone', 'a.BONE'])).toEqual({ kind: 'varios', nomes: ['a.BONE', 'b.bone'] });
  });

  it('Salvar como com o projeto numa pasta oferece a pasta nova, que leva tudo (doc 64, d)', async () => {
    const { salvarComoEscolhas } = await import('../src/io/pedir-pasta.js');
    const escolhas = salvarComoEscolhas('meu-heroi');
    expect(escolhas.map((e) => e.id)).toEqual(['pasta', 'sem']);
    expect(escolhas[0]!.hint).toContain('o atlas, as imagens em uso e as entidades vão juntos');
    // QA 04/11/2026 (D3): fora da pasta o atlas vai para Downloads; a dica diz isso.
    expect(escolhas[1]!.hint).toContain('Dentro da pasta meu-heroi, o atlas vai junto');
    expect(escolhas[1]!.hint).toContain('fora dela, o atlas e as páginas vão para Downloads');
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('options: [...salvarComoEscolhas(pastaAtual.name)');
  });

  it('abrir o .bonez diz no rodapé o que veio dentro (doc 64, c)', async () => {
    const { pacoteAbertoNotice } = await import('../src/io/open-save.js');
    expect(pacoteAbertoNotice('heroi.bonez', ['espada.bone'], 1)).toBe('Pacote heroi.bonez aberto, com a entidade espada.bone e o atlas com as imagens dentro.');
    expect(pacoteAbertoNotice('x.bonez', [], 0)).toBe('Pacote x.bonez aberto.');
  });

  it('a janela de avisos abre com as imagens que faltam numa linha só (doc 64, b)', async () => {
    const { resumoDasImagens } = await import('../src/ui/problems-dialog.js');
    const row = (nome: string): { text: string; pointer: null; target: null; fix: null; imagemQueFalta: string } => ({
      text: `skin "default" › desenho "${nome}" › path: imagem "${nome}" não está em nenhuma folha de imagens (atlas); o desenho fica invisível`,
      pointer: null, target: null, fix: null, imagemQueFalta: nome,
    });
    const resumo = resumoDasImagens(['hair', 'body', 'face', 'hair'].map(row));
    expect(resumo).toContain('3 imagens não estão em folha de imagens nenhuma (atlas)');
    expect(resumo).toContain('hair, body, face.');
    expect(resumoDasImagens([row('hair')])).toBeNull();
  });

  it('o aviso do atlas que falta, com a pasta aberta, diz a pasta (doc 64, b)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-drop.ts'), 'utf8');
    expect(fonte).toContain("abrindoPelaPasta(pastaAberta === '' ? null : pastaAberta);");
  });

  it('o glTF diz o que deixa de fora em uma linha por animação, sem a língua do formato (4.2)', async () => {
    const { resumoDoGltf } = await import('../src/io/export-gltf.js');
    const linhas = resumoDoGltf([
      'Este esqueleto tem 5 constraint(s) (6). glTF não tem constraints: o glTF sai com a pose de setup crua.',
      'O slot "body" é recortado por uma máscara (7.7); glTF não tem recorte, o desenho sai inteiro.',
      'A animação "idle" usa cor de slot (7.12); glTF não tem equivalente, essa parte não é exportada.',
      'A animação "idle" usa morph targets (8.3); glTF não tem equivalente, essa parte não é exportada.',
      'A animação "walk" usa tint black (7.12); glTF não tem equivalente, essa parte não é exportada.',
    ]);
    expect(linhas).toHaveLength(4);
    expect(linhas.join('\n')).not.toMatch(/constraint|\bslot\b|tint black|morph targets|\(\d+\.\d+\)|\(6\)/);
    expect(linhas).toContain('A animação idle usa o que o glTF não tem, e essa parte não sai: cor de desenho, formas (morph).');
  });

  it('o rodapé cortado guarda a frase na dica; a aba do navegador diz o nome e o "•" (4.3, 4.6)', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain("this.statusState.title = this.statusState.textContent ?? '';");
    expect(casca).toContain("document.title = `${this.doc.name}${this.doc.dirty ? ' •' : ''} — Recorte`;");
  });

  it('o menu Arquivo: toda linha com dica própria (antes, 11 de 29 sem)', async () => {
    const { fileMenu } = await import('../src/ui/menus.js');
    const linhas: Array<{ label?: string; hint?: string; children?: unknown[] }> = [];
    const descer = (itens: readonly unknown[]): void => {
      for (const item of itens as Array<{ label?: string; hint?: string; children?: unknown[] }>) {
        if (item.label === undefined) continue;
        linhas.push(item);
        if (item.children !== undefined) descer(item.children);
      }
    };
    descer(fileMenu());
    const sem = linhas.filter((l) => (l.hint ?? '') === '' || l.hint === l.label).map((l) => l.label);
    expect(sem).toEqual([]);
  });

  it('Entregar uma base não diz a mesma frase duas vezes (4.4)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain("!aviso.startsWith('As imagens desta base não vieram da pasta')");
    expect(fonte).not.toContain('só as que ESTE base usa');
  });
});

describe('rodada 45, lote 4: o glTF escreve certo', () => {
  it('sem "pose de pose", sem "um entidade", sem "no pose"', async () => {
    const { resumoDoGltf } = await import('../src/io/export-gltf.js');
    const linhas = resumoDoGltf([
      'Este esqueleto tem 5 constraint(s) (6). glTF não tem constraints: o glTF sai com a pose de setup crua.',
      'O slot "weapon" tem um esqueleto aninhado (7.11); ele não entra no glTF.',
      'O attachment "face" tem vértice cujas influências não coincidem no setup; em glTF ele fica na média ponderada.',
      'O attachment "hand" é uma sequência (7.10); só o quadro do setup vai para o glTF.',
    ]).join('\n');
    expect(linhas).not.toMatch(/pose de pose|um entidade|no pose|do pose/);
    expect(linhas).toContain('sai com a pose de repouso crua');
    expect(linhas).toContain('tem uma entidade');
    expect(linhas).toContain('não coincidem na pose de repouso');
    expect(linhas).toContain('só o quadro da pose de repouso');
  });
});

describe('rodada 45, lote 5: abrir o herói não herda a pasta do projeto de antes', () => {
  it('o exemplo larga a pasta e o arquivo antes de abrir', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/main.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('const abrirExemplo = async'), fonte.indexOf("registerAction('abrir-exemplo'"));
    expect(corpo).toContain('forgetProjectFolder(doc);');
    expect(corpo).toContain('forgetHandle();');
    expect(corpo.indexOf('forgetProjectFolder(doc);')).toBeLessThan(corpo.indexOf('doc.setFile('));
  });
});

describe('rodada 45, lote 5: os cinco da conferência da v33.9 (doc 74)', () => {
  it('(a) mudanças não salvas: a janela do programa, com Salvar / Descartar / Cancelar, nunca o confirm', () => {
    const drop = readFileSync(resolve(__dirname, '../src/ui/shell-drop.ts'), 'utf8');
    const corpo = drop.slice(drop.indexOf('export async function confirmDiscard'), drop.indexOf('export const DISCARD_CHOICES'));
    expect(corpo).not.toContain('globalThis.confirm');
    expect(corpo).toContain('await shell.save(false);');
    for (const f of ['shell-file.ts', 'shell-actions.ts', 'shell-drop.ts']) {
      const fonte = readFileSync(resolve(__dirname, '../src/ui/' + f), 'utf8');
      expect(fonte).not.toMatch(/!shell\.confirmDiscard\(\)/);
    }
  });
  it('(a) as três saídas têm frase', async () => {
    const { DISCARD_CHOICES } = await import('../src/ui/shell-drop.js');
    expect(DISCARD_CHOICES.map((c) => c.id)).toEqual(['salvar', 'descartar', 'cancelar']);
    for (const c of DISCARD_CHOICES) expect(c.hint.length).toBeGreaterThan(15);
  });
  it('(b) o resumo das imagens substitui as linhas: elas ficam recolhidas', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/problems-dialog.ts'), 'utf8');
    expect(fonte).toContain("recolhidas.append(linha);");
    expect(fonte).toContain('Ver as ${quantasRecolhidas} linhas, uma por imagem');
  });
  it('(c) Ctrl+O com a pasta aberta nomeia a pasta', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    const open = fonte.slice(fonte.indexOf('export async function open(shell'), fonte.indexOf('export async function save('));
    expect(open).toContain('abrindoPelaPasta(pastaAberta === \'\' ? null : pastaAberta);');
  });
  it('(d) o relatório diz o nome gravado', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/export-image.ts'), 'utf8');
    expect(fonte).toContain('files[i]!.name = nomes[i]!;');
  });
  it('(e) o "•" some quando o Ctrl+Z volta ao ponto salvo, e volta com o Ctrl+Y', () => {
    const doc = new Doc();
    doc.run(new AddBone({ name: 'a', parent: 'root' }));
    doc.markSaved('x.bone');
    expect(doc.dirty).toBe(false);
    doc.run(new AddBone({ name: 'b', parent: 'root' }));
    expect(doc.dirty).toBe(true);
    doc.undo();
    expect(doc.dirty).toBe(false);
    doc.redo();
    expect(doc.dirty).toBe(true);
    doc.undo();
    doc.undo();
    expect(doc.dirty).toBe(true);
    // Um passo novo depois de desfazer além do ponto salvo: o ponto salvo não volta.
    doc.run(new AddBone({ name: 'c', parent: 'root' }));
    doc.undo();
    expect(doc.dirty).toBe(true);
  });
});

describe('rodada 45, lote 6: os quatro da prova final (doc 78)', () => {
  it('(a) a pergunta qual .bone vem antes de mudar nada, e Esc cancela', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    const inicio = fonte.indexOf('export async function startInFolder');
    const meio = fonte.indexOf('async function abrirNaPasta');
    const pergunta = fonte.indexOf('arquivos .bone`,');
    expect(pergunta).toBeGreaterThan(inicio);
    expect(pergunta).toBeLessThan(meio);
    expect(fonte.slice(inicio, meio)).toContain("cancelId: 'cancelar',");
    expect(fonte).not.toContain("{ id: '', label: 'Nenhum: começar vazio'");
  });
  it('(b) o .bone e o atlas na pasta aberta: abre pela pasta, com as imagens', async () => {
    const { atlasNaPasta } = await import('../src/ui/shell-drop.js');
    expect(atlasNaPasta('heroi.bone', ['heroi.atlas.json'], ['heroi.bone', 'heroi.atlas.json', 'heroi.png'])).toBe(true);
    expect(atlasNaPasta('heroi.bone', ['heroi.atlas.json'], ['heroi.bone'])).toBe(false);
    expect(atlasNaPasta('heroi.bone', ['arte/heroi.atlas.json'], ['heroi.bone', 'heroi.atlas.json'])).toBe(true);
    expect(atlasNaPasta('outro.bone', ['heroi.atlas.json'], ['heroi.bone', 'heroi.atlas.json'])).toBe(false);
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('if (await abrirPelaPastaSeCouber(shell, opened)) return;');
  });
  it('(c) as linhas curtas "imagem não encontrada" também entram no resumo', async () => {
    const { resumoDasImagens } = await import('../src/ui/problems-dialog.js');
    const curta = (n: string): { text: string; pointer: null; target: null; fix: null; imagemQueFalta: string } => ({ text: `imagem não encontrada: ${n}`, pointer: null, target: null, fix: null, imagemQueFalta: n });
    expect(resumoDasImagens(['hair', 'body', 'hair'].map(curta))).toContain('2 imagens não estão em folha de imagens nenhuma (atlas)');
    const fonte = readFileSync(resolve(__dirname, '../src/ui/problems-dialog.ts'), 'utf8');
    // Noite de 05/11/2026: a janela reconhece a imagem que falta pelo MARCADOR
    // da linha (`imagemQueFalta`, tirado da frase original), e não lendo o texto
    // traduzido — trocar uma palavra da tradução não pode quebrar o resumo.
    expect(fonte).toContain('row.imagemQueFalta');
    expect(fonte).not.toMatch(/não está em nenhum atlas/);
    const { warningRow } = await import('../src/panels/warning-model.js');
    expect(warningRow({} as never, 'imagem não encontrada: capa').imagemQueFalta).toBe('capa');
  });
  it('(d) Abrir recente: a pasta primeiro, o .bone solto depois', async () => {
    const { pastasPrimeiro } = await import('../src/io/recent.js');
    const lista = [{ name: 'rino.bone', at: 3 }, { name: 'rino/', at: 2 }, { name: 'heroi.bone', at: 1 }, { name: 'game/', at: 0 }];
    expect(pastasPrimeiro(lista, (n) => n.endsWith('/')).map((i) => i.name)).toEqual(['rino/', 'game/', 'rino.bone', 'heroi.bone']);
  });
});

// Rodada 48, item 2 (a mão do Humberto, 07/10/2026): soltou a pasta `mao` do
// Explorer e o programa abriu o seletor do Windows perguntando a pasta. O
// arrasto traz a alça da pasta (`getAsFileSystemHandle`, Chrome e Edge): a
// pasta solta abre como projeto, sem perguntar, como no Arquivo → Abrir pasta.
import { avisoDaPastaSolta, pedirAlcas, planoDaPastaSolta } from '../src/io/drop-folder.js';
describe('rodada 48 — soltar uma pasta abre AQUELA pasta', () => {
  const pasta = { isDirectory: true };
  const alca = { kind: 'directory' };
  it('pede a alça de cada item DURANTE o evento (depois o navegador esvazia)', () => {
    const chamados: string[] = [];
    const item = (nome: string) => ({ kind: 'file', getAsFileSystemHandle: () => { chamados.push(nome); return Promise.resolve(alca); } });
    const pedidos = pedirAlcas({ items: [item('mao'), item('outra')] });
    expect(chamados).toEqual(['mao', 'outra']);
    expect(pedidos).toHaveLength(2);
    expect(pedirAlcas({ items: [{ kind: 'file' }] })).toBeNull();
    expect(pedirAlcas(null)).toBeNull();
  });
  it('uma pasta só, com alça: abre a pasta, sem o seletor', () => {
    expect(planoDaPastaSolta([pasta], [alca], ['01.png'])).toEqual({ kind: 'abrir-pasta' });
    expect(planoDaPastaSolta([pasta], [alca], [])).toEqual({ kind: 'abrir-pasta' });
  });
  it('a pasta de um projeto do Spriter (ou do Spine) importa, como antes', () => {
    expect(planoDaPastaSolta([pasta], [alca], ['bcp.scml', 'fundo.png'])).toEqual({ kind: 'importar' });
    expect(planoDaPastaSolta([pasta], [alca], ['heroi.json', 'heroi.atlas'])).toEqual({ kind: 'importar' });
    // Com um .bone nosso na raiz, é projeto nosso: abre a pasta.
    expect(planoDaPastaSolta([pasta], [alca], ['bcp.scml', 'bcp.bone'])).toEqual({ kind: 'abrir-pasta' });
  });
  it('sem alça, várias coisas, ou um arquivo: o caminho de antes', () => {
    expect(planoDaPastaSolta([pasta], null, ['01.png'])).toEqual({ kind: 'ler-arquivos' });
    expect(planoDaPastaSolta([pasta], [null], ['01.png'])).toEqual({ kind: 'ler-arquivos' });
    expect(planoDaPastaSolta([pasta, pasta], [alca, alca], [])).toEqual({ kind: 'ler-arquivos' });
    expect(planoDaPastaSolta([{ isDirectory: false }], [{ kind: 'file' }], [])).toEqual({ kind: 'ler-arquivos' });
  });
  it('o rodapé diz o que abriu, e quando o Salvar vai pedir licença', () => {
    expect(avisoDaPastaSolta('mao', 12, true)).toBe('A pasta mao abriu como projeto, pelo arrasto: 12 imagens na aba Imagens');
    expect(avisoDaPastaSolta('mao', 1, false)).toBe(
      'A pasta mao abriu como projeto, pelo arrasto: 1 imagem na aba Imagens. Para gravar nela, o Salvar vai pedir licença uma vez');
  });
});

// ---------------------------------------------------------------------------
// Rodada 50, lote 2 — abrir o herói por cima de mudanças; o rodapé que não mente (doc 98)
// ---------------------------------------------------------------------------

describe('rodada 50, lote 2: abrir o herói pergunta antes, e o rodapé não diz "salvo" sem salvar', () => {
  it('Abrir o herói passa pela janela de mudanças não salvas, como as outras portas', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/main.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('const abrirExemplo = async'), fonte.indexOf("registerAction('abrir-exemplo'"));
    expect(corpo).toMatch(/if \(!\(await shell\.confirmDiscard\(\)\)\) return;/);
    expect(corpo.indexOf('confirmDiscard')).toBeLessThan(corpo.indexOf('fetchDocument'));
  });

  it('arquivo limpo, aberto ou gravado, diz "Sem mudanças por salvar." — nunca "salvo" sem ter salvado', async () => {
    const { estadoDoArquivo } = await import('../src/ui/salvar-avisos.js');
    expect(estadoDoArquivo(false, 'heroi.bone')).toBe('Sem mudanças por salvar.');
    expect(estadoDoArquivo(false, 'heroi.bone')).not.toMatch(/salvo\./);
  });
});

describe('rodada 50, lote 4: o Reabrir o fechado diz o remédio das imagens (doc 100)', () => {
  it('a frase diz por que as imagens não vieram E onde buscá-las', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('As imagens não vêm no guardado: para trazê-las, Arquivo → Abrir pasta do projeto…');
  });
});

describe('QA 04/11/2026 — D3: o aviso do Salvar não some no rodapé', () => {
  // A prova (Chromium sem janela, 1920x1080): Salvar como → Só o arquivo .bone…
  // numa pasta fora da do projeto. O atlas e as páginas foram baixados, e o
  // rodapé mostrou só "Salvo em copia.bone." — a frase do aviso vinha depois,
  // e o rodapé corta na primeira frase que cabe.
  const aviso = 'O .bone foi salvo fora da pasta mao: o atlas e as páginas foram baixados. '
    + 'Salve o .bone dentro da pasta para eles irem juntos';

  it('o jeito antigo perdia o aviso na versão curta (o defeito)', async () => {
    const { versoesDaFrase } = await import('../src/ui/shell-status.js');
    const antigo = `Salvo em copia.bone. ${aviso}.`;
    const curtas = versoesDaFrase(antigo).slice(1);
    expect(curtas.some((v) => v.includes('baixados'))).toBe(false);
  });

  it('com aviso, o aviso vem primeiro e sobrevive ao corte', async () => {
    const { saveStatusLine } = await import('../src/io/open-save.js');
    const { versoesDaFrase } = await import('../src/ui/shell-status.js');
    const linha = saveStatusLine('copia.bone', aviso, true, false);
    expect(linha.startsWith('O .bone foi salvo fora da pasta mao')).toBe(true);
    expect(linha).toContain('Salvo em copia.bone.');
    for (const curta of versoesDaFrase(linha)) expect(curta).toMatch(/fora da pasta mao/);
  });

  it('sem aviso, a notícia segue depois do nome, como antes', async () => {
    const { saveStatusLine } = await import('../src/io/open-save.js');
    expect(saveStatusLine('mao.bone', 'Atlas da pasta gravado ao lado: mao.atlas.json, com 2 imagens em uso', false, true))
      .toBe('Salvo em mao.bone. Atlas da pasta gravado ao lado: mao.atlas.json, com 2 imagens em uso.');
    expect(saveStatusLine('a.bone', null, false, false)).toBe('Salvo em a.bone.');
    expect(saveStatusLine('a.bone', null, false, true)).toBe('Salvo em a.bone. A folha de imagens (atlas e páginas) foi gravada junto.');
  });

  it('o Salvar da casca usa a frase nova, e o io marca os três caminhos que baixam', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(casca).toContain('saveStatusLine(name, lastSaveNote(), lastSaveWarns()');
    const io = readFileSync(resolve(__dirname, '../src/io/open-save.ts'), 'utf8');
    expect(io.match(/lastNoteWarns = true;/g)?.length).toBe(4);
  });
});

describe('QA 04/11/2026 — D5: Salvar como sem pasta pergunta UMA vez', () => {
  // A prova (Chromium sem janela, herói aberto, sem pasta): Salvar como… →
  // "Escolher a pasta do projeto…" → o seletor deu a pasta proj → e logo a
  // segunda janela: "O projeto mora na pasta proj. Onde vai a cópia?". A
  // pessoa tinha acabado de dizer onde.
  const fonte = (): string => readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
  const corpoDoSave = (): string => {
    const f = fonte();
    const i = f.indexOf('export async function save(');
    return f.slice(i, f.indexOf('\n}\n', i));
  };

  it('o save pergunta a pasta uma vez e guarda a resposta', () => {
    const corpo = corpoDoSave();
    expect(corpo.match(/askFolderFirst\(/g)?.length).toBe(1);
    expect(corpo).toContain("const pastaEscolhidaAgora = saveAs && primeira === 'pasta';");
  });

  it('com a pasta escolhida agora, grava nela: esquece o arquivo de antes e não é mais "como"', () => {
    const corpo = corpoDoSave();
    const bloco = corpo.slice(corpo.indexOf('if (pastaEscolhidaAgora)'), corpo.indexOf('const pastaAtual'));
    expect(bloco).toContain('forgetHandle();');
    expect(bloco).toContain('saveAs = false;');
    // A pergunta "Onde vai a cópia?" só vem depois, e só com saveAs ainda de pé.
    expect(corpo.indexOf('if (pastaEscolhidaAgora)')).toBeLessThan(corpo.indexOf('Onde vai a cópia?'));
  });
});

describe('QA 04/11/2026 — D8: o .boneb aberto sozinho fala português', () => {
  // A prova (Chromium sem janela): Ctrl+O → heroi.boneb, sem o atlas. O
  // rodapé mostrou '/skins/0/attachments/cape_upper/cape_upper/path: image
  // "cape_upper" not found in any atlas; attachment will be invisible' — a
  // frase crua do leitor, em inglês. O mesmo herói em .bone diz "Esta base usa
  // heroi.atlas.json, que mora na pasta do projeto, e ela veio sozinha…".
  it('a primeira frase é a do atlas que não veio, como no .bone', async () => {
    const { writeBoneb } = await import('../../runtime/src/binario/escrever.js');
    const { readOpenedFiles } = await import('../src/io/open-save.js');
    const texto = readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8');
    const bytes = writeBoneb(JSON.parse(texto));
    const aberto = await readOpenedFiles([new File([bytes.slice().buffer as ArrayBuffer], 'heroi.boneb')]);
    expect(aberto).not.toBeNull();
    expect(aberto!.warnings[0]).toMatch(/^Esta base usa heroi\.atlas\.json, que mora na pasta do projeto, e ela veio sozinha/);
  });
});

describe('QA 04/11/2026 — D17: Entregar uma base leva o atlas que ela cita', () => {
  // A prova (Chromium sem janela): Importar → De outro programa… → a pasta do
  // Spine (heroi-spine.json, heroi.atlas, heroi.png) → Exportar → Entregar uma
  // base… Saiu SÓ entregue.bone, citando heroi-spine.atlas.json — um arquivo
  // que não existe em lugar nenhum (o atlas importado mora na memória). A
  // janela dizia "o atlas que ele já citava vale". No jogo, nenhuma imagem.
  it('sem imagem da pasta para fatiar, os atlas citados e as páginas deles vão junto', async () => {
    const { deliveryAtlasPlan } = await import('../src/io/open-save.js');
    const plano = deliveryAtlasPlan(
      [{ name: 'heroi-spine.atlas.json', text: '{}' }],
      [{ pages: [{ image: 'heroi.png' }, { image: 'heroi2.png' }] }],
    );
    expect(plano.atlas).toEqual(['heroi-spine.atlas.json']);
    expect(plano.paginas).toEqual(['heroi.png', 'heroi2.png']);
  });

  it('a entrega usa o plano quando não há pack, e a janela não diz mais "vale"', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/open-save.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('export async function deliverBody('), fonte.indexOf('/** Uma linha de rodapé para o que a entrega gravou. */'));
    expect(corpo).toContain('deliveryAtlasPlan(');
    expect(corpo).not.toContain('o atlas que ela já citava vai como está, sem fatiar.');
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(casca).not.toContain('o atlas que ele já citava vale');
  });
});

describe('QA 04/11/2026 — D19: a pasta escolhida no Salvar liga as imagens que o desenho usa', () => {
  // A prova (Chromium sem janela): rascunho recuperado (sem imagens: 4 avisos)
  // → Salvar → "O projeto ainda não tem pasta" → Escolher a pasta → mao. Em
  // seguida: "Salvar com avisos? Faltam 2 imagens: _0000_Camada-1,
  // _0001_Camada-2" — as duas estão NA pasta que acabou de ser escolhida. A
  // pasta entrava no projeto, e o desenho não era ligado a ela.
  it('askFolderFirst: depois de pôr a pasta no projeto, liga as imagens (adoptFolderAtlases)', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('export async function askFolderFirst('), fonte.indexOf('export async function openFolder('));
    const pos = corpo.indexOf('setProjectFolder(shell.doc, folder);');
    const liga = corpo.indexOf('await adoptFolderAtlases(shell.doc);');
    expect(pos).toBeGreaterThan(0);
    expect(liga).toBeGreaterThan(pos);
    expect(liga).toBeLessThan(corpo.indexOf("return 'pasta';"));
  });
});

describe('QA 04/11/2026 — o projeto com manifesto aberto com aviso: o aviso primeiro', () => {
  // A mesma forma do D3 e do D23: "Projeto X aberto: …. <aviso>" — o rodapé
  // corta na primeira frase, e o aviso some. Achado na varredura da forma.
  it('o aviso vem antes da notícia', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain("? `${avisoNoRodape(lido.warnings[0]!)}. ${projectOpenedNotice(folder.name, lido.lists)}`");
  });
});

describe('QA 04/11/2026 — Ctrl+O diz o que abriu, como o arrasto', () => {
  // A prova (Chromium sem janela): Ctrl+O → heroi.bone, heroi.atlas.json,
  // heroi.png e espada.bone. Abriu inteiro, e o rodapé dizia só "Sem mudanças
  // por salvar." — o arrasto diz "heroi.bone aberto pelo arrasto.", e o
  // pacote diz o que veio dentro.
  it('a frase do .bone aberto conta a entidade e o atlas', async () => {
    const { abertoNotice } = await import('../src/io/open-save.js');
    expect(abertoNotice('heroi.bone', ['espada.bone'], 1)).toBe('heroi.bone aberto, com a entidade espada.bone e o atlas com as imagens.');
    expect(abertoNotice('a.bone', [], 0)).toBe('a.bone aberto.');
  });

  it('o abrir da casca usa a frase quando não há aviso', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/ui/shell-file.ts'), 'utf8');
    expect(fonte).toContain('else shell.statusState.textContent = abertoNotice(opened.path ?? \'\', [...(opened.skeletons?.keys() ?? [])], opened.atlases.length);');
  });
});

describe('QA 04/11/2026 — D24b: o atlas importado vai para a pasta do projeto, e não para os Downloads', () => {
  // A prova (Chromium sem janela): DragonBones importado pela pasta → Ctrl+S.
  // heroi_ske.atlas.json foi gravado NA pasta (o "levar") e TAMBÉM baixado:
  // sem imagem da pasta para empacotar (pack null), o gravarAtlasAoLado pulava
  // a rota da pasta e caía no download.
  it('com a pasta e o .bone dentro dela, o atlas mudado é gravado na pasta mesmo sem pack', () => {
    const fonte = readFileSync(resolve(__dirname, '../src/io/open-save.ts'), 'utf8');
    const corpo = fonte.slice(fonte.indexOf('async function gravarAtlasAoLado('), fonte.indexOf('async function directoryOf('));
    expect(corpo).toContain("if (route.kind === 'pasta' && folder.handle !== null && out.length > 0) {");
    expect(corpo.indexOf('if (pack === null) {')).toBeLessThan(corpo.indexOf("if (route.kind === 'pasta' && folder.handle !== null && out.length > 0) {"));
  });
});

describe('Prova de pessoa (5) e (6): Salvar sem seletor baixa UM arquivo, com as imagens dentro', () => {
  // A prova (relatório prova-de-pessoa.md, 5 e 6): no navegador sem seletor de
  // pasta, Abrir o herói → Salvar baixava só heroi.bone e manifest.json; a folha
  // de imagens não ia, e ao reabrir o herói vinha sem desenho (42 avisos).
  it('baixa só heroi.bonez, e o rodapé diz o que baixou e como reabrir', async () => {
    const { saveDocument, lastSaveNote } = await import('../src/io/open-save.js');
    const baixados: string[] = [];
    const g = globalThis as unknown as Record<string, unknown>;
    const antes = { document: g['document'], create: URL.createObjectURL };
    g['document'] = {
      createElement: () => {
        const a = { href: '', download: '', style: {}, click() { baixados.push(a.download); }, remove() {} };
        return a;
      },
      body: { append() {} },
    };
    URL.createObjectURL = () => 'blob:x';
    try {
      const doc = new Doc(JSON.parse(readFileSync(resolve(__dirname, '../../formato/exemplos/heroi.bone'), 'utf8')) as BoneFile, { path: 'heroi.bone' });
      const nome = await saveDocument(doc, { confirmProblems: () => true });
      expect(nome).toBe('heroi.bonez');
      expect(baixados).toEqual(['heroi.bonez']);
      expect(lastSaveNote()).toMatch(/^heroi\.bonez baixado, com as imagens dentro/);
      expect(lastSaveNote()).toMatch(/Arquivo → Abrir projeto…/);
    } finally {
      g['document'] = antes.document;
      URL.createObjectURL = antes.create;
    }
  });
});
