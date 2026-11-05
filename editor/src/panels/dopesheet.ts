/**
 * Panel "Linha do tempo" — the dopesheet.
 *
 * One line per timeline, a diamond per key, a ruler in seconds AND in frames,
 * and a playhead that can be dragged. This is where an animation is actually
 * built, so everything it does goes through `anim/keying.ts` and the commands
 * of `anim/pose-mode.ts`: the panel never touches the JSON itself.
 *
 * WHY DOM AND NOT CANVAS
 * A diamond is a `<button>`. That means it can be reached with Tab, it carries
 * a written label a screen reader can say ("Chave em 0,50 s"), and the browser
 * does the hit testing. A canvas dopesheet would be smaller code and a worse
 * tool.
 *
 * WHAT IS WHERE ON SCREEN
 *   left column, fixed width  the name of the property, indented under the
 *                             name of the bone or slot it belongs to;
 *   right column, elastic     the track, where time runs left to right.
 * The two columns share the same width variable, so the ruler and the rows can
 * never drift apart.
 *
 * MOUSE — as três teclas de G2, degrau 6 (17/09/2026), as do Spriter
 *   drag the ruler        moves the playhead
 *   click a diamond       escolhe só ela
 *   Ctrl + click          SOMA à seleção
 *   Shift + click         TIRA da seleção, e não começa arrasto
 *   drag a diamond        move as chaves ESCOLHIDAS, encaixadas no quadro
 *                         (Alt solta do encaixe). NUNCA empurra as seguintes:
 *                         "empurrar" é o comando Animação → Empurrar as
 *                         chaves…, e é assim no Spriter também (cap. 11).
 *   Ctrl + drag a diamond CLONA as escolhidas em vez de mover — item 6. Os
 *                         originais ficam; as cópias nascem no tempo novo e
 *                         ficam escolhidas.
 *   drag over empty track desenha um retângulo; o que ele tocar entra na
 *                         seleção (Ctrl soma ao que havia, Shift tira)
 *
 * KEYBOARD (the panel must have the focus)
 *   Delete / Backspace    removes the selected keys
 *   Ctrl+C / Ctrl+V       copies and pastes keys, the first one at the playhead
 *   Left / Right          previous and next frame
 *   Up / Down             previous and next key
 *   Home / End            start and end of the animation
 */

import type { DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel, skeletonsDe } from '../contract.js';
import {
  activeRuns, bandMenu, cycleLength, entityBand, entityShortName, entitySlots, missingChildNotice, moveBandRun,
  seamWarning, snapTipToEnd, timeScaleForTip, writeBandTimeScale,
} from '../anim/entity-band.js';
import { toggleEntityLoop } from './entities-actions.js';
import type { BandSegment, EntitySlot } from '../anim/entity-band.js';
import { DEFAULT_SEQUENCE_MODE, SEQUENCE_MODES, activeAttachmentOf, describeSequenceKey, findSequence, noSequenceNotice, sequenceKeyValue } from '../anim/sequence-key.js';
import { allKeyRefs, findTimeline, newKeysNotice, onRevealKey, revealKey, allKeyTimes, cloneKeys, dopesheetGroups, durationOf, findAnimation, hasSteppedCells, keyRefKey, keyRefsForTargets, moveKeys, nestedTarget, nextKeyTime, previousKeyTime, removeKey, roundTime, sameTime, sequenceTarget, setKey, steppedCells, CURVE_KINDS, curveKindOf, setKeyCurve, targetKey, targetInfo, setKeyFocus, onKeyFocus } from '../anim/keying.js';
import type { CurveKind, KeyRef, RowGroup, StepCell, TimelineRow } from '../anim/keying.js';
import { type MirrorPair } from '../anim/timeline-tools.js';
import { EditKeys, keyValuesNow, targetsForSelection } from '../anim/pose-mode.js';
import { BREAKDOWN_LABEL, breakdownNotice, breakdownValues, type BreakdownKind } from '../anim/breakdown.js';
import { selectChildren } from '../doc/duplicate.js';
import type { TimelineTarget } from '../anim/keying.js';
import { clear, el, stylesheetsPreloaded } from './dom.js';
import { askForm } from '../ui/dialog.js';
import { renderEventKeyEditor } from './event-key-editor.js';
import { registerAction, runAction } from '../ui/actions.js';
import { actionsFor, isTyping, keyOf } from '../ui/keys.js';
import { BASE_SHEET_NOTE, KEY_HINT, dragReadout, keyTitle, popupPlacement, segmentPath, shouldAnnounceNewKeys, entityStartValue, formatSeconds, bandLimitNotice, deleteKeyGoesTo, DUPLICATE_IN_TIMELINE_NOTICE, keyMenuPlan, curveAppliedNotice } from './dopesheet-model.js';
import { removeKeyRef } from '../anim/body.js';

import { hasKeysCopied, setEntityAnimationAt } from './dopesheet-actions.js';
import type { KeyTouch, MoreControl, PlayerControl } from './dopesheet-model.js';
import { dockState, onDockChange, visibleGroups } from './dock-model.js';
import { onPrefsChange } from '../ui/prefs.js';
import { transport } from '../anim/transport.js';
import { summaryTimes } from '../anim/summary.js';
import { markerLabel, renameMarker, type Marker, type TimelineState } from '../anim/markers.js';
import * as dopesheetPlayer from './dopesheet-player.js';
import * as dopesheetEdit from './dopesheet-edit.js';
import * as dopesheetPointer from './dopesheet-pointer.js';
// Rodada 39, lote 3: a linha da montagem de teste, só para ler.
import { montagemLineText } from './entities-cards-model.js';

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------

