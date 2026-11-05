/**
 * **O recorte na cena** — N-4b, a última linha da fila de 29/09/2026.
 *
 * O `animation.crop` (spec 4.6) é a área que a exportação de imagem usa quando
 * se escolhe *"A área desenhada nesta animação"*. Até aqui ele só se via: o
 * retângulo magenta aparecia na cena quando o arquivo já o trazia, e criá-lo
 * ou mudá-lo era escrever JSON à mão. O Humberto pediu o gesto do Photoshop e
 * do Spine: **arrastar na cena**.
 *
 * Este módulo é a conta, sem tela nenhuma (regra 8):
 *
 * | Peça | O que faz |
 * |:---|:---|
 * | `cropZoneAt` | o que está debaixo do ponteiro: um dos oito puxadores ou o meio |
 * | `dragCrop` | o retângulo depois de puxar uma zona por `dx, dy` |
 * | `cropFromCorners` | o retângulo traçado de um canto ao outro |
 * | `SetCrop` | o comando: grava, troca ou tira o `crop`, com `apply`/`revert` exatos |
 * | o modo | *Recorte na cena* ligado ou não — estado do editor, nunca do arquivo |
 *
 * **Unidade e faixa** (régua do doc `68`, R2 e R3): px do esqueleto, inteiros.
 * X e Y de −∞ a +∞; Largura e Altura de 1 para cima. O formato aceita 0
 * (`RANGE_CROP` só recusa negativo), mas um retângulo de largura 0 não sai na
 * cena nem na exportação — ele cai no corte automático e avisa. Um gesto da
 * cena nunca o produz: o editor não fabrica o que ele mesmo não desenha.
 */

import type { Command, EditorDoc } from '../contract.js';
import type { BoneFile } from '../../../runtime/src/index.js';

// ---------------------------------------------------------------------------
// O retângulo
// ---------------------------------------------------------------------------

/** O `animation.crop`, em px do esqueleto, canto inferior esquerdo, Y para cima. */
export interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** O que se pega no retângulo: um dos oito puxadores, ou o meio (mover). */
export type CropZone = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'move';

/** O lado do quadradinho do puxador, em pixels de TELA. */
export const CROP_HANDLE_PIXELS = 8;

/** O menor lado que o gesto deixa, em px do esqueleto. */
export const CROP_MIN = 1;

/** Menor que isto na tela, num dos lados, e o traço novo é um clique. */
export const CROP_MIN_DRAW_PIXELS = 6;

/** A margem em volta do desenho quando o recorte nasce sozinho, em px. */
export const CROP_BIRTH_MARGIN = 10;

/** Os oito puxadores, na ordem do relógio a partir do canto de cima à esquerda. */
export const CROP_HANDLE_ZONES: readonly Exclude<CropZone, 'move'>[] = Object.freeze([
  'nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w',
]);

/** O nome de cada zona, para a dica e o rodapé. */
export const CROP_ZONE_WORDS: Readonly<Record<CropZone, string>> = Object.freeze({
  nw: 'canto de cima à esquerda',
  n: 'lado de cima',
  ne: 'canto de cima à direita',
  e: 'lado direito',
  se: 'canto de baixo à direita',
  s: 'lado de baixo',
  sw: 'canto de baixo à esquerda',
  w: 'lado esquerdo',
  move: 'meio',
});

/** O cursor de cada zona, como classe CSS da cena (`viewport.css`). */
export const CROP_ZONE_CURSOR: Readonly<Record<CropZone, string>> = Object.freeze({
  nw: 'cursor-recorte-nwse',
  se: 'cursor-recorte-nwse',
  ne: 'cursor-recorte-nesw',
  sw: 'cursor-recorte-nesw',
  n: 'cursor-recorte-ns',
  s: 'cursor-recorte-ns',
  e: 'cursor-recorte-ew',
  w: 'cursor-recorte-ew',
  move: 'cursor-recorte-mover',
});

/** O cursor de fora do retângulo, com o modo ligado: traçar um novo. */
export const CROP_DRAW_CURSOR = 'cursor-recorte-tracar';

