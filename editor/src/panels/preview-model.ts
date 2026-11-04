/**
 * Model behind the "Prévia" panel (requirements A5 and A7).
 *
 * Pure functions only: no DOM. The project has no jsdom, so everything a test
 * has to see lives here and `preview.ts` only draws.
 *
 * The preview is a second `Skeleton` driven by the runtime's `AnimationState`.
 * It never touches `doc.skeleton`, so mixing four layers cannot disturb what
 * the artist is editing in the drawing area.
 *
 * WHAT IS NOT IN THE FILE. A layer, its weight, its speed and its bone mask are
 * decisions of the person watching, not data of the character. None of it is
 * written into the `.bone`. The one thing that crosses over is the "Copiar para
 * a linha do tempo" button, and what it writes is an ordinary animation with
 * ordinary bone keys — nothing new in the format.
 */

import type { AnimationDef, AnimationData, BoneFile, SkeletonData } from '../../../runtime/src/index.js';
import { AnimationState, Skeleton } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';

/** How many layers the panel offers. */
export const LAYER_COUNT = 4;

/** Bone properties the copy writes. Everything else is listed as a loss. */
export const BAKED_PROPERTIES = Object.freeze([
  'x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearX', 'shearY',
] as const);

export type BakedProperty = (typeof BAKED_PROPERTIES)[number];

/** One layer of the preview, as the panel's controls describe it. */
export interface LayerConfig {
  /** Animation name, or `null` for a layer that is turned off. */
  animation: string | null;
  /** Starts again when it reaches the end. */
  loop: boolean;
  /** 1 is normal speed. */
  speed: number;
  /** How much of this layer reaches the character, 0 to 1. */
  alpha: number;
  /** Seconds of crossfade when the animation of this layer is swapped. */
  mix: number;
  /** Bone names this layer may move, or `null` for every bone. */
  bones: readonly string[] | null;
}

/** Four layers turned off, which is how the panel opens. */
export function defaultLayers(count: number = LAYER_COUNT): LayerConfig[] {
  const out: LayerConfig[] = [];
  for (let i = 0; i < count; i++) {
    out.push({ animation: null, loop: true, speed: 1, alpha: 1, mix: 0.2, bones: null });
  }
  return out;
}

/** Finds loaded animation data by name. */
export function findAnimationData(data: SkeletonData, name: string | null): AnimationData | null {
  if (name === null) return null;
  return data.animations.find((a) => a.name === name) ?? null;
}

/** `true` when at least one layer has an animation chosen. */
export function hasAnyLayer(data: SkeletonData, layers: readonly LayerConfig[]): boolean {
  return layers.some((layer) => findAnimationData(data, layer.animation) !== null);
}

/**
 * Builds the runtime state the preview plays: one track per layer, in the
 * order the panel shows them. Layer 0 is the base and the ones above write
 * over it.
 */
export function buildPreviewState(data: SkeletonData, layers: readonly LayerConfig[]): AnimationState {
  const state = new AnimationState();
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    const animation = findAnimationData(data, layer.animation);
    if (animation === null) continue;
    const entry = state.setAnimation(i, animation, layer.loop, Math.max(0, layer.mix));
    entry.timeScale = layer.speed;
    entry.alpha = Math.max(0, Math.min(1, layer.alpha));
    entry.boneMask = layer.bones === null ? null : new Set(layer.bones);
  }
  return state;
}

/**
 * How long one pass of the mix lasts: the longest layer, measured at the speed
 * that layer plays. 0 when no layer has an animation.
 */
export function previewDuration(data: SkeletonData, layers: readonly LayerConfig[]): number {
  let longest = 0;
  for (const layer of layers) {
    const animation = findAnimationData(data, layer.animation);
    if (animation === null) continue;
    const speed = Math.abs(layer.speed) < 1e-6 ? 1 : Math.abs(layer.speed);
    longest = Math.max(longest, animation.duration / speed);
  }
  return longest;
}

// ---------------------------------------------------------------------------
// Copying the mix into a new animation ("bake")
// ---------------------------------------------------------------------------

/**
 * What the copy does NOT carry. Shown on screen, in full, next to the button:
 * a copy that quietly drops half the work is worse than no button.
 */
export const BAKE_LOSSES: readonly string[] = Object.freeze([
  'A cópia grava só os ossos: posição, giro, escala e inclinação.',
  // Rodada 47, lote 6d (doc 90; o detalhe do conferente): sem "slot", "morphs" e "tags".
  'Ficam de fora: eventos, a ordem das peças, a cor das peças, a malha, a troca de imagens, os parâmetros, as formas de mistura, as variáveis e as etiquetas.',
  'As curvas viram retas. Uma chave por quadro, na taxa escolhida.',
  'A animação nova é o resultado já pronto. Ela não volta a se misturar, e mudar as camadas depois não muda a cópia.',
  'Camadas com laço são gravadas só até o fim da camada mais longa.',
]);

export interface BakeOptions {
  /** Keys per second. */
  fps: number;
  /** Name of the new animation. */
  name: string;
}

