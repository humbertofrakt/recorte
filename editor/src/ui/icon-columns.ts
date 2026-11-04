/**
 * Recolher a coluna em ícones — rodada 4, lote 2 (05/10/2026).
 *
 * O Humberto, 04/10: *"Era para poder recolher eles, e expandir. Era para
 * seguir a filosofia do Photoshop."* E a conferência (`09 OS PAINEIS`): o `▾`
 * de hoje só encolhe o grupo na ALTURA; a coluna continua com 260 px na parede.
 *
 * O Photoshop: a **setinha dupla** no topo da coluna a recolhe numa faixa de
 * ícones; clicar num ícone abre aquele painel AO LADO, por cima da cena;
 * clicar de novo no mesmo ícone o fecha; a mesma setinha expande
 * ([teachucomp](https://www.teachucomp.com/?p=31506)). O que NÃO copiamos: a
 * opção "Auto-Collapse Iconic Panels" — um interruptor a mais. Fica o padrão
 * dele: o painel do ícone fecha no clique do ícone (ou no `Esc`), não sozinho.
 *
 * A tela é dele, o arquivo é do boneco: isto mora no navegador
 * (`RECORTE_colunas_em_icones`), nunca no `.bone`.
 *
 * Puro. A casca mede e desenha; isto decide.
 */

import { hasIcon } from './icons.js';
import type { Side } from './layout-model.js';
import type { ColumnState, FloatBox } from './panel-groups.js';

/** A largura da faixa de ícones, em pixels: um botão de 32 e a borda. */
export const ICON_STRIP_W = 40;

/** A altura de fábrica do painel aberto pelo ícone. Encolhe se não couber. */
export const FLYOUT_H = 420;

/** A chave no navegador. Só os dois interruptores; o painel aberto não volta. */
export const ICONS_STORAGE_KEY = 'RECORTE_colunas_em_icones';

export interface IconState {
  /** Cada coluna: `true` = recolhida em ícones. */
  left: boolean;
  right: boolean;
  /** O painel aberto ao lado da faixa, ou `null`. Só um de cada vez, nas duas. */
  open: { side: Side; id: string } | null;
}

export function defaultIconState(): IconState {
  return { left: false, right: false, open: null };
}

/**
 * Lê o que o navegador guardou. Qualquer coisa estranha vira o de fábrica
 * (as duas colunas abertas): uma coluna que some por um valor ilegível é um
 * painel perdido, e o caminho seguro é mostrar.
 */
export function parseIconState(raw: string | null): IconState {
  if (raw === null) return defaultIconState();
  try {
    const dado: unknown = JSON.parse(raw);
    if (typeof dado !== 'object' || dado === null) return defaultIconState();
    const { left, right } = dado as Record<string, unknown>;
    return { left: left === true, right: right === true, open: null };
  } catch {
    return defaultIconState();
  }
}

/** O que se guarda: os dois interruptores, sem o painel aberto. */
export function iconStateToSave(state: IconState): string {
  return JSON.stringify({ left: state.left, right: state.right });
}

/** A coluna está em ícones? */
export function isIconic(state: IconState, side: Side): boolean {
  return side === 'left' ? state.left : state.right;
}

/**
 * A setinha dupla: recolhe ou expande aquela coluna. Expandir fecha o painel
 * aberto daquele lado — ele volta a morar na coluna, no lugar dele.
 */
export function toggleIconic(state: IconState, side: Side): IconState {
  const proximo = side === 'left' ? { ...state, left: !state.left } : { ...state, right: !state.right };
  return state.open?.side === side ? { ...proximo, open: null } : proximo;
}

/** Recolhe ou expande as duas de uma vez — os itens do menu Janela. */
export function setAllIconic(state: IconState, iconic: boolean): IconState {
  return { left: iconic, right: iconic, open: iconic ? state.open : null };
}

/**
 * Clique num ícone: abre aquele painel ao lado; clicar no MESMO fecha;
 * clicar em outro troca. Ícone de coluna que não está em ícones não faz nada.
 */
export function clickIcon(state: IconState, side: Side, id: string): IconState {
  if (!isIconic(state, side)) return state;
  const mesmo = state.open !== null && state.open.side === side && state.open.id === id;
  return { ...state, open: mesmo ? null : { side, id } };
}

/** `Esc`, ou o painel foi fechado por outro caminho. */
export function closeFlyout(state: IconState): IconState {
  return state.open === null ? state : { ...state, open: null };
}

/**
 * A largura que a coluna ocupa na tela: a faixa, se em ícones; a dela, se não.
 * O `Tab` (esconder tudo) continua valendo por cima disto.
 */
export function columnWidth(state: IconState, side: Side, width: number): number {
  return isIconic(state, side) ? ICON_STRIP_W : width;
}

/** Um ícone da faixa: o painel e o grupo de onde ele é. */
export interface IconSlot {
  id: string;
  group: number;
}

/**
 * Os ícones da faixa, na ordem da coluna: grupo por grupo, aba por aba.
 * O grupo vira o separador (o Photoshop agrupa os ícones do mesmo jeito).
 * Fechados e soltos não entram: o fechado mora no menu Janela, e o solto já
 * está na tela.
 */
