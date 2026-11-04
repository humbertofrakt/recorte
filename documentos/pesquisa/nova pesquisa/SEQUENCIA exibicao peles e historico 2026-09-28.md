# Sequência — ver, esconder e vestir — 28/09/2026

Chat I, `EXECUTANDO · exibição, peles e histórico`. Lote 1: **a referência**.
Escrito às 23h56 (relógio da máquina). Lido na internet nesta noite.

Assunto: esconder e travar peças · papel de cebola · fazer e vestir uma pele ·
voltar passos (Histórico).

A ordem da casa: **a fila do Spriter primeiro; as ferramentas do Spine
encaixadas nela.** Onde não achei fonte, está escrito "não achei".

---

## As fontes

| # | Programa | Página | Link |
|:---:|:---|:---|:---|
| S1 | Spriter | Manual, índice | https://brashmonkey.com/spriter_manual/ |
| S2 | Spriter | What are Character Maps | https://brashmonkey.com/spriter_manual/what%20are%20character%20maps.htm |
| S3 | Spriter | Creating a Character Map | https://brashmonkey.com/spriter_manual/create%20a%20character%20map%20and%20assign%20effects.htm |
| S4 | Spriter | Activating and Stacking Character Maps | https://brashmonkey.com/spriter_manual/activating%20and%20stacking%20character%20maps.htm |
| S5 | Spriter | Saving Character Map Stacks | https://brashmonkey.com/spriter_manual/saving%20character%20map%20sets%20as%20character%20files.htm |
| S6 | Spriter | Animating Sprites and Bones | https://brashmonkey.com/spriter_manual/animating%20sprites%20and%20bones.htm |
| S7 | Spriter | Mouse Controls and Shortcut Keys | https://brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm |
| S8 | Spriter | Free × Pro | https://brashmonkey.com/spriter-pro/ |
| P1 | Spine | Skins | https://en.esotericsoftware.com/spine-skins |
| P2 | Spine | Skins view | https://en.esotericsoftware.com/spine-skins-view |
| P3 | Spine | Ghosting view | https://en.esotericsoftware.com/spine-ghosting |
| P4 | Spine | Tree | https://en.esotericsoftware.com/spine-tree |
| P5 | Spine | Tools (Options) | https://en.esotericsoftware.com/spine-tools |
| P6 | Spine | User interface (Undo/redo) | https://en.esotericsoftware.com/spine-ui |
| P7 | Spine | Cheat sheet | https://en.esotericsoftware.com/spine-cheat-sheet |
| P8 | Spine | Blog: onion skinning (versão 1.4, antigo) | https://hi.esotericsoftware.com/blog/onion-skinning-available |

Prints locais que confirmam: `spriter/prints/08-animar_209.jpg` (os quatro
botões no alto da cena), `spriter/prints/22-empilhar-character-maps_244.jpg`
(a janela Character Maps), `spine/prints/ui_undo.png` (desfazer no alto).

---

## Fila 1 — esconder e travar

### Spriter

| Passo | O que faz | Onde fica | Fonte |
|:---:|:---|:---|:---|
| 1 | Esconder **todos** os ossos | botão **Show Bones**, no alto à direita da cena · tecla `7` | S6, S7 |
| 2 | Travar todos os ossos | botão **Lock Bones**, ao lado · tecla `8` | S6, S7 |
| 3 | Esconder todos os sprites | botão **Show Sprites** · tecla `9` | S6, S7 |
| 4 | Travar todos os sprites | botão **Lock Sprites** · tecla `0` | S6, S7 |
| 5 | Esconder ou travar **uma** peça | existe no Pro: *"Lock or hide individual objects"* | S8 |

- Os quatro botões são **texto à vista**, laranja quando ligados (print 08-animar_209).
- O manual diz o porquê: travar os sprites para mexer só nos ossos, e o contrário.
- **Passo 5: não achei onde fica o botão** de esconder UMA peça. O manual não
  tem página disso. Só a tabela Free × Pro diz que existe.

### Spine

