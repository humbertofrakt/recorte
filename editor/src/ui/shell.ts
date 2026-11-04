/**
 * The application shell (owner A): menus, tool strip, panel column, status bar.
 *
 * The shell owns no document state. It reads the `Doc`, lists whatever tools
 * and panels registered themselves, and turns clicks and keys into commands.
 * Transient state that is not in the file — which tool is active — lives here.
 *
 * Text is Portuguese and short, every button says a word (never an icon alone),
 * and every menu entry shows its keyboard shortcut in the same column.
 */

import './shell.css';
import './shell-status.css';


import {
  emptySelection, getPanel, getPanels, getTools, readEditorState, writeEditorState,
} from '../contract.js';
import type { DocChange, EditorState, Panel, Tool } from '../contract.js';
import { corpoDe, skeletonsDe } from '../contract.js';
// Rodada 8c, C15: o aviso da emenda vai para a barra de avisos.
import { entitySlots, seamWarnings } from '../anim/entity-band.js';
import { whereLabel } from './where-model.js';
import { isSlotHidden, toggleViewKey, viewSettings } from '../viewport/onion.js';
import { emitterWarningLines } from '../viewport/particles-view.js';
import { weightWarningLines } from '../panels/particle-weight.js';
import { montagemWarnings } from '../panels/entities-cards-model.js';
import { ParticleCache, particleFrame } from '../../../runtime/src/index.js';
import { toolOfKey } from '../viewport/tools/registry.js';
import { getCompensation, getHandleSpace } from '../viewport/tools/space.js';
import type { Doc } from '../doc/document.js';
import type { DraftStorage } from '../doc/rascunho.js';
import { hasImportedImages } from '../io/import-images.js';
import type { FolderDirectoryHandle, ProjectFolder } from '../io/project-folder.js';
import { folderImageNames } from '../io/project-folder.js';
import { START_TOOL } from './toolbar-model.js';
import { toolFooter, toolbarItems } from './toolbar-model.js';
import {
  FLOAT_DEFAULT_H, FLOAT_DEFAULT_W, FLOAT_MIN_H, FLOAT_MIN_W, GROUP_MIN_PX, closeGroup,
  closePanel, dockAllFloating, dockPanel, floatPanel, groupOf, groupShares,
  insertionIndex, isCollapsed, isPanelClosed, isPanelFloating, moveTab, openPanels,
  reopenPanel, resizeSplit, restoreAutoSplit, selectTab, setFloatBox, setSplit,
  SNAP_WORDS, setFloatSnap, snappedBox,
  toggleCollapsed,
} from './panel-groups.js';
import type { FloatBox, FloatSnap, SnapArea } from './panel-groups.js';
import { dragHint, dropTarget, endDrag, moveDrag, shadowBox, startDrag } from './panel-drag.js';
import type { DragResult, DragSource, DragState, DropArea, DropTarget, Point, StripInfo } from './panel-drag.js';
import { fitFloat, resizeInside } from './float-fit.js';
import {
  ICONS_STORAGE_KEY, canCollapseToIcons, canExpand, clickIcon, closeFlyout, columnWidth,
  defaultIconState, flyoutBox, iconSlots, iconStateToSave, isIconic, panelIcon, parseIconState,
  setAllIconic, toggleIconic,
} from './icon-columns.js';
import type { IconMenuItem, IconState } from './icon-columns.js';
import {
  ANIM_LIST_ROWS, IMAGES_ROW_NEED, QUICK_SHEET_IMAGE, SPLIT_GRIP_H, TAB_STRIP_H, animFloorCap, animListNeed, cutNotice,
  dockRoomForColumn, floorGroup, planColumn, propsNeed,
} from './props-floor.js';
import { moreHint, planTabStrip } from './tab-strip-model.js';
import { drawnFloatBox, isFloatFolded, tabDoubleClick, toggleFloatFold } from './panel-fold.js';
import { floatGroup, floatHolding, selectFloatTab, tabsOf } from './float-groups.js';
import { columnsShown, dockShown, hiddenToSave, hideNotice, pressShiftTab, pressTab } from './hide-panels.js';
import { CONTEXTS, CONTEXT_STORAGE_KEY, DEFAULT_CONTEXT, contextDock, contextLayout, parseContext, switcherItems, switcherLabel } from './contexts.js';
import { openFloatingMenu } from './floating-menu.js';
import type { FloatingItem } from './floating-menu.js';
import type { HideMode } from './hide-panels.js';
import { paintIcon } from './icons.js';
import { SetProperty } from '../doc/commands.js';
import {
  avisosPeloPior, panelFor, resumoDosAvisos, warningRow, type WarningFix, type WarningRow, type WarningTarget,
} from '../panels/warning-model.js';
import { estadoDoArquivo } from './salvar-avisos.js';
import type { ColumnState } from './panel-groups.js';
import { columnOf, defaultLayout, ladosPorUso, moveToOtherColumn, parseLayout, setWidth, sideOf, SPLIT_STORAGE_KEY, defaultSplit, parseSavedSplits, splitsToSave, withSavedSplits } from './layout-model.js';
import type { LayoutState, Side } from './layout-model.js';
import { PasteAnchor, anchorLine, readAnchor } from '../panels/anchor-clipboard.js';
import type { Anchor } from '../panels/anchor-clipboard.js';
import {
  CLOSED_HEIGHT, OPEN_MIN, defaultDockState, dockFromDrag, dockHeightFor, dockState, parseDockState,
  setDockHeight as withDockHeight, setDockState, toggleDock,
} from '../panels/dock-model.js';
import type { DockState } from '../panels/dock-model.js';
import { askPick } from './dialog.js';
import { isTyping, keyMap, textKeepsKey, keyOf, keyTable, liveShortcut, liveTable } from './keys.js';
import { onPrefsChange, prefs, setPrefs } from './prefs.js';
import { onKeySwapsChange } from './key-swaps.js';
import { showProblemsDialog } from './problems-dialog.js';
import {
  allArrangements, arrangementDock, arrangementHint, arrangements, layoutOf,
} from './arrangements.js';
import { setTheme } from './theme.js';
import type { ThemeName } from './theme.js';
import { actionState, hasAction, runAction } from './actions.js';
import { actionRow } from './actions-table.js';
import { judgeShortcut } from './shell-keys.js';
import { falarPorUmLugar, fraseDoRodape, juntarFrases } from './shell-status.js';
import { nextStep, nextStepInputOf, nextStepLine, nextStepParts } from './next-step-model.js';
import type { NextStep } from './next-step-model.js';
import { prettyKey } from './key-swaps.js';
import { WINDOW_PANELS, allMenus, greyItemSays, isSeparator, shortcutOfEvent } from './menus.js';
import type { MenuEntry, MenuGroupDef, MenuItem, MenuState } from './menus.js';
// O `el` é um só, em `ui/dom.ts`, desde o lote A4.
import { el } from './dom.js';
import * as shellFile from './shell-file.js';
import * as shellActions from './shell-actions.js';
import * as shellDrop from './shell-drop.js';

// ---------------------------------------------------------------------------
// Small DOM helpers
// ---------------------------------------------------------------------------

/** Id of the panel that goes in the middle of the window, not in the column. */
const STAGE_PANEL = 'viewport';

/**
 * Onde a arrumação da coluna mora dentro de `RECORTE_editor_state` — item 19.
 *
 * Vai no ARQUIVO, e não só no navegador: a arrumação da coluna é do trabalho.
 * Um `.bone` de montagem quer a Árvore alta; um de animação quer as
 * Propriedades à frente. Quem reabre o arquivo reencontra a bancada como
 * deixou, e os leitores ignoram a extensão inteira (§2.7).
 */
/**
 * A BANCADA mora na máquina, e não no personagem — 13/09/2026.
 *
 * Até aqui, nove campos de arranjo iam para dentro do `.bone`, no bloco
 * `RECORTE_editor_state`: quais abas em qual grupo, a aba à frente, o
 * recolhido, o fechado, o flutuante, a largura das colunas, as colunas
 * escondidas e a faixa de baixo.
 *
 * **Duas coisas erradas saíam disso.** A primeira: abrir o `.bone` de outra
 * pessoa reorganizava a tela de quem abriu. A segunda, que é a que decide:
 * **o arranjo viajava dentro do `.bone` que ele PUBLICA.** Um personagem
 * entregue não pode carregar quais painéis estavam fechados na máquina de quem
 * salvou — isso não é do personagem.
 *
 * COMO O ERRADO NASCEU, e vale mais que o conserto. O lote 52 acertou o
 * raciocínio para UM campo, a divisão de altura, e deixou o motivo escrito ao
 * lado: *"é da máquina de quem trabalha, e não do personagem — abrir outro
 * arquivo não pode devolver a Árvore ao tamanho de fábrica"*. Os outros oito
 * campos foram sendo acrescentados por cima, cada um seguindo o vizinho. Dois
 * deles em 13/09/2026, por quem escreve isto. **Ninguém decidiu o errado: o
 * errado foi crescendo por imitação** — e a pergunta que faltou não era "isto
 * está certo?", era "por que o vizinho faz assim?".
 *
 * A linha, daqui em diante: **documento no arquivo, bancada na máquina.** O
 * `.bone` fica com o que é do personagem — a animação aberta, a câmera, a
 * seleção, as peles à vista.
 */
export const BENCH_STORAGE_KEY = 'RECORTE_bancada';

export const COLUMN_STATE_KEY = 'panels';

/**
 * Os dois lados, e o `Tab`.
 *
 * Do lote 16 em diante a bancada tem DUAS colunas, e a chave `panels` passa a
 * guardar `{ left, right, widths, hidden }`. Um arquivo gravado antes disso
 * guarda uma coluna só, no formato antigo: `parseLayout` reconhece e a põe à
 * DIREITA, que é onde ela estava na tela. Nada se perde.
 */

/**
 * Onde a faixa de baixo guarda "aberta ou fechada" — lote 14, rodada 3.
 *
 * Ao lado da coluna, dentro de `RECORTE_editor_state`, e pelo mesmo motivo: um
 * `.bone` que se abre para montar quer a cena inteira, e um que se abre para
 * animar quer as linhas à vista. Quem reabre o arquivo reencontra a bancada
 * como deixou, e os leitores ignoram a extensão inteira (§2.7).
 */
export const DOCK_STATE_KEY = 'dock';

/**
 * Panels that live in the strip UNDER the drawing area, as tabs, instead of in
 * the right-hand column. Time runs left to right, so a timeline needs the full
 * width of the window: squeezed into a 300px column it cannot be read. The
 * order here is the order of the tabs.
 *
 * A **Prévia** entrou aqui no lote 12 (item 30). Ela é sobre tempo — é onde se
 * vê uma animação encadear na outra —, e estava na coluna da direita, dobrada,
 * a uma tela de distância da linha do tempo que se estava ajustando. Ao lado
 * das Curvas ela fica onde a pergunta nasce.
 */
// A **Prévia** saiu daqui no lote 25 (anotação 5) e voltou a ser painel de
// coluna. Sobraram as duas abas que são mesmo sobre TEMPO.
export const DOCK_PANELS = ['linha-do-tempo', 'curvas'];

/**
 * Painéis da coluna que só aparecem com a ferramenta certa na mão — item 19.
 *
 * "Malha e pesos" é a bancada de uma tarefa, não um painel de todo dia. A aba
 * dele fica escondida até alguém pegar a ferramenta de malha ou a de pesos, e
 * some de novo quando a ferramenta muda. Uma aba a menos é uma aba a menos para
 * ler toda vez que se procura outra coisa.
 */
/**
 * Painéis que só apareciam com uma ferramenta na mão.
 *
 * **Vazio desde o lote 29** — anotação 15, item j. A aba "Malha e pesos" sumia
 * da tira quando a ferramenta não era a de malha nem a de pesos, e uma aba que
 * some é uma função que deixou de existir para quem não sabia dela: não havia
 * como descobrir que o programa faz malha olhando a tela. Agora ela fica
 * sempre, e sem a ferramenta ela **diz o que fazer** em vez de sumir.
 *
 * A tabela fica, vazia, porque os testes do lote 12 a citam pelo nome e porque
 * ela é o lugar certo se um dia outro painel precisar disto.
 */
export const TOOL_PANELS: Readonly<Record<string, readonly string[]>> = Object.freeze({});

/**
 * Painéis que dobravam ao nascer — nada mais dobra desde o lote 12.
 *
 * A coluna virou dois grupos de ABAS (item 19): num grupo de abas só uma
 * aparece por vez, e ela ocupa a altura inteira do grupo. Dobrar deixou de
 * fazer sentido, e foi a resposta certa para o problema errado: o que faltava
 * não era esconder painel, era dar altura ao que está à frente.
 *
 * A lista fica, vazia, porque os testes do lote 0 e da rodada 1 a citam e
 * apagá-la esconderia que a decisão mudou.
 */
export const CLOSED_PANELS: readonly string[] = Object.freeze([]);

/*
 * A altura da faixa de baixo deixou de morar aqui no lote 14 (rodada 3).
 *
 * Quanto ela mede aberta, quanto mede fechada e a partir de que arrasto ela
 * abre são agora a conta de `panels/dock-model.ts` — um módulo puro que um
 * teste sem navegador lê inteiro. A casca só escreve o número na tela e
 * respeita o chão do desenho, em `fitToWindow`.
 */
/** Room the drawing area always keeps, so the strip can never swallow it. */
/**
 * Least room the DRAWING itself may have, in pixels — the canvas, not `<main>`.
 *
 * `<main>` also carries the viewport toolbar, which is 38px on a wide window
 * and 146px when it wraps. Reserving 150px for `<main>` therefore left the
 * canvas with 80px on a 1254x568 window, and 24.8px with the grip pulled all
 * the way. `stageMin()` below adds the measured toolbar back on top of this.
 */
const STAGE_MIN = 260;

/**
 * Fatia da altura disponível que o canvas leva quando `STAGE_MIN` não cabe.
 *
 * Numa janela de 568px de altura não há 260px de canvas MAIS 162px de barra de
 * ferramentas MAIS 220px de faixa de baixo. Alguma coisa tem que ceder, e a
 * conta acima divide em vez de dar tudo a um lado só.
 */
