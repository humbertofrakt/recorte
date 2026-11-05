/**
 * As decisões da linha do tempo que não precisam de tela (dono C).
 *
 * Por enquanto: a lista de controles do tocador. Ela é dado puro e não código
 * de desenho porque é a única fonte de três coisas ao mesmo tempo — o símbolo
 * que aparece no botão, o nome e a tecla que aparecem na dica, e a ordem em que
 * os treze ficam na linha. Escrita uma vez, ela não tem como discordar de si
 * mesma; espalhada por treze chamadas de `makeButton`, teria.
 */

import type { BoneFile } from '../../../runtime/src/index.js';
import { CURVE_KINDS, curveKindOf, findTimeline, roundTime, sameTime, targetInfo } from '../anim/keying.js';
import type { KeyClipboard } from '../anim/keying.js';
import { readCurve, toUnit } from '../anim/curves.js';
import type { KeyRef } from '../anim/keying.js';

/**
 * "0,50 s" — comma, because the interface is in Portuguese. Mora aqui desde o
 * lote A2, para a folha e `dopesheet-actions.ts` escreverem o tempo igual.
 */
export function formatSeconds(time: number): string {
  return `${time.toFixed(2).replace('.', ',')} s`;
}

/**
 * O tocador da aba **Curvas** — rodada 17, G-Q6 (05/10/2026).
 *
 * A aba Curvas mora na faixa de baixo, no lugar da Linha do tempo: abri-la
 * escondia o tocador inteiro, e não se tocava olhando a curva. No Spine o
 * Graph fica ao lado do tocador; aqui ela ganha os quatro botões do tocador
 * que mais se usam com a curva à frente, **os mesmos** da Linha do tempo (o
 * mesmo `runAction`, o mesmo nome na dica) — e o relógio.
 */
export const CURVES_PLAYER_IDS: readonly string[] = Object.freeze([
  'ir-inicio', 'quadro-anterior', 'tocar', 'quadro-seguinte',
]);

/** O relógio da aba Curvas: `0,50 s · quadro 15`. Com a base aberta, `0,00 s · quadro 0` (M5). */
export function curvesClock(time: number, fps: number, baseOpen: boolean): string {
  const tempo = baseOpen ? 0 : time;
  return `${formatSeconds(tempo)} · quadro ${Math.round(tempo * fps)}`;
}

// ---------------------------------------------------------------------------
// As três teclas da seleção de chaves — G2, degrau 6 (17/09/2026)
// ---------------------------------------------------------------------------

/** O que um gesto de escolher faz com a seleção que já havia. */
export type SelectionMode = 'trocar' | 'somar' | 'tirar';

/**
 * Qual das três coisas uma tecla faz com a seleção de chaves — **a decisão**,
 * aqui e não no ponteiro, porque decisão é de módulo puro (regra 8 da casa).
 *
 * **`Ctrl` soma, `Shift` tira, nada troca.** É a ordem do Humberto, 17/09/2026
 * (*"Ctrl mais clique soma, Ctrl mais arrastar clona, o Shift sai da
 * seleção"*), e é o que o **Spriter** faz: o manual dele, cap. 11 *Editing
 * Timing*, diz *"arrastar quadro-chave; Ctrl para pegar vários"*.
 *
 * Até aqui era o contrário — `Shift` somava, `Ctrl` tirava —, e a pesquisa da
 * casa (`O QUE O SPRITER TEM E NOS FALTA`, 14/09) já tinha anotado a
 * divergência com a palavra "diferente". Esta é a linha que a fecha.
 *
 * `Ctrl` ganha do `Shift` com as duas apertadas: quem soma manda, porque o
 * gesto que continua (clonar no arrasto) é o do `Ctrl`.
 */
export function selectionModeOf(event: {
  ctrlKey: boolean; shiftKey: boolean;
}): SelectionMode {
  if (event.ctrlKey) return 'somar';
  if (event.shiftKey) return 'tirar';
  return 'trocar';
}

/**
 * `true` quando o gesto pode virar arrasto de chaves.
 *
 * **Tirar não é pegar.** Um arrasto que começa tirando moveria justamente a
 * chave que o gesto acabou de soltar — o oposto do que a mão pediu.
 */
export function startsKeyDrag(mode: SelectionMode): boolean {
  return mode !== 'tirar';
}

/** `true` quando o arrasto CLONA em vez de mover — item 6, e o `Ctrl` do G2. */
export function clonesOnDrag(mode: SelectionMode): boolean {
  return mode === 'somar';
}

/**
 * A dica de um losango da folha — degrau 6 (17/09/2026).
 *
 * Ela dizia só o botão direito e o duplo clique. Faltava o gesto que mais se
 * usa e o único que pode surpreender: **com várias chaves escolhidas, arrastar
 * uma leva todas**. Quem não soubesse disso arrastava uma e via cinco andarem,
 * sem nada na tela que explicasse por quê — regra 21, "o programa avisa".
 *
 * As três teclas são as do Spriter (cap. 11, *"Ctrl para pegar vários"*) e as
 * que o Humberto pediu em 17/09: `Ctrl` soma, `Shift` tira.
 */
export const KEY_HINT =
  'Arrastar move as escolhidas · Ctrl soma, Shift tira · Ctrl + arrastar clona · '
  + 'Botão direito: curva · Duplo clique: apagar';

