# Referência — partículas: onde se cria, como a ficha se dobra — 28/09/2026

Escrito pelo `EXECUTANDO · partículas que se acham` (chat B), 28/09, antes do
lote 1. Régua 1 da rodada final: **referência primeiro, código depois.**

**Legenda da fonte:**
**página** = abri a página e li o trecho ·
**busca** = só o resumo do buscador; a página não abriu para mim.

---

## Lote 1 — onde fica o botão de criar

### Os três da casa

| Programa | Tem partícula? | O que tem no lugar | Fonte |
|:---|:---:|:---|:---|
| **Spriter** | **não** | "action points": um ponto com ângulo, por quadro, para o **jogo** soltar bala ou partícula | **busca**: [pixeljoint](https://pixeljoint.com/Forum/forum_posts.asp?TID=18830), [Steam](https://store.steampowered.com/app/332360). Página oficial: **não achei** |
| **Spine** | **não** | o **Ponto** (point attachment): *"can be used to spawn particles"*. Cria-se em: Árvore → escolher osso → `New...` → `Point` | **página**: [Point attachments](https://eu.esotericsoftware.com/spine-points) |
| **Spine**, por quê | — | a equipe recusa um sistema de partícula: cada runtime faz partícula de um jeito, e manter isso em todos é caro | **busca**: [fórum 16807](https://fr.esotericsoftware.com/forum/d/16807-request-particle-system-in-spine-pretty-please), [fórum 13775](https://esotericsoftware.com/forum/d/13775-can-we-have-some-thing-work-like-particle-system-in-spine). A página do fórum não abriu |
| **DragonBones** | **não** | os tipos de desenho são só `image`, `armature`, `mesh`, `boundingBox` | **página**: [formato JSON 5.5](https://unpkg.com/dragonbones-tools@0.1.2/doc/dragonbones_json_format_5.5.md) |

> **Spriter, Spine e DragonBones não têm partícula.**
> Provas: Spine — [Point attachments](https://eu.esotericsoftware.com/spine-points)
> (o Ponto existe *"para soltar partícula"* no jogo). DragonBones —
> [formato JSON 5.5](https://unpkg.com/dragonbones-tools@0.1.2/doc/dragonbones_json_format_5.5.md)
> (quatro tipos de desenho, nenhum de partícula). Spriter — só o resumo da busca
> ([pixeljoint](https://pixeljoint.com/Forum/forum_posts.asp?TID=18830)): *action
> points* para o jogo soltar a partícula. Página oficial do Spriter: **não achei**.

**Nós temos.** Não há modelo dentro da casa para copiar — por isso a ficha
manda olhar os motores de jogo.

### Os motores e os editores de partícula

| Programa | Onde fica o botão de criar | Fonte |
|:---|:---|:---|
| **Unity** (Shuriken) | menu **GameObject → Effects → Particle System**, ou Component → Effects → Particle System. O "+" da Hierarquia abre o mesmo menu | **página**: [Creating a Particle System](https://docs.unity3d.com/6000.4/Documentation/Manual/PartSysUsage.html) |
| **Godot** (GPUParticles2D) | botão **"+" (Add Child Node)** no alto da aba Cena → janela com busca → digitar o nome. Nasce um **ponto branco com ícone de aviso**, até ganhar o material | **página**: [Nodes and scenes](https://docs.godotengine.org/en/stable/getting_started/step_by_step/nodes_and_scenes.html), [2D particle systems](https://docs.godotengine.org/en/4.5/tutorials/2d/particle_systems_2d.html) |
| **Cocos Creator** | botão direito na Hierarquia → **Create → Effects → Particle System** | **busca**: [ParticleSystem2D](https://docs.cocos.com/creator/manual/en/particle-system/2d-particle/2d-particle.html) |
| **GDX Particle Editor** (libGDX) | janela **Effect Emitters**, botão **Template**: modelos prontos — *flame, smoke, sparks, explosion, rain, fireworks*… | **busca**: [wiki do GDX Particle Editor](https://github.com/libgdx/gdx-particle-editor/wiki). A página do guia não abriu |

### Modelos prontos

| Programa | Tem? | Fonte |
|:---|:---|:---|
| Unity | no manual lido, **não achei** modelo pronto no menu de criar | página acima |
| Godot | o tutorial **não fala** em modelo pronto | página acima |
| GDX Particle Editor | **sim**: botão Template, com chama, fumaça, faíscas | busca |

### O modelo que seguimos, e por quê

| # | Decisão | Por quê |
|:---:|:---|:---|
| 1 | O emissor continua no **Novo ▾** da Árvore e em **Esqueleto → Novo** | é o lugar do Spine para o Ponto, que é o parente mais próximo nos três da casa. Não se muda |
| 2 | **Botão em ícone na barra da cena**, com a dica "Partículas" | o Humberto não achou no Novo ▾. Unity e Cocos põem a partícula numa **categoria própria, "Effects"**, e não no meio da lista. Nossa lista não tem categoria: o botão faz o papel dela, à vista |
| 3 | O botão abre um menu curto: **Emissor vazio · Fogo · Fumaça · Faísca · Poeira** | é o **Template** do GDX: um clique e algo se mexe. Os quatro nomes são os da ficha |
| 4 | O modelo pronto **traz a própria imagem**: um ponto branco de borda suave, pintado pelo programa | sem imagem o emissor não desenha nada (§9.8). O Godot mostra o ponto branco **e um aviso**; nós mostramos o efeito. Escolher uma imagem do herói no lugar da pessoa seria palpite (regra 21) |
| 5 | Nasce **escolhido**, com Propriedades aberta nele | é o que Unity e Godot fazem: o que se cria já está no Inspector |

---

## Lote 2 — como a ficha se dobra

| Programa | Como se dobra | Fonte |
|:---|:---|:---|
| **Unity** | a ficha é dividida em **módulos dobráveis**. *"Click the bar that shows their name"* abre e fecha. Uma **caixa à esquerda** liga ou desliga o módulo. O **Main** está sempre lá; **Emission** e **Shape** nascem ligados | **página**: [módulos](https://docs.unity3d.com/Manual/activate-access-particle-system-modules.html); **busca**: [Shape](https://docs.unity3d.com/2021.3/Documentation/Manual/PartSysShapeModule.html), [Emission](https://docs.unity3d.com/2021.3/Documentation/Manual/PartSysEmissionModule.html) |
| **Godot** | o Inspector agrupa em seções: **Time**, **Drawing**, e o material à parte | **página**: [2D particle systems](https://docs.godotengine.org/en/4.5/tutorials/2d/particle_systems_2d.html) |
| **Cocos Creator** | o arquivo de partícula; a caixa **Custom** libera os campos | **busca**: [ParticleSystem2D](https://docs.cocos.com/creator/manual/en/particle-system/2d-particle/2d-particle.html) |
| **libGDX** | cada campo tem um **"Active"** que desliga; número vira faixa pelo botão `>` | **página**: [2D Particle Editor](https://libgdx.com/wiki/tools/2d-particle-editor) |

**O modelo que seguimos:** o do **Unity**. Grupo com barra de título que abre e
fecha. Abertos ao nascer: **o essencial** (o equivalente a Main, Emission e
Shape). O resto fechado. Detalhe no fim do lote 2.

---

## Lote 3 — rajada e linha

Escrito em 29/09, adiantado enquanto a casa media.

### A rajada (`bursts`)

| Programa | Como é | Fonte |
|:---|:---|:---|
| **Unity** | no módulo **Emission**, uma **lista de rajadas**: cada linha tem *Time, Count, Cycles, Interval, Probability* | **página**: [Emission module](https://docs.unity3d.com/2021.3/Documentation/Manual/PartSysEmissionModule.html). Os botões de pôr e tirar linha: **não achei** na página |
| **Godot** | **não tem lista.** Um ciclo só (`one_shot`) e a pressa da saída (`explosiveness`) | **página**: [GPUParticles2D](https://docs.godotengine.org/en/stable/classes/class_gpuparticles2d.html) |
| Spriter, Spine, DragonBones | não têm partícula | acima |

**Seguimos o Unity, e não é escolha:** os cinco campos de uma rajada na nossa
§9.1 são **os mesmos cinco do Unity**, com os mesmos nomes (`time`, `count`,
`cycles`, `interval`, `probability`). A tela é uma lista: uma linha por rajada,
os cinco números lado a lado, um botão de pôr e um de tirar.

### A linha (`shape: edge`)

| Programa | Como é | Fonte |
|:---|:---|:---|
| **Unity** | forma **Edge**: *"Emit particles from a line segment"*. O comprimento é o **Radius**; posição, giro e escala à parte | **página**: [Shape module](https://docs.unity3d.com/2021.3/Documentation/Manual/PartSysShapeModule.html) |
| **Godot** | **não tem linha.** As formas são ponto, esfera, caixa, pontos, anel | **página**: [ParticleProcessMaterial](https://docs.godotengine.org/en/stable/classes/class_particleprocessmaterial.html) |

**Aqui não seguimos o Unity, e o motivo é o formato:** a nossa linha é
`edge: [x0, y0, x1, y1]` — as **duas pontas**, em px no osso. O Unity guarda
comprimento e posição. A tela mostra o que o arquivo guarda: **ponta A (x, y)** e
**ponta B (x, y)**, dois pares, como o X/Y da ficha rápida.
