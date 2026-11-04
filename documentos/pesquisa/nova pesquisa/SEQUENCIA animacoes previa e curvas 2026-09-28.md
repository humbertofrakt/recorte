# A sequência — criar, tocar e ajustar uma animação — 2026-09-28

Chat G, `EXECUTANDO · animações, prévia e curvas`. Lote 1: **a referência**.
Pesquisado na internet em 28/09/2026, das 23:53 às 23:57 (relógio da máquina).

A régua é a do arroz: **a panela** (a ferramenta), **o arroz** (o que aparece
depois de criado), **a água ferveu** (o aviso), **a ordem** (o passo seguinte).

> **Sem fonte, está escrito "não achei".** Nada aqui é palpite sobre o que um
> programa faz. Onde eu li num print e não no texto, está escrito "no print".

---

## As fontes

| # | Programa | Fonte | Link |
|:---:|:---|:---|:---|
| S1 | Spriter | Manual oficial — Quickstart | https://brashmonkey.com/spriter_manual/getting%20started.htm |
| S2 | Spriter | Manual oficial — Animating Sprites and Bones | https://brashmonkey.com/spriter_manual/animating%20sprites%20and%20bones.htm |
| S3 | Spriter | Manual oficial — Editing Timing | https://brashmonkey.com/spriter_manual/editing%20timing.htm |
| S4 | Spriter | Manual oficial — Advanced Timeline Editing | https://brashmonkey.com/spriter_manual/advanced%20timeline%20editing.htm |
| S5 | Spriter | Manual oficial — Mouse Controls and Shortcut Keys | https://brashmonkey.com/spriter_manual/mouse%20controls%20and%20shortcut%20keys.htm |
| S6 | Spriter | Manual oficial (v1.0) — Setting the tweening mode of a keyframe | http://www.brashmonkey.com/spriter_manual/setting%20the%20tweening%20mode%20of%20a%20keyframe.htm |
| S7 | Spriter | Manual 1.4 em PDF, cap. 13 (já na casa: `spriter/Spriter Pro - manual oficial 1.4.pdf`) | https://brashmonkey.com/spriter_manual/Spriter_Manual.pdf |
| S8 | Spriter | Guia do **beta** (velho, antes da 1.0) — "The Animations Window" | http://www.brashmonkey.com/Spriter_manual.pdf |
| P1 | Spine | User Guide — Keys (animação ativa, New Animation, Repeat) | https://esotericsoftware.com/spine-keys |
| P2 | Spine | User Guide — Animations view | https://esotericsoftware.com/spine-animations-view |
| P3 | Spine | User Guide — Tree (duplo clique no nó Animations) | https://esotericsoftware.com/spine-tree |
| P4 | Spine | User Guide — User interface (modo, views, layout de animar) | https://esotericsoftware.com/spine-ui |
| P5 | Spine | User Guide — Dopesheet (Loop, a linha entre chaves) | https://esotericsoftware.com/spine-dopesheet |
| P6 | Spine | User Guide — Graph (tipos de curva, alças, presets) | https://esotericsoftware.com/spine-graph |
| P7 | Spine | User Guide — Playback view (velocidade, Stepped) | https://esotericsoftware.com/spine-playback |
| P8 | Spine | User Guide — Preview view | https://esotericsoftware.com/spine-preview |

Prints já guardados na casa, usados aqui:

| Print | O que mostra |
|:---|:---|
| `spriter/prints/11-tempo_214.jpg` | os **cinco botões de tocar** no canto esquerdo da linha do tempo, e o **playback speed** ao lado |
| `spine/prints/ui_graph-dopesheet.png` | os **botões de tocar** e o **Repeat** (azul) no pé das abas Graph / Dopesheet |
| `spine/prints/animations-view_view.png` | a aba **Animations**: seletor de esqueleto, a lista, o ícone de nova animação no alto |
| `spine/prints/graph_view.png` | o Graph: o **nome da animação** no topo das linhas, os tipos de curva na barra, os botões de tocar |
| `spine/prints/preview_preview-view.png` | a Prévia: boneco à esquerda, **lista de animações** à direita, Speed, Mix, Track, Alpha |

---

## A fila no Spriter — primeiro

O Spriter **não tem modo**: a animação está sempre aberta. Não há "base" à parte.

