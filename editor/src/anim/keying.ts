/**
 * Animation keys and timelines — pure functions over the `.bone` JSON.
 *
 * CORE PRINCIPLE (contract.ts): the editor document IS the file. So there is
 * no "key object" living beside the document: a key is the `{time, value,
 * curve}` object of spec 9.2, inside the `keys` array of a timeline, inside
 * the animation, inside `file.animations`. Every function here reads or edits
 * that JSON and nothing else.
 *
 * A timeline is identified by the tuple `(type, target, property, skin,
 * attachment)` of spec 9.1 — `TimelineTarget` below. The same tuple must not
 * appear twice in one animation, so the tuple is the address of a timeline and
 * `targetKey` turns it into a string usable as a map key.
 *
 * Rules of spec 9 this module is responsible for:
 *   - keys sorted by `time`, strictly increasing (9.1); only `event` may hold
 *     several keys at the same time (9.7);
 *   - `curve` is the interpolation FROM this key TO the next; absent means
 *     linear (9.3), which is why a new key is written without a `curve` field;
 *   - rotation never wraps: `350 -> 10` goes through `-340` (9.3). Nothing
 *     here shortens a rotation path, on purpose;
 *   - before the first key the FIRST key's value counts, not the setup pose
 *     (9.10);
 *   - `duration` belongs to the animation, not to the last key (9.11). It is
 *     raised when a key lands past it, and never lowered behind the user's
 *     back.
 *
 * Undo is not here: these functions mutate. The commands that make the edits
 * undoable live in `pose-mode.ts`.
 */

import { normalizeCurve, sampleCurve, solveBezierParameter } from '../../../runtime/src/index.js';
import { ownBoneLabel, slotOfOwnBone } from '../doc/own-bone.js';
import type {
  AnimationDef, BoneFile, CurveDef, KeyDef, KeyValue, TimelineDef,
} from '../../../runtime/src/index.js';
import { getAtPointer, parsePointer, pointerOf } from '../doc/commands.js';
// `findAnimation` era uma segunda cópia; mora em `anim/animations.ts` desde o lote A4.
import { findAnimation } from './animations.js';
import { findPreset, presetCurve, toUnit } from './curves.js';
import type { UnitControlPoints } from './curves.js';
export { findAnimation } from './animations.js';

// ---------------------------------------------------------------------------
// Time
// ---------------------------------------------------------------------------

/** Two times closer than this are the same key. Below the precision of 3.6. */
export const TIME_EPSILON = 1e-6;

/** Drops float dust, so `0.1 + 0.2` and `0.3` name the same key. */
export function roundTime(time: number): number {
  if (!Number.isFinite(time)) return 0;
  return Math.round(time * 1e6) / 1e6;
}

export function sameTime(a: number, b: number): boolean {
  return Math.abs(a - b) < TIME_EPSILON;
}

// ---------------------------------------------------------------------------
// The address of a timeline (spec 9.1)
// ---------------------------------------------------------------------------

/**
 * Which property of which target a timeline plays. `skin` and `attachment`
 * only exist for `deform` and `sequence`.
 */
export interface TimelineTarget {
  readonly type: string;
  readonly target?: string;
  readonly property?: string;
  readonly skin?: string;
  readonly attachment?: string;
}

/**
 * **A timeline do emissor** — extensão `BONE_particles`, §9 (rodada 16, lote 9).
 * Mesmo endereço de três partes do `deform`: `(slot, skin, placeholder)`, mais
 * a `property`. Nesta rodada só `emitting` ganha chave pela tela (§4.1: liga e
 * desliga, em degrau); os outros campos animáveis ficam para outra rodada.
 */
export const PARTICLE_TIMELINE = 'BONE_particle';

/**
 * As timelines cujo endereço tem TRÊS partes — `(slot, skin, placeholder)`,
 * spec 9.6. `weights` entrou no degrau 6: a spec diz, com estas palavras, *"o
 * mesmo endereço de três partes do `deform`, com a mesma ordem de busca por
 * pele"*.
 */
const THREE_PART = new Set(['deform', 'sequence', 'weights', PARTICLE_TIMELINE]);

/** `skin` defaults to `"default"` for the timelines that carry one. */
export function normalizeTarget(target: TimelineTarget): TimelineTarget {
  if (!THREE_PART.has(target.type)) return target;
  if (target.skin !== undefined) return target;
  return { ...target, skin: 'default' };
}

/** A stable string for the tuple of 9.1, for map keys and DOM ids. */
export function targetKey(target: TimelineTarget): string {
  const t = normalizeTarget(target);
  return [t.type, t.target ?? '', t.property ?? '', t.skin ?? '', t.attachment ?? ''].join('|');
}

export function sameTarget(a: TimelineTarget, b: TimelineTarget): boolean {
  return targetKey(a) === targetKey(b);
}

export function boneTarget(bone: string, property: string): TimelineTarget {
  return { type: 'bone', target: bone, property };
}
export function slotTarget(slot: string, property: string): TimelineTarget {
  return { type: 'slot', target: slot, property };
}
export function constraintTarget(constraint: string, property: string): TimelineTarget {
  return { type: 'constraint', target: constraint, property };
}
export function deformTarget(slot: string, attachment: string, skin = 'default'): TimelineTarget {
  return { type: 'deform', target: slot, skin, attachment };
}
export function sequenceTarget(slot: string, attachment: string, skin = 'default'): TimelineTarget {
  return { type: 'sequence', target: slot, skin, attachment };
}
/** Os pesos animados de uma malha — spec 9.6, F9. Endereço de três partes. */
export function weightsTarget(slot: string, attachment: string, skin = 'default'): TimelineTarget {
  return { type: 'weights', target: slot, skin, attachment };
}
/** A virada de corpo — spec 9.13. Uma por animação: sem `target`, sem `property`. */
export function bodyTarget(): TimelineTarget {
  return { type: 'body' };
}
export function drawOrderTarget(): TimelineTarget {
  return { type: 'drawOrder' };
}
export function eventTarget(): TimelineTarget {
  return { type: 'event' };
}
export function tagTarget(): TimelineTarget {
  return { type: 'tag' };
}
export function parameterTarget(parameter: string): TimelineTarget {
  return { type: 'parameter', target: parameter, property: 'value' };
}
export function morphTarget(morph: string): TimelineTarget {
  return { type: 'morph', target: morph, property: 'weight' };
}
export function variableTarget(variable: string): TimelineTarget {
  return { type: 'variable', target: variable, property: 'value' };
}
export function nestedTarget(slot: string, property: string): TimelineTarget {
  return { type: 'nested', target: slot, property };
}

// ---------------------------------------------------------------------------
// What a timeline holds (spec 9.1, the table of all timelines)
// ---------------------------------------------------------------------------

/** Shape of a timeline's value, so keys, curves and the editor agree. */
export interface TargetInfo {
  /** Bezier components, `C` of 9.3. `0` when the value is not interpolable. */
  readonly components: number;
  /** `false` forces `stepped` (boolean, string, `null`, object values). */
  readonly interpolable: boolean;
  /** `event` and the physics `reset`: keys with a time and no value. */
  readonly valueless: boolean;
  /** What the user reads in the dopesheet, in Portuguese. */
  readonly label: string;
}

const BONE_NUMERIC = new Set(['x', 'y', 'rotation', 'scaleX', 'scaleY', 'shearX', 'shearY']);
const BONE_BOOLEAN = new Set(['inheritRotation', 'inheritScale', 'inheritReflection']);

/** Constraint properties that hold a boolean, so they are stepped (9.8). */
const CONSTRAINT_BOOLEAN = new Set(['bendPositive', 'compress', 'stretch', 'uniform']);

const PROPERTY_LABELS: Record<string, string> = {
  x: 'Posição X',
  y: 'Posição Y',
  rotation: 'Rotação',
  scaleX: 'Escala X',
  scaleY: 'Escala Y',
  shearX: 'Inclinação X',
  shearY: 'Inclinação Y',
  parent: 'Pai',
  inheritRotation: 'Herda rotação',
  inheritScale: 'Herda escala',
  inheritReflection: 'Herda reflexo',
  attachment: 'Desenho',
  // O desenho troca de osso por chave — spec 9.5, F8, degrau 6. Não é "Osso"
  // seco: numa folha onde toda linha de osso já se chama pelo nome do osso,
  // "Osso" sozinho faria pensar que a linha é do osso, e ela é do desenho.
  bone: 'Osso do desenho',
  // Rodada 16, lote 9: a chave do emissor (§4.1 da extensão de partículas).
  emitting: 'Emitindo',
  color: 'Cor',
  darkColor: 'Cor escura',
  visible: 'Visível',
  mix: 'Força',
  softness: 'Suavidade',
  bendPositive: 'Dobra positiva',
  compress: 'Comprime',
  stretch: 'Estica',
  uniform: 'Uniforme',
  mixRotation: 'Força da rotação',
  mixX: 'Força em X',
  mixY: 'Força em Y',
  mixScaleX: 'Força da escala X',
  mixScaleY: 'Força da escala Y',
  mixShearY: 'Força da inclinação Y',
  position: 'Posição no caminho',
  spacing: 'Espaçamento',
  inertia: 'Inércia',
  strength: 'Força da mola',
  damping: 'Amortecimento',
  mass: 'Massa',
  wind: 'Vento',
  gravity: 'Gravidade',
  reset: 'Reiniciar física',
  weight: 'Peso',
  value: 'Valor',
  animation: 'Animação',
  time: 'Tempo',
  timeScale: 'Velocidade',
};

function labelOf(target: TimelineTarget): string {
  if (target.type === 'drawOrder') return 'Ordem de desenho';
  if (target.type === 'event') return 'Eventos';
  // **Etiquetas**, e não "Marcas" — degrau 12, porta G9/P15 (18/09/2026).
  //
  // "Marca" já era outra coisa no editor: o marcador da linha do tempo, do
  // menu Animação → Marcas (tecla `M`, `nova-marca`). Duas coisas diferentes
  // com o mesmo nome fazem procurar no lugar errado, e o `tag` da §8.5 é o
  // nome novo na tela — então quem troca é ele.
  if (target.type === 'tag') return 'Etiquetas';
  if (target.type === 'deform') return 'Malha';
  if (target.type === 'sequence') return 'Sequência';
  // As três do degrau 6. Sem elas a folha desenhava a linha com o nome VAZIO —
  // a chave `body` do degrau 4b já caía aqui e saía muda, que é exatamente o
  // que a regra 21 proíbe: desenhar o que não se sabe nomear.
  if (target.type === 'body') return 'Virada de base';
  if (target.type === 'weights') return 'Pesos';
  const property = target.property ?? '';
  return PROPERTY_LABELS[property] ?? property;
}

/** Type of the constraint named `name`, or `null` when it is not in the file. */
export function constraintTypeOf(file: BoneFile, name: string | undefined): string | null {
  if (name === undefined) return null;
  for (const constraint of file.constraints ?? []) {
    if (constraint.name === name) return constraint.type;
  }
  return null;
}

/** Type of the variable named `name` (spec 8.4), or `null`. */
export function variableTypeOf(file: BoneFile, name: string | undefined): string | null {
  if (name === undefined) return null;
  for (const variable of file.variables ?? []) {
    if (variable.name === name) return variable.type;
  }
  return null;
}

/**
 * The row of spec 9.1 for a target: how many Bezier components, whether it is
 * interpolable at all, and the Portuguese label of the property.
 *
 * `file` is only read to learn the type of a constraint or of a variable,
 * which is what decides numeric versus stepped for those two.
 */
