# C-222 — transform, local, absoluto

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.3 |
| Esperado | conferido à mão |

## O que este caso prova

Modo `local: true, relative: false`: a conta é feita direto na **pose aplicada**,
em graus, sem passar pela matriz de mundo. Cada canal usa a sua mix.
## O rig (o mesmo nos quatro casos C-220 a C-223)

```
alvo   filho do root:  x 100, y 50, rotation 30, scaleX 2, scaleY 2
osso   filho do root:  x 10,  y 20, rotation ROT
```

Matriz de mundo do alvo (5.4, pai identidade):

```
rotY = 30 + 90 = 120
ta = cos(30) × 2 =  1.7320508      tb = cos(120) × 2 = −1
tc = sin(30) × 2 =  1              td = sin(120) × 2 =  1.7320508
worldX = 100      worldY = 50

sqrt(ta² + tc²) = 2      sqrt(tb² + td²) = 2      det = 4  (positivo: reflect = +1)
```

`osso` começa com `rotation 45`.

Mixes: `mixRotation 0.5`, `mixX 1`, `mixY 0.5`, `mixScaleX 0.25`,
`mixScaleY 0`, `mixShearY 1`. `offsetRotation 10`.

## Contas (6.3, modo local absoluto)

Pose aplicada do alvo: `x 100, y 50, rotation 30, scaleX 2, scaleY 2, shearY 0`.
Pose aplicada do osso antes: `x 10, y 20, rotation 45, scaleX 1, scaleY 1, shearY 0`.

```
rotation += (30 − 45 + 10) × 0.5   = 45 + (−5)×0.5   = 42.5
x        += (100 − 10 + 0) × 1     = 10 + 90         = 100
y        += (50  − 20 + 0) × 0.5   = 20 + 15         = 35
scaleX   += (2 − 1 + 0) × 0.25     = 1 + 0.25        = 1.25
scaleY   += (2 − 1 + 0) × 0        = 1               = 1
shearY   += (0 − 0 + 0) × 1        = 0               = 0
```

Depois `updateWorld` (5.4, pai identidade):

```
rotY = 42.5 + 90 = 132.5
a = cos(42.5) × 1.25 =  0.73727734 × 1.25 =  0.92159667
b = cos(132.5) × 1   = −0.67559021
c = sin(42.5) × 1.25 =  0.67559021 × 1.25 =  0.84448776
d = sin(132.5) × 1   =  0.73727734
worldX = 100   worldY = 35
```
