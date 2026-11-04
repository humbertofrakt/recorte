# C-283 — herança `noRotation` (F3)

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 5.3, 5.4 |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

Que a combinação `(false, true, true)` é o modo `noRotation`, e **não** o
fallback antigo `noRotationOrReflection`.

O pai é o do A-010: gira, estica e é **refletido** (determinante −2).
`noRotation` guarda a reflexão: o filho sai com determinante −2. O fallback
antigo a tiraria: o mesmo filho, no A-010, sai com determinante +2. Um runtime
que ainda cai no fallback erra `a` e `b`.

## O rig

| Osso | Pai | x | y | rotation | scaleX | scaleY | herança |
|:---|:---|---:|---:|---:|---:|---:|:---|
| root | — | 0 | 0 | 0 | 1 | 1 | — |
| pai | root | 10 | 20 | 90 | 2 | −1 | normal |
| noRotation | pai | 10 | 0 | 30 | 1 | 1 | F T T |

## Contas

Escala do esqueleto: `sx = sy = 1`.

### O pai e a translação (iguais ao A-010)

```
pai = [ a=0  b=1  c=2  d=0 ]   worldX = 10   worldY = 20
det(pai) = 0*0 - 1*2 = -2
worldX = 0*10 + 1*0 + 10 = 10
worldY = 2*10 + 0*0 + 20 = 40
```

### `flip`

```
det(pai) < 0            -> verdadeiro
(sx < 0) != (sy < 0)    -> falso
flip = verdadeiro != falso = verdadeiro
```

### `noRotation` (5.4: o ramo do `noRotationOrReflection`, com o sinal)

```
s = pa² + pc² = 0 + 4 = 4                    (> 0.0001)
s = |-2| / 4 = 0.5
flip  ->  s = -0.5
pa = 0 / 1 = 0        pc = 2 / 1 = 2
pb = pc * s = -1      pd = pa * s = 0
prx = atan2d(2, 0) = 90

rx = 30 + 0 - 90      = -60
ry = 30 + 0 - 90 + 90 =  30
la = cos(-60) =  0.5          lb = cos(30) = 0.8660254
lc = sin(-60) = -0.8660254    ld = sin(30) = 0.5

a = pa*la - pb*lc = 0*0.5 - (-1)*(-0.8660254) = -0.8660254
b = pa*lb - pb*ld = 0*0.8660254 - (-1)*0.5    =  0.5
c = pc*la + pd*lc = 2*0.5 + 0*(-0.8660254)    =  1
d = pc*lb + pd*ld = 2*0.8660254 + 0*0.5       =  1.7320508
```

Confere: `det = -0.8660254*1.7320508 - 0.5*1 = -1.5 - 0.5 = -2`. O módulo é o
do pai (2) e o sinal ficou negativo: a reflexão passou, a rotação não.

No A-010, o osso `noRotationOrReflection` tem os mesmos `c` e `d`, e `a`, `b`
com o sinal trocado (`0.8660254`, `-0.5`): determinante +2. É essa a diferença
que o caso cobra.
