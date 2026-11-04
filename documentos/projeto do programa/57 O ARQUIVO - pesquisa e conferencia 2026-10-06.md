# O Arquivo, o exportar e o importar — pesquisa e conferência — 06/10/2026

Rodada 45, parte 1. Chat: `PESQUISANDO · rodada 45 — Arquivo, exportar e importar [2e26fe]` (antes `[374550]`; o aplicativo reiniciou às 17h50).
**Nenhum código foi mexido.** Ficha: `rodadas/RODADA 45 - polimento do arquivo exportar e importar 2026-10-06.md`.

| | |
|:---|:---|
| Versão montada | **v32.4** (`programa/` de 17h28), copiada para o rascunho e servida na porta **5520**: a cópia não muda se outra rodada remontar |
| Como | Chrome sem janela na porta **9520**, **1920×1080** (e uma foto 1280×720), mouse, teclado e arrasto nativo por protocolo. Roteiros **fora** da pasta (regra 29). Só leio a tela |
| O seletor do Windows | **não abre sem janela.** Troquei os três seletores (pasta, abrir, salvar) por pastas do **disco privado do navegador** (OPFS): são pastas de verdade, com escrita, e anotei o que o programa pediu a cada um. **O seletor do Windows e o pedido de licença do Chrome só a mão do Humberto prova** |
| Material | `exemplo/game` (o projeto do Spriter, 128 imagens de 1664×1157 e 392×390, sem recorte) e o herói de exemplo. Arrastar arquivo: arquivos reais do disco, pelo protocolo |
| Hora | 17h33 a 18h27 do relógio da máquina (parado 17h50–17h52 pelo reinício) |
| Fotos | `backup/fotos-obra/rodada-45/` (43) |
| Pesquisa | um ajudante, com página de PDF em cada fato (§1). As páginas da Adobe responderam 403: o Photoshop vem dos trechos da busca, marcado **(busca)** |

## O quadro

| # | Pergunta | Resposta curta |
|:---:|:---|:---|
| 1 | Dá para começar numa pasta, salvar, fechar e reabrir no mesmo lugar? | **Dá**, com **4 imagens**. Com **12 imagens o programa TRAVA** no Novo projeto: o painel **Pivôs** gira sem fim (§2.0). O defeito é da parte da rodada 44; **avisei o Diretor às 17h58** |
| 2 | Dá para exportar **uma imagem da pose** com borda automática? | **Só com truque.** Não há "a pose de agora": "De 0 até 0" é recusado, e só "até 0,03 s" dá um PNG (110×241 px, borda cortada ✓). Sai **sempre nos Downloads**, sem perguntar onde |
| 3 | O pacote `.bonez` leva tudo? | **Não.** O pacote do herói sai com **3 arquivos** e deixa a **espada** (a entidade) de fora. Só ao reabrir se lê *"O pacote não traz a entidade espada.bone (7.11)"* |
| 4 | Importar do Spriter só pela tela? | **Pela metade.** O seletor do Windows não escolhe imagens de **13 subpastas** de uma vez: só o `.scml` entra, **sem imagens** e com **176 avisos**. Com as imagens, **trava** pelo mesmo Pivôs. O relatório tem 28 linhas técnicas (*"timeline parent (9.4)"*) |
| 5 | Salvar com problemas avisa em português? (achado da rodada 39) | **Não.** É a caixa do navegador, **em inglês**, com o caminho interno: `/skins/0/attachments/…: image "hair" not found in any atlas`, **43 linhas** (`34`) |

---

## 1. Como os outros fazem

Fontes da casa: `documentos/pesquisa/nova pesquisa/` — **[SP]** `spine/Spine User Guide - manual completo 2026-09-08.pdf` · **[SR]** `spriter/Spriter Pro - manual oficial 1.4.pdf` · **[DB]** `dragonbones/DragonBones Pro - manual completo 2026-09-08.pdf`. "p" é a página do PDF. **(busca)** = Photoshop pelos trechos da busca (a Adobe deu 403). Batem com os textos da casa `REFERENCIA arquivo e importar 2026-09-28.md` e `SEQUENCIA exportar e entregar 2026-09-28.md`, que não tinham página.

### 1.1 Novo, Abrir, Salvar

| Gesto | Spriter | Spine | DragonBones | Photoshop | **Nós** |
|:---|:---|:---|:---|:---|:---|
| Novo | **pede a pasta-raiz** (SR p.4) | New Project na boas-vindas (SP p.246) | janela de projeto novo; nasce com `root` (DB p.5, p.13) | não confirmei | **pede a pasta** ✓ (`05`) |
| O projeto é | **uma pasta**; o `.scml` mora na raiz, e cópia fora dela **não acha as imagens** (SR p.4) | um arquivo `project.spine`; imagens por caminho relativo ou absoluto, com vigia da pasta (SP p.29, p.293) | **uma pasta** (library) (DB p.3, p.20) | arquivo | **uma pasta** ✓ |
| Abrir | `.scml`/`.scon` (SR p.17) | menu, Ctrl+O, **recentes**, colar caminho (SP p.11) | seletor do sistema (DB p.13) | — | Ctrl+O ✓, **Abrir recente** ✓, Abrir pasta ✓ |
| Salvar | grava o `.scml` (SR p.4) | botão; **Shift+clique = Salvar como** (SP p.10) | o botão **acende com mudança** (DB p.13) | Save in Background (busca) | **direto na pasta, sem perguntar** ✓ (`07`) |
| Salvar como | só "Save as Resized / Palette Swapped", **que clona com as imagens** (SR p.33-34) | Shift+Salvar (SP p.10) | não confirmei | Save As / Save a Copy (busca) | grava o `.bone` num lugar e **baixa o manifesto noutro** (`39`) |
| Mudança não salva | não confirmei | não confirmei | botão aceso (DB p.13) | não confirmei | **"•"** junto do nome ✓; o navegador pergunta ao fechar ✓ (`12`) |

