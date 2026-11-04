/**
 * **A forma do emissor na cena** — rodada 16, lote 3 (05/10/2026).
 *
 * Escolhido um emissor, a cena desenha DE ONDE as partículas nascem: o círculo
 * (com o anel de dentro e a fatia do arco), o retângulo, a linha, o osso, a
 * malha. E põe **alças** nos números que se arrastam: o raio, a espessura do
 * anel, o fim do arco, o canto do retângulo, as duas pontas da linha. Arrastar
 * uma alça grava aquele número, e nenhum outro (`SetProperty` no anexo; o
 * arrasto inteiro é um passo só no desfazer, pela fusão do `SetProperty`).
 *
 * **Nada aqui desenha nem lê o mouse.** Este módulo dá os traços e as alças em
 * coordenadas do MUNDO (Y para cima), e a conta de cada alça; o
 * `viewport-draw.ts` desenha e o `viewport.ts` arrasta. As contas são as da
 * §9.4 da extensão, no referencial do emissor (`M_emissor`, §9.10): a mesma
 * matriz com que o runtime põe as partículas, para o contorno cair onde elas
 * nascem.
 */

import {
  emitterMatrix, invertMatrix, isParticleAttachment, type Matrix2x3,
} from '../../../runtime/src/index.js';
import { corpoDe, type Command, type EditorDoc } from '../contract.js';
import { findAttachment } from '../doc/attachments.js';
import { pointerOf } from '../panels/json-pointer.js';
import { SetProperty } from '../panels/properties-model.js';

/** O que este módulo precisa saber do emissor (o anexo do runtime tem tudo isso). */
export interface ShapeNumbers {
  readonly shape: string;
  readonly radius: number;
  readonly radiusThickness: number;
  readonly arc: number;
  readonly size: ArrayLike<number>;
  readonly edge: ArrayLike<number>;
}

/** Um traço: pontos em sequência, no mundo. */
export interface ShapeLine {
  readonly points: number[];
  readonly closed: boolean;
  /** Tracejado: o que é limite de dentro (o anel) ou só referência (osso, malha). */
  readonly dashed: boolean;
}

export type ShapeHandleId = 'radius' | 'thickness' | 'arc' | 'corner' | 'edge0' | 'edge1';

export interface ShapeHandle {
  readonly id: ShapeHandleId;
  readonly x: number;
  readonly y: number;
  /** O nome do que a alça muda, para a dica e o rodapé. Nunca a alça sozinha. */
  readonly label: string;
}

export interface ShapeGuide {
  readonly lines: ShapeLine[];
  readonly handles: ShapeHandle[];
}

/** Quantos pedaços tem um círculo inteiro. 64 dá um círculo liso em qualquer zoom de trabalho. */
const SEGMENTOS = 64;

function aplicar(m: Matrix2x3, x: number, y: number): [number, number] {
  return [m.a * x + m.b * y + m.worldX, m.c * x + m.d * y + m.worldY];
}

/** Um arco de raio `r`, de 0° a `graus`, no referencial do emissor, levado ao mundo. */
function arcoNoMundo(m: Matrix2x3, r: number, graus: number): number[] {
  const n = Math.max(2, Math.ceil((SEGMENTOS * Math.min(Math.abs(graus), 360)) / 360));
  const out: number[] = [];
  for (let i = 0; i <= n; i++) {
    const a = ((graus * i) / n) * (Math.PI / 180);
    out.push(...aplicar(m, r * Math.cos(a), r * Math.sin(a)));
  }
  return out;
}

/**
 * **O contorno e as alças da forma.** `m` é a matriz do emissor agora
 * (`M_emissor`); `boneLength` é o comprimento do osso, para a forma osso.
 * A malha não passa por aqui: o contorno dela é a própria malha, desenhada
 * pelo `viewport-draw.ts` com os vértices do runtime.
 */
