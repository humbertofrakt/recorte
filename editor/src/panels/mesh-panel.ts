/**
 * Panel "Malha e pesos" (owner C, requirements R4 and R5).
 *
 * Everything that changes the SHAPE or the WEIGHTS of a mesh has a button
 * here, written in words: turning a drawing into a mesh, generating one from
 * the silhouette of the image, tracing only the outline, automatic weights,
 * smoothing, pruning, the list of bones with a lock each, and the brush.
 *
 * The panel never edits the file by hand: it calls the pure functions of
 * `mesh/mesh-edit.ts` and `mesh/weights.ts` and writes the result through
 * `mesh/mesh-doc.ts`, which is the module that knows the rule of the two modes.
 */

import { lembrarFoco } from './dom.js';
import { barButtonsKeepNoFocus } from './sem-foco.js';
import { campoNumero } from './campo-numero.js';
import {
  corpoDe, registerPanel, wentToBase, type DocChange, type EditorDoc, type Panel,
} from '../contract.js';
import { findAtlasRegion, smoothingFor, type RegionAttachmentDef } from '../../../runtime/src/index.js';
import { SetProperties, pointerOf } from '../doc/commands.js';
import {
  button, clear, el, ensureStylesheet, iconButton, stylesheetsPreloaded,
} from './dom.js';
import {
  BIND_NOTICE, bindModeOpen, initialRadius, boneColor, onBindModeChange, setBindMode,
  shouldAutoPickMeshTool, toggleBindMode, meshPanelSections, type MeshSectionId,
  BRUSH_TOOL_NOTICE, WEIGHTS_TEST_HINT, shouldTakeWeightsTool, weightsDoneNotice,
  BRUSH_FIELDS, BRUSH_MODES, MESH_BUTTON_TIPS, MESH_FOLDS, meshFoldsOpen, type MeshFold, boneListCaption, lockTip, attachmentKindLine,
  shapeDoneNotice, type BrushField, MESH_REST_POSE_SHORT, shouldAutoWeightAfterBind, bindClosedNotice,
} from './mesh-panel-model.js';
import { labelFor } from './label-model.js';
import { findAttachment } from './properties-model.js';
import {
  addEdge, autoMeshFromImage, autoMeshOptionsFromBox, boundsOf, DEFAULT_OUTLINE_OUTSET, hasEdge,
  regionToMesh, removeEdge, traceHullFromImage, type ImageLike, type MeshGeometry,
} from '../mesh/mesh-edit.js';
import {
  autoWeightBones, autoWeights, bindBone, influencingBones, pruneWeights, setWeight, smoothAll, tableOf,
  weightAt, type WeightTable,
} from '../mesh/weights.js';
import {
  meshPointer, readMesh, removeMeshVertex, removeWeights, restWorldPositions,
  MESH_REST_POSE_NOTICE, WEIGHTS_KEY_LABEL, asMeshDef, deformWarningFor, keyWeights, selectedMesh,
  toggleMeshBone, writeGeometry, writeWeightTable, type MeshView,
} from '../mesh/mesh-doc.js';
import {
  linkMesh, linkedMeshLine, linkedMeshParents, whyNotLink, type LinkedMeshParent,
} from '../mesh/linked-mesh.js';
// The two tools register themselves when this module is loaded, so the panel
// and the tools always arrive together.
import {
  getBrush, isLocked, onBrushChange, paintedBone, setBrush, setLocked, suggestRadius,
} from '../viewport/tools/weights-tool.js';
import {
  CREATE_VERTEX_NOTICE, createVertexModeOpen, onCreateVertexModeChange, setCreateVertexMode,
  toggleCreateVertexMode,
} from '../viewport/tools/mesh-tool.js';
import { getActiveToolId, onActiveToolChange, setActiveTool } from '../viewport/tools/registry.js';

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------

