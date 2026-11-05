/**
 * A régua da folha **por tarefa**: *para fazer isto · clique aqui · provado*.
 *
 * É a parte 2 do plano
 * `documentos/planos/COMO SABER O QUE O PROGRAMA TEM 2026-09-18.md`. A pergunta
 * do Humberto nunca é *"o que tem no menu Animação?"* — é *"como eu faço a arma
 * trocar de mão?"*. Esta é a única régua da folha: o relatório
 * (`ferramentas/provas/folha-de-tarefas.ts`, o `npm run tarefas`) e o teste
 * (`ferramentas/testes/tarefas.test.ts`) chamam **as funções daqui**. Duas
 * contas — uma para o teste e outra para o papel — divergem numa semana, e a
 * folha passa a mentir com cara de gerada.
 *
 * ## As três colunas, e de onde cada uma sai
 *
 * | Coluna | De onde sai |
 * |:---|:---|
 * | **Para fazer isto** | `TAREFAS`, aqui embaixo. **A única escrita à mão**, e é o trabalho de verdade |
 * | **Clique aqui** | `ui/menus.ts`, `ui/keys.ts`, `ui/action-bar-model.ts` e o `CONTEXT_ACTIONS` do `ui/action-audit.ts`. Lidos por `import`, nunca por texto |
 * | **Provado** | o texto do `roteiro-30.mjs`, que abre o editor de verdade e clica |
 *
 * ## A armadilha do medidor, e a linha que a corta
 *
 * O vigia da parte 1 nasceu verde e o verde era falso: a lista de exceções dele
 * **escrevia o nome de cada dispensado**, e o arquivo dela morava dentro da
 * varredura. O instrumento se media junto com o que mede.
 *
 * Esta folha corre o mesmo risco, e pior: a coluna 1 **cita à mão** os nomes que
 * ela julga. Por isso:
 *
 * - O que a coluna 2 lê vem de `import`, e não de varredura de texto. Não há
 *   como este arquivo aparecer numa tabela de menus.
 * - O que a coluna 3 lê é **uma lista de arquivos com nome** (`AS_PROVAS`),
 *   nunca uma pasta. `ferramentas/provas/` é onde este medidor mora: varrê-la
 *   faria o `runAction('salvar')` escrito **neste comentário** contar como
 *   prova.
 * - `O_QUE_O_MEDIDOR_ESCREVE` diz quais arquivos são do medidor, e o teste
 *   confere que nenhum deles está em `AS_PROVAS`. A armadilha não volta por
 *   descuido: volta como vermelho.
 */

import {
  NEUTRAL_MENU_STATE, allMenus, isSeparator, normalizeShortcut,
} from '../../editor/src/ui/menus.js';
import type { MenuGroupDef, MenuItem } from '../../editor/src/ui/menus.js';
import { ACTION_TABLE } from '../../editor/src/ui/actions-table.js';
import { KEY_TABLE } from '../../editor/src/ui/keys.js';
import { CONTEXT_ACTIONS } from '../../editor/src/ui/action-audit.js';
import {
  EDIT_ITEMS, FILE_ITEMS, SEE_LOCK_ITEMS, VIEW_ITEMS,
} from '../../editor/src/ui/action-bar-model.js';
import type { ActionBarItem } from '../../editor/src/ui/action-bar-model.js';

// ---------------------------------------------------------------------------
// A cerca do medidor — a linha que o tira da própria varredura
// ---------------------------------------------------------------------------

/**
 * Os arquivos que ESTE medidor escreve, de `animador/` para baixo.
 *
 * Nenhum deles pode estar em `AS_PROVAS`, e o teste julga. É o
 * `O_PROPRIO_VIGIA` da parte 1, com o motivo dele escrito: o que o medidor lê
 * nunca inclui o que o medidor escreve.
 */
export const O_QUE_O_MEDIDOR_ESCREVE: readonly string[] = Object.freeze([
  'ferramentas/provas/tarefas.ts',
  'ferramentas/provas/folha-de-tarefas.ts',
  'ferramentas/testes/tarefas.test.ts',
  // A folha sai com a data no nome (`… 2026-09-22.md`), e o que importa aqui é
  // que ela mora em `documentos/` — o teste confere que nenhuma prova está lá.
  'documentos/O QUE O PROGRAMA FAZ <data>.md',
]);

/**
 * Os arquivos lidos para a coluna **Provado**, um por um, pelo nome.
 *
 * Uma lista de nomes, e não uma pasta: o `roteiro-30.mjs` é vizinho de porta
 * deste arquivo, e uma varredura de `ferramentas/provas/` leria o medidor.
 */
export const AS_PROVAS: readonly string[] = Object.freeze([
  'ferramentas/provas/roteiro-30.mjs',
]);

// ---------------------------------------------------------------------------
// Os tipos
// ---------------------------------------------------------------------------

/** Um caminho até a tarefa: por onde se chega nela. */
export interface Porta {
  tipo: 'menu' | 'tecla' | 'barra' | 'botão direito';
  /** O caminho por escrito: `'Arquivo → Salvar (Ctrl+S)'`. */
  texto: string;
}

/** Uma linha da folha. */
export interface TarefaRow {
  /** O id no registro de ações: `'salvar'`. */
  action: string;
  /** O nome que o menu dá: `'Salvar'`. Vazio quando não está em menu. */
  label: string;
  /** O grupo da folha, na língua dele: `'Começar, abrir e salvar'`. */
  grupo: string | null;
  /** A tarefa, na língua dele. `null` = ainda não nomeada. */
  tarefa: string | null;
  /** Por que não é tarefa. `null` = é tarefa (ou falta nomear). */
  naoEtarefa: string | null;
  portas: readonly Porta[];
  /** Uma prova chama esta ação, ou clica numa porta dela com nome. */
  provado: boolean;
  /** Uma prova aperta uma tecla que esta ação declara. **Não é prova.** */
  teclaApertada: boolean;
}

/** Uma entrada do dicionário escrito à mão. */
export interface TarefaDef {
  action: string;
  grupo: string;
  tarefa: string;
}

/** Uma ação que **não é tarefa**, com o motivo escrito. */
export interface NaoEtarefaDef {
  action: string;
  why: string;
}

// ---------------------------------------------------------------------------
// A ordem dos grupos — a do `MANUAL SIMPLES`, que é a que ele já lê
// ---------------------------------------------------------------------------

/**
 * Os grupos da folha, na ordem em que ele os procura.
 *
 * É a ordem do índice do `documentos/MANUAL SIMPLES 2026-09-19.md`, de
 * propósito: ele já leu aquele índice, e mudar a ordem entre dois papéis que
 * falam da mesma coisa é fazê-lo procurar duas vezes.
 */
export const GRUPOS: readonly string[] = Object.freeze([
  'Começar, abrir e salvar',
  'As imagens e o pivô',
  'Montar o boneco: ossos e peças',
  'Ordem de desenho',
  'Ver, esconder e travar',
  'A cena: olhar e enquadrar',
  'Corpos, animações e entidades',
  'Animar: chaves e tempo',
  'As marcas e o trecho',
  'Peles: trocar a roupa',
  'Regras, física e variáveis',
  'Malha e pesos',
  'Importar e exportar',
  'Arrumar a tela',
  'Achar as coisas e pedir ajuda',
]);

// ---------------------------------------------------------------------------
// O DICIONÁRIO — a coluna 1, a única escrita à mão
// ---------------------------------------------------------------------------

/**
 * O nome de tarefa de cada ação, na língua do Humberto.
 *
 * **Regra desta lista:** a frase começa pelo que a pessoa QUER, não pelo que o
 * programa faz. *"Trocar a arma de mão"*, e não *"Definir slot do osso"*. O
 * `documentos/MANUAL SIMPLES 2026-09-19.md` é o dicionário de partida: ele já
 * traduziu muita coisa, e onde ele já tem a frase, é essa que entra aqui.
 *
 * O que não estiver aqui nem em `NAO_E_TAREFA` sai na folha como **falta
 * nomear**, e o teste fica vermelho. É de propósito: uma ação sem nome de
 * tarefa é uma função que o Humberto não tem como querer, porque não sabe
 * dizer o nome dela.
 */
