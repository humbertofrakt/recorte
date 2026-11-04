/**
 * **Apagar um osso só na skin** — rodada 12 (04/10/2026), S9.
 *
 * Decisão 5 das skins (`02 AS DECISOES`, seção 3): *"O osso que eu apago sai só
 * daquela skin. Os filhos saem junto, e o programa avisa quantos."* O exemplo
 * do Humberto: a skin "águia" apaga os braços e cria as asas; a base não muda.
 *
 * O Spine não tem isto (o osso de skin só se TIRA da skin, pág. 115); o
 * Spriter esconde imagens, não ossos (pág. 22). É o jeito do Spriter, em lote:
 *
 * | O osso apagado | O que acontece |
 * |:---|:---|
 * | é da base (ou de outra skin) | fica no arquivo. Nesta skin, todo desenho pendurado nele e nos filhos vira `null` (§4.4, esconder), e o nome dele entra na marca `ossosApagados` da skin (`doc/skin-bones.ts`): a Árvore e a cena deixam de mostrá-lo com ela vestida |
 * | nasceu nesta skin, e só ela o liga | apaga de verdade: ele era dela |
 * | nasceu nesta skin, e outra também o liga (o clone, S10) | sai só da lista desta skin, com os desenhos dela nele |
 *
 * Um passo de desfazer, e o `revert` devolve o arquivo letra por letra.
 * Campo novo no núcleo: nenhum. Plano mandado ao Diretor antes de escrever.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { emptySelection, type ChangeKind, type Command, type EditorDoc } from '../contract.js';
import { boneAndBelow, removedBonesOf, writeRemovedBones } from '../doc/skin-bones.js';
import { isOwnBone } from '../doc/own-bone.js';
import { DeleteItems } from './tree-commands.js';

/** O que apagar `selected` na skin `skin` vai fazer, antes de fazer. */
export interface SkinDeletePlan {
  skin: string;
  /** Ossos que ficam no arquivo e somem só nesta skin (marca + `null`). */
  hide: string[];
  /** Ossos desta skin que outra também liga: saem só da lista desta. */
  drop: string[];
  /** Ossos que só esta skin liga: apagados de verdade. */
  kill: string[];
  /** Todo osso que sai desta skin, o de cima e os filhos — os nomes que se veem. */
  bones: string[];
  /** Os slots cujos desenhos saem desta skin. */
  images: string[];
}

type SkinDef = NonNullable<BoneFile['skins']>[number];

function skinDef(file: BoneFile, name: string): SkinDef | undefined {
  return (file.skins ?? []).find((skin) => skin.name === name);
}

/** Os slots pendurados nos ossos `bones`. */
function slotsOn(file: BoneFile, bones: ReadonlySet<string>): string[] {
  return (file.slots ?? []).filter((slot) => bones.has(slot.bone)).map((slot) => slot.name);
}

/**
 * Todo nome de desenho que o slot pode mostrar: os de toda pele, o de setup e
 * os que as chaves de Desenho trocam. Esconder só o de agora deixaria a mão
 * fechada aparecer no meio do soco.
 */
export function placeholdersOf(file: BoneFile, slot: string): string[] {
  const out: string[] = [];
  const add = (name: unknown): void => {
    if (typeof name === 'string' && name !== '' && !out.includes(name)) out.push(name);
  };
  add((file.slots ?? []).find((s) => s.name === slot)?.attachment);
  for (const skin of file.skins ?? []) for (const name of Object.keys(skin.attachments?.[slot] ?? {})) add(name);
  for (const animation of file.animations ?? []) {
    for (const line of animation.timelines ?? []) {
      const t = line as { type?: string; target?: string; property?: string; keys?: Array<{ value?: unknown }> };
      if (t.type !== 'slot' || t.target !== slot || t.property !== 'attachment') continue;
      for (const key of t.keys ?? []) add(key.value);
    }
  }
  return out;
}

/** Monta o plano. `null` quando não há osso a apagar (só a raiz, ou nada). */
export function planDeleteInSkin(file: BoneFile, skin: string, selected: readonly string[]): SkinDeletePlan | null {
  const pele = skinDef(file, skin);
  if (pele === undefined) return null;
  const root = file.bones?.[0]?.name;
  const escolhidos = [...new Set(selected)].filter((name) => name !== root
    && (file.bones ?? []).some((bone) => bone.name === name));
  // Só os de cima: o filho de um escolhido já vai com ele.
  const debaixo = (name: string): boolean => escolhidos.some((other) => other !== name
    && boneAndBelow(file, [other]).has(name));
  const tops = escolhidos.filter((name) => !debaixo(name));
  if (tops.length === 0) return null;

  const plan: SkinDeletePlan = { skin, hide: [], drop: [], kill: [], bones: [], images: [] };
  for (const name of tops) {
    const bone = (file.bones ?? []).find((b) => b.name === name)!;
    const daqui = (pele.bones ?? []).includes(name);
    const outras = (file.skins ?? []).some((s) => s.name !== skin && (s.bones ?? []).includes(name));
    if (bone.skinRequired === true && daqui && !outras) plan.kill.push(name);
    else if (bone.skinRequired === true && daqui) plan.drop.push(name);
    else plan.hide.push(name);
  }
  const todos = boneAndBelow(file, tops);
  plan.bones = (file.bones ?? []).map((b) => b.name).filter((name) => todos.has(name) && !isOwnBone(file, name));
  plan.images = slotsOn(file, todos);
  return plan;
}