/**
 * Onde fica cada puxador, no mundo. Y para cima: o lado de cima é `y + height`.
 */
export function cropHandles(box: CropBox): Array<{ zone: Exclude<CropZone, 'move'>; x: number; y: number }> {
  const x0 = box.x;
  const x1 = box.x + box.width;
  const xm = box.x + box.width / 2;
  const y0 = box.y;
  const y1 = box.y + box.height;
  const ym = box.y + box.height / 2;
  return [
    { zone: 'nw', x: x0, y: y1 },
    { zone: 'n', x: xm, y: y1 },
    { zone: 'ne', x: x1, y: y1 },
    { zone: 'e', x: x1, y: ym },
    { zone: 'se', x: x1, y: y0 },
    { zone: 's', x: xm, y: y0 },
    { zone: 'sw', x: x0, y: y0 },
    { zone: 'w', x: x0, y: ym },
  ];
}

/**
 * O que está debaixo do ponteiro. `radius` em unidades do MUNDO (a cena passa
 * pixels de tela divididos pelo zoom), para o puxador ter o mesmo tamanho na
 * mão em qualquer zoom.
 *
 * Ordem: canto antes de lado (no retângulo pequeno eles se encostam, e o canto
 * faz mais), lado antes do meio. Fora do retângulo e longe dos puxadores,
 * `null`: com o modo ligado, é ali que se traça um retângulo novo.
 */
export function cropZoneAt(box: CropBox, x: number, y: number, radius: number): CropZone | null {
  const handles = cropHandles(box);
  const near = (h: { x: number; y: number }): boolean =>
    Math.abs(x - h.x) <= radius && Math.abs(y - h.y) <= radius;
  for (const h of handles) if (h.zone.length === 2 && near(h)) return h.zone;
  for (const h of handles) if (h.zone.length === 1 && near(h)) return h.zone;
  // A borda inteira puxa o lado, não só o quadradinho do meio dela: é o que o
  // Photoshop faz, e o retângulo grande teria lados de 1 px de pega.
  const inX = x >= box.x - radius && x <= box.x + box.width + radius;
  const inY = y >= box.y - radius && y <= box.y + box.height + radius;
  if (inY && Math.abs(x - box.x) <= radius) return 'w';
  if (inY && Math.abs(x - (box.x + box.width)) <= radius) return 'e';
  if (inX && Math.abs(y - box.y) <= radius) return 's';
  if (inX && Math.abs(y - (box.y + box.height)) <= radius) return 'n';
  if (x > box.x && x < box.x + box.width && y > box.y && y < box.y + box.height) return 'move';
  return null;
}

/** Inteiro, sem `-0`. */
function whole(value: number): number {
  const r = Math.round(value);
  return r === 0 ? 0 : r;
}

/** O retângulo em inteiros, com os lados de pelo menos `CROP_MIN`. */
export function tidyCrop(box: CropBox): CropBox {
  return {
    x: whole(box.x),
    y: whole(box.y),
    width: Math.max(CROP_MIN, whole(box.width)),
    height: Math.max(CROP_MIN, whole(box.height)),
  };
}

/**
 * O retângulo depois de puxar `zone` por `dx, dy` (no mundo), a partir de
 * `start` — o de quando o botão desceu, e não o do quadro anterior: somar
 * passo a passo acumularia o arredondamento.
 *
 * Um lado puxado para além do outro **não vira o retângulo do avesso**: ele
 * para a `CROP_MIN` do lado oposto, que fica onde estava. Virar do avesso faz
 * a mão perder o puxador que segura (o "canto de cima" passa a ser o de baixo).
 */
