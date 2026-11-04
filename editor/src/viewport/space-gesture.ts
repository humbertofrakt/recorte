/**
 * O Espaço, na cena — lote 68, roteiro dos 30 minutos, passo 12.
 *
 * O Humberto aperta Espaço e espera a animação tocar, como no Spriter. Desde a
 * rodada 1 (lote 2, o tocador), o Espaço com o foco na cena só arrastava a
 * vista, e tocar exigia o foco fora dela: "quem está com o foco decide". Essa
 * decisão saiu. Agora a tecla faz as duas coisas, pelo gesto:
 *
 * | Gesto                              | Faz                |
 * |:-----------------------------------|:-------------------|
 * | apertar e soltar Espaço            | toca, ou pausa     |
 * | segurar Espaço e arrastar o ponteiro | move a vista       |
 *
 * Quem decide é quanto o ponteiro andou enquanto a tecla estava embaixo. Puro:
 * a cena mede, e chama a mesma ação `tocar` do menu.
 */

/** Quantos pixels de tela o ponteiro anda, com o Espaço embaixo, para ser arrastar a vista. */
export const SPACE_PAN_PIXELS = 4;

export type SpaceGesture = 'tocar' | 'pan';

/**
 * O que a subida do Espaço significa. `downAt` e `upAt` são os instantes da
 * descida e da subida (ms), e `moved` quanto o ponteiro andou arrastando a
 * vista. Só o arrasto decide: segurar parado e soltar ainda é tocar. O tempo
 * fica na assinatura para o dia em que um "segurar" sem arrasto quiser dizer
 * outra coisa.
 */
/**
 * O ponteiro desceu: começa a mover a vista? Botão do meio, ou o Espaço
 * segurado (na cena, ou — rodada 46, lote 4 — em qualquer painel). Puro.
 */
export function startsPan(button: number, spaceHeld: boolean): boolean {
  return button === 1 || spaceHeld;
}

export function spaceGesture(downAt: number, upAt: number, moved: number): SpaceGesture {
  void downAt;
  void upAt;
  return moved >= SPACE_PAN_PIXELS ? 'pan' : 'tocar';
}
