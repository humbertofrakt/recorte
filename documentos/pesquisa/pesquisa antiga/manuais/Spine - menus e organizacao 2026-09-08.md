# Spine (Esoteric Software) — como o programa organiza suas funções

Pesquisa feita direto no manual oficial. Sem opinião: só o que o manual diz.

## 1. Fontes (lidas em 08/09/2026)

| Página | URL | Status |
|:---:|:---:|:---:|
| User Guide (índice) | https://esotericsoftware.com/spine-user-guide | Aberta |
| Interface (UI) | https://esotericsoftware.com/spine-ui | Aberta |
| Menus | https://esotericsoftware.com/spine-menus | 404 — não existe |
| Toolbar | https://esotericsoftware.com/spine-toolbar | 404 — não existe |
| Tree (view) | https://esotericsoftware.com/spine-tree | Aberta |
| Dopesheet (view) | https://esotericsoftware.com/spine-dopesheet | Aberta |
| Shortcuts | https://esotericsoftware.com/spine-shortcuts | 404 — não existe |
| Views (índice) | https://esotericsoftware.com/spine-views | Aberta |
| Cheat Sheet (atalhos, real) | http://en.esotericsoftware.com/spine-cheat-sheet | Aberta |
| Tools (ferramentas/toolbar, real) | https://us.esotericsoftware.com/spine-tools | Aberta |
| Settings (config) | http://esotericsoftware.com/spine-settings | Aberta |
| Editor Documentation (índice geral) | https://esotericsoftware.com/spine-editor-documentation | Aberta |
| Getting Started | https://esotericsoftware.com/spine-getting-started | Aberta |
| Import | http://en.esotericsoftware.com/spine-import | Aberta |
| Export | http://en.esotericsoftware.com/spine-export | Aberta |
| Graph (view) | https://esotericsoftware.com/spine-graph | Aberta |
| Timeline (view) | https://esotericsoftware.com/spine-timeline | Aberta |
| Outline (view) | https://esotericsoftware.com/spine-outline | Aberta |
| Weights (view) | https://esotericsoftware.com/spine-weights | Aberta |
| Ghosting (view) | https://esotericsoftware.com/spine-ghosting | Aberta |
| Mesh Tools (view) | https://esotericsoftware.com/spine-mesh-tools | Aberta |
| Animations (view) | spine-animations (várias URLs testadas) | 404 — não abriu |
| Audio (view) | https://esotericsoftware.com/spine-audio | 404 — não abriu |

Nota importante: as URLs `spine-menus`, `spine-toolbar` e `spine-shortcuts` sugeridas
não existem no site oficial. O conteúdo equivalente está em `spine-ui`,
`spine-tools` e `spine-cheat-sheet`, que foram usadas no lugar.

---

## 2. Barra de menus