/** O que um controle do tocador é, para quem desenha. */
export type PlayerControlKind =
  /** Aperta e acontece. */
  | 'botao'
  /** Fica aceso enquanto ligado. */
  | 'liga'
  /** Campo de texto: dá para digitar dentro. */
  | 'campo'
  /** Lista de escolhas. */
  | 'lista'
  /** Barra que se arrasta, com o número escrito ao lado — lote 15. */
  | 'barra'
  /** Botão com a PALAVRA escrita, e não o símbolo — lote 15. */
  | 'botao-texto'
  /** Só leitura. */
  | 'texto';

export interface PlayerControl {
  /** Nome da ação no registro, ou o id do controle quando não é uma ação. */
  id: string;
  /**
   * O que aparece no botão. **Só o símbolo**: decisão do Humberto, 08/09/2026.
   * Treze botões com palavra faziam a linha ir a duas, e a linha do tempo
   * precisa da altura para as chaves.
   */
  symbol: string;
  /** O nome em palavras. Vai para a dica, nunca para o botão. */
  name: string;
  /** A frase inteira da dica: o que faz, e por quê quando não é óbvio. */
  hint: string;
  /** A tecla, ou `null` quando o controle não tem uma. */
  shortcut: string | null;
  kind: PlayerControlKind;
}

/**
 * Os treze controles da primeira linha da linha do tempo, na ordem. (Eram
 * catorze; o "Gravar sozinho" saiu no degrau 4a: editar sempre grava.)
 *
 * A ordem é a do tempo, da esquerda para a direita: começo, atrás, tocar,
 * frente, fim. Depois o que muda o jeito de tocar (repetir, velocidade), depois
 * onde a agulha está, e por último o que grava — que é o que se aperta com a
 * outra mão enquanto se olha o desenho.
 *
 * O símbolo de cada um é distinto de propósito: `◂` e `▸` andam um quadro,
 * `⏪` e `⏩` pulam para a chave, `▶` é só tocar. Dois controles com o mesmo
 * desenho seriam dois controles que ninguém distingue sem passar o mouse.
 */
export const PLAYER_CONTROLS: readonly PlayerControl[] = Object.freeze([
  {
    id: 'ir-inicio',
    symbol: '⏮',
    name: 'Início',
    hint: 'Vai para o começo',
    shortcut: 'Home',
    kind: 'botao',
  },
  {
    id: 'chave-anterior',
    symbol: '⏪',
    name: 'Chave anterior',
    hint: 'Vai para a chave anterior',
    shortcut: '↑',
    kind: 'botao',
  },
  {
    id: 'quadro-anterior',
    symbol: '◂',
    name: 'Quadro anterior',
    hint: 'Volta um quadro',
    shortcut: '←',
    kind: 'botao',
  },
  {
    id: 'tocar',
    symbol: '▶',
    name: 'Tocar',
    // A ressalva do Espaço não é um detalhe: na cena ele arrasta a vista, e
    // quem não souber disso vai achar que o botão às vezes não funciona.
    hint: 'Toca e pausa (Espaço, em qualquer lugar). Na cena, Espaço + arrastar move a vista',
    shortcut: 'Espaço',
    kind: 'liga',
  },
  {
    id: 'quadro-seguinte',
    symbol: '▸',
    name: 'Quadro seguinte',
    hint: 'Avança um quadro',
    shortcut: '→',
    kind: 'botao',
  },
  {
    id: 'chave-seguinte',
    symbol: '⏩',
    name: 'Próxima chave',
    hint: 'Vai para a próxima chave',
    shortcut: '↓',
    kind: 'botao',
  },
  {
    id: 'ir-fim',
    symbol: '⏭',
    name: 'Fim',
    hint: 'Vai para o fim',
    shortcut: 'End',
    kind: 'botao',
  },
  {
    id: 'repetir',
    symbol: '🔁',
    name: 'Repetir',
    hint: 'Volta ao começo quando chega ao fim. Fica gravado no arquivo',
    shortcut: 'L',
    kind: 'liga',
  },
  {
    id: 'velocidade',
    symbol: '⏱',
    name: 'Velocidade',
    hint: 'Velocidade de tocar, de 10% a 200%. Não muda a animação, só o jeito de olhar',
    shortcut: null,
    kind: 'barra',
  },
  {
    id: 'tempo',
    symbol: '',
    name: 'Tempo',
    hint: 'Onde a agulha está. Clique para digitar outro tempo',
    shortcut: null,
    kind: 'campo',
  },
  {
    id: 'duracao',
    symbol: '',
    name: 'Duração',
    hint: 'Quanto a animação dura inteira. Digite outro número para mudar. '
      + 'Para esticar as chaves junto, use Animação → Mudar duração…',
    shortcut: null,
    kind: 'campo',
  },
  {
    id: 'chavear',
    // A palavra no botão é curta; o nome inteiro está na dica. "Chavear
    // escolhidos" ocupava 170px numa linha que precisa caber em 1440.
    symbol: 'Chavear',
    name: 'Chavear escolhidos',
    hint: 'Grava uma chave no tempo atual, só para o que está escolhido. Protege a pose',
    shortcut: 'K',
    kind: 'botao-texto',
  },
  {
    id: 'chavear-tudo',
    symbol: 'Chavear tudo',
    name: 'Chavear tudo',
    hint: 'Grava uma chave no tempo atual para TODAS as linhas que a animação já tem. Protege a pose',
    shortcut: 'Ctrl+K',
    kind: 'botao-texto',
  },
]);