let styleLinked = false;
function ensureMeshStylesheet(): void {
  if (stylesheetsPreloaded() || styleLinked || typeof document === 'undefined') return;
  styleLinked = true;
  const href = new URL('./mesh-panel.css', import.meta.url).href;
  if (document.head.querySelector(`link[href="${href}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

// ---------------------------------------------------------------------------
// The image behind an attachment
// ---------------------------------------------------------------------------

/** Size in skeleton pixels of the original image of a region. */
interface ImageAndSize {
  image: ImageLike;
  width: number;
  height: number;
}

/** Where the atlas crop sits inside the original image, and how it is turned. */
export interface CropPlacement {
  /** Rectangle to read from the atlas page, in page pixels. */
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  /** Canvas transform `(a, b, c, d, e, f)` that puts it back in place. */
  matrix: [number, number, number, number, number, number];
}

/**
 * How to draw one atlas crop back into an image of the ORIGINAL size.
 *
 * Two things have to be undone (spec 10.3): the transparent border the packer
 * cut away, which `offsetX` / `offsetY` measure, and the quarter turn it may
 * have given the crop to make it fit, which `rotation: 90` records.
 *
 * The turn is read straight off `AtlasRegionData.computeUV` (spec 10.4), which
 * is normative: a pixel `(px, py)` of the crop lives on the page at
 * `(x + height − py, y + px)`. Reading that backwards, a page pixel `(x+u, y+v)`
 * is the crop pixel `(v, height − u)`, and that is exactly the matrix
 * `(0, −1, 1, 0)` — a quarter turn — with the crop's own offset added.
 *
 * The rectangle to READ is `height × width` and not `width × height`, because
 * the page holds the crop lying on its side.
 */
export function cropPlacement(region: {
  x: number; y: number; width: number; height: number;
  rotation: 0 | 90; offsetX: number; offsetY: number; originalHeight: number;
}): CropPlacement {
  const dx = region.offsetX;
  const dy = region.originalHeight - region.offsetY - region.height;
  if (region.rotation !== 90) {
    return {
      sx: region.x, sy: region.y, sw: region.width, sh: region.height,
      matrix: [1, 0, 0, 1, dx, dy],
    };
  }
  return {
    sx: region.x, sy: region.y, sw: region.height, sh: region.width,
    matrix: [0, -1, 1, 0, dx, dy + region.height],
  };
}

/**
 * The ORIGINAL image of an attachment, un-cropped and un-rotated, as pixels the
 * tracer can read. The atlas may have cut the transparent border away and may
 * have stored the crop lying on its side (spec 10.3), so both are undone before
 * a single pixel is read — see `cropPlacement`.
 */
export function originalImageOf(doc: EditorDoc, path: string): ImageAndSize | string {
  if (typeof document === 'undefined') return 'sem navegador para ler a imagem';
  const region = findAtlasRegion(doc.atlases, path);
  if (region === null) return `sem imagem para "${path}" no atlas`;
  const source = doc.imageFor(region.page);
  if (source === null) return 'a imagem da página do atlas ainda não carregou';

  const width = region.originalWidth;
  const height = region.originalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext('2d');
  if (ctx === null) return 'o navegador não deu um contexto 2D';
  const place = cropPlacement(region);
  // Arte em pixel (§4.1): o traçado lê o pixel duro, sem média nas bordas — lote 48.
  ctx.imageSmoothingEnabled = smoothingFor(doc.file.skeleton);
  ctx.setTransform(...place.matrix);
  ctx.drawImage(source, place.sx, place.sy, place.sw, place.sh, 0, 0, place.sw, place.sh);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return {
    image: { width: data.width, height: data.height, data: data.data },
    width: width / region.scale,
    height: height / region.scale,
  };
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

// Os quatro modos do Pincel, com a dica de cada um, moram no modelo desde a
// rodada 41, lote 1 (`BRUSH_MODES`): antes não tinham dica nenhuma.

class MeshPanel implements Panel {
  readonly id = 'malha';
  readonly title = 'Malha e pesos';
  // 'time' entrou em 14/09/2026 (plano "fluxo criar e animar", lote 2): abrir
  // ou fechar uma animação grava `kind: 'time'` (doc/document.ts, o `set
  // animation`) — sem ouvir, a aba ficava com a tela de um modo enquanto já
  // estava no outro, e o aviso de pose de repouso (`MESH_REST_POSE_NOTICE`)
  // mentia até a próxima seleção mudar. Achado conferindo na tela, não lendo
  // código: o aviso não sumia ao voltar para Montagem.
  readonly listensTo = ['file', 'structure', 'transform', 'selection', 'time'] as const;

  private doc: EditorDoc | null = null;
  private body: HTMLElement | null = null;
  private note = '';
  /** A malha de que a nota fala — rodada 17, L2: escolher outra imagem apaga a nota. */
  private noteFor = '';
  /** A ferramenta do último desenho da aba: quando os Pesos entram, a seção vem à vista (L5). */
  private lastTool = '';
  /** O Pincel acabou de ser aberto pela mão: o próximo desenho o traz ao alto (L5). */
  private trazerPincel = false;
  /** Fechar o Ligar acabou de repartir os pesos (S1): o rodapé é dele. */
  private repartiu = false;
  /** Origem escolhida em "Usar a forma de outra malha", como `pele/anexo`. */
  private linkChoice = '';
  private stopBrush: (() => void) | null = null;
  private stopBind: (() => void) | null = null;
  /** Item 4.2: a aba ouve o modo Criar vértice, para o botão acender junto. */
  private stopCreateVertex: (() => void) | null = null;
  /** Rodada 17, L1a e L5: a aba segue a ferramenta na mão (o Pincel e a seção Pesos). */
  private stopTool: (() => void) | null = null;

  mount(doc: EditorDoc, host: HTMLElement): void {
    ensureStylesheet();
    ensureMeshStylesheet();
    this.doc = doc;
    clear(host);
    // QA da noite (04/11): o clique do mouse num botão de barra não leva o foco.
    barButtonsKeepNoFocus(host);
    host.classList.add('painel');
    // `malha-corpo` aperta o preenchimento de baixo de `.painel-corpo` (16px,
    // pensado para uma lista) — prova de 1280×720, 14/09/2026.
    const body = el('div', 'painel-corpo malha-corpo');
    host.append(body);
    this.body = body;
    this.stopBrush = onBrushChange(() => this.render());
    // Rodada 41, lote 4 (S1): fechar o Ligar com dois ossos e um sem peso
    // reparte os pesos sozinho, como o Spine na primeira ligação.
    this.stopBind = onBindModeChange((open) => {
      if (!open) this.afterBindClosed();
      this.render();
    });
    this.stopCreateVertex = onCreateVertexModeChange(() => this.render());
    this.stopTool = onActiveToolChange(() => this.render());
    this.render();
  }

  refresh(_change: DocChange): void {
    this.render();
  }

  unmount(): void {
    this.stopBrush?.();
    this.stopBrush = null;
    this.stopBind?.();
    this.stopBind = null;
    this.stopCreateVertex?.();
    this.stopCreateVertex = null;
    this.stopTool?.();
    this.stopTool = null;
    setBindMode(false);
    setCreateVertexMode(false);
    this.doc = null;
    this.body = null;
  }

  // -------------------------------------------------------------------------
  // Drawing the panel
  // -------------------------------------------------------------------------

  private render(): void {
    const body = this.body;
    const doc = this.doc;
    if (body === null || doc === null) return;
    // The panel is rebuilt on every change, and the list of bones is long. Put
    // the scroll back where it was, or clicking a bone near the bottom would
    // throw the list to the top and the next click would land on the wrong row.
    const scroller = this.scroller();
    const scrollTop = scroller?.scrollTop ?? 0;
    // Rodada 47, lote 4: a barrinha do Pincel mexida pelo teclado continua com o foco.
    const voltarFoco = lembrarFoco(body);
    queueMicrotask(() => voltarFoco());
    clear(body);

    // Lote 65: a ordem do plano "painéis que cabem" — o de todo dia primeiro,
    // a malha ligada (avançada) no fim, dobrada. Quem manda na ordem é o
    // `meshPanelSections`, puro.
    const view = this.currentView(doc);
    if (this.note !== '' && this.viewKey(doc) !== this.noteFor) this.note = '';
    // Lote 69, buraco 6: a malha escolhida oferece o raio do pincel. Cala para
    // sempre assim que o Humberto move o controle.
    if (view !== null) suggestRadius(initialRadius(view.geometry));
    // Sem malha na mão não há o que ligar: o modo fecha sozinho, senão o
    // próximo clique num osso ligaria ele a uma malha que já não está lá.
    if (view === null && bindModeOpen()) setBindMode(false);
    if (view === null && createVertexModeOpen()) setCreateVertexMode(false);
    // Item 2.3 do plano "fluxo criar e animar" (14/09/2026): a ferramenta
    // ficou na mão em Animando, e quem decide para onde cada gesto escreve é
    // ELA, não mais um modo que a esconde. Esta linha diz isso, sempre no
    // topo, enquanto há uma animação aberta — antes de qualquer botão.
    if (doc.animation !== null) {
      // Rodada 41, lote 4: numa linha; a frase inteira na dica.
      const recado = el('p', 'malha-recado malha-recado-curto', MESH_REST_POSE_SHORT);
      recado.title = MESH_REST_POSE_NOTICE;
      body.append(recado);
    }
    const secoes: Record<MeshSectionId, () => HTMLElement | null> = {
      desenho: () => this.buildTarget(doc),
      forma: () => (view === null ? this.buildRegionShape(doc) : this.buildShapeSection(doc, view)),
      ossos: () => (view === null ? null : this.buildBoneSection(doc, view)),
      pesos: () => (view === null ? null : this.buildWeightSection(doc, view)),
      pincel: () => (view === null ? null : this.buildBrushSection(doc)),
      ligada: () => this.buildLinkSection(doc),
    };
    // Rodada 47, lote 5 (R11): Forma, Ossos e Pesos dobram; abre a da ferramenta.
    const ferramentaAgora = getActiveToolId();
    if (ferramentaAgora !== this.dobrasDaFerramenta) { this.dobrasDaMao = {}; this.dobrasDaFerramenta = ferramentaAgora; }
    const abertas = meshFoldsOpen(ferramentaAgora, this.dobrasDaMao, bindModeOpen());
    for (const secao of meshPanelSections()) {
      const node = secoes[secao.id]();
      if (node === null) continue;
      if ((MESH_FOLDS as readonly string[]).includes(secao.id)) this.dobrar(node, secao.id as MeshFold, abertas[secao.id as MeshFold]);
      body.append(node);
    }
    if (this.note !== '') {
      body.append(el('p', 'malha-recado', this.note));
    }
    if (scroller !== null && scrollTop > 0) scroller.scrollTop = scrollTop;
    // Rodada 17, L5: a ferramenta Pesos acabou de entrar na mão (Pesos
    // automáticos, o Pincel, a tecla G): a seção Pesos vem para o alto da
    // aba. Ela morava abaixo da dobra, e só rolando se achava. Uma vez por
    // entrada: depois disso a rolagem é dele.
    const ferramenta = getActiveToolId();
    if (ferramenta === 'weights' && this.lastTool !== 'weights' && !this.trazerPincel) {
      const pesos = body.querySelector('.malha-secao-pesos');
      if (pesos instanceof HTMLElement && typeof pesos.scrollIntoView === 'function') {
        pesos.scrollIntoView({ block: 'start' });
      }
    }
    this.lastTool = ferramenta;
    if (this.trazerPincel) this.bringBrushIntoView();
  }

  /** O que a mão abriu ou fechou, até a ferramenta mudar — Rodada 47, lote 5. */
  private dobrasDaMao: Partial<Record<MeshFold, boolean>> = {};
  private dobrasDaFerramenta = '';

  /** O título da seção vira o botão da dobra; dobrada, só ele fica à vista. */
  private dobrar(node: HTMLElement, id: MeshFold, aberta: boolean): void {
    const titulo = node.querySelector(':scope > .malha-secao-titulo') as HTMLElement | null;
    if (titulo === null) return;
    node.classList.add('malha-dobra');
    node.classList.toggle('is-dobrada', !aberta);
    titulo.setAttribute('role', 'button');
    titulo.tabIndex = 0;
    titulo.setAttribute('aria-expanded', String(aberta));
    // A dica que o título já tinha (a conta dos vértices da Forma) fica, depois do gesto.
    const antes = titulo.title;
    const gesto = aberta ? `Dobrar: ${titulo.textContent ?? ''}` : `Abrir: ${titulo.textContent ?? ''}`;
    titulo.title = antes === '' ? gesto : `${gesto}. ${antes}`;
    const virar = (): void => {
      this.dobrasDaMao = { ...this.dobrasDaMao, [id]: !aberta };
      this.render();
    };
    titulo.addEventListener('click', virar);
    titulo.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      event.stopPropagation();
      virar();
    });
  }

  /** O Pincel aberto pela mão, no alto da aba — rodada 17, L5. Uma vez por clique. */
  private bringBrushIntoView(): void {
    if (!this.trazerPincel) return;
    const pincel = this.body?.querySelector('.malha-secao-pincel') ?? null;
    if (!(pincel instanceof HTMLElement)) return;
    this.trazerPincel = false;
    if (typeof pincel.scrollIntoView === 'function') pincel.scrollIntoView({ block: 'start' });
  }



  /**
   * The box that actually scrolls. Which one it is depends on the stylesheet —
   * the panel's own body, or the frame the shell wraps it in — so it is found
   * by asking who has something to scroll, and never guessed from a class.
   */
  private scroller(): HTMLElement | null {
    const body = this.body;
    if (body === null) return null;
    if (body.scrollHeight > body.clientHeight) return body;
    const host = body.parentElement;
    if (host !== null && host.scrollHeight > host.clientHeight) return host;
    return body;
  }

  /** The mesh the panel works on, or `null`. */
  private currentView(doc: EditorDoc): MeshView | null {
    const ref = selectedMesh(doc);
    return ref === null ? null : readMesh(doc, ref);
  }

  private buildTarget(doc: EditorDoc): HTMLElement {
    const section = el('div', 'malha-secao');
    // Rodada 47, lote 6: "Desenho", e o nome ao lado ("Desenho: face"), numa linha.
    section.append(el('h3', 'malha-secao-titulo', 'Desenho'));
    const picked = doc.selection.attachments[0];
    const slot = picked?.slot ?? doc.selection.slots[0] ?? null;
    const name = picked?.attachment
      ?? (slot === null ? null : (doc.file.slots ?? []).find((s) => s.name === slot)?.attachment ?? null);

    if (slot === null || name === null || typeof name !== 'string') {
      section.append(el('p', 'malha-alvo-fraco', 'Escolha um desenho na árvore ou na tela.'));
      return section;
    }
    // Slot e anexo quase sempre têm o mesmo nome — duas linhas para dizer uma
    // coisa só. Uma linha; os dois nomes, quando diferem, vão na dica.
    // Rodada 47, lote 6 (nota 3 do doc 87): o nome na MESMA linha do título —
    // "Desenho escolhido: face" —, 30 px a menos numa aba que rolava.
    const alvo = el('span', 'malha-alvo malha-alvo-na-linha', slot === name ? name : `${name} (slot ${slot})`);
    alvo.title = `Slot ${slot}, anexo ${name}`;
    const titulo = section.querySelector('.malha-secao-titulo');
    if (titulo !== null) { titulo.append(': ', alvo); } else section.append(alvo);

    const found = findAttachment(doc.file, slot, name);
    // Lote 65: o Virar malha foi para a seção Forma (`buildRegionShape`).
    // Rodada 41, lote 1: o tipo é dito pelo nome de gente (`attachmentKindLine`),
    // e o anexo que sumiu (desfazer o Usar forma) pede outro desenho.
    const def = found?.def as { type?: string; parent?: string } | undefined;
    const linha = attachmentKindLine(found === null || found === undefined ? null : (def?.type ?? 'region'), def?.parent);
    if (linha !== null) section.append(el('p', 'malha-alvo-fraco', linha));
    return section;
  }

  /**
   * A Forma de uma imagem inteira — lote 65. O plano põe o **Virar malha** na
   * seção Forma, junto de Gerar automática e Traçar contorno, que só aparecem
   * depois que o desenho já é malha. `null` quando o escolhido não é imagem.
   */
  private buildRegionShape(doc: EditorDoc): HTMLElement | null {
    const picked = doc.selection.attachments[0];
    const slot = picked?.slot ?? doc.selection.slots[0] ?? null;
    const name = picked?.attachment
      ?? (slot === null ? null : (doc.file.slots ?? []).find((s) => s.name === slot)?.attachment ?? null);
    if (slot === null || typeof name !== 'string') return null;
    if (findAttachment(doc.file, slot, name)?.def.type !== 'region') return null;
    const section = el('div', 'malha-secao');
    section.append(el('h3', 'malha-secao-titulo', 'Forma'));
    const row = el('div', 'malha-botoes');
    const virar = iconButton('mesh', 'Virar malha', () => this.regionToMesh(doc, slot, name));
    virar.title = 'É uma imagem inteira: vire malha para editar a forma';
    row.append(virar);
    section.append(row);
    return section;
  }

  /** O slot em que o painel trabalha: o do anexo escolhido, ou o escolhido. */
  private currentSlot(doc: EditorDoc): string | null {
    return doc.selection.attachments[0]?.slot ?? doc.selection.slots[0] ?? null;
  }

  /**
   * "Usar a forma de outra malha" — a malha ligada de §7.5, que o formato tem
   * e o runtime lê desde sempre, e que até agora só se conseguia escrevendo o
   * JSON à mão.
   *
   * A lista traz as malhas DO MESMO SLOT, em qualquer pele, porque é o que
   * §7.5 permite: a geometria está no espaço do osso do slot, e os mesmos
   * números em outro slot desenhariam a forma em outro lugar. Nada é copiado —
   * o arquivo ganha três campos e o runtime aponta para os mesmos arrays.
   */
  private buildLinkSection(doc: EditorDoc): HTMLElement {
    // Lote 65: avançada, no fim e dobrada. O título abre e fecha; a frase é
    // curta, e a explicação inteira está na dica do título.
    const section = el('details', 'malha-secao malha-avancado') as HTMLDetailsElement;
    section.open = linkOpen;
    section.addEventListener('toggle', () => { linkOpen = section.open; });
    const titulo = el('summary', 'malha-secao-titulo', 'Avançado: malha ligada');
    titulo.title = 'Uma malha ligada empresta a forma de outra malha do mesmo slot e troca só a imagem';
    section.append(titulo);

    const slot = this.currentSlot(doc);
    const problem = whyNotLink(doc.file, slot);
    if (slot === null || problem !== null) {
      section.append(el('p', 'malha-alvo-fraco', problem ?? 'Escolha um slot.'));
      return section;
    }

    const parents = linkedMeshParents(doc.file, slot);
    const row = el('div', 'malha-linha');
    row.append(el('span', 'malha-rotulo', 'Malha de origem'));
    const select = el('select', 'prop-selecao') as HTMLSelectElement;
    select.setAttribute('aria-label', 'Malha de origem');
    select.title = 'Malha de origem: a forma que a malha ligada vai usar. Escolher a própria malha cria uma gêmea dela, com outra imagem';
    for (const parent of parents) {
      // Lote 65: nome comprido corta com reticências; o inteiro vai na dica.
      const rotulo = labelFor(parent.label);
      const option = el('option', undefined, rotulo.text);
      option.title = rotulo.title;
      option.value = `${parent.skin}/${parent.attachment}`;
      select.append(option);
    }
    if (parents.some((p) => `${p.skin}/${p.attachment}` === this.linkChoice)) {
      select.value = this.linkChoice;
    } else {
      this.linkChoice = select.value;
    }
    select.addEventListener('change', () => { this.linkChoice = select.value; });
    row.append(select);
    section.append(row);

    const buttons = el('div', 'malha-botoes');
    const usar = iconButton('mesh-borrow', 'Usar forma', () => this.link(doc, slot, parents, select.value));
    usar.title = 'Usar a forma da malha escolhida acima';
    buttons.append(usar);
    section.append(buttons);
    return section;
  }

  /** Cria a malha ligada e diz na tela o que saiu. */
  private link(
    doc: EditorDoc, slot: string, parents: readonly LinkedMeshParent[], choice: string,
  ): void {
    const parent = parents.find((p) => `${p.skin}/${p.attachment}` === choice) ?? parents[0];
    if (parent === undefined) return;
    try {
      const result = linkMesh(doc, slot, parent);
      doc.select({
        ...doc.selection,
        slots: [slot],
        attachments: [{ slot, attachment: result.name }],
        vertices: [],
      });
      this.say(linkedMeshLine(result));
      // Rodada 41, lote 1: o rodapé ficava mudo ("Arquivo não salvo.").
      doc.notice(linkedMeshLine(result));
    } catch (error) {
      this.say(error instanceof Error ? error.message : String(error));
    }
  }

  private buildShapeSection(doc: EditorDoc, view: MeshView): HTMLElement {
    const section = el('div', 'malha-secao');
    const count = view.geometry.vertices.length >> 1;
    const triangles = view.geometry.triangles.length / 3;
    // A contagem de vértices/triângulos vira dica do título: não é um botão,
    // é explicação — e explicação mora na dica, não numa linha própria.
    const titulo = el('h3', 'malha-secao-titulo', 'Forma');
    titulo.title = `${count} vértices, ${triangles} triângulos, contorno com ${view.geometry.hull}`;
    section.append(titulo);
    section.append(this.outsetField());

    const botoes = el('div', 'malha-botoes');
    if (view.ref.kind === 'mesh') {
      const gerar = iconButton('auto-mesh', 'Gerar automática', () => this.autoMesh(doc, view, false));
      const tracar = iconButton('trace-outline', 'Traçar contorno', () => this.autoMesh(doc, view, true));
      gerar.title = 'Gerar automática: contorno e miolo, pela silhueta da imagem';
      tracar.title = 'Traçar contorno: só o contorno, sem vértice por dentro';
      botoes.append(gerar, tracar);
    }
    section.append(botoes);

    // Criar vértice, aresta e apagar vértice existiam SÓ como gesto ou tecla
    // (Ctrl+clique, L, K, Delete). O próprio projeto escreveu a regra em
    // ui/menus.ts: "um item que só existe como atalho é um item que algumas
    // pessoas nunca encontram". Os botões chamam exatamente o mesmo que o
    // gesto e as teclas; a tecla vai na dica, o nome fica curto.
    //
    // Item da rodada de 13/09/2026 (caber na altura): "Criar aresta" e
    // "Apagar aresta" eram DOIS botões — quatro nesta fileira não cabiam de
    // jeito nenhum numa coluna estreita. Viraram UM: o mesmo par de vértices
    // já tem aresta entre eles ou não tem, então o botão já sabe qual dos
    // dois fazer, e troca de nome e ícone sozinho. `L` e `K` continuam dois
    // gestos — quem decora a tecla não perde nada.
    const escolhidos = [...doc.selection.vertices];
    const par = escolhidos.length === 2 ? (escolhidos as [number, number]) : null;
    const temAresta = par !== null && hasEdge(view.geometry.edges, par[0], par[1]);
    const criarVertice = iconButton('plus', 'Criar vértice', () => this.toggleCreateVertex(doc));
    const aresta = iconButton(
      temAresta ? 'edge-remove' : 'edge-add',
      temAresta ? 'Apagar aresta' : 'Criar aresta',
      () => this.edge(doc, view, !temAresta),
    );
    const apagarVertice = iconButton('trash', 'Apagar vértice', () => this.deleteVertices(doc, view));
    const modoCriar = createVertexModeOpen();
    criarVertice.classList.add('malha-ligar');
    criarVertice.setAttribute('aria-pressed', String(modoCriar));
    criarVertice.title = modoCriar
      ? 'Clique na malha para criar vértices. Criar vértice de novo termina'
      : 'Liga o modo: clique na malha cria um vértice (Ctrl + clique também cria, sem o modo)';
    aresta.disabled = par === null;
    apagarVertice.disabled = escolhidos.length === 0;
    aresta.title = aresta.disabled
      ? 'Criar aresta: escolha dois vértices primeiro (clique e Shift + clique, ou a caixa), depois aperte aqui ou L'
      : (temAresta
        ? 'Apagar aresta (K): tira a ligação entre os dois vértices escolhidos'
        : 'Criar aresta (L): liga os dois vértices escolhidos; a malha dobra ao longo dela');
    apagarVertice.title = `Apagar vértice: ${MESH_BUTTON_TIPS.apagarVertice}`;
    const vertices = el('div', 'malha-botoes');
    vertices.append(criarVertice, aresta, apagarVertice);
    section.append(vertices);
    return section;
  }

  /** "Criar aresta" / "Apagar aresta" — o mesmo que as teclas L e K. */
  private edge(doc: EditorDoc, view: MeshView, criar: boolean): void {
    const chosen = [...doc.selection.vertices].sort((a, b) => b - a);
    if (chosen.length !== 2) return;
    const [a, b] = chosen as [number, number];
    const geometry = criar
      ? addEdge(view.geometry, a, b)
      : removeEdge(view.geometry, a, b);
    writeGeometry(doc, view, geometry, criar ? 'Criar aresta' : 'Apagar aresta');
  }

  /** O botão "Criar vértice": liga o modo, ou fecha. */
  private toggleCreateVertex(doc: EditorDoc): void {
    doc.notice(toggleCreateVertexMode() ? CREATE_VERTEX_NOTICE : 'Modo de criar vértice fechado.');
  }

  /**
   * O campo "Afastamento" (item 4.1): o número que a Forma usa a seguir. Nas
   * classes `malha-linha`/`malha-campo` de sempre — o `row` de `dom.ts` é de
   * `properties.css`, que esta aba não carrega. Rótulo curto: "do contorno
   * (px)" vira dica, não texto — era a fatia de três linhas para um campo só.
   */
  private outsetField(): HTMLElement {
    const linha = el('div', 'malha-linha');
    // Rodada 47, lote 3 (R2 e R7 do doc 68): a unidade depois da caixa, e o número da casa:
    // conta, setas, arrasto pelo rótulo, e "abc" fala no rodapé.
    const rotulo = el('span', 'malha-rotulo', 'Afastamento');
    linha.append(rotulo);
    // Rodada 41, lote 4: o campo curto fica na linha do rótulo (era uma linha
    // para o rótulo e outra para a caixa, numa coluna estreita).
    const campo = el('div', 'malha-campo malha-campo-curto');
    const numero = campoNumero({
      nome: 'Afastamento', unidade: 'px', min: 0, max: 30, passo: 0.5, id: 'malha-afastamento',
      dica: 'Afastamento do contorno gerado, para fora, em px da imagem, de 0 a 30 px. 0 desliga',
      ler: () => outlineOutset,
      gravar: (v) => { outlineOutset = v; },
      falar: (frase) => this.doc?.notice(frase),
    });
    numero.ligarRotulo(rotulo);
    campo.append(numero.caixa);
    linha.append(campo);
    return linha;
  }

  /** "Apagar vértice" — o mesmo que a tecla Delete. */
  private deleteVertices(doc: EditorDoc, view: MeshView): void {
    const chosen = [...doc.selection.vertices].sort((a, b) => b - a);
    if (chosen.length === 0) return;
    let refused: string | null = null;
    for (const index of chosen) refused = removeMeshVertex(doc, view, index) ?? refused;
    if (refused !== null) {
      this.say(refused);
      return;
    }
    doc.select({ ...doc.selection, vertices: [] });
    // Rodada 41, lote 1: o botão não dizia nada; agora diz o mesmo que a tecla.
    doc.notice(`${chosen.length === 1 ? '1 vértice apagado' : `${chosen.length} vértices apagados`}${wentToBase(doc)}`);
  }

  private buildWeightSection(doc: EditorDoc, view: MeshView): HTMLElement {
    const section = el('div', 'malha-secao malha-secao-pesos');
    // Rodada 41, lote 4: o "Testar: gire um osso…" eram três linhas sob os
    // botões; foi para a dica do título.
    const tituloPesos = el('h3', 'malha-secao-titulo', 'Pesos');
    if (view.weighted) tituloPesos.title = WEIGHTS_TEST_HINT;
    section.append(tituloPesos);
    const botoes = el('div', 'malha-botoes');
    const auto = iconButton('auto-weights', 'Pesos automáticos', () => this.autoWeights(doc, view));
    auto.title = influencingBones(tableOf(asMeshDef(view.ref.def))).length > 0
      ? 'Reparte o peso só entre os ossos da lista Ossos que influenciam'
      : 'Lista vazia: reparte entre todos os ossos com comprimento. Para escolher, aperte Ligar ossos e clique nos ossos';
    botoes.append(auto);
    // Rodada 41, lote 1: a dica repetia o nome; agora é a frase do menu.
    const suavizar = iconButton('smooth', 'Suavizar tudo', () => this.smooth(doc, view));
    suavizar.title = `Suavizar tudo: ${MESH_BUTTON_TIPS.suavizar}`;
    const podar = iconButton('cut', 'Podar', () => this.prune(doc, view));
    podar.title = `Podar: ${MESH_BUTTON_TIPS.podar}`;
    botoes.append(suavizar, podar);
    // **Chavear pesos** — F9, spec 9.6; degrau 7, tarefa 7.6. Pintar peso
    // continua indo para a base, animação aberta ou não (A5): peso é gesto de
    // estrutura na cabeça de quem pinta, e gravar chave sozinho encheria a
    // animação de chaves que ninguém pediu. Quem quer o peso animado aperta
    // aqui. Ícone, com o nome e o que ele faz na dica (regra 12).
    if (view.weighted) {
      const chavear = iconButton('key-weights', WEIGHTS_KEY_LABEL, () => this.say(keyWeights(doc, view)));
      chavear.title = doc.animation === null
        ? 'Chavear pesos: grava os pesos de agora como chave. Precisa de uma animação aberta'
        : `Chavear pesos: grava os pesos de agora como chave em ${doc.animation}. Pintar continua indo para a base`;
      botoes.append(chavear);
    }
    if (view.weighted) {
      const tirar = iconButton('trash', 'Tirar pesos', () => this.dropWeights(doc, view));
      tirar.title = `Tirar pesos: ${MESH_BUTTON_TIPS.tirarPesos}`;
      botoes.append(tirar);
    }
    section.append(botoes);
    // Rodada 17, L11b: o passo "testar", e como voltar — desde a rodada 41,
    // lote 4, na dica do título Pesos (era três linhas aqui).
    return section;
  }

  /**
   * "Pincel" é ajuste fino — pedido do planejador, 13/09/2026 (a aba não
   * cabia na altura mesmo depois do lote dos nomes: 961 px de sobra em
   * 1440×900, e o Pincel sozinho pesava 270 px). Dobrada por padrão, mas
   * abre sozinha assim que a ferramenta Pesos entra na mão — é a hora em que
   * o raio e o modo importam — e, a partir do primeiro clique do Humberto no
   * título, fica do jeito que ELE deixou, sem abrir nem fechar sozinha de novo.
   */
  private buildBrushSection(doc: EditorDoc): HTMLElement {
    const brush = getBrush();
    const section = el('details', 'malha-secao malha-secao-pincel') as HTMLDetailsElement;
    section.open = pincelOpen ?? getActiveToolId() === 'weights';
    // Rodada 17, L1a: o clique NO TÍTULO é a mão dele. O `toggle` dispara
    // também quando o código abre a seção (a ferramenta Pesos na mão), e
    // gravava isso como se fosse a escolha dele.
    const titulo = el('summary', 'malha-secao-titulo', 'Pincel');
    // Conferência da v31.6: abrir o Pincel liga a ferramenta Pesos de propósito
    // (como o Spine: pintar peso é a ferramenta Weights). A dica diz.
    titulo.title = 'Pincel: pinta o peso do osso escolhido na malha. Abrir liga a ferramenta Pesos (G), como no Spine';
    titulo.addEventListener('click', () => {
      const abre = !section.open;
      pincelOpen = abre;
      // Rodada 17, L5 (a segunda volta): aberto pela mão, o Pincel vem para o
      // alto da aba — ele ficava abaixo da dobra, embaixo dos Pesos.
      if (abre) this.trazerPincel = true;
      // Abrir o Pincel põe o pincel na mão, e o rodapé diz.
      if (abre && shouldTakeWeightsTool(getActiveToolId())) {
        setActiveTool('weights', doc);
        doc.notice(BRUSH_TOOL_NOTICE);
      }
      // A ferramenta já estava na mão: a aba não se redesenha; rola aqui,
      // depois que o navegador abrir a seção.
      if (abre) setTimeout(() => this.bringBrushIntoView(), 0);
    });
    section.append(titulo);

    const modes = el('div', 'malha-botoes');
    for (const mode of BRUSH_MODES) {
      const node = button(mode.label, () => setBrush({ mode: mode.id }));
      node.title = mode.tip;
      node.setAttribute('aria-pressed', String(brush.mode === mode.id));
      modes.append(node);
    }
    section.append(modes);
    // Rodada 41, lote 1: "Raio 11" e "Força 0,5" não diziam o que eram. A tela
    // fala em px e em %, com a faixa na dica; o pincel continua em 0..1.
    section.append(this.brushField(BRUSH_FIELDS.radius, brush.radius, (value) => setBrush({ radius: value })));
    section.append(this.brushField(BRUSH_FIELDS.strength, brush.strength, (value) => setBrush({ strength: value })));
    return section;
  }

  /** Um número do Pincel na unidade da tela (`BrushField`): barra e caixa, com dica. */
  private brushField(field: BrushField, value: number, onChange: (value: number) => void): HTMLElement {
    const row = this.slider(field.label, field.toScreen(value), field.min, field.max, field.step,
      (shown) => onChange(field.fromScreen(shown)), field.unit, field.tip);
    // Conferência da v31.6: a dica valia só na palavra; agora vale na barra e na caixa.
    row.title = field.tip;
    for (const node of row.querySelectorAll('input')) {
      node.setAttribute('aria-label', field.tip);
      node.title = field.tip;
    }
    return row;
  }

  /** One labelled row: a slider and a number field that show the same value. */
  private slider(
    label: string, value: number, min: number, max: number, step: number,
    onChange: (value: number) => void, unidade?: string, dica?: string,
  ): HTMLElement {
    const row = el('div', 'malha-linha');
    const rotulo = el('span', 'malha-rotulo', label);
    row.append(rotulo);
    const field = el('div', 'malha-campo');
    const range = document.createElement('input');
    range.type = 'range';
    range.dataset.foco = `malha-barra-${label}`;
    range.min = String(min);
    range.max = String(max);
    range.step = String(step);
    range.value = String(value);
    range.setAttribute('aria-label', label);
    // Rodada 47, lote 3 (R2 e R7 do doc 68): a caixa é o número da casa, com a unidade depois.
    let atual = value;
    const numero = campoNumero({
      nome: label, unidade, min, max, passo: step, dica: dica ?? label,
      id: `malha-${label.toLowerCase()}`,
      ler: () => atual,
      gravar: (v) => { atual = v; range.value = String(v); onChange(v); },
      falar: (frase) => this.doc?.notice(frase),
    });
    numero.ligarRotulo(rotulo);
    range.addEventListener('input', () => {
      atual = Number(range.value);
      numero.input.value = range.value;
      onChange(atual);
    });
    field.append(range, numero.caixa);
    row.append(field);
    return row;
  }

  /**
   * A lista **Ossos que influenciam** — refeita no lote 69, na ordem da view
   * Weights do Spine: primeiro o botão **Ligar**, que abre o modo, depois a
   * lista, cada osso com a **bolinha da cor** que ele tem na cena, o quanto
   * puxa, Travar e tirar.
   *
   * O que faltava (buraco 1): não havia botão nenhum para LIGAR um osso. Só o
   * P segurado, com a ferramenta Selecionar na mão, gesto que nenhum dos três
   * programas tem. Nos três, é um botão que abre um modo e cada clique num
   * osso liga ou tira.
   */
  private buildBoneSection(doc: EditorDoc, view: MeshView): HTMLElement {
    const section = el('div', 'malha-secao');
    section.append(el('h3', 'malha-secao-titulo', 'Ossos que influenciam'));
    const table = tableOf(asMeshDef(view.ref.def));
    const bones = influencingBones(table);
    const painted = paintedBone(doc);
    const aberto = bindModeOpen();

    const acoes = el('div', 'malha-botoes');
    const ligar = iconButton('link', 'Ligar ossos', () => this.bind(doc));
    ligar.classList.add('malha-ligar');
    ligar.setAttribute('aria-pressed', String(aberto));
    ligar.title = aberto
      ? 'Clique nos ossos que puxam esta malha. Ligar ossos de novo termina'
      : 'Abre o modo de ligar ossos: clique nos ossos que puxam esta malha';
    acoes.append(ligar);
    section.append(acoes);

    if (aberto) {
      section.append(el('p', 'malha-recado', BIND_NOTICE));
    } else if (bones.length === 0) {
      section.append(el('p', 'malha-alvo-fraco', 'Nenhum osso ligado ainda.'));
    }

    // Rodada 41, lote 1: o número de cada osso era a média da malha, e não dizia.
    // Lote 2: com vértices escolhidos, o número é o DELES, e vira campo exato.
    const escolhidos = doc.selection.vertices.filter((v) => v >= 0 && v < table.length);
    if (bones.length > 0) section.append(el('p', 'malha-dica', boneListCaption(escolhidos.length)));
    const list = el('ul', 'malha-ossos');
    const names = doc.file.bones ?? [];
    const shown = new Set(bones);
    if (painted >= 0) shown.add(painted);
    for (const index of [...shown].sort((a, b) => a - b)) {
      const bone = names[index];
      if (bone === undefined) continue;
      const item = el('li', 'malha-osso');
      item.setAttribute('aria-selected', String(index === painted));
      // Lote 69: a bolinha da cor, a mesma da fatia dele na pizza da cena.
      const cor = el('span', 'malha-osso-cor');
      cor.style.background = boneColor(doc.file, index);
      cor.setAttribute('aria-hidden', 'true');
      const pick = button(bone.name, () => this.selectBone(doc, bone.name), 'malha-osso-nome');
      // Conferência da v31.6 (doc `46`): dica com a frase inteira, não só o nome.
      pick.title = `Pintar ${bone.name}: escolhe este osso para o pincel; a pincelada na malha dá peso a ele`;
      pick.setAttribute('aria-pressed', String(index === painted));
      const share = averageWeight(table, index);
      let count: HTMLElement = el('span', 'malha-osso-conta', `${Math.round(share * 100)}%`);
      count.title = `Peso médio de ${bone.name} na malha inteira: ${Math.round(share * 100)} %`;
      if (escolhidos.length > 0 && bones.includes(index)) {
        count = this.exactField(doc, view, table, escolhidos, index, bone.name);
      }
      // Rodada 41, lote 1: a palavra "Travar" ao lado de cada osso espremia o
      // nome até "ca…" — cape1 e cape2 ficavam iguais (doc `43`, foto `25`). A
      // linha de cima diz o que a caixa faz; a frase inteira vai na dica.
      const lock = el('label', 'malha-trava');
      lock.title = lockTip(bone.name);
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.checked = isLocked(index);
      box.setAttribute('aria-label', lockTip(bone.name));
      box.addEventListener('change', () => setLocked(index, box.checked));
      lock.append(box);
      item.append(cor, pick, count, lock);
      // Lote 63: tirar da lista é o mesmo comando do botão Ligar.
      if (bones.includes(index)) {
        const tirar = iconButton('trash', `Tirar ${bone.name} da malha`, () => {
          doc.notice(toggleMeshBone(doc, bone.name, view.ref.slot, view.ref.attachment));
        });
        tirar.title = `Tirar ${bone.name} da malha: ela para de seguir este osso, e o peso dele vai para os outros`;
        item.append(tirar);
      }
      list.append(item);
    }
    section.append(list);
    return section;
  }

  /**
   * O peso exato de um osso nos vértices escolhidos — rodada 41, lote 2. O
   * campo **Weight** do Spine e o slider do DragonBones: digita o %, o resto
   * se reparte entre os outros ossos na proporção que tinham; o travado não
   * muda. Vários vértices que discordam mostram o campo vazio, "vários".
   */
  private exactField(
    doc: EditorDoc, view: MeshView, table: WeightTable, escolhidos: number[], index: number, nome: string,
  ): HTMLElement {
    const { value, mixed } = weightAt(table, escolhidos, index);
    const quem = escolhidos.length === 1 ? 'no vértice escolhido' : `nos ${escolhidos.length} vértices escolhidos`;
    // Rodada 47, lote 3 (R2 e R7 do doc 68): o número da casa (conta, setas, "abc" fala), em %.
    const numero = campoNumero({
      nome: `Peso de ${nome}`, unidade: '%', min: 0, max: 100, passo: 5, id: `malha-peso-${nome}`,
      dica: `Peso de ${nome} ${quem}, em %, de 0 a 100. O resto vai para os outros ossos; o travado não muda`,
      ler: () => Math.round(value * 100),
      gravar: (pct) => {
        const out = setWeight(table, escolhidos, index, pct / 100, new Set(getBrush().locked));
        writeWeightTable(doc, view, out, 'Peso exato');
        doc.notice(`${nome} com ${Math.round(pct)} % ${quem}${wentToBase(doc)}`);
      },
      falar: (frase) => doc.notice(frase),
    });
    numero.input.classList.add('malha-osso-exato');
    if (mixed) { numero.input.value = ''; numero.input.placeholder = 'vários'; }
    return numero.caixa;
  }

  /** Fechou o Ligar: reparte os pesos se algum osso da lista ficou sem nenhum — S1. */
  private afterBindClosed(): void {
    const doc = this.doc;
    if (doc === null) return;
    const view = this.currentView(doc);
    if (view === null) return;
    const table = tableOf(asMeshDef(view.ref.def));
    if (!shouldAutoWeightAfterBind(table)) return;
    this.repartiu = true;
    this.autoWeights(doc, view);
    const depois = this.currentView(doc);
    const novo = depois === null ? table : tableOf(asMeshDef(depois.ref.def));
    doc.notice(bindClosedNotice(influencingBones(novo).length, novo.length));
  }

  /** O botão Ligar: abre o modo, ou fecha. A frase do rodapé é a do plano. */
  private bind(doc: EditorDoc): void {
    // Rodada 41, lote 4: fechar pode repartir os pesos (S1); aí a frase é a dele.
    this.repartiu = false;
    const aberto = toggleBindMode();
    if (aberto) doc.notice(BIND_NOTICE);
    else if (!this.repartiu) doc.notice('Modo de ligar ossos fechado.');
  }

  // -------------------------------------------------------------------------
  // Buttons
  // -------------------------------------------------------------------------

  private say(message: string): void {
    this.note = message;
    this.noteFor = this.doc === null ? '' : this.viewKey(this.doc);
    this.render();
  }

  /**
   * O resultado de um gesto de pesos — rodada 17, L2 + L3: vai para o
   * rodapé (onde se lê) e para a nota da aba; e a ferramenta Pesos entra na
   * mão, para a cena mostrar a pizza de cada vértice.
   */
  private weightsDone(doc: EditorDoc, result: string): void {
    const pegou = shouldTakeWeightsTool(getActiveToolId());
    if (pegou) setActiveTool('weights', doc);
    this.say(result);
    doc.notice(weightsDoneNotice(result, pegou));
  }

  /** Qual malha a nota fala: a nota não segue para outra imagem (L2). */
  private viewKey(doc: EditorDoc): string {
    const picked = doc.selection.attachments[0];
    return picked !== undefined ? `${picked.slot}/${picked.attachment}` : (doc.selection.slots[0] ?? '');
  }

  private selectBone(doc: EditorDoc, name: string): void {
    const current = doc.selection;
    doc.select({
      bones: [name],
      slots: current.slots.slice(),
      attachments: current.attachments.map((entry) => ({ ...entry })),
      constraints: current.constraints.slice(),
      // Rodada 41, lote 2: escolher o osso a pintar não larga os vértices.
      vertices: current.vertices.slice(),
    });
  }

  /**
   * **As doze portas do menu Malha e regras** — rodada 6 (05/10/2026). O menu
   * chama o MESMO método do botão da aba; aqui só se acha a malha e o slot do
   * momento. Quando não dá, o rodapé diz por quê, com a frase de
   * `meshMenuWhy` — a mesma que o item cinza mostra na dica.
   */
  fromMenu(doc: EditorDoc, id: MeshMenuId): void {
    const why = meshMenuWhy(doc, id);
    if (why !== null) { doc.notice(why); return; }
    const view = this.currentView(doc);
    const slot = this.currentSlot(doc);
    switch (id) {
      case 'virar-malha': {
        const alvo = regionOfSelection(doc);
        if (alvo !== null) this.regionToMesh(doc, alvo.slot, alvo.name);
        return;
      }
      case 'criar-vertice': this.toggleCreateVertex(doc); return;
      case 'ligar-ossos': this.bind(doc); return;
      case 'usar-forma-de-outra':
        if (slot !== null) this.link(doc, slot, linkedMeshParents(doc.file, slot), this.linkChoice);
        return;
      default: break;
    }
    if (view === null) return;
    switch (id) {
      case 'malha-automatica': this.autoMesh(doc, view, false); return;
      case 'tracar-contorno': this.autoMesh(doc, view, true); return;
      case 'apagar-vertice': this.deleteVertices(doc, view); return;
      case 'criar-aresta': {
        const par = [...doc.selection.vertices];
        if (par.length === 2) this.edge(doc, view, !hasEdge(view.geometry.edges, par[0]!, par[1]!));
        return;
      }
      case 'pesos-automaticos': this.autoWeights(doc, view); return;
      case 'suavizar-pesos': this.smooth(doc, view); return;
      case 'podar-pesos': this.prune(doc, view); return;
      case 'chavear-pesos': { const frase = keyWeights(doc, view); doc.notice(frase); this.say(frase); return; }
      case 'tirar-pesos': this.dropWeights(doc, view); return;
      default: return;
    }
  }

  /** "Virar malha": the region becomes a mesh with the same four corners. */
  private regionToMesh(doc: EditorDoc, slot: string, name: string): void {
    // M7, degrau 7: a forma é estrutura, e estrutura mora na base do CORPO DO
    // INSTANTE. Ler do arquivo em foco e gravar nele dava, com a virada de
    // corpo aberta, um ponteiro medido num arquivo e aplicado noutro.
    const corpo = corpoDe(doc);
    const found = findAttachment(corpo.file, slot, name);
    if (found === null) return;
    const region = found.def as RegionAttachmentDef;
    if (region.type !== 'region') return;
    const path = region.path ?? name;
    // Lote 63a: o tamanho e o recorte vêm da região do atlas, com a conta do
    // runtime — e não dos pixels da página, que podiam ainda não ter chegado
    // (o tamanho virava 0 e a malha encolhia num ponto).
    const atlas = findAtlasRegion(doc.atlases, path);
    const hasSize = region.width !== undefined && region.width > 0
      && region.height !== undefined && region.height > 0;
    if (atlas === null && !hasSize) {
      this.say(`Não deu: "${path}" não está no atlas, e o desenho não diz o tamanho.`);
      return;
    }
    const mesh = regionToMesh(region, undefined, atlas ?? undefined);
    const pointer = pointerOf('skins', found.skin, 'attachments', slot, name);
    corpo.run(new SetProperties([[pointer, mesh]], {
      label: 'Virar malha', kind: 'structure', mergeable: false,
    }));
    // K11 (P21): a Malha liga sozinha SÓ aqui, na malha que acabou de nascer.
    // O rodapé diz o resultado e o passo seguinte (L4), sem ponto no fim (L13).
    const ligou = shouldAutoPickMeshTool(`${slot}/${name}`, getActiveToolId());
    if (ligou) setActiveTool('mesh', doc);
    doc.notice(`"${name}" virou malha: 4 vértices${wentToBase(doc)}`
      + (ligou ? '. A ferramenta Malha (M) ligou: arraste os quadrados brancos' : ''));
  }

  /** "Gerar automática" and "Traçar contorno". */
  private autoMesh(doc: EditorDoc, view: MeshView, hullOnly: boolean): void {
    // Degrau 7: a Malha passou a pegar caixa, máscara e caminho, e nenhum dos
    // três tem imagem para traçar. Os dois botões não aparecem para eles; a
    // frase existe para quem chegar aqui por outro caminho (regra 21).
    if (view.ref.kind !== 'mesh') {
      this.say('Traçar pela imagem é da malha: caixa, máscara e caminho não têm imagem.');
      return;
    }
    const def = asMeshDef(view.ref.def);
    const path = def.path ?? view.ref.attachment;
    const image = originalImageOf(doc, path);
    if (typeof image === 'string') {
      this.say(`Não deu para traçar: ${image}.`);
      return;
    }
    // Lote 63a: a imagem vem em px da página; o desenho, em px do esqueleto.
    const atlas = findAtlasRegion(doc.atlases, path);
    const scale = atlas !== null && atlas.scale > 0 ? atlas.scale : 1;
    // Conserto de 13/09/2026: "quando aperta pra criar malha o sprite se
    // move" — ver a nota de `autoMeshOptionsFromBox`. O canvas inteiro cai na
    // CAIXA que a malha já ocupa, não num metadado que pode estar velho.
    const box = boundsOf(view.geometry.vertices);
    const posicao = autoMeshOptionsFromBox(box, {
      width: def.width !== undefined && def.width > 0 ? def.width : image.width / scale,
      height: def.height !== undefined && def.height > 0 ? def.height : image.height / scale,
    });
    let geo: MeshGeometry;
    try {
      const options = { ...posicao, outset: outlineOutset };
      geo = hullOnly
        ? traceHullFromImage(image.image, options)
        : autoMeshFromImage(image.image, options);
    } catch (error) {
      this.say(`Não deu para traçar: ${(error as Error).message}.`);
      return;
    }
    // The old weights no longer match the new vertices, so the mesh goes back
    // to having none; "Pesos automáticos" is one button away. O metadado de
    // largura/altura acompanha o canvas usado acima — era a fonte errada da
    // largura, e deixá-lo velho faria a próxima geração errar de novo.
    const pointers: Array<readonly [string, unknown]> = [
      [meshPointer(view.ref, 'vertices'), geo.vertices],
      [meshPointer(view.ref, 'binding'), undefined],
      [meshPointer(view.ref, 'uvs'), geo.uvs],
      [meshPointer(view.ref, 'triangles'), geo.triangles],
      [meshPointer(view.ref, 'hull'), geo.hull],
      [meshPointer(view.ref, 'edges'), undefined],
      [meshPointer(view.ref, 'width'), posicao.width],
      [meshPointer(view.ref, 'height'), posicao.height],
    ];
    // M7, degrau 7, tarefa 7.7: **gerar malha no meio da animação** vai para a
    // base do CORPO DO INSTANTE, e o rodapé diz para qual. Era `doc.run`: com
    // a virada aberta, o ponteiro era medido no corpo do instante e aplicado
    // no arquivo em foco — o desenho errado mudava de forma, calado.
    corpoDe(doc).run(new SetProperties(pointers, {
      label: hullOnly ? 'Traçar contorno' : 'Gerar malha', kind: 'structure', mergeable: false,
    }));
    this.say(`Malha nova: ${geo.vertices.length >> 1} vértices, ${
      geo.triangles.length / 3} triângulos${wentToBase(doc)}${deformWarningFor(doc, view.ref)}.`);
    // Rodada 41, lote 1: o rodapé dizia só o nome do botão ("Gerar malha.").
    doc.notice(shapeDoneNotice(hullOnly, geo.vertices.length >> 1, geo.triangles.length / 3,
      `${wentToBase(doc)}${deformWarningFor(doc, view.ref)}`));
  }

  private autoWeights(doc: EditorDoc, view: MeshView): void {
    // Lote 63: só os ossos da lista; lista vazia, todo osso com comprimento.
    const current = tableOf(asMeshDef(view.ref.def));
    const bones = autoWeightBones(current, view.frames);
    if (bones.length === 0) {
      this.say('Nenhum osso tem comprimento. Dê comprimento aos ossos antes.');
      return;
    }
    let table = autoWeights(restWorldPositions(view), view.frames, { bones });
    // Quem estava na lista continua nela, mesmo que a conta lhe dê 0.
    for (const bone of influencingBones(current)) {
      if (!influencingBones(table).includes(bone)) table = bindBone(table, bone, table.length);
    }
    writeWeightTable(doc, view, table, 'Pesos automáticos');
    this.weightsDone(doc, `Pesos automáticos em ${table.length} vértices.`);
  }

  private smooth(doc: EditorDoc, view: MeshView): void {
    const table = tableOf(asMeshDef(view.ref.def));
    if (table.length === 0) return;
    const smoothed = smoothAll(table, view.geometry.triangles, 0.5, new Set(getBrush().locked));
    writeWeightTable(doc, view, smoothed, 'Suavizar pesos');
    this.weightsDone(doc, 'Pesos suavizados uma vez.');
  }

  private prune(doc: EditorDoc, view: MeshView): void {
    const table = tableOf(asMeshDef(view.ref.def));
    if (table.length === 0) return;
    const pruned = pruneWeights(table, 0.02, new Set(getBrush().locked));
    writeWeightTable(doc, view, pruned, 'Podar pesos');
    this.weightsDone(doc, 'Pesos abaixo de 2% foram apagados.');
  }

  private dropWeights(doc: EditorDoc, view: MeshView): void {
    removeWeights(doc, view);
    this.say('A malha ficou sem pesos, no mesmo lugar.');
  }
}

