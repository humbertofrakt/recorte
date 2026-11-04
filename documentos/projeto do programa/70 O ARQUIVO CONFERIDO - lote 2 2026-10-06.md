# O arquivo conferido — lote 2, exportar a pose (v33.5) — 06/10/2026

Rodada 45, lote 2. Conferente: `CONFERINDO · rodada 39 — a aba das entidades`. **Nenhum código foi mexido.**

| | |
|:---|:---|
| Versão montada | **v33.5** (o "Sobre" diz v33.5; o `programa/` da pasta já era essa, e o zip `recorte v33.5 2026-10-06.zip` está em `backup/versoes/`). Servi o `programa/` direto |
| Como | porta própria (5360) · Chrome sem janela · mouse e teclado por protocolo · 1920×1080 e 1280×720 |
| Hora | 22h29 a 22h33, relógio da máquina, 06/10/2026 |
| Fotos | `backup/fotos-obra/rodada-45-conferida/lote2/` (11, **duas são os PNG que o programa gerou**) |
| Material | o herói de exemplo, animação `idle`; uma **pasta em memória** (`heroi-pasta`) para o caso "com pasta". **Nada foi salvo no disco**: o PNG de "sem pasta" eu **capturei dentro da página** (o programa o entrega como download do navegador, que não chegou à minha pasta de prova) e o de "com pasta" ficou na pasta em memória. Nenhuma caixa nativa do navegador (`alert`/`confirm`/`prompt`) foi chamada |

## O quadro

| Vi funcionar | Pela metade | Não funciona | Total |
|:---:|:---:|:---:|:---:|
| **3** (2, 3, 4) | **1** (1) | 0 | 4 |

| Linha | Por que pela metade |
|:---:|:---|
| 1 | a janela **cabe inteira** em 1920 e em 1280, sem rolar, e **todos** os controles têm dica com a faixa; **mas contei 15 controles à vista (16 só com o formato PNG, quando entra o do .zip)** e a **unidade** está no rótulo só onde faz sentido (segundos, ×, px); *Quadros por segundo*, *Cores* e *Repetições* têm a faixa **só na dica** |

## Os defeitos

Nenhum que pare o uso. Só notas:

| # | Nota | Linha | Foto |
|:---:|:---|:---:|:---|
| 1 | *Pequeno.* **"Um arquivo só (.zip)" fica marcado quando a saída é uma imagem só**, e o programa faz o certo (sai **um PNG**, não um zip; confirmei o tipo do arquivo: `image/png`). Mas o campo **continua à vista e marcado**: quem lê a janela acha que vai receber um zip | 2 | `D0_so_este_quadro` |
| 2 | *Pequeno.* **Exportar de novo, no mesmo segundo ou em outro, regrava o mesmo nome sem perguntar**: na pasta em memória ficou **um só** `heroi_0000.png` (32.163 bytes na 1ª vez, 33.605 na 2ª, com o quadro de 0,5 s). **Não vi aviso de "já existe"** nem nome novo (`heroi_0001`…) | 2 | `J0_quadro_em_outro_segundo` |
| 3 | *Pequeno.* **O nome do arquivo de "Só este quadro" é `heroi_0000.png`** (o número de quadro da sequência) **e não diz o segundo** (0 s ou 0,5 s): as duas poses saem com o mesmo nome | 2 | `I0_relatorio_com_pasta` · `J0_quadro_em_outro_segundo` |

## A tabela

