# Moho e Aseprite — barra de menus, tocador e atalhos

Data da leitura: 08/09/2026.

---

## MOHO (Lost Marble)

### URLs lidas

- https://www.lostmarble.com/moho/manual/ (índice)
- https://www.lostmarble.com/moho/manual/menus.html (todos os menus)
- https://www.lostmarble.com/moho/manual/scriptsmenu.html (menu Scripts)
- https://www.lostmarble.com/moho/manual/shortcuts.html (atalhos)
- https://www.lostmarble.com/moho/manual/timelinewnd.html (janela Timeline)
- https://www.lostmarble.com/moho/manual/toc.html (sumário)

Não abriu: https://www.lostmarble.com/moho/manual/layers.html (404).
https://manual.lostmarble.com/ existe mas é um wiki vazio ("You need a wiki").

### Barra de menus

**File (Arquivo)**

|:---:|
| Entrada |
|:---:|
| New |
| Open... |
| Close |
| Save |
| Save As... |
| Project Settings... |
| Import ▸ Moho Object, Image, Movie, Adobe Illustrator File, EPS File, Tracing Image, Soundtrack, OBJ 3D Model |
| Preview |
| Render |
| Export Animation... |
| Batch Export... |
| Quit |

**Edit (Editar)**

|:---:|
| Entrada |
|:---:|
| Undo |
| Redo |
| Cut, Copy, Paste |
| Clear |
| Select All |
| Select None |
| Select Inverse |
| Select Connected |
| Preferences... |

**Draw (Desenho)** — só aparece com camada vetorial ativa

|:---:|
| Entrada |
|:---:|
| Insert Text... |
| Snap to Grid |
| Reset Line Width |
| Random Line Width... |
| Raise Shape |
| Lower Shape |
| Raise to Front |
| Lower to Back |
| Reset Points |
| Reset All Points |

**Bone (Osso)** — só aparece com camada de osso ativa

|:---:|
| Entrada |
|:---:|
| Release Points |
| Flexi-Bind Points |
| Release Layer |
| Flexi-Bind Layer |
| Hide Controlled Bones |
| Reset Bone |
| Reset All Bones |

**Animation (Animação)**

|:---:|
| Entrada |
|:---:|
| Allow Frame Skipping |
| Clear Animation From Layer |
| Clear Animation From Document |
| Reset All Layer Channels |
| Select All Keyframes |
| Rescale Keyframes... |
| Copy Current Frame... |
| Select Soundtrack... |
| Remove Soundtrack |
| Mute Soundtrack |

**Scripts** — comandos vêm de arquivos de script (Lua), agrupados em submenus

|:---:|
| Submenu | Comandos |
|:---:|:---:|
| 3D | Cube, Rotate X, Rotate Y, Rotate Z, Torus |
| Camera | Handheld Camera, Orbit Camera... |
| Draw | Polygon..., Star..., Triangle |
| Other | Auto Weld, Credits..., Layer Trail... |
| Particle Effects | Energy Cloud..., Explosion..., Rain, Smoke..., Snow, Sparkles... |
| Script Writing | Alert Test, Error Test, Load Data File..., Print Globals, Print Moho API, Print Test |
| Sound | Bone Audio Wiggle... |
| Visibility | Fade..., Wavy Fade... |
| Warp | Black Hole..., Wavy... |

Sem atalhos listados no manual para os itens de Scripts.

**View (Visualizar)**

|:---:|
| Entrada |
|:---:|
| Reset |
| Direction |
| Disable Grid Snapping |
| NTSC Safe Zones |
| Show Output Only |
| Select Tracing Image |
| Show Tracing Image |

**Window (Janela)**

|:---:|
| Entrada |
|:---:|
| Arrange |
| Tools |
| Layers |
| Timeline |
| Style |
| Actions |

**Help (Ajuda)**

|:---:|
| Entrada |
|:---:|
| Help... |
| About Moho... |
| About Scripts... |

