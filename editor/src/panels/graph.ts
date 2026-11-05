/**
 * Panel "Curvas" — the graph editor.
 *
 * Horizontal is time, vertical is value. One line per property, drawn with the
 * very functions the runtime samples with (`src/anim/curves.ts`), so what the
 * user shapes here is what a game plays.
 *
 * CORE PRINCIPLE (contract.ts): the document IS the `.bone` file. There is no
 * curve object living beside it. A key is the `{time, value, curve}` of spec
 * 9.2 inside a timeline, and every drag writes straight into that JSON through
 * a command.
 *
 * WHAT A HANDLE MEANS (spec 9.3)
 * `curve` belongs to the key it sits on and governs the segment FROM that key
 * TO the next one. So selecting a key shows two handles: the one that leaves
 * it and the one that arrives at the next key. That is one segment at a time,
 * on purpose — two half-segments meeting at a point is the thing people get
 * wrong in every other curve editor.
 *
 * WRITING
 * Every edit goes through `pose-mode.ts` (owner A): `SetKey` for the curve,
 * `EditKeys` for the key drag. Nothing here writes the setup pose, because a
 * curve only exists inside an animation. See `editor/PEDIDOS-FASE3B.md`.
 */

import type { CurveDef, KeyDef, KeyValue } from '../../../runtime/src/index.js';
import type { Command, DocChange, EditorDoc, Panel } from '../contract.js';
import { registerPanel } from '../contract.js';
import { barButtonsKeepNoFocus } from './sem-foco.js';
import {
  durationOf, findAnimation, keyFocus, moveKeys, onKeyFocus, sameTime, setKey, setKeyFocus,
  targetInfo, targetKey, targetOfTimeline, timelinesOf,
} from '../anim/keying.js';
import type { KeyRef, TimelineTarget } from '../anim/keying.js';
import { EditKeys, SetKey } from '../anim/pose-mode.js';
import {
  CURVE_PRESETS, clampControls, curveExtent, presetButtonHint, presetCurve, resolveCurve,
  samplePolyline, toBezier, withPoint, writeCurve,
} from '../anim/curves.js';
import type { ControlPoints } from '../anim/curves.js';
import { button, clear, el, stylesheetsPreloaded } from './dom.js';
import { fpsOf, snapToFrame } from './dopesheet.js';
import { CURVES_PLAYER_IDS, PLAYER_CONTROLS, controlLabel, curvesClock } from './dopesheet-model.js';
import { runAction } from '../ui/actions.js';
import { transport } from '../anim/transport.js';

// ---------------------------------------------------------------------------
// Style
// ---------------------------------------------------------------------------

let styleLinked = false;

/** Links `graph.css` once, the way `dom.ts` links `panels.css`. */
function ensureGraphStylesheet(): void {
  if (stylesheetsPreloaded() || styleLinked || typeof document === 'undefined') return;
  styleLinked = true;
  const href = new URL('./graph.css', import.meta.url).href;
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

// ---------------------------------------------------------------------------
// Colours, one per property
// ---------------------------------------------------------------------------

/**
 * X is red, Y is green, rotation is blue — the three the user reads most.
 * Every colour below is dark enough to pass 4.5:1 on the white of the panel,
 * and no two of them are a red/green pair that colour blindness merges: the
 * legend always spells the name out as well.
 */
const PROPERTY_COLORS: Record<string, string> = {
  x: '#c62020',
  y: '#12772f',
  rotation: '#1a4fd8',
  scaleX: '#a34a00',
  scaleY: '#7a1fa2',
  shearX: '#00696f',
  shearY: '#7a5c00',
};

/** Used when a property has no colour of its own; walked in order. */
const SPARE_COLORS = ['#1a4fd8', '#c62020', '#12772f', '#7a1fa2', '#a34a00', '#00696f'];

/** Components of a colour value, in the order of spec 9.5. */
const COLOR_PARTS = ['Vermelho', 'Verde', 'Azul', 'Opacidade'];
const COLOR_PART_COLORS = ['#c62020', '#12772f', '#1a4fd8', '#45505e'];

// ---------------------------------------------------------------------------
// What the panel draws
// ---------------------------------------------------------------------------

/** One key of one component, already read out of the file. */
interface ChannelKey {
  /** Index inside the timeline's `keys` array. */
  index: number;
  time: number;
  /** The number this component holds. */
  value: number;
  /** Every component of the key, needed to rewrite a multi-number value. */
  values: number[];
  /** The value exactly as the file has it, to hand back when only the curve changes. */
  raw: KeyValue | undefined;
  curve: CurveDef | undefined;
}

/** One line on the graph: one component of one timeline. */
interface Channel {
  /** Stable id, so the selection survives a redraw. */
  id: string;
  target: TimelineTarget;
  /** Which number of the value this line follows. */
  component: number;
  /** How many numbers the value has, which is `C` of 9.3. */
  components: number;
  label: string;
  color: string;
  visible: boolean;
  keys: ChannelKey[];
}

/** The key the user picked, by id and not by object, so a redraw keeps it. */
interface KeyPick {
  channel: string;
  index: number;
}

type DragKind = 'key' | 'first' | 'second';

interface Drag {
  kind: DragKind;
  channel: string;
  index: number;
  pointerId: number;
  /** Where the pointer went down, so a click can be told apart from a drag. */
  fromX: number;
  fromY: number;
  /**
   * `false` until the pointer has walked `DRAG_SLOP` pixels. A plain click
   * picks a key and leaves it exactly where it was; without this the very
   * pointermove the click itself produces already rewrote the key.
   */
  armed: boolean;
  /** `true` while the modifier key asks for free time, off the frame grid. */
  freeTime: boolean;
}

/**
 * How far the pointer has to walk before a click becomes a drag, in CSS pixels.
 *
 * Measured before this existed: clicking a key written at 0,166666 s / -40 to
 * select it moved it to 0,167 s / -38,9379. Selecting is not editing.
 */
const DRAG_SLOP = 4;

/** `true` once the pointer walked far enough from the point it went down. */
export function pastSlop(
  drag: { fromX: number; fromY: number },
  x: number,
  y: number,
): boolean {
  return Math.hypot(x - drag.fromX, y - drag.fromY) >= DRAG_SLOP;
}

/**
 * Where a dragged key lands in time.
 *
 * Snapped to the frame grid unless `freeTime` asks otherwise, then held inside
 * the gap its two neighbours leave, so a drag never reorders the channel.
 */
export function keyDropTime(
  wanted: number,
  fps: number,
  freeTime: boolean,
  low: number,
  high: number,
): number {
  const t = freeTime ? wanted : snapToFrame(wanted, fps);
  return roundTo(clampNumber(t, Math.min(low, high), Math.max(low, high)), 6);
}

// ---------------------------------------------------------------------------
// Numbers on screen
// ---------------------------------------------------------------------------

/** A number the way Portuguese writes it: comma, two decimals, no dust. */
function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '0,00';
  return value.toFixed(2).replace('.', ',');
}

