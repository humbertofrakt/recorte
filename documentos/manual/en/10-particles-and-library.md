# 10. Particles and library

Also in Portuguese: [Português](../10-particulas-e-biblioteca.md)

Written on 07/10/2026, in v36.5. Checked in the code, file by file. Each section
gives its seal; the table at the end gathers them all.

> The editor's interface is in Portuguese. Every button and menu is written
> here with its **exact Portuguese label** in quotes, and the English meaning in
> parentheses the first time it appears.

## What you will be able to do by the end

1. Put fire, smoke, sparks or dust on a bone, with one click.
2. Fine-tune the emitter on its sheet: where it is born, where it goes, the
   colour, the weight.
3. Bring ready-made idle, walk, run and jump into your base.

---

## The words

| Word | What it is |
|:---|:---|
| **Emitter** (emissor) | the place the particles are born from. It is attached to a bone |
| **Particle** (partícula) | a point that is born, flies and dies. Each one has the same image |
| **Burst** (rajada) | many particles at once, in an instant |
| **Seed** (semente) | the number of the draw. The same number always gives the same effect |
| **Library** (biblioteca) | the ready-made animations that come inside the program |

**The playhead goes back, and the particles come back the same.** The effect is
a calculation of time, not a new random draw. That is why the game sees the same
as you.

---

## Where the particles live

Three doors. All three create the same thing.

| Door | Where |
|:---|:---|
| The **"Partículas"** (Particles) menu | in the menu bar |
| The **Partículas** button | in the action bar. It is the only button that always shows its word |
| The **Partículas** panel | **"Janela → Partículas"** (Window → Particles), in the animating block |

The **Partículas** menu:

| Item | Does |
|:---|:---|
| **"Novo emissor vazio"** (New empty emitter) | a magenta emitter, rising. The starting point |
| **"Fogo"** (Fire) | short life, rises fast, shrinks, yellow and red |
| **"Fumaça"** (Smoke) | long life, rises slowly, grows, dark grey |
| **"Faísca"** (Spark) | two bursts of 40, fast, in every direction, falls |
| **"Poeira"** (Dust) | born on a strip, slow, beige to brown, settles |
| **"Prender ao osso escolhido"** (Attach to the selected bone) | the emitter becomes a child of the bone, without moving |

**Each item's tooltip gives the numbers.** Hover over it.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Partículas menu | exists | menu bar |
| Partículas button, with its word | exists | action bar |
| Partículas panel | exists | Janela → Partículas |
| The four ready-made ones and the empty one | exists | menu, button or panel |

---

## Creating an emitter

| Step | Gesture |
|:---:|:---|
| 1 | Click the bone (the foot, the hand, the torch) |
| 2 | **Partículas → Fogo** (or another) |
| 3 | The footer gives the name, the bone and the seed |
| 4 | Play the animation to see it |

**Which bone it is born on:**

| You selected | It is born on |
|:---|:---|
| a bone | that bone |
| an image | the image's bone |
| nothing | the bone **closest to the middle of the scene**. The footer says so |
| there is no bone | it is not born. The footer says *"Create a bone first"* |

| What the program does | Why |
|:---|:---|
| It is born **pointing up**, even on a tilted bone | so the jet does not go sideways |
| It brings along the image `fx/ponto-suave` | a white point with a soft edge. The colour comes from the sheet |
| You clicked Fogo twice on the same bone | the second one is born, and the footer warns *"One more emitter on this bone"* |
| Normal blending on all four | additive over a light background turns into a white smudge. The blending is changed on the slot |

**Creating is a single undo step.** `Ctrl+Z` removes the emitter and the image.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Born on the selected bone, or on the one in the middle of the scene | exists | select the bone, then the item |
| Born pointing up | exists | — |
| The soft-point image comes along | exists | — |
| Warning about a second emitter on the same bone | exists | footer |

---

## In the scene

Every visible emitter has a **four-pointed star** at its origin.

| To | Gesture |
|:---|:---|
| select | click the star, or the live particles |
| move | **"Transformar"** (Transform) in hand, drag. Like an image |
| rotate | **Transformar** in hand, rotate. It rotates the direction too |
| scale | **you cannot**: the emitter has no scale. The program refuses and says why |

