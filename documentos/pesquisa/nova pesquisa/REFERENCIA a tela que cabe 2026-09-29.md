# Referência — a tela que cabe — 29/09/2026

Escrita pelo chat **P** (`EXECUTANDO · a tela que cabe`), lote 1.
Relógio da máquina: 29/09/2026, 04:55.

**A pergunta:** como Spriter e Spine dividem a tela — cena, colunas, linha do
tempo, barra de estado — e o que fazem quando a janela é pequena.

**A regra:** o que não tem fonte diz *"não achei"*. Nada inventado.

---

## 1 · As fontes

| # | Fonte | Link |
|:---:|:---|:---|
| S1 | Spriter, manual oficial, *Quickstart* | https://brashmonkey.com/spriter_manual/getting%20started.htm |
| S2 | Spriter, manual oficial, *Advanced Timeline Editing* | https://brashmonkey.com/spriter_manual/advanced%20timeline%20editing.htm |
| S3 | Spriter, índice do manual (37 capítulos) | https://brashmonkey.com/spriter_manual/index.htm |
| S4 | Spriter, a tela do Humberto (print da máquina dele) | `documentos/pesquisa/nova pesquisa/spriter/prints/00-tela-do-humberto.png` |
| P1 | Spine, *User interface* | https://esotericsoftware.com/spine-ui |
| P2 | Spine, *Views* | https://esotericsoftware.com/spine-views |
| P3 | Spine, *Settings* (interface) | https://esotericsoftware.com/spine-settings |
| P4 | Spine, *Tools* | https://esotericsoftware.com/spine-tools |
| P5 | Spine, *Tree view* | https://esotericsoftware.com/spine-tree |
| Q1 | Qt, `QToolBar` (a barra que transborda) | https://doc.qt.io/qt-6/qtoolbar.html |

Imagens oficiais já baixadas na casa: `spine/prints/ui_views.png`,
`spine/prints/ui_graph-dopesheet.png`, `spine/prints/views_*.png`,
`spriter/prints/02-inicio-rapido_*.jpg`.

---

## 2 · Onde fica cada coisa

| Parte | Spriter | Spine | O nosso hoje |
|:---|:---|:---|:---|
| **Cena** | o centro (S1: *"the 'canvas' in the center of your screen"*) | tudo o que sobra fora dos painéis (P1: *"the space outside of the views"*) | o centro |
| **Coluna da esquerda** | Z-order e Hierarchy em cima, em abas; Object Properties embaixo (S1, S4) | não tem, de fábrica (P1) | Árvore / Ordem, Propriedades |
| **Coluna da direita** | File palette em cima; Animations embaixo (S1: *"upper right"*, *"lower right"*) | a Árvore; as propriedades do escolhido **no pé da Árvore** (P1, P5) | Imagens, Pivôs, Animações… em grupos com abas |
| **Linha do tempo** | embaixo, **baixa** (S1: *"at the bottom of your screen"*). No print S4: ~110 px de 1.008 | no modo Animar: **Graph embaixo, Dopesheet em ABA ao lado dele** (P1) | embaixo; Detalhes abre linhas e curvas |
| **Barra de ferramentas** | no alto, abaixo do menu, **com palavras** ("Show Bones", "Lock Sprites") (S4) | no **pé da cena**, por cima dela, **com palavras** ("Rotate", "Pose") (P1, `ui_views.png`) | no alto; ícones, nome na dica |
| **Barra de estado / rodapé** | **não tem** no print S4. Não achei no manual | **não tem.** A ajuda é a dica do mouse, ou **F1** (P3) | rodapé de uma linha, com frase |

---

## 3 · O que eles fazem quando não cabe

