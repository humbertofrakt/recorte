/**
 * "Arquivo → Exportar imagem…" (owner C, requisito E5).
 *
 * QUATRO SAÍDAS, UMA JANELA
 * | Formato          | O que sai                                             |
 * |:-----------------|:------------------------------------------------------|
 * | Sequência de PNG | Um arquivo por quadro, numerado.                       |
 * | Folha de sprites | Uma imagem com a grade, mais o JSON dizendo onde cada  |
 * |                  | quadro está.                                           |
 * | GIF animado      | Um arquivo só, que toca sozinho em qualquer lugar.     |
 * | Vídeo WebM       | Um `.webm`, gravado pelo `MediaRecorder` do navegador  |
 * |                  | (lote 43). Só no editor: a linha de comando não tem    |
 * |                  | navegador.                                             |
 *
 * MP4 E AVI NÃO SAEM DAQUI, e a janela diz isso com todas as letras (decisão
 * do Humberto, 10/09/2026). O WebM não pede dependência: quem codifica é o
 * navegador. O tempo dele é o do relógio, não quadro a quadro; para quadro
 * exato, a sequência de PNG, e o comando do ffmpeg continua pronto na tela.
 *
 * QUEM FAZ O QUÊ
 * O corte da borda vazia, a grade da folha e o GIF inteiro (paleta, LZW,
 * atraso, laço) são `ferramentas/src/exportar/quadros.ts` — o MESMO módulo que
 * a linha de comando usa, sem uma linha de Node dentro. Aqui só se desenha:
 * o `CanvasRenderer` do runtime, o mesmo do viewport, num canvas fora da tela.
 * Assim a imagem exportada é a imagem que o artista viu.
 */

import {
  CanvasRenderer, Skeleton, applyResets, pose,
  type AnimationData, type AtlasPageData,
} from '../../../runtime/src/index.js';
import {
  autoCropFrames, buildSpriteSheet, cameraFor, encodeGif, frameFileName, frameTimes,
  unionBox,
  type Box, type FrameCamera, type RgbaFrame, type SheetIndex,
} from '../../../ferramentas/src/exportar/quadros.js';
import { el } from '../ui/dom.js';
import type { Doc } from '../doc/document.js';
import { stem } from './save-binary.js';
import { projectFolder } from './project-folder.js';
import { writeZip } from '../../../ferramentas/src/binario/bonez.js';

// ---------------------------------------------------------------------------
// The options, and what the format names mean
// ---------------------------------------------------------------------------

/** Which of the four shapes to write. */
export type ImageFormat = 'png' | 'folha' | 'gif' | 'webm';

/** Written out, because a three-letter code is not a label. */
export const FORMAT_LABELS: Readonly<Record<ImageFormat, string>> = Object.freeze({
  png: 'Sequência de imagens PNG',
  folha: 'Folha de sprites, com o índice em JSON',
  gif: 'GIF animado',
  webm: 'Vídeo WebM',
});

export interface ImageExportOptions {
  /** Which animation to draw. */
  animation: string;
  format: ImageFormat;
  fps: number;
  /** Pixels per world unit. */
  scale: number;
  /** `"#rrggbb"`, or `null` for a see-through background. */
  background: string | null;
  /** `true` throws the empty border away, the same box for every frame. */
  autoCrop: boolean;
  /**
   * **As duas opções de recorte** — degrau 10, tarefa 10.4 (F16, Q21, spec
   * §4.6 e `ARQUITETO 3` §8).
   *
   * | Valor | O que sai |
   * |:---|:---|
   * | `'borda'` | corte automático da borda vazia — **o padrão**, o de sempre |
   * | `'animacao'` | o retângulo `crop` gravado nesta animação, em unidades do esqueleto |
   *
   * Opcional porque as opções guardadas para o `Ctrl+Shift+E` antes deste
   * degrau não têm o campo; ausente vale `'borda'`, e o `autoCrop` continua
   * mandando ali, como sempre mandou. Animação **sem** `crop` com
   * `'animacao'` escolhido não inventa retângulo nenhum: cai na borda
   * automática e **avisa** (regra 21).
   */
  crop?: 'borda' | 'animacao';
  /** Frames per row on the sheet. `null` picks the squarest grid. */
  columns: number | null;
  /** How many times the GIF plays. `0` is forever. */
  loop: number;
  /** Colours of the GIF palette, at most 256. */
  maxColors: number;
  /** `true` draws the bone lines too. Off by default: an export is art. */
  bones: boolean;
  /**
   * Primeiro segundo a desenhar — lote 41. `null` ou ausente = o começo.
   *
   * Opcional porque as opções guardadas para o `Ctrl+Shift+E` antes deste
   * lote não têm o campo, e continuam valendo como estavam.
   */
  from?: number | null;
  /** Último segundo, sem ele. `null` ou ausente = o fim da animação. */
  to?: number | null;
  /** `true` exporta todas as animações: um arquivo, ou uma sequência, por animação. */
  all?: boolean;
  /**
   * Quantas vezes a animação toca dentro do vídeo WebM — lote 43. Ausente = 1.
   * Não é o `loop` do GIF: o GIF repete ao tocar, o vídeo grava as voltas.
   */
  videoLoops?: number;
  /**
   * Sequência de PNG num `.zip` só — lote 51. Ausente = sim: um download,
   * e o navegador não pede permissão para baixar doze arquivos.
   */
  zip?: boolean;
  /**
   * **Só este quadro** — rodada 45, lote 2 (doc `57`, T4). O segundo da pose a
   * desenhar, uma imagem só. `null` ou ausente = o trecho de De até Até. A
   * janela põe aqui a agulha. Antes, a pose de agora só saía com o truque de
   * "Até 0,03 s"; "De 0 até 0" era recusado.
   */
  frame?: number | null;
  /**
   * **Margem, em px** — rodada 45, lote 2 (2.4). O espaço vazio em volta do
   * desenho, depois do corte, de 0 a 64. Ausente = 0. O Spine chama de
   * "pad"; o DragonBones, de espaço entre as peças.
   */
  margin?: number;
}

/** A faixa da margem, em px. */
export const MARGIN_RANGE = { min: 0, max: 64 } as const;

/**
 * **A base, a pose de repouso** — rodada 45, lote 5 (prova final). Um projeto
 * novo não tem animação, e a janela dizia "Este arquivo não tem animação
 * nenhuma para exportar": a imagem da pose, que é o primeiro objetivo, não
 * saía. Este valor no lugar do nome da animação desenha a base, uma imagem só.
 */
export const BASE_POSE = 'recorte:base';
export const BASE_POSE_LABEL = 'A base (pose de repouso)';

/** Sensible options for the document as it is right now. */
export function defaultImageOptions(doc: Doc): ImageExportOptions {
  const animations = doc.data?.animations ?? [];
  const first = doc.animation ?? animations[0]?.name ?? BASE_POSE;
  return {
    animation: first,
    format: 'gif',
    fps: 30,
    scale: 1,
    background: null,
    autoCrop: true,
    crop: 'borda',
    columns: null,
    loop: 0,
    maxColors: 256,
    bones: false,
    from: null,
    to: null,
    all: false,
    videoLoops: 1,
    zip: true,
    frame: null,
    margin: 0,
  };
}

// ---------------------------------------------------------------------------
// The names of the files that will come out — pure, so a test can read them
// ---------------------------------------------------------------------------

/**
 * What this export will write, in order. `base` is the file name without
 * folder and without extension.
 */
export function outputNames(base: string, format: ImageFormat, frameCount: number): string[] {
  if (format === 'gif') return [`${base}.gif`];
  if (format === 'webm') return [`${base}.webm`];
  if (format === 'folha') return [`${base}.png`, `${base}.json`];
  // Rodada 50, lote 2 (doc 98, item A): uma imagem só sai com o nome limpo,
  // `heroi.png`, e não `heroi_0000.png` — o número é de sequência, e um quadro
  // só não é sequência.
  if (frameCount === 1) return [`${base}.png`];
  const names: string[] = [];
  for (let i = 0; i < frameCount; i++) names.push(frameFileName(base, i));
  return names;
}

// ---------------------------------------------------------------------------
// As duas opções de recorte — degrau 10, tarefa 10.4 (F16, Q21)
// ---------------------------------------------------------------------------

/** Os dois recortes que a janela oferece, escritos por extenso. */
export const CROP_LABELS: Readonly<Record<'borda' | 'animacao', string>> = Object.freeze({
  borda: 'Cortar a borda vazia (automático)',
  animacao: 'A área desenhada nesta animação',
});

/** O que uma animação tem gravado como área de recorte (spec 4.6), ou `null`. */
export interface CropChoice {
  /** O retângulo em unidades do esqueleto, ou `null` = corte automático. */
  box: Box | null;
  warnings: string[];
}

/**
 * **Qual dos dois recortes vale, para esta animação** (10.4).
 *
 * O padrão é o de sempre: cortar a borda vazia. Pedindo `'animacao'`, vale o
 * `crop` gravado na animação (4.6), em unidades do esqueleto, canto inferior
 * esquerdo — o mesmo retângulo que a cena desenha em magenta.
 *
 * **Animação sem `crop` não vira palpite.** Ela cai no corte automático e diz
 * por quê, porque um retângulo inventado sairia parecendo o que o artista
 * pediu — e é exatamente isso que a regra 21 proíbe.
 */
