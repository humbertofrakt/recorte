/**
 * **A tira do Recorte**, logo abaixo do título das Animações — N-4b.
 *
 * O `animation.crop` (spec 4.6) é da ANIMAÇÃO aberta, e por isso a linha dele
 * mora aqui, no painel das animações, e não na Propriedades (que é do que está
 * escolhido na cena).
 *
 * | Peça | O que faz |
 * |:---|:---|
 * | título | *"Recorte 200 × 300 px"*, ou *"Recorte: nenhum"*; o canto e o resto na dica |
 * | retângulo | *Recorte na cena* (C): liga os puxadores na cena; sem recorte, cria um em volta do desenho |
 * | lixeira | *Tirar o recorte*: a exportação volta ao corte automático da borda |
 *
 * **Uma linha só.** A coluna da direita é a mais apertada da casa (doc `68`,
 * R12): em 1440×900 o grupo das Animações tem ~150 px de corpo, e a lista não
 * pode perder linhas para uma ficha que se usa de vez em quando. Os quatro
 * números (X, Y, Largura, Altura) abrem **na cena**, com o modo ligado, onde a
 * mão está (`viewport/crop-box.ts`).
 *
 * Com a base aberta a tira some: o recorte é de cada animação, e uma linha sem
 * dono seria um palpite (regra 21).
 */

import type { EditorDoc } from '../contract.js';
import { el, iconButton } from './dom.js';
import { cropEditing, cropInFile, hasCropField, onCropEditing, removeCrop } from '../viewport/crop-model.js';
import { runAction, hasAction } from '../ui/actions.js';

/** A dica do botão do retângulo (R5): nome, tecla, o que faz. */
export const CROP_TOGGLE_HINT =
  'Recorte na cena (C): puxe os cantos e os lados na cena, arraste o meio para mover. '
  + 'Sem recorte, ele nasce em volta do desenho. Enter ou Esc termina';

/** A dica da lixeira (R5). */
export const CROP_REMOVE_HINT =
  'Tirar o recorte: apaga o recorte desta animação, e a exportação volta ao corte automático da borda';

/** O título de quando a animação aberta não tem recorte. */
export const CROP_NONE_TITLE = 'Recorte: nenhum';

/** A dica do título sem recorte (R4: o resto da frase vai na dica). */
export const CROP_NONE_HINT = 'Sem recorte: a exportação corta pela borda do desenho. '
  + 'Recorte na cena (C) cria um em volta do desenho';

/** O título da tira, para a animação aberta. `null` com a base aberta. */
export function cropStripTitle(doc: EditorDoc): string | null {
  if (doc.animation === null) return null;
  const box = cropInFile(doc.file, doc.animation);
  return box === null ? CROP_NONE_TITLE : `Recorte ${box.width} × ${box.height} px`;
}

/** O que a tira mostra agora, como texto: muda, redesenha; igual, nada. */
export function cropStripSignature(doc: EditorDoc): string {
  if (doc.animation === null) return 'base';
  const box = cropInFile(doc.file, doc.animation);
  const campo = hasCropField(doc.file, doc.animation);
  return `${doc.animation}|${campo}|${box === null ? '-' : `${box.x},${box.y},${box.width},${box.height}`}|${cropEditing()}`;
}

/** A tira do recorte. O painel monta uma, e chama `update` a cada mudança. */
export class CropStrip {
  readonly node: HTMLElement;
  private drawn = '';
  private doc: EditorDoc | null = null;
  private stop: (() => void) | null = null;

  constructor() {
    this.node = el('div', 'anim-secao anim-recorte');
    this.node.hidden = true;
    this.stop = onCropEditing(() => { if (this.doc !== null) this.update(this.doc); });
  }

  dispose(): void {
    this.stop?.();
    this.stop = null;
  }

  /** Redesenha só quando a assinatura mudou: um arrasto na cena custa um texto. */
  update(doc: EditorDoc): void {
    this.doc = doc;
    const agora = cropStripSignature(doc);
    if (agora === this.drawn) return;
    this.drawn = agora;
    this.render(doc);
  }

  private render(doc: EditorDoc): void {
    const node = this.node;
    node.replaceChildren();
    const animation = doc.animation;
    const titulo = cropStripTitle(doc);
    node.hidden = animation === null || titulo === null;
    if (animation === null || titulo === null) return;

    const ligado = cropEditing();
    const box = cropInFile(doc.file, animation);
    const nome = el('span', 'anim-secao-nome', titulo);
    nome.title = box === null ? CROP_NONE_HINT
      : `O recorte da exportação de imagem desta animação (spec 4.6): ${box.width} × ${box.height} px, `
        + `canto de baixo à esquerda em (${box.x}, ${box.y}) px. Exportar → "A área desenhada nesta animação" usa este retângulo`;
    const toggle = iconButton('forma-retangulo', 'Recorte na cena (C)', () => this.toggle());
    toggle.title = CROP_TOGGLE_HINT;
    toggle.setAttribute('aria-pressed', ligado ? 'true' : 'false');
    toggle.classList.toggle('is-ligado', ligado);
    const tirar = iconButton('trash', 'Tirar o recorte', () => this.remove());
    tirar.title = CROP_REMOVE_HINT;
    tirar.disabled = !hasCropField(doc.file, animation);
    // R5: botão apagado diz por quê.
    if (tirar.disabled) tirar.title = 'Tirar o recorte: esta animação não tem recorte';
    node.append(nome, toggle, tirar);
  }

  private toggle(): void {
    if (hasAction('recorte-na-cena')) runAction('recorte-na-cena');
    else this.doc?.notice('A cena não está montada: o recorte se arrasta nela');
  }

  private remove(): void {
    const doc = this.doc;
    if (doc !== null) doc.notice(removeCrop(doc));
  }
}
