# DragonBones Pro e Live2D Cubism Editor — menus e organização da interface

Pesquisa feita em 08/09/2026. Só o que os manuais oficiais dizem. Sem opinião.

---

# PARTE 1 — DragonBones Pro

## 1. Fonte

Tentei ler o manual oficial em `docs.egret.com/dragonbones`. **O site não abriu em
nenhuma tentativa** (conexão recusada direto, e também por dois serviços-ponte
diferentes). Páginas tentadas, todas sem sucesso:

- https://docs.egret.com/dragonbones/docs
- https://docs.egret.com/dragonbones/en/docs/dbPro/introduction/introduction
- https://docs.egret.com/dragonbones/en/docs/dbPro/interface/propertiesPanel
- https://docs.egret.com/dragonbones/en/docs/dbPro/interface/timelinePanel
- https://docs.egret.com/dragonbones/en/docs/dbPro/hotkey/hotkey

Por isso, o que segue **não é leitura direta do manual**: é o que apareceu em
resultados de busca que citam trechos dessas páginas, mais um blog de terceiro
("Egret DragonBones" no Blogspot) que também cita o manual oficial. Marco cada
trecho com a fonte. Onde não achei nada, digo "não encontrado".

## 2. Barra de menus

**Não encontrado.** Não achei nenhuma página do manual que liste File / Edit /
View e seus itens, nem por busca. Não dá para confirmar quantos menus existem
nem a ordem dos itens.

## 3. Barra de ferramentas

Segundo o manual (via busca), a interface principal ("Main Interface") tem
três barras de ferramentas:

|:---:|:---:|
| Barra | Função descrita |
|:---:|:---:|
| System Toolbar (barra do sistema) | ações gerais do projeto |
| Mode Toolbar (barra de troca de modo) | alterna entre modos de edição |
| Inherit Toolbar (barra de herança) | ligada à hierarquia de ossos |

Ordem dos botões da **System Toolbar**, da esquerda para a direita — citada
por um tutorial de terceiro que reproduz a documentação, **não confirmada na
página oficial**:

Novo projeto → Abrir projeto → Salvar projeto → Desfazer → Refazer →
Importar → Exportar → Pré-visualizar → Compartilhar.

Não achei a ordem dos botões da Mode Toolbar nem da Inherit Toolbar.

## 4. Painéis/paletas

O manual organiza a interface em painéis. Lista de nomes encontrados (sem
confirmar posição de tela nem como abrir/fechar cada um, exceto onde indicado):

|:---:|:---:|
| Painel | O que o manual diz que ele faz |
|:---:|:---:|
| Scene Tree Panel (árvore da cena) | mostra hierarquia de ossos e slots; arrastar e soltar muda quem é pai de quem |
| Transform Panel (transformação) | fica do lado direito; mostra e edita posição, rotação e escala de um osso ou sprite |
| Properties Panel (propriedades) | mostra e edita valores de propriedade de ossos e slots; tem sub-painel para slot, osso e quadro de osso |
| Level Panel | citado no índice do manual; conteúdo não encontrado |
| Resources Panel (recursos) | guarda as imagens do projeto; DragonBones Pro aceita dois formatos: conjunto de texturas (um arquivo com várias imagens referenciáveis) e arquivos de imagem soltos; a partir da versão 4.3 aceita múltiplos conjuntos de textura |
| Animation Panel (animação) | mostra e edita clipes de animação; botões no canto superior direito: Novo Clipe de Animação, Clonar Clipe, Renomear, Excluir |
| Timeline Panel (linha do tempo) | ver seção 5 |
| Share Panel | citado no índice do manual; conteúdo não encontrado |

## 5. Tocador (playback) — Timeline Panel

O manual descreve duas barras de ferramentas dentro do painel de linha do
tempo:

**Barra da linha do tempo**, da esquerda para a direita:
recolher lista → expandir lista → mover quadro para a direita →
mover quadro para a esquerda → quadro-chave automático → adicionar
quadro-chave → painel de curva.

**Barra de edição de quadro**, da esquerda para a direita:
onion skin (pele de cebola) → copiar quadro → cortar quadro → colar quadro
→ excluir quadro.

Não encontrei botões específicos de play/pause/stop nem controle de loop
citados por nome — não é possível confirmar essa parte.

## 6. Zoom e navegação da cena

Não achei confirmação na página oficial. Um tutorial de terceiro (blog Egret
DragonBones) descreve, sem citar o manual diretamente:

