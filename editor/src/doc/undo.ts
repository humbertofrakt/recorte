/**
 * Undo stack (owner A).
 *
 * Holds applied commands in order. `push` runs nothing: the caller applies the
 * command first, then hands it over, because a command that throws must not
 * land on the stack. A command may absorb the previous one through `mergeWith`,
 * which is what turns a drag of a hundred mouse moves into one undo step.
 */

import type { Command, EditorDoc } from '../contract.js';

/** Default ceiling on remembered steps. Old steps fall off the bottom. */
export const DEFAULT_LIMIT = 200;

// ---------------------------------------------------------------------------
// O gesto de várias partes — 28/09/2026
// ---------------------------------------------------------------------------

/**
 * A chave de junção de um comando, quando ele tem uma.
 *
 * Não está no contrato: é um campo que os comandos de arrasto carregam por
 * costume (`SetProperty`, `SetAttachments`, as chaves). Quem não tem, não
 * entra em gesto nenhum.
 */
function mergeKeyOf(command: Command): string | null {
  const key = (command as { mergeKey?: unknown }).mergeKey;
  return typeof key === 'string' && key !== '' ? key : null;
}

/**
 * Um gesto que grava MAIS DE UM comando por movimento do mouse.
 *
 * O defeito, medido em 28/09/2026: com "Não mexer nos filhos" ligado, cada
 * movimento do mouse grava o osso (`mover:7`) e DEPOIS a compensação
 * (`mover:7:filhos`). A pilha só sabia juntar com o comando de cima, e o de
 * cima era sempre o OUTRO: osso, filhos, osso, filhos. Nada se juntava, e um
 * arrasto de quatro movimentos pedia **oito** `Ctrl+Z` — de cinquenta, cem.
 * Valia para Mover, Girar e Escalar. A forma: *a junção olha um vizinho só, e
 * o gesto alterna dois*.
 *
 * O gesto guarda as partes lado a lado. Cada comando novo procura a SUA parte
 * (a que o `mergeWith` dele aceita) e a absorve; se não acha, entra como parte
 * nova. Desfazer reverte as partes de trás para a frente.
 *
 * Só entra no gesto quem tem a chave do gesto ou uma chave FILHA dela
 * (`K:filhos`, `K:desenhos`). Chave igual que não se juntou sozinha continua
 * sendo passo próprio, como sempre foi.
 */
export class GestureGroup implements Command {
  readonly parts: Command[];

  constructor(readonly mergeKey: string, first: Command, second: Command) {
    this.parts = [first, second];
  }

  /** O nome do gesto é o da primeira parte: "Mover osso", não "Compensar filhos". */
  get label(): string {
    return this.parts[0].label;
  }

  /** `structure` se alguma parte for: é o caminho mais caro, e o único exato. */
  get kind(): Command['kind'] {
    const pesada = this.parts.find((part) => part.kind !== 'transform');
    return pesada?.kind ?? 'transform';
  }

  /** Só quando TODAS as partes mexeram na mesma animação e em mais nada. */
  get animationOnly(): string | undefined {
    const first = this.parts[0].animationOnly;
    if (first === undefined) return undefined;
    return this.parts.every((part) => part.animationOnly === first) ? first : undefined;
  }

  apply(doc: EditorDoc): void {
    for (const part of this.parts) part.apply(doc);
  }

  revert(doc: EditorDoc): void {
    for (let i = this.parts.length - 1; i >= 0; i--) this.parts[i].revert(doc);
  }

  /** `true` quando a chave é a do gesto ou filha dela. */
  accepts(command: Command): boolean {
    const key = mergeKeyOf(command);
    return key !== null && (key === this.mergeKey || key.startsWith(`${this.mergeKey}:`));
  }

  /** Põe o comando no gesto: na parte que ele absorve, ou como parte nova. */
  absorb(command: Command): void {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      if (command.mergeWith?.(this.parts[i]) === true) {
        this.parts[i] = command;
        return;
      }
    }
    this.parts.push(command);
  }
}

