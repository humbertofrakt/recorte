# As partículas — pesquisa e proposta — 04/10/2026

Rodada 14. Escrita pelo chat `PESQUISA · rodada 14 — as partículas`.
**Sem código. O programa não foi aberto.** Só leitura e internet.

---

## Em cinco linhas

| # | O achado |
|:---:|:---|
| 1 | **O nosso formato já tem quase tudo.** O que falta é a **porta** no editor, não o motor |
| 2 | **A régua do Diretor corta demais.** O Construct é pequeno: só o que os dois tocam deixa de fora a cor ao longo da vida, o giro, a folha animada |
| 3 | **Proponho outra régua:** entra o que é função pura do tempo e o **nosso leitor** desenha barato nas duas engines |
| 4 | **Ele não conseguiu clicar porque o código pula o emissor** no clique, e o emissor não tem posição própria: a origem é o osso |
| 5 | Cinco perguntas no fim. Nenhuma trava a rodada 15 |

---

## As fontes

| Fonte | Link | Como li |
|:---|:---|:---|
| **Construct 3 r449.5 — o painel de Propriedades** | 4 fotos do Humberto, 04/10/2026, 20:30 | **a fonte da coluna Construct.** O painel inteiro, com os dois menus abertos |
| Construct 3 — Particles (manual) | https://www.construct.net/en/make-games/manuals/construct-3/plugin-reference/particles | o site pede verificação de robô e eu não passo por ela. **O Humberto colou o texto inteiro**, 04/10/2026. Lido do começo ao fim |
| Construct 3 — Particles (script) | https://www.construct.net/en/make-games/manuals/construct-3/scripting/scripting-reference/plugin-interfaces/particles | idem. Nomes das propriedades conferidos aqui |
| Godot — ParticleProcessMaterial | https://docs.godotengine.org/en/stable/classes/class_particleprocessmaterial.html | lido direto. Godot **4.7** |
| Godot — GPUParticles2D | https://docs.godotengine.org/en/stable/classes/class_gpuparticles2d.html | lido direto |
| Godot — CPUParticles2D | https://docs.godotengine.org/en/stable/classes/class_cpuparticles2d.html | lido direto |
| Godot — Partículas 2D (tutorial) | https://docs.godotengine.org/en/stable/tutorials/2d/particle_systems_2d.html | lido direto |
| Godot — Atratores | https://docs.godotengine.org/en/stable/tutorials/3d/particles/attractors.html | *"Particle attractors are not yet implemented for 2D particle systems."* |
| Niagara — visão geral | https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-niagara-effects-for-unreal-engine | lido direto. Só o mapa |
| Nosso formato | `formato/extensions/BONE_particles.md` e `.schema.json` | lido inteiro até a §12 |
| Nosso editor | `editor/src` (14 arquivos) | lido por um ajudante, com linha; conferi o clique eu mesmo |
| Spine, Spriter, DragonBones | `documentos/pesquisa/nova pesquisa/` | **nenhum dos três tem partícula.** Spine e Spriter têm só um **ponto** para o jogo soltar o efeito |

**O Construct, conferido no painel.** As fotos do Humberto mostram o painel **inteiro**. Onde a tabela diz **"não tem"**, o campo não está no painel. Ações de evento podem fazer mais; dessas, só li as três acima.

### O painel do Construct, inteiro

| Grupo | Campo (como aparece em português) | O nosso |
|:---|:---|:---|
| Propriedades | Taxa | `rate` (no Tiro-único é o **total**) |
| | Ângulo do spray | `spread` (o Construct dá a abertura **inteira**; o nosso, a **metade**) |
| | Tipo: Spray contínuo · Tiro-único | `rate` · `bursts` |
| | Imagem · Objeto | `path` · não temos |
| | Inicialmente visível · Visualizar | — · o nosso sempre mostra |
| Iniciais | Velocidade · Randomizador de velocidade | `speed [min, max]` |
| | Tamanho · Randomizador de tamanho | `scale [min, max]` |
| | Opacidade | `startColor` (o alfa) |
| | Taxa de crescimento · Randomizador | `scaleOverLifetime` (o Construct: **só reta**) |
| | Randomizador X · Randomizador Y | `shape: rectangle` |
| Tempo de vida | Aceleração | **fora** (a não ser negativa, que vira `drag`) |
| | Gravidade | `gravity` (o Construct: **só para baixo**) |
| | Randomizador de ângulo · de velocidade · de opacidade | tremor pelo caminho: **fora** (ver a prateleira do meio) |
| | Modo destrutivo: Esmaecer para invisível · Tempo limite expirado · Partícula parada | `alphaOverLifetime` · `lifetime` · não temos |
| | Tempo limite | `lifetime` |

