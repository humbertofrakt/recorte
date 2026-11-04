# As imagens conferidas — lote 2, a grade do botão direito (v32.8) — 06/10/2026

Rodada 44, lote 2. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.8** (o "Sobre" diz v32.8; o zip `recorte v32.8 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 18h37 a 18h43, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-44-conferida/lote2/` (6) |
| Material | **(a)** o herói de exemplo (a espada é entidade; **não há machado nem roupa de inverno na pasta dele**); **(b)** um projeto novo numa **pasta em memória** com as 13 imagens de `exemplo/game/mao` **e uma subpasta `armas/`** com **4 imagens do machado de verdade** (`exemplo/game/armas`: `Camada 635 copiar`, `_0000s_0000_Camada-9`, `_0000s_0001_Camada-633-copiar`, `_0000s_0001_Camada-634-copiar`). **A roupa de inverno não tentei** (vive no `.bone`, não numa pasta de imagens). **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (2, 3, 4) | **1** (1) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | na **imagem do machado** a grade abre em *pasta* e mostra **só a subpasta `armas/`**; na **espada do herói** (que é entidade) abre em *pasta* mas **mostra todas as 21 imagens**, as da pasta e as de `armadura/`: **igual a *todas***. Não sei se o pedido era isso para a espada |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno, ou dúvida.* **Na espada (entidade) *pasta* e *todas* mostram a mesma lista** (21 nomes, `armadura/body` incluído). A espada não tem imagem de agora, então **não há subpasta a seguir**; o programa mostra tudo. Faz sentido, **mas a grade não diz isso** (nem na dica de *pasta*: *"Só as imagens da mesma subpasta da imagem de agora"*, que aqui **não vale**) | 1 | `B0_todas_espada` |
| 2 | *Pequeno, não afirmo.* **Num slot que ainda não trocou nada, a fonte *objeto* só deve mostrar a imagem de agora** (a lista de imagens *clicáveis* veio **vazia**). **Não fotografei** esse caso: não sei se a grade explica (*"este slot ainda não usou outra imagem"*) ou fica com uma miniatura só | 3 | — |
| 3 | *Pequeno.* **A grade da fonte *todas* vem sem separar as pastas**: as 16 imagens (12 da raiz e 4 de `armas/`) em **fila só**; o nome com a pasta (*"armas/…"*) só aparece **na dica**, ao passar o mouse. A imagem do machado e a da mão **se misturam** na grade | 2 | `C2_grade_todas` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Botão direito na espada → a grade abre em *"pasta"* (a subpasta da imagem atual) | **pela metade** | **Na espada (entidade):** a grade abre com ***pasta* aceso** (laranja). **Mostra as 21 imagens do herói** (`arm`, `arm_back`, `armadura/body`, `blade`, `body`, `cape_lower`… `thigh_back`), **as mesmas de *todas***. **Na imagem do machado** (`_0000_Camada-1` com a imagem `armas/_0000s_0001_Camada-634-copiar`): a grade abre em ***pasta* aceso** e mostra **só as 4 de `armas/`** (`_0000s_0000_Camada-9`, `_0000s_0001_Camada-633-copiar`, `Camada 635 copiar` e a atual, com contorno laranja): **as da mão, na raiz, ficam de fora**. Dica da fonte: ***"Só as imagens da mesma subpasta da imagem de agora"*** | `I0_menu_na_arma` · `B0_todas_espada` |
| 2 | Fonte *"todas"*: a grade mostra imagens de **outras pastas** (o machado de `armas/`, a roupa de inverno) | **vi funcionar** | Numa peça da raiz (a mão), *todas*: ***12 da raiz + 4 de `armas/`*** (mais a atual: 17, os da pasta inteira), com os nomes ***"armas/_0000s_0000_Camada-9"***, ***"armas/_0000s_0001_Camada-633-copiar"***, ***"armas/_0000s_0001_Camada-634-copiar"***, ***"armas/Camada 635 copiar"***: **o machado entra** (as imagens em forma de lâmina curva, ao fundo da grade). Dica: ***"Todas as imagens do acervo, de todas as subpastas, em ordem de nome"***. **A roupa de inverno não tentei** (não é imagem de pasta) | `C2_grade_todas` |
| 3 | Fonte *"objeto"*: **lembra** o que o slot já mostrou nesta sessão | **vi funcionar** | **Primeira vez, slot sem troca: nenhuma imagem clicável** (defeito 2). Troquei a mão por `armas/…633-copiar`, depois por `armas/…634-copiar`; abri *objeto*: **três miniaturas**, ***a mão original (`_0000_Camada-1`)***, ***`armas/…633-copiar`*** e ***`armas/…634-copiar`*** (esta, a atual, com contorno laranja e a dica ***"é a imagem de agora"***). **Lembra a original e as duas trocas**, na ordem em que apareceram. Dica: ***"Só as imagens que este slot já usou: nas skins, nas chaves de Desenho e nas trocas desta sessão"*** | `J0_objeto` |
| 4 | Trocar por uma imagem **de outra pasta** funciona na cena; `Ctrl+Z` volta | **vi funcionar** | Mão na cena; botão direito → *todas* → `armas/_0000s_0001_Camada-633-copiar`: ***"_0000_Camada-1/_0000_Camada-1 agora mostra "armas/_0000s_0001_Camada-633-copiar", na skin default (a de todos)."*** **A cena mudou**: **104.291 pixels diferentes** num recorte de 520×440 (a mão virou o **machado**, enorme: a imagem é grande). `Ctrl+Z`: ***"Desfeito: Trocar o desenho do slot."*** e **a mão voltou**: **4.212 pixels** de diferença para a foto de antes, **na moldura de seleção** (a peça voltou ao lugar na foto). A ficha mostra ***"imagem armas/_0000s_00… · no osso root"*** | `D_antes_troca_desfaz` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **rodapé da troca** diz *"na skin default (a de todos)"*: avisa **onde** a troca valeu. Útil: a dica *"Shift + clique troca em todas as skins"* está em cada miniatura |
| C2 | As imagens do machado são **grandes** (300 KB): o desenho **cobre a tela inteira** depois da troca. Não é defeito, mas **quem troca a mão por um machado** não vê a escala sozinho |
| C3 | O `Ctrl+Z` do *Trocar o desenho do slot* é **um passo só** (voltou numa vez) |
| C4 | A grade abre **ao lado do mouse** e cobre a cena (nas fotos, em cima da peça): para ver a troca é preciso fechar com `Esc` |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A pasta | **pasta em memória**, com as imagens **de verdade** (`mao` e `armas`, 4 de 12) | abrir uma pasta de verdade com o seletor do Windows |
| *Pasta*, só nos dois casos que montei | a espada do herói e uma peça de `armas/` | uma peça de outra subpasta (a `armadura/`) |
| *Objeto* e as **skins** e **chaves de Desenho** | só as **trocas da sessão** | que a grade lembra o que **veio do arquivo** (skins, chaves) |
| A roupa de inverno | **não tentei** | que *todas* mostra imagens da roupa de inverno |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
