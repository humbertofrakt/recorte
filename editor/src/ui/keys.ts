/**
 * Toda tecla do programa, numa tabela só — lote A1, plano arrumação (v10.4).
 *
 * O Humberto, 11/09: *"as teclas deveriam estar em um lugar para conferir de
 * forma rápida, e não espalhadas no código"*. Eram 30 ouvintes de teclado em
 * 14 arquivos, e Ctrl+↑ era ao mesmo tempo "Marca anterior" e "Trazer para a
 * frente" sem que ninguém visse, até ler os dois.
 *
 * Aqui está **qual tecla, onde ela vale e o que faz**. A decisão continua onde
 * sempre esteve — a casca, a cena, a linha do tempo, a aba Ordem e a Árvore —,
 * mas a tecla que cada uma atende sai desta tabela. `keyConflicts` é o árbitro:
 * duas linhas com a mesma tecla, no mesmo lugar, fazendo coisas diferentes,
 * sem uma condição que as separe, é um erro, e o teste `teclas` fica vermelho.
 *
 * Módulo puro: não toca no DOM. `isTyping` recebe o alvo do evento e só olha
 * dois campos dele.
 *
 * **Ficam fora, de propósito** (decisão do planejador): as teclas de uma janela
 * que está aberta por cima de tudo — Enter, Esc e setas de `dialog.ts`,
 * `floating-menu.ts`, `image-picker.ts`, `pivot-dialog.ts`, `export-image.ts`,
 * `export-skin.ts`, `export-gltf.ts` e `import-psd.ts`. Elas são da janela, e a
 * janela some com elas. Também ficam na própria ferramenta as teclas que ela
 * trata **enquanto está na mão**: Esc solta o arrasto do Ponto, da Caixa e do
 * Criar osso; na Malha, Delete apaga os vértices escolhidos, L liga e K desliga
 * dois vértices. O P de pegar filhos é a exceção: é gesto do programa, e está
 * aqui.
 */

import { NEUTRAL_MENU_STATE, allMenus, flatEntries, normalizeShortcut, shortcutOfEvent } from './menus.js';
import type { MenuGroupDef, ShortcutRow } from './menus.js';
import { applySwaps, keySwaps, prettyKey } from './key-swaps.js';
import type { LiveBinding } from './key-swaps.js';

// ---------------------------------------------------------------------------
// Os tipos
// ---------------------------------------------------------------------------

/**
 * Onde a tecla vale.
 *
 * | Escopo | Quem atende |
 * |:---|:---|
 * | `toda-parte` | a casca, com o foco em qualquer canto fora de campo de texto |
 * | `cena` | a cena, com o foco nela; o que ela não atende segue para `toda-parte` |
 * | `linha-do-tempo` | a folha da linha do tempo, com o foco nela |
 * | `arvore` | a Árvore, com o foco nela |
 * | `ordem` | a aba Ordem, com o foco nela ou numa linha dela |
 */
export type KeyScope = 'toda-parte' | 'cena' | 'linha-do-tempo' | 'arvore' | 'ordem' | 'animacoes';

/** Uma linha da tabela. */
export interface KeyBinding {
  /** Como `shortcutOfEvent` escreve: `'ctrl+arrowup'`, `'p'`, `' '`. */
  key: string;
  /** Onde a tecla vale. */
  scope: KeyScope;
  /** O id no registro de ações, ou `'local:<nome>'` quando é gesto do painel. */
  action: string;
  /** O que ela faz, em palavras. */
  label: string;
  /** A condição, escrita: `'desenho escolhido'`, `'com o foco na cabeça da pasta'`. */
  when?: string;
  /**
   * A linha dela em Ajuda → Atalhos: o menu (a primeira coluna) e a tecla como
   * se escreve. Ausente = a tecla não aparece lá (e hoje não aparece).
   */
  help?: { menu: string; shortcut: string };
}

// ---------------------------------------------------------------------------
// As teclas dos menus
// ---------------------------------------------------------------------------

/*
 * A tecla de uma entrada não muda com o estado dos menus — só o nome
 * ("Desfazer Mover osso") e o cinza. Por isso a tabela sai do estado neutro
 * (`NEUTRAL_MENU_STATE`), e a casca, que mostra a Ajuda com o nome de agora,
 * passa os menus dela (`keyTable(grupos)`).
 */

