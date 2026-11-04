# Degrau 4b — o documento vira projeto; a virada na tela — 17/09/2026

Executor: `EXECUTANDO · degrau 4b: o projeto de vários corpos` (`animador-8a`).
Ordem direta do Humberto nesta janela. Versão **v13.9**.

**A ordem, palavra por palavra:**

> Execute o degrau quatro-b, só ele. Leia a spec zero ponto dois, seções dois
> ponto nove e nove ponto treze, o ARQUITETO três seções um e catorze, o
> ARQUITETO quatro D4b, e o contract ponto ts inteiro. O documento do editor
> vira projeto: um Projeto com vários corpos, cada corpo um Doc, uma pilha de
> desfazer só; as listas Corpos e Entidades e o corpo em foco no manifest
> extras; abrir pasta com manifest ponto json, um bone por corpo e por
> entidade, um atlas. O corpo do instante: cena, Árvore, Ordem e Propriedades
> leem o Actor do runtime, o esqueleto do corpo de t. O comando Colar corpo
> aqui grava a chave body em t. Mexida estrutural vai para a base do corpo do
> instante, e o rodapé diz foi para a base de fulano. Pronto quando o herói
> abre como projeto de um corpo igual a hoje; um projeto de dois corpos abre; a
> animação transformar com a chave body em zero vírgula cinco mostra o
> lobisomem dali em diante e a Árvore mostra o rabo só depois da virada.
> Reescreva os testes, a contagem não cai. Roteiro catorze de catorze. Não
> toque no runtime nem no Python. Pare e me mostre.

## O que entrou, tarefa por tarefa (`ARQUITETO 4`, D4b)

| # | Tarefa | Onde ficou |
|:---:|:---|:---|
| 4b.1 | `Projeto { corpos: Map<uri, Doc>, entidades, emFoco, manifesto }`; **uma pilha**; `Command` continua por `Doc` | `doc/projeto.ts` (novo); `doc/undo.ts` anota o dono de cada passo e reverte nele; `doc/document.ts` recebe a pilha do projeto |
| 4b.2 | `RECORTE_projeto` no `manifest.extras` | `readProjectLists` / `writeProjectLists` em `doc/projeto.ts`: `main` = o corpo em foco, `skeletons` = todos, as listas em `extras` |
| 4b.3 | `corpoEm(t)` e `esqueletoEm(t)`: o `Actor` do runtime na cena | `Doc.reposeQuiet` posa pelo `Actor` (`Pose(projeto, animação, t)` de 9.10); `doc.skeleton` é o esqueleto vivo do corpo do instante; `doc.body` e `doc.corpo()` no contrato; a Árvore, a Ordem e as Propriedades leem `corpoDe(doc).file` |
| 4b.4 | Abrir pasta com `manifest.json` (saída **a** de §1.3) | `io/project-open.ts` (novo): lê o manifesto, abre cada corpo pelo `readOpenedFiles` de sempre, monta o projeto. `startInFolder` olha o manifesto antes do `.bone` lembrado. Salvar grava os outros corpos e o `manifest.json` ao lado, **só quando há mais de um arquivo** |
| 4b.5 | **Colar corpo aqui** | `anim/body.ts` (novo): `setBodyKey`, `bodyAt`, `pasteBodyHere`; ação `colar-corpo` no menu Animação, da casca (pergunta qual corpo quando há vários, ou oferece a volta ao corpo do arquivo) |
| 4b.6 | Mexida estrutural → base do corpo do instante; rodapé *"foi para a base de fulano"* | Árvore, Ordem, Propriedades, Criar osso, Ponto, Caixa, malha (`mesh-doc`), trocar de pai (caminhos 2 e 3), soltar imagem na cena, trocar imagem: `corpoDe(doc).run(...)`. O projeto repassa a mudança ao foco com *"(na base de lobisomem)"*; `wentToBase(doc)` no contrato dá o sufixo |
| 4b.7 | Testes | 34 novos: `documento` (projeto, pilha, corpo do instante, avisos, chaves `body`), `arvore`, `ordem`, `paineis`, `arquivo` (manifesto, pasta de mentira, o que o Salvar grava, o item do menu) |

## Pronto quando — conferido

| Critério | Como foi provado |
|:---|:---|
| O herói abre como projeto de um corpo, igual a hoje | No navegador: `Arquivo → Abrir o herói`, 18 ossos, `corpos = [heroi.bone]`, `entidades = [espada.bone]`, sem aviso. Roteiro 14 de 14 |
| Um projeto de dois corpos abre | Teste `abre os dois corpos da pasta…` (pasta de mentira com `manifest.json`); no navegador, o C-290 carregado pelo `Projeto.open` |
| `transformar` com `body` em 0,5 mostra o lobisomem dali em diante | Em 0,25 a cena tem `braco` e o tronco em (10, 100); em 0,75 tem `rabo`, o tronco em (30, 120) e o rabo em (20, 120): os números do C-290 |
| A Árvore mostra o rabo só depois da virada | Em 0,25: `tronco → corpo, braco`; em 0,75: `tronco → corpo, rabo`. Testes e tela |
| Colar corpo aqui grava a chave em `t` | Pelo menu, em 0,30: chave `[0.3, lobisomem.bone]`, rodapé *"Corpo lobisomem colado em 0,30 s…"*, desfazer tira |
| A mexida vai para a base do corpo do instante | `Esqueleto → Osso` em 0,75: o osso nasce no lobisomem, o homem não muda uma vírgula, rodapé *"Novo osso (na base de lobisomem)"*, `Ctrl+Z` desfaz |

