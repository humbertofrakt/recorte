# As partículas conferidas — lote 4b (v30.9) — 06/10/2026

Rodada 38, lote 4b. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.9** (o "Sobre" diz v30.9) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 09h56 a 09h57, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-38-conferida/lote4b/` (2) |
| Material | o herói de exemplo, com um emissor *Fogo*; nada trocado por falso |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 3, 4) | **1** (2) | 0 | 4 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O número da opacidade só aparece na barra *Cor do emissor*.** As duas barras de *Cor ao nascer* (de / até) **continuam sem número ao lado**, e ao arrastá-las nada muda na tela: o número só está na dica (*"opacidade: 100 % (de 0 a 100 %…)"*) | 2 | `C_barrinhas` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Na Ordem, com o emissor escolhido, Ctrl+↓ três vezes seguidas anda três lugares; Ctrl+↑ volta; a cena obedece | **vi funcionar** | **Três `Ctrl+↓` seguidos** (sem clicar de novo): o emissor foi da 1.ª posição para a 2.ª, para a 3.ª e para a 5.ª (passou por cima do grupo *arma*); **três `Ctrl+↑`** trouxeram de volta à 1.ª, cada um um passo. (O defeito do lote 3, em que só o primeiro andava, **sumiu**.) **A cena:** em `idle`, com 20 `Ctrl+↓` o emissor foi ao fim (*"Já está atrás de tudo"*, posição 23 de 24) e a bota **cobre o fogo**; na frente o fogo cobre a bota. `Ctrl+Z` desfaz | `S_frente_e_atras` |
| 2 | O número da opacidade ("100 %") aparece ao lado da barrinha e muda ao arrastar | **pela metade** | **Cor do emissor:** *"100 %"* ao lado da barra; ao arrastar para a esquerda muda para **43 %**, **na hora**. **Cor ao nascer (de) e (até):** **sem número** (defeito 1) | `C_barrinhas` |
| 3 | Lugar X, Y e Giro do emissor têm unidade e faixa | **vi funcionar** | **X:** *"em px, qualquer número: onde o emissor está no osso; positivo vai para a direita"* · **Y:** *"em px, qualquer número: … positivo vai para cima"* · **Giro (°):** *"em graus, de 0 a 360 (negativo gira ao contrário): gira a Direção e a forma juntas"* | — |
| 4 | As dicas de Tremor ao nascer, Explosão, Vira com o voo e Na frente explicam em frase inteira; diga se um usuário novo entenderia | **vi funcionar** | Ver abaixo | — |

## As dicas, uma a uma — um usuário novo entenderia?

| Campo | A dica diz | Entenderia? |
|:---|:---|:---|
| **Tremor ao nascer** | *"fração do intervalo entre duas partículas, de 0 a 1: 0 nascem num ritmo certo, como um relógio; 1 em tempos soltos, como chuva"* | **Sim.** O "relógio" e a "chuva" fazem ver a diferença. Só a palavra *"fração do intervalo"* pede um segundo de leitura |
| **Explosão · força** | *"de 0 a 1, quantas nascem juntas: 0 uma de cada vez, no ritmo da Taxa; 1 todas no mesmo instante, como uma explosão"* | **Sim.** Diz o que "solta": **as partículas que nascem** |
| **Explosão · janela** | *"em segundos, de 0 para cima: a janela em que a explosão se espalha"* | **Quase.** "Se espalha" não diz se é o tempo em que a explosão acontece ou o tempo que cada partícula leva; ainda confunde |
| **Vira com o voo** | *"cada partícula gira e aponta para onde vai: bom para faísca e chuva, que viram riscos"* | **Sim.** Dá o efeito e dois exemplos |
| **Na frente** | *"quem fica na frente quando duas partículas se cobrem: as mais novas (as que acabaram de nascer) ou as mais velhas"* | **Sim.** |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | Tudo o que o lote 3 deixou sem unidade (*Lugar X · Y*, *Giro*, *Tremor*) **agora tem** |
| C2 | A dica da *janela da explosão* é a única das quatro que ainda deixa dúvida |
| C3 | Em *Movimento* o rótulo *Abertura (±°)* segue só com a dica; a dica diz *"para cada lado da Direção"* |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Nada trocado | — | — |
| "Entenderia" | **sou eu** lendo as dicas, e conheço o programa | o que um usuário de primeira vez entende |
| Dicas | li o texto do título dos campos; **não** vi o balão na tela | que o balão aparece inteiro e a tempo |
| Cena com `Ctrl+↓` | comparei duas fotos (frente e fundo de tudo); **não** vi os passos intermediários | a cena em cada um dos três passos |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
