# O que o Spriter tem, e o que nos falta — 14/09/2026

Ordem do Humberto: *"eu quero que você liste tudo que o Spriter tem. E aí a
gente vai ver o que está faltando pra gente implementar do Spriter. Eu quero uma
cópia exata, todas as coisas que ele tem, do jeito como ele faz."*

**Isto é documento, não código. Ninguém toca em `editor/src` nesta frente.**

## Como preencher

Uma linha por função do Spriter. Cinco colunas, sempre as cinco:

| Função (como o Spriter chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|

A coluna "O Recorte faz?" aceita **cinco** valores e mais nenhum — o quinto
entrou em 14/09/2026, do Diretor:

| Valor | Quer dizer |
|:---|:---|
| **igual** | existe, e o gesto é o mesmo |
| **diferente** | existe, mas o caminho é outro — diga em que difere, numa linha |
| **falta** | não existe |
| **não se aplica** | e o porquê, numa linha |
| **não confirmei** | procurei no código e não achei com certeza |

**"Igual" é o mais perigoso dos cinco.** Escrever "igual" sem apontar arquivo
e linha é o que produziu onze defeitos silenciosos em dois dias. Prefere-se
uma tabela com dez "não confirmei" a uma tabela com dez mentiras verdes.

**Duas regras que não se dobram:**

1. **A fonte está na pasta.** `documentos/pesquisa/nova pesquisa/spriter/Spriter - todas as funcoes 2026-09-08.md` (37 capítulos + a seção 5, o inventário de menus e diálogos lido print por print) e o PDF do manual oficial 1.4 ao lado. Cada linha casa com um capítulo ou com um item da seção 5. **Nada de memória, nada de internet.**
2. **Todo veredito é conferido no CÓDIGO, com arquivo e linha.** Quem escreve "igual" sem apontar o arquivo está chutando. Onze defeitos silenciosos em dois dias vieram exatamente disso.

## Os três pedaços

| Pedaço | O quê | Chat |
|:---:|:---|:---|
| 1 | capítulos **1 a 12** — projeto, pivô, pôr sprite, z-order, ossos, animar, tempo | |
| 2 | capítulos **13 a 26** — copiar quadro, sons, lip sync, caixas, pontos, character maps, atlas, recorte | |
| 3 | capítulos **27 a 37** + a **seção 5 inteira** (menus e diálogos, item por item) | |

## Onde "cópia exata" quebra o que já temos

Três lugares. Copiar ao pé da letra aqui **perde** coisa que o Recorte tem e o
Spriter não. Estes **não** viram trabalho: viram pergunta ao Humberto.

| # | O que o Spriter faz | Por que copiar quebra |
|:---:|:---|:---|
| 1 | A hierarquia é **por animação** | No `.bone` ela é uma só, com a chave `parent` por cima (§9.4). Já está decidido assim, e a v12.8 inteira depende disso |
| 2 | Não tem **malha nem pesos** | Várias telas dele são simples porque ele guarda menos. Copiar a tela sem a ferramenta seria perder a ferramenta |
| 3 | Não tem **pose de repouso** | A nossa tem, e malha, pesos e o runtime dependem dela |

Fora esses três, a régua é a dele, e é simples: **o Spriter manda.**

## Pedaço 1 — capítulos 1 a 12

Chat "LINHA DO TEMPO", 14/09/2026. Fonte: `Spriter - todas as funcoes
2026-09-08.md`, seção 3, capítulos 1 a 12. Cada veredito abaixo foi conferido
no código do Recorte — arquivo e linha na última coluna.

| Função (como o Spriter chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Animação modular, por peças reaproveitáveis | Cap. 1, What is Spriter | O quadro não é um desenho inteiro: é montado com imagens pequenas reaproveitadas (braço, cabeça, tronco), cada uma pode girar, escalar e trocar | igual | O Recorte é, de nascença, um formato de ossos e imagens reaproveitáveis — `README.md:3` ("Animação 2D por ossos para jogos") |
| Quickstart (tutorial de 12 passos) | Cap. 2, Quickstart | Do zero à primeira animação, um passo de cada vez | não se aplica | É um tutorial, não uma função própria — as funções estão nos capítulos 3 a 12. O equivalente do Recorte é o roteiro guiado, `ferramentas/provas/roteiro-30.mjs` |
| Novo projeto vazio | Cap. 3, Starting a Project | `File / New Project` (Ctrl+N) | igual | `editor/src/ui/shell-file.ts:48-55` (`newFile`), `editor/src/doc/new-file.ts:23-47` (`createEmptyFile`), tecla Ctrl+N em `editor/src/ui/action-bar-model.ts:138` |
| A pasta raiz do projeto — o arquivo mora nela, as imagens são buscadas a partir dele | Cap. 3, Starting a Project | Escolher a pasta raiz ao criar o projeto; as imagens entram sozinhas na paleta | diferente | `editor/src/io/project-folder.ts:1-80` (o comentário já cita o Spriter como origem do modelo). Diferença: no Spriter as imagens da pasta entram na CENA sozinhas; no Recorte elas só entram na paleta — colocar na cena é sempre arrastar, `editor/src/ui/shell-file.ts:57-62` |
| Pivô padrão por imagem, com atalhos de canto/centro/lado | Cap. 4, Default Pivot Points | Duplo clique na imagem na paleta abre o diálogo; ícones levam o pivô a qualquer canto, centro ou meio de lado | diferente | Existe e tem a mesma grade de nove pontos — `editor/src/panels/pivot-dialog.ts:76-224` (`askPivot`, `NINE_POINTS`). Diferença: o gatilho não é duplo clique, é o botão direito na paleta ("Definir pivô…", `editor/src/panels/palette.ts:512-513`) ou um botão de barra (`palette.ts:368-378`) |
| Colocar um sprite: arrastar da paleta para a cena | Cap. 5, Placing a Sprite | Arrastar a imagem da paleta para dentro da cena | igual | `editor/src/panels/palette.ts:709-715` (`dragstart`), `editor/src/viewport/viewport.ts:909-911,944,972` (`drop`) |
| Controles de transformação ao redor do objeto escolhido | Cap. 5, Placing a Sprite | Alças em volta do sprite selecionado, para mover/girar/escalar | igual | `editor/src/viewport/transform-box.ts:126,149,211` (`transformBox`, `transformHit`, `cursorForHandle`) |
| Painel "Object properties": x, y, ângulo, opacidade, digitados | Cap. 5, Placing a Sprite | Canto inferior esquerdo: campos numéricos para o objeto escolhido | diferente | X/Y/rotação/escala existem como campos — `editor/src/panels/properties-model.ts:654-660`. Diferença: não há campo "Opacidade" isolado; o alfa é o 4º número do campo "Cor" (RGBA) — `properties-model.ts:709` |
| Ajustar a ordem de desenho (Z-order): arrastar na paleta | Cap. 6, Adjusting Z-order | Arrastar o item na paleta de Z-order (canto superior esquerdo) | igual | `editor/src/panels/draw-order.ts:371,472,507-518` (arrastar reordena) |
| Ajustar a ordem de desenho: Ctrl+setas | Cap. 6, Adjusting Z-order | Ctrl+Cima/Baixo sobe/desce um lugar; Ctrl+Esquerda/Direita manda para o fundo/frente de tudo | igual | Mesma tecla — `editor/src/ui/keys.ts:160-175` (`subir-ordem`, `descer-ordem`, `frente-de-tudo`, `fundo-de-tudo`), `editor/src/panels/draw-order-actions.ts:41-45` |
| Copiar a ordem Z para todos os quadros-chave | Cap. 6, Adjusting Z-order | `Edit / Copy Z-order To All Keyframes`: grava a ordem de agora em toda chave já existente | diferente | Ação "Copiar a ordem na animação" existe — `editor/src/panels/draw-order-actions.ts:51-54`, `editor/src/panels/draw-order-model.ts:802-819`. Diferença: em vez de escrever em cada chave já existente, apaga a linha do tempo de ordem inteira e grava uma chave só em 0,00s — a ordem passa a valer a animação toda de uma vez, não "de agora em diante" |
| Criar osso: Alt + arrastar, filho do osso escolhido | Cap. 7, Creating and Assigning Bones | Alt + arrastar cria o osso; ele nasce filho do osso selecionado | diferente | A criação é uma FERRAMENTA própria (tecla N), não Alt — `editor/src/viewport/tools/create-bone.ts:397-473`. Alt, com essa ferramenta e um osso já escolhido, reformata o osso existente (não cria um novo) — `create-bone.ts:248-309,436-448`. O "vira filho do escolhido" é igual — `create-bone.ts:229-235` |
| Segurar B + clicar prende o sprite ao osso | Cap. 7, Creating and Assigning Bones | Segurar B com um osso escolhido, clicar num sprite, prende-o como filho daquele osso | diferente | Existe, mas a tecla é P (não B), e o gesto é genérico — prende osso em osso OU desenho em osso, os dois pela mesma tecla — `editor/src/viewport/parent-gesture.ts:4-7,34-37,40-43,110-174`, `editor/src/ui/keys.ts:140,250`. O comentário do código já registra a troca de tecla |
| Editar fora de uma chave cria uma chave sozinho | Cap. 8, Animating Sprites and Bones | Sempre ligado, sem interruptor: mexer em qualquer valor grava uma chave | diferente | Existe — mas é um interruptor ("Gravar sozinho"), ligado por padrão, dá pra desligar — `editor/src/anim/pose-mode.ts:46,50,55`, tecla A, `editor/src/panels/dopesheet.ts:324`, `editor/src/ui/menus.ts:678` |
| Botões "show" e "lock" por sprite e por osso | Cap. 8, Animating Sprites and Bones | Um ícone de olho e um de cadeado por linha, na árvore | igual | `editor/src/panels/tree.ts:720-723` (linha), `tree.ts:821-846` (cadeado), `tree.ts:857-874` (olho) |
| Copiar um atributo para todos os quadros | Cap. 9, Copying Individual Attributes to All Frames | Escolher um valor (por exemplo o comprimento do antebraço) e escrevê-lo em toda chave já existente daquela linha, sem mexer no tempo | igual | "Colar em todas as chaves" (Ctrl+Shift+V) — `editor/src/anim/keying.ts:1121-1134` (`pasteToAllKeys`), `editor/src/panels/dopesheet-actions.ts:76-90,98-99` |
| Botão "reload images" | Cap. 9, Copying Individual Attributes to All Frames | Relê as imagens do disco | igual | "Recarregar" — `editor/src/panels/palette.ts:200-247` |
| Trocar a imagem de um sprite | Cap. 10, Swapping the Image of a Sprite | Botão direito numa imagem da paleta troca a imagem do sprite escolhido, dali para a frente no tempo | igual | `editor/src/panels/image-picker.ts:67-100` (`chooseImage`): com gravação ligada, grava uma chave de troca em `doc.time`, valendo dali para a frente (linha 95). Gatilho: botão direito na paleta ("Usar no desenho escolhido", `palette.ts:502-509`) ou na própria cena (`image-picker.ts:305-319`) |
| Arrastar um quadro-chave no tempo | Cap. 11, Editing Timing | Arrastar o losango na linha do tempo | igual | `editor/src/panels/dopesheet-pointer.ts:56-75` |
| Tecla para somar à seleção ao clicar num quadro-chave | Cap. 11, Editing Timing | Ctrl + clique pega vários quadros-chave para arrastar juntos | diferente | O Recorte usa Shift para somar à seleção — `editor/src/panels/dopesheet-pointer.ts:66-67`. Ctrl, no Recorte, é outro gesto: clonar a chave ao arrastar (item 6 da linha do tempo), não selecionar |
| Mudar a duração total, com "esticar as chaves junto?" | Cap. 11, Editing Timing | Clicar no número do tempo total abre a pergunta se estica as chaves junto | igual | "Mudar duração…" — `editor/src/panels/dopesheet.ts:382`, `editor/src/panels/dopesheet-player.ts:419-464` (`askDuration`, as duas opções "Esticar as chaves"/"Só o número") |
| Slider de velocidade da prévia | Cap. 11, Editing Timing | Barra de 10% a 200%, o número ao lado | igual | `editor/src/panels/dopesheet-model.ts:191-210` (`SPEED_MIN`, `SPEED_MAX`, `speedFromSlider`) — o próprio comentário do código cita o Spriter como origem do desenho da barra |
| Uma linha do tempo por objeto | Cap. 12, Advanced Timeline Editing | Cada objeto (sprite ou osso) tem a linha dele na folha | diferente | O Recorte é mais fino: uma linha por PROPRIEDADE (x, rotação, cor…), agrupada por osso/slot — não uma linha por objeto inteiro — `editor/src/anim/keying.ts:1340-1358,1360-1398` (`groupOf`, `dopesheetGroups`) |
| Puxar o topo da janela da linha do tempo para ver todas as linhas de uma vez | Cap. 12, Advanced Timeline Editing | Arrastar a borda de cima da janela para cima expande a folha | diferente | O Recorte usa um botão ("Detalhes"), não um arrasto de borda — `editor/src/panels/dopesheet.ts:546-560` (`buildDetailsButton`), `editor/src/panels/dopesheet-player.ts:123-136`. O comentário do código já cita esse gesto do Spriter como a inspiração |

## Pedaço 2 — capítulos 13 a 26

Chat "LINHA DO TEMPO", 14/09/2026. Fonte: `Spriter - todas as funcoes
2026-09-08.md`, seção 3, capítulos 13 a 26. Cada veredito conferido no código
— arquivo e linha na última coluna.

| Função (como o Spriter chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Copiar o quadro inteiro | Cap. 13, Duplicating Entire Keyframes | Ctrl+Shift+C copia a pose inteira num instante, mesmo entre chaves (valor interpolado); Ctrl+V cola noutro tempo ou noutra animação | igual | `editor/src/anim/keying.ts:1093` (`poseAt`, amostra com `valueAt`, `keying.ts:458-497` — interpolado, não só chave literal), `editor/src/panels/dopesheet-actions.ts:47` (`copyPose`, Ctrl+Shift+C em `ui/keys.ts:207`), colar em `editor/src/panels/dopesheet-edit.ts:634` (`pasteHere`, Ctrl+V) |
| Adicionar um sprite novo numa animação já pronta, valendo em toda chave | Cap. 14, Adding Additional Sprites to Finished Animations | Prender o novo objeto no quadro 0, Ctrl+C, `Edit / Paste to all keys` (Ctrl+Shift+V) grava o objeto novo em CADA chave já existente da animação, mesmo sem linha própria ainda | diferente | "Colar em todas as chaves" existe (Ctrl+Shift+V) — `editor/src/anim/keying.ts:1121-1134` (`pasteToAllKeys`). Diferença: só escreve em cima de uma linha que JÁ EXISTE e já tem chave naqueles tempos (`if (timeline === null) continue`, linha 1126) — não nasce uma linha nova a partir do zero como no Spriter |
| Key All vs Key Selected — dois botões | Cap. 15, Key All vs Key Selected | "Key selected" grava só o escolhido; "Key all" grava tudo — para "proteger" a pose | igual | "Chavear" (K) → `keyNow`, `editor/src/panels/dopesheet-edit.ts:186` (só o escolhido). "Chavear tudo" (Ctrl+K) → `keyAllNow`, `dopesheet-edit.ts:565-589` (todo osso e slot, escolhido ou não) |
| Efeitos sonoros na linha do tempo, com prévia | Cap. 16, Adding Sound Effects | Arrastar um WAV para a linha do tempo; clicar no som na paleta toca a prévia | diferente | Som existe no formato, mas preso ao EVENTO, não é um clipe solto na régua — `EventDef.audio` (`formato/ESPECIFICACAO 2026-09-06.md:573-577`), editor em `editor/src/anim/event-keys.ts:96`, `editor/src/panels/event-key-editor.ts:168-169`. Não há player de áudio no editor: só o nome do arquivo aparece, sem tocar |
| Lip sync via Papagayo | Cap. 17, Papagayo Lip Sync | Importa o arquivo de fonemas do Papagayo e casa com as imagens de boca | falta | Nenhuma menção a "papagayo"/"fonema" em `editor/src`. O formato só cita, na tabela de comparação com outros formatos, que grupos de lip-sync do Live2D e a extensão `BONE_lipsync` do DragonBones são ignorados (`formato/ESPECIFICACAO 2026-09-06.md:253,3393,3395`) |
| Retângulos de colisão, com nome, por quadro | Cap. 18, Collision Rectangles | Ferramenta "create box" na barra; Alt+arrastar na cena; cada um tem nome | igual | `editor/src/viewport/tools/box-tool.ts` — tecla X, Alt+arrastar (linhas 47-49,59-65), nome automático `${slot}_caixa` (linha 103), aviso "Caixa `nome` criada" (linha 123) |
| Action points, com nome e ângulo, por quadro | Cap. 19, Action Points | Mesma ferramenta, opção "create point"; Alt+arrastar cria o ponto E o ângulo pela direção do arrasto; clique sem arrastar deixa o ângulo em zero | igual | `editor/src/viewport/tools/point-tool.ts` — tecla O, Alt+arrastar (linhas 156-159), ângulo por `atan2` do arrasto só se ele passar de 6px (`MIN_POINT_DRAG_PIXELS`, linha 46), senão `rotation = 0` (linhas 221-224). O comentário do código já cita o Spriter como a origem do Alt |
| Character maps: trocar peças sem reanimar | Cap. 20, What are Character Maps | Trocar o conjunto de imagens do personagem sem mexer nas animações | igual | As Peles (skins) fazem o mesmo: remapeiam slot→imagem, independente das linhas do tempo — `formato/...md:1526-1545`, `editor/src/panels/skins-model.ts:96,465` |
| Criar um character map (duas colunas: imagem a trocar / substituta) | Cap. 21, Creating a Character Map | Botão "CharMaps" abre "Create New Character Map": coluna esquerda a imagem original, direita a substituta, botão direito atribui | diferente | Existe como Pele nova (Duplicar pele) e trocar a imagem pele a pele — `editor/src/panels/skins-model.ts` (`DuplicateSkin`, `SwapImageEverywhere`). Diferença: não há a grade de duas colunas "original × substituta" do Spriter; a troca é imagem por imagem, dentro do editor de peles comum |
| Ativar e empilhar vários character maps ao mesmo tempo | Cap. 22, Activating and Stacking Character Maps | Arrastar da coluna "available" para "active"; vários mapas ligados juntos, empilhados | igual | Várias peles visíveis ao mesmo tempo, a última manda onde há conflito — `editor/src/viewport/onion.ts:694-695,727` (`combinedSkins`), spec §4.4 "a última adicionada tem prioridade" (`formato/...md:562`) |
| Salvar a pilha de character maps como arquivo próprio (`.scms`) | Cap. 23, Saving Character Map Stacks as Character Files | Salva a pilha ativa e a paleta escolhida num arquivo à parte, reaproveitável noutro projeto | falta | Não existe no editor: `skins-actions.ts`/`skins-model.ts` só têm Duplicar/Renomear/Apagar pele, dentro do próprio documento. O formato TEM a peça para isso — `assets.skins: uri[]`, o contrato `rig` (§4.8, `formato/...md:265,624-639`) — mas nenhum lugar do editor usa essa porta. "Exportar por pele…" (`editor/src/io/export-skin.ts`) exporta um `.bone` inteiro (esqueleto + peles + animações escolhidas), não um arquivo de pele isolada |
| Suporte ao TexturePacker (ferramenta de terceiro) | Cap. 24, TexturePacker Support | Dois caminhos de integração com o TexturePacker da CodeAndWeb | não se aplica | O Recorte empacota atlas sozinho, sem depender de ferramenta externa — `ferramentas/empacotar.mjs` + `ferramentas/src/atlas/packer.ts` (packer MaxRects/grade próprio, também usado por "Importar imagens" no editor) |
| Clonar o projeto usando atlas de textura | Cap. 25, Clone with Texture Atlases | Gera uma cópia do projeto que usa atlas (`.json`) em vez de imagens soltas | igual | `ferramentas/fatiar.mjs`, sem filtro de peles/animações (o padrão é manter tudo, `lerArgumentos`, linhas 64,73-74), reempacota com o mesmo `packAtlas` — o próprio comentário garante "a pose e a animação do que sobrou são idênticas às do arquivo inteiro" (linha 13) |
| Recorte customizado por animação (área de exportação) | Cap. 26, Custom Trimming per Animation | Ícone de recorte por animação; a área cortada aparece em magenta na cena; o recorte fica salvo no arquivo | falta | A `Animation` do formato não tem campo de recorte (`formato/ESPECIFICACAO 2026-09-06.md:579-591`; confirmado em `editor/src/panels/animations-model.ts:18-26`). Existe só um corte automático de borda vazia na hora de EXPORTAR ("Cortar a borda vazia", `editor/src/io/export-image.ts:67,900`) — não é por animação, não some em magenta na cena, e não fica gravado no `.bone` |

## Pedaço 3 — capítulos 27 a 37 e a seção 5

Chat "LINHA DO TEMPO", 14/09/2026. Fonte: `Spriter - todas as funcoes
2026-09-08.md`, seção 3 (capítulos 27-37) e seção 5 (menus e diálogos). O
capítulo 36 (mouse e teclado) e as seções 5.5/5.6 (diálogo de exportar,
diálogo de metadados) não viram linha própria: os gestos e campos deles já
estão contados nas linhas dos capítulos correspondentes (28, 29, 30) — aqui só
entram os pedaços do 36 e da seção 5 que ainda não tinham linha em nenhum dos
três pedaços.

| Função (como o Spriter chama) | Onde no manual | O gesto lá | O Recorte faz? | Onde, ou o que falta |
|:---|:---|:---|:---:|:---|
| Troca de paleta de cor, para imagem em cor indexada | Cap. 27, Custom Color Features | Trocar a paleta que uma imagem indexada usa, sem redesenhar | falta | Nenhuma menção a "paleta"/"cor indexada" no formato nem no editor |
| Exportar animação como PNG, tira de sprites ou GIF | Cap. 28, Exporting as Images or GIFs | `File / Export Animation to PNG/GIF`: escolhe FPS, escala, formato, recorte | igual | Mais completo, na verdade: quatro formatos, não três — `editor/src/io/export-image.ts:47` (`png`, `folha`, `gif`, **`webm`**, exclusivo do Recorte). Campos: FPS, escala, fundo, cortar borda vazia, colunas da folha, laço e cores do GIF, tempo de/até — `export-image.ts:57-97`, diálogo em `export-image.ts:890-912` |
| Variáveis animadas na linha do tempo | Cap. 29, Adding Variables | Variável de jogo, numérica interpola entre chaves | diferente | Existe no formato e interpola como número, igual a uma propriedade de osso — `formato/ESPECIFICACAO 2026-09-06.md:2075` (§8.4), `editor/src/anim/keying.ts:121-123,262-265` (`variableTarget`, só float/int interpolam). **Mas não tem porta no editor**: não há "Nova variável" em nenhum menu — `editor/src/panels/tree-commands.ts` tem "Novo osso", "Novo slot", "Novo evento", "Novo parâmetro", mas não variável |
| Tags para marcar mudança de estado | Cap. 30, Adding Tags | Marcar estados ao longo da animação, vários ao mesmo tempo, por entidade/animação/milissegundo | diferente | Existe no formato, com o mesmo alcance (raiz, animação inteira, ou por milissegundo) — `formato/ESPECIFICACAO 2026-09-06.md:2087-2097` (§8.5), `editor/src/anim/keying.ts:112-114` (`tagTarget`). **Sem porta no editor**: nenhum "Nova tag" em `tree-commands.ts` nem em `tree.ts` |
| Disparar evento num ponto exato da linha do tempo | Cap. 31, Adding Event Triggers | Um evento nomeado, num instante, para o motor do jogo reagir | igual | Editor completo, até mais rico: vários eventos no MESMO instante — `editor/src/panels/event-key-editor.ts:1-229` (a lista de eventos, botão "Chavear evento", cinco campos por chave); criar evento novo, `tree-commands.ts:579` |
| Clone do projeto inteiro, em outra escala | Cap. 32, Scaled Clone of the Project | Copiar o projeto todo (imagens inclusas) redimensionado | falta | `ferramentas/fatiar.mjs` fatia por pele/animação, não redimensiona. `ferramentas/empacotar.mjs --escala` só gera páginas de atlas em outra resolução (`@0.5x`); não toca posição, pivô ou comprimento de osso no `.bone`. Nenhum script "clonar"/"redimensionar-projeto" existe |
| Clone com as cores da paleta já "assadas" nas imagens | Cap. 33, Color Customized Clone | Gravar o resultado da troca de paleta direto nos pixels, sem precisar da paleta em tempo de execução | falta | Depende da troca de paleta (item 27), que também falta. Nenhuma menção a "assar"/"bake" em `ferramentas/` |
| Exportação em lote de todos os arquivos de personagem | Cap. 34, Batch Exporting from Character Files | Uma caixa "batch export" grava todas as variações `.scms` de uma vez | diferente | Não há arquivo de personagem (`.scms`, item 23 do pedaço 2), mas há lote: `ferramentas/fatiar.mjs --um-arquivo-por-pele` grava um `.bone` por PELE, numa chamada só. É o mesmo espírito, noutra unidade (pele, não personagem inteiro) |
| Importar um projeto dentro de outro | Cap. 35, Importing One Project Into Another | `File / Other File Actions / Import Another Project Into Current`, três modos de junção | falta | `editor/src/io/import-foreign.ts` importa de OUTROS programas (Spine, DragonBones, Spriter), não junta dois `.bone`. Não há comando de fundir dois documentos. Caminho diferente para o mesmo objetivo: esqueleto aninhado dentro de outro, pelo contrato `rig` — `formato/ESPECIFICACAO 2026-09-06.md §4.8`, `editor/src/anim/keying.ts:124-126` (`nestedTarget`) |
| Selecionar todos os descendentes / ancestrais da seleção | Cap. 36, Mouse and Keyboard — `Z` / `Shift+Z` | `Z` pega os filhos; `Shift+Z` pega os pais | diferente | "Escolher filhos"/"Escolher pais" existem, mas nas teclas `]`/`[`, não `Z`/`Shift+Z` — `editor/src/ui/menus.ts:323,327`. O `Z` já é a ferramenta Inclinar no Recorte, `editor/src/ui/keys.ts:126` |
| Segurar M + arrastar move a origem 0,0 da animação | Cap. 36, Mouse and Keyboard — `M` | Arrastar com M segurado desloca o ponto zero da animação inteira | falta | O `M` do Recorte é outra coisa: fora da linha do tempo, escolhe a ferramenta Malha (`ui/keys.ts:131`); dentro dela, põe ou tira uma marca no tempo (`nova-marca`, `keys.ts:226-227`). Não existe o gesto de mover a origem da animação |
| Ctrl+D duplica e cola em todas as chaves | Cap. 36, Mouse and Keyboard — `Ctrl+D` | Copia o objeto e cola em todo quadro-chave já existente | diferente | Ctrl+D existe, mas só duplica (osso e filhos, 20px à direita) — `editor/src/doc/duplicate.ts:280-308`, `editor/src/ui/menus.ts:304`. "Colar em todas as chaves" é outra tecla, Ctrl+Shift+V, e outro passo |
| Andar 1 pixel com as setas | Cap. 36, Mouse and Keyboard | Setas empurram o escolhido 1px | igual | `editor/src/ui/keys.ts:187-189` (`local:andar`, escopo cena, "algo escolhido") |
| Mover a vista (botão do meio ou Espaço+arrastar); roda = zoom | Cap. 36, Mouse and Keyboard | Arrastar com o botão do meio, ou Espaço segurado, move a vista; a roda dá zoom | igual | `editor/src/viewport/viewport.ts:1160-1161` ("Middle button, or space and drag: pan"), roda em `viewport.ts:900,1282` (`onWheel`) |
| Andar de chave em chave: `1`/`2` qualquer objeto, `Shift+1`/`Shift+2` só do escolhido | Cap. 36, Mouse and Keyboard | `1`/`2` vai à chave anterior/seguinte de qualquer linha; `Shift+1`/`Shift+2`, só do objeto escolhido | diferente | Mesma ideia, teclas diferentes: `↑`/`↓` (qualquer linha) e `Shift+↑`/`Shift+↓` — `editor/src/ui/keys.ts:221-225`. A versão "restrita" filtra pelas LINHAS marcadas na folha, não estritamente pelo objeto escolhido na cena |
| A barra de menus | Seção 5.1 | `File · Edit · Window · View · Help` — cinco menus | diferente | Sete menus — `Arquivo · Editar · Exibir · Esqueleto · Animação · Janela · Ajuda` (`editor/src/ui/menu-audit.ts:69-76`, `MENU_ORDER`). Esqueleto e Animação, que no Spriter ficam espalhados nos outros, aqui são menus próprios |
| Menu File, item por item | Seção 5.2 | Novo, Abrir, Abrir recente, Salvar, Salvar como, **Salvar nova versão**, **Salvar como legado**, Exportar PNG, Outras ações (juntar projeto, converter em lote, opções de salvar, salvar redimensionado), Sair, **Carregar e consertar arquivo corrompido** | diferente | Novo/Abrir/Abrir recente/Salvar/Salvar como/Exportar/Sair — todos iguais, `editor/src/ui/menus.ts:198-263`. **Faltam** quatro: salvar nova versão como item de menu (existe, mas é ferramenta de linha de comando, `ferramentas/versao.py`, não um botão do editor), salvar como formato legado, converter em lote, carregar e consertar arquivo corrompido. "Outras ações" do Recorte é outro conteúdo: Importar (de outro programa, PSD, PSD com ossos) |
| A ferramenta do Alt — um seletor único para osso/caixa/ponto | Seção 5.3 | Um seletor no alto decide o que Alt+arrastar cria: osso, caixa de colisão ou action point | diferente | O Recorte não tem um seletor único: cada um é a própria ferramenta, com tecla própria — Osso (N), Caixa (X), Ponto (O) — `editor/src/viewport/tools/create-bone.ts`, `box-tool.ts`, `point-tool.ts`. Alt entra dentro de cada ferramenta (osso: reformatar; caixa e ponto: o próprio gesto de criar) |
| Copiar e colar o pivô padrão entre imagens; recarregar todas as imagens | Seção 5.3 | No mesmo seletor: Copy/Paste Default Pivots, Reload All Images | igual | "Copiar pivô"/"Colar pivô", botão direito na paleta, guarda a proporção — `editor/src/panels/palette.ts:465-484,514-519`. "Recarregar" relê a pasta do disco — `palette.ts:200-247` |
| Painel Character Maps: Merge Active To New, Bake Active To Entity | Seção 5.4 | Juntar todos os mapas ativos num mapa novo; gravar o resultado dos mapas ativos na própria entidade | falta | `editor/src/panels/skins-actions.ts` só tem Duplicar/Renomear/Apagar pele — nenhuma busca por "juntar"/"assar"/"merge"/"bake" encontrou algo |
| Agradecimentos | Cap. 37, Acknowledgements | Créditos de quem fez o manual e o programa | não se aplica | Não é função, é crédito. O Recorte tem o equivalente em `contribuição/` |

## Juntado — o que falta, por tamanho

Chat "LINHA DO TEMPO", 14/09/2026 — os três pedaços fecharam no mesmo chat (as
outras duas janelas não apareceram). **Nove faltas de verdade** nos 37
capítulos e na seção 5 — nenhuma nos capítulos 1 a 12, que são os mais
usados. Da menor para a maior; quem depende de outra linha, diz de qual.

| # | O que falta | De onde | Tamanho | Depende de |
|:---:|:---|:---|:---:|:---|
| 1 | Segurar uma tecla + arrastar para mover a origem da animação | Cap. 36 | ¼ lote | — nada: mover o osso raiz já faz o mesmo hoje; falta só o atalho dedicado, se valer a pena |
| 2 | Salvar a pilha de peles ativas como arquivo próprio, para reaproveitar noutro projeto | Cap. 23 | 1 lote | — o formato já tem a peça (`assets.skins`, contrato `rig`, §4.8); falta só a porta no editor |
| 3 | Juntar peles ativas numa só; gravar o resultado das peles ativas na pose de repouso | Seção 5.4 | 1 lote | — |
| 4 | Clonar o projeto inteiro (ossos e imagens) em outra escala | Cap. 32 | 1 a 2 lotes | — o empacotador de atlas já escala imagem; falta escalar posição, pivô e comprimento de osso junto |
| 5 | Importar um projeto `.bone` dentro de outro, fundindo os dois | Cap. 35 | 2 a 3 lotes | — mexe em ossos, slots, peles, animações e eventos ao mesmo tempo; é o maior das "portas que faltam" |
| 6 | Recorte de exportação por animação, salvo no arquivo, visível em magenta na cena | Cap. 26 | 2 lotes | **decisão do Humberto**: é campo novo no núcleo do formato (regra 7 da casa) |
| 7 | Troca de paleta de cor, para imagem em cor indexada | Cap. 27 | 2 a 3 lotes | — o Recorte hoje não tem noção de "cor indexada" em lugar nenhum; é começar do zero |
| 8 | Gravar a paleta trocada direto nos pixels (clone com cor "assada") | Cap. 33 | + ½ lote | depende do **#7** — sem paleta, não há o que assar |
| 9 | Lip sync via Papagayo (importar fonemas, casar com as imagens da boca) | Cap. 17 | 3 lotes ou mais | precisa de som TOCÁVEL no editor primeiro — hoje só o nome do arquivo aparece, ninguém ouve nada |

**O que NÃO entrou nesta lista**, e por quê: variáveis e tags (capítulos 29 e
30) já existem no formato e no runtime, interpolam certo — só falta a porta
no editor para CRIAR uma variável ou uma tag pela tela (hoje só quem edita o
JSON à mão consegue). Não é "falta" no sentido de "não existe": é "diferente"
— existe, mas sem gesto de mão. Se o Humberto quiser essa porta, é outro
pedido, não uma falta desta lista.