export function emitterShapeGuide(n: ShapeNumbers, m: Matrix2x3, boneLength: number, estrela = 0): ShapeGuide {
  const lines: ShapeLine[] = [];
  const handles: ShapeHandle[] = [];
  // **A alça nunca fica em cima da estrela.** `estrela` é o raio da marca do
  // emissor, no mundo: a estrela é o lugar de clicar para mover, e uma alça de
  // raio zero em cima dela roubaria o clique. O raio 0 e o retângulo 0×0
  // levam a alça para a borda da estrela; o traço continua no lugar certo.
  const escala = Math.max(1e-6, Math.hypot(m.a, m.c));
  const fora = (estrela * 1.6) / escala;
  switch (n.shape) {
    case 'circle': {
      const R = Math.max(0, n.radius);
      const arco = Math.max(0, Math.min(360, n.arc));
      const inteiro = arco >= 360;
      // §9.4: φ = u4 · arc, a partir de +X do emissor; r de R·(1−T) até R.
      lines.push({ points: arcoNoMundo(m, R, arco), closed: inteiro, dashed: false });
      const dentro = R * (1 - Math.max(0, Math.min(1, n.radiusThickness)));
      if (dentro > 0) lines.push({ points: arcoNoMundo(m, dentro, arco), closed: inteiro, dashed: true });
      if (!inteiro) {
        // A fatia: os dois raios que fecham o arco.
        for (const graus of [0, arco]) {
          const a = graus * (Math.PI / 180);
          lines.push({
            points: [...aplicar(m, dentro * Math.cos(a), dentro * Math.sin(a)), ...aplicar(m, R * Math.cos(a), R * Math.sin(a))],
            closed: false, dashed: false,
          });
        }
      }
      // O raio no meio do arco; o fim do arco na ponta; o anel no meio, por dentro.
      const meio = (arco / 2) * (Math.PI / 180);
      const Ra = Math.max(R, fora);
      const [rx, ry] = aplicar(m, Ra * Math.cos(meio), Ra * Math.sin(meio));
      handles.push({ id: 'radius', x: rx, y: ry, label: 'Raio' });
      // Conserto 4 da conferência (05/10): a alça do trecho só existe no ARCO.
      // No círculo inteiro ela ficava do outro lado da estrela, e puxava-se o
      // trecho achando que era o raio.
      if (!inteiro) {
        const fim = arco * (Math.PI / 180);
        const [ax, ay] = aplicar(m, Ra * Math.cos(fim), Ra * Math.sin(fim));
        handles.push({ id: 'arc', x: ax, y: ay, label: 'Trecho' });
      }
      if (dentro > fora) {
        const [tx, ty] = aplicar(m, dentro * Math.cos(meio), dentro * Math.sin(meio));
        handles.push({ id: 'thickness', x: tx, y: ty, label: 'Espessura' });
      }
      break;
    }
    case 'rectangle': {
      // §9.4: p0 = ((u3 − ½)·w, (u4 − ½)·h) — centrado na origem do emissor.
      const w = Math.max(0, n.size[0] ?? 0) / 2;
      const h = Math.max(0, n.size[1] ?? 0) / 2;
      lines.push({ points: [...aplicar(m, -w, -h), ...aplicar(m, w, -h), ...aplicar(m, w, h), ...aplicar(m, -w, h)], closed: true, dashed: false });
      const [cx, cy] = aplicar(m, Math.max(w, fora), Math.max(h, fora));
      handles.push({ id: 'corner', x: cx, y: cy, label: 'Retângulo' });
      break;
    }
    case 'edge': {
      const e = n.edge;
      const a = aplicar(m, e[0] ?? 0, e[1] ?? 0);
      const b = aplicar(m, e[2] ?? 0, e[3] ?? 0);
      lines.push({ points: [...a, ...b], closed: false, dashed: false });
      // A ponta em cima da estrela fica sem alça: digita-se no campo.
      const longe = (p: [number, number]): boolean => Math.hypot(p[0] - m.worldX, p[1] - m.worldY) > estrela * 1.2;
      if (longe(a)) handles.push({ id: 'edge0', x: a[0], y: a[1], label: 'Início da linha' });
      if (longe(b)) handles.push({ id: 'edge1', x: b[0], y: b[1], label: 'Fim da linha' });
      break;
    }
    case 'bone': {
      // §9.4 e §9.10: o segmento (0,0) → (comprimento, 0) no referencial do
      // emissor. Sem alça: o comprimento é o do osso, e se muda no osso.
      lines.push({ points: [...aplicar(m, 0, 0), ...aplicar(m, boneLength, 0)], closed: false, dashed: true });
      break;
    }
    case 'point': {
      // Rodada 38, lote 4: o ponto não desenhava nada, e as partículas nasciam
      // escondidas atrás da estrela. Um anel tracejado, logo fora dela, diz
      // "é aqui". Sem alça: o ponto não tem número para puxar.
      const r = Math.max(fora, 4 / escala);
      lines.push({ points: arcoNoMundo(m, r, 360), closed: true, dashed: true });
      break;
    }
    default:
      break;
  }
  return { lines, handles };
}

