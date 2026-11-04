/**
 * O recado do gesto — rodada final, chat F, defeito F1 (29/09/2026).
 *
 * **A forma do erro: o recado era escrito e apagado no mesmo quadro.** Com o
 * botão apertado, a cena chama `doc.repose()` a cada quadro (a física anda
 * enquanto a mão arrasta), e cada `repose` avisa uma mudança SEM nome. O
 * rodapé mostra o nome da última mudança; a última era sempre a do `repose`,
 * e ele voltava a "Arquivo não salvo". "Mover osso", "Girar osso" e "Segure
 * Alt e arraste para desenhar a caixa" existiam no código e ninguém nunca leu.
 *
 * O conserto não cala o `repose`: guarda o último recado com nome dito
 * enquanto a mão está embaixo, e a cena o diz de novo quando a mão sobe —
 * depois do último `repose`, onde ele fica.
 *
 * Módulo puro: sem DOM, sem `EditorDoc`. Quem liga é `viewport.ts`.
 */

import type { DocChange } from '../contract.js';

export class GestureNotice {
  private down = false;
  private said: string | null = null;
  private command: string | null = null;

  /** A mão desceu na cena: começa um gesto, sem recado ainda. */
  press(): void {
    this.down = true;
    this.said = null;
    this.command = null;
  }

  /** Toda mudança do documento passa aqui; só a que tem nome, com a mão embaixo, fica. */
  hear(change: DocChange): void {
    if (!this.down) return;
    const label = change.label;
    if (label === undefined || label.trim() === '') return;
    // Rodada 46, lote 1: o `repose` de cada quadro repete o recado (para o
    // rodapé não se calar). A repetição não é comando nem recado novo.
    if (change.kind === 'transform' && label === this.said) return;
    this.said = label;
    // O recado solto (`notice`) chega como `selection`; o que chega com outro
    // tipo é um COMANDO, e o nome dele é o do desfazer ("Girar osso").
    if (change.kind !== 'selection') this.command = label;
  }

  /**
   * O nome do último comando do gesto que acabou de soltar, ou `null`. Lido
   * DEPOIS de `release`: é por ele que se sabe o que o gesto mexeu, porque o
   * recado do rodapé pode ser outro ("Girar 44,1°").
   */
  lastCommand(): string | null {
    return this.command;
  }

  /**
   * O recado de agora, com a mão embaixo — rodada 46, lote 1. É o que o
   * `repose` de cada quadro leva junto, para o rodapé falar DURANTE o gesto.
   * `null` com a mão em cima ou antes do primeiro recado.
   */
  current(): string | null {
    return this.down ? this.said : null;
  }

  /**
   * A mão subiu. Devolve o recado a dizer de novo, ou `null` quando o gesto
   * não disse nada (um clique que só escolhe, por exemplo).
   */
  release(): string | null {
    const said = this.down ? this.said : null;
    this.down = false;
    this.said = null;
    return said;
  }
}
