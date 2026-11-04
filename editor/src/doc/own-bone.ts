/**
 * **O osso próprio da imagem** — rodada 8d (04/10/2026).
 *
 * O Spriter: *"quando você move a imagem, ela também cria uma chave. E ela não
 * leva o osso."* O formato não tem chave para a posição de um anexo, e não vai
 * ganhar (decisões, seção 8). Então cada imagem movida numa animação ganha um
 * osso SÓ DELA, filho do osso em que ela está; mover a imagem move esse osso, e
 * a chave é dele. É o que o nosso importador do Spriter já faz, um osso por
 * sprite (`ferramentas/src/importar/spriter.ts`, "one auxiliary bone").
 *
 * UM POR SLOT, e não por anexo: o slot é o "objeto" do Spriter — a troca de
 * imagem anda junto com ele.
 *
 * ONDE NASCE: na âncora da imagem, com o giro dela. Girar na animação gira em
 * volta da imagem, e escalar escala nos eixos dela, como no Spriter. Os anexos do
 * slot (todas as skins) são reescritos pela conta inversa: nenhum pixel anda.
 *
 * A MARCA é do editor (regra 6): `visible: false` e
 * `extensions.RECORTE_editor_state.ossoProprio = true`. Para o jogo é um osso
 * comum; o runtime não usa `visible` para desenhar.
 *
 * Puro: nada de DOM. A Árvore, a cena e a folha perguntam aqui.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { EDITOR_EXTENSION, uniqueName, type ChangeKind, type Command, type EditorDoc } from '../contract.js';

type Def = Record<string, unknown>;
type BoneDef = BoneFile['bones'][number] & { extensions?: Record<string, unknown> };

/** O campo da marca, dentro de `extensions.RECORTE_editor_state` do osso. */
export const OWN_BONE_FIELD = 'ossoProprio';

/** Os tipos de anexo que a conta sabe reescrever sem mover um pixel. */
// Rodada 15: o emissor (`BONE_particle`) tem `x`, `y`, `rotation` desde a §9.10
// da extensão, e a conta inversa vale para ele como para o `point`.
const MOVABLE = new Set(['region', 'skeleton', 'point', 'BONE_particle']);

/** O que a recusa diz, por tipo: em português, e dizendo o que a peça é. */
const SHAPE_WORDS: Readonly<Record<string, string>> = {
  mesh: 'uma malha',
  linkedmesh: 'uma malha ligada',
  boundingbox: 'uma caixa de colisão',
  path: 'um caminho',
  clipping: 'uma máscara',
};

function boneDef(file: BoneFile, name: string): BoneDef | undefined {
  return file.bones.find((b) => b.name === name) as BoneDef | undefined;
}

function slotDef(file: BoneFile, name: string): { name: string; bone: string } | undefined {
  return (file.slots ?? []).find((s) => s.name === name);
}

/** Os slots pendurados no osso. */
function slotsOn(file: BoneFile, bone: string): string[] {
  return (file.slots ?? []).filter((s) => s.bone === bone).map((s) => s.name);
}

function hasChildBone(file: BoneFile, bone: string): boolean {
  return file.bones.some((b) => b.parent === bone);
}

/**
 * O "_osso" de um arquivo que veio do Spriter antes da marca existir: o nome
 * que o importador escreve, um slot só, sem osso filho.
 */
function isLegacySpriterOwn(file: BoneFile, def: BoneDef): boolean {
  const generator = (file as { bone?: { generator?: unknown } }).bone?.generator;
  if (typeof generator !== 'string' || !/spriter/i.test(generator)) return false;
  if (!def.name.endsWith('_osso') || def.parent === undefined) return false;
  return slotsOn(file, def.name).length === 1 && !hasChildBone(file, def.name);
}

/** `true` quando o osso é o osso próprio de uma imagem. */
export function isOwnBone(file: BoneFile, boneName: string): boolean {
  const def = boneDef(file, boneName);
  if (def === undefined) return false;
  const state = def.extensions?.[EDITOR_EXTENSION] as Def | undefined;
  if (state?.[OWN_BONE_FIELD] === true) return true;
  return isLegacySpriterOwn(file, def);
}

