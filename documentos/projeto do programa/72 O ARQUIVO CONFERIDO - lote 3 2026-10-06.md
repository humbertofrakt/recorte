# O arquivo conferido — lote 3, importar do Spriter pela pasta (v33.7) — 06/10/2026

Rodada 45, lote 3. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.7** (o "Sobre" diz v33.7; servi o zip `recorte v33.7 2026-10-06.zip`, extraído fora da pasta) |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 |
| Hora | 22h55 a 22h58, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-45-conferida/lote3/` (8) |
| Material | **`exemplo/game` inteira** (132 arquivos, 10.899.930 bytes: `bcp.scml`, `bcp.scon`, `bcp 2026-09-09.bone`, 13 subpastas) **copiada para o armazenamento privado do Chrome**: pasta com leitura e escrita reais, **não do Windows**. O seletor de pasta devolve essa. **Nada foi gravado no disco.** Nenhuma caixa nativa do navegador (`alert`/`confirm`/`prompt`) foi chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (1, 3, 4) | **1** (2) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 2 | **87 de 88** entram e o rodapé diz qual falta; **mas** a cena, depois de **Ajustar**, mostra **peças espalhadas** (armas amarelas, um fundo marrom com rabisco), e **eu não reconheci um boneco**. Não sei como o Spriter o desenha; não afirmo que está certo |

## Os defeitos

| # | Defeito | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **Entre a escolha do `.scml` e a importação aparece uma janela a mais, *"Este projeto é pesado"*** (*"128 imagens: 9 MB no disco, e perto de 801 MB abertas na memória… Acima de 100 MB o programa pode parar de responder enquanto lê"*), com três saídas (*Abrir com as imagens*, *Abrir sem as imagens*, *Não abrir*). **Não estava no pedido.** Diz **128 imagens**, e o relatório depois diz **88** (as 128 são as da pasta, as 88 as que o boneco usa; a janela não explica) | 2 | `C1_projeto_pesado` |
| 2 | *Pequeno.* **Importar parou a página por cerca de 1 segundo**: medi com um relógio de 50 ms dentro da página, **a maior lacuna foi de 1.056 ms** (a importação inteira levou uns 2,2 s). Dentro do que a janela do "pesado" avisa; **não "responde na hora"** | 2 | — |
| 3 | *Pequeno.* **O relatório escreve `"…"` no lugar do nome**: *"O osso "…" troca de pai no meio da animação"* e *"O desenho "…" troca de osso…"*; os nomes só vêm entre parênteses no fim (*"(bone_000, bone_002, … e mais 5)"*). Como grupo, faz sentido; **lido literal, as aspas vazias parecem um nome que não carregou** | 3 | — |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Arquivo → Importar → "De outro programa…"* pede a **PASTA** (não só o `.scml`). Com `.scml` e `.scon` na raiz, pergunta qual abrir | **vi funcionar** | O item tem a dica ***"Pede a PASTA do projeto do Spriter, do Spine ou do DragonBones; as imagens das subpastas entram junto"***. **Ao clicar o programa chamou o seletor de PASTA** (instrumentei: `dir`; o de arquivo **não** foi chamado). Com `exemplo/game`: janela ***"Qual projeto abrir?"***: ***"A pasta tem 2 projetos na raiz. As imagens das subpastas entram com o escolhido."*** com ***bcp.scon*** e ***bcp.scml*** (cada um *"Importa …; os outros projetos da pasta não são tocados"*) e ***Cancelar*** (*"Nada é importado"*). O `bcp 2026-09-09.bone`, que também está na raiz, **não** é oferecido | `A0_menu_importar` · `B0_depois_de_escolher_a_pasta` |
| 2 | Com `exemplo/game` (13 subpastas, 88 imagens): entram 87 de 88 (a que falta é um `_tmp` fora da pasta); a cena mostra o boneco com as imagens | **pela metade** | Escolhi `bcp.scml`, e depois de *Abrir com as imagens* o rodapé disse ***"Importado do Spriter: bcp.bone. 28 avisos. 87 de 88 imagens do boneco estão na cena. Falta 1: "mao/_0000_Camada-1-copiar_tmp5068". Procurei na pasta "game", pelo caminho que o Spriter escreve (mao/_0000_Camada-1-copiar_tmp5068.png). Ponha a imagem na pasta, nesse caminho, e aperte Recarregar."***. **87 de 88**: bate; a que falta **é** o `_tmp`. A árvore ficou com **15 ossos** (`bone_000`… e os desenhos por baixo), a aba *Imagens* com ***"Pasta game · 128 imagens"*** (subpastas *armas*, *bot*, *mao*…), animações `NewAnimation`, `faca`, `pulafaca`, `cairfaca`… (não contei todas). **A cena:** ver a linha acima: há imagens, **não reconheço o boneco**. Defeitos 1 e 2 | `D0_apos_importar` · `E0_cena_do_boneco` · `E1_cena_ajustada` |
| 3 | O relatório tem 3 linhas agrupadas, sem *"timeline"* nem número de seção | **vi funcionar** | A janela ***"Importado do Spriter"*** (*"O arquivo bcp.bone está aberto. Estes pontos não vieram iguais:"*) tem **3 linhas**: ***"10 vezes: O osso "…" troca de pai no meio da animação…"***, ***"17 vezes: O desenho "…" troca de osso no meio da animação…"*** e ***"O Spriter não guarda mesh, pesos nem IK no arquivo: nada disso foi convertido porque não existe na origem."*** **10 + 17 + 1 = 28**, que fecha com os *"28 avisos"* do rodapé. **Procurei no texto** *timeline*, *seção*, *§* e números com ponto (6.3): **nenhum**. A barra de avisos mostra ***"2 avisos — ver"*** (**não abri** a lista; não sei quais são) | `D0_apos_importar` |
| 4 | `Ctrl+S` depois do importar grava `bcp.bone`, o atlas e as páginas ao lado do `.scml`; o `.scml` não muda de tamanho | **vi funcionar** | `Ctrl+S` abriu ***"Salvar com avisos?"***: *"Falta 1 imagem: o desenho dela fica invisível. Ele abre do mesmo jeito…"* + *"A imagem que falta: mao/_0000_Camada-1-copiar_tmp5068"* (***Salvar mesmo assim*** / ***Voltar sem salvar***). Com *Salvar mesmo assim*: ***"Salvo em bcp.bone. Atlas da pasta gravado ao lado: bcp.atlas.json, com 87 imagens em uso."*** **Na pasta, ao lado do `.scml`:** `bcp.bone` (**929.552** bytes), `bcp.atlas.json` (**25.509**), `bcp-atlas.png` (**2.686.896**) e `bcp-atlas2.png` (**2.289.287**), as duas páginas. **O `.scml` ficou com 389.443 bytes e o `.scon` com 622.350: os mesmos de antes**; `bcp 2026-09-09.bone` também (914.480). *(Comparei o **tamanho**, não os bytes: não tirei o resumo do arquivo antes de gravar.)* | `F0_ctrl_s` · `F1_depois_do_salvar` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O rodapé do importar **não corta a causa**: diz qual imagem falta, onde procurou e **o que fazer** (*"Ponha a imagem na pasta, nesse caminho, e aperte Recarregar"*): é a frase mais completa que li nestes lotes |
| C2 | O `Ctrl+S` pergunta com *"Salvar com avisos?"* **pelo mesmo motivo** que o rodapé do importar já tinha dado: a segunda pergunta repete a primeira. Quem sabe da imagem que falta ainda precisa apertar mais um botão para gravar |
| C3 | A importação **grava o atlas ao lado do `.bone`**, e, **pelos tamanhos**, não mexe nos arquivos do Spriter: quem mantém o projeto no Spriter continua com ele inteiro |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| A pasta | **cópia de `exemplo/game`** no armazenamento privado do Chrome | abrir a pasta pelo seletor do Windows; o tempo que o **disco** leva para entregar 128 imagens (aqui a leitura foi do armazenamento do navegador) |
| *"Não mexe no `.scml`"* | comparei **tamanhos** antes e depois | que o conteúdo é **idêntico** byte a byte |
| O boneco | só **olhei** a cena (em 100 % e **ajustada**, a 13 %) | que as peças estão **no lugar** que o Spriter dá (não tenho o Spriter para comparar) |
| O `.scon` | **não** importei (escolhi o `.scml`) | que o `.scon` entra igual |
| *Abrir sem as imagens* e *Não abrir* (da janela "pesado") | **não** apertei | o que eles fazem |
| A animação | **não** toquei nenhuma | que o movimento bate |
| Telas | só 1920×1080 | 1440×900 e 1280×720 |