| # | O que tem de acontecer | Estado | O que vi | Foto |
|:---:|:---|:---:|:---|:---|
| 1 | *Arquivo → Exportar imagem*: a janela cabe inteira em 1920 e em 1280 (sem rolar); os 16 controles têm dica, unidade no rótulo e faixa na dica | **pela metade** | O item do menu é ***Arquivo → Exportar → "GIF, PNG, folha, vídeo…"***; abre ***"Exportar imagem"***. **1920×1080:** janela de 960 × 554 px, em (480, 263); **nenhuma área de rolagem** (procurei elemento com rolagem ligada e conteúdo maior que a caixa: **nenhum**); os dois botões terminam em 795 px. **1280×720:** a **mesma** janela (960 × 554), em (160, 83); **sem rolagem**; botões em 615 px, dentro da tela. **Controles (GIF):** *Animação, Formato, Todas as animações, Só este quadro (0 s), De (s), Até (s), Quadros por segundo, Escala (×), Fundo transparente, Cor do fundo, Recorte, Margem (px), Desenhar os ossos, Cores do GIF, Repetições do GIF* = **15**; **com o formato PNG** entra ***Um arquivo só (.zip)***: **16**. **Todos têm dica.** **Faixas na dica:** *De "de 0 a 2 s"*, *Até "de 0 a 2 s"*, *Quadros por segundo "de 1 a 120"*, *Escala "de 0,05× a 8×"*, *Margem "de 0 a 64 px"*, *Cores "de 2 a 256"*, *Repetições "de 0 a 65.535"*. **Unidade no rótulo:** *(s)*, *(×)*, *(px)*; os outros (quadros, cores, repetições) a unidade está **no nome** (*Quadros por segundo*, *Cores do GIF*) | `A0_submenu_exportar` · `B0_janela_exportar_1920` · `B1_janela_exportar_1280` |
| 2 | *"Só este quadro"* existe e funciona: com margem 8 px dá um PNG da pose mais a margem; o arquivo vai para `exportar/` dentro da pasta do projeto (ou Downloads se não há pasta: diga qual) | **vi funcionar** | **Existe:** a caixa ***"Só este quadro (0 s)"*** (o rótulo traz o segundo da agulha; com a agulha em 0,5 s virou ***"(0,5 s)"***), dica ***"Uma imagem só: a pose no segundo da agulha. De e Até não valem"***. **Ligada:** *De* e *Até* ficam **desligados**; a linha *"Vai sair"* diz ***"heroi_0000.png — idle, 1 imagem"***. **Margem 0:** PNG de **110 × 241**. **Margem 8:** PNG de **126 × 257** (**+16 nas duas medidas**). **Abri os dois PNG por fora:** o de margem 8 tem **8 px de transparência em volta (alfa 0)** e o **miolo é idêntico, pixel por pixel, ao de margem 0** (0 pixels diferentes). **Onde vai — sem pasta:** relatório ***"Pasta: a de downloads do navegador (Ctrl+J abre a lista do que foi baixado)"***. **Com pasta:** ***"Pasta: exportar/, dentro da pasta do projeto heroi-pasta"***; na pasta (em memória) apareceu `exportar/heroi_0000.png` (32.163 bytes, **os mesmos** do download). **Outro segundo:** com a agulha em 0,5 s a pose saiu **130 × 257** (outra pose). Defeitos 1 a 3 | `D0_so_este_quadro` · `E1_relatorio_m0` · `F1_relatorio_m8` · `G0_arquivo_margem0_110x241` · `G1_arquivo_margem8_126x257` · `I0_relatorio_com_pasta` · `J0_quadro_em_outro_segundo` |
| 3 | O recorte é uma escolha só, de três | **vi funcionar** | O campo ***Recorte*** é **uma lista de três**: ***"Cortar a borda vazia (automático)"*** · ***"A área desenhada nesta animação"*** · ***"Não cortar: a área da animação inteira"***. **Não há** mais a caixa separada *"Cortar a borda vazia"* (procurei texto e caixas: das 5 caixas de marcar — *Todas, Só este quadro, Fundo transparente, Desenhar os ossos, .zip* — nenhuma é essa). Troquei pelas três e a janela aceitou cada uma, sem outro campo mudar de lugar | `C0_recorte` |
| 4 | *"Fechar"* não tem a cor do *"Exportar"* | **vi funcionar** | **Medi:** ***Exportar*** tem fundo ***rgb(91, 141, 255)*** (azul cheio) e letra escura; o outro botão, que se chama ***"Fechar sem exportar"***, tem fundo **transparente**, letra clara e **contorno** (classe `dialog-close dialog-close-secundario`). *(O botão não se chama só "Fechar": é "Fechar sem exportar".)* | `B0_janela_exportar_1920` |

## O que notei (C)

| # | O que |
|:---:|:---|
| C1 | O relatório *"Imagem exportada"* **diz onde o arquivo foi** (*"exportar/, dentro da pasta do projeto heroi-pasta"* ou *"a de downloads do navegador"*) e o tamanho do quadro (*"126 por 257 pixels"*): dá para conferir sem abrir o arquivo |
| C2 | Com a agulha **em 0 s** a pose é a da base da animação; a janela **mostra o segundo no rótulo**, então quem quer outro segundo sabe que precisa mover a agulha **antes** de abrir a janela |
| C3 | O PNG tem **transparência** (a janela marca *Fundo transparente* de saída): a borda de 8 px é alfa 0 |

## O que troquei por um falso, e o que não conferi

| O quê | Como | O que isso **não** prova |
|:---|:---|:---|
| O arquivo "sem pasta" | **peguei o PNG dentro da página** (o programa o monta e o entrega como download); a pasta de downloads de verdade **não recebeu nada** na minha prova | que o navegador **grava** o arquivo em Downloads, e o nome com que grava |
| A pasta do projeto | **em memória**, com os arquivos do herói | gravar numa pasta de verdade no Windows |
| *"16 controles"* | contei **15 à vista** e o **.zip** (16 só com PNG) | os controles dos formatos *Folha de sprites* e *WebM* (não abri nesses formatos) |
| Dicas | li o `title` de cada campo | que a dica **aparece** ao passar o mouse (não esperei a dica sair na tela) |
| Só uma animação (`idle`) e um segundo a mais (0,5 s) | — | *Todas as animações*, o GIF, outras margens (só 0 e 8) |
| Telas | 1920×1080 e 1280×720 | 1440×900 |