| # | Passo | A panela (onde) | O arroz (o que aparece) | Fonte |
|:---:|:---|:---|:---|:---:|
| 1 | Projeto novo **já nasce com uma animação** | `File / New Project` (Ctrl+N) | no **animations palette** (embaixo, à direita) já há uma entidade e uma animação padrão | S1 passo 3 |
| 2 | Dar nome à animação | **duplo clique no nome** dela no animations palette | o nome novo na lista (ex.: `idle`) | S1 passo 3 |
| 3 | Criar outra animação | no animations palette | **não achei** no manual 1.4 o nome do botão. O guia do beta diz: botão direito na janela de animações → *rename, delete, clone* | S8 (velho) |
| 4 | Começar a nova a partir de uma pose velha | Ctrl+Shift+C numa animação → cria a nova → tempo 0 → Ctrl+V | a pose copiada no quadro 0 | S7 cap. 13 |
| 5 | Pôr a primeira pose | mexer no boneco na cena | editar fora de chave **cria a chave sozinho** | S2 |
| 6 | Ir a outro tempo e fazer a próxima pose | clicar noutro ponto da linha do tempo | chave nova; botões **key all** / **key selected** para chavear sem mexer | S2, S1 passo 10 |
| 7 | **Tocar** | **cinco botões no canto esquerdo da linha do tempo** (no print: início, voltar, tocar, avançar, fim). Teclas: **3** início, **4** tocar, **5** fim | o boneco **da própria cena** se mexe | S5, print `11-tempo_214` |
| 8 | Tocar mais devagar para conferir | **playback speed**, à esquerda da linha do tempo | a mesma animação, noutra velocidade | S3 |
| 9 | Mudar a duração | clicar no **segundo número** da caixa "current time" | caixa pede o tempo novo, com **"esticar as chaves"** | S3, S1 passo 12 |
| 10 | Mudar a passagem entre chaves (**a curva**) | **botão direito na chave**, na linha do tempo | três escolhas: **Instant** (parada), **Linear** (o padrão), **Custom** (tipos de curva e número de pontos de controle) | S6 |
| 11 | Acertar o tempo de uma peça só | puxar o topo da linha do tempo para cima: **uma linha por objeto** | as chaves de cada peça, para arrastar | S4 |

**Não achei no Spriter:**

| O quê | Por que importa |
|:---|:---|
| um botão de **laço** (repetir) com nome no manual | a ficha pede o laço; o manual 1.4 não o descreve |
| uma **Prévia à parte** | o Spriter toca **na própria cena**. Não há outra janela de tocar |
| um **editor de curva desenhada à mão** passo a passo | S6 só lista as escolhas; o arrasto da curva não está escrito |

---

## A fila no Spine — depois

O Spine **tem dois modos**: Setup (montar) e Animate (animar), num ícone no
alto à esquerda da cena (P4).

| # | Passo | A panela (onde) | O arroz (o que aparece) | Fonte |
|:---:|:---|:---|:---|:---:|
| 1 | Entrar no modo de animar | ícone no **alto à esquerda da cena** | o layout troca: **Graph embaixo, Dopesheet na aba ao lado** | P4 |
| 2 | Criar a animação | **três portas**: nó `Animations` na Árvore → `New...` → `Animation` · **duplo clique** no nó `Animations` · o **ícone de nova animação** à direita da aba `Animations` | a animação nova na lista, e ela fica **ativa** | P1, P3, P2 |
| 3 | Abrir (ativar) uma animação | **um clique** na aba Animations, ou a **bolinha de visibilidade** na Árvore | só pode chavear com uma animação ativa | P2, P1 |
| 4 | Renomear | **duplo clique** na aba Animations | a janela de renomear | P2 |
| 5 | Chavear | botão de chave de cada campo: **verde** sem chave · **laranja** mudado sem chave · **vermelho** com chave. `K` chaveia o que mudou. `Auto Key` chaveia sozinho | a chave na Dopesheet/Graph | P1 |
| 6 | **Aviso de perda** | sem Auto Key, mudar o tempo **perde** o que não foi chaveado | — | P1 |
| 7 | **Tocar** | botões **no pé do Graph e da Dopesheet**: início, anterior, tocar para trás, tocar, seguinte, fim, e **Repeat** (no print, o botão azul) | o boneco **da própria cena** se mexe | print `ui_graph-dopesheet` |
| 8 | Laço | **Repeat**: ligado, volta ao quadro 0 no fim; desligado, continua depois do fim. Com `Loop Start` / `End` na Dopesheet, repete só o trecho | — | P1, P5 |
| 9 | Velocidade, sem curvas | aba **Playback** (`alt+P`): Speed, **Stepped** (sem passagem), Interpolated | — | P7 |
| 10 | Ver a curva | aba **Graph**: mostra as linhas **do que está escolhido** na cena ou na Árvore; sem nada escolhido, mostra todas. Chave escolhida na Dopesheet **fica escolhida no Graph** | as curvas das chaves | P6 |
| 11 | Mudar a curva | escolher as chaves → **botão do tipo**: `Stepped`, `Linear`, `Bezier`. Presets: Automatic, Separate, Flat, Bounce, Ease out, Ease in | a linha muda na hora | P6 |
| 12 | Desenhar a curva | arrastar as **duas alças** da Bézier. `alt` separa as alças; `shift` só o comprimento. **Frame** enquadra tudo | — | P6 |
| 13 | Ver a curva na Dopesheet | a linha entre chaves: **reta** = linear, **curvinha** = Bézier, **pontilhada** = parada | — | P5 |
| 14 | **A Prévia** | aba **Preview**: a lista de animações à direita; **clique toca**, clique de novo limpa. Speed, Mix, Repeat, Track, Alpha | a animação tocando **enquanto se edita** a pose ou a animação | P8 |

