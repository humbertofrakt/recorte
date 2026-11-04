/**
 * Tool "Malha" (owner C, requirement R4): edits the vertices of a mesh.
 *
 * What the artist does with it:
 *   - clicking a vertex selects it, dragging moves it;
 *   - `Ctrl` + clicking on empty space adds a vertex where the pointer is;
 *   - with the "Criar vértice" mode open (the panel's button), a PLAIN click
 *     on empty space also adds a vertex — item 4.2, plano caixa ossos e
 *     malha: *"não tem um modo de criar vértices na malha, como no Spine e
 *     no DragonBones"*. `Ctrl` + click keeps working either way;
 *   - `Delete` removes the selected vertices;
 *   - `L` creates an edge between the two selected vertices, `K` removes it.
 *
 * WHERE THE MOVE LANDS is decided by `mesh/mesh-doc.ts`, not here: in assembly
 * mode the rest mesh changes, and with an animation open a `deform` key is
 * written at the playhead and the rest mesh is left alone (spec 9.6). One drag
 * is one undo step in both cases.
 */

import {
  registerTool, type EditorDoc, type Selection, type Tool, type ToolEvent,
} from '../../contract.js';
import {
  liveWorldVertices, moveMeshVertex, readMesh, selectedMesh, shapeRefusal, writeGeometry,
  addMeshVertex, removeMeshVertex, restPoseSuffix, type MeshView,
} from '../../mesh/mesh-doc.js';
import { addEdge, removeEdge } from '../../mesh/mesh-edit.js';
import { inverseTransformPoint } from '../../../../runtime/src/index.js';

/**
 * O que a Malha diz quando o clique não pega vértice nenhum — L17 (chat L).
 * O gesto inteiro numa frase: onde clicar, e o que faz criar.
 */
export const MISSED_VERTEX_NOTICE =
  'Nenhum vértice aqui. Clique num quadrado branco e arraste; Ctrl+clique cria um vértice';

/** O Delete da Malha sem vértice escolhido — conferência da v31.6. */
export const NO_VERTEX_TO_DELETE_NOTICE =
  'Nenhum vértice escolhido: com a Malha na mão o Delete apaga vértices. Para apagar o desenho inteiro, troque de ferramenta ou use Editar → Apagar';

/** How close to a vertex the pointer must be, in screen pixels. */
const PICK_PIXELS = 12;
const VERTEX_PIXELS = 9;

const COLOR = Object.freeze({
  triangle: '#8d8d86',
  edge: '#8a5a00',
  hull: '#2b2b2b',
  vertex: '#ffffff',
  vertexLine: '#2b2b2b',
  selected: '#d97a00',
});

/** The view of the mesh being edited right now, or `null`. */
export function currentMeshView(doc: EditorDoc): MeshView | null {
  const ref = selectedMesh(doc);
  return ref === null ? null : readMesh(doc, ref);
}

// ---------------------------------------------------------------------------
// O modo Criar vértice — item 4.2, plano "caixa, ossos e malha"
// ---------------------------------------------------------------------------

/**
 * O modo **Criar vértice**, como o Spine e o DragonBones: um botão liga o
 * modo, e enquanto ele está aberto o clique simples no vazio da malha cria um
 * vértice — sem precisar segurar `Ctrl`. O `Ctrl` + clique continua valendo os
 * dois jeitos, para quem já tem o gesto no dedo.
 *
 * Mesmo padrão do modo Ligar de `mesh-panel-model.ts`: estado num módulo sem
 * DOM, porque quem pergunta por ele é a ferramenta e a aba.
 */
let createVertexOpen = false;
const createVertexListeners = new Set<(open: boolean) => void>();

/** A frase do rodapé com o modo aberto. */
export const CREATE_VERTEX_NOTICE = 'Clique na malha para criar vértices. Criar vértice de novo termina.';

/** `true` enquanto o modo Criar vértice está aberto. */
export function createVertexModeOpen(): boolean {
  return createVertexOpen;
}

/** Abre ou fecha o modo. Devolve `true` quando alguma coisa mudou. */
export function setCreateVertexMode(open: boolean): boolean {
  if (createVertexOpen === open) return false;
  createVertexOpen = open;
  for (const listener of createVertexListeners) listener(open);
  return true;
}

