# A-010 — herança de transformação nas cinco combinações

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 5.3, 5.4 |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

Os cinco modos de herança da tabela 5.3 dão cinco matrizes de mundo diferentes,
com o mesmo pai e a mesma pose local. Um runtime que só implementa `normal`
falha em quatro ossos de uma vez.

O pai tem **rotação, escala não uniforme e reflexão** ao mesmo tempo. Sem os
três juntos, `noScale` e `noScaleOrReflection` dariam o mesmo número e o caso
não provaria nada.

## O rig

| Osso | Pai | x | y | rotation | scaleX | scaleY | herança |
|:---|:---|---:|---:|---:|---:|---:|:---|
| root | — | 0 | 0 | 0 | 1 | 1 | — |
| pai | root | 10 | 20 | 90 | 2 | −1 | normal |
| normal | pai | 10 | 0 | 30 | 1 | 1 | T T T |
| onlyTranslation | pai | 10 | 0 | 30 | 1 | 1 | F F F |
| noRotationOrReflection | pai | 10 | 0 | 30 | 1 | 1 | F T F |
| noScale | pai | 10 | 0 | 30 | 1 | 1 | T F T |
| noScaleOrReflection | pai | 10 | 0 | 30 | 1 | 1 | T F F |

## Contas

Escala do esqueleto: `sx = sy = 1`, `skX = skY = 0`.

### Matriz do pai (5.4, ramo `parent == null` do root e depois `normal`)

```
rotY = 90 + 90 + 0 = 180
la = cos(90) * 2  = 0
lb = cos(180) * (-1) = 1
lc = sin(90) * 2  = 2
ld = sin(180) * (-1) = 0
```

O root é a identidade, então `a b c d = la lb lc ld`:

```
pai = [ a=0  b=1  c=2  d=0 ]   worldX = 10   worldY = 20
det(pai) = 0*0 - 1*2 = -2      (reflexão: determinante negativo)
```

### Parte local dos filhos (igual para os cinco)

```
rotY = 30 + 90 = 120
la = cos(30) =  0.8660254
lb = cos(120) = -0.5
lc = sin(30) =  0.5
ld = sin(120) = 0.8660254
```

### Translação (igual para os cinco — 5.3: "a translação sempre usa a matriz completa do pai")

```
worldX = 0*10 + 1*0 + 10 = 10
worldY = 2*10 + 0*0 + 20 = 40
```

### `normal`

```
a = 0*0.8660254 + 1*0.5       =  0.5
b = 0*(-0.5)    + 1*0.8660254 =  0.8660254
c = 2*0.8660254 + 0*0.5       =  1.7320508
d = 2*(-0.5)    + 0*0.8660254 = -1
```

### `onlyTranslation`

A parte linear é a do próprio osso:

```
a = 0.8660254   b = -0.5   c = 0.5   d = 0.8660254
```

### `noRotationOrReflection`

```
s = pa² + pc² = 0 + 4 = 4                    (> 0.0001)
s = |0*0 - 1*2| / 4 = 0.5
pa = 0 / 1 = 0        pc = 2 / 1 = 2
pb = pc * s = 1       pd = pa * s = 0
prx = atan2d(2, 0) = 90

rx = 30 + 0 - 90      = -60
ry = 30 + 0 - 90 + 90 =  30
la = cos(-60) =  0.5          lb = cos(30) = 0.8660254
lc = sin(-60) = -0.8660254    ld = sin(30) = 0.5

a = 0*0.5 - 1*(-0.8660254) =  0.8660254
b = 0*0.8660254 - 1*0.5    = -0.5
c = 2*0.5 + 0*(-0.8660254) =  1
d = 2*0.8660254 + 0*0.5    =  1.7320508
```

Confere: `det = 0.8660254*1.7320508 + 0.5*1 = 1.5 + 0.5 = 2`. O módulo é o do
pai (2) e o sinal virou positivo — a reflexão saiu, como o nome diz.

### `noScale`

```
cos = cos(30) = 0.8660254     sin = sin(30) = 0.5
za = (0*0.8660254 + 1*0.5) / 1 = 0.5
zc = (2*0.8660254 + 0*0.5) / 1 = 1.7320508
s  = sqrt(0.25 + 3) = 1.8027756   ->   s = 1/1.8027756 = 0.5547002
za = 0.2773501    zc = 0.9607689
s  = sqrt(za² + zc²) = 1

det(pai) = -2 < 0  e  (sx<0) != (sy<0) é falso   ->   true != false   ->   s = -1

r  = atan2(0.9607689, 0.2773501) + PI/2 = 73.898° + 90° = 163.898°
zb = cos(163.898°) * (-1) =  0.9607689
zd = sin(163.898°) * (-1) = -0.2773501

la = cos(0)*1 = 1    lb = cos(90)*1 = 0
lc = sin(0)*1 = 0    ld = sin(90)*1 = 1

a = 0.2773501    b =  0.9607689
c = 0.9607689    d = -0.2773501
```

Confere: `det = -0.0769231 - 0.9230769 = -1`. Escala 1 (a escala do pai não
passou) e reflexão preservada.

### `noScaleOrReflection`

Igual ao anterior até `s = 1`, mas o teste de reflexão **não** se aplica, então
`s` fica `+1`:

```
zb = cos(163.898°) = -0.9607689
zd = sin(163.898°) =  0.2773501

a = 0.2773501    b = -0.9607689
c = 0.9607689    d =  0.2773501
```

Confere: `det = +1`. Sem escala e sem reflexão.
