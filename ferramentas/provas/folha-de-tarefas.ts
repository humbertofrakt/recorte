/**
 * A folha que o Humberto lê: **o que o programa faz, e por onde se chega.**
 *
 * É a entrega visível da parte 2 do plano
 * `documentos/planos/COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`.
 *
 * ```
 * npm run tarefas                 escreve no ecrã
 * npm run tarefas -- --gravar     escreve também o documento em documentos/
 * ```
 *
 * **Uma régua só.** Este programa e o teste `ferramentas/testes/tarefas.test.ts`
 * chamam o MESMO `folhaDeTarefas` de `ferramentas/provas/tarefas.ts`.
 *
 * Roda por `vite-node`, porque a régua é TypeScript e lê as tabelas do editor
 * por `import` — não há uma segunda cópia delas em `.mjs`, e é bom que não haja.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AS_PROVAS, FORMAS_DA_PROVA, GRUPOS, POR_QUE_A_TECLA_NAO_PROVA,
  folhaDeTarefas, semNomeDeTarefa, tarefasSemPorta,
} from './tarefas.js';
import type { TarefaRow } from './tarefas.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '../..');

/** O texto de cada prova, pelo caminho relativo. Pelo NOME, nunca por pasta. */
function provas(): Map<string, string> {
  const out = new Map<string, string>();
  for (const caminho of AS_PROVAS) {
    out.set(caminho, readFileSync(resolve(RAIZ, caminho), 'utf8'));
  }
  return out;
}