- Girar a roda do mouse: aplica zoom.
- Segurar o botão direito do mouse e arrastar: move a câmera (pan).

**Não confirmado como texto oficial do manual.**

## 7. Onion skin (recurso ligado à animação)

O manual descreve: a imagem azul é o quadro anterior, a vermelha é o
quadro seguinte; mostra N quadros antes e depois do quadro atual, para
ajudar a posicionar o movimento do personagem.

## 8. Atalhos de teclado

Achei a existência da página oficial de atalhos (`hotkey/hotkey`), com uma
tabela de três colunas: **Função | Atalho principal | Atalho alternativo**.
**Não consegui abrir o conteúdo da tabela** — nenhuma linha de dado foi
recuperada pela busca.

O único atalho que apareceu citado por completo, fora da tabela:

|:---:|:---:|
| Ação | Atalho |
|:---:|:---:|
| Atribuir atalho rápido a um osso selecionado | Ctrl + 1 a 9, ou Ctrl + 0 |

**Total de atalhos registrados: 1** (a tabela oficial existe mas não abriu).

## 9. Regras de organização que o manual deixa claras

- A interface principal é dividida por função: barras de ferramenta no topo,
  painéis de hierarquia e propriedades nas laterais, linha do tempo embaixo
  (estrutura inferida dos nomes dos painéis — layout exato não confirmado).
- Cada painel tem escopo fechado: hierarquia (Scene Tree), transformação
  isolada (Transform), valores de propriedade (Properties), animação
  (Animation e Timeline separados um do outro).
- A Timeline Panel separa em duas barras: uma para navegação/estrutura da
  lista de quadros, outra para editar o conteúdo do quadro (onion skin,
  copiar/cortar/colar/excluir).

## 10. Fluxos de uso descritos

1. Importar imagens pelo Resources Panel (como conjunto de textura ou
   arquivos soltos).
2. Montar hierarquia de ossos no Scene Tree Panel, arrastando para definir
   pai e filho.
3. Ajustar posição/rotação/escala de cada osso no Transform Panel.
4. Editar propriedades finas de osso/slot no Properties Panel.
5. Criar um clipe de animação no Animation Panel.
6. Editar quadros-chave na Timeline Panel, usando onion skin para comparar
   quadro anterior e seguinte.
7. Atribuir atalhos numéricos (Ctrl+1–9/0) a ossos usados com frequência.
8. Exportar pela System Toolbar.

---

# PARTE 2 — Live2D Cubism Editor

## 1. Fonte

Manual oficial em `docs.live2d.com/en/cubism-editor-manual/`, lido em
08/09/2026. Páginas abertas com sucesso:

- página inicial do manual (índice)
- file-menu/, edit-menu/, display-menu/, modeling-menu/, animation-menu/,
  formanimation-menu/, window-menu/, help-menu/, mesh-edit-menu/
- toolbar/
- palametorpalatte/ (Parameter), deformerpalatte/ (Deformer),
  timelinepalatte/ (Timeline), inspector-palette/ (Inspector)
- shortcut/

## 2. Barra de menus

O manual lista **9 menus** de topo (incluindo o menu que só aparece em modo
de edição de malha):

File, Edit, Show (Display), Modeling, Animation, Form Animation (FA),
Window, Help, Mesh Edit mode (contextual).

### 2.1 File (Arquivo)

|:---:|:---:|
| Item | Atalho |
|:---:|:---:|
| New → Models | — |
| New → Animation | Ctrl+Shift+N |
| New | Ctrl+N |
| Open | Ctrl+O |
| Open Recent File | Ctrl+Shift+O |
| Recent Files | — |
| Close | Ctrl+W |
| Close all | — |
| Save | Ctrl+S |
| Save as | Ctrl+Shift+S |
| Export → Image (PNG) | — |
| Export → GIF animation | — |
| Export → Still image (sequential) | Ctrl+I |
| Export → PSD images | Ctrl+P |
| Export → Video | Ctrl+Shift+M |
| Export Embedded → MOC3 | Ctrl+Alt+S |
| Export Embedded → Physics settings | — |
| Export Embedded → motion file | Ctrl+Alt+Shift+S |
| Environment settings | — |
| Keyboard Shortcuts | Ctrl+Alt+Shift+K |
| External application integration settings | — |
| Model Statistics | — |
| Canvas settings (máx. 30.000 px) | — |
| Resize Model | — |
| Exit | Alt+F4 |

