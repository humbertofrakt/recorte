# SEQUÊNCIA — do zero ao boneco montado — 28/09/2026

Chat J · `USO · do zero ao boneco montado`. Escrito às 00h (relógio da máquina, 28/09).
**Não escreve código.** Só usa o programa e relata ao `PLANEJADOR · 9f75b5`.

Pedido do Humberto: *"Quero fazer um arroz. Eu pego uma panela, boto água, boto no fogão…
No programa, eu sinto que não tem panela, que não tem arroz."*

Este documento tem duas partes:

| Parte | O quê | Estado |
|:---:|:---|:---|
| 1 | **A referência**: a fila de passos do Spriter e do Spine, com link | **pronta** |
| 2 | **A sequência no nosso programa**: a mesma fila, feita com a mão, com foto e as 4 perguntas | a fazer |

---

# PARTE 1 — A REFERÊNCIA

Tudo abaixo foi lido nas páginas oficiais em 28/09/2026. O que a página não diz está marcado **"não achei"**. Nada foi completado de memória.

## 1.1 Spriter (BrashMonkey) — a fila oficial

Fonte principal: manual oficial do Spriter Pro v1.4 —
[índice](https://brashmonkey.com/spriter_manual/) ·
[Quickstart](https://brashmonkey.com/spriter_manual/getting%20started.htm).
O Quickstart é a fila. Cada passo tem uma página própria.

| # | Passo (a ordem é a do manual) | Onde / como, segundo a página | Página |
|:---:|:---|:---|:---|
| 1 | **Organizar as pastas de imagens antes de abrir o programa** | Pasta principal do projeto, com subpastas por personagem (`hero`, `mushroom`…), PNGs dentro. *"Spriter não desenha; combina, move, gira e estica imagens que você já criou"* | [Starting a Project](https://brashmonkey.com/spriter_manual/starting%20a%20project.htm) |
| 2 | **Criar o projeto** | Menu `File > New Project` ou `Ctrl+N`; o diálogo pede a pasta principal | mesma |
| 2b | **Onde salvar** | O `.scml` deve ficar **na pasta principal**. Aberto de outro lugar, o Spriter não acha as imagens: *"só procura imagens a partir da raiz do .scml"* | mesma |
| 3 | **Dar nome à entidade e à animação** | Duplo clique nos nomes na *animations palette* (canto inferior direito) | [Quickstart](https://brashmonkey.com/spriter_manual/getting%20started.htm) |
| 4 | **Marcar o pivô padrão de cada imagem** | *File palette* (alto à direita). **Duplo clique na imagem** abre o diálogo de pivô. No canto superior direito do diálogo, ícones de ajuste rápido: canto, centro, meio de lado. `OK` confirma | [Default Pivot Points](https://brashmonkey.com/spriter_manual/default%20pivot%20points.htm) |
| 4b | **Copiar o pivô para várias imagens** | Marca um pivô numa imagem de referência → botão `Copy Default Pivots` (sob "Currently Equipped Tools") → seleciona várias imagens → `Paste Default Pivots` | mesma |
| 4c | **Aviso da página** | Não mude o pivô arrastando o círculo na tela: cria pivô fora do padrão, que nem todo runtime entende | mesma |
| 5 | **Pôr as imagens na cena** | **Arrastar** da *file palette* para o canvas central. Depois, alças de transformação em volta do sprite giram e esticam | [Placing a Sprite](https://brashmonkey.com/spriter_manual/placing%20a%20sprite.htm) |
| 5b | **Ver os atributos do que está selecionado** | Painel *object properties* (canto inferior esquerdo); ali também se muda a opacidade | mesma |
| 6 | **Ordem de desenho (z-order)** | Arrastar os sprites na *z-order palette* (alto à esquerda). Ou: sprite selecionado + `Ctrl+↑/↓` sobe ou desce uma posição. `Ctrl+←` / `Ctrl+→` manda para o extremo. Para valer na animação inteira: `Edit > Copy Z-Order To All Keyframes` | [Adjusting Z-order](https://brashmonkey.com/spriter_manual/adjusting%20z%20orders.htm) · [atalhos](https://brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm) |
| 7 | **Alinhar o quadro ao ponto 0,0** | `Ctrl+A` seleciona tudo; setas ou arrastar posicionam o conjunto sobre a cruz do canvas | [Quickstart](https://brashmonkey.com/spriter_manual/getting%20started.htm) |
| 8 | **Criar os ossos** | Segurar `Alt` + arrastar com o botão esquerdo, do começo ao fim do osso. Com o osso ainda selecionado, o seguinte nasce **filho** dele | [Creating and Assigning Bones](https://brashmonkey.com/spriter_manual/creating%20and%20assigning%20bones.htm) |
| 8b | **Osso filho de outro osso** | Seleciona o osso pai (clique) → `Alt` + arrastar. *"O novo osso vira filho automaticamente"* | mesma |
| 8c | **Ajustar o osso** | Solta o `Alt`, clica no osso, move/gira/escala até casar com o desenho | mesma |
| 9 | **Ligar a imagem ao osso** | Seleciona o osso → **segura `B`** (todos os sprites ficam translúcidos) → clica no sprite. O sprite fica mais opaco quando ligou | mesma |
| 9b | **Desligar / trocar o osso** | Seleciona o osso que segura o sprite → segura `B` → clica o sprite de novo | mesma |
| 10 | **Conferir antes de animar** | A página recomenda **posar o boneco em posições extremas** para ver se as camadas estão certas | mesma |
| 11 | *(depois do boneco montado)* Animar, trocar imagem, tempo, etc. | Passos 10–16 do Quickstart. **Fora do escopo desta fila** | [Quickstart](https://brashmonkey.com/spriter_manual/getting%20started.htm) |

**Salvar e reabrir no Spriter:** o atalho de salvar e o caminho de reabrir **não achei** nas páginas lidas (o Quickstart e o mapa de atalhos não os trazem). Só está escrito onde o `.scml` deve ficar (passo 2b).
**Trocar o pai de um osso depois de criado, no Spriter:** **não achei.** A página só descreve criar filho no ato (8b) e ligar sprite (9).
**Vídeos do Spriter:** a página oficial [Learn Spriter Pro](https://brashmonkey.com/learn-spriter-pro/) lista três playlists — *Quick Tips*, *Long Tutorials*, *Spriter in Construct*. Os links da própria página:
[Long Tutorials](https://www.youtube.com/watch?v=Y5PBw4aCVNQ&list=PLD72FFB8B546B6CDB) ·
[Quick Tips](https://www.youtube.com/watch?v=tx9UMuQ-sdg&list=PL8Vej0NhCcI5sxOT64-Z31LW59VUyAVfr).
**Não abri os vídeos** (só li a lista): não afirmo o que mostram.

## 1.2 Spine (Esoteric Software) — a fila oficial

Fonte principal: [Guia do usuário do Spine](https://en.esotericsoftware.com/spine-user-guide).
A ordem que o guia dá em "Getting started" é: Interface → Skeletons → Bones → Slots → Images → Tools → Keys → Animating. A página [Getting started](https://en.esotericsoftware.com/spine-getting-started) **não prescreve** uma fila de modo-montagem/modo-animação: diz só "prepare as imagens no editor de imagem, explore os exemplos, anime, exporte". A fila abaixo é, portanto, a **montada a partir das páginas de cada assunto**, na ordem do guia.

| # | Passo | Onde / como, segundo a página | Página |
|:---:|:---|:---|:---|
| 1 | **Apontar a pasta de imagens** | Nó `Images` na árvore → botão `Browse` (ou digitar o caminho e `Enter`). Caminho relativo ao arquivo do projeto ou absoluto | [Images](https://en.esotericsoftware.com/spine-images) |
| 2 | **Ver as imagens** | PNG e JPEG aparecem como filhos do nó `Images`. Ícone **laranja** = imagem sem uso; **verde** = em uso por um anexo | mesma |
| 3 | **Pôr a imagem na cena** | (A) arrastar uma ou várias imagens (`shift`/`ctrl`) para o viewport → cria **um slot e um anexo de região sob o osso raiz**. (B) arrastar para um osso, slot ou anexo na árvore. (C) tecla `P` ou botão `Set Parent` nas propriedades da imagem → clicar um osso | mesma |
| 4 | **Marcar o pivô** | **Não achei** na página Images nem em Bones. No Spine o pivô da imagem é a posição do anexo em relação ao osso (o osso é a origem) — mas isso não está escrito nas páginas lidas: **não afirmo** | — |
| 5 | **Criar ossos** | Ferramenta `Create` (tecla `N`), modo de montagem apenas. **Antes, selecionar o osso que será o pai.** Clicar = osso de comprimento zero; arrastar = define comprimento e direção. O novo osso fica selecionado; para irmãos, reselecione o pai (ou `shift` ao criar não seleciona o novo) | [Tools](https://en.esotericsoftware.com/spine-tools) · [Bones](https://en.esotericsoftware.com/spine-bones) |
| 5b | **Osso filho pela árvore** | Selecionar o osso pai na árvore → `New... > Bone`; nasce na ponta do pai | [Bones](https://en.esotericsoftware.com/spine-bones) |
| 5c | **Criar o osso e já ligar a imagem** | Com `Create`, ao arrastar o osso, `shift` destaca a imagem sob o mouse; ao soltar, o slot dela **vai para baixo do novo osso na árvore** | [Bones](https://en.esotericsoftware.com/spine-bones) (trecho achado na busca) |
| 5d | **Corrigir um osso mal posto** | Selecionar, `alt`+arrastar ou clicar: recria o osso. Filhos e anexos **não** mudam | [Tools](https://en.esotericsoftware.com/spine-tools) |
| 6 | **Ligar imagem ao osso** | O anexo vive num **slot**, e o **slot** é filho do osso. Mudar de osso = mudar o pai do slot | [Slots](https://en.esotericsoftware.com/spine-slots) · [Bones](https://en.esotericsoftware.com/spine-bones) |
| 7 | **Trocar o pai** | Botão `Set Parent` nas propriedades → clicar o novo pai na árvore ou no viewport. **Ou** arrastar o nó na árvore para o novo pai (equivale ao `Set Parent`) | [Bones](https://en.esotericsoftware.com/spine-bones) · [Tree](https://en.esotericsoftware.com/spine-tree) |
| 8 | **Ordem de desenho** | Nó **draw order** sob o esqueleto na árvore: lista de slots; **o de cima da lista desenha por cima**. Arrastar slots na árvore; ou teclas `+` / `-` (com `shift`, pula 5). O filtro da árvore (alto à esquerda) mostra só `Slots` para facilitar | [Slots](https://en.esotericsoftware.com/spine-slots) |
| 8b | **Ordem dos ossos** | A ordem em que os **ossos** são desenhados no viewport é a da criação e **não pode ser mudada** | [Bones](https://en.esotericsoftware.com/spine-bones) |
| 9 | **Renomear** | `F2` ou duplo clique no nó | [Tree](https://en.esotericsoftware.com/spine-tree) |
| 10 | **Modo de montagem / modo de animação** | Ícone no alto à esquerda do viewport alterna. O nome exato do botão **não está** na página | [UI](https://en.esotericsoftware.com/spine-ui) |
| 11 | **Salvar** | Botão `Save` na barra de título; `shift` + clique abre "Salvar como". Atalho de teclado: **não achei** na página UI | [UI](https://en.esotericsoftware.com/spine-ui) |
| 12 | **Reabrir** | Botão `Open` na barra de título; botão da tela de boas-vindas. Detalhe: **não achei** | [UI](https://en.esotericsoftware.com/spine-ui) |

**Vídeos do Spine:** a página [Videos](https://en.esotericsoftware.com/spine-videos) lista as séries *Spine User Guide*, *Animating with Spine*, *Spine Tips* e *Spine Tutorials in Russian* (playlists no YouTube). **Não abri os vídeos.**

## 1.3 O que as duas filas têm em comum (a "panela, água, fogão")

| Ordem | Passo | Spriter | Spine |
|:---:|:---|:---:|:---:|
| 1 | Ter uma pasta de imagens; **o arquivo do projeto mora junto** | sim (passo 2b) | sim (caminho relativo ao projeto) |
| 2 | **Ver as imagens** numa lista | *file palette* | nó `Images`, laranja/verde |
| 3 | **Pôr na cena** arrastando | sim | sim |
| 4 | **Marcar o pivô** | duplo clique na imagem; ícones de canto/centro | não achei |
| 5 | **Criar ossos**, o filho nasce do selecionado | `Alt`+arrastar | `Create` (N), pai selecionado antes |
| 6 | **Ligar imagem a osso** | `B` + clique no sprite | slot filho do osso; `shift` ao criar; arrastar na árvore |
| 7 | **Trocar quem é pai** | *não achei* | `Set Parent` ou arrastar na árvore |
| 8 | **Ordem de desenho** | *z-order palette*, `Ctrl+↑/↓` | nó draw order, `+`/`-` |
| 9 | **Conferir** | posar em extremos | — |
| 10 | **Salvar / reabrir** | *não achei o atalho* | `Save` / `Open` na barra de título |

## 1.4 Que fila seguimos (a regra da casa: fluxo do Spriter, ferramentas do Spine)

A fila de teste no nosso programa (Parte 2) é esta, na ordem do Spriter, com o "ver a ligação" do Spine:

| Passo | O que faço no nosso programa |
|:---:|:---|
| P1 | Abrir a pasta de imagens (`exemplo/game/...`) |
| P2 | Ver as imagens em uma lista |
| P3 | Pôr as imagens na cena |
| P4 | Marcar o pivô de uma imagem |
| P5 | Criar os ossos (um pai, um filho) |
| P6 | Ligar cada imagem ao osso |
| P7 | Arrumar quem é filho de quem (trocar um pai) |
| P8 | Arrumar a ordem de desenho |
| P9 | Conferir posando o boneco |
| P10 | Salvar |
| P11 | Reabrir e ver se está tudo lá |

*(Parte 2, com foto e as quatro perguntas por passo, entra abaixo quando eu fizer a fila.)*

---

# PARTE 2 — A MESMA FILA NO NOSSO PROGRAMA

Feita à mão, no navegador, **como usuário**: sem ler o código para achar onde clicar.
Fotos em `backup/fotos-rodada-final/uso-boneco/` (numeradas na ordem em que foram tiradas).

| Item | Valor |
|:---|:---|
| Programa usado | **`programa/` montado** (`PORTA=5310 node programa/servidor.mjs --sem-navegador`), a **v22.8 de 22/09**, dito pelo Planejador. O `Ajuda → Sobre o Recorte` diz **"Versão 0.1.0"** (defeito J-04) |
| Fotos 00 a 04 | vieram do editor de desenvolvimento na **porta 5210** (o mesmo gesto, antes da troca de ordem). Da foto 05 em diante: **porta 5310** |
| Tela | 1440×900. O painel da direita aparece com 259 px de largura |
| Imagens | `exemplo/game/mao/` (2 mãos) e `exemplo/game/armas/` (uma faca, uma metralhadora). Não há corpo em peças na pasta de exemplo: o "boneco" é um **braço com arma** |
| Como entraram as imagens | **Soltei arquivos na janela** (simulado por script, porque o diálogo de pasta do sistema **não aparece** dentro do painel do navegador). O clique em `Abrir pasta` foi feito e **nada visível respondeu** — isso é limite do meu ambiente, **não** afirmo que é defeito |

## As quatro perguntas

| Sigla | Pergunta |
|:---:|:---|
| **1** | Achei a ferramenta sem procurar? |
| **2** | O que eu criei apareceu na tela? |
| **3** | O programa disse o que aconteceu? |
| **4** | Ficou óbvio qual é o passo seguinte? |

## A fila, passo a passo

| Passo | O que fiz | 1 Achei? | 2 Apareceu? | 3 Disse? | 4 Próximo óbvio? | Fotos |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| **P1** Abrir a pasta de imagens | Tela inicial: cartão `Abrir pasta`. Depois `Arquivo → Abrir pasta do projeto…` | **sim** (o cartão diz "Arquivo → Abrir pasta…"; no menu o nome é outro: *Abrir pasta do projeto…*) | **não sei**: o diálogo do sistema não aparece no painel | **não**: nada na tela depois do clique | **sim**: o cartão diz "arraste as peças" | 00, 01, 06, 07 |
| **P2** Ver as imagens em uma lista | Soltei 5 PNGs. Aba `Imagens` | **sim** | **sim**: 5 miniaturas | **sim**: rodapé *"5 imagens entraram na aba Imagens. Arraste para a cena para usar"* | **sim**: o rodapé manda arrastar | 03, 08 |
| **P3** Pôr as imagens na cena | Arrastei cada miniatura para o quadro | **sim** (é o gesto do Spriter) | **sim**, na hora. Mas a metralhadora e a faca são **grandes** (1000 px) e a mão pequena (390 px): fora do quadro até apertar `Ajustar` | **arrasto de verdade (painel do aplicativo): não** — o rodapé mostra um **erro falso**, *"Não sei o que fazer com i2uK3w… Solte um .bone, um .psd…"*, e a imagem entra mesmo assim. **Soltando por script** o rodapé é ótimo: *"… entrou solta, como … Para prender num osso: com ela escolhida, crie o osso — ele pega o desenho."* (fotos h03) | **não**: nada diz que o próximo passo é o pivô | 04, 09, 10, 11 |
| **P4** Marcar o pivô | Dois cliques na miniatura: **nada**. Aba `Pivôs` → nove pontos → escolhi "meio da esquerda" (mão) e "meio de baixo" (faca) | **não**: só achei pela aba `Pivôs`. Os botões `Definir pivô…` e `Carimbar pivôs` estão **com tamanho zero**, invisíveis | **o desenho pulou** meia largura/altura de lugar (a mão foi para trás da faca) | **em parte**: rodapé *"Pivô de … 0, 195. 1 desenho recolocado."* Não diz que o desenho **andou** | **não** | 12, 13, 14, 15, 16, 17 |
| **P5** Criar os ossos | `Esqueleto → Novo → Osso` (deu um osso de comprimento zero, invisível, na origem). Depois a ferramenta `Criar osso` (ícone) arrastando na cena | menu: **sim**. Ferramenta: **só pela dica do ícone** | menu: **quase invisível** (ponto na origem). Ferramenta: **sim**, linha azul + `osso2` na Árvore | **sim**: *"Novo osso."* / *"Osso novo pegou 1 desenho, sem mover."* | **não**: `Novo osso` **não nasce filho** do osso escolhido | 18, 19, 20, 21, 22, 23, 24 |
| **P6** Ligar cada imagem ao osso | `Esqueleto → Virar filho de…` (P): o rodapé diz *"Segure P… Clique para prender ou soltar"*; clicar na cena **só seleciona**. Depois **arrastar a linha na Árvore** para cima do osso | menu: **não** (o item liga o contrário do que diz, e pede **segurar** uma tecla). Arrastar na Árvore: **achei por tentativa** | **sim**: o desenho entra sob o osso, **sem se mexer** na cena | **sim**: *"1 item virou filho de osso3."* | **sim** | 25, 26, 27, 29, 30 |
| **P7** Arrumar quem é filho de quem | Arrastei `osso3` para cima de `osso2` na Árvore | **sim** (mesmo gesto do P6) | **sim**: a Árvore mostra a hierarquia recuada | **sim**: *"1 item virou filho de osso2."* | **sim** | 28 |
| **P8** Arrumar a ordem de desenho | Aba `Ordem` ao lado da `Árvore`. Selecionei a metralhadora, `Frente de tudo` | **sim** (a aba está ali; os botões têm dica clara: *"sobe um lugar, e passa a cobrir quem ficou abaixo"*) | **sim**: a linha vai para o topo da lista | **sim**: *"… na frente de tudo."* | **sim** | 31, 32 |
| **P9** Conferir posando o boneco | Osso escolhido → digitei `90` no campo `Ângulo` + Tab. Depois ferramenta `Girar` arrastando na cena | campo: **sim**. Girar: **sim** (ícone) | campo: **a cena não mexeu** (o osso continuou a 45°). Girar: **sim**, o braço, a mão, a faca e a arma **giram juntos** | campo: rodapé *"Mudar Ângulo."*, sem mudança à vista. Girar: sem texto, o número do campo muda | **sim** | 33, 34, 35 |
| **P10** Salvar | Ícone de disquete. No painel do aplicativo abriu o diálogo do Windows (**sem prova**). Refeito em **Chrome sem janela, com o seletor trocado** | **sim** (o disquete e `Arquivo → Salvar`) | **sim**: sai `sem nome.bone`, `sem nome.atlas.json` e `sem nome-atlas.png` ao lado das imagens | **sim**: *"Salvo em sem nome.bone. Atlas da pasta gravado ao lado: sem nome.atlas.json, com 4 imagens em uso."* Mas o projeto **nunca pede um nome** | **não**: nada aponta para "reabrir" | 36 (painel), h10 (sem janela) |
| **P11** Reabrir | Fechei de verdade (recarreguei a página) e reabri, **sem janela, com o seletor trocado**. (a) `Arquivo → Abrir projeto…` escolhendo o `.bone` que acabei de salvar. (b) `Arquivo → Abrir pasta do projeto…` | (a) **sim**. (b) **sim**, mas é outro item, com nome que não lembra "reabrir" | (a) **a Árvore volta, as imagens NÃO**: ícones quebrados, cena vazia, "8 avisos". (b) **tudo volta**: Árvore, imagens, pivôs, hierarquia | (a) rodapé *"Este esqueleto usa sem nome.atlas.json. Abra o atlas junto para ver as imagens."* — **sem botão** para isso. (b) *"Pasta game: sem nome.bone reaberto de onde parou"* | **não**: quem escolhe (a) fica com o boneco sem desenho, e o texto não diz que (b) resolve | h11, h12, h13, h14 |


## Ao vivo — os passos de arquivo, feitos sem janela

Ordem do Humberto, 29/09 00h: **nenhum chat abre janela do Windows**. Antes dela, o chat J clicou
`Abrir pasta` (2×) e `Salvar` (1×) dentro do painel do aplicativo, e o diálogo do sistema abriu na
tela dele sem aparecer no painel. Avisado ao Planejador ("fui eu"). Desde então:

| Feito | Como |
|:---|:---|
| Abrir pasta, Salvar, Abrir projeto, Abrir pasta do projeto | **Chrome headless (sem janela), dirigido por CDP**, com `showDirectoryPicker`, `showSaveFilePicker` e `showOpenFilePicker` trocados por uma pasta de mentira em memória. As imagens da pasta de mentira são os PNG de verdade de `exemplo/game/mao` e `exemplo/game/armas` |
| O que **fica sem prova** | como o **seletor de verdade do Windows** se comporta: se pede nome, se mostra a pasta certa, se lembra o último lugar. O programa, do lado dele, só chama a função e grava o que ela devolve |
| Cliques, arrasto, teclas | eventos de verdade do navegador (`Input.dispatchMouseEvent`/`KeyEvent`). Só soltar da aba Imagens na cena foi um `drop` com o tipo da aba (o mesmo que o roteiro faz) |

Roteiro do headless (fotos `h01` a `h14`):

| Foto | O quê |
|:---:|:---|
| h01 h02 | boas-vindas; `Abrir pasta` com a pasta de mentira → *"Pasta game: 4 imagens em 2 subpastas, na aba Imagens. Arraste uma para a cena"* |
| h03 | quatro imagens soltas na cena |
| h04 h05 | ferramenta `Criar osso`: a dica do rodapé e **o painel da direita esmagado** (defeito J-08) |
| h06 h08 h09 | `segure P` + clique nos desenhos → *"osso ficou com 3 filhos novos."* (só aparece ao soltar o P) |
| h10 | Salvar |
| h11 | página recarregada: pergunta *"Havia trabalho não salvo"* mesmo depois de salvar (ver J-13) |
| h12 h13 | `Abrir projeto…`: Árvore volta, imagens não |
| h14 | `Abrir pasta do projeto…`: volta tudo |

**Versão do programa nesta rodada:** `programa/` montado, v22.8 (22/09), porta 5310 (Planejador, 00h).
Sem o remontado de hoje. Se remontarem, este documento precisa ser refeito para a versão nova.


---

# Conferência na v23.2 — 29/09/2026, 10:27

Refiz a fila inteira no `programa/` **v23.2** (`programa/LEIA-ME.txt`: *"Versao v23.2, montada em 29/09/2026"*), porta 5310.
**Como:** um servidor (PID guardado), Chrome sem janela, seletor de arquivo trocado por pasta de mentira, nenhuma janela do Windows. Memória livre medida antes de abrir: 735 MB. Tudo encerrado pelo PID ao fim.
**Fotos:** `backup/fotos-rodada-final/uso-boneco/v23.2/` (`q01` a `q27`).
**Limite:** o arrasto **de verdade** (HTML5) da miniatura para a cena não se faz em Chrome sem janela. Soltei a imagem por script, como o roteiro faz.

## Defeito por defeito

| # | Resposta | O que vi | Fotos |
|:---:|:---:|:---|:---:|
| **J1** abrir o `.bone` salvo traz as imagens | **NÃO CONSERTADO** | Salvar → recarregar → `Abrir projeto…`: Árvore volta, imagens não; rodapé *"Abra o atlas junto"*, **8 avisos**. `Abrir pasta do projeto…` traz tudo. Igual à v22.8. (Vocês dizem que entra na v23.3) | q23, q24 |
| **J2** `Virar filho de…` pelo menu | **NÃO CONSERTADO** | O rodapé segue *"Segure P: o que está pintado já é filho de osso"*. Clicar a faca na cena não prendeu nada | q13, q14 |
| **J3** `Novo → Osso` solto e invisível | **CONSERTADO** | Com `osso` escolhido: *"Osso "osso2" criado, filho de "osso", na ponta dele. Arraste a ponta para esticar."* A Árvore mostra `osso2` recuado como filho | q11, q12 |
| **J4** Criar osso esmaga o painel | **CONSERTADO** | A aba `Imagens` fica em x=1168 antes, com a ferramenta e depois de arrastar; o quadro da cena não muda de tamanho. Só o rodapé passou a cortar o texto com reticências (novo, J16) | q09, q10 |
| **J5** erro falso ao arrastar a miniatura | **NÃO CONFERIDO** | Não dá para arrastar de verdade sem janela; e vocês dizem que entra na v23.3. Soltando por script o rodapé segue certo | q05 |
| **J6** pivô: desenho solto pula, rodapé não diz para onde | **NÃO CONSERTADO** | Gravei o pivô "meio de baixo" da faca solta: ela saltou para cima. Rodapé: *"Pivô de … 489,5, 0. 1 desenho recolocado."* — o mesmo texto. A janela avisa **antes** (*"será recolocado pelo pivô novo"*), e isso é bom (P65), mas depois não diz para onde foi | q07, q08 |
| **J7** duplo clique abre o pivô; botões com tamanho zero | **CONSERTADO** | Duplo clique na miniatura abre *"Definir pivô de …"* com os nove pontos, setas de 1 px, *"Repetir para a pasta armas"*. Os botões `Definir pivô…` e `Carimbar pivôs` medem 54×42 | q06, q27 |
| **J8** prender arrastando na Árvore | **PELA METADE** | **Retrato o que escrevi:** arrastar uma linha **não escolhida** funciona (*"1 item virou filho de osso2."*); o "nada" que vi era do arrasto do painel do aplicativo. **Continua sem nenhuma dica** de que dá para arrastar | sem foto (o script caiu no segundo passo); lido no rodapé e na Árvore |
| **J9** digitar `Ângulo` não mexe a cena | **NÃO CONSERTADO** | Agora **medido em dois ambientes**: no `osso` (com 4 desenhos filhos) `Ângulo` 32,74 → `90`, rodapé *"Mudar Ângulo."*, e o osso e os desenhos ficam onde estavam | q19, q20 |
| **J10** `Sobre` diz 0.1.0 | **NÃO CONSERTADO** | *"Versão 0.1.0"* (o programa é v23.2) | q03 |
| **J11** boas-vindas: "Abrir pasta…" × menu | **NÃO CONSERTADO** | O cartão segue mandando para *"Arquivo → Abrir pasta…"*. O menu ganhou um bloco de pasta (`Abrir pasta do projeto…`, `Recarregar a pasta`, `Trocar pasta de origem…`), mas o nome é outro | q01, q02 |
| **J12** ícone sem nome | **CONSERTADO** (como declarado) | A ferramenta escolhida mostra o nome no botão: *Transformar*, *Selecionar*, *Criar osso*. **As outras seguem só ícone** até serem escolhidas | q05, q09 |
| **J13** rascunho depois de salvar | **CONSERTADO** | Salvar → recarregar: **nenhuma janela** de "trabalho não salvo" | q22 |
| **J14** o projeto nunca pede nome | **NÃO CONSERTADO** | Salvar grava `sem nome.bone`; o título fica `sem nome.bone`. (Só o seletor do Windows poderia pedir: **sem prova**) | q21 |
| **J15** aba `Imagens` mostra 1,5 linha | **NÃO CONSERTADO** | Mesma coisa em 1440×900: só as duas armas se veem; `mao` fica cortada embaixo | q05, q10 |

**Contagem:** CONSERTADO **5** (J3, J4, J7, J12, J13) · PELA METADE **1** (J8) · NÃO CONSERTADO **8** (J1, J2, J6, J9, J10, J11, J14, J15) · NÃO CONFERIDO **1** (J5).

## Novos na v23.2

| # | Tipo | O defeito |
|:---:|:---|:---|
| **J16** | FEZ E NÃO AVISOU | O rodapé **corta a mensagem com reticências** e some justo o "próximo passo": *"armas/_0000s_0004_Camada-6 entrou solta, como … Para prender num osso: com ela escolhida, cr…"*; *"Osso novo pegou 1 desenho, se…"*; *"Osso "osso2" criado, filho de "osso", na ponta de…"*. Fotos q05, q10, q12 |
| **J17** | NÃO SE ACHA | Com um osso escolhido, a `Ficha rápida` de Propriedades mostra `X`, `Y` e `Escala`; o `Ângulo` fica **abaixo da borda** e só aparece rolando. Foto q19 |

## Os menus e a pergunta que mais importa: achei SEM procurar?

| Coisa | Achei sem procurar? | Onde |
|:---|:---:|:---|
| Abrir a pasta de imagens | **sim** | cartão das boas-vindas; `Arquivo → Abrir pasta do projeto…`, agora num bloco só com `Recarregar a pasta` e `Trocar pasta de origem…` |
| Ver as imagens | **sim** | aba `Imagens`; o crachá azul mostra quantas vezes cada imagem foi usada |
| Pôr a imagem na cena | **sim** | arrastar a miniatura (e há `Esqueleto → Novo → Pôr imagem na cena…`, novo) |
| Marcar o pivô | **sim** | duplo clique; `Esqueleto → Definir pivô…`; botões na aba `Imagens`/`Pivôs`; a dica da aba diz tudo isso |
| Criar osso | **sim** | ferramenta `Criar osso` (nome à vista quando escolhida); `Esqueleto → Novo → Osso` |
| Prender imagem ao osso | **não** | segurar **P** e clicar, ou arrastar na Árvore. Nada à vista diz nenhum dos dois; o item de menu `Virar filho de…` não prende |
| Trocar quem é filho de quem | **em parte** | arrastar na Árvore funciona; sem dica |
| Ordem de desenho | **sim** | aba `Ordem`, botões com dica clara |
| Salvar | **sim** | disquete, `Arquivo → Salvar`, e o rodapé conta o que gravou |
| Reabrir | **não** | o menu tem três (`Reabrir o fechado`, `Abrir projeto…`, `Abrir pasta do projeto…`); o certo é o último, e o rodapé não diz |

## A fila outra vez, passo a passo (v23.2)

| Passo | 1 Achei? | 2 Apareceu? | 3 Disse? | 4 Próximo óbvio? |
|:---|:---:|:---:|:---:|:---:|
| P1 abrir a pasta | sim | sim | sim: *"Pasta game: 4 imagens em 2 subpastas… Arraste uma para a cena"* | sim |
| P2 ver as imagens | sim | sim (só 1,5 linha à vista: J15) | sim | sim |
| P3 pôr na cena | sim | sim | sim (cortado: J16) | em parte |
| P4 pivô | sim | sim | sim, mas não diz para onde o solto foi (J6) | não |
| P5 ossos | sim | sim | sim (cortado: J16) | em parte |
| P6 prender ao osso | **não** | sim | sim, **depois** (*"osso ficou com 3 filhos novos"*) | não |
| P7 quem é filho de quem | em parte | sim | sim | sim |
| P8 ordem de desenho | sim | sim | sim | sim |
| P9 posar | em parte (Ângulo fora da vista: J17) | **não** com o campo (J9); sim girando | não | sim |
| P10 salvar | sim | sim | sim | não |
| P11 reabrir | **não** | **não** com `Abrir projeto…` (J1) | em parte | não |
