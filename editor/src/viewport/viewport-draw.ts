/**
 * A cena: o desenho — lote A5c, plano arrumação (v11.0).
 *
 * `draw` e tudo o que ele desenha: a grade, as réguas, as guias, a imagem de
 * referência, os ossos com nome e ícone, os desenhos escolhidos, as caixas,
 * as máscaras, os pontos e as etiquetas; e a camada da grade de imagens.
 * Cortado de `viewport.ts` pela seção "drawing", até o fim da classe: cada
 * método virou uma função que recebe o painel (`panel`).
 */

import { corpoDe, emptySelection, type EditorDoc } from '../contract.js';
import { collectDrawables, type Skeleton, type Slot } from '../../../runtime/src/index.js';
import { gridStep } from './camera.js';
import { RULER_SIZE, pointerRulerLabel, rulerLabel, rulerTicks } from './rulers.js';
import {
  currentLocks, drawOnionSkin, isBoneHidden, isBoneLocked, isSlotHidden, setSkinGoneBones, skinStackOf,
  viewSettings,
} from './onion.js';
import { bonesGone } from '../doc/skin-bones.js';
// Rodada 8b, C10: a base de onde a entidade aberta saiu, desenhada em volta.
import { cenaMontadaDe } from '../doc/projeto.js';
import { GUIDE_COLOR, guideFromRuler } from './guides-model.js';
import { HANDLE_PIXELS, drawHandles, resolveHandles } from './handles.js';
import { transformBox } from './transform-box.js';
import { syncImageGrid } from '../ui/picker-hook.js';
import { boneColorCss, boneIconGlyph } from './bone-icons.js';
import { selectionBounds } from './zoom-model.js';
import { markerOutline } from './picking.js';
// Extensão `BONE_particles`, lote 2: o emissor que não desenha nada AVISA.
import { EMITTER_MARK_PIXELS, emitterMarks, emittersToWarn } from './particles-view.js';
import { pathPolyline, selectedEmitterShapes, shapeLabelSide } from './emitter-shape.js';
import { themeColors } from '../ui/theme.js';
import {
  DEFAULT_REFERENCE, deleteReferenceImage, getReferenceImage, putReferenceImage,
  readReference, writeReference,
} from './reference.js';
import type { ReferenceState } from './reference.js';
import { askForm } from '../ui/dialog.js';
import { pickImages } from '../io/import-images.js';
import { getActiveTool } from './tools/registry.js';
import { CROP_HANDLE_PIXELS, cropEditing, cropHandles, cropNumber, cropOfOpenAnimation } from './crop-model.js';
import type { ViewportPanel } from './viewport.js';
import { POINT_PIXELS } from './viewport.js';
import type { WorldPoint } from './viewport.js';
import { strokePolygon } from './viewport.js';
import type { WorldVertices } from './viewport.js';
import { ICON_PIXELS } from './viewport.js';
import { BONE_ROOT_PIXELS } from './viewport.js';
import { BONE_LINE_PIXELS } from './viewport.js';
import { NAME_PIXELS } from './viewport.js';
import { COLOR } from './viewport.js';
// Rodada 39, lote 3: a montagem de teste na cena (Na cena, aba Entidades).
import { drawWithChain, drawWithTestPieces, syncChainAnchor } from './montagem-view.js';

// -- drawing ---------------------------------------------------------------

/**
 * **O osso some junto com a skin** — rodada 12, S8 (e S9).
 *
 * A conta do arquivo (`bonesGone`) e, por cima, a do runtime: a pele que veio
 * de outro arquivo (F23) traz ossos que o `.bone` daqui não lista, e quem sabe
 * se eles estão ligados é o `activeSkinBones` do esqueleto vivo.
 */
export function refreshSkinGone(doc: EditorDoc, skeleton: Skeleton): void {
  const gone = bonesGone(corpoDe(doc).file, skinStackOf(doc));
  for (const bone of skeleton.bones) {
    if (bone.data.skinRequired && !skeleton.activeSkinBones.has(bone.data)) gone.add(bone.data.name);
  }
  setSkinGoneBones(gone);
}

export function devicePixelRatio(panel: ViewportPanel): number {
  const ratio = typeof window === 'undefined' ? 1 : window.devicePixelRatio;
  return ratio > 0 ? ratio : 1;
}

export function resize(panel: ViewportPanel): void {
  const canvas = panel.canvas;
  if (canvas === null) return;
  const width = canvas.clientWidth || 1;
  const height = canvas.clientHeight || 1;
  const dpr = panel.devicePixelRatio();
  const pixelWidth = Math.max(1, Math.round(width * dpr));
  const pixelHeight = Math.max(1, Math.round(height * dpr));
  if (canvas.width !== pixelWidth) canvas.width = pixelWidth;
  if (canvas.height !== pixelHeight) canvas.height = pixelHeight;
  panel.camera.setViewSize(width, height);
}