/** A unidade de cada propriedade de osso que é número (régua do `26`). */
const AXIS_UNITS: Readonly<Record<string, string>> = Object.freeze({
  x: ' px', y: ' px', rotation: '°', shearX: '°', shearY: '°', scaleX: '×', scaleY: '×',
});

/**
 * A unidade do eixo vertical — rodada 40, lote 5 (doc 39, §4): a das linhas à
 * vista, se for uma só; vazia quando elas misturam (graus com pixels) ou não
 * são de osso. Nunca um palpite (regra 21).
 */
export function unitOfLines(lines: ReadonlyArray<{ target: TimelineTarget; visible: boolean }>): string {
  const units = new Set<string>();
  for (const line of lines) {
    if (!line.visible) continue;
    units.add(line.target.type === 'bone' ? AXIS_UNITS[line.target.property ?? ''] ?? '' : '');
  }
  return units.size === 1 ? [...units][0]! : '';
}

/** Um número do eixo: vírgula, menos de verdade, até duas casas, e a unidade. */
export function axisNumber(value: number, unit: string): string {
  const text = String(Number((Number.isFinite(value) ? value : 0).toFixed(2))).replace('.', ',');
  return `${text.startsWith('-') ? `−${text.slice(1)}` : text}${unit}`;
}

/** Seconds, with the unit written out. */
function formatSeconds(value: number): string {
  return `${formatNumber(value)} s`;
}

// ---------------------------------------------------------------------------
// The one command this panel adds to the ones `pose-mode.ts` already has
// ---------------------------------------------------------------------------

/**
 * Drags one key to a new time and a new value, in one step of undo.
 *
 * `SetKey` writes a key AT a time, so it cannot move one; `EditKeys` can, but
 * it does not merge, and a drag that produced one step per mouse move would
 * fill the undo menu with fifty "Mover chave". So this is `EditKeys` with the
 * merge rule of `SetKey`: the same key of the same animation, dragged on and
 * on, stays one step.
 *
 * Each command in the chain moves the key from where it is NOW to where the
 * pointer is, so absorbing the previous one is just keeping the older snapshot
 * — which is what `adopt` does.
 */
class DragKey extends EditKeys {
  private readonly target: TimelineTarget;

  constructor(
    animation: string, target: TimelineTarget, from: number, to: number, value: KeyValue,
  ) {
    super(animation, 'Mover chave', (file, name) => {
      if (!sameTime(from, to)) moveKeys(file, name, [{ target, time: from }], to - from);
      // `keepCurve` matters here: re-keying the value must not throw away the
      // shape the user drew on this very panel.
      setKey(file, name, to, target, value, { keepCurve: true });
    });
    this.target = target;
  }

  mergeWith(previous: Command): boolean {
    if (!(previous instanceof DragKey)) return false;
    if (previous.animation !== this.animation) return false;
    if (targetKey(previous.target) !== targetKey(this.target)) return false;
    this.adopt(previous);
    return true;
  }
}

// ---------------------------------------------------------------------------
// Layout of the drawing area
// ---------------------------------------------------------------------------

/** Room for the value labels on the left. */
const PAD_LEFT = 56;
const PAD_RIGHT = 12;
const PAD_TOP = 14;
/** Room for the time labels underneath. */
const PAD_BOTTOM = 26;

/** How close, in pixels, the cursor has to be to grab a point. */
const GRAB_RADIUS = 10;

/** Maps between the two spaces, rebuilt on every draw. */
interface View {
  width: number;
  height: number;
  t0: number;
  t1: number;
  v0: number;
  v1: number;
}

function xOf(view: View, time: number): number {
  const span = view.t1 - view.t0;
  const inner = view.width - PAD_LEFT - PAD_RIGHT;
  if (span <= 0) return PAD_LEFT;
  return PAD_LEFT + ((time - view.t0) / span) * inner;
}

function yOf(view: View, value: number): number {
  const span = view.v1 - view.v0;
  const inner = view.height - PAD_TOP - PAD_BOTTOM;
  if (span <= 0) return PAD_TOP + inner / 2;
  return PAD_TOP + ((view.v1 - value) / span) * inner;
}

function timeAt(view: View, x: number): number {
  const inner = view.width - PAD_LEFT - PAD_RIGHT;
  if (inner <= 0) return view.t0;
  return view.t0 + ((x - PAD_LEFT) / inner) * (view.t1 - view.t0);
}

function valueAtY(view: View, y: number): number {
  const inner = view.height - PAD_TOP - PAD_BOTTOM;
  if (inner <= 0) return view.v0;
  return view.v1 - ((y - PAD_TOP) / inner) * (view.v1 - view.v0);
}

/** Round numbers for a grid line: 1, 2, 5, 10, 20, 50, ... */
function niceStep(span: number, wanted: number): number {
  if (!(span > 0) || wanted <= 0) return 1;
  const raw = span / wanted;
  const power = 10 ** Math.floor(Math.log10(raw));
  for (const factor of [1, 2, 5, 10]) {
    if (raw <= power * factor) return power * factor;
  }
  return power * 10;
}

// ---------------------------------------------------------------------------
// The panel
// ---------------------------------------------------------------------------

/** O que `spanOfLines` precisa de uma linha do gráfico. */
export interface SpanLine {
  id: string;
  visible: boolean;
  components: number;
  component: number;
  keys: ReadonlyArray<{ time: number; value: number; curve: CurveDef | undefined }>;
}