/** A data da máquina, `2026-09-22` — regra 20: nunca o cabeçalho de outro. */
function hoje(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function agora(): string {
  const d = new Date();
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

/**
 * A coluna 3, em uma marca só.
 *
 * `~` é a quase-prova: a prova aperta a tecla, e não se sabe quem atendeu.
 * Pôr `~` no lugar de `sim` é a diferença entre o que a folha sabe e o que ela
 * gostaria de saber.
 */
function marca(linha: TarefaRow): string {
  if (linha.provado) return '**sim**';
  return linha.teclaApertada ? '~' : 'não';
}

/** A coluna 2, com as portas separadas por ` · `. */
function cliqueAqui(linha: TarefaRow): string {
  if (linha.portas.length === 0) return '**sem porta** — só pela Paleta de comandos, se estiver em menu';
  return linha.portas.map((p) => p.texto).join(' · ');
}

function folha(): string {
  const linhas = folhaDeTarefas(provas());
  const semNome = semNomeDeTarefa(linhas);
  const comNome = linhas.filter((l) => l.tarefa !== null);
  const dispensadas = linhas.filter((l) => l.tarefa === null && l.naoEtarefa !== null);
  const provadas = comNome.filter((l) => l.provado);
  const semPorta = tarefasSemPorta(linhas);

  const t: string[] = [];
  t.push(`# O que o programa faz, e por onde se chega — ${hoje()}`);
  t.push('');
  t.push('**Por TAREFA, e não por menu.** A pergunta não é *"o que tem no menu Animação?"*;');
  t.push('é *"como eu faço a arma trocar de mão?"*. Procure a tarefa na primeira coluna.');
  t.push('');
  t.push(`Gerado por \`npm run tarefas\`, às ${agora()}. **Não escrever à mão:** o arquivo é`);
  t.push('lido do código a cada vez, e o que se escrever aqui se perde na próxima medição. A');
  t.push('régua é `ferramentas/provas/tarefas.ts`, a mesma do teste.');
  t.push('');
  t.push('> **Leia isto antes de confiar na folha.** Ela diz que **existe um caminho**. Ela');
  t.push('> **não** diz que o botão faz o que o nome dele diz, **não** enxerga o que só se');
  t.push('> faz com a mão (arrastar, segurar `P`), e **"tem porta" não é "se acha"**. O');
  t.push('> quadro do fim explica cada uma das três.');
  t.push('');
  t.push('## Em números');
  t.push('');
  t.push('| Medida | Número |');
  t.push('|:---|---:|');
  t.push(`| Coisas que o programa sabe fazer (ações) | ${linhas.length} |`);
  t.push(`| Delas, **com nome de tarefa** nesta folha | ${comNome.length} |`);
  t.push(`| Que **não são tarefa**, com o motivo escrito | ${dispensadas.length} |`);
  t.push(`| **Sem nome e sem motivo** (o teste fica vermelho) | ${semNome.length} |`);
  t.push(`| Ações que uma prova **prova**, clicando de verdade | ${linhas.filter((l) => l.provado).length} |`);
  t.push(`| Delas, com nome de tarefa nesta folha | ${provadas.length} |`);
  t.push(`| Ações de que uma prova só **aperta a tecla** (não é prova) | ${linhas.filter((l) => l.teclaApertada && !l.provado).length} |`);
  t.push('');
  t.push('**O número de provadas é pequeno de propósito.** Ele só conta o que uma prova abre o');
  t.push('editor e faz, chamando a ação pelo nome ou clicando numa porta com nome. Uma tarefa');
  t.push('com "não" na coluna Provado **não está quebrada** — está **sem prova**, e é coisa');
  t.push('diferente.');
  t.push('');
  t.push('**E tecla apertada não conta como prova:**');
  t.push('');
  // Em linhas curtas: o Humberto é disléxico, e um parágrafo de quatro frases
  // numa linha só é a coisa que ele não consegue ler.
  for (const frase of POR_QUE_A_TECLA_NAO_PROVA.split('. ')) {
    t.push(`- ${frase.replace(/\.$/, '')}.`);
  }
  t.push('');

  if (semPorta.length > 0) {
    t.push('## Estas têm nome e NÃO têm porta');
    t.push('');
    t.push('O programa sabe fazer, a folha sabe o nome, e não há menu, tecla nem botão.');
    t.push('');
    t.push('| Para fazer isto | A ação |');
    t.push('|:---|:---|');
    for (const l of semPorta) t.push(`| ${l.tarefa} | \`${l.action}\` |`);
    t.push('');
  }

  /*
   * ---- O que a Paleta de comandos NÃO acha --------------------------------
   *
   * A Paleta busca nos MENUS (`filterCommands`, em `ui/palette.ts`), e não em
   * toda ação registrada. Uma tarefa que só tem botão na barra ou no botão
   * direito **não aparece nela** — e a Paleta é justamente o que se abre quando
   * não se sabe onde a coisa está.
   */
  const foraDoMenu = comNome.filter((l) => !l.portas.some((porta) => porta.tipo === 'menu'));
  if (foraDoMenu.length > 0) {
    t.push('## A Paleta de comandos não acha estas');
    t.push('');
    t.push('A Paleta busca **nos menus**. Estas tarefas têm porta — botão na barra, botão');
    t.push('direito, tecla — e **nenhum item de menu**, então digitar o nome delas na Paleta não');
    t.push('as encontra. É onde a Paleta deixa de ajudar exatamente quem está perdido.');
    t.push('');
    t.push('| Para fazer isto | A porta que existe |');
    t.push('|:---|:---|');
    for (const l of foraDoMenu) t.push(`| ${l.tarefa} | ${cliqueAqui(l)} |`);
    t.push('');
  }

  // ---- A folha, grupo por grupo ------------------------------------------
  t.push('## A folha');
  t.push('');
  // A legenda fica AQUI, e não só no fim: quem bate num `~` na linha 80 tem de
  // saber o que ele quer dizer sem descer trezentas linhas.
  t.push('| Na coluna Provado | Quer dizer |');
  t.push('|:---:|:---|');
  t.push('| **sim** | uma prova abre o programa e faz isto, de verdade |');
  t.push('| não | ninguém provou ainda. **Não quer dizer que está quebrado** |');
  t.push('| ~ | a prova aperta a tecla, e não se sabe quem atendeu. Explicado no fim |');
  t.push('');
  const vazios: string[] = [];
  for (const grupo of GRUPOS) {
    const doGrupo = comNome.filter((l) => l.grupo === grupo);
    if (doGrupo.length === 0) { vazios.push(grupo); continue; }
    t.push(`### ${grupo}`);
    t.push('');
    t.push('| Para fazer isto | Clique aqui | Provado |');
    t.push('|:---|:---|:---:|');
    for (const l of doGrupo) {
      t.push(`| ${l.tarefa} | ${cliqueAqui(l)} | ${marca(l)} |`);
    }
    t.push('');
  }

  /*
   * Um assunto sem uma linha na folha é informação, e não um espaço em branco:
   * quer dizer que nada dele tem porta em tabela nenhuma. Anunciar isso é a
   * diferença entre a folha ter um buraco e a folha ESCONDER um buraco.
   */
  if (vazios.length > 0) {
    t.push('### O que não tem uma linha nesta folha');
    t.push('');
    t.push(`Estes assuntos não aparecem acima: **${vazios.join(' · ')}**. Não é esquecimento —`);
    t.push('é que tudo neles se faz por **botão dentro do painel**, e botão de painel não tem');
    t.push('linha em tabela de menu, de tecla nem da barra. A folha não os vê. O');
    t.push('`MANUAL SIMPLES` conta esses, escrito à mão.');
    t.push('');
  }

  // ---- O vermelho, com os nomes na cara ---------------------------------
  if (semNome.length > 0) {
    t.push(`## Falta nomear — ${semNome.length}`);
    t.push('');
    t.push('O programa faz estas coisas e **esta folha ainda não sabe dizer o nome delas na');
    t.push('língua do Humberto**. É o que o teste acusa, e é honesto: uma função sem nome de');
    t.push('tarefa é uma função que ele não tem como querer, porque não sabe como chamá-la.');
    t.push('');
    t.push('| A ação | O nome que o menu dá | Por onde se chega | Provado |');
    t.push('|:---|:---|:---|:---:|');
    for (const l of semNome) {
      t.push(`| \`${l.action}\` | ${l.label === '' ? '—' : l.label} | ${cliqueAqui(l)} | ${marca(l)} |`);
    }
    t.push('');
  }

  /*
   * ---- As dispensadas -----------------------------------------------------
   *
   * Sai a LINHA da folha, e não a lista escrita à mão: catorze delas são
   * dispensadas por uma régua automática ("só abre um submenu"), e imprimir só
   * a lista da mão as fazia **desaparecer da folha inteira, sem uma linha em
   * lugar nenhum**. Nada some sem estar listado.
   */
  if (dispensadas.length > 0) {
    t.push(`## As que NÃO são tarefa, e por quê — ${dispensadas.length}`);
    t.push('');
    t.push('| A ação | O nome no menu | Por que não é tarefa |');
    t.push('|:---|:---|:---|');
    for (const l of dispensadas) {
      t.push(`| \`${l.action}\` | ${l.label === '' ? '—' : l.label} | ${l.naoEtarefa} |`);
    }
    t.push('');
  }

  // ---- O que a folha não diz --------------------------------------------
  t.push('## O que esta folha NÃO diz');
  t.push('');
  t.push('| Não diz | Por quê |');
  t.push('|:---|:---|');
  t.push('| que o botão **faz o que o nome dele diz** | ela lê as tabelas de menu, tecla e barra. Se o item existir e chamar a coisa errada, ela não vê. Só alguém usando vê |');
  t.push('| o que se faz **só com a mão** | arrastar a imagem para a cena, segurar `P` e clicar, arrastar a alça da curva: gesto não tem linha em tabela nenhuma, e por isso não tem linha aqui. O `MANUAL SIMPLES` conta esses; esta folha não |');
  t.push('| que alguém **acha** a porta | *"tem porta" não é "se acha"*. A folha prova que existe caminho; que ele seja encontrável é a mão do Humberto, e nenhum teste a substitui |');
  t.push('| que a tarefa **funciona** | a coluna Provado diz que o roteiro passa por ali. Um "não" é falta de prova, não defeito |');
  t.push('| que a lista de ações está **completa** | ela sai do `ACTION_TABLE`, dos menus, da barra e do botão direito. Comando que nunca virou ação nenhuma não chega aqui — quem conta esses é a folha irmã, `O QUE NAO TEM PORTA` |');
  t.push('');

  // ---- A régua de si mesma ----------------------------------------------
  t.push('## Como a coluna Provado é medida, e o que ela não vê');
  t.push('');
  t.push('A prova é o `roteiro-30.mjs`, que abre o editor de verdade e clica. Esta folha lê o');
  t.push(`**texto dele**, pelo nome do arquivo, e reconhece ${FORMAS_DA_PROVA.length} formas:`);
  t.push('');
  t.push('| A forma | O que é |');
  t.push('|:---|:---|');
  for (const f of FORMAS_DA_PROVA) t.push(`| \`${f.forma}\` | ${f.o_que_e} |`);
  t.push('');
  t.push('**A tecla apertada não está nessa lista, e é de propósito.** Ela sai como `~` na');
  t.push('coluna Provado, e nunca como `sim`, porque:');
  t.push('');
  for (const frase of POR_QUE_A_TECLA_NAO_PROVA.split('. ')) {
    t.push(`- ${frase.replace(/\.$/, '')}.`);
  }
  t.push('');
  t.push('Contava como prova na primeira versão desta régua, e deu **três verdes falsos de');
  t.push('dez**: `novo` (o `runAction` estava dentro de um COMENTÁRIO do roteiro), `desmarcar`');
  t.push('(o `Esc` é comido pela ferramenta na mão) e `virar-filho` (o `P` segurado é o gesto');
  t.push('`pegar-filhos`, não a ação do menu que declara a mesma tecla). A forma do erro:');
  t.push('**tomei "a tecla foi apertada" por "a ação rodou"**.');
  t.push('');
  t.push('O que ela **não** reconhece vira "não" na coluna Provado: um arrasto, um clique por');
  t.push('coordenada, um `__r.soltar(…)`. Então **um "não" pode ser cegueira do medidor**, e não');
  t.push('falta de prova. Está escrito aqui em vez de escondido num número.');
  t.push('');
  t.push('**E a folha não se mede a si mesma.** O que ela lê para a coluna Provado é uma lista');
  t.push('de arquivos com nome (`AS_PROVAS`), nunca a pasta `ferramentas/provas/` — que é onde');
  t.push('ela mora. Varrer a pasta faria o `runAction(…)` escrito nos comentários do próprio');
  t.push('medidor contar como prova. O teste confere que nenhum arquivo do medidor está na');
  t.push('lista das provas. É a armadilha que pegou o vigia da parte 1, com a porta fechada.');
  t.push('');
  return t.join('\n');
}

const texto = folha();
process.stdout.write(`${texto}\n`);

if (process.argv.includes('--gravar')) {
  const caminho = resolve(RAIZ, 'documentos', `O QUE O PROGRAMA FAZ ${hoje()}.md`);
  writeFileSync(caminho, `${texto}\n`, 'utf8');
  process.stdout.write(`\n[gravado] ${caminho}\n`);
}
