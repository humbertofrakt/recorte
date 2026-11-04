# A malha e os pesos conferidos — lote 2 (v31.9) — 06/10/2026

Rodada 41, lote 2, "o peso de um vértice". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.9** (o "Sobre" diz v31.9) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 13h35 a 13h39, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-41-conferida/lote2/` (5) |
| Material | o herói de exemplo. O `cape_upper` não tem malha: **fiz pela tela** (*Virar malha*, *Gerar automática*, *Ligar ossos* `cape1` e `cape2`, *Pesos automáticos*: 29 vértices). Apaguei 4 vértices no fim. **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1 a 5) | 0 | 0 | 5 |

## Os defeitos

Nenhum que pare o uso. Só pequenos:

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **O rodapé do pincel não diz que pintou nos escolhidos.** Com 1 vértice escolhido e o pincel arrastado, o rodapé disse só *"Pintar pesos."* A frase de *quando se escolhe* (*"o pincel pinta só neles"*) é boa, mas **depois da pincelada** ninguém diz quantos vértices mudaram | 2 | — |
| 2 | *Pequeno.* **Com vários vértices de pesos diferentes** a caixa mostra ***"vários"*** em cinza (o certo), mas a frase de cima diz ***"peso médio dos 4 vértices escolhidos"***: as caixas **não mostram média nenhuma**, só *"vários"*. A frase promete um número que não há | 1 | `G1_lista_4` |
| 3 | *Pequeno.* **`Esc` com um desenho escolhido e nenhum vértice solta o desenho** (a lista do painel some: *"Escolha um desenho na árvore ou na tela"*). Faz sentido, mas **o `Esc` tem dois efeitos** (solta o vértice; depois solta o desenho) e o rodapé só diz o primeiro | 2 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Com a *Malha*, arrastar uma caixa escolhe vértices; a lista mostra o peso **deles** (não a média da malha) e um campo exato em %; digitar 100 no `cape1` aplica aos escolhidos e o rodapé diz quantos | **vi funcionar** | **Caixa:** o rodapé diz ***"4 vértices escolhidos. Shift + arrastar soma mais."*** e a frase da lista **muda** de *"% = peso médio na malha inteira"* para ***"% = peso médio dos 4 vértices escolhidos · a caixa trava o osso"***. **O campo:** em cada osso, uma **caixa em %** com a dica ***"Peso de cape1 nos 4 vértices escolhidos, de 0 a 100 %. O resto vai para os outros ossos; o travado não muda"***; com os 4 de pesos **diferentes** mostra ***"vários"*** (cinza). **Digitei 100 no `cape1`:** rodapé ***"cape1 com 100 % nos 4 vértices escolhidos."***; as caixas ficaram `cape1` **100** e `cape2` **0**. **Um vértice de fora da caixa não mudou** (`cape1` 86 / `cape2` 14). Com **1** vértice a lista mostra o peso **dele** (100 / 0) | `G1_lista_4` |
| 2 | Com *Pesos* na mão, `Shift+clique` escolhe vértice; o pincel pinta só neles; `Esc` larga | **vi funcionar** | `Shift+clique` num vértice: rodapé ***"1 vértice escolhido: a lista mostra o peso, e o pincel pinta só neles. Esc larga."*** e a lista passa a mostrar o peso **dele**. **Pincel** (*Substituir*, `cape2`, raio 400, força 100) **arrastado por toda a malha**: **só o vértice escolhido mudou** (de `cape1` 100 / `cape2` 0 para **0 / 100**); **outros cinco vértices** que olhei **ficaram como estavam** (100/0, 100/0, 49/51, 86/14, 100/0). **`Esc`:** *"Nenhum vértice escolhido: o pincel pinta a malha inteira."* | `D1_depois_shift` · `F1_depois` |
| 3 | A pizza do vértice escolhido é maior | **vi funcionar** | No `Shift+clique`, **um** vértice ficou **um círculo grande** (uns 80 px na foto ampliada 4×), enquanto os outros seguem **pequenos e quadrados** (uns 40 px): **cerca de o dobro**, e fácil de achar. As pizzas das outras vêm de *Pesos automáticos* (laranja e roxo) | `D1_depois_shift` · `B0_pesos_pizzas` |
| 4 | Dicas inteiras em *Pintar / Tirar / Criar aresta / Pincel / Malha de origem*; *"1 vértice apagado"* diz quantos; o título do *Pincel* diz que liga a ferramenta *Pesos* | **vi funcionar** | ***Pintar:*** *"Pintar cape1: escolhe este osso para o pincel; a pincelada na malha dá peso a ele"* · ***Tirar:*** *"Tirar cape1 da malha: ela para de seguir este osso, e o peso dele vai para os outros"* · ***Criar aresta:*** *"Criar aresta: escolha dois vértices primeiro (clique e Shift + clique, ou a caixa), depois aperte aqui ou L"* · ***Pincel:*** *"Pincel: pinta o peso do osso escolhido na malha. Abrir liga a ferramenta Pesos (G), como no Spine"* · ***Malha de origem:*** *"…a forma que a malha ligada vai usar. Escolher a própria malha cria uma gêmea dela, com outra imagem"*. **Apagar:** com 1 vértice, ***"1 vértice apagado."***; com 3, ***"3 vértices apagados."*** | `I1_delete_sem_vertice` |
| 5 | Com a *Malha* na mão e nenhum vértice escolhido, `Delete` **avisa** e não apaga o desenho | **vi funcionar** | Desenho `cape_upper` escolhido, ferramenta *Malha*, nenhum vértice: `Delete` → rodapé ***"Nenhum vértice escolhido: com a Malha na mão o Delete apaga vértices. Para apagar o desenho inteiro, troque de ferramenta ou use Editar → Apagar."*** O desenho **continuou escolhido** e **o histórico não ganhou passo nenhum** (o último segue *Peso exato*). *(No lote 1 o mesmo `Delete` apagava o desenho com um "Apagar." mudo.)* | `I1_delete_sem_vertice` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **histórico** nomeia os passos novos: *Pintar pesos*, *Peso exato*, *Pesos automáticos*, *Ligar cape1 à malha cape_upper*: dá para voltar a um deles |
| C2 | **Escolher** um vértice não vira passo de desfazer (certo), mas o `Ctrl+Z` depois de pintar volta **a pincelada inteira** (um passo só); **não** testei |
| C3 | Em ***Pesos*** o `Delete` **sem vértice** ainda apagaria o desenho (lote 1); aqui só testei com a *Malha*. **Não conferi** se a *Pesos* também avisa |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A malha e os pesos | **fiz** pela tela no `cape_upper`; não veio pronta | uma malha feita à mão num boneco de verdade |
| "Cerca do dobro" | medi o círculo e o quadrado **na foto ampliada** | o tamanho em pixels reais |
| Só um vértice com o pincel | **cinco** outros vértices olhados, não os 28 | que **nenhum** outro mudou |
| `Esc` | li o rodapé; **não** conferi com a foto | que a pizza grande some |
| *Delete* sem vértice na ferramenta *Pesos* | **não testei** | o aviso na *Pesos* |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
