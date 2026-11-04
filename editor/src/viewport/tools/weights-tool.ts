/**
 * Tool "Pesos" (owner C, requirement R5): paints the weights of a mesh.
 *
 * The brush works in world units, on the vertices of the selected mesh. Which
 * bone is being painted is the bone selected in the tree — one selection, one
 * meaning, so there is nothing extra to remember.
 *
 * Cor de um vértice: uma **pizza**, uma fatia por osso, na cor do osso — lote
 * 69. A escala azul–vermelho de antes mostrava **um osso por vez**, e uma
 * imagem presa a dois ossos ficava impossível de ler. O Spine e o DragonBones
 * desenham a pizza; os números continuam escritos na aba.
 *
 * The whole stroke is ONE undo step: every command of a stroke carries the same
 * signature and merges, and the viewport closes the run when the button is
 * released.
 */

import {
  registerTool, type EditorDoc, type Tool, type ToolEvent, corpoDe, wentToBase,
} from '../../contract.js';
import {
  asMeshDef, liveWorldVertices, readMesh, restWorldPositions, selectedMesh,
  writeWeightTable, type MeshView,
} from '../../mesh/mesh-doc.js';
import {
  boneFramesOf, boneSegment, brushFalloff, cloneTable, neighborsOf, paintWeights, pieOf, tableOf,
  type BrushMode, type WeightTable,
} from '../../mesh/weights.js';
import { drawMesh } from './mesh-tool.js';
import { pickAll, pointInTriangleList } from '../picking.js';
import {
  FACTORY_RADIUS, boneColor, setBindMode, BRUSH_NO_BONE_NOTICE, brushStrokeNotice, changedVertices,
} from '../../panels/mesh-panel-model.js';

// ---------------------------------------------------------------------------
// Brush settings, shared with the panel
// ---------------------------------------------------------------------------

export interface BrushSettings {
  mode: BrushMode;
  /** Radius in world units (skeleton pixels). */
  radius: number;
  /** How hard the brush presses, `0..1`. */
  strength: number;
  /** Bones the brush must leave alone, by index in `file.bones`. */
  locked: number[];
}

let brush: BrushSettings = { mode: 'add', radius: FACTORY_RADIUS, strength: 0.5, locked: [] };
const listeners = new Set<(settings: BrushSettings) => void>();

/** O Humberto já escolheu um raio a mão nesta sessão? — lote 69, buraco 6. */
let radiusChosen = false;

export function getBrush(): BrushSettings {
  return { ...brush, locked: brush.locked.slice() };
}

export function setBrush(change: Partial<BrushSettings>): void {
  if (change.radius !== undefined) radiusChosen = true;
  brush = { ...brush, ...change, locked: (change.locked ?? brush.locked).slice() };
  for (const listener of listeners) listener(getBrush());
}

/**
 * O raio que a malha escolhida pede — lote 69, buraco 6.
 *
 * O pincel nascia com 40 para toda malha, e numa peça de 44 px uma pincelada
 * cobria tudo. Ao escolher uma malha, a aba oferece o raio dela; **assim que o
 * Humberto mexe no raio a mão, a oferta cala para sempre** — o número dele
 * vale mais do que a conta. Nada acontece quando o valor já é esse, senão o
 * aviso refazia a aba, que oferece de novo, sem fim.
 */
export function suggestRadius(radius: number): void {
  if (radiusChosen || brush.radius === radius) return;
  brush = { ...brush, radius };
  for (const listener of listeners) listener(getBrush());
}

/** Esquece o raio escolhido a mão. Para o teste começar limpo. */
export function forgetRadiusChoice(): void {
  radiusChosen = false;
  brush = { ...brush, radius: FACTORY_RADIUS };
}

