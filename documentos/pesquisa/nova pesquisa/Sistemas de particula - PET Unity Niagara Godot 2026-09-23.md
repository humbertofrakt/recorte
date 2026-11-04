# Sistemas de partícula — PET, Unity, Niagara, Godot × BONE_particles — 23/09/2026

Pedido do Humberto: comparar campo a campo com quatro sistemas de referência, e
dizer o que falta pra fogo/fumaça/faísca/poeira, e o que já temos e ninguém usa.
**Só pesquisa. Nenhum código foi mexido.**

Fonte do nosso lado: `formato/extensions/BONE_particles.md` (a spec, 18/09/2026)
e `editor/src/panels/properties-model.ts` (o que tem campo em tela).

Os quatro programas pesquisados:

| Programa | O que é |
|:---|:---|
| **PET** (Source / Source 2, Valve) | Editor de partículas do Dota 2, CS:GO, TF2. Por operadores |
| **Unity** (Shuriken) | Módulos no componente Particle System |
| **Niagara** (Unreal Engine) | Módulos por nó, em pilhas (Emitter Update, Spawn, Update, Render) |
| **Godot** (GPUParticles2D + ParticleProcessMaterial) | Propriedades num painel só, código aberto |

**Coluna "Nós":** ✓ **editor** = tem campo em tela · ✓ **só arquivo** = existe no
formato e no runtime, ninguém escreve sem editar o `.bone` à mão · **não** =
não existe em lugar nenhum, por decisão.

---

## 1. Emissão e vida

| Campo (nosso nome) | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| taxa (`rate`) | Emit Continuously | Rate over Time | Spawn Rate | `amount`+`lifetime` | partículas por segundo | ✓ editor |
| rajada (`bursts`) | Emit Instantaneously | Bursts | Spawn Burst Instantaneous | `one_shot`+`explosiveness` | um lote de uma vez, num instante | ✓ **só arquivo** |
| vida (`lifetime`) | Lifetime Random | Start Lifetime | Initialize Particle | `lifetime` | quanto tempo cada uma vive | ✓ editor |
| limite de vivas (`maxParticles`) | Max Particles | Main → Max Particles | (propriedade do emissor) | `amount` | teto de partículas na tela ao mesmo tempo | ✓ editor |
| explosividade (`explosiveness`) | — | — | — | `explosiveness` | rajada concentrada num ponto do ciclo, ou espalhada | ✓ editor — **mesmo nome do Godot** |
| tremor do nascimento (`randomness`) | — | — | — | `randomness` | sacode o instante exato do nascimento | ✓ editor — **mesmo nome do Godot** |
| atraso (`startDelay`) | — | — | — | (parecido com negativo de `preprocess`) | nada nasce antes disto | ✓ editor |
| pré-aquecer (`prewarm`) | — | Main → Prewarm | — | `preprocess` | começa como se já tivesse rodado N segundos | ✓ editor |
| semente (`seed`) | — (não achei toggle simples) | Random Seed | Random Seed | `seed` / `use_fixed_seed` | fixa o acaso, pra repetir sempre igual | ✓ editor |
| laço (`looping`) | — | Main → Looping | — | `one_shot` (invertido) | repete com a animação, ou toca uma vez | ✓ editor |

---

## 2. Forma do emissor

| Campo | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| ponto/círculo/retângulo (`shape`) | Position Within Sphere / Along Ring | Shape (cone, esfera, caixa, círculo…) | Shape Location (Sphere/Box/Cylinder/Cone) | `emission_shape` | de onde a partícula nasce | ✓ editor |
| linha (`shape: edge`) | — | Shape → Edge | — | `emission_ring` (aproximado) | nasce ao longo de um segmento | **enum tem, coordenadas não têm campo** |
| malha (`shape: mesh`, `meshMode`) | Position on Model Random | Shape → Mesh | Skeletal/Static Mesh Location | `emission_point_texture` | nasce sobre uma malha deformada | ✓ editor |
| osso (`shape: bone`) | — | — | — | — | nasce ao longo do próprio osso | ✓ editor — **ninguém dos quatro tem isso** |