O manual não mostrou o atalho junto de cada item de menu na página `menus.html` (é texto corrido). Os atalhos de menu confirmados estão na tabela de atalhos abaixo.

### Tocador (playback)

- Fica **na parte de baixo da janela principal**, fora da própria Timeline.
- Botões estilo VCR, da esquerda para a direita: Rewind (vai pro frame 0) · Step Back (um frame atrás) · Stop · Play (toca em loop) · Step Forward (um frame à frente) · Jump to End (último frame).
- **Play sempre repete em loop** — não há botão separado de "ligar/desligar loop"; o intervalo tocado é a região sombreada da régua de tempo (ajustável em Project Settings ou Alt+clique: botão esquerdo marca o início, direito marca o fim).
- Campo de número de frame no canto superior esquerdo da Timeline: digita o frame e aperta Enter.
- Régua de tempo com marcador vermelho triangular = frame atual.
- Onion skin: controlador abaixo da régua, até 8 frames simultâneos, clique para ligar/desligar cada um.

### Atalhos (principais)

|:---:|:---:|
| Tecla | Ação |
|:---:|:---:|
| T | Ferramenta Translate Points |
| Esc | Ajusta a vista para ver tudo na camada ativa |
| Home | Reseta a vista para o projeto inteiro |
| Enter | Desmarca todos os pontos |
| Tab | Seleciona todos os pontos conectados à seleção atual |
| Seta esquerda | Um frame atrás (Shift = volta ao início) |
| Seta direita | Um frame à frente (Shift = avança ao fim) |
| Delete/Backspace | Apaga pontos/forma/osso selecionado (conforme ferramenta) |
| Espaço | Solda pontos / define forma / liga pontos ao osso (conforme ferramenta) |
| Seta cima | Sobe forma um nível; ou seleciona osso pai |
| Seta baixo | Desce forma um nível; ou seleciona osso filho |
| Alt+Backspace | Apaga keyframe(s) selecionado(s) |
| Alt+C | Copia keyframe(s) selecionado(s) |
| Alt+V | Cola keyframe(s) copiado(s) |
| Espaço (na Timeline) | Play/stop da animação |
| Page Up / Page Down | Zoom in/out na Timeline (modo gráfico) |
| Shift+Page Up/Down | Move a vista verticalmente (modo gráfico) |
| End | Auto-zoom no canal de animação ativo |
| Ctrl+clique na régua | Marca início/fim de segmento parcial (esquerdo/direito) |

### Regras de organização (o que o manual deixa claro)

- A Timeline mostra **só a camada ativa**. Trocar de camada troca o que aparece nela.
- Tempo é medido em **frames**, com FPS fixado no Project Settings (padrão 24).
- Cada modificação feita em Moho fica gravada **no frame atual** — por isso o frame atual importa antes de editar.
- Canais de animação são organizados por tipo (movimento de camada, efeito, câmera, ponto vetorial, osso, switch, partícula) — cada um vira uma linha na Timeline.
- Scripts do menu Scripts ficam em `Moho/scripts/menu`, organizados em subpastas por função.

---

## ASEPRITE

### URLs lidas

- https://www.aseprite.org/docs/ (índice)
- https://www.aseprite.org/docs/menu-bar/ (lista dos menus)
- https://www.aseprite.org/docs/edit-menu/ (menu Edit)
- https://www.aseprite.org/docs/keyboard-shortcuts/ (como customizar atalhos)
- https://www.aseprite.org/docs/timeline/ (Timeline)
- https://www.aseprite.org/docs/workspace/ (layout)

O site de docs só tem página dedicada para o menu **Edit**; os outros menus (File, Sprite, Layer, Frame, Select, View, Help) não têm página própria — os nomes de cada item vêm do código-fonte oficial do programa (arquivos `data/gui.xml` e `data/strings/en.ini` do repositório público `aseprite/aseprite` no GitHub), usado aqui para completar a lista de itens que a página de menu não detalha.

