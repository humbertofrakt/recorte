# A Ordem e as barras conferidas — lote 5b (v35.3) — 07/10/2026

Rodada 47, lote 5b. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.3** (o "Sobre" diz v35.3; servi o zip `recorte v35.3 2026-10-07.zip`, extraído fora da pasta; o zip é das 06h04, e **o aplicativo dormiu das 06h00 às 08h00**: conferi às 08h00) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 08h00 a 08h06, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-47-conferida/lote5b/` (12) |
| Material | o herói de exemplo; para o item 2, o `heroi.bone` **solto** aberto com a pasta vazia `p_vazia` (no armazenamento privado do Chrome); a *Força* de `head_lean` e a *velocidade* do tocador tiveram valores mexidos (**nada foi salvo**). Os arrastos da Ordem **desfiz com Ctrl+Z e conferi**. **Não rodei `medir`, roteiro nem pesos** |
| Nota de numeração | a lista veio resumida na mensagem de 08h00; **as linhas são as dela, na ordem** |
| **Ajuste do Diretor (08h09)** | **os itens 1, 2, 3 e 4 NÃO entraram na v35.3: vão na v35.4 (doc 90).** Eu já os tinha olhado; **deixo o que vi como LINHA DE BASE** (estado *"fora desta versão"*), **não como nota da v35.3**. **Valem para a v35.3 só as linhas 5 e 6** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total da v35.3 |
|:---:|:---:|:---:|:---:|
| 0 | **2** (5, 6) | 0 | 2 |

*(As linhas 1 a 4 estão **fora desta versão**: abaixo ficam como linha de base para o doc 90. Antes do ajuste eu as tinha contado: 2 funcionam, 2 não funcionam.)*

| Linha | Por que pela metade |
|:---:|:---|
| 5 | **Regras** e **Alfa**: o clique leva o foco à barra e **3 teclas = 3 casas**. **Velocidade do tocador**: o clique leva o foco, **mas as setas movem a agulha do tempo, não a velocidade** (3 setas = 0 casas) |
| 6 | as **4 barras** têm nome, e **abas, linhas de animação, linhas do gráfico, selects e caixas** têm dica; **mas** o *Copiar para a linha do tempo* ficou em **duas linhas**, não uma |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *(linha de base, fora da v35.3)* **Arrastar uma peça para a frente de outra PARTE a pasta, sem avisar.** Na Ordem, arrastei `forearm` (fora de pasta) para o **terço de cima** de `shin_front` (dentro da pasta ***perna***): a lista ficou ***perna: foot_front*** · `forearm` · ***perna: shin_front, leg_front*** — **duas pastas *perna***. O rodapé disse só ***"forearm: 6ª de 19, entre foot_front e shin_front. Arquivo não salvo."***: **nenhum aviso, antes ou depois**, de que a pasta ficou partida. Larguei também no **meio** de `shin_front`: o mesmo (*"forearm: 7ª de 19, entre shin_front e leg_front"*, duas pastas). Primeira tentativa, `leg_front` para o terço de cima de `shin_front`, **dentro da mesma pasta**: **não** partiu (ficou *foot_front, leg_front, shin_front*). **Ctrl+Z** devolveu a lista (conferi) | 1 | `B1_forearm_antes_de_shin_front` · `B2_forearm_no_meio_de_shin_front` |
| 2 | *(linha de base, fora da v35.3)* **A Ordem em 1280×720 não mostra linha nenhuma inteira.** O corpo da aba tem **87 px**: a barra de seis ícones (47 px) e o rótulo ***FRENTE***; a **lista** fica com **40 px**, e a primeira linha (`hand`, 45 px de altura) aparece **cortada ao meio**. Pedia-se **3 linhas**: vi **0 inteiras**, e meia | 4 | `E0_ordem_720` |
| 3 | **A seta do teclado não ajusta a velocidade do tocador.** Com a `idle` aberta, **clico** na barra (foi de 100 a **46**, o foco **fica nela**), e **`→`** ×3: a barra **continua em 46** e **a agulha anda** (0,10 s → 0,13 s); `↑` foi à chave anterior (0,00 s); `End` e `Home` foram ao fim e ao começo; **só `PageUp`** mexeu na barra (46 → **65**: um passo grande). Quer dizer: **3 teclas ≠ 3 casas** na barra de velocidade (nas de *Regras* e *Alfa*, sim) | 5 | — |
| 4 | **Na base, a barra de velocidade nem recebe o clique** (o valor não muda e o foco vai para um `DIV` do painel da linha do tempo). *(Na base o tocador inteiro está apagado: pode ser o desenho.)* | 5 | — |
| 5 | *Pequeno.* **O *Copiar para a linha do tempo* da Prévia: o parágrafo de três linhas virou DUAS** (*"Vira animação nova, uma chave por quadro"*, 42 px em 234 px). Pedia-se **uma** linha. A dica traz a frase inteira (*"Grava a mistura como uma animação nova, com uma chave por quadro"*) | 6 | `H0_previa` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Na Ordem, arrastar uma peça para a frente de outra NÃO parte a pasta (ou avisa antes) | **fora desta versão** (base: não funciona) | Defeito 1: **parte, e não avisa** | `B1_forearm_antes_de_shin_front` · `B2_forearm_no_meio_de_shin_front` |
| 2 | A barra diz *"N avisos"* igual ao número da janela | **fora desta versão** (base: funciona) | `heroi.bone` solto numa pasta sem o atlas: a barra diz ***"42 avisos — ver"***; *Ajuda → Problemas do arquivo…* abre a janela com ***"Ver as 42 linhas, uma por imagem"*** (**42** itens dentro) e ***"42 problemas, 21 com conserto aqui. O resto é na mão."***. **42 = 42 = 42.** Com o herói de exemplo sem problema, a barra diz ***"Nenhum aviso"***. *(Cliquei na barra: **não abriu** a janela; abri pela *Ajuda*.)* | `C0_rodape_avisos` · `C1_janela_de_avisos` |
| 3 | *"skins ▾"* existe no cartão ou saiu de vez (diga o que vê) | **fora desta versão** (base: funciona) | **Saiu de vez.** O cartão da `espada` na *Montagem* mostra ***espada · PROJETO*** e ***anima: idle ▾*** (o seletor da animação); **nenhum *"skins ▾"***. Procurei a palavra *skins* em **todo** o programa aberto (com a aba *Entidades* à frente): só o menu ***Skins*** e a aba ***Skins***. A *Montagem* agora mostra **inteira** (*heroi · AQUI*, *weapon*, o cartão da `espada`, *+ 22 outras imagens*) | `D0_entidades_cartao` |
| 4 | Em 720, a Ordem mostra 3 linhas | **fora desta versão** (base: não funciona) | Defeito 2: **0 linhas inteiras** | `E0_ordem_720` |
| 5 | O clique na barrinha (Regras, Alfa) e na barra de velocidade leva o foco para ela: 3 teclas = 3 casas, sem `.focus()` por programa | **pela metade** | **Regras:** cliquei o polegar da *Força* de `head_lean`: **`activeElement` é a barra** (já com o botão apertado, `data-foco = forca-head_lean`); `←` ×3: **100 → 99 → 98 → 97**; `→` ×3 volta a 100. **Alfa** (*Cor do osso, opacidade*, ficha do `head`): **o mesmo**, **100 → 99 → 98 → 97** e de volta. **Velocidade do tocador:** defeitos 3 e 4. **Tudo por clique de mouse real, sem `.focus()`** | `F0_barra_regras_clique` · `F1_alfa_clique` · `G1_velocidade_idle` |
| 6 | As 4 barras da Prévia têm nome; abas, linhas de animação, linhas do gráfico das Curvas, selects e caixas da Prévia têm dica; *"Copiar para a linha do tempo"* numa linha | **pela metade** | **As quatro barras:** `title` e `aria-label` ***"Quanto aparece, em %, de 0 a 100: 0 esta camada some, 100…"*** (e agora **com `%` depois da caixa**, que era o defeito 3 do doc `85`). **Abas:** todas com dica (***"Árvore: clique traz à frente; dois cliques recolhe…"***, ***"Mais 5 abas: Entidades, Pivôs, Malha e pesos, Part…"***). **Linhas de animação:** ***"walk: 1,00 s, repete. Clique abre a animação na linha do tempo"***, ***"idle — padrão. A primeira da lista é a que o jogo abre"***, as da entidade ***"espada: idle. Clique para animar espada por dentro…"***. **Linhas do gráfico das Curvas:** ***"head — Rotação: clique mostra ou esconde esta linha no gráfico"*** (as três). **Selects** (*Animação*, *Velocidade*, *Ícone*, *Eixos*) e **caixas** (*Repetir*, *Todos os ossos*, as da ficha do osso): **todas com dica**. **Varredura geral:** em 163 controles à vista, 150 têm dica, **13 sem** (os botões de nome escrito do menu de cima: *Arquivo*, *Editar*…). *Copiar para a linha do tempo:* defeito 5 | `H0_previa` · `I0_curvas_linhas` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **A Prévia melhorou muito** desde o doc `86`: as quatro barras agora dizem *"em %, de 0 a 100"* e mostram **100%** ao lado. É o que o doc `85` pedia |
| C2 | **A Montagem das Entidades** deixou de ser a caixa de 60 px: mostra **a cena inteira montada** de uma vez |
| C3 | A frase da barra de avisos (**"42 avisos — ver"**) **parece botão** (amarela, de moldura) **e não abre nada ao clique**; a janela vem pelo menu *Ajuda* |
| C4 | O arrasto que **fica dentro da mesma pasta** (`leg_front` entre `foot_front` e `shin_front`) **funciona e diz onde ficou** (*"7ª de 19, entre foot_front e shin_front"*): o defeito 1 é só **sair** da pasta ou **entrar** na dos outros |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Os arrastos da Ordem | arrasto de peça do navegador por protocolo (`dragEnter`/`dragOver`/`drop` entregues à mão, no ponto onde soltei) | a sensação do arrasto na mão; a linha laranja que mostra o alvo (**não** fotografei) |
| O `heroi.bone` com 42 avisos | aberto **solto** numa pasta vazia do armazenamento privado do Chrome | um arquivo de verdade com avisos de outra espécie |
| O clique na barra de avisos | **não** abriu a janela; **não** sei se era para abrir | — |
| A barra de velocidade na base | não dá para saber se estava desligada | — |
| 1280×720 | só a Ordem e o rodapé | as outras abas |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