export function targetInfo(target: TimelineTarget, file?: BoneFile): TargetInfo {
  const label = labelOf(target);
  const stepped = { components: 0, interpolable: false, valueless: false, label };
  const number = { components: 1, interpolable: true, valueless: false, label };
  switch (target.type) {
    case 'bone': {
      const property = target.property ?? '';
      if (BONE_NUMERIC.has(property)) return number;
      if (BONE_BOOLEAN.has(property)) return stepped;
      return stepped;
    }
    case 'slot':
      if (target.property === 'color') return { components: 4, interpolable: true, valueless: false, label };
      if (target.property === 'darkColor') return { components: 3, interpolable: true, valueless: false, label };
      return stepped;
    case 'drawOrder':
    case 'sequence':
    case 'tag':
      return stepped;
    // A virada de corpo é só `stepped` (9.13): o rabo nasce, não cresce.
    case 'body':
      return stepped;
    case 'deform':
    // Os pesos animam como o deform: interpoláveis elemento a elemento, com
    // UMA curva para o array inteiro (9.6). O que não anima é a estrutura do
    // `binding` — quantos ossos por vértice e quais.
    case 'weights':
      // One curve for every vertex (9.3, 9.6).
      return number;
    case 'event':
      return { components: 0, interpolable: false, valueless: true, label };
    case 'constraint': {
      const property = target.property ?? '';
      if (property === 'reset') return { components: 0, interpolable: false, valueless: true, label };
      if (CONSTRAINT_BOOLEAN.has(property)) return stepped;
      return number;
    }
    case 'parameter':
    case 'morph':
      return number;
    case 'variable': {
      const kind = file === undefined ? null : variableTypeOf(file, target.target);
      return kind === 'float' || kind === 'int' ? number : stepped;
    }
    case 'nested':
      return target.property === 'animation' ? stepped : number;
    default:
      return stepped;
  }
}

// ---------------------------------------------------------------------------
// Finding the animation and the timeline
// ---------------------------------------------------------------------------

/** Loose view of a timeline, so this module does not fight the union type. */
interface TimelineLike {
  type: string;
  target?: string;
  property?: string;
  skin?: string;
  attachment?: string;
  keys?: KeyDef[];
}

export function animationIndexOf(file: BoneFile, name: string): number {
  const animations = file.animations ?? [];
  for (let i = 0; i < animations.length; i++) if (animations[i].name === name) return i;
  return -1;
}

/** Every timeline of an animation, or an empty array. */
export function timelinesOf(file: BoneFile, animation: string): TimelineDef[] {
  return findAnimation(file, animation)?.timelines ?? [];
}

/** The address of the timeline `timeline` plays. */
export function targetOfTimeline(timeline: TimelineDef): TimelineTarget {
  const t = timeline as unknown as TimelineLike;
  return normalizeTarget({
    type: t.type,
    target: t.target,
    property: t.property,
    skin: t.skin,
    attachment: t.attachment,
  });
}

/** Index of the timeline for `target` in the animation, or `-1`. */
export function timelineIndexOf(file: BoneFile, animation: string, target: TimelineTarget): number {
  const timelines = timelinesOf(file, animation);
  const wanted = targetKey(target);
  for (let i = 0; i < timelines.length; i++) {
    if (targetKey(targetOfTimeline(timelines[i])) === wanted) return i;
  }
  return -1;
}

export function findTimeline(file: BoneFile, animation: string, target: TimelineTarget): TimelineDef | null {
  const index = timelineIndexOf(file, animation, target);
  return index < 0 ? null : timelinesOf(file, animation)[index];
}

/**
 * JSON Pointer of the timeline for `target`, or `null` when it does not exist.
 *
 * With `create`, the animation's `timelines` array and the timeline itself are
 * created on the way, and the pointer always comes back. A timeline created
 * this way starts with `keys: []`, which is one key short of what spec 9.1
 * requires — the caller must add a key right away, which is what `setKey`
 * does.
 */
export function timelinePointerFor(
  file: BoneFile, animation: string, target: TimelineTarget, create = false,
): string | null {
  const animationIndex = animationIndexOf(file, animation);
  if (animationIndex < 0) return null;
  let index = timelineIndexOf(file, animation, target);
  if (index < 0) {
    if (!create) return null;
    index = createTimeline(file, animation, target);
  }
  return pointerOf('animations', animationIndex, 'timelines', index);
}

/** Appends an empty timeline for `target` and returns its index. */
function createTimeline(file: BoneFile, animation: string, target: TimelineTarget): number {
  const owner = findAnimation(file, animation);
  if (owner === null) throw new Error(`animação não encontrada: ${animation}`);
  const t = normalizeTarget(target);
  // Fields in the order of the spec table, so the JSON reads the same way the
  // documentation does.
  const timeline: TimelineLike = { type: t.type };
  if (t.target !== undefined) timeline.target = t.target;
  if (t.property !== undefined) timeline.property = t.property;
  if (THREE_PART.has(t.type)) {
    // A timeline do emissor leva o `skin` sempre, como o exemplo e os casos da
    // extensão (§9, P-016): o leitor de partículas procura por ele.
    if (t.skin !== undefined && (t.skin !== 'default' || t.type === PARTICLE_TIMELINE)) timeline.skin = t.skin;
    if (t.attachment !== undefined) timeline.attachment = t.attachment;
  }
  timeline.keys = [];
  owner.timelines ??= [];
  owner.timelines.push(timeline as unknown as TimelineDef);
  return owner.timelines.length - 1;
}

/** The timeline for `target`, created when it is missing. */
export function ensureTimeline(file: BoneFile, animation: string, target: TimelineTarget): TimelineDef {
  const found = findTimeline(file, animation, target);
  if (found !== null) return found;
  const index = createTimeline(file, animation, target);
  return timelinesOf(file, animation)[index];
}

// ---------------------------------------------------------------------------
// Reading keys
// ---------------------------------------------------------------------------

/** JSON deep copy; the file only ever holds JSON values. */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/** The times of every key of a timeline, in file order (already sorted). */
export function keyTimes(file: BoneFile, animation: string, target: TimelineTarget): number[] {
  const timeline = findTimeline(file, animation, target) as TimelineLike | null;
  if (timeline === null) return [];
  return (timeline.keys ?? []).map((key) => key.time);
}

/** Index of the key at `time` in a timeline, or `-1`. */
export function keyIndexAt(timeline: TimelineDef, time: number): number {
  const keys = (timeline as unknown as TimelineLike).keys ?? [];
  for (let i = 0; i < keys.length; i++) if (sameTime(keys[i].time, time)) return i;
  return -1;
}

/** `true` when `target` already has a key at `time` in this animation. */
export function isKeyed(file: BoneFile, animation: string, time: number, target: TimelineTarget): boolean {
  const timeline = findTimeline(file, animation, target);
  if (timeline === null) return false;
  return keyIndexAt(timeline, roundTime(time)) >= 0;
}

/** `true` when `target` has a timeline in this animation, keyed or not. */
export function hasTimeline(file: BoneFile, animation: string, target: TimelineTarget): boolean {
  return timelineIndexOf(file, animation, target) >= 0;
}

/** The key at `time`, or `null`. */
export function keyAt(
  file: BoneFile, animation: string, time: number, target: TimelineTarget,
): KeyDef | null {
  const timeline = findTimeline(file, animation, target);
  if (timeline === null) return null;
  const index = keyIndexAt(timeline, roundTime(time));
  if (index < 0) return null;
  return ((timeline as unknown as TimelineLike).keys ?? [])[index];
}

/** A `deform` key as a dense array starting at index 0 (spec 9.6). */
function denseDeform(key: KeyDef): number[] {
  const value = Array.isArray(key.value) ? (key.value as number[]) : [];
  const offset = key.offset ?? 0;
  if (offset <= 0) return value.slice();
  const out = new Array<number>(offset + value.length).fill(0);
  for (let i = 0; i < value.length; i++) out[offset + i] = value[i];
  return out;
}

function deformBetween(k0: KeyDef, k1: KeyDef, time: number): number[] {
  const a = denseDeform(k0);
  const b = denseDeform(k1);
  const length = Math.max(a.length, b.length);
  if (length === 0) return [];
  const curve = normalizeCurve(k0.curve, 1, true, k0.time, k1.time);
  const s = sampleCurve(curve, 0, k0.time, k1.time, 0, 1, time);
  const out = new Array<number>(length);
  for (let j = 0; j < length; j++) {
    const from = j < a.length ? a[j] : 0;
    const to = j < b.length ? b[j] : 0;
    out[j] = from + (to - from) * s;
  }
  return out;
}

/**
 * The value of `target` at `time` inside `animation` (spec 9.10 `evaluate`
 * plus 9.3 `amostrar`), or `undefined` when the animation has no timeline for
 * it — in that case the value is the setup pose, which `setupValueFor` reads.
 *
 * The runtime's own `evaluate` works on loaded `AnimationData`; here the file
 * is the source of truth, so the two normative primitives of the runtime
 * (`normalizeCurve` and `sampleCurve`) are applied to the JSON keys directly.
 * The edge rules are the ones of 9.10: before the first key the first key's
 * value, after the last the last one.
 */
export function valueAt(
  file: BoneFile, animation: string, time: number, target: TimelineTarget,
): KeyValue | undefined {
  const timeline = findTimeline(file, animation, target) as TimelineLike | null;
  if (timeline === null) return undefined;
  const keys = timeline.keys ?? [];
  if (keys.length === 0) return undefined;
  const info = targetInfo(target, file);
  if (info.valueless) return undefined;

  // A virada de corpo é a ÚNICA exceção à regra de 9.10: antes da primeira
  // chave vale o arquivo, e não a primeira chave (9.13) — porque toda animação
  // nasce no corpo em que foi gravada. `anim/body.ts` é quem responde por ela;
  // aqui basta não mentir.
  if (target.type === 'body' && time < keys[0].time) return null;
  if (time <= keys[0].time) return clone(keys[0].value);
  const last = keys[keys.length - 1];
  if (time >= last.time) return clone(last.value);

  let i = 0;
  for (let k = 0; k < keys.length; k++) {
    if (keys[k].time <= time) i = k;
    else break;
  }
  const k0 = keys[i];
  const k1 = keys[i + 1];
  if (!info.interpolable) return clone(k0.value);
  // `weights` junto com `deform`: os dois são um ARRAY inteiro com uma curva
  // só. Sem esta linha eles cairiam no ramo de baixo, que corta o array em
  // `info.components` — isto é, num número só, e a malha animaria um vértice.
  if (target.type === 'deform' || target.type === 'weights') return deformBetween(k0, k1, time);

  const v0 = k0.value;
  const v1 = k1.value;
  if (typeof v0 === 'number' && typeof v1 === 'number') {
    const curve = normalizeCurve(k0.curve, 1, true, k0.time, k1.time);
    return sampleCurve(curve, 0, k0.time, k1.time, v0, v1, time);
  }
  if (Array.isArray(v0) && Array.isArray(v1)) {
    const count = Math.min(v0.length, v1.length, info.components);
    const curve = normalizeCurve(k0.curve, info.components, true, k0.time, k1.time);
    const out: number[] = [];
    for (let j = 0; j < count; j++) {
      const a = Number(v0[j]);
      const b = Number(v1[j]);
      out.push(sampleCurve(curve, j, k0.time, k1.time, a, b, time));
    }
    return out;
  }
  // A segment that starts or ends in `null` is stepped (9.5, darkColor).
  return clone(v0);
}

// ---------------------------------------------------------------------------
// Duration (spec 9.11)
// ---------------------------------------------------------------------------

/** The largest key time of an animation, `0` when it has no key. */
export function lastKeyTime(animation: AnimationDef): number {
  let last = 0;
  for (const timeline of animation.timelines ?? []) {
    const keys = (timeline as unknown as TimelineLike).keys ?? [];
    for (const key of keys) if (key.time > last) last = key.time;
  }
  return last;
}

/**
 * The duration of an animation: the value it wrote down, or the last key time
 * when it wrote none (9.11). The duration is the animation's, not the last
 * key's — a written duration longer than the last key stays as it is.
 */
export function durationOf(animation: AnimationDef): number {
  return animation.duration ?? lastKeyTime(animation);
}

/** Raises a written `duration` so a key never falls outside it (L1 of 9.2). */
function growDuration(animation: AnimationDef, time: number): void {
  if (animation.duration === undefined) return;
  if (time > animation.duration) animation.duration = roundTime(time);
}

// ---------------------------------------------------------------------------
// The setup pose — what assembly mode edits (spec 5.1)
// ---------------------------------------------------------------------------