export function cropChoice(
  options: Pick<ImageExportOptions, 'crop'>,
  animation: { name: string; crop?: { x: number; y: number; width: number; height: number } | null },
): CropChoice {
  if (options.crop !== 'animacao') return { box: null, warnings: [] };
  const crop = animation.crop ?? null;
  if (crop === null) {
    return {
      box: null,
      warnings: [`A animação "${animation.name}" não tem área desenhada. `
        + 'Ela saiu com o corte automático da borda.'],
    };
  }
  if (!(crop.width > 0) || !(crop.height > 0)) {
    return {
      box: null,
      warnings: [`A área desenhada de "${animation.name}" tem lado zero `
        + `(${crop.width} × ${crop.height}). Ela saiu com o corte automático da borda.`],
    };
  }
  return { box: { x: crop.x, y: crop.y, width: crop.width, height: crop.height }, warnings: [] };
}

/** The ffmpeg line, with the real name and the real frame rate in it. */
export function ffmpegLine(base: string, fps: number): string {
  return `ffmpeg -framerate ${fps} -i ${base}_%04d.png -c:v libx264 -pix_fmt yuv420p ${base}.mp4`;
}

// ---------------------------------------------------------------------------
// Vídeo WebM — lote 43, a parte que decide, pura
// ---------------------------------------------------------------------------

/** A frase que a janela e o resumo dizem sempre que o formato é WebM. */
export const WEBM_CLOCK_NOTE =
  'O tempo é o do relógio do navegador, não quadro a quadro. Para quadro exato, use a sequência de PNG.';

/** O que a gravação vai durar. */
export interface WebmPlan {
  /** Segundos de vídeo: a duração vezes as voltas. */
  seconds: number;
  /** Quadros que a gravação mostra, contando as voltas. */
  frames: number;
  /** Voltas, já inteiras e no mínimo 1. */
  loops: number;
  /** Intervalo entre dois quadros, em milissegundos. */
  frameMs: number;
}

/**
 * **Quanto o vídeo grava.** `duration` é o trecho desenhado, em segundos; o
 * gravador passa por ele `loops` vezes, no relógio do navegador. Voltas e
 * quadros por segundo errados não são recusados: voltam ao menor que faz
 * sentido (1 volta, 30 por segundo), porque o campo da janela já limita.
 */
export function webmPlan(options: { duration: number; fps: number; loops?: number }): WebmPlan {
  const fps = Number.isFinite(options.fps) && options.fps > 0 ? options.fps : 30;
  const raw = options.loops ?? 1;
  const loops = Number.isFinite(raw) && raw >= 1 ? Math.round(raw) : 1;
  const duration = Number.isFinite(options.duration) && options.duration > 0 ? options.duration : 0;
  return {
    seconds: duration * loops,
    frames: Math.round(duration * fps) * loops,
    loops,
    frameMs: 1000 / fps,
  };
}

/** O pedaço do navegador que a gravação usa. `window` serve; um teste passa um objeto. */
export interface WebmEnv {
  MediaRecorder?: { isTypeSupported?(type: string): boolean } | undefined;
  /** `false` quando o canvas não tem `captureStream`. Ausente = não se sabe, conta como tem. */
  captureStream?: boolean;
}

/** Os tipos que se tenta, do melhor para o mais simples. */
const WEBM_TYPES = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'] as const;

/** Se dá para gravar, com que tipo, ou por que não — o motivo vai na dica do item. */
export type WebmSupport =
  | { ok: true; mimeType: string }
  | { ok: false; reason: string };

export function webmSupport(env: WebmEnv): WebmSupport {
  const recorder = env.MediaRecorder;
  if (recorder === undefined || recorder === null) {
    return { ok: false, reason: 'Este navegador não tem gravador de vídeo (MediaRecorder). Use Chrome, Edge ou Firefox.' };
  }
  if (env.captureStream === false) {
    return { ok: false, reason: 'Este navegador não deixa gravar um canvas (captureStream). Use Chrome, Edge ou Firefox.' };
  }
  const check = recorder.isTypeSupported;
  if (typeof check !== 'function') return { ok: true, mimeType: 'video/webm' };
  for (const type of WEBM_TYPES) {
    if (check.call(recorder, type)) return { ok: true, mimeType: type };
  }
  return { ok: false, reason: 'Este navegador grava vídeo, mas não em WebM. Use Chrome, Edge ou Firefox.' };
}

export function canRecordWebm(env: WebmEnv): boolean {
  return webmSupport(env).ok;
}

/** O navegador de verdade, no formato que `webmSupport` lê. */
function browserWebmEnv(): WebmEnv {
  const scope = globalThis as { MediaRecorder?: WebmEnv['MediaRecorder']; HTMLCanvasElement?: { prototype: object } };
  return {
    MediaRecorder: scope.MediaRecorder,
    captureStream: scope.HTMLCanvasElement === undefined
      ? false
      : typeof (scope.HTMLCanvasElement.prototype as { captureStream?: unknown }).captureStream === 'function',
  };
}

// ---------------------------------------------------------------------------
// O plano: que animação, que trecho, que nome — lote 41, puro
// ---------------------------------------------------------------------------

/** Uma animação desenhada num arquivo (ou numa sequência) só. */
export interface ExportTask {
  animation: string;
  /** Nome do arquivo, sem pasta e sem extensão: `heroi`, ou `heroi-walk`. */
  base: string;
  /** Os instantes a desenhar, em segundos. */
  times: number[];
}

/**
 * O plano, ou a recusa escrita. `field` diz qual campo da janela volta ao que
 * era: o De, o Até, os dois (`range`), ou a escolha da animação.
 */
export type ExportPlan =
  | { ok: true; tasks: ExportTask[] }
  | { ok: false; message: string; field: 'from' | 'to' | 'range' | 'animation' | 'frame' };

/** Segundos para ler: vírgula, até três casas. */
export function formatSeconds(value: number): string {
  return String(Math.round(value * 1000) / 1000).replace('.', ',');
}

/**
 * **O que a exportação vai desenhar** — a linha de comando faz isto desde a
 * fase 7 (`--de`, `--ate`, `--todas`); a janela, só a partir deste lote.
 *
 * - **Todas as animações**: uma tarefa por animação, na ordem do arquivo, com
 *   o nome `heroi-walk`. De e Até não valem aqui — cada animação tem a sua
 *   duração, e um trecho que serve para uma corta a outra no meio.
 * - Uma só: o trecho de De até Até, **sem** o Até, como o `frameTimes` sempre
 *   fez com a duração. Nome `heroi`, como antes.
 *
 * Recusa por escrito, e nunca adivinha: De negativo, Até depois do fim, De
 * que não é menor que Até.
 */
export function exportPlan(
  options: {
    animation: string; fps: number; from?: number | null; to?: number | null; all?: boolean;
    frame?: number | null;
  },
  animations: ReadonlyArray<{ name: string; duration: number }>,
  base: string,
): ExportPlan {
  const fps = options.fps > 0 ? options.fps : 30;
  // Rodada 45, lote 5: a base é uma imagem só, a pose de repouso.
  if (options.animation === BASE_POSE) return { ok: true, tasks: [{ animation: BASE_POSE, base, times: [0] }] };
  // Rodada 45, lote 2: **Só este quadro** — uma imagem, a pose de um instante.
  if (options.all !== true && options.frame !== null && options.frame !== undefined) {
    const chosen = animations.find((entry) => entry.name === options.animation);
    if (chosen === undefined) {
      return {
        ok: false, message: `A animação "${options.animation}" não existe neste arquivo.`, field: 'animation',
      };
    }
    const t = options.frame;
    if (!Number.isFinite(t) || t < 0 || t > chosen.duration + 1e-9) {
      return {
        ok: false,
        message: `O quadro tem de estar entre 0 e ${formatSeconds(chosen.duration)} s: ${chosen.name} tem ${formatSeconds(chosen.duration)} s.`,
        field: 'frame',
      };
    }
    return { ok: true, tasks: [{ animation: chosen.name, base, times: [t] }] };
  }
  if (options.all === true) {
    if (animations.length === 0) {
      return { ok: false, message: 'Este arquivo não tem animação nenhuma.', field: 'animation' };
    }
    return {
      ok: true,
      tasks: animations.map((entry) => ({
        animation: entry.name,
        base: `${base}-${entry.name}`,
        times: frameTimes({ duration: entry.duration, fps }),
      })),
    };
  }

  const chosen = animations.find((entry) => entry.name === options.animation);
  if (chosen === undefined) {
    return {
      ok: false, message: `A animação "${options.animation}" não existe neste arquivo.`, field: 'animation',
    };
  }
  const from = options.from ?? 0;
  const to = options.to ?? chosen.duration;
  if (!Number.isFinite(from) || from < 0) {
    return { ok: false, message: 'De não pode ser menor que zero.', field: 'from' };
  }
  if (!Number.isFinite(to) || to > chosen.duration + 1e-9) {
    return {
      ok: false,
      message: `Até passa do fim: ${chosen.name} tem ${formatSeconds(chosen.duration)} s.`,
      field: 'to',
    };
  }
  if (from >= to) {
    return {
      ok: false,
      message: `De (${formatSeconds(from)} s) tem de ser menor que Até (${formatSeconds(to)} s).`,
      field: 'range',
    };
  }
  return {
    ok: true,
    tasks: [{
      animation: chosen.name,
      base,
      times: frameTimes({ duration: chosen.duration, fps, from, to }),
    }],
  };
}

