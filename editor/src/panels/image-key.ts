/**
 * **Digitar um número de IMAGEM dá o mesmo que arrastá-la** — rodada 13.
 *
 * Numa animação, uma imagem só anda por chave do osso próprio dela (8d): o
 * anexo não tem linha do tempo (decisões, seção 8). Arrastar já fazia isso;
 * digitar, não — a ficha rápida e o painel Propriedades de baixo gravavam no
 * ANEXO, isto é, na base, valendo em todas as animações (conserto 4 da
 * primeira conferência, K9 da segunda). E, com o osso próprio criado, a ficha
 * mostrava o número do OSSO (o pivô), não o da imagem: digitava-se X = 25 e
 * lia-se 7 (o "lê a diferença" da segunda conferência).
 *
 * Aqui mora a conta das duas portas, num lugar só:
 *
 * - `imageNow`: os números DA IMAGEM no espaço do osso do slot — o centro, o
 *   giro, a escala —, compostos do osso próprio (no quadro da agulha, ou na
 *   base) com o anexo dentro dele. É o que a ficha mostra.
 * - `writeImageValue`: o número digitado vira o valor do osso próprio que põe
 *   a imagem ali. Sem osso próprio e com animação aberta, ele nasce antes, no
 *   pivô (`ownBoneBirthAt`, a conta do arrasto), num passo de desfazer só.
 *
 * A conta: `pivô = t`, `giro = r + a.giro`, `escala = s · a.escala`, com
 * `t, r, s` do osso próprio e `a` o anexo. O número digitado em `x`/`y` é o
 * pivô, e vai direto para o osso; em `rotation` o osso gira em volta do pivô;
 * em escala, a mesma razão. (Até a rodada 17 o X/Y era o centro, `t + L·a`,
 * e andava ao escalar; o Diretor decidiu pelo pivô, como no Spriter.)
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { corpoDe } from '../contract.js';
import { CreateOwnBones, ownBoneOfSlot, ownBoneRefusal } from '../doc/own-bone.js';
import type { TimelineTarget } from '../anim/keying.js';
import { currentValueOf, keyValuesNow, setPropertyOrKey } from '../anim/pose-mode.js';
import { ownBoneBirthAt } from '../io/pivot-atlas.js';
import { linearTimes } from '../io/pivot-still.js';
import { getAtPointer, parsePointer, pointerOf } from './json-pointer.js';

/** Os números de imagem que viram chave pelo osso próprio. */
export const IMAGE_PROPS = new Set(['x', 'y', 'rotation', 'scaleX', 'scaleY']);
export type ImageProp = 'x' | 'y' | 'rotation' | 'scaleX' | 'scaleY';
export type ImageNumbers = Record<ImageProp, number>;

/** Um ponteiro de número de anexo (`/skins/i/attachments/slot/nome/prop`), desmontado. */
export function attachmentField(pointer: string | null): { skin: number; slot: string; attachment: string; prop: ImageProp } | null {
  if (pointer === null) return null;
  const parts = parsePointer(pointer);
  if (parts.length !== 6 || parts[0] !== 'skins' || parts[2] !== 'attachments') return null;
  if (!IMAGE_PROPS.has(parts[5]!)) return null;
  return { skin: Number(parts[1]), slot: parts[3]!, attachment: parts[4]!, prop: parts[5] as ImageProp };
}

function attachmentDef(file: BoneFile, skin: number, slot: string, attachment: string): Record<string, unknown> | null {
  const def = getAtPointer(file as unknown as Record<string, unknown>, pointerOf('skins', skin, 'attachments', slot, attachment));
  return def !== null && typeof def === 'object' ? def as Record<string, unknown> : null;
}

const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback);

/** Os números do osso agora: no quadro da agulha com animação aberta, ou da base. */
function boneNow(doc: EditorDoc, bone: string, base: boolean): Record<string, number> {
  const out: Record<string, number> = {};
  const fallback: Record<string, number> = { x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1, shearX: 0, shearY: 0 };
  const def = corpoDe(doc).file.bones.find((b) => b.name === bone) as unknown as Record<string, unknown> | undefined;
  for (const prop of Object.keys(fallback)) {
    const setup = num(def?.[prop], fallback[prop]!);
    out[prop] = base ? setup : num(currentValueOf(doc, { type: 'bone', target: bone, property: prop }), setup);
  }
  return out;
}

/**
 * Os números da imagem no espaço do osso do slot, ou `null` quando o slot não
 * tem osso próprio (aí o anexo JÁ está nesse espaço, e quem lê lê o anexo).
 * `base`: os da base, e não os do quadro.
 */