### 2.2 Edit (Editar)

|:---:|:---:|
| Item | Atalho |
|:---:|:---:|
| Undo — "Restores the state immediately before the last operation" | Ctrl+Z |
| Redo | Ctrl+Y |
| Cut | Ctrl+X |
| Copy | Ctrl+C |
| Paste | Ctrl+V |
| Delete | Delete |
| Copy parameter values | — |
| Paste parameter values | — |
| Deselect | Esc |
| Deselect Hide and Lock | — |
| Select All | Ctrl+A |
| Search and Replace | Ctrl+F |

### 2.3 Show (Exibir)

Menu com submenus (Grid, Guide Lines, Display Type, Show Quality, Onion
Skin, Track Trajectory):

|:---:|:---:|
| Item | Atalho |
|:---:|:---:|
| Grid → Show Grid (Modeling View) | — |
| Grid → Grid settings | — |
| Guide Lines → Show (Modeling View) | — |
| Guide Lines → Show (Animation View) | — |
| Guide Lines → Add no centro | — |
| Guide Lines → Add nos vértices selecionados | — |
| Guide Lines → settings | — |
| Guide Lines → Snap Moving Vertices | — |
| Show ArtMesh vertices | — |
| Show ArtMesh's Vertex Number | — |
| Highlight vértices fora do deformer pai | — |
| Highlight Deformer's Child Elements | Ctrl+Shift+D |
| Highlight overlapping polygons | — |
| Show Child Elements ao redimensionar Warp Deformer | — |
| Display name of object at cursor | — |
| Hide selected state | — |
| Focus on the Selected Object | F |
| Display Type → Model Guide Image / Texture Atlas | — |
| Show Quality → Full / 1/2 / 1/4 / 1/8 | — |
| Show/Hide Bounding Box | — |
| Onion Skin → Modeling / Animation / FA View / settings | — |
| Track Trajectory → Animation View / settings | — |

### 2.4 Modeling (Modelagem)

Menu grande, agrupado por assunto: Deformer, Parameters, ArtMesh, ArtPath,
Glue, Skinning, Edit Form, Temporary deform tool, Clipping ID, Model
template, Texture Atlas, Lock, Show/Hide, Level edit, Convert Model ID,
Bulk setting (objetos e parâmetros), Physics settings.

|:---:|:---:|
| Grupo | Itens com atalho |
|:---:|:---:|
| Deformer | Select Deformer Parent (Ctrl+D), Select deformer children (Ctrl+Alt+D), Delete Deformer and Content (Ctrl+Delete) |
| Parameters | Reset to default (Ctrl+1), Lock default forms (Ctrl+Shift+1), Four Corner Forms auto (Ctrl+4) |
| ArtMesh | Mesh edit (Ctrl+E), Automatic Mesh generator (Ctrl+Shift+A) |
| Edit Form | Copy Form (Ctrl+Shift+C), Paste Form (Ctrl+Shift+V), Blend Form (Ctrl+Shift+B) |
| Texture Atlas | Edit Texture Atlas (Ctrl+T), Switch Model Guide/Texture Atlas (T) |
| Lock | Lock/unlock selected (Ctrl+2), Lock unselected (Ctrl+Shift+2), Unlock all (Ctrl+Alt+2) |
| Show/Hide | Show/hide selected (Ctrl+3), Hide unselected (Ctrl+Shift+3), Show all (Ctrl+Alt+3), Show/hide guide image (Ctrl+Alt+Shift+3) |
| Level edit | Level 1 refine (1), Level 2 normal (2), Level 3 rough (3) |

Itens sem atalho (resumo, o manual detalha cada um): Create Warp Deformer,
New Rotation Deformer, Auto Generation of Deformer, Apply deformer to
child, Validate Deformer, Align bounding box angle; Synchronize parameter
values, Parameter settings, Parameter group settings, Motion Mirroring,
Auto generation de motion facial/sway, Aplicação de rotação 3D, Multiple
Keys Editing, Batch Reflect, Select object associado à key, Arrange
Parameter Configuration, Eye Blinking/Lip-sync settings, Extended
Interpolation, Limit de Blend Shape Weights, Motion-sync settings,
Validation de mapped parameters; Change draw order (todos e em lote),
Create ArtMesh para colisão; todo o grupo ArtPath (geração automática,
destaque, seguir linha/preenchimento, adicionar pontos, tracking, split/
join); Glue On/Off; Skinning (por deformer de rotação ou por deform path,
criar parâmetros); Paste Form Special options, Reflect, Zoom com valor
exato, Bezier shape, Revert to Original, Update/Delete original shape;
ferramentas de deformação temporária (zoom, rotação, free transform,
perspectiva, distorção, warp, colunas/linhas); Clipping ID (select mask,
reverse); Model template (apply/export); Apply Texture Atlas (beta);
Restore latest visibility; Convert Model ID; Bulk setting de objetos e
parâmetros (export/import CSV); Physics settings.

