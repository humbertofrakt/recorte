/**
 * Pose mode — the rule that decides where an edit goes.
 *
 * Two paths, decided by one field:
 *
 *   BASE ABERTA  `doc.animation === null`
 *     Editing a value changes the BASE (the setup pose): the object inside
 *     `file.bones`, `file.slots`, `file.constraints`.
 *
 *   ANIMAÇÃO ABERTA  `doc.animation !== null`
 *     Editing a value MUST NOT touch the base. It creates or updates a key at
 *     `doc.time` on the matching timeline of the open animation.
 *
 * That is the whole rule, and `setPropertyOrKey` is the one place that applies
 * it. Every tool and every panel that writes an animatable value calls it
 * instead of building a `SetProperty` by hand; a caller that skips it is a bug
 * that quietly destroys the artist's rest pose.
 *
 * **Editar sempre grava** — degrau 4a, M6 (17/09/2026). O Humberto: *"mexeu o
 * braço, grava a chave do braço"*. Saíram o interruptor "Gravar sozinho", a
 * tecla `A` e a saída `'bloqueado'`: nada mais recusa a edição. Chavear (`K`) e
 * Chavear tudo (`Ctrl+K`) continuam, para proteger a pose — os Key selected e
 * Key all do Spriter.
 *
 * Undo: both commands snapshot the whole animation object before the edit and
 * put the clone back on revert. Creating the first key of a document creates a
 * `timelines` array, and removing it has to make that array disappear again —
 * counting those side effects by hand would be wrong sooner or later, while a
 * snapshot is exact by construction.
 */

import type { AnimationDef, BoneFile, KeyValue } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc, Selection } from '../contract.js';
import { corpoDe } from '../contract.js';
import { SetProperty } from '../doc/commands.js';
import {
  animationIndexOf, boneTarget, findAnimation, isKeyed, removeKey, setKey, setupPointerFor,
  setupValueFor, targetInfo, targetKey, valueAt,
} from './keying.js';
import type { SetKeyOptions, TimelineTarget } from './keying.js';
import { keepStartKey } from './keying.js';

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/** JSON deep copy. The file only ever holds JSON values, so this is exact. */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

/**
 * A command that saves the whole animation before editing it and puts the clone
 * back on revert. `mutate` only has to write the forward edit.
 *
 * `kind` is `'structure'` and not `'transform'`: a new key can create a
 * timeline, and every panel that lists timelines has to hear about it. The
 * RELOAD it causes is cheap all the same — `animationOnly` tells the document
 * to read this one animation's timelines and nothing else.
 */
abstract class AnimationEdit implements Command {
  abstract readonly label: string;
  readonly kind: ChangeKind = 'structure';
  readonly animation: string;

  /**
   * Nothing outside this animation changed, so the document reloads only its
   * timelines instead of the whole file — see `Command.animationOnly`. That is
   * what makes a drag that writes one key per mouse move affordable.
   */
  get animationOnly(): string {
    return this.animation;
  }

  /** Clone of the animation as it was before `apply`. `null` until then. */
  protected saved: AnimationDef | null = null;

  constructor(animation: string) {
    this.animation = animation;
  }

  /** Takes over an older command's snapshot, so a merged pair reverts as one. */
  protected adopt(previous: AnimationEdit): void {
    this.saved = previous.saved;
  }

  apply(doc: EditorDoc): void {
    const index = animationIndexOf(doc.file, this.animation);
    if (index < 0) throw new Error(`animação não encontrada: ${this.animation}`);
    const animations = doc.file.animations ?? [];
    if (this.saved === null) this.saved = clone(animations[index]);
    this.mutate(doc.file);
  }

  revert(doc: EditorDoc): void {
    if (this.saved === null) return;
    const index = animationIndexOf(doc.file, this.animation);
    if (index < 0) return;
    const animations = doc.file.animations ?? [];
    animations[index] = clone(this.saved);
  }

  protected abstract mutate(file: BoneFile): void;
}

/**
 * Writes one key. Two of these on the same timeline at the same time collapse
 * into one undo step, which is what a drag needs: an artist who rotates a bone
 * across fifty mouse moves gets one "Chavear rotação" to undo, not fifty.
 */