**Três frases do manual que importam aqui:**

| O manual diz | O que quer dizer para nós |
|:---|:---|
| passar de **algumas centenas** de partículas pode derrubar o quadro | no Construct, o nosso leitor também tem esse teto. É o número para o aviso do editor |
| o modo `Objeto` deixa girar, pôr comportamento e **testar colisão**, mas é mais lento | é o caminho do Construct para "partícula que é entidade" |
| o efeito anda **como a Bullet**: cada partícula é empurrada a cada quadro | o Construct guarda estado; não volta a agulha. Confirma a seção 3 |

**São 21 campos de partícula** (fora Inicialmente visível e Visualizar). **O nosso tem 43.** O Construct não tem: cor, giro, ângulo da imagem, formas, folha animada, semente, ordem, teto, atraso.

---

## 1. A tabela grande

**Pesa?** quer dizer, para o NOSSO leitor:

| Marca | Quer dizer |
|:---|:---|
| **leve** | uma conta fechada por partícula |
| **médio** | uma conta a mais por partícula (a pose do osso no nascimento, a malha deformada) |
| **pesado** | muitas contas por partícula a cada quadro |
| **quebra** | precisa lembrar do quadro anterior. Voltar a agulha muda o desenho. Fere a regra da casa |

**Godot (só GPU)** = existe no `GPUParticles2D` e **não** existe no `CPUParticles2D` (comparei as duas listas).

### Nascer

| Recurso | Exemplo | Construct | Godot | O nosso hoje | Pesa? |
|:---|:---|:---|:---|:---|:---:|
| Taxa contínua | fumaça da chaminé | **sim** · `Rate` | **sim** · `amount` ÷ `lifetime` | **sim** · `rate` | leve |
| Uma rajada só | faísca de espada | **sim** · `Type: One-shot` | **sim** · `one_shot` | **sim** · `bursts` | leve |
| Rajadas repetidas, com chance | fogos de artifício | não tem | não (só `restart`) | **sim** · `cycles`, `interval`, `probability` | leve |
| Ligar e desligar na linha do tempo | tocha que acende | **sim** · ação `Set spraying` | **sim** · `emitting` | **no formato**, sem faixa no editor | leve |
| Taxa que sobe e desce | chuva que engrossa | **sim** · ação `Set rate` | **sim** · `amount_ratio` | **2ª fase** (conta já escrita, §4.2) | leve |
| Todas de uma vez | explosão | **sim** · One-shot | **sim** · `explosiveness` | **sim** · `explosiveness` | leve |
| Atraso para começar | fumaça depois do tiro | não tem | não achei | **sim** · `startDelay` | leve |
| Começar já cheio | fogueira acesa | **sim** · ação `Fast forward` | **sim** · `preprocess` (*"pode ser muito caro"*) | **sim** · `prewarm` | leve (para nós, grátis) |
| Laço sem emenda | cachoeira | contínuo | contínuo | **sim** · `looping` | leve |

### A forma de onde nascem

| Recurso | Exemplo | Construct | Godot | O nosso hoje | Pesa? |
|:---|:---|:---|:---|:---|:---:|
| Ponto | faísca | **sim** | **sim** · `POINT` | **sim** · `point` | leve |
| Retângulo | chuva no céu | **sim** · `X/Y randomiser` | **sim** · `BOX` | **sim** · `rectangle` | leve |
| Círculo, anel, arco | aura, portal | não | **sim** · `SPHERE`, `RING` | **sim** · `circle`, `radiusThickness`, `arc` | leve |
| Linha | fogo ao longo da lâmina | não | não | **sim** · `edge` (sem controle no editor) | leve |
| O osso inteiro | braço em chamas | não | não | **sim** · `bone` | leve |
| Pontos de uma imagem / malha | corpo que vira cinza | não | **sim** · `POINTS` de textura | **sim** · `mesh` | médio |

