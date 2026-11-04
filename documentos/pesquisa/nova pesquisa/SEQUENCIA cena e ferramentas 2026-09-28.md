# Sequência — mexer no boneco na cena — 28/09/2026

Chat F, `EXECUTANDO · cena e ferramentas`. Lote 1: **a referência**.
Lido na internet em 28/09/2026, 23:53–23:56 (relógio da máquina).

**A pergunta:** em que ordem se faz, na cena, escolher · mover · girar ·
escalar · criar osso · criar ponto · criar caixa · posar?
E, em cada passo: onde está a panela, o que aparece, o que avisa, qual o próximo.

---

## As fontes

| # | Programa | Página | Link |
|:---:|:---|:---|:---|
| S1 | Spriter | Quickstart (15 passos) | https://brashmonkey.com/spriter_manual/getting%20started.htm |
| S2 | Spriter | Placing a Sprite | https://brashmonkey.com/spriter_manual/placing%20a%20sprite.htm |
| S3 | Spriter | Default Pivot Points | https://brashmonkey.com/spriter_manual/default%20pivot%20points.htm |
| S4 | Spriter | Creating and Assigning Bones | https://brashmonkey.com/spriter_manual/creating%20and%20assigning%20bones.htm |
| S5 | Spriter | Animating Sprites and Bones | https://brashmonkey.com/spriter_manual/animating%20sprites%20and%20bones.htm |
| S6 | Spriter | Key All vs Key Selected | https://brashmonkey.com/spriter_manual/key%20all%20vs%20key%20selected.htm |
| S7 | Spriter | Collision Rectangles | https://brashmonkey.com/spriter_manual/adding%20collision%20rectangles%20to%20frames.htm |
| S8 | Spriter | Action Points | https://brashmonkey.com/spriter_manual/adding%20spawning%20points%20to%20frames.htm |
| S9 | Spriter | Mouse and Keyboard Controls | https://brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm |
| S10 | Spriter | página de venda, Free × Pro | https://brashmonkey.com/spriter-pro/ |
| P1 | Spine | Tools | https://esotericsoftware.com/spine-tools |
| P2 | Spine | Bones | https://esotericsoftware.com/spine-bones |
| P3 | Spine | Images | https://esotericsoftware.com/spine-images |
| P4 | Spine | Bounding boxes | https://esotericsoftware.com/spine-bounding-boxes |
| P5 | Spine | Points | https://esotericsoftware.com/spine-points |
| P6 | Spine | Keys | https://esotericsoftware.com/spine-keys |
| P7 | Spine | User interface | https://eu.esotericsoftware.com/spine-ui |

A pesquisa antiga da casa confere com isto: `spriter/Spriter - todas as funcoes 2026-09-08.md`
(capítulos, painéis, a "ferramenta do Alt" lida nos prints) e `spine/Spine - todas as funcoes 2026-09-08.md`.

---

## 1. A fila do Spriter — passo a passo

