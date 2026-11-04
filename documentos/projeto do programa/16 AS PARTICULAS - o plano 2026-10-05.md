# As partículas: o sistema — o plano — 05/10/2026

Rodada 16, parte 1. Escrito pelo chat `PLANEJANDO · rodada 16 — partículas: o sistema` (ref `6e5cf8`).
**Sem código.** O programa **não foi aberto**: às 15h45 havia 0,75 GB livres e o `ESTADO.md` dizia v27.6, não v27.7. Tudo daqui saiu do código, da spec e do schema, com linha.

---

## Em cinco linhas

| # | O plano |
|:---:|:---|
| 1 | **A ficha vira 7 abas com ícone, sem rolar.** No máximo 7 linhas por aba. Só aparecem os campos da forma escolhida. Hoje: 12 grupos, 50 controles, 2.736 px num painel de 343 |
| 2 | **Faltam 8 controles na tela:** rajadas, linha, tamanho na vida, cor na vida, transparência na vida, cor do emissor, folha de quadros e a faixa *Emitindo* na linha do tempo. A cena não desenha **nenhuma** forma |
| 3 | **Seletor de forma com 9 desenhos:** ponto, retângulo, círculo, anel, arco, linha, osso, malha, caminho. Na cena, cada forma tem o seu contorno e as suas alças |
| 4 | **Caminho:** `shape: "path"` e um campo novo `curve`. Nasce ao longo da curva, **por comprimento**, com a curva lida no nascimento. Três casos novos, com o número já calculado aqui |
| 5 | **Peso:** um selo na ficha (*leve · médio · pesado*), pelo número do Godot: ~50 µs por partícula, então 160 vivas ≈ meio quadro. Avisa, nunca impede. **9 lotes**; só 1 mexe no formato |

---

## 1. O que o formato tem e a tela não mostra

Conferido campo a campo contra `editor/src/panels/properties-model.ts:985-1196` (a ficha do emissor), o schema `formato/extensions/BONE_particles.schema.json` e a spec `BONE_particles.md` §9.

| Campo (§) | Tem controle? | Onde, hoje |
|:---|:---:|:---|
| `type` | — | fixo |
| `path` (§9.8) | **sim** | "Imagem da partícula", **texto solto** (`:1164`). Não é lista: nome errado não dá erro |
| `color` (anexo) | **não** | — |
| `emitting` (§9.1) | **meio** | caixa "Emitindo (se anima)" (`:1045`). **Não há como pôr chave**: nenhuma timeline `BONE_particle` no editor |
| `rate` | **sim** | "Taxa por segundo" |
| `bursts` (§4.3) | **não** | só os modelos prontos escrevem (`particle-presets.ts`) |
| `explosiveness`, `duration`, `randomness`, `startDelay` | **sim** | grupo "Quando nasce" |
| `lifetime` [min, max] | **sim** | 2 campos |
| `maxParticles` | **sim** | |
| `x`, `y`, `rotation` (§9.10) | **sim** | "Onde está"; e na cena (rodada 15) |
| `speed` [min, max], `direction`, `spread`, `spherizeDirection`, `alignToVelocity` | **sim** | "Para onde vai" |
| `shape` | **sim** | lista de texto, 6 valores (`:1085`). **Sem desenho, nem na lista nem na cena** |
| `radius`, `radiusThickness`, `arc` | **sim** | sempre à vista, mesmo com forma ponto |
| `size` [w, h] | **sim** | sempre à vista |
| `edge` [x0, y0, x1, y1] (§9.4) | **não** | a forma "linha" se escolhe e nasce tudo em (0,0) |
| `mesh`, `meshMode` | **sim** | lista das malhas do slot |
| `gravity` [x, y], `drag` | **sim** | "Forças" |
| `angle`, `angularVelocity`, `scale` [min, max] | **sim** | "Giro e tamanho" |
| `scaleOverLifetime` (§9.6) | **não** | só os modelos |
| `startColor` [de, até] | **sim** | 2 cores |
| `colorOverLifetime` (§9.7) | **não** | só os modelos (fogo) |
| `alphaOverLifetime` | **não** | só os modelos (fumaça) |
| `sequence` (§9.8) | **não** | `frameMode`, `cycles`, `fps`, `startFrame` aparecem **sem** a folha que eles animam |
| `frameMode`, `cycles`, `fps`, `startFrame` | **sim** | sempre à vista, mesmo sem folha |
| `space`, `seed`, `looping`, `prewarm`, `sortMode` | **sim** | "O emissor" e "A volta e a ordem" |
| campos **N** e **T** animáveis (§9, timeline `BONE_particle`) | **não** | velocidade, direção, gravidade, raio… nenhum ganha chave |

