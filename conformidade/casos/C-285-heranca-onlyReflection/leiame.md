# C-285 — herança `onlyReflection` (F3)

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 5.3, 5.4 |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

Que a combinação `(false, false, true)` é o modo `onlyReflection`, e **não** o
fallback antigo `onlyTranslation`.

Sem rotação e sem escala do pai: a parte linear é a do próprio osso, como no
`onlyTranslation`. Mas o pai é refletido (determinante −2), e o filho vira do
avesso junto: determinante −1. O fallback antigo daria +1. Um runtime que
ainda cai no fallback erra `b` e `d`.

## O rig

| Osso | Pai | x | y | rotation | scaleX | scaleY | herança |
|:---|:---|---:|---:|---:|---:|---:|:---|
| root | — | 0 | 0 | 0 | 1 | 1 | — |
| pai | root | 10 | 20 | 90 | 2 | −1 | normal |
| onlyReflection | pai | 10 | 0 | 30 | 1 | 1 | F F T |

## Contas

Escala do esqueleto: `sx = sy = 1`.

### O pai, a translação e `flip` (iguais ao A-010 e ao C-283)

```
pai = [ a=0  b=1  c=2  d=0 ]    det = -2  ->  flip = verdadeiro
worldX = 10   worldY = 40
```

### Parte local

```
la = cos(30)  =  0.8660254    lb = cos(120) = -0.5
lc = sin(30)  =  0.5          ld = sin(120) =  0.8660254
```

### `onlyReflection` (5.4: o ramo do `onlyTranslation`, com a coluna virada)

```
flip  ->  lb = 0.5    ld = -0.8660254

a = la = 0.8660254     b = lb =  0.5
c = lc = 0.5           d = ld = -0.8660254
```

Confere: `det = 0.8660254*(-0.8660254) - 0.5*0.5 = -0.75 - 0.25 = -1`. Escala
1 (a do pai não passou), rotação 30 (a do pai não passou), reflexão do pai
passou.

O `onlyTranslation` do A-010 tem `b = -0.5`, `d = 0.8660254`: determinante +1.
