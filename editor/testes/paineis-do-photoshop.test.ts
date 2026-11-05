/**
 * Os painéis do Photoshop — rodada 4 (05/10/2026).
 *
 * Os modelos puros dos lotes 1, 2 e 3 do plano (`documentos/projeto do
 * programa/09 OS PAINEIS - conferidos e o plano 2026-10-05.md`):
 *
 * | Lote | Arquivo | O gesto |
 * |:---:|:---|:---|
 * | 1 | `ui/panel-drag.ts` | puxar a aba (ou a barra do solto) e ver o painel vir junto; colar de volta pelo mesmo gesto |
 * | 2 | `ui/icon-columns.ts` | a setinha dupla: a coluna vira faixa de ícones, e o ícone abre o painel ao lado |
 * | 3 | `ui/float-fit.ts` | o painel solto cabe inteiro: nunca cobre a linha do tempo, nunca sai da tela |
 *
 * As medidas dos casos são as da conferência no `programa/` v25.7, em
 * 1440×900: a camada dos soltos em `0,88 1440×627`, a cena em `268,88 904×627`.
 */

import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { floatInside, fitFloat, resizeInside } from '../src/ui/float-fit.js';
import {
  FLYOUT_H, ICON_STRIP_W, PANEL_ICONS, TOGGLE_W, canCollapseToIcons, canExpand, clickIcon,
  closeFlyout, columnWidth, defaultIconState, flyoutBox, iconSlots, iconStateToSave,
  isIconic, panelIcon, parseIconState, setAllIconic, toggleFitsStrip, toggleIconic, toggleSpot,
} from '../src/ui/icon-columns.js';
import { layoutOf } from '../src/ui/arrangements.js';
import { CONTEXTS, DEFAULT_CONTEXT, contextDock, contextLayout, parseContext, switchTo, switcherItems, switcherLabel } from '../src/ui/contexts.js';
import {
  dockAllFloatGroups, dockFloatGroup, floatGroup, floatHolding, readFloatTabs, selectFloatTab, tabsOf,
} from '../src/ui/float-groups.js';
import {
  columnsShown, dockShown, hiddenToSave, hideNotice, modeFromHidden, pressShiftTab, pressTab,
} from '../src/ui/hide-panels.js';
import { LEFT_GROUPS, RIGHT_GROUPS, defaultLayout, ladosPorUso, moveToOtherColumn, parseLayout, sideOf } from '../src/ui/layout-model.js';
import type { LayoutState } from '../src/ui/layout-model.js';
import {
  DRAG_START_PX, dragHint, dropLine, dropTarget, endDrag, moveDrag, startDrag,
} from '../src/ui/panel-drag.js';
import type { DragSource, DropArea, StripInfo } from '../src/ui/panel-drag.js';
import { FLOAT_BAR_H, drawnFloatBox, isFloatFolded, readFold, tabDoubleClick, toggleFloatFold } from '../src/ui/panel-fold.js';
import {
  FLOAT_DEFAULT_H, FLOAT_DEFAULT_W, FLOAT_MIN_H, FLOAT_MIN_W, clampFloat, defaultColumnState,
  closePanel, dockAllFloating, dockPanel, floatBoxOf, floatPanel, parseColumnState,
} from '../src/ui/panel-groups.js';
import type { ColumnState, TabRect } from '../src/ui/panel-groups.js';
import { GROUP_MIN_PX } from '../src/ui/panel-groups.js';
import {
  ANIM_LIST_HEAD, ANIM_LIST_ROW, QUICK_SHEET_BONE, QUICK_SHEET_IMAGE, SPLIT_GRIP_H, TAB_STRIP_H, animFloorCap, animListNeed, cutNotice,
  floorGroup, planColumn, planShare, propsNeed,
  dockRoomForColumn,
} from '../src/ui/props-floor.js';

/** Um retângulo na tela, de `x, y, w, h`. */
const r = (x: number, y: number, w: number, h: number): TabRect => ({ left: x, top: y, right: x + w, bottom: y + h });

/** A tela da conferência, 1440×900: a camada dos soltos e a cena dentro dela. */
const AREA: DropArea = {
  layer: r(0, 88, 1440, 627),
  scene: { x: 268, y: 0, w: 904, h: 627 },
};

/** As quatro tiras da tela de fábrica, como a conferência as mediu. */
const STRIPS: StripInfo[] = [
  { side: 'left', group: 0, strip: r(0, 88, 258, 37), body: r(0, 125, 258, 384), tabs: [r(4, 92, 85, 31), r(91, 92, 65, 31)] },
  { side: 'left', group: 1, strip: r(0, 517, 258, 37), body: r(0, 554, 258, 161), tabs: [r(4, 521, 129, 31)] },
  { side: 'right', group: 0, strip: r(1182, 88, 258, 97), body: r(1182, 185, 258, 324), tabs: [r(1186, 92, 97, 31), r(1285, 92, 87, 31)] },
  { side: 'right', group: 1, strip: r(1182, 517, 258, 70), body: r(1182, 587, 258, 128), tabs: [r(1186, 521, 115, 31)] },
];

const ORDEM: DragSource = { kind: 'aba', id: 'ordem', side: 'left', group: 0 };

/** Aperta em `de`, anda até `ate` em passos, e devolve o gesto. */
function puxar(source: DragSource, de: [number, number], ate: [number, number], grab = { x: 0, y: 0 }) {
  let s = startDrag(source, de[0], de[1], grab);
  for (let i = 1; i <= 10; i++) {
    s = moveDrag(s, de[0] + (ate[0] - de[0]) * i / 10, de[1] + (ate[1] - de[1]) * i / 10);
  }
  return s;
}

// ---------------------------------------------------------------------------
// Lote 3 — o painel solto cabe inteiro
// ---------------------------------------------------------------------------

describe('lote 3: o painel solto cabe inteiro (float-fit)', () => {
  // Regra 26: antes de provar o conserto, provar que o defeito existia. É a
  // foto 37 da conferência: a aba largada sobre o corpo de Propriedades, em
  // (130, 620) na tela, caiu em x = -10 e pendurou 211 px abaixo da cena.
  const caixaDaFoto37 = { x: 130 - FLOAT_DEFAULT_W / 2, y: 620 - 88 - 14, w: FLOAT_DEFAULT_W, h: FLOAT_DEFAULT_H };

  it('o defeito existia: o clampFloat antigo deixa o painel pendurado sobre a linha do tempo', () => {
    const velho = clampFloat(caixaDaFoto37, 1440, 627);
    expect(velho.x).toBe(-10);
    expect(velho.y + velho.h).toBeGreaterThan(627);
    expect(floatInside(velho, 1440, 627)).toBe(false);
  });

  it('o mesmo ponto, com fitFloat: inteiro dentro, encostado no chão, sem mudar o tamanho', () => {
    const novo = fitFloat(caixaDaFoto37, 1440, 627);
    expect(floatInside(novo, 1440, 627)).toBe(true);
    expect(novo).toEqual({ x: 0, y: 627 - FLOAT_DEFAULT_H, w: FLOAT_DEFAULT_W, h: FLOAT_DEFAULT_H });
  });

  it('a foto 42, em 1280×720: a camada tem 447 de altura, e o painel no meio da cena não desce sobre o tocador', () => {
    const novo = fitFloat({ x: 500, y: 198, w: FLOAT_DEFAULT_W, h: FLOAT_DEFAULT_H }, 1280, 447);
    expect(floatInside(novo, 1280, 447)).toBe(true);
    expect(novo.h).toBe(FLOAT_DEFAULT_H);
    expect(novo.y).toBe(447 - FLOAT_DEFAULT_H);
  });

  it('não cabe a altura: encolhe até 80% da área, e não abaixo do mínimo', () => {
    const novo = fitFloat({ x: 10, y: 10, w: 280, h: 600 }, 1000, 300);
    expect(novo.h).toBe(240);
    expect(floatInside(novo, 1000, 300)).toBe(true);
    expect(fitFloat({ x: 0, y: 0, w: 10, h: 10 }, 1000, 600)).toEqual({ x: 0, y: 0, w: FLOAT_MIN_W, h: FLOAT_MIN_H });
  });

  it('área menor que o mínimo: ocupa a área toda, e continua dentro', () => {
    const novo = fitFloat({ x: 50, y: 50, w: 280, h: 320 }, 150, 100);
    expect(novo).toEqual({ x: 0, y: 0, w: 150, h: 100 });
  });

  it('largado à direita e acima da área: volta pelo lado que passou', () => {
    expect(fitFloat({ x: 1400, y: -50, w: 280, h: 320 }, 1440, 627)).toEqual({ x: 1160, y: 0, w: 280, h: 320 });
  });

  it('o que já cabe não muda nada', () => {
    const caixa = { x: 400, y: 100, w: 280, h: 320 };
    expect(fitFloat(caixa, 1440, 627)).toEqual(caixa);
  });
});

