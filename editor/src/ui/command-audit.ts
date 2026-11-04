/**
 * O vigia que parte do **COMANDO** — 21/09/2026, plano
 * `COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`, parte 1.
 *
 * O `action-audit.ts` ao lado parte das **ações registradas** e pergunta se
 * cada uma tem porta. Isso deixa passar uma coisa por baixo, e foi a pesquisa
 * de 18/09 que a achou: **um comando que nunca virou ação não é uma ação**, e
 * por isso a auditoria antiga nunca olha para ele. Ele tem teste verde, o
 * relatório diz "feito", e não há botão nenhum que o construa.
 *
 * É a regra 28 na casca: *"provei o comando" e "entreguei a função" são coisas
 * diferentes.* Este arquivo inverte a régua:
 *
 * > **Todo `Command` do documento é construído pelo programa — ou está na
 * > lista de exceções, com o MOTIVO escrito ao lado.**
 *
 * **O que este vigia prova, exatamente.** Ele prova que o comando é
 * construído por algum arquivo de `editor/src`, e nada além disso. Ele **não**
 * prova que um item de menu o constrói, nem que uma pessoa na tela o acha.
 * Essa outra metade é de outros três medidores, e junto com eles a conta
 * fecha:
 *
 * | Quem | O que prova |
 * |:---|:---|
 * | este vigia | o comando é construído pelo programa que roda |
 * | `hiddenFunctions` (ao lado) | toda ação registrada tem menu, barra ou botão direito |
 * | `ferramentas/provas/codigo-sem-porta.mjs` | todo arquivo de `src` é alcançado pelo `main.ts` |
 * | a mão do Humberto | alguém perdido **acha** a porta. Nenhum teste faz isso |
 *
 * Escrever esse limite é o trabalho da regra 21: um verde que promete mais do
 * que mediu é pior que um vermelho.
 *
 * **Sem `node:fs` e sem tela.** Quem chama lê os arquivos e entrega o texto
 * deles num mapa; aqui só há funções sobre texto e sobre listas. Por isso o
 * vigia se prova com fontes de mentira (é como o teste mostra que ele
 * ACUSA — regra 26), e o mesmo código serve ao teste e ao relatório que o
 * Humberto lê.
 */

// ---------------------------------------------------------------------------
// O que o vigia acha no código
// ---------------------------------------------------------------------------

/** De que feitio é a coisa achada. */
export type CommandKind =
  /** `class X implements Command`, ou herdeira de uma que o faça. */
  | 'classe'
  /** `function x(...): Command` — a fábrica que devolve um comando montado. */
  | 'fabrica'
  /**
   * `export function x(file: BoneFile, …)` que **escreve** no arquivo.
   *
   * Não é um `Command`, e entra aqui de propósito: o quinto achado da pesquisa
   * de 18/09 (`removeBodyKey`) tem esta forma. Uma mexida no `.bone` que
   * ninguém chama é o mesmo buraco com outra roupa — o programa sabe fazer e
   * nunca faz.
   */
  | 'mutador';

/** Uma coisa que edita o documento, e onde ela está escrita. */
export interface CommandDef {
  /** O nome da classe ou da função. */
  name: string;
  /** O caminho relativo a `editor/src`, como `panels/rules-model.ts`. */
  file: string;
  /** A linha onde ela começa, para quem for ler. */
  line: number;
  kind: CommandKind;
  /**
   * `abstract class`: ninguém a constrói, e não é defeito — é o desenho dela.
   *
   * As quatro de hoje (`SnapshotCommand`, `AnimationEdit`, `SlotArrayCommand`,
   * `AddSlotWithAttachment`) existem para as herdeiras, e é a herdeira que
   * precisa de porta. Acusá-las seria pôr quatro linhas eternas na lista de
   * exceções, e uma lista com dívida falsa dentro deixa de se ler.
   */
  abstract?: boolean;
}

