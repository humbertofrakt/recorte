# As sobras da aba das entidades conferidas (v32.1) — 06/10/2026

Rodada 42, lote 2, 3 consertos + as sobras da aba e a ressalva das partículas. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v32.1** (o "Sobre" diz v32.1; o zip `recorte v32.1 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080, 1440×900 e 1280×720 |
| Hora | 17h06 a 17h13, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-42-conferida/lote2/` (9) |
| Material | o herói, a `espada`, o `mecha`, o `capacete` e o `poder5` numa **pasta em memória** (seletor do Windows trocado por falso); a linha 8 usei também o **herói de exemplo** do próprio programa. **Nada foi salvo** na pasta real |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1, 2, 4, 5, 7) | **3** (3, 6, 8) | 0 | 8 |

| Linha | Por que pela metade |
|:---:|:---|
| 3 | o "skins ▾" **não existe** nos cartões; só o *anima ▾* (o relatório diz o que se vê, como pedido) |
| 6 | a pergunta do slot e o *Pôr no projeto* sem arquivo **vi funcionar**; o **"N avisos" não bate** num dos casos (*2 avisos* na barra, 1 problema na janela) |
| 8 | **em 1440×900 a aba não rola; em 1280×720 rola** (91 px) |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Em 1280×720 a aba Entidades ainda rola.** Com o herói de exemplo e a `espada` (o estado de abertura), **recém-aberto direto em 1280×720**: o corpo da aba tem **185 px** e o conteúdo **276 px** (rola **91 px**). Em **1440×900** não rola (308 e 308). Em 1920×1080 não rola. Pode ser a minha janela emulada: **a medição do projeto talvez use outra moldura**. Mas, **como medi, a linha 8 não fecha em 1280** | 8 | `M_1280_fresco` · `M_1440_hero` |
| 2 | **A Montagem fica uma janelinha** quando a aba aperta. Em 1440×900 a seção *Montagem* tem **63 px** (o conteúdo, 163 px): vê-se **só a barra do `heroi · AQUI`**; a linha `weapon · espada` fica **escondida num rolo interno**. Em 1920×1080 com **três níveis**, a seção tem **91 px** para 398 px de conteúdo: vê-se **uma sobra do cartão do capacete**, e o mecha e o herói ficam **abaixo, no rolo interno**. A Prateleira e o painel *Animações* **ficam à vista** (o que se pediu), mas o preço é que **quase nada da Montagem se lê** sem rolar | 5, 8 | `T_tres_niveis_1920` · `M_1440_hero` |
| 3 | *Pequeno.* **O "N avisos" ainda não bate no caso do slot sumido.** Com a ligação de teste apontando para o slot `mao_e` (que o herói não tem), a barra diz ***"2 avisos — ver"*** e a janela lista ***1 problema*** (*"o slot mao_e não existe mais em heroi…"*). No caso do **arquivo sumido** a barra e a janela **batem** (1 e 1). *(Já vi isso na v31.3; segue.)* | 6 | `V_dois_avisos` |
| 4 | *Pequeno.* **O *Salvar* com a entidade faltando agora salva** (*"Salvo em heroi.bone."*) e **não repete o aviso no rodapé**: a barra continua com *"1 aviso — ver"*. Na v31.1 ele *parava antes de gravar* (lote 6). **Não vi o que foi gravado** no slot da espada (se ficou o nome do arquivo que falta, ou se se perdeu) | 2 | `V_janela_aviso_salvar` |
| 5 | *Pequeno.* **O *skins ▾* não existe** em nenhum cartão (de teste ou do projeto): só o *anima ▾*. As entidades de exemplo (`mecha`, `espada`, `capacete`) só têm a skin `default`; **talvez** o controle só apareça numa entidade com mais de uma skin. **Não consegui provar** com o material que tenho | 3 | `U1_depois_de_por` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Pôr no projeto* para cima: o mecha em `idle` **continua** em `idle` depois de gravar (ou o rodapé diz que perdeu) | **vi funcionar** | Herói dentro do mecha (`body`), *Na cena*, `mecha` com **anima: idle**, *Pôr no projeto*: ***"Mecha entrou em heroi, com Este boneco no body (foi para a base). Agora heroi LEVA mecha: no teste não levava. **Mecha continua tocando idle.** Ctrl+Z volta a teste."*** O cartão do mecha no projeto diz ***"anima: idle ▾"*** (na v31.3 virava *livre*) | `U1_depois_de_por` |
| 2 | *"Problemas do arquivo"* em português, com o nome do arquivo, sem caminho interno | **vi funcionar** | Abri o herói **sem** a `espada.bone`: ***"desenho "sword": falta o arquivo da entidade espada.bone: ela não foi aberta, e o lugar dela fica vazio. Traga espada.bone para a pasta do projeto"***. Para o arquivo que sumiu da montagem: ***"Montagem de teste: falta o arquivo poder5.bone (a peça de teste do slot weapon). A ligação fica, e nada é desenhado no lugar"***. **Sem `/skins/…/uri`, sem *spec 7.11*, sem inglês** (o texto do lote 6 era *"nested skeleton … was not provided; placeholder treated as empty"*) | `V_janela_aviso_salvar` |
| 3 | *"skins ▾"* existe nos cartões de teste (ou saiu do relatório: diga o que vê) | **pela metade** | **Vejo só o *anima ▾*** (*"anima: parada ▾"*, *"anima: idle ▾"*) nos cartões de teste e do projeto; **nenhum *skins ▾*** (defeito 5) | `U1_depois_de_por` |
| 4 | Em 1280×720, a trilha e os cartões dobrados saem **ao redimensionar, sem `Ctrl+Z`** | **vi funcionar** | Montei **capacete › mecha › herói** em 1920×1080 e **só redimensionei a janela para 1280×720**: a aba passou a mostrar a trilha ***capacete › mecha › HEROI*** (o nível aberto em destaque), o cartão do herói e a espada **dobrada** (*"▸ espada · PROJETO"*), **sem `Ctrl+Z` nem redesenho**. (Na v31.3 só saía depois de um *desfazer e refazer*) | `W_720` |
| 5 | Com três níveis em 1920×1080, a Prateleira **não sai da tela**: a aba rola por dentro; o painel *Animações* embaixo **não encolhe** | **vi funcionar** | Com **três níveis**: a **Prateleira fica à vista** (de 429 a 604 px, dentro da aba de 206 a 612 px), a aba **não rola** (406 e 406) e a **Montagem rola por dentro** (91 px de janela, 398 de conteúdo). O painel *Animações* **mantém a altura** (a aba começa em 624 px e a lista mostra *Base — montar*, `idle`, `walk` e `attack`). **Mas:** quase nada da Montagem se lê (defeito 2) | `T_tres_niveis_1920` |
| 6 | Pequenos: a pergunta do slot fala certo (quem entra em quê); *"N avisos"* bate com a janela; *Pôr no projeto* com arquivo faltando avisa **antes** | **pela metade** | **Pergunta:** ***"Em que slot de mecha entra?"*** com ***"Heroi entra no slot body de mecha, no lugar da imagem que está lá"*** (e *arm, hand, weapon, head*): **quem entra em quê, dito certo** (a v31.3 dizia *"O de fora entra…"*). Também para o capacete: *"Mecha entra no slot casco de capacete…"*. **Pôr no projeto sem arquivo:** com o `poder5` em teste, salvo, o `poder5.bone` apagado da pasta e a pasta reaberta, apertei *Pôr no projeto*: ***"Falta o arquivo poder5.bone: gravar faria o projeto apontar para um arquivo que não existe. Traga o arquivo de volta para a pasta, ou desligue a peça."*** e **nada foi gravado** (o cartão segue *TESTE*). **"N avisos":** arquivo sumido: **1 e 1** ✓; **slot sumido: *2 avisos* na barra, 1 problema na janela** (defeito 3) | `S_pergunta_slot` · `P_por_sem_arquivo` · `V_dois_avisos` |
| 7 | A receita da faísca diz como escurecer na *Cor na vida*; a dica da *Abertura* também na caixa | **vi funcionar** | **Porta (menu Partículas → Faísca) e botão (painel *Novo: faísca*):** ***"…Para escurecer: aba Cor, barra Cor na vida — o clique põe as duas pontas; duplo clique na ponta da direita troca a cor"***. **Abertura:** a **caixa** (o campo de número, `180`) **e** o rótulo trazem ***"Abertura p/ cada lado — em graus, de 0 a 180, para cada lado da Direção: 180 solta para todos os lados; com 0 todas saem na mesma linha, numa coluna. Típico: fogo 12, fumaça 20, poeira 60, faísca 180"***. *(A dica da barra *Cor na vida* também ajuda: "clique põe uma cor, … duplo clique troca a cor".)* | — |
| 8 | `medir`: a aba Entidades **NÃO rola** em 1440 e 1280 (a medição voltou a 81/90) | **pela metade** | **Medi eu**, com o herói de exemplo e a `espada` (a abertura): **1440×900: não rola** (308 e 308) ✓. **1280×720: rola** (185 e 276, **91 px**) ✗. **1920×1080: não rola.** Com **três níveis**, em 1280 a aba rola **ainda mais** (265 para 162) | `M_1440_hero` · `M_1280_fresco` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **rodapé do *Pôr no projeto*** agora **diz a animação** (*"Mecha continua tocando idle"*): pedido atendido, e a frase é a que falava de *"no teste não levava"* com um **acréscimo** útil |
| C2 | A frase **"Heroi continua sendo o que você anima."** no rodapé de *ligar para cima* é boa: diz quem é o AQUI depois do gesto |
| C3 | O **"Salvar"** muda de comportamento entre versões (v31.1 parava; v32.1 salva): **eu não sei qual a intenção**; só digo o que vi |
| C4 | O aviso de arquivo sumido da **Montagem** (*"A ligação fica, e nada é desenhado no lugar"*) é honesto e diz o que **fica** e o que **não** fica |

