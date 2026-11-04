# P-013 — osso com escala não uniforme

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §7.2, §14.1 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

Duas coisas que só se separam quando `scaleX ≠ scaleY`: a **posição** passa
pela matriz inteira do osso, e o **`scale` do dump** leva **a escala do eixo X**
da matriz — `hypot(a, c)` —, e não a média, nem a de Y, nem a raiz do
determinante.

**Sem ela:** com escala `1` em tudo (o caso dos oito primeiros) as quatro
leituras coincidem e ninguém percebe qual está implementada.

## O rig

```
root
emissor   parent root   scaleX 2   scaleY 3   rotation 0
```

## A conta

`direction 45`, `spread 0`, `speed 100`: a velocidade é
`(100·cos45°, 100·sin45°)`, com as **duas** componentes iguais e diferentes de
zero — é o que separa o eixo X do eixo Y.

```
p_local(a) = v0 · a
desenhado  = M × p_local          // a = 2, b = 0, c = 0, d = 3
scale      = scale_i × hypot(a, c) = 1 × 2 = 2
angle      = θ(a) + rotação do osso = θ(a) + 0
```

A **razão** entre o `x` e o `y` de cada partícula é `2/3` do que seria sem a
escala — é o número que denuncia quem aplicou só uma das duas.

Em `t = 0.3` há **7** partículas, todas com `scale` **2**.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `scale` = média das duas escalas | `2.5` em vez de `2` |
| `scale` = escala de Y | `3` em vez de `2` |
| `scale` = raiz do determinante | `2.449…` em vez de `2` |
| posição sem a matriz | `x` e `y` na razão errada |

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