/**
 * Default of every animatable setup value, so a property absent from the file
 * still answers `setupValueFor`. The numbers are the "padrão" column of the
 * spec: 4.2 for bones, 4.3 for slots, 6.1 to 6.5 for constraints.
 */
const BONE_SETUP_DEFAULTS: Record<string, KeyValue> = {
  x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0,
  inheritRotation: true, inheritScale: true, inheritReflection: true,
};

const SLOT_SETUP_DEFAULTS: Record<string, KeyValue> = {
  attachment: null, color: [1, 1, 1, 1], darkColor: null, visible: true,
};

const CONSTRAINT_SETUP_DEFAULTS: Record<string, KeyValue> = {
  mix: 1,
  softness: 0, bendPositive: true, compress: false, stretch: false, uniform: false,
  mixRotation: 1, mixX: 1, mixY: 1, mixScaleX: 1, mixScaleY: 1, mixShearY: 1,
  position: 0, spacing: 0,
  inertia: 0.5, strength: 100, damping: 1, mass: 1, wind: 0, gravity: 0,
};

/** Index of the entry named `name` in a list of named objects, or `-1`. */
function indexByName(
  list: ReadonlyArray<{ name: string }> | undefined, name: string | undefined,
): number {
  if (list === undefined || name === undefined) return -1;
  for (let i = 0; i < list.length; i++) if (list[i].name === name) return i;
  return -1;
}

/**
 * JSON Pointer of the SETUP value a timeline overrides, or `null` when the
 * setup value is not one field of one object.
 *
 * `deform` lives in the attachment's vertices, `drawOrder` in the order of
 * `file.slots`, and `event`, `tag`, `sequence` and `nested` have no setup value
 * at all — those four return `null` on purpose, and the caller has to know what
 * to do with them.
 */
export function setupPointerFor(file: BoneFile, target: TimelineTarget): string | null {
  const name = target.target;
  const property = target.property;
  switch (target.type) {
    case 'bone': {
      const index = indexByName(file.bones, name);
      if (index < 0 || property === undefined) return null;
      return pointerOf('bones', index, property);
    }
    case 'slot': {
      const index = indexByName(file.slots, name);
      if (index < 0 || property === undefined) return null;
      return pointerOf('slots', index, property);
    }
    case 'constraint': {
      const index = indexByName(file.constraints, name);
      if (index < 0 || property === undefined) return null;
      return pointerOf('constraints', index, property);
    }
    case 'parameter': {
      const index = indexByName(file.parameters, name);
      return index < 0 ? null : pointerOf('parameters', index, 'default');
    }
    case 'morph': {
      const index = indexByName(file.morphs, name);
      return index < 0 ? null : pointerOf('morphs', index, 'weight');
    }
    case 'variable': {
      const index = indexByName(file.variables, name);
      return index < 0 ? null : pointerOf('variables', index, 'default');
    }
    // Rodada 16, lote 9: o campo do emissor, na pele do endereço.
    case PARTICLE_TIMELINE: {
      const skin = (file.skins ?? []).findIndex((s) => s.name === (target.skin ?? 'default'));
      if (skin < 0 || name === undefined || target.attachment === undefined || property === undefined) return null;
      return pointerOf('skins', skin, 'attachments', name, target.attachment, property);
    }
    default:
      return null;
  }
}

/** Os campos do emissor que a tela chaveia (rodada 16, lote 9): só `emitting`. */
const PARTICLE_KEYED = new Set(['emitting']);

/** Slot properties spec 9.1 lists as animatable. */
const SLOT_ANIMATABLE = new Set(['attachment', 'color', 'darkColor', 'visible']);

/**
 * The timeline a JSON Pointer into the setup pose belongs to — the inverse of
 * `setupPointerFor`, and `null` when the pointer names something that cannot be
 * animated at all (a bone's `name`, `length` or `parent`, a slot's `blend`).
 *
 * The properties panel needs this: it knows only pointers, and the rule of the
 * two modes is written in terms of timeline targets. A pointer that answers
 * `null` here is a structural field, and it keeps writing the file directly in
 * both modes — which is right, because no animation could carry it.
 */
export function targetForPointer(file: BoneFile, pointer: string): TimelineTarget | null {
  let parts: string[];
  try {
    parts = parsePointer(pointer);
  } catch {
    return null;
  }
  // Rodada 16, lote 9: `/skins/i/attachments/<slot>/<emissor>/emitting` é a
  // chave do emissor (§4.1). Só `emitting`, e só num anexo de partícula.
  if (parts.length === 6 && parts[0] === 'skins' && parts[2] === 'attachments' && PARTICLE_KEYED.has(parts[5]!)) {
    const skin = (file.skins ?? [])[Number(parts[1])];
    const def = (skin?.attachments as Record<string, Record<string, { type?: string }>> | undefined)?.[parts[3]!]?.[parts[4]!];
    if (skin === undefined || def?.type !== PARTICLE_TIMELINE) return null;
    return { type: PARTICLE_TIMELINE, target: parts[3]!, skin: skin.name, attachment: parts[4]!, property: parts[5]! };
  }
  if (parts.length !== 3) return null;
  const [collection, indexText, property] = parts;
  const index = Number(indexText);
  if (!Number.isInteger(index) || index < 0) return null;

  const nameOf = (list: ReadonlyArray<{ name: string }> | undefined): string | null => {
    const entry = list?.[index];
    return entry === undefined ? null : entry.name;
  };

  switch (collection) {
    case 'bones': {
      const name = nameOf(file.bones);
      if (name === null) return null;
      if (!BONE_NUMERIC.has(property) && !BONE_BOOLEAN.has(property)) return null;
      return boneTarget(name, property);
    }
    case 'slots': {
      const name = nameOf(file.slots);
      if (name === null || !SLOT_ANIMATABLE.has(property)) return null;
      return slotTarget(name, property);
    }
    case 'constraints': {
      const name = nameOf(file.constraints);
      if (name === null) return null;
      if (!(property in CONSTRAINT_SETUP_DEFAULTS)) return null;
      return constraintTarget(name, property);
    }
    case 'parameters': {
      const name = nameOf(file.parameters);
      return name === null || property !== 'default' ? null : parameterTarget(name);
    }
    case 'morphs': {
      const name = nameOf(file.morphs);
      return name === null || property !== 'weight' ? null : morphTarget(name);
    }
    case 'variables': {
      const name = nameOf(file.variables);
      return name === null || property !== 'default' ? null : variableTarget(name);
    }
    default:
      return null;
  }
}

/** The default of an animatable property when the file leaves it out. */
export function setupDefaultFor(target: TimelineTarget): KeyValue | undefined {
  const property = target.property ?? '';
  switch (target.type) {
    case 'bone': return clone(BONE_SETUP_DEFAULTS[property]);
    case 'slot': return clone(SLOT_SETUP_DEFAULTS[property]);
    case 'constraint': return clone(CONSTRAINT_SETUP_DEFAULTS[property]);
    case 'morph': return 0;
    case 'parameter': return 0;
    // QA da noite (04/11/2026): `value: []` = sem deform (§9.6). Sem isto a
    // primeira chave de deform depois de 0 nascia sozinha, a malha já
    // começava deformada, e a animação não andava (`keepStartKey`).
    case 'deform': return [];
    // §9.1 da extensão: `emitting` é `true` quando o anexo não diz.
    case PARTICLE_TIMELINE: return property === 'emitting' ? true : undefined;
    default: return undefined;
  }
}

/**
 * The value `target` has in the setup pose: what the file wrote, or the default
 * of the spec. This is the value assembly mode edits, and the value a first key
 * should carry when the user keys a property that was never animated.
 */
export function setupValueFor(file: BoneFile, target: TimelineTarget): KeyValue | undefined {
  const pointer = setupPointerFor(file, target);
  if (pointer !== null) {
    const written = getAtPointer(file, pointer);
    if (written !== undefined) return clone(written) as KeyValue;
  }
  return setupDefaultFor(target);
}

// ---------------------------------------------------------------------------
// Writing keys
// ---------------------------------------------------------------------------

/** The extra fields of spec 9.2 a key may carry, beyond `time` and `value`. */
export interface SetKeyOptions {
  /** Interpolation from this key to the next one. Absent means linear. */
  curve?: CurveDef;
  /** Only `deform`: index of the first number of `value` (9.6). */
  offset?: number;
  /** Only `event`: which event of `file.events` fires (9.7). */
  event?: string;
  int?: number;
  float?: number;
  string?: string;
  volume?: number;
  balance?: number;
  /**
   * When a key already exists at this time, keep the curve it had. Default
   * `true`: re-keying a value must not silently flatten the easing the user
   * drew.
   */
  keepCurve?: boolean;
}

/** Fields of a key that are neither `time`, `value` nor `curve`. */
const EVENT_FIELDS = ['int', 'float', 'string', 'volume', 'balance'] as const;

/**
 * Index of the key at `time`, or `-1`.
 *
 * `event` is the one timeline where several keys share a time (9.7), so there
 * the event name is part of the address; without a name the first key at that
 * time answers.
 */
function findKeyIndex(
  keys: readonly KeyDef[], time: number, target: TimelineTarget, event?: string,
): number {
  for (let i = 0; i < keys.length; i++) {
    if (!sameTime(keys[i].time, time)) continue;
    if (target.type === 'event' && event !== undefined && keys[i].event !== event) continue;
    return i;
  }
  return -1;
}

/** Where a key of time `t` goes so the array stays sorted (L1 of 9.1). */
function insertIndexFor(keys: readonly KeyDef[], time: number): number {
  for (let i = 0; i < keys.length; i++) if (keys[i].time > time) return i;
  return keys.length;
}

/** Writes `curve`, `offset` and the event fields onto a key. */
function writeKeyExtras(
  key: KeyDef, target: TimelineTarget, options: SetKeyOptions, updating: boolean,
): void {
  if (options.curve !== undefined) key.curve = clone(options.curve);
  else if (!updating || options.keepCurve === false) delete key.curve;

  if (target.type === 'deform') {
    if (options.offset !== undefined && options.offset > 0) key.offset = options.offset;
    else delete key.offset;
  }

  if (target.type !== 'event') return;
  if (options.event !== undefined) key.event = options.event;
  const fields = key as unknown as Record<string, unknown>;
  for (const field of EVENT_FIELDS) {
    const value = options[field];
    if (value !== undefined) fields[field] = value;
    else if (!updating) delete fields[field];
  }
}

// ---------------------------------------------------------------------------
// Repartir a curva quando uma chave cai no meio — defeito 3 (19/09/2026)
// ---------------------------------------------------------------------------

/*
 * **O gesto:** animação `walk`, `t = 0,3`, `Ctrl+K`. O rodapé passava de
 * "Nenhum aviso" a **2 avisos**:
 *
 *     curve cx1 0.33 outside [0.25, 0.3], clamped
 *     curve cx2 0.42 outside [0.3, 0.3], clamped
 *
 * A chave nova **parte o trecho** 0,25 → 0,5 em dois, e a curva daquele trecho
 * continuava inteira na chave de 0,25: os pontos de controle dela (em segundos
 * absolutos, §9.3) passam a cair **fora** do trecho novo, e o runtime os
 * aperta contra a borda — o que muda o desenho do movimento sem ninguém pedir.
 *
 * **Pôr uma chave no meio de um trecho não pode mudar o movimento.** Quem
 * chaveia no meio quer prender aquele instante, não redesenhar a curva. A
 * conta que faz isso é de 1959 e se chama De Casteljau: partir a Bézier no
 * parâmetro `s` dá **duas** Béziers cujo desenho, somado, é o desenho de
 * antes — exato, não aproximado.
 */

/** Um ponto `(x, y)` da curva, em segundos e em unidades de valor. */
interface Ponto { x: number; y: number }

const entre = (a: Ponto, b: Ponto, s: number): Ponto => ({
  x: a.x + (b.x - a.x) * s,
  y: a.y + (b.y - a.y) * s,
});

