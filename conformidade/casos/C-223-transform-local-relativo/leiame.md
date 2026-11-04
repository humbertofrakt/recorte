# C-223 — transform, local, relativo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.3 |
| Esperado | conferido à mão |

## O que este caso prova

Modo `local: true, relative: true`. Rotação e posição **somam**; escala
**multiplica**. É o par de C-222, com o mesmo rig e as mesmas mixes, para que a
diferença entre os dois modos apareça número a número.
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

`osso` começa com `rotation 45`. Mesmas mixes de C-222.

## Contas (6.3, modo local relativo)

```
rotation += (30 + 10) × 0.5         = 45 + 20   = 65
x        += (100 + 0) × 1           = 10 + 100  = 110
y        += (50  + 0) × 0.5         = 20 + 25   = 45
scaleX   *= (2 − 1 + 0) × 0.25 + 1  = 1 × 1.25  = 1.25
scaleY   *= (2 − 1 + 0) × 0    + 1  = 1 × 1     = 1
shearY   += (0 + 0) × 1             = 0
```

Depois `updateWorld`:

```
rotY = 65 + 90 = 155
a = cos(65) × 1.25 =  0.42261826 × 1.25 =  0.52827283
b = cos(155) × 1   = −0.90630779
c = sin(65) × 1.25 =  0.90630779 × 1.25 =  1.13288474
d = sin(155) × 1   =  0.42261826
worldX = 110   worldY = 45
```

| | C-222 (absoluto) | C-223 (relativo) |
|:---|---:|---:|
| arotation | 42.5 | 65 |
| ax | 100 | 110 |
| ay | 35 | 45 |
| ascaleX | 1.25 | 1.25 |

A escala coincide porque o osso começa em `1`: `1 + 0.25` e `1 × 1.25` dão o
mesmo. Os outros três canais separam os dois modos.