export function draw(panel: ViewportPanel): void {
  const ctx = panel.ctx;
  const canvas = panel.canvas;
  if (ctx === null || canvas === null) return;
  const dpr = panel.devicePixelRatio();
  const view = viewSettings();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = view.background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // O guia vem antes da grade: ele é o papel debaixo de tudo. Item 62.
  panel.drawReference(ctx, dpr);
  panel.drawGrid(ctx, dpr);

  const doc = panel.doc;
  // Rodada 39, lote 4: com alguém em volta (o mecha, em teste) e Na cena
  // ligado, o boneco se apoia no slot do de fora — antes de qualquer desenho.
  if (doc !== null) syncChainAnchor(doc);
  const skeleton = doc?.skeleton ?? null;
  const scale = panel.camera.zoom;
  // Rodada 12 (S8, S9): os ossos que a pilha de peles tira, antes de qualquer
  // osso se desenhar; o clique seguinte lê a mesma conta.
  if (doc !== null && skeleton !== null) refreshSkinGone(doc, skeleton);

  panel.camera.applyTo(ctx, dpr);
  // The ghosts go UNDER the drawing, which is what makes them ghosts.
  if (doc !== null) drawOnionSkin(doc, ctx, scale);
  // Rodada 8b, C10: animando a espada por dentro, o herói fica à vista,
  // parado, por baixo — sem o slot da espada, que é a espada em foco. Só o
  // desenho: os ossos, as alças e o clique são da espada.
  const montada = doc === null ? null : cenaMontadaDe(doc);
  const hostSkeleton = montada?.host.skeleton ?? null;
  if (montada !== null && hostSkeleton !== null && panel.renderer !== null && view.drawings) {
    const vaga = hostSkeleton.findSlot(montada.slot);
    const estava = vaga?.visible ?? false;
    if (vaga !== null) vaga.visible = false;
    panel.renderer.draw(hostSkeleton);
    if (vaga !== null) vaga.visible = estava;
    panel.camera.applyTo(ctx, dpr);
  }
  if (skeleton !== null && panel.renderer !== null && view.drawings) {
    // Um slot escondido um a um (item 57) não desenha. `visible` do slot é
    // estado VIVO do runtime, refeito a cada pose: mexer nele aqui não toca
    // no arquivo, e é o único jeito de o desenhador pular o slot sem que ele
    // precise saber o que é "escondido no editor".
    const restore = panel.hideHiddenSlots(skeleton);
    // Rodada 39, lote 3: com Na cena ligado, a peça de teste no lugar da
    // imagem — só durante o desenho; o clique continua vendo o arquivo.
    const renderer = panel.renderer;
    const boneco = (): void => {
      if (doc !== null) drawWithTestPieces(doc, skeleton, () => renderer.draw(skeleton));
      else renderer.draw(skeleton);
      panel.camera.applyTo(ctx, dpr);
    };
    // Lote 4: quem está em volta, por trás e pela frente do boneco.
    if (doc !== null) {
      drawWithChain(doc, (fora) => { renderer.draw(fora); panel.camera.applyTo(ctx, dpr); }, boneco);
    } else {
      boneco();
    }
    for (const slot of restore) slot.visible = true;
  }

  if (doc !== null && skeleton !== null) {
    if (view.boundingBoxes) panel.drawBoundingBoxes(ctx, skeleton, scale);
    if (view.points) panel.drawPoints(ctx, skeleton, scale);
    if (view.clippings) panel.drawClippings(ctx, skeleton, scale);
    panel.drawSelectedSlots(ctx, doc, skeleton, scale);
    drawAroundMarkers(ctx, doc, skeleton, scale);
    if (view.bones) panel.drawBones(ctx, doc, skeleton, scale);
    if (view.boneNames) panel.drawBoneNames(ctx, skeleton, scale);
    // Item 20: um nome por tipo, cada um no seu interruptor.
    if (view.slotNames) panel.drawSlotNames(ctx, skeleton, scale);
    if (view.pointNames) panel.drawAttachmentNames(ctx, skeleton, scale, 'point');
    if (view.boxNames) panel.drawAttachmentNames(ctx, skeleton, scale, 'boundingbox');
    // Extensão `BONE_particles`, lote 2: um emissor que não desenha nada
    // DESAPARECE, e desaparecer é indistinguível de estar quebrado. A marca vem
    // aqui, por cima do desenho e por baixo das alças. Não passa por
    // interruptor de Exibição de propósito: não é uma camada que se liga e
    // desliga, é um AVISO — e aviso que se pode desligar é aviso que não
    // avisa. Ele só aparece quando há o que dizer.
    drawEmitterWarnings(panel, ctx, skeleton, scale);
    // Degrau 10 (10.4): a área desenhada desta animação, em magenta.
    // N-4b: com Recorte na cena ligado, os puxadores e o fora escurecido.
    drawCropBox(doc, ctx, scale, cropEditing() && doc.animation !== null, panel.cropDragSays);
    // The handles belong to every tool, not only to "Posar".
    drawHandles(ctx, resolveHandles(doc, scale), scale);
    // Rodada 15, linha 1: TODO emissor tem marca, sadio ou não, parado ou
    // jorrando. Sem ela um emissor sem partícula no quadro não existe na tela.
    // Vem DEPOIS das alças: o emissor nasce na origem de um osso, e o quadrado
    // da origem tapava a estrela (foto 11 da rodada 15, primeira tentativa).
    // Rodada 16, lote 3: a forma do emissor escolhido, com as alças, por baixo
    // da estrela (a estrela é o lugar de clicar e não pode sumir).
    drawEmitterShapes(ctx, doc, skeleton, scale, panel.shapeDragSays);
    drawEmitterMarks(panel, ctx, doc, skeleton, scale);
    getActiveTool()?.drawOverlay?.(doc, ctx, scale);
    panel.drawDropHint(ctx, scale);
    panel.drawHoverName(ctx, scale);
  }

  // As réguas por ÚLTIMO: elas são a moldura do papel, e uma moldura que o
  // desenho tapa não é moldura — lote 21.
  // As guias por cima do desenho e por baixo das réguas — lote 42.
  if (view.showGuides || panel.guideDrag !== null) panel.drawGuides(ctx, dpr);
  if (view.rulers) panel.drawRulers(ctx, dpr);

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  panel.syncImageGridLayer();
}

// ---------------------------------------------------------------------------
// O retângulo magenta da exportação — degrau 10, tarefa 10.4 (F16, Q21)
// ---------------------------------------------------------------------------

/** A cor do retângulo de recorte. Magenta porque desenho nenhum a usa (Spriter cap. 26). */
export const CROP_COLOR = '#ff00c8';

/** A área desenhada da animação aberta — mora em `crop-model.ts` desde o N-4b. */
export { cropOfOpenAnimation };

/**
 * **O retângulo da exportação, em magenta** (10.4, `ARQUITETO 3` §8).
 *
 * Só aparece quando a animação aberta tem `crop` gravado: o retângulo é uma
 * promessa — *"é isto que vai sair na imagem"* — e uma promessa desenhada onde
 * não há dado nenhum seria um palpite na tela (regra 21).
 *
 * O `crop` é informativo no formato: nenhum leitor de pose o usa. Quem o usa é
 * a exportação de imagem, com a opção **A área desenhada nesta animação**.
 *
 * **N-4b**: com *Recorte na cena* ligado (`crop-model.ts`), o traço fica
 * cheio, o que fica FORA escurece (o que não vai sair na imagem, como no
 * recorte do Photoshop), e os oito puxadores aparecem. `says` é o tamanho
 * durante o arrasto, escrito em cima do retângulo.
 */
export function drawCropBox(
  doc: EditorDoc, ctx: CanvasRenderingContext2D, scale: number,
  editing = false, says: string | null = null,
): void {
  const crop = cropOfOpenAnimation(doc);
  if (crop === null) return;
  ctx.save();
  if (editing) {
    // O fora escurecido: um retângulo enorme com o furo do recorte (evenodd).
    const far = 1e6 / Math.max(scale, 1e-6);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    ctx.beginPath();
    ctx.rect(crop.x - far, crop.y - far, crop.width + far * 2, crop.height + far * 2);
    ctx.rect(crop.x, crop.y, crop.width, crop.height);
    ctx.fill('evenodd');
  }
  ctx.strokeStyle = CROP_COLOR;
  ctx.lineWidth = (editing ? 2 : 1) / scale;
  if (!editing) ctx.setLineDash([6 / scale, 4 / scale]);
  ctx.strokeRect(crop.x, crop.y, crop.width, crop.height);
  ctx.restore();
  const half = CROP_HANDLE_PIXELS / scale / 2;
  ctx.save();
  if (editing) {
    for (const h of cropHandles(crop)) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(h.x - half, h.y - half, half * 2, half * 2);
      ctx.strokeStyle = CROP_COLOR;
      ctx.lineWidth = 1.5 / scale;
      ctx.strokeRect(h.x - half, h.y - half, half * 2, half * 2);
    }
  }
  // O nome e o tamanho, em cima do canto de cima à esquerda — SEMPRE, e não
  // só com o modo ligado (prova de pessoa, 05/11/2026): a máscara do herói é
  // outro tracejado quase da mesma cor, e sem nome os dois se confundiam.
  const text = cropLabel(crop, says);
  const size = 12 / scale;
  ctx.font = `${size}px system-ui, sans-serif`;
  ctx.textBaseline = 'bottom';
  ctx.translate(crop.x, crop.y + crop.height + (editing ? half : 0) + 3 / scale);
  ctx.scale(1, -1);
  ctx.lineWidth = 3 / scale;
  // O contorno da cor do fundo dos nomes (`drawLabel`): o preto borrava as letras pequenas.
  ctx.strokeStyle = COLOR().boneFill;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = CROP_COLOR;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** O nome escrito junto do retângulo do recorte: o que é, e o tamanho (ou o que o arrasto diz). */