### 2.5 Animation (Animação)

Agrupado em: Material, Scene, Track, Timeline \<Indicator\>, Timeline,
Fade, Parameter Controller, Parameter Bookmarks, Add Marker, Playback,
Switch Edit Mode, Gather files.

|:---:|:---:|
| Item | Atalho |
|:---:|:---:|
| Set Beginning of Track as Indicator | Shift+B |
| Set End of Track as Indicator | Shift+N |
| Move Track to Indicator | Shift+M |
| Move to beginning | Home |
| Move to end | End |
| Move to start of work area | Shift+Home |
| Move to end of work area | Shift+End |
| Previous Frame | Page Up |
| Next Frame | Page Down |
| Previous Keyframe | J |
| Next Keyframe | K |
| Previous Keyframe in Track | Shift+J |
| Next Keyframe in Track | Shift+K |
| Previous marker | Ctrl+J |
| Next marker | Ctrl+K |
| Previous onion skin marker | Ctrl+Shift+J |
| Next onion skin marker | Ctrl+Shift+K |
| Show entire Work Area | Shift+F |
| Playback ("Play/pause animation") | Enter |
| Switch Edit Mode (Dope Sheet ⇄ Graph Editor) | C |

Sem atalho: Reload/Replace materials (seleção ou todas as cenas); New
Scene, Import scene, gerar cena automática de áudio, loop editing;
Animation baking (parâmetros, física, motion-sync), Lip-sync a partir de
áudio; Set start/end frame do work area; Show entire scene, Reset zoom;
Fade-in/out settings e aplicar a outras cenas; Parameter Controller
(unidades, flip, converter controlador, follow target, cálculo em lote,
display); Parameter Bookmarks (mostrar, apagar, duplicar em lote/
individual, ocultar, configurar); Add Marker; Gather files.

### 2.6 Form Animation — FA (Animação de Forma)

|:---:|:---:|
| Item | Atalho |
|:---:|:---:|
| Select Deformer for Parent | Ctrl+D |
| Select Deformer Child Elements | Ctrl+Alt+D |
| Lock/Unlock Selected Objects | Ctrl+2 |
| Lock Unselected Objects | Ctrl+Shift+2 |
| Unlock All | Ctrl+Alt+2 |
| Show/Hide Selected Objects | Ctrl+3 |
| Hide Unselected Objects | Ctrl+Shift+3 |
| Show All | Ctrl+Alt+3 |
| Level 1 (Refine) | 1 |
| Level 2 (Normal) | 2 |
| Level 3 (Rough) | 3 |

Sem atalho: Temporary Deform Tool (zoom, rotação, free transform,
perspectiva, distorção, warp, colunas/linhas, path, deselect); Clipping ID
(select mask, reverse); Restore to Latest Visibility Status; Add Form Edit
Keyframe; Animation Preview Setting.

### 2.7 Window (Janela)

Lista as paletas que podem ser abertas, mais controle de layout:

Workspace (trocar Modeling/Animation/FA; resetar/atualizar layout;
configurações) → Hide/Show palette → Duplicate Tab → Switch to Previous
Tab → Switch to Next Tab → Set All Views to Same Display Position → Reset
Status → **Deformer** → **Inspector** → Tool Details → Log →
**Parameters** → Part(s) → Project → **Timeline** → Scene → Template.

O manual não dá atalho nem posição padrão para esses itens nesta página.

### 2.8 Help (Ajuda)

User Manual → Live2D Web Page → Product Page → Download Page → Sample
Model → Creators' forum → Live2D Help → Tutorial Video → Home → License
activation → Deactivate License → Online License Authentication → Open
Purchase Page → Display Operation → Open log file → Open Auto Backup
Folder → Update history.

Sem atalhos.