export function imageNow(doc: EditorDoc, slot: string, attachmentPointer: string, base = false): ImageNumbers | null {
  const file = corpoDe(doc).file;
  const own = ownBoneOfSlot(file, slot);
  if (own === null) return null;
  const a = getAtPointer(file as unknown as Record<string, unknown>, attachmentPointer) as Record<string, unknown> | undefined;
  if (a === undefined || a === null) return null;
  const b = boneNow(doc, own, base);
  // Rodada 17, decisão do Diretor (05/10): o X e o Y são o PIVÔ da imagem —
  // o osso próprio, que nasce no pivô —, como no Spriter. Não mudam ao escalar
  // nem ao girar (antes: o centro, `t + L·a`, que andava: 40 virava 50,5).
  return {
    x: b['x']!,
    y: b['y']!,
    rotation: b['rotation']! + num(a['rotation'], 0),
    scaleX: b['scaleX']! * num(a['scaleX'], 1),
    scaleY: b['scaleY']! * num(a['scaleY'], 1),
  };
}

let gesture = 0;

/**
 * O painel Propriedades de BAIXO mostra o anexo como ele é: com osso próprio,
 * os números de DENTRO dele. Numa animação, digitar ali move a imagem a mesma
 * diferença dentro do osso próprio — por chave do osso, e não na base. `x`/`y`
 * de dentro viram as duas chaves de posição (o eixo do osso pode estar
 * girado); giro, a mesma diferença; escala, a mesma razão. Um passo de desfazer.
 */
export function writeInnerAsKey(
  doc: EditorDoc, own: string, prop: ImageProp, valor: number, shown: number, label: string,
): 'recusado' | null {
  const b = boneNow(doc, own, false);
  const values: Array<{ target: TimelineTarget; value: number }> = [];
  const alvo = (p: string): TimelineTarget => ({ type: 'bone', target: own, property: p });
  if (prop === 'x' || prop === 'y') {
    const d = valor - shown;
    const v = linearTimes(b['rotation']!, b['scaleX']!, b['scaleY']!, b['shearX']!, b['shearY']!,
      prop === 'x' ? { x: d, y: 0 } : { x: 0, y: d });
    values.push({ target: alvo('x'), value: b['x']! + v.x }, { target: alvo('y'), value: b['y']! + v.y });
  } else if (prop === 'rotation') {
    values.push({ target: alvo('rotation'), value: b['rotation']! + (valor - shown) });
  } else {
    values.push({ target: alvo(prop), value: shown === 0 ? valor : b[prop]! * (valor / shown) });
  }
  const outcome = keyValuesNow(doc, values, `Chavear ${label.toLowerCase()}`, `imagem-de-dentro:${own}:${++gesture}`);
  return outcome === 'recusado' ? 'recusado' : null;
}

/**
 * Grava `valor` no número `prop` da IMAGEM do anexo em `attachmentPointer`.
 *
 * - com osso próprio: o osso recebe o valor que põe a imagem ali (base ou
 *   chave, pela regra de sempre, `setPropertyOrKey`);
 * - sem osso próprio e com animação aberta: ele nasce no pivô, e a chave entra
 *   no mesmo passo de desfazer;
 * - sem osso próprio e com a base aberta: `undefined` — quem chamou grava no
 *   anexo, como sempre.
 *
 * `shown` é o número que a pessoa VIA antes de digitar (a imagem no espaço do
 * osso do slot): é dele que sai a diferença.
 */
export function writeImageValue(
  doc: EditorDoc, attachmentPointer: string, prop: ImageProp, valor: number, shown: number, label: string,
): 'recusado' | null | undefined {
  const field = attachmentField(`${attachmentPointer}/${prop}`);
  if (field === null) return undefined;
  const corpo = corpoDe(doc);
  let own = ownBoneOfSlot(corpo.file, field.slot);
  let mergeKey: string | null = null;
  if (own === null) {
    if (doc.animation === null) return undefined;
    const why = ownBoneRefusal(corpo.file, field.slot);
    if (why !== null) {
      doc.notice(why);
      return 'recusado';
    }
    const def = attachmentDef(corpo.file, field.skin, field.slot, field.attachment);
    if (def === null) return undefined;
    const at = ownBoneBirthAt(corpo, field.slot, field.attachment) ?? { x: num(def['x'], 0), y: num(def['y'], 0) };
    mergeKey = `imagem-digitada:${field.slot}:${++gesture}`;
    const create = new CreateOwnBones([{ slot: field.slot, anchor: { x: at.x, y: at.y, rotation: num(def['rotation'], 0) } }], mergeKey, `Mudar ${label}`);
    corpo.run(create);
    own = create.bones.get(field.slot) ?? null;
    if (own === null) return 'recusado';
  }
  const b = boneNow(doc, own, doc.animation === null);
  // X e Y são o pivô: o valor vai direto para o osso próprio (rodada 17).
  const value = prop === 'scaleX' || prop === 'scaleY'
    ? (shown === 0 ? valor : b[prop]! * (valor / shown))
    : prop === 'x' || prop === 'y' ? valor : b[prop]! + (valor - shown);
  const target: TimelineTarget = { type: 'bone', target: own, property: prop };
  if (mergeKey !== null) {
    const outcome = keyValuesNow(doc, [{ target, value }], `Chavear ${label.toLowerCase()}`, `${mergeKey}:chave`);
    return outcome === 'recusado' ? 'recusado' : null;
  }
  const outcome = setPropertyOrKey(doc, target, value, { label: `Mudar ${label}`, kind: 'structure' });
  return outcome === 'recusado' ? 'recusado' : null;
}
