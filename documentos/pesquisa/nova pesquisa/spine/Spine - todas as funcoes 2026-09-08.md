# Spine — todas as funções

Fonte: manual oficial `esotericsoftware.com/spine-user-guide`, 48 páginas, lidas em 08/09/2026.
Nada aqui foi inventado. Cada linha veio de um título do manual.
Os prints estão em `prints/`. O nome do print segue o caminho da seção.

---

## 1. Começar

| Função | O que é |
|:---|:---|
| Trying and purchasing | versão de teste e compra |
| Activation | ativação da licença |
| Running Spine | abrir o programa pelo lançador |
| Spine editor versions | escolher versão: estável, beta ou específica |
| Welcome to Spine | tela de boas-vindas |
| Finding help | fórum, documentação |
| Keeping up-to-date | atualização automática |

Prints: `00-inicio_launcher.png` · `00-inicio_welcome.png` · `00-inicio_editor.png`

---

## 2. Interface (`spine-ui`)

| Função | O que é |
|:---|:---|
| Main menu | menu principal, canto superior esquerdo |
| Titlebar buttons | botões da barra de título |
| Opening projects | abrir projeto |
| File dialogs | caixas de arquivo próprias do Spine |
| Views | painéis abertos e encaixados |
| Tree | a árvore, painel central de tudo |
| Viewport | a cena |
| Panning | arrastar a cena |
| Zooming | aproximar e afastar |
| Setup/animate mode | os dois modos: montar e animar |
| Undo/redo | desfazer e refazer |

Prints: `ui_menu.png` · `ui_titlebar.png` · `ui_file-dialog.png` · `ui_views.png` · `ui_open-view.png` · `ui_properties-buttons.png` · `ui_mode.png` · `ui_graph-dopesheet.png` · `ui_undo.png` · `ui_zoom.png`

---

## 3. Esqueleto (`spine-skeletons`)

| Função | O que é |
|:---|:---|
| Properties | propriedades do esqueleto |
| Export | marcar o esqueleto para exportar |
| Reference scale | escala de referência, usada pela física |
| Skeleton draw order | ordem de desenho entre esqueletos |
| Hiding skeletons | esconder esqueleto |

Print: `skeletons_properties.png`

---

## 4. Ossos (`spine-bones`)

| Função | O que é |
|:---|:---|
| Bone transforms | posição, rotação, escala, cisalhamento |
| Creating bones | criar osso |
| Transform inheritance | o que o filho herda do pai |
| Length | comprimento |
| Icon | ícone do osso |
| Name | nome |
| Select | botão de seleção |
| Color | cor |
| Parent | trocar o pai |
| Add to Skin | pôr o osso dentro de uma skin |
| Split | dividir um osso em vários |
| Separate X and Y | separar X e Y na linha do tempo |
| Hiding bones | esconder osso |
| Bone draw order | ordem de desenho dos ossos |
| Attachments | anexos presos ao osso |

Print: `bones_properties.png`

---

## 5. Slots (`spine-slots`)

| Função | O que é |
|:---|:---|
| Draw order | ordem de desenho |
| Changing the draw order | mudar a ordem arrastando |
| Tree filter | filtro da árvore por ordem |
| Color | cor do slot |
| Tint black | tingimento preto, segunda cor |
| Blending | mistura: normal, additive, multiply, screen |
| Separate color and alpha | separar cor e transparência |
| Hiding slots | esconder slot |
| Folders | pastas de slots |

Print: `slots_properties.png`

---

## 6. Imagens (`spine-images`)

| Função | O que é |
|:---|:---|
| Images path | pasta raiz das imagens |
| Creating region attachments | criar anexos arrastando imagens |
| Image file lookup | como o Spine acha o arquivo |
| Import PSD | trazer do Photoshop |
| Scripts | roteiros de exportação de PSD |

---

## 7. Ferramentas (`spine-tools`)