/** Um comando que ninguém constrói, escrito para uma pessoa ler. */
export interface CommandWithoutDoor {
  command: string;
  /** `panels/rules-model.ts:487`. */
  where: string;
  kind: CommandKind;
  /** O que fazer. */
  regra: string;
}

// ---------------------------------------------------------------------------
// A lista de exceções — o coração deste arquivo
// ---------------------------------------------------------------------------

/**
 * Os comandos que **não precisam** de porta, e por quê.
 *
 * Uma lista de exceções é uma dívida, e por isso cada linha carrega o motivo.
 * O teste recusa uma linha sem motivo escrito: sem isso a lista cresce até o
 * vigia não provar mais nada, e aí temos o verde que não quer dizer nada.
 *
 * O motivo tem de dizer **por que não tem porta** — *"peça interna do Colar"*,
 * *"resto do formato antigo, a apagar"*, *"porta prevista no degrau tal"*. Um
 * motivo que só repete o nome do comando não é motivo.
 *
 * **Os quatorze de 21/09** são os que a pesquisa de 18/09 achou lendo, e o
 * vigia reachou sozinho — as duas contas bateram. Nenhuma porta foi inventada
 * aqui: das que faltam de verdade, o Humberto é que decide onde entram, e até
 * ele decidir a linha diz isso com todas as letras.
 */
export const EXEMPT_COMMANDS: readonly { command: string; why: string }[] = Object.freeze([
  // -------------------------------------------------------------------------
  // Restos do formato antigo. O programa apaga e renomeia por outro comando.
  // -------------------------------------------------------------------------
  {
    command: 'RemoveBone',
    why: 'resto antigo: quem apaga osso hoje é o `DeleteItems` de `panels/tree-commands.ts`, '
      + 'que leva junto o que fica órfão. Este ficou para trás no lote da Árvore, e é de apagar. '
      + 'A escolha de apagar não é minha: subida ao Planejador em 21/09.',
  },
  {
    command: 'RemoveSlot',
    why: 'resto antigo, o mesmo que `RemoveBone`: o programa apaga slot pelo `DeleteItems`.',
  },
  {
    command: 'RemoveAnimation',
    why: 'resto antigo: a aba Animações apaga pelo `DeleteAnimation` de `panels/animations-model.ts`, '
      + 'que é o que o botão chama.',
  },
  {
    command: 'RenameNode',
    why: 'resto antigo: quem renomeia hoje é o `RenameItem` de `panels/rename.ts`, chamado pela '
      + 'Árvore, por Propriedades e pela aba Animações.',
  },

  // -------------------------------------------------------------------------
  // Apelidos: a classe usada é a mãe, e ela tem porta.
  // -------------------------------------------------------------------------
  {
    command: 'ToggleSkinBone',
    why: 'apelido de `ToggleSkinMember(\'bones\', …)`, que é o usado e tem porta em Propriedades. '
      + 'A subclasse existe pelo nome que o plano da rodada 4 usava.',
  },
  {
    command: 'ToggleSkinConstraint',
    why: 'apelido de `ToggleSkinMember(\'constraints\', …)`, o mesmo que `ToggleSkinBone`.',
  },

  // -------------------------------------------------------------------------
  // Função que falta de verdade, e a porta é decisão do Humberto.
  // Estas seis são o achado da pesquisa de 18/09.
  // -------------------------------------------------------------------------
  // `SetRuleChain` saiu daqui na rodada final, lote 2 (28/09): ganhou o lápis
  // "Trocar os ossos" na linha da regra, na aba Regras (aprovado pelo Planejador).
  // `KeyDriverTarget` saiu daqui na rodada final, lote 3 (29/09): ganhou a
  // chave "Gravar a chave aqui" na linha do parâmetro, na aba Regras.
  // `DeleteTag` e `RenameTag` saíram daqui na rodada final, lote 1 (28/09):
  // ganharam o lápis e a lixeira na linha da etiqueta, na aba Regras.
  // `removeBodyKey` saiu daqui no lote 2a do chat D (29/09): o `Delete`, o duplo
  // clique e o botão direito no losango da virada passam por ele (`removeKeyRef`).
  {
    command: 'ImportImagesCommand',
    why: 'FUNÇÃO SEM PORTA: importar imagens como UM passo de desfazer. Hoje quem importa é o '
      + '`ImportPsd` (do PSD) e o `setImportedAtlas` solto (da pasta), e o solto não é um '
      + 'comando: não há o que desfazer. Porta ainda não decidida, subida ao Planejador em '
      + '21/09 — e é ela que decide se importar imagem entra na pilha de desfazer.',
  },

  // -------------------------------------------------------------------------
  // O irmão errado, e o limite da régua. Achados pelo vigia, não pela pesquisa.
  // -------------------------------------------------------------------------
  {
    command: 'removeTimeline',
    why: 'o plural `removeTimelines` de `anim/keying.ts` é o que a linha do tempo chama, e ele '
      + 'faz o mesmo para uma lista. Este singular é o irmão que ficou sem chamador — resto, '
      + 'não função que falta. Fica na lista porque apagá-lo é mexer em `anim/keying.ts`, que '
      + 'em 21/09 é a cerca de outro chat.',
  },
  {
    command: 'attachmentRows',
    why: 'NÃO ESCREVE NO ARQUIVO: monta linhas da Árvore numa lista própria e a devolve. O '
      + 'vigia a acusa porque acha um `.push` na base e não sabe dizer se o alvo é o `.bone` '
      + 'ou uma lista de passagem — é o limite desta régua, escrito aqui em vez de escondido '
      + 'num ajuste. Ela é código morto em `panels/tree-rows.ts`, que não é cerca minha: '
      + 'avisado ao Planejador em 21/09.',
  },
]);

