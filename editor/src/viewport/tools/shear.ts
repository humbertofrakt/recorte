/**
 * Ferramenta "Inclinar" (dono B) — item 21.
 *
 * Inclinar é o que faz um retângulo virar um paralelogramo: o topo anda e a
 * base fica. É o gesto do agachamento que esmaga a caixa torácica, do vento que
 * deita a copa da árvore sem arrancar o tronco, do "squash and stretch" que
 * girar e escalar juntos não conseguem fazer.
 *
 * O formato já tem os dois campos — `bone.shearX` e `bone.shearY` (§4.2), em
 * graus, e os dois já são animáveis. Faltava a mão: até aqui só dava para
 * digitar o número no painel Propriedades, e ninguém inclina de olho num campo
 * de texto.
 *
 * COMO O ARRASTO É LIDO. Andar na horizontal escreve `shearX`, andar na
 * vertical escreve `shearY` — cada eixo do movimento no seu campo, e os dois ao
 * mesmo tempo quando o arrasto é diagonal. A conta é ângulo, e não distância:
 * `atan2` do afastamento em relação ao pivô, para o valor gravado ser o mesmo
 * grau que o painel mostra.
 *
 * `Shift` encaixa de 15 em 15 graus, como em Girar. `Alt` prende num eixo só —
 * o que o arrasto começou puxando.
 *
 * O molde é o `rotate.ts`: mesmo pivô (a origem do osso, que é onde o pai o
 * colocou), mesma `writeBoneValues`, mesma chave de junção. Em Animando isso
 * grava chave sozinho, como toda ferramenta de transformação, e os nomes das
 * chaves são "Inclinação X" e "Inclinação Y" — os mesmos do painel.
 *
 * COMPENSAR (28/09/2026). Com "Não mexer nos filhos / desenhos / caixas"
 * ligado, o que pende do osso fica onde está enquanto ele inclina, como em
 * Mover, Girar e Escalar. Até aqui esta ferramenta ignorava a caixa: ela
 * estava marcada e o filho ia junto, sem aviso. A conta é a de
 * `compensate.ts`, e aqui são as mesmas duas chamadas das irmãs.
 */

import {
  registerTool,
  type EditorDoc,
  type Tool,
  type ToolEvent,
} from '../../contract.js';
import {
  HANDLE,
  bonePivot,
  newMergeKey,
  readBoneNow,
  strokeLine,
  writeBoneValues,
} from './select.js';
import { GestureFooter } from './gesture-footer.js';
import { applyCompensation, planCompensation, type CompensationPlan } from './compensate.js';
import { snapAngle } from './rotate.js';
import { draggedBones } from './translate.js';

/** Tamanho das alças de inclinar, em pixels de tela. */
const ARM_PIXELS = 60;

/**
 * Quanto o ponteiro tem de andar, em pixels de tela, para o `Alt` decidir o
 * eixo. Abaixo disso não há direção: é o tremor da mão ao apertar o botão.
 */
const AXIS_PIXELS = 6;

interface DragBone {
  name: string;
  startShearX: number;
  startShearY: number;
}

interface Drag {
  bones: DragBone[];
  pivotX: number;
  pivotY: number;
  startX: number;
  startY: number;
  mergeKey: string;
  /** O que tem de ficar parado enquanto o osso inclina — ver `compensate.ts`. */
  plan: CompensationPlan;
  /** Com `Alt`, o eixo que o arrasto escolheu. `null` até ele se decidir. */
  axis: 'x' | 'y' | null;
  /**
   * O eixo que o **quadradinho** mandou, quando o arrasto vem do Transformar
   * (lote de 13/09/2026, item 2.3). Aqui não há adivinhação: a alça já diz
   * qual dos dois campos se escreve, e o arrasto não muda de ideia no meio.
   */
  forced: 'x' | 'y' | null;
  /**
   * O ângulo do osso no mundo, em radianos — rodada 46, lote 3 (doc `66`,
   * §2.1). Com o eixo mandado pelo quadradinho, o arrasto é medido nos eixos
   * da CAIXA, que gira com o osso: antes era no mundo, e num osso em pé o
   * "puxar ao longo do lado" dava 0° e o "puxar para fora" é que inclinava.
   */
  boxAngle: number;
}

/**
 * O ângulo, em graus, que o afastamento horizontal faz com a vertical.
 *
 * É a mesma conta que o desenhador usa para inclinar: o topo anda `dx` para o
 * lado enquanto sobe `dy`, e o quanto isso inclina é o arco-tangente dos dois.
 * Devolve zero quando não há altura nenhuma — sem altura não há inclinação, só
 * um ponto andando de lado.
 */
export function rotated(x: number, y: number, angle: number): [number, number] {
  if (angle === 0) return [x, y];
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return [c * x - s * y, s * x + c * y];
}

/** O ângulo do eixo X de um osso no mundo, em radianos. `0` sem osso. */
export function boneWorldAngle(bone: { a: number; c: number } | null): number {
  return bone === null ? 0 : Math.atan2(bone.c, bone.a);
}

export function shearAngle(dx: number, dy: number): number {
  if (Math.abs(dy) < 1e-9) return 0;
  return (Math.atan2(dx, Math.abs(dy)) * 180) / Math.PI;
}

/**
 * O eixo que o arrasto escolheu, com `Alt`. `null` enquanto ele não andou o
 * bastante para haver direção.
 */
export function lockedAxis(
  dx: number, dy: number, scale: number, limit = AXIS_PIXELS,
): 'x' | 'y' | null {
  const screenX = Math.abs(dx) * scale;
  const screenY = Math.abs(dy) * scale;
  if (Math.max(screenX, screenY) < limit) return null;
  return screenX >= screenY ? 'x' : 'y';
}