### 1.2 A janela de exportar imagem

| Pergunta | Spriter | Spine | DragonBones | Photoshop | **Nós** |
|:---|:---|:---|:---|:---|:---|
| Onde e nome | **seletor antes** da janela (SR p.29) | pasta, arquivo e prefixo na janela (SP p.267) | "meus documentos" + projeto, editável (DB p.31) | Quick Export: pergunta, ou pasta `[nome]-assets` ao lado (busca) | **sempre os Downloads**, sem perguntar (`18`) |
| Tamanho | escala em **%** (SR p.29) | escala em **%**; caber em **px** (SP p.268) | fator **×** (DB p.31) | **×** com `@2x` (busca) | "Escala do desenho" **= 1**, sem unidade |
| Quadros | só chaves · **fps** · total · a cada N **ms** (SR p.29) | **fps**; "incluir o último quadro" (SP p.258) | todas ou a atual (DB p.31) | — | De/Até em **s** ✓, quadros por segundo ✓ |
| Recorte | padrão **não corta**; caixa da animação **na cena**, em **px**, ao vivo (SR p.27) | padrão **a caixa do esqueleto**; Crop X, Y, larg., alt.; **"Maximum bounds"** iguala os tamanhos (SP p.268) | corte do vazio, espaço entre peças (DB p.31) | Canvas Size (busca) | **corta a borda sozinho** ✓, ou a área da animação; **sem margem** |
| Prévia | medida em px ao vivo (SR p.27) | **painel de prévia**, cantos arrastáveis, **tamanho do arquivo** (SP p.269) | prévia do atlas (DB p.31) | lista com dimensões e peso (busca) | **não tem**; só a linha *"Vai sair: heroi.gif — idle, 60 quadros"* |
| Guardar o ajuste | fica no arquivo (SR p.27) | Save/Load em JSON (SP p.269-270) | não confirmei | não confirmei | **Repetir a última exportação** (Ctrl+Shift+E) ✓ — o mesmo atalho do Spine (SP p.253) |
| A pose de agora | não confirmei | não confirmei | não confirmei | uma imagem só é o caso comum | **não tem** |

### 1.3 Pacote, importar, recuperar, avisar

| Ponto | Spriter | Spine | DragonBones | Photoshop | **Nós** |
|:---|:---|:---|:---|:---|:---|
| Pacote para o jogo | o próprio `.scml`; atlas por "Generate spritesheets", **OK cinza se não cabe** (SR p.25-26) | dados + `.atlas` + páginas (Pack) (SP p.254-272) | pasta ou **.zip** (DB p.31) | — | `.bonez` ✓, mas **sem a entidade** |
| Importar com falta | não confirmei | **entra e mostra avisos** (SP p.284) | **Finish cinza** se falta o essencial (DB p.25) | — | entra com 176 avisos ✓; relatório técnico |
| Imagens do importado | a pasta-raiz (SR p.4) | caminho + nome do anexo (SP p.32) | Spine e Cocos, **pasta inteira** (DB p.25-30) | — | arquivo a arquivo: **não alcança as subpastas** |
| Recuperação | nada no manual (SR p.4, p.36) | cópia **antes de cada salvar** + periódica (SP p.302, p.308) | nada (DB p.12) | **10 min**, reabre sozinho (busca) | rascunho a cada poucos segundos, **oferecido ao voltar** em 3 escolhas ✓ (`13`) |
| Imagem que falta | — | **"missing" vermelho** na cena; busca "Missing images" (SP p.231, p.307) | — | — | desenho invisível + **lista em português** com "Trocar imagem…" ✓ (`32`) |
| Arrastar para a janela | não confirmei | arquivo do projeto **abre o projeto** (SP p.11) | PNG solto **é copiado para a library** (DB p.20) | não confirmei | `.bone` abre ✓; **pasta pede outra pasta** (`26`) |

**O que os quatro repetem:** as imagens **moram no disco**, e o projeto aponta para elas · **exportar é uma janela só**, com a pasta de destino nela ou antes dela · a escala **diz a unidade** (% ou ×) · o recorte é escolha, **em px** · o atlas é opção da exportação · **importar com falta entra e avisa** (ou apaga o botão), nunca trava calado · há **cópia automática** num lugar fixo (Spine, Photoshop).

---

## 2. O que o nosso faz hoje

**faz** · **pela metade** · **não faz** · **não tem porta**.

### 2.0 O travamento (fora da minha parte, e o mais grave)

| O quê | O que se viu |
|:---|:---|
| **Novo projeto** numa pasta com **12 imagens** (1664×1157) ou **14** (392×390) | a página **para de responder** por mais de 3 min; o processador fica em 100 % de um núcleo. Com **4** imagens: normal. Pasta vazia: normal |
| **Abrir pasta do projeto…** com o projeto vazio (achado da rodada 44, provado aqui às 18h31) | **12 imagens: trava 3 de 3**, sem resposta por mais de 24 s em cada vez. Pasta vazia: *"A pasta não tem imagens"* ✓. **4 imagens**: *"4 imagens em 1 subpasta, na aba Imagens"* ✓. A pilha das três vezes cai no Pivôs: `render → buildGrid` e `render → buildPreview → mm → aa` |
| **Importar do Spriter com as imagens** | o mesmo: mais de 110 s sem resposta |
| Onde | pilha tirada no giro, três vezes: `render → buildPreview → sizeOf` do painel **Pivôs** (`editor/src/panels/pivot-panel.ts`, ~linha 210) |
| **A forma** | o painel pede o tamanho de cada imagem **a cada redesenho**, sem anotar o que já está a caminho. Cada resposta redesenha, e o redesenho pede **tudo de novo**: os pedidos se multiplicam |
| Dono | a parte **Imagens e pivô** (rodada 44). O doc `55` não o registra. **Aviso mandado ao Diretor às 17h58** |

