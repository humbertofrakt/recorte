# C-211 — IK de 1 osso com stretch

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.2 |
| Esperado | conferido à mão |

## O que este caso prova

Com `stretch: true` e alvo fora de alcance, o osso gira **e** estica `scaleX`
até a ponta encostar. Com `uniform: false` (padrão), `scaleY` não muda.

## O rig

```
osso   em (0, 0), length 50
alvo   em (60, 80)          (distância 100 = o dobro do osso)
ik     stretch true
```

## Contas (6.2)

A rotação sai igual à do C-210, porque a direção é a mesma:

```
rot = atan2d(80, 60) = 53.130102°
```

Depois vem o trecho de esticar:

```
b  = length × scaleX = 50 × 1 = 50
dd = 60² + 80² = 10000        b² = 2500
stretch e dd > b²  ->  estica

s = (sqrt(10000) / 50 − 1) × mix + 1 = (2 − 1) × 1 + 1 = 2
scaleX = 1 × 2 = 2            (uniform false: scaleY continua 1)
```

Matriz:

```
a = cos(53.130102) × 2 = 1.2      b = cos(143.130102) × 1 = −0.8
c = sin(53.130102) × 2 = 1.6      d = sin(143.130102) × 1 =  0.6
```

Ponta: `(1.2 × 50, 1.6 × 50) = (60, 80)` — em cima do alvo.

Sem `stretch` a ponta pararia em `(30, 40)`. A diferença é de 50 px.
