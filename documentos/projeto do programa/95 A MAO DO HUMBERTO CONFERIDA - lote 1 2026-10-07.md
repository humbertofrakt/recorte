# A mão do Humberto conferida — rodada 48, lote 1 (v35.9) — 07/10/2026

Rodada 48, lote 1 (os itens 1, 3 e 6 da ficha; o 4 e o 5, só a frase). Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v35.9** (servi o zip `recorte v35.9 2026-10-07.zip`, extraído fora da pasta; o zip é das 09h29). **Atenção: o "Sobre" diz *"Versão v35.8"* e o `LEIA-ME.txt` do zip também (*"Versao v35.8, montada em 07/10/2026"*)**: o programa é **o código da v35.9** (o pacote de código é outro, `index-BHWE_gE4.js`, não o `index-CDpnp7c3.js` da v35.8), mas **a etiqueta ficou na anterior** (defeito 1) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 09h29 a 09h36, relógio da máquina, 07/10/2026 |
| Fotos | `backup/fotos-obra/rodada-48-conferida/lote1/` (9) |
| Material | o herói, um emissor *Fogo* no `foot_b`; o `heroi.bone` solto numa pasta vazia (42 avisos). A cor "de" **pus em vermelho por programa e desfiz** (o seletor de cor do Windows não abre sem janela). **Nada foi salvo.** **Não rodei `medir`, roteiro nem pesos** |
| O que **não** está nesta versão | o **item 2** (soltar uma pasta do Explorer): o `ESTADO.md` e o `CHANGELOG` da v35.9 **não o mencionam** (só os itens 1, 3 e 6). **Não há passo para o Humberto no relatório ainda**; fica para quando vier |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Fora desta versão | Total |
|:---:|:---:|:---:|:---:|:---:|
| **3** (1, 6a, 6b) | **2** (3, 4) | 0 | **1** (2) | 5 (+1) |

| Linha | Item | Estado |
|:---:|:---|:---:|
| 1 | Cor ao nascer e Cor na vida se falam | **vi funcionar** |
| 2 | Soltar uma pasta do Explorer | **fora desta versão** |
| 3 | A barra *"N avisos"*: clicar abre; os iguais agrupados | **pela metade** |
| 4 | Exportar sem pasta: o rodapé diz para onde foi | **pela metade** (a janela diz, o rodapé não) |
| 6a | O *Texto* do evento com dica | **vi funcionar** |
| 6b | A Ordem em 720 com 3 linhas clicáveis | **vi funcionar** |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **A etiqueta de versão está errada.** *Ajuda → Sobre o Recorte* diz ***"Versão v35.8"*** e o `LEIA-ME.txt` do zip diz ***"Versao v35.8"*** em um zip **v35.9**. É a regra 14 (*"número de versão na hora do fecho"*): o `montar-programa.py` rodou **antes** de o `versao.py` pôr o número | — | — |
| 2 | **Os avisos iguais agrupam; os que só diferem pelo nome, não.** Com o `heroi.bone` solto numa pasta sem atlas: a barra diz ***"42 avisos (21 iguais) — ver"***; a dica e a janela dizem ***"22 tipos de aviso, o pior primeiro: 21 × imagem "…" não está em nenhum atlas; o desenho fica invisível; 1 × imagem não encontrada: cape_upper; 1 × imagem não encontrada: cape_lower; 1 × … e mais 16 tipos"***. **Os 21 "imagem não encontrada: NOME" ficam 21 tipos de um só**, porque o texto leva o nome. No projeto do Humberto (176 avisos) **depende** de os 176 terem texto idêntico (*"170 iguais"* diz o CHANGELOG, **não vi esse arquivo**) | 3 | `C0_janela_avisos` |
| 3 | *Pequeno.* **A janela de avisos começa com dois parágrafos que dizem a mesma coisa**: *"22 tipos de aviso, o pior primeiro: 21 × imagem …"* e *"21 imagens não estão em atlas nenhum, e os desenhos delas ficam invisíveis: cape_upper, cape_lower, hair…"*. O primeiro é longo (cinco linhas) | 3 | `C0_janela_avisos` |
| 4 | **O rodapé da exportação não diz para onde foi.** Sem pasta de projeto, *Exportar → PNG → Só este quadro → Exportar*: o **rodapé** diz ***"Sequência de imagens PNG: 1 quadro de 110x241, 1 arquivo(s), 31.694 bytes."*** (**nenhuma palavra sobre a pasta**). **A janela de relatório** que abre diz ***"Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)"***. A frase **existe**, na janela, **não** no rodapé | 4 | `G2_exportar_depois` |
| 5 | *Pequeno.* **Os seletores de *Cor ao nascer* do Fogo continuam brancos (`#ffffff`)**, num fogo que **queima laranja**. Agora a dica **explica** (*"Ela multiplica a Cor na vida… branco deixa a Cor na vida como está"*) e a barra **mostra o resultado**, mas **quem olha os dois quadradinhos vê branco** | 1 | `A0_fogo_cor` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | Os seletores de *Cor ao nascer* mostram a cor real do fogo, **ou** trocar o "de" muda a barra de *Cor na vida*, **ou** a dica diz como as duas se combinam e a prévia mostra | **vi funcionar** | Emissor *Fogo*, aba *Cor*: *Cor ao nascer (de)* e *(até)* **brancos** (`#ffffff`); *Cor na vida* **degradê amarelo → laranja → vermelho-escuro** (três losangos). **A barra agora tem uma faixa grossa em cima (a Cor na vida) e duas faixas finas embaixo**: a cor da tela com o "de" e com o "a". **Pus "de" em vermelho**: **a faixa fina do "de" ficou vermelha** (li os pixels: de *(245,175,84)* laranja a ***(245,3,3)*** vermelho vivo, e nas outras a mesma conta), **a do "a" não mudou**. **Desfiz** (`#ffffff` de volta). **A dica** do "de": ***"cada partícula sorteia uma cor entre «de» e «a». Ela multiplica a Cor na vida, como no Unity e no Godot: branco deixa a Cor na vida como está; vermelho sobre amarelo dá vermelho. A cor que se vê está nas duas faixas finas de baixo da barra"***. **Defeito 5** (os quadradinhos brancos) | `A0_fogo_cor` · `B1_zoom` |
| 2 | Soltar uma pasta na janela | **fora desta versão** | **Não está na v35.9.** O **passo para o Humberto** (**no relatório da 48**) **não existe ainda**: não tenho o que dizer se está claro | — |
| 3 | A barra *"N avisos — ver"*: clicar abre a janela; 176 avisos iguais viram um resumo agrupado | **pela metade** | **Clicar abre** a janela (conferi: a barra é um botão, ***"Abre a janela de Problemas…"***). **Agrupa os iguais** (21 × *"imagem … não está em nenhum atlas"*) e **põe o pior primeiro**. **Mas** defeitos 2 e 3. *(Não tenho o projeto `pularmachini` do Humberto: o caso dos 176 eu **não vi**.)* | `C0_janela_avisos` |
| 4 | Sem pasta de projeto: *Arquivo → Exportar → "GIF, PNG, folha, vídeo…" → Só este quadro → Exportar*: o rodapé diz para onde foi | **pela metade** | Defeito 4: **a janela diz *Downloads***, **o rodapé não** | `G2_exportar_depois` |
| 6a | O *Texto* da chave de evento com dica | **vi funcionar** | **O rótulo e a caixa**: ***"Texto: uma palavra que o jogo lê junto com o evento (o nome do golpe, uma fala). Vazio: o padrão do formato (sem texto)"*** (a caixa traz também o texto cinza ***"o padrão do formato"***) | — |
| 6b | A Ordem em 720 com 3 linhas clicáveis | **vi funcionar** | Recarreguei em 1280×720 e abri o herói: **3 linhas inteiras** (`hand`, `weapon`, `arma`; lista 81 px, linhas 22 px). **Cliquei** `hand`: ficou **escolhida** (fundo azul); cliquei `weapon`: **a escolha passou para ela**; cliquei `arma` (a pasta): o fundo **passou para a cabeça da pasta**. **As três respondem ao clique** | `F0_ordem_720` · `F2_ordem_720_apos_cliques` |