export function onBrushChange(listener: (settings: BrushSettings) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `true` while this bone is locked. */
export function isLocked(bone: number): boolean {
  return brush.locked.includes(bone);
}

/** Locks or unlocks one bone. */
export function setLocked(bone: number, locked: boolean): void {
  const current = new Set(brush.locked);
  if (locked) current.add(bone);
  else current.delete(bone);
  setBrush({ locked: [...current].sort((a, b) => a - b) });
}

/**
 * O osso do pincel de cada malha, lembrado — conferência da v32.2 (doc `53`).
 * Reescolher o desenho na Árvore larga o osso escolhido, e o pincel perdia o
 * osso que se pintava. A chave é `slot/anexo`.
 */
const lembrado = new Map<string, string>();

/** Index in `file.bones` of the bone the brush paints, or `-1`. */
export function paintedBone(doc: EditorDoc): number {
  const ref = selectedMesh(doc);
  const chave = ref === null ? null : `${ref.slot}/${ref.attachment}`;
  let name: string | undefined = doc.selection.bones[0];
  if (name !== undefined && chave !== null) lembrado.set(chave, name);
  if (name === undefined && chave !== null) name = lembrado.get(chave);
  if (name === undefined) return -1;
  return (corpoDe(doc).file.bones ?? []).findIndex((bone) => bone.name === name);
}

// ---------------------------------------------------------------------------
// O osso debaixo do dedo
// ---------------------------------------------------------------------------

/** O osso mais em cima no ponto clicado, ou `null` — lote 69. */
function boneAt(doc: EditorDoc, e: ToolEvent): string | null {
  const hit = pickAll(doc.skeleton, e.x, e.y, e.scale).find((pick) => pick.kind === 'bone');
  return hit?.bone ?? null;
}

/** A seleção com o osso trocado e os desenhos onde estavam — item e do lote 69. */
export function selectionKeepingDrawing(doc: EditorDoc, bone: string): void {
  const current = doc.selection;
  doc.select({
    bones: [bone],
    slots: current.slots.slice(),
    attachments: current.attachments.map((item) => ({ ...item })),
    constraints: current.constraints.slice(),
    // Rodada 41, lote 2: trocar o osso a pintar não larga os vértices escolhidos.
    vertices: current.vertices.slice(),
  });
}

/** O vértice debaixo do ponteiro, ou `-1` — rodada 41, lote 2 (Shift + clique). */
function vertexAt(world: readonly number[], x: number, y: number, radius: number): number {
  let best = -1;
  let bestDistance = radius * radius;
  for (let v = 0; v * 2 + 1 < world.length; v++) {
    const d = ((world[2 * v] ?? 0) - x) ** 2 + ((world[2 * v + 1] ?? 0) - y) ** 2;
    if (d <= bestDistance) { bestDistance = d; best = v; }
  }
  return best;
}

// ---------------------------------------------------------------------------
// The tool
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// A pizza de cada vértice — lote 69
// ---------------------------------------------------------------------------

/** O tamanho da pizza na tela, em pixels. Um pouco maior que o quadradinho. */
const PIE_PIXELS = 11;
/** A pizza do vértice escolhido, maior — como a Pies do Spine (rodada 41, lote 2). */
const PIE_SELECTED_PIXELS = 20;

/**
 * Desenha a pizza de cada vértice: uma fatia por osso, na cor do osso, do
 * tamanho do peso, em ordem de índice (`pieOf`). A fatia do osso que o pincel
 * pinta ganha um aro branco — é assim que se sabe onde a próxima pincelada vai
 * cair sem tirar os olhos da peça. Vértice sem peso nenhum não ganha pizza: o
 * quadradinho branco da malha continua valendo.
 */
function drawPies(
  doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number,
  table: WeightTable, world: readonly number[], painted: number,
  selected: ReadonlySet<number> = new Set(),
): void {
  const px = (pixels: number): number => pixels / Math.max(scale, 1e-6);
  ctx.save();
  for (let v = 0; v * 2 + 1 < world.length; v++) {
    const slices = pieOf(table, v);
    if (slices.length === 0) continue;
    const radius = px(selected.has(v) ? PIE_SELECTED_PIXELS : PIE_PIXELS) / 2;
    const x = world[2 * v] ?? 0;
    const y = world[2 * v + 1] ?? 0;
    let from = -Math.PI / 2;
    for (const slice of slices) {
      const to = from + slice.weight * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.arc(x, y, radius, from, to);
      ctx.closePath();
      ctx.fillStyle = boneColor(corpoDe(doc).file, slice.bone);
      ctx.fill();
      if (slice.bone === painted) {
        ctx.lineWidth = px(2.5);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
      from = to;
    }
    ctx.lineWidth = px(1);
    ctx.strokeStyle = '#2b2b2b';
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

class WeightsTool implements Tool {
  readonly id = 'weights';
  readonly label = 'Pesos';
  readonly shortcut = 'g';
  /**
   * Nos dois modos desde 14/09/2026 (plano "fluxo criar e animar", lote 2) —
   * ausente é "nos dois" (contract.ts). Peso continua sendo estrutura, e
   * `writeWeightTable` (mesh/mesh-doc.ts) sempre escreve na pose de repouso,
   * com animação aberta ou não — não existe chave de peso no formato (§7.4:
   * só `deform` se anima). A aba avisa isso numa linha, para quem pinta com
   * uma animação aberta saber que não está mexendo naquela chave.
   */

  private stroke: {
    view: MeshView;
    table: WeightTable;
    positions: number[];
    neighbors: number[][];
    bone: number;
    /** Os vértices escolhidos: o pincel pinta só neles (rodada 41, lote 2). */
    only: ReadonlySet<number> | undefined;
    /** A tabela de antes da pincelada, para o rodapé contar o que mudou (lote 3). */
    before: WeightTable;
  } | null = null;

  private cursorX = 0;
  private cursorY = 0;

  onExit(): void {
    this.stroke = null;
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    const ref = selectedMesh(doc);
    if (ref === null) return;
    const view = readMesh(doc, ref);

    // O modo Ligar não chega até aqui: desde o conserto do lote 70 quem o
    // atende é a cena, antes da ferramenta (`bindModeSceneClick`).
    // Lote 69, item e: clique num osso FORA da malha escolhe o osso a pintar,
    // como a ferramenta Weights do Spine. O desenho fica; dentro da malha o
    // clique continua pintando, que é o trabalho de todo dia.
    const dentro = pointInTriangleList(
      liveWorldVertices(doc, view), view.geometry.triangles, e.x, e.y,
    );
    if (!dentro) {
      const alvo = boneAt(doc, e);
      if (alvo !== null && alvo !== doc.selection.bones[0]) {
        selectionKeepingDrawing(doc, alvo);
        return;
      }
    }

    // Rodada 41, lote 2: Shift + clique num vértice escolhe ou larga ele, sem
    // pintar — e o pincel passa a pintar só nos escolhidos, como no Spine.
    if (e.shift) {
      const v = vertexAt(liveWorldVertices(doc, view), e.x, e.y, 12 / Math.max(e.scale, 1e-6));
      if (v >= 0) {
        const atual = new Set(doc.selection.vertices);
        if (atual.has(v)) atual.delete(v); else atual.add(v);
        selectionKeepingVertices(doc, [...atual].sort((a, b) => a - b));
        const n = atual.size;
        doc.notice(n === 0
          ? 'Nenhum vértice escolhido: o pincel pinta a malha inteira'
          : `${n} ${n === 1 ? 'vértice escolhido' : 'vértices escolhidos'}: a lista mostra o peso, e o pincel pinta só neles. Esc larga`);
        return;
      }
    }
    const bone = paintedBone(doc);
    if (bone < 0 && brush.mode !== 'smooth') {
      // Rodada 41, lote 3: dizia nada (regra 21).
      doc.notice(BRUSH_NO_BONE_NOTICE);
      return;
    }
    const positions = restWorldPositions(view);
    this.stroke = {
      view,
      table: cloneTable(tableOf(asMeshDef(view.ref.def))),
      positions,
      neighbors: neighborsOf(view.geometry.triangles, positions.length >> 1),
      bone,
      only: doc.selection.vertices.length > 0 ? new Set(doc.selection.vertices) : undefined,
      before: cloneTable(tableOf(asMeshDef(view.ref.def))),
    };
    this.paint(doc, e);
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    if (this.stroke === null) return;
    this.paint(doc, e);
  }

  onUp(doc?: EditorDoc): void {
    const stroke = this.stroke;
    this.stroke = null;
    // Rodada 41, lote 3: o rodapé diz o osso, onde, e se foi para a base.
    if (stroke !== null && doc !== undefined) {
      const nome = (corpoDe(doc).file.bones ?? [])[stroke.bone]?.name;
      const quem = brush.mode === 'smooth' ? 'suavizado' : (nome ?? '');
      const mudou = changedVertices(stroke.before, stroke.table);
      if (brush.mode === 'smooth') {
        doc.notice(`Peso suavizado em ${mudou} ${mudou === 1 ? 'vértice' : 'vértices'}${wentToBase(doc)}`);
      } else if (quem !== '') {
        doc.notice(brushStrokeNotice(quem, mudou, wentToBase(doc)));
      }
    }
  }

  /**
   * O ponteiro sem botão: o círculo do pincel segue o mouse — rodada 41,
   * lote 3. O centro só andava DENTRO da pincelada; parado, o círculo ficava
   * onde a última terminou, e não se via onde a próxima ia cair (doc `43`,
   * fotos `31` e `35`). O Spine e o DragonBones mostram o pincel antes.
   */
  onHover(_doc: EditorDoc, e: ToolEvent): void {
    this.cursorX = e.x;
    this.cursorY = e.y;
  }

  /** Esc fecha o modo Ligar — item a. Sem o modo aberto, a tecla segue adiante. */
  onKey(doc: EditorDoc, key: string): boolean {
    // Conferência da v32.2: [ e ] mudam o Raio, como no Photoshop (o Spine usa
    // ' e ;). Só com a ferramenta Pesos na mão; fora dela, [ e ] seguem
    // escolhendo os pais e os filhos (Editar → Escolher).
    if (key === '[' || key === ']') {
      const atual = getBrush().radius;
      const novo = Math.max(1, Math.min(400, key === ']' ? Math.round(atual * 1.25) : Math.round(atual / 1.25)));
      setBrush({ radius: novo });
      doc.notice(`Raio do pincel: ${novo} px ([ diminui, ] aumenta)`);
      return true;
    }
    if (key !== 'Escape') return false;
    if (setBindMode(false)) return true;
    // Rodada 41, lote 2: Esc larga os vértices escolhidos.
    if (doc.selection.vertices.length > 0) {
      selectionKeepingVertices(doc, []);
      doc.notice('Nenhum vértice escolhido: o pincel pinta a malha inteira');
      return true;
    }
    return false;
  }

  private paint(doc: EditorDoc, e: ToolEvent): void {
    const stroke = this.stroke;
    if (stroke === null) return;
    this.cursorX = e.x;
    this.cursorY = e.y;
    const locked = new Set(brush.locked);
    stroke.table = paintWeights(stroke.table, {
      mode: brush.mode,
      bone: stroke.bone,
      x: e.x,
      y: e.y,
      radius: brush.radius,
      strength: brush.strength * (e.alt ? 0.4 : 1),
      positions: stroke.positions,
      locked,
      neighbors: stroke.neighbors,
      only: stroke.only,
    });
    writeWeightTable(doc, stroke.view, stroke.table, 'Pintar pesos', { mergeable: true });
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const ref = selectedMesh(doc);
    if (ref === null) return;
    const view = this.stroke?.view ?? readMesh(doc, ref);
    const table = this.stroke?.table ?? tableOf(asMeshDef(ref.def));
    const bone = this.stroke?.bone ?? paintedBone(doc);
    const world = liveWorldVertices(doc, view);
    // Rodada 41, lote 3: o osso que se pinta brilha na cor dele, por cima da
    // malha. O cape2 ficava escondido debaixo dela (doc `43`, foto `29`).
    if (bone >= 0 && doc.skeleton !== null) {
      const frame = boneFramesOf(doc.skeleton)[bone];
      if (frame !== undefined) {
        const seg = boneSegment(frame);
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineWidth = 7 / Math.max(scale, 1e-6);
        ctx.strokeStyle = '#ffffff';
        ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); ctx.stroke();
        ctx.lineWidth = 4 / Math.max(scale, 1e-6);
        ctx.strokeStyle = boneColor(corpoDe(doc).file, bone);
        ctx.beginPath(); ctx.moveTo(seg.x1, seg.y1); ctx.lineTo(seg.x2, seg.y2); ctx.stroke();
        ctx.restore();
      }
    }
    drawMesh(ctx, scale, view, world, doc.selection.vertices);
    drawPies(doc, ctx, scale, table, world, bone, new Set(doc.selection.vertices));

    // The brush itself, so the radius is visible.
    ctx.save();
    ctx.strokeStyle = '#1b52d6';
    ctx.lineWidth = 2 / Math.max(scale, 1e-6);
    ctx.beginPath();
    ctx.arc(this.cursorX, this.cursorY, brush.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/** Exported so the panel can show the same falloff it paints with. */
export { brushFalloff };

export const weightsTool: Tool = new WeightsTool();
registerTool(weightsTool);

/** A seleção com estes vértices, o resto igual — rodada 41, lote 2. */
function selectionKeepingVertices(doc: EditorDoc, vertices: number[]): void {
  const current = doc.selection;
  doc.select({
    bones: current.bones.slice(),
    slots: current.slots.slice(),
    attachments: current.attachments.map((item) => ({ ...item })),
    constraints: current.constraints.slice(),
    vertices,
  });
}