| Passo | O que faz | Onde fica | Fonte |
|:---:|:---|:---|:---|
| 1 | Esconder uma peça | o **ponto de visibilidade**, na borda esquerda de cada linha da Árvore | P4 |
| 2 | Esconder a peça **e os filhos** | botão direito no ponto de visibilidade | P4 |
| 3 | Esconder o escolhido pelo teclado | tecla `H` (*Toggle visibility*) | P7 |
| 4 | Esconder/travar **por tipo** | painel **Options** da barra de ferramentas: três linhas (ossos · região e malha · outros) × três colunas (**selecionar** · **ver** · **nomes**) | P5 |

- Ponto importante do Spine: com o "ver" desligado, a peça **continua
  escolhível pela Árvore**, e aparece quando o mouse passa por cima (P5).
- "Travar" no Spine é a coluna **selecionar** do Options: o clique passa pela peça.
- Travar **uma** peça só: não achei no Spine.

### O que tiramos daqui

| O quê | Modelo |
|:---|:---|
| Os quatro botões de tipo (ver/travar ossos e desenhos), com as teclas 7 8 9 0 | **Spriter** — à vista, no alto da cena |
| A tabela tipo × (ver, travar, nome) | **Spine**, painel Options |
| Esconder UMA peça | **Spine**: ponto na Árvore, tecla `H` |
| A peça escondida continua achável pela Árvore | **Spine** |

---

## Fila 2 — o papel de cebola

### Spriter

| Passo | O que faz | Fonte |
|:---:|:---|:---|
| 1 | Existe, no Pro: *"Onion skinning to see previous and up-coming key-frames"* | S8 |

**Não achei** onde fica o botão, nem as opções. O manual (37 capítulos, S1)
não tem página de onion skin.

### Spine

| Passo | O que faz | Onde fica | Fonte |
|:---:|:---|:---|:---|
| 1 | Estar numa animação (modo Animate) | a vista só existe animando | P6, P8 |
| 2 | Abrir o Ghosting | botão **Ghosting**, logo acima da dopesheet | P8 (1.4, antigo) |
| 3 | Ligar antes / depois | caixas **Before** e **After**, com o número de quadros de cada | P3 |
| 4 | De quanto em quanto | **Frame step** | P3 |
| 5 | Só nas chaves | seção **Key Frames**: Before, After, Key frame step | P3 |
| 6 | A cor | dois botões de cor: antes e depois | P3 |
| 7 | Como desenha | **Images** (tinge) ou **Solid** (cor chapada); contorno **Silhouette** ou **Xray** | P3 |
| 8 | Opções | **Anchor** (fixo no quadro 0) · **On top** · **Loop** · desvio X e Y · só o escolhido | P3 |

- A página oficial do Ghosting (P3) **não diz** onde se liga. Quem diz é o
  blog antigo (P8): o botão acima da dopesheet. **Pode ter mudado** na versão 4.

### O que tiramos daqui

| O quê | Modelo |
|:---|:---|
| O botão de ligar **perto da linha do tempo** | Spine (P8) |
| Antes/depois com número e cor própria | Spine (P3) |
| Só nas chaves, ou quadro a quadro | Spine (P3) |

---

## Fila 3 — fazer e vestir uma pele

### Spriter — o *Character Map*

| Passo | O que faz | Onde fica | Fonte |
|:---:|:---|:---|:---|
| 0 | Arrumar a arte: uma **pasta por peça** (cabeças, capas), com nomes iguais | no disco | S2 |
| 1 | Abrir a janela | botão **CharMaps**, alto à direita da paleta de Animações | S3 |
| 2 | Criar o mapa | **Create New Character Map**, embaixo à direita | S3 |
| 3 | Trocar uma imagem | coluna esquerda: clique na imagem · coluna direita: **botão direito** na substituta | S3 |
| 3b | Trocar uma pasta inteira | o mesmo gesto, numa pasta | S3 |
| 4 | Esconder uma imagem com o mapa | escolher na esquerda, **Set Hidden** | S3 |
| 5 | Desfazer uma troca | escolher na esquerda, **set ignored** | S3 |
| 6 | Fechar | **OK** — o mapa aparece na coluna **Available** | S4 |
| 7 | **Vestir** | arrastar o nome de **Available** para **Active** · muda na cena **na hora** | S4 |
| 8 | Vestir vários | vários na coluna Active ao mesmo tempo (a pilha) | S4 |
| 9 | Editar de novo | **duplo clique** no mapa | print 22-…_244 |
| 10 | Guardar a pilha | disquete azul, embaixo à esquerda · abrir de volta: pasta amarela | S5 |