## O número da altura (lido, não medido)

| O quê | O que vi |
|:---|:---|
| `ESTADO.md`, linha 9 (escrita às 09h28, citando o `medir` das 09h27, *"com a casa vazia"*) | ***"83 de 90 de altura … subiu 2 desde a v34.8"***. Os 7 que rolam: a ficha completa do desenho, a do Comando em 1280, a Exibição, a Malha em 1280 e a Prévia. **Não rodei o `medir`.** |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A conta **"uma cor multiplica a outra"** (como no Unity e no Godot) **está escrita na dica** e **desenhada na barra**: é o que o item pedia, **nas duas formas** |
| C2 | A **dica da barra de avisos** traz o resumo dos tipos (*"22 tipos de aviso, o pior primeiro…"*): quem passa o mouse **vê sem abrir** |
| C3 | O **relatório da exportação** é bom (*"Animação: idle · Só o quadro de 0 s · Quadros: 1, a 30 por segundo · Tamanho: 110 por 241 pixels · Arquivos: heroi_0000.png · Pasta: a de downloads do navegador"*): só **falta** a frase no **rodapé** |
| C4 | O **recarregar a página restaura o rascunho não salvo** (o Fogo que eu pus voltou): **o certo**, mas atrapalha quem prova com a página recarregada |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A cor "de" em vermelho | **valor por programa** + eventos `input`/`change` (o seletor do Windows não abre sem janela) | o seletor de cor do sistema |
| Os 176 avisos | **não** tenho o `pularmachini`: usei o `heroi.bone` solto (**42** avisos, **21** iguais) | o caso dele |
| Soltar pasta do Explorer | **fora desta versão**; **não** prova num Chrome sem janela | — |
| A pasta *Downloads* | **só li a frase**; **não** provei o arquivo (como o Diretor pediu) | onde o PNG foi parar |
| O 1280×720 | **mudei a janela** do Chrome por protocolo e **recarreguei** | o 1280 de verdade |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