### Mover

| Recurso | Exemplo | Construct | Godot | O nosso hoje | Pesa? |
|:---|:---|:---|:---|:---|:---:|
| Vida | — | **sim** · `Tempo limite` | **sim** · `lifetime`, `lifetime_randomness` | **sim** · `lifetime [min, max]` | leve |
| Velocidade, com sorteio | — | **sim** · `Speed`, `Speed randomiser` | **sim** · `initial_velocity_min/max` | **sim** · `speed` | leve |
| Direção e abertura | jato de água | **sim** · ângulo do objeto + `Spray cone` | **sim** · `direction`, `spread` | **sim** · `direction`, `spread` | leve |
| Sair para fora do centro | onda de choque | não | **sim** · `radial_velocity` | **sim** · `spherizeDirection` | leve |
| Gravidade | faísca que cai | **sim** · `Gravity` (só para baixo) | **sim** · `gravity` (qualquer lado) | **sim** · `gravity [x, y]` | leve |
| Frear (arrasto) | fumaça que para | aprox. · `Acceleration` negativa | **sim** · `damping` | **sim** · `drag` | leve |
| Acelerar na direção do movimento | foguete | **sim** · `Acceleration` | **sim** · `linear_accel` | **fora** (§12) | quebra |
| Puxar para o centro, girar em volta | redemoinho | não | **sim** · `radial_accel`, `tangential_accel`, `orbit_velocity` | **fora** (§12) | quebra |
| Tremer pelo caminho | brasa ao vento | **sim** · `Angle/Speed randomiser` da vida | **sim** · `turbulence_*` (só GPU) | **fora**; canais 13–15 reservados | quebra (ver 2) |
| Atrair para um ponto | sucção | não | **não em 2D** | **fora** | quebra |
| Herdar a velocidade do emissor | rastro do carro | não | **sim** · `inherit_velocity_ratio` | **fora** | quebra |
| Bater no chão | chuva que quica | só no modo `Objeto`, por evento | **sim** · `collision_mode` (só GPU, só `LightOccluder2D`) | **fora** | quebra |

### Aparência

| Recurso | Exemplo | Construct | Godot | O nosso hoje | Pesa? |
|:---|:---|:---|:---|:---|:---:|
| Ângulo inicial | folhas caindo | não tem (*"sempre quadrados"*); só no modo `Objeto` | **sim** · `angle_min/max` | **sim** · `angle` | leve |
| Giro | folhas caindo | não tem; só no modo `Objeto`, por evento ou comportamento | **sim** · `angular_velocity` | **sim** · `angularVelocity` | leve |
| Apontar para onde vai | faísca riscada | não tem | **sim** · `particle_flag_align_y` | **sim** · `alignToVelocity` | leve |
| Tamanho inicial, com sorteio | — | **sim** · `Size`, `Size randomiser` | **sim** · `scale_min/max` | **sim** · `scale` | leve |
| Tamanho ao longo da vida | fumaça que incha | **só reta** · `Grow rate` | **sim, curva** · `scale_curve` | **no formato**, sem controle no editor | leve |
| Tamanho pela velocidade | faísca que estica | não | **sim** · `scale_over_velocity` | não | leve (cabe) |
| Cor inicial sorteada | confete | não tem (só por quadros de um Sprite no `Objeto`) | **sim** · `color_initial_ramp` | **sim** · `startColor` | leve |
| Cor ao longo da vida | fogo amarelo → vermelho | não tem | **sim** · `color_ramp` | **no formato**, sem controle no editor | leve |
| Sumir aos poucos | fumaça | **só reta** · `Destroy mode: Fade to invisible` | **sim, curva** · `alpha_curve` | **no formato**, sem controle no editor | leve |
| Variar o matiz | arco-íris | não | **sim** · `hue_variation` | não (dá pelo `startColor`) | leve |
| Folha animada | chama desenhada | **só com Sprite** · propriedade `Object` | **sim** · `anim_speed`, `anim_offset` + `CanvasItemMaterial` | **sim** · `sequence`, `frameMode`, `startFrame` | leve |
| Partícula que é um objeto inteiro | morcegos voando | **sim** · `Objeto` (cria Sprites; o manual diz que é **mais lento**) | não | não | pesado |
| Brilho (aditivo) | magia | **sim** · efeito `Additive`, que o manual recomenda | **sim** · `CanvasItemMaterial` | **sim** · o modo do slot | leve |
| Trilha / fita | cometa | não | **sim** · `trail_*` (só GPU) | **fora hoje**; cabe (§12) | pesado |

