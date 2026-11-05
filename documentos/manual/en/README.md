# The Recorte manual

Also in Portuguese: [Português](../README.md)

Recorte animates 2D drawings with bones, for games.

This manual is for people who **use** the program. It is not the format
specification. That lives in `formato/ESPECIFICACAO 2026-09-17.md`.

> **The editor's interface is in Portuguese only.** So this manual writes every
> button and menu with its **exact Portuguese label**, in quotes, followed by the
> English meaning in parentheses the first time it appears: **"Virar malha"**
> (Turn into mesh). What you read in quotes is what you will see on screen.

---

## 05/11/2026 — the manual counts again (step D13)

The manual was **paused** from 10/09: first the program, then the manual. The
program is ready. Humberto asked to finish. The pause is off.

| What changed | How |
|:---|:---|
| **The photos** | all taken again from the real program, at 1440×900, by `node ferramentas/manual-fotos.mjs` |
| **The click paths** | checked one by one against the menus in the code |
| **The manual's tests** | run again. A photo without a caption, a spare photo, a renamed button: the test fails |
| **The start of each chapter** | three lines: what you will be able to do |
| **The end of each chapter** | the honest list: what does not work yet |

---

## 07/10/2026 — the manual catches up with v36.5

The 15/09 manual fell behind: the program has moved a long way since then. In
**version v36.5**, the chapters are checked again **in the code**. Chapters 8
and 9 are done. Chapter 10 is new, written from the code.

| Seal | It means |
|:---|:---|
| **exists** | it is in the program today, with the gesture written down |
| **exists differently** | it is there, but not the way the chapter asked for |
| **missing** | it is not there yet |
| **changes with the bases** | it depends on the model of bases and entities |
| **not confirmed** | the chapter says it, and nobody checked it in the code |

Every chapter closes with the **seal** table. What used to be a guide and has
been delivered now reads **exists**.

### What changed in chapters 8 and 9

| Chapter | What changed |
|:---|:---|
| 8 | The **Construct 3 reader** (since 05/10) and the **Godot reader**. The **"Arquivo → Exportar"** (File → Export) menu with the new names. **"Entregar uma base…"** (Deliver one base…). Open, Save, the unsaved-changes window and **"Reabrir o fechado"** (Reopen the closed one). **"Só este quadro"** (Only this frame) and the `.zip` in image export. The validator reads `.bonez` |
| 9 | The Spriter table checked key by key. New: pivot per image, guides, changing parent in the animation, `Ctrl+←` `Ctrl+→`, `Ctrl` + drag to clone, selecting children and parents, skins in **"Feitas"** (Made) and **"Ativas"** (Active). Create bone is now `B`. Importing asks for **the project folder** |

### 15/09/2026 — the new backbone

*"There is a manual written, it was based on the old version. What we are doing
is creating the guide manual for the NEW version of the program."* — Humberto.

The backbone is **bodies · animations · entities**, the program's new model
(chapter 2). In the program, "body" is called **base**, and "pele" is called
**skin**.

## Where to start

| You are | Start at |
|:---|:---|
| Never opened Recorte | **[0. Open Recorte](00-open-recorte.md)**, then **[2. Bases and animations](02-bases-and-animations.md)** — the model, in one read |
| Want to check we understood the request | **[2. Bases and animations](02-bases-and-animations.md)** directly — that is where the werewolf is written |
| You already animate in another program | [9. Coming from Spriter](09-coming-from-spriter-spine-and-dragonbones.md), then go back to 0 |
| You only want it in your game | [8. Export and use in a game](08-export-and-use-in-a-game.md) |

---

## The eleven chapters