---

## 3. Velocidade e direção

| Campo | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| velocidade (`speed`) | (dentro de Movement Basic) | Start Speed | Add Velocity | `initial_velocity` | rapidez ao nascer | ✓ editor |
| direção (`direction`) | (via Control Point) | Shape → direção | Add Velocity in Cone | `direction` | pra onde aponta | ✓ editor |
| abertura (`spread`) | (cone da forma) | Shape → Spread | Add Velocity in Cone (ângulo) | `spread` | quanto abre o leque | ✓ editor |
| sair do centro (`spherizeDirection`) | — | Shape → **Spherize Direction** | — | — | mistura a direção com o ângulo de saída da forma | ✓ editor — **mesmo nome do Unity** |
| virar p/ onde vai (`alignToVelocity`) | Render Sprite (orientação) | Renderer → alinhar à velocidade | Sprite Renderer → Alignment | — | gira o sprite na direção do voo | ✓ editor |
| herdar velocidade do emissor | filho herda do pai | Inherit Velocity | Inherit Velocity | `inherit_velocity_ratio` | a partícula sai já com a velocidade de quem a soltou | **não** — excluído (a derivada da pose com constraints não tem conta fechada) |

---

## 4. Forças

| Campo | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| gravidade (`gravity`) | Movement Basic | Gravity Modifier | Gravity Force | `gravity` | puxa pra baixo (ou pra cima, com sinal) | ✓ editor |
| arrasto (`drag`) | Movement Basic | Limit Velocity over Lifetime | Drag | `damping` | freia com o tempo | ✓ editor |
| ruído/turbulência | Spatial Noise | Noise | Curl Noise Force | `turbulence_*` | movimento orgânico, tipo fumaça de verdade | **não** — excluído para sempre (ruído lido na posição atual depende do ruído anterior: é estado) |
| atração/vórtice/força radial | Pull Towards Control Point | Force over Lifetime | Vortex/Point/Line Attraction | `radial_accel`, `tangential_accel` | puxa pra um ponto, ou gira em torno dele | **não** — excluído para sempre (vira equação diferencial sem solução fechada) |

---

## 5. Cor e tamanho

| Campo | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| cor ao nascer (`startColor`) | Color Random | Start Color | Initialize Particle | `color` | sorteia entre duas cores | ✓ editor |
| cor ao longo da vida (`colorOverLifetime`) | Color Fade | Color over Lifetime | Scale Color | `color_ramp` | gradiente: nasce de um jeito, morre de outro | ✓ **só arquivo** |
| alfa ao longo da vida (`alphaOverLifetime`) | Alpha Fade In/Out | Color over Lifetime (canal alfa) | Scale Color (alfa) | `alpha_curve` | some aos poucos | ✓ **só arquivo** |
| tamanho ao nascer (`scale`) | Radius Random | Start Size | Initialize Particle | `scale_min/max` | tamanho inicial | ✓ editor |
| tamanho ao longo da vida (`scaleOverLifetime`) | Radius Scale | Size over Lifetime | Scale Sprite Size | `scale_curve` | cresce ou encolhe vivendo | ✓ **só arquivo** |
| cor/tamanho por velocidade | — | Color by Speed / Size by Speed | Scale Color by Speed | `scale_over_velocity` | muda conforme a rapidez, não a idade | **não** |

---

## 6. Rotação

| Campo | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| ângulo ao nascer (`angle`) | Rotation Random | Start Rotation | Initialize Particle | `angle_min/max` | giro inicial | ✓ editor |
| velocidade angular (`angularVelocity`) | Rotation Basic | Rotation over Lifetime | Sprite Rotation Rate | `angular_velocity` | quanto gira por segundo — **constante na vida**, nos outros pode ter curva | ✓ editor |

---

## 7. Textura e folha de quadros

