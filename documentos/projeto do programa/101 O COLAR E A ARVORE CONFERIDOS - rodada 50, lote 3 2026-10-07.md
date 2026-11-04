# O colar e a Árvore conferidos — rodada 50, lote 3 (v36.4) — 07/10/2026

Rodada 50, lote 3 (o doc `98`, item B11 e o passo 6 do roteiro). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v36.4** (servi o zip `recorte v36.4 2026-10-07.zip`, extraído fora da pasta; o zip é das 14h06). O "Sobre" diz ***"Versão v36.4"*** e o `LEIA-ME.txt`, ***"Versao v36.4"*** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado **por protocolo** (não o mouse do aplicativo) · 1920×1080 |
| Hora | 14h06 a 14h10, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-50-conferida/lote3/` (6) |
| Material | o herói, a animação `idle` (2,00 s), as chaves do osso `head`. **Desfiz todos os colar e o arrasto da Árvore com Ctrl+Z** (o rodapé confirmou: *"Desfeito: Colar chaves"*, *"Desfeito: Virar filho de head. Sem mudanças por salvar."*). **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |
| Um tropeço meu | no começo cliquei na linha **Resumo** (a de cima, que fica **fixa** por cima da folha) em vez da chave do `head`: isso escolhe **todas as chaves daquele tempo** (*"20 chaves copiadas"*) e **colei 20 chaves** na `idle` (e duas outras vezes por engano). **Desfiz** (voltou às 10 chaves do `head`). **Refiz o teste certo**, abaixo |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1a, 1b, 2) | 0 | 0 | 3 |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1a | Ctrl+C **sem** chave marcada copia a pose do **quadro** (o membro inteiro do escolhido, na agulha), e o rodapé diz *"Pose de 0,00 s copiada: N valores"* | **vi funcionar** | Escolhi o osso `head` na Árvore, **sem** chave marcada na folha. Agulha em **0,00 s**, **Ctrl+C**: ***"Pose de 0,00 s copiada: 4 valores do escolhido. Ctrl+V cola na agulha."***. Agulha em **1,00 s**, **Ctrl+C**: ***"Pose de 1,00 s copiada: 4 valores do escolhido…"*** (**o tempo acompanha a agulha**). Agulha em **1,50 s**, **Ctrl+V**: ***"4 chaves coladas: head em 1,50 s."*** (**nenhuma janela**, pois cabe), **Ctrl+Z**: ***"Desfeito: Colar chaves."*** | `F1_cola_a_pose` |
| 1b | Na linha do tempo, escolher 3 chaves de um osso num quadro, Ctrl+C, ir a outro quadro, Ctrl+V: só as chaves ESCOLHIDAS entram, no quadro da agulha; a duração não muda sem aviso antes; o rodapé conta todas | **vi funcionar** | **(a)** *Escolhi as 3 chaves do `head` em 0,00 s* (*Escala X*, *Escala Y*, *Rotação*; clique + Ctrl+clique + Ctrl+clique). **Ctrl+C:** ***"3 chaves copiadas. Ctrl+V cola na agulha."*** Agulha em **1,50 s**. **Ctrl+V:** ***"3 chaves coladas: head em 1,50 s."***; **só** as três entraram (o `head` ganhou *Escala X*, *Escala Y* e *Rotação* em 1,50 s, e **nenhuma outra linha**); **a duração ficou 2,00 s**. **(b)** *Escolhi 2 chaves de* ***Rotação*** *(0,00 s e 0,70 s)*, **Ctrl+C**, agulha em **1,80 s**, **Ctrl+V** (a segunda iria a 2,50 s): **abriu a janela *"O colar passa do fim da animação"*** ***"Colar em 1,80 s vai até 2,50 s: "idle" tem 2,00 s e cresceria para 2,50 s."*** com ***Colar e esticar*** (*Cola tudo, e a animação passa a ter 2,50 s*), ***Colar só o que cabe*** (*Cola até 2,00 s; o que passaria do fim fica de fora*) e ***Cancelar*** (*Nada é colado*). **Antes de escolher, nada mudara** (2,00 s, 4 chaves). ***Cancelar***: ***"Nada colado: a animação ficou como estava."*** (duração e chaves iguais). ***Colar só o que cabe***: ***"1 chave colada: head em 1,80 s."***, duração **2,00 s**. ***Colar e esticar***: ***"2 chaves coladas: head em 1,80 · 2,50 s. A animação cresceu de 2,00 s para 2,50 s."***: **conta as duas** e **a duração** | `B0_tres_chaves_escolhidas` · `B1_depois_de_colar` · `C0_pergunta_antes` · `C1_so_o_que_cabe` · `C2_colar_e_esticar` |
| 2 | Na Árvore, arrastar uma peça para outro pai prende SEM mover a peça na cena, e o rodapé diz | **vi funcionar** | Arrastei o desenho ***body*** (da `torso`) para o osso ***head*** na **Árvore** (arrasto do navegador, entregue por protocolo). **O desenho ficou onde estava** na cena (comparei as duas fotos lado a lado: **a mesma pose**; o que mudou foi só o **retângulo de escolha** em volta do `body`). O rodapé: ***"body virou filho de head (chave de pai em 1,80 s; o desenho entortou um pouco: os dois ossos têm escalas diferentes)."*** **Diz o que fez, onde (a chave de pai em 1,80 s: a agulha) e a ressalva.** **Ctrl+Z:** ***"Desfeito: Virar filho de head."*** | `E2_antes_depois` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **O Ctrl+C sem chave escolhida** copia **o quadro** (a pose do escolhido), como o CHANGELOG diz; **com chaves escolhidas** copia **as escolhidas**. O que eu fiz de errado (a linha *Resumo*) escolhe **uma coluna inteira**: **20 chaves**: **faz sentido**, mas **não é óbvio** a quem clica na linha de cima por engano |
| C2 | A janela do colar dá **a conta antes** (*"vai até 2,50 s… cresceria para 2,50 s"*): **o Spine também pergunta?** (**não vi**: o CHANGELOG diz que sim, *"pelo Spine"*) |
| C3 | O rodapé do ***"Colar só o que cabe"*** conta **só o que entrou** (*"1 chave colada"*) e **não diz** que **uma ficou de fora** |
| C4 | Depois do arrasto da Árvore, **a lista da Árvore ainda mostra `body` sob a `torso`** (a mudança de pai é **uma chave na `idle`**, não da base): **faz sentido** com *"chave de pai em 1,80 s"*, mas **quem olha a lista** pode achar que **nada aconteceu** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Os cliques e arrastos | **por protocolo**, não o mouse do aplicativo | a sensação da mão |
| O arrasto da Árvore | arrasto do navegador entregue por protocolo | a sensação do arrasto na mão |
| *"Não mexe na cena"* | **olhei** duas fotos (antes e depois) e a **diferença de pixels** (3.389 de 1.020.000, dentro da caixa de 228×251 px em volta do `body`, onde apareceu o retângulo de escolha com as alças; **não** separei pixel a pixel o que é alça e o que é desenho) | uma medição em milímetros |
| *"Pelo Spine"* | **não** vi o Spine | se ele pergunta ou conta igual |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