| # | Chapter | What you learn |
|:---:|:---|:---|
| 0 | [Open Recorte](00-open-recorte.md) | Install, open, and read the screen: the five bands, the bar, the menus, the two modes. |
| 1 | [Build a body](01-build-a-body.md) | Bring the images in, create bones, attach drawings to bones, draw order, folders. |
| **2** | **[Bases and animations](02-bases-and-animations.md)** | **The backbone of the new model: the base as a one-frame animation, the two lists, the werewolf. Read this one before the others.** |
| 3 | [Skins](03-skins.md) | Change the clothes without redoing the skeleton. One skin, many skins, and what the game calls. |
| 4 | [Animate](04-animate.md) | The player, the keys, the loop, the marks, the curves, and the strip that drives an entity. |
| 5 | [Entities](05-entities.md) | Hanging skeletons — the sword, the chainsaw, the mecha's fire — and reusing an animation from outside. |
| 6 | [Mesh and weights](06-mesh-and-weights.md) | Bend the drawing from the inside, and paint how much each bone pulls. |
| 7 | [The five rules](07-the-five-rules.md) | IK, transform, path, physics and driver. One by one, with the hero example. |
| 8 | [Export and use in a game](08-export-and-use-in-a-game.md) | The three packagings, opening and saving, the Export menu, the validator, and the character in the game: Construct 3, Godot, or code. *Checked on 07/10.* |
| 9 | [Coming from Spriter, Spine and DragonBones](09-coming-from-spriter-spine-and-dragonbones.md) | Every Spriter thing and where it is here, with its key. Bringing the project in by its folder. Also Spine and DragonBones. *Checked on 07/10.* |
| 10 | [Particles and library](10-particles-and-library.md) | Fire, smoke, spark and dust in one click; the sheet in ten tabs, the shape, the colour, the bursts, the weight. And ready-made idle, walk, run and jump. *Written on 07/10.* |
| 11 | [One's sword, another's puppet](../11-a-espada-de-um-o-boneco-de-outro.md) | One person draws the sword, another animates the hero, and the file joins the two. Step by step. *In Portuguese only, written on 05/11.* |

Every chapter opens with **"What you will be able to do by the end"**, in three
lines, and closes with a **seal** table — the honest list of what exists, what
is missing, and what changes with the bases.

---

## The manual as a PDF

Generated from **the same page** that **"Ajuda → Manual"** (Help → Manual)
(`F1`) builds, and not from a second copy of the text — never two sources saying
different things. The 09/09 PDF left the folder: it was the old manual, with no
seals, and would cause confusion next to the new one (kept in `backup/`, it does
not come back). To generate a new one:

```
npm run manual-pdf
```

The script starts the editor by itself, and finds Chrome or Chromium by
itself. The file comes out with the date in its name, and yesterday's is not
overwritten.

---

## How this manual writes things

| Written like this | Means |
|:---|:---|
| **"Arquivo → Salvar"** (File → Save) | a menu path |
| **"Chavear"** (Key) (`K`) | a button, with its key |
| `heroi.bone` | a file name, a command, or a name inside the file |
| *Nova regra* (New rule) | a window the program opens |

**Every button is quoted with the exact wording of its tooltip.** Hover over any
button in the program and the tooltip tells you the name and the key — it is
the same word that is here, in quotes.

Messages the program writes in the footer are given here in English, in italics.
On screen they are in Portuguese.

The pictures are of the editor running, at 1440 × 900, in the dark theme, which
is how the program opens.

---

## The nine words

Each one is explained again in the chapter where it appears.

| Word | What it is |
|:---|:---|
| **Bone** (osso) | An invisible piece that moves the drawing. Has position, rotation and size. |
| **Slot** | Where a drawing appears. Attached to a bone, and has a draw order. |
| **Attachment** (anexo) | The drawing itself: an image, a mesh, a collision box, a point. |
| **Skin** (pele) | A set of attachments. Changing skin changes the clothes without touching the skeleton. In the program: **Skin**. |
| **Key** (chave) | The value of a property at one instant of the animation. |
| **Mesh** (malha) | The drawing cut into triangles, so it can bend from the inside. |
| **Weight** (peso) | How much each bone pulls each point of the mesh. |
| **Rule** (regra) | An automatic calculation on top of the bones. IK, physics and the other three. |
| **Atlas** | One big page with several images inside, plus the list of where each one is. |

---

## The manual in English

**Redone on 07/10/2026**, from the Portuguese chapters of v36.5. House decision:
translate after the Portuguese is right, never at the same time. The Portuguese
text is the source; when the two disagree, the Portuguese one wins.

