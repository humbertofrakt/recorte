/**
 * **O que deixa de existir sai da seleção** — rodada 23, defeito 3.
 *
 * A forma: *"a seleção guardava o nome de quem já não existe"*. Três caras,
 * a mesma coisa: tirar da pilha a skin onde um osso nasceu (o osso some da
 * Árvore e Propriedades continua dizendo "Osso: osso", com as alças na cena);
 * desfazer a criação de um osso escolhido; apagar osso só na skin. Cada um
 * desses caminhos teria de lembrar de limpar a seleção, e nenhum lembrava. Por
 * isso a conta mora no documento, depois de cada comando de estrutura: um
 * lugar só, que nenhum comando novo esquece.
 *
 * "Existir" é o que a Árvore mostra: o osso está no arquivo e a pilha de skins
 * não o tira (`bonesGone`); o slot está no arquivo e o osso dele existe; a
 * regra está no arquivo. Parâmetros e variáveis não mudam aqui.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { Selection } from '../contract.js';
import { bonesGone } from './skin-bones.js';

/** A seleção sem o que não existe mais, ou `null` quando nada mudou. */
export function pruneSelection(file: BoneFile, stack: readonly string[], selection: Selection): Selection | null {
  const gone = bonesGone(file, stack);
  const bones = new Set((file.bones ?? []).map((b) => b.name).filter((name) => !gone.has(name)));
  const slots = new Set((file.slots ?? []).filter((s) => bones.has(s.bone)).map((s) => s.name));
  const constraints = new Set((file.constraints ?? []).map((c) => c.name));
  const keptBones = selection.bones.filter((name) => bones.has(name));
  const keptSlots = selection.slots.filter((name) => slots.has(name));
  const keptAttachments = selection.attachments.filter((a) => slots.has(a.slot));
  const keptConstraints = selection.constraints.filter((name) => constraints.has(name));
  const same = keptBones.length === selection.bones.length
    && keptSlots.length === selection.slots.length
    && keptAttachments.length === selection.attachments.length
    && keptConstraints.length === selection.constraints.length;
  if (same) return null;
  return {
    ...selection,
    bones: keptBones,
    slots: keptSlots,
    attachments: keptAttachments,
    constraints: keptConstraints,
    // Os vértices valem para UMA malha escolhida: se ela saiu, eles saem.
    vertices: keptAttachments.length === selection.attachments.length ? selection.vertices : [],
  };
}
