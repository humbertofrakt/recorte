# As partículas — pesquisa e conferência — 06/10/2026

> **CORREÇÃO, 08h07 (o mesmo chat, já na parte 2).** Onde este documento diz que o efeito nasce **"atrás da perna"**, **está errado**. A prova (`10_prova_frente_ou_atras`: tamanho 3, partículas opacas sobre a perna) mostra o emissor **desenhando na frente** do corpo: o slot novo entra no **fim** da lista de slots, que é a frente (`tree-commands.ts`, `AddSlotWithAttachment.apply`), e o `idle` não tem ordem própria. O que eu vi era **pequeno e fraco**, não escondido. **A forma do erro:** *concluí a ordem de desenho pelo olho, numa foto onde a partícula era menor que a perna, sem uma prova que separasse "atrás" de "fraco".* O que fica de pé: o emissor **não aparece na aba Ordem** (§2.4), e os exemplos são **pequenos demais** para se ver de primeira. O lote 1.1 ("entrar no topo") já é assim e sai do plano.

Rodada 38, parte 1. Chat: `PESQUISANDO · rodada 38 — o polimento das partículas [6d38c3]`.
**Nenhum código foi mexido.** Ficha: `rodadas/RODADA 38 - polimento das particulas 2026-10-06.md`.

| | |
|:---|:---|
| Versão montada | **v29.9** (`programa/`, porta 5438) |
| Como | Chrome sem janela, **1920×1080**, mouse e teclado por protocolo. Roteiro de rascunho **fora** da pasta (regra 29) |
| Material | o herói de exemplo, animação `idle`, emissor criado pelo botão **Partículas** |
| Hora | 07h42 a 07h59 do relógio da máquina |
| Fotos | `backup/fotos-obra/rodada-38/` (61) |
| Pesquisa na web | dois ajudantes, com link em cada fato. Arquivos inteiros: ver §1.6 |

## O quadro

| # | Pergunta | Resposta curta |
|:---:|:---|:---|
| 1 | Os exemplos têm porta? | **Têm, duas**: o botão **Partículas** da barra e o menu **Partículas** de cima. Um clique cria |
| 2 | Então por que *"não sei como usar"*? | Porque **quase não se vê**: o efeito nasce no pé de trás, **atrás da perna**, pequeno, e a fumaça é cinza sobre o fundo cinza |
| 3 | As formas fazem o quê? | Círculo, anel, arco, retângulo e linha **fazem o que dizem** (foto 04). Ponto, osso e caminho **não se veem**. **A direção não segue a forma**: tudo sai para cima |
| 4 | A caixa do `0,5`? | Com o Fogo, duas: **Vida (s) 0,5 · 0,9** (a faixa, sem "de… a…") e **Arrasto (1/s) 0,5** (unidade que ninguém lê). O Humberto confirmou a Vida em 06/10, 07h5x |
| 4b | Obedece à ordem de desenho? | **Pela metade**: desenha no lugar do slot, mas **não aparece na aba Ordem**, e não há como mudá-lo de lugar (§2.4). Vira o lote 1.0 |
| 5 | Dá para fazer uma fumaça do zero? | **Dá, em 9 passos**, mas no fim ela **não aparece**: fica atrás do corpo (foto 07) |

---

## 1. Como os outros fazem

### 1.1 Quem tem partícula