/**
 * **O que o rodapé diz enquanto se arrasta** — conserto 4: *"Raio: 40"*. O
 * número com vírgula, como nos campos.
 */
export function shapeHandleSays(handle: ShapeHandle, value: unknown): string {
  const n = (v: unknown): string => String(Math.round(Number(v) * 100) / 100).replace('.', ',');
  if (Array.isArray(value)) {
    if (handle.id === 'corner') return `${handle.label}: ${n(value[0])} × ${n(value[1])}`;
    const i = handle.id === 'edge0' ? 0 : 2;
    return `${handle.label}: ${n(value[i])} · ${n(value[i + 1])}`;
  }
  return handle.id === 'arc' ? `${handle.label}: ${n(value)}°` : `${handle.label}: ${n(value)}`;
}

/** Arredonda o que a alça grava: duas casas, que é o que se lê num campo. */
function casas(v: number): number {
  return Math.round(v * 100) / 100;
}

/**
 * **O que uma alça grava**, dado o ponto do mouse já no referencial do emissor
 * (`lx`, `ly`). Devolve o nome do campo do anexo e o valor inteiro — a faixa e
 * a linha se gravam inteiras, nunca um componente solto (ver `rangeFieldCommand`).
 */
export function shapeHandleWrite(
  id: ShapeHandleId, lx: number, ly: number, n: ShapeNumbers,
): { field: string; value: unknown } {
  switch (id) {
    case 'radius':
      return { field: 'radius', value: casas(Math.hypot(lx, ly)) };
    case 'thickness': {
      // O círculo de dentro tem raio R·(1−T): T = 1 − dentro/R.
      const R = n.radius > 0 ? n.radius : 1;
      const t = 1 - Math.hypot(lx, ly) / R;
      return { field: 'radiusThickness', value: casas(Math.max(0, Math.min(1, t))) };
    }
    case 'arc': {
      // O ângulo de +X até o mouse, de 0 a 360. Um arco de zero grau não
      // emitiria nada sem a tela dizer por quê: o menor é 1°.
      let graus = Math.atan2(ly, lx) * (180 / Math.PI);
      if (graus <= 0) graus += 360;
      return { field: 'arc', value: casas(Math.max(1, Math.min(360, graus))) };
    }
    case 'corner':
      return { field: 'size', value: [casas(Math.abs(lx) * 2), casas(Math.abs(ly) * 2)] };
    case 'edge0':
    case 'edge1': {
      const e = [n.edge[0] ?? 0, n.edge[1] ?? 0, n.edge[2] ?? 0, n.edge[3] ?? 0];
      const i = id === 'edge0' ? 0 : 2;
      e[i] = casas(lx);
      e[i + 1] = casas(ly);
      return { field: 'edge', value: e };
    }
  }
}

/** A alça debaixo do mouse, com folga de `raio` (no mundo). A de cima ganha: a última desenhada. */
export function shapeHandleAt(guide: ShapeGuide, x: number, y: number, raio: number): ShapeHandle | null {
  for (let i = guide.handles.length - 1; i >= 0; i--) {
    const h = guide.handles[i]!;
    if (Math.hypot(h.x - x, h.y - y) <= raio) return h;
  }
  return null;
}

// ---------------------------------------------------------------------------
// O emissor escolhido, na cena de agora
// ---------------------------------------------------------------------------

/** Um emissor escolhido e à vista, com a forma dele pronta para desenhar e arrastar. */
export interface SelectedShape {
  readonly slot: string;
  readonly name: string;
  readonly numbers: ShapeNumbers;
  /** `M_emissor` agora. */
  readonly matrix: Matrix2x3;
  readonly guide: ShapeGuide;
  /** A malha de onde ele nasce (forma malha), para a cena tracejar. */
  readonly mesh: string | null;
  /** O caminho de onde ele nasce (forma caminho, `"<slot>/<anexo>"`), para a cena destacar. */
  readonly curve: string | null;
}

/**
 * **De que lado da alça o nome dela se escreve** — rodada 17 (sobra da
 * rodada 32): para FORA da forma, longe do centro do emissor.
 *
 * O nome ia sempre para a direita da alça. A alça do Raio de um círculo fica
 * à ESQUERDA do centro, e o rótulo arrastado (*"Raio: 45"*) passava por cima
 * da estrela do emissor (*"Rai ✳ 5"*). Agora a alça à esquerda do centro
 * escreve para a esquerda; as outras, para a direita, como antes.
 */
