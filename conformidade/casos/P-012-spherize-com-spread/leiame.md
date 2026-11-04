# P-012 — `spherizeDirection` junto com `spread` — a ordem

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §9.3.1 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

**Mistura-se primeiro** `direction` com o ângulo de saída da forma (caminho
curto), e o `spread` abre o leque **em volta da base misturada**.

**Sem ela:** na ordem contrária o leque **encolhe por `(1 − spherizeDirection)`**
sem ninguém ter pedido — com `spherize: 1` ele fecha de vez e todas as
partículas saem no mesmo ângulo, por mais que o autor tenha aberto o `spread`.
Com `spherize: 0` as duas ordens coincidem, e é por isso que **nenhum dos oito
primeiros casos as separa**.

## O emissor

`direction 90`, `spread 30`, **`spherizeDirection 0.5`**, forma `circle` de
raio `10` (é preciso raio para haver "ângulo de saída"), sem gravidade e sem
arrasto.

## A conta, por partícula

```
p0     = ponto no disco (canais 3 e 4)
saida  = atan2(p0.y, p0.x)          // atan2(0,0) = 0, pela §3.6 do núcleo
base   = caminho_curto(direction, saida, spherizeDirection)
θ      = base + spread · (2·u2 − 1)
```

**A ordem contrária daria** `caminho_curto(direction + spread·(2·u2 − 1), saida,
spherize)`, e o desvio em relação à base viraria `δ·(1 − spherize)` — metade,
com `spherize 0.5`.

Em `t = 0.3` há **7** partículas.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| abre o leque antes de misturar | todas as posições erram, e o erro cresce com o `spherize` |
| mistura pelo caminho longo | erra nas partículas do lado oposto do disco |
| ignora `spherizeDirection` | sai tudo em `direction` |

---

## Por que este caso existe

**Toda decisão da rodada de 18/09/2026 foi tomada num ponto que nenhum dos oito
primeiros casos exercita.** Os dois runtimes passavam os oito e desenhariam
coisas diferentes na mão de quem usasse. Cada caso de P-009 a P-016 fecha um
desses pontos.

**Se os três resultados não baterem**, a spec ainda está calada ali: sobe ao
Planejador **antes** de qualquer conserto. Nunca se conserta o caso para o
código passar — foi assim que se decidiu o C-299 e o C-300.

## Onde este caso mora

Entrou em `casos/` em 18/09/2026, no fecho do degrau 12: os **dois** runtimes passaram (TypeScript e Python, este último escrito só pela spec da extensão), e o confronto campo a campo não achou diferença. Antes disso morou em `casos-pendentes/` (§12.4).

O `esperado.json` teve **três** fontes independentes, e não duas: a implementação de referência que escreveu o caso, o runtime TypeScript e o Python.
