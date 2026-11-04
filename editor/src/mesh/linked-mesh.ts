/**
 * Creating a `linkedmesh` from the editor (spec 7.5, owner C).
 *
 * WHAT A LINKED MESH IS FOR
 * -------------------------
 * Two drawings with the SAME shape and a different image: the four mouths of a
 * face, the six hands of a character, the same shirt in three colours. Cutting
 * the mesh again for each one costs an afternoon and guarantees they will drift
 * apart the day someone edits only one of them.
 *
 * A `linkedmesh` cuts nothing. It names a `parent` and BORROWS its geometry:
 *
 * | Herdado do `parent` | Próprio da malha ligada |
 * |:--------------------|:------------------------|
 * | `vertices`          | `path` (a imagem)       |
 * | `binding` (pesos)   | `color`                 |
 * | `uvs`               | `sequence`              |
 * | `triangles`         |                         |
 * | `hull`, `edges`     |                         |
 *
 * Nada é copiado: o runtime resolve o `parent` ao carregar e aponta para os
 * MESMOS arrays (7.5). Mover um vértice do pai move o filho, sempre, porque é
 * o mesmo array. É isso que este módulo escreve no arquivo — três campos, e
 * nem um número de geometria.
 *
 * THE TWO RULES OF 7.5, CHECKED HERE BEFORE ANYTHING IS WRITTEN
 *   1. `parent` está no MESMO SLOT, e é do tipo `mesh`.
 *   2. `parent` NÃO É outra malha ligada. Sem corrente.
 *
 * Pure module: it reads a `BoneFile` and gives back commands. No DOM.
 */

import type {
  BoneFile, LinkedMeshAttachmentDef, MeshAttachmentDef,
} from '../../../runtime/src/index.js';
import type { Command, EditorDoc } from '../contract.js';
import { uniqueName } from '../contract.js';
import { SetProperties, pointerOf } from '../doc/commands.js';

// ---------------------------------------------------------------------------
// Who can be a parent
// ---------------------------------------------------------------------------

/** One mesh that could be the origin of a linked mesh. */
export interface LinkedMeshParent {
  /** Placeholder name inside the slot. */
  attachment: string;
  /** Skin where this mesh lives. */
  skin: string;
  skinIndex: number;
  /** How many vertices it has, so the list says how big the shape is. */
  vertexCount: number;
  /** `true` when it has weights (`binding`), which the linked mesh borrows too. */
  weighted: boolean;
  /** What the user reads in the list. */
  label: string;
}

/**
 * Every mesh of one slot, in every skin — the candidates for "Usar a forma de
 * outra malha".
 *
 * Only the SAME SLOT, because 7.5 says so and the reason is physical: the
 * geometry is in the slot bone's space, and the same numbers in another slot
 * would draw the shape somewhere else entirely.
 */
export function linkedMeshParents(file: BoneFile, slot: string): LinkedMeshParent[] {
  const out: LinkedMeshParent[] = [];
  const skins = file.skins ?? [];
  for (let i = 0; i < skins.length; i++) {
    const holder = skins[i]!.attachments?.[slot];
    if (holder === undefined) continue;
    for (const [name, def] of Object.entries(holder)) {
      if (def === null || def === undefined || def.type !== 'mesh') continue;
      const mesh = def as MeshAttachmentDef;
      const count = mesh.binding !== undefined
        ? mesh.binding.counts.length
        : (mesh.vertices ?? []).length >> 1;
      out.push({
        attachment: name,
        skin: skins[i]!.name,
        skinIndex: i,
        vertexCount: count,
        weighted: mesh.binding !== undefined,
        label: skins[i]!.name === 'default'
          ? `${name} — ${count} vértices${mesh.binding !== undefined ? ', com pesos' : ''}`
          : `${name} (skin ${skins[i]!.name}) — ${count} vértices${mesh.binding !== undefined ? ', com pesos' : ''}`,
      });
    }
  }
  return out;
}

