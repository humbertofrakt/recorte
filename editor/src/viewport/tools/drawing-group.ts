/**
 * Vários desenhos soltos de uma vez (dono B) — lote 60a, plano pasta do projeto.
 *
 * O Humberto, 10/09/2026, com duas imagens soltas escolhidas: *"estão presas a
 * um osso maldito, eu não fiz esse osso"*. Era a raiz: clicar num desenho
 * escolhia também o osso dele, e o da arte solta é a raiz. A caixa do
 * Transformar englobava o pivô dela, na origem, e arrastar mexia no mundo
 * inteiro. A raiz agora não pega clique (`picking.ts`), e o que sobra
 * escolhido são só os desenhos.
 *
 * Com **dois ou mais desenhos e nenhum osso**, as ferramentas mexem em cada
 * desenho, como o Spriter:
 *
 * | Gesto   | Faz                                                    |
 * |:--------|:-------------------------------------------------------|
 * | Mover   | todos andam o mesmo tanto, no mundo                    |
 * | Girar   | cada um gira em volta do **centro comum**, e vira junto |
 * | Escalar | cada um se afasta do centro comum, e cresce junto      |
 * | setas   | todos andam um pixel (um só também)                    |
 *
 * O centro comum é o meio da caixa em volta dos desenhos: o pivô que o
 * Transformar desenha. O que se escreve é o de sempre: `x`, `y`, `rotation`,
 * `scaleX`, `scaleY` de cada anexo, no espaço do osso dele. Um passo de
 * desfazer por arrasto: `SetProperties` junta os quadros com os mesmos campos.
 */

import { corpoDe } from '../../contract.js';
import type { EditorDoc } from '../../contract.js';
import type { Bone, Matrix2x3 } from '../../../../runtime/src/index.js';
import { SetProperties } from '../../doc/commands.js';
import { pointerOf } from '../../panels/json-pointer.js';
import { attachmentWorldPoints } from '../picking.js';
import { ensureOwnBones, ownBoneNow, pickedFor, startAttachmentDrag, type PickedAttachment } from './attachment-edit.js';
import { newMergeKey, parentFrame, readBoneNow, worldDeltaToFrame, writeBoneValues } from './select.js';
import { nudgeLabel } from './nudge-words.js';

export interface Point {
  x: number;
  y: number;
}

/** Um campo do arquivo e o valor novo dele. */
export type Entry = readonly [string, number];

/** Os desenhos escolhidos que as ferramentas movem: todo `region`, e nenhum osso junto. */
export function selectedDrawings(doc: EditorDoc): PickedAttachment[] {
  if (doc.selection.bones.length > 0) return [];
  const out: PickedAttachment[] = [];
  for (const item of doc.selection.attachments) {
    const picked = pickedFor(doc, item.slot, item.attachment);
    if (picked !== null) out.push(picked);
  }
  // H3 (rodada final, 29/09/2026): a imagem solta na cena nasce escolhida como
  // SLOT, sem o anexo, e a seta não achava o que empurrar. Um slot escolhido
  // sozinho vale pelo desenho que ele mostra agora.
  for (const slot of doc.selection.slots) {
    if (out.some((item) => item.slot === slot)) continue;
    const showing = doc.skeleton?.findSlot(slot)?.attachment?.name ?? null;
    if (showing === null) continue;
    const picked = pickedFor(doc, slot, showing);
    if (picked !== null) out.push(picked);
  }
  return out;
}

/** Dois ou mais desenhos soltos, ou `null`. Um só é o `pickedAttachment` de sempre. */
export function pickedDrawings(doc: EditorDoc): PickedAttachment[] | null {
  const list = selectedDrawings(doc);
  return list.length >= 2 ? list : null;
}