/** `true` quando as opções pedem um trecho, e não a animação inteira. */
function isRange(options: ImageExportOptions): boolean {
  return options.all !== true && !isOneFrame(options)
    && ((options.from ?? 0) > 0 || (options.to !== null && options.to !== undefined));
}

/**
 * **Só este quadro leva o formato para PNG** — rodada 50, lote 2 (doc `98`,
 * item A). Marcar a caixa com o GIF escolhido saía um `heroi.gif` de um quadro
 * só: quem pede "só este quadro" quer uma imagem. A caixa marcada troca GIF,
 * folha e WebM por PNG, e guarda o de antes; desmarcada, devolve o de antes —
 * a não ser que a pessoa tenha escolhido outro formato no meio, e aí manda ela.
 */
export function formatoComQuadro(
  atual: ImageFormat, umQuadro: boolean, antes: ImageFormat | null,
): { format: ImageFormat; antes: ImageFormat | null } {
  if (umQuadro) {
    if (atual !== 'png' && antes === null) return { format: 'png', antes: atual };
    return { format: atual, antes };
  }
  if (antes !== null && atual === 'png') return { format: antes, antes: null };
  return { format: atual, antes: null };
}

/** `true` quando as opções pedem **Só este quadro** (rodada 45, lote 2). */
export function isOneFrame(options: Pick<ImageExportOptions, 'all' | 'frame'>): boolean {
  return options.all !== true && options.frame !== null && options.frame !== undefined;
}

/**
 * **A margem em volta do desenho**, em px — rodada 45, lote 2 (2.4). O quadro
 * cresce `margin` px de cada lado; o novo é transparente, ou da cor do fundo.
 * Puro: um teste o roda sem navegador.
 */
export function withMargin(frame: RgbaFrame, margin: number, background: string | null): RgbaFrame {
  const m = Math.max(MARGIN_RANGE.min, Math.min(MARGIN_RANGE.max, Math.round(margin)));
  if (m === 0) return frame;
  const width = frame.width + 2 * m;
  const height = frame.height + 2 * m;
  const rgba = new Uint8Array(width * height * 4);
  if (background !== null) {
    const hex = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(background);
    const [r, g, b] = hex === null ? [255, 255, 255] : [1, 2, 3].map((i) => parseInt(hex[i]!, 16));
    for (let i = 0; i < rgba.length; i += 4) {
      rgba[i] = r!; rgba[i + 1] = g!; rgba[i + 2] = b!; rgba[i + 3] = 255;
    }
  }
  for (let y = 0; y < frame.height; y++) {
    rgba.set(frame.rgba.subarray(y * frame.width * 4, (y + 1) * frame.width * 4), ((y + m) * width + m) * 4);
  }
  return frame.time === undefined ? { width, height, rgba } : { width, height, rgba, time: frame.time };
}

// ---------------------------------------------------------------------------
// Drawing the frames
// ---------------------------------------------------------------------------

/** One finished file, ready to hand to the browser. */
export interface ExportedFile {
  name: string;
  blob: Blob;
}

export interface ImageExportResult {
  files: ExportedFile[];
  frameCount: number;
  width: number;
  height: number;
  /** Only for the sheet. `null` otherwise. */
  index: SheetIndex | null;
  warnings: string[];
  /** As animações desenhadas, na ordem. Uma, ou todas — lote 41. */
  animations: string[];
  /** O nome base de cada uma, para a linha do ffmpeg. */
  bases: string[];
  /**
   * O tamanho do quadro DE CADA animação, na ordem — N-6 (29/09/2026). Com
   * "Todas as animações" cada uma sai do seu tamanho (o recorte é por
   * animação), e `width`/`height` acima são só os da primeira. Opcional: um
   * resultado montado à mão sem ele fala como antes.
   */
  sizes?: Array<{ animation: string; width: number; height: number }>;
}

/** How far along the export is, so the bar can move. */
export type ExportProgress = (done: number, total: number, step: string) => void;

/**
 * Poses a fresh skeleton at `time`.
 *
 * It advances from zero in small steps instead of jumping: the physics of §6.5
 * depends on the history, not on the instant, and a GIF made of jumps has a
 * cape that never settles. `from` says where the last frame stopped, so the
 * whole sequence costs ONE simulation and not one per frame.
 */
function poseAt(
  skeleton: Skeleton, animation: AnimationData, time: number, step: number, from: number | null,
): void {
  let previous = from === null ? -Infinity : from;
  let t = from === null ? 0 : from;
  for (;;) {
    pose(skeleton, animation, t, t);
    applyResets(skeleton, animation, previous, t, false);
    previous = t;
    if (t >= time) break;
    t = Math.min(time, t + step);
  }
}

/**
 * O esqueleto que a exportação desenha, **com a pilha de peles do editor**.
 *
 * Degrau 9 (18/09/2026, spec §4.4): a `default` virou uma pele como as outras,
 * e **pode sair da pilha** (I10) — é o que o lobisomem faz, trocando quase toda
 * a arte do homem. O caminho velho era `setSkin`, a compatibilidade que põe a
 * `default` por baixo de tudo sempre; com ela, a exportação punha na imagem a
 * arte que a cena já não mostra. Uma imagem exportada diferente do que o
 * artista vê é a pior das três caras da regra 21, porque ninguém descobre no
 * editor: descobre no jogo.
 *
 * A pilha é `doc.pilha` — o mesmo campo que a cena e a Prévia leem. Peles que
 * já não existem no arquivo saem da lista antes, para uma pele apagada não
 * derrubar a exportação inteira.
 */
export function freshSkeleton(doc: Doc): Skeleton | null {
  const data = doc.data;
  if (data === null) return null;
  const skeleton = new Skeleton(data);
  const conhecidas = new Set((doc.file.skins ?? []).map((skin) => skin.name));
  const pilha: string[] = [];
  for (const name of doc.pilha ?? []) {
    if (!conhecidas.has(name) || pilha.includes(name)) continue;
    pilha.push(name);
  }
  try {
    skeleton.setSkinStack(pilha);
  } catch {
    // A skin that vanished is not worth refusing the export for.
  }
  skeleton.setToSetupPose();
  skeleton.updateWorldTransform(0);
  return skeleton;
}

/** A caixa da base, na pose de repouso — rodada 45, lote 5. */
function baseBounds(doc: Doc): Box {
  return freshSkeleton(doc)?.getBounds() ?? { x: 0, y: 0, width: 1, height: 1 };
}

/** The box every frame of the animation draws inside, in world units. */
export function boundsOverAnimation(
  doc: Doc, animation: AnimationData, times: readonly number[], step: number,
): Box {
  const skeleton = freshSkeleton(doc);
  if (skeleton === null) return { x: 0, y: 0, width: 1, height: 1 };
  let box: Box | null = skeleton.getBounds();
  let previous: number | null = null;
  for (const time of times) {
    poseAt(skeleton, animation, time, step, previous);
    previous = time;
    skeleton.updateWorldTransform(0);
    box = unionBox(box, skeleton.getBounds());
  }
  return box ?? { x: 0, y: 0, width: 1, height: 1 };
}

/** A canvas of the camera's size, with the world transform already set. */
function stageFor(camera: FrameCamera, background: string | null): CanvasRenderingContext2D | null {
  const canvas = document.createElement('canvas');
  canvas.width = camera.width;
  canvas.height = camera.height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;
  if (background !== null) {
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // Y sobe no arquivo e desce no canvas (§3.3).
  ctx.setTransform(
    camera.scale, 0, 0, -camera.scale,
    -camera.originX * camera.scale,
    camera.height + camera.originY * camera.scale,
  );
  return ctx;
}

/** The pixels of a canvas as a straight RGBA buffer. */
function readPixels(ctx: CanvasRenderingContext2D, time: number): RgbaFrame {
  const canvas = ctx.canvas;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return { width: data.width, height: data.height, rgba: new Uint8Array(data.data), time };
}

/** Puts a frame back on a canvas and asks the browser for the PNG bytes. */
async function frameToPng(frame: RgbaFrame): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = frame.width;
  canvas.height = frame.height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('O navegador não deu um contexto 2D para gravar o PNG.');
  const image = ctx.createImageData(frame.width, frame.height);
  image.data.set(frame.rgba);
  ctx.putImageData(image, 0, 0);
  const blob = await new Promise<Blob | null>((done) => canvas.toBlob(done, 'image/png'));
  if (blob === null) throw new Error('O navegador não conseguiu gravar o PNG.');
  return blob;
}

/**
 * Grava os quadros já desenhados num `.webm` — lote 43.
 *
 * Os quadros saem prontos antes (a física andou de verdade, o corte é o mesmo
 * de todos); aqui só se TOCA a sequência num canvas, e o `MediaRecorder` grava
 * o que o canvas mostrou. O quadro da vez sai do relógio (`performance.now`),
 * não de um contador: um tique atrasado pula quadro em vez de esticar o vídeo.
 */
