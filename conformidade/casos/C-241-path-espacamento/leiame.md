# C-241 — path: modo de espaçamento

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.4 |
| Esperado | conferido à mão |

## O que este caso prova

`positionMode: "percent"` e `spacingMode: "percent"`: os dois passam a ser
frações do comprimento total, não pixels. Mesmo caminho de C-240, resultado
completamente diferente.
## O caminho (o mesmo nos três casos C-240 a C-242)

Um `path` aberto de 3 âncoras, em L, com as alças alinhadas para que as duas
curvas sejam **retas**:

```
âncora 0:  entrada (−100, 0)   âncora (0, 0)     saída (100, 0)
âncora 1:  entrada (200, 0)    âncora (300, 0)   saída (300, 100)
âncora 2:  entrada (300, 200)  âncora (300, 300) saída (300, 400)
```

Curva 0: de `(0,0)` a `(300,0)` com alças em `(100,0)` e `(200,0)`. Expandindo a
bézier cúbica, os termos em `t²` e `t³` se cancelam e sobra `x(t) = 300 t`:
uma reta percorrida em velocidade constante. Comprimento **300**.

Curva 1: de `(300,0)` a `(300,300)`, do mesmo jeito, `y(t) = 300 t`.
Comprimento **300**. Total do caminho: **600**.

Por isso todo comprimento de arco vira posição direto, sem tabela.

Tangente: `0°` em toda a curva 0, `90°` em toda a curva 1.

## Os ossos

Três ossos **irmãos** do root, todos em `(0, 0)`, `rotation 0`, `length 100`.
Irmãos, e não uma cadeia, para que cada matriz de partida seja a identidade e a
conta caiba nesta página.

Constraint: `position 0`, `spacing 0.3`, `rotateMode "tangent"`, mixes em 1.

## Contas (6.4)

```
pos    = position × total = 0 × 600 = 0
spaces = spacing × total  = 0.3 × 600 = 180   (para cada osso)
```

```
i = 0:  q =   0  ->  curva 0, arco   0  ->  P0 = (  0,  0)   T0 =  0°
i = 1:  q = 180  ->  curva 0, arco 180  ->  P1 = (180,  0)   T1 =  0°
i = 2:  q = 360  ->  curva 1, arco  60  ->  P2 = (300, 60)   T2 = 90°
i = 3:  q = 540  ->  curva 1, arco 240  ->  P3 = (300, 240)
```

| Osso | worldX | worldY | arotation |
|:---|---:|---:|---:|
| b1 | 0 | 0 | 0 |
| b2 | 180 | 0 | 0 |
| b3 | 300 | 60 | 90 |

Um runtime que trata `spacing` como pixels quando o modo é `percent` põe os
ossos em `0, 0.3, 0.6` — a 180 px do lugar certo.