**With the emitter selected, the scene draws the shape** the particles are born
from. On the numbers you can drag, there are **handles**:

| Shape | Handles |
|:---|:---|
| circle | the radius |
| ring | the radius and the thickness |
| arc | the radius and the end of the arc |
| rectangle | the corner |
| line | the two ends. The end on top of the star has no handle: type it in the field |
| bone, mesh | no handle. Only the highlight |

Dragging a handle saves that number, and no other. One undo step.

**When the emitter draws nothing, the scene says why**, next to the star:

| Word | It means |
|:---|:---|
| *sem imagem* (no image) | pick one in Propriedades (Properties) |
| *taxa 0* (rate 0) | rate 0 and no burst: nothing is born |
| *emissão desligada* (emission off) | the **"Emitindo"** (Emitting) box is unticked |
| *sem malha* (no mesh) | mesh shape, and no mesh chosen |
| *sem caminho* (no path) · *caminho sumiu* (path vanished) | path shape, and the path is missing |
| *forma desconhecida* (unknown shape) | the file brings a shape this program does not read |

| Function | Seal | Gesture |
|:---|:---:|:---|
| The star in the scene | exists | — |
| Select by the star or by the particles | exists | click |
| Move and rotate | exists | Transformar |
| Scaling refused, with the reason | exists | Transformar |
| The shape drawn, with handles | exists | select the emitter |
| The short warning in the scene | exists | — |

---

## The Partículas panel

**Janela → Partículas.** One row per emitter.

| Part | Does |
|:---|:---|
| **"Novo ▾"** (New) | the empty one or one of the four. The same menu as the bar's button |
| **"Duplicar"** (Duplicate) | copies the selected emitter, with a **new seed**: the two bonfires do not come out the same |
| **"Apagar"** (Delete) | deletes the selected emitter |
| the row | the name, the bone, and the short warning. Click: the sheet opens in Propriedades |

With no emitter, the panel says what to do: *"No emitter. Novo ▾ creates
one…"*.

| Function | Seal | Gesture |
|:---|:---:|:---|
| The list of emitters | exists | Janela → Partículas |
| Novo ▾ · Duplicar · Apagar | exists | the panel's bar |
| Duplicate with a new seed | exists | Duplicar |

---

## The emitter's sheet

Select the emitter. **"Propriedades"** (Properties) shows the sheet in **ten tabs
with icons**. Each tab has at most **five rows**: it fits without scrolling, even
at 1280 × 720.

| Tab | What it has |
|:---|:---|
| **"Nascer"** (Birth) | Emitindo (Emitting) · Taxa (Rate) · Vida (Life) (from · to) · Máximo de vivas (Maximum alive) · Rajadas (Bursts) |
| **"Tempo"** (Time) | Atraso (Delay) · Explosão e janela (Explosion and window) · Tremor (Jitter) · Repetir (Repeat) · Pré-aquecer (Prewarm) (only without Repetir) |
| **"Lugar"** (Place) | X · Y · Ângulo (Angle) · Alfa (Alpha) (the quick sheet) · Osso (Bone). Scale does not apply to the emitter: the tooltip sends you to **Tamanho** (Size) |
| **"Forma"** (Shape) | the nine shape buttons, and the numbers of the chosen shape · Para fora (Outwards) |
| **"Movimento"** (Motion) | Velocidade (Speed) (from · to) · Direção (Direction) · Abertura ± (Spread ±) · Vira com o voo (Turns with the flight) |
| **"Forças"** (Forces) | Gravidade (Gravity) (X · Y) · Freio (Drag) · Espaço (Space) |
| **"Tamanho e giro"** (Size and spin) | Tamanho (Size) (from · to) · Tamanho na vida (Size over life) · Giro inicial (Initial spin) · Giro (Spin) |
| **"Cor"** (Colour) | Cor ao nascer (Colour at birth) (from · to) · Cor na vida (Colour over life) · Some na vida (Fade over life) · Cor do emissor (Emitter colour) |
| **"Imagem"** (Image) | the particle's image · the frame sheet |
| **"Mais"** (More) | Nome (Name) · Semente (Seed) · Na frente (In front) |