/** Why a linked mesh cannot be made right now, or `null` when it can. */
export function whyNotLink(file: BoneFile, slot: string | null): string | null {
  if (slot === null) return 'Escolha um slot ou um desenho primeiro.';
  if (!(file.slots ?? []).some((entry) => entry.name === slot)) {
    return `O slot "${slot}" não existe neste arquivo.`;
  }
  if (linkedMeshParents(file, slot).length === 0) {
    return 'Este slot não tem nenhuma malha para servir de origem. Vire um desenho em malha primeiro.';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Making one
// ---------------------------------------------------------------------------

/** Every placeholder name already used in this slot, in every skin. */
export function namesInSlot(file: BoneFile, slot: string): string[] {
  const taken = new Set<string>();
  for (const skin of file.skins ?? []) {
    for (const name of Object.keys(skin.attachments?.[slot] ?? {})) taken.add(name);
  }
  return [...taken];
}

/** A free name for a new linked mesh: `mao_ligada`, `mao_ligada2`, … */
export function linkedMeshName(file: BoneFile, slot: string, parent: string): string {
  return uniqueName(`${parent}_ligada`, namesInSlot(file, slot));
}

export interface LinkedMeshOptions {
  /** Skin the new attachment goes into. Default: the editable skin. */
  skin?: string;
  /** Placeholder name. Default: `<parent>_ligada`, made unique. */
  name?: string;
  /**
   * Image in the atlas. Default: the parent's image.
   *
   * Not the new name, which is what the format would assume: a placeholder
   * with no image in the atlas is INVISIBLE, and the artist would press a
   * button and watch the drawing disappear. Starting as a copy of the parent
   * means the button changes nothing on screen — and then one field in
   * Propriedades swaps the image, which is the whole point of 7.5.
   */
  path?: string;
  /**
   * `true` (the default) makes the `deform` and the morphs of the parent reach
   * this mesh too, which is what "the same shape" means. `false` gives it a
   * deform of its own — and then the two shapes CAN drift apart, on purpose.
   */
  inheritDeform?: boolean;
  /** `true` (the default) also points the slot at the new drawing. */
  show?: boolean;
}

/** What was created, so the panel can say it out loud. */
export interface LinkedMeshResult {
  command: Command;
  name: string;
  skin: string;
  parent: string;
  parentSkin: string;
  /** `true` when the slot was pointed at the new drawing too. */
  shown: boolean;
}

/**
 * Builds the command that creates a linked mesh in `slot`, borrowing the
 * geometry of `parent`.
 *
 * Throws with a sentence in Portuguese when 7.5 would be broken, instead of
 * writing a file the validator will refuse later.
 */
export function createLinkedMesh(
  file: BoneFile, slot: string, parent: LinkedMeshParent, options: LinkedMeshOptions = {},
  editableSkin = 'default',
): LinkedMeshResult {
  const parents = linkedMeshParents(file, slot);
  const found = parents.find((c) => c.attachment === parent.attachment && c.skin === parent.skin);
  if (found === undefined) {
    throw new Error(`"${parent.attachment}" não é uma malha do slot "${slot}". Uma malha ligada só empresta a forma de uma malha do mesmo slot (7.5).`);
  }

  const skinName = options.skin ?? editableSkin;
  const index = (file.skins ?? []).findIndex((entry) => entry.name === skinName);
  if (index < 0) throw new Error(`A skin "${skinName}" não existe neste arquivo.`);

  const name = options.name ?? linkedMeshName(file, slot, parent.attachment);
  if (namesInSlot(file, slot).includes(name)) {
    throw new Error(`Já existe um desenho chamado "${name}" no slot "${slot}".`);
  }

  const source = (file.skins ?? [])[found.skinIndex]!.attachments![slot]![found.attachment] as MeshAttachmentDef;
  const path = options.path ?? source.path ?? found.attachment;
  const def: LinkedMeshAttachmentDef = {
    type: 'linkedmesh',
    parent: parent.attachment,
    ...(parent.skin === 'default' ? {} : { skin: parent.skin }),
    ...(path === name ? {} : { path }),
    ...(options.inheritDeform === false ? { inheritDeform: false } : {}),
    ...(typeof source.width === 'number' ? { width: source.width } : {}),
    ...(typeof source.height === 'number' ? { height: source.height } : {}),
  };

  const entries: Array<readonly [string, unknown]> = [
    [pointerOf('skins', index, 'attachments', slot, name), def],
  ];

  // Um desenho que ninguém vê parece um botão quebrado. O slot passa a mostrar
  // a malha nova, no mesmo passo de desfazer — e desfazer devolve o anterior.
  const show = options.show !== false;
  const slotIndex = (file.slots ?? []).findIndex((entry) => entry.name === slot);
  if (show && slotIndex >= 0) {
    entries.push([pointerOf('slots', slotIndex, 'attachment'), name]);
  }

  return {
    command: new SetProperties(entries, {
      label: 'Usar a forma de outra malha', kind: 'structure', mergeable: false,
    }),
    name,
    skin: skinName,
    parent: parent.attachment,
    parentSkin: parent.skin,
    shown: show && slotIndex >= 0,
  };
}

/** Runs `createLinkedMesh` on the open document. */
export function linkMesh(
  doc: EditorDoc, slot: string, parent: LinkedMeshParent, options: LinkedMeshOptions = {},
): LinkedMeshResult {
  const editable = doc.visibleSkins[0] ?? 'default';
  const result = createLinkedMesh(doc.file, slot, parent, options, editable);
  doc.run(result.command);
  return result;
}

/** One line for the panel: what was made, and from what. */
export function linkedMeshLine(result: LinkedMeshResult): string {
  const pele = result.skin === 'default' ? '' : ` na skin ${result.skin}`;
  const origem = result.parentSkin === 'default'
    ? result.parent
    : `${result.parent} (skin ${result.parentSkin})`;
  return `"${result.name}" criada${pele}, emprestando a forma de "${origem}". `
    + 'Ela começa com a mesma imagem; troque em Propriedades, no campo Imagem.';
}