/** A frase do rodapé, com os nomes (regra 21: dizer o que saiu, e quantos). */
export function deleteInSkinNotice(plan: SkinDeletePlan): string {
  const ossos = plan.bones.length === 1 ? `1 osso (${plan.bones[0]!})` : `${plan.bones.length} ossos (${plan.bones.join(', ')})`;
  const imagens = plan.images.length === 0 ? ''
    : plan.images.length === 1 ? ` e 1 imagem (${plan.images[0]!})`
      : ` e ${plan.images.length} imagens (${plan.images.join(', ')})`;
  const saiu = plan.bones.length + plan.images.length === 1 ? 'Saiu' : 'Saíram';
  const fim = plan.kill.length > 0 && plan.hide.length === 0 && plan.drop.length === 0
    ? 'Eram só dela: saíram do arquivo'
    : 'Na base e nas outras skins continuam';
  return `${saiu} da skin "${plan.skin}" ${ossos}${imagens}. ${fim}`;
}

/** **Apagar na skin** — o comando. Um passo de desfazer, letra por letra. */
export class DeleteInSkin implements Command {
  readonly label = 'Apagar só nesta skin';
  readonly kind: ChangeKind = 'structure';
  private saved: string | null = null;

  constructor(private readonly plan: SkinDeletePlan) {}

  apply(doc: EditorDoc): void {
    const file = doc.file;
    this.saved = JSON.stringify(file);
    const pele = skinDef(file, this.plan.skin);
    if (pele === undefined) return;
    const attachments = (pele.attachments ??= {}) as Record<string, Record<string, unknown>>;

    // 1. Da base: a marca, e `null` em todo desenho pendurado.
    if (this.plan.hide.length > 0) {
      const marca = removedBonesOf(file, this.plan.skin);
      writeRemovedBones(file, this.plan.skin, [...marca, ...this.plan.hide.filter((n) => !marca.includes(n))]);
      for (const slot of slotsOn(file, boneAndBelow(file, this.plan.hide))) {
        const nomes = placeholdersOf(file, slot);
        if (nomes.length === 0) continue;
        const porSlot: Record<string, unknown> = {};
        for (const nome of nomes) porSlot[nome] = null;
        attachments[slot] = porSlot;
      }
    }

    // 2. Desta skin, e de outra também: sai da lista, com os desenhos dela.
    if (this.plan.drop.length > 0) {
      const saem = boneAndBelow(file, this.plan.drop);
      const lista = (pele.bones ?? []).filter((name) => !saem.has(name));
      if (lista.length === 0) delete pele.bones;
      else pele.bones = lista;
      for (const slot of slotsOn(file, saem)) delete attachments[slot];
    }

    // 3. Só desta skin: apaga de verdade, com tudo o que o Apagar já leva.
    if (this.plan.kill.length > 0) {
      new DeleteItems({ ...emptySelection(), bones: [...this.plan.kill] }).apply(doc);
    }
  }

  revert(doc: EditorDoc): void {
    if (this.saved === null) return;
    const target = doc.file as unknown as Record<string, unknown>;
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, JSON.parse(this.saved));
    this.saved = null;
  }
}

/**
 * **Devolver o osso a esta skin** — o caminho de volta, na linha "osso
 * apagado" da aba Peles. Tira a marca e os `null` que ela pôs nos desenhos
 * pendurados nele (os de um osso de baixo que continua apagado ficam).
 */
export class RestoreBoneInSkin implements Command {
  readonly label = 'Devolver o osso a esta skin';
  readonly kind: ChangeKind = 'structure';
  private saved: string | null = null;

  constructor(private readonly skin: string, private readonly bone: string) {}

  apply(doc: EditorDoc): void {
    const file = doc.file;
    this.saved = JSON.stringify(file);
    const pele = skinDef(file, this.skin);
    if (pele === undefined) return;
    const resto = removedBonesOf(file, this.skin).filter((name) => name !== this.bone);
    writeRemovedBones(file, this.skin, resto);
    const continuam = boneAndBelow(file, resto);
    const attachments = (pele.attachments ?? {}) as Record<string, Record<string, unknown>>;
    for (const slot of slotsOn(file, boneAndBelow(file, [this.bone]))) {
      if ((file.slots ?? []).some((s) => s.name === slot && continuam.has(s.bone))) continue;
      const porSlot = attachments[slot];
      if (porSlot === undefined) continue;
      for (const [nome, def] of Object.entries(porSlot)) if (def === null) delete porSlot[nome];
      if (Object.keys(porSlot).length === 0) delete attachments[slot];
    }
  }

  revert(doc: EditorDoc): void {
    if (this.saved === null) return;
    const target = doc.file as unknown as Record<string, unknown>;
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, JSON.parse(this.saved));
    this.saved = null;
  }
}
