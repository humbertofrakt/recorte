/**
 * Renomear — lote A5d, plano arrumação (v11.1).
 *
 * Um nome é citado de muitos lugares — filhos, slots, regras, peles, chaves —,
 * e renomear troca em todos: `rename*Everywhere`, o comando `RenameItem`, e o
 * Substituir nomes em bloco (`renameMany`, `RenameMany`, item 73). Cortado de
 * `tree-model.ts` pelas seções "Renaming" e "Substituir nomes em bloco" sem
 * mudar uma letra; o `tree-model.ts` continua exportando tudo.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { ChangeKind, Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';

// ---------------------------------------------------------------------------
// Renaming — a name is referenced from many places, so all of them move
// ---------------------------------------------------------------------------

type AnyRecord = Record<string, unknown>;

/** Renames a key of an object without losing the order of the other keys. */
function renameKey(bag: AnyRecord, from: string, to: string): void {
  if (!Object.prototype.hasOwnProperty.call(bag, from)) return;
  const entries = Object.entries(bag);
  for (const key of Object.keys(bag)) delete bag[key];
  for (const [key, value] of entries) bag[key === from ? to : key] = value;
}

function swap(list: string[] | undefined, from: string, to: string): string[] | undefined {
  return list?.map((item) => (item === from ? to : item));
}

/** Moves every reference to a bone name. */
export function renameBoneEverywhere(file: BoneFile, from: string, to: string): void {
  for (const bone of file.bones ?? []) {
    if (bone.name === from) bone.name = to;
    if (bone.parent === from) bone.parent = to;
  }
  for (const slot of file.slots ?? []) if (slot.bone === from) slot.bone = to;
  for (const c of file.constraints ?? []) {
    if ('bones' in c && Array.isArray(c.bones)) c.bones = swap(c.bones, from, to) ?? c.bones;
    if (c.type === 'physics' && c.bone === from) c.bone = to;
    if ((c.type === 'ik' || c.type === 'transform') && c.target === from) c.target = to;
  }
  for (const skin of file.skins ?? []) skin.bones = swap(skin.bones, from, to);
  for (const parameter of file.parameters ?? []) {
    if (parameter.source?.bone === from) parameter.source.bone = to;
  }
  for (const animation of file.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if (timeline.type === 'bone' && timeline.target === from) timeline.target = to;
    }
  }
}

/** Moves every reference to a slot name. */
export function renameSlotEverywhere(file: BoneFile, from: string, to: string): void {
  for (const slot of file.slots ?? []) if (slot.name === from) slot.name = to;
  for (const c of file.constraints ?? []) {
    if (c.type === 'path' && c.target === from) c.target = to;
  }
  for (const skin of file.skins ?? []) {
    if (skin.attachments) renameKey(skin.attachments as AnyRecord, from, to);
    for (const bySlot of Object.values(skin.attachments ?? {})) {
      for (const def of Object.values(bySlot)) {
        if (def && def.type === 'clipping') def.slots = swap(def.slots, from, to);
      }
    }
  }
  for (const morph of file.morphs ?? []) {
    for (const target of morph.targets ?? []) {
      if (target.slot === from) target.slot = to;
    }
  }
  for (const animation of file.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if ((timeline.type === 'slot' || timeline.type === 'deform' || timeline.type === 'sequence')
        && timeline.target === from) {
        timeline.target = to;
      }
      if (timeline.type === 'drawOrder') {
        for (const key of timeline.keys ?? []) {
          if (!Array.isArray(key.value)) continue;
          for (const entry of key.value as Array<{ slot?: string }>) {
            if (entry && entry.slot === from) entry.slot = to;
          }
        }
      }
    }
  }
}

/** Moves every reference to a constraint name. */
export function renameConstraintEverywhere(file: BoneFile, from: string, to: string): void {
  for (const c of file.constraints ?? []) if (c.name === from) c.name = to;
  for (const skin of file.skins ?? []) skin.constraints = swap(skin.constraints, from, to);
  for (const animation of file.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if (timeline.type === 'constraint' && timeline.target === from) timeline.target = to;
    }
  }
}

