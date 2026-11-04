# A-021 — rotação não dá a volta

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 3.1, 9.3 |
| Esperado | conferido à mão |

## O que este caso prova

A interpolação de `rotation` usa o valor **cru**: de `350` para `10` o osso
gira `−340°`, o caminho longo. Só a **saída** é reduzida a `(-180, 180]`.

Um runtime que "acha o caminho curto" gira `+20°` e falha já em `t = 0.25`.

## A timeline

`rotation`: `t = 0 → 350`, `t = 1 → 10`, linear.

## Contas

```
v(t) = 350 + (10 - 350) * t = 350 - 340 t
```

| t | valor cru | reduzido a (-180, 180] | caminho curto daria |
|:---|---:|---:|---:|
| 0 | 350 | **−10** | −10 |
| 0.25 | 265 | **−95** | −5 |
| 0.5 | 180 | **180** | 0 |
| 1 | 10 | **10** | 10 |

Matriz em `t = 0.25` (rotação 265°, escala 1, sem shear):

```
rotY = 265 + 90 = 355
a = cos(265) = -0.08715574      b = cos(355) =  0.99619470
c = sin(265) = -0.99619470      d = sin(355) = -0.08715574
```

Em `t = 0.5` (rotação 180°): `a = -1`, `b = 0`, `c = 0`, `d = -1`.