export function cropLabel(crop: { width: number; height: number }, says: string | null = null): string {
  return `recorte ${says ?? `${cropNumber(crop.width)} × ${cropNumber(crop.height)} px`}`;
}

/** O nome escrito junto da máscara: o tracejado dela é quase da cor do recorte. */
export function clippingLabel(name: string): string {
  return `máscara ${name}`;
}

/**
 * A grade de imagens do Spriter — lote 60b; desde o 60c, aberta pelo botão
 * direito (`openDrawingMenu`). Acompanha o zoom e o pan: é reposta a cada
 * quadro desenhado. Some durante o arrasto e volta ao soltar. Quem sabe se
 * ela está aberta é a própria grade (`image-picker.ts`).
 */
export function syncImageGridLayer(panel: ViewportPanel): void {
  const doc = panel.doc;
  const stage = panel.stage;
  if (doc === null || stage === null) return;
  const one = doc.selection.attachments.length === 1 ? doc.selection.attachments[0]! : null;
  const show = one !== null && !panel.pointerDown;
  const bounds = show && one !== null
    ? selectionBounds(doc.skeleton, { ...emptySelection(), attachments: [one] })
    : null;
  syncImageGrid(doc, stage, panel.camera, bounds === null ? null : {
    minX: bounds.x, minY: bounds.y, maxX: bounds.x + bounds.width, maxY: bounds.y + bounds.height,
  });
}

/**
 * As guias, em espaço de TELA: uma linha fina de ponta a ponta da cena, na
 * cor ciano que nenhum desenho usa. Travadas, tracejadas — o mesmo sinal
 * dos cadeados da Árvore, que acinzentam o que o clique não alcança.
 */