/** O botão da aba: abre se está fechado, fecha se está aberto. Devolve o novo estado. */
export function toggleCreateVertexMode(): boolean {
  setCreateVertexMode(!createVertexOpen);
  return createVertexOpen;
}

/** Avisa quando o modo abre ou fecha. Devolve a função que desliga o aviso. */
export function onCreateVertexModeChange(listener: (open: boolean) => void): () => void {
  createVertexListeners.add(listener);
  return () => createVertexListeners.delete(listener);
}

/** Index of the vertex under the pointer, or `-1`. */
function pickVertex(world: readonly number[], x: number, y: number, radius: number): number {
  let best = -1;
  let bestDistance = radius * radius;
  for (let v = 0; v * 2 + 1 < world.length; v++) {
    const dx = world[2 * v] - x;
    const dy = world[2 * v + 1] - y;
    const d = dx * dx + dy * dy;
    if (d <= bestDistance) {
      bestDistance = d;
      best = v;
    }
  }
  return best;
}

/** A caixa de escolher vértices, em coordenadas do mundo — rodada 41, lote 2. */
export interface VertexBox { x0: number; y0: number; x1: number; y1: number }

/**
 * Os vértices dentro da caixa, de qualquer canto para qualquer canto — rodada
 * 41, lote 2. O Spine escolhe vértices com a caixa; aqui arrastar no vazio não
 * escolhia nada, e calado (doc `43`, foto `15`).
 */
export function verticesInBox(world: readonly number[], box: VertexBox): number[] {
  const minX = Math.min(box.x0, box.x1);
  const maxX = Math.max(box.x0, box.x1);
  const minY = Math.min(box.y0, box.y1);
  const maxY = Math.max(box.y0, box.y1);
  const out: number[] = [];
  for (let v = 0; v * 2 + 1 < world.length; v++) {
    const x = world[2 * v] ?? 0;
    const y = world[2 * v + 1] ?? 0;
    if (x >= minX && x <= maxX && y >= minY && y <= maxY) out.push(v);
  }
  return out;
}

function selectVertices(doc: EditorDoc, vertices: number[]): void {
  const current: Selection = doc.selection;
  doc.select({
    bones: current.bones.slice(),
    slots: current.slots.slice(),
    attachments: current.attachments.map((entry) => ({ ...entry })),
    constraints: current.constraints.slice(),
    vertices,
  });
}

/**
 * Com uma animação aberta, diz no rodapé que a mudança de forma foi para a
 * base — degrau 4a: dizer, não impedir. Desde a rodada 41, lote 1, fala com a
 * base aberta também (o sufixo é vazio): o rodapé ficava mudo no Delete.
 */
export function saidToBase(doc: EditorDoc, what: string): void {
  // Rodada 41, lote 1: falava só com uma animação aberta; com a base aberta o
  // Delete e o L deixavam o rodapé mudo (doc `43`, §2.1). O sufixo já é vazio
  // na base (`wentToBase`), então a frase vale nos dois lados.
  doc.notice(`${what}${restPoseSuffix(doc)}`);
}

class MeshTool implements Tool {
  readonly id = 'mesh';
  readonly label = 'Malha';
  readonly shortcut = 'm';
  /**
   * Nos dois modos desde 14/09/2026 (plano "fluxo criar e animar", lote 2) —
   * ausente é "nos dois" (contract.ts). Até aqui só valia em Montagem, sob o
   * argumento "estrutura não se anima". Mas MOVER um vértice já não mexe na
   * estrutura: `moveMeshVertex` (mesh/mesh-doc.ts) grava uma chave de
   * deformação com uma animação aberta, e deixa a forma de repouso intacta —
   * só os botões que mudam a FORMA (criar/apagar vértice, gerar automática)
   * e os PESOS continuam escrevendo na pose de repouso, sempre, e a aba avisa
   * isso numa linha enquanto a ferramenta está na mão.
   */

  private drag: { view: MeshView; index: number } | null = null;
  /** A caixa de escolher vértices, enquanto o arrasto no vazio dura — rodada 41, lote 2. */
  private box: (VertexBox & { view: MeshView; base: number[] }) | null = null;
  /** A última recusa dita, para não repetir a frase a cada clique. */
  private said: string | null = null;
  /** A malha em que o "nenhum vértice aqui" já foi dito — L17. */
  private missedFor: string | null = null;

