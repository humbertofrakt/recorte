/**
 * O rodapé do gesto — rodada 46, lote 1 (doc `66`, §4).
 *
 * O que o arrasto já fez, com a unidade, para o rodapé dizer **enquanto o
 * botão está apertado**: *"Mover X 12 px · Y −4 px"*, *"Girar 30° (agora
 * 50°)"*, *"Escalar X × 1,34"*, *"Inclinar X 21,6° (agora 21,6°)"*. Antes
 * eram *"Mover"*, sem quanto, e *"Escalar X 1,34"*, sem o ×; e nenhum dos
 * dois aparecia antes de soltar (o `repose` de cada quadro apagava).
 *
 * As frases são puras (`moveFooter`, `rotateFooter`, `scaleFooter`,
 * `shearFooter`, `nudgeFooter`). `GestureFooter` guarda os valores de partida
 * no `onDown` e diz a frase no `onMove`: é o mesmo objeto no Transformar e nas
 * quatro ferramentas soltas (W, E, R, Z), então a frase é a mesma pelos dois
 * caminhos. Quando o Transformar repassa o gesto a uma delas, ela fica calada
 * (`quietFooter`) e quem fala é ele — uma frase por movimento, não duas.
 */

import type { EditorDoc } from '../../contract.js';
import { pickedAttachment, ownBoneNow } from './attachment-edit.js';
import { pickedDrawings } from './drawing-group.js';
import { readBoneNow } from './select.js';
import type { Grip } from '../held-by-rule.js';

/** Os números de um gesto: do primeiro osso, ou do desenho sozinho. */
export interface GestureValues {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  shearX: number;
  shearY: number;
}

/** Um número para o rodapé: vírgula, sinal de menos de verdade, sem zeros à toa. */
export function fmtFooter(value: number, digits: number): string {
  const f = 10 ** digits;
  const r = Math.round(value * f) / f;
  const s = String(Math.abs(r)).replace('.', ',');
  return r < 0 ? `−${s}` : s;
}

/** Quanto andou, nos eixos dos campos X e Y da ficha. */
export function moveFooter(dx: number, dy: number): string {
  return `Mover X ${fmtFooter(dx, 1)} px · Y ${fmtFooter(dy, 1)} px`;
}

/**
 * Quanto girou e onde está. Rodada 46, lote 3 (nota (c) do doc `73`): o
 * "agora" é o ângulo LOCAL, o do campo Ângulo da ficha, e a frase diz isso.
 */
export function rotateFooter(turn: number, now: number): string {
  return `Girar ${fmtFooter(turn, 1)}° (agora ${fmtFooter(now, 1)}° local)`;
}

/** Quanto cresceu: `x`, `y`, ou os dois (`null`). */
export function scaleFooter(axis: 'x' | 'y' | null, fx: number, fy: number): string {
  if (axis === 'x') return `Escalar X × ${fmtFooter(fx, 2)}`;
  if (axis === 'y') return `Escalar Y × ${fmtFooter(fy, 2)}`;
  return `Escalar X × ${fmtFooter(fx, 2)} · Y × ${fmtFooter(fy, 2)}`;
}

/** Quanto inclinou, num eixo, e onde está. */
export function shearFooter(axis: 'x' | 'y', turn: number, now: number): string {
  return `Inclinar ${axis === 'x' ? 'X' : 'Y'} ${fmtFooter(turn, 1)}° (agora ${fmtFooter(now, 1)}°)`;
}

/** O nome do passo de uma seta: *"Andar 10 px para a esquerda com o osso"* (`nudge-words.ts`). */
export { nudgeLabel } from './nudge-words.js';

function ratio(now: number, start: number): number {
  return Math.abs(start) < 1e-12 ? 1 : now / start;
}

