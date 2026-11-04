# Sequência — trazer a arte e marcar o pivô — 2026-09-28

Chat H, `EXECUTANDO · imagens e pivô`. Lote 1: **a referência**.
Escrito às 23:58 (relógio da máquina). Nenhum código antes disto.

A pergunta: **em que ordem se faz, no Spriter e no Spine, e onde está cada botão?**
Abrir a pasta · ver as imagens · arrastar para a cena · definir o pivô · trocar a imagem.

Tudo abaixo tem link. Onde não achei, está escrito **"não achei"**.

---

## 1. Spriter — a fila, passo a passo

Fonte principal: o manual oficial, versão 1.4, lido na internet hoje.

| # | Passo | Onde fica | O que se vê | Fonte |
|:---:|:---|:---|:---|:---|
| 1 | **Arrumar a pasta ANTES** de abrir o programa. Uma pasta do projeto; dentro, uma subpasta por personagem (`hero`, `turtle`…) com os PNG | fora do programa | — | [Starting a Project](http://www.brashmonkey.com/spriter_manual/starting%20a%20project.htm) |
| 2 | **Novo projeto** e escolher a pasta raiz | `File / New Project` (Ctrl+N) → diálogo de pasta | a janela de trabalho abre, pronta para o primeiro quadro | [Starting a Project](http://www.brashmonkey.com/spriter_manual/starting%20a%20project.htm) |
| 3 | **Ver as imagens** | a **file palette**, no alto à direita, acima da paleta de animações | as subpastas e as imagens da pasta raiz | [Default Pivot Points](http://www.brashmonkey.com/spriter_manual/default%20pivot%20points.htm) |
| 4 | **Pivô padrão de cada imagem — ANTES de usar** | **duplo clique** na imagem, na file palette → diálogo | o pivô nasce no **canto de cima à esquerda**; no diálogo se clica onde ele fica; **ícones rápidos** no alto à direita: cantos, centro, meio de cada lado. **OK** fecha | [Default Pivot Points](http://www.brashmonkey.com/spriter_manual/default%20pivot%20points.htm) · [Quickstart, passo 4](http://www.brashmonkey.com/spriter_manual/getting%20started.htm) |
| 5 | **Mesmo pivô em várias imagens** | botões **Copy Default Pivots** e **Paste Default Pivots**, na seção *Currently Equipped Tools* da paleta; colar com várias imagens escolhidas | — | [Default Pivot Points](http://www.brashmonkey.com/spriter_manual/default%20pivot%20points.htm) |
| 6 | **Arrastar para a cena** | arrastar da file palette para o **canvas**, no centro | a imagem aparece; clicada, ganha **alças** de girar e esticar; a paleta **object properties** (embaixo à esquerda) mostra os valores | [Placing a Sprite](http://www.brashmonkey.com/spriter_manual/placing%20a%20sprite.htm) |
| 7 | Ajuste fino da peça na cena | **setas do teclado**, com a peça escolhida: 1 pixel por toque | a peça anda | [Mouse and Keyboard Controls](http://www.brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm) |
| 8 | **Trocar a imagem de uma peça** | escolher a peça na cena, **botão direito numa imagem da file palette** | a imagem nova entra **no lugar da antiga, pelos pivôs das duas** | [Swapping the Image](http://www.brashmonkey.com/spriter_manual/swapping%20the%20image%20of%20a%20sprite.htm) |
| 8b | Trocar, jeito rápido | na cena, **segurar o botão direito** sobre a peça: aparece uma **fileira de miniaturas** das imagens da mesma pasta; soltar em cima da escolhida | — | [Quickstart, passo 11](http://www.brashmonkey.com/spriter_manual/getting%20started.htm) |
| 9 | A imagem mudou no disco | botão **reload images**, perto do alto à direita da file palette | as imagens novas aparecem | [Copying Attributes to All Frames](http://www.brashmonkey.com/spriter_manual/copying%20individual%20atributes%20to%20all%20frames.htm) |

### O pivô na cena — o Spriter manda EVITAR

| O quê | O que o manual diz | Fonte |
|:---|:---|:---|
| Arrastar a bolinha do pivô na cena | cria um pivô **fora do padrão**, que **anima** entre chaves e **pode não ser lido** por alguns runtimes. Recomenda evitar | [Default Pivot Points](http://www.brashmonkey.com/spriter_manual/default%20pivot%20points.htm) |
| Botão direito na bolinha → **use default pivot point** | volta ao pivô padrão, **a imagem fica onde está** | idem |
| Botão direito na bolinha → **Overwrite default pivot** | o pivô da cena **vira o novo padrão** da imagem | idem |

### O que o Spriter NÃO diz, ou eu não achei

| Pergunta | Resposta |
|:---|:---|
| O diálogo do pivô tem ajuste fino por teclado (setas)? | **não achei** — o manual só fala de clique e dos ícones rápidos |
| O diálogo mostra números (x, y) do pivô? | **não achei** no texto; há só a figura |
| A file palette marca qual imagem já tem pivô? | **não achei** |
| A file palette marca imagem usada / sem uso? | **não achei** |
| Pasta observada, imagem nova entra sozinha? | **não achei** no manual oficial. Só em fórum e em outro programa com nome parecido (Cyotek Spriter), que **não é** o da BrashMonkey — descartado |

---

## 2. Spine — o nó Images, e as ferramentas que encaixam

Fonte principal: o Spine User Guide, lido na internet hoje.

| # | Passo | Onde fica | O que se vê | Fonte |
|:---:|:---|:---|:---|:---|
| 1 | **Dizer onde está a pasta** | nó **Images** da árvore → campo de caminho; botão **Browse**, ou digitar e Enter | as imagens da pasta aparecem **debaixo do nó Images** | [Images](https://esotericsoftware.com/spine-images) |
| 2 | A pasta muda no disco | nada a fazer: o Spine **observa a pasta** e carrega a mudança na hora | — | [Images](https://esotericsoftware.com/spine-images) |
| 3 | **Ver quais imagens já estão em uso** | o ícone de cada imagem: **laranja = sem uso**, **verde = usada** por algum anexo | a cor | [Images](https://esotericsoftware.com/spine-images) |
| 4 | **Arrastar para a cena** | arrastar do nó Images para o **viewport**; várias de uma vez com Shift/Ctrl | nasce **um slot e um anexo de região**, debaixo do osso raiz | [Images](https://esotericsoftware.com/spine-images) |
| 5 | Arrastar para um osso ou slot **da árvore** | soltar em cima do osso ou do slot | o anexo nasce **centrado no osso** | [Images](https://esotericsoftware.com/spine-images) |
| 6 | Criar pelo **Set Parent** | na ficha da imagem, botão **Set Parent**, ou tecla **P**; depois clicar num osso na cena ou na árvore | o anexo nasce naquele osso | [Images](https://esotericsoftware.com/spine-images) · [Attachments](https://esotericsoftware.com/spine-attachments) |
| 7 | **O pivô** | **não existe pivô de imagem.** A posição do anexo é **o centro da imagem**. Ajusta-se movendo o anexo | — | [Region attachments](https://esotericsoftware.com/spine-regions) |
| 8 | Ajuste fino | cada ferramenta tem **campo de número**; **setas** mudam o valor, **Shift+setas** em passo menor; roda do mouse sobre o número também | o número e a peça mudam | [Tools, Numeric entry](https://esotericsoftware.com/spine-tools) |
| 9 | **Trocar a imagem de um anexo** | (a) campo **Path** na ficha do anexo; (b) **arrastar a imagem nova em cima do anexo antigo**, na árvore: copia o transform dele | a imagem nova no lugar da antiga | [Region attachments](https://esotericsoftware.com/spine-regions) · [Images](https://esotericsoftware.com/spine-images) · [Skins](https://esotericsoftware.com/spine-skins) |
| 10 | Achar o que perdeu a imagem | filtro da árvore **Missing images**: escolhe os itens cuja imagem não foi achada | seleção | [Tree](https://esotericsoftware.com/spine-tree) |

A diferença que importa: no Spine, **soltar no anexo copia o lugar**; **soltar no
marcador de pele, não**. Está escrito em [Skins](https://esotericsoftware.com/spine-skins),
seção *Similar skins*.

---

## 3. DragonBones — só para constar

O site oficial caiu. O texto vem da cópia do Internet Archive, já guardada na casa:
`documentos/pesquisa/nova pesquisa/dragonbones/` (seção 3.8, *Recursos*).

| O quê | Como é |
|:---|:---|
| Onde ficam as imagens | painel **Recursos**: botões *importar recurso*, *abrir a pasta da biblioteca*, *atualizar* |
| A biblioteca | é **uma pasta de verdade** no disco. Arrastar um PNG de fora **copia** para ela |
| Pivô por imagem | **não achei** no resumo da casa |

---

## 4. A fila que seguimos — Spriter na ordem, Spine encaixado

Regra da casa: **fluxo do Spriter, ferramentas do Spine encaixadas nele.**
E a ordem antiga do Humberto: **não há "importar imagens"; a arte vem da PASTA.**

| # | Passo | Vem de | A panela (onde está o botão) | O arroz (o que aparece) | A água ferveu (o aviso) |
|:---:|:---|:---|:---|:---|:---|
| 1 | Abrir a pasta do projeto | Spriter 2 · Spine 1 | menu Arquivo, e à vista no painel Imagens | as subpastas e as miniaturas | quantas imagens achou |
| 2 | Ver as imagens | Spriter 3 | painel **Imagens**, à direita | as miniaturas por subpasta | — |
| 3 | Ver o que já está em uso | Spine 3 | a própria miniatura | marca de usada / sem uso | — |
| 4 | Pivô padrão, **antes** de usar | Spriter 4 | **duplo clique** na miniatura | a cruz do pivô na miniatura | "pivô de X marcado" |
| 5 | Mesmo pivô em várias | Spriter 5 | copiar / colar pivô | a cruz nas outras | "colado em N imagens" |
| 6 | Arrastar para a cena | Spriter 6 · Spine 4 e 5 | arrastar da miniatura | a peça na cena, escolhida, com alças | "desenho X criado" |
| 7 | Ajuste fino | Spriter 7 · Spine 8 | setas, na cena **e no diálogo do pivô** | a peça, ou a cruz, anda | o número muda |
| 8 | Trocar a imagem de um desenho | Spriter 8 e 8b · Spine 9 | botão direito na miniatura; segurar o direito na cena | a imagem nova no lugar, **pelos pivôs** | "imagem trocada" |
| 9 | Imagem mudou no disco | Spriter 9 · Spine 2 | Recarregar | a imagem nova | o que mudou |
| 10 | Imagem sumiu | Spine 10 | marca na miniatura | a peça continua, marcada | "N imagens faltando" |

**Os passos 4, 5 e 7 pedem o painel Pivôs e a janela de pivô** — é a parte que a
auditoria de 27/09 não leu (bloco 8), e que não tem ajuste fino por teclado (bloco 6).
O Spriter não diz se o diálogo dele tem; o Spine tem setas e Shift+setas em todo
campo de número. **Seguimos o Spine nisto**: setas movem a cruz 1 px da imagem,
Shift+setas 10 px. Suposição minha, escrita aqui; o Planejador pode vetar.

---

## 5. O que vem no lote 2

A mesma fila, no nosso programa, porta 5208, com foto de cada passo e as quatro
perguntas da régua do arroz respondidas em cada um:

| # | A pergunta |
|:---:|:---|
| 1 | Achei a ferramenta sem procurar? |
| 2 | O que eu criei apareceu na tela? |
| 3 | O programa disse o que aconteceu? |
| 4 | Ficou óbvio qual é o passo seguinte? |

Fotos em `backup/fotos-rodada-final/imagens-e-pivo/`.

---

## Fontes

| Programa | Página | Link |
|:---|:---|:---|
| Spriter | Índice do manual 1.4 | http://www.brashmonkey.com/spriter_manual/index.htm |
| Spriter | Quickstart | http://www.brashmonkey.com/spriter_manual/getting%20started.htm |
| Spriter | Starting a Project | http://www.brashmonkey.com/spriter_manual/starting%20a%20project.htm |
| Spriter | Setting Default Pivot Points | http://www.brashmonkey.com/spriter_manual/default%20pivot%20points.htm |
| Spriter | Placing a Sprite | http://www.brashmonkey.com/spriter_manual/placing%20a%20sprite.htm |
| Spriter | Swapping the Image of a Sprite | http://www.brashmonkey.com/spriter_manual/swapping%20the%20image%20of%20a%20sprite.htm |
| Spriter | Copying Attributes to All Frames (reload images) | http://www.brashmonkey.com/spriter_manual/copying%20individual%20atributes%20to%20all%20frames.htm |
| Spriter | Mouse and Keyboard Controls | http://www.brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm |
| Spine | Images | https://esotericsoftware.com/spine-images |
| Spine | Region attachments | https://esotericsoftware.com/spine-regions |
| Spine | Attachments (Set Parent) | https://esotericsoftware.com/spine-attachments |
| Spine | Skins (Similar skins) | https://esotericsoftware.com/spine-skins |
| Spine | Tools (Numeric entry) | https://esotericsoftware.com/spine-tools |
| Spine | Tree (Missing images) | https://esotericsoftware.com/spine-tree |
| DragonBones | manual via Internet Archive, resumo da casa | `documentos/pesquisa/nova pesquisa/dragonbones/` |

---

# Lote 2 — a mesma fila, no Recorte — 29/09/2026, 00:11

Feita em Chrome sem janela, 1440×900, no editor da porta 5208. Uma página só
para a fila inteira: cada passo vê o que o anterior fez. Pasta de teste com
5 imagens em 2 subpastas (`bracos`, `corpo`). A fila e as fotos:
`backup/fotos-rodada-final/imagens-e-pivo/lote-2_*.png`; o que o rodapé disse
em cada passo, em `lote-2_relatorio.json`.

**As quatro perguntas:** 1 achei a ferramenta? · 2 o que criei apareceu? ·
3 o programa avisou? · 4 o passo seguinte ficou óbvio?

| # | Passo (Spriter) | Foto | 1 | 2 | 3 | 4 | O que se vê |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Abrir a pasta | `02_abrir-pasta` | sim | sim | sim | sim | botão nas boas-vindas; subpastas na aba Imagens; rodapé: *"5 imagens em 2 subpastas… Arraste uma para a cena"* |
| 2 | Ver as imagens | `02` | sim | sim | — | sim | miniaturas por subpasta, com contagem |
| 3 | **Pivô: duplo clique** na imagem | `03_duplo-clique` | **não** | **não** | **não** | **não** | nada acontece. No Spriter é o gesto principal |
| 4 | Pivô: botão direito → menu | `04_botao-direito` | ~ | sim | — | sim | menu com Definir, Copiar, Colar pivô |
| 5 | **Copiar pivô** (imagem só na pasta) | `05_copiar-pivo` | sim | — | **não** | **não** | **cala**: nada copiado, rodapé não muda (regra 21) |
| 6 | Definir pivô… → janela | `06_definir-pivo-janela` | sim | sim | sim | sim | imagem, cruz, 9 pontos, X/Y. "Repetir para a pasta" já vem **ligado** |
| 7 | **Setas** na janela | `07_setas-na-janela` | **não** | **não** | **não** | — | X/Y não mudam. Sem ajuste fino (já se sabia) |
| 8 | Nove pontos → Gravar | `08_nove-pontos-e-gravar` | sim | ~ | sim | sim | rodapé: *"Pivô repetido para a pasta bracos: 3 imagens"* |
| 9 | Ver a cruz na miniatura | `09_miniatura` | — | **não** | — | — | **o pivô gravado não aparece** na aba Imagens enquanto a imagem só está na pasta |
| 10 | Arrastar para a cena | `10_arrastar` | sim | sim | sim | sim | a peça nasce escolhida; rodapé diz o próximo passo (criar osso) |
| 11 | **Setas** na cena (Spriter: 1 px) | `11_setas-na-cena` | **não** | **não** | **não** | — | a peça não anda (**fora da cerca: chat F**) |
| 12 | Trocar: botão direito em outra imagem | `12_usar-no-desenho-apagado` | sim | — | ~ | **não** | **"Usar no desenho escolhido" APAGADO**, com a peça recém-solta escolhida. O soltar escolhe o slot, e a troca só aceita o desenho |
| 13 | Clicar a peça na cena | `13_clicar-a-peca` | sim | sim | — | — | agora o desenho fica escolhido |
| 14 | Trocar a imagem | `14_trocar-a-imagem` | sim | sim | sim | sim | troca, mas **a peça pula 12 px para baixo** — mesmo tamanho, mesmo pivô. No Spriter, mesmo pivô = sem pulo (**conta em `io/`: chat E**) |
| 15 | Cabeça solta longe, em (150, 100) | `15_cabeca-solta-longe` | sim | sim | sim | sim | — |
| 16 | Janela → Pivôs | `16_painel-pivos` | ~ | sim | — | sim | a aba existe, mas é **apertada**: 9 pontos espremidos em cima do texto, aviso cortado, grade de uma linha |
| 17 | Escolher a cabeça na grade | `17_pivos-escolher-cabeca` | sim | sim | — | sim | prévia com cruz e X/Y |
| 18 | Clicar no queixo | `18_pivos-clique-no-queixo` | sim | sim | sim | **não** | **a cabeça sai de (150, 100) e vai para (0, 28)**, perto da origem. Rodapé: *"1 desenho recolocado"*, sem dizer para onde. Número torto: *"30, 1,8381"* (**conta em `io/`: chat E**) |
| 19 | **Setas** no painel Pivôs | `19_pivos-setas` | **não** | **não** | **não** | — | nada muda |

### Achado de passagem

Na linha da busca da aba Imagens, os botões **Carimbar pivôs** e **Definir pivô**
aparecem como **pontinhos**: o campo de busca empurra, e o desenho do ícone
encolhe para 4 px de largura. Está nas fotos `02` a `14`. Na minha cerca (`palette.css`).

## Onde a fila quebra — e de quem é

| # | Quebra | Pergunta | Dono | Lote |
|:---:|:---|:---:|:---:|:---:|
| Q1 | duplo clique na miniatura não abre o pivô | 1 | **H** | 3 |
| Q2 | setas não mexem a cruz (janela e painel Pivôs) | 1, 3 | **H** | 3 |
| Q3 | Copiar pivô cala, na imagem só da pasta; Colar diz *"copie primeiro"* mesmo com pivô copiado | 3 | **H** | 3 |
| Q4 | o pivô gravado não aparece na miniatura da aba Imagens | 2 | **H** | 3 |
| Q5 | "Usar no desenho escolhido" apagado com o slot escolhido | 4 | **H** (`image-picker.ts`) | 3 |
| Q6 | ícones Carimbar e Definir pivô viram pontinho | 1 | **H** (`palette.css`) | 3 |
| Q7 | painel Pivôs apertado em 1440×900 | 1, 2 | **H** (`pivot-panel.css`) | 3 |
| Q8 | trocar a imagem **pula**, mesmo com o mesmo pivô | 2 | **E** (`io/pivot-model.ts`, `swapImage`) | aviso |
| Q9 | acertar o pivô **teletransporta** o desenho solto para a origem | 2, 3 | **E** (`io/pivot-atlas.ts`, `SetPivotCommand`) | aviso |
| Q10 | setas na cena não empurram o desenho | 1 | **F** (a cena e as teclas) | aviso |

**Q8 e Q9 são a mesma forma** (regra 27): *a conta põe o pivô novo na origem do
osso, em vez de no lugar onde o pivô velho estava.* Para um desenho preso num
osso pelo próprio pivô, dá no mesmo. Para um desenho solto — que é como o
Recorte faz toda imagem nascer desde o lote 60 — o desenho pula. O Spriter
diz o contrário: a imagem nova entra *"no lugar da atual, pelos pivôs das duas"*.