async function recordWebm(
  frames: readonly RgbaFrame[], fps: number, loops: number, mimeType: string, onProgress: ExportProgress,
): Promise<Blob> {
  const first = frames[0]!;
  const canvas = document.createElement('canvas');
  canvas.width = first.width;
  canvas.height = first.height;
  const ctx = canvas.getContext('2d');
  if (ctx === null) throw new Error('O navegador não deu um contexto 2D para gravar o vídeo.');
  const images = frames.map((frame) => {
    const image = ctx.createImageData(frame.width, frame.height);
    image.data.set(frame.rgba);
    return image;
  });
  const plan = webmPlan({ duration: frames.length / fps, fps, loops });
  const stream = (canvas as HTMLCanvasElement & { captureStream(fps?: number): MediaStream }).captureStream(fps);
  const recorder = new MediaRecorder(stream, { mimeType });
  const chunks: Blob[] = [];
  recorder.addEventListener('dataavailable', (event) => { if (event.data.size > 0) chunks.push(event.data); });
  const stopped = new Promise<void>((done) => recorder.addEventListener('stop', () => done()));

  ctx.putImageData(images[0]!, 0, 0);
  recorder.start();
  const start = performance.now();
  await new Promise<void>((done) => {
    let shown = -1;
    const tick = (): void => {
      const elapsed = (performance.now() - start) / 1000;
      if (elapsed >= plan.seconds) { done(); return; }
      const count = Math.floor(elapsed * fps);
      if (count !== shown) {
        shown = count;
        ctx.putImageData(images[count % images.length]!, 0, 0);
        onProgress(Math.min(plan.frames, count + 1), plan.frames, 'Gravando o vídeo');
      }
      setTimeout(tick, plan.frameMs / 2);
    };
    tick();
  });
  recorder.stop();
  await stopped;
  for (const track of stream.getTracks()) track.stop();
  if (chunks.length === 0) throw new Error('O navegador não entregou nada do vídeo.');
  return new Blob(chunks, { type: 'video/webm' });
}

/**
 * Draws the animation and builds the files. No dialog in the way, so a test
 * (and the console) can call it directly.
 */
export async function buildImageExport(
  doc: Doc, options: ImageExportOptions, onProgress: ExportProgress = () => {},
): Promise<ImageExportResult> {
  const data = doc.data;
  if (data === null) {
    throw new Error('Este arquivo não carregou. Abra ou conserte o esqueleto antes de exportar.');
  }
  if (options.format === 'webm') {
    const support = webmSupport(browserWebmEnv());
    if (!support.ok) throw new Error(support.reason);
  }
  const plan = exportPlan(options, data.animations, stem(doc));
  if (!plan.ok) throw new Error(plan.message);
  const parts: ImageExportResult[] = [];
  const total = plan.tasks.length;
  for (let i = 0; i < total; i++) {
    const task = plan.tasks[i]!;
    const prefix = total === 1 ? '' : `${task.animation} (${i + 1} de ${total}) — `;
    parts.push(await buildTaskExport(doc, options, task,
      (done, all, step) => onProgress(done, all, `${prefix}${step}`)));
  }
  return mergeResults(parts);
}

/** Junta as exportações de várias animações num resultado só, na ordem. */
function mergeResults(parts: readonly ImageExportResult[]): ImageExportResult {
  if (parts.length === 1) return parts[0]!;
  const first = parts[0]!;
  return {
    files: parts.flatMap((part) => part.files),
    frameCount: parts.reduce((sum, part) => sum + part.frameCount, 0),
    width: first.width,
    height: first.height,
    index: null,
    warnings: [...new Set(parts.flatMap((part) => part.warnings))],
    animations: parts.flatMap((part) => part.animations),
    bases: parts.flatMap((part) => part.bases),
    sizes: parts.flatMap((part) => part.sizes ?? []),
  };
}

/** Desenha UMA tarefa do plano: uma animação, um trecho, um nome de arquivo. */
async function buildTaskExport(
  doc: Doc, options: ImageExportOptions, task: ExportTask, onProgress: ExportProgress,
): Promise<ImageExportResult> {
  const data = doc.data;
  if (data === null) throw new Error('Este arquivo não carregou.');
  // Rodada 45, lote 5: `null` = a base, a pose de repouso.
  const animation = task.animation === BASE_POSE ? null : data.animations.find((entry) => entry.name === task.animation);
  if (animation === undefined) {
    throw new Error(`A animação "${task.animation}" não existe neste arquivo.`);
  }

  const warnings: string[] = [];
  const fps = options.fps > 0 ? options.fps : 30;
  const times = task.times;
  const step = 1 / Math.max(1, fps * 2);
  // Degrau 10 (10.4): o retângulo da animação, quando ele existe e foi pedido.
  const recorte = animation === null ? { box: null, warnings: [] } : cropChoice(options, animation);
  for (const aviso of recorte.warnings) warnings.push(aviso);
  const camera = recorte.box !== null
    ? cameraFor(recorte.box, { scale: options.scale, margin: 0 })
    : cameraFor(animation === null ? baseBounds(doc) : boundsOverAnimation(doc, animation, times, step), {
      scale: options.scale, margin: 0.06,
    });

  const skeleton = freshSkeleton(doc);
  if (skeleton === null) throw new Error('Este arquivo não carregou.');
  let frames: RgbaFrame[] = [];
  let previous: number | null = null;
  for (let i = 0; i < times.length; i++) {
    const time = times[i]!;
    if (animation !== null) poseAt(skeleton, animation, time, step, previous);
    previous = time;
    skeleton.updateWorldTransform(0);
    const ctx = stageFor(camera, options.background);
    if (ctx === null) throw new Error('O navegador não deu um contexto 2D.');
    const renderer = new CanvasRenderer(ctx, {
      images: (page: AtlasPageData) => doc.imageFor(page),
      onWarning: (message) => { if (!warnings.includes(message)) warnings.push(message); },
      debug: options.bones ? { bones: true } : {},
    });
    renderer.draw(skeleton);
    frames.push(readPixels(ctx, time));
    onProgress(i + 1, times.length, 'Desenhando');
  }

  // Com o retângulo da animação, a borda NÃO é cortada: o retângulo é o
  // enquadramento pedido, e comê-lo pela borda o desmentiria (10.4).
  if (options.autoCrop && recorte.box === null) frames = autoCropFrames(frames, 1).frames;
  // Rodada 45, lote 2: a margem em px, depois do corte.
  if ((options.margin ?? 0) > 0) frames = frames.map((frame) => withMargin(frame, options.margin ?? 0, options.background));
  const first = frames[0]!;

  const base = task.base;
  const files: ExportedFile[] = [];
  let index: SheetIndex | null = null;

  if (options.format === 'gif') {
    onProgress(times.length, times.length, 'Montando o GIF');
    const bytes = encodeGif(frames, { fps, loop: options.loop, maxColors: options.maxColors });
    files.push({ name: `${base}.gif`, blob: new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'image/gif' }) });
  } else if (options.format === 'webm') {
    const support = webmSupport(browserWebmEnv());
    if (!support.ok) throw new Error(support.reason);
    const blob = await recordWebm(frames, fps, options.videoLoops ?? 1, support.mimeType, onProgress);
    files.push({ name: `${base}.webm`, blob });
  } else if (options.format === 'folha') {
    onProgress(times.length, times.length, 'Montando a folha');
    const sheet = buildSpriteSheet(frames, {
      ...(options.columns !== null && options.columns > 0 ? { columns: options.columns } : {}),
      imageName: `${base}.png`, animation: task.animation, fps,
    });
    index = sheet.index;
    files.push({ name: `${base}.png`, blob: await frameToPng(sheet.sheet) });
    files.push({
      name: `${base}.json`,
      blob: new Blob([`${JSON.stringify(sheet.index, null, 2)}\n`], { type: 'application/json' }),
    });
  } else {
    for (let i = 0; i < frames.length; i++) {
      const nome = frames.length === 1 ? `${base}.png` : frameFileName(base, i);
      files.push({ name: nome, blob: await frameToPng(frames[i]!) });
      onProgress(i + 1, frames.length, 'Gravando os PNG');
    }
  }

  return {
    files, frameCount: frames.length, width: first.width, height: first.height, index, warnings,
    animations: [task.animation], bases: [task.base],
    sizes: [{ animation: task.animation, width: first.width, height: first.height }],
  };
}

// ---------------------------------------------------------------------------
// Handing the files over
// ---------------------------------------------------------------------------