| Passo | O que se faz | A panela (onde) | O que aparece / avisa | Fonte |
|:---:|:---|:---|:---|:---|
| 1 | Pôr a imagem na cena | **arrastar** do *file palette* (direita, em cima) para o centro | o sprite na cena | S1 passo 5, S2 |
| 2 | **Escolher** | **clique esquerdo** no sprite | *"transform controls which appear around the sprite"* | S2 |
| 3 | Mover · girar · esticar | os **controles em volta** do escolhido, direto na cena. Sem trocar de ferramenta | o sprite muda; os números no *Object properties* (esquerda, embaixo) | S1 passo 5, S2 |
| 4 | Ajuste fino | *Object properties*: x, y, ângulo, escala, opacidade | o número | S2 |
| 5 | Pivô de um sprite | arrastar a **bolinha redonda** do pivô, na cena. Botão direito nela: *"use default pivot point"* | a bolinha | S3 |
| 6 | Escolher vários | **Ctrl+A** ou retângulo de seleção | os controles em volta de todos | S1 passo 7 |
| 7 | **Criar osso** | **segurar Alt e arrastar** do começo ao fim. A ponta grossa é o pivô | *"the bone automatically becomes selected"* | S4 |
| 8 | Osso filho | com o pai **ainda escolhido**, Alt+arrastar de novo | o novo já nasce filho — a cadeia sai em sequência | S4 |
| 9 | Acertar o osso | **soltar o Alt** e escolher, mover, girar, escalar | clicar de novo num osso escolhido mostra os controles de tamanho | S4, S9 |
| 10 | **Prender imagem ao osso** | osso escolhido → **segurar B** → clicar nos sprites | *"all Sprites become more translucent"*; o preso fica **mais opaco**. Clicar de novo solta | S4 |
| 11 | Conferir | posar em pose extrema, ver a ordem Z | — | S1 passo 9, S4 |
| 12 | **Criar caixa** | o seletor *"Currently Equipped Tool"* no alto do painel direito → **create box** → Alt+arrastar | a caixa; clicando, *"transform gizmo's appear"*: esticar, girar, pivô *"just like images"*. Nome: duplo clique no *Z-order palette* | S7 |
| 13 | **Criar ponto** | o mesmo seletor → **create point** → Alt+arrastar: cria **e** dá o ângulo. Clique sem arrastar = ângulo 0 | o ponto; nome no *Z-order palette*; ângulo no *Object properties* | S8 |
| 14 | **Posar** | ir a outro tempo na linha do tempo → mexer | *"Editing any sprite or bone while on a new point in the time line will automatically create a key frame"* | S5 |
| 15 | Guardar a pose sem mexer | **Key selected** / **Key all**, no alto à direita da linha do tempo | a chave | S6 |
| 16 | Não pegar o que não quer | botões **show** e **lock** de sprites e ossos, no alto à direita da cena · teclas 7 8 9 0 | o travado não se escolhe | S5, S9 |

**Teclas da cena** (S9): setas empurram 1 px · **Z** escolhe os descendentes · **Shift+Z** os ancestrais ·
Ctrl segurado ao arrastar/girar/escalar **clona** · espaço+arrastar ou botão do meio move a vista · roda = zoom.

**IK no Spriter:** a página de venda (S10) diz *"Basic IK"* no Free e *"Full IK support and IK locking"*
no Pro. **Como se opera, não achei em página oficial.** Um resumo de busca disse "Shift ao girar" e
"botão direito no osso trava o IK" — **não confirmado**: a página de onde viria (fórum da Steam) não
tinha isso quando aberta. Fica fora da régua até achar a fonte.

### A forma da fila do Spriter

| Traço | O que quer dizer para nós |
|:---|:---|
| **Uma mão só** | escolher, mover, girar e esticar são o **mesmo** estado: clicou, aparecem as alças, arrasta. Não se troca de ferramenta para girar |
| **Criar é um modificador** | Alt+arrastar cria. **O quê** cria sai de um seletor à vista (osso · caixa · ponto) |
| **O criado já vem escolhido** | o osso nasce escolhido, e por isso o próximo Alt+arrastar faz o **filho**. A sequência encadeia sozinha |
| **Prender é segurar uma tecla** | B + clique, com a cena **mudando de cara** (tudo translúcido) enquanto vale |
| **Posar é só mexer** | não há modo de pose: mexeu fora de chave, a chave nasce |

---

## 2. A fila do Spine — as ferramentas que encaixam

