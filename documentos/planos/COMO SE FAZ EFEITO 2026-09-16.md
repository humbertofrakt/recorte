# Como se faz efeito — pesquisa 2 — 16/09/2026

Encargo: `COMO SE FAZ EFEITO - encargo 2026-09-15.md`. Escrito pelo PESQUISA 2.
Datado 16/09 porque é a data da máquina (regra 20).

Documento, não versão. Nenhuma linha de `editor/src` foi escrita.

---

## Em cinco linhas

| # | O que achamos |
|:---:|:---|
| 1 | Efeito 2D de jogo se faz de **três jeitos**: quadro a quadro (Aseprite), simulação assada em folha de sprites (EmberGen), ou emissor de partículas no motor (Godot, Unity, Effekseer) |
| 2 | Os dois primeiros **já são função pura do tempo** quando chegam ao jogo. O terceiro só é quando tem **semente fixa** |
| 3 | O artista de efeito não usa esqueleto porque esqueleto tem **número fixo de imagens**: não nasce nem morre nada, não há acaso com semente, não há textura que corre nem dissolve |
| 4 | **O buraco:** efeito e personagem na **mesma linha do tempo, que anda para trás**. O Godot não tem isso (proposta aberta). O Unity tem, com defeito de semente |
| 5 | Metade do que dá para fazer **já está no formato**. Falta a porta na tela, não a função |

---

## 1. O gesto, programa por programa

### Effekseer — editor gratuito de efeito

| Passo | O que o artista faz |
|:---:|:---|
| 1 | Botão direito na árvore → novo nó. Cada nó é um emissor |
| 2 | Escolhe a textura |
| 3 | Aperta tocar. **Três passos e já há algo na tela** |
| 4 | Ajusta quantos nascem, a cada quanto tempo, quanto vivem |
| 5 | Troca um número fixo por **acaso entre dois valores**, por **easing** ou por **curva** desenhada |
| 6 | Põe um nó **filho** dentro do pai: cada partícula do pai carrega o filho. É assim que se faz rastro atrás de projétil |