function download(name: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.style.display = 'none';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

/** Saves every file of an export. One download each. */
export function saveExportedFiles(result: ImageExportResult): void {
  for (const file of result.files) download(file.name, file.blob);
}

/**
 * `true` quando a exportação sai num `.zip` só — lote 51: sequência de PNG,
 * caixa ligada (é o padrão), e mais de um quadro.
 */
export function wantsZip(options: Pick<ImageExportOptions, 'format' | 'zip'>, fileCount: number): boolean {
  return options.format === 'png' && options.zip !== false && fileCount > 1;
}

/** O nome do `.zip`, e o de cada quadro dentro dele, numa pasta com o nome do arquivo. */
export function zipPlan(names: readonly string[], base: string): { file: string; entries: string[] } {
  return { file: `${base}.zip`, entries: names.map((name) => `${base}/${name}`) };
}

/**
 * O `.zip` da sequência, com o mesmo gravador do `.bonez` (`writeZip`). PNG
 * já vem comprimido: vai guardado como está, sem gastar o compressor.
 */
export async function zipExportedFiles(result: ImageExportResult, base: string): Promise<ExportedFile> {
  const plan = zipPlan(result.files.map((file) => file.name), base);
  const datas = await Promise.all(result.files.map(async (file) => new Uint8Array(await file.blob.arrayBuffer())));
  const bytes = writeZip(datas.map((data, index) => ({ name: plan.entries[index]!, data, compress: false })));
  return { name: plan.file, blob: new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'application/zip' }) };
}

/**
 * **Os nomes que não pisam em ninguém** — rodada 45, lote 4 (doc `70`).
 * Exportar de novo regravava `heroi_0000.png` sem perguntar. Como os
 * Downloads do navegador, o conjunto que sai ganha o primeiro número livre,
 * o MESMO para todos os arquivos dele: `heroi_0000 (2).png`.
 */
export function nomesSemPisar(nomes: readonly string[], existentes: readonly string[]): string[] {
  const tem = new Set(existentes);
  if (!nomes.some((nome) => tem.has(nome))) return [...nomes];
  const com = (nome: string, n: number): string => {
    const ponto = nome.lastIndexOf('.');
    return ponto <= 0 ? `${nome} (${n})` : `${nome.slice(0, ponto)} (${n})${nome.slice(ponto)}`;
  };
  for (let n = 2; ; n++) {
    const novos = nomes.map((nome) => com(nome, n));
    if (!novos.some((nome) => tem.has(nome))) return novos;
  }
}

/** A subpasta da pasta do projeto onde a exportação cai — rodada 45, lote 2 (2.5). */
export const EXPORT_SUBFOLDER = 'exportar';

/** A linha "Pasta:" quando a exportação foi para a pasta do projeto. */
export function exportFolderLine(pasta: string): string {
  return `Pasta: ${EXPORT_SUBFOLDER}/, dentro da pasta do projeto ${pasta}`;
}

/**
 * Entrega a exportação: um `.zip` só quando `wantsZip`; senão, um arquivo por
 * arquivo. **Com a pasta do projeto aberta, grava em `exportar/` dentro dela**
 * (rodada 45, lote 2; suposição do doc `57`: o Photoshop põe numa pasta ao
 * lado do documento, e o Spriter pergunta antes). Sem pasta, os Downloads,
 * como antes. Devolve a linha "Pasta:" que diz onde foi.
 */
export async function saveExport(
  result: ImageExportResult, options: ImageExportOptions, base: string, doc?: Doc,
): Promise<string> {
  const files = wantsZip(options, result.files.length) ? [await zipExportedFiles(result, base)] : result.files;
  const folder = doc === undefined ? null : projectFolder(doc);
  const handle = folder?.handle as unknown as {
    getDirectoryHandle?(name: string, options?: { create?: boolean }): Promise<{
      values?(): AsyncIterable<{ name: string }>;
      getFileHandle(name: string, options?: { create?: boolean }): Promise<{
        createWritable(): Promise<{ write(data: Blob): Promise<void>; close(): Promise<void> }>;
      }>;
    }>;
  } | null | undefined;
  if (folder !== null && folder !== undefined && handle?.getDirectoryHandle !== undefined) {
    try {
      const dir = await handle.getDirectoryHandle(EXPORT_SUBFOLDER, { create: true });
      // Rodada 45, lote 4: o que já está lá não é regravado calado.
      const existentes: string[] = [];
      if (dir.values !== undefined) for await (const entry of dir.values()) existentes.push(entry.name);
      const nomes = nomesSemPisar(files.map((file) => file.name), existentes);
      for (let i = 0; i < files.length; i++) {
        const writable = await (await dir.getFileHandle(nomes[i]!, { create: true })).createWritable();
        await writable.write(files[i]!.blob);
        await writable.close();
        // Doc 74, d: o relatório lê `result.files`: ele diz o nome gravado.
        files[i]!.name = nomes[i]!;
      }
      const mudou = nomes[0] !== files[0]?.name;
      return exportFolderLine(folder.name)
        + (mudou ? `. Já havia ${files[0]!.name} lá: este saiu como ${nomes[0]}, e o de antes ficou como estava` : '');
    } catch {
      // Sem escrita na pasta: cai nos Downloads, e a linha diz isso.
    }
  }
  for (const file of files) download(file.name, file.blob);
  return DOWNLOAD_FOLDER_LINE;
}

/**
 * Para onde foi, curto, para o fim do rodapé — rodada 48, lote 3 (doc 95): só
 * a janela dizia, e o rodapé fica depois que ela fecha. `onde` é a linha
 * "Pasta:" que o `saveExport` devolve.
 */
function ondeCurto(onde: string): string {
  if (onde === DOWNLOAD_FOLDER_LINE) return 'Downloads (Ctrl+J mostra)';
  const m = /^Pasta: (.+), dentro da pasta do projeto (.+?)(\.|$)/.exec(onde);
  return m === null ? onde.replace(/^Pasta: /, '') : `${m[1]}, na pasta ${m[2]}`;
}

/** One line for the status bar: what came out, how big, and (with `onde`) where it went. */
export function imageExportLine(result: ImageExportResult, options: ImageExportOptions, onde?: string): string {
  const linha = imageExportWhat(result, options);
  return onde === undefined ? linha : `${linha} Foi para ${ondeCurto(onde)}.`;
}

function imageExportWhat(result: ImageExportResult, options: ImageExportOptions): string {
  const total = result.files.reduce((sum, file) => sum + file.blob.size, 0);
  const size = total.toLocaleString('pt-BR');
  const arquivos = wantsZip(options, result.files.length)
    ? `1 .zip com ${result.files.length} PNG`
    : `${result.files.length} arquivo(s)`;
  if (result.animations.length > 1) {
    return `${FORMAT_LABELS[options.format]}: ${result.animations.length} animações, `
      + `${result.frameCount} quadros, ${arquivos}, ${size} bytes.`;
  }
  // Rodada 50, lote 2: uma imagem só não é "sequência" — o rodapé diz "Imagem PNG".
  const rotulo = options.format === 'png' && result.frameCount === 1 ? 'Imagem PNG' : FORMAT_LABELS[options.format];
  return `${rotulo}: ${result.frameCount === 1 ? '1 quadro' : `${result.frameCount} quadros`} de `
    + `${result.width}x${result.height}, ${arquivos}, ${size} bytes.`;
}

/**
 * O tamanho do quadro, dito com a verdade — N-6 (29/09/2026).
 *
 * Com "Todas as animações" o aviso dizia *"Tamanho de cada quadro: 114 por
 * 242"*, e os arquivos saíam idle 114×242, walk 156×242, attack 295×281: o
 * número era o da primeira, e valia para as três. A forma: *disse o primeiro
 * como se fosse o de todos*. Agora, com uma medida só, uma linha; com várias,
 * uma por animação.
 */
export function frameSizeLines(result: ImageExportResult): string[] {
  const sizes = result.sizes ?? [];
  if (sizes.length <= 1) return [`Tamanho de cada quadro: ${result.width} por ${result.height} pixels`];
  const iguais = sizes.every((s) => s.width === sizes[0]!.width && s.height === sizes[0]!.height);
  if (iguais) {
    return [`Tamanho de cada quadro: ${sizes[0]!.width} por ${sizes[0]!.height} pixels, igual nas ${sizes.length} animações`];
  }
  return [
    'Tamanho do quadro, por animação (cada uma é recortada à parte):',
    ...sizes.map((s) => `  ${s.animation}: ${s.width} por ${s.height} pixels`),
  ];
}

/**
 * **Onde o arquivo foi parar** — N-8 (rodada 17, 05/10/2026). A exportação é
 * um download do navegador: o arquivo vai para a pasta de downloads dele, que
 * o programa não escolhe nem enxerga. Dizer isso é melhor que não dizer nada.
 */
export const DOWNLOAD_FOLDER_LINE =
  'Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)';

/**
 * **O que vai sair, antes de exportar** — N-5 (rodada 17). A janela dizia só
 * *"Nada foi desenhado ainda."*, e o resumo vinha depois. Agora, a cada
 * mudança: os arquivos, a animação e os quadros. A recusa (De depois de Até…)
 * é dita aqui também, antes do clique.
 */
export function exportPreviewLine(
  options: Pick<ImageExportOptions, 'animation' | 'format' | 'fps' | 'from' | 'to' | 'all' | 'zip' | 'frame'>,
  animations: ReadonlyArray<{ name: string; duration: number }>,
  base: string,
): string {
  const plan = exportPlan(options, animations, base);
  if (!plan.ok) return plan.message;
  const quadros = plan.tasks.reduce((n, t) => n + t.times.length, 0);
  const nomes = plan.tasks.flatMap((t) => {
    const saem = outputNames(t.base, options.format, t.times.length);
    if (wantsZip(options, saem.length)) return [`${t.base}.zip (${saem.length} PNG)`];
    return saem.length > 3 ? [`${saem[0]} … ${saem[saem.length - 1]} (${saem.length} PNG)`] : saem;
  });
  const quem = plan.tasks.length === 1 ? plan.tasks[0]!.animation : `${plan.tasks.length} animações`;
  // Rodada 45, lote 2: uma imagem só não tem "quadros por segundo".
  if (quadros === 1) return `Vai sair: ${nomes.join(', ')} — ${quem}, 1 imagem`;
  return `Vai sair: ${nomes.join(', ')} — ${quem}, ${quadros} quadros a ${options.fps > 0 ? options.fps : 30} por segundo`;
}