/**
 * A seção avançada aberta ou dobrada — lote 65. O painel é refeito a cada
 * mudança; sem guardar isto, ela dobraria de novo a cada clique.
 */
let linkOpen = false;

/**
 * O Pincel aberto ou dobrado. `null` é "o Humberto ainda não decidiu": aí
 * quem manda é a ferramenta na mão. Depois do primeiro clique no título vira
 * `true`/`false` e fica assim — nunca mais abre nem fecha sozinho.
 */
let pincelOpen: boolean | null = null;

/** O afastamento do contorno (item 4.1), o número que "Gerar automática" e "Traçar contorno" usam. */
let outlineOutset = DEFAULT_OUTLINE_OUTSET;

/** Average weight a bone has over the whole mesh, `0..1`. */
export function averageWeight(table: WeightTable, bone: number): number {
  if (table.length === 0) return 0;
  let sum = 0;
  for (const vertex of table) sum += vertex.get(bone) ?? 0;
  return sum / table.length;
}

// ---------------------------------------------------------------------------
// O menu Malha e regras — rodada 6 (05/10/2026)
// ---------------------------------------------------------------------------

/** Os ids das doze portas da aba Malha e pesos, na ordem do menu. */
export const MESH_MENU_IDS = [
  'virar-malha', 'malha-automatica', 'tracar-contorno', 'criar-vertice', 'criar-aresta', 'apagar-vertice',
  'usar-forma-de-outra',
  'ligar-ossos', 'pesos-automaticos', 'suavizar-pesos', 'podar-pesos', 'chavear-pesos', 'tirar-pesos',
] as const;
export type MeshMenuId = typeof MESH_MENU_IDS[number];