/**
 * Parte a Bézier `p0 p1 p2 p3` em `s`, e devolve as duas metades.
 *
 * De Casteljau: as três interpolações de um nível alimentam o seguinte, e os
 * pontos que sobram pelo caminho **são** os controles das duas metades. Não há
 * ajuste nem aproximação: as duas juntas desenham a mesma curva.
 */
function deCasteljau(
  p0: Ponto, p1: Ponto, p2: Ponto, p3: Ponto, s: number,
): { antes: [Ponto, Ponto]; depois: [Ponto, Ponto]; meio: Ponto } {
  const a = entre(p0, p1, s);
  const b = entre(p1, p2, s);
  const c = entre(p2, p3, s);
  const d = entre(a, b, s);
  const e = entre(b, c, s);
  const meio = entre(d, e, s);
  return { antes: [a, d], depois: [e, c], meio };
}

/** O valor de um componente de uma chave: o número, ou o `j`-ésimo da lista. */
function componente(value: unknown, j: number): number {
  if (Array.isArray(value)) return typeof value[j] === 'number' ? (value[j] as number) : 0;
  return typeof value === 'number' ? value : 0;
}

/**
 * A curva de `prev` repartida no tempo `t`: a metade que fica com `prev` e a
 * que vai para a chave nova. `null` quando não há o que repartir.
 *
 * Os três casos, e nenhum deles é omissão:
 *
 * | A curva de `prev` | O que acontece |
 * |:---|:---|
 * | ausente ou `linear` | nada: uma reta partida em duas dá duas retas |
 * | `stepped` | as DUAS ficam `stepped` — segurar até 0,5 é segurar até `t` e de `t` até 0,5 |
 * | Bézier | De Casteljau, componente a componente |
 */