export const TAREFAS: readonly TarefaDef[] = Object.freeze([
  // ---- Comecar, abrir e salvar -----------------------------------------
  { action: 'novo', grupo: 'Começar, abrir e salvar', tarefa: 'Começar um boneco do zero' },
  { action: 'abrir', grupo: 'Começar, abrir e salvar', tarefa: 'Abrir um boneco que já existe (.bone, .boneb, .bonez)' },
  { action: 'abrir-pasta', grupo: 'Começar, abrir e salvar', tarefa: 'Começar pelas imagens: abrir a pasta de trabalho. Nada entra na cena sozinho' },
  { action: 'abrir-recente', grupo: 'Começar, abrir e salvar', tarefa: 'Voltar a um dos últimos arquivos abertos' },
  { action: 'reabrir', grupo: 'Começar, abrir e salvar', tarefa: 'Recuperar o que fechei sem salvar' },
  { action: 'abrir-exemplo', grupo: 'Começar, abrir e salvar', tarefa: 'Ver um boneco pronto, para entender o programa' },
  { action: 'salvar', grupo: 'Começar, abrir e salvar', tarefa: 'Salvar o trabalho' },
  { action: 'salvar-como', grupo: 'Começar, abrir e salvar', tarefa: 'Salvar noutro lugar, ou com outro nome' },
  { action: 'salvar-binario', grupo: 'Começar, abrir e salvar', tarefa: 'Salvar num arquivo menor, que o jogo lê mais rápido' },
  { action: 'salvar-pacote', grupo: 'Começar, abrir e salvar', tarefa: 'Salvar tudo — imagens e mais — num arquivo só, para mandar a alguém' },
  { action: 'configuracoes', grupo: 'Começar, abrir e salvar', tarefa: 'Mudar os quadros por segundo, a cor de fundo e a grade deste projeto' },
  { action: 'preferencias', grupo: 'Começar, abrir e salvar', tarefa: 'Mudar o jeito do programa: o que ele faz sozinho e como ele avisa' },
  { action: 'desfazer', grupo: 'Começar, abrir e salvar', tarefa: 'Voltar um passo' },
  { action: 'refazer', grupo: 'Começar, abrir e salvar', tarefa: 'Refazer o passo que desfiz' },
  { action: 'sair', grupo: 'Começar, abrir e salvar', tarefa: 'Fechar o programa' },
  // ---- As imagens e o pivo ---------------------------------------------
  { action: 'novo-imagem', grupo: 'As imagens e o pivô', tarefa: 'Pôr uma imagem na cena escolhendo na lista, em vez de arrastar' },
  { action: 'opcoes-do-desenho', grupo: 'As imagens e o pivô', tarefa: 'Trocar a imagem de um desenho por outra' },
  { action: 'trocar-imagem-todas-peles', grupo: 'As imagens e o pivô', tarefa: 'Trocar a imagem de um desenho em TODAS as peles de uma vez' },
  { action: 'definir-pivo', grupo: 'As imagens e o pivô', tarefa: 'Dizer onde o osso segura a imagem do desenho escolhido: o pivô' },
  { action: 'carimbar-pivos', grupo: 'As imagens e o pivô', tarefa: 'Gravar o pivô de todas as imagens de uma vez, tirado do boneco montado' },
{ action: 'voltar-pivo-osso', grupo: 'As imagens e o pivô', tarefa: 'Devolver ao osso o pivô que eu acertei à mão, sem mover o desenho' },
  { action: 'recarregar-pasta', grupo: 'As imagens e o pivô', tarefa: 'Trazer de novo a imagem que eu mudei no Photoshop' },
  { action: 'trocar-pasta-origem', grupo: 'As imagens e o pivô', tarefa: 'Vestir o boneco inteiro com as imagens de outra pasta, de mesmo nome' },
  // ---- Montar o boneco -------------------------------------------------
  { action: 'novo-osso', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar um osso' },
  { action: 'novo-ponto', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar um ponto — a marca de onde sai o tiro, ou onde a mão segura' },
  { action: 'novo-ponto-no-slot', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar um ponto preso a um desenho, e não ao osso' },
  { action: 'novo-caixa', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar uma caixa de colisão — a área que o jogo mede' },
  { action: 'novo-caixa-no-slot', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar uma caixa de colisão presa a um desenho' },
  { action: 'novo-mascara', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar uma máscara: o desenho só aparece dentro dela' },
  { action: 'novo-evento', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar um evento: o aviso que a animação manda ao jogo (o som do passo)' },
  { action: 'novo-parametro', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar um parâmetro: o número que o jogo manda de fora para mexer no boneco' },
  { action: 'novo-emissor', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Criar um emissor de partículas — fumaça, faísca, poeira' },
  { action: 'virar-filho', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Prender um osso a outro, para andar junto com ele' },
  { action: 'renomear', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Trocar o nome de uma coisa' },
  { action: 'substituir-nomes', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Trocar um pedaço do nome em várias coisas de uma vez, com prévia antes' },
  { action: 'duplicar', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Fazer uma cópia do que está escolhido, com os filhos e os desenhos' },
  { action: 'apagar', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Apagar o que está escolhido' },
  { action: 'buscar', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Achar um osso ou um desenho pelo nome, na Árvore' },
  { action: 'selecionar-tudo', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Escolher todos os ossos e desenhos de uma vez' },
  { action: 'desmarcar', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Deixar de escolher: nada fica marcado' },
  { action: 'inverter-selecao', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Escolher justamente o que NÃO estava escolhido' },
  { action: 'escolher-filhos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Escolher os ossos que vêm depois deste — o braço inteiro' },
  { action: 'escolher-pais', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Escolher os ossos que vêm antes deste, até a raiz' },
  { action: 'copiar-ancora', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Copiar onde o desenho fica em cima do osso, para repetir noutro' },
  { action: 'colar-ancora', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Colar em outros desenhos o lugar copiado' },
  { action: 'limpar-slots-vazios', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Limpar os desenhos que ficaram sem imagem nenhuma' },
{ action: 'chaves-guardadas', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Ver as chaves das peças que tirei da base, e jogá-las fora' },
  { action: 'repouso-osso', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Devolver este osso à pose de montagem' },
  { action: 'repouso-todos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Devolver o boneco inteiro à pose de montagem' },
  { action: 'compensar-filhos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Mexer num osso sem arrastar os filhos dele' },
  { action: 'compensar-desenhos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Mexer num osso sem arrastar os desenhos dele' },
  { action: 'compensar-caixas', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Mexer num osso sem arrastar as caixas de colisão dele' },
  { action: 'eixos-local', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Pôr as alças no eixo do próprio osso' },
  { action: 'eixos-pai', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Pôr as alças no eixo do osso pai' },
  { action: 'eixos-mundo', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Pôr as alças sempre de pé, como a tela' },
  // ---- Ordem de desenho ------------------------------------------------
  { action: 'subir-ordem', grupo: 'Ordem de desenho', tarefa: 'Trazer um desenho um passo para a frente dos outros' },
  { action: 'descer-ordem', grupo: 'Ordem de desenho', tarefa: 'Mandar um desenho um passo para trás dos outros' },
  { action: 'frente-de-tudo', grupo: 'Ordem de desenho', tarefa: 'Pôr um desenho na frente de todos' },
  { action: 'fundo-de-tudo', grupo: 'Ordem de desenho', tarefa: 'Pôr um desenho atrás de todos' },
  { action: 'nova-pasta', grupo: 'Ordem de desenho', tarefa: 'Juntar vários desenhos numa pasta, para andarem juntos na ordem' },
  { action: 'tirar-da-pasta', grupo: 'Ordem de desenho', tarefa: 'Tirar um desenho da pasta em que ele está' },
  { action: 'copiar-ordem-animacao', grupo: 'Ordem de desenho', tarefa: 'Fazer a ordem de agora valer na animação inteira' },
  // ---- Ver, esconder e travar ------------------------------------------
  { action: 'ver-ossos', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder os ossos' },
  { action: 'ver-desenhos', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder os desenhos' },
  { action: 'ver-nomes', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar o nome de cada osso na cena' },
  { action: 'ver-pontos', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder os pontos' },
  { action: 'ver-caixas', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder as caixas de colisão' },
  { action: 'ver-mascaras', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder as máscaras' },
  { action: 'ver-malhas', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder as malhas' },
  { action: 'ver-arestas', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar os fios que ligam os pontos da malha' },
  { action: 'ver-pesos', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar quanto cada osso puxa cada ponto da malha, em cores' },
  { action: 'ver-grade', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder a grade do fundo' },
  { action: 'ver-reguas', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder as réguas da borda' },
  { action: 'ver-eixos', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder o cruzamento dos eixos' },
  { action: 'ver-guias', grupo: 'Ver, esconder e travar', tarefa: 'Mostrar ou esconder as guias' },
  { action: 'travar-guias', grupo: 'Ver, esconder e travar', tarefa: 'Travar as guias, para não arrastá-las por engano' },
  { action: 'limpar-guias', grupo: 'Ver, esconder e travar', tarefa: 'Apagar todas as guias' },
  { action: 'ver-cebola', grupo: 'Ver, esconder e travar', tarefa: 'Ver os quadros vizinhos por trás, como papel de cebola' },
  { action: 'cebola-opcoes', grupo: 'Ver, esconder e travar', tarefa: 'Escolher quantos quadros vizinhos aparecem, e em que cor' },
  { action: 'ver-nome-no-cursor', grupo: 'Ver, esconder e travar', tarefa: 'Ver o nome da peça só ao passar o mouse por cima' },
  { action: 'esconder-escolhido', grupo: 'Ver, esconder e travar', tarefa: 'Esconder o que está escolhido' },
  { action: 'so-este', grupo: 'Ver, esconder e travar', tarefa: 'Ver só este, e esconder todo o resto' },
  { action: 'mostrar-tudo', grupo: 'Ver, esconder e travar', tarefa: 'Trazer de volta tudo o que estava escondido' },
  { action: 'ver-resultado', grupo: 'Ver, esconder e travar', tarefa: 'Ver a cena limpa, como no jogo: sem osso, sem alça, sem caixa' },
  { action: 'travar-ossos', grupo: 'Ver, esconder e travar', tarefa: 'Travar os ossos, para o clique passar por eles' },
  { action: 'travar-desenhos', grupo: 'Ver, esconder e travar', tarefa: 'Travar os desenhos, para o clique passar por eles' },
  { action: 'travar-escolhido', grupo: 'Ver, esconder e travar', tarefa: 'Travar o que está escolhido' },
  { action: 'travar-resto', grupo: 'Ver, esconder e travar', tarefa: 'Travar tudo MENOS o que está escolhido' },
  { action: 'destravar-tudo', grupo: 'Ver, esconder e travar', tarefa: 'Destravar tudo o que estava travado' },
  { action: 'tema-claro', grupo: 'Ver, esconder e travar', tarefa: 'Deixar o programa claro' },
  { action: 'tema-escuro', grupo: 'Ver, esconder e travar', tarefa: 'Deixar o programa escuro' },
  // ---- A cena ----------------------------------------------------------
  { action: 'aproximar', grupo: 'A cena: olhar e enquadrar', tarefa: 'Chegar mais perto' },
  { action: 'afastar', grupo: 'A cena: olhar e enquadrar', tarefa: 'Afastar-se, para ver mais em volta' },
  { action: 'ajustar', grupo: 'A cena: olhar e enquadrar', tarefa: 'Ver o boneco inteiro, cabendo na tela' },
  { action: 'tamanho-real', grupo: 'A cena: olhar e enquadrar', tarefa: 'Ver no tamanho de verdade, sem aumento' },
  { action: 'enquadrar', grupo: 'A cena: olhar e enquadrar', tarefa: 'Ir até o que está escolhido' },
  { action: 'imagem-referencia', grupo: 'A cena: olhar e enquadrar', tarefa: 'Pôr um desenho de papel atrás da cena, para copiar por cima' },
  { action: 'ferramenta-de-antes', grupo: 'A cena: olhar e enquadrar', tarefa: 'Voltar à ferramenta que eu estava usando antes' },
  // ---- Corpos e animacoes ----------------------------------------------
  { action: 'abrir-a-base', grupo: 'Corpos, animações e entidades', tarefa: 'Voltar à montagem: mexer aqui vale em TODAS as animações' },
  // Rodada 8a (04/10/2026): decisão 6 da conexão.
  { action: 'tirar-entidade', grupo: 'Corpos, animações e entidades', tarefa: 'Tirar a entidade do lugar e ter de volta a imagem que estava ali antes' },
  { action: 'nova-animacao', grupo: 'Corpos, animações e entidades', tarefa: 'Começar uma animação nova' },
  { action: 'duplicar-animacao', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer uma cópia de uma animação, para mudar a partir dela' },
  { action: 'renomear-animacao', grupo: 'Corpos, animações e entidades', tarefa: 'Trocar o nome de uma animação' },
  { action: 'apagar-animacao', grupo: 'Corpos, animações e entidades', tarefa: 'Apagar uma animação' },
  { action: 'mandar-para-o-topo', grupo: 'Corpos, animações e entidades', tarefa: 'Escolher qual animação o jogo toca primeiro' },
  { action: 'biblioteca-animacoes', grupo: 'Corpos, animações e entidades', tarefa: 'Pegar animações prontas — parado, andar, correr, pular' },
  { action: 'exportar-animacao', grupo: 'Corpos, animações e entidades', tarefa: 'Levar uma animação deste boneco para outro boneco' },
  { action: 'importar-animacao', grupo: 'Corpos, animações e entidades', tarefa: 'Trazer para este boneco uma animação feita noutro' },
  { action: 'colar-corpo', grupo: 'Corpos, animações e entidades', tarefa: 'Trocar o boneco inteiro no meio da animação — o homem vira lobisomem' },
  { action: 'abrir-corpo', grupo: 'Corpos, animações e entidades', tarefa: 'Trazer outro boneco para dentro deste projeto' },
  { action: 'abrir-entidade', grupo: 'Corpos, animações e entidades', tarefa: 'Trazer um boneco de fora para pendurar neste — a espada, o fogo' },
  { action: 'entregar-corpo', grupo: 'Corpos, animações e entidades', tarefa: 'Entregar um boneco ao jogo, só com as imagens que ele usa' },
  { action: 'salvar-entidade', grupo: 'Corpos, animações e entidades', tarefa: 'Salvar a entidade que eu editei: por cima, ou como nova' },
  // ---- Animar ----------------------------------------------------------
  { action: 'tocar', grupo: 'Animar: chaves e tempo', tarefa: 'Tocar a animação, ou parar' },
  { action: 'tocar-tras', grupo: 'Animar: chaves e tempo', tarefa: 'Tocar a animação de trás para a frente' },
  { action: 'meio-termo', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr uma chave no meio do caminho entre a de antes e a de depois' },
  { action: 'meio-termo-anterior', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr uma chave entre duas, mais perto da de antes' },
  { action: 'meio-termo-seguinte', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr uma chave entre duas, mais perto da de depois' },
  { action: 'ir-inicio', grupo: 'Animar: chaves e tempo', tarefa: 'Ir para o começo da animação' },
  { action: 'ir-fim', grupo: 'Animar: chaves e tempo', tarefa: 'Ir para o fim da animação' },
  { action: 'quadro-anterior', grupo: 'Animar: chaves e tempo', tarefa: 'Andar um quadro para trás' },
  { action: 'quadro-seguinte', grupo: 'Animar: chaves e tempo', tarefa: 'Andar um quadro para a frente' },
  { action: 'chave-anterior', grupo: 'Animar: chaves e tempo', tarefa: 'Pular para a chave de antes' },
  { action: 'chave-seguinte', grupo: 'Animar: chaves e tempo', tarefa: 'Pular para a chave seguinte' },
  { action: 'chave-anterior-escolhido', grupo: 'Animar: chaves e tempo', tarefa: 'Pular para a chave de antes só do que está escolhido' },
  { action: 'chave-seguinte-escolhido', grupo: 'Animar: chaves e tempo', tarefa: 'Pular para a chave seguinte só do que está escolhido' },
  { action: 'repetir', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer a animação repetir em laço, sem parar' },
  // O "No fim ▸" do tocador (29/09, casca e chat D). Os quatro últimos são de
  // SESSÃO: jeitos de olhar, que não vão para o arquivo.
  { action: 'fim-arquivo', grupo: 'Animar: chaves e tempo', tarefa: 'Tocar como o jogo vai tocar: o fim obedece ao Repetir da animação' },
  { action: 'fim-parar', grupo: 'Animar: chaves e tempo', tarefa: 'Olhar a animação uma vez só: o tocador para no fim' },
  { action: 'fim-repetir', grupo: 'Animar: chaves e tempo', tarefa: 'Olhar a animação em laço, mesmo sem Repetir no arquivo' },
  { action: 'fim-vai-e-volta', grupo: 'Animar: chaves e tempo', tarefa: 'Olhar a animação indo e voltando, de trás para a frente no fim' },
  { action: 'fim-voltar', grupo: 'Animar: chaves e tempo', tarefa: 'Olhar a animação uma vez e voltar ao começo' },
  { action: 'mudar-duracao', grupo: 'Animar: chaves e tempo', tarefa: 'Mudar quanto a animação dura, esticando as chaves junto' },
  { action: 'chavear', grupo: 'Animar: chaves e tempo', tarefa: 'Gravar a pose de agora sem mexer em nada — só do escolhido' },
  { action: 'chavear-tudo', grupo: 'Animar: chaves e tempo', tarefa: 'Gravar a pose de agora sem mexer em nada — do boneco inteiro' },
  { action: 'apagar-chave', grupo: 'Animar: chaves e tempo', tarefa: 'Apagar as chaves escolhidas' },
  { action: 'apagar-linhas', grupo: 'Animar: chaves e tempo', tarefa: 'Apagar a linha inteira da linha do tempo, com todas as chaves dela' },
  { action: 'limpar-animacao', grupo: 'Animar: chaves e tempo', tarefa: 'Esvaziar a animação: tirar todas as chaves dela' },
  { action: 'copiar', grupo: 'Animar: chaves e tempo', tarefa: 'Copiar as chaves escolhidas' },
  { action: 'colar', grupo: 'Animar: chaves e tempo', tarefa: 'Colar as chaves copiadas neste tempo' },
  { action: 'recortar-chaves', grupo: 'Animar: chaves e tempo', tarefa: 'Tirar as chaves escolhidas e guardá-las para colar noutro lugar' },
  { action: 'copiar-pose', grupo: 'Animar: chaves e tempo', tarefa: 'Copiar a pose inteira do boneco' },
  { action: 'copiar-pose-escolhido', grupo: 'Animar: chaves e tempo', tarefa: 'Copiar a pose só do que está escolhido' },
  { action: 'colar-todas-chaves', grupo: 'Animar: chaves e tempo', tarefa: 'Colar isto em todas as chaves da animação de uma vez' },
  { action: 'colar-espelhado', grupo: 'Animar: chaves e tempo', tarefa: 'Colar do outro lado: o braço esquerdo vira o direito' },
  { action: 'selecionar-chaves', grupo: 'Animar: chaves e tempo', tarefa: 'Escolher todas as chaves da animação' },
  { action: 'esticar-selecao', grupo: 'Animar: chaves e tempo', tarefa: 'Esticar ou encolher no tempo as chaves escolhidas' },
  { action: 'espelhar-tempo', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr as chaves na ordem de trás para a frente' },
  { action: 'fechar-ciclo', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer o fim ficar igual ao começo, para o laço não dar salto' },
  { action: 'espelhar-lados', grupo: 'Animar: chaves e tempo', tarefa: 'Trocar esquerda e direita na animação inteira' },
  { action: 'empurrar-chaves', grupo: 'Animar: chaves e tempo', tarefa: 'Abrir espaço no meio da animação, empurrando as chaves para a frente' },
  { action: 'limpar-chaves-repetidas', grupo: 'Animar: chaves e tempo', tarefa: 'Tirar as chaves que não mudam nada' },
  { action: 'interp-linear', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer a passagem de uma pose à outra ser reta, na mesma velocidade' },
  { action: 'interp-suave', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer a passagem de uma pose à outra sair devagar e chegar devagar' },
  { action: 'deslocar-em-laco', grupo: 'Animar: chaves e tempo', tarefa: 'Defasar um membro num ciclo pronto: as chaves andam e o que passa do fim volta no começo' },
  { action: 'interp-entrada-suave', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer a passagem começar devagar e terminar rápido' },
  { action: 'interp-saida-suave', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer a passagem começar rápido e terminar devagar' },
  { action: 'interp-parada', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer a pose pular de uma para a outra, sem passagem nenhuma' },
  { action: 'interp-curva', grupo: 'Animar: chaves e tempo', tarefa: 'Desenhar eu mesmo a curva da passagem, arrastando as alças' },
  { action: 'efeito-flash', grupo: 'Animar: chaves e tempo', tarefa: 'Dar um clarão no boneco — o golpe que acerta' },
  { action: 'efeito-pulso', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer o boneco pulsar, crescendo e voltando' },
  { action: 'efeito-tremor', grupo: 'Animar: chaves e tempo', tarefa: 'Fazer o boneco tremer' },
  // Chat B, lote 1 (P5, P37): os modelos prontos de partícula.
  { action: 'particulas-fogo', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr fogo saindo de um osso, já pronto para ver' },
  { action: 'particulas-fumaca', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr fumaça saindo de um osso, já pronta para ver' },
  { action: 'particulas-faisca', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr um estouro de faíscas num osso — o golpe que bate' },
  { action: 'particulas-poeira', grupo: 'Animar: chaves e tempo', tarefa: 'Pôr poeira levantando do pé' },
  // ---- As marcas e o trecho --------------------------------------------
  { action: 'nova-marca', grupo: 'As marcas e o trecho', tarefa: 'Pôr uma marca neste tempo, para achá-lo depois' },
  { action: 'marca-anterior', grupo: 'As marcas e o trecho', tarefa: 'Pular para a marca de antes' },
  { action: 'marca-seguinte', grupo: 'As marcas e o trecho', tarefa: 'Pular para a marca seguinte' },
  { action: 'laco-inicio', grupo: 'As marcas e o trecho', tarefa: 'Dizer onde começa o trecho que eu quero tocar em laço' },
  { action: 'laco-fim', grupo: 'As marcas e o trecho', tarefa: 'Dizer onde acaba o trecho que eu quero tocar em laço' },
  { action: 'tirar-trecho', grupo: 'As marcas e o trecho', tarefa: 'Voltar a tocar a animação inteira, e não só o trecho' },
  // ---- Peles -----------------------------------------------------------
  { action: 'nova-pele', grupo: 'Peles: trocar a roupa', tarefa: 'Criar uma roupa nova para o boneco' },
  { action: 'exportar-pele-arquivo', grupo: 'Peles: trocar a roupa', tarefa: 'Levar uma roupa deste boneco para outro boneco' },
  { action: 'importar-pele', grupo: 'Peles: trocar a roupa', tarefa: 'Trazer para este boneco uma roupa feita noutro' },
  { action: 'promover-pele-base', grupo: 'Peles: trocar a roupa', tarefa: 'Fazer da roupa ligada um boneco novo, por si' },
  { action: 'esconder-na-pele', grupo: 'Peles: trocar a roupa', tarefa: 'Fazer uma peça sumir quando esta roupa está vestida' },
  { action: 'ignorar-na-pele', grupo: 'Peles: trocar a roupa', tarefa: 'Fazer esta roupa deixar uma peça em paz: volta a peça de baixo' },
  // ---- Regras ----------------------------------------------------------
  { action: 'nova-regra-guiada', grupo: 'Regras, física e variáveis', tarefa: 'Fazer o boneco se mexer sozinho: dobrar o braço para alcançar, copiar de outro osso, deslizar num caminho, balançar' },
  { action: 'fisica-simular', grupo: 'Regras, física e variáveis', tarefa: 'Ver na tela o osso balançando sozinho, ou parar de ver' },
  { action: 'fisica-reiniciar', grupo: 'Regras, física e variáveis', tarefa: 'Zerar o balanço deste osso' },
  { action: 'fisica-reiniciar-todas', grupo: 'Regras, física e variáveis', tarefa: 'Zerar o balanço de todos os ossos' },
  { action: 'fisica-assar', grupo: 'Regras, física e variáveis', tarefa: 'Virar o balanço em chaves de verdade, para não depender da conta' },
  { action: 'nova-variavel', grupo: 'Regras, física e variáveis', tarefa: 'Criar um número que o jogo lê — a vida, a munição' },
  { action: 'apagar-variavel', grupo: 'Regras, física e variáveis', tarefa: 'Apagar uma variável' },
  { action: 'nova-etiqueta', grupo: 'Regras, física e variáveis', tarefa: 'Pôr uma etiqueta na animação, para o jogo saber o que ela é' },
  { action: 'mostrar-variaveis', grupo: 'Regras, física e variáveis', tarefa: 'Mostrar ou esconder a parte das variáveis, na aba Regras' },
  // ---- Importar e exportar ---------------------------------------------
  { action: 'importar-programa', grupo: 'Importar e exportar', tarefa: 'Trazer um boneco feito no Spriter, no Spine ou no DragonBones' },
  { action: 'importar-psd', grupo: 'Importar e exportar', tarefa: 'Trazer um desenho do Photoshop: cada camada vira uma peça, no lugar' },
  { action: 'importar-psd-ossos', grupo: 'Importar e exportar', tarefa: 'Trazer do Photoshop já com os ossos, desenhados numa camada chamada ossos' },
  { action: 'exportar-imagem', grupo: 'Importar e exportar', tarefa: 'Fazer um GIF, um vídeo, uma folha de sprites ou PNG em sequência' },
  // N-4b (05/11/2026): o recorte da exportação, arrastado na cena.
  { action: 'recorte-na-cena', grupo: 'Importar e exportar', tarefa: 'Escolher na cena a área que sai na imagem exportada, puxando os cantos' },
  { action: 'tirar-recorte', grupo: 'Importar e exportar', tarefa: 'Voltar a exportar cortando pela borda do desenho' },
  { action: 'exportar-pele', grupo: 'Importar e exportar', tarefa: 'Salvar um arquivo menor, só com as roupas e as animações que eu marcar' },
  { action: 'exportar-gltf', grupo: 'Importar e exportar', tarefa: 'Levar o boneco para um programa 3D ou para uma engine' },
  { action: 'repetir-exportacao', grupo: 'Importar e exportar', tarefa: 'Exportar de novo, com as mesmas opções da última vez' },
  // ---- Arrumar a tela --------------------------------------------------
  { action: 'esconder-paineis', grupo: 'Arrumar a tela', tarefa: 'Esconder todos os painéis e ficar só com a cena' },
  { action: 'painel-arvore', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar a Árvore — a lista de ossos e desenhos' },
  { action: 'painel-ordem', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar a Ordem — quem fica na frente de quem' },
  { action: 'painel-propriedades', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar Propriedades — os campos do que está escolhido' },
  { action: 'painel-imagens', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar as Imagens — a pasta de arte' },
  { action: 'painel-entidades', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar as Entidades — os bonecos pendurados' },
  { action: 'painel-particulas', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar as Partículas — os emissores, com Novo, Duplicar e Apagar' },
  { action: 'painel-pivos', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar os Pivôs — onde o osso segura a imagem' },
  { action: 'painel-exibicao', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar a Exibição — as caixas de ver e travar' },
  { action: 'painel-previa', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar a Prévia — testar como fica no jogo' },
  { action: 'mostrar-painel-previa', grupo: 'Animar: chaves e tempo', tarefa: 'Abrir a Prévia para ver a animação aberta tocando ao lado da cena' },
  { action: 'painel-animacoes', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar as Animações — os corpos e as animações de cada um' },
  { action: 'painel-peles', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar as Peles — as roupas' },
  { action: 'painel-regras', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar as Regras — o que se mexe sozinho' },
  { action: 'painel-historico', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar o Histórico — voltar vários passos de uma vez' },
  { action: 'painel-malha', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar a Malha e pesos — entortar a imagem' },
  { action: 'painel-linha-do-tempo', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar a Linha do tempo' },
  { action: 'painel-curvas', grupo: 'Arrumar a tela', tarefa: 'Abrir ou fechar as Curvas — desenhar a passagem entre poses' },
  { action: 'detalhes-faixa', grupo: 'Arrumar a tela', tarefa: 'Abrir as linhas da linha do tempo uma a uma, em vez do resumo' },
  { action: 'mover-de-coluna', grupo: 'Arrumar a tela', tarefa: 'Mandar esta aba para a outra coluna' },
  { action: 'soltar-painel', grupo: 'Arrumar a tela', tarefa: 'Soltar o painel da parede, para ele flutuar sobre a cena' },
  { action: 'recolher-em-icone', grupo: 'Arrumar a tela', tarefa: 'Recolher as colunas em ícones, para a cena crescer' },
  { action: 'expandir-paineis', grupo: 'Arrumar a tela', tarefa: 'Expandir as colunas recolhidas em ícones' },
  { action: 'esconder-colunas', grupo: 'Arrumar a tela', tarefa: 'Esconder só as colunas, deixando a linha do tempo à vista' },
  { action: 'contexto-montar', grupo: 'Arrumar a tela', tarefa: 'Arrumar a tela para montar a base' },
  { action: 'contexto-animar', grupo: 'Arrumar a tela', tarefa: 'Arrumar a tela para animar' },
  { action: 'contexto-pesos', grupo: 'Arrumar a tela', tarefa: 'Arrumar a tela para malha e pesos' },
  { action: 'fechar-grupo', grupo: 'Arrumar a tela', tarefa: 'Fechar de uma vez todas as abas deste grupo' },
  { action: 'guardar-arranjo', grupo: 'Arrumar a tela', tarefa: 'Guardar a tela de agora com um nome, para voltar a ela depois' },
  { action: 'apagar-arranjo', grupo: 'Arrumar a tela', tarefa: 'Apagar um arranjo de tela guardado' },
  { action: 'arranjo-pivo', grupo: 'Arrumar a tela', tarefa: 'Pôr a tela do jeito bom para marcar pivô' },
  { action: 'arranjo-visualizacao', grupo: 'Arrumar a tela', tarefa: 'Pôr a tela do jeito bom para olhar o resultado' },
  { action: 'layout-padrao', grupo: 'Arrumar a tela', tarefa: 'Devolver a tela ao arranjo de fábrica' },
  { action: 'nome-das-ferramentas', grupo: 'Arrumar a tela', tarefa: 'Escrever o nome ao lado do ícone de cada ferramenta' },
  // ---- Achar e ajuda ---------------------------------------------------
  { action: 'paleta', grupo: 'Achar as coisas e pedir ajuda', tarefa: 'Achar um comando digitando um pedaço do nome dele — quando não sei em que menu está' },
  { action: 'quero-fazer', grupo: 'Achar as coisas e pedir ajuda', tarefa: 'Dizer o que quero fazer ("arma", "roupa", "gif") e ver os passos, com o lugar aceso no menu' },
  { action: 'atalhos', grupo: 'Achar as coisas e pedir ajuda', tarefa: 'Ver todas as teclas, e trocar uma por outra' },
  { action: 'problemas', grupo: 'Achar as coisas e pedir ajuda', tarefa: 'Ver o que o programa não entendeu no arquivo, e onde' },
  { action: 'manual', grupo: 'Achar as coisas e pedir ajuda', tarefa: 'Abrir o manual' },
  { action: 'sobre', grupo: 'Achar as coisas e pedir ajuda', tarefa: 'Ver que versão do programa é esta' },
  // Rodada 6, lote 2 (05/10/2026): as portas dos menus novos.
  { action: 'trazer-sequencia', grupo: 'As imagens e o pivô', tarefa: 'Trazer uma subpasta numerada como um desenho só, que troca de quadro' },
  { action: 'copiar-pivo', grupo: 'As imagens e o pivô', tarefa: 'Copiar o pivô de uma imagem para usar em outra' },
  // Rodada 44, lote 7.
  { action: 'caber-na-antiga', grupo: 'As imagens e o pivô', tarefa: 'Fazer a imagem trocada caber no tamanho da que saiu' },
  { action: 'colar-pivo', grupo: 'As imagens e o pivô', tarefa: 'Pôr numa imagem o pivô copiado de outra, na mesma proporção' },
  { action: 'virar-malha', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Transformar uma imagem inteira em malha, para dobrar' },
  { action: 'malha-automatica', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Fazer a malha sozinha, pelo contorno da imagem' },
  { action: 'tracar-contorno', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Fazer só o contorno da malha, pela silhueta' },
  { action: 'criar-vertice', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Pôr pontos novos na malha, clicando nela' },
  { action: 'apagar-vertice', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Tirar pontos da malha' },
  { action: 'criar-aresta', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Ligar dois pontos da malha, para ela dobrar ao longo da linha' },
  { action: 'usar-forma-de-outra', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Usar a forma de outra malha, trocando só a imagem' },
  { action: 'ligar-ossos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Dizer que ossos puxam a malha' },
  { action: 'pesos-automaticos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Deixar o programa decidir quanto cada osso puxa a malha' },
  { action: 'suavizar-pesos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Deixar a dobra da malha mais macia' },
  { action: 'podar-pesos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Tirar da malha os pesos pequenos demais' },
  { action: 'chavear-pesos', grupo: 'Animar: chaves e tempo', tarefa: 'Gravar os pesos da malha como chave na animação' },
  { action: 'tirar-pesos', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Fazer a malha voltar a seguir só o osso dela' },
  { action: 'trocar-ossos-regra', grupo: 'Regras, física e variáveis', tarefa: 'Trocar os ossos de uma regra sem apagar e fazer de novo' },
  { action: 'apagar-regra', grupo: 'Regras, física e variáveis', tarefa: 'Apagar uma regra' },
  { action: 'chave-parametro', grupo: 'Regras, física e variáveis', tarefa: 'Gravar onde o alvo fica neste valor do parâmetro' },
  { action: 'apagar-parametro', grupo: 'Regras, física e variáveis', tarefa: 'Apagar um parâmetro' },
  { action: 'renomear-etiqueta', grupo: 'Regras, física e variáveis', tarefa: 'Dar outro nome a uma etiqueta, em todo lugar' },
  { action: 'apagar-etiqueta', grupo: 'Regras, física e variáveis', tarefa: 'Apagar uma etiqueta, e tirá-la de toda animação' },
  { action: 'salvar-base-nova', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer uma base nova com a pose deste instante' },
  { action: 'rebaixar-entidade', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer uma base voltar a ser entidade' },
  { action: 'tirar-troca-base', grupo: 'Corpos, animações e entidades', tarefa: 'Desfazer a troca de base num quadro da animação' },
  { action: 'clonar-pele', grupo: 'Peles: trocar a roupa', tarefa: 'Fazer uma cópia da roupa, com os mesmos ossos' },
  { action: 'pele-de-pasta', grupo: 'Peles: trocar a roupa', tarefa: 'Fazer uma roupa inteira de uma pasta, pelos nomes iguais' },
  { action: 'apagar-pele', grupo: 'Peles: trocar a roupa', tarefa: 'Apagar uma roupa' },
  { action: 'editar-pele', grupo: 'Peles: trocar a roupa', tarefa: 'Escolher em qual roupa nasce o que eu crio agora' },
  // Noite de 04/11/2026 (obra/skins): a grade peça × skin.
  { action: 'guarda-roupa', grupo: 'Peles: trocar a roupa', tarefa: 'Ver todas as roupas lado a lado e trocar a imagem de uma peça numa roupa' },
  { action: 'por-entidade', grupo: 'Corpos, animações e entidades', tarefa: 'Pôr uma entidade na cena, presa ao osso escolhido' },
  { action: 'escolher-animacao-entidade', grupo: 'Corpos, animações e entidades', tarefa: 'Escolher qual animação da entidade toca daqui em diante' },
  // Rodada 8c, C15.
  { action: 'entidade-em-laco', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer a entidade rodar em laço, ou tocar uma volta e parar' },
  // Rodada 11 (05/10/2026): "Este boneco", a tomada ao contrário.
  { action: 'este-boneco', grupo: 'Corpos, animações e entidades', tarefa: 'Pôr a entidade em volta do boneco: uma parte atrás dele inteiro, outra na frente' },
  { action: 'tirar-este-boneco', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer a entidade voltar a ser desenhada em bloco, no lugar dela na ordem' },
  { action: 'marcar-como-slot', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer uma imagem virar uma base com nome e animações próprias, sem mudar o desenho' },
  { action: 'desmarcar-slot', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer a base marcada voltar a ser a imagem de antes, como era' },
  // Rodada 39, lote 2: a montagem de teste.
  { action: 'por-em-teste', grupo: 'Corpos, animações e entidades', tarefa: 'Ver uma entidade no lugar de uma imagem, só de teste, sem mudar a animação nem o arquivo' },
  { action: 'desligar-teste', grupo: 'Corpos, animações e entidades', tarefa: 'Tirar a peça de teste do lugar da imagem' },
  { action: 'por-dentro-de', grupo: 'Corpos, animações e entidades', tarefa: 'Ver o boneco dentro do mecha, só de teste, sem que ele leve o mecha' },
  { action: 'tirar-de-volta', grupo: 'Corpos, animações e entidades', tarefa: 'Tirar o que está em volta do boneco, só de teste' },
  { action: 'por-no-projeto', grupo: 'Corpos, animações e entidades', tarefa: 'Gravar no boneco a peça que estava só de teste' },
  { action: 'anima-do-teste', grupo: 'Corpos, animações e entidades', tarefa: 'Escolher o que a peça de teste toca' },
  { action: 'skins-do-teste', grupo: 'Corpos, animações e entidades', tarefa: 'Testar uma skin na peça de teste' },
  { action: 'teste-nas-iguais', grupo: 'Corpos, animações e entidades', tarefa: 'Pôr a peça de teste em todas as iguais, como as rodas' },
  { action: 'promover-entidade', grupo: 'Corpos, animações e entidades', tarefa: 'Fazer uma entidade virar base, com as animações dela' },
  { action: 'prender-emissor', grupo: 'Montar o boneco: ossos e peças', tarefa: 'Prender o emissor de partículas a um osso, sem sair do lugar' },
]);

/**
 * As ações que **não são tarefa**, e por quê.
 *
 * Uma lista de exceções é uma dívida, e por isso cada linha carrega o motivo —
 * o mesmo molde do `EXEMPT` da parte 1. Sem motivo escrito, a lista cresce até
 * a folha não provar mais nada.
 */
export const NAO_E_TAREFA: readonly NaoEtarefaDef[] = Object.freeze([]);

// ---------------------------------------------------------------------------
// A coluna 2: por onde se chega
// ---------------------------------------------------------------------------

/** A tecla como se escreve num papel: `'ctrl+arrowup'` vira `'Ctrl+↑'`. */
export function teclaEscrita(key: string): string {
  const NOMES: Readonly<Record<string, string>> = {
    arrowleft: '←', arrowright: '→', arrowup: '↑', arrowdown: '↓',
    ' ': 'Espaço', escape: 'Esc', delete: 'Delete', backspace: 'Backspace',
    home: 'Início', end: 'Fim', tab: 'Tab',
    ctrl: 'Ctrl', alt: 'Alt', shift: 'Shift',
  };
  return key.split('+').map((parte) => {
    if (NOMES[parte] !== undefined) return NOMES[parte];
    // `f1` vira `F1`, `k` vira `K`: a primeira letra em maiúscula serve às duas.
    return parte.charAt(0).toUpperCase() + parte.slice(1);
  }).join('+');
}

/** Onde a tecla vale, por escrito. `'toda-parte'` não se escreve: é o normal. */
const ONDE_A_TECLA_VALE: Readonly<Record<string, string>> = Object.freeze({
  'toda-parte': '',
  cena: 'com o foco na cena',
  'linha-do-tempo': 'com o foco na linha do tempo',
  arvore: 'com o foco na Árvore',
  ordem: 'com o foco na aba Ordem',
});

/** Os botões das quatro tiras da barra de ações. */
const BARRA: readonly ActionBarItem[] = Object.freeze([
  ...FILE_ITEMS, ...EDIT_ITEMS, ...VIEW_ITEMS, ...SEE_LOCK_ITEMS,
]);

/** Uma entrada de menu com o caminho inteiro até ela. */
interface CaminhoDeMenu {
  action: string;
  label: string;
  /** `['Arquivo', 'Importar', 'Do Photoshop…']`. */
  caminho: readonly string[];
  shortcut: string | undefined;
  /** `true` quando ela só abre um submenu. */
  abreSubmenu: boolean;
}

/** Todo item de todo menu, com o caminho da barra até ele. */
export function caminhosDeMenu(
  groups: readonly MenuGroupDef[] = allMenus(NEUTRAL_MENU_STATE),
): CaminhoDeMenu[] {
  const out: CaminhoDeMenu[] = [];
  const anda = (itens: readonly MenuItem[], acima: readonly string[]): void => {
    for (const item of itens) {
      if (isSeparator(item)) continue;
      const caminho = [...acima, item.label];
      const filhos = item.children ?? [];
      out.push({
        action: item.action,
        label: item.label,
        caminho,
        shortcut: item.shortcut,
        abreSubmenu: filhos.length > 0,
      });
      if (filhos.length > 0) anda(filhos, caminho);
    }
  };
  for (const group of groups) anda(group.entries, [group.label]);
  return out;
}

/** As portas de uma ação, na ordem em que uma pessoa as procura. */
export function portasDe(
  action: string, menus: readonly CaminhoDeMenu[] = caminhosDeMenu(),
): Porta[] {
  const out: Porta[] = [];

  for (const m of menus) {
    if (m.action !== action || m.abreSubmenu) continue;
    const tecla = m.shortcut === undefined ? '' : ` (${m.shortcut})`;
    out.push({ tipo: 'menu', texto: `${m.caminho.join(' → ')}${tecla}` });
  }

  for (const item of BARRA) {
    if (item.actionId !== action) continue;
    out.push({ tipo: 'barra', texto: `Barra de ações: ${item.label}` });
  }

  for (const c of CONTEXT_ACTIONS) {
    if (c.action !== action) continue;
    out.push({ tipo: 'botão direito', texto: c.where });
  }

  /*
   * As teclas que não estão escritas ao lado de um item de menu: as do menu já
   * saíram acima, entre parênteses, e repeti-las é ruído.
   *
   * A comparação é pelo nome NORMALIZADO, e não pelo texto escrito: o menu
   * escreve "Ctrl+−" com o menos de tipografia (U+2212) e a tabela de teclas
   * guarda `ctrl+-`. Comparando texto com texto, "Afastar" saía com a mesma
   * tecla duas vezes — o primeiro defeito que esta folha achou, e foi em si
   * mesma.
   */
  const doMenu = new Set(
    menus.filter((m) => m.action === action && m.shortcut !== undefined)
      .map((m) => normalizeShortcut(m.shortcut as string)),
  );
  const vistas = new Set<string>();
  for (const k of KEY_TABLE) {
    if (k.action !== action) continue;
    if (doMenu.has(k.key)) continue;
    const escrita = teclaEscrita(k.key);
    const onde = ONDE_A_TECLA_VALE[k.scope] ?? '';
    const quando = [onde, k.when ?? ''].filter((t) => t !== '').join(', ');
    const texto = quando === '' ? escrita : `${escrita} — ${quando}`;
    if (vistas.has(texto)) continue;
    vistas.add(texto);
    out.push({ tipo: 'tecla', texto });
  }

  return out;
}

// ---------------------------------------------------------------------------
// A coluna 3: o que o roteiro prova
// ---------------------------------------------------------------------------

/**
 * As formas que **contam como prova**, e o que cada uma prova.
 *
 * **Escritas aqui e impressas na folha**, porque o que a régua não reconhece
 * vira um "não" na coluna Provado, e um "não" por cegueira do medidor é
 * diferente de um "não" por falta de prova. Quem lê tem direito de saber qual
 * é qual.
 */
export const FORMAS_DA_PROVA: readonly { forma: string; o_que_e: string }[] = Object.freeze([
  { forma: "runAction('id')", o_que_e: 'a prova chama a ação pelo id, direto' },
  { forma: ".menu-item … 'Nome'", o_que_e: 'a prova abre o menu e clica no item pelo nome' },
  { forma: "aria-label') === 'Nome'", o_que_e: 'a prova clica num botão pelo nome dele' },
]);

/**
 * **A tecla apertada NÃO conta como prova**, e isto é o motivo escrito.
 *
 * Contava, na primeira versão desta régua, e deu três verdes falsos de dez —
 * achados perguntando o que cada verde provava, e não se ele era explicável
 * (regra 28):
 *
 * | O verde | O que ele provava de verdade |
 * |:---|:---|
 * | `novo` | **nada**: o `runAction('novo')` estava dentro de um COMENTÁRIO do roteiro |
 * | `desmarcar` | que o roteiro aperta `Esc` — mas quem come o `Esc` é a ferramenta na mão, e isso não está em tabela nenhuma |
 * | `virar-filho` | que o roteiro segura `P` — que é o GESTO `pegar-filhos`, e não a ação do menu que declara a mesma tecla |
 *
 * A forma do erro, e não o estrago: **eu tomei "a tecla foi apertada" por "a
 * ação rodou"**. Quem responde a uma tecla é decidido na hora — pela ferramenta
 * na mão, pelo foco, pelo painel montado —, e nada disso está numa tabela que
 * um medidor sem navegador possa ler. Duas linhas da `KEY_TABLE` podem declarar
 * a mesma tecla, e só uma atende.
 *
 * As teclas apertadas continuam medidas, e saem na folha como o que são: uma
 * **quase-prova**, com o nome dela.
 */
export const POR_QUE_A_TECLA_NAO_PROVA =
  'quem responde a uma tecla é decidido na hora — a ferramenta na mão, o foco, o painel '
  + 'montado. Duas linhas da tabela de teclas podem declarar a mesma tecla, e só uma atende. '
  + 'Um medidor sem navegador não sabe qual.';

/** `modifiers` do CDP: 1 Alt, 2 Ctrl, 8 Shift. */
function modificadores(n: number): string {
  const partes: string[] = [];
  if ((n & 2) !== 0) partes.push('ctrl');
  if ((n & 1) !== 0) partes.push('alt');
  if ((n & 8) !== 0) partes.push('shift');
  return partes.join('+');
}

/**
 * O texto de uma prova **sem os comentários**.
 *
 * Tira o bloco `/* … *\/` e a linha que só é comentário. Sem isso, um
 * `runAction('novo')` escrito num comentário do roteiro conta como prova — e
 * contou, na primeira versão desta régua. É a armadilha do medidor em miniatura:
 * o medidor leu o que alguém ESCREVEU SOBRE a prova, e não a prova.
 *
 * Só a linha inteira, e não o `//` no meio dela: um `'ws://…'` dentro de um
 * texto perderia metade, e o remédio seria pior.
 */
export function semComentarios(texto: string): string {
  return texto
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n')
    .filter((linha) => !/^\s*\/\//.test(linha))
    .join('\n');
}

/**
 * As ações que as provas **provam**: a ação chamada pelo id, ou uma porta com
 * nome clicada.
 *
 * `textos` é `{ 'ferramentas/provas/roteiro-30.mjs': '…' }`. Quem monta esse
 * mapa passa os arquivos de `AS_PROVAS`, um por um, pelo nome — nunca uma pasta.
 *
 * A tecla apertada **não** entra aqui: `POR_QUE_A_TECLA_NAO_PROVA` diz por quê.
 */
export function acoesProvadas(
  textos: ReadonlyMap<string, string>,
  menus: readonly CaminhoDeMenu[] = caminhosDeMenu(),
): Set<string> {
  const out = new Set<string>();

  for (const bruto of textos.values()) {
    const texto = semComentarios(bruto);
    // 1. `runAction('descer-ordem')`
    for (const m of texto.matchAll(/runAction\(\s*'([a-z0-9-]+)'\s*\)/g)) {
      out.add(m[1]);
    }
    // 2. o menu aberto e o item clicado pelo nome. A prova escreve o nome com
    //    `startsWith` ou `===`, e às vezes só o começo dele ("Abrir pasta").
    for (const m of texto.matchAll(/\.menu-item[\s\S]{0,300}?(?:startsWith|includes|===)\s*\(?\s*'([^']{3,})'/g)) {
      const pedaco = m[1];
      for (const entrada of menus) {
        if (entrada.abreSubmenu) continue;
        if (entrada.label.startsWith(pedaco)) out.add(entrada.action);
      }
    }
    // 3. o botão clicado pelo nome de leitor de tela.
    for (const m of texto.matchAll(/aria-label'\)\s*===\s*'([^']+)'/g)) {
      const nome = m[1];
      for (const entrada of menus) {
        if (entrada.abreSubmenu) continue;
        if (entrada.label === nome) out.add(entrada.action);
      }
      for (const row of ACTION_TABLE) {
        if (row.label === nome) out.add(row.id);
      }
    }
  }
  return out;
}

/**
 * As ações cuja **tecla** a prova aperta. Quase-prova, e nada mais.
 *
 * Sai na folha com esse nome, e nunca na coluna Provado:
 * `POR_QUE_A_TECLA_NAO_PROVA`. Fica medido porque é informação — dizer *"o
 * roteiro passa perto desta"* vale mais que não dizer nada — e porque mostra
 * quanto do roteiro é tecla.
 */
export function acoesComTeclaApertada(
  textos: ReadonlyMap<string, string>,
): Set<string> {
  const porTecla = new Map<string, string[]>();
  for (const k of KEY_TABLE) {
    if (k.action.startsWith('local:')) continue;
    const lista = porTecla.get(k.key) ?? [];
    lista.push(k.action);
    porTecla.set(k.key, lista);
  }

  const out = new Set<string>();
  for (const bruto of textos.values()) {
    const texto = semComentarios(bruto);
    for (const m of texto.matchAll(/\btecla\(\s*'([^']+)'(?:\s*,\s*'[^']*')?(?:\s*,\s*(\d+))?\s*\)/g)) {
      const base = m[1] === 'Escape' ? 'escape' : m[1].toLowerCase();
      const mods = modificadores(m[2] === undefined ? 0 : Number(m[2]));
      const chave = mods === '' ? base : `${mods}+${base}`;
      for (const action of porTecla.get(chave) ?? []) out.add(action);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// A folha
// ---------------------------------------------------------------------------

/**
 * A folha inteira: uma linha por ação, com a tarefa, as portas e a prova.
 *
 * A lista de ações sai do `ACTION_TABLE` e dos menus juntos: o `ACTION_TABLE`
 * traz quem existe, e os menus trazem quem tem porta. Uma ação que estivesse
 * num menu e não na tabela é vermelho de outro teste (`acoes`), e aqui ela
 * aparece do mesmo jeito — esconder não ajuda ninguém.
 */
export function folhaDeTarefas(
  provas: ReadonlyMap<string, string>,
  menus: readonly CaminhoDeMenu[] = caminhosDeMenu(),
): TarefaRow[] {
  const provadas = acoesProvadas(provas, menus);
  const teclas = acoesComTeclaApertada(provas);
  const dicionario = new Map(TAREFAS.map((t) => [t.action, t]));
  const dispensadas = new Map(NAO_E_TAREFA.map((t) => [t.action, t.why]));

  const abreSubmenu = new Set(menus.filter((m) => m.abreSubmenu).map((m) => m.action));
  const rotulos = new Map<string, string>();
  for (const m of menus) if (!rotulos.has(m.action)) rotulos.set(m.action, m.label);
  for (const row of ACTION_TABLE) if (!rotulos.has(row.id) && row.label !== '') rotulos.set(row.id, row.label);
  for (const item of BARRA) if (!rotulos.has(item.actionId)) rotulos.set(item.actionId, item.label);

  const ids = new Set<string>();
  for (const row of ACTION_TABLE) ids.add(row.id);
  for (const m of menus) if (!m.abreSubmenu) ids.add(m.action);
  for (const item of BARRA) ids.add(item.actionId);
  for (const c of CONTEXT_ACTIONS) ids.add(c.action);

  /*
   * A ordem: primeiro as que têm nome, **na ordem do dicionário** — que é
   * escolhida à mão, e é a ordem em que uma pessoa faz as coisas ("começar do
   * zero" antes de "salvar como pacote"). Depois as outras, em ordem de nome.
   * Ordenar tudo pelo id punha "Começar um boneco do zero" em sétimo lugar,
   * atrás de "Abrir recente".
   */
  const ordemDoDicionario = new Map(TAREFAS.map((t, i) => [t.action, i]));
  const ordenadas = [...ids].sort((a, b) => {
    const ia = ordemDoDicionario.get(a);
    const ib = ordemDoDicionario.get(b);
    if (ia !== undefined && ib !== undefined) return ia - ib;
    if (ia !== undefined) return -1;
    if (ib !== undefined) return 1;
    return a.localeCompare(b);
  });

  const out: TarefaRow[] = [];
  for (const action of ordenadas) {
    const def = dicionario.get(action);
    const dispensa = dispensadas.get(action);
    out.push({
      action,
      label: rotulos.get(action) ?? '',
      grupo: def?.grupo ?? null,
      tarefa: def?.tarefa ?? null,
      naoEtarefa: dispensa ?? (abreSubmenu.has(action) && def === undefined
        ? 'só abre um submenu: não faz nada por si'
        : null),
      portas: portasDe(action, menus),
      provado: provadas.has(action),
      teclaApertada: teclas.has(action),
    });
  }
  return out;
}

/**
 * As ações **sem nome de tarefa e sem motivo escrito** — o que o teste acusa.
 *
 * É o coração da régua, e o molde é o da parte 1: a lista de exceções é
 * obrigatória, e o `why` tem de dizer por quê. Lista vazia = toda ação do
 * programa ou tem um nome que o Humberto entende, ou tem escrito por que não
 * precisa de um.
 */
export function semNomeDeTarefa(linhas: readonly TarefaRow[]): TarefaRow[] {
  return linhas.filter((l) => l.tarefa === null && l.naoEtarefa === null);
}

/** As tarefas nomeadas que apontam para uma ação que não existe mais. */
export function tarefasOrfas(linhas: readonly TarefaRow[]): string[] {
  const existem = new Set(linhas.map((l) => l.action));
  const out: string[] = [];
  for (const t of TAREFAS) if (!existem.has(t.action)) out.push(t.action);
  for (const t of NAO_E_TAREFA) if (!existem.has(t.action)) out.push(t.action);
  return out;
}

/** As tarefas nomeadas com um grupo que não está em `GRUPOS`. */
export function gruposDesconhecidos(): string[] {
  const conhecidos = new Set(GRUPOS);
  return [...new Set(TAREFAS.filter((t) => !conhecidos.has(t.grupo)).map((t) => t.grupo))];
}

/** As tarefas com nome e **sem porta nenhuma** — nem menu, nem tecla, nem barra. */
export function tarefasSemPorta(linhas: readonly TarefaRow[]): TarefaRow[] {
  return linhas.filter((l) => l.tarefa !== null && l.portas.length === 0);
}