/** Os valores de agora: do osso, ou do desenho escolhido (pelo osso próprio dele, se tiver). */
export function gestureValuesNow(doc: EditorDoc, bone: string | null): GestureValues | null {
  if (bone !== null) {
    return {
      x: readBoneNow(doc, bone, 'x'),
      y: readBoneNow(doc, bone, 'y'),
      rotation: readBoneNow(doc, bone, 'rotation'),
      scaleX: readBoneNow(doc, bone, 'scaleX'),
      scaleY: readBoneNow(doc, bone, 'scaleY'),
      shearX: readBoneNow(doc, bone, 'shearX'),
      shearY: readBoneNow(doc, bone, 'shearY'),
    };
  }
  // Com vários desenhos (lote 60a), conta pelo primeiro: todos andam juntos.
  const picked = pickedAttachment(doc) ?? pickedDrawings(doc)?.[0] ?? null;
  if (picked === null) return null;
  // Rodada 8d: a imagem com osso próprio anda pelo osso; o rodapé lê dele.
  const own = ownBoneNow(doc, picked.slot);
  if (own !== null) return gestureValuesNow(doc, own);
  return {
    x: picked.x, y: picked.y, rotation: picked.rotation, scaleX: picked.scaleX, scaleY: picked.scaleY,
    // Um anexo não tem inclinação própria no formato (§7).
    shearX: 0, shearY: 0,
  };
}

export type FooterKind =
  | { kind: 'move' }
  | { kind: 'rotate' }
  | { kind: 'scale'; axis: 'x' | 'y' | null }
  | { kind: 'shear'; axis: 'x' | 'y' | null };

/**
 * O pedaço que diz que uma regra leva o osso — Rodada 47, lote 4 (nota a do doc 82). Durante o
 * arrasto o rodapé dizia "Girar 26,3°" como se tivesse funcionado, e o aviso
 * de que a regra segurava só vinha ao soltar. Agora a frase do gesto já diz.
 */
export function heldTag(rules: readonly string[]): string {
  if (rules.length === 0) return '';
  return rules.length === 1 ? ` (a regra ${rules[0]} manda nele)` : ` (as regras ${rules.join(', ')} mandam nele)`;
}

/**
 * As regras que SEGURAM a parte do osso que o gesto mexe — não basta a regra
 * levar o osso: a IK gira o braço, mas não o tira do lugar; dizer "a regra
 * manda" num Mover seria mentir (regra 21). Pela especificação (§6.2 a §6.5,
 * §8.2): IK segura o giro (e a escala, se estica ou encolhe); a transformação
 * e o caminho, cada parte com força maior que 0; a física, cada parte com peso
 * maior que 0; o Comando, a propriedade do alvo. Regra com força 0 não segura.
 */
export function rulesHolding(file: { constraints?: unknown }, bone: string, grip: Grip): string[] {
  const list = file.constraints;
  if (!Array.isArray(list)) return [];
  const num = (v: unknown, padrao: number): number => (typeof v === 'number' ? v : padrao);
  const out: string[] = [];
  for (const raw of list) {
    if (raw === null || typeof raw !== 'object') continue;
    const c = raw as Record<string, unknown>;
    if (typeof c['name'] !== 'string' || num(c['mix'], 1) <= 0) continue;
    const leva = (Array.isArray(c['bones']) && (c['bones'] as unknown[]).includes(bone)) || c['bone'] === bone;
    let segura = false;
    switch (c['type']) {
      case 'ik':
        segura = leva && (grip === 'rotation' || (grip === 'scale' && (c['stretch'] === true || c['compress'] === true)));
        break;
      case 'transform':
        segura = leva && (grip === 'rotation' ? num(c['mixRotation'], 1) > 0
          : grip === 'position' ? num(c['mixX'], 1) > 0 || num(c['mixY'], 1) > 0
            : grip === 'scale' ? num(c['mixScaleX'], 1) > 0 || num(c['mixScaleY'], 1) > 0
              : num(c['mixShearY'], 1) > 0);
        break;
      case 'path':
        segura = leva && (grip === 'rotation' ? num(c['mixRotation'], 1) > 0
          : grip === 'position' ? num(c['mixX'], 1) > 0 || num(c['mixY'], 1) > 0 : false);
        break;
      case 'physics':
        segura = leva && (grip === 'rotation' ? num(c['rotation'], 0) > 0
          : grip === 'position' ? num(c['x'], 0) > 0 || num(c['y'], 0) > 0
            : grip === 'scale' ? num(c['scaleX'], 0) > 0 : num(c['shearX'], 0) > 0);
        break;
      default: {
        // O Comando (§8.2): o alvo osso, na propriedade dele.
        const alvos = Array.isArray(c['targets']) ? c['targets'] as Array<Record<string, unknown>> : [];
        segura = alvos.some((t) => t !== null && typeof t === 'object' && t['type'] === 'bone' && t['target'] === bone
          && gripOfProperty(String(t['property'] ?? 'rotation')) === grip);
      }
    }
    if (segura) out.push(c['name'] as string);
  }
  return out;
}