/** As teclas escritas ao lado dos itens dos menus. Valem em toda parte. */
export function fromMenus(groups: readonly MenuGroupDef[]): KeyBinding[] {
  const rows: KeyBinding[] = [];
  for (const group of groups) {
    for (const entry of flatEntries(group.entries)) {
      if (entry.shortcut === undefined) continue;
      rows.push({
        key: normalizeShortcut(entry.shortcut),
        scope: 'toda-parte',
        action: entry.action,
        label: entry.label,
        help: { menu: group.label, shortcut: entry.shortcut },
      });
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// As teclas que não são item de menu
// ---------------------------------------------------------------------------

/** Uma letra que escolhe ferramenta: vale em toda parte, e vem antes da tecla do menu. */
function tool(key: string, id: string, label: string): KeyBinding {
  return {
    key, scope: 'toda-parte', action: `local:ferramenta-${id}`, label,
    when: 'a letra da ferramenta vem antes da tecla do menu',
    help: { menu: 'Ferramentas', shortcut: key.toUpperCase() },
  };
}

/**
 * As letras das ferramentas, na ordem da barra (`TOOL_ORDER`).
 *
 * Quem decide é `toolForKey` (`viewport/viewport.ts`), pela letra que a
 * própria ferramenta declara. O teste `teclas` confere que esta lista e as
 * ferramentas registradas dizem a mesma coisa: letra, nome e ordem.
 */
export const TOOL_KEYS: readonly KeyBinding[] = Object.freeze([
  // O Transformar primeiro — item 2.2 do plano de 13/09/2026. A ordem desta
  // lista é a da barra da cena (`TOOL_ORDER`), e o teste `teclas` compara as
  // duas: mudou lá, muda aqui.
  tool('t', 'transform', 'Transformar'),
  tool('q', 'select', 'Selecionar'),
  tool('w', 'translate', 'Mover'),
  tool('e', 'rotate', 'Girar'),
  tool('r', 'scale', 'Escalar'),
  tool('z', 'shear', 'Inclinar'),
  // G1, degrau 7 (17/09/2026): `B` de *bone* cria osso, o Posar vai para `Y`
  // e o `N` fica **livre**. O `Alt` de redesenhar osso e o `Alt` de inclinar
  // continuam onde estavam.
  tool('y', 'pose', 'Posar'),
  tool('b', 'create-bone', 'Criar osso'),
  tool('o', 'point', 'Ponto'),
  tool('x', 'box', 'Caixa'),
  tool('m', 'mesh', 'Malha'),
  tool('g', 'weights', 'Pesos'),
]);

/** As teclas de toda parte que não estão em menu nenhum. */
export const EXTRA_KEYS: readonly KeyBinding[] = Object.freeze([
  {
    // O gesto do lote 31: segurar P e clicar em quem vira filho. A casca e a
    // cena perguntam à ferramenta na mão primeiro; o item do menu só diz a frase.
    key: 'p', scope: 'toda-parte', action: 'local:pegar-filhos',
    label: 'Pegar filhos: segure P e clique', when: 'com Selecionar ou Transformar na mão',
  },
  {
    // Não está no menu — lá o refazer é Ctrl+Y —, mas é o gesto que meio mundo
    // tem no dedo. A casca atende antes do mapa.
    key: 'ctrl+shift+z', scope: 'toda-parte', action: 'refazer', label: 'Refazer',
  },
]);

/** A cena, com o foco nela. O que ela não atende segue para `toda-parte`. */
export const SCENE_KEYS: readonly KeyBinding[] = Object.freeze([
  {
    key: ' ', scope: 'cena', action: 'local:mover-vista', label: 'Mover a vista',
    when: 'segurado, arrastando', help: { menu: 'Cena', shortcut: 'Espaço + arrastar' },
  },
  { key: ' ', scope: 'cena', action: 'tocar', label: 'Tocar / Pausar', when: 'apertado e solto, sem arrastar' },
  // Lote 66: a ordem de desenho do escolhido, como no Spriter. Sem desenho
  // escolhido a tecla segue para toda parte: Ctrl + ↑ e ↓ são as marcas.
  {
    key: 'ctrl+arrowup', scope: 'cena', action: 'subir-ordem',
    label: 'Trazer para a frente (desenho escolhido)', when: 'desenho escolhido',
    help: { menu: 'Cena', shortcut: 'Ctrl+↑' },
  },
  {
    key: 'ctrl+arrowdown', scope: 'cena', action: 'descer-ordem',
    label: 'Mandar para trás (desenho escolhido)', when: 'desenho escolhido',
    help: { menu: 'Cena', shortcut: 'Ctrl+↓' },
  },
  {
    key: 'ctrl+arrowright', scope: 'cena', action: 'frente-de-tudo',
    label: 'Frente de tudo (desenho escolhido)', when: 'desenho escolhido',
    help: { menu: 'Cena', shortcut: 'Ctrl+→' },
  },
  {
    key: 'ctrl+arrowleft', scope: 'cena', action: 'fundo-de-tudo',
    label: 'Fundo de tudo (desenho escolhido)', when: 'desenho escolhido',
    help: { menu: 'Cena', shortcut: 'Ctrl+←' },
  },
  { key: 'ctrl+shift+arrowup', scope: 'cena', action: 'frente-de-tudo', label: 'Frente de tudo', when: 'desenho escolhido' },
  { key: 'ctrl+shift+arrowdown', scope: 'cena', action: 'fundo-de-tudo', label: 'Fundo de tudo', when: 'desenho escolhido' },
  // 7 8 9 0: ver e travar. A cena atende e para, senão a casca viraria de novo.
  // Rodada 41, lote 4: o Raio do pincel, com a ferramenta Pesos na mão (como o
  // Photoshop). Fora dela, [ e ] seguem escolhendo os pais e os filhos.
  // N-4b: Enter ou Esc terminam o Recorte na cena (o C do menu Animação liga).
  // Durante o arrasto, Esc desiste dele.
  { key: 'enter', scope: 'cena', action: 'local:recorte-fim', label: 'Terminar o recorte na cena', when: 'com Recorte na cena ligado' },
  { key: 'escape', scope: 'cena', action: 'local:recorte-fim', label: 'Terminar o recorte na cena', when: 'com Recorte na cena ligado' },
  { key: '[', scope: 'cena', action: 'local:raio-menor', label: 'Raio do pincel menor', when: 'ferramenta Pesos na mão' },
  { key: ']', scope: 'cena', action: 'local:raio-maior', label: 'Raio do pincel maior', when: 'ferramenta Pesos na mão' },
  { key: '7', scope: 'cena', action: 'ver-ossos', label: 'Ossos' },
  { key: '8', scope: 'cena', action: 'travar-ossos', label: 'Travar ossos' },
  { key: '9', scope: 'cena', action: 'ver-desenhos', label: 'Desenhos' },
  { key: '0', scope: 'cena', action: 'travar-desenhos', label: 'Travar desenhos' },
  // As setas andam com o escolhido — item 53 —, só com o foco na cena.
  { key: 'arrowleft', scope: 'cena', action: 'local:andar', label: 'Andar 1 px para a esquerda', when: 'algo escolhido' },
  { key: 'arrowright', scope: 'cena', action: 'local:andar', label: 'Andar 1 px para a direita', when: 'algo escolhido' },
  { key: 'arrowup', scope: 'cena', action: 'local:andar', label: 'Andar 1 px para cima', when: 'algo escolhido' },
  { key: 'arrowdown', scope: 'cena', action: 'local:andar', label: 'Andar 1 px para baixo', when: 'algo escolhido' },
  { key: 'shift+arrowleft', scope: 'cena', action: 'local:andar-10', label: 'Andar 10 px para a esquerda', when: 'algo escolhido' },
  { key: 'shift+arrowright', scope: 'cena', action: 'local:andar-10', label: 'Andar 10 px para a direita', when: 'algo escolhido' },
  { key: 'shift+arrowup', scope: 'cena', action: 'local:andar-10', label: 'Andar 10 px para cima', when: 'algo escolhido' },
  { key: 'shift+arrowdown', scope: 'cena', action: 'local:andar-10', label: 'Andar 10 px para baixo', when: 'algo escolhido' },
]);

/**
 * A folha da linha do tempo, com o foco nela. O Alt não conta aqui, e Shift que
 * a tabela não escreve também não (Shift+M é M).
 */
export const TIMELINE_KEYS: readonly KeyBinding[] = Object.freeze([
  // Ctrl + setas pulam de marca em marca — item 82.
  { key: 'ctrl+arrowup', scope: 'linha-do-tempo', action: 'marca-anterior', label: 'Marca anterior' },
  { key: 'ctrl+arrowdown', scope: 'linha-do-tempo', action: 'marca-seguinte', label: 'Marca seguinte' },
  { key: 'ctrl+c', scope: 'linha-do-tempo', action: 'copiar', label: 'Copiar as chaves escolhidas' },
  // Shift: a POSE inteira — item 85.
  { key: 'ctrl+shift+c', scope: 'linha-do-tempo', action: 'copiar-pose', label: 'Copiar a pose inteira' },
  { key: 'ctrl+v', scope: 'linha-do-tempo', action: 'colar', label: 'Colar as chaves aqui' },
  { key: 'ctrl+shift+v', scope: 'linha-do-tempo', action: 'colar-todas-chaves', label: 'Colar em todas as chaves' },
  { key: 'ctrl+x', scope: 'linha-do-tempo', action: 'recortar-chaves', label: 'Recortar chaves' },
  // Rodada 23: com chave escolhida, o Ctrl+D não desce para a casca duplicar o osso.
  { key: 'ctrl+d', scope: 'linha-do-tempo', action: 'local:duplicar-na-folha', label: 'Duplicar chave: diz como', when: 'chave escolhida' },
  { key: 'ctrl+k', scope: 'linha-do-tempo', action: 'chavear-tudo', label: 'Chavear tudo (protege a pose)' },
  { key: 'delete', scope: 'linha-do-tempo', action: 'local:apagar-chaves', label: 'Apagar as chaves escolhidas' },
  { key: 'backspace', scope: 'linha-do-tempo', action: 'local:apagar-chaves', label: 'Apagar as chaves escolhidas' },
  { key: 'shift+delete', scope: 'linha-do-tempo', action: 'apagar-linhas', label: 'Apagar as linhas' },
  { key: 'shift+backspace', scope: 'linha-do-tempo', action: 'apagar-linhas', label: 'Apagar as linhas' },
  { key: 'arrowleft', scope: 'linha-do-tempo', action: 'quadro-anterior', label: 'Quadro anterior' },
  { key: 'arrowright', scope: 'linha-do-tempo', action: 'quadro-seguinte', label: 'Quadro seguinte' },
  // Shift pula dez quadros — item 93.
  { key: 'shift+arrowleft', scope: 'linha-do-tempo', action: 'local:dez-quadros-antes', label: 'Dez quadros para trás' },
  { key: 'shift+arrowright', scope: 'linha-do-tempo', action: 'local:dez-quadros-depois', label: 'Dez quadros para a frente' },
  { key: 'arrowup', scope: 'linha-do-tempo', action: 'chave-anterior', label: 'Chave anterior' },
  { key: 'arrowdown', scope: 'linha-do-tempo', action: 'chave-seguinte', label: 'Chave seguinte' },
  // Shift: só pelas chaves das LINHAS marcadas na folha — item 25.
  { key: 'shift+arrowup', scope: 'linha-do-tempo', action: 'local:chave-anterior-linhas', label: 'Chave anterior das linhas marcadas' },
  { key: 'shift+arrowdown', scope: 'linha-do-tempo', action: 'local:chave-seguinte-linhas', label: 'Chave seguinte das linhas marcadas' },
  // A marca é da linha do tempo. Com o foco fora dela, M é a ferramenta Malha.
  { key: 'm', scope: 'linha-do-tempo', action: 'nova-marca', label: 'Pôr ou tirar marca aqui' },
  { key: 'home', scope: 'linha-do-tempo', action: 'ir-inicio', label: 'Início' },
  { key: 'end', scope: 'linha-do-tempo', action: 'ir-fim', label: 'Fim' },
]);

/** A aba Ordem, com o foco nela ou numa linha dela. O Alt não conta. */
export const ORDER_KEYS: readonly KeyBinding[] = Object.freeze([
  { key: 'ctrl+arrowup', scope: 'ordem', action: 'subir-ordem', label: 'Trazer para a frente', when: 'desenho escolhido' },
  { key: 'ctrl+arrowdown', scope: 'ordem', action: 'descer-ordem', label: 'Mandar para trás', when: 'desenho escolhido' },
  { key: 'ctrl+arrowright', scope: 'ordem', action: 'frente-de-tudo', label: 'Frente de tudo', when: 'desenho escolhido' },
  { key: 'ctrl+arrowleft', scope: 'ordem', action: 'fundo-de-tudo', label: 'Fundo de tudo', when: 'desenho escolhido' },
  { key: 'ctrl+shift+arrowup', scope: 'ordem', action: 'frente-de-tudo', label: 'Frente de tudo', when: 'desenho escolhido' },
  { key: 'ctrl+shift+arrowdown', scope: 'ordem', action: 'fundo-de-tudo', label: 'Fundo de tudo', when: 'desenho escolhido' },
  // A cabeça de uma pasta anda a pasta inteira, uma casa. Com Shift também.
  { key: 'ctrl+arrowup', scope: 'ordem', action: 'local:pasta-sobe', label: 'A pasta sobe uma casa', when: 'foco na cabeça da pasta' },
  { key: 'ctrl+arrowdown', scope: 'ordem', action: 'local:pasta-desce', label: 'A pasta desce uma casa', when: 'foco na cabeça da pasta' },
  { key: 'ctrl+shift+arrowup', scope: 'ordem', action: 'local:pasta-sobe', label: 'A pasta sobe uma casa', when: 'foco na cabeça da pasta' },
  { key: 'ctrl+shift+arrowdown', scope: 'ordem', action: 'local:pasta-desce', label: 'A pasta desce uma casa', when: 'foco na cabeça da pasta' },
]);

/** A Árvore, com o foco nela — lote 64: o mesmo P da cena. */
export const TREE_KEYS: readonly KeyBinding[] = Object.freeze([
  {
    key: 'p', scope: 'arvore', action: 'local:pegar-filhos',
    label: 'Pegar filhos: segure P e clique na linha', when: 'um osso escolhido',
  },
  // Rodada 43, lote 3 (doc 51): a Árvore anda no teclado, como toda árvore.
  { key: 'arrowup', scope: 'arvore', action: 'local:arvore-sobe', label: 'A linha de cima', when: 'foco na Árvore' },
  { key: 'arrowdown', scope: 'arvore', action: 'local:arvore-desce', label: 'A linha de baixo', when: 'foco na Árvore' },
  { key: 'arrowleft', scope: 'arvore', action: 'local:arvore-dobra', label: 'Dobra o osso, ou vai ao pai', when: 'foco na Árvore' },
  { key: 'arrowright', scope: 'arvore', action: 'local:arvore-abre', label: 'Abre o osso dobrado', when: 'foco na Árvore' },
  // QA da noite (04/11/2026): a linha é um botão, e o Espaço a "apertava" de
  // novo em vez de tocar. Lote 68: o Espaço toca em toda parte.
  { key: ' ', scope: 'arvore', action: 'tocar', label: 'Tocar / Pausar', when: 'foco numa linha da Árvore' },
]);

/** A lista de Animações, com o foco numa linha — QA da noite (04/11/2026). */
export const ANIMATION_LIST_KEYS: readonly KeyBinding[] = Object.freeze([
  { key: ' ', scope: 'animacoes', action: 'tocar', label: 'Tocar / Pausar', when: 'foco numa linha da lista de Animações' },
]);

// ---------------------------------------------------------------------------
// A tabela
// ---------------------------------------------------------------------------

/**
 * A tabela inteira, a partir destes menus.
 *
 * A ordem é a da Ajuda → Atalhos: primeiro os menus, depois as ferramentas,
 * depois a cena; as de painel vêm no fim e não aparecem lá.
 */
export function keyTable(groups: readonly MenuGroupDef[] = allMenus(NEUTRAL_MENU_STATE)): KeyBinding[] {
  return [
    ...fromMenus(groups),
    ...TOOL_KEYS,
    ...SCENE_KEYS,
    ...EXTRA_KEYS,
    ...TIMELINE_KEYS,
    ...ORDER_KEYS,
    ...TREE_KEYS,
    ...ANIMATION_LIST_KEYS,
  ];
}

/** Toda tecla do programa. Uma tecla nova é uma linha aqui, e o teste de conflito julga. */
export const KEY_TABLE: readonly KeyBinding[] = Object.freeze(keyTable());

// ---------------------------------------------------------------------------
// A tabela que vale AGORA — degrau 11, lote 2 (G7)
// ---------------------------------------------------------------------------

/**
 * A tabela com as trocas desta máquina aplicadas (`ui/key-swaps.ts`).
 *
 * `KEY_TABLE` é a de fábrica, e é ela que o teste de conflito julga. Quem
 * ATENDE tecla — a casca, a cena, a linha do tempo, a Ordem, a Árvore — lê
 * esta: trocar uma tecla vale na hora, sem reabrir nada.
 */
export function liveTable(table: readonly KeyBinding[] = KEY_TABLE): LiveBinding[] {
  return applySwaps(table, keySwaps(KEY_TABLE));
}

/**
 * A tecla que vale agora para uma ação de MENU, como se escreve ao lado do
 * item — ou `fallback` (a de fábrica) quando ninguém trocou.
 */
export function liveShortcut(action: string, fallback: string | undefined): string | undefined {
  if (fallback === undefined) return undefined;
  const swaps = keySwaps(KEY_TABLE);
  const nova = swaps[`toda-parte|${action}|${normalizeShortcut(fallback)}`];
  return nova === undefined ? fallback : prettyKey(nova);
}

/**
 * A ferramenta de uma tecla, pela tabela que vale agora. `key` é o nome
 * inteiro (`keyOf(event)`); um Shift que ninguém escreveu não conta, como
 * sempre foi: `Shift+B` ainda é o `B`.
 */
export function toolIdOfKey(key: string): string | null {
  const linhas = liveTable(TOOL_KEYS);
  const achar = (nome: string): string | null => {
    const row = linhas.find((r) => r.key === nome);
    return row === undefined ? null : row.action.replace('local:ferramenta-', '');
  };
  return achar(key) ?? (key.startsWith('shift+') ? achar(key.replace('shift+', '')) : null);
}

/**
 * A tecla TROCADA de uma ferramenta, como se lê (`'F'`, `'Shift+B'`), ou `null`
 * quando ninguém trocou — aí vale a letra que a própria ferramenta declara.
 */
export function swappedToolKey(toolId: string, declared: string): string | null {
  const nova = keySwaps(KEY_TABLE)[`toda-parte|local:ferramenta-${toolId}|${declared.toLowerCase()}`];
  return nova === undefined ? null : prettyKey(nova);
}

// ---------------------------------------------------------------------------
// Perguntas à tabela
// ---------------------------------------------------------------------------

/**
 * As duplas que brigam: mesma tecla, mesmo escopo, ação diferente, e nenhuma
 * condição que as separe (as duas sem `when`, ou com o mesmo `when`).
 */
export function keyConflicts(table: readonly KeyBinding[]): Array<[KeyBinding, KeyBinding]> {
  const out: Array<[KeyBinding, KeyBinding]> = [];
  for (let i = 0; i < table.length; i++) {
    const a = table[i]!;
    for (let j = i + 1; j < table.length; j++) {
      const b = table[j]!;
      if (a.key !== b.key || a.scope !== b.scope || a.action === b.action) continue;
      if ((a.when ?? '') !== (b.when ?? '')) continue;
      out.push([a, b]);
    }
  }
  return out;
}

/**
 * As linhas daquela tecla naquele escopo e, depois, as de `toda-parte` — a
 * ordem em que o programa pergunta. A primeira cuja condição vale, atende.
 */
export function bindingsFor(scope: KeyScope, key: string, table: readonly KeyBinding[] = liveTable()): KeyBinding[] {
  const own = table.filter((row) => row.scope === scope && row.key === key);
  if (scope === 'toda-parte') return own;
  return [...own, ...table.filter((row) => row.scope === 'toda-parte' && row.key === key)];
}

/** O que um `KeyboardEvent` tem e a tabela lê. */
export interface KeyEventLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
}

/**
 * O nome da tecla do evento, como a tabela escreve. `ignoreAlt` apaga o Alt:
 * a linha do tempo e a ordem nunca olharam para ele.
 */
export function keyOf(event: KeyEventLike, ignoreAlt = false): string {
  return shortcutOfEvent(ignoreAlt ? { ...pick(event), altKey: false } : pick(event));
}

function pick(event: KeyEventLike): KeyEventLike {
  return {
    key: event.key, ctrlKey: event.ctrlKey, metaKey: event.metaKey, altKey: event.altKey, shiftKey: event.shiftKey,
  };
}

/**
 * As ações daquela tecla, **só** daquele escopo, na ordem da tabela. Um Shift
 * que a tabela não escreve para aquela tecla não conta: `shift+m` acha `m`.
 */
export function actionsFor(scope: KeyScope, key: string, table: readonly KeyBinding[] = liveTable()): string[] {
  const of = (name: string): string[] => table
    .filter((row) => row.scope === scope && row.key === name)
    .map((row) => row.action);
  const exact = of(key);
  if (exact.length > 0 || !key.includes('shift+')) return exact;
  return of(key.replace('shift+', ''));
}

/**
 * De tecla para ação, em `toda-parte`: o mapa que a casca consulta por último.
 * Gesto de painel (`local:`) fica de fora. A primeira linha da tecla ganha.
 */
export function keyMap(table: readonly KeyBinding[] = liveTable()): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of table) {
    if (row.scope !== 'toda-parte' || row.action.startsWith('local:')) continue;
    if (!map.has(row.key)) map.set(row.key, row.action);
  }
  return map;
}

