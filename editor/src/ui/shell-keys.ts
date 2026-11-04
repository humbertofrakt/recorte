/**
 * A tecla que cala — o juízo de uma tecla de atalho (28/09/2026).
 *
 * O defeito, achado pela régua 3 em 22/09 e decidido naquele dia pelo
 * Planejador (`documentos/planos/A PORTA QUE ENGOLE O CLIQUE 2026-09-22.md`,
 * "O que FALTA", item 4): a casca procurava a tecla no mapa, pedia a ação, e
 * quando a ação não existia devolvia `false` — a mesma resposta de uma tecla
 * que não é de ninguém. A pessoa apertava `Ctrl+K`, nada acontecia, e nada
 * dizia por quê.
 *
 * A decisão tem duas metades, e a segunda importa tanto quanto a primeira:
 *
 * | A tecla | O que o programa faz |
 * |:---|:---|
 * | está na tabela e a ação NÃO existe | **avisa**, com o nome da função |
 * | não está na tabela | segue calada: ela é do navegador, ou de ninguém |
 *
 * A ação que existe e está cinza (falta escolher alguma coisa) fica como
 * sempre foi: a decisão de 22/09 não a cobre, e mudá-la aqui seria inventar
 * por cima.
 *
 * Módulo puro: não toca em DOM nem no registro de ações. Quem chama entrega as
 * duas perguntas — *"existe?"* e *"rodou?"* — e recebe o veredito.
 */

/** O que a casca faz com a tecla. */
export type KeyVerdict =
  /** Fora da tabela: a tecla segue livre, e ninguém diz nada. */
  | { kind: 'livre' }
  /** A ação rodou. A tecla é nossa: o navegador não a recebe. */
  | { kind: 'rodou'; action: string }
  /** A ação existe e está desligada agora. A tecla segue livre, como sempre. */
  | { kind: 'cinza'; action: string }
  /** Na tabela, e a ação não existe: o programa DIZ. */
  | { kind: 'muda'; action: string; notice: string };

/** O que o juízo precisa saber do resto do programa. */
export interface KeyJudge {
  /** De tecla para ação, em `toda-parte` — o `keyMap` de `ui/keys.ts`. */
  readonly map: ReadonlyMap<string, string>;
  /** `true` quando alguém registrou a ação. */
  exists(action: string): boolean;
  /** Roda a ação; `false` quando ela está desligada. */
  run(action: string): boolean;
  /** O nome da função como está no menu, ou `null` quando menu nenhum a tem. */
  labelOf(action: string): string | null;
  /**
   * `true` quando a tabela de ações diz que ela só existe com o painel
   * montado. É o único motivo que o programa SABE; sem ele, não se diz motivo.
   */
  needsPanel(action: string): boolean;
  /** A tecla como se escreve ao lado do item: `Ctrl+K`. */
  pretty(shortcut: string): string;
}

/**
 * A frase do rodapé para a tecla cuja ação não existe.
 *
 * O motivo só entra quando é sabido (regra 21). Dizer "o painel está fechado"
 * de uma ação que não é de painel mandaria a pessoa procurar no menu Janela
 * uma coisa que não está lá.
 */
export function silentKeyNotice(tecla: string, nome: string | null, doPainel: boolean): string {
  // Frase curta: a primeira versão tinha 120 letras e quebrava o rodapé em
  // duas linhas — a foto mostrou, o teste não.
  const quem = nome === null ? 'essa função' : `“${nome}”`;
  return doPainel
    ? `${tecla}: ${quem} está com o painel fechado. Abra pelo menu Janela`
    : `${tecla}: ${quem} não está disponível agora`;
}

/**
 * Julga a tecla. A ação só roda se existir; a que não existe vira aviso, e a
 * que não está na tabela não vira nada.
 */
export function judgeShortcut(shortcut: string, judge: KeyJudge): KeyVerdict {
  const action = judge.map.get(shortcut);
  if (action === undefined) return { kind: 'livre' };
  if (!judge.exists(action)) {
    return {
      kind: 'muda',
      action,
      notice: silentKeyNotice(
        judge.pretty(shortcut), judge.labelOf(action), judge.needsPanel(action),
      ),
    };
  }
  return judge.run(action) ? { kind: 'rodou', action } : { kind: 'cinza', action };
}
