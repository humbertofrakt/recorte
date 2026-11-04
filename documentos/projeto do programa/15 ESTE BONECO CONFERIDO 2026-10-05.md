# "Este boneco" conferido — 05/10/2026

Rodada 27. Conferente: `CONFERINDO · rodada 24 — os consertos e os painéis`.
**Nenhum código foi mexido.** Só usei o programa e fotografei. Régua: o trecho *"Este boneco": a tomada ao contrário* de `02 AS DECISOES` (as três linhas do Humberto: a imagem do meio não é desenhada; o que está atrás vai atrás do personagem inteiro; o que está na frente vai na frente).

| | |
|:---|:---|
| Versão montada | **v27.6** (o "Sobre" diz v27.6) |
| Como | `programa/` na porta 5324 · Chrome sem janela · mouse e teclado por protocolo; o arrasto da aba Entidades para a cena é o arrasto de verdade (`Input.setInterceptDrags`) |
| Tela | **só 1920×1080**, como mandou a ficha |
| Hora | 15h19 a 15h38 do relógio da máquina, 05/10/2026 |
| Fotos | `backup/fotos-obra/rodada-27/` (24) |
| **O material** | **Não abri os arquivos do caso `C-311`** (`entrada.bone` e `poder.bone` não têm atlas: as peças não têm imagem para desenhar). **Fiz um poder de cinco peças meu**, `poder5.bone`, com as imagens do atlas do herói: `atras1` (a capa) · `atras2` (o cabelo) · `meio` (o rosto) · `frente1` (a lâmina) · `frente2` (a bota), numa animação `idle` que gira a peça 20° e volta. O arquivo e o seu gesto ficam em `scratchpad`, fora do projeto. Entrou pelo gesto do usuário: **Entidades → Trazer entidade de fora…**, e foi arrastado da aba Entidades para o herói |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Não achei a porta | Não dá sem janela |
|:---:|:---:|:---:|:---:|:---:|
| **8** | **3** (E5, E7, E11) | 0 | 0 | 0 |

12 linhas. **Nenhum "não funciona".** Na E5, dos três jeitos de desfazer, dois vi funcionar e um não achei a porta (defeito 1).

## Os defeitos, do pior para o menor