- **A janela ensina o gesto escrito nela mesma:** *"drag character maps from
  Available To Active to apply them"* e *"double click to edit a character map"*
  (print 22-…_244). É a régua do arroz: a panela diz o que fazer.
- Desligar: tirar da Active. **Não achei** o texto que diz; o manual só diz ligar.
- Quem vence quando dois mapas trocam a mesma imagem: **não achei**.

### Spine — *Skins*

| Passo | O que faz | Onde fica | Fonte |
|:---:|:---|:---|:---|
| 1 | Criar a pele | Árvore → nó **Skins** → **New… → Skin** · ou o ícone de pele nova à direita da aba **Skins** | P1, P2 |
| 2 | Criar o **lugar** da peça que troca | escolher osso, slot ou anexo → **New… → Skin Placeholder** | P1 |
| 3 | Pôr a peça no lugar | com a pele **ativa** (o ponto), arrastar o anexo para o placeholder | P1 |
| 4 | **Vestir** | clicar a pele na vista **Skins** (= clicar o ponto dela na Árvore) · só a ativa se edita na cena | P2 |
| 5 | Vestir várias | o **alfinete** (pin) à direita, ao passar o mouse · fica laranja | P2 |
| 6 | Quem vence | a de **cima** vence; a ativa sem alfinete entra **por último** · arrastar reordena | P2 |
| 7 | Renomear · só escolher | duplo clique · botão direito | P2 |
| 8 | Duplicar | botão direito na pele, com opções | P1 |
| 9 | Osso e regra só daquela pele | **Add to skin** | P1 |

### O que tiramos daqui

| O quê | Modelo |
|:---|:---|
| Duas colunas, **arrastar para ligar** | **Spriter** (Available → Active) |
| A frase do gesto escrita **dentro** do painel | **Spriter** |
| Uma pele é **a que se edita** (o lápis), as outras só se veem | **Spine** (ativa × pinned) |
| A de cima vence, arrastar reordena | **Spine** |
| Duplo clique renomeia | Spine · no Spriter duplo clique **edita** |
| Esconder uma peça **na pele** | **Spriter** (Set Hidden) |

---

## Fila 4 — voltar passos

| Programa | O que tem | Onde | Fonte |
|:---|:---|:---|:---|
| Spriter | **Não achei.** O manual não lista desfazer nos atalhos (S7) | — | S1, S7 |
| Spine | Desfazer `Ctrl+Z` · refazer `Ctrl+Shift+Z` ou `Ctrl+Y` · botões na barra do alto, ao lado do logotipo | alto, à esquerda | P6, P7, print `ui_undo.png` |
| Spine | **Lista do histórico**: a página diz nada sobre lista. **Não achei** | — | P6 |

- **Nenhum dos dois tem painel de histórico** que se ache no manual.
- O nosso Histórico é **a mais**. O modelo de referência dele não está nos
  três programas da casa. Os que têm (Photoshop, Aseprite) ficam fora desta
  ficha — **não pesquisei** a fundo, para não sair da ordem da casa.

---

## A fila que o nosso programa deve seguir (a hipótese do Lote 2)

| # | Passo | Panela esperada (modelo) | Arroz esperado |
|:---:|:---|:---|:---|
| 1 | Esconder todos os ossos · travar | botão à vista no alto da cena + tecla 7/8 (Spriter) | os ossos somem · o clique passa |
| 2 | Esconder UMA peça | `H`, e o olho na linha da Árvore (Spine) | a peça some; a linha dela **diz** que está escondida |
| 3 | Trazer tudo de volta | um gesto só | tudo volta; o rodapé diz |
| 4 | Ligar a cebola | botão perto da linha do tempo (Spine) | os vizinhos em cor, antes e depois |
| 5 | Ajustar a cebola | antes/depois, número, cor (Spine) | a cena muda na hora |
| 6 | Criar uma pele | botão **+** no painel Peles (Spine: ícone ao lado da aba) | a pele aparece na lista **e** fica sendo a que se edita |
| 7 | Pôr peça na pele | com a pele no lápis, trocar a imagem | a troca aparece na cena |
| 8 | Vestir / tirar | arrastar para a coluna ativa (Spriter) | a cena troca na hora |
| 9 | Duas peles, a de cima vence | arrastar para reordenar (Spine) | a cena mostra a de cima |
| 10 | Voltar passos | `Ctrl+Z`, e o Histórico com uma linha por passo | a cena volta; a linha atual marcada |