const STAGE_SHARE = 0.45;

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export class Shell {
  readonly doc: Doc;
  readonly root: HTMLElement;
  /** Where the viewport puts its canvas. */
  readonly stage: HTMLElement;

  private readonly toolStrip: HTMLElement;
  private readonly leftColumn: HTMLElement;
  private readonly rightColumn: HTMLElement;
  /** Tudo entre a barra de menus e o rodapé: a barra, o meio e a faixa. */
  private readonly center: HTMLElement;
  /** Onde a cena põe a barra de ações, na largura da janela — lote 17. */
  private readonly actionBarHost: HTMLElement;
  private readonly dock: HTMLElement;
  private readonly dockTabs: HTMLElement;
  private readonly dockBody: HTMLElement;
  private readonly dockGrip: HTMLElement;
  private readonly docName: HTMLElement;
  readonly statusState: HTMLElement;
  private readonly statusMode: HTMLElement;
  private readonly warnButton: HTMLButtonElement;
  private readonly warnList: HTMLElement;
  private readonly menuBar: HTMLElement;

  private readonly mountedPanels: Array<{ panel: Panel; host: HTMLElement }> = [];
  /** Tab button and host of every panel in the bottom strip, by panel id. */
  private dockEntries = new Map<string, { panel: Panel; tab: HTMLButtonElement; host: HTMLElement }>();
  activeDock: string | null = null;
  private toolButtons = new Map<string, HTMLButtonElement>();
  private currentTool: Tool | null = null;
  private readonly statusTool: HTMLElement;
  private toolListeners = new Set<(tool: Tool | null) => void>();
  private openMenu: HTMLElement | null = null;
  /** A faixa "Solte para…" do arrasto de arquivo — anotação 23, lote 36. */
  dropBanner: HTMLElement | null = null;
  /** Which panels of the right-hand column are open. Missing means open. */
  /**
   * Which panels of the right-hand column are unfolded.
   *
   * Malha and Exibição start folded. Measured on 1440x900 with everything
   * open: Árvore showed 127px of 2625px of content, Propriedades 45px of 395px
   * — one form row — and Exibição 26px of 1257px. Folding the two panels the
   * artist opens least gives the other three a height they can work in. The
   * headers stay visible, so nothing is hidden, only closed.
   */
  /** Quando o último rascunho foi gravado, para a espera de `saveDraft`. */
  lastDraftAt: number | null = null;
  /**
   * Já foi dito que o rascunho não está sendo gravado? — A1, degrau 11.
   * Um recado repetido a cada trinta segundos vira ruído e deixa de ser lido.
   */
  draftWarned = false;


  /** A âncora copiada, para colar em outros desenhos — item 33. */
  anchor: Anchor | null = null;
  /** Onde cada aba está, nos dois lados, e a largura de cada coluna — lote 16. */
  layout: LayoutState = defaultLayout([]);
  /** Aba e casa de cada painel, por id, com o lado a que ele pertence. */
  columnEntries = new Map<string, {
    panel: Panel; tab: HTMLButtonElement; host: HTMLElement; side: Side;
  }>();
  /** As caixas dos grupos de cada lado, para mudar a altura sem remontar. */
  private groupBoxes: Record<Side, HTMLElement[]> = { left: [], right: [] };
  /** O botão de recolher de cada grupo, para o `applySplit` acertar o rótulo. */
  private foldButtons: Record<Side, HTMLButtonElement[]> = { left: [], right: [] };
  /**
   * O arrasto de painel em andamento — rodada 4, lote 1. Um só para a aba e
   * para a barra do painel solto; `null` com a mão solta.
   */
  private arrasto: { state: DragState; target: DropTarget; parar: () => void } | null = null;
  /** Depois de um arrasto de verdade, o `click` que vem junto não escolhe a aba. */
  private engolirClique = false;
  /** A linha azul e o contorno azul de onde a aba vai entrar. */
  private dropLinha: HTMLElement | null = null;
  private dropContorno: HTMLElement | null = null;
  /**
   * As colunas recolhidas em ícones, e o painel aberto ao lado da faixa —
   * rodada 4, lote 2. Mora no navegador (`RECORTE_colunas_em_icones`); lido
   * uma vez, na primeira montagem.
   */
  private icones: IconState = defaultIconState();
  private iconesLidos = false;
  /** Tira o `Esc` do painel aberto pelo ícone, quando ele fecha. */
  private pararVoo: (() => void) | null = null;
  /** O botão dos contextos, na barra de cima — rodada 4, lote 8. */
  private contextoBotao: HTMLButtonElement;
  /** O contexto (ou arranjo) em uso. Mora no navegador (`RECORTE_contexto`). */
  private contextoAtual: string | null = null;
  /**
   * A coluna em que a mão esteve por último — rodada 4, consertos. É ela que
   * "Soltar o painel da parede" e "Fechar o grupo" procuram primeiro.
   */
  private ladoEmUso: Side | null = null;
  /** Onde os painéis descolados moram, sobre a cena. */
  private floatLayer!: HTMLElement;
  /** A caixa da cena: é nas bordas e quinas DELA que o flutuante cola. */
  private stageRow!: HTMLElement;
  /** A sombra de onde o flutuante vai colar, enquanto a mão segura. */
  private snapShadow: HTMLElement | null = null;
  /** As caixas dos flutuantes montados, por id. */
  private floatBoxes = new Map<string, HTMLElement>();
  /**
   * A frase que ensina o gesto do botão direito já foi dita nesta sessão?
   *
   * Uma vez por sessão, como o programa já faz com o botão direito da cena:
   * repetir a cada clique vira ruído, e nunca dizer deixa o gesto invisível.
   */
  private ensinouFecharGrupo = false;
  private splitDrag:
    { pointerId: number; startY: number; startSplit: number; side: Side } | null = null;
  private widthDrag: { pointerId: number; startX: number; startWidth: number; side: Side } | null
    = null;
  /**
   * A faixa de baixo aberta ou fechada, e a altura de quando ela está aberta.
   *
   * Nasce FECHADA — lote 14, rodada 3. A conta inteira é do `dock-model.ts`;
   * aqui só se guarda o que ele devolveu e se escreve o pixel na tela.
   */
  dockView: DockState = { ...dockState() };
  private dockDrag: { pointerId: number; startY: number; startHeight: number } | null = null;

  constructor(doc: Doc, root: HTMLElement) {
    this.doc = doc;
    this.root = root;

    this.menuBar = el('div', { class: 'menu-bar', style: 'display:flex;gap:4px' });
    this.docName = el('div', { class: 'doc-name' });
    // O botão dos contextos — rodada 4, lote 8. O seletor de área de trabalho
    // do Photoshop, no canto de cima à direita: Montar · Animar · Pesos, e os
    // arranjos. Nasce em ícone, com o nome na dica (regra da casa); o nome do
    // contexto aparece ao lado quando a janela tem largura (`shell.css`).
    this.contextoBotao = el('button', { class: 'contexto-botao', type: 'button' }) as HTMLButtonElement;
    this.contextoBotao.addEventListener('click', () => this.openContextMenu());
    const topBar = el('header', { class: 'top-bar' }, [
      el('div', { class: 'brand', text: 'Recorte' }),
      this.menuBar,
      this.docName,
      this.contextoBotao,
    ]);

    this.toolStrip = el('nav', { class: 'tool-strip', 'aria-label': 'Ferramentas' });
    this.stage = el('main', { class: 'stage', 'aria-label': 'Área de desenho' });
    this.leftColumn = el('aside', {
      class: 'panel-column panel-column-esquerda', 'aria-label': 'Painéis da esquerda',
    });
    this.rightColumn = el('aside', {
      class: 'panel-column panel-column-direita', 'aria-label': 'Painéis da direita',
    });
    // O lado em uso: qualquer clique numa coluna o marca (na captura, antes de
    // qualquer painel tratar o clique) — rodada 4, consertos.
    this.leftColumn.addEventListener('pointerdown', () => { this.ladoEmUso = 'left'; }, true);
    this.rightColumn.addEventListener('pointerdown', () => { this.ladoEmUso = 'right'; }, true);

    this.dockTabs = el('div', { class: 'dock-tabs', role: 'tablist', 'aria-label': 'Abas de baixo' });
    this.dockBody = el('div', { class: 'dock-body' });
    this.dock = el('section', { class: 'dock', 'aria-label': 'Faixa de baixo' }, [
      this.dockTabs, this.dockBody,
    ]);
    this.dockGrip = el('div', {
      class: 'dock-grip', role: 'separator', tabindex: '0',
      'aria-label': 'Altura da faixa de baixo. Arraste, ou use as setas.',
      'aria-orientation': 'horizontal', title: 'Arraste para mudar a altura',
    });
    /*
     * A faixa de baixo atravessa a JANELA INTEIRA, por baixo da coluna.
     *
     * É assim no Spriter, e não é enfeite: o tempo corre da esquerda para a
     * direita, e cada pixel de largura é um pedaço de animação que se vê sem
     * rolar. Presa entre a barra de ferramentas e a coluna, a faixa tinha 888px
     * numa janela de 1440 — e a linha do tocador, com a barra de velocidade e os
     * dois campos de tempo do lote 15, precisa de 929.
     *
     * `this.center` continua sendo a caixa cuja altura o `setDockHeight` divide
     * entre o desenho e a faixa: ela só mudou de forma, não de tamanho.
     */
    const stageRow = el('div', { class: 'shell-center' }, [this.stage]);
    this.stageRow = stageRow;
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(() => this.followSnaps()).observe(stageRow);
      // Rodada 4, lote 9: a coluna mudou de altura (a linha do tempo abriu, a
      // janela mudou): o chão do Propriedades é refeito.
      const chao = new ResizeObserver(() => this.applyPropsFloor());
      chao.observe(this.leftColumn);
      chao.observe(this.rightColumn);
      // Rodada 47, lote 1: a coluna mudou de largura, as tiras de abas se refazem.
      const tiras = new ResizeObserver(() => this.fitTabStrips());
      tiras.observe(this.leftColumn);
      tiras.observe(this.rightColumn);
    }
    /*
     * A cena fica NO MEIO, com uma coluna de cada lado — lote 16.
     *
     * "Ele usa as laterais, por isso a cena é muito mais espaçosa": à esquerda
     * o que diz o que a coisa É (árvore, ordem, propriedades), à direita o que
     * diz o que se vai FAZER (imagens, animações).
     */
    const middle = el('div', { class: 'shell-middle' }, [
      this.toolStrip,
      this.leftColumn,
      this.buildWidthGrip('left'),
      stageRow,
      this.buildWidthGrip('right'),
      this.rightColumn,
    ]);
    /*
     * A barra de ações atravessa a JANELA INTEIRA, logo abaixo do menu.
     *
     * É onde ela fica no Spriter, e é a única largura em que ela cabe: presa
     * dentro da cena, entre as duas colunas, ela tinha 904px numa janela de
     * 1440 e rolava de lado o tempo todo. A cena não perde nada com isso — a
     * barra ocupava a mesma altura dentro dela.
     *
     * Quem a constrói continua sendo a cena (`viewport/viewport.ts`), que sabe
     * o que é uma ferramenta; a casca só empresta o lugar.
     */
    this.actionBarHost = el('div', { class: 'action-bar-host' });
    /*
     * A camada dos painéis DESCOLADOS — 13/09/2026.
     *
     * Ela cobre o meio da casca e **não pega o ponteiro** (`pointer-events:
     * none` na folha): só os painéis dentro dela pegam. Sem isso, uma camada
     * transparente por cima da cena comeria todo clique de ferramenta, e o
     * Humberto descobriria que descolar um painel quebrou o desenho.
     */
    this.floatLayer = el('div', { class: 'panel-float-layer' });
    middle.append(this.floatLayer);
    this.center = el('div', { class: 'shell-body' }, [
      this.actionBarHost, middle, this.dockGrip, this.dock,
    ]);

    this.statusState = el('div', { class: 'status-state' });
    // Rodada 45, lote 4 (4.3): o rodapé cortado em "…" guarda a frase inteira na dica.
    new MutationObserver(() => { this.statusState.title = this.statusState.textContent ?? ''; })
      .observe(this.statusState, { childList: true, characterData: true, subtree: true });
    this.statusMode = el('div', { class: 'status-mode' });
    // A linha da FERRAMENTA na mão — lote 26. Ela só aparece quando há algo a
    // dizer: uma linha permanente no rodapé vira paisagem em dois dias.
    this.statusTool = el('div', { class: 'status-tool', hidden: true });
    this.warnButton = el('button', { class: 'status-warn', type: 'button' }) as HTMLButtonElement;
    this.warnList = el('ul', { class: 'warn-list', hidden: true });
    // P44 e L13 (29/09/2026): o rodapé fala por UM lugar. Toda escrita em
    // `textContent` dos dois passa pela `fraseDoRodape` e vira também o
    // `title` — a frase cortada com "…" se lê inteira na dica.
    falarPorUmLugar(this.statusState);
    falarPorUmLugar(this.statusTool);
    const statusBar = el('footer', { class: 'status-bar' }, [
      this.statusState, this.statusMode, this.statusTool, this.warnButton,
    ]);

    const shell = el('div', { class: 'shell' }, [topBar, this.center, statusBar, this.warnList]);
    root.replaceChildren(shell);
    // Rodada 47, lote 5b (notas do doc 86), nota 1: o clique numa barrinha não levava o foco a ela —
    // um ouvinte de painel segura o padrão do ponteiro —, o valor mudava com o
    // foco no BODY, e a seta seguinte (e o Tab, que é "Esconder painéis") ia
    // para a casca. Na captura, antes de qualquer painel: a barrinha apertada
    // recebe o foco, e o `lembrarFoco` a acha de novo depois do redesenho.
    // E ao SOLTAR: o painel que redesenha no meio do gesto troca a barrinha
    // por uma nova, e o soltar do mouse deixava o foco no BODY de novo (medido
    // na v35.3). Se o foco caiu, ele volta à barrinha de mesma marca.
    shell.addEventListener('pointerdown', (event) => {
      const alvo = event.target;
      if (!(alvo instanceof HTMLInputElement) || alvo.type !== 'range') return;
      if (document.activeElement !== alvo) alvo.focus({ preventScroll: true });
      const marca = alvo.dataset['foco'] ?? '';
      const id = alvo.id;
      if (marca === '' && id === '') return;
      const solta = (): void => {
        window.removeEventListener('pointerup', solta, true);
        setTimeout(() => {
          const ativo = document.activeElement;
          if (ativo !== null && ativo !== document.body) return;
          const nova = (marca !== ''
            ? document.querySelector(`[data-foco="${CSS.escape(marca)}"]`)
            : document.getElementById(id)) as HTMLElement | null;
          nova?.focus({ preventScroll: true });
        }, 0);
      };
      window.addEventListener('pointerup', solta, true);
    }, true);

    this.warnButton.addEventListener('click', () => {
      // Degrau 11, lote 6: o botão abre a **Janela de Problemas**. A tira
      // continua existindo como sinal, e o botão dela leva à janela onde os
      // consertos têm nome escrito.
      this.showProblems();
      this.warnList.hidden = true;
    });

    // O tema vai para a tela ANTES de qualquer painel montar: um painel que
    // mede a própria cor na montagem mediria a cor errada — lote 18.
    setTheme(prefs().theme);
    this.registerShellActions();
    this.buildMenus();
    this.buildTools();
    this.buildPanels();
    this.applyDockHeight();
    this.armDockGrip();
    // The limits need a laid-out window, which there is not one of yet.
    this.armUnloadGuard();
    this.armFileDrop();
    globalThis.requestAnimationFrame?.(() => this.applyDockHeight());
    globalThis.addEventListener?.('resize', () => this.applyDockHeight());
    onPrefsChange(() => this.closeMenu());
    // P19: ligar ou desligar o passo seguinte vale na hora.
    onPrefsChange(() => this.refreshStatus());
    // Degrau 11, lote 2: trocou uma tecla, o menu aberto diria a velha.
    onKeySwapsChange(() => this.closeMenu());
    this.refreshStatus();

    this.doc.on((change) => this.onDocChange(change));
    document.addEventListener('keydown', (event) => this.onKeyDown(event));
    document.addEventListener('keyup', (event) => this.onKeyUp(event));
    document.addEventListener('pointerdown', (event) => {
      if (this.openMenu !== null && !this.menuBar.contains(event.target as Node)) this.closeMenu();
    });
  }

  // -------------------------------------------------------------------------
  // Menus
  // -------------------------------------------------------------------------

  /**
   * O que os sete menus precisam saber do programa agora.
   *
   * Lido de novo toda vez que um menu abre, porque quase tudo aqui muda: o
   * nome do passo a desfazer, as caixas do painel Exibição, o painel que
   * alguém acabou de fechar.
   */
  private menuState(): MenuState {
    const view = viewSettings();
    const open: Record<string, boolean> = {};
    for (const panel of WINDOW_PANELS) {
      open[panel.id] = DOCK_PANELS.includes(panel.id)
        ? this.activeDock === panel.id
        : this.isPanelOpen(panel.id);
    }
    return {
      canRepack: hasImportedImages(this.doc),
      canUndo: this.doc.canUndo,
      undoLabel: this.doc.undoLabel,
      canRedo: this.doc.canRedo,
      redoLabel: this.doc.redoLabel,
      view: {
        bones: view.bones,
        boneNames: view.boneNames,
        boundingBoxes: view.boundingBoxes,
        points: view.points,
        meshes: view.meshes,
        edges: view.edges,
        weights: view.weights,
        grid: view.grid,
        rulers: view.rulers,
        axes: view.axes,
        drawings: view.drawings,
        clippings: view.clippings,
        hoverNames: view.hoverNames,
        cleanView: view.cleanView,
        onion: { enabled: view.onion.enabled },
      },
      lockBones: view.lockBones,
      lockDrawings: view.lockDrawings,
      space: getHandleSpace(),
      compensation: getCompensation(),
      animating: this.doc.animation !== null,
      // Quem sabe se o Repetir está ligado é o painel que o desenha, e ele diz
      // isso pelo `checked` da ação. Este campo é o valor de partida.
      loop: false,
      open,
      // Os arranjos com nome — degrau 11, lote 4 (C6). Os dois de fábrica e
      // os guardados NESTA MÁQUINA; o `.bone` não sabe de nenhum deles.
      arrangements: allArrangements(arrangements()).map((item) => ({
        id: item.id,
        name: item.name,
        factory: item.factory,
        ...(item.factory ? { hint: arrangementHint(item.id) } : {}),
      })),
    };
  }

  /**
   * The menus as buttons. What is *in* them is decided in `ui/menus.ts`, which
   * has no browser in it and can be read by a test; this only says what each
   * entry runs.
   */
  groups(): MenuGroupDef[] {
    return allMenus(this.menuState());
  }

  private buildMenus(): void {
    this.menuBar.replaceChildren();
    for (const group of this.groups()) {
      const list = el('ul', { class: 'menu-list', hidden: true });
      const button = el('button', {
        class: 'menu-button', type: 'button', text: group.label, 'aria-expanded': 'false',
      }) as HTMLButtonElement;
      const holder = el('div', { class: 'menu' }, [button, list]);

      button.addEventListener('click', () => {
        const wasOpen = this.openMenu === list;
        this.closeMenu();
        if (wasOpen) return;
        this.fillMenu(list, group.label);
        list.hidden = false;
        button.setAttribute('aria-expanded', 'true');
        this.openMenu = list;
      });

      this.menuBar.append(holder);
    }
  }

  private fillMenu(list: HTMLElement, label: string): void {
    // Rebuilt on every open so labels like "Desfazer Mover osso" stay current.
    const fresh = this.groups().find((g) => g.label === label);
    if (fresh === undefined) return;
    list.replaceChildren(...this.menuNodes(fresh.entries));
  }

  /** Uma entrada vira `<li>`. Submenu vira uma `<ul>` dentro do mesmo `<li>`. */
  private menuNodes(entries: readonly MenuItem[]): Node[] {
    return entries.map((item) => {
      if (isSeparator(item)) return el('li', { class: 'menu-separator', role: 'separator' });

      const state = actionState(item.action);
      const hasChildren = item.children !== undefined && item.children.length > 0;
      // Cinza quando a lista já diz que não, ou quando ninguém registrou a
      // função. Um pai de submenu abre sempre: o que ele faz é abrir.
      const enabled = hasChildren || (item.enabled && (state.exists ? state.enabled : false));
      const checked = state.checked ?? item.checked;

      // Rodada 17 (sobra da rodada 9): o item cinza que sabe POR QUÊ continua
      // clicável e diz o motivo no rodapé — como o botão Caminho das
      // partículas. Antes o motivo só se lia na dica, passando o mouse.
      const why = this.whyDisabled(item, enabled, state.exists, state.why);
      const falaNoRodape = greyItemSays(enabled, why);
      const button = el('button', {
        class: hasChildren ? 'menu-item menu-item-pai' : 'menu-item',
        type: 'button',
        disabled: !enabled && falaNoRodape === null,
      }, [
        el('span', { class: 'menu-mark', text: checked === true ? '✓' : '' }),
        el('span', { class: 'menu-name', text: item.label }),
        el('span', { class: 'menu-key', text: hasChildren ? '▸' : liveShortcut(item.action, item.shortcut) ?? '' }),
      ]) as HTMLButtonElement;

      if (checked !== undefined) button.setAttribute('aria-checked', String(checked));
      if (falaNoRodape !== null) {
        button.classList.add('menu-item-cinza');
        button.setAttribute('aria-disabled', 'true');
      }
      const tecla = item.shortcut === undefined
        ? '' : ` (${liveShortcut(item.action, item.shortcut)})`;
      if (why !== null) {
        button.title = why;
        button.setAttribute('aria-description', why);
      } else if (item.hint !== undefined) {
        /*
         * **A dica de um item LIGADO** — 22/09/2026, lote 2 do plano
         * `COMO SABER O QUE O PROGRAMA TEM`.
         *
         * Até hoje a `hint` só chegava à tela quando o item estava **cinza**:
         * o `whyDisabled` devolvia `null` para um item vivo, e a dica dele
         * caía na linha de baixo, que escreve só o nome e a tecla. Ou seja,
         * **toda dica de item ligado estava escrita e não aparecia** — a de
         * "Problemas do arquivo…", do degrau 11, e a da Paleta de comandos,
         * que este lote acabou de escrever.
         *
         * Achado ao ir fotografar a dica nova e não achá-la na tela. É a regra
         * 21 de novo, e desta vez o enganado era quem escreveu a dica: o campo
         * existia, o valor estava lá, e nada daquilo chegava a ninguém.
         *
         * A tecla continua junto, porque quem lê a dica duas vezes na mesma
         * semana é quem devia estar usando a tecla.
         */
        button.title = `${item.hint}${tecla}`;
        button.setAttribute('aria-description', item.hint);
      } else if (item.shortcut !== undefined) {
        button.title = `${item.label}${tecla}`;
      }

      if (!hasChildren) {
        button.addEventListener('click', () => {
          this.closeMenu();
          if (falaNoRodape !== null) {
            this.doc.notice(falaNoRodape);
            return;
          }
          runAction(item.action);
        });
      }

      const row = el('li', { class: hasChildren ? 'menu-row menu-row-pai' : 'menu-row' }, [button]);
      if (hasChildren) {
        const sub = el('ul', { class: 'menu-list menu-sublist' }, this.menuNodes(item.children ?? []));
        row.append(sub);
        /*
         * O submenu sai FLUTUANDO, e não dentro da lista — degrau 11, lote 4.
         *
         * O menu Janela passou a rolar (ele tem vinte linhas e a tela tem 900
         * px), e uma lista que rola RECORTA o que sai dela: o submenu dos
         * arranjos abria e ficava invisível. Com `position: fixed` ele escapa
         * do recorte, e aqui se diz onde ele cai — ao lado do item, e para a
         * esquerda quando não couber à direita.
         */
        const posicionar = (): void => {
          const r = button.getBoundingClientRect();
          sub.style.top = `${Math.round(r.top - 6)}px`;
          sub.style.left = `${Math.round(r.right)}px`;
          sub.style.right = 'auto';
          // Medido depois de posto: se passar da janela, vai para a esquerda.
          const largura = sub.offsetWidth;
          if (r.right + largura > window.innerWidth - 8) {
            sub.style.left = `${Math.max(8, Math.round(r.left - largura))}px`;
          }
          const altura = sub.offsetHeight;
          if (r.top - 6 + altura > window.innerHeight - 8) {
            sub.style.top = `${Math.max(8, window.innerHeight - 8 - altura)}px`;
          }
        };
        row.addEventListener('pointerenter', posicionar);
        row.addEventListener('focusin', posicionar);
      }
      return row;
    });
  }

  /** A frase que explica um item cinza, ou `null` quando ele está vivo. */
  private whyDisabled(item: MenuEntry, enabled: boolean, exists: boolean, now?: string): string | null {
    if (enabled) return null;
    // Rodada 6, régua 3: o motivo de AGORA vence a dica fixa — "esta entidade
    // não tem imagem de antes" diz mais que "com uma entidade escolhida".
    if (now !== undefined) return now;
    if (item.hint !== undefined) return item.hint;
    if (!exists) return 'Ainda não existe neste lote';
    return null;
  }

  private closeMenu(): void {
    if (this.openMenu === null) return;
    this.openMenu.hidden = true;
    this.openMenu = null;
    for (const button of this.menuBar.querySelectorAll('.menu-button')) {
      button.setAttribute('aria-expanded', 'false');
    }
  }

  // -------------------------------------------------------------------------
  // Tools
  // -------------------------------------------------------------------------

  /** Rebuilds the tool strip. Call again if a tool registers late. */
  buildTools(): void {
    const tools = getTools();
    this.toolButtons = new Map();
    const children: Node[] = [el('h2', { text: 'Ferramentas' })];

    // The viewport draws its own row of tool buttons right above the canvas.
    // Two identical rows would be noise, so the strip steps aside when it is
    // there — the keyboard shortcuts below keep working either way.
    this.toolStrip.hidden = getPanel(STAGE_PANEL) !== null;

    if (tools.length === 0) {
      children.push(el('p', { class: 'tool-empty', text: 'Nenhuma ferramenta ainda.' }));
    }
    // Pela MESMA lista da barra de ações — lote 26. A tira montava os botões na
    // ordem em que as ferramentas se registram, que é a ordem dos `import` do
    // `viewport.ts`; ela está escondida hoje, e no dia em que for ligada
    // mostraria uma ordem diferente da barra, sem ninguém entender por quê.
    for (const item of toolbarItems(tools)) {
      const button = el('button', {
        class: 'tool-button', type: 'button', 'aria-pressed': 'false', title: item.hint,
      }, [
        el('span', { text: item.label }),
        el('span', { class: 'tool-key', text: item.key ?? '' }),
      ]) as HTMLButtonElement;
      button.addEventListener('click', () => this.setTool(item.id));
      this.toolButtons.set(item.id, button);
      children.push(button);
    }
    this.toolStrip.replaceChildren(...children);

    // Lote 47: a de partida é o Transformar, e não a primeira que se registrou.
    if (this.currentTool === null && tools.length > 0) {
      this.setTool((tools.find((t) => t.id === START_TOOL) ?? tools[0]!).id);
    }
    else this.markActiveTool();
  }

  get tool(): Tool | null {
    return this.currentTool;
  }

  setTool(id: string): void {
    const next = getTools().find((t) => t.id === id) ?? null;
    if (next === this.currentTool) return;
    this.currentTool?.onExit?.(this.doc);
    this.currentTool = next;
    next?.onEnter?.(this.doc);
    this.markActiveTool();
    // A aba "Malha e pesos" só existe com a ferramenta de malha ou de pesos na
    // mão — item 19.
    this.syncColumnTabs();
    this.refreshToolFooter();
    for (const listener of [...this.toolListeners]) listener(next);
  }

  /** Told when the active tool changes, so the viewport can follow. */
  onToolChange(listener: (tool: Tool | null) => void): () => void {
    this.toolListeners.add(listener);
    return () => { this.toolListeners.delete(listener); };
  }

  private markActiveTool(): void {
    for (const [id, button] of this.toolButtons) {
      button.setAttribute('aria-pressed', String(id === this.currentTool?.id));
    }
  }

  // -------------------------------------------------------------------------
  // Panels
  // -------------------------------------------------------------------------

  /** Mounts every registered panel. Call again if a panel registers late. */
  buildPanels(): void {
    for (const mounted of this.mountedPanels) mounted.panel.unmount?.();
    this.mountedPanels.length = 0;

    // The viewport is a panel like the others, but it belongs in the middle of
    // the window, with no header of its own, and it must be free to grow.
    const stagePanel = getPanel(STAGE_PANEL);
    if (stagePanel !== null) {
      this.stage.replaceChildren();
      this.mountedPanels.push({ panel: stagePanel, host: this.stage });
    } else {
      this.stage.replaceChildren(
        el('p', { class: 'panel-empty', text: 'A área de desenho não carregou.' }),
      );
    }

    const rest = getPanels().filter((panel) => panel.id !== STAGE_PANEL);
    const column = rest.filter((panel) => !DOCK_PANELS.includes(panel.id));
    // In the order of DOCK_PANELS, not in the order they registered.
    const docked = DOCK_PANELS
      .map((id) => rest.find((panel) => panel.id === id))
      .filter((panel): panel is Panel => panel !== undefined);

    this.buildColumn(column);
    this.buildDock(docked);
    for (const { panel, host } of this.mountedPanels) panel.mount(this.doc, host);
    // Depois de montar: `syncColumnTabs` esconde e mostra casas, e uma casa
    // escondida na hora da montagem mediria zero.
    this.syncColumnTabs();
    // Na partida a faixa nasce com o `dock.open` que estava gravado no arquivo,
    // e mais nada. Aba lembrada Curvas com a faixa fechada volta para a Linha
    // do tempo dentro do próprio `showDockPanel` — anotação 4.
    if (this.activeDock !== null) this.showDockPanel(this.activeDock);
    this.applyHidden();
  }

  /**
   * Constrói as DUAS colunas: dois grupos de abas em cada uma — lote 16.
   *
   * Cada grupo tem uma tira de abas em cima e UMA casa embaixo. Todos os
   * painéis são montados de uma vez e o que não está à frente fica só
   * escondido: um painel derrubado e refeito a cada clique de aba perderia a
   * seleção, a rolagem e o campo que estava sendo digitado.
   *
   * Entre os dois grupos de um lado vai uma alça de altura; entre cada coluna
   * e a cena, uma alça de largura. A divisão é escolha de quem trabalha, e ela
   * muda com a tarefa — montar quer a Árvore alta, animar quer as Propriedades.
   */
  private buildColumn(panels: readonly Panel[]): void {
    const known = panels.map((panel) => panel.id);
    // Lote 52: a divisão de altura guardada no navegador ganha a do arquivo —
    // ela é da máquina de quem trabalha, e vale em qualquer arquivo aberto.
    this.layout = withSavedSplits(
      parseLayout(this.readBench(COLUMN_STATE_KEY), known),
      parseSavedSplits(this.readSplits()),
    );
    this.columnEntries = new Map();
    this.groupBoxes = { left: [], right: [] };
    this.foldButtons = { left: [], right: [] };
    if (!this.iconesLidos) {
      this.iconesLidos = true;
      this.icones = parseIconState(this.readKey(ICONS_STORAGE_KEY));
    }
    this.refreshContextButton();

    if (panels.length === 0) {
      this.leftColumn.replaceChildren(
        el('p', { class: 'panel-empty', text: 'Nenhum painel ainda.' }),
      );
      this.rightColumn.replaceChildren();
      return;
    }

    this.buildSide('left', panels);
    this.buildSide('right', panels);
    // Os descolados por último: eles roubam o `host` do painel da coluna, e
    // por isso precisam que os dois lados já tenham montado os seus.
    this.buildFloating(panels);
    // O painel aberto pelo ícone também rouba o `host` — rodada 4, lote 2.
    this.buildFlyout();
    this.applySplit();
    this.applyWidths();
    this.applyHidden();
  }

  /** Um lado: os grupos, as abas, as casas e a alça entre os grupos. */
  private buildSide(side: Side, panels: readonly Panel[]): void {
    const state = columnOf(this.layout, side);
    const box = side === 'left' ? this.leftColumn : this.rightColumn;
    const children: Node[] = [];

    state.groups.forEach((ids, index) => {
      // A alça só existe ENTRE dois grupos com aba: sem isto ela ficava
      // sozinha na coluna depois de um grupo fechado, arrastando o nada.
      if (index > 0 && ids.length > 0 && state.groups.slice(0, index).some((antes) => antes.length > 0)) {
        children.push(this.buildSplitGrip(side));
      }
      const tabs = el('div', {
        class: 'panel-tabs', role: 'tablist',
        'aria-label': `Abas do grupo ${index + 1}`,
      });
      const body = el('div', { class: 'panel-group-body' });
      for (const id of ids) {
        const panel = panels.find((item) => item.id === id);
        if (panel === undefined) continue;
        const tab = el('button', {
          class: 'panel-tab', type: 'button', role: 'tab',
          'aria-selected': 'false',
        }) as HTMLButtonElement;
        tab.append(el('span', 'panel-tab-nome', panel.title));
        // Rodada 47, lote 5b (notas do doc 86), nota 4: a aba diz o que os gestos dela fazem.
        tab.title = `${panel.title}: clique traz à frente; dois cliques recolhem o grupo; arraste para outro grupo; botão direito leva para a outra coluna`;
        // O × que fecha o painel — 13/09/2026. Ele aparece na aba EM USO e na
        // aba sob o ponteiro, e não nas onze ao mesmo tempo: o Humberto
        // reclamou de tela cheia de coisa no mesmo dia. O LUGAR dele é
        // reservado sempre (o CSS o esconde por opacidade, não por `display`),
        // para as abas não pularem de posição quando ele aparece e some — o
        // pulo é o que mais atrapalha quem lê com dificuldade.
        // Sem texto: o × é desenhado pelo CSS (`::after`). Um `×` de verdade
        // aqui dentro entraria no `textContent` da aba, e o nome dela passaria
        // a ser "Ordem×" — o roteiro, a prova dos pesos e a medição procuram a
        // aba pelo nome, e as três quebraram assim que ele foi posto.
        const fechar = el('span', {
          class: 'panel-tab-x', role: 'button', tabindex: '-1',
          title: `Fechar: ${panel.title}`, 'aria-label': `Fechar: ${panel.title}`,
        });
        fechar.addEventListener('click', (event) => {
          // Sem isto o clique no × também escolheria a aba, e o painel
          // fecharia depois de vir à frente: um pisca-pisca sem sentido.
          event.stopPropagation();
          this.closePanelById(id);
        });
        tab.append(fechar);
        tab.dataset['panel'] = id;
        tab.addEventListener('click', () => {
          // O `click` que vem junto de um arrasto de verdade não escolhe nada:
          // a aba já foi para onde a mão a levou.
          if (this.engolirClique) return;
          // O clique num grupo recolhido o reabre (gesto de 13/09). Se é o
          // primeiro de dois cliques, o par já fez o que devia — abrir —, e o
          // `dblclick` não pode fechar de novo (rodada 4, lote 4).
          const coluna = columnOf(this.layout, side);
          const g = groupOf(coluna, id);
          if (g !== -1 && isCollapsed(coluna, g)) {
            this.reabertoPorClique = id;
            setTimeout(() => { if (this.reabertoPorClique === id) this.reabertoPorClique = null; }, 600);
          }
          this.showColumnPanel(id);
        });
        // Puxar a aba — rodada 4, lote 1 (05/10/2026). Era o arrasto do
        // NAVEGADOR (`draggable`, `dragstart`, `dragend`), e fora das tiras
        // ninguém aceitava a soltura: sobre a cena o cursor dizia "proibido" o
        // caminho todo, e o painel só soltava depois que a mão largava. O
        // Humberto: *"atualmente eles ficam presos nas paredes"*. Agora o
        // arrasto é nosso, por ponteiro, e a decisão é do `panel-drag.ts`:
        // menos de 5 px é clique; sobre uma tira, a linha azul; sobre o corpo
        // de outro grupo, o contorno azul; em qualquer outro lugar, a sombra
        // do painel debaixo da mão.
        // Dois cliques na aba recolhem o grupo dela (o mesmo que o `▾`); de
        // novo, abrem — rodada 4, lote 4. É o Photoshop. O primeiro dos dois
        // continua escolhendo a aba.
        tab.addEventListener('dblclick', (event) => {
          if ((event.target as HTMLElement | null)?.closest('.panel-tab-x') !== null) return;
          this.tabDoubleClicked(side, id);
        });
        tab.addEventListener('pointerdown', (event) => {
          if ((event.target as HTMLElement | null)?.closest('.panel-tab-x') !== null) return;
          const grupo = groupOf(columnOf(this.layout, side), id);
          if (grupo === -1) return;
          this.beginPanelDrag(event, { kind: 'aba', id, side, group: grupo });
        });
        // Botão direito na aba: **Mover para a outra coluna**. Arrastar já leva
        // a aba de um grupo para o outro do MESMO lado; atravessar a cena com
        // o mouse, por cima do desenho, é um gesto que ninguém acerta de
        // primeira, e por isso ele também é um item de menu.
        tab.addEventListener('contextmenu', (event) => {
          event.preventDefault();
          this.moveTabToOtherSide(id);
        });
        const host = el('div', { class: 'panel-body', role: 'tabpanel', hidden: true });
        this.columnEntries.set(id, { panel, tab, host, side });
        this.mountedPanels.push({ panel, host });
        tabs.append(tab);
        body.append(host);
      }
      // O botão de recolher, no fim da tira — 13/09/2026. O Humberto: *"podia
      // ter também botões para recolher quando não estivesse usando"*. Some o
      // conteúdo, fica a tira com os nomes, e a altura vai para o outro grupo.
      // O » — rodada 47, lote 1: as abas que não cabem numa fileira moram nele
      // (`tab-strip-model.ts`). Ele só aparece quando alguma aba não coube.
      const mais = el('button', {
        class: 'panel-tabs-mais', type: 'button', hidden: true, text: '»',
      }) as HTMLButtonElement;
      mais.addEventListener('click', () => this.openTabsMore(side, index, mais));
      tabs.append(mais);
      const recolher = el('button', {
        class: 'panel-group-fold', type: 'button',
      }) as HTMLButtonElement;
      recolher.addEventListener('click', () => this.toggleGroup(side, index));
      this.foldButtons[side][index] = recolher;
      tabs.append(recolher);

      // Fechar o grupo INTEIRO — 13/09/2026. Ele era um botão aqui na tira, e
      // saiu: 27 px de largura num espaço de 250 px fazem a tira quebrar em
      // duas linhas, e cada linha a mais tira 33 px de altura do painel. Foi
      // medido: a Prévia, que tinha acabado de passar na medição de altura,
      // voltou a falhar por causa dele.
      //
      // O gesto passou a ser o **botão direito na tira**, e, porque botão
      // direito é gesto escondido, ele tem uma porta visível obrigatória:
      // **Janela → Fechar o grupo**. A barra de baixo ensina o gesto na
      // primeira vez que alguém fecha um painel.
      tabs.addEventListener('contextmenu', (event) => {
        // Só no vão da tira: o botão direito EM CIMA de uma aba já move o
        // painel para a outra coluna, e roubar esse gesto seria trocar uma
        // função por outra sem avisar.
        if ((event.target as HTMLElement | null)?.closest('.panel-tab') !== null) return;
        event.preventDefault();
        this.closeGroupAt(side, index);
      });

      // Soltar a aba em cima da TIRA de um grupo é decidido pelo arrasto de
      // ponteiro (`beginPanelDrag`) — rodada 4, lote 1. A tira não escuta
      // mais o `drop` do navegador: um só jeito de arrastar, não dois.
      //
      // Puxar o VÃO da tira (o espaço à direita das abas) leva o GRUPO
      // inteiro — rodada 4, lote 5. É a barra do grupo do Photoshop.
      tabs.addEventListener('pointerdown', (event) => {
        const alvo = event.target as HTMLElement | null;
        if (alvo?.closest('.panel-tab') !== null || alvo?.closest('.panel-group-fold') !== null) return;
        if (ids.length === 0) return;
        this.beginPanelDrag(event, {
          kind: 'grupo', id: state.active[index] ?? ids[0]!, side, group: index, tabs: [...ids],
        });
      });

      const grupo = el('section', { class: 'panel-group' }, [tabs, body]);
      this.groupBoxes[side].push(grupo);
      children.push(grupo);
    });

    // A coluna em ícones — rodada 4, lote 2. O Photoshop: a setinha dupla no
    // topo da coluna a recolhe numa faixa de ícones; o ícone abre o painel ao
    // lado. A setinha mora numa faixa fina NO TOPO das duas colunas, e não na
    // tira de abas: na tela de fábrica a tira da direita já tem três linhas, e
    // um botão que pula de lugar conforme as abas é o que mais atrapalha quem
    // lê com dificuldade (`toggleSpot`, em `icon-columns.ts`).
    const emIcones = isIconic(this.icones, side);
    box.classList.toggle('is-icones', emIcones);
    const nomeSetinha = emIcones ? 'Expandir os painéis' : 'Recolher em ícones';
    const setinha = el('button', {
      class: 'panel-column-setinha', type: 'button', title: nomeSetinha, 'aria-label': nomeSetinha,
    }) as HTMLButtonElement;
    // A seta aponta para onde a coluna vai: para a parede ao recolher, para a
    // cena ao expandir.
    const paraParede = side === 'left' ? '«' : '»';
    const paraCena = side === 'left' ? '»' : '«';
    setinha.textContent = emIcones ? paraCena : paraParede;
    setinha.addEventListener('click', () => this.toggleIconColumn(side));
    const topo = el('div', { class: 'panel-column-topo' }, [setinha]);
    if (emIcones) {
      const faixa = el('div', { class: 'panel-icones', role: 'toolbar', 'aria-label': 'Painéis recolhidos' });
      let grupoAntes = -1;
      for (const slot of iconSlots(state)) {
        const panel = panels.find((item) => item.id === slot.id);
        if (panel === undefined) continue;
        if (grupoAntes !== -1 && slot.group !== grupoAntes) faixa.append(el('div', { class: 'panel-icones-sep' }));
        grupoAntes = slot.group;
        const aberto = this.icones.open?.side === side && this.icones.open.id === slot.id;
        const botao = el('button', {
          class: aberto ? 'panel-icone is-aberto' : 'panel-icone', type: 'button',
          title: panel.title, 'aria-label': panel.title, 'aria-pressed': aberto ? 'true' : 'false',
        }) as HTMLButtonElement;
        botao.dataset['panel'] = slot.id;
        // Regra 21: painel sem desenho escolhido mostra o NOME, nunca um palpite.
        const desenho = panelIcon(slot.id);
        if (desenho === null || !paintIcon(botao, desenho)) botao.textContent = panel.title.slice(0, 3);
        botao.addEventListener('click', () => this.clickPanelIcon(side, slot.id));
        faixa.append(botao);
      }
      children.push(faixa);
    }
    box.replaceChildren(topo, ...children);
  }

  /**
   * **Mover para a outra coluna** — o botão direito numa aba, e o menu Janela.
   *
   * A conta inteira é do `layout-model.ts`: a aba some de um lado, entra no fim
   * do último grupo do outro e fica à frente lá.
   */
  moveTabToOtherSide(id: string): void {
    const antes = sideOf(this.layout, id);
    if (antes === null) return;
    this.layout = moveToOtherColumn(this.layout, id);
    this.saveColumnState();
    this.buildPanels();
    const nome = this.columnEntries.get(id)?.panel.title ?? id;
    this.statusState.textContent = antes === 'left'
      ? `${nome} foi para a coluna da direita`
      : `${nome} foi para a coluna da esquerda`;
  }

  /** A alça de LARGURA entre uma coluna e a cena — lote 16. */
  private buildWidthGrip(side: Side): HTMLElement {
    const grip = el('div', {
      class: `panel-width-grip panel-width-${side}`, role: 'separator', tabindex: '0',
      'aria-orientation': 'vertical',
      'aria-label': side === 'left'
        ? 'Largura da coluna da esquerda. Arraste, ou use as setas.'
        : 'Largura da coluna da direita. Arraste, ou use as setas.',
      title: 'Arraste para mudar a largura',
    });
    grip.addEventListener('pointerdown', (event) => {
      if (this.widthDrag !== null) return;
      this.widthDrag = {
        pointerId: event.pointerId, startX: event.clientX, side,
        startWidth: this.layout.widths[side === 'left' ? 0 : 1],
      };
      try {
        grip.setPointerCapture(event.pointerId);
      } catch {
        // `pointerId` sintético não se captura; o arrasto segue pelos eventos.
      }
      event.preventDefault();
    });
    grip.addEventListener('pointermove', (event) => {
      const drag = this.widthDrag;
      if (drag === null || drag.pointerId !== event.pointerId) return;
      // A coluna da esquerda cresce para a DIREITA; a da direita, para a
      // esquerda. O sinal do arrasto é invertido num dos lados.
      const anda = event.clientX - drag.startX;
      const largura = drag.side === 'left' ? drag.startWidth + anda : drag.startWidth - anda;
      this.layout = setWidth(this.layout, drag.side, largura);
      this.applyWidths();
    });
    const fim = (event: PointerEvent): void => {
      if (this.widthDrag === null || this.widthDrag.pointerId !== event.pointerId) return;
      this.widthDrag = null;
      this.saveColumnState();
      for (const [, entry] of this.columnEntries) entry.panel.refresh({ kind: 'file' });
    };
    grip.addEventListener('pointerup', fim);
    grip.addEventListener('pointercancel', fim);
    grip.addEventListener('keydown', (event) => {
      const passo = event.key === 'ArrowLeft' ? -16 : event.key === 'ArrowRight' ? 16 : 0;
      if (passo === 0) return;
      event.preventDefault();
      const agora = this.layout.widths[side === 'left' ? 0 : 1];
      this.layout = setWidth(this.layout, side, side === 'left' ? agora + passo : agora - passo);
      this.applyWidths();
      this.saveColumnState();
    });
    return grip;
  }

  /** Escreve a largura de cada coluna na tela. */
  private applyWidths(): void {
    // Em ícones, a coluna é a faixa (40 px), e a largura dela fica guardada
    // para quando ela expandir — rodada 4, lote 2.
    this.leftColumn.style.flex = `0 0 ${columnWidth(this.icones, 'left', this.layout.widths[0])}px`;
    this.rightColumn.style.flex = `0 0 ${columnWidth(this.icones, 'right', this.layout.widths[1])}px`;
  }

  /** A alça entre os dois grupos de um lado: arrasta, ou anda com as setas. */
  private buildSplitGrip(side: Side): HTMLElement {
    const grip = el('div', {
      class: 'panel-split-grip', role: 'separator', tabindex: '0',
      'aria-orientation': 'horizontal',
      'aria-label': 'Divisão entre os dois grupos de painéis. Arraste, ou use as setas. Dois cliques voltam ao tamanho de fábrica.',
      title: 'Puxe para mudar a altura. Dois cliques voltam ao tamanho de fábrica',
    });
    grip.addEventListener('pointerdown', (event) => {
      if (this.splitDrag !== null) return;
      this.splitDrag = {
        pointerId: event.pointerId, startY: event.clientY, side,
        startSplit: columnOf(this.layout, side).split,
      };
      try {
        grip.setPointerCapture(event.pointerId);
      } catch {
        // Um `pointerId` sintético não pode ser capturado; o arrasto segue
        // pelos eventos do próprio elemento.
      }
      event.preventDefault();
    });
    grip.addEventListener('pointermove', (event) => {
      const drag = this.splitDrag;
      if (drag === null || drag.pointerId !== event.pointerId) return;
      const box = drag.side === 'left' ? this.leftColumn : this.rightColumn;
      const room = box.clientHeight;
      if (room <= 0) return;
      // Lote 52: nenhum dos dois grupos fica com menos de 80 px.
      this.writeSide(
        drag.side,
        setSplit(columnOf(this.layout, drag.side), resizeSplit(drag.startSplit, event.clientY - drag.startY, room)),
      );
      this.applySplit();
    });
    const end = (event: PointerEvent): void => {
      if (this.splitDrag === null || this.splitDrag.pointerId !== event.pointerId) return;
      this.splitDrag = null;
      this.saveSplits();
      for (const [, entry] of this.columnEntries) entry.panel.refresh({ kind: 'file' });
    };
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
    grip.addEventListener('keydown', (event) => {
      const step = event.key === 'ArrowUp' ? -0.04 : event.key === 'ArrowDown' ? 0.04 : 0;
      if (step === 0) return;
      event.preventDefault();
      // Tecla tratada uma vez: a seta da alça não anda também na linha do tempo.
      event.stopPropagation();
      const atual = columnOf(this.layout, side);
      this.writeSide(side, setSplit(atual, atual.split + step));
      this.applySplit();
      this.saveSplits();
    });
    // Lote 52: dois cliques devolvem a divisão de fábrica daquele lado. Desde
    // 13/09/2026 a de fábrica é a AUTOMÁTICA: os dois cliques devolvem a conta
    // ao programa, e é assim que se desfaz um arrasto de que a pessoa não
    // gostou sem ter de acertar o pixel de volta na mão.
    grip.addEventListener('dblclick', (event) => {
      event.preventDefault();
      this.writeSide(side, restoreAutoSplit(
        setSplit(columnOf(this.layout, side), defaultSplit(side)),
      ));
      this.applySplit();
      this.saveSplits();
      for (const [, entry] of this.columnEntries) entry.panel.refresh({ kind: 'file' });
    });
    return grip;
  }

  // -------------------------------------------------------------------------
  // A coluna em ícones — rodada 4, lote 2 (05/10/2026)
  // -------------------------------------------------------------------------

  /** Um valor guardado no navegador, ou `null` (aba anônima, teste). */
  private readKey(chave: string): string | null {
    try {
      return globalThis.localStorage?.getItem(chave) ?? null;
    } catch {
      return null;
    }
  }

  /** Guarda os dois interruptores das colunas no navegador. Nunca no `.bone`. */
  private saveIcons(): void {
    try {
      globalThis.localStorage?.setItem(ICONS_STORAGE_KEY, iconStateToSave(this.icones));
    } catch {
      // Aba anônima ou cota cheia: vale só nesta sessão.
    }
  }

  /** A coluna está em ícones? (para o menu e para a prova) */
  isIconColumn(side: Side): boolean {
    return isIconic(this.icones, side);
  }

  /** A setinha dupla de uma coluna: recolhe em ícones, ou expande. */
  toggleIconColumn(side: Side): void {
    this.icones = toggleIconic(this.icones, side);
    this.saveIcons();
    this.buildPanels();
    const lado = side === 'left' ? 'da esquerda' : 'da direita';
    this.statusState.textContent = isIconic(this.icones, side)
      ? `Coluna ${lado} em ícones. Clique num ícone para abrir o painel; a setinha expande`
      : `Coluna ${lado} expandida`;
  }

  /** **Janela → Arrumar → Recolher em ícone · Expandir**: as duas colunas de uma vez. */
  setIconColumns(iconic: boolean): void {
    this.icones = setAllIconic(this.icones, iconic);
    this.saveIcons();
    this.buildPanels();
    this.statusState.textContent = iconic
      ? 'Painéis em ícones. Clique num ícone para abrir o painel ao lado'
      : 'Painéis expandidos';
  }

  /** Os itens do menu, com o porquê do cinza. */
  iconMenuState(): { recolher: IconMenuItem; expandir: IconMenuItem } {
    return { recolher: canCollapseToIcons(this.icones), expandir: canExpand(this.icones) };
  }

  /** Clique num ícone: abre o painel ao lado; no mesmo, fecha; noutro, troca. */
  private clickPanelIcon(side: Side, id: string): void {
    this.icones = clickIcon(this.icones, side, id);
    this.buildPanels();
  }

  /**
   * O painel aberto pelo ícone, encostado na faixa, por cima da cena.
   *
   * É uma caixa como a do painel solto (barra com nome e `×`), mas não se
   * arrasta: ela pertence ao ícone. O `host` do painel muda de casa para cá,
   * como no solto. `Esc` fecha.
   */
  private buildFlyout(): void {
    this.pararVoo?.();
    this.pararVoo = null;
    const aberto = this.icones.open;
    if (aberto === null || !isIconic(this.icones, aberto.side)) return;
    const entry = this.columnEntries.get(aberto.id);
    const coluna = aberto.side === 'left' ? this.leftColumn : this.rightColumn;
    const icone = coluna.querySelector(`.panel-icone[data-panel="${aberto.id}"]`);
    if (entry === undefined || icone === null) {
      // O painel não está mais na coluna (fechado, solto): nada a abrir.
      this.icones = closeFlyout(this.icones);
      return;
    }
    const camada = this.floatLayer.getBoundingClientRect();
    const box = flyoutBox(
      aberto.side, icone.getBoundingClientRect().top - camada.top,
      this.layout.widths[aberto.side === 'left' ? 0 : 1],
      Math.round(camada.width), Math.round(camada.height),
    );
    const caixa = el('section', {
      class: 'panel-float panel-voo', role: 'dialog', 'aria-label': entry.panel.title,
    });
    caixa.style.left = `${box.x}px`;
    caixa.style.top = `${box.y}px`;
    caixa.style.width = `${box.w}px`;
    caixa.style.height = `${box.h}px`;
    const barra = el('header', { class: 'panel-float-bar' });
    barra.append(el('span', 'panel-float-nome', entry.panel.title));
    const fechar = el('button', {
      class: 'panel-float-x', type: 'button',
      title: `Fechar: ${entry.panel.title}`, 'aria-label': `Fechar: ${entry.panel.title}`,
    }) as HTMLButtonElement;
    const fecharVoo = (): void => {
      this.icones = closeFlyout(this.icones);
      this.buildPanels();
    };
    fechar.addEventListener('click', fecharVoo);
    barra.append(fechar);
    entry.host.hidden = false;
    caixa.append(barra, entry.host);
    this.floatLayer.append(caixa);
    const tecla = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape' || this.arrasto !== null) return;
      // Regra 12: o Esc fecha o painel do ícone e para aqui.
      event.stopPropagation();
      event.preventDefault();
      fecharVoo();
    };
    window.addEventListener('keydown', tecla, true);
    this.pararVoo = () => window.removeEventListener('keydown', tecla, true);
  }

  /**
   * Guarda a divisão no navegador — lote 52 — e, como sempre, no estado do
   * editor dentro do arquivo. Ao abrir, a do navegador ganha: é da máquina.
   */
  private saveSplits(): void {
    this.saveColumnState();
    try {
      globalThis.localStorage?.setItem(SPLIT_STORAGE_KEY, splitsToSave(this.layout));
    } catch {
      // Aba anônima ou cota cheia: fica só no arquivo, como antes.
    }
  }

  /**
   * A bancada guardada na máquina, ou o que o ARQUIVO ainda trouxer.
   *
   * O legado é lido **uma última vez**, e só quando não há nada na máquina:
   * assim ninguém perde a tela que já tem, e o campo morre sozinho na primeira
   * vez que a pessoa mexer em qualquer coisa. O bloco continua no arquivo dos
   * outros, intocado — apagar o que é de alguém sem ele pedir é mexer no
   * arquivo de alguém.
   */
  private readBench(chave: string): unknown {
    try {
      const cru = globalThis.localStorage?.getItem(BENCH_STORAGE_KEY) ?? null;
      if (cru !== null) {
        const valor = JSON.parse(cru) as Record<string, unknown>;
        if (valor !== null && typeof valor === 'object' && chave in valor) return valor[chave];
      }
    } catch {
      // Aba anônima, cota cheia ou lixo gravado: cai no legado do arquivo.
    }
    return (readEditorState(this.doc.file) as Record<string, unknown>)[chave];
  }

  /** Grava a bancada na máquina. O arquivo não é tocado. */
  private writeBench(chave: string, valor: unknown): void {
    try {
      const cru = globalThis.localStorage?.getItem(BENCH_STORAGE_KEY) ?? null;
      const atual = cru === null ? {} : JSON.parse(cru) as Record<string, unknown>;
      const proximo = atual !== null && typeof atual === 'object' ? atual : {};
      proximo[chave] = valor;
      globalThis.localStorage?.setItem(BENCH_STORAGE_KEY, JSON.stringify(proximo));
    } catch {
      // Sem onde guardar: a bancada vale só nesta sessão. O personagem não
      // paga por isso — é exatamente o que este conserto veio impedir.
    }
  }

  /** A divisão guardada no navegador, ou `null`. */
  private readSplits(): string | null {
    try {
      return globalThis.localStorage?.getItem(SPLIT_STORAGE_KEY) ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Cola a aba `id` no grupo `index` do lado `side`, na posição VISUAL onde a
   * mão largou — rodada 4, lote 1. Era o corpo do `drop` da tira.
   *
   * ONDE o dedo soltou, e não no fim da tira — 13/09/2026: até ali a aba caía
   * sempre no fim, e reordenar era impossível.
   */
  private colarAba(id: string, side: Side, index: number, visual: number): void {
    const de = sideOf(this.layout, id);
    if (de === null) return;
    // Arrastada do outro lado: primeiro ela atravessa, depois cai no grupo.
    let proximo = de === side ? this.layout : moveToOtherColumn(this.layout, id);
    const antes = columnOf(proximo, side);
    const coluna = moveTab(
      antes, id, index, insertionIndex(antes.groups[index] ?? [], id, visual),
    );
    proximo = side === 'left'
      ? { ...proximo, left: coluna }
      : { ...proximo, right: coluna };
    this.layout = proximo;
    this.saveColumnState();
    this.buildPanels();
    // Rodada 50, lote 4: "Painel Ordem colado" — o nome do painel pode ser feminino ou plural, o painel não.
    this.statusState.textContent = `Painel ${this.columnEntries.get(id)?.panel.title ?? id} colado neste grupo`;
  }

  // -------------------------------------------------------------------------
  // O arrasto de painel, por ponteiro — rodada 4, lote 1 (05/10/2026)
  // -------------------------------------------------------------------------

  /** As tiras e os corpos dos grupos, medidos agora — o que o `dropTarget` lê. */
  private stripInfos(): StripInfo[] {
    const saida: StripInfo[] = [];
    for (const side of ['left', 'right'] as const) {
      this.groupBoxes[side].forEach((grupo, index) => {
        if (grupo.hidden) return;
        const tira = grupo.querySelector('.panel-tabs');
        if (tira === null) return;
        const r = tira.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0) return;
        const corpo = grupo.querySelector('.panel-group-body') as HTMLElement | null;
        const c = corpo?.getBoundingClientRect();
        saida.push({
          side, group: index,
          strip: { left: r.left, right: r.right, top: r.top, bottom: r.bottom },
          body: corpo === null || corpo.hidden || c === undefined || c.height < 4
            ? null
            : { left: c.left, right: c.right, top: c.top, bottom: c.bottom },
          tabs: [...tira.querySelectorAll('.panel-tab')].map((aba) => aba.getBoundingClientRect()),
        });
      });
    }
    return saida;
  }

  /** A camada dos soltos na tela, e a cena dentro dela. */
  private dropArea(): DropArea {
    const r = this.floatLayer.getBoundingClientRect();
    return { layer: { left: r.left, right: r.right, top: r.top, bottom: r.bottom }, scene: this.snapArea() };
  }

  /**
   * A mão apertou numa aba ou na barra de um painel solto. Daqui até largar,
   * a janela inteira escuta o ponteiro: o arrasto atravessa a cena, e a cena
   * não pode ficar com ele.
   */
  private beginPanelDrag(event: PointerEvent, source: DragSource, grab?: Point): void {
    if (event.button !== 0 || this.arrasto !== null) return;
    const state = startDrag(source, event.clientX, event.clientY, grab);
    const mover = (e: PointerEvent): void => this.movePanelDrag(e.clientX, e.clientY);
    const largar = (e: PointerEvent): void => this.endPanelDrag(e.clientX, e.clientY);
    const cancelar = (): void => this.cancelPanelDrag();
    const tecla = (e: KeyboardEvent): void => {
      if (e.key !== 'Escape') return;
      // Regra 12: a tecla é tratada uma vez. O Esc do arrasto não desmarca a seleção.
      e.stopPropagation();
      e.preventDefault();
      this.cancelPanelDrag();
    };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', largar);
    window.addEventListener('pointercancel', cancelar);
    window.addEventListener('keydown', tecla, true);
    this.arrasto = {
      state,
      target: { kind: 'nada' },
      parar: () => {
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', largar);
        window.removeEventListener('pointercancel', cancelar);
        window.removeEventListener('keydown', tecla, true);
      },
    };
  }

  private movePanelDrag(x: number, y: number): void {
    const a = this.arrasto;
    if (a === null) return;
    a.state = moveDrag(a.state, x, y);
    if (!a.state.started) return;
    this.root.classList.add('is-arrastando-painel');
    a.target = dropTarget(a.state, this.stripInfos(), this.dropArea());
    const src = a.state.source;
    if (src.kind === 'solto') {
      // O painel solto ANDA com a mão, como no Photoshop; a sombra só aparece
      // quando ele vai colar numa quina.
      const caixa = this.floatBoxes.get(src.id);
      if (caixa !== undefined) {
        const box = a.target.kind === 'solto' ? a.target.box : shadowBox(a.state, this.dropArea()).box;
        caixa.classList.add('is-arrastando');
        caixa.style.left = `${box.x}px`;
        caixa.style.top = `${box.y}px`;
      }
    }
    // A sombra do painel inteiro aparece para a aba E para o grupo (lote 5):
    // os dois ainda estão na parede, e a sombra é a única coisa que anda.
    this.drawDrop(a.target, src.kind !== 'solto');
    const titulo = (id: string): string => this.columnEntries.get(id)?.panel.title ?? id;
    this.statusState.textContent = dragHint(
      src.kind === 'grupo' ? `o grupo ${src.tabs.map(titulo).join(', ')}` : `o painel ${titulo(src.id)}`, a.target,
    );
  }

  private endPanelDrag(x: number, y: number): void {
    const a = this.arrasto;
    if (a === null) return;
    a.state = moveDrag(a.state, x, y);
    const target = a.state.started ? dropTarget(a.state, this.stripInfos(), this.dropArea()) : a.target;
    const result = endDrag(a.state, target);
    this.stopPanelDrag();
    if (result.kind !== 'clique') {
      this.engolirClique = true;
      setTimeout(() => { this.engolirClique = false; }, 0);
    }
    this.applyDragResult(result, a.state.source);
  }

  /** `Esc`, ou o navegador tirou o ponteiro: nada muda, e o solto volta para onde estava. */
  private cancelPanelDrag(): void {
    const a = this.arrasto;
    if (a === null) return;
    this.stopPanelDrag();
    const src = a.state.source;
    if (src.kind === 'solto') {
      const caixa = this.floatBoxes.get(src.id);
      if (caixa !== undefined) {
        caixa.style.left = `${src.box.x}px`;
        caixa.style.top = `${src.box.y}px`;
      }
    }
    if (a.state.started) this.statusState.textContent = 'Arrasto cancelado';
  }

  private stopPanelDrag(): void {
    const a = this.arrasto;
    if (a === null) return;
    a.parar();
    this.arrasto = null;
    this.root.classList.remove('is-arrastando-painel');
    for (const caixa of this.floatBoxes.values()) caixa.classList.remove('is-arrastando');
    this.drawDrop({ kind: 'nada' }, false);
  }

  /**
   * O sinal enquanto a mão segura: a linha azul na tira, o contorno azul no
   * grupo, ou a sombra do painel onde ele vai ficar. `sombra` = a fonte é uma
   * aba (o painel ainda está na parede, e a sombra é a única coisa que anda).
   */
  private drawDrop(target: DropTarget, sombra: boolean): void {
    this.dropLinha?.remove();
    this.dropLinha = null;
    this.dropContorno?.remove();
    this.dropContorno = null;
    if (target.kind === 'tira') {
      if (target.line !== null) {
        const linha = el('div', { class: 'panel-drop-linha', 'aria-hidden': 'true' });
        linha.style.left = `${Math.round(target.line.x - 2)}px`;
        linha.style.top = `${Math.round(target.line.top)}px`;
        linha.style.height = `${Math.round(target.line.bottom - target.line.top)}px`;
        this.root.append(linha);
        this.dropLinha = linha;
      }
      const contorno = el('div', { class: 'panel-drop-contorno', 'aria-hidden': 'true' });
      contorno.style.left = `${Math.round(target.outline.left)}px`;
      contorno.style.top = `${Math.round(target.outline.top)}px`;
      contorno.style.width = `${Math.round(target.outline.right - target.outline.left)}px`;
      contorno.style.height = `${Math.round(target.outline.bottom - target.outline.top)}px`;
      this.root.append(contorno);
      this.dropContorno = contorno;
      this.showDropShadow(null, null);
      return;
    }
    if (target.kind === 'solto') {
      if (sombra) this.showDropShadow(target.box, target.snap);
      else this.showSnapShadow(target.box, target.snap);
      return;
    }
    this.showDropShadow(null, null);
  }

  /**
   * A sombra do painel inteiro, onde ele vai ficar se a mão largar — o
   * "painel vem junto" do Photoshop. Diferente da sombra da quina (que só
   * aparece colando), esta aparece sempre que a aba está fora da parede.
   */
  private showDropShadow(box: FloatBox | null, snap: FloatSnap | null): void {
    if (box === null) {
      this.showSnapShadow(null, null);
      return;
    }
    if (this.snapShadow === null) {
      this.snapShadow = el('div', { class: 'panel-float-sombra', 'aria-hidden': 'true' });
    }
    if (this.snapShadow.parentElement !== this.floatLayer) this.floatLayer.prepend(this.snapShadow);
    this.snapShadow.classList.add('is-painel');
    this.snapShadow.style.left = `${box.x}px`;
    this.snapShadow.style.top = `${box.y}px`;
    this.snapShadow.style.width = `${box.w}px`;
    this.snapShadow.style.height = `${box.h}px`;
    if (snap === null) delete this.snapShadow.dataset['quina'];
    else this.snapShadow.dataset['quina'] = snap;
  }

  /** O que o arrasto decidiu, feito. */
  private applyDragResult(result: DragResult, source: DragSource): void {
    switch (result.kind) {
      case 'clique':
        return;
      case 'nada':
        this.statusState.textContent = '';
        return;
      case 'colar':
        if (source.kind === 'solto') this.dockFloatingPanel(result.id, result.side, result.group, result.visual);
        else this.colarAba(result.id, result.side, result.group, result.visual);
        return;
      case 'soltar':
        this.soltarPainel(result.id, result.box, result.snap);
        return;
      case 'mover': {
        const caixa = this.floatBoxes.get(result.id);
        if (caixa === undefined) return;
        caixa.style.left = `${result.box.x}px`;
        caixa.style.top = `${result.box.y}px`;
        if (result.snap === null) delete caixa.dataset['quina'];
        else caixa.dataset['quina'] = result.snap;
        this.guardarFloat(result.id, caixa, result.snap);
        const nome = this.columnEntries.get(result.id)?.panel.title ?? result.id;
        this.statusState.textContent = result.snap === null ? '' : `Painel ${nome} colado ${SNAP_WORDS[result.snap]} da cena`;
        return;
      }
      // O grupo inteiro, puxado pelo vão da tira — rodada 4, lote 5.
      case 'colarGrupo':
        this.colarGrupo(result.from.side, result.from.group, result.side, result.group, result.visual);
        return;
      case 'soltarGrupo': {
        const antes = columnOf(this.layout, result.from.side);
        const nomes = (antes.groups[result.from.group] ?? []).map((id) => this.columnEntries.get(id)?.panel.title ?? id);
        const depois = floatGroup(antes, result.from.group, result.box);
        if (depois === antes) return;
        const frente = depois.floating[depois.floating.length - 1]!.id;
        this.writeSide(result.from.side, setFloatSnap(depois, frente, result.snap));
        this.saveColumnState();
        this.buildPanels();
        this.statusState.textContent = `Grupo solto: ${nomes.join(', ')}. Arraste a barra dele até uma tira de abas para colar de volta`;
        return;
      }
    }
  }

  /**
   * Cola as abas de um grupo inteiro noutra tira, na ordem, a partir da
   * posição da linha azul — rodada 4, lote 5.
   */
  private colarGrupo(fromSide: Side, fromGroup: number, side: Side, group: number, visual: number): void {
    const ids = [...(columnOf(this.layout, fromSide).groups[fromGroup] ?? [])];
    const frente = columnOf(this.layout, fromSide).active[fromGroup] ?? ids[0];
    let proximo = this.layout;
    ids.forEach((id, k) => {
      if (sideOf(proximo, id) !== side) proximo = moveToOtherColumn(proximo, id);
      const antes = columnOf(proximo, side);
      const coluna = moveTab(antes, id, group, insertionIndex(antes.groups[group] ?? [], id, visual + k));
      proximo = side === 'left' ? { ...proximo, left: coluna } : { ...proximo, right: coluna };
    });
    if (frente !== undefined) {
      const coluna = selectTab(columnOf(proximo, side), frente);
      proximo = side === 'left' ? { ...proximo, left: coluna } : { ...proximo, right: coluna };
    }
    this.layout = proximo;
    this.saveColumnState();
    this.buildPanels();
    this.statusState.textContent = `Grupo colado: ${ids.map((id) => this.columnEntries.get(id)?.panel.title ?? id).join(', ')}`;
  }

  /**
   * Fecha um painel pelo `×` da aba, ou pelo menu Janela.
   *
   * O painel não some do programa: ele sai da tira e continua escrito no menu
   * Janela, com o nome que está na aba. Essa lista é a porta de volta, e é o
   * que torna o fechar seguro — sem ela, fechar seria perder.
   */
  closePanelById(id: string): void {
    this.dockGroupHolding(id);
    const entry = this.columnEntries.get(id);
    if (entry === undefined) return;
    const antes = columnOf(this.layout, entry.side);
    const depois = closePanel(antes, id);
    if (depois === antes) {
      this.statusState.textContent = 'O último painel aberto não se fecha. Tab esconde as colunas inteiras';
      return;
    }
    this.writeSide(entry.side, depois);
    this.saveColumnState();
    this.buildPanels();
    // A primeira vez ensina o gesto do grupo; as seguintes só dizem a volta.
    // O botão direito é gesto escondido, e gesto escondido que ninguém conta
    // é gesto que não existe.
    const volta = `Janela → ${entry.panel.title} traz de volta`;
    if (this.ensinouFecharGrupo) {
      this.statusState.textContent = `Painel ${entry.panel.title} fechado. ${volta}`;
    } else {
      this.ensinouFecharGrupo = true;
      this.statusState.textContent = `Painel ${entry.panel.title} fechado. ${volta}. `
        + 'Para fechar o grupo inteiro: botão direito na tira, ou Janela → Arrumar → Fechar o grupo';
    }
  }

  /**
   * **Janela → Fechar o grupo** — a porta visível do gesto do botão direito.
   *
   * Fecha o grupo em uso, que é aquele em que a pessoa mexeu por último: é o
   * mesmo grupo que a divisão automática engorda, então é o que ela está
   * olhando. Sem coluna nenhuma em uso, não faz nada e diz por quê.
   */
  closeFocusedGroup(): void {
    for (const side of ladosPorUso(this.ladoEmUso)) {
      const coluna = columnOf(this.layout, side);
      const index = coluna.focus;
      if ((coluna.groups[index]?.length ?? 0) === 0) continue;
      this.closeGroupAt(side, index);
      return;
    }
    this.statusState.textContent = 'Não há grupo aberto para fechar';
  }

  /** Fecha um grupo inteiro: as abas somem juntas e voltam pelo menu Janela. */
  closeGroupAt(side: Side, index: number): void {
    const antes = columnOf(this.layout, side);
    const nomes = (antes.groups[index] ?? [])
      .map((id) => this.columnEntries.get(id)?.panel.title ?? id);
    const depois = closeGroup(antes, index);
    if (depois === antes) {
      this.statusState.textContent = 'Este é o último grupo aberto. Tab esconde as colunas inteiras';
      return;
    }
    this.writeSide(side, depois);
    this.saveColumnState();
    this.buildPanels();
    this.statusState.textContent = nomes.length === 0
      ? 'Grupo fechado'
      : `Fechados: ${nomes.join(', ')}. O menu Janela traz cada um de volta`;
  }

  /** Aquele painel está fechado, em qualquer uma das duas colunas? */
  isPanelHidden(id: string): boolean {
    return isPanelClosed(this.layout.left, id) || isPanelClosed(this.layout.right, id);
  }

  /**
   * Traz de volta um painel fechado, no lugar de onde ele saiu.
   *
   * Devolve `true` quando havia o que reabrir, para quem chamou saber se ainda
   * precisa trazer a aba à frente.
   */
  reopenPanelById(id: string): boolean {
    for (const side of ['left', 'right'] as const) {
      const antes = columnOf(this.layout, side);
      if (!isPanelClosed(antes, id)) continue;
      this.writeSide(side, reopenPanel(antes, id));
      this.saveColumnState();
      this.buildPanels();
      this.statusState.textContent = `Painel ${this.columnEntries.get(id)?.panel.title ?? id} de volta`;
      return true;
    }
    return false;
  }

  /** A área útil da camada dos flutuantes, em pixels. */
  private floatArea(): { w: number; h: number } {
    const r = this.floatLayer.getBoundingClientRect();
    return { w: Math.max(1, Math.round(r.width)), h: Math.max(1, Math.round(r.height)) };
  }

  /** A cena, nas coordenadas da camada dos flutuantes — para colar na quina. */
  private snapArea(): SnapArea {
    const camada = this.floatLayer.getBoundingClientRect();
    const cena = this.stageRow.getBoundingClientRect();
    return {
      x: Math.round(cena.left - camada.left), y: Math.round(cena.top - camada.top),
      w: Math.round(cena.width), h: Math.round(cena.height),
    };
  }

  /**
   * A **sombra** de onde o painel vai colar — degrau 11, lote 3 (C1).
   *
   * Sem ela o gesto vira adivinhação: a pessoa solta e descobre depois. `null`
   * tira a sombra (fora de toda zona, ou a mão soltou).
   */
  private showSnapShadow(box: FloatBox | null, snap: FloatSnap | null): void {
    if (box === null || snap === null) {
      this.snapShadow?.remove();
      this.snapShadow = null;
      return;
    }
    if (this.snapShadow === null) {
      this.snapShadow = el('div', { class: 'panel-float-sombra', 'aria-hidden': 'true' });
    }
    // Sempre a PRIMEIRA da camada: a sombra fica por baixo dos painéis.
    if (this.snapShadow.parentElement !== this.floatLayer) this.floatLayer.prepend(this.snapShadow);
    this.snapShadow.style.left = `${box.x}px`;
    this.snapShadow.style.top = `${box.y}px`;
    this.snapShadow.style.width = `${box.w}px`;
    this.snapShadow.style.height = `${box.h}px`;
    this.snapShadow.dataset['quina'] = snap;
  }

  /**
   * A cena mudou de tamanho (a janela, uma coluna, a faixa de baixo): quem
   * está colado numa quina VAI JUNTO. Só mexe na posição na tela; o estado
   * guardado já diz a quina, e é ela que vale ao reabrir.
   */
  private followSnaps(): void {
    const area = this.snapArea();
    const camada = this.floatArea();
    for (const side of ['left', 'right'] as const) {
      for (const item of columnOf(this.layout, side).floating) {
        const caixa = this.floatBoxes.get(item.id);
        if (caixa === undefined) continue;
        // Rodada 4, lote 3: a janela encolheu e o solto SEM quina também volta
        // para dentro — antes ele ficava onde estava, por cima da linha do
        // tempo ou fora da tela. A conta parte da caixa GUARDADA, e não da
        // desenhada: a janela que cresce de novo devolve o tamanho de antes.
        const guardada = { x: item.x, y: item.y, w: item.w, h: item.h };
        const box = this.drawnFloat(item, fitFloat(item.snap === undefined ? guardada : snappedBox(guardada, item.snap, area), camada.w, camada.h));
        caixa.style.left = `${box.x}px`;
        caixa.style.top = `${box.y}px`;
        caixa.style.width = `${box.w}px`;
        caixa.style.height = `${box.h}px`;
      }
    }
  }

  /**
   * Descola um painel e o põe na caixa que o arrasto decidiu — a sombra que a
   * mão viu é exatamente onde ele fica (rodada 4, lote 1). A caixa já vem
   * inteira dentro da camada e, perto de uma borda da cena, colada nela.
   */
  soltarPainel(id: string, box: FloatBox, snap: FloatSnap | null): void {
    const entry = this.columnEntries.get(id);
    if (entry === undefined) return;
    const antes = columnOf(this.layout, entry.side);
    if (groupOf(antes, id) === -1) return;
    this.showSnapShadow(null, null);
    this.writeSide(entry.side, setFloatSnap(floatPanel(antes, id, box), id, snap));
    this.saveColumnState();
    this.buildPanels();
    this.statusState.textContent = snap === null
      ? `Painel ${entry.panel.title} solto. Arraste a barra dele até uma tira de abas para colar de volta`
      : `Painel ${entry.panel.title} colado ${SNAP_WORDS[snap]} da cena`;
  }

  /**
   * **Janela → Arrumar → Soltar o painel da parede** — a porta de menu do
   * gesto de puxar a aba (rodada 4, lote 1). Solta o painel À FRENTE do grupo
   * em uso, no alto da cena, perto do meio. Sem painel na parede, diz por quê.
   */
  soltarPainelEmUso(): void {
    for (const side of ladosPorUso(this.ladoEmUso)) {
      const coluna = columnOf(this.layout, side);
      const id = coluna.active[coluna.focus] ?? coluna.groups.flat()[0];
      if (id === undefined || id === null) continue;
      const area = this.dropArea();
      const cena = this.snapArea();
      const largura = area.layer.right - area.layer.left;
      const altura = area.layer.bottom - area.layer.top;
      const box = fitFloat({
        x: cena.x + cena.w / 2 - FLOAT_DEFAULT_W / 2, y: cena.y + 40, w: FLOAT_DEFAULT_W, h: FLOAT_DEFAULT_H,
      }, largura, altura);
      this.soltarPainel(id, box, null);
      return;
    }
    this.statusState.textContent = 'Não há painel na parede para soltar';
  }

  /** Há algum painel na parede para o "Soltar o painel da parede"? */
  hasDockedPanel(): boolean {
    return [this.layout.left, this.layout.right].some((coluna) => coluna.groups.some((grupo) => grupo.length > 0));
  }

  /** Cola de volta na coluna um painel que estava flutuando. */
  dockFloatingPanel(id: string, side?: Side, group?: number, at?: number): void {
    for (const lado of ['left', 'right'] as const) {
      const antes = columnOf(this.layout, lado);
      if (!isPanelFloating(antes, id)) continue;
      if (side !== undefined && side !== lado) {
        // Colar do OUTRO lado: primeiro ele atravessa, e o `moveToOtherColumn`
        // cuida de tirar de lá e pôr aqui. O grupo solto atravessa aba por aba,
        // na ordem (rodada 4, lote 5).
        const abas = tabsOf(antes.floating.find((item) => item.id === id)!);
        const solto = dockPanel(antes, id);
        this.writeSide(lado, solto);
        abas.forEach((aba, k) => {
          this.layout = moveToOtherColumn(this.layout, aba);
          const destino = columnOf(this.layout, side);
          if (group !== undefined) {
            this.writeSide(side, moveTab(destino, aba, group, at === undefined ? undefined : at + k));
          }
        });
        this.writeSide(side, selectTab(columnOf(this.layout, side), id));
      } else {
        this.writeSide(lado, dockPanel(antes, id, group, at));
      }
      this.saveColumnState();
      this.buildPanels();
      this.statusState.textContent = `Painel ${this.columnEntries.get(id)?.panel.title ?? id} colado de volta`;
      return;
    }
  }

  /**
   * Desenha os painéis descolados, um por caixa.
   *
   * Cada um tem barra de título com o nome, um `×` que o fecha, e um canto de
   * baixo à direita para mudar o tamanho. A barra arrasta; soltar a barra em
   * cima de uma tira de abas COLA o painel naquele grupo, que é o gesto do
   * Photoshop ao contrário.
   */
  private buildFloating(panels: readonly Panel[]): void {
    this.floatLayer.replaceChildren();
    this.floatBoxes = new Map();
    for (const side of ['left', 'right'] as const) {
      const state = columnOf(this.layout, side);
      for (const item of state.floating) {
        // O painel descolado NÃO está em grupo nenhum, então `buildSide` não
        // passou por ele e não há entrada na coluna: ela nasce aqui. A aba
        // existe e fica fora do DOM — é ela que `isPanelOpen`, o menu Janela e
        // o `syncColumnTabs` leem, e sem ela o painel descolado sumiria do
        // menu, que é justamente a porta de volta.
        // Rodada 4, lote 5: o grupo solto tem várias abas, e TODAS ganham
        // entrada (o menu Janela as lê como abertas); só a da frente aparece.
        const entradas: Array<{ panel: Panel; tab: HTMLButtonElement; host: HTMLElement; side: Side }> = [];
        for (const abaId of tabsOf(item)) {
          const panel = panels.find((outro) => outro.id === abaId);
          if (panel === undefined) continue;
          let entrada = this.columnEntries.get(abaId);
          if (entrada === undefined) {
            const tab = el('button', {
              class: 'panel-tab', type: 'button', role: 'tab', 'aria-selected': 'true',
            }) as HTMLButtonElement;
            tab.append(el('span', 'panel-tab-nome', panel.title));
        // Rodada 47, lote 5b (notas do doc 86), nota 4: a aba diz o que os gestos dela fazem.
        tab.title = `${panel.title}: clique traz à frente; dois cliques recolhem o grupo; arraste para outro grupo; botão direito leva para a outra coluna`;
            const host = el('div', { class: 'panel-body', role: 'tabpanel' });
            entrada = { panel, tab, host, side };
            this.columnEntries.set(abaId, entrada);
            this.mountedPanels.push({ panel, host });
          }
          entradas.push(entrada);
        }
        const entry = this.columnEntries.get(item.id);
        if (entry === undefined) continue;
        const caixa = el('section', {
          class: 'panel-float', role: 'dialog', 'aria-label': entry.panel.title,
        });
        // Rodada 4, lote 3: inteiro dentro da camada. Um solto guardado por uma
        // versão de antes (que deixava pendurar) volta para dentro aqui.
        const solta = fitFloat(item, this.floatArea().w, this.floatArea().h);
        // Colado numa quina, ele SEGUE a quina: a cena mudou de tamanho, o
        // painel continua encostado — é o "se adapta" do Photoshop.
        const box = this.drawnFloat(item, item.snap === undefined ? solta : snappedBox(solta, item.snap, this.snapArea()));
        if (item.snap !== undefined) caixa.dataset['quina'] = item.snap;
        caixa.classList.toggle('is-recolhido', item.recolhido === true);
        caixa.style.left = `${box.x}px`;
        caixa.style.top = `${box.y}px`;
        caixa.style.width = `${box.w}px`;
        caixa.style.height = `${box.h}px`;

        const barra = el('header', { class: 'panel-float-bar' });
        if (entradas.length > 1) {
          // O grupo solto: as abas dele na barra, como no Photoshop. Clicar
          // traz à frente; a barra inteira continua arrastando o grupo.
          for (const entrada of entradas) {
            const frente = entrada === entry;
            const aba = el('button', {
              class: frente ? 'panel-float-aba is-active' : 'panel-float-aba', type: 'button',
              title: entrada.panel.title, 'aria-pressed': frente ? 'true' : 'false',
            }, entrada.panel.title) as HTMLButtonElement;
            aba.addEventListener('click', () => this.selectFloatingTab(side, entrada.panel.id));
            barra.append(aba);
          }
        } else {
          barra.append(el('span', 'panel-float-nome', entry.panel.title));
        }
        const nomeFechar = entradas.length > 1 ? `Fechar o grupo: ${entradas.map((e) => e.panel.title).join(', ')}` : `Fechar: ${entry.panel.title}`;
        const fechar = el('button', {
          class: 'panel-float-x', type: 'button', title: nomeFechar, 'aria-label': nomeFechar,
        }) as HTMLButtonElement;
        fechar.addEventListener('click', () => this.closeFloating(item.id));
        barra.append(fechar);
        caixa.append(barra);

        // O painel MUDA DE CASA: o mesmo `host` que estava na coluna vem para
        // cá. Remontar o painel o faria perder a seleção e a rolagem — e um
        // painel que se esquece do que estava aberto é pior que um que não
        // descola.
        for (const entrada of entradas) {
          entrada.host.hidden = entrada !== entry;
          caixa.append(entrada.host);
        }

        const canto = el('div', {
          class: 'panel-float-canto', title: 'Arraste para mudar o tamanho',
        });
        caixa.append(canto);

        this.dragFloatBar(item.id, caixa, barra);
        // Dois cliques na barra: recolhe até ela, ou devolve — rodada 4, lote 4.
        barra.addEventListener('dblclick', (event) => {
          if ((event.target as HTMLElement | null)?.closest('.panel-float-x') !== null) return;
          this.toggleFloatFolded(item.id);
        });
        this.resizeFloat(item.id, caixa, canto);
        this.floatLayer.append(caixa);
        this.floatBoxes.set(item.id, caixa);
      }
    }
  }

  /**
   * A caixa que se DESENHA de um solto: a inteira, ou só a barra quando ele
   * está recolhido. Colado na borda de baixo, a barra fica no chão (e não no
   * meio do ar, onde estaria o topo da caixa inteira).
   */
  private drawnFloat(item: ColumnState['floating'][number], box: FloatBox): FloatBox {
    if (item.recolhido !== true) return box;
    const barra = drawnFloatBox(box, true);
    return item.snap !== undefined && item.snap.includes('s') ? { ...barra, y: box.y + box.h - barra.h } : barra;
  }

  /** Fecha um painel que está flutuando: ele vai para a lista do menu Janela. */
  private closeFloating(id: string): void {
    for (const side of ['left', 'right'] as const) {
      const antes = columnOf(this.layout, side);
      if (!isPanelFloating(antes, id)) continue;
      if (openPanels(antes).length <= 1 && openPanels(columnOf(this.layout, side === 'left' ? 'right' : 'left')).length === 0) {
        this.statusState.textContent = 'O último painel aberto não se fecha. Tab esconde as colunas inteiras';
        return;
      }
      // Cola de volta primeiro, e fecha em seguida: assim o `closed` guarda o
      // lugar na coluna, e o menu Janela devolve o painel encostado, que é
      // onde ele estava antes de tudo. O grupo solto fecha INTEIRO (rodada 4,
      // lote 5), aba por aba; o último painel aberto do programa fica.
      const abas = tabsOf(antes.floating.find((item) => item.id === id)!);
      let colado = dockPanel(antes, id);
      for (const aba of abas) colado = closePanel(colado, aba);
      this.writeSide(side, colado);
      this.saveColumnState();
      this.buildPanels();
      const nomes = abas.map((aba) => this.columnEntries.get(aba)?.panel.title ?? aba);
      this.statusState.textContent = nomes.length === 1
        ? `Painel ${nomes[0]} fechado. Janela → ${nomes[0]} traz de volta`
        : `Fechados: ${nomes.join(', ')}. O menu Janela traz cada um de volta`;
      return;
    }
  }

  /**
   * Arrastar a barra de título: move o painel, ou o cola numa tira — pelo
   * MESMO arrasto da aba (rodada 4, lote 1), com a mesma linha azul. A régua
   * do Diretor: o que se solta por um gesto cola de volta pelo mesmo gesto.
   */
  private dragFloatBar(id: string, caixa: HTMLElement, barra: HTMLElement): void {
    barra.addEventListener('pointerdown', (event) => {
      if ((event.target as HTMLElement | null)?.closest('.panel-float-x') !== null) return;
      const box = { x: caixa.offsetLeft, y: caixa.offsetTop, w: caixa.offsetWidth, h: caixa.offsetHeight };
      const r = caixa.getBoundingClientRect();
      this.beginPanelDrag(event, { kind: 'solto', id, box }, { x: event.clientX - r.left, y: event.clientY - r.top });
    });
  }

  /** O canto de baixo à direita: muda o tamanho, sempre dentro dos limites. */
  private resizeFloat(id: string, caixa: HTMLElement, canto: HTMLElement): void {
    let de: { x: number; y: number; w: number; h: number } | null = null;
    // Rodada 4, consertos (05/10/2026): o canto escutava o ponteiro só em cima
    // dele (16 px) e confiava na captura do ponteiro, que não segura em todo
    // mouse. Num arrasto rápido o ponteiro saía do canto no primeiro passo e o
    // painel parava de crescer (conferência da rodada 24: "cresce 38 px e
    // para"). Agora, enquanto a mão segura, quem escuta é a JANELA — como no
    // arrasto de painel do lote 1 — e ela larga no `pointerup`, no
    // `pointercancel` e quando a janela perde o foco (senão o canto ficaria
    // grudado na mão).
    const mover = (event: PointerEvent): void => {
      if (de === null) return;
      const area = this.floatArea();
      // Rodada 4, lote 3: o canto não leva o painel para fora da área (era o
      // `clampFloat`, que só guardava 48 px à vista) nem o faz pular de lugar.
      const box = resizeInside({
        x: caixa.offsetLeft,
        y: caixa.offsetTop,
        w: Math.max(FLOAT_MIN_W, de.w + (event.clientX - de.x)),
        h: Math.max(FLOAT_MIN_H, de.h + (event.clientY - de.y)),
      }, area.w, area.h);
      caixa.style.left = `${box.x}px`;
      caixa.style.top = `${box.y}px`;
      caixa.style.width = `${box.w}px`;
      caixa.style.height = `${box.h}px`;
    };
    const largar = (): void => {
      window.removeEventListener('pointermove', mover);
      window.removeEventListener('pointerup', largar);
      window.removeEventListener('pointercancel', largar);
      window.removeEventListener('blur', largar);
      if (de === null) return;
      de = null;
      this.guardarFloat(id, caixa);
    };
    canto.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || de !== null) return;
      event.preventDefault();
      de = { x: event.clientX, y: event.clientY, w: caixa.offsetWidth, h: caixa.offsetHeight };
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', largar);
      window.addEventListener('pointercancel', largar);
      window.addEventListener('blur', largar);
    });
  }

  /** Grava a caixa de um flutuante no estado do editor. */
  private guardarFloat(id: string, caixa: HTMLElement, snap?: FloatSnap | null): void {
    const area = this.floatArea();
    for (const side of ['left', 'right'] as const) {
      const antes = columnOf(this.layout, side);
      if (!isPanelFloating(antes, id)) continue;
      // Recolhido, a caixa desenhada é só a barra: a altura guardada é a de
      // antes, e é ela que volta quando ele abrir — rodada 4, lote 4.
      const guardado = antes.floating.find((item) => item.id === id);
      const altura = guardado?.recolhido === true ? guardado.h : caixa.offsetHeight;
      const comCaixa = setFloatBox(antes, id, {
        x: caixa.offsetLeft, y: caixa.offsetTop, w: caixa.offsetWidth, h: altura,
      }, area.w, area.h);
      // `snap` ausente = mudou só o tamanho: a quina guardada continua.
      this.writeSide(side, snap === undefined ? comCaixa : setFloatSnap(comCaixa, id, snap));
      this.saveColumnState();
      return;
    }
  }

  /** Troca a coluna de um lado, sem mexer no outro. */
  private writeSide(side: Side, column: ColumnState): void {
    this.layout = side === 'left'
      ? { ...this.layout, left: column }
      : { ...this.layout, right: column };
  }

  /**
   * Dá a cada grupo, dos dois lados, a sua fatia de altura — e recolhe o que
   * está recolhido.
   *
   * A conta inteira é do `groupShares`, em `panel-groups.ts`: aqui só se
   * escreve o `flex`. `null` é o grupo recolhido, que não estica nem encolhe:
   * ele fica com a altura da tira de abas e mais nada.
   */
  private applySplit(): void {
    for (const side of ['left', 'right'] as const) {
      const state = columnOf(this.layout, side);
      const fatias = groupShares(state);
      this.groupBoxes[side].forEach((box, index) => {
        const fatia = fatias[index];
        const dobrado = fatia === null;
        // Grupo VAZIO sai da tela inteiro. Sem isto sobrava a tira com os dois
        // botões — 33 px de nada, medidos em 13/09/2026 — e uma tira sem aba
        // nenhuma não é um painel recolhido: é um painel que não está ali.
        // Ele volta sozinho quando um painel seu volta pelo menu Janela.
        const vazio = (state.groups[index]?.length ?? 0) === 0;
        box.hidden = vazio;
        box.style.flex = dobrado ? '0 0 auto' : `${fatia} 1 0`;
        box.classList.toggle('is-recolhido', dobrado && !vazio);
        const corpo = box.querySelector('.panel-group-body');
        if (corpo !== null) (corpo as HTMLElement).hidden = dobrado;
        const botao = this.foldButtons[side][index];
        if (botao !== undefined) {
          const nomes = state.groups[index]
            ?.map((id) => this.columnEntries.get(id)?.panel.title ?? id).join(', ') ?? '';
          botao.textContent = dobrado ? '▸' : '▾';
          // Rodada 47, lote 2 (decisão do Diretor sobre o C2 do doc 68): em 720
          // a ficha vence e a Árvore fica com o que sobra; recolher o grupo
          // devolve a altura ao outro — e a dica diz para quem.
          const outros = state.groups.filter((_, i) => i !== index).flat()
            .map((id) => this.columnEntries.get(id)?.panel.title ?? id).join(', ');
          const paraQuem = outros === '' ? '' : `. A altura vai para ${outros}`;
          botao.title = dobrado ? `Abrir: ${nomes}` : `Recolher: ${nomes}${paraQuem}`;
          botao.setAttribute('aria-label', botao.title);
          botao.setAttribute('aria-expanded', dobrado ? 'false' : 'true');
        }

      });
    }
    // Rodada 17, K1b: a aba à frente mudou; o chão da coluna (e a altura dos
    // Detalhes abertos) é refeito — antes do chão do Propriedades, que fecha.
    if (this.dockView?.open) this.applyDockHeight();
    this.applyPropsFloor();
  }

  /**
   * O chão do Propriedades — rodada 4, lote 9 (05/10/2026), passado pela
   * rodada 23 (defeito #4 do `07`; K17 e J17 da fila).
   *
   * A divisão da coluna é uma FRAÇÃO da altura: a linha do tempo abria, a
   * coluna encolhia, e o Propriedades encolhia junto até mostrar só X e Y.
   * Agora o grupo em que ele está à frente tem chão — a tira e a ficha rápida
   * inteira — e quem cede é o outro grupo da mesma coluna, até o mínimo dele.
   * A cena e a linha do tempo não cedem nada. A decisão é do `planColumn`
   * (`props-floor.ts`); aqui ela vira um `min-height`, que também segura a
   * alça arrastada à mão. Refeito a cada mudança de altura da coluna.
   */
  private applyPropsFloor(): void {
    for (const side of ['left', 'right'] as const) {
      const state = columnOf(this.layout, side);
      const caixas = this.groupBoxes[side];
      for (const caixa of caixas) caixa.style.minHeight = '';
      const coluna = side === 'left' ? this.leftColumn : this.rightColumn;
      if (coluna.hidden || isIconic(this.icones, side) || caixas.length !== 2) continue;
      // Rodada 17, K13: a lista de Animações também tem chão; o Propriedades
      // vence quando os dois estão à frente na mesma coluna.
      // O chão das Animações só vale com os Detalhes ABERTOS: é quando a coluna
      // encolhe (K13). Fechados, a divisão é a de sempre, e as Imagens e a
      // Prévia de cima não perdem altura por isso (medido: 81 de 90 ficaria 79).
      const dono = floorGroup(state.active, (index) => isCollapsed(state, index), this.dockView.open);
      if (dono === null) continue;
      const g = dono.group;
      const outro = caixas[g === 0 ? 1 : 0]!;
      // O outro grupo vazio ou recolhido já deixa a coluna toda para ele.
      if (outro.hidden || outro.classList.contains('is-recolhido')) continue;
      const topo = coluna.querySelector('.panel-column-topo') as HTMLElement | null;
      const alca = coluna.querySelector('.panel-split-grip') as HTMLElement | null;
      const room = coluna.clientHeight - (topo?.offsetHeight ?? 0);
      if (room <= 0) continue;
      const precisa = dono.panel === 'propriedades'
        ? this.propsNeedNow(caixas[g]!) : dono.panel === 'malha' ? this.meshNeedNow(caixas[g]!) : this.animNeedNow(caixas[g]!);
      const tiraDoOutro = (outro.querySelector('.panel-tabs') as HTMLElement | null)?.offsetHeight ?? 0;
      const minimoDoOutro = dono.panel === 'propriedades' ? GROUP_MIN_PX : Math.max(GROUP_MIN_PX, tiraDoOutro);
      const plano = planColumn({
        room,
        grip: alca?.offsetHeight ?? SPLIT_GRIP_H,
        wanted: [caixas[0]!.offsetHeight, caixas[1]!.offsetHeight],
        propsGroup: g,
        need: dono.panel === 'animacoes' ? animFloorCap(precisa.chao, room, alca?.offsetHeight ?? SPLIT_GRIP_H) : precisa.chao,
        // O mínimo do outro é o do modelo (`GROUP_MIN_PX`, 80): a tira e uma
        // linha. O CSS dá 90 a todo grupo; só aqui, cedendo, ele desce a 80 —
        // medido em 1280×720, os 10 px são o que faz o Ângulo de uma IMAGEM
        // caber (ele terminava 2 px abaixo do fim do painel).
        //
        // Rodada 17, K13: quando quem tem chão são as Animações, a tira de abas
        // do outro grupo fica inteira (a das Imagens tem três linhas, 97 px, e
        // em 1280×720 os 80 cortavam o nome das abas).
        otherMin: minimoDoOutro,
      });
      if (plano.yielded > 0) {
        caixas[g]!.style.minHeight = `${plano.heights[g]}px`;
        outro.style.minHeight = `${minimoDoOutro}px`;
      }
      // O aviso fala da ficha que ESTÁ na tela (medida), e não da de fábrica:
      // com um osso escolhido a ficha cabe, e dizer "faltam" seria mentir
      // (regra 21). Visto na foto de 1280×720.
      // A lista de Animações que não coube só rola: ela é uma lista, e o aviso
      // da ficha falaria de outra coisa.
      if (dono.panel !== 'propriedades') continue;
      const corte = precisa.medida === null ? 0 : Math.max(0, precisa.medida - plano.heights[g]);
      const aviso = cutNotice({ ...plano, cut: corte });
      if (aviso !== '' && corte !== this.ultimoCorte) this.statusState.textContent = aviso;
      this.ultimoCorte = corte;
    }
  }

  /** O que faltou da ficha na última conta: o aviso sai uma vez, não a cada quadro. */
  private ultimoCorte = 0;

  /**
   * O chão de agora da lista de Animações — rodada 17, K13: a tira, a cabeça
   * do painel e três linhas da lista, MEDIDAS; sem lista na tela, o de
   * fábrica (`animListNeed()`).
   */
  private animNeedNow(grupo: HTMLElement): { chao: number; medida: number | null } {
    const tira = grupo.querySelector('.panel-tabs') as HTMLElement | null;
    const corpo = grupo.querySelector('.panel-group-body') as HTMLElement | null;
    const linhas = [...grupo.querySelectorAll('.anim-item:not(.anim-item-entidade):not(.anim-item-fora)')];
    const fabrica = animListNeed(ANIM_LIST_ROWS, tira?.offsetHeight ?? TAB_STRIP_H);
    const ultima = linhas[Math.min(ANIM_LIST_ROWS, linhas.length) - 1];
    if (corpo === null || ultima === undefined) return { chao: fabrica, medida: null };
    const rolante = ultima.closest('.painel-corpo') as HTMLElement | null;
    const medida = Math.ceil((tira?.offsetHeight ?? 0)
      + ultima.getBoundingClientRect().bottom - corpo.getBoundingClientRect().top + (rolante?.scrollTop ?? 0));
    return { chao: medida, medida };
  }

  /**
   * O chão de agora da Malha — rodada 47, lote 6 (nota 3 do doc 87): a tira e
   * o conteúdo inteiro do painel, medido. Sem painel na tela, nenhum chão.
   */
  private meshNeedNow(grupo: HTMLElement): { chao: number; medida: number | null } {
    const tira = grupo.querySelector('.panel-tabs') as HTMLElement | null;
    const corpo = [...grupo.querySelectorAll('.malha-corpo')].find((c) => (c as HTMLElement).offsetParent !== null) as HTMLElement | undefined;
    if (corpo === undefined) return { chao: 0, medida: null };
    const medida = Math.ceil((tira?.offsetHeight ?? TAB_STRIP_H) + corpo.scrollHeight);
    return { chao: medida, medida };
  }

  /**
   * O chão de agora: a tira de abas e a ficha rápida MEDIDA, ou o de fábrica
   * (`propsNeed()`, a ficha de imagem), o que for maior. O de fábrica vale
   * sempre, para o painel não pular de altura quando a seleção muda.
   */
  private propsNeedNow(grupo: HTMLElement): { chao: number; medida: number | null } {
    const tira = grupo.querySelector('.panel-tabs') as HTMLElement | null;
    const corpo = grupo.querySelector('.panel-group-body') as HTMLElement | null;
    const ficha = grupo.querySelector('.ficha') as HTMLElement | null;
    const fabrica = propsNeed(QUICK_SHEET_IMAGE, tira?.offsetHeight ?? TAB_STRIP_H);
    if (corpo === null || ficha === null) return { chao: fabrica, medida: null };
    const rolante = ficha.closest('.painel-corpo') as HTMLElement | null;
    const medida = Math.ceil((tira?.offsetHeight ?? 0)
      + ficha.getBoundingClientRect().bottom - corpo.getBoundingClientRect().top + (rolante?.scrollTop ?? 0));
    return { chao: Math.max(fabrica, medida), medida };
  }

  /**
   * Recolhe ou devolve um grupo, e diz na barra de baixo o que aconteceu.
   *
   * Recolher o último grupo aberto é recusado pelo modelo, e aqui isso vira
   * uma frase em vez de um botão que não faz nada: quem quer a tela inteira
   * tem o `Tab`.
   */
  /** Clique numa aba de um grupo solto: ela vem à frente — rodada 4, lote 5. */
  private selectFloatingTab(side: Side, id: string): void {
    const antes = columnOf(this.layout, side);
    const depois = selectFloatTab(antes, id);
    if (depois === antes) return;
    this.writeSide(side, depois);
    this.saveColumnState();
    this.buildPanels();
  }

  /**
   * O painel está atrás, num grupo solto? Então o grupo volta para a coluna
   * antes de qualquer coisa — o menu Janela age sobre ele como sempre agiu.
   */
  private dockGroupHolding(id: string): void {
    for (const side of ['left', 'right'] as const) {
      const coluna = columnOf(this.layout, side);
      const dono = floatHolding(coluna, id);
      if (dono === null || tabsOf(dono).length < 2) continue;
      this.writeSide(side, dockPanel(coluna, dono.id));
      this.saveColumnState();
      this.buildPanels();
      return;
    }
  }

  /** O grupo que o primeiro clique de um par acabou de reabrir. */
  private reabertoPorClique: string | null = null;

  /** Dois cliques numa aba — rodada 4, lote 4. A decisão é do `tabDoubleClick`. */
  private tabDoubleClicked(side: Side, id: string): void {
    if (this.reabertoPorClique === id) {
      this.reabertoPorClique = null;
      return;
    }
    const antes = columnOf(this.layout, side);
    const r = tabDoubleClick(antes, id, this.columnEntries.get(id)?.panel.title ?? id);
    if (r.notice !== '') this.statusState.textContent = r.notice;
    if (r.state === antes) return;
    this.writeSide(side, r.state);
    this.applySplit();
    this.saveColumnState();
    for (const [, entry] of this.columnEntries) entry.panel.refresh({ kind: 'file' });
  }

  /** Dois cliques na barra de um painel solto: recolhe até a barra, ou devolve. */
  private toggleFloatFolded(id: string): void {
    for (const side of ['left', 'right'] as const) {
      const antes = columnOf(this.layout, side);
      if (!isPanelFloating(antes, id)) continue;
      const depois = toggleFloatFold(antes, id);
      this.writeSide(side, depois);
      this.saveColumnState();
      this.buildPanels();
      const nome = this.columnEntries.get(id)?.panel.title ?? id;
      this.statusState.textContent = isFloatFolded(depois, id)
        ? `${nome} recolhido. Dois cliques na barra abrem de novo`
        : `${nome} aberto`;
      return;
    }
  }

  toggleGroup(side: Side, index: number): void {
    const antes = columnOf(this.layout, side);
    const depois = toggleCollapsed(antes, index);
    if (depois === antes) {
      this.statusState.textContent = 'O último painel aberto não se recolhe. Tab esconde as colunas inteiras';
      return;
    }
    this.writeSide(side, depois);
    this.applySplit();
    this.saveColumnState();
    const nomes = depois.groups[index]
      ?.map((id) => this.columnEntries.get(id)?.panel.title ?? id).join(', ') ?? '';
    this.statusState.textContent = isCollapsed(depois, index)
      ? `Grupo recolhido (${nomes}). O espaço foi para o outro painel`
      : `Grupo de volta (${nomes})`;
    // Os painéis mediram zero enquanto estavam recolhidos; peça o desenho.
    for (const [, entry] of this.columnEntries) entry.panel.refresh({ kind: 'file' });
  }

  /**
   * Esconde ou mostra as colunas, os painéis soltos e a faixa de baixo — o
   * `Tab` (tudo) e o `Shift+Tab` (só as colunas e os soltos; a linha do
   * tempo fica). Rodada 4, lote 6: a decisão é do `hide-panels.ts`.
   */
  private applyHidden(): void {
    const modo = this.hideMode;
    const semColunas = !columnsShown(modo);
    this.leftColumn.hidden = semColunas;
    this.rightColumn.hidden = semColunas;
    // Os soltos somem junto, como no Photoshop.
    this.floatLayer.hidden = semColunas;
    for (const grip of this.root.querySelectorAll('.panel-width-grip')) {
      // A coluna em ícones não tem largura para puxar: a alça some com ela.
      const lado: Side = grip.classList.contains('panel-width-left') ? 'left' : 'right';
      (grip as HTMLElement).hidden = semColunas || isIconic(this.icones, lado);
    }
    this.dock.hidden = !dockShown(modo) || this.dockEntries.size === 0;
    this.dockGrip.hidden = this.dock.hidden;
  }

  /** O `Shift+Tab` de agora. Da sessão: não se grava (`hide-panels.ts`). */
  private colunasEscondidas = false;

  /** O que está escondido agora: nada, tudo (`Tab`), ou só as colunas (`Shift+Tab`). */
  get hideMode(): HideMode {
    if (this.layout.hidden) return 'tudo';
    return this.colunasEscondidas ? 'colunas' : 'nada';
  }

  /** Vai para um modo, e diz no rodapé o que sumiu e como voltar. */
  private setHideMode(modo: HideMode): void {
    this.layout = { ...this.layout, hidden: hiddenToSave(modo) };
    this.colunasEscondidas = modo === 'colunas';
    this.applyHidden();
    this.saveColumnState();
    this.statusState.textContent = modo === 'tudo' ? 'Painéis escondidos. Tab traz de volta' : hideNotice(modo);
    // Os painéis mediram zero enquanto estavam escondidos; peça o desenho.
    if (modo === 'nada') {
      for (const [, entry] of this.columnEntries) entry.panel.refresh({ kind: 'file' });
      for (const [, entry] of this.dockEntries) entry.panel.refresh({ kind: 'file' });
    }
  }

  /**
   * `Tab`: a cena inteira, e de volta — item 19.
   *
   * É o `F9` do Spine e o `Tab` do Blender. Somem as DUAS colunas e a faixa
   * de baixo, e o desenho fica com a janela toda — que é o que se quer na hora
   * de olhar a pose, e não de mexer nela. Com algo já escondido (inclusive
   * pelo `Shift+Tab`), mostra tudo.
   */
  toggleChrome(): void {
    this.setHideMode(pressTab(this.hideMode));
  }

  /**
   * `Shift+Tab` — rodada 4, lote 6. O Photoshop: esconde os painéis e deixa as
   * ferramentas. Aqui some a coluna e os soltos, e a linha do tempo fica.
   */
  toggleColumnsOnly(): void {
    this.setHideMode(pressShiftTab(this.hideMode));
  }

  /** Troca o tema, grava a preferência e diz na barra de baixo o que mudou. */
  useTheme(name: ThemeName): void {
    setPrefs({ theme: name });
    setTheme(name);
    this.statusState.textContent = name === 'escuro' ? 'Tema escuro' : 'Tema claro';
  }

  /** `true` quando as colunas e a faixa estão escondidas (o `Tab`). */
  get chromeHidden(): boolean {
    return this.layout.hidden;
  }

  /** `true` quando só as colunas estão escondidas (o `Shift+Tab`). */
  get columnsOnlyHidden(): boolean {
    return this.hideMode === 'colunas';
  }

  /** Em que lado uma aba está — para o menu Janela e para os testes. */
  sideOfPanel(id: string): Side | null {
    return sideOf(this.layout, id);
  }

  /** A largura de cada coluna agora, em pixels. Para os testes. */
  get columnWidths(): readonly [number, number] {
    return this.layout.widths;
  }

  /**
   * "Janela → Mover painel para a outra coluna": pergunta qual, e move.
   *
   * O botão direito na aba faz o mesmo sem perguntar. Este item existe porque
   * um gesto que só se descobre por acaso é um gesto que a maior parte das
   * pessoas nunca descobre.
   */
  async askMovePanel(): Promise<void> {
    const escolhas = [...this.columnEntries.entries()].map(([id, entry]) => ({
      id,
      label: entry.panel.title,
      aside: entry.side === 'left' ? 'está na esquerda' : 'está na direita',
      hint: entry.side === 'left' ? 'vai para a direita' : 'vai para a esquerda',
    }));
    if (escolhas.length === 0) return;
    const escolhido = await askPick({
      title: 'Mover painel para a outra coluna',
      placeholder: 'Nome do painel',
      search: (text) => {
        const alvo = text.trim().toLowerCase();
        return alvo === '' ? escolhas : escolhas.filter((e) => e.label.toLowerCase().includes(alvo));
      },
    });
    if (escolhido === null) return;
    this.moveTabToOtherSide(escolhido);
  }

  /** Traz uma aba da coluna para a frente do grupo dela. */
  showColumnPanel(id: string): void {
    this.dockGroupHolding(id);
    const entry = this.columnEntries.get(id);
    if (entry === undefined) return;
    if (this.hideMode !== 'nada') this.setHideMode('nada');
    // Trazer uma aba à frente (pelo menu Janela também) põe a mão naquele lado.
    this.ladoEmUso = entry.side;
    this.writeSide(entry.side, selectTab(columnOf(this.layout, entry.side), id));
    this.saveColumnState();
    this.syncColumnTabs();
    // Escolher a aba diz em que grupo se está trabalhando, e com a divisão
    // automática é ele que passa a levar a maior parte da altura — 13/09/2026.
    // Também é aqui que um grupo recolhido se abre ao clicarem no nome dele.
    this.applySplit();
    entry.panel.refresh({ kind: 'file' });
  }

  /**
   * Marca a aba à frente de cada grupo e esconde as casas das outras.
   *
   * A aba de "Malha e pesos" só aparece com a ferramenta de malha ou de pesos
   * na mão (item 19). Se ela estava à frente e a ferramenta mudou, o grupo
   * passa para a primeira aba visível — senão o grupo ficaria com uma casa
   * vazia e nenhuma aba marcada.
   */
  private syncColumnTabs(): void {
    const tool = this.currentTool?.id ?? '';
    for (const [id, entry] of this.columnEntries) {
      const need = TOOL_PANELS[id];
      entry.tab.hidden = need !== undefined && !need.includes(tool);
    }
    for (const side of ['left', 'right'] as const) {
      const state = columnOf(this.layout, side);
      state.groups.forEach((ids, index) => {
        const visible = ids.filter((id) => this.columnEntries.get(id)?.tab.hidden === false);
        let active = state.active[index];
        if (active === null || !visible.includes(active)) active = visible[0] ?? null;
        state.active[index] = active;
        for (const id of ids) {
          const entry = this.columnEntries.get(id);
          if (entry === undefined) continue;
          // Um painel descolado não está em `ids`, então não passa por aqui —
          // e é isso que impede a coluna de esconder o `host` que agora mora
          // dentro da caixa flutuante.
          const on = id === active;
          entry.tab.setAttribute('aria-selected', String(on));
          entry.tab.classList.toggle('is-active', on);
          entry.host.hidden = !on;
        }
      });
    }
    this.fitTabStrips();
  }

  /** As abas de cada grupo que moram no », por lado — rodada 47, lote 1. */
  private abasNoMais: Record<Side, string[][]> = { left: [], right: [] };

  /**
   * A tira de abas numa fileira só — rodada 47, lote 1 (doc `68`, C1).
   *
   * Mede cada aba à vista, pergunta ao `planTabStrip` quem cabe, e põe as
   * outras no ». A aba escondida pela ferramenta (`syncColumnTabs`) continua
   * escondida: aqui só se usa a classe `is-no-mais`, nunca o `hidden` dela.
   */
  private fitTabStrips(): void {
    for (const side of ['left', 'right'] as const) {
      const state = columnOf(this.layout, side);
      this.abasNoMais[side] = [];
      state.groups.forEach((ids, index) => {
        const tira = this.groupBoxes[side][index]?.querySelector('.panel-tabs') as HTMLElement | null;
        const mais = tira?.querySelector('.panel-tabs-mais') as HTMLButtonElement | null;
        if (tira === null || tira === undefined || mais === null) return;
        const presentes = ids.filter((id) => this.columnEntries.get(id)?.tab.hidden === false);
        const abas = presentes.map((id) => this.columnEntries.get(id)!.tab);
        for (const aba of abas) aba.classList.remove('is-no-mais');
        mais.hidden = true;
        if (tira.clientWidth <= 0) return;
        const estilo = getComputedStyle(tira);
        const vao = Number.parseFloat(estilo.columnGap) || 0;
        const recolher = tira.querySelector('.panel-group-fold') as HTMLElement | null;
        const sala = tira.clientWidth - (Number.parseFloat(estilo.paddingLeft) || 0)
          - (Number.parseFloat(estilo.paddingRight) || 0) - (recolher?.offsetWidth ?? 0) - vao;
        mais.hidden = false;
        const larguraMais = mais.offsetWidth;
        const plano = planTabStrip(abas.map((aba) => aba.offsetWidth), sala, larguraMais, vao,
          presentes.indexOf(state.active[index] ?? ''));
        for (const i of plano.hidden) abas[i]!.classList.add('is-no-mais');
        const fora = plano.hidden.map((i) => presentes[i]!);
        this.abasNoMais[side][index] = fora;
        mais.hidden = fora.length === 0;
        const nomes = fora.map((id) => this.columnEntries.get(id)?.panel.title ?? id);
        mais.title = moreHint(nomes);
        mais.setAttribute('aria-label', mais.title);
      });
    }
  }

  /** O » abre a lista das abas que não couberam; escolher uma a traz à frente. */
  private openTabsMore(side: Side, index: number, mais: HTMLElement): void {
    const fora = this.abasNoMais[side][index] ?? [];
    const itens: FloatingItem[] = fora.map((id) => {
      const titulo = this.columnEntries.get(id)?.panel.title ?? id;
      return { label: titulo, hint: `Traz ${titulo} à frente deste grupo`, run: () => this.showColumnPanel(id) };
    });
    if (itens.length === 0) return;
    const r = mais.getBoundingClientRect();
    openFloatingMenu(r.left, r.bottom + 4, itens, 'abas-mais-menu');
  }

  /** Guarda a arrumação da coluna no arquivo, como o resto do estado do editor. */
  private saveColumnState(): void {
    // Os SEIS campos, e não três — conserto de 13/09/2026.
    //
    // Guardava-se `groups`, `active` e `split`. `collapsed`, `autoSplit`,
    // `focus` e `closed` ficavam de fora, e `buildColumn` relê tudo do estado
    // guardado: qualquer coisa que reconstruísse os painéis apagava o que
    // estava só na memória. Foi assim que fechar um painel o MOVEU para o fim
    // do outro grupo em vez de fechá-lo — o `closed` sumia na gravação, e a
    // regra 2 do `parseColumnState` recolocava o painel "que ficou de fora".
    //
    // O mesmo buraco engolia o grupo recolhido e a divisão automática da
    // v12.2: os dois valiam na sessão e se perdiam ao reabrir o arquivo,
    // embora o CHANGELOG daquela versão diga que iam para o estado do editor.
    const guardar = (column: ColumnState): Record<string, unknown> => ({
      groups: column.groups.map((ids) => [...ids]),
      active: [...column.active],
      split: column.split,
      collapsed: [...column.collapsed],
      autoSplit: column.autoSplit,
      focus: column.focus,
      closed: column.closed.map((item) => ({ ...item })),
      floating: column.floating.map((item) => ({ ...item })),
    });
    // NA MÁQUINA, e não no arquivo — 13/09/2026. Ver `BENCH_STORAGE_KEY`: a
    // bancada é de quem trabalha; o `.bone` é do personagem, e o que ele
    // publica não pode levar junto quais painéis estavam fechados aqui.
    this.writeBench(COLUMN_STATE_KEY, {
      left: guardar(this.layout.left),
      right: guardar(this.layout.right),
      widths: [...this.layout.widths],
      hidden: this.layout.hidden,
    });
    this.writeBench(DOCK_STATE_KEY, { open: this.dockView.open, height: this.dockView.height });
  }

  /** `true` when the panel of the right-hand column is on screen. For tests. */
  /**
   * O painel está ABERTO, isto é, está na coluna?
   *
   * Até 13/09/2026 isto respondia outra coisa: "está à FRENTE do grupo dele".
   * Com onze abas na tela o menu Janela marcava cinco, e as outras seis
   * apareciam como fechadas sem estar — a um clique de distância, na mesma
   * tira. Era a metade visível da queixa do Humberto: *"o menu janelas não
   * funciona"*. Aberto agora quer dizer o que a palavra diz.
   */
  isPanelOpen(id: string): boolean {
    if (!this.columnEntries.has(id)) return false;
    return !this.isPanelHidden(id);
  }

  /** O painel está à frente do grupo dele, e portanto à vista? */
  isPanelInFront(id: string): boolean {
    const entry = this.columnEntries.get(id);
    if (entry === undefined) return false;
    return this.hideMode === 'nada' && !entry.tab.hidden && entry.host.hidden === false;
  }

  /**
   * "Editar → Copiar âncora do desenho" — item 33.
   *
   * A âncora é onde o desenho fica dentro do osso: `x`, `y`, giro e as duas
   * escalas. São cinco números que se acertam de olho e que depois precisam ser
   * IGUAIS em cinco desenhos — as cinco mãos de uma pele, o mesmo cabelo em
   * quatro roupas.
   *
   * Fica na memória desta aba, e não no arquivo: é uma prancheta, e prancheta
   * não é conteúdo do personagem.
   */
  copyAnchor(): void {
    const picked = this.doc.selection.attachments[0];
    if (picked === undefined) {
      this.statusState.textContent = 'Escolha um desenho para copiar a âncora dele';
      return;
    }
    const anchor = readAnchor(this.doc.file, picked.slot, picked.attachment);
    if (anchor === null) {
      this.statusState.textContent = 'Esse desenho não tem âncora para copiar';
      return;
    }
    this.anchor = anchor;
    this.statusState.textContent = anchorLine(anchor);
  }

  /** "Editar → Colar âncora nos desenhos" — item 33. */
  pasteAnchorNow(): void {
    const anchor = this.anchor;
    if (anchor === null) {
      this.statusState.textContent = 'Copie a âncora de um desenho primeiro';
      return;
    }
    const targets = this.doc.selection.attachments.map((item) => ({
      slot: item.slot, attachment: item.attachment,
    }));
    if (targets.length === 0) {
      this.statusState.textContent = 'Escolha os desenhos que vão receber a âncora';
      return;
    }
    const command = new PasteAnchor(targets, anchor);
    this.doc.run(command);
    this.statusState.textContent =
      `Âncora de ${anchor.from} colada em ${command.count} desenho(s)`;
  }

  /** Em que grupo a aba está, para os testes e para o menu Janela. */
  columnGroupOf(id: string): number {
    const side = sideOf(this.layout, id);
    return side === null ? -1 : groupOf(columnOf(this.layout, side), id);
  }

  /**
   * "Janela → Voltar ao padrão": a bancada de fábrica de novo.
   *
   * Existe porque arrastar abas entre grupos é um gesto que se pode errar, e
   * arrumar seis abas de volta à mão é pior do que o erro. Uma linha, e volta
   * tudo: os dois grupos, a divisão de altura e os painéis à vista.
   */
  /**
   * **Aplica um arranjo com nome** — degrau 11, lote 4 (C6).
   *
   * Os descolados voltam antes, como no "Voltar ao padrão": um painel que
   * ficou flutuando fora da tela não pode sobreviver a uma troca de arranjo.
   * Arranjo que não existe mais **avisa** em vez de montar uma tela inventada.
   */
  applyArrangement(id: string): void {
    const known = getPanels().filter((panel) => panel.id !== STAGE_PANEL
      && !DOCK_PANELS.includes(panel.id)).map((panel) => panel.id);
    const layout = layoutOf(id, known, arrangements());
    const nome = allArrangements(arrangements()).find((item) => item.id === id)?.name ?? id;
    if (layout === null) {
      this.statusState.textContent = `O arranjo "${nome}" já não existe. Janela → Arranjos mostra os que há`;
      return;
    }
    for (const side of ['left', 'right'] as const) {
      this.writeSide(side, dockAllFloating(columnOf(this.layout, side)));
    }
    this.layout = layout;
    const faixa = arrangementDock(id);
    if (faixa !== null && faixa !== this.dockView.open) {
      this.dockView = toggleDock(this.dockView);
      setDockState(this.dockView);
    }
    this.saveColumnState();
    this.saveSplits();
    this.buildPanels();
    this.setContext(id);
    this.statusState.textContent = `Arranjo "${nome}". Janela → Arranjos troca; Voltar ao padrão desfaz`;
  }

  // -------------------------------------------------------------------------
  // Os contextos — rodada 4, lote 8 (05/10/2026)
  // -------------------------------------------------------------------------

  /** O contexto em uso; lido do navegador na primeira vez. */
  get currentContext(): string {
    if (this.contextoAtual === null) {
      this.contextoAtual = parseContext(this.readKey(CONTEXT_STORAGE_KEY), arrangements());
    }
    return this.contextoAtual;
  }

  /** Guarda o contexto em uso no navegador, e põe o nome no botão. */
  private setContext(id: string): void {
    this.contextoAtual = id;
    try {
      globalThis.localStorage?.setItem(CONTEXT_STORAGE_KEY, id);
    } catch {
      // Aba anônima: vale só nesta sessão.
    }
    this.refreshContextButton();
  }

  /** O botão diz o contexto em uso: na dica sempre; ao lado do ícone, se couber. */
  private refreshContextButton(): void {
    const nome = switcherLabel(arrangements(), this.currentContext);
    const dica = `Área de trabalho: ${nome}. Clique para trocar (Montar, Animar, Pesos, os arranjos)`;
    this.contextoBotao.title = dica;
    this.contextoBotao.setAttribute('aria-label', dica);
    const icone = el('span', 'contexto-icone');
    paintIcon(icone, 'swap-folder', 18);
    this.contextoBotao.replaceChildren(icone, el('span', 'contexto-nome', nome), el('span', 'contexto-seta', '▾'));
  }

  /**
   * Troca para um contexto (Montar, Animar, Pesos). A tela do contexto, a
   * linha do tempo aberta ou fechada como ele pede, e os soltos de volta antes.
   * Arranjo (de fábrica ou guardado) vai pelo `applyArrangement`.
   */
  applyContext(id: string): void {
    // "Padrão" é a tela de fábrica: o mesmo que Janela → Voltar ao padrão.
    if (id === DEFAULT_CONTEXT) {
      this.resetLayout();
      return;
    }
    const receita = CONTEXTS.find((item) => item.id === id);
    if (receita === undefined) {
      this.applyArrangement(id);
      return;
    }
    const known = getPanels().filter((panel) => panel.id !== STAGE_PANEL
      && !DOCK_PANELS.includes(panel.id)).map((panel) => panel.id);
    const layout = contextLayout(id, known);
    if (layout === null) return;
    for (const side of ['left', 'right'] as const) {
      this.writeSide(side, dockAllFloating(columnOf(this.layout, side)));
    }
    this.layout = layout;
    const faixa = contextDock(id);
    if (faixa !== null && faixa !== this.dockView.open) {
      this.dockView = toggleDock(this.dockView);
      setDockState(this.dockView);
    }
    this.saveColumnState();
    this.saveSplits();
    this.buildPanels();
    this.setContext(id);
    this.statusState.textContent = `Contexto "${receita.name}": ${receita.hint}. O botão no canto de cima troca`;
  }

  /** O botão dos contextos: a lista, como o seletor do Photoshop. */
  private openContextMenu(): void {
    const atual = this.currentContext;
    const itens: FloatingItem[] = [];
    for (const item of switcherItems(arrangements(), atual)) {
      if (item.kind === 'separador') continue;
      if (item.kind === 'contexto') {
        itens.push({
          label: item.current ? `✓ ${item.name}` : item.name,
          hint: item.hint === '' ? item.name : item.hint,
          run: () => this.applyContext(item.id),
        });
        continue;
      }
      itens.push(item.id === 'arranjo-guardar'
        ? { label: item.name, hint: 'Guarda a tela de agora com um nome, nesta máquina', run: () => { if (hasAction('guardar-arranjo')) runAction('guardar-arranjo'); } }
        : { label: item.name, hint: 'Volta a tela do contexto em uso ao jeito dele', run: () => this.applyContext(atual) });
    }
    const r = this.contextoBotao.getBoundingClientRect();
    openFloatingMenu(r.left, r.bottom + 4, itens, 'contexto-menu');
  }

  /** A tela de agora, para guardar num arranjo com nome. */
  layoutSnapshot(): unknown {
    const guardar = (column: ColumnState): Record<string, unknown> => ({
      groups: column.groups.map((ids) => [...ids]),
      active: [...column.active],
      split: column.split,
      collapsed: [...column.collapsed],
      autoSplit: column.autoSplit,
      focus: column.focus,
      closed: column.closed.map((item) => ({ ...item })),
      floating: column.floating.map((item) => ({ ...item })),
    });
    return {
      left: guardar(this.layout.left),
      right: guardar(this.layout.right),
      widths: [...this.layout.widths],
      hidden: this.layout.hidden,
    };
  }

  resetLayout(): void {
    // Os descolados voltam para a coluna ANTES de tudo: é o resgate de um
    // painel que ficou onde não se pega mais. `defaultLayout` já devolveria a
    // arrumação de fábrica, mas fazer o passo explícito é o que garante o
    // resgate mesmo se o padrão mudar um dia.
    for (const side of ['left', 'right'] as const) {
      this.writeSide(side, dockAllFloating(columnOf(this.layout, side)));
    }
    this.layout = defaultLayout(
      getPanels().filter((panel) => panel.id !== STAGE_PANEL
        && !DOCK_PANELS.includes(panel.id)).map((panel) => panel.id),
    );
    this.dockView = defaultDockState();
    setDockState(this.dockView);
    // As colunas em ícones também voltam ao padrão (abertas) — rodada 4, lote 2.
    this.icones = defaultIconState();
    this.saveIcons();
    this.saveColumnState();
    // E a divisão guardada no NAVEGADOR — 13/09/2026. Sem esta linha, "Voltar
    // ao padrão" arrumava a tela e a próxima abertura desarrumava de novo: o
    // `localStorage` continuava com a divisão antiga e o automático desligado.
    // Voltar ao padrão tem de voltar de verdade, inclusive amanhã.
    this.saveSplits();
    this.buildPanels();
    // O botão dos contextos volta a dizer "Padrão" — rodada 4, lote 8.
    this.setContext(DEFAULT_CONTEXT);
    this.statusState.textContent = 'Painéis de volta ao padrão';
  }

  // -------------------------------------------------------------------------
  // The strip under the drawing area
  // -------------------------------------------------------------------------

  /**
   * Builds the tabs and the hosts of the bottom strip. Both panels are mounted
   * at once and the hidden one is only hidden: a panel that was torn down and
   * rebuilt on every tab click would lose its selection and its scroll.
   */
  private buildDock(panels: readonly Panel[]): void {
    // Aberta ou fechada vem do arquivo, ao lado da arrumação da coluna. De
    // fábrica: FECHADA — lote 14, rodada 3.
    this.dockView = parseDockState(
      this.readBench(DOCK_STATE_KEY),
    );
    setDockState(this.dockView);
    this.dockEntries = new Map();
    const tabs: Node[] = [];
    const bodies: Node[] = [];

    for (const panel of panels) {
      const tab = el('button', {
        class: 'dock-tab', type: 'button', role: 'tab',
        'aria-selected': 'false', text: panel.title,
      }) as HTMLButtonElement;
      // Rodada 47, lote 6 (a prova final): as abas da faixa também dizem o que são.
      tab.title = panel.id === 'curvas'
        ? 'Curvas: o gráfico das chaves no tempo, para ver e mudar o formato da curva entre duas chaves'
        : `${panel.title}: as chaves de cada osso e desenho, no tempo`;
      tab.addEventListener('click', () => this.showDockPanel(panel.id));
      const host = el('div', { class: 'dock-panel', role: 'tabpanel', hidden: true });
      this.dockEntries.set(panel.id, { panel, tab, host });
      this.mountedPanels.push({ panel, host });
      tabs.push(tab);
      bodies.push(host);
    }

    this.dockTabs.replaceChildren(...tabs);
    this.dockBody.replaceChildren(...bodies);
    const missing = panels.length === 0;
    this.dock.hidden = missing;
    this.dockGrip.hidden = missing;
    if (missing) {
      this.activeDock = null;
      return;
    }
    if (this.activeDock === null || !this.dockEntries.has(this.activeDock)) {
      this.activeDock = panels[0].id;
    }
    // Fechada, só a Linha do tempo existe: Curvas e Prévia precisam da altura
    // que a faixa fechada não tem.
    if (!this.dockView.open && this.dockEntries.has('linha-do-tempo')) {
      this.activeDock = 'linha-do-tempo';
    }
    this.applyDockHeight();
  }

  /**
   * Põe uma aba à frente na faixa de baixo.
   *
   * **Não abre a faixa** — anotação 4 do Humberto: *"se ela está fechada, não
   * devia abrir do nada"*. Com a faixa fechada, quem fica à frente é sempre a
   * Linha do tempo, que é a única que se lê fechada. Quem quer Curvas com a
   * faixa fechada abre a faixa primeiro, e quem abre é sempre um gesto dele:
   * o botão Detalhes, a alça puxada até `OPEN_MIN`, ou o menu Janela — veja
   * `showPanel`.
   */
  showDockPanel(id: string): void {
    // Aba lembrada que não existe mais — a Prévia, num arquivo gravado antes
    // do lote 25 — cai na Linha do tempo em vez de deixar a faixa sem nada à
    // frente.
    const pedido = this.dockEntries.has(id) ? id : 'linha-do-tempo';
    const target = (!this.dockView.open && pedido !== 'linha-do-tempo')
      ? 'linha-do-tempo' : pedido;
    if (!this.dockEntries.has(target)) return;
    this.activeDock = target;
    for (const [panelId, entry] of this.dockEntries) {
      const on = panelId === target;
      entry.tab.setAttribute('aria-selected', String(on));
      entry.host.hidden = !on;
    }
    // A panel that was hidden measured zero width, so its ruler and its canvas
    // are drawn for a box that no longer exists. Ask it to draw itself again.
    this.placeDockTabs();
    const entry = this.dockEntries.get(target);
    entry?.panel.refresh({ kind: 'file' });
  }

  /** Id of the tab on screen in the bottom strip, or `null`. */
  get dockPanel(): string | null {
    return this.activeDock;
  }

  /**
   * Escreve a altura da faixa na tela, e esconde as abas quando ela está
   * fechada — lote 14.
   *
   * Fechada, a faixa é o tocador, a régua e o Resumo, e mais nada: as abas
   * **Linha do tempo · Curvas · Prévia** só aparecem abertas. Uma tira de abas
   * numa faixa de três linhas seria um quarto da faixa gasto em abas.
   */
  private applyDockHeight(): void {
    const wanted = dockHeightFor(this.dockView, this.dockRows(), this.dockEntityRow());
    this.dock.style.height = `${Math.round(this.fitToWindow(wanted))}px`;
    this.dockTabs.hidden = !this.dockView.open;
    this.dock.classList.toggle('dock-fechada', !this.dockView.open);
    this.placeDockTabs();
  }

  /**
   * As abas da faixa de baixo moram na PRIMEIRA linha do painel à frente —
   * rodada 47, lote 1 (doc `68`, C3).
   *
   * Numa fileira própria elas levavam 48 px da faixa aberta: em 1280×720 a
   * folha não mostrava nenhuma linha de chave, só o Resumo. O painel marca a
   * linha dele com `data-faixa-linha`; sem a marca, as abas ficam em cima.
   */
  private placeDockTabs(): void {
    const host = this.activeDock === null ? null : this.dockEntries.get(this.activeDock)?.host ?? null;
    const linha = host?.querySelector('[data-faixa-linha]') as HTMLElement | null;
    if (this.dockView.open && linha !== null && linha !== undefined) {
      this.dockTabs.classList.add('na-linha');
      if (this.dockTabs.parentElement !== linha) linha.prepend(this.dockTabs);
      return;
    }
    this.dockTabs.classList.remove('na-linha');
    if (this.dockTabs.parentElement !== this.dock) this.dock.prepend(this.dockTabs);
  }

  /**
   * A altura que a janela deixa a faixa ter, em pixels.
   *
   * Two floors fight here, and the drawing area wins: on a window where both
   * cannot be met, the strip's floor gives way. The strip scrolls inside
   * itself, the canvas does not — a canvas of 25px is not a small canvas, it
   * is no canvas.
   */
  private fitToWindow(pixels: number): number {
    const room = this.center.clientHeight;
    if (room <= 0) return pixels;
    const most = Math.max(0, room - this.stageMin(room));
    let altura = Math.min(pixels, most);
    // Rodada 17, K1b (decisão do Diretor, 06/10): com os Detalhes ABERTOS, a
    // coluna da direita tem chão — a Imagens com uma fileira inteira, a lista
    // de Animações com três linhas —, e quem cede é a faixa, até o chão dela.
    if (this.dockView.open) {
      const coluna = this.rightColumnFloor();
      if (coluna !== null) {
        const barra = this.actionBarHost.offsetHeight;
        const alca = this.dockGrip.offsetHeight;
        altura = Math.min(altura, dockRoomForColumn(altura, room, barra, alca, coluna, OPEN_MIN));
      }
    }
    return altura;
  }

  /**
   * Quanto a coluna da direita precisa para os dois grupos dela caberem —
   * rodada 17, K1b. Só quando a aba **Imagens** está à frente no grupo de cima
   * (é dela o chão novo); `null` nos outros casos, e aí nada muda.
   */
  private rightColumnFloor(): number | null {
    const coluna = this.rightColumn;
    const caixas = this.groupBoxes.right;
    if (coluna.hidden || isIconic(this.icones, 'right') || caixas.length !== 2) return null;
    const state = columnOf(this.layout, 'right');
    if (state.active[0] !== 'imagens' || isCollapsed(state, 0)) return null;
    const topo = (coluna.querySelector('.panel-column-topo') as HTMLElement | null)?.offsetHeight ?? 0;
    const alca = (coluna.querySelector('.panel-split-grip') as HTMLElement | null)?.offsetHeight ?? SPLIT_GRIP_H;
    const de = (caixa: HTMLElement): number => (caixa.querySelector('.panel-tabs') as HTMLElement | null)?.offsetHeight ?? TAB_STRIP_H;
    // A Imagens: a tira e o fim da primeira miniatura, medidos; sem miniatura, a de fábrica.
    const cima = caixas[0]!;
    const corpo = cima.querySelector('.panel-group-body') as HTMLElement | null;
    const mini = cima.querySelector('.imagens-linha') as HTMLElement | null;
    const imagens = corpo === null || mini === null ? IMAGES_ROW_NEED
      : Math.ceil(de(cima) + mini.getBoundingClientRect().bottom - corpo.getBoundingClientRect().top
        + ((mini.closest('.painel-corpo') as HTMLElement | null)?.scrollTop ?? 0) + 4);
    const baixo = caixas[1]!;
    const embaixo = state.active[1] === 'animacoes' && !isCollapsed(state, 1)
      ? this.animNeedNow(baixo).chao
      : isCollapsed(state, 1) ? de(baixo) : GROUP_MIN_PX;
    return topo + imagens + alca + embaixo;
  }

  /**
  /** Quantas linhas por alvo a animação aberta teria. Só a conta usa. */
  private dockRows(): number {
    return this.doc.animation === null ? 0 : 1;
  }

  /** Rodada 8c, C11: a animação aberta tem entidade — a fechada mostra a faixa dela. */
  private dockEntityRow(): boolean {
    return this.doc.animation !== null && entitySlots(this.doc.file).length > 0;
  }

  /**
   * Abre e fecha a faixa: o botão **Detalhes** e o item do menu Janela.
   *
   * Fechar traz a aba **Linha do tempo** para a frente: Curvas e Prévia só
   * existem abertas, e uma faixa fechada mostrando a aba Curvas seria uma
   * faixa de três linhas sem régua nem Resumo.
   */
  toggleDockOpen(): void {
    this.setDock(toggleDock(this.dockView));
    this.statusState.textContent = this.dockView.open
      ? 'Linha do tempo aberta'
      : 'Linha do tempo fechada. Detalhes abre de novo';
  }

  /** `true` quando a faixa de baixo está aberta. Para o menu e para os testes. */
  get dockOpen(): boolean {
    return this.dockView.open;
  }

  /**
   * Guarda o estado novo, avisa a folha, escreve na tela e grava no arquivo.
   *
   * A folha é avisada por `setDockState`, e não por uma chamada direta: quem
   * monta cria quem desenha, nunca o contrário (`ui/actions.ts`).
   */
  setDock(next: DockState): void {
    const before = this.dockView;
    this.dockView = next;
    setDockState(next);
    if (!next.open && this.activeDock !== 'linha-do-tempo'
      && this.dockEntries.has('linha-do-tempo')) {
      this.showDockPanel('linha-do-tempo');
    }
    this.applyDockHeight();
    if (before.open !== next.open) {
      // Escondida, a faixa mediu zero; peça o desenho de novo a quem está nela.
      for (const [, entry] of this.dockEntries) entry.panel.refresh({ kind: 'file' });
    }
    this.saveColumnState();
  }

  /**
   * Room `<main>` needs so the canvas inside it still has `STAGE_MIN`.
   *
   * The toolbar is measured, never guessed: it is one row on a wide window and
   * two on a narrow one, and the difference is more than 100px of drawing.
   */
  private stageMin(room: number): number {
    // A barra saiu de dentro da cena no lote 17 e virou uma linha da janela.
    // Ela continua entrando nesta conta: o `room` a inclui, e o que ela ocupa
    // não é desenho.
    const bar = this.root.querySelector('.viewport-toolbar');
    const barHeight = bar instanceof HTMLElement ? bar.offsetHeight : 0;
    // On a window too short for `STAGE_MIN + toolbar`, ask for a share of what
    // there is instead of an absolute number that cannot be met. Without this
    // the floor of the bottom strip (`DOCK_MIN`) won every time and the canvas
    // was left with 80px on a 1254x568 window, toolbar and all.
    const canvas = Math.min(STAGE_MIN, Math.round(room * STAGE_SHARE));
    return canvas + barHeight;
  }

  /**
   * Muda a altura da faixa ABERTA, e abre ou fecha quando a alça passa do
   * ponto — lote 14.
   *
   * "Puxar para cima abre uma linha por objeto" é o gesto do Spriter, e
   * arrastar para baixo até o chão fecha. O ponto de virada é `OPEN_AT`, em
   * `dock-model.ts`, para a alça e o botão Detalhes nunca discordarem.
   */
  setDockHeight(pixels: number): void {
    const next = dockFromDrag(this.dockView, pixels);
    if (next.open !== this.dockView.open) {
      this.setDock(next);
      return;
    }
    this.dockView = next.open ? withDockHeight(this.dockView, pixels) : this.dockView;
    this.applyDockHeight();
  }

  private armDockGrip(): void {
    this.dockGrip.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      event.preventDefault();
      this.dockGrip.setPointerCapture(event.pointerId);
      this.dockDrag = {
        pointerId: event.pointerId, startY: event.clientY, startHeight: this.dockView.height,
      };
    });
    this.dockGrip.addEventListener('pointermove', (event) => {
      const drag = this.dockDrag;
      if (drag === null || drag.pointerId !== event.pointerId) return;
      // The strip grows when the pointer goes UP, so the sign is inverted.
      this.setDockHeight(drag.startHeight - (event.clientY - drag.startY));
    });
    const stop = (event: PointerEvent): void => {
      if (this.dockDrag === null) return;
      if (this.dockGrip.hasPointerCapture(event.pointerId)) {
        this.dockGrip.releasePointerCapture(event.pointerId);
      }
      this.dockDrag = null;
    };
    this.dockGrip.addEventListener('pointerup', stop);
    this.dockGrip.addEventListener('pointercancel', stop);
    this.dockGrip.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 48 : 16;
      const now = this.dockView.open ? this.dockView.height : CLOSED_HEIGHT;
      if (event.key === 'ArrowUp') this.setDockHeight(now + step);
      else if (event.key === 'ArrowDown') this.setDockHeight(now - step);
      else return;
      event.preventDefault();
    });
  }

  // -------------------------------------------------------------------------
  // Reacting to the document
  // -------------------------------------------------------------------------

  /**
   * Os avisos do documento e, depois deles, os dos emissores da cena — rodada
   * 15, linha 8. O emissor sem imagem e as partículas cortadas pelo teto
   * existiam no runtime e a tela não os mostrava.
   */
  private allWarnings(): readonly string[] {
    const doc = this.doc;
    const skeleton = doc.skeleton;
    if (skeleton === null) return doc.warnings;
    let extra: string[] = [];
    try {
      extra = emitterWarningLines(
        corpoDe(doc).file, skeleton, doc.warnings,
        (slot, attachment) => particleFrame(slot.skeleton, slot, attachment, this.particleCache),
        (slot) => isSlotHidden(slot.data.name),
      );
      // Rodada 16, lote 6: o emissor (e o boneco) que pesa, com o número. Só
      // o pesado: o médio fica no selo da ficha.
      extra.push(...weightWarningLines(corpoDe(doc).file));
    } catch {
      extra = [];
    }
    // Rodada 8c, C15: a entidade em laço que dá um salto na emenda da
    // animação aberta (regra 21: com os números e o que fazer).
    const filhos = skeletonsDe(doc);
    extra.push(...seamWarnings(doc.file, doc.animation,
      (uri, nome) => filhos.get(uri)?.findAnimation(nome)?.duration ?? null));
    // Rodada 39b, lote 7: a peça de teste cujo arquivo sumiu, e a sem lugar.
    extra.push(...montagemWarnings(doc));
    // Rodada 47, lote 6 (doc 52, defeito 3): a barra dizia "2 avisos" e a
    // janela listava 1 problema no caso do slot sumido. Uma frase igual vinda
    // de dois lugares conta uma vez só, na barra e na janela, pela mesma lista.
    const todas = extra.length === 0 ? doc.warnings : [...doc.warnings, ...extra];
    return [...new Set(todas)];
  }

  /** A conta das partículas dos avisos, guardada entre quadros como a do desenhador. */
  private readonly particleCache = new ParticleCache();

  private onDocChange(change: DocChange): void {
    if (change.kind === 'file' || change.kind === 'structure' || change.kind === 'assets') this.particleCache.clear();
    // Rodada 8c, C11: a linha da entidade na faixa fechada entra e sai com a
    // entidade e com a animação aberta. Só a fechada muda; aberta, nada.
    if (!this.dockView.open && change.kind !== 'transform' && change.kind !== 'selection') this.applyDockHeight();
    this.refreshStatus(change);
    // A faixa de baixo NÃO acompanha o modo — regra 12, anotação 4. O lote 23
    // fazia Animando abrir e Montagem fechar; nas palavras dele, *"se ela está
    // fechada, não devia abrir do nada"*. Trocar de modo é trocar de modo, e
    // abrir a faixa é o botão Detalhes, a alça, ou o menu Janela.
    for (const { panel } of this.mountedPanels) {
      if (panel.listensTo.includes(change.kind)) panel.refresh(change);
    }
  }

  private refreshStatus(change?: DocChange): void {
    // A frase da ferramenta depende da SELEÇÃO, e não só de qual ferramenta
    // está na mão: escolher um osso faz a frase do Inclinar sumir.
    this.refreshToolFooter();
    const mark = this.doc.dirty ? ' •' : '';
    this.docName.replaceChildren(
      el('span', { text: this.doc.name }),
      el('span', { class: 'doc-mark', text: mark }),
    );
    // Em tela estreita o nome encolhe com reticências (rodada 4, lote 8): a
    // dica guarda o nome inteiro.
    this.docName.title = this.doc.dirty ? `${this.doc.name} (não salvo)` : this.doc.name;
    // Rodada 45, lote 4 (4.6): o nome e o "•" na aba do navegador, como no Photoshop e no Spine.
    document.title = `${this.doc.name}${this.doc.dirty ? ' •' : ''} — Recorte`;

    // Rodada 45, lote 1: "Arquivo salvo." só para o que foi gravado ou aberto
    // do disco; o que nunca foi é "ainda não salvo" (regra 21, doc 57).
    const state = estadoDoArquivo(this.doc.dirty, this.doc.path);
    // L13: o ponto entre as duas frases entra só se a primeira não fecha.
    this.statusState.textContent = change?.label === undefined
      ? state
      : juntarFrases(change.label, state);

    this.refreshMode();

    const warnings = this.allWarnings();
    this.warnButton.disabled = warnings.length === 0;
    // Rodada 48 (a mão do Humberto: 176 avisos): a barra diz quantos são iguais,
    // a dica conta os tipos, o pior primeiro, e a lista começa pelo pior.
    const resumo = resumoDosAvisos(warnings);
    this.warnButton.textContent = resumo.barra;
    // Rodada 47, lote 5b (notas do doc 86), nota 4: o botão diz na dica o que ele abre.
    this.warnButton.title = warnings.length === 0
      ? 'Nenhum aviso: o arquivo não tem nada a consertar. Quando tiver, este botão abre a janela de Problemas'
      : `Abre a janela de Problemas: cada aviso com o que fazer para consertar. ${resumo.dica}`;
    this.warnList.replaceChildren(...avisosPeloPior(warnings).map((w) => this.warnRow(w)));
    if (warnings.length === 0) this.warnList.hidden = true;
  }

  /**
   * Uma linha da lista de avisos — lote 49, requisito R11.
   *
   * O texto sai com os nomes do arquivo e em português (`warning-model.ts`),
   * o **Ir para** aparece quando há o que escolher, e o conserto quando há
   * um. Os dois botões são ícones, com o nome inteiro na dica.
   */
  private warnRow(line: string): HTMLElement {
    const row = warningRow(this.doc.file, line);
    const item = el('li', { class: 'warn-row' }, [el('span', { class: 'warn-text', text: row.text })]);
    const onde = row.text.split(': ')[0] ?? row.text;
    if (row.target !== null) {
      const target = row.target;
      const dica = `Ir para ${onde}`;
      const ir = el('button', { class: 'warn-go', type: 'button', title: dica, 'aria-label': dica }) as HTMLButtonElement;
      if (!paintIcon(ir, 'target', 16)) ir.textContent = 'Ir para';
      ir.addEventListener('click', () => this.goToWarning(target));
      item.append(ir);
    }
    if (row.fix !== null) {
      const fix = row.fix;
      const dica = fix.action === 'swap-image'
        ? `${fix.label} Escolhe no painel Imagens a imagem que entra no lugar`
        : `${fix.label}: escreve "${fix.value}" no arquivo, e o aviso some`;
      const botao = el('button', { class: 'warn-fix', type: 'button', title: dica, 'aria-label': dica }) as HTMLButtonElement;
      if (!paintIcon(botao, fix.action === 'swap-image' ? 'image' : 'save', 16)) botao.textContent = fix.label;
      botao.addEventListener('click', () => this.fixWarning(row, fix));
      item.append(botao);
    }
    return item;
  }

  /**
   * **A Janela de Problemas** — degrau 11, lote 6 (regra 21 com tela).
   *
   * A mesma lista da tira do rodapé, numa janela que cabe: o que está errado
   * por extenso, o Ir para com o nome do lugar, e o conserto com o nome
   * escrito onde há conserto.
   */
  showProblems(): void {
    // A barra e a janela leem a mesma lista, no mesmo instante (doc 52).
    this.refreshStatus();
    showProblemsDialog({
      file: this.doc.file,
      warnings: this.allWarnings(),
      onGo: (row) => { if (row.target !== null) this.goToWarning(row.target); },
      onFix: (row, fix) => this.fixWarning(row, fix),
    });
  }

  /** **Ir para**: escolhe o elemento do aviso e abre o painel dono dele. */
  private goToWarning(target: WarningTarget): void {
    const name = target.name ?? '';
    const selection = emptySelection();
    if (target.kind === 'bone') selection.bones = [name];
    if (target.kind === 'slot') selection.slots = [name];
    if (target.kind === 'constraint') selection.constraints = [name];
    if (target.kind === 'attachment') selection.attachments = [{ slot: target.slot ?? '', attachment: name }];
    if (target.kind === 'animation') this.doc.animation = name;
    else if (target.kind !== 'skin') this.doc.select(selection);
    this.showPanel(panelFor(target));
  }

  /** O conserto do aviso: trocar a imagem que falta, ou gravar o valor padrão. */
  private fixWarning(row: WarningRow, fix: WarningFix): void {
    if (fix.action === 'swap-image') {
      if (row.target?.kind === 'attachment') {
        this.doc.select({
          ...emptySelection(), attachments: [{ slot: row.target.slot ?? '', attachment: row.target.name ?? '' }],
        });
      }
      this.swapImageEverywhere();
      return;
    }
    if (row.pointer === null) return;
    this.doc.run(new SetProperty(row.pointer, fix.value, { label: 'Gravar o padrão', kind: 'structure', mergeable: false }));
  }

  /**
   * A linha da ferramenta no rodapé — lote 26, anotação 10.
   *
   * Só existe uma frase por enquanto, e ela é a do **Inclinar sem osso**: até
   * aqui a ferramenta não fazia nada e não dizia nada (desvio 6 do lote 13), e
   * o Humberto encontrou o silêncio — *"tentei usar, não entendi"*. A conta de
   * quando falar está no `toolFooter`, puro; aqui só se escreve o texto.
   */
  private refreshToolFooter(): void {
    const texto = toolFooter(
      this.currentTool?.id ?? '',
      this.doc.selection.bones.length > 0,
    );
    // P19 (29/09/2026): sem frase da ferramenta, a linha diz o PASSO SEGUINTE.
    // A da ferramenta ganha: ela fala do gesto que está na mão agora.
    this.statusTool.classList.remove('is-proximo');
    if (texto !== null) {
      this.statusTool.textContent = texto;
      this.statusTool.hidden = false;
      return;
    }
    const passo = this.nextStepNow();
    if (passo === null) {
      this.statusTool.textContent = '';
      this.statusTool.hidden = true;
      return;
    }
    // O ajuste da cor (29/09/2026): "Próximo:" em negrito e na cor de
    // destaque, o resto na cor do texto (`shell-status.css`). Com filhos, o
    // setter de `textContent` não entra: o `title` é escrito aqui, igual.
    const partes = nextStepParts(passo);
    this.statusTool.replaceChildren(
      el('strong', { class: 'status-proximo', text: partes.destaque }),
      document.createTextNode(` ${partes.resto}`),
    );
    // P66: na linha, o gesto curto; na dica, o caminho de clique por extenso.
    this.statusTool.title = fraseDoRodape(nextStepLine(passo));
    this.statusTool.classList.add('is-proximo');
    this.statusTool.hidden = false;
  }

  /**
   * **O passo seguinte** — P19. A conta é de `next-step-model.ts`, pura; aqui
   * só se conta o que o documento tem. Desligado em Preferências, `null`.
   */
  private nextStepNow(): NextStep | null {
    if (!prefs().nextStep) return null;
    // Rodada 7: as imagens da pasta contam — com a pasta aberta, o próximo
    // passo é pôr uma na cena, e não "traga as imagens".
    const imagens = hasImportedImages(this.doc) || this.doc.atlases.length > 0
      || folderImageNames(this.doc).length > 0 ? 1 : 0;
    const passo = nextStep(nextStepInputOf(corpoDe(this.doc).file, this.doc.file, {
      animation: this.doc.animation, path: this.doc.path, images: imagens,
    }));
    return passo;
  }

  /**
   * Says what is open, because the same drag goes to two different places.
   * With the base open, moving a bone changes the base; with an animation
   * open it always writes a key (degrau 4a, M6) and the base is safe.
   */
  private refreshMode(): void {
    // Degrau 11, lote 1: o interruptor saiu da barra, e é AQUI que se lê onde
    // se está — "Base: homem" ou "Animação: andar". A dica diz por onde trocar.
    const foco = this.doc.file.skeleton?.name;
    const corpo = corpoDe(this.doc);
    const agora = corpo === this.doc ? null : corpo.file.skeleton?.name;
    const onde = whereLabel({
      animation: this.doc.animation,
      body: typeof foco === 'string' && foco.length > 0 ? foco : this.doc.name,
      bodyNow: typeof agora === 'string' && agora.length > 0 ? agora : null,
    });
    this.statusMode.replaceChildren();
    this.statusMode.className = `status-mode ${onde.kind === 'base' ? 'status-mode-montagem' : 'status-mode-animando'}`;
    this.statusMode.title = onde.hint;
    this.statusMode.setAttribute('aria-label', `${onde.title}. ${onde.hint}`);
    this.statusMode.append(
      el('strong', { text: onde.title }),
      // Rodada 47, lote 1 (C4): a explicação some em tela estreita (CSS) e mora na dica.
      el('span', { class: 'status-mode-explica', text: onde.detail }),
    );
  }

  // -------------------------------------------------------------------------
  // File commands
  // -------------------------------------------------------------------------

  async newFile(): Promise<void> {
    return shellFile.newFile(this);
  }

  /**
   * **Arquivo → Abrir pasta…** — lote 59, plano pasta do projeto.
   *
   * Começar como o Spriter: a pasta das imagens do personagem. É um documento
   * novo, vazio, e as imagens da pasta ficam na aba Imagens, por subpasta.
   * **Nada entra na cena sozinho**: o personagem nasce do arrasto.
   */
  async openFolder(): Promise<void> {
    return shellFile.openFolder(this);
  }

  /** Rodada 48: a pasta solta na janela abre pela alça do arrasto, sem o seletor. */
  async openDroppedFolder(handle: FolderDirectoryHandle): Promise<void> {
    return shellFile.openFolder(this, handle);
  }

  /**
   * A pasta aberta, e a aba Imagens à vista. Lote 62: quando o Salvar já
   * gravou um `.bone` na raiz desta pasta, ele reabre — **continuar de onde
   * parou**. Sem ele, o documento vazio.
   */
  async startInFolder(folder: ProjectFolder, bone?: string): Promise<void> {
    return shellFile.startInFolder(this, folder, bone);
  }

  /** Rodada 7: o gesto que precisa de pasta pede a pasta antes. */
  async askFolderFirst(gesto: 'salvar' | 'soltar'): Promise<'pasta' | 'sem' | 'cancelar'> {
    return shellFile.askFolderFirst(this, gesto);
  }

  async open(): Promise<void> {
    return shellFile.open(this);
  }

  async save(saveAs: boolean): Promise<void> {
    return shellFile.save(this, saveAs);
  }

  // -------------------------------------------------------------------------
  // The four new entries of the "Arquivo" menu
  // -------------------------------------------------------------------------

  /** "Salvar como binário…": the same document, in the layout of spec 11. */
  async saveBinary(): Promise<void> {
    return shellFile.saveBinary(this);
  }

  /** "Salvar como pacote…": skeleton, atlas and images in one `.bonez`. */
  async savePackage(): Promise<void> {
    return shellFile.savePackage(this);
  }

  /** "Abrir outro corpo… / Abrir uma entidade…" — degrau 10 (E17). */
  async openAnother(como: 'corpo' | 'entidade'): Promise<void> {
    return shellFile.openAnother(this, como);
  }

  /** "Entregar um corpo…": um corpo sozinho, com o atlas fatiado (P2). */
  async deliverOneBody(): Promise<void> {
    return shellFile.deliverOneBody(this);
  }

  /** "Salvar a entidade editada…": Novo ou Por cima (E4). */
  async saveEntityFile(): Promise<void> {
    return shellFile.saveEntityFile(this);
  }

  /**
   * "Exportar glTF…": the same character in the format every 3D tool reads.
   *
   * glTF has no constraints, no draw order and no shear, so an export always
   * leaves something behind. The list of what was left behind goes on screen in
   * the plain message window, never only into the status bar — a loss nobody
   * read is a loss discovered inside the game engine, hours later.
   */
  async exportGltf(): Promise<void> {
    return shellFile.exportGltf(this);
  }

  /**
   * "Exportar imagem…": a sequência de PNG, a folha de sprites ou o GIF.
   *
   * A janela é de `io/export-image.ts` (owner C) e faz tudo: as opções, a barra
   * de andamento e a entrega dos arquivos. Aqui só sobra a linha da barra de
   * estado e o resumo do que saiu — que inclui, sempre, a frase de que MP4 não
   * sai daqui e o comando do ffmpeg pronto para copiar.
   */
  async exportImage(): Promise<void> {
    return shellFile.exportImage(this);
  }

  /**
   * "Exportar por pele…": um arquivo por personagem (requisito E3).
   *
   * A janela é de `io/export-skin.ts` e faz tudo: as caixas, os números que
   * mudam a cada clique e a gravação. Aqui só sobra a linha da barra de estado
   * e a lista do que saiu, que merece a janela inteira e não meia linha.
   */
  async exportBySkin(): Promise<void> {
    return shellFile.exportBySkin(this);
  }

  /**
   * "Arquivo → Reabrir o fechado" — item 105.
   *
   * O rascunho já era gravado a cada três segundos desde sempre, para o caso de
   * a aba morrer. O que faltava era a porta: sem ela, o trabalho ficava
   * guardado e ninguém tinha como pedir de volta.
   *
   * **Pergunta antes**, com a hora da gravação escrita na pergunta, porque
   * abrir o rascunho joga fora o que está aberto agora. E não apaga o rascunho
   * ao abrir: se a escolha foi errada, ele ainda está lá no minuto seguinte.
   */
  async reopenClosed(): Promise<void> {
    return shellFile.reopenClosed(this);
  }

  /**
   * "Arquivo → Repetir a última exportação" (`Ctrl+Shift+E`) — item 103.
   *
   * Exportar é gesto que se repete dez vezes por tarde: mexeu, exporta, olha no
   * jogo. Responder às mesmas cinco perguntas dez vezes é o atrito que faz
   * alguém parar de conferir no jogo.
   *
   * Sem nada guardado, ele **abre a janela normal** em vez de adivinhar. E o
   * que ele repete são as OPÇÕES, nunca o destino: onde gravar é sempre
   * pergunta do navegador, e nenhum programa de dentro da aba escreve em disco
   * sem essa pergunta.
   */
  async repeatExport(): Promise<void> {
    return shellFile.repeatExport(this);
  }

  /**
   * "Arquivo → Configurações do projeto…" — item 106.
   *
   * Três coisas que valem para o projeto inteiro e que ninguém achava: os
   * quadros por segundo do esqueleto, a cor de fundo da cena e a densidade da
   * grade.
   *
   * O FPS vai para o ARQUIVO, porque é do personagem — é o passo do quadro que
   * o jogo vai usar. Os outros dois são de quem olha, e vão para as opções de
   * ver, que já viajam no `RECORTE_editor_state`.
   *
   * Lote 46: "Ao trocar de animação tocando" é do tocador (opções de ver); o
   * "Tempo de mistura" vai para o arquivo, no `defaultMix` de cada animação.
   */
  async projectSettings(): Promise<void> {
    return shellFile.projectSettings(this);
  }

  /**
   * "Ajuda → Paleta de comandos" (`Ctrl+Shift+P`) — item 110.
   *
   * Sete menus e mais de cem entradas: a pergunta mais comum deste programa é
   * "eu sei que existe, mas em qual menu está?". A paleta responde com três
   * letras.
   *
   * Ela busca sobre a MESMA lista que desenha os menus, então um comando novo
   * aparece aqui no dia em que aparece lá. E mostra o atalho ao lado, porque
   * quem procura o mesmo comando duas vezes é quem devia estar usando a tecla.
   */
  async commandPalette(): Promise<void> {
    return shellFile.commandPalette(this);
  }

  /** "Ajuda → Manual": the manual, whole, in a new tab. */
  showManual(): void {
    return shellFile.showManual(this);
  }

  /**
   * "Importar de outro programa…": Spine, DragonBones or Spriter.
   *
   * This replaces the whole document, so it asks before throwing unsaved work
   * away, and the list of what did not survive the conversion goes on screen.
   */
  async importForeign(): Promise<void> {
    return shellFile.importForeign(this);
  }

  /**
   * "Importar PSD…": the art, straight out of Photoshop, layer by layer.
   *
   * Everything the import writes is one undo step, and everything it could not
   * carry over is on screen in the plain window before the user touches
   * anything — never only in the status bar.
   */
  async importPsdFile(bones = false): Promise<void> {
    return shellFile.importPsdFile(this, bones);
  }

  // "Reempacotar atlas" saiu no lote 62: o atlas nasce ao Salvar.

  /** One place for "it did not work", so every failure reads the same way. */
  async reportFailure(title: string, error: unknown): Promise<void> {
    return shellFile.reportFailure(this, title, error);
  }

  /** For tests: the entries of one menu, as they would be drawn right now. */
  menuEntries(label: string): Array<{ label: string; enabled: boolean }> {
    return shellFile.menuEntries(this, label);
  }

  /** For tests and for the keyboard: runs one menu entry by its label. */
  runMenuEntry(menu: string, label: string): void {
    return shellFile.runMenuEntry(this, menu, label);
  }

  // -------------------------------------------------------------------------
  // As ações que o shell mesmo faz
  // -------------------------------------------------------------------------

  /**
   * Liga no registro tudo o que é do shell: o arquivo, o desfazer, a ajuda e os
   * painéis. Os painéis e a cena registram as deles ao montar.
   */
  private registerShellActions(): void {
    return shellActions.registerShellActions(this);
  }

  /**
   * Traz um painel à vista pelo id, venha ele da coluna ou da faixa de baixo.
   *
   * Nos dois casos ele só ABRE: um item do menu Janela que fechasse o painel ao
   * ser clicado de novo faria o Humberto perder de vista justamente o que ele
   * foi buscar. Com os painéis escondidos pelo `Tab`, trazer um de volta traz a
   * coluna junto — pedir um painel e não ver nada seria pior que nada.
   */
  showPanel(id: string): void {
    return shellActions.showPanel(this, id);
  }

  /**
   * "Substituir nomes…" — item 73.
   *
   * Trocar `_esq` por `_e` em vinte ossos é vinte cliques e vinte chances de
   * errar, e cada osso é citado pelos filhos, pelos slots, pelas regras e por
   * toda chave da linha do tempo.
   *
   * A janela mostra **quantos e quais** antes de qualquer coisa acontecer, e o
   * que ela vai pular e por quê: renomear em cima de um nome que já existe
   * juntaria dois ossos num só, e desfazer não teria como separá-los.
   */
  async replaceNames(): Promise<void> {
    return shellActions.replaceNames(this);
  }

  /** Editar → Preferências: as escolhas que valem para todo arquivo. */
  showPrefs(): void {
    return shellActions.showPrefs(this);
  }

  /** Ajuda → Atalhos: a tabela, gerada dos próprios menus. */
  showShortcuts(): void {
    return shellActions.showShortcuts(this);
  }

  /** Ajuda → Sobre o Recorte. */
  showAbout(): void {
    return shellActions.showAbout(this);
  }

  /**
   * Arquivo → Abrir recente — anotação 22, lote 33.
   *
   * A lista sai numa janela com busca, e não num submenu: o submenu teria que
   * nascer e morrer a cada arquivo aberto, e o mesmo item de menu mudaria de
   * nome debaixo do dedo. Uma janela com busca é o mesmo caminho do "Virar
   * filho de…", que ele já conhece.
   */
  async openRecent(): Promise<void> {
    return shellActions.openRecent(this);
  }

  /**
   * Arquivo → Sair.
   *
   * Fechar a aba é do navegador, e uma aba que a pessoa não abriu por script
   * ele se recusa a fechar. Então: tenta fechar, e quando o navegador recusa,
   * diz o que fazer. O aviso de arquivo sujo é o `beforeunload` de sempre.
   */
  quit(): Promise<void> {
    return shellActions.quit(this);
  }

  /** `true` quando há osso ou desenho no arquivo para escolher. */
  hasAnythingToSelect(): boolean {
    return shellActions.hasAnythingToSelect(this);
  }

  /**
   * Editar → Selecionar tudo (`Ctrl+A`) — anotação 22.
   *
   * Todos os ossos e todos os desenhos, que é o que "tudo" quer dizer no
   * documento. As chaves têm o item próprio, **Selecionar todas as chaves**,
   * no menu Animação: são duas coisas diferentes e cada uma tem a sua porta.
   */
  /** `true` quando há alguma coisa escolhida — osso, slot ou desenho. */
  hasSelection(): boolean {
    return shellActions.hasSelection(this);
  }

  /**
   * **Escolher → Os filhos** e **Os pais** — lote 42, o gesto do Spriter.
   *
   * A conta é pura, do `doc/duplicate.ts`; aqui só se escolhe e se diz quantos.
   */
  selectFamily(which: 'filhos' | 'pais'): void {
    return shellActions.selectFamily(this, which);
  }

  selectAll(): void {
    return shellActions.selectAll(this);
  }

  /**
   * Esqueleto → Novo → Imagem no slot… — anotação 22.
   *
   * O que cria o slot a partir de uma imagem **já existe**: é arrastar a
   * miniatura do painel Imagens para a cena, desde o lote 20. O que faltava
   * era a porta no menu para quem não sabe do arrasto. Ela abre o painel e põe
   * o foco na busca, com o recado do gesto no rodapé.
   */
  newImageInSlot(): void {
    return shellActions.newImageInSlot(this);
  }

  /**
   * **Trocar a imagem em todas as peles…** — lote 39, Spriter 7.
   *
   * Abre o painel Imagens com a troca armada e o foco na busca: a próxima
   * imagem clicada troca em toda pele que usa a mesma naquele slot.
   */
  swapImageEverywhere(): void {
    return shellActions.swapImageEverywhere(this);
  }

  // -------------------------------------------------------------------------
  // Soltar arquivo na janela — anotação 23, lote 36
  // -------------------------------------------------------------------------

  /**
   * Aceita arquivo solto em qualquer canto da janela.
   *
   * Só arquivo: um arrasto de dentro do programa — a aba de um painel, a linha
   * da Árvore, a miniatura do painel Imagens — não carrega `Files` no
   * `dataTransfer`, e passa reto por aqui.
   *
   * Os ouvintes ficam no `document` porque a janela inteira é o alvo: quem
   * arrasta um `.bone` não mira o canvas, mira o programa.
   */
  private armFileDrop(): void {
    return shellDrop.armFileDrop(this);
  }

  /** A faixa "Solte para…", que diz o que vai acontecer ANTES de acontecer. */
  showDropBanner(text: string): void {
    return shellDrop.showDropBanner(this, text);
  }

  hideDropBanner(): void {
    return shellDrop.hideDropBanner(this);
  }

  /**
   * Faz o que o `dropPlan` decidiu.
   *
   * Cada caminho é o MESMO do menu: abrir, importar PSD, importar de outro
   * programa, pôr imagem no atlas. O arrasto é uma porta nova para portas que
   * já existiam, e não um segundo jeito de fazer as mesmas coisas.
   */
  async openDropped(files: readonly File[]): Promise<void> {
    return shellDrop.openDropped(this, files);
  }

  confirmDiscard(): Promise<boolean> {
    return shellDrop.confirmDiscard(this);
  }

  // -------------------------------------------------------------------------
  // Não perder o trabalho
  // -------------------------------------------------------------------------

  /**
   * Pergunta antes de fechar a aba, e guarda um rascunho a cada mudança.
   *
   * Fechar a aba, apertar F5 ou clicar num link com o arquivo sujo apagava uma
   * sessão inteira sem uma palavra. `beforeunload` traz a pergunta do próprio
   * navegador; o rascunho é a segunda rede, para o caso de a aba morrer sem
   * perguntar nada (queda de energia, aba derrubada por falta de memória).
   */
  private armUnloadGuard(): void {
    return shellDrop.armUnloadGuard(this);
  }

  /** `localStorage`, quando existe. Aba anônima e teste devolvem `null`. */
  draftStorage(): DraftStorage | null {
    return shellDrop.draftStorage(this);
  }

  /** Grava o rascunho, respeitando a espera — salvo na saída, que é agora. */
  saveDraft(now: boolean): void {
    return shellDrop.saveDraft(this, now);
  }

  // -------------------------------------------------------------------------
  // Keyboard
  // -------------------------------------------------------------------------

  /**
   * A tecla escrita ao lado do item do menu é a tecla que funciona.
   *
   * O mapa sai dos próprios menus (`shortcutMap`), então não há uma segunda
   * lista de teclas para envelhecer sozinha. Ele é consultado POR ÚLTIMO: quem
   * já trata uma tecla — a ferramenta da cena, as quatro teclas de ver e
   * travar, a letra que troca de ferramenta — continua tratando, e para o
   * evento ali. Uma tecla é atendida uma vez só.
   */
  private onKeyDown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const tag = target?.tagName ?? '';
    const typing = isTyping(target);

    if (event.ctrlKey || event.metaKey) {
      // J9: Ctrl+A, C, V e X num campo de texto são do texto (`textKeepsKey`).
      if (textKeepsKey(shortcutOfEvent(event), target)) return;
      // Ctrl+Shift+Z também refaz. Não está no menu — lá o refazer é Ctrl+Y —
      // mas é o gesto que meio mundo tem no dedo, e tirá-lo seria uma perda.
      if (event.key.toLowerCase() === 'z' && event.shiftKey) {
        event.preventDefault();
        this.doc.redo();
        return;
      }
      if (this.runShortcut(event)) return;
      return;
    }

    if (typing) return;
    // Espaço e Enter num botão são o clique do próprio botão. Roubá-los faria
    // o teclado deixar de apertar aquilo que está com o foco.
    if ((tag === 'BUTTON' || tag === 'A') && (event.key === ' ' || event.key === 'Enter')) return;

    if (event.key === 'Escape' && this.openMenu !== null) {
      this.closeMenu();
      return;
    }

    if (this.currentTool?.onKey?.(this.doc, event.key) === true) {
      event.preventDefault();
      return;
    }
    // 7 8 9 0 work anywhere in the window, not only with the canvas focused.
    if (!event.altKey && toggleViewKey(event.key, this.doc)) {
      event.preventDefault();
      return;
    }
    // A tecla de ferramenta vale sempre — degrau 4a: nenhuma ferramenta some
    // por modo. A casca faz a mesma conta da cena, pela mesma função.
    const daTecla = event.altKey ? null : toolOfKey(keyOf(event));
    if (daTecla !== null) {
      event.preventDefault();
      this.setTool(daTecla.id);
      return;
    }
    this.runShortcut(event);
  }

  /**
   * A tecla que sobe, para os gestos de segurar — o P do lote 31.
   *
   * A cena já trata a subida quando ela está com o foco, e para o evento ali.
   * Isto aqui é para quando o foco está em outro canto da janela: soltar o P
   * tem que terminar o gesto de qualquer jeito, senão o modo fica preso.
   */
  private onKeyUp(event: KeyboardEvent): void {
    if (isTyping(event.target)) return;
    this.currentTool?.onKeyUp?.(this.doc, event.key);
  }

  /**
   * **Diz uma frase no rodapé** — P44 (29/09/2026). O mesmo que escrever em
   * `statusState.textContent`, que também passa pelo setter de
   * `falarPorUmLugar`; este é o nome para quem escreve daqui em diante.
   */
  dizer(texto: string): void {
    this.statusState.textContent = texto;
  }

  /** Procura a tecla no mapa dos menus e roda a ação. `false` = tecla livre. */
  private runShortcut(event: KeyboardEvent): boolean {
    const veredito = judgeShortcut(shortcutOfEvent(event), {
      map: this.shortcuts(),
      exists: hasAction,
      run: runAction,
      labelOf: (action) => actionRow(action)?.label ?? null,
      needsPanel: (action) => actionRow(action)?.needsPanel === true,
      pretty: prettyKey,
    });
    if (veredito.kind === 'livre' || veredito.kind === 'cinza') return false;
    // A tecla que cala (28/09/2026): está na tabela e a ação não existe. A
    // tecla é nossa — o navegador não a recebe — e o rodapé diz por quê.
    if (veredito.kind === 'muda') this.doc.notice(veredito.notice);
    event.preventDefault();
    return true;
  }

  /**
   * O mapa de teclas, refeito a cada tecla apertada.
   *
   * Refazer parece caro e não é: são sete listas curtas, e em troca uma entrada
   * que muda de estado — um painel que abriu, uma animação que fechou — nunca
   * deixa o mapa falando de um programa que já não existe.
   *
   * Lote A1: sai da tabela de `ui/keys.ts`, escopo `toda-parte`.
   */
  private shortcuts(): Map<string, string> {
    return keyMap(liveTable(keyTable(this.groups())));
  }
}