// ---------------------------------------------------------------------------
// A barra de velocidade — lote 15
// ---------------------------------------------------------------------------

/** Os limites da barra de velocidade, em por cento. */
export const SPEED_MIN = 10;
export const SPEED_MAX = 200;

/**
 * A velocidade que um valor da barra quer dizer.
 *
 * A barra anda em POR CENTO, de 10 a 200, e o número escrito ao lado é o mesmo
 * por cento: `100` é a velocidade do arquivo. A conta devolve o fator que o
 * tocador usa — `100` vira `1` —, com duas casas, para 0,25 ser 0,25 exato e
 * não 0,25000000000000006.
 *
 * Vem do Spriter: lá é uma barra com o número `100` ao lado, e não a lista de
 * quatro velocidades que tínhamos. Uma lista de quatro não deixa tocar a 30%
 * para conferir um contato, que é o uso que existe.
 */
export function speedFromSlider(value: number): number {
  const clean = Number.isFinite(value) ? value : 100;
  const preso = Math.min(SPEED_MAX, Math.max(SPEED_MIN, clean));
  return Math.round(preso) / 100;
}

/** O caminho de volta: onde a barra fica para uma velocidade dessas. */
export function sliderFromSpeed(speed: number): number {
  const clean = Number.isFinite(speed) ? speed * 100 : 100;
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, Math.round(clean)));
}

/**
 * **O tocador nunca apaga** — degrau 4a, M5 (17/09/2026).
 *
 * Com a base aberta (`doc.animation === null`) não há tempo a andar: a base
 * tem um quadro só. O tocador continua à vista — o relógio em `0,00 s`, um
 * losango na folha — e os botões de tocar ficam cinza **com a dica** dizendo
 * por quê. Um botão cinza mudo é um botão que se aprende a ignorar.
 */
export const BASE_CLOCK = formatSeconds(0);

/** A frase da folha com a base aberta, ao lado do único losango. */
export const BASE_SHEET_NOTE =
  'A base tem um quadro só. Mexer grava na base, e vale em todas as animações.';

/**
 * A dica de um controle do tocador que está cinza com a **base aberta**.
 *
 * Os dois de Chavear dizem que mexer já grava na base; os de tocar dizem que
 * a base tem um quadro só. As duas repetem a tecla, que continua valendo
 * assim que uma animação abrir.
 */
export function baseOpenHint(control: PlayerControl): string {
  const key = control.shortcut === null ? '' : ` (${control.shortcut})`;
  if (control.id === 'chavear' || control.id === 'chavear-tudo') {
    return `${control.name}: com a base aberta, mexer já grava na base. Abra uma animação para gravar chave${key}`;
  }
  return `${control.name}: a base tem um quadro só. Abra uma animação para tocar${key}`;
}

/**
 * A dica inteira de um controle: a frase, e a tecla entre parênteses no fim.
 *
 * É o mesmo texto no `title` e no `aria-label`, porque quem lê com o mouse e
 * quem lê com o leitor de tela têm que receber a mesma coisa.
 */
export function controlLabel(control: PlayerControl): string {
  const key = control.shortcut === null ? '' : ` (${control.shortcut})`;
  return `${control.name}: ${control.hint}${key}`;
}

// ---------------------------------------------------------------------------
// O botão ⋯ Mais
// ---------------------------------------------------------------------------

/** Um item do menu do botão ⋯ Mais. */
export interface MoreControl {
  id: string;
  label: string;
  hint: string;
  /**
   * `acao` roda uma ação do registro, `campo` é um campo de texto, `liga` é
   * um interruptor que fica aceso, e `lista` é uma lista de escolhas.
   */
  kind: 'acao' | 'campo' | 'liga' | 'lista';
  /**
   * O nome curto que entra na dica do botão ⋯ Mais.
   *
   * Sem ele, o controle não aparece na dica — e são só dois: **Fator**, que é
   * o argumento do Esticar e não um gesto por si, e **Espelhar esquerda e
   * direita**, que a palavra "espelhar" já cobre. Todo o resto entra.
   */
  hintName?: string;
}

/**
 * O que estava na segunda barra da linha do tempo e virou o menu do ⋯ Mais.
 *
 * São seis controles de vez em quando: esticar um trecho, espelhar no tempo,
 * fechar o ciclo, e trocar as linhas entre os ossos de nome espelhado. Eles
 * ocupavam uma barra inteira, permanente, para gestos que se usam uma vez por
 * animação — e essa barra era altura tirada das chaves, que se olham o tempo
 * todo.
 *
 * As quatro ações também estão no menu Animação desde o lote menus. O ⋯ Mais
 * não é um segundo lugar onde elas moram: é o mesmo `runAction`.
 */
