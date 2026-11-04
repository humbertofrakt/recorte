# A aba das entidades conferida — lote 6 (v31.1) — 06/10/2026

Rodada 39b, notas e lote 6. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.1** (o "Sobre" diz v31.1) |
| Como | `programa/` em porta própria (**5360**) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | linhas 1 a 4 **refeitas limpas depois das 12h19**; linhas 5 e 6 de 12h24 a 12h32 (relógio da máquina, 06/10/2026) |
| Fotos | `backup/fotos-obra/rodada-39-conferida/lote6/` (25) |
| Material | o herói, a `espada`, o `mecha`, o `poder5` numa **pasta em memória** (seletor do Windows trocado por falso). Abri por *Abrir projeto* com `heroi.bone`, atlas e png |
| Um tropeço de fora | outro chat (a pesquisa da rodada 40) usou a **mesma porta** que a minha e matou o meu Chrome por volta das 12h08; o roteiro dele pode ter clicado na minha página entre **12h14 e 12h20**. Mudei de porta e **refiz limpo** as linhas 1 a 4. O que vem daquele intervalo não entra aqui |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 3, 6) | **2** (4, 5) | 0 | 6 |

| Linha | Por que pela metade |
|:---:|:---|
| 4 | as peças ficam **no mesmo lugar**; o que muda na tela é só a **grade** (as linhas finas). Não achei diferença na personagem. Mas a foto não pega o que o jogo desenha |
| 5 | o **rodapé** avisa em português e **sem caminho**; o **detalhe** na janela *Problemas do arquivo* continua em **inglês e com o caminho interno** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O detalhe do problema do arquivo está em inglês e mostra o caminho interno.** O rodapé é bom (*"Salvar: parou antes de gravar, porque heroi.bone tem 1 problema. Nada foi gravado"*). Mas o botão *1 aviso — ver* abre *Problemas do arquivo* com: ***/skins/…/sword/uri: nested skeleton "espada.bone" was not provided; placeholder treated as empty (spec 7.11)***. É o que o Humberto lê quando clica em *ver* | 5 | `S_avisos_ver` · `S_salvar_com_problema` |
| 2 | *Pequeno.* **Arrastar o mecha sobre o slot `weapon` não é recusado**: entra como teste *"por cima de espada (que continua no arquivo)"*. O pedido supunha uma recusa. Não é defeito se for de propósito, mas **a recusa que sobra é só uma**: a espada sobre o próprio slot | 6 | `R_durante_mecha` |
| 3 | *Pequeno.* O **"skins ▾"** do cartão de teste **não existe** nesta versão: nenhum cartão, nem o de teste nem o do projeto, tem menu de skins. Só *anima ▾* | 1 | `C1_anima_teste` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Cartão de teste *anima ▾* (parada / a de quem recebe / uma dela) e *skins ▾*; na peça do projeto, escolher em *anima ▾* vira chave na faixa; *livre — o jogo escolhe* | **vi funcionar** | **Cartão de teste (mecha):** *anima ▾* abre **parada · ✓ a de quem recebe · idle**; ao escolher *idle* o rodapé diz *"Mecha toca idle (teste). O arquivo não muda."*. **Peça do projeto (espada):** o menu traz ***livre — o jogo escolhe** · ✓ idle · brilho · attack*; escolher *brilho* grava uma **chave** na faixa *Entidade weapon · Animação*. ***skins ▾*: não existe** (defeito 3) | `C1_anima_teste` · `C2_menu_projeto` · `C2_anima_projeto` · `C3_brilho_na_faixa` |
| 2 | "espada 1 de 2"; *Trocar todas as iguais (N)* troca as duas num passo; `Ctrl+Z` desfaz num passo | **vi funcionar** | Com duas espadas no herói, o cartão passa a dizer ***espada 1 de 2*** e ***espada 2 de 2***. Botão direito na grade: ***Trocar todas as iguais (2)***; escolhi uma peça na grade: as **duas** trocaram; ao ligar, o rodapé diz *"troca nas 2 peças iguais, num passo só"*. **`Ctrl+Z`: uma volta só** devolveu as duas espadas. Repeti: igual | `D1_duas_espadas` · `E1_grade` · `E2_depois_da_troca` |
| 3 | O mecha em volta toca a animação no relógio da linha do tempo; o herói segue o banco | **vi funcionar** | Herói dentro do mecha em teste, *Na cena* ligado. Com *anima: a de quem recebe* o rodapé diz ***"Mecha toca a animação de quem a recebe (teste)"***. Fotografei os quadros **0, 15 e 30** do `idle`: a caixa do herói gira e o ângulo da espada do mecha muda (**11.285 pixels diferentes** entre o quadro 0 e o 30). **Com *idle* escolhido, as três fotos saem iguais às de *a de quem recebe***: faz sentido, porque o herói também está em `idle` | `K_q0` · `K_q15` · `K_q30` · `K_mecha_idle_q0_15_30` |
| 4 | *Pôr no projeto* para cima: peças antes e depois no mesmo lugar, pixel por pixel; só a grade mexe | **pela metade** | Fotos do **antes** e do **depois** de *Pôr no projeto* (rodapé: *"Mecha entrou em heroi, com Este boneco no body… Agora heroi LEVA mecha"*). Pixels diferentes: **4,7 %** do recorte, **quase todos linhas horizontais da grade e réguas** (a grade andou). A **personagem e as peças** parecem idênticas na foto. **Pela metade** porque conferi **por olho e por diferença de pixels** numa foto, não a posição de cada peça em número | `H_antes` · `H_depois` · `H_antes_e_depois` · `H_antes_depois_diferenca` |
| 5 | *Salvar* com problema no arquivo avisa em português, sem caminho interno | **pela metade** | Abri o herói **sem** a `espada.bone` (*"A entidade espada.bone não foi aberta; esse slot fica vazio"*; no cartão: ***? espada · falta o arquivo***). `Ctrl+S`: ***"Salvar: parou antes de gravar, porque heroi.bone tem 1 problema. Nada foi gravado"*** (português, **sem caminho**, ✓). Mas o *"1 aviso — ver"* abre a janela com texto **em inglês e com o caminho** (defeito 1) | `S_salvar_com_problema` · `S_avisos_ver` |
| 6 | Arrastar para uma linha que recusa: a linha fica vermelha e o rodapé diz por quê | **vi funcionar** | **Espada da prateleira sobre o próprio slot `weapon`:** durante o arrasto o slot ganha um **contorno vermelho** e o rodapé diz ***"Espada já está no slot weapon, gravada no arquivo: arraste outra entidade"***; solto, nada muda. **Mecha sobre `weapon`:** **não** recusa (defeito 2); aceita como teste: *"Mecha no slot weapon, por cima de espada (que continua no arquivo): teste. A animação não muda"* | `R_durante_espada` · `R_durante_mecha` · `R_mecha_no_weapon` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | Nos lotes 4 e 5 **não consegui provocar** a linha vermelha; agora provoquei. **A causa era minha:** arrastei de uma posição com o **nome** da peça no lugar das coordenadas, então o arrasto nem começava. A régua que tirei daquilo (*"a linha não fica vermelha"*) **estava errada**: o defeito era do meu roteiro |
| C2 | Depois de **um** arrasto interceptado e **não solto**, o Chrome deixa o arrasto pendente e os seguintes não começam. Só se resolve com *dragCancel* ou página nova. É da minha ferramenta, não do programa |
| C3 | Trazer uma entidade de fora **duas vezes seguidas** às vezes só responde *"Arquivo salvo."* e não traz. Repetir sozinha resolve. Vi isso em quase todos os lotes; **não sei se é do programa ou do meu falso seletor** |
| C4 | O cartão do projeto mostra *espada 1 de 2* e *espada 2 de 2* **em slots com nomes diferentes** (`weapon` e `espada`): ajuda, mas o nome do slot não diz qual é qual |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo | pasta em memória | Salvar e abrir numa pasta de verdade |
| Arrasto | arrasto de verdade interceptado por protocolo, com `dragEnter`/`dragOver`/`drop` mandados por mim | o arrasto com a mão |
| *Salvar com problema* | apaguei a `espada.bone` da pasta em memória e reabri | um arquivo que some de verdade do disco |
| Linhas 1 a 4 | **refeitas limpas depois das 12h19** | o que passou entre 12h14 e 12h20 (possível mexida de outro chat; descartado) |
| *skins ▾* | **não achei**; entidades daqui não têm skins | que o menu **não** exista em outra entidade com skins |
| *Pôr no projeto*, "mesmo lugar" | foto e diferença de pixels | a posição em número, e o que o jogo desenha |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
