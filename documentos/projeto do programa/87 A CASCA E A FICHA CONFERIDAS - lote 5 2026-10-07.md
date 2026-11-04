# A casca e a ficha conferidas — lote 5 (v35.2) — 07/10/2026

Rodada 47, lote 5. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.2** (o "Sobre" diz v35.2; servi o zip `recorte v35.2 2026-10-07.zip`, extraído fora da pasta; o zip apareceu às 05h38) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 05h48 a 05h52, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote5/` (10) |
| Material | o herói de exemplo, na base e na `idle`. **Copiei a pose** e **colei espelhado** (e **desfiz**, o rodapé disse *"Desfeito: Colar espelhado"*); **virei o desenho `body` em malha** para ver as abas da Malha (**nada salvo**: recarreguei a página no meio). **Não rodei `medir`, roteiro nem pesos** |
| Nota de numeração | a lista chegou em itens soltos; **as linhas abaixo são minhas, na ordem em que conferi** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (1, 2) | **4** (3, 4, 5, 6) | 0 | 6 |

| Linha | Por que pela metade |
|:---:|:---|
| 3 | a **Malha dobra por ferramenta** (o *Pincel* só abre com a ferramenta *Pesos*), **mas a aba tem 288 px** em 1920×1080 e o conteúdo **455** (Malha) ou **594** (Pesos): **rola** |
| 4 | a **Montagem** e a **Prateleira** estão **lidas e à vista**, **mas a Montagem só mostra 1 das 4 linhas** (caixa de 60 px com rolagem própria, dentro da rolagem da aba) |
| 5 | em **1280×720** o grupo da coluna tem **123 px**: o que é fixo **cabe** na Entidades (*Na cena*, *Pôr no projeto*), **mas** na Malha só cabem os dois títulos e na Exibição só o *Voltar ao padrão* e o primeiro título; **o resto rola** |
| 6 | o número da altura **foi lido** no `ESTADO.md`: **81 de 90, igual ao da v35.1**; **não subiu** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A aba da Malha rola em 1920×1080.** O grupo tem **288 px** de corpo; o conteúdo da Malha com uma malha escolhida mede **455 px** (**594 px** com a ferramenta *Pesos*, que abre o *Pincel*). Aparecem *Desenho escolhido*, *Forma* e dois botões; *Ossos que influenciam*, *Pesos* e o *Pincel* ficam **fora de vista**. O pedido falava de **uns 510 px sem rolagem** | 3 | `E1_malha` · `E1_pesos` |
| 2 | **A Montagem das Entidades mostra uma linha de quatro.** Em 1920, a aba tem 288 px (conteúdo 305: rola pouco), **mas a seção *Montagem* é uma caixa de 60 px com rolagem própria** (conteúdo 163). Vê-se só ***heroi · AQUI***; as linhas ***weapon***, ***espada · projeto · anima: idle ▾*** e ***+ 22 outras imagens*** **só se veem rolando dentro da caixa**. A *Prateleira* **aparece**, mas o cartão da `espada` sai **cortado** na borda de baixo. **Duas rolagens uma dentro da outra** (a da aba e a da Montagem) | 4 | `F0_entidades` |
| 3 | **Em 1280×720 o grupo da direita tem 123 px de corpo.** *Entidades:* **cabem** *Na cena* e *Pôr no projeto* (os dois botões fixos); *Montagem* e *Prateleira* **ficam abaixo, fora de vista**. *Malha e pesos:* **cabem** *Desenho escolhido* e o título *Forma*; os cinco botões da Forma e o resto **rolam**. *Exibição:* corpo de 81 px; **cabem** *Voltar ao padrão* e o título *Mostrar na tela*; o resto **rola**. **O que dobra** (▸) é o *Mostrar na tela* e *A cena*, **mas abertos**: não vi nenhuma dobra **já fechada** por falta de espaço | 5 | `H_Entidades_1280_topo` · `H_Malha_1280_topo` · `H_Exibição_1280_topo` |
| 4 | **A altura não subiu.** O `ESTADO.md` (linha **9**, escrita às **05h48**, citando o `medir` das **05h47**, *"com a casa vazia"*) diz ***"81 de 90 de altura … igual à v35.1"***; as 9 que rolam são ***"Propriedades, Exibição, Prévia, Malha e pesos, regra Comando"***. O plano da rodada dizia **"só pode SUBIR"**. *(Número lido, não medido por mim: a regra da casa é do chat que fecha.)* **O que vi com os olhos bate com ele:** a Malha e a Exibição **rolam** (defeitos 1 e 3) | 6 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | O *Colar espelhado* fica ao lado do *Colar* | **vi funcionar** | Menu *Editar*: ***Colar*** (Ctrl+V) e **logo abaixo *Colar espelhado*** (antes ficava em *Editar → Pose*; **o submenu *Pose* já não o traz**: só *Copiar a pose inteira*, *Copiar a pose do escolhido*, *Colar em todas as chaves* e os três *Meio-termo*). Sem pose copiada fica **cinza**, com a dica ***"Cola a pose trocando esquerda e direita pelo nome. Era Editar → Pose → Colar espelhado"***. Com a `idle` aberta, **copiei a pose** (rodapé ***"Pose de 0,00 s copiada: 20 valores."***) e o item **acendeu**; **cliquei**: ***"Colado espelhado: 4 valores trocados de lado."***; **Ctrl+Z**: ***"Desfeito: Colar espelhado."*** | `B3_colar_espelhado_ativo` |
| 2 | A ficha do desenho não repete *Imagem*: fica *Imagem* e *Arquivo* | **vi funcionar** | Desenho `body`: a **ficha rápida** traz ***Imagem*** (o seletor, com a miniatura) e a seção ***Desenho*** traz ***Nome*** e ***Arquivo*** (o mesmo seletor, `body`). **Nenhuma *Imagem* repetida.** *Posição e forma* continua com *Largura* e *Altura* | `C1_ficha_desenho_rolada` |
| 3 | A Malha e pesos dobra por ferramenta; sem rolagem em 1920 (uns 510 px); o recado azul sem *"…"* | **pela metade** | **Por ferramenta:** com **Malha**, **Transformar** e **Selecionar** o *Pincel* fica **fechado**; com **Pesos** ele **abre**. *Avançado: malha ligada* fica **fechado** nas quatro. **Rolagem:** defeito 1. **Recado:** o rodapé diz ***"Malha: escolha um desenho com malha. Clique num vértice e arraste; Ctrl+clique no vazio cria um vértice."*** e ***"Pesos: escolha o osso na Árvore e pinte os vértices da malha. [ e ] mudam o raio."***, **inteiros**, sem *"…"*; o recado da aba é ***"Forma e pesos gravam na base"*** (curto). *(Não sei qual dos recados é o "azul" do pedido: os que vi não cortam.)* | `E1_malha` · `E1_pesos` |
| 4 | A aba Entidades: a Montagem se lê e a Prateleira aparece | **pela metade** | ***Montagem*** (título), ***heroi · AQUI*** (cartão azul, **legível**); ***Prateleira · arraste para um slot*** com o cartão da `espada` (**cortado** embaixo). Defeito 2 | `F0_entidades` |
| 5 | Em 1280×720 a parte fixa da ferramenta cabe na Malha, na Exibição e nas Entidades; o resto dobra ou rola | **pela metade** | Defeito 3: o **fixo cabe**, mas **a coluna deixa 123 px** e quase nada além dele aparece | `H_Entidades_1280_topo` · `H_Malha_1280_topo` · `H_Exibição_1280_topo` |
| 6 | O número da altura (lido no `ESTADO.md`): subiu? | **pela metade** | **81 de 90**, igual ao de antes: defeito 4 | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **Colar espelhado** agora está **onde se procura** e a dica **diz onde ele estava** (*"Era Editar → Pose → Colar espelhado"*): quem o buscava no lugar velho se acha |
| C2 | A ficha do desenho **tem os dois nomes certos**: *Imagem* para escolher, *Arquivo* para saber qual é |
| C3 | A coluna da direita, **sem animação aberta**, reparte **288 px em cima e 163 embaixo**; com a `idle` aberta **a mesma conta** (não mudou). Quem quer ver mais da Malha tem de **arrastar a divisa** (não testei se ela anda e fica) |
| C4 | O recado do rodapé da Malha e dos Pesos é **inteiro** e **diz a tecla** (*"[ e ] mudam o raio"*): bom |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A *Malha* | **virei o `body` em malha** (editando, não salvo; recarreguei depois e refiz) | a Malha de um desenho que **já tem** malha no arquivo |
| O 1280×720 | **mudei a janela do Chrome** por protocolo (`1280×720`) sem recarregar | o 1280 de um computador de verdade (o rodapé e as faixas **vi**; só medi os três painéis do pedido) |
| A divisa dos grupos | **não** arrastei | se o usuário consegue dar mais altura à Malha |
| O *recado azul* | **não achei** qual é: li o do rodapé e o da aba | — |
| O número 81 de 90 | **li do `ESTADO.md`**; os 5 painéis dele **conferi a olho** (Malha e Exibição rolam) | os outros 85 |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
