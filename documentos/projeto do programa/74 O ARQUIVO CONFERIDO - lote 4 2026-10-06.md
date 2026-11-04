# O arquivo conferido — lote 4, abrir, soltar e voltar falam claro (v33.9) — 06/10/2026

Rodada 45, lote 4. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.9** (o "Sobre" diz v33.9; servi o zip `recorte v33.9 2026-10-06.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 23h13 a 23h19, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-45-conferida/lote4/` (20) |
| Material | pastas no **armazenamento privado do Chrome** (handles reais, **não** do Windows): `p_vazia` (sem nada), `p_heroi` (`heroi.bone`, atlas, png, `espada.bone`; **sem manifesto**), `p_dois` (`heroi.bone` e `mecha.bone` + atlas + png), `p_solto` (só o `heroi.bone`, sem atlas) e `p_novo` (vazia, para o *Salvar como*). Os arquivos são os de `formato/exemplos`. Os seletores de arquivo e de pasta devolvem essas; o de salvar grava no mesmo armazenamento. **Nada foi gravado no disco.** Instrumentei `alert`/`confirm`/`prompt` |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **5** (1, 3, 4, 5, 6) | **1** (2) | 0 | 6 |

| Linha | Por que pela metade |
|:---:|:---|
| 2 | a janela de avisos **traz as 21 imagens numa linha**; mas **um `.bone` solto com a pasta aberta** diz *"escolha a pasta onde está o heroi.bone"*, que **não nomeia a pasta aberta**: não vi frase que diga *qual* é a pasta |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | **Com mudança não salva, o programa abre uma caixa NATIVA do navegador.** Ao abrir uma pasta (ou um projeto) com o `heroi.bone` modificado (um empurrão de seta, desfeito com `Ctrl+Z`), o programa chamou ***`confirm("Este arquivo tem mudanças não salvas. Continuar mesmo assim?")`***: **5 chamadas** nas aberturas de pasta e de projeto desta sessão. **Não é a janela do programa** (as outras perguntas são, com botões nomeados). Na minha prova a caixa foi respondida pelo meu instrumento (primeiro *"não"*, e a abertura **não aconteceu**, sem outro aviso: a pasta parecia não responder; depois *"sim"*). Para um usuário a caixa é a do Chrome | 1 | — |
| 2 | *Pequeno.* **O relatório do 2º *Exportar* diz o nome velho.** Com *Só este quadro* duas vezes: a linha ***"Arquivos: heroi_0000.png"*** **continua** (sem o *(2)*); o aviso certo vem no fim ***"Já havia heroi_0000.png lá: este saiu como heroi_0000 (2).png, e o de antes ficou como estava"***, e o **rodapé** não diz nada do nome novo | 6 | `J1_relatorio_2` |
| 3 | *Pequeno.* **O ponto do título fica depois de desfazer tudo.** Com o `heroi.bone` aberto, empurrei um osso (a aba virou ***"heroi.bone • — Recorte"***) e dei `Ctrl+Z`: o ponto **ficou**. Pode ser de propósito (o desfazer também conta como mudança); só aviso | 5 | — |
| 4 | *Pequeno.* **A frase do `.bone` solto não nomeia a pasta** (ver a linha 2): *"Esta base usa heroi.atlas.json, que mora na pasta do projeto, e ela veio sozinha: as imagens ficaram de fora. Para abrir com elas: Arquivo → Abrir pasta do projeto… e escolha a pasta onde está o heroi.bone."* É **melhor** que a de antes (que mandava abrir a pasta que já se tinha aberto: doc `64`, defeito 2), mas **não diz qual** | 2 | `D2_bone_solto_com_pasta_aberta` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Arquivo → Abrir pasta do projeto* com uma pasta **sem imagens** e um personagem aberto: pergunta antes de trocar | **vi funcionar** | Herói aberto, pasta `p_vazia`: janela ***"A pasta p_vazia está vazia"***: ***"Ela não tem imagens nem projeto. Abrir a pasta fecha heroi e começa um projeto vazio."*** com ***Abrir a pasta vazia*** e ***Deixar como está***. **Deixar como está:** ***"Nada mudou: heroi continua aberto"*** (a árvore com as mesmas 44 linhas). **Abrir a pasta vazia:** o herói saiu e o rodapé disse ***"A pasta p_vazia não tem imagens. Ponha PNGs nela e aperte Recarregar"***; a aba *Imagens* ficou ***"Pasta p_vazia · 0 imagens"***. *(Defeito 1: com mudança não salva, antes disso, a caixa nativa)* | `A0_abrir_pasta_sem_imagens` · `A1_deixou_como_estava` |
| 2 | A janela de avisos lista as 21 imagens numa linha; um `.bone` solto com a pasta aberta diz a pasta | **pela metade** | Abri o `heroi.bone` **sem atlas** (de `p_solto`): barra ***"42 avisos — ver"***; a janela ***"Problemas do arquivo"*** abre com ***"21 imagens não estão em atlas nenhum, e os desenhos delas ficam invisíveis: cape_upper, cape_lower, hair, arm_back, forearm_back, hand_back, thigh_back, shin_back e mais 13. Quase sempre é o atlas que não veio junto: abra a pasta onde ele está, ou ponha o atlas e as imagens na pasta do projeto."***: **as 21 numa linha**, com a causa e o remédio. **Abaixo** seguem as **21 linhas, uma por desenho** (*"… › path: imagem "X" não está em nenhum atlas; o desenho fica invisível"*, com *Ir para…* e *Trocar imagem…*): o resumo veio **somar**, e não **substituir**. **O `.bone` solto**: defeito 4 | `C0_janela_de_avisos` · `D2_bone_solto_com_pasta_aberta` |
| 3 | Abrir um `.bonez`: o rodapé diz que a espada veio dentro | **vi funcionar** | *Arquivo → Exportar → Salvar como pacote…*: ***"Salvo em heroi.bonez. 4 arquivos dentro, 37.080 bytes."*** *Arquivo → Abrir projeto…* com o pacote: rodapé ***"Pacote heroi.bonez aberto, com a entidade espada.bone e o atlas com as imagens dentro."*** (a aba ficou ***"heroi.bonez — Recorte"***) | `F0_abriu_bonez` |
| 4 | *Salvar como…* com o projeto já numa pasta: oferece uma pasta nova e leva `.bone`, atlas, página, espada e manifesto | **vi funcionar** | Projeto na pasta `p_heroi` → *Arquivo → Salvar como…*: janela ***"Salvar como…"*** (*"O projeto mora na pasta p_heroi. Onde vai a cópia?"*) com ***"Numa pasta nova…"*** (*"o .bone, o atlas, as imagens em uso e as entidades vão juntos, e o projeto passa a morar nela"*), ***"Só o arquivo .bone…"*** (*"O atlas e as entidades continuam na pasta p_heroi"*) e ***Cancelar***. Com a pasta nova `p_novo`: rodapé ***"Salvo em heroi.bone. Levei para a pasta p_novo o que o .bone cita e estava fora dela: heroi.atlas.json, heroi.png, espada.bone. O manifesto do projeto gravado na pasta."*** **Na pasta nova:** `manifest.json` (303 bytes), `heroi.bone` (48.525), `heroi.atlas.json` (3.773), `heroi.png` (29.295 — a página) e `espada.bone` (3.632) = **os 5**. A pasta velha ficou com os 4 de antes | `E0_salvar_como_com_pasta` · `E1_depois_do_salvar_como` |
| 5 | Pasta sem manifesto abre o `.bone` (com dois, pergunta qual); o menu *Arquivo* tem dica em todas as linhas; a aba do navegador mostra *"heroi.bone • — Recorte"* | **vi funcionar** | **Sem manifesto, um `.bone`** (`p_solto`): ***"Pasta p_solto: heroi.bone reaberto de onde parou"*** (direto). **Dois** (`p_heroi`: `espada.bone` e `heroi.bone`; `p_dois`: `heroi.bone` e `mecha.bone`): janela ***"A pasta p_heroi tem 2 arquivos .bone — Qual abrir? As imagens da pasta ficam na aba Imagens do mesmo jeito."*** com os nomes e ***"Nenhum: começar vazio"*** (*"Um projeto vazio na pasta; os .bone dela não são tocados"*). **Menu *Arquivo*:** li o `title` de **todas as 14 linhas** e das dos submenus *Importar* (5) e *Exportar* (8): **nenhuma sem dica**. **Aba:** ***"sem nome — Recorte"*** ao abrir, ***"heroi.bone — Recorte"*** com o herói e ***"heroi.bone • — Recorte"*** depois de empurrar um osso | `D0_pasta_com_dois_bone` · `D1_abriu_heroi_da_pasta` · `H_p_solto` · `H_p_dois` · `G0_menu_arquivo_dicas` |
| 6 | *Exportar imagem*: todos os rótulos com unidade; o `.zip` some numa imagem só; exportar de novo dá *"heroi_0000 (2).png"* e avisa | **vi funcionar** | **Rótulos:** *Animação · Formato · Todas as animações · Só este quadro (0 s) · De (s) · Até (s) · **Velocidade (quadros/s)** · Escala (×) · Fundo transparente · Cor do fundo · Recorte · Margem (px) · Desenhar os ossos · **Cores do GIF (n.º)** · **Repetições do GIF (vezes)***: **todo campo numérico traz a unidade** (os sem unidade são os de escolha). **O `.zip`:** com *Sequência de imagens PNG* o campo ***"Um arquivo só (.zip)"*** aparece; com ***Só este quadro*** ligado, **some** (a linha *"Vai sair"* diz ***"heroi_0000.png — idle, 1 imagem"***). **Exportar duas vezes** (na pasta do projeto `p_novo`): 1ª ***"Pasta: exportar/, dentro da pasta do projeto p_novo"***; 2ª ***"Já havia heroi_0000.png lá: este saiu como heroi_0000 (2).png, e o de antes ficou como estava"***; a pasta `exportar/` ficou com **`heroi_0000.png` e `heroi_0000 (2).png`** (31.694 bytes cada). Defeito 2 | `I0_janela_exportar` · `I1_png_sequencia` · `I2_so_este_quadro_sem_zip` · `J0_relatorio_1` · `J1_relatorio_2` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | A pergunta de *Salvar como* **diz o que cada saída leva** (*"o .bone, o atlas, as imagens em uso e as entidades vão juntos"* e *"O atlas e as entidades continuam na pasta p_heroi"*): quem lê escolhe sem adivinhar |
| C2 | A pasta `p_heroi` (sem manifesto, com `heroi.bone` e `espada.bone`) **oferece a espada como projeto** na lista de dois: a espada é uma **entidade** de outro arquivo; abrir `espada.bone` como projeto é possível (não abri) |
| C3 | Na aba *Imagens*, depois de abrir `p_heroi`, ficou ***"Pasta p_heroi · 0 imagens"*** (o atlas tem as imagens, a pasta só os `.bone`, o atlas e a página): **0** é verdade para PNGs soltos, mas lê-se estranho ao lado de um herói inteiro |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| As pastas | **armazenamento privado do Chrome** (leitura e escrita reais; **não** do Windows) | abrir e gravar numa pasta do disco pelo seletor do Windows |
| O seletor de salvar | arquivo no mesmo armazenamento | a caixa de salvar do navegador, o nome sugerido |
| A caixa nativa | **substituí** `confirm` por um instrumento que anota a chamada e responde | como o Chrome a **desenha** e se o usuário vê o mesmo texto |
| *Abrir espada.bone* como projeto | **não** abri | o que acontece |
| *Nenhum: começar vazio* | **não** apertei (só vi o texto) | o projeto vazio na pasta |
| O `.bonez` | abri o que **o programa mesmo** gravou | um pacote de outro programa |
| *Importar* e *Exportar* (submenus) | li **só** o `title` | que a dica **aparece** com o mouse |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
