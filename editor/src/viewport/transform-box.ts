/**
 * A caixa do Transformar (dono B) — lote 47. Item 1 do plano "caixa, ossos e
 * malha" (13/09/2026): a caixa acompanha o objeto, a bolinha de girar mora
 * perto da ponta do osso, e o osso só mostra três alças.
 *
 * É a caixa do Spriter: o que está escolhido ganha um contorno tracejado, com
 * quadradinhos — oito num desenho, três (`n`, `s`, `e`) num osso — o pivô e
 * uma haste que sai dele com uma bolinha na ponta.
 *
 * | Onde o ponteiro desce  | O gesto                     |
 * |:-----------------------|:----------------------------|
 * | na bolinha da haste    | `rotate`                    |
 * | num quadradinho da TELA| `{ scale: 'n' … 'nw' }`     |
 * | dentro da caixa        | `move`                      |
 * | fora                   | `outside`                   |
 *
 * A caixa é medida nos MESMOS eixos em que o Escalar mede o ponteiro: os
 * eixos do primeiro osso escolhido, conforme a lista Eixos (Local · Pai ·
 * Mundo); com um desenho só, os eixos DELE — ângulo do osso mais a rotação
 * do anexo —, com a origem na âncora. A caixa gira junto com o que ela
 * envolve, e não fica mais reta enquanto o desenho vira (item 1.1).
 * Assim "canto" quer dizer os dois eixos do Escalar e "meio de lado", um só.
 *
 * Os nomes dos quadradinhos seguem o mundo do `.bone`, com y para CIMA
 * (§3.3): `n` é o lado de cima da caixa, `ne` o canto de cima à direita.
 * `TransformBox.handles` sempre tem os oito, mas só `visibleHandles` está na
 * tela — um osso escolhido não mostra canto nem o `w` (item 1.3, ajustado em
 * 13/09/2026): canto não quer dizer nada numa linha, e `w` é sempre o mesmo
 * ponto que o pivô (veja `BONE_SCALE_HANDLES`).
 *
 * `boxFromCorners` e `transformHit` são puros: um teste monta uma caixa com
 * números e confere o toque sem esqueleto nenhum.
 */

import type { Matrix2x3 } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { attachmentWorldPoints, boneTip, pointInTriangle } from './picking.js';
import { bonePivot, selectedBones, worldPointToFrame } from './tools/select.js';
import { getHandleSpace, spaceFrame } from './tools/space.js';
import { pickedAttachment } from './tools/attachment-edit.js';
import { drawingsCenter, pickedDrawings } from './tools/drawing-group.js';

export interface Point {
  x: number;
  y: number;
}

/** Os oito quadradinhos, com os nomes do mundo (y para cima). */
export type ScaleHandle = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw';

export const SCALE_HANDLES: readonly ScaleHandle[] = Object.freeze(['sw', 's', 'se', 'e', 'ne', 'n', 'nw', 'w']);

export interface TransformBox {
  /** Os quatro cantos, em mundo, no sentido dos eixos da caixa: sw, se, ne, nw. */
  corners: readonly [Point, Point, Point, Point];
  /** Onde cada quadradinho está, em mundo — os oito, mesmo quando nem todos aparecem. */
  handles: Readonly<Record<ScaleHandle, Point>>;
  /**
   * Quais quadradinhos estão NA TELA. Com um osso escolhido, só três (item
   * 1.3, 13/09/2026): `w`, `e`, `n`. Com desenho, os oito de sempre. Quem
   * desenha a caixa e quem faz `transformHit` seguem esta lista, não `handles`.
   */
  visibleHandles: readonly ScaleHandle[];
  /** O ponto em volta do qual Girar gira e de onde Escalar mede. */
  pivot: Point;
  /** A bolinha da ponta da haste. */
  knob: Point;
}

export type TransformHit = 'move' | 'rotate' | { scale: ScaleHandle } | 'outside';

/** O comprimento da haste, em pixels de tela — só para desenho e pivô soltos. */
export const KNOB_PIXELS = 60;
/**
 * Meia espessura da caixa de um osso, em pixels de tela: um osso é uma linha.
 * Rodada 46, lote 3 (doc `66`, §2.1): era 10, e os três quadradinhos e a
 * bolinha cabiam em ~20 px — a mira errava e o clique virava retângulo.
 */
export const BONE_BOX_PIXELS = 16;
/**
 * A haste do osso vai a 3/4 do comprimento dele, perto da ponta — a metade
 * de cima da metade de cima. Pedido do Humberto, 13/09/2026: longe do pivô
 * vermelho, para o giro ganhar alavanca e os dois pontos não se confundirem.
 */
export const KNOB_BONE_FRACTION = 0.75;
/** Mínimo da haste do osso, em pixels de tela: o osso curto não perde a bolinha. */
export const KNOB_MIN_PIXELS = 30;

