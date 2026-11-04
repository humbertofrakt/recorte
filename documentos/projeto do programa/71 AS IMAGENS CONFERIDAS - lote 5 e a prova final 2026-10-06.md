# As imagens conferidas — lote 5 e a prova final (v33.6) — 06/10/2026

Rodada 44, lote 5. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.6** (o "Sobre" diz v33.6; servi o zip `recorte v33.6 2026-10-06.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 22h43 a 22h54, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-44-conferida/lote5/` (24) |
| Material | **pastas "de verdade" no sentido do navegador**: criei as pastas no **armazenamento privado do Chrome** (as mesmas `FileSystemDirectoryHandle` que o programa recebe do seletor, com leitura e escrita reais, e não o meu falso de antes). **Não são pastas do Windows.** `mao` (as 13 PNG de `exemplo/game/mao`), `mao-invertida` (as mesmas 13 com as cores invertidas, **menos `_0007_Camada-4`**) e `heroi-pasta` (as 19 peças do herói que **cortei do atlas** — **sem a `arm`**, que está girada no atlas e eu não quis errar —, uma `armas/` com os **4 machados de verdade** e uma `inverno/` com **8 peças que pintei de azul**). O herói de exemplo para a prova. **Nada foi salvo no disco.** Nenhuma caixa nativa do navegador (`alert`/`confirm`/`prompt`) foi chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (3, 4, 5) | **2** (1, 2) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | *Fazer a skin de uma pasta* **cobre 8 desenhos** e veste o herói de azul; mas o campo da pasta **abre já escrito com `armadura` e sem nada selecionado**: digitar `inverno` deu ***"armadurainverno"*** e o programa recusou (*"não tem nenhum desenho com estes nomes"*). Só na 2ª tentativa, apagando antes, funcionou |
| 2 | *Exportar skin* **diz o que exige e o que fica de fora**; apagar e **importar de volta** funciona, **mas a skin importada entra em *Feitas* e não veste**: foi preciso mais **um clique no olho** |

## A PROVA FINAL — trocar a arma e vestir a roupa de inverno, só pela tela

Do herói de exemplo aberto com a pasta `heroi-pasta` ligada (*Abrir pasta do projeto… → Usar como pasta deste personagem…*, o preparo, **não contado**).

| # | Passo | Gestos | O que o programa disse | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | **A arma:** botão direito na espada → a grade abre em ***todas*** com os cabeçalhos **raiz, armadura/, armas/, inverno/, entidades** → clique no machado `armas/_0000s_0001_Camada-634-copiar` | **2** (1 botão direito, 1 clique) | ***"weapon volta a mostrar a imagem "armas/_0000s_0001_Camada-634-copiar", pelo pivô dela (foi para a base)."*** A cena mudou. **Tropeço:** o machado vem **enorme**: a imagem tem **1275 × 1027 px** e o herói tem uns **110 × 241**; o desenho **cobre a tela inteira** (`E0_machado_na_mao`). Não o redimensionei | `D1_grade_da_espada` · `E0_machado_na_mao` |
| 2 | **A roupa, 1ª tentativa:** menu *Skins* → *Fazer a skin de uma pasta…* → clique no campo → digitei `inverno` → *Fazer a skin* | **5** (4 cliques, 1 digitação de 7 letras) | **Falhou:** o campo já trazia `armadura` e a digitação foi **acrescentada**: ***"A pasta "armadurainverno" não tem nenhum desenho com estes nomes."*** A janela **fechou**. *(Sem foto: o rodapé foi o que li.)* | — |
| 3 | **A roupa, 2ª tentativa:** menu *Skins* → *Fazer a skin de uma pasta…* → clique no campo → `Ctrl+A` → `inverno` → *Fazer a skin* | **6** (4 cliques, 1 tecla, 1 digitação de 7 letras) | ***"Skin "inverno": A pasta "inverno" cobre 8 desenhos; 12 continuam os de baixo."*** A skin nasceu **ligada** (em *Feitas* e no topo de *Ativas*) e o **herói ficou azul** | `F0_fazer_skin_de_pasta` · `F2_skin_feita` · `G0_skins_apos_inverno` |

### A conta

| O que | Quanto |
|:---|:---:|
| Gestos no total | **13** (10 cliques, 1 tecla, 2 digitações; 14 letras) |
| **Sem o tropeço do passo 2** | **7** (2 da arma + 5 da roupa: 2 menus + `Ctrl+A` + digitar + *Fazer a skin*; o clique no campo é dispensável, o foco já está nele) |
| Tropeços **do programa** | **2**: o campo da pasta com `armadura` sem seleção (custou 5 gestos e uma janela fechada) · o **machado do tamanho da tela** |
| Tropeços meus | nenhum que pese |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O campo "Pasta" de *Fazer a skin de uma pasta* abre com o nome da 1ª pasta (`armadura`) e sem seleção**, e o texto **diz** *"Pastas com imagem aqui: armadura, armas, inverno."* mas **não há lista para escolher**, só um campo de texto. Quem digita acrescenta. É o mesmo mal do nome da skin nova, que no lote 4 foi consertado (agora vem selecionado); **aqui sobrou** | 1 · prova | `F1_digitou_inverno` |
| 2 | **A skin importada não veste.** *Importar skin…* devolveu ***"inverno.bone: a skin "inverno" entrou nesta base, e está na lista de Feitas."*** e o herói **ficou como estava**; o olho em *Feitas* a ligou (***"Skin "inverno" ligada."***) e **8.639 pixels** mudaram no herói. O pedido era *"importar de volta: veste de novo"* | 2 | `I3_depois_de_importar` · `I4_religada` |
| 3 | **O machado vem do tamanho da tela** (1275 × 1027 px contra um herói de ~110 × 241) e **sem aviso de tamanho**: o rodapé diz que mudou *"pelo pivô dela"* e nada sobre a escala | prova | `E0_machado_na_mao` |
| 4 | *Pequeno.* **O *Trocar pasta de origem* não entra no *Histórico* nem se desfaz com `Ctrl+Z`**, no caso em que a cena só passa a mostrar as imagens de lá (nomes iguais). A dica do botão diz ***"Um só desfazer"***. Apertei `Ctrl+Z` e o que voltou foi **a última imagem posta na cena**, não a troca; o painel *Histórico* não tem linha dela. Para voltar, troquei a pasta de novo (e a cena **voltou** os mesmos 27.211 pixels) | 3 | `B2_historico` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Skins → Fazer a skin de uma pasta*: lista a subpasta `inverno/` e, escolhida, *"cobre 8 desenhos"*: a roupa inteira num gesto | **pela metade** | A janela diz ***"Cada desenho de "default" procura, na pasta, uma imagem com o mesmo nome de arquivo. Pastas com imagem aqui: armadura, armas, inverno."*** (**lista** a `inverno/`, **em texto**). Com `inverno` no campo: ***"A pasta "inverno" cobre 8 desenhos; 12 continuam os de baixo."*** A skin ficou ligada e o herói **azul** (`G0`). **A pegadinha do campo:** defeito 1 | `F0_fazer_skin_de_pasta` · `F2_skin_feita` · `G0_skins_apos_inverno` |
| 2 | *Exportar skin* diz o que exige e o que fica de fora (*"8 imagens soltas não vão junto"*); apagar e importar a skin de volta: veste de novo | **pela metade** | **Exportar** (ícone da barra, sem janela): ***"Skin "inverno" gravada com só os desenhos; ela exige de quem a usar 8 ossos e 8 slots com estes mesmos nomes. 8 imagens soltas não vão junto: salve o projeto antes, para elas entrarem no atlas."*** Saiu `inverno.bone` (**4.095 bytes**). **Apagar:** janela ***"Apagar a skin "inverno"? Ela veste 8 slots. As linhas de tempo que só ela tinha saem junto. Ctrl+Z devolve tudo."*** → ***"Skin "inverno" apagada."*** (o herói **voltou ao de antes**). **Importar:** ***"inverno.bone: a skin "inverno" entrou nesta base, e está na lista de Feitas."*** — **não veste** (defeito 2); **um clique no olho** a ligou e o herói **vestiu de novo** (as imagens vieram da pasta, que seguia ligada) | `H0_exportar_skin_janela` · `I0_apagar_skin_pergunta` · `I1_skin_apagada` · `I3_depois_de_importar` · `I4_religada` |
| 3 | *Trocar pasta de origem* com pastas de verdade (`mao` e uma cópia de cores invertidas): a cena troca os pixels; o rodapé diz quais não existem lá | **vi funcionar** | Projeto novo em `mao`, **3 imagens na cena** (`_0000_Camada-1`, `_0002_Camada-3`, `_0007_Camada-4`). *Trocar pasta de origem…* → `mao-invertida`: rodapé ***"A pasta mao-invertida virou a origem: nenhuma imagem trocada; 2 de mesmo nome: a cena mostra as de lá; 1 não existe lá e ficou como estava (_0007_Camada-4)."*** **A cena mudou: 27.211 pixels de 1.116.888 (2,44 %)**: as duas mãos **ficaram de cores invertidas** e a `_0007_Camada-4`, que não existe na cópia, **ficou como era**. Voltando a `mao`, a cena **voltou** (mesmos 27.211 pixels de diferença). **No doc `60` (v32.7) a cena não tinha mexido**; agora mexe. A pasta também mudou (handles reais aqui, o meu falso lá) **e a versão**, então **não sei dizer qual das duas** explica. Defeito 4 | `B0_depois_de_trocar_pasta` · `B2_historico` |
| 4 | Aba *Pivôs*: a dica da miniatura traz pivô **e** tamanho em px; o aviso da raiz cabe numa linha; *"abc"* no X avisa e a janela fica | **vi funcionar** | **Dica da miniatura:** ***"body (76 × 84 px): pivô em 38, 7 px. Clique para acertar"***; sem pivô: ***"face (64 × 66 px): ainda sem pivô. Clique para acertar"***. **O aviso:** ***"Repetir para a pasta: não vale na raiz"*** — **uma linha** (17 px de altura, linha de 16,5). **"abc":** em *Definir pivô…* digitei `abc` no *X* e apertei *Gravar o pivô*: a **janela ficou aberta** com ***"X "abc" não é número. Escreva em px, como 12 ou 12,5"***; o outro campo seguiu em 513,5 | `J0_aba_pivos` · `K2_depois_de_gravar_abc` |
| 5 | Aba *Skins*: a ajuda inteira na dica; *Nova skin* com o nome proposto selecionado, `Esc` não cria; a grade *"todas"* explica a laranja (imagem de agora) e tem cabeçalho *"entidades"* | **vi funcionar** | **Ajuda:** o texto na tela é ***"Skin é uma roupa: o desenho troca"*** (cabe: 258 de 258 px) e a **dica traz a frase inteira** (*"Skin é uma roupa. A base é a mesma, só o desenho muda. Nova skin para criar outra."*). **Nova skin:** o campo abre com `skin` **selecionado** (`selectionStart` 0, `selectionEnd` 4, em foco); **`Esc`**: ***"Nova skin: nada foi criado."*** e a lista **não mudou**; de novo, digitei `inverno` + `Enter`: ***"Skin "inverno" criada…"*** (nome **sem sobra**). **Grade *todas* (e *pasta*):** cabeçalhos ***raiz · armadura/ · armas/ · inverno/ · entidades***, cada um com dica (*"As imagens da subpasta inverno"*); **a laranja:** a miniatura de agora tem a dica ***"inverno/body: é a imagem de agora"*** e o cabeçalho *entidades*, ***"As entidades do projeto. A marcada em laranja é a de agora"***. **A explicação é por dica** (ao passar o mouse): **não há legenda escrita na grade** | `M0_ajuda_skins` · `M1_nome_selecionado` · `M2_criou_inverno` · `D1_grade_da_espada` · `L0_grade_todas_laranja` · `L1_grade_todas_cabecalhos` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | Ao ligar `heroi-pasta` ao herói o rodapé conta tudo: ***"…19 de mesmo nome estão no atlas salvo, e a cena continua com elas (arm_back, blade, body e mais 16); 12 imagens novas na aba Imagens; 1 não existe lá e ficou como estava (arm); 1 nome está repetido lá e NÃO foi trocado: "body" está em body e inverno/body."***: **honesto** e com os nomes |
| C2 | A grade do botão direito tem agora **"Marcar como slot…"** entre as saídas (não testei) |
| C3 | O herói **dobra de cor**, não de forma: a skin `inverno` que eu pintei mexe só nas cores, então a prova não mede o **tamanho** de uma roupa que muda de silhueta |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As pastas | **armazenamento privado do Chrome** (handles reais, mas **não** do Windows) | abrir uma pasta do disco pelo seletor do Windows; nomes, permissões e atalhos do Windows |
| A arte da prova | **eu** cortei as peças do herói do atlas (sem a `arm`) e **pintei** as 8 de azul; usei os machados de `exemplo/game/armas` | a roupa de inverno **verdadeira** do herói (não existe numa pasta de imagens) |
| *Exportar/Importar skin* | seletores de arquivo trocados por arquivos no mesmo armazenamento | a caixa de salvar do navegador; abrir o `inverno.bone` em **outro** boneco |
| A 1ª tentativa da roupa | li o **rodapé**; **não** tenho foto (a foto foi sobrescrita pela 2ª) | o que a tela mostrava naquele instante |
| *Desfazer* | **só** conferi o `Ctrl+Z` do *Trocar pasta* (defeito 4) | `Ctrl+Z` de *Fazer a skin de uma pasta*, de *Apagar skin* e da troca da arma |
| *Marcar como slot…*, *Repetir para a pasta*, *Recarregar a pasta* | **não** conferi | — |
| Usuário novo | **eu**, que conheço o programa | onde alguém de fora hesitaria; o campo `armadura` acertaria também a **quem lê a frase** e digita com atenção? |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
