/**
 * Mexer no DESENHO sem mexer no osso (dono B) — item 2.
 *
 * Um desenho preso a um osso tem posição, giro e escala PRÓPRIOS, dentro do
 * espaço daquele osso (§7.5). Ajustar esses valores é o gesto mais comum de
 * montagem depois de criar o osso: a imagem entrou dois pixels fora, a espada
 * está torta, o cabelo precisa descer um pouco. Antes disto, o único jeito era
 * digitar número no painel Propriedades.
 *
 * COMO SE ATIVA
 * Com **um desenho escolhido e nenhum osso** — é assim que uma linha da Árvore
 * seleciona —, as ferramentas Mover, Girar e Escalar passam a trabalhar no
 * anexo. Com osso escolhido elas mexem no osso, como sempre. A regra é essa, e
 * ela é a mesma dos três.
 *
 * O QUE É ESCRITO
 * `x`, `y`, `rotation`, `scaleX` e `scaleY` do anexo, no espaço do osso. O
 * gesto acontece no mundo; a conversão é aqui.
 *
 * **Numa animação vira chave** — rodada 8d (04/10/2026), *"como no
 * Spriter"*. O formato não tem linha do tempo para a posição de um anexo, então
 * a imagem ganha um osso só dela, escondido, e a chave é dele
 * (`doc/own-bone.ts`). Este arquivo escreve no ANEXO só na base, e só enquanto
 * a imagem não tem osso próprio; com ele, as ferramentas mexem no osso próprio.
 */

import { corpoDe } from '../../contract.js';
import type { EditorDoc } from '../../contract.js';
import type { Bone } from '../../../../runtime/src/index.js';
import { SetProperties } from '../../doc/commands.js';
import { pointerOf } from '../../panels/json-pointer.js';
import { findAttachment } from '../../panels/properties-model.js';
import { CreateOwnBones, ownBoneOfSlot, ownBoneRefusal, slotKindWord, type OwnBoneRequest } from '../../doc/own-bone.js';
import { ownBoneBirthAt } from '../../io/pivot-atlas.js';

/** O desenho que as ferramentas vão mexer, com tudo o que elas precisam. */
export interface PickedAttachment {
  slot: string;
  attachment: string;
  skin: number;
  bone: Bone;
  /** Onde a âncora do anexo está, no mundo: a raiz do osso mais `x`, `y`. */
  anchor: { x: number; y: number };
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  /**
   * `true` para o emissor de partículas (rodada 15, §9.10 da extensão): ele tem
   * `x`, `y` e `rotation`, e NÃO tem escala. Escalar o recusa, com o motivo.
   */
  emitter: boolean;
}

/**
 * O desenho escolhido, quando há exatamente um e nenhum osso junto.
 *
 * `null` em qualquer outro caso, e é de propósito: com um osso escolhido as
 * ferramentas têm que mexer no osso. Uma regra que às vezes vale e às vezes não
 * é uma regra que ninguém aprende.
 *
 * Só `region` e `skeleton` (a entidade, rodada 8a): um `mesh` guarda a forma
 * nos vértices e não tem `x`/`y`, e um `boundingbox`, um `point` ou uma
 * máscara não são desenho.
 */
export function pickedAttachment(doc: EditorDoc): PickedAttachment | null {
  if (doc.selection.bones.length > 0) return null;
  // Rodada 8a (C16): a linha da Ordem escolhe o SLOT, sem o anexo. Um slot
  // sozinho vale pelo desenho que ele mostra agora — a mesma leitura das
  // setas (H3, `drawing-group.ts`), agora também no arrasto.
  if (doc.selection.attachments.length === 0 && doc.selection.slots.length === 1) {
    const slot = doc.selection.slots[0]!;
    const showing = doc.skeleton?.findSlot(slot)?.attachment?.name ?? null;
    return showing === null ? null : pickedFor(doc, slot, showing);
  }
  if (doc.selection.attachments.length !== 1) return null;
  const picked = doc.selection.attachments[0];
  return pickedFor(doc, picked.slot, picked.attachment);
}

/**
 * Um desenho qualquer, pelo slot e pelo nome — o que `pickedAttachment` lê
 * de um só, e `drawing-group.ts` lê de vários (lote 60a). `null` fora de
 * `region`.
 */
export function pickedFor(doc: EditorDoc, slotName: string, attachmentName: string): PickedAttachment | null {
  const skeleton = doc.skeleton;
  if (skeleton === null) return null;
  const picked = { slot: slotName, attachment: attachmentName };

  const found = findAttachment(corpoDe(doc).file, picked.slot, picked.attachment);
  // Rodada 8a: a entidade (§7.11) tem o MESMO par de números que a imagem —
  // `x, y, rotation, scaleX, scaleY` no espaço do osso — e se mexe igual.
  // Rodada 15: o emissor (§9.10 da extensão) tem `x`, `y`, `rotation` no
  // espaço do osso, como a imagem, e se move e gira igual. Escala ele não tem.
  const type = found?.def.type;
  if (found === null || (type !== 'region' && type !== 'skeleton' && type !== 'BONE_particle')) return null;
  const emitter = type === 'BONE_particle';
  const slot = (corpoDe(doc).file.slots ?? []).find((s) => s.name === picked.slot);
  if (slot === undefined) return null;
  const bone = skeleton.findBone(slot.bone);
  if (bone === null) return null;

  const def = found.def as {
    x?: number; y?: number; rotation?: number; scaleX?: number; scaleY?: number;
  };
  const x = def.x ?? 0;
  const y = def.y ?? 0;
  return {
    slot: picked.slot,
    attachment: picked.attachment,
    skin: found.skin,
    bone,
    anchor: bone.localToWorld(x, y),
    x,
    y,
    rotation: def.rotation ?? 0,
    scaleX: emitter ? 1 : def.scaleX ?? 1,
    scaleY: emitter ? 1 : def.scaleY ?? 1,
    emitter,
  };
}

