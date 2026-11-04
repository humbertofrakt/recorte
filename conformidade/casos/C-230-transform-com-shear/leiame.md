# C-230 — osso com shear sob regra de transformação

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 5.2, 5.5, 6.3 |
| Esperado | conferido à mão |

## O que este caso prova

Que `appliedFromWorld` (5.5) devolve o **sinal certo** do `shearY` quando um
osso com cisalhamento passa por uma regra.

Este era o maior buraco da suíte. As três regras que chamam
`appliedFromWorld` — transformação, caminho e física — nunca recebiam um osso
com shear em caso nenhum. O único caso com shear (A-011) não tem regra
nenhuma. Resultado medido: tirar o sinal de menos de
`ashearY = −atan2(ra·rb + rc·rd, det)` passava nos 31 casos antigos, sem uma
falha. Com este caso, a mesma troca dá 60 graus de erro.

Ele também mede **os treze campos** dos **três** ossos, e não um osso com dois
campos. Um caso que declara pouco não falha: ele simplesmente não olha.

## O rig

```
root                                             (identidade)
alvo  parent root   x 100   y 0    shearY 30
osso  parent root   x 10    y 20                 (sem shear nenhum)

regra "tc": transform, mundo absoluto (local false, relative false)
            bones ["osso"]   target "alvo"
            mixShearY 1, todos os outros mix 0
```

Só o `mixShearY` está ligado: o osso não gira, não anda e não muda de escala.
A única coisa que a regra faz é **copiar o cisalhamento do alvo**, que é
exatamente o que precisa passar por 5.5 na volta.

## Contas — matrizes locais (5.2)

Com `root` na identidade, a matriz local de cada filho já é a de mundo.

```
alvo:  a = cos(rotation + shearX)·scaleX      = cos 0°   = 1
       c = sin(rotation + shearX)·scaleX      = sin 0°   = 0
       b = cos(90° + rotation + shearY)·scaleY = cos 120° = −0,5
       d = sin(90° + rotation + shearY)·scaleY = sin 120° =  0,866025

osso:  a = 1   c = 0   b = cos 90° = 0   d = sin 90° = 1
```

## Contas — a regra (6.3, `transformWorldAbsolute`, ramo `mixShearY`)

```
by = atan2(d, b) do osso        = atan2(1, 0)              =  90°
atan2(td, tb) do alvo           = atan2(0,866025, −0,5)    = 120°
atan2(tc, ta) do alvo           = atan2(0, 1)              =   0°
atan2(c, a) do osso             = atan2(0, 1)              =   0°

r = 120° − 0° − (90° − 0°)                                 =  30°
r = by + (r + offsetShearY)·mixShearY = 90° + 30°·1        = 120°
s = √(b² + d²) = √(0 + 1)                                  =   1

b = cos 120° · 1 = −0,5        d = sin 120° · 1 = 0,866025
```

Mundo do osso depois da regra: `a 1   b −0,5   c 0   d 0,866025`.

## Contas — a volta para a pose aplicada (5.5, `appliedFromWorld`)

O pai é o `root`, identidade, então `ia = 1, ib = 0, ic = 0, id = 1` e
`ra rb rc rd` são a própria matriz do osso:

```
ra = 1     rb = −0,5     rc = 0     rd = 0,866025

ascaleX = √(ra² + rc²) = 1
det     = ra·rd − rb·rc = 0,866025 − 0 = 0,866025
ascaleY = det / ascaleX = 0,866025

ashearY = −atan2(ra·rb + rc·rd, det)
        = −atan2(−0,5 , 0,866025)
        = −(−30°)
        = +30°

arotation = atan2(rc, ra) = atan2(0, 1) = 0°
ax = worldX − parent.worldX = 10        ay = 20
```

Repare no `ascaleY`: **0,866025, não 1**. É o `cos(shearY)` da nota 3 do
`DUVIDAS-SPEC.md` — a decomposição de 5.5 é aproximada sob cisalhamento, e
este é o primeiro caso da suíte que prende esse número.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `ashearY` sem o sinal de menos | `ashearY` −30 em vez de 30, diferença 60° |
| `ascaleY` como comprimento da coluna 2 (√(b²+d²) = 1) | `ascaleY` 1 em vez de 0,866025 |
| regra pulada por `mixRotation` 0 | `b` 0 e `d` 1: o shear não foi copiado |

## O que ainda falta

O mesmo rig sob regra de **caminho** e sob **física** — as outras duas que
chamam `appliedFromWorld`. Está anotado em `ESTADO.md`.