/**
 * Lowest and highest value the visible lines reach, overshoot included — or,
 * with `only`, the line of that id alone (rodada 40, lote 3: o Ajustar com uma
 * chave escolhida enquadra a linha dela).
 *
 * A curve that passes its target leaves the box its two keys draw, so the
 * extent has to come from the sampled curve, not from the key values.
 */
export function spanOfLines(lines: readonly SpanLine[], only: string | null): { min: number; max: number } {
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (const channel of lines) {
    if (!channel.visible) continue;
    if (only !== null && channel.id !== only) continue;
    for (let i = 0; i < channel.keys.length; i++) {
      const key = channel.keys[i];
      if (key === undefined) continue;
      if (key.value < min) min = key.value;
      if (key.value > max) max = key.value;
      const next = channel.keys[i + 1];
      if (next === undefined) continue;
      const shape = resolveCurve(key.curve, channel.components, true, key.time, next.time);
      const extent = curveExtent(
        shape, channel.component, key.time, key.value, next.time, next.value, 24,
      );
      if (extent.min < min) min = extent.min;
      if (extent.max > max) max = extent.max;
    }
  }
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { min: -100, max: 100 };
  if (max - min < 1e-6) return { min: min - 1, max: max + 1 };
  // One tenth of the travel above and below, so a key never sits on the edge.
  const margin = (max - min) * 0.1;
  return { min: min - margin, max: max + margin };
}

class GraphPanel implements Panel {
  readonly id = 'curvas';
  readonly title = 'Curvas';
  readonly listensTo = ['file', 'structure', 'transform', 'selection', 'time'] as const;

  private doc: EditorDoc | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private legend: HTMLElement | null = null;
  private readout: HTMLElement | null = null;
  private note: HTMLElement | null = null;
  private presetButtons: HTMLButtonElement[] = [];
  private observer: ResizeObserver | null = null;
  /** O botão Tocar e o relógio da barra — rodada 17, G-Q6. */
  private playButton: HTMLButtonElement | null = null;
  private clock: HTMLElement | null = null;
  private stopListening: (() => void) | null = null;
  /** A frase do que os botões de formato vão fazer; a linha a mostra quando o cursor sai da área. */
  private noteText = '';
  /** O cursor está sobre a área: a linha mostra tempo e valor, e não a frase. */
  private hovering = false;

  /** Lines on screen, rebuilt from the file on every redraw. */
  private channels: Channel[] = [];
  /** Lines the user switched off, by channel id. */
  private readonly hidden = new Set<string>();
  /** The key the presets and the handles work on. */
  private picked: KeyPick | null = null;
  /** Para de escutar a chave em foco da Linha do tempo — rodada 40, lote 1. */
  private stopFocus: (() => void) | null = null;
  private drag: Drag | null = null;
  /** Vertical range, in value units. `null` asks for a fit on the next draw. */
  private range: { min: number; max: number } | null = null;
  /** The lines the last draw showed, so a change of lines refits the scale. */
  private shownIds = '';

  // -------------------------------------------------------------------------
  // Mount
  // -------------------------------------------------------------------------

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureGraphStylesheet();
    this.doc = doc;
    clear(host);
    // QA da noite (04/11): clicar "Suave" deixava o foco no botão, e o Espaço
    // seguinte reaplicava a curva em vez de tocar.
    barButtonsKeepNoFocus(host);
    host.classList.add('painel', 'grafico');

    /*
     * Rodada 17, G-Q6 e K9 + G-Q5 (05/10/2026): a barra de cima leva o tocador
     * e o formato da curva.
     *
     * A aba Curvas fica no lugar da Linha do tempo, e escondia o tocador: não
     * se tocava olhando a curva. E os sete botões do formato moravam ABAIXO do
     * gráfico — em 1920×1080 iam de y 1078 a 1217, fora da tela, e só rolando
     * se achavam. No Spine os formatos ficam na barra do Graph, em cima; aqui
     * também. A frase do que eles fazem (G-Q7) fica na linha logo abaixo, à
     * vista, e não mais no fim da rolagem.
     */
    const bar = el('div', 'painel-barra grafico-barra');
    // Rodada 47, lote 1 (doc 68, C3): a casca põe as abas da faixa nesta linha.
    bar.setAttribute('data-faixa-linha', '');
    const tocador = el('div', 'grafico-tocador');
    for (const id of CURVES_PLAYER_IDS) {
      const control = PLAYER_CONTROLS.find((c) => c.id === id);
      if (control === undefined) continue;
      const node = button(control.symbol, () => runAction(control.id));
      node.classList.add('grafico-toc', `grafico-toc-${control.id}`);
      const label = controlLabel(control);
      node.title = label;
      node.setAttribute('aria-label', label);
      if (control.kind === 'liga') {
        node.setAttribute('aria-pressed', 'false');
        this.playButton = node;
      }
      tocador.append(node);
    }
    const clock = el('span', 'grafico-relogio', '');
    this.clock = clock;
    tocador.append(clock);
    this.stopListening = transport.onChange(() => this.syncPlayer());
    // Rodada 40, lote 1: a chave escolhida na Linha do tempo é a daqui.
    this.stopFocus?.();
    this.stopFocus = onKeyFocus((ref) => { if (this.pickFromFocus(ref)) { this.renderNote(); this.draw(); } });

    const presets = el('div', 'grafico-formatos');
    presets.append(el('span', 'grafico-titulo', 'Formato da curva'));
    const row = el('div', 'grafico-botoes');
    this.presetButtons = CURVE_PRESETS.map((preset) => {
      const node = button(preset.label, () => this.applyPreset(preset.id));
      node.title = preset.hint;
      row.append(node);
      return node;
    });
    presets.append(row);

