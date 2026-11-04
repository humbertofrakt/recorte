/**
 * **A porta que engole o clique** — a terceira régua, 22/09/2026.
 *
 * Desenho em `documentos/planos/A PORTA QUE ENGOLE O CLIQUE 2026-09-22.md`.
 *
 * As duas irmãs deste arquivo perguntam se a função **chega** a alguém:
 *
 * | Régua | Pergunta |
 * |:---|:---|
 * | `action-audit.ts` | toda **ação registrada** tem porta? |
 * | `command-audit.ts` | todo **comando** é construído pelo programa? |
 * | **esta** | a porta **funciona quando se aperta**? |
 *
 * A terceira é a única que a pessoa sentada na frente do programa consegue
 * notar sozinha — e a última que nós descobriríamos, porque um botão que
 * existe, parece vivo e não faz nada passa em toda auditoria de inventário.
 *
 * **O buraco, em uma linha:**
 *
 * > Há caminhos que chamam uma ação, recebem *"não existe"* de volta, e não
 * > fazem nada com essa resposta. O dedo aperta, o programa devolve `false`, e
 * > ninguém olha.
 *
 * `runAction` é honesto: devolve `false` quando ninguém registrou a ação, e
 * `false` quando ela está desligada. O defeito é de quem o chama e **larga a
 * resposta no chão**. É a regra 21 outra vez, e na forma pior: o programa não
 * improvisa, ele **emudece** — e quem clicou não sabe se apertou errado, se o
 * programa travou, ou se aquilo nunca existiu.
 *
 * **O que esta régua NÃO vê, e está escrito para não virar palpite.** O menu da
 * barra chama `runAction` sem olhar o retorno, e está **certo**: o botão dele
 * já nasceu cinza a partir de `actionState`. Ser cinza é propriedade de um
 * **widget**, não da linha que chama, e uma régua de texto não vê widget
 * desligado. Então essa forma vai para `EXEMPT_CALLS`, com o motivo escrito —
 * mais honesto que um `if` que adivinha pelo texto e acerta *quase* sempre.
 * *Quase sempre* é como se certifica um buraco.
 *
 * **Sem `node:fs` e sem tela**, como o `command-audit.ts`: quem chama entrega o
 * texto dos arquivos num mapa. É por isso que esta régua se prova inteira
 * contra código de mentira, sem depender de um único arquivo de verdade.
 */

// ---------------------------------------------------------------------------
// O que ela acha
// ---------------------------------------------------------------------------

/** De que tamanho é o defeito. */
export type CallFault =
  /** Chamou e largou o `false`. O dedo aperta e o programa cala. */
  | 'engole'
  /** Olhou o `false` e não disse nada. Melhor, e ainda mudo. */
  | 'olha-e-cala';

/** Um lugar que chama uma ação, e o que ele faz com a resposta. */
export interface CallSite {
  /** O id da ação, quando ele está escrito ali: `'nova-regra-guiada'`. */
  action: string | null;
  /** `panels/tree.ts`. */
  file: string;
  line: number;
}

/** Um caminho que aperta e cala. */
export interface SwallowedClick extends CallSite {
  fault: CallFault;
  /** O que fazer, escrito para uma pessoa ler. */
  regra: string;
}

// ---------------------------------------------------------------------------
// A lista de exceções
// ---------------------------------------------------------------------------

/**
 * Os lugares que **não precisam** olhar a resposta, e por quê.
 *
 * Como no `EXEMPT_COMMANDS`: cada linha carrega o motivo, e o teste recusa uma
 * linha sem motivo escrito. Uma lista de exceções sem motivo cresce até a
 * régua não provar mais nada.
 *
 * A chave é `arquivo:linha` — e isso **envelhece de propósito**. Uma linha que
 * andou deixa de casar, o lugar volta a ser acusado, e alguém tem de olhar de
 * novo. Uma exceção que sobrevive a qualquer mudança do arquivo é uma exceção
 * que ninguém confere.
 */
