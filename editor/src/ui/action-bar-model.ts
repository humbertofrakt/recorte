/**
 * A barra de ações, acima da cena (dono A) — lote 17, rodada 3.
 *
 * A primeira reclamação do Humberto, com a tela do Spriter aberta:
 * *"**Observe que não temos isso**"*, apontando para os quatro botões em
 * TEXTO, acesos em laranja: `Show Bones · Lock Bones · Show Sprites ·
 * Lock Sprites`.
 *
 * No Spriter a linha abaixo do menu é **uma barra só**, da esquerda para a
 * direita: os ícones de arquivo, os de editar, as ferramentas, e no fim os
 * quatro de ver e travar, escritos por extenso. Aqui era outra coisa: as
 * ferramentas e dois cadeados em ícone, e "ver ossos" e "ver desenhos" só
 * existiam dentro do menu Exibir.
 *
 * Este arquivo é a LISTA da barra, como dado. Ele não desenha nada e não sabe
 * o que é um `<button>`. Um teste lê a lista inteira e confere que todo botão
 * aponta para uma ação que existe, que todo ícone existe, e que ninguém ficou
 * sem nome — um botão sem nome é uma adivinhação, e o Humberto é disléxico.
 */

import type { Tool } from '../contract.js';
import { hasIcon } from './icons.js';
import { toolbarItems } from './toolbar-model.js';

/**
 * Como um botão da barra aparece.
 *
 * `icon` é o normal: desenho, e a palavra na dica (e ao lado, com **Editar →
 * Preferências → mostrar nome**). `text-toggle` é a exceção dos quatro de ver
 * e travar: **palavra escrita**, fundo laranja quando ligado.
 */
export type ActionBarStyle =
  | 'icon'
  | 'text-toggle';

/** Um botão da barra de ações. */
export interface ActionBarItem {
  /** Único na barra inteira. */
  id: string;
  /** O nome do ícone em `icons.ts`, ou `''` num botão de texto. */
  icon: string;
  /** O nome por extenso. Nunca vazio. */
  label: string;
  /** A tecla, ou `null`. */
  key: string | null;
  /** A dica inteira: o que faz, e a tecla no fim. */
  hint: string;
  /** A chave em `ui/actions.ts`. **Toda** entrada aponta para uma que existe. */
  actionId: string;
  style: ActionBarStyle;
}

/** Um grupo de botões, separado dos vizinhos por um traço fino. */
export interface ActionBarGroup {
  id: string;
  /** O nome do grupo, para quem lê com leitor de tela. */
  label: string;
  items: ActionBarItem[];
}

function iconItem(
  id: string, icon: string, label: string, key: string | null, hint: string,
  actionId = id,
): ActionBarItem {
  return {
    id,
    icon,
    label,
    key,
    hint: key === null ? hint : `${hint} (${key})`,
    actionId,
    style: 'icon',
  };
}

/*
 * O **interruptor de modo** (`MODE_ITEM`, `MODE_SIDES`, o estilo `mode-switch`)
 * saiu da barra no degrau 11, lote 1 (18/09/2026), M4 de vez. Não há modo: há o
 * que está aberto, e quem diz é o RODAPÉ — *"Base: homem"*, *"Animação: andar"*
 * (`ui/where-model.ts`). As portas: a janela Animação (um clique no corpo abre
 * a base, um clique no nome abre a animação) e **Animação → Abrir a base**.
 */

/**
 * O grupo **Arquivo**: o que se faz antes e depois de trabalhar.
 *
 * Três, e não os oito do menu Arquivo. Uma barra é para o que se aperta muitas
 * vezes por hora; o resto continua no menu, com a tecla escrita ao lado.
 */
export const FILE_ITEMS: readonly ActionBarItem[] = Object.freeze([
  iconItem('novo', 'new', 'Novo', 'Ctrl+N', 'Começa um boneco novo, vazio, na pasta que você escolher'),
  iconItem('abrir', 'open', 'Abrir', 'Ctrl+O', 'Abre um arquivo .bone, .boneb ou .bonez'),
  iconItem('salvar', 'save', 'Salvar', 'Ctrl+S', 'Grava por cima do arquivo aberto'),
]);