export function splitCurveAt(
  prev: KeyDef, next: KeyDef, t: number, components: number,
): { antes: CurveDef; depois: CurveDef } | null {
  const curve = prev.curve;
  if (curve === undefined || curve === 'linear') return null;
  if (curve === 'stepped') return { antes: 'stepped', depois: 'stepped' };
  if (!Array.isArray(curve) || curve.length !== 4 * components) return null;
  if (!(prev.time < t && t < next.time)) return null;

  const antes: number[] = [];
  const depois: number[] = [];
  for (let j = 0; j < components; j++) {
    const base = j * 4;
    const cx1 = curve[base];
    const cy1 = curve[base + 1];
    const cx2 = curve[base + 2];
    const cy2 = curve[base + 3];
    if (![cx1, cy1, cx2, cy2].every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
    // O MESMO solucionador do runtime: o `s` tem de ser o que a Prévia e o
    // jogo usariam, ou a chave nova cairia num ponto que ninguém desenha.
    const s = solveBezierParameter(prev.time, cx1 as number, cx2 as number, next.time, t);
    const partes = deCasteljau(
      { x: prev.time, y: componente(prev.value, j) },
      { x: cx1 as number, y: cy1 as number },
      { x: cx2 as number, y: cy2 as number },
      { x: next.time, y: componente(next.value, j) },
      s,
    );
    antes.push(arredonda(partes.antes[0].x), arredonda(partes.antes[0].y),
      arredonda(partes.antes[1].x), arredonda(partes.antes[1].y));
    depois.push(arredonda(partes.depois[0].x), arredonda(partes.depois[0].y),
      arredonda(partes.depois[1].x), arredonda(partes.depois[1].y));
  }
  return { antes: antes as CurveDef, depois: depois as CurveDef };
}

/** Sete casas: o bastante para o pixel, sem lixo de ponto flutuante no arquivo. */
function arredonda(value: number): number {
  return Math.round(value * 1e7) / 1e7;
}

/**
 * Creates or updates the key of `target` at `time` inside `animation`.
 *
 * This is the one door every keying edit goes through. It creates the timeline
 * when there is none (with the default curve of 9.3, that is: no `curve` field
 * at all, which reads as linear), keeps the keys sorted, and raises a written
 * `duration` so the new key never falls outside it.
 *
 * Keying twice at the same time UPDATES the key; it never makes a second one.
 * The only exception is `event`, where two keys at the same time are legal and
 * the event name tells them apart (9.7).
 *
 * The file is mutated in place. Undo belongs to the commands of `pose-mode.ts`.
 */
export function setKey(
  file: BoneFile, animation: string, time: number, target: TimelineTarget,
  value?: KeyValue, options: SetKeyOptions = {},
): KeyDef {
  const owner = findAnimation(file, animation);
  if (owner === null) throw new Error(`animação não encontrada: ${animation}`);
  const t = Math.max(0, roundTime(time));
  const info = targetInfo(target, file);
  const timeline = ensureTimeline(file, animation, target) as unknown as TimelineLike;
  timeline.keys ??= [];
  const keys = timeline.keys;

  const index = findKeyIndex(keys, t, target, options.event);
  const updating = index >= 0;
  // The field order below is the order of the table of 9.2, so the JSON on disk
  // reads the same way the specification does.
  const key: KeyDef = updating ? keys[index] : { time: t };
  key.time = t;
  if (info.valueless) delete key.value;
  else key.value = clone(value) as KeyValue;
  writeKeyExtras(key, target, options, updating);

  if (!updating) {
    const at = insertIndexFor(keys, t);
    // **A chave caiu no MEIO de um trecho: a curva daquele trecho é repartida
    // com ela** — defeito 3 (19/09/2026). Sem isto os pontos de controle da
    // chave de trás ficam fora do trecho novo, o runtime os aperta contra a
    // borda, e o movimento muda sem ninguém ter pedido.
    //
    // Curva escrita pelo próprio gesto (`options.curve`) manda: quem disse
    // qual curva quer não está pondo uma chave no meio de outra.
    const prev = at > 0 ? keys[at - 1] : undefined;
    const next = at < keys.length ? keys[at] : undefined;
    if (options.curve === undefined && prev !== undefined && next !== undefined && !info.valueless) {
      const partes = splitCurveAt(prev, next, t, info.components);
      if (partes !== null) {
        prev.curve = clone(partes.antes);
        key.curve = clone(partes.depois);
      }
    }
    keys.splice(at, 0, key);
  }
  growDuration(owner, t);
  return key;
}

/**
 * **O começo se guarda sozinho** — lote 68, roteiro dos 30 minutos, passo 10.
 *
 * Girar o tronco em 0,5 s com o Gravar ligado gravava só a chave de 0,5: em 0
 * a pose já era a de 0,5, e a animação não andava. O Spriter guarda o começo.
 * Então, quando a PRIMEIRA chave de uma propriedade nasce num tempo `t > 0`,
 * nasce junto uma chave em `0` com o valor de montagem (o de antes da
 * mudança). Com a linha daquela propriedade já existindo, nada muda — mesma
 * regra do `appearKeys` do lote 57.
 *
 * Quem chama é o Gravar sozinho (`setPropertyOrKey`, `keyValuesNow`), antes
 * do `setKey`, dentro do mesmo comando: um passo de desfazer para as duas.
 * Devolve `true` quando gravou a chave em 0.
 */
export function keepStartKey(file: BoneFile, animation: string, time: number, target: TimelineTarget): boolean {
  if (roundTime(time) <= 0) return false;
  if (findTimeline(file, animation, target) !== null) return false;
  if (targetInfo(target, file).valueless) return false;
  const setup = setupValueFor(file, target);
  if (setup === undefined) return false;
  setKey(file, animation, 0, target, setup);
  return true;
}

/**
 * Removes the key of `target` at `time`. Returns `true` when one was there.
 *
 * A timeline left with no key would break L1 of 9.1 ("`keys` >= 1"), so an
 * emptied timeline goes too, and an animation left with no timeline loses its
 * `timelines` field. That way undoing the very first key of a document gives
 * back the exact JSON it started with.
 */
export function removeKey(
  file: BoneFile, animation: string, time: number, target: TimelineTarget, event?: string,
): boolean {
  const owner = findAnimation(file, animation);
  if (owner === null) return false;
  const timelineIndex = timelineIndexOf(file, animation, target);
  if (timelineIndex < 0) return false;
  const timelines = owner.timelines ?? [];
  const timeline = timelines[timelineIndex] as unknown as TimelineLike;
  const keys = timeline.keys ?? [];
  const index = findKeyIndex(keys, roundTime(time), target, event);
  if (index < 0) return false;
  keys.splice(index, 1);
  if (keys.length === 0) {
    timelines.splice(timelineIndex, 1);
    if (timelines.length === 0) delete owner.timelines;
  }
  return true;
}

/** Removes the whole timeline of `target`, keys and all. */
export function removeTimeline(file: BoneFile, animation: string, target: TimelineTarget): boolean {
  const owner = findAnimation(file, animation);
  if (owner === null) return false;
  const index = timelineIndexOf(file, animation, target);
  if (index < 0) return false;
  const timelines = owner.timelines ?? [];
  timelines.splice(index, 1);
  if (timelines.length === 0) delete owner.timelines;
  return true;
}

// ---------------------------------------------------------------------------
// Moving, scaling, copying — the dopesheet's bulk edits
// ---------------------------------------------------------------------------

/** One key, addressed the way the dopesheet points at it. */
export interface KeyRef {
  readonly target: TimelineTarget;
  readonly time: number;
  /** Only `event`, where the name separates two keys at the same time. */
  readonly event?: string;
}

export function keyRefKey(ref: KeyRef): string {
  return `${targetKey(ref.target)}@${roundTime(ref.time)}${ref.event === undefined ? '' : `#${ref.event}`}`;
}

/** Every key of an animation, in timeline order then time order. */
export function allKeyRefs(file: BoneFile, animation: string): KeyRef[] {
  const refs: KeyRef[] = [];
  for (const timeline of timelinesOf(file, animation)) {
    const target = targetOfTimeline(timeline);
    for (const key of (timeline as unknown as TimelineLike).keys ?? []) {
      refs.push(target.type === 'event'
        ? { target, time: key.time, event: key.event }
        : { target, time: key.time });
    }
  }
  return refs;
}

/**
 * As chaves já existentes das linhas do tempo destes alvos — item 11.
 *
 * "Copiar" pega as chaves marcadas na folha; sem nenhuma marcada, vale a
 * seleção da cena ou da Árvore, e é isto que traduz "o ombro escolhido" em
 * "as chaves do ombro". Um alvo sem linha na animação simplesmente não
 * aparece — não é erro, é o ombro ainda não ter sido animado.
 */
export function keyRefsForTargets(
  file: BoneFile, animation: string, targets: readonly TimelineTarget[],
): KeyRef[] {
  const wanted = new Set(targets.map((target) => targetKey(target)));
  if (wanted.size === 0) return [];
  return allKeyRefs(file, animation).filter((ref) => wanted.has(targetKey(ref.target)));
}

/**
 * Rewrites the times of the keys `refs` names, through `map`.
 *
 * A key that lands on a time another key already holds REPLACES it, which is
 * what dragging in a dopesheet does everywhere. A negative time is clamped to
 * zero: 9.2 says `time >= 0`. Returns where the keys ended up, so the panel can
 * keep the same keys selected.
 */
function retimeKeys(
  file: BoneFile, animation: string, refs: readonly KeyRef[], map: (time: number) => number,
): KeyRef[] {
  const owner = findAnimation(file, animation);
  if (owner === null) return [];
  const moved: KeyRef[] = [];

  // Group by timeline, so each array is rebuilt once.
  const byTimeline = new Map<string, KeyRef[]>();
  for (const ref of refs) {
    const id = targetKey(ref.target);
    const list = byTimeline.get(id);
    if (list === undefined) byTimeline.set(id, [ref]);
    else list.push(ref);
  }

  for (const [, list] of byTimeline) {
    const target = list[0].target;
    const timeline = findTimeline(file, animation, target) as TimelineLike | null;
    if (timeline === null) continue;
    const keys = timeline.keys ?? [];
    // Rodada 40, lote 4: as alças como frações do trecho, ANTES de mexer.
    const units = unitsByKey(keys);

    // Pull the selected keys out first, so two of them can swap places.
    const taken: KeyDef[] = [];
    for (const ref of list) {
      const index = findKeyIndex(keys, roundTime(ref.time), target, ref.event);
      if (index < 0) continue;
      taken.push(keys[index]);
      keys.splice(index, 1);
    }
    // Later keys first would fight with the clamp at zero, so put them back in
    // the order the user sees them.
    taken.sort((a, b) => a.time - b.time);

    for (const key of taken) {
      const t = Math.max(0, roundTime(map(key.time)));
      key.time = t;
      const clash = findKeyIndex(keys, t, target, key.event);
      if (clash >= 0 && target.type !== 'event') keys.splice(clash, 1);
      keys.splice(insertIndexFor(keys, t), 0, key);
      moved.push(target.type === 'event'
        ? { target, time: t, event: key.event }
        : { target, time: t });
      growDuration(owner, t);
    }
    // ...e de novo em segundos, no trecho novo de cada chave (rodada 40, lote 4).
    reapplyUnits(keys, units);
  }
  return moved;
}

/** Slides keys along the time axis by `delta` seconds. */
export function moveKeys(
  file: BoneFile, animation: string, refs: readonly KeyRef[], delta: number,
): KeyRef[] {
  return retimeKeys(file, animation, refs, (time) => time + delta);
}

/** Stretches keys around `pivot`: `t -> pivot + (t - pivot) * factor`. */
export function scaleKeys(
  file: BoneFile, animation: string, refs: readonly KeyRef[], pivot: number, factor: number,
): KeyRef[] {
  return retimeKeys(file, animation, refs, (time) => pivot + (time - pivot) * factor);
}

/** Keys lifted out of an animation, ready to be pasted somewhere else. */
export interface KeyClipboard {
  /** Time of the earliest key; every offset below is measured from it. */
  readonly base: number;
  readonly items: ReadonlyArray<{
    readonly target: TimelineTarget;
    readonly offset: number;
    readonly key: KeyDef;
    /**
     * As alças da chave como frações do trecho de origem — rodada 40, lote 4.
     * A curva do arquivo é em SEGUNDOS absolutos; colada noutro tempo, ela
     * ficava com as alças no lugar velho. Ao colar, isto é reescrito no trecho
     * novo. Ausente: a chave não tem Bézier, ou era a última da linha.
     */
    readonly unit?: ReadonlyArray<UnitControlPoints>;
  }>;
}

/** Copies the keys `refs` names. The clipboard holds clones, not references. */
export function copyKeys(
  file: BoneFile, animation: string, refs: readonly KeyRef[],
): KeyClipboard {
  const items: Array<{ target: TimelineTarget; offset: number; key: KeyDef; unit?: UnitControlPoints[] }> = [];
  let base = Number.POSITIVE_INFINITY;
  for (const ref of refs) {
    const timeline = findTimeline(file, animation, ref.target) as TimelineLike | null;
    if (timeline === null) continue;
    const keys = timeline.keys ?? [];
    const index = findKeyIndex(keys, roundTime(ref.time), ref.target, ref.event);
    if (index < 0) continue;
    const key = clone(keys[index]);
    if (key.time < base) base = key.time;
    const unit = unitsOfKey(keys[index], keys[index + 1]);
    items.push(unit === null
      ? { target: normalizeTarget(ref.target), offset: 0, key }
      : { target: normalizeTarget(ref.target), offset: 0, key, unit });
  }
  if (!Number.isFinite(base)) base = 0;
  for (const item of items) item.offset = roundTime(item.key.time - base);
  return { base, items };
}

/**
 * Writes the clipboard into `animation`, with its earliest key at `time`.
 * Curves, `offset` and event fields travel with the key.
 */
export function pasteKeys(
  file: BoneFile, animation: string, clipboard: KeyClipboard, time: number,
): KeyRef[] {
  const start = Math.max(0, roundTime(time));
  const written: KeyRef[] = [];
  for (const item of clipboard.items) {
    const at = roundTime(start + item.offset);
    const options: SetKeyOptions = { curve: item.key.curve, keepCurve: false };
    if (item.key.offset !== undefined) options.offset = item.key.offset;
    if (item.key.event !== undefined) options.event = item.key.event;
    for (const field of EVENT_FIELDS) {
      const value = (item.key as unknown as Record<string, unknown>)[field];
      if (value !== undefined) (options as unknown as Record<string, unknown>)[field] = value;
    }
    setKey(file, animation, at, item.target, item.key.value, options);
    written.push(item.target.type === 'event'
      ? { target: item.target, time: at, event: item.key.event }
      : { target: item.target, time: at });
  }
  applyClipUnits(file, animation, clipboard.items, written);
  return written;
}

/**
 * Clona as chaves `refs` deslocadas por `delta` — item 6, "Ctrl ao arrastar
 * clona a chave, deixando a original onde estava".
 *
 * `moveKeys` desloca; isto copia e escreve no lugar novo, sem tocar nas de
 * origem — a mesma dupla `copyKeys` + `pasteKeys` do Colar, só que o destino
 * é `clip.base + delta` em vez de um tempo escolhido à mão: cada chave anda
 * exatamente `delta`, não importa qual das escolhidas foi a arrastada.
 */
export function cloneKeys(
  file: BoneFile, animation: string, refs: readonly KeyRef[], delta: number,
): KeyRef[] {
  const clip = copyKeys(file, animation, refs);
  return pasteKeys(file, animation, clip, clip.base + delta);
}

// ---------------------------------------------------------------------------
// Chaves em bloco — itens 85 a 91
// ---------------------------------------------------------------------------

/**
 * A POSE inteira num instante, pronta para colar — item 85.
 *
 * Diferente de copiar chaves: aqui não interessa onde estão as chaves, e sim
 * **como o personagem está** naquele instante. Um tempo no meio de duas chaves
 * dá o valor interpolado, que é o que se vê na tela — e é isso que se quer
 * levar para outra animação.
 *
 * Um item por linha do tempo. `offset` é sempre zero: uma pose é um instante,
 * não um trecho.
 *
 * `targets`, quando dado, restringe às linhas destes alvos — item 9, "Copiar
 * a pose só do escolhido": o mesmo `Ctrl+Shift+C`, com menos linhas. Omitido
 * ou `null` copia a pose inteira, como sempre foi.
 */
export function poseAt(
  file: BoneFile, animation: string, time: number,
  targets?: readonly TimelineTarget[] | null,
): KeyClipboard {
  const at = roundTime(time);
  const wanted = targets == null ? null : new Set(targets.map((target) => targetKey(target)));
  const items: Array<{ target: TimelineTarget; offset: number; key: KeyDef }> = [];
  for (const timeline of timelinesOf(file, animation)) {
    const target = targetOfTimeline(timeline);
    // Um evento não tem "valor agora": ele acontece ou não acontece. Copiar a
    // pose não pode inventar um disparo que ninguém pediu.
    if (target.type === 'event') continue;
    if (wanted !== null && !wanted.has(targetKey(target))) continue;
    const value = valueAt(file, animation, at, target);
    if (value === undefined) continue;
    items.push({ target, offset: 0, key: { time: at, value } as KeyDef });
  }
  return { base: at, items };
}

/**
 * Escreve o valor copiado em **toda** chave da linha — itens 86 e 31.
 *
 * "A mão fechada em todas as poses", "o pé sempre neste ângulo": muda uma coisa
 * e a repete pela animação inteira, sem tocar no TEMPO de nada.
 *
 * Devolve quantas chaves foram escritas.
 */
export function pasteToAllKeys(
  file: BoneFile, animation: string, clipboard: KeyClipboard,
): number {
  let count = 0;
  for (const item of clipboard.items) {
    const timeline = findTimeline(file, animation, item.target) as TimelineLike | null;
    if (timeline === null) continue;
    for (const key of timeline.keys ?? []) {
      key.value = clone(item.key.value) as typeof key.value;
      count += 1;
    }
  }
  return count;
}

/**
 * Apaga as linhas do tempo inteiras destes alvos — item 87.
 *
 * Não é apagar uma chave: é tirar a propriedade da animação. Depois disto o
 * osso segue a pose de repouso ali, porque a animação deixou de ter opinião
 * sobre ele.
 *
 * Devolve quantas linhas saíram.
 */
export function removeTimelines(
  file: BoneFile, animation: string, targets: readonly TimelineTarget[],
): number {
  const owner = findAnimation(file, animation);
  if (owner === null) return 0;
  const wanted = new Set(targets.map((target) => targetKey(target)));
  const before = (owner.timelines ?? []).length;
  owner.timelines = (owner.timelines ?? [])
    .filter((timeline) => !wanted.has(targetKey(targetOfTimeline(timeline))));
  return before - (owner.timelines?.length ?? 0);
}

/** Apaga TODAS as linhas do tempo da animação — item 88. Devolve quantas. */
export function clearAnimation(file: BoneFile, animation: string): number {
  const owner = findAnimation(file, animation);
  if (owner === null) return 0;
  const before = (owner.timelines ?? []).length;
  owner.timelines = [];
  return before;
}

/**
 * Move as chaves E empurra as que vêm depois — item 89.
 *
 * Sem isto, mover uma chave para a direita a encosta na seguinte e come o
 * intervalo entre as duas. Com isto, o resto da animação anda junto: dar mais
 * meio segundo para o começo não estraga o final.
 *
 * As empurradas são as das MESMAS linhas das `refs`, depois da primeira delas.
 * Empurrar linhas que ninguém escolheu seria mexer no que não foi pedido.
 *
 * **Sem gesto por enquanto** (14/09/2026): as três teclas do arrasto de chave
 * já têm dono (`Ctrl` clona — item 6, `Shift` soma à seleção, `Alt` tira o
 * encaixe do quadro), e não sobrou nenhuma livre para esta. A função e os
 * testes continuam prontos; dar um gesto a ela — um interruptor na folha,
 * como no Spine, por exemplo — é decisão do Humberto, e é o item 4
 * ("empurrar por número") que cobre a necessidade por ora, por comando.
 */
export function rippleMove(
  file: BoneFile, animation: string, refs: readonly KeyRef[], delta: number,
): KeyRef[] {
  if (refs.length === 0) return [];
  let first = Number.POSITIVE_INFINITY;
  for (const ref of refs) first = Math.min(first, ref.time);
  const lines = new Set(refs.map((ref) => targetKey(ref.target)));
  const chosen = new Set(refs.map((ref) => keyRefKey(ref)));

  const all: KeyRef[] = [...refs];
  for (const timeline of timelinesOf(file, animation)) {
    const target = targetOfTimeline(timeline);
    if (!lines.has(targetKey(target))) continue;
    for (const key of (timeline as unknown as TimelineLike).keys ?? []) {
      if (key.time <= first + TIME_EPSILON) continue;
      const ref: KeyRef = target.type === 'event'
        ? { target, time: key.time, event: key.event }
        : { target, time: key.time };
      if (chosen.has(keyRefKey(ref))) continue;
      all.push(ref);
    }
  }
  // Para a direita, as de trás primeiro; para a esquerda, as da frente. Assim
  // duas chaves nunca disputam o mesmo instante no meio do caminho.
  all.sort((a, b) => (delta >= 0 ? b.time - a.time : a.time - b.time));
  return moveKeys(file, animation, all, delta);
}

// ---------------------------------------------------------------------------
// Limpar chaves repetidas — item 8, 14/09/2026
// ---------------------------------------------------------------------------

/** O valor de uma chave `deform`, ou o de qualquer outra — para comparar. */
function sameKeyValue(target: TimelineTarget, a: KeyDef, b: KeyDef): boolean {
  if (target.type === 'deform') {
    const da = denseDeform(a);
    const db = denseDeform(b);
    const length = Math.max(da.length, db.length);
    for (let i = 0; i < length; i++) if ((da[i] ?? 0) !== (db[i] ?? 0)) return false;
    return true;
  }
  const va = a.value;
  const vb = b.value;
  if (Array.isArray(va) && Array.isArray(vb)) {
    return va.length === vb.length && va.every((v, i) => v === vb[i]);
  }
  return va === vb;
}

/** Quantas chaves saíram, e quantas delas eram a primeira ou a última da linha. */
export interface CleanKeysReport {
  readonly removed: number;
  readonly edges: number;
}

/**
 * Tira a chave que não muda nada — item 8, o lixo que o gravar-sozinho deixa
 * (o "Clean Up" do Spine). Uma chave sai quando a de antes e a de depois já
 * têm o mesmo valor que ela: o trecho já estava constante, e ela não segurava
 * nada que as vizinhas não seguravam sozinhas.
 *
 * Duas cautelas, pedidas pelo Humberto:
 * - **Nunca uma chave `parada` (`stepped`), nem a que RECEBE um degrau
 *   parado.** Repetida no valor não quer dizer inútil no tempo: uma chave
 *   parada segura o valor de propósito, e o instante em que ela segura é a
 *   informação — apagá-la porque o número não mudou seria perder isso.
 * - Linha não numérica (`event`, `attachment`, `drawOrder`, `sequence`,
 *   `tag`...) não entra: ela já é sempre "parada" por natureza (9.3), mesmo
 *   sem o campo `curve` escrito, e a mesma regra vale para ela inteira.
 *
 * Nunca esvazia uma linha: pelo menos uma chave sempre fica (L1 de 9.1). Se
 * `targets` vier, só essas linhas entram — sem ele, a animação inteira.
 *
 * Devolve quantas chaves saíram, e quantas delas eram a PRIMEIRA ou a ÚLTIMA
 * da própria linha — não é proibido tirar uma ponta, mas quem chama tem que
 * CONTAR isso para o Humberto, nunca escondido dentro de um número só.
 */
export function cleanRepeatedKeys(
  file: BoneFile, animation: string, targets?: readonly TimelineTarget[] | null,
): CleanKeysReport {
  const wanted = targets == null ? null : new Set(targets.map((target) => targetKey(target)));
  let removed = 0;
  let edges = 0;

  for (const timeline of timelinesOf(file, animation)) {
    const target = targetOfTimeline(timeline);
    if (wanted !== null && !wanted.has(targetKey(target))) continue;
    if (!targetInfo(target, file).interpolable) continue;
    const keys = (timeline as unknown as TimelineLike).keys ?? [];

    let i = 1;
    while (keys.length > 2 && i < keys.length - 1) {
      const prev = keys[i - 1];
      const key = keys[i];
      const next = keys[i + 1];
      const segura = prev.curve === 'stepped' || key.curve === 'stepped';
      if (!segura && sameKeyValue(target, prev, key) && sameKeyValue(target, key, next)) {
        keys.splice(i, 1);
        removed += 1;
        continue;
      }
      i += 1;
    }

    while (keys.length >= 2 && keys[0].curve !== 'stepped' && sameKeyValue(target, keys[0], keys[1])) {
      keys.splice(0, 1);
      removed += 1;
      edges += 1;
    }
    while (
      keys.length >= 2
      && keys[keys.length - 2].curve !== 'stepped'
      && sameKeyValue(target, keys[keys.length - 1], keys[keys.length - 2])
    ) {
      keys.pop();
      removed += 1;
      edges += 1;
    }
  }
  return { removed, edges };
}

// ---------------------------------------------------------------------------
// Rows of the dopesheet
// ---------------------------------------------------------------------------

/** One line of the dopesheet: one timeline, with the times of its keys. */
export interface TimelineRow {
  readonly target: TimelineTarget;
  /** Id of the group this row hangs under. */
  readonly group: string;
  /** Property name the user reads, e.g. "Rotação". */
  readonly label: string;
  readonly times: readonly number[];
}

/** A bone, a slot, a constraint — the thing whose rows are drawn together. */
export interface RowGroup {
  readonly id: string;
  /** e.g. "Osso braco". */
  readonly label: string;
  readonly rows: readonly TimelineRow[];
}

const GROUP_WORDS: Record<string, string> = {
  bone: 'Osso',
  slot: 'Slot',
  constraint: 'Regra',
  parameter: 'Parâmetro',
  morph: 'Morph',
  variable: 'Variável',
  deform: 'Malha',
  sequence: 'Sequência',
  weights: 'Pesos',
  nested: 'Entidade',
  [PARTICLE_TIMELINE]: 'Emissor',
};

/** Which group a timeline belongs to, and the words the user reads for it. */
export function groupOf(target: TimelineTarget): { id: string; label: string } {
  // A virada de corpo é do CORPO, não de um osso nem de um slot: ela tem grupo
  // próprio, e fica sozinha nele. Cair em "Geral" a esconderia entre os
  // eventos e a ordem de desenho, e ela é a coisa mais estrutural da folha —
  // dali em diante o personagem é outro.
  if (target.type === 'body') return { id: 'body', label: 'Virada de base' };
  const word = GROUP_WORDS[target.type];
  if (word === undefined || target.target === undefined) {
    return { id: 'geral', label: 'Geral' };
  }
  if (THREE_PART.has(target.type)) {
    const attachment = target.attachment ?? '';
    return {
      id: `${target.type}:${target.target}:${attachment}`,
      label: `${word} ${target.target} / ${attachment}`,
    };
  }
  return { id: `${target.type}:${target.target}`, label: `${word} ${target.target}` };
}

/**
 * Every timeline of an animation, grouped by the thing it animates, in the
 * order the timelines appear in the file. One group per bone, per slot, per
 * constraint; `drawOrder`, `event` and `tag` share the group "Geral".
 */
export function dopesheetGroups(
  file: BoneFile,
  animation: string,
  /**
   * Quando dado, só as linhas do que está escolhido — item 95.
   *
   * Um personagem com sessenta linhas é uma folha que não cabe na tela; com o
   * filtro ligado, ficam as três ou quatro do osso em que se está trabalhando.
   * A linha Resumo continua mostrando TODAS as chaves, porque ela é o mapa.
   */
  onlySelected: { bones: readonly string[]; slots: readonly string[] } | null = null,
): RowGroup[] {
  const wantBones = onlySelected === null ? null : new Set(onlySelected.bones);
  const wantSlots = onlySelected === null ? null : new Set(onlySelected.slots);
  const groups: Array<{ id: string; label: string; rows: TimelineRow[] }> = [];
  const byId = new Map<string, { id: string; label: string; rows: TimelineRow[] }>();
  for (const timeline of timelinesOf(file, animation)) {
    const target = targetOfTimeline(timeline);
    // Rodada 8d: o osso próprio de uma imagem é a IMAGEM, para quem olha. A
    // linha dele leva o nome dela, e aparece quando ela está escolhida.
    const ownSlot = target.type === 'bone' && target.target !== undefined
      ? slotOfOwnBone(file, target.target) : null;
    if (wantBones !== null && wantSlots !== null) {
      const name = target.target;
      const keep = (target.type === 'bone' && name !== undefined && wantBones.has(name))
        || (ownSlot !== null && wantSlots.has(ownSlot))
        // A virada de corpo NUNCA é filtrada, como a linha Resumo: ela não é
        // de um osso nem de um slot, e dali em diante o personagem é outro.
        // Esconder isso porque o osso do braço está escolhido seria a folha
        // deixar de avisar a coisa mais estrutural que ela tem (regra 21).
        || target.type === 'body'
        || (target.type !== 'bone' && name !== undefined && wantSlots.has(name));
      if (!keep) continue;
    }
    const group = groupOf(target);
    if (ownSlot !== null) group.label = ownBoneLabel(file, target.target!) ?? `Imagem ${ownSlot}`;
    let bucket = byId.get(group.id);
    if (bucket === undefined) {
      bucket = { id: group.id, label: group.label, rows: [] };
      byId.set(group.id, bucket);
      groups.push(bucket);
    }
    bucket.rows.push({
      target,
      group: group.id,
      label: targetInfo(target, file).label,
      times: ((timeline as unknown as TimelineLike).keys ?? []).map((key) => key.time),
    });
  }
  return groups;
}

// ---------------------------------------------------------------------------
// As células em degrau — degrau 6 (17/09/2026), tarefas 6.3, 6.4 e 6.5
// ---------------------------------------------------------------------------

/**
 * Um pedaço de linha em que um valor de TEXTO vale, do começo ao fim.
 *
 * Um losango diz *quando* alguma coisa muda; ele não diz **para o quê**. Numa
 * linha de rotação isso basta, porque o número está na cena. Numa linha que
 * carrega um NOME — o corpo que a virada colou, o osso para o qual o desenho
 * mudou, a animação que a entidade passou a tocar — o losango sozinho é a
 * folha calando o que ela sabe. Daí a célula: uma faixa com o nome escrito,
 * que vale da chave até a chave seguinte.
 */
export interface StepCell {
  /** Onde o valor passa a valer. */
  readonly from: number;
  /** Onde ele para de valer: a chave seguinte, ou o fim da animação. */
  readonly to: number;
  /** O que vai escrito na célula. */
  readonly text: string;
  /** A frase inteira da dica: o que a célula diz, sem abreviar. */
  readonly title: string;
}

/** As linhas que se leem melhor em célula com nome do que em losango só. */
export function hasSteppedCells(target: TimelineTarget): boolean {
  if (target.type === 'body') return true;
  if (target.type === 'slot' && target.property === 'bone') return true;
  if (target.type === 'nested' && target.property === 'animation') return true;
  return false;
}

/**
 * O nome curto de um corpo, a partir do uri que a chave `body` grava.
 *
 * `personagens/lobisomem.bone` vira `lobisomem`. O nome bonito de verdade
 * (`skeleton.name`) mora no `Doc` do outro corpo, e esta função é pura: ela dá
 * o que dá sem mentir, e quem desenha põe o uri inteiro na dica.
 */
export function bodyShortName(uri: string | null | undefined): string {
  if (uri === null || uri === undefined || uri === '') return 'o arquivo';
  const file = uri.split(/[\\/]/).pop() ?? uri;
  return file.replace(/\.(bone|boneb|bonez)$/i, '');
}

/** O que uma célula escreve para o valor de uma chave, por tipo de linha. */
function cellTextOf(target: TimelineTarget, value: unknown): { text: string; title: string } {
  if (target.type === 'body') {
    const uri = typeof value === 'string' ? value : null;
    return {
      text: bodyShortName(uri),
      title: uri === null
        ? 'Daqui em diante vale a base do próprio arquivo'
        : `Daqui em diante vale a base ${bodyShortName(uri)} (${uri})`,
    };
  }
  if (target.type === 'slot' && target.property === 'bone') {
    const bone = typeof value === 'string' ? value : null;
    return {
      text: bone ?? 'o osso do arquivo',
      title: bone === null
        ? 'Daqui em diante o desenho volta ao osso do arquivo'
        : `Daqui em diante o desenho é do osso ${bone}`,
    };
  }
  const name = typeof value === 'string' ? value : null;
  return {
    text: name ?? '(nenhuma)',
    title: name === null
      ? 'Daqui em diante a entidade não toca animação nenhuma por cima'
      : `Daqui em diante a entidade toca ${name}`,
  };
}

/**
 * As células de uma linha em degrau, em ordem de tempo.
 *
 * Cada chave abre uma célula que vai até a chave seguinte; a última vai até o
 * fim da animação. Uma animação sem duração escrita usa o último tempo de
 * chave (9.11), e aí a última célula tem largura zero — o que é honesto: não
 * há tempo depois dela.
 */
export function steppedCells(
  file: BoneFile, animation: string, target: TimelineTarget,
): StepCell[] {
  const timeline = findTimeline(file, animation, target) as TimelineLike | null;
  const owner = findAnimation(file, animation);
  if (timeline === null || owner === null) return [];
  const keys = timeline.keys ?? [];
  const end = durationOf(owner);
  const cells: StepCell[] = [];
  for (let i = 0; i < keys.length; i++) {
    const from = keys[i].time;
    const to = i + 1 < keys.length ? keys[i + 1].time : Math.max(end, from);
    const { text, title } = cellTextOf(target, keys[i].value);
    cells.push({ from, to, text, title: `${title}, a partir de ${from.toFixed(2).replace('.', ',')} s` });
  }
  return cells;
}

/** Every key time of the animation, sorted, with no repeats. */
export function allKeyTimes(file: BoneFile, animation: string): number[] {
  const times = new Set<number>();
  for (const timeline of timelinesOf(file, animation)) {
    for (const key of (timeline as unknown as TimelineLike).keys ?? []) times.add(key.time);
  }
  return [...times].sort((a, b) => a - b);
}

/** The largest key time strictly before `time`, or `null`. */
export function previousKeyTime(times: readonly number[], time: number): number | null {
  let found: number | null = null;
  for (const t of times) if (t < time - TIME_EPSILON) found = t;
  return found;
}

/** The smallest key time strictly after `time`, or `null`. */
export function nextKeyTime(times: readonly number[], time: number): number | null {
  for (const t of times) if (t > time + TIME_EPSILON) return t;
  return null;
}

// ---------------------------------------------------------------------------
// A curva de uma chave, pelo botão direito — item 26
// ---------------------------------------------------------------------------

/**
 * Os nomes que o menu do losango oferece — rodada 40, lote 1.
 *
 * Eram três (Linear, Suave, Parada) e o gráfico tinha outros sete, com nomes
 * próprios: a mesma curva parada se chamava **Parada** num lugar e **Degrau**
 * no outro, e a "Suave" do menu não era a "Suave" do gráfico (um terço no
 * tempo contra 0,42/0,58). Agora o nome, a dica e a curva vêm do MESMO botão
 * do gráfico (`CURVE_PRESETS`): um nome por coisa, e o menu da chave ganha a
 * Entrada suave e a Saída suave, que o DragonBones põe na mesma lista.
 */
export type CurveKind = 'linear' | 'suave' | 'entrada-suave' | 'saida-suave' | 'parada';

/** O botão do gráfico de cada nome do menu. */
const PRESET_OF: Readonly<Record<CurveKind, string>> = Object.freeze({
  linear: 'linear',
  suave: 'suave',
  'entrada-suave': 'entrada-suave',
  'saida-suave': 'saida-suave',
  parada: 'degrau',
});

/** O que se lê em cada um, na ordem em que eles aparecem no menu. */
export const CURVE_KINDS: ReadonlyArray<{ id: CurveKind; label: string; hint: string }> =
  Object.freeze((['linear', 'suave', 'entrada-suave', 'saida-suave', 'parada'] as const).map((id) => {
    const preset = findPreset(PRESET_OF[id]);
    if (preset === null) throw new Error(`curva sem botão no gráfico: ${id}`);
    return Object.freeze({ id, label: preset.label, hint: preset.hint });
  }));

/** Os números de um valor de chave, ou `null` quando ele não é número. */
function numbersOf(value: unknown): number[] | null {
  if (typeof value === 'number') return [value];
  if (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'number')) {
    return value as number[];
  }
  return null;
}

