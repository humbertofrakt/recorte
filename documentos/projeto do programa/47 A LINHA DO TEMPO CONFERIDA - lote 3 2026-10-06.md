# A linha do tempo conferida — lote 3 (v31.7) — 06/10/2026

Rodada 40, lote 3 e as notas do 44. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v31.7** (o "Sobre" diz v31.7) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 13h16 a 13h18, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-40-conferida/lote3/` (8) |
| Material | o herói de exemplo, aberto pelo próprio programa, animação `idle`, com os *Detalhes* abertos. Mexi em **uma** chave do torso (curva) e em **uma** do hips (apaguei, devolvi, arrastei); **nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **6** (1 a 6) | 0 | 0 | 6 |

## Os defeitos

Nenhum que pare o uso. Só pequenos:

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **Ctrl+Z da chave apagada diz outra coisa.** Apaguei com duplo clique (*"Chave de 1,00 s apagada."*), apertei *Ctrl+Z*: a chave **voltou** e o rodapé disse ***"Chave em 1,00 s: Posição Y de hips."*** (a frase de *gravar* chave), não *"Desfeito: …"* | 2 | — |
| 2 | *Pequeno.* **Na aba *Curvas*, o gráfico fica cortado embaixo** depois do *Ajustar*: o rótulo do piso (*90,00*) e o ponto de início ficam **no limite** da faixa, sob a barra de baixo. A curva se vê, mas o pé do gráfico não | 6 | `G1_ajustar` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | No *Resumo*, *Ctrl+clique* soma à escolha, *Shift+clique* tira — igual ao losango | **vi funcionar** | Cliquei o losango de **0,70 s** (a agulha foi para lá) e dei ***Ctrl+clique* no de 1,40 s: os dois ficaram com o contorno de escolhido**. *Ctrl+clique* no de 1,00 s: **três**. ***Shift+clique* no de 0,70 s: ele **saiu**, ficaram o de 1,00 e o de 1,40**. *(O contorno branco em volta do losango é a marca de escolhido: a classe da página não muda; só a foto diz.)* | `B1_ctrl_soma` · `B2_shift_tira` |
| 2 | Duplo clique numa chave apaga a chave; *Ctrl+Z* devolve | **vi funcionar** | Linha *Posição Y de hips*: chaves em **0,00 · 1,00 · 2,00 s**. **Duplo clique** na de 1,00 s: sobraram **0,00 e 2,00 s**; rodapé ***"Chave de 1,00 s apagada."*** *Ctrl+Z*: **as três de volta**, a de 1,00 s com os mesmos 88 px. O menu da chave também diz: ***"Apagar chave: O mesmo que o Delete e o duplo clique no losango"*** | `D1_apos_duplo` |
| 3 | Ao arrastar uma chave aparece junto do mouse "0,57 s · q 17 · +2 quadros"; some ao soltar | **vi funcionar** | Arrastei a chave de 1,00 s do hips para a direita: junto do mouse, uma leitura ***"1,07 s · q 32 · +2 quadros"*** (mesmo molde do pedido: tempo, quadro, quantos quadros). **Ao soltar, ela sumiu**; a chave ficou em 1,07 s e o rodapé disse *"Chave em 1,07 s: Posição Y de hips."* | `E1_arrastando` |
| 4 | A folha desenha a curva de verdade: Suave em S, Entrada suave e Saída suave **diferentes** (medir o perfil), Parada em degrau pontilhado, 24 px de altura | **vi funcionar** | **Medi** a linha do trecho de 1,00 s a 2,00 s, em 10 pontos, para cada curva da chave do torso (93° → 90°; o número é a altura em pixels, de baixo para cima na foto): ***Linear* 41·39·36·34·32·29·27·25·22·20** (degraus iguais: **reta**) · ***Suave* 41·41·39·37·33·29·25·22·19·18** (**S**: chato nas duas pontas) · ***Entrada suave* 41·41·40·38·36·34·31·28·25·22** (começa **devagar**, termina em subida) · ***Saída suave* 40·37·33·30·27·25·23·21·19·18** (começa **rápido**, termina devagar). **Os quatro perfis são diferentes** (o defeito do lote 1 sumiu). ***Parada*:** linha **pontilhada, horizontal, no valor de partida**, e um **degrau** na chave seguinte. **Altura:** a curva *Suave* vai de 41 a 18 px = **23 px**; a faixa da linha mede **34 px**. A altura do desenho **bate com os 24 px** | `K_cinco_curvas` |
| 5 | *Curva à mão…* é um nome só (menu e dica) | **vi funcionar** | **Menu da chave:** ***Linear · Suave · Entrada suave · Saída suave · Parada · Curva à mão… · Apagar chave***, cada um com dica de frase (*Linear: "Reta entre as duas chaves."* · *Suave: "Começa devagar e termina devagar."* · *Entrada suave: "Começa devagar e termina rápido."* · *Saída suave: "Começa rápido e termina devagar."* · *Parada: "Segura o valor até a próxima chave. Sem meio-termo."* · ***Curva à mão…: "Desenhar a curva à mão, no painel Curvas"***). **Dica do losango** de chave com curva livre: *"…· Curva à mão"*. **O mesmo nome nos dois** (no lote 1 eram dois: *Curva à mão* e *Curva…*). Escolhendo o item, abre a aba *Curvas* na chave | `M_menu_chave` · `M_depois_do_curva` |
| 6 | Na aba *Curvas*, *Ajustar* enquadra a linha da chave escolhida (uma curva de 3° fica visível) | **vi funcionar** | Antes: o gráfico em **±100**, a curva do torso (3°) **achatada**. Depois de ***Ajustar***: o eixo passa a **90,00 a 93,00** e a curva do torso **enche o gráfico** (a subida em S de 90° a 93° e a chave de 1,00 s no alto). *(Falta só o pé do gráfico, defeito 2)* | `G1_ajustar` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O desenho agora **segue o valor**: a linha da folha **sobe e desce** com o número (a do torso sobe de 90° a 93° e volta), e não fica chata como no lote 1 |
| C2 | A leitura do arrasto **traz o quadro** (*q 32*) e o **deslocamento** (*+2 quadros*): dá para arrastar para um quadro exato sem olhar a régua |
| C3 | O **Ctrl+clique** no *Resumo* **não move a agulha**, mas o clique simples **move**: bom, mas só se vê pela foto |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Perfil das curvas | medi **pixels** de uma foto, em 10 pontos | a forma matemática exata |
| "24 px" | medi a curva *Suave* (23 px) e a faixa (34 px) | a altura de desenho no código |
| *Ctrl+clique* e *Shift+clique* | pela marca de escolhido **na foto** (a classe da página não muda) | outra marca, se houver |
| Arrasto | arrasto de verdade por protocolo, com o mouse apertado e movido por mim | o arrasto com a mão |
| *Resumo* com *duplo clique* | **não testei** (só numa chave de linha) | que o duplo no *Resumo* apaga todas as do tempo |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
