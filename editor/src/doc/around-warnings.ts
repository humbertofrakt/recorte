/**
 * **"Este boneco" que perdeu o meio** — rodada 11 (05/10/2026), spec 7.11.
 *
 * O anexo `skeleton` de quem recebe diz, em `around`, qual slot DA ENTIDADE
 * marca o meio. A entidade é outro arquivo: alguém a abre, apaga ou renomeia
 * esse slot, e a marca fica apontando para nada. O runtime então desenha a
 * peça em bloco (é o recuo escrito na spec) — e a barra de avisos tem de DIZER
 * (regra 21): senão o poder volta para o lugar do slot e ninguém sabe por quê.
 *
 * Mora em `doc/` e não importa nada do editor: quem monta os avisos é o
 * documento, ao recarregar.
 */

import type { BoneFile, SkeletonData } from '../../../runtime/src/index.js';

/** O nome curto de um arquivo de entidade: `pecas/poder.bone` → `poder`. */
function nomeCurto(uri: string): string {
  const fim = uri.split('/').pop() ?? uri;
  return fim.replace(/\.(bone|boneb|bonez)$/i, '');
}

/**
 * Uma linha por anexo `skeleton` cujo `around` cita um slot que a entidade,
 * ABERTA, não tem. Entidade que não está aberta não é julgada aqui: o aviso
 * dela é outro (o arquivo que falta), e dizer "o slot não existe" seria palpite.
 */
export function aroundWarnings(file: BoneFile, skeletons: ReadonlyMap<string, SkeletonData>): string[] {
  const out: string[] = [];
  for (const skin of file.skins ?? []) {
    for (const [slot, placeholders] of Object.entries(skin.attachments ?? {})) {
      for (const [name, raw] of Object.entries((placeholders ?? {}) as Record<string, unknown>)) {
        const def = raw as { type?: unknown; uri?: unknown; around?: unknown } | null;
        if (def === null || typeof def !== 'object' || def.type !== 'skeleton') continue;
        if (typeof def.around !== 'string' || typeof def.uri !== 'string') continue;
        const child = skeletons.get(def.uri);
        if (child === undefined) continue;
        if (child.slots.some((s) => s.name === def.around)) continue;
        out.push(
          `Este boneco: a entidade ${nomeCurto(def.uri)} não tem mais o slot "${def.around}" que marcava o meio `
          + `(slot "${slot}", anexo "${name}"). Ela está sendo desenhada em bloco. `
          + 'Escolha o meio de novo em Entidades → Este boneco…, ou tire a marca',
        );
      }
    }
  }
  return out;
}
