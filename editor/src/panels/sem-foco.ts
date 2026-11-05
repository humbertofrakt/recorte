// SPDX-License-Identifier: Apache-2.0
/**
 * **O botão de barra não guarda o foco do clique** — QA da noite de 04/11/2026.
 *
 * Clicar em "Duplicar" na aba Animações deixava o foco no botão; o Espaço
 * seguinte, que devia tocar (lote 68: "Espaço toca em toda parte"), apertava o
 * botão de novo — e duplicava outra vez. A folha da Linha do tempo já evitava
 * isso pegando o foco para si (`takeFocus`, rodada 23).
 *
 * Aqui, o mesmo para as abas Árvore, Ordem, Animações, Malha e pesos e
 * Propriedades: o clique do MOUSE num botão não move o foco (o `mousedown`
 * tem o padrão impedido; o clique acontece igual). Quem chega no botão pelo
 * teclado, com Tab, continua apertando com Espaço e Enter — a regra da casca
 * (`onKeyDown`) fica. As linhas das listas (Árvore, Animações) guardam o foco:
 * elas andam com as setas, e tratam o Espaço elas mesmas.
 *
 * A decisão é pura (`clickKeepsFocus`); o DOM só a aplica.
 */

/** As classes de botão que guardam o foco do clique: as linhas das listas. */
export const ROW_BUTTON_CLASSES: readonly string[] = Object.freeze(['arvore-item', 'anim-item']);

/** O clique do mouse neste botão move o foco para ele? Só nas linhas. */
export function clickKeepsFocus(classes: readonly string[]): boolean {
  return classes.some((name) => ROW_BUTTON_CLASSES.includes(name));
}

const armados = new WeakSet<HTMLElement>();

/** Arma a aba: o clique do mouse num botão de barra não leva o foco. */
export function barButtonsKeepNoFocus(host: HTMLElement): void {
  if (armados.has(host)) return;
  armados.add(host);
  host.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return;
    const alvo = event.target instanceof Element ? event.target.closest('button') : null;
    if (alvo === null || !host.contains(alvo)) return;
    if (clickKeepsFocus([...alvo.classList])) return;
    event.preventDefault();
  }, true);
}
