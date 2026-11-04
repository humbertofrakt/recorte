# Encargos — a rodada final — 28/09/2026

Escrito pelo `PLANEJADOR · 9f75b5`, às 23h45 (relógio da máquina).

Ordem do Humberto, nesta janela, 28/09:

> *"Tem muita coisa que está programada, mas não tem menu ligado a isso."*
> *"Partícula. Eu não sei onde é que acha partícula nesse programa."*
> *"Eu queria que eles pegassem a referência na internet do que eles estão
> fazendo, para depois fazer."*

**O alvo:** o programa pronto. Toda função com porta. Toda porta que **se acha**.

---

## A régua da rodada — vale para os cinco chats

| # | Regra |
|:---:|:---|
| 1 | **Referência primeiro, código depois.** Antes de cada lote, pesquise na internet como os outros programas fazem aquilo. Escreva o achado. Só então programe |
| 2 | **"Tem porta" não é "se acha".** A partícula tem porta desde a v21.9, e o Humberto não a encontrou. A entrega é ele achar sozinho |
| 3 | **Lote sem foto não fecha.** Par de fotos (antes e depois) por lote, na pasta de fotos da ficha |
| 4 | Botão novo nasce em **ícone**, com o **nome na dica** |
| 5 | **Nenhum campo novo no núcleo do formato** (regra 7 da casa) |
| 6 | **Backup antes de escrever**, com linha no `backup/INDICE.md` |
| 7 | **Uma versão por lote**: `python ferramentas/versao.py N.N "o que mudou"`. Confira o número no `INDICE.md` antes |
| 8 | **Suíte inteira, roteiro e medição: só com o "PODE" do Planejador.** Trabalhando, rode só os testes da sua parte e o `tsc` |
| 9 | **Nenhum painel de pergunta.** Dúvida sobe por `SendMessage` ao Planejador. Enquanto espera, siga a suposição escrita abaixo |
| 10 | **Não toque** em `documentos/manual/`, `runtime/`, `runtime-python/`, `formato/`, `conformidade/`, `site/` |
| 11 | Fora da sua cerca: só arquivo de passagem, **só acrescentando**, relendo do disco antes de gravar |
| 12 | Defeito achado fora da sua cerca: **não conserte**. Escreva em `documentos/planos/DEFEITOS achados no uso 2026-09-28.md` e avise o Planejador |

### A regra 1 por extenso — a referência

| Passo | O quê |
|:---:|:---|
| 1 | Pesquise: **Spriter, Spine e DragonBones** primeiro. Se nenhum dos três tem a função, os programas que a ficha indicar |
| 2 | Escreva em `documentos/pesquisa/nova pesquisa/REFERENCIA <assunto> 2026-09-28.md` |
| 3 | O documento tem: o **link** de cada fonte · o que cada programa faz, **onde fica o botão** · qual modelo seguimos · por quê |
| 4 | A ordem de escolha é a da casa: **fluxo do Spriter, ferramentas do Spine encaixadas nele** |
| 5 | Sem fonte achada, escreva "não achei". **Nunca invente o que um programa faz** |

### Ver o programa — uma porta por chat

O `vite` do projeto usa porta fixa (5173). Dois chats nela brigam.
Cada chat abre o editor **na porta da sua ficha**:

```
npx vite editor --port <porta da ficha> --strictPort
```

Os preparos de foto das rodadas passadas servem de modelo:
`backup/fotos-particulas/`, `backup/fotos-efeitos/`.

---

## As decisões — suposições de trabalho

O plano `PLANO finalizar o programa 2026-09-28.md` tem dez perguntas ao Humberto.
Ele mandou finalizar. **Seguimos a sugestão de cada uma, e ele veta o que quiser.**
Onde a referência pesquisada disser outra coisa, o chat avisa o Planejador antes.

| # | Pergunta | Suposição |
|:---:|:---|:---|
| D1 | As seis portas entram onde a tabela A do plano diz? | sim, salvo a referência dizer outro lugar |
| D2 | Evento e Parâmetro ganham linha na Árvore? | sim |
| D3 | Etiqueta do Aseprite vira animação ao importar? | sim, uma por etiqueta, com aviso no rodapé |
| D4 | Grade em perspectiva | **rodada 2** |
| D5 | Painel que não cabe | a aba rola, com grupos dobráveis |
| D6 | Apagar o código morto | **rodada 2** |
| D7 | Teclas de painel na Ajuda → Atalhos | sim, em seção dobrada |
| D8 | A palavra "Etiqueta" | fica |
| D9 | Os doze botões da aba Regras viram `Novo ▾` | sim |
| D10 | Empurrar chaves por arrasto | não |

---

## Os cinco chats

| Chat | Janela | Parte | Porta |
|:---:|:---|:---|:---:|
| **A** | `EXECUTANDO · finalizar o programa` (já aberto) | os defeitos, e a caça de erro pelo uso | 5205 |
| **B** | `EXECUTANDO · partículas que se acham` | as partículas | 5201 |
| **C** | `EXECUTANDO · as portas das regras` | a aba Regras | 5202 |
| **D** | `EXECUTANDO · árvore, malha e linha do tempo` | Árvore, Malha, linha do tempo | 5203 |
| **E** | `EXECUTANDO · arquivo e importar` | entrar e sair arquivo | 5204 |

**Todos em Opus.** As cinco cercas não se cruzam em nenhum arquivo.

Caminho: `A / B / C / D / E → PLANEJADOR · 9f75b5 → Humberto`.

---

## Ficha A — os defeitos, e a caça de erro pelo uso

| | |
|:---|:---|
| **Janela** | `EXECUTANDO · finalizar o programa` |
| **Fotos** | `backup/fotos-rodada-final/defeitos/` |
| **Cerca** | `ui/shell*.ts` · `doc/*` · `viewport/tools/shear.ts` · `viewport/tools/compensate.ts` · `panels/draw-order*` · os testes `acoes`, `inclinar`, `documento`, `ordem`, `teclas` |

| Lote | O quê |
|:---:|:---|
| 1 | O lote 1 do plano dele, **como já está em obra**: os 4 erros soltos · Inclinar compensa · renomear pasta avisa antes de fundir · a tecla que cala |
| 2 | **A caça pelo uso.** Abrir o programa e fazer, com a mão, as tarefas da folha `O QUE O PROGRAMA FAZ`, bloco a bloco. Todo erro vai para a lista de defeitos, com o gesto que o provoca |
| 3 | Consertar os da própria cerca. Os de fora sobem ao Planejador, com o nome do dono |
| 4 | As teclas de painel na Ajuda → Atalhos, em seção dobrada (D7) · a janela de descarte própria, no lugar do `confirm()` do navegador |

**Referência:** para o lote 4, como Spine e Spriter mostram a lista de atalhos.

---

## Ficha B — partículas que se acham

| | |
|:---|:---|
| **Janela** | `EXECUTANDO · partículas que se acham` |
| **Fotos** | `backup/fotos-rodada-final/particulas/` |
| **Cerca** | `panels/properties.ts` · `panels/properties-model.ts` · `panels/properties.css` · `viewport/particles-view.ts` · `viewport/viewport-toolbar.ts` · `panels/thumbnail-kind.ts` · arquivo novo para os modelos prontos · os testes `paineis`, `cena` |
| **Não toca** | `panels/tree*` (é do chat D) · `panels/rules*` (é do chat C) |

**O que já existe:** a porta é `Esqueleto → Novo → Emissor de partículas`, e o
`Novo ▾` da Árvore. A cena desenha. A ficha tem nove grupos.
**O Humberto não achou.** É esse o defeito.

**Comece lendo:** `documentos/pesquisa/nova pesquisa/Sistemas de particula - PET Unity Niagara Godot 2026-09-23.md`
e `documentos/planos/ENCARGO as particulas na tela 2026-09-22.md`.

| Lote | O quê |
|:---:|:---|
| 1 | **A porta que se acha.** Um botão em ícone, à vista, que cria o emissor. E **modelos prontos** — fogo, fumaça, faísca, poeira — para que um clique já mostre alguma coisa se mexendo |
| 2 | **A ficha que cabe.** Ela pede 2.736 px e o painel tem 343. Grupos dobráveis, só o essencial aberto |
| 3 | **Os campos que só existem no arquivo** ganham campo na tela: a rajada (`bursts`) e as coordenadas da linha (`shape: edge`) |
| 4 | Pedir ao chat D, pelo Planejador, o que faltar na Árvore |

**Referência:** Unity (Shuriken), Godot (GPUParticles2D), e os editores de
partícula 2D que achar. Spriter, Spine e DragonBones: dizer se têm ou não têm.
Pergunta a responder: **onde fica o botão de criar, e como a ficha se dobra?**

---

## Ficha C — as portas das regras

| | |
|:---|:---|
| **Janela** | `EXECUTANDO · as portas das regras` |
| **Fotos** | `backup/fotos-rodada-final/regras/` |
| **Cerca** | `panels/rules.ts` · `rules-actions.ts` · `rules-model.ts` · `rules-vars.ts` · `rules-physics.ts` · `rules.css` · o teste `regras` |
| **Não toca** | `panels/properties*` (é do chat B). Se a referência mandar a porta para Propriedades, **avise o Planejador antes** |

| Lote | O quê | Função sem porta hoje |
|:---:|:---|:---|
| 1 | Apagar e renomear etiqueta | `DeleteTag`, `RenameTag` |
| 2 | Trocar os ossos de uma IK já feita | `SetRuleChain` |
| 3 | Gravar a chave do alvo no valor de agora | `KeyDriverTarget` |
| 4 | Os doze botões da aba viram um `Novo ▾`, como na Árvore (D9) | — |

**Referência:** Spine (IK constraint, transform constraint, sliders),
DragonBones (IK), Live2D (chave de parâmetro). Spriter: dizer o que tem.

---

## Ficha D — árvore, malha e linha do tempo

| | |
|:---|:---|
| **Janela** | `EXECUTANDO · árvore, malha e linha do tempo` |
| **Fotos** | `backup/fotos-rodada-final/arvore-malha-tempo/` |
| **Cerca** | `panels/tree*` · `panels/mesh-panel*` · `mesh/*` · `viewport/tools/mesh-tool.ts` · `panels/dopesheet*` · `anim/body.ts` · os testes `arvore`, `malha`, `linha-do-tempo`, `chaves` |
| **Não toca** | `panels/properties*` (chat B) · `anim/keying.ts` só importa, não escreve |

| Lote | O quê |
|:---:|:---|
| 1 | **Evento e Parâmetro ganham linha na Árvore.** Hoje nascem pelo `Novo ▾` e somem (D2) |
| 2 | **Tirar a chave de virada de corpo**: `Delete` na chave, e botão direito. Função sem porta: `removeBodyKey` |
| 3 | **O caminho ganha e perde ponto pela cena** |
| 4 | **Malha e pesos cabe**: a aba rola, com os grupos dobráveis (D5) |

**Referência:** Spine (tree, events, path, mesh), DragonBones, Spriter.

---

## Ficha E — arquivo e importar

| | |
|:---|:---|
| **Janela** | `EXECUTANDO · arquivo e importar` |
| **Fotos** | `backup/fotos-rodada-final/arquivo/` |
| **Cerca** | `io/*` · `ui/shell-drop.ts` · os testes `arquivo`, `pasta-do-projeto`, `folha-animada`, `exportar-e-importar` |
| **Não toca** | `ui/shell.ts` e `ui/shell-file.ts` (são do chat A). Precisa? Peça pelo Planejador |

| Lote | O quê |
|:---:|:---|
| 1 | **Importar imagens vira UM passo de desfazer.** Função sem porta: `ImportImagesCommand` |
| 2 | **As etiquetas do Aseprite viram animação**, uma por etiqueta, com aviso no rodapé (D3) |
| 3 | **Usar cada item de importar e exportar do menu Arquivo**, com arquivo de verdade. Erro achado entra na lista de defeitos |

**Referência:** Aseprite (o formato das `frameTags`), Spine e DragonBones
(como importam folha e pasta de imagens).

---

## O fecho de cada lote

| Passo | Quem |
|:---:|:---|
| 1 | O chat roda os testes da parte e o `tsc`. Tira as fotos |
| 2 | O chat avisa o Planejador: "lote N pronto, peço o PODE" |
| 3 | O Planejador dá o **PODE** a um de cada vez, com a casa parada |
| 4 | O chat roda a suíte inteira, o roteiro e a medição. Fecha a versão. Avisa: "fechei a vN.N" |

**Todo vermelho se relata pelo NOME, com dono** (regra 24).

---

## A rodada 2 — ainda não aberta

| O quê | De onde vem |
|:---|:---|
| Trajeto do movimento · grade em perspectiva · breakdown | lote 4 do plano (D4) |
| A limpeza do código morto, 9 sobras | lote 6 do plano (D6) |
| Propriedades e Exibição que não cabem em 1280×720 | `ESTADO.md` |
| O painel Pivôs, que a auditoria não leu | `AUDITORIA POR BLOCO`, bloco 8 |
| O fecho geral: suíte, roteiro, medição, `programa/`, as duas folhas geradas de novo | lote 7 do plano |

---

## Desvios

(vazio — cada chat escreve aqui o que sair diferente do encargo, com o nome dele)

### Planejador, 23:47 — dois arquivos de passagem COM RETIRADA (pedido do chat C)