As quatro perguntas da régua do arroz serão respondidas **passo a passo, com
foto**, no Lote 2, na seção abaixo.

---

## Lote 2 — a mesma fila no nosso programa

Feito em 29/09/2026, entre 00h00 e 00h40, na porta 5209, com o herói aberto.
Mouse e teclado de verdade, num Chrome sem janela (1440×900; um passo em 1280×720).
Fotos em `backup/fotos-rodada-final/exibicao-e-peles/lote-2*/`. Os preparos
(`lote-2_*_preparo.mjs`) estão na mesma pasta: rodam de novo e dão as mesmas fotos.

Legenda: **sim** · **não** · **meio** (acontece, mas mal).
As colunas são as quatro perguntas: **1** achei a ferramenta · **2** apareceu ·
**3** o programa disse · **4** o passo seguinte é óbvio.

### Fila 1 — esconder e travar

| # | Passo | Foto | 1 | 2 | 3 | 4 | O que se viu |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Esconder os ossos | `lote-2/02` | sim | sim | meio | sim | o botão **Ver ossos** está à vista no alto, como no Spriter. Apaga a cor laranja. O rodapé não diz nada |
| 2 | Tecla `7` traz de volta | `lote-2/03` | sim | sim | meio | sim | igual ao Spriter (7 8 9 0) |
| 3 | Travar os ossos | `lote-2/04` | sim | sim | meio | sim | o botão acende. O rodapé cala |
| 4 | Escolher `body` na Árvore e apertar `H` | `lote-2/06` | meio | sim | **não** | sim | some, e a linha da Árvore ganha a marca vermelha. **O rodapé diz "2 escondido" para UM desenho** (conta o slot e o anexo) |
| 5 | `Ctrl+Alt+3` mostra tudo | `lote-2/07` | meio | sim | sim | sim | "Tudo à vista de novo" |
| 6 | `Shift+H` — só este | `lote-2/08` | meio | **não** | **não** | não | depois do `H` a peça sai da seleção. `Shift+H` com **nada** escolhido **esconde TUDO** e diz *"Só o escolhido"*. É a regra 21: diz que fez o que não fez |
| 7 | O olho da linha `hair` na Árvore | `lote-2/09` | sim | sim | **não** | sim | esconde. O rodapé fica com a frase velha |
| 8 | **Fechar a aba Exibição** e usar o botão **Ver ossos** do alto | `lote-2b/04` | sim | **não** | **não** | não | **o botão não faz nada, e não avisa.** Medido: `ver-ossos`, `esconder-escolhido`, `ver-cebola` somem do registro quando a aba fecha. A tecla `7` continua valendo. O menu Exibir fica morto |
| 9 | Com a aba fechada, `H` | `lote-2b/05` | sim | não | sim | meio | recusa: *"está com o painel fechado. Abra pelo menu Janela"*. Honesto, mas esconder uma peça não devia depender de uma aba aberta |
| 10 | A aba Exibição em 1280×720 | `lote-2f/01`, `sonda` | sim | meio | — | — | **a aba já rola** (pede 379 px, tem 186). Os grupos **não dobram**. No alto, **"Travar desenhos" sai cortado** na borda da janela ("Trav") |

### Fila 2 — a cebola

| # | Passo | Foto | 1 | 2 | 3 | 4 | O que se viu |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Abrir a `walk` | `lote-2b/07`, `08` | sim | sim | sim | sim | um clique **escolhe**; o duplo clique abre. O rodapé diz |
| 2 | Ligar a cebola: o botão na régua da linha do tempo | `lote-2b/09` | sim | **não** | sim | meio | o botão fica **perto da linha do tempo**, como no Spine. O rodapé diz *"Casca de cebola ligada"*. **Na cena quase nada aparece:** o fantasma é só um risco fino de osso, por trás do boneco. Ampliando, só se vê nos pés. O Spine desenha as **imagens** tingidas |
| 3 | As opções da cebola | `lote-2b/10` | sim | **não** | — | não | abre uma janelinha **cortada**: só *"Só nas chaves"* aparece, espremida na faixa do Resumo |

