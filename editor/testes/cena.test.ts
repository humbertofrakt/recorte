/**
 * Cena: zoom, tamanho e réguas — os testes por assunto (lote A3, v10.6).
 *
 * Um `describe` por arquivo antigo, com o nome e o cabeçalho dele, e os
 * mesmos testes dentro. O miolo vai sem recuo: um texto de várias linhas
 * não pode mudar.
 *
 * Juntou: `lote1-zoom`, `lote4-cena-maior`, `lote21-reguas`.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { loadSkeletonData, Skeleton } from '../../runtime/src/index.js';
import type { BoneFile } from '../../runtime/src/index.js';
import { emptySelection, getTools } from '../src/contract.js';
import type { Selection } from '../src/contract.js';
import { Camera, MAX_ZOOM, MIN_ZOOM, gridStep } from '../src/viewport/camera.js';
import { formatZoomPercent, parseZoomPercent, selectionBounds } from '../src/viewport/zoom-model.js';
import { flatEntries, viewMenu, editMenu, NEUTRAL_MENU_STATE, VIEW_ACTIONS, allMenus } from '../src/ui/menus.js';
import { ACTION_TABLE } from '../src/ui/actions-table.js';
import {
  DropEntityAsSlot, ENTITY_DRAG_TYPE, entityDropNotice, entityDropPlace,
} from '../src/doc/drop-entity.js';
import { readFileSync as readFileSyncCena } from 'node:fs';
import { resolve as resolveCena } from 'node:path';
import { shapeLabelSide } from '../src/viewport/emitter-shape.js';
import type { MenuGroupDef, MenuState } from '../src/ui/menus.js';
import { viewMenuState } from './ajuda-view.js';
import { hasIcon, iconNames, iconSvg } from '../src/ui/icons.js';
// Extensão `BONE_particles`, lote 2: as partículas na cena e o aviso do emissor.
import { emitterMarks, emitterProblem, emittersToWarn } from '../src/viewport/particles-view.js';
import { pickAll as pickAllCena, pickInRect as pickInRectCena, selectionFor as selectionForCena } from '../src/viewport/picking.js';
import { clickKeepsBone as clickKeepsBoneCena } from '../src/doc/own-bone.js';
import { NO_LOCKS as NO_LOCKS_CENA } from '../src/viewport/picking.js';
import { loadAtlas as loadAtlasCena } from '../../runtime/src/index.js';
// O caminho FUNDO do runtime, de propósito: `particleFrame` é a porta que o
// `CanvasRenderer` usa e não está no `index.ts`. Um teste pode pegá-la ali; um
// arquivo de `editor/src` não, e é por isso que o `particles-view.ts` não a usa.
import { ParticleCache as ParticleCacheCena, particleFrame as particleFrameCena } from '../../runtime/src/particles/frame.js';
import { Doc as DocCena } from '../src/doc/document.js';
import { LOCK_ITEMS, MOVED_OUT_OF_TOOLBAR, toolbarItems } from '../src/ui/toolbar-model.js';
import { MORE_CONTROLS, moreMenuItems } from '../src/panels/dopesheet-model.js';
import { DEFAULT_PREFS, PREFS_KEY, parsePrefs, prefs, resetPrefs, setPrefs } from '../src/ui/prefs.js';
import '../src/viewport/tools/select.js';
import '../src/viewport/tools/translate.js';
import '../src/viewport/tools/rotate.js';
import '../src/viewport/tools/scale.js';
import '../src/viewport/tools/create-bone.js';
import '../src/viewport/tools/pose-tool.js';
import '../src/viewport/tools/mesh-tool.js';
import '../src/viewport/tools/weights-tool.js';
import { MINOR_PER_MAJOR, RULER_SIZE, rulerLabel, rulerTicks } from '../src/viewport/rulers.js';
import { DEFAULT_VIEW, parseViewSettings } from '../src/viewport/onion.js';
import { Doc } from '../src/doc/document.js';
import { nudgeSelection, paintGrabChildren } from '../src/viewport/tools/select.js';
import {
  BONE_SCALE_HANDLES, KNOB_BONE_FRACTION, KNOB_MIN_PIXELS, SCALE_HANDLES, transformBox, transformHit,
} from '../src/viewport/transform-box.js';
import type { Point } from '../src/viewport/transform-box.js';

// ---------------------------------------------------------------------------
// zoom (lote 1) — era `lote1-zoom.test.ts`
// ---------------------------------------------------------------------------

describe('zoom (lote 1)', () => {
/**
 * Lote 1 (v1.7): o zoom no canto da cena.
 *
 * Sem DOM. A camada do canto só desenha o que `zoom-model.ts` decide, e é isso
 * que se prova aqui: ler "200%", escrever "150%", e achar a caixa que cabe o
 * que está escolhido. Cada número esperado está contado à mão no comentário
 * acima da asserção.
 */
// ---------------------------------------------------------------------------
// O mesmo esqueleto pequeno do lote 0
// ---------------------------------------------------------------------------

/**
 *   root            na origem
 *   +-- hips        em (0, 90), comprimento 10
 *   |   +-- torso   90 graus, comprimento 70: aponta para cima
 *   +-- braco       em (200, 0), comprimento 40 — ponta em (240, 0)
 *   +-- caixa_osso  em (-200, 0), carrega a caixa de colisão
 *
 * Slot `caixa` no `caixa_osso`, caixa de colisão 20x20 centrada no osso.
 * Slot `desenho` no `braco`, região 30x30 centrada na raiz do osso.
 */
function testFile(): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [
      { name: 'root' },
      { name: 'hips', parent: 'root', x: 0, y: 90, length: 10 },
      { name: 'torso', parent: 'hips', rotation: 90, length: 70 },
      { name: 'braco', parent: 'root', x: 200, y: 0, length: 40 },
      { name: 'caixa_osso', parent: 'root', x: -200, y: 0 },
    ],
    slots: [
      { name: 'caixa', bone: 'caixa_osso', attachment: 'caixa' },
      { name: 'desenho', bone: 'braco', attachment: 'desenho' },
    ],
    skins: [{
      name: 'default',
      attachments: {
        caixa: { caixa: { type: 'boundingbox', shape: 'rectangle', width: 20, height: 20 } },
        desenho: { desenho: { type: 'region', path: 'x', width: 30, height: 30 } },
      },
    }],
  } as BoneFile;
}

function posed(): Skeleton {
  const skeleton = new Skeleton(loadSkeletonData(testFile()));
  skeleton.updateWorldTransform();
  return skeleton;
}

function pick(patch: Partial<Selection>): Selection {
  return { ...emptySelection(), ...patch };
}

// ---------------------------------------------------------------------------
// Ler e escrever o campo
// ---------------------------------------------------------------------------

describe('o campo do zoom', () => {
  it('lê o número com e sem o sinal de por cento', () => {
    expect(parseZoomPercent('200')).toBe(2);
    expect(parseZoomPercent('200%')).toBe(2);
    expect(parseZoomPercent('  200 % ')).toBe(2);
    expect(parseZoomPercent('100')).toBe(1);
  });

  it('aceita a vírgula decimal, que é como se escreve em português', () => {
    expect(parseZoomPercent('12,5')).toBe(0.125);
    expect(parseZoomPercent('12.5')).toBe(0.125);
  });

  it('recusa o que não é número', () => {
    expect(parseZoomPercent('abc')).toBeNull();
    expect(parseZoomPercent('')).toBeNull();
    expect(parseZoomPercent('%')).toBeNull();
    expect(parseZoomPercent('20 30')).toBeNull();
  });

  it('recusa zero e negativo: zoom zero não é vista pequena, é vista nenhuma', () => {
    expect(parseZoomPercent('0')).toBeNull();
    expect(parseZoomPercent('0%')).toBeNull();
    expect(parseZoomPercent('-50')).toBeNull();
  });

  it('escreve o zoom em por cento, arredondado', () => {
    expect(formatZoomPercent(1)).toBe('100%');
    expect(formatZoomPercent(1.5)).toBe('150%');
    expect(formatZoomPercent(0.25)).toBe('25%');
    // 1/3 em por cento é 33,33…: o campo mostra 33%, não uma dízima.
    expect(formatZoomPercent(1 / 3)).toBe('33%');
  });

  it('ler e escrever são um a volta do outro', () => {
    for (const texto of ['25%', '100%', '150%', '400%']) {
      expect(formatZoomPercent(parseZoomPercent(texto) as number)).toBe(texto);
    }
  });

  it('o que a câmera não aceita ela apara, e o campo mostra o que ficou', () => {
    const camera = new Camera();
    camera.setZoom(parseZoomPercent('1000000') as number);
    expect(camera.zoom).toBe(MAX_ZOOM);
    camera.setZoom(parseZoomPercent('0,0001') as number);
    expect(camera.zoom).toBe(MIN_ZOOM);
  });
});

// ---------------------------------------------------------------------------
// A caixa do que está escolhido
// ---------------------------------------------------------------------------

