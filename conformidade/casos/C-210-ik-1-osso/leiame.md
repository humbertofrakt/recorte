# C-210 — IK de 1 osso

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.2 |
| Esperado | conferido à mão |

## O que este caso prova

`ik1` sem `stretch` e sem `compress`: o osso **só gira**, e a ponta aponta para
o alvo mesmo quando não alcança.

## O rig

```
osso   filho do root, em (0, 0), length 50, rotation 0
alvo   em (30, 40)          (distância 50 — alcance exato)
ik     bones ["osso"], target "alvo", mix 1
```

## Contas (6.2, `ik1`, ramo padrão com pai identidade)

```
rot = −shearX − rotation = 0
lx = 30 − 0 = 30      ly = 40 − 0 = 40
rot = 0 + atan2d(40, 30) = 53.130102°
scaleX > 0, então não soma 180
```

`compress` e `stretch` são `false`: a escala fica em 1.

```
applied.rotation = 0 + 53.130102 × 1 = 53.130102

matriz (triângulo 3-4-5: cos = 30/50 = 0.6, sin = 40/50 = 0.8)
  a = cos(53.130102) = 0.6      b = cos(143.130102) = −0.8
  c = sin(53.130102) = 0.8      d = sin(143.130102) =  0.6
```

Conferência: a ponta do osso é `(length, 0)` no local, ou seja
`(0.6 × 50, 0.8 × 50) = (30, 40)` — em cima do alvo.