| Passo | O que se faz | A panela (onde) | O que aparece / avisa | Fonte |
|:---:|:---|:---|:---|:---|
| 1 | Pôr a imagem | arrastar do nó `Images` para a cena | *"Spine will create a slot and a region attachment under the root bone"*. Ícone da imagem: **laranja** = sem uso, **verde** = usada | P3 |
| 2 | **Escolher** | não há ferramenta de escolher: *"smart selection system"*. Clique · **Ctrl+clique** soma · **Ctrl+arrastar** faz caixa · **Espaço, Esc ou duplo clique no vazio** desmarca | — | P1 |
| 3 | Mover · girar · escalar · inclinar | ferramentas na **barra principal, embaixo da cena**: Rotate **C**, Translate **V**, Scale **X**, Shear **Z** | os números da ferramenta, na barra | P1, P7 |
| 4 | Travar num eixo | arrastar a alça **X** ou **Y** do ícone da ferramenta na cena | — | P1 |
| 5 | Eixos | **Local · Parent · World**, na barra | — | P1 |
| 6 | Ajuste fino | digitar na barra; `+123` soma, `*2` multiplica; roda e setas no número | — | P1 |
| 7 | Encaixe | **Shift** ao girar = passos de 15° | — | P1 |
| 8 | Comprimento do osso | com Rotate/Translate/Scale, pôr o mouse **na ponta** do osso escolhido e arrastar. **Alt** leva os filhos junto | — | P1 |
| 9 | Mexer sem arrastar os filhos | **Compensação**: *Image* e *Bone* | *"The buttons flash orange when compensation is applied"* | P1 |
| 10 | **Criar osso** | ferramenta **Create (N)**, só na montagem: escolher o pai → **clicar** (osso de tamanho zero) ou **arrastar** (dá o tamanho). Shift: o novo não fica escolhido | o osso novo, escolhido | P1 |
| 11 | Osso já prendendo imagens | com Create: **Ctrl+clique** nas imagens → soltar Ctrl → arrastar o osso | o osso nasce com as imagens | P1 |
| 12 | Osso pela Árvore | escolher o pai na Árvore → `New...` → `Bone` | *"created at the tip of the parent bone"* | P2 |
| 13 | Trocar o pai | **Set Parent** ou **P**, depois clicar o novo pai na cena ou na Árvore | — | P2, P3 |
| 14 | **Criar caixa** | escolher osso ou slot na Árvore → `New...` → `Bounding Box` | *"enters edit mode automatically"*: **clique** põe vértice; fecha clicando no primeiro ou em `New` de novo | P4 |
| 15 | **Criar ponto** | escolher osso ou slot na Árvore → `New...` → `Point` | o ícone do ponto | P5 |
| 16 | **Posar (ferramenta Pose, B)** | sobre a **origem** do osso aparece o ícone de mover → arrasta **move**; em qualquer outro lugar do osso → arrasta **gira**. Vários ossos escolhidos = **IK**. Clique no vazio desmarca, arrasto no vazio faz caixa | o ícone muda sob o mouse | P1 |
| 17 | **Chavear** | modo **Animate** (ícone no alto à esquerda da cena). Botão de chave ao lado de cada ferramenta: **verde** sem chave · **laranja** mudou e não chaveou · **vermelho** tem chave. **K** chaveia o mudado. **Auto Key** chaveia sozinho | a cor do botão; *"if the timeline position is changed, the unkeyed changes are lost"* | P6, P7 |
| 18 | Trocar de ferramenta rápido | **botão direito na cena** volta à ferramenta de antes | — | P1 |

### A forma da fila do Spine

| Traço | O que quer dizer para nós |
|:---|:---|
| **Uma ferramenta por gesto** | girar, mover, escalar e inclinar são botões separados, com tecla. Mais preciso, mais passos |
| **Criar pela Árvore** | caixa e ponto nascem em `New...` da Árvore, **não** na cena. Só o osso tem ferramenta na cena |
| **A cor diz o estado** | laranja = mudou e não guardou; verde/laranja na imagem = usada ou não. O aviso é cor, sem texto |
| **Pose é outra ferramenta** | a Pose junta mover e girar, e o cursor avisa qual vai ser |

---

## 3. O modelo que seguimos — fluxo do Spriter, ferramentas do Spine