export const MORE_CONTROLS: readonly MoreControl[] = Object.freeze([
  {
    // Veio do tocador no lote 15. Ele é uma escolha de como OLHAR, tomada uma
    // vez por sessão, e ocupava uma lista inteira na linha que o Spriter usa
    // para a barra de velocidade e os dois campos de tempo.
    id: 'modo-de-fim',
    label: 'No fim',
    hintName: 'No fim',
    hint: 'O que fazer ao chegar no fim: parar, repetir, vai-e-volta ou voltar ao início. '
      + 'É só um jeito de olhar — não muda o arquivo',
    kind: 'lista',
  },
  {
    id: 'fator',
    label: 'Fator',
    hint: 'Quantas vezes o trecho fica mais longo. 2 dobra, 0,5 corta pela metade',
    kind: 'campo',
  },
  {
    id: 'esticar-selecao',
    label: 'Esticar seleção',
    hintName: 'esticar',
    hint: 'Estica o trecho escolhido pelo fator, segurando a primeira chave no lugar',
    kind: 'acao',
  },
  {
    id: 'espelhar-tempo',
    label: 'Espelhar no tempo',
    hintName: 'espelhar',
    hint: 'Inverte a ordem das chaves escolhidas, sem sair do lugar',
    kind: 'acao',
  },
  {
    id: 'fechar-ciclo',
    label: 'Fechar ciclo',
    hintName: 'fechar ciclo',
    hint: 'Copia a primeira chave para o fim e casa as tangentes, para o laço não dar solavanco',
    kind: 'acao',
  },
  {
    id: 'pares-de-nome',
    label: 'Pares de nome',
    hintName: 'pares de nome',
    hint: 'Pares separados por vírgula, os dois lados por barra. Exemplo: _e/_d, _l/_r, /_b',
    kind: 'campo',
  },
  {
    id: 'espelhar-lados',
    label: 'Espelhar esquerda e direita',
    hint: 'Troca as linhas de tempo entre os ossos de nome espelhado',
    kind: 'acao',
  },
  {
    id: 'so-escolhidos',
    label: 'Mostrar só os escolhidos',
    hintName: 'mostrar só os escolhidos',
    hint: 'Esconde as linhas de tudo o que não está escolhido. A linha Resumo continua inteira',
    kind: 'liga',
  },
  {
    id: 'tirar-trecho',
    label: 'Tirar trecho de laço',
    hintName: 'tirar trecho de laço',
    hint: 'Volta a tocar a animação inteira. Alt + clique na régua marca o começo; '
      + 'Alt + clique direito marca o fim',
    kind: 'acao',
  },
]);

/** Os itens do ⋯ Mais. Função para o teste ler como o painel lê. */
export function moreMenuItems(): MoreControl[] {
  return [...MORE_CONTROLS];
}

/**
 * A dica do botão **⋯ Mais** — anotação 3 do Humberto.
 *
 * A dica antiga falava de três gestos e calava sobre os outros seis: quem
 * procurava "No fim" ou "Mostrar só os escolhidos" não tinha como adivinhar
 * que eles estavam ali dentro. Agora ela **lista o que tem dentro**, e a lista
 * sai da própria `MORE_CONTROLS`: controle novo entra na dica sozinho, e a
 * dica não tem como envelhecer.
 */
export function moreButtonHint(): string {
  const names = MORE_CONTROLS
    .map((control) => control.hintName)
    .filter((name): name is string => name !== undefined);
  return `${names.join(', ')}: o que se usa de vez em quando`;
}

// ---------------------------------------------------------------------------
// K15 — o começo da entidade se guarda sozinho (chat D, lote 2a, 29/09/2026)
// ---------------------------------------------------------------------------

/** O que `entityStartValue` precisa de uma entidade — o pedaço de `EntitySlot`. */
export interface EntityStartSource {
  /** A animação que o anexo pede (fonte 3 de 7.11), ou `null`. */
  readonly animation: string | null;
  /** O filho responde ao pai pelo nome da animação (fonte 2 de 7.11). */
  readonly inheritAnimation: boolean;
}

/**
 * **O que a entidade tocava ANTES da primeira chave de troca** — K15, achado
 * pelo chat K (uso: animar um ciclo), 29/09/2026.
 *
 * Antes da primeira chave vale a primeira chave (9.10). Então uma troca de
 * animação da entidade gravada em 0,50 s, numa linha nova, valia **desde 0** —
 * o rodapé dizia *"de 0,50 s em diante"* e mentia. O conserto é o do lote 68
 * (`keepStartKey`): gravar em `0` o que valia antes, no mesmo passo. Mas o
 * valor de antes de uma entidade não é um número de montagem: é a precedência
 * de 7.11, sem a chave.
 *
 * - pelo pai (`inheritAnimation`): o filho toca o nome DESTA animação, se ele
 *   a tiver; se não tiver, cai no anexo. Sem o filho aberto, **não se sabe** —
 *   devolve `null`, e quem chama não grava o começo (regra 21: não inventa);
 * - pelo anexo: o nome que o anexo pede, ou `null` (nenhuma).
 */
export function entityStartValue(
  entity: EntityStartSource, animation: string, childAnimations: readonly string[] | null,
): { value: string | null } | null {
  if (entity.inheritAnimation) {
    if (childAnimations === null) return null;
    if (childAnimations.includes(animation)) return { value: animation };
  }
  return { value: entity.animation };
}

// ---------------------------------------------------------------------------
// O botão direito no losango — G1 e P9 (chat D, lote 2a, 29/09/2026)
// ---------------------------------------------------------------------------

/** O que o menu do losango oferece, para as chaves escolhidas. */
export interface KeyMenuPlan {
  /** Linear · Suave · Parada · Curva… — fora quando só há virada de corpo. */
  readonly curves: boolean;
  /** O item de tirar: o nome e a dica. */
  readonly remove: { readonly label: string; readonly hint: string };
}