| Campo | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| imagem (`path`) | Render Sprites | Renderer → texture | Sprite Renderer | `texture` | a imagem da partícula | ✓ editor |
| grade de quadros (`frameMode`, `cycles`, `fps`, `startFrame`) | Sequence Number/Min/Max | Texture Sheet Animation | Sub UV Animation | `anim_speed`, `anim_offset` | anima trocando de quadro | ✓ editor |
| lista de regiões sem grade (`sequence`) | — | — | — | — | folha de sprites que não é uma grade regular | ✓ **só arquivo** |

---

## 8. Espaço, ordenação

| Campo | PET | Unity | Niagara | Godot | O que faz | Nós |
|:---|:---|:---|:---|:---|:---|:---:|
| espaço local/mundo (`space`) | Movement Lock to Bone (≈local) | Simulation Space | Local Space (propriedade) | `local_coords` | segue o osso, ou solta e esquece | ✓ editor |
| ordem de desenho (`sortMode`) | não achado explícito | Renderer → Sort Mode | Sprite Renderer → Sort Mode | `draw_order` | quem fica na frente: a mais nova ou a mais velha | ✓ editor |

---

## 9. Fora da régua — não existe, por decisão

Estes quatro sistemas simulam **para frente e guardam estado**. O nosso não
pode: arrastar o tempo pra trás tem que dar o quadro exato. É por isso que
estes campos ficam de fora — **não é falta de tempo, é a regra que o Humberto
fixou em 15/09** (`documentos/planos/IDEIAS NOVAS - particulas e biblioteca
2026-09-15.md`).

| Campo | PET | Unity | Niagara | Godot | Por que não vem |
|:---|:---|:---|:---|:---|:---|
| colisão | Collision via Traces | Collision | Collision | `collision_mode` | depende de onde a partícula estava a cada passo |
| sub-emissor | filho herda do pai | Sub Emitters | Generate Death/Collision Event | `sub_emitter` | **adiado**, não excluído — cabe na régua (nascimento e morte são números conhecidos), só não foi escrito ainda |
| rastro (trail) | Render Sprite Trail / Rope | Trails | Ribbon Renderer | `trail_enabled` | **adiado**, não excluído — `p(a − j·Δ)` também cabe na régua |
| taxa por distância | — | Rate over Distance | Spawn Per Unit | — | exige o comprimento do caminho do osso: integral numérica |
| herdar velocidade do emissor | (filho herda) | Inherit Velocity | Inherit Velocity | `inherit_velocity_ratio` | a derivada da pose com constraints não tem conta fechada |
| ruído/turbulência | Spatial Noise | Noise | Curl Noise Force | `turbulence_*` | lido na posição atual → depende do ruído anterior |
| força radial/vórtice/atração | Pull Towards CP | Force over Lifetime | Vortex/Attraction Force | `radial_accel` | equação diferencial sem solução fechada |
| semente automática | — | (opção de não fixar) | — | `use_fixed_seed: false` | é exatamente o que a nossa régua proíbe |

---

## 10. O que falta pra cobrir fogo, fumaça, faísca e poeira

Nenhum dos quatro efeitos precisa de algo **inexistente no formato**. O que
falta é **UI no editor** — hoje só dá pra usar escrevendo o `.bone` à mão.

| Efeito | Precisa de | Onde está hoje |
|:---|:---|:---|
| **Fogo** | cor ao longo da vida (amarelo → laranja → escuro), tamanho encolhendo, folha de quadros, aditivo | cor e tamanho: **só arquivo**. Aditivo: já dá, é o `blend` do slot |
| **Fumaça** | crescer e sumir (`scaleOverLifetime` + `alphaOverLifetime`), espaço mundo (não seguir o osso), arrasto | crescer/sumir: **só arquivo**. Espaço e arrasto: já tem editor |
| **Faísca** | rajada no golpe (`bursts`), virar na direção do voo, gravidade forte, rastro curto | rajada: **só arquivo**. Virar/gravidade: editor. **Rastro: não existe em lugar nenhum — adiado** |
| **Poeira** | rajada no passo (`bursts`), forma em linha ao longo do pé (`shape: edge`), deriva lenta | rajada: **só arquivo**. Forma linha: **enum tem, coordenadas não têm campo** |

