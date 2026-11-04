/**
 * O Propriedades nunca fica menor que a ficha rápida — rodada 4, lote 9
 * (05/10/2026), passado pela rodada 23.
 *
 * O defeito (#4 do `07 A NOITE CONFERIDA`, os antigos K17 e J17 da fila): com
 * os Detalhes da linha do tempo abertos, o grupo do Propriedades ficava tão
 * baixo que só X e Y apareciam; o Ângulo da ficha rápida ficava cortado, até
 * em 1920×1080 (fotos `backup/fotos-obra/rodada-23/T1_antes_*`). O painel
 * rola — mas ninguém acha um campo num painel de 29 px.
 *
 * A causa: a divisão da coluna (`groupShares`, `FOCUS_SPLIT`) é uma FRAÇÃO da
 * altura. Quando a linha do tempo abre, a coluna encolhe, e a fração do
 * Propriedades encolhe junto, sem chão.
 *
 * A régua nova: **o grupo em que o Propriedades está à frente tem chão** — a
 * tira de abas mais a ficha rápida inteira. O que cede é o OUTRO grupo da
 * mesma coluna, até o mínimo dele (`GROUP_MIN_PX`, 80 px). A cena e a linha
 * do tempo não cedem nada: a altura da coluna não muda, muda só a divisão.
 *
 * ## As medidas (fotos da rodada 23, `programa/` v25.7)
 *
 * | O que | Altura |
 * |:---|---:|
 * | a tira de abas, uma linha | 37 px |
 * | a alça entre os grupos | 8 px |
 * | a ficha com um **osso** escolhido: título + X/Y + Escala + Ângulo + Alfa | 190 px |
 * | a ficha com uma **imagem** escolhida: a mesma, mais a linha Imagem | 228 px |
 *
 * A ligação mede a ficha de verdade (o fim da ficha rápida, no painel) e
 * passa o número; estes são o chão de fábrica, para quando não há medida.
 *
 * ## As três telas, com os Detalhes abertos
 *
 * | Tela | Coluna | Propriedades hoje | Com o chão (imagem: 265) | A Árvore fica com |
 * |:---|---:|---:|---:|---:|
 * | 1920×1080 | 548 | 174 | **265** — ficha inteira | 275 |
 * | 1440×900 | 440 | 142 | **265** — ficha inteira | 167 |
 * | 1280×720 | 342 | 106 | **254** — ver abaixo | **80** (o mínimo) |
 *
 * ## O que cede em 1280×720 — a escolha escrita
 *
 * Lá não cabe tudo: 265 + 8 + 80 = 353, e a coluna tem 342.
 *
 * | Cede | Quanto | Por quê |
 * |:---|---:|:---|
 * | **a Árvore** | de 228 para **80** px (a tira e uma linha e meia) | com os Detalhes abertos se está animando: escolhe-se o osso na cena ou numa linha da linha do tempo, e digita-se nas Propriedades. A Árvore continua rolando, e dois cliques na aba dela (lote 4) a recolhem de vez |
 * | **a ficha de uma IMAGEM** | **11 px**: metade da linha Alfa, que rola | o Ângulo fica à vista nas duas fichas. A de osso (190) cabe inteira |
 * | a linha do tempo | nada | ela já está abaixo do chão dela nessa tela (237 de 240) |
 * | a cena | nada | o chão dela (`STAGE_MIN`, K13) é outra régua, e a altura da coluna não muda |
 *
 * Puro. A casca mede e aplica; isto decide.
 */

import { GROUP_MIN_PX } from './panel-groups.js';

/** A tira de abas de uma linha, medida. */
export const TAB_STRIP_H = 37;

/** A alça entre os dois grupos, medida. */
export const SPLIT_GRIP_H = 8;

/** A ficha rápida com um osso escolhido, do título ao fim da linha Alfa. */
export const QUICK_SHEET_BONE = 190;

/** A ficha rápida com uma imagem escolhida: a mesma, mais a linha Imagem. */
export const QUICK_SHEET_IMAGE = 228;

/** O chão do grupo do Propriedades: a tira mais a ficha. Sem medida, a maior das duas. */
export function propsNeed(sheet: number = QUICK_SHEET_IMAGE, strip: number = TAB_STRIP_H): number {
  return Math.max(0, Math.round(strip)) + Math.max(0, Math.round(sheet));
}