/** O osso próprio do slot, ou `null` quando a imagem ainda não tem um. */
export function ownBoneOfSlot(file: BoneFile, slotName: string): string | null {
  const slot = slotDef(file, slotName);
  return slot !== undefined && isOwnBone(file, slot.bone) ? slot.bone : null;
}

/**
 * O osso que a pessoa VÊ para um osso: o pai, quando é um osso próprio; ele
 * mesmo, nos outros casos. É o que a Árvore, as Propriedades e a folha dizem.
 */
export function shownBone(
  file: BoneFile, boneName: string,
  /**
   * Rodada 50, lote 4 (doc `101`): o pai **do quadro** (a chave `parent`,
   * §9.4), como a Árvore desenha os ossos. Sem ele, o desenho que virou filho
   * de `head` numa animação continuava aparecendo debaixo de `torso`.
   */
  applied?: ReadonlyMap<string, string | undefined>,
): string {
  if (!isOwnBone(file, boneName)) return boneName;
  const pai = applied?.has(boneName) === true ? applied.get(boneName) : boneDef(file, boneName)?.parent;
  return pai ?? boneName;
}

/** O osso visível do slot: onde a imagem "está", para quem olha. */
export function shownBoneOfSlot(file: BoneFile, slotName: string): string | null {
  const slot = slotDef(file, slotName);
  return slot === undefined ? null : shownBone(file, slot.bone);
}

/** O slot de um osso próprio, para a folha dar à linha o nome da imagem. */
export function slotOfOwnBone(file: BoneFile, boneName: string): string | null {
  if (!isOwnBone(file, boneName)) return null;
  return slotsOn(file, boneName)[0] ?? null;
}

/**
 * **O nome que o usuário lê para o osso próprio** — rodada 23, defeito 10.
 *
 * A forma: *"o rodapé dizia o nome de dentro"* (*"Posição Y de hand_osso"*),
 * enquanto a linha do tempo dizia *"Imagem hand"*. Um nome só, para os dois:
 * **Imagem**, **Entidade** quando o slot leva um `.bone`, **Emissor** quando
 * leva partículas. `null` quando o osso não é próprio.
 */
export function ownBoneLabel(file: BoneFile, boneName: string): string | null {
  const slot = slotOfOwnBone(file, boneName);
  if (slot === null) return null;
  return `${slotKindWord(file, slot)} ${slot}`;
}

/** "Imagem", "Entidade" ou "Emissor": o que o slot mostra, na palavra da tela. */
export function slotKindWord(file: BoneFile, slotName: string): string {
  const shown = (slotDef(file, slotName) as { attachment?: string } | undefined)?.attachment ?? slotName;
  for (const skin of file.skins ?? []) {
    const def = ((skin.attachments ?? {})[slotName] as Record<string, Def | null> | undefined)?.[shown];
    if (def === undefined || def === null) continue;
    const type = (def as { type?: unknown }).type;
    if (type === 'skeleton') return 'Entidade';
    if (type === 'BONE_particle') return 'Emissor';
    return 'Imagem';
  }
  return 'Imagem';
}

/**
 * Por que a imagem NÃO pode ganhar o osso próprio, em português, ou `null`.
 *
 * Regra 21: onde o programa não sabe, ele avisa. Uma malha guarda a forma nos
 * vértices, no espaço do osso; uma chave `slot/bone` troca o osso no meio da
 * animação. Nos dois casos a conta não é a desta rodada.
 */