### Fila 3 — fazer e vestir uma pele

| # | Passo | Foto | 1 | 2 | 3 | 4 | O que se viu |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Aba Peles → **Nova pele** (+) | `lote-2c/02` | sim | sim | sim | **não** | a pele nasce em Feitas **e** em Ativas, com o lápis nela. O rodapé diz *"Os anexos novos nascem nela"*. **Na coluna Ativas os nomes saem "p." e "d"**: não se lê. Em Feitas, as duas armaduras saem iguais: "armad…" |
| 2 | Pôr uma peça na pele: escolher `body` → Propriedades → Imagem → `arm` | `lote-2e/01`, `02` | meio | sim | **meio** | não | a janela "Trocar a imagem de body" abre. **A troca foi para a pele `default`, e não para a pele nova do lápis** (medido no arquivo). O rodapé diz *"body/body agora mostra arm"*, sem dizer qual pele |
| 3 | Vestir e tirar | `lote-2c/02` | meio | — | — | — | arrastar de Feitas para Ativas (o modelo do Spriter) e o × de cada linha. A câmera sem janela não arrasta: **não medido** |
| 4 | `Ctrl+Z` duas vezes (desfaz a troca e a pele) | `lote-2e/05`, `06` | sim | sim | **não** | não | a pele some, mas **a pilha e o lápis continuam numa pele que não existe**. Aparece *"1 aviso"* e a aba diz *"Fora da lista: pele"*. O aviso é honesto; o defeito é o desfazer não levar a pilha junto |

### Fila 4 — voltar passos

| # | Passo | Foto | 1 | 2 | 3 | 4 | O que se viu |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|
| 1 | Aba Histórico | `lote-2e/03` | sim | sim | sim | sim | uma linha por passo, o atual marcado (●), a dica em cima: *"Clique num passo para voltar até ele"* |
| 2 | `Ctrl+Z` | `lote-2e/04` | sim | sim | sim | sim | *"Desfeito: Trocar o desenho do slot"* |
| 3 | Clicar na primeira linha | `lote-2c/08` | sim | sim | sim | sim | *"Já está em Arquivo aberto"* |

**O Histórico passa nas quatro.** Nenhum dos dois programas de referência tem esse painel.

### Onde a fila quebra — a lista

| # | O defeito | Dono |
|:---:|:---|:---|
| I1 | `H` conta errado: "2 escondido" para um desenho | **chat I** (`view-panel.ts`) |
| I2 | `Shift+H` (e `H`) com nada escolhido: esconde tudo e diz que escondeu "o escolhido" | **chat I** (`view-panel.ts`) |
| I3 | Fechar a aba Exibição mata o botão **Ver ossos** do alto e o menu Exibir, sem aviso | **chat I** (`view-panel.ts`) + passagem `ui/actions-table.ts` |
| I4 | A cebola ligada quase não aparece: só riscos finos de osso | **chat I** (`viewport/onion.ts`) |
| I5 | Desfazer "Nova pele" deixa a pilha e o lápis numa pele que não existe | **chat I** (`skins-actions.ts`) |
| I6 | Coluna Ativas estreita: "p." e "d". Feitas: duas "armad…" | **chat I** (`skins.css`) |
| I7 | Depois de "Nova pele", o passo seguinte não está escrito | **chat I** (`skins-model.ts`), depende do O2 |
| I8 | A aba Exibição rola, mas os grupos não dobram (D5) | **chat I** (`view-panel.ts`) |
| O1 | O olho da Árvore esconde e não diz nada no rodapé | chat D (`panels/tree*`) |
| O2 | Trocar a imagem com o lápis numa pele nova troca na `default`, e o rodapé não diz a pele | chat H (`panels/image-picker*` / `palette-model.ts`) |
| O3 | 1280×720: "Travar desenhos" cortado na borda da barra do alto | a barra de ações (`ui/shell*`, chat A) |
| O4 | "Opções da casca de cebola" abre cortada: só "Só nas chaves" | chat D (`panels/dopesheet-player.ts`) |
