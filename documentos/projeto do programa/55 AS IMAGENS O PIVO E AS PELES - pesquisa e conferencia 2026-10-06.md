# As imagens, o pivô e as peles — pesquisa e conferência — 06/10/2026

Rodada 44, parte 1. Chat: `PESQUISANDO · rodada 44 — Imagens, pivô e Peles [89519c]`.
**Nenhum código foi mexido.** Ficha: `rodadas/RODADA 44 - polimento das imagens pivo e peles 2026-10-06.md`.

| | |
|:---|:---|
| Versão montada | a de `programa/` às 17h20 (o `ESTADO.md` diz **v32.3**). Servidor próprio na porta **5510** |
| Como | Chrome sem janela na porta **9510**, janela 1920×1080 (área útil 1902×984) e 1280×720, mouse, teclado e arrasto por protocolo. Roteiros de rascunho **fora** da pasta (regra 29) |
| Material | o herói de exemplo, e duas pastas de rascunho feitas do atlas dele: as 20 imagens soltas, uma arma nova (`armas/machado_dourado.png`) e 8 peças de inverno pintadas de azul |
| Hora | 17h20 a 17h45 do relógio da máquina |
| Fotos | `backup/fotos-obra/rodada-44/` (51) |
| Pesquisa | um ajudante, com fonte em cada fato (§1). PDFs da casa e manuais na web |

**Três ajustes do meu arranjo**, porque o Chrome sem janela não abre janela nativa: tirei da página o `showDirectoryPicker`, o `showSaveFilePicker` e o `showOpenFilePicker`. O programa cai então no `<input webkitdirectory>` e no download comum, que é o caminho que ele já tem para os outros navegadores. O que depende da janela nativa (o Recarregar a pasta) eu **não conferi**.

## O quadro

| # | Pergunta | Resposta curta |
|:---:|:---|:---|
| 1 | Dá para trocar a espada por outra imagem da pasta? | **Dá, por um caminho escondido**, em ~12 cliques. A espada do herói é uma **entidade**: soltar a imagem nova em cima dela **grava um campo que o leitor ignora**, a cena não muda, e o rodapé diz *"agora mostra machado"* (regra 21). Antes é preciso trocar a entidade por uma imagem pela grade |
| 2 | Dá para definir o pivô da arma? | **Dá, e é a melhor parte.** Janela com clique, nove pontos, setas, unidade *"px da imagem, da esquerda e de baixo"*. Na troca seguinte a arma cai pelo pivô. Falta campo de número e o tamanho da imagem |
| 3 | Dá para fazer a pele de inverno que troca a roupa inteira? | **Não pelo caminho do Spriter.** A subpasta `inverno/` com os **mesmos nomes** é recusada inteira pelo Trocar pasta de origem, e o rodapé diz *"virou a origem"* sem nada ter mudado. Fiz a pele **peça por peça**, com arquivos renomeados e soltos na janela: ~22 cliques |
| 4 | Ativar, desativar, exportar e importar? | **Faz, com tropeços.** Desligar é um clique. **Ligar só arrastando**, e a lista mostra **42 px**: Feitas e Ativas nunca cabem juntas; foi preciso subir a divisa. Exportar e Importar fazem a volta inteira; a recusa do nome repetido é honesta |
| 5 | Cabe? | **A aba Skins não.** A lista mostra **75 de 356 px** em 1920×1080 e **20 px** em 1280×720 (nenhuma skin à vista, só os 7 botões). A aba Imagens mostra **uma miniatura** em 1280×720 |

---

## 1. Como os outros fazem

Fontes da casa, em `documentos/pesquisa/nova pesquisa/`: **[SG]** `spine/Spine User Guide - manual completo 2026-09-08.pdf` · **[SP]** `spriter/Spriter Pro - manual oficial 1.4.pdf` · **[DB]** `dragonbones/DragonBones Pro - manual completo 2026-09-08.pdf` · **[SEQ-img]** `SEQUENCIA imagens e pivo` · **[SEQ-pele]** `SEQUENCIA peles e troca de roupa` · **[SEQ-exib]** `SEQUENCIA exibicao peles e historico`. "p." é a página do PDF. Links no fim.

### 1.1 Trocar a imagem de uma peça

| Programa | Gesto | Trocar todas as iguais | Fonte |
|:---|:---|:---|:---|
| Spriter | escolher a peça na cena e **botão direito numa imagem da paleta**; a troca vale daquele tempo em diante | sem botão: o caminho é o **Character Map**, imagem por imagem ou **pasta inteira** | SP p.3, p.22 |
| Spriter (rápido) | **segurar o botão direito** sobre a peça: uma fileira de miniaturas **da mesma pasta**; soltar sobre a escolhida | — | SP p.3 |
| Spriter (encaixe) | a imagem nova entra *"in the exact location… based on their respective pivot points"*; o manual pede o mesmo tamanho e o mesmo pivô | — | SP p.3 |
| Spine | campo **Image path** no anexo; ou **arrastar a imagem sobre o anexo** na árvore (copia o transform) | **Find and replace** nos nomes e caminhos, com expressão regular | SG p.31, p.68, p.230 |
| DragonBones | o slot guarda **várias imagens**, uma à vista; lista suspensa na ficha do slot (ou "Empty") | não confirmei | DB p.7, p.18 |

### 1.2 O pivô

| Programa | Onde | Gesto | Unidade | Fonte |
|:---|:---|:---|:---|:---|
| Spriter | **por imagem** (o padrão); nasce no canto de cima à esquerda | **duplo clique** na imagem da paleta: clique no ponto, ícones rápidos (cantos, centro, meio dos lados), OK | na tela: não confirmei; no arquivo, fração 0–1 (fórum, não oficial) | SP p.3, p.5 |
| Spriter (várias) | **Copy / Paste Default Pivots**, colar com várias escolhidas | — | — | SP p.5 |
| Spriter (na cena) | arrastar a bolinha cria um pivô **por instância**, que anima; o manual manda evitar. Botão direito: *use default* ou *Overwrite default* | — | — | SP p.5 |
| Spine | **não tem pivô de imagem**: o anexo fica pelo **centro**; move-se o anexo | campo de número com + * / e roda | px | SG p.34, p.45, p.68 |
| DragonBones | no JSON 5.5, `pivot` em fração 0–1; gesto no editor: não confirmei | — | — | JSON 5.5 · DB p.17 |

