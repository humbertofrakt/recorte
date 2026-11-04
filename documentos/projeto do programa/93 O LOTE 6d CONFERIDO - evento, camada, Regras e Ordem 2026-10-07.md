# O lote 6d conferido — evento, camada, Regras e Ordem (v35.7) — 07/10/2026

Rodada 47, lote 6d. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.7** (o "Sobre" diz v35.7; servi o zip `recorte v35.7 2026-10-07.zip`, extraído fora da pasta; o zip é das 09h09) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 09h09 a 09h11, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote6d/` (6) |
| Material | o herói, a `idle`; as seções da Regras **abri e fechei**. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |
| Nota | a lista: *evento com dica e explicação · camada explicada sem "cor de slot, morphs, tags" · Regras em 1920 dobra e não rola · Ordem em 720 com 3 linhas*. O `ESTADO.md`, da v35.7: *"as seções da aba Regras dobram no título; a Prévia diz o que é uma camada, sem slot/morphs/tags; o evento, o Som e o Texto com dica"* |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (2, 3) | **2** (1, 4) | 0 | 4 |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 1 | Ordem em 720 com 3 linhas | **pela metade** (2 inteiras, **igual à v35.6**) |
| 2 | Camada explicada sem *"cor de slot, morphs, tags"* | **vi funcionar** |
| 3 | Regras em 1920 dobra e não rola | **vi funcionar** |
| 4 | Evento com dica e explicação | **pela metade** (o *Texto* ficou sem dica) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A Ordem em 1280×720 ainda mostra duas linhas inteiras, não três.** Corpo **122 px**, lista **81 px**, linhas de **31 px**: cabem `hand` e `weapon`; a terceira (`arma`) **não**. **Igual à v35.6**: a v35.7 não mexeu | 1 | `A0_ordem_720` |
| 2 | **O *Texto* da chave de evento continua sem dica.** O rótulo (*Texto*) e a caixa **não têm `title` nem `aria-label`**; a caixa só diz, de cinza, ***"o padrão do formato"***. O `ESTADO.md` diz *"o evento, o Som e o Texto com dica"*: **o evento e o Som têm, o Texto não** | 4 | `D1_evento_texto` |
| 3 | *Pequeno.* **Com as quatro seções abertas, a Regras volta a rolar** (721 px para 380): é o esperado, **mas** quem as abre todas **não vê** que há mais (nenhum aviso) | 3 | `B1_regras_tudo_aberto` |
| 4 | *Pequeno.* **A Prévia, em 1920, segue rolando** (736 px para 412 com a *Camada 0* aberta). Não era desta lista; **continua como no doc `92`** | — | `C0_previa` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Em 720, a Ordem mostra 3 linhas | **pela metade** | Defeito 1: **2 inteiras** | `A0_ordem_720` |
| 2 | A camada explicada, sem *"cor de slot, morphs, tags"* | **vi funcionar** | Embaixo do tempo da camada 0: ***"Cada camada toca uma animação. A de cima cobre a de baixo nos ossos que marca."*** O título de cada camada tem dica: ***"Camada: uma animação que toca por cima da de baixo, só nos ossos que ela marca. Clique para abrir e fechar"***. No *Copiar*, o *"O que se perde"* agora diz ***"Ficam de fora: eventos, a ordem das peças, a cor das peças, a malha, a troca de imagens, os parâmetros, as formas de mistura, as variáveis e as etiquetas."*** (**sem *slot*, *morphs* nem *tags***). *(Ficaram os **parâmetros** e a **malha**: são palavras do programa, ele as usa em outros painéis.)* | `C0_previa` |
| 3 | A Regras em 1920 dobra e não rola | **vi funcionar** | Corpo **472 px**, **nada rola**. As quatro seções são **títulos dobráveis** com **contagem**: ***PARÂMETROS · 1*** ▸ (fechada), ***REGRAS*** ▾ (aberta, as cinco regras), ***VARIÁVEIS · 2*** ▸ (fechada), ***ETIQUETAS · 3*** ▸ (fechada). Clicar no título **abre** (`aria-expanded` de `false` a `true`) e a contagem **some**; fechar a *Regras* mostra ***REGRAS · 5***. **Variáveis aberta:** 452 para 380 (rola 72 px); **Etiquetas também:** 673; **as quatro abertas:** 721 (era assim na v35.6, sem dobra). **Por padrão cabe sem rolar** | `B0_regras_1920` · `B1_regras_tudo_aberto` |
| 4 | O evento, o Som e o Texto com dica e explicação | **pela metade** | ***Evento***: ***"um aviso com nome que a animação dá ao jogo num instante (um passo, um golpe). O jogo ouve e faz o resto: toca o som, tira a vida"*** (**é a explicação que faltava**). ***Som***: ***"o arquivo que toca quando o evento chega, dentro da pasta dos sons. Vazio: o evento é mudo"***. ***Pasta dos sons***: ***"onde o jogo procura o som de todos os eventos, a partir do arquivo"***. *Inteiro*, *Decimal*, *Volume*, *Balanço*: **continuam claras**. **O *Texto*: sem dica** (defeito 2) | `D0_chave_evento` · `D1_evento_texto` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A explicação do ***Evento*** (*"um aviso com nome … (um passo, um golpe)"*) **responde ao que o doc `92` pediu**: quem nunca viu um evento entende a ideia |
| C2 | A **contagem** ao lado do título dobrado (***VARIÁVEIS · 2***) **diz o que há dentro** sem abrir |
| C3 | A frase da camada tem **duas partes** (a do corpo, abaixo do tempo; a da dica, no título): **não se repetem** |
| C4 | Com a Regras dobrada, o painel **sobra altura**: dá para **abrir uma seção por vez** sem rolar |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O 1280×720 | **mudei a janela** do Chrome por protocolo e **recarreguei** | o 1280 de verdade |
| *"Explicada"* | **li** os textos e **julguei** | o que um novato entende |
| A Regras dobrada | **só em 1920** | em 1280 (não medi) |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