  onExit(): void {
    this.drag = null;
    this.box = null;
    this.said = null;
    this.missedFor = null;
    setCreateVertexMode(false);
  }

  /** Diz a recusa do anexo escolhido, uma vez só por anexo. */
  private sayRefusal(doc: EditorDoc): void {
    const phrase = shapeRefusal(doc);
    if (phrase === null || phrase === this.said) return;
    this.said = phrase;
    doc.notice(phrase);
  }

  onDown(doc: EditorDoc, e: ToolEvent): void {
    if (e.button !== 0) return;
    const view = currentMeshView(doc);
    if (view === null) {
      // Regra 21: o anexo escolhido não tem contorno, e a Malha diz por quê
      // em vez de não fazer nada. Uma vez por anexo, para não virar paisagem.
      this.sayRefusal(doc);
      return;
    }
    this.said = null;
    const world = liveWorldVertices(doc, view);
    const index = pickVertex(world, e.x, e.y, PICK_PIXELS / Math.max(e.scale, 1e-6));

    if (index < 0) {
      const cria = e.ctrl || createVertexOpen;
      if (!cria) {
        // Rodada 41, lote 2: arrastar no vazio abre a caixa de escolher
        // vértices; Shift soma aos que já estavam escolhidos.
        const base = e.shift ? [...doc.selection.vertices] : [];
        this.box = { x0: e.x, y0: e.y, x1: e.x, y1: e.y, view, base };
        selectVertices(doc, base);
        // L17 (chat L, 29/09): o clique fora de um vértice largava a escolha
        // calado, e o arrasto que vinha depois não fazia nada. Regra 21: diz.
        // Uma vez por malha, para não virar paisagem.
        const malha = `${view.ref.slot}/${view.ref.attachment}`;
        if (this.missedFor !== malha) {
          this.missedFor = malha;
          doc.notice(MISSED_VERTEX_NOTICE);
        }
        return;
      }
      // A new vertex only makes sense on the rest mesh: a deform key can move
      // vertices, never create one. Degrau 4a: with an animation open it is
      // no longer refused — it goes to the base, and the footer says so.
      const local = inverseTransformPoint(view.slotFrame, e.x, e.y);
      const refused = addMeshVertex(doc, view, local.x, local.y);
      if (refused !== null) doc.notice(refused);
      else saidToBase(doc, 'Vértice novo');
      return;
    }

    const chosen = e.shift
      ? [...new Set([...doc.selection.vertices, index])]
      : [index];
    selectVertices(doc, chosen);
    this.drag = { view, index };
  }

  onMove(doc: EditorDoc, e: ToolEvent): void {
    if (this.box !== null) {
      this.box.x1 = e.x;
      this.box.y1 = e.y;
      const dentro = verticesInBox(liveWorldVertices(doc, this.box.view), this.box);
      selectVertices(doc, [...new Set([...this.box.base, ...dentro])].sort((a, b) => a - b));
      return;
    }
    const drag = this.drag;
    if (drag === null) return;
    moveMeshVertex(doc, drag.view, drag.index, e.x, e.y, { mergeable: true });
  }

  onUp(doc?: EditorDoc): void {
    const box = this.box;
    this.box = null;
    if (box !== null && doc !== undefined) {
      const n = doc.selection.vertices.length;
      if (n > 0 && (box.x0 !== box.x1 || box.y0 !== box.y1)) {
        doc.notice(`${n} ${n === 1 ? 'vértice escolhido' : 'vértices escolhidos'}. Shift + arrastar soma mais`);
      }
    }
    this.drag = null;
  }

