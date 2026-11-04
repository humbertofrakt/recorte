/**
 * **A montagem de teste na cena** — rodada 39, lote 3 (06/10/2026). Plano
 * `22`, §5: com **Na cena** ligado, a cena desenha a peça de teste no lugar
 * da imagem, enquanto ele anima.
 *
 * | O quê | Como |
 * |:---|:---|
 * | desenha | **normal**, para julgar como fica (pergunta 2 do plano) |
 * | clica | **não**: o esqueleto vivo da cena continua o do arquivo. O clique vai ao que o ARQUIVO tem ali — a imagem de baixo — e nunca à peça de teste |
 * | mexe | segue o osso do slot, pela animação do boneco. A peça entra parada (a pose de repouso dela) |
 *
 * Como, por dentro, sem tocar no documento: só **durante o desenho**, o slot
 * vivo mostra o anexo `skeleton` do esqueleto montado com a montagem
 * (`dataWithMontagem`); a instância da peça é posta no osso do slot e posada;
 * o desenhador desenha o slot na ordem dele, como desenha qualquer entidade
 * (spec 7.11); e o slot volta ao que era antes de o quadro acabar. O clique, a
 * Árvore e as Propriedades nunca veem a troca.
 *
 * O esqueleto montado é guardado enquanto o arquivo e a montagem não mudam: a
 * cena desenha a cada quadro, e remontar a cada quadro seria jogar trabalho fora.
 */

import { Skeleton, applyAnimation, loadSkeletonData } from '../../../runtime/src/index.js';
import type { Attachment, BoneFile, Matrix2x3, SkeletonData, Slot } from '../../../runtime/src/index.js';
import type { EditorDoc } from '../contract.js';
import { skeletonsDe } from '../contract.js';
import { montagemDe } from '../doc/montagem.js';
import { cenaMontadaDe } from '../doc/projeto.js';
import {
  chainUp, dataWithMontagem, drawingOfSlot, naCena, outerFile, testSlotsInScene,
} from '../panels/entities-cards-model.js';
import { SwapForEntity } from '../panels/image-picker-model.js';

type Nested = NonNullable<Slot['nested']>;

/** O esqueleto montado da última vez, e de que ele foi feito. */
let guardado: { base: SkeletonData | null; chave: string; data: SkeletonData | null } | null = null;
/** A instância viva de cada peça de teste, pelo anexo do esqueleto montado. */
let instancias = new WeakMap<Attachment, Nested>();

/** O esqueleto montado, guardado enquanto o arquivo e a montagem não mudam. */
function montado(doc: EditorDoc): SkeletonData | null {
  const chave = JSON.stringify(montagemDe(doc));
  if (guardado !== null && guardado.base === doc.data && guardado.chave === chave) return guardado.data;
  guardado = { base: doc.data, chave, data: dataWithMontagem(doc) };
  instancias = new WeakMap();
  return guardado.data;
}

/** O anexo `skeleton` que o esqueleto montado tem no slot, com o nome que o slot vivo mostra. */
function anexoDeTeste(data: SkeletonData, slot: Slot): Attachment | null {
  const nome = slot.attachment?.name;
  if (nome === undefined) return null;
  for (const skin of data.skins) {
    const att = skin.getAttachment(slot.data.index, nome);
    if (att !== null && att !== undefined && att.type === 'skeleton') return att;
  }
  return null;
}

/**
 * **Desenha com as peças de teste no lugar**, e devolve o esqueleto como
 * estava. `draw` é o desenho da cena; ele roda uma vez, sempre — com Na cena
 * desligado, ou sem peça, é só ele. Devolve quantas peças entraram.
 */
export function drawWithTestPieces(doc: EditorDoc, skeleton: Skeleton, draw: () => void): number {
  const slots = testSlotsInScene(doc);
  const data = slots.size === 0 ? null : montado(doc);
  if (data === null) {
    draw();
    return 0;
  }
  const volta: Array<{ slot: Slot; attachment: Attachment | null; nested: Slot['nested'] }> = [];
  for (const nome of slots) {
    const slot = skeleton.findSlot(nome);
    if (slot === null || slot.attachment === null || !slot.visible) continue;
    const att = anexoDeTeste(data, slot);
    if (att === null) continue;
    volta.push({ slot, attachment: slot.attachment, nested: slot.nested });
    // O campo, e não `setAttachment`: este troca a deformação e a sequência do
    // slot, e a volta tem de deixar o slot EXATAMENTE como estava.
    slot.attachment = att;
    slot.nested = instancias.get(att) ?? null;
    const viva = slot.nestedSkeleton();
    if (viva === null) continue;
    instancias.set(att, viva as Nested);
    viva.update(slot, doc.time);
  }
  try {
    draw();
  } finally {
    for (let i = volta.length - 1; i >= 0; i--) {
      const { slot, attachment, nested } = volta[i]!;
      slot.attachment = attachment;
      slot.nested = nested;
    }
  }
  return volta.length;
}