### 2.1 O menu Arquivo

16 linhas e 2 submenus (`02`, `03`, `04`). **8 sem dica própria:** 6 sem dica nenhuma (Reabrir o fechado, Abrir o herói, Importar ▸, Exportar ▸, Configurações do projeto…, Sair) e 2 cuja dica é **o próprio nome** (Salvar como…, Repetir a última exportação). No Importar ▸, **3 de 5 sem dica** (De outro programa…, PSD…, PSD com ossos…).

| Caminho | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| **Novo projeto…** (Ctrl+N) | pela metade | pede a pasta ✓; *"Projeto novo na pasta p-bcap, com uma base vazia. 4 imagens na aba Imagens; o Salvar grava p-bcap.bone ali"* ✓. **Com 12 imagens, trava** (§2.0) | `05` |
| **Abrir projeto…** (Ctrl+O) | faz | `.bone`, `.boneb`, `.bonez` e imagens no mesmo seletor ✓ | `23` |
| **Abrir recente…** | faz | lista *"p-bcap.bone"* e *"p-bcap (pasta)"*; a pasta reabre **sem seletor** ✓. Item **cinza** antes do primeiro arquivo ✓ | `10`, `15` |
| **Reabrir o fechado** | faz | *"Guardado hoje às 18:05: p-bcap.bone. Isto substitui o que está aberto agora"* ✓; sem nada: explica os três porquês ✓ | `14` |
| **Abrir o herói (exemplo)** | faz | — | — |
| **Abrir pasta do projeto…** | faz | *"Pasta p-bcap: p-bcap.bone reaberto de onde parou"* ✓ | `11` |
| **Salvar** (Ctrl+S) | pela metade | grava **direto na pasta** o `.bone`, o atlas e a página ✓; o segundo Salvar dá o **mesmo tamanho** (1.084 bytes) ✓. A dica promete *"o manifest.json"*, que **não sai** com uma base só | `07`, `08` |
| — sem pasta | faz | janela *"O projeto ainda não tem pasta"*: Escolher a pasta / Salvar só o .bone / Cancelar, cada uma com a frase ✓ | `28` |
| — numa pasta, projeto vindo de fora | **não faz** | grava só `heroi.bone` e `manifest.json`; **o atlas e a imagem ficam fora**. Ao reabrir, as imagens somem e o rodapé manda *"escolha a pasta pasta-heroi-solto"* — **a mesma que acabou de abrir** | `29`, `31` |
| — **com avisos** (achado da 39) | **não faz** | caixa **do navegador**, **em inglês**, com o caminho interno, 43 linhas, e depois as mesmas em português de novo | `34` |
| — o `.bone` muda entre dois Salvar sem edição | faz | o tamanho não mudou (1.084 → 1.084). Só a data `modified` muda. **A tela não avisa nada, e não precisa** | — |
| **Salvar como…** (Ctrl+Shift+S) | pela metade | o `.bone` vai pelo seletor e o **manifesto é baixado à parte**: *"salve o .bone dentro da pasta do projeto para ir junto"* — dois destinos para um gesto | `39` |
| **Salvar a entidade editada…** | — | não conferi | — |
| **Repetir a última exportação** (Ctrl+Shift+E) | faz | regravou o GIF (arquivo de 18:25:23) ✓; lembra até depois de fechar a aba ✓ | `44` |
| **Configurações do projeto…** | faz | frase em cada campo, *"Grade, em pixels"*, *"Tempo de mistura, em segundos"* ✓. Uma frase repetida duas vezes | `41` |
| **Sair** | faz | *"Se a aba não fechou, feche pelo X do navegador: o trabalho está guardado"* ✓ | `42` |
| O rodapé **"Arquivo salvo."** | **não faz** | aparece ao **abrir o programa**, depois de **Abrir o herói**, debaixo da oferta do rascunho e depois de **Sair** — sem nada salvo (regra 21: um verde falso) | `01`, `13` |
| O nome na aba do navegador | pela metade | sempre **"Recorte"**; o nome do arquivo e o "•" só no canto da barra | — |

### 2.2 Exportar

| Caminho | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| **GIF, PNG, folha, vídeo…** | pela metade | o GIF sai ✓ (*"60 quadros de 114x242, 534.228 bytes"*), a borda é cortada sozinha ✓ e a janela do fim diz trecho, quadros, tamanho, pasta e o comando do ffmpeg ✓ | `16`, `38` |
| — a pose de agora | **não tem porta** | De 0 até 0: *"De (0 s) tem de ser menor que Até (0 s)"*. Só **até 0,03 s** dá um PNG: 110×241 px ✓, *"1 quadros"* | `17`, `18` |
| — onde grava | **não faz** | **sempre os Downloads**, mesmo com o projeto numa pasta. O Spriter pergunta antes (SR p.29) | `18` |
| — a janela | pela metade | **16 controles, 0 dicas**. Em 1920 rola por dentro e **esconde 3 campos**; em **1280×720 mostra 324 de 612 px** (`43`). "Recorte" (lista) e "Cortar a borda vazia" (caixa) **dizem a mesma coisa duas vezes**. "Exportar" e "Fechar sem exportar" com **o mesmo azul** | `16`, `43` |
| **Uma imagem por skin…** | faz | janela *"Exportar por skin"* com a conta do que sai. Mostra *"Tamanho 48.485 / 48.478"*: **o recorte maior que o inteiro** | `40` |
| **glTF, para programa 3D…** | pela metade | sai ✓ (77.640 bytes); a janela lista **33 linhas** em termos de formato: *constraint(s) (6), attachment, slot, tint black, morph targets, tags, physics, driver* | `21` |
| **Salvar como binário…** | faz | *"17.900 bytes, 63,1% menor que o .bone"* ✓ | `20` |
| **Salvar como pacote…** | **não faz** inteiro | sai ✓ (*"3 arquivos dentro, 35.867 bytes"*), **sem a espada**. Reabrir diz *"O pacote não traz a entidade espada.bone (7.11)"* | `19`, `23` |
| **Entregar uma base…** | pela metade | sai ✓; a janela diz **a mesma frase duas vezes** (*"o atlas que ele já citava vale"* / *"vai como está, sem fatiar"*) | `22` |