Conferido no disco: dar porta a uma função obriga a **tirar** a linha dela em dois lugares.

| Arquivo | O que sai |
|:---|:---|
| `editor/src/ui/command-audit.ts` | a linha do comando em `EXEMPT_COMMANDS` |
| `editor/testes/menus.test.ts` (perto da linha 1224) | o nome do comando na lista do teste *"com a lista vazia, ele acusa os seis…"* |

| Quem | Tira só |
|:---:|:---|
| C | `DeleteTag`, `RenameTag`, `SetRuleChain`, `KeyDriverTarget` |
| D | `removeBodyKey` |
| E | `ImportImagesCommand` |

Regras: **só a linha do seu comando**, na mesma volta em que a porta entra · backup antes · reler do disco na hora de gravar · **o teste não se apaga**, e o NOME dele acompanha a conta (se acusa cinco, não diz "seis") · a contagem de testes não cai.

### Chat A, 23:55 — um defeito que não estava no plano: a pilha de desfazer

**A forma:** *a junção olha UM vizinho, e o gesto alterna DOIS comandos.*

| | |
|:---|:---|
| **O gesto** | ligar "Não mexer nos filhos" e arrastar um osso, com Mover, Girar ou Escalar |
| **O estrago** | um arrasto de 4 movimentos do mouse pedia **8** `Ctrl+Z`. De 50 movimentos, 100 |
| **Desde quando** | desde que a compensação existe |
| **Por quê** | cada movimento grava o osso (chave `mover:7`) e depois a compensação (chave `mover:7:filhos`). A pilha só junta com o comando de cima, e o de cima era sempre o outro |
| **O conserto** | `editor/src/doc/undo.ts`, classe `GestureGroup`. A pilha junta num passo só os comandos de chave `K` e `K:algo` |
| **A prova** | `documento.test.ts` (5 casos, comandos de brinquedo) e `inclinar.test.ts` (8 casos: 4 ferramentas, na base e animando) |

**Para os outros chats — leia isto:**

| Se você… | Então |
|:---|:---|
| grava dois comandos no mesmo arrasto | use chave `K` no primeiro e `K:sufixo` nos outros. Eles viram um passo |
| vê um teste de desfazer **mudar de contagem** | o dono sou eu, chat A. Avise pelo Planejador |
| usa chave igual à de outro comando que não se junta sozinho | nada muda: continua sendo passo próprio |

**O teste antigo que dizia "um passo" provava outra coisa** (regra 28).
`eixos-e-chaves.test.ts`, *"a compensação é um passo de desfazer"*, faz UM
movimento e confere só o filho. Passava com dois passos na pilha. Não é da
minha cerca: **não mexi**. Fica avisado.

### Chat A, 23:55 — o que saiu diferente no lote 1

| # | O desvio |
|:---:|:---|
| 1 | **O item 2 foi provado num boneco de três ossos, não no herói.** O braço do herói é posado por IK: inclinar o `arm` não move o `forearm` com a caixa ligada **nem** desligada, e o teste passaria sem provar nada |
| 2 | **Arquivo novo: `editor/src/ui/shell-keys.ts`.** A conta da tecla que cala é módulo puro (regra 8). Cabe na cerca `ui/shell*.ts` |
| 3 | **A frase da tecla encolheu depois da foto.** A primeira tinha 120 letras e quebrava o rodapé em duas linhas. O teste estava verde |
| 4 | **Sem foto do item 2 e da pilha.** A página recarregava sozinha a cada arquivo gravado pelos outros chats, e o arrasto não chegou ao fim. Provado por teste e por sonda. **Peço a foto no fecho, com a casa parada** |
| 5 | **O "antes" das fotos veio do `programa/` montado em 22/09** (porta 5180), e não do código restaurado do `backup/`. Com outros chats gravando, trocar arquivo de lugar era pôr vermelho na tela deles |
| 6 | **`.claude/launch.json` ganhou uma linha**: `editor-5205`. Cópia antes em `backup/`. Os outros chats vão precisar da linha da porta deles |

### Chat E, 23:56 — o lote 1 partia de texto velho (aprovado pelo Planejador)

| O encargo dizia | O código diz |
|:---|:---|
| a pasta entra pelo `setImportedAtlas` solto | ele só é chamado DENTRO do `ImportPsd`, que já é comando |
| ligar o `ImportImagesCommand` | "Importar → Imagens…" saiu no lote 59, por ordem do Humberto: *"no Spriter não existe importar imagens"*. Ligar = desfazer o veto dele |

| O que muda | Como fica |
|:---|:---|
| `ImportImagesCommand` | **não ligo.** É resto antigo; vai para a limpeza da rodada 2 (D6) |
| `command-audit.ts` | troco SÓ o `why` da linha dele: de "falta porta" para "resto antigo" |
| Lote 1 | provar com teste o que o `Ctrl+Z` faz depois de CADA gesto de entrada real (PNG solto, folha do Aseprite, PSD, De outro programa), e consertar o que estiver errado na minha cerca |
| Não mudo | a assinatura de `addImportedItems`, `packImportedStock`, `importedStock`, `restoreImportedStock`, `setImportedAtlas`, `mergedAssets` (o chat B usa) |

Referência: `documentos/pesquisa/nova pesquisa/REFERENCIA arquivo e importar 2026-09-28.md`.

### Chat E, 00:22 — o E1, e a forma dele (decisão P11)

| | |
|:---|:---|
| O defeito | desfazer o "Importar PSD" (substituir) devolve o conteúdo, e `constraints` e `animations` voltam no FIM do arquivo |
| **A forma** | ***o desfazer devolve o VALOR, e não o LUGAR*** — a chave apagada volta com `file[nome] = valor`, e o JavaScript põe chave nova no fim |
| Onde mais | todo `SnapshotCommand` cujo `mutate` APAGA uma chave. A mesma cara do A4 (`shearX: 0`) |
| Quem conserta | `EXECUTANDO · a casca`, no `SnapshotCommand.revert`. **O chat E NÃO remenda o comando do PSD**: dois consertos da mesma forma são dois lugares para quebrar |
| O que o chat E faz | o teste que FALHA hoje, em `arquivo.test.ts`, com o dono no nome |

### Chat E, 04:38 — H1 e H2: o pivô muda e o desenho NÃO anda (decisão P15)

| | |
|:---|:---|
| Trocar a imagem (H1) | o pivô da imagem nova cai onde estava o pivô da velha. O `swapImage` ganha um 5º parâmetro OPCIONAL, `oldRegion`; o chat H o passa nas três chamadas dele |
| Definir pivô (H2) e Repetir o pivô para a pasta | a região ganha o pivô; o desenho que a usa **fica parado**. Quem anda é a cruz |
| **O que alguém vai estranhar daqui a um mês** | depois do Definir pivô, o **Carimbar pivôs** pode dar OUTRO número. Não é defeito: o carimbo lê o pivô do LUGAR do desenho (*"o rig é a verdade"*), e o Definir pivô deixou de mexer no lugar. Antes os dois davam o mesmo número porque o Definir pivô empurrava o desenho até bater. A dica do Definir pivô passa a dizer que o desenho não anda |


---

### Chat J, 29/09/2026, 05:02 — matei pelo nome, e não pelo que eu abri

Ao encerrar o meu servidor do programa montado, achei os processos por **padrão** (`servidor.mjs`) e parei **todos** os que apareceram: eram 6, só 1 era meu. Os outros 5 eram de outros chats de uso, que perderam o servidor (as abas abertas seguiram vivas; recarregar falhava). Ninguém foi avisado antes: o Planejador soube pela minha mensagem depois.

**A forma:** *matei pelo nome, e não pelo que eu abri.* É a mesma coisa que apagar uma pasta pelo padrão do nome em vez de pela lista do que se criou. Vale para processo, arquivo e porta.
**A regra daqui para a frente:** ao abrir um processo, **guardar o PID** na hora (`$!`, ou `Start-Process -PassThru`) e encerrar **só esse PID**. Se o PID se perdeu, listar e perguntar antes de parar qualquer um que eu não reconheça.

### Chat N (`USO · exportar e entregar`), 29/09/2026, 05:02 — listei uma pasta de fora do projeto

**O erro, pela forma:** listei uma pasta de fora do projeto para achar onde o navegador guardava o download, em vez de receber o arquivo por um caminho de dentro. Foi um `ls` na pasta de downloads do Humberto, às ~00:03 de 29/09, logo depois do primeiro GIF exportado. Saiu uma lista de nomes que nada tinham a ver com o projeto.

**Por que aconteceu:** eu tinha um problema de dentro (onde vai parar o arquivo que o programa baixa) e resolvi olhando para fora, em vez de montar a passagem por dentro. A passagem por dentro existia e eu a montei minutos depois: um receptor local que grava em `backup/fotos-rodada-final/uso-exportar/saidas/`. Se eu a tivesse montado primeiro, a pasta de fora nunca entraria na conversa.

**A regra 9 do Humberto** (cada projeto na sua pasta, nem por terminal) vale para o `ls` também, não só para o `cat`. Quando o arquivo "some" para dentro de outro lugar, a pergunta certa é *como o recebo aqui dentro?*, não *onde ele foi parar lá fora?*.

**Estado:** o que li foi só a lista de nomes; não abri, não copiei e não citei nada. Nada foi gravado fora da pasta do projeto.

# A SEGUNDA LEVA — dez chats a mais — 28/09/2026, 23:55

Ordem do Humberto ao Planejador, nas palavras dele:

> *"Abro mais dez chats. Bote cada um para fazer uma coisa. Eu quero dar ênfase
> em que eles têm que olhar na internet o que tem que fazer, para pegar referência."*

> *"O foco é terminar esse programa. Uma coisa não segue a outra. Não tem uma
> sequência de como executar aquela tarefa."*

> *"Quero fazer um arroz. Eu pego uma panela, boto água, boto no fogão, quando a
> água estiver fervendo eu boto o arroz. No programa, eu sinto que não tem
> panela, que não tem arroz, e parece que tudo é programado por baixo dos panos."*

**O alvo da leva é a SEQUÊNCIA de cada tarefa.** Não é função nova. Trajeto do
movimento e grade em perspectiva ficam para depois: o pedido é terminar.

## A régua do arroz

Toda tarefa precisa de três coisas **à vista**. Nenhuma por baixo dos panos.

| No arroz | No programa | O defeito, quando falta |
|:---|:---|:---|
| **A panela** | a ferramenta: o botão, o painel, o menu | **não se acha** |
| **O arroz** | o material: a imagem, o osso, a chave — aparece na tela depois de criado | **criei e sumiu** |
| **A ordem** | terminado um passo, o seguinte está à vista | **a sequência quebra aqui** |
| **A água ferveu** | o programa diz o que aconteceu: rodapé, marca, cor | **fez e não avisou** |

As quatro perguntas, para **cada passo** de cada tarefa:

| # | A pergunta |
|:---:|:---|
| 1 | Achei a ferramenta sem procurar? |
| 2 | O que eu criei apareceu na tela? |
| 3 | O programa disse o que aconteceu? |
| 4 | Ficou óbvio qual é o passo seguinte? |

**A referência manda na ordem:** a fila de passos do **Spriter** primeiro; as
ferramentas do **Spine** encaixadas nela. Achada **na internet**, escrita com link.

> **Sem referência escrita, com link, nada começa.**
> O documento de referência é a PRIMEIRA entrega de cada chat.
> Sem fonte achada, escreva "não achei". Nunca invente o que um programa faz.

## Os dez

| Chat | Janela | Uma coisa só | Porta | Código? |
|:---:|:---|:---|:---:|:---:|
| **F** | `EXECUTANDO · cena e ferramentas` | a sequência de mexer no boneco na cena | 5206 | sim |
| **G** | `EXECUTANDO · animações, prévia e curvas` | a sequência de criar, tocar e ajustar uma animação | 5207 | sim |
| **H** | `EXECUTANDO · imagens e pivô` | a sequência de trazer a arte e marcar o pivô | 5208 | sim |
| **I** | `EXECUTANDO · exibição, peles e histórico` | a sequência de ver, esconder e vestir | 5209 | sim |
| **J** | `USO · do zero ao boneco montado` | usa o programa: pasta, imagens, pivô, ossos, salvar | 5210 | **não** |
| **K** | `USO · animar um ciclo de andar` | usa: abrir animação, chaves, tempo, laço, curva | 5211 | **não** |
| **L** | `USO · malha e pesos` | usa: virar malha, vértices, ligar ossos, pintar pesos | 5212 | **não** |
| **M** | `USO · peles e troca de roupa` | usa: fazer pele, vestir, trocar imagem, trocar no meio da animação | 5213 | **não** |
| **N** | `USO · exportar e entregar` | usa: exportar imagem, folha, GIF, pacote | 5214 | **não** |
| **O** | `PESQUISA · onde fica cada botão` | menu por menu: a ordem dos três programas e a nossa | — | **não** |

## As cercas dos quatro que escrevem código

Com eles, **todo o editor passa a ter dono**.