export function iconSlots(column: ColumnState): IconSlot[] {
  const saida: IconSlot[] = [];
  column.groups.forEach((ids, group) => {
    for (const id of ids) saida.push({ id, group });
  });
  return saida;
}

/**
 * O desenho de cada painel na faixa. O nome vai na dica (regra 12): o ícone
 * sozinho nunca é a única pista.
 */
export const PANEL_ICONS: Readonly<Record<string, string>> = Object.freeze({
  arvore: 'bone',
  ordem: 'ordem-frente',
  propriedades: 'target',
  imagens: 'image',
  entidades: 'link',
  pivos: 'pivot',
  particulas: 'particle',
  exibicao: 'eye',
  previa: 'play',
  animacoes: 'key',
  peles: 'swap-folder',
  regras: 'rule-ik',
  historico: 'undo',
  malha: 'mesh',
});

/**
 * O ícone de um painel, ou `null` quando ninguém escolheu um para ele.
 *
 * `null` NÃO é para virar um desenho de palpite (regra 21): a casca mostra o
 * nome escrito no lugar do ícone, e o teste de cobertura fica vermelho até
 * alguém escolher o desenho.
 */
export function panelIcon(id: string): string | null {
  const nome = PANEL_ICONS[id];
  return nome !== undefined && hasIcon(nome) ? nome : null;
}

/**
 * Onde o painel aberto pelo ícone aparece, nas coordenadas da camada dos
 * soltos: encostado na faixa, do lado da cena, começando na altura do ícone
 * e empurrado para dentro se passar do chão. Largura: a da coluna aberta.
 */
export function flyoutBox(
  side: Side, iconTop: number, width: number, areaW: number, areaH: number,
): FloatBox {
  const h = Math.max(1, Math.min(FLYOUT_H, areaH));
  const w = Math.max(1, Math.min(width, areaW - ICON_STRIP_W));
  const x = side === 'left' ? ICON_STRIP_W : Math.max(0, areaW - ICON_STRIP_W - w);
  const y = Math.min(Math.max(0, Math.round(iconTop)), Math.max(0, areaH - h));
  return { x, y, w, h };
}

// ---------------------------------------------------------------------------
// Onde mora a setinha `«»` — pedido do Diretor, 05/10: resolver no modelo
// ANTES de ligar
// ---------------------------------------------------------------------------

/** A largura do botão da setinha, igual ao `▾` que já está na tira: 27 px. */
export const TOGGLE_W = 27;

/** A altura da faixa fina no topo da coluna, quando a setinha mora lá. */
export const TOGGLE_BAND_H = 14;

/** As duas casas possíveis. */
export type ToggleSpot = 'tira' | 'topo';

/**
 * A setinha cabe na ÚLTIMA linha da tira de cima, depois das abas e do `▾`,
 * sem a tira quebrar em mais uma linha (cada linha a mais tira 33 px do
 * painel — foi medido em 13/09)?
 *
 * `tabs` são as abas da tira de cima; `strip`, a tira; `reserved`, o que já
 * mora no fim da linha (o `▾`, 27 px). As medidas vêm da tela; isto só conta.
 */
export function toggleFitsStrip(
  tabs: readonly { left: number; right: number; top: number; bottom: number }[],
  strip: { left: number; right: number },
  reserved: number,
  gap = 4,
): boolean {
  if (tabs.length === 0) return strip.right - strip.left >= reserved + TOGGLE_W + 2 * gap;
  const ultimaLinha = Math.max(...tabs.map((tab) => tab.top));
  const fim = Math.max(...tabs.filter((tab) => tab.top === ultimaLinha).map((tab) => tab.right));
  return fim + gap + TOGGLE_W + gap + reserved <= strip.right;
}

/**
 * A casa da setinha nas DUAS colunas — a mesma nas duas, e a mesma enquanto
 * a tela não muda de tamanho: um botão que pula de lugar conforme a aba que
 * se arrasta é o que mais atrapalha quem lê com dificuldade.
 *
 * Cabe nas duas tiras de cima: `tira`. Não cabe em uma delas: `topo`, a faixa
 * fina acima dos grupos — onde o Photoshop a põe sempre.
 *
 * Na tela de fábrica de 1440×900 a tira de cima da direita já tem três linhas
 * (seis abas em 258 px; o `▾` sozinho na terceira) e a da esquerda tem folga:
 * a resposta lá é `topo`. A ligação mede as duas saídas, como o Diretor pediu.
 */
export function toggleSpot(left: boolean, right: boolean): ToggleSpot {
  return left && right ? 'tira' : 'topo';
}

/** Um item do menu Janela → Arrumar, e o porquê de estar cinza. */
export interface IconMenuItem {
  enabled: boolean;
  why: string;
}

/** *Recolher em ícone*: cinza quando as duas já estão em ícones. */
export function canCollapseToIcons(state: IconState): IconMenuItem {
  return state.left && state.right
    ? { enabled: false, why: 'As duas colunas já estão em ícones' }
    : { enabled: true, why: '' };
}

/** *Expandir*: cinza quando nenhuma está em ícones. */
export function canExpand(state: IconState): IconMenuItem {
  return !state.left && !state.right
    ? { enabled: false, why: 'As duas colunas já estão abertas' }
    : { enabled: true, why: '' };
}
