/**
 * The viewport (owner B): the central area where the skeleton is drawn and
 * edited. It is a `Panel` of the contract, with the id `viewport`, so the
 * shell can place it like any other panel.
 *
 * What happens here, in order, every frame:
 *   0. clear, then the reference image, if there is one — it is the guide the
 *      skeleton is built over, so nothing may hide it and it hides nothing;
 *   1. the grid and the axes in screen space (Y up, spec 3);
 *   2. the skeleton, with the runtime's own `CanvasRenderer`, so what the
 *      editor shows is exactly what a game would show;
 *   3. the guides on top: bones, selection, bounding boxes, points;
 *   4. the active tool's handles.
 *
 * Every guide is drawn with a thickness in SCREEN pixels, so zooming in does
 * not turn the bones into fat slabs.
 */

// @ts-ignore -- the stylesheet is handled by Vite, not by TypeScript.
import { evalFieldInput } from '../panels/properties-model.js';
import { setViewCenterSource, setViewPanSink } from './view-center.js';
import './viewport.css';
import { clickKeepsBone } from '../doc/own-bone.js';
import { garantirAninhado, projetoDe } from '../doc/projeto.js';

import { bindModeSceneClick } from '../panels/mesh-panel-model.js';
import { emptySelection, getTool, registerPanel, readEditorState, type ChangeKind, type DocChange, type EditorDoc, type Panel, type ToolEvent, corpoDe, skeletonsDe } from '../contract.js';
import { CanvasRenderer, type AtlasPageData, type Bone, type Skeleton, type Slot } from '../../../runtime/src/index.js';
import { Camera } from './camera.js';
import { RULER_SIZE } from './rulers.js';
import { VIEW_TOGGLE_KEYS, changeViewSettings, currentLocks, editingSkinOf, onViewSettings, toggleViewKey, viewSettings } from './onion.js';
import { switchNotice } from '../panels/view-panel-actions.js';
import { addGuide, guideFromRuler, guideLabel, rulerAt } from './guides-model.js';
import { pickAll, pickAt, selectionFor, setAlphaSampler, withChosen } from './picking.js';
import { aroundGridOptions } from '../panels/entities-actions.js';
import { requestImageGrid } from '../ui/picker-hook.js';
import { ensureProvisional } from '../io/folder-atlas.js';
import { gridTarget, takeOutTarget } from '../panels/image-picker-model.js';
import { slotMarkOf } from '../panels/slot-base-model.js';
import { imageOf } from '../panels/skins-model.js';
import {
  COMPENSATION_LABELS, HANDLE_SPACES, getCompensation, getHandleSpace,
  onCompensationChange, onHandleSpaceChange, setCompensation, setHandleSpace,
  type CompensationFlags, type HandleSpace,
} from './tools/space.js';
import { hasAction, registerAction, runAction } from '../ui/actions.js';
import { WELCOME_BUTTONS, isEmptyDocument } from './welcome-model.js';
import { COMPENSATION_ACTIONS } from '../ui/menus.js';
import { nudgeFor, nudgeSelection, selectTool } from './tools/select.js';
import { nudgeDrawings } from './tools/drawing-group.js';
import { invertSelection } from '../panels/tree-model.js';
import { orderDirOfActions, orderTargets, runOrderStep } from '../panels/draw-order-model.js';
import { actionsFor, isTyping, keyOf } from '../ui/keys.js';
import { resetToSetup } from '../anim/pose-mode.js';
import { isBoneLocked as boneLocked, isSlotLocked as slotLocked } from './onion.js';
import { formatZoomPercent, parseZoomPercent, selectionBounds, zoomNotice } from './zoom-model.js';
import { paintIcon } from '../ui/icons.js';
import { DRAG_TYPE, DropImageAsSlot, appearNotice, dropPlace } from '../panels/palette-model.js';
import {
  DropEntityAsSlot, ENTITY_DRAG_TYPE, entityDropNotice, entityDropPlace, firstAnimationOf,
} from '../doc/drop-entity.js';
import { onThemeChange, themeColors } from '../ui/theme.js';
import { onBrushChange } from './tools/weights-tool.js';
import type { ActionBarGroup } from '../ui/action-bar-model.js';

/**
 * De que caixa de `viewSettings` cada um dos quatro botões de texto vive.
 *
 * A barra fala em ids de ação (`ver-ossos`), e o estado da cena fala em campos
 * (`bones`). Esta é a única ponte entre os dois, escrita uma vez.
 */
export const SEE_LOCK_KEYS: Readonly<Record<string, string>> = Object.freeze({
  'ver-ossos': 'bones',
  'travar-ossos': 'lockBones',
  'ver-desenhos': 'drawings',
  'travar-desenhos': 'lockDrawings',
});
import { spaceGesture, startsPan } from './space-gesture.js';
import { childInSelection, chooseBoneNotice, parentGesture } from './parent-gesture.js';
import { folderImageNames, onFolderChange } from '../io/project-folder.js';
import { onPrefsChange } from '../ui/prefs.js';
import { onKeySwapsChange } from '../ui/key-swaps.js';

// The tools register themselves when their module is loaded.
import './tools/select.js';
import './tools/transform-tool.js';
import { getActiveTool, noToolBackNotice, onActiveToolChange, setActiveTool, toolBack, toolOfKey } from './tools/registry.js';
import './tools/translate.js';
import './tools/rotate.js';
import './tools/shear.js';
import './tools/scale.js';
import './tools/create-bone.js';
import './tools/point-tool.js';
import './tools/box-tool.js';
import './tools/pose-tool.js';
import './tools/mesh-tool.js';
import './tools/weights-tool.js';
import * as viewportToolbar from './viewport-toolbar.js';
import * as viewportDraw from './viewport-draw.js';
import { EMITTER_MARK_PIXELS, renewsParticleCache } from './particles-view.js';
import { selectedEmitterShapes, shapeHandleAt, shapeHandleCommand, type SelectedShape, type ShapeHandle } from './emitter-shape.js';
import { GestureNotice, gestureSays } from './gesture-notice.js';
import {
  CROP_DRAW_CURSOR, CROP_HANDLE_PIXELS, CROP_MIN_DRAW_PIXELS, CROP_NEEDS_ANIMATION, CROP_ZONE_CURSOR, SetCrop,
  cropEditing, cropFromCorners, cropInFile, cropSays, cropZoneAt, cropZoneHint, dragCrop, hasCropField,
  onCropEditing, removeCrop, setCropEditing, startCropEditing, type CropBox, type CropZone,
} from './crop-model.js';
import { CropNumbersBox } from './crop-box.js';
// 05/11/2026: as tomadas na cena — o ícone no osso, e o botão direito no osso.
import { TomadasLayer, abrirMenuDaTomada } from '../panels/tomadas.js';
import { HELD_DOOR, drifted, gripOfLabel, heldNotice, rulesOn, type BoneNumbers } from './held-by-rule.js';

// ---------------------------------------------------------------------------
// Colours. High contrast on a light grey ground, as the interface rules ask.
// ---------------------------------------------------------------------------

/**
 * As cores da cena — do lote 18 em diante, as do TEMA em uso.
 *
 * Era um objeto congelado, e por isso a cena era a única parte do programa que
 * não sabia trocar de tema: os painéis liam variáveis do CSS e ela não lia
 * nada. Agora `COLOR` é uma função que devolve as cores de `ui/theme.ts`, com
 * os mesmos nomes de antes — quem desenha não mudou uma linha além do
 * `COLOR().` virar `COLOR().`.
 *
 * Ler o tema é uma leitura de objeto, não do `getComputedStyle`: uma chamada
 * por quadro de desenho ao motor de estilo seria cara, e a resposta é a mesma
 * até alguém trocar de tema.
 *
 * A máscara é rosa forte de propósito, diferente do verde da caixa de colisão.
 */
export function COLOR(): {
  background: string; grid: string; gridStrong: string; axisX: string; axisY: string;
  bone: string; boneFill: string; boneSelected: string; slotSelected: string;
  boundingBox: string; point: string; clipping: string;
} {
  const t = themeColors();
  return {
    background: t.sceneBackground,
    grid: t.sceneGrid,
    gridStrong: t.sceneGridStrong,
    axisX: t.sceneAxisX,
    axisY: t.sceneAxisY,
    bone: t.sceneBone,
    boneFill: t.sceneBoneFill,
    boneSelected: t.sceneBoneSelected,
    slotSelected: t.sceneSlotSelected,
    boundingBox: t.sceneBox,
    point: t.scenePoint,
    clipping: t.sceneClipping,
  };
}

export const BONE_LINE_PIXELS = 2;
export const BONE_ROOT_PIXELS = 12;
export const POINT_PIXELS = 9;
/** Size of a bone name, in screen pixels. Never smaller: the rules ask 14 px. */
export const NAME_PIXELS = 14;
/** Quanto o ponteiro tem que ficar parado para a etiqueta do nome aparecer. */
const HOVER_DELAY_MS = 300;

/** Size of a bone icon, in screen pixels. Bigger than the name, on purpose. */
export const ICON_PIXELS = 16;

// ---------------------------------------------------------------------------
// Active tool, shared with the shell
// ---------------------------------------------------------------------------

// Mora em `tools/registry.ts` desde o lote A4. Os nomes continuam saindo daqui.
export { TOOL_BACK_NOTICE, forgetToolBackNotice, getActiveTool, getActiveToolId, getPreviousToolId, onActiveToolChange, previousToolFor, setActiveTool, toolBack, toolOfKey } from './tools/registry.js';

// ---------------------------------------------------------------------------
// Small drawing helpers
// ---------------------------------------------------------------------------

/** Anything that can put its vertices in the world; see `picking.ts`. */
export interface WorldVertices {
  computeWorldVertices(
    slot: Slot, out?: Float64Array | number[], offset?: number, stride?: number,
  ): Float64Array | number[];
  readonly triangles?: Int32Array;
  readonly vertexCount?: number;
  /** Meshes list their outline vertices first; this is how many there are. */
  readonly hull?: number;
}

/**
 * The document keeps the camera so saving can put it back in the file. The
 * contract does not declare the field yet (see PEDIDOS-CONTRATO, item 4), so
 * it is read structurally and simply skipped when it is absent.
 */
export interface DocWithCamera {
  camera?: { x: number; y: number; zoom: number } | null;
  /** Closes the run of commands a drag merged into one (PEDIDOS, item 3). */
  endMerge?: () => void;
}

/** A `point` attachment, read structurally so no private class is imported. */
export interface WorldPoint {
  computeWorldPosition(bone: Bone, out?: { x: number; y: number }): { x: number; y: number };
  computeWorldRotation(bone: Bone): number;
}

export function strokePolygon(
  ctx: CanvasRenderingContext2D, vertices: ArrayLike<number>, count: number,
  color: string, worldWidth: number,
): void {
  if (count < 2) return;
  ctx.strokeStyle = color;
  ctx.lineWidth = worldWidth;
  ctx.beginPath();
  ctx.moveTo(vertices[0], vertices[1]);
  for (let i = 1; i < count; i++) ctx.lineTo(vertices[i * 2], vertices[i * 2 + 1]);
  ctx.closePath();
  ctx.stroke();
}

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

const LISTENS: readonly ChangeKind[] = ['file', 'structure', 'transform', 'selection', 'time', 'assets'];

export class ViewportPanel implements Panel {
  readonly id = 'viewport';
  readonly title = 'Cena';
  readonly listensTo = LISTENS;

  readonly camera = new Camera();

  doc: EditorDoc | null = null;
  root: HTMLElement | null = null;
  canvas: HTMLCanvasElement | null = null;
  /** O palco do canvas: a grade de imagens (lote 60b) mora nele, por cima. */
  stage: HTMLElement | null = null;
  ctx: CanvasRenderingContext2D | null = null;
  renderer: CanvasRenderer | null = null;
  private observer: ResizeObserver | null = null;
  private unsubscribe: (() => void) | null = null;
  private unsubscribeTool: (() => void) | null = null;
  private unsubscribeView: (() => void) | null = null;
  /** A pasta do projeto mudou — lote 59: as boas-vindas contam as imagens dela. */
  private unsubscribeFolder: (() => void) | null = null;
  private frame = 0;

  needsDraw = true;

  /** A caixa das boas-vindas do documento vazio — anotação 24, lote 36. */
  private welcome: HTMLElement | null = null;
  /** `true` depois de "Começar vazio": a caixa não volta neste documento. */
  private welcomeOff = false;

  /** A classe de cursor que a ferramenta pediu por último, ou `null`. */
  private toolCursorClass: string | null = null;