export class UndoStack {
  readonly limit: number;

  /** Applied commands, oldest first. */
  private done: Command[] = [];
  /** Undone commands, most recently undone last. */
  private undone: Command[] = [];
  /** Commands that may no longer absorb a newer one (the drag ended). */
  private blocked = new WeakSet<Command>();
  /**
   * Em que documento cada comando foi aplicado — degrau 4b (17/09/2026).
   *
   * O projeto tem vários corpos e **uma pilha só**: o `Ctrl+Z` desfaz o último
   * passo, seja ele no homem ou no lobisomem. Um comando só pode ser revertido
   * no documento em que foi aplicado (ele guarda ponteiros e índices daquele
   * arquivo), então a pilha anota o dono e reverte nele, e não em quem pediu.
   * Sem dono anotado (a pilha de um documento só) vale quem pediu, como sempre.
   */
  private owners = new WeakMap<Command, EditorDoc>();
  /**
   * O **uri** do corpo em que cada comando foi aplicado — degrau 5 (17/09/2026).
   *
   * O `Doc` que a casca segura troca de corpo quando o foco troca (clicar em
   * Corpos, na janela Animação): o objeto continua o mesmo e o arquivo dentro
   * dele passa a ser outro. Anotar só o OBJETO deixaria de dizer a verdade no
   * primeiro clique — o passo dado no homem seria revertido no lobisomem, que
   * não tem aqueles ossos. O uri não troca de dono: ele **é** o corpo.
   *
   * `resolveByUri` é como o projeto responde *"quem segura este uri hoje"*.
   * Sem projeto (a pilha de um documento só) nada disso é escrito, e vale o
   * objeto, como antes.
   */
  private ownerUris = new WeakMap<Command, string>();

  /** Posto pelo projeto: o documento que segura aquele uri agora, ou `null`. */
  resolveByUri: ((uri: string) => EditorDoc | null) | null = null;

  constructor(limit: number = DEFAULT_LIMIT) {
    this.limit = Math.max(1, limit);
  }

  /**
   * Records an already-applied command. When the command absorbs the previous
   * one (`mergeWith` returns `true`) it replaces it instead of stacking on top,
   * and `true` is returned so the caller knows no new step was created.
   *
   * `owner`: o documento em que o comando foi aplicado (degrau 4b). Um comando
   * só absorve o anterior quando os dois são do mesmo documento.
   */
  push(command: Command, owner?: EditorDoc, ownerUri?: string): boolean {
    this.undone.length = 0;
    if (owner !== undefined) this.owners.set(command, owner);
    if (ownerUri !== undefined) this.ownerUris.set(command, ownerUri);
    const previous = this.done[this.done.length - 1];
    let merged = false;
    if (previous !== undefined && !this.blocked.has(previous) && command.mergeWith !== undefined
      && this.owners.get(previous) === owner) {
      merged = command.mergeWith(previous) === true;
    }
    if (!merged && previous !== undefined && !this.blocked.has(previous)
      && this.owners.get(previous) === owner) {
      const gesture = this.joinGesture(previous, command);
      if (gesture !== null) {
        if (owner !== undefined) this.owners.set(gesture, owner);
        if (ownerUri !== undefined) this.ownerUris.set(gesture, ownerUri);
        this.done[this.done.length - 1] = gesture;
        return true;
      }
    }
    if (merged) {
      this.done[this.done.length - 1] = command;
    } else {
      this.done.push(command);
      while (this.done.length > this.limit) this.done.shift();
    }
    return merged;
  }

