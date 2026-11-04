# A mão do Humberto conferida — rodada 48, lote 2 (v36.0) — 07/10/2026

Rodada 48, lote 2 (itens 2, 4 e 5 da ficha, mais o acréscimo do Diretor). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v36.0** (servi o zip `recorte v36.0 2026-10-07.zip`, extraído fora da pasta; o zip é das 09h39). **O "Sobre" diz *"Versão v35.9"* e o `LEIA-ME.txt` do zip diz *"Versao v35.9, montada em 07/10/2026"*** (defeito 1) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 09h40 a 09h43, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-48-conferida/lote2/` (5) |
| Material | o herói; o `heroi.bone` solto numa pasta vazia (43 avisos); a exportação de um PNG sem pasta de projeto. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Não se prova aqui | Total |
|:---:|:---:|:---:|:---:|:---:|
| **0** | **1** (8) | **5** (1, 3, 4, 5, 6) | **1** (2) | 7 |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 1 | O Sobre e o LEIA-ME dizem a versão certa (v36.0) | **não funciona** (dizem v35.9) |
| 2 | Soltar uma pasta do Explorer abre aquela pasta | **não se prova num Chrome sem janela** |
| 3 | Ordem em 720 com linhas de 28 px ou mais | **não funciona** (22 px; 3 linhas, clicáveis) |
| 4 | Exportar sem pasta: o rodapé diz a pasta (Downloads) | **não funciona** (a janela diz, o rodapé não) |
| 5 | Os avisos *"imagem não encontrada"* agrupam num tipo só | **não funciona** |
| 6 | A janela de avisos abre com um parágrafo | **não funciona** (dois) |
| 8 | O relatório da 48 e o doc `89` trazem o passo da pasta solta | **pela metade** (o `89` traz; a ficha não) |

*(O acréscimo do Diretor numerava 5, 6, 7 e 8; as linhas acima são minhas, na ordem em que conferi. A linha 5 e a 6 são as do item "avisos".)*

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A etiqueta de versão ficou uma atrás, de novo.** *Ajuda → Sobre o Recorte*: ***"Versão v35.9"***; `programa/LEIA-ME.txt` do zip: ***"Versao v35.9, montada em 07/10/2026"***, num zip **v36.0**. **É o mesmo defeito do doc `95`** (lá, v35.8 num zip v35.9): a regra 14 (*"número de versão na hora do fecho"*) continua furada; **o `montar-programa.py` roda antes do `versao.py`** | 1 | — |
| 2 | **As linhas da Ordem em 720 seguem em 22 px.** Recarreguei em 1280×720 e abri o herói: lista **81 px**, **3** linhas inteiras (`hand`, `weapon`, `arma`), **cada uma com 22 px** (`arma`, 24). O pedido era **28 px ou mais**. As três **respondem ao clique** (`hand` e `weapon` ficaram escolhidas; `arma`, que é a cabeça da pasta, **muda o fundo da cabeça**, e `weapon` continua escolhida) | 3 | `C0_ordem_720` · `C1_ordem_720_cliques` |
| 3 | **O rodapé da exportação não diz a pasta.** Sem pasta de projeto, *Arquivo → Exportar → GIF, PNG, folha, vídeo… → PNG → Só este quadro → Exportar*: a **janela** que abre diz ***"Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)"***; **depois de fechar a janela, o rodapé** diz ***"Sequência de imagens PNG: 1 quadro de 110x241, 1 arquivo(s), 31.694 bytes."***: **nenhuma palavra sobre a pasta**. **Igual à v35.9** | 4 | `B0_exportar_depois` |
| 4 | **Os avisos *"imagem não encontrada: NOME"* ainda não agrupam.** *Heroi.bone* solto numa pasta sem atlas: a barra diz ***"43 avisos (21 iguais) — ver"*** (**43**, não 42: apareceu ***"falta o arquivo da entidade espada.bone"***, que é **verdade**: a pasta não o tem). A dica e a janela: ***"23 tipos de aviso, o pior primeiro: 21 × imagem "…" não está em nenhum atlas; o desenho fica invisível; 1 × falta o arquivo da entidade espada.bone…; 1 × imagem não encontrada: cape_upper; 1 × imagem não encontrada: cape_lower; 1 × … e mais 17 tipos"***. **Os 21 *"imagem não encontrada: NOME"* continuam 21 tipos** (e a janela lista **seis** deles pelo nome). **Igual à v35.9** | 5 | `C0_janela_avisos` |
| 5 | **A janela de avisos abre com dois parágrafos que dizem a mesma coisa**: o dos *"23 tipos de aviso, o pior primeiro: …"* (cinco linhas) e o ***"21 imagens não estão em atlas nenhum, e os desenhos delas ficam invisíveis: cape_upper, cape_lower, hair, arm_back, forearm_back, hand_back, thigh_back, shin_back e mais 13…"***. **Igual à v35.9** | 6 | `C0_janela_avisos` |
| 6 | *Pequeno.* **O passo da pasta solta no doc `89` não diz *para onde* soltar.** Dois itens no mesmo arquivo: o da linha **2** da tabela de cima (*"arraste a pasta `exemplo/game/mao` do Explorer **para a cena**"*) e o da linha **2** de *"07/10 — a rodada 48"* (*"arrastar `exemplo/game/mao` do Explorer. Se o Chrome pedir "permitir editar?" ao Salvar, é a licença de gravar: uma vez só"*): **o novo não diz "para a cena"** (o antigo, sim) e **não diz o que ele deve ver** (isso está na coluna da esquerda: *"A pasta mao abriu como projeto, pelo arrasto: 2 imagens"*) | 8 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | O Sobre e o LEIA-ME dizem a versão certa (v36.0) | **não funciona** | Defeito 1: **v35.9** nos dois | — |
| 2 | Soltar uma pasta do Explorer abre aquela pasta, sem o seletor do Windows | **não se prova aqui** | **Num Chrome sem janela não dá para soltar uma pasta do Explorer.** O `CHANGELOG` da v36.0 diz: *"O rodapé diz: "A pasta mao abriu como projeto, pelo arrasto: 2 imagens na aba Imagens""* e o `89` diz que a rodada **provou com uma pasta de verdade do navegador** (*"0 seletores"*). **Não vi.** Fica para a mão do Humberto: **o passo está no `89`** (linha 8) | — |
| 3 | Ordem em 720 com linhas de 28 px ou mais | **não funciona** | Defeito 2: **22 px** | `C0_ordem_720` · `C1_ordem_720_cliques` |
| 4 | Exportar sem pasta: o **rodapé** diz a pasta | **não funciona** | Defeito 3 | `B0_exportar_depois` |
| 5 | Avisos *"imagem não encontrada"* num tipo só, com os nomes dentro | **não funciona** | Defeito 4 | `C0_janela_avisos` |
| 6 | A janela de avisos abre com um parágrafo | **não funciona** | Defeito 5 | `C0_janela_avisos` |
| 8 | O relatório da 48 e o `89` trazem o passo exato da pasta solta | **pela metade** | O **`89`** traz o passo (*"arrastar `exemplo/game/mao` do Explorer. Se o Chrome pedir "permitir editar?" ao Salvar, é a licença de gravar: uma vez só"*): **uma linha, curta, com a ressalva do Chrome**; **é claro** para quem sabe onde soltar (na cena). **A ficha `RODADA 48` não traz relatório nenhum** (só as linhas do Humberto e as réguas). Defeito 6 | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O aviso novo, ***"falta o arquivo da entidade espada.bone: ela não foi aberta, e o lugar dela fica vazio. Traga espada.bone para a pasta do projeto"***, **é bom**: diz o que falta **e o que fazer**; e aparece **em segundo** (depois do grupo das imagens), como *"o pior primeiro"* promete |
| C2 | A barra *"43 avisos (21 iguais) — ver"* **está certa** com a janela (*"43 problemas, 21 com conserto aqui"*) |
| C3 | O relatório da exportação (**dentro da janela**) é **claro** (*Animação, Quadros, Tamanho, Arquivos, Pasta*): o que falta é **uma frase igual no rodapé**, que é o que **sobra na tela** depois de fechar a janela |
| C4 | Esta versão **não mexeu** em nada que eu conferi como mudança (Ordem, rodapé, avisos): o `CHANGELOG` da v36.0 só trata da **pasta solta** e do `89` |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A pasta solta | **não** provei: sem janela, sem Explorer | o item **2**, inteiro |
| O `heroi.bone` solto | aberto no armazenamento privado do Chrome | arquivo de outra espécie, o `pularmachini` |
| A pasta *Downloads* | **só li a frase** (como o Diretor pediu) | onde o PNG caiu |
| O 1280×720 | **mudei a janela** do Chrome por protocolo e **recarreguei** | o 1280 de verdade |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
