# A linha do tempo conferida — lote 1 (v31.4) — 06/10/2026

Rodada 40, lote 1, "a curva e o valor se veem". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.4** (o "Sobre" diz v31.4) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080, e 1280×720 na linha 4 |
| Hora | 12h50 a 12h55, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-40-conferida/lote1/` (8) |
| Material | o herói de exemplo, aberto pelo próprio programa, animação `idle`. Mudei a curva de **uma** chave (torso, 1,00 s) várias vezes para ver cada desenho; nada foi salvo |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (2, 3, 4) | **1** (1) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | reta e pontilhado se veem de primeira; o **arco** é fino e **Suave, Entrada suave e Saída suave saem iguais** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A folha desenha *Suave*, *Entrada suave* e *Saída suave* IGUAIS.** Medi a linha, trecho depois da chave, nas três: o perfil sai o mesmo (alturas 26 · 23 · 21 · 19 · 19 · 18 · 19 · 19 · 20 · 22 · 25 px) e **simétrico**. Mas o **gráfico** (aba *Curvas*) mostra alças diferentes: *Suave* com as duas, *Entrada suave* só a de chegada, *Saída suave* só a de saída. O dado é diferente; **o desenho da folha não diz qual é qual** | 1 | `K_cinco_curvas` · `G2_quatro_curvas` |
| 2 | **O arco é fino.** Numa linha de 30 px de altura o arco sobe uns 8 px: de longe parece uma reta. *Parada* (pontilhado) e *Linear* (reta, chata) se distinguem bem; o arco, só de perto | 1 | `K_cinco_curvas` |
| 3 | *Pequeno.* **Em 1280×720 a folha mostra só a linha *Resumo*.** As linhas de cada osso, onde as curvas se desenham, ficam **abaixo da dobra**; ao rolar, a primeira some **por baixo do *Resumo* fixo**. Por isso **não vi as curvas em 720**: só o menu da chave | 4 | `W_720_linha` · `W_720_rolou` |
| 4 | *Pequeno.* **Dois nomes para a curva livre:** a dica diz ***"Curva à mão"*** (*"1,00 s · Rotação de torso = 93° · Curva à mão"*) e o menu da chave diz ***"Curva…"***. *Parada* tem um nome só; a curva livre tem dois | 4 | `C_smile_parada` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Entre duas chaves, a folha desenha a curva: reta (linear), arco (suave), pontilhado (Parada) | **pela metade** | **Reta:** com *Linear*, uma linha **reta e chata** entre as chaves. **Pontilhado:** com *Parada*, o trecho depois da chave fica **tracejado**; na linha *Peso de smile* o trecho de 0 a 1 s é cheio e o de 1 a 2 s (depois da chave *Parada*) **pontilhado**. **Arco:** *Suave*, *Entrada suave* e *Saída suave* e *Curva à mão* desenham um **arco**. Mas as três primeiras saem **iguais** (defeito 1) e o arco é **fino** (defeito 2) | `K_cinco_curvas` · `C_smile_parada` |
| 2 | A dica do losango diz tempo, valor com unidade e curva | **vi funcionar** | Todas no mesmo molde: ***"0,00 s · Rotação de torso = 90° · Curva à mão"*** · ***"1,00 s · Posição Y de hips = 88 px · Linear"*** · ***"1,00 s · Escala X de head = 1,02× · Linear"*** · ***"1,00 s · Peso de smile = 0,3 · Parada"*** · ***"1,00 s · Valor de lookX = 0,5 · Linear"*** · ***"1,00 s · Rotação de torso = 93° · Entrada suave"*** (depois de eu trocar). **Unidades:** °, px, ×, e nada onde não há (peso, valor). **Última chave:** ***"a última: sem curva"***. **Sem valor:** *"Malha de head · Curva à mão"*, *"Cor de head"*, *"Sequência de hand"* (o que não tem número não inventa) | `C_smile_parada` (e as dicas lidas na lista de botões) |
| 3 | Clicar na chave leva a agulha até ela; a aba *Curvas* abre na chave escolhida | **vi funcionar** | Agulha em 0,00 s. **Cliquei a chave de 1,00 s** do torso: a agulha foi para ***1,00 s · q 30***, o campo de tempo diz *1,00 s* e a chave ficou **laranja** (*"há chave neste tempo"*). Abri *Curvas*: ***"Chave em 1,00 s de torso — Rotação. As alças vão até a próxima chave."***, com a barra *1,00 s · quadro 30* e as alças dela no gráfico | `G_clicou_na_chave` · `G_curvas_aberta_na_chave` |
| 4 | Um nome só: *Parada* no menu da chave e no gráfico; *Entrada suave* e *Saída suave* no menu; o menu cabe em 1280×720 | **vi funcionar** | **Menu da chave** (botão direito): ***Linear · Suave · Entrada suave · Saída suave · ✓ Parada · Curva… · Apagar chave***. **Gráfico (*Curvas*):** botões ***Suave · Entrada suave · Saída suave · Linear · Parada · Passa do alvo · Recua e passa***, dica da *Parada*: *"Segura o valor até a próxima chave. Sem meio-termo."* **Procurei os nomes antigos** (*Degrau, Constante, Stepped, Congelado, Segurar, Hold*) **em toda a tela, também na aba *Curvas*: não achei nenhum**. O rodapé diz *"1 chave(s) agora paradas"* (plural). **Em 1280×720** abri o menu **na linha *Resumo*** e ele **cabe inteiro**, aberto **para cima**, com *Apagar as 11 chaves* no fim, de 385 a 645 px de uma janela de 720. *(Só o menu da *Resumo*: as linhas de osso ficaram fora da vista em 720, defeito 3.)* | `W_720_menu` · `G_curvas_aberta_na_chave` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O gráfico de *Curvas*, aberto na chave, mostra **todas** as curvas juntas numa escala de ±100: a do torso (3°) fica **achatada**, e o botão *Ajustar* não a levou para perto. A chave **está** selecionada e as alças aparecem, mas **a forma não se lê** |
| C2 | Quando a chave é a *Parada*, a folha desenha o **pontilhado até a próxima chave**; o trecho **antes** dela segue como era (cheio). Mostra bem *de onde a Parada vale* |
| C3 | A **altura útil da folha** é pequena em 1920×1080 também: com a barra de tocar e a de ferramentas da chave, restam **umas 4 linhas** de osso. Só aumentei com um arrasto do alto do painel |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Curvas | troquei a curva de **uma** chave (torso, 1,00 s) para ver cada desenho; **não salvei** | outras chaves, outras propriedades (cor, malha) |
| Dica | li o texto do título dos botões; **não** vi o balão na tela | que o balão aparece inteiro e a tempo |
| Arco | medi a altura da linha por pixels | o que o Humberto veria |
| 1280×720 | emulação de janela; só o **menu** da *Resumo* | as curvas por trecho em 720 (defeito 3) |
| *Esc* no menu da chave | tentei, mas a chave caiu fora da vista; **não conferi** | se o *Esc* fecha o menu |
| Telas | 1920×1080 e 1280×720; 1440×900 não | — |
