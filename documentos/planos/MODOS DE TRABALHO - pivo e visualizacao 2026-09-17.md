# Modos de trabalho — Pivô e Visualização — 17/09/2026

Do PESQUISADOR para o PLANEJADOR. Encargo: `MODOS DE TRABALHO - pivo e visualizacao - encargo 2026-09-17.md`. Pergunta aberta: Q37 (`programa-novo/12`).
**Isto é pesquisa. Nada foi feito no código.** Data conferida na máquina: 17/09/2026.

Siglas das fontes:

| Sigla | Arquivo |
|:---|:---|
| SPR | `pesquisa/nova pesquisa/spriter/Spriter Pro - manual oficial 1.4.pdf` e `… todas as funcoes 2026-09-08.md` |
| SPN | `pesquisa/nova pesquisa/spine/Spine User Guide - manual completo 2026-09-08.pdf` e `… todas as funcoes` |
| DB | `pesquisa/nova pesquisa/dragonbones/DragonBones Pro - manual completo 2026-09-08.pdf` e `… todas as funcoes` |
| PS | Adobe, *Save custom workspaces* — https://helpx.adobe.com/photoshop/desktop/get-started/learn-the-basics/save-custom-workspaces.html |

---

## A resposta, em três linhas

| Modo | Recomendação |
|:---|:---|
| **Pivô** | **Painel**, não modo: uma aba "Pivôs" que mostra a pasta inteira de uma vez. Nada tranca |
| **Visualização** | **Arranjo de janela** + a Prévia de hoje crescida: tela cheia com a lista de animações e de peles **dentro** |
| **Peles** | Nada novo agora. Ele disse *"nem tanto"*; o painel Peles (I7) já cobre |

---

## 1. Como os três fazem

### Pivô e organizar desenhos

| Programa | Como faz | Fonte |
|:---|:---|:---|
| Spriter | Pivô **por imagem**: duplo clique na imagem da paleta abre a janela. Atalhos para cantos, meios e centro | SPR cap. 4 · `todas as funcoes` §3 linha 4 |
| Spriter | **Copy / Paste Default Pivots**: acerta um, marca vários, cola em todos | SPR cap. 4 · `todas as funcoes` §5.3 |
| Spriter | A janela é **um pedaço da paleta**, não uma tela à parte. A paleta fica sempre na direita | SPR `todas as funcoes` §4 |
| Spriter | **Pastas**: organizadas **no disco, antes de começar** (pasta do projeto, subpasta por personagem). O programa só lê | SPR cap. 3 "Organizing your project folders" |
| Spriter | Pivô arrastado na cena é outra coisa (não é o padrão); botão direito → "use default pivot point" desfaz | SPR cap. 4 |
| Spine | **Não tem pivô por imagem.** A posição é do anexo, feita na pose de repouso | SPN "Images node", "Region attachments" |
| Spine | Nó **Images** na Árvore: aponta a pasta, **vigia o disco** e recarrega sozinho. Ícone laranja = sem uso, verde = em uso | SPN cap. Images |
| Spine | Pastas = pastas do disco. Não confirmei se dá para mover imagem de pasta dentro do Spine | SPN cap. Images |
| DragonBones | Painel **Recursos**: a biblioteca é uma pasta de verdade; arrastar PNG copia para ela | DB §3.8 |
| DragonBones | O painel Recursos **só aparece no modo montagem** | DB §3.8 |
| DragonBones | Pivô por imagem: **não confirmei** (não achei no manual) | DB |
| Photoshop | **Espaços de trabalho**: arruma painéis, `Janela › Espaço de trabalho › Novo`, dá nome. Troca na barra, sem fechar nada | PS |
| Aseprite | Não confirmei. Não pesquisei | — |

### Prévia e tela cheia

| Programa | Como faz | Fonte |
|:---|:---|:---|
| Spriter | **Não tem vista de prévia separada.** Toca na própria cena, com barra de velocidade | SPR cap. 11 · `todas as funcoes` §4 |
| Spine | **Preview view**: painel próprio, lista **todas as animações**; clicar toca, clicar de novo limpa. Trilhas, velocidade, mistura, alpha | SPN cap. 35 Preview view |
| Spine | A Preview serve para **ver tocando enquanto edita** a pose ou a animação | SPN cap. 35 |
| Spine | Opção **Hide controls**: some a lista e os botões, fica só o palco | SPN cap. 35 View settings |
| Spine | Peles dentro da Preview: **não confirmei**. As peles se ligam na vista **Skins**, com alfinete (várias ao mesmo tempo) | SPN cap. 36 Skins view |
| Spine | Vistas são abas: arrastar, redimensionar, reabrir pelo seletor **Views**. Não saem da janela | SPN cap. 25 Views |
| Spine | **Setup / Animate**: dois modos, cada um com a sua lista de vistas. **É o que não queremos** (M4) | SPN "Setup/animate mode" · cap. 25 |
| DragonBones | Botão **Prévia** abre a animação **no navegador**; várias animações, troca clicando | DB §3.1 |
| DragonBones | Barra de modo: montar ↔ animar. Painéis somem conforme o modo (Recursos, Hierarquia, Animações) | DB §3.2, §3.7–3.9 |