// ---------------------------------------------------------------------------
// Lote 4: quem está EM VOLTA — o mecha em volta do boneco, a nave em volta do mecha
// ---------------------------------------------------------------------------

/** Um nível de fora: o esqueleto dele, e o slot em que o de dentro está. */
interface Nivel {
  uri: string;
  slot: string;
  skeleton: Skeleton;
  /** A imagem do slot do de dentro, para voltar a ela depois de posar (lote 6). */
  desenho: string;
  /** O que ele toca (lote 6): `undefined` = parado; `''` = a de mesmo nome que o boneco; um nome. */
  anima: string | undefined;
}

/**
 * Os níveis montados da última vez, POR DOCUMENTO (lote 7: um cache só,
 * global, vazava os níveis de um documento para outro com a mesma cadeia).
 */
const niveisGuardados = new WeakMap<EditorDoc, { chave: string; niveis: Nivel[] }>();
/** O documento em que esta conta pôs a âncora, e a âncora dela. */
const ancoras = new WeakMap<EditorDoc, () => Matrix2x3 | null>();

/**
 * Os níveis em volta do projeto aberto, de dentro para fora, ou `[]`. Cada um
 * é uma CÓPIA do arquivo de fora com o slot trocado por um anexo `skeleton` do
 * de dentro (a mesma conta da grade: o de dentro cai no pivô da imagem). O de
 * dentro não vai no mapa dos aninhados: quem o desenha é a cena, e não o de fora.
 */
function niveis(doc: EditorDoc, sempre = false): Nivel[] {
  // Lote 7: a Prévia mostra quem está em volta SEMPRE; a cena, só com Na cena.
  if ((!sempre && !naCena(doc)) || cenaMontadaDe(doc) !== null) return [];
  const cadeia = chainUp(doc);
  if (cadeia.length === 0) return [];
  const chave = JSON.stringify(cadeia);
  const guardados = niveisGuardados.get(doc);
  if (guardados !== undefined && guardados.chave === chave) return guardados.niveis;
  const out: Nivel[] = [];
  for (const elo of cadeia) {
    const original = outerFile(doc, elo.uri);
    const desenho = original === null ? null : drawingOfSlot(original, elo.slot);
    if (original === null || desenho === null) break;
    const file = JSON.parse(JSON.stringify(original)) as BoneFile;
    const skin = (file.skins ?? []).find((s) => s.attachments?.[elo.slot]?.[desenho] !== undefined);
    if (skin === undefined) break;
    new SwapForEntity(elo.slot, desenho, skin.name, elo.base).apply({ file, atlases: doc.atlases } as unknown as EditorDoc);
    const filhos = new Map(skeletonsDe(doc));
    filhos.delete(elo.base);
    try {
      const data = loadSkeletonData(file as unknown, { atlases: doc.atlases, skeletons: filhos });
      const skeleton = new Skeleton(data);
      // Lote 6: as skins de teste do cartão, por cima da default.
      const skins = (elo.skins ?? []).filter((nome) => data.findSkin(nome) !== null);
      if (skins.length > 0) skeleton.setSkin(skins);
      skeleton.setToSetupPose();
      // O slot do de dentro mostra o que o arquivo de fora diz, mesmo que só por chave.
      skeleton.findSlot(elo.slot)?.setAttachmentName(desenho);
      out.push({ uri: elo.uri, slot: elo.slot, skeleton, desenho, anima: elo.anima });
    } catch {
      break;
    }
  }
  niveisGuardados.set(doc, { chave, niveis: out });
  return out;
}

/** A matriz do slot `slot` de `skeleton`, pela conta do runtime (spec 7.11). */
function matrizDoSlot(skeleton: Skeleton, slot: string): Matrix2x3 | null {
  const vivo = skeleton.findSlot(slot);
  if (vivo === null) return null;
  const anexo = vivo.attachment as { type?: string; computeParentMatrix?: (m: Matrix2x3) => Matrix2x3 } | null;
  const osso = vivo.boneMatrix;
  if (anexo?.type === 'skeleton' && typeof anexo.computeParentMatrix === 'function') return anexo.computeParentMatrix(osso);
  return { a: osso.a, b: osso.b, c: osso.c, d: osso.d, worldX: osso.worldX, worldY: osso.worldY };
}

/**
 * Posa os níveis de fora para dentro: o mais de fora na origem; cada um de
 * dentro preso ao slot do de fora. Devolve a matriz em que o projeto aberto se
 * apoia, ou `null`.
 *
 * Lote 6: cada nível toca a animação do cartão dele **no relógio da agulha**
 * (`doc.time`, em laço: plano `22`, pergunta 6). Parado = a pose de repouso.
 */