/**
 * A curva "Suave", em números — item 26.
 *
 * O formato não tem a palavra "suave": ele tem `linear`, `stepped` e uma Bézier
 * de quatro números por componente (9.3), em coordenadas ABSOLUTAS — `cx` em
 * segundos e `cy` na unidade do valor. "Suave" é, então, a Bézier clássica de
 * sair devagar e chegar devagar: as duas alças ficam a um terço do caminho no
 * tempo, e na ALTURA de cada ponta.
 *
 * Escrever a palavra e deixar o leitor adivinhar seria pior: uma string
 * desconhecida vira `linear` (2.5), e a animação sairia diferente no jogo.
 */
export function smoothCurve(t0: number, v0: number, t1: number, v1: number): number[] {
  const third = (t1 - t0) / 3;
  return [t0 + third, v0, t1 - third, v1];
}

/**
 * Escreve a curva nas chaves escolhidas. Devolve quantas mudaram.
 *
 * A curva é sempre **desta chave até a próxima** (9.2), então a última chave de
 * uma linha não tem para onde curvar: escrever nela não faria nada no jogo e
 * faria o arquivo carregar um campo que ninguém lê. Ela é pulada, e o número
 * devolvido conta só o que mudou de verdade.
 *
 * Numa linha de valor não numérico — `attachment`, `event`, `drawOrder` — só
 * `stepped` existe (9.3), e é o que fica gravado seja qual for a escolha.
 */
