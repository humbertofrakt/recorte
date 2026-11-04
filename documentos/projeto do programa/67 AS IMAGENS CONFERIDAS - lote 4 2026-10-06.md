# As imagens conferidas — lote 4, a aba Skins (v33.3) — 06/10/2026

Rodada 44, lote 4. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.3**. **Atenção:** o `programa/` da pasta **já era a v33.4** quando comecei (22h17). Tirei a **v33.3 do zip** `recorte v33.3 2026-10-06.zip`, servi à parte, e o "Sobre" disse **v33.3** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 22h17 a 22h23, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-44-conferida/lote4/` (14) |
| Material | o herói de exemplo (*Arquivo → Abrir o herói (exemplo)*: skins `default`, `armadura`, `armadura_capa`); um projeto novo numa **pasta em memória** com as 13 imagens de `exemplo/game/mao` **e uma subpasta `armas/`** com 4 imagens do machado de verdade. **Nada foi salvo.** Instrumentei `alert`/`confirm`/`prompt`: nenhuma foi chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (2, 3, 4, 5) | **1** (1) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | 7 ícones numa linha e *Clonar* **vi funcionar**; a **ajuda está numa linha só, mas cortada**: *"Skin é uma roupa. A base é a mesma, s…"* (a frase tem 511 px e a coluna 258), e **a dica dela vem vazia**: a frase inteira não está em lugar nenhum. As dicas dos botões **trazem a frase do menu, mas não igual palavra por palavra** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A ajuda cabe numa linha só porque é cortada, e o resto não se lê.** Num projeto com **só a skin `default`** (a única hora em que ela aparece), o texto *"Skin é uma roupa. A base é a mesma, só o desenho muda. Nova skin para criar outra."* fica em `nowrap` com reticências: a tela mostra ***"Skin é uma roupa. A base é a mesma, s…"***. Medi: `scrollWidth` 511 px, `clientWidth` 258 px, altura 31 px (uma linha). **A dica (`title`) do parágrafo e dos pais está vazia**, e passar o mouse não mostrou nada; o comentário do código promete *"a frase inteira mora na dica"*. **O que se perde é justo o fim:** *"Nova skin para criar outra"* | 1 | `C0_ajuda_projeto_novo` |
| 2 | *Pequeno.* **A janela do nome abre com o nome proposto (`skin`, `skin2`) com o cursor no fim, sem nada selecionado.** Digitei `inverno` e a skin saiu ***"skin2inverno"***; digitei `verao` e saiu ***"skin2verao"***. Verifiquei: `selectionStart` = `selectionEnd` = 5 e o campo está em foco. Quem digita sem apagar **acrescenta ao proposto** | 3 | `F0_pede_nome_botao` · `F1_criou_inverno` |
| 3 | *Pequeno, dúvida.* **`Esc` na janela do nome não cancela: cria a skin com o nome proposto.** A janela diz *"Deixar como está fica "skin""*, e `Esc` faz o mesmo que *Deixar como está*: rodapé ***"Skin "skin" criada, com o lápis nela. Agora arraste uma imagem…"***. Está escrito, mas quem aperta `Esc` para desistir **fica com uma skin a mais** (`Ctrl+Z` não conferi) | 3 | `F0_pede_nome_botao` |
| 4 | *Pequeno.* **O lápis tem dois "voltar".** Clicar o lápis de `default` na lista *Feitas* disse ***"Lápis na skin "default": o que se cria daqui em diante nasce nela."***; clicar de novo, ***"Lápis de volta na default: o que se cria nasce na base de todas."***. **Fala sempre** (como pedido), mas as duas frases descrevem o **mesmo** lugar com palavras diferentes, e eu **não sei se há dois estados** | 2 | `E0_lapis` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Aba *Skins*: barra de 7 ícones numa linha, cada um com dica igual à frase do menu; *"Duplicar"* virou *"Clonar"*; a ajuda cabe numa linha | **pela metade** | **7 botões na mesma altura (y = 438)**, 31 px cada, a barra inteira dentro da coluna, **também em 1280×720**. Dicas: ***Nova skin*** *"…uma skin nova, vazia, que passa a ser a do lápis. Pede o nome na hora"* · ***Clonar skin*** *"…uma cópia da skin do lápis, com os mesmos ossos"* · ***Fazer a skin de uma pasta…*** · ***Importar skin…*** · ***Exportar skin…*** · ***Promover skin a base…*** · ***Apagar skin*** *"…apaga a skin do lápis, depois de perguntar. Ctrl+Z devolve"*. **O menu *Skins*** tem ***Nova skin · Clonar skin · Fazer a skin de uma pasta… · Apagar skin · Editar esta skin… · Trocar imagem nas skins… · Ignorar esta imagem · Esconder esta imagem · Promover skin a base…***. **O nome *Clonar* vale nos dois lugares** (a dica do menu diz *"Era o Duplicar da aba"*). **"Igual" não é palavra por palavra:** a dica do menu de *Nova skin* termina em *"Era Esqueleto → Novo → Pele"* e a do botão em *"Pede o nome na hora"*; a de *Apagar* no menu é outra (*"Ponha o lápis na skin que vai sair primeiro…"*). **Importar e Exportar não estão no menu *Skins*** (a dica diz *"Também em Arquivo"*). **A ajuda:** defeito 1 | `A0_aba_skins` · `B0_menu_skins` · `C0_ajuda_projeto_novo` · `G1_skins_1280` |
| 2 | Em *Feitas*, a skin desligada tem um olho: um clique a liga (vai ao topo da pilha); o lápis fala sempre | **vi funcionar** | *Feitas*: `armadura` e `armadura_capa` têm o **olho** (dica ***"Ligar a skin "armadura": ela entra no topo da pilha e vence as outras"***); a `default`, ligada, não. **Cliquei o olho de `armadura`:** rodapé ***"Skin "armadura" ligada."***; em *Ativas* ela entrou **acima** de `default`; **a cena mudou** (2.538 px de 1.116.888, 0,23 %). **Cliquei o de `armadura_capa`:** ***"Skin "armadura_capa" ligada."***; a ordem em *Ativas*, de cima para baixo: **`armadura_capa`, `armadura`, `default`** (a última a ligar vai ao topo). **O lápis:** quatro cliques seguidos, **quatro mudanças do rodapé** (medi com um observador de mudanças: 1 a cada clique), inclusive ao clicar no que **já** era o lápis (volta para a `default`). Ver defeito 4 | `D0_feitas_olho` · `D1_ligou_armadura` · `D2_ligou_capa` · `E0_lapis` |
| 3 | *Nova skin* pede o nome na hora (pelo botão e pelo menu) | **vi funcionar** | **Botão** (+): janela ***"O nome da skin nova"***: *"Um nome que diga a roupa: inverno, armadura, ferido. Deixar como está fica "skin"."*, campo *Nome* com `skin`, botões ***Dar o nome*** e ***Deixar como está***. **Menu *Skins → Nova skin*:** a **mesma janela**, com o nome proposto `skin2`. Digitei e `Enter`: ***"Skin "skin2" agora é "skin2inverno"."*** e ***"…"skin2verao"."***. **Nenhuma caixa do navegador.** Defeitos 2 e 3 | `F0_pede_nome_botao` · `F1_criou_inverno` · `F2_pede_nome_menu` |
| 4 | Em 1280×720 com a aba *Skins* na frente, a lista mostra pelo menos 3 linhas; em 1920 não rola | **vi funcionar** | **1280×720:** corpo da aba com 218 px; ***Feitas* mostra `default`, `armadura` e `armadura_capa` inteiras** (3 linhas), com os 7 ícones em cima; a 4ª linha (a de *Ativas*) fica **abaixo**, e **rolando com a roda o painel mostrou as outras** (a lista rolou: a 1ª linha saiu pelo topo e a 4ª entrou inteira). **1920×1080:** as 4 linhas **inteiras**, nenhuma lista com rolagem (`scrollHeight` = `clientHeight` nas três) | `A0_aba_skins` · `G1_skins_1280` · `G2_skins_1280_rolada` |
| 5 | Grade do botão direito numa **entidade** (a espada): abre em *"todas"*; o botão *"pasta"* diz *"Sem pasta de agora…"*; em *"todas"* as imagens vêm por pasta, com cabeçalho (raiz, `armadura/`, `armas/`…) | **vi funcionar** | Botão direito na espada (*"Entidade: espada (em weapon)"*): a grade ***"Este boneco"*** abre com ***todas* aceso** (laranja; *pasta* e *objeto* brancos). **A dica de *pasta*:** ***"Sem pasta de agora: o desenho é uma entidade, e não tem imagem. Mostrando todas"***. **Cabeçalhos:** ***raiz*** (as imagens do herói e as da pasta, em fila), ***armadura/*** (1) e ***armas/*** (as 4 do machado e uma lâmina com o contorno laranja). Com a pasta que só tinha `armadura/`, os cabeçalhos eram ***raiz*** e ***armadura/***. Uma miniatura de lâmina fica **com o contorno laranja**: na 1ª pasta dentro de `armadura/`, na 2ª dentro de `armas/`. **Não sei por que** a espada, que a dica diz não ter imagem, tem uma marcada (e por que ela mudou de grupo quando a pasta mudou) | `H0_botao_direito_espada` · `I0_grade_espada_armas` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **rodapé do olho** (*"Skin "armadura" ligada."*) **não diz que ela foi ao topo da pilha**; quem quer saber olha *Ativas*. A dica do botão diz (*"entra no topo da pilha e vence as outras"*) |
| C2 | *Arquivo → Abrir pasta do projeto…* com um personagem aberto **trocou o herói por um projeto vazio sem perguntar** (aconteceu na prova do item 5, já era o defeito 1 do doc `64`). Segue assim na v33.3 |
| C3 | A pasta **ficou lembrada** quando recarreguei a página (*"Pasta mao · 13 imagens"* com o herói aberto): é do **meu ambiente de prova** (pasta em memória guardada no navegador), **não** afirmo que o programa faça isso com pastas de verdade |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A versão | **v33.3 tirada do zip**; o `programa/` já era a **v33.4** | a v33.4 |
| A pasta | **em memória**, com as imagens **de verdade** (`mao` e 4 de `armas`) | abrir uma pasta de verdade com o seletor do Windows |
| A subpasta `armas/` | **montei** na pasta falsa; ela não existia no herói | que a grade faz o mesmo com a pasta de armas de verdade |
| *Desfazer* a criação de skin | **não** conferi | que `Ctrl+Z` tira a skin criada com `Esc` |
| Olho e lápis | só o herói de exemplo (três skins) | muitas skins, nomes longos |
| A ajuda | medi **só** num projeto com a `default` sozinha (a única vez em que ela aparece) | a frase em colunas mais largas |
| A rolagem em 1280×720 | rolei com a roda do mouse | rolar com a barra |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