export function ownBoneRefusal(file: BoneFile, slotName: string): string | null {
  const slot = slotDef(file, slotName);
  if (slot === undefined) return 'Esta imagem não está no arquivo';
  for (const skin of file.skins ?? []) {
    const map = (skin.attachments ?? {})[slotName] as Record<string, Def | null> | undefined;
    for (const def of Object.values(map ?? {})) {
      if (def === null) continue;
      const type = typeof def['type'] === 'string' ? def['type'] : 'region';
      if (!MOVABLE.has(type)) {
        return `"${slotName}" tem ${SHAPE_WORDS[type] ?? `uma forma (${type})`}: a chave só da imagem ainda não vale para ela. Mova pelo osso dela`;
      }
    }
  }
  for (const animation of file.animations ?? []) {
    for (const tl of (animation as { timelines?: Def[] }).timelines ?? []) {
      if (tl['type'] === 'slot' && tl['target'] === slotName && tl['property'] === 'bone') {
        return `"${slotName}" troca de osso na animação "${String((animation as { name?: unknown }).name)}": a chave só da imagem ainda não vale para ela. Mova pelo osso dela`;
      }
    }
  }
  return null;
}

/**
 * O clique na cena leva o osso junto com esta imagem? Só quando ela não pode
 * andar sozinha (`ownBoneRefusal`): uma malha, uma caixa, um caminho. As
 * outras se escolhem sozinhas, como no Spriter (rodada 8d).
 */
export function clickKeepsBone(file: BoneFile, slotName: string): boolean {
  // Rodada 15: o emissor de partículas é uma peça, e o clique escolhe só a
  // peça (fim do `03`). Ele não leva o osso junto, mesmo antes de andar sozinho.
  if (isEmitterSlot(file, slotName)) return false;
  return ownBoneRefusal(file, slotName) !== null;
}

/** `true` quando todo anexo do slot, em toda skin, é um emissor (`BONE_particle`). */
export function isEmitterSlot(file: BoneFile, slotName: string): boolean {
  let any = false;
  for (const skin of file.skins ?? []) {
    const map = (skin.attachments ?? {})[slotName] as Record<string, Def | null> | undefined;
    for (const def of Object.values(map ?? {})) {
      if (def === null) continue;
      if (def['type'] !== 'BONE_particle') return false;
      any = true;
    }
  }
  return any;
}

/**
 * O que o rodapé diz quando o clique leva o osso junto — rodada 8d, pedido do
 * Diretor: sem isto o Humberto clica na cabeça-malha, o osso vem junto, e ele
 * acha que o clique novo falhou ali. `null` para a imagem que anda sozinha.
 */
export function clickKeepsBoneNotice(file: BoneFile, slotName: string, bone: string): string | null {
  // Rodada 15: o emissor não leva o osso (`clickKeepsBone`), e o rodapé não
  // pode dizer que leva — era a primeira foto do lote 1.
  if (isEmitterSlot(file, slotName)) return null;
  const why = ownBoneRefusal(file, slotName);
  if (why === null) return null;
  if (why.includes('troca de osso')) return `"${slotName}" troca de osso por chave: ela se move pelo osso dela (${bone})`;
  const shape = why.match(/tem (uma? [^:]+):/)?.[1] ?? 'uma forma';
  return `"${slotName}" é ${shape}: ela se move pelo osso dela (${bone})`;
}

/** A âncora de onde o osso próprio nasce: x, y e giro do anexo, no osso do slot. */
export interface OwnBoneAnchor {
  x: number;
  y: number;
  rotation: number;
}

const rad = (deg: number): number => (deg * Math.PI) / 180;
const round = (v: number): number => Math.round(v * 1e6) / 1e6;

/**
 * Reescreve um anexo no espaço do osso próprio: a inversa de `T(x,y)·R(giro)`.
 * Exato para `region`, `skeleton` e `point`: os três são posição, giro e escala.
 */
export function reexpressInOwnBone(def: Def, at: OwnBoneAnchor): Def {
  const x = typeof def['x'] === 'number' ? def['x'] : 0;
  const y = typeof def['y'] === 'number' ? def['y'] : 0;
  const r = typeof def['rotation'] === 'number' ? def['rotation'] : 0;
  const dx = x - at.x;
  const dy = y - at.y;
  const c = Math.cos(rad(-at.rotation));
  const s = Math.sin(rad(-at.rotation));
  const out: Def = { ...def };
  const nx = round(dx * c - dy * s);
  const ny = round(dx * s + dy * c);
  const nr = round(r - at.rotation);
  if (nx === 0) delete out['x']; else out['x'] = nx;
  if (ny === 0) delete out['y']; else out['y'] = ny;
  if (nr === 0) delete out['rotation']; else out['rotation'] = nr;
  return out;
}