### 1.3 A pasta de imagens

| Programa | Como é | Fonte |
|:---|:---|:---|
| Spriter | **File palette** no alto à direita, por subpasta; botão **reload images**. Tamanho da miniatura: não confirmei | SP p.3 · SEQ-img |
| Spine | nó **Images** da árvore, por subpasta; **observa a pasta**: o que muda no disco entra na hora. Ícone **laranja = sem uso, verde = em uso**; a imagem aparece ao parar o mouse | SG p.29–31, p.226 |
| DragonBones | painel **Recursos**, pasta real; arrastar um PNG de fora **copia** para ela | DB p.8, p.20 |

### 1.4 A pele

| Pergunta | Spriter: Character Map | Spine: Skins | DragonBones |
|:---|:---|:---|:---|
| Criar | **CharMaps → Create New**; à esquerda a original, **botão direito** na substituta; **vale para pasta inteira**; *set ignored*, *Set Hidden* (SP p.22) | **New… Skin**; Skin Placeholder (SG p.110–111, p.218) | no editor: não confirmei; o JSON aceita lista de skins |
| Ativar | **arrastar** de Available para Active, e de volta (SP p.23–24) | o **ponto** na árvore ou um clique na Skins view (SG p.113–114) | não confirmei |
| Ver o que troca | duplo clique edita o mapa; os pares na coluna da esquerda (SP p.22) | *Show all skin attachments* (SG p.115) | — |
| Combinar | **empilhar** na Active (SP p.23) | **pin**; **a de cima vence** (SG p.219) | — |
| Exportar / importar | grava a **pilha ativa** num `.scms` e reabre; vale entre projetos com os mesmos nomes (SP p.24) | pele isolada como arquivo: não confirmei; **Import Data** traz skins sem animações (SG p.286) | não confirmei |

**O que os três repetem:** a imagem mora numa **pasta real** que o programa relê · a peça é um **lugar** que mostra outra imagem sem mexer na animação · trocar é um **gesto curto sobre a peça escolhida** · Spriter e Spine **empilham peles** · os dois manuais mandam **desenhar as variações no mesmo tamanho e no mesmo quadro** · o Spriter faz a pele **de uma pasta inteira com os mesmos nomes**, que é exatamente o caso que o nosso recusa (§2.1).

---

## 2. O que o nosso faz hoje

**faz** · **pela metade** · **não faz** · **não tem porta**.

### 2.1 A aba Imagens

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Pastas e miniaturas | faz | por subpasta, com a conta; cada miniatura diz quantos slots a usam ✓ | `02` |
| Buscar | (código) | o campo existe; não testei | — |
| Detalhes da imagem | **não faz** | não há modo de lista, nem tamanho em px na miniatura; o tamanho só aparece na dica da aba **Pivôs** (*"cape_lower: 46 × 42 px"*) | `39` |
| Tamanho da miniatura | **não tem porta** | fixo | — |
| Abrir pasta do projeto (botão da aba) | **pela metade** | com o herói aberto, **troca o projeto inteiro por um vazio, sem perguntar**; a dica não avisa | `03` |
| Abrir pasta num projeto vazio | **não conferi** | a página **parou de responder 3 vezes em 3** logo depois de escolher a pasta, sempre pelo caminho do `webkitdirectory`. Pode ser o meu arranjo; pode ser o programa. **Vai à rodada 45** (Arquivo) | — |
| Trocar pasta de origem | **pela metade** | com **um** nome repetido em duas subpastas, **recusa a pasta inteira**: *"0 imagens trocadas; 8 nomes estão repetidos lá"*, e diz **"virou a origem"**, mas a aba continua *"Nenhuma pasta"* e as imagens novas **não entram** (regra 21). Sem repetidos: a arma nova entra ✓ | `08`, `09` |
| Trocar de novo para a mesma pasta | pela metade | *"não tem nenhuma imagem com os nomes deste personagem"*: falso, tem todas; e as imagens novas da pasta **não entram** | — |
| Recarregar a pasta | **não conferi** | no meu arranjo: *"Este navegador não deixa reler… Abra de novo"* — frase honesta | — |
| Soltar PNGs na janela | faz | *"8 imagens entraram na aba Imagens"* ✓, todas em "Sem subpasta" | `26` |
| Arrastar a miniatura para a linha do slot (imagem) | faz | *"weapon/sword agora mostra armas/machado_dourado"* ✓ | `15` |
| **Arrastar a miniatura para o slot de uma entidade** | **não faz** | grava `path` num anexo do tipo entidade; a cena **não muda**; o rodapé diz que mudou; nasce um aviso **em inglês**: *"path" is ignored on a "skeleton" attachment*. Ctrl+Z desfaz ✓. Código: `panels/tree.ts`, `dropImage` | `11`, `12`, `13` |
| Arrastar com a Árvore rolando | pela metade | a Árvore rola durante o arrasto e a imagem cai em **outra** linha (`hand`); **nada acontece e o rodapé fica mudo** | `11` |
| Botão direito na miniatura | faz | *Usar no desenho escolhido* · Definir pivô… · Copiar · Colar pivô · Duplicar no atlas ✓ | `43` |
| — Usar no desenho escolhido | faz | é o gesto do Spriter: *"weapon/sword agora mostra blade, na skin default"* ✓. Com a **entidade** escolhida fica cinza e diz o porquê ✓ | `44z`, `45z` |
| Duplo clique na miniatura | (dica) | a dica diz que abre o pivô; não testei | — |