  pointerDown = false;
  /**
   * F1 (rodada final, 29/09/2026): o recado dito com a mão embaixo morria no
   * `repose` do quadro seguinte. Ele fica guardado aqui e volta ao soltar.
   */
  private readonly gestureNotice = new GestureNotice();
  private panning = false;
  private spaceHeld = false;
  /** Lote 68: quando o Espaço desceu, e quanto a vista andou com ele embaixo. */
  private spaceDownAt = 0;
  private spaceMoved = 0;
  /**
   * O Espaço está embaixo em QUALQUER lugar da janela — rodada 46, lote 4 (doc
   * `66`, §2.6). Com o foco na Árvore, o Espaço segurado não chegava à cena,
   * e o arrasto virava retângulo e desmarcava o escolhido. Só se escuta:
   * quem trata a tecla continua sendo quem tem o foco.
   */
  private spaceAnywhere = false;
  private forgetSpaceAnywhere: (() => void) | null = null;
  lastScreenX = 0;
  lastScreenY = 0;
  private lastWorldX = 0;
  private lastWorldY = 0;
  toolButtons = new Map<string, HTMLButtonElement>();
  spaceButtons = new Map<HandleSpace, HTMLButtonElement>();
  /** Os quatro de ver e travar, por id de ação — lote 17. */
  readonly lockButtons = new Map<string, HTMLButtonElement>();
  /** Todo botão da barra de ações, por id, para acender e apagar. */
  readonly barButtons = new Map<string, HTMLButtonElement>();
  /** O que desfazer no registro quando a barra for construída de novo. */
  forgetToolActions: Array<() => void> = [];
  private unsubscribeSpace: (() => void) | null = null;
  private unsubscribeCompensation: (() => void) | null = null;
  private unsubscribeCrop: (() => void) | null = null;
  /** O que desfazer no registro de ações quando a cena for desmontada. */
  private forgetActions: Array<() => void> = [];
  /** O campo "100%" da camada do canto, para o zoom da roda aparecer nele. */
  private zoomField: HTMLInputElement | null = null;
  private unsubscribePrefs: (() => void) | null = null;
  private unsubscribeKeys: (() => void) | null = null;
  private unsubscribeTheme: (() => void) | null = null;
  private unsubscribeBrush: (() => void) | null = null;
  /**
   * O que está sob o cursor, e desde quando — item 59.
   *
   * A etiqueta só aparece com o ponteiro PARADO por um tempo. Aparecendo a cada
   * pixel, ela seria uma placa correndo pela tela junto com o mouse, e ninguém
   * conseguiria ler nem o desenho nem ela.
   */
  private hover: { name: string; x: number; y: number } | null = null;
  private hoverTimer = 0;
  /** A lista dos Eixos, que substituiu os três botões. */
  spacePick: HTMLSelectElement | null = null;
  /** A imagem de referência já carregada, e de que nome ela veio — item 62. */
  referenceImage: HTMLImageElement | null = null;
  referenceName: string | null = null;
  /** O endereço temporário do blob, que precisa ser devolvido ao navegador. */
  referenceUrl: string | null = null;
  /** Onde a imagem arrastada vai cair, em mundo, enquanto o dedo não solta. */
  private dropHint: { x: number; y: number } | null = null;

  // -- lifecycle -------------------------------------------------------------

  mount(doc: EditorDoc, host: HTMLElement): void {
    this.doc = doc;
    host.classList.add('viewport-host');
    // Rodada 15, linha 6: o meio do que a câmera mostra, para o emissor novo
    // nascer onde se vê (`view-center.ts`).
    setViewCenterSource(() => {
      const canvas = this.canvas;
      if (canvas === null) return null;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) return null;
      const at = this.camera.screenToWorld(w / 2, h / 2);
      return { x: at.x, y: at.y };
    });
    // Rodada 39b (doc 36): quem tira o boneco da âncora anda a vista junto.
    setViewPanSink((dx, dy) => {
      this.camera.x += dx;
      this.camera.y += dy;
      this.cameraChanged();
    });

    const root = document.createElement('div');
    root.className = 'viewport';
    root.tabIndex = 0;
    this.root = root;

    /*
     * A barra de ações vai para a linha da janela inteira, se a casca tiver
     * emprestado uma — lote 17. Sem ela (um teste, outro hospedeiro), a barra
     * volta para dentro da cena, como era: o painel continua funcionando
     * sozinho.
     */
    const barHost = document.querySelector('.action-bar-host');
    const bar = this.buildToolbar(doc);
    if (barHost instanceof HTMLElement) barHost.replaceChildren(bar);
    else root.appendChild(bar);

    // O canvas vive dentro de um palco, porque a camada do zoom fica POR CIMA
    // dele, no canto. Sem esse palco não há a que prender o canto: `.viewport`
    // é uma coluna, e um filho absoluto dela cobriria a barra também.
    const stage = document.createElement('div');
    stage.className = 'viewport-palco';

    const canvas = document.createElement('canvas');
    canvas.className = 'viewport-canvas';
    canvas.setAttribute('aria-label', 'Área de desenho do boneco');
    stage.appendChild(canvas);
    stage.appendChild(this.buildZoomCorner());
    // N-4b: os números do recorte, no canto oposto ao do zoom.
    this.cropBox = new CropNumbersBox((d) => { d.notice(this.cropDoneNotice(d)); this.root?.focus(); });
    stage.appendChild(this.cropBox.node);
    stage.appendChild(this.tomadas.node);
    // As boas-vindas do documento vazio — anotação 24. Ela mora no palco, por
    // cima do canvas, e some sozinha no primeiro osso ou na primeira imagem.
    this.welcome = this.buildWelcome();
    stage.appendChild(this.welcome);
    // Lote 68: o programa abre vazio, e nada muda o documento ao começar —
    // antes era o herói entrando que acertava a caixa. Acerta agora, e de novo
    // no primeiro quadro: o `main.ts` registra o "Abrir o herói" logo depois
    // de montar, e o botão dele só aparece quando a ação existe.
    this.syncWelcome();
    requestAnimationFrame(() => this.syncWelcome());
    root.appendChild(stage);
    this.canvas = canvas;
    this.stage = stage;
    // Lote 60c: o clique lê o pixel da página, e passa direto pelo transparente.
    setAlphaSampler((page, u, v) => this.alphaAt(page, u, v));

    host.appendChild(root);

    const ctx = canvas.getContext('2d');
    if (ctx !== null) {
      this.ctx = ctx;
      this.renderer = new CanvasRenderer(ctx, {
        images: (page: AtlasPageData) => doc.imageFor(page),
        debug: {},
      });
    }

    // The document is the first source; the file's own extension is the fallback.
    const saved = (doc as EditorDoc & DocWithCamera).camera ?? readEditorState(doc.file).camera;
    this.camera.fromState(saved);
    this.attachEvents();

    this.observer = new ResizeObserver(() => {
      this.resize();
      this.needsDraw = true;
    });
    this.observer.observe(canvas);
    this.resize();

    this.unsubscribe = doc.on((change) => {
      this.needsDraw = true;
      this.gestureNotice.hear(change);
      // N-4b: o recorte é de cada animação. Abrir a base, ou outro arquivo,
      // desliga o modo — os puxadores não ficam valendo para coisa nenhuma.
      if (cropEditing() && (change.kind === 'file' || doc.animation === null)) setCropEditing(false);
      // Prova de pessoa (05/11/2026): trocar de BASE (Bases → mecha) mantinha
      // o zoom e o lugar da base de antes, e o mecha caía meio fora da cena,
      // com o ícone da cabine quase na régua. Base nova, vista ajustada.
      const foco = projetoDe(doc)?.emFocoUri ?? null;
      if (foco !== this.focoVisto) {
        const antes = this.focoVisto;
        this.focoVisto = foco;
        if (antes !== null && foco !== null) this.fitToScreen();
      }
      this.cropBox?.sync(doc);
    });
    this.unsubscribeView = onViewSettings(() => { this.syncLockButtons(); this.needsDraw = true; });
    this.unsubscribeFolder = onFolderChange(() => this.syncWelcome());
    this.unsubscribeTool = onActiveToolChange(() => {
      this.syncToolButtons();
      this.needsDraw = true;
    });
    this.unsubscribeSpace = onHandleSpaceChange(() => {
      this.syncSpaceButtons();
      this.needsDraw = true;
    });
    this.unsubscribeCompensation = onCompensationChange(() => { this.needsDraw = true; });
    // N-4b: o modo Recorte na cena muda o desenho e o cursor.
    this.unsubscribeCrop = onCropEditing((on) => {
      this.root?.classList.toggle('recorte-ligado', on);
      if (this.doc !== null) this.cropBox?.sync(this.doc);
      if (!on) {
        this.setCropCursor(null);
        if (this.canvas !== null && this.canvas.title.startsWith('Recorte:')) this.canvas.title = '';
      }
      this.needsDraw = true;
    });
    this.unsubscribePrefs = onPrefsChange(() => this.syncToolNames());
    this.unsubscribeKeys = onKeySwapsChange(() => viewportToolbar.syncToolKeys(this));
    // Trocar de tema muda as cores da cena, e a cena é canvas: ela não recebe
    // o CSS de graça como os painéis. Um pedido de desenho basta — `COLOR()`
    // já lê o tema novo.
    this.unsubscribeTheme = onThemeChange(() => { this.needsDraw = true; });
    // Rodada 41, lote 4 (conferência da v32.2): mudar o Raio pela caixa deixava
    // o círculo velho na cena até o mouse voltar. O pincel avisa; a cena redesenha.
    this.unsubscribeBrush = onBrushChange(() => { this.needsDraw = true; });

    this.registerActions(doc);