### Controle

| Recurso | Exemplo | Construct | Godot | O nosso hoje | Pesa? |
|:---|:---|:---|:---|:---|:---:|
| Seguir o osso, ou ficar no mundo | fumaça do trem | não tem | **sim** · `local_coords` | **sim** · `space` | local leve · mundo **médio** |
| Ordem de desenho | — | não tem | **sim** · `draw_order` | **sim** · `sortMode` | leve |
| Teto de vivas | — | não | **sim** · `amount` | **sim** · `maxParticles` | leve |
| Semente fixa | duas fogueiras diferentes | não tem | **sim** · `seed`, `use_fixed_seed` | **sim**, sempre fixa | leve |
| **Voltar a agulha e ver o mesmo quadro** | animar junto com o boneco | **não** | **só para frente** · `request_particles_process` | **sim**. É a regra da casa | leve |
| Sub-emissor no nascimento ou na morte | fogo de artifício que estoura | não | **sim** · `sub_emitter` (só GPU) | **fora hoje**; cabe (§12) | médio |
| Sub-emissor na batida | gota que espirra | não | **sim** (só GPU) | **fora** | quebra |
| Avisar o jogo (partícula morreu → som) | — | não | não | não | é do jogo |

### O Niagara, só o mapa

| O Niagara tem | Serve para nós? |
|:---|:---|
| **Sistema** = vários emissores juntos (fogo = chama + fumaça + faísca) | **Sim, já temos o lugar:** um efeito pode ser uma **entidade** com vários emissores, e encaixa pela conexão. Sem campo novo |
| **Módulos empilhados**, cada um com liga/desliga | **Sim, como desenho da ficha:** Nascer · Forma · Mover · Forças · Cor · Tamanho · Imagem, cada um recolhe |
| **Modelos** prontos | Já temos 4: fogo, fumaça, faísca, poeira |
| Fitas (Ribbon), eventos, colisão, campos de ruído, GPU | Trilha cabe. O resto quebra a regra ou é do jogo |

---

## 2. A proposta, em três prateleiras

### Entra — barato, e quase tudo já está no formato

| O quê | Exemplo |
|:---|:---|
| Taxa, rajadas com ciclos e chance, ligar/desligar, atraso, começar cheio, laço | fumaça, explosão, fogos |
| Formas: ponto, retângulo, círculo, anel, arco, linha, osso | aura, chuva, lâmina em chamas |
| Vida, velocidade, direção, abertura, sair do centro | jato, onda de choque |
| Gravidade e arrasto | faísca que cai, fumaça que para |
| Ângulo, giro, apontar para onde vai | folhas, faísca riscada |
| Tamanho, cor e transparência: no começo **e ao longo da vida** | fogo amarelo → vermelho, fumaça que incha |
| Folha animada | chama desenhada à mão |
| Espaço local, ordem, teto, semente fixa | — |

**O trabalho aqui é de editor, não de formato:** dar controle ao que já existe (rajadas, curvas, gradiente, linha, faixa de ligar/desligar).

### Entra com cuidado — diga o custo