### 2.2 A grade de troca (botão direito na peça, na cena)

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Abrir a grade | faz | "Este boneco", as miniaturas, fonte **pasta / objeto**, e as opções da peça ✓ | `07` |
| Trocar a entidade por imagem | faz | *"weapon volta a mostrar a imagem blade, pelo pivô dela"* ✓ | `14` |
| Fonte "pasta" | **pela metade** | mostra **só a subpasta da imagem de agora**: com a espada (raiz), o machado (`armas/`) **não aparece**; com o machado, só `armas/`. Não há como ver as outras pastas na grade | `10`, `20` |
| Fonte "objeto" | pela metade | *"as imagens que este slot já usou"* — não lembrou o `blade` que o slot usou um momento antes | `21` |
| A fonte fica lembrada | pela metade | a fonte "objeto" de uma peça voltou na peça seguinte; o corpo mostrou **só** o corpo e a espada | `29` |
| **A dica de "Este boneco"** | **não faz** | *"A imagem "brilho" vira o meio de espada: 1 atrás do boneco inteiro, 0 na frente…"* — fala de outra coisa. Código: `panels/entities-actions.ts:305` | `07` |
| "espada" na grade de **toda** peça | pela metade | a entidade aparece até sobre o corpo | `29` |
| A grade cobre o boneco | pela metade | ela abre **por cima** da peça clicada | `07` |

### 2.3 O pivô

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Definir pivô… (menu Imagens) | faz | sem peça escolhida, o rodapé ensina: *"Escolha um desenho, na cena ou na Árvore, ou dê duplo clique…"* ✓ | `16` |
| A janela | faz | clique na articulação, nove pontos, setas 1 px e Shift 10 px, **"X 35 · Y 16,5 — px da imagem, da esquerda e de baixo"** ✓ | `17` |
| — campo para digitar o número | **não faz** | o número só se lê | `17` |
| — tamanho da imagem | **não faz** | a janela não diz que a imagem tem 70 × 33 px: não se sabe onde fica o meio | `17` |
| — os dois botões | pela metade | *Gravar o pivô* e *Deixar como está* **com a mesma cor** | `17` |
| Gravar | pela metade | *"Pivô de armas/machado_dourado: 10, 17. 1 desenho ficou parado. O pivô fica guardado à mão: **o osso não está nele**"* — a última frase não se entende | `18` |
| A troca usa o pivô | faz | trocar para `blade` e voltar ao machado: o machado cai **com o cabo na mão** ✓ | `24z` |
| Repetir para a pasta | faz | a caixa diz quando a imagem é a única da pasta, ou está na raiz ✓ | `17`, `39` |
| Copiar / Colar pivô | (menu) | Colar fica cinza com o porquê ✓; não colei | `04` |
| Carimbar pivôs | (código) | dica longa e boa; não apertei | — |
| Voltar o pivô para o osso | (menu) | acende depois de um pivô à mão ✓; não apertei | — |
| Aba Pivôs | pela metade | a grade de todas as imagens, a borda tracejada nas sem pivô ✓; **"X 2 · Y 21" em letra miúda, sem unidade à vista** (só na dica); o aviso das telas diferentes em **laranja miúdo** | `39` |
| Arranjo "Pivô" | faz | a grade grande de um lado só ✓ | `40` |
| Alinhar pelo PSD | **não conferi** | não importei PSD nesta rodada | — |

### 2.4 A aba Skins

| Gesto | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| Feitas / Ativas | faz | a pilha, *"a de cima vence"* na dica ✓; a conta de slots por skin ✓ | `06` |
| Nova skin | pela metade | nasce com o nome **"skin"**, sem perguntar; entra **ligada e no topo** ✓; o rodapé ensina ✓ | `27` |
| Renomear (duplo clique) | faz | *"Skin "skin" agora é "inverno""* ✓ — mas a linha estava **abaixo da dobra** | `28` |
| "Nesta skin: inverno" | faz | *"Ela ainda não mexe em nada. Botão direito numa imagem: trocar, ou Esconder nesta skin"* ✓ | — |
| Trocar peça na skin (grade) | faz | *"body/body agora mostra body_inverno, na skin inverno"* ✓ | `30z` |
| **Fazer a skin de uma pasta…** | **pela metade** | a janela pede o **nome de uma subpasta da origem** ✓ — mas a subpasta com os mesmos nomes **nunca entra** na origem (§2.1). No herói, **não há como** | `25` |
| Trocar imagem nas skins… | faz | modo: *"Clique na imagem nova no painel Imagens"*; *"blade → armas/machado_dourado no slot weapon, em 1 skin"* ✓ | `22` |
| Desligar (×) | faz | *"Skin "inverno" desligada"* ✓ | `31` |
| **Ligar** | **pela metade** | **só arrastando** de Feitas para Ativas, e as duas não cabem juntas na lista (42 px). Precisei subir a divisa. Não há botão nem item de menu | `32`, `33` |
| Editar aqui (lápis) | pela metade | troca a skin do lápis; **o rodapé fica mudo** | — |
| Apagar skin | faz | pede confirmação, diz o que sai e que o Ctrl+Z devolve ✓ (*"3 slot(s)"*) | — |
| Exportar skin… | pela metade | grava `inverno.bone` com as trocas ✓; o rodapé diz *"ela exige 6 nomes de quem a usar"* — jargão; o arquivo **aponta o atlas do herói** e **não leva as imagens soltas**; herda o *copyright "Exemplo da especificação"* do herói | `34` |
| Importar skin… | faz | com o nome repetido: recusa honesta ✓; sem ele: *"entrou nesta base, e está na lista de Feitas"* ✓; ligada, veste de novo ✓ | `35`, `37`, `38z` |
| Promover skin a base… | faz | só com a default ligada, ensina: *"Ligue a skin que vai virar base: arraste-a para Ativas"* ✓; não promovi | `46` |
| **Nome: pele ou skin** | pela metade | o menu e a aba dizem **Skins**; a ficha e o cartão inicial dizem **pele** | — |

### 2.5 As portas do menu

