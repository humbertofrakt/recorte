# Reaproveitar animação — o desenho

Noite de 04 para 05/11/2026. Executor da parte "reaproveitar".
Pedido do Humberto: *"o Fortnite tem vários personagens, mas usa as mesmas animações base"*.

## 1. O que os outros programas fazem

| Programa | Como reaproveita | Palavra na tela |
|:---|:---|:---|
| **Unreal** (Fortnite) | Um **Skeleton** é dono das animações. Vários corpos (Skeletal Mesh) usam o MESMO Skeleton e tocam todas. Esqueleto diferente: **IK Retargeter** liga as cadeias de um no outro, e "Duplicate and Retarget" faz cópias | *Skeleton*, *Compatible Skeletons*, *Retarget* |
| **Unity** | Cada modelo ganha um **Avatar Humanoid**: uma tabela "osso padrão → osso deste modelo", com auto-mapeamento (verde = achou, vermelho = falta). Daí qualquer animação humanoide toca em qualquer modelo. **Animator Override Controller** troca só alguns clipes por personagem | *Configure Avatar*, *Mapping*, *Override* |
| **Spine** | Import → "into existing skeleton". A animação é **copiada**. Liga pelo nome do osso; o que não bate cai calado. Tem ajuste de escala | *Import Data*, *Animations* |
| **Spriter** | Várias entidades num projeto; sem importar animação. Copiar e colar chaves | *Entity*, *Character map* |
| **DragonBones** | Biblioteca é de imagens. Animação por armadura | *Armature* |

**O que vale copiar:**

| Ideia | De quem |
|:---|:---|
| Um dono da animação, vários corpos tocando, editar num lugar só | Unreal |
| Tabela "osso de lá → osso daqui", com auto-mapeamento e cor | Unity |
| Copiar quando a pessoa quer mexer só num | Spine, Unreal (Duplicate) |

## 2. As palavras na tela (decididas)

| Palavra | O que é | Por quê |
|:---|:---|:---|
| **Usar animações de outro boneco…** | a porta. Menu Animação e botão na aba Animações | diz o objetivo, não a técnica |
| **Esqueleto padrão** | o `humanoide-v1` (17 ossos com nomes em português) e as 4 de fábrica | "rig humanoide-v1" ninguém entende |
| **Combinar os ossos** | a tabela "osso de lá → osso daqui". Mostra **"combinam 14 de 17"** | "mapear" e "retarget" são palavras de técnico |
| **Ligadas** — *mudam junto com o original* | o boneco cita o arquivo (`assets.animations`); muda lá, muda aqui | o Fortnite |
| **Cópia** — *fica só neste boneco* | a animação entra no boneco, com os nomes daqui | o Spine |
| **Compartilhadas** | a seção da lista, no lugar de "De fora". Cada linha diz **de onde** vem | "De fora" não diz de onde |
| **Abrir o original** | vai para o boneco dono da animação, com ela aberta | onde se muda |
| **Seguir o Esqueleto padrão…** | menu Base. Combinar os ossos com o padrão e renomear os daqui | um boneco que segue o padrão recebe tudo |

## 3. O caminho mais curto de cada objetivo

| Objetivo | Cliques |
|:---|:---|
| (a) andar do herói noutro boneco | abrir o boneco → **Usar animações de outro boneco…** → Um arquivo… → `heroi.bone` → marcar `walk` → Combinar os ossos (já vem preenchido: hips→quadril…) → **Cópia** |
| (b) as 4 de fábrica num boneco | **Usar animações de outro boneco…** → Esqueleto padrão → **Ligadas** (ou Cópia) |
| (c) nomes diferentes | igual ao (b); a tabela acha `braco_direito → braco_d`; o que não achou, escolhe na lista. **Ligadas** renomeia os ossos daqui para os de lá (avisando antes); **Cópia** traduz as chaves |
| (d) mudar num lugar, 3 mudam | cavaleiro: as 4 de fábrica como **Cópia** (o cavaleiro vira o dono). Goblin e robô: **Usar animações…** → "cavaleiro (base do projeto)" → **Ligadas**. Mudar o `andar` no cavaleiro: os 3 mudam. No goblin, **Abrir o original** leva ao cavaleiro |

## 4. As telas

```
┌ Usar animações de outro boneco ───────────────────────────────┐
│ De onde vêm                                                   │
│  (•) Esqueleto padrão — parado, andar, correr, pular          │
│  ( ) cavaleiro — base deste projeto                           │
│  ( ) Um arquivo .bone…                                        │
│                                                               │
│ Quais animações   [x] parado [x] andar [x] correr [x] pular   │
│                                                               │
│ Combinar os ossos — combinam 14 de 17                         │
│   de lá          daqui                                        │
│   quadril     →  [bacia ▾]           achado: parecido         │
│   braco_d     →  [braco_direito ▾]   achado: parecido         │
│   pescoco     →  [— nenhum — ▾]      FALTA: fica parado       │
│                                                               │
│ Como entram                                                   │
│  (•) Ligadas — mudam junto com o original                     │
│      Os ossos daqui ganham os nomes de lá: bacia → quadril…   │
│  ( ) Cópia — ficam só neste boneco                            │
│                                                               │
│                         [Usar as animações]  [Fechar]         │
└───────────────────────────────────────────────────────────────┘

Aba Animações
┌ Animações ─────────────────────┐
│ ★ parado        2,00 s repete  │
│   andar         1,00 s repete  │
│ Compartilhadas                 │
│   andar  ↗ do cavaleiro        │   ← clique: toca aqui, só para ver
│   correr ↗ do cavaleiro        │
│   [Abrir o original]           │   ← vai para o cavaleiro, com ela aberta
└────────────────────────────────┘
```

## 5. O formato

| Precisa | Onde vai | Campo novo no núcleo? |
|:---|:---|:---|
| citar o arquivo compartilhado | `assets.animations` (§2.8) | não |
| dizer "este boneco segue o padrão" | `rig: { name: "humanoide-v1", bones: [...] }` (§4.8: *"rig num esqueleto comum é permitido e inerte: serve de documentação e de dica ao editor"*) | não |
| lembrar a tabela dos ossos | `extensions.RECORTE_editor_state.mapaDeOssos` | não (estado do editor, regra 6) |
| quem é o dono de um arquivo compartilhado | `extensions.RECORTE_editor_state.compartilha` | não |
| ligar SEM renomear (um mapa que o jogo leia) | **proposta, não feita**: `rig.map` no arquivo do boneco. Ver §6 | seria. Decisão do Humberto (regra 7) |

**Por que "Ligadas" renomeia os ossos.** O leitor do jogo liga a animação de fora pelo **nome** do osso (§2.8). Sem campo novo, a única forma de o robô tocar o mesmo `andar` do arquivo é ter os mesmos nomes. A janela diz isso **antes**, com a lista de nomes que mudam. Quem não quer renomear escolhe **Cópia**.

## 6. Proposta para o Humberto (não feita)

`rig.map` no boneco: `{ "braco_d": "braco_direito", ... }` — "o osso que o arquivo chama de `braco_d`, aqui se chama `braco_direito`". O leitor aplicaria o mapa ao copiar as timelines de fora. É o Avatar do Unity no formato. Ganho: o robô ficaria Ligado sem renomear. Custo: os dois runtimes, o validador e casos de conformidade novos. Hoje não precisa: renomear resolve.
