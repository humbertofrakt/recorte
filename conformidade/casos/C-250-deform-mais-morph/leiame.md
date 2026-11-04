# C-250 — deform somado a morph

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.4, 8.3, 9.6 |
| Esperado | conferido à mão |

## O que este caso prova

Deform e morph **se somam** antes do skinning (8.3), cada um com a sua
interpolação. Um runtime que aplica só um dos dois, ou que faz o segundo
substituir o primeiro, erra o vértice 0.

## O rig

Mesh de 3 vértices, sem pesos, no osso root (identidade):

```
vertices = [0,0,  100,0,  0,100]
```

Um morph `inchar` (peso de 0 a 1) que empurra o vértice 0 em `+10` no X:

```
offsets = [10, 0,  0, 0,  0, 0]
```

Uma timeline `deform` que empurra o vértice 0 em `+5` no Y:

```
t 0 -> [0,0, 0,0, 0,0]        t 1 -> [0,5, 0,0, 0,0]
```

E uma timeline `morph/weight`: `t 0 -> 0`, `t 1 -> 1`.

## Contas

```
vértice 0 = local + deform + Σ (peso do morph × offset do morph)
```

| t | deform | peso | morph | vértice 0 |
|:---|:---|---:|:---|:---|
| 0 | (0, 0) | 0 | (0, 0) | **(0, 0)** |
| 0.5 | (0, 2.5) | 0.5 | (5, 0) | **(5, 2.5)** |
| 1 | (0, 5) | 1 | (10, 0) | **(10, 5)** |

Os vértices 1 e 2 não são tocados por nenhum dos dois e ficam em `(100, 0)` e
`(0, 100)`.