| Porta | Estado | Nota |
|:---|:---:|:---|
| Menu Imagens (10 itens) | faz | cinza com o porquê ✓ |
| Menu Skins (9 itens) | faz | dicas inteiras ✓ |
| **Exportar skin, Importar skin** | **não tem porta** no menu | só os ícones da aba |
| **Ligar skin** | **não tem porta** | só o arrasto |
| Clonar / Duplicar | pela metade | o menu diz **Clonar skin**, a aba diz **Duplicar skin** |
| As dicas da aba | pela metade | os 7 ícones da aba Skins têm **dica = o nome** (*"Nova skin"*); o menu tem a frase inteira |

---

## 3. O caminho do objetivo

**Trocar a arma e fazer uma pele de inverno.** Como usuário, sem ler o código.

### 3.1 A arma

| # | Passo | Cliques | Tropeço |
|:---:|:---|:---:|:---|
| 1 | Abrir o herói | 1 | ✓ |
| 2 | Trazer a arma nova: botão **Abrir pasta** da aba | 1 + pasta | **T1** o herói **some**: o projeto vira um vazio, sem perguntar (`03`) |
| 2b | Reabrir o herói; botão **Trocar pasta de origem** | 2 + pasta | **T2** a pasta com `inverno/` é recusada inteira e o rodapé diz "virou a origem" (`08`). Só sem nomes repetidos o machado entra (`09`) |
| 3 | Botão direito na espada | 1 | **T3** o machado **não está na grade**: ela mostra só a subpasta de agora (`10`) |
| 4 | Arrastar o machado para a linha `weapon` da Árvore | 1 | **T4** a cena **não muda**; o rodapé diz que mudou; aviso em inglês (`12`, `13`) |
| 5 | Ctrl+Z; botão direito na espada → `blade` | 3 | descobre-se que a espada era uma **entidade** |
| 6 | Arrastar o machado para a linha `weapon` | 1 | ✓ (`15`) — ou: escolher a peça e **botão direito no machado → Usar no desenho escolhido** (2) |
| 7 | Imagens → Definir pivô… | 2 | o rodapé ensina a escolher a peça antes ✓ |
| 8 | Clicar no cabo → Gravar o pivô | 2 | **T5** *"1 desenho ficou parado… o osso não está nele"*: o machado não se mexe agora; só na próxima troca cai pelo pivô (`24z`) |

**A arma: ~12 cliques sem os tropeços.** O que trava de verdade é o **T4** (a mentira do rodapé) e o **T3** (a grade não mostra a outra pasta). O **T1** perde o trabalho aberto de quem não salvou.

### 3.2 A pele de inverno

| # | Passo | Cliques | Tropeço |
|:---:|:---|:---:|:---|
| 1 | Pôr a pasta `inverno/` (mesmos nomes) na origem | — | **T6 o caminho do Spriter não existe aqui**: recusada inteira (§2.1). Renomeei para `body_inverno.png` e **soltei os 8 PNGs na janela** (`26`) |
| 2 | Aba Skins → **+** | 1 | nasce **"skin"** |
| 3 | Rolar a lista; duplo clique; digitar "inverno" | 2 + rolar | **T7** a lista mostra 75 px; a skin nova fica abaixo da dobra (`27`) |
| 4 | Por peça: botão direito → `…_inverno` | 2 por peça | **T8** a fonte "objeto" de antes volta: um clique a mais em "pasta" (`29`). **Errei a peça uma vez** (§Erro) |
| 5 | Desligar (×) | 1 + rolar | ✓ |
| 6 | Ligar | 1 arrasto + subir a divisa | **T9** só arrastando, e Feitas e Ativas não cabem juntas (`32`) |
| 7 | Exportar (ícone) | 1 | **T10** *"exige 6 nomes de quem a usar"*; as imagens não vão junto |
| 8 | Apagar a daqui (lápis, lixeira, confirmar) | 3 | Importar recusa o nome repetido — honesto, mas são 3 cliques |
| 9 | Importar (ícone) + arquivo; ligar (arrasto) | 2 + arrasto | ✓ veste de novo (`38z`) |

**A pele: ~22 cliques para 3 peças**, mais 2 por peça. **O que trava:** o **T6** (a pele de uma pasta não se faz no herói), o **T7** e o **T9** (a lista de 42–75 px).

---

## 4. O padrão (régua do `26`)

| Número | Onde | Hoje | Unidade | Faixa | O que falta |
|:---|:---|:---|:---:|:---:|:---|
| Pivô X · Y | janela | "X 35 · Y 16,5 — px da imagem, da esquerda e de baixo" | ✓ | ✗ | o **tamanho da imagem** ("de 0 a 70 px") e um **campo** para digitar |
| Pivô X · Y | aba Pivôs | "X 2 · Y 21", miúdo | só na dica | ✗ | "px" à vista, o tamanho, a letra do tamanho das outras abas |
| Pivô na dica da grade | aba Pivôs | "pivô em -23, 12" | ✗ | — | "px"; dizer que **fora da imagem** é de propósito (as mãos) |
| Tamanho da imagem | aba Pivôs | "46 × 42 px" só na dica | ✓ | — | na janela do pivô e na miniatura |
| Conta na miniatura | aba Imagens | "2" | na dica ("2 slots usam") | — | ✓ |
| Conta na skin | aba Skins | "23" | na dica ("23 slots vestidos") | — | ✓ |
| Copiar pivô | menu | "em proporção" | ✓ | — | ✓ |
| Rodapé do Exportar | — | "exige 6 nomes" | ✗ | — | **"precisa de 3 ossos e 3 slots com estes nomes"** |
| Rodapé do Apagar | — | "3 slot(s)" | — | — | "3 slots" |

**Conta:** 9 números. **4** em dia · **5** com falta (2 de unidade à vista, 2 de faixa ou tamanho, 1 de jargão).

**Texto:** o **menu** tem frases inteiras; **a aba Skins** repete o nome nos 7 ícones. A **aba Pivôs** tem a letra mais miúda do programa e um parágrafo laranja longo. A **janela do pivô** é o modelo do padrão: unidade, origem e teclas à vista. Defeitos de texto: *"o osso não está nele"* · *"exige 6 nomes"* · a dica de **"Este boneco"** · o aviso **em inglês** do `path` · **pele ou skin**.

