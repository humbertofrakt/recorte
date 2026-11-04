# As cinco pendências conferidas — lote 6b (v35.5) — 07/10/2026

Rodada 47, lote 6b (as cinco pendências do doc `90`). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.5** (o "Sobre" diz v35.5; servi o zip `recorte v35.5 2026-10-07.zip`, extraído fora da pasta; o zip é das 08h40) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 08h45 a 08h49, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote6b/` (9) |
| Material | o herói, a `idle`, o osso `head`. A velocidade foi a 200 e **ficou**. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **2** (2, 3) | **2** (4, 5) | **1** (1) | 5 |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 1 | Ordem em 720 com 3 linhas | **não funciona** (1 inteira, como na v35.4) |
| 2 | Setas na barra de velocidade mexem a barra | **vi funcionar** |
| 3 | *"Copiar"* numa linha | **vi funcionar** |
| 4 | Dicas sem jargão (Curvas, camada, evento, *"Vendo"*) | **pela metade** |
| 5 | Propriedades, Prévia e Regras em 1920: o fixo cabe ou dobra | **pela metade** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A Ordem em 1280×720 mostra uma linha inteira, não três.** Recarreguei em 1280×720, abri o herói: o corpo da aba tem **122 px**, a lista **75 px**; só `hand` (45 px) cabe inteira. **Igual à v35.4** (cliquei também em *Árvore* e de volta em *Ordem*: o mesmo) | 1 | `C0_ordem_720` |
| 2 | **O jargão das Curvas ficou.** *Passa do alvo*: ***"Vai além e volta. É o overshoot / "back out" do Spine e do Blender…"***; *Recua e passa*: ***"…É a antecipação / "back in-out"…"***. Os formatos **continuam sem desenho** e o eixo **sem unidade**. A palavra ***"Vendo"*** (a coluna da direita da lista de baixo) **continua**; a dica da linha diz ***"clique mostra ou esconde esta linha no gráfico"***, e **é ela que explica**, não a palavra | 4 | `D0_curvas_1920` |
| 3 | **O jargão da Prévia ficou.** Aberto o *Copiar*: ***"Ficam de fora: eventos, ordem de desenho, cor de slot, malha, sequência de imagens, parâmetros, morphs, variáveis e tags."*** **Nada diz o que é uma camada nem para que se mistura** | 4 | `E0_previa_textos` |
| 4 | **A chave de evento**: as dicas de *Inteiro* (***"um número sem vírgula que o jogo lê junto com o evento (o dano, a vez do passo)"***), *Decimal*, *Volume* e *Balanço* **são claras**, e *Chavear evento* / *Apagar esta chave* dizem **qual evento e que tempo**; **mas** *Evento*, *Som*, *Pasta dos sons*, *O arquivo* e *Texto* **não têm dica**, e **nada diz o que é um evento** | 4 | `F0_chave_evento` |
| 5 | **Em 1920 a Propriedades (osso) e a Regras rolam como um corpo só, sem dobrar nada.** *Propriedades* (osso `head`): corpo **472 px**, conteúdo **727**; seções *Ficha rápida*, *Compensar*, *Osso*, *Marcação no editor*, *Posição e forma*, *Herança do osso pai*: **nenhuma é dobra** (não são `details`). *Regras*: corpo 472, conteúdo **721**; *Parâmetros*, *Regras*, *Variáveis*, *Etiquetas*: **nenhuma dobra**. *Prévia*: corpo 472, conteúdo **1134**; **dobra**: as *Camadas 1, 2 e 3* (fechadas) e o *Copiar* (fechado por padrão: a foto `B0` o mostra fechado) | 5 | `G0_propriedades_osso_1920` · `G2_regras_1920_sem_detalhes` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Em 720, a Ordem mostra 3 linhas | **não funciona** | Defeito 1: **1 linha inteira** | `C0_ordem_720` |
| 2 | Com o foco na barra de velocidade, as setas mexem a barra e não a agulha | **vi funcionar** | `idle` aberta; **cliquei** na barra (a 25 %: foi de 100 a **46**, o foco **ficou nela**, `.dope-toc-barra`). `→` ×3 **46 → 47 → 48 → 49** e `←` ×3 **de volta a 46**; **a agulha ficou em 0,00 s o tempo todo** (na v35.4 ela andava 0,03 s por tecla). `↑` **47**, `↓` **46**; `PageUp` **65** (passo de 19); `Home` **10**; `End` **200**. **Mouse e teclado reais, sem `.focus()`** | `A0_velocidade` |
| 3 | A frase do *Copiar para a linha do tempo* numa linha | **vi funcionar** | O título ***Copiar para a linha do tempo*** vem **dobrado** (▶) e, aberto, traz ***"Uma chave por quadro"*** em **uma linha** (21 px; eram duas na v35.4: *"Vira animação nova, uma chave por quadro"*). A dica do título guarda a frase inteira | `B0_previa_copiar` · `B1_copiar_aberto` |
| 4 | Dicas sem jargão nas Curvas, na camada, no evento e no *"Vendo"* | **pela metade** | **Curvas:** defeito 2 (Spine, Blender, *overshoot*). **Camada** (Prévia): defeito 3. **Evento:** defeito 4 (as dicas dos números **são claras**; faltam as de *Evento*, *Som*, *Texto*). ***"Vendo"***: a dica da linha explica, a palavra **ficou** | `D0_curvas_1920` · `E0_previa_textos` · `F0_chave_evento` |
| 5 | Propriedades, Prévia e Regras em 1920: o fixo cabe ou dobra | **pela metade** | Defeito 5: a **Prévia dobra** (camadas vazias fechadas; Copiar fechado); a **Propriedades** e a **Regras** **rolam sem dobrar nada**. O **fixo cabe** nas duas (*Ficha rápida* e *Compensar* à vista; *Parâmetros* e *Regras* à vista) | `G0_propriedades_osso_1920` · `G2_regras_1920_sem_detalhes` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O *PageUp* da barra de velocidade anda **19** de uma vez (46 → 65): é o passo grande; as setas, de 1 |
| C2 | A frase do Copiar **perdeu o *"Vira animação nova"***: ficou só *"Uma chave por quadro"* |
| C3 | Com a linha do tempo em *Detalhes* aberta, o grupo da direita é **mais baixo** (288 e 320 px, e não 472): **a Prévia, a Propriedades e a Regras** ficam **mais apertadas**. Medi **sem** os Detalhes |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A barra de velocidade | só com a `idle` aberta | **na base** (o tocador está apagado), outras animações |
| O 1280×720 | **mudei a janela** do Chrome por protocolo e **recarreguei** | o 1280 de um computador de verdade |
| *"Sem jargão"* | **li** os textos e **julguei** (jargão = *Spine*, *Blender*, *morphs*, *tags*, *cor de slot*) | o que um novato de verdade entende |
| A chave de evento | só **li** as dicas; **não** gravei uma chave | o que o jogo recebe |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
