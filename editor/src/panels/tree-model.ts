/**
 * Model behind the "Árvore" panel.
 *
 * Desde o lote A5d (v11.1) este arquivo é a porta de três: as linhas
 * (`tree-rows.ts`), os comandos de criar e apagar (`tree-commands.ts`) e o
 * renomear (`rename.ts`). Ele exporta tudo o que eles exportam, então nenhum
 * `import` de fora mudou; aqui ficaram só "Inverter a seleção" e "Qual
 * desenho o slot está mostrando". Puro, testável sem DOM.
 *
 * A note on bone order: the loader requires the first bone to be the root and
 * every parent to come before its children. So reparenting is not just a change
 * of the `parent` property — the array is re-sorted depth first. Commands that
 * touch order keep a snapshot and restore it on undo, which is exact.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { Selection } from '../contract.js';
import { emptySelection } from '../contract.js';
export { canReparent, isDescendantBone, reparentVerdict, sortBonesTopologically } from '../doc/bones.js';

// ---------------------------------------------------------------------------
// Rows — mora em `tree-rows.ts` desde o lote A5d
// ---------------------------------------------------------------------------

export * from './tree-rows.js';

// ---------------------------------------------------------------------------
// Commands — mora em `tree-commands.ts` desde o lote A5d
// ---------------------------------------------------------------------------

export * from './tree-commands.js';

// ---------------------------------------------------------------------------
// Renaming — a name is referenced from many places, so all of them move — mora em `rename.ts` desde o lote A5d
// ---------------------------------------------------------------------------

export * from './rename.js';

// ---------------------------------------------------------------------------
// Inverter a seleção — item 56
// ---------------------------------------------------------------------------

/**
 * Tudo o que NÃO está escolhido, entre o que dá para escolher — item 56.
 *
 * O que está travado ou escondido fica de fora, porque escolher o que não pega
 * clique é escolher o que não dá para mexer: a seleção teria itens que nenhuma
 * ferramenta alcança, e o painel mostraria campos de coisa invisível.
 */
export function invertSelection(
  file: BoneFile,
  selection: Selection,
  canPick: { bone(name: string): boolean; slot(name: string): boolean },
): Selection {
  const bones = new Set(selection.bones);
  const slots = new Set(selection.slots);
  for (const item of selection.attachments) slots.add(item.slot);
  return {
    ...emptySelection(),
    bones: (file.bones ?? [])
      .map((b) => b.name)
      .filter((name) => !bones.has(name) && canPick.bone(name)),
    slots: (file.slots ?? [])
      .map((sl) => sl.name)
      .filter((name) => !slots.has(name) && canPick.slot(name)),
  };
}

// ---------------------------------------------------------------------------
// Qual desenho o slot está mostrando
// ---------------------------------------------------------------------------

/**
 * `true` quando este anexo é o que o slot mostra agora — item 9.
 *
 * A bolinha da Árvore lê isto. É o mesmo campo `slot.attachment` que a lista do
 * painel Propriedades escreve, então marcar num lugar acende no outro sem que
 * um saiba do outro.
 */
export function isCurrentAttachment(
  file: BoneFile, slot: string, attachment: string,
): boolean {
  const found = (file.slots ?? []).find((s) => s.name === slot);
  return found !== undefined && found.attachment === attachment;
}