// ---------------------------------------------------------------------------
// Achar o que edita o documento, lendo o texto do código
// ---------------------------------------------------------------------------

/** O texto de cada arquivo, pela chave relativa: `panels/rules-model.ts`. */
export type Sources = ReadonlyMap<string, string>;

/** Uma classe declarada, com o que ela herda e o que ela diz implementar. */
interface ClassDecl {
  name: string;
  base: string | null;
  impl: readonly string[];
  file: string;
  line: number;
  abstract: boolean;
}

const CLASS_LINE =
  /^\s*(?:export\s+)?(abstract\s+)?class\s+([A-Za-z0-9_]+)(?:\s+extends\s+([A-Za-z0-9_]+))?(?:\s+implements\s+([A-Za-z0-9_,\s]+))?\s*\{?\s*$/;

/**
 * As classes declaradas em cada arquivo.
 *
 * Só a linha da declaração, e é de propósito: uma classe cuja assinatura se
 * espalha por três linhas não é achada, e isso é melhor do que um analisador
 * pela metade que acha errado. Se um dia houver uma, o teste que conta as
 * definições cai — e cair é o certo.
 */
function classDecls(sources: Sources): ClassDecl[] {
  const out: ClassDecl[] = [];
  for (const [file, text] of sources) {
    text.split('\n').forEach((line, i) => {
      const m = CLASS_LINE.exec(line);
      if (m === null) return;
      out.push({
        abstract: m[1] !== undefined,
        name: m[2]!,
        base: m[3] ?? null,
        impl: (m[4] ?? '').split(',').map((s) => s.trim()).filter((s) => s !== ''),
        file,
        line: i + 1,
      });
    });
  }
  return out;
}

/**
 * `true` quando a classe é um `Command`, dela mesma ou por herança.
 *
 * A herança importa: o `ImportImagesCommand` do sexto achado é
 * `extends SnapshotCommand`, e uma régua que só olhasse `implements Command`
 * não o veria. `seen` corta o anel — uma herança circular não compila, mas um
 * medidor que trava por causa dela não diria isso: diria nada.
 */
function isCommand(
  decl: ClassDecl | undefined, byName: ReadonlyMap<string, ClassDecl>, seen = new Set<string>(),
): boolean {
  if (decl === undefined || seen.has(decl.name)) return false;
  seen.add(decl.name);
  if (decl.impl.includes('Command')) return true;
  return decl.base === null ? false : isCommand(byName.get(decl.base), byName, seen);
}

const FACTORY =
  /(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_]+)\s*\(([^)]*)\)\s*:\s*Command(?:\s*\|\s*null)?\s*\{/g;

const MUTATOR = /export\s+function\s+([A-Za-z0-9_]+)\s*\(\s*file:\s*BoneFile/g;

/**
 * Uma escrita no corpo: atribuição num caminho de propriedade, `++`, `--`,
 * `delete`, ou um método de lista que mexe na lista.
 *
 * `=>` e `==` ficam de fora, senão toda comparação e toda função de uma linha
 * contariam como escrita.
 */
const WRITES =
  /(?:[A-Za-z0-9_\])]\s*(?:\??\.[A-Za-z0-9_]+|\[[^\]]*\])\s*(?:\+\+|--|(?:\|\||\?\?|\+|-|\*)?=(?!=|>)))|\.(?:push|pop|shift|unshift|splice|sort|reverse)\s*\(|\bdelete\s+[A-Za-z0-9_]/;

/**
 * O corpo de uma função ou classe: do `{` de abertura até a chave que fecha.
 *
 * Conta chaves, e por isso uma chave dentro de um texto ou de um comentário a
 * desequilibra. Serve porque o resultado só alimenta a busca por escrita, que
 * já é uma pista e não uma prova — e o que ela errar vira linha na lista de
 * exceções, com o motivo. É o que aconteceu com o `attachmentRows`.
 */
function bodyFrom(text: string, at: number): string {
  const open = text.indexOf('{', at);
  if (open < 0) return '';
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) return text.slice(open, i + 1);
    }
  }
  return text.slice(open);
}

