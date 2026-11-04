# Convenções de interface — Aseprite, Blender, Unity, Godot 4, Moho

Pesquisa em documentação oficial. Data: 08/09/2026.

Regra desta pesquisa: o que não estava na documentação oficial está escrito
como **não confirmado**. Nada foi suposto.

---

## O que é padrão em todos (8 linhas)

1. A cena fica no meio. A timeline fica embaixo. As propriedades ficam na lateral.
2. Roda do mouse dá zoom. Isso é igual nos cinco.
3. Existe sempre um "enquadrar tudo" / "ajustar à tela".
4. A barra de reprodução vai da esquerda para a direita: início → voltar → play → avançar → fim.
5. O quadro atual é sempre um campo de número editável, colado na timeline.
6. As chaves são **losangos**. O quadro atual é uma **linha vertical** (playhead).
7. Todos têm atalho de teclado para pular de chave em chave.
8. Casca de cebola (onion skin) é um botão de liga/desliga com opções ao lado.

---

## 1. Zoom e pan da cena

| Programa | Zoom | Pan | Ajustar à tela | Onde fica o controle | % de zoom à vista |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Aseprite | roda do mouse (ou pinça no trackpad) | Shift + roda; dois dedos no trackpad | opção "Auto-fit on screen when a sprite is opened" | slider de zoom na **barra de status** (embaixo); preferências em Edit ▸ Preferences ▸ Editor | **sim**, na barra de status |
| Blender | roda do mouse; Ctrl-MMB arrastando; Numpad+ / Numpad− | arrastar MMB | View ▸ **Frame All** (Home) | menu **View** do editor + barras de rolagem | não confirmado |
| Unity | não confirmado (cena 3D) | não confirmado | na janela Animation: **A** enquadra tudo, **F** enquadra a seleção | teclas + alças das barras de rolagem | não confirmado |
| Godot 4 | não confirmado | não confirmado | não confirmado | "timeline and track controls" dá zoom na timeline | não confirmado |
| Moho | não confirmado | não confirmado | não confirmado | não confirmado | não confirmado |

Observação: em Aseprite o zoom fica **em texto/slider na barra de status**, não em
ícone de lupa de canto. Em Blender o "enquadrar tudo" fica **em menu de texto**
(View), com atalho Home.

---

## 2. Barra de reprodução

| Programa | Ordem dos botões | Loop / repetir | Quadro atual | FPS / velocidade |
|:---:|:---:|:---:|:---:|:---:|
| Blender | Jump to Start ▸ Jump to Previous Keyframe ▸ **Rewind** ▸ **Play/Pause** ▸ Jump to Next Keyframe ▸ Jump to End (+ Jump Backward/Forward by Delta) | popover **Playback ▸ Loop**: Infinite / Stop at End Frame / Stop at Start Frame / Restore Frame / **Bounce** | campo **Current Frame** no cabeçalho | popover Playback ▸ **Sync**: Play Every Frame / Frame Dropping / Sync to Audio |
| Unity | Preview ▸ Record ▸ ir ao início ▸ chave anterior ▸ **Play** ▸ chave seguinte ▸ fim do clipe | não confirmado na janela Animation | campo com a posição do playhead **em quadros ou segundos** | não confirmado |
| Moho | rewind ▸ step back ▸ **stop** ▸ **play** ▸ step forward ▸ jump to end | o botão **play** já toca em laço | campo de texto no **canto superior esquerdo** da timeline | 24 fps padrão; muda em **Project Settings** |
| Godot 4 | botão **"Play from beginning"** (Shift+D) entre os botões de play do editor | **Animation Looping**; por faixa: loop mode **Clamp** / **Wrap** | não confirmado | não confirmado |
| Aseprite | não confirmado | **Loop section** e **Focus tag** na timeline | não confirmado | duração definida **por quadro** |

Padrão claro: **três blocos** — ir ao extremo, andar de um, tocar. Blender e Unity
põem "chave anterior / chave seguinte" **entre** o extremo e o play.
Blender é o único com play para trás (**Rewind**) como botão próprio.

