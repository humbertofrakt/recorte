/**
 * Achar um desenho no arquivo — lote A4 (v10.7).
 *
 * Morava em `panels/properties-model.ts`, e `mesh/mesh-doc.ts` (base) importava
 * de um painel. O painel continua exportando o mesmo nome, daqui.
 */

import type { AttachmentDef, BoneFile } from '../../../runtime/src/index.js';

/** Finds an attachment in any skin. Returns the skin index and the definition. */
export function findAttachment(
  file: BoneFile, slot: string, attachment: string,
): { skin: number; skinName: string; def: AttachmentDef } | null {
  const skins = file.skins ?? [];
  for (let i = 0; i < skins.length; i++) {
    const def = skins[i]!.attachments?.[slot]?.[attachment];
    if (def) return { skin: i, skinName: skins[i]!.name, def };
  }
  return null;
}