/** A linha onde está o caractere `at`. */
function lineAt(text: string, at: number): number {
  let line = 1;
  for (let i = 0; i < at && i < text.length; i++) if (text[i] === '\n') line++;
  return line;
}

/**
 * Tudo o que edita o documento: os comandos, as fábricas e os mutadores.
 *
 * Ordenado por arquivo e linha, para o relatório sair sempre igual — um
 * relatório que muda de ordem sozinho não se compara com o de ontem.
 */
export function commandDefs(sources: Sources): CommandDef[] {
  const decls = classDecls(sources);
  const byName = new Map(decls.map((d) => [d.name, d]));
  const out: CommandDef[] = [];

  for (const decl of decls) {
    if (isCommand(decl, byName)) {
      out.push({
        name: decl.name, file: decl.file, line: decl.line, kind: 'classe',
        ...(decl.abstract ? { abstract: true } : {}),
      });
    }
  }

  for (const [file, text] of sources) {
    for (const m of text.matchAll(FACTORY)) {
      const name = m[1]!;
      if (out.some((d) => d.name === name && d.file === file)) continue;
      out.push({ name, file, line: lineAt(text, m.index), kind: 'fabrica' });
    }
    for (const m of text.matchAll(MUTATOR)) {
      const name = m[1]!;
      if (out.some((d) => d.name === name && d.file === file)) continue;
      if (!WRITES.test(bodyFrom(text, m.index))) continue;
      out.push({ name, file, line: lineAt(text, m.index), kind: 'mutador' });
    }
  }

  return out.sort((a, b) => (a.file === b.file ? a.line - b.line : a.file < b.file ? -1 : 1));
}

// ---------------------------------------------------------------------------
// A régua
// ---------------------------------------------------------------------------

/** Quantas vezes o nome aparece no texto, como palavra inteira. */
function mentions(name: string, text: string): number {
  const re = new RegExp(`(?<![A-Za-z0-9_])${name}(?![A-Za-z0-9_])`, 'g');
  return (text.match(re) ?? []).length;
}