**Não achei no Spine:**

| O quê |
|:---|
| as **teclas** dos botões de tocar, escritas no manual (o print mostra os botões; o texto não dá a tecla) |
| **como abrir** a Preview: a página não diz. P4 diz que toda aba se abre no seletor **Views**, no alto à direita |
| se a Preview é **um boneco à parte** ou o mesmo da cena. Escrito só: *"works the same as the viewport"* e que serve para ver a animação tocando **enquanto se edita** (P8) |

---

## A fila comparada — o que vamos medir no nosso (lote 2)

| # | Passo | Spriter | Spine | A pergunta para o nosso |
|:---:|:---|:---|:---|:---|
| 1 | Criar | já nasce uma; clone pelo botão direito | três portas: Árvore, duplo clique, ícone da aba | achei o botão **sem procurar**? |
| 2 | O arroz | o nome na lista | o nome na lista, **já ativo** | a nova **aparece e já fica aberta**? |
| 3 | Dar nome | duplo clique | duplo clique | duplo clique na lista renomeia? |
| 4 | Abrir outra | clique na lista | **um clique** na lista | um clique abre? o rodapé diz qual está aberta? |
| 5 | Chavear | mexer cria chave | K, ou Auto Key; cor do botão avisa | (é da cerca do chat D e do F — só olhar) |
| 6 | Tocar | botões **na linha do tempo**; tecla 4 | botões **no pé** do Graph e da Dopesheet | o botão de tocar está **perto da lista** ou perto das chaves? |
| 7 | Laço | não achei o botão | Repeat **ao lado** do tocar | o laço está ao lado do tocar? |
| 8 | Velocidade | slider ao lado dos botões | aba Playback | existe? onde? |
| 9 | Curva, rápido | **botão direito na chave**: Instant / Linear / Custom | botões Stepped / Linear / Bezier na barra do Graph | botão direito na chave muda a curva? |
| 10 | Curva, desenhada | Custom (não achei o passo a passo) | Graph: alças, presets | o Curvas mostra **a chave escolhida** sem eu procurar? |
| 11 | Prévia | **não tem**: toca na cena | aba Preview, lista **dentro** dela, clique toca | a Prévia serve para quê, se a cena já toca? está à vista? |

### O que a referência já diz sobre o que a auditoria achou

| A auditoria (27/09) | Spriter | Spine | Leitura |
|:---|:---|:---|:---|
| *"o tocador saiu da aba Animações e ela só lista"* | o tocador mora **na linha do tempo**, não na lista | o tocador mora **no pé do Graph e da Dopesheet**, não na lista | **os dois fazem igual a nós.** A lista só lista. O defeito não é o lugar; é se o passo seguinte (tocar) **está à vista** quando se abre a animação |
| *"a Prévia é sempre um boneco à parte"* | **não tem Prévia** | a Preview é uma aba própria, com lista própria, para ver tocando **enquanto se edita** | o Spine faz igual a nós. O defeito possível é a Prévia **não se achar**, ou não tocar o que está sendo editado — a medir no lote 2 |

**Qual modelo seguimos:** o da casa — a fila do Spriter (tocar na linha do
tempo, curva pelo botão direito na chave, sem modo), com as ferramentas do Spine
encaixadas (o Repeat ao lado do tocar, o Graph que mostra a chave escolhida, a
Prévia com a lista dentro). O conserto só se decide no lote 3, **depois** das
fotos do nosso.