**O que se tira disto:**

| # | Lição | Fonte |
|:---:|:---|:---|
| 1 | Ninguém tem "Modo Pivô". O pivô mora **na paleta de imagens**, sempre à vista | SPR · SPN |
| 2 | Quem tranca painel por modo (Spine, DragonBones) é justamente o que saiu de nós | DB §3.8 · SPN cap. 25 · `AVALIACAO o modo montar` |
| 3 | Prévia boa = **lista de animações clicável** + palco. A do Spine é painel, não modo | SPN cap. 35 |
| 4 | "Modo" sem tranca já existe no mundo: **espaço de trabalho** do Photoshop | PS |

---

## 2. Modo, painel ou arranjo? O que já existe

### O que o Recorte já tem

| O quê | Onde | Como é hoje | Fonte |
|:---|:---|:---|:---|
| Janela **Definir pivô…** | Imagens → botão direito, ou botão | **Uma imagem por vez**. Janela **modal** (véu, `aria-modal`). Clique na articulação ou nove pontos. `Enter` grava, `Esc` desiste | `editor/src/panels/pivot-dialog.ts` |
| **Repetir para a pasta** | na mesma janela | Mesmo pivô em toda a subpasta. Na raiz, desligada, e diz por quê | `pivot-dialog.ts` `repeatLabel` · lote 61 |
| Carimbar, Copiar e Colar pivô | painel Imagens | Cruz no pivô de cada miniatura; aviso de pivôs diferentes | `editor/src/panels/palette.ts` cabeçalho, `PIVOT_HINT` |
| Pastas | painel Imagens | Lidas do disco: Abrir pasta, Recarregar. Seções por subpasta | `palette.ts` `OPEN_FOLDER_HINT`, `RELOAD_HINT` |
| Pôr imagem **em pasta** dentro do programa | — | **Não achei.** Não confirmei que não exista | `palette.ts`, `io/project-folder.ts` (lidos por cima) |
| **Prévia** | painel | Palco próprio, **esqueleto próprio**: nada chega à cena nem ao arquivo. Até 4 camadas, animação por lista | `editor/src/panels/preview.ts` cabeçalho |
| Tela cheia da Prévia | botão, `F11` com foco na Prévia | Vai a tela cheia **só a caixa do palco**. As camadas e a lista **ficam de fora** | `preview.ts` `toggleFullscreen` |
| Peles na Prévia | — | Segue as peles ligadas no editor (`doc.visibleSkins`). **Não há botão de pele dentro da Prévia** | `preview.ts` `rebuildState` |
| Arranjo de janelas | menu Janela | Arrastar, fechar, recolher, **um** arranjo guardado na máquina, "Voltar ao padrão", "Esconder painéis" (`Tab`) | `ui/menus.ts` · `ui/shell.ts` · `programa-novo/06` |
| **Arranjos com nome** (Construir, Animar…) | — | **Não existem ainda.** Eram proposta | `AVALIACAO o modo montar` §4 · `ui/menus.ts` |

**Correção ao encargo:** o menu Janela guarda **um** arranjo, não vários. Arranjo com nome é obra nova (pequena). Fonte: `ui/menus.ts` (só "Voltar ao padrão"), `ui/shell.ts` `resetLayout`.

### A escolha

| | Modo (troca a tela e o estado) | Painel (aba) | Arranjo de janela (só a tela) |
|:---|:---|:---|:---|
| **Pivô** | Não. Repete o Montar | **Sim.** Aba "Pivôs": a pasta inteira em grade, cada miniatura com a cruz | Sim, como atalho: um arranjo "Pivô" abre essa aba grande |
| **Visualização** | Não. Tela cheia que tranca a edição é freio | Já é: a Prévia | **Sim.** Arranjo "Visualização" + tela cheia com controles dentro |

Fonte da coluna "Modo": `AVALIACAO o modo montar` §4 (a ideia boa é a arrumação da tela, não o estado) · `programa-novo/06` M4.

---

## 3. Lugar ou freio

**Lugar** arruma a tela para uma tarefa. **Freio** muda o que o programa deixa fazer.