| Conta | |
|:---|:---|
| Campos no schema | 47 (fora `type`, `extensions`, `extras`) |
| Com controle | 39 |
| **Sem nada** | `color`, `bursts`, `edge`, `scaleOverLifetime`, `colorOverLifetime`, `alphaOverLifetime`, `sequence` · e a chave de `emitting` |
| **Na cena** | só a estrela e o traço da direção (`viewport-draw.ts`, rodada 15). **Nenhum contorno de forma** |
| Na ficha | 12 grupos, 50 controles, **todos sempre à vista**. É daí que vêm os 2.736 px |

---

## 2. A ficha do emissor

### Como os outros arrumam

| Programa | Como é | Copio | Não copio |
|:---|:---|:---|:---|
| **Unity** — [Particle System modules](https://docs.unity3d.com/Manual/ParticleSystemModules.html) | ~20 módulos empilhados; cada um recolhe e tem um liga/desliga | **um assunto por grupo**; a curva e o gradiente **dentro** do campo, pequenos | a pilha comprida que rola; letra miúda; 20 módulos abertos |
| **Godot** — [ParticleProcessMaterial](https://docs.godotengine.org/en/stable/classes/class_particleprocessmaterial.html), [2D particles](https://docs.godotengine.org/en/stable/tutorials/2d/particle_systems_2d.html) | seções recolhidas; **a forma escolhida mostra só os campos dela** | **só os campos da forma**; seções fechadas de fábrica | a curva é um recurso à parte (`CurveTexture`): três cliques para criar |
| **Niagara** — [visão geral](https://dev.epicgames.com/documentation/en-us/unreal-engine/overview-of-niagara-effects-for-unreal-engine) | pilha na ordem da vida: nascer → atualizar → desenhar | **a ordem das abas segue a vida** da partícula | módulos que se somam; grafo de script |
| **Spine, Spriter** | não têm partícula (pesquisa `06`) | — | — |

*Os três links são os da pesquisa `06` e do meu conhecimento; não os reabri hoje.*

### A régua do desenho

| Régua | Por quê |
|:---|:---|
| **Abas dentro da ficha, sem rolar** | memória "os painéis do jeito dele": rolar só palco e lista |
| **No máximo 7 linhas por aba** | 1 linha ≈ 27 px (2.736 ÷ 100 rótulos, `CHANGELOG`). Em 1440×900 o painel tem 343 px: 32 de topo + 7 × 27 = 221. Sobra folga para a curva |
| **Faixa [min, max] numa linha só** | hoje é 2 linhas. `Vida  [1,0] – [2,0] s` |
| **Só o que vale aparece** | a forma mostra só os seus campos; `fps` só com "por segundo"; `Pré-aquecer` só sem repetir |
| **Ícone com o nome na dica** | regra 12 e memória "menus em ícone" |
| **Rótulo curto, coluna de 130 px** | os rótulos longos quebravam em 3 linhas (`CHANGELOG`, 306 px) |

### As 7 abas

| Aba | Ícone | O que tem (linhas) |
|:---|:---:|:---|
| **Nascer** | ✦ | Emitindo · Taxa/s · Vida min–máx · Máx. vivas · **Rajadas** (lista) · ▸ mais: Atraso, Explosividade, Janela, Tremor |
| **Forma** | ◯ | **o seletor** (2 linhas de ícones) · Osso · X Y Giro (1 linha) · os campos **da forma** (0 a 3 linhas) |
| **Movimento** | ➶ | Velocidade min–máx · Direção · Abertura · Sair do centro · Gravidade X Y · Arrasto |
| **Tamanho e giro** | ⤢ | Tamanho min–máx · **Tamanho na vida** (curva) · Giro inicial min–máx · Giro/s min–máx · Virar para onde vai |
| **Cor** | ◐ | Cor ao nascer de–até · **Cor na vida** (gradiente) · **Some na vida** (curva) · Cor do emissor |
| **Imagem** | ▦ | Imagem (**lista** do atlas) · **Folha** (nenhuma / quadros) · A folha corre · Voltas *ou* Quadros/s · Quadro de partida |
| **Mais** | ⚙ | Espaço · Semente + ⟳ (nova) · Repetir · Pré-aquecer · Quem fica na frente |

**O topo, fixo, uma linha:** as 7 abas à esquerda, o **selo de peso** à direita. O nome do emissor já está no título do painel ("Emissor: fumaça"); renomear vai para o duplo clique no título e para a lista do painel Partículas.

### O desenho, nas três telas

**1440×900** (painel ≈ 343 px; medido). Aba Forma, círculo escolhido:

```
┌─ Emissor: fumaça ────────────────────────────┐
│ [✦][◯][➶][⤢][◐][▦][⚙]          ● leve · 38  │
├──────────────────────────────────────────────┤
│  [·] [▭] [◯] [◎] [◔]                        │
│  [╱] [🦴] [▲] [〰]                            │
│ Osso        │ [ mão_d            ▾]         │
│ X  Y  Giro  │ [  12 ] [ -4 ] [  0°]         │
│ Raio        │ [  40 ]                        │
│ Anel        │ [ 1,00 ]  (0 borda · 1 cheio)  │
│ Trecho      │ [ 360° ]                       │
└──────────────────────────────────────────────┘
   7 linhas + topo ≈ 32 + 7×27 = 221 px  ✔
```

**1280×720** (painel ≈ 230 px — **estimado**, não medido). A mesma aba; o seletor vira **uma** linha de ícones menores e o resto é igual:

```
┌─ Emissor: fumaça ─────────────────────┐
│ [✦][◯][➶][⤢][◐][▦][⚙]   ● leve · 38  │
├───────────────────────────────────────┤
│ [·][▭][◯][◎][◔][╱][🦴][▲][〰]         │
│ Osso      │ [ mão_d       ▾]          │
│ X Y Giro  │ [ 12][ -4][  0°]          │
│ Raio      │ [ 40 ]                    │
│ Anel      │ [1,00]                    │
│ Trecho    │ [360°]                    │
└───────────────────────────────────────┘
   6 linhas + topo ≈ 194 px  ✔
```

**1920×1080** (a do Humberto; painel maior — **não medido**). As mesmas abas. O que sobra vai para as curvas e o gradiente, que crescem para 72 px. **Não** abro tudo numa coluna só: a mesma ficha nas três telas, para a mão aprender um lugar.

```
┌─ Emissor: fogo ──────────────────────────────────────┐
│ [✦][◯][➶][⤢][◐][▦][⚙]                  ● médio · 120 │
├──────────────────────────────────────────────────────┤
│ Cor ao nascer │ [■ amarelo] – [■ laranja]           │
│ Cor na vida   │ ▕█████▓▓▓▒▒▒░░░▏  ◆      ◆      ◆   │
│ Some na vida  │  1 ┤‾‾‾‾‾‾‾‾╲                       │
│               │  0 ┤         ╲___________  [some ▾]│
│ Cor do emiss. │ [■ branco]                          │
└──────────────────────────────────────────────────────┘
```

**A aba Nascer, com rajadas:**

```
┌─ Emissor: faísca ────────────────────────────┐
│ [✦][◯][➶][⤢][◐][▦][⚙]         ● leve · 24   │
├──────────────────────────────────────────────┤
│ Emitindo    │ [☐]                            │
│ Taxa/s      │ [  0 ]                         │
│ Vida (s)    │ [0,4] – [0,8]                  │
│ Máx. vivas  │ [ 200 ]                        │
│ Rajadas  [+]│ 0,0 s · 24 · ×1 · 100%      ✕  │
│             │ 0,5 s · 12 · ×3 a cada 0,2  ✕  │
│ ▸ mais (atraso, explosividade, tremor)       │
└──────────────────────────────────────────────┘
```

---

## 3. O seletor de forma

O formato tem 6 formas. **Anel e arco não são formas novas**: são o círculo com `radiusThickness` e `arc`. No seletor eles têm botão próprio, que escreve o círculo com valores de partida. O caminho é a forma nova (seção 5).

| Botão | Grava | Campos na aba | Desenho na cena | Alças |
|:---|:---|:---|:---|:---|
| **Ponto** | `point` | nenhum | a estrela (já existe) | — |
| **Retângulo** | `rectangle` | Largura, Altura | contorno tracejado, centrado na origem | 4 cantos: arrastar muda `size` dos dois lados |
| **Círculo** | `circle`, `radiusThickness 1`, `arc 360` | Raio, Anel, Trecho | o círculo | ● na borda: `radius` |
| **Anel** | `circle`, `radiusThickness 0,2` | idem | o círculo e o de dentro, tracejado | ● borda: raio · ◆ círculo de dentro: anel |
| **Arco** | `circle`, `arc 90` | idem | a fatia de 0° até `arc` | ● borda · ▸ na ponta do arco: `arc` |
| **Linha** | `edge` | Início X Y · Fim X Y | o segmento | ● nas duas pontas: `edge` |
| **Osso** | `bone` | nenhum ("o comprimento é o do osso") | o segmento ao longo do osso, em destaque | nenhuma |
| **Malha** | `mesh` | Malha · Onde (vértices, arestas, triângulos) | a malha tracejada; pontos onde nasce | nenhuma (a malha se edita na Malha) |
| **Caminho** | `path` + `curve` | Curva · (só lista) | a curva em destaque, com pontinhos | nenhuma; botão "Editar a curva" leva à ferramenta Caminho |

| Regra do seletor | |
|:---|:---|
| Cada botão **mostra o desenho** da forma (ícone em `ui/icons.ts`), com o nome na dica | pedido do Humberto |
| Trocar de forma **não apaga** os campos das outras | voltar ao círculo devolve o raio de antes |
| Malha sem malha no slot, caminho sem curva | botão **cinza**, e a dica diz por quê |
| As alças só aparecem com o emissor escolhido | como a caixa da imagem |
| Arrastar alça = um `SetProperty` por arrasto, desfaz de uma vez | como mover hoje |

---

## 4. Rajadas, curvas e gradiente

| Coisa | O editor | Reaproveita |
|:---|:---|:---|
| **Rajadas** (`bursts`) | lista na aba Nascer: uma linha por rajada (*"0,5 s · 12 · ×3 a cada 0,2 · 100%"*), **+** e **✕**. Clicar na linha abre uma janelinha com 5 campos: Quando, Quantas, Vezes, Intervalo, Chance | a janelinha flutuante que o Novo ▾ já usa (`openFloatingMenu`) |
| **Tamanho na vida**, **Some na vida** (`scaleOverLifetime`, `alphaOverLifetime`) | **curva pequena dentro da ficha**: eixo X é a vida (0 a 1). Clique põe ponto, arrasta, botão direito tira. Ao lado, ▾ com prontos: *cresce · encolhe · pulsa · some no fim · aparece e some* | **sim, a metade pura:** `editor/src/anim/curves.ts` (`readCurve`, `writeCurve`, `presetShape`) é módulo puro e as chaves têm o mesmo formato `{time, value, curve}` (§9.6 diz: *"reusa a §9.2–9.3 da spec"*). **O painel Curvas (`panels/graph.ts`) não**: ele escreve por `SetKey` dentro de uma animação; aqui é um `SetProperty` no anexo |
| **Cor na vida** (`colorOverLifetime`) | **faixa de gradiente**: losangos são as cores; clique na faixa põe cor; arrastar move; duplo clique abre o seletor de cor que a ficha já tem | o campo de cor da ficha |
| **Cor do emissor** (`color`) | um campo de cor | o mesmo |
| **Folha** (`sequence`) | lista: *nenhuma* ou *quadros*; com quadros, Quantos e o nome-base, como a sequência da imagem | o que a imagem já usa para `sequence` |
| **Emitindo na linha do tempo** | uma faixa de liga/desliga (chave *stepped*) na folha de chaves, com a linha do emissor | a chave de evento já desenha losangos *stepped* |

---

## 5. A forma nova: ao longo de um caminho

### O valor novo (a menor mudança)

| Onde | O que muda |
|:---|:---|
| `shape` | o `enum` ganha **`"path"`** |
| campo novo **`curve`** | string, `"x-since": "1.1"` da extensão. O nome do **slot** e do anexo `path`, como `"<slot>/<anexo>"`. **Não** se chama `path`: esse nome já é a imagem da partícula (§9.8) |
| `extensions/BONE_particles.md` | §9.4 ganha a linha `path` e a §9.4.2 com a conta. A versão da extensão vai de 1.0 para **1.1** |
| validador | L1 `REF_PARTICLE_CURVE`: `curve` não aponta para um anexo `path` |
| canais | **nenhum canal novo.** Usa o canal 3, como a linha |

**Por que de outro slot, e não do mesmo, como a malha:** um slot mostra um anexo de cada vez, e o caminho que o programa já tem (`cape_path` do herói) mora no slot dele. Prender ao mesmo slot obrigaria a copiar a curva. **É a pergunta 2 para o Humberto.**

### A conta

```
1. W = vértices do caminho em t_i, no espaço do esqueleto
       (o osso do slot do caminho em t_i, e o deform em t_i — igual à malha)
2. comprimento: cada curva em 10 segmentos (t = 0,1 … 1), a mesma régua da §6.4
       total = soma; fechado inclui a curva que volta
3. s  = u3 · total
4. p0 = o ponto a s do começo, na poligonal dos 10 segmentos
       (interpolação reta dentro do segmento — a mesma de constantSpeed: true)
5. em local: p0 volta pela inversa de M_emissor(t_i)   (igual à malha, §9.10)
```

| Regra | Por quê |
|:---|:---|
| **Sempre por comprimento**, ignora o `constantSpeed` do caminho | a partícula se espalha por igual na curva. Com `t` uniforme, junta onde as alças estão perto |
| **Lido em `t_i`** | é a mesma régua da malha (§9.4): **função pura do tempo**. Caminho animado (osso ou deform) muda **onde nascem as novas**; as que já nasceram não pulam |
| `spherizeDirection` | igual às outras formas: sai de `atan2(p0)` (`emitter.ts:509`). Nada novo |
| Caminho com pesos | `W` vem do `binding`. **Exige nível B**, como a malha |
| Curva ausente, ou não é `path` | **não desenha o emissor e avisa** (regra 21) |

### A conta à mão, para um caminho simples

Os `u` saem do PCG da §3.2. Calculei com uma conta minha, escrita pela spec, e ela deu **os cinco números de referência da §3.2**, bit a bit. **Não** usei o runtime.

**P-021 — reta com alças juntas: prova que é por comprimento.** Duas âncoras, `A0 = (0,0)` com alça de saída `(0,0)`, `A1 = (300,0)` com alça de chegada `(300,0)`. É uma reta, mas a velocidade não é uniforme: `x(t) = 300·(3t² − 2t³)`. Rajada única em 0 s, 4 partículas, semente 42, `speed [0,0]`, emissor e caminho no mesmo osso, parado. Fluxo 1, índice j.

| j | `u3 = acaso(42, 1, j, 3)` | **p0 esperado** (por comprimento) | o que um leitor errado daria (`t = u3`) |
|:---:|:---|:---|:---|
| 0 | 0,10603183507919312 | **(31,809551 ; 0)** | (9,403221 ; 0) |
| 1 | 0,41712987422943115 | **(125,138962 ; 0)** | (113,049908 ; 0) |
| 2 | 0,9260824918746948 | **(277,824748 ; 0)** | (295,324904 ; 0) |
| 3 | 0,1838092803955078 | **(55,142784 ; 0)** | (26,681175 ; 0) |

Na reta, a poligonal de 10 segmentos cai em cima da curva: `p0 = (300·u3, 0)`, **exato**. A diferença contra o leitor errado é de 12 a 28 px; a tolerância é `1e-3`.

**P-022 — caminho animado: prova que é lido em `t_i`.** A mesma reta, agora com alças nos terços (`(100,0)` e `(200,0)`). Uma timeline `deform` sobe os 6 pontos do caminho de `y = 0` em 0 s para `y = 100` em 1 s, reta. Taxa 10/s, fluxo 0, `lifetime [2,2]`, `speed [0,0]`, sem tremor. Avaliar em **t = 0,55**: vivas i = 0 a 5, `t_i = i/10`.

| i | `t_i` | `u3 = acaso(42, 0, i, 3)` | **p0 esperado** | lido em `t` (errado) |
|:---:|:---:|:---|:---|:---|
| 0 | 0,0 | 0,37800759077072144 | **(113,402277 ; 0)** | y = 55 |
| 1 | 0,1 | 0,6948435306549072 | **(208,453059 ; 10)** | y = 55 |
| 2 | 0,2 | 0,34377390146255493 | **(103,132170 ; 20)** | y = 55 |
| 3 | 0,3 | 0,7216458320617676 | **(216,493750 ; 30)** | y = 55 |
| 4 | 0,4 | 0,25121110677719116 | **(75,363332 ; 40)** | y = 55 |
| 5 | 0,5 | 0,2359306812286377 | **(70,779204 ; 50)** | y = 55 |

**P-023 — caminho em outro slot, com o emissor deslocado.** O caminho do P-021 num slot `trilha` do osso `root`; o emissor num osso filho em `(50, 0)`, com `x = 10`. Em `local`, o p0 tem de voltar pela inversa de `M_emissor`: o esperado é o do P-021 **menos (60, 0)**: j=0 → **(−28,190449 ; 0)**, j=1 → **(65,138962 ; 0)**, j=2 → **(217,824748 ; 0)**, j=3 → **(−4,857216 ; 0)**. Na tela, as partículas ficam **em cima da curva**.

*Quem escreve o caso não escreve o runtime (regra 26). O executor do lote 7 tem de ver cada caso vermelho antes do conserto. Os `t_i = i/10` do P-022 supõem a taxa fixa da §4.2 sem tremor: o executor confere isso primeiro.*

### O leitor velho

| Leitor | Com um arquivo que tem `shape: "path"` |
|:---|:---|
| Sem P | ignora o emissor e avisa (§7.3). **Igual a hoje** |
| Com P 1.0 (o de hoje, o Godot, o Construct) | **não desenha o emissor e avisa uma vez** — §7.4: forma desconhecida não cai para ponto. **Já está escrito; ninguém desenha errado calado** |
| O validador 1.0 | o `enum` recusa `"path"`: **L1**. Um arquivo novo num validador velho dá erro, não passa calado. Custo aceito |

---

## 6. O balanceamento

### O número

| Medida | Fonte |
|:---|:---|
| Godot: ~**50 µs por partícula**, sem ponto barato | G8, `03`: 10 heróis com faíscas, 34 a 37 ms (a ficha diz 54 a 58; máquina a 40% com outros chats) |
| Construct: *"algumas centenas"* derrubam o quadro | manual, pesquisa `06`; o K6 já avisa acima de **300 vivas** num emissor |
| Um quadro a 60 fps | 16,7 ms |

**Conta:** se as partículas puderem gastar **meio quadro** (8 ms), cabem 8.000 ÷ 50 = **160 vivas na tela**, contando **todos** os bonecos.

### O selo de peso, no topo da ficha

`vivas esperadas = min(maxParticles, rate × vida.máx + rajadas que caem dentro de uma vida)`

| Selo | Por emissor | Pelo boneco inteiro (soma) | O que diz a dica |
|:---|:---:|:---:|:---|
| ● **leve** (verde) | até 60 | até 100 | — |
| ● **médio** (amarelo) | 61 a 150 | 101 a 300 | *"No Godot, ~N ms por quadro para cada boneco assim."* |
| ● **pesado** (vermelho) | acima de 150 | acima de 300 | *"Acima do que o Construct aguenta (algumas centenas). Baixe a taxa ou a vida, ou ponha um Máx. vivas."* |

| O que mais pesa, e o selo diz | Por quê |
|:---|:---|
| Espaço **do mundo** | uma pose do esqueleto por nascimento. Teto da spec: 256 por quadro (§10) |
| Forma **malha** ou **caminho** | malha ou curva deformada por nascimento |
| Trilha, sub-emissor (depois) | N posições por partícula |

| Regra | |
|:---|:---|
| **Avisa, nunca impede** | o Humberto decide; o jogo pode ter um só boneco |
| O aviso vai na barra de avisos também | regra 21 |
| O número é do **leitor**, e o editor diz qual | *"medido no Godot, 05/10"*. Quando o leitor ficar mais rápido (shader), troca-se o número num lugar só |

---

## 7. Os lotes

Do que mais muda a vida dele para o que menos. **Um lote, uma versão.**

| # | Lote | Mexe em | Modelo |
|:---:|:---|:---|:---|
| 1 | **A ficha em 7 abas**, sem rolar; só os campos da forma; faixa numa linha; Imagem vira lista. Medir: **0 px** sobrando nas três telas | editor | Opus |
| 2 | **O seletor de forma** com os 9 desenhos (o caminho cinza até o lote 8) e os campos da **linha** | editor | Opus |
| 3 | **A forma na cena**: contorno e alças de círculo, anel, arco, retângulo, linha; destaque de osso e malha | editor | Opus |
| 4 | **Curvas e gradiente**: tamanho na vida, some na vida, cor na vida, cor do emissor | editor | Opus |
| 5 | **Rajadas**: a lista e a janelinha | editor | Opus |
| 6 | **O selo de peso** e o aviso na barra | editor | Opus |
| 7 | **O caminho no formato**: spec §9.4, schema, validador, os 3 casos, runtime TS e Python. O Construct se remonta sozinho (`npm run leitor:construct`); o Godot copia do Python | **formato, runtimes, conformidade, leitores** | **o mais forte** |
| 8 | **O caminho no editor**: o botão acende, a lista de curvas, o destaque na cena | editor | Opus |
| 9 | **Folha de quadros** e **Emitindo na linha do tempo** | editor | Opus |

| Notas | |
|:---|:---|
| O lote 7 não depende de 1 a 6 | pode correr **em paralelo**, noutro chat, se a máquina deixar |
| Os campos animáveis N e T (velocidade, direção, raio…) | **ficam fora** desta rodada: só `emitting` ganha chave. Pôr chave em tudo é uma rodada própria |
| Trilha e sub-emissor | **depois**, como o Humberto decidiu |

---

## 8. O que eu não sei

| Não sei | Como saber |
|:---|:---|
| A altura do painel em **1280×720** e em **1920×1080** | o lote 1 mede, com `npm run medir`, antes de desenhar |
| Se 27 px por linha vale para todos os campos (a cor, a lista) | idem |
| Se a ficha já tem um componente de **aba** que eu possa usar | não achei em `panels/properties.ts` (os grupos são `fieldset` sem recolher). Talvez o lote 1 escreva um |
| Se os 50 µs do Godot valem fora daquela máquina, e se um **shader** os derruba | não medi. O selo diz de onde vem o número |
| Se o Humberto quer anel e arco como botões próprios, já que no arquivo são círculo | suposição: sim, ele os nomeou |
| Se `"x-since": "1.1"` é o número certo para a extensão | suposição minha; o formato decide |
| A ficha de hoje, na tela | **não vi**: a máquina não deixou. Fotos em `backup/fotos-obra/rodada-16/` ficam para o lote 1 |

---

## 9. Perguntas para o Humberto

| # | Pergunta | Minha sugestão |
|:---:|:---|:---|
| 1 | A ficha do emissor vira **7 abas com ícone**, sem rolar, a mesma nas três telas? | **Sim** |
| 2 | O caminho pode ser **de outro slot** (a capa do herói), e não só do mesmo slot do emissor? | **Sim, de qualquer slot** |
| 3 | O selo de peso: **verde até 60, amarelo até 150, vermelho acima** por emissor (100 e 300 pelo boneco)? Só avisa, nunca impede | **Sim** |
| 4 | Pôr chave em velocidade, direção, raio e os outros fica para **outra rodada**; nesta só *Emitindo* ganha chave? | **Sim, outra rodada** |

---

## Desvios

*(o executor escreve aqui)*

### Lote 1 — 05/10/2026, 16h08

| Desvio | Por quê |
|:---|:---|
| **8 abas, não 7**: Nascer · **Tempo** · **Lugar** · Forma · Movimento · Giro e tamanho · Cor · Imagem | com 6 linhas por aba (a pior tela) não cabia: o Tempo leva explosividade, janela, tremor, repetir e pré-aquecer; o Lugar leva nome, osso, X·Y, giro e espaço. A aba "Mais" sumiu: a semente foi para Nascer, a ordem para Imagem |
| `LINHAS_POR_ABA = 6`, um número só em `panels/particle-sheet.ts` | ordem do Diretor: a altura das três telas ainda não foi medida |
| Sem o "▸ mais" dentro da aba Nascer | com a aba Tempo, não precisou |
| O nome continua na ficha (aba Lugar) | renomear pelo título fica para depois; nenhum controle some |
| O selo de peso não está no topo ainda | é o lote 6. A barra de abas mostra o nome da aba aberta no lugar |
| A Imagem não virou lista neste lote | o campo já usa o botão da imagem quando a escolha tem alvo (`properties.ts`, lote 60). **Conferir na foto** |
| A medição (`ferramentas/provas/medir-paineis.mjs`) **não mede a ficha do emissor** | ela mede a malha `face` e a regra `look_driver`. Falta uma terceira passada: o emissor escolhido, aba por aba. Está fora da cerca deste lote: pedido ao Diretor |

### Lote 1, no fecho (v27.8) — 05/10/2026, 16h28

| Desvio | Por quê |
|:---|:---|
| **9 abas**, e `LINHAS_POR_ABA = 5` | medido: em 1280×720 o painel tem **187 px**, não os ~230 estimados. Entraram **Forças** (gravidade, arrasto, espaço) e **Mais** (nome, semente, ordem); Giro e Cor viraram **Tamanho, giro e cor** |
| A Ficha rápida mora na aba Lugar | em cima das abas ela comia 140 dos 187 px |
| O bloco Chave de evento não aparece sob o emissor | empurrava a ficha para fora |
| O nome da aba vai na frente do título do painel, numa linha só | ao lado dos ícones, quebrava a barra; no fim do título, quebrava o título |
| Rótulo curto na aba, o inteiro na dica | os rótulos longos quebravam em duas linhas |

### Lote 2 (v27.9) — 16h42

| Desvio | Por quê |
|:---|:---|
| O nome da forma escolhida não está escrito, só aceso e na dica | não coube na linha dos nove botões. A cena (lote 3) mostra qual é |

### Lote 3 (v28.0) — 16h53

| Desvio | Por quê |
|:---|:---|
| Osso e malha sem alça | o comprimento é do osso; a malha se edita na Malha |
| Ponta da linha na origem fica sem alça | ela roubaria o clique da estrela (mover). Digita-se no campo |
| As alças só no emissor escolhido | dez círculos ao mesmo tempo seriam ruído |

### Lotes 4 e 5, e os consertos da conferência (v28.1) — 17h23

| Desvio | Por quê |
|:---|:---|
| **10 abas**: Tamanho e giro, e Cor, separadas | a curva conta duas linhas; juntas não cabiam em cinco |
| As rajadas numa **janelinha**, não na aba | a lista não cabe numa aba de cinco linhas, e rolar a ficha está fora |
| O atraso foi para Tempo; explosividade e janela dividem uma linha | abrir lugar para as Rajadas em Nascer |
| A curva e o gradiente gravam ao soltar | o painel se refaz a cada escrita; gravar no meio do arrasto perderia o arrasto |
| **O conserto 5 não era o teto**: o `ParticleCache` do desenhador do runtime guarda a curva pelo nome e nunca a esquece | consertado do lado do editor (a cena troca de desenhador quando o arquivo muda). **O defeito de fundo continua no `runtime/src/render/canvas.ts`**: quem recarregar um arquivo no mesmo desenhador tem o mesmo problema. É do runtime, e fica para quem pode mexer lá |

### Lote 6 (v28.2) e lote 9 (v28.3) — 17h45

| Desvio | Por quê |
|:---|:---|
| O selo vai na frente do **título** da ficha, não numa linha própria | as abas usam as cinco linhas inteiras em 1280×720 |
| Na barra de avisos, só o **pesado** | o médio fica no selo: aviso que aparece sempre deixa de ser lido |
| As vivas do selo são uma estimativa de cima, sem rodar o tempo | taxa × vida máxima + a pior janela de rajadas, até o teto |
| Emitindo: a chave do começo nasce junto | é a regra do editor para toda primeira chave; dá o mesmo par do caso P-016 |
| A folha de quadros só por número (quadros, primeiro, dígitos) | a lista explícita (`frames`) da §7.10 não tem campo; um arquivo que a traz continua valendo |
| Os outros campos animáveis do emissor (velocidade, direção…) | não ganham chave nesta rodada, como decidido (pergunta 4) |

### Lote 7 — o caminho no formato e no runtime TypeScript — 18h12

Pelo `EXECUTANDO · rodada 16, lote 7`. Sem versão ainda: o fecho vem com o "pode fechar".

| Desvio | Por quê |
|:---|:---|
| **P-023: o esperado é o do P-021, e não "menos (60, 0)"** | o dump dá `x`, `y` **sempre no espaço do esqueleto** (§14.1 da extensão). O "menos (60, 0)" é o `p0` local, que o dump não mostra. O leitor que esquece a inversa dá **mais** (60, 0), e é isso que o caso separa. Avisado ao Diretor às 17h53 |
| O P-021 traz `constantSpeed: false` | para o caso pegar também o leitor que obedece o `constantSpeed` do caminho, além do que usa `t = u3` |
| Os cinco casos em `casos/` com **duas** fontes | a ficha manda; a §14 da extensão pede três. Cada `leiame` diz "duas", e o teste das ferramentas aceita "duas" ou "três" só para esses cinco |
| O validador mora em `site/validador/nucleo.js`, não em `ferramentas/src/` | é onde o `REF_PARTICLE_MESH` já morava; o `esquema-compilado.js` foi remontado pelo `construir-esquema.mjs` |
| O slot do `curve` é o texto antes da **primeira** barra | placeholder costuma ter barra (`fx/faisca`); nome de slot, não. Escrito na §9.4.2 |
| O `ParticleCache` passou a ser chaveado por **identidade** (anexo, animação, dados) | é o defeito do `canvas.ts:214`; a pilha de peles entrou na chave do poser também |
| **P-026, do confronto com o Python (18h21)**: em `world` o TypeScript levava o ponto do caminho ao esqueleto **duas vezes**, e media o `spherizeDirection` no ponto do esqueleto | regra nova no passo 7 da §9.4.2: o ponto volta ao referencial do emissor **nos dois espaços**, e daí é um `p0` como o de qualquer forma. A §7.2 e a linha da malha na §9.10 dizem o mesmo. **A malha em `world` mudou de número junto** (tinha o mesmo defeito, sem caso que olhasse). Vermelho às 18h25, verde no mesmo minuto; Python bateu com a conta de primeira; dois runtimes 110/110 às 18h26 |

### Rodada 35, para depois — anotado no fecho da v28.8 (21h03)

| Achado | O que falta |
|:---|:---|
| **A fronteira de passo da física se perde por arredondamento** (achado do chat do Python): com `physicsDt` igual a `1/60` exato, o C-326 dá 0,082562; com o literal da sonda, `0.0166666666666667`, dá 0,162830. Na fronteira de um passo, um passo se ganha ou se perde conforme o arredondamento do `dt` | a §6.5 da spec deveria dizer **como comparar a fronteira** (por exemplo, com a mesma tolerância relativa que o `pose-dump` usa para casar amostra e passo, `dt × 1e-6`). Não é para agora: pedido do Diretor |
