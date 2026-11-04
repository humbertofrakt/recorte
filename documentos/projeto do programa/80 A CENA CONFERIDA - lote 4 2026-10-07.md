# A cena conferida — lote 4, escolher, criar e ver (v34.5) — 07/10/2026

Rodada 46, lote 4. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.5** (o "Sobre" diz v34.5; servi o zip `recorte v34.5 2026-10-07.zip`, extraído fora da pasta; o zip apareceu às 03h11) |
| Como | porta própria (5360) · Chrome sem janela · mouse, teclado e `Alt` por protocolo · 1920×1080 (e 1280×720 no item 7) |
| Hora | 03h12 a 03h20, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-46-conferida/lote4/` (18) |
| Material | o herói de exemplo, na base. Para escolher **desenhos** na cena liguei o botão *Travar ossos* (com os ossos à mostra o clique pega o osso primeiro). Cada gesto de criar foi **desfeito** com `Ctrl+Z`. **Nada foi salvo.** Nenhuma caixa nativa foi chamada. **O cursor eu li no estilo da tela** (o Chrome sem janela não o desenha nas fotos) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 5, 6) | **1** (3) | **1** (4) | 6 (+ a nota do item 7) |

| Linha | Por que não está inteira |
|:---:|:---|
| 3 | o rodapé **diz onde** o osso nasceu e o nome; mas **não vi nascer "no osso escolhido à mão"** com desenhos escolhidos (nasceu na raiz), e o osso **não** ganhou o nome do **1º escolhido** |
| 4 | **com um desenho escolhido e sem osso, nem o *Ponto* nem a *Caixa* ensinam a escolher o osso antes**: os dois **nascem** no slot do desenho, com a frase *"entrou no slot hair…"* |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A frase da linha 3 não se confirma como está no pedido.** Com os **dois desenhos** `hair` e `cape_lower` escolhidos, `B` e um arrasto: ***"Osso novo pegou 2 desenhos, sem mover. O osso "cape_lower" nasceu solto, na raiz."*** **Nasceu na raiz** mesmo com um **osso escolhido à mão junto** (`desenho hair, osso arm, desenho cape_lower` pela Árvore). **O nome:** escolhi `hair` e depois `cape_lower` (rodapé *"2 escolhidos: hair, cape_lower"*) e o osso se chamou ***cape_lower***; escolhi na ordem **inversa** (*"2 escolhidos: cape_lower, hair"*) e **também *cape_lower***; com `weapon` e `sword_blade` (do mesmo osso) saiu ***sword_blade***. **Pelo que vi, o nome é o do desenho mais ao fundo** (`cape_lower` está atrás de `hair`; `sword_blade`, atrás de `weapon`: **é uma dedução** a partir dos três casos), **e não o 1º escolhido**. **Só um osso escolhido (sem desenhos)** funciona como se espera: ***"O osso "osso" nasceu filho de arm."*** | 3 | `D0_osso_com_dois_desenhos` · `D1_osso_ordem_inversa` · `E0_osso_no_osso_escolhido` |
| 2 | **Ponto e Caixa não ensinam nada sobre o osso.** Com `hair` (um **desenho**) escolhido e **nenhum osso**: ao pegar a ferramenta o rodapé diz ***"Ponto: segure Alt e arraste para criar. Sem Alt, arraste um ponto para mover; com Shift, gira."***; **sem `Alt`** o arrasto dá ***"Segure Alt e arraste para criar um ponto."***; **com `Alt`** o ponto **nasce**: ***"Ponto hair_ponto entrou no slot hair: escolha-o no campo Anexo das Propriedades, ou grave uma chave, para usá-lo."*** e a Caixa, o mesmo (***"Caixa hair_caixa entrou no slot hair…"***). Não achei frase que mande **escolher o osso antes**; **pode ser que ela exista em outro caminho** (escolher *nada*) que **não** tentei | 4 | `F_Ponto_sem_osso` · `F_Caixa_sem_osso` · `G_Ponto_sem_alt` |
| 3 | *Pequeno.* **O rodapé *"2 escolhidos…"* só fala com desenhos.** Com **um osso e um desenho** (`osso hair` e `desenho cape_lower`, pela cena) a soma **acontece** mas o rodapé **fica em *"Arquivo salvo."*** e a ficha mostra ***"Osso: hair"***, não *"Vários itens"* | 1 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | `Ctrl+clique` na cena **SOMA** à escolha (*"2 escolhidos: cape_lower, hair"*); `Shift` faz faixa na Árvore como antes | **vi funcionar** | Com *Travar ossos* ligado: clique em `hair`, `Ctrl+clique` em `cape_lower`: a árvore mostra os **dois** escolhidos e o rodapé ***"2 escolhidos: hair, cape_lower. Arquivo salvo."***; a ficha: ***"Vários itens — Vários itens selecionados. Escolha um só para ver os campos."*** O rodapé da ferramenta *Selecionar* ganhou ***"Shift ou Ctrl+clique soma"***. **`Shift` na Árvore:** `torso` e `Shift+clique` em `cape_path` ⇒ **faixa de 5** (`torso, mask, body, hitbox, cape_path`) **como antes**. Defeito 3 | `B2_ctrl_clique_em_desenhos` · `B1_shift_faixa_na_arvore` |
| 2 | **Espaço** segurado com o foco na Árvore move a vista e não desmarca nada | **vi funcionar** | `torso` escolhido na Árvore (o foco do teclado na linha, `BUTTON.arvore-item`), **`Espaço` apertado** e arrasto na cena: o cursor passou de `crosshair` para **`grab`** e a cena ganhou **`is-panning`**; **a cena andou: 48.530 pixels** (4,35 %) e o zoom ficou em 100 %; **a escolha seguiu *"osso torso"***. Soltei o `Espaço` e nada mudou na Árvore | `C0_espaco_na_arvore` |
| 3 | `B` com dois desenhos escolhidos: o osso nasce no osso escolhido à mão, ou na raiz, e o rodapé diz onde; ganha o nome do 1º desenho | **pela metade** | **O rodapé diz onde:** ***"Osso novo pegou 2 desenhos, sem mover. O osso "cape_lower" nasceu solto, na raiz."*** e **diz o nome**. **O osso** ficou na raiz da Árvore (recuo da raiz) e **pegou os 2 desenhos**. Defeito 1 (o "osso escolhido à mão" e o nome) | `D0_osso_com_dois_desenhos` · `D1_osso_ordem_inversa` |
| 4 | *Ponto* e *Caixa* com um desenho escolhido e sem osso: o rodapé ensina a escolher o osso antes | **não funciona** | Defeito 2 | `F_Ponto_sem_osso` · `F_Caixa_sem_osso` · `G_Ponto_sem_alt` |
| 5 | Régua da cena *"X 122 · Y 189 px"*; zoom pelo teclado diz *"Zoom: 278%"* | **vi funcionar** | **A régua de cima** ganhou uma **etiqueta laranja** na posição do mouse: ***"X 340 · Y 192 px"*** (mouse a 1200, 420 da tela), com **os dois eixos** (li **uma** posição na foto). **O zoom:** `Ctrl+=` ⇒ ***"Zoom: 115%"***, ***"Zoom: 132%"***, ***"Zoom: 152%"*** (e 175 %); `Ctrl+−` ⇒ ***"Zoom: 132%"***; `Ctrl+0` ⇒ ***"Zoom: 100%"***; o campo do zoom **acompanhou** cada passo. O menu *Exibir* tem *Aproximar (Ctrl+=)*, *Afastar (Ctrl+−)*, *Tamanho real (100%) Ctrl+0*, *Ajustar à tela*, *Enquadrar seleção* | `H2_regua_topo` · `I0_zoom_pelo_teclado` |
| 6 | A dica do *Inclinar* diz *"Arraste…"*; a frase do `Alt` diz *"este lado anda"* nos lados; o rodapé do *Criar osso* cabe em 1920 sem corte; *"perto do pivô"* só aparece quando o eixo fica parado | **vi funcionar** | **Dica:** ***"Inclinar (Z). Arraste o osso escolhido: o topo anda, a base fica"***. **O `Alt` parado:** nos lados que inclinam em **Y** ***"…Puxe ao longo do lado: este lado anda, o do outro lado fica."*** (`torso` em cima; `hips` no meio da direita); nos que inclinam em **X**, ***"…o topo anda, a base fica."*** (`torso` à esquerda e à direita; `hips` em cima e embaixo): **a frase segue o eixo da caixa**. **O rodapé do *Criar osso*:** ***"Com desenhos escolhidos, o osso novo pega os desenhos. Ctrl: sem pegar. Alt num osso: redesenha."*** — **881 px de texto numa faixa de 881 px, sem corte**. ***"Perto do pivô"*:** `hips`, *Escalar*, botão **na linha do pivô**: ***"Escalar X × 1,4 · Y × 1 · perto do pivô um eixo fica parado: comece mais longe."***; **o quadradinho do lado do `torso`** (***"Escalar Y × 1,63"***) e `hips` **longe da linha** (***"Escalar X × 1,4 · Y × 2,2"***) **sem a frase** | `J0_criar_osso_1920` · `K0_perto_do_pivo` |
| 7 | Em 1280×720: anote o que ainda corta no rodapé *(é da 47; não conta)* | **anotado** | **Em 1280×720 a zona do rodapé da ferramenta corta em 11 das 12 ferramentas** (largura do texto / da faixa, em px): *Transformar* 887/591 · *Selecionar* 917/600 · *Mover* 473/425 · *Girar* 386/374 · *Escalar* 565/471 · *Inclinar* 516/447 · *Posar* 658/511 · *Criar osso* 709/531 · *Ponto* 647/507 · *Malha* 744/544 · *Pesos* 567/472. **Só a *Caixa*** cabe (349/349) | `L0_barra_1280` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **O `Espaço` segurado faz o mesmo que o botão do meio** (a mão, o `is-panning`): a vista anda com o foco em qualquer painel, sem tirar a escolha. É o que o Spriter e o Photoshop fazem |
| C2 | **A etiqueta da régua** fica na régua de cima e **acompanha o mouse**: dá para ler a posição do desenho sem abrir a ficha |
| C3 | O rodapé do *Criar osso* é **mais curto** que o da v34.1 (160 → 96 letras) e **cabe** onde antes cortava; ele **perdeu** a frase *"Com desenhos escolhidos, o osso novo pega os desenhos, sem movê-los"* e a do *Alt* mais longa, que **continuam na dica** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O cursor | **li o `cursor` da tela** (`grab`, `row-resize`, `col-resize`) | a forma desenhada |
| *Travar ossos* | liguei para poder **escolher desenhos** pela cena | a escolha com os ossos à mostra e sem trava (aí o clique pega o osso: o que o usuário novo faria sem a trava) |
| *Ponto*/*Caixa* sem osso | **um** caminho (um desenho escolhido, nenhum osso) | escolher **nada**, ou uma entidade |
| *B* com um osso à mão | **uma** vez (`arm` pela Árvore, com desenhos) e **uma** vez só o osso | o osso escolhido primeiro e os desenhos **depois**, na cena |
| A etiqueta da régua | **li uma posição** do mouse na foto | a conta (X, Y) em outros zooms e com a cena andada |
| O `Alt` com a cena girada | `torso` (90°) e `hips` (0°) | ossos com pai girado e escala negativa |
| Telas | 1920×1080; 1280×720 só no rodapé | 1440×900 |