export function drawGuides(panel: ViewportPanel, ctx: CanvasRenderingContext2D, dpr: number): void {
  const canvas = panel.canvas;
  if (canvas === null) return;
  const largura = canvas.width / dpr;
  const altura = canvas.height / dpr;
  const view = viewSettings();
  const lista = view.showGuides ? [...view.guides] : [];
  const puxando = panel.guideDrag;
  if (puxando !== null) lista.push(guideFromRuler(puxando.ruler, puxando.x, puxando.y));
  if (lista.length === 0) return;
  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.strokeStyle = GUIDE_COLOR;
  ctx.lineWidth = 1;
  ctx.setLineDash(view.lockGuides ? [6, 4] : []);
  for (const guia of lista) {
    const p = panel.camera.worldToScreen(guia.axis === 'x' ? guia.value : 0, guia.axis === 'y' ? guia.value : 0);
    ctx.beginPath();
    if (guia.axis === 'x') {
      const x = Math.round(p.x) + 0.5;
      ctx.moveTo(x, 0);
      ctx.lineTo(x, altura);
    } else {
      const y = Math.round(p.y) + 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(largura, y);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Apaga os slots escondidos e devolve quais foram apagados, para religar.
 *
 * Só os que estavam visíveis entram na lista: um slot que já estava invisível
 * por causa do arquivo tem que continuar invisível depois.
 */
export function hideHiddenSlots(panel: ViewportPanel, skeleton: Skeleton): Slot[] {
  const locks = currentLocks();
  if (locks.hiddenSlots.size === 0) return [];
  const changed: Slot[] = [];
  for (const slot of skeleton.drawOrder) {
    if (!slot.visible || !isSlotHidden(slot.data.name, locks)) continue;
    slot.visible = false;
    changed.push(slot);
  }
  return changed;
}

/** Grid and axes, drawn in screen space so the lines stay crisp. */
/**
 * Carrega a imagem de referência quando o arquivo passa a pedir outra — item
 * 62.
 *
 * A imagem mora no navegador (IndexedDB) e o arquivo só guarda o NOME. Trocar
 * de arquivo, ou apagar o guia, tem de devolver o endereço temporário do blob
 * ao navegador: sem o `revokeObjectURL` cada troca deixaria um PNG inteiro
 * preso na memória da aba até ela fechar.
 */
export function syncReference(panel: ViewportPanel): void {
  const doc = panel.doc;
  const wanted = doc === null ? null : readReference(doc.file);
  const name = wanted?.name ?? null;
  if (name === panel.referenceName) return;

  panel.referenceName = name;
  panel.forgetReferenceImage();
  if (name === null) return;

  void getReferenceImage(name).then((blob) => {
    // Enquanto o navegador procurava, o arquivo pode ter mudado de guia.
    if (blob === null || panel.referenceName !== name) return;
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = (): void => {
      if (panel.referenceName !== name) { URL.revokeObjectURL(url); return; }
      panel.referenceImage = image;
      panel.referenceUrl = url;
      panel.needsDraw = true;
    };
    image.onerror = (): void => URL.revokeObjectURL(url);
    image.src = url;
  });
}

/** Devolve ao navegador a imagem que estava carregada. */
export function forgetReferenceImage(panel: ViewportPanel): void {
  if (panel.referenceUrl !== null) URL.revokeObjectURL(panel.referenceUrl);
  panel.referenceUrl = null;
  panel.referenceImage = null;
  panel.needsDraw = true;
}

/**
 * Desenha o guia, com a opacidade escolhida — item 62.
 *
 * Em coordenadas do MUNDO, e não da tela: o guia tem de andar e crescer junto
 * com o personagem quando alguém aproxima o zoom, senão ele deixa de ser um
 * guia no primeiro clique. Como Y cresce para cima aqui e para baixo na
 * imagem, o desenho é feito com a escala vertical invertida.
 */
export function drawReference(panel: ViewportPanel, ctx: CanvasRenderingContext2D, dpr: number): void {
  const doc = panel.doc;
  const image = panel.referenceImage;
  if (doc === null || image === null) return;
  const state: ReferenceState | null = readReference(doc.file);
  if (state === null || state.opacity <= 0) return;

  ctx.save();
  panel.camera.applyTo(ctx, dpr);
  ctx.globalAlpha = state.opacity;
  ctx.imageSmoothingEnabled = true;
  const width = image.naturalWidth * state.scale;
  const height = image.naturalHeight * state.scale;
  // O `scale(1, -1)` desvira a imagem; sem ele o guia sairia de cabeça para
  // baixo, porque o mundo tem Y para cima e o canvas tem Y para baixo.
  ctx.translate(state.x, state.y + height);
  ctx.scale(1, -1);
  ctx.drawImage(image, 0, 0, width, height);
  ctx.restore();
}

/**
 * "Exibir → Imagem de referência…" — item 62.
 *
 * Uma janela só, com tudo: escolher o PNG, os quatro números e o botão de
 * tirar. Escolher outra imagem troca a de agora; deixar o campo do arquivo
 * vazio mantém a que já está lá e muda só os números — que é o gesto de todo
 * dia, porque a imagem se escolhe uma vez e a posição se ajusta dez.
 *
 * Diz **na janela** que a imagem fica no navegador e não no `.bone`. Quem
 * mandar o arquivo para outra pessoa precisa saber que o guia não vai junto,
 * e descobrir isso do outro lado é descobrir tarde.
 */
export async function referenceWindow(panel: ViewportPanel, doc: EditorDoc): Promise<void> {
  const now = readReference(doc.file);
  const answer = await askForm({
    title: 'Imagem de referência',
    lead: 'Um PNG atrás de tudo, para montar o esqueleto por cima. A imagem '
      + 'fica guardada NESTE navegador; o .bone leva só a posição dela.',
    fields: [
      {
        id: 'arquivo', label: 'Arquivo',
        hint: now === null
          ? 'Escreva "escolher" para abrir o seletor de imagem.'
          : `Agora: ${now.name}. Escreva "escolher" para trocar, ou "tirar" para remover.`,
        value: '',
      },
      { id: 'x', label: 'X', value: String(now?.x ?? DEFAULT_REFERENCE.x) },
      { id: 'y', label: 'Y', value: String(now?.y ?? DEFAULT_REFERENCE.y) },
      {
        id: 'escala', label: 'Escala', hint: '1 = um pixel da imagem por unidade.',
        value: String(now?.scale ?? DEFAULT_REFERENCE.scale),
      },
      {
        id: 'opacidade', label: 'Opacidade', hint: 'De 0 a 1. 0,5 deixa o guia bem atrás.',
        value: String(now?.opacity ?? DEFAULT_REFERENCE.opacity),
      },
    ],
    yesLabel: 'Aplicar',
  });
  if (answer === null) return;

  const pedido = (answer['arquivo'] ?? '').trim().toLowerCase();
  if (pedido === 'tirar' || pedido === 'remover') {
    if (now !== null) await deleteReferenceImage(now.name);
    writeReference(doc.file, null);
    panel.syncReference();
    doc.notice('Imagem de referência removida');
    return;
  }

  let name = now?.name ?? null;
  if (pedido === 'escolher' || name === null) {
    // `pickImages` pede várias; aqui só a primeira interessa. Reaproveitar o
    // seletor que já existe evita um segundo caminho para "abrir um PNG".
    const picked = (await pickImages())?.[0] ?? null;
    if (picked === undefined || picked === null) {
      doc.notice('Nenhuma imagem escolhida');
      return;
    }
    const ok = await putReferenceImage(picked.name, picked);
    if (!ok) {
      doc.notice('O navegador não deixou guardar a imagem');
      return;
    }
    name = picked.name;
  }

  const num = (id: string, fallback: number): number => {
    const value = Number((answer[id] ?? '').replace(',', '.'));
    return Number.isFinite(value) ? value : fallback;
  };
  writeReference(doc.file, {
    name,
    x: num('x', DEFAULT_REFERENCE.x),
    y: num('y', DEFAULT_REFERENCE.y),
    scale: Math.max(0.001, num('escala', DEFAULT_REFERENCE.scale)),
    opacity: Math.min(1, Math.max(0, num('opacidade', DEFAULT_REFERENCE.opacity))),
  });
  panel.syncReference();
  doc.notice(`Imagem de referência: ${name}`);
}

/**
 * As réguas com números, em cima e à esquerda — lote 21, rodada 3.
 *
 * Desenhadas por ÚLTIMO e em espaço de TELA: elas são a moldura do papel, e
 * uma moldura que o desenho tapa não é moldura. Uma linha fina acompanha o
 * ponteiro nas duas, para saber em que número o cursor está sem contar
 * marcas com o dedo.
 *
 * A conta é do `viewport/rulers.ts`, e ela usa o MESMO `gridStep` da grade:
 * régua e grade nunca podem discordar — duas escalas na mesma tela é pior
 * que nenhuma.
 */
export function drawRulers(panel: ViewportPanel, ctx: CanvasRenderingContext2D, dpr: number): void {
  const canvas = panel.canvas;
  if (canvas === null) return;
  const largura = canvas.width / dpr;
  const altura = canvas.height / dpr;
  if (!(largura > RULER_SIZE) || !(altura > RULER_SIZE)) return;

  const cores = themeColors();
  const view = viewSettings();
  const canto = panel.camera.screenToWorld(0, 0);
  const fim = panel.camera.screenToWorld(largura, altura);

  ctx.save();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.font = '11px "Segoe UI", system-ui, sans-serif';
  ctx.lineWidth = 1;

  // A faixa das duas réguas, e o quadradinho do canto onde elas se cruzam.
  ctx.fillStyle = cores.panel;
  ctx.fillRect(0, 0, largura, RULER_SIZE);
  ctx.fillRect(0, 0, RULER_SIZE, altura);
  ctx.strokeStyle = cores.line;
  ctx.beginPath();
  ctx.moveTo(0, RULER_SIZE + 0.5);
  ctx.lineTo(largura, RULER_SIZE + 0.5);
  ctx.moveTo(RULER_SIZE + 0.5, 0);
  ctx.lineTo(RULER_SIZE + 0.5, altura);
  ctx.stroke();

  ctx.fillStyle = cores.ink;
  ctx.strokeStyle = cores.inkSoft;

  const emX = rulerTicks(
    { zoom: panel.camera.zoom, from: canto.x, to: fim.x }, largura, 'x', view.gridPixels,
  );
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  for (const tick of emX) {
    if (tick.px < RULER_SIZE) continue;
    const x = Math.round(tick.px) + 0.5;
    ctx.beginPath();
    ctx.moveTo(x, tick.major ? 4 : RULER_SIZE - 5);
    ctx.lineTo(x, RULER_SIZE);
    ctx.stroke();
    if (tick.major) ctx.fillText(rulerLabel(tick.value), x + 3, 3);
  }

  // Em Y o mundo cresce para CIMA e a tela cresce para baixo (§3): a câmera
  // já devolve isso invertido, e a conta não precisa de sinal nenhum aqui.
  const emY = rulerTicks(
    { zoom: panel.camera.zoom, from: canto.y, to: fim.y }, altura, 'y', view.gridPixels,
  );
  ctx.textAlign = 'left';
  for (const tick of emY) {
    if (tick.px < RULER_SIZE) continue;
    const y = Math.round(tick.px) + 0.5;
    ctx.beginPath();
    ctx.moveTo(tick.major ? 4 : RULER_SIZE - 5, y);
    ctx.lineTo(RULER_SIZE, y);
    ctx.stroke();
    if (tick.major) ctx.fillText(rulerLabel(tick.value), 2, y + 2);
  }

  // A linha do ponteiro, nas duas réguas.
  if (panel.lastScreenX > RULER_SIZE || panel.lastScreenY > RULER_SIZE) {
    ctx.strokeStyle = cores.toggleOn;
    ctx.beginPath();
    ctx.moveTo(Math.round(panel.lastScreenX) + 0.5, 0);
    ctx.lineTo(Math.round(panel.lastScreenX) + 0.5, RULER_SIZE);
    ctx.moveTo(0, Math.round(panel.lastScreenY) + 0.5);
    ctx.lineTo(RULER_SIZE, Math.round(panel.lastScreenY) + 0.5);
    ctx.stroke();
    // Rodada 46, lote 4: o número do ponteiro, ao lado do traço da régua de cima.
    const mundo = panel.camera.screenToWorld(panel.lastScreenX, panel.lastScreenY);
    const etiqueta = pointerRulerLabel(mundo.x, mundo.y);
    const largura = ctx.measureText(etiqueta).width + 8;
    const ex = Math.min(Math.round(panel.lastScreenX) + 4, ctx.canvas.width / dpr - largura - 2);
    ctx.fillStyle = cores.toggleOn;
    ctx.fillRect(ex, 1, largura, RULER_SIZE - 2);
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline = 'top';
    ctx.fillText(etiqueta, ex + 4, 4);
  }
  ctx.restore();
}

export function drawGrid(panel: ViewportPanel, ctx: CanvasRenderingContext2D, dpr: number): void {
  const camera = panel.camera;
  const view = viewSettings();
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const step = gridStep(camera.zoom, view.gridPixels);
  const topLeft = camera.screenToWorld(0, 0);
  const bottomRight = camera.screenToWorld(camera.width, camera.height);

  if (view.grid) {
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.strokeStyle = COLOR().grid;
    const firstX = Math.ceil(topLeft.x / step) * step;
    for (let wx = firstX; wx <= bottomRight.x; wx += step) {
      const sx = Math.round(camera.worldToScreen(wx, 0).x) + 0.5;
      ctx.moveTo(sx, 0);
      ctx.lineTo(sx, camera.height);
    }
    const firstY = Math.ceil(bottomRight.y / step) * step;
    for (let wy = firstY; wy <= topLeft.y; wy += step) {
      const sy = Math.round(camera.worldToScreen(0, wy).y) + 0.5;
      ctx.moveTo(0, sy);
      ctx.lineTo(camera.width, sy);
    }
    ctx.stroke();
  }

  if (!view.axes) return;
  // The two axes, so up is never in doubt.
  const origin = camera.worldToScreen(0, 0);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.strokeStyle = COLOR().axisX;
  ctx.moveTo(0, Math.round(origin.y) + 0.5);
  ctx.lineTo(camera.width, Math.round(origin.y) + 0.5);
  ctx.stroke();
  ctx.beginPath();
  ctx.strokeStyle = COLOR().axisY;
  ctx.moveTo(Math.round(origin.x) + 0.5, 0);
  ctx.lineTo(Math.round(origin.x) + 0.5, camera.height);
  ctx.stroke();
}

/** Quanto o nome do meio fica abaixo do contorno, em px de tela. */
export const AROUND_LABEL_GAP = 16;

/**
 * Onde o nome do meio do "Este boneco" se escreve — rodada 13 (fecho da v27.6).
 *
 * Era em cima do contorno, à esquerda: exatamente onde o Transformar põe o
 * quadradinho do canto e a haste de girar, e o nome se lia mal. Agora vai
 * **embaixo** do contorno, afastado das alças de baixo (`AROUND_LABEL_GAP` px
 * de tela). Devolve o ponto em mundo; o texto sai com `textBaseline = 'top'`.
 *
 * Rodada 17: **embaixo também das alças** (`avoid`: os cantos, os oito
 * quadradinhos e a bolinha da caixa do Transformar). Com a peça girada a caixa
 * passa por baixo do contorno do meio, e o começo do nome e o "não" ficavam
 * sob a alça (*"m… · o meio (…o é desenhado)"*). A régua de antes media só o
 * contorno — a que o próprio executor escreveu —, e não o que foi relatado.
 */
export function aroundLabelAt(
  vertices: ArrayLike<number>, scale: number, avoid: readonly { x: number; y: number }[] = [],
): { x: number; y: number } {
  let fundo = Infinity;
  let esquerda = Infinity;
  for (let i = 0; i < vertices.length; i += 2) {
    esquerda = Math.min(esquerda, vertices[i]!);
    fundo = Math.min(fundo, vertices[i + 1]!);
  }
  // Uma alça tem meio quadradinho para baixo do ponto dela.
  const meiaAlca = HANDLE_PIXELS / 2 / scale;
  for (const p of avoid) fundo = Math.min(fundo, p.y - meiaAlca);
  return { x: esquerda, y: fundo - AROUND_LABEL_GAP / scale };
}

/**
 * **O meio do "Este boneco"** — rodada 11 (05/10/2026), spec 7.11 `around`.
 *
 * A imagem que marca o meio de uma entidade em volta NÃO é desenhada. Com a
 * peça escolhida, a cena risca o contorno dela, tracejado, com o nome: é onde
 * se vê o que marca o meio, e onde o botão direito desfaz. Sem a peça
 * escolhida não aparece nada — o meio não é desenho.
 */
export function drawAroundMarkers(ctx: CanvasRenderingContext2D, doc: EditorDoc, skeleton: Skeleton, scale: number): void {
  const escolhidos = new Set([...doc.selection.slots, ...doc.selection.attachments.map((a) => a.slot)]);
  for (const nome of escolhidos) {
    const meio = markerOutline(skeleton, nome);
    if (meio === null) continue;
    const v = meio.vertices;
    ctx.save();
    ctx.strokeStyle = COLOR().slotSelected;
    ctx.lineWidth = 1.5 / scale;
    ctx.setLineDash([6 / scale, 4 / scale]);
    ctx.beginPath();
    ctx.moveTo(v[0]!, v[1]!);
    for (let i = 2; i < v.length; i += 2) ctx.lineTo(v[i]!, v[i + 1]!);
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    // O mundo tem Y para cima e o texto não: as letras são viradas de volta.
    const size = NAME_PIXELS / scale;
    const caixa = transformBox(doc, scale);
    const at = aroundLabelAt(v, scale, caixa === null ? [] : [...caixa.corners, ...Object.values(caixa.handles), caixa.knob]);
    ctx.font = `${size}px system-ui, sans-serif`;
    ctx.textBaseline = 'top';
    ctx.translate(at.x, at.y);
    ctx.scale(1, -1);
    const texto = `${meio.name} · o meio (não é desenhado)`;
    ctx.lineWidth = 3 / scale;
    ctx.strokeStyle = COLOR().boneFill;
    ctx.strokeText(texto, 0, 0);
    ctx.fillStyle = COLOR().slotSelected;
    ctx.fillText(texto, 0, 0);
    ctx.restore();
  }
}

/** The name of every bone, next to its root, in a fixed size on screen. */
export function drawBoneNames(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
  const size = NAME_PIXELS / scale;
  ctx.save();
  // The world has Y up and text does not, so the letters are flipped back.
  ctx.font = `${size}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  const locks = currentLocks();
  for (const bone of skeleton.bones) {
    if (bone === skeleton.root) continue;
    if (!bone.data.visible) continue;
    // Rodada 12 (S8): o osso que a pilha de peles tirou não deixa o nome.
    if (isBoneHidden(bone.data.name, locks)) continue;
    ctx.save();
    ctx.translate(bone.worldX + size * 0.5, bone.worldY + size * 0.5);
    ctx.scale(1, -1);
    ctx.lineWidth = 3 / scale;
    ctx.strokeStyle = COLOR().boneFill;
    ctx.strokeText(bone.data.name, 0, 0);
    ctx.fillStyle = COLOR().bone;
    ctx.fillText(bone.data.name, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/**
 * Bones: a line to the tip, a triangle on the root, and — requirement R2 —
 * the bone's OWN colour and its icon.
 *
 * The colour comes from `bones[].color` of the file (spec 4.2, "cor no
 * editor"), so painting a bone is a change to the document like any other and
 * travels with it. A selected bone still goes blue: the selection has to win,
 * or a bone painted blue would be indistinguishable from a selected one.
 */
export function drawBones(panel: ViewportPanel, ctx: CanvasRenderingContext2D, doc: EditorDoc, skeleton: Skeleton, scale: number): void {
  const selected = new Set(doc.selection.bones);
  const locks = currentLocks();
  const width = BONE_LINE_PIXELS / scale;
  const root = BONE_ROOT_PIXELS / scale;
  for (const bone of skeleton.bones) {
    // A raiz é o mundo: não se desenha, nem com Ver ossos — lote 60a. Ela
    // continua no arquivo, na origem, e os desenhos soltos moram nela.
    if (bone === skeleton.root) continue;
    if (!bone.data.visible) continue;
    // Escondido um a um (item 57) não desenha. Isto é diferente de travado:
    // travado aparece e não pega clique.
    if (isBoneHidden(bone.data.name, locks)) continue;
    // A locked bone is still drawn, only fainter: it is there, it just does
    // not answer the pointer.
    ctx.globalAlpha = isBoneLocked(bone.data.name, locks) ? 0.35 : 1;
    const isSelected = selected.has(bone.data.name);
    const color = isSelected ? COLOR().boneSelected : boneColorCss(bone.data.color);
    const length = bone.data.length;
    const tipX = bone.worldX + bone.a * length;
    const tipY = bone.worldY + bone.c * length;

    if (length > 0) {
      ctx.strokeStyle = color;
      ctx.lineWidth = isSelected ? width * 2 : width;
      ctx.beginPath();
      ctx.moveTo(bone.worldX, bone.worldY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
    }

    // The triangle points along the bone, so the direction is readable.
    const dirX = length > 0 ? (tipX - bone.worldX) / length : 1;
    const dirY = length > 0 ? (tipY - bone.worldY) / length : 0;
    const norm = Math.hypot(dirX, dirY) || 1;
    const ux = dirX / norm;
    const uy = dirY / norm;
    ctx.beginPath();
    ctx.moveTo(bone.worldX + ux * root, bone.worldY + uy * root);
    ctx.lineTo(bone.worldX - uy * root * 0.42, bone.worldY + ux * root * 0.42);
    ctx.lineTo(bone.worldX + uy * root * 0.42, bone.worldY - ux * root * 0.42);
    ctx.closePath();
    ctx.fillStyle = isSelected ? COLOR().boneSelected : COLOR().boneFill;
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.stroke();

    // Degrau 9 (I5): o osso que só existe com uma pele ligada ganha um anel
    // na raiz. Sem sinal nenhum, ele é igual aos outros até a roupa sair — e
    // aí some, e a cena não diz por quê (regra 21). A Árvore põe o mesmo
    // sinal na linha, com o nome da pele na dica.
    if (bone.data.skinRequired) {
      ctx.beginPath();
      ctx.arc(bone.worldX, bone.worldY, root * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash([root * 0.6, root * 0.5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  ctx.globalAlpha = 1;
  panel.drawBoneIcons(ctx, skeleton, scale);
}

/**
 * The icon of every bone that has one — requirement R2, `bones[].icon`.
 *
 * Drawn to the LEFT of the root, so it never sits on top of the name, which
 * is drawn to the right. Fixed size on screen and a white outline behind it,
 * the same treatment the names get, so it stays readable over a drawing.
 */
export function drawBoneIcons(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
  const size = ICON_PIXELS / scale;
  ctx.save();
  ctx.font = `${size}px system-ui, "Segoe UI Symbol", sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'right';
  for (const bone of skeleton.bones) {
    if (bone === skeleton.root) continue;
    if (!bone.data.visible) continue;
    // Rodada 12 (S8): o osso que a pilha de peles tirou não deixa o ícone.
    if (currentLocks().goneBones?.has(bone.data.name) === true) continue;
    const glyph = boneIconGlyph(bone.data.icon);
    if (glyph === '') continue;
    ctx.save();
    // The world has Y up and text does not, so the glyph is flipped back.
    ctx.translate(bone.worldX - size * 0.4, bone.worldY + size * 0.5);
    ctx.scale(1, -1);
    ctx.lineWidth = 3 / scale;
    ctx.strokeStyle = COLOR().boneFill;
    ctx.strokeText(glyph, 0, 0);
    ctx.fillStyle = boneColorCss(bone.data.color);
    ctx.fillText(glyph, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/** Outlines of the attachments in the selected slots. */
export function drawSelectedSlots(panel: ViewportPanel, ctx: CanvasRenderingContext2D, doc: EditorDoc, skeleton: Skeleton, scale: number): void {
  const slots = new Set(doc.selection.slots);
  const chosen = new Set(doc.selection.attachments.map((item) => `${item.slot}/${item.attachment}`));
  if (slots.size === 0 && chosen.size === 0) return;
  const width = 2 / scale;
  for (const drawable of collectDrawables(skeleton)) {
    const name = drawable.slot.data.name;
    const key = `${name}/${drawable.attachment.name}`;
    if (!slots.has(name) && !chosen.has(key)) continue;
    const shape = drawable.attachment as unknown as WorldVertices;
    if (typeof shape.computeWorldVertices !== 'function') continue;
    const vertices = shape.computeWorldVertices(drawable.slot) as Float64Array;
    // A region always has four corners; a mesh lists its outline first.
    const hull = shape.hull ?? 0;
    const count = hull > 2 ? hull : (shape.vertexCount ?? 4);
    strokePolygon(ctx, vertices, count, COLOR().slotSelected, width);
  }
}

/** `boundingbox` attachments, which are guides and never pixels. */
export function drawBoundingBoxes(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
  const width = 1.5 / scale;
  for (const slot of skeleton.drawOrder) {
    const attachment = slot.attachment;
    if (attachment === null || !slot.visible || attachment.type !== 'boundingbox') continue;
    const shape = attachment as unknown as WorldVertices;
    const count = shape.vertexCount ?? 0;
    if (count < 2) continue;
    const vertices = shape.computeWorldVertices(slot) as Float64Array;
    strokePolygon(ctx, vertices, count, COLOR().boundingBox, width);
  }
}

/**
 * Máscaras (`clipping`), tracejadas — item 47.
 *
 * Tracejado e numa cor própria, porque uma máscara não é desenho: ela é o
 * corte. Sólida, ela seria confundida com uma caixa de colisão, que é o outro
 * polígono que aparece por cima do personagem.
 */
export function drawClippings(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
  const width = 2 / scale;
  ctx.save();
  ctx.setLineDash([8 / scale, 5 / scale]);
  for (const slot of skeleton.drawOrder) {
    const attachment = slot.attachment;
    if (attachment === null || !slot.visible || attachment.type !== 'clipping') continue;
    const shape = attachment as unknown as WorldVertices;
    const count = shape.vertexCount ?? 0;
    if (count < 3) continue;
    const vertices = shape.computeWorldVertices(slot) as Float64Array;
    strokePolygon(ctx, vertices, count, COLOR().clipping, width);
    // Prova de pessoa (05/11/2026): o nome, no vértice mais alto. Sem ele, o
    // tracejado da máscara se confundia com o do recorte da exportação.
    let topo = 0;
    for (let i = 1; i < count; i++) if (vertices[i * 2 + 1]! > vertices[topo * 2 + 1]!) topo = i;
    ctx.save();
    ctx.setLineDash([]);
    drawLabel(panel, ctx, clippingLabel(attachment.name), vertices[topo * 2]!, vertices[topo * 2 + 1]!, scale, COLOR().clipping);
    ctx.restore();
  }
  ctx.restore();
}

/** `point` attachments: a cross plus a tick showing their rotation. */
/**
 * Escreve uma palavra no mundo, no tamanho de tela — item 20.
 *
 * O mundo tem Y para cima e a letra não, então o texto é desvirado aqui. O
 * contorno grosso por baixo é o que faz o nome continuar legível em cima de
 * um desenho claro ou de um desenho escuro, sem precisar de caixa atrás.
 */
export function drawLabel(panel: ViewportPanel, ctx: CanvasRenderingContext2D, text: string, x: number, y: number, scale: number, color: string): void {
  const size = NAME_PIXELS / scale;
  ctx.save();
  ctx.font = `${size}px system-ui, sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.translate(x + size * 0.5, y + size * 0.5);
  ctx.scale(1, -1);
  ctx.lineWidth = 3 / scale;
  ctx.strokeStyle = COLOR().boneFill;
  ctx.strokeText(text, 0, 0);
  ctx.fillStyle = color;
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** O nome de cada slot, na origem do osso que o carrega — item 20. */
export function drawSlotNames(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
  for (const slot of skeleton.drawOrder) {
    if (!slot.visible || slot.attachment === null) continue;
    panel.drawLabel(ctx, slot.data.name, slot.bone.worldX, slot.bone.worldY, scale, COLOR().slotSelected);
  }
}

/** O nome de cada ponto, ou de cada caixa, onde ele está — item 20. */
export function drawAttachmentNames(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number, kind: 'point' | 'boundingbox'): void {
  for (const slot of skeleton.drawOrder) {
    const attachment = slot.attachment;
    if (attachment === null || !slot.visible || attachment.type !== kind) continue;
    const at = kind === 'point'
      ? (attachment as unknown as WorldPoint).computeWorldPosition(slot.bone)
      : { x: slot.bone.worldX, y: slot.bone.worldY };
    panel.drawLabel(
      ctx, attachment.name, at.x, at.y, scale,
      kind === 'point' ? COLOR().point : COLOR().boundingBox,
    );
  }
}

/** O raio de uma alça da forma do emissor, em pixels de tela. O clique tem folga. */
export const SHAPE_HANDLE_PIXELS = 6;

/**
 * **A forma do emissor escolhido** — rodada 16, lote 3. O contorno de onde as
 * partículas nascem (`emitter-shape.ts` faz as contas) e as alças dos números
 * que se arrastam. A malha é tracejada pelos próprios triângulos, deformados
 * agora, com os vértices do runtime.
 */
export function drawEmitterShapes(
  ctx: CanvasRenderingContext2D, doc: EditorDoc, skeleton: Skeleton, scale: number,
  arrastando: { id: string; text: string } | null = null,
): void {
  const formas = selectedEmitterShapes(doc, EMITTER_MARK_PIXELS / scale);
  if (formas.length === 0) return;
  const cor = COLOR().slotSelected;
  ctx.save();
  ctx.lineCap = 'round';
  for (const forma of formas) {
    const linhas = [...forma.guide.lines];
    // Lote 8: o caminho escolhido, em destaque (cheio, não tracejado): é em
    // cima dele que as partículas nascem.
    if (forma.curve !== null) {
      const bar = forma.curve.indexOf('/');
      const slotDoCaminho = bar <= 0 ? null : skeleton.findSlot(forma.curve.slice(0, bar));
      const caminho = slotDoCaminho === null ? null
        : skeleton.getAttachment(slotDoCaminho.data.index, forma.curve.slice(bar + 1)) as unknown as
          (WorldVertices & { type?: string; closed?: boolean }) | null;
      if (slotDoCaminho !== null && caminho !== null && caminho.type === 'path' && typeof caminho.computeWorldVertices === 'function') {
        const v = caminho.computeWorldVertices(slotDoCaminho);
        linhas.push({ points: pathPolyline(v, caminho.closed === true), closed: false, dashed: false });
      }
    }
    if (forma.mesh !== null) {
      const slot = skeleton.findSlot(forma.slot);
      const malha = slot === null ? null : skeleton.getAttachment(slot.data.index, forma.mesh) as unknown as WorldVertices | null;
      if (slot !== null && malha !== null && typeof malha.computeWorldVertices === 'function' && malha.triangles !== undefined) {
        const v = malha.computeWorldVertices(slot);
        const t = malha.triangles;
        for (let i = 0; i + 2 < t.length; i += 3) {
          const p = [t[i]!, t[i + 1]!, t[i + 2]!].flatMap((k) => [Number(v[k * 2]), Number(v[k * 2 + 1])]);
          linhas.push({ points: p, closed: true, dashed: true });
        }
      }
    }
    for (const linha of linhas) {
      const p = linha.points;
      if (p.length < 4) continue;
      // O contorno claro por baixo, como a estrela: legível no claro e no escuro.
      for (const [largura, tinta] of [[3.5 / scale, COLOR().boneFill], [1.5 / scale, cor]] as const) {
        ctx.setLineDash(linha.dashed ? [6 / scale, 4 / scale] : []);
        ctx.lineWidth = largura;
        ctx.strokeStyle = tinta;
        ctx.beginPath();
        ctx.moveTo(p[0]!, p[1]!);
        for (let i = 2; i + 1 < p.length; i += 2) ctx.lineTo(p[i]!, p[i + 1]!);
        if (linha.closed) ctx.closePath();
        ctx.stroke();
      }
    }
    ctx.setLineDash([]);
    const r = SHAPE_HANDLE_PIXELS / scale;
    // Segunda conferência da rodada 16 (05/10), defeito 3: cada alça leva o
    // NOME escrito ao lado ("Raio", "Trecho", "Espessura") — no arco as duas
    // alças eram iguais, e puxava-se uma achando que era a outra.
    const letra = 11 / scale;
    for (const alca of forma.guide.handles) {
      ctx.fillStyle = COLOR().boneFill;
      ctx.strokeStyle = cor;
      ctx.lineWidth = 2 / scale;
      ctx.beginPath();
      ctx.rect(alca.x - r, alca.y - r, r * 2, r * 2);
      ctx.fill();
      ctx.stroke();
      ctx.save();
      // Rodada 17: o nome vai para FORA da forma, e não por cima da estrela.
      const lado = shapeLabelSide(alca.x, forma.matrix.worldX);
      ctx.translate(lado === 'left' ? alca.x - r * 1.6 : alca.x + r * 1.6, alca.y);
      ctx.scale(1, -1);
      ctx.font = `600 ${letra}px system-ui, sans-serif`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = lado === 'left' ? 'right' : 'left';
      ctx.lineWidth = 3 / scale;
      ctx.strokeStyle = COLOR().boneFill;
      // A alça que se arrasta diz o NÚMERO junto, maior ("Raio: 40").
      const texto = arrastando !== null && arrastando.id === alca.id ? arrastando.text : alca.label;
      if (texto !== alca.label) ctx.font = `700 ${letra * 1.3}px system-ui, sans-serif`;
      ctx.strokeText(texto, 0, 0);
      ctx.fillStyle = cor;
      ctx.fillText(texto, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();
}

/**
 * **A marca do emissor** — rodada 15, linha 1 (04/10/2026).
 *
 * O Humberto, 04/10: *"não conseguia clicar nela"*. Um emissor sadio não tinha
 * marca nenhuma: com a agulha antes do primeiro nascimento, ou com partículas
 * pequenas e claras, ele não estava em lugar nenhum da tela.
 *
 * Agora todo emissor à vista tem uma **estrela de quatro pontas** na origem —
 * o desenho do botão Partículas, que é como a pessoa já o conhece — e um
 * **traço** para onde as partículas saem. Escolhido, ele fica na cor da
 * escolha e mais grosso, como a imagem escolhida.
 *
 * Não passa por interruptor de Exibição, como o aviso abaixo: ela é o lugar
 * que se clica (`particles-view.ts`, `emitterHit`), e um lugar de clicar que
 * some deixa o emissor de novo sem porta na cena.
 */
export function drawEmitterMarks(
  panel: ViewportPanel, ctx: CanvasRenderingContext2D, doc: EditorDoc, skeleton: Skeleton, scale: number,
): void {
  const marcas = emitterMarks(skeleton, (slot) => isSlotHidden(slot.data.name));
  if (marcas.length === 0) return;
  const escolhidos = new Set(doc.selection.attachments.map((a) => `${a.slot}/${a.attachment}`));
  const r = EMITTER_MARK_PIXELS / scale;
  const cores = themeColors();
  ctx.save();
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  for (const marca of marcas) {
    const escolhido = escolhidos.has(`${marca.slot}/${marca.name}`);
    const cor = escolhido ? COLOR().slotSelected : cores.accent;
    // O contorno claro por baixo: a estrela continua legível sobre o desenho
    // escuro e sobre o claro, como o nome dos ossos.
    for (const [largura, tinta] of [[(escolhido ? 5 : 4) / scale, COLOR().boneFill], [(escolhido ? 2.5 : 1.75) / scale, cor]] as const) {
      ctx.lineWidth = largura;
      ctx.strokeStyle = tinta;
      ctx.beginPath();
      // A estrela: quatro raios, dois longos e dois curtos na diagonal.
      ctx.moveTo(marca.x - r, marca.y); ctx.lineTo(marca.x + r, marca.y);
      ctx.moveTo(marca.x, marca.y - r); ctx.lineTo(marca.x, marca.y + r);
      const d = r * 0.5;
      ctx.moveTo(marca.x - d, marca.y - d); ctx.lineTo(marca.x + d, marca.y + d);
      ctx.moveTo(marca.x - d, marca.y + d); ctx.lineTo(marca.x + d, marca.y - d);
      // O traço da direção: de onde as partículas saem.
      const a = (marca.direction * Math.PI) / 180;
      ctx.moveTo(marca.x + Math.cos(a) * r * 1.2, marca.y + Math.sin(a) * r * 1.2);
      ctx.lineTo(marca.x + Math.cos(a) * r * 2.4, marca.y + Math.sin(a) * r * 2.4);
      ctx.stroke();
    }
    // O miolo cheio: é o ponto exato de onde as partículas saem.
    ctx.fillStyle = cor;
    ctx.beginPath();
    ctx.arc(marca.x, marca.y, r * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * **O emissor que não desenha nada, dito em voz alta** — extensão
 * `BONE_particles`, lote 2.
 *
 * As partículas em si são desenhadas pelo `CanvasRenderer` do runtime, na vez
 * do slot na `drawOrder` (§9.5), como todo anexo. Esta função não desenha
 * partícula nenhuma: ela cobre o caso em que **não há partícula para
 * desenhar**, e o emissor sumiria da cena sem uma palavra.
 *
 * O desenhador do runtime até avisa, por `onWarning` — e a cena do editor não
 * liga o `onWarning`. Ligar ali seria mexer no `viewport.ts`, que é de outra
 * parte esta noite; e mesmo ligado, o rodapé é o lugar errado para este aviso:
 * ele mandaria a pessoa procurar QUAL emissor, num arquivo que pode ter vários.
 * **A marca fica onde o emissor está**, e diz o nome e o motivo.
 *
 * O anel é um círculo tracejado: não é nenhum dos desenhos que já existem na
 * cena (o Ponto é uma mira, a Caixa é um retângulo, a Máscara é rosa), e
 * tracejado porque ali **não há nada desenhado** — é o lugar de uma coisa que
 * não apareceu.
 */
export function drawEmitterWarnings(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
  const marcas = emittersToWarn(emitterMarks(skeleton, (slot) => isSlotHidden(slot.data.name)));
  if (marcas.length === 0) return;
  const raio = (POINT_PIXELS + 4) / scale;
  const cor = themeColors().warn;
  ctx.save();
  // Um traço de 2,5 px de TELA: mais fino desaparece sobre o desenho colorido
  // do herói, que é onde o emissor costuma estar.
  ctx.lineWidth = 2.5 / scale;
  ctx.strokeStyle = cor;
  ctx.setLineDash([5 / scale, 4 / scale]);
  for (const marca of marcas) {
    ctx.beginPath();
    ctx.arc(marca.x, marca.y, raio, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  // O texto FORA do `setLineDash`: o `drawLabel` contorna a letra, e um
  // contorno tracejado deixaria o nome picado e ilegível.
  //
  // E é o **curto** que vai aqui, não a frase inteira. A primeira foto deste
  // lote mostrou a frase correndo para fora da borda do palco — desenhada no
  // espaço do esqueleto ela cresce com o zoom —, e o que chegava aos olhos era
  // *"…escolha uma em Prop"*. Aviso cortado no meio é pior que aviso curto. A
  // frase inteira está no `problem` da marca, para quem tem largura.
  for (const marca of marcas) {
    drawLabel(panel, ctx, marca.short ?? '', marca.x + raio, marca.y, scale, cor);
  }
}

export function drawPoints(panel: ViewportPanel, ctx: CanvasRenderingContext2D, skeleton: Skeleton, scale: number): void {
  const size = POINT_PIXELS / scale;
  ctx.lineWidth = 2 / scale;
  ctx.strokeStyle = COLOR().point;
  for (const slot of skeleton.drawOrder) {
    const attachment = slot.attachment;
    if (attachment === null || !slot.visible || attachment.type !== 'point') continue;
    const shape = attachment as unknown as WorldPoint;
    const at = shape.computeWorldPosition(slot.bone);
    const angle = (shape.computeWorldRotation(slot.bone) * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(at.x - size, at.y);
    ctx.lineTo(at.x + size, at.y);
    ctx.moveTo(at.x, at.y - size);
    ctx.lineTo(at.x, at.y + size);
    ctx.moveTo(at.x, at.y);
    ctx.lineTo(at.x + Math.cos(angle) * size * 2, at.y + Math.sin(angle) * size * 2);
    ctx.stroke();
  }
}
