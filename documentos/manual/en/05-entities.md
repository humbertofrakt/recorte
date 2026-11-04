# 5. Entities

Also in Portuguese: [Português](../05-entidades.md)

Updated on 07/10/2026, in v36.5. **Almost everything that was "missing" on
15/09 now exists.** Each section gives its seal; the table at the end gathers
them all.

> The editor's interface is in Portuguese. Every button and menu is written
> here with its **exact Portuguese label** in quotes, and the English meaning in
> parentheses the first time it appears.

## What you will be able to do by the end

1. Bring a ready-made animated piece (the sword, the fire, the tyre) into the
   project.
2. Put the piece in the place of an image, and have it inherit the place and
   the keys.
3. Drive the piece with its **strip** on the timeline.
4. Test fittings without touching the file, and save only what turned out well.
5. Put the character **inside** another piece ("Este boneco", this character).

---

## His request

> *"I want a system to make a base animation and be able to use it on other
> characters, and nested animation: I make an animation and then swap the
> character's 'sword' for an animated 'chainsaw'."*

> *"A base can become an entity and an entity can become a base."*

---

## The words

| Word | What it is |
|:---|:---|
| **Animation** | what you are working on now |
| **Base** | the assembled body. Each base has its own animations ([chapter 2](02-bases-and-animations.md)) |
| **Entity** | a finished project, already animated, fitted into another |

**Base or entity depends on where you stand.**

| | **Base** | **Entity** |
|:---|:---|:---|
| Who animates | **you, by hand** | **itself** — it comes already animated |
| What you do | poses, keys, mesh, bones | choose **which** of its animations plays, and adjust the strip |
| In the scene | it is the character | takes the place of an image, in the draw order |

Every body is a **plug adapter**: it has a plug and it has sockets. There is no
piece that only receives and no piece that only goes in.

**The explosion** sums up the idea: *"I control it, I swap the explosion's
animations."* Nobody animates it. You choose which of its animations plays.

---

## Image first, motion later

> *"I would make a helicopter with an image of a rotor. Then, separately, I
> would make the rotor animation and swap it for the image."*

| Step | Why |
|:---:|:---|
| The helicopter is born with an **image** of the rotor | you get the pivot and the draw order right, and animate the helicopter |
| The spinning rotor becomes its own **entity** | made separately, as a loop |
| **Replace the image with the entity** | it inherits the image's place, pivot, draw order and keys |

**If the helicopter tilts, the rotor tilts with it.** It sits in the image's
place, and the image already knew how to tilt.

---

## Bring an entity into the project

| Step | Gesture |
|:---:|:---|
| 1 | **"Entidades → Trazer entidade de fora…"** (Entities → Bring entity from outside…) and pick the `.bone` |
| 2 | It goes onto the **Prateleira** (Shelf) of the **Entidades** (Entities) tab (**"Janela → Entidades"**, Window → Entities), and into the right-click grid |

The thumbnail on the shelf is **still**, in the setup pose. Humberto's
decision, 15/09: a row of walking characters steals the eye of whoever is
animating.

If an entity's file has vanished from the disk, the footer warns *"The entity
espada.bone was not opened; this slot stays empty"*, and the warnings button
shows the count.

---

## Putting the entity on the character — three ways

### 1. In the place of an image: the grid

**Wherever an image fits, an entity fits.**

| Step | Gesture |
|:---:|:---|
| 1 | Right-click the image, in the scene |
| 2 | The grid opens: images first, then the **entidades** (entities) block |
| 3 | Click the entity |

| The entity… | How it is |
|:---|:---|
| inherits | the image's place, draw order and keys |
| its pivot | lands on the image's pivot |
| size | the entity decides |
| where it is saved | **always in the base**, even with an animation open. The footer says *"(went to the base)"* |

**"Trocar todas as iguais (N)"** (Swap all identical ones (N)): in the grid, the
button appears when several pieces show the same image (the four wheels). It
starts **off**. When on, the click swaps all N at once, in a single undo step.

**Removing the entity**: right-click the entity → **"Tirar a entidade"**
(Remove the entity), or **"Entidades → Tirar a entidade"**. The entity goes,
and the image from before comes back. It is greyed out when the entity did not
replace any image: then it is **"Apagar"** (Delete).

### 2. Drag from the Shelf into the scene

Drag the entity from the Entidades tab into the scene. It sticks to the bone it
lands on.

| Where you are | It applies |
|:---|:---|
| in the **base** | in every animation |
| in an **animation** | only there, from the playhead on. The footer says *"The base and the other animations stay without it"* |

It starts playing its **first animation**. With no animation, it stays still,
and the footer says so.