function gripOfProperty(p: string): Grip | null {
  if (p === 'rotation') return 'rotation';
  if (p === 'x' || p === 'y') return 'position';
  if (p.startsWith('scale')) return 'scale';
  if (p.startsWith('shear')) return 'shear';
  return null;
}

const GRIP_OF: Record<FooterKind['kind'], Grip> = { move: 'position', rotate: 'rotation', scale: 'scale', shear: 'shear' };

/** As regras que seguram a parte que este gesto mexe, para o `heldTag`. */
export function rulesOfGesture(doc: EditorDoc, bone: string | null, what: FooterKind): string[] {
  return bone === null ? [] : rulesHolding(doc.file as { constraints?: unknown }, bone, GRIP_OF[what.kind]);
}

/** A frase de um gesto, da partida até agora. `null` sem números para ler. */
export function footerFor(
  what: FooterKind, start: GestureValues | null, now: GestureValues | null,
  pointer: { dx: number; dy: number }, rules: readonly string[] = [],
): string {
  return footerBare(what, start, now, pointer) + heldTag(rules);
}

function footerBare(
  what: FooterKind, start: GestureValues | null, now: GestureValues | null,
  pointer: { dx: number; dy: number },
): string {
  if (what.kind === 'move') {
    return start === null || now === null
      ? moveFooter(pointer.dx, pointer.dy)
      : moveFooter(now.x - start.x, now.y - start.y);
  }
  if (start === null || now === null) {
    return what.kind === 'rotate' ? 'Girar' : what.kind === 'scale' ? 'Escalar' : 'Inclinar';
  }
  if (what.kind === 'rotate') return rotateFooter(now.rotation - start.rotation, now.rotation);
  if (what.kind === 'scale') return scaleFooter(what.axis, ratio(now.scaleX, start.scaleX), ratio(now.scaleY, start.scaleY));
  if (what.axis === 'x') return shearFooter('x', now.shearX - start.shearX, now.shearX);
  if (what.axis === 'y') return shearFooter('y', now.shearY - start.shearY, now.shearY);
  return `${shearFooter('x', now.shearX - start.shearX, now.shearX)} · ${shearFooter('y', now.shearY - start.shearY, now.shearY).replace('Inclinar ', '')}`;
}

let quiet = 0;

/** O Transformar repassa o gesto calando a ferramenta de dentro: ele fala por ela. */
export function quietFooter<T>(run: () => T): T {
  quiet += 1;
  try {
    return run();
  } finally {
    quiet -= 1;
  }
}

/** O rodapé de um arrasto: partida no `start`, frase no `say`. */
export class GestureFooter {
  private bone: string | null = null;
  private startValues: GestureValues | null = null;
  private downX = 0;
  private downY = 0;
  private live = false;

  start(doc: EditorDoc, bone: string | null, x: number, y: number): void {
    this.bone = bone;
    this.startValues = gestureValuesNow(doc, bone);
    this.downX = x;
    this.downY = y;
    this.live = true;
  }

  /** A frase de agora, sem dizer. `null` fora de um gesto. */
  text(doc: EditorDoc, what: FooterKind, x: number, y: number): string | null {
    if (!this.live) return null;
    return footerFor(what, this.startValues, gestureValuesNow(doc, this.bone), { dx: x - this.downX, dy: y - this.downY },
      rulesOfGesture(doc, this.bone, what));
  }

  /** Diz a frase no rodapé — a não ser que o Transformar esteja falando por esta ferramenta. */
  say(doc: EditorDoc, what: FooterKind, x: number, y: number, suffix = ''): void {
    if (quiet > 0) return;
    const text = this.text(doc, what, x, y);
    if (text !== null) doc.notice(text + suffix);
  }

  stop(): void {
    this.live = false;
  }
}
