# C-220 — transform, mundo, absoluto

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.3 |
| Esperado | conferido à mão |

## O que este caso prova

Modo `local: false, relative: false`. Cada mix é **independente**: aqui `mixY`,
`mixScaleY` e `mixShearY` estão em `0` de propósito, então o osso vai para o X
do alvo mas fica no seu próprio Y, e ganha a escala X do alvo mas não a Y.

Um runtime que trata `mix` como uma coisa só falha em `worldY` e em `ascaleY`.
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

`osso` começa com `rotation 0` e escala 1: matriz identidade em `(10, 20)`.

Mixes: `mixRotation 1`, `mixX 1`, `mixY 0`, `mixScaleX 1`, `mixScaleY 0`,
`mixShearY 0`.

## Contas (6.3, `transformWorldAbsolute`)

```
rotação (mR = 1)
  r = atan2(tc, ta) − atan2(c, a) = 30° − 0° = 30°
  a = cos30·1 − sin30·0 =  0.8660254      b = cos30·0 − sin30·1 = −0.5
  c = sin30·1 + cos30·0 =  0.5            d = sin30·0 + cos30·1 =  0.8660254

posição (mX = 1, mY = 0)
  (wx, wy) = localToWorld(alvo, 0, 0) = (100, 50)
  worldX = 10 + (100 − 10) × 1 = 100
  worldY = 20 + ( 50 − 20) × 0 = 20

escala X (mSX = 1)
  s atual = sqrt(0.8660254² + 0.5²) = 1
  s = (1 + (2 − 1 + 0) × 1) / 1 = 2
  a = 1.7320508      c = 1

escala Y (mSY = 0)   -> pulada
shear Y  (mSH = 0)   -> pulada
```

Matriz final: `a 1.732051  b −0.5  c 1  d 0.866025`, em `(100, 20)`.

Pose aplicada, via `appliedFromWorld` com pai identidade (5.5):

```
ax = 100     ay = 20
scaleX = sqrt(1.7320508² + 1²) = 2
det    = 1.7320508 × 0.8660254 − (−0.5 × 1) = 1.5 + 0.5 = 2
scaleY = det / scaleX = 1
shearY = −atan2d(1.7320508×(−0.5) + 1×0.8660254, 2) = −atan2d(0, 2) = 0
rotation = atan2d(1, 1.7320508) = 30
```
