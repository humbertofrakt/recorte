# P-016 — chave de `emitting` com `startDelay`

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §4.1 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

A timeline de `emitting` é lida no **relógio do esqueleto** — o mesmo em que o
animador pôs a chave —, e **não** em `t − startDelay`.

A régua que vem com ela: **o `startDelay` desloca NASCIMENTOS, que o programa
gera; não desloca CHAVES, que uma pessoa põe à mão.**

**Sem ela:** mudar o `startDelay` faria as chaves andarem **sem se moverem na
tela** — o animador veria a chave onde a pôs e o efeito noutro instante.

## O emissor e a animação

`startDelay 0.3`, `rate 20`, `lifetime [2, 2]`, `looping false`, e uma
timeline `BONE_particle` de `emitting`:

```json
{ "time": 0,   "value": true,  "curve": "stepped" }
{ "time": 0.5, "value": false, "curve": "stepped" }
```

## A conta

A **origem** da emissão é `o = startDelay = 0.3` (§4.2), e a integral corre dali,
no relógio do esqueleto. A timeline fecha a torneira em `0.5`:

```
janela de emissão = [0.3, 0.5)   →   0.2 s × 20/s = 4 nascimentos
t_i são os instantes em que E(t_i) = 0, 1, 2, 3
     = 0.3,  0.35,  0.40,  0.45
```

O primeiro nasce em `0.3` e o último em `0.45`. **Nada nasce
antes de `0.3`** (a §9.1) e **nada nasce depois de `0.5`** (a §4.1).

## As duas leituras erradas que este caso mata

**A primeira — a timeline no relógio do emissor** (`t − startDelay`): a janela
viraria `[0.3, 0.8)` e os nascimentos sairiam de `0.6` a `1.05`.

**A segunda, e esta esteve NA SPEC até 18/09/2026:** somar o `startDelay` **no
fim** da conta, em vez de pôr a origem da integral nele. A integral correria de
`0` e daria dez nascimentos em `0`…`0.45`; somando `0.3` a cada um, sairiam
`0.3, 0.35, 0.40, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75` — **seis deles com o
`emitting` já fechado**. O animador fecha a torneira em `0.5`, vê a chave
parada onde a pôs, e o efeito continua nascendo até `0.75`.

É a melhor explicação de por que a linha existe: **somar no fim não é deslocar a
origem**, e a diferença só aparece quando há timeline de `emitting` junto — que
é este caso, e só este.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| timeline lida em `t − startDelay` | todos os `birth` erram por `0.3` |
| `startDelay` fora do nascimento | todos os `birth` erram por `0.3`, ao contrário |
| `emitting` interpolado em vez de `stepped` | a contagem erra |

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
