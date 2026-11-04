# O lote 6c conferido — a Ordem, as dicas e as fichas (v35.6) — 07/10/2026

Rodada 47, lote 6c (as notas dos docs `90` e `91`). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.6** (o "Sobre" diz v35.6; servi o zip `recorte v35.6 2026-10-07.zip`, extraído fora da pasta; o zip é das 08h56) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 08h57 a 09h00, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote6c/` (5) |
| Material | o herói, a `idle`, o osso `head` e o desenho `body`. As pastas dobradas da Prévia, **abri e fechei**. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |
| Nota | a lista era: *Ordem em 720 com 3 linhas · dicas sem jargão (Curvas, "Vendo", camada, evento) · Propriedades, Prévia e Regras em 1920 sem rolar como corpo*. O `ESTADO.md` diz da v35.6: *"a ficha completa dobra os grupos; as Curvas sem jargão; a Ordem mais compacta em tela baixa"* |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (2a, 3a) | **3** (1, 2b, 3b) | **1** (2c) | 6 |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 1 | Ordem em 720 com 3 linhas | **pela metade** (2 inteiras) |
| 2a | Curvas e *"Vendo"* sem jargão | **vi funcionar** |
| 2b | Camada (Prévia) sem jargão | **pela metade** (a frase de *Todos os ossos* ficou clara; o *"O que se perde"* não) |
| 2c | Evento sem jargão e com dica | **não funciona** (nada mudou) |
| 3a | Propriedades em 1920 sem rolar como corpo | **vi funcionar** |
| 3b | Prévia e Regras em 1920 sem rolar como corpo | **pela metade** (a Prévia dobra mas rola; a Regras não mudou) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A Ordem em 1280×720 mostra duas linhas inteiras, não três.** Recarreguei em 1280×720 e abri o herói: as linhas agora têm **31 px** (eram 45): o corpo da aba tem **122 px**, a lista **81 px**; cabem **`hand`** e **`weapon`** inteiras, e a terceira (`arma`) **não** | 1 | `A0_ordem_720` |
| 2 | **A Prévia, em 1920, ainda rola como um corpo só.** Com a *Camada 0* aberta, as *Camadas 1 a 3* fechadas e o *Copiar* fechado: **665 px de conteúdo para 412 de janela** (rola 253 px). Com **tudo fechado**: 425 para 412 (13 px). **Dobra, mas rola** | 3b | `E0_previa_dobrada` |
| 3 | **A Regras, em 1920, não mudou**: *Parâmetros*, *Regras*, *Variáveis* e *Etiquetas* **não dobram**; conteúdo **721 px** para **380** | 3b | — |
| 4 | **O jargão da Prévia ficou**: ***"Ficam de fora: eventos, ordem de desenho, cor de slot, malha, sequência de imagens, parâmetros, morphs, variáveis e tags."*** E **nada diz o que é uma camada** nem **para que se mistura** | 2b | `C0_previa_textos` |
| 5 | **A chave de evento não mudou**: *Evento*, *Som*, *Pasta dos sons*, *Texto* **sem dica**; **nada diz o que é um evento**. As dicas de *Inteiro*, *Decimal*, *Volume* e *Balanço* **continuam claras** | 2c | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Em 720, a Ordem mostra 3 linhas | **pela metade** | Defeito 1: **2 inteiras** (eram 1 na v35.5): as linhas encolheram de 45 para 31 px, e ainda **faltam 31 px** para a terceira | `A0_ordem_720` |
| 2a | Dicas sem jargão nas Curvas e no *"Vendo"* | **vi funcionar** | ***Passa do alvo***: ***"Passa um pouco do valor da próxima chave e volta a ele, como um elástico."*** (era *"É o overshoot / "back out" do Spine e do Blender"*). ***Recua e passa***: ***"Recua um pouco antes de sair, passa do alvo e volta: bom para um golpe ou um pulo."*** (era *"back in-out"*). Os sete formatos **continuam terminando em *"Primeiro escolha uma chave: clique num ponto do gráfico…"***. A palavra ***"Vendo"*** **virou *"à vista"*** em todas as linhas (*"torso — Rotação · à vista"*), e a dica de cada linha diz *"clique mostra ou esconde esta linha no gráfico"*. **Nenhuma** das dicas cita *Spine* nem *Blender* | `B0_curvas` |
| 2b | Dicas sem jargão na camada (Prévia) | **pela metade** | ***Todos os ossos***: a dica agora diz ***"esta camada move o boneco inteiro. Desmarcado, só os ossos marcados abaixo"*** (era sem dica). *Animação*, *Repetir*, *Velocidade*, *Quanto aparece*, *Mistura*: **com dica clara**. **Mas** defeito 4 | `C0_previa_textos` |
| 2c | Dicas sem jargão no evento | **não funciona** | Defeito 5: **igual à v35.5** | — |
| 3a | A Propriedades em 1920 não rola como um corpo | **vi funcionar** | **Osso `head`:** corpo **472 px**, **nada rola**; a ficha **dobra os grupos**: ***Ficha rápida*** (X, Y, Escala X/Y, Ângulo, Alfa) à vista, ***COMPENSAR*** ▸, ***OSSO*** ▾ aberto (**Nome**, **Comprimento**: o grupo do nome), ***MARCAÇÃO NO EDITOR*** ▸, ***POSIÇÃO E FORMA*** ▸, ***HERANÇA DO OSSO PAI*** ▸. **Desenho `body`:** **o mesmo**, **nada rola**. (Na v35.5 o osso tinha 727 px para 472) | `D0_propriedades_osso` |
| 3b | A Prévia e a Regras em 1920 não rolam como um corpo | **pela metade** | Defeitos 2 e 3 | `E0_previa_dobrada` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A **ficha dobra o grupo do nome aberto** e **deixa os outros fechados**: foi o que fez a Propriedades caber. Cada título tem a **setinha** (▸ / ▾) |
| C2 | A palavra ***"à vista"*** no lugar de *"Vendo"* **diz o que é** (a linha está à vista no gráfico); a dica ensina o resto |
| C3 | O botão ***Detalhes*** muda a altura da coluna: com a linha do tempo no modo ***Curvas*** (alta) as três colunas à direita ficam em **288 e 320 px**, e com a linha do tempo normal em **472 px**. Medi com a **normal** |
| C4 | A *Prévia* com **tudo dobrado** ainda tem 13 px a mais que a janela: um **degrau** à toa, a rolagem existe para nada |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O 1280×720 | **mudei a janela** do Chrome por protocolo e **recarreguei** | o 1280 de verdade |
| *"Sem jargão"* | **li** os textos e **julguei** | o que um novato entende |
| A Regras e o evento | **medi** e **li**; **não** tenho foto da Regras desta versão (apaguei por engano ao limpar a pasta) | — |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