| Função | O que é |
|:---|:---|
| Selection | seleção |
| Deselect | tirar da seleção |
| Selection history | histórico de seleção |
| Selection groups | grupos de seleção guardados |
| Numeric entry | digitar o valor |
| Axes | eixos: local, pai, global |
| Rotate tool | girar |
| Translate tool | mover |
| Scale tool | escalar |
| Shear tool | cisalhar |
| Pose tool | pose: move e gira junto, arrastando a cadeia |
| Bone length tool | mudar o comprimento do osso |
| Weights tool | pesos |
| Create tool | criar |
| Compensation | compensação: o filho não sofre o que o pai sofreu |
| Pixels | encaixar em pixel |
| Auto key | chave automática |
| Viewport options | opções da cena |
| Rulers | réguas |
| Copy/paste | copiar e colar transformações, anexos e vértices |

Prints: `tools_toolbar.png` · `tools_transform.png` · `tools_options.png` · `tools_compensate.png`

---

## 8. Chaves (`spine-keys`)

| Função | O que é |
|:---|:---|
| Animations | lista de animações |
| Folders | pastas de animação |
| Timeline position | onde está o cursor |
| Frames | quadros |
| Frame snapping | encaixe em quadro inteiro |
| Repeat | repetição |
| Setting keys | pôr chave |
| Auto key | chave automática |
| Key shown | mostrar o que está com chave |
| Bone transforms | chave de osso |
| Setup pose | pose de montagem |
| Separate X and Y | X e Y em linhas separadas |
| Transform inheritance | herança como chave |
| Slot attachment | chave de troca de anexo |
| Slot color | chave de cor |
| Draw order | chave de ordem de desenho |
| Events | chave de evento |
| Sequence keys | chave de sequência de imagens |
| Deform keys | chave de deformação de malha |
| Deform highlight | destaque do vértice deformado |
| IK, Transform, Path constraints | chaves das restrições |
| Clipboard buttons | copiar, cortar, colar chaves |
| Shift | deslocar chaves |
| Offset | afastar chaves |
| Clean Up | limpeza: tira chave repetida |

---

## 9. Animar (`spine-animating`)

| Função | O que é |
|:---|:---|
| Straight ahead | animar quadro a quadro, em frente |
| Pose to pose | animar por poses-chave |
| Layered | animar em camadas, uma propriedade por vez |
| Combined | misturar os métodos |
| Curves | curvas de interpolação |

---

## 10. Anexos (`spine-attachments`)

Tipos: **region**, **mesh**, **bounding box**, **clipping**, **path**, **point**.

| Propriedade comum | O que é |
|:---|:---|
| Select | seleção |
| Export | marcar para exportar |
| Name | nome |
| Color | cor |
| Set Parent | trocar o osso pai |
| Hiding attachments | esconder |

Print: `attachments_properties.png`

### 10.1 Region (`spine-regions`)

Image path · Mesh, virar malha · Sequence · Translation
Print: `regions_properties.png`

### 10.2 Mesh (`spine-meshes`)

Image path · Mesh · Wireframe · Sequence · **Edit Mesh** · Freeze · Reset
Modo de edição: Modify tool · Create tool · Delete tool · New vertices mode · Reset vertices · **Generate** · **Trace** · Triangles · Dim · Isolate · Deformed
Arestas: Edge loop selection
Vértices: Hull size · Hull edges · Holes · Vertex count · Deformation
Ainda: Image resize · **Linked meshes**, malha ligada a outra
Prints: `meshes_properties.png` · `meshes_edit-mesh.png`

### 10.3 Bounding box (`spine-bounding-boxes`)

Edit Bounding Box · Freeze · Create tool · Delete tool · New vertices mode
Print: `bounding-boxes_properties.png`

### 10.4 Clipping (`spine-clipping`)

End slot · Edit Clipping · Freeze · Create · Delete · New vertices mode · Draw order · Self-intersection · Performance
Print: `clipping_properties.png`

### 10.5 Path (`spine-paths`)

Length · Closed · Constant speed · Edit Path · Freeze · **Reverse** · Create · Delete · New vertices · Angle lock · Cusps
Print: `paths_properties.png`

### 10.6 Point (`spine-points`)