/**
 * O cheque único de "está digitando num campo": INPUT, TEXTAREA, SELECT ou
 * texto editável. Nesses, a letra é do campo, e não do programa.
 */
export function isTyping(target: unknown): boolean {
  if (target === null || typeof target !== 'object') return false;
  const alvo = target as { tagName?: unknown; isContentEditable?: unknown };
  const tag = typeof alvo.tagName === 'string' ? alvo.tagName.toUpperCase() : '';
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || alvo.isContentEditable === true;
}

/**
 * **As teclas do próprio texto** — J9, rodada 3 (04/10/2026).
 *
 * A forma: *"a tecla do campo virou tecla do programa"*. Com o foco no campo
 * Rotação de Propriedades, `Ctrl+A` escolhia **todos os ossos**: o painel se
 * redesenhava para "Vários itens", o campo sumia, e o número digitado em
 * seguida ia para lugar nenhum — ou para os atalhos 9 e 0. Num campo de texto,
 * selecionar, copiar, colar e recortar são do texto, como em todo programa.
 * As outras teclas com Ctrl (salvar, desfazer, abrir) continuam do programa.
 */
const TEXT_KEYS: ReadonlySet<string> = new Set(['ctrl+a', 'ctrl+c', 'ctrl+v', 'ctrl+x']);