/** Um movimento no mundo, no espaço do osso: só a rotação e a escala do osso. */
export function worldDeltaToBone(
  bone: Bone, dx: number, dy: number,
): { x: number; y: number } {
  const at = bone.worldToLocal(bone.worldX + dx, bone.worldY + dy);
  const zero = bone.worldToLocal(bone.worldX, bone.worldY);
  return { x: at.x - zero.x, y: at.y - zero.y };
}

/** Os campos que um arrasto escreve, e o que cada um vale agora. */
export type AttachmentField = 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY';

/*
 * O aviso "Posição do desenho é da montagem: ela não vira chave" saiu na
 * rodada 8d (04/10/2026). Numa animação a imagem agora vira chave, como no
 * Spriter: pelo osso próprio dela (`doc/own-bone.ts`).
 */

/** Recomeça o arrasto de um desenho. Ficou vazio na 8d; os chamadores continuam. */
export function startAttachmentDrag(): void {
  // nada a recomeçar
}

/** O que o rodapé diz quando alguém tenta escalar um emissor. */
export const EMITTER_HAS_NO_SCALE =
  'O emissor não tem escala: ele se move e gira. O tamanho das partículas é "Tamanho", em Propriedades';

/** O osso próprio da imagem, quando ela já tem um. */
export function ownBoneNow(doc: EditorDoc, slot: string): string | null {
  return ownBoneOfSlot(corpoDe(doc).file, slot);
}

/**
 * **Onde o osso próprio nasce: no PIVÔ da imagem** — rodada 13, ponto 3
 * (05/10/2026). É o que o Spriter faz: a imagem gira em volta do pivô dela.
 * A conta mora em `io/pivot-atlas.ts` (`ownBoneBirthAt`), para a ficha rápida
 * dar o mesmo que o arrasto (conserto 4 da conferência). `null` de lá = o
 * `x, y` do próprio anexo, como antes.
 */
export function ownBoneBirthPoint(corpo: EditorDoc, p: PickedAttachment): { x: number; y: number } {
  return ownBoneBirthAt(corpo, p.slot, p.attachment) ?? { x: p.x, y: p.y };
}

/**
 * **O osso de cada imagem que vai andar numa animação** — rodada 8d.
 *
 * A que já tem osso próprio usa o dela; a que não tem ganha um agora, num
 * comando só para todas (`CreateOwnBones`), com `mergeKey`: a chave que vem
 * depois usa `${mergeKey}:chave` e as duas viram um passo de desfazer.
 *
 * `null` quando alguma não pode (uma malha, uma troca de osso por chave): o
 * rodapé diz por quê e o que fazer, e nada é gravado (regra 21).
 */
export function ensureOwnBones(
  doc: EditorDoc, items: readonly PickedAttachment[], mergeKey: string, label: string,
): Map<string, string> | null {
  const corpo = corpoDe(doc);
  const out = new Map<string, string>();
  const missing: OwnBoneRequest[] = [];
  for (const p of items) {
    const own = ownBoneOfSlot(corpo.file, p.slot);
    if (own !== null) {
      out.set(p.slot, own);
      continue;
    }
    const why = ownBoneRefusal(corpo.file, p.slot);
    if (why !== null) {
      doc.notice(why);
      return null;
    }
    missing.push({ slot: p.slot, anchor: { ...ownBoneBirthPoint(corpo, p), rotation: p.rotation } });
  }
  if (missing.length > 0) {
    const command = new CreateOwnBones(missing, mergeKey, label);
    corpo.run(command);
    for (const [slot, bone] of command.bones) out.set(slot, bone);
  }
  return out;
}

/**
 * Escreve os campos do anexo num passo de desfazer que o arrasto vai fundindo.
 *
 * `mergeable` liga o `mergeWith` do `SetProperty`: sessenta escritas por segundo
 * viram um passo só, e `endMerge` no soltar fecha esse passo.
 */
export function writeAttachmentValues(
  doc: EditorDoc,
  picked: PickedAttachment,
  label: string,
  values: ReadonlyArray<{ field: AttachmentField; value: number }>,
): void {
  // Rodada 8a: os campos vão JUNTOS, num comando só. Eram um `SetProperty`
  // por campo, e o `x` de um movimento não se juntava ao `y` do anterior —
  // um arrasto deixava dezenas de passos, e um `Ctrl+Z` desfazia só o último
  // `y`. Valia para a imagem também. Um gesto, um desfazer.
  corpoDe(doc).run(new SetProperties(
    values.map(({ field, value }) => [
      pointerOf('skins', picked.skin, 'attachments', picked.slot, picked.attachment, field),
      Math.round(value * 1e4) / 1e4,
    ] as const),
    // Rodada 23, defeito 10: o emissor se move e gira como desenho, mas o
    // rodapé diz o nome dele ("Mover emissor"), e não "Mover desenho".
    { label: slotKindWord(corpoDe(doc).file, picked.slot) === 'Emissor' ? label.replace('desenho', 'emissor') : label, kind: 'structure', mergeable: true },
  ));
}