| Nunca pode ficar bloqueado dentro do "modo" | Por quê | Fonte |
|:---|:---|:---|
| **Desfazer / refazer** | Toda edição é `Command` com `revert`; o modo não pode ter pilha própria | `CLAUDE.md` regra 6 |
| **Sair com um clique ou uma tecla**, voltando à tela de antes | O Montar travava porque expulsava e prendia | `AVALIACAO o modo montar` §5 · `programa-novo/06` M4 |
| **A animação aberta e o tempo** | Entrar no modo não fecha a animação nem mexe no tocador | `AVALIACAO` §4 ("não fecha a animação, não para o tempo") |
| **Todos os painéis e o menu Janela** | "Nada some sem porta" | `programa-novo/06` "A régua dos painéis" |
| **Salvar** | Óbvio; hoje salvar não depende de modo — não confirmei no código | — |
| **Teclas de todo lugar** | Tecla tratada uma vez; o modo não rouba tecla | `CLAUDE.md` regra 12 |
| **Ver o resultado na cena** (Pivô) | Mudar o pivô e ver o personagem na hora | `programa-novo/03` I1b |
| **Editar enquanto toca** (Visualização) | A Prévia já tem esqueleto próprio: julgar sem parar de editar | `preview.ts` cabeçalho · SPN cap. 35 |
| **Avisos** | Onde não entende, avisa | `CLAUDE.md` regra 21 |

Três testes rápidos para qualquer "modo" novo:

| # | Pergunta | Se "não" |
|:---:|:---|:---|
| 1 | Ao sair, a tela e o documento estão como antes, menos o que eu editei? | é freio |
| 2 | Alguma ferramenta some ou fica cinza só porque estou nele? | é freio (M4) |
| 3 | Dá para chegar à mesma função **sem** entrar nele? | é freio |

Contra-alerta: a **janela modal** do pivô de hoje falha no teste 2 enquanto está aberta (véu por cima de tudo). Serve para uma imagem; para "acertar todos" vira freio. Fonte: `pivot-dialog.ts` (`dialog-veil`, `aria-modal`).

---

## 4. Recomendação por modo

### Modo Pivô → painel "Pivôs" (e um arranjo que o abre)

| O quê | Por quê | Fonte |
|:---|:---|:---|
| Aba nova, **não modal**, ao lado de Imagens | Os três põem o pivô na paleta, nunca em tela à parte | SPR §4 · SPN Images |
| Grade da **pasta inteira**, cruz em cada miniatura, clique acerta | É a janela de hoje, multiplicada; reusa `pivot-model.ts` | `pivot-dialog.ts` · `palette.ts` |
| Copiar / colar / repetir para a pasta **ali** | Já existem; só mudam de lugar | SPR cap. 4 · lote 61 |
| Marca de **sem uso / em uso** | Ideia do Spine, barata | SPN Images |
| Imagem de tamanho diferente **avisa** | Régua I8 e regra 21 | `programa-novo/03` I8 |
| "Pôr em pasta" | **Decidir antes**: mexer no disco é arriscado. Spriter e Spine deixam isso no sistema de arquivos | SPR cap. 3 · SPN Images · 💡 sem aval |
| Arranjo "Pivô" no menu Janela | O "modo" que ele sente, sem tranca | PS · `AVALIACAO` §4 |

### Modo Visualização → arranjo + Prévia em tela cheia de verdade

| O quê | Por quê | Fonte |
|:---|:---|:---|
| Tela cheia leva **a lista de animações e as peles junto**, não só o palco | Hoje os controles ficam de fora: em tela cheia não se troca nada | `preview.ts` `toggleFullscreen` |
| Lista de animações **clicável** (clicar toca, clicar de novo para) | O jeito do Spine, e é o que ele descreveu | SPN cap. 35 |
| Peles **da Prévia**, ligar/desligar sem mexer nas peles do editor | Testar pele não pode mudar o trabalho; a Prévia já tem esqueleto próprio | `preview.ts` `rebuildState` · 💡 sem aval |
| Botão "esconder controles" | Igual ao Hide controls do Spine | SPN cap. 35 |
| `Esc` sai, a tela volta como estava | Teste 1 de "lugar" | §3 |
| Sem "Visualização" que tranca a edição | Editar enquanto toca é a vantagem | SPN cap. 35 · M4 |

### Peles

Nada agora. *"nem tanto"* (encargo). O painel Feitas/Ativas (I7) e as peles na Prévia cobrem. Fonte: `programa-novo/04` I7.

---

## Não confirmei

| O quê |
|:---|
| DragonBones: pivô por imagem |
| Spine: peles dentro da Preview view; mover imagem de pasta dentro do programa |
| Aseprite: não pesquisei |
| Recorte: se há como pôr imagem em pasta dentro do programa (li `palette.ts` e `project-folder.ts` por cima) |
| Recorte: que Salvar e as teclas globais funcionam com a janela do pivô aberta |
| Custo em linhas de qualquer das recomendações |
