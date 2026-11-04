# A janela solta conferida — rodada 50, lote 1 (v36.2) — 07/10/2026

Rodada 50, lote 1 (o doc `98`, item C: a aba solta da parede e a barra arrastada). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v36.2** (servi o zip `recorte v36.2 2026-10-07.zip`, extraído fora da pasta; o zip é das 13h38). O "Sobre" diz ***"Versão v36.2"*** e o `LEIA-ME.txt` do zip, ***"Versao v36.2"*** |
| **Como — leia isto** | **só por protocolo**: o Chrome sem janela da minha máquina de prova, com o **mouse e o teclado entregues por protocolo** (mouse apertado, movido em 20 a 24 passos, solto), **não** o mouse do navegador do aplicativo, nem uma mão. Os arrastos de aba e de barra são **de ponteiro** (não os de arrastar-e-soltar do navegador), então **o protocolo os exerce de verdade**; **não prova** a sensação nem a velocidade da mão |
| Hora | 13h38 a 13h42, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-50-conferida/lote1/` (8) |
| Material | o herói de exemplo. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 2, 3) | 0 | 0 | 3 |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Soltar uma aba da parede: o painel flutua **com o corpo** (nada vazio) e **não sobra aba órfã** no grupo de origem | **vi funcionar** | **O caso do defeito** (a Ordem levada para a direita e solta de lá): arrastei a aba ***Ordem*** da coluna da esquerda para a tira da coluna da direita (ficou ***Imagens\|Ordem***), e **dali** arrastei-a para a cena. **Resultado:** uma janela solta ***Ordem*** (280×320 px) **com o corpo** (a barra de seis botões, ***FRENTE***, as linhas ***hand***, ***weapon***, ***arma*** com as miniaturas) e **nenhuma aba *Ordem* em grupo nenhum** (a direita voltou a ***Imagens\|Entidades***). O rodapé diz ***"Ordem solto. Arraste a barra dele até uma tira de abas para colar de volta"***. **Repeti** soltando a Ordem **direto da esquerda**: o mesmo. **Recarreguei a página** com a janela solta: ela **volta com o corpo** (280×320) e **sem aba órfã** | `B0_ordem_na_direita` · `B1_ordem_solta` · `G0_depois_de_recarregar` |
| 2 | Arrastar a barra do painel solto até uma tira de abas: cola **onde** a linha azul mostrou, não no grupo de origem | **vi funcionar** | **(a)** barra da Ordem solta → **tira da Árvore** (esquerda, em cima): durante o arrasto **a linha azul** (4×31 px) apareceu **depois da aba *Árvore*** e o **contorno** do grupo; soltei: ficou ***Árvore\|Ordem***, **no lugar da linha**. **(b)** *(para **não** ser o grupo de origem)* soltei a Ordem de novo e arrastei a barra à **tira de baixo da direita** (a das *Animações*): o **contorno** apareceu sobre **aquele** grupo (x 1662, y 644); soltei: ficou ***Animações\|Ordem***, e o grupo de origem (a esquerda) **continuou só com a *Árvore***. O rodapé: ***"Ordem: colado de volta"*** | `C0_arrasto_barra_linha_azul` · `C1_depois_de_soltar_a_barra` · `D0_linha_azul_na_tira_de_baixo` · `D1_depois_de_soltar` |
| 3 | *Voltar ao padrão*, o ▾ e o » continuam | **vi funcionar** | **»:** no grupo de baixo da direita ***"Mais 3 abas: Skins, Regras, Histórico. Clique para escolher uma"***, e a lista **tem** as três. **▾:** recolheu o grupo (***"Animações, Skins, Ordem, Regras, Histórico: recolhido. O espaço foi para o outro painel"***), e o ▸ **trouxe de volta** (***"…: de volta"***). ***Padrão ▾ → Voltar ao padrão do contexto***: com a Ordem no grupo da direita, o rodapé diz ***"Painéis de volta ao padrão"*** e a Ordem **voltou à esquerda** (*Árvore\|Ordem*, e *Animações\|Skins* à direita); **nenhuma janela solta ficou** | `F1_depois_de_voltar_ao_padrao` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **O rodapé durante a janela solta diz o que fazer**: ***"Ordem solto. Arraste a barra dele até uma tira de abas para colar de volta"***. Bom. *(Concordância: ***"Ordem solto"***: o lote 4 da rodada 50 trata disso)* |
| C2 | Soltar a barra **sobre a parte vazia** da tira (à direita das abas) **mostra só o contorno**, sem linha azul, e **cola no fim**: o contorno **basta** para saber **qual** grupo |
| C3 | O grupo de baixo da direita **cresce** quando recebe a aba (de 203 para ~470 px): é o comportamento que já havia |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Os arrastos | mouse e teclado **por protocolo** (20 a 24 passos, solto), **não** o mouse do aplicativo | a sensação da mão, a sombra seguindo o dedo, o cursor |
| A linha azul | **li o elemento** (`panel-drop-linha`) durante o arrasto e fotografei: **vi no desenho** só no caso (a), na (b) só o contorno | o desenho da linha em todos os alvos |
| O que **não** movi | só a **Ordem**; **não** soltei as outras abas (Propriedades, Prévia…) | que **todas** as abas soltam com o corpo |
| O 1280×720 | **não** conferi | — |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