/** Uma imagem que ganha o osso próprio, e de onde ele nasce. */
export interface OwnBoneRequest {
  slot: string;
  anchor: OwnBoneAnchor;
}

/**
 * Cria o osso próprio de uma ou mais imagens — várias quando um grupo de
 * imagens anda junto. Um comando com `apply` e `revert` exatos (regra 6): o
 * revert devolve o arquivo letra por letra.
 *
 * `mergeKey` deixa a chave que vem logo depois entrar no MESMO passo de
 * desfazer — a chave usa `${mergeKey}:chave`, e a pilha junta as duas num gesto
 * (`doc/undo.ts`, `GestureGroup`).
 */
export class CreateOwnBones implements Command {
  readonly kind: ChangeKind = 'structure';
  /** O osso que nasceu para cada slot, depois do primeiro `apply`. */
  readonly bones = new Map<string, string>();
  private before: string | null = null;

  constructor(
    readonly requests: readonly OwnBoneRequest[],
    readonly mergeKey: string | null = null,
    readonly label = 'Mover imagem',
  ) {}

  apply(doc: EditorDoc): void {
    const file = doc.file;
    // O que muda: a lista de ossos, o slot, os anexos do slot e as skins.
    // Guardar o arquivo inteiro é o jeito exato de voltar, e acontece uma vez
    // por gesto, no primeiro movimento.
    this.before = JSON.stringify(file);
    for (const request of this.requests) this.createOne(file, request);
    // Quem usa a extensão a declara: o validador cobra (EXT_REQUIRED_NOT_USED).
    if (this.bones.size > 0) {
      const used = (file as { extensionsUsed?: string[] }).extensionsUsed ?? [];
      if (!used.includes(EDITOR_EXTENSION)) (file as { extensionsUsed?: string[] }).extensionsUsed = [...used, EDITOR_EXTENSION];
    }
  }

  private createOne(file: BoneFile, request: OwnBoneRequest): void {
    const slot = slotDef(file, request.slot);
    if (slot === undefined || isOwnBone(file, slot.bone)) return;
    const parent = boneDef(file, slot.bone);
    const name = this.bones.get(request.slot)
      ?? uniqueName(`${request.slot}_osso`, file.bones.map((b) => b.name));
    this.bones.set(request.slot, name);
    const bone = { name, parent: slot.bone } as BoneDef & Def;
    const at = request.anchor;
    if (round(at.x) !== 0) bone['x'] = round(at.x);
    if (round(at.y) !== 0) bone['y'] = round(at.y);
    if (round(at.rotation) !== 0) bone['rotation'] = round(at.rotation);
    if ((parent as Def | undefined)?.['skinRequired'] === true) bone['skinRequired'] = true;
    bone['visible'] = false;
    bone.extensions = { [EDITOR_EXTENSION]: { [OWN_BONE_FIELD]: true } };
    // No FIM: nenhum índice de osso de ninguém anda, e o pai vem antes.
    file.bones.push(bone);
    for (const skin of file.skins ?? []) {
      const s = skin as { bones?: string[]; attachments?: Record<string, Record<string, Def | null>> };
      if (s.bones?.includes(slot.bone) === true) s.bones.push(name);
      const map = s.attachments?.[request.slot];
      if (map === undefined) continue;
      for (const key of Object.keys(map)) {
        const def = map[key];
        if (def !== null && def !== undefined) map[key] = reexpressInOwnBone(def, at);
      }
    }
    slot.bone = name;
  }

  revert(doc: EditorDoc): void {
    if (this.before === null) return;
    const old = JSON.parse(this.before) as Record<string, unknown>;
    const file = doc.file as unknown as Record<string, unknown>;
    for (const key of Object.keys(file)) if (!(key in old)) delete file[key];
    Object.assign(file, old);
  }
}
