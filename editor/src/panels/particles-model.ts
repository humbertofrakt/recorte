/**
 * **O painel Partículas, a parte que decide** — rodada 15, linha 5 (04/10/2026).
 *
 * O Humberto, 04/10: *"não consegui usar as partículas (estava na árvore, em
 * vez de um menu próprio)"*. A decisão 2 da tela (`02`, seção 4): **skins,
 * imagens, entidades e partículas, cada uma com menu próprio**.
 *
 * Aqui mora a lista: um emissor por linha, na ordem da Árvore (a dos slots), com
 * o osso que a pessoa vê (nunca o osso próprio escondido, 8d), se está escolhido
 * e o que ele tem a dizer. Puro: o painel desenha, o teste lê sem navegador.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { Selection } from '../contract.js';
import { shownBoneOfSlot } from '../doc/own-bone.js';

/** O tipo prefixado do emissor (extensão `BONE_particles`, §2.1). */
const PARTICLE_TYPE = 'BONE_particle';

/** Uma linha da lista. */
export interface EmitterRow {
  readonly slot: string;
  readonly attachment: string;
  /** A skin onde ele mora. */
  readonly skin: string;
  /** O osso que a pessoa vê. */
  readonly bone: string;
  readonly selected: boolean;
  /** O aviso curto da marca na cena, ou `null` (`emitterProblem`). */
  readonly short: string | null;
}

/**
 * Os emissores do arquivo, um por linha.
 *
 * `shorts` vem do esqueleto posado (`emitterMarks`), pela chave `slot/nome`:
 * o aviso depende da imagem resolvida, que o arquivo sozinho não sabe.
 */
export function emitterRows(
  file: BoneFile, selection: Selection, shorts: ReadonlyMap<string, string | null> = new Map(),
): EmitterRow[] {
  const escolhidos = new Set(selection.attachments.map((a) => `${a.slot}/${a.attachment}`));
  const out: EmitterRow[] = [];
  const vistos = new Set<string>();
  for (const slot of file.slots ?? []) {
    for (const skin of file.skins ?? []) {
      const map = (skin.attachments ?? {})[slot.name] as Record<string, Record<string, unknown> | null> | undefined;
      for (const [nome, def] of Object.entries(map ?? {})) {
        if (def === null || def['type'] !== PARTICLE_TYPE) continue;
        const chave = `${slot.name}/${nome}`;
        if (vistos.has(chave)) continue;
        vistos.add(chave);
        out.push({
          slot: slot.name,
          attachment: nome,
          skin: skin.name,
          bone: shownBoneOfSlot(file, slot.name) ?? slot.bone,
          selected: escolhidos.has(chave),
          short: shorts.get(chave) ?? null,
        });
      }
    }
  }
  return out;
}

/** A seleção que o clique numa linha faz: só o emissor, como o clique na cena. */
export function selectionForRow(row: Pick<EmitterRow, 'slot' | 'attachment'>): Selection {
  return {
    bones: [], slots: [row.slot], attachments: [{ slot: row.slot, attachment: row.attachment }],
    constraints: [], vertices: [], parameters: [], variables: [],
  };
}

/** Há um emissor escolhido? É o que acende Duplicar e Apagar no painel. */
export function selectedEmitter(file: BoneFile, selection: Selection): EmitterRow | null {
  return emitterRows(file, selection).find((row) => row.selected) ?? null;
}

/** A frase da lista vazia: o que fazer, e não só "nada aqui". */
export const EMPTY_LIST_TEXT =
  'Nenhum emissor. Novo ▾ cria um no osso escolhido — ou, sem nada escolhido, no osso do meio da cena.';