/** O meio da caixa em volta dos desenhos escolhidos, em mundo: o pivô do grupo. */
export function drawingsCenter(doc: EditorDoc): Point | null {
  const skeleton = doc.skeleton;
  if (skeleton === null) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const item of doc.selection.attachments) {
    const slot = skeleton.findSlot(item.slot);
    if (slot === null) continue;
    const shape = attachmentWorldPoints(slot, skeleton.getAttachment(item.slot, item.attachment));
    if (shape === null) continue;
    for (let i = 0; i < shape.count; i++) {
      const x = shape.vertices[i * 2]!;
      const y = shape.vertices[i * 2 + 1]!;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }
  if (!Number.isFinite(minX) || !Number.isFinite(minY)) return null;
  return { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
}

function field(p: PickedAttachment, name: string): string {
  return pointerOf('skins', p.skin, 'attachments', p.slot, p.attachment, name);
}

/** `-1` quando o osso está espelhado: girar para um lado na tela é girar para o outro no número. */
function handedness(bone: Bone): number {
  return bone.a * bone.d - bone.b * bone.c < 0 ? -1 : 1;
}

/** Leva a âncora de cada desenho para um ponto novo do mundo, no espaço do osso dele. */
function placed(p: PickedAttachment, worldX: number, worldY: number): Entry[] {
  const local = p.bone.worldToLocal(worldX, worldY);
  return [[field(p, 'x'), local.x], [field(p, 'y'), local.y]];
}

/** Todos andam `dx`, `dy` no mundo. */
export function groupMoveEntries(items: readonly PickedAttachment[], dx: number, dy: number): Entry[] {
  return items.flatMap((p) => placed(p, p.anchor.x + dx, p.anchor.y + dy));
}

/** Cada um gira `turn` graus em volta de `center`, e o desenho vira junto. */
export function groupRotateEntries(
  items: readonly PickedAttachment[], center: Point, turn: number,
): Entry[] {
  const r = (turn * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return items.flatMap((p) => {
    const dx = p.anchor.x - center.x;
    const dy = p.anchor.y - center.y;
    return [
      ...placed(p, center.x + dx * cos - dy * sin, center.y + dx * sin + dy * cos),
      [field(p, 'rotation'), p.rotation + turn * handedness(p.bone)] as Entry,
    ];
  });
}

/**
 * Cada um se afasta de `center` por `fx`, `fy` (eixos da tela), e cresce junto.
 *
 * A escala do desenho é nos eixos DELE. Um desenho deitado (mais perto de 90°
 * que de 0°) cresce na largura quando a caixa cresce na altura, e vice-versa.
 * Com a mesma escala nos dois eixos a conta é exata, em qualquer giro.
 */
export function groupScaleEntries(
  items: readonly PickedAttachment[], center: Point, fx: number, fy: number,
): Entry[] {
  return items.flatMap((p) => {
    const angle = Math.atan2(p.bone.c, p.bone.a) + (p.rotation * handedness(p.bone) * Math.PI) / 180;
    const along = Math.abs(Math.cos(angle)) >= Math.abs(Math.sin(angle));
    return [
      ...placed(p, center.x + (p.anchor.x - center.x) * fx, center.y + (p.anchor.y - center.y) * fy),
      // Rodada 15: o emissor anda com o grupo e não cresce — ele não tem escala.
      ...(p.emitter ? [] : [
        [field(p, 'scaleX'), p.scaleX * (along ? fx : fy)] as Entry,
        [field(p, 'scaleY'), p.scaleY * (along ? fy : fx)] as Entry,
      ]),
    ];
  });
}

function rounded(entries: readonly Entry[]): Entry[] {
  return entries.map(([pointer, value]) => [pointer, Math.round(value * 1e4) / 1e4] as const);
}

/** Escreve um quadro do arrasto. Os quadros seguidos viram um passo; `endMerge` no soltar fecha. */
export function writeGroupValues(doc: EditorDoc, label: string, entries: readonly Entry[]): void {
  corpoDe(doc).run(new SetProperties(rounded(entries), { label, kind: 'structure', mergeable: true }));
}

// ---------------------------------------------------------------------------
// Rodada 8d: as imagens com osso próprio andam pelo osso
// ---------------------------------------------------------------------------

/** Um gesto do grupo, no mundo. */
export type GroupOp =
  | { kind: 'move'; dx: number; dy: number }
  | { kind: 'rotate'; center: Point; turn: number }
  | { kind: 'scale'; center: Point; fx: number; fy: number };

/** O osso próprio de uma imagem do grupo, como estava quando o gesto começou. */
interface GroupBone {
  bone: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  /** O espaço em que `x`, `y` vivem: o mundo do pai. */
  frame: Matrix2x3;
  /** A raiz do osso no mundo: o ponto que gira e se afasta do centro. */
  origin: Point;
  /** O ângulo do eixo X do osso no mundo, para saber qual escala cresce. */
  angle: number;
  hand: number;
}

function frameHand(m: Matrix2x3): number {
  return m.a * m.d - m.b * m.c < 0 ? -1 : 1;
}

/**
 * **O arrasto de vários desenhos**, e as setas — rodada 8d.
 *
 * Na base, a imagem sem osso próprio escreve no anexo, como sempre; a que tem
 * escreve a pose de repouso do osso dela. Tudo num `SetProperties` só, para o
 * arrasto continuar sendo um passo de desfazer.
 *
 * Numa animação, toda imagem anda pelo osso próprio: a que não tem ganha um no
 * primeiro movimento, num comando só para todas, e a chave entra no mesmo passo
 * (`ensureOwnBones`). Se alguma não pode, nada anda e o rodapé diz por quê.
 */
export class DrawingGroupDrag {
  private started = false;
  private refused = false;
  private bones: GroupBone[] = [];
  private loose: PickedAttachment[] = [];
  private keyMerge: string;

  constructor(
    readonly items: readonly PickedAttachment[],
    readonly label: string,
    readonly mergeKey: string = newMergeKey('imagens'),
  ) {
    this.keyMerge = mergeKey;
  }

  private start(doc: EditorDoc): void {
    this.started = true;
    let own: Map<string, string>;
    if (doc.animation !== null) {
      const made = ensureOwnBones(doc, this.items, this.mergeKey, this.label);
      if (made === null) {
        this.refused = true;
        return;
      }
      own = made;
      // A chave entra no passo do osso que acabou de nascer.
      this.keyMerge = `${this.mergeKey}:chave`;
    } else {
      own = new Map();
      for (const p of this.items) {
        const bone = ownBoneNow(doc, p.slot);
        if (bone !== null) own.set(p.slot, bone);
      }
    }
    const skeleton = doc.skeleton;
    for (const p of this.items) {
      const name = own.get(p.slot);
      const bone = name === undefined || skeleton === null ? null : skeleton.findBone(name);
      if (name === undefined || bone === null || skeleton === null) {
        this.loose.push(p);
        continue;
      }
      const frame = parentFrame(skeleton, name);
      this.bones.push({
        bone: name,
        x: readBoneNow(doc, name, 'x'),
        y: readBoneNow(doc, name, 'y'),
        rotation: readBoneNow(doc, name, 'rotation'),
        scaleX: readBoneNow(doc, name, 'scaleX'),
        scaleY: readBoneNow(doc, name, 'scaleY'),
        frame,
        origin: { x: bone.worldX, y: bone.worldY },
        angle: Math.atan2(bone.c, bone.a),
        hand: frameHand(frame),
      });
    }
  }

  /** Escreve um quadro do gesto. `false` quando o gesto foi recusado. */
  write(doc: EditorDoc, op: GroupOp, mergeable = true): boolean {
    if (!this.started) this.start(doc);
    if (this.refused) return false;
    const values: Array<{ bone: string; key: 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY'; value: number }> = [];
    for (const g of this.bones) {
      let to = g.origin;
      if (op.kind === 'move') to = { x: g.origin.x + op.dx, y: g.origin.y + op.dy };
      else if (op.kind === 'rotate') {
        const r = (op.turn * Math.PI) / 180;
        const dx = g.origin.x - op.center.x;
        const dy = g.origin.y - op.center.y;
        to = { x: op.center.x + dx * Math.cos(r) - dy * Math.sin(r), y: op.center.y + dx * Math.sin(r) + dy * Math.cos(r) };
      } else {
        to = { x: op.center.x + (g.origin.x - op.center.x) * op.fx, y: op.center.y + (g.origin.y - op.center.y) * op.fy };
      }
      const local = worldDeltaToFrame(g.frame, to.x - g.origin.x, to.y - g.origin.y);
      values.push({ bone: g.bone, key: 'x', value: g.x + local.x });
      values.push({ bone: g.bone, key: 'y', value: g.y + local.y });
      if (op.kind === 'rotate') values.push({ bone: g.bone, key: 'rotation', value: g.rotation + op.turn * g.hand });
      if (op.kind === 'scale') {
        const along = Math.abs(Math.cos(g.angle)) >= Math.abs(Math.sin(g.angle));
        values.push({ bone: g.bone, key: 'scaleX', value: g.scaleX * (along ? op.fx : op.fy) });
        values.push({ bone: g.bone, key: 'scaleY', value: g.scaleY * (along ? op.fy : op.fx) });
      }
    }
    const rounded4 = values.map((v) => ({ ...v, value: Math.round(v.value * 1e4) / 1e4 }));
    if (doc.animation !== null) {
      writeBoneValues(doc, this.label, this.keyMerge, rounded4);
      return true;
    }
    // Na base: o anexo de quem não tem osso próprio, e a pose de repouso de quem tem.
    const entries: Entry[] = [];
    if (op.kind === 'move') entries.push(...groupMoveEntries(this.loose, op.dx, op.dy));
    else if (op.kind === 'rotate') entries.push(...groupRotateEntries(this.loose, op.center, op.turn));
    else entries.push(...groupScaleEntries(this.loose, op.center, op.fx, op.fy));
    const file = corpoDe(doc).file;
    for (const v of rounded4) {
      const index = file.bones.findIndex((b) => b.name === v.bone);
      if (index >= 0) entries.push([pointerOf('bones', index, v.key), v.value]);
    }
    if (entries.length === 0) return true;
    corpoDe(doc).run(new SetProperties(rounded(entries), { label: this.label, kind: 'structure', mergeable }));
    return true;
  }
}


/**
 * As setas com só desenhos escolhidos: todos andam, um passo de desfazer por
 * tecla. Devolve quantos andaram. Antes do lote 60a a seta andava com a raiz,
 * e com ela todo desenho solto.
 */
export function nudgeDrawings(doc: EditorDoc, dx: number, dy: number): number {
  const items = selectedDrawings(doc);
  if (items.length === 0) return 0;
  startAttachmentDrag();
  // Rodada 8d: pelo mesmo caminho do arrasto — numa animação, a seta também
  // vira chave da imagem. Um passo de desfazer por tecla.
  // Rodada 46, lote 1: o passo diz quanto andou ("Andar 10 px com o desenho").
  const drag = new DrawingGroupDrag(items, nudgeLabel(dx, dy, items.length === 1 ? 'o desenho' : 'os desenhos'));
  return drag.write(doc, { kind: 'move', dx, dy }, false) ? items.length : 0;
}
