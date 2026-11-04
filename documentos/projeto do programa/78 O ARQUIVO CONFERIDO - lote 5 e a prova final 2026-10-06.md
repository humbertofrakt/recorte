# O arquivo conferido — lote 5 e a prova final (v34.3) — 06/10/2026 e 07/10/2026

Rodada 45, lote 5. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v34.3** (o "Sobre" diz v34.3; servi o zip `recorte v34.3 2026-10-06.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 23h52 de 06/10 a 03h03 de 07/10, relógio da máquina (**a casa parou entre 00h04 e 03h00**; o meu Chrome seguiu aberto e retomei de onde estava) |
| Fotos | `backup/fotos-obra/rodada-45-conferida/lote5/` (23) |
| Material | pastas no **armazenamento privado do Chrome** (handles reais de leitura e escrita, **não** do Windows): `exemplo/game` inteira (132 arquivos, para o importar do Spriter), `p_heroi` (`heroi.bone`, atlas, png, `espada.bone`), `p_solto` (só o `heroi.bone`) e `rino` (as **12 imagens** de `exemplo/game/rino`, para a prova final). Os seletores de arquivo e de salvar devolvem essas. **Nada foi gravado no disco.** Instrumentei `alert`/`confirm`/`prompt`: **nenhuma** foi chamada em momento nenhum |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **4** (1, 2, 3, 4) | **1** (5) | 0 | 5 (+ a prova final, linha 6) |

| Linha | Por que pela metade |
|:---:|:---|
| 5 | o **"•" some no `Ctrl+Z`**, o **`Ctrl+O` nomeia a pasta** e o **relatório da exportação diz o nome gravado** (*"rino_0000 (2).png"*); **mas** a janela de avisos mostra **o resumo e, ao lado, 21 linhas curtas** (*"imagem não encontrada: X"*): o resumo **soma**, e não **substitui**; e a frase do `Ctrl+O` **diz que o atlas não está na pasta quando está** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **`Esc` na janela *"A pasta … tem 2 arquivos .bone"* fecha o herói e começa um projeto vazio.** Com o herói aberto e **sem** mudança, *Arquivo → Abrir pasta do projeto…* → `p_heroi` (2 `.bone`): a janela *"Qual abrir?"* pergunta; apertei **`Esc`** (desistir) e o programa **trocou o herói por um projeto vazio** (*"sem nome"*, *"Pasta p_heroi: 1 imagem…"*, árvore com 0 linhas). É o que a última saída (*"Nenhum: começar vazio"*) faz; **`Esc` devia cancelar** (nas outras janelas, `Esc` cancelou: *"Nada mudou…"*). O personagem aberto **sai da tela** sem o usuário ter escolhido isso | 4 | `D0_esc_na_janela_dos_dois_bone` |
| 2 | **O `Ctrl+O` diz que o atlas não está na pasta, e ele está.** Com a pasta `p_heroi` aberta, abri o `heroi.bone` solto de **outra** pasta (`p_solto`): ***"heroi.atlas.json não está na pasta "p_heroi": as imagens de heroi.bone ficaram de fora. Ponha heroi.atlas.json e as imagens dele na pasta e aperte Recarregar"***. **O `heroi.atlas.json` está em `p_heroi`** (4.011 bytes, conferi a lista). A frase **nomeia a pasta** (o que se pedia), mas **afirma uma coisa falsa** e manda pôr o que já está lá | 5 | `G0_ctrl_o_bone_solto` |
| 3 | *Pequeno.* **A janela de avisos tem o resumo e mais 21 linhas curtas.** Abre com ***"21 imagens não estão em atlas nenhum, e os desenhos delas ficam invisíveis: cape_upper, cape_lower, hair, arm_back, forearm_back, hand_back, thigh_back, shin_back e mais 13. Quase sempre é o atlas que não veio junto…"*** e **abaixo** vêm **21 linhas** ***"imagem não encontrada: cape_upper"***, ***"…cape_lower"***… (uma por imagem, curtas); as **linhas longas** de antes (*"skin "default" › desenho "X" › path…"*) estão **recolhidas** sob ***"Ver as 21 linhas, uma por imagem"***. O resumo **substitui** as longas, **não as curtas**. O rodapé da janela: ***"42 problemas, 21 com conserto aqui. O resto é na mão."*** | 5 | `G1_janela_de_avisos` |
| 4 | **Tropeço da prova final: *Abrir recente* oferece o `rino.bone` e ele abre SEM as imagens.** A lista tem **duas** entradas (*"rino.bone"* e *"rino (pasta)"*); a primeira (a primeira da lista, **já escolhida**) abre o `.bone` sozinho: ***"Esta base usa rino.atlas.json, que mora na pasta do projeto, e ela veio sozinha: as imagens ficaram de fora. Para abrir com elas: Arquivo → Abrir pasta do projeto… e escolha a pasta "rino"."*** O certo era a segunda (*"rino (pasta)"*), que abriu tudo (*"Pasta rino: rino.bone reaberto de onde parou"*). O usuário **perde 3 gestos** e lê um aviso. **A frase acerta o remédio** (ele aparece), mas **a lista põe primeiro o que abre pela metade** | 6 | `I1_abrir_recente` · `I2_reabriu_pelo_recente` |
| 5 | *Pequeno.* **O `Salvar como pacote…` e o *Abrir* do pacote não dizem a pasta**: o rodapé do reaberto traz ***"Pacote rino.bonez aberto, com o atlas com as imagens de…"*** (cortado na tela em 1920) e a aba *Imagens* seguiu com ***"Pasta rino · 12 imagens"*** do projeto de antes: ao abrir o pacote **a pasta anterior ficou ligada**. Não afirmo que seja defeito: **a pasta de antes é a do pacote** | 6 | `K0_reabriu_o_pacote` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Importar o `bcp` pela pasta: avisos caem de 28 para 2; nenhuma *"troca de pai/osso"*; numa animação aparecem só as peças dela | **vi funcionar** | *Arquivo → Importar → De outro programa…* → `bcp.scml`: rodapé ***"Importado do Spriter: bcp.bone. **2 avisos**. 91 de 92 imagens do boneco estão na cena. Falta 1: "mao/_0000_Camada-1-copiar_tmp5068"…"*** (eram 87 de 88). A janela traz **2 linhas**: ***"O sprite "_0000s_0001_Camada-633-copiar" tem pivô por chave. Foi usado o pivô da primeira chave de cada imagem; o desenho pode deslizar entre chaves."*** e ***"O Spriter não guarda mesh, pesos nem IK no arquivo…"***; **nenhuma "troca de pai" nem "troca de osso"**. **Base:** o robô inteiro e as armas (*`B0_base`*); **animação `faca`:** **só as facas** (*`B1_faca`*), sem o robô | `A0_depois_de_importar_bcp` · `B0_base` · `B1_faca` |
| 2 | Projeto SEM animação: *Exportar imagem → "Só este quadro"* exporta a pose da base | **vi funcionar** | Projeto novo com 3 imagens e **nenhuma animação**: a janela diz ***"Este arquivo ainda não tem animação: sai a imagem da base, a pose de repouso."***; *Animação* é ***"A base (pose de repouso)"*** e ***"Só este quadro (0 s)"*** **já vem marcado**; saiu ***rino_0000.png***, **1888 × 914 px**, 225.004 bytes. *(O formato vem em **GIF**: para uma imagem é preciso trocar para PNG, 2 gestos.)* | `J0_exportar_sem_animacao` |
| 3 | *Abrir o herói* não herda a pasta do projeto de antes (`Ctrl+S` não grava `heroi.bone` numa pasta alheia) | **vi funcionar** | Com o `bcp` importado (pasta `game` ligada), *Arquivo → Abrir o herói (exemplo)*: título ***heroi.bone***, aba *Imagens* ***"Nenhuma pasta aberta"***; `Ctrl+S` abriu ***"O projeto ainda não tem pasta"*** (escolher / só o `.bone` / cancelar); a pasta `game` **ficou com os 6 arquivos de antes** (sem `heroi.bone`) | `C1_ctrl_s_no_heroi` |
| 4 | Abrir pasta/projeto com mudança não salva: janela do **PROGRAMA** (*Salvar / Descartar / Cancelar*), **nunca** o `confirm` do navegador; *Cancelar* diz no rodapé | **vi funcionar** | Herói aberto, renomeei `hips` (a aba ficou ***"heroi.bone • — Recorte"***): *Abrir pasta do projeto…* → janela ***"heroi.bone tem mudanças não salvas — O que fazer com elas antes de seguir?"*** com ***Salvar e continuar*** (*"Grava como o Ctrl+S, e segue"*), ***Descartar as mudanças*** (*"…se perdem"*) e ***Cancelar*** (*"Nada muda: o arquivo continua aberto, com as mudanças"*). ***Cancelar***: rodapé ***"Nada mudou: heroi.bone continua aberto, com as mudanças"***; **`Esc`** faz o mesmo; **o caminho do *Abrir projeto…*** traz a mesma janela; ***Descartar*** segue para a pergunta seguinte (a dos 2 `.bone`). **`confirm` do navegador: 0 chamadas** (no v33.9 eram 5). Defeito 1 (outra janela) | `E0_janela_mudanca_nao_salva` · `E1_cancelar_diz_no_rodape` |
| 5 | A janela de avisos: o resumo substitui as 21 linhas (recolhidas); `Ctrl+O` nomeia a pasta; o relatório da exportação diz o nome gravado; o *"•"* some no `Ctrl+Z` até o ponto salvo | **pela metade** | **Resumo:** defeito 3 (**21 curtas** ainda visíveis; as longas **recolhidas**). **`Ctrl+O` e a pasta:** ***"…não está na pasta "p_heroi"…"***: **nomeia**, mas **falsa** (defeito 2). **Relatório da exportação:** na 2ª exportação do mesmo quadro o relatório traz ***"Arquivos: rino_0000 (2).png"*** e ***"Pasta: exportar/, dentro da pasta do projeto rino"*** (**o nome gravado**, o certo; na v33.9 dizia o velho); na pasta ficaram `rino_0000.png` e `rino_0000 (2).png`, **225.004 bytes cada**. **O ponto:** renomear `hips` → ***"heroi.bone • — Recorte"***; `Ctrl+Z` → ***"heroi.bone — Recorte"*** (rodapé ***"Desfeito: Renomear. Arquivo salvo."***); `Ctrl+Y` → o ponto **volta**; `Ctrl+Z` → **some**. É o pedido | `G0_ctrl_o_bone_solto` · `G1_janela_de_avisos` · `J2_relatorio_2` · `F0_ponto_do_titulo` |

## A PROVA FINAL — Novo projeto com 12 imagens → arrastar → `Ctrl+S` → fechar → Abrir recente → exportar a pose → pacote e reabrir

Como usuário novo, **só pela tela**. Pasta `rino` (12 imagens). Tempos: a **maior lacuna** do relógio dentro da página (um temporizador de 50 ms), em cada passo.

| # | Passo | Gestos | O que o programa disse | Lacuna |
|:---:|:---|:---:|:---|:---:|
| 1 | *Arquivo → Novo projeto…* (a pasta `rino`) | **2** | ***"Projeto novo na pasta rino, com uma base vazia. 12 imagens na aba Imagens; o Salvar grava rino.bone ali"*** | 71 ms |
| 2 | **Arrastar 3 imagens** para a cena (`01 (1)`, `01 (5)`, `01 (9)`) | **3** | ***"01 (1) entrou solta, como 01 (1). Para prender num osso…"*** (cada uma) | 195 · 83 · 62 ms |
| 3 | `Ctrl+S` | **1** | ***"Salvo em rino.bone. Atlas da pasta gravado ao lado: rino.atlas.json, com 3 imagens em uso."*** (sem janela de pergunta: o projeto já mora na pasta) | 86 ms |
| 4 | **Fechar** (recarreguei a página) | **1** | a página volta ***"sem nome — Recorte"*** | — |
| 5 | *Arquivo → Abrir recente…* → **`rino.bone`** (a 1ª) | **3** | ***"Esta base usa rino.atlas.json… as imagens ficaram de fora…"*** — **tropeço** (defeito 4) | 56 ms |
| 6 | *Arquivo → Abrir recente…* → **`rino (pasta)`** | **3** | ***"Pasta rino: rino.bone reaberto de onde parou"***; **Nenhum aviso**; as 3 imagens na árvore | 92 ms |
| 7 | **Exportar a pose:** *Arquivo → Exportar → GIF, PNG, folha, vídeo…*; formato **PNG** (2 gestos); *Exportar* | **6** | ***"Este arquivo ainda não tem animação: sai a imagem da base"***; ***"Sequência de imagens PNG: 1 quadro de 1888x914, 1 arquivo(s), 225.004 bytes"***; arquivo ***rino_0000.png*** em ***exportar/*** da pasta do projeto | *(não medi)* |
| 8 | **Pacote:** *Arquivo → Exportar → Salvar como pacote…* | **3** | ***"Salvo em rino.bonez. 3 arquivos dentro, 162.356 bytes."*** | 94 ms |
| 9 | **Reabrir o pacote:** *Arquivo → Abrir projeto…* | **2** | ***"Pacote rino.bonez aberto, com o atlas com as imagens de…"*** (cortado); **Nenhum aviso**; as 3 imagens na cena | 55 ms |

### A conta

| O que | Quanto |
|:---|:---:|
| Gestos no total | **24** (cliques e teclas contados um a um; a escolha do formato PNG conta 2) |
| **Sem o tropeço** (passo 5) | **21** |
| Tropeços **do programa** | **1** (o `rino.bone` do *Abrir recente* abre sem imagens, e está **em primeiro**) |
| Tropeços meus | nenhum |
| **O tempo de resposta** | **a maior lacuna foi de 195 ms** (o 1º arrasto de imagem); **todo o resto abaixo de 100 ms**: **nada passou de 200 ms**. Nenhuma pausa que se **sinta** |
| Caixas nativas do navegador | **0** |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O `Ctrl+S` **sem pergunta**, quando o projeto já mora numa pasta, e com o **rodapé que diz o atlas gravado** (*"…com 3 imagens em uso"*): o que o usuário quer ouvir |
| C2 | A palavra **"fechar"** do pedido eu cumpri **recarregando a página**: o programa **não tem** *"Fechar projeto"* no menu *Arquivo* (não procurei outro lugar). Quem fecha a aba e volta cai no mesmo caminho |
| C3 | A janela *"Exportar imagem"* de um projeto **sem animação** é a mais clara que li nestes lotes: **diz o que sai** (*"a imagem da base, a pose de repouso"*) e **já marca** *Só este quadro* |
| C4 | No `bcp` importado, **o número de imagens subiu de 88 para 92** (o rodapé do v33.7 dizia 87 de 88; agora **91 de 92**): o importador acha **mais imagens** do boneco; não sei qual regra mudou |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As pastas | **armazenamento privado do Chrome** (handles reais, **não** do Windows) | abrir e gravar numa pasta do disco pelo seletor do Windows |
| O seletor de salvar e o de abrir arquivo | arquivos no mesmo armazenamento | as caixas do navegador; o nome sugerido |
| *"Fechar"* da prova | **recarreguei a página** | fechar e reabrir o navegador de verdade (o *Abrir recente* guardou o `rino.bone`: por isso sei que o recarregar basta) |
| O tempo de resposta | **temporizador de 50 ms dentro da página** (lacuna = travada) | o tempo que o **olho** vê, a barra de progresso, a memória; **não medi** a exportação da pose (perdi a leitura num erro do meu roteiro) |
| *Abrir recente* | só os **dois** itens da lista (`rino.bone` e `rino (pasta)`) | uma lista com muitos itens |
| O `Esc` da janela dos 2 `.bone` | **uma vez**, com o herói salvo | com mudança não salva (a pergunta *Salvar/Descartar* vem antes) |
| O `bcp` | só o `.scml` (o `.scon` **não**) e **uma** animação a fundo (`faca`) | `andarfaca` e as outras (vi a árvore, **não** a cena) |
| *Salvar e continuar* | **não** apertei | o que ele faz com os dois `.bone` depois |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