---

## 3. Timeline / dopesheet

| Programa | Linha de resumo | Chaves em losango | Chave a chave (atalho) | Zoom horizontal | Playhead | Intervalo de loop |
|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| Blender | o próprio **Timeline** resume; linha "Summary" do Dope Sheet **não confirmada** | **sim** — losango = handle livre; redondo, círculo, quadrado e rombo = outros handles | **Up** = chave anterior, **Down** = chave seguinte | roda, Ctrl-MMB, Numpad+/− | **linha azul vertical**; anda com Left/Right, Alt-Wheel; Shift-Left/Right vai aos extremos | **Start / End** + **Preview Range** (P liga, Alt-P desliga; borda laranja escura) |
| Unity | não confirmado | **sim** | **Alt + vírgula** / **Alt + ponto**; vírgula e ponto andam de quadro | **A** enquadra tudo, **F** a seleção; alças da barra de rolagem | sim (campo de posição editável) | não confirmado |
| Godot 4 | não confirmado | **sim** — "Diamond shapes represent keyframes" | não confirmado | "timeline and track controls" | sim | comprimento da animação (campo à direita do cabeçalho) + **Animation Markers** (Shift+Click em dois marcadores toca só o trecho) |
| Moho | não confirmado | marcadores pequenos nos canais; selecionados mudam de cor | não confirmado | não confirmado | **triângulo vermelho** na régua de tempo | faixa **sombreada** na régua; Alt+clique esquerdo = início, Alt+clique direito = fim |
| Aseprite | não confirmado | não confirmado | não confirmado | não confirmado | não confirmado | **Loop section** (tags) |

Blender: por padrão a Timeline só mostra chaves do que está **selecionado**.
Desmarque **View ▸ Only Show Selected** para ver tudo.

Blender: o playhead pode **grudar** (snapping) em quadros, segundos, marcadores,
chaves ou tiras. Segure Ctrl para ligar/desligar durante o arraste.

---

## 4. Ferramentas de transformação

| Programa | Teclas | Gizmo na cena | Espaço local/mundo | Onde fica |
|:---:|:---:|:---:|:---:|:---:|
| Unity | **W** Move, **E** Rotate, **R** Scale, **T** RectTransform, **Y** Transform | sim | **Pivot / Center** (posição do gizmo) e **Local / Global / Grid** (rotação do gizmo) | **Tool Settings Overlay** na Scene view; também no menu **Tools** |
| Blender | não confirmado nesta pesquisa (teclas G/R/S) | **Viewport Gizmos** no cabeçalho | **Transform Orientation** (tecla **vírgula**) e **Pivot Point** (tecla **ponto**), no cabeçalho da 3D Viewport | cabeçalho da 3D Viewport + **Toolbar Region** (barra de ferramentas) |
| Moho | não confirmado | não confirmado | não confirmado | janela **Tools**, em 5 grupos: Draw, Fill, **Bone**, **Layer**, Camera, Workspace |
| Godot 4 | não confirmado | ferramenta **Move** na toolbar (citada no tutorial) | não confirmado | toolbar do editor 2D |
| Aseprite | não confirmado | não confirmado | não confirmado | não confirmado |

Ponto forte: Unity é o único onde o **seletor de espaço** aparece documentado
como par de botões (Pivot/Center + Local/Global) grudado na barra de ferramentas.
Blender põe o equivalente no **cabeçalho do editor**, com atalhos de uma tecla.

---

## 5. Onde ficam as opções de exibição

