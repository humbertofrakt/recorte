# A linha do tempo conferida — lote 4, o ciclo (v32.0) — 06/10/2026

Rodada 40, lote 4. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.** Os 2 vermelhos e a aba *Entidades* rolando (rodada 42, em conserto para a v32.1) **não entram na conta**, como pedido.

| | |
|:---|:---|
| Versão montada | **v32.0** (o "Sobre" diz v32.0) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 13h40 a 13h45, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-40-conferida/lote4/` (6) |
| Material | o herói, aberto pelo próprio programa. **Um andar de 1 s do zero:** *Animação → Nova animação*, nome *andar* (nasce com 1,00 s), osso `leg` (a perna da frente) com a rotação chaveada **só digitando o ângulo** em 0 s (−60°), 0,5 s (−110°) e 1 s (−60°). **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 3, 5) | **1** (4) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 4 | **quadros** e o rodapé *"de 1,00 s para 1,20 s"* vi funcionar; **segundos não consegui digitar**: nenhum formato que tentei foi aceito |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O *Empurrar as chaves* não aceita segundos em nenhum formato que achei.** O pedido dizia *"aceita quadros e segundos"*. Tentei na caixa *Quadros*: ***"0,2 s"***, ***"0,2s"***, ***"0.2 s"***, ***"0,2 seg"*** → todos o rodapé recusou (*"O número de quadros tem que ser maior que zero"*); ***"0,2"*** foi lido como **0,2 quadro** (*"3 chaves andaram 0.2 quadros (0,01 s)… cresceu de 1,00 s para 1,01 s"*). **A dica da caixa só converte quadros em segundos** (*"6 quadros = 0,20 s"*), não diz que se pode digitar segundos. Se existe um jeito, **ele não está dito na tela** | 4 | `J1_digitou_segundos` |
| 2 | *Pequeno.* **O rodapé do Colar espelhado diz *"3 valores trocados de lado"*, mas não diz quantas chaves foram parar na perna de trás nem em que tempos.** Quem não olha a folha não sabe que a perna de trás ganhou chaves em 0, 0,5 e 1 s | 1 | `D0_colado_espelhado` |
| 3 | *Pequeno.* **Os itens do menu *Chaves* trazem a dica *"Abra uma animação primeiro"* com a animação já aberta** (li o texto do título de *Esticar seleção…*, *Empurrar as chaves…*, *Deslocar em laço…*…). Os itens **funcionam** (os usei); a dica é que está velha | 3 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Um andar de 1 s do zero (perna da frente: 3 chaves em 0, 0,5 e 1 s) e *Colar espelhado* para a perna de trás em 0,5 s: a animação **continua com 1,00 s**; a perna de trás recebe as chaves **dando a volta** (0, 0,5, 1 s); o rodapé diz "Deu a volta no fim do laço" | **vi funcionar** | **Do zero:** a animação nasce com **1,00 s**; chaveei `leg` em 0 s (−60°), 0,5 s (−110°), 1 s (−60°). Escolhi as **3 chaves**, apertei *Copiar* e fui para **0,50 s**; *Editar → Pose ▸ → Colar espelhado*. **Resultado:** a duração **continuou 1,00 s**; `leg_b` ganhou **0,00 s = −110°, 0,50 s = −60°, 1,00 s = −110°**, **a volta completa defasada de meio ciclo** (a de trás está sempre no passo contrário). Rodapé: ***"Colado espelhado: 3 valores trocados de lado. Deu a volta no fim do laço: a duração não mudou."*** | `B0_andar_frente` · `D0_colado_espelhado` |
| 2 | A curva (*Suave*) acompanha a chave colada e a chave movida | **vi funcionar** | **Colada:** pus *Suave* na chave de 0,5 s da `leg`, copiei **só essa chave** (a escolha mudou por engano meu) e colei espelhado em 0,5 s: a chave nova da `leg_b` em 0,5 s **nasceu *Suave*** (*"0,50 s · Rotação de leg_b = −110° · Suave"*) e a folha desenhou o arco. **Movida:** arrastei a chave *Suave* da `leg_b` (estavam as 3 escolhidas) de 0,5 s para **0,6 s**: todas andaram **+0,10 s** e a *Suave* **foi junto** (*"0,60 s · … · Suave"*; as outras ficaram *Linear*). **Deslocada em laço:** a *Suave* de 0,5 s foi para **0,00 s** (a volta do 1,0 s) e a de 0,0 s para 0,5 s: **a curva acompanha cada chave** | `E0_suave_colado` · `H2_apos_deslocar` |
| 3 | Menu *Chaves → Deslocar em laço…*: existe e desloca dando a volta | **vi funcionar** | Está em ***Animação → Chaves ▸ → Deslocar em laço…***. Abre *"1 linha. Ela anda inteira, e o que passa do fim volta no começo: a animação continua com 1,00 s. Em 30 quadros por segundo."*, com *Quadros* (**15** de saída) e *Lado*; dica: ***"Meia volta (15 quadros = 0,50 s) põe a perna de trás no passo oposto."*** Apertei *Deslocar*: ***"1 linha deslocada 15 quadros = 0,50 s, dando a volta no fim."*** A duração **não mudou** e as chaves **se deram a volta** (a *Suave* de 0,5 s foi para 0 s). Sem chave escolhida o rodapé diz *"Marque uma chave em cada linha que vai andar: o Deslocar em laço anda a linha inteira"* | `H1_deslocar` · `H2_apos_deslocar` |
| 4 | *Empurrar as chaves*: aceita quadros e segundos; o rodapé diz "de 1,00 s para 1,20 s" quando a animação cresce | **pela metade** | **Quadros:** digitei **6** (3 chaves escolhidas, *para a frente*): rodapé ***"3 chaves andaram 6 quadros (0,20 s) para a frente. A animação cresceu de 1,00 s para 1,20 s."*** e a duração passou a **1,20 s** ✓. A dica da caixa diz *"6 quadros = 0,20 s"* e o texto de cima *"1 quadro = 0,03 s"*. **Segundos:** nenhum formato foi aceito (defeito 1) | `J1_digitou_segundos` |
| 5 | *Copiar* da barra fala no rodapé | **vi funcionar** | Com 3 chaves escolhidas: ***"3 chaves copiadas. Ctrl+V cola na agulha."*** Com 1: ***"1 chave copiada. Ctrl+V cola na agulha."*** (no lote 2 ficava em *"Arquivo salvo."*) | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **ciclo** de verdade se vê na folha: as duas pernas em **sentidos opostos** a cada instante. Dá para tocar e ver; **eu só fotografei parado** |
| C2 | A caixa *Quadros* do *Deslocar em laço* já traz **15** (meia volta de 1 s a 30 por segundo): quem faz um andar acerta de primeira |
| C3 | O botão direito numa chave **muda** a escolha para ela (como no lote 3): para copiar as três é preciso escolher de novo depois de mudar a curva |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O "andar" | fiz **só uma perna** (`leg`), por ângulo digitado; a de trás veio do *Colar espelhado* | um andar completo (braços, corpo) |
| Segundos no *Empurrar* | tentei cinco formatos de texto; **não** li o código para achar um sexto | que o programa **não** aceite segundos de nenhum jeito |
| O ciclo tocando | só **fotos paradas** e as chaves | o movimento em tempo real |
| Dica velha do menu *Chaves* | li o texto do **título** | que o balão apareça assim na tela |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
