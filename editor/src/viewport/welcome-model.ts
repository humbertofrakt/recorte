/**
 * As boas-vindas do documento vazio — anotação 24, lote 36.
 *
 * *"Documento novo não diz o que fazer"*: **Arquivo → Novo** deixava a cena com
 * a grade e o canto do zoom, e mais nada. A Árvore dizia "Nada aqui ainda." três
 * vezes, o que é verdade e não é ajuda. Quem chega de outro programa fica
 * olhando uma tela quadriculada sem porta nenhuma à vista.
 *
 * Três botões grandes no meio da cena, e eles **somem no primeiro osso ou na
 * primeira imagem**: a tela de boas-vindas que fica depois que o trabalho
 * começou vira estorvo.
 *
 * Módulo puro: a decisão e a lista se testam sem navegador.
 */

import type { BoneFile } from '../../../runtime/src/index.js';

/** Um dos três botões. */
export interface WelcomeButton {
  /** A ação registrada. Nenhum caminho novo: são portas que já existem. */
  action: string;
  icon: string;
  label: string;
  /** A frase debaixo do nome, dizendo o que acontece. */
  hint: string;
}

/**
 * Os três, na ordem em que se lê.
 *
 * O PSD vem primeiro porque é o caminho que traz a arte **com a posição** —
 * o passo 1 do manual. O herói vem depois: é o exemplo pronto, para quem quer
 * ver o programa andando antes de trazer arte. "Começar vazio" é a saída para
 * quem já sabe o que quer.
 */
export const WELCOME_BUTTONS: readonly WelcomeButton[] = Object.freeze([
  // Lote 59: começar como o Spriter, pela pasta das imagens.
  {
    action: 'abrir-pasta',
    icon: 'open',
    label: 'Abrir pasta',
    hint: 'as imagens da pasta vão para a aba Imagens; arraste para montar',
  },
  {
    action: 'importar-psd',
    icon: 'image',
    label: 'Importar PSD',
    hint: 'cada camada vira um desenho, no lugar exato em que estava',
  },
  {
    action: 'abrir-exemplo',
    icon: 'bone',
    label: 'Abrir o herói',
    hint: 'o personagem de exemplo, montado e animado, para olhar por dentro',
  },
  {
    action: 'comecar-vazio',
    icon: 'new',
    label: 'Começar vazio',
    hint: 'some com este aviso; a arte entra depois, por Arquivo → Abrir pasta do projeto…',
  },
]);

/**
 * `true` quando o documento ainda não tem NADA — nem osso além da raiz, nem
 * desenho, nem imagem no atlas.
 *
 * A raiz não conta: todo arquivo nasce com ela, e um arquivo só com a raiz é um
 * arquivo vazio. `hasImages` vem de fora porque as imagens importadas não moram
 * no `.bone`: elas ficam ao lado, no atlas da sessão.
 */
export function isEmptyDocument(file: BoneFile, hasImages = false): boolean {
  if (hasImages) return false;
  const ossos = file.bones?.length ?? 0;
  const slots = file.slots?.length ?? 0;
  const desenhos = (file.skins ?? []).some(
    (skin) => Object.keys(skin.attachments ?? {}).length > 0,
  );
  return ossos <= 1 && slots === 0 && !desenhos;
}