/**
 * O grupo **Editar**: desfazer, refazer, e a área de transferência.
 *
 * A ordem é a do Spriter e a de todo programa: desfazer e refazer primeiro,
 * porque são os dois mais apertados de qualquer barra, e porque quem os procura
 * os procura no canto esquerdo.
 */
export const EDIT_ITEMS: readonly ActionBarItem[] = Object.freeze([
  iconItem('desfazer', 'undo', 'Desfazer', 'Ctrl+Z', 'Volta um passo'),
  iconItem('refazer', 'redo', 'Refazer', 'Ctrl+Y', 'Refaz o passo desfeito'),
  iconItem('recortar', 'cut', 'Recortar chaves', 'Ctrl+X',
    'Tira as chaves escolhidas e as guarda para colar', 'recortar-chaves'),
  iconItem('copiar', 'copy', 'Copiar', 'Ctrl+C', 'Copia o que está escolhido'),
  iconItem('colar', 'paste', 'Colar', 'Ctrl+V', 'Cola o que foi copiado'),
  iconItem('apagar', 'trash', 'Apagar', 'Delete', 'Apaga o que está escolhido'),
]);

/**
 * Os quatro de **ver e travar**, em TEXTO — o pedido do Humberto.
 *
 * Eles são em texto de propósito, e não por falta de ícone: é assim no Spriter,
 * e é assim que ele os reconhece. Ver e travar são **estados** — coisas que
 * ficam ligadas por meia hora enquanto se trabalha —, e um estado ligado se lê
 * melhor numa palavra acesa do que num quadradinho que mudou de tom.
 *
 * A ordem é a do Spriter: ver e travar dos ossos, depois ver e travar dos
 * desenhos. As teclas `7 8 9 0` já eram essas desde o lote 0.
 */
/**
 * O grupo **Exibir** da barra — lote 29, anotação 15.
 *
 * Um botão só por enquanto: a **imagem de referência**, que morava no fim do
 * menu Exibir e é a primeira coisa que se procura ao começar um personagem em
 * cima de um desenho de papel. O menu continua tendo o item.
 */
export const VIEW_ITEMS: readonly ActionBarItem[] = Object.freeze([
  {
    id: 'imagem-referencia',
    icon: 'image',
    label: 'Imagem de referência',
    key: null,
    hint: 'Imagem de referência: põe um desenho atrás da cena para copiar por cima',
    actionId: 'imagem-referencia',
    style: 'icon' as const,
  },
  // Rodada 17, PL-31 (decisão do Diretor, 05/10/2026; bandeira 3 do P33): a
  // Prévia ganhou porta na barra. Ela era só uma aba, e quem anima procurava
  // um botão. Abre a aba — a mesma ação do menu Janela.
  {
    id: 'previa',
    icon: 'previa',
    label: 'Prévia',
    key: null,
    hint: 'Prévia: abre a aba Prévia, com a animação aberta tocando ao lado da cena',
    actionId: 'mostrar-painel-previa',
    style: 'icon' as const,
  },
]);

export const SEE_LOCK_ITEMS: readonly ActionBarItem[] = Object.freeze([
  {
    id: 'ver-ossos',
    icon: '',
    label: 'Ver ossos',
    key: '7',
    hint: 'Ver ossos: desenha os ossos por cima do personagem (7)',
    actionId: 'ver-ossos',
    style: 'text-toggle' as const,
  },
  {
    id: 'travar-ossos',
    icon: '',
    label: 'Travar ossos',
    key: '8',
    hint: 'Travar ossos: o clique passa por eles, mas eles continuam à vista (8)',
    actionId: 'travar-ossos',
    style: 'text-toggle' as const,
  },
  {
    id: 'ver-desenhos',
    icon: '',
    label: 'Ver desenhos',
    key: '9',
    hint: 'Ver desenhos: mostra as imagens do personagem (9)',
    actionId: 'ver-desenhos',
    style: 'text-toggle' as const,
  },
  {
    id: 'travar-desenhos',
    icon: '',
    label: 'Travar desenhos',
    key: '0',
    hint: 'Travar desenhos: o clique passa por eles, mas eles continuam à vista (0)',
    actionId: 'travar-desenhos',
    style: 'text-toggle' as const,
  },
]);

