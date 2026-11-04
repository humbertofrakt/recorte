# As imagens conferidas — lotes 0 e 1 (v32.7) — 06/10/2026

Rodada 44, lotes 0 e 1. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

**A primeira linha, como pedido: o travamento sumiu? SIM.** Nas duas pastas (mão e rino), em *Abrir pasta* e em *Novo projeto*, a página **respondeu na hora** (ver a linha 1).

| | |
|:---|:---|
| Versão montada | **v32.7** (o "Sobre" diz v32.7; o zip `recorte v32.7 2026-10-06.zip` já estava em `backup/versoes/`) |
| Como | `programa/` em porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 18h24 a 18h35, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-44-conferida/lote1/` (6) |
| Material | `exemplo/game/mao` (13 imagens) e `exemplo/game/rino` (12, 586 KB) **lidas do disco** e postas numa **pasta em memória** (o seletor do Windows trocado por falso); o herói de exemplo e a espada para o resto. **Nada foi salvo** |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 4, 5) | **1** (3) | 0 | 5 |

| Linha | Por que pela metade |
|:---:|:---|
| 3 | o **aviso de nome sem par** funciona; **a cena trocar as imagens eu não consegui ver**: o rodapé disse *"nenhuma imagem trocada; N já eram dela (mesmo nome, mesmo lugar)"* e a cena **não mudou**, com a minha pasta falsa |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Não consegui ver a troca de pasta mexer na cena.** Preparei uma subpasta `alt` com **os mesmos nomes** (cores invertidas), pus três imagens da pasta de origem na cena e usei *Trocar pasta de origem…*: ***"A pasta alt virou a origem: nenhuma imagem trocada; 3 já eram dela (mesmo nome, mesmo lugar); 9 imagens novas na aba Imagens."*** **A cena ficou idêntica** (0 pixels de diferença). Repeti com a subpasta **dentro** e **fora** da pasta do projeto: o mesmo. **Pode ser da minha pasta falsa** (ela não distingue "o mesmo arquivo" de "outro arquivo com o mesmo nome"); **peço que alguém confira com pastas de verdade no disco** | 3 | `L1_depois` |
| 2 | *Pequeno.* **O aviso do *Trocar pasta* só nomeia o número**: *"2 não existem lá e ficaram como estavam"*. **Não diz quais dois**: o usuário precisa descobrir quais peças ficaram sem par | 3 | `L1_depois` |
| 3 | *Pequeno.* **O rodapé não fala durante o arrasto**, só depois de soltar. Com a imagem em cima de um osso na cena o rodapé seguiu em *"Nada mudou: o personagem continua aberto"* (a frase de antes); a dica de *onde soltar* só vem **depois do drop** | 5 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | **(Lote 0)** Programa vazio → *Abrir pasta* (ou *Novo projeto*) com `mao` (13 imagens) → aba *Pivôs*: a página responde (< 1 s). Repetir com `rino` (12 grandes). **Medir** | **vi funcionar** | **Medi com um relógio dentro da página** (um temporizador de 50 em 50 ms: se a página trava, aparece uma **lacuna**). **`mao`, *Abrir pasta*:** rodapé *"Pasta mao: 13 imagens, na aba Imagens"*; **maior lacuna 72 ms** ao abrir e **72 ms** na aba *Pivôs*; **resposta ao clique na aba: 2 ms**. **`mao`, *Novo projeto*:** *"Projeto novo na pasta mao, com uma base vazia. 13 imagens…"*; **maior lacuna 64 ms** e **55 ms**; resposta **2 ms**. **`rino`, *Abrir pasta*:** *"Pasta rino: 12 imagens, na aba Imagens"*; **maior lacuna 58 ms** e **76 ms** na aba *Pivôs*; resposta **5 ms**. **Nenhuma lacuna passou de 100 ms** (nenhuma "acima de 300 ms"). A aba *Pivôs* abriu com as 12 miniaturas, o ponto de encaixe e os nove botões. *(O tempo total da ação, com as minhas esperas, não vale: o que vale é a lacuna.)* | `A0_mao_pivos` · `A1_mao_novo_projeto` · `B0_rino_pivos` |
| 2 | Botão direito numa peça que é **entidade** (a espada) → escolher outra imagem: a **cena muda de verdade** | **vi funcionar** | Botão direito na espada (*"Entidade: espada (em weapon)"*): abre a grade ***"Este boneco"*** (as 21 imagens) com *fonte: pasta · objeto*, *Em todas as skins*, *Trazer para a frente*, *Mandar para trás*, *Duplicar*, *Apagar*. Escolhi a **capa vermelha** (`cape_lower`): ***"weapon volta a mostrar a imagem "cape_lower", pelo pivô dela (foi para a base)."*** **A cena mudou**: **107.160 pixels diferentes** num recorte de 270.000 (a espada **sumiu** e uma **capa** apareceu na mão). Histórico: ***"Trocar a entidade pela imagem"***. *`Ctrl+Z`*: ***"Desfeito: Trocar a entidade pela imagem"*** e a espada **voltou** | `E_antes_depois` |
| 3 | *Imagens → Trocar pasta de origem* para uma subpasta com os mesmos nomes: a cena troca as imagens e o rodapé **conta quantas**; se um nome **não tem par exato**, **avisa** | **pela metade** | **O botão** (*"Trocar pasta de origem…"*) tem a dica ***"…o personagem inteiro passa a usar as imagens DELA com os mesmos nomes de arquivo… Um só desfazer. Nome de arquivo repetido em duas subpastas de lá avisa e não troca"***. **O rodapé conta:** ***"A pasta alt virou a origem: nenhuma imagem trocada; 1 já era dela (mesmo nome, mesmo lugar); 11 imagens novas na aba Imagens; **2 não existem lá e ficaram como estavam**."*** **O aviso de nome sem par funciona:** pus na cena `_0008_Plano-de-Fundo` (**que não existe** na subpasta) e `_0007_Camada-4` (que lá se chama `_0007_Camada_4`, **com sublinhado**): **os dois foram contados como *"não existem lá"***, e a `_0000_Camada-1` (nome igual), como *"já era dela"*. **Mas a cena não mudou** (defeito 1) | `L1_depois` |
| 4 | *Abrir pasta* pela aba com um personagem aberto: **pergunta antes** | **vi funcionar** | Com o herói de exemplo aberto, o botão da pasta (*"Abrir pasta do projeto…"*) abre a janela ***"Abrir uma pasta com um personagem aberto: "heroi" está aberto, com 23 slots. O que a pasta nova faz com ele?"*** com **três saídas**: ***Usar como pasta deste personagem…*** (*"O personagem fica aberto. As imagens da pasta entram na aba Imagens, e as de mesmo nome trocam"*) · ***Abrir como projeto novo…*** (*"O personagem de agora fecha… Se houver mudança sem salvar, o programa pergunta antes"*) · ***Deixar como está*** (*"Nada muda"*). Apertei *Deixar como está*: ***"Nada mudou: o personagem continua aberto."*** | `M1_apos_abrir_pasta` |
| 5 | Soltar uma imagem num osso: o rodapé diz **onde soltar** | **vi funcionar** | Soltei a `arm_back` **na linha do osso `shin`** da Árvore: ***"Solte a imagem na linha de um slot: o desenho dele troca por "arm_back". Nesta linha ela não entra."*** (a frase diz **onde** soltar e **o que acontece**). Soltando na **cena**, em cima do boneco: ***"arm_back entrou solta, como arm_back2. Para prender num osso: com ela escolhida, crie o osso — ele pega o desenho."*** | — |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O **tempo** do lote 0 está **bem abaixo** de 1 s mesmo com as **13 e 12 imagens**: a maior lacuna foi **76 ms**. A "travada" que o Diretor descreveu **não aparece mais** nesta medição. Não medi na v32.4/32.5, então **não afirmo que *este* lote a consertou**, só que **hoje não trava** |
| C2 | Na grade ***"Este boneco"*** a miniatura **escolhida** vem com um contorno laranja e há duas fontes (*pasta · objeto*): bom para saber de onde a imagem vem |
| C3 | O `Ctrl+Z` de *"Trocar a entidade pela imagem"* **devolve a espada inteira**: um passo só |
| C4 | A pasta `mao` tem uma subpasta de lixo (`_0000_Camada-1-copiar_tmp5068`) e as 13 imagens incluem os *"-copiar"*: **o programa as lista todas**, sem aviso. Não é defeito, só o material |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As pastas `mao` e `rino` | **li os `.png` do disco** e os pus numa **pasta em memória** (as imagens são as de verdade, a pasta não) | abrir uma pasta de verdade com o seletor do Windows, e o tempo que **o disco** leva para entregar 12 imagens grandes |
| O tempo | um **temporizador de 50 ms dentro da página** (lacuna = travada) | o tempo que **o olho** vê, a barra de progresso, a memória |
| *Trocar pasta de origem* | subpasta **falsa** (`alt`, cores invertidas) | que a cena **troca de verdade** (defeito 1); **peço conferência com pastas de verdade** |
| Arrasto | arrasto de verdade interceptado por protocolo, `dragEnter`/`dragOver`/`drop` mandados por mim | o arrasto com a mão |
| *"Soltar num osso"* | solto **na linha da Árvore** e **na cena**; **não** vi a frase *durante* o arrasto | se existe uma dica ao passar por cima |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