export class SetKey extends AnimationEdit {
  readonly label: string;
  readonly target: TimelineTarget;
  readonly time: number;
  readonly value: KeyValue | undefined;
  private readonly options: SetKeyOptions;
  private readonly mergeable: boolean;

  constructor(
    animation: string, time: number, target: TimelineTarget, value?: KeyValue,
    options: SetKeyOptions & { label?: string; mergeable?: boolean } = {},
  ) {
    super(animation);
    this.time = time;
    this.target = target;
    this.value = value;
    const { label, mergeable, ...keyOptions } = options;
    this.options = keyOptions;
    this.mergeable = mergeable ?? true;
    this.label = label ?? `Chavear ${targetInfo(target).label.toLowerCase()}`;
  }

  protected mutate(file: BoneFile): void {
    // Lote 68: a primeira chave depois de 0 leva junto a do começo, no mesmo passo.
    keepStartKey(file, this.animation, this.time, this.target);
    setKey(file, this.animation, this.time, this.target, this.value, this.options);
  }

  mergeWith(previous: Command): boolean {
    if (!this.mergeable) return false;
    if (!(previous instanceof SetKey)) return false;
    if (!previous.mergeable) return false;
    if (previous.animation !== this.animation) return false;
    if (previous.time !== this.time) return false;
    if (previous.targetId !== this.targetId) return false;
    this.adopt(previous);
    return true;
  }

  /** The address of the timeline, so two commands can be compared. */
  private get targetId(): string {
    return targetKey(this.target);
  }
}

/** Removes one key. Undo brings back the timeline it may have emptied. */
export class RemoveKey extends AnimationEdit {
  readonly label: string;
  readonly target: TimelineTarget;
  readonly time: number;
  readonly event: string | undefined;

  constructor(
    animation: string, time: number, target: TimelineTarget,
    options: { event?: string; label?: string } = {},
  ) {
    super(animation);
    this.time = time;
    this.target = target;
    this.event = options.event;
    this.label = options.label ?? 'Apagar chave';
  }

  protected mutate(file: BoneFile): void {
    removeKey(file, this.animation, this.time, this.target, this.event);
  }
}

/**
 * Several keys in one undo step: the dopesheet's Delete, move, scale, paste,
 * and the viewport tools, which write x AND y (or scaleX AND scaleY) at once.
 *
 * `mergeKey` is what a drag needs. Without it a bone dragged across fifty mouse
 * moves would leave fifty undo steps. Every command of one drag carries the same
 * key and writes the value from scratch, so keeping the OLDEST snapshot (that is
 * what `adopt` does) makes the merged pair revert to where the drag began. Two
 * different drags must use two different keys — see `newMergeKey`.
 */
export class EditKeys extends AnimationEdit {
  readonly label: string;
  readonly mergeKey: string | null;
  private readonly edit: (file: BoneFile, animation: string) => void;

  constructor(
    animation: string, label: string, edit: (file: BoneFile, animation: string) => void,
    mergeKey: string | null = null,
  ) {
    super(animation);
    this.label = label;
    this.edit = edit;
    this.mergeKey = mergeKey;
  }

  protected mutate(file: BoneFile): void {
    this.edit(file, this.animation);
  }

  mergeWith(previous: Command): boolean {
    if (this.mergeKey === null) return false;
    if (!(previous instanceof EditKeys)) return false;
    if (previous.mergeKey !== this.mergeKey) return false;
    if (previous.animation !== this.animation) return false;
    this.adopt(previous);
    return true;
  }
}

// ---------------------------------------------------------------------------
// The rule
// ---------------------------------------------------------------------------

/** What `setPropertyOrKey` did. */
export type PoseOutcome =
  /** Base open: the setup pose was written. */
  | 'montagem'
  /** Animation open: a key was created or updated. Always — editing always records. */
  | 'chave'
  /** The target has no setup slot and no animation is open. */
  | 'recusado';

export interface PoseOptions {
  /** Undo-menu text. */
  label?: string;
  /** `false` stops a drag from collapsing into one step. Default `true`. */
  mergeable?: boolean;
  /**
   * Change kind of the setup-pose write. Default `'structure'`: the write goes
   * into the file only, and a `'transform'` would re-pose from the data already
   * loaded, with the old number (J9, rodada 3, 04/10/2026).
   */
  kind?: ChangeKind;
  /** Curve of a key created in animation mode. */
  curve?: SetKeyOptions['curve'];
}

