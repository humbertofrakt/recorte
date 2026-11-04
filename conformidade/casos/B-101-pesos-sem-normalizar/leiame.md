# B-101 — pesos sem normalizar

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 7.4, 12.2 |
| Esperado | conferido à mão |

## O que este caso prova

O runtime **não normaliza pesos** (regra 6 da 12.2). Os pesos entram na soma
como estão gravados, mesmo quando não somam 1.

## O rig

Dois ossos irmãos, os dois sem rotação e sem escala:

| Osso | índice | worldX | worldY |
|:---|---:|---:|---:|
| a | 1 | 0 | 0 |
| b | 2 | 100 | 0 |

Uma mesh de 3 vértices, com `binding`:

```
counts    = [2, 2, 1]
bones     = [1, 2,   1, 2,   1]
positions = [10,0, -10,0,   0,20, 0,-20,   0,0]
weights   = [0.5, 0.25,   1.5, 0.5,   1]
```

## Contas (7.4)

`worldVertices[j] = Σ peso_i × (matriz do osso_i aplicada a posição_i)`

```
vértice 0   (pesos 0.5 e 0.25, soma 0.75)
  osso a: (10, 0)  -> mundo (10, 0)     × 0.5  = (5, 0)
  osso b: (−10, 0) -> mundo (90, 0)     × 0.25 = (22.5, 0)
  total = (27.5, 0)

vértice 1   (pesos 1.5 e 0.5, soma 2)
  osso a: (0, 20)   -> mundo (0, 20)    × 1.5  = (0, 30)
  osso b: (0, −20)  -> mundo (100, −20) × 0.5  = (50, −10)
  total = (50, 20)

vértice 2   (peso 1)
  osso a: (0, 0) -> (0, 0)
```

**Se o runtime normalizasse**, o vértice 0 daria `(0.5/0.75)×(10,0) +
(0.25/0.75)×(90,0) = (36.667, 0)`. A diferença é de 9 px, muito acima da
tolerância de `1e-3`.