/** `true` quando a tecla é do texto, e o alvo é um campo onde se escreve texto. */
export function textKeepsKey(shortcut: string, target: unknown): boolean {
  if (!TEXT_KEYS.has(shortcut) || !isTyping(target)) return false;
  const alvo = target as { tagName?: unknown; type?: unknown };
  const tag = typeof alvo.tagName === 'string' ? alvo.tagName.toUpperCase() : '';
  if (tag !== 'INPUT') return tag !== 'SELECT';
  const tipo = typeof alvo.type === 'string' ? alvo.type.toLowerCase() : 'text';
  return ['text', 'search', 'number', 'email', 'url', 'tel', 'password', ''].includes(tipo);
}

/** As linhas de Ajuda → Atalhos, na ordem da tabela: menus, ferramentas, cena. */
export function shortcutRows(table: readonly KeyBinding[] = KEY_TABLE): ShortcutRow[] {
  return table
    .filter((row) => row.help !== undefined)
    .map((row) => ({ menu: row.help!.menu, item: row.label, shortcut: row.help!.shortcut }));
}

/** Os gestos da cena que aparecem na Ajuda — lote 68 e lote 66. */
export const SCENE_GESTURE_ROWS: readonly ShortcutRow[] = Object.freeze(shortcutRows(SCENE_KEYS));