/**
 * Writes `value` into `target` — into the setup pose, or as a key, depending on
 * the mode. THE one function every editing surface calls.
 */
export function setPropertyOrKey(
  doc: EditorDoc, target: TimelineTarget, value: KeyValue, options: PoseOptions = {},
): PoseOutcome {
  const animation = doc.animation;

  if (animation === null) {
    const pointer = setupPointerFor(doc.file, target);
    if (pointer === null) return 'recusado';
    doc.run(new SetProperty(pointer, value, {
      label: options.label ?? `Alterar ${targetInfo(target, doc.file).label.toLowerCase()}`,
      kind: options.kind ?? 'structure',
      mergeable: options.mergeable ?? true,
    }));
    return 'montagem';
  }

  if (findAnimation(doc.file, animation) === null) return 'recusado';

  const keyOptions: SetKeyOptions & { label?: string; mergeable?: boolean } = {
    mergeable: options.mergeable ?? true,
  };
  if (options.label !== undefined) keyOptions.label = options.label;
  if (options.curve !== undefined) keyOptions.curve = options.curve;
  doc.run(new SetKey(animation, doc.time, target, value, keyOptions));
  return 'chave';
}

/**
 * Writes SEVERAL values as keys at `doc.time`, in one undo step.
 *
 * `setPropertyOrKey` handles one property; a viewport drag handles two or more
 * at once (x and y, scaleX and scaleY), and those must undo together. Commands
 * that share `mergeKey` collapse, so a whole drag is still one step.
 *
 * There is no assembly branch here on purpose: this is the animation half of the
 * rule, and the caller keeps its own way of writing the setup pose.
 */
export function keyValuesNow(
  doc: EditorDoc,
  values: ReadonlyArray<{ target: TimelineTarget; value: KeyValue }>,
  label: string,
  mergeKey: string,
): PoseOutcome {
  const animation = doc.animation;
  if (animation === null) return 'recusado';
  if (findAnimation(doc.file, animation) === null) return 'recusado';
  if (values.length === 0) return 'chave';
  const time = doc.time;
  const written = values.map((item) => ({ target: item.target, value: item.value }));
  doc.run(new EditKeys(animation, label, (file, name) => {
    for (const item of written) {
      // Lote 68: o começo se guarda sozinho, como o Spriter.
      keepStartKey(file, name, time, item.target);
      setKey(file, name, time, item.target, item.value);
    }
  }, mergeKey));
  return 'chave';
}

/**
 * The value `target` shows right now: the animation's value at `doc.time` when
 * one is open and the property is animated, and the setup value otherwise. This
 * is what the "Chavear" button writes when the user has not touched anything.
 */
export function currentValueOf(doc: EditorDoc, target: TimelineTarget): KeyValue | undefined {
  if (doc.animation !== null) {
    const animated = valueAt(doc.file, doc.animation, doc.time, target);
    if (animated !== undefined) return animated;
  }
  // Degrau 4b: a base é a do corpo do instante (o tronco do lobisomem, não o do homem).
  return setupValueFor(corpoDe(doc).file, target);
}

/**
 * Keys the current value of every target given, in one undo step. This is the
 * "Chavear" button: it protects the pose, writing keys for what was NOT moved.
 * Returns how many keys were written.
 */
export function keyTargetsNow(
  doc: EditorDoc, targets: readonly TimelineTarget[], label = 'Chavear',
): number {
  const animation = doc.animation;
  if (animation === null || targets.length === 0) return 0;
  const time = doc.time;
  const values: Array<{ target: TimelineTarget; value: KeyValue | undefined }> = [];
  for (const target of targets) {
    if (targetInfo(target, doc.file).valueless) continue;
    values.push({ target, value: currentValueOf(doc, target) });
  }
  if (values.length === 0) return 0;
  doc.run(new EditKeys(animation, label, (file, name) => {
    for (const { target, value } of values) setKey(file, name, time, target, value);
  }));
  return values.length;
}