// ---------------------------------------------------------------------------
// Lote 1 — o arrasto por ponteiro
// ---------------------------------------------------------------------------

describe('lote 1: puxar o painel e ver ele vir junto (panel-drag)', () => {
  it('andar menos que o limite é clique: escolhe a aba, não solta nada', () => {
    let s = startDrag(ORDEM, 124, 108);
    s = moveDrag(s, 124 + DRAG_START_PX - 1, 108);
    expect(s.started).toBe(false);
    expect(dropTarget(s, STRIPS, AREA)).toEqual({ kind: 'nada' });
    expect(endDrag(s, dropTarget(s, STRIPS, AREA))).toEqual({ kind: 'clique' });
  });

  it('passou do limite uma vez, é arrasto até o fim, mesmo voltando para perto', () => {
    let s = startDrag(ORDEM, 124, 108);
    s = moveDrag(s, 140, 108);
    s = moveDrag(s, 125, 108);
    expect(s.started).toBe(true);
  });

  it('sobre a cena: a sombra do painel debaixo da mão, e largar SOLTA (a foto 36, sem "proibido")', () => {
    const s = puxar(ORDEM, [124, 108], [700, 300]);
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo).toEqual({
      kind: 'solto', snap: null,
      box: { x: 700 - FLOAT_DEFAULT_W / 2, y: 300 - 88 - 14, w: FLOAT_DEFAULT_W, h: FLOAT_DEFAULT_H },
    });
    expect(endDrag(s, alvo)).toEqual({ kind: 'soltar', id: 'ordem', box: (alvo as { box: unknown }).box, snap: null });
    expect(dragHint('Ordem', alvo)).toBe('Solte para deixar Ordem solto aqui');
  });

  it('sobre a tira de outro grupo: a linha azul antes da aba debaixo da mão, e largar COLA (a foto 34)', () => {
    const s = puxar(ORDEM, [124, 108], [60, 536]);
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo).toEqual({
      kind: 'tira', side: 'left', group: 1, visual: 0,
      line: { x: 3, top: 521, bottom: 552 }, outline: STRIPS[1]!.strip,
    });
    expect(endDrag(s, alvo)).toEqual({ kind: 'colar', id: 'ordem', side: 'left', group: 1, visual: 0 });
    expect(dragHint('Ordem', alvo)).toBe('Solte para colar Ordem neste grupo');
  });

  it('no vazio da tira, à direita da última aba: a linha azul depois dela', () => {
    const s = puxar(ORDEM, [124, 108], [190, 536]);
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo).toMatchObject({ kind: 'tira', group: 1, visual: 1, line: { x: 134, top: 521, bottom: 552 } });
  });

  it('sobre o CORPO de outro grupo: o contorno azul do grupo, e cola no fim (era a foto 37: caía fora da tela)', () => {
    const s = puxar(ORDEM, [124, 108], [130, 620]);
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo).toEqual({
      kind: 'tira', side: 'left', group: 1, visual: 1, line: null,
      outline: { left: 0, right: 258, top: 517, bottom: 715 },
    });
  });

  it('sobre o corpo do PRÓPRIO grupo: nada (o arrasto desistido)', () => {
    const s = puxar(ORDEM, [124, 108], [130, 300]);
    expect(dropTarget(s, STRIPS, AREA)).toEqual({ kind: 'nada' });
    expect(endDrag(s, { kind: 'nada' })).toEqual({ kind: 'nada' });
  });

  it('atravessar a cena até a outra coluna também cola: a aba da esquerda na tira da direita', () => {
    const s = puxar(ORDEM, [124, 108], [1300, 540]);
    expect(dropTarget(s, STRIPS, AREA)).toMatchObject({ kind: 'tira', side: 'right', group: 1 });
  });

  it('largado perto da borda de baixo da cena: a sombra cola na borda, inteira dentro', () => {
    const s = puxar(ORDEM, [124, 108], [700, 700]);
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo.kind).toBe('solto');
    if (alvo.kind !== 'solto') return;
    expect(alvo.snap).toBe('s');
    expect(floatInside(alvo.box, 1440, 627)).toBe(true);
    expect(alvo.box.y + alvo.box.h).toBe(627);
  });

  it('largado sobre a linha do tempo (fora da camada): o painel fica inteiro dentro, nunca por cima dela', () => {
    const s = puxar(ORDEM, [124, 108], [700, 850]);
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo.kind).toBe('solto');
    if (alvo.kind === 'solto') expect(floatInside(alvo.box, 1440, 627)).toBe(true);
  });

  it('a barra do painel SOLTO: anda sem pular, guardando onde a mão pegou', () => {
    const solto: DragSource = { kind: 'solto', id: 'propriedades', box: { x: 560, y: 198, w: 280, h: 320 } };
    // Pegou a barra 80 px para dentro e 17 para baixo do canto.
    const s = puxar(solto, [640, 88 + 198 + 17], [500, 88 + 100 + 17], { x: 80, y: 17 });
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo).toEqual({ kind: 'solto', snap: null, box: { x: 420, y: 100, w: 280, h: 320 } });
    expect(endDrag(s, alvo)).toEqual({ kind: 'mover', id: 'propriedades', box: { x: 420, y: 100, w: 280, h: 320 }, snap: null });
  });

  it('a régua do Diretor: o painel solto COLA DE VOLTA pelo mesmo gesto, com a linha azul', () => {
    const solto: DragSource = { kind: 'solto', id: 'propriedades', box: { x: 560, y: 198, w: 280, h: 320 } };
    const s = puxar(solto, [640, 303], [170, 106], { x: 80, y: 17 });
    const alvo = dropTarget(s, STRIPS, AREA);
    expect(alvo).toMatchObject({ kind: 'tira', side: 'left', group: 0, visual: 2, line: { x: 157 } });
    expect(endDrag(s, alvo)).toEqual({ kind: 'colar', id: 'propriedades', side: 'left', group: 0, visual: 2 });
  });

  it('o painel solto largado sobre o corpo de um grupo também cola (o corpo não é "próprio" de um solto)', () => {
    const solto: DragSource = { kind: 'solto', id: 'propriedades', box: { x: 560, y: 198, w: 280, h: 320 } };
    const s = puxar(solto, [640, 303], [130, 300], { x: 80, y: 17 });
    expect(dropTarget(s, STRIPS, AREA)).toMatchObject({ kind: 'tira', side: 'left', group: 0, visual: 2, line: null });
  });

  it('grupo recolhido (sem corpo): só a tira recebe', () => {
    const recolhido = STRIPS.map((info) => (info.side === 'left' && info.group === 1 ? { ...info, body: null } : info));
    const s = puxar(ORDEM, [124, 108], [130, 620]);
    expect(dropTarget(s, recolhido, AREA).kind).toBe('solto');
  });

  it('a linha azul numa tira vazia fica no começo dela', () => {
    expect(dropLine([], 0, r(0, 517, 258, 37))).toEqual({ x: 4, top: 521, bottom: 550 });
  });
});

// ---------------------------------------------------------------------------
// Lote 2 — a coluna em ícones
// ---------------------------------------------------------------------------

