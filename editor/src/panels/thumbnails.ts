/**
 * Miniaturas dos desenhos, recortadas do atlas (dono C) — item 75.
 *
 * Uma lista de nomes como `hand_open` e `hand_fist` obriga a lembrar qual é
 * qual. Uma imagem de 24px ao lado responde na hora, e é a diferença entre
 * escolher e adivinhar.
 *
 * O recorte é caro — desenhar num canvas e ler os bytes de volta — e a mesma
 * lista se redesenha a cada clique na Árvore, então o resultado fica guardado
 * por nome de imagem. O cache é da SESSÃO: ele morre com a aba, e é limpo de
 * propósito quando o documento troca de atlas.
 */

import type { EditorDoc } from '../contract.js';
import {
  CanvasRenderer, Skeleton, findAtlasRegion, smoothingFor, type AtlasPageData,
} from '../../../runtime/src/index.js';
import { cropPlacement } from './mesh-panel.js';
import { findAttachment } from './properties-model.js';
import { thumbnailKind, type ThumbPlan } from './thumbnail-kind.js';
import { el } from './dom.js';
import { paintIcon } from '../ui/icons.js';

/** Lado da miniatura, em pixels de tela. */
export const THUMB_SIZE = 24;

const cache = new Map<string, string | null>();

/** Esquece o que foi recortado. Chamado quando o atlas do documento muda. */
export function forgetThumbnails(): void {
  cache.clear();
}

/**
 * A miniatura de uma imagem do atlas, como `data:` URL, ou `null`.
 *
 * `null` quando não há navegador, quando a imagem ainda não carregou, ou quando
 * o nome não está no atlas — e nesse caso quem chamou mostra só o nome, que é o
 * que já mostrava antes.
 *
 * A imagem é encaixada num quadrado, sem esticar: um braço comprido continua
 * comprido, e é assim que se reconhece a peça.
 */
export function thumbnailFor(
  doc: EditorDoc, path: string, size = THUMB_SIZE, withPivot = false,
): string | null {
  // A marca "Arte em pixel" entra na chave: ligar a caixa refaz as miniaturas.
  // O pivô também (lote 56): carimbar muda a cruz sem mudar a imagem.
  const region = withPivot ? findAtlasRegion(doc.atlases, path) : null;
  const pivot = withPivot ? `@p${region?.pivotX ?? ''},${region?.pivotY ?? ''}` : '';
  const key = `${path}@${size}@${smoothingFor(doc.file.skeleton) ? 'suave' : 'pixel'}${pivot}`;
  const known = cache.get(key);
  if (known !== undefined) return known;

  const made = build(doc, path, size, withPivot);
  cache.set(key, made);
  return made;
}

/**
 * Onde o pivô da região cai na miniatura, em px dela, ou `null` sem pivô —
 * lote 56. A miniatura mostra o recorte como está na página (deitado, quando
 * `rotation` é 90), encaixado sem esticar; a cruz vai no mesmo lugar do desenho.
 */
export function pivotInThumb(region: {
  width: number; height: number; rotation: 0 | 90; offsetX: number; offsetY: number;
  originalWidth: number; originalHeight: number; pivotX?: number; pivotY?: number;
}, size: number): { x: number; y: number } | null {
  if (region.pivotX === undefined && region.pivotY === undefined) return null;
  const px = region.pivotX ?? region.originalWidth / 2;
  const py = region.pivotY ?? region.originalHeight / 2;
  const cx = px - region.offsetX;                    // da esquerda do recorte
  const cy = region.offsetY + region.height - py;    // do topo do recorte
  const turned = region.rotation === 90;
  const onPage = turned ? { x: region.height - cy, y: cx } : { x: cx, y: cy };
  const wide = Math.max(1, turned ? region.height : region.width);
  const tall = Math.max(1, turned ? region.width : region.height);
  const scale = size / Math.max(wide, tall);
  return {
    x: (size - wide * scale) / 2 + onPage.x * scale,
    y: (size - tall * scale) / 2 + onPage.y * scale,
  };
}