| O quê | Exemplo | O custo |
|:---|:---|:---|
| Espaço do mundo | fumaça do trem que fica para trás | uma pose do osso por partícula. Já no formato |
| Forma de malha | corpo que vira cinza | malha deformada no nascimento. Já no formato |
| Taxa que sobe e desce | chuva que engrossa | conta nova nos dois runtimes. A conta já está escrita |
| **Trilha** | cometa, espada que risca | **pesado**: N posições por partícula. Cabe na regra. Construct não tem |
| **Sub-emissor no nascimento e na morte** | fogo de artifício | médio. Cabe: a morte é um número conhecido. Construct não tem |
| Ruído de deslocamento | brasa tremendo | médio. **Não é** a turbulência do Godot: é um tremor somado, sem memória. Parece igual na tela |
| Girar o caminho em volta do emissor | redemoinho, portal | leve. Cabe girando o caminho inteiro. **Não é igual** ao `orbit_velocity` do Godot |
| Tamanho pela velocidade | faísca que estica | leve. Só o Godot tem |
| Partícula que é uma entidade | morcegos, folhas animadas | **pesado**: cada partícula é um boneco inteiro. Só o Construct tem algo parecido |

### Fica fora — e por quê

| O quê | Por quê |
|:---|:---|
| Colisão e sub-emissor na batida | precisa saber onde a partícula estava no quadro anterior. **Quebra** a agulha para trás. E o editor não conhece o chão do jogo |
| Puxar para o centro, aceleração na direção do movimento | sem conta fechada. Precisa de passo a passo. **Quebra** |
| Turbulência como campo de força | lê a posição atual, que depende da anterior. **Quebra** |
| Atratores | o Godot não tem em 2D. E quebra |
| Herdar a velocidade do emissor | a conta com regras não fecha |
| Semente automática | é o oposto da regra da casa |
| Avisar o jogo quando a partícula morre | o editor prepara, o jogo decide |

---

## 3. A régua do Diretor, com franqueza

**A régua:** *"tem o que o Construct e o Godot conseguem tocar; o que os dois não tocam, não entra."*

| Problema | Por quê |
|:---|:---|
| **Corta demais** | O Construct nativo é pequeno. Só o que os dois tocam **tira**: cor ao longo da vida, giro, ângulo, círculo, anel, linha, folha animada, semente fixa. Sobra uma fumaça cinza |
| **E não resolve a regra da casa** | Nem o Construct nem o Godot voltam a agulha. O Construct nem tem semente. A partícula nativa **nunca** vai ficar igual ao editor |
| **Mede a coisa errada** | O jogo não vai ler partícula nativa. Vai ler o `.bone`, pelo **nosso leitor** (rodadas 18 e 19). O que importa é o que o nosso leitor consegue desenhar, e com que custo |

**A régua que proponho:**

> **Entra o que é função pura do tempo e o nosso leitor desenha barato no Godot e no Construct.**
> Exportar para a partícula nativa da engine é **extra**: o editor avisa o que se perde.

| Com a régua nova | |
|:---|:---|
| Fica igual no editor e no jogo | sim: a conta é a mesma |
| Funciona nas duas engines | sim: o leitor faz a conta |
| Custo | o leitor desenha N quadradinhos por quadro. No Godot dá para fazer num **shader**: cada partícula se calcula sozinha, pelo número dela. É o caso perfeito para a placa de vídeo |
| O que pede de trabalho | as rodadas 18 e 19 desenham partícula. Isso **aumenta** as duas |

O que a régua nova deixa de fora é só a prateleira **fica fora** acima. Colisão é o que mais faz falta. Mas colisão depende do chão do jogo, que o editor não conhece: **é do jogo**.

---

## 4. O que muda no formato

**Para a prateleira "entra": nada.** Os campos já existem.

Campo novo é decisão do Humberto (regra 7). Estas são as perguntas, se ele quiser a prateleira do meio:

| Campo possível | Para quê | Muda os dois runtimes? |
|:---|:---|:---:|
| `x`, `y`, `rotation` no emissor | mover e girar o emissor como uma imagem (ver 5) | sim |
| `rate` animável | chuva que engrossa. **Não é campo novo**: liga a 2ª fase | sim |
| `trail` (comprimento, pedaços) | trilha | sim |
| `subEmitter` (qual, quando: nascer ou morrer) | fogo de artifício | sim |
| ruído (canais 13–15) | brasa tremendo | sim |
| `orbit` | redemoinho | sim |
| partícula que é entidade | morcegos | sim, e grande |

