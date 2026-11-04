/**
 * Basic commands (owner A).
 *
 * Every command mutates `doc.file` — the `.bone` JSON itself — and every one
 * reverts to a byte-identical document. Two strategies are used:
 *
 *   - Surgical, for edits whose inverse is obvious (set a value, splice an
 *     item out of an array). These are cheap and merge well during a drag.
 *   - Snapshot, for edits that ripple through the file (removing a bone drags
 *     slots, constraints, skins and timelines with it). The command clones the
 *     top-level members it is about to touch and puts them back on revert, so
 *     the inverse is exact by construction instead of by careful bookkeeping.
 *
 * Labels are the text the user reads in the undo menu, so they are Portuguese.
 */

import { escapePointer } from '../../../runtime/src/index.js';
import type {
  AnimationDef, BoneDef, BoneFile, ConstraintDef, DriverConstraintDef,
  DriverTargetDef, SlotDef, TimelineDef,
} from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';

// ---------------------------------------------------------------------------
// JSON Pointer (RFC 6901)
// ---------------------------------------------------------------------------

/** Splits a JSON Pointer into its decoded segments. `""` is the whole file. */
export function parsePointer(pointer: string): string[] {
  if (pointer === '') return [];
  if (!pointer.startsWith('/')) throw new Error(`ponteiro inválido: ${pointer}`);
  return pointer
    .slice(1)
    .split('/')
    .map((segment) => segment.replace(/~1/g, '/').replace(/~0/g, '~'));
}

/** Builds a pointer from already-decoded segments: `pointerOf('bones', 0, 'x')`. */
export function pointerOf(...segments: Array<string | number>): string {
  return segments.map((s) => `/${escapePointer(s)}`).join('');
}