**O manual não descreve uma barra de menus tradicional (tipo "Arquivo / Editar /
Exibir").** Spine tem **um único menu principal**, aberto pelo logo da Spine
no canto superior esquerdo, ou pelo atalho `alt+F` (`opt+F` no Mac).

> "Spine's main menu is accessed by clicking the Spine logo in the upper left
> corner of the Spine window. It can also be opened by pressing alt+F (opt+F
> on Mac)."

Do menu principal dá para: abrir e salvar projeto, importar, exportar e
acessar as configurações (Settings).

### Menu principal (logo da Spine)

Ordem exata de cima a baixo **não foi confirmada** em uma única página do
manual (o manual não mostra a lista completa em ordem). Os itens abaixo foram
confirmados em páginas separadas — ordem aqui é a da introdução no manual, não
garantidamente a ordem visual do menu.

| Item | Atalho | Função |
|:---:|:---:|:---:|
| Novo esqueleto (New Skeleton) | ctrl+N (cmd+N Mac) | Adiciona um esqueleto novo ao projeto |
| Abrir projeto (Open Project) | — | Abre um projeto; o botão pode ser arrastado para mostrar os últimos projetos recentes |
| Salvar (Save) | ctrl+S | Salva o projeto |
| Salvar como (Save As) | shift+clique no botão salvar | Abre o diálogo "salvar como" |
| Importar projeto (Import Project) | — | Importa esqueleto ou animação de outro projeto Spine |
| Importar dados (Import Data) | — | Importa arquivo JSON ou binário como esqueleto novo |
| Exportar (Export) | ctrl+E (cmd+E Mac) | Abre o diálogo de exportação |
| Repetir última exportação | ctrl+shift+E (cmd+shift+E Mac) | Repete a última exportação feita |
| Configurações (Settings) | F12 | Abre o diálogo de Settings |
| Tela de boas-vindas (Welcome screen) | — | Abre a tela inicial |

### Botões de atalho na barra de título (ao lado do logo)

Não são um menu — são botões fixos ao lado do logo, no canto superior
esquerdo:

| Botão | Função |
|:---:|:---:|
| Abrir projeto | Atalho rápido para abrir |
| Salvar projeto | Atalho rápido para salvar |
| Desfazer (Undo) | ctrl+Z |
| Refazer (Redo) | ctrl+shift+Z ou ctrl+Y |
| Tela de boas-vindas | Abre a Welcome screen |

---

## 3. Barra de ferramentas (toolbar)

**Onde fica:** na parte de baixo do viewport (a área principal de trabalho, à
esquerda da tela).

> "The main toolbar at the bottom of the viewport provides access to various
> tools and settings."

Ordem das ferramentas, conforme o manual:

| # | Ferramenta | Tecla | O que faz |
|:---:|:---:|:---:|:---:|
| 1 | Pose | B | Ajusta translação e rotação do osso ao mesmo tempo |
| 2 | Criar (Create) | N | Cria ossos novos no modo Setup, clicando ou arrastando |
| 3 | Pesos (Weights) | G | Usada com a view Weights, define influência dos ossos nos vértices da malha |
| 4 | Rotacionar (Rotate) | C | Gira o osso; o pivô é sempre a origem do osso |
| 5 | Transladar (Translate) | V | Move ossos ou anexos (attachments) nos eixos |
| 6 | Escalar (Scale) | X | Redimensiona ossos e sua hierarquia (uniforme ou não) |
| 7 | Cisalhar (Shear) | Z | Aplica shear (inclinação) em toda a hierarquia de ossos |

Regra citada: **botão direito do mouse alterna entre a ferramenta atual e a
última usada**, em qualquer lugar do viewport.

> "Right clicking anywhere in the viewport will toggle between the current
> tool and the last selected tool."

---

## 4. Janelas / views

Regra geral do manual:

> "Spine's user interface uses a tabbed view system to organize tools. This
> gives you the flexibility to customize the workspace to your liking."

Layout padrão: **viewport à esquerda, tree view à direita**.

> "Spine has the viewport on the left and the tree view on the right."

Views citadas no manual (lista do índice + descrições encontradas):

| View | Contém | Onde fica por padrão | Observação |
|:---:|:---:|:---:|:---:|
| Tree | Hierarquia de ossos, slots, anexos, animações, eventos, skins | Direita | Propriedades do item selecionado aparecem embaixo da própria tree |
| Dopesheet | Timing das chaves (keys), sem valores; várias propriedades ao mesmo tempo | Aba abaixo do viewport, no modo Animate | Tem "Hide toolbar" para economizar espaço |
| Graph | Timing E valores das chaves, plotados (Y = valor, X = tempo) | Aba abaixo do viewport, no modo Animate | Sincroniza seleção de chaves com o Dopesheet |
| Timeline | O timeline, igual a graph/dopesheet/audio | Pode ficar embaixo do viewport (fica mais perto do trabalho) | Existe para reduzir o quanto o mouse precisa se mover |
| Outline | Mostra a pose do esqueleto sem ossos/seleção, tipo mapa | Painel próprio | Clicar nela centraliza o viewport ali; tem toggle de Ghosting |
| Weights | Lista de ossos ligados à malha selecionada, botões de bind/auto/smooth/prune | Painel próprio | Comando central das deformações de malha |
| Ghosting | Onion skinning (poses fantasmas antes/depois) | Painel de configurações próprio | Seções: Frames, Key Frames, Motion Vectors, Display |
| Mesh Tools | Seleção suave (soft selection) de vértices de malha, path, bounding box, clipping | Painel próprio | Controles: Size (raio) e Feather (gradiente) |
| Animations | (view listada no índice do manual) | — | Página não abriu (404); não foi possível confirmar conteúdo |
| Audio | (view listada no índice do manual) | — | Página não abriu (404); não foi possível confirmar conteúdo |

### Como abrir, fechar, esconder, mover uma view

| Ação | Como fazer |
|:---:|:---:|
| Abrir | Clicar na caixa de seleção "Views" no topo da tela |
| Fechar | Clicar no ícone de menu à direita da aba e escolher "Close", ou dar duplo clique nesse ícone |
| Minimizar/esconder | Clicar no ícone de menu e escolher "Minimize", ou clicar com botão direito no ícone. Também dá para minimizar tudo com o botão de minimizar ou a tecla **F9** |
| Restaurar | Views minimizadas viram ícones ao lado da caixa "Views"; clicar restaura |
| Mover | Arrastar a aba; um retângulo laranja mostra onde pode soltar |
| Redimensionar | Arrastar a borda da view |

Limitação citada pelo manual:

> "Spine currently does not support detaching a view as its own floating
> window so it can be moved to another monitor."

Se uma view for fechada sem querer, o manual diz para usar a caixa "Views" de
novo:

> "If a view is inadvertently closed, it can be accessed again using the
> Views select box."

---

## 5. Modo Setup vs Animate

O botão de troca fica **no canto superior esquerdo do viewport**, como um
ícone.

> "Switching between setup mode and animate mode is done by clicking the icon
> in the upper left of the viewport."

- **Modo Setup**: configurar o esqueleto (ossos, slots, anexos, ordem de
  desenho, definir pai/parent).
- **Modo Animate**: criar as animações; nesse modo aparecem views extras como
  Graph e Dopesheet, como abas embaixo do viewport.

---

## 6. Tocador (playback)

O manual não tem uma página única "player" — os controles de playback ficam
dentro do **Dopesheet** e do **Timeline**, e as teclas ficam agrupadas em
"Animate Mode" no cheat sheet.

| Botão / campo | Onde fica | Tecla |
|:---:|:---:|:---:|
| Tocar para frente / parar | Dopesheet/Timeline | D |
| Tocar para trás / parar | Dopesheet/Timeline | A |
| Ir para o início | Dopesheet/Timeline | Q |
| Ir para a última chave | Dopesheet/Timeline | E |
| Próxima chave | Dopesheet/Timeline | W |
| Chave anterior | Dopesheet/Timeline | S |
| Próximo frame | Dopesheet/Timeline | R |
| Pular 10 frames pra frente | Dopesheet/Timeline | shift+R |
| Frame anterior | Dopesheet/Timeline | F |
| Pular 10 frames pra trás | Dopesheet/Timeline | shift+F |
| Ligar/desligar loop | Dopesheet/Timeline | ctrl+R |
| Campo de frame atual | Dopesheet | — (digita o número) |
| Botões Loop Start / Loop End | Dopesheet | — |

---

## 7. Zoom e navegação da cena

Controles ficam no **canto inferior esquerdo do viewport**: um slider vertical
de zoom com dois botões ao lado.

> "Zooming is very important in Spine. To zoom in, place the mouse on what
> you'd like to see larger and scroll the mouse wheel upward."

| Botão/ação | Função |
|:---:|:---:|
| Lupa (magnifying glass) | Zoom para 100% (tamanho real da imagem) |
| Caixa (box) | Ajusta o zoom para o esqueleto caber inteiro no viewport |
| Roda do mouse | Zoom in/out |
| Botão direito + arrastar | Pan (arrastar a cena) |
| ctrl + botão direito + arrastar | Zoom |

Na view **Outline**, clicar em qualquer ponto centraliza o viewport ali (mostra
um retângulo laranja indicando a área visível).

---

## 8. Atalhos de teclado (tabela completa, do Cheat Sheet oficial)

### Menu

| Atalho | Ação |
|:---:|:---:|
| ctrl+N | Novo esqueleto |
| ctrl+O | Abrir projeto |
| ctrl+S | Salvar |
| ctrl+E | Exportar |

### Geral

| Atalho | Ação |
|:---:|:---:|
| F1 | Dicas instantâneas (tooltips) |
| F2 | Renomear |
| H | Alternar visibilidade |
| ctrl+Z | Desfazer |
| ctrl+shift+Z ou ctrl+Y | Refazer |
| SPACE, ESC ou duplo clique esquerdo | Deselecionar |
| PAGE_UP / PAGE_DOWN | Histórico de seleção |

### Viewport

| Atalho | Ação |
|:---:|:---:|
| botão direito + arrastar | Pan |
| roda do mouse ou ctrl+botão direito+arrastar | Zoom |
| ctrl+clique esquerdo | Adicionar à seleção |
| clique esquerdo + arrastar | Seleção por caixa |
| ctrl+clique esquerdo+arrastar | Seleção por caixa, somando |

### Ferramentas

| Atalho | Ação |
|:---:|:---:|
| Z | Shear |
| X | Escala |
| C | Rotação |
| V | Translação |
| B | Pose |
| N | Criar |
| botão direito | Alterna última ferramenta |
| Setas | Nudge (mover aos poucos) |

### Ferramenta Rotação

| Atalho | Ação |
|:---:|:---:|
| shift | Trava em incrementos de 15 graus |

### Ferramenta Criar

| Atalho | Ação |
|:---:|:---:|
| ctrl | Cria osso novo para a(s) imagem(ns) selecionada(s) |
| alt | Redesenha o osso selecionado |

### Chaves (keying)

| Atalho | Ação |
|:---:|:---:|
| K | Chavear tudo que mudou |
| L | Chavear a ferramenta de transformação ativa |
| ctrl+L | Chavear todas as transformações da seleção |
| ctrl+shift+L | Chavear tudo que aparece no graph/dopesheet |

### Modo Setup

| Atalho | Ação |
|:---:|:---:|
| P | Definir pai (Set Parent) |
| PLUS (+) | Subir na ordem de desenho |
| shift+PLUS | Subir 5 na ordem de desenho |
| MINUS (-) | Descer na ordem de desenho |
| shift+MINUS | Descer 5 na ordem de desenho |

### Modo Animate

| Atalho | Ação |
|:---:|:---:|
| D | Tocar para frente / parar |
| A | Tocar para trás / parar |
| Q | Ir para o início |
| E | Ir para a última chave |
| W | Próxima chave |
| S | Chave anterior |
| R | Próximo frame |
| shift+R | Pular 10 frames pra frente |
| F | Frame anterior |
| shift+F | Pular 10 frames pra trás |
| ctrl+R | Ligar/desligar loop |

### Tree

| Atalho | Ação |
|:---:|:---:|
| duplo clique esquerdo | Renomear |
| ctrl+clique ou shift+clique | Adicionar à seleção |
| botão direito | Expandir/colapsar |
| botão direito no ponto de visibilidade | Esconder/mostrar o ramo inteiro |

### Graph / Dopesheet

| Atalho | Ação |
|:---:|:---:|
| botão direito + arrastar | Pan |
| roda do mouse | Rolar pra cima/baixo |
| clique esquerdo | Selecionar chave |
| ctrl+clique esquerdo | Adicionar à seleção |
| clique esquerdo+arrastar (área vazia) | Seleção por caixa |
| ctrl+clique esquerdo+arrastar | Seleção por caixa, somando |
| duplo clique esquerdo | Apagar chave |
| clique esquerdo+arrastar (na chave/seleção) | Mover |
| alt+clique esquerdo+arrastar | Mover incluindo chaves seguintes |
| shift+clique esquerdo+arrastar | Mover sem encaixe (snapping) |
| clique esquerdo+arrastar (na borda da seleção) | Escalar a seleção |
| ctrl+X ou shift+DELETE | Cortar chaves selecionadas |
| ctrl+C ou ctrl+INSERT | Copiar chaves selecionadas |
| ctrl+V ou shift+INSERT | Colar chaves |

### Timeline

| Atalho | Ação |
|:---:|:---:|
| botão direito + arrastar | Pan |
| roda do mouse | Zoom |
| clique esquerdo + arrastar | Scrub (varrer o tempo) |
| shift+clique esquerdo+arrastar | Scrub sem encaixe |

---

## 9. Regras de organização citadas pelo manual

- Não existe barra de menus clássica: **um menu só**, no logo, atalho
  `alt+F` / `opt+F`.
- Layout fixo por padrão: **viewport à esquerda, tree à direita**.
- Views funcionam por abas e são customizáveis: *"Views can be customized by
  dragging an edge to resize or dragging the tab to move it."*
- Regra do botão direito no viewport: alterna para a última ferramenta usada.
- Regra do botão direito na tree: expande/colapsa o nó e todos os filhos.
- Regra da tree sobre clique: **clicar à esquerda do ícone expande/colapsa;
  clicar à direita do ícone seleciona.**
- Toda view minimizada pode ser recuperada pela caixa "Views" (nunca some de
  verdade).
- Spine não permite destacar uma view como janela flutuante separada (não dá
  pra jogar pra outro monitor).
- Quando um item é selecionado na tree, as propriedades dele aparecem embaixo,
  na própria tree: *"When an item is selected in the tree, its properties are
  shown at the bottom of the tree."*

---

## 10. Modo de uso — fluxos que o manual explica

1. Criar esqueleto: usar "New Skeleton" (menu principal, ctrl+N) para
   adicionar um esqueleto ao projeto.
2. Criar osso: no modo Setup, selecionar a ferramenta Create (N) e clicar ou
   arrastar no viewport; segurar ctrl cria osso novo para a imagem
   selecionada.
3. Prender imagem/anexo: feito via slots na tree, no modo Setup; a imagem vira
   um "attachment" ligado a um slot, que por sua vez pertence a um osso.
4. Pesar malha (weights): selecionar a malha e clicar nos ossos (ou o
   inverso) na view Weights; usar "Auto" para calcular pesos automaticamente,
   "Smooth" para suavizar, "Prune" para limpar influências fracas.
5. Trocar de modo: clicar no ícone no canto superior esquerdo do viewport
   para ir de Setup para Animate.
6. Chavear (criar keyframe): no modo Animate, mudar a pose e apertar K (chaveia
   tudo que mudou) ou L (chaveia só a ferramenta ativa).
7. Ajustar timing: usar o Dopesheet para mover chaves no tempo (arrastar) ou o
   Graph para ajustar também o valor da chave (curva Bezier).
8. Revisar o movimento: ligar Ghosting para ver poses antes/depois
   sobrepostas, sem precisar tocar a animação.
9. Exportar: ctrl+E abre o diálogo de exportação; escolher formato de dados
   (JSON/binário) ou de imagem/vídeo, e quais esqueletos/animações/skins
   exportar.
10. Importar de outro projeto: "Import Project" traz esqueleto ou animação de
    outro arquivo Spine; "Import Data" traz um JSON/binário como esqueleto
    novo ou mescla num esqueleto existente.
