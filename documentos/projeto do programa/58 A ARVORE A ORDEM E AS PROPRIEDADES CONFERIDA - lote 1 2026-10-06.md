# A Árvore, a Ordem e as Propriedades conferidas — lote 1, a ficha diz o que é, uma vez (v32.5) — 06/10/2026

Rodada 43, lote 1. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.5** (o "Sobre" diz v32.5; o zip `recorte v32.5 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 18h03 a 18h06, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-43-conferida/lote1/` (4) |
| Material | o **herói de exemplo já aberto** (como o Diretor pediu: sem *Novo projeto* em pasta com imagens). Escolhi o osso `leg`, o desenho `cape_upper` (que virei malha) e um emissor vazio. **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1 a 5) | 0 | 0 | 5 |

## Os defeitos

Nenhum que pare o uso. Só pequenos:

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **Na ficha do desenho, o rótulo *"Largura"* quebra em duas linhas** (*"Largu / ra"*) porque a caixa ao lado é larga; *"Altura"* cabe. Fica feio, não atrapalha | 2 | `C0_ficha_desenho` · `D0_ficha_malha` |
| 2 | *Pequeno.* **Quatro caixas de marcar da ficha do osso não têm dica própria** (as três de *Compensar*: *Não mexer nos filhos / nos desenhos / nas caixas*, e a última de *Herança*: *Só com a skin…*): a palavra ao lado diz o que é, mas o pedido era *dica em todo número*; **os números todos têm** | 1 | `B0_ficha_osso_grande` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Na ficha (*Propriedades*) de um osso: **X/Y, giro e escala UMA vez**, com unidade (px, °, ×) e dica em todo número; a ficha ficou mais curta (~727 px) | **vi funcionar** | Osso `leg`. **Contei no texto da ficha:** *X* 1 · *Y* 1 · *Ângulo* 1 · *Escala X* 1 (antes apareciam duas vezes: na *Ficha rápida* e em *Posição e forma*). **Unidades:** *X* ***px***, *Y* ***px***, *Escala X* ***×***, *Escala Y* ***×***, *Ângulo* ***°***, *Comprimento* ***px***, *Inclinação X e Y* ***°***. **Dicas dos números:** *"Posição X, em px, no espaço do osso pai: positivo vai para a direita"* · *"Escala X, em × (vezes): 1 é o tamanho de montar, 2 o dobro…"* · *"Ângulo em graus (°), contra o relógio: 0° aponta para a direita"* · *"Comprimento do osso, em px: só o desenho do osso na cena…"* · *"Inclinação X, em graus (°): entorta o osso e o que ele leva…"*. **Altura:** o rolo da ficha mede **727 px** de conteúdo (o pedido: ~727). *Posição e forma* agora só tem as duas **inclinações**. Seções: *Compensar · Osso · Marcação no editor · Posição e forma · Herança do osso pai* | `B0_ficha_osso_grande` |
| 2 | Na ficha de um desenho: título *"Desenho: X"* com *"imagem Y · no osso Z"* embaixo; nada de *"Anexo"* nem *"Slot"* à vista (só na dica) | **vi funcionar** | `cape_upper`: ***"Desenho: cape_upper"*** e embaixo ***"imagem cape_upper · no osso cape1"***. `leg_front`: ***"Desenho: leg_front"*** / ***"imagem thigh · no osso leg"*** (**o nome do desenho e o da imagem aparecem separados**). **Contei "Anexo" e "Slot" no texto da ficha: 0 e 0.** A palavra *"anexo"* só aparece **na dica** do campo *Nome* (*"O nome desta imagem do desenho (o anexo)…"*). *Antes o título era "Anexo: cape_upper"* | `C0_ficha_desenho` |
| 3 | A seção de evento **não aparece** nas fichas de osso e desenho | **vi funcionar** | Contei *"evento"* (qualquer caixa) no texto da ficha do **osso** e do **desenho**: **0** nos dois. *(Nas v31.x a ficha mostrava CHAVE DE EVENTO e DEFINIÇÃO DO EVENTO "STEP".)* | `B0_ficha_osso_grande` · `C0_ficha_desenho` |
| 4 | A ficha da malha **não mostra** X/Y/escala/ângulo | **vi funcionar** | Virei o `cape_upper` em malha: a ficha ficou ***Desenho: cape_upper · imagem cape_upper · no osso cape1*** → *Ficha rápida* (só ***Imagem*** e ***Alfa***) → *Desenho* (*Nome*, *Imagem*) → ***Tamanho da imagem*** (*Largura*, *Altura*) → *Cor*. **Contei: *X* 0 · *Y* 0 · *Escala* 0 · *Ângulo* 0.** A seção de posição virou *"Tamanho da imagem"* (a forma agora é da malha) | `D0_ficha_malha` |
| 5 | A ficha do **emissor** continua como na v31.x: nada regrediu (compare com as fotos de `rodada-38-conferida`) | **vi funcionar** | Criei um emissor vazio e fotografei a aba *Tamanho e giro*: **a mesma moldura** da foto de `rodada-38-conferida/lote6/T_aba_tamanho.png` (o selo de peso à esquerda, o título *"Tamanho e giro · Emissor…"*, a fileira de ícones das abas, *Tamanho (fator) de 1,2 a 1,6*, *Tamanho na vida*, *Giro inicial*, *Giro/s*). **Comparei também os campos de cada aba** com o que anotei na v31.x: *Nascer* (emitindo, taxa, vida de/a, máximo de vivas), *Tempo* (atraso, explosividade, janela, tremor, repetir), *Lugar* (X, Y, giro, osso), *Movimento* (velocidade, direção, abertura, vira), *Forças* (gravidade X/Y, arrasto, espaço), *Cor*, *Imagem*, *Mais*: **iguais**. *(Os valores do emissor novo e o da foto antiga diferem porque o da foto era uma faísca já pronta.)* | `E1_emissor_tamanho` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **nome do desenho** (`leg_front`) e o **da imagem** (`thigh`) agora **aparecem separados**, no título e embaixo: antes o *"Anexo: …"* misturava os dois. Para quem monta, é a mudança mais útil |
| C2 | Escolhendo o osso `head`, a ficha trouxe um campo ***Imagem*** na *Ficha rápida* (*"Osso: head · Ficha rápida · Imagem"*). **Não investiguei** (talvez o `head` leve uma imagem direto); o `leg` **não** tem esse campo |
| C3 | O painel *Propriedades* de abertura mede **228 px** de altura e a ficha do osso **727 px**: para ver tudo é preciso **rolar ou puxar o divisor** (puxei para fotografar). Não é piora da v32.5, mas a ficha *mais curta* ainda **não cabe** sem rolar |
| C4 | A malha mantém o cabeçalho *"Desenho: cape_upper"* e **também** a aba *Malha e pesos* mostra *"Desenho escolhido"*: os dois dizem a mesma coisa em dois lugares |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| "UMA vez" | **contei** as linhas de texto da ficha por código (X, Y, Ângulo, Escala X) | que **nenhum outro lugar** do programa repita esses números (a **barra de cena** ou uma outra aba) |
| "~727 px" | li o `scrollHeight` do rolo da ficha | o que cabe numa tela menor |
| Ficha do emissor | comparei **uma foto** (aba *Tamanho e giro*) e a **lista de campos** das 10 abas | cada pixel das outras abas |
| Osso e desenho | só `leg`, `leg_front`, `cape_upper`, `head`; **uma** malha | todos os desenhos do herói, e uma **caixa**, um **ponto** ou uma **entidade** |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