### 2.9 Mesh Edit mode (contextual, some ArtMesh selecionado)

|:---:|:---:|
| Item | Atalho |
|:---:|:---:|
| Finish Mesh editing | Ctrl+E |
| Auto attach Edge (line) | Ctrl+R |
| Glue/bind selected vertices | Ctrl+G |
| Unglue/unbind selected vertices | Ctrl+Shift+G |

Sem atalho: Automatic Mesh generator (modo edição), Reset mesh, Paste in
copied shape, Flip horizontal/vertical/ao longo do eixo, Merge vertices,
Stroke mesh-mapping (beta), SubTools (Arrow, Lasso, Deform brushes, Add/
Delete Vertex, Eraser, Add points, Stroke Mesh-mapping).

## 3. Barra de ferramentas

Fica no topo da tela. É sensível ao contexto: muda conforme a área de
trabalho (Modeling, Animation, Form Animation).

**Comum a todas as áreas:**
Select Target Version → Switch Workspaces (Modeling/Animation/FA) → Edit
Level Switching (atalhos 1, 2, 3) → Home → nizima Link.

**Área de Modelagem:**
Edit Texture Atlas → Edit Mesh Manually → Automatic Mesh Generator →
Create Warp Deformer → Create Rotation Deformer → Rotation Deformer
Creation Tool → Arrow Tool (A) → Lasso Tool (L) → Brush Selection (B) →
Deform Path Edit (P) → Deform Brush Tool → Edit Glue → ArtPath Tools.

**Área de Animação:**
Select/Edit Tool → Parameter Controller Tool.

**Área de Form Animation:** usa as ferramentas de Modelagem; botões sem uso
ficam acinzentados.

## 4. Painéis/paletas

|:---:|:---:|:---:|
| Palette | Conteúdo (segundo o manual) | Como abre |
|:---:|:---:|:---:|
| Parameters (Parâmetros) | sliders ligando grau de deformação a um valor numérico; botões de adicionar/excluir keys, agrupar, buscar | menu Window → Parameters |
| Deformer | árvore hierárquica de deformadores e objetos; botões mostrar/ocultar tudo, travar/destravar tudo, expandir/recolher tudo | menu Window → Deformer |
| Timeline (linha do tempo) | controles de reprodução no topo; trilhas e propriedades à esquerda; quadros-chave à direita | menu Window → Timeline (na área de Animação) |
| Inspector | propriedades do objeto selecionado; o conteúdo muda conforme o tipo (ArtMesh, Warp Deformer, Rotation Deformer, ArtPath, Part) | menu Window → Inspector |

Outras paletas citadas no menu Window, sem página própria lida: Tool
Details, Log, Part(s), Project, Scene, Template.

## 5. Tocador (playback) — Timeline palette

Fica na palette Timeline, dividida em três blocos: controles de reprodução
em cima, trilhas/propriedades à esquerda, a linha do tempo em si à direita.

Botões de reprodução: **First frame, Previous frame, Playback, Next frame,
Last frame**. Um botão de repetição liga/desliga o loop. Velocidade de
reprodução ajustável, padrão 100%.

Atalho geral de play/pause (menu Animation): **Enter**.

Dois modos de visualização: Dope Sheet (pontos no tempo) e Graph Editor
(curvas). Indicador de posição em minutos:segundos:quadros.

## 6. Zoom e navegação da cena

- Foco no objeto selecionado: **F** (menu Show) e **Shift+F** para mostrar
  toda a work area (menu Animation).
- Display All (encaixar tudo na tela): **Ctrl+0** (Show menu).
- Flip Canvas: **R**.
- Na Timeline palette: botões de zoom **[-]** e **[+]**, além de "Reset
  zoom in/out" (menu Animation).
- Show Quality (qualidade de exibição do canvas): Full, 1/2, 1/4, 1/8.

## 7. Tabela de atalhos (página oficial "List of shortcut keys")