| # | Defeito | Linha | Foto | Como repetir |
|:---:|:---|:---:|:---|:---|
| 1 | **Pelo botão direito não há jeito de desfazer o "Este boneco".** Com o poder em volta, o botão direito sobre uma peça dele mostra o mesmo menu (a grade e *Em todas as skins · Este boneco · Trazer para a frente · Mandar para trás · Duplicar · Apagar*), sem *"Tirar"* e sem sinal de que já está ligado. Escolher **Este boneco** de novo **liga outra vez com outra imagem como meio** (cliquei na bota, `frente2`: *"4 atrás, 0 na frente"*), não desfaz. O desfazer existe no menu **Entidades → Tirar o Este boneco** e no `Ctrl+Z` | E5 | `E5_01_menu_com_poder_em_volta` | Pôr o poder, botão direito numa peça, Este boneco. De novo botão direito na bota: o menu é igual; Este boneco muda o meio |
| 2 | **"Este boneco" não é o primeiro item.** O Humberto pediu o primeiro: *"na grade, o primeiro item é Este boneco"*. Hoje a grade de imagens vem primeiro, depois o seletor *fonte: pasta · objeto*, depois **Em todas as skins**, depois **Este boneco** (a quarta linha do bloco de itens) | E1 | `E1_01_botao_direito` | Botão direito numa peça do poder |
| 3 | **Não consegui pôr o poder na BASE** pelo gesto que usei (arrastar da aba Entidades): ele entra sempre "nesta animação" (o rodapé diz *"A base e as outras animações ficam sem ela"*; conferido em `walk` e `attack`: sem o poder). Por isso **não vi o "Este boneco na base, vale em todas as animações"**. Pode ser meu gesto (a Base se abre por Base → Abrir a base); não consegui provar o contrário | E7 | `E7_04_walk` · `E7_04_attack` | Abrir a Base (Base → Abrir a base) e arrastar o poder da aba Entidades |
| 4 | **"Tirar a entidade" fica cinza** com o poder escolhido e a dica diz *"Esta entidade não tem imagem de antes: ela entrou em poder5 sem substituir imagem nenhuma"*. É honesto, mas o Humberto que quer "tirar o poder" tem de achar **Apagar** (que guarda 2 chaves: *"Apagar: 2 chaves de "poder5" guardadas em 1 animação"*) | E11 | | Escolher o poder, Entidades → Tirar a entidade |
| 5 | *Não expliquei, e pode ser do meu gesto:* depois de arrastar o poder apareceram **dois slots** (`poder5` e `poder52`) na Ordem e na Árvore, e não um. Apagar um deixa o outro | C | | Arrastar o poder da aba Entidades; olhar a aba Ordem |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto | Como repetir (se falhou) |
|:---:|:---|:---:|:---|:---|:---|
| E1 | Botão direito numa imagem de dentro do poder: aparece **Este boneco**; onde está na lista | **vi funcionar** | Aparece. **Não é o primeiro** (defeito 2): a ordem do menu é a grade de imagens → *fonte: pasta · objeto* → **Em todas as skins** → **Este boneco** → Trazer para a frente → Mandar para trás → Duplicar → Apagar | `E1_01_botao_direito` | |
| E2 | A imagem clicada deixa de ser desenhada; o que estava atrás vai para trás do boneco inteiro; o que estava na frente vai para a frente. Peça por peça, com foto de antes e depois | **vi funcionar** | Pus o poder sobre o **tronco** do herói e escolhi **`meio`** como o meio (pela porta do menu, E6). **Antes (em bloco):** as cinco peças desenhadas por cima do herói. **Depois:** o **rosto (`meio`) não é desenhado** (o cinto e o tronco do herói aparecem inteiros no centro); a **capa (`atras1`) e o cabelo (`atras2`) passam para trás do herói** (o cabelo some atrás do tronco); a **lâmina (`frente1`) e a bota (`frente2`) ficam na frente**. Também com o botão direito sobre a lâmina: a lâmina marca o meio, `atras1`, `atras2` e `meio` vão para trás (3), `frente2` fica na frente (1) | `E2_03_antes_bloco` · `E2_04_depois_meio` · `E2_00_antes` · `E2_01_depois` | |
| E3 | O programa diz o que fez | **vi funcionar** | *"poder5 em volta de heroi: **2 atrás, 2 na frente**, só nesta animação, de 0,00 s em diante. A imagem "**meio**" marca o meio e não é desenhada."* (com o botão direito sobre a lâmina: *"3 atrás, 1 na frente… "frente1" marca o meio"*) | `E6_01_dialogo` | |
| E4 | Dá para ver que o poder está em volta: na aba Ordem, e na cena com o poder escolhido | **vi funcionar** | **Ordem:** uma linha em itálico no **topo**, *"poder5 · na frente (2)"*, e outra no **fim**, *"poder5 · atrás (2)"*, e a linha do slot *"poder5 — sem imagem nesta skin"* no lugar dele. **Cena:** com o poder escolhido aparece uma caixa **laranja tracejada** com a etiqueta *"frente1 · o meio (não é desenhado)"* | `E4_00_ordem` · `E4_01_cena_poder_escolhido` | |
| E5 | Desfazer de três jeitos: `Ctrl+Z`, pelo mesmo botão direito, pelo menu | **pela metade** | **`Ctrl+Z`:** *"Desfeito: Este boneco"*, a região do desenho **idêntica** à de antes (0 px de diferença), e refazer volta igual. **Pelo menu:** **Entidades → Tirar o Este boneco** (dica: *"ela volta a ser desenhada em bloco, no lugar dela na ordem"*): *"poder5 voltou a ser desenhada em bloco…"*, **0 px** de diferença da região de antes. **Pelo mesmo botão direito: não achei** (defeito 1) | `E5_00_botao_direito_com_poder_em_volta` · `E5_01_menu_com_poder_em_volta` | Defeito 1 |
| E6 | Existe a porta no menu, e ela deixa escolher qual imagem é o meio | **vi funcionar** | **Entidades → Este boneco…** (com o poder escolhido): janela *"Este boneco: o meio de poder5"* com uma busca (*"Qual imagem marca o meio? Ela deixa de ser desenhada"*) e as cinco imagens, **cada uma com a conta**: *atras1 · 0 atrás do boneco, 4 na frente* · *atras2 · 1 atrás, 3 na frente* · *meio · 2 atrás, 2 na frente* · *frente1 · 3 atrás, 1 na frente* · *frente2 · 4 atrás, 0 na frente*. Setas andam, Enter escolhe | `E6_01_dialogo` · `E6_menu_entidades` | |
| E7 | Na base vale em todas as animações; no meio de uma animação vale só nela, daquele quadro em diante | **pela metade** | **No meio da animação ✓:** apliquei no quadro 10 (0,33 s) do `idle`: *"só nesta animação, **de 0,33 s em diante**"*. A região do desenho nos quadros **0 e 5 (antes da agulha): idêntica à de antes** (0 px: o poder está inteiro no lugar dele); nos quadros **10, 15 e 20: diferente** (em volta). **Na base ✗ não vi** (defeito 3): não consegui pôr o poder na base | `E7_q5_depois` · `E7_q15_depois` | Defeito 3 |
| E8 | Ligando no meio de uma animação em que o poder toca uma animação dele, ele não recomeça nem dá salto | **vi funcionar** | O poder toca o `idle` dele (gira 20° e volta em 1 s). Comparei a **região da bota (`frente2`, que fica na frente antes e depois)** nos quadros 0, 5, 10, 15 e 20, **antes e depois** de ligar em 0,33 s: **0 px de diferença em todos**. A bota continua girando na fase certa: não recomeçou, não saltou | | |
| E9 | O clique na cena pega o que está desenhado por cima | **vi funcionar** | Quadro 15 (0,50 s), poder em volta. Cliquei **na bota (`frente2`, em cima do herói)**: *"Entidade: poder5"* (duas posições da bota). Cliquei **no tronco do herói**: *"Osso: torso"*. Cliquei **na capa do herói por cima da capa do poder** (que está atrás): *"Anexo: cape_lower"* (a do herói). *Limite:* a lâmina (`frente1`) cai em cima do osso do antebraço do herói e o clique pegou o osso (a regra antiga: clicar no meio do osso pega o osso) | `E9_00_q15` | |
| E10 | Salvo, fecho e reabro: continua em volta. Um projeto sem Este boneco, salvo, abre igual | **vi funcionar** | **Com:** salvei (*"Salvo em heroi.bone"*), fechei (Novo projeto) e reabri com os arquivos: no quadro 15 a aba Ordem mostra *"poder5 · na frente (2)"* e *"poder5 · atrás (2)"*; no quadro 0 (antes dos 0,33 s) as linhas não aparecem, o poder está em bloco; as fotos de q5 e q15 diferem de antes em **82 e 31 px** (de 19.200), contra 1.500 px de diferença entre "em bloco" e "em volta": é o ruído do cabelo do herói, não uma mudança. **Sem:** salvei um projeto só com o poder em bloco, reabri: **0 px** de diferença nos quadros 5 e 15 | `E10_reaberto_q15` | |
| E11 | Tiro a entidade do boneco: a imagem de antes volta, e nada sobra | **pela metade** | **"Tirar a entidade"** fica **cinza** para o poder (dica: *"Esta entidade não tem imagem de antes: ela entrou em poder5 sem substituir imagem nenhuma"*; defeito 4). **Apagar** (`Delete` com o poder escolhido) tira o slot e **as linhas "na frente / atrás" somem da Ordem**; no quadro 0 a região do desenho fica **igual** à do herói sem o poder (0 px). *Não consegui* conferir a "imagem de antes" porque o poder não substituiu nenhuma. *(Uma segunda cópia do poder, `poder52`, ficou na cena: defeito 5; por isso o quadro 15 não voltou a ser igual)* | | Defeito 4 |
| E12 | Mexo no boneco (movo um osso, mudo a ordem de desenho dele): o poder continua em volta | **vi funcionar** | Com o poder em volta, **movi o osso `torso`** (Posição X na ficha rápida: *"Chave em 0,50 s: Posição X de torso"*) e **mudei a ordem de desenho** de `body` (*Base → Trazer para a frente*: *"Ordem de desenho (chave em 0,50 s)"*): **as duas linhas na Ordem (*na frente (2)* e *atrás (2)*) continuaram lá** depois de cada gesto, e a foto mostra o poder ainda em volta | `E12_apos_osso` | |