| Programa | Mostrar ossos / origem | Grade e ajudas | Casca de cebola | Nomes | Padrão de local |
|:---:|:---:|:---:|:---:|:---:|:---:|
| Blender | **Viewport Overlays** (popover no cabeçalho); **Object Type Visibility**; **Toggle X-Ray** (Alt-Z) | Viewport Overlays | não confirmado (Grease Pencil) | não confirmado | **popover no cabeçalho**, à direita |
| Moho | botão **Show Curves** embaixo esconde ossos, origem, curvas, pontos e outras partes da interface | não confirmado | **onionskin controller** logo abaixo da régua de tempo, com marquinhas clicáveis; até 8 quadros; caixas **Relative frames** e **Selected layer only** | não confirmado | **botão embaixo** + controle na timeline |
| Godot 4 | não confirmado | não confirmado | **ícone de cebola no canto superior direito** do editor de animação; botão de **três pontos** ao lado abre as opções (inclui quadros futuros) | não confirmado | canto do painel de animação |
| Aseprite | não confirmado | não confirmado | **Onion Skinning** no botão de configuração da Timeline | não confirmado | botão de configuração dentro da Timeline |
| Unity | não confirmado | não confirmado | não confirmado | não confirmado | não confirmado |

Padrão que aparece: **a casca de cebola mora na timeline ou coladinha nela**, não
num menu geral. Em três dos cinco (Godot, Aseprite, Moho) isso está confirmado.

---

## 6. Pivot / ponto de ação

| Programa | Como se define o pivot | Marcadores / sockets para o jogo ler |
|:---:|:---:|:---:|
| Aseprite | **Slices**: duplo clique numa slice abre **Slice Properties**; ali se define o **pivot** — "a pivot to specify the central/base location of the sprite inside the slice" — e o **9-slices** | as próprias **slices** com pivot são o mecanismo; nada além disso confirmado |
| Unity | nas **import settings** do sprite: campo **Pivot** com opções prontas e **Custom** (X e Y); botão **Open Sprite Editor**; **Pixels Per Unit** | child transform: **não confirmado** nesta pesquisa |
| Godot 4 | offset do Sprite2D: **não confirmado**; para esqueleto usa-se **Overwrite Rest Pose** no menu da toolbar do **Skeleton2D** | **Marker2D** e **BoneAttachment**: **não confirmado** (a página de 2D Skeletons não os cita) |
| Moho | **origem da camada**: clique em qualquer ponto da camada para pôr a origem ali; ela aparece como uma **cruz**. É o ponto em que a camada gira (Rotate Layer) e escala (Scale Layer), e define como a camada se move quando presa a ossos | não confirmado |
| Blender | **Pivot Point** no cabeçalho da 3D Viewport (tecla **ponto**) | empties: **não confirmado** nesta pesquisa |

O mais claro dos cinco é o **Moho**: origem = cruz visível, clicável, e é ela que
manda no giro, na escala e na ligação com os ossos.

O mais próximo do que um jogo precisa: **Aseprite slices com pivot** (o pivot
viaja junto com o recorte) e **Unity Pivot Custom X/Y** no import.

---

## 7. Quanto da tela a interface ocupa

| Programa | Onde fica a timeline | Painéis recolhíveis | Modo foco / tela cheia |
|:---:|:---:|:---:|:---:|
| Blender | editor próprio, normalmente **embaixo** | **sim** — regiões (Toolbar, Sidebar, Channels, Scrubbing Region) se escondem arrastando a borda para a beirada; **View ▸ Channels** liga/desliga a árvore da esquerda | não confirmado |
| Godot 4 | **painel no rodapé do viewport** ("Animation Panel at the bottom of the viewport") | não confirmado | não confirmado |
| Aseprite | Timeline em **View ▸ Timeline**, atalho **Tab** | **sim** — a timeline inteira liga/desliga com Tab | não confirmado |
| Unity | janela **Animation**, encaixável | botão de **cadeado (lock)** trava a janela no objeto atual | não confirmado |
| Moho | **Timeline Window** | não confirmado | não confirmado |

Padrão: a **timeline é um painel do rodapé** e dá para escondê-la inteira.
Em Blender e Aseprite isso está confirmado; em Godot a posição (rodapé) está
confirmada.

---

## 8. Regras de ouro para interface de ferramenta de criação

Base: as 10 heurísticas de Nielsen (NN/g), o artigo da NN/g sobre aplicar as
heurísticas a **aplicações complexas**, e o estudo das cinco ferramentas acima.