### O que rola, e por quê

| Tela | Aba | Grupo | Lista à vista / conteúdo | Foto |
|:---|:---|:---:|:---:|:---|
| 1902×984 | Imagens | 468 px | 292 / 1480 px: **6 miniaturas** | `02` |
| 1902×984 | Skins | 220 px | **75 / 356 px**: 2 linhas | `06`, `27` |
| 1280×720 | Imagens | 288 px | 112 / 1480 px: **1 miniatura** | `42` |
| 1280×720 | Skins | 136 px | **20 / 356 px**: só os 7 botões, **nenhuma skin** | `42` |

Na aba Skins, **os 7 botões em duas fileiras** e o **recado azul** (*"A skin está vazia…"*) comem a altura antes da lista. Na aba Imagens, a busca e a linha da pasta comem ~110 px antes da primeira miniatura. **Os grupos mudam de altura sozinhos** quando a aba muda: a aba Skins pulou de 220 px para 468 px e voltou, entre uma foto e outra (`06`, `22`).

---

## 5. O plano dos lotes

Uma versão por lote. Tudo nas partes **Imagens** (`panels/palette*`, `image-picker*`, `image-grid-model.ts`, `pivot-*`) e **Peles** (`panels/skins*`, `skins-model.ts`, `skins-actions.ts`, `io/export-skin.ts`). **Nada toca `formato/` nem `runtime/`**: pele e pivô já existem no `.bone`. Fora das partes, está dito.

### Lote 1 — o que mente (regra 21)

| # | O que tem de acontecer | Onde | Fonte |
|:---:|:---|:---|:---|
| 1.1 | **Soltar imagem no slot de uma entidade troca de verdade**: o anexo vira imagem, como a grade faz; nunca grava `path` num anexo de entidade | `panels/tree.ts` (`dropImage`): **fora da parte**, passagem só acrescentando; ou o mesmo comando da grade | `12`, `13`; Spine: arrastar sobre o anexo troca |
| 1.2 | **Trocar pasta de origem com nomes repetidos**: troca os que **não** são repetidos, **põe a pasta no acervo** (as subpastas entram, como no Abrir pasta) e diz quais ficaram. Nunca "virou a origem" com nada mudado | `io/project-folder.ts` (`folderSwapNotice` e o plano): **fora da parte**, avisar a 45 | `08`, `09` |
| 1.3 | A mesma pasta de novo **traz as imagens novas** e diz quantas; não "não tem nenhuma imagem" | idem | §2.1 |
| 1.4 | **Abrir pasta com projeto aberto pergunta** antes de largar o projeto (*"Abrir a pasta como projeto novo? O herói fecha"*), e a dica avisa | botão da aba Imagens | `03`; Spriter: projeto = pasta |
| 1.5 | A soltura que cai numa linha **que não aceita** diz por quê, no rodapé | `panels/tree.ts` | `11` |
| 1.6 | A dica de **"Este boneco"** diz o que o botão faz | `panels/entities-actions.ts:305` (parte Entidades: avisar a 39) | `07` |

**Prova:** teste puro de que soltar imagem num anexo de entidade **não** deixa `path` em anexo `skeleton` (falha hoje, regra 26); foto do machado na mão em 2 gestos, a partir da espada original.

### Lote 2 — a grade e a troca

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 2.1 | A fonte **"pasta"** mostra a subpasta de agora **e as outras**, dobradas embaixo (ou uma terceira fonte, **"todas"**) | Spriter: a paleta inteira no botão direito; o atalho rápido é que mostra só a pasta |
| 2.2 | A fonte escolhida **não passa de uma peça para outra**: abre sempre em "pasta" | `29` |
| 2.3 | "objeto" lembra **toda imagem que o slot mostrou** nesta sessão | `21` |
| 2.4 | A entidade só aparece na grade de peça que **já é** entidade, ou numa seção própria | `29` |
| 2.5 | A grade abre **ao lado** da peça, não por cima | `07` |

**Prova:** foto da grade da espada mostrando o machado; teste puro da lista de imagens da grade com duas subpastas.

### Lote 3 — o pivô se lê e se digita

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 3.1 | Na janela: **campos X e Y** (px, com a faixa *"de 0 a 70"*) e o **tamanho da imagem** | Spine: campo com + * /; régua do `26` |
| 3.2 | *Gravar o pivô* em destaque; *Deixar como está* neutro | regra de botão primário da casa |
| 3.3 | O rodapé do Gravar diz o que acontece **na próxima troca**: *"Pivô em 10, 17 px. Na próxima troca, o machado cai com este ponto no osso"*; some "o osso não está nele" | `18`, `24z` |
| 3.4 | Aba Pivôs: **"px" à vista**, a letra do tamanho das outras abas, o aviso das telas em **uma linha** (o resto na dica) | `39` |
| 3.5 | O tamanho em px também na **dica da miniatura** da aba Imagens | Spine mostra a imagem ao parar o mouse |

**Prova:** teste de que todo número da janela e da aba Pivôs tem unidade e faixa (falha hoje); foto da janela com os campos.

### Lote 4 — a aba Skins cabe e se liga

| # | O que tem de acontecer | A conta |
|:---:|:---|:---|
| 4.1 | Os 7 botões numa **fileira só**; o recado azul em **uma linha** | hoje: 2 fileiras + recado comem a lista |
| 4.2 | Em **1280×720**, **pelo menos 3 linhas** de skin à vista; em 1920×1080, Feitas e Ativas **juntas** | hoje: 20 px e 75 px. Medir no `npm run medir` |
| 4.3 | **Ligar sem arrastar**: um botão por linha em Feitas (*"Ligar: vai para o topo da pilha"*), e o item **Skins → Ligar esta skin** | Spine: um clique; Spriter: arrasto. O clique soma, o arrasto fica |
| 4.4 | **Nova skin pergunta o nome** (ou já nasce com o nome em edição) | Spine: New… Skin pede nome |
| 4.5 | O lápis fala no rodapé (*"Editando a skin inverno"*) | regra 21 |
| 4.6 | **Exportar skin** e **Importar skin** ganham porta no menu Skins; **Clonar** e **Duplicar** viram um nome só | §2.5 |
| 4.7 | Os 7 ícones da aba com a **frase do menu** na dica | regra 12 |