### 2.3 Importar e soltar

| Caminho | Estado | O que se viu | Foto |
|:---|:---:|:---|:---|
| **De outro programa…** (Spriter), só o `.scml` | pela metade | entra: ossos e **13 animações** ✓; janela *"Importado do Spriter"* com **28 avisos técnicos** (*"as outras chaves viram uma timeline "parent" (9.4)"*), 10 deles iguais. Barra: **176 avisos** (as imagens) | `35` |
| — com as 128 imagens | pela metade | a janela *"Este projeto é pesado: 128 imagens, 9 MB no disco, perto de 801 MB na memória"* ✓ com 3 escolhas ✓. **"Abrir com as imagens" trava** (§2.0) | `36` |
| — escolher as imagens | **não faz** | o seletor pede **arquivos**. As imagens do Spriter moram em **13 subpastas**: no Windows não se escolhem de uma vez. **Não há "a pasta do projeto do Spriter"** | — |
| **PSD…**, **PSD com ossos…**, **Animações**, **Skin** | — | não conferi | — |
| Soltar um `.bone` sozinho | faz | abre, sem imagens, e o rodapé explica ✓ — **cortado em "…"** | `24` |
| Soltar `.bone` + atlas + página | faz | *"heroi.bone aberto pelo arrasto"* ✓ | `25` |
| Soltar **uma pasta** | pela metade | não abre a pasta: abre a janela *"O projeto ainda não tem pasta"* e **pede outra pasta** | `26` |
| **Fechar sem salvar e voltar** | faz | o navegador pergunta ✓; ao voltar, *"Havia trabalho não salvo"* com Recuperar / Agora não / Apagar, cada um com a frase ✓ | `12`, `13` |
| A lista de avisos (barra) | faz | português, *"o desenho fica invisível"*, com **Ir para** e **Trocar imagem…** ✓. O caminho ainda aparece: *skin "default" › desenho "hair" › path* | `32` |

---

## 3. O caminho do objetivo

**Salvar, reabrir, exportar imagem e pacote, importar do Spriter.** Como usuário, com o mouse.

| # | Passo | Gestos | Tropeço |
|:---:|:---|:---:|:---|
| 1 | Arquivo → **Novo projeto…** → a pasta (seletor) | 2 cliques + seletor | **T1** com a pasta de verdade (12 imagens), **trava**. Segui com 4 (`05`) |
| 2 | Arrastar `01 (1)` da aba Imagens para a cena | 1 arrasto | ✓ *"entrou solta… Arquivo não salvo."* (`06`) |
| 3 | **Ctrl+S** | 1 tecla | ✓ grava na pasta sem perguntar (`07`). **T2** a dica prometia o `manifest.json` |
| 4 | Fechar a aba; abrir de novo; Arquivo → **Abrir recente…** → *p-bcap (pasta)* | 3 cliques | ✓ *"reaberto de onde parou"* (`15`). **T3** ao abrir, o rodapé diz **"Arquivo salvo."** sem nada aberto. *(No Windows, o Chrome pede licença para a pasta: mão do Humberto)* |
| 5 | Arquivo → Exportar → **GIF, PNG…** → Formato **PNG** → Até **0,03** → **Exportar** | 4 cliques + 1 digitação | ✓ 110×241 px, borda cortada. **T4** não há "a pose de agora"; 0 é recusado. **T5** vai para os Downloads. **T6** nenhuma dica; 3 campos escondidos |
| 6 | Arquivo → Exportar → **Salvar como pacote…** → seletor | 3 cliques + seletor | ✓ (`19`). **T7** com entidade (o herói), **a espada fica de fora** e só se descobre ao reabrir |
| 7 | Arquivo → Importar → **De outro programa…** → `bcp.scml` | 3 cliques + seletor | **T8** o seletor não alcança as imagens das 13 subpastas: entra **sem imagens**, 176 avisos (`35`). **T9** com as imagens, **trava**. **T10** relatório técnico de 28 linhas |

**Resultado:** com 4 imagens, os passos 1 a 6 se cumprem em **~15 cliques, 1 arrasto, 1 tecla, 1 digitação e 3 seletores**. **O que trava um usuário de verdade:** o **T1/T9** (a pasta de verdade trava o programa), o **T8** (o Spriter entra sem imagens) e o **T7** (o pacote incompleto, calado).

---

## 4. O padrão (régua do `26`)

