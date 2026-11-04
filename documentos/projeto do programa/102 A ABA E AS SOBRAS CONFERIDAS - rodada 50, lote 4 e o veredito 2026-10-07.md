# A aba e as sobras conferidas — rodada 50, lote 4 (v36.5) e o veredito — 07/10/2026

Rodada 50, lote 4 (o doc `98`, itens E e D; as sobras dos docs `100` e `101`). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v36.5** (servi o zip `recorte v36.5 2026-10-07.zip`, extraído fora da pasta; o zip é das 14h27). O "Sobre" diz ***"Versão v36.5"*** e o `LEIA-ME.txt`, ***"Versao v36.5"*** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado **por protocolo** (não o mouse do aplicativo) · 1920×1080 |
| Hora | 14h27 a 14h33, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-50-conferida/lote4/` (12) |
| Material | o herói e a `idle`; as abas, o painel solto, o grupo recolhido; **os colar e o arrasto da Árvore, desfeitos com Ctrl+Z**. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **8** (1, 2, 3, 4, 5, 6, 7, 8) | 0 | 0 | 8 |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 1 | O × da aba fica afastado do nome | **vi funcionar** |
| 2 | A marca da aba ativa não parece sublinhado | **vi funcionar** |
| 3 | O rodapé concorda (*"Painel Árvore fechado"*, *"Painel Ordem solto"*) | **vi funcionar** |
| 4 | Exportar skin e Importar skin: a porta no Skins são os ícones da **aba** (o menu **não**, de propósito) | **vi funcionar** (os dois ícones existem e funcionam) |
| 5 | *"Colar só o que cabe"* diz quantas ficaram de fora | **vi funcionar** |
| 6 | Depois de *"virar filho"* numa animação, a Árvore do quadro mostra o pai do quadro | **vi funcionar** |
| 7 | Reabrir o fechado diz o remédio | **vi funcionar** |
| 8 | A caixa *"Só este quadro"* não pula de lugar | **vi funcionar** |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | O × da aba afastado do nome (ou à direita da tira), e não onde o olho procura o ▾ | **vi funcionar** | A aba ativa (*Árvore*): o **nome** vai de x 14 a 59 e o **×** é uma **caixinha** de 16×16 px com **moldura**, em **x 71**: **12 px de vão**; é um elemento próprio (dica ***"Fechar: Árvore"***). O **▾** de recolher **continua no fim da tira** (x 227), **longe**. *(A moldura faz o × **parecer botão**, o que **separa** do nome.)* | `A0_abas` · `A1_abas_zoom` |
| 2 | A marca da aba ativa não parece sublinhado | **vi funcionar** | A marca azul agora é um **arco no TOPO** da aba (sombra por dentro de 3 px **em cima**, `inset 0 3px 0`), **não** embaixo: a aba **parece pastinha** (como o Photoshop e o VS Code); **nenhum** traço sob o nome | `A1_abas_zoom` |
| 3 | O rodapé concorda | **vi funcionar** | **×** na *Árvore*: ***"Painel Árvore fechado."*** *Janela → Árvore*: ***"Painel Árvore de volta"***. A *Ordem* solta da parede: ***"Painel Ordem solto. Arraste a barra dele até uma tira de abas para colar de volta"***; colada: ***"Painel Ordem colado de volta"***. O ▾ de uma tira: ***"Grupo recolhido (Árvore, Ordem). O espaço foi para o outro painel"***, e devolvido: ***"Grupo de volta (Árvore, Ordem)"***. **Concordam** (*"Painel … fechado / solto / colado"*) | `B0_painel_fechado` |
| 4 | Exportar skin e Importar skin: a porta no Skins são os **ícones da aba Skins** (o **menu** *Skins* **não** os repete, **de propósito**: a barra de menus não repete ação e a decisão do Humberto pôs as duas no *Arquivo*) | **vi funcionar** | **Menu *Skins*:** *Nova skin*, *Clonar skin*, *Fazer a skin de uma pasta…*, *Apagar skin*, *Editar esta skin…*, *Trocar imagem nas skins…*, *Ignorar esta imagem*, *Esconder esta imagem*, *Promover skin a base…*: **sem** Importar nem Exportar (**como decidido**). **Aba *Skins*:** **existem** os ícones ***"Importar skin…: traz uma skin de um arquivo .bone para esta base. Também em Arquivo"*** e ***"Exportar skin…: grava a skin do lápis num arquivo .bone só dela. Também em Arquivo"*** (a dica **diz** *Também em Arquivo*). **Exportar skin, funcionando:** sem o lápis em nenhuma skin, o rodapé diz ***"Escolha a skin a exportar: acenda o lápis nela, na aba Skins."***; com o lápis na ***armadura***, o programa **chamou o *"salvar como"*** com o nome ***armadura.bone*** (cancelei: ***"Exportar a skin: a janela foi fechada sem escolher onde. Nada foi gravado."***); **escolhendo um destino** (um arquivo do armazenamento privado do Chrome), o rodapé: ***"Skin "armadura" gravada com só os desenhos; ela exige de quem a usar 3 ossos e 3 slots com estes mesmos nomes."*** e **o arquivo** tem **1.525 bytes**, com a skin ***armadura***. **Importar skin, funcionando:** o mesmo arquivo, com a skin **ainda na base**: ***"skin_exportada.bone: a skin "armadura" já existe nesta base."*** (**recusa certa**); **apaguei a skin** (a janela *"Apagar a skin "armadura"?"* diz o que perde) e **importei de novo**: ***"skin_exportada.bone: a skin "armadura" entrou nesta base, e está vestida, no topo de Ativas."*** e a lista de skins **voltou a ter *armadura*** (**duas linhas**: o lápis e o liga/desliga). **Ctrl+Z** desfez tudo (*"Desfeito: Apagar skin"*) | `C0_menu_skins` · `H0_aba_skins` · `H2_exportar_skin_com_lapis` · `H3_importar_skin` · `H4_depois_de_importar` |
| 5 | *"Colar só o que cabe"* diz quantas ficaram de fora | **vi funcionar** | 2 chaves de *Rotação* do `head` (0,00 e 0,70 s), Ctrl+C, agulha em 1,80 s, Ctrl+V: abriu a janela *"O colar passa do fim da animação"*; ***Colar só o que cabe***: ***"1 chave colada: head em 1,80 s. 1 ficou de fora: passava do fim."*** Ctrl+Z | `D0_so_o_que_cabe` |
| 6 | Depois de *"virar filho"* numa animação, a Árvore do quadro mostra o pai do quadro | **vi funcionar** | Na `idle`, arrastei o desenho ***body*** para o osso ***head*** na Árvore. Rodapé: ***"body virou filho de head (chave de pai em 0,00 s)."*** **A Árvore refeita mostra `body` sob `head`** (*…cape_path · ▼head · **body** · headface…*), **e não mais sob `torso`**. **Ctrl+Z**: ***"Desfeito: Virar filho de head."*** e **`body` voltou para `torso`** | `E1_arvore_depois` |
| 7 | Reabrir o fechado diz o remédio | **vi funcionar** | Mudei a base, *Abrir o herói* → *Descartar*, *Reabrir o fechado* → *Reabrir*: o rodapé diz ***"Reaberto o de hoje às 14:31. As imagens não vêm no guardado: para trazê-las, Arquivo → Abrir pasta do projeto…"*** **Inteiro** (803 px de 803, sem corte; o *"…"* final é o do nome do menu) | `G0_reabrir_remedio` |
| 8 | A caixa *"Só este quadro"* não pula de lugar ao trocar o formato | **vi funcionar** | A janela do exportar agora **mora no topo** (borda de cima em y 12): a caixa fica em **y 160** com o **GIF**, com o **PNG**, com o GIF **de novo** e com o PNG (**4 trocas**); **a altura da janela muda** (554 e 508 px), o **topo não** | `F0_exportar_posicoes` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O × fica **na mesma tira**, entre o nome e as outras abas, só **mais separado** e **emoldurado**: **uma mão apressada** ainda pode achá-lo **perto** (12 px). O **▾** de recolher está **do outro lado** da tira, **a 150 px** |
| C2 | O rodapé do *"virar filho"* **na agulha em 1,80 s** trazia a ressalva *"o desenho entortou um pouco: os dois ossos têm escalas diferentes"*; **em 0,00 s** (esta vez) **não traz**: **só aparece quando a conta pede** |
| C3 | A frase do rodapé *"Painel Árvore fechado."* **não repete** *"Janela → Árvore traz de volta"* (o CHANGELOG cita as duas): **só vi a primeira** (a segunda **pode ter sido cortada** ou **não existe**; **não achei**) |

## O veredito: a rodada 50 está FEITA?

**Sim, no que o protocolo alcança.** Os **quatro lotes** (docs `99`, `100`, `101` e este) estão **vistos funcionando**: **3**, **3**, **3** e **8** itens, **nenhum** pela metade, **nenhum** que não funcione. O item 4 desta versão (**Exportar e Importar skin no Skins**) **não é no menu, de propósito** (*a barra de menus não repete ação; a decisão do Humberto pôs as duas no Arquivo*): a porta no Skins são os **ícones da aba Skins**, que **existem e funcionam** (exportei a skin *armadura* e a importei de volta). **O que só a mão dele confere:** a **sensação** dos arrastos (abas, barra do painel solto, a Árvore, o colar) **com o mouse do aplicativo**, porque **eu os fiz por protocolo**; e **um olhar** sobre o **×**: se o vão entre o nome e a caixa **basta** para quem **fechou o painel sem querer**.

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Todos os cliques e arrastos | **por protocolo**, não o mouse do aplicativo | a sensação da mão |
| *"O × afastado"* | **medi** (**12 px** entre a caixa do nome e a do ×; o `CHANGELOG` diz **6 px**: provavelmente **conta outra coisa**, a margem do ×) e **olhei** a foto ampliada | se **basta** para o Humberto |
| *"A caixa parada em 147 px"* | **medi** o centro da caixa: **y = 160** nas quatro trocas (a borda de cima da janela em y 12): **parada**; **não** é o mesmo número do Diretor (outra referência) | — |
| Importar e Exportar skin | o *"salvar como"* e o *"abrir"* **trocados por arquivos do armazenamento privado do Chrome** (por programa) | os seletores do Windows |
| *"A Árvore do quadro"* | **só** o `body` → `head` | outras peças, ou desenhos com osso próprio |
| O arrasto da Árvore | arrasto do navegador entregue por protocolo | a sensação |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