/** Uma cruz laranja com borda escura: aparece em cima de desenho claro e escuro. */
function drawPivotCross(ctx: CanvasRenderingContext2D, at: { x: number; y: number }, size: number): void {
  const arm = Math.max(3, Math.round(size * 0.14));
  ctx.save();
  ctx.lineCap = 'round';
  for (const [color, width] of [['rgba(0, 0, 0, 0.85)', 3], ['#ff9a1f', 1.5]] as const) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(at.x - arm, at.y);
    ctx.lineTo(at.x + arm, at.y);
    ctx.moveTo(at.x, at.y - arm);
    ctx.lineTo(at.x, at.y + arm);
    ctx.stroke();
  }
  ctx.restore();
}

function build(doc: EditorDoc, path: string, size: number, withPivot = false): string | null {
  if (typeof document === 'undefined') return null;
  const region = findAtlasRegion(doc.atlases, path);
  if (region === null) return null;
  const source = doc.imageFor(region.page);
  if (source === null) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;

  const place = cropPlacement(region);
  const wide = Math.max(1, place.sw);
  const tall = Math.max(1, place.sh);
  // Encaixa sem esticar: a maior medida vira o lado do quadrado.
  const scale = size / Math.max(wide, tall);
  const drawW = wide * scale;
  const drawH = tall * scale;
  // Arte em pixel (§4.1): a peça encolhida ou ampliada fica de pixel duro — lote 48.
  ctx.imageSmoothingEnabled = smoothingFor(doc.file.skeleton);
  try {
    ctx.drawImage(
      source, place.sx, place.sy, place.sw, place.sh,
      (size - drawW) / 2, (size - drawH) / 2, drawW, drawH,
    );
    const cross = withPivot ? pivotInThumb(region, size) : null;
    if (cross !== null) {
      // O pivô pode cair fora do desenho (a mão presa no antebraço tem o pivô
      // no cotovelo). Aí a cruz fica na borda, do lado para onde ele aponta:
      // cortada inteira, pareceria que o Carimbar não fez nada.
      const edge = Math.max(2, Math.round(size * 0.06));
      const clamp = (v: number): number => Math.min(size - edge, Math.max(edge, v));
      drawPivotCross(ctx, { x: clamp(cross.x), y: clamp(cross.y) }, size);
    }
    return canvas.toDataURL('image/png');
  } catch {
    // Imagem de outra origem deixa o canvas "sujo" e `toDataURL` recusa. Sem
    // miniatura, o nome continua lá.
    return null;
  }
}


// ---------------------------------------------------------------------------
// Miniatura de QUALQUER desenho — anotação 18, lote 32
// ---------------------------------------------------------------------------

/**
 * O plano de miniatura de um desenho deste documento.
 *
 * Quem sabe o que mostrar é o `thumbnail-kind.ts`, que é puro. Aqui só se
 * procura a definição do desenho nas peles do arquivo.
 */
export function thumbnailPlan(doc: EditorDoc, slot: string, attachment: string): ThumbPlan {
  const achado = findAttachment(doc.file, slot, attachment);
  return thumbnailKind(achado?.def ?? null, attachment);
}

/**
 * O esqueleto filho de um slot, desenhado na pose de repouso, como `data:` URL.
 *
 * `null` quando não há navegador, quando o filho não carregou (o `uri` não
 * resolveu, o arquivo não veio junto) ou quando ele não tem tamanho nenhum —
 * e nesses casos quem chamou mostra o ícone de osso, que é o combinado.
 */