/**
 * Os SEIS grupos da barra, na ordem. Iguais com a base ou uma animação aberta:
 * nenhuma ferramenta some por modo (degrau 4a, 17/09/2026).
 *
 * O grupo **eixos** não é uma lista de botões: é a lista de três palavras
 * (Local · Pai · Mundo) que a barra já tinha, e a tela a desenha como sempre
 * desenhou. Ele entra aqui como um grupo vazio para a ORDEM da barra estar
 * escrita num lugar só — senão a ordem viveria em `viewport.ts`, misturada
 * com o `appendChild`.
 */
export function actionBarGroups(tools: readonly Tool[]): ActionBarGroup[] {
  return [
    { id: 'arquivo', label: 'Arquivo', items: [...FILE_ITEMS] },
    { id: 'editar', label: 'Editar', items: [...EDIT_ITEMS] },
    {
      id: 'ferramentas',
      label: 'Ferramentas',
      items: toolbarItems(tools).map((item): ActionBarItem => ({
        id: item.id,
        icon: item.icon,
        label: item.label,
        key: item.key,
        hint: item.hint,
        actionId: `ferramenta-${item.id}`,
        style: 'icon',
      })),
    },
    { id: 'eixos', label: 'Eixos', items: [] },
    // **Imagem de referência** ganhou botão — anotação 15. Ela só existia no
    // fim do menu Exibir, e é a primeira coisa que se procura ao começar um
    // personagem em cima de um desenho.
    { id: 'exibir', label: 'Exibir', items: [...VIEW_ITEMS] },
    { id: 'verTravar', label: 'Ver e travar', items: [...SEE_LOCK_ITEMS] },
  ];
}

/** Todo botão da barra, dos cinco grupos, numa lista só. */
export function actionBarItems(tools: readonly Tool[]): ActionBarItem[] {
  return actionBarGroups(tools).flatMap((group) => group.items);
}

/**
 * O que SAIU da barra da cena, e para onde foi.
 *
 * Escrito como dado, e não só num comentário, porque é isto que impede um lote
 * futuro de devolver um deles à barra sem perceber que a barra é justamente o
 * lugar de onde ele foi tirado. Veio de `toolbar-model.ts` no lote 17, junto
 * com os cadeados, e ganhou a linha do próprio lote 17.
 */
export const MOVED_OUT_OF_TOOLBAR: ReadonlyArray<{ what: string; to: string }> = Object.freeze([
  {
    what: 'Aproximar, Afastar, Ajustar à tela',
    to: 'o canto da cena, no lote 1 (v1.7), e o menu Exibir',
  },
  {
    what: 'Compensar: as três caixas',
    to: 'o painel Propriedades, visível só com Mover, Girar ou Escalar ativa',
  },
  {
    what: 'Eixos: os três botões',
    to: 'uma lista de três palavras na própria barra, que ocupa um botão em vez de três',
  },
  {
    what: 'Os dois cadeados em ícone',
    to: 'os quatro botões de TEXTO de "ver e travar", no fim da barra, no lote 17',
  },
]);

/**
 * Confere que a barra inteira está sã. Devolve a lista do que está errado.
 *
 * O teste espera **lista vazia**. Uma lista de erros, e não um `throw`, porque
 * assim o teste diz de uma vez tudo o que falta, em vez de um por rodada.
 */
export function auditActionBar(
  tools: readonly Tool[], actionExists: (id: string) => boolean,
): string[] {
  const erros: string[] = [];
  const vistos = new Set<string>();
  for (const group of actionBarGroups(tools)) {
    for (const item of group.items) {
      if (vistos.has(item.id)) erros.push(`${item.id}: aparece duas vezes na barra`);
      vistos.add(item.id);
      if (item.label.trim() === '') erros.push(`${item.id}: sem nome`);
      if (item.hint.trim() === '') erros.push(`${item.id}: sem dica`);
      if (!actionExists(item.actionId)) erros.push(`${item.id}: a ação ${item.actionId} não existe`);
      if (item.style !== 'icon' && item.icon !== '') {
        erros.push(`${item.id}: botão de texto não leva ícone`);
      }
      if (item.style === 'icon' && !hasIcon(item.icon)) {
        erros.push(`${item.id}: o ícone ${item.icon || '(vazio)'} não existe`);
      }
      if (item.key !== null && !item.hint.includes(item.key)) {
        erros.push(`${item.id}: a dica não diz a tecla ${item.key}`);
      }
    }
  }
  return erros;
}