| Número | Hoje | Unidade | Faixa | Dica | O que falta |
|:---|:---|:---:|:---:|:---:|:---|
| De, Até | 0 · 2 | ✓ "(segundos)" | ✗ (0 a 36.000 escondido) | ✗ | faixa *"de 0 a 2 s, a duração"*, dica |
| Quadros por segundo | 30 | ~ | ✗ (1 a 120 escondido) | ✗ | *"de 1 a 120"*, dica |
| **Escala do desenho** | 1 | ✗ | ✗ (0,05 a 8 escondido) | ✗ | **×**, *"de 0,05 a 8"*, dica |
| Cores do GIF | 256 | ~ | ✗ (2 a 256) | ✗ | *"de 2 a 256"*, dica |
| Repetições do GIF | 0 | ✓ "(0 = sempre)" | ✗ | ✗ | dica |
| Cor do fundo | #ffffff | — | — | ✗ | dica |
| Configurações: QPS, grade, mistura | | ✓ "em pixels", "em segundos" | ~ | ✓ frase | em dia |

**Conta:** na janela de exportar, **6 números**: **3** com unidade, **0** com faixa, **0** com dica. **16 controles, 0 dicas.** O menu Arquivo: **11 de 29 itens** sem dica própria (8 de 16 no menu, 3 de 5 no Importar, 0 de 8 no Exportar).

**Texto:** a janela do Novo/Salvar sem pasta e a do rascunho são as mais claras (cada escolha com a frase). A de exportar não tem nenhuma. O glTF, o importar do Spriter e o Salvar com avisos falam **a língua do formato** (seção, *timeline*, *slot*, *attachment*, inglês). **Rodapé falso ou cortado:** "Arquivo salvo." sem nada salvo; o do `.bone` solto, cortado em "…".

**O que só a mão do Humberto prova:** o seletor de pasta do Windows; o pedido de licença do Chrome ao reabrir uma pasta recente depois de fechar o navegador; arrastar uma pasta do Explorer; o nome que o Chrome dá quando o arquivo já existe nos Downloads; e o travamento do §2.0 no disco de verdade.

---

## 5. O plano dos lotes

Uma versão por lote. Tudo na parte **Arquivo** (`ui/shell-file.ts`, `io/open-save.ts`, `io/folder-save.ts`, `io/project-open.ts`, `io/save-binary.ts`, `io/drop-plan.ts`, `io/export-image.ts`, `io/export-gltf.ts`, `io/import-foreign.ts`, `ui/dialog.css`), e em `ferramentas/src/importar/spriter.ts` só se o Spriter pedir. **Nada toca `formato/` nem `runtime/`. Nenhum campo novo no `.bone`.**

### Lote 0 — abrir uma pasta de verdade não trava

Entrou no plano a pedido do Diretor (18h30), depois de repetir 3 de 3. **O arquivo é de outra parte** (`panels/pivot-panel.ts`, rodada 44): só com a licença do Diretor, e avisando a 44 antes de gravar. Se a 44 consertar primeiro, este lote vira só a prova.

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 0.1 | O Pivôs **anota a imagem cujo tamanho já foi pedido** e não pede de novo enquanto a resposta não chega | a forma do §2.0 |
| 0.2 | Quando várias respostas chegam juntas, **um redesenho só**, no próximo quadro, não um por resposta | a forma do §2.0 |
| 0.3 | O painel **escondido não redesenha**: desenha quando a aba Pivôs abre | o Pivôs nem estava à vista quando travou |

**Prova:** teste puro (sem navegador) de que 12 pedidos de tamanho para as mesmas 12 imagens viram **12 leituras**, não mais (falha hoje: cada redesenho pede de novo). Na tela, com o mouse: Novo projeto, Abrir pasta e Importar do Spriter com a pasta de 12 imagens (`exemplo/game/rino`) e com as 128 do `exemplo/game`, cada um respondendo em menos de 5 s. Foto em 1920 e 1280.

**Os lotes 1 a 4 não dependem do lote 0; o 5 depende.**

### Lote 1 — o Salvar diz a verdade

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 1.1 | **Salvar com avisos** abre a **nossa** janela, em português, curta: *"21 imagens faltam: os desenhos delas ficam invisíveis. Salvar assim?"* · **Ver a lista** · **Salvar** · **Cancelar**. Nenhuma caixa do navegador, nenhum caminho interno, nada em inglês | achado da 39; Spine avisa (SP p.255); regra 21 |
| 1.2 | **"Arquivo salvo." só depois de salvar.** Ao abrir o programa: *"Projeto novo, ainda não salvo"*; ao abrir o exemplo: *"heroi.bone aberto"* | regra 21 |
| 1.3 | **Salvar numa pasta leva o atlas e as páginas** que o `.bone` cita, quando eles moram fora. O rodapé diz o que copiou. **Suposição S1** | Spriter: o projeto é a pasta e "Save as" clona com as imagens (SR p.4, p.33) |
| 1.4 | **O pacote leva as entidades** (`espada.bone`). Se alguma não puder ir, a janela diz **antes** de gravar | DragonBones: pasta ou zip com tudo (DB p.31) |
| 1.5 | **Salvar como… grava num lugar só**: com pasta, pergunta o nome dentro dela; o manifesto vai junto, nunca para os Downloads | os quatro: um gesto, um destino |
| 1.6 | A dica do Salvar diz **quando** o `manifest.json` sai (*"com mais de uma base ou com entidade"*) | `07` |
| 1.7 | Reabrir uma pasta onde **falta o atlas**: o rodapé diz **o nome do que falta**, não manda abrir a mesma pasta | `31` |

**Prova:** teste puro da frase do Salvar com avisos (falha hoje: é o `confirm` em inglês); teste de que o pacote do herói tem a espada; foto da janela nova.