**O buraco comum aos quatro: `bursts` e as três curvas "ao longo da vida"
(`colorOverLifetime`, `alphaOverLifetime`, `scaleOverLifetime`) não têm campo
no editor.** Sem esses cinco, fogo e fumaça não têm como nascer, crescer e
sumir suavemente, e faísca/poeira não têm como estourar num instante — só dá
pra fazer com `emitting` ligando e desligando, o que é grosseiro pra um golpe
ou um passo.

**Faísca também esbarra no rastro**, que nenhum dos dois lados (formato ou
editor) tem hoje — está na lista dos adiados (§9), não é um buraco de UI.

---

## 11. O que temos e ninguém usa

Campo existe no schema (`formato/extensions/BONE_particles.schema.json`) **e**
no runtime (`runtime/src/attachments/particle.ts`), mas **zero** referência no
editor — sem escrever o `.bone` à mão, ninguém chega nele:

| Campo | Pra que serve | Confirmado |
|:---|:---|:---|
| `bursts` | rajada de partículas num instante | só aparece em `particles-view.ts` pra decidir se desenha algo — não pra editar |
| `scaleOverLifetime` | tamanho crescendo/encolhendo com a idade | zero ocorrência em `editor/src` |
| `colorOverLifetime` | gradiente de cor com a idade | zero ocorrência em `editor/src` |
| `alphaOverLifetime` | sumir aos poucos | zero ocorrência em `editor/src` |
| `sequence` | folha de sprites sem grade regular | zero ocorrência em `editor/src` |
| `edge` (as coordenadas, não o nome da forma) | linha de onde a partícula nasce | o seletor de forma lista "linha" como opção; as quatro coordenadas (`x0,y0,x1,y1`) não têm campo |

Estes seis são exatamente os que faltam pra fogo, fumaça, faísca e poeira
(§10) — não é coincidência: são os campos mais "de efeito" da spec, e são os
que sobraram de fora quando o editor ganhou o painel do emissor.

---

## Fontes

- **PET** — [Particle Editor Guide (GitHub)](https://github.com/Nibuja05/dota_particle_editor_tutorial/blob/master/Particle%20Editor%20Guide.md) · [source2.wiki](https://www.source2.wiki/EngineTools/ParticleEditor/particle-editor-guide) · Valve Developer Wiki (Movement Lock to Bone, Movement Basic, Lifespan Decay, Position on Model Random)
- **Unity** — [Particle System modules](https://docs.unity.cn/2023.2/Documentation/Manual/ParticleSystemModules.html) · [Main module](https://docs.unity.cn/Manual/PartSysMainModule.html) · [Shape module](https://docs.unity3d.com/2018.1/Documentation/Manual/PartSysShapeModule.html) · [Velocity over Lifetime](https://docs.unity3d.com/6000.0/Documentation/Manual/PartSysVelOverLifeModule.html)
- **Niagara** — [System and Emitter Module Reference](https://dev.epicgames.com/documentation/en-us/unreal-engine/system-and-emitter-module-reference-for-niagara-effects-in-unreal-engine) · Emitter Update / Particle Spawn / Particle Update / Render group references (dev.epicgames.com)
- **Godot** — [ParticleProcessMaterial](https://docs.godotengine.org/en/stable/classes/class_particleprocessmaterial.html) · [GPUParticles2D](https://docs.godotengine.org/en/stable/classes/class_gpuparticles2d.html)

Alguns campos de sub-nível (PET: ordenação de desenho; Unity: nomes exatos
dentro de Main/Emission/Renderer) vieram de memória geral dos agentes de
pesquisa, não de uma página específica — marcado onde apareceu.