/** One baked bone channel. */
interface Channel {
  bone: string;
  index: number;
  property: BakedProperty;
  setup: number;
  values: number[];
}

/** Rounds to 6 decimals, so the file does not carry float noise. */
function round(value: number): number {
  return Math.round(value * 1e6) / 1e6;
}

/**
 * Plays the mix from the start and writes every frame as bone keys.
 *
 * Returns the new animation, or `null` when no layer has an animation. The
 * result is plain `.bone` JSON: `AddBakedAnimation` puts it in the document.
 */
export function bakeMix(
  data: SkeletonData, layers: readonly LayerConfig[], options: BakeOptions,
): AnimationDef | null {
  if (!hasAnyLayer(data, layers)) return null;
  const fps = Math.max(1, Math.round(options.fps));
  const step = 1 / fps;
  const duration = previewDuration(data, layers);
  const frames = Math.max(1, Math.round(duration * fps));

  const skeleton = new Skeleton(data);
  const state = buildPreviewState(data, layers);

  const channels: Channel[] = [];
  for (const bone of data.bones) {
    for (const property of BAKED_PROPERTIES) {
      channels.push({ bone: bone.name, index: bone.index, property, setup: bone[property], values: [] });
    }
  }

  for (let frame = 0; frame <= frames; frame++) {
    if (frame > 0) state.update(step);
    state.apply(skeleton);
    for (const channel of channels) {
      channel.values.push(skeleton.bones[channel.index][channel.property]);
    }
  }

  const timelines: AnimationDef['timelines'] = [];
  for (const channel of channels) {
    let moved = false;
    let constant = true;
    const first = channel.values[0];
    for (const value of channel.values) {
      if (Math.abs(value - channel.setup) > 1e-9) moved = true;
      if (Math.abs(value - first) > 1e-9) constant = false;
    }
    if (!moved) continue; // the bone never leaves the rest pose on this axis
    const keys = constant
      ? [{ time: 0, value: round(first) }]
      : channel.values.map((value, frame) => ({ time: round(frame * step), value: round(value) }));
    timelines.push({ type: 'bone', target: channel.bone, property: channel.property, keys });
  }

  return { name: options.name, duration: round(frames * step), timelines };
}

/** A name for the copy that is not taken yet. */
export function bakedName(file: BoneFile, base = 'prévia misturada'): string {
  return uniqueName(base, (file.animations ?? []).map((a) => a.name));
}

/** Puts a baked animation in the document, as one undo step. */
export class AddBakedAnimation implements Command {
  readonly label = 'Copiar prévia para a linha do tempo';
  readonly kind: ChangeKind = 'structure';
  readonly name: string;
  private readonly animation: AnimationDef;

  constructor(animation: AnimationDef) {
    this.animation = animation;
    this.name = animation.name;
  }

  apply(doc: EditorDoc): void {
    const animations = doc.file.animations ?? (doc.file.animations = []);
    animations.push(JSON.parse(JSON.stringify(this.animation)) as AnimationDef);
  }

  revert(doc: EditorDoc): void {
    const animations = doc.file.animations ?? [];
    const at = animations.findIndex((a) => a.name === this.name);
    if (at >= 0) animations.splice(at, 1);
  }
}

/**
 * **A camada 0 segue a animação aberta** — rodada 17, G-Q4 (05/10/2026).
 *
 * Com `idle` aberto e tocando, a Prévia mostrava o boneco PARADO: a camada 0
 * nascia em *"— nenhuma —"* e a frase pedia para escolher. Quem abre a Prévia
 * com uma animação aberta quer ver ESSA. Agora, enquanto ninguém escolheu
 * nada na camada 0, ela mostra a animação aberta; escolher uma na camada 0 é
 * a mão dele, e vale. As camadas de cima não mudam.
 */
export function effectiveLayers(layers: readonly LayerConfig[], openAnimation: string | null): LayerConfig[] {
  return layers.map((layer, i) => (i === 0 && layer.animation === null && openAnimation !== null
    ? { ...layer, animation: openAnimation }
    : layer));
}

/** A frase da Prévia quando a camada 0 segue a aberta. */
export function followNotice(openAnimation: string): string {
  return `Camada 0: segue a animação aberta (${openAnimation}). Escolha outra na camada 0 para misturar`;
}

/**
 * A mesma frase numa linha — rodada 47, lote 4 (R10 do doc 68). Debaixo do
 * palco a frase inteira ocupava três linhas numa coluna de 258 px; à vista vai
 * esta, e a inteira (`followNotice`) fica na dica.
 */
export function followShort(openAnimation: string): string {
  return `Camada 0 segue ${openAnimation}`;
}

/** A dica do título de cada camada: o que É uma camada — Rodada 47, lote 6d (doc 90; o detalhe do conferente). */
export const LAYER_HINT =
  'Camada: uma animação que toca por cima da de baixo, só nos ossos que ela marca. Clique para abrir e fechar';

/** A linha dentro da camada 0, que nasce aberta: quem chega lê o que é camada. */
export const LAYER_SAYS = 'Cada camada toca uma animação. A de cima cobre a de baixo nos ossos que marca.';