## Suposições e desvios

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | **O uri da chave `body` é o nome do arquivo na raiz da pasta** (`lobisomem.bone`), sem passar por `assets.skeletonsBase` | O `Actor` do runtime procura o corpo pela `value` crua, e o runtime não é meu para tocar. Um projeto com `skeletonsBase` que não seja `""` não casa a chave com o corpo: fica o corpo de antes, com `BODY_MISSING` na barra de avisos (regra 21). Resolver o uri é do D10 (Arquivo) |
| 2 | **Só a raiz da pasta.** Os corpos são procurados na raiz, como o `.bone` lembrado do lote 62 | Uma subpasta por corpo pede o `descend` no Abrir e no Salvar; não está na tabela 4b |
| 3 | **Um projeto de um corpo não ganha `manifest.json` ao salvar** | *"O herói abre como projeto de um corpo igual a hoje"*: o roteiro compara o `.bone` salvo com o reaberto, e a pasta do passo 13 não pode mudar de cara. O manifesto nasce com o segundo arquivo |
| 4 | **Sem janela de Corpos e Entidades.** As listas moram no projeto e no manifesto; trocar o corpo em foco é do D5 (a janela Animação) | A tabela 4b pede as listas no `extras`, não a janela |
| 5 | **Entidades ficam listadas, fechadas.** Uma entidade não tem `Doc`; as aninhadas (7.11) do arquivo em foco entram na lista ao abrir | `ARQUITETO 3` §1.4: *"Abrir como entidade: lista em Entidades, fechado"* |
| 6 | **A ordem de desenho com a virada:** a base é a do corpo do instante, a chave `drawOrder` é da animação aberta (`drawOrderAt` ganhou o arquivo das chaves à parte) | Uma função só decide, como antes; a Ordem lê `drawOrderNow(doc)` |
| 7 | **Renomear pelas Propriedades:** osso, slot, regra e anexo vão para o corpo do instante; a animação, para o arquivo em foco | A animação é do arquivo dela (M8); o resto é do corpo |
| 8 | **A mistura da troca (lote 46) posa sempre o corpo do arquivo** | A virada é corte seco (9.13); misturar dois corpos não existe |
| 9 | **A chave de pai com a virada:** só o pai do arquivo (`doArquivo`) passou a olhar o corpo do instante; a conta das chaves de pose que vêm depois (`reinadoAte`, o esqueleto de medição) continua lendo o arquivo em foco | Trocar de pai um osso que só o lobisomem tem, dentro da animação do homem, é caso de borda que o D7 (Cena · Árvore) fecha; escrito aqui para não parecer feito |
| 10 | **A pilha de peles passa pelo ator** a cada pose: a `default` embaixo e as visíveis por cima, nome que o arquivo não tem fica fora | Sem isso o `Actor` devolvia a pilha a `["default"]` a cada quadro, e a pele escolhida sumia. Mesma conta de `combinedSkins` da cena |
| 11 | **`dirty` é do projeto.** O foco diz "não salvo" quando qualquer corpo tem mudança; `markSaved` do projeto limpa todos | O que se salva é o projeto. Foi preciso um `dirtyOwn` para a conta não entrar em laço entre dois corpos |
| 12 | **Pivô e atlas continuam do arquivo em foco.** O 4b.6 cita "pivô"; o pivô da pasta mora no `RECORTE_editor_state` do foco e o atlas é um por projeto | "Um atlas" por projeto (2.9); carimbar o pivô no atlas do corpo do instante é do D8 (Imagens · Ordem · Entidades) |
| 13 | A ação `colar-corpo` é **da casca**, não de arranque | Com vários corpos ela pergunta qual numa janela (`askPick`); sem outro corpo, diz o que falta numa janela também |
| 14 | O `runtime/` e o `runtime-python/` **não foram tocados** | Ordem do Humberto. O editor só usa o que o D2 entregou (`Actor`, `corpoEm`, `pose`) |

## Números do fecho

| Prova | Resultado |
|:---|:---|
| `npx vitest run editor/testes` | **2.017** (1.987 verdes, 29 pulados, 1 vermelho antigo do manual, de 15/09). Eram 1.983: **34 novos** |
| `npx vitest run` (suíte inteira) | **2.995** (2.965 verdes, 29 pulados, 1 vermelho antigo do manual). Eram 2.961 |
| `npx tsc --noEmit -p editor/tsconfig.json` | limpo |
| `node ferramentas/conformidade.mjs` | 71 de 71 (nada mudou no runtime) |
| `npm run roteiro` | 14 de 14 |
| `npm run medir` | 22 de 22 de lado, 15 de 22 de altura (igual a antes) |
| `python ferramentas/montar-programa.py` | montado |

**Ficou de fora:** nada da tabela 4b.1 a 4b.7. As bordas estão na tabela de
suposições, com o degrau que as fecha.