Só posição e rotação. Serve de marcador.
Print: `point-attachments_properties.png`

---

## 11. Skins (`spine-skins`)

| Função | O que é |
|:---|:---|
| Skin placeholders | o lugar vazio que cada skin preenche |
| Selected attachments | anexos escolhidos |
| Export | marcar skin para exportar |
| Color | cor |
| Add to Skin | pôr osso ou restrição na skin |
| Folders | pastas de skin |
| Active skin | skin ativa |
| Skin attachments | anexos da skin |
| Skin bones | ossos que só existem naquela skin |
| Skin constraints | restrições da skin |
| Constrained bones | ossos sob restrição |
| Warnings | avisos: de osso, de anexo, de restrição |
| Duplicating a skin | duplicar |
| The first skin, Similar skins | fluxos de trabalho |
| Programmatic skins | skins montadas em código |
| Removing skin placeholders | remover lugar vazio |
| Mix and match | misturar peças de várias skins |

Print: `skins_properties.png`

---

## 12. Restrições (`spine-constraints`)

Ordem · Bone transforms · **Mix**, quanto da restrição entra · Folders · Viewport bones · Tree annotations · Copy/paste
Print: `constraints_tree.png`

| Tipo | Propriedades |
|:---|:---|
| **IK** | Parent · Child · Target · Positive · Compress · Stretch · Uniform · Softness · Mix |
| **Path** | Bones · Target · Spacing · Position · Position handle · Rotate Offset · Rotate Mix · Translate Mix · Color |
| **Transform** | Bones · Local · Relative · Target · Offset · Match · Mix |
| **Physics** | Bone · Translate X · Translate Y · Rotation · Shear X · Scale X · Limit · FPS · Inertia · Strength · Damping · Mass · Wind · Gravity · Global · Mix · Simulate · Deterministic · Reset · Reset All |

Prints: `ik_properties1.png` · `ik_properties2.png` · `path-constraint_properties.png` · `transform_properties.png`

---

## 13. Sliders (`spine-sliders`)

Animation · Loop · Additive · Frame · Bone · Local · Property · Mix
Um controle que roda uma animação a partir de um valor de osso.
Print: `slider_properties.png`

---

## 14. Eventos (`spine-events`)

Integer · Float · String · Audio path · Volume · Balance · Audio node · Audio events · Audio file lookup · Audio formats · Viewport events · Folders
Print: `events_properties.png`

---

## 15. Painéis

| Painel | Função |
|:---|:---|
| **Views** | Open · Tabs · Focus · Resize · Minimize · Close · Multiple monitors |
| **Animations** | lista de animações, vários esqueletos |
| **Audio** | eventos de áudio · Volume · Audio device |
| **Dopesheet** | Overview, Bone e Property rows · Interpolation · Contents, travado e destravado, Refresh, Select · Order · Visibility · Filters · Timeline position · Loop · Box selection · Clipboard · Shift · Offset · **Adjust** · Key shown · **Sync** · View settings |
| **Ghosting** | Frames · Key Frames · Motion Vectors · Display · Anchor · On top · Loop · Offset · Selection |
| **Graph** | Curvas: Stepped, Linear, Bezier · Presets: Automatic, Separate, Flat, **Bounce**, Ease out, Ease in · Repeat · Separate properties · Frame · Auto · Sync · Box selection · New keys · Axes · Snapping · Clipboard · Shift · Offset · Handle modes, Value e Shape · **Favor** · **Store** |
| **Mesh Tools** | Size · Feather · Hull vertices |
| **Metrics** | Bones · Constraints · Slots · Attachments: Total, Visible, Vertices, Vertex transforms, Triangles, Area, Clipping polygons, Clipped triangles · Timelines · CPU usage · Fill rate · Draw calls |
| **Outline** | contorno · Ghosting |
| **Playback** | Timeline FPS · Speed · Stepped · Interpolated |
| **Preview** | Animations · Tracks · Speed · Mix · Repeat · Alpha · Hold previous · Additive · Show bones |
| **Skins** | lista de skins · Pins · Pinned skins |
| **Slot Color** | cor do slot em painel próprio |
| **Timeline** | linha do tempo em painel próprio |
| **Tree** | Tree nodes · Expand e collapse · Selection · Auto scroll · Visibility · Keying · Annotations · Properties · Drag and drop · Image preview · Shortcuts · Filters · Filter buttons · **Find and replace** · Text search · View settings |
| **Weights** | Bind · Bones list · Triangle order · Pies · Overlay · Selected · Weights tool, Direct e Brushes · copiar e colar pesos · **Auto** · **Smooth** · **Prune** · **Weld** · **Swap** · Lock · Update bindings |

