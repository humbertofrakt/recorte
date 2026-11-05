/**
 * O registro de ações (dono A).
 *
 * Um menu não pode chamar o método privado de um painel, e um painel não pode
 * importar o `shell` sem virar um novelo: quem monta cria quem desenha, nunca
 * o contrário. O registro resolve isso pelo meio: cada painel diz "a ação
 * `chavear` sou eu quem faz", e o menu só pede `runAction('chavear')` sem saber
 * de onde a função veio.
 *
 * É o mesmo caminho do botão. Uma ação nunca é uma segunda cópia do que o
 * botão faz — é a MESMA função, chamada de outro lugar. Foi por isso que ela
 * ganhou um nome: dois caminhos para o mesmo lugar se separam com o tempo, um
 * caminho só não tem como.
 *
 * Não há navegador aqui. É um `Map` e três funções, e um teste lê tudo.
 */

import { porqueApagado } from './porque-apagado.js';

/** O que uma ação sabe fazer, e o que ela sabe dizer sobre si mesma. */
export interface ActionDef {
  /** Roda a ação. É a mesma função que o botão chama. */
  run(): void | Promise<void>;
  /** `false` deixa a entrada cinza. Lido toda vez que o menu abre. */
  enabled?(): boolean;
  /** Liga-desliga: `true` desenha a marca ao lado do nome. */
  checked?(): boolean;
  /**
   * **Por que está cinza AGORA**, em uma frase — rodada 6 (05/10/2026), régua
   * 3. A dica do menu é fixa e diz o que o item faz; esta diz o que falta
   * neste instante ("esta entidade não tem imagem de antes"). Lida só quando
   * `enabled` é `false`; `null` = a dica fixa basta.
   */
  why?(): string | null;
}

/** O que o menu precisa saber de uma ação para desenhar a entrada. */
export interface ActionState {
  /** `false` quando ninguém registrou essa ação: a função ainda não existe. */
  exists: boolean;
  enabled: boolean;
  /** `undefined` quando a ação não é um liga-desliga. */
  checked: boolean | undefined;
  /** O motivo do cinza agora, quando a ação sabe dizer. Só com `enabled` falso. */
  why?: string;
}

const actions = new Map<string, ActionDef>();

/**
 * Registra uma ação e devolve a função que a tira do registro.
 *
 * Registrar duas vezes o mesmo `id` substitui: um painel que é desmontado e
 * montado de novo — a faixa de baixo faz isso ao trocar de aba — não pode
 * deixar para trás uma ação que chama um painel morto.
 */
export function registerAction(id: string, action: ActionDef): () => void {
  actions.set(id, action);
  return () => {
    if (actions.get(id) === action) actions.delete(id);
  };
}

/** Tira uma ação do registro. */
export function unregisterAction(id: string): void {
  actions.delete(id);
}

/** `true` quando alguém registrou essa ação. */
export function hasAction(id: string): boolean {
  return actions.has(id);
}

/**
 * Roda a ação uma vez. Devolve `false` quando ela não existe ou está desligada,
 * para quem chamou saber que a tecla continua livre.
 */
export function runAction(id: string): boolean {
  const action = actions.get(id);
  if (action === undefined) return false;
  if (action.enabled?.() === false) return false;
  void action.run();
  return true;
}

/** Como a entrada do menu deve aparecer agora. */
export function actionState(id: string): ActionState {
  const action = actions.get(id);
  if (action === undefined) return { exists: false, enabled: false, checked: undefined };
  const enabled = action.enabled?.() ?? true;
  // Noite de 04/11: sem `why` no registro, o motivo fixo de `porque-apagado`.
  const why = enabled ? null : action.why?.() ?? porqueApagado(id);
  return {
    exists: true,
    enabled,
    checked: action.checked?.(),
    ...(why === null ? {} : { why }),
  };
}

/** Os ids registrados, em ordem alfabética. Para conferência e para teste. */
export function registeredActions(): string[] {
  return [...actions.keys()].sort();
}

/** Esvazia o registro. Só para teste: um teste não herda o do anterior. */
export function clearActions(): void {
  actions.clear();
}