## A rodada 39 (a aba das entidades) está FEITA?

**Quase.** Os dois piores buracos do lote 7 (animação do mecha perdida; trilha só depois de redesenhar) **estão consertados**; os avisos em português, a pergunta do slot e o *Pôr no projeto* sem arquivo **também**. O que ficou:

| O que falta | Por quê |
|:---|:---|
| **A aba rola em 1280×720** | defeito 1: a linha 8 não fecha como medi (talvez diferença de janela: pedir a quem mediu o tamanho da moldura) |
| **A Montagem vira uma janelinha** | defeito 2: com a Prateleira à vista, quase nada da Montagem se lê em 1440 e com três níveis |
| **"N avisos" ≠ janela (slot sumido)** | defeito 3 |
| **"skins ▾"** | defeito 5: não existe; ou sai do relatório, ou falta uma entidade com mais de uma skin para provar |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Seletor de pasta e de arquivo | pasta em memória | Salvar e abrir numa pasta de verdade |
| Arrasto | arrasto de verdade interceptado por protocolo, com `dragEnter`/`dragOver`/`drop` mandados por mim | o arrasto com a mão |
| *Arquivo sumiu* | **apaguei** o `.bone` da pasta em memória e reabri | um arquivo que some do disco |
| *Slot sumido* | **troquei o slot no manifesto por código** | apagar o slot de verdade pelo editor |
| 1280×720 e 1440×900 | **emulação** de janela do Chrome sem janela | um monitor de verdade; a medição do projeto pode usar outra moldura |
| *skins ▾* | só vi os arquivos de exemplo, com a skin `default` | uma entidade com várias skins |
| O que o *Salvar* gravou | **não** abri o `.bone` salvo para ver o slot da espada | que a espada continua no arquivo |
| "Rola" | li `scrollHeight` e `clientHeight` do corpo da aba | o gesto de rolar com a mão |
