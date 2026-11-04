/**
 * `Tab` e `Shift+Tab` — rodada 4, lote 6 (05/10/2026).
 *
 * O Photoshop tem dois: **`Tab`** esconde tudo; **`Shift+Tab`** esconde só os
 * painéis e deixa as ferramentas ([creativetechs](https://www.creativetechs.com/?p=241)).
 * O nosso tinha só o `Tab`; o `Shift+Tab` não fazia nada (foto `15` da
 * conferência).
 *
 * | Tecla | Some | Fica |
 * |:---|:---|:---|
 * | `Tab` | as duas colunas, os painéis soltos e a faixa de baixo — como hoje | a barra de menus e a de ferramentas |
 * | `Shift+Tab` | as duas colunas e os painéis soltos | a faixa de baixo (a linha do tempo), além das barras |
 *
 * A linha do tempo fica no `Shift+Tab` porque ela é, para quem anima, o que a
 * caixa de ferramentas é no Photoshop: o lugar de onde a mão não sai.
 *
 * Qualquer uma das duas, com algo escondido, mostra TUDO de volta — é o
 * Photoshop, e é o caminho que não exige lembrar qual das duas se apertou.
 *
 * O `Tab` de hoje mora em `LayoutState.hidden` (guardado no navegador). O
 * `Shift+Tab` é estado da sessão: não se grava. Abrir o programa com as
 * colunas sumidas por uma tecla de ontem é um susto que ninguém pediu.
 *
 * Puro. A linha da tecla vai para `ui/keys.ts` na ligação.
 */

/** O que está escondido agora. */
export type HideMode = 'nada' | 'tudo' | 'colunas';

/** `Tab`: esconde tudo; com qualquer coisa escondida, mostra tudo. */
export function pressTab(mode: HideMode): HideMode {
  return mode === 'nada' ? 'tudo' : 'nada';
}

/** `Shift+Tab`: esconde só as colunas; com qualquer coisa escondida, mostra tudo. */
export function pressShiftTab(mode: HideMode): HideMode {
  return mode === 'nada' ? 'colunas' : 'nada';
}

/** As colunas (e os painéis soltos) aparecem? */
export function columnsShown(mode: HideMode): boolean {
  return mode === 'nada';
}

/** A faixa de baixo (a linha do tempo) aparece? */
export function dockShown(mode: HideMode): boolean {
  return mode !== 'tudo';
}

/** O modo a partir do que está guardado hoje (`LayoutState.hidden`). */
export function modeFromHidden(hidden: boolean): HideMode {
  return hidden ? 'tudo' : 'nada';
}

/** O que se grava: só o `Tab` vira `hidden`. O `Shift+Tab` não se grava. */
export function hiddenToSave(mode: HideMode): boolean {
  return mode === 'tudo';
}

/** A frase do rodapé depois da tecla: o que sumiu e como voltar. */
export function hideNotice(mode: HideMode): string {
  switch (mode) {
    case 'nada': return 'Painéis de volta';
    case 'tudo': return 'Painéis e linha do tempo escondidos. Tab mostra de novo';
    case 'colunas': return 'Painéis escondidos; a linha do tempo fica. Shift+Tab mostra de novo';
  }
}