// ---------------------------------------------------------------------------
// O "Mais ▾" — rodada final, chat P, lote 3a (L16, I-O3), decisão P48
// ---------------------------------------------------------------------------

/*
 * A barra ROLAVA DE LADO quando não cabia: em 1280×720 "Travar desenhos" saía
 * cortado ("Trav…"), e com a palavra da ferramenta escolhida (P38) ela deixava
 * de caber até em 1440×900. Uma barra que rola esconde o botão sem dizer que
 * ele existe. O Spine, quando a barra não cabe, tira as PALAVRAS e fica o ícone;
 * a barra Qt põe o que sobra num botão no fim. Aqui: o que não cabe vai para
 * o **Mais ▾**, no fim da barra, e a barra nunca rola.
 *
 * Esta parte é só a CONTA, sem DOM: quem desenha é `viewport/viewport-toolbar.ts`.
 */

/** O nome e a dica do botão. */
export const MORE_LABEL = 'Mais ▾';
export const MORE_HINT = 'Mais: os botões que não couberam na barra';

/**
 * Quem NUNCA vai para o "Mais ▾", além da ferramenta escolhida (P38, P48).
 *
 * `eixos` é a lista Local · Pai · Mundo, que não é botão e não vira linha de
 * menu; `particulas` é a porta que o Humberto não achava — ela não se esconde
 * de novo.
 */
export const NEVER_IN_MORE: readonly string[] = Object.freeze(['eixos', 'particulas']);

/**
 * Quem sai PRIMEIRO para o "Mais ▾", nesta ordem.
 *
 * São os ícones que têm tecla de todo programa (Ctrl+X, Ctrl+C, Ctrl+V,
 * Delete) e moram também no menu Editar, e a imagem de referência, que se usa
 * uma vez no começo do personagem. Os quatro de **ver e travar**, em texto,
 * saem por ÚLTIMO: foram o pedido do Humberto com a tela do Spriter aberta —
 * *"Observe que não temos isso"* — e sumir com eles na tela grande seria
 * desfazer o pedido.
 */
export const FIRST_INTO_MORE: readonly string[] = Object.freeze([
  'imagem-referencia', 'recortar', 'colar', 'copiar', 'apagar',
]);

/** Um pedaço da barra: um botão, ou um bloco que não se parte (os eixos). */
export interface BarSlot {
  id: string;
  /** A largura na tela, com a folga até o vizinho, em pixels. */
  width: number;
}

/** O que a barra mostra e o que vai para o "Mais ▾", na ordem da barra. */
export interface BarFit {
  shown: string[];
  more: string[];
}

/**
 * Quem vai para o "Mais ▾" quando a barra não cabe em `room` pixels.
 *
 * Saem PRIMEIRO os de `FIRST_INTO_MORE`, na ordem da lista; depois, de trás
 * para a frente. Quem está em `keep` nunca sai. `moreWidth` é o lugar que o
 * próprio "Mais ▾" ocupa quando aparece.
 */
export function fitBar(
  slots: readonly BarSlot[], room: number, moreWidth: number, keep: ReadonlySet<string>,
  firstOut: readonly string[] = FIRST_INTO_MORE,
): BarFit {
  const total = slots.reduce((sum, slot) => sum + slot.width, 0);
  if (total <= room) return { shown: slots.map((slot) => slot.id), more: [] };
  const byId = new Map(slots.map((slot) => [slot.id, slot]));
  const candidates = [
    ...firstOut.filter((id) => byId.has(id)),
    ...[...slots].reverse().map((slot) => slot.id).filter((id) => !firstOut.includes(id)),
  ];
  const out = new Set<string>();
  let used = total + moreWidth;
  for (const id of candidates) {
    if (used <= room) break;
    if (keep.has(id)) continue;
    out.add(id);
    used -= byId.get(id)?.width ?? 0;
  }
  return {
    shown: slots.filter((slot) => !out.has(slot.id)).map((slot) => slot.id),
    more: slots.filter((slot) => out.has(slot.id)).map((slot) => slot.id),
  };
}