export function shapeLabelSide(handleX: number, centerX: number): 'left' | 'right' {
  return handleX < centerX - 1e-6 ? 'left' : 'right';
}

/**
 * **Os emissores escolhidos que a cena mostra.** Só o que está escolhido ganha
 * contorno e alça: com dez emissores no boneco, dez círculos ao mesmo tempo
 * seriam ruído, e a alça de um taparia a do outro.
 */
export function selectedEmitterShapes(doc: EditorDoc, estrela = 0): SelectedShape[] {
  const skeleton = doc.skeleton;
  if (skeleton === null) return [];
  const out: SelectedShape[] = [];
  for (const pick of doc.selection.attachments) {
    const slot = skeleton.findSlot(pick.slot);
    const att = slot?.attachment ?? null;
    if (slot === null || slot === undefined || att === null || att.name !== pick.attachment) continue;
    if (!isParticleAttachment(att) || !slot.visible) continue;
    const matrix = emitterMatrix(att, slot.boneMatrix, { a: 1, b: 0, c: 0, d: 1, worldX: 0, worldY: 0 });
    const numbers: ShapeNumbers = {
      shape: att.shape, radius: att.radius, radiusThickness: att.radiusThickness, arc: att.arc, size: att.size, edge: att.edge,
    };
    out.push({
      slot: pick.slot, name: pick.attachment, numbers, matrix,
      guide: emitterShapeGuide(numbers, matrix, slot.bone.data.length ?? 0, estrela),
      mesh: att.shape === 'mesh' ? att.mesh : null,
      curve: att.shape === 'path' ? att.curve : null,
    });
  }
  return out;
}

/**
 * **O comando de um passo do arrasto de uma alça.** O mouse (`x`, `y`, mundo)
 * volta ao referencial do emissor pela inversa de `M_emissor`, e a alça diz o
 * campo e o valor. É um `SetProperty` no anexo da pele dele: o arrasto inteiro
 * vira um passo só no desfazer, pela fusão de quem grava o mesmo ponteiro.
 * `null` quando o anexo não está no arquivo (não se inventa onde gravar).
 */
export function shapeHandleCommand(
  doc: EditorDoc, shape: SelectedShape, handle: ShapeHandle, x: number, y: number,
): Command | null {
  const file = corpoDe(doc).file;
  const found = findAttachment(file, shape.slot, shape.name);
  if (!found) return null;
  const inv = invertMatrix(shape.matrix);
  const lx = inv.a * x + inv.b * y + inv.worldX;
  const ly = inv.c * x + inv.d * y + inv.worldY;
  const { field, value } = shapeHandleWrite(handle.id, lx, ly, shape.numbers);
  // O nome do passo É o que o rodapé diz ("Raio: 40"): a barra mostra o nome do
  // último comando, e um aviso dado antes dele seria apagado na hora.
  return new SetProperty(pointerOf('skins', found.skin, 'attachments', shape.slot, shape.name, field), value, shapeHandleSays(handle, value), 'structure');
}

/**
 * **O caminho no mundo, como linha** — rodada 16, lote 8. `points` são os `3K`
 * pontos do anexo `path` já no mundo (para cada âncora: alça de chegada,
 * âncora, alça de saída, §7.8 da spec); cada curva vira 10 retas em
 * `t = 0, 0,1 … 1`, a mesma régua com que o leitor mede onde nasce cada
 * partícula (§9.4.2). Fechado, a última âncora volta à primeira.
 */
export function pathPolyline(points: ArrayLike<number>, closed: boolean): number[] {
  const k = Math.floor(points.length / 6);
  const out: number[] = [];
  const curvas = closed ? k : k - 1;
  const p = (i: number, j: number): [number, number] => [points[(i % k) * 6 + j * 2]!, points[(i % k) * 6 + j * 2 + 1]!];
  for (let c = 0; c < curvas; c++) {
    const [ax, ay] = p(c, 1);
    const [h1x, h1y] = p(c, 2);
    const [h2x, h2y] = p(c + 1, 0);
    const [bx, by] = p(c + 1, 1);
    for (let s = c === 0 ? 0 : 1; s <= 10; s++) {
      const t = s / 10;
      const u = 1 - t;
      out.push(
        u * u * u * ax + 3 * u * u * t * h1x + 3 * u * t * t * h2x + t * t * t * bx,
        u * u * u * ay + 3 * u * u * t * h1y + 3 * u * t * t * h2y + t * t * t * by,
      );
    }
  }
  return out;
}
