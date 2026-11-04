# Rodada 39 — passagem depois do lote 5

Escrita pelo `EXECUTANDO · rodada 39 — a aba das entidades [d86858]` em 06/10/2026, 09h51, ao parar num lote fechado (régua 8 da ficha: contexto pesado). Quem continua: leia a ficha `RODADA 39 - a aba das entidades 2026-10-06.md`, o plano `22` **com a seção Desvios** no fim, e esta folha.

## Onde está

| Lote | Versão | O que é | Conferido |
|:---:|:---:|:---|:---|
| 1 | v30.0 | a aba como árvore de cartões (AQUI, PROJETO, EM VOLTA) | `28`: 5 de 5 |
| 2 | v30.1 | ligar para baixo em teste; o teste mora no `manifest.json` | `29`: 5 ok, 1 pela metade (as notas a–d, feitas nos lotes 4 e 5) |
| 3 | v30.4 | Na cena; a linha cinza na linha do tempo | `32`: 5 de 5 |
| 4 | v30.6 | ligar para cima (o boneco no mecha); a cena em camadas | `34`: 2 ok, 3 pela metade — **ver "O que falta" abaixo** |
| 5 | v30.8 | Pôr no projeto (para baixo e para cima); a nota c do `29` | ainda não |

Fecho da v30.8 (06/10, 09:48): 5.382 passam, 1 vermelho (o do manual), `tsc` limpo, conformidade 120/120, roteiro 14/14, medir 90/90 e 81/90.

## O que falta

**Primeiro, as notas do `34`** (vieram depois do lote 5 pronto):

| # | Nota | Por onde |
|:---:|:---|:---|
| a | o aviso do Salvar que parou vem em **inglês** e com caminho interno | `io/picker-problem.ts`, `noteSaveRefused`: hoje mostra `problems[0]` cru. Trocar por *"Salvar: parou antes de gravar, porque <arquivo> tem N problemas. Nada foi gravado"* (o nome sai do `suggestedName` de `io/open-save.ts`, que chama). O teste é *"(d) o Salvar que para antes de gravar…"* em `pasta-do-projeto.test.ts` |
| b | a linha **vermelha** não aparece em três recusas: a entidade solta no slot onde ela **já está**; o cartão de teste solto no **próprio** slot; o mecha sobre o weapon (este é aceito: troca a espada pelo mecha, e o rodapé diz) | `panels/palette-entities.ts`, `acceptDrop`: o `porque(arrastando)` só sabe o uri. Guardar também de onde o cartão de teste saiu (host e slot) no `dragstart`, e recusar: o mesmo slot; e, em `whyCannotTest`, a mesma entidade que já está ali (no projeto ou em teste) |
| c | com o mecha em teste a aba fica comprida e **espreme** o painel Animações embaixo | a coluna dá altura pelo conteúdo da aba em uso ("A altura segue a aba em uso", ESTADO). O rolo da aba é `.entidades-rolo` com `data-rolagem="lista"`; descobrir quem calcula a altura do grupo (`ui/panel-groups.ts`, `ui/layout-model.ts`) e fazer a lista rolar por dentro. Medir nas 3 telas |
| d | "por trás e pela frente" não se lê com o mecha de exemplo | só anotar: o mecha das fotos é feito de três imagens do herói, sem nada por trás |

**Depois, o lote 6** (plano `22`, §3 e §9): no cartão, **anima ▾** (para teste: o que a peça toca na cena; para projeto: é a faixa, `setEntityAnimationAt` de `panels/dopesheet-actions.ts`, que aceita `null` = livre), **livre — o jogo escolhe**, **skins ▾**, a mesma entidade duas vezes (*"canhão 1 de 2"*), **Trocar todas as iguais (N)** (`image-picker-model.ts:763`). O mecha em volta toca a animação do cartão no relógio da agulha (`viewport/montagem-view.ts`, `posar`: hoje é sempre `updateWorldTransform(0)` na pose de repouso).

