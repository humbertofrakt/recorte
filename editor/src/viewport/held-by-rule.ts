/**
 * O osso que uma regra segura — rodada final, chat F, defeitos F3, L10 e L11
 * (29/09/2026).
 *
 * **A forma do erro: mexi e a regra desfez, calada.** No herói, girar a cabeça
 * grava −53,8° no arquivo e a tela não muda: o `look_driver` manda na rotação
 * dela. O braço, o mesmo, com o `ik_arm`. A ferramenta fazia a parte dela, o
 * runtime fazia a dele, e ninguém dizia à pessoa por que o boneco não se
 * mexeu. Regra 21: onde o programa não pode, ele avisa.
 *
 * **Não se adivinha quem segura: mede-se.** Depois do gesto, o valor que o
 * arquivo pede (`rotation`, `x`…) é comparado com o que a pose APLICOU
 * (`arotation`, `ax`…). Se não bateu, alguma regra mexeu; as regras que citam
 * o osso são as suspeitas, e são elas que o recado nomeia. Uma regra que cita
 * o osso e não mexeu nada (mistura 0, desligada) não entra no recado.
 *
 * Módulo puro: lê o `BoneFile` e números. Nada de DOM, nada de `EditorDoc`.
 */

import type { BoneFile } from '../../../runtime/src/index.js';

/** Qual parte do osso o gesto mexeu. */
export type Grip = 'rotation' | 'position' | 'scale' | 'shear';

/** O gesto, pelo nome que o comando dá ao desfazer. `null`: não é gesto de osso. */
export function gripOfLabel(label: string): Grip | null {
  const l = label.toLowerCase();
  if (!l.includes('osso')) return null;
  if (l.startsWith('girar')) return 'rotation';
  if (l.startsWith('mover') || l.startsWith('andar')) return 'position';
  if (l.startsWith('escalar')) return 'scale';
  if (l.startsWith('inclinar')) return 'shear';
  return null;
}

/** Os números de um osso vivo: o que foi pedido e o que a pose aplicou. */
export interface BoneNumbers {
  x: number; y: number; rotation: number; scaleX: number; scaleY: number; shearX: number; shearY: number;
  ax: number; ay: number; arotation: number; ascaleX: number; ascaleY: number; ashearX: number; ashearY: number;
}

/** Diferença de ângulo em graus, pelo caminho curto: 359° e 1° estão a 2°. */
function angleGap(a: number, b: number): number {
  const d = ((a - b) % 360 + 540) % 360 - 180;
  return Math.abs(d);
}

/**
 * `true` quando a pose aplicou outra coisa que não o pedido, na parte que o
 * gesto mexeu. A folga é de meio grau, meio pixel, meio por cento: menos que
 * isso a pessoa não vê.
 */
export function drifted(bone: BoneNumbers, grip: Grip): boolean {
  switch (grip) {
    case 'rotation': return angleGap(bone.rotation, bone.arotation) > 0.5;
    case 'position': return Math.hypot(bone.x - bone.ax, bone.y - bone.ay) > 0.5;
    case 'scale': return Math.abs(bone.scaleX - bone.ascaleX) > 0.005 || Math.abs(bone.scaleY - bone.ascaleY) > 0.005;
    case 'shear': return angleGap(bone.shearX, bone.ashearX) > 0.5 || angleGap(bone.shearY, bone.ashearY) > 0.5;
  }
}

/**
 * As regras do arquivo que citam este osso: as que o levam (`bones`, `bone`)
 * e as que o têm como alvo de uma saída (`targets` de um `driver`). O alvo de
 * um IK (quem a mão persegue) NÃO entra: ele não é segurado, ele puxa.
 */
export function rulesOn(file: BoneFile, bone: string): string[] {
  const list = (file as { constraints?: unknown }).constraints;
  if (!Array.isArray(list)) return [];
  const names: string[] = [];
  for (const raw of list) {
    if (raw === null || typeof raw !== 'object') continue;
    const c = raw as { name?: unknown; bones?: unknown; bone?: unknown; targets?: unknown };
    const name = typeof c.name === 'string' ? c.name : null;
    if (name === null) continue;
    const leva = (Array.isArray(c.bones) && c.bones.includes(bone)) || c.bone === bone;
    const alvo = Array.isArray(c.targets) && c.targets.some((t) => t !== null && typeof t === 'object'
      && (t as { type?: unknown }).type === 'bone' && (t as { target?: unknown }).target === bone);
    if (leva || alvo) names.push(name);
  }
  return names;
}

const PARTE: Record<Grip, string> = {
  rotation: 'não girou', position: 'não andou', scale: 'não mudou de tamanho', shear: 'não inclinou',
};

/**
 * O recado do rodapé. `onBase`: a base aberta (L11) — o que se mexe ali vale em
 * todas as animações, e a pessoa que só queria testar precisa ouvir isso.
 */
/**
 * A porta, depois do recado — rodada 46, lote 5 (doc `66`, T2). A cena traz a
 * aba Regras para a frente, e o olho da regra fica a um clique.
 */
export const HELD_DOOR = ' (a aba Regras veio para a frente: o olho fica na linha da regra)';

export function heldNotice(bone: string, rules: readonly string[], grip: Grip, onBase: boolean): string {
  // Frases curtas, e sem ponto no fim: a casca acrescenta ". Arquivo não salvo."
  const quem = rules.length === 1 ? `a regra ${rules[0]} manda nele` : `as regras ${rules.join(', ')} mandam nele`;
  const olho = `Desligue o olho ${rules.length === 1 ? 'dela' : 'delas'} na aba Regras`;
  const base = onBase ? '. Ficou na base: Ctrl+Z desfaz' : '';
  return `${bone} ${PARTE[grip]}: ${quem}. ${olho}${base}`;
}