| Chat | Cerca | Não toca |
|:---:|:---|:---|
| F | `viewport/*`, menos o que está ao lado · os testes `viewport`, `cena-selecao`, `ferramentas` | `tools/shear.ts`, `tools/compensate.ts` (A) · `tools/mesh-tool.ts` (D) · `particles-view.ts`, `viewport-toolbar.ts` (B) · `onion.ts` (I) |
| G | `panels/animations*` · `panels/preview*` · `panels/graph*` · `anim/animations.ts` · `anim/curves.ts` · `anim/transport.ts` · os testes `animando`, `previa`, `curvas`, `tocador` | `panels/dopesheet*`, `anim/body.ts` (D) · `anim/keying.ts` |
| H | `panels/palette*` · `panels/image-picker*` · `panels/image-grid-model.ts` · `panels/pivot-dialog.ts` · `panels/pivot-panel*` · `panels/thumbnails.ts` · os testes `pivo`, `grade-de-imagens` | `io/*` (E): só importa |
| I | `panels/view-panel*` · `panels/skins*` · `panels/history*` · `viewport/onion.ts` · os testes `exibicao`, `peles` | `panels/properties*` (B) |

### O trabalho dos quatro, na mesma ordem

| Lote | O quê |
|:---:|:---|
| 1 | **A referência.** A fila de passos da sua parte no Spriter e no Spine, com link, passo a passo |
| 2 | **A mesma fila no nosso programa**, com foto de cada passo, e as quatro perguntas respondidas |
| 3 | **Consertar onde a fila quebra**, dentro da cerca. Uma versão por conserto que se vê |
| 4 | **Receber os defeitos** que os chats de uso acharem na sua parte. Chegam pelo Planejador |

O que a auditoria de 27/09 já deixou escrito:

| Chat | Já se sabe |
|:---:|:---|
| F | compensação de escala não uniforme é aproximada |
| G | o tocador saiu da aba Animações e ela só lista · a Prévia é sempre um boneco à parte |
| H | o painel **Pivôs nunca foi auditado** · a janela de pivô não tem ajuste fino por teclado |
| I | a aba Exibição não cabe em 1280×720 · `skinGroup()` é resto sem chamada (não apagar: avisar) |

## Os seis que NÃO escrevem código

| Entrega | O quê |
|:---:|:---|
| 1ª | **A referência**: o tutorial oficial achado na internet, com link, passo a passo |
| 2ª | **A sequência**: o mesmo passo a passo feito no nosso programa, com foto de cada passo, e as quatro perguntas respondidas |
| 3ª | **A lista de defeitos**, cada um com o gesto que o provoca e o nome da parte dona |

