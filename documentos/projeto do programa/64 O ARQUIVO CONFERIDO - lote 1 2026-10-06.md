# O arquivo conferido — lote 1, o Salvar diz a verdade (v33.1) — 06/10/2026

Rodada 45, lote 1. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.1**. **Atenção:** o `programa/` da pasta **já era a v33.2** quando comecei (22h01). Tirei a **v33.1 do zip** `recorte v33.1 2026-10-06.zip`, servi à parte, e o "Sobre" disse **v33.1** |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 22h01 a 22h09, relógio da máquina, 06/10/2026 (a casa tinha parado das 19h07 às 22h00) |
| Fotos | `backup/fotos-obra/rodada-45-conferida/lote1/` (8) |
| Material | o herói de exemplo e os arquivos de `formato/exemplos` (`heroi.bone`, atlas, png, `espada.bone`), numa **pasta em memória** (seletor de pasta e de arquivo trocados por falsos; o de *Salvar* grava em memória). **Nenhuma caixa nativa do navegador** (`alert`/`confirm`/`prompt`) foi chamada em momento nenhum (instrumentei as três). Nada foi gravado no disco |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1 a 5) | 0 | 0 | 5 |

## Os defeitos

Nenhum que pare o uso. Só pequenos:

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **O caminho do menu e o do botão da aba não se comportam igual.** Com o herói de exemplo aberto, *Arquivo → Abrir pasta do projeto…* com uma pasta **sem imagens** **trocou o herói por um projeto vazio ("sem nome") sem perguntar** (rodapé: *"A pasta pasta-nova não tem imagens. Ponha PNGs nela e aperte Recarregar"*). O botão da aba *Imagens* **pergunta** (*"Abrir uma pasta com um personagem aberto…"*, lote 1 da rodada 44). O herói não tinha mudança sem salvar, então **nada se perdeu**; mas **o aviso do menu não diz que o herói saiu** | 5 | — |
| 2 | *Pequeno.* **A frase de "falta o atlas" manda fazer o que já se fez.** Abri o projeto com a pasta já aberta (que não tinha o atlas): ***"Esta base usa heroi.atlas.json, que mora na pasta do projeto, e ela veio sozinha: as imagens ficaram de fora. Para abrir com elas: Arquivo → Abrir pasta do projeto… e escolha a pasta "heroi-pasta""***. **Diz o que falta** (certo), **mas o remédio é o que eu acabara de fazer**; o que falta de verdade é **pôr o `heroi.atlas.json` dentro da pasta**, e a frase não diz isso | 5 | `O0_aviso_sem_atlas` |
| 3 | *Pequeno.* **Ao abrir o `.bonez` o rodapé fica em *"Arquivo salvo."*** sem frase própria (*"Abriu heroi.bonez: 1 base e 1 entidade"*): quem abre um pacote **não lê** que a espada veio dentro; só vê na aba *Entidades* | 4 | `M1_abriu_pacote_do_zero` |
| 4 | *Pequeno.* **Com o atlas faltando, a janela de avisos tem 42 linhas** (*"skin default › desenho X › path: imagem X não está em nenhum atlas…"*), uma por desenho, **todas dizendo o mesmo**; o título diz *"42 problemas, 21 com conserto aqui. O resto é na mão"*. A **causa** (o atlas) está na frase do rodapé, **não no topo da janela** | 5 | `O0_aviso_sem_atlas` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Ao abrir o programa, o rodapé diz *"Arquivo ainda não salvo."* | **vi funcionar** | Página recém-aberta, nenhuma ação: rodapé ***"Arquivo ainda não salvo."*** (e o título do projeto, *"sem nome"*). Antes (v33.0 e anteriores) dizia *"Arquivo salvo."* | `A0_ao_abrir` |
| 2 | *Salvar* com avisos no arquivo: a janela é do programa, em português; nenhuma caixa do navegador em inglês | **vi funcionar** | Abri o herói **sem** a `espada.bone` (*"1 aviso — ver"*) e dei `Ctrl+S`: janela do programa ***"Salvar com avisos?"***: *"O arquivo tem 1 aviso. Ele abre do mesmo jeito, e os avisos voltam ao abrir."* com a frase do aviso (*desenho "sword": falta o arquivo da entidade espada.bone…*) e dois botões, ***Salvar mesmo assim*** e ***Voltar sem salvar***. ***Voltar sem salvar:*** rodapé *"Salvar: parou antes de gravar, porque heroi.bone tem 1 problema. Nada foi gravado"* (o registro de gravação **vazio**). ***Salvar mesmo assim:*** *"Salvo em heroi.bone. Não deu para levar espada.bone: não está aberto no programa."* (gravou **só** o `heroi.bone`). **Nenhuma chamada** a `alert`, `confirm` ou `prompt` | `N0_salvar_com_aviso` |
| 3 | Salvar o herói numa pasta: a pasta recebe `heroi.bone`, `heroi.atlas.json`, `heroi.png` e `espada.bone`; reabrir a pasta não dá aviso | **vi funcionar** | Herói de exemplo (sem pasta) → `Ctrl+S` → janela ***"O projeto ainda não tem pasta"*** → *Escolher a pasta do projeto…* (uma pasta vazia). Rodapé: ***"Salvo em heroi.bone. Levei para a pasta pasta-nova o que o .bone cita e estava fora dela: heroi.atlas.json, heroi.png, espada.bone. O manifesto do projeto gravado na pasta."*** O registro de gravação: **`heroi.bone` (48.498 bytes), `heroi.atlas.json` (3.773), `heroi.png` (29.295), `espada.bone` (3.632) e `manifest.json` (303)**; a pasta ficou com os **cinco**. **Reabri** (*Arquivo → Abrir pasta do projeto…*): ***"Pasta pasta-nova: projeto com 1 base e 1 entidade reaberto, em foco heroi.bone"***, barra ***"Nenhum aviso"***, a árvore com os 52 itens | `G0_salvou_na_pasta` · `H0_reabriu_pasta` |
| 4 | Salvar como pacote (`.bonez`): o pacote leva a espada; reabre sem aviso | **vi funcionar** | *Arquivo → Exportar → Salvar como pacote…*: rodapé ***"Salvo em heroi.bonez. 4 arquivos dentro, 37.215 bytes."***; o seletor de arquivos recebeu o nome `heroi.bonez` e o tipo *Pacote Recorte*. **Abri o zip por fora:** `mimetype`, `manifest.json`, `heroi.bone` (48.504), `heroi.atlas.json` (3.773), `heroi.png` (29.295) e **`espada.bone` (5.852)**; o manifesto lista `skeletons: [heroi.bone, espada.bone]`, `atlases`, `images` e a entidade `espada.bone`. **Reabri o `.bonez` num programa novo** (*Abrir projeto…*): título ***heroi.bonez***, **52 itens na árvore**, aba *Entidades* com a **espada (PROJETO, anima: idle)**, barra ***"Nenhum aviso"***, rodapé *"Arquivo salvo."* | `L0_pacote` · `M1_abriu_pacote_do_zero` |
| 5 | Pasta sem atlas: ao abrir, o programa diz o que falta; *Salvar como* sem pasta pede a pasta | **vi funcionar** | **Sem atlas:** ***"Esta base usa heroi.atlas.json, que mora na pasta do projeto, e ela veio sozinha: as imagens ficaram de fora. Para abrir com elas: Arquivo → Abrir pasta do projeto… e escolha a pasta "heroi-pasta""*** (diz **o arquivo que falta**; defeito 2: o remédio é redondo). **Salvar como sem pasta:** herói de exemplo, *Arquivo → Salvar como…*: abriu a mesma janela ***"O projeto ainda não tem pasta"*** (*Como no Spriter, o projeto mora na pasta das imagens. Escolha a pasta, e o Salvar grava ali.*) com ***Escolher a pasta do projeto…***, ***Salvar só o arquivo .bone…*** e ***Cancelar*** (*"Nada é salvo"*); **o seletor de arquivo do navegador não foi chamado** antes da escolha | `O0_aviso_sem_atlas` · `P0_salvar_como_sem_pasta` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O herói de exemplo, **sem pasta**, ao *Usar como pasta deste personagem…* com uma pasta **sem imagens**, diz ***"A pasta pasta-nova não tem nenhuma imagem com os nomes deste personagem. Nada mudou."*** e **não prende a pasta** (a aba segue *"Nenhuma pasta aberta"*): coerente. Só no *Salvar* ele pede a pasta |
| C2 | *Salvar como…* com o projeto **já numa pasta** não abriu a janela: foi direto ao seletor de arquivo do navegador, para **um `.bone`** (*suggestedName: heroi.bone*), e disse ***"1 corpo e o manifesto do projeto baixados: salve o .bone dentro da pasta do projeto para irem juntos."*** **Avisa**, mas deixa **o atlas e a espada para trás** (só um `.bone` e o manifesto saíram) |
| C3 | O rodapé de *Salvar* na pasta **enumera o que levou** (*heroi.atlas.json, heroi.png, espada.bone*): é a frase mais clara da casa |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| Pastas e arquivos | **em memória** (os arquivos de verdade, lidos do disco; a pasta, não) | gravar numa pasta do disco, e o que o Windows faz com nomes e permissões |
| O seletor de salvar | um falso que entrega um arquivo em memória | a caixa de salvar do navegador |
| "Nenhuma caixa em inglês" | **instrumentei** `alert`/`confirm`/`prompt` e **nenhuma** foi chamada | as caixas que o navegador abre **sozinho** (a de **escolher arquivo/pasta**, que o falso substituiu) |
| A versão | **v33.1 tirada do zip**; o `programa/` já era a **v33.2** | a v33.2 |
| O `.bonez` | abri o zip por fora e **reabri o pacote** | outro leitor (Godot, Construct) |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