| Situação | Spriter | Spine |
|:---|:---|:---|
| **A barra de ferramentas não cabe** | não achei no manual. O visual (S4) é de barra Qt, e a barra Qt põe um botão de extensão no fim com o que não coube (Q1). **Não achei documento dizendo que o Spriter é Qt**: fica como indício, não como fato | **esconde as palavras** e deixa só os ícones. P3: *"`Automatic` hides them when the main toolbar no longer fits"*. E a barra pode ir para a esquerda, o centro ou a direita |
| **A linha do tempo precisa de mais linhas** | **puxa-se o topo dela para cima** (S2: *"expand the time-line area upward by left clicking the top of the time-line window"*). O manual não diz o que a cena faz | Graph e Dopesheet **dividem o mesmo lugar**, em abas (P1). Não abrem uma embaixo da outra |
| **Um painel precisa de mais altura** | arrastar a borda (visto em S4: as alças laranja nas bordas) | P2: *"Views can be resized by dragging the edge of the view"* |
| **Painéis demais** | abas embaixo de cada palette: Hierarchy / Z-order, Files / Objects, History / Animations (S4) | abas; **minimizar** vira ícone ao lado de "Views" (P2); **F9** minimiza todos (P2) |
| **A tela toda é pequena** | não achei | **Interface scale** e **Font size** (P3: *"Smaller font sizes allow more to be fit on screen"*) |
| **Voltar o arranjo** | não achei no manual | o seletor **Views** reabre o painel fechado (P1, P2) |
| **O conteúdo do painel é maior que ele** | a lista rola (S4: barra de rolagem na Palette e no Z-order) | não achei o que a documentação diz |

---

## 4 · O que tiro disso — o modelo que seguimos

Ordem da casa: **fluxo do Spriter, ferramentas do Spine encaixadas nele**.

| Defeito | O que os dois fazem | O que faremos |
|:---|:---|:---|
| **Rodapé que pula** (J4, F5, L14) | **nenhum dos dois tem rodapé de frase.** O Spine põe a frase inteira na **dica**, e no F1 | o rodapé fica: é a nossa "água ferveu". Mas **uma linha só**, altura que nunca muda, corta com "…", **frase inteira na dica** (como o Spine) |
| **Detalhes encolhe a cena** (K13) | no Spine as linhas e as curvas **dividem o mesmo lugar**, em abas; a cena é o que sobra, e sobra muito (`ui_graph-dopesheet.png`). No Spriter a linha do tempo é baixa, e cresce só quando se puxa | a cena tem **altura mínima**. Quem cede é a faixa de baixo: ela rola por dentro |
| **Barra cortada em 1280×720** (L16, I-O3) | Spine: some a PALAVRA, fica o ícone. Qt (indício do Spriter): o que não cabe vai para um botão no fim | o que não cabe vai para **"Mais ▾"** no fim. A ferramenta escolhida e Partículas **nunca** entram nele (P38) |
| **Lista de animações sem altura** (K1b) | Spriter: a palette de animações tem lugar próprio, embaixo da de arquivos, e **lista todas** (S1, S4) | a lista de animações tem **altura mínima** de algumas linhas; o divisor ganha **alça à vista** |
| **Imagens e Peles não cabem juntas** (M16) | Spriter: Files em cima, Animations embaixo, **as duas à vista** (S4) | no lote 4 (P33), o arranjo de fábrica põe a panela e o arroz à vista juntos. Proposta ao Planejador |
| **Arranjo de fábrica** (P33) | Spine: o seletor **Views** reabre o que se fechou (P2) | "Voltar ao padrão" continua existindo; **quem arrumou não perde a arrumação** |

---

## 5 · O que NÃO achei

| Pergunta | Resposta |
|:---|:---|
| O que o Spriter faz quando a janela é pequena | não achei |
| O menu `Window` do Spriter, item por item | não achei no manual nem na pesquisa de 08/09 |
| Se o Spriter é feito em Qt | não achei. Só o visual indica |
| A altura mínima da cena no Spine | não achei |
| O que o Spine faz quando o conteúdo de um painel não cabe | não achei |
| Se algum dos dois tem barra de estado | não achei nenhuma, nem no manual nem nos prints oficiais |