**Prova:** foto em 1280×720 com 3 skins à vista; ligar e desligar com dois cliques.

### Lote 5 — a pele de uma pasta, e o arquivo da pele

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 5.1 | **Fazer a skin de uma pasta** funciona no projeto do herói: com a origem aceitando subpastas de mesmo nome (1.2), escolher `inverno` faz a pele inteira num gesto, e o rodapé diz quantas peças trocou e quais ficaram | Spriter: Character Map **de pasta inteira** (SP p.22) |
| 5.2 | Exportar diz **"precisa de 3 ossos e 3 slots com estes nomes"**; e avisa quando **as imagens não vão junto** (soltas, fora do atlas) | §2.4 |
| 5.3 | O arquivo exportado **não herda** o copyright do herói | `34` |
| 5.4 | "slot(s)" vira "slots" | §4 |
| 5.5 | **Pele ou skin**: um nome só em todo o programa. **Suposição S3**: fica **skin**, que é o que o menu e a aba já dizem | §2.4 |

**Prova do lote 5 (o objetivo da rodada):** no programa montado, com o mouse: trocar a espada pelo machado, definir o pivô, criar a pele `inverno` **de uma pasta**, ligar, desligar, exportar, apagar, importar, ligar. Foto de cada passo e o número de cliques (hoje: ~12 + ~22, com a pasta renomeada à mão).

### O que fica de fora

| O quê | Por quê |
|:---|:---|
| Abrir pasta num projeto vazio **travou 3 vezes** | não sei se é o programa ou o meu arranjo sem janela. **Vai à rodada 45 (Arquivo)**, que conferir com o seletor de verdade |
| Recarregar a pasta | precisa do seletor nativo; idem |
| Observar a pasta sozinho (o Spine) | ninguém pediu; o Recarregar cobre |
| Find and replace nos caminhos (o Spine) | ninguém pediu |
| Tamanho da miniatura ajustável | ninguém pediu; o lote 3 põe o tamanho em px na dica |
| Alinhar pelo PSD | não importei PSD; fica para quem conferir a parte 2 |
| A Ficha rápida sem unidade (X, Escala, Ângulo) | é da rodada 46 (Cena e ferramentas), já avisada pelo Diretor |

---

## Suposições (regra 23: nada subiu ao Humberto)

| # | Suposição | Quem decide se estiver errada |
|:---:|:---|:---|
| S1 | Com nomes repetidos, a origem **aceita a pasta** e só deixa de trocar os repetidos (hoje recusa tudo). O Spriter guarda variações em subpasta com o mesmo nome | Diretor |
| S2 | **Ligar por clique soma**, não tira o arrasto | Diretor |
| S3 | O nome que fica é **skin** | Diretor (é palavra que o Humberto lê) |
| S4 | O lote 1.1, 1.2 e 1.5 tocam arquivos **fora da parte** (`tree.ts`, `project-folder.ts`). Faço só acrescentando e aviso as rodadas 43 (Árvore) e 45 (Arquivo) antes | Diretor |

## O que não conferi

| O quê | Por quê |
|:---|:---|
| Abrir pasta num projeto vazio | a página parou de responder 3 vezes; o aplicativo reiniciou às ~17h50 no meio da terceira prova |
| Recarregar a pasta | precisa do seletor nativo |
| Buscar, duplo clique na miniatura, Carimbar, Voltar o pivô, Colar pivô, Promover até o fim | o tempo foi para o objetivo |
| Exportar e importar entre **dois projetos** | importei no mesmo; as imagens soltas estavam na memória |
| A peça de inverno numa **animação** | só na base |
| As duas primeiras exportações | foram antes de eu acertar o destino do download: o rodapé disse "gravada" e o arquivo não chegou à pasta de rascunho. Não procurei fora da pasta do projeto (regra 9) |

## Dois erros meus, pela forma (regra 27)

**Mirei a peça pelo ponto da cena, sem conferir o nome dela.** O roteiro clicava em (905, 340) achando que era a capa de cima; era a de baixo, e pus `cape_upper_inverno` em `cape_lower`. Consertei na hora com a imagem certa no mesmo lugar (`30z`). Daí em diante, a grade diz qual é **"a imagem de agora"**, e o roteiro lê isso antes de clicar.

**Arrastei pelo ponto onde eu achava que estava a divisa, sem `elementFromPoint`.** Peguei a barra de abas e **juntei os dois grupos da direita** (`39`). Foi no perfil de rascunho do Chrome, não no do Humberto; *Voltar ao padrão do contexto* desfez. A mesma lição da rodada 41, que eu tinha lido e não apliquei nesse gesto: **todo arrasto confere o alvo antes**, não só todo clique.

## Links

| Programa | Link |
|:---|:---|
| Spriter | https://www.brashmonkey.com/spriter_manual/ · https://www.brashmonkey.com/spriter_manual/default%20pivot%20points.htm · https://www.brashmonkey.com/spriter_manual/swapping%20the%20image%20of%20a%20sprite.htm · https://www.brashmonkey.com/spriter_manual/what%20are%20character%20maps.htm |
| Spriter, unidade do pivô (fórum, não oficial) | https://www.purebasic.fr/english/viewtopic.php?p=651786 |
| Spine | https://esotericsoftware.com/spine-images · https://esotericsoftware.com/spine-regions · https://esotericsoftware.com/spine-skins · https://esotericsoftware.com/spine-skins-view · https://esotericsoftware.com/spine-tools |
| DragonBones | JSON 5.5: https://unpkg.com/dragonbones-tools@0.1.2/doc/dragonbones_json_format_5.5-zh_CN.md · troca de slot no Cocos: https://docs.cocos.com/creator/manual/en/editor/components/dragonbones.html · o resto no PDF da casa |

## Desvios (o executor, na parte 2)