**The editor's labels stay in Portuguese.** That is why this manual writes each
label in Portuguese, in quotes, with the English in parentheses: **"Virar
malha"** (Turn into mesh).

The conformance document, which is what a foreign runtime author reads, is also
in both languages:
[como provar conformidade](../../../conformidade/como-provar-conformidade.md) and
[how to prove conformance](../../../conformidade/how-to-prove-conformance.md).

---

## Questions everybody asks

### How much does it cost?

Nothing.

| What | Licence | Commercial use |
|:---|:---|:---|
| The `.bone` format | CC BY 4.0 | Free |
| The runtime | Apache 2.0 | Free |
| The editor | Apache 2.0 | Free |
| The tools | Apache 2.0 | Free |

No royalties. No per-game licence. No revenue cap.

### Do I need to buy the editor to use the runtime in my game?

No. Never.

**The runtime does not ask where the file came from, and never will.** That is
the number one complaint of Spine users, and the first mistake this project
committed to not repeating.

### Is there a "pro" feature left out?

No. Inverse kinematics, mesh, per-vertex weights, physics and skins are the
**minimum**, not extras.

### Can the licence get more restrictive later?

No. It is written in the specification, in the governance section: *the licence
never changes to a more restrictive licence*.

And if the project stops: if the format committee stops for 24 months, anyone
who passes the conformance suite may continue the repository, under the same
name and the same licence. That exists because DragonBones stopped in 2020 and
nobody could continue it.

### Why another format?

Because **none of the existing ones is truly open**.

| Program | The problem |
|:---|:---|
| Spine | Own JSON, no public specification; the runtime requires an editor licence |
| DragonBones | Own JSON, partly documented; editor stopped since 2020 |
| Live2D | Own JSON, closed; subscription only |
| Creature | Own JSON; small community, weak documentation |
| Spriter | Own XML; **no mesh in the format** |

All of them are the format **of a program**. If the program dies, the format
dies with it, and the work is trapped.

PDF became a standard because it is open, stable, and any program can read it —
nobody needs Acrobat. glTF did the same for 3D. Both have the same four things,
and `.bone` has all four:

| # | What | Has it? |
|:---:|:---|:---:|
| 1 | written, public specification | yes |
| 2 | official free validator | yes |
| 3 | test suite any reader can run | yes |
| 4 | written governance, with a succession rule | yes |

### Will my old file open in the new program?

Yes. Always. It is principle number one of the specification: version 1.x only
adds; it never removes and never changes the meaning of what already exists.

A file that uses a feature your reader does not know **still opens**: every
unknown property is ignored, and every unknown value has a written fallback
behaviour.

### Can I trust another program to read my file the same way?

That is the right question, and the answer is why this project exists.

The format has **two runtimes**, written along independent paths: one in
TypeScript and one in Python, the latter made only from the **text** of the
specification, without looking at the other's code. There is a tool that puts
the two face to face and compares them **field by field**:

```
npm run conformidade:dois
```

Today the suite has **120 cases** (07/10/2026). Who passes:

| Reader | Cases |
|:---|:---:|
| TypeScript (`runtime/`) | 120 of 120 |
| Construct 3 (`leitor-construct/`) | 120 of 120, on the package |
| Godot (`leitor-godot/`) | 119 of 120 |
| Python (`runtime-python/`) | today's number not confirmed |

When the runtimes disagreed, the one that was wrong was almost always the
**specification**, and the text was fixed.

**A format with only one runtime is not a format: it is a program.**

### What are levels A, B and C?

| Level | Name | Supports |
|:---:|:---|:---|
| **A** | Basic | bones, slots, images, skins, atlas, keys, events |
| **B** | Mesh | everything in A, plus mesh, weights, boxes, clipping, binary |
| **C** | Full | everything in B, plus the five rules, parameters, morphs, skeleton inside skeleton |

A file of a higher level **still opens**: the unsupported parts follow the
fallback rules. The goal is that a small engine can reach level A in a weekend.

### Where do I see everything that does not work yet?

In every chapter, in the last section. The full list, with the requirements
scoreboard, is in `ESTADO.md`.

---

**The standard is the file, not the program.** The program is only the best way
to create that file.