| Regra | De onde vem | Como os 5 programas fazem |
|:---:|:---:|:---:|
| **Reconhecer, não lembrar** | Nielsen, heurística 6 ("Recognition rather than recall") | ícones sempre visíveis para play, chave, cebola; nada escondido só em menu |
| **Atalho para quem já sabe** | Nielsen, heurística 7 ("Flexibility and efficiency of use") — acelerador escondido do novato | Blender Up/Down para chave; Unity Alt+vírgula/ponto; Aseprite Tab; Godot Shift+D |
| **Mostrar o estado** | Nielsen, heurística 1 ("Visibility of system status") | quadro atual em campo editável; playhead colorido; zoom na barra de status (Aseprite) |
| **Desfazer sempre** | Nielsen, heurística 3 ("User control and freedom") | não medido nesta pesquisa |
| **Ícone + dica com nome e atalho** | prática das ferramentas criativas (ver artigo sobre Figma e as heurísticas) | Blender documenta o atalho ao lado do nome de cada botão de transporte |
| **Barra de ferramentas na esquerda** | prática observada | Blender: **Toolbar Region** à esquerda do viewport. Moho: janela **Tools** |
| **Propriedades na direita** | prática observada | Blender: **Sidebar Region**. Unity: Inspector |
| **Timeline embaixo** | prática observada | Godot: painel no rodapé. Blender: editor Timeline embaixo. Aseprite: Timeline embaixo |

Fonte-chave para ferramenta complexa: NN/g, *10 Usability Heuristics Applied to
Complex Applications*. A ideia central é que numa ferramenta profissional o
**acelerador** (atalho) é obrigatório, mas o caminho visível também precisa
existir para quem está começando.

---

## 9. URLs consultadas

**Blender**
- https://docs.blender.org/manual/en/latest/editors/timeline.html
- https://docs.blender.org/manual/en/latest/animation/animation_editors.html
- https://docs.blender.org/manual/en/latest/editors/dope_sheet/introduction.html
- https://docs.blender.org/manual/en/latest/editors/3dview/introduction.html
- https://docs.blender.org/manual/en/latest/animation/introduction.html

**Unity**
- https://docs.unity3d.com/Manual/animeditor-UsingAnimationEditor.html
- https://docs.unity3d.com/Manual/PositioningGameObjects.html
- https://docs.unity3d.com/Manual/texture-type-sprite.html
- https://docs.unity3d.com/Manual/sprite/sprite-editor/use-editor.html

**Godot 4**
- https://docs.godotengine.org/en/stable/tutorials/animation/introduction.html
- https://docs.godotengine.org/en/stable/tutorials/animation/2d_skeletons.html

**Aseprite**
- https://www.aseprite.org/docs/timeline/
- https://www.aseprite.org/docs/slices/
- https://www.aseprite.org/docs/mouse-wheel/
- https://www.aseprite.org/docs/zoom/
- https://www.aseprite.org/docs/preferences/

**Moho**
- https://www.lostmarble.com/moho/manual/timelinewnd.html
- https://www.lostmarble.com/moho/manual/tool_overview.html
- https://www.lostmarble.com/moho/manual/layer_tools.html

**UX**
- https://www.nngroup.com/articles/ten-usability-heuristics/
- https://www.nngroup.com/articles/usability-heuristics-complex-applications/
- https://uwux.medium.com/how-figma-applies-nielsens-10-usability-heuristics-30cf376cb727

---

## Lacunas (para uma próxima rodada)

- Aseprite: ordem dos botões de reprodução e atalhos de quadro.
- Unity: zoom/pan da Scene view e botão de loop da janela Animation.
- Godot 4: zoom/pan do editor 2D, teclas de mover/girar/escalar, Marker2D.
- Moho: zoom/pan da cena e ferramentas de transformação.
- Blender: casca de cebola do Grease Pencil e linha Summary do Dope Sheet.

---

**Assinado:** Pesquisador — sessão "Pesquisa de organização de menus" (Claude Fable 5.1; agentes de busca em Opus). 08/09/2026.