| Lote | Desvio | Por quê |
|:---:|:---|:---|
| 1 | **O item 1.6 saiu.** A dica de "Este boneco" está certa | é a função da entidade que põe o boneco entre as partes da espada (o "meio"): a imagem "brilho" é de dentro da espada. Eu li errado na parte 1. O texto é difícil, mas é da parte Entidades: vai à rodada 47 (o padrão) |
| 1 | **O 1.2 mudou de forma.** A regra I4 do Humberto (nome repetido avisa, não escolhe) fica. O que mudou: quando um dos candidatos tem o **caminho exato** da imagem de agora, ele É a imagem de agora — não é palpite | assim a pasta do Spriter (`body` e `inverno/body`) entra inteira, e o repetido sem par exato continua avisando (o `armadura/body` do herói, que não está na pasta, avisou na prova) |
| 1 | **O 1.5 achou outra causa.** Só as linhas de **slot** recebiam soltura; num osso a imagem caía calada | as outras linhas agora recebem a soltura só para dizer *"Solte a imagem na linha de um slot"*, sem acender como alvo |
| 1 | O 1.4 oferece **"Usar como pasta deste personagem…"**, que é o Trocar pasta de origem de sempre | nenhuma ação nova: a janela só põe as duas portas que já existiam lado a lado |
| 2 | **O item 2.4 sai.** A entidade na grade de toda peça é a função E6 (trocar imagem por entidade), de propósito, numa seção depois das imagens | li como defeito na parte 1 |

| 0 | **Lote novo, urgente, antes do 1** (ordem do Diretor): o painel Pivôs pedia o tamanho de toda imagem não lida a cada redesenho, e cada resposta redesenhava — 105 leituras para 14 imagens. Era o "Abrir pasta em projeto vazio trava" que eu vi 3 em 3 e mandei para a 45 | `panels/pivot-sizes.ts`, cache com marca de "a caminho"; fechado com o lote 1 na v32.7 |
| 2 | **O 2.5 sai.** A grade embaixo da peça é o modelo do Spriter, escrito no arquivo dela, e há testes que fixam o lugar | eu li a grade por cima do boneco como defeito; é o desenho |
| 2 | Um teste velho exigia a fonte da grade guardada no navegador; o 2.2 tira isso de propósito, e o teste agora exige o contrário | — |
| 3 | **A frase "o osso não está nele" fica.** Um teste exato da parte Arquivo (`arquivo.test.ts`) a lê | a explicação entra DEPOIS dela: *"Quando esta imagem entrar numa troca, ela cai com este ponto no osso"* |
| 4 | **O 4.6 encolhe.** Exportar e Importar skin já estão no menu **Arquivo**, por decisão 5 do Humberto | na parte 1 eu disse "não tem porta"; estava errado. Fica só "Clonar" com um nome |
| 4 | O lápis já ligava uma skin desligada | eu não tinha visto; o olho de ligar soma sem o lápis |
| 5 | **O 5.3 sai.** O cabeçalho da skin exportada copia o do corpo de propósito (`minVersion` obrigatório), e a licença do exemplo vale para a skin feita dele | não é defeito |

## Mais um erro meu, pela forma (regra 27)

**Conferi texto de arquivo com a quebra de linha dentro, sem olhar o fim de linha dele.** Escrevi um teste que procurava duas linhas juntas, separadas pela quebra LF, num arquivo gravado em CRLF; o teste nasceu vermelho. Consertei na mesma volta (duas buscas de uma linha cada). Daí em diante, **teste de texto procura uma linha por vez**.

| 5 | **Parte d, achada na prova final.** "Fazer a skin de uma pasta" listava só as pastas de imagens já num atlas ("armadura, armas"); a `inverno/` da aba Imagens não aparecia | a janela soma as imagens da pasta do projeto, e põe as escolhidas na cena antes de fazer a skin |
| 5 | Concordância do Exportar: "8 imagens soltas… para ela entrar" | "para elas entrarem" |

## A prova final (parte 2), 06/10, 22h15

No editor do disco (o mesmo código da v33.4 + a parte d), Chrome sem janela, 1920×1080, mouse e teclado. Fotos em `backup/fotos-obra/rodada-44/prova-final/`.

| # | Passo | Cliques | O que se viu |
|:---:|:---|:---:|:---|
| 1 | Abrir o herói | 1 | ✓ |
| 2 | Abrir pasta da aba → **Usar como pasta deste personagem…** → a pasta | 2 + pasta | *"virou a origem… 20 de mesmo nome estão no atlas salvo, e a cena continua com elas (arm, arm_back, blade e mais 17); 9 imagens novas"* (`01`) |
| 3 | Botão direito na espada → o machado na grade | 2 | a grade abre em **"todas"**, por pasta (`02`); *"weapon … mostrar a imagem armas/machado_dourado, pelo pivô dela"* |
| 4 | Imagens → Definir pivô… → X 10, Y 17 → Enter | 6 | *"Quando esta imagem entrar numa troca, ela cai com este ponto no osso"*; "abc" no X **avisa** e a janela fica (`03`) |
| 5 | Skins → Fazer a skin de uma pasta… → `inverno` → Fazer a skin | 3 + digitar | *"A pasta "inverno" cobre 8 desenhos; 12 continuam os de baixo"* — **a roupa inteira num gesto** (`07z`) |
| 6 | Desligar (×) · Ligar (olho) | 2 | *"desligada"* · *"ligada"* |
| 7 | Lápis na inverno · Exportar | 2 | *"exige de quem a usar 8 ossos e 8 slots com estes mesmos nomes. 8 imagens soltas não vão junto"* |
| 8 | Apagar (pergunta) · Importar · Ligar | 4 + arquivo | *"Ela veste 8 slots"* · *"entrou nesta base"* · veste de novo (`08z`) |

**O objetivo se cumpre em ~22 cliques**, sem renomear arquivo, sem soltar PNG na janela e sem subir divisa. Na parte 1 eram ~12 + ~22, com a pasta renomeada à mão, a lista de 42 px e um arrasto que só funcionou depois de mexer na tela.