/**
 * **A escolha da vez passada** — N-10 (rodada 17). Fechar a janela (exportando
 * ou não) guarda o que estava escolhido, e a próxima abre assim. A animação
 * não se guarda: abre a que está aberta (o padrão), porque é dela que se quer
 * a imagem; nem o trecho, que é de uma animação só.
 */
let lembrada: Partial<ImageExportOptions> | null = null;

export function rememberImageOptions(options: ImageExportOptions): void {
  const resto: Partial<ImageExportOptions> = { ...options };
  delete resto.animation;
  delete resto.from;
  delete resto.to;
  lembrada = resto;
}

export function withRememberedOptions(defaults: ImageExportOptions): ImageExportOptions {
  return lembrada === null ? defaults : { ...defaults, ...lembrada, animation: defaults.animation, from: null, to: null };
}

/** Para o teste começar limpo. */
export function forgetImageOptions(): void {
  lembrada = null;
}

/** The lines the window shows after an export, in Portuguese. */
export function imageExportReport(
  result: ImageExportResult, options: ImageExportOptions, base: string, where: string = DOWNLOAD_FOLDER_LINE,
): string[] {
  const several = result.animations.length > 1;
  const lines = [
    several
      ? `Animações: ${result.animations.join(', ')}`
      : `Animação: ${result.animations[0] ?? options.animation}`,
    `Quadros: ${result.frameCount}, a ${options.fps} por segundo`,
    ...frameSizeLines(result),
    `Arquivos: ${result.files.map((file) => file.name).join(', ')}`,
    // N-8 (rodada 17): o aviso nunca dizia onde o arquivo foi parar.
    where,
  ];
  if (isOneFrame(options)) {
    lines.splice(1, 0, `Só o quadro de ${formatSeconds(options.frame ?? 0)} s`);
  } else if (isRange(options)) {
    const to = options.to ?? null;
    lines.splice(1, 0, `Trecho: de ${formatSeconds(options.from ?? 0)} s`
      + (to === null ? ' até o fim' : ` até ${formatSeconds(to)} s`));
  }
  // Rodada 45, lote 2: a receita do vídeo não vale para uma imagem só.
  if (options.format === 'png' && result.frameCount > 1) {
    lines.push('Para virar MP4, passe a sequência para o ffmpeg:');
    const bases = result.bases.length > 0 ? result.bases : [base];
    for (const each of bases) lines.push(ffmpegLine(each, options.fps));
  } else if (options.format === 'webm') {
    const loops = webmPlan({ duration: 1, fps: options.fps, loops: options.videoLoops }).loops;
    if (loops > 1) lines.push(`Voltas no vídeo: ${loops}`);
    lines.push(WEBM_CLOCK_NOTE);
    lines.push('MP4 não sai daqui.');
  }
  // N-14 (29/09/2026): GIF e folha não levam mais a receita do ffmpeg. Quem
  // pediu um GIF não pediu um vídeo, e a linha repetida em toda exportação
  // deixava de ser lida — inclusive por quem precisava dela, no PNG.
  return [...lines, ...result.warnings];
}

// ---------------------------------------------------------------------------
// The window
// ---------------------------------------------------------------------------
//
// No new stylesheet: the rows use the very classes the "Propriedades" panel
// uses (`prop-linha`, `prop-rotulo`, `prop-campo`), and the frame uses the
// message window's (`dialog-veil`, `dialog-box`). Two columns, label on the
// left written out in full, field on the right, which is the layout the rest
// of the editor already trained the eye for.

/**
 * **Os rótulos e as dicas da janela** — rodada 45, lote 2 (doc `57`, §4).
 *
 * A janela tinha 16 controles e nenhuma dica; a Escala dizia "1" sem unidade,
 * e nenhum número dizia a faixa. A régua do doc `26`: rótulo curto com a
 * unidade, a frase inteira na dica, com a faixa "de … a …" em todo número.
 * Uma tabela só, que a janela lê e o teste confere.
 */
export interface ExportField {
  label: string;
  hint: string;
  /** A faixa, para os campos de número. */
  range?: { min: number; max: number; step: number };
}

export const EXPORT_FIELDS = {
  animacao: { label: 'Animação', hint: 'A animação que vai virar imagem' },
  todas: { label: 'Todas as animações', hint: 'Uma saída para cada animação do arquivo, cada uma inteira. De, Até e Só este quadro não valem' },
  quadro: { label: 'Só este quadro', hint: 'Uma imagem só: a pose no segundo da agulha. De e Até não valem' },
  de: { label: 'De (s)', hint: 'O primeiro segundo do trecho, de 0 a {fim} s, o fim da animação escolhida', range: { min: 0, max: 36000, step: 0.01 } },
  ate: { label: 'Até (s)', hint: 'O último segundo do trecho (ele não entra), de 0 a {fim} s, o fim da animação escolhida', range: { min: 0, max: 36000, step: 0.01 } },
  formato: { label: 'Formato', hint: 'GIF animado, uma imagem PNG por quadro, a folha de sprites com o índice em JSON, ou vídeo WebM' },
  fps: { label: 'Velocidade (quadros/s)', hint: 'Quantos quadros por segundo de animação, de 1 a 120. 30 é o comum', range: { min: 1, max: 120, step: 1 } },
  escala: { label: 'Escala (×)', hint: 'O tamanho do desenho, de 0,05× a 8×. 1× é o tamanho da cena; 2× é o dobro', range: { min: 0.05, max: 8, step: 0.05 } },
  transparente: { label: 'Fundo transparente', hint: 'Sem cor atrás do desenho. Desligado, vale a Cor do fundo' },
  cor: { label: 'Cor do fundo', hint: 'A cor atrás do desenho, quando o fundo não é transparente' },
  recorte: { label: 'Recorte', hint: 'Cortar a borda vazia em volta do desenho, usar a área desenhada nesta animação, ou não cortar nada' },
  margem: { label: 'Margem (px)', hint: 'O espaço vazio em volta do desenho, depois do corte, de 0 a 64 px', range: { min: MARGIN_RANGE.min, max: MARGIN_RANGE.max, step: 1 } },
  ossos: { label: 'Desenhar os ossos', hint: 'Desenha as linhas dos ossos por cima da arte. Desligado, sai só a arte' },
  colunas: { label: 'Quadros por linha (n.º)', hint: 'Quantos quadros cabem numa linha da folha, de 1 a 64', range: { min: 1, max: 64, step: 1 } },
  zip: { label: 'Um arquivo só (.zip)', hint: 'Os PNG da sequência dentro de um .zip só, numa pasta com o nome do arquivo' },
  cores: { label: 'Cores do GIF (n.º)', hint: 'Quantas cores o GIF pode ter, de 2 a 256. Menos cores, arquivo menor', range: { min: 2, max: 256, step: 1 } },
  repeticoes: { label: 'Repetições do GIF (vezes)', hint: 'Quantas vezes o GIF toca, de 0 a 65.535. 0 = sem parar', range: { min: 0, max: 65535, step: 1 } },
  voltas: { label: 'Voltas no vídeo (vezes)', hint: 'Quantas vezes a animação toca dentro do vídeo, de 1 a 100', range: { min: 1, max: 100, step: 1 } },
} as const satisfies Record<string, ExportField>;

export type ExportFieldId = keyof typeof EXPORT_FIELDS;

/** As dicas dos dois botões do pé da janela. */
export const EXPORT_BUTTON_HINTS = {
  exportar: 'Desenha os quadros e grava os arquivos: na pasta exportar/ do projeto, ou nos Downloads',
  fechar: 'Fecha a janela sem exportar. A escolha fica guardada para a próxima vez',
} as const;

/** Os três recortes, numa escolha só (antes eram uma lista e uma caixa que diziam o mesmo). */
export type CropMode = 'borda' | 'animacao' | 'nenhum';
export const CROP_MODE_LABELS: Readonly<Record<CropMode, string>> = Object.freeze({
  borda: 'Cortar a borda vazia (automático)',
  animacao: 'A área desenhada nesta animação',
  nenhum: 'Não cortar: a área da animação inteira',
});

/** O recorte de uma escolha, nos dois campos que o desenho lê. */
export function cropFromMode(mode: CropMode): { autoCrop: boolean; crop: 'borda' | 'animacao' } {
  if (mode === 'animacao') return { autoCrop: true, crop: 'animacao' };
  return { autoCrop: mode === 'borda', crop: 'borda' };
}

/** A escolha que as opções guardadas querem dizer. */
export function modeFromCrop(options: Pick<ImageExportOptions, 'autoCrop' | 'crop'>): CropMode {
  if (options.crop === 'animacao') return 'animacao';
  return options.autoCrop ? 'borda' : 'nenhum';
}