describe('lote 2: recolher a coluna em ícones (icon-columns)', () => {
  it('de fábrica as duas colunas estão abertas, e nada está aberto ao lado', () => {
    expect(defaultIconState()).toEqual({ left: false, right: false, open: null });
  });

  it('a setinha dupla recolhe e expande aquela coluna; a largura vira a da faixa', () => {
    const recolhida = toggleIconic(defaultIconState(), 'right');
    expect(isIconic(recolhida, 'right')).toBe(true);
    expect(isIconic(recolhida, 'left')).toBe(false);
    expect(columnWidth(recolhida, 'right', 260)).toBe(ICON_STRIP_W);
    expect(columnWidth(recolhida, 'left', 260)).toBe(260);
    expect(toggleIconic(recolhida, 'right')).toEqual(defaultIconState());
  });

  it('clicar no ícone abre ao lado; clicar no mesmo fecha; clicar em outro troca', () => {
    const s = toggleIconic(defaultIconState(), 'right');
    const aberto = clickIcon(s, 'right', 'imagens');
    expect(aberto.open).toEqual({ side: 'right', id: 'imagens' });
    expect(clickIcon(aberto, 'right', 'imagens').open).toBeNull();
    expect(clickIcon(aberto, 'right', 'animacoes').open).toEqual({ side: 'right', id: 'animacoes' });
  });

  it('ícone de coluna aberta não faz nada; Esc fecha o painel do ícone', () => {
    expect(clickIcon(defaultIconState(), 'left', 'arvore')).toEqual(defaultIconState());
    const aberto = clickIcon(toggleIconic(defaultIconState(), 'left'), 'left', 'arvore');
    expect(closeFlyout(aberto).open).toBeNull();
  });

  it('expandir a coluna fecha o painel aberto DAQUELE lado, e só dele', () => {
    let s = setAllIconic(defaultIconState(), true);
    s = clickIcon(s, 'left', 'arvore');
    expect(toggleIconic(s, 'right').open).toEqual({ side: 'left', id: 'arvore' });
    expect(toggleIconic(s, 'left').open).toBeNull();
    expect(setAllIconic(s, false)).toEqual(defaultIconState());
  });

  it('guarda no navegador só os dois interruptores; o que não se lê volta ao de fábrica', () => {
    const s = clickIcon(toggleIconic(defaultIconState(), 'left'), 'left', 'arvore');
    expect(iconStateToSave(s)).toBe('{"left":true,"right":false}');
    expect(parseIconState(iconStateToSave(s))).toEqual({ left: true, right: false, open: null });
    for (const lixo of [null, '', 'x', '[]', '42', '{"left":"sim"}']) {
      expect(parseIconState(lixo)).toEqual(defaultIconState());
    }
  });

  it('os ícones vêm na ordem da coluna, com o grupo; soltos e fechados não entram', () => {
    const coluna = defaultColumnState();
    const fatias = iconSlots({ ...coluna, groups: [['arvore', 'ordem'], ['propriedades']] });
    expect(fatias).toEqual([{ id: 'arvore', group: 0 }, { id: 'ordem', group: 0 }, { id: 'propriedades', group: 1 }]);
  });

  it('todo painel de fábrica das duas colunas tem desenho na faixa (sem desenho de palpite, regra 21)', () => {
    const todos = [...LEFT_GROUPS, ...RIGHT_GROUPS].flat();
    const semDesenho = todos.filter((id) => panelIcon(id) === null);
    expect(semDesenho).toEqual([]);
    expect(Object.keys(PANEL_ICONS).sort()).toEqual([...todos].sort());
  });

  it('painel que ninguém mapeou não ganha desenho: devolve null, e a casca escreve o nome', () => {
    expect(panelIcon('painel-que-nao-existe')).toBeNull();
  });

  it('o painel do ícone abre encostado na faixa, do lado da cena, na altura do ícone', () => {
    expect(flyoutBox('left', 100, 260, 1440, 627)).toEqual({ x: ICON_STRIP_W, y: 100, w: 260, h: FLYOUT_H });
    expect(flyoutBox('right', 100, 260, 1440, 627)).toEqual({ x: 1440 - ICON_STRIP_W - 260, y: 100, w: 260, h: FLYOUT_H });
  });

  it('ícone perto do chão: o painel sobe até caber; tela baixa: ele encolhe', () => {
    expect(flyoutBox('left', 600, 260, 1440, 627).y).toBe(627 - FLYOUT_H);
    const baixa = flyoutBox('right', 300, 260, 1280, 300);
    expect(baixa).toEqual({ x: 1280 - ICON_STRIP_W - 260, y: 0, w: 260, h: 300 });
    expect(floatInside(baixa, 1280, 300)).toBe(true);
  });

  it('o menu Janela: "Recolher em ícone" e "Expandir" ficam cinza dizendo por quê', () => {
    expect(canExpand(defaultIconState())).toEqual({ enabled: false, why: 'As duas colunas já estão abertas' });
    expect(canCollapseToIcons(defaultIconState()).enabled).toBe(true);
    const tudo = setAllIconic(defaultIconState(), true);
    expect(canCollapseToIcons(tudo)).toEqual({ enabled: false, why: 'As duas colunas já estão em ícones' });
    expect(canExpand(tudo).enabled).toBe(true);
  });
});


// ---------------------------------------------------------------------------
// Lote 4 — dois cliques recolhem
// ---------------------------------------------------------------------------

const ESQUERDA = (): ColumnState => ({
  ...defaultColumnState(),
  groups: [['arvore', 'ordem'], ['propriedades']],
  active: ['arvore', 'propriedades'],
  collapsed: [false, false],
});