| O quê | Onde |
|:---|:---|
| A referência e a sequência | `documentos/pesquisa/nova pesquisa/SEQUENCIA <assunto> <data>.md` |
| Os defeitos | `documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, só acrescentando |
| As fotos | `backup/fotos-rodada-final/uso-<assunto>/` |

**Eles não consertam nada.** O Planejador entrega cada defeito ao dono da cerca.

O chat **O** entrega uma tabela por menu: a função · onde fica no Spriter · no
Spine · no DragonBones · onde fica no nosso · **a ordem do nosso menu segue a
ordem do trabalho?** Em `documentos/pesquisa/nova pesquisa/ONDE FICA CADA BOTAO <data>.md`.

### Chat C — lote 1: apagar e renomear etiqueta (28/09/2026)

| # | O que fiz, ou deixei de fora | Por quê |
|:---:|:---|:---|
| 1 | **A porta mora na linha da etiqueta**: duplo clique no nome, o lápis e a lixeira | Modelo do Spine (F2 / duplo clique / Rename e Delete). O Spriter tem etiqueta, e o manual dele não diz como se apaga: "não achei". A etiqueta não tem ficha nem entra em `Selection`, então botão na barra não teria o que apagar |
| 2 | Etiqueta **usada** pergunta antes, com a lista das animações; etiqueta solta sai direto (desfazer traz) | Régua 21: apagar tira o nome de toda chave, e isso não acontece calado |
| 3 | Nome repetido ou vazio é recusado **na janela**, antes do comando | O `RenameTag` recusava pelo rodapé e deixava um passo vazio na pilha de desfazer |
| 4 | **Defeito achado pela foto, na minha cerca, consertado:** a lista não se refazia ao abrir animação nem ao renomear etiqueta. Forma: *acrescentei uma seção à tela e não à assinatura que decide quando a tela se refaz*. A linha dizia "abra uma animação" com uma aberta | Era do degrau 12. Conserto: `varsShape` em `rules-vars.ts`, com teste que prova que a parte velha da assinatura NÃO mudava |
| 5 | **Segundo defeito, escondido pelo primeiro:** "inteira" e "daqui" herdavam 30 px de largura e quebravam letra por letra | Só apareceu quando a lista passou a se refazer. CSS em `rules.css` |
| 6 | Tirei `DeleteTag` e `RenameTag` de `ui/command-audit.ts` e de `menus.test.ts`; o teste passou a se chamar *"…os achados da pesquisa de 18/09 que ainda estão sem porta"* | Autorizado pelo Planejador. O nome antigo dizia "os seis", e a lista já não tem seis (regra 28) |
| 7 | As quatro perguntas do arroz: acha (na linha, com dica) · aparece (a linha se refaz com o nome novo) · diz (rodapé) · passo seguinte (nenhum: o gesto termina ali) | Régua do arroz |
| 8 | Lote 2: o lápis de trocar os ossos entra **na linha da regra escolhida**, na aba Regras | Aprovado pelo Planejador às 23:56. No Spine ele fica em Propriedades, que é do chat B: pedido futuro |

### Chat D — lotes 1 e 2 (29/09/2026, 00:10)

| # | O que saiu diferente | Por quê |
|:---:|:---|:---|
| 1 | **Lote 1: o grupo "Eventos e parâmetros" no FIM da Árvore**, como a suposição dizia. O clique no parâmetro abre a ficha; no evento, escolhe o evento (`chooseEvent`) e deixa a seleção vazia, porque o contrato não tem seleção de evento | Modelo do Spine (nó `Events`). Nenhum campo novo no contrato |
| 2 | **Lote 1 cresceu pela régua do arroz:** o evento e o parâmetro novos nascem escolhidos, o grupo abre, a linha rola até a vista, e o rodapé diz *"criado, no fim da Árvore"* | "Criei e sumiu" é o defeito do lote |
| 3 | **Achado no caminho, consertado na cerca:** `AddEvent`, `AddParameter`, `AddConstraint` e `AddSkin` deixavam `"lista": []` no desfazer. Forma: *criei a lista e não cuidei dela no desfazer*. Vermelho visto antes do conserto (régua 26) | A mesma forma do lote 1 das partículas (22/09). Procurada na casa, achada em quatro |
| 4 | **Lote 2 parte de texto velho.** Medido às 00:05, na tela, porta 5203: colar corpo em 0,50 s → Detalhes → clicar no losango "Virada de corpo" → `Delete` → a chave **sai** (1 → 0). **A porta do `Delete` já existe**, pelo `removeKey` genérico da linha do tempo | O vigia de 21/09 mede "quem chama a função", não "a pessoa consegue fazer". A frase *"quem põe a chave não tem como tirá-la"* não se sustenta (régua 28) |
| 5 | **O lote 2 fica assim:** (a) o botão direito no losango ganha **"Apagar chave"** — hoje só tem Linear, Suave, Parada, Curva…; (b) no losango da virada, o menu mostra **"Tirar a virada de corpo"**, que chama o `removeBodyKey`, e esconde as curvas (a virada só aceita "parada"); (c) o `Delete` da linha do tempo passa a mandar a chave de virada pelo `removeBodyKey` também — uma função, um dono; (d) sai a linha do `removeBodyKey` do vigia e do `menus.test.ts`, como autorizado | O encargo pede "item no botão direito". Apagar o `removeBodyKey` quebraria o `menus.test.ts:1297`, que o usa de exemplo de "mutador" |
| 6 | **Achado para depois, sem conserto:** a linha "Virada de corpo" só aparece com **Detalhes** aberto. Com a linha do tempo em "Resumo", quem cola o corpo não vê a chave dele | Régua do arroz, pergunta 2. É da minha cerca (`dopesheet*`): proponho abrir os Detalhes sozinho no "Colar corpo aqui". Espero a palavra do Planejador |
| 7 | **A régua, pela forma:** *o vigia mede quem CHAMA a função, não se a PESSOA consegue fazer*. O `removeBodyKey` não tinha chamador, e a chave saía mesmo assim, por outra função (`removeKey`), com o `Delete`. O contrário também vale: função chamada não prova gesto achável (é o "tem porta não é se acha" da régua 2). **Antes de dar porta a uma "função sem porta", faça o gesto na tela** | Achado medindo, 29/09 00:05. Vale para quem pega os outros itens da lista do vigia |
| 8 | **Aprovado (P9):** (a) a (d) do item 5, e o item 6. O item 6 esbarra na cerca: o "Colar corpo aqui" e o abrir Detalhes são da casca. Proposta ao Planejador: um id `mostrar-chave`, registrado pela linha do tempo, que cada dono chama depois de criar a chave dele | Medido: com Detalhes fechado, a linha do tempo não desenha linha nenhuma, só o Resumo (o losango aparece; o nome não) |
| 9 | **O modelo do `revealKey` (P12), para a próxima função desse tipo:** a porta mora na BASE (`anim/keying.ts`) e é um **gancho registrado** — a linha do tempo (degrau 3) chama `onRevealKey` ao montar, e quem cria a chave chama `revealKey(ref)` de qualquer degrau, sem `import` para cima; sem ninguém escutando, espera UM pedido (o mais novo troca o velho) e devolve `false`. `fronteiras.test.ts` verde às 05:08 | Função, não ação de menu: não tem gesto próprio, e ação sem item de menu põe a casa em vermelho |

---

# O DIÁRIO DO PLANEJADOR

Só se acrescenta. Decisão tomada pelo Planejador, com a palavra do Humberto
(29/09, 00:02): *"Não esperem uma resposta minha. Você pode decidir e aprovar."*

## 29/09/2026, 00:04 — a janela de fecho 1

| O quê | |
|:---|:---|
| Parados, por escrito | os nove: A, B, C, D, E, F, G, H, I |
| Casa conferida no disco | 00:01:54 — último arquivo gravado em `editor/`: 23:59:03 |
| **O chat A foi arquivado** às 00:02, antes de receber o PODE | o lote 1 dele está inteiro no disco e **não foi medido por ele** |
| Fila | **C** (fecha o lote 1 do A e o dele, duas versões) → **D** (fecha o dele e monta o `programa/`) |
| Ficam para a janela 2 | B (faltam os ids de ação e a cor) · E (faltam as fotos) |
| Quem assume a parte do A | chat novo, `EXECUTANDO · a casca` (ficha aberta às 00:04) |

## Decisões do Planejador

| # | Decisão | Por quê |
|:---:|:---|:---|
| P1 | Os chats de **USO** usam o `programa/` montado, cada um na sua porta: `PORTA=531x node programa/servidor.mjs --sem-navegador` | o modo de desenvolvimento recarrega a página a cada gravação dos outros (achado do chat A) |
| P2 | `ui/dialog.ts` e `ui/dialog.css` entram na cerca da casca | a barra marrom vazia (A1) não tinha dono |
| P3 | O `ImportImagesCommand` **não** ganha porta | o Humberto vetou "Importar imagens" no lote 59. É resto; vai para a limpeza |
| P4 | O lápis de trocar os ossos da regra entra **na linha da regra**, na aba Regras | modelo do Spine, posto onde a cerca deixa |
| P5 | Os modelos de partícula ganham **id de ação**, menu e busca | botão sem id não aparece no menu: seria o mesmo defeito em lugar novo |
| P6 | O bloco **Compensar** só aparece quando há o que compensar; senão, a ficha do escolhido vem primeiro | achado duas vezes (emissor e parâmetro): a ficha caía abaixo da borda |
| P7 | O chat B conserta a **cor da partícula** em `runtime/src/render/canvas.ts`, só na função `drawParticles` | a partícula sai branca; o `runtime/` não tinha dono. Remendo de imagem já pintada **recusado**: mudar a cor na ficha não mudaria a tela |
| P8 | Na janela de pivô, setas = 1 px e Shift+setas = 10 px | como o Spine; o Spriter não documenta |
| P9 | (29/09/2026, 00:09) A chave de virada de corpo: "Apagar chave" no botão direito de TODO losango; a virada sai pelo `removeBodyKey`, no botão direito e no `Delete`; "Colar corpo aqui" abre os Detalhes e deixa a chave nova escolhida | o chat D mediu na tela que o `Delete` já tirava a chave: o vigia mede **quem chama a função**, não se a pessoa consegue. E a chave nascia numa linha fechada — "criei e sumiu" |
| P10 | (29/09/2026, 00:10) A cor da partícula segue a §9.7 da spec (multiplica, pela fórmula da §7.12), pelo MESMO `applyTint` do desenho comum. Se pesar, o `applyTint` ganha um retângulo como parâmetro **opcional**; quem já chama não muda | a spec responde, não há o que decidir. O retângulo fica pré-autorizado para o chat B não parar; a medição vai escrita, com número |
| P11 | (29/09/2026, 00:14) **O desfazer devolve o VALOR, e não o LUGAR**: o conserto é geral, no `SnapshotCommand.revert` (`doc/commands.ts`), e é da casca. O chat E escreve o teste que falha; não faz remendo local | achado do chat E (E1). Dois consertos para a mesma forma viram dois lugares para quebrar |
| P12 | (29/09/2026, 00:14) Ação nova **`mostrar-chave`**, registrada pelo chat D: abre os Detalhes, escolhe a chave, rola até ela. Cada dono a chama com uma linha depois de criar a sua chave | com os Detalhes fechados, a chave nova nasce sem nome à vista: "criei e sumiu" |
| P13 | (29/09/2026, 00:14) **Nenhum chat abre janela do Windows** (Salvar como, Abrir, Escolher pasta). Passo de arquivo: Chrome sem janela, por script, com os seletores trocados, pelo modelo do `roteiro-30.mjs` | ordem do Humberto: *"Eu não vou poder passar a noite apertando o OK"* |
| P14 | (29/09/2026, 00:14) Lote 3 do chat G aprovado: a lista de animações rola e a nova nasce à vista · duplo clique renomeia · botão direito no nome · a Prévia abre com a animação aberta · Curvas diz por que está vazia | sete quebras medidas com clique de verdade, 16 fotos |
| P15 | (29/09/2026, 00:14) **O pivô**: trocar a imagem = o pivô da nova cai onde estava o da velha; acertar o pivô = a imagem fica parada, quem anda é a cruz. Vale igual para desenho solto e preso a osso. Conserto do chat E (H1, H2) | achado do chat H com foto: trocar pulava 12 px, acertar o pivô teletransportava o desenho. Modelo do Spriter |
| P16 | (29/09/2026, 00:14) Setas = 1 px, Shift+setas = 10 px, para o escolhido na cena (chat F, H3) e na janela de pivô (chat H) | Spriter e Spine fazem; o nosso não fazia |
| P17 | (29/09/2026, 00:23) O defeito A3 (rascunho trocado por um vazio) é da casca, que escreve em `ui/shell-drop.ts` só na função `armUnloadGuard` | a função é de casca e mora em arquivo do chat E. A3 é velho: está no montado de 22/09 |
| P18 | (29/09/2026, 00:23) Animação NOVA nasce com Repetir ligado (chat G) | achado K6: no ciclo de andar, é o primeiro erro de quem usa. O Spriter nasce em laço |
| P19 | (29/09/2026, 00:23) **A DICA DO PASSO SEGUINTE.** O rodapé, que já diz onde se está, passa a dizer o passo seguinte, com o caminho de clique. Módulo puro `ui/next-step-model.ts`, da casca. A ordem dos passos vem da fila do Spriter escrita pelos chats J e K. Desliga-se em Preferências | é o pedido central do Humberto: *"não tem uma sequência de como executar aquela tarefa"*. Achados K4 e K6 |
| P20 | (29/09/2026, 00:23) `anim/keying.ts` passa a ser do chat D | não tinha dono, e o defeito K15 (a troca de imagem vale antes do quadro) mora nele |
| P21 | (29/09/2026, 00:23) Escolher não troca de ferramenta: clicar numa malha que já existe não liga a ferramenta Malha (chat F, K11). "Colar espelhado" aparece ao lado de Colar, e diz quando não acha o par (chat D, K5) | achados do chat K, com foto |
| 9 | **Fecho, 29/09 00:11:** o roteiro caiu no passo 14 duas vezes. Não era arquivo: era TEMPO, com a CPU a 100%. Achado com uma cópia do roteiro fora da pasta, que espera mais e imprime quanto demorou (11 a 41 s contra 5 s). Nenhum arquivo foi trocado. A forma: *medi com a casa parada de gravar, e não parada de rodar*. Defeito C1 na lista | Decisão P22 do Planejador: "casa vazia" inclui processo |
| P22 | (29/09/2026, 00:25) **Casa vazia inclui PROCESSO.** Para fechar, cada chat para os seus Vite, `programa/servidor.mjs`, Chrome sem janela e scripts. Fora do fecho: um servidor por chat, e o Chrome fecha ao fim de cada leva de fotos | achado do chat C: o passo 14 do roteiro caiu por TEMPO, com a CPU a 100% (9 Vite, 6 servidores, 56 Chrome). Abrir a pasta levou 40,9 s; o roteiro espera 5 s. Nenhum arquivo era culpado. A forma: *medi com a casa parada de gravar, e não parada de rodar* |
| P23 | (29/09/2026, 00:25) As ações de ver, travar e cebola são registradas no ARRANQUE (chat I): o grupo `exibicao` de `ui/actions-table.ts` passa de `'painel'` para `'arranque'` | achado I3: fechar a aba Exibição matava, calado, o botão "Ver ossos" do alto e o menu Exibir |
| P24 | (29/09/2026, 00:25) `panels/quick-model.ts` e `quick-sheet.css` passam a ser do chat B. A ficha rápida mostra o valor DO QUADRO, com a base ao lado em cinza | achado K8, medido pelo B: a ficha *escreve no quadro e mostra a base* |
| P25 | (29/09/2026, 00:25) A casca conserta o nome do exemplo em `main.ts` (`path: 'heroi.bone'`) e troca o `confirm()` de `ui/shell-drop.ts` pela janela da casa | achado A2: o nome saía `heroi-DUlefYnW.bone` porque o endereço vem carimbado pelo empacotador |
| P26 | (29/09/2026, 00:26) O lote 2 do chat D sai em duas versões: **2a, as chaves** (K15, `mostrar-chave`, botão direito do losango, a frase da chave no rodapé) e **2b, o uso** (colar espelhado, a ferramenta que não muda sozinha, o olho da Árvore, a cebola). No colar espelhado, `/_b` entra no padrão de nomes e o rodapé diz os sem par | era muito para uma versão. O herói usa `leg`/`leg_b`, que o padrão não conhecia |
| P27 | (29/09/2026, 00:26) **Trocar a imagem grava na pele DO LÁPIS, sempre** — na grade, em "Usar no desenho escolhido" e no botão direito na cena. O rodapé diz em qual pele gravou (chat H) | achado por três chats (M2, I-O2): com o lápis aceso a troca ia para a base, e a pele ficava com 0 desenhos. É o coração do vestir |
| P28 | (29/09/2026, 00:26) A forma **"a ação mora no painel, a porta mora no menu"**: todo item de menu cuja ação é registrada por um painel que FECHA passa a valer com o painel fechado. Donos: D (buscar, renomear), casca (nova pasta), G (as quatro da animação), C (física, variáveis e etiquetas), I (exibição, importar pele) | tabela do chat I, lida de `actions-table.ts` contra `menus.ts`. É a camada 2 de 22/09, que voltou |

## 29/09/2026, 00:26 — a janela de fecho 1, segunda medição

| O quê | |
|:---|:---|
| Processos parados, por escrito | os 14 chats |
| Conferido pelo Planejador, 00:25:57 | nenhum `node.exe`, zero Chrome sem janela, nenhuma porta de 5170 a 5400, CPU 44% |
| Chat C | medindo de novo |

### Chat I, 29/09/2026, 04:32 — a ação mora no painel, a porta mora no menu (I3, decisão P23)

**A forma:** *a ação mora no painel, a porta mora no menu; fechado o painel, a porta fica e a ação some.*

Achado na fila do lote 2: fechar a aba Exibição mata o botão **Ver ossos** do alto e o menu Exibir, sem aviso. Medido: `ver-ossos`, `esconder-escolhido` e `ver-cebola` saem do registro quando a aba fecha. A tecla `7` continua valendo por outro caminho.

**Onde mais.** Grupos `where: 'painel'` de `ui/actions-table.ts` cujos ids aparecem em `ui/menus.ts`. Só conta aba que fecha: a cena e a faixa da linha do tempo nunca desmontam.
**Não medi um por um com a aba fechada; é leitura da tabela contra `menus.ts`.**

| Grupo | Dono | Item de menu que morre com a aba fechada |
|:---|:---:|:---|
| `exibicao` | I | os 26 (ver, travar, cebola, esconder, só este…) — **conserto do chat I, lote 3** |
| `peles` | I | `importar-pele` — **conserto do chat I, lote 3** |
| `arvore` | D | `buscar` (Ctrl+F), `renomear` (F2) — Editar |
| `ordem` | casca | `nova-pasta` — Esqueleto |
| `animacoes` | G | duplicar, renomear, apagar animação, mandar para o topo — Animação |
| `regras` | C | `fisica`, `variaveis-e-etiquetas` (submenus) — Esqueleto |

O conserto do chat I: registrar no **arranque**, num arquivo novo `panels/view-panel-actions.ts`, e trocar `'painel'` por `'arranque'` só nas linhas dos grupos `exibicao` e `peles`. A chamada entra em `ui/register-actions.ts`, **só acrescentando** uma linha.
| P29 | (29/09/2026, 04:33) **O projeto de verdade do Spriter entra visível.** O chat E liga as imagens soltas e faz o arrasto de pasta descer nas subpastas; a casca faz o `Abrir pasta…` oferecer o `.scml` que achar. 176 avisos iguais viram um, com a contagem | achados E2 e E3: `exemplo/game` entrava com 176 avisos, 0 atlas e o boneco invisível. O modelo do Humberto é o Spriter |
| P30 | (29/09/2026, 04:34) `ui/prefs.ts` passa a ser da casca, que acrescenta a preferência `nextStep` (a dica do passo seguinte, ligada por padrão) | o arquivo era de um chat de 18/09, já fechado |
| P31 | (29/09/2026, 04:34) `anim/efeitos.ts` e `anim/timeline-tools.ts` passam a ser do chat D. O **tremor** começa parado: a 1ª chave leva o valor de base | achado do chat D, a mesma forma do K15: numa linha nova, o osso ficava deslocado desde o começo da animação |
| P32 | (29/09/2026, 04:34) **"Pesos automáticos" liga a vista dos pesos**, e o rodapé diz quantos vértices ganharam peso e de quais ossos (chat D) | achados L1 e L2: depois do clique a cena não mudava; os pesos só se viam ligando um ícone que o painel não citava |

## 29/09/2026, 04:34 — a casa ficou parada quatro horas

| O quê | |
|:---|:---|
| Conferido no disco, 04:33 | último arquivo de código: 28/09, 23:59:03. Última versão: a v22.8, de 22/09. `programa/` de 22/09 |
| O que houve | entre 00:27 e 04:30 nenhum chat andou. **Nada fechou e nada se perdeu**: tudo o que estava escrito continua no disco |
| A casca | voltou com endereço novo (ref `5e8aa5`) |
| A casa | **continua fechada**. O chat C mede; o chat D é o próximo |
| P33 | (29/09/2026, 04:37) **A ORDEM DOS MENUS**, pelas propostas do chat O (`ONDE FICA CADA BOTAO 2026-09-29.md`, parte D). As cinco bandeiras decididas: (1) Exportar num lugar só, `Arquivo → Exportar ▸` · (2) a aba Malha e pesos vai para junto de Imagens e Pivôs, **só no arranjo de fábrica**; a arrumação guardada pelo Humberto não muda · (3) botão Prévia na barra de ações · (4) rótulo "Base — montar" na aba Animações · (5) a barra vira Arquivo · Editar · Esqueleto · Animação · Exibir · Janela · Ajuda. Malha, pivô, peles e "No fim" ganham id de ação e item de menu. A reordenação é UM lote da casca, numa janela só dela, depois de a lista final ser conferida | o Humberto: *"tem muita coisa que não aparece no menu"* e *"uma coisa não segue a outra"*. A ordem segue o trabalho, pelo Spriter: arte → pivô → cena → ordem → ossos → animar → peles → exportar. **Tudo se desfaz voltando a versão** |
| P34 | (29/09/2026, 04:37) O chat O passa a manter `documentos/planos/FILA dos defeitos 2026-09-29.md`: uma linha por defeito, com o chat dono, os achados repetidos juntos e o estado. Os donos avisam o fecho direto a ele | a lista de defeitos passou de cem linhas, com dono em texto livre. Ninguém via a fila inteira |
| P35 | (29/09/2026, 04:37) Em `ui/actions-table.ts`, cada dono pode passar os ids **do seu grupo** de `'painel'` para `'arranque'`. Só a linha dos seus; backup antes; relendo do disco. A prova é um teste com a aba FECHADA | é a P28 posta em obra. Pedido do chat G: mover é retirar, e retirar de arquivo de passagem pede autorização |
| P36 | (29/09/2026, 04:38) Quem troca um `confirm()` ou `prompt()` do navegador pela janela da casa **ensina a prova a apertar o botão novo, no mesmo lote**. A casca pode escrever em `roteiro-30.mjs` e `medir-paineis.mjs`, só no trecho que responde janelas | previsto pelo chat E antes de quebrar: o roteiro responde as janelas pelo CDP, que só vê janela do navegador. Trocada a janela, o passo 14 ficaria esperando até estourar o tempo |
| P37 | (29/09/2026, 04:38) `ferramentas/provas/tarefas.ts` passa a ser arquivo de passagem: quem cria id de ação acrescenta ali o nome da tarefa, na língua do Humberto | toda ação nova precisa de nome de tarefa, senão o teste da folha fica vermelho. Os chats vão criar dezenas de ids (malha, pivô, peles, partículas) |
| P38 | (29/09/2026, 04:39) Na barra da cena, a **ferramenta escolhida** mostra a palavra ao lado do ícone, e o botão **Partículas** mostra a palavra sempre. O resto continua em ícone, com o nome na dica; `toolNames` não é ligado de fábrica (chat B) | achados J12 e L1: a dica existe nos 26 botões; o que falta é o nome à vista. Modelo do Spine. A regra do Humberto (botão em ícone) fica de pé |
| P39 | (29/09/2026, 04:39) **O passo 14 do roteiro caía por uma espera curta demais.** O chat C alarga a espera de 5 s para 30 s em `roteiro-30.mjs`, só no passo 14, sem mudar o que ele prova, e fecha com 14 de 14. "Abrir pasta leva 5 segundos" vira defeito do chat E | medido com a casa vazia: hoje 4,6 e 5,3 s; a **v22.8, desempacotada, 5,3 e 6,2 s**. Não há piora. O limite sempre esteve na beira, e em 22/09 passou por sorte do relógio. Regra 24: conserta-se pelo tempo, nunca encurtando a prova |
| P40 | (29/09/2026, 04:39) O `armFileDrop` ignora todo arrasto de dentro do programa (tipos `text/x-recorte-*`) (chat E) | achado J5: soltar a miniatura na cena dava erro falso. Duas mãos tratavam o mesmo soltar. Vale para imagem, entidade e pele |

## 29/09/2026, 04:39 — a medição do chat C, com a casa vazia

| Prova | Hora | Resultado |
|:---|:---:|:---|
| suíte | 04:32 | **4.268** · 4.238 verdes · 29 pulados · 1 vermelho (o do manual, de 15/09) |
| `tsc` | 04:34 | limpo |
| conformidade | 04:34 | 87 de 87 |
| roteiro | 04:35 | 13 de 14 — passo 14, pela espera (P39) |
| medição | 04:39 | 28 de 28 de lado · 19 de 28 de altura |

Eram 4.182 testes na linha de base de 28/09: **86 testes novos, nenhum apagado**.
| P41 | (29/09/2026, 04:40) **`ui/menus.ts` passa a ser só da casca.** Os donos registram o id em `ui/actions-table.ts` e o nome da tarefa em `ferramentas/provas/tarefas.ts`, e dizem à casca o submenu. A reordenação (P33) é o primeiro lote da casca depois da "casa livre". Lista conferida: `documentos/planos/A ORDEM DOS MENUS 2026-09-29.md`. Respostas: "Nova animação" fica à vista, fora do submenu · "Novo evento" muda para Animação · Importar pele e Importar animação vão para `Arquivo → Importar ▸`, espelhando o Exportar | reordenar não é acrescentar, e quinze mãos no mesmo arquivo de menu dariam conflito a cada lote |
| P42 | (29/09/2026, 04:41) **Passagem com SOMA.** Em teste que CONTA ações (`acoes.test.ts`: 43 de arranque; a folha: 214), ninguém grava número absoluto tirado do rascunho: lê o número que está no disco, soma o seu delta, grava, e deixa um comentário dizendo de onde vem o pedaço | aviso do chat I antes de gravar: o I3 leva 27 ações ao arranque, e os chats C, D, G, H, B e a casca mudam a mesma conta. Quem fechar por último somaria errado |
| P43 | (29/09/2026, 04:42) A janela do **salvar com avisos** é da casca, pelo gancho que já existe: `saveDocument(doc, { confirmProblems })`. O chat E exporta `problemsQuestion`, com todos os avisos. `io/` não importa `ui/` | **erro do Planejador, corrigido pelo chat E.** A forma: *mandei importar sem olhar o degrau*. `io/` é degrau 2 e `ui/` é degrau 3; o `fronteiras.test.ts` ficaria vermelho |
| P44 | (29/09/2026, 04:42) `ferramentas/provas/` passa a ser do chat C. Depois das regras, ele varre as esperas na beira e transforma as cinco sequências dos chats de uso em provas que rodam sozinhas | a pasta não tinha dono, e o defeito C1 (a espera de 5 s) mora nela. A folha tem 6 ações provadas de 214 |

## 29/09/2026, 04:42 — a fila única está no disco

`documentos/planos/FILA dos defeitos 2026-09-29.md`, mantida pelo chat O.

| Medida | Número |
|:---|---:|
| Defeitos, já juntados os repetidos | **100** |
| Abertos · a medir · fechados | 88 · 12 · 0 |
| Com decisão do Planejador | 37 |
| **Por tipo** | fez e não avisou 26 · deu erro 25 · não se acha 23 · a sequência quebra 18 · criei e sumiu 8 |
| **Por dono** | casca 21 · D 19 · E 18 · I 15 · F 11 · B 6 · G 6 · H 3 · C 0 |
| P45 | (29/09/2026, 04:43) A parte **Casca e menus** se divide em duas. A casca fica com menus, janelas, arquivo e documento. Um chat novo, `EXECUTANDO · a tela que cabe` (chat P, porta 5216), fica com tamanho e lugar na tela: `ui/shell.css`, `layout-model.ts`, `panel-groups.ts`, `action-bar-model.ts`, `toolbar-model.ts`, `arrangements.ts`, `panels/panels.css`, `dock-model.ts`. Vale quando ele assinar a tabela | a fila deu 21 defeitos à casca, mais os menus e a dica do passo seguinte. Era o gargalo da rodada |
| P46 | (29/09/2026, 04:51) Não se mexe no `runtime/` por causa de texto. O **editor traduz** os avisos conhecidos do leitor antes de mostrar; o que não conhece, mostra como veio, dizendo que veio do leitor (casca, prioridade baixa). Os oito donos em dúvida da fila foram decididos de uma vez, e o chat P entrou nela | achado M12b: a frase `does not exist; ignored` vem de `runtime/src/loader.ts`, sem dono. O runtime é o leitor de referência, lido por quem não fala português |
| P47 | (29/09/2026, 04:52) A casca reescreve, no mesmo lote da reordenação dos menus, os **13 testes** que procuram um item no lugar antigo — 10 deles de outros donos (G 4, E 5, I 1). Só a parte que diz ONDE o item fica; nenhum apagado nem encurtado; o nome passa a dizer o lugar novo; tabela do antes e depois nos Desvios | a casca mediu a cópia de FORA da casa antes de gravar: 23 arquivos de teste, 13 vermelhos novos, todos de lugar ou de nome, nenhum de função. A alternativa deixaria a casa vermelha entre um dono e outro |

## 29/09/2026, 04:53 — AS PRIMEIRAS VERSÕES DA RODADA

| Versão | Fechada por | O que entrou |
|:---:|:---|:---|
| **v22.9** | chat C, às 04:52 (o código é do chat A) | os 4 erros soltos do teste de ações · **Inclinar compensa** · renomear pasta **avisa antes de fundir** · a tecla que cala · **um arrasto = um `Ctrl+Z`** |
| **v23.0** | chat C, às 04:52 | **apagar e renomear etiqueta**, na aba Regras |
| v23.1 | chat D, medindo desde 04:53 | Evento e Parâmetro ganham linha na Árvore. Monta o `programa/` |

Conferido no disco pelo Planejador, 04:52:58: os dois zips, 40,8 MB cada; casa vazia.
Roteiro **14 de 14**, três vezes seguidas, com a espera de 30 s.

**Aviso honesto do chat C:** às 04:41, já com 30 s, houve **uma** queda do passo 14, sem causa achada e sem a frase guardada. Depois, 3 roteiros e 8 sondas, todos limpos. Fica como defeito intermitente, dono chat C: a prova passa a guardar a frase, a foto e o tempo de cada passo em toda queda.
| P48 | (29/09/2026, 04:54) O **"Mais ▾"** da barra de ações é inteiro do chat P: a conta na cerca dele, a função em `viewport/viewport-toolbar.ts` (chat B) e as regras em `viewport/viewport.css` (chat F), só esses trechos. O chat B grava primeiro; o P entra depois do "fechei o lote 1" dele. A barra deixa de rolar de lado | um dono só para o gesto inteiro. A regra do Humberto: nenhum painel rola de lado |
| P49 | (29/09/2026, 04:57) Teste que confere uma lista inteira (`toEqual`) **continua conferindo a lista inteira** quando a lista muda: troca-se a lista, não o tipo da prova. O chat P troca a linha 363 de `ordem.test.ts` pela lista nova do grupo 1 e acrescenta um teste irmão para o grupo 2, sem a malha | o pedido era trocar por `toContain`. Isso deixaria passar uma aba a mais, a menos, ou fora de ordem: seria afrouxar a prova para caber a mudança |
| P50 | (29/09/2026, 04:57) O grupo 1 da direita, no arranjo de fábrica: **Imagens · Entidades · Pivôs · Malha e pesos · Exibição · Prévia**. Primeiro o que monta, depois o que olha — a mesma ordem do bloco "montar" do menu Janela. O chat P mede se a tira de seis abas quebra em duas linhas | proposta da casca, para as duas listas contarem a mesma história. Em 13/09 uma tira de três abas quebrou por 20 px e custou 33 px à Prévia |

## 29/09/2026, 04:58 — A JANELA DE FECHO 1 FECHOU. CASA LIVRE

| Versão | Fechada por | O que entrou |
|:---:|:---|:---|
| v22.9 | chat C, 04:52 | o lote 1 do chat A |
| v23.0 | chat C, 04:52 | apagar e renomear etiqueta |
| **v23.1** | chat D, 04:58 | **Evento e Parâmetro ganham linha na Árvore.** `programa/` montado, 61 arquivos |

| Prova, medida pelo chat D com a casa vazia | Hora | Resultado |
|:---|:---:|:---|
| suíte | 04:55 | 4.268 · 4.238 verdes · 29 pulados · 1 vermelho (o do manual) |
| `tsc` | 04:55 | limpo |
| conformidade | 04:55 | 87 de 87 |
| roteiro | 04:56 | **14 de 14** |
| medição | 04:56 | 28 de 28 de lado · 19 de 28 de altura |

Conferido no disco pelo Planejador, 04:57:58: o zip da v23.1, o `programa/` com `LEIA-ME` dizendo v23.1, nenhum processo vivo.

| # | Decisão | Por quê |
|:---:|:---|:---|
| P51 | **Como se fecha daqui para a frente.** A casa abre e fecha por JANELA, com hora marcada. Na janela, todos param de gravar e de rodar; **um só mede** (o chat C, dono das provas), uma vez, para a casa inteira; fecha-se **uma versão por janela**, com uma seção no `CHANGELOG` por lote, cada uma com o nome do dono. A próxima janela é às **06:30** | a janela 1 custou cinco horas: cada chat media por sua vez, e quinze esperavam. Medir uma vez e fechar uma versão dá o mesmo retrato do disco, e a casa fica fechada minutos em vez de horas |
| P52 | **A ordem de gravar na casa livre.** Cada chat grava já nos arquivos da SUA cerca. Nos arquivos de passagem (`actions-table.ts`, `register-actions.ts`, `keys.ts`, `icons.ts`, `tarefas.ts`, `acoes.test.ts`), **a casca grava primeiro**, com a ordem nova dos menus; os outros só tocam neles depois do aviso "menus gravados" | a reordenação mexe nos mesmos arquivos em que todos vão acrescentar. Quem acrescenta sobre a ordem velha perde a linha |

### Chat A2 (`EXECUTANDO · a casca`), 29/09/2026, 05:07 — a ordem dos menus (P33, P41, P47)

Gravado às 05:00, na "casa livre", numa volta só. A lista: `documentos/planos/A ORDEM DOS MENUS 2026-09-29.md`.

**Os testes reescritos (P47).** Só a parte que diz ONDE o item mora. Nenhum apagado, nenhum pulado.

| Arquivo | Nome antes | Nome depois | Dono |
|:---|:---|:---|:---:|
| `menus.test.ts` | tem sete menus, nesta ordem | tem sete menus, nesta ordem: Exibir depois de Animação | casca |
| `menus.test.ts` | um separador não é uma entrada: ele não tem nome nem ação | (igual; a conta dos filhos passou de 6 para 15, com comentário) | casca |
| `acoes.test.ts` | toda ação dos sete menus está nela… | (igual; a conta subiu +4 sobre o disco, P42) | casca |
| `animando.test.ts` | está no menu, com a ação do painel | está no menu, em Animação → Animações ▸, com a ação do painel | G |
| `animando.test.ts` | em Montagem fica cinza, e a dica diz por quê | (igual; o ajudante `itens` passou a usar `flatEntries`) | G |
| `animando.test.ts` | os dois itens estão no menu Animação, com a dica dizendo o que fazem | os dois itens estão em Arquivo → Exportar ▸ e Importar ▸, com a dica dizendo o que fazem | G |
| `animando.test.ts` | o gesto é UM id, no dono `animacoes`, e um item de menu (regras 17 e 12) | … e um item de menu em Animação → Animações ▸ (regras 17 e 12) | G |
| `exportar-e-ajuda.test.ts` | "Arquivo" offers glTF as the first thing inside "Exportar" | "Arquivo" offers glTF inside "Exportar", named for what it is for | E |
| `exportar-por-pele.test.ts` | "Exportar" oferece "Por pele…", logo depois de "Imagem…" | "Exportar" oferece "Uma imagem por pele…", logo depois de "GIF, PNG, folha, vídeo…" | E |
| `pasta-do-projeto.test.ts` | ganhou Abrir pasta…, logo depois de Abrir… | ganhou Abrir pasta…, no primeiro item do bloco da pasta, depois dos "abrir" | E |
| `pasta-do-projeto.test.ts` | Importar → Imagens… saiu, e o submenu ficou com três | Importar → Imagens… saiu, e o bloco da arte do submenu ficou com três | E |
| `peles.test.ts` | a porta: botão direito da Árvore e menu Esqueleto | a porta: botão direito da Árvore e menu Esqueleto → Peles ▸ | I |

**O que saiu diferente:**

| # | Desvio | Por quê |
|:---:|:---|:---|
| 1 | Entidades ficou **colada em Imagens** no bloco montar do menu Janela (o c4 dizia Imagens · Pivôs · Entidades) | cumpre a promessa E15 do degrau 5 em vez de reescrever o teste dela. Aprovado (P50) |
| 2 | "Imagens: GIF, PNG, folha, vídeo…" virou **"GIF, PNG, folha, vídeo…"** | a auditoria da casa recusa mais de 28 letras |
| 3 | `animating` saiu de `EditMenuState` e virou parâmetro opcional do `editMenu` | o `tsc` da casa acusou às 05:01: dentro de `MenuState` ele brigava com o `animating` obrigatório de Animação. A cópia medida fora não tinha passado pelo `tsc` — **o meu erro, pela forma: medi os testes da cópia e não o tipo dela** |
| 4 | Horas erradas no documento dos menus ("05:04", "05:05") | escrevi sem olhar o relógio (regra 20). Corrigidas às 05:06 |

## 29/09/2026, 05:07 — os menus novos estão no disco

| O quê | |
|:---|:---|
| Gravado pela casca | 05:00 — `ui/menus.ts`, `ui/actions-table.ts` e 12 testes reescritos (só o lugar do item) |
| Medido na casa, 05:03 | os 23 arquivos que leem os menus. `tsc` limpo nos arquivos dela |
| Arquivos de passagem | **livres para os outros nove**, desde 05:05 |
| Vermelhos de casa em obra, pelo nome | `menus` (4 ações do chat H sem tabela nem menu) · `acoes` ×2 e `peles` ×4 (chat I) · `animando` ×1 (chat G) · `tsc` em `grade-de-imagens.test.ts` (chat H) · o do manual. **Todos avisados aos donos** |

| # | Decisão | Por quê |
|:---:|:---|:---|
| P53 | **A régua do `tsc` com dez gravando**: cada chat responde pelos erros dos SEUS arquivos. Erro em arquivo de outro dono só vira aviso se o arquivo estiver parado há mais de cinco minutos | dois minutos depois da casa abrir, o chat E viu o `tsc` vermelho em `menus.ts`: era a casca no meio do lote. Sem a régua, cada gravação acende vermelho em nove telas |
| P54 | **Ação nova entra inteira, no mesmo minuto**: o registro, a linha na tabela, o nome da tarefa e o aviso à casca para o item de menu | o chat H registrou quatro ações antes da tabela e do menu, e o teste "toda ação registrada aparece em menu" ficou vermelho na casa inteira |
| P55 | O rascunho deixa de ser um só: havendo um rascunho recusado e não apagado, o novo **não grava por cima**. O programa guarda os dois, e a janela de recuperar mostra os dois, com a data (casca, depois do P19) | achado da casca no conserto do A3. Nada que o Humberto fez se perde sem ele mandar |

### Chat C — lote 2 (trocar os ossos) e o P12 (29/09/2026)

| # | O que fiz, ou deixei de fora | Por quê |
|:---:|:---|:---|
| 1 | O lápis "Trocar os ossos" em **toda** linha de regra com osso (IK, Transformar, Caminho, Física), e não só na escolhida | Régua do arroz, pergunta 1: botão que só aparece depois de escolher é botão que não se acha |
| 2 | A janela é a da criação, com os ossos de agora marcados, e diz *"O alvo continua …"* | Pergunta 4: o passo seguinte é óbvio. A régua de validar é a mesma da criação (`validateNewRule`) |
| 3 | A Física abre com **um** osso (escolha, e não caixas) | `SetRuleChain` grava só o primeiro num `bone`; caixas deixariam marcar dois e gravar um, calado |
| 4 | O Comando não tem lápis | Não tem cadeia: manda pelo parâmetro |
| 5 | P12: só a chave de **etiqueta** chama `revealKey`. A de **variável** é gravada em `panels/properties-model.ts:444`, cerca do chat B | Avisado ao Planejador |
| 6 | `ferramentas/provas/vite-quieto.mjs` (novo) e a caixa da queda no roteiro e na medição | Pedido do Planejador (C3). A medição de 05:01 quebrou no meio porque outro chat gravou; forma: *a prova media o arquivo que o vizinho estava gravando* |
| P56 | (29/09/2026, 05:18) Com os Detalhes abertos, **a cena fica com pelo menos 55% da altura**. A faixa de baixo rola (chat P) | a preferência escrita do Humberto é cena grande. Medido: a cena passa de 368 para 441 px em 1440×900, e de 250 para 342 px em 1280×720. **A troca, dita como troca:** a faixa de baixo cai de 318 para 226 px em 1280×720; as linhas por osso só rolando |

## 29/09/2026, 05:18 — o que já está consertado, esperando a janela das 06:30

| Chat | Consertado e medido na parte | Testes da parte |
|:---:|:---|:---|
| casca | os menus na ordem nova · o rascunho que não se perde (A3) · Partículas e Pivô no menu | 264 de 264 em `documento` |
| H | trocar imagem grava na pele do lápis (M2, I-O2) · a troca vale dali em diante (K15) · a chave da troca aparece (K12) · duplo clique abre o pivô · Copiar e Colar pivô avisam · setas de 1 e 10 px · os ícones que viravam pontinho | 130 verdes |
| P | o rodapé não empurra mais a tela (J4, F5, L14) · a cena não encolhe com os Detalhes (K13) · Caixa e Ponto dizem o gesto (F4) | 177 verdes, 4 novos |
| G | renomear animação e "Salvar como base nova" sem a janela do navegador (Q2, K14) | 107 de 107 |
| D | `revealKey`: toda chave nova abre a linha dela e fica à vista (P12) | 232 verdes |
| I | a pilha de peles se arruma dentro do comando (I5, M1) | 135 verdes |
| E | as etiquetas do Aseprite viram animação | 332 verdes |
| P57 | (29/09/2026, 05:19) As quatro provas (roteiro, medição, pesos, foto) rodam sempre pelo **Vite quieto** (`ferramentas/provas/vite-quieto.mjs`, do chat C): a prova mede o código como estava ao subir. Toda queda guarda a frase, a foto, o tempo de cada passo, as janelas e o console em `backup/provas-quedas/` | a medição das 05:01 quebrou no meio: outro chat gravou e a página recarregou. E a queda de 04:41 se perdeu porque a prova não guardava nada |
| P58 | (29/09/2026, 05:19) **Nenhuma ação entra na lista `ESPERAM_JANELA` nesta rodada.** Ação que abre seletor diz antes do primeiro `await` para que ele serve, e depois diz o resultado, ou "Nada mudou." | negado ao chat H (trocar pasta de origem) e ao chat I (importar pele). Lista de exceção é onde o defeito se esconde; e seletor que abre calado é o M11 que o chat M achou usando |
| P59 | (29/09/2026, 05:22) **O Salvar perdia os quadros de toda sequência** (pasta numerada e folha do Aseprite). Achado e consertado pelo chat E (E4). Fica uma prova de ida e volta — montar, salvar, reabrir, conferir todos os quadros — e a varredura de quem mais conta imagem em uso | `imagesInUse` contava só o prefixo do nome (`olho_`), e contava caixa como imagem. A forma: *contei o nome do anexo como nome de imagem*. É perda de trabalho, calada: o defeito mais grave da rodada |

## 29/09/2026, 06:03 — O COMPUTADOR TRAVOU

| O quê | |
|:---|:---|
| Quando | travou às 05:57. Reiniciou às 05:58 |
| A causa, medida às 06:02 | **memória**. A máquina tem 7,7 GB. Às 06:02, só com o aplicativo aberto, sobrava 1 GB |
| O aviso que veio antes | o chat D, 05:4x: o Chrome sem janela não abriu, o Windows respondeu "Memória insuficiente", 1.036 MB livres, 14 `node` de outros chats |
| O que se perdeu | **nenhuma versão.** v22.9, v23.0 e v23.1 no disco. Último arquivo de código gravado: 05:56:52 |
| O que falta conferir | se algum arquivo ficou pela metade. Cada chat que volta responde isso antes de qualquer coisa |

**Erro do Planejador, pela forma:** *medi a casa pelo limite de uso e pela CPU, e não pela memória.* Pus 16 chats numa máquina de 8 GB. A decisão P22 (casa vazia inclui processo) tratou o sintoma no fecho e não a causa na obra.

| # | Decisão | Por quê |
|:---:|:---|:---|
| P60 | **A casa trabalha em TURNOS.** No máximo **três** chats acordados de cada vez, mais o Planejador. Quem não está no turno **dorme**: sem servidor, sem Chrome, sem teste. A medição de fecho roda com **todos os outros dormindo**, e não só parados. Os chats de uso e o da fila só acordam um de cada vez, fora dos turnos de obra | a máquina tem 7,7 GB. O aplicativo sozinho ocupa 2,6 GB; cada chat em obra abre Vite, Chrome sem janela e testes |

## 29/09/2026, 09:33 — a casa ficou parada outra vez, e a memória continua curta

| O quê | |
|:---|:---|
| Parada | das 06:10 às 09:30, pelo limite de uso. O último arquivo gravado é de 06:07 |
| Versão nova | **nenhuma.** A última continua sendo a v23.1 |
| Memória livre, 09:32 | **0,2 a 0,4 GB** de 7,7 GB |
| Quem ocupa | o navegador do Humberto: 47 processos, **4,6 GB**, aberto às 08:32. Nenhum é sobra de chat (nenhum sem janela, nenhum com porta de depuração) |
| O aplicativo dos chats | 1,0 GB, com todos parados |

| # | Decisão | Por quê |
|:---:|:---|:---|
| P61 | **Nenhuma medição roda com menos de 2 GB livres.** Quem vai medir confere a memória antes; com menos que isso, não roda e avisa. O navegador do Humberto é dele: nenhum chat o fecha | a suíte inteira, o roteiro e a medição abrem `node` e Chrome sem janela. Com 0,3 GB livres, é travar de novo |
| P62 | Para acordar um chat, o Planejador usa o **número da sessão** (`send_message`), e não o nome | depois do reinício, os nomes passaram a ter dois registros, e o aplicativo recusa o envio pelo nome |
| P63 | (29/09/2026, 09:38) **Troca a P61.** A memória não vai chegar a 2 GB com o navegador do Humberto aberto. A casa mede em **passos pequenos**: antes de cada comando mede-se a memória disponível (`AvailableMBytes`); com menos de 350 MB não roda. Um processo de cada vez, `vitest` com um trabalhador e um arquivo por chamada, o `tsc` por último. Passo que demora três vezes o normal é deixado terminar, sem abrir outro por cima | medido às 09:37: 512 MB disponíveis, 16,6 GB comprometidos de 23,7 GB, a máquina trocando memória com o disco. **Erro do Planejador, pela forma:** *medi "livre" quando devia medir "disponível", e pus um limite que a máquina nunca ia atingir.* E disse ao Humberto que poria chats para dormir: não tenho como; chat parado continua carregado |

## 29/09/2026, 09:49 — a medição do fecho 2, pelo chat C, em passos pequenos

| Prova | Hora | Memória antes | Resultado |
|:---|:---:|---:|:---|
| `tsc` | 09:39 | 748 MB | limpo |
| suíte do leitor | 09:40 | 1.230 MB | 543 de 543 |
| suíte do editor | 09:40 | 1.191 MB | 3.074 · 3.042 verdes · 29 pulados · 3 vermelhos |
| suíte das ferramentas | 09:41 | 1.344 MB | 921 · 2 vermelhos, consertados pelo próprio C (nome de tarefa das `fim-*`) |
| conformidade | 09:43 | 899 MB | 87 de 87 |
| roteiro | 09:43 e 09:44 | 874 e 1.110 MB | **13 de 14, duas vezes** |
| medição | 09:47 | 1.587 MB | 28 de 28 de lado · 19 de 28 de altura |

Suíte somada por pasta: **4.538** testes (eram 4.268 às 04:55). **270 novos, nenhum sumiu.**

| Vermelho | Dono | Estado |
|:---|:---:|:---|
| `limpar-guias` não era exercitada (2 testes) | I | **consertado às 09:42**, sem entrar em lista. Sete ações passavam no vigia de carona; agora são exercitadas com o estado |
| **a lista de animações não se refaz ao reabrir a pasta** (o passo 14 do roteiro) | G | em obra. **Defeito de verdade, nascido hoje**, às 05:27. A v23.1 passava |
| o do manual | — | antigo |

**A versão não fecha com o roteiro em 13 de 14.** A caixa da queda (P57) guardou a frase — *"sem a animação animação na lista"* — e foi ela que deu o nome do defeito.

## 29/09/2026, 09:57 — A v23.2 FECHOU

| Prova, medida pelo chat C em passos pequenos | Hora | Memória antes | Resultado |
|:---|:---:|---:|:---|
| `tsc` | 09:52 | 1.210 MB | limpo |
| suíte do editor | 09:52 | 1.239 MB | 3.081 · 3.051 verdes · 29 pulados · 1 vermelho (o do manual) |
| suíte das ferramentas | 09:53 | 1.346 MB | 921 de 921 |
| suíte do leitor | 09:54 | 1.271 MB | 543 de 543 |
| **suíte inteira** | — | — | **4.545** · 1 vermelho, o do manual. Eram 4.268 às 04:55: **277 novos, nenhum sumiu** |
| conformidade | 09:43 | 899 MB | 87 de 87 |
| roteiro | 09:54 e 09:55 | 1.168 e 1.535 MB | **14 de 14, duas vezes** |
| medição | 09:47 | 1.587 MB | 28 de 28 de lado · 19 de 28 de altura |
| `versao.py` | 09:56 | 1.940 MB | `recorte v23.2 2026-09-29.zip`, 1.389 arquivos |
| `montar-programa.py` | 09:56 | 1.895 MB | 61 arquivos em `programa/` |

Conferido no disco pelo Planejador, 09:56:54: o zip de 41 MB, o `LEIA-ME` dizendo v23.2, 1.597 MB disponíveis.
O `CHANGELOG` tem 21 seções desta versão, uma por lote, cada uma com o nome de quem fez.

**O que a janela 2 ensinou:**

| | |
|:---|:---|
| Três vermelhos apareceram na medição e fecharam em minutos, cada um pelo dono | `limpar-guias` (I, 3 min) · as `fim-*` sem nome de tarefa (C) · a lista de animações ao reabrir a pasta (G, 4 min) |
| A forma do defeito do passo 14 | *tomei "a lista cresceu" por "alguém criou"* — reabrir a pasta fazia a lista crescer, e o programa abria o campo de nome como se fosse animação nova |
| A caixa da queda pagou o que custou | a frase guardada, *"sem a animação animação na lista"*, deu o nome do defeito. De madrugada a mesma prova caiu e a frase se perdeu |
| Medir em passos pequenos funciona | com 750 a 1.900 MB disponíveis, um processo de cada vez, a casa inteira mediu em **quatro minutos** |

## 29/09/2026, 10:02 — o turno 1, e os recados que esperam o turno de cada dono

| Turno 1 | Fazendo |
|:---|:---|
| casca | fotos de depois da v23.2 (feitas, 09:58–10:00) · a dica do passo seguinte (P19) |
| E | fotos · o pivô (H1, H2) · J1 · N-6 |
| K (uso) | refaz "animar um ciclo de andar" na v23.2 e confere K1 a K15 |
| O (a fila) | só texto: põe a fila em dia com a v23.2 |

**Recados guardados.** Acordar um chat custa memória; o recado espera aqui e vai junto da ordem do turno.

| Para | Recado | De onde veio |
|:---:|:---|:---|
| P | **O menu é estreito demais**: os itens quebram em duas linhas, e "Repetir a última exportação" quebra NO MEIO da palavra ("exportaçã / o"). CSS do menu, `ui/shell.css` | foto `menu-Arquivo_depois.png`, vista pela casca e pelo Planejador |
| D | No `No fim ▸`, sem animação aberta, a marca de rádio está em "Repetir", e não em "Como o arquivo diz". É o padrão certo? | foto `menu-Animacao_depois.png`, casca |
| F | O cartão de boas-vindas ainda diz "Arquivo → Abrir pasta… e arraste as peças" (J11) | foto `menu-Arquivo_depois.png` |
| B | Com o esqueleto escolhido, Propriedades abre no bloco COMPENSAR (P6) | foto `lote-1_cor_depois.png` |
| E | **E5**, defeito novo, a medir: um projeto de verdade do Spriter (88 imagens de 1664×1157) ocupa uns 680 MB de imagem aberta, e prende o programa por minutos numa máquina de 8 GB | contado pelo próprio chat E, como parte dele no travamento |

## 29/09/2026, 10:05 — a primeira conferência no uso: o chat K, na v23.2

Refez "animar um ciclo de andar" com a mão, Chrome sem janela, 34 fotos.

| Resultado | Quantos | Quais |
|:---|---:|:---|
| **Consertado, visto no uso** | 8 | K1 · K2 · K5 · K6 · K11 · K12 · K14 · K15 |
| Consertado com ressalva | 1 | K7 |
| **Pela metade** | 4 | K3 · K8 · K10 · K13 |
| **Não consertado** | 2 | K4 (em obra, P19) · K9 |
| Novos | 3 | K16 · K17 · K18 (a medir) |

**Achou sem procurar**, nos menus novos: Nova animação · o campo do nome · Colar espelhado, ao lado de Colar · Repetir · trocar imagem.
**Não achou sem procurar:** os botões da curva · o Ângulo do osso.

| # | Decisão | Por quê |
|:---:|:---|:---|
| P64 | **O uso reabre.** "Pela metade" e "não consertado" no uso devolvem o defeito a "aberto", mesmo que a versão o tenha fechado | o `CHANGELOG` fechou 15 defeitos do chat K; o olho confirmou 8. Teste verde não é o olho |

**Recados guardados, para o turno de cada dono:**

| Para | Recado |
|:---:|:---|
| P | **K13**: com os Detalhes abertos a cena fica com ~420 px, mas **corta a cabeça e os pés** do boneco, e o painel Animações perde a lista. A cena tem de se ajustar ao boneco quando muda de tamanho · **K17**: Propriedades com três linhas de altura em 1440×900; o Ângulo fica escondido |
| D | **K16**: o `revealKey` abre os Detalhes ao trocar a imagem e eles cobrem metade do tocador · **K3**: posar diz só "Girar -22,6°"; falta dizer que criou a chave |
| G | **K9**: os botões da curva continuam abaixo do gráfico, só rolando |
| B | **K8**: a Imagem segue o quadro; o Ângulo não se vê (ver K17) |
| F | **K10**: escolher o irmão ainda não existe · **K18**, a medir: `Ctrl+V` do teclado não colou, o menu colou |

## 29/09/2026, 10:06 — a prova de ida e volta achou outro defeito calado

| | |
|:---|:---|
| **E5** | Salvar gravava a **tira inteira** em cada quadro da folha do Aseprite: os oito bonecos lado a lado, e o rodapé dizendo "Nenhum aviso" |
| A forma | *li a página no lugar da região* |
| Achado por | chat E, na primeira volta da prova que o E4 deixou |
| Estado | consertado e medido (`arquivo.test.ts` 123 verdes, 10:04); par de fotos `arquivo/E5_antes.png` e `E5_depois.png`. Entra na v23.3 |
| **E6** | o peso das imagens grandes (680 MB para 88 imagens do Spriter). A medir. O número E5 tinha sido dado a ele por engano de mensagens cruzadas |

| Para | Recado guardado |
|:---:|:---|
| casca | o menu "De outro programa…" ainda não chama o `adoptForeignImages`: o Spriter só entra visível pelo ARRASTO (E3b) |
| C | os preparos `v23.2_e4.js` e `foto.mjs` do chat E fazem a ida e volta inteira (salvar e reabrir de verdade) no navegador: viram prova da casa |

## 29/09/2026, 10:10 — A DICA DO PASSO SEGUINTE ESTÁ NO DISCO (P19)

| O quê | |
|:---|:---|
| Feito por | casca, gravado 10:02, fotos 10:04–10:09 |
| Onde aparece | no rodapé, na linha da ferramenta. A frase da ferramenta, quando há, tem prioridade |
| Estados, um por foto | sem pasta · pasta sem imagem na cena · imagens sem osso · imagens soltas · nunca salvo · sem animação · base aberta · animação sem chave · uma chave só · não repete |
| Exemplos, lidos nas fotos | *"Próximo: crie os ossos — ferramenta Criar osso (B): arraste na cena, do começo ao fim do osso"* · *"Próximo: ande no tempo e pose de novo — clique mais adiante na régua da Linha do tempo e mexa no boneco"* |
| A prova que impede a dica de mentir | todo "Menu → Item" que a dica escreve é conferido contra o nome de verdade no menu |
| Testes | `acoes` 35 de 35 (11 novos) · `cena` 92 de 92 · `tsc` limpo |
| Desliga-se em | Editar → Preferências |
| Ajuste pedido pelo Planejador | "Próximo:" em negrito e na cor de destaque: na foto a dica sai em cinza claro |

| Para | Recado guardado |
|:---:|:---|
| P | o primeiro campo do rodapé ficou estreito: "Arquivo salvo." sai "Arquivo sa…" (fotos `p19-*`, achado da casca) |

## 29/09/2026, 10:11 — o Planejador errou na P15(b), e volta atrás

| # | Decisão | Por quê |
|:---:|:---|:---|
| P65 | **Troca a P15(b).** "Definir pivô recoloca quem usa a imagem" **não é defeito**: é o plano de 10/09 (`PLANO pivô e Animando 2026-09-10.md`, linha 163), aprovado pelo Humberto, com a janela que avisa antes. Fica como está. **O que é defeito e se conserta:** (1) H1, trocar a imagem pula 12 px com o mesmo pivô — conta errada; (2) o desenho **solto**, sem osso, é jogado perto da origem do mundo: desenho solto ganha o pivô e fica onde está, e a janela conta os dois separados; (3) o rodapé diz de onde para onde, com número arredondado. Os testes de `pivo.test.ts` que provam a decisão antiga ficam intactos | **erro do Planejador, achado pelo chat E ao pedir uma regra antes de gravar.** A forma: *decidi por cima de uma decisão que já estava tomada, sem ler.* Dois chats de uso viram o desenho pular e chamaram de defeito; eu aceitei a palavra "defeito" sem procurar se o pulo era combinado. A P15(a) (trocar a imagem põe o pivô novo onde estava o velho) continua valendo: é o que o `SwapSlotImage` já prometia desde o lote 56 |

**Fica para o Humberto decidir:** se a janela do Definir pivô ganha uma caixa *"Manter os desenhos onde estão"*. Hoje ela recoloca, avisando antes. Nada será feito sem a palavra dele.

| Para | Recado guardado |
|:---:|:---|
| H | **CANCELADA** a frase *"A imagem não sai do lugar. Quem anda é a cruz."* na dica do Definir pivô: a P15(b) caiu (P65). O `pivotLead` fica como está. O que muda no texto: a janela conta separado os desenhos presos a osso (recolocados) e os soltos (ficam onde estão), quando o chat E avisar |
| P66 | (29/09/2026, 10:13) **A dica do passo seguinte cabe no rodapé.** Cada frase com no máximo 80 letras, o gesto primeiro e um caminho só; o caminho de menu inteiro fica na dica que aparece ao pousar o mouse (casca). A largura dos campos: o primeiro cabe "Arquivo salvo.", o do meio cede primeiro, **a dica nunca é a primeira a ser cortada** (chat P) | foto `p19-cor_depois.png`: os três campos saem cortados — "Arquivo sa…", "…todas as ani…", e a dica termina em "(Esqueleto → Vi…", perdendo justamente o caminho de clique |

## 29/09/2026, 10:18 — recados novos, do turno 1

| Para | Recado guardado | De onde veio |
|:---:|:---|:---|
| D e P | **Com a faixa de baixo aberta, as abas "Linha do tempo / Curvas" cobrem a barra do tocador**: cortam "Chavear" e o tempo. É o mesmo K16 do chat K, agora com foto (`p12_depois.png`). O D diz de quem é o pedaço; o P mede a altura | casca e chat K |
| D | o `revealKey` sem ouvinte **guarda** o pedido e entrega ao próximo ouvinte. Na tela é o que se quer; em teste, um pedido velho de outro teste vaza. Dois chats já tropeçaram (C e casca): dê ao teste um jeito de esvaziar, num lugar só | casca e chat C |
| P | a frase da dica foi encurtada pela casca (P66); falta a largura dos campos do rodapé | foto `p19-cor_depois.png` |

**Feito pela casca no turno 1, até 10:16:** as fotos de depois da v23.2 · a dica do passo seguinte (P19) · a cor da dica · o Spriter pelo menu (E3b) · a chave de ordem e a da virada de corpo aparecem (P12). Todos medidos, um processo de cada vez.

## 29/09/2026, 10:21 — a segunda conferência no uso: o chat M, na v23.2

Refez "peles e troca de roupa" com a mão, Chrome sem janela, 51 fotos.

| Resultado | Quantos | Quais |
|:---|---:|:---|
| **Consertado, visto no uso** | 8 | M1 · **M2** (os três caminhos) · M3 · M4 · M5 · M6 · M8 · M14 |
| **Pela metade** | 5 | M9 · M10 · M11 · M12 · M13 |
| **Não consertado** | 3 | M7 · M15 · M16 |
| Novos | 4 | M17 · M18 · M19 · M20 |

**O nº 1 dos que mais doíam fechou de vez:** trocar a imagem com o lápis aceso grava na pele, pelos três caminhos, e o rodapé diz a pele. O chat M chamou de "o melhor passo da fila".

**Achou sem procurar:** trocar imagem · Exportar e Importar pele, no menu Arquivo · Promover · Nova pele, pelo `Novo ▾` da Árvore.
**Não achou sem procurar:** Pele de uma pasta (só um ícone mudo) · renomear, duplicar e apagar pele por menu.

| Para | Recado guardado |
|:---:|:---|
| E | **M17, GRAVE**: Importar pele **recusa o arquivo que a própria Exportar grava** — "Importar pele parou: /bones: expected an array". A ida e volta não fecha. É `io/export-skin.ts`. A mesma prova de ida e volta que pegou o E4 e o E5 tem de existir para a pele |
| I | **M18**: `Esqueleto → Peles ▸` só tem dois itens; Nova pele e Pele de uma pasta não estão em menu nem na busca · **M19**: a faixa "pele vazia" espreme Feitas/Ativas · **M7**: o × de despir cala · **M13**: clicar segue mudo · **M10**: os ícones da aba sem texto |
| H | **M20**: "Trocar imagem nas peles…" fica cinza sem dizer por quê |
| F | **M15**: botão direito no vazio da cena diz "Não há ferramenta anterior para voltar" |
| casca | **M9**: Ajuda → Sobre ainda diz "Versão 0.1.0" · **M12**: o aviso em inglês (P46) |
| P | **M16**: Imagens e Peles não cabem juntas na coluna |

## 29/09/2026, 10:22 — o pivô: a pergunta é do Humberto

| # | Decisão | Por quê |
|:---:|:---|:---|
| P67 | **Encolhe a P65.** Nenhum comportamento do pivô muda nesta rodada — nem o do desenho preso a osso, nem o do desenho solto (no osso raiz). Conserta-se só o que o programa **diz**: o rodapé passa a dizer de onde para onde o desenho foi, com número arredondado. Nenhum teste de `pivo.test.ts` é reescrito | o chat E achou que o teste do `SetFolderPivotCommand`, do plano de 10/09, recoloca justamente dois desenhos **no osso raiz**. Recolocar o desenho solto também foi combinado. **Forma do erro do Planejador, pela segunda vez no mesmo assunto:** *chamei de defeito o que dois chats de uso estranharam, sem perguntar se era combinado* |

**PERGUNTA AO HUMBERTO — a única desta rodada que trava um conserto:**

> Quando você acerta o pivô de uma imagem que **já está na cena**, o desenho:
> **(a)** pula para o osso, pelo pivô novo — é como está hoje, e a janela avisa antes; ou
> **(b)** fica parado onde está, e só a cruz do pivô anda?

Dois chats de uso (J e H) estranharam o pulo. O plano de 10/09 diz (a). Até ele responder, vale (a).

## 29/09/2026, 10:26 — o turno 1 fechou o lote do chat E; o M17 tem causa

| # | Decisão | Por quê |
|:---:|:---|:---|
| P68 | **A prova de ida e volta cobre tudo o que o programa grava e depois lê**: pele, animação, `.bone`, `.boneb` e `.bonez`. Gravar com a função do Exportar, ler com a MESMA função do Importar. O chat E escreve as que faltam; o chat C recebe os preparos que fazem a volta inteira no navegador e decide onde moram em `ferramentas/provas/` | num dia só, essa forma de prova pegou três defeitos calados: **E4** (o Salvar perdia os quadros), **E5** (gravava a tira inteira em cada quadro), **M17** (a pele exportada que o Importar recusa) |

**M17, a causa, achada só lendo:** o gravador da pele (`io/export-skin.ts`) só escreve a lista `bones` quando a pele tem osso próprio; a `armadura` não tem, e o arquivo sai **sem** `bones`. O schema exige. O leitor está certo em recusar. A forma: *omiti uma lista vazia que o formato exige.*

| Para | Recado guardado |
|:---:|:---|
| C | os preparos do chat E em `backup/fotos-rodada-final/arquivo/` — `servidor-fotos.mjs`, `foto-programa.mjs`, `foto.mjs`, `programa_ajudantes.js`, `lote-2_folha.js`, `v23.2_e4.js` (a ida e volta inteira: pegou o E5), `v23.2_e4_atlas.js`, `lote-3_spriter-dez.js`. Viram prova da casa |
| I | o erro do Importar pele chega em inglês ("/bones: expected an array"): o chat E dá em `io/` a função que traduz; o I a chama em `panels/skins-actions.ts` (P46) |
| todos | a medida da memória **para** o comando; não vai encadeada com ele. O chat E rodou o `tsc` com 327 MB por causa disso |

### Chat E, 10:26 — a minha parte no travamento das 05:57

**A forma (regra 27): *abri 88 imagens de 1664 px num Chrome sem placa de vídeo, quatro vezes, sem medir a memória.***

| O quê | |
|:---|:---|
| Quando | das 05:32 às 05:50, tentando a foto do projeto do Spriter (`exemplo/game`) |
| A conta | cada imagem do jogo tem 1664×1157, cerca de 7,7 MB aberta; 88 imagens, cerca de 680 MB por Chrome. Cada tentativa deixava a página presa por mais de 3 minutos, e às 05:50 abri a mesma coisa no painel do aplicativo |
| O que não sei | se fui a causa. O chat D viu "Memória insuficiente" às 05:4x, e a hora e a conta batem. Não é causa medida |
| O que mudou | foto no programa montado, um processo de cada vez, memória medida antes, 10 imagens e depois 20, o Chrome morto quando trava. Às 10:06 entrou com 10 imagens; com 20 travou e parei (E6, a medir) |
| E um erro de hoje, da mesma família | às 10:22 um `tsc` rodou com 327 MB (a régua é 350): encadeei a medida com o comando, e ela não o parou. Às 10:23 a medida passou a parar o laço |

### Chat E, 10:27 — as formas do E5 e do M17 (decisões P59 e P68)

| # | O defeito | A forma (regra 27) | Onde mais |
|:---:|:---|:---|:---|
| E5 | salvar a folha do Aseprite gravava a TIRA INTEIRA em cada quadro, com "Nenhum aviso" | ***li a página no lugar da região*** | só onde uma página tem várias regiões: hoje, a folha. A pasta (uma imagem, uma página) nunca foi afetada |
| M17 | o Exportar pele gravava um arquivo SEM `bones`, e o Importar o recusava | ***omiti uma lista vazia que o formato exige*** | o Exportar animação já leva o osso raiz (`export-animation.ts:274`): a mesma regra, lembrada num arquivo e esquecida no vizinho. O leitor estava certo; o defeito é do gravador |

O que os dois ensinam, junto com o E4: **três defeitos calados num dia, todos pegos por uma prova de ida e volta** — gravar com a função do programa e ler de volta com a função do programa. Daí a P68: essa prova passa a cobrir tudo o que o programa grava e lê (pele, animação, `.bone`, `.boneb`, `.bonez`).

## 29/09/2026, 10:28 — a terceira conferência no uso: o chat J, na v23.2

Refez "do zero ao boneco montado" com a mão, Chrome sem janela, 27 fotos.

| Resultado | Quantos | Quais |
|:---|---:|:---|
| **Consertado, visto no uso** | 5 | J3 · **J4** (o painel não encolhe mais) · J7 · J12 · J13 |
| Pela metade | 1 | J8, com retratação: o defeito era do painel do aplicativo, e não do programa |
| **Não consertado na v23.2** | 8 | J1 e J6 (já no disco, entram na v23.3) · J2 · **J9** · J10 · J11 · J14 · J15 |
| Não conferido | 1 | J5: o arrasto de verdade não se faz sem janela |
| Novos | 2 | J16 · J17 |

**Achou sem procurar:** abrir pasta · ver imagens · pôr na cena · o pivô, por quatro caminhos · criar osso · a aba Ordem · salvar.
**Não achou sem procurar:** **prender a imagem ao osso** (nada à vista diz) · o reabrir certo (três itens no menu; o certo é o último).

| Para | Recado guardado |
|:---:|:---|
| B | **J9, GRAVE**: digitar 90 no Ângulo, e o osso e os desenhos **não se mexem**. Medido sem janela. É a ficha rápida (`quick-model.ts`, agora sua). Junto do K8 |
| F | **J2**: "Virar filho de…" pelo menu ainda só diz "Segure P"; clicar não prende. É o seu `armGrab` · **J11**: o cartão de boas-vindas |
| F e D | **prender a imagem ao osso não se acha**: é o passo do meio de toda montagem. A dica do passo seguinte (P19) já diz o gesto; falta uma porta à vista |
| casca | **J10**: Ajuda → Sobre diz 0.1.0 · **J14**: o Salvar nunca pede nome · o reabrir certo: três itens no menu, o rodapé não diz qual |
| P | **J15**: a aba Imagens gasta duas linhas antes da grade · **J17**: o Ângulo abaixo da borda |

### Chat A2 (`EXECUTANDO · a casca`), 29/09/2026, 10:33 — um vermelho meu no fecho da v23.3

**A forma:** *acrescentei um campo e não varri quem conferia o objeto inteiro.*

| | |
|:---|:---|
| **O gesto** | P19, às 10:02: `nextStep` entrou em `ui/prefs.ts` (`Prefs`, `DEFAULT_PREFS`, `parsePrefs`) |
| **O estrago** | `tema-e-ficha.test.ts:186` compara o objeto das preferências INTEIRO com `toEqual`, e ganhou um campo a mais. Achado pelo chat C na medição do fecho |
| **Por que passou por mim** | procurei `DEFAULT_PREFS` e `parsePrefs` nos testes e só olhei os que comparam **com** `DEFAULT_PREFS` (esses seguem sozinhos). Não procurei o objeto escrito à mão |
| **O conserto** | a linha 186 ganha `nextStep: true` no esperado, com o motivo ao lado. Continua `toEqual` do objeto inteiro (P49). Arquivo da cerca do chat P, com autorização do Planejador |
| **Onde mais** | procurado: `physicsSim: true`/`false` e `showVars: true` escritos à mão em todos os testes — só a linha 186. `cena.test.ts` compara com `DEFAULT_PREFS`, que já tem o campo |

## 29/09/2026, 10:41 — A v23.3 FECHOU, E A CASA PAROU

Ordem do Humberto, 10:28: *"dê uma pausa no próximo ponto que deixe o aplicativo usável, quero ver como ele está."*

| Prova, medida pelo chat C em passos pequenos | Hora | Memória antes | Resultado |
|:---|:---:|---:|:---|
| `tsc` | 10:31 | 677 MB | limpo |
| suíte das ferramentas | 10:32 | 518 MB | 921 de 921 |
| suíte do leitor | 10:34 | 765 MB | 543 de 543 |
| conformidade | 10:34 | 923 MB | 87 de 87 |
| roteiro | 10:34 e 10:35 | 493 e 1.052 MB | **14 de 14, duas vezes** |
| medição | 10:36 | 1.558 MB | 28 de 28 de lado · 19 de 28 de altura |
| suíte do editor, depois da última gravação | 10:37 | 806 MB | 3.144 · 3.114 verdes · 29 pulados · 1 vermelho (o do manual) |
| **suíte inteira** | — | — | **4.608** (era 4.545). **63 novos, nenhum sumiu** |
| `versao.py` | 10:39 | 459 MB | `recorte v23.3 2026-09-29.zip`, 1.391 arquivos |
| `montar-programa.py` | 10:39 | 370 MB, depois de esperar | 61 arquivos em `programa/` |

Conferido no disco pelo Planejador, 10:40:33: o zip de 41 MB, o `LEIA-ME` dizendo v23.3, nenhum `node`, nenhum Chrome sem janela, nenhuma porta aberta.

**Um vermelho apareceu na medição e fechou em dois minutos:** `tema-e-ficha.test.ts:186` conferia as preferências inteiras e não sabia do campo `nextStep`. A forma, da casca: *acrescentei um campo e não varri quem conferia o objeto inteiro.*

**Na v23.3:** a dica do passo seguinte (P19, P66) · o Spriter visível, pelo arrasto e pelo menu (E2, E3) · o Salvar da folha do Aseprite (E5) · abrir o salvo com as imagens (J1) · trocar a imagem não pula (H1) · o rodapé do pivô diz de onde para onde · o arrasto de dentro sem erro falso (J5) · os avisos do exportar (N-6, N-14) · a chave de ordem e a da virada aparecem (P12) · o rascunho que guarda os dois (P55).

**A CASA ESTÁ PARADA.** Nenhum chat roda nada até o Humberto mandar seguir. Os recados guardados acima esperam o turno de cada dono.

| Turno 2, quando ele mandar | Por quê |
|:---|:---|
| **P** — a tela que cabe | quatro dos dez que mais doem são tamanho e lugar na tela |
| **B** — a ficha | J9, grave: digitar o ângulo e nada mexer · o Compensar que tapa a ficha · a ficha do emissor |
| **E** — o M17 | a pele exportada que o Importar recusa |
| um chat de uso de cada vez | **N** (exportar) e **L** (malha) ainda não conferiram; K, M e J conferem a v23.3 |

## 29/09/2026, 14:36 — OBRA PARADA: o Humberto vai projetar o programa

| O quê | |
|:---|:---|
| O aviso | veio do chat `Arquitetura do programa` (ref `ca2414`), às 14:40, e está escrito no fim de `documentos/QUEM E QUEM.md` |
| A palavra do Humberto, lá | *"o programa cresceu indo para várias direções. Eu quero sentar e projetar como eu quero o programa."* |
| O que vale | ninguém escreve em `editor/src`; não se abre lote, não se chama turno, não se fecha versão. A **v23.3** fica como está |
| O estado da casa, conferido às 14:36 | parada desde 10:40. Último arquivo gravado em `editor/`: 10:33:11. **Nada pela metade** |
| Como volta | com a palavra do Humberto, dita na janela do Planejador |

O Planejador não tratou o aviso de outro chat como ordem do Humberto: tratou como pedido de parar, que é o que a casa já fazia. **A ordem de VOLTAR só vale vinda dele.**

**O que fica de pé para quando voltar:** os recados guardados neste diário, por dono · a fila (78 abertos) · a pergunta do pivô (P67) · o turno 2 planejado (P, B, E).