---

# Lote 2 — a mesma fila no nosso programa

Feito em 29/09/2026, 00:02 a 00:10, na porta 5207, tela **1440×900**, com o
herói aberto. **Clique de mouse de verdade** (eventos do Chrome), não chamada de
função. Um só atalho, anotado no passo 8.

Fotos: `backup/fotos-rodada-final/animacoes/lote-2_NN_*.png`.
Preparo e registro de cada passo (rodapé, animação aberta, janela nativa):
`backup/fotos-rodada-final/animacoes/preparo/`.

## As quatro perguntas, passo a passo

| # | Passo | Foto | 1 Achei a panela? | 2 O arroz apareceu? | 3 Avisou? | 4 Passo seguinte óbvio? |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 1 | Abrir o herói | 01 | sim | sim | sim: *"Abriu a base"* | **não**: a lista de animações não se vê |
| 2 | Procurar "nova animação" | 02 | sim: menu **Animação**, 2º item | — | — | sim |
| 3 | Nova animação | 03 | sim | **NÃO**: a nova **não aparece na lista** | sim: *"Abriu a animação "animação""* | meio: *"Mexer grava chave"* |
| 4 | Duplo clique no nome, para renomear (Spriter e Spine) | 04 | — | **nada acontece** | não | não |
| 5 | Renomear pelo ícone lápis | 05 | sim, se achar o ícone | sim, mas por **janela do navegador** (`prompt`), fora do programa | sim: rodapé com o nome novo | sim |
| 6 | Botão direito no nome (clone, apagar — Spriter) | 06 | — | **nada acontece** | não | não |
| 7 | Clicar em `idle` para abrir | 07 | **NÃO**: a lista tem **17 px** de altura | não abriu | não | não |
| 8 | `idle` aberta (**pelo DOM**, porque o mouse não alcança) | 08 | — | sim: chaves no Resumo, rodapé *"Animação: idle"* | sim | sim: o **tocar** está à vista, embaixo |
| 9 | Tocar | 09 | sim: ▶ na linha do tempo, como no Spriter | sim: o boneco da cena se mexe | sim: o botão acende | sim |
| 10 | Abrir a Prévia com a `idle` tocando | 10 | sim: aba **Prévia**, em cima à direita | **NÃO**: *"Camada 0 — vazia"*, boneco parado | sim: *"Escolha uma animação na camada 0"* | **não**: a animação aberta não está lá |
| 11 | Escolher `idle` na camada 0, à mão | 11 | sim | a caixa diz `idle`; o título continua *"vazia"* (a conferir) | não | não |
| 12 | Botão direito na chave do **Resumo** (curva — Spriter) | 12 | — | **nada acontece** | não | não |
| 13 | Menu **Janela → Curvas** | 13 | sim, se souber que é "Curvas" | — | — | sim |
| 14 | Curvas numa animação **sem chave** | 14 | sim | gráfico vazio | **não**: só *"Passe o cursor sobre a área"* | não |
| 15 | Curvas com a `idle` | 15 | sim | sim: as linhas das chaves | meio | **não**: os botões de **formato** (Suave, Linear, Degrau…) ficam **abaixo da dobra**, e **o tocador some** (Curvas ocupa a aba da linha do tempo) |
| 16 | Curvas com um osso sem chave | 16 | — | — | sim: *"Nenhuma propriedade com chaves…"* | sim |

## Onde a fila quebra

| # | Quebra | Pela régua | Dono | Referência |
|:---:|:---|:---|:---:|:---|
| Q1 | A lista de animações tem **17 px** em 1440×900: os seis ícones em **duas linhas** comem 112 de 129 px | não tem arroz · não tem panela | **G** | Spine: a lista **é** a aba (print `animations-view_view`); o ícone de nova fica **no título** |
| Q2 | Duplo clique no nome não renomeia; o lápis abre **janela do navegador** | a sequência quebra | **G** | Spriter (S1 passo 3) e Spine (P2): **duplo clique renomeia** |
| Q3 | Botão direito no nome não faz nada | não tem panela | **G** | Spriter (S8): botão direito → renomear, apagar, clonar |
| Q4 | A Prévia abre **vazia** com uma animação aberta e tocando | criei e sumiu | **G** | Spine (P8): serve para ver a animação **enquanto se edita** |
| Q5 | Curvas: os botões de formato ficam **fora da vista** (em 866 px; o painel acaba em 847) | não se acha | **G** | Spine (P6, print `graph_view`): os tipos de curva ficam **na barra de cima** |
| Q6 | Curvas **esconde o tocador**: não se toca olhando a curva | a sequência quebra | **G** | Spine (print `graph_view`): os botões de tocar ficam **no Graph também** |
| Q7 | Curvas vazia não diz por quê | fez e não avisou | **G** | regra 21 da casa |
| Q8 | Botão direito na chave do **Resumo** não abre o menu da curva (só na linha de detalhe) | não tem panela | **D** (`dopesheet-player.ts`) | Spriter (S6): botão direito na chave → Instant / Linear / Custom |