export function dragCrop(start: CropBox, zone: CropZone, dx: number, dy: number): CropBox {
  if (zone === 'move') {
    return tidyCrop({ ...start, x: start.x + dx, y: start.y + dy });
  }
  let left = start.x;
  let right = start.x + start.width;
  let bottom = start.y;
  let top = start.y + start.height;
  if (zone.includes('w')) left = Math.min(left + dx, right - CROP_MIN);
  if (zone.includes('e')) right = Math.max(right + dx, left + CROP_MIN);
  if (zone.includes('s')) bottom = Math.min(bottom + dy, top - CROP_MIN);
  if (zone.includes('n')) top = Math.max(top + dy, bottom + CROP_MIN);
  // Arredonda as BORDAS, não a largura: o lado que não se mexeu fica parado
  // no inteiro em que estava.
  const l = whole(left);
  const r = whole(right);
  const b = whole(bottom);
  const t = whole(top);
  return {
    x: l,
    y: b,
    width: Math.max(CROP_MIN, r - l),
    height: Math.max(CROP_MIN, t - b),
  };
}

/** O retângulo traçado de um canto `(ax, ay)` ao outro `(bx, by)`, em qualquer direção. */
export function cropFromCorners(ax: number, ay: number, bx: number, by: number): CropBox {
  const l = whole(Math.min(ax, bx));
  const r = whole(Math.max(ax, bx));
  const b = whole(Math.min(ay, by));
  const t = whole(Math.max(ay, by));
  return { x: l, y: b, width: Math.max(CROP_MIN, r - l), height: Math.max(CROP_MIN, t - b) };
}

/**
 * O retângulo que nasce ao ligar o modo numa animação sem `crop`: o desenho do
 * quadro de agora, com uma margem, em inteiros para fora. `null` quando não há
 * desenho nenhum — aí não se inventa tamanho (regra 21): o rodapé pede o traço.
 */
export function cropAroundDrawing(
  bounds: { x: number; y: number; width: number; height: number } | null,
  margin = CROP_BIRTH_MARGIN,
): CropBox | null {
  if (bounds === null) return null;
  const { x, y, width, height } = bounds;
  if (![x, y, width, height].every(Number.isFinite) || !(width > 0) || !(height > 0)) return null;
  const l = Math.floor(x - margin);
  const b = Math.floor(y - margin);
  const r = Math.ceil(x + width + margin);
  const t = Math.ceil(y + height + margin);
  return { x: l === 0 ? 0 : l, y: b === 0 ? 0 : b, width: r - l, height: t - b };
}

// ---------------------------------------------------------------------------
// O arquivo
// ---------------------------------------------------------------------------

type AnimationJson = NonNullable<BoneFile['animations']>[number];

function animationIn(file: BoneFile, name: string): AnimationJson | null {
  return (file.animations ?? []).find((a) => a.name === name) ?? null;
}

/**
 * O `crop` como o ARQUIVO o traz, completo, ou `null`. Campo que falta vale o
 * que o leitor diz (4.6: `x`, `y` 0; sem largura, 0); largura ou altura não
 * positiva é `null`, como na cena e na exportação.
 */