/** Builds the shell inside `root`. */
/**
 * Os nomes dos arquivos de um arrasto **antes de soltar**.
 *
 * Durante o `dragover` o navegador não deixa ler o conteúdo, e em muitos casos
 * nem o nome: o que ele dá é a LISTA de tipos, com um item por arquivo. Daí a
 * faixa usar o nome quando ele existe (`items[i].getAsFile()` funciona no
 * Chrome) e cair no tipo MIME quando não existe.
 */
export function namesOfDrag(event: DragEvent): string[] {
  const dados = event.dataTransfer;
  if (dados === null) return [];
  const nomes: string[] = [];
  for (const item of [...dados.items]) {
    if (item.kind !== 'file') continue;
    const arquivo = item.getAsFile();
    if (arquivo !== null && arquivo.name !== '') { nomes.push(arquivo.name); continue; }
    // Sem nome: o tipo vira uma extensão que o `dropPlan` entende.
    const tipo = item.type;
    if (tipo.startsWith('image/')) nomes.push(`arrasto.${tipo.slice(6)}`);
    else if (tipo === 'image/vnd.adobe.photoshop') nomes.push('arrasto.psd');
    else nomes.push('arrasto');
  }
  return nomes;
}

export function mountShell(doc: Doc, root: HTMLElement): Shell {
  return new Shell(doc, root);
}