## O que ficou bom — não mexer

| O quê | Por quê |
|:---|:---|
| Tocar na linha do tempo, a cena se mexe | é o Spriter (S5 e o print `11-tempo_214`) |
| Repetir e velocidade ao lado do tocar | é o Spine (Repeat ao lado) e o Spriter (playback speed ao lado) |
| Na base, o ▶ diz *"a base tem um quadro só. Abra uma animação para tocar"* | a água ferveu: o programa diz por que não toca |
| Rodapé *"Animação: idle — Mexer grava chave"* | diz onde se está e o que o gesto faz |
| Curvas com osso sem chave diz o que fazer | Q7 é só o caso da animação vazia |

## Acréscimo, 29/09/2026, 00:27 — a animação nasce em laço (decisão P18)

| Fonte | O que diz | Link |
|:---|:---|:---|
| S9 — Spriter, *SCML Reference* (o formato do arquivo, oficial) | o elemento `<animation>` tem `looping="true,false"`; na classe `Animation` do pseudocódigo, o valor de fábrica é `loopType=LOOPING` | https://www.brashmonkey.com/ScmlDocs/ScmlReference.html |

**Leitura:** no Spriter a animação nasce **em laço**. O `.bone` já tem o campo
`animation.loop` (schema, `"default": false`). A animação nova grava `loop: true`
ao nascer. **Nenhum campo novo.**

| Defeito do chat K | É o meu | Conserto |
|:---:|:---:|:---|
| K1 | Q1 | a lista rola e a nova nasce à vista |
| K2 | novo | renomear diz "Renomeou…", não "Abriu…" |
| K6 | novo (P18) | nasce em laço; rodapé *"Animação 'andar' criada, em laço"* |
| K7 | novo | a etiqueta "repete" acende na hora: a lista também ouve `transform` |
| K9 | Q5 | os formatos sobem para a barra de cima das Curvas |
| K14 | Q2 | renomear no lugar, sem `prompt` |

---

# Lote 3 — o plano dos consertos (escrito com a casa fechada)

Aprovado pelo `PLANEJADOR · 9f75b5`. Uma versão por conserto que se vê, com teste
que falha antes e par de fotos. **Começa na "casa livre".**

| Ordem | Conserto | Defeitos | Decisão |
|:---:|:---|:---|:---|
| 1 | A lista de animações cabe e rola. Os ícones deixam de comer o painel. Com um corpo só, a lista Corpos vira **uma linha: "Base — montar"**. A animação nova nasce **à vista, escolhida, com o campo de nome aberto**, e **em laço** | Q1, K1, K6 | P18, P33 |
| 2 | Duplo clique e lápis renomeiam **na própria linha**, sem `prompt`. O rodapé diz *"Renomeou…"*. Botão direito no nome abre o menu (renomear, duplicar, topo, exportar, apagar) | Q2, Q3, K2, K14 | — |
| 3 | A etiqueta "repete" acende na hora: a lista também ouve `transform` | K7 | — |
| 4 | A Prévia abre com a animação aberta, e a segue enquanto ninguém escolher outra à mão | Q4 | — |
| 5 | Curvas: tocar e repetir na barra de cima, como no Graph do Spine. Os formatos sobem para a barra. O aviso fica à vista, logo abaixo | Q5, Q6, Q7, K9 | — |
| 6 | Duplicar, renomear, apagar e topo valem **com a aba fechada**. Os ids passam de `painel` para `arranque` em `ui/actions-table.ts`. **Medir antes** | P28 | P35 |

**A causa do K2**, lida no código: `doc/document.ts:659` escreve *"Abriu a animação"*
a cada troca de nome da animação aberta. O conserto é na minha cerca: o painel
escreve o aviso certo **depois**. O `doc/` é do chat A e não se toca.
