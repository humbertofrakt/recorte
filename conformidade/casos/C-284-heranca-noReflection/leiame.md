# C-284 — herança `noReflection` (F3), com e sem cisalhamento no pai

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 5.3, 5.4 |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

Que a combinação `(true, true, false)` é o modo `noReflection`, e **não** o
fallback antigo `normal`.

Dois pais, os dois **refletidos**:

- `pai`, o do A-010: rotação 90, escala (2, −1). Determinante −2.
- `pai2`: cisalhamento `shearY` 30 e escala Y −1. É o pai com cisalhamento que
  o C-230 ensinou a pôr em todo caso de matriz.

Nos dois, `noReflection` dá determinante **positivo**, com o mesmo módulo do
pai. O `normal` daria negativo. Um runtime que ainda cai no fallback erra `a`
e `b` do primeiro filho e `b` e `d` do segundo.

## O rig

| Osso | Pai | x | y | rotation | scaleX | scaleY | shearY | herança |
|:---|:---|---:|---:|---:|---:|---:|---:|:---|
| root | — | 0 | 0 | 0 | 1 | 1 | 0 | — |
| pai | root | 10 | 20 | 90 | 2 | −1 | 0 | normal |
| noReflection | pai | 10 | 0 | 30 | 1 | 1 | 0 | T T F |
| pai2 | root | 50 | 0 | 0 | 1 | −1 | 30 | normal |
| noReflection_cisalhado | pai2 | 10 | 0 | 30 | 1 | 1 | 0 | T T F |

## Contas

Escala do esqueleto: `sx = sy = 1`. Parte local dos dois filhos (rotação 30):

```
la = cos(30)  =  0.8660254    lb = cos(120) = -0.5
lc = sin(30)  =  0.5          ld = sin(120) =  0.8660254
```

### Filho de `pai`

```
pai = [ a=0  b=1  c=2  d=0 ]    det = -2  ->  flip = verdadeiro
worldX = 0*10 + 1*0 + 10 = 10   worldY = 2*10 + 0*0 + 20 = 40

flip  ->  pb = -1   pd = -0 = 0          (o pai desrefletido)

a = pa*la + pb*lc = 0*0.8660254 + (-1)*0.5       = -0.5
b = pa*lb + pb*ld = 0*(-0.5) + (-1)*0.8660254     = -0.8660254
c = pc*la + pd*lc = 2*0.8660254 + 0*0.5           =  1.7320508
d = pc*lb + pd*ld = 2*(-0.5) + 0*0.8660254        = -1
```

Confere: `det = (-0.5)*(-1) - (-0.8660254)*1.7320508 = 0.5 + 1.5 = 2`.
O `normal` do A-010 dá `a = 0.5`, `b = 0.8660254` e determinante −2.

### `pai2`

```
rotY = 0 + 90 + 30 = 120
la = cos(0)*1      = 1          lb = cos(120)*(-1) = 0.5
lc = sin(0)*1      = 0          ld = sin(120)*(-1) = -0.8660254
pai2 = [ a=1  b=0.5  c=0  d=-0.8660254 ]   worldX = 50   worldY = 0
det(pai2) = 1*(-0.8660254) - 0.5*0 = -0.8660254   ->  flip = verdadeiro
```

### Filho de `pai2`

A translação usa o pai **inteiro** (5.3):

```
worldX = 1*10 + 0.5*0 + 50         = 60
worldY = 0*10 + (-0.8660254)*0 + 0 =  0
```

A parte linear, com o pai desrefletido (`pb = -0.5`, `pd = 0.8660254`):

```
a = 1*0.8660254 + (-0.5)*0.5             =  0.6160254
b = 1*(-0.5)    + (-0.5)*0.8660254       = -0.9330127
c = 0*0.8660254 + 0.8660254*0.5          =  0.4330127
d = 0*(-0.5)    + 0.8660254*0.8660254    =  0.75
```

Confere: `det = 0.6160254*0.75 - (-0.9330127)*0.4330127 = 0.4620190 + 0.4040063
= 0.8660254`. Mesmo módulo do pai, sinal positivo: o cisalhamento passou, a
reflexão não.