function isContainer(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Reads the value a pointer names, or `undefined` when the path does not exist. */
export function getAtPointer(root: unknown, pointer: string): unknown {
  let current: unknown = root;
  for (const segment of parsePointer(pointer)) {
    if (!isContainer(current)) return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/**
 * Writes the value a pointer names, creating nothing along the way: the parent
 * must already exist. `undefined` removes the property (or splices the array
 * item), which is how a revert restores "this key was absent".
 */
export function setAtPointer(root: unknown, pointer: string, value: unknown): void {
  const segments = parsePointer(pointer);
  if (segments.length === 0) throw new Error('não é possível escrever no documento inteiro');
  let parent: unknown = root;
  for (let i = 0; i < segments.length - 1; i++) {
    if (!isContainer(parent)) throw new Error(`caminho não existe: ${pointer}`);
    parent = (parent as Record<string, unknown>)[segments[i]];
  }
  if (!isContainer(parent)) throw new Error(`caminho não existe: ${pointer}`);
  const last = segments[segments.length - 1];
  if (Array.isArray(parent)) {
    const index = Number(last);
    if (!Number.isInteger(index)) throw new Error(`índice inválido em ${pointer}`);
    if (value === undefined) parent.splice(index, 1);
    else parent[index] = value;
    return;
  }
  const object = parent as Record<string, unknown>;
  if (value === undefined) delete object[last];
  else object[last] = value;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/** JSON deep copy. The file only ever holds JSON values, so this is exact. */
function clone<T>(value: T): T {
  return value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T);
}

type Mutable = Record<string, unknown>;

/** Top-level members a snapshot command may save and restore. */
export type FileKey = keyof BoneFile;

/**
 * Põe as chaves de `file` na ordem de `order`, sem trocar o objeto — P11.
 *
 * O documento segura o MESMO objeto (`doc.file`), então a ordem se refaz no
 * lugar: tira as chaves e repõe na ordem certa. Chave que não estava em
 * `order` fica no fim, na ordem em que está. Nada muda quando já está certo.
 */
function restoreKeyOrder(file: Mutable, order: readonly string[]): void {
  const now = Object.keys(file);
  const wanted = [
    ...order.filter((key) => Object.prototype.hasOwnProperty.call(file, key)),
    ...now.filter((key) => !order.includes(key)),
  ];
  if (wanted.length === now.length && wanted.every((key, i) => key === now[i])) return;
  const values = wanted.map((key): [string, unknown] => [key, file[key]]);
  for (const key of now) delete file[key];
  for (const [key, value] of values) file[key] = value;
}

/**
 * A command that saves whole top-level members before editing and puts them
 * back on revert. Subclasses only write the forward edit.
 */
export abstract class SnapshotCommand implements Command {
  abstract readonly label: string;
  readonly kind: ChangeKind = 'structure';
  /** Members this command may touch. */
  protected abstract readonly keys: readonly FileKey[];

  private saved: Array<[string, unknown, boolean]> | null = null;
  /**
   * A ORDEM das chaves do arquivo antes da edição — P11 (29/09/2026).
   *
   * Achado pelo chat E (E1): o `revert` repunha a chave apagada com
   * `file[nome] = valor`, e num objeto do JavaScript a chave reposta vai para
   * o FIM. O boneco era o mesmo, o `.bone` salvo depois não: o arquivo não
   * voltava letra por letra. A forma: *o desfazer devolvia o VALOR e não o
   * LUGAR*. A mesma cara do A4 (`shearX: 0`).
   */
  private order: string[] | null = null;

  apply(doc: EditorDoc): void {
    const file = doc.file as unknown as Mutable;
    this.order = Object.keys(file);
    this.saved = this.keys.map((key) => {
      const name = key as string;
      const present = Object.prototype.hasOwnProperty.call(file, name);
      return [name, present ? clone(file[name]) : undefined, present];
    });
    this.mutate(doc.file);
  }

  revert(doc: EditorDoc): void {
    const file = doc.file as unknown as Mutable;
    if (this.saved === null) return;
    for (const [name, value, present] of this.saved) {
      if (present) file[name] = clone(value);
      else delete file[name];
    }
    if (this.order !== null) restoreKeyOrder(file, this.order);
    this.saved = null;
    this.order = null;
  }

  /** The forward edit. Runs after the snapshot was taken. */
  protected abstract mutate(file: BoneFile): void;
}

// ---------------------------------------------------------------------------
// Walking the file
// ---------------------------------------------------------------------------

/** Timelines share one shape wherever they appear, including driver targets. */
interface TimelineLike {
  type: string;
  target?: string;
  property?: string;
  skin?: string;
  attachment?: string;
  keys?: Array<Record<string, unknown>>;
}

interface TimelineHost {
  list: TimelineLike[];
  replace(next: TimelineLike[]): void;
}

/** Every array of timelines in the file: animations, and driver targets. */
function timelineHosts(file: BoneFile): TimelineHost[] {
  const hosts: TimelineHost[] = [];
  for (const animation of file.animations ?? []) {
    if (!Array.isArray(animation.timelines)) continue;
    const owner = animation;
    hosts.push({
      list: owner.timelines as unknown as TimelineLike[],
      replace: (next) => { owner.timelines = next as unknown as TimelineDef[]; },
    });
  }
  for (const constraint of file.constraints ?? []) {
    if (constraint.type !== 'driver') continue;
    const driver = constraint as DriverConstraintDef;
    if (!Array.isArray(driver.targets)) continue;
    hosts.push({
      list: driver.targets as unknown as TimelineLike[],
      replace: (next) => { driver.targets = next as unknown as DriverTargetDef[]; },
    });
  }
  return hosts;
}

/** Runs `visit` on every timeline of the file. */
function forEachTimeline(file: BoneFile, visit: (timeline: TimelineLike) => void): void {
  for (const host of timelineHosts(file)) for (const timeline of host.list) visit(timeline);
}

/** Drops every timeline for which `keep` returns `false`. */
function pruneTimelines(file: BoneFile, keep: (timeline: TimelineLike) => boolean): void {
  for (const host of timelineHosts(file)) {
    const next = host.list.filter(keep);
    if (next.length !== host.list.length) host.replace(next);
  }
}

/** Every attachment of every skin, with the slot it hangs from. */
function forEachAttachment(
  file: BoneFile,
  visit: (attachment: Mutable, slot: string, placeholder: string) => void,
): void {
  for (const skin of file.skins ?? []) {
    const bySlot = skin.attachments;
    if (bySlot === undefined) continue;
    for (const slot of Object.keys(bySlot)) {
      const placeholders = bySlot[slot];
      if (placeholders === null || typeof placeholders !== 'object') continue;
      for (const placeholder of Object.keys(placeholders)) {
        const attachment = placeholders[placeholder];
        if (attachment === null || typeof attachment !== 'object') continue;
        visit(attachment as unknown as Mutable, slot, placeholder);
      }
    }
  }
}

/** Names of the bones a constraint drives or reads. */
function constraintBones(constraint: ConstraintDef): string[] {
  const names: string[] = [];
  const any = constraint as unknown as Mutable;
  if (Array.isArray(any['bones'])) for (const n of any['bones']) if (typeof n === 'string') names.push(n);
  if (typeof any['bone'] === 'string') names.push(any['bone'] as string);
  // `target` is a bone for ik and transform, and a slot for path.
  if ((constraint.type === 'ik' || constraint.type === 'transform') && typeof any['target'] === 'string') {
    names.push(any['target'] as string);
  }
  return names;
}

/** Name of the slot a constraint points at, or `null`. */
function constraintSlot(constraint: ConstraintDef): string | null {
  if (constraint.type !== 'path') return null;
  const target = (constraint as unknown as Mutable)['target'];
  return typeof target === 'string' ? target : null;
}

/** The bone plus everything under it. */
export function boneSubtree(file: BoneFile, name: string): Set<string> {
  const subtree = new Set<string>([name]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const bone of file.bones) {
      if (bone.parent !== undefined && subtree.has(bone.parent) && !subtree.has(bone.name)) {
        subtree.add(bone.name);
        grew = true;
      }
    }
  }
  return subtree;
}

export interface Removal {
  bones: Set<string>;
  slots: Set<string>;
  constraints: Set<string>;
}

/** Grows a removal until it is closed: nothing left behind points at a hole. */
export function cascade(file: BoneFile, seed: Partial<Removal>): Removal {
  const bones = new Set(seed.bones ?? []);
  const slots = new Set(seed.slots ?? []);
  const constraints = new Set(seed.constraints ?? []);
  for (const slot of file.slots ?? []) if (bones.has(slot.bone)) slots.add(slot.name);
  for (const constraint of file.constraints ?? []) {
    if (constraintBones(constraint).some((n) => bones.has(n))) constraints.add(constraint.name);
    const slot = constraintSlot(constraint);
    if (slot !== null && slots.has(slot)) constraints.add(constraint.name);
  }
  return { bones, slots, constraints };
}

/**
 * Removes the closed set and every reference to it — timelines included.
 * Exported for `DeleteItems` of the tree (lote 57): deleting an animated bone
 * used to leave its timelines behind.
 */
export function applyRemoval(file: BoneFile, removal: Removal): void {
  const { bones, slots, constraints } = removal;

  if (bones.size > 0) file.bones = file.bones.filter((b) => !bones.has(b.name));
  if (slots.size > 0 && file.slots !== undefined) file.slots = file.slots.filter((s) => !slots.has(s.name));
  if (constraints.size > 0 && file.constraints !== undefined) {
    file.constraints = file.constraints.filter((c) => !constraints.has(c.name));
  }

  for (const skin of file.skins ?? []) {
    if (skin.attachments !== undefined) for (const slot of slots) delete skin.attachments[slot];
    if (skin.bones !== undefined) skin.bones = skin.bones.filter((n) => !bones.has(n));
    if (skin.constraints !== undefined) skin.constraints = skin.constraints.filter((n) => !constraints.has(n));
  }

  forEachAttachment(file, (attachment) => {
    if (attachment['type'] !== 'clipping') return;
    const list = attachment['slots'];
    if (Array.isArray(list)) attachment['slots'] = list.filter((n) => typeof n === 'string' && !slots.has(n));
    const end = attachment['end'];
    if (typeof end === 'string' && slots.has(end)) delete attachment['end'];
  });

  for (const morph of file.morphs ?? []) {
    if (Array.isArray(morph.targets)) morph.targets = morph.targets.filter((t) => !slots.has(t.slot));
  }

  for (const parameter of file.parameters ?? []) {
    if (parameter.source !== undefined && bones.has(parameter.source.bone)) delete parameter.source;
  }

  pruneTimelines(file, (timeline) => {
    const target = timeline.target;
    if (typeof target !== 'string') return true;
    if (timeline.type === 'bone') return !bones.has(target);
    if (timeline.type === 'slot' || timeline.type === 'deform' || timeline.type === 'sequence') {
      return !slots.has(target);
    }
    if (timeline.type === 'constraint') return !constraints.has(target);
    return true;
  });

  if (slots.size > 0) {
    forEachTimeline(file, (timeline) => {
      if (timeline.type !== 'drawOrder' || !Array.isArray(timeline.keys)) return;
      for (const key of timeline.keys) {
        const value = key['value'];
        if (!Array.isArray(value)) continue;
        key['value'] = value.filter((entry) => {
          const slot = (entry as Mutable | null)?.['slot'];
          return typeof slot !== 'string' || !slots.has(slot);
        });
      }
    });
  }
}

// ---------------------------------------------------------------------------
// SetProperty — the workhorse
// ---------------------------------------------------------------------------

export interface SetPropertyOptions {
  /** Undo-menu text. Default "Alterar valor". */
  label?: string;
  /** Default `'transform'`; pass `'structure'` when the rebuild must run. */
  kind?: ChangeKind;
  /** `false` stops a drag from collapsing into one step. Default `true`. */
  mergeable?: boolean;
}

/**
 * Writes one value inside the file. Moving a bone, changing a colour, renaming
 * a folder — anything addressable by a pointer. Two of these on the same
 * pointer collapse into one undo step, which is what a drag needs.
 */
export class SetProperty implements Command {
  readonly label: string;
  readonly kind: ChangeKind;
  readonly pointer: string;
  readonly value: unknown;
  private readonly mergeable: boolean;
  private oldValue: unknown = undefined;
  private captured = false;

  constructor(pointer: string, value: unknown, options: SetPropertyOptions = {}) {
    this.pointer = pointer;
    this.value = value;
    this.label = options.label ?? 'Alterar valor';
    this.kind = options.kind ?? 'transform';
    this.mergeable = options.mergeable ?? true;
  }

  apply(doc: EditorDoc): void {
    if (!this.captured) {
      this.oldValue = clone(getAtPointer(doc.file, this.pointer));
      this.captured = true;
    }
    setAtPointer(doc.file, this.pointer, clone(this.value));
  }

  revert(doc: EditorDoc): void {
    setAtPointer(doc.file, this.pointer, clone(this.oldValue));
  }

  mergeWith(previous: Command): boolean {
    if (!this.mergeable) return false;
    if (!(previous instanceof SetProperty)) return false;
    if (!previous.mergeable) return false;
    if (previous.pointer !== this.pointer) return false;
    this.oldValue = previous.oldValue;
    this.captured = true;
    return true;
  }
}

/** Several values in one undo step: a whole transform, a whole colour. */
export class SetProperties implements Command {
  readonly label: string;
  readonly kind: ChangeKind;
  readonly entries: ReadonlyArray<readonly [string, unknown]>;
  private readonly mergeable: boolean;
  private oldValues: unknown[] = [];
  private captured = false;

  constructor(entries: ReadonlyArray<readonly [string, unknown]>, options: SetPropertyOptions = {}) {
    this.entries = entries;
    this.label = options.label ?? 'Alterar valores';
    this.kind = options.kind ?? 'transform';
    this.mergeable = options.mergeable ?? true;
  }

  private get signature(): string {
    return this.entries.map(([pointer]) => pointer).join(' ');
  }

  apply(doc: EditorDoc): void {
    if (!this.captured) {
      this.oldValues = this.entries.map(([pointer]) => clone(getAtPointer(doc.file, pointer)));
      this.captured = true;
    }
    for (const [pointer, value] of this.entries) setAtPointer(doc.file, pointer, clone(value));
  }

  revert(doc: EditorDoc): void {
    for (let i = this.entries.length - 1; i >= 0; i--) {
      setAtPointer(doc.file, this.entries[i][0], clone(this.oldValues[i]));
    }
  }

  mergeWith(previous: Command): boolean {
    if (!this.mergeable) return false;
    if (!(previous instanceof SetProperties)) return false;
    if (!previous.mergeable) return false;
    if (previous.signature !== this.signature) return false;
    this.oldValues = previous.oldValues;
    this.captured = true;
    return true;
  }
}

// ---------------------------------------------------------------------------
// Adding
// ---------------------------------------------------------------------------

/** Adds a bone. Index 0 stays reserved for the root (spec 2.2). */
export class AddBone implements Command {
  readonly label = 'Adicionar osso';
  readonly kind: ChangeKind = 'structure';
  readonly bone: BoneDef;
  private readonly wanted: number | undefined;
  private at = -1;

  constructor(bone: BoneDef, index?: number) {
    this.bone = bone;
    this.wanted = index;
  }

  apply(doc: EditorDoc): void {
    const bones = doc.file.bones;
    const lowest = bones.length === 0 ? 0 : 1;
    const at = Math.min(Math.max(this.wanted ?? bones.length, lowest), bones.length);
    bones.splice(at, 0, clone(this.bone));
    this.at = at;
  }

  revert(doc: EditorDoc): void {
    if (this.at >= 0) doc.file.bones.splice(this.at, 1);
    this.at = -1;
  }
}

/** Adds a slot at the end of the draw order, or at `index`. */
export class AddSlot implements Command {
  readonly label = 'Adicionar slot';
  readonly kind: ChangeKind = 'structure';
  readonly slot: SlotDef;
  private readonly wanted: number | undefined;
  private at = -1;
  private createdArray = false;

  constructor(slot: SlotDef, index?: number) {
    this.slot = slot;
    this.wanted = index;
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    this.createdArray = file.slots === undefined;
    file.slots ??= [];
    const at = Math.min(Math.max(this.wanted ?? file.slots.length, 0), file.slots.length);
    file.slots.splice(at, 0, clone(this.slot));
    this.at = at;
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    if (file.slots !== undefined && this.at >= 0) file.slots.splice(this.at, 1);
    if (this.createdArray) delete file.slots;
    this.at = -1;
    this.createdArray = false;
  }
}

/** Adds an empty animation. */
export class AddAnimation implements Command {
  readonly label = 'Adicionar animação';
  readonly kind: ChangeKind = 'structure';
  readonly animation: AnimationDef;
  private at = -1;
  private createdArray = false;

  constructor(animation: AnimationDef) {
    this.animation = animation;
  }

  apply(doc: EditorDoc): void {
    const file = doc.file;
    this.createdArray = file.animations === undefined;
    file.animations ??= [];
    this.at = file.animations.length;
    file.animations.push(clone(this.animation));
  }

  revert(doc: EditorDoc): void {
    const file = doc.file;
    if (file.animations !== undefined && this.at >= 0) file.animations.splice(this.at, 1);
    if (this.createdArray) delete file.animations;
    this.at = -1;
    this.createdArray = false;
  }
}

// ---------------------------------------------------------------------------
// Removing
// ---------------------------------------------------------------------------

const REMOVAL_KEYS: readonly FileKey[] = [
  'bones', 'slots', 'constraints', 'skins', 'animations', 'morphs', 'parameters',
];

/** Removes a bone, its children, and everything that pointed at them. */
export class RemoveBone extends SnapshotCommand {
  readonly label = 'Remover osso';
  protected readonly keys = REMOVAL_KEYS;
  readonly name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  protected mutate(file: BoneFile): void {
    if (file.bones.length > 0 && file.bones[0].name === this.name) {
      throw new Error('o osso raiz não pode ser removido');
    }
    applyRemoval(file, cascade(file, { bones: boneSubtree(file, this.name) }));
  }
}

/** Removes a slot, its attachments in every skin, and its timelines. */
export class RemoveSlot extends SnapshotCommand {
  readonly label = 'Remover slot';
  protected readonly keys = REMOVAL_KEYS;
  readonly name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  protected mutate(file: BoneFile): void {
    applyRemoval(file, cascade(file, { slots: new Set([this.name]) }));
  }
}

/** Removes an animation, and the drivers that played it. */
export class RemoveAnimation extends SnapshotCommand {
  readonly label = 'Remover animação';
  protected readonly keys: readonly FileKey[] = ['animations', 'constraints', 'skins'];
  readonly name: string;

  constructor(name: string) {
    super();
    this.name = name;
  }

  protected mutate(file: BoneFile): void {
    if (file.animations !== undefined) {
      file.animations = file.animations.filter((a) => a.name !== this.name);
    }
    const orphans = new Set<string>();
    for (const constraint of file.constraints ?? []) {
      if (constraint.type !== 'driver') continue;
      if ((constraint as DriverConstraintDef).animation === this.name) orphans.add(constraint.name);
    }
    if (orphans.size > 0) applyRemoval(file, { bones: new Set(), slots: new Set(), constraints: orphans });
  }
}

// ---------------------------------------------------------------------------
// Reparenting
// ---------------------------------------------------------------------------

/**
 * Hangs a bone from another one. The array is reordered so a parent always
 * comes before its children, which keeps `bones[0]` the root.
 */
export class ReparentBone extends SnapshotCommand {
  readonly label = 'Mudar o pai do osso';
  protected readonly keys: readonly FileKey[] = ['bones'];
  readonly name: string;
  readonly parent: string | null;

  constructor(name: string, parent: string | null) {
    super();
    this.name = name;
    this.parent = parent;
  }

  protected mutate(file: BoneFile): void {
    const bone = file.bones.find((b) => b.name === this.name);
    if (bone === undefined) throw new Error(`osso "${this.name}" não existe`);
    if (file.bones.length > 0 && file.bones[0].name === this.name) {
      throw new Error('o osso raiz não tem pai');
    }
    if (this.parent !== null) {
      if (this.parent === this.name) throw new Error('um osso não pode ser pai de si mesmo');
      if (boneSubtree(file, this.name).has(this.parent)) {
        throw new Error('o novo pai está dentro do próprio osso');
      }
      bone.parent = this.parent;
    } else {
      delete bone.parent;
    }
    file.bones = sortBonesByDepth(file.bones);
  }
}

/** Stable order where every bone comes after its parent. */
function sortBonesByDepth(bones: readonly BoneDef[]): BoneDef[] {
  const byName = new Map<string, BoneDef>();
  for (const bone of bones) if (!byName.has(bone.name)) byName.set(bone.name, bone);
  const out: BoneDef[] = [];
  const placed = new Set<string>();
  let remaining = [...bones];
  while (remaining.length > 0) {
    const ready = remaining.filter(
      (b) => b.parent === undefined || placed.has(b.parent) || !byName.has(b.parent),
    );
    // A cycle would leave nothing ready; keep the file loadable by giving up.
    const batch = ready.length > 0 ? ready : remaining;
    for (const bone of batch) {
      out.push(bone);
      placed.add(bone.name);
    }
    const done = new Set(batch);
    remaining = remaining.filter((b) => !done.has(b));
  }
  return out;
}

// ---------------------------------------------------------------------------
// Renaming
// ---------------------------------------------------------------------------

/** What kind of thing a name belongs to. */
export type NodeKind =
  | 'bone' | 'slot' | 'skin' | 'constraint' | 'animation'
  | 'event' | 'parameter' | 'morph' | 'variable';

const NODE_LABELS: Record<NodeKind, string> = {
  bone: 'osso',
  slot: 'slot',
  skin: 'skin',
  constraint: 'restrição',
  animation: 'animação',
  event: 'evento',
  parameter: 'parâmetro',
  morph: 'morph',
  variable: 'variável',
};

/**
 * Renames one thing and every reference to it: parents, slot bones, constraint
 * bones and targets, skin lists, timeline targets, morph targets, drivers.
 * A name the file no longer resolves is a broken file, so this is one command.
 */
export class RenameNode extends SnapshotCommand {
  readonly label: string;
  protected readonly keys: readonly FileKey[] = [
    'bones', 'slots', 'skins', 'constraints', 'animations',
    'events', 'parameters', 'morphs', 'variables',
  ];
  readonly nodeKind: NodeKind;
  readonly from: string;
  readonly to: string;

  constructor(nodeKind: NodeKind, from: string, to: string) {
    super();
    this.nodeKind = nodeKind;
    this.from = from;
    this.to = to;
    this.label = `Renomear ${NODE_LABELS[nodeKind]}`;
  }

  protected mutate(file: BoneFile): void {
    if (this.to === this.from) return;
    if (this.to.length === 0) throw new Error('o nome não pode ficar vazio');
    renameEverywhere(file, this.nodeKind, this.from, this.to);
  }
}

/** Replaces `from` with `to` in the declaration and in every reference. */
export function renameEverywhere(file: BoneFile, kind: NodeKind, from: string, to: string): void {
  const swap = (value: unknown): value is string => value === from;
  /** Rewrites a list of names in place, leaving an absent list absent. */
  const list = (owner: Mutable, key: string): void => {
    const names = owner[key];
    if (Array.isArray(names)) owner[key] = names.map((n) => (n === from ? to : n));
  };

  if (kind === 'bone') {
    for (const bone of file.bones) {
      if (bone.name === from) bone.name = to;
      if (swap(bone.parent)) bone.parent = to;
    }
    for (const slot of file.slots ?? []) if (swap(slot.bone)) slot.bone = to;
    for (const constraint of file.constraints ?? []) {
      const any = constraint as unknown as Mutable;
      if (Array.isArray(any['bones'])) any['bones'] = (any['bones'] as string[]).map((n) => (n === from ? to : n));
      if (swap(any['bone'])) any['bone'] = to;
      if ((constraint.type === 'ik' || constraint.type === 'transform') && swap(any['target'])) any['target'] = to;
    }
    for (const skin of file.skins ?? []) list(skin as unknown as Mutable, 'bones');
    for (const parameter of file.parameters ?? []) {
      if (parameter.source !== undefined && swap(parameter.source.bone)) parameter.source.bone = to;
    }
    forEachTimeline(file, (timeline) => {
      if (timeline.type === 'bone' && swap(timeline.target)) timeline.target = to;
    });
    return;
  }

  if (kind === 'slot') {
    for (const slot of file.slots ?? []) if (slot.name === from) slot.name = to;
    for (const skin of file.skins ?? []) {
      const bySlot = skin.attachments;
      if (bySlot === undefined) continue;
      if (Object.prototype.hasOwnProperty.call(bySlot, from)) {
        bySlot[to] = bySlot[from];
        delete bySlot[from];
      }
    }
    for (const constraint of file.constraints ?? []) {
      if (constraint.type !== 'path') continue;
      const any = constraint as unknown as Mutable;
      if (swap(any['target'])) any['target'] = to;
    }
    forEachAttachment(file, (attachment) => {
      if (attachment['type'] !== 'clipping') return;
      const slots = attachment['slots'];
      if (Array.isArray(slots)) attachment['slots'] = slots.map((n) => (n === from ? to : n));
      if (swap(attachment['end'])) attachment['end'] = to;
    });
    for (const morph of file.morphs ?? []) {
      for (const target of morph.targets ?? []) if (swap(target.slot)) target.slot = to;
    }
    forEachTimeline(file, (timeline) => {
      if ((timeline.type === 'slot' || timeline.type === 'deform' || timeline.type === 'sequence')
        && swap(timeline.target)) timeline.target = to;
      if (timeline.type !== 'drawOrder' || !Array.isArray(timeline.keys)) return;
      for (const key of timeline.keys) {
        const value = key['value'];
        if (!Array.isArray(value)) continue;
        for (const entry of value) {
          const item = entry as Mutable | null;
          if (item !== null && swap(item['slot'])) item['slot'] = to;
        }
      }
    });
    return;
  }

  if (kind === 'skin') {
    for (const skin of file.skins ?? []) {
      if (skin.name === from) skin.name = to;
      list(skin as unknown as Mutable, 'includes');
    }
    forEachAttachment(file, (attachment) => {
      if (attachment['type'] === 'linkedmesh' && swap(attachment['skin'])) attachment['skin'] = to;
    });
    for (const morph of file.morphs ?? []) {
      for (const target of morph.targets ?? []) if (swap(target.skin)) target.skin = to;
    }
    forEachTimeline(file, (timeline) => {
      if (swap(timeline.skin)) timeline.skin = to;
    });
    return;
  }

  if (kind === 'constraint') {
    for (const constraint of file.constraints ?? []) if (constraint.name === from) constraint.name = to;
    for (const skin of file.skins ?? []) list(skin as unknown as Mutable, 'constraints');
    forEachTimeline(file, (timeline) => {
      if (timeline.type === 'constraint' && swap(timeline.target)) timeline.target = to;
    });
    return;
  }

  if (kind === 'animation') {
    for (const animation of file.animations ?? []) if (animation.name === from) animation.name = to;
    for (const constraint of file.constraints ?? []) {
      if (constraint.type !== 'driver') continue;
      const driver = constraint as DriverConstraintDef;
      if (swap(driver.animation)) driver.animation = to;
    }
    return;
  }

  if (kind === 'event') {
    for (const event of file.events ?? []) if (event.name === from) event.name = to;
    forEachTimeline(file, (timeline) => {
      if (timeline.type !== 'event' || !Array.isArray(timeline.keys)) return;
      for (const key of timeline.keys) if (swap(key['event'])) key['event'] = to;
    });
    return;
  }

  if (kind === 'parameter') {
    for (const parameter of file.parameters ?? []) if (parameter.name === from) parameter.name = to;
    for (const constraint of file.constraints ?? []) {
      if (constraint.type !== 'driver') continue;
      const driver = constraint as DriverConstraintDef;
      if (swap(driver.parameter)) driver.parameter = to;
    }
    forEachTimeline(file, (timeline) => {
      if (timeline.type === 'parameter' && swap(timeline.target)) timeline.target = to;
    });
    return;
  }

  if (kind === 'morph') {
    for (const morph of file.morphs ?? []) if (morph.name === from) morph.name = to;
    forEachTimeline(file, (timeline) => {
      if (timeline.type === 'morph' && swap(timeline.target)) timeline.target = to;
    });
    return;
  }

  for (const variable of file.variables ?? []) if (variable.name === from) variable.name = to;
  forEachTimeline(file, (timeline) => {
    if (timeline.type === 'variable' && swap(timeline.target)) timeline.target = to;
  });
}