---

## 5. O uso: por que ele não conseguiu

Os quatro defeitos que ele achou **batem com o código**. Linhas conferidas.

| O que ele achou | A causa no código | O que falta |
|:---|:---|:---|
| **Estava na árvore** | o emissor nasce como um slot novo `<osso>_particulas` (`panels/tree-commands.ts:424`). Portas: Esqueleto → Novo, Novo ▾ da Árvore, botão Partículas da cena, Animação → Efeitos de chave | painel **Partículas** próprio, com a lista dos emissores e menu: Novo, os modelos, Duplicar (com semente nova), Apagar, Prender a osso |
| **Não dava para clicar na cena** | o clique pula quem não tem contorno (`viewport/picking.ts:298`). O emissor não tem (`runtime/src/attachments/particle.ts`). Emissor sadio **não tem marca nenhuma** na cena (`viewport-draw.ts:786`) | uma **marca sempre visível** na origem do emissor, e o clique reconhecer essa marca |
| **Não dava para mover nem girar** | Mover e Girar só agem em `region` (`viewport/tools/attachment-edit.ts:75`). E **o emissor não tem posição própria**: a origem é o osso (`particles-view.ts:173`) | **ou** o emissor ganha `x`, `y`, `rotation`, como a imagem (campo novo: pergunta 2) **ou** cada emissor ganha um osso só dele, e mover o emissor move esse osso (sem campo novo) |
| **Não dava para prender a um osso** | existe, mas escondido: arrastar na Árvore, tecla P, ou o campo Osso **do slot**. Na ficha do emissor, "No slot" é só leitura (`properties-model.ts:974`) | campo **Osso** na ficha do emissor, e botão direito na cena → Prender a osso. O mesmo gesto da imagem |

**Mais três que ele vai achar logo depois:**

| Defeito | Onde |
|:---|:---|
| Sem nada escolhido, o emissor nasce preso à **raiz**, que é invisível e não se clica | `panels/tree-actions.ts:138` |
| O emissor "vazio" nasce **sem imagem**: não desenha nada | `panels/tree-commands.ts:391` |
| Os avisos (*"12 partículas cortadas"*) existem no runtime, mas **a cena não os mostra** | `viewport/particles-view.ts:20` |

**A ficha tem 30 campos, e faltam 7:** rajadas, linha (`edge`), tamanho ao longo da vida, cor ao longo da vida, transparência ao longo da vida, cor do anexo, sequência. E falta a faixa de ligar/desligar na linha do tempo.

**Isto é a rodada 15** (partículas: usar). A rodada 16 (o sistema) dá controle à prateleira "entra".

---

## 6. Perguntas para o Humberto

| # | A pergunta | A minha suposição |
|:---:|:---|:---|
| 1 | Troca a régua? *"Entra o que é função pura do tempo e o nosso leitor desenha barato nas duas engines."* | **Sim.** A régua velha tira a cor ao longo da vida e o giro |
| 2 | Para mover e girar o emissor: **campos no emissor** (como a imagem; muda o formato) ou **um osso só dele** (não muda o formato)? | **Campos no emissor.** É o que ele pediu: "como uma imagem". O Spine faz assim com o Ponto |
| 3 | Trilha e sub-emissor (nascer e morrer) entram **depois** que o básico funcionar? | **Sim, depois.** Primeiro clicar, mover, prender e ver |
| 4 | Partícula que é uma entidade inteira (morcegos, folhas animadas)? | **Fica para depois.** Pesa muito |
| 5 | Exportar também para a partícula nativa (Godot e Construct), com aviso do que se perde? | **Não agora.** O nosso leitor faz a conta; a nativa nunca fica igual |

Nenhuma trava a rodada 15: clicar, mover, prender e o painel próprio valem com qualquer resposta. Só a pergunta 2 muda **como** mover é feito.