Prints: `views_open.png` · `views_toolbar.png` · `views_tabs.png` · `dopesheet_dopesheet.png` · `dopesheet_rows.png` · `dopesheet_view-options.png` · `dopesheet_filter-dopesheet.png` · `graph_view.png` · `graph_rows.png` · `graph_presets.png` · `tree_tree-view.png` · `tree_filters.png` · `tree_filter-buttons.png` · `tree_find-and-replace.png` · `tree_view-settings.png` · `weights_view.png` · `mesh-tools_mesh-tools.png` · `metrics_view.png` · `outline_view.jpg` · `playback_playback-view.png` · `preview_preview-view.png` · `slot-color_view.png` · `timeline_timeline-view.png` · `animations-view_view.png` · `audio-view_view.png` · `ghosting_ghosting-view.png`

---

## 16. Tela inicial (`spine-welcome-screen`)

Projects · News · Tips · Learn · Changelog
Print: `welcome_welcome-screen.jpg`

---

## 17. Versões (`spine-versioning`)

Editor version numbers · Runtime version numbers · Stable · Beta · Choosing a version · Synchronizing versions · Project files · Recovering work from a newer version · File storage

---

## 18. Exportar (`spine-export`)

| Saída | Tipo |
|:---|:---|
| JSON | dados |
| Binary | dados |
| GIF, PNG, APNG, PSD, JPEG | imagem |
| AVI, MOV | vídeo |

Ainda: Common settings · Preview panel · Additive blending · **salvar e carregar preset de exportação** · Disabling export
Prints: `export_menu.png` · `export_json.png` · `export_binary.png` · `export_png.png` · `export_gif.png`

---

## 19. Atlas de textura (`spine-texture-packer`)

Texture atlas files · Packing during data export · Running the packer separately
Settings: Regions · Region padding · Pages · Runtime · Output · Options · Other
Ainda: Folder structure · JSON Configuration · Texture atlas name · Ninepatches · Image indexes · **Texture Unpacker**
Prints: `texture-packer_menu.png` · `texture-packer_dialog.png` · `texture-packer_settings.png`

---

## 20. Importar (`spine-import`)

Project: Skeleton, Animation
Data: Scale · New project · Create a new skeleton · Import into an existing skeleton · Existing attachments · Nonessential data
Import PSD: Import PSD File · Output PNG Files · Import Data · Origin · Tags de grupo e de camada · Attachment properties · Slashes · Blending Modes · Draw order · Limitations
Prints: `import_menu-project.png` · `import_import-project.png` · `import_import-data.png` · `import-psd_menu.png` · `import-psd_dialog.png`

---

## 21. Linha de comando (`spine-command-line-interface`)

Editor · Export · Import · Clean up · Pack · Unpack · Info · Advanced · Unknown parameters
Roda no Windows, Mac e Linux.

---

## 22. Configurações (`spine-settings`)

| Aba | Conteúdo |
|:---|:---|
| Application | Launcher · Files · General |
| User interface | interface |
| Viewport | cena |
| Behavior | Dopesheet · Graph |

Prints: `settings_menu.png` · `settings_settings-dialog.png` · `settings_settings-launcher.png` · `settings_settings-files.png` · `settings_settings-general.png` · `settings_settings-user-interface.png` · `settings_settings-viewport.png` · `settings_settings-behavior.png` · `settings_settings-dopesheet.png` · `settings_settings-graph.png`
