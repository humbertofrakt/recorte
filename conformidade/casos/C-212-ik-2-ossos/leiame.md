# C-212 — IK de 2 ossos

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.2 |
| Esperado | conferido à mão |

## O que este caso prova

`ik2` com pai de escala uniforme, alvo dentro do alcance, `bendPositive: true`.
Os dois ossos giram e a ponta do segundo cai exatamente no alvo.

## O rig

```
P   filho do root, em (0, 0), length 100
C   filho de P,    em (100, 0), length 100
alvo em (0, 100)
ik  bones ["P", "C"], target "alvo", bendPositive true, mix 1
```

## Contas (6.2, `ik2`, ramo `u` = escala uniforme do pai)

```
psx = psy = csx = 1  ->  u = true      (|psx − psy| <= 0.0001)
l1 = 100 (origem de C em relação a P)
l2 = C.length × csx = 100
ttx = 0   tty = 100   (alvo relativo a P)
dd = 10000

cos = (dd − l1² − l2²) / (2 l1 l2) = (10000 − 10000 − 10000) / 20000 = −0.5
a2  = acos(−0.5) × bendDir = 120°

a = l1 + l2 cos = 100 − 50 = 50
b = l2 sin(a2)  = 100 × 0.8660254 = 86.60254

a1 = atan2(tty·a − ttx·b, ttx·a + tty·b)
   = atan2(100×50 − 0, 0 + 100×86.60254)
   = atan2(5000, 8660.254) = 30°
```

O `os` é `atan2(cy, cx) = atan2(0, 100) = 0`, então:

```
P.rotation = 0 + (30 − 0) = 30
C.rotation = 0 + (120 − 0) = 120
```

Matrizes:

```
P:  a = cos(30) = 0.866025    b = cos(120) = −0.5
    c = sin(30) = 0.5         d = sin(120) =  0.866025
    worldX = 0   worldY = 0

C:  worldX = 0.866025 × 100 = 86.60254     worldY = 0.5 × 100 = 50
    rotação de mundo = 30 + 120 = 150
    a = cos(150) = −0.866025   b = cos(240) = −0.5
    c = sin(150) =  0.5        d = sin(240) = −0.866025
```

Conferência da ponta de C: `(a×100 + worldX, c×100 + worldY) =
(−86.60254 + 86.60254, 50 + 50) = (0, 100)` — em cima do alvo.
