# As partículas conferidas — lote 3 (v30.5) — 06/10/2026

Rodada 38, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.5** (o "Sobre" diz v30.5) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 09h21 a 09h24, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-38-conferida/lote3/` (3) |
| Material | o herói de exemplo, com um emissor *Fogo*; nada trocado por falso |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **1** (4) | **4** (1, 2, 3, 5) | 0 | 5 |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Ctrl+↓ move o emissor uma vez só; os seguintes não fazem nada, sem aviso.** Com o emissor escolhido na Ordem: o 1.º Ctrl+↓ o passou por cima do grupo *arma* (uma casa na lista); o 2.º, 3.º e 4.º **não mudaram a lista**, embora o rodapé diga *"Mandar para trás"* e a escolha siga no emissor. Só voltou a andar depois de clicar na linha de novo. **Os botões ↑/↓ não têm isso**: três cliques, três passos. Idem Ctrl+↑ | 3 | — |
| 2 | **Em *Cor ao nascer*, a barrinha mostra o número só na dica.** Ao arrastar, a dica passa de *100 %* para *82 %* ("opacidade: 82 % (de 0 a 100 %…)"), mas **nada aparece na tela durante o arrasto** (o número não é desenhado ao lado) | 2 | `C1_cor_durante` |
| 3 | *Pouco:* ficaram sem unidade ou faixa o **Lugar X · Y**, o **Giro (°)** do Lugar e o **Tremor ao nascer**: ver a lista abaixo | 1 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Todo número da ficha tem unidade e faixa, no rótulo ou na dica: Raio (px), Início/Fim (px), Freio (por s) com a conta, Direção (°, 90 = para cima), Sair do centro (0 a 1), Explosão força (0 a 1) e janela (s) | **pela metade** | **Têm, e dizem a faixa:** **Raio (px)** *"em px, de 0 para cima"* · **Retângulo (px)** *larg. / alt.* · **Linha: Início (px) / Fim (px)** com X e Y e *"em px, no osso do emissor: X positivo vai para a direita, Y positivo para cima"* · **Freio (por s)** *"quanto a velocidade cai em um segundo. 0 não freia; 0,5 tira 39 %; 1 tira 63 %; 2 tira 86 %"* · **Direção (°)** *"de 0 a 360: 0 para a direita, 90 para cima…"* · **Sair do centro** *"de 0 a 1: 0 sai na Direção, 1 sai para fora da forma"* · **Explosão força** *"de 0 a 1: 0 solta aos poucos, 1 solta todas de uma vez"* · **janela (s)** *"em segundos, de 0 para cima"* · Vida, Velocidade, Tamanho, Giros, Atraso, Máximo de vivas, Semente e os campos da folha. **Ficaram sem unidade ou faixa:** ver a lista abaixo | — |
| 2 | A barrinha ao lado de cada cor diz a opacidade, de 0 a 100 %, e o número muda ao arrastar | **pela metade** | Dica de cada barrinha: *"Cor ao nascer (de), opacidade: 100 % (de 0 a 100 %: 0 é invisível, 100 é cheia)"*; o mesmo para *(até)* e *Cor do emissor*. Ao arrastar para a esquerda, o número da dica muda (**100 → 82 %**). **Não vi o número na tela** (defeito 2) | `C1_cor_durante` |
| 3 | Na Ordem: Ctrl+↑/↓ e os botões ↑/↓ movem o emissor um lugar de verdade, a cena obedece, Ctrl+Z desfaz | **pela metade** | **Botões ↑/↓:** três cliques para baixo, três passos (da 1.ª para a 4.ª posição); três para cima, de volta; **`Ctrl+Z` desfaz** (*"Desfeito: Trazer para a frente"*). **Ctrl+↓/↑:** só o primeiro funciona (defeito 1). Não conferi a cena com os passos (só a lista) | — |
| 4 | Clicar no emissor na Ordem abre a ficha do emissor (não a do slot); clicar numa imagem continua abrindo a do slot | **vi funcionar** | Emissor: *"Emissor: foot_b_particulas"*, com as abas Nascer…Mais. Imagem (`hand`): *"Slot: hand · Ficha rápida"* | `O1_clique_emissor` · `O3_clique_imagem` |
| 5 | Lendo só a tela: um usuário novo entende o que cada campo faz? Diga o que ainda não entenderia | **pela metade** | Ver "Lendo só a tela" | — |

## O que ainda ficou sem unidade ou faixa

| Campo | O que falta |
|:---|:---|
| **Lugar · X · Y** | o rótulo e a dica só dizem *"X"* e *"Y"*: nem px, nem para onde é positivo |
| **Lugar · Giro (°)** | tem o °, mas não a faixa nem o sentido |
| **Forma · Anel e Arco: Espessura (0–1)** | ✓ (tem a faixa e uma conta) · **Raio** ✓ |
| **Tremor ao nascer** | dica *"de 0 a 1: quanto o instante de nascer treme"*, sem a **unidade** (de quê?) |
| **Cor do emissor** e **Cor ao nascer** (as cores) | só dizem *"escolher cor"* |
| **Gravidade** | tem unidade e sinal (*"Y positivo puxa para cima"*); a dica cita exemplos de dois modelos (fogo 60, faísca −400), que não ajudam quem criou um emissor vazio |
| **Espaço (do emissor / do mundo)** | tem a explicação |
| **Nome** | sem faixa (é texto) |

## Lendo só a tela — o que ainda não entenderia

| Na tela | Entendo? |
|:---|:---|
| Vida, Velocidade, Tamanho, Giros, Direção, Abertura, Sair do centro, Freio, Explosão, Gravidade, Raio, Espessura, Trecho, Linha | **Sim**, lendo a dica |
| **"Explosão · força 0"** | entendo que 0 solta aos poucos, mas **não sei o que é "solta"**: partículas, ou a vida delas |
| **"Tremor ao nascer"** | **não entendo**: "quanto o instante de nascer treme" não me diz o que muda na tela |
| **"Abertura (±°) 12"** | entendo (a dica diz *para cada lado da Direção*), mas o rótulo *(±°)* só ajuda a quem já sabe |
| **"Vira com o voo"** | a dica *"Virar para onde vai"* é curta: eu imaginaria que a imagem gira para apontar na direção em que anda, mas não tenho certeza |
| **"Na frente · as mais novas / as mais velhas"** | a dica só diz *"Quem fica na frente"* |
| **"Semente"** | a dica explica (o mesmo número, o mesmo efeito) |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **Muita coisa mudou para melhor desde o lote 2.** As dicas agora trazem "de 0 a …" quase sempre, o Freio traz a conta (0,5 tira 39 %), e a Direção diz "90 para cima" |
| C2 | A dica da **Gravidade** cita "o fogo usa 60, a faísca −400". Quem criou um emissor vazio não vê essa frase como exemplo útil |
| C3 | A barrinha da opacidade não tem rótulo; só a dica diz o que é |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Nada trocado | — | — |
| "Entender sem perguntar" | **sou eu** lendo as dicas, e conheço o programa | o que um usuário de primeira vez entende de verdade |
| Dicas | li o texto do título dos campos, **não** vi o balão na tela | que o balão aparece inteiro e a tempo |
| Passos de um lugar na Ordem | só a lista, o rodapé e o desfazer | o efeito na cena a cada passo |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