**O que fica:** "o osso não está nele" no rodapé do pivô (um teste exato da parte Arquivo a lê); o Abrir pasta num projeto vazio é da rodada 45; o texto do "Este boneco" vai à rodada 47.

## Um erro meu no fecho da v33.6, pela forma (regra 27)

**Troquei uma ação que fazia na hora por uma janela, sem pensar em quem a roda sem tela.** A "nova-pele" passou a pedir o nome antes de criar (doc 67); no teste das ações, que roda sem navegador, a janela não existe, a ação calava, e caíram 4 testes (`acoes`, `existir-nao-e-funcionar`). Vi na suíte inteira, antes de fechar, e consertei no mesmo semáforo: sem janela, a skin nasce com o nome proposto e o rodapé diz. **Toda ação que ganha janela tem de dizer o que faz quando não há janela.**

## Lote 6 — a conferência da prova final (doc 71)

| # | O que o conferente achou | O que mudou | Foto (`lote6/`) |
|:---:|:---|:---|:---|
| a | O campo Pasta vinha "armadura" sem seleção; digitar dava "armadurainverno" e a janela fechava com erro | o campo é uma **lista** das pastas; a de partida é a primeira que ainda não é skin | `03` |
| b | Importar dizia "na lista de Feitas" e não vestia | importar **veste**, no topo de Ativas, no mesmo passo de desfazer; o lápis fica onde estava | `04z` |
| c | Trocar pasta de origem não entra no Histórico, e a dica dizia "Um só desfazer" | a dica diz o que volta com Ctrl+Z (as trocas de imagem) e o que não volta (a pasta); o rodapé ensina a voltar | — |
| d | A laranja da grade só na dica do mouse | legenda escrita: **"Laranja: a de agora"** | `01` |
| e | O machado de 1275 × 1027 px entrava num herói de 241 px sem uma palavra | **suposição S5**: a imagem trocada entra no tamanho dela, como no Spriter (*"in the exact location… based on their respective pivot points"*, e o manual pede o mesmo tamanho) e no Spine (o anexo desenha a região dele). Nenhum dos dois estica. O rodapé **diz** quando o lado maior muda mais que o dobro, ou quando a nova passa de 256 px sem imagem de antes | `02` |

**S5** — a imagem trocada não é escalada para caber; o rodapé avisa e manda à Escala da ficha. Quem decide se estiver errada: Diretor.

## Lote 7 — a prova final refeita (doc 75)

| # | O que o conferente achou | A causa | O que mudou | Foto (`lote7/`) |
|:---:|:---|:---|:---|:---|
| a | A skin importada deixava o herói **sem rosto**, e a barra dizia "Nenhum aviso" | o rosto é uma **malha com pesos** (presa a `head` e `neck`). O `binding.bones` conta na lista de ossos do **arquivo da skin** (apêndice C, regra 8), e saía com os números do **corpo** num arquivo que só tem o `root`: na volta, todo osso ia para o índice 0. O aviso do leitor (*RIG_UNMET… do binding*) existia, e a frase do Importar o **engolia** | a exportação põe no arquivo os ossos que os pesos usam, **pelo nome** (o leitor os casa com os do corpo, não os cria), e renumera os pesos por eles; a frase do Importar mostra o aviso dos pesos. Teste: fazer, exportar, apagar, importar, e os ossos do rosto voltam os mesmos (falhava: `[3,3,3,3,2]` virava `[0,0,0,0,0]`) | `01z` feita, `03z` importada: iguais |
| b | O rodapé do machado saía cortado | a frase da troca vinha na frente | quando o tamanho muda muito, o rodapé é só: *"weapon: entrou no tamanho dela, 1275 × 1027 px. Para caber: Imagens → Caber no lugar da antiga"* | `04` |
| c | Acertar a escala custava 8 gestos | — | **"Caber no lugar da antiga"**, no menu Imagens e na grade (o *fit* do Spriter): ao trocar, o programa guarda o tamanho do que saiu (imagem ou entidade); o Caber muda a escala do desenho novo para o lado maior ficar igual. Um passo de desfazer; vale na base, e o rodapé diz | `05`, `06z` |

**Um erro meu, pela forma:** marquei o "Caber" como mudança de **pose**; a escala do desenho mora no anexo, que só se relê quando o documento se remonta, e o rodapé disse "× 0,0615" com o machado ainda enorme na cena. Vi na foto, na mesma volta, e o comando passou a ser mudança de **estrutura** (o teste agora confere isso). **Antes de dizer que mudou, olhe a cena, não o rodapé.**

## A forma do defeito do rosto (regra 27): o índice que atravessa arquivo

**Um número que aponta para dentro de uma lista só vale dentro do arquivo da lista.** O `binding.bones` da malha do rosto guardava *"osso 3, osso 2"* — posições na lista de ossos do herói. A exportação copiou os números e levou a skin para outro arquivo, cuja lista de ossos é outra (só o `root`). O número atravessou a fronteira do arquivo e passou a apontar para outra coisa, sem erro nenhum: `3` simplesmente virou "não existe", e o leitor, educado, mandou para o `0`.

**Onde procurar a mesma forma na casa:** todo lugar que **copia** um pedaço de um arquivo para outro e leva junto um **índice** — `binding.bones` (pesos), índices de slot ou de osso em chaves de animação, `drawOrder` por posição, regras que citam ossos por posição, qualquer `ImportarX`/`ExportarX` que use `JSON.parse(JSON.stringify(...))` de um pedaço. A pergunta é sempre a mesma: **este número conta em qual lista?** Se a lista não vai junto, o número tem de virar **nome** na saída e voltar a número na chegada.

**E a metade que escondeu:** o leitor AVISOU (*RIG_UNMET… do binding*), e a frase do Importar filtrava todo aviso que começava com `RIG_UNMET`, porque um deles (o do `rig`) já era dito de outro jeito. Um filtro por **prefixo** engoliu um aviso de outra natureza. Filtro de aviso se faz pelo que o aviso **diz**, não pelo código na frente.