/**
 * **O mesmo menu no Resumo e nas linhas** — G1, achado pelo chat G.
 *
 * Antes, o botão direito no losango só tinha as curvas, e o do Resumo não
 * abria nada: apagar era segredo do `Delete` e do duplo clique. Agora o menu
 * sempre tem o apagar, com o nome do que sai. A virada de corpo só aceita
 * "parada" (9.13): com só viradas escolhidas, as curvas não aparecem — elas
 * gravariam "parada" em silêncio, seja qual for a escolha.
 */
export function keyMenuPlan(targets: ReadonlyArray<{ readonly type: string }>): KeyMenuPlan {
  const n = targets.length;
  const soVirada = n > 0 && targets.every((target) => target.type === 'body');
  if (soVirada) {
    return {
      curves: false,
      remove: {
        label: n === 1 ? 'Tirar a virada de base' : `Tirar as ${n} viradas de base`,
        hint: 'Dali em diante volta a valer a base de antes. O mesmo que o Delete',
      },
    };
  }
  return {
    curves: true,
    remove: {
      label: n <= 1 ? 'Apagar chave' : `Apagar as ${n} chaves`,
      hint: 'O mesmo que o Delete e o duplo clique no losango',
    },
  };
}

/**
 * **Quem atende o `Delete` com o foco na linha do tempo** — rodada 23, defeito 1.
 *
 * Com chave escolhida, a folha apaga **a chave**, como a lixeira. Sem nenhuma,
 * a tecla não é dela: segue para a casca, e apaga o que está escolhido na
 * cena, como sempre. Engolir a tecla aqui seria apertar e nada acontecer.
 *
 * O defeito não morava aqui, e sim no foco: o clique no losango parava o
 * evento e não levava o foco para a folha (*"o clique que escolhe na folha não
 * levava o teclado junto"*), e o `Delete` caía na casca com o osso escolhido.
 * A tecla age onde está o foco, como no Spriter e no Spine; a folha agora pega
 * o foco no clique, como a cena já pegava (`viewport.ts`, `onPointerDown`).
 */
export function deleteKeyGoesTo(keysSelected: number): 'chaves' | 'cena' {
  return keysSelected > 0 ? 'chaves' : 'cena';
}

/**
 * **O `Ctrl+D` com chave escolhida** — rodada 23, a mesma forma do defeito 1.
 *
 * A folha não tem "duplicar chave", e a casca ouviria o `Ctrl+D` e duplicaria
 * o OSSO escolhido na cena, que não é o que está debaixo do olho. Com chave
 * escolhida a folha atende e diz como se faz; sem nenhuma, segue para a casca
 * (`deleteKeyGoesTo` decide igual).
 */
export const DUPLICATE_IN_TIMELINE_NOTICE =
  'Na linha do tempo, chave se duplica copiando e colando: Ctrl+C, leve a agulha, Ctrl+V. Ctrl+D duplica o escolhido na cena';

/**
 * **A faixa arrastada que não anda** — rodada 23, defeito 12.
 *
 * O conferente puxou a faixa para encurtá-la e pegou o corpo dela, e não a
 * ponta: o gesto foi o de ARRASTAR, que não anda além da chave de antes nem do
 * fim. A frase dizia o limite e não dizia o gesto que ele queria. Agora diz
 * para onde ela não vai, e onde se encurta.
 */
export function bandLimitNotice(name: string, dt: number): string {
  const onde = dt < 0 ? 'já começa o mais cedo que pode (na chave de antes, ou no começo)'
    : 'já vai até o fim da animação';
  return `${name} ${onde}: arrastar leva a faixa inteira. Para encurtar ou esticar, puxe a ponta, a alça no fim da faixa`;
}

// ---------------------------------------------------------------------------
// I-O4 — a lista que abre inteira, para cima quando embaixo não cabe
// ---------------------------------------------------------------------------

/** Onde uma lista que sai de um botão se põe: em cima ou embaixo, e quão alta. */
export interface PopupPlacement {
  readonly left: number;
  /** Encostada embaixo do botão (`top`) ou em cima dele (`bottom`, a partir do pé da janela). */
  readonly top?: number;
  readonly bottom?: number;
  readonly maxHeight: number;
}

/**
 * **I-O4** (chat I, 29/09/2026): as opções da cebola abriam cortadas — só
 * *"Só nas chaves"* aparecia, espremida na faixa do Resumo. A lista era
 * `absolute` dentro da folha, que rola e corta. Agora ela sai presa à janela
 * (como o menu da curva, item 26), e abre para o lado que tem mais espaço: a
 * linha do tempo mora no pé da tela, e embaixo dela quase nunca cabe nada.
 */
export function popupPlacement(
  button: { left: number; top: number; bottom: number }, viewportWidth: number, viewportHeight: number,
  width = 280,
): PopupPlacement {
  const margem = 8;
  const left = Math.max(margem, Math.min(button.left, viewportWidth - width - margem));
  const embaixo = viewportHeight - button.bottom - margem;
  const emCima = button.top - margem;
  if (embaixo >= emCima) return { left, top: button.bottom + 4, maxHeight: Math.max(0, embaixo - 4) };
  return { left, bottom: viewportHeight - button.top + 4, maxHeight: Math.max(0, emCima - 4) };
}

// ---------------------------------------------------------------------------
// A dica do losango: tempo, valor com unidade, curva — rodada 40, lote 1
// ---------------------------------------------------------------------------

/** A unidade de cada propriedade de osso que é número (régua do `26`). */
const BONE_UNITS: Readonly<Record<string, string>> = Object.freeze({
  x: ' px', y: ' px', rotation: '°', shearX: '°', shearY: '°', scaleX: '×', scaleY: '×',
});

