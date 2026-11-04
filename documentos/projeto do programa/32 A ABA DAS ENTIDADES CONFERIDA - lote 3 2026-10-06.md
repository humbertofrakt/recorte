# A aba das entidades conferida — lote 3 (v30.4) — 06/10/2026

Rodada 39, lote 3, "Na cena". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v30.4** (o "Sobre" diz v30.4) |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 09h00 a 09h15, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-39-conferida/lote3/` (6) |
| Material | o herói, a `espada` e o `poder5` numa **pasta em memória** (o seletor do Windows trocado por um falso). Abri pelo caminho do programa: *Novo projeto* → pasta → *Abrir heroi.bone* |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** | 0 | 0 | 5 |

## Os defeitos

Nenhum dos cinco falhou. Duas notas pequenas, no fim.

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Aba Entidades: botão "Na cena" (ícone e palavra, nome na dica); ligado, a cena desenha a peça de teste no slot dela; desligado, some | **vi funcionar** | Botão **olho + "Na cena"** no alto da aba; a dica diz *"Na cena: mostra a montagem de teste na cena enquanto você anima. Desligado: só a Prévia desenha as peças de teste…"*. **Nasce desligado.** Ligado (*"A montagem de teste está na cena. Ela não entra na animação."*): a peça do `poder5` aparece na mão do herói, no lugar da espada. Desligado (*"A montagem de teste saiu da cena. Ela continua na aba Entidades e na Prévia."*): some e a espada volta | `Z2_ligado_e_desligado` |
| 2 | A peça de teste segue o osso no idle (toque a animação: ela acompanha) | **vi funcionar** | Nos quadros 0, 15, 30 e 45 do `idle`, a peça fica **presa à mão**: o corpo gira e ela vai junto, na mesma posição em relação à mão | `Z3_quadros_0_15_30_45` |
| 3 | O clique na cena passa por ela: clicar em cima escolhe o que está por baixo, nunca a peça de teste | **vi funcionar** | Com a ferramenta *Selecionar*, cliquei em cinco pontos sobre a peça, **ligado e desligado**: **as escolhas foram iguais nos dois casos** (*hand_target, forearm, blade, forearm, arm*), e nunca o slot do teste. No ponto onde a peça cobre a lâmina da espada, escolheu `blade` | `Z4_clique_em_cima` |
| 4 | Com os Detalhes abertos, a linha do tempo mostra a linha cinza tracejada "Montagem de teste na cena: … no …" | **vi funcionar** | Linha **"Teste"**, de borda tracejada: *"Montagem de teste na cena: poder5 (parada) no weapon. Não entra na animação."* Para vê-la tive de **rolar a linha do tempo até o fim** (ela é a última linha) | `Z5_linha_teste` |
| 5 | Salvar e reabrir: "Na cena" volta como estava; o `.bone` não muda de tamanho | **vi funcionar** | **Ligado:** *"Salvo em heroi.bone. 1 corpo e o manifesto…"*; o `manifest.json` ganhou `montagem.naCena: true`; reabri (Novo projeto → *Abrir heroi.bone*): *"Na cena"* **ligado**, a peça na mão e o cartão TESTE no `weapon`. **Desligado:** `naCena: false`; reabri: **desligado**. **`.bone`:** com o teste e sem o teste, na mesma sessão, `heroi.bone` gravou **48504 bytes nas duas**; com *Na cena* ligado ou desligado, **48529 nas duas** | `Z6_reaberto_ligado` · `Z6_reaberto_desligado` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A linha do teste fica no fim da linha do tempo**, abaixo de tudo: com os Detalhes abertos, só aparece rolando. Quem acabou de ligar o teste pode achar que ela não existe (o pedido era "mostra a linha"; ela está lá, fora de vista) |
| C2 | Com a peça na cena, o `poder5` **cobre a espada** (a do herói some no quadro 0). É esperado (o teste entra no lugar da peça), mas quem liga "Na cena" pela primeira vez vê a espada sumir |
| C3 | O botão ligado fica azul, e o desligado fica cinza, com o mesmo ícone. A diferença de cor é a única pista do estado |
| C4 | Os tamanhos do `.bone` mudaram de uma gravação para outra por **outro motivo** (48529 antes de eu desligar o teste, 48504 depois): não é o teste nem o *Na cena*, e não consegui dizer o que foi |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo do Windows | pasta em memória | Salvar e abrir numa pasta de verdade |
| "Reabrir" | Novo projeto → Abrir heroi.bone, **na mesma página** | fechar o navegador e abrir de novo |
| Arrasto | arrasto de verdade interceptado por protocolo | o arrasto com a mão |
| "Segue o osso" | olhei quatro quadros parados (0, 15, 30, 45), não o toque contínuo | a suavidade do movimento |
| "O clique passa" | só com a ferramenta *Selecionar*; com *Transformar* o clique escolhe osso | outras ferramentas |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