let styleLinked = false;
/** Links `dopesheet.css` once, the first time the panel mounts. */
function ensureDopesheetStyle(): void {
  if (stylesheetsPreloaded() || styleLinked || typeof document === 'undefined') return;
  styleLinked = true;
  const href = new URL('./dopesheet.css', import.meta.url).href;
  if (document.head.querySelector(`link[href="${href}"]`) !== null) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

// ---------------------------------------------------------------------------
// Numbers the panel needs
// ---------------------------------------------------------------------------

/** Frames per second of the skeleton, only ever a hint for the ruler. */
export function fpsOf(doc: EditorDoc): number {
  const written = doc.file.skeleton?.fps;
  return typeof written === 'number' && written > 0 ? written : 30;
}

/** Seconds the track covers. Never zero, or the ruler would have no width. */
export function spanOf(doc: EditorDoc): number {
  if (doc.animation === null) return 1;
  const animation = findAnimation(doc.file, doc.animation);
  if (animation === null) return 1;
  return Math.max(durationOf(animation), 1);
}

/** O fim de verdade da animação aberta (sem o mínimo de 1 s da régua), ou 0. */
export function spanEnd(doc: EditorDoc | null): number {
  if (doc === null || doc.animation === null) return 0;
  const animation = findAnimation(doc.file, doc.animation);
  return animation === null ? 0 : durationOf(animation);
}

/** Time as a percentage of the track, for `style.left`. */
export function percentOf(time: number, span: number): number {
  return (time / span) * 100;
}

/** Frame steps a ruler may use, so labels never crowd each other. */
/**
 * Os passos da régua em SEGUNDOS redondos — rodada 40, lote 5 (doc 39, §4).
 *
 * Eram quadros (1, 2, 5…), e a 30 quadros por segundo 2 quadros escreviam
 * 0,07 · 0,13 · 0,20. Agora o passo é 0,1 · 0,2 · 0,25 · 0,5 · 1 · 2 · 5… s,
 * e só vale o que cai num quadro inteiro (0,1 s a 24 quadros não cai).
 */
const SECOND_STEPS = [0.05, 0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 15, 20, 30, 60, 120, 300];

/** The frame step whose ticks are at least `minPixels` apart, on round seconds. */
export function frameStepFor(fps: number, span: number, width: number, minPixels = 64): number {
  const pixelsPerSecond = width > 0 && span > 0 ? width / span : 0;
  if (pixelsPerSecond <= 0) return fps;
  let last = fps;
  for (const seconds of SECOND_STEPS) {
    const frames = seconds * fps;
    if (Math.abs(frames - Math.round(frames)) > 1e-6 || Math.round(frames) < 1) continue;
    last = Math.round(frames);
    if (seconds * pixelsPerSecond >= minPixels) return last;
  }
  return last;
}

/** "0,50 s": mora em `dopesheet-model.ts` desde o lote A2, e sai daqui também. */
export { formatSeconds };

/** Time rounded to the nearest whole frame. */
export function snapToFrame(time: number, fps: number): number {
  return roundTime(Math.round(time * fps) / fps);
}

/**
 * O que vai escrito na bandeirinha da agulha — anotação 7 do Humberto:
 * *"não sei qual é o quadro que eu estou mexendo; podia estar escrito"*.
 *
 * O tempo e o quadro juntos, `0,02 s · q 1`, porque ele mexe nos dois: o campo
 * do tocador fala em segundos, e as setas ◂ ▸ andam de quadro em quadro. O
 * quadro é o mesmo do `snapToFrame`, arredondado, senão a bandeirinha diria um
 * número e a seta levaria a outro.
 */
export function playheadLabel(time: number, fps: number): string {
  const frame = Math.round(time * Math.max(1, fps));
  return `${formatSeconds(time)} · q ${frame}`;
}

/**
 * `true` quando a agulha está **em cima de uma chave**, qualquer que seja a
 * linha — a mesma conta do Resumo, que é a linha que mostra isso na tela.
 *
 * O campo de tempo do tocador pinta de laranja quando isto é `true`: parte da
 * anotação 7. Estar em cima de uma chave muda o que a próxima tecla faz, e
 * antes disso nada dizia em qual dos dois lugares a agulha estava.
 */
export function playheadOnKey(doc: EditorDoc): boolean {
  if (doc.animation === null) return false;
  return summaryTimes(doc.file, doc.animation).some((time) => sameTime(time, doc.time));
}

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

/** What a pointer drag is currently doing. */
type DragMode = 'nenhum' | 'regua' | 'chaves' | 'laco';

/* A área de transferência das chaves mora em `dopesheet-actions.ts` desde o lote A2. */

export class DopesheetPanel implements Panel {
  readonly id = 'linha-do-tempo';
  readonly title = 'Linha do tempo';
  readonly listensTo = ['file', 'structure', 'time', 'selection'] as const;

  doc: EditorDoc | null = null;
  host: HTMLElement | null = null;
  private header: HTMLElement | null = null;
  ruler: HTMLElement | null = null;
  body: HTMLElement | null = null;
  cursor: HTMLElement | null = null;
  /** A faixa da linha Resumo, no cabeçalho. */
  summaryTrack: HTMLElement | null = null;
  /**
   * A linha dos botões em bloco e o pé de eventos, que só aparecem ABERTA.
   *
   * Fechada, a faixa é o tocador, a régua e o Resumo — lote 14, rodada 3. Os
   * botões em bloco continuam no menu Animação, com a tecla escrita ao lado:
   * nada some, só sai da frente (regra 9 do plano).
   */
  blockBar: HTMLElement | null = null;
  detailsNode: HTMLButtonElement | null = null;
  private stopDockWatch: (() => void) | null = null;
  /** As chaves da animação aberta no último olhar, para achar as que nasceram. */
  private knownKeys: { animation: string; ids: Set<string> } | null = null;
  /** Solta a escuta do `revealKey` (P12). */
  private stopRevealWatch: (() => void) | null = null;
  private stopPrefsWatch: (() => void) | null = null;
  /** Mostrar só as linhas do que está escolhido — item 95. Só de sessão. */
  onlySelected = false;
  /** `Ctrl` no arrasto: clona a chave, deixando a original onde estava — item 6. */
  cloning = false;
  /** O último toque simples num losango, para contar o duplo clique — rodada 40, lote 3. */
  lastKeyTouch: KeyTouch | null = null;
  /** A leitura do arrasto, junto do mouse — rodada 40, lote 3. */
  private dragLabel: HTMLElement | null = null;
  /** As chaves a clonar quando o arrasto com `Ctrl` terminar — capturadas no clique. */
  cloneSource: KeyRef[] = [];
  /**
   * As chaves de cada linha, por identidade EXATA, refeitas a cada desenho.
   *
   * `dopesheetGroups` dá só os tempos, e um tempo não identifica uma chave de
   * evento: dois eventos podem disparar no mesmo instante, e o que os separa é
   * o nome. Sem isto, a chave de evento que o Resumo escolhia era descartada no
   * desenho seguinte por `dropMissingSelection`, e o arrasto a deixava para
   * trás sem dizer nada.
   */
  private refsByTarget = new Map<string, KeyRef[]>();
  /** Cada controle do tocador pelo seu id, para o `refresh` acertar todos. */
  playerNodes = new Map<string, HTMLElement>();
  timeField: HTMLInputElement | null = null;
  frameLabel: HTMLElement | null = null;
  /** A bandeirinha presa na agulha: `0,02 s · q 1` — anotação 7. */
  cursorFlag: HTMLElement | null = null;
  durationField: HTMLInputElement | null = null;
  speedBar: HTMLInputElement | null = null;
  speedField: HTMLInputElement | null = null;
  private stopTransportWatch: (() => void) | null = null;
  /** How much "Esticar seleção" stretches. 2 doubles, 0,5 halves. */
  factorBox: HTMLInputElement | null = null;
  /** The rule of what a mirrored pair of names looks like. */
  rulesBox: HTMLInputElement | null = null;
  /** The line that shows the pairs found, BEFORE anything is swapped. */
  pairsNode: HTMLElement | null = null;
  /** Onde o bloco "Chave de evento" mora, no fim do painel. */
  eventBox: HTMLElement | null = null;
  private resizeWatch: ResizeObserver | null = null;

  /** The animation the sheet on screen belongs to. */
  private shownAnimation: string | null = null;
  /** Selected keys, by `keyRefKey`. */
  selected = new Map<string, KeyRef>();
  /** Rows whose name was clicked; "Chavear" uses them when it is not empty. */
  pickedRows = new Map<string, TimelineTarget>();

  drag: DragMode = 'nenhum';
  dragStart = { x: 0, y: 0, time: 0 };
  dragDelta = 0;
  band: HTMLElement | null = null;
  /**
   * O que o retângulo de laço faz com o que tocar — decidido no `pointerdown`
   * pela tecla (G2), e lido no soltar. No soltar já não há tecla: o usuário
   * pode ter largado o `Ctrl` no meio, e o gesto termina sendo o que começou.
   */
  bandMode: 'trocar' | 'somar' | 'tirar' = 'trocar';
  /** O que desfazer no registro de ações quando o painel for desmontado. */
  private forgetActions: Array<() => void> = [];
  /** Solta o aviso das opções de ver, para o ícone da cebola acompanhar. */
  stopOnionWatch: (() => void) | null = null;
  /** Para de escutar a chave em foco do gráfico — rodada 40, lote 1. */
  private stopFocus: (() => void) | null = null;
  /** Fecha o menu da curva. Vira uma função de verdade enquanto ele existe. */
  private closeCurveMenu: () => void = () => {};

  // -------------------------------------------------------------------------
  // Mounting
  // -------------------------------------------------------------------------

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureDopesheetStyle();
    this.doc = doc;
    this.host = host;
    clear(host);
    host.classList.add('dope');
    host.tabIndex = 0;
    host.addEventListener('keydown', this.onKeyDown);
    // Rodada 23, defeito 1: o clique na folha leva o teclado junto. O losango,
    // a faixa e a régua param o evento (para não selecionar texto no arrasto),
    // e com isso o foco ficava onde estava — na Árvore, na cena — e o `Delete`
    // com uma chave escolhida apagava o OSSO. Na captura, antes de quem para.
    host.addEventListener('pointerdown', this.takeFocus, true);
    // Rodada 40, lote 1: a chave escolhida no gráfico vem para cá.
    this.stopFocus?.();
    this.stopFocus = onKeyFocus(this.onFocusFromGraph);

    // The ruler is built here but lives inside the body, stuck to its top; see
    // the note on `.dope-cabecalho` in the stylesheet.
    this.header = this.buildHeader();
    // Sem o menu do navegador na régua: o botão direito ali marca o fim do
    // trecho de laço, e o menu por cima esconderia o resultado.
    this.ruler?.addEventListener('contextmenu', (event) => event.preventDefault());
    // A PRIMEIRA linha é o tocador — item 6 da pesquisa. Ele vivia escondido no
    // painel Animações, que é a lista de animações e não o lugar onde se
    // trabalha o tempo. Todos os cinco programas pesquisados põem o tocador
    // encostado na linha do tempo, e é o único lugar onde a mão já está.
    const bar = el('div', 'dope-barra');
    bar.append(this.buildKeyGroup());
    // O bloco da chave de evento fica no PÉ do painel, depois da folha: aqui o
    // cursor já está no instante certo, e é neste painel que se pensa em
    // "que evento dispara agora" (requisito A3).
    this.eventBox = el('div', 'dope-eventos');
    this.blockBar = bar;
    // Rodada 40, lote 2: a barra das chaves mora NA linha do tocador, antes do
    // Mais e do Detalhes, e só desce para uma linha própria quando não cabe
    // (`flex-wrap`). Em 1920 isso devolve 44 px às linhas de chave.
    const linha1 = this.buildPlayerRow();
    linha1.insertBefore(bar, linha1.children[1] ?? null);
    // Rodada 47, lote 1 (doc 68, C3): a casca põe as abas da faixa de baixo
    // NESTA linha, e não numa fileira própria: 48 px a mais para as chaves.
    linha1.setAttribute('data-faixa-linha', '');
    host.append(linha1, this.buildBody(), this.eventBox);
    // Fechada ou aberta é decisão da casca; a folha só obedece e redesenha.
    this.stopDockWatch = onDockChange(() => this.applyDock());
    // P12 (chat D, 2a): quem cria uma chave que a cena não mostra pede para vê-la.
    this.stopRevealWatch?.();
    this.stopRevealWatch = onRevealKey((ref) => this.revealKeyNow(ref));
    // A palavra ao lado do ícone é a MESMA preferência da barra de ações.
    this.stopPrefsWatch = onPrefsChange(() => this.applyToolNames());
    this.applyToolNames();
    this.applyDock();
    // Tocar mexe em `doc.time`, e o documento avisa; mas parar no fim da
    // animação não mexe em tempo nenhum, e sem este aviso o botão ficaria com
    // cara de "tocando" depois de já ter parado.
    this.stopTransportWatch = transport.onChange(() => this.syncPlayer());
    if (typeof ResizeObserver !== 'undefined' && this.ruler !== null) {
      this.resizeWatch = new ResizeObserver(() => this.renderRuler());
      this.resizeWatch.observe(this.ruler);
    }
    this.registerActions();
    this.render();
  }

  /**
   * As ações do menu Animação que a linha do tempo faz.
   *
   * Todas chamam a MESMA função dos botões das duas barras. Copiar e Colar
   * declaram `enabled` porque as teclas delas são Ctrl+C e Ctrl+V: sem isso, o
   * Ctrl+C de copiar um texto qualquer da tela seria engolido pela linha do
   * tempo com nada escolhido.
   */
  private registerActions(): void {
    for (const forget of this.forgetActions) forget();
    const open = (): boolean => this.doc?.animation != null;
    this.forgetActions = [
      registerAction('ir-inicio', { run: () => this.goTo(0), enabled: open }),
      registerAction('ir-fim', { run: () => this.goTo(this.endTime()), enabled: open }),
      registerAction('quadro-anterior', { run: () => this.stepFrame(-1), enabled: open }),
      registerAction('quadro-seguinte', { run: () => this.stepFrame(1), enabled: open }),
      registerAction('chave-anterior', { run: () => this.stepKey(-1), enabled: open }),
      registerAction('chave-seguinte', { run: () => this.stepKey(1), enabled: open }),
      // "do escolhido" — anotação 22, lote 33. Os dois de cima pulam para
      // QUALQUER chave da animação; estes dois só olham as linhas marcadas na
      // folha, ou, sem nenhuma marcada, as do que está escolhido na cena.
      // Numa animação de vinte linhas é a diferença entre andar na pose do
      // braço e parar em toda chave de todo mundo.
      registerAction('chave-anterior-escolhido', {
        run: () => this.stepKeyPicked(-1),
        enabled: () => open() && this.pickedTimes().length > 0,
      }),
      registerAction('chave-seguinte-escolhido', {
        run: () => this.stepKeyPicked(1),
        enabled: () => open() && this.pickedTimes().length > 0,
      }),
      registerAction('chavear', { run: () => this.keyNow(), enabled: open }),
      registerAction('apagar-chave', { run: () => this.unkeyNow(), enabled: open }),
      // `tocar` e `tocar-tras` NÃO moram aqui desde 22/09/2026: são de
      // arranque, em `dopesheet-actions.ts`. Registrá-las no `mount()` fazia a
      // tabela prometer que a BARRA DE ESPAÇO pode sumir junto com o painel —
      // e os dois só precisam do documento e do tocador.
      registerAction('selecionar-chaves', {
        run: () => this.selectAllKeys(),
        enabled: () => open() && this.refsByTarget.size > 0,
      }),
      registerAction('repetir', {
        run: () => this.toggleLoop(),
        enabled: open,
        checked: () => this.loopNow(),
      }),
      registerAction('copiar', {
        run: () => this.copySelected(),
        enabled: () => open() && this.hasKeysToCopy(),
      }),
      registerAction('colar', {
        run: () => this.pasteHere(),
        enabled: () => open() && hasKeysCopied(),
      }),
      // Item 2: o braço direito animado vira o esquerdo, pela mesma regra de
      // nome da caixa "Pares de nome" de Espelhar esquerda e direita.
      registerAction('colar-espelhado', {
        run: () => this.pasteMirrored(),
        enabled: () => open() && hasKeysCopied(),
      }),
      // Rodada 17, PL-25: o meio-termo, em Editar → Pose.
      registerAction('meio-termo', { run: () => this.breakdown('meio'), enabled: open }),
      registerAction('meio-termo-anterior', { run: () => this.breakdown('anterior'), enabled: open }),
      registerAction('meio-termo-seguinte', { run: () => this.breakdown('seguinte'), enabled: open }),
      registerAction('esticar-selecao', { run: () => this.stretchByField(), enabled: open }),
      registerAction('espelhar-tempo', { run: () => this.mirrorInTime(), enabled: open }),
      registerAction('fechar-ciclo', { run: () => this.closeTheLoop(), enabled: open }),
      registerAction('espelhar-lados', { run: () => { void this.mirrorLeftRight(); }, enabled: open }),
      // Item 4: dá porta à `rippleMove`, órfã desde que as três teclas do
      // arrasto (Ctrl, Shift, Alt) ganharam dono.
      registerAction('empurrar-chaves', { run: () => { void this.pushKeys(); }, enabled: open }),
      // Rodada 40, lote 4: o Offset do Spine — as linhas andam dando a volta.
      registerAction('deslocar-em-laco', { run: () => { void dopesheetEdit.askOffsetInLoop(this); }, enabled: open }),

      // ---- Chaves em bloco — itens 84 a 91 -------------------------------
      registerAction('chavear-tudo', { run: () => this.keyAllNow(), enabled: open }),
      // "Animação → Mudar duração…" era um item cinza desde o lote menus. Ele
      // é a porta que PERGUNTA se as chaves esticam junto; o campo da linha 1
      // muda só o número. Duas portas, duas perguntas diferentes, um só
      // `setDuration`.
      registerAction('mudar-duracao', { run: () => void this.askDuration(), enabled: open }),
      // Lote A2: 'copiar-pose' e 'colar-todas-chaves' moram em
      // `dopesheet-actions.ts`, registradas no arranque.
      registerAction('recortar-chaves', {
        run: () => this.cutSelected(),
        enabled: () => open() && this.selectedRefs.length > 0,
      }),
      registerAction('apagar-linhas', { run: () => this.removeLines(), enabled: open }),
      registerAction('limpar-animacao', { run: () => { void this.clearAll(); }, enabled: open }),
      // Item 8: tira a chave que não muda nada — o lixo do gravar-sozinho.
      registerAction('limpar-chaves-repetidas', { run: () => this.cleanRepeatedKeys(), enabled: open }),

      /*
       * As portas das funções que só existiam em gesto — lote 29, anotação 15.
       *
       * A varredura do Humberto achou dez funções sem porta nenhuma. Estas
       * quatro moravam só num `Alt` + clique ou numa tecla com o foco na
       * faixa: quem não leu o manual não tinha como descobrir que elas
       * existiam, e quem leu esquecia.
       */
      registerAction('laco-inicio', {
        run: () => this.setLoopEdge('from', this.doc?.time ?? 0),
        enabled: open,
      }),
      registerAction('laco-fim', {
        run: () => this.setLoopEdge('to', this.doc?.time ?? 0),
        enabled: open,
      }),
      registerAction('tirar-trecho', {
        run: () => this.clearLoopRange(),
        enabled: () => this.timeline().loop !== undefined,
      }),
      registerAction('nova-marca', { run: () => this.toggleMarker(), enabled: open }),
      registerAction('marca-anterior', { run: () => this.stepMarker(-1), enabled: open }),
      registerAction('marca-seguinte', { run: () => this.stepMarker(1), enabled: open }),

      /*
       * A interpolação, do menu — anotação 15, item g.
       *
       * Os quatro itens do menu Animação → Interpolação estavam **cinzas
       * desde o lote 12**, esperando um lote que já tinha passado: o botão
       * direito no losango faz isso desde então, e ninguém ligou o menu. Quem
       * não sabia do botão direito não tinha como saber que dava.
       */
      ...CURVE_KINDS.map((kind) => registerAction(`interp-${kind.id}`, {
        run: () => this.applyCurve(kind.id),
        enabled: () => this.selected.size > 0,
      })),
      registerAction('interp-curva', {
        // `mostrar-painel-*`, e não o interruptor `painel-*` — defeito 2
        // (19/09/2026): com a aba Curvas já à frente, o interruptor a FECHA,
        // e quem pediu "Curva…" queria justamente vê-la. Achado pelo guarda
        // de `acoes.test.ts`, na aba Curvas em vez da Regras.
        run: () => { runAction('mostrar-painel-curvas'); },
        enabled: () => this.selected.size > 0,
      }),
    ];
  }

  /**
   * Moving the playhead only moves the playhead. Everything else redraws.
   *
   * Careful: OPENING an animation also arrives as a `time` change (that is what
   * `Doc.animation` emits), and that one has to redraw the whole sheet — hence
   * the comparison against the animation currently on screen.
   */
  refresh(change: DocChange): void {
    const open = this.doc?.animation ?? null;
    // K3, L17 (chat D, 2a): a chave que nasceu calada ganha a frase no rodapé.
    if (change.kind === 'file') this.knownKeys = null;
    else if (change.kind === 'structure') this.noticeNewKeys(shouldAnnounceNewKeys(change.label));
    // Trocar de osso não redesenha a folha inteira, mas MUDA a cor do Chavear:
    // o alvo é outro, e a chave que existe naquele tempo é outra.
    if (change.kind === 'selection' && open === this.shownAnimation) {
      // Com o filtro ligado, trocar de osso troca as LINHAS da folha: aí ela
      // tem que ser redesenhada inteira, e não só a cor do Chavear.
      if (this.onlySelected) this.render();
      else this.syncPlayer();
      return;
    }
    if (change.kind === 'time' && open === this.shownAnimation) {
      this.syncPlayer();
      this.renderCursor();
      // O bloco da chave de evento fala do INSTANTE do cursor, então ele
      // acompanha o cursor. Sem isto, mover a agulha deixaria "Chavear evento
      // em 0,50 s" escrito enquanto o cursor já está em 0,80 s.
      this.renderEvents();
      return;
    }
    this.render();
  }

  unmount(): void {
    for (const forget of this.forgetActions) forget();
    this.forgetActions = [];
    this.host?.removeEventListener('keydown', this.onKeyDown);
    this.host?.removeEventListener('pointerdown', this.takeFocus, true);
    this.stopTransportWatch?.();
    this.stopTransportWatch = null;
    this.playerNodes.clear();
    this.timeField = null;
    this.frameLabel = null;
    this.cursorFlag = null;
    this.durationField = null;
    this.speedBar = null;
    this.speedField = null;
    this.stopOnionWatch?.();
    this.stopOnionWatch = null;
    this.stopFocus?.();
    this.stopFocus = null;
    this.closeCurveMenu();
    this.resizeWatch?.disconnect();
    this.endDrag();
    this.doc = null;
    this.host = null;
    this.header = null;
    this.summaryTrack = null;
    this.ruler = null;
    this.body = null;
    this.cursor = null;
    this.factorBox = null;
    this.rulesBox = null;
    this.pairsNode = null;
    this.resizeWatch = null;
    this.eventBox = null;
    this.stopDockWatch?.();
    this.stopDockWatch = null;
    this.stopRevealWatch?.();
    this.stopRevealWatch = null;
    this.stopPrefsWatch?.();
    this.stopPrefsWatch = null;
    this.blockBar = null;
    this.detailsNode = null;
  }

  // -------------------------------------------------------------------------
  // Toolbars
  // -------------------------------------------------------------------------

  makeButton(label: string, title: string, run: () => void, strong = false): HTMLButtonElement {
    return dopesheetPlayer.makeButton(this, label, title, run, strong);
  }

  /**
   * Um botão da linha em bloco com ÍCONE e sem palavra — lote 23.
   *
   * Pedido do Humberto, 09/09/2026: *"tem muitos nomes onde podia ser trocados
   * por ícones, só isso já ganharíamos muito espaço"*. **Medido**: os sete
   * botões desta linha ocupavam **889px** com a palavra; em ícone ocupam
   * **378**. São 511px de largura devolvidos à folha de chaves.
   *
   * A palavra fica no DOM sempre e some pelo estilo, como na barra de ações: o
   * `title` e o `aria-label` continuam com o nome inteiro, e **Editar →
   * Preferências → Mostrar nome das ferramentas** traz a palavra de volta.
   */
  makeIconButton(icon: string, label: string, title: string, run: () => void): HTMLButtonElement {
    return dopesheetPlayer.makeIconButton(this, icon, label, title, run);
  }

  /**
   * A primeira linha: o tocador inteiro, treze controles.
   *
   * **Só o símbolo aparece no botão** — decisão do Humberto, 08/09/2026. O nome
   * e a tecla ficam na dica e no `aria-label`, os dois com o mesmo texto, para
   * quem lê com o mouse e quem lê com o leitor de tela receberem o mesmo.
   *
   * O que cada controle é está em `dopesheet-model.ts`, como dado. Aqui só se
   * desenha, e o clique cai em `runAction`: é a MESMA porta do menu Animação e
   * da tecla, então os três nunca podem discordar.
   */
  private buildPlayerRow(): HTMLElement {
    return dopesheetPlayer.buildPlayerRow(this);
  }

  /**
   * O botão **Detalhes**, na ponta direita da linha 1 — lote 14, rodada 3.
   *
   * É o *"só mostra os detalhes quando você clica"* do Spriter. Fechada, a
   * faixa é o tocador, a régua e o Resumo; aberta, ela é tudo o que ela era
   * antes deste lote — as abas, os botões em bloco e uma linha por osso e por
   * desenho.
   *
   * O clique cai em `runAction`, que é a MESMA porta do item **Janela →
   * Detalhes da linha do tempo**. Duas portas para o mesmo lugar se separam com
   * o tempo; uma porta só não tem como.
   */
  buildDetailsButton(): HTMLButtonElement {
    return dopesheetPlayer.buildDetailsButton(this);
  }

  /**
   * Veste a folha de fechada ou de aberta.
   *
   * Fechada some a linha dos botões em bloco e o pé dos eventos, e a folha
   * desenha só o Resumo. Nada é destruído: o mesmo painel, a mesma seleção, os
   * mesmos nós — só o que aparece muda, e voltar é o mesmo clique.
   */
  /** Mostra ou esconde a palavra ao lado do ícone, conforme a preferência. */
  private applyToolNames(): void {
    return dopesheetPlayer.applyToolNames(this);
  }

  private applyDock(): void {
    return dopesheetPlayer.applyDock(this);
  }

  buildPlayerControl(control: PlayerControl): HTMLElement {
    return dopesheetPlayer.buildPlayerControl(this, control);
  }

  buildPlayerButton(control: PlayerControl): HTMLButtonElement {
    return dopesheetPlayer.buildPlayerButton(this, control);
  }

  /**
   * A lista dos modos de fim — item 100, e do lote 15 em diante dentro do
   * ⋯ Mais.
   *
   * Ela ocupava uma lista inteira na linha 1, e a linha 1 é onde o Spriter põe
   * a barra de velocidade e os dois campos de tempo. Escolher o modo de fim se
   * faz uma vez por sessao; a barra de velocidade se mexe o tempo todo.
   */
  buildEndModeControl(control: MoreControl): HTMLElement {
    return dopesheetPlayer.buildEndModeControl(this, control);
  }

  /**
   * A barra de velocidade, com o número ao lado — lote 15.
   *
   * Era uma lista de quatro escolhas: 1/4, metade, normal, dobro. Uma lista de
   * quatro não deixa tocar a 30% para conferir um contato, e conferir contato é
   * o uso que existe. No Spriter é uma barra com o número `100` ao lado, e é
   * isso aqui.
   *
   * A barra e o número escrevem no MESMO lugar, `transport.setSpeed`, pela
   * mesma conta de `dopesheet-model.ts`. Dois caminhos para o mesmo número se
   * separam com o tempo.
   */
  buildSpeedControl(control: PlayerControl): HTMLElement {
    return dopesheetPlayer.buildSpeedControl(this, control);
  }

  buildTimeControl(control: PlayerControl): HTMLElement {
    return dopesheetPlayer.buildTimeControl(this, control);
  }

  /**
   * A duração, clicável — item 11.
   *
   * Era um número que só dava para mudar escrevendo `duration` no arquivo à
   * mão. Um clique abre o campo; ao confirmar um valor diferente, ele
   * **pergunta se as chaves vão junto**.
   *
   * A pergunta é o item inteiro. "Esticar" é a caminhada de um segundo virando
   * a mesma caminhada em dois; "só o número" é dar mais tempo no fim sem mexer
   * em nada. Escolher por conta própria seria acertar metade das vezes.
   */
  buildDurationControl(control: PlayerControl): HTMLElement {
    return dopesheetPlayer.buildDurationControl(this, control);
  }

  /**
   * Muda a duração pelo campo: **só o número**, sem esticar as chaves.
   *
   * Digitar num campo é um gesto de ajuste, e um gesto de ajuste não pode abrir
   * uma pergunta no meio. Quem quer esticar as chaves junto usa **Animação →
   * Mudar duração…**, que continua perguntando — e que era um item cinza até
   * este lote. As duas portas chamam o mesmo `setDuration` do `anim/keying.ts`.
   */
  setDurationTo(seconds: number): void {
    return dopesheetPlayer.setDurationTo(this, seconds);
  }

  /** Pergunta a duração nova, e o que fazer com as chaves — item 11. */
  private async askDuration(): Promise<void> {
    return dopesheetPlayer.askDuration(this);
  }

  /**
   * Acerta os controles do tocador com o que está acontecendo agora.
   *
   * Chamado em toda mudança de tempo, de estrutura e de seleção, e também
   * quando o próprio tocador para sozinho no fim da animação.
   */
  syncPlayer(): void {
    return dopesheetPlayer.syncPlayer(this);
  }

  private buildKeyGroup(): HTMLElement {
    return dopesheetPlayer.buildKeyGroup(this);
  }

  /**
   * O botão **⋯ Mais**, e o que cai dele.
   *
   * Aqui moram os gestos de vez em quando: esticar um trecho, espelhar no
   * tempo, fechar o ciclo, trocar as linhas entre os ossos de nome espelhado.
   * Eram uma barra permanente — seis controles com rótulo — para coisas que se
   * usam uma vez por animação, e essa barra era altura tirada das chaves.
   *
   * As quatro ações também estão no menu Animação desde o lote menus. Este menu
   * não é um segundo lugar onde elas moram: as duas portas chamam `runAction`.
   */
  buildMoreButton(): HTMLElement {
    return dopesheetPlayer.buildMoreButton(this);
  }

  buildMoreControl(control: MoreControl): HTMLElement {
    return dopesheetPlayer.buildMoreControl(this, control);
  }

  /**
   * O cabeçalho: a régua em cima, e o **Resumo** logo abaixo dela.
   *
   * A coluna da esquerda dizia "Alvo", que é o nome da coluna e não o nome de
   * uma linha. Agora ela diz **Resumo**, que é o que a linha ao lado mostra.
   */
  private buildHeader(): HTMLElement {
    return dopesheetPlayer.buildHeader(this);
  }

  /**
   * A casca de cebola, no canto da régua — item 28.
   *
   * Ela morava dobrada no fim do painel Exibição, na coluna da direita. Ligar
   * fantasma é decisão que se toma **olhando o tempo**: "esta pose está longe
   * demais da anterior". Tomar essa decisão com os olhos aqui e a mão do outro
   * lado da tela é o tipo de ida e volta que faz um recurso deixar de ser
   * usado.
   *
   * O ícone liga e desliga. O ⋯ ao lado abre os seis números e as duas cores,
   * exatamente os mesmos campos de antes — as mesmas funções de `dom.ts`, para
   * os dois lugares nunca se comportarem diferente.
   */
  /**
   * Os três botões do canto da régua — lote 29, anotação 15, itens **a** e **b**.
   *
   * O trecho de laço só se marcava com **`Alt` + clique** na régua (esquerdo
   * para o começo, direito para o fim), e a marca só com a tecla **`M`** com o
   * foco na faixa. Nenhum dos dois tinha botão, nem menu, nem uma linha em
   * lugar nenhum da tela: quem não leu o manual não sabia que existiam, e quem
   * leu esquecia. Só o "tirar trecho" tinha porta, no ⋯ Mais — havia como
   * desfazer algo que não havia como fazer.
   *
   * Os gestos continuam todos: um botão não tira uma tecla.
   */
  buildRulerTools(): HTMLElement[] {
    return dopesheetPlayer.buildRulerTools(this);
  }

  buildOnionCorner(): HTMLElement {
    return dopesheetPlayer.buildOnionCorner(this);
  }

  /** Os oito campos da cebola, os mesmos que o painel Exibição tinha. */
  fillOnionOptions(list: HTMLElement): void {
    return dopesheetPlayer.fillOnionOptions(this, list);
  }

  /**
   * Desenha os losangos do Resumo.
   *
   * Um por tempo que tenha chave em qualquer linha. Branco quando o tempo junta
   * mais de um tipo de alvo — um osso e um evento, por exemplo —, porque quem
   * arrasta precisa saber que está levando o evento junto com a pose.
   */
  private renderSummary(): void {
    return dopesheetPlayer.renderSummary(this);
  }

  /**
   * As alças nas pontas da seleção de chaves — item 27.
   *
   * Esticar já existia, pelo campo "Fator" do ⋯ Mais: digitar `1.5` e apertar.
   * Isto é o mesmo gesto com a mão: pega a ponta e puxa, com a OUTRA ponta
   * parada. É como se ajusta ritmo de olho — "este trecho tem que ser um pouco
   * mais rápido" não é um número que alguém sabe de antemão.
   *
   * As alças ficam na linha do Resumo, que atravessa a folha inteira e está
   * sempre à vista. Com menos de duas chaves escolhidas não há o que esticar, e
   * elas não aparecem: uma alça que não faz nada é pior que alça nenhuma.
   */
  renderEdgeHandles(track: HTMLElement, span: number): void {
    return dopesheetPlayer.renderEdgeHandles(this, track, span);
  }

  /**
   * O arrasto de uma alça de borda — item 27.
   *
   * O fator é a razão entre a distância nova e a antiga até o pivô, que é a
   * outra ponta. Um fator negativo espelharia a seleção sem aviso — puxar a
   * ponta esquerda para além da direita —, então ele é preso num mínimo:
   * espelhar é o `-1` do campo Fator, e é um gesto que se pede, não um que
   * acontece por acidente.
   *
   * Passa pelo MESMO `scaleKeys` do campo Fator, com a mesma junção de passos,
   * então o arrasto inteiro é um passo de desfazer só.
   */
  onEdgeDown(event: PointerEvent, pivot: number, edge: number): void {
    return dopesheetPlayer.onEdgeDown(this, event, pivot, edge);
  }

  buildSummaryMark(time: number, count: number, mixed: boolean, span: number): HTMLElement {
    return dopesheetPlayer.buildSummaryMark(this, time, count, mixed, span);
  }

  /**
   * Clicar e arrastar um losango do Resumo.
   *
   * Ele escolhe TODAS as chaves daquele tempo e cai no mesmo arrasto de chave
   * que já existe — o mesmo `EditKeys` com `moveKeys`, o mesmo `mergeWith`
   * durante o arrasto, o mesmo passo único de desfazer. Não há um segundo
   * caminho para mover chave.
   */
  onSummaryDown(event: PointerEvent, time: number): void {
    return dopesheetPlayer.onSummaryDown(this, event, time);
  }

  private buildBody(): HTMLElement {
    return dopesheetPlayer.buildBody(this);
  }

  // -------------------------------------------------------------------------
  // Drawing
  // -------------------------------------------------------------------------

  render(): void {
    const doc = this.doc;
    const body = this.body;
    if (doc === null || body === null) return;
    // K3: a linha de base das chaves, para a primeira chave depois de abrir o
    // arquivo (ou de trocar de animação) também ganhar a frase.
    if (doc.animation !== null && this.knownKeys?.animation !== doc.animation) {
      this.knownKeys = { animation: doc.animation, ids: new Set(allKeyRefs(doc.file, doc.animation).map(keyRefKey)) };
    }
    clear(body);
    if (this.header !== null) body.append(this.header);
    if (doc.animation !== this.shownAnimation) {
      // Another animation: the keys that were selected are not in it.
      this.selected.clear();
      this.shownAnimation = doc.animation;
    }

    if (doc.animation === null) {
      // O tocador nunca apaga — degrau 4a, M5. A base tem um quadro só: a
      // folha mostra um losango em 0, e a frase diz o que mexer faz.
      const linha = el('div', 'dope-base');
      linha.append(
        el('span', 'dope-base-nome', 'Base'),
        el('span', 'dope-base-losango', '◆'),
        el('span', 'dope-base-nota', BASE_SHEET_NOTE),
      );
      linha.title = BASE_SHEET_NOTE;
      body.append(linha);
      this.renderRuler();
      this.renderSummary();
      // Os botões de tocar ficam cinza com a dica: não há tempo a andar.
      this.syncPlayer();
      this.renderClock();
      this.renderPairs();
      this.renderEvents();
      return;
    }

    this.refsByTarget = new Map();
    for (const ref of allKeyRefs(doc.file, doc.animation)) {
      const id = targetKey(ref.target);
      const list = this.refsByTarget.get(id);
      if (list === undefined) this.refsByTarget.set(id, [ref]);
      else list.push(ref);
    }

    const groups = dopesheetGroups(
      doc.file,
      doc.animation,
      this.onlySelected
        ? { bones: doc.selection.bones, slots: this.selectedSlotNames() }
        : null,
    );
    if (groups.length === 0 && dockState().open) {
      body.append(el('p', 'dope-vazio',
        'Esta animação ainda não tem chave. Mexa num osso, ou use o botão Chavear.'));
    }
    // Fechada, a folha desenha só o Resumo, que mora no cabeçalho: nem grupo,
    // nem linha por osso, nem linha por desenho — lote 14, rodada 3.
    for (const group of visibleGroups(dockState().open, groups)) {
      body.append(...this.buildGroup(group));
    }
    // As faixas das entidades vêm por último — degrau 6, tarefa 6.4. Uma
    // entidade tem linha mesmo SEM chave nenhuma: ela existe porque o slot
    // mostra um esqueleto, e não porque alguém a animou. Por isso ela não sai
    // de `dopesheetGroups`, que só conhece timelines.
    if (dockState().open) body.append(...this.buildEntityBands());
    // Rodada 8c, C11: fechada, a faixa da entidade aparece também — UMA linha,
    // a da entidade escolhida, ou a da primeira. Ela se puxa, se arrasta e
    // tem o botão direito, como aberta.
    else body.append(...this.buildClosedEntityBand());
    // Rodada 39, lote 3: a montagem de teste na cena não tem faixa.
    const teste = testMontagemLine(this.doc);
    if (teste !== null) body.append(teste);

    if (this.cursor !== null) body.append(this.cursor);
    this.dropMissingSelection(groups);
    this.renderRuler();
    this.renderCursor();
    this.syncPlayer();
    this.renderSummary();
    this.renderClock();
    this.renderPairs();
    this.renderEvents();
  }

  /** Redesenha o bloco "Chave de evento" no pé do painel. */
  private renderEvents(): void {
    const doc = this.doc;
    const box = this.eventBox;
    if (doc === null || box === null) return;
    renderEventKeyEditor(doc, box, () => {}, { collapsible: true });
  }

  private buildGroup(group: RowGroup): HTMLElement[] {
    const nodes: HTMLElement[] = [el('div', 'dope-grupo', group.label)];
    for (const row of group.rows) nodes.push(this.buildRow(row));
    return nodes;
  }

  private buildRow(row: TimelineRow): HTMLElement {
    const doc = this.doc;
    const span = doc === null ? 1 : spanOf(doc);
    const id = targetKey(row.target);
    const line = el('div', 'dope-linha');
    if (this.pickedRows.has(id)) line.classList.add('dope-linha-escolhida');

    const name = el('div', 'dope-nome', row.label);
    name.title = row.label;
    name.addEventListener('click', (event) => this.pickRow(row.target, event.shiftKey));
    // Botão direito no nome da linha **Desenho**: a chave de sequência — G12,
    // degrau 6, tarefa 6.6. A sequência existia no formato, no runtime e como
    // alvo em `keying.ts` desde sempre; o que faltava era a porta.
    if (row.target.type === 'slot' && row.target.property === 'attachment') {
      name.title = `${row.label}. Botão direito: chave de sequência de imagens`;
      name.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.askSequenceKey(row.target.target ?? '');
      });
    }
    line.append(name);

    const track = el('div', 'dope-faixa');
    track.dataset['alvo'] = id;
    track.addEventListener('pointerdown', (event) => this.onTrackDown(event));
    // As células em degrau vêm ANTES dos losangos, por baixo deles: o losango
    // continua sendo o que se clica e se arrasta, e a célula é o que se lê.
    for (const cell of this.cellsOf(row)) track.append(this.buildStepCell(cell, span));
    // Pelo mapa, e não por `row.times`: assim a chave de evento leva o nome
    // dela, que é o que a separa de outra no mesmo instante.
    const refs = this.refsByTarget.get(id)
      ?? row.times.map((time) => ({ target: row.target, time }));
    for (const segment of this.curveSegments(refs, span)) track.append(segment);
    for (const ref of refs) track.append(this.buildKey(ref, span));
    line.append(track);
    return line;
  }

  /**
   * As células em degrau desta linha, ou lista vazia — degrau 6.
   *
   * Só as linhas que carregam um NOME (`hasSteppedCells`): a virada de corpo,
   * o osso do desenho e a animação da entidade. Num losango sozinho elas
   * dizem quando algo mudou e calam para o quê.
   */
  private cellsOf(row: TimelineRow): StepCell[] {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return [];
    if (!hasSteppedCells(row.target)) return [];
    return steppedCells(doc.file, doc.animation, row.target);
  }

  /**
   * **Sequência…** — a chave de sequência de imagens, G12, tarefa 6.6.
   *
   * Palavra do Humberto: *"a boca: uma chave para cada vez que a imagem muda
   * — **como opção**"*. "Como opção" é isto: a sequência já existia no formato
   * (7.10) e no runtime, e `sequence` já era alvo em `keying.ts`. O que não
   * existia era porta — quem quisesse fazer a boca falar tinha de escrever a
   * timeline à mão no `.bone`.
   *
   * **Não grava no escuro.** Um desenho comum não tem `sequence`, e uma chave
   * `sequence` nele seria recusada ao ler (L1 de 9.6). Nesse caso a janela não
   * abre: o rodapé diz por quê, com o nome do desenho (regra 21).
   */
  private async askSequenceKey(slot: string): Promise<void> {
    const doc = this.doc;
    if (doc === null || doc.animation === null || slot === '') return;
    const attachment = activeAttachmentOf(doc.file, doc.animation, doc.time, slot);
    const found = attachment === null ? null : findSequence(doc.file, slot, attachment);
    if (attachment === null || found === null) {
      doc.notice(noSequenceNotice(attachment));
      return;
    }

    const resposta = await askForm({
      title: 'Chave de sequência',
      lead: `O desenho "${attachment}" tem ${found.count} imagens. A chave vale de `
        + `${formatSeconds(doc.time)} em diante, até a próxima.`,
      fields: [
        {
          id: 'modo',
          label: 'Como andar',
          value: DEFAULT_SEQUENCE_MODE,
          choices: SEQUENCE_MODES.map((mode) => ({ value: mode.id, label: `${mode.label} — ${mode.hint}` })),
        },
        {
          id: 'imagem',
          label: `Começar na imagem (1 a ${found.count})`,
          value: String(found.setup + 1),
          hint: 'Qual das imagens da sequência aparece no instante da chave',
        },
        {
          id: 'espera',
          label: 'Segundos por imagem',
          value: '0',
          hint: 'Quanto cada imagem fica na tela. 0 segura a imagem escolhida, parada',
        },
      ],
      yesLabel: 'Gravar a chave',
    });
    if (resposta === null) return;

    const modo = resposta['modo'] ?? DEFAULT_SEQUENCE_MODE;
    const imagem = Number((resposta['imagem'] ?? '1').replace(',', '.')) - 1;
    const espera = Number((resposta['espera'] ?? '0').replace(',', '.'));
    const value = sequenceKeyValue(modo, imagem, espera, found.count);
    const time = doc.time;
    doc.run(new EditKeys(doc.animation, 'Chave de sequência', (file, name) => {
      setKey(file, name, time, sequenceTarget(slot, attachment, found.skin), value as never);
    }));
    doc.notice(describeSequenceKey(attachment, value, found.count, time));
    revealKey({ target: sequenceTarget(slot, attachment, found.skin), time: roundTime(time) });
  }

  // -------------------------------------------------------------------------
  // A faixa da entidade — degrau 6, tarefa 6.4 (E13, E14, E12b)
  // -------------------------------------------------------------------------

  /**
   * Uma linha por slot que mostra um esqueleto inteiro (7.11).
   *
   * A entidade não é uma fileira de losangos: é uma **faixa** que começa onde
   * ela foi solta, acaba onde ela sai de cena, e traz escrito o nome da
   * animação que ela toca. É como se lê *"a mochila começa a acender aos 0,5 s
   * e apaga aos 1,2"* sem abrir mais nada.
   *
   * A linha aparece mesmo com a faixa vazia — uma entidade que a animação
   * nunca mostra. Uma linha vazia diz "esta entidade existe e não entra aqui";
   * linha nenhuma deixaria a pessoa procurando onde ela foi parar.
   */
  private buildEntityBands(): HTMLElement[] {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return [];
    const entidades = entitySlots(doc.file);
    if (entidades.length === 0) return [];
    const span = spanOf(doc);
    const nodes: HTMLElement[] = [el('div', 'dope-grupo', 'Entidades')];
    for (const entity of entidades) {
      nodes.push(this.buildEntityRow(entity, span));
    }
    return nodes;
  }

  /** A linha da entidade com os Detalhes fechados — rodada 8c, C11. */
  private buildClosedEntityBand(): HTMLElement[] {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return [];
    const entidades = entitySlots(doc.file);
    if (entidades.length === 0) return [];
    const escolhidos = new Set([...doc.selection.slots, ...doc.selection.attachments.map((a) => a.slot)]);
    const entity = entidades.find((e) => escolhidos.has(e.slot)) ?? entidades[0]!;
    const linha = this.buildEntityRow(entity, spanOf(doc));
    linha.classList.add('dope-linha-entidade-fechada');
    if (entidades.length > 1) {
      const nome = linha.querySelector<HTMLElement>('.dope-nome');
      if (nome !== null) {
        nome.title = `${nome.title}. Há ${entidades.length} entidades nesta animação: `
          + 'escolha uma na cena para ver a faixa dela aqui, ou abra os Detalhes para ver todas';
      }
    }
    return [linha];
  }

  private buildEntityRow(entity: EntitySlot, span: number): HTMLElement {
    const doc = this.doc;
    const line = el('div', 'dope-linha dope-linha-entidade');

    const name = el('div', 'dope-nome', entity.slot);
    const dica = `A entidade ${entityShortName(entity.uri)} no slot ${entity.slot}. `
      + 'Botão direito na faixa: escolher a animação dela';
    name.title = dica;
    line.append(name);

    const track = el('div', 'dope-faixa');
    track.dataset['entidade'] = entity.slot;
    const segmentos = doc === null || doc.animation === null
      ? [] : entityBand(doc.file, doc.animation, entity);
    if (segmentos.length === 0) {
      const vazio = el('div', 'dope-faixa-vazia', 'não entra nesta animação');
      vazio.title = `${entityShortName(entity.uri)} existe no slot ${entity.slot}, mas esta `
        + 'animação nunca a mostra. Ponha uma chave de Desenho para ela entrar';
      track.append(vazio);
    }
    for (const segmento of segmentos) {
      track.append(this.buildBandSegment(entity, segmento, span));
    }
    // O botão direito vale na faixa inteira, e não só num pedaço: com a faixa
    // vazia ainda se quer escolher a animação antes de pôr a entidade em cena.
    track.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      this.openBandMenu(entity, event.clientX, event.clientY);
    });
    line.append(track);
    return line;
  }

  private buildBandSegment(entity: EntitySlot, segment: BandSegment, span: number): HTMLElement {
    const node = el('div', 'dope-entidade', segment.text);
    node.style.left = `${percentOf(segment.from, span)}%`;
    node.style.width = `${Math.max(0, percentOf(segment.to, span) - percentOf(segment.from, span))}%`;
    node.title = `${segment.title}. Arraste a faixa: muda quando ela começa`;
    node.setAttribute('aria-label', `${entity.slot}. ${segment.title}`);
    if (segment.source === 'pai') node.classList.add('dope-entidade-pai');
    if (segment.animation === null && segment.source !== 'pai') {
      node.classList.add('dope-entidade-muda');
    }
    // Rodada 8c, C14: a faixa inteira se arrasta.
    node.addEventListener('pointerdown', (event) => this.startBandDrag(event, node, entity, segment, span, 'mover'));
    // Rodada 8c, C13: a ponta — o fim de UMA volta da animação do filho. Em
    // laço, as voltas seguintes ficam marcadas por um traço fino.
    const volta = cycleLength(this.childDuration(entity, segment.animation), segment.timeScale);
    const largura = segment.to - segment.from;
    // C15, sem laço: depois de UMA volta a entidade fica parada no último
    // quadro. A faixa tem tamanho; o resto vai apagado, com a frase.
    if (volta !== null && largura > 0 && !entity.loop && volta < largura - 1e-6) {
      const parada = el('div', 'dope-entidade-parada');
      parada.style.left = `${(volta / largura) * 100}%`;
      parada.title = `Sem laço: depois de uma volta, ${entityShortName(entity.uri)} fica parada no último quadro`;
      node.append(parada);
    }
    // C15, a emenda: o aviso mora na faixa também, e não só na barra.
    const doc = this.doc;
    const emenda = doc === null || doc.animation === null ? null
      : seamWarning(doc.file, doc.animation, entity, (nome) => this.childDuration(entity, nome));
    if (emenda !== null && Math.abs(segment.to - spanEnd(doc)) < 1e-6) {
      node.classList.add('dope-entidade-emenda');
      node.title = `${node.title}. ${emenda}`;
    }
    if (volta !== null && largura > 0) {
      for (let k = 1; k < 64 && entity.loop && segment.from + k * volta < segment.to - 1e-6; k++) {
        const traco = el('div', 'dope-entidade-volta');
        traco.style.left = `${((k * volta) / largura) * 100}%`;
        node.append(traco);
      }
      const ponta = el('div', 'dope-entidade-ponta');
      ponta.style.left = `${(Math.min(volta, largura) / largura) * 100}%`;
      // A volta passa do fim da faixa: a alça fica do lado de DENTRO da borda,
      // com a seta dizendo que a volta continua depois — senão metade dela
      // seria cortada, e o clique pegaria a faixa em vez da ponta.
      if (volta >= largura - 1e-6) ponta.classList.add('dope-entidade-ponta-alem');
      ponta.title = `Ponta de ${entityShortName(entity.uri)}: uma volta de ${segment.animation ?? ''} `
        + `dura ${formatSeconds(volta)}. Puxe para fora: mais devagar; para dentro: mais rápido`;
      ponta.setAttribute('aria-label', ponta.title);
      ponta.addEventListener('pointerdown', (event) => this.startBandDrag(event, node, entity, segment, span, 'ponta'));
      node.append(ponta);
    }
    return node;
  }

  /** A duração de uma animação do filho, lida do arquivo dele, ou `null`. */
  private childDuration(entity: EntitySlot, animation: string | null): number | null {
    const doc = this.doc;
    if (doc === null || animation === null) return null;
    return skeletonsDe(doc).get(entity.uri)?.findAnimation(animation)?.duration ?? null;
  }

  /**
   * **Puxar a ponta e arrastar a faixa** — rodada 8c, C13 e C14.
   *
   * Durante o arrasto só o desenho anda; ao soltar, UM comando grava tudo: um
   * passo de Ctrl+Z por gesto. O botão direito continua sendo o menu.
   */
  private startBandDrag(
    event: PointerEvent, node: HTMLElement, entity: EntitySlot, segment: BandSegment, span: number,
    modo: 'mover' | 'ponta',
  ): void {
    const doc = this.doc;
    const track = node.parentElement;
    if (event.button !== 0 || doc === null || doc.animation === null || track === null) return;
    event.preventDefault();
    event.stopPropagation();
    const animacao = doc.animation;
    const caixa = track.getBoundingClientRect();
    const porPixel = caixa.width > 0 ? span / caixa.width : 0;
    const x0 = event.clientX;
    const alvo = event.currentTarget as HTMLElement;
    alvo.setPointerCapture?.(event.pointerId);
    const ponta = node.querySelector<HTMLElement>('.dope-entidade-ponta');
    const pontaAntes = ponta?.style.left ?? '';
    const duracao = this.childDuration(entity, segment.animation);
    const volta = cycleLength(duracao, segment.timeScale);
    const nome = entityShortName(entity.uri);
    const fps = fpsOf(doc);

    const mover = (e: PointerEvent): void => {
      const dx = e.clientX - x0;
      if (modo === 'mover') {
        node.style.transform = `translateX(${dx}px)`;
      } else if (ponta !== null && volta !== null) {
        const largura = segment.to - segment.from;
        const fim = Math.max(1 / fps, volta + dx * porPixel);
        ponta.style.left = `${(Math.min(fim, largura) / largura) * 100}%`;
      }
    };
    const soltar = (e: PointerEvent): void => {
      alvo.removeEventListener('pointermove', mover);
      alvo.removeEventListener('pointerup', soltar);
      alvo.removeEventListener('pointercancel', soltar);
      node.style.transform = '';
      if (ponta !== null) ponta.style.left = pontaAntes;
      // O começo novo cai num quadro, mesmo quando o de antes não caía.
      const dt = roundTime(snapToFrame(segment.from + (e.clientX - x0) * porPixel, fps) - segment.from);
      if (Math.abs(e.clientX - x0) < 3 || dt === 0 || e.type === 'pointercancel') return;
      if (modo === 'ponta') {
        if (volta === null) return;
        // C15: perto de fechar um número inteiro de voltas no fim, gruda.
        const fimDaAnimacao = spanEnd(doc);
        const tip = snapTipToEnd(segment.from, snapToFrame(segment.from + volta + (e.clientX - x0) * porPixel, fps),
          fimDaAnimacao, 1 / fps);
        const ts = timeScaleForTip(segment.from, tip, duracao);
        if (ts === null) return;
        doc.run(new EditKeys(animacao, 'Esticar a faixa da entidade', (file, name) => {
          writeBandTimeScale(file, name, entity, segment.from, ts);
        }));
        const nova = cycleLength(duracao, ts) ?? 0;
        doc.notice(`${nome} toca ${segment.animation ?? ''} a ${String(ts).replace('.', ',')}× a velocidade: `
          + `uma volta dura ${formatSeconds(nova)}`);
        return;
      }
      const run = activeRuns(doc.file, animacao, entity.slot, entity.attachment)
        .find((r) => r.from <= segment.from + 1e-6 && segment.from < r.to + 1e-6);
      if (run === undefined) return;
      // Ensaio numa cópia: no limite não há passo de desfazer vazio.
      const andou = moveBandRun(JSON.parse(JSON.stringify(doc.file)), animacao, entity, run, dt, 1 / fps);
      if (andou === 0) {
        doc.notice(bandLimitNotice(nome, dt));
        return;
      }
      doc.run(new EditKeys(animacao, 'Arrastar a faixa da entidade', (file, name) => {
        moveBandRun(file, name, entity, run, dt, 1 / fps);
      }));
      doc.notice(`${nome} entra em ${formatSeconds(roundTime(run.from + andou))}`);
    };
    alvo.addEventListener('pointermove', mover);
    alvo.addEventListener('pointerup', soltar);
    alvo.addEventListener('pointercancel', soltar);
  }

  /**
   * O menu do botão direito na faixa — **E12b**, *"o botão direito escolhe a
   * animação da entidade"*.
   *
   * A lista sai do ARQUIVO DO FILHO, que o `io/` leu ao abrir a pasta. Quando
   * o editor não o abriu, o menu diz isso numa linha em vez de aparecer vazio:
   * um menu mudo faria pensar que a entidade não tem animação nenhuma, quando
   * o que houve foi o editor não achar o arquivo (regra 21).
   */
  private openBandMenu(entity: EntitySlot, x: number, y: number): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return;
    this.closeCurveMenu();

    const child = skeletonsDe(doc).get(entity.uri) ?? null;
    const nomes = child === null ? [] : child.animations.map((a) => a.name);
    const agora = entityBand(doc.file, doc.animation, entity)
      .find((s) => doc.time >= s.from && doc.time <= s.to)?.animation ?? entity.animation;

    const menu = el('div', 'dope-curva-menu');
    menu.setAttribute('role', 'menu');
    menu.style.left = `${Math.round(x)}px`;
    menu.style.top = `${Math.round(y)}px`;
    menu.append(el('div', 'dope-curva-titulo', `Animação de ${entityShortName(entity.uri)}`));

    if (child === null) {
      const recado = el('div', 'dope-curva-recado', missingChildNotice(entity.uri));
      recado.title = missingChildNotice(entity.uri);
      menu.append(recado);
    }

    // C15: o laço da entidade, no mesmo menu.
    const laco = el('button', 'dope-curva-item');
    (laco as HTMLButtonElement).type = 'button';
    laco.setAttribute('role', 'menuitemcheckbox');
    laco.setAttribute('aria-checked', String(entity.loop));
    laco.title = 'Em laço: roda sozinha, sem fim. Sem laço: toca uma volta e para no último quadro';
    laco.append(el('span', 'dope-curva-marca', entity.loop ? '✓' : ''), el('span', 'dope-curva-nome', 'Em laço'));
    laco.addEventListener('click', () => {
      this.closeCurveMenu();
      toggleEntityLoop(doc, entity);
    });
    menu.append(laco);

    for (const item of bandMenu(nomes, agora)) {
      const node = el('button', 'dope-curva-item');
      (node as HTMLButtonElement).type = 'button';
      node.setAttribute('role', 'menuitemradio');
      node.setAttribute('aria-checked', String(item.current));
      node.title = item.hint;
      node.append(
        el('span', 'dope-curva-marca', item.current ? '✓' : ''),
        el('span', 'dope-curva-nome', item.label),
      );
      node.addEventListener('click', () => {
        this.closeCurveMenu();
        this.setEntityAnimation(entity, item.animation);
      });
      menu.append(node);
    }

    const fora = (event: PointerEvent): void => {
      if (menu.contains(event.target as Node)) return;
      this.closeCurveMenu();
    };
    document.addEventListener('pointerdown', fora, true);
    this.closeCurveMenu = (): void => {
      document.removeEventListener('pointerdown', fora, true);
      menu.remove();
      this.closeCurveMenu = (): void => {};
    };
    document.body.append(menu);
  }

  /** Grava a chave `nested/animation` no tempo de agora — E12b, spec 9.9. */
  private setEntityAnimation(entity: EntitySlot, animation: string | null): void {
    const doc = this.doc;
    if (doc === null) return;
    // Rodada 6: a conta mora em `dopesheet-actions.ts`, e o menu Entidades
    // chama a mesma.
    setEntityAnimationAt(doc, entity, animation);
  }

  /** Uma célula: a faixa com o nome escrito, da chave até a chave seguinte. */
  private buildStepCell(cell: StepCell, span: number): HTMLElement {
    const node = el('div', 'dope-degrau', cell.text);
    node.style.left = `${percentOf(cell.from, span)}%`;
    node.style.width = `${Math.max(0, percentOf(cell.to, span) - percentOf(cell.from, span))}%`;
    node.title = cell.title;
    node.setAttribute('aria-label', cell.title);
    return node;
  }

  /**
   * **A curva entre as chaves, na própria folha** — rodada 40, lote 1.
   *
   * Todo losango era igual: depois de "Suave" numa chave e "Parada" noutra, a
   * folha não mudava de cara, e só a aba Curvas mostrava a diferença (doc 39,
   * `14z`). O Spine desenha o trecho de uma chave até a próxima: reta para a
   * linear, curva para a Bézier, **pontilhado para a parada**. Aqui é o mesmo,
   * por baixo dos losangos e sem pegar o clique. Só nas linhas que interpolam:
   * numa linha de nome (desenho, evento) toda chave já é parada, e o traço não
   * diria nada.
   */
  private curveSegments(refs: readonly KeyRef[], span: number): HTMLElement[] {
    const doc = this.doc;
    if (doc === null || doc.animation === null || refs.length < 2) return [];
    const first = refs[0]!;
    if (first.event !== undefined || !targetInfo(first.target, doc.file).interpolable) return [];
    const sorted = [...refs].sort((a, b) => a.time - b.time);
    const out: HTMLElement[] = [];
    for (let i = 0; i < sorted.length - 1; i++) {
      const from = sorted[i]!;
      const to = sorted[i + 1]!;
      const kind = curveKindOf(doc.file, doc.animation, from);
      const family = kind === 'linear' || kind === 'parada' ? kind : 'arco';
      const node = el('div', `dope-trecho-curva dope-trecho-${family}`);
      node.style.left = `${percentOf(from.time, span)}%`;
      node.style.width = `${Math.max(0, percentOf(to.time, span) - percentOf(from.time, span))}%`;
      node.dataset['curva'] = kind;
      node.setAttribute('aria-hidden', 'true');
      // Rodada 40, lote 3 (doc 44, a): a curva DE VERDADE, pelas alças do
      // arquivo — a Entrada e a Saída não são mais o mesmo arco da Suave.
      const caminho = segmentPath(doc.file, doc.animation, from);
      if (caminho !== null) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('viewBox', '0 0 100 100');
        svg.setAttribute('preserveAspectRatio', 'none');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', caminho);
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        svg.append(path);
        node.append(svg);
      }
      out.push(node);
    }
    return out;
  }

  private buildKey(ref: KeyRef, span: number): HTMLElement {
    const node = el('button', 'dope-chave');
    node.type = 'button';
    node.style.left = `${percentOf(ref.time, span)}%`;
    const texto = ref.event === undefined
      ? `Chave em ${formatSeconds(ref.time)}`
      : `Evento ${ref.event} em ${formatSeconds(ref.time)}`;
    node.dataset['tempo'] = String(ref.time);
    node.dataset['alvo'] = targetKey(ref.target);
    if (ref.event !== undefined) node.dataset['evento'] = ref.event;
    if (this.selected.has(keyRefKey(ref))) node.classList.add('dope-chave-escolhida');
    // A dica diz os gestos — anotação 15, item g. Eles não tinham pista
    // nenhuma: nem no losango, nem em menu, nem no rodapé. Desde o degrau 6
    // ela diz também O QUE O ARRASTO LEVA: com várias chaves escolhidas, o
    // arrasto move todas, e antes disso nada na tela dizia isso (regra 21).
    // Rodada 40, lote 1: a primeira linha diz O QUE a chave é — tempo, valor
    // com unidade e curva (doc 39, §2.3) —, a segunda, os gestos.
    const doc = this.doc;
    const oQue = doc !== null && doc.animation !== null ? keyTitle(doc.file, doc.animation, ref) : texto;
    node.title = `${oQue}\n${KEY_HINT}`;
    node.setAttribute('aria-label', `${oQue}. ${KEY_HINT}`);
    node.addEventListener('pointerdown', (event) => this.onKeyDownPointer(event, ref));
    // Botão direito no losango: a interpolação — item 26. Era um passeio pelo
    // painel Curvas para dizer "esta chave é parada", que é a coisa mais comum
    // de se dizer sobre uma chave.
    node.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (!this.selected.has(keyRefKey(ref))) this.selectKeys([ref], 'trocar');
      this.openCurveMenu(ref, event.clientX, event.clientY);
    });
    // Duplo clique apaga a chave — item 90. Desde a rodada 40 (lote 3) ele é
    // contado no `pointerdown` (`isDoubleClick`, em `dopesheet-pointer.ts`):
    // o `dblclick` do navegador nunca chegava, porque o primeiro toque
    // redesenha a folha e o losango debaixo do mouse vira outro.
    return node;
  }

  /**
   * O menu da interpolação, no losango — item 26.
   *
   * Linear · Suave · Parada · Curva…, com a marca no que a chave tem hoje. As
   * três primeiras escrevem `key.curve` na hora; a quarta abre o painel Curvas,
   * que é onde uma Bézier se desenha de verdade.
   *
   * Vale para TODAS as chaves escolhidas, e não só para a que recebeu o clique:
   * "estas seis são paradas" é um gesto só.
   */
  /** O menu do losango, aberto de fora — o Resumo (G1) usa o mesmo das linhas. */
  openKeyMenu(ref: KeyRef, x: number, y: number): void {
    this.openCurveMenu(ref, x, y);
  }

  private openCurveMenu(ref: KeyRef, x: number, y: number): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return;
    this.closeCurveMenu();

    const menu = el('div', 'dope-curva-menu');
    menu.setAttribute('role', 'menu');
    // Rodada 40, lote 1: abre para o lado que tem espaço. Com os cinco nomes o
    // menu ficou mais alto, e num losango do pé da tela a "Parada" saía da
    // janela (y = 1147 em 1080). A mesma conta das opções da cebola.
    const lugar = popupPlacement({ left: x, top: y, bottom: y }, window.innerWidth, window.innerHeight, 220);
    menu.style.left = `${Math.round(lugar.left)}px`;
    if (lugar.top !== undefined) menu.style.top = `${Math.round(lugar.top)}px`;
    if (lugar.bottom !== undefined) menu.style.bottom = `${Math.round(lugar.bottom)}px`;
    menu.style.maxHeight = `${Math.round(lugar.maxHeight)}px`;
    menu.style.overflowY = 'auto';
    const agora = curveKindOf(doc.file, doc.animation, ref);
    // G1 e P9 (chat D, 2a): o que o menu oferece depende do que está escolhido.
    const escolhidas = this.selectedRefs.length > 0 ? this.selectedRefs : [ref];
    const plano = keyMenuPlan(escolhidas.map((item) => item.target));

    for (const kind of plano.curves ? CURVE_KINDS : []) {
      const item = el('button', 'dope-curva-item');
      (item as HTMLButtonElement).type = 'button';
      item.setAttribute('role', 'menuitemradio');
      item.setAttribute('aria-checked', String(agora === kind.id));
      item.title = kind.hint;
      item.append(
        el('span', 'dope-curva-marca', agora === kind.id ? '✓' : ''),
        el('span', 'dope-curva-nome', kind.label),
      );
      item.addEventListener('click', () => {
        this.closeCurveMenu();
        this.applyCurve(kind.id);
      });
      menu.append(item);
    }

    const curvas = el('button', 'dope-curva-item');
    (curvas as HTMLButtonElement).type = 'button';
    curvas.setAttribute('role', 'menuitem');
    curvas.title = 'Desenhar a curva à mão, no painel Curvas';
    curvas.append(el('span', 'dope-curva-marca', ''), el('span', 'dope-curva-nome', 'Curva à mão…'));
    curvas.addEventListener('click', () => {
      this.closeCurveMenu();
      // Traz à frente e nunca fecha — defeito 2, como em `interp-curva`.
      runAction('mostrar-painel-curvas');
    });
    if (plano.curves) menu.append(curvas);

    // O apagar à vista — G1, P9. Antes ele era segredo do Delete e do duplo clique.
    if (plano.curves) menu.append(el('div', 'dope-curva-separador'));
    const tirar = el('button', 'dope-curva-item');
    (tirar as HTMLButtonElement).type = 'button';
    tirar.setAttribute('role', 'menuitem');
    tirar.title = plano.remove.hint;
    tirar.append(el('span', 'dope-curva-marca', ''), el('span', 'dope-curva-nome', plano.remove.label));
    tirar.addEventListener('click', () => {
      this.closeCurveMenu();
      this.deleteSelected();
    });
    menu.append(tirar);

    // Um clique fora fecha. `capture` para o menu sumir antes de o clique virar
    // seleção de outra chave.
    const fora = (event: PointerEvent): void => {
      if (menu.contains(event.target as Node)) return;
      this.closeCurveMenu();
    };
    document.addEventListener('pointerdown', fora, true);
    this.closeCurveMenu = (): void => {
      document.removeEventListener('pointerdown', fora, true);
      menu.remove();
      this.closeCurveMenu = (): void => {};
    };
    document.body.append(menu);
  }

  /** Escreve a curva nas chaves escolhidas — item 26. */
  private applyCurve(kind: CurveKind): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return;
    const refs = [...this.selected.values()];
    if (refs.length === 0) return;
    const name = doc.animation;
    let written = 0;
    doc.run(new EditKeys(name, 'Mudar a curva', (file, animationName) => {
      written = setKeyCurve(file, animationName, refs, kind);
    }));
    const rotulo = CURVE_KINDS.find((item) => item.id === kind)?.label ?? kind;
    doc.notice(curveAppliedNotice(written, refs.length, rotulo));
  }

  /** Apaga uma chave só, pelo duplo clique nela — item 90. */
  deleteOneKey(ref: KeyRef): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return;
    const animation = doc.animation;
    const aviso = dopesheetEdit.bodyRemovalNotice(doc.file, animation, [ref]);
    doc.run(new EditKeys(animation, 'Apagar chave', (file, name) => {
      removeKeyRef(file, name, ref);
    }));
    if (aviso !== null) doc.notice(aviso);
    this.selected.delete(keyRefKey(ref));
    doc.notice(`Chave de ${formatSeconds(ref.time)} apagada`);
  }

  private renderRuler(): void {
    const doc = this.doc;
    const ruler = this.ruler;
    if (doc === null || ruler === null) return;
    clear(ruler);
    const span = spanOf(doc);
    const fps = fpsOf(doc);
    const width = ruler.clientWidth;
    const step = frameStepFor(fps, span, width);
    const lastFrame = Math.floor(span * fps + 1e-6);

    // A faixa do trecho de laço, por baixo das marcas da régua — item 81.
    const state = this.timeline();
    if (state.loop !== undefined && span > 0) {
      const band = el('div', 'dope-trecho');
      band.style.left = `${percentOf(state.loop.from, span)}%`;
      band.style.width = `${Math.max(0, percentOf(state.loop.to, span) - percentOf(state.loop.from, span))}%`;
      band.title = `Trecho de ${formatSeconds(state.loop.from)} a ${formatSeconds(state.loop.to)}`;
      ruler.append(band);
    }

    for (let frame = 0; frame <= lastFrame; frame += step) {
      const time = frame / fps;
      const tick = el('div', 'dope-marca');
      tick.style.left = `${percentOf(time, span)}%`;
      // Só o segundo, numa linha. O QUADRO saiu da régua a pedido do Humberto,
      // 09/09/2026: ele já está escrito no tocador, ao lado do tempo, e a
      // segunda linha custava 18px de altura em toda a janela — 18px que a
      // faixa fechada gastava para repetir o que estava logo acima. Continua na
      // dica de cada marca, para quem precisar do número exato.
      const text = el('span', 'dope-marca-texto', formatSeconds(time));
      tick.title = `${formatSeconds(time)} — quadro ${frame}`;
      tick.append(text);
      ruler.append(tick);
    }

    // Os triângulos das marcas, por cima de tudo — item 82.
    for (const marker of this.markers()) {
      if (span <= 0) break;
      const node = el('button', 'dope-marcador', '▼');
      node.type = 'button';
      node.style.left = `${percentOf(marker.time, span)}%`;
      const nome = markerLabel(marker);
      node.title = `${nome} — ${formatSeconds(marker.time)}. Duplo clique dá nome; Ctrl+↑ e Ctrl+↓ pulam`;
      node.setAttribute('aria-label', node.title);
      node.dataset['tempo'] = String(marker.time);
      node.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.goTo(marker.time);
      });
      node.addEventListener('dblclick', (event) => {
        event.preventDefault();
        event.stopPropagation();
        void this.renameMarkerAt(marker);
      });
      ruler.append(node);
    }
  }

  /** Duplo clique numa marca: dá nome a ela. */
  /**
   * Dá nome à marca, **na nossa janela** — anotação 15, item b.
   *
   * Era o `prompt` do navegador: uma caixa cinza do sistema, sem o tema, sem o
   * nome do programa, e que em alguns navegadores vem com "impedir que esta
   * página abra outras caixas" — que, marcado, some com a função para sempre.
   */
  private async renameMarkerAt(marker: Marker): Promise<void> {
    const resposta = await askForm({
      title: 'Nome da marca',
      lead: `A marca em ${formatSeconds(marker.time)}. O nome aparece na régua.`,
      fields: [{ id: 'nome', label: 'Nome', value: marker.name }],
      yesLabel: 'Dar o nome',
    });
    const nome = resposta?.['nome'];
    if (nome === undefined) return;
    this.saveTimeline({ markers: renameMarker(this.markers(), marker.time, nome.trim()) });
  }

  private renderCursor(): void {
    const doc = this.doc;
    const cursor = this.cursor;
    if (doc === null || cursor === null) return;
    const span = spanOf(doc);
    const body = this.body;
    const ruler = this.ruler;
    if (body === null || ruler === null) return;
    // The playhead lives over the tracks, which start where the ruler starts —
    // measured, not guessed, so the name column can change width in the CSS.
    const left = ruler.getBoundingClientRect().left - body.getBoundingClientRect().left;
    const width = ruler.clientWidth;
    const offset = (doc.time / span) * width;
    cursor.style.left = `${left + offset}px`;
    const flag = this.cursorFlag;
    if (flag !== null) {
      flag.textContent = playheadLabel(doc.time, fpsOf(doc));
      // Perto do fim da régua a bandeirinha viraria para fora do painel; aí ela
      // troca de lado e continua legível.
      const room = width - offset;
      flag.classList.toggle('dope-cursor-bandeira-esquerda', room < flag.offsetWidth + 8);
    }
    this.renderClock();
  }

  /** Escreve onde a agulha está: o campo em segundos e o número do quadro. */
  renderClock(): void {
    const doc = this.doc;
    if (doc === null) return;
    const fps = fpsOf(doc);
    // Com a base aberta o relógio diz `0,00 s`: a base tem um quadro só (M5).
    const tempo = doc.animation === null ? 0 : doc.time;
    const frame = Math.round(tempo * fps);
    // Não reescrever por cima de quem está digitando: apagaria o "0," de "0,5".
    if (this.timeField !== null && document.activeElement !== this.timeField) {
      this.timeField.value = formatSeconds(tempo);
    }
    if (this.frameLabel !== null) this.frameLabel.textContent = `quadro ${frame}`;
    // Laranja quando a agulha está em cima de uma chave — anotação 7.
    const emChave = playheadOnKey(doc);
    this.timeField?.classList.toggle('dope-toc-em-chave', emChave);
    // K3: o laranja não tinha dica nenhuma que o explicasse.
    if (this.timeField !== null) {
      const base = (this.timeField.dataset['dica'] ??= this.timeField.title);
      this.timeField.title = emChave ? `${base}. Laranja: há chave neste tempo` : base;
    }
  }

  // -------------------------------------------------------------------------
  // Navigation
  // -------------------------------------------------------------------------

  endTime(): number {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return 0;
    const animation = findAnimation(doc.file, doc.animation);
    return animation === null ? 0 : durationOf(animation);
  }

  goTo(time: number): void {
    const doc = this.doc;
    if (doc === null) return;
    doc.time = Math.max(0, roundTime(time));
  }

  private stepFrame(direction: number): void {
    const doc = this.doc;
    if (doc === null) return;
    const fps = fpsOf(doc);
    this.goTo(snapToFrame(doc.time, fps) + direction / fps);
  }

  /**
   * Anda para a chave anterior ou a seguinte.
   *
   * Com `onlyPicked` — que é o `Shift` do item 25 —, só as chaves das LINHAS
   * escolhidas contam. Numa animação de sessenta linhas, "próxima chave" pulava
   * de dez em dez milissegundos por causa de linhas que ninguém estava
   * ajustando; com o braço escolhido, ela pula de pose em pose do braço.
   *
   * Sem linha escolhida, `Shift` não tem o que filtrar e ele anda por todas —
   * que é melhor do que não andar e deixar a tecla parecer quebrada.
   */
  private stepKey(direction: number, onlyPicked = false): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return;
    const times = onlyPicked && this.pickedRows.size > 0
      ? this.pickedRowTimes()
      : allKeyTimes(doc.file, doc.animation);
    const target = direction < 0 ? previousKeyTime(times, doc.time) : nextKeyTime(times, doc.time);
    if (target !== null) this.goTo(target);
  }

  /**
   * As chaves "do escolhido": as linhas marcadas na folha, ou, sem nenhuma
   * marcada, as linhas do que está escolhido na cena.
   */
  private pickedTimes(): number[] {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return [];
    if (this.pickedRows.size > 0) return this.pickedRowTimes();
    const times = new Set<number>();
    for (const alvo of targetsForSelection(doc.selection)) {
      for (const ref of this.refsByTarget.get(targetKey(alvo)) ?? []) times.add(ref.time);
    }
    return [...times].sort((a, b) => a - b);
  }

  /** Anda até a chave anterior ou seguinte, só entre as do escolhido. */
  private stepKeyPicked(direction: number): void {
    const times = this.pickedTimes();
    const doc = this.doc;
    if (doc === null) return;
    if (times.length === 0) {
      doc.notice('Escolha um osso, um desenho, ou uma linha da folha');
      return;
    }
    const alvo = direction < 0 ? previousKeyTime(times, doc.time) : nextKeyTime(times, doc.time);
    if (alvo !== null) this.goTo(alvo);
  }

  /** Escolhe TODAS as chaves da animação aberta, para os botões em bloco. */
  private selectAllKeys(): void {
    const todas: KeyRef[] = [];
    for (const refs of this.refsByTarget.values()) todas.push(...refs);
    this.selectKeys(todas, 'trocar');
    this.doc?.notice(`${todas.length} ${todas.length === 1 ? 'chave escolhida' : 'chaves escolhidas'}`);
  }

  /** Os tempos das chaves das linhas escolhidas, em ordem e sem repetir. */
  private pickedRowTimes(): number[] {
    const times = new Set<number>();
    for (const [id] of this.pickedRows) {
      for (const ref of this.refsByTarget.get(id) ?? []) times.add(ref.time);
    }
    return [...times].sort((a, b) => a - b);
  }

  // -------------------------------------------------------------------------
  // Selection of keys
  // -------------------------------------------------------------------------

  private pickRow(target: TimelineTarget, add: boolean): void {
    const id = targetKey(target);
    if (!add) {
      const wasOnly = this.pickedRows.size === 1 && this.pickedRows.has(id);
      this.pickedRows.clear();
      if (wasOnly) {
        this.render();
        return;
      }
    }
    if (this.pickedRows.has(id)) this.pickedRows.delete(id);
    else this.pickedRows.set(id, target);
    this.render();
  }

  /**
   * **Mostrar a chave que acabou de nascer** — P12, K12 (chat D, lote 2a).
   *
   * Com a faixa em "Resumo" não há linha desenhada: abre os Detalhes pela
   * porta da casca (`detalhes-faixa`, que grava a faixa aberta — decisão do
   * Planejador: o que a pessoa criou tem de aparecer), escolhe a chave e rola
   * até o losango dela, de lado e de cima para baixo.
   */
  revealKeyNow(ref: KeyRef): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return;
    if (!dockState().open) runAction('detalhes-faixa');
    this.selectKeys([ref], 'trocar');
    const alvo = targetKey(ref.target);
    const achar = (): void => {
      const node = [...(this.body?.querySelectorAll<HTMLElement>('.dope-chave') ?? [])]
        .find((n) => n.dataset['alvo'] === alvo && sameTime(Number(n.dataset['tempo']), ref.time));
      node?.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
    };
    // A faixa que acabou de abrir redesenha no aviso da casca: o losango só
    // existe no quadro seguinte.
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(achar);
    else achar();
  }

  /**
   * **A chave que nasceu calada** — K3 (chat K) e L17 (chat L), 29/09/2026.
   *
   * Posar, arrastar vértice, girar pelo campo: toda porta que grava chave pelo
   * "mexer grava chave" gravava sem dizer. Em vez de pôr uma frase em cada
   * porta (e esquecer a próxima), a linha do tempo olha as chaves antes e
   * depois: nasceu chave, o rodapé diz qual e quando. Quem tem frase melhor
   * (colar corpo, trocar imagem) escreve DEPOIS do `run`, e a dele fica.
   */
  private noticeNewKeys(announce = true): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) {
      this.knownKeys = null;
      return;
    }
    const refs = allKeyRefs(doc.file, doc.animation);
    const ids = new Set(refs.map(keyRefKey));
    const antes = this.knownKeys;
    this.knownKeys = { animation: doc.animation, ids };
    if (!announce || antes === null || antes.animation !== doc.animation) return;
    const frase = newKeysNotice(refs.filter((ref) => !antes.ids.has(keyRefKey(ref))), doc.file);
    if (frase !== null) doc.notice(frase);
  }

  /**
   * Escolhe chaves. Com `reveal`, a folha rola até a primeira delas — rodada 40,
   * lote 2: depois de colar, clonar ou empurrar, as chaves novas podiam nascer
   * numa linha fora da vista (a `leg_b` debaixo da `leg`, doc 39, `31`).
   */
  selectKeys(refs: readonly KeyRef[], mode: 'trocar' | 'somar' | 'tirar', reveal = false): void {
    if (mode === 'trocar') this.selected.clear();
    for (const ref of refs) {
      const id = keyRefKey(ref);
      if (mode === 'tirar') this.selected.delete(id);
      else this.selected.set(id, ref);
    }
    // Rodada 40, lote 1: a aba Curvas abre na chave escolhida aqui.
    const foco = mode !== 'tirar' && refs.length > 0 ? refs[0]! : this.selectedRefs[0] ?? null;
    setKeyFocus(foco);
    this.render();
    if (reveal && refs.length > 0) this.scrollToKey(refs[0]!);
  }

  /** Rola a folha até o losango desta chave, no quadro seguinte ao desenho. */
  private scrollToKey(ref: KeyRef): void {
    const alvo = targetKey(ref.target);
    const achar = (): void => {
      const node = [...(this.body?.querySelectorAll<HTMLElement>('.dope-chave') ?? [])]
        .find((n) => n.dataset['alvo'] === alvo && sameTime(Number(n.dataset['tempo']), ref.time));
      // Ao centro, e não "nearest": no pé da folha o losango aparecia e a
      // linha dele ficava cortada.
      node?.scrollIntoView?.({ block: 'center', inline: 'nearest' });
    };
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(achar);
    else achar();
  }

  /**
   * O gráfico escolheu uma chave: a folha escolhe a mesma — rodada 40, lote 1.
   * Só troca a seleção quando a chave ainda não está nela, para não desfazer
   * uma escolha de várias que o próprio gráfico leu.
   */
  private readonly onFocusFromGraph = (ref: KeyRef | null): void => {
    if (ref === null || this.selected.has(keyRefKey(ref))) return;
    this.selected.clear();
    this.selected.set(keyRefKey(ref), ref);
    this.render();
  };

  /** Forgets keys that are no longer in the file, after an undo for instance. */
  /**
   * Tira da seleção as chaves que já não existem.
   *
   * Pelo mapa de identidade exata, e não pelos tempos das linhas: um tempo não
   * identifica uma chave de evento, e comparar por tempo descartava justamente
   * a chave de evento que o Resumo tinha acabado de escolher.
   */
  private dropMissingSelection(_groups: readonly RowGroup[]): void {
    if (this.selected.size === 0) return;
    const alive = new Set<string>();
    for (const [, refs] of this.refsByTarget) {
      for (const ref of refs) alive.add(keyRefKey(ref));
    }
    for (const id of [...this.selected.keys()]) if (!alive.has(id)) this.selected.delete(id);
  }

  /** The keys the bulk buttons act on. */
  get selectedRefs(): KeyRef[] {
    return [...this.selected.values()];
  }

  // -------------------------------------------------------------------------
  // Buttons that write
  // -------------------------------------------------------------------------

  /**
   * Properties "Chavear" writes when no row is picked: the five an artist
   * animates on a bone, and the two on a slot. Keying all seven bone numbers
   * would fill the sheet with lines nobody asked for.
   */
  /**
   * O que Chavear grava agora.
   *
   * Uma linha escolhida na folha manda: chavear com uma linha marcada grava
   * SÓ ela. Sem linha marcada vale a seleção da cena, e aí a conta é a mesma
   * que pinta o botão de verde ou de vermelho — `targetsForSelection`, pura, em
   * `anim/pose-mode.ts`. Duas listas separadas dariam um botão verde que grava
   * por cima de uma chave.
   */
  targetsToKey(): TimelineTarget[] {
    return dopesheetEdit.targetsToKey(this);
  }

  // -------------------------------------------------------------------------
  // Marcas e trecho de laço — itens 81 e 82
  // -------------------------------------------------------------------------

  /** Os slots que a seleção alcança, contando o de cada desenho escolhido. */
  private selectedSlotNames(): string[] {
    return dopesheetEdit.selectedSlotNames(this);
  }

  /** O que o editor guarda desta animação: trecho de laço e marcas. */
  timeline(): TimelineState {
    return dopesheetEdit.timeline(this);
  }

  /** As marcas desta animação, em ordem. */
  markers(): Marker[] {
    return dopesheetEdit.markers(this);
  }

  /**
   * Grava o trecho e as marcas no arquivo, e redesenha.
   *
   * Escreve direto em `RECORTE_editor_state`, sem passar por um `Command`, pelo
   * mesmo motivo das travas e das opções de exibição: isto não é o desenho nem
   * a animação, é como esta pessoa está olhando para eles. Encher a pilha de
   * desfazer com "pus uma marca" tiraria dela o passo que interessa.
   */
  saveTimeline(patch: Partial<TimelineState>): void {
    return dopesheetEdit.saveTimeline(this, patch);
  }

  /** Põe ou tira a marca do tempo atual — item 82, tecla `M`. */
  private toggleMarker(): void {
    return dopesheetEdit.toggleMarker(this);
  }

  /** Pula para a marca anterior ou seguinte — `Ctrl+↑` e `Ctrl+↓`. */
  private stepMarker(direction: number): void {
    return dopesheetEdit.stepMarker(this, direction);
  }

  /** Marca o começo ou o fim do trecho de laço — item 81, `Alt` + clique. */
  private setLoopEdge(which: 'from' | 'to', time: number): void {
    return dopesheetEdit.setLoopEdge(this, which, time);
  }

  /** Tira o trecho: volta a tocar a animação inteira. */
  clearLoopRange(): void {
    return dopesheetEdit.clearLoopRange(this);
  }

  /** `true` quando a animação aberta repete. Lido do ARQUIVO, não da sessão. */
  loopNow(): boolean {
    return dopesheetEdit.loopNow(this);
  }

  /**
   * Liga e desliga o Repetir — e GRAVA no arquivo.
   *
   * Era uma caixinha de sessão no painel Animações, que morria ao fechar a aba.
   * O campo `loop` existe no formato desde a §4.6 e o runtime sempre o leu; só
   * o editor não escrevia. Agora escreve, num passo de desfazer.
   */
  private toggleLoop(): void {
    return dopesheetEdit.toggleLoop(this);
  }

  private keyNow(): void {
    return dopesheetEdit.keyNow(this);
  }

  unkeyNow(): void {
    return dopesheetEdit.unkeyNow(this);
  }

  deleteSelected(): void {
    return dopesheetEdit.deleteSelected(this);
  }

  /**
   * Estica, encolhe ou espelha as chaves escolhidas em volta do tempo atual.
   *
   * `scaleKeys` já existia em `anim/keying.ts`, pronta e testada, e não estava
   * ligada a botão nenhum nem a atalho nenhum. Esticar é o comando que mais se
   * usa depois de mover: é como se ajusta o ritmo de um ciclo já animado. Um
   * fator negativo espelha — inverte a ordem das chaves no tempo.
   */
  scaleSelected(factor: number): void {
    return dopesheetEdit.scaleSelected(this, factor);
  }

  // -- esticar, espelhar e fechar o ciclo (A1 e A6) ---------------------------

  /** The number in the "Fator" box, comma or point, or `null` when it is junk. */
  readFactor(): number | null {
    return dopesheetEdit.readFactor(this);
  }

  /**
   * "Esticar seleção": scales the chosen keys in time, holding the FIRST key of
   * the selection still — the same thing dragging the right-hand edge of the
   * selection does.
   */
  private stretchByField(): void {
    return dopesheetEdit.stretchByField(this);
  }

  /** "Espelhar no tempo": reverses the order of the chosen keys, in place. */
  private mirrorInTime(): void {
    return dopesheetEdit.mirrorInTime(this);
  }

  /** "Empurrar as chaves…": item 4, pergunta quadros e lado. */
  private async pushKeys(): Promise<void> {
    return dopesheetEdit.askPushKeys(this);
  }

  /** "Limpar chaves repetidas": item 8, tira a chave que não muda nada. */
  private cleanRepeatedKeys(): void {
    return dopesheetEdit.cleanRepeatedKeysNow(this);
  }

  /** The pairs the rule box finds right now, in the open animation. */
  currentPairs(): MirrorPair[] {
    return dopesheetEdit.currentPairs(this);
  }

  /**
   * Shows the pairs BEFORE anything is swapped, which is the whole point: a
   * rule that matches the wrong bones has to be visible while it is still
   * harmless.
   */
  renderPairs(): void {
    return dopesheetEdit.renderPairs(this);
  }

  /** "Espelhar esquerda e direita": swaps the timelines of the paired bones. */
  private async mirrorLeftRight(): Promise<void> {
    return dopesheetEdit.mirrorLeftRight(this);
  }

  /**
   * "Fechar ciclo": the first key of each chosen timeline is written again at
   * the end of the animation, and the tangents are matched so the loop does not
   * jerk when it wraps. With nothing chosen it closes every timeline.
   */
  private closeTheLoop(): void {
    return dopesheetEdit.closeTheLoop(this);
  }

  /**
   * Copia a POSE inteira do instante — item 85, `Ctrl+Shift+C`.
   *
   * Copia o valor de TODA linha da animação naquele tempo, interpolado quando
   * não há chave ali. É a pose que está na tela, e ela pode ser colada em outra
   * animação com `Ctrl+V`.
   */
  private copyPose(): void {
    return dopesheetEdit.copyPose(this);
  }

  /** Cola o valor copiado em toda chave da linha — item 86, `Ctrl+Shift+V`. */
  private pasteToAll(): void {
    return dopesheetEdit.pasteToAll(this);
  }

  /** Apaga as linhas do tempo do escolhido — item 87, `Shift+Delete`. */
  private removeLines(): void {
    return dopesheetEdit.removeLines(this);
  }

  /** Apaga TODAS as linhas da animação — item 88. Pergunta antes. */
  private async clearAll(): Promise<void> {
    return dopesheetEdit.clearAll(this);
  }

  /** Chavear TUDO: todo osso e todo slot animável — item 84, `Ctrl+K`. */
  private keyAllNow(): void {
    return dopesheetEdit.keyAllNow(this);
  }

  /** Recortar: copia e apaga — item 91, `Ctrl+X`. */
  private cutSelected(): void {
    return dopesheetEdit.cutSelected(this);
  }

  copySelected(): void {
    return dopesheetEdit.copySelected(this);
  }

  /**
   * `true` quando "Copiar" tem o que levar: chave marcada, ou o membro
   * escolhido (ele e os filhos) com chave — itens 11 e 1.
   */
  private hasKeysToCopy(): boolean {
    if (this.selectedRefs.length > 0) return true;
    const doc = this.doc;
    if (doc === null || doc.animation === null) return false;
    const targets = targetsForSelection(selectChildren(doc.file, doc.selection));
    return targets.length > 0 && keyRefsForTargets(doc.file, doc.animation, targets).length > 0;
  }

  pasteHere(): void {
    // Rodada 50, lote 3: o colar pode perguntar antes de esticar (uma janela), e por isso espera.
    void dopesheetEdit.pasteHere(this);
  }

  /**
   * **O meio-termo** — rodada 17, PL-25: na agulha, a chave entre a de antes e
   * a de depois de cada linha dos ossos escolhidos (nenhum = a pose inteira).
   * A conta é de `anim/breakdown.ts`; um passo de desfazer.
   */
  breakdown(kind: BreakdownKind): void {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return;
    const ossos = doc.selection.bones;
    const valores = breakdownValues(doc.file, doc.animation, doc.time, ossos, kind);
    if (valores.length > 0) keyValuesNow(doc, valores, BREAKDOWN_LABEL[kind], `meio-termo:${kind}:${doc.time}`);
    doc.notice(breakdownNotice(kind, valores.length, doc.time, ossos.length === 0));
  }

  pasteMirrored(): void {
    return dopesheetEdit.pasteMirrored(this);
  }

  // -------------------------------------------------------------------------
  // Pointer
  // -------------------------------------------------------------------------

  /** Seconds per pixel inside a track element. */
  private secondsPerPixel(element: HTMLElement): number {
    return dopesheetPointer.secondsPerPixel(this, element);
  }

  timeFromEvent(element: HTMLElement, clientX: number): number {
    return dopesheetPointer.timeFromEvent(this, element, clientX);
  }

  readonly onRulerDown = (event: PointerEvent): void => {
    // Alt + clique marca o TRECHO de laço — item 81. Esquerdo é o começo,
    // direito é o fim. Sem Alt, o clique continua arrastando a agulha.
    if (event.altKey && this.ruler !== null) {
      event.preventDefault();
      event.stopPropagation();
      const time = this.timeFromEvent(this.ruler, event.clientX);
      this.setLoopEdge(event.button === 2 ? 'to' : 'from', time);
      return;
    }
    const ruler = this.ruler;
    if (ruler === null || event.button !== 0) return;
    event.preventDefault();
    this.drag = 'regua';
    ruler.setPointerCapture(event.pointerId);
    this.scrubTo(event.clientX);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
  };

  private scrubTo(clientX: number): void {
    return dopesheetPointer.scrubTo(this, clientX);
  }

  private onKeyDownPointer(event: PointerEvent, ref: KeyRef): void {
    return dopesheetPointer.onKeyDownPointer(this, event, ref);
  }

  /**
   * Arrastar em faixa vazia: o retângulo de laço.
   *
   * Não recebe alvo nenhum. Recebia, e não usava: o laço pega o que a caixa
   * toca, venha de que linha vier. Um parâmetro que ninguém lê é um parâmetro
   * que um dia alguém preenche errado.
   */
  onTrackDown(event: PointerEvent): void {
    return dopesheetPointer.onTrackDown(this, event);
  }

  moveBand(x: number, y: number): void {
    return dopesheetPointer.moveBand(this, x, y);
  }

  readonly onPointerMove = (event: PointerEvent): void => {
    if (this.drag === 'regua') {
      this.scrubTo(event.clientX);
      return;
    }
    if (this.drag === 'laco') {
      this.moveBand(event.clientX, event.clientY);
      return;
    }
    if (this.drag !== 'chaves') return;
    const doc = this.doc;
    const body = this.body;
    if (doc === null || body === null) return;
    const track = body.querySelector('.dope-faixa');
    if (!(track instanceof HTMLElement)) return;
    const seconds = (event.clientX - this.dragStart.x) * this.secondsPerPixel(track);
    const target = event.altKey
      ? this.dragStart.time + seconds
      : snapToFrame(this.dragStart.time + seconds, fpsOf(doc));
    this.dragDelta = roundTime(Math.max(0, target) - this.dragStart.time);
    this.previewDrag(track);
    this.showDragLabel(event.clientX, event.clientY, fpsOf(doc));
  };

  /** Rodada 40, lote 3: o tempo novo junto do mouse, durante o arrasto de chaves. */
  private showDragLabel(x: number, y: number, fps: number): void {
    if (this.dragLabel === null) {
      this.dragLabel = el('div', 'dope-arrasto-leitura');
      this.dragLabel.setAttribute('role', 'status');
      document.body.append(this.dragLabel);
    }
    this.dragLabel.textContent = dragReadout(this.dragStart.time, this.dragDelta, fps);
    this.dragLabel.style.left = `${Math.round(x + 14)}px`;
    this.dragLabel.style.top = `${Math.round(y - 34)}px`;
  }

  private hideDragLabel(): void {
    this.dragLabel?.remove();
    this.dragLabel = null;
  }

  /** Slides the selected diamonds while the pointer is down, without editing. */
  private previewDrag(track: HTMLElement): void {
    return dopesheetPointer.previewDrag(this, track);
  }

  readonly onPointerUp = (): void => {
    this.hideDragLabel();
    const doc = this.doc;
    if (this.drag === 'chaves' && doc !== null && doc.animation !== null && this.dragDelta !== 0) {
      const delta = this.dragDelta;
      let written: KeyRef[] = [];
      if (this.cloning) {
        // Item 6: clona — os originais (já tirados da seleção no clique) não
        // se mexem; as cópias nascem no novo tempo e ficam escolhidas.
        const refs = this.cloneSource;
        doc.run(new EditKeys(doc.animation, 'Clonar chaves', (file, animation) => {
          written = cloneKeys(file, animation, refs, delta);
        }));
      } else {
        const refs = this.selectedRefs;
        doc.run(new EditKeys(doc.animation, 'Mover chaves', (file, animation) => {
          written = moveKeys(file, animation, refs, delta);
        }));
      }
      this.selected.clear();
      for (const ref of written) this.selected.set(keyRefKey(ref), ref);
    }
    if (this.drag === 'laco') this.selectInsideBand();
    this.cloning = false;
    this.endDrag();
    this.render();
  };

  private selectInsideBand(): void {
    return dopesheetPointer.selectInsideBand(this);
  }

  /** Rebuilds the key a diamond stands for, from what was written on it. */
  refOfNode(node: HTMLElement): KeyRef | null {
    return dopesheetPointer.refOfNode(this, node);
  }

  private endDrag(): void {
    return dopesheetPointer.endDrag(this);
  }

  // -------------------------------------------------------------------------
  // Keyboard
  // -------------------------------------------------------------------------

  /**
   * A tecla vem da tabela (`ui/keys.ts`, escopo `linha-do-tempo`); o que ela
   * faz é daqui. O Alt nunca contou na folha, e Shift que a tabela não escreve
   * também não: Shift+M é M, Ctrl+Shift+↑ é Ctrl+↑.
   */
  /**
   * O clique em qualquer canto da folha dá o teclado a ela — rodada 23. Num
   * campo de texto não: ele pega o foco sozinho, e roubá-lo antes faria o
   * campo perder e ganhar o foco a cada clique (e gravar no perder).
   */
  private readonly takeFocus = (event: PointerEvent): void => {
    const host = this.host;
    if (host === null || isTyping(event.target) || document.activeElement === host) return;
    host.focus({ preventScroll: true });
  };

  private readonly onKeyDown = (event: KeyboardEvent): void => {
    const doc = this.doc;
    if (doc === null) return;
    // Rodada 47, lote 6b (nota do doc 88): com o foco numa barrinha (a da
    // velocidade, no tocador), as setas, PageUp/PageDown, Home e End são DELA —
    // antes, → andava a agulha (0,10 → 0,13 s) e só o PageUp mexia a barra.
    if (barKeepsKey(event)) return;
    switch (actionsFor('linha-do-tempo', keyOf(event, true))[0]) {
      // Ctrl + setas pulam de marca em marca — item 82.
      case 'marca-anterior': this.stepMarker(-1); break;
      case 'marca-seguinte': this.stepMarker(1); break;
      // Shift: a POSE inteira — item 85. Sem Shift: as chaves escolhidas.
      case 'copiar': this.copySelected(); break;
      case 'copiar-pose': this.copyPose(); break;
      case 'colar': this.pasteHere(); break;
      case 'colar-todas-chaves': this.pasteToAll(); break;
      case 'recortar-chaves': this.cutSelected(); break;
      case 'chavear-tudo': this.keyAllNow(); break;
      case 'apagar-linhas': this.removeLines(); break;
      // Sem chave escolhida o Delete não é da folha: segue para a casca, que
      // apaga o escolhido na cena (rodada 23, `deleteKeyGoesTo`).
      case 'local:apagar-chaves':
        if (deleteKeyGoesTo(this.selectedRefs.length) === 'cena') return;
        this.deleteSelected();
        break;
      case 'local:duplicar-na-folha':
        if (deleteKeyGoesTo(this.selectedRefs.length) === 'cena') return;
        doc.notice(DUPLICATE_IN_TIMELINE_NOTICE);
        break;
      // Shift pula dez quadros — item 93. Um quadro por vez é lento quando se
      // está procurando "mais ou menos onde" alguma coisa acontece.
      case 'quadro-anterior': this.stepFrame(-1); break;
      case 'quadro-seguinte': this.stepFrame(1); break;
      case 'local:dez-quadros-antes': this.stepFrame(-10); break;
      case 'local:dez-quadros-depois': this.stepFrame(10); break;
      case 'chave-anterior': this.stepKey(-1, false); break;
      case 'chave-seguinte': this.stepKey(1, false); break;
      // Shift: só pelas chaves das LINHAS escolhidas — item 25.
      case 'local:chave-anterior-linhas': this.stepKey(-1, true); break;
      case 'local:chave-seguinte-linhas': this.stepKey(1, true); break;
      // A marca é da linha do tempo, e a tecla também: com o foco na cena, M
      // continua escolhendo a ferramenta Malha. Uma tecla, um dono por vez.
      case 'nova-marca': this.toggleMarker(); break;
      case 'ir-inicio': this.goTo(0); break;
      case 'ir-fim': this.goTo(this.endTime()); break;
      default: return;
    }
    event.preventDefault();
    // Estas teclas também estão escritas no menu Animação, e a janela as ouve.
    // Quem tem o foco atende, e para o evento aqui: nunca duas vezes.
    event.stopPropagation();
  };
}

export const dopesheetPanel = new DopesheetPanel();
registerPanel(dopesheetPanel);

/**
 * **A linha da montagem de teste** — rodada 39, lote 3 (plano `22`, §5). Com
 * Na cena ligado, as peças de teste estão na cena e **não** têm faixa: elas
 * não entram na animação. Uma linha só, cinza e tracejada, no fim, para ler.
 */
function testMontagemLine(doc: EditorDoc | null): HTMLElement | null {
  const texto = doc === null ? null : montagemLineText(doc);
  if (texto === null) return null;
  const line = el('div', 'dope-linha dope-linha-teste');
  const nome = el('div', 'dope-nome', 'Teste');
  nome.title = texto;
  const faixa = el('div', 'dope-faixa dope-faixa-teste', texto);
  faixa.title = `${texto} Só para ler: mudar a montagem é na aba Entidades`;
  line.append(nome, faixa);
  return line;
}

/** A tecla é da barrinha com o foco (`input type=range`) — rodada 47, lote 6b. */
export function barKeepsKey(event: { target: EventTarget | null; key: string }): boolean {
  const alvo = event.target as { tagName?: string; type?: string } | null;
  if (alvo?.tagName !== 'INPUT' || alvo.type !== 'range') return false;
  return ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key);
}