/** A imagem inteira escolhida (slot e anexo `region`), ou `null`. */
export function regionOfSelection(doc: EditorDoc): { slot: string; name: string } | null {
  const picked = doc.selection.attachments[0];
  const slot = picked?.slot ?? doc.selection.slots[0] ?? null;
  const name = picked?.attachment
    ?? (slot === null ? null : (doc.file.slots ?? []).find((s) => s.name === slot)?.attachment ?? null);
  if (slot === null || typeof name !== 'string') return null;
  return findAttachment(doc.file, slot, name)?.def.type === 'region' ? { slot, name } : null;
}

/** Frases do cinza: a mesma vale na dica do item e no rodapé. */
export const MESH_WHY = Object.freeze({
  imagem: 'Escolha uma imagem inteira primeiro (na cena ou na Árvore): só ela vira malha',
  malha: 'Escolha uma malha primeiro. Uma imagem vira malha em Malha e regras → Malha → Virar malha',
  malhaSo: 'Gerar e traçar valem para malha de imagem; o desenho escolhido é outro tipo de forma',
  vertice: 'Escolha um ou mais vértices na malha primeiro (ferramenta Malha)',
  dois: 'Escolha dois vértices na malha primeiro (ferramenta Malha: clique e Shift + clique, ou a caixa)',
  slot: 'Escolha um slot primeiro',
  semPesos: 'Esta malha ainda não tem pesos: use Pesos automáticos ou Ligar ossos primeiro',
  animacao: 'Abra uma animação primeiro: o peso chaveado vive nela; pintar continua indo para a base',
});