    // Rodada 47, lote 4 (R5): os dois botões dizem o que fazem.
    const comDica = (botao: HTMLButtonElement, dica: string): HTMLButtonElement => {
      botao.title = dica;
      botao.setAttribute('aria-label', dica);
      return botao;
    };
    bar.append(
      tocador,
      comDica(button('Ajustar', () => this.fitVertical()),
        'Ajustar: a altura do gráfico enquadra a linha da chave escolhida (ou todas as linhas à vista)'),
      comDica(button('Mostrar todas', () => this.showAll()),
        'Mostrar todas: liga de novo as linhas que você escondeu na lista de baixo'),
      presets,
    );

    const board = el('div', 'grafico-quadro');
    const canvas = document.createElement('canvas');
    canvas.className = 'grafico-tela';
    canvas.tabIndex = 0;
    board.append(canvas);
    this.canvas = canvas;

    // A linha logo abaixo da barra: a frase do que fazer (a nota) e, com o
    // cursor sobre a área, o tempo e o valor debaixo dele.
    const readout = el('p', 'grafico-leitura', '');
    this.readout = readout;
    this.note = readout;

    const legend = el('ul', 'grafico-legenda');
    this.legend = legend;

    /*
     * Under the drawing area, only the legend: it scrolls with the panel. The
     * readout and the preset buttons used to live here too, and in a short
     * strip they were below the fold (rodada 17, K9 + G-Q5).
     */
    const rest = el('div', 'grafico-rolagem');
    rest.append(legend);
    host.append(bar, readout, board, rest);

    canvas.addEventListener('pointerdown', (event) => this.onPointerDown(event));
    canvas.addEventListener('pointermove', (event) => this.onPointerMove(event));
    canvas.addEventListener('pointerup', (event) => this.onPointerUp(event));
    canvas.addEventListener('pointercancel', (event) => this.onPointerUp(event));
    canvas.addEventListener('pointerleave', () => this.clearReadout());