**Only the field that applies now appears.** The radius only with the circle.
Pré-aquecer only without Repetir. Nothing vanishes: it is one click away.

**Each number gives its unit and range.** The unit comes after the box (`s`,
`px`, `°`, `%`). The tooltip gives the range and a typical value.

| Field | Good to know |
|:---|:---|
| **Abertura ±** | it is **to each side**. 180 releases in every direction. 0 comes out as a column |
| **Direção** | 0 right, 90 up, 180 left, 270 down |
| **Espaço** | *do emissor* (of the emitter): the particles follow the bone. *do mundo* (of the world): they are left behind when it walks |
| **Freio** | 1 removes 63 % of the speed in one second |
| **Semente** | fixed. The same number, the same effect |
| **Máximo de vivas** | when it cuts, the label says *"corta N"* (cuts N). Raising the rate changes nothing until you raise the maximum |

| Function | Seal | Gesture |
|:---|:---:|:---|
| The sheet in ten tabs, without scrolling | exists | Propriedades, with the emitter selected |
| Only the field that applies now | exists | — |
| Unit after the box, range in the tooltip | exists | hover |
| Máximo de vivas warns when it cuts | exists | Nascer tab |

---

## The shape: where it is born

**Forma** tab. Nine buttons with drawings. Below them, a line gives the name,
where it is born and where it goes: *"Ring: born on the edge, goes upwards"*.

| Button | Born |
|:---|:---|
| **"Ponto"** (Point) | all from the same place |
| **"Retângulo"** (Rectangle) | inside a box |
| **"Círculo"** (Circle) | inside the disc |
| **"Anel"** (Ring) | on the edge of the circle |
| **"Arco"** (Arc) | on a piece of the circle |
| **"Linha"** (Line) | along a segment |
| **"Osso"** (Bone) | along the bone |
| **"Malha"** (Mesh) | from a mesh of the same slot. Grey if the slot has no mesh |
| **"Caminho"** (Path) | along a curve. Grey if the character has no path |

| What the program does | Why |
|:---|:---|
| Choosing the shape gives a starting size | circle of radius 30, box 60 × 40, line of 60. Before, it was born at zero, and could not be seen |
| Only when the current number is zero | the number you set is never overwritten |
| Changing shape does not erase the other one | going back to the circle restores the previous radius |
| Choosing the shape is one undo step | even when it saves two or three fields |

**Ring and arc are not new shapes in the file.** They are the circle with a
thickness and a stretch. In the program they have their own button, because that
is how people look for them.

| Function | Seal | Gesture |
|:---|:---:|:---|
| The nine shape buttons | exists | Forma tab |
| The "born · goes" line | exists | below the buttons |
| Starting size, without overwriting yours | exists | click the shape |
| Path, from any slot | exists | Forma tab, Caminho list |

---

## The life curves and the colour

From the **left** (born) to the **right** (dies).

| Field | Tab | Gesture |
|:---|:---|:---|
| **Tamanho na vida** | Tamanho e giro | click adds a point · drag moves it · right-click removes it · **▾** brings ready-made ones |
| **Some na vida** | Cor | the same |
| **Cor na vida** | Cor | click the bar to add a colour · drag the diamond · **double-click changes the colour** · right-click removes it |

**The ready-made curves (▾):**

| Tamanho na vida (Size over life) | Some na vida (Fade over life) |
|:---|:---|
| igual a vida toda (the same all life long) | sempre inteira (always whole) |
| cresce (grows) | some no fim (fades at the end) |
| encolhe (shrinks) | aparece e some (appears and fades) |
| pulsa (pulses) | some aos poucos (fades little by little) |

**The colour you see is Cor ao nascer times Cor na vida.** White changes nothing.
Below the **Cor na vida** bar, two thin strips show the colour you really see.

**To darken the spark at the end:** **Cor** tab, **Cor na vida** bar. Click: the
two ends come in, white. Double-click the right-hand end: choose dark red.