/** `-12.5` → `−12,5`: vírgula, menos de verdade, até duas casas, sem zeros sobrando. */
export function formatNumber(value: number): string {
  const text = String(Number(value.toFixed(2))).replace('.', ',');
  return text.startsWith('-') ? `−${text.slice(1)}` : text;
}

/**
 * **O que a chave é, numa linha** — rodada 40, lote 1 (doc 39, §2.3).
 *
 * *"0,50 s · Rotação de leg = −70° · Suave"*. A dica do losango dizia só os
 * gestos; o tempo vinha no leitor de tela, o valor em lugar nenhum (clicar na
 * chave não levava a agulha), e a curva só no gráfico. No Spriter e no Spine o
 * valor da chave escolhida está à vista, e a curva o Spine desenha na folha.
 *
 * Onde não há número, não há unidade inventada (regra 21): um nome vai entre
 * aspas, e uma cor ou uma malha não dizem valor — o lugar delas é a ficha.
 */
export function keyTitle(file: BoneFile, animation: string, ref: KeyRef): string {
  const tempo = formatSeconds(ref.time);
  if (ref.target.type === 'event') return `${tempo} · Evento ${ref.event ?? ''}`.trimEnd();
  const info = targetInfo(ref.target, file);
  const dono = ref.target.target ? ` de ${ref.target.target}` : '';
  const timeline = findTimeline(file, animation, ref.target);
  const keys = (timeline as unknown as { keys?: Array<Record<string, unknown>> } | null)?.keys ?? [];
  const index = keys.findIndex((key) => sameTime(Number(key['time'] ?? 0), ref.time));
  const value = index < 0 ? undefined : keys[index]!['value'];
  let texto = `${tempo} · ${info.label}${dono}`;
  const valor = valueText(ref, value);
  if (valor !== null) texto += ` = ${valor}`;
  if (!info.interpolable || index < 0) return texto;
  if (index === keys.length - 1) return `${texto} · a última: sem curva`;
  const kind = curveKindOf(file, animation, ref);
  const nome = kind === 'outra' ? 'Curva à mão' : CURVE_KINDS.find((item) => item.id === kind)?.label ?? kind;
  return `${texto} · ${nome}`;
}

function valueText(ref: KeyRef, value: unknown): string | null {
  if (typeof value === 'number') {
    const unit = ref.target.type === 'bone' ? BONE_UNITS[ref.target.property ?? ''] ?? '' : '';
    return `${formatNumber(value)}${unit}`;
  }
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'boolean') return value ? 'sim' : 'não';
  if (value === null) return 'nada';
  return null;
}

// ---------------------------------------------------------------------------
// O arrasto fala, e o duplo clique se conta no toque — rodada 40, lote 3
// ---------------------------------------------------------------------------

/**
 * **O que o arrasto de chaves diz, junto do mouse** — rodada 40, lote 3.
 *
 * *"0,57 s · q 17 · +2 quadros"*. O arrasto era cego: o rodapé só falava ao
 * soltar (doc 39, foto `32`). `start` é o tempo da chave agarrada; `delta`, o
 * quanto ela anda (já preso ao zero por quem chama, ou preso aqui).
 */
export function dragReadout(start: number, delta: number, fps: number): string {
  const time = Math.max(0, start + delta);
  const frames = Math.round((time - start) * fps);
  const andou = frames === 0
    ? 'no lugar'
    : `${frames > 0 ? '+' : '−'}${Math.abs(frames)} quadro${Math.abs(frames) === 1 ? '' : 's'}`;
  return `${formatSeconds(time)} · q ${Math.round(time * fps)} · ${andou}`;
}

/** Um toque num losango: qual chave, quando (ms) e onde (px). */
export interface KeyTouch { id: string; at: number; x: number; y: number }

/**
 * **O duplo clique, contado no próprio toque** — rodada 40, lote 3.
 *
 * A dica prometia *"Duplo clique: apagar"*, e o `dblclick` do navegador nunca
 * chegava: o primeiro toque escolhe a chave e redesenha a folha, o losango
 * debaixo do mouse vira outro elemento, e sem o mesmo elemento no apertar e no
 * soltar não há clique — nem duplo. Medido no Chrome: só `pointerdown` chega.
 * Dois toques na MESMA chave, a menos de 400 ms e 6 px, são o duplo clique.
 */
export function isDoubleClick(previous: KeyTouch | null, now: KeyTouch): boolean {
  if (previous === null || previous.id !== now.id) return false;
  if (now.at - previous.at > 400) return false;
  return Math.hypot(now.x - previous.x, now.y - previous.y) <= 6;
}

// ---------------------------------------------------------------------------
// O desenho da curva entre duas chaves, na folha — rodada 40, lote 3 (doc 44)
// ---------------------------------------------------------------------------

/** Os números de um valor de chave, ou `null` quando ele não é número. */
function numbersIn(value: unknown): number[] | null {
  if (typeof value === 'number') return [value];
  if (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === 'number')) {
    return value as number[];
  }
  return null;
}

const um = (n: number): string => String(Math.round(n * 10) / 10);