export const EXEMPT_CALLS: readonly { where: string; why: string }[] = Object.freeze([
  // A lista nasce vazia de propósito: cada linha entra depois de alguém olhar
  // o lugar e escrever por que ele está certo. Ver `A PORTA QUE ENGOLE O
  // CLIQUE 2026-09-22.md` — o menu da barra (`ui/shell.ts`) é o primeiro
  // candidato, e entra quando a régua rodar contra o código de verdade.
]);

// ---------------------------------------------------------------------------
// A régua
// ---------------------------------------------------------------------------

/** O texto de cada arquivo, pela chave relativa: `panels/tree.ts`. */
export type Sources = ReadonlyMap<string, string>;

/**
 * **O vigia não conta a si mesmo.**
 *
 * Este arquivo escreve `runAction` e `hasAction` dezenas de vezes, em texto que
 * explica a régua. Sem esta linha ele se acusaria — e o arquivo do
 * `command-audit.ts`, que também os cita, viria junto.
 *
 * É a mesma armadilha de 22/09, e a mesma frase: **todo instrumento que se mede
 * junto com o que mede dá um número errado.** Lá ele dava verde; aqui daria
 * vermelho. A forma é a mesma, e é ela que se guarda.
 */
const AS_PROPRIAS_REGUAS: readonly string[] = Object.freeze([
  'ui/call-audit.ts', 'ui/command-audit.ts', 'ui/action-audit.ts',
]);

/** Uma chamada de ação, e o id quando ele está escrito ali mesmo. */
const CHAMADA = /(?<![A-Za-z0-9_.])runAction\s*\(\s*(?:'([^']*)')?/g;

/**
 * **Comentário não é código** — achado ao medir, em 22/09, e é o terceiro erro
 * da mesma família num dia.
 *
 * A primeira medição contra `editor/src` acusou três lugares que não são
 * chamadas: o texto de `ui/actions.ts` que **explica** o registro (*"o menu só
 * pede `runAction('chavear')`"*), o cabeçalho de `ui/keys-dialog.ts` que
 * explica o botão da paleta, e a **própria declaração** de `runAction`.
 *
 * Nenhum deles aperta coisa nenhuma. Uma lista com três inocentes dentro é uma
 * lista que ninguém lê até o fim — e a régua ensinaria a desconfiar dela mesma.
 *
 * A forma, para quem escrever a próxima: **eu li o texto que fala do código
 * como se fosse o código.** Um medidor que varre fonte tem de saber o que é
 * comentário, o que é texto entre aspas e o que é comando — senão ele acusa a
 * documentação de fazer o que ela só descreve.
 *
 * Troca cada comentário por espaços do mesmo tamanho: as posições e os números
 * de linha continuam valendo, e nada mais casa lá dentro. Texto entre aspas e
 * `template` são pulados inteiros, senão uma `'//'` dentro de um endereço
 * comeria o resto do arquivo.
 */
export function stripComments(text: string): string {
  const out = text.split('');
  let i = 0;
  const branco = (de: number, ate: number): void => {
    for (let k = de; k < ate && k < out.length; k++) if (out[k] !== '\n') out[k] = ' ';
  };
  while (i < text.length) {
    const c = text[i];
    const d = text[i + 1];
    if (c === '/' && d === '/') {
      const fim = text.indexOf('\n', i);
      branco(i, fim < 0 ? text.length : fim);
      i = fim < 0 ? text.length : fim;
    } else if (c === '/' && d === '*') {
      const fim = text.indexOf('*/', i + 2);
      const ate = fim < 0 ? text.length : fim + 2;
      branco(i, ate);
      i = ate;
    } else if (c === "'" || c === '"' || c === '`') {
      i++;
      while (i < text.length && text[i] !== c) i += text[i] === '\\' ? 2 : 1;
      i++;
    } else {
      i++;
    }
  }
  return out.join('');
}

/**
 * O programa **fala**: o rodapé, a barra de estado, uma janela, a linha de
 * aviso de um diálogo.
 *
 * Não julga se a frase é boa — isso é a mão do Humberto, e nenhum teste a
 * substitui. Julga se há frase.
 */