/*
 * ## A lista de Animações também tem chão — rodada 17, K13 + K1b (05/10/2026)
 *
 * O mesmo defeito, do outro lado: com os Detalhes abertos, a coluna da direita
 * desce de 772 para 548 px em 1920×1080, e o grupo das Animações, que levava
 * um terço, ficou com 168 px — a tira de abas (70, duas linhas) e **uma linha
 * da lista**: `idle`; `walk` e `attack` sumiam (foto `K13_detalhes_aberto` da
 * rodada 17). Quem anima com a linha do tempo aberta perdia a lista de vista.
 *
 * A régua é a do Propriedades: o grupo em que as Animações estão à frente tem
 * chão — a tira, a cabeça do painel (o corpo e o título da seção) e **três
 * linhas**; quem cede é o outro grupo. Se os dois grupos de uma coluna têm
 * chão, o do Propriedades vence: a ficha é onde se digita.
 *
 * Duas cercas, medidas: o chão só vale **com os Detalhes abertos** (fechados,
 * a coluna tem altura, e o chão tirava das Imagens e da Prévia em 1440×900 e
 * 1280×720 — a medição caía de 81 para 78 de 90), e nunca passa da **metade
 * da coluna** (`animFloorCap`).
 */

/** Quantas linhas da lista de Animações ficam sempre à vista. */
export const ANIM_LIST_ROWS = 3;

/** A cabeça do painel Animações, do topo do corpo à primeira linha (medida: 61 px). */
export const ANIM_LIST_HEAD = 61;

/** Uma linha da lista de Animações (medida: 34 px). */
export const ANIM_LIST_ROW = 34;

/** O chão do grupo das Animações: a tira, a cabeça e três linhas (ou menos, se há menos). */
export function animListNeed(rows: number = ANIM_LIST_ROWS, strip: number = TAB_STRIP_H): number {
  const linhas = Math.max(0, Math.min(ANIM_LIST_ROWS, Math.round(rows)));
  return Math.max(0, Math.round(strip)) + ANIM_LIST_HEAD + linhas * ANIM_LIST_ROW;
}

/**
 * O teto do chão das Animações: **metade da coluna**.
 *
 * Em 1280×720 a coluna inteira tem 412 px com os Detalhes fechados; dar à
 * lista os 233 dela tirava as Imagens e as Partículas de vista (a medição caiu
 * de 81 para 78 de 90). A lista é para achar e trocar de animação; as Imagens
 * são onde se escolhe a arte. Nenhuma das duas fica com menos da metade por
 * causa da outra.
 */
export function animFloorCap(need: number, room: number, grip: number): number {
  const metade = Math.floor(Math.max(0, room - grip) / 2);
  return Math.max(0, Math.min(Math.round(need), metade));
}

/**
 * Os painéis que dão chão ao grupo deles, do que vence para o que cede.
 *
 * Rodada 47, lote 6 (nota 3 do doc 87): a **Malha** à frente também tem chão —
 * o conteúdo dela inteiro, medido (a seção da ferramenta aberta, as outras
 * dobradas). A aba rolava 160 px em 1440×900 e uns 40 em 1920×1080 com o
 * outro grupo segurando mais da metade da coluna. Ela cede às duas de cima.
 */
export const FLOOR_PANELS = ['propriedades', 'animacoes', 'malha'] as const;
export type FloorPanel = typeof FLOOR_PANELS[number];

/**
 * Qual grupo da coluna tem chão, e por quê: o primeiro de `FLOOR_PANELS` que
 * está À FRENTE num grupo aberto. `null` quando nenhum está.
 */
export function floorGroup(
  active: readonly (string | null | undefined)[],
  collapsed: (index: number) => boolean,
  detailsOpen = true,
): { group: 0 | 1; panel: FloorPanel } | null {
  for (const panel of FLOOR_PANELS) {
    // As Animações só têm chão com os Detalhes abertos (K13); o Propriedades, sempre.
    if (panel === 'animacoes' && !detailsOpen) continue;
    const g = active.findIndex((id, index) => id === panel && !collapsed(index));
    if (g === 0 || g === 1) return { group: g, panel };
  }
  return null;
}