Não abriu: https://www.aseprite.org/docs/quickref/ (carregou vazio/sem conteúdo).

### Barra de menus

Ordem: **File, Edit, Sprite, Layer, Frame, Select, View, Help.**
Abrir menu: Alt+letra sublinhada (ex.: Alt+F abre File).

**File (Arquivo)**

|:---:|:---:|
| Entrada | Atalho |
|:---:|:---:|
| New... | Ctrl+N |
| Open... | Ctrl+O |
| Open Recent | — |
| Reopen Closed File | — |
| Save | Ctrl+S |
| Save As... | — |
| Close | — |
| Close All | — |
| Export | — |
| Export As... | — |
| Export Sprite Sheet | — |
| Export Tileset | — |
| Repeat Last Export | — |
| Import | — |
| Import Sprite Sheet | — |
| Scripts | — |
| Exit | — |

**Edit (Editar)**

|:---:|:---:|
| Entrada | Atalho |
|:---:|:---:|
| Undo | Ctrl+Z |
| Redo | Ctrl+Y |
| Undo History | — |
| Cut | Ctrl+X |
| Copy | Ctrl+C |
| Copy Merged | Ctrl+Shift+C |
| Paste | Ctrl+V |
| Paste Special ▸ New Sprite / New Layer / New Reference Layer | — |
| Delete | Del |
| Fill | F |
| Stroke | S |
| Rotate | — |
| Flip Horizontal | Shift+H |
| Flip Vertical | Shift+V |
| Transform | Ctrl+T |
| Shift | — |
| New Brush | Ctrl+B |
| New Sprite From Selection | Ctrl+Alt+N |
| Replace Color | — |
| Invert | — |
| Adjustments | — |
| FX | — |
| Insert Text | — |
| Keyboard Shortcuts | Ctrl+Alt+Shift+K |
| Preferences | — |

**Sprite**

|:---:|
| Entrada |
|:---:|
| Properties... |
| Color Mode ▸ RGB, Grayscale, Indexed, More Options |
| Duplicate... |
| Sprite Size... |
| Canvas Size... |
| Rotate Canvas ▸ 180°, 90° CW, 90° CCW |
| Flip Canvas Horizontal / Vertical |
| Crop |
| Trim |

**Layer**

|:---:|
| Entrada |
|:---:|
| Properties... |
| Visible / Lock Layers |
| Open Group |
| New ▸ New Layer (Shift+N), New Group, New Layer via Copy, New Layer via Cut, New Reference Layer from File, New Tilemap Layer |
| Delete Layer |
| Convert To ▸ Background, Layer, Tilemap |
| Duplicate |
| Merge Down |
| Flatten |
| Flatten Visible |

**Frame**

|:---:|
| Entrada |
|:---:|
| Frame Properties... |
| Cel Properties... |
| New Frame (Alt+N) |
| New Empty Frame |
| Duplicate Cel(s) / Duplicate Linked Cel(s) |
| Delete Frame |
| Playback |
| Tags ▸ Tag Properties, New Tag, Delete Tag |
| Jump To ▸ First, Previous, Next, Last frame; First/Last frame in tag |
| Go to Frame |
| Constant Frame Rate |
| Reverse Frames |

**Select**

|:---:|:---:|
| Entrada | Atalho |
|:---:|:---:|
| All | Ctrl+A |
| Deselect | Ctrl+D |
| Reselect | Ctrl+Shift+D |
| Inverse | Ctrl+Shift+I |
| Color Range | — |
| Modify ▸ Border, Expand, Contract | — |
| Load from File | — |
| Save to File | — |

**View**

