# A mão do Humberto conferida — rodada 48, lote 3 (v36.1) e o veredito — 07/10/2026

Rodada 48, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v36.1** (servi o zip `recorte v36.1 2026-10-07.zip`, extraído fora da pasta; o zip é das 09h48). **O "Sobre" diz *"Versão v36.1"* e o `LEIA-ME.txt` do zip diz *"Versao v36.1, montada em 07/10/2026"*** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 09h49 a 09h52, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-48-conferida/lote3/` (4) |
| Material | o herói; o `heroi.bone` solto numa pasta vazia (43 avisos); a exportação de um PNG **sem** pasta de projeto e **com** a pasta `p_vazia`. **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos**: a altura **li** no `ESTADO.md` |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (0, 1, 2, 3, 4) | 0 | 0 | 5 |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 0 | O Sobre e o LEIA-ME dizem v36.1 | **vi funcionar** |
| 1 | Os 21 *"imagem não encontrada"* são um tipo; a janela abre com um parágrafo | **vi funcionar** |
| 2 | Depois de exportar sem pasta, o rodapé diz a pasta | **vi funcionar** |
| 3 | A Ordem em 720: 3 linhas inteiras de 28 px ou mais | **vi funcionar** (29 px) |
| 4 | O doc `89` diz *"para a cena"* no passo da pasta solta | **vi funcionar** |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 0 | O Sobre e o LEIA-ME dizem a versão certa | **vi funcionar** | *Ajuda → Sobre o Recorte*: ***"Versão v36.1"***; `programa/LEIA-ME.txt` do zip: ***"Versao v36.1, montada em 07/10/2026"***. **Acabou a etiqueta uma atrás** (docs `95` e `96`) | — |
| 1 | Os 21 *"imagem não encontrada: NOME"* são UM tipo com os nomes dentro; a janela abre com um parágrafo | **vi funcionar** | `heroi.bone` solto numa pasta sem atlas: a barra diz ***"43 avisos (21 iguais) — ver"***. A dica e a janela: ***"3 tipos de aviso, o pior primeiro: 21 × imagem "…" não está em nenhum atlas; o desenho fica invisível: cape_upper, cape_lower, hair, arm_back, forearm_back e mais 16; 1 × falta o arquivo da entidade espada.bone…; 21 × imagem não encontrada: cape_upper, cape_lower, hair, arm_back, forearm_back e mais 16"***. **Eram 23 tipos na v36.0; agora 3**, e **o parágrafo repetido (*"21 imagens não estão em atlas nenhum…"*) saiu**. Abaixo do parágrafo há **um item em destaque** (*desenho "sword": falta o arquivo da entidade espada.bone… Traga espada.bone para a pasta do projeto*) e a dobra ***"Ver as 42 linhas, uma por imagem"***. *(O aviso da entidade aparece **duas vezes**: dentro do parágrafo e no item. Pequeno.)* | `C0_janela_avisos` |
| 2 | Depois de exportar sem pasta, o RODAPÉ diz a pasta | **vi funcionar** | Recarreguei, abri o herói de exemplo (**sem** pasta), *Arquivo → Exportar → GIF, PNG, folha, vídeo… → PNG → Só este quadro → Exportar*, fechei a janela: o **rodapé** diz ***"Sequência de imagens PNG: 1 quadro de 110x241, 1 arquivo(s), 31.694 bytes. Foi para Downloads (Ctrl+J mostra)."*** **Inteiro** (799 px de texto em 799 de faixa, sem *"…"*). **Com** a pasta `p_vazia` aberta, o mesmo exportar diz ***"… Foi para exportar/, na pasta p_vazia."***. *(A pasta Downloads em si, **não** provei, como o Diretor pediu.)* | `B0_rodape_exportar` · `B0_exportar_depois` |
| 3 | A Ordem em 720: 3 linhas inteiras de 28 px ou mais | **vi funcionar** | Recarreguei em 1280×720 e abri o herói: lista **89 px**, **3 linhas inteiras de 29 px** (`hand`, `weapon`, `arma`), a quarta de fora. **Cliquei nas três**: `hand` ficou **escolhida**; `weapon` **passou a escolhida** (e a ficha do `weapon` abriu em *Propriedades*); `arma` (cabeça da pasta) **mudou o fundo**. A **barra** da Ordem tem **seis botões de 28×28 px**, e a **ponta *"FRENTE ↓"*** foi para a **barra**. **Lê-se** (nome em negrito, miniatura, *"entidade espada"*, *"1 peça"*) | `C1_ordem_720_cliques` |
| 4 | O doc `89` diz *"para a cena"* | **vi funcionar** | A linha 2 de *"07/10 — a rodada 48"*: ***"arrastar a pasta `exemplo/game/mao` do Explorer para a cena e soltar: o seletor do Windows não abre; a aba Imagens mostra "Pasta mao", e o rodapé diz "A pasta mao abriu como projeto, pelo arrasto". Se o Chrome pedir "permitir editar?" ao Salvar, é a licença de gravar: uma vez só"***. **É claro**: diz **onde soltar**, **o que ele vê** (a aba, o rodapé) e **o aviso do Chrome** | — |

## O número da altura (lido, não medido)

| O quê | O que vi |
|:---|:---|
| `ESTADO.md`, linha 9 (09h48, citando o `medir` das 09h48, *"com a casa vazia"*) | ***"83 de 90 de altura … subiu 2 desde a v34.8"***: **igual à v35.9**. Os 7 que rolam: a ficha completa do desenho, a do Comando em 1280, a Exibição, a Malha em 1280 e a Prévia. **Não rodei o `medir`.** |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | **Os avisos ficaram curtos de verdade**: de 23 tipos a 3; o que importa (*21 × sem atlas*, *1 × falta a entidade*, *21 × não encontrada*) cabe em **uma olhada** |
| C2 | **A pasta do exportar mudou com o contexto**: *"Foi para Downloads (Ctrl+J mostra)"* sem projeto; *"Foi para exportar/, na pasta p_vazia"* com projeto: **o rodapé sempre diz onde**, o que o Humberto pediu |
| C3 | **A Ordem em 720** tem **a mesma lista de antes, mais legível**: a barra de 28 px **comeu** a ponta *"FRENTE"* (agora *"FRENTE ↓"* ao lado dos botões), e as linhas passaram a **29** |
| C4 | A *"Ver as 42 linhas, uma por imagem"* **fala de 42** e a janela de **43 problemas**: o 43º é o da entidade (que **não** é *por imagem*): coerente, **mas** quem soma estranha |

## O veredito: a rodada 48 está FEITA?

**Sim, no que um Chrome sem janela alcança.** Do que a ficha pede, está **visto**: a Cor ao nascer e a Cor na vida se falam (v35.9, doc `95`), os avisos agrupam e o pior vem primeiro (v35.9 e v36.1), o exportar sem pasta diz a pasta no rodapé (v36.1), o *Texto* do evento tem dica (v35.9) e a Ordem em 720 tem três linhas de 29 px (v36.1). **O que fica só para a mão dele** (e **não** se prova aqui):

| # | O que | Como ele fecha |
|:---:|:---|:---|
| 1 | **Soltar a pasta `exemplo/game/mao` do Explorer** (v36.0) | o passo está no `89`, linha 2 da rodada 48 |
| 2 | **Os 176 avisos do `pularmachini`** | abrir a janela de Problemas e dizer a **primeira linha** (a rodada não viu o projeto; **eu também não**) |
| 3 | **O seletor de cor do Windows** (a cor "de" do Fogo) | eu pus o vermelho **por programa** |
| 4 | **O PNG em Downloads** | **Ctrl+J** |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Soltar uma pasta do Explorer | **não** provei: sem janela, sem Explorer | o item 1 da tabela acima |
| Os avisos | o `heroi.bone` solto: **43** avisos, **21** iguais | o `pularmachini` (**176**) |
| A pasta *Downloads* | **só li a frase** | onde o PNG caiu |
| O 1280×720 | **mudei a janela** do Chrome por protocolo e **recarreguei** | o 1280 de verdade |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