/** One labelled row: the words on the left, the control on the right, the sentence in the hint. */
function row(field: ExportFieldId | string, control: HTMLElement, id: string): HTMLElement {
  const def = (EXPORT_FIELDS as Record<string, ExportField>)[field];
  const label = def?.label ?? field;
  const line = el('div', 'prop-linha');
  const words = el('label', 'prop-rotulo', label);
  words.htmlFor = id;
  control.id = id;
  if (def !== undefined) {
    line.title = def.hint;
    control.title = def.hint;
  }
  line.append(words, control);
  return line;
}

/** Um campo de número com a faixa da tabela. */
function rangedField(field: ExportFieldId, value: number): HTMLInputElement {
  const r = (EXPORT_FIELDS[field] as ExportField).range ?? { min: 0, max: 1e9, step: 1 };
  return numberField(value, r.min, r.max, r.step);
}

function numberField(value: number, min: number, max: number, step: number): HTMLInputElement {
  const input = el('input', 'prop-campo') as HTMLInputElement;
  input.type = 'number';
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);
  input.value = String(value);
  return input;
}

function selectField(
  options: ReadonlyArray<{ value: string; label: string }>, value: string,
): HTMLSelectElement {
  const select = el('select', 'prop-selecao') as HTMLSelectElement;
  for (const option of options) {
    const node = el('option', undefined, option.label);
    node.value = option.value;
    select.append(node);
  }
  select.value = value;
  return select;
}

function checkField(checked: boolean): HTMLInputElement {
  const box = el('input', 'prop-marca') as HTMLInputElement;
  box.type = 'checkbox';
  box.checked = checked;
  return box;
}

/** What the window gives back when the export finished. */
export interface ImageExportRun {
  options: ImageExportOptions;
  /** A linha "Pasta:" — onde os arquivos foram parar (rodada 45, lote 2). */
  where?: string;
  result: ImageExportResult;
  /** File name without folder and extension, for the ffmpeg line. */
  base: string;
}

/**
 * "Exportar imagem…": the options, then the bar, then the files.
 *
 * Resolves with `null` when the user closed the window without exporting.
 * Nothing is drawn until the button is pressed, so a window someone opened by
 * accident costs nothing.
 */
