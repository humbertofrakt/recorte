# As imagens conferidas — lote 3, o pivô se digita (v33.0) — 06/10/2026

Rodada 44, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.0** (o "Sobre" diz v33.0; o zip `recorte v33.0 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 18h54 a 18h56, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-44-conferida/lote3/` (5) |
| Material | as 13 imagens de `exemplo/game/mao` numa **pasta em memória**; *Novo projeto*; a `_0002_Camada-3` (392 × 390 px). **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 2, 3) | **1** (4) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 4 | **X/Y em px por imagem** vi funcionar; o aviso *"Repetir para a pasta…"* ocupa **duas linhas**; **a dica da miniatura não traz o tamanho da imagem em px** (traz o pivô) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A dica da miniatura não diz o tamanho da imagem.** Em cada célula da aba *Pivôs* a dica é ***"_0002_Camada-3: pivô em 300, 7. Clique para acertar. Pivô à mão: o osso não está nele, e o desenho ficou parado. Imagens → Voltar o pivô para o osso desfaz"*** (ou, sem pivô, ***"_0000_Camada-1: ainda sem pivô. Clique para acertar"***). **O "392 × 390 px" só aparece na janela** de *Definir pivô*. O pedido dizia *"a dica da miniatura traz o tamanho em px"* | 4 | `F0_aba_pivos` |
| 2 | **O aviso *"Repetir para a pasta: esta imagem está na raiz, sem subpasta. A raiz não é um grupo"* ocupa duas linhas** na aba *Pivôs* (33 px de altura para uma linha de 16,5 px; 214 px de largura). Não sei se *"o aviso"* do pedido é esse: o outro texto (*"_0002_Camada-3 · pivô à mão"*) **cabe numa linha** (23 px) | 4 | `F0_aba_pivos` |
| 3 | *Pequeno.* **Texto que não é número num campo da janela de pivô é aceito em silêncio.** Digitei `abc` no *X* e apertei *Gravar o pivô*: a janela **fechou**, o pivô **ficou como estava (300, 7)** e o rodapé repetiu *"Pivô de …: 300, 7"* **sem dizer que `abc` não valeu**. Outras janelas avisam (*"abc não é número: X ficou…"*, no lote 2 das Propriedades) | 1 | `G0_abc_gravar` |
| 4 | *Pequeno.* **Digitar o X não move a cena**: com o desenho **na cena**, a janela diz ***"1 desenho usa esta imagem. Ele fica parado: só o ponto do pivô muda de lugar."*** Mudei de 30 para 300 e a cena ficou **igual (0 pixels de diferença)**. **É por desenho** (o desenho não anda), mas o pedido dizia *"move o ponto e a cena"*: **só o ponto se move**, na janela e na aba *Pivôs* | 1 | `E_cena_antes_depois` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Imagens → Definir pivô…*: a janela tem campos *X* e *Y* em px e diz *"Imagem de W × H px. X de 0 a W, Y de 0 a H"*; digitar *X = 30* move o ponto e a cena | **vi funcionar** *(só o ponto, não a cena: defeito 4)* | Duplo clique na imagem: janela ***"Definir pivô de "_0002_Camada-3""***, a prévia com o ponto (+ laranja), os nove botões, **dois campos: *X* `196 px` e *Y* `195 px`** (o centro de uma imagem de 392 × 390) e o texto ***"Imagem de 392 × 390 px. X de 0 a 392, Y de 0 a 390, contados da esquerda e de baixo; fora disso também vale (o ombro de uma manga curta). Setas: 1 px · Shift+setas: 10 px"***. **Digitei *X = 30*:** o **+ laranja foi para a esquerda** da prévia (351 pixels diferentes na foto). **Digitei *Y = 7*:** foi para **baixo** (338 pixels). **Fora da faixa:** `500` fica no campo (*"fora disso também vale"*). Dicas dos campos: *"X do pivô, em px da imagem, de 0 a 392, contado da esquerda. Fora da faixa também vale"* e *"Y … contado da base …"* | `B0_janela_pivo` · `C_pivo_antes_x30_y7` |
| 2 | *"Deixar como está"* **não** tem a cor do *"Gravar"* | **vi funcionar** | **Medi as cores:** *Gravar o pivô* tem fundo ***rgb(91, 141, 255)*** (azul cheio) e letra escura; ***Deixar como está*** tem fundo **transparente** (`rgba(0,0,0,0)`), letra clara e **contorno**: a classe é ***"dialog-close dialog-secundario"***. Na foto, o *Gravar* é azul e o *Deixar* só tem moldura | `B0_janela_pivo` |
| 3 | O rodapé diz *"Quando esta imagem entrar numa troca, ela cai com este ponto no osso"* | **vi funcionar** | Com o desenho na cena, *Gravar o pivô* (X = 300): ***"Pivô de "_0002_Camada-3": 300, 7. 1 desenho ficou parado. O pivô fica guardado à mão: o osso não está nele. Quando esta imagem entrar numa troca, ela cai com este ponto no osso."*** Sem desenho na cena a frase é outra (***"…30, 7. Guardado para quando ela entrar na cena."***) | `G0_abc_gravar` |
| 4 | A aba *Pivôs* mostra *"X 30 px · Y 7 px"* por imagem; o aviso cabe numa linha; a dica da miniatura traz o tamanho em px | **pela metade** | **Leitura:** na aba *Pivôs*, com a imagem escolhida, ***"X 300 px · Y 7 px"*** (o que digitei) e o título ***"_0002_Camada-3 · pivô à mão"***; escolhendo outra imagem sem pivô: ***"X 196 px · Y 195 px"*** (o centro). **O aviso** *"Repetir para a pasta…"* **tem duas linhas** (defeito 2). **A dica da miniatura** traz o pivô e **não** o tamanho da imagem (defeito 1) | `F0_aba_pivos` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A janela **muda de frase** conforme haja desenho na cena (*"Nenhum desenho usa esta imagem ainda. O pivô fica gravado para quando ela entrar"* · *"1 desenho usa esta imagem. Ele fica parado: só o ponto do pivô muda de lugar"*): **diz o que vai acontecer**. Bom |
| C2 | A miniatura da imagem com **pivô à mão** ganha um **ponto laranja** no canto e uma cruz; as sem pivô, **borda tracejada**: dá para ver de longe quais já têm |
| C3 | Imagem **sem pivô** mostra o **centro** (*196, 195*) como se fosse um valor; a miniatura diz *"ainda sem pivô"*: **são duas leituras do mesmo estado** (o programa usa o centro enquanto não houver outro?) |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A pasta | **pasta em memória** com as imagens de verdade (`mao`) | abrir uma pasta de verdade com o seletor do Windows |
| O pivô **na cena com osso** | **não montei** esqueleto: só desenho solto | que **a troca** põe o ponto no osso (a frase do rodapé promete) |
| As cores | li o `background-color` calculado | o contraste a olho, no tema claro |
| As setas e `Shift+setas` | **não** testei | o passo de 1 px e de 10 px |
| *Repetir para a pasta* | **não** marquei | o pivô em todas as imagens da subpasta |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