export function setKeyCurve(
  file: BoneFile, animation: string, refs: readonly KeyRef[], kind: CurveKind,
): number {
  let changed = 0;
  for (const ref of refs) {
    const timeline = findTimeline(file, animation, ref.target);
    if (timeline === null) continue;
    const keys = (timeline as unknown as { keys?: Array<Record<string, unknown>> }).keys ?? [];
    const index = keys.findIndex((key) => sameTime(Number(key['time'] ?? 0), ref.time));
    if (index < 0 || index === keys.length - 1) continue;
    const key = keys[index];
    const next = keys[index + 1];

    if (kind === 'parada') {
      key['curve'] = 'stepped';
    } else if (kind === 'linear') {
      // Ausente É linear (9.3). Apagar o campo deixa o arquivo menor e diz a
      // mesma coisa — e é o que uma chave nova já faz.
      delete key['curve'];
    } else {
      const v0 = numbersOf(key['value']);
      const v1 = numbersOf(next['value']);
      const preset = findPreset(PRESET_OF[kind]);
      if (v0 === null || v1 === null || v0.length !== v1.length || preset === null) {
        // Valor que não é número só aceita `stepped` (9.3).
        key['curve'] = 'stepped';
      } else {
        // A MESMA curva do botão do gráfico — rodada 40, lote 1.
        key['curve'] = presetCurve(preset, Number(key['time'] ?? 0), Number(next['time'] ?? 0), v0, v1);
      }
    }
    changed += 1;
  }
  return changed;
}

/** O nome da curva que a chave tem hoje, para a marca do menu e a dica do losango. */
export function curveKindOf(
  file: BoneFile, animation: string, ref: KeyRef,
): CurveKind | 'outra' {
  const timeline = findTimeline(file, animation, ref.target);
  const keys = (timeline as unknown as { keys?: Array<Record<string, unknown>> } | null)?.keys ?? [];
  const index = keys.findIndex((item) => sameTime(Number(item['time'] ?? 0), ref.time));
  if (index < 0) return 'linear';
  const key = keys[index]!;
  const curve = key['curve'];
  if (curve === undefined || curve === 'linear') return 'linear';
  if (curve === 'stepped') return 'parada';
  return bezierKindOf(curve, key, keys[index + 1]);
}

/** Qual dos três suaves esta Bézier é, componente por componente, ou `'outra'`. */
const SMOOTH_IDS = ['suave', 'entrada-suave', 'saida-suave'] as const;
/** A "Suave" que o menu gravava antes da rodada 40: alças a um terço, na altura das pontas. */
const OLD_SMOOTH = Object.freeze({ x1: 1 / 3, y1: 0, x2: 2 / 3, y2: 1 });
function bezierKindOf(
  curve: unknown, key: Record<string, unknown>, next: Record<string, unknown> | undefined,
): CurveKind | 'outra' {
  if (!Array.isArray(curve) || next === undefined) return 'outra';
  const v0 = numbersOf(key['value']);
  const v1 = numbersOf(next['value']);
  if (v0 === null || v1 === null || v0.length !== v1.length || curve.length !== 4 * v0.length) return 'outra';
  const t0 = Number(key['time'] ?? 0);
  const t1 = Number(next['time'] ?? 0);
  const units = v0.map((start, c) => ({
    unit: toUnit({ cx1: Number(curve[4 * c]), cy1: Number(curve[4 * c + 1]), cx2: Number(curve[4 * c + 2]), cy2: Number(curve[4 * c + 3]) },
      t0, start, t1, v1[c]!),
    flat: start === v1[c],
  }));
  const close = (a: number, b: number): boolean => Math.abs(a - b) < 0.02;
  const matches = (want: { x1: number; y1: number; x2: number; y2: number }): boolean => units.every(({ unit, flat }) =>
    close(unit.x1, want.x1) && close(unit.x2, want.x2) && (flat || (close(unit.y1, want.y1) && close(unit.y2, want.y2))));
  for (const id of SMOOTH_IDS) {
    const unit = findPreset(id)?.unit;
    if (unit && matches(unit)) return id;
  }
  return matches(OLD_SMOOTH) ? 'suave' : 'outra';
}

// ---------------------------------------------------------------------------
// A duração da animação — item 11
// ---------------------------------------------------------------------------

/** Quantas chaves ficariam DEPOIS do novo fim. Zero é a resposta boa. */
export function keysAfter(file: BoneFile, animation: string, time: number): number {
  let count = 0;
  for (const timeline of timelinesOf(file, animation)) {
    for (const key of (timeline as unknown as { keys?: Array<{ time?: number }> }).keys ?? []) {
      if (Number(key.time ?? 0) > time + TIME_EPSILON) count += 1;
    }
  }
  return count;
}

/**
 * Muda a duração, esticando as chaves junto ou não — item 11.
 *
 * **Esticar** multiplica todo tempo por `nova/antiga`, com o zero parado: uma
 * caminhada de um segundo vira a mesma caminhada em dois, mais lenta. **Não
 * esticar** mexe só no número: as chaves ficam onde estão, e quem quiser saber
 * quantas passaram do fim pergunta a `keysAfter` ANTES de chamar isto.
 */
export function setDuration(
  file: BoneFile, animation: string, seconds: number, stretch: boolean,
): void {
  const found = findAnimation(file, animation);
  if (found === null) return;
  const old = durationOf(found);
  const next = Math.max(0, seconds);
  if (stretch && old > 0 && next > 0) {
    const refs = allKeyRefs(file, animation);
    scaleKeys(file, animation, refs, 0, next / old);
  }
  (found as { duration?: number }).duration = next;
}

// ---------------------------------------------------------------------------
// Mostrar a chave que acabou de nascer — P12, K12 (chat D, lote 2a, 29/09/2026)
// ---------------------------------------------------------------------------

/**
 * Quem desenha a linha do tempo escuta aqui. Uma função só por vez: há uma
 * linha do tempo só.
 */
let revealListener: ((ref: KeyRef) => void) | null = null;
/** O pedido que chegou antes de alguém escutar — ele é entregue ao escutar. */
let pendingReveal: KeyRef | null = null;

/**
 * **Mostre esta chave** — a régua do arroz, "criei e sumiu" (P12).
 *
 * Com a linha do tempo em "Resumo", nenhuma linha é desenhada: a chave que
 * acabou de nascer era um losango no Resumo e mais nada — a virada de corpo, a
 * troca de imagem (K12), a ordem de desenho, a etiqueta. Quem cria uma chave
 * que não se vê na cena chama isto logo depois do `doc.run`, e a linha do
 * tempo **abre os Detalhes**, **escolhe a chave** e **rola até ela**.
 *
 * Não é uma ação de menu (não há gesto próprio para "mostrar"): é a porta que
 * o código de quem cria chama. Mora aqui, na base, para valer de qualquer
 * degrau — `anim/`, `panels/`, `ui/`. Devolve `true` quando alguém escutou;
 * sem linha do tempo montada, o pedido espera por ela.
 */
export function revealKey(ref: KeyRef): boolean {
  if (revealListener === null) {
    pendingReveal = ref;
    return false;
  }
  pendingReveal = null;
  revealListener(ref);
  return true;
}

/** A linha do tempo escuta. Devolve como parar. */
export function onRevealKey(listener: (ref: KeyRef) => void): () => void {
  revealListener = listener;
  const waiting = pendingReveal;
  pendingReveal = null;
  if (waiting !== null) listener(waiting);
  return () => {
    if (revealListener === listener) revealListener = null;
  };
}

/** O rodapé de quem não tem frase melhor: *"Chave de Rotação criada em 0,50 s"*. */
export function keyCreatedNotice(target: TimelineTarget, time: number, file?: BoneFile): string {
  const nome = targetInfo(target, file).label;
  const onde = target.target === undefined ? '' : ` de ${target.target}`;
  return `Chave de ${nome}${onde} criada em ${time.toFixed(2).replace('.', ',')} s`;
}

/**
 * **O rodapé da chave que acabou de nascer** — K3 e L17 (chat K e chat L, uso,
 * 29/09/2026): posar e arrastar vértice criavam chave **calados**; o rodapé
 * continuava *"Mexer grava chave"* e a prova era um losango no Resumo.
 *
 * Diz a chave do tempo MAIS TARDE entre as novas — a do começo (`keepStartKey`)
 * nasce junto e não é o que a pessoa fez. Até três nomes; mais que isso, a conta.
 */