The two ends always stay. Right-clicking them does not remove them: the footer
says so.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Tamanho na vida, Some na vida | exists | Tamanho e giro tab · Cor tab |
| Ready-made curves | exists | ▾ next to the curve |
| Cor na vida, the gradient | exists | Cor tab |
| The strips of the colour you see | exists | below the Cor na vida bar |
| Saves on release, one undo step | exists | — |

---

## The bursts

**Nascer** tab, **"Rajadas"** (Bursts) row. The button says how many: *"2
rajadas · 34 partículas ▾"* (2 bursts · 34 particles).

| Step | Gesture |
|:---:|:---|
| 1 | Click the button: the small **Rajadas** window opens |
| 2 | **+** adds a burst |
| 3 | One row per burst: when, how many, how many times, how often, the chance |
| 4 | The bin removes the burst |
| 5 | `Esc` or a click outside closes it |

The ready-made spark uses a burst of 40, twice, every 0.5 s.

| Function | Seal | Gesture |
|:---|:---:|:---|
| The small bursts window | exists | Nascer tab → Rajadas ▾ |
| Add, change, remove a burst | exists | + · fields · bin |
| Close with Esc | exists | `Esc` |

---

## The frame sheet

**Imagem** tab. The particle can change picture during its life (the flickering
flame).

| Field | Does |
|:---|:---|
| **"Folha de quadros"** (Frame sheet) | how many frames · the number of the first one · the digits (`2` gives `01`, `02`…) |
| **"A folha corre"** (The sheet runs) | over the life, or at so many frames per second |
| **"Voltas"** (Loops) or **"Quadros"** (Frames) | how many loops over the life, or how many per second |
| **"Quadro inicial"** (Initial frame) | which frame it starts from (from · to) |

With no sheet, only the image row and the sheet row appear. The rest comes when
there are frames.

The list of frames with loose names (`frames`) **has no field**. A file that
carries it still works.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Sheet by number (frames, first, digits) | exists | Imagem tab |
| The sheet runs over the life or per second | exists | Imagem tab |
| The explicit `frames` list | missing | no field; a file that carries it opens |

---

## The weight: what the game can take

In the sheet's title, **in front of the name**, a seal with a word and a number:
*"médio · 80"* (medium · 80).

| Seal | Per emitter | The whole character |
|:---|:---:|:---:|
| **leve** (light) | up to 60 alive | up to 100 |
| **médio** (medium) | up to 150 | up to 300 |
| **pesado** (heavy) | above 150 | above 300 |

| Good to know | |
|:---|:---|
| Where the number comes from | rate × longest life, plus the bursts, up to the Máximo de vivas |
| What it costs | ~50 µs per particle, measured in the Godot reader on 05/10 |
| The tooltip | gives the ms per frame, and the count for the whole character |
| **It only warns** | nothing is prevented. The game may have only one character on screen |
| Warnings bar | only **pesado** goes there. Médio stays on the seal |

| Function | Seal | Gesture |
|:---|:---:|:---|
| The weight seal, with a word and a number | exists | the sheet's title |
| The whole character, in the tooltip | exists | hover over the seal |
| Heavy in the warnings bar | exists | warnings button |

---

## Attaching to another bone

| Gesture | Where |
|:---|:---|
| **Partículas → Prender ao osso escolhido** | select the emitter and the bone. With no bone selected, the window asks which one |
| the **Osso** field | the sheet's **Lugar** tab |

The emitter stays where it is on screen. Already attached to that bone: the
footer says so.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Attach to the selected bone | exists | Partículas menu |
| Osso field | exists | Lugar tab |
| Attach through the Árvore (Tree) and with `P` + click | not confirmed | the code comment says so; I did not see the gesture on the emitter |

---

## Particles in the animation

The emitter applies **in every animation**: its fields live in the attachment.

| To | Gesture |
|:---|:---|
| turn it on and off over time | the **Emitindo** box (Nascer tab), with the animation open: it becomes a key |
| repeat with the animation | the **Repetir** box (Tempo tab) |
| start already full | **Pré-aquecer**, with Repetir off |

**Only Emitindo becomes a key.** Speed, direction, radius and the others not yet.
It was Humberto's decision: keying everything is a round of its own.