function posar(doc: EditorDoc, lista: readonly Nivel[], tempo = doc.time): Matrix2x3 | null {
  let pai: Matrix2x3 | null = null;
  for (let i = lista.length - 1; i >= 0; i--) {
    const { skeleton, slot, desenho, anima } = lista[i]!;
    skeleton.parentMatrix = pai === null ? null : { ...pai };
    const nome = anima === '' ? doc.animation : anima ?? null;
    const animacao = nome === null ? null : skeleton.data.findAnimation(nome);
    if (animacao !== null) {
      skeleton.setToSetupPose();
      skeleton.findSlot(slot)?.setAttachmentName(desenho);
      const d = animacao.duration;
      applyAnimation(skeleton, animacao, d > 0 ? tempo - Math.floor(tempo / d) * d : tempo);
      skeleton.findSlot(slot)?.setAttachmentName(desenho);
    }
    skeleton.updateWorldTransform(tempo);
    pai = matrizDoSlot(skeleton, slot);
  }
  return pai;
}

/**
 * **Prende o projeto aberto ao slot do de fora** — a âncora da rodada 8b, em
 * mais níveis. As chaves do boneco não mudam: só onde ele está na tela. Sem
 * nada em volta (ou com Na cena desligado), a âncora que esta conta pôs sai;
 * a da cena montada (animar a espada por dentro) nunca é tocada.
 */
export function syncChainAnchor(doc: EditorDoc): void {
  const lista = niveis(doc);
  const minha = ancoras.get(doc) ?? null;
  const setAnchor = (doc as { setAnchor?: (fn: (() => Matrix2x3 | null) | null) => void }).setAnchor;
  if (typeof setAnchor !== 'function') return;
  if (lista.length === 0) {
    if (minha !== null) {
      ancoras.delete(doc);
      setAnchor.call(doc, null);
    }
    return;
  }
  if (minha !== null) return;
  const fn = (): Matrix2x3 | null => posar(doc, niveis(doc));
  ancoras.set(doc, fn);
  setAnchor.call(doc, fn);
}

/**
 * **Desenha quem está em volta**, por trás e pela frente: de cada nível de
 * fora, primeiro o que vem ANTES do slot do de dentro, depois o de dentro
 * (`drawInner`), depois o que vem DEPOIS. O slot do de dentro não é desenhado
 * pelo de fora: é o de dentro que está ali. Devolve quantos níveis entraram.
 */
export function drawWithChain(doc: EditorDoc, drawSkeleton: (skeleton: Skeleton) => void, drawInner: () => void): number {
  return drawLevels(doc, niveis(doc), doc.time, drawSkeleton, drawInner);
}

/**
 * **A Prévia com quem está em volta** — lote 7 (desvio do lote 4). A mesma
 * conta da cena, mas sempre (com ou sem Na cena) e no relógio da Prévia.
 * Devolve a matriz em que o boneco da Prévia se apoia, ou `null`.
 */
export function previewChainAnchor(doc: EditorDoc, tempo: number): Matrix2x3 | null {
  const lista = niveis(doc, true);
  return lista.length === 0 ? null : posar(doc, lista, tempo);
}

/** Desenha quem está em volta na Prévia, por trás e pela frente. Devolve quantos níveis. */
export function drawChainAround(doc: EditorDoc, tempo: number, drawSkeleton: (skeleton: Skeleton) => void, drawInner: () => void): number {
  return drawLevels(doc, niveis(doc, true), tempo, drawSkeleton, drawInner);
}

/** Os esqueletos de fora, posados em `tempo`, para a Prévia caber o conjunto na tela. */
export function posedChain(doc: EditorDoc, tempo: number): Skeleton[] {
  const lista = niveis(doc, true);
  posar(doc, lista, tempo);
  return lista.map((n) => n.skeleton);
}

function drawLevels(
  doc: EditorDoc, lista: readonly Nivel[], tempo: number, drawSkeleton: (skeleton: Skeleton) => void, drawInner: () => void,
): number {
  if (lista.length === 0) {
    drawInner();
    return 0;
  }
  posar(doc, lista, tempo);
  const camada = (k: number): void => {
    if (k < 0) {
      drawInner();
      return;
    }
    const { skeleton, slot } = lista[k]!;
    const ordem = skeleton.drawOrder;
    const i = ordem.findIndex((s) => s.data.name === slot);
    const passe = (esconde: (j: number) => boolean): void => {
      const voltar: Slot[] = [];
      ordem.forEach((s, j) => { if (esconde(j) && s.visible) { s.visible = false; voltar.push(s); } });
      try {
        drawSkeleton(skeleton);
      } finally {
        for (const s of voltar) s.visible = true;
      }
    };
    passe((j) => i >= 0 && j >= i);
    camada(k - 1);
    if (i >= 0) passe((j) => j <= i);
  };
  camada(lista.length - 1);
  return lista.length;
}