    const loop = (): void => {
      // O cursor é acertado no laço, e não no evento, porque a tecla de um
      // gesto de segurar pode ser solta com o foco em qualquer canto da
      // janela: quem atende ali é a casca, e a ordem dos ouvintes não é nossa.
      // Uma comparação por quadro, e o DOM só é tocado quando a classe muda.
      this.syncToolCursor();
      if (this.pointerDown) {
        // Rodada 46, lote 1: o quadro leva o recado do gesto, e o rodapé
        // mostra o número enquanto a mão arrasta (antes: só ao soltar).
        this.doc?.repose(this.gestureNotice.current() ?? undefined);
        this.needsDraw = true;
      }
      if (this.needsDraw) {
        this.needsDraw = false;
        this.draw();
      }
      this.frame = requestAnimationFrame(loop);
    };
    this.frame = requestAnimationFrame(loop);
  }

  refresh(_change: DocChange): void {
    // Conserto 5 da conferência (05/10/2026), a causa de verdade: o desenhador
    // do runtime guarda a curva de emissão de cada emissor pelo NOME e nunca a
    // esquece (`runtime/src/render/canvas.ts`). Mudar a Taxa trocava o arquivo e
    // a cena seguia desenhando com a taxa velha — 40 ou 200, o mesmo quadro.
    // Quando a estrutura muda, o desenhador é outro, como o `shell.ts` já faz
    // com o cache dos avisos.
    if (renewsParticleCache(_change.kind) && this.ctx !== null && this.doc !== null) {
      const doc = this.doc;
      this.renderer = new CanvasRenderer(this.ctx, {
        images: (page: AtlasPageData) => doc.imageFor(page),
        debug: {},
      });
    }
    this.needsDraw = true;
    this.syncWelcome();
    // Desfazer, Refazer e Colar acendem e apagam com o que há na pilha.
    this.syncEditButtons();
    this.syncReference();
  }

  unmount(): void {
    this.forgetSpaceAnywhere?.();
    this.forgetSpaceAnywhere = null;
    setAlphaSampler(null);
    for (const forget of this.forgetActions) forget();
    this.forgetActions = [];
    this.unsubscribeTheme?.();
    this.unsubscribeBrush?.();
    this.unsubscribeTheme = null;
    if (this.frame !== 0) cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.observer?.disconnect();
    this.observer = null;
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.unsubscribeTool?.();
    this.unsubscribeTool = null;
    this.unsubscribeView?.();
    this.unsubscribeView = null;
    this.unsubscribeFolder?.();
    this.unsubscribeFolder = null;
    this.unsubscribeSpace?.();
    this.unsubscribeSpace = null;
    this.unsubscribeCompensation?.();
    this.unsubscribeCompensation = null;
    this.unsubscribeCrop?.();
    this.unsubscribeCrop = null;
    this.unsubscribePrefs?.();
    this.unsubscribePrefs = null;
    this.unsubscribeKeys?.();
    this.unsubscribeKeys = null;
    if (this.hoverTimer !== 0) clearTimeout(this.hoverTimer);
    this.hoverTimer = 0;
    this.hover = null;
    this.spacePick = null;
    this.root?.remove();
    this.root = null;
    this.zoomField = null;
    this.canvas = null;
    this.ctx = null;
    this.renderer = null;
    this.doc = null;
  }

  // -- ações -----------------------------------------------------------------

  /**
   * Liga as ações da cena no registro, para o menu chegar nelas.
   *
   * Cada uma chama a MESMA função que o botão da barra chama. Não há uma
   * segunda cópia: dois caminhos para o mesmo lugar se separam com o tempo.
   */
  private registerActions(doc: EditorDoc): void {
    for (const forget of this.forgetActions) forget();
    this.forgetActions = [
      // Rodada 46, lote 4: o zoom pelo teclado e pelo menu diz o % no rodapé.
      registerAction('aproximar', { run: () => { this.zoomFromButton(1); this.sayZoom(); } }),
      registerAction('afastar', { run: () => { this.zoomFromButton(-1); this.sayZoom(); } }),
      registerAction('ajustar', { run: () => { this.fitToScreen(); this.sayZoom(); } }),
      registerAction('tamanho-real', { run: () => { this.zoomTo(1); this.sayZoom(); } }),
      registerAction('enquadrar', { run: () => { this.frameSelection(); this.sayZoom(); } }),

      // ---- Montar mais rápido — itens 72 e 56 ---------------------------
      registerAction('repouso-osso', {
        run: () => this.resetPose(doc, doc.selection.bones),
      }),
      registerAction('repouso-todos', {
        run: () => this.resetPose(doc, corpoDe(doc).file.bones.map((bone) => bone.name)),
      }),
      registerAction('inverter-selecao', {
        run: () => {
          const locks = currentLocks();
          const next = invertSelection(corpoDe(doc).file, doc.selection, {
            bone: (name) => !boneLocked(name, locks),
            slot: (name) => !slotLocked(name, locks),
          });
          doc.select(next);
          const quantos = next.bones.length + next.slots.length;
          doc.notice(quantos === 0
            ? 'Nada sobrou para escolher'
            : `${quantos} escolhido${quantos === 1 ? '' : 's'}. Travado e escondido ficaram de fora`);
        },
      }),
      registerAction('virar-filho', { run: () => this.reparentHint(doc) }),
      // ---- As duas portas do botão direito — tarefa 7.5, defeito A7 -----
      registerAction('ferramenta-de-antes', { run: () => this.toolBackFromMenu() }),
      registerAction('opcoes-do-desenho', { run: () => this.drawingOptionsFromMenu(doc) }),
      // 'copiar-ordem-animacao' morava aqui desde o lote 66, só porque a cena
      // está sempre montada. Lote A2: mora em `draw-order-actions.ts`.
      registerAction('imagem-referencia', { run: () => void this.referenceWindow(doc) }),
      // N-4b: o recorte da exportação, arrastado na cena.
      registerAction('recorte-na-cena', {
        run: () => this.toggleCropEditing(doc),
        enabled: () => doc.animation !== null,
        checked: () => cropEditing(),
      }),
      registerAction('tirar-recorte', {
        run: () => { doc.notice(removeCrop(doc)); this.needsDraw = true; },
        enabled: () => hasCropField(doc.file, doc.animation),
      }),
      ...COMPENSATION_LABELS.map(({ id }) => registerAction(COMPENSATION_ACTIONS[id], {
        run: () => setCompensation({ [id]: !getCompensation()[id] } as Partial<CompensationFlags>),
        checked: () => getCompensation()[id],
      })),
      ...HANDLE_SPACES.map(({ id }) => registerAction(`eixos-${id}`, {
        run: () => setHandleSpace(id),
        checked: () => getHandleSpace() === id,
      })),
    ];
  }

  /**
   * *Recorte na cena* — N-4b. Liga (criando o retângulo em volta do desenho
   * quando a animação não tem um) ou desliga. O rodapé diz o que aconteceu.
   */
  toggleCropEditing(doc: EditorDoc): void {
    if (cropEditing()) {
      setCropEditing(false);
      doc.notice(this.cropDoneNotice(doc));
      return;
    }
    doc.notice(startCropEditing(doc));
    this.root?.focus();
    this.needsDraw = true;
  }

  /** A frase de quando o modo desliga: o que ficou gravado. */
  private cropDoneNotice(doc: EditorDoc): string {
    const box = cropInFile(doc.file, doc.animation);
    return box === null
      ? 'Recorte na cena desligado'
      : `Recorte na cena desligado. Ficou ${cropSays(box)}; a exportação usa com "A área desenhada nesta animação"`;
  }

  /** Troca a classe de cursor do recorte na cena. */
  private setCropCursor(wanted: string | null): void {
    const canvas = this.canvas;
    if (canvas === null) return;
    if (this.cropCursorClass !== null && this.cropCursorClass !== wanted) canvas.classList.remove(this.cropCursorClass);
    if (wanted !== null) canvas.classList.add(wanted);
    this.cropCursorClass = wanted;
  }

  /** A zona do recorte debaixo de um ponto do mundo, com o raio do puxador. */
  private cropZoneUnder(doc: EditorDoc, x: number, y: number): { box: CropBox | null; zone: CropZone | null } {
    const box = cropInFile(doc.file, doc.animation);
    if (box === null) return { box: null, zone: null };
    const raio = (CROP_HANDLE_PIXELS / 2 + 3) / this.camera.zoom;
    return { box, zone: cropZoneAt(box, x, y, raio) };
  }

  /**
   * "Ferramenta de antes" pelo menu — tarefa 7.5.
   *
   * O mesmo `toolBack` do botão direito, com a mesma frase no rodapé: uma
   * função, dois caminhos.
   */
  private toolBackFromMenu(): void {
    const back = toolBack(this.doc);
    const tool = back === null ? null : getTool(back);
    this.doc?.notice(tool === null
      ? noToolBackNotice(getActiveTool()?.label ?? null)
      : `Ferramenta: ${tool.label}`);
    this.needsDraw = true;
  }

  /**
   * "Opções do desenho…" pelo menu — tarefa 7.5.
   *
   * Abre a grade do desenho **escolhido**, em vez do desenho sob o ponteiro.
   * Sem desenho escolhido, diz o que falta em vez de não fazer nada (regra 21).
   */
  private drawingOptionsFromMenu(doc: EditorDoc): void {
    const picked = doc.selection.attachments[0];
    const slot = picked?.slot ?? doc.selection.slots[0];
    const attachment = picked?.attachment
      ?? (slot === undefined
        ? undefined
        : (corpoDe(doc).file.slots ?? []).find((entry) => entry.name === slot)?.attachment);
    if (slot === undefined || typeof attachment !== 'string') {
      doc.notice('Escolha um desenho primeiro: as opções são dele');
      return;
    }
    if (!this.openDrawingOptions(doc, slot, attachment)) {
      doc.notice(`"${attachment}" não tem opções de imagem: elas são do desenho com imagem`);
    }
  }

  /**
   * "Voltar à pose de repouso" — item 72.
   *
   * Em Animando grava a chave com o valor da montagem. Em Montagem não há o que
   * fazer, e a barra de baixo diz isso em vez de deixar a tecla parecer quebrada.
   */
  private resetPose(doc: EditorDoc, bones: readonly string[]): void {
    if (doc.animation === null) {
      doc.notice('Com a base aberta, a pose de repouso já é esta. Abra uma animação para chavear');
      return;
    }
    if (bones.length === 0) {
      doc.notice('Escolha um osso, ou use "Voltar todos à pose de repouso"');
      return;
    }
    const quantos = resetToSetup(doc, bones);
    doc.notice(quantos === 0
      ? 'Nada a gravar'
      : `${bones.length === 1 ? bones[0] : `${bones.length} ossos`} de volta à pose de repouso`);
  }

  /**
   * "Virar filho de…" no menu — lote 63a: **o P é um gesto só**.
   *
   * A janela com a lista de ossos saiu. O Humberto: *"ISSO NÃO TEM NO
   * SPRITER. É SÓ ESCOLHER O OSSO, APERTAR P E IR VIRANDO PAI DE QUEM EU
   * CLICAR."* O item fica no menu como porta para quem procura a função: ele
   * só diz, no rodapé, a mesma frase que o P diz.
   */
  private reparentHint(doc: EditorDoc): void {
    // Rodada 17, J2: o item ABRE o gesto (antes só dizia a frase do P). O
    // gesto mora no Escolher, que o Transformar usa por dentro: com outra
    // ferramenta na mão, o Transformar entra, ou o clique iria para ela.
    if (parentGesture(doc.selection) !== 'pegar-filhos') {
      doc.notice(chooseBoneNotice(childInSelection(doc.selection)));
      return;
    }
    const na = getActiveTool()?.id ?? '';
    if (na !== 'select' && na !== 'transform') setActiveTool('transform', doc);
    selectTool.openGrabFromMenu(doc);
  }

  // -- o canto do zoom -------------------------------------------------------

  /**
   * A camada do canto: `−` · `100%` · `+` · `Ajustar`.
   *
   * Fica no canto inferior direito, por cima do canvas e nunca no meio do
   * desenho. É onde o Spine põe o dele. O `100%` é um CAMPO: digitar 200 e
   * apertar Enter vale por sete cliques no `+`, e quem anima passa o dia entre
   * 25% e 400%.
   */
  /**
   * Os três botões grandes do documento vazio.
   *
   * Eles chamam AÇÕES, e não funções daqui: "Importar PSD" é a mesma porta do
   * menu Arquivo, e "Abrir o herói" é a do `main.ts`, que é quem sabe onde o
   * exemplo mora. Um botão que não tem ação registrada não aparece — é o caso
   * do herói num programa montado sem o exemplo junto.
   */
  private buildWelcome(): HTMLElement {
    const caixa = document.createElement('div');
    caixa.className = 'viewport-boas-vindas';
    caixa.hidden = true;

    const titulo = document.createElement('p');
    titulo.className = 'boas-vindas-titulo';
    // Lote 68: a frase do começo, como o Spriter — a pasta e o arrastar.
    titulo.textContent = 'Arquivo → Abrir pasta do projeto… e arraste as peças';
    caixa.appendChild(titulo);

    const linha = document.createElement('div');
    linha.className = 'boas-vindas-linha';
    for (const item of WELCOME_BUTTONS) {
      const botao = document.createElement('button');
      botao.type = 'button';
      botao.className = 'boas-vindas-botao';
      botao.dataset['acao'] = item.action;
      const icone = document.createElement('span');
      icone.className = 'boas-vindas-icone';
      if (!paintIcon(icone, item.icon, 28)) icone.textContent = '•';
      const nome = document.createElement('span');
      nome.className = 'boas-vindas-nome';
      nome.textContent = item.label;
      const dica = document.createElement('span');
      dica.className = 'boas-vindas-dica';
      dica.textContent = item.hint;
      botao.append(icone, nome, dica);
      botao.title = `${item.label}: ${item.hint}`;
      botao.addEventListener('click', () => {
        if (item.action === 'comecar-vazio') {
          this.welcomeOff = true;
          this.syncWelcome();
          this.doc?.notice('Pronto. A arte entra por Arquivo → Abrir pasta do projeto…, ou soltando o arquivo aqui');
          return;
        }
        runAction(item.action);
      });
      linha.appendChild(botao);
    }
    caixa.appendChild(linha);

    const rodape = document.createElement('p');
    rodape.className = 'boas-vindas-rodape';
    rodape.textContent = 'Ou solte um arquivo aqui: .bone, .psd, imagens, ou um projeto de outro programa.';
    caixa.appendChild(rodape);
    return caixa;
  }

  /** Mostra ou esconde as boas-vindas, conforme o documento. */
  private syncWelcome(): void {
    const caixa = this.welcome;
    const doc = this.doc;
    if (caixa === null || doc === null) return;
    // Lote 59: a pasta aberta também conta como imagem — as dela esperam na
    // aba Imagens, e a cena vazia com a pasta aberta é o começo do trabalho.
    const hasImages = doc.atlases.length > 0 || folderImageNames(doc).length > 0;
    const vazio = !this.welcomeOff && isEmptyDocument(doc.file, hasImages);
    caixa.hidden = !vazio;
    // O botão do herói só existe onde o exemplo existe.
    const heroi = caixa.querySelector('button[data-acao="abrir-exemplo"]');
    if (heroi instanceof HTMLButtonElement) heroi.hidden = !hasAction('abrir-exemplo');
    // Documento com coisa dentro nunca mais mostra as boas-vindas; documento
    // novo mostra de novo, porque aí é outro começo.
    if (!isEmptyDocument(doc.file, hasImages)) this.welcomeOff = false;
  }

  private buildZoomCorner(): HTMLElement {
    const box = document.createElement('div');
    box.className = 'viewport-zoom';
    box.setAttribute('role', 'group');
    box.setAttribute('aria-label', 'Zoom da cena');

    box.appendChild(this.zoomButton('−', 'Afastar (Ctrl+−)', () => this.zoomOut()));

    const field = document.createElement('input');
    field.type = 'text';
    field.className = 'viewport-zoom-campo';
    field.inputMode = 'decimal';
    field.size = 5;
    field.value = formatZoomPercent(this.camera.zoom);
    field.title = 'Zoom em por cento. Digite um número e aperte Enter. Ctrl+0 volta a 100%';
    field.setAttribute('aria-label', 'Zoom em por cento');
    const commit = (): void => {
      // Rodada 47, lote 3 (notas do doc 84): o zoom aceita conta, como os números da ficha ("200*2", "+50").
      const agora = Math.round(this.camera.zoom * 100);
      const conta = evalFieldInput(field.value.replace(/%/g, ''), agora);
      const wanted = conta !== null && conta > 0 ? conta / 100 : parseZoomPercent(field.value);
      if (wanted === null) {
        this.doc?.notice('Zoom não entendido. Escreva um número, como 200');
        // Reescreve MESMO com o campo no foco: quem digitou "abc" terminou de
        // digitar, e deixar o "abc" ali diria que o zoom é "abc".
        this.showZoom(true);
        return;
      }
      this.zoomTo(wanted);
      // "200" vira "200%", e um pedido fora do limite vira o que a câmera deu.
      this.showZoom(true);
    };
    field.addEventListener('change', commit);
    field.addEventListener('keydown', (e) => {
      // Rodada 47, lote 3 (notas do doc 84): as setas andam 10 % (Shift 50 %), como o passo da ficha.
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        const passo = (e.shiftKey ? 50 : 10) * (e.key === 'ArrowUp' ? 1 : -1);
        this.zoomTo(Math.max(0.01, (Math.round(this.camera.zoom * 100) + passo) / 100));
        this.showZoom(true);
        return;
      }
      if (e.key === 'Enter') { e.preventDefault(); commit(); this.root?.focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); this.showZoom(true); this.root?.focus(); }
      // O campo é um campo: as letras das ferramentas não podem trocar a
      // ferramenta enquanto se digita "200".
      e.stopPropagation();
    });
    this.zoomField = field;
    box.appendChild(field);

    box.appendChild(this.zoomButton('+', 'Aproximar (Ctrl+=)', () => this.zoomIn()));
    box.appendChild(this.zoomButton(
      'Ajustar', 'Ajustar à tela (Ctrl+Shift+F)', () => this.fitToScreen(),
    ));
    return box;
  }

  private zoomButton(label: string, title: string, run: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'viewport-zoom-botao';
    button.textContent = label;
    button.title = title;
    button.setAttribute('aria-label', title);
    button.addEventListener('click', () => { run(); this.root?.focus(); });
    return button;
  }

  /**
   * Escreve o zoom de agora no campo. Chamado toda vez que a câmera muda.
   *
   * Com o campo no foco não reescreve sozinho: a roda do mouse mexendo a câmera
   * apagaria o "20" de quem está digitando "200". `force` é para quando a
   * pessoa terminou — Enter, Esc, ou saiu do campo — e o que está escrito ali
   * tem que virar o que a câmera realmente ficou.
   */
  showZoom(force = false): void {
    const field = this.zoomField;
    if (field === null) return;
    if (!force && document.activeElement === field) return;
    const text = formatZoomPercent(this.camera.zoom);
    if (field.value !== text) field.value = text;
  }

  /** O % do zoom no rodapé — rodada 46, lote 4. */
  private sayZoom(): void {
    this.doc?.notice(zoomNotice(this.camera.zoom));
  }

  /** Aproxima um passo, pelo meio da vista. */
  zoomIn(): void {
    this.zoomFromButton(1);
  }

  /** Afasta um passo, pelo meio da vista. */
  zoomOut(): void {
    this.zoomFromButton(-1);
  }

  /** Vai para um zoom exato, sem sair do lugar. `1` é o tamanho real. */
  zoomTo(zoom: number): void {
    this.camera.setZoom(zoom);
    this.cameraChanged();
  }

  /**
   * Enquadra o que está escolhido.
   *
   * Sem nada escolhido faz o mesmo que Ajustar à tela — que é o que se quer
   * dizer com "mostre o que interessa" quando nada foi apontado. Um osso só,
   * sem comprimento, é um ponto: centra nele e NÃO mexe no zoom, porque
   * enquadrar um ponto num retângulo daria zoom infinito.
   */
  frameSelection(): void {
    const doc = this.doc;
    const bounds = doc === null ? null : selectionBounds(doc.skeleton, doc.selection);
    if (bounds === null) {
      this.fitToScreen();
      return;
    }
    if (bounds.width <= 1e-6 && bounds.height <= 1e-6) {
      this.camera.x = bounds.x;
      this.camera.y = bounds.y;
      this.cameraChanged();
      return;
    }
    this.camera.fit(bounds, 0.2);
    this.cameraChanged();
  }

  // -- toolbar ---------------------------------------------------------------

  /**
   * A barra da cena — UMA linha, desde o lote 4 (item 15).
   *
   * Ela tinha três linhas em 1440×900 e a cena ficava com 32% da janela. O
   * desenho é o que se olha o dia inteiro; a barra é o que se aperta de vez em
   * quando. O que saiu, e para onde foi, está escrito em
   * `ui/toolbar-model.ts`, em `MOVED_OUT_OF_TOOLBAR`.
   *
   * **Ícone com dica, nunca ícone sozinho.** Todo botão carrega `title` e
   * `aria-label` com o nome por extenso e a tecla, e quem prefere a palavra na
   * tela liga em Editar → Preferências. Um ícone sem nome é uma adivinhação.
   */
  /**
   * A barra de ações, acima da cena — lote 17, rodada 3.
   *
   * *"Observe que não temos isso"*, disse o Humberto apontando para os quatro
   * botões em texto laranja do Spriter. A barra passa a ser **uma linha só**,
   * na ordem dele: arquivo · editar · ferramentas · eixos · ver e travar.
   *
   * A LISTA está em `ui/action-bar-model.ts`, como dado, e um teste sem
   * navegador confere que todo botão aponta para uma ação que existe. Aqui só
   * se desenha, e todo clique cai em `runAction` — a MESMA porta do menu e da
   * tecla.
   */
  private buildToolbar(doc: EditorDoc): HTMLElement {
    return viewportToolbar.buildToolbar(this, doc);
  }

  /** Um grupo da barra: os botões, e o traço fino que o separa do vizinho. */
  buildBarGroup(group: ActionBarGroup, doc: EditorDoc): HTMLElement {
    return viewportToolbar.buildBarGroup(this, group, doc);
  }

  /**
   * Desfazer, Refazer e Colar ficam cinza quando não há o que fazer.
   *
   * Um botão que não faz nada e não diz por quê é um botão que se aprende a
   * ignorar. Aqui a dica muda junto: "nada a desfazer" é uma frase, e não um
   * cinza mudo.
   */
  syncEditButtons(): void {
    return viewportToolbar.syncEditButtons(this);
  }

  /*
   * `syncToolModes` saiu no degrau 4a (17/09/2026): nenhuma ferramenta some
   * por modo. A barra mostra todas, com a base ou uma animação aberta.
   */

  /** Mostra ou esconde a palavra ao lado do ícone, conforme a preferência. */
  syncToolNames(): void {
    return viewportToolbar.syncToolNames(this);
  }

  /*
   * O grupo dos dois cadeados saiu no lote 17.
   *
   * Ele era "Travar ossos" e "Travar desenhos" em ícone, no fim da barra. Os
   * dois viraram dois dos QUATRO botões de texto de "ver e travar" — o pedido
   * do Humberto, com a tela do Spriter aberta: *"observe que não temos isso"*.
   * A lista dos quatro está em `ui/action-bar-model.ts`, e quem os desenha é o
   * `buildBarGroup` acima. Escrito aqui para ninguém recriar o grupo antigo.
   */

  /**
   * Acende os quatro de ver e travar — lote 17.
   *
   * Laranja quando ligado, cinza quando não. `aria-pressed` acompanha, para
   * quem lê com leitor de tela receber o mesmo que quem vê a cor: cor sozinha
   * nunca é informação.
   */
  syncLockButtons(): void {
    return viewportToolbar.syncLockButtons(this);
  }

  /**
   * "Eixos: Local · Pai · Mundo" — requisito R7, agora numa LISTA.
   *
   * Eram três botões, e três botões com palavra são a largura de meia barra
   * para uma escolha entre três. A lista mostra a palavra escolhida o tempo
   * todo — que era o motivo de não ser um menu — e ocupa o espaço de um botão
   * só. Continua sem ícone: aqui a palavra é a informação.
   */
  buildSpaceGroup(): HTMLElement {
    return viewportToolbar.buildSpaceGroup(this);
  }

  /*
   * As três caixas de "Compensar" saíram da barra no lote 4 (item 15).
   *
   * Elas ocupavam meia barra o tempo todo, com frase inteira em cada uma, para
   * três interruptores que só querem dizer alguma coisa com Mover, Girar ou
   * Escalar ativa. Foram para o painel Propriedades, que aparece justamente ao
   * lado do que está sendo editado, e lá só aparecem nessas três ferramentas.
   * Continuam ligadas ao mesmo `setCompensation`, e continuam no menu Esqueleto.
   */

  syncSpaceButtons(): void {
    return viewportToolbar.syncSpaceButtons(this);
  }

  syncToolButtons(): void {
    return viewportToolbar.syncToolButtons(this);
  }

  private zoomFromButton(steps: number): void {
    return viewportToolbar.zoomFromButton(this, steps);
  }

  /** Hands the new view to the document, so saving remembers it. */
  cameraChanged(): void {
    return viewportToolbar.cameraChanged(this);
  }

  /** Frames the whole skeleton, or goes back to the default view. */
  fitToScreen(): void {
    return viewportToolbar.fitToScreen(this);
  }

  // -- input -----------------------------------------------------------------

  private attachEvents(): void {
    const canvas = this.canvas;
    const root = this.root;
    if (canvas === null || root === null) return;

    canvas.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    canvas.addEventListener('pointermove', (e) => this.onPointerMove(e));
    canvas.addEventListener('pointerup', (e) => this.onPointerUp(e));
    canvas.addEventListener('pointercancel', (e) => this.onPointerUp(e));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
    /*
     * Arrastar uma imagem do painel **Imagens** para a cena — lote 20.
     *
     * A cena responde a UM tipo de arrasto e a mais nada: sem o
     * `preventDefault` no `dragover` o navegador recusa a soltura, e ninguém
     * descobre por quê. Um arrasto de outro tipo — um arquivo do disco, um
     * texto de outra janela — passa reto, como sempre passou.
     */
    canvas.addEventListener('dragover', (e) => this.onDragOver(e));
    canvas.addEventListener('dragleave', () => { this.dropHint = null; this.needsDraw = true; });
    canvas.addEventListener('drop', (e) => this.onDrop(e));
    root.addEventListener('keydown', (e) => this.onKeyDown(e));
    root.addEventListener('keyup', (e) => this.onKeyUp(e));
    // Rodada 46, lote 4: ouvir o Espaço na janela inteira, sem tratar a tecla.
    this.forgetSpaceAnywhere?.();
    const escrevendo = (t: EventTarget | null): boolean => t instanceof HTMLElement
      && (t.isContentEditable || t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT');
    const desce = (e: KeyboardEvent): void => { if (e.key === ' ' && !escrevendo(e.target)) this.spaceAnywhere = true; };
    const sobe = (e: KeyboardEvent): void => { if (e.key === ' ') this.spaceAnywhere = false; };
    const larga = (): void => { this.spaceAnywhere = false; };
    window.addEventListener('keydown', desce, true);
    window.addEventListener('keyup', sobe, true);
    window.addEventListener('blur', larga);
    this.forgetSpaceAnywhere = () => {
      window.removeEventListener('keydown', desce, true);
      window.removeEventListener('keyup', sobe, true);
      window.removeEventListener('blur', larga);
    };
  }

  /**
   * A cruz de onde a imagem arrastada vai cair — lote 20.
   *
   * Sem ela, soltar é um tiro no escuro: a imagem só aparece depois de solta,
   * e aí já é um passo de desfazer. A cruz é laranja, a cor do "isto vai
   * acontecer" na barra.
   */
  drawDropHint(ctx: CanvasRenderingContext2D, scale: number): void {
    const at = this.dropHint;
    if (at === null) return;
    const braco = 14 / scale;
    ctx.save();
    ctx.strokeStyle = themeColors().toggleOn;
    ctx.lineWidth = 2 / scale;
    ctx.beginPath();
    ctx.moveTo(at.x - braco, at.y);
    ctx.lineTo(at.x + braco, at.y);
    ctx.moveTo(at.x, at.y - braco);
    ctx.lineTo(at.x, at.y + braco);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(at.x, at.y, braco * 0.55, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  /** `true` quando o arrasto traz uma imagem do painel Imagens. */
  private isImageDrag(e: DragEvent): boolean {
    return e.dataTransfer?.types.includes(DRAG_TYPE) === true;
  }

  /**
   * `true` quando o arrasto traz uma **entidade** do painel Entidades — E9,
   * degrau 7, tarefa 7.2. A cruz e o caminho do soltar são os mesmos da
   * imagem: pendurar uma entidade é criar a tomada, e a tomada é um slot.
   */
  private isEntityDrag(e: DragEvent): boolean {
    return e.dataTransfer?.types.includes(ENTITY_DRAG_TYPE) === true;
  }

  private onDragOver(e: DragEvent): void {
    if (!this.isImageDrag(e) && !this.isEntityDrag(e)) return;
    e.preventDefault();
    if (e.dataTransfer !== null) e.dataTransfer.dropEffect = 'copy';
    const box = this.canvas?.getBoundingClientRect();
    if (box === undefined) return;
    // Uma cruz onde a imagem vai cair. Sem ela, soltar é um tiro no escuro.
    this.dropHint = this.camera.screenToWorld(e.clientX - box.left, e.clientY - box.top);
    this.needsDraw = true;
  }

  /**
   * Solta a imagem: nasce um slot com aquele desenho, ali.
   *
   * O osso é o **escolhido**, ou a raiz quando não há nenhum. O ponto do mundo
   * vira ponto do osso antes de virar comando — é a mesma conversão que o
   * Ponto e a Caixa já faziam, e é ela que faz a imagem grudar na mão quando a
   * mão é o osso escolhido.
   */
  private onDrop(e: DragEvent): void {
    const doc = this.doc;
    this.dropHint = null;
    this.needsDraw = true;
    const entidade = this.isEntityDrag(e);
    if (doc === null || (!this.isImageDrag(e) && !entidade)) return;
    e.preventDefault();
    const image = e.dataTransfer?.getData(entidade ? ENTITY_DRAG_TYPE : DRAG_TYPE) ?? '';
    if (image === '') return;
    // H3 (rodada final, 29/09/2026): a imagem nasce escolhida, e a seta
    // seguinte tem de empurrá-la 1 px, como no Spriter. O arrasto veio da aba
    // Imagens, e o foco ficava lá: a seta não chegava à cena. Soltar aqui é
    // entregar o teclado à cena.
    this.root?.focus();

    const box = this.canvas?.getBoundingClientRect();
    if (box === undefined) return;
    const world = this.camera.screenToWorld(e.clientX - box.left, e.clientY - box.top);

    // Acréscimo ao lote 60: primeiro a arte, depois os ossos. A imagem nasce
    // SEMPRE na raiz, livre, nunca no osso escolhido.
    const lugar = dropPlace(doc.skeleton, corpoDe(doc).file, world.x, world.y);
    const boneName = lugar.bone;
    const local = { x: lugar.x, y: lugar.y };

    // Lote 57, plano pivô: com uma animação aberta, a imagem APARECE nesta
    // animação a partir de agora, como no Spriter. Com a base aberta, entra na
    // base e aparece em tudo. Degrau 4a: sem "Gravar sozinho", é sempre assim.
    const appear = doc.animation !== null
      ? { animation: doc.animation, time: doc.time }
      : null;
    // E9, tarefa 7.2: a entidade não passa pelo atlas — ela é um `.bone` —,
    // então não há região provisória a garantir; o resto é o mesmo caminho.
    if (entidade) {
      // Rodada 8b, A2: a entidade não nasce na raiz como a imagem. Ela cai
      // onde foi solta, presa ao osso mais perto, de pé.
      const ponto = entityDropPlace(doc.skeleton, corpoDe(doc).file, world.x, world.y);
      this.dropEntity(doc, image, ponto.bone, ponto, appear, ponto.rotation);
      return;
    }
    void this.dropImage(doc, image, boneName, local, appear);
  }

  /**
   * **Pendurar cria tomada** (E9, 7.11): a entidade solta num osso vira slot +
   * anexo `skeleton`, com a raiz do filho no ponto onde foi solta (o pino).
   * Com animação aberta, a chave `attachment` em `t` e `null` em 0, como a
   * imagem do lote 57.
   */
  private dropEntity(
    doc: EditorDoc, uri: string, boneName: string, local: { x: number; y: number },
    appear: { animation: string; time: number } | null, rotation = 0,
  ): void {
    // Rodada 8b, C18: a entidade trazida de fora passa a ser conhecida da base.
    garantirAninhado(doc, uri);
    // Rodada 23, defeito 6: ela nasce tocando a primeira animação dela.
    const toca = firstAnimationOf(skeletonsDe(corpoDe(doc)), uri);
    const command = new DropEntityAsSlot(
      corpoDe(doc).file, uri, boneName, doc.visibleSkins, local.x, local.y, appear, rotation, toca,
    );
    corpoDe(doc).run(command);
    doc.select({ ...emptySelection(), slots: [command.name] });
    doc.notice(entityDropNotice(command.name, boneName, appear, toca));
  }

  /**
   * O slot nasce — depois de a imagem ter região. Lote 60: a imagem que só está
   * na pasta ganha a região provisória antes (página = a imagem, região = a
   * imagem inteira); nada é empacotado.
   */
  private async dropImage(
    doc: EditorDoc, image: string, boneName: string, local: { x: number; y: number },
    appear: { animation: string; time: number } | null,
  ): Promise<void> {
    if (!await ensureProvisional(doc, image)) {
      doc.notice(`"${image}" não abriu: o arquivo sumiu da pasta, ou o navegador não conseguiu ler`);
      return;
    }
    const command = new DropImageAsSlot(
      corpoDe(doc).file, image, boneName, doc.visibleSkins, local.x, local.y, appear,
    );
    corpoDe(doc).run(command);
    doc.select({ ...emptySelection(), slots: [command.name] });
    doc.notice(appear === null
      ? `${image} entrou solta, como ${command.name}. Para prender num osso: `
        + 'com ela escolhida, crie o osso — ele pega o desenho'
      : appearNotice(command.name, appear.time));
  }

  /**
   * Botão direito num desenho com imagem — lote 60c.
   *
   * O Humberto, 11/09/2026: *"joga isso [a grade] pro outro botão, o de
   * opções, é o botão direito … era para ser trocar imagens e algumas opções
   * como no Spriter"*. No Spriter, segurar o botão direito no desenho mostra as
   * miniaturas. Então o botão direito escolhe o desenho e abre ali a grade das
   * imagens da mesma pasta, com as opções embaixo. O **Definir pivô…** saiu
   * daqui: fica na aba Imagens, como no Spriter (duplo clique na imagem).
   *
   * Cada opção escolhe **só o desenho** antes de rodar: clicar num desenho
   * preso a um osso escolhe o osso junto, e "Apagar" levaria o osso inteiro.
   *
   * `false` quando não há desenho com imagem debaixo do ponteiro — e na parte
   * transparente não há: o clique passa direto.
   */
  /** O botão direito num osso: o menu das tomadas dele. `false` fora de osso. */
  private openBoneMenu(e: PointerEvent): boolean {
    const doc = this.doc;
    if (doc === null) return false;
    const screen = this.screenOf(e);
    const world = this.camera.screenToWorld(screen.x, screen.y);
    const hit = pickAll(doc.skeleton, world.x, world.y, this.camera.zoom, currentLocks()).find((item) => item.kind === 'bone') ?? null;
    if (hit === null) return false;
    doc.select({ ...emptySelection(), bones: [hit.bone] });
    abrirMenuDaTomada(doc, e.clientX, e.clientY, { bone: hit.bone });
    return true;
  }

  private openDrawingMenu(e: PointerEvent): boolean {
    const doc = this.doc;
    const stage = this.stage;
    if (doc === null || stage === null) return false;
    const screen = this.screenOf(e);
    const world = this.camera.screenToWorld(screen.x, screen.y);
    // A grade é de imagem: o osso que pega o clique por cima dela (8d) não a tapa.
    // Rodada 11: com uma entidade em volta escolhida, o meio dela — que não é
    // desenhado — pega o clique: é onde o "Este boneco" se desfaz.
    const escolhidos = [...doc.selection.slots, ...doc.selection.attachments.map((a) => a.slot)];
    const hit = pickAll(doc.skeleton, world.x, world.y, this.camera.zoom, withChosen(currentLocks(), escolhidos))
      .find((item) => item.kind === 'attachment') ?? null;
    if (hit === null || hit.kind !== 'attachment' || hit.slot === null || hit.attachment === null) return false;
    const file = corpoDe(doc).file;
    doc.select(selectionFor(emptySelection(), hit, false, file.bones?.[0]?.name ?? null, (slot) => clickKeepsBone(file, slot)));
    return this.openDrawingOptions(doc, hit.slot, hit.attachment, hit.inner);
  }

  /**
   * A grade de opções de um desenho, sem depender de onde o ponteiro estava —
   * degrau 7, tarefa 7.5 (defeito A7).
   *
   * O botão direito na cena fazia **duas coisas conforme o pixel** — em cima
   * de um desenho abria esta grade, fora dele voltava à ferramenta de antes —,
   * e nenhuma das duas tinha porta no menu. Quem nunca visse acontecer nunca
   * saberia. Agora as duas têm item de menu, e este é o caminho que os dois
   * lados chamam.
   */
  openDrawingOptions(doc: EditorDoc, slot: string, attachment: string, inner?: string): boolean {
    const stage = this.stage;
    if (stage === null) return false;
    // Rodada 8a: a grade abre também sobre a entidade (C5) — `gridTarget`
    // aceita o desenho que já é entidade; `pickerTarget` só conhece imagem.
    const target = gridTarget(corpoDe(doc).file as never, doc.visibleSkins, slot, attachment);
    if (target === null) return false;
    const one = { slot, attachment };
    const bounds = selectionBounds(doc.skeleton, { ...emptySelection(), attachments: [one] });
    if (bounds === null) return false;
    const soDesenho = { ...emptySelection(), slots: [slot], attachments: [one] };
    const opcao = (label: string, hint: string, acao: string) => ({
      label, hint, run: () => { doc.select(soDesenho); runAction(acao); },
    });
    // A entidade que substituiu uma imagem tem o caminho de volta à mão.
    const entidade = takeOutTarget(corpoDe(doc).file as never, doc.visibleSkins, slot, attachment);
    const esteBoneco = aroundGridOptions(doc, slot, inner);
    // Rodada 9: o que este desenho é — imagem simples, ou slot já marcado.
    const defAqui = (corpoDe(doc).file.skins ?? []).find((s) => s.name === target.skin)
      ?.attachments?.[slot]?.[attachment] as Record<string, unknown> | undefined;
    const marca = slotMarkOf(defAqui);
    const soImagem = defAqui !== undefined && (defAqui['type'] ?? 'region') === 'region'
      && imageOf(attachment, defAqui as never) !== null;
    // Rodada 12 (S3, S4): com o lápis numa pele que não é a default, a grade
    // ganha o Set Hidden e o Set Ignored do Spriter, para ESTA pele.
    const lapis = editingSkinOf(doc);
    const pele = lapis !== null && lapis !== 'default'
      && (corpoDe(doc).file.skins ?? []).some((skin) => skin.name === lapis) ? lapis : null;
    requestImageGrid(doc, stage, this.camera, {
      minX: bounds.x, minY: bounds.y, maxX: bounds.x + bounds.width, maxY: bounds.y + bounds.height,
    }, [
      // Rodada 11: "Este boneco" é o PRIMEIRO item, quando o clique foi numa
      // imagem de dentro de uma entidade (`inner`). Marcado, tira.
      ...esteBoneco.map((item) => ({
        label: item.label, hint: item.hint, first: true,
        run: () => { doc.select(soDesenho); item.run(); },
      })),
      // Rodada 9: a imagem vira base; o slot marcado tem a volta.
      ...(marca !== null
        ? [opcao('Desfazer a base da imagem', `A imagem de antes volta, como era, no lugar ${marca.slotDeAntes}; `
          + `a base ${marca.nome} sai do projeto`, 'desmarcar-slot')]
        : soImagem ? [opcao('Fazer da imagem uma base…', 'Esta imagem vira uma base do projeto, com o nome que você der e '
          + 'animações próprias. Nada muda no desenho', 'marcar-como-slot')] : []),
      ...(entidade === null || marca !== null ? [] : [opcao('Tirar a entidade',
        `Sai a entidade, e a imagem de antes ("${entidade.image}") volta, como era`, 'tirar-entidade')]),
      ...(pele === null ? [] : [
        opcao('Esconder nesta skin',
          `Com a skin "${pele}" vestida, este desenho não é desenhado. A base não muda`, 'esconder-na-pele'),
        opcao('Ignorar nesta skin',
          `A skin "${pele}" deixa de mexer neste desenho: volta o de baixo, o da base`, 'ignorar-na-pele'),
      ]),
      opcao('Trazer para a frente', 'Uma posição para a frente na ordem de desenho (+)', 'subir-ordem'),
      opcao('Mandar para trás', 'Uma posição para trás na ordem de desenho (−)', 'descer-ordem'),
      opcao('Duplicar', 'Duplica este desenho (Ctrl+D)', 'duplicar'),
      opcao('Apagar', 'Apaga este desenho (Delete)', 'apagar'),
    ]);
    this.needsDraw = true;
    return true;
  }

  /** Lote 60c: as páginas do atlas já lidas em pixels, para o clique saber o transparente. */
  private readonly pageAlpha = new WeakMap<object, ImageData>();

  /** A opacidade (0..255) do pixel da página em `u, v`, ou `null` quando a imagem não chegou. */
  private alphaAt(page: object, u: number, v: number): number | null {
    let data = this.pageAlpha.get(page);
    if (data === undefined) {
      const lido = this.readPage(page);
      if (lido === null) return null;
      data = lido;
      this.pageAlpha.set(page, data);
    }
    const x = Math.min(data.width - 1, Math.max(0, Math.floor(u * data.width)));
    const y = Math.min(data.height - 1, Math.max(0, Math.floor(v * data.height)));
    return data.data[(y * data.width + x) * 4 + 3] ?? null;
  }

  /** Lê os pixels de uma página, uma vez. `null` enquanto a imagem não chegou. */
  private readPage(page: object): ImageData | null {
    const doc = this.doc;
    if (doc === null) return null;
    const image = doc.imageFor(page as AtlasPageData) as (CanvasImageSource & { width?: number; height?: number }) | null;
    if (image === null) return null;
    const largura = Number(image.width ?? 0);
    const altura = Number(image.height ?? 0);
    if (largura <= 0 || altura <= 0) return null;
    try {
      const tela = document.createElement('canvas');
      tela.width = largura;
      tela.height = altura;
      const ctx = tela.getContext('2d', { willReadFrequently: true });
      if (ctx === null) return null;
      ctx.drawImage(image, 0, 0);
      return ctx.getImageData(0, 0, largura, altura);
    } catch {
      return null;
    }
  }

  /** Pointer position in CSS pixels inside the canvas. */
  private screenOf(e: PointerEvent | WheelEvent): { x: number; y: number } {
    const canvas = this.canvas;
    if (canvas === null) return { x: 0, y: 0 };
    const box = canvas.getBoundingClientRect();
    return { x: e.clientX - box.left, y: e.clientY - box.top };
  }

  private toolEvent(e: PointerEvent, worldX: number, worldY: number): ToolEvent {
    return {
      x: worldX,
      y: worldY,
      dx: worldX - this.lastWorldX,
      dy: worldY - this.lastWorldY,
      shift: e.shiftKey,
      ctrl: e.ctrlKey || e.metaKey,
      alt: e.altKey,
      button: e.button,
      scale: this.camera.zoom,
    };
  }

  /** A guia sendo puxada da régua — lote 42. `null` fora do arrasto. */
  guideDrag: { ruler: 'top' | 'left'; x: number; y: number } | null = null;
  /** Rodada 16, lote 3: a alça da forma do emissor que está sendo arrastada. */
  private shapeDrag: { shape: SelectedShape; handle: ShapeHandle } | null = null;
  /** A alça debaixo do ponteiro agora, para o rodapé dizer uma vez só. */
  private dicaDaAlca: string | null = null;
  /**
   * Segunda conferência, defeito 3: o que a alça arrastada diz AGORA ("Raio:
   * 40"), desenhado na cena ao lado dela. O rodapé não serve durante o arrasto:
   * a pose se refaz a cada quadro e apaga o recado (`gesture-notice.ts`).
   */
  shapeDragSays: { id: string; text: string } | null = null;
  /**
   * N-4b: o arrasto do recorte. `start` é o retângulo de quando o botão desceu
   * (`null` ao traçar um novo); `zone` o que se pegou, ou `'tracar'`.
   */
  private cropDrag: { animation: string; start: CropBox | null; zone: CropZone | 'tracar'; ax: number; ay: number; moved: boolean } | null = null;
  /** O que o arrasto do recorte diz agora, escrito em cima do retângulo. */
  cropDragSays: string | null = null;
  /** A base em foco que a vista viu por último — o Ajustar da troca de base. */
  private focoVisto: string | null = null;
  /** N-4b: a caixa dos números do recorte, no canto da cena. */
  private cropBox: CropNumbersBox | null = null;
  /** 05/11/2026: os ícones das tomadas, por cima do desenho. */
  private readonly tomadas = new TomadasLayer();

  /** Repõe os ícones das tomadas, a cada quadro desenhado. */
  syncTomadas(): void {
    this.tomadas.sync(this.doc, (x, y) => this.camera.worldToScreen(x, y));
  }
  /** A classe de cursor que o recorte pôs na cena, ou `null`. */
  private cropCursorClass: string | null = null;

  private onPointerDown(e: PointerEvent): void {
    this.root?.focus();
    // Botão direito: volta à ferramenta anterior, como no Spine. Nunca edita
    // nada, e por isso ele sai daqui antes de qualquer conta de mundo.
    if (e.button === 2) {
      e.preventDefault();
      // Lote 60c: em cima de um desenho com imagem, o botão direito abre a
      // grade das imagens com as opções. Fora de desenho (e na parte
      // transparente dele), continua voltando à ferramenta anterior.
      if (this.openDrawingMenu(e)) return;
      // 05/11/2026: em cima de um osso, o menu da tomada — "Encaixar um projeto…".
      if (this.openBoneMenu(e)) return;
      const back = toolBack(this.doc);
      const tool = back === null ? null : getTool(back);
      this.doc?.notice(tool === null
        ? noToolBackNotice(getActiveTool()?.label ?? null)
        : `Ferramenta: ${tool.label}`);
      this.needsDraw = true;
      return;
    }
    const screen = this.screenOf(e);
    const world = this.camera.screenToWorld(screen.x, screen.y);
    this.lastScreenX = screen.x;
    this.lastScreenY = screen.y;
    // Capturar o ponteiro é uma comodidade — segura o arrasto quando o cursor
    // sai do canvas —, não uma condição para editar. Um `pointerId` que o
    // navegador não conhece faz isto estourar, e antes disso o estouro levava
    // junto o resto do `pointerdown`: a ferramenta nunca via o clique.
    try {
      this.canvas?.setPointerCapture(e.pointerId);
    } catch {
      // Sem captura: o arrasto acaba se o cursor sair. Melhor do que não editar.
    }

    // Middle button, or space and drag: pan. Never an edit.
    // Rodada 46, lote 4: o Espaço segurado com o foco em outro painel também move a vista.
    if (!this.spaceHeld && e.button === 0 && this.spaceAnywhere) {
      this.spaceHeld = true;
      this.spaceDownAt = e.timeStamp;
      // Já é arrasto: a subida do Espaço não toca a animação.
      this.spaceMoved = Number.POSITIVE_INFINITY;
      this.canvas?.classList.add('is-panning');
    }
    if (startsPan(e.button, this.spaceHeld)) {
      this.panning = true;
      // Rodada 46, lote 2: o botão do meio mostra a mão, como o Espaço.
      if (e.button === 1) this.canvas?.classList.add('is-panning');
      this.pointerDown = true;
      this.lastWorldX = world.x;
      this.lastWorldY = world.y;
      e.preventDefault();
      return;
    }

    this.panning = false;
    // Guias — lote 42: arrastar a partir de uma régua puxa uma guia. A régua é
    // moldura, e nenhuma ferramenta recebe um clique dado nela.
    const view = viewSettings();
    const ruler = view.rulers && e.button === 0 ? rulerAt(screen.x, screen.y, RULER_SIZE) : null;
    if (ruler !== null) {
      if (view.lockGuides) {
        this.doc?.notice('As guias estão travadas: Exibir → A cena → Travar guias');
        return;
      }
      this.pointerDown = true;
      this.guideDrag = { ruler, x: world.x, y: world.y };
      this.needsDraw = true;
      return;
    }
    this.pointerDown = true;
    this.gestureNotice.press();
    const doc = this.doc;
    if (doc !== null) {
      this.lastWorldX = world.x;
      this.lastWorldY = world.y;
      // Rodada 16, lote 3: a alça da forma do emissor escolhido vem antes de
      // qualquer ferramenta — é um número do emissor na mão, como a alça de
      // uma regra, e a ferramenta não vê o clique.
      if (e.button === 0) {
        const raio = (viewportDraw.SHAPE_HANDLE_PIXELS + 4) / this.camera.zoom;
        for (const forma of selectedEmitterShapes(doc, EMITTER_MARK_PIXELS / this.camera.zoom)) {
          const alca = shapeHandleAt(forma.guide, world.x, world.y, raio);
          if (alca === null) continue;
          this.shapeDrag = { shape: forma, handle: alca };
          // Conserto 2: o arrasto não se junta com o que se digitou antes.
          doc.endMerge?.();
          doc.notice(`${alca.label} — arraste para mudar`);
          this.needsDraw = true;
          return;
        }
      }
      // N-4b: com Recorte na cena ligado, o clique é do recorte — a
      // ferramenta não o vê. Puxador ou meio: muda o retângulo; fora dele:
      // traça um novo, de um canto ao outro.
      if (e.button === 0 && cropEditing()) {
        if (doc.animation === null) {
          setCropEditing(false);
          doc.notice(CROP_NEEDS_ANIMATION);
          this.needsDraw = true;
          return;
        }
        const { box, zone } = this.cropZoneUnder(doc, world.x, world.y);
        doc.endMerge?.();
        this.cropDrag = {
          animation: doc.animation,
          start: zone === null ? null : box,
          zone: zone ?? 'tracar',
          ax: world.x, ay: world.y, moved: false,
        };
        this.cropDragSays = null;
        this.needsDraw = true;
        return;
      }
      // Conserto do lote 70: o modo Ligar da aba Malha e pesos é um MODO, como
      // o Bind do Spine. Enquanto está aberto, o clique no osso liga ele à
      // malha, com qualquer ferramenta na mão — e a ferramenta não vê o clique.
      if (e.button === 0 && bindModeSceneClick(doc, world.x, world.y, this.camera.zoom)) {
        this.needsDraw = true;
        return;
      }
      getActiveTool()?.onDown?.(doc, this.toolEvent(e, world.x, world.y));
    }
    this.lastWorldX = world.x;
    this.lastWorldY = world.y;
    this.needsDraw = true;
  }

  private onPointerMove(e: PointerEvent): void {
    this.armHover(e);
    const screen = this.screenOf(e);
    if (this.panning) {
      if (this.spaceHeld) this.spaceMoved += Math.hypot(screen.x - this.lastScreenX, screen.y - this.lastScreenY);
      this.camera.panByScreen(screen.x - this.lastScreenX, screen.y - this.lastScreenY);
      this.lastScreenX = screen.x;
      this.lastScreenY = screen.y;
      this.cameraChanged();
      return;
    }
    if (!this.pointerDown) {
      // Conserto 4 da conferência: a alça da forma diz o que puxa, ao passar.
      if (this.doc !== null && this.canvas !== null) {
        const at = this.camera.screenToWorld(screen.x, screen.y);
        const raio = (viewportDraw.SHAPE_HANDLE_PIXELS + 4) / this.camera.zoom;
        let dica: string | null = null;
        for (const forma of selectedEmitterShapes(this.doc, EMITTER_MARK_PIXELS / this.camera.zoom)) {
          const alca = shapeHandleAt(forma.guide, at.x, at.y, raio);
          if (alca !== null) { dica = `${alca.label} — arraste para mudar`; break; }
        }
        if (dica !== null) this.canvas.title = dica;
        else if (this.canvas.title.endsWith(' — arraste para mudar')) this.canvas.title = '';
        // Segunda conferência, defeito 3: parado em cima, o RODAPÉ também diz
        // — a dica do navegador demora e às vezes nem vem. Uma vez por alça.
        if (dica !== this.dicaDaAlca) {
          this.dicaDaAlca = dica;
          if (dica !== null) this.doc.notice(dica);
        }
      }
      // N-4b: com Recorte na cena ligado, o cursor diz o que o arrasto faz
      // (puxar um lado, mover, traçar), e a dica diz em palavras.
      if (cropEditing() && this.doc !== null && this.canvas !== null && this.doc.animation !== null) {
        const at = this.camera.screenToWorld(screen.x, screen.y);
        const { zone } = this.cropZoneUnder(this.doc, at.x, at.y);
        this.setCropCursor(zone === null ? CROP_DRAW_CURSOR : CROP_ZONE_CURSOR[zone]);
        this.canvas.title = cropZoneHint(zone);
        return;
      }
      // Lote 47: sem botão, a ferramenta só fica sabendo onde o ponteiro
      // está, para o cursor dizer o que o arrasto vai fazer. Nunca edita.
      const hovering = getActiveTool();
      if (hovering?.onHover !== undefined && this.doc !== null) {
        const at = this.camera.screenToWorld(screen.x, screen.y);
        hovering.onHover(this.doc, this.toolEvent(e, at.x, at.y));
        this.syncToolCursor();
        // Rodada 41, lote 3 (licença do Diretor, 06/10): quem trata o ponteiro
        // parado pode desenhar algo que o segue (o círculo do pincel de pesos).
        this.needsDraw = true;
      }
      return;
    }
    const world = this.camera.screenToWorld(screen.x, screen.y);
    if (this.guideDrag !== null) {
      this.guideDrag.x = world.x;
      this.guideDrag.y = world.y;
      this.lastScreenX = screen.x;
      this.lastScreenY = screen.y;
      this.needsDraw = true;
      return;
    }
    const doc = this.doc;
    if (this.cropDrag !== null) {
      if (doc !== null) this.moveCrop(doc, world.x, world.y);
      this.lastScreenX = screen.x;
      this.lastScreenY = screen.y;
      this.needsDraw = true;
      return;
    }
    if (this.shapeDrag !== null) {
      if (doc !== null) {
        const passo = shapeHandleCommand(doc, this.shapeDrag.shape, this.shapeDrag.handle, world.x, world.y);
        if (passo !== null) {
          doc.run(passo);
          // Segunda conferência, defeito 3: o nome e o número ENQUANTO arrasta
          // ("Raio: 40"), na cena; ao soltar, o rodapé repete o último.
          this.shapeDragSays = { id: this.shapeDrag.handle.id, text: passo.label };
        }
      }
      this.lastScreenX = screen.x;
      this.lastScreenY = screen.y;
      this.needsDraw = true;
      return;
    }
    if (doc !== null) getActiveTool()?.onMove?.(doc, this.toolEvent(e, world.x, world.y));
    this.lastScreenX = screen.x;
    this.lastScreenY = screen.y;
    this.lastWorldX = world.x;
    this.lastWorldY = world.y;
    this.needsDraw = true;
  }

  /**
   * F3, L10 e L11 (rodada final, 29/09/2026): o gesto mexeu num osso, e uma
   * regra desfez — o arquivo guardou o giro, a tela não mostrou. Mede-se a pose
   * aplicada contra a pedida (`held-by-rule.ts`) e, se não bateu e há regra
   * citando o osso, o rodapé diz qual. Sem regra citada, não se adivinha: `null`.
   */
  private heldByRule(doc: EditorDoc, said: string): string | null {
    const grip = gripOfLabel(said);
    const skeleton = doc.skeleton;
    if (grip === null || skeleton === null) return null;
    // A pose do fim do gesto, com as regras aplicadas por cima.
    doc.repose();
    for (const name of doc.selection.bones) {
      const bone = skeleton.findBone(name);
      if (bone === null || !drifted(bone as unknown as BoneNumbers, grip)) continue;
      const rules = rulesOn(corpoDe(doc).file, name);
      if (rules.length === 0) continue;
      return heldNotice(name, rules, grip, doc.animation === null);
    }
    return null;
  }

  /** O retângulo que o arrasto do recorte pede agora, ou `null` (traço curto demais). */
  private cropWanted(x: number, y: number): CropBox | null {
    const drag = this.cropDrag;
    if (drag === null) return null;
    if (drag.zone === 'tracar' || drag.start === null) {
      const w = Math.abs(x - drag.ax) * this.camera.zoom;
      const h = Math.abs(y - drag.ay) * this.camera.zoom;
      if (w < CROP_MIN_DRAW_PIXELS || h < CROP_MIN_DRAW_PIXELS) return null;
      return cropFromCorners(drag.ax, drag.ay, x, y);
    }
    return dragCrop(drag.start, drag.zone, x - drag.ax, y - drag.ay);
  }

  /** Um passo do arrasto do recorte: um `SetCrop` que se junta ao anterior. */
  private moveCrop(doc: EditorDoc, x: number, y: number): void {
    const drag = this.cropDrag;
    if (drag === null) return;
    const box = this.cropWanted(x, y);
    if (box === null) return;
    const now = cropInFile(doc.file, drag.animation);
    if (now !== null && now.x === box.x && now.y === box.y && now.width === box.width && now.height === box.height) return;
    doc.run(new SetCrop(drag.animation, box, 'cena'));
    drag.moved = true;
    this.cropDragSays = `${box.width} × ${box.height} px`;
  }

  /** O fim do arrasto do recorte: o último passo, e o rodapé diz o que ficou. */
  private endCrop(doc: EditorDoc, x: number, y: number): void {
    const drag = this.cropDrag;
    if (drag === null) return;
    this.moveCrop(doc, x, y);
    doc.endMerge?.();
    if (!drag.moved) {
      // Clique parado: nada muda. Fora do retângulo, ensina o traço.
      if (drag.zone === 'tracar') doc.notice('Arraste de um canto ao outro para traçar o recorte. Enter ou Esc termina');
      return;
    }
    const box = cropInFile(doc.file, drag.animation);
    if (box === null) return;
    const what = drag.zone === 'tracar' ? 'Recorte traçado' : drag.zone === 'move' ? 'Recorte movido' : 'Recorte';
    doc.notice(`${what} ${cropSays(box)}. Ctrl+Z desfaz`);
  }

  private onPointerUp(e: PointerEvent): void {
    if (!this.pointerDown) return;
    const screen = this.screenOf(e);
    const world = this.camera.screenToWorld(screen.x, screen.y);
    if (this.cropDrag !== null) {
      const doc = this.doc;
      if (doc !== null) this.endCrop(doc, world.x, world.y);
      this.cropDrag = null;
      this.cropDragSays = null;
      this.pointerDown = false;
      if (this.canvas?.hasPointerCapture(e.pointerId) === true) this.canvas.releasePointerCapture(e.pointerId);
      this.needsDraw = true;
      return;
    }
    if (this.shapeDrag !== null) {
      this.shapeDrag = null;
      if (this.shapeDragSays !== null) this.doc?.notice(this.shapeDragSays.text);
      this.shapeDragSays = null;
      this.doc?.endMerge?.();
      this.pointerDown = false;
      if (this.canvas?.hasPointerCapture(e.pointerId) === true) this.canvas.releasePointerCapture(e.pointerId);
      this.needsDraw = true;
      return;
    }
    const guia = this.guideDrag;
    if (guia !== null) {
      this.guideDrag = null;
      this.pointerDown = false;
      if (this.canvas?.hasPointerCapture(e.pointerId) === true) {
        this.canvas.releasePointerCapture(e.pointerId);
      }
      // Soltar de volta em cima de uma régua é desistir.
      if (rulerAt(screen.x, screen.y, RULER_SIZE) === null) {
        const nova = guideFromRuler(guia.ruler, world.x, world.y);
        changeViewSettings({ guides: addGuide(viewSettings().guides, nova), showGuides: true }, this.doc);
        this.doc?.notice(`${guideLabel(nova)}. Exibir → A cena → Limpar guias apaga todas`);
      }
      this.needsDraw = true;
      return;
    }
    const doc = this.doc;
    if (!this.panning && doc !== null) {
      getActiveTool()?.onUp?.(doc, this.toolEvent(e, world.x, world.y));
      // The drag is over: the next one must be its own undo entry.
      (doc as EditorDoc & DocWithCamera).endMerge?.();
      // F1: o último recado do gesto, dito de novo DEPOIS do último `repose`
      // — antes ele era apagado no mesmo quadro em que nascia.
      const chave = this.gestureNotice.keyNotice();
      const said = this.gestureNotice.release();
      if (said !== null) {
        const preso = this.heldByRule(doc, this.gestureNotice.lastCommand() ?? said);
        // Rodada 46, lote 5: o osso preso por regra ganha a porta — a aba
        // Regras vem para a frente, com o olho da regra a um clique.
        if (preso !== null && hasAction('mostrar-painel-regras')) {
          runAction('mostrar-painel-regras');
          doc.notice(preso + HELD_DOOR);
        } else {
          doc.notice(preso ?? gestureSays(said, chave, this.gestureNotice.lastCommand()));
        }
      }
      // Lote 60b: o clique parado que abria a lista da pasta saiu. A grade de
      // imagens já está na cena, embaixo do desenho escolhido.
    }
    this.pointerDown = false;
    // A grade some durante o arrasto e volta ao soltar.
    this.needsDraw = true;
    // Rodada 46, lote 2: a mão do botão do meio sai; a do Espaço fica até a tecla subir.
    if (this.panning && !this.spaceHeld) this.canvas?.classList.remove('is-panning');
    this.panning = false;
    if (this.canvas?.hasPointerCapture(e.pointerId) === true) {
      this.canvas.releasePointerCapture(e.pointerId);
    }
    this.needsDraw = true;
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    const screen = this.screenOf(e);
    const steps = e.deltaY > 0 ? -1 : 1;
    this.camera.zoomBySteps(screen.x, screen.y, steps);
    this.cameraChanged();
  }

  /**
   * Marca o tempo para a etiqueta do nome — item 59.
   *
   * Zera a etiqueta a cada movimento e remarca: parou 300 ms, ela aparece. É o
   * mesmo tempo que um `title` do navegador leva, e por isso ela não parece uma
   * coisa nova para quem já usa o computador.
   */
  private armHover(e: PointerEvent): void {
    if (this.hoverTimer !== 0) clearTimeout(this.hoverTimer);
    this.hoverTimer = 0;
    if (this.hover !== null) {
      this.hover = null;
      this.needsDraw = true;
    }
    if (!viewSettings().hoverNames || this.pointerDown) return;
    const screen = this.screenOf(e);
    const world = this.camera.screenToWorld(screen.x, screen.y);
    this.hoverTimer = setTimeout(() => {
      this.hoverTimer = 0;
      const doc = this.doc;
      if (doc === null) return;
      const hit = pickAt(doc.skeleton, world.x, world.y, this.camera.zoom, 0, currentLocks());
      if (hit === null) return;
      this.hover = {
        name: hit.kind === 'bone' ? hit.bone : `${hit.slot ?? ''}/${hit.attachment ?? ''}`,
        x: world.x,
        y: world.y,
      };
      this.needsDraw = true;
    }, HOVER_DELAY_MS) as unknown as number;
  }

  /** Desenha a etiqueta do nome, em pixels de tela, ao lado do cursor. */
  drawHoverName(ctx: CanvasRenderingContext2D, scale: number): void {
    const hover = this.hover;
    if (hover === null) return;
    const pad = 5 / scale;
    ctx.save();
    ctx.font = `${13 / scale}px "Segoe UI", system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    const width = ctx.measureText(hover.name).width;
    const height = 17 / scale;
    const x = hover.x + 12 / scale;
    const y = hover.y - height - 6 / scale;
    ctx.fillStyle = 'rgba(26, 26, 26, 0.88)';
    ctx.fillRect(x, y, width + pad * 2, height);
    ctx.fillStyle = '#ffffff';
    // O canvas está com Y para cima; o texto tem que ser desenhado com Y para
    // baixo, senão ele sai de cabeça para baixo.
    ctx.scale(1, -1);
    ctx.fillText(hover.name, x + pad, -(y + height) + 2 / scale);
    ctx.restore();
  }

  private onKeyDown(e: KeyboardEvent): void {
    if (e.key === ' ') {
      // A tecla segurada repete o keydown: só a primeira descida conta.
      if (!this.spaceHeld) {
        this.spaceDownAt = e.timeStamp;
        this.spaceMoved = 0;
      }
      this.spaceHeld = true;
      this.canvas?.classList.add('is-panning');
      e.preventDefault();
      // Lote 68: o Espaço toca em toda parte, também na cena. Segurar e
      // arrastar continua movendo a vista; quem decide é a subida
      // (`spaceGesture`). Para o evento aqui, para a casca não tocar também.
      e.stopPropagation();
      return;
    }
    const doc = this.doc;
    if (doc === null) return;
    // N-4b: Enter ou Esc terminam o Recorte na cena (`ui/keys.ts`, escopo
    // `cena`, "com Recorte na cena ligado"). Durante o arrasto, Esc desiste
    // dele: o retângulo volta ao de quando o botão desceu.
    if (cropEditing() && (e.key === 'Enter' || e.key === 'Escape') && !isTyping(e.target)) {
      if (this.cropDrag !== null) {
        if (this.cropDrag.moved) doc.undo();
        this.cropDrag = null;
        this.cropDragSays = null;
        this.pointerDown = false;
        doc.notice('Arrasto do recorte desfeito');
      } else {
        setCropEditing(false);
        doc.notice(this.cropDoneNotice(doc));
      }
      e.preventDefault();
      e.stopPropagation();
      this.needsDraw = true;
      return;
    }
    // A key the canvas answers must not reach the shell, which listens on the
    // document and would answer it AGAIN: a toggle (P, 8, 0) pressed once
    // would flip twice and land where it started. `stopPropagation` is what
    // says "handled" here.
    if (getActiveTool()?.onKey?.(doc, e.key) === true) {
      e.preventDefault();
      e.stopPropagation();
      this.needsDraw = true;
      return;
    }
    // Lote 66: Ctrl + setas mexem na ordem de desenho do escolhido, na cena,
    // como no Spriter. Sem desenho escolhido a tecla passa: Ctrl + ↑ e ↓ são
    // também as marcas da linha do tempo.
    // A tecla vem da tabela (`ui/keys.ts`, escopo `cena`); o Alt não conta.
    const campo = isTyping(e.target);
    const ordem = campo ? null : orderDirOfActions(actionsFor('cena', keyOf(e, true)));
    if (ordem !== null && orderTargets(corpoDe(doc).file, doc.selection).length > 0) {
      runOrderStep(doc, ordem);
      e.preventDefault();
      e.stopPropagation();
      this.needsDraw = true;
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    // 7 8 9 0: show bones, lock bones, show drawings, lock drawings.
    if (toggleViewKey(e.key, doc)) {
      // Prova de pessoa (05/11/2026): o 7 escondia os ossos CALADO — quem
      // apertava sem querer via o boneco perder os ossos e não sabia a volta.
      // A mesma frase dos botões do alto (`switchNotice`).
      const campo = VIEW_TOGGLE_KEYS[e.key];
      const frase = campo === undefined ? null : switchNotice(campo, viewSettings()[campo]);
      if (frase !== null) doc.notice(frase);
      e.preventDefault();
      e.stopPropagation();
      this.needsDraw = true;
      return;
    }
    // A letra da ferramenta vale sempre — degrau 4a: nenhuma ferramenta some
    // por modo, então não há mais recado mandando trocar de modo.
    const tool = toolOfKey(keyOf(e));
    if (tool !== null) {
      setActiveTool(tool.id, doc);
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // As setas andam com o escolhido — item 53 — e só COM O FOCO NA CENA: na
    // linha do tempo elas já andam no tempo, e uma tecla é atendida uma vez.
    const nudge = nudgeFor(e.key, e.shiftKey);
    // Sem osso escolhido, andam os desenhos (lote 60a): antes andava a raiz.
    if (nudge !== null
      && (nudgeSelection(doc, nudge.dx, nudge.dy) > 0 || nudgeDrawings(doc, nudge.dx, nudge.dy) > 0)) {
      e.preventDefault();
      e.stopPropagation();
      this.needsDraw = true;
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    if (e.key === ' ') {
      this.spaceHeld = false;
      this.canvas?.classList.remove('is-panning');
      e.stopPropagation();
      // Apertou e soltou sem arrastar: toca, ou pausa — a mesma ação do menu.
      if (spaceGesture(this.spaceDownAt, e.timeStamp, this.spaceMoved) === 'tocar') runAction('tocar');
      this.spaceMoved = 0;
      return;
    }
    const doc = this.doc;
    if (doc === null) return;
    // Gestos de segurar (o P do lote 31): a tecla que sobe termina o gesto, e
    // para aqui, pela mesma razão da que desce — a casca ouve no documento e
    // atenderia a mesma subida uma segunda vez.
    if (getActiveTool()?.onKeyUp?.(doc, e.key) === true) {
      e.stopPropagation();
      this.needsDraw = true;
    }
  }

  /**
   * Põe na cena a classe que a ferramenta pediu, e tira a de antes.
   *
   * A ferramenta diz o nome; o desenho do cursor fica no `viewport.css`. É o
   * único lugar que mexe nessas classes, então elas não brigam entre si.
   */
  private syncToolCursor(): void {
    const canvas = this.canvas;
    if (canvas === null) return;
    const wanted = getActiveTool()?.cursorClass?.() ?? null;
    if (this.toolCursorClass !== null && this.toolCursorClass !== wanted) {
      canvas.classList.remove(this.toolCursorClass);
    }
    if (wanted !== null) canvas.classList.add(wanted);
    this.toolCursorClass = wanted;
  }

  // -- drawing ---------------------------------------------------------------

  devicePixelRatio(): number {
    return viewportDraw.devicePixelRatio(this);
  }

  private resize(): void {
    return viewportDraw.resize(this);
  }

  private draw(): void {
    return viewportDraw.draw(this);
  }

  /**
   * A grade de imagens do Spriter — lote 60b; desde o 60c, aberta pelo botão
   * direito (`openDrawingMenu`). Acompanha o zoom e o pan: é reposta a cada
   * quadro desenhado. Some durante o arrasto e volta ao soltar. Quem sabe se
   * ela está aberta é a própria grade (`image-picker.ts`).
   */
  syncImageGridLayer(): void {
    return viewportDraw.syncImageGridLayer(this);
  }

  /**
   * As guias, em espaço de TELA: uma linha fina de ponta a ponta da cena, na
   * cor ciano que nenhum desenho usa. Travadas, tracejadas — o mesmo sinal
   * dos cadeados da Árvore, que acinzentam o que o clique não alcança.
   */
  drawGuides(ctx: CanvasRenderingContext2D, dpr: number): void {
    return viewportDraw.drawGuides(this, ctx, dpr);
  }

  /**
   * Apaga os slots escondidos e devolve quais foram apagados, para religar.
   *
   * Só os que estavam visíveis entram na lista: um slot que já estava invisível
   * por causa do arquivo tem que continuar invisível depois.
   */
  hideHiddenSlots(skeleton: Skeleton): Slot[] {
    return viewportDraw.hideHiddenSlots(this, skeleton);
  }

  /** Grid and axes, drawn in screen space so the lines stay crisp. */
  /**
   * Carrega a imagem de referência quando o arquivo passa a pedir outra — item
   * 62.
   *
   * A imagem mora no navegador (IndexedDB) e o arquivo só guarda o NOME. Trocar
   * de arquivo, ou apagar o guia, tem de devolver o endereço temporário do blob
   * ao navegador: sem o `revokeObjectURL` cada troca deixaria um PNG inteiro
   * preso na memória da aba até ela fechar.
   */
  syncReference(): void {
    return viewportDraw.syncReference(this);
  }

  /** Devolve ao navegador a imagem que estava carregada. */
  forgetReferenceImage(): void {
    return viewportDraw.forgetReferenceImage(this);
  }

  /**
   * Desenha o guia, com a opacidade escolhida — item 62.
   *
   * Em coordenadas do MUNDO, e não da tela: o guia tem de andar e crescer junto
   * com o personagem quando alguém aproxima o zoom, senão ele deixa de ser um
   * guia no primeiro clique. Como Y cresce para cima aqui e para baixo na
   * imagem, o desenho é feito com a escala vertical invertida.
   */
  drawReference(ctx: CanvasRenderingContext2D, dpr: number): void {
    return viewportDraw.drawReference(this, ctx, dpr);
  }

  /**
   * "Exibir → Imagem de referência…" — item 62.
   *
   * Uma janela só, com tudo: escolher o PNG, os quatro números e o botão de
   * tirar. Escolher outra imagem troca a de agora; deixar o campo do arquivo
   * vazio mantém a que já está lá e muda só os números — que é o gesto de todo
   * dia, porque a imagem se escolhe uma vez e a posição se ajusta dez.
   *
   * Diz **na janela** que a imagem fica no navegador e não no `.bone`. Quem
   * mandar o arquivo para outra pessoa precisa saber que o guia não vai junto,
   * e descobrir isso do outro lado é descobrir tarde.
   */
  private async referenceWindow(doc: EditorDoc): Promise<void> {
    return viewportDraw.referenceWindow(this, doc);
  }

  /**
   * As réguas com números, em cima e à esquerda — lote 21, rodada 3.
   *
   * Desenhadas por ÚLTIMO e em espaço de TELA: elas são a moldura do papel, e
   * uma moldura que o desenho tapa não é moldura. Uma linha fina acompanha o
   * ponteiro nas duas, para saber em que número o cursor está sem contar
   * marcas com o dedo.
   *
   * A conta é do `viewport/rulers.ts`, e ela usa o MESMO `gridStep` da grade:
   * régua e grade nunca podem discordar — duas escalas na mesma tela é pior
   * que nenhuma.
   */
  drawRulers(ctx: CanvasRenderingContext2D, dpr: number): void {
    return viewportDraw.drawRulers(this, ctx, dpr);
  }

  drawGrid(ctx: CanvasRenderingContext2D, dpr: number): void {
    return viewportDraw.drawGrid(this, ctx, dpr);
  }

  /** The name of every bone, next to its root, in a fixed size on screen. */
  drawBoneNames(ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawBoneNames(this, ctx, skeleton, scale);
  }

  /**
   * Bones: a line to the tip, a triangle on the root, and — requirement R2 —
   * the bone's OWN colour and its icon.
   *
   * The colour comes from `bones[].color` of the file (spec 4.2, "cor no
   * editor"), so painting a bone is a change to the document like any other and
   * travels with it. A selected bone still goes blue: the selection has to win,
   * or a bone painted blue would be indistinguishable from a selected one.
   */
  drawBones(ctx: CanvasRenderingContext2D, doc: EditorDoc, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawBones(this, ctx, doc, skeleton, scale);
  }

  /**
   * The icon of every bone that has one — requirement R2, `bones[].icon`.
   *
   * Drawn to the LEFT of the root, so it never sits on top of the name, which
   * is drawn to the right. Fixed size on screen and a white outline behind it,
   * the same treatment the names get, so it stays readable over a drawing.
   */
  drawBoneIcons(ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawBoneIcons(this, ctx, skeleton, scale);
  }

  /** Outlines of the attachments in the selected slots. */
  drawSelectedSlots(ctx: CanvasRenderingContext2D, doc: EditorDoc, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawSelectedSlots(this, ctx, doc, skeleton, scale);
  }

  /** `boundingbox` attachments, which are guides and never pixels. */
  drawBoundingBoxes(ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawBoundingBoxes(this, ctx, skeleton, scale);
  }

  /**
   * Máscaras (`clipping`), tracejadas — item 47.
   *
   * Tracejado e numa cor própria, porque uma máscara não é desenho: ela é o
   * corte. Sólida, ela seria confundida com uma caixa de colisão, que é o outro
   * polígono que aparece por cima do personagem.
   */
  drawClippings(ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawClippings(this, ctx, skeleton, scale);
  }

  /** `point` attachments: a cross plus a tick showing their rotation. */
  /**
   * Escreve uma palavra no mundo, no tamanho de tela — item 20.
   *
   * O mundo tem Y para cima e a letra não, então o texto é desvirado aqui. O
   * contorno grosso por baixo é o que faz o nome continuar legível em cima de
   * um desenho claro ou de um desenho escuro, sem precisar de caixa atrás.
   */
  drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string): void {
    return viewportDraw.drawLabel(this, ctx, text, x, y, scale, color);
  }

  /** O nome de cada slot, na origem do osso que o carrega — item 20. */
  drawSlotNames(ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawSlotNames(this, ctx, skeleton, scale);
  }

  /** O nome de cada ponto, ou de cada caixa, onde ele está — item 20. */
  drawAttachmentNames(ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number, kind: 'point' | 'boundingbox'): void {
    return viewportDraw.drawAttachmentNames(this, ctx, skeleton, scale, kind);
  }

  drawPoints(ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
    return viewportDraw.drawPoints(this, ctx, skeleton, scale);
  }
}

export const viewportPanel = new ViewportPanel();
registerPanel(viewportPanel);