  /**
   * O comando entra no gesto do de cima, quando é parte dele. `null` = não é.
   *
   * Dois casos: o de cima já é um gesto e aceita a chave; ou o de cima é um
   * comando solto e o novo traz uma chave FILHA da dele — aí nasce o gesto.
   */
  private joinGesture(previous: Command, command: Command): GestureGroup | null {
    if (previous instanceof GestureGroup) {
      if (!previous.accepts(command)) return null;
      previous.absorb(command);
      return previous;
    }
    const base = mergeKeyOf(previous);
    const key = mergeKeyOf(command);
    if (base === null || key === null || !key.startsWith(`${base}:`)) return null;
    return new GestureGroup(base, previous, command);
  }

  /**
   * O documento em que o comando foi aplicado, quando a pilha o anotou.
   *
   * O **uri** manda quando há um: ele diz o corpo, e o projeto diz quem segura
   * esse corpo agora (degrau 5). O objeto é a resposta de quando não há
   * projeto, e a rede de segurança de quando o uri já não está em lista
   * nenhuma — um corpo rebaixado a entidade continua tendo o seu `Doc`.
   */
  ownerOf(command: Command): EditorDoc | null {
    const uri = this.ownerUris.get(command);
    if (uri !== undefined) {
      const hoje = this.resolveByUri?.(uri) ?? null;
      if (hoje !== null) return hoje;
    }
    return this.owners.get(command) ?? null;
  }

  /**
   * Reverts the last command, in the document it was applied to (or in `doc`
   * when none was recorded). Returns it, or `null` when there is nothing.
   */
  undo(doc: EditorDoc): Command | null {
    const command = this.done.pop();
    if (command === undefined) return null;
    command.revert(this.ownerOf(command) ?? doc);
    this.undone.push(command);
    return command;
  }

  /** Re-applies the last undone command, in its own document. Returns it, or `null`. */
  redo(doc: EditorDoc): Command | null {
    const command = this.undone.pop();
    if (command === undefined) return null;
    command.apply(this.ownerOf(command) ?? doc);
    this.done.push(command);
    this.blocked.add(command);
    return command;
  }

  /**
   * Closes the top step to further merging, so the next drag does not absorb
   * the previous one. The viewport calls it when the pointer goes up.
   */
  breakMerge(): void {
    const previous = this.done[this.done.length - 1];
    if (previous !== undefined) this.blocked.add(previous);
  }

  get canUndo(): boolean {
    return this.done.length > 0;
  }

  get canRedo(): boolean {
    return this.undone.length > 0;
  }

  get undoLabel(): string | null {
    return this.done[this.done.length - 1]?.label ?? null;
  }

  get redoLabel(): string | null {
    return this.undone[this.undone.length - 1]?.label ?? null;
  }

  /** Number of steps that can be undone. */
  get depth(): number {
    return this.done.length;
  }

  /**
   * A pilha inteira, do mais antigo ao mais novo, para o painel Histórico.
   *
   * **Só leitura.** Devolve nomes e posições, nunca os comandos: um painel que
   * pudesse pegar um `Command` daqui poderia aplicá-lo fora de ordem, e a
   * pilha deixaria de ser uma pilha.
   *
   * Os desfeitos vêm depois dos feitos, na ordem em que seriam refeitos —
   * `undone` guarda o último desfeito no fim, e aqui ele é invertido para a
   * lista da tela ler de cima para baixo como o tempo anda.
   */
  entries(): Array<{ label: string; index: number; undone: boolean }> {
    const out = this.done.map((command, index) => ({
      label: command.label, index, undone: false,
    }));
    const desfeitos = [...this.undone].reverse();
    desfeitos.forEach((command, i) => {
      out.push({ label: command.label, index: this.done.length + i, undone: true });
    });
    return out;
  }

  /**
   * Onde a pilha está agora: a posição do último passo feito.
   *
   * `-1` quando nada foi feito ainda — é o estado de quando o arquivo abriu, e
   * ele é uma posição de verdade: dá para voltar até ele.
   */
  cursor(): number {
    return this.done.length - 1;
  }

  /** Forgets everything. Used when another file is opened. */
  clear(): void {
    this.done = [];
    this.undone = [];
    this.blocked = new WeakSet<Command>();
  }
}