export function skeletonThumbnail(doc: EditorDoc, slot: string, size = THUMB_SIZE): string | null {
  if (typeof document === 'undefined') return null;
  const live = doc.skeleton?.findSlot(slot) ?? null;
  const nested = live?.nestedSkeleton() ?? null;
  if (nested === null) return null;

  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx === null) return null;

  // Rodada 8c, o salto da espada: um esqueleto NOVO, dos mesmos dados. Era o
  // filho VIVO (`nested.skeleton`), posto em repouso para a foto — e a espada
  // da cena ficava em repouso até a pose seguinte. Toda chave nova refaz as
  // miniaturas da Árvore e da Ordem: a lâmina "saltava ~1,8" na primeira chave
  // de qualquer peça, e o Ctrl+Z (outra mudança de estrutura) não a devolvia.
  // É a forma de `entity-thumb.ts`, que já fazia certo.
  let child: Skeleton;
  try {
    child = new Skeleton(nested.skeleton.data);
  } catch {
    return null;
  }
  child.setToSetupPose();
  child.updateWorldTransform();
  const caixa = child.getBounds();
  if (caixa.width <= 0 || caixa.height <= 0) return null;

  // Encaixa sem esticar, com uma folga de 10%: a espada inteira dentro do
  // quadrado é o que responde "o que é isso?".
  const zoom = (size / Math.max(caixa.width, caixa.height)) * 0.9;
  const cx = caixa.x + caixa.width / 2;
  const cy = caixa.y + caixa.height / 2;
  const renderer = new CanvasRenderer(ctx, { images: (page: AtlasPageData) => doc.imageFor(page) });
  try {
    // Y sobe no arquivo e desce no canvas (§3.3).
    ctx.setTransform(zoom, 0, 0, -zoom, size / 2 - cx * zoom, size / 2 + cy * zoom);
    renderer.draw(child);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    return canvas.toDataURL('image/png');
  } catch {
    // Imagem de outra origem suja o canvas e `toDataURL` recusa; o ícone vale.
    return null;
  }
}

/**
 * A miniatura pronta para pôr na tela: `<img>`, ou o ícone do tipo.
 *
 * **Nunca devolve nulo, e nunca devolve caixa vazia.** Uma linha sem imagem
 * mostra o ícone do tipo, e a dica diz o nome do tipo por extenso — é o que
 * separa "isto é um ponto" de "isto está quebrado".
 */
export function thumbnailNode(
  doc: EditorDoc, slot: string, attachment: string | null, size = THUMB_SIZE,
): HTMLElement {
  const plano = attachment === null
    ? thumbnailKind(null)
    : thumbnailPlan(doc, slot, attachment);

  if (plano.kind === 'imagem') {
    const url = thumbnailFor(doc, plano.source, size);
    if (url !== null) return imagem(url, size, plano.badge);
  }
  if (plano.kind === 'esqueleto') {
    const url = skeletonThumbnail(doc, slot, size);
    if (url !== null) return imagem(url, size);
  }
  return icone(plano, size);
}

/** A imagem, com o cantinho dizendo quantos quadros quando é sequência. */
function imagem(url: string, size: number, badge?: number): HTMLElement {
  const img = el('img', 'mini-img') as HTMLImageElement;
  img.src = url;
  img.width = size;
  img.height = size;
  // A imagem é decoração: quem diz o nome é o texto ao lado dela.
  img.alt = '';
  if (badge === undefined) return img;
  const caixa = el('span', 'mini-caixa');
  const conta = el('span', 'mini-conta', String(badge));
  conta.title = `Sequência de ${badge} quadros`;
  caixa.append(img, conta);
  return caixa;
}

/** O ícone do tipo, para quem não tem imagem nenhuma. */
function icone(plano: ThumbPlan, size: number): HTMLElement {
  const nome = plano.kind === 'icone' ? plano.icon : 'bone';
  const tipo = plano.kind === 'icone' ? plano.tipo : 'entidade';
  const node = el('span', 'mini-icone');
  if (!paintIcon(node, nome, Math.round(size * 0.8))) paintIcon(node, 'image', Math.round(size * 0.8));
  node.title = tipo;
  node.setAttribute('aria-hidden', 'true');
  return node;
}