describe('a caixa da seleção', () => {
  it('um osso entra pela raiz E pela ponta', () => {
    // `braco` nasce em (200, 0) e tem comprimento 40, sem giro: ponta (240, 0).
    const box = selectionBounds(posed(), pick({ bones: ['braco'] }));
    expect(box).not.toBeNull();
    expect(box?.x).toBeCloseTo(200, 6);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeCloseTo(240, 6);
    expect(box?.y).toBeCloseTo(0, 6);
    expect(box?.height).toBeCloseTo(0, 6);
  });

  it('sem nada escolhido não há caixa', () => {
    expect(selectionBounds(posed(), emptySelection())).toBeNull();
  });

  it('sem esqueleto não há caixa', () => {
    expect(selectionBounds(null, pick({ bones: ['braco'] }))).toBeNull();
  });

  it('dois ossos dão a caixa que cabe os dois', () => {
    // `hips` vai de (0, 90) a (10, 90); `braco` de (200, 0) a (240, 0).
    const box = selectionBounds(posed(), pick({ bones: ['hips', 'braco'] }));
    expect(box?.x).toBeCloseTo(0, 6);
    expect(box?.y).toBeCloseTo(0, 6);
    expect(box?.width).toBeCloseTo(240, 6);
    expect(box?.height).toBeCloseTo(90, 6);
  });

  it('um desenho entra pelos vértices no mundo', () => {
    // A região 30x30 do slot `desenho` está no `braco`, que nasce em (200, 0):
    // a região é centrada na raiz do osso, de (185, -15) a (215, 15).
    const box = selectionBounds(posed(), pick({ slots: ['desenho'] }));
    expect(box?.x).toBeCloseTo(185, 6);
    expect(box?.y).toBeCloseTo(-15, 6);
    expect(box?.width).toBeCloseTo(30, 6);
    expect(box?.height).toBeCloseTo(30, 6);
  });

  it('escolher o anexo pelo nome dá a mesma caixa que escolher o slot', () => {
    const porSlot = selectionBounds(posed(), pick({ slots: ['desenho'] }));
    const porAnexo = selectionBounds(posed(), pick({
      attachments: [{ slot: 'desenho', attachment: 'desenho' }],
    }));
    expect(porAnexo).toEqual(porSlot);
  });

  it('uma caixa de colisão também tem lugar no mundo, e conta', () => {
    // A caixa 20x20 está no `caixa_osso`, em (-200, 0): de (-210, -10) a (-190, 10).
    const box = selectionBounds(posed(), pick({ slots: ['caixa'] }));
    expect(box?.x).toBeCloseTo(-210, 6);
    expect(box?.width).toBeCloseTo(20, 6);
    expect(box?.height).toBeCloseTo(20, 6);
  });

  it('um osso sem comprimento é um ponto, não um erro', () => {
    // `caixa_osso` está em (-200, 0) e não tem `length`.
    const box = selectionBounds(posed(), pick({ bones: ['caixa_osso'] }));
    expect(box?.x).toBeCloseTo(-200, 6);
    expect(box?.width).toBeCloseTo(0, 6);
    expect(box?.height).toBeCloseTo(0, 6);
  });

  it('um nome que não existe não inventa caixa', () => {
    expect(selectionBounds(posed(), pick({ bones: ['nao-existe'] }))).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// A câmera enquadra o que a caixa diz
// ---------------------------------------------------------------------------

describe('enquadrar', () => {
  it('o centro da câmera vira o centro da caixa', () => {
    const camera = new Camera();
    camera.setViewSize(1440, 900);
    const box = selectionBounds(posed(), pick({ bones: ['hips', 'braco'] }));
    camera.fit(box as never, 0.2);
    // A caixa vai de (0, 0) a (240, 90): o centro é (120, 45).
    expect(camera.x).toBeCloseTo(120, 6);
    expect(camera.y).toBeCloseTo(45, 6);
  });

  it('a caixa cabe inteira na vista, com folga dos dois lados', () => {
    const camera = new Camera();
    camera.setViewSize(1440, 900);
    const box = selectionBounds(posed(), pick({ bones: ['hips', 'braco'] }));
    camera.fit(box as never, 0.2);
    // Com 20% de folga de cada lado sobram 60% da largura: 1440 * 0,6 = 864
    // para 240 unidades, e 900 * 0,6 = 540 para 90. Vence o menor: 864/240 = 3,6.
    expect(camera.zoom).toBeCloseTo(3.6, 6);
    expect((box as never as { width: number }).width * camera.zoom).toBeLessThan(1440);
  });
});

// ---------------------------------------------------------------------------
// O menu Exibir acompanhou
// ---------------------------------------------------------------------------

describe('o menu Exibir depois do lote 1', () => {
  it('"Tamanho real" e "Enquadrar seleção" deixaram de ser cinza', () => {
    const entries = flatEntries(viewMenu(viewMenuState()));
    const real = entries.find((e) => e.action === 'tamanho-real');
    const frame = entries.find((e) => e.action === 'enquadrar');
    expect(real?.enabled).toBe(true);
    expect(real?.shortcut).toBe('Ctrl+0');
    expect(frame?.enabled).toBe(true);
    expect(frame?.shortcut).toBe('F');
    expect(real?.hint).toBeUndefined();
    expect(frame?.hint).toBeUndefined();
  });

  it('as cinco entradas de vista continuam todas no menu', () => {
    const acoes = flatEntries(viewMenu(viewMenuState())).map((e) => e.action);
    for (const acao of ['aproximar', 'afastar', 'tamanho-real', 'ajustar', 'enquadrar']) {
      expect(acoes, `falta ${acao} no menu Exibir`).toContain(acao);
    }
  });
});
});

// ---------------------------------------------------------------------------
// cena maior (lote 4) — era `lote4-cena-maior.test.ts`
// ---------------------------------------------------------------------------

describe('cena maior (lote 4)', () => {
/**
 * Lote 4 (v2.1): a cena maior — barra de uma linha, ícones, ⋯ Mais.
 *
 * Sem DOM. O que se prova é a lista: quais botões a barra tem, que todos têm
 * nome e ícone, o que saiu dela e para onde foi, o que caiu no menu do ⋯ Mais,
 * e que a preferência do nome das ferramentas aguenta um navegador que não
 * guarda nada.
 */
// As ferramentas se registram ao serem importadas.


beforeEach(() => {
  resetPrefs();
});

// ---------------------------------------------------------------------------
// Os ícones
// ---------------------------------------------------------------------------

describe('os ícones', () => {
  it('toda ferramenta registrada tem o seu', () => {
    const tools = getTools();
    expect(tools.length).toBeGreaterThan(5);
    const faltando = tools.filter((tool) => !hasIcon(tool.id)).map((tool) => tool.id);
    expect(faltando, `ferramenta sem ícone: ${faltando.join(', ')}`).toEqual([]);
  });

  it('são SVG que acompanham a cor do botão, e não uma fonte de fora', () => {
    const svg = iconSvg('select');
    expect(svg.startsWith('<svg')).toBe(true);
    expect(svg).toContain('stroke="currentColor"');
    expect(svg).toContain('viewBox="0 0 24 24"');
    // Nada que precise da internet: o editor tem que abrir sem ela.
    expect(svg).not.toContain('http');
    expect(svg).not.toContain('font');
  });

  it('o ícone é mudo: quem diz o nome é o botão em volta', () => {
    expect(iconSvg('rotate')).toContain('aria-hidden="true"');
  });

  it('um nome que não existe devolve vazio, e não estoura', () => {
    expect(iconSvg('nao-existe')).toBe('');
    expect(hasIcon('nao-existe')).toBe(false);
  });

  it('o tamanho pedido é o tamanho desenhado', () => {
    expect(iconSvg('more', 14)).toContain('width="14"');
    expect(iconSvg('more')).toContain('width="20"');
  });

  it('há ícone para os cadeados e para o ⋯ Mais, além das ferramentas', () => {
    for (const nome of ['lock', 'eye', 'bone', 'image', 'more']) {
      expect(iconNames(), `falta o ícone ${nome}`).toContain(nome);
    }
  });
});

// ---------------------------------------------------------------------------
// A barra
// ---------------------------------------------------------------------------

describe('a barra da cena', () => {
  it('tem um botão por ferramenta, e nenhum sem nome', () => {
    const items = toolbarItems();
    expect(items).toHaveLength(getTools().length);
    for (const item of items) {
      expect(item.label.trim(), `${item.id} sem nome`).not.toBe('');
      expect(item.icon, `${item.id} sem ícone`).not.toBe('');
      expect(item.hint.trim()).not.toBe('');
    }
  });

  it('a dica traz o nome e a tecla, que é o que o ícone não diz', () => {
    const mover = toolbarItems().find((item) => item.id === 'translate');
    expect(mover?.label).toBe('Mover');
    expect(mover?.key).toBe('w');
    // Rodada 46, lote 2: depois do nome e da tecla vem o gesto (doc 66, §2.3).
    expect(mover?.hint.startsWith('Mover (W). ')).toBe(true);
  });

  it('a ordem é a do trabalho: escolher vem antes de criar', () => {
    const ids = toolbarItems().map((item) => item.id);
    // Desde 13/09/2026 (item 2.2) o primeiro botão é o Transformar. Este teste
    // dizia 'select' e passava só porque o Transformar não estava carregado
    // neste arquivo (regra 28: verde por outro motivo). Com a cena inteira
    // carregada, a verdade: Transformar, depois Selecionar.
    expect(ids.slice(0, 2)).toEqual(['transform', 'select']);
    expect(ids.indexOf('select')).toBeLessThan(ids.indexOf('create-bone'));
  });

  it('os dois cadeados têm ícone, nome e tecla', () => {
    expect(LOCK_ITEMS).toHaveLength(2);
    for (const item of LOCK_ITEMS) {
      expect(hasIcon(item.icon)).toBe(true);
      expect(item.label.trim()).not.toBe('');
      expect(item.hint).toContain(item.key);
    }
    expect(LOCK_ITEMS.map((i) => i.key)).toEqual(['8', '0']);
  });

  it('está escrito o que saiu da barra, e para onde foi', () => {
    const saiu = MOVED_OUT_OF_TOOLBAR.map((item) => item.what).join(' · ');
    expect(saiu).toContain('Compensar');
    expect(saiu).toContain('Eixos');
    expect(saiu).toContain('Aproximar');
    for (const item of MOVED_OUT_OF_TOOLBAR) {
      expect(item.to.trim(), `${item.what} sem destino`).not.toBe('');
    }
  });
});

// ---------------------------------------------------------------------------
// O ⋯ Mais
// ---------------------------------------------------------------------------

describe('o menu do ⋯ Mais', () => {
  it('tem os seis controles que estavam na segunda barra, e o que veio depois', () => {
    // Os seis do lote 4, mais os dois que o lote 9 pôs aqui: o filtro de linhas
    // (item 95) e o "tirar trecho de laço" (item 81). O lote 15 acrescentou o
    // "No fim" na FRENTE: ele saiu da linha 1 para a barra de velocidade e os
    // dois campos de tempo caberem, e é uma escolha de sessão, não de gesto.
    expect(moreMenuItems().map((c) => c.id)).toEqual([
      'modo-de-fim',
      'fator', 'esticar-selecao', 'espelhar-tempo', 'fechar-ciclo',
      'pares-de-nome', 'espelhar-lados', 'so-escolhidos', 'tirar-trecho',
    ]);
  });

  it('nenhum fica sem nome nem sem explicação', () => {
    for (const control of MORE_CONTROLS) {
      expect(control.label.trim(), `${control.id} sem nome`).not.toBe('');
      expect(control.hint.trim(), `${control.id} sem dica`).not.toBe('');
    }
  });

  it('as quatro ações do bloco antigo são as mesmas do menu Animação', () => {
    const acoes = MORE_CONTROLS.filter((c) => c.kind === 'acao').map((c) => c.id);
    for (const id of ['esticar-selecao', 'espelhar-tempo', 'fechar-ciclo', 'espelhar-lados']) {
      expect(acoes, `${id} saiu do ⋯ Mais`).toContain(id);
    }
    // "Tirar trecho" é do lote 9 e é só daqui: ele não está no menu Animação,
    // porque o trecho de laço é da linha do tempo e de mais lugar nenhum.
    expect(acoes).toContain('tirar-trecho');
  });

  it('os dois campos não são ações: eles guardam um valor', () => {
    const campos = MORE_CONTROLS.filter((c) => c.kind === 'campo').map((c) => c.id);
    expect(campos).toEqual(['fator', 'pares-de-nome']);
  });
});

// ---------------------------------------------------------------------------
// As preferências
// ---------------------------------------------------------------------------

describe('as preferências', () => {
  it('o nome das ferramentas nasce desligado: é o que faz a cena crescer', () => {
    expect(DEFAULT_PREFS.toolNames).toBe(false);
    expect(prefs().toolNames).toBe(false);
  });

  it('ligar e desligar vale na hora', () => {
    setPrefs({ toolNames: true });
    expect(prefs().toolNames).toBe(true);
    setPrefs({ toolNames: false });
    expect(prefs().toolNames).toBe(false);
  });

  it('um valor estranho no armazenamento vira o padrão, e nada estoura', () => {
    expect(parsePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(parsePrefs('lixo')).toEqual(DEFAULT_PREFS);
    expect(parsePrefs({ toolNames: 'sim' })).toEqual(DEFAULT_PREFS);
    expect(parsePrefs({ outra: 1 })).toEqual(DEFAULT_PREFS);
    // O lote 18 pôs o tema ao lado do nome das ferramentas. O que este teste
    // prende continua sendo o mesmo: o que não se entende vira o padrão, e o
    // que se entende é lembrado — campo a campo, sem apagar os vizinhos.
    expect(parsePrefs({ toolNames: true }))
      .toEqual({ ...DEFAULT_PREFS, toolNames: true });
  });

  it('mora numa chave só, e essa chave tem nome de projeto', () => {
    expect(PREFS_KEY).toBe('RECORTE_prefs');
  });
});

// ---------------------------------------------------------------------------
// O menu acompanhou
// ---------------------------------------------------------------------------

describe('o menu depois do lote 4', () => {
  it('"Mostrar nome das ferramentas" deixou de ser cinza', () => {
    const entrada = flatEntries(viewMenu(viewMenuState()))
      .find((e) => e.action === 'nome-das-ferramentas');
    expect(entrada?.enabled).toBe(true);
    expect(entrada?.hint).toBeUndefined();
  });

  it('"Preferências…" deixou de ser cinza', () => {
    const entrada = flatEntries(editMenu({
      canUndo: false, undoLabel: null, canRedo: false, redoLabel: null,
    })).find((e) => e.action === 'preferencias');
    expect(entrada?.enabled).toBe(true);
    expect(entrada?.hint).toBeUndefined();
  });
});
});

// ---------------------------------------------------------------------------
// reguas (lote 21) — era `lote21-reguas.test.ts`
// ---------------------------------------------------------------------------

describe('reguas (lote 21)', () => {
/**
 * Lote 21 (v4.3): as réguas da cena.
 *
 * Sem DOM. As marcas são uma conta sobre a câmera, e o que se prova aqui é que
 * elas **nunca discordam da grade** — as duas saem do mesmo `gridStep` —, que
 * o zero cai onde o eixo verde está, e que o eixo Y anda ao contrário da tela,
 * como o formato manda (§3).
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

/** Só as marcas com número escrito. */
function maiores(ticks: ReturnType<typeof rulerTicks>): number[] {
  return ticks.filter((t) => t.major).map((t) => t.value);
}

// ---------------------------------------------------------------------------
// As marcas
// ---------------------------------------------------------------------------

describe('as marcas da régua', () => {
  it('em zoom 1, numa faixa de 1000px centrada no zero, os números são -500, 0 e 500', () => {
    // Uma janela de 1000px em zoom 1 vê de -500 a 500 do mundo.
    const ticks = rulerTicks({ zoom: 1, from: -500, to: 500 }, 1000, 'x');
    const nums = maiores(ticks);
    expect(nums).toContain(-500);
    expect(nums).toContain(0);
    expect(nums).toContain(500);
    // E o zero cai no meio da faixa, que é onde o eixo verde está.
    const zero = ticks.find((t) => t.value === 0);
    expect(zero?.px).toBeCloseTo(500, 6);
  });

  it('os números maiores são múltiplos do MESMO passo da grade', () => {
    for (const zoom of [0.25, 0.5, 1, 2, 4]) {
      const passo = gridStep(zoom, DEFAULT_VIEW.gridPixels);
      const meio = 400 / zoom;
      const ticks = rulerTicks(
        { zoom, from: -meio, to: meio }, 800, 'x', DEFAULT_VIEW.gridPixels,
      );
      for (const valor of maiores(ticks)) {
        expect(Math.abs(valor / passo - Math.round(valor / passo)), `zoom ${zoom}: ${valor}`)
          .toBeLessThan(1e-6);
      }
      expect(maiores(ticks).length, `zoom ${zoom}`).toBeGreaterThan(1);
    }
  });

  it('há marcas finas entre as com número, e são cinco por intervalo', () => {
    const ticks = rulerTicks({ zoom: 1, from: 0, to: 500 }, 500, 'x');
    const total = ticks.length;
    const comNumero = ticks.filter((t) => t.major).length;
    expect(comNumero).toBeGreaterThan(0);
    // Cada intervalo entre dois números tem `MINOR_PER_MAJOR` passos.
    expect(total).toBeGreaterThanOrEqual(comNumero * (MINOR_PER_MAJOR - 1));
    expect(MINOR_PER_MAJOR).toBe(5);
  });

  it('no eixo Y, mais pixel é MENOS valor: o mundo cresce para cima (§3)', () => {
    // A câmera devolve o topo primeiro: `from` é o valor de cima, maior.
    const ticks = rulerTicks({ zoom: 1, from: 300, to: -300 }, 600, 'y');
    const comNumero = ticks.filter((t) => t.major).sort((a, b) => a.px - b.px);
    expect(comNumero.length).toBeGreaterThan(1);
    for (let i = 1; i < comNumero.length; i++) {
      expect(comNumero[i]!.value, 'px maior tem que ser valor menor')
        .toBeLessThan(comNumero[i - 1]!.value);
    }
  });

  it('uma câmera impossível devolve lista vazia em vez de estourar', () => {
    expect(rulerTicks({ zoom: 1, from: 0, to: 100 }, 0, 'x')).toEqual([]);
    expect(rulerTicks({ zoom: 0, from: 0, to: 100 }, 500, 'x')).toEqual([]);
    expect(rulerTicks({ zoom: 1, from: 5, to: 5 }, 500, 'x')).toEqual([]);
    expect(rulerTicks({ zoom: 1, from: Number.NaN, to: 100 }, 500, 'x')).toEqual([]);
    // E um zoom absurdo não devolve um milhão de riscos.
    expect(rulerTicks({ zoom: 1e9, from: -1, to: 1 }, 500, 'x').length)
      .toBeLessThanOrEqual(2000);
  });

  it('o número nunca sai como -0 nem como 1e-14', () => {
    const ticks = rulerTicks({ zoom: 1, from: -500, to: 500 }, 1000, 'x');
    for (const tick of ticks) {
      expect(Object.is(tick.value, -0), 'menos zero').toBe(false);
      if (Math.abs(tick.value) < 1e-9) expect(tick.value).toBe(0);
    }
  });

  it('o texto da marca não põe casa decimal quando não precisa', () => {
    expect(rulerLabel(500)).toBe('500');
    expect(rulerLabel(0)).toBe('0');
    expect(rulerLabel(-250)).toBe('-250');
    expect(rulerLabel(0.5)).toBe('0,5');
  });

  it('a régua tem 20px, como o plano pediu', () => {
    expect(RULER_SIZE).toBe(20);
  });
});

// ---------------------------------------------------------------------------
// O interruptor
// ---------------------------------------------------------------------------

describe('Exibir → Réguas', () => {
  it('nasce ligada', () => {
    expect(DEFAULT_VIEW.rulers).toBe(true);
    expect(parseViewSettings({}).rulers).toBe(true);
  });

  it('um valor que não é booleano volta ao padrão, e nada estoura', () => {
    expect(parseViewSettings({ rulers: 'sim' }).rulers).toBe(true);
    expect(parseViewSettings({ rulers: false }).rulers).toBe(false);
    expect(parseViewSettings({ rulers: 0 }).rulers).toBe(true);
  });

  it('está no menu Exibir, ao lado da Grade', () => {
    expect(VIEW_ACTIONS['rulers']).toBe('ver-reguas');
    const exibir = menus().find((g) => g.label === 'Exibir');
    const itens = flatEntries(exibir?.entries ?? []);
    const grade = itens.findIndex((e) => e.action === VIEW_ACTIONS['grid']);
    const reguas = itens.findIndex((e) => e.action === VIEW_ACTIONS['rulers']);
    expect(reguas).toBe(grade + 1);
    expect(itens[reguas]?.label).toBe('Réguas');
  });
});
});

// ---------------------------------------------------------------------------
// a caixa do Transformar — item 1 do plano "caixa, ossos e malha", 13/09/2026
// ---------------------------------------------------------------------------

describe('a caixa do Transformar (item 1, 13/09/2026)', () => {
  /**
   * `arm`: na raiz, comprimento 100, sem giro — a bolinha e as alças dele.
   * `curto`: comprimento 5, em (200, 0) — para conferir o mínimo da bolinha.
   * Slot `desenho` no `arm`, região 20x20 com rotação PRÓPRIA de 40°: é o
   * desenho que prova a caixa acompanhando o giro (item 1.1).
   */
  function caixaFile(): BoneFile {
    return {
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'arm', parent: 'root', length: 100 },
        { name: 'curto', parent: 'root', x: 200, y: 0, length: 5 },
      ],
      slots: [{ name: 'desenho', bone: 'arm', attachment: 'desenho' }],
      skins: [{
        name: 'default',
        attachments: {
          desenho: { desenho: { type: 'region', path: 'x', width: 20, height: 20, rotation: 40 } },
        },
      }],
    } as BoneFile;
  }

  function caixaDoc(): Doc {
    return new Doc(caixaFile());
  }

  /** O ponto `p`, girado `deg` graus em volta de `pivot` — a mesma conta da caixa. */
  function rotateAround(pivot: Point, p: Point, deg: number): Point {
    const r = (deg * Math.PI) / 180;
    const dx = p.x - pivot.x;
    const dy = p.y - pivot.y;
    return {
      x: pivot.x + dx * Math.cos(r) - dy * Math.sin(r),
      y: pivot.y + dx * Math.sin(r) + dy * Math.cos(r),
    };
  }

  it('1.1 — a caixa gira junto com o desenho, não fica mais reta', () => {
    const doc = caixaDoc();
    doc.select({ ...emptySelection(), attachments: [{ slot: 'desenho', attachment: 'desenho' }] });
    const box = transformBox(doc, 1)!;
    expect(box).not.toBeNull();
    // Sem o giro (o bug de hoje) o canto sw seria (-10, -10): a caixa reta,
    // eixos da tela. Com a rotação de 40° do desenho, ele vai para onde a
    // conta manda.
    const esperado = rotateAround({ x: 0, y: 0 }, { x: -10, y: -10 }, 40);
    expect(box.corners[0].x).toBeCloseTo(esperado.x, 6);
    expect(box.corners[0].y).toBeCloseTo(esperado.y, 6);
    expect(box.corners[0].y).not.toBeCloseTo(-10, 1);
  });

  it('1.2 — a bolinha mede pelo comprimento do osso, com um mínimo para o curto', () => {
    const doc = caixaDoc();
    doc.select({ ...emptySelection(), bones: ['arm'] });
    const box = transformBox(doc, 1)!;
    // 100 de comprimento × 0,75 (KNOB_BONE_FRACTION) = 75, ao longo do osso.
    expect(box.pivot.x).toBeCloseTo(0, 6);
    expect(box.knob.x).toBeCloseTo(100 * KNOB_BONE_FRACTION, 6);
    expect(box.knob.y).toBeCloseTo(0, 6);

    const curto = caixaDoc();
    curto.select({ ...emptySelection(), bones: ['curto'] });
    const box2 = transformBox(curto, 1)!;
    // 5 × 0,75 = 3,75, menor que o mínimo: vale o mínimo (KNOB_MIN_PIXELS).
    expect(box2.knob.x).toBeCloseTo(200 + KNOB_MIN_PIXELS, 6);
  });

  it('1.3 — o osso mostra só n, s, e; o desenho continua com os oito', () => {
    const doc = caixaDoc();
    doc.select({ ...emptySelection(), bones: ['arm'] });
    const box = transformBox(doc, 1)!;
    expect(box.visibleHandles).toEqual(BONE_SCALE_HANDLES);
    expect(transformHit(box.handles.n, box, 7)).toEqual({ scale: 'n' });
    expect(transformHit(box.handles.s, box, 7)).toEqual({ scale: 's' });
    expect(transformHit(box.handles.e, box, 7)).toEqual({ scale: 'e' });
    // Os cantos e o `w` saíram: o lugar onde eles estariam não vira mais scale.
    expect(transformHit(box.handles.ne, box, 7)).not.toEqual({ scale: 'ne' });
    expect(transformHit(box.handles.w, box, 7)).not.toEqual({ scale: 'w' });
    // Por quê o `w` sai: ele é sempre o mesmo ponto que o pivô — um
    // quadradinho ali ficaria sempre em cima do ponto vermelho (achado de
    // 13/09/2026, depois da v12.1).
    expect(box.handles.w.x).toBeCloseTo(box.pivot.x, 6);
    expect(box.handles.w.y).toBeCloseTo(box.pivot.y, 6);

    const comDesenho = caixaDoc();
    comDesenho.select({ ...emptySelection(), attachments: [{ slot: 'desenho', attachment: 'desenho' }] });
    const box2 = transformBox(comDesenho, 1)!;
    expect(box2.visibleHandles).toEqual(SCALE_HANDLES);
    expect(transformHit(box2.handles.ne, box2, 7)).toEqual({ scale: 'ne' });
    expect(transformHit(box2.handles.w, box2, 7)).toEqual({ scale: 'w' });
  });
});

// ---------------------------------------------------------------------------
// As setas do teclado (item P3, plano do gesto do P — 13/09/2026)
// ---------------------------------------------------------------------------

describe('as setas não bagunçam a seleção (P3)', () => {
/**
 * O mesmo defeito que o arrasto tinha (item 2.1), na seta do teclado: cada
 * osso escolhido recebia o deslocamento, e com pai e filho na mesma seleção o
 * filho andava **duas vezes** — uma pelo pai, outra por ele mesmo.
 *
 * A conta de quem manda é a mesma dos quatro arrastos (`topLevelBones`, em
 * `doc/bones.ts`): anda só quem não tem ancestral dentro da própria seleção.
 */

  /** raiz → braco → antebraco, os três em linha. */
  function emLinha(): Doc {
    return new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'braco', parent: 'root', x: 100, y: 0 },
        { name: 'antebraco', parent: 'braco', x: 50, y: 0 },
        { name: 'perna', parent: 'root', x: 0, y: -100 },
      ],
      slots: [],
      skins: [{ name: 'default', attachments: {} }],
    } as unknown as BoneFile);
  }

  const xDe = (doc: Doc, nome: string): number =>
    (doc.file.bones.find((b) => b.name === nome) as { x?: number }).x ?? 0;

  it('pai e filho escolhidos: só o pai recebe a conta, e o filho não anda duas vezes', () => {
    const doc = emLinha();
    doc.select({ ...emptySelection(), bones: ['braco', 'antebraco'] });
    expect(nudgeSelection(doc, 10, 0)).toBe(1);
    expect(xDe(doc, 'braco')).toBe(110);
    // O antebraço andou junto, porque a pose dele é relativa ao pai.
    expect(xDe(doc, 'antebraco')).toBe(50);
  });

  it('quem não é parente continua andando: dois irmãos andam os dois', () => {
    const doc = emLinha();
    doc.select({ ...emptySelection(), bones: ['braco', 'perna'] });
    expect(nudgeSelection(doc, 10, 0)).toBe(2);
    expect(xDe(doc, 'braco')).toBe(110);
    expect(xDe(doc, 'perna')).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// A pintura do gesto do P (item P1 — 13/09/2026)
// ---------------------------------------------------------------------------

describe('o P pinta quem já é filho (P1)', () => {
/**
 * Sem DOM: um `ctx` de mentira que anota o que foi chamado. O que se prova é
 * que a pintura desenha o osso filho e o contorno do desenho filho, e que ela
 * não desenha nada quando o osso escolhido não tem filho nenhum.
 */

  function ctxFalso(): CanvasRenderingContext2D & { calls: string[] } {
    const calls: string[] = [];
    const nada = (name: string) => (): void => { calls.push(name); };
    return {
      calls,
      save: nada('save'), restore: nada('restore'),
      beginPath: nada('beginPath'), closePath: nada('closePath'),
      moveTo: nada('moveTo'), lineTo: nada('lineTo'),
      arc: nada('arc'), stroke: nada('stroke'), fill: nada('fill'),
      setLineDash: nada('setLineDash'),
    } as unknown as CanvasRenderingContext2D & { calls: string[] };
  }

  /** raiz → braco, com um desenho pendurado no braco. */
  function comFilhos(): Doc {
    return new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        { name: 'braco', parent: 'root', x: 100, y: 0, length: 40 },
      ],
      slots: [{ name: 'desenho', bone: 'braco', attachment: 'desenho' }],
      skins: [{
        name: 'default',
        attachments: { desenho: { desenho: { type: 'region', path: 'x', width: 30, height: 30 } } },
      }],
    } as unknown as BoneFile);
  }

  it('com filhos, ela desenha; a opacidade é leve e volta ao normal no fim', () => {
    const doc = comFilhos();
    const ctx = ctxFalso();
    paintGrabChildren(doc, ctx, 1, 'root');
    expect(ctx.calls).toContain('stroke');
    // Item P1: cor e opacidade leve, como o Spriter.
    expect(ctx.globalAlpha).toBeLessThan(1);
    expect(ctx.calls[0]).toBe('save');
    expect(ctx.calls.at(-1)).toBe('restore');
  });

  it('o desenho filho ganha contorno: quatro cantos de uma região', () => {
    const doc = comFilhos();
    const ctx = ctxFalso();
    paintGrabChildren(doc, ctx, 1, 'braco');
    expect(ctx.calls.filter((c) => c === 'lineTo').length).toBeGreaterThanOrEqual(3);
    expect(ctx.calls).toContain('closePath');
  });

  it('sem filho nenhum, ela não desenha nada', () => {
    const doc = comFilhos();
    const ctx = ctxFalso();
    paintGrabChildren(doc, ctx, 1, 'braco_que_nao_existe');
    expect(ctx.calls).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Degrau 7, tarefa 7.5 (defeito A7): o botão direito ganha porta no menu
//
// Ele fazia DUAS coisas conforme o pixel — em cima de um desenho abria a grade
// de opções, fora dele voltava à ferramenta de antes — e nenhuma das duas
// tinha item de menu. Quem nunca visse acontecer nunca saberia.
// ---------------------------------------------------------------------------

describe('as duas portas do botão direito na cena (7.5)', () => {
  function itemDe(action: string) {
    return allMenus(NEUTRAL_MENU_STATE)
      .flatMap((grupo) => flatEntries(grupo.entries))
      .find((item) => item.action === action);
  }

  it('"Ferramenta de antes" está no menu, com a dica dizendo o gesto', () => {
    const item = itemDe('ferramenta-de-antes');
    expect(item?.label).toBe('Ferramenta de antes');
    expect(item?.hint).toContain('botão direito');
  });

  it('"Opções do desenho…" está no menu, com a dica dizendo o gesto', () => {
    const item = itemDe('opcoes-do-desenho');
    expect(item?.label).toBe('Opções do desenho…');
    expect(item?.hint).toContain('botão direito');
  });

  it('as duas são ações da cena na tabela de ações', () => {
    const tabela = ACTION_TABLE;
    for (const id of ['ferramenta-de-antes', 'opcoes-do-desenho']) {
      const linha = tabela.find((row) => row.id === id);
      expect(linha?.owner, id).toBe('cena');
      expect(linha?.needsPanel, id).toBe(true);
    }
  });

  it('a cena registra as duas, e as duas chamam o mesmo caminho do gesto', () => {
    const fonte = readFileSyncCena(resolveCena(import.meta.dirname, '../src/viewport/viewport.ts'), 'utf8');
    expect(fonte).toContain("registerAction('ferramenta-de-antes'");
    expect(fonte).toContain("registerAction('opcoes-do-desenho'");
    // O gesto e o item chamam a MESMA função: uma porta nova não é um caminho novo.
    // Rodada 11: o gesto passa também a imagem DE DENTRO da entidade (`hit.inner`),
    // para o "Este boneco" ser o primeiro item da grade. O item do menu não tem clique.
    expect(fonte).toContain('openDrawingOptions(doc, hit.slot, hit.attachment, hit.inner)');
  });
});

// ---------------------------------------------------------------------------
// Degrau 7, tarefa 7.2 (E9): pendurar cria tomada
//
// Soltar uma entidade num osso faz o mesmo que soltar uma imagem (lote 57):
// nasce um slot naquele osso, e dentro dele um anexo `skeleton` (7.11). A
// tomada é o slot; o pino é o `x, y` do anexo, onde ela foi solta (E7).
// ---------------------------------------------------------------------------

describe('pendurar cria tomada (7.2)', () => {
  function cenaComOsso(): Doc {
    return new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [{ name: 'root' }, { name: 'mao', parent: 'root', x: 40, y: 10 }],
      slots: [],
      skins: [{ name: 'default', attachments: {} }],
      animations: [{ name: 'anda', duration: 1, timelines: [] }],
    } as unknown as BoneFile);
  }

  function anexoDe(doc: Doc, slot: string): Record<string, unknown> {
    const skins = doc.file.skins as unknown as Array<{ attachments: Record<string, Record<string, Record<string, unknown>>> }>;
    return skins[0]!.attachments[slot]![slot]!;
  }

  it('o slot nasce no osso, e o anexo é um `skeleton` com o uri', () => {
    const doc = cenaComOsso();
    const command = new DropEntityAsSlot(doc.file, 'espada.bone', 'mao', ['default'], 12, -30);
    doc.run(command);
    expect(command.name).toBe('espada');
    expect(doc.file.slots!.find((s) => s.name === 'espada')?.bone).toBe('mao');
    const anexo = anexoDe(doc, 'espada');
    expect(anexo['type']).toBe('skeleton');
    expect(anexo['uri']).toBe('espada.bone');
  });

  it('o pino é onde ela foi solta: `x, y` do anexo (E7)', () => {
    const doc = cenaComOsso();
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', 'mao', ['default'], 12, -30));
    const anexo = anexoDe(doc, 'espada');
    expect(anexo['x']).toBe(12);
    expect(anexo['y']).toBe(-30);
  });

  it('com a base aberta ela aparece em tudo: o slot já nasce mostrando', () => {
    const doc = cenaComOsso();
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', 'mao', ['default'], 0, 0));
    expect(doc.file.slots!.find((s) => s.name === 'espada')?.attachment).toBe('espada');
  });

  it('com animação aberta: chave `attachment` em t, e `null` em 0 (lote 57)', () => {
    const doc = cenaComOsso();
    doc.run(new DropEntityAsSlot(
      doc.file, 'espada.bone', 'mao', ['default'], 0, 0, { animation: 'anda', time: 0.5 },
    ));
    // O slot não mostra nada na base: quem manda é a chave.
    expect(doc.file.slots!.find((s) => s.name === 'espada')?.attachment).toBeUndefined();
    const linha = findTimelineCena(doc, 'anda', 'espada');
    expect(linha.map((key) => [key.time, key.value])).toEqual([[0, null], [0.5, 'espada']]);
  });

  it('o nome sai do uri, sem a pasta e sem a extensão, e não repete', () => {
    const doc = cenaComOsso();
    doc.run(new DropEntityAsSlot(doc.file, 'personagens/espada.bone', 'mao', ['default'], 0, 0));
    const segunda = new DropEntityAsSlot(doc.file, 'personagens/espada.bone', 'mao', ['default'], 0, 0);
    doc.run(segunda);
    expect(doc.file.slots!.map((s) => s.name)).toEqual(['espada', 'espada2']);
    expect(segunda.name).toBe('espada2');
  });

  it('um desfazer devolve o arquivo letra por letra, com chave e tudo', () => {
    const doc = cenaComOsso();
    const texto = JSON.stringify(doc.file);
    doc.run(new DropEntityAsSlot(
      doc.file, 'espada.bone', 'mao', ['default'], 12, -30, { animation: 'anda', time: 0.5 },
    ));
    doc.undo();
    expect(JSON.stringify(doc.file)).toBe(texto);
  });

  it('o rodapé diz o osso, e com animação aberta diz o segundo', () => {
    expect(entityDropNotice('espada', 'mao', null)).toContain('tomada no osso mao');
    expect(entityDropNotice('espada', 'mao', { animation: 'anda', time: 0.5 }))
      .toContain('0,50 s');
  });

  it('a cena aceita o arrasto da entidade pelo tipo próprio', () => {
    expect(ENTITY_DRAG_TYPE).toBe('text/x-recorte-entidade');
    const fonte = readFileSyncCena(resolveCena(import.meta.dirname, '../src/viewport/viewport.ts'), 'utf8');
    expect(fonte).toContain('isEntityDrag');
    expect(fonte).toContain('DropEntityAsSlot');
  });

  // Rodada 8b, A2: a entidade cai onde foi solta, no osso mais perto.
  function cenaComBraco(): Doc {
    return new Doc({
      bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
      bones: [
        { name: 'root' },
        // O braço sai de (0, 100) e aponta para baixo: giro de -90°, 50 de comprimento.
        { name: 'braco', parent: 'root', x: 0, y: 100, rotation: -90, length: 50 },
        { name: 'perna', parent: 'root', x: 100, y: 0, length: 40 },
        // O osso próprio de uma imagem (8d) fica de fora, mesmo sendo o mais perto.
        { name: 'img_osso', parent: 'root', x: 3, y: 71,
          extensions: { RECORTE_editor_state: { ossoProprio: true } } },
      ],
      slots: [],
      skins: [{ name: 'default', attachments: {} }],
      animations: [],
    } as unknown as BoneFile);
  }

  it('A2: o osso é o mais perto do ponto, pelo corpo do osso, e não a raiz', () => {
    const doc = cenaComBraco();
    // (3, 72): perto do meio do braço (que vai de y=100 a y=50).
    const lugar = entityDropPlace(doc.skeleton, doc.file, 3, 72);
    expect(lugar.bone).toBe('braco');
    // Perto da perna, cai na perna.
    expect(entityDropPlace(doc.skeleton, doc.file, 120, 2).bone).toBe('perna');
  });

  it('A2: o ponto do mundo continua o mesmo, e a entidade fica de pé', () => {
    const doc = cenaComBraco();
    const lugar = entityDropPlace(doc.skeleton, doc.file, 3, 72);
    // No braço girado de -90°: o mundo (3, 72) é (28, 3) no espaço dele.
    expect(lugar.x).toBeCloseTo(28, 6);
    expect(lugar.y).toBeCloseTo(3, 6);
    // O anexo desfaz o giro do osso: +90 no braço de -90.
    expect(lugar.rotation).toBeCloseTo(90, 6);
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', lugar.bone, ['default'], lugar.x, lugar.y, null, lugar.rotation));
    const anexo = anexoDe(doc, 'espada');
    expect(anexo['rotation']).toBe(90);
    // A raiz da entidade, posta no mundo pelo osso, é o ponto onde se soltou.
    const osso = doc.skeleton!.findBone('braco')!;
    const mundo = osso.localToWorld(anexo['x'] as number, anexo['y'] as number);
    expect(mundo.x).toBeCloseTo(3, 4);
    expect(mundo.y).toBeCloseTo(72, 4);
  });

  it('A2: num osso sem giro o anexo não ganha `rotation` (o arquivo fica limpo)', () => {
    const doc = cenaComBraco();
    const lugar = entityDropPlace(doc.skeleton, doc.file, 120, 2);
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', lugar.bone, ['default'], lugar.x, lugar.y, null, lugar.rotation));
    expect('rotation' in anexoDe(doc, 'espada')).toBe(false);
  });

  it('A2: sem esqueleto montado, cai na raiz, no ponto', () => {
    const doc = cenaComBraco();
    expect(entityDropPlace(null, doc.file, 5, 6)).toEqual({ bone: 'root', x: 5, y: 6, rotation: 0 });
  });

  it('A2: a cena usa o osso mais perto para a entidade, e a raiz para a imagem', () => {
    const fonte = readFileSyncCena(resolveCena(import.meta.dirname, '../src/viewport/viewport.ts'), 'utf8');
    expect(fonte).toContain('entityDropPlace(doc.skeleton');
    expect(fonte).toContain('dropPlace(doc.skeleton');
  });
});

/** As chaves de `slot/attachment` de um slot, em ordem. */
function findTimelineCena(
  doc: Doc, animation: string, slot: string,
): Array<{ time: number; value: unknown }> {
  const anim = (doc.file.animations ?? []).find((a) => a.name === animation);
  const linhas = (anim as unknown as { timelines?: Array<Record<string, unknown>> })?.timelines ?? [];
  const linha = linhas.find((t) => t['type'] === 'slot' && t['target'] === slot && t['property'] === 'attachment');
  return ((linha?.['keys'] ?? []) as Array<{ time: number; value: unknown }>);
}

// ---------------------------------------------------------------------------
// As partículas NA CENA — extensão `BONE_particles`, lote 2
// ---------------------------------------------------------------------------

describe('as partículas na cena (BONE_particles), lote 2', () => {
/**
 * **Duas descobertas, e a segunda é o trabalho deste lote.**
 *
 * *A primeira:* **a cena já desenha as partículas.** O editor posa o esqueleto e
 * o entrega ao `CanvasRenderer` do runtime, e esse desenhador já sabe o que
 * fazer com um emissor — `BONE_particle` está em `DRAWABLE_TYPES` e o
 * `drawParticles` põe cada partícula onde o `computeParticles` diz. Medido na
 * tela em 22/09, às 01h05: um emissor com imagem sai jorrando. **Não havia o
 * que escrever ali, e escrever um segundo desenho seria desenhar duas vezes.**
 *
 * *A segunda:* **um emissor que não desenha nada desaparece**, e desaparecer é
 * indistinguível de estar quebrado. O runtime até avisa, por `onWarning` — e a
 * cena do editor **não liga o `onWarning`**: ele cai num `() => {}`. Conferido
 * no disco: o único lugar do editor que o liga é `io/export-image.ts`. Então o
 * primeiro gesto de quem usa — criar um emissor e apertar Tocar — dava tela
 * igual e **nenhum aviso**. É a regra 21 da casa, e é o buraco que este lote
 * tapa, em `viewport/particles-view.ts` e no `drawEmitterWarnings`.
 *
 * E a régua inteira da extensão, provada **no caminho da tela**: a agulha para
 * trás devolve o MESMO quadro.
 */

/** Um esqueleto com um emissor num osso, e uma animação de um segundo. */
function comEmissor(campos: Record<string, unknown> = {}): BoneFile {
  return {
    bone: { version: '1.0', minVersion: '1.0', generator: 'teste' },
    bones: [{ name: 'root' }, { name: 'mao', parent: 'root', x: 50, y: 20 }],
    slots: [{ name: 'fogo', bone: 'mao', attachment: 'fogo' }],
    skins: [{
      name: 'default',
      attachments: {
        fogo: {
          fogo: {
            type: 'BONE_particle', seed: 0, path: 'chama',
            rate: 20, lifetime: [1, 1], speed: [100, 100], direction: 90,
            spread: 20, ...campos,
          },
        },
      },
    }],
    animations: [{
      name: 'jorra',
      duration: 1,
      timelines: [{ type: 'bone', bone: 'mao', property: 'rotation', keys: [
        { time: 0, value: 0 }, { time: 1, value: 90 },
      ] }],
    }],
    extensionsUsed: ['BONE_particles'],
  } as unknown as BoneFile;
}

/** Um atlas de uma região só, para o emissor ter imagem. */
const ATLAS_CHAMA = loadAtlasCena({
  atlas: { version: '1.0', generator: 'teste' },
  pages: [{ name: 'p', image: 'p.png', width: 64, height: 64 }],
  regions: [{ name: 'chama', page: 0, x: 0, y: 0, width: 16, height: 16 }],
});

/** O esqueleto posado, com o atlas resolvido — o mesmo caminho da cena. */
function posado(file: BoneFile): Skeleton {
  const sk = new Skeleton(loadSkeletonData(file, { atlases: [ATLAS_CHAMA] }));
  sk.setToSetupPose();
  sk.updateWorldTransform(0);
  return sk;
}

  // --- o aviso: o emissor que não desenha nada diz por que ---------------

  it('um emissor RECÉM-CRIADO diz que não tem imagem — o primeiro caso de todos', () => {
    // É exatamente o que o lote 1 cria: `{ type, seed }` e nada mais. §9.8 faz
    // o nome do anexo servir de nome de região, e nome de anexo raramente é
    // nome de imagem — o carregador não acha, o desenhador desiste do emissor
    // inteiro, e a cena ficava igual.
    const file = comEmissor();
    const def = (file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>).fogo!.fogo!;
    delete def['path'];
    const marcas = emitterMarks(posado(file));
    expect(marcas).toHaveLength(1);
    expect(marcas[0]!.problem).toBe('o emissor "fogo" não tem imagem: escolha uma em Propriedades');
    // E o curto, que é o que a cena desenha.
    expect(marcas[0]!.short).toBe('sem imagem');
  });

  it('um emissor sadio, com imagem e taxa, NÃO ganha aviso nenhum', () => {
    // A metade que faz o teste de cima valer alguma coisa. Um aviso que aparece
    // sempre não é aviso: é decoração, e ninguém o lê na terceira vez.
    const marcas = emitterMarks(posado(comEmissor()));
    expect(marcas).toHaveLength(1);
    expect(marcas[0]!.problem).toBeNull();
    expect(marcas[0]!.short).toBeNull();
    expect(emittersToWarn(marcas)).toEqual([]);
  });

  it('forma desconhecida: a §7.4 manda não desenhar E avisar', () => {
    const marcas = emitterMarks(posado(comEmissor({ shape: 'redemoinho' })));
    expect(marcas[0]!.problem)
      .toBe('o emissor "fogo" tem uma forma que este programa não conhece: ele não é desenhado (a forma está na barra de avisos)');
  });

  it('e a frase NÃO repete a palavra do arquivo, porque ela não chega aqui', () => {
    // Medido: o carregador troca a forma desconhecida pelo padrão `point` e só
    // deixa o `shapeKnown: false`. Imprimir `attachment.shape` diria *"a forma
    // 'point' é desconhecida"* — falso, e falso de um jeito que manda a pessoa
    // procurar a palavra errada no arquivo. A palavra crua vive na advertência
    // do carregador, e a frase manda para lá.
    const sk = posado(comEmissor({ shape: 'redemoinho' }));
    const att = sk.slots.find((s) => s.data.name === 'fogo')!.attachment as never as {
      shape: string; shapeKnown: boolean;
    };
    expect(att.shapeKnown).toBe(false);
    expect(att.shape).toBe('point');
    expect(emitterProblem(att as never)!.problem).not.toContain('point');
  });

  it('forma "malha" sem malha nomeada: diz o que falta, não "não deu"', () => {
    const marca = emitterMarks(posado(comEmissor({ shape: 'mesh' })))[0]!;
    expect(marca.problem)
      .toBe('o emissor "fogo" usa a forma "malha" e não diz qual malha: escolha uma em Propriedades');
    expect(marca.short).toBe('sem malha');
  });

  it('taxa 0 sem rajada, e emissão desligada, são avisos DIFERENTES', () => {
    // As duas dão a mesma tela vazia, e é por isso que dizer qual delas poupa a
    // busca. Um aviso só para as duas mandaria conferir os dois campos.
    expect(emitterMarks(posado(comEmissor({ rate: 0 })))[0]!.problem)
      .toBe('o emissor "fogo" tem taxa 0 e nenhuma rajada: nada nasce');
    expect(emitterMarks(posado(comEmissor({ emitting: false })))[0]!.problem)
      .toBe('o emissor "fogo" está com a emissão desligada');
    expect(emitterMarks(posado(comEmissor({ rate: 0 })))[0]!.short).toBe('taxa 0');
    expect(emitterMarks(posado(comEmissor({ emitting: false })))[0]!.short).toBe('emissão desligada');
  });

  it('taxa 0 COM rajada não é aviso: a rajada é quem faz nascer', () => {
    const marcas = emitterMarks(posado(comEmissor({
      rate: 0, bursts: [{ time: 0.2, count: 10 }],
    })));
    expect(marcas[0]!.problem).toBeNull();
  });

  it('a marca fica onde o emissor está: a origem do osso do slot (§9.5)', () => {
    // O osso `mao` está em (50, 20) da raiz. A marca tem de cair ali, e não na
    // origem do esqueleto — um aviso no lugar errado manda procurar no lugar
    // errado.
    const marca = emitterMarks(posado(comEmissor()))[0]!;
    expect(marca.x).toBeCloseTo(50, 6);
    expect(marca.y).toBeCloseTo(20, 6);
    expect(marca.slot).toBe('fogo');
    expect(marca.name).toBe('fogo');
  });

  // --- rodada 15: a marca sempre, e o clique que acha o emissor -----------

  it('rodada 15, linha 1: TODO emissor tem marca, mesmo sadio e sem partícula', () => {
    // A ficha: "emissor sadio não tem marca nenhuma". A foto 00 da rodada 15
    // provou na v23.9. A marca é desenhada para TODOS os da lista de
    // `emitterMarks`, e não só para os de `emittersToWarn`.
    const sadio = emitterMarks(posado(comEmissor({ startDelay: 5 })));
    expect(sadio).toHaveLength(1);
    expect(emittersToWarn(sadio)).toEqual([]);
    const fonte = readFileSyncCena(resolveCena(__dirname, '../src/viewport/viewport-draw.ts'), 'utf8');
    expect(fonte).toContain('export function drawEmitterMarks');
    const chamada = fonte.split('\n').find((l) => l.includes('drawEmitterMarks(panel,'))!;
    expect(chamada).toBeDefined();
    expect(chamada).not.toContain('view.');
    // E a marca desenha a partir de TODAS as marcas, não das que avisam.
    const corpo = fonte.slice(fonte.indexOf('export function drawEmitterMarks'), fonte.indexOf('export function drawEmitterWarnings'));
    expect(corpo).toContain('emitterMarks(skeleton');
    expect(corpo).not.toContain('emittersToWarn');
  });

  it('rodada 15: a marca diz para onde as partículas saem, girada pelo osso', () => {
    // `direction` 90 num osso girado 30°: as partículas saem a 120° do mundo.
    const file = comEmissor();
    (file.bones as unknown as Array<Record<string, unknown>>)[1]!['rotation'] = 30;
    const marca = emitterMarks(posado(file))[0]!;
    expect(marca.direction).toBeCloseTo(120, 6);
  });

  it('rodada 15, linha 2: clicar na marca escolhe o EMISSOR, e não o osso dele', () => {
    const sk = posado(comEmissor({ startDelay: 5 }));
    // O osso `mao` tem a origem no mesmo ponto: era ele (ou o de baixo) que o
    // clique pegava na v23.9 (foto 01).
    const hits = pickAllCena(sk, 50, 20, 2);
    expect(hits[0]).toEqual({ kind: 'attachment', bone: 'mao', slot: 'fogo', attachment: 'fogo' });
    // Com "Ver ossos" ligado o corpo do osso vem antes da imagem (8d); a marca
    // é desenhada por cima do osso, então continua na frente.
    const comOssos = pickAllCena(sk, 50, 20, 2, { ...NO_LOCKS_CENA, bonesOnTop: true });
    expect(comOssos[0]!.kind).toBe('attachment');
    // Longe da marca (16 px de tela, raio 15) e sem partícula viva: não pega.
    expect(pickAllCena(sk, 58, 20, 2).some((h) => h.slot === 'fogo')).toBe(false);
  });

  it('rodada 15, linha 2: clicar NUMA PARTÍCULA também escolhe o emissor', () => {
    // A partícula pela mesma conta que a desenha (`particleFrame`). Agulha em
    // 0,5 s: as vivas subiram (direction 90, speed 100) até 50 px acima da mão.
    const doc = new DocCena(comEmissor({ spread: 0 }));
    doc.animation = 'jorra';
    doc.time = 0.5;
    const sk = doc.skeleton!;
    const slot = sk.slots.find((s) => s.data.name === 'fogo')!;
    const vivas = particleFrameCena(sk, slot, slot.attachment as never).particles;
    expect(vivas.length).toBeGreaterThan(3);
    const longe = vivas.reduce((a, b) => (Math.hypot(b.x - slot.boneMatrix.worldX, b.y - slot.boneMatrix.worldY)
      > Math.hypot(a.x - slot.boneMatrix.worldX, a.y - slot.boneMatrix.worldY) ? b : a));
    const hits = pickAllCena(sk, longe.x, longe.y, 2);
    expect(hits.some((h) => h.kind === 'attachment' && h.slot === 'fogo')).toBe(true);
  });

  it('rodada 15: o clique escolhe SÓ o emissor, sem o osso (fim do 03)', () => {
    // Na primeira foto do lote o clique trazia o osso junto (o emissor caía na
    // recusa do osso próprio, "uma forma (BONE_particle)"), e Propriedades
    // abria na ficha do OSSO. O emissor é uma peça: a peça sozinha.
    const file = comEmissor();
    expect(clickKeepsBoneCena(file, 'fogo')).toBe(false);
    const hit = pickAllCena(posado(file), 50, 20, 2)[0]!;
    const sel = selectionForCena(emptySelection(), hit, false, 'root', (slot) => clickKeepsBoneCena(file, slot));
    expect(sel.bones).toEqual([]);
    expect(sel.attachments).toEqual([{ slot: 'fogo', attachment: 'fogo' }]);
  });

  it('rodada 15: a caixa de seleção pega o emissor pela origem', () => {
    const sk = posado(comEmissor());
    const dentro = pickInRectCena(sk, { x1: 40, y1: 10, x2: 60, y2: 30 });
    expect(dentro.some((h) => h.slot === 'fogo' && h.attachment === 'fogo')).toBe(true);
    const fora = pickInRectCena(sk, { x1: 100, y1: 100, x2: 120, y2: 120 });
    expect(fora.some((h) => h.slot === 'fogo')).toBe(false);
  });

  it('um slot escondido no editor NÃO avisa: esconder também é um efeito', () => {
    const file = comEmissor();
    const def = (file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>).fogo!.fogo!;
    delete def['path'];
    const sk = posado(file);
    // Escondido: o aviso de uma coisa que a pessoa tirou da vista é ruído.
    expect(emitterMarks(sk, (slot) => slot.data.name === 'fogo')).toEqual([]);
    // E sem esconder ele volta — a prova de que o filtro é o que mudou.
    expect(emitterMarks(sk)).toHaveLength(1);
  });

  it('um slot invisível do runtime também não avisa', () => {
    const file = comEmissor();
    delete (file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)
      .fogo!.fogo!['path'];
    const sk = posado(file);
    sk.slots.find((s) => s.data.name === 'fogo')!.visible = false;
    expect(emitterMarks(sk)).toEqual([]);
  });

  it('um esqueleto SEM emissor nenhum não produz marca — e não custa nada', () => {
    const file = comEmissor();
    (file.skins![0]!.attachments as Record<string, Record<string, Record<string, unknown>>>)
      .fogo!.fogo!['type'] = 'region';
    expect(emitterMarks(posado(file))).toEqual([]);
  });

  it('a cena CHAMA o aviso, e ele não passa por interruptor de Exibição', () => {
    // *Existir não é funcionar*: uma função de desenho que ninguém chama é
    // código morto que dá verde. E um aviso atrás de uma caixinha é um aviso
    // que a pessoa desliga sem saber o que desligou.
    const fonte = readFileSyncCena(resolveCena(__dirname, '../src/viewport/viewport-draw.ts'), 'utf8');
    expect(fonte).toContain('drawEmitterWarnings(panel, ctx, skeleton, scale)');
    expect(fonte).toContain('export function drawEmitterWarnings');
    // A chamada NÃO está dentro de um `if (view.…)`.
    const linha = fonte.split('\n').find((l) => l.includes('drawEmitterWarnings(panel,'))!;
    expect(linha).not.toContain('view.');
  });

  it('a cena desenha o CURTO, e todo curto cabe em três palavras', () => {
    // A primeira foto deste lote mostrou a frase inteira correndo para fora da
    // borda do palco: desenhada no espaço do esqueleto, ela cresce com o zoom,
    // e o que chegava aos olhos era *"…escolha uma em Prop"*. Aviso cortado no
    // meio é pior que aviso curto.
    const fonte = readFileSyncCena(resolveCena(__dirname, '../src/viewport/viewport-draw.ts'), 'utf8');
    expect(fonte).toContain("marca.short ?? ''");
    expect(fonte).not.toContain("marca.problem ?? ''");
    // E nenhum curto passa de três palavras, ou o próximo voltaria a estourar.
    for (const campos of [{}, { rate: 0 }, { emitting: false }, { shape: 'mesh' }, { shape: 'xis' }]) {
      const marca = emitterMarks(posado(comEmissor(campos)))[0]!;
      if (marca.short === null) continue;
      expect(marca.short.split(' ').length).toBeLessThanOrEqual(3);
      expect(marca.short.length).toBeLessThanOrEqual(20);
    }
  });

  // --- a régua inteira: a agulha para trás, NO CAMINHO DA TELA -----------

  it('a agulha para trás devolve o MESMO quadro — pela porta que a tela usa', () => {
    // Esta é a régua inteira da extensão, e 16 casos de conformidade provam que
    // o MOTOR a cumpre. O que se prova aqui é que a **TELA** a cumpre: o
    // caminho é o do editor de ponta a ponta — o `Doc`, a animação aberta, a
    // agulha — e a porta é o `particleFrame`, a MESMA que o `CanvasRenderer`
    // chama, com um `ParticleCache` compartilhado, como ele faz.
    const doc = new DocCena(comEmissor());
    doc.animation = 'jorra';
    const cache = new ParticleCacheCena();
    const assinatura = (t: number): string => {
      doc.time = t;
      const sk = doc.skeleton!;
      const slot = sk.slots.find((s) => s.data.name === 'fogo')!;
      const frame = particleFrameCena(sk, slot, slot.attachment as never, cache);
      return frame.particles
        .map((p) => `${p.flow}/${p.index}:${p.x.toFixed(9)},${p.y.toFixed(9)},${p.angle.toFixed(9)},${p.scale.toFixed(9)}`)
        .join('|');
    };
    const emMeio = assinatura(0.5);
    const noComeco = assinatura(0.2);
    const deVolta = assinatura(0.5);

    // 1. A assinatura é SENSÍVEL ao tempo. Sem esta linha o teste passaria com
    //    uma assinatura vazia, ou constante, e não provaria nada: seria o
    //    verde explicável que não prova o que o nome dele diz.
    expect(noComeco).not.toBe(emMeio);
    expect(emMeio.length).toBeGreaterThan(0);
    // 2. E ida e volta dão o mesmo quadro, dígito por dígito.
    expect(deVolta).toBe(emMeio);
  });

  it('e dá o mesmo quadro depois de FECHAR e reabrir a animação', () => {
    // A outra metade: o `ParticleCache` guarda a curva de emissão por animação,
    // e um cache que sobrevive à troca poderia devolver a curva de outra. Se
    // isso acontecesse, a agulha para trás daria o mesmo quadro e **abrir de
    // novo** daria outro — e ninguém estaria olhando.
    const doc = new DocCena(comEmissor());
    const tira = (): string => {
      doc.animation = 'jorra';
      doc.time = 0.5;
      const sk = doc.skeleton!;
      const slot = sk.slots.find((s) => s.data.name === 'fogo')!;
      return particleFrameCena(sk, slot, slot.attachment as never, new ParticleCacheCena())
        .particles.map((p) => `${p.index}:${p.x.toFixed(9)},${p.y.toFixed(9)}`).join('|');
    };
    const primeira = tira();
    doc.animation = null;
    expect(tira()).toBe(primeira);
  });

  it('com a base aberta o emissor não some: ele calcula no relógio do esqueleto', () => {
    // §6: sem animação tocando, o tempo é o relógio do próprio esqueleto. O
    // emissor tem de continuar entregando partículas — a base não é um lugar
    // onde o efeito deixa de existir.
    const doc = new DocCena(comEmissor());
    doc.animation = null;
    doc.time = 0.5;
    const sk = doc.skeleton!;
    const slot = sk.slots.find((s) => s.data.name === 'fogo')!;
    const frame = particleFrameCena(sk, slot, slot.attachment as never, new ParticleCacheCena());
    expect(frame.silence).toBeNull();
    expect(frame.particles.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// A palavra à vista na barra da cena — decisão P38, achados J12 e L1 (29/09/2026)
// ---------------------------------------------------------------------------

import { wordOnBar } from '../src/panels/particle-presets.js';
import { emitterShapeGuide as emitterShapeGuideR16, shapeHandleAt as shapeHandleAtR16, shapeHandleWrite as shapeHandleWriteR16, shapeHandleSays as shapeHandleSaysR16, type ShapeNumbers as ShapeNumbersR16 } from '../src/viewport/emitter-shape.js';
import { renewsParticleCache as renewsParticleCacheR16 } from '../src/viewport/particles-view.js';

describe('a palavra ao lado do ícone na barra da cena (P38)', () => {
  it('a ferramenta escolhida mostra o nome; as outras, só o ícone', () => {
    expect(wordOnBar('bone', 'bone', false)).toBe(true);
    expect(wordOnBar('weights', 'bone', false)).toBe(false);
  });

  it('Partículas mostra a palavra sempre: é a porta que não se achava', () => {
    expect(wordOnBar('particulas', '', false)).toBe(true);
  });

  it('os botões que não são ferramenta continuam em ícone', () => {
    expect(wordOnBar('novo', '', false)).toBe(false);
    expect(wordOnBar('desfazer', '', false)).toBe(false);
  });

  it('com a preferência ligada, todos mostram, como antes', () => {
    expect(wordOnBar('novo', '', true)).toBe(true);
    expect(wordOnBar('weights', 'bone', true)).toBe(true);
  });
});

describe('rodada 23, defeito 6: toda cópia da mesma entidade toca, e mostra o que foi mexido por dentro', () => {
  const ler = (nome: string): string => readFileSyncCena(resolveCena(import.meta.dirname, nome), 'utf8');

  it('a forma: a cópia solta nascia SEM animação, e ficava na pose de montar', async () => {
    const { firstAnimationOf } = await import('../src/doc/drop-entity.js');
    const espada = loadSkeletonData(JSON.parse(ler('../../formato/exemplos/espada.bone')) as BoneFile);
    const mapa = new Map([['espada.bone', espada]]);
    // A primeira animação da espada é a `idle`: a mesma que a espada da mão toca.
    expect(firstAnimationOf(mapa, 'espada.bone')).toBe('idle');
    const heroi = JSON.parse(ler('../../formato/exemplos/heroi.bone')) as BoneFile;
    const daMao = (heroi.skins![0]!.attachments as Record<string, Record<string, { animation?: string }>>)['weapon']!['sword']!;
    expect(daMao.animation).toBe(firstAnimationOf(mapa, 'espada.bone'));
    // Fora do mapa (o filho não foi aberto): nada, e não um palpite.
    expect(firstAnimationOf(mapa, 'escudo.bone')).toBeNull();
  });

  it('a solta grava o que toca; sem animação conhecida, não grava nada', () => {
    const doc = new DocCena(JSON.parse(ler('../../formato/exemplos/heroi.bone')) as BoneFile);
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', 'forearm', ['default'], 0, 0, null, 0, 'idle'));
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', 'forearm', ['default'], 0, 0, null, 0, null));
    const anexos = doc.file.skins!.find((s) => s.name === 'default')!.attachments as Record<string, Record<string, { animation?: string }>>;
    expect(anexos['espada']!['espada']!.animation).toBe('idle');
    expect('animation' in anexos['espada2']!['espada2']!).toBe(false);
  });

  it('no herói, a espada da mão e a solta no antebraço giram juntas; a solta sem animação ficaria parada', async () => {
    const { firstAnimationOf } = await import('../src/doc/drop-entity.js');
    const espada = loadSkeletonData(JSON.parse(ler('../../formato/exemplos/espada.bone')) as BoneFile);
    const skeletons = new Map([['espada.bone', espada]]);
    const doc = new DocCena(JSON.parse(ler('../../formato/exemplos/heroi.bone')) as BoneFile, { path: 'heroi.bone', skeletons });
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', 'forearm', ['default'], 20, 0, null, 0, firstAnimationOf(skeletons, 'espada.bone')));
    // A de antes do conserto, para o teste se ver falhar: a mesma solta, sem animação.
    doc.run(new DropEntityAsSlot(doc.file, 'espada.bone', 'forearm', ['default'], 20, 0, null, 0, null));
    doc.animation = 'idle';
    doc.time = 0.5;
    doc.repose();
    const lamina = (slot: string): number => {
      const filho = doc.skeleton!.findSlot(slot)!.nestedSkeleton() as unknown as { skeleton: Skeleton };
      return filho.skeleton.findBone('lamina')!.rotation;
    };
    expect(lamina('weapon')).not.toBe(0);
    expect(lamina('espada')).toBe(lamina('weapon'));
    expect(lamina('espada2')).not.toBe(lamina('weapon'));
  });

  it('o rodapé diz o que ela toca, ou que fica parada e onde se escolhe', () => {
    expect(entityDropNotice('espada', 'forearm', null, 'idle')).toContain('Ela toca idle');
    expect(entityDropNotice('espada', 'forearm', null, null)).toContain('parada na pose de montar');
    expect(entityDropNotice('espada', 'forearm', null, null)).toContain('botão direito da faixa');
    // Quem não diz o que toca recebe a frase de antes, letra por letra.
    expect(entityDropNotice('espada', 'mao', null)).toBe('"espada" virou uma tomada no osso mao: a entidade inteira entra nela, com as animações dela');
  });

  it('o arrasto e o menu passam o que ela toca', () => {
    expect(ler('../src/viewport/viewport.ts')).toContain('const toca = firstAnimationOf(skeletonsDe(corpoDe(doc)), uri);');
    expect(ler('../src/panels/entities-actions.ts')).toContain('const toca = firstAnimationOf(skeletonsDe(corpo), row.uri);');
  });
});

// ---------------------------------------------------------------------------
// A forma do emissor na cena — rodada 16, lote 3
// ---------------------------------------------------------------------------

describe('a forma do emissor na cena, com alças (rodada 16, lote 3)', () => {
  const I = { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 };
  const forma = (extra: Partial<ShapeNumbersR16>): ShapeNumbersR16 => ({
    shape: 'point', radius: 0, radiusThickness: 1, arc: 360, size: [0, 0], edge: [0, 0, 0, 0], ...extra,
  });
  const perto = (a: number, b: number): void => expect(Math.abs(a - b)).toBeLessThan(1e-9);

  // Rodada 38, lote 4: o Ponto não desenhava nada na cena, e as partículas
  // nasciam escondidas atrás da estrela. Agora um anel tracejado diz "é aqui".
  it('o ponto: um anel tracejado em volta da estrela, sem alça', () => {
    const g = emitterShapeGuideR16(forma({ shape: 'point' }), I, 0, 10);
    expect(g.lines).toHaveLength(1);
    expect(g.lines[0]!.dashed).toBe(true);
    expect(g.lines[0]!.closed).toBe(true);
    const p = g.lines[0]!.points;
    for (let i = 0; i < p.length; i += 2) expect(Math.hypot(p[i]!, p[i + 1]!)).toBeGreaterThan(10);
    expect(g.handles).toEqual([]);
  });

  it('o círculo inteiro: um traço fechado no raio, alça do raio no meio e do trecho no fim', () => {
    const g = emitterShapeGuideR16(forma({ shape: 'circle', radius: 10 }), I, 0);
    expect(g.lines).toHaveLength(1);
    expect(g.lines[0]!.closed).toBe(true);
    const p = g.lines[0]!.points;
    for (let i = 0; i < p.length; i += 2) perto(Math.hypot(p[i]!, p[i + 1]!), 10);
    const raio = g.handles.find((h) => h.id === 'radius')!;
    perto(raio.x, -10); perto(raio.y, 0);
    // Conserto 4: no círculo inteiro não há alça do trecho (puxava-se achando que era o raio).
    expect(g.handles.map((h) => h.id)).toEqual(['radius']);
  });

  it('o anel tracejado por dentro, em R·(1−T), com a alça dele; o arco abre a fatia', () => {
    const anel = emitterShapeGuideR16(forma({ shape: 'circle', radius: 10, radiusThickness: 0.25 }), I, 0);
    const dentro = anel.lines.find((l) => l.dashed)!;
    perto(Math.hypot(dentro.points[0]!, dentro.points[1]!), 7.5);
    expect(anel.handles.map((h) => h.id).sort()).toEqual(['radius', 'thickness']);
    const arco = emitterShapeGuideR16(forma({ shape: 'circle', radius: 10, arc: 90 }), I, 0);
    expect(arco.lines[0]!.closed).toBe(false);
    expect(arco.lines).toHaveLength(3);
    const fim = arco.handles.find((h) => h.id === 'arc')!;
    perto(fim.x, 0); perto(fim.y, 10);
  });

  it('o retângulo e a linha seguem a matriz do emissor (§9.10)', () => {
    // Girado 90° e levado a (10, 20): o canto (w/2, h/2) = (3, 2) vai a (10 − 2, 20 + 3).
    const M = { a: 0, b: -1, c: 1, d: 0, worldX: 10, worldY: 20 };
    const r = emitterShapeGuideR16(forma({ shape: 'rectangle', size: [6, 4] }), M, 0);
    const canto = r.handles[0]!;
    perto(canto.x, 8); perto(canto.y, 23);
    const l = emitterShapeGuideR16(forma({ shape: 'edge', edge: [1, 0, 5, 0] }), M, 0);
    expect(l.handles.map((h) => [h.id, Math.round(h.x), Math.round(h.y)])).toEqual([['edge0', 10, 21], ['edge1', 10, 25]]);
  });

  it('o que cada alça grava, no referencial do emissor', () => {
    const n = forma({ shape: 'circle', radius: 10, edge: [1, 2, 3, 4] });
    expect(shapeHandleWriteR16('radius', 3, 4, n)).toEqual({ field: 'radius', value: 5 });
    expect(shapeHandleWriteR16('thickness', 4, 0, n)).toEqual({ field: 'radiusThickness', value: 0.6 });
    expect(shapeHandleWriteR16('arc', 0, -1, n)).toEqual({ field: 'arc', value: 270 });
    expect(shapeHandleWriteR16('arc', 1, 0, n)).toEqual({ field: 'arc', value: 360 });
    expect(shapeHandleWriteR16('corner', -5, 3, n)).toEqual({ field: 'size', value: [10, 6] });
    // A linha se grava inteira: mexer no fim não toca no início.
    expect(shapeHandleWriteR16('edge1', 7, 8, n)).toEqual({ field: 'edge', value: [1, 2, 7, 8] });
  });

  it('a alça nunca fica em cima da estrela: raio 0 vai para a borda, ponta na origem fica sem alça', () => {
    const c = emitterShapeGuideR16(forma({ shape: 'circle', radius: 0 }), I, 0, 5);
    const raio = c.handles.find((h) => h.id === 'radius')!;
    expect(Math.hypot(raio.x, raio.y)).toBeGreaterThan(5);
    const l = emitterShapeGuideR16(forma({ shape: 'edge', edge: [0, 0, 30, 0] }), I, 0, 5);
    expect(l.handles.map((h) => h.id)).toEqual(['edge1']);
    // A alça debaixo do mouse, com folga.
    expect(shapeHandleAtR16(l, 31, 1, 3)?.id).toBe('edge1');
    expect(shapeHandleAtR16(l, 0, 0, 3)).toBeNull();
  });

  it('o osso é um traço tracejado do comprimento dele, sem alça', () => {
    const g = emitterShapeGuideR16(forma({ shape: 'bone' }), I, 40);
    expect(g.lines[0]!.points).toEqual([0, 0, 40, 0]);
    expect(g.lines[0]!.dashed).toBe(true);
    expect(g.handles).toEqual([]);
  });
});

describe('as alças dizem o que puxam (rodada 16, conserto 4)', () => {
  it('o rodapé enquanto arrasta: "Raio: 40", com vírgula e unidade', () => {
    const h = (id: string, label: string) => ({ id, label, x: 0, y: 0 }) as never;
    expect(shapeHandleSaysR16(h('radius', 'Raio'), 40)).toBe('Raio: 40');
    expect(shapeHandleSaysR16(h('arc', 'Trecho'), 120.5)).toBe('Trecho: 120,5°');
    expect(shapeHandleSaysR16(h('corner', 'Retângulo'), [80, 40])).toBe('Retângulo: 80 × 40');
    expect(shapeHandleSaysR16(h('edge1', 'Fim da linha'), [1, 2, 30, 20])).toBe('Fim da linha: 30 · 20');
  });
});

describe('a cena esquece a curva de emissão quando o arquivo muda (rodada 16, conserto 5)', () => {
  it('estrutura, arquivo e imagens renovam o desenhador; uma pose não', () => {
    // O defeito, medido na tela em 05/10, 17h20: sem renovar, Taxa 40 → 200
    // mudava 0 px na cena; renovando, 17.089 px. O cache do runtime guarda a
    // curva pelo NOME do emissor.
    for (const kind of ['file', 'structure', 'assets']) expect(renewsParticleCacheR16(kind)).toBe(true);
    expect(renewsParticleCacheR16('transform')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Rodada 17, lote 3: o nome da alça do emissor vai para fora da forma
// ---------------------------------------------------------------------------

describe('rodada 17: o nome da alça do emissor não passa por cima da estrela', () => {
  it('a alça à esquerda do centro escreve para a esquerda; as outras, para a direita', () => {
    expect(shapeLabelSide(-45, 0)).toBe('left');
    expect(shapeLabelSide(45, 0)).toBe('right');
    expect(shapeLabelSide(0, 0)).toBe('right');
    const desenho = readFileSyncCena(resolveCena(__dirname, '../src/viewport/viewport-draw.ts'), 'utf8');
    expect(desenho).toContain("const lado = shapeLabelSide(alca.x, forma.matrix.worldX);");
    expect(desenho).toContain("ctx.textAlign = lado === 'left' ? 'right' : 'left';");
  });
});

// ---------------------------------------------------------------------------
// Rodada 47, lote 3 (doc 68, R7): o número da casa fora da ficha
// ---------------------------------------------------------------------------
const fonteR47 = (arquivo: string): string => readFileSyncCena(resolveCena(__dirname, '../src', arquivo), 'utf8');
/** Quantas caixas de número cruas (`type = 'number'`) o arquivo ainda tem. */
const cruasR47 = (texto: string): number => (texto.match(/\.type = 'number'|type: 'number'|type="number"/g) ?? []).length;

describe('rodada 47, lote 3: o zoom da cena faz conta e anda com as setas (nota d do doc 84)', () => {
  it('a caixa do zoom passa pela conta da ficha, e ↑ ↓ andam 10 % (Shift 50 %)', () => {
    const cena = fonteR47('viewport/viewport.ts');
    expect(cena).toContain("const conta = evalFieldInput(field.value.replace(/%/g, ''), agora);");
    expect(cena).toContain("const passo = (e.shiftKey ? 50 : 10) * (e.key === 'ArrowUp' ? 1 : -1);");
  });
});

// ---------------------------------------------------------------------------
// N-4b (05/11/2026): o recorte da exportação, arrastado na cena
// ---------------------------------------------------------------------------

import {
  CROP_DRAW_FIRST, CROP_MIN, CROP_NEEDS_ANIMATION, SetCrop, cropAroundDrawing, cropEditing, cropFromCorners,
  cropHandles, cropInFile, cropOfOpenAnimation, cropZoneAt, dragCrop, hasCropField, removeCrop, setCropEditing,
  startCropEditing,
} from '../src/viewport/crop-model.js';
import { cropChoice } from '../src/io/export-image.js';
import { CROP_FIELDS } from '../src/viewport/crop-model.js';
import { cropBoxSignature } from '../src/viewport/crop-box.js';
import { CROP_NONE_TITLE, cropStripSignature, cropStripTitle } from '../src/panels/animations-crop.js';
import { KEY_TABLE, keyConflicts } from '../src/ui/keys.js';
import { parseBoneText as parseBoneTextN4b } from '../../runtime/src/index.js';

describe('N-4b: o recorte arrastável na cena', () => {
  const heroiN4b = (): InstanceType<typeof DocCena> => new DocCena(parseBoneTextN4b(
    readFileSyncCena(resolveCena(import.meta.dirname, '../../formato/exemplos/heroi.bone'), 'utf8'),
  ) as BoneFile);
  const animOf = (doc: InstanceType<typeof DocCena>, name: string): Record<string, unknown> =>
    (doc.file.animations ?? []).find((a) => a.name === name) as unknown as Record<string, unknown>;
  const box = { x: -100, y: 0, width: 200, height: 300 };

  beforeEach(() => setCropEditing(false));

  it('prova do defeito: o herói não traz recorte, e sem recorte a cena não desenha nada', () => {
    const doc = heroiN4b();
    doc.animation = 'idle';
    expect(hasCropField(doc.file, 'idle')).toBe(false);
    expect(cropOfOpenAnimation(doc)).toBeNull();
  });

  it('os puxadores: canto antes de lado, lado antes do meio, fora é null', () => {
    const r = 4;
    expect(cropZoneAt(box, -100, 300, r)).toBe('nw');
    expect(cropZoneAt(box, 100, 0, r)).toBe('se');
    expect(cropZoneAt(box, 0, 300, r)).toBe('n');
    expect(cropZoneAt(box, 100, 150, r)).toBe('e');
    // A borda inteira puxa o lado, não só o quadradinho do meio.
    expect(cropZoneAt(box, 100, 40, r)).toBe('e');
    expect(cropZoneAt(box, -40, 1, r)).toBe('s');
    expect(cropZoneAt(box, 0, 150, r)).toBe('move');
    expect(cropZoneAt(box, 300, 150, r)).toBeNull();
    expect(cropHandles(box).map((h) => h.zone)).toEqual(['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']);
  });

  it('puxar um lado mexe só nele; o outro fica parado no inteiro em que estava', () => {
    expect(dragCrop(box, 'e', 20.4, 99)).toEqual({ x: -100, y: 0, width: 220, height: 300 });
    expect(dragCrop(box, 'w', -10, 0)).toEqual({ x: -110, y: 0, width: 210, height: 300 });
    expect(dragCrop(box, 'n', 0, -50)).toEqual({ x: -100, y: 0, width: 200, height: 250 });
    expect(dragCrop(box, 'sw', 10, 10)).toEqual({ x: -90, y: 10, width: 190, height: 290 });
    expect(dragCrop(box, 'move', 5.6, -3.2)).toEqual({ x: -94, y: -3, width: 200, height: 300 });
  });

  it('puxar além do lado oposto não vira do avesso: para a 1 px dele', () => {
    const r = dragCrop(box, 'e', -500, 0);
    expect(r.x).toBe(-100);
    expect(r.width).toBe(CROP_MIN);
    const t = dragCrop(box, 'n', 0, -900);
    expect(t.y).toBe(0);
    expect(t.height).toBe(CROP_MIN);
  });

  it('traçar de um canto ao outro, em qualquer direção', () => {
    expect(cropFromCorners(50, 80, -30.2, 10)).toEqual({ x: -30, y: 10, width: 80, height: 70 });
  });

  it('o recorte que nasce sozinho é o desenho com margem, e sem desenho não se inventa', () => {
    expect(cropAroundDrawing({ x: -10.5, y: 0.2, width: 20, height: 30 }, 10)).toEqual({ x: -21, y: -10, width: 41, height: 51 });
    expect(cropAroundDrawing(null)).toBeNull();
    expect(cropAroundDrawing({ x: 0, y: 0, width: 0, height: 10 })).toBeNull();
  });

  it('SetCrop grava, o Ctrl+Z tira o campo inteiro, e a cena lê o novo na hora', () => {
    const doc = heroiN4b();
    doc.animation = 'idle';
    doc.run(new SetCrop('idle', box));
    expect(animOf(doc, 'idle').crop).toEqual(box);
    // A cena e a exportação leem `doc.data`: o comando relê as animações.
    expect(cropOfOpenAnimation(doc)).toEqual(box);
    doc.undo();
    expect(Object.prototype.hasOwnProperty.call(animOf(doc, 'idle'), 'crop')).toBe(false);
    expect(cropOfOpenAnimation(doc)).toBeNull();
    doc.redo();
    expect(cropInFile(doc.file, 'idle')).toEqual(box);
  });

  it('o revert devolve o objeto antigo letra por letra, com campo a mais e tudo', () => {
    const doc = heroiN4b();
    const idle = animOf(doc, 'idle');
    idle.crop = { x: 1, width: 10, height: 20, extra: 'fica' };
    doc.rebuild();
    doc.run(new SetCrop('idle', { x: 5, y: 5, width: 5, height: 5 }));
    doc.undo();
    expect(animOf(doc, 'idle').crop).toEqual({ x: 1, width: 10, height: 20, extra: 'fica' });
  });

  it('um arrasto é um passo de desfazer só; o próximo arrasto é outro', () => {
    const doc = heroiN4b();
    doc.animation = 'idle';
    doc.run(new SetCrop('idle', box, 'cena'));
    doc.run(new SetCrop('idle', { ...box, width: 210 }, 'cena'));
    doc.run(new SetCrop('idle', { ...box, width: 220 }, 'cena'));
    doc.endMerge?.();
    doc.run(new SetCrop('idle', { ...box, width: 230 }, 'cena'));
    doc.undo();
    expect(cropInFile(doc.file, 'idle')?.width).toBe(220);
    doc.undo();
    expect(hasCropField(doc.file, 'idle')).toBe(false);
  });

  it('ligar o modo sem recorte cria um em volta do desenho, num passo de desfazer', () => {
    const doc = heroiN4b();
    doc.animation = 'idle';
    doc.repose();
    const says = startCropEditing(doc);
    expect(cropEditing()).toBe(true);
    const nasceu = cropInFile(doc.file, 'idle');
    expect(nasceu).not.toBeNull();
    expect(nasceu!.width).toBeGreaterThan(20);
    expect(says).toContain('Recorte criado em volta do desenho');
    expect(doc.undoLabel).toContain('Criar o recorte');
    doc.undo();
    expect(hasCropField(doc.file, 'idle')).toBe(false);
  });

  it('com a base aberta o modo não liga, e diz por quê (regra 21)', () => {
    const doc = heroiN4b();
    doc.animation = null;
    expect(startCropEditing(doc)).toBe(CROP_NEEDS_ANIMATION);
    expect(cropEditing()).toBe(false);
    expect(removeCrop(doc)).toBe(CROP_NEEDS_ANIMATION);
  });

  it('sem desenho na cena o modo liga, mas não inventa tamanho: pede o traço', () => {
    const doc = new DocCena({ skeleton: { name: 'vazio' }, bones: [{ name: 'root' }], animations: [{ name: 'a' }] } as unknown as BoneFile);
    doc.animation = 'a';
    expect(startCropEditing(doc)).toBe(CROP_DRAW_FIRST);
    expect(cropEditing()).toBe(true);
    expect(hasCropField(doc.file, 'a')).toBe(false);
  });

  it('tirar o recorte apaga o campo e desliga o modo; Ctrl+Z traz de volta', () => {
    const doc = heroiN4b();
    doc.animation = 'idle';
    doc.run(new SetCrop('idle', box));
    setCropEditing(true);
    expect(removeCrop(doc)).toContain('corte automático');
    expect(hasCropField(doc.file, 'idle')).toBe(false);
    expect(cropEditing()).toBe(false);
    doc.undo();
    expect(cropInFile(doc.file, 'idle')).toEqual(box);
  });

  it('a exportação usa o recorte arrastado (A área desenhada nesta animação)', () => {
    const doc = heroiN4b();
    doc.animation = 'idle';
    doc.run(new SetCrop('idle', { x: -40, y: 5, width: 80, height: 90 }, 'cena'));
    const anim = doc.data!.animations.find((a) => a.name === 'idle')!;
    expect(cropChoice({ crop: 'animacao' }, anim).box).toEqual({ x: -40, y: 5, width: 80, height: 90 });
    // A outra opção continua sendo a borda: o recorte não manda nela.
    expect(cropChoice({ crop: 'borda' }, anim).box).toBeNull();
  });

  it('a tira de Animações: some na base, muda de assinatura a cada passo', () => {
    const doc = heroiN4b();
    doc.animation = null;
    expect(cropStripSignature(doc)).toBe('base');
    expect(cropStripTitle(doc)).toBeNull();
    doc.animation = 'idle';
    expect(cropStripTitle(doc)).toBe(CROP_NONE_TITLE);
    const antes = cropStripSignature(doc);
    doc.run(new SetCrop('idle', box));
    expect(cropStripSignature(doc)).not.toBe(antes);
    expect(cropStripTitle(doc)).toBe('Recorte 200 × 300 px');
    // R2/R3 do doc 68: unidade depois da caixa, faixa na dica.
    for (const campo of CROP_FIELDS) expect(campo.dica).toMatch(/em px, de /);
    expect(CROP_FIELDS.filter((c) => c.min === 1).map((c) => c.key)).toEqual(['width', 'height']);
  });

  it('a caixa dos números na cena só abre com o modo ligado, e muda a cada passo', () => {
    const doc = heroiN4b();
    doc.animation = 'idle';
    doc.run(new SetCrop('idle', box));
    expect(cropBoxSignature(doc)).toBe('fechada');
    setCropEditing(true);
    const aberta = cropBoxSignature(doc);
    expect(aberta).toBe('idle|-100,0,200,300');
    doc.run(new SetCrop('idle', { ...box, width: 260 }, 'cena'));
    expect(cropBoxSignature(doc)).not.toBe(aberta);
    doc.animation = null;
    expect(cropBoxSignature(doc)).toBe('fechada');
  });

  it('o menu Animação tem as duas portas, com C para o recorte, e as teclas não brigam', () => {
    const anim = allMenus(NEUTRAL_MENU_STATE).find((g) => g.label === 'Animação')!;
    const entradas = flatEntries(anim.entries);
    expect(entradas.find((e) => e.action === 'recorte-na-cena')?.shortcut).toBe('C');
    expect(entradas.some((e) => e.action === 'tirar-recorte')).toBe(true);
    expect(ACTION_TABLE.find((r) => r.id === 'recorte-na-cena')?.owner).toBe('cena');
    expect(KEY_TABLE.filter((k) => k.action === 'local:recorte-fim').map((k) => k.key)).toEqual(['enter', 'escape']);
    expect(keyConflicts(KEY_TABLE)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Prova de pessoa (05/11/2026): depois de Abrir o herói, o rodapé diz o primeiro passo
// ---------------------------------------------------------------------------

import { EXAMPLE_FIRST_STEP } from '../src/viewport/welcome-model.js';
import { versoesDaFrase as versoesDaFraseCena } from '../src/ui/shell-status.js';

describe('prova de pessoa: o herói abre na base, e o rodapé diz onde clicar', () => {
  it('a frase diz a animação, a aba e o botão — o que o ▶ cinza não dizia', () => {
    expect(EXAMPLE_FIRST_STEP).toContain('idle');
    expect(EXAMPLE_FIRST_STEP).toContain('aba Animações');
    expect(EXAMPLE_FIRST_STEP).toContain('▶');
    // O rodapé encolhe a frase até caber: a primeira frase, ou o que vem antes
    // dos dois-pontos. Esta não tem nem um nem outro, e é curta: sai inteira.
    expect(versoesDaFraseCena(EXAMPLE_FIRST_STEP)).toEqual([EXAMPLE_FIRST_STEP]);
    expect(EXAMPLE_FIRST_STEP.length).toBeLessThanOrEqual(75);
  });

  it('o Abrir o herói diz a frase DEPOIS de abrir a base (senão o "Abriu a base" a apagaria)', () => {
    const main = readFileSyncCena(resolveCena(import.meta.dirname, '../src/main.ts'), 'utf8');
    const base = main.indexOf('switchAnimation(doc, null);');
    const frase = main.indexOf('doc.notice(EXAMPLE_FIRST_STEP);');
    expect(base).toBeGreaterThan(0);
    expect(frase).toBeGreaterThan(base);
  });
});

// ---------------------------------------------------------------------------
// Prova de pessoa (05/11/2026): arrastar na cena numa animação diz a chave que nasceu
// ---------------------------------------------------------------------------

import { GestureNotice, gestureSays, isKeyNotice } from '../src/viewport/gesture-notice.js';

describe('prova de pessoa: o arrasto que grava chave diz a chave', () => {
  it('a linha do tempo diz a chave no meio do gesto, e o recado do fim a guarda', () => {
    const g = new GestureNotice();
    g.press();
    g.hear({ kind: 'structure', label: 'Mover osso' });
    g.hear({ kind: 'selection', label: '2 chaves em 0,50 s: Posição X de torso, Posição Y de torso' });
    g.hear({ kind: 'transform', label: 'Mover X 8,3 px · Y 0 px' });
    const chave = g.keyNotice();
    const said = g.release();
    // Antes: o rodapé ficava com "Mover X 8,3 px · Y 0 px" e a chave sumia.
    expect(said).toBe('Mover X 8,3 px · Y 0 px');
    expect(gestureSays(said!, chave, g.lastCommand()))
      .toBe('2 chaves em 0,50 s: Posição X de torso, Posição Y de torso. Mover X 8,3 px · Y 0 px');
  });

  it('a chave vai na frente: é o que sobra quando o rodapé encolhe a frase', () => {
    const frase = gestureSays('Mover X 1 px · Y 0 px', 'Chave em 0,00 s: Rotação de torso', null);
    expect(versoesDaFraseCena(frase).at(-1)).toBe('Chave em 0,00 s');
    expect(versoesDaFraseCena(frase)[1]).toBe('Chave em 0,00 s: Rotação de torso.');
  });

  it('sem chave, o recado de sempre; a chave como última fala usa o nome do comando', () => {
    expect(gestureSays('Mover X 1 px · Y 0 px', null)).toBe('Mover X 1 px · Y 0 px');
    expect(gestureSays('Chave em 0,00 s: Rotação de torso', 'Chave em 0,00 s: Rotação de torso', 'Girar 15°'))
      .toBe('Chave em 0,00 s: Rotação de torso. Girar 15°');
    expect(gestureSays('Chave em 0,00 s: X', 'Chave em 0,00 s: X', null)).toBe('Chave em 0,00 s: X');
    expect(isKeyNotice('3 chaves em 1,00 s')).toBe(true);
    expect(isKeyNotice('Chaveou tudo')).toBe(false);
  });

  it('fora do gesto, nada se guarda', () => {
    const g = new GestureNotice();
    g.hear({ kind: 'selection', label: 'Chave em 0,00 s: X' });
    expect(g.keyNotice()).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Prova de pessoa (05/11/2026): recorte e máscara, dois tracejados quase da mesma cor, com nome
// ---------------------------------------------------------------------------

import { clippingLabel, cropLabel } from '../src/viewport/viewport-draw.js';
import { LIGHT as temaClaroCena } from '../src/ui/theme.js';

describe('prova de pessoa: o recorte e a máscara dizem o que são', () => {
  it('as duas cores são quase a mesma — por isso o nome escrito (prova do defeito)', () => {
    const rgb = (h: string): number[] => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [a, b] = [rgb('#ff00c8'), rgb(temaClaroCena.sceneClipping)];
    const distancia = Math.hypot(a[0]! - b[0]!, a[1]! - b[1]!, a[2]! - b[2]!);
    expect(distancia).toBeLessThan(80);
  });

  it('o recorte diz "recorte" e o tamanho; a máscara diz "máscara" e o nome', () => {
    expect(cropLabel({ width: 143, height: 265 })).toBe('recorte 143 × 265 px');
    expect(cropLabel({ width: 1, height: 1 }, '167 × 283 px')).toBe('recorte 167 × 283 px');
    expect(clippingLabel('mask')).toBe('máscara mask');
  });
});

// ---------------------------------------------------------------------------
// Prova de pessoa (05/11/2026): 7 8 9 0 na cena dizem o que fizeram
// ---------------------------------------------------------------------------

import { switchNotice as switchNoticeCena } from '../src/panels/view-panel-actions.js';
import { VIEW_TOGGLE_KEYS as TECLAS_DE_VER } from '../src/viewport/onion.js';

describe('prova de pessoa: as teclas de ver e travar falam, na cena', () => {
  it('cada uma das quatro tem frase, e a frase diz a tecla da volta', () => {
    for (const [tecla, campo] of Object.entries(TECLAS_DE_VER)) {
      for (const ligado of [true, false]) {
        const frase = switchNoticeCena(campo, ligado);
        expect(frase, `${tecla} ${ligado}`).not.toBeNull();
        expect(frase!).toContain(tecla);
      }
    }
  });

  it('a cena diz a frase quando a tecla vira o interruptor (antes: calada)', () => {
    const cena = readFileSyncCena(resolveCena(import.meta.dirname, '../src/viewport/viewport.ts'), 'utf8');
    const ramo = cena.slice(cena.indexOf('if (toggleViewKey(e.key, doc)) {'), cena.indexOf('if (toggleViewKey(e.key, doc)) {') + 600);
    expect(ramo).toContain('switchNotice(campo, viewSettings()[campo])');
    expect(ramo).toContain('doc.notice(frase)');
  });
});