describe('lote 4: dois cliques recolhem (panel-fold)', () => {
  it('dois cliques na aba recolhem o grupo dela; de novo, abrem (o mesmo que o ▾)', () => {
    const um = tabDoubleClick(ESQUERDA(), 'ordem', 'Ordem');
    expect(um.state.collapsed).toEqual([true, false]);
    // Rodada 50, lote 4: reescrito de propósito — "Painel Ordem", que concorda (doc 98).
    expect(um.notice).toBe('Painel Ordem recolhido. Dois cliques na aba abrem de novo');
    const dois = tabDoubleClick(um.state, 'ordem', 'Ordem');
    expect(dois.state.collapsed).toEqual([false, false]);
    expect(dois.notice).toBe('Painel Ordem aberto');
  });

  it('o último grupo aberto não recolhe, e o rodapé diz o caminho', () => {
    const um = tabDoubleClick(ESQUERDA(), 'arvore', 'Árvore').state;
    const dois = tabDoubleClick(um, 'propriedades', 'Propriedades');
    expect(dois.state).toBe(um);
    expect(dois.notice).toContain('último grupo aberto');
  });

  it('aba que não está em grupo nenhum (solta ou fechada): nada', () => {
    const r = tabDoubleClick(ESQUERDA(), 'imagens', 'Imagens');
    expect(r.state.collapsed).toEqual([false, false]);
    expect(r.notice).toBe('');
  });

  it('dois cliques na barra do solto: encolhe até a barra; de novo, volta ao tamanho guardado', () => {
    const solto = floatPanel(ESQUERDA(), 'propriedades', { x: 400, y: 100, w: 280, h: 320 });
    const recolhido = toggleFloatFold(solto, 'propriedades');
    expect(isFloatFolded(recolhido, 'propriedades')).toBe(true);
    expect(floatBoxOf(recolhido, 'propriedades')).toEqual({ x: 400, y: 100, w: 280, h: 320 });
    expect(drawnFloatBox({ x: 400, y: 100, w: 280, h: 320 }, true)).toEqual({ x: 400, y: 100, w: 280, h: FLOAT_BAR_H });
    const aberto = toggleFloatFold(recolhido, 'propriedades');
    expect(isFloatFolded(aberto, 'propriedades')).toBe(false);
    expect(aberto.floating[0]).not.toHaveProperty('recolhido');
  });

  it('a marca guardada: só true recolhe; e o leitor da coluna a guarda ao reabrir (lote 4 ligado)', () => {
    expect(readFold({ recolhido: true })).toEqual({ recolhido: true });
    for (const lixo of [null, 1, {}, { recolhido: 'sim' }, { recolhido: 1 }]) expect(readFold(lixo)).toEqual({});
    // Reescrito de propósito na ligação do lote 4: antes deste lote o leitor
    // jogava a marca fora (o painel abria aberto, nada se perdia); agora ele a
    // guarda, e só `true` recolhe.
    const lido = parseColumnState({
      groups: [['arvore'], []],
      floating: [
        { id: 'propriedades', group: 1, at: 0, x: 400, y: 100, w: 280, h: 320, recolhido: true },
        { id: 'ordem', group: 0, at: 1, x: 10, y: 10, w: 280, h: 320, recolhido: 'sim' },
      ],
    }, ['arvore', 'ordem', 'propriedades']);
    expect(lido.floating).toEqual([
      { id: 'propriedades', group: 1, at: 0, x: 400, y: 100, w: 280, h: 320, recolhido: true },
      { id: 'ordem', group: 0, at: 1, x: 10, y: 10, w: 280, h: 320 },
    ]);
  });

  it('lote 4 ligado: dois cliques na aba e na barra, e a altura guardada não se perde', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain("tab.addEventListener('dblclick'");
    expect(casca).toContain("barra.addEventListener('dblclick'");
    expect(casca).toContain("const altura = guardado?.recolhido === true ? guardado.h : caixa.offsetHeight;");
  });

  it('o primeiro clique do par que reabre o grupo recolhido não deixa o dblclick fechar de novo', () => {
    // Visto no uso, na ligação: o segundo par de dois cliques não reabria a
    // Árvore — o clique reabria e o dblclick fechava.
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('this.reabertoPorClique = id;');
    expect(casca).toMatch(/private tabDoubleClicked\(side: Side, id: string\): void \{\n    if \(this\.reabertoPorClique === id\) \{/);
  });
});

// ---------------------------------------------------------------------------
// Lote 5 — soltar o grupo inteiro
// ---------------------------------------------------------------------------

const DIREITA = (): ColumnState => ({
  ...defaultColumnState(),
  groups: [['imagens', 'entidades', 'pivos'], ['animacoes', 'peles']],
  active: ['entidades', 'animacoes'],
  collapsed: [false, false],
  focus: 0,
});

describe('lote 5: soltar o grupo inteiro (float-groups)', () => {
  const CAIXA = { x: 500, y: 100, w: 280, h: 320 };

  it('puxar o vão da tira solta o grupo inteiro; a aba da frente continua à frente', () => {
    const s = floatGroup(DIREITA(), 0, CAIXA);
    expect(s.groups).toEqual([[], ['animacoes', 'peles']]);
    expect(s.active).toEqual([null, 'animacoes']);
    expect(s.focus).toBe(1);
    expect(s.floating).toEqual([{ id: 'entidades', tabs: ['imagens', 'entidades', 'pivos'], group: 0, at: 0, ...CAIXA }]);
    expect(floatHolding(s, 'pivos')?.id).toBe('entidades');
  });

  it('o arrasto do vão: largar na cena solta o grupo; na tira do outro grupo, cola as abas lá', () => {
    const grupo: DragSource = { kind: 'grupo', id: 'imagens', side: 'right', group: 0, tabs: ['imagens', 'entidades'] };
    const naCena = puxar(grupo, [1400, 110], [700, 300]);
    expect(endDrag(naCena, dropTarget(naCena, STRIPS, AREA))).toMatchObject({ kind: 'soltarGrupo', from: { side: 'right', group: 0 } });
    const naTira = puxar(grupo, [1400, 110], [60, 536]);
    expect(endDrag(naTira, dropTarget(naTira, STRIPS, AREA))).toEqual({
      kind: 'colarGrupo', from: { side: 'right', group: 0 }, side: 'left', group: 1, visual: 0,
    });
  });

  it('o grupo largado na PRÓPRIA tira ou no próprio corpo: nada', () => {
    const grupo: DragSource = { kind: 'grupo', id: 'arvore', side: 'left', group: 0, tabs: ['arvore', 'ordem'] };
    expect(dropTarget(puxar(grupo, [200, 106], [230, 110]), STRIPS, AREA)).toEqual({ kind: 'nada' });
    expect(dropTarget(puxar(grupo, [200, 106], [130, 300]), STRIPS, AREA)).toEqual({ kind: 'nada' });
  });

  it('trocar a aba da frente dentro do grupo solto', () => {
    const s = selectFloatTab(floatGroup(DIREITA(), 0, CAIXA), 'pivos');
    expect(s.floating).toEqual([{ id: 'pivos', tabs: ['imagens', 'entidades', 'pivos'], group: 0, at: 0, ...CAIXA }]);
  });

  it('colar de volta sem destino: todas as abas voltam, na ordem, para o grupo de onde saíram', () => {
    const volta = dockFloatGroup(floatGroup(DIREITA(), 0, CAIXA), 'imagens');
    expect(volta.groups).toEqual([['imagens', 'entidades', 'pivos'], ['animacoes', 'peles']]);
    expect(volta.active[0]).toBe('entidades');
    expect(volta.floating).toEqual([]);
  });

  it('colar no outro grupo, na posição da linha azul', () => {
    const s = dockFloatGroup(floatGroup(DIREITA(), 0, CAIXA), 'pivos', 1, 1);
    expect(s.groups).toEqual([[], ['animacoes', 'imagens', 'entidades', 'pivos', 'peles']]);
    expect(s.active[1]).toBe('entidades');
  });

  it('"Voltar ao padrão" com um grupo solto: o dockAllFloating devolve TODAS as abas (lote 5 ligado)', () => {
    // Reescrito de propósito na ligação do lote 5. Antes da ligação este teste
    // provava o defeito: o `dockAllFloating` devolvia só o `id` de cada solto, e
    // 'imagens' sumia. Agora o `dockPanel` devolve o grupo inteiro.
    const s = floatGroup(DIREITA(), 0, CAIXA);
    const todas = ['animacoes', 'entidades', 'imagens', 'peles', 'pivos'];
    expect(dockAllFloating(s).groups.flat().sort()).toEqual(todas);
    expect(dockAllFloatGroups(s).groups.flat().sort()).toEqual(todas);
  });

  it('um arranjo ANTIGO (solto sem `tabs`) é o solto de uma aba, como hoje', () => {
    const antigo = floatPanel(DIREITA(), 'pivos', CAIXA);
    expect(tabsOf(antigo.floating[0]!)).toEqual(['pivos']);
    expect(dockFloatGroup(antigo, 'pivos').groups[0]).toEqual(['imagens', 'entidades', 'pivos']);
  });

  it('o programa de ANTES deste lote abrindo um arranjo novo: os companheiros voltam para a coluna, nada se perde', () => {
    // Reescrito de propósito na ligação do lote 5: o leitor de hoje passou a
    // conhecer `tabs`. O "de antes" é simulado tirando o campo do gravado —
    // é exatamente o que ele fazia: não o lia.
    const known = [...LEFT_GROUPS, ...RIGHT_GROUPS].flat();
    const novo = defaultLayout(known);
    const gravado = JSON.parse(JSON.stringify({ ...novo, right: floatGroup(novo.right, 0, CAIXA) })) as {
      right: { floating: Array<Record<string, unknown>> };
    };
    for (const item of gravado.right.floating) delete item['tabs'];
    const lido = parseLayout(gravado, known);
    const lugares = [lido.left, lido.right].flatMap((c) => [...c.groups.flat(), ...c.closed.map((i) => i.id), ...c.floating.map((i) => i.id)]);
    expect(lugares.sort()).toEqual([...known].sort());
    expect(lido.right.floating.map((i) => i.id)).toEqual(['imagens']);
  });

  it('o leitor de HOJE guarda o grupo solto: cada painel num lugar só, as abas dentro do solto', () => {
    const known = [...LEFT_GROUPS, ...RIGHT_GROUPS].flat();
    const novo = defaultLayout(known);
    const gravado = JSON.parse(JSON.stringify({ ...novo, right: floatGroup(novo.right, 0, CAIXA) })) as unknown;
    const lido = parseLayout(gravado, known);
    const lugares = [lido.left, lido.right].flatMap((c) => [...c.groups.flat(), ...c.closed.map((i) => i.id), ...c.floating.flatMap((i) => tabsOf(i))]);
    expect(lugares.sort()).toEqual([...known].sort());
    expect(tabsOf(lido.right.floating[0]!)).toEqual(['imagens', 'entidades', 'pivos', 'malha', 'particulas', 'exibicao', 'previa']);
  });

  it('lote 5 ligado: o vão da tira começa o arrasto do grupo, e a casca solta e cola o grupo', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain("kind: 'grupo', id: state.active[index] ?? ids[0]!, side, group: index, tabs: [...ids],");
    expect(casca).toContain('const depois = floatGroup(antes, result.from.group, result.box);');
    expect(casca).toContain('this.colarGrupo(result.from.side, result.from.group, result.side, result.group, result.visual);');
    expect(casca).toContain("class: frente ? 'panel-float-aba is-active' : 'panel-float-aba'");
  });

  it('o grupo puxado tem a sombra do painel, como a aba (visto no uso: só aparecia colando numa borda)', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain("this.drawDrop(a.target, src.kind !== 'solto');");
    // Rodada 50, lote 4: reescrito de propósito — a aba solta diz "o painel Ordem" (concordância, doc 98).
    expect(casca).toContain("src.kind === 'grupo' ? `o grupo ${src.tabs.map(titulo).join(', ')}` : `o painel ${titulo(src.id)}`");
  });

  it('o `tabs` gravado é lido contra os painéis de hoje: some o desconhecido e o repetido; a da frente fica', () => {
    const seen = new Set(['arvore']);
    const lido = readFloatTabs({ tabs: ['imagens', 'nao-existe', 'arvore', 'pivos', 'pivos'] }, 'imagens', ['imagens', 'pivos', 'arvore'], seen);
    expect(lido).toEqual({ tabs: ['imagens', 'pivos'] });
    expect(seen.has('pivos')).toBe(true);
    expect(readFloatTabs({ tabs: ['nao-existe'] }, 'imagens', ['imagens'], new Set())).toEqual({});
    expect(readFloatTabs({}, 'imagens', ['imagens'], new Set())).toEqual({});
    expect(readFloatTabs({ tabs: ['pivos'] }, 'imagens', ['imagens', 'pivos'], new Set())).toEqual({ tabs: ['imagens', 'pivos'] });
  });
});