|:---:|:---:|
| Área | Atalhos |
|:---:|:---:|
| File | New Model (Ctrl+N), New Animation (Ctrl+Shift+N), Open (Ctrl+O), Open Recent (Ctrl+Shift+O), Close (Ctrl+W), Save (Ctrl+S), Save As (Ctrl+Shift+S), Still Image sequencial (Ctrl+I), PSD Image (Ctrl+P), Video (Ctrl+Shift+M), Export MOC3 (Ctrl+Alt+S), Export Motion (Ctrl+Alt+Shift+S), Keyboard Shortcuts (Ctrl+Alt+Shift+K), Exit (Alt+F4) |
| Edit | Undo (Ctrl+Z), Redo (Ctrl+Y / Ctrl+Shift+Z), Cut (Ctrl+X), Copy (Ctrl+C), Paste (Ctrl+V), Delete (Delete/Backspace), Deselect (Esc), Select All (Ctrl+A), Search & Replace (Ctrl+F) |
| Display | Highlight Child Elements (Ctrl+Shift+D), Focus Selected Object (F), Display All (Ctrl+0), Flip Canvas (R) |
| Modeling | Mesh Edit (Ctrl+E), Automatic Mesh Generator (Ctrl+Shift+A), Edit Texture Atlas (Ctrl+T), Switch Source/Texture (T), Reset Parameters (Ctrl+1), Lock Default Forms (Ctrl+Shift+1), Four Corner Forms (Ctrl+4), Lock/Unlock Objects (Ctrl+2), Lock Unselected (Ctrl+Shift+2), Unlock All (Ctrl+Alt+2), Show/Hide Selected (Ctrl+3), Hide Unselected (Ctrl+Shift+3), Show All (Ctrl+Alt+3), Select Deformer Parent (Ctrl+D), Select Deformer Children (Ctrl+Alt+D), Delete Deformer & Content (Ctrl+Delete), Copy Form (Ctrl+Shift+C), Paste Form (Ctrl+Shift+V), Blend Form (Ctrl+Shift+B) |
| Animation | Move to Beginning (Home), Move to End (End), Work Area Start (Shift+Home), Work Area End (Shift+End), Previous Frame (Page Up), Next Frame (Page Down), Previous Keyframe (J), Next Keyframe (K), Previous Track Keyframe (Shift+J), Next Track Keyframe (Shift+K), Previous Marker (Ctrl+J), Next Marker (Ctrl+K), Previous Onion Skin Marker (Ctrl+Shift+J), Next Onion Skin Marker (Ctrl+Shift+K), Show Entire Work Area (Shift+F), Playback/Stop (Enter), Switch Edit Mode (C) |
| Tools | Arrow Tool (A), Lasso Tool (L), Brush Selection (B), Deform Path Edit (P), Level 1 Details (1), Level 2 Normal (2), Level 3 Rough (3) |
| View Area | Lock Drawable Objects (Shift+A), Lock Deformer (Shift+D), Solo (S), Snapshot (Ctrl+5), Show/Hide Snapshot (5), Save Snapshot Guide (Ctrl+Shift+5) |
| Palette – Parameters | Add Single Keyform (sem padrão), Delete Keyform (sem padrão) |
| Palette – Parts | Show/Hide Guide Image (Ctrl+Alt+Shift+3) |

**Total de atalhos registrados nesta tabela: 77.**

## 8. Regras de organização que o manual deixa claras

- A barra de ferramentas muda de conteúdo conforme a área de trabalho
  ativa (Modeling, Animation, Form Animation) — é contextual, não fixa.
- O menu Window é o único ponto de abrir/fechar cada palette.
- O Inspector é descrito como dependente da seleção: "the interface adapts
  based on the currently selected element" — cada tipo de objeto
  (ArtMesh, Warp Deformer, Rotation Deformer, ArtPath, Part) mostra campos
  diferentes.
- Undo é definido como: "Restores the state immediately before the last
  operation."
- O bloqueio do Inspector pode ser sincronizado com o bloqueio de objeto
  via File → Environment settings.
- O manual separa "Temporary deform tool" (ferramentas rápidas, sem criar
  deformador permanente) das ferramentas normais de criação de deformador.

## 9. Fluxos de uso descritos

1. Importar imagem-guia e ajustar Canvas settings (File menu).
2. Criar ArtMesh a partir da imagem-guia, editar malha (Modeling → Mesh
   edit, Ctrl+E).
3. Criar deformadores (Warp/Rotation) e organizar hierarquia na palette
   Deformer.
4. Criar parâmetros na palette Parameters e ligar a formas-chave (keys).
5. Trocar para a área de Animação (toolbar → Switch Workspaces).
6. Editar quadros-chave na palette Timeline (Dope Sheet ou Graph Editor).
7. Testar com Playback (Enter) e ajustar loop/velocidade.
8. Exportar MOC3 e arquivo de movimento (File → Export Embedded).