/**
 * **O caminho SVG do trecho desta chave até a próxima**, numa caixa de 100 por
 * 100, de baixo à esquerda (a chave) até em cima à direita (a próxima) —
 * rodada 40, lote 3, nota (a) do doc 44.
 *
 * A v31.4 desenhava o mesmo arco para Suave, Entrada suave e Saída suave, e o
 * conferente mediu: idênticos e simétricos, enquanto o gráfico mostrava alças
 * diferentes. Agora é a curva de verdade, pelas alças do arquivo (a primeira
 * componente que muda de valor): a Entrada sai devagar e chega reta, a Saída o
 * contrário, a Parada é um degrau. `null` na última chave e em valor que não é
 * número.
 */
export function segmentPath(file: BoneFile, animation: string, ref: KeyRef): string | null {
  const timeline = findTimeline(file, animation, ref.target);
  const keys = (timeline as unknown as { keys?: Array<Record<string, unknown>> } | null)?.keys ?? [];
  const index = keys.findIndex((key) => sameTime(Number(key['time'] ?? 0), ref.time));
  if (index < 0 || index === keys.length - 1) return null;
  const key = keys[index]!;
  const next = keys[index + 1]!;
  const curve = key['curve'];
  if (curve === 'stepped') return 'M0,100 L100,100 L100,0';
  const v0 = numbersIn(key['value']);
  const v1 = numbersIn(next['value']);
  if (v0 === null || v1 === null || v0.length !== v1.length) return null;
  const shape = readCurve(curve as never, v0.length);
  if (shape.kind !== 'bezier') return 'M0,100 L100,0';
  const c = Math.max(0, v0.findIndex((start, i) => start !== v1[i]));
  const u = toUnit(shape.points[c]!, Number(key['time'] ?? 0), v0[c]!, Number(next['time'] ?? 0), v1[c]!);
  const x = (n: number): string => um(Math.min(1, Math.max(0, n)) * 100);
  const y = (n: number): string => um(100 - n * 100);
  return `M0,100 C${x(u.x1)},${y(u.y1)} ${x(u.x2)},${y(u.y2)} 100,0`;
}

// ---------------------------------------------------------------------------
// O que o Empurrar, o Deslocar e o Copiar dizem — rodada 40, lote 4
// ---------------------------------------------------------------------------

/** `6 quadros = 0,20 s`: a janela pede quadros numa tela que fala em segundos. */
export function framesAndSeconds(frames: number, fps: number): string {
  return `${frames} quadro${frames === 1 ? '' : 's'} = ${formatSeconds(fps > 0 ? frames / fps : 0)}`;
}

/**
 * O rodapé do Empurrar — rodada 40, lote 4, e a nota do doc 45: a animação
 * crescia (2,00 → 2,13 s) e só a barra de avisos sabia.
 */
export function pushNotice(
  count: number, frames: number, side: 'frente' | 'tras', fps: number, before: number, after: number,
): string {
  const verbo = count === 1 ? 'andou' : 'andaram';
  const lado = side === 'tras' ? 'trás' : 'a frente';
  let texto = `${count} chave${count === 1 ? '' : 's'} ${verbo} ${frames} quadro${frames === 1 ? '' : 's'} `
    + `(${formatSeconds(fps > 0 ? frames / fps : 0)}) para ${lado}`;
  if (after > before + 1e-6) texto += `. A animação cresceu de ${formatSeconds(before)} para ${formatSeconds(after)}`;
  return texto;
}

/** O rodapé do Copiar — nota do doc 45: o botão da barra não dizia nada. */
export function copyNotice(count: number): string {
  if (count === 0) return 'Nenhuma chave escolhida para copiar';
  return `${count} chave${count === 1 ? '' : 's'} copiada${count === 1 ? '' : 's'}. Ctrl+V cola na agulha`;
}

// ---------------------------------------------------------------------------
// O padrão — rodada 40, lote 5
// ---------------------------------------------------------------------------

/** O rodapé do Fechar ciclo, com o número concordando ("1 linha fechada"). */
export function loopClosedNotice(closed: number, matched: number): string {
  if (closed === 0) return 'Nenhuma linha pôde ser fechada';
  return `${closed} linha${closed === 1 ? '' : 's'} fechada${closed === 1 ? '' : 's'}, `
    + `${matched} com as tangentes casadas`;
}

/**
 * A frase "nasceu chave" só para chave que NASCEU — nota do doc 47.
 *
 * Desfazer um "Apagar chave" devolve a chave, e a folha a anunciava como nova,
 * por cima do *"Desfeito: Apagar chave"* que o documento acabara de escrever.
 */
export function shouldAnnounceNewKeys(label: string | undefined): boolean {
  if (label === undefined) return true;
  return !label.startsWith('Desfeito: ') && !label.startsWith('Refeito: ');
}

// ---------------------------------------------------------------------------
// As notas do doc 50 — rodada 40, lote 5
// ---------------------------------------------------------------------------

/**
 * **Quadros ou segundos, na mesma caixa** — nota (a) do doc 50.
 *
 * O Empurrar pedia quadros, e "0,2 s" era recusado; "0,2" virava 0,2 quadro.
 * Agora: número inteiro = quadros (`6`, `6 q`, `6 quadros`); com `s` = segundos
 * (`0,2 s`, `0.2s`, `1 s`), convertido no quadro mais perto. Número quebrado
 * sem unidade é recusado (`null`): não se sabe se é quadro ou segundo, e o
 * programa não adivinha (regra 21) — quem chama diz como escrever.
 */