The same, from the menu: **"Entidades → Pôr entidade na cena…"** (Entities →
Put entity in the scene…) (attached to the selected bone; with no bone, to the
root).

### 3. As a test, through the Entidades tab

See [The Entidades tab](#the-entidades-tab-montagem-and-prateleira), further
down.

| Function | Seal | Gesture |
|:---|:---:|:---|
| The grid listing entities next to the images | exists | right-click the image, in the scene |
| The entity inherits place, order and keys | exists | the grid |
| Swap all identical ones | exists | button in the grid |
| Remove the entity, the old image comes back | exists | right-click · Entidades → Tirar a entidade |
| Drag into the scene | exists | Entidades tab → scene |
| Put it through the menu | exists | Entidades → Pôr entidade na cena… |
| Swapping through the grid in an animation applies **only from there on** (decision of 04/10) | exists differently | the grid saves into the base. Dragging into the scene is what applies only in the animation |

---

## The strip on the timeline

The entity arrives already animated. On the timeline it is a **strip**, with
the name of the animation it plays written on it.

| Gesture | Effect |
|:---|:---|
| drag the strip | changes when it starts |
| pull the **end** outwards | plays slower |
| pull the end inwards | plays faster |
| right-click the strip | picks which animation plays, and **"Em laço"** (Looping) |

| Looping | Not looping |
|:---|:---|
| runs on its own, endlessly. Thin ticks mark each loop | plays once and stops on the last frame. The rest of the strip is dimmed |

The same, from the menu, with the entity selected:

| Item | Does |
|:---|:---|
| **"Entidades → Escolher a animação dela…"** (Entities → Choose its animation…) | which animation plays, from the playhead on |
| **"Entidades → Em laço"** | turns the loop on and off |

**Who gives the orders:**

| You… | It means |
|:---|:---|
| chose the entity's animation | the receiver is in charge (the chainsaw) |
| chose **"livre — o jogo escolhe"** (free — the game chooses) | nobody is in charge: the game chooses (the character inside the pink power) |

An order for an animation the piece does not have: it stays still, and the
editor warns.

| Function | Seal | Gesture |
|:---|:---:|:---|
| The strip, with the animation's name | exists | timeline |
| Drag the strip (when it starts) | exists | drag |
| Pull the end (speed) | exists | drag the end |
| Choose the animation | exists | right-click the strip · Entidades → Escolher a animação dela… |
| Looping / not looping | exists | right-click the strip · Entidades → Em laço |
| The background channel `baseAnimation` (runs underneath everything) | missing | the editor reads it, but there is no door to choose it |

---

## Working on the entity from the inside

| Step | Gesture |
|:---:|:---|
| 1 | **"Janela → Animações"** (Window → Animations). Below your animations, the entities appear, each with its own animations, indented |
| 2 | Click one of the entity's animations |
| 3 | You animate the entity from the inside. The character stays in view, still, around it |
| 4 | To go back: click one of the character's animations (it appears in the list with the **base** mark) |
| 5 | **"Arquivo → Salvar a entidade editada…"** (File → Save the edited entity…): **"Novo"** (New, a copy in this project) or **"Por cima"** (Over it, into the source file) |

### Promote and demote

| Gesture | What happens |
|:---|:---|
| **"Entidades → Promover a base"** (Entities → Promote to base) · right-click the entity on the Shelf | the entity moves to the **Bases** list, with its animations |
| **"Entidades → Rebaixar a entidade"** (Entities → Demote to entity) · button on the Bases strip | the base becomes an entity again. The base in focus cannot be demoted |

**It is the same file all the time — the role changes, not the material.**

### Marking an image as a slot

An image becomes a **base** of the project, with its own name and animations.

| Step | Gesture |
|:---:|:---|
| 1 | Right-click the image, in the scene → **"Marcar como slot…"** (Mark as slot…) (or **"Entidades → Marcar como slot…"**) |
| 2 | Give it a name. *"name.bone is born, in the list of bases"* |
| 3 | Nothing changes in the drawing. The name appears in Animações, in the Árvore (Tree) and in the Ordem (Order) |
| 4 | Click its name in Animações: you build it from the inside, with the character in view |

Undo: **"Entidades → Desmarcar o slot"** (Entities → Unmark the slot), or the
same item on right-click. Only an image can become a slot: for a box, a point
and a path the item is greyed out, and the tooltip says why.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Entities in the Animações window, with their animations | exists | Janela → Animações |
| Animate from the inside, with the character in view | exists | click one of the entity's animations |
| Save the edited entity: New or Over it | exists | Arquivo → Salvar a entidade editada… |
| Promote to base | exists | Entidades → Promover a base |
| Demote to entity | exists | Entidades → Rebaixar a entidade |
| Mark and unmark a slot | exists | right-click the image · Entidades menu |

---

## "Este boneco": the socket the other way round

The pink power was made to **receive** the character. But you are animating the
character, and you want to put the power on it.

| Step | Gesture |
|:---:|:---|
| 1 | Put the power on the character (drag it from the Shelf) |
| 2 | Right-click the **middle** image of the power |
| 3 | The **first item** of the grid is **"Este boneco"** (This character) |

| What the program does |
|:---|
| The middle image **is not drawn**. It only marks the middle |
| Whatever is behind it goes **behind the whole character** |
| Whatever is in front goes **in front** |

The footer counts: *"poder5 around heroi: 2 behind, 2 in front"*. The Ordem tab
shows two rows, *na frente (N)* (in front) and *atrás (N)* (behind). With the
power selected, the scene shows a dashed orange box in the middle.

**From the menu:** **"Entidades → Este boneco…"** opens the list of images, each
with the count of how many stay behind and in front.

**Undo:** right-click again → **"Tirar o Este boneco"** (Remove "Este boneco") ·
**"Entidades → Tirar o Este boneco"** · `Ctrl+Z`.

| Where | It applies |
|:---|:---|
| in the base | in every animation |
| in an animation | only there, from the playhead on |

| Function | Seal | Gesture |
|:---|:---:|:---|
| Este boneco, first item of the grid | exists | right-click the middle image |
| Pick the middle from the list | exists | Entidades → Este boneco… |
| Remove it | exists | right-click · Entidades → Tirar o Este boneco · `Ctrl+Z` |

---

## The Entidades tab: Montagem and Prateleira

**"Janela → Entidades"**. Box inside box: who is inside whom reads from top to
bottom. **No wires.**

| Part | What it is |
|:---|:---|
| **The bar** | **"Na cena"** (In the scene) and **"Pôr no projeto"** (Put in the project) (icon and word) |
| **"Montagem"** (Assembly) | the tree of cards. A card inside a row is in that row's slot |
| **"Prateleira"** (Shelf) | every entity in the project, as thumbnails. *Drag into a slot* |

**The words in the corner of the card:**

| Word | It means |
|:---|:---|
| **aqui** (here) | the open project. It is the one you animate |
| **projeto** (project) | the piece is saved in the file. Solid border |
| **teste** (test) | the piece is only being tested. **Dashed** border and warning colour |
| **em volta** (around) | the outer one, with the project inside it |

**What a test is:** it applies on screen and in the Prévia (Preview), and **does
not go into the `.bone`**. It is kept in the project's `manifest.json`, which the
game ignores. It comes back when you reopen.

### The gestures

| To | Gesture | From the menu |
|:---|:---|:---|
| **Connect as a test** (the chainsaw in the hand) | drag from the Shelf onto the slot's row | Entidades → Pôr em teste neste slot… (Put as a test in this slot…) |
| **Disconnect** | drag the test card back to the Shelf · right-click the card → "Desligar" (Disconnect) | Entidades → Desligar o teste deste slot (Disconnect this slot's test) |
| **Swap the piece** | drop another one on top of it | — |
| **Connect upwards** (the character in the mecha's pilot seat) | drag the **aqui** card onto the mecha, on the Shelf. A window asks for the slot | Entidades → Pôr o projeto dentro de… (Put the project inside…) |
| **Remove the outer one** | right-click the outer card → "Tirar de volta" (Take back out) | Entidades → Tirar de volta |
| **See the test in the scene** | **Na cena** button | — |
| **Save into the file** | **Pôr no projeto** button · right-click the card → Pôr no projeto | Entidades → Pôr no projeto… |
| **What the piece plays** | **anima ▾** (animates) on the card: still, the receiver's, one of its own, or **livre** (free) | Entidades → O que a peça de teste toca… (What the test piece plays…) |
| **The piece's skins, in test** | **skins ▾** on the test card | Entidades → Skins da peça de teste… (Skins of the test piece…) |
| **The four wheels** | **Trocar todas as iguais (N)** on the test card | Entidades → Teste em todas as iguais (Test on all identical ones) |
| **See the other images** | the row **+ N outras imagens** (+ N other images) | — |
| **Fold a card** | ▸ / ▾ on the card (short screen) | — |

**Pôr no projeto** saves **into the base**: it applies in every animation.
`Ctrl+Z` turns the connection back into a test. Upwards, the outer one enters
the character through **Este boneco**.

**The hard cases:**

| Case | What the program does |
|:---|:---|
| Cycle (the mecha inside the character, with the character inside the mecha) | refused on drag. The card says *"… is already above"* |
| Too deep | refused: *"… too deep"* |
| Entity that vanished from the disk | the card stays, with **?** and the row **falta o arquivo** (file missing) |
| Many levels around, short screen | the outer ones become a **trail** at the top. Click a name to open that level |
| The same entity twice | two copies, separate |

| Function | Seal | Gesture |
|:---|:---:|:---|
| The Entidades tab with Montagem and Prateleira | exists | Janela → Entidades |
| Connect and disconnect as a test | exists | drag · Entidades menu |
| Connect upwards | exists | drag the aqui card · Entidades → Pôr o projeto dentro de… |
| Na cena | exists | Na cena button |
| Pôr no projeto | exists | button · Entidades → Pôr no projeto… |
| anima ▾, livre, skins ▾, identical ones | exists | on the card · Entidades menu |
| Cycle and too deep refused | exists | on drag |
| The Preview showing the outer one **around** (the mecha) | missing | the Preview shows only the test pieces **on** the character (Deviations of plan `22`, batch 4) |
| Pôr no projeto **in an animation**, from the playhead on | exists differently | it always goes to the base |

---

## The Animations list gaining entries from outside

A `.bone` with only animations, with a `rig` block saying which bones it
requires. Applied to a character that has those bones, the animation goes in as
if it were its own.

| To | Gesture |
|:---|:---|
| take animations to another base | **"Arquivo → Exportar → Animações, para outra base…"** (File → Export → Animations, to another base…) · right-click the animation → "Exportar animação…" (Export animation…) |
| bring animations from another base | **"Arquivo → Importar → Animações, de outra base…"** (File → Import → Animations, from another base…). The list of what is missing appears first |
| the ready-made ones (idle, walk, run, jump) | **"Animação → Animações → Biblioteca de animações…"** (Animation → Animations → Animation library…) · folder icon on the Animações strip |

The referenced files appear in the Animações window, in the **"De fora"** (From
outside) section.

| Function | Seal | Gesture |
|:---|:---:|:---|
| Export animation with `rig` | exists | Arquivo → Exportar → Animações, para outra base… |
| Import animation from outside | exists | Arquivo → Importar → Animações, de outra base… |
| Animation library | exists | Animação → Animações → Biblioteca de animações… |

---

## The examples that prove the format

In the `formato/exemplos/` folder, cited in the specification.

| File | What it proves |
|:---|:---|
| `exemplos/mecha.bone` | hangs the sword; pulls an animation and a skin from another file |
| `exemplos/espada.bone` | the nested child, with the animations `idle`, `brilho`, `attack` |
| `exemplos/mecha-pele-inverno.bone` | an external skin that swaps the head for an animated skeleton |
| `exemplos/capacete.bone` | a helmet with its own skeleton and animations |

`npm run conformidade`: **120 of 120** cases pass (07/10).

---

## The seal — what this chapter confirms

| Function | Seal | Gesture or where |
|:---|:---:|:---|
| Bring entity from outside | exists | Entidades → Trazer entidade de fora… |
| The grid listing entities | exists | right-click the image, in the scene |
| The entity follows the image (inherits place, order, keys) | exists | the grid |
| Swap all identical ones | exists | button in the grid |
| Remove the entity | exists | Entidades → Tirar a entidade |
| Drag into the scene / Put entity in the scene | exists | Entidades tab · Entidades → Pôr entidade na cena… |
| The grid in an animation applying only from there on | exists differently | saves into the base |
| The strip: drag, end, right-click | exists | timeline |
| Looping | exists | Entidades → Em laço |
| Free — the game chooses | exists | anima ▾ on the card |
| `baseAnimation` | missing | no door |
| Entities in the Animações window | exists | Janela → Animações |
| Animate the entity from the inside | exists | click one of its animations |
| Save the edited entity | exists | Arquivo → Salvar a entidade editada… |
| Promote to base / Demote | exists | Entidades menu |
| Mark as slot / Unmark | exists | right-click · Entidades menu |
| Este boneco | exists | right-click the middle image · Entidades → Este boneco… |
| The Entidades tab: test and project | exists | Janela → Entidades |
| Connect upwards | exists | Entidades → Pôr o projeto dentro de… |
| The Preview with the outer one around | missing | only the pieces on the character |
| On a base switch, the entity follows the slot of the same name | exists | format rule (§9.13). The on-screen warning is **not confirmed** |
| Animations from outside, with `rig` | exists | Arquivo → Exportar / Importar → Animações… |
| The format and the runtime | exists | spec §2.9, §7.11, §9.9, §9.13; conformance 120/120 |

---

Next: [6. Mesh and weights](06-mesh-and-weights.md)