### Lote 2 — exportar a pose, com a janela que cabe

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 2.1 | **"Só este quadro"** no Trecho: um PNG da pose da agulha, sem truque de 0,03 s. **Suposição S2** | objetivo da rodada; `17` |
| 2.2 | **Unidade e faixa** em todo número: Escala **×** *"de 0,05 a 8"*, De/Até **s** *"de 0 a 2 s"*, *"de 1 a 120 quadros por segundo"*, *"de 2 a 256 cores"* | régua do `26`; Spine e Spriter dizem % (SR p.29, SP p.268) |
| 2.3 | **Dica com a frase inteira** nos 16 controles | régua 3 do `26` |
| 2.4 | **Um controle só para o recorte** (hoje dois) e **Margem, em px**, *"de 0 a 64"* | Spine pad; DragonBones espaço entre peças (DB p.31) |
| 2.5 | **Onde gravar**: com o projeto numa pasta, o seletor abre **na pasta do projeto**, com o nome sugerido; sem seletor, os Downloads, como hoje | Spriter pergunta antes (SR p.29); Photoshop `[nome]-assets` (busca) |
| 2.6 | **O tamanho antes**: *"Vai sair: heroi_0000.png — 110 × 241 px, 1 imagem"*. Prévia desenhada: **Suposição S3** | Spine: prévia com medida e peso (SP p.269) |
| 2.7 | **Cabe sem rolar** em 1920×1080 e em 1280×720 (hoje 324 de 612 px). "Exportar" principal, "Fechar sem exportar" secundário | `43` |

**Prova:** teste puro do trecho de um quadro e de que todo número da janela tem unidade e faixa (falha hoje); foto da pose exportada em 1920 e em 1280.

### Lote 3 — importar do Spriter pela pasta

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 3.1 | **"De outro programa…" pede a pasta** (ou, depois do `.scml`, pergunta *"Onde estão as imagens? Escolher a pasta do projeto do Spriter"*). As imagens das subpastas entram pelo caminho do `.scml`. **Suposição S4** | Spriter: as imagens são procuradas a partir da raiz (SR p.4); DragonBones importa a pasta (DB p.25) |
| 3.2 | **O relatório em palavras de usuário**, agrupado: *"10 ossos trocam de pai durante a animação: ficou o pai mais usado"* — uma linha por tipo, com a conta; a lista inteira em "ver todos". Sem número de seção, sem *timeline* | régua do "um nome"; Spine: entra e avisa (SP p.284) |
| 3.3 | **Depois de importar, o projeto já tem a pasta do Spriter**: o Salvar grava `bcp.bone` ao lado do `.scml`, **sem tocar nele**. **Suposição S5** | Spriter: o projeto é a pasta (SR p.4); o manual manda fazer cópia antes (SR p.36) |
| 3.4 | **Dica** em De outro programa…, PSD…, PSD com ossos…, Importar ▸ e Exportar ▸ | `04`; régua 3 |

**Prova:** teste puro do agrupamento do relatório; foto do herói do Spriter aberto com imagens — **depende do §2.0** com 128 imagens; antes disso, com uma subpasta só.

### Lote 4 — abrir, soltar e voltar falam claro

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 4.1 | **Soltar uma pasta abre a pasta como projeto** (com a pergunta de largar o aberto, se houver mudança) | Spine: arrastar o projeto abre (SP p.11) |
| 4.2 | **O glTF diz em palavras de usuário** o que não vai, agrupado: *"3 animações usam coisas que o glTF não tem (cor, malha, regras): saem só os ossos"* | régua do "um nome" |
| 4.3 | **Rodapé curto**, o resto na dica: nada cortado em "…" | `24` |
| 4.4 | Entregar uma base: **uma frase**, não duas iguais; Uma imagem por skin: o tamanho não passa do inteiro | `22`, `40` |
| 4.5 | **Dica** em Reabrir o fechado, Abrir o herói, Configurações, Sair, Salvar como, Repetir | `02` |
| 4.7 | **Abrir pasta com a pasta SEM imagens pergunta** antes de trocar o projeto aberto por um vazio, como o botão da aba Imagens já pergunta | doc `64`, (a) |
| 4.8 | A frase **"falta o atlas"** não manda Abrir pasta quando a pasta já está aberta; a janela de avisos junta as linhas iguais numa só, com a conta | doc `64`, (b) |
| 4.9 | **Abrir o `.bonez` diz no rodapé o que veio dentro** (a espada) | doc `64`, (c) |
| 4.10 | **Salvar como… com o projeto já numa pasta** leva o atlas e a espada para onde o `.bone` for, ou pergunta antes | doc `64`, (d) |
| 4.11 | Pasta com um `.bone` na raiz, **sem `manifest.json`** e que o programa não lembra: Abrir pasta **abre o `.bone`** (ou pergunta qual, se há mais de um) | desvio do lote 1 |
| 4.6 | O nome do arquivo e o "•" **na aba do navegador** (*"p-bcap.bone • — Recorte"*) | Photoshop e Spine mostram o nome no título |

**Prova:** teste puro do plano de soltar uma pasta (falha hoje: pede outra pasta); foto da pasta solta aberta.

### Lote 5 — a prova final

No programa montado, com o mouse, o caminho do §3 **com a pasta de verdade** (12 imagens do rino): Novo projeto → arrastar → Ctrl+S → fechar → Abrir recente → exportar **Só este quadro** na pasta do projeto → pacote com entidade (o herói), reaberto **sem aviso de falta** → importar `exemplo/game` **pela pasta**, com as imagens. Foto de cada passo, em 1920 e 1280, e a conta (hoje: ~15 cliques, 1 arrasto, 1 tecla, 1 digitação, 3 seletores, **10 tropeços**). `npm run medir` não cai.