| Passo da nossa fila | Segue | Por quê |
|:---|:---|:---|
| Escolher, mover, girar, escalar | **Spriter**: uma mão só, alças em volta do escolhido | é a ordem que o Humberto pede — sem trocar de panela no meio. Nossa `Transformar (T)` já é isso |
| Mover / Girar / Escalar separados | **Spine**, como ferramenta a mais | precisão, eixo Local/Pai/Mundo, número na barra |
| Criar osso | **Spriter** (arrastar cria, o criado fica escolhido, o próximo é filho) + **Spine** (escolher imagens antes e o osso as pega) | a cadeia sai em sequência, e a imagem entra junto |
| Criar caixa e ponto | **Spriter**: arrastar na cena, com o seletor do que se cria à vista | a panela fica na cena, e não escondida num menu da Árvore |
| Prender imagem ao osso | **Spriter**: segurar tecla + clique, com a cena mudando de cara | o aviso é a própria cena |
| Posar | **Spriter** (mexer fora de chave = chave) + **Spine** (a cor do botão diz se falta chavear) | *"a água ferveu"*: o estado da chave à vista |

**O que eu vou medir no lote 2**, passo a passo, no nosso programa: as quatro perguntas da régua do
arroz — achei a ferramenta? o que criei apareceu? o programa disse? o próximo passo ficou óbvio?

**Não achei:** como se opera o IK do Spriter (fonte oficial). DragonBones: esta ficha pede Spriter e
Spine; a pesquisa da casa (`dragonbones/`) fica para consulta, sem página nova lida hoje.

---

# Lote 2 — a MESMA fila no nosso programa — 29/09/2026, 00:00–00:22

Feita com a mão, num Chrome sem janela, no editor da porta 5206, com o herói.
Fotos em `backup/fotos-rodada-final/cena/lote-2_passo-NN_*.png`.
**Parei no passo 20** por ordem do Planejador (casa a 100% de CPU). Falta o
**posar** numa animação (Spriter passos 14–15): sai na próxima leva de fotos.

As quatro perguntas: **1** achei a ferramenta? · **2** o que fiz apareceu? ·
**3** o programa disse? · **4** o passo seguinte ficou óbvio?

| Passo | O gesto (fila do Spriter) | Foto | 1 | 2 | 3 | 4 | O que vi |
|:---:|:---|:---|:---:|:---:|:---:|:---:|:---|
| 00 | Abrir o herói | `passo-00` | sim | sim | sim | — | cartão da tela de boas-vindas; rodapé "Abriu a base" |
| 01 | Ajustar à tela | `passo-01` | sim | sim | — | — | botão Ajustar, embaixo à direita da cena |
| 02 | **Escolher** a cabeça, um clique | `passo-02_...liga-a-malha` | sim | **não** | **não** | **não** | a ferramenta **pulou para Malha** sozinha; o gizmo sumiu. É o K11 |
| 02b | Voltar a Transformar pela barra | `passo-02b` | sim | sim | — | sim | caixa girada em volta da imagem, bolinha, quadradinhos |
| 03 | **Mover**: arrastar por dentro | `passo-03` | sim | sim | **não** | sim | andou. O rodapé **não diz** "Moveu head" |
| 04 | **Girar** a cabeça pela bolinha | `passo-04` | sim | **não** | **não** | **não** | o arquivo guardou −53,8°; **a tela não mudou**. A regra `look_driver` segura a cabeça, e ninguém avisa |
| 05 | Desfazer duas vezes (Ctrl+Z) | `passo-05` | sim | sim | sim | sim | rodapé "Desfeito: Mover osso" |
| 06 | Escolher o braço | `passo-06` | sim | sim | sim | — | Propriedades diz "Osso: forearm". A Árvore **não rola** até ele |
| 07 | **Girar** o braço | `passo-07` | sim | **não** | **não** | **não** | o mesmo do 04: `ik_arm` segura o braço |
| 08 | Escolher a canela | `passo-08` | sim | sim | sim | — | — |
| 09 | **Girar** a canela | `passo-09` | sim | **sim** | **não** | sim | girou, o pé foi junto |
| 10 | **Escalar** pelo canto | `passo-10` | sim | sim | **não** | sim | esticou (141%). O número só aparece em Propriedades, abaixo da dobra |
| 11 | Pegar **Criar osso** na barra | `passo-11` | sim | — | **sim** | sim | o rodapé explica o gesto |
| 12 | **Criar osso**: arrastar no vazio | `passo-12` | sim | sim | **não** | sim | nasce escolhido, azul. **A dica longa do rodapé empurrou a coluna da direita para fora da tela** |
| 13 | **Osso filho**: arrastar de novo | `passo-13` | sim | sim | **não** | sim | `osso2` filho de `osso`, igual ao Spriter |
| 14 | Escolher o osso e **segurar P** | `passo-14` | **não** | sim | sim | sim | ao trocar de ferramenta a tela **voltou a pular 56 px**: o clique caiu no vazio. De novo, certo: rodapé "Segure P: o que está pintado já é filho" |
| 15 | P + clique na espada | `passo-15` | sim | sim | **sim** | sim | contorno verde; "sword_blade virou filho de osso" — **o melhor passo da fila** |
| 16 | Pegar **Caixa** na barra | `passo-16` | sim | — | **não** | **não** | nenhuma frase de como criar |
| 17 | Arrastar no vazio, sem Alt | `passo-17` | sim | **não** | **não** | **não** | nada. O recado "Segure Alt e arraste" existe no código e **some no mesmo quadro** |
| 18 | **Alt + arrastar** | `passo-18` | sim | sim | sim | **não** | "Caixa osso_caixa criada no osso osso". A ferramenta pulou para Malha (como no Spine: caixa nova entra em edição), mas **o rodapé não diz** |
| 19 | Pegar **Ponto** pela tecla O | `passo-19` | sim | — | **não** | **não** | nenhuma frase de como criar |
| 20 | **Alt + arrastar** | `passo-20` | sim | sim | sim | sim | cria e dá o ângulo, igual ao Spriter. Foi para o osso `root` (a caixa estava escolhida) e o rodapé diz |