// ---------------------------------------------------------------------------
// Lote 6 — Tab e Shift+Tab
// ---------------------------------------------------------------------------

describe('lote 6: Tab e Shift+Tab (hide-panels)', () => {
  it('Tab esconde tudo, como hoje; Shift+Tab esconde só as colunas, e a linha do tempo fica', () => {
    expect(pressTab('nada')).toBe('tudo');
    expect(pressShiftTab('nada')).toBe('colunas');
    expect([columnsShown('tudo'), dockShown('tudo')]).toEqual([false, false]);
    expect([columnsShown('colunas'), dockShown('colunas')]).toEqual([false, true]);
    expect([columnsShown('nada'), dockShown('nada')]).toEqual([true, true]);
  });

  it('qualquer uma das duas, com algo escondido, mostra tudo de volta', () => {
    for (const modo of ['tudo', 'colunas'] as const) {
      expect(pressTab(modo)).toBe('nada');
      expect(pressShiftTab(modo)).toBe('nada');
    }
  });

  it('só o Tab se grava (é o `hidden` de hoje); o Shift+Tab não volta na próxima abertura', () => {
    expect(hiddenToSave('tudo')).toBe(true);
    expect(hiddenToSave('colunas')).toBe(false);
    expect(modeFromHidden(true)).toBe('tudo');
    expect(modeFromHidden(false)).toBe('nada');
  });

  it('o rodapé diz o que sumiu e como voltar', () => {
    expect(hideNotice('colunas')).toBe('Painéis escondidos; a linha do tempo fica. Shift+Tab mostra de novo');
    expect(hideNotice('tudo')).toContain('Tab mostra de novo');
  });
});

// ---------------------------------------------------------------------------
// A setinha «» — onde ela mora
// ---------------------------------------------------------------------------