### O que fica de fora

| O quê | Por quê |
|:---|:---|
| MP4 | o navegador não grava; a janela já diz e dá o comando do ffmpeg |
| Recorte **desenhado na cena** (o do Spriter, SR p.27) | grande; a margem em px (2.4) e "Só este quadro" bastam ao objetivo. Fica para depois do Humberto ver |
| Cópia automática **antes de cada salvar** (Spine, SP p.302) | o rascunho de poucos em poucos segundos já cobre a queda; não pedido |
| Guardar o ajuste da exportação em arquivo (Spine Save/Load) | o Repetir já faz o caso comum |
| Importar do Spine e do DragonBones | sem exemplo na casa; o mesmo lote 3 vale para eles se a forma for a mesma |

---

## Suposições (regra 23: nada subiu ao Humberto)

| # | Suposição | Quem decide se estiver errada |
|:---:|:---|:---|
| S1 | Salvar numa pasta **copia** o atlas e as páginas que moram fora, e diz quais | Diretor |
| S2 | "A pose" é **"Só este quadro"** dentro do Trecho, na mesma janela; não é item novo no menu | Diretor |
| S3 | A prévia é **a medida em px** e o peso, em texto; a prévia desenhada fica para depois | Diretor |
| S4 | Importar do Spriter **pede a pasta** (o projeto do Spriter é a pasta) | Diretor |
| S5 | O importado grava o `.bone` **ao lado** do `.scml`, sem tocar nele | Diretor |
| S6 | O lote 0 (o Pivôs) é feito **por mim**, com a licença do Diretor e a 44 avisada, porque o objetivo desta rodada não se prova sem ele | Diretor |

## O que não conferi

| O quê | Por quê |
|:---|:---|
| O seletor de pasta do Windows e o pedido de licença do Chrome | não abrem sem janela: **mão do Humberto** |
| Salvar a entidade editada…, PSD…, PSD com ossos…, Animações e Skin de fora | fora do objetivo; o tempo foi ao travamento |
| Folha de sprites e vídeo WebM | conferi o GIF e o PNG |
| Abrir um `.boneb` | gravei, não reabri |
| O Spriter **com** imagens até o fim | trava (§2.0) |

## Um erro meu, pela forma (regra 27)

**Medi a reação sem conferir que a ação aconteceu.** No primeiro teste de "fechar sem salvar", usei Shift+→ para mexer a peça e fechei a aba. Nada perguntou e nada se ofereceu de volta, e eu ia escrever que o programa **perde o trabalho calado**. O rodapé ainda dizia "Arquivo salvo.": as setas **não tinham mexido nada**. Refiz com uma edição que o rodapé confirmou (*"Arquivo não salvo."*), e aí o navegador perguntou e o rascunho voltou. Daí em diante: **antes de medir a resposta, conferir que o gesto mudou o estado.** E outro, menor: passei código de página por um atalho do terminal que **come as barras invertidas**, e o roteiro quebrou com um erro que não era do programa; passei a escrever os roteiros pelo editor de arquivos.

## Links

| Programa | Link |
|:---|:---|
| Spine | https://esotericsoftware.com/spine-settings · o PDF da casa, p.10-11, 29-32, 231, 246-272, 282-290, 293, 302, 307-308 |
| Spriter | o PDF da casa, p.4-5, 17-18, 25-29, 33-36 |
| DragonBones | site fora do ar; o PDF da casa, p.3, 5, 7, 12-13, 20, 25-31, 42 |
| Photoshop (pela busca; a página deu 403) | https://helpx.adobe.com/photoshop/desktop/save-and-export/export-files-to-different-formats/export-settings-and-export-location-preferences.html · https://helpx.adobe.com/photoshop/desktop/save-and-export/save-files/revert-to-legacy-save-as-options.html · https://helpx.adobe.com/sea/photoshop/using/export-artboards-layers.html · https://www.adobe.com/in/creativecloud/roc/blog/photography/photoshop-crashed-how-to-recover-unsaved-files.html |

## O que só a mão do Humberto confirma (fim da rodada 45, 06/10/2026)

| # | O que ver | Como |
|:---:|:---|:---|
| 1 | **O bcp importado forma o boneco certo?** | Abrir o `exemplo/game/bcp.scml` no Spriter, na animação "andarfaca", e tirar uma foto; no Recorte, Arquivo → Importar → De outro programa… → a pasta game → bcp.scml → a mesma animação. As duas fotos lado a lado. A base do Recorte mostra as peças de todas as animações juntas, porque o Spriter não tem base |
| 2 | **Soltar uma pasta do Explorer na janela** (4.1, não feito) | Hoje abre "O projeto ainda não tem pasta" e pede OUTRA pasta. O certo, como no Spine: a pasta solta vira a pasta do projeto |
| 3 | **O seletor de pasta do Windows e o pedido de licença do Chrome** | Abrir recente → uma pasta, depois de fechar e abrir o navegador: o Chrome pergunta se pode editar a pasta |
| 4 | **Exportar de novo nos Downloads** (projeto sem pasta) | O Chrome dá ao arquivo repetido o nome "heroi (1).gif"; o programa não vê os Downloads |

## Desvios (o executor, na parte 2)