/** Moves every reference to an attachment name inside one slot. */
export function renameAttachmentEverywhere(
  file: BoneFile, slotName: string, from: string, to: string,
): void {
  for (const skin of file.skins ?? []) {
    const bySlot = skin.attachments?.[slotName];
    if (bySlot) renameKey(bySlot as AnyRecord, from, to);
    for (const other of Object.values(skin.attachments ?? {})) {
      for (const def of Object.values(other)) {
        if (def && def.type === 'linkedmesh' && def.parent === from) def.parent = to;
      }
    }
  }
  for (const slot of file.slots ?? []) {
    if (slot.name === slotName && slot.attachment === from) slot.attachment = to;
  }
  for (const morph of file.morphs ?? []) {
    for (const target of morph.targets ?? []) {
      if (target.slot === slotName && target.attachment === from) target.attachment = to;
    }
  }
  for (const animation of file.animations ?? []) {
    for (const timeline of animation.timelines ?? []) {
      if ((timeline.type === 'deform' || timeline.type === 'sequence')
        && timeline.target === slotName && timeline.attachment === from) {
        timeline.attachment = to;
      }
      if (timeline.type === 'slot' && timeline.property === 'attachment'
        && timeline.target === slotName) {
        for (const key of timeline.keys ?? []) {
          if (key.value === from) key.value = to;
        }
      }
    }
  }
}

/** Moves every reference to an animation name. */
export function renameAnimationEverywhere(file: BoneFile, from: string, to: string): void {
  for (const animation of file.animations ?? []) {
    if (animation.name === from) animation.name = to;
  }
  for (const c of file.constraints ?? []) {
    if (c.type === 'driver' && c.animation === from) c.animation = to;
  }
  for (const skin of file.skins ?? []) {
    for (const bySlot of Object.values(skin.attachments ?? {})) {
      for (const def of Object.values(bySlot)) {
        if (def && def.type === 'skeleton' && def.animation === from) def.animation = to;
      }
    }
  }
}

/** What a rename can target. */
export type RenameTarget =
  | { kind: 'bone'; from: string }
  | { kind: 'slot'; from: string }
  | { kind: 'constraint'; from: string }
  | { kind: 'animation'; from: string }
  | { kind: 'attachment'; slot: string; from: string };

/** Names already in use for a target, so the panel can keep the new one unique. */
export function takenNames(file: BoneFile, target: RenameTarget): string[] {
  if (target.kind === 'bone') return (file.bones ?? []).map((b) => b.name);
  if (target.kind === 'slot') return (file.slots ?? []).map((s) => s.name);
  if (target.kind === 'constraint') return (file.constraints ?? []).map((c) => c.name);
  if (target.kind === 'animation') return (file.animations ?? []).map((a) => a.name);
  const names = new Set<string>();
  for (const skin of file.skins ?? []) {
    for (const name of Object.keys(skin.attachments?.[target.slot] ?? {})) names.add(name);
  }
  return [...names];
}

function applyRename(file: BoneFile, target: RenameTarget, from: string, to: string): void {
  if (target.kind === 'bone') renameBoneEverywhere(file, from, to);
  else if (target.kind === 'slot') renameSlotEverywhere(file, from, to);
  else if (target.kind === 'constraint') renameConstraintEverywhere(file, from, to);
  else if (target.kind === 'animation') renameAnimationEverywhere(file, from, to);
  else renameAttachmentEverywhere(file, target.slot, from, to);
}

/**
 * Renames one thing and every reference to it. The new name is made unique
 * first, so undo is an exact rename back.
 */
export class RenameItem implements Command {
  readonly label = 'Renomear';
  readonly kind: ChangeKind = 'structure';
  readonly to: string;

  constructor(file: BoneFile, private readonly target: RenameTarget, wanted: string) {
    const taken = takenNames(file, target).filter((name) => name !== target.from);
    const trimmed = wanted.trim() === '' ? target.from : wanted.trim();
    this.to = uniqueName(trimmed, taken);
  }