## Parte C — o que notei, em especial o que confundiria o Humberto na primeira vez

| # | O que | Foto |
|:---:|:---|:---|
| C1 | **O poder entra na animação que está aberta, e não na base**, e o rodapé diz *"A base e as outras animações ficam sem ela"*. Quem abre o programa já dentro de uma animação (o herói abre no `idle`) e arrasta o poder acha que pôs "no herói" e, quando troca de animação, o poder sumiu | `E7_04_walk` |
| C2 | O botão direito mostra a **grade das imagens do atlas inteira** (24 miniaturas) para escolher "Este boneco": quem queria só o item vê primeiro 24 imagens e tem de descer até o texto | `E1_01_botao_direito` |
| C3 | Depois que o poder está em volta, **nada no menu do botão direito diz que ele já está em volta** (não há marca, nem "Tirar"): só a aba Ordem e a caixa laranja dizem (defeito 1) | `E5_01_menu_com_poder_em_volta` |
| C4 | A **etiqueta laranja** do meio (*"frente1 · o meio (não é desenhado)"*) sai cortada quando o poder está perto da borda da cena | `E4_01_cena_poder_escolhido` |
| C5 | O rodapé de Salvar ainda diz *"1 corpo e o manifesto do projeto baixados"* (concordância) | |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O seletor de pasta e de arquivo do Windows | uma **pasta em memória** com `heroi.bone`, atlas, png, `espada.bone` e o meu `poder5.bone`; **Arquivo → Abrir pasta do projeto…** e **Abrir projeto** com os arquivos juntos; **Entidades → Trazer entidade de fora…** com um arquivo só | que o Salvar grava certo numa pasta de verdade |
| O material | um poder de cinco peças **meu**, e não o `C-311` (sem imagens no atlas) | o caso `C-311` abrir no editor |
| Em bloco / em volta **na base** | **não conferi** | E7, primeira metade |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
