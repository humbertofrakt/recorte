# A aba das entidades conferida — lote 5 (v30.8) — 06/10/2026

Rodada 39, lote 5, "Pôr no projeto". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.8** (o "Sobre" diz v30.8) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 09h49 a 09h55, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-39-conferida/lote5/` (6) |
| Material | o herói, a `espada`, o `mecha`, o `poder5` e o `capacete` numa **pasta em memória** (seletor do Windows trocado por falso). Abri por *Novo projeto* → pasta → *Abrir heroi.bone* |
| A "nave" | não há `nave.bone`; montei dois níveis com o que havia: **herói dentro do mecha, e o mecha dentro do capacete** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1, 2, 4, 5, 6) | **1** (3) | 0 | 6 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Ao pôr o mecha no projeto, o conjunto fica 135 px mais baixo na tela do que no teste.** No teste (*Na cena* ligado) o herói **sobe** (apoiado no banco do mecha) e as peças do mecha ficam em volta. Depois de *Pôr no projeto* a **composição é a mesma** (mecha, herói e espada na mesma posição um em relação ao outro), mas o conjunto desce 135 px: o herói volta ao lugar dele na base. O pedido dizia "o desenho fica igual ao do teste" | 3 | `U3_depois_de_por` |
| 2 | *Pequeno.* O `.bone` do herói **mudou de tamanho entre gravações sem que eu mudasse o que estava no teste** (48504, 48629, 48406, 48281 em momentos diferentes da sessão, ao trazer entidades de fora e ao rebaixar). Nas comparações pedidas (com e sem teste, antes e depois do `Ctrl+Z`) o tamanho **bateu**; só não sei explicar de onde vêm as outras variações | 5 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Botão "Pôr no projeto" na barra da aba Entidades, no botão direito do cartão de teste e no menu Entidades | **vi funcionar** | **Barra:** botão *Pôr no projeto*, **apagado** sem teste (a dica: *"Ainda não há ligação de teste"*) e aceso com teste (*"grava uma ligação de teste no arquivo aberto (há 1). Vai para a base, e vale em todas as animações. Ctrl+Z volta a teste"*). **Botão direito no cartão de teste:** *Desligar* e *Pôr no projeto*. **Menu Entidades:** *Pôr no projeto…* | `E5_botao_direito` |
| 2 | Para baixo: a espada de teste num slot entra de verdade: borda cheia, PROJETO. Salvar grava no `.bone` (muda); reabrir mostra PROJETO | **vi funcionar** | Com `poder5` em teste no `weapon`: *"Poder5 gravada no slot weapon: agora é do projeto (foi para a base). Espada saiu do slot."* O cartão `poder5` passou a **borda cheia, PROJETO**, e a espada saiu. **Salvar:** o `.bone` **mudou** (**48504 → 48406** bytes, e a lista de objetos mudou); **reabri** (Novo projeto → *Abrir heroi.bone*): *"weapon · poder5 · PROJETO"*. Repeti com a espada pelo menu: *"Espada gravada no slot weapon: agora é do projeto… Poder5 saiu do slot."* | `E2_depois_de_por` · `E4_por_pelo_menu` |
| 3 | Para cima: o mecha em volta entra NO boneco ("Este boneco" no piloto); o desenho fica igual ao do teste; o rodapé diz "Agora heroi LEVA mecha" | **pela metade** | Com o herói dentro do mecha em teste e *Na cena* ligado, *Pôr no projeto*: *"Mecha entrou em heroi, com Este boneco no body (foi para a base). **Agora heroi LEVA mecha**: no teste não levava. Ctrl+Z volta a teste."* O cartão do herói ganha o `mecha` por dentro (**PROJETO**), com o `weapon · espada`. **O desenho:** mesma composição, mas **o conjunto desce 135 px** (defeito 1) | `U3_depois_de_por` |
| 4 | Dois níveis (a nave) não grava e diz por quê | **vi funcionar** | Com *herói dentro do mecha* e *mecha dentro do capacete* em teste, o botão diz *"(há 2)"*; ao apertar abre *"Que ligação de teste vai para o projeto?"* com duas linhas (*heroi dentro de mecha (body)* e *mecha dentro de capacete (casco)*) e o porquê: ***"Capacete leva mecha, e nenhum dos dois é o arquivo aberto. Para gravar, abra mecha e ponha capacete nele."*** Nada foi gravado (o Salvar não gravou nada) | `N2_recusou` |
| 5 | `Ctrl+Z` volta a teste; o `.bone` volta igual (compare o tamanho) | **vi funcionar** | Depois de *Pôr no projeto* (para cima), **`Ctrl+Z`**: *"Desfeito: Pôr no projeto"* e o `mecha` volta a **TESTE**. **Tamanho do `.bone`:** com o mecha no projeto **48593**; depois do `Ctrl+Z`: **48281**; **tirando o teste de vez: 48281**. Ou seja: depois do `Ctrl+Z` o `.bone` é do mesmo tamanho que **sem o teste**. Para baixo, também: com a espada em teste **48406**, igual ao tamanho sem teste. **Só comparei o tamanho, não o conteúdo letra por letra** | — |
| 6 | Trazer a mesma entidade de fora duas vezes avisa que entrou como cópia (-2) e diz como usar a que já existe | **vi funcionar** | *"espada.bone entrou como entidade com o nome **espada-2.bone**: o nome espada.bone já estava em uso, e esta é uma **CÓPIA**. Para usar a que já existe, arraste-a da prateleira da aba Entidades"*. Na terceira vez, **espada-3.bone** | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | Depois de trazer a `espada` três vezes, a lista de *Pôr em teste neste slot…* tem **três "espada"** (espada, espada-2, espada-3): quem escolhe pelo nome não sabe qual é a original |
| C2 | A frase de *Pôr no projeto* para cima diz *"no teste não levava"*: é verdade, mas dito de pressa parece que algo deu errado |
| C3 | O botão *Pôr no projeto* só vale para o que está em teste; com **dois** testes o diálogo pergunta qual: ótimo, mas a pergunta já traz a explicação da recusa (bom) |
| C4 | Arrastar o mecha da Prateleira para a linha de um slot do cartão de teste, na minha primeira tentativa, **agarrou um painel**, e a aba *Animações* foi parar no grupo de cima: a posição do painel mudou sem eu pedir |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo | pasta em memória | Salvar e abrir numa pasta de verdade |
| "Reabrir" | Novo projeto → Abrir heroi.bone, **na mesma página** | fechar o navegador e abrir de novo |
| A nave | dois níveis com `mecha` e `capacete` | a nave de verdade |
| "Igual letra por letra" | **só o tamanho** | o conteúdo |
| "Reabrir mostra PROJETO" | só **para baixo**; para cima não reabri | o mecha no projeto após reabrir |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