/**
 * As propriedades que Chavear grava quando não há linha escolhida na folha.
 *
 * São as de um osso e as duas de um slot: é o que "grava a pose disto aqui,
 * agora" quer dizer. Escrito uma vez, aqui.
 */
/**
 * O que "Chavear" grava de um osso.
 *
 * `shearX` e `shearY` entraram no lote 13, com a ferramenta Inclinar (item 21).
 * Os dois já eram animáveis no formato (§4.2) e já apareciam no painel
 * Propriedades; o que faltava era Chavear gravá-los junto com o resto da pose —
 * senão inclinar em Animando daria um valor que a animação esqueceria.
 */
export const BONE_KEY_PROPERTIES: readonly string[] =
  Object.freeze(['rotation', 'x', 'y', 'scaleX', 'scaleY', 'shearX', 'shearY']);
export const SLOT_KEY_PROPERTIES: readonly string[] = Object.freeze(['color', 'attachment']);

/**
 * O que Chavear gravaria com esta seleção, quando nenhuma linha da folha está
 * escolhida. Função pura: a folha passa a seleção, e recebe os alvos.
 */
export function targetsForSelection(
  selection: Pick<Selection, 'bones' | 'slots'>,
): TimelineTarget[] {
  const targets: TimelineTarget[] = [];
  for (const bone of selection.bones) {
    for (const property of BONE_KEY_PROPERTIES) {
      targets.push({ type: 'bone', target: bone, property });
    }
  }
  for (const slot of selection.slots) {
    for (const property of SLOT_KEY_PROPERTIES) {
      targets.push({ type: 'slot', target: slot, property });
    }
  }
  return targets;
}

/**
 * Volta os ossos à pose de repouso — item 72, `Ctrl+1` e `Ctrl+Shift+1`.
 *
 * **Em Animando**, "voltar à pose de repouso" é gravar uma chave com o valor da
 * MONTAGEM: a animação passa a dizer, naquele instante, exatamente o que a pose
 * de repouso diz. Apagar as chaves seria outra coisa — seria deixar a animação
 * sem opinião ali, e o osso então seguiria a chave anterior.
 *
 * **Em Montagem** não faz nada: a pose de repouso já É o que está na tela, e
 * não há de onde copiar. Devolve `0`, e quem chamou diz isso.
 *
 * Devolve quantos valores foram gravados.
 */
export function resetToSetup(doc: EditorDoc, bones: readonly string[]): number {
  const animation = doc.animation;
  if (animation === null || bones.length === 0) return 0;
  const values: Array<{ target: TimelineTarget; value: KeyValue }> = [];
  for (const bone of bones) {
    for (const property of BONE_KEY_PROPERTIES) {
      const target = boneTarget(bone, property);
      const value = setupValueFor(corpoDe(doc).file, target);
      if (value === undefined) continue;
      values.push({ target, value });
    }
  }
  if (values.length === 0) return 0;
  // Pelo mesmo caminho do botão Chavear, e NÃO por `keyValuesNow`: este é um
  // comando que a pessoa pediu com a tecla, não um arrasto.
  const time = doc.time;
  doc.run(new EditKeys(animation, 'Voltar à pose de repouso', (file, name) => {
    for (const { target, value } of values) setKey(file, name, time, target, value);
  }));
  return values.length;
}

/*
 * O semáforo do Chavear (verde cria, vermelho grava por cima) saiu no degrau
 * 4a — G13, palavra do Humberto, 17/09/2026. Com "editar sempre grava" ele
 * perdeu o motivo; a marca de chave continua na linha do tempo.
 */

/**
 * Removes the key of every target at `doc.time`, in one undo step. Returns how
 * many were there.
 */
export function unkeyTargetsNow(
  doc: EditorDoc, targets: readonly TimelineTarget[], label = 'Apagar chave',
): number {
  const animation = doc.animation;
  if (animation === null || targets.length === 0) return 0;
  const time = doc.time;
  const list = targets.filter((target) => isKeyed(doc.file, animation, time, target));
  if (list.length === 0) return 0;
  doc.run(new EditKeys(animation, label, (file, name) => {
    for (const target of list) removeKey(file, name, time, target);
  }));
  return list.length;
}