  apply(doc: EditorDoc): void {
    applyRename(doc.file, this.target, this.target.from, this.to);
  }

  revert(doc: EditorDoc): void {
    applyRename(doc.file, this.target, this.to, this.target.from);
  }
}

// ---------------------------------------------------------------------------
// Substituir nomes em bloco — item 73
// ---------------------------------------------------------------------------

/** Um nome que muda, e um que não pôde mudar, com o motivo. */
export interface RenamePlan {
  /** O que vai ser renomeado, de → para. */
  renomeados: Array<{ target: RenameTarget; from: string; to: string }>;
  /** O que ficou de fora, e por quê. */
  pulados: Array<{ from: string; to: string; porque: string }>;
}

/**
 * O plano de trocar um pedaço de nome em ossos, slots e regras — item 73.
 *
 * Renomear vinte ossos de `_esq` para `_e` um a um é vinte cliques e vinte
 * chances de errar. E não é só o nome: cada osso é citado pelos filhos, pelos
 * slots, pelas regras e por toda chave da linha do tempo. `renameBoneEverywhere`
 * já cuida disso; o que faltava era fazer a lista.
 *
 * **Nome que colidiria é pulado, e o motivo vai escrito.** Renomear em cima de
 * um nome existente juntaria dois ossos num só, e desfazer não teria como
 * separá-los de volta. Melhor pular e dizer.
 *
 * Puro: devolve o plano e não toca no arquivo. Quem executa é `RenameMany`.
 */
export function renameMany(file: BoneFile, from: string, to: string): RenamePlan {
  const plan: RenamePlan = { renomeados: [], pulados: [] };
  if (from === '') return plan;

  const kinds: Array<{ kind: 'bone' | 'slot' | 'constraint'; names: string[] }> = [
    { kind: 'bone', names: (file.bones ?? []).map((b) => b.name) },
    { kind: 'slot', names: (file.slots ?? []).map((sl) => sl.name) },
    { kind: 'constraint', names: (file.constraints ?? []).map((c) => c.name) },
  ];

  for (const group of kinds) {
    // O conjunto cresce com o que já foi planejado: duas trocas que dessem no
    // mesmo nome novo colidiriam entre si, e não só com o que já existia.
    const taken = new Set(group.names);
    for (const name of group.names) {
      if (!name.includes(from)) continue;
      const wanted = name.split(from).join(to);
      if (wanted === name) continue;
      if (wanted.trim() === '') {
        plan.pulados.push({ from: name, to: wanted, porque: 'o nome ficaria vazio' });
        continue;
      }
      if (taken.has(wanted)) {
        plan.pulados.push({ from: name, to: wanted, porque: `já existe ${wanted}` });
        continue;
      }
      taken.delete(name);
      taken.add(wanted);
      plan.renomeados.push({
        target: { kind: group.kind, from: name } as RenameTarget,
        from: name,
        to: wanted,
      });
    }
  }
  return plan;
}

/**
 * Executa um plano de `renameMany`, tudo num passo de desfazer.
 *
 * Desfazer refaz o caminho **de trás para frente**: renomear A→B e depois B→C
 * desfeito na ordem direta poria A de volta antes de desfazer B, e o segundo
 * passo não acharia mais o que procurava.
 */
export class RenameMany implements Command {
  readonly label = 'Substituir nomes';
  readonly kind: ChangeKind = 'structure';

  constructor(private readonly plan: RenamePlan) {}

  /** Quantos nomes este comando muda. */
  get count(): number {
    return this.plan.renomeados.length;
  }

  apply(doc: EditorDoc): void {
    for (const item of this.plan.renomeados) {
      applyRename(doc.file, item.target, item.from, item.to);
    }
  }

  revert(doc: EditorDoc): void {
    for (const item of [...this.plan.renomeados].reverse()) {
      applyRename(doc.file, item.target, item.to, item.from);
    }
  }
}