/** Por que a porta `id` não pode agir agora, ou `null`. Puro: lê o documento. */
export function meshMenuWhy(doc: EditorDoc, id: MeshMenuId): string | null {
  if (id === 'virar-malha') return regionOfSelection(doc) === null ? MESH_WHY.imagem : null;
  if (id === 'usar-forma-de-outra') {
    const slot = doc.selection.attachments[0]?.slot ?? doc.selection.slots[0] ?? null;
    return slot === null ? MESH_WHY.slot : whyNotLink(doc.file, slot);
  }
  const ref = selectedMesh(doc);
  const view = ref === null ? null : readMesh(doc, ref);
  if (view === null) return MESH_WHY.malha;
  switch (id) {
    case 'malha-automatica':
    case 'tracar-contorno':
      return view.ref.kind === 'mesh' ? null : MESH_WHY.malhaSo;
    case 'apagar-vertice':
      return doc.selection.vertices.length === 0 ? MESH_WHY.vertice : null;
    case 'criar-aresta':
      return doc.selection.vertices.length === 2 ? null : MESH_WHY.dois;
    case 'suavizar-pesos':
    case 'podar-pesos':
    case 'tirar-pesos':
      return view.weighted ? null : MESH_WHY.semPesos;
    case 'chavear-pesos':
      if (!view.weighted) return MESH_WHY.semPesos;
      return doc.animation === null ? MESH_WHY.animacao : null;
    default:
      return null;
  }
}

/** Os dois modos que o menu liga e desliga, para a marca ao lado do nome. */
export function meshMenuChecked(id: MeshMenuId): boolean | undefined {
  if (id === 'criar-vertice') return createVertexModeOpen();
  if (id === 'ligar-ossos') return bindModeOpen();
  return undefined;
}

const meshPanelInstance = new MeshPanel();
/** O painel, com as portas do menu (`fromMenu`). */
export const meshMenuPanel: Pick<MeshPanel, 'fromMenu'> = meshPanelInstance;
export const meshPanel: Panel = meshPanelInstance;
registerPanel(meshPanel);
