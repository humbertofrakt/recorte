# As partículas conferidas — lote 6 (v31.2) — 06/10/2026

Rodada 38, lote 6, "o que faltou da prova final". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.2** (o "Sobre" diz v31.2). O `programa/` da pasta já era a v31.3; **tirei a v31.2 do zip `backup/versoes/recorte v31.2 2026-10-06.zip` e a servi à parte**, para conferir a versão pedida |
| Como | porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 12h34 a 12h39, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-38-conferida/lote6/` (10) |
| Material | o herói de exemplo, aberto pelo próprio programa; cena **limpa** (conferi: *"Nenhum emissor"* antes de cada coisa). **As duas cores** da faísca do vazio foram escritas por uma linha de código (o seletor de cor do sistema não abre sem janela) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 2, 3) | **1** (4) | 0 | 4 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A faísca do vazio custa 16 passos, não 10.** Os 10 de ficha (taxa 0 · vida de/a · velocidade de/a · gravidade Y · tamanho de/a · duas cores) **mais** os 5 da rajada (abrir *Rajadas*, o **+**, *Quantas* 30, *Vezes* 2, *A cada* 0,4 s) **e mais 1 que ninguém diz**: sem *Abertura (±°)* a faísca sobe numa **coluna amarela só**, e não vira faísca (com Abertura = 60 abriu em leque) | 4 | `W_serie` · `Y_serie` |
| 2 | *Pequeno.* A faísca do vazio sai **pálida**: o amarelo e o **branco** quase somem no fundo claro da cena; só se destaca em cima da perna escura | 4 | `Y_serie` |
| 3 | *Pequeno.* A dica da porta **Poeira** diz vida, velocidade e tamanho, **mas não a cor**; as outras três dizem | 2 | `M_menu_particulas` |
| 4 | *Pequeno.* A faísca pronta é **laranja e se vê**, mas **fraca**: pontos borrados e pálidos, sem brilho. Bem melhor que o *"quase invisível"* do lote 5, mas ainda não é uma faísca que **salta aos olhos** | 1 | `F5_zoom_0_35s` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Partículas → Novo: faísca: se vê de primeira, laranja, no primeiro estouro; foto em cena limpa | **vi funcionar** | O rodapé diz *"Faísca: emissor foot_b_particulas no osso foot_b… Toque a animação para ver. A imagem fx/ponto-suave entrou junto"*. Tocando `idle`, **pontos laranja** espalham-se em volta do pé a partir de 0,2 s. **Se vê, é laranja.** Fraco (defeito 4) | `F0_faisca_nasce` · `F_faisca_tres_instantes` · `F5_zoom_0_35s` |
| 2 | A dica de cada porta diz os números (vida, velocidade, tamanho, cor) | **vi funcionar** | **Fogo:** *"vida curta (0,6 a 1 s), sobe rápido (60 a 110 px/s), tamanho 1,6 a 2,4, encolhe, amarelo e vermelho"*. **Fumaça:** *"vida longa (1,8 a 2,6 s), sobe devagar (30 a 55 px/s), tamanho 1,6 a 2,2, cresce 2,5 vezes, cinza escuro"*. **Faísca:** *"dois estouros de 40, vida curtíssima (0,3 a 0,6 s), rápida (180 a 320 px/s), tamanho 0,7 a 1,1, laranja, cai"*. **Poeira:** *"nasce numa faixa (40 × 4), vida (0,6 a 1 s), devagar (10 a 30 px/s), tamanho 0,5 a 0,9, cresce e assenta"* (**sem cor**, defeito 3) | `M_menu_particulas` |
| 3 | A dica do Tamanho diz o típico por tipo | **vi funcionar** | ***"Tamanho (fator) — fator da imagem, de 0 para cima: 1 é o tamanho dela, 2 o dobro. Típico: fumaça 1,6 a 2,2 (e cresce na vida), fogo 1,6 a 2,4, faísca 0,7 a 1,1"***. Responde ao tropeço do lote 5 (*"nada diz o que é grande demais"*). Falta a poeira (0,5 a 0,9) | `T_aba_tamanho` |
| 4 | Faísca do vazio em 10 passos, cena limpa, com foto | **pela metade** | Cena limpa (*"Nenhum emissor"*), *Novo emissor vazio* (nasce *leve · 20*) e montei: **taxa 0 · vida 0,3 e 0,6 · velocidade 180 e 320 · gravidade Y −400 · tamanho 0,6 e 1 · cores #ffc800 e #ffffff** (10 passos, as cores por código). Rajada: *Rajadas* → **+** → *Quantas* 30 · *Vezes* 2 · *A cada* 0,4 s (**5 passos**; selo *"leve · 60"*). **Tocando:** os 30 nascem **numa coluna amarela** que sobe pela perna e some. **Com *Abertura (±°)* = 60** (passo 16) saem em **leque**, pálidos. **Não foram 10 passos**: 16 (defeito 1) | `J_rajadas` · `J_rajada_30x2` · `W_serie` · `Y_serie` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A janela *Rajadas* é clara: vazia, diz *"Nenhuma rajada. O + põe uma: várias partículas de uma vez"*; a linha nova tem cinco caixas (*Quando · Quantas · Vezes · A cada · Chance*) com dica cada |
| C2 | A dica da *Velocidade* repete o típico (*"fumaça 30 a 60, fogo 60 a 110, faísca 180 a 320"*): a receita da faísca está **toda** nas dicas, **menos a Abertura** |
| C3 | Uma barra *"1 aviso — ver"* apareceu por um instante na hora de mexer nas cores; **não li o texto** (sumiu quando fui ver) |
| C4 | Errei um passo meu: pus 60 na **Velocidade máxima** em vez de na Abertura (o campo da Abertura **não tem dica no título**: só rótulo). Corrigi e refiz. A dica da Abertura é mesmo difícil de achar |

## A rodada 38 está FEITA?

**Quase.** Fora o seletor de cor (a mão do Humberto):

| O que ficou | Por quê |
|:---|:---|
| A **receita da faísca** do vazio | falta a *Abertura* nos passos; o resultado sem ela é uma coluna (defeito 1) |
| O **brilho** da faísca | pronta ou do vazio, é pálida num fundo claro (defeitos 2 e 4) |
| A cor na dica da **Poeira** | uma frase (defeito 3) |

O que **está feito**: as quatro portas dizem os números; o Tamanho diz o típico; a faísca pronta se vê e é laranja; a rajada se monta só pela tela.

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As duas cores | escritas por uma linha de código | como é escolher a cor com o seletor de verdade |
| "Se vê / é laranja / é pálida" | **minha** leitura de fotos | o que o Humberto acharia |
| Tempo das fotos | cada foto leva cerca de 1 s; **não** peguei o instante exato do primeiro estouro, só vários momentos | que o primeiro estouro (0 s) é o mais bonito |
| A versão | a v31.2 tirada do zip e servida à parte | o `programa/` da pasta (já v31.3) |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
