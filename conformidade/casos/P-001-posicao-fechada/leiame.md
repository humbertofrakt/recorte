# P-001 — posição fechada, sem pose

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §3.2, §3.3, §4.1, §8, §9 |
| Esperado | calculado por duas implementações independentes (JS e Python) escritas só pela spec, **mesmo bit** |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## O que este caso prova

Que a posição de uma partícula é **conta fechada da idade**, e não uma soma de
passos. Nada aqui depende de quantos quadros foram desenhados antes, nem do
tamanho do passo, nem da ordem em que as partículas foram visitadas.

É o caso que separa este formato de Godot e Unity. Os dois simulam para frente;
aqui, `t = 0.5` dá este quadro **na primeira vez e na milésima**.

## O emissor

| Campo | Valor |
|:---|:---|
| `seed` | `42` |
| `rate` | `20` (fixo — 1ª fase) |
| `lifetime` | `[1, 1.5]` |
| `speed` | `[100, 150]` |
| `direction` / `spread` | `90` / `30` |
| `shape` | `circle`, `radius 10`, `radiusThickness 1`, `arc 360` |
| `gravity` / `drag` | `[0, −200]` / `0.5` |
| `angle` / `angularVelocity` | `[0, 360]` / `[−90, 90]` |
| `scale` | `[0.5, 1]` |
| `space` / `looping` | `local` / `false` |

O osso `emissor` é identidade e não é animado: em `local`, o espaço do osso e o
do esqueleto são o mesmo, e a conta sai limpa de pose.

## A conta, passo a passo, da partícula (fluxo 0, índice 7)

Esta é a partícula do meio da lista, e é a que a pesquisa calculou à mão.

**Os oito `u`** — `acaso(42, 0, 7, canal)`, canais 0 a 7:

```
u0 = 0.4190843105316162     u4 = 0.19983172416687012
u1 = 0.23967969417572021    u5 = 0.6782218217849731
u2 = 0.343410849571228      u6 = 0.7587399482727051
u3 = 0.08769738674163818    u7 = 0.40017545223236084
```

**Nascimento (§4.1).** `rate` fixo em 20: `t_i = i / 20 = 7 / 20 = 0.35`.
Em `t = 0.5`, a idade é `a = 0.15`.

**Vida (canal 0).** `1 + (1.5 − 1) × u0 = 1.209542`. Viva, com folga.

**Onde nasce (§9.4).** `radiusThickness 1` zera o termo de dentro:

```
r  = 10 × sqrt(u3) = 2.961374
φ  = u4 × 360°     = 71.939421°
p0 = (0.918092, 2.815465)
```

**Com que velocidade (§9.3).**

```
speed = 100 + 50 × u1 = 111.983985
θ     = 90 + 30 × (2·u2 − 1) = 80.604651°
v0    = speed × (cos θ, sin θ) = (18.280924, 110.481766)
```

**Onde está (§8).** `k = 0.5` é maior que `0.00001`, então vale o ramo com
`expm1`:

```
F = −expm1(−0.5 × 0.15) / 0.5 = 0.144513
g/k = (0, −400)
p(a) = p0 + (g/k)·a + (v0 − g/k)·F = (3.559924, 16.586731)
```

**Rotação e tamanho.**

```
angle_i           = 0 + 360 × u5 = 244.159856°
angularVelocity_i = −90 + 180 × u6 = 46.573191°/s
θ(a)              = 244.159856 + 46.573191 × 0.15 = 251.145834°
scale_i           = 0.5 + 0.5 × u7 = 0.700088
```

O ângulo sai **como está**, `251.145834`, e não reduzido a `−180..180`
(`-108.854166`). Um leitor que reduza falha o caso, e o
aviso está escrito aqui para ele não perder meia hora procurando o erro na conta.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `Math.random` ou gerador com estado | todos os `u` diferentes; nada bate |
| soma `p += v·dt` em vez da conta fechada | posição erra e o erro **muda com o passo** |
| `(1 − e^(−k·a)) / k` sem `expm1` | erra na última casa com `k·a` pequeno |
| reduz o ângulo a `−180..180` | só `angle` erra, e por múltiplos de 360 |
| ordena por índice em vez de por `t_i` | os mesmos números, na ordem errada |

---

## Antes de qualquer caso

Um leitor que declara **P** tem de reproduzir os cinco números de referência da
§3.2 da extensão, exatos:

| Entrada | Saída |
|:---|:---|
| `pcg(0)` | `129708002` |
| `pcg(42)` | `1223963391` |
| `pcg(0xFFFFFFFF)` | `3861530882` |
| `acaso(42, 0, 7, 0)` | `0.4190843105316162` |
| `acaso(42, 0, −3, 0)` | `0.5181800723075867` |

Se algum deles não bater, **pare aqui**: nenhum caso de partícula vai passar, e
o defeito é o hash, não a conta.

## Onde este caso mora

Entrou em `casos/` em 18/09/2026, no fecho do degrau 12: os **dois** runtimes passaram (TypeScript e Python, este último escrito só pela spec da extensão), e o confronto campo a campo não achou diferença. Antes disso morou em `casos-pendentes/` (§12.4).

O `esperado.json` teve **três** fontes independentes, e não duas: a implementação de referência que escreveu o caso, o runtime TypeScript e o Python.