export function newKeysNotice(refs: readonly KeyRef[], file?: BoneFile): string | null {
  if (refs.length === 0) return null;
  const quando = Math.max(...refs.map((ref) => ref.time));
  const agora = refs.filter((ref) => sameTime(ref.time, quando));
  const nomes = [...new Set(agora.map((ref) => {
    const rotulo = ref.target.type === 'deform' ? 'Deformação da malha' : targetInfo(ref.target, file).label;
    if (ref.target.target === undefined) return rotulo;
    // Rodada 23: o osso próprio diz o nome da linha do tempo ("Imagem hand"), não o de dentro.
    const proprio = ref.target.type === 'bone' && file !== undefined ? ownBoneLabel(file, ref.target.target) : null;
    return proprio === null ? `${rotulo} de ${ref.target.target}` : `${proprio}: ${rotulo}`;
  }))];
  const tempo = `${quando.toFixed(2).replace('.', ',')} s`;
  if (nomes.length === 1) return `Chave em ${tempo}: ${nomes[0]}`;
  if (nomes.length <= 3) return `${nomes.length} chaves em ${tempo}: ${nomes.join(', ')}`;
  return `${nomes.length} chaves em ${tempo}`;
}

// ---------------------------------------------------------------------------
// A chave em foco: a folha e o gráfico olham a mesma — rodada 40, lote 1
// ---------------------------------------------------------------------------

/**
 * **A chave em foco** — rodada 40, lote 1 (doc 39, §2.2).
 *
 * Escolher uma chave na Linha do tempo e abrir a aba Curvas dava *"Clique num
 * ponto do gráfico para escolhê-la"*, com os sete botões cinzas: cada painel
 * guardava a sua. No Spine se escolhe no dopesheet e se aplica no Graph. Aqui
 * as duas abas leem e escrevem esta, e quem escuta é avisado uma vez por
 * mudança — escrever a mesma chave de novo não avisa ninguém, e é isso que
 * impede a folha e o gráfico de ficarem se respondendo.
 *
 * Estado passageiro, como a agulha: não vai para o arquivo.
 */
let focused: KeyRef | null = null;
const focusListeners = new Set<(ref: KeyRef | null) => void>();

export function keyFocus(): KeyRef | null {
  return focused;
}

export function setKeyFocus(ref: KeyRef | null): void {
  const same = ref === null
    ? focused === null
    : focused !== null && keyRefKey(focused) === keyRefKey(ref);
  if (same) return;
  focused = ref;
  for (const listener of [...focusListeners]) listener(ref);
}

/** Escuta a chave em foco. Devolve quem para de escutar. */
export function onKeyFocus(listener: (ref: KeyRef | null) => void): () => void {
  focusListeners.add(listener);
  return () => { focusListeners.delete(listener); };
}

// ---------------------------------------------------------------------------
// As alças andam com a chave — rodada 40, lote 4
// ---------------------------------------------------------------------------

/**
 * As alças de `key` como frações do trecho até `next`, uma por componente
 * (`toUnit`), ou `null` quando não há Bézier, não há próxima, ou o valor não
 * é número.
 *
 * A curva do arquivo é em coordenadas ABSOLUTAS (9.3): `cx` em segundos e `cy`
 * na unidade do valor. Mover, esticar, colar ou clonar uma chave mudava o
 * trecho e deixava as alças onde estavam — uma "Suave" colada meio segundo
 * depois ficava com as alças fora do trecho, e o leitor as prendia na ponta
 * (doc 39, lote 4). Um componente que não muda de valor não diz nada da altura
 * das alças; ele vira a forma de sempre (0 e 1).
 */
function unitsOfKey(key: KeyDef | undefined, next: KeyDef | undefined): UnitControlPoints[] | null {
  const curve = (key as { curve?: unknown } | undefined)?.curve;
  if (key === undefined || next === undefined || !Array.isArray(curve)) return null;
  const v0 = numbersOf(key.value);
  const v1 = numbersOf(next.value);
  if (v0 === null || v1 === null || v0.length !== v1.length || curve.length !== 4 * v0.length) return null;
  return v0.map((start, c) => {
    const unit = toUnit({
      cx1: Number(curve[4 * c]), cy1: Number(curve[4 * c + 1]),
      cx2: Number(curve[4 * c + 2]), cy2: Number(curve[4 * c + 3]),
    }, key.time, start, next.time, v1[c]!);
    return start === v1[c] ? { x1: unit.x1, y1: 0, x2: unit.x2, y2: 1 } : unit;
  });
}

/** As alças de volta em segundos, no trecho de `key` até `next`. */
function absoluteFromUnits(
  units: ReadonlyArray<UnitControlPoints>, key: KeyDef, next: KeyDef,
): number[] | null {
  const v0 = numbersOf(key.value);
  const v1 = numbersOf(next.value);
  if (v0 === null || v1 === null || v0.length !== units.length || v1.length !== units.length) return null;
  const dt = next.time - key.time;
  const out: number[] = [];
  units.forEach((unit, c) => {
    const dv = v1[c]! - v0[c]!;
    out.push(key.time + unit.x1 * dt, v0[c]! + unit.y1 * dv, key.time + unit.x2 * dt, v0[c]! + unit.y2 * dv);
  });
  return out;
}

function unitsByKey(keys: readonly KeyDef[]): Map<KeyDef, UnitControlPoints[]> {
  const out = new Map<KeyDef, UnitControlPoints[]>();
  keys.forEach((key, i) => {
    const units = unitsOfKey(key, keys[i + 1]);
    if (units !== null) out.set(key, units);
  });
  return out;
}

function reapplyUnits(keys: KeyDef[], units: ReadonlyMap<KeyDef, ReadonlyArray<UnitControlPoints>>): void {
  keys.forEach((key, i) => {
    const unit = units.get(key);
    const next = keys[i + 1];
    if (unit === undefined || next === undefined) return;
    const curve = absoluteFromUnits(unit, key, next);
    if (curve !== null) key.curve = curve;
  });
}

/** Reescreve no trecho novo as alças das chaves que acabaram de ser coladas. */
function applyClipUnits(
  file: BoneFile, animation: string, items: KeyClipboard['items'], written: readonly KeyRef[],
): void {
  items.forEach((item, i) => {
    const ref = written[i];
    if (item.unit === undefined || ref === undefined || ref.event !== undefined) return;
    const timeline = findTimeline(file, animation, ref.target) as TimelineLike | null;
    const keys = timeline?.keys ?? [];
    const index = findKeyIndex(keys, roundTime(ref.time), ref.target);
    const key = keys[index];
    const next = keys[index + 1];
    if (index < 0 || key === undefined || next === undefined) return;
    const curve = absoluteFromUnits(item.unit, key, next);
    if (curve !== null) key.curve = curve;
  });
}

// ---------------------------------------------------------------------------
// Colar dando a volta e deslocar em laço — rodada 40, lote 4
// ---------------------------------------------------------------------------

/** O valor da área de transferência de UM alvo no deslocamento `at`, ou `undefined`. */
function clipValueAt(
  points: ReadonlyArray<{ offset: number; value: KeyValue | undefined }>, at: number,
): KeyValue | undefined {
  if (points.length === 0) return undefined;
  const exact = points.find((point) => sameTime(point.offset, at));
  if (exact !== undefined) return exact.value;
  let before = points[0]!;
  let after = points[points.length - 1]!;
  for (const point of points) {
    if (point.offset < at) before = point;
    if (point.offset > at) { after = point; break; }
  }
  if (at <= points[0]!.offset) return points[0]!.value;
  if (at >= points[points.length - 1]!.offset) return points[points.length - 1]!.value;
  const a = numbersOf(before.value);
  const b = numbersOf(after.value);
  if (a === null || b === null || a.length !== b.length) return before.value;
  const f = (at - before.offset) / (after.offset - before.offset);
  const mixed = a.map((n, i) => n + (b[i]! - n) * f);
  return (typeof before.value === 'number' ? mixed[0] : mixed) as KeyValue;
}

/**
 * **Colar dando a volta** — rodada 40, lote 4 (doc 39, §3, passo 7).
 *
 * Colada em 0,5 s numa animação de 1 s que repete, a perna de trás ia até
 * 1,5 s: a animação crescia e acendiam avisos. Num ciclo, o que passa do fim
 * volta no começo — é o **Offset** do Spine. Aqui cada chave vai para
 * `(tempo) mod duração`, e as duas pontas (0 e o fim) ganham o valor que o
 * ciclo colado tem ali, para o laço fechar sem salto. A duração não muda.
 *
 * Sem duração, cai no colar de sempre.
 */
export function pasteKeysInLoop(
  file: BoneFile, animation: string, clipboard: KeyClipboard, time: number,
): KeyRef[] {
  const owner = findAnimation(file, animation);
  const duration = owner === null ? 0 : durationOf(owner);
  if (owner === null || duration <= TIME_EPSILON) return pasteKeys(file, animation, clipboard, time);
  const start = Math.max(0, roundTime(time));
  const wrap = (t: number): number => {
    let w = t % duration;
    if (w < 0) w += duration;
    if (duration - w < TIME_EPSILON) w = 0;
    return roundTime(w);
  };

  // As chaves no tempo dado a volta; duas no mesmo lugar, vale a primeira.
  const seen = new Set<string>();
  const items: Array<KeyClipboard['items'][number]> = [];
  for (const item of clipboard.items) {
    const at = wrap(start + item.offset);
    const id = `${targetKey(item.target)}@${at}@${item.key.event ?? ''}`;
    if (seen.has(id)) continue;
    seen.add(id);
    items.push({ ...item, offset: at });
  }
  const shifted: KeyClipboard = { base: 0, items };
  const written = pasteKeys(file, animation, shifted, 0);

  // As pontas: o valor que o ciclo colado tem no tempo 0 (= no fim).
  const atBoundary = wrap(-start);
  const byTarget = new Map<string, { target: TimelineTarget; points: Array<{ offset: number; value: KeyValue | undefined }> }>();
  for (const item of clipboard.items) {
    if (item.target.type === 'event') continue;
    const id = targetKey(item.target);
    const entry = byTarget.get(id) ?? { target: item.target, points: [] };
    entry.points.push({ offset: item.offset, value: item.key.value });
    byTarget.set(id, entry);
  }
  const extra: KeyRef[] = [];
  for (const { target, points } of byTarget.values()) {
    points.sort((a, b) => a.offset - b.offset);
    const value = clipValueAt(points, atBoundary);
    if (value === undefined) continue;
    const timeline = findTimeline(file, animation, target) as TimelineLike | null;
    const keys = timeline?.keys ?? [];
    if (findKeyIndex(keys, 0, target) < 0) {
      setKey(file, animation, 0, target, value);
      extra.push({ target, time: 0 });
    }
    setKey(file, animation, roundTime(duration), target, value);
    extra.push({ target, time: roundTime(duration) });
  }
  // As pontas mudaram os vizinhos: as alças de novo, no trecho certo.
  applyClipUnits(file, animation, shifted.items, written);
  return [...written, ...extra];
}

/**
 * **Deslocar em laço** — rodada 40, lote 4 (o Offset do Spine).
 *
 * As linhas `targets` andam `delta` segundos, e o que passa do fim volta no
 * começo, com as pontas fechadas: a mesma conta de `pasteKeysInLoop`. Serve
 * para defasar um membro num ciclo pronto sem refazer as chaves.
 */
export function offsetInLoop(
  file: BoneFile, animation: string, targets: readonly TimelineTarget[], delta: number,
): KeyRef[] {
  const refs = keyRefsForTargets(file, animation, targets).filter((ref) => ref.target.type !== 'event');
  if (refs.length === 0) return [];
  const clip = copyKeys(file, animation, refs);
  for (const ref of refs) removeKey(file, animation, ref.time, ref.target);
  return pasteKeysInLoop(file, animation, clip, clip.base + delta);
}