|:---:|
| Entrada |
|:---:|
| Duplicate View |
| Workspace Layout |
| Run Command |
| Show Extras |
| Show ▸ Layer Edges, Selection Edges, Grid, Auto Guides, Slices, Pixel Grid, Tile Numbers, Brush Preview |
| Grid ▸ Grid Settings, Selection as Grid, Snap to Grid |
| Tiled Mode ▸ None, Both, X, Y |
| Symmetry Options |
| Set Loop Section |
| Show Onion Skin |
| Timeline (Tab) |
| Preview (Enter) |
| Advanced Mode |
| Full Screen Mode |
| Full Screen Preview |
| Home |
| Refresh |

**Help**

|:---:|
| Entrada |
|:---:|
| Readme |
| Quick Reference |
| Documentation |
| Tutorial |
| Release Notes |
| Twitter |
| Enter License |
| About |

### Tocador (playback)

- A Timeline **não aparece por padrão**: View > Timeline ou tecla **Tab** liga/desliga. Também abre sozinha ao criar frame ou camada nova (dá pra desligar isso em Edit > Options > Timeline).
- Botão de configuração da Timeline: liga onion skin, ajusta numeração do primeiro frame, etc.
- Pré-visualização com **Play** roda pela janela de Preview: tecla **Enter** ou botão Play.
- Navegação de frame: setas **Esquerda/Direita** (ou vírgula/ponto).
- O manual não descreveu botões de stop/loop separados na janela de preview — só o atalho Enter para tocar.

### Atalhos (principais)

|:---:|:---:|
| Tecla | Ação |
|:---:|:---:|
| Ctrl+N | Novo sprite |
| Ctrl+O | Abrir |
| Ctrl+S | Salvar |
| Ctrl+Z / Ctrl+Y | Desfazer / Refazer |
| Ctrl+X / Ctrl+C / Ctrl+V | Recortar / Copiar / Colar |
| Ctrl+Shift+C | Copiar mesclado |
| Del | Apagar |
| Ctrl+T | Transformar |
| Ctrl+B | Novo pincel |
| Ctrl+Alt+N | Novo sprite a partir da seleção |
| F | Preencher (Fill) |
| S | Contornar (Stroke) |
| Shift+H / Shift+V | Espelhar horizontal / vertical |
| Ctrl+Alt+Shift+K | Abrir atalhos de teclado |
| Shift+N | Nova camada |
| Alt+N | Novo frame |
| Ctrl+A | Selecionar tudo |
| Ctrl+D | Desmarcar seleção |
| Ctrl+Shift+D | Reselecionar |
| Ctrl+Shift+I | Inverter seleção |
| Tab | Mostrar/ocultar Timeline |
| Enter | Tocar/pré-visualizar animação |
| Seta esquerda/direita (ou , / .) | Frame anterior/próximo |
| B | Ferramenta Lápis (Pencil) |
| L | Ferramenta Linha |
| Shift+L | Ferramenta Curva |
| U | Retângulo |
| Shift+U | Elipse |
| D | Contorno (Contour) |
| Shift+D | Polígono |
| E | Borracha |
| Alt ou I | Conta-gotas (Eyedropper) |
| M | Seleção retangular (Marquee) |
| Ctrl ou V | Mover cel |
| Shift+C | Ferramenta Fatia (Slice) |
| Z | Ferramenta Zoom |
| 1–6 | Zoom em 100/200/400/800/1600/3200% |
| Espaço (segurando) | Ferramenta Mão temporária |

### Regras de organização (o que o manual deixa claro)

- **Camada de fundo (Background)** fica sempre embaixo, é opaca e não se move; camadas transparentes ficam livres para empilhar acima dela.
- **Grupos de camada** juntam várias camadas para tratar como uma unidade.
- **Tags** na Timeline marcam trechos de frames (usadas para seção de loop e "focus tag").
- Timeline mostra **camadas e frames do sprite ativo**; copiar/colar entre documentos diferentes usa Edit > Copy / Edit > Paste.
- Menu bar some por padrão no macOS (usa a barra do sistema); dá pra reativar em Edit > Preferences > General > Show Aseprite menu bar.