## O que a fila mostrou — pela FORMA

| # | A forma | Onde | Dono |
|:---:|:---|:---|:---|
| F1 | **O recado do rodapé morre no quadro seguinte.** Com o botão apertado, a cena chama `doc.repose()` a cada quadro; isso emite uma mudança sem nome, e o rodapé volta para "Arquivo não salvo". Todo recado dito ao apertar ou ao arrastar se perde | `viewport/viewport.ts`, o laço, linha ~380 | **F** (lote 3) |
| F2 | **Fez e não avisou**: nenhum gesto de arrastar diz o que fez ao soltar (mover, girar, escalar, criar osso) | as ferramentas da cena | **F** (lote 3), junto com F1 |
| F3 | **Mexi e a regra desfez calada**: girar um osso que uma regra segura grava no arquivo e não muda a tela | ferramentas da cena (o aviso) · a regra `driver` modo `add` que ignora o giro é do `runtime/` | aviso: **F**. O modo add: **fora das cercas** |
| F4 | **Caixa e Ponto não dizem o gesto** ao serem pegos (o Criar osso diz) | `ui/toolbar-model.ts`, `toolFooter` | chat A (`ui/`) — ou F, se o Planejador mudar a cerca |
| F5 | **Escolher troca de ferramenta** (K11) | `panels/mesh-panel.ts`, `autoPickTool` | chat D |
| F6 | **A tela pula** quando o rodapé fica comprido: a dica do Criar osso empurra a coluna da direita para fora, e ao trocar de ferramenta tudo volta 56 px | CSS do rodapé em `ui/`, e o texto em `ui/toolbar-model.ts` | chat A |
| F7 | **A Árvore não rola até o escolhido** | `panels/tree*` | chat D (é o B2) |

**O que já está como o Spriter, e fica:** Transformar faz tudo com uma mão · o osso
novo nasce escolhido e o próximo arrasto faz o filho · segurar P e clicar prende,
com a cena pintada e o rodapé dizendo · Alt+arrastar cria caixa e ponto, e o ponto
já sai com ângulo.