export function exportImageWindow(doc: Doc, host?: HTMLElement): Promise<ImageExportRun | null> {
  const parent = host ?? document.body;
  const animations = (doc.data?.animations ?? []).map((entry) => entry.name);
  // N-10 (rodada 17): abre com a escolha da vez passada.
  const options = withRememberedOptions(defaultImageOptions(doc));

  // Rodada 45, lote 2 (2.7): a janela larga, com os campos em duas colunas,
  // para caber sem rolar em 1920×1080 e em 1280×720 (doc 57, foto 43).
  const box = el('div', 'dialog-box dialog-exportar');
  // As linhas usam as classes do painel Propriedades (`prop-linha` e
  // companhia), e essas classes leem variáveis que só existem dentro de
  // `.painel`. Fora dele o `grid-template-columns` fica inválido e os rótulos
  // caem POR CIMA dos campos, em vez de ficarem na coluna da esquerda. As
  // variáveis vão aqui, com os mesmos valores de `panels.css`, e a janela volta
  // a ter duas colunas alinhadas — que é o que a leitura pede.
  for (const [name, value] of [
    ['--painel-rotulo', '46%'],
    ['--painel-linha', '#c3ccd8'],
    ['--painel-campo', '#f4f6f9'],
    ['--painel-texto', '#10151c'],
    ['--painel-texto-fraco', '#45505e'],
    ['--painel-realce', '#1a4fd8'],
  ]) box.style.setProperty(name, value);
  // Rodada 17, N-16b (a segunda volta): a caixa NÃO rola inteira. O título fica
  // em cima, o meio (os campos) rola, e o rodapé (Andamento, a linha do que vai
  // sair e os botões) fica sempre à vista. Rolando a caixa inteira, ou o título
  // ou o Exportar ficava fora da tela — um dos dois, conforme a rolagem.
  const meio = el('div', 'dialog-rolagem');
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-modal', 'true');
  box.setAttribute('aria-label', 'Exportar imagem');
  // Rodada 50, lote 4 (doc 100): presa ao topo, a janela não pula quando muda de altura
  // (trocar o formato mostra e esconde linhas, e a caixa "Só este quadro" andava 23 px).
  const veil = el('div', 'dialog-veil dialog-veil-topo');
  veil.append(box);

  box.append(el('h2', 'dialog-title', 'Exportar imagem'));
  if (animations.length === 0) {
    // Rodada 45, lote 5: sem animação, sai a base — a pose de repouso.
    box.append(el('p', 'dialog-lead', 'Este arquivo ainda não tem animação: sai a imagem da base, a pose de repouso.'));
  } else {
    box.append(el('p', 'dialog-lead',
      'Escolha a animação e o formato. Vídeo sai em WebM; MP4 não sai daqui.'));
  }

  // Rodada 45, lote 5: a base é a última escolha da lista — e a única, sem animação.
  const animationField = selectField(
    [...animations.map((name) => ({ value: name, label: name })), { value: BASE_POSE, label: BASE_POSE_LABEL }],
    animations.includes(options.animation) || options.animation === BASE_POSE ? options.animation : (animations[0] ?? BASE_POSE),
  );
  const formatField = selectField(
    (['gif', 'png', 'folha', 'webm'] as ImageFormat[]).map((id) => ({ value: id, label: FORMAT_LABELS[id] })),
    options.format,
  );
  // Lote 43: sem gravador, o WebM fica na lista, cinza, com o motivo na dica.
  const webm = webmSupport(browserWebmEnv());
  const webmOption = [...formatField.options].find((option) => option.value === 'webm');
  if (webmOption !== undefined) {
    webmOption.disabled = !webm.ok;
    webmOption.title = webm.ok ? WEBM_CLOCK_NOTE : webm.reason;
  }
  const fpsField = rangedField('fps', options.fps);
  const scaleField = rangedField('escala', options.scale);
  const marginField = rangedField('margem', options.margin ?? 0);
  const transparentField = checkField(options.background === null);
  const colorField = el('input', 'prop-campo') as HTMLInputElement;
  colorField.type = 'color';
  colorField.value = options.background ?? '#ffffff';
  colorField.disabled = options.background === null;
  // Degrau 10 (10.4) e rodada 45, lote 2 (2.4): os TRÊS recortes numa escolha
  // só. Antes eram a lista "Recorte" e a caixa "Cortar a borda vazia", que
  // diziam a mesma coisa duas vezes (doc 57, foto 16).
  const cropModeField = selectField(
    (['borda', 'animacao', 'nenhum'] as const).map((id) => ({ value: id, label: CROP_MODE_LABELS[id] })),
    modeFromCrop(options),
  );
  const cropOf = (name: string): { x: number; y: number; width: number; height: number } | null =>
    doc.data?.animations.find((entry) => entry.name === name)?.crop ?? null;
  const cropModeRow = row('recorte', cropModeField, 'exp-recorte');
  const cropNote = el('p', 'dialog-lead dialog-exportar-nota', '');
  const syncCrop = (): void => {
    const pelaAnimacao = cropModeField.value === 'animacao';
    const area = cropOf(animationField.value);
    cropNote.textContent = !pelaAnimacao
      ? ''
      : area === null
        ? `A animação "${animationField.value}" não tem área desenhada: ela sai com o corte automático da borda.`
        : `Área de "${animationField.value}": ${area.width} × ${area.height} px, canto em (${area.x}, ${area.y}). `
          + 'É o retângulo magenta da cena.';
    cropNote.style.display = cropNote.textContent === '' ? 'none' : '';
  };
  cropModeField.addEventListener('change', syncCrop);
  animationField.addEventListener('change', syncCrop);
  const bonesField = checkField(options.bones);
  const columnsField = rangedField('colunas', options.columns ?? 8);
  const colorsField = rangedField('cores', options.maxColors);
  const loopField = rangedField('repeticoes', options.loop);

  // Lote 41: o trecho e "todas as animações", que só a linha de comando fazia.
  const durationOf = (name: string): number =>
    doc.data?.animations.find((entry) => entry.name === name)?.duration ?? 0;
  const allField = checkField(options.all === true);
  const fromField = rangedField('de', 0);
  const toField = rangedField('ate', durationOf(options.animation));
  // Rodada 45, lote 2 (2.1): **Só este quadro** — a pose da animação escolhida
  // no segundo da agulha, uma imagem. A caixa volta marcada se a última
  // exportação foi de um quadro só (a escolha da vez passada, N-10).
  const agulha = Math.max(0, doc.time);
  const frameField = checkField(options.frame !== null && options.frame !== undefined);
  const frameLabel = `${EXPORT_FIELDS.quadro.label} (${formatSeconds(agulha)} s)`;
  let formatoAntes: ImageFormat | null = null;
  const resetFrom = (): void => { fromField.value = '0'; };
  const resetTo = (): void => { toField.value = String(durationOf(animationField.value)); };
  // Trocar de animação traz o trecho de volta ao inteiro dela: um Até de 2 s
  // herdado da `idle` passaria do fim da `attack`, que tem 0,6.
  animationField.addEventListener('change', () => { resetFrom(); resetTo(); });
  const syncAll = (): void => {
    if (animationField.value === BASE_POSE) {
      frameField.checked = true;
      allField.checked = false;
    }
    allField.disabled = animationField.value === BASE_POSE;
    const all = allField.checked;
    const one = frameField.checked && !all;
    // Rodada 50, lote 2: um quadro só sai em PNG; desmarcar devolve o formato de antes.
    const troca = formatoComQuadro(formatField.value as ImageFormat, one, formatoAntes);
    formatoAntes = troca.antes;
    formatField.value = troca.format;
    animationField.disabled = all;
    frameField.disabled = all;
    fromField.disabled = all || one;
    toField.disabled = all || one;
  };
  allField.addEventListener('change', syncAll);
  animationField.addEventListener('change', syncAll);
  frameField.addEventListener('change', syncAll);
  syncAll();

  // A faixa de De e Até é a da animação escolhida: "de 0 a 2 s" (régua do doc 26).
  const fromRow = row('de', fromField, 'exp-de');
  const toRow = row('ate', toField, 'exp-ate');
  const syncFaixa = (): void => {
    const fim = formatSeconds(durationOf(animationField.value));
    for (const [linha, campo, id] of [[fromRow, fromField, 'de'], [toRow, toField, 'ate']] as const) {
      const dica = EXPORT_FIELDS[id].hint.replace('{fim}', fim);
      linha.title = dica;
      campo.title = dica;
    }
  };
  animationField.addEventListener('change', syncFaixa);
  syncFaixa();
  const frameRow = row('quadro', frameField, 'exp-quadro');
  frameRow.querySelector('label')!.textContent = frameLabel;
  meio.append(
    row('animacao', animationField, 'exp-animacao'),
    row('formato', formatField, 'exp-formato'),
    row('todas', allField, 'exp-todas'),
    frameRow,
    fromRow,
    toRow,
    row('fps', fpsField, 'exp-fps'),
    row('escala', scaleField, 'exp-escala'),
    row('transparente', transparentField, 'exp-transparente'),
    row('cor', colorField, 'exp-cor'),
    cropModeRow,
    row('margem', marginField, 'exp-margem'),
    row('ossos', bonesField, 'exp-ossos'),
  );
  syncCrop();
  const sheetRow = row('colunas', columnsField, 'exp-colunas');
  const colorsRow = row('cores', colorsField, 'exp-cores');
  const loopRow = row('repeticoes', loopField, 'exp-laco');
  const videoLoopsField = rangedField('voltas', options.videoLoops ?? 1);
  const videoLoopsRow = row('voltas', videoLoopsField, 'exp-voltas');
  // Lote 51: a sequência num `.zip` só — um download, sem pedir permissão.
  const zipField = checkField(options.zip !== false);
  const zipRow = row('zip', zipField, 'exp-zip');
  const clockNote = el('p', 'dialog-lead dialog-exportar-nota', WEBM_CLOCK_NOTE);
  meio.append(sheetRow, zipRow, colorsRow, loopRow, videoLoopsRow, cropNote, clockNote);
  box.append(meio);

  const bar = el('progress') as HTMLProgressElement;
  bar.max = 1;
  bar.value = 0;
  // N-5 (rodada 17): antes de exportar, a linha diz o que vai sair.
  const barLine = el('p', 'dialog-lead', '');
  const barRow = el('div', 'prop-linha');
  barRow.append(el('span', 'prop-rotulo', 'Andamento'), bar);
  box.append(barRow, barLine);

  const go = el('button', 'dialog-close', 'Exportar') as HTMLButtonElement;
  go.type = 'button';
  go.title = EXPORT_BUTTON_HINTS.exportar;
  // Rodada 45, lote 2: o Fechar não tem a cor do Exportar (doc 57, foto 16).
  const cancel = el('button', 'dialog-close dialog-close-secundario', 'Fechar sem exportar') as HTMLButtonElement;
  cancel.type = 'button';
  cancel.title = EXPORT_BUTTON_HINTS.fechar;
  const buttons = el('div', 'dialog-buttons');
  buttons.append(go, cancel);
  box.append(buttons);

  /**
   * Only the fields the chosen format actually uses stay on screen.
   *
   * `style.display` e não o atributo `hidden`: a linha é `display: flex` na
   * folha de estilo, e uma regra de classe ganha do `display: none` que o
   * `hidden` traz. Com `hidden` sozinho, "Cores do GIF" continuava na tela ao
   * escolher a folha de sprites.
   */
  const syncRows = (): void => {
    const format = formatField.value as ImageFormat;
    const show = (node: HTMLElement, on: boolean): void => {
      node.style.display = on ? '' : 'none';
      node.hidden = !on;
    };
    show(sheetRow, format === 'folha');
    // Rodada 45, lote 4 (doc 70): numa imagem só, o .zip não muda nada — some.
    show(zipRow, format === 'png' && !(frameField.checked && !allField.checked));
    show(colorsRow, format === 'gif');
    show(loopRow, format === 'gif');
    show(videoLoopsRow, format === 'webm');
    show(clockNote, format === 'webm');
  };
  formatField.addEventListener('change', syncRows);
  frameField.addEventListener('change', syncRows);
  allField.addEventListener('change', syncRows);
  // Rodada 50, lote 2: a pose da base marca o Só este quadro sozinha, e o formato vira PNG.
  animationField.addEventListener('change', syncRows);
  transparentField.addEventListener('change', () => {
    colorField.disabled = transparentField.checked;
  });
  syncRows();
  go.disabled = false;

  return new Promise<ImageExportRun | null>((resolve) => {
    let open = true;
    let running = false;
    const finish = (value: ImageExportRun | null): void => {
      if (!open) return;
      open = false;
      // N-10: fechar sem exportar também guarda a escolha.
      if (value === null && animations.length > 0) rememberImageOptions(readForm());
      document.removeEventListener('keydown', onKey, true);
      veil.remove();
      resolve(value);
    };

    function onKey(event: KeyboardEvent): void {
      if (event.key !== 'Escape' || running) return;
      event.preventDefault();
      event.stopPropagation();
      finish(null);
    }

    cancel.addEventListener('click', () => { if (!running) finish(null); });
    veil.addEventListener('pointerdown', (event) => {
      if (event.target === veil && !running) finish(null);
    });
    document.addEventListener('keydown', onKey, true);
    box.addEventListener('change', () => { if (!running) preview(); });
    box.addEventListener('input', () => { if (!running) preview(); });

    go.addEventListener('click', () => {
      if (running) return;
      const chosen = readForm();
      rememberImageOptions(chosen);
      // A recusa é escrita, e o campo errado volta ao que era — lote 41.
      const plan = exportPlan(chosen, doc.data?.animations ?? [], stem(doc));
      if (!plan.ok) {
        barLine.textContent = plan.message;
        if (plan.field === 'from' || plan.field === 'range') resetFrom();
        if (plan.field === 'to' || plan.field === 'range') resetTo();
        return;
      }
      running = true;
      go.disabled = true;
      cancel.disabled = true;
      barLine.textContent = 'Desenhando o primeiro quadro…';
      buildImageExport(doc, chosen, (done, total, step) => {
        bar.max = total;
        bar.value = done;
        barLine.textContent = `${step}: ${done} de ${total}.`;
      }).then(async (result) => {
        const where = await saveExport(result, chosen, stem(doc), doc);
        finish({ options: chosen, result, base: stem(doc), where });
      }).catch((error: unknown) => {
        running = false;
        go.disabled = false;
        cancel.disabled = false;
        barLine.textContent = error instanceof Error ? error.message : String(error);
      });
    });

    parent.append(veil);
    // N-16b (rodada 17): o foco no Exportar rolava a janela até o fim, e ela
    // abria com o título e a Animação escondidos acima. Foco sem rolar, e a
    // janela no começo.
    go.focus({ preventScroll: true });
    box.scrollTop = 0;
    preview();
  });

  /** O que está escolhido na janela agora. */
  function readForm(): ImageExportOptions {
    return {
      animation: animationField.value,
      format: formatField.value as ImageFormat,
      fps: Number(fpsField.value) || 30,
      scale: Number(scaleField.value) || 1,
      background: transparentField.checked ? null : colorField.value,
      ...cropFromMode(cropModeField.value as CropMode),
      columns: formatField.value === 'folha' ? Number(columnsField.value) || null : null,
      loop: Number(loopField.value) || 0,
      maxColors: Number(colorsField.value) || 256,
      bones: bonesField.checked,
      all: allField.checked,
      from: allField.checked ? null : Number(fromField.value),
      to: allField.checked ? null : Number(toField.value),
      videoLoops: Number(videoLoopsField.value) || 1,
      zip: zipField.checked,
      frame: animationField.value === BASE_POSE ? 0 : frameField.checked && !allField.checked ? agulha : null,
      margin: Math.max(MARGIN_RANGE.min, Math.min(MARGIN_RANGE.max, Number(marginField.value) || 0)),
    };
  }

  /** N-5: a linha do que vai sair, refeita a cada mudança na janela. */
  function preview(): void {
    barLine.textContent = exportPreviewLine(readForm(), doc.data?.animations ?? [], stem(doc));
  }
}