| Programa | Tem? | O que faz no lugar | Fonte |
|:---|:---:|:---|:---|
| **Spine** | **não** | ponto, evento e caixa marcam onde e quando; o **jogo** solta a partícula. Nate (dono): *"can't be exported to runtimes"* | [fórum 16807](https://esotericsoftware.com/forum/d/16807-request-particle-system-in-spine-pretty-please) · Spine User Guide (pasta), cap. 13 e 16 |
| **Spriter** | **não** | *action points*: ponto com nome e ângulo, "de onde sai a bala" | [Spriter Pro](https://brashmonkey.com/spriter-pro/) · [manual](http://www.brashmonkey.com/spriter_manual/adding%20spawning%20points%20to%20frames.htm) |
| **DragonBones** | **não** | chave com ação (`event`, `sound`) | manual da pasta; [formato 5.5](https://unpkg.com/dragonbones-tools@0.1.2/doc/dragonbones_json_format_5.5.md) |
| **Godot** | sim | `CPUParticles2D` / `GPUParticles2D` | [doc CPUParticles2D](https://docs.godotengine.org/en/stable/classes/class_cpuparticles2d.html) |
| **Unity** | sim | Particle System, módulo Shape | [doc Shape](https://docs.unity3d.com/6000.2/Documentation/Manual/PartSysShapeModule.html) |
| **Construct 3** | sim | objeto Particles | [manual](https://www.construct.net/en/make-games/manuals/construct-3/plugin-reference/particles) (o site pede robô; lido pelo buscador) |

### 1.2 As formas de emissor, lado a lado

| Forma | **Godot** | **Unity** | **Construct 3** | **Nós** |
|:---|:---|:---|:---|:---|
| Ponto | Point: nada | — (raio 0) | X e Y randomiser = 0 | Ponto: nada |
| Disco cheio | Sphere: raio. **Junta no centro** | Circle: raio, **Radius Thickness 1** | — | Círculo: raio. Uniforme |
| Só a borda | Ring com raio de dentro quase igual (demo: 60 e 50) | Circle, **Radius Thickness 0** | — | Anel: raio e Espessura (0–1) |
| Pedaço do círculo | — | Circle, **Arc** + **Mode** (Random, Loop, Ping-Pong) | — | Arco: raio, espessura, **Trecho (°)**. Começa sempre no +X do osso |
| Caixa | Box/Rectangle: meia largura e altura, **só cheio** | Box: escala; **Emit from: Volume, Edge, Shell** | X e Y randomiser > 0 | Retângulo: largura e altura, só cheio |
| Linha | **não tem**: Box fino (demo: 40 × 1) | Edge: o **Radius** é o comprimento | um randomiser só | Linha: início e fim |
| Da imagem | Points / Directed Points (**máscara**: pixels cheios ou só o contorno) | Sprite: vértice, aresta, triângulo | — | Malha (do slot) |
| Ao longo do osso / curva | — | — | — | Osso · Caminho |
| A forma desenhada na cena | sim (retângulo, círculo, dois círculos no anel) | sim | não | **sim, com alças nomeadas** |
| Campo da forma errada some | sim | sim | — | **sim** |
| **Sair para fora da forma** | direção é do material, à parte | *"Circle: move only in the plane"*, para fora; **Spherize Direction 0–1** | **não**: é o ângulo do objeto | **Sair do centro (0–1)**, mas mora na aba **Movimento**, não na Forma |

Fontes da tabela: Godot [código cpu_particles_2d.cpp](https://github.com/godotengine/godot/blob/master/scene/2d/cpu_particles_2d.cpp) e [demo 2D Particles](https://github.com/godotengine/godot-demo-projects/tree/master/2d/particles); Unity [doc Shape](https://docs.unity3d.com/6000.2/Documentation/Manual/PartSysShapeModule.html); Construct [manual](https://www.construct.net/en/make-games/manuals/construct-3/plugin-reference/particles) (buscador).

### 1.3 Fogo, fumaça, faísca — os números deles

Godot, do **demo oficial** ([particles.tscn](https://github.com/godotengine/godot-demo-projects/blob/master/2d/particles/particles.tscn)), em px e s:

| | **Fogo** | **Fumaça** | **Faísca que cai** | **Explosão** |
|:---|:---|:---|:---|:---|
| Quantas | 32 | 32 | 100 | 16, explosividade 1 |
| Vida | 1 s | 2 s | 2 s | 2 s |
| Forma | disco, raio 8 | disco, raio **30** | caixa 1 × 1 | borda, raio 60 |
| Velocidade | 0 | 0 | **400** px/s, abertura 5° | 0 (aceleração radial) |
| Gravidade | **−250 (sobe)** | 0 | **+400 (cai)** | 0 |
| Tamanho na vida | 0 → 1 (aos 11 %) → 0 | 0 → 1 (aos 50 %) → 0,86 | 0 → 1 (14 %) → 0 | cresce até 2 |
| Cor / alfa | azul → laranja → **transparente** | branco, alfa **0 → 0,5 → 0** | verde | laranja → marrom |
| Giro ao nascer | — | 0 a 360° | — | — |
| Mistura | **aditiva** | normal | normal | aditiva |

Construct 3 (tutoriais da Scirra, pelo buscador): **fogo** [1266](https://www.construct.net/en/tutorials/particle-effect-series-pixel-1266) — 20/s, cone 20°, para cima, aditiva · **fumaça** [1260](https://www.construct.net/en/tutorials/particle-effect-series-1260) — 4/s, cone 120°, 50 px/s, tamanho **200 px**, opacidade 25, vida 6 s · **faísca**: número da Scirra **não achei**.

Unity: a única receita oficial é a **explosão** ([doc](https://docs.unity3d.com/2017.2/Documentation/Manual/PartSysExplosion.html)): taxa 0 + **uma rajada de ~50**, vida 2 s, tamanho 0,5 a 1,5, cor branco → preto. Fumaça oficial com número: não achei.

**O que os três repetem:** fogo **sobe e encolhe**, vida curta, aditivo · fumaça **grande, devagar, cresce**, alfa sobe e some, vida longa · faísca **rápida, cai**, vida curtíssima, de uma vez.

### 1.4 Unidade e faixa na tela

| Programa | Como mostra | Fonte |
|:---|:---|:---|
| **Godot** | sufixo **no campo**: `s`, `px`, `px/s`, `px/s²`, `°`, `FPS`. Faixa na barra (`0 a 1`, `0 a 180`). **Mín e máx numa linha só** | [código](https://github.com/godotengine/godot/blob/master/scene/2d/cpu_particles_2d.cpp) |
| **Unity** | **nenhuma unidade** no campo. Uma seta muda o modo: **Constant · Curve · Random Between Two Constants** | [doc](https://docs.unity3d.com/6000.0/Documentation/Manual/varying-particle-system-properties-over-time.html) |
| **Construct** | unidade **no texto** do campo (*"in pixels per second"*), com exemplo (*"100 muda até 50"*). Mas opacidade 0–100 no painel e 0–1 no script | manual (buscador) |

O mais claro dos três: **o sufixo do Godot** e **o nome do modo do Unity** ("aleatório entre dois").

### 1.5 Modelos prontos

**Nenhum dos três tem "Fogo · Fumaça · Faísca" num menu de criar.** Godot manda copiar o demo; Unity, arrastar um prefab do Particle Pack; Construct, abrir um tutorial. **O nosso menu já é mais do que eles têm** — o defeito não é a porta, é o que se vê depois dela.

### 1.6 Os arquivos da pesquisa

Os dois relatórios inteiros, com todos os links e os 29 itens de "o que confunde", ficaram no rascunho do chat e **foram resumidos aqui**. Se o Diretor quiser, copio-os para `documentos/pesquisa/nova pesquisa/` com data.

---

## 2. O que o nosso faz hoje

### 2.1 A ficha, aba por aba (Fogo criado)

Foto: `02_aba_00_Nascer` a `02_aba_09_Mais`. **Unidade**: ✓ no rótulo · ~ só na dica · ✗ em lugar nenhum. **Faixa**: idem.

| Aba | Campo | Valor | Unidade | Faixa | O que falta |
|:---|:---|:---:|:---:|:---:|:---|
| Nascer | Taxa por segundo | 40 | ✓ | ✗ | — |
| Nascer | **Vida (s)** | **0,5 · 0,9** | ✓ | ✗ | **duas caixas sem "de … a …"**; "mínimo/máximo" só na dica |
| Nascer | Máximo de vivas | 200 | — | ✗ | — |
| Tempo | Atraso (s) | 0 | ✓ | — | — |
| Tempo | Explosão · janela | 0 · 1 | ~ | ✗ | duas caixas; 0 a 1 e "s" escondidos |
| Tempo | Tremor ao nascer | 0 | ✗ | ✗ | é 0 a 1 (spec) e não diz |
| Lugar | X · Y | 15 · 1,14 | ✗ | — | px não diz |
| Lugar | Giro (°) | 15 | ✓ | — | — |
| Forma | Raio | 8 | **✗** | — | px não diz |
| Forma | Espessura (0–1) | 0,2 | — | ✓ | **fração do raio**, num painel de pixels |
| Forma | Trecho (°) | 90 | ✓ | ✗ | de onde começa não diz |
| Forma | Retângulo (px) | 60 · 40 | ✓ | — | "largura · altura" só na dica |
| Forma | Início / Fim X · Y | −30 · 0 | ✗ | — | px |
| Movimento | Velocidade (px/s) | 50 · 90 | ✓ | ✗ | faixa sem "de … a …" |
| Movimento | Direção (°) | 90 | ✓ | ✗ | **que 90 é para cima** não diz |
| Movimento | Abertura (±°) | 12 | ✓ | ✗ | 0 a 180 |
| Movimento | Sair do centro | 0 | ✗ | ✗ | 0 a 1, e é **o que faz a forma soprar para fora** |
| Forças | Gravidade (px/s²) | 0 · 40 | ✓ | — | **que Y + sobe** não diz (fogo 40 sobe, faísca −400 cai) |
| Forças | **Arrasto (1/s)** | **0,5** | ✓ mas ilegível | ✗ | "1/s" não diz nada; 0,5 = perde 39 % da velocidade por segundo |
| Tamanho e giro | Tamanho (fator) | 0,8 · 1,3 | ~ | ✗ | fator **de quê**: a imagem tem 32 px |
| Tamanho e giro | Giro inicial (°) · Giro/s (°) | 0 · 0 | ✓ | ✗ | faixas |
| Cor | Cor ao nascer · Cor do emissor | #ffffff · **100** | — | ✗ | o "100" é o alfa em %, sem nome |
| Imagem | Folha de quadros | 0 · 1 · 0 | ~ | — | três números com "qtd. · 1º · díg." (melhorou desde a rodada 31) |
| Mais | Semente | 0 | — | ✗ | o que é, não diz |

**Conta:** 24 campos numéricos. **9** com unidade e faixa resolvidas · **15** com falta. Oito das quinze são **faixas** (duas caixas).

### 2.2 As formas, uma por uma

Prova: o emissor com **velocidade 0, gravidade 0**, taxa 200, vida 1,5 s — a partícula fica **onde nasce**, e a foto mostra a forma. Foto: `04_neutro_todas` (e uma por forma).

| Forma | O que faz (visto) | O que controla | O que o usuário **não** tem como controlar |
|:---|:---|:---|:---|
| **Ponto** | tudo num ponto só, **atrás da estrela do emissor**: não se vê | nada | — (certo assim) |
| **Círculo** | disco cheio de 60 px, uniforme ✓ | Raio | só a borda (é o Anel, outro botão) |
| **Anel** | coroa entre o raio e o de dentro ✓ | Raio · Espessura (0–1) | a espessura em **px**: 0,2 de 60 = 12 px, conta de cabeça |
| **Arco** | um quarto de coroa, **sempre do +X do osso** até 90° | Raio · Espessura · Trecho | **onde o arco começa** (só girando o emissor inteiro). E o Arco **herdou a espessura 0,2 do Anel** escolhido antes: um arco cheio depende de ter passado pelo Círculo |
| **Retângulo** | caixa cheia, girada com o osso ✓ | Largura · Altura | só a borda (o Unity tem "Edge/Shell") |
| **Linha** | partículas ao longo do segmento ✓ | Início · Fim | — |
| **Osso** | ao longo do `foot_b`: 15 px, **quase não se vê** | nada (é o comprimento do osso) | — |
| **Malha** | cinza: o slot não tem malha. Diz por quê ✓ | — | — |
| **Caminho** | escolhe o `cape_path`; na foto não dá para ver partícula no caminho | Caminho (lista) | **não medi** onde nascem |
| **Todas** | **sai tudo para cima** (Direção 90°). Para o círculo soprar para fora: *Sair do centro = 1*, **em outra aba** | | **a ligação forma → direção** |

Foto da cena com o Fogo de fábrica (`03_formas_todas`): **com raio 8 a 100 % de zoom nenhuma forma se distingue**.

### 2.3 Os exemplos

| Pergunta | Resposta | Foto |
|:---|:---|:---|
| Onde estão | botão **Partículas** da barra (*Emissor vazio · Fogo · Fumaça · Faísca · Poeira*, cada um com dica) e menu **Partículas** de cima (o mesmo + *Prender ao osso escolhido*) | `00_menu_particulas` · `05_menu_de_cima_particulas` |
| Como se põem | um clique. O rodapé diz: *"Fogo: emissor foot_b_particulas no osso foot_b (o mais perto do meio da cena)… Toque a animação para ver"*. Um `Ctrl+Z` tira | `01_fogo_criado` |
| O que acontece depois | no quadro 0 **não há nada** (é preciso tocar). Tocando: | `06_exemplos_todos` |
| — Fogo | chama de ~30 px, **atrás da perna** | |
| — Fumaça | mancha cinza clara **atrás da perna**, cinza sobre a grade cinza | |
| — Faísca | um punhado de pontos em 0,17 s; **de 0,5 s em diante, nada** (uma rajada só, no começo do laço) | |
| Por que atrás | o emissor nasce no **pé de trás** (`foot_b`, "o mais perto do meio") e o slot dele fica no grupo **perna**, atrás do corpo, da espada e do braço (`07_ordem`). Pôr X = 90 o tira de trás da perna e a fumaça aparece, mas atrás da espada (`07_fumaca_passo5_ao_lado`) | |

### 2.4 A ordem de desenho — acréscimo do Humberto, 06/10, 08h01

*"As partículas devem aparecer na ordem de desenho."* Conferido às 08h03. **Resposta: pela metade.**

| Pergunta | Resposta | Prova |
|:---|:---|:---|
| O emissor **obedece** à ordem de desenho? | **Sim.** A extensão manda: *"o emissor inteiro desenha na posição do seu slot na `drawOrder`"* (`formato/extensions/BONE_particles.md`, §9.9). Por isso o fogo sai **atrás da perna**: o slot dele está lá | `06_exemplos_todos` |
| Ele **aparece na aba Ordem**? | **Não.** A lista vai de `hand` a `cape_upper` (13 peças em 4 pastas), sem o `foot_b_particulas` | `09_ordem_antes_lista` |
| Por quê | a aba só lista o que "desenha": `region`, `mesh`, `linkedmesh`, `skeleton` (`editor/src/panels/draw-order-model.ts`, `DRAWING_TYPES`). O anexo `BONE_particle` cai em "fora", com a caixa, o ponto e o caminho | código |
| Dá para mudá-lo de lugar por outro caminho? | **Não achei.** Com o emissor escolhido na Árvore, `Ctrl + ↑` respondeu *"Não há marca nesta animação"* (é a tecla de marca), e a cena não mudou | `09_depois_ctrl_cena` |

Os outros: **Godot e Unity** dão ao emissor um z/sorting como a qualquer nó; o **Construct** o trata como objeto na camada (ficha do Diretor). Em todos o emissor **está na lista** de quem fica na frente.

### 2.5 A janela das Rajadas

**Consertada desde a rodada 31**: abre por cima da linha do tempo, com *Quando (s) · Quantas · Vezes · A cada (s) · Chance (0 a 1)* (`08_rajadas_janela`).

---

## 3. O caminho do objetivo

### 3.1 Uma fumaça do zero

Como usuário, sem ler o código. Foto: `07_fumaca_do_zero`.

| # | Passo | Tropeço |
|:---:|:---|:---|
| 1 | Partículas → **Emissor vazio** | um fio de pontos para cima, **atrás da perna**. Vida "1 · 1", Velocidade "100 · 100" |
| 2 | aba Forma → **Círculo** | o raio vira 30 sozinho ✓ |
| 3 | Nascer: Taxa **12**, Vida **1,5 · 2,2** | a faixa: o que é a segunda caixa? |
| 4 | Movimento: Velocidade **25 · 45**, Abertura **20** | idem |
| 5 | Tamanho e giro: Tamanho **0,8 · 1,2** | "fator" de quê? Quanto é grande? |
| 6 | **Tamanho na vida ▾ → cresce** | o ▾ é só ícone. As curvas prontas (*igual a vida toda · cresce · encolhe · pulsa*) são boas ✓ |
| 7 | Cor: **Some na vida ▾ → aparece e some** | idem ✓ (*sempre inteira · some no fim · aparece e some · some aos poucos*) |
| 8 | Cor ao nascer → **cinza** | o seletor de cor do sistema (sem janela, troquei por script) |
| 9 | tocar | **a fumaça quase não aparece**: atrás do corpo, pequena, cinza sobre cinza (`07_fumaca_passo4_cinza`) |

**Resultado: fiz a fumaça, e não a vi.** O caminho de campos existe; o que falta é **ver** e **saber o que cada número quer dizer**.

### 3.2 Fogo e faísca do zero (pelo mesmo caminho, sem foto)

| Efeito | O que se precisa saber, e a tela não diz |
|:---|:---|
| **Fogo** | que **Gravidade Y positiva sobe** · que a **Direção 90 é para cima** · que o tamanho é um fator dos 32 px do ponto suave · que aditivo mora no **slot** (outro painel) |
| **Faísca** | que precisa de **Taxa 0 + Rajada** · que a rajada sai **uma vez por laço** (em 0 s) e não se repete sem *Vezes* e *A cada* · que **Gravidade Y negativa cai** · que *Vira com o voo* estica o risco |

---

## 4. O plano dos lotes

Pela régua do `26`. Cada lote diz **o que tem de acontecer**, não o gesto. Nada aqui toca `formato/` ou `runtime/`: tudo é editor. Onde a tela mostra outro número que o arquivo, a conta está ao lado.

### Lote 1 — o exemplo se vê de primeira

| # | O que tem de acontecer | Por quê (fonte) |
|:---:|:---|:---|
| 1.0 | **O emissor aparece na aba Ordem** como qualquer peça, com um ícone de partícula, e subir, descer, arrastar e `Ctrl + setas` o põem na frente ou atrás das imagens; a cena acompanha e `Ctrl+Z` desfaz | §2.4: pela metade. Godot, Unity e Construct. O desenho já obedece à `drawOrder` (§9.9 da extensão): falta a porta. Nenhum campo novo |
| 1.1 | O emissor criado pelo menu **aparece na frente do boneco** (o slot dele entra no topo da ordem de desenho) | `06`: atrás da perna não se vê. Nenhum campo novo: é **onde** o slot entra na lista |
| 1.2 | Ele nasce **onde se vê**: o osso escolhido, ou — sem escolha — **o meio da cena, à vista**, e não um pé de trás | `06`, `07_ordem` |
| 1.3 | Os três exemplos têm **tamanho de efeito**: o fogo do tamanho de uma tocha, a fumaça maior que o pé, a faísca que se repete enquanto a animação toca | Godot: fumaça raio 30; Construct: fumaça 200 px; faísca de uma rajada só some em 0,5 s |
| 1.4 | A fumaça **se lê sobre o fundo claro** (mais escura, ou alfa mais alto) | `06`: cinza sobre cinza |
| 1.5 | Com o emissor escolhido, **a partícula se mexe sem tocar a animação** (prévia), e para quando sai dele | Unity: painel *Particle Effect*; Construct: prévia no layout. É estado do editor (`RECORTE_editor_state`) ou nem isso |

**Prova:** foto 1920×1080 e 1280×720 de cada exemplo recém-criado, sem tocar em nada mais.

### Lote 2 — toda faixa diz "de … a …"

| # | O que tem de acontecer | A conta |
|:---:|:---|:---|
| 2.1 | As **oito faixas** (Vida, Velocidade, Tamanho, Giro inicial, Giro/s, Explosão·janela, Folha, e o par Gravidade X·Y) mostram a palavra entre as caixas: **"de 0,5 a 0,9 s"** | nenhuma: é texto |
| 2.2 | **Os dois números iguais se leem como um**: Vida "1 · 1" vira "1 s" com um ▾ para abrir a faixa | Unity: modo *Constant* × *Random Between Two Constants* |

### Lote 3 — todo número com unidade e faixa (régua 1 e 2 do `26`)

| Campo | Hoje | Passa a | Conta / fonte |
|:---|:---|:---|:---|
| Raio, X·Y, Início/Fim | sem unidade | **px** | — |
| Espessura (0–1) | fração do raio | **"Grossura (px)"**, de 0 ao raio | mostra `raio × radiusThickness`; ao digitar, grava `px ÷ raio`, preso a 0–1. Godot usa raio de dentro em px |
| Arrasto (1/s) | "1/s" | **"Freio"**, com a dica *"0,5: perde 39 % da velocidade por segundo"* | spec §9: `v' = −k·v` → perde `1 − e^(−k)` em 1 s: 0,5 → 39 %, 1 → 63 %, 2 → 86 % |
| Direção (°) | 90 | **com a seta** (o disco do ângulo, como o Giro) e "90° = para cima" | spec: padrão 90 para cima |
| Gravidade Y | sinal | **"+ sobe · − cai"** à vista | presets: fogo 40, faísca −400 |
| Tremor ao nascer · Sair do centro · Explosão | 0 | **0 a 1**, com o que é o 1 | spec: os três 0..1 |
| Abertura (±°) | | **0 a 180°** | spec: 0..180 |
| Tamanho (fator) | fator | **fator e o px que ele dá**: "1 = 32 px" | o ponto suave tem 32 px |
| Cor · 100 | "100" solto | **"Alfa 100 %"** | — |
| Semente | 0 | dica: *"o sorteio: o mesmo número dá o mesmo efeito"* | spec: sempre fixa |

**Prova:** um teste puro que passa por **todo** campo numérico da ficha e falha se algum não tiver unidade (ou "—" declarado) e faixa. Antes de consertar, ele falha com os 15 da §2.1 (regra 26).

### Lote 4 — cada forma controla o que faz

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 4.1 | Na aba Forma, **ao lado da forma**, a escolha **"as partículas saem: para a direção · para fora da forma"** (o mesmo `spherizeDirection`, 0 ou 1, à vista na Forma; o número fino continua no Movimento) | Unity: o Circle sopra para fora por natureza; o Humberto: *"o círculo e o quadrado não sei o que fazem"* |
| 4.2 | **Arco: onde começa** se controla, girando o arco e não o emissor inteiro — **se o modelo deixar** | a spec só tem `arc` a partir de +X (§9.4). **Campo novo é decisão do Humberto** (regra 7): o Diretor decide. Sem ele: a alça de girar do emissor mora no começo do arco, e a dica diz *"gire o emissor para mudar onde o arco começa"* |
| 4.3 | Escolher **Arco** dá um arco cheio, venha de onde vier (hoje herda a espessura do Anel) | `03_forma_4_Arco` |
| 4.4 | Ponto e Osso **dizem na cena** onde nascem (o osso aceso; o ponto com um anel em volta), em vez de sumir atrás da estrela | `04_neutro_Ponto` · `04_neutro_Osso` |
| 4.5 | Caminho: medir se nasce no caminho; se não, é defeito | `04_neutro_Caminho` (não deu para ver) |

### Lote 5 — "fazer uma fumaça" é um objetivo, não um campo

| # | O que tem de acontecer | Fonte |
|:---:|:---|:---|
| 5.1 | O exemplo escolhido **diz, na ficha, os 3 ou 4 números que o fazem ser o que é** (fumaça: *vida longa · sobe devagar · cresce · aparece e some*), cada um com o campo à mão | régua 5 do `26`: *"a ficha mostra os valores que os fazem"* |
| 5.2 | **Trocar um emissor pronto por outro** (fumaça → fogo) sem apagar e criar de novo, num passo de desfazer | Unity *Presets*: aplica as configurações num componente que já existe |
| 5.3 | A mistura **aditiva** do fogo e da faísca se acha **na ficha do emissor** (hoje mora no slot, outro painel) | Godot, Unity e Construct: fogo aditivo. A decisão do `particle-presets.ts` (normal, porque branco satura no fundo claro) fica; o lugar do botão é que muda |

**Prova do lote 5 (o objetivo da rodada):** no programa montado, com o mouse, **fumaça, fogo e faísca do zero**, a partir do *Emissor vazio*, foto de cada uma visível, e o passo a passo escrito com o número de cliques.

### O que fica de fora

| O quê | Por quê |
|:---|:---|
| forma "só a borda" do retângulo | campo novo no formato (regra 7). Nenhum dos três exemplos precisa |
| arco em sequência (Loop, Ping-Pong do Unity) | idem |
| máscara de pixels (Godot) | a Malha cobre o caso |

---

## Suposições (regra 23: nada subiu ao Humberto)

| # | Suposição | Quem decide se estiver errada |
|:---:|:---|:---|
| S1 | A caixa do `0,5` é a **Vida** (o Humberto confirmou) e também o **Arrasto**; o lote 3 conserta as duas | — |
| S2 | Pôr o slot novo no topo da ordem **não é campo novo**: é a posição na lista que já existe | Diretor |
| S3 | A prévia sem tocar (1.5) vive só no editor | Diretor |
| S4 | "Onde o arco começa" é campo novo → **não** entra sem o Humberto; o plano tem o caminho sem ele | Diretor → Humberto |

## O que não conferi

| O quê | Por quê |
|:---|:---|
| 1280×720 | só a parte 2 fotografa nas duas telas (régua 3 da ficha) |
| o seletor de cor do sistema | não abre sem janela; troquei a cor por script |
| a malha como forma | o herói não tem malha no slot do emissor |
| onde nasce no Caminho | a foto não mostrou |

## Desvios (o executor, na parte 2)

| Lote | Desvio | Por quê |
|:---:|:---|:---|
| 1 | O 1.1 ("entrar no topo") **saiu**: já era assim | correção do topo deste documento, foto `10_prova_frente_ou_atras` |
| 1 | O 1.2 (nascer à vista) e o 1.5 (prévia sem tocar) **ficaram de fora** | com os exemplos maiores e na frente, o pé já se vê; a prévia é outro mecanismo, para um lote próprio |
| 1 | A faísca tem **dois** estouros, e não "enquanto a animação toca" | com mais ciclos a volta do `walk` (1 s) cortaria alguns, e a §6 da extensão manda o leitor avisar |
| 2 | O 2.2 (dois números iguais lidos como um) **ficou de fora** | pede um controle novo na ficha |
| 3 | A **Espessura** continua de 0 a 1, e não "Grossura (px)" | o campo da ficha não sabe mostrar um número convertido; a conta em px foi para a dica (*"raio 60 e 0,2 dão 12 px"*) |
| 3 | O **"100" da cor** (o alfa) não ganhou nome | mora no controle de cor de `properties.ts`, de outra parte |
| 3 | O **Arrasto** virou **Freio (por s)**, e a Direção não ganhou disco | o disco é controle novo; a dica diz 0, 90, 180, 270 |
| 4 | **S4, decisão do Diretor:** o arco começa no +X do osso; se o emissor gira, o arco gira junto. Sem campo novo | a dica do Trecho diz *"para mudar onde começa, gire o emissor"* |
| 4b | Na faixa de duas cores (**Cor ao nascer**) o número da opacidade **fica só na dica** | ao lado da barrinha não cabe: o quadrado da cor sumia em 1280×720. Na **Cor do emissor** ele aparece |
| 5 | O **5.1** (a ficha mostrar os números que fazem o exemplo) foi para a **dica da porta** (*"O que a faz fumaça: vida longa (1,8 a 2,6 s), sobe devagar…"*) | o arquivo não guarda de que exemplo o emissor veio, e um campo para isso seria campo novo (regra 7) |
| 5 | O **5.2** (trocar um emissor pronto por outro) e o **5.3** (o aditivo na ficha do emissor) **ficaram de fora** | o caminho do Diretor (*"Novo → Fumaça → ajustar 2 ou 3 campos"*) já se cumpre com a porta; o aditivo continua no slot |
| 5 | O menu **de cima** (Partículas) manteve os rótulos *Fogo, Fumaça…*; só a **barra** diz *Novo: fogo* | `ui/menus.ts` é arquivo de passagem: só acrescentando |
| 5 | O vazio nasce **magenta**, e não azul | azul sumia na roupa do herói (foto `a0_novo_vazio`) |