describe('a setinha «»: na tira ou no topo da coluna (icon-columns)', () => {
  // As tiras de cima medidas na conferência, em 1440×900.
  const ESQ = { tabs: [r(4, 92, 85, 31), r(91, 92, 65, 31)], strip: { left: 0, right: 258 } };
  const DIR = {
    tabs: [r(1186, 92, 97, 31), r(1285, 92, 87, 31), r(1374, 92, 57, 31), r(1186, 125, 87, 31), r(1275, 125, 78, 31), r(1355, 125, 62, 31)],
    strip: { left: 1182, right: 1440 },
  };

  it('na esquerda cabe; na direita, com seis abas em três linhas, não cabe', () => {
    expect(toggleFitsStrip(ESQ.tabs, ESQ.strip, TOGGLE_W)).toBe(true);
    expect(toggleFitsStrip(DIR.tabs, DIR.strip, TOGGLE_W)).toBe(false);
  });

  it('a casa é a mesma nas duas colunas: se uma não cabe, as duas vão para o topo (como o Photoshop)', () => {
    expect(toggleSpot(true, false)).toBe('topo');
    expect(toggleSpot(false, true)).toBe('topo');
    expect(toggleSpot(true, true)).toBe('tira');
  });

  it('tira vazia: cabe se a tira tem largura para os dois botões', () => {
    expect(toggleFitsStrip([], { left: 0, right: 258 }, TOGGLE_W)).toBe(true);
    expect(toggleFitsStrip([], { left: 0, right: 50 }, TOGGLE_W)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Lote 8 — os contextos
// ---------------------------------------------------------------------------

describe('lote 8: os contextos, a área de trabalho do Photoshop (contexts)', () => {
  const KNOWN = [...LEFT_GROUPS, ...RIGHT_GROUPS].flat();

  /** Onde está cada painel numa tela: todo painel conhecido em UM lugar só. */
  const lugares = (tela: LayoutState): string[] => [tela.left, tela.right]
    .flatMap((c) => [...c.groups.flat(), ...c.closed.map((i) => i.id), ...c.floating.map((i) => i.id)]);

  it('Montar · Animar · Pesos: cada painel conhecido num lugar só, aberto ou fechado (nada some)', () => {
    for (const ctx of CONTEXTS) {
      const tela = contextLayout(ctx.id, KNOWN);
      expect(tela, ctx.name).not.toBeNull();
      expect(lugares(tela!).sort(), ctx.name).toEqual([...KNOWN].sort());
    }
  });

  it('o que o contexto não cita fica fechado NO LADO DE FÁBRICA dele: o menu Janela o reabre em casa', () => {
    const animar = contextLayout('contexto-animar', KNOWN)!;
    expect(animar.left.closed.map((i) => i.id)).toEqual(['ordem']);
    expect(animar.right.closed.map((i) => i.id).sort()).toEqual(['malha', 'particulas', 'peles', 'pivos', 'previa', 'regras']);
    expect(animar.left.closed[0]).toMatchObject({ id: 'ordem', group: 0 });
  });

  it('Animar abre a linha do tempo; Montar e Pesos não', () => {
    expect(contextDock('contexto-animar')).toBe(true);
    expect(contextDock('contexto-montar')).toBe(false);
    expect(contextDock('contexto-pesos')).toBe(false);
  });

  it('Pesos: a Malha e pesos à frente, com 75% da altura da direita, à mão', () => {
    const pesos = contextLayout('contexto-pesos', KNOWN)!;
    expect(pesos.right.active[0]).toBe('malha');
    expect(pesos.right.split).toBe(0.75);
    expect(pesos.right.autoSplit).toBe(false);
  });

  it('Pivô e Visualização continuam, iguais, e entram no mesmo botão', () => {
    expect(contextDock('arranjo-pivo')).toBe(false);
    expect(switchTo('arranjo-pivo', KNOWN, {})).toEqual(layoutOf('arranjo-pivo', KNOWN, {}));
    const nomes = switcherItems({}, 'contexto-montar').map((i) => (i.kind === 'separador' ? '—' : i.name));
    expect(nomes).toEqual(['Montar', 'Animar', 'Pesos', '—', 'Pivô', 'Visualização', '—', 'Guardar este arranjo…', 'Voltar ao padrão do contexto']);
  });

  it('o botão mostra o nome do contexto em uso, e marca ele na lista', () => {
    expect(switcherLabel({}, 'contexto-animar')).toBe('Animar');
    expect(switcherItems({}, 'contexto-animar').filter((i) => i.kind === 'contexto' && i.current).map((i) => (i as { name: string }).name)).toEqual(['Animar']);
  });

  it('id que sumiu (um guardado apagado): nada de tela inventada, e o botão volta ao de fábrica', () => {
    expect(switchTo('arranjo-que-sumiu', KNOWN, {})).toBeNull();
    // Reescrito de propósito na ligação (lote 8): o de fábrica deixou de ser
    // "Montar" — a tela de fábrica não é a do Montar, e o botão mentiria.
    expect(switcherLabel({}, 'arranjo-que-sumiu')).toBe('Padrão');
    expect(switcherLabel({}, DEFAULT_CONTEXT)).toBe('Padrão');
    expect(parseContext('arranjo-que-sumiu', {})).toBe(DEFAULT_CONTEXT);
    expect(parseContext(null, {})).toBe(DEFAULT_CONTEXT);
    expect(parseContext('contexto-pesos', {})).toBe('contexto-pesos');
  });
});

// ---------------------------------------------------------------------------
// Lote 9 — o Propriedades nunca menor que a ficha rápida
// ---------------------------------------------------------------------------

describe('lote 9: o Propriedades tem chão (props-floor)', () => {
  // A coluna com os Detalhes abertos, e a divisão de hoje, medidas nas fotos
  // T1_antes_detalhes_* da rodada 23.
  const TELAS = {
    '1920x1080': { room: 548, wanted: [366, 174] as const },
    '1440x900': { room: 440, wanted: [290, 142] as const },
    '1280x720': { room: 342, wanted: [228, 106] as const },
  };
  const NEED = propsNeed();

  it('o defeito existia: a divisão de hoje deixa o Propriedades abaixo da ficha nas três telas', () => {
    for (const [nome, tela] of Object.entries(TELAS)) {
      expect(tela.wanted[1] - TAB_STRIP_H, nome).toBeLessThan(QUICK_SHEET_BONE);
    }
  });

  it('o chão: a tira mais a ficha (osso 190, imagem 228); sem medida, a maior', () => {
    expect(NEED).toBe(TAB_STRIP_H + QUICK_SHEET_IMAGE);
    expect(propsNeed(QUICK_SHEET_BONE)).toBe(227);
  });

  it('1920×1080 e 1440×900: a ficha inteira, e a Árvore fica com o resto', () => {
    const grande = planColumn({ ...TELAS['1920x1080'], grip: SPLIT_GRIP_H, propsGroup: 1, need: NEED });
    expect(grande).toEqual({ heights: [275, 265], yielded: 91, cut: 0 });
    const media = planColumn({ ...TELAS['1440x900'], grip: SPLIT_GRIP_H, propsGroup: 1, need: NEED });
    expect(media).toEqual({ heights: [167, 265], yielded: 123, cut: 0 });
    expect(cutNotice(media)).toBe('');
  });

  it('1280×720: não cabe tudo. A Árvore cede até o mínimo (80); a ficha de imagem perde 11 px e rola; a de osso cabe', () => {
    const pequena = planColumn({ ...TELAS['1280x720'], grip: SPLIT_GRIP_H, propsGroup: 1, need: NEED });
    expect(pequena).toEqual({ heights: [GROUP_MIN_PX, 254], yielded: 148, cut: 11 });
    expect(cutNotice(pequena)).toContain('faltam 11 px');
    const osso = planColumn({ ...TELAS['1280x720'], grip: SPLIT_GRIP_H, propsGroup: 1, need: propsNeed(QUICK_SHEET_BONE) });
    expect(osso.cut).toBe(0);
    expect(osso.heights[1] - TAB_STRIP_H).toBeGreaterThanOrEqual(QUICK_SHEET_BONE);
  });

  it('a altura da coluna não muda: a cena e a linha do tempo não cedem nada', () => {
    for (const tela of Object.values(TELAS)) {
      const plano = planColumn({ ...tela, grip: SPLIT_GRIP_H, propsGroup: 1, need: NEED });
      expect(plano.heights[0] + plano.heights[1]).toBe(tela.room - SPLIT_GRIP_H);
    }
  });

  it('nunca encolhe o Propriedades: se a divisão de hoje já dá mais, fica', () => {
    const plano = planColumn({ room: 627, grip: 8, wanted: [200, 419], propsGroup: 1, need: NEED });
    expect(plano).toEqual({ heights: [200, 419], yielded: 0, cut: 0 });
  });

  it('o Propriedades no grupo de CIMA também tem chão', () => {
    const plano = planColumn({ room: 440, grip: 8, wanted: [100, 332], propsGroup: 0, need: NEED });
    expect(plano.heights).toEqual([265, 167]);
  });

  it('Propriedades atrás de outra aba, solto, fechado ou com o grupo recolhido pela mão: nada muda', () => {
    const plano = planColumn({ ...TELAS['1440x900'], grip: SPLIT_GRIP_H, propsGroup: null, need: NEED });
    expect(plano).toEqual({ heights: [290, 142], yielded: 0, cut: 0 });
  });

  it('a fração que a casca escreve sai do plano', () => {
    expect(planShare({ heights: [167, 265], yielded: 0, cut: 0 })).toBeCloseTo(167 / 432);
    expect(planShare({ heights: [0, 0], yielded: 0, cut: 0 })).toBe(0.5);
  });
});

describe('rodada 17, K13 + K1b: a lista de Animações tem chão com os Detalhes abertos', () => {
  // A coluna da direita em 1920×1080, medida no editor do disco (v28.8,
  // 05/10/2026 21h38): fechada 772, aberta 548; o grupo de baixo (Animações)
  // ficava com 168 — a tira de duas linhas (70) e 98 de corpo.
  const ABERTA = { room: 548, wanted: [357, 168] as const };
  const TIRA_DUAS_LINHAS = 70;
  const linhasQueCabem = (corpo: number) => Math.max(0, Math.floor((corpo - ANIM_LIST_HEAD) / ANIM_LIST_ROW));

  it('o defeito existia: a divisão de hoje deixa a lista com UMA linha', () => {
    const hoje = planColumn({ ...ABERTA, grip: SPLIT_GRIP_H, propsGroup: null, need: 0 });
    expect(linhasQueCabem(hoje.heights[1] - TIRA_DUAS_LINHAS)).toBe(1);
  });

  it('o chão: a tira, a cabeça (61) e três linhas (34); com menos animações, menos chão', () => {
    expect(animListNeed(3, TIRA_DUAS_LINHAS)).toBe(70 + 61 + 3 * 34);
    expect(animListNeed(9, TIRA_DUAS_LINHAS)).toBe(animListNeed(3, TIRA_DUAS_LINHAS));
    expect(animListNeed(1, TAB_STRIP_H)).toBe(TAB_STRIP_H + 61 + 34);
  });

  it('com o chão, as três linhas aparecem, e quem cede é o grupo de cima (Imagens)', () => {
    const plano = planColumn({ ...ABERTA, grip: SPLIT_GRIP_H, propsGroup: 1, need: animListNeed(3, TIRA_DUAS_LINHAS) });
    expect(linhasQueCabem(plano.heights[1] - TIRA_DUAS_LINHAS)).toBe(3);
    expect(plano.heights[0] + plano.heights[1]).toBe(ABERTA.room - SPLIT_GRIP_H);
    expect(plano.cut).toBe(0);
  });

  it('quem tem chão: as Animações à frente; o Propriedades vence; grupo recolhido não conta', () => {
    const aberto = () => false;
    expect(floorGroup(['imagens', 'animacoes'], aberto)).toEqual({ group: 1, panel: 'animacoes' });
    expect(floorGroup(['animacoes', 'propriedades'], aberto)).toEqual({ group: 1, panel: 'propriedades' });
    expect(floorGroup(['imagens', 'skins'], aberto)).toBeNull();
    expect(floorGroup(['imagens', 'animacoes'], (i) => i === 1)).toBeNull();
  });

  it('só com os Detalhes abertos: fechados, a divisão é a de sempre (o Propriedades segue tendo chão)', () => {
    const aberto = () => false;
    expect(floorGroup(['imagens', 'animacoes'], aberto, false)).toBeNull();
    expect(floorGroup(['arvore', 'propriedades'], aberto, false)).toEqual({ group: 1, panel: 'propriedades' });
  });

  it('o teto: nunca mais que metade da coluna (1280×720 aberta: 342 − 8 → 167)', () => {
    expect(animFloorCap(233, 548, SPLIT_GRIP_H)).toBe(233);
    expect(animFloorCap(233, 342, SPLIT_GRIP_H)).toBe(167);
    expect(animFloorCap(233, 0, SPLIT_GRIP_H)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Lote 2 ligado — a casca usa o modelo
// ---------------------------------------------------------------------------

describe('lote 2 ligado: a setinha, a faixa e o painel ao lado na casca', () => {
  const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
  const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');

  it('a setinha mora no topo da coluna, com o nome na dica (regra 12)', () => {
    expect(casca).toContain("class: 'panel-column-setinha'");
    expect(casca).toContain("'Recolher em ícones'");
    expect(casca).toContain("'Expandir os painéis'");
    expect(css).toMatch(/\.panel-column-topo\s*\{[^}]*flex:\s*0 0 14px/);
  });

  it('em ícones a coluna tem 40 px, os grupos somem, e a alça de largura some junto', () => {
    expect(casca).toContain("columnWidth(this.icones, 'left', this.layout.widths[0])");
    expect(css).toMatch(/\.panel-column\.is-icones \.panel-group,\s*\n\.panel-column\.is-icones \.panel-split-grip\s*\{[^}]*display:\s*none/);
    // Desde o lote 6 a conta do escondido sai do `hideMode` (`semColunas`).
    expect(casca).toContain('semColunas || isIconic(this.icones, lado)');
  });

  it('o ícone abre o painel ao lado (buildFlyout), e o Esc o fecha', () => {
    expect(casca).toContain('this.buildFlyout();');
    expect(casca).toContain("class: 'panel-float panel-voo'");
  });

  it('a arrumação mora no navegador, e "Voltar ao padrão" expande', () => {
    expect(casca).toContain('ICONS_STORAGE_KEY, iconStateToSave(this.icones)');
    expect(casca).toMatch(/resetLayout\(\): void \{[\s\S]*?this\.icones = defaultIconState\(\);/);
  });
});

// ---------------------------------------------------------------------------
// Lote 3 ligado — o solto não sai da tela
// ---------------------------------------------------------------------------

describe('lote 3 ligado: o solto não sai da tela, nem pelo canto, nem com a janela encolhendo', () => {
  it('o canto: a caixa cresce até a borda e para, sem o painel pular de lugar', () => {
    expect(resizeInside({ x: 1000, y: 300, w: 900, h: 900 }, 1440, 627)).toEqual({ x: 1000, y: 300, w: 440, h: 327 });
    expect(floatInside(resizeInside({ x: 1000, y: 300, w: 900, h: 900 }, 1440, 627), 1440, 627)).toBe(true);
  });

  it('o canto que já cabe não muda nada', () => {
    expect(resizeInside({ x: 400, y: 100, w: 300, h: 300 }, 1440, 627)).toEqual({ x: 400, y: 100, w: 300, h: 300 });
  });

  it('o defeito existia: com o clampFloat, o canto puxado para baixo pendurava a caixa sobre a linha do tempo', () => {
    const velho = clampFloat({ x: 400, y: 300, w: 300, h: 480 }, 1440, 627);
    expect(velho.y + velho.h).toBeGreaterThan(627);
  });

  it('a casca não usa mais o clampFloat: o guardado, o canto e a janela que encolhe passam pelo fitFloat', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).not.toMatch(/\bclampFloat\(/);
    expect(casca).toContain('const solta = fitFloat(item,');
    expect(casca).toContain('resizeInside({');
    expect(casca).toContain('const guardada = { x: item.x, y: item.y, w: item.w, h: item.h };');
  });
});

// ---------------------------------------------------------------------------
// Lote 9 ligado — o chão do Propriedades na casca
// ---------------------------------------------------------------------------

describe('lote 9 ligado: o chão do Propriedades vira min-height, e é refeito quando a coluna muda de altura', () => {
  const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');

  it('o applySplit termina chamando o chão, e a coluna que muda de altura também', () => {
    expect(casca).toMatch(/private applySplit\(\): void \{[\s\S]*?this\.applyPropsFloor\(\);\n  \}/);
    expect(casca).toContain('new ResizeObserver(() => this.applyPropsFloor())');
  });

  it('a decisão é do planColumn, com o mínimo do modelo (80) para o outro grupo', () => {
    expect(casca).toContain('const plano = planColumn({');
    // Rodada 17, K13: para o Propriedades o mínimo do outro continua 80; para
    // as Animações, a tira de abas do outro inteira (nunca menos que 80).
    expect(casca).toContain("const minimoDoOutro = dono.panel === 'propriedades' ? GROUP_MIN_PX : Math.max(GROUP_MIN_PX, tiraDoOutro);");
    expect(casca).toContain('otherMin: minimoDoOutro,');
    expect(casca).toContain('outro.style.minHeight = `${minimoDoOutro}px`;');
    expect(casca).toContain("caixas[g]!.style.minHeight = `${plano.heights[g]}px`");
  });

  it('o chão de fábrica vale sempre (o painel não pula quando a seleção muda)', () => {
    expect(casca).toContain('return { chao: Math.max(fabrica, medida), medida };');
  });

  it('o aviso de "faltam" fala da ficha medida, e não da de fábrica (regra 21)', () => {
    expect(casca).toContain('const corte = precisa.medida === null ? 0 : Math.max(0, precisa.medida - plano.heights[g]);');
  });
});

// ---------------------------------------------------------------------------
// Lote 6 ligado — Shift+Tab
// ---------------------------------------------------------------------------

describe('lote 6 ligado: Shift+Tab no menu Janela, e a casca usa o modelo', () => {
  const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
  const menus = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');

  it('o item tem a tecla escrita ao lado (é ela que funciona: o mapa sai dos menus)', () => {
    expect(menus).toContain("shortcut: 'Shift+Tab',");
    expect(menus).toContain("action: 'esconder-colunas',");
  });

  it('a casca decide pelo hide-panels: Tab e Shift+Tab, e os soltos somem junto', () => {
    expect(casca).toContain('this.setHideMode(pressTab(this.hideMode));');
    expect(casca).toContain('this.setHideMode(pressShiftTab(this.hideMode));');
    expect(casca).toContain('this.floatLayer.hidden = semColunas;');
    expect(casca).toContain("this.dock.hidden = !dockShown(modo) || this.dockEntries.size === 0;");
  });
});

// ---------------------------------------------------------------------------
// Lote 8 ligado — o botão dos contextos
// ---------------------------------------------------------------------------

describe('lote 8 ligado: o botão no canto de cima, e Montar · Animar · Pesos em Janela → Arranjos', () => {
  const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
  const menus = readFileSync(resolve(__dirname, '../src/ui/menus.ts'), 'utf8');

  it('o botão nasce em ícone, com o nome na dica, e abre a lista do seletor', () => {
    expect(casca).toContain("this.contextoBotao = el('button', { class: 'contexto-botao', type: 'button' })");
    expect(casca).toContain('const dica = `Área de trabalho: ${nome}. Clique para trocar');
    expect(casca).toContain("openFloatingMenu(r.left, r.bottom + 4, itens, 'contexto-menu');");
  });

  it('os contextos entram no topo de Janela → Arranjos', () => {
    expect(menus).toContain('...CONTEXTS.map((contexto): MenuItem => ({');
  });

  it('"Voltar ao padrão" põe o botão em "Padrão"; escolher um arranjo põe o nome dele', () => {
    expect(casca).toMatch(/resetLayout\(\): void \{[\s\S]*?this\.setContext\(DEFAULT_CONTEXT\);/);
    expect(casca).toMatch(/applyArrangement\(id: string\): void \{[\s\S]*?this\.setContext\(id\);/);
  });
});

describe('lote 8: em 1280 o botão não quebra os menus; quem cede é o nome do arquivo', () => {
  const css = readFileSync(resolve(__dirname, '../src/ui/shell.css'), 'utf8');
  const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
  it('os menus não quebram linha; o nome do arquivo encolhe com reticências, e a dica guarda o inteiro', () => {
    expect(css).toMatch(/\.menu-bar > \*\s*\{[^}]*white-space:\s*nowrap/);
    expect(css).toMatch(/\.doc-name\s*\{[^}]*text-overflow:\s*ellipsis/);
    expect(casca).toContain('this.docName.title = this.doc.dirty');
  });
});

// ---------------------------------------------------------------------------
// Os consertos da conferência (rodada 24) — 05/10/2026
// ---------------------------------------------------------------------------

describe('consertos da rodada 24: o lado em uso, o canto, o Sobre, as palavras', () => {
  const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');

  it('1. Soltar o painel da parede começa pelo LADO EM USO, e não sempre pela direita', () => {
    // O defeito: `for (const side of ['right', 'left'] as const)` no soltar.
    expect(casca).toMatch(/soltarPainelEmUso\(\): void \{\n    for \(const side of ladosPorUso\(this\.ladoEmUso\)\)/);
  });

  it('1. Fechar o grupo tem a mesma forma, e o mesmo conserto', () => {
    expect(casca).toMatch(/closeFocusedGroup\(\): void \{\n    for \(const side of ladosPorUso\(this\.ladoEmUso\)\)/);
  });

  it('2. o canto: durante o arrasto a JANELA escuta o ponteiro, e larga no pointerup, no pointercancel e no blur', () => {
    const corpo = casca.slice(casca.indexOf('private resizeFloat('), casca.indexOf('private guardarFloat('));
    expect(corpo).toContain("window.addEventListener('pointermove', mover);");
    expect(corpo).toContain("window.addEventListener('pointerup', largar);");
    expect(corpo).toContain("window.addEventListener('pointercancel', largar);");
    expect(corpo).toContain("window.addEventListener('blur', largar);");
    expect(corpo).not.toContain('canto.setPointerCapture');
  });

  it('3. o Sobre lê o número da versão que vai fechar, quando o montar o passa', () => {
    const vite = readFileSync(resolve(__dirname, '../vite.config.ts'), 'utf8');
    expect(vite).toContain("process.env['RECORTE_VERSAO']");
  });

  it('5. a última "esqueleto" da tela (abrir um .bone sem atlas) e a irmã dela no pacote', () => {
    const abrir = readFileSync(resolve(__dirname, '../src/io/open-save.ts'), 'utf8');
    const pacote = readFileSync(resolve(__dirname, '../src/io/save-binary.ts'), 'utf8');
    expect(abrir).not.toContain('Este esqueleto usa');
    expect(pacote).not.toContain('Este esqueleto usa');
  });
});

describe('consertos da rodada 24, por dentro: a ordem dos lados e o número do montar', () => {
  it('1. o lado em uso vem primeiro; sem nenhum, a ordem de antes (direita primeiro)', () => {
    expect(ladosPorUso('left')).toEqual(['left', 'right']);
    expect(ladosPorUso('right')).toEqual(['right', 'left']);
    expect(ladosPorUso(null)).toEqual(['right', 'left']);
  });

  const montar = (args: string[], guardadas: Array<[number, number]>): string => {
    const codigo = [
      'import importlib.util, json, sys',
      "s = importlib.util.spec_from_file_location('m', 'ferramentas/montar-programa.py')",
      'm = importlib.util.module_from_spec(s); s.loader.exec_module(m)',
      `print(json.dumps(m.versao_pedida(${JSON.stringify(args)}, [tuple(x) for x in ${JSON.stringify(guardadas)}])))`,
    ].join('; ');
    const r = spawnSync('python', ['-c', codigo], { cwd: resolve(__dirname, '../..'), encoding: 'utf8' });
    return r.stdout.trim();
  };

  it('3. o montar sem número faz como antes; com número novo, passa o número', () => {
    expect(montar([], [[27, 4]])).toBe('[null, null]');
    expect(montar(['27.5'], [[27, 4]])).toBe('["27.5", null]');
    expect(montar(['v27.5'], [[27, 4]])).toBe('["27.5", null]');
  });

  it('3. o montar RECUSA número que já está guardado, e número torto', () => {
    expect(montar(['27.4'], [[27, 4]])).toContain('ja esta guardada');
    expect(montar(['27'], [[27, 4]])).toContain('tem de ser como 27.5');
  });
});

describe('rodada 17, K1b (a segunda volta): a Imagens tem chão, e quem cede são os Detalhes abertos', () => {
  it('1920×1080: os Detalhes descem de 380 para 337, e a coluna fica com os 591 que pede', () => {
    // Medido na v29.8, 06/10: corpo 982, barra 44, alça 10; a coluna pede 15 + 335 + 8 + 233 = 591.
    expect(dockRoomForColumn(380, 982, 44, 10, 591, 240)).toBe(337);
  });

  it('1440×900: os Detalhes param no chão deles (240); em 1280×720, já abaixo dele, nada muda', () => {
    expect(dockRoomForColumn(307, 802, 44, 10, 591, 240)).toBe(240);
    expect(dockRoomForColumn(226, 622, 44, 10, 591, 240)).toBe(226);
  });

  it('nunca cresce além do que a pessoa pediu', () => {
    expect(dockRoomForColumn(200, 1400, 44, 10, 591, 240)).toBe(200);
  });

  it('a casca liga: só com os Detalhes abertos, e só com a Imagens à frente no grupo de cima', () => {
    const casca = readFileSync(resolve(__dirname, '../src/ui/shell.ts'), 'utf8');
    expect(casca).toContain('altura = Math.min(altura, dockRoomForColumn(altura, room, barra, alca, coluna, OPEN_MIN));');
    expect(casca).toContain("if (state.active[0] !== 'imagens' || isCollapsed(state, 0)) return null;");
    // 05/11/2026: as colunas descem até o rodapé e a faixa mora só debaixo da
    // cena: os Detalhes abertos não tiram mais altura da coluna, e este chão
    // fica DESLIGADO de propósito (não apagado). A prova disso é a medição:
    // `npm run medir -- --detalhes`, de 79 para 92 de 92.
    expect(casca).toContain('if (this.dockView.open && !COLUNAS_ATE_O_RODAPE) {');
    expect(casca).toContain('const COLUNAS_ATE_O_RODAPE = true;');
  });
});

/**
 * Rodada 50, lote 1 — o que a janela de verdade achou (doc `98`, item C).
 *
 * A Ordem levada para o grupo das Imagens e solta da parede virava uma janela
 * VAZIA, e uma aba "Ordem" órfã aparecia no grupo das Propriedades. A forma do
 * erro: a casca relê a arrumação guardada a cada `buildPanels`, e a releitura
 * só contava as abas dos GRUPOS de cada lado. Um painel solto (ou fechado) do
 * lado que não é a casa de fábrica dele era dado como perdido, e a regra
 * "painel conhecido que ficou de fora volta para um grupo" o punha também na
 * outra coluna. Dois donos: a aba órfã escondia o corpo da janela solta.
 */
describe('rodada 50: o painel solto ou fechado do outro lado tem um lugar só', () => {
  const known = [...LEFT_GROUPS, ...RIGHT_GROUPS].flat();
  const CAIXA_50 = { x: 600, y: 200, w: 280, h: 320 };
  const lugares = (lido: LayoutState): string[] => [lido.left, lido.right].flatMap((c) => [
    ...c.groups.flat(), ...c.closed.map((i) => i.id), ...c.floating.flatMap((i) => tabsOf(i)),
  ]);
  const relido = (layout: LayoutState): LayoutState => parseLayout(JSON.parse(JSON.stringify(layout)) as unknown, known);

  it('a Ordem levada para a direita e solta de lá: relida, ela continua só solta, sem aba órfã na esquerda', () => {
    const levada = moveToOtherColumn(defaultLayout(known), 'ordem');
    const solta: LayoutState = { ...levada, right: floatPanel(levada.right, 'ordem', CAIXA_50) };
    const lido = relido(solta);
    expect(lido.left.groups.flat()).not.toContain('ordem');
    expect(lido.right.floating.map((i) => i.id)).toEqual(['ordem']);
    expect(lugares(lido).sort()).toEqual([...known].sort());
  });

  it('a Ordem fechada do lado direito continua fechada, e não renasce na esquerda', () => {
    const levada = moveToOtherColumn(defaultLayout(known), 'ordem');
    const fechada: LayoutState = { ...levada, right: closePanel(levada.right, 'ordem') };
    const lido = relido(fechada);
    expect(lido.left.groups.flat()).not.toContain('ordem');
    expect(lido.right.closed.map((i) => i.id)).toEqual(['ordem']);
    expect(lugares(lido).sort()).toEqual([...known].sort());
  });

  it('colar de volta na tira da Árvore: a Ordem atravessa e entra no grupo da Árvore, não no de origem', () => {
    // O gesto da casca (`dockFloatingPanel`, colar do outro lado): primeiro ela
    // volta para a sua coluna, depois atravessa, depois entra no grupo mirado.
    const levada = moveToOtherColumn(defaultLayout(known), 'ordem');
    const lido = relido({ ...levada, right: floatPanel(levada.right, 'ordem', CAIXA_50) });
    const devolvida: LayoutState = { ...lido, right: dockPanel(lido.right, 'ordem') };
    expect(sideOf(devolvida, 'ordem')).toBe('right');
    const atravessou = moveToOtherColumn(devolvida, 'ordem');
    expect(sideOf(atravessou, 'ordem')).toBe('left');
    expect(atravessou.right.groups.flat()).not.toContain('ordem');
  });
});
