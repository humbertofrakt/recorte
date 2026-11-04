# C-240 — path: modo de posição

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.4 |
| Esperado | conferido à mão |

## O que este caso prova

`positionMode: "fixed"` (pixels ao longo do caminho) com `spacingMode: "fixed"`
e `rotateMode: "tangent"`. Prova de uma vez: a posição inicial em pixels, o
espaçamento em pixels, a passagem de uma curva para a outra e a rotação pela
tangente.
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

Constraint: `position 250`, `spacing 100`, mixes em 1.

## Contas (6.4)

**Espaços.** `spacingMode "fixed"`: `spaces[i+1] = spacing × worldLen /
setupLength`. Os ossos não têm escala, então `worldLen = setupLength = 100` e
todo espaço vale `100`.

```
spaces = [0, 100, 100, 100]
```

**Posições.** `pos` começa em `250` e soma um espaço por amostra:

```
i = 0:  q = 250   ->  curva 0, arco 250   ->  P0 = (250,   0)   T0 = 0°
i = 1:  q = 350   ->  curva 1, arco  50   ->  P1 = (300,  50)   T1 = 90°
i = 2:  q = 450   ->  curva 1, arco 150   ->  P2 = (300, 150)   T2 = 90°
i = 3:  q = 550   ->  curva 1, arco 250   ->  P3 = (300, 250)
```

**Ossos.** Cada osso vai para `P[i]` e gira para `T[i]` menos a sua própria
rotação de mundo (que é 0):

| Osso | worldX | worldY | arotation |
|:---|---:|---:|---:|
| b1 | 250 | 0 | 0 |
| b2 | 300 | 50 | 90 |
| b3 | 300 | 150 | 90 |

O b1 fica na parte reta horizontal, os outros dois na vertical. É a virada da
esquina, e é ela que separa um runtime que soma comprimento de arco certo de um
que só interpola `t`.