Flash, pulse and shake **are not particles**: they save keys. They are in
**"Animação → Efeitos de chave"** (Animation → Key effects)
([chapter 4](04-animate.md#key-effects)).

| Function | Seal | Gesture |
|:---|:---:|:---|
| Emitindo becomes a key | exists | Nascer tab, with an animation open |
| The other numbers become keys | missing | decided for another round |
| Trail and sub-emitter | missing | decided for later |

---

## Particles in the game

The emitter goes into the `.bone` as the `BONE_particles` extension. A reader
that does not know the extension still opens the file, without the particles.

| Reader | Particles |
|:---|:---|
| TypeScript (`runtime/`) | reads them |
| Python (`runtime-python/`) | reads them |
| Construct 3 | reads them. Above 300 alive on one emitter, it draws all of them and **warns** |
| Godot | reads them. They move by themselves |

Conformance cases `P-001` to `P-029` prove the particles.

| Function | Seal | Gesture |
|:---|:---:|:---|
| The extension in the format | exists | `formato/` |
| The readers reading particles | exists | see [chapter 8](08-export-and-use-in-a-game.md) |

---

## The animation library

Four ready-made animations come inside the program: **parado** (idle), **andar**
(walk), **correr** (run) and **pular** (jump).

| Animation | Length | Loops |
|:---|:---:|:---:|
| parado | 2.00 s | yes |
| andar | 1.00 s | yes |
| correr | 0.60 s | yes |
| pular | 0.90 s | no |

They were recorded against the **`humanoide-v1` naming convention**: the body
without art in `formato/rigs/humanoide-v1.bone`. **They go in by bone name.**
Where the name matches, the animation moves the bone. Where it does not, that
part is left out, and the base still opens.

### Bringing them in

| Step | Gesture |
|:---:|:---|
| 1 | **"Animação → Animações → Biblioteca de animações…"** (Animation → Animations → Animation library…) · or the **folder** icon on the strip of the Animações (Animations) panel |
| 2 | The window shows the file, the four animations, and **what this base does not have** |
| 3 | **"Gravar o arquivo e trazer"** (Save the file and bring it in) |
| 4 | Choose where to save: **next to your `.bone`** |
| 5 | The animations appear in the Animações list, in the **"De fora"** (From outside) section |

**The window tells you before bringing them in:**

| Line | It means |
|:---|:---|
| *"Esta base tem todos os nomes"* (This base has all the names) | the animations go in whole |
| *"Esta base NÃO tem o osso …"* (This base does NOT have the bone …) | whatever depends on it is left out. It goes in anyway, and nothing breaks |
| *"Tamanho: … k = 2,000"* (Size: … k = 2.000) | the translations go in multiplied, by the size of the reference bone |

**Why save.** The file lives inside the program. The game cannot find what is
inside the editor. So bringing it in means saving the file next to the project
and referencing its name.

| You closed… | What happens |
|:---|:---|
| the library window | nothing goes in. The footer: *"Nothing came from the library"* |
| the save window | nothing goes in |

**The outside ones are not edited here.** They go in by name when loading.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Animation library, the four | exists | Animação → Animações → Biblioteca de animações… |
| The folder icon in the Animações panel | exists | the Animações panel's strip |
| What the base does not have, before bringing them in | exists | the window |
| The size factor, as a number | exists | the window |
| Saves next to the project and references it | exists | Gravar o arquivo e trazer |
| In the list, under De fora | exists | Animações panel |
| Edit the outside ones in the program | missing | the editor does not edit them |
| See the outside ones playing in the scene | not confirmed | — |
| More animations beyond the four | missing | only `humanoide-v1-animacoes.bone` has animations |

Taking and bringing animations **between your own bases** is another door:
**"Arquivo → Exportar / Importar → Animações…"** (File → Export / Import →
Animations…) ([chapter 5](05-entities.md)).

---

## What does not work yet

| What | How it is today |
|:---|:---|
| The explicit list of frames (`frames`) | no field on the sheet; a file that carries it opens |
| The emitter's other numbers becoming keys | decided for another round |
| Trail and sub-emitter | decided for later |
| Editing the library animations in the program | the editor does not edit them |
| More ready-made animations beyond the four | only `humanoide-v1-animacoes.bone` has animations |
| Attaching the emitter through the Tree, or with `P` + click | not confirmed: use **"Partículas → Prender ao osso escolhido" (Particles → Attach to the selected bone)** |

---

## The seal — what this chapter confirms

Seals: **exists** · **exists differently** · **missing** · **changes with the
bases**. Checked in the code on 07/10/2026. Paths from `editor/src/`.

| Function | Seal | Where |
|:---|:---:|:---|
| Partículas menu: empty, the four, Attach | exists | `ui/menus.ts:1272` |
| Partículas button with its word | exists | `viewport/viewport-toolbar.ts:264`, `panels/particle-presets.ts:640` |
| Partículas panel in the Janela menu | exists | `ui/menus.ts:1640` |
| The four ready-made ones, with their numbers | exists | `panels/particle-presets.ts:127` |
| The empty one, magenta, visible | exists | `panels/particle-presets.ts:253` |
| Which bone it is born on | exists | `panels/particle-presets.ts:294` |
| Born pointing up | exists | `panels/particle-presets.ts:350` |
| Warning about a second emitter on the bone | exists | `panels/particle-presets.ts:559` |
| The star and the click | exists | `viewport/viewport-draw.ts:1023`, `viewport/picking.ts:490` |
| Move and rotate; scaling refused | exists | `viewport/tools/attachment-edit.ts:50`, `panels/quick-model.ts:171` |
| The shape in the scene, with handles | exists | `viewport/emitter-shape.ts:147` |
| The short warning (no image, rate 0…) | exists | `viewport/particles-view.ts:127` |
| Panel: Novo ▾, Duplicar, Apagar | exists | `panels/particles-panel.ts:76` |
| Duplicate with a new seed | exists | `doc/duplicate.ts:264` |
| The sheet in ten tabs, five rows | exists | `panels/particle-sheet.ts:31`, `:309` |
| Unit and range of each number | exists | `panels/particle-sheet.ts:373`, `:425` |
| Máximo de vivas warns that it cuts | exists | `panels/particle-sheet.ts:546` |
| The nine shape buttons | exists | `panels/particle-sheet.ts:163` |
| The "born · goes" line | exists | `panels/particle-sheet.ts:230` |
| Life curves and the ready-made ones | exists | `panels/properties.ts:972`, `panels/life-curve.ts:144` |
| Cor na vida, the gradient | exists | `panels/properties.ts:1091` |
| The bursts, the small window | exists | `panels/properties.ts:1197`, `panels/burst-list.ts:1` |
| The frame sheet by number | exists | `panels/properties-model.ts:1500` |
| The `frames` list | missing | plan `16`, Deviations of batch 9 |
| The weight seal | exists | `panels/properties.ts:218`, `panels/particle-weight.ts:115` |
| Heavy in the warnings bar | exists | `panels/particle-weight.ts:133` |
| Attach to the selected bone | exists | `panels/particles-actions.ts:26` |
| Attach through the Árvore and with `P` | not confirmed | only the comment in `panels/particles-actions.ts:5` |
| Emitindo becomes a key | exists | `anim/keying.ts:679` |
| The other numbers become keys | missing | plan `16`, question 4 |
| Trail and sub-emitter | missing | plan `16`, section 7 |
| Readers reading particles | exists | `leitor-construct/LEIA-ME.md:100`, `leitor-godot/LEIA-ME.md:73` |
| Library in the Animação menu | exists | `ui/menus.ts:1368` |
| Folder icon in the Animações panel | exists | `panels/animations.ts:161` |
| The factory files | exists | `io/animation-library.ts:52`, `formato/rigs/` |
| What is missing, before bringing in | exists | `io/animation-library.ts:219` |
| The size factor | exists | `io/animation-library.ts:128` |
| Save and reference | exists | `io/animation-library.ts:268`, `panels/animations-actions.ts:596` |
| Edit the outside ones | missing | `panels/animations.ts:70` |
| See the outside ones playing | not confirmed | — |

---

Back to the [index](README.md).
