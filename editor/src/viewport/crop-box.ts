/**
 * **Os números do recorte, na cena** — N-4b.
 *
 * Com *Recorte na cena* ligado, uma caixa pequena no canto de baixo à
 * esquerda da cena mostra X, Y, Largura e Altura do recorte, e muda enquanto
 * a mão arrasta. É a barra de opções do recorte do Photoshop, e mora onde mora
 * a caixa do zoom (o canto oposto): por cima do canvas, longe do desenho.
 *
 * Por que aqui, e não na aba Animações: em 1440×900 o grupo das Animações tem
 * ~150 px de corpo, e a lista já mal cabe (doc `68`, R12). A tira de lá fica
 * numa linha só (`panels/animations-crop.ts`); os números abrem aqui, onde a
 * mão está, só enquanto se mexe.
 *
 * Os quatro são o número da casa (`panels/campo-numero.ts`, R7): arrastam
 * pelo rótulo, aceitam conta, andam com as setas, e "abc" fala sem apagar. O
 * que grava é o MESMO `SetCrop` do arrasto (`crop-model.ts`).
 */

import type { EditorDoc } from '../contract.js';
import { campoNumero } from '../panels/campo-numero.js';
import { paintIcon } from '../ui/icons.js';
import {
  CROP_FIELDS, SetCrop, cropEditing, cropInFile, removeCrop, setCropEditing, type CropBox,
} from './crop-model.js';

/** O que a caixa mostra agora, como texto. Igual: nada se refaz. */
export function cropBoxSignature(doc: EditorDoc): string {
  if (!cropEditing() || doc.animation === null) return 'fechada';
  const box = cropInFile(doc.file, doc.animation);
  return box === null ? `${doc.animation}|-` : `${doc.animation}|${box.x},${box.y},${box.width},${box.height}`;
}

/** A caixa dos números do recorte. A cena monta uma, e chama `sync` a cada mudança. */
export class CropNumbersBox {
  readonly node: HTMLElement;
  private drawn = '';

  constructor(private readonly onDone: (doc: EditorDoc) => void) {
    const node = document.createElement('div');
    node.className = 'viewport-recorte';
    node.setAttribute('role', 'group');
    node.setAttribute('aria-label', 'Recorte da exportação');
    node.hidden = true;
    this.node = node;
  }

  sync(doc: EditorDoc): void {
    const agora = cropBoxSignature(doc);
    if (agora === this.drawn) return;
    const focado = (document.activeElement as HTMLElement | null)?.id ?? '';
    this.drawn = agora;
    this.render(doc);
    if (focado.startsWith('cena-recorte-')) {
      const de = document.getElementById(focado) as HTMLInputElement | null;
      if (de !== null) { de.focus(); de.select(); }
    }
  }

  private render(doc: EditorDoc): void {
    const node = this.node;
    node.replaceChildren();
    const animation = doc.animation;
    const box = animation === null ? null : cropInFile(doc.file, animation);
    node.hidden = !cropEditing() || animation === null;
    if (node.hidden || animation === null) return;

    const titulo = document.createElement('span');
    titulo.className = 'viewport-recorte-nome';
    titulo.textContent = 'Recorte';
    titulo.title = `O recorte da exportação de "${animation}" (spec 4.6), em px do esqueleto. `
      + 'Exportar → "A área desenhada nesta animação" usa este retângulo';
    node.append(titulo);

    if (box === null) {
      const nada = document.createElement('span');
      nada.className = 'viewport-recorte-nada';
      nada.textContent = 'arraste na cena para traçar';
      node.append(nada);
    } else {
      for (const campo of CROP_FIELDS) {
        const id = `cena-recorte-${campo.key}`;
        const { caixa, input, ligarRotulo } = campoNumero({
          nome: campo.nome,
          dica: campo.dica,
          unidade: 'px',
          id,
          inteiro: true,
          ...(campo.min === undefined ? {} : { min: campo.min }),
          ler: () => cropInFile(doc.file, animation)?.[campo.key] ?? Number.NaN,
          gravar: (valor) => write(doc, animation, campo.key, valor),
          falar: (frase) => doc.notice(frase),
        });
        // Enter e Esc no campo são do campo: não terminam o modo da cena.
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') { input.blur(); }
          e.stopPropagation();
        });
        const rotulo = document.createElement('label');
        rotulo.className = 'viewport-recorte-rotulo';
        rotulo.textContent = campo.rotulo;
        rotulo.htmlFor = id;
        ligarRotulo(rotulo);
        const par = document.createElement('span');
        par.className = 'viewport-recorte-par';
        par.append(rotulo, caixa);
        node.append(par);
      }
      // R6: ícone, com o nome na dica (regra 12).
      const tirar = button('', 'Tirar o recorte: apaga o recorte desta animação, e a exportação volta ao corte automático da borda',
        () => doc.notice(removeCrop(doc)));
      if (!paintIcon(tirar, 'trash', 16)) tirar.textContent = 'Tirar';
      node.append(tirar);
    }
    node.append(button('Pronto', 'Pronto (Enter ou Esc na cena): termina o Recorte na cena. O retângulo fica, tracejado', () => {
      setCropEditing(false);
      this.onDone(doc);
    }));
  }
}

function button(label: string, title: string, run: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'viewport-zoom-botao viewport-recorte-botao';
  b.textContent = label;
  b.title = title;
  b.setAttribute('aria-label', title);
  b.addEventListener('click', run);
  return b;
}

/** Um número gravado: o mesmo `SetCrop` da cena, fonte = o campo. */
function write(doc: EditorDoc, animation: string, key: keyof CropBox, valor: number): void {
  const box = cropInFile(doc.file, animation);
  if (box === null || box[key] === valor) return;
  doc.run(new SetCrop(animation, { ...box, [key]: valor }, `campo:${key}`));
  const campo = CROP_FIELDS.find((c) => c.key === key);
  doc.notice(`${campo?.nome ?? 'Recorte'}: ${valor} px`);
}