**E o lote 7**: arquivo que falta ("?", *falta o arquivo*, a barra de avisos), *"sem lugar"* quando o slot some, 10 entidades × 30 slots dobrados, a trilha de níveis em 1280×720, a **Prévia com o mecha em volta** (desvio do lote 4), medir nas 3 telas.

## Como as coisas estão feitas

| Peça | Onde | O que guardar na cabeça |
|:---|:---|:---|
| a montagem | `doc/montagem.ts` | `{ ligacoes, naCena, acima }` em `manifest.extras.RECORTE_projeto.montagem`. `SetMontagem` guarda antes e depois inteiros. **Mudar o tipo `Montagem` quebra os testes que o constroem à mão**: procure `naCena: false` em `pasta-do-projeto.test.ts` no MESMO golpe (o erro aconteceu duas vezes) |
| caminho e uri | `io/project-open.ts`, `montagemMapped` | no manifesto, caminhos; no editor, uris. Abrir e Salvar traduzem. O `.bonez` também leva (`io/save-binary.ts`) |
| a árvore | `panels/entities-cards-model.ts` | `cardTree(doc, { todas })`. O slot marcado é transparente. `wrapUp` põe a cadeia para cima por fora |
| as recusas | o mesmo | `whyCannotTest`, `whyCannotGoUp`, `whyNotIntoProject`, `innerLineRefusal` |
| a aba | `panels/palette-entities.ts` | três tipos de arrasto: `ENTITY_DRAG_TYPE` (da prateleira), `TEST_DRAG_TYPE` (o cartão de teste), `UP_DRAG_TYPE` (o cartão de fora). **Com `dropEffect = 'none'` o navegador nem solta**: por isso a recusa vai ao rodapé já no `dragover` (`sayRefusal`) |
| a cena | `viewport/montagem-view.ts` e `viewport-draw.ts` | `drawWithTestPieces` troca o anexo do slot vivo **só durante o desenho** e devolve. `syncChainAnchor` prende o boneco ao slot do de fora (a âncora da rodada 8b); `drawWithChain` desenha o de fora em duas passadas |
| Pôr no projeto | `entities-cards-model.ts`, `putIntoProject` | um `Command` composto, dado por `corpoDe(doc).run`. Para cima: `DropEntityAsSlot` + `SetEntityAround` + `SetMontagem`, com o mecha posto pela inversa da matriz do piloto |
| as portas | menu Entidades | `por-em-teste`, `desligar-teste`, `por-dentro-de`, `tirar-de-volta`, `por-no-projeto`. Contagens: `acoes.test` 298 / 126, `existir-nao-e-funcionar` 52 |

## Para provar na tela

`backup/fotos-obra/rodada-39/roteiros/dirigir.mjs` (o da rodada 23, com `TELA=LxA` e os eventos do CDP). O arrasto HTML5 de verdade é `arrastarDnD` em `lote4.mjs`: `Input.setInterceptDrags`, apertar e mover, esperar o `Input.dragIntercepted`, **só então** rolar até o alvo e medir onde ele está, e `Input.dispatchDragEvent` (dragEnter, dragOver, drop). `lote4.mjs` monta um mecha de prova com três imagens do herói.

## As armadilhas desta rodada

| Armadilha | A forma |
|:---|:---|
| o tipo novo sem procurar quem o constrói | duas vezes o `tsc` ficou vermelho por segundos, no meio da medição da 38 |
| o teste da frase escrito de memória | "é ele" contra "É ele" |
| medir o arquivo depois de uma conta que escreve nele | o `serialize` grava o estado do editor no `.bone` |
| testar o caminho imaginado | o botão pula a janela de escolha quando só há uma |
| a foto não olhada | o botão Na cena só com o ícone passou num roteiro que lia o texto |
| o heredoc com `'''` no shell | o Bash daqui não engole; grave o script num arquivo do rascunho e rode o arquivo |
| o semáforo | `backup/FECHO-EM-CURSO.txt`: olhe antes de cada gravação em `editor/`; quem fecha cria, espera 2 min de quietude, mede, e apaga ao dizer "fechei" |
