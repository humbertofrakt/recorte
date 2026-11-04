# A aba das entidades conferida — lote 7 e a prova final (v31.3) — 06/10/2026

Rodada 39b, lote 7, "os casos difíceis" e "o objetivo da rodada". Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido** (li o código só para entender por que o painel não dobrou: ver o defeito 2).

| | |
|:---|:---|
| Versão montada | **v31.3** pelo que tinha o `programa/` às 12h40, quando abri a página. **O `programa/` foi remontado como v31.4 às 12h42**, durante a prova: **não abri o "Sobre"**, então a versão da página é a que o relógio da pasta indica, não uma leitura minha |
| Como | `programa/` em porta própria (5340) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080, e 1280×720 na linha 3 |
| Hora | 12h40 a 12h48, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-39-conferida/lote7/` (16) |
| Material | o herói, a `espada`, o `mecha`, o `poder5` e o `capacete` numa **pasta em memória** (seletor do Windows trocado por falso) |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 2, 4) | **2** (3, 5) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 3 | a trilha e os cartões dobrados **aparecem**, mas só depois que algo redesenha o painel: **redimensionar a janela sozinho não basta** (defeito 2) |
| 5 | a prova final **chegou ao fim** e o resultado se vê, mas com **três tropeços** de um usuário novo e **uma escolha que se perde** ao gravar (defeito 1) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Ao pôr o mecha no projeto, a animação que escolhi para ele some.** No teste pus *"mecha anima: idle"* (e vi os dois se mexerem). Depois de *Pôr no projeto* o cartão do mecha passou a ***anima: livre***. O rodapé não diz isso. Quem montou para o mecha tocar `idle` precisa escolher de novo | 5 | `U7_antes_depois_projeto` · `U8_resultado` |
| 2 | **Redimensionar a janela para 1280×720 não redesenha a aba.** Com a janela já em 720 de altura, os cartões continuaram **todos abertos** (a regra do código lê a altura quando **desenha** o painel, e nada o manda desenhar de novo ao redimensionar). Só depois de **desfazer e refazer** (`Ctrl+Z` `Ctrl+Y`) saiu a trilha e os cartões dobrados. Quem abre o programa já em 720 **não vê** isso; quem diminui a janela no meio do trabalho, sim | 3 | `D3_1280x720_apos_redesenho` |
| 3 | *Pequeno.* **Em 1920×1080 a aba com três níveis não cabe na tela.** Com capacete, mecha e herói em teste (e a espada em cada nível), a **Prateleira fica abaixo da dobra** (a aba tinha cerca de 150 px quando o painel *Animações* de baixo estava com a lista aberta). Para arrastar o mecha até o capacete tive de **arrastar o divisor** entre os painéis, para a aba crescer. Um usuário novo não acha isso | 5 | `N4_nave_1920` |
| 4 | *Pequeno.* **A pergunta do slot fala "de fora".** *"Em que slot de mecha entra? — body: **O de fora entra no lugar da imagem body**"*. Para quem acabou de arrastar o herói para dentro do mecha, *"o de fora"* confunde: o herói é o de dentro | 5 | — |
| 5 | *Pequeno.* **O contador de avisos e a janela não batem.** Com o slot sumido a barra dizia ***"2 avisos — ver"*** e a janela *Problemas do arquivo* listava **1** problema (*"1 problema. Nenhum tem conserto automático"*) | 2 | `B2_avisos` |
| 6 | *Dúvida, não vi o fim.* **Pôr no projeto uma peça cujo arquivo sumiu funciona sem aviso**: rodapé *"Poder5 gravada no slot weapon: agora é do projeto… Espada saiu do slot"*, e o cartão fica ***? poder5 · PROJETO · falta o arquivo***. O projeto passa a apontar para um arquivo que **não existe**. **Não apertei Salvar** depois para ver o que acontece | 1 | `A3_por_no_projeto_sem_arquivo` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Peça de teste cujo arquivo sumiu: cartão *"? nome"* e *"falta o arquivo"*; a barra de avisos diz o nome; nada quebra | **vi funcionar** | Pus o `poder5` em teste no `weapon`, **salvei** (o manifesto guarda a ligação), **tirei o `poder5.bone` da pasta** e reabri pela *pasta do projeto*. Rodapé: ***"O arquivo de entidade poder5.bone está no manifesto, mas não na pasta"***. Cartão: ***? poder5 · TESTE · falta o arquivo*** (borda tracejada); na Prateleira: ***? poder5***. *"1 aviso — ver"* abre: ***"Montagem de teste: falta o arquivo poder5.bone (a peça de teste do slot weapon). A ligação fica, e nada é desenhado no lugar"***. **Nada quebrou**: o herói e a espada ficaram como estavam. *(Reabrir só vale pela **pasta do projeto**; abrir o `.bone` sozinho não lê o manifesto.)* | `A1_arquivo_sumiu` · `A2_avisos` |
| 2 | Slot que sumiu: *"sem lugar · nome"* no topo do cartão | **vi funcionar** | **Falso:** troquei, **por código no manifesto**, o slot da ligação de `weapon` para `mao_e` (que o herói não tem). Reabri pela pasta. No topo do cartão do herói, em itálico: ***sem lugar · mao_e***, e a peça `poder5 · TESTE` logo abaixo; o `weapon` real segue com a espada. A janela diz: ***"o slot mao_e não existe mais em heroi. A peça poder5 ficou sem lugar: arraste-a para outro slot, ou Desligar"*** | `B1_slot_sumiu` · `B2_avisos` |
| 3 | 1280×720 com muitas entidades: cartões nascem dobrados; os de fora viram a trilha *"nave › mecha › HEROI"* | **pela metade** | Montei **capacete › mecha › herói** (o capacete faz de nave). Em 720 de altura, **depois de redesenhar o painel**: a trilha ***capacete › mecha › HEROI*** (o nível aberto em destaque), o cartão do herói (AQUI) aberto e a espada **dobrada** (*▸ espada · PROJETO*). Clicar em ***mecha*** na trilha abriu aquele nível (*mecha · TESTE ▾ · body · heroi · AQUI…*). **Mas não aparece sozinho ao redimensionar** (defeito 2). O painel fica com **cerca de 190 px de altura**: dá para rolar | `D3_1280x720_apos_redesenho` |
| 4 | A Prévia mostra quem está em volta (o mecha), tocando | **vi funcionar** | Aba *Prévia*, em 1920×1080: o desenho mostra o **herói sentado sobre o mecha, com a peça do capacete embaixo**. Dei *tocar* na Prévia e tirei três fotos: **6.259 pixels diferentes** entre a primeira e a segunda, **2.639** entre a primeira e a terceira: **se mexe**. Isso com a *"Na cena"* **desligada** (o rodapé avisou: *"A montagem de teste saiu da cena. Ela continua na aba Entidades e na Prévia"*) | `P0_previa` · `P1_previa_tres` |
| 5 | **PROVA FINAL:** montar o mecha com o boneco dentro e animar os dois, só pela tela, como usuário novo: do arrastar ao Pôr no projeto. Conte os passos e os tropeços; foto do resultado | **pela metade** | Ver abaixo | `U0_antes` … `U8_resultado` |

## A prova final — passo a passo

Partida: o herói já aberto (pasta do projeto, com a `espada` dentro dele). O mecha **fora**, no disco.

| Passo | O que fiz | O que vi |
|:---:|:---|:---|
| 1 | Menu *Entidades → Trazer entidade de fora* → `mecha.bone` | *"mecha.bone entrou como entidade, fechada"*; na Prateleira surge o `mecha` |
| 2 | **Arrastei o cartão do herói (AQUI) até o `mecha` da Prateleira** | abre a pergunta ***"Em que slot de mecha entra?"*** com cinco slots (*body, arm, hand, weapon, head*) |
| 3 | Escolhi **body** (Enter) | *"Heroi entrou em mecha, no slot body: teste. Heroi não leva mecha."* A aba mostra o cartão **`mecha` tracejado, TESTE**, e o herói dentro do `body` |
| 4 | Botão *Na cena* | o desenho **muda**: o herói sobe, o mecha aparece por baixo e a espada grande à direita. *"A montagem de teste está na cena. Ela não entra na animação."* |
| 5 | No cartão do mecha, ***anima: parada ▾*** | abre três escolhas: ***parada · a de quem recebe · idle*** |
| 6 | Escolhi **idle** | *"Mecha toca idle (teste). O arquivo não muda."* |
| 7 | *Tocar* (o herói já estava com o `idle` aberto) | **os dois se mexem**: a caixa do herói inclina e volta, a espada do mecha muda de ângulo (duas fotos, `U5_tocando_duas`) |
| 8 | **Pôr no projeto** | *"Mecha entrou em heroi, com Este boneco no body (foi para a base). **Agora heroi LEVA mecha**: no teste não levava. Ctrl+Z volta a teste."* O cartão do herói ganha o `mecha` por dentro, **PROJETO**, com a espada dele |

**Resultado:** **8 passos** (2 deles são o mesmo gesto de menu; 1 é o arrasto). **Peças no mesmo lugar** antes e depois de *Pôr no projeto* (diferença de pixels de **4,0 %** do recorte, que é a **régua e a grade**, não a personagem; foto `U7_antes_depois_projeto`). Tocando já no projeto, **os dois seguem se mexendo** (11.590 pixels diferentes entre dois instantes). Com *Ctrl+Z* **voltou a teste** (a ligação, com o mecha tocando `idle`: a escolha **volta**; o que se perde é só ao gravar, defeito 1).

**Os três níveis (acrescentei, para a linha 3):** trazer o `capacete` (1 passo), arrastar o cartão do mecha até ele (1), escolher o slot `casco` (1): *"Mecha entrou em capacete, no slot casco: teste. Heroi não leva capacete. Heroi continua sendo o que você anima."*

### Os tropeços de um usuário novo

| # | Tropeço |
|:---:|:---|
| T1 | **O cartão do mecha nasce "parada".** Depois de *Na cena* o mecha **não se mexe** até eu escolher *idle*. Não há aviso dizendo *"o mecha está parado: escolha o que ele toca"*; o rodapé diz só que *"ela não entra na animação"* |
| T2 | **A pergunta do slot** (*"O de fora entra no lugar da imagem body"*): confunde quem pôs o herói para dentro (defeito 4) |
| T3 | **A escolha se perde ao gravar** (defeito 1) e o rodapé não avisa |
| T4 | **Com três níveis não cabe** em 1920×1080: a Prateleira some abaixo da dobra e o painel de baixo come a aba (defeito 3) |
| T5 | Cliquei **duas vezes numa aba** achando que recolhia o painel: abriu *a espada por dentro* (*"Animando espada por dentro: idle. heroi fica à vista, parado"*). Voltei clicando na animação do herói (*"espada voltou a ser entidade em heroi, dirigida pela faixa"*). Foi **meu** engano de clique, mas mostra que o modo *por dentro* é fácil de entrar sem querer |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **Reabrir com a peça de teste só funciona pela *pasta do projeto*.** Abrir o `.bone` pelo *Abrir projeto* **não** lê o manifesto, e as ligações de teste **não voltam**. É assim no código (o manifesto só entra pela pasta). A frase do plano `22` (*"volta ao reabrir"*) vale só para a pasta |
| C2 | Os **avisos** são claros e nomeiam o arquivo e o slot, em português, sem caminho interno (diferente do aviso de *Salvar*, do lote 6) |
| C3 | O **desenho do mecha**, com o herói por cima, **parece dois heróis empilhados** (o mecha de exemplo é uma figura humana): isso é do arquivo de exemplo, não do programa |

## A rodada 39 está FEITA?

**Quase.** O objetivo (montar o mecha com o boneco dentro, animar os dois e gravar **só pela tela**) **se cumpre em 8 passos**, e os casos difíceis dão aviso claro em vez de quebrar. O que ficou:

| O que falta | Por quê |
|:---|:---|
| A **animação do mecha** se perde ao *Pôr no projeto* | defeito 1: o rodapé devia dizer, ou a escolha devia ir junto |
| A **trilha e as dobras** ao **redimensionar** a janela | defeito 2: só aparecem depois de redesenhar o painel |
| **Três níveis em 1920×1080** | defeito 3: a Prateleira sai da tela |
| Pôr no projeto **com o arquivo faltando** | defeito 6: falta eu ver o que o *Salvar* faz depois |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo | pasta em memória | Salvar e abrir numa pasta de verdade |
| Arrasto | arrasto de verdade interceptado por protocolo, com `dragEnter`/`dragOver`/`drop` mandados por mim | o arrasto com a mão |
| *Arquivo sumiu* (linha 1) | **apaguei** o `poder5.bone` da pasta em memória e reabri | um arquivo que some do disco |
| *Slot que sumiu* (linha 2) | **troquei o slot no manifesto por código** | apagar o slot de verdade pelo editor |
| *1280×720* | emulação de janela | um monitor de verdade |
| A versão | pela data do `programa/` (v31.3 às 12h40); **o "Sobre" não foi aberto**, e a pasta virou **v31.4 às 12h42** | que a página era exatamente a v31.3 |
| "O mecha parece dois heróis" | minha leitura de uma foto | o que o Humberto acharia |
| Telas | 1920×1080 e 1280×720; 1440×900 não | — |