  onKey(doc: EditorDoc, key: string): boolean {
    if (key === 'Escape' && createVertexOpen) return setCreateVertexMode(false);
    const view = currentMeshView(doc);
    if (view === null) return false;
    const chosen = [...doc.selection.vertices].sort((a, b) => b - a);
    const lower = key.toLowerCase();

    // Degrau 4a: apagar vértice e ligar ou desligar aresta valem com uma
    // animação aberta também. A forma vai para a base, e o rodapé diz.
    if (lower === 'delete' || lower === 'backspace') {
      // Conferência da v31.6 (doc `46`): com a Malha na mão e nenhum vértice
      // escolhido, o Delete passava adiante e apagava o DESENHO inteiro, e o
      // rodapé dizia só "Apagar.". No Spine, editando a malha, o Delete é dos
      // vértices. Aqui também: sem vértice, ele diz como apagar o desenho.
      if (chosen.length === 0) {
        doc.notice(NO_VERTEX_TO_DELETE_NOTICE);
        return true;
      }
      let refused: string | null = null;
      for (const index of chosen) refused = removeMeshVertex(doc, view, index) ?? refused;
      if (refused !== null) {
        doc.notice(refused);
        return true;
      }
      selectVertices(doc, []);
      saidToBase(doc, chosen.length === 1 ? '1 vértice apagado' : `${chosen.length} vértices apagados`);
      return true;
    }
    if (lower === 'l' && chosen.length === 2) {
      writeGeometry(doc, view, addEdge(view.geometry, chosen[0], chosen[1]), 'Criar aresta');
      saidToBase(doc, 'Aresta criada');
      return true;
    }
    if (lower === 'k' && chosen.length === 2) {
      writeGeometry(doc, view, removeEdge(view.geometry, chosen[0], chosen[1]), 'Apagar aresta');
      saidToBase(doc, 'Aresta apagada');
      return true;
    }
    return false;
  }

  drawOverlay(doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number): void {
    const view = currentMeshView(doc);
    if (view === null) return;
    const world = liveWorldVertices(doc, view);
    drawMesh(ctx, scale, view, world, doc.selection.vertices);
    const box = this.box;
    if (box !== null) {
      ctx.save();
      ctx.lineWidth = 1 / Math.max(scale, 1e-6);
      ctx.setLineDash([4 / Math.max(scale, 1e-6), 3 / Math.max(scale, 1e-6)]);
      ctx.strokeStyle = COLOR.selected;
      ctx.strokeRect(Math.min(box.x0, box.x1), Math.min(box.y0, box.y1),
        Math.abs(box.x1 - box.x0), Math.abs(box.y1 - box.y0));
      ctx.restore();
    }
  }
}

/** Triangles, constraint edges and vertices, all with a fixed size on screen. */
export function drawMesh(
  ctx: CanvasRenderingContext2D, scale: number, view: MeshView,
  world: readonly number[], selected: readonly number[],
  colorOf?: (vertex: number) => string,
): void {
  const px = (pixels: number): number => pixels / Math.max(scale, 1e-6);
  const at = (v: number): [number, number] => [world[2 * v] ?? 0, world[2 * v + 1] ?? 0];

  ctx.save();
  ctx.lineWidth = px(1);
  ctx.strokeStyle = COLOR.triangle;
  const triangles = view.geometry.triangles;
  ctx.beginPath();
  for (let t = 0; t + 2 < triangles.length; t += 3) {
    const a = at(triangles[t]);
    const b = at(triangles[t + 1]);
    const c = at(triangles[t + 2]);
    ctx.moveTo(a[0], a[1]);
    ctx.lineTo(b[0], b[1]);
    ctx.lineTo(c[0], c[1]);
    ctx.closePath();
  }
  ctx.stroke();

  const hull = view.geometry.hull;
  if (hull >= 3) {
    ctx.lineWidth = px(2);
    ctx.strokeStyle = COLOR.hull;
    ctx.beginPath();
    for (let i = 0; i < hull; i++) {
      const p = at(i);
      if (i === 0) ctx.moveTo(p[0], p[1]);
      else ctx.lineTo(p[0], p[1]);
    }
    ctx.closePath();
    ctx.stroke();
  }

  const edges = view.geometry.edges;
  if (edges.length > 0) {
    ctx.lineWidth = px(2);
    ctx.strokeStyle = COLOR.edge;
    ctx.beginPath();
    for (let i = 0; i + 1 < edges.length; i += 2) {
      const a = at(edges[i]);
      const b = at(edges[i + 1]);
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
    }
    ctx.stroke();
  }

  const chosen = new Set(selected);
  const size = px(VERTEX_PIXELS);
  ctx.lineWidth = px(1.5);
  for (let v = 0; v * 2 + 1 < world.length; v++) {
    const p = at(v);
    ctx.fillStyle = chosen.has(v) ? COLOR.selected : (colorOf?.(v) ?? COLOR.vertex);
    ctx.strokeStyle = COLOR.vertexLine;
    ctx.beginPath();
    ctx.rect(p[0] - size / 2, p[1] - size / 2, size, size);
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

export const meshTool: Tool = new MeshTool();
registerTool(meshTool);