const FALA = /\b(?:notice|say|tellUser|askUser|alert)\s*\(|statusState|textContent\s*=|\btitle\s*=/;

/** A linha onde está o caractere `at`. */
function lineAt(text: string, at: number): number {
  let line = 1;
  for (let i = 0; i < at && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

/**
 * O pedaço de código em volta da chamada: da chave que abre o bloco que a
 * contém até uns poucos comandos depois.
 *
 * Contar chaves é grosseiro — uma chave dentro de um texto desequilibra —, e
 * serve porque o resultado só alimenta a busca por guarda e por fala, que já
 * são pistas e não provas. O que ela errar vira linha em `EXEMPT_CALLS`, com o
 * motivo. É o mesmo acordo do `command-audit.ts`.
 */
function around(text: string, at: number, before = 400, after = 400): string {
  return text.slice(Math.max(0, at - before), Math.min(text.length, at + after));
}

/**
 * A chamada está **dentro de uma condição**? `if (!runAction(…))`,
 * `if (runAction(…))`, `const ok = runAction(…)`, `return runAction(…)`.
 *
 * É o que separa quem olhou a resposta de quem a largou no chão.
 */
function resultIsRead(text: string, at: number): boolean {
  const antes = text.slice(Math.max(0, at - 60), at);
  return /(?:if\s*\(\s*!?|while\s*\(\s*!?|return\s+!?|[=:]\s*!?|&&\s*!?|\|\|\s*!?|\?\?\s*)$/.test(antes);
}

/** Alguém perguntou `hasAction` por perto, antes de chamar? */
function askedFirst(vizinhanca: string, action: string | null): boolean {
  if (!/\bhasAction\s*\(/.test(vizinhanca)) return false;
  // Com o id escrito, exige que a pergunta seja sobre ELE: perguntar de um e
  // rodar outro é o engano que uma régua frouxa deixaria passar.
  return action === null || vizinhanca.includes(`hasAction('${action}')`);
}

/**
 * Os caminhos que apertam e calam.
 *
 * Ordenado por arquivo e linha, para a lista sair sempre igual — uma lista que
 * muda de ordem sozinha não se compara com a de ontem.
 */
export function swallowedClicks(
  sources: Sources,
  exempt: readonly { where: string; why: string }[] = EXEMPT_CALLS,
): SwallowedClick[] {
  const dispensados = new Set(exempt.map((item) => item.where));
  const out: SwallowedClick[] = [];

  for (const [file, cru] of sources) {
    if (AS_PROPRIAS_REGUAS.includes(file)) continue;
    // Do texto sem comentário em diante: o que está num comentário FALA do
    // código, não é o código. E a `fala` também se procura aqui, senão um
    // `notice` citado numa explicação absolveria a linha de baixo.
    const text = stripComments(cru);
    for (const m of text.matchAll(CHAMADA)) {
      // A declaração do próprio `runAction`, em `ui/actions.ts`, não é uma
      // chamada: é ela que devolve o `false` que todo mundo devia olhar.
      if (/\bfunction\s+$/.test(text.slice(Math.max(0, m.index - 20), m.index))) continue;

      const line = lineAt(text, m.index);
      const where = `${file}:${line}`;
      if (dispensados.has(where)) continue;

      const action = m[1] ?? null;
      const vizinhanca = around(text, m.index);
      const olhou = resultIsRead(text, m.index) || askedFirst(vizinhanca, action);

      if (olhou && FALA.test(vizinhanca)) continue;

      out.push({
        action,
        file,
        line,
        fault: olhou ? 'olha-e-cala' : 'engole',
        regra: olhou
          ? 'olhou o `false` e não disse nada: melhor que largar, e ainda mudo. '
            + 'Diga o que houve, ou escreva o motivo em EXEMPT_CALLS'
          : 'chamou a ação e largou o `false`: com a ação não registrada, o dedo '
            + 'aperta e o programa cala. Olhe o retorno e diga o que houve, deixe o '
            + 'botão cinza, ou escreva o motivo em EXEMPT_CALLS',
      });
    }
  }

  return out.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));
}