export function cropInFile(file: BoneFile, animation: string | null): CropBox | null {
  if (animation === null) return null;
  const crop = animationIn(file, animation)?.crop;
  if (crop === undefined || crop === null || typeof crop !== 'object') return null;
  const box = { x: crop.x ?? 0, y: crop.y ?? 0, width: crop.width ?? 0, height: crop.height ?? 0 };
  if (![box.x, box.y, box.width, box.height].every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
  if (!(box.width > 0) || !(box.height > 0)) return null;
  return box;
}

/**
 * A área desenhada da animação aberta (spec 4.6), como o LEITOR a entendeu
 * (`doc.data`), ou `null`. É o que a cena desenha e o que a exportação usa —
 * degrau 10, tarefa 10.4; veio do `viewport-draw.ts` no N-4b.
 */
export function cropOfOpenAnimation(doc: EditorDoc): CropBox | null {
  if (doc.animation === null) return null;
  const crop = doc.data?.animations.find((entry) => entry.name === doc.animation)?.crop ?? null;
  if (crop === null || !(crop.width > 0) || !(crop.height > 0)) return null;
  return crop;
}

/** `true` quando a animação tem o campo `crop`, valendo ou não. */
export function hasCropField(file: BoneFile, animation: string | null): boolean {
  if (animation === null) return false;
  const anim = animationIn(file, animation);
  return anim !== null && Object.prototype.hasOwnProperty.call(anim, 'crop');
}

/** O número curto, como o rodapé e a dica escrevem: `−12`, `320`. */
export function cropNumber(n: number): string {
  return n < 0 ? `−${Math.abs(n)}` : String(n);
}

/** O que o rodapé diz do retângulo: tamanho e canto, com unidade (R9). */
export function cropSays(box: CropBox): string {
  return `${cropNumber(box.width)} × ${cropNumber(box.height)} px, canto em `
    + `(${cropNumber(box.x)}, ${cropNumber(box.y)}) px`;
}

/**
 * **O comando do recorte**: grava `next` no `crop` da animação, ou tira o
 * campo (`next === null`). O `revert` devolve EXATAMENTE o que havia — o
 * objeto antigo, com campo a mais ou a menos que tivesse, ou campo nenhum.
 *
 * `animationOnly`: o `crop` mora na animação, e o documento relê só as
 * animações (o `data.animations[].crop` que a cena e a exportação leem fica
 * em dia sem reler o arquivo inteiro a cada movimento do mouse).
 *
 * `source` junta os passos de um arrasto num passo de desfazer só: dois
 * `SetCrop` seguidos, da mesma animação e da mesma fonte, viram um. O fim do
 * arrasto chama `endMerge`, e o próximo gesto é passo próprio.
 */
export class SetCrop implements Command {
  readonly kind = 'structure' as const;
  readonly animationOnly: string;
  readonly label: string;
  /** O que havia antes do PRIMEIRO passo do gesto. `undefined` = sem campo. */
  private before: unknown = undefined;
  private hadField = false;
  private captured = false;

  constructor(
    readonly animation: string,
    readonly next: CropBox | null,
    readonly source: string | null = null,
    label?: string,
  ) {
    this.animationOnly = animation;
    this.label = label ?? (next === null ? 'Tirar o recorte' : `Recorte: ${cropSays(next)}`);
  }

  apply(doc: EditorDoc): void {
    const anim = animationIn(doc.file, this.animation);
    if (anim === null) return;
    if (!this.captured) {
      this.hadField = Object.prototype.hasOwnProperty.call(anim, 'crop');
      this.before = this.hadField ? structuredClone(anim.crop) : undefined;
      this.captured = true;
    }
    if (this.next === null) delete anim.crop;
    else anim.crop = { x: this.next.x, y: this.next.y, width: this.next.width, height: this.next.height };
  }

  revert(doc: EditorDoc): void {
    const anim = animationIn(doc.file, this.animation);
    if (anim === null) return;
    if (this.hadField) anim.crop = structuredClone(this.before) as AnimationJson['crop'];
    else delete anim.crop;
  }

  mergeWith(previous: Command): boolean {
    if (!(previous instanceof SetCrop)) return false;
    if (this.source === null || previous.source !== this.source || previous.animation !== this.animation) return false;
    // O "antes" do gesto inteiro é o do primeiro passo.
    this.hadField = previous.hadField;
    this.before = previous.before;
    this.captured = true;
    return true;
  }
}

/** Os quatro números do recorte, na ordem da caixa da cena (régua R2–R4 do doc `68`). */
export const CROP_FIELDS: ReadonlyArray<{
  key: keyof CropBox; nome: string; rotulo: string; min?: number; dica: string;
}> = Object.freeze([
  {
    key: 'x', nome: 'X do recorte', rotulo: 'X',
    dica: 'X do recorte, em px, de −∞ a +∞: onde fica o lado esquerdo, em unidades do esqueleto. Típico: um pouco à esquerda do desenho',
  },
  {
    key: 'y', nome: 'Y do recorte', rotulo: 'Y',
    dica: 'Y do recorte, em px, de −∞ a +∞: onde fica o lado de baixo (Y para cima, como a cena). Típico: um pouco abaixo dos pés',
  },
  {
    key: 'width', nome: 'Largura do recorte', rotulo: 'L', min: 1,
    dica: 'Largura do recorte, em px, de 1 para cima: quanto da cena sai na imagem, de lado. Típico: o desenho mais uma margem',
  },
  {
    key: 'height', nome: 'Altura do recorte', rotulo: 'A', min: 1,
    dica: 'Altura do recorte, em px, de 1 para cima: quanto da cena sai na imagem, de cima a baixo. Típico: o desenho mais uma margem',
  },
]);

// ---------------------------------------------------------------------------
// O modo: "Recorte na cena"
// ---------------------------------------------------------------------------

/*
 * Ligado, a cena mostra os oito puxadores e o clique é do recorte — a
 * ferramenta na mão não o vê, como no modo Ligar da aba Malha (lote 70) e no
 * recorte do Photoshop. Desligado, o retângulo continua à vista, tracejado, e
 * o clique volta a ser da ferramenta: um retângulo que pega o clique sempre
 * roubaria o osso do tronco, que mora bem no meio dele.
 *
 * Estado do EDITOR, de sessão: não vai para o arquivo (regra 6).
 */

let editing = false;
const listeners = new Set<(on: boolean) => void>();

/** `true` com *Recorte na cena* ligado. */
export function cropEditing(): boolean {
  return editing;
}

/** Liga ou desliga o modo, e avisa quem ouve (a cena, a aba Animações). */
export function setCropEditing(on: boolean): void {
  if (editing === on) return;
  editing = on;
  for (const listener of listeners) listener(on);
}

/** Ouve o modo. Devolve a função que para de ouvir. */
export function onCropEditing(listener: (on: boolean) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** O que o rodapé diz ao ligar o modo. */
export const CROP_MODE_ON =
  'Recorte na cena: puxe os cantos e os lados, arraste o meio para mover. Enter ou Esc termina';

/** Com a base aberta: o recorte é de cada animação. */
export const CROP_NEEDS_ANIMATION = 'O recorte é de cada animação: abra uma animação primeiro';

/** Ligado sem desenho nenhum na cena: não há tamanho para inventar. */
export const CROP_DRAW_FIRST =
  'Recorte na cena: nada desenhado neste quadro. Arraste na cena, de um canto ao outro, para traçar o recorte';

/**
 * Liga o modo na animação aberta. Sem `crop`, ele nasce em volta do desenho de
 * agora (um passo de desfazer: *"Criar o recorte"*). Devolve a frase do rodapé.
 */
export function startCropEditing(doc: EditorDoc): string {
  if (doc.animation === null) return CROP_NEEDS_ANIMATION;
  let says = CROP_MODE_ON;
  if (cropInFile(doc.file, doc.animation) === null) {
    const born = cropAroundDrawing(doc.skeleton?.getBounds() ?? null);
    if (born === null) {
      says = CROP_DRAW_FIRST;
    } else {
      doc.endMerge?.();
      doc.run(new SetCrop(doc.animation, born, null, `Criar o recorte: ${cropSays(born)}`));
      says = `Recorte criado em volta do desenho: ${cropSays(born)}. ${CROP_MODE_ON}`;
    }
  }
  setCropEditing(true);
  return says;
}

/** Tira o `crop` da animação aberta. Devolve a frase do rodapé. */
export function removeCrop(doc: EditorDoc): string {
  if (doc.animation === null) return CROP_NEEDS_ANIMATION;
  if (!hasCropField(doc.file, doc.animation)) return `A animação ${doc.animation} não tem recorte`;
  doc.endMerge?.();
  doc.run(new SetCrop(doc.animation, null));
  setCropEditing(false);
  return `Recorte tirado de ${doc.animation}: a exportação volta ao corte automático da borda`;
}

/** A dica do puxador debaixo do ponteiro, com o modo ligado. */
export function cropZoneHint(zone: CropZone | null): string {
  if (zone === null) return 'Recorte: arraste para traçar um retângulo novo';
  if (zone === 'move') return 'Recorte: arraste o meio para mover';
  return `Recorte: puxe o ${CROP_ZONE_WORDS[zone]}`;
}
