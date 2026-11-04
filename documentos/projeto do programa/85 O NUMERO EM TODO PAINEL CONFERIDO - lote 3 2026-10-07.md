# O número em todo painel conferido — lote 3 (v35.0) — 07/10/2026

Rodada 47, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.0** (o "Sobre" diz v35.0; servi o zip `recorte v35.0 2026-10-07.zip`, extraído fora da pasta; o zip apareceu às 05h13) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 05h13 a 05h24, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote3/` (14) |
| Material | o herói de exemplo, na base e na animação `idle`; as regras do próprio herói (`ik_arm`, `head_lean`, `cape_follow`, `hair_physics`, `look_driver`); o evento `step`. Trocas que fiz (a *Propriedade* do `look_driver`, o *Mistura*, a *Força*, o *zoom*) **eu devolvi ao valor de antes**. As duas janelas (*Empurrar*, *Deslocar*) **fechei com *Deixar como está***. **Nada foi salvo** ("Arquivo não salvo" até o fim). **Não rodei `medir`, roteiro nem pesos** |
| Nota de numeração | a lista chegou em itens soltos; **as linhas abaixo são minhas, na ordem em que conferi** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (3, 4, 5, 6, 7) | **2** (1, 2) | 0 | 7 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | na **Prévia** o *Mistura* agora aceita **conta** (`10+5` ⇒ `5`, preso no máximo) e **setas** (`↑` não passa de 5); **mas o rótulo não arrasta** (cursor `default`, 40 px e ficou `0,2`), e os **quatro *Quanto aparece*** (barras) **não têm dica** |
| 2 | **Malha e pesos**, **chave de evento** e **todas as fichas de regra e a da base** têm **unidade depois da caixa e *"de X a Y"*** na dica; **mas** o **popover da Cebola** não tem unidade depois da caixa, e a **ficha do osso** (*Posição X/Y*, *Comprimento*, *Inclinação*, *Ângulo*, *Escala*) **tem unidade, mas a dica não diz a faixa** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O popover da Cebola quase não se lê.** Os rótulos (*Só nas chaves*, *Desenhar como silhueta*, *Quadros antes*, *Quadros depois*, *Passo em segundos*, *Quanto aparece*, *Deslocar para o lado/cima*, *Cor de antes/depois*) saem em **cinza-claro `rgb(230,230,230)` sobre fundo branco `rgb(255,255,255)`** (li as cores pelo programa): **contraste de uns 1,3 para 1**. Só o texto do rodapé do popover (*"Deslocar para o lado compara uma passada…"*) se lê. Os números (`2`, `2`, `0,083`, `0,5`, `0`, `0`) também saem cinza-claros, **encostados à direita**. Os rótulos ficam **acima** da caixa, não ao lado, e o popover fica **mais alto que a folha** | 2 | `E1_cebola_opcoes` |
| 2 | **Cebola: os números sem unidade.** *Quadros antes/depois* (dica *"Número, de 0 a 20"*), *Passo em segundos* (*"de 0,01 a 2"*, **a unidade está no rótulo, não depois da caixa**), *Deslocar para o lado/cima* (*"de −2000 a 2000"*) e *Quanto aparece* `0,5` (dica *"de 0 a 1"*): **a unidade não vem depois da caixa**, e o que era 0–1 **continua 0–1, não 0–100 %** (é o único número do lote que ficou assim) | 2 | `E1_cebola_opcoes` |
| 3 | **Prévia: o rótulo *Mistura* não arrasta** e **as quatro barras *Quanto aparece* não têm dica** (`title` vazio). *Mistura* tem unidade (**s**) e dica (*"Mistura, em s, de 0 a 5: quanto tempo esta camada leva para entrar…"*) | 1 | `F0_previa_mistura` · `A1_previa_com_camadas` |
| 4 | **Ficha do osso (`head`): a dica não diz a faixa.** *Posição X/Y* (*"…em px, no espaço do osso pai: positivo vai para a direita"*), *Comprimento* (*"em px: só o desenho do osso na cena"*), *Inclinação X/Y* (*"em graus (°): … 0° é reto"*), *Escala X/Y* (*"em × (vezes): 1 é o tamanho de montar…"*) e *Ângulo* **não trazem *"de X a Y"* nem *"qualquer número"*** (as regras, a base e a Malha trazem). A unidade **está** depois da caixa | 2 | `I0_ficha_osso_head` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | O *Mistura* da Prévia segue o padrão do número: rótulo arrasta, conta, setas | **pela metade** | Prévia, camada 0: *Mistura* `0,2` (unidade **s**). **Conta:** `10+5` ⇒ `5` (**preso** no 5 da dica; na v34.9 virava `0`). **Setas:** `↑` `↑` ficam em `5`, `↓` vai a `4,95` (passo **0,05**). **Rótulo:** cursor `default`, arrastei 40 px e ficou `0,2`: **não arrasta** (defeito 3). Devolvi `0,2` | `F0_previa_mistura` |
| 2 | Todo número com a unidade depois da caixa e a dica com *"de X a Y"* (ou +∞) | **pela metade** | **Malha e pesos:** *Afastamento* **px** (*"de 0 a 30 px"*), *Raio* **px** (*"de 1 a 400 px"*), *Força* **%** (*"de 0 a 100 %"*): **os três com unidade e faixa**. **Chave de evento (`step`):** *Inteiro*, *Decimal*, *Volume* **%** (*"de 0 a 100"*), *Balanço* **%** (*"de −100 a 100"*): com dica. **Fichas das regras** (varri **todas** as caixas de número de `ik_arm` 2, `head_lean` 13, `cape_follow` 7, `hair_physics` 14 e **da base** 6): **todas** com unidade (ou, nas de física, sem unidade por desenho) e ***"de X a Y"* ou *"de 0 a +∞"***. **Cebola:** defeitos 1 e 2. **Ficha do osso:** defeito 4 | `B1_malha_virou_malha` · `B2_malha_secoes` · `C0_malha_abertas` · `D0_evento_ficha` · `E1_cebola_opcoes` · `I0_ficha_osso_head` |
| 3 | *Força da regra* trava em 0–100 ao arrastar o rótulo | **vi funcionar** | `ik_arm`, *Força* `100` (cursor `ew-resize`): arrastar **+40 px** deixa em **`100`** (na v34.9 ia a 140); arrastar **−60 px** dá **`40`** (1 por pixel); digitar `500` ⇒ **`100`**; `−5` ⇒ **`0`**; `10+5` ⇒ `15`; setas `↑` somam 1. Devolvi `100` | `G2_forca_depois` |
| 4 | O Comando por parâmetro mostra *"Em −1 / Em 0 / Em 1"* com a unidade da propriedade | **vi funcionar** | `look_driver`, alvo `head`: os rótulos agora cabem **numa linha** (*"Em -1"*, *"Em 0"*, *"Em 1"*) e **cada caixa tem a unidade depois**: **°** (Rotação, Inclinação X/Y), **px** (Posição X/Y), **×** (Escala X/Y) — **troquei a *Propriedade* uma a uma por teclado e li as sete**. Cada caixa **tem dica**, ex. ***"Com o parâmetro em -1, em graus (°), de −360 a 360: o valor que o alvo toma ali; entre dois pontos…"***, ***"…em px, de −∞ a +∞…"***, ***"…em × (vezes), de −∞ a +∞… 1 é…"***. Alvo `weight` (sem unidade: *"na medida dele"*) com dica. Devolvi *Rotação* | `H1_look_driver_comando` |
| 5 | O campo do zoom aceita conta e setas | **vi funcionar** | Zoom `464%`: `10+5` ⇒ **`15%`**; `↑` `↑` ⇒ `25%`, `35%` (passo **10**); `↓` ⇒ `25%`. Texto `0` ⇒ rodapé ***"Zoom não entendido. Escreva um número, como 200."*** e o campo **volta ao valor anterior**. `5000` ⇒ `5000%` (não achei teto). Devolvi `464%`. A dica (*"Zoom em por cento. Digite um número e aperte Enter. Ctrl+0 volta a 100%"*) **não** fala de conta nem de setas nem de faixa | `J0_zoom` |
| 6 | *Empurrar as chaves…* e *Deslocar em laço…*: o texto errado não fecha a janela e diz como escrever | **vi funcionar** | Menu *Animação → Chaves*. *Empurrar:* digitei `abc`, `1,5 quadros`, `-`, `6 quadros por favor` e apertei **Empurrar**; apertei também **Enter** no campo errado: **a janela não fechou nenhuma vez**, e um **bloco vermelho** diz ***"Não entendi "6 quadros por favor". Quadros inteiros (6) ou segundos com "s" (0,2 s)"*** (o texto citado muda com o que escrevi). Com `0,2 s` a mensagem **some**. *Deslocar:* `abc` e `3,5` ⇒ o mesmo; com `5` some. Fechei as duas com ***Deixar como está***: **nenhuma chave mudou** | `M2_texto_errado` · `N0_deslocar_errado` |
| 7 | Os campos de física dizem a faixa e o típico (sem unidade: desenho dela) | **vi funcionar** | `hair_physics`: *Força da mola* ***"de 0 a +∞: puxa o osso de volta ao lugar. 0 solta. Típico: 100"***, *Massa* ***"de 0,01 a +∞… Típico: 1"***, *Vento* ***"de −∞ a +∞, para a direita (negativo: para a esquerda)… Típico: 0"***, *Gravidade* ***"de −∞ a +∞, para baixo (negativo: para cima)… Típico: 0"***; os de **%** (*Em X/Y*, *No giro*, *Na escala X*, *Na inclinação X*, *Inércia*, *Amortecimento*) com ***"de 0 a 100"*** e *Típico*; *Limite* **px/s** e *Passos* **/s**. **Nenhum campo ficou sem faixa** | `—` (texto lido do programa) |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **Comando por parâmetro** ficou o melhor do lote: rótulo curto, unidade que **muda com a propriedade** (° / px / ×) e dica com a faixa |
| C2 | A mensagem do *Empurrar* e do *Deslocar* **repete o que escrevi** entre aspas e **mostra o exemplo certo**: quem erra sabe o que corrigir |
| C3 | O zoom anda de **10 em 10** com a seta; o *Mistura*, de **0,05**: cada campo escolhe o passo que serve a ele |
| C4 | **Corrigi uma frase minha** do doc `84` (defeito 2): *Força da mola*, *Massa*, *Vento* e *Gravidade* **sem unidade** é **de propósito** (a spec não define unidade). O que importa é a dica trazer **faixa e típico**: **traz** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A troca da *Propriedade* do `look_driver` | tecla `↓` / `↑` com o seletor em foco (o menu nativo não abre sem janela) | o gesto do mouse no seletor |
| O arrasto do rótulo | mouse apertado por protocolo, 3 passos | a sensação na mão |
| As cores da Cebola | li `getComputedStyle` e **olhei a foto** | o tema claro (só tem o escuro nesta versão) |
| Os campos do tempo do tocador (*Tempo*, *Duração*) | **não testei** conta e seta (não eram desta lista) | — |
| Uma seleção de 41 itens no meio do teste (rodapé *"41 itens escolhidos"*, foto `M2`) | **foi minha**: um `Ctrl+A` que caiu fora do campo antes de eu recalcular a posição da caixa; **nada** foi mexido nos itens | — |
| A pose do herói nas fotos `K0`/`M2` (deitado) | **não sei** se é a `idle` no quadro 0 ou efeito do que mexi; **nada foi salvo**; devolvi tudo | — |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