export function parseFramesOrSeconds(text: string, fps: number): number | null {
  const raw = text.trim().toLowerCase().replace(',', '.');
  const match = /^(-?\d+(?:\.\d+)?)\s*(s|seg|segundos?|q|quadros?)?$/.exec(raw);
  if (match === null) return null;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return null;
  const unit = match[2] ?? '';
  if (unit.startsWith('s')) {
    const frames = Math.round(value * fps);
    return frames > 0 ? frames : null;
  }
  return Number.isInteger(value) ? value : null;
}

/** A frase de quem errou a caixa de quadros ou segundos. */
export const FRAMES_OR_SECONDS_HINT = 'Quadros inteiros (6) ou segundos com "s" (0,2 s)';

/**
 * **Para onde as chaves coladas foram** — nota (b) do doc 50.
 *
 * *"leg_b em 0,00 · 0,50 · 1,00 s"*: o Colar espelhado dizia quantos valores
 * trocaram de lado, e não em que linha nem em que tempo a perna de trás ficou.
 */
export function pastedKeysSummary(refs: ReadonlyArray<KeyRef>): string {
  const byOwner = new Map<string, number[]>();
  for (const ref of refs) {
    const owner = ref.target.target ?? (ref.target.type === 'event' ? 'eventos' : ref.target.type);
    const list = byOwner.get(owner) ?? [];
    if (!list.some((time) => sameTime(time, ref.time))) list.push(ref.time);
    byOwner.set(owner, list);
  }
  const parts = [...byOwner].map(([owner, times]) => {
    const sorted = [...times].sort((a, b) => a - b).map((time) => formatSeconds(time).replace(' s', ''));
    return `${owner} em ${sorted.join(' · ')} s`;
  });
  return `${refs.length} chave${refs.length === 1 ? '' : 's'}: ${parts.join('; ')}`;
}

// ---------------------------------------------------------------------------
// O colar que não estica escondido — rodada 50, lote 3 (doc 98, item B11)
// ---------------------------------------------------------------------------

/**
 * Até onde o colar vai, em segundos: a agulha mais a chave mais tarde da
 * área de transferência. É o que deixa o Ctrl+V saber ANTES se a animação vai
 * crescer — chaves de 0 e 0,5 coladas em 1,0 vão até 1,5.
 */
export function pasteEnd(clip: KeyClipboard, time: number): number {
  const start = Math.max(0, roundTime(time));
  return clip.items.reduce((fim, item) => Math.max(fim, roundTime(start + item.offset)), start);
}

/** A área de transferência sem o que passaria do fim da animação: "Colar só o que cabe". */
export function clipThatFits(clip: KeyClipboard, time: number, duration: number): KeyClipboard {
  const start = Math.max(0, roundTime(time));
  return { ...clip, items: clip.items.filter((item) => roundTime(start + item.offset) <= duration + 1e-6) };
}

/**
 * O rodapé do Colar: TODAS as chaves coladas, dono por dono, com os tempos, e
 * a animação que cresceu. Antes ele dizia só as do tempo mais tarde ("2 chaves
 * em 1,50 s") — e as de 1,00 s, coladas junto, ficavam caladas.
 */
export function pasteDoneNotice(refs: ReadonlyArray<KeyRef>, before: number, after: number, leftOut = 0): string {
  const n = refs.length;
  let resumo = pastedKeysSummary(refs).replace(/^\d+ chaves?:/, `${n} chave${n === 1 ? '' : 's'} colada${n === 1 ? '' : 's'}:`);
  // Rodada 50, lote 4 (doc 101): "Colar só o que cabe" contava só o que entrou.
  if (leftOut > 0) resumo += `. ${leftOut === 1 ? '1 ficou' : `${leftOut} ficaram`} de fora: passava do fim`;
  return after > before + 1e-6
    ? `${resumo}. A animação cresceu de ${formatSeconds(before)} para ${formatSeconds(after)}`
    : resumo;
}

/**
 * **O rodapé da curva** — QA da noite de 04/11/2026. Dizia "4 chave(s) agora
 * em Suave" com 6 escolhidas: o "(s)" de formulário, e as 2 que ficaram de
 * fora sem razão. A única que não muda é a última da linha (`setKeyCurve`).
 */
export function curveAppliedNotice(written: number, chosen: number, label: string): string {
  if (written === 0) return 'Nenhuma chave mudou: a última de cada linha não tem para onde curvar';
  const parada = label === 'Parada';
  const frase = written === 1
    ? `1 chave agora ${parada ? 'parada' : `em ${label}`}`
    : `${written} chaves agora ${parada ? 'paradas' : `em ${label}`}`;
  const fora = chosen - written;
  if (fora <= 0) return frase;
  return fora === 1
    ? `${frase}. A outra é a última da linha: não tem para onde curvar`
    : `${frase}. As outras ${fora} são a última da linha: não têm para onde curvar`;
}

/** O rodapé de mudar a duração, com as chaves que sobraram depois do fim contadas direito. */
export function keysAfterEndNotice(duration: string, after: number): string {
  if (after <= 0) return `Duração: ${duration}`;
  return after === 1
    ? `Duração: ${duration}. 1 chave ficou depois do fim`
    : `Duração: ${duration}. ${after} chaves ficaram depois do fim`;
}

/**
 * A tecla que fecha um menu da folha (o do losango, o da faixa da entidade)
 * — QA da noite de 04/11/2026: Esc não fechava nada, como fecha no Spine e
 * no Spriter. Só o Esc: Enter e as setas são do item com o foco.
 */
export function closesPopup(key: string): boolean {
  return key === 'Escape';
}