/**
 * **O vigia não conta a si mesmo** — e esta linha é a primeira coisa que ele
 * pegou, contra ele próprio, em 21/09.
 *
 * `EXEMPT_COMMANDS` escreve o nome de cada dispensado. Este arquivo mora em
 * `editor/src`, e por isso a primeira medição deu **zero comandos sem porta**:
 * a tabela de exceções estava servindo de menção, e todo comando da lista
 * passava por "construído pelo programa". Um verde perfeito, e falso.
 *
 * É a forma do erro, e vale para quem for escrever o próximo medidor:
 * **medi a minha própria tabela junto com o código que ela julga.** O nome
 * numa lista de exceções não é uma porta — é a confissão de que não há uma.
 */
const O_PROPRIO_VIGIA = 'ui/command-audit.ts';

/**
 * **Herdar não é construir.**
 *
 * `class HerdeiroMorto extends ComandoMorto` menciona o `ComandoMorto`, e sem
 * esta linha essa menção o faria passar por usado: um comando morto ganharia
 * porta por ter uma herdeira igualmente morta. O buraco apareceu no código de
 * mentira do teste, que é onde ele tinha de aparecer.
 *
 * A base que existe **só** para ser herdada é `abstract`, e essas o vigia não
 * acusa de jeito nenhum — ver `CommandDef.abstract`.
 */
function inheritances(name: string, text: string): number {
  const re = new RegExp(`extends\\s+${name}(?![A-Za-z0-9_])`, 'g');
  return (text.match(re) ?? []).length;
}

/**
 * Os comandos que **ninguém constrói**: o nome não aparece em nenhum outro
 * arquivo de `editor/src`, e no próprio aparece uma vez só — a declaração.
 *
 * *Aparecer uma vez só* é o que separa o comando morto do comando que a
 * própria casa usa: o `CreateBone` não é exportado e só a ferramenta do
 * mesmo arquivo o constrói — ele **tem** porta, e o nome aparece duas vezes
 * ali. Contar as menções é a diferença entre os quatorze de hoje e uma lista
 * de trinta com dezesseis inocentes dentro.
 *
 * **Os testes não contam.** `sources` é `editor/src` e só; se contássemos
 * `editor/testes`, todo comando com teste verde passaria por "usado" — que é
 * exatamente o engano que este vigia existe para desfazer.
 */
export function commandsWithoutDoor(
  sources: Sources,
  defs: readonly CommandDef[] = commandDefs(sources),
  /**
   * A lista de dispensados. É parâmetro, e não só a constante lá de cima, por
   * causa da regra 26: o teste passa uma lista **vazia** e exige que o vigia
   * fique vermelho com os quatorze na cara. Um vigia que ninguém viu acusar
   * não é um vigia.
   */
  exempt: readonly { command: string; why: string }[] = EXEMPT_COMMANDS,
): CommandWithoutDoor[] {
  const dispensados = new Set(exempt.map((item) => item.command));
  const out: CommandWithoutDoor[] = [];

  for (const def of defs) {
    if (def.abstract === true) continue;
    if (dispensados.has(def.name)) continue;
    let fora = 0;
    for (const [file, text] of sources) {
      if (file === def.file || file === O_PROPRIO_VIGIA) continue;
      fora += mentions(def.name, text) - inheritances(def.name, text);
    }
    if (fora > 0) continue;
    const proprio = sources.get(def.file) ?? '';
    if (mentions(def.name, proprio) - inheritances(def.name, proprio) > 1) continue;
    out.push({
      command: def.name,
      where: `${def.file}:${def.line}`,
      kind: def.kind,
      regra: def.kind === 'mutador'
        ? 'mexida no documento que ninguém chama: o programa sabe fazer e nunca faz. '
          + 'Dê uma porta, apague, ou escreva o motivo em EXEMPT_COMMANDS'
        : 'comando sem porta: nenhum arquivo de editor/src o constrói, só o teste. '
          + 'Dê uma porta, apague, ou escreva o motivo em EXEMPT_COMMANDS',
    });
  }
  return out;
}