Fonte: [Quick Tutorial](https://effekseer.github.io/QuickTutorial_Tool/QuickTutorial_en.html) ·
[Easing](https://effekseer.github.io/Help_Tool/en/ToolReference/easing.html) ·
[F-Curve](https://effekseer.github.io/Help_Tool/en/ToolReference/fcurve.html) ·
[Render avançado (distorção, UV)](https://effekseer.github.io/Help_Tool/en/ToolReference/rendererCommonAd.html)

**O que ele ajusta primeiro:** quantos, quanto vivem, a textura. Forma e cor vêm depois.
**Anda para trás?** Só com semente fixa. O plugin Unity tem o campo *Random Seed*
([código](https://github.com/effekseer/EffekseerForUnity/blob/master/Dev/Plugin/Assets/Effekseer/Editor/EffekseerTool.cs)).

### EmberGen, TimelineFX, Pixel FX Designer — simular e assar

| Passo | O que o artista faz |
|:---:|:---|
| 1 | Abre uma simulação (fogo, fumaça, explosão) que roda ao vivo |
| 2 | Mexe em forças e emissores, olhando |
| 3 | Gostou: **assa** numa folha de sprites, com um clique |
| 4 | Importa a folha no jogo como animação comum |

Fonte: [EmberGen](https://jangafx.com/software/embergen) ·
[TimelineFX](https://www.rigzsoft.co.uk/timelinefx-particle-effects-editor/) ·
[Pixel FX Designer](https://store.steampowered.com/app/939360/Pixel_FX_Designer/)

**A lição:** a simulação é acumulada, mas **fica presa na ferramenta**. O que chega ao
jogo é uma folha — número do quadro = tempo. Função pura.

### Aseprite — quadro a quadro

| Passo | O que o artista faz |
|:---:|:---|
| 1 | Desenha **primeiro o quadro do impacto**, o que mais se lê |
| 2 | Liga a **casca de cebola** (vê os vizinhos transparentes) |
| 3 | Desenha antecipação → impacto → dissipação |
| 4 | Usa **smear**: um quadro borrado ao longo do arco vende velocidade |
| 5 | Efeito em camada separada, com modo de mistura |
| 6 | Exporta folha de sprites |

Fonte: a estrutura em três atos vem do livro *Elemental Magic*, de Joseph Gilland
([Vol. I](https://www.routledge.com/Elemental-Magic-Volume-I-The-Art-of-Special-Effects-Animation/Gilland/p/book/9780240811635)) ·
[smear no Aseprite](https://www.youtube.com/shorts/ITckKZhrOh8) ·
guia de comunidade [OPINIÃO] ([Steam](https://steamcommunity.com/sharedfiles/filedetails/?id=3635001662))

### Spine — o vizinho mais próximo

| Peça | Como o artista usa para efeito |
|:---|:---|
| Mistura no slot | Aditiva para luz. Mapeada 1:1 para o Photoshop ([slots](http://en.esotericsoftware.com/spine-slots)) |
| Sequência (4.1+) | Marca a caixa, põe o FPS: a imagem vira folha animada |
| Sequência em malha | Converte o flipbook em malha e **cola na superfície curva** do corpo ([Armanimation](https://www.armanimation.com/post/13-vfx-animation-techniques-in-spine-for-2d-animators); só 1 das 13 técnicas está aberta) |
| Caminho | Rastro de espada, chicote, cauda ([path](https://en.esotericsoftware.com/spine-path-constraints)) |
| Ponto | Diz **onde** a partícula do motor nasce. O motor faz o resto ([points](https://en.esotericsoftware.com/spine-points), [PointFollower](https://en.esotericsoftware.com/spine-unity-utility-components)) |

**Spine não tem partícula.** Há pedidos antigos no fórum [OPINIÃO]
([16807](https://en.esotericsoftware.com/forum/d/16807-request-particle-system-in-spine-pretty-please),
[13775](https://en.esotericsoftware.com/forum/d/13775-can-we-have-some-thing-work-like-particle-system-in-spine)),
e nasceu um produto de terceiros só para isso: [SpineFX](https://spinefx.io/).

### Rive

| Peça | |
|:---|:---|
| Sem partícula nativa | relato de dev [OPINIÃO] ([issue](https://github.com/chichex/waica/issues/73)) |
| **Feather** (2025) | brilho e sombra vetorial, sem blur caro ([changelog](https://rive.app/changelog/vector-feathering)) |
| **Scripting** (2025) | partícula vira **código** dentro do editor: emissor, rastro, confete ([blog](https://rive.app/blog/scripting-is-live-in-rive)) |

O gesto do Rive para partícula é programar. Não é gesto de animador.

### Live2D

Brilho de olho: forma simples com mistura *Add (Glow)*
([manual](https://docs.live2d.com/en/cubism-editor-manual/blend-mode/)).
Partícula real: a comunidade diz para **desenhar o efeito no modelo** em vez de
misturar com partícula do Unity, que briga com a profundidade [OPINIÃO]
([fórum](https://community.live2d.com/discussion/194/how-to-mix-live2d-animations-and-unity-particle-effects)).

### Cavalry — partícula que anda para trás

| Peça | |
|:---|:---|
| Duplicator | muitas cópias de uma forma ([docs](https://docs.cavalry.scenegroup.co/nodes/shapes/duplicator/)) |
| Stagger, Noise | atraso e tremor entre as cópias, sem código ([stagger](https://docs.cavalry.scenegroup.co/nodes/behaviours/stagger/)) |
| Particle Emitter | tem **Seed**, e pode ter uma semente por propriedade ([docs](https://beta-docs.cavalry.scenegroup.co/nodes/utilities/particle-emitter/)) |

É o modelo mais perto da nossa régua: acaso com semente, e a linha do tempo se arrasta.

### After Effects e Animate

| Programa | Como resolve o acaso |
|:---|:---|
| After Effects | `seedRandom(n, true)` antes de `wiggle()`: o tremor fica igual em toda renderização ([docs](https://ae-expressions.docsforadobe.dev/general/random-numbers/)) |
| Animate | filtros (glow, blur) interpolados entre chaves. Puro, sem acaso ([filtros](https://helpx.adobe.com/animate/using/graphic-filters.html)) |

### Três achados mandados pela Pesquisa 1 — conferidos na fonte em 16/09

| Programa | O que tem | O que diz para nós |
|:---|:---|:---|
| **Moho 14.4** | partícula = uma camada **copiada ao longo de curvas**; intervalo de 1, 2, 3 quadros ou qualquer; cada partícula pode **atrasar N quadros** para ondular ([blog](https://moho.lostmarble.com/blogs/news/free-update-export-to-video-game-engines-with-the-moho-14-4-side-quest)) | o gesto é de **animador**, não de programador: anima uma vez, copia com atraso. Intervalo de 2 quadros = o `stepped` que já temos. **Não conferi** se anda para trás igual |
| **Rive** | *trim paths*: anima só um pedaço do traço ([features](https://rive.app/features)) | é o arco de golpe e o rastro que se desenha. No nosso formato não há traço vetorial: aqui seria malha + deform ou máscara (seção 2) |
| **Live2D 5.3** | desenho *offscreen* por grupo: opacidade e máscara no **grupo inteiro**; **15** misturas de cor + **5** de alpha ([manual](https://docs.live2d.com/en/cubism-editor-manual/new-function5-3/)) | apagar o efeito inteiro sem as peças aparecerem umas através das outras. Nós temos 4 misturas e opacidade só por slot. **Toca o formato: decisão do Humberto** (regra 7) |

### Motores: Godot, Unity, Phaser, Pixi

| Motor | Semente | Ir a um tempo exato (seek) |
|:---|:---|:---|
| Godot 4 | `seed` / `use_fixed_seed` (4.4), documentação confusa ([#102291](https://github.com/godotengine/godot/issues/102291)) | **Não tem.** Proposta aberta ([#4449](https://github.com/godotengine/godot-proposals/issues/4449)) |
| Unity | `randomSeed` ([docs](https://docs.unity3d.com/ScriptReference/ParticleSystem-randomSeed.html)) | `Simulate(t, …, restart)` ([docs](https://docs.unity3d.com/ScriptReference/ParticleSystem.Simulate.html)). O Control Track da Timeline **força a mesma semente** em todos os filhos ([bug](https://issuetracker.unity3d.com/issues/timelines-control-track-overrides-the-auto-random-seed-with-the-same-value-for-all-nested-particle-systems)) |
| Phaser 3 | via gerador semeado do jogo ([docs](https://photonstorm.github.io/phaser3-docs/Phaser.Math.RandomDataGenerator.html)) | não achei |
| Pixi | não achei semente documentada ([emitter](https://github.com/pixijs-userland/particle-emitter)) | não achei |

O que o artista ajusta primeiro em todos: **quantos, quanto vivem, velocidade**, e depois
as curvas "ao longo da vida" (escala, cor, alpha).

---

## 2. Truques de efeito 2D sem partícula

| Truque | Como é | Puro no tempo? | Temos? |
|:---|:---|:---:|:---|
| Escala + alpha + aditivo | sobe o tamanho, some o alpha, mistura aditiva. Flash, aura, anel de impacto | sim | **função sim** (cor animável, mistura) |
| Hit flash | 2–3 quadros tudo branco | sim | **função sim** (cor escura / tint black a branco) |
| Folha animada | fogo, faísca, fumaça desenhados | sim | **função sim** (`sequence`, 7.10) |
| Arco de golpe (slash) | meia-lua que se revela no arco | sim | **função sim** (malha + deform, ou máscara animada) |
| Rastro por caminho | ossos correndo numa curva | sim | **função sim** (`path`, 6.4) |
| Tremor com semente | ruído(semente, t) | sim | **não** — só à mão, chave por chave |
| Textura que corre (UV scroll) | água, energia fluindo | sim | **não** — UV não é animável |
| Dissolve por ruído | alpha corta onde o ruído < limiar | sim | **não** — precisa de shader |
| Distorção | calor, onda de choque | sim | **não** — precisa de shader |
| Tremor de câmera | câmera treme com o golpe | — | **do jogo** (evento avisa, o jogo treme) |

Fontes: [dissolve](https://www.gamedeveloper.com/programming/the-great-disappearing-act-creating-dissolve-vfx-with-unity-surface-shaders) ·
[efeitos estilizados, aditivo](https://torchinsky.me/stylized-vfx-unity-01/) [OPINIÃO: blog] ·
[UV scroll](https://gamedo.live/news/2d-shader-tricks-indie-games/) [OPINIÃO: blog] ·
[tremor por trauma, GDC 2016](http://www.mathforgameprogrammers.com/gdc2016/GDC2016_Eiserloh_Squirrel_JuicingYourCameras.pdf)

---

## 3. A pergunta que vale mais: por que o artista de efeito não usa esqueleto?

| Motivo | De onde vem |
|:---|:---|
| **Número fixo de imagens.** Esqueleto é "isto sempre existe e se mexe". Efeito é "N cópias nascendo e morrendo" | estrutura do Spine: o ponto só diz onde ([points](https://en.esotericsoftware.com/spine-points)) |
| **Sem acaso.** Cem faíscas iguais não parecem faísca | todos os editores de efeito têm acaso por partícula |
| **Sem shader.** Dissolve, UV que corre, distorção não existem em esqueleto | Effekseer tem UV e distorção nativos |
| **O gesto é outro.** Efeito se afina com **parâmetro e olho**, não com chave | Effekseer, EmberGen, Cavalry: mexe o número, vê ao vivo |
| **Dois mundos.** Quem faz efeito no Spine pergunta se dá para usar em produção, porque "é diferente do fluxo com partícula" [OPINIÃO] | [realtimevfx 16310](https://realtimevfx.com/t/using-vfx-created-in-spine-2d-for-production/16310) |

**Honesto:** não achamos depoimento direto de estúdio grande (Hades, Dead Cells, Supercell)
sobre isso. Os fóruns carregam por JavaScript e a leitura trouxe só a casca. A resposta
acima é **estrutural**, não de entrevista.

### O buraco que podemos ocupar

| Hoje no mundo | O que falta |
|:---|:---|
| Personagem no Spine, efeito no motor, juntos só **no jogo** | ver o golpe e a faísca **juntos, no editor**, no mesmo quadro |
| Godot não volta partícula no tempo | arrastar a linha do tempo **para trás** e ver o mesmo quadro |
| Unity volta, mas a semente se embaralha na Timeline | semente **escrita no arquivo**, igual em todo leitor |
| SpineFX existe como remendo pago | isso nativo e aberto |

Em uma frase: **o efeito que o animador afina na mesma linha do tempo do boneco, e que
qualquer runtime toca igual, para frente e para trás.** Ninguém entrega isso aberto.

---

## 4. A régua: o que é função pura do tempo

### Partícula sem estado existe, e tem nome

*Stateless particles*: a partícula `i` nasce em `i / taxa`. Posição =
`p0 + v·idade + ½·g·idade²`. O acaso vem de `hash(semente, i)`, recalculado,
nunca guardado.
Fontes: [Million-Particle System](https://www.gamedeveloper.com/programming/building-a-million-particle-system) ·
[Stateless particles](https://www.proceduralpixels.com/blog/stateless-particles---rendering-without-a-mesh) ·
[hash em GPU](https://www.reedbeta.com/blog/hash-functions-for-gpu-rendering/)

| Cabe na régua | Não cabe — **limite**, com o nome certo |
|:---|:---|
| trajetória com gravidade constante | **colisão** com o cenário (precisa do quadro anterior) |
| cor, escala, alpha ao longo da vida | **partícula empurrando partícula** |
| acaso por partícula com semente | **turbulência integrada** (campo que muda e se acumula) |
| giro com velocidade constante | **fluido** (fumaça densa, água) |
| ruído que depende só de (semente, i, idade) — balanço, tremor | vento que muda o que já nasceu |
| laço: a animação reinicia e nascem as mesmas | — |

### A semente: uma por emissor, e o que acontece ao duplicar

Pedido da Pesquisa 4. A lição vem do defeito do Unity: o Control Track **força a
mesma semente** em todos os sistemas filhos, e eles passam a nascer iguais
([bug](https://issuetracker.unity3d.com/issues/timelines-control-track-overrides-the-auto-random-seed-with-the-same-value-for-all-nested-particle-systems)).

| Caso | Regra proposta |
|:---|:---|
| Cada emissor | **a sua semente**, escrita no arquivo. Nunca herdada do boneco, do motor nem do relógio |
| Duplicar um emissor | a cópia ganha **semente nova**. Senão as duas faíscas caem no mesmo lugar — o defeito do Unity |
| Copiar de propósito igual | gesto próprio, **"manter a semente"** (ex.: o mesmo efeito espelhado nas duas mãos) |
| Emissor filho, uma cópia por partícula do pai | semente do filho = `hash(semente do filho, i do pai)`. Cada cópia difere, e continua pura |
| Mesmo efeito tocado duas vezes no jogo | **o jogo decide** se repete ou varia (passa outra semente). O arquivo guarda só a de fábrica |

**Proposta, não fato de fonte.** Só o defeito do Unity vem de fora. As regras
acima são nossas, e passam pelo Humberto junto com o emissor (seção 5).

O que não cabe tem **uma saída honesta**: assar em folha de sprites (como o EmberGen)
e entrar como `sequence`. Função pura no arquivo, simulação só na ferramenta.

### Um aviso sobre o que já está no formato

A `physics` (6.5) **guarda estado** entre quadros — a própria spec diz que o estado
"atravessa" a função `Pose`. Não é função pura do tempo. A spec já prevê
convertê-la em chaves (*bake*). Fica escrito aqui para ninguém usar a física de
hoje como modelo para partícula.

---

## 5. Falta a função, ou falta o botão?

Conferido lendo `formato/ESPECIFICACAO 2026-09-06.md` e `editor/src` (só leitura).
Onde escrevi "não achei", é busca por palavra, não prova — **confirmar antes de planejar**.

### Falta só a porta

| Peça | No formato | No editor hoje | A porta que faltaria para efeito |
|:---|:---|:---|:---|
| Mistura (4 modos) | 7.12 | escolha "Mistura" em Propriedades | nada; talvez um ícone de "aditiva" rápido |
| Cor e cor escura animáveis | 7.12, 9.5 | chave de cor e "Cor escura" | **Flash**: um gesto que grava branco por 2 quadros e volta |
| Sequência (folha animada) | 7.10, 9.6 | a linha de tempo existe (`keying.ts`); **não achei botão para criar** | arrastar a pasta `fogo_01…fogo_12` (ou a folha do Aseprite) e virar **uma** imagem animada |
| Esqueleto aninhado | 7.11 | **não achei** no editor | um efeito salvo como `.bone` próprio, **encaixado** no slot da mão do herói |
| Caminho | 6.4, 7.8 | regra `path` em Regras | receita de rastro |
| Ponto | 7.9 | ferramenta Ponto | já diz ao jogo onde nasce a partícula dele |
| Eventos | 8.6 | editor de chave de evento | o jogo treme a câmera no evento |
| Malha + deform | 7.4, 9.6 | sim | receita de arco de golpe |
| Máscara | 7.7 | tipo existe | receita de revelar o arco |

### Falta a função — e é campo novo no núcleo, **decisão do Humberto** (regra 7)

| Ideia | Por que | Caminho possível |
|:---|:---|:---|
| Emissor sem estado, com semente | é o que falta para faísca, poeira, confete | extensão prefixada (2.7), com pseudocódigo, antes de núcleo |
| UV que corre | água, energia | campo animável de deslocamento de UV |
| Dissolve por ruído | sumir queimando | depende de shader: nem todo runtime terá. Cairia para "alpha" e **avisaria** (regra 21) |
| Distorção | calor, onda de choque | idem, e mais caro |
| Tremor com semente | balanço sem chave à mão | pode nascer **só no editor**: gera chaves comuns. Nenhum campo novo |

---

## 6. O que cabe aqui, em ordem de custo

| # | Ideia | Custo | Por quê |
|:---:|:---|:---|:---|
| 1 | **Folha animada entra arrastando** (pasta numerada ou folha do Aseprite → `sequence`) | só porta | é o caminho real do artista 2D hoje, e o formato já tem |
| 2 | **Flash** e **pulso** (escala+alpha+aditivo) como gesto que grava chaves | só porta | três dos truques mais usados, com o que já existe |
| 3 | **Efeito como arquivo próprio, encaixado no boneco** (7.11) | só porta | o artista de efeito trabalha separado; o animador encaixa e vê junto |
| 4 | **Tremor com semente** que vira chaves | só editor | nada de campo novo; anda para trás porque são chaves |
| 5 | **Emissor sem estado** (extensão) | função nova | é o buraco. Mas é campo novo: Humberto decide |
| 6 | UV que corre, dissolve, distorção | função nova + shader | depende de runtime; exige aviso honesto onde não houver |

Não entra: colisão, fluido, partícula que empurra partícula. Para isso, **assar em
folha** (item 1).

---

## Mandado para as outras pesquisas (não escrito aqui)

| Para | O quê |
|:---|:---|
| Pesquisa 1 | a lista de **campos** de emissor (Effekseer, Godot, Unity, Cavalry) e o SpineFX |
| Pesquisa 3 | os pedidos de partícula no fórum do Spine (16807, 13775) |
| Pesquisa 4 | Godot sem seek de partícula (#4449) e a semente embaralhada no Control Track do Unity |