class ShearTool implements Tool {
  readonly id = 'shear';
  readonly label = 'Inclinar';
  readonly shortcut = 'z';

  private drag: Drag | null = null;
  /**
   * O eixo que o Transformar manda, pela alça que o dedo pegou — item 2.3.
   * `null` é a ferramenta sozinha na barra, onde quem decide é o arrasto.
   * Volta a `null` ao soltar, como a trava de eixo do Escalar.
   */
  private handleAxis: 'x' | 'y' | null = null;

  setAxisLock(axis: 'x' | 'y' | null): void {
    this.handleAxis = axis;
  }

  onExit(): void {
    this.drag = null;
    this.handleAxis = null;
  }

  /** O número no rodapé enquanto arrasta — rodada 46, lote 1 (`gesture-footer.ts`). */
  private readonly footer = new GestureFooter();

  onDown(doc: EditorDoc, e: ToolEvent): void {
    this.downInner(doc, e);
    if (e.button === 0) this.footer.start(doc, draggedBones(doc)[0] ?? null, e.x, e.y);
  }

  private downInner(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    const names = draggedBones(doc);
    // Sem osso escolhido não há o que inclinar: um anexo não tem inclinação
    // própria no formato, e inventar uma aqui criaria um campo que nenhum
    // leitor entende.
    if (names.length === 0) return;

    const pivot = bonePivot(skeleton, names[0]);
    this.drag = {
      bones: names.map((name) => ({
        name,
        startShearX: readBoneNow(doc, name, 'shearX'),
        startShearY: readBoneNow(doc, name, 'shearY'),
      })),
      pivotX: pivot.x,
      pivotY: pivot.y,
      startX: e.x,
      startY: e.y,
      mergeKey: newMergeKey('shear'),
      plan: planCompensation(doc, names),
      axis: null,
      forced: this.handleAxis,
      boxAngle: boneWorldAngle(skeleton.findBone(names[0])),
    };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    this.moveInner(doc, e);
    const d = this.drag;
    const axis = d === null ? null : (d.forced ?? (e.alt ? d.axis : null));
    this.footer.say(doc, { kind: 'shear', axis }, e.x, e.y);
  }

  private moveInner(doc: EditorDoc, e: ToolEvent): void {
    const drag = this.drag;
    if (drag === null) return;

    // Rodada 46, lote 3: pelo quadradinho (eixo mandado), tudo nos eixos da caixa.
    const turnBy = drag.forced === null ? 0 : -drag.boxAngle;
    const [dx, dy] = rotated(e.x - drag.startX, e.y - drag.startY, turnBy);
    const [offX, offY] = rotated(drag.startX - drag.pivotX, drag.startY - drag.pivotY, turnBy);
    // A altura de referência é a distância do PIVÔ ao ponto em que o arrasto
    // começou: inclinar puxando perto do osso tem de pesar mais do que puxando
    // longe dele, que é como a mão espera que uma alavanca se comporte.
    const armX = offY;
    const armY = offX;

    if (e.alt && drag.axis === null) drag.axis = lockedAxis(dx, dy, 1, AXIS_PIXELS);
    const axis = drag.forced ?? (e.alt ? drag.axis : null);

    const turnX = axis === 'y' ? 0 : shearAngle(dx, armX);
    const turnY = axis === 'x' ? 0 : shearAngle(dy, armY);

    const values = drag.bones.flatMap((bone) => [
      {
        bone: bone.name,
        key: 'shearX' as const,
        value: snapAngle(bone.startShearX + turnX, e.shift),
      },
      {
        bone: bone.name,
        key: 'shearY' as const,
        value: snapAngle(bone.startShearY + turnY, e.shift),
      },
    ]);
    writeBoneValues(doc, 'Inclinar osso', drag.mergeKey, values);
    applyCompensation(doc, drag.plan, drag.mergeKey);
  }

  onUp(): void {
    this.drag = null;
  }

  /**
   * As alças: um braço para cima e um para o lado, saindo da origem do osso.
   *
   * Elas dizem para onde puxar. Não há alça "livre" no meio, como em Mover:
   * inclinar nos dois eixos ao mesmo tempo é o arrasto diagonal, e uma terceira
   * alça só faria o desenho ficar mais cheio sem dizer nada de novo.
   */
  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const skeleton = doc.skeleton;
    if (skeleton === null) return;
    const arm = ARM_PIXELS / scale;
    for (const name of doc.selection.bones) {
      const pivot = bonePivot(skeleton, name);
      // Para cima: o braço do `shearX`, que é o que anda de lado quando sobe.
      strokeLine(ctx, scale, HANDLE.axisY, 3, pivot.x, pivot.y, pivot.x, pivot.y + arm);
      strokeLine(
        ctx, scale, HANDLE.axisY, 2,
        pivot.x - arm * 0.3, pivot.y + arm, pivot.x + arm * 0.3, pivot.y + arm,
      );
      // Para o lado: o braço do `shearY`.
      strokeLine(ctx, scale, HANDLE.axisX, 3, pivot.x, pivot.y, pivot.x + arm, pivot.y);
      strokeLine(
        ctx, scale, HANDLE.axisX, 2,
        pivot.x + arm, pivot.y - arm * 0.3, pivot.x + arm, pivot.y + arm * 0.3,
      );
    }
  }
}

export const shearTool: Tool & { setAxisLock(axis: 'x' | 'y' | null): void } = new ShearTool();
registerTool(shearTool);
