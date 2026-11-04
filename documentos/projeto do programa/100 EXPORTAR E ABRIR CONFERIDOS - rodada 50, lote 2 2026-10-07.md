# Exportar e abrir conferidos — rodada 50, lote 2 (v36.3) — 07/10/2026

Rodada 50, lote 2 (o doc `98`, itens A e X). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v36.3** (servi o zip `recorte v36.3 2026-10-07.zip`, extraído fora da pasta; o zip é das 13h50). O "Sobre" diz ***"Versão v36.3"*** e o `LEIA-ME.txt`, ***"Versao v36.3"*** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado **por protocolo** (não o mouse do aplicativo) · 1920×1080 |
| Hora | 13h51 a 13h58, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-50-conferida/lote2/` (6) |
| Material | o herói de exemplo, aberto de dentro do programa (**sem** pasta de projeto); para o "não salvo", **mudei** a caixa *Arte em pixel* da base (o título ganhou o ponto •). **Nada foi salvo em disco.** **Não rodei `medir`, roteiro nem pesos** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 2, 3) | 0 | 0 | 3 |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Exportar → "GIF, PNG, folha, vídeo…" → "Só este quadro"*: o formato vira PNG (ou pergunta); o arquivo é `.png` e o nome bate com o relatório | **vi funcionar** | Janela *Exportar imagem* com o **GIF animado** escolhido: *"Vai sair: heroi.gif — idle, 60 quadros a 30…"*. **Marquei *Só este quadro (0 s)***: o **Formato passou a *Sequência de imagens PNG*** sozinho, e a frase: ***"Vai sair: heroi.png — idle, 1 imagem"*** (**`heroi.png`**, e não `heroi_0000.png`). **Desmarquei: voltou ao GIF** (*"heroi.gif — idle, 60 quadros a 30"*), **marquei de novo: PNG**; (4 vezes, sempre igual). **Exportei:** o relatório diz ***"Arquivos: heroi.png"***, ***"Só o quadro de 0 s"***, ***"Tamanho de cada quadro: 110 por 241 pixels"***, ***"Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)"***, e o **rodapé**: ***"Imagem PNG: 1 quadro de 110x241, 1 arquivo(s), 31.694 bytes. Foi para Downloads (Ctrl+J mostra)."*** **O nome do relatório, o da frase e o da extensão batem** (`heroi.png`). *(O arquivo em si, no Downloads, **não** provei.)* | `A0_exportar_so_este_quadro` · `A3_marca_desmarca` |
| 2 | Com trabalho não salvo (•), *Arquivo → Abrir o herói*: a janela *"mudanças não salvas"* (Salvar / Descartar / Cancelar) aparece; Cancelar não troca nada; o rodapé nunca diz *"salvo"* sem ter salvado | **vi funcionar** | Mudei *Arte em pixel*: título ***"heroi.bone • — Recorte"***, rodapé ***"Mudar Arte em pixel. Arquivo não salvo."***. *Arquivo → Abrir o herói (exemplo)*: **abriu a janela** ***"heroi.bone tem mudanças não salvas — O que fazer com elas antes de seguir?"*** com ***Salvar e continuar*** (*Grava como o Ctrl+S, e segue*), ***Descartar as mudanças*** (*Segue sem salvar: as mudanças deste arquivo se perdem*) e ***Cancelar*** (*Nada muda: o arquivo continua aberto, com as mudanças*). **Cancelar:** o título **continuou com o •**, a caixa *Arte em pixel* **continuou marcada**, o rodapé ***"Nada mudou: heroi.bone continua aberto, com as mudanças"***. **Descartar:** o herói **reabriu limpo** (título **sem o •**, *Arte em pixel* **desmarcada**) e o rodapé diz ***"Abriu a base. Sem mudanças por salvar."*** (na v36.1 dizia *"Arquivo salvo."*). **Em nenhum momento o rodapé disse *"salvo"* sem ter salvado.** *(O **Salvar e continuar** eu **não** apertei: grava em disco.)* | `B0_abrir_heroi_com_nao_salvo` · `B2_depois_de_descartar` |
| 3 | *Reabrir o fechado* volta com as imagens, ou diz por quê | **vi funcionar** | *Arquivo → Reabrir o fechado*: abriu a janela ***"Reabrir o fechado — Guardado hoje às 13:53: heroi.bone. Isto substitui o que está aberto agora."*** (*Reabrir* / *Deixar como está*). Apertei *Reabrir*: voltou o **trabalho guardado** (*Arte em pixel* **marcada**, a mudança que eu fizera) e o rodapé diz ***"Reaberto o de hoje às 13h53. As imagens não vêm no guardado"*** (**inteiro**, 446 px de 446: sem *"…"*). **Voltou sem as imagens** (a aba *Imagens*, que tinha 22 miniaturas, **ficou sem**), e a barra diz ***"43 avisos (21 iguais) — ver"*** (as 21 imagens que faltam). **Diz por quê**; **não** diz **o que fazer** (abrir a pasta) | `C0_reabrir_o_fechado` · `C1_depois_de_reabrir` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | Na janela de exportar, **a caixa *Só este quadro* muda de lugar** (de y 411 com o GIF para y 434 com o PNG) porque o formato muda os campos de baixo: **quem clica duas vezes no mesmo ponto não desmarca**. Confundi-me eu (parecia que *desmarcar* não voltava ao GIF); **não é defeito do programa**, mas **é um pulo de layout** |
| C2 | A frase do *Reabrir o fechado* **diz por quê** mas **não diz o remédio**: *"As imagens não vêm no guardado: abra a pasta do projeto"* **completaria** (pequeno) |
| C3 | O **"Sem mudanças por salvar."** no lugar do *"Arquivo salvo."* **acabou com a mentira** que a rodada pedia; **bate** com o título sem o • |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O `heroi.png` | **li** a janela, o relatório e o rodapé | **o arquivo no Downloads** (não provei) |
| O *Salvar e continuar* | **não** apertei (grava em disco) | que ele salva e abre o herói |
| O *Reabrir o fechado* | só **este** guardado (o herói com a mudança) | um guardado de **pasta de projeto** (com imagens de verdade) |
| Os cliques | **por protocolo**, não o mouse do aplicativo | a sensação da mão |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