/**
 * Com um osso escolhido: `n` e `s` (a espessura, um de cada lado) e `e` (o
 * comprimento, puxando pela ponta — `e` é sempre o ponto `(comprimento, 0)`
 * da caixa, a ponta do osso na linha de centro).
 *
 * `w` fica de fora, e não é só o canto que "não quer dizer nada numa linha"
 * (esses já saíam): `w` é sempre o ponto `(0, 0)` da caixa — a BASE do osso
 * na linha de centro —, ou seja, **é sempre o mesmo ponto que o pivô**, não
 * importa a espessura. Um quadradinho ali ficaria sempre em cima do ponto
 * vermelho. Achado em 13/09/2026, com uma conta: `box.handles.w` e
 * `box.pivot` saem iguais para qualquer osso.
 */
export const BONE_SCALE_HANDLES: readonly ScaleHandle[] = Object.freeze(['n', 's', 'e']);

function mid(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * A caixa inteira a partir dos quatro cantos, do pivô e da ponta da haste.
 * `visibleHandles` nasce com os oito; passe `BONE_SCALE_HANDLES` para a
 * caixa de um osso.
 */
export function boxFromCorners(
  sw: Point, se: Point, ne: Point, nw: Point, pivot: Point, knob: Point,
  visibleHandles: readonly ScaleHandle[] = SCALE_HANDLES,
): TransformBox {
  return {
    corners: [sw, se, ne, nw],
    handles: { sw, se, ne, nw, s: mid(sw, se), e: mid(se, ne), n: mid(ne, nw), w: mid(nw, sw) },
    visibleHandles,
    pivot,
    knob,
  };
}

/**
 * **O que o ponteiro pega.** `tolerance` é a meia alça, em unidades de mundo.
 * A bolinha ganha dos quadradinhos, e os dois ganham do miolo: a haste mora
 * dentro da caixa, e um quadradinho fica no contorno.
 */
export function transformHit(point: Point, box: TransformBox, tolerance: number): TransformHit {
  if (Math.hypot(point.x - box.knob.x, point.y - box.knob.y) <= tolerance) return 'rotate';
  let best: ScaleHandle | null = null;
  let bestDistance = Infinity;
  for (const name of box.visibleHandles) {
    const h = box.handles[name];
    const d = Math.max(Math.abs(point.x - h.x), Math.abs(point.y - h.y));
    if (d <= tolerance && d < bestDistance) {
      best = name;
      bestDistance = d;
    }
  }
  if (best !== null) return { scale: best };
  const [a, b, c, d] = box.corners;
  if (pointInTriangle(point.x, point.y, a.x, a.y, b.x, b.y, c.x, c.y)
    || pointInTriangle(point.x, point.y, a.x, a.y, c.x, c.y, d.x, d.y)) return 'move';
  return 'outside';
}

/**
 * O cursor de um quadradinho, pela direção em que ele está na TELA (a caixa
 * pode estar girada): `ew`, `ns`, `nesw` ou `nwse`, os quatro do CSS.
 */
export function cursorForHandle(box: TransformBox, handle: ScaleHandle): 'ew' | 'ns' | 'nesw' | 'nwse' {
  const cx = box.corners.reduce((s, p) => s + p.x, 0) / 4;
  const cy = box.corners.reduce((s, p) => s + p.y, 0) / 4;
  const h = box.handles[handle];
  // Na tela o y desce.
  let angle = (Math.atan2(-(h.y - cy), h.x - cx) * 180) / Math.PI;
  angle = ((angle % 180) + 180) % 180;
  if (angle < 22.5 || angle >= 157.5) return 'ew';
  if (angle < 67.5) return 'nwse';
  if (angle < 112.5) return 'ns';
  return 'nesw';
}

// ---------------------------------------------------------------------------
// A caixa do que está escolhido
// ---------------------------------------------------------------------------

function toWorld(frame: Matrix2x3, u: number, v: number): Point {
  return { x: frame.a * u + frame.b * v + frame.worldX, y: frame.c * u + frame.d * v + frame.worldY };
}

/** Os pontos de mundo do que está escolhido: os ossos como linhas grossas, os desenhos pelos cantos. */
function selectionPoints(doc: EditorDoc, px: number): Point[] {
  const skeleton = doc.skeleton;
  if (skeleton === null) return [];
  const out: Point[] = [];
  const t = BONE_BOX_PIXELS * px;
  for (const name of selectedBones(doc)) {
    const bone = skeleton.findBone(name);
    if (bone === null) continue;
    const base = { x: bone.worldX, y: bone.worldY };
    const tip = boneTip(bone);
    const length = Math.hypot(tip.x - base.x, tip.y - base.y);
    if (length < 1e-9) {
      out.push({ x: base.x - t, y: base.y - t }, { x: base.x + t, y: base.y + t });
      continue;
    }
    const nx = (-(tip.y - base.y) / length) * t;
    const ny = ((tip.x - base.x) / length) * t;
    out.push(
      { x: base.x + nx, y: base.y + ny }, { x: base.x - nx, y: base.y - ny },
      { x: tip.x + nx, y: tip.y + ny }, { x: tip.x - nx, y: tip.y - ny },
    );
  }
  for (const item of doc.selection.attachments) {
    const slot = skeleton.findSlot(item.slot);
    if (slot === null) continue;
    const attachment = skeleton.getAttachment(item.slot, item.attachment);
    const shape = attachmentWorldPoints(slot, attachment);
    if (shape === null) continue;
    for (let i = 0; i < shape.count; i++) {
      out.push({ x: shape.vertices[i * 2]!, y: shape.vertices[i * 2 + 1]! });
    }
  }
  return out;
}

/**
 * **A caixa do que está escolhido**, em mundo, ou `null` quando as
 * ferramentas não teriam em que mexer: nenhum osso e nenhum desenho sozinho.
 * `scale` é pixels de tela por unidade de mundo.
 */
export function transformBox(doc: EditorDoc, scale: number): TransformBox | null {
  const skeleton = doc.skeleton;
  if (skeleton === null) return null;
  const px = 1 / (scale > 0 ? scale : 1);
  const bones = selectedBones(doc);

  let frame: Matrix2x3;
  let pivot: Point;
  let axis: Point;
  let knobDistance: number;
  let handles: readonly ScaleHandle[];
  if (bones.length > 0) {
    const first = skeleton.findBone(bones[0]!);
    if (first === null) return null;
    frame = spaceFrame(skeleton, bones[0]!, getHandleSpace());
    pivot = bonePivot(skeleton, bones[0]!);
    const length = Math.hypot(first.a, first.c);
    axis = length > 1e-9 ? { x: first.a / length, y: first.c / length } : { x: 1, y: 0 };
    // Item 1.2 (13/09/2026): a bolinha mora a 3/4 do osso, perto da ponta —
    // não mais a 60px fixos do pivô, que a colava no pivô vermelho num osso
    // curto. `boneTip` é o comprimento de verdade, já com escala herdada.
    const tip = boneTip(first);
    const boneLength = Math.hypot(tip.x - first.worldX, tip.y - first.worldY);
    knobDistance = Math.max(boneLength * KNOB_BONE_FRACTION, KNOB_MIN_PIXELS * px);
    handles = BONE_SCALE_HANDLES;
  } else {
    const picked = pickedAttachment(doc);
    // Lote 60a: dois ou mais desenhos soltos. O pivô é o CENTRO da caixa em
    // volta deles, e não a origem de osso nenhum: é em volta dele que Girar e
    // Escalar mexem no grupo (`drawing-group.ts`), como o Spriter.
    const center = picked === null && pickedDrawings(doc) !== null ? drawingsCenter(doc) : null;
    knobDistance = KNOB_PIXELS * px;
    handles = SCALE_HANDLES;
    if (picked !== null) {
      pivot = { ...picked.anchor };
      const angle = Math.atan2(picked.bone.c, picked.bone.a) + (picked.rotation * Math.PI) / 180;
      axis = { x: Math.cos(angle), y: Math.sin(angle) };
      // Item 1.1 (13/09/2026): a caixa acompanha o giro do desenho — antes
      // era sempre reta (eixos da tela), e o desenho girava sozinho dentro
      // dela. Mesmo ângulo que a haste já usava, agora também na caixa.
      frame = { a: axis.x, b: -axis.y, c: axis.y, d: axis.x, worldX: pivot.x, worldY: pivot.y };
    } else if (center !== null) {
      frame = { a: 1, b: 0, c: 0, d: 1, worldX: center.x, worldY: center.y };
      pivot = center;
      axis = { x: 1, y: 0 };
    } else {
      return null;
    }
  }
  if (Math.abs(frame.a * frame.d - frame.b * frame.c) < 1e-12) {
    frame = { a: 1, b: 0, c: 0, d: 1, worldX: pivot.x, worldY: pivot.y };
  }

  const points = selectionPoints(doc, px);
  if (points.length === 0) return null;
  let u0 = Infinity;
  let v0 = Infinity;
  let u1 = -Infinity;
  let v1 = -Infinity;
  for (const p of points) {
    const q = worldPointToFrame(frame, p.x, p.y);
    u0 = Math.min(u0, q.x);
    v0 = Math.min(v0, q.y);
    u1 = Math.max(u1, q.x);
    v1 = Math.max(v1, q.y);
  }
  const knob = { x: pivot.x + axis.x * knobDistance, y: pivot.y + axis.y * knobDistance };
  return boxFromCorners(
    toWorld(frame, u0, v0), toWorld(frame, u1, v0), toWorld(frame, u1, v1), toWorld(frame, u0, v1),
    pivot, knob, handles,
  );
}
