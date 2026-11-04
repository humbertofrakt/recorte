# O número da ficha conferido — lote 2 (v34.9) — 07/10/2026

Rodada 47, lote 2. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.9** (o "Sobre" diz v34.9; servi o zip `recorte v34.9 2026-10-07.zip`, extraído fora da pasta; o zip apareceu às 04h49) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 04h50 a 04h59, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote2/` (12) |
| Material | o herói de exemplo, na base; as regras do próprio herói (`ik_arm`, `head_lean`, `cape_follow`, `hair_physics`, `look_driver`); um emissor *Novo: faísca* criado no osso `foot_b` para a ficha das partículas. Para o item 4 **arrastei o rótulo, digitei `10+5` e apertei as setas** em cada campo, e **fui desfazendo**. **Nada foi salvo.** Nenhuma caixa nativa foi chamada. **Não rodei `medir` nem roteiro** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (2, 3) | **2** (1, 4) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | **A ficha da base** e **as de `ik_arm`, `head_lean`, `cape_follow`** têm **unidade depois da caixa** e **dica**; **mas na `hair_physics`** *Força*, *Massa*, *Vento* e *Gravidade* ficam **sem unidade**, e na **`look_driver`** os **5 números** (*"Com o parâmetro em −1 / 0 / 1"*) **não têm unidade nem dica**. E a **faixa *"de X a Y"* só está nas dicas dos números em %** (e em poucos mais): os outros dizem *"de 0 para cima"*, *"maior que 0"* ou nada |
| 4 | o rótulo **arrasta**, a **conta** (`10+5`) e as **setas** funcionam na **ficha do osso, na da base, nas das regras e nas das partículas**; **não** na **Prévia** (*"Mistura em segundos"*: o rótulo não arrasta, `10+5` vira `0`) nem no **campo do zoom** (`10+5` não vale, a seta não anda) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A regra `look_driver` tem 5 números sem unidade e sem dica.** Na seção *"Comando por parâmetro"*, em cada alvo (`head`, `smile`): ***"Com o parâmetro em −1"***, ***"…em 0"***, ***"…em 1"*** (valores `−12`, `0`, `12`; `0`, `1`). **Nenhum** tem `title` (dica vazia) nem unidade ao lado da caixa; o rótulo quebra em **três linhas** (*"Com o / parâmetro em / −1"*). Quem lê `−12` não sabe se são graus, px ou o quê (depende da *Propriedade* escolhida acima) | 1 | `I_look_driver_numeros` · `B_look_driver` |
| 2 | **`hair_physics`: quatro números da simulação sem unidade.** *Força* (a mola, *"de 0 para cima"*), *Massa* (*"maior que 0"*), *Vento* e *Gravidade* (*"negativo: para a esquerda/cima"*): têm **dica**, mas **a caixa fica sem unidade** (são unidades de física, mas nada diz isso). *Limite* (**px/s**), *Passos* (**/s**) e os de % têm | 1 | `B_hair_physics` |
| 3 | **Faixa *"de X a Y"* só nos %.** Em `head_lean` e `cape_follow`, *Somar giro (°)*, *Somar X/Y (px)*, *Somar escala (×)*, *Somar inclinação (°)* e *Espaço (px)* trazem a unidade certa e dizem *"0 não muda"* ou *"somado ao…"*, **sem faixa**; na **base**, *Posição X/Y* **sem faixa** (*"a partir da origem da cena"*). Pode ser que **não haja** faixa (qualquer número vale); **a dica não diz isso** (diz *"qualquer número"* só nas partículas) | 1 | `A0_ficha_da_base` · `B_head_lean` |
| 4 | **A Prévia e o campo do zoom não seguem o padrão.** *Prévia → "Mistura em segundos"* (`0.2`, com ponto, e a unidade **no rótulo**): o **rótulo não arrasta** (cursor `default`; arrastei 40 px e ficou `0.2`), **a conta não vale** (`10+5` ⇒ `0`), a seta anda de 0,05. **Zoom** (`278%`): `10+5` **não muda**, a seta **não anda** (nem o campo de velocidade do tocador, que é uma barra). *(É o escopo do lote 3 e da v35.0, mas a lista dizia "em TODO painel com número")* | 4 | `G_Prévia` |
| 5 | *Pequeno.* **O arrasto do rótulo passa da faixa.** Em *Força (%)*, que a dica diz *"de 0 a 100"*, arrastei o rótulo 40 px e o campo foi a **140**; **não prendeu em 100** (o rodapé não avisou) | 4 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Toda ficha de REGRA (IK, física, as outras) e a ficha da BASE: unidade depois da caixa e dica com a faixa *"de X a Y"*, em todo número | **pela metade** | **Base:** *Quadros* (**/s**, *"de 1 para cima"*), *Posição X/Y* (**px**), *Largura* e *Altura* (**px**, *"de 0 para cima"*), *Escala da física* (**px**): **todos com a unidade depois da caixa e com dica**. **`ik_arm`:** *Força* (**%**, ***"de 0 a 100: 0 desliga a regra, 100 é a regra inteira. Típico: 100 %"***), *Suavidade* (**px**, *"de 0 para cima… Típico: 0 a 20 px"*). **`head_lean`:** 13 números, **todos** com **° / px / × / %** e dica; os de **%** com ***"de 0 a 100"***. **`cape_follow`:** 7, com **°**, **%** (*"de 0 a 100 do comprimento do caminho"*), **px**. **`hair_physics`:** 14: 8 em **%** (***"de 0 a 100"***), *Limite* **px/s**, *Passos* **/s**; **Força, Massa, Vento, Gravidade sem unidade** (defeito 2). **`look_driver`:** defeito 1. Defeito 3 (faixa) | `A0_ficha_da_base` · `B_ik_arm` · `B_head_lean` · `B_cape_follow` · `B_hair_physics` · `B_look_driver` |
| 2 | O que era de 0 a 1 aparece de 0 a 100 % | **vi funcionar** | As forças e as misturas **estão em %**: *Força da regra*, *Rotação*, *X*, *Y*, *Escala*, *Inclinação* (`head_lean`, `cape_follow`) e *Em X*, *Em Y*, *No giro*, *Na escala X*, *Na inclinação X*, *Inércia*, *Amortecimento* (`hair_physics`): **todos com `%` depois da caixa** e dica ***"de 0 a 100"*** (ex.: ***"Inércia, em %, de 0 a 100: quanto do movimento do osso vira atraso. Típico: 50 %"***). *Nenhum* dos que vi nas regras aparece como `0,5` ou `1`. *(Ressalva: `look_driver` e o *Mistura* da Prévia, defeitos 1 e 4)*. Nota: defeito 5 (passa da faixa) | `B_hair_physics` · `B_head_lean` |
| 3 | Nas partículas a unidade saiu do rótulo e está depois da caixa (nada regrediu: compare com `rodada-38-conferida/lote6`) | **vi funcionar** | **A ficha do emissor**, aba por aba (comparei com `T_aba_tamanho` da rodada 38, em que se lia *"Giro inicial (°)"*, *"Giro/s (°)"*): *Nascer* ***Taxa /s***, ***Vida de … a … s***; *Tempo* ***Atraso s***, ***Explosão força %***, ***janela s***, ***Tremor %***; *Lugar* ***X · Y px***, ***Giro °***; *Movimento* ***Velocidade de … a … px/s***, ***Direção °***, ***Abertura ± °***; *Forças* ***Gravidade X Y px/s²***, ***Freio /s***; *Tamanho e giro* ***Tamanho de … a … ×***, ***Giro inicial de … a … °***, ***Giro de … a … °/s***; *Cor* ***Cor do emissor 100 %***. **Os rótulos ficaram só com o nome** (*"Giro inicial"*, *"Giro"*, *"Velocidade"*) **e a unidade depois da caixa**; as dicas continuam com a faixa (*"Taxa por segundo — partículas por segundo, de 0 para cima"*, *"Máximo de vivas — … de 1 a 10000"*, *"Abertura para cada lado — em graus, de 0 a 180"*). **Nada regrediu**: nenhum campo perdeu a dica nem a unidade; **sem unidade ficam só contagens** (*Máximo de vivas*, *qtd.*, *1º*, *díg.*, *Semente*) | `D_Nascer` · `D_Movimento` · `D_t1` · `D_t2` |
| 4 | O número da ficha se arrasta pelo rótulo, aceita conta, setas, em TODO painel com número | **pela metade** | **Funcionam** (rótulo com cursor `ew-resize`; arrastar 40 px soma 40 no inteiro e 0,4 no décimo; `10+5` ⇒ `15`; `↑` soma 1, ou 0,01 nos fracionários): **ficha do osso** (*X*, *Ângulo*, *Escala X*), **da base** (*Quadros*), **das regras** (*Força*, *Suavidade*, *Massa*, *Inércia*, *Amortecimento*, *Gravidade*, *Somar giro*, *Posição*, *Espaço*) e **das partículas** (*Taxa*, *Atraso*, *Direção*). **Não** funcionam na **Prévia** nem no **zoom**: defeito 4. Defeito 5 | `G_Prévia` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A seta ajusta o passo ao tipo**: `↑` soma **1** em px, graus e %, e **0,01** em *Massa* e *Escala*; em *Atraso* (s) 0,01: **dá para afinar** sem digitar |
| C2 | A dica das regras traz **o típico** (*"Típico: 100 %"*, *"Típico: 0 a 20 px"*, *"Típico: 0,5 soma meia"*): diz **o que um valor sensato é**, o que a unidade sozinha não diz |
| C3 | **Em `hair_physics` a dica explica o sentido do sinal** (*"Vento, para a direita (negativo: para a esquerda)"*): falta só a unidade |
| C4 | O emissor tem **10 abas** (*Nascer, Tempo, Lugar, Forma, Movimento, Forças, Tamanho e giro, Cor, Imagem, Mais*); a minha ferramenta só listou 8 e eu abri as duas do meio **pela posição**: *Tamanho e giro* e *Cor* conferidas **pelo texto e pela foto** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O arrasto do rótulo | arrasto de verdade por protocolo (mouse apertado, 3 passos) | a sensação da mão (velocidade, passo por pixel) |
| `Ctrl+Z` | fui desfazendo; **não conferi** que cada campo volta ao valor de antes | o desfazer de um arrasto de rótulo |
| A ficha das partículas | **uma** faísca, **na base** | a ficha **dentro de uma animação** (os mesmos campos viram chave) |
| A *Malha e pesos*, a *Exibição*, *Entidades*, *Pivôs* | **abri**: **não têm número** nesta tela sem desenho com malha (a Malha **só** com um desenho com malha escolhido) | os números da Malha (é o lote 3) |
| Os campos de tempo do tocador (*Tempo*, *Duração*) | **não achei** pelo `title` (a ferramenta não os pegou) | se aceitam conta e seta |
| As **barrinhas** (*Força* na lista de regras, *Alfa*) | **não** testei (é o lote 4) | 3 teclas = 3 casas |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