    if (typeof ResizeObserver !== 'undefined') {
      this.observer = new ResizeObserver(() => this.draw());
      this.observer.observe(board);
    }
    this.render();
  }

  refresh(_change: DocChange): void {
    this.render();
  }

  unmount(): void {
    this.observer?.disconnect();
    this.observer = null;
    this.stopListening?.();
    this.stopListening = null;
    this.stopFocus?.();
    this.stopFocus = null;
    this.playButton = null;
    this.clock = null;
    this.doc = null;
    this.canvas = null;
    this.legend = null;
    this.readout = null;
    this.note = null;
    this.presetButtons = [];
    this.channels = [];
    this.picked = null;
    this.drag = null;
  }

  // -------------------------------------------------------------------------
  // Reading the file
  // -------------------------------------------------------------------------

  /** Every line the panel can draw, in the order the timelines appear. */
  private buildChannels(): Channel[] {
    const doc = this.doc;
    if (doc === null || doc.animation === null) return [];
    const file = doc.file;
    const animation = doc.animation;
    if (findAnimation(file, animation) === null) return [];

    const selection = doc.selection;
    const bones = new Set(selection.bones);
    const slots = new Set(selection.slots);
    const constraints = new Set(selection.constraints);
    const filtering = bones.size + slots.size + constraints.size > 0;

    const out: Channel[] = [];
    let spare = 0;
    for (const timeline of timelinesOf(file, animation)) {
      const target = targetOfTimeline(timeline);
      const info = targetInfo(target, file);
      if (!info.interpolable || info.components < 1) continue;
      // One curve per vertex: that belongs to the mesh editor, not here.
      if (target.type === 'deform') continue;
      if (filtering && !isSelected(target, bones, slots, constraints)) continue;
      const keys = (timeline as unknown as { keys?: KeyDef[] }).keys ?? [];
      for (let j = 0; j < info.components; j++) {
        const id = `${targetKey(target)}#${j}`;
        out.push({
          id,
          target,
          component: j,
          components: info.components,
          label: channelLabel(target, info.label, j),
          color: channelColor(target, j, spare++),
          visible: !this.hidden.has(id),
          keys: keys.map((key, index) => readKey(key, index, j, info.components)),
        });
      }
    }
    return out;
  }

  /** Time the graph spans: the whole animation. */
  private timeSpan(): { t0: number; t1: number } {
    const doc = this.doc;
    const animation = doc === null ? null : findAnimation(doc.file, doc.animation);
    const duration = animation === null ? 0 : durationOf(animation);
    return { t0: 0, t1: duration > 0 ? duration : 1 };
  }

  private channelById(id: string): Channel | null {
    return this.channels.find((channel) => channel.id === id) ?? null;
  }

  private pickedChannel(): Channel | null {
    return this.picked === null ? null : this.channelById(this.picked.channel);
  }

  // -------------------------------------------------------------------------
  // Vertical scale
  // -------------------------------------------------------------------------

  /**
   * Lowest and highest value the visible lines reach, overshoot included.
   *
   * A curve that passes its target leaves the box its two keys draw, so the
   * extent has to come from the sampled curve, not from the key values. That
   * is exactly what "Ajustar" is for.
   */
  private valueSpan(only: string | null = null): { min: number; max: number } {
    return spanOfLines(this.channels, only);
  }

  /** Button "Ajustar": makes the vertical scale fit what is drawn. */
  private fitVertical(): void {
    // Rodada 40, lote 3 (doc 44, c): com uma chave escolhida, enquadra a linha
    // DELA. Com todas na tela a escala ia de −100 a 100, e uma curva de 3°
    // virava uma reta — e o Ajustar não mudava nada.
    this.range = this.valueSpan(this.picked?.channel ?? null);
    this.render();
    // Rodada 47, lote 4 (R9): o rodapé diz o que o botão fez.
    const faixa = this.range;
    this.doc?.notice(faixa === null
      ? 'Ajustar: nenhuma linha à vista para enquadrar'
      : `Ajustar: o gráfico vai de ${fmtFaixa(faixa.min)} a ${fmtFaixa(faixa.max)}`);
  }

  /** Button "Mostrar todas": switches every hidden line back on. */
  private showAll(): void {
    const antes = this.hidden.size;
    this.hidden.clear();
    this.range = null;
    this.render();
    // Rodada 47, lote 4 (R9): o rodapé diz quantas voltaram.
    this.doc?.notice(antes === 0 ? 'Todas as linhas já estavam à vista' : `${antes === 1 ? '1 linha voltou' : `${antes} linhas voltaram`} ao gráfico`);
  }

  private toggleChannel(id: string): void {
    if (this.hidden.has(id)) this.hidden.delete(id);
    else this.hidden.add(id);
    if (this.picked?.channel === id && this.hidden.has(id)) this.picked = null;
    this.render();
  }

  // -------------------------------------------------------------------------
  // Redraw
  // -------------------------------------------------------------------------

  /** Rebuilds the lines from the file, then redraws the canvas and the legend. */
  private render(): void {
    this.channels = this.buildChannels();
    // A different set of lines is a different graph, so the vertical scale is
    // fitted again. While the same lines stay on screen the scale is left
    // alone: a scale that jumped on every drag would be unusable.
    const shown = this.channels.map((channel) => channel.id).join('\n');
    if (shown !== this.shownIds) {
      this.shownIds = shown;
      this.range = null;
    }
    if (this.picked !== null && this.channelById(this.picked.channel) === null) {
      this.picked = null;
    }
    if (this.picked === null) this.pickFromFocus(keyFocus());
    this.renderLegend();
    this.renderNote();
    this.syncPlayer();
    this.draw();
  }

  /** O ▶ vira ❚❚ tocando, e o relógio diz onde a agulha está — rodada 17, G-Q6. */
  private syncPlayer(): void {
    const playing = transport.isPlaying();
    if (this.playButton !== null) {
      this.playButton.textContent = playing ? '❚❚' : '▶';
      this.playButton.setAttribute('aria-pressed', String(playing));
      this.playButton.classList.toggle('is-on', playing);
    }
    const doc = this.doc;
    if (this.clock !== null && doc !== null) {
      this.clock.textContent = curvesClock(doc.time, fpsOf(doc), doc.animation === null);
    }
  }

  private renderLegend(): void {
    const legend = this.legend;
    if (legend === null) return;
    clear(legend);
    if (this.channels.length === 0) return;
    for (const channel of this.channels) {
      const item = el('li', 'grafico-item');
      const toggle = el('button', 'grafico-linha');
      toggle.type = 'button';
      // Rodada 47, lote 5b (notas do doc 86), nota 4: a linha da lista diz o que o clique faz.
      toggle.title = `${channel.label}: clique mostra ou esconde esta linha no gráfico`;
      toggle.setAttribute('aria-pressed', channel.visible ? 'true' : 'false');
      const swatch = el('span', 'grafico-cor');
      swatch.style.background = channel.color;
      const name = el('span', 'grafico-nome', channel.label);
      // Rodada 47, lote 6c (nota 4 do doc 90): "Vendo" não se lia; "à vista" / "escondida".
      const state = el('span', 'grafico-estado', channel.visible ? 'à vista' : 'escondida');
      toggle.append(swatch, name, state);
      toggle.addEventListener('click', () => this.toggleChannel(channel.id));
      item.append(toggle);
      legend.append(item);
    }
  }

  /** The line of text that says what the buttons will act on. */
  private renderNote(): void {
    const note = this.note;
    if (note === null) return;
    const doc = this.doc;
    let text: string;
    if (doc === null || doc.animation === null) {
      text = 'Abra uma animação para ver as curvas.';
    } else if (this.channels.length === 0) {
      text = 'Nenhuma propriedade com chaves. Escolha um osso com chaves nesta animação.';
    } else {
      const channel = this.pickedChannel();
      const key = this.pickedKey();
      if (channel === null || key === null) {
        text = 'Clique num ponto do gráfico (uma chave) para escolhê-la: o formato da curva vale dela até a próxima.';
      } else if (this.pickedSegment() === null) {
        // `curve` says how to get from this key to the next one (9.3). The last
        // key of a timeline has nowhere to go, so it has no curve to shape.
        text = `Chave em ${formatSeconds(key.time)} de ${channel.label}. É a última: não tem curva.`;
      } else {
        text = `Chave em ${formatSeconds(key.time)} de ${channel.label}. As alças vão até a próxima chave.`;
      }
    }
    this.noteText = text;
    if (!this.hovering) note.textContent = text;
    const ready = this.pickedSegment() !== null;
    // Apagado, o botão diz por quê na dica (regra 21) — rodada 17, G-Q7.
    this.presetButtons.forEach((node, index) => {
      node.disabled = !ready;
      const preset = CURVE_PRESETS[index];
      // Rodada 40, lote 1: sem o ".." que a colagem de duas frases deixava.
      node.title = preset === undefined ? '' : presetButtonHint(preset, ready);
    });
  }

  /**
   * Escolhe aqui a chave que a Linha do tempo escolheu — rodada 40, lote 1.
   * Devolve `true` quando a escolha mudou. A linha visível vence a escondida,
   * e de uma cor (quatro números) vale a primeira linha: a curva é a mesma.
   */
  private pickFromFocus(ref: KeyRef | null): boolean {
    if (ref === null || ref.event !== undefined) return false;
    const want = targetKey(ref.target);
    const candidates = this.channels.filter((channel) => targetKey(channel.target) === want);
    const channel = candidates.find((item) => item.visible && !this.hidden.has(item.id)) ?? candidates[0];
    const key = channel?.keys.find((item) => sameTime(item.time, ref.time));
    if (channel === undefined || key === undefined) return false;
    if (this.picked?.channel === channel.id && this.picked.index === key.index) return false;
    this.picked = { channel: channel.id, index: key.index };
    return true;
  }

  /** A chave escolhida no gráfico vai para a Linha do tempo — rodada 40, lote 1. */
  private shareFocus(pick: KeyPick): void {
    const channel = this.channelById(pick.channel);
    const key = channel?.keys.find((item) => item.index === pick.index);
    if (channel === null || channel === undefined || key === undefined) return;
    setKeyFocus({ target: channel.target, time: key.time });
  }

  private pickedKey(): ChannelKey | null {
    const channel = this.pickedChannel();
    if (channel === null || this.picked === null) return null;
    return channel.keys.find((key) => key.index === this.picked?.index) ?? null;
  }

  /** The view the last draw used, so the pointer can undo the mapping. */
  private view(): View | null {
    const canvas = this.canvas;
    if (canvas === null) return null;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width <= 0 || height <= 0) return null;
    const time = this.timeSpan();
    const range = this.range ?? this.valueSpan();
    return { width, height, t0: time.t0, t1: time.t1, v0: range.min, v1: range.max };
  }

  private draw(): void {
    const canvas = this.canvas;
    if (canvas === null) return;
    const view = this.view();
    if (view === null) return;
    this.range = { min: view.v0, max: view.v1 };

    const ratio = typeof devicePixelRatio === 'number' && devicePixelRatio > 0 ? devicePixelRatio : 1;
    const pixelWidth = Math.round(view.width * ratio);
    const pixelHeight = Math.round(view.height * ratio);
    if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
    if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
    const ctx = canvas.getContext('2d');
    if (ctx === null) return;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, view.width, view.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, view.width, view.height);

    this.drawGrid(ctx, view);
    this.drawPlayhead(ctx, view);
    for (const channel of this.channels) {
      if (channel.visible) this.drawChannel(ctx, view, channel);
    }
    this.drawHandles(ctx, view);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, view: View): void {
    const left = PAD_LEFT;
    const right = view.width - PAD_RIGHT;
    const top = PAD_TOP;
    const bottom = view.height - PAD_BOTTOM;
    ctx.font = '13px "Segoe UI", Verdana, system-ui, sans-serif';
    ctx.textBaseline = 'middle';

    // Value lines, with the number written on the left — and the unit of the
    // lines on screen (rodada 40, lote 5).
    const unit = unitOfLines(this.channels.filter((channel) => !this.hidden.has(channel.id)));
    const valueStep = niceStep(view.v1 - view.v0, 4);
    ctx.textAlign = 'right';
    for (let v = Math.ceil(view.v0 / valueStep) * valueStep; v <= view.v1; v += valueStep) {
      const y = yOf(view, v);
      ctx.strokeStyle = Math.abs(v) < valueStep / 1000 ? '#8d99a8' : '#dfe4ec';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(left, Math.round(y) + 0.5);
      ctx.lineTo(right, Math.round(y) + 0.5);
      ctx.stroke();
      ctx.fillStyle = '#45505e';
      ctx.fillText(axisNumber(v, unit), left - 8, y);
    }

    // Time lines, with the second written underneath.
    const timeStep = niceStep(view.t1 - view.t0, 4);
    ctx.textAlign = 'center';
    for (let t = view.t0; t <= view.t1 + timeStep / 1000; t += timeStep) {
      const x = xOf(view, t);
      ctx.strokeStyle = '#dfe4ec';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.round(x) + 0.5, top);
      ctx.lineTo(Math.round(x) + 0.5, bottom);
      ctx.stroke();
      ctx.fillStyle = '#45505e';
      ctx.fillText(formatSeconds(t), x, bottom + 13);
    }

    ctx.strokeStyle = '#8d99a8';
    ctx.lineWidth = 2;
    ctx.strokeRect(left, top, right - left, bottom - top);
  }

  private drawPlayhead(ctx: CanvasRenderingContext2D, view: View): void {
    const doc = this.doc;
    if (doc === null) return;
    if (doc.time < view.t0 || doc.time > view.t1) return;
    const x = xOf(view, doc.time);
    ctx.strokeStyle = '#10151c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, PAD_TOP);
    ctx.lineTo(x, view.height - PAD_BOTTOM);
    ctx.stroke();
  }

  private drawChannel(ctx: CanvasRenderingContext2D, view: View, channel: Channel): void {
    ctx.strokeStyle = channel.color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';

    for (let i = 0; i < channel.keys.length - 1; i++) {
      const key = channel.keys[i];
      const next = channel.keys[i + 1];
      if (key === undefined || next === undefined) continue;
      const shape = resolveCurve(key.curve, channel.components, true, key.time, next.time);
      const line = samplePolyline(
        shape, channel.component, key.time, key.value, next.time, next.value, 40,
      );
      ctx.beginPath();
      line.forEach((point, index) => {
        const x = xOf(view, point.time);
        const y = yOf(view, point.value);
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Before the first key and after the last one the value is held (9.10),
    // drawn dashed so the user sees it is not a keyed stretch.
    const first = channel.keys[0];
    const last = channel.keys[channel.keys.length - 1];
    if (first !== undefined && last !== undefined) {
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(xOf(view, view.t0), yOf(view, first.value));
      ctx.lineTo(xOf(view, first.time), yOf(view, first.value));
      ctx.moveTo(xOf(view, last.time), yOf(view, last.value));
      ctx.lineTo(xOf(view, view.t1), yOf(view, last.value));
      ctx.stroke();
      ctx.restore();
    }

    // The keys themselves, on top of the lines.
    for (const key of channel.keys) {
      const picked = this.picked?.channel === channel.id && this.picked.index === key.index;
      const x = xOf(view, key.time);
      const y = yOf(view, key.value);
      ctx.beginPath();
      ctx.arc(x, y, picked ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = picked ? '#ffffff' : channel.color;
      ctx.fill();
      ctx.lineWidth = picked ? 3 : 2;
      ctx.strokeStyle = channel.color;
      ctx.stroke();
    }
  }

  /** The two handles of the segment that leaves the picked key. */
  private drawHandles(ctx: CanvasRenderingContext2D, view: View): void {
    const found = this.pickedSegment();
    const point = this.pickedControls();
    if (found === null || point === null) return;
    const { key, next } = found;

    const ends: Array<[number, number, number, number]> = [
      [xOf(view, key.time), yOf(view, key.value), xOf(view, point.cx1), yOf(view, point.cy1)],
      [xOf(view, next.time), yOf(view, next.value), xOf(view, point.cx2), yOf(view, point.cy2)],
    ];
    for (const [x0, y0, x1, y1] of ends) {
      ctx.strokeStyle = '#45505e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#10151c';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.rect(x1 - 5, y1 - 5, 10, 10);
      ctx.fill();
      ctx.stroke();
    }
  }

  /**
   * The two handles the picked segment shows, or `null` when it shows none.
   *
   * A straight segment has no control points in the file, but it must still
   * offer something to grab, or the only way to bend it would be a preset. So
   * `linear` shows the chord written as handles (`toBezier`), which sits
   * exactly on the line already drawn: nothing moves until the user drags.
   *
   * `stepped` shows none. A step is not a shape with a middle, and handles
   * hovering off a step would be a lie about what the file holds. The way out
   * of a step is a preset button, which says so in words.
   */
  private pickedControls(): ControlPoints | null {
    const found = this.pickedSegment();
    if (found === null) return null;
    const { channel, key, next } = found;
    const shape = resolveCurve(key.curve, channel.components, true, key.time, next.time);
    if (shape.kind === 'stepped') return null;
    const ready = toBezier(shape, key.time, next.time, key.values, next.values);
    return ready.points[channel.component] ?? null;
  }

  /** The picked key together with the key after it, or `null`. */
  private pickedSegment(): { channel: Channel; key: ChannelKey; next: ChannelKey } | null {
    const channel = this.pickedChannel();
    const key = this.pickedKey();
    if (channel === null || key === null) return null;
    const at = channel.keys.indexOf(key);
    const next = at < 0 ? undefined : channel.keys[at + 1];
    if (next === undefined) return null;
    return { channel, key, next };
  }

  // -------------------------------------------------------------------------
  // Pointer
  // -------------------------------------------------------------------------

  /** Canvas coordinates of a pointer event, in CSS pixels. */
  private positionOf(event: PointerEvent): { x: number; y: number } | null {
    const canvas = this.canvas;
    if (canvas === null) return null;
    const box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  private onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const view = this.view();
    const at = this.positionOf(event);
    if (view === null || at === null) return;

    const handle = this.handleAt(view, at.x, at.y);
    if (handle !== null) {
      this.drag = {
        ...handle,
        pointerId: event.pointerId,
        fromX: at.x,
        fromY: at.y,
        // The handles need the slop too: clicking one to look at it used to
        // rewrite the curve on the spot, the same defect the keys had.
        armed: false,
        freeTime: event.altKey,
      };
      this.canvas?.setPointerCapture(event.pointerId);
      event.preventDefault();
      return;
    }

    const key = this.keyAt(view, at.x, at.y);
    if (key === null) {
      this.picked = null;
      this.renderNote();
      this.draw();
      return;
    }
    this.picked = key;
    this.shareFocus(key);
    this.drag = {
      kind: 'key',
      channel: key.channel,
      index: key.index,
      pointerId: event.pointerId,
      fromX: at.x,
      fromY: at.y,
      armed: false,
      freeTime: event.altKey,
    };
    this.canvas?.setPointerCapture(event.pointerId);
    this.renderNote();
    this.draw();
    event.preventDefault();
  }

  private onPointerMove(event: PointerEvent): void {
    const view = this.view();
    const at = this.positionOf(event);
    if (view === null || at === null) return;
    if (this.drag === null) {
      this.showReadout(view, at.x, at.y);
      return;
    }
    if (!this.drag.armed) {
      if (!pastSlop(this.drag, at.x, at.y)) return;
      this.drag.armed = true;
    }
    this.drag.freeTime = event.altKey;
    if (this.drag.kind === 'key') this.dragKey(view, at.x, at.y);
    else this.dragHandle(view, at.x, at.y, this.drag.kind);
    event.preventDefault();
  }

  private onPointerUp(event: PointerEvent): void {
    if (this.drag === null) return;
    this.canvas?.releasePointerCapture?.(event.pointerId);
    this.drag = null;
    // The next drag has to be its own step of undo.
    (this.doc as (EditorDoc & { endMerge?: () => void }) | null)?.endMerge?.();
  }

  /** The handle of the picked segment under `(x, y)`, or `null`. */
  private handleAt(view: View, x: number, y: number): { kind: DragKind; channel: string; index: number } | null {
    const found = this.pickedSegment();
    const point = this.pickedControls();
    if (found === null || point === null) return null;
    const { channel, key } = found;
    // Whichever handle is nearer wins, so two handles sitting on top of each
    // other still pick the one the user aimed at.
    const first = Math.hypot(x - xOf(view, point.cx1), y - yOf(view, point.cy1));
    const second = Math.hypot(x - xOf(view, point.cx2), y - yOf(view, point.cy2));
    const nearest = Math.min(first, second);
    if (nearest > GRAB_RADIUS) return null;
    return {
      kind: first <= second ? 'first' : 'second',
      channel: channel.id,
      index: key.index,
    };
  }

  /** The key under `(x, y)`, searching the visible lines only. */
  private keyAt(view: View, x: number, y: number): KeyPick | null {
    let best: KeyPick | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const channel of this.channels) {
      if (!channel.visible) continue;
      for (const key of channel.keys) {
        const dx = x - xOf(view, key.time);
        const dy = y - yOf(view, key.value);
        const distance = Math.hypot(dx, dy);
        if (distance <= GRAB_RADIUS && distance < bestDistance) {
          bestDistance = distance;
          best = { channel: channel.id, index: key.index };
        }
      }
    }
    return best;
  }

  // -------------------------------------------------------------------------
  // The readout under the cursor
  // -------------------------------------------------------------------------

  private showReadout(view: View, x: number, y: number): void {
    const readout = this.readout;
    if (readout === null) return;
    const time = timeAt(view, x);
    const value = valueAtY(view, y);
    const key = this.keyAt(view, x, y);
    const channel = key === null ? null : this.channelById(key.channel);
    const suffix = channel === null ? '' : `  ·  chave de ${channel.label}`;
    this.hovering = true;
    readout.textContent = `Tempo ${formatSeconds(time)}  ·  Valor ${formatNumber(value)}${suffix}`;
  }

  /** O cursor saiu da área: a linha volta a dizer o que fazer (G-Q7). */
  private clearReadout(): void {
    this.hovering = false;
    if (this.readout !== null) this.readout.textContent = this.noteText;
  }

  // -------------------------------------------------------------------------
  // Writing into the file
  // -------------------------------------------------------------------------

  /**
   * Drags a key: new time, new value, one step of undo.
   *
   * The time is kept strictly between the neighbours, because spec 9.1 wants
   * the keys of a timeline in strictly increasing order and a drag must not be
   * able to reorder the array under the user. It is also kept inside the
   * animation, so a drag never silently lengthens it.
   */
  private dragKey(view: View, x: number, y: number): void {
    const doc = this.doc;
    const animation = doc?.animation ?? null;
    const channel = this.drag === null ? null : this.channelById(this.drag.channel);
    if (doc === null || animation === null || channel === null || this.drag === null) return;
    const at = channel.keys.findIndex((key) => key.index === this.drag?.index);
    const key = at < 0 ? undefined : channel.keys[at];
    if (key === undefined) return;

    const previous = channel.keys[at - 1];
    const next = channel.keys[at + 1];
    const low = previous === undefined ? view.t0 : previous.time + MIN_GAP;
    const high = next === undefined ? view.t1 : next.time - MIN_GAP;
    // Snap to the frame grid, the same grid the timeline rules and counts by.
    // Free time (Alt held) is for the rare key that has to sit between frames.
    const time = keyDropTime(timeAt(view, x), fpsOf(doc), this.drag.freeTime, low, high);
    const value = roundTo(valueAtY(view, y), 4);

    let written: KeyValue;
    if (channel.components > 1) {
      const numbers = key.values.slice();
      numbers[channel.component] = value;
      written = numbers;
    } else {
      written = value;
    }
    doc.run(new DragKey(animation, channel.target, key.time, time, written));
    this.render();
  }

  /**
   * Drags one handle of the segment that leaves the picked key.
   *
   * A segment that was `linear` or `stepped` grows handles first (`toBezier`),
   * which does not move the drawing, and only then takes the drag. The result
   * goes through the clamp of 9.3 before it is written, so the file never holds
   * control points a reader would have to fix.
   */
  private dragHandle(view: View, x: number, y: number, which: DragKind): void {
    const doc = this.doc;
    const animation = doc?.animation ?? null;
    const found = this.pickedSegment();
    if (doc === null || animation === null || found === null) return;
    const { channel, key, next } = found;

    const base = toBezier(
      resolveCurve(key.curve, channel.components, true, key.time, next.time),
      key.time, next.time, key.values, next.values,
    );
    const point = base.points[channel.component];
    if (point === undefined) return;

    const cx = roundTo(timeAt(view, x), 4);
    const cy = roundTo(valueAtY(view, y), 4);
    const moved: ControlPoints = which === 'first'
      ? { cx1: cx, cy1: cy, cx2: point.cx2, cy2: point.cy2 }
      : { cx1: point.cx1, cy1: point.cy1, cx2: cx, cy2: cy };
    const shape = withPoint(base, channel.component, clampControls(moved, key.time, next.time));

    doc.run(new SetKey(animation, key.time, channel.target, key.raw, {
      curve: writeCurve(shape),
      label: 'Mudar a curva',
      mergeable: true,
    }));
    this.render();
  }

  /** A preset button: writes the whole `curve` field of the picked key. */
  private applyPreset(id: string): void {
    const doc = this.doc;
    const animation = doc?.animation ?? null;
    const found = this.pickedSegment();
    if (doc === null || animation === null || found === null) return;
    const preset = CURVE_PRESETS.find((item) => item.id === id);
    if (preset === undefined) return;
    const { channel, key, next } = found;
    doc.run(new SetKey(animation, key.time, channel.target, key.raw, {
      curve: presetCurve(preset, key.time, next.time, key.values, next.values),
      label: `Curva ${preset.label}`,
      mergeable: false,
    }));
    this.render();
  }
}

// ---------------------------------------------------------------------------
// Small pure helpers the panel leans on
// ---------------------------------------------------------------------------

/** The smallest gap a drag may leave between two keys: one millisecond. */
const MIN_GAP = 0.001;

function clampNumber(value: number, low: number, high: number): number {
  return value < low ? low : value > high ? high : value;
}

/** Drops float dust, so the file keeps numbers a person can read. */
function roundTo(value: number, digits: number): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

/** `true` when the tree selection covers what this timeline plays. */
function isSelected(
  target: TimelineTarget,
  bones: Set<string>, slots: Set<string>, constraints: Set<string>,
): boolean {
  const name = target.target ?? '';
  if (target.type === 'bone') return bones.has(name);
  if (target.type === 'slot') return slots.has(name);
  if (target.type === 'constraint') return constraints.has(name);
  // Parameters, morphs and variables belong to nobody in the tree, so they are
  // only offered while the user has selected nothing.
  return false;
}

/** One component of one key, read out of the JSON. */
function readKey(key: KeyDef, index: number, component: number, components: number): ChannelKey {
  const raw = key.value;
  const values: number[] = [];
  if (Array.isArray(raw)) {
    for (let j = 0; j < components; j++) values.push(Number(raw[j] ?? 0));
  } else {
    values.push(typeof raw === 'number' ? raw : 0);
  }
  return {
    index,
    time: key.time,
    value: values[component] ?? 0,
    values,
    raw: key.value,
    curve: key.curve,
  };
}

/** What the legend writes: owner, property and, for a colour, which part. */
function channelLabel(target: TimelineTarget, property: string, component: number): string {
  const owner = target.target ?? '';
  const part = target.property === 'color' || target.property === 'darkColor'
    ? ` ${COLOR_PARTS[component] ?? String(component + 1)}`
    : '';
  return owner === '' ? `${property}${part}` : `${owner} — ${property}${part}`;
}

function channelColor(target: TimelineTarget, component: number, spare: number): string {
  if (target.property === 'color' || target.property === 'darkColor') {
    return COLOR_PART_COLORS[component] ?? SPARE_COLORS[spare % SPARE_COLORS.length] ?? '#1a4fd8';
  }
  const named = PROPERTY_COLORS[target.property ?? ''];
  if (named !== undefined) return named;
  return SPARE_COLORS[spare % SPARE_COLORS.length] ?? '#1a4fd8';
}

export const graphPanel = new GraphPanel();
registerPanel(graphPanel);

/** Um número do eixo do gráfico, para o rodapé: duas casas, vírgula. */
function fmtFaixa(valor: number): string {
  return (Math.round(valor * 100) / 100).toLocaleString('pt-BR');
}