export interface ColumnSplitInput {
  /** A altura da coluna inteira, em pixels. */
  room: number;
  /** A alça entre os grupos. Zero quando só um grupo tem aba. */
  grip: number;
  /** As alturas que a divisão de hoje daria aos dois grupos (cima, baixo). */
  wanted: readonly [number, number];
  /**
   * O grupo em que o Propriedades está À FRENTE, ou `null`: em outro grupo
   * atrás de outra aba, solto, fechado, ou o grupo dele recolhido pela mão.
   * Nesses casos o chão não vale, e nada muda.
   */
  propsGroup: 0 | 1 | null;
  /** O chão do grupo dele (`propsNeed`). */
  need: number;
  /** O mínimo do outro grupo. */
  otherMin?: number;
}

export interface ColumnSplitPlan {
  /** As alturas dos dois grupos (cima, baixo). Somam `room - grip`. */
  heights: [number, number];
  /** Quanto o Propriedades ganhou do outro grupo. */
  yielded: number;
  /** Quanto do chão ainda faltou (a ficha rola por isso). Zero = inteira. */
  cut: number;
}

/**
 * A divisão da coluna com o chão do Propriedades.
 *
 * Nunca ENCOLHE o Propriedades (se a divisão de hoje já dá mais, fica); nunca
 * deixa o outro grupo abaixo do mínimo dele; e diz quanto faltou, para a
 * prova e para o rodapé não fingirem que coube (regra 21).
 */
export function planColumn(input: ColumnSplitInput): ColumnSplitPlan {
  const avail = Math.max(0, Math.round(input.room - input.grip));
  const [w0, w1] = input.wanted;
  const base: [number, number] = [Math.round(w0), Math.max(0, avail - Math.round(w0))];
  if (input.propsGroup === null) return { heights: base, yielded: 0, cut: 0 };
  const p = input.propsGroup;
  const o = p === 0 ? 1 : 0;
  const temHoje = base[p];
  const otherMin = Math.max(0, input.otherMin ?? GROUP_MIN_PX);
  const teto = Math.max(0, avail - otherMin);
  const ganha = Math.max(temHoje, Math.min(input.need, teto));
  const heights: [number, number] = [0, 0];
  heights[p] = Math.min(ganha, avail);
  heights[o] = avail - heights[p];
  return { heights, yielded: heights[p] - temHoje, cut: Math.max(0, input.need - heights[p]) };
}

/** A fração do grupo de CIMA que a casca escreve, a partir do plano. */
export function planShare(plan: ColumnSplitPlan): number {
  const total = plan.heights[0] + plan.heights[1];
  return total <= 0 ? 0.5 : plan.heights[0] / total;
}

/**
 * A frase do rodapé quando a ficha não coube inteira — uma vez por abertura
 * dos Detalhes, nunca a cada quadro. Vazio quando coube.
 */
export function cutNotice(plan: ColumnSplitPlan): string {
  return plan.cut <= 0
    ? ''
    : `A ficha rápida não cabe inteira nesta tela (faltam ${plan.cut} px): ela rola. O ▾ do grupo de cima o recolhe e dá a altura às Propriedades`;
}

// ---------------------------------------------------------------------------
// A Imagens também tem chão, e quem cede são os Detalhes — rodada 17, K1b
// ---------------------------------------------------------------------------

/**
 * **Quanto a faixa de baixo (os Detalhes) pode ter, para a coluna caber** —
 * decisão do Diretor, 06/10/2026. Com os Detalhes abertos, a lista de
 * Animações já cabia (o chão dela), e a aba Imagens ficava com o cabeçalho e
 * uma fileira cortada. Agora a Imagens tem chão também — a tira, o cabeçalho
 * e **uma fileira inteira de miniaturas** — e quem cede é a altura dos
 * Detalhes, **só enquanto eles estão abertos**.
 *
 * `room` é a altura do corpo da janela (barra de ações + meio + alça + faixa);
 * `column` é o que a coluna precisa. A faixa nunca desce abaixo de `floor`
 * (o `OPEN_MIN` dela), nem cresce além do que a pessoa pediu (`wanted`): numa
 * tela onde as duas coisas não cabem, a faixa fica no chão dela, e a coluna
 * fica com o que sobra (em 1280×720 não cabe tudo; é dito no relatório).
 */
export function dockRoomForColumn(
  wanted: number, room: number, bar: number, grip: number, column: number, floor: number,
): number {
  const sobra = Math.floor(room - bar - grip - column);
  return Math.max(Math.min(wanted, floor), Math.min(wanted, sobra));
}

/** A Imagens sem medida: a tira de três linhas, o cabeçalho e uma fileira (medidos em 06/10). */
export const IMAGES_ROW_NEED = 103 + 232;