| Lote | Desvio | Por quê |
|:---:|:---|:---|
| 0 | **Não fiz o lote 0**: só a prova. A rodada 44 consertou o Pivôs na v32.7. Na v32.8: Abrir pasta com 12 e com 128 imagens responde em 2 s; Novo projeto com 12, na hora; o Spriter com 128, sem travar (foto `46`) | ordem do Diretor, 18h40: não tocar `pivot-panel.ts` |
| 1 | **Uma linha em `ui/shell.ts`** (o estado do arquivo no rodapé), que é da parte Casca | o "Arquivo salvo." nasce ali; a decisão ficou no módulo puro `ui/salvar-avisos.ts` |
| 1 | **A dica do Salvar em `ui/menus.ts` mudou** (passagem), não só acrescentou | a dica velha prometia o `manifest.json` sempre; manteve "pasta inteira", que um teste antigo prende |
| 1 | **O 1.3 leva também as entidades** (`espada.bone`), não só o atlas e as páginas | a prova na tela mostrou a espada ficando de fora, da mesma forma que o atlas (foto `lote1/07`) |
| 1 | **Erro meu, pela forma: deixei teste-antes-da-função no disco** às 18:44, no mesmo minuto em que a 44 abriu o fecho. Ela mediu com 9 vermelhos meus; tirei o bloco a pedido dela e gravei teste e função juntos depois | daqui em diante, teste e função entram no mesmo comando, depois da porta |
| 1 | Pasta com um `.bone` na raiz e **sem `manifest.json`**, que o programa não lembra: Abrir pasta **não abre o `.bone`**, só as imagens | visto na prova, fora do lote 1; fica anotado para o lote 4 (abrir e soltar) |
| 2 | **O tamanho em px antes de exportar (2.6) não saiu.** A linha diz o arquivo, a animação e "1 imagem" ou os quadros | o número exato só existe depois do corte; um aproximado seria palpite (regra 21). O aviso do fim diz o tamanho certo |
| 2 | **A exportação grava em `exportar/` sem perguntar** quando há pasta do projeto (2.5) | o Photoshop põe numa pasta ao lado do documento; o seletor do Windows a cada exportação é um gesto a mais. O aviso do fim diz onde |
| 2 | **"Só este quadro" não liga sozinho** com a base aberta | a pose da base não é um quadro da animação; ligar sozinho exportaria o quadro 0 da primeira animação, que não é o que se vê |
| 2 | **Erro meu, pela forma, de novo:** gravei teste e função juntos às 22:06, e um dos testes novos pegou a minha função (as dicas de De e Até sem a faixa em número). Ficou vermelho 1 min 30 s no disco, e a rodada 43 viu | daqui em diante, teste e função passam primeiro numa cópia da casa no meu rascunho, e só então vão para o disco |
| 3 | **O código do lote 3 viajou no zip da v33.6** (da rodada 44); a v33.7 é o registro dele | o lote estava verde no disco desde 22:27, e a fila deu o fecho à 44 antes |
| 3 | **O boneco do Spriter sai espalhado: defeito do importador, achado na conferência (doc `72`)**. No `bcp.scml`, 34 de 35 números de timeline apontam peças diferentes em animações diferentes; o importador casa pelo número, o Spriter pelo nome | vai ao lote 5, em `ferramentas/src/importar/spriter.ts` |
| 4 | **O 4.1 (soltar uma pasta abre como projeto) não entrou — mão do Humberto.** Ele precisa da alça de escrita do arrasto (`getAsFileSystemHandle`), que o Chrome sem janela não entrega pelo protocolo. **O que o Humberto tem de ver, no Windows:** arrastar a pasta do herói do Explorer para a janela do programa. Hoje abre a janela "O projeto ainda não tem pasta" e pede OUTRA pasta. O certo, como no Spine (SP p.11): a pasta solta vira a pasta do projeto, e o `.bone` dela abre | sem prova na tela, não se grava (regra 21); ordem do Diretor, 23h00 |
| 4 | **Uma imagem por skin mostra o tamanho maior que o arquivo inteiro** (48.485 / 48.478 bytes) — não mexi | é da parte de exportar por pele; fica anotado |
| 4 | **Entraram no lote 4 os três da conferência da v33.5 (doc `70`)**: unidade no rótulo de todo número da janela de exportar, o ".zip" some numa imagem só, exportar de novo ganha número | pedido do Diretor, 22h58 |
| 4 | **A pasta com dois `.bone` (herói e espada) pergunta qual abrir**, e a espada aparece na lista | uma entidade também é um `.bone`; escolher sozinho seria palpite. O manifesto, que o Salvar grava, decide sem perguntar |
| 5 | **Entraram no lote 5 três defeitos achados na prova final**: um projeto sem animação não exportava a pose ("A base (pose de repouso)" agora); "Abrir o herói" herdava a pasta do projeto de antes e o Ctrl+S gravava dentro dela; e, no Spriter, a peça que a animação não usa aparecia nela | o objetivo da rodada não se cumpria sem eles |
| 5 | **Entraram os cinco do doc `74`** (mudanças não salvas na janela do programa; avisos recolhidos; Ctrl+O nomeia a pasta; o relatório com o nome gravado; o "•" do Ctrl+Z) | pedido do Diretor, 23h24 |
| 5 | **`doc/document.ts` ganhou o ponto salvo da pilha** (três linhas), para o "•" sumir no Ctrl+Z | não é da parte Arquivo; o defeito é do Salvar |
| 6 | **Lote 6, reaberto pelo Diretor depois da prova final (doc `78`)**: Esc na pergunta do `.bone` cancela; o `.bone` da pasta aberta abre pela pasta; avisos curtos recolhidos; recentes com a pasta primeiro | a rodada não estava feita: sobravam quatro coisas |
| 6 | **Erro meu, pela forma (o (b)):** no lote 1 escrevi uma frase que afirmava que o atlas não estava na pasta, sem olhar a pasta. O Ctrl+O traz só o arquivo escolhido; o atlas estava lá e nunca era lido. A frase mentia | daqui em diante: afirmar ausência só depois de olhar |
