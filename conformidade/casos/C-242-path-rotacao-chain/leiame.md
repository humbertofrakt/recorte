# C-242 — path: modo de rotação chain

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.4 |
| Esperado | conferido à mão |

## O que este caso prova

`rotateMode: "chain"`: o osso não aponta para a tangente, aponta para a
**posição do próximo osso**. E, como `offsetRotation` é `0`, liga-se o ramo
`tip`: depois de girar, o algoritmo corrige a origem do **próximo** osso para a
ponta real deste, e não para o ponto do caminho.

É a parte mais fácil de errar da 6.4, e a mais visível quando erra: a corrente
se solta.
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

Constraint: `positionMode "fixed"`, `position 250`, `spacingMode "fixed"`,
`spacing 100`, `rotateMode "chain"`, mixes em 1.

As posições do caminho são as mesmas de C-240:

```
P0 = (250, 0)   P1 = (300, 50)   P2 = (300, 150)   P3 = (300, 250)
```

## Contas (6.4, ramo `tip`)

**Osso b1.** Vai para `P0 = (250, 0)`.

```
dx = 300 − 250 = 50      dy = 50 − 0 = 50
r  = atan2(50, 50) = 45°          (chain: aponta para o próximo ponto)
b1.arotation = 45
```

`tip` corrige a origem do próximo osso: em vez de `P1`, ela vira a ponta real
de b1, que tem 100 px de comprimento na direção de 45°:

```
bx = 300 + (100 × cos45 − 50) = 300 + (70.710678 − 50) = 320.710678
by =  50 + (100 × sin45 − 50) =  50 + 20.710678        =  70.710678
```

**Osso b2.** Nasce nessa origem corrigida, `(320.710678, 70.710678)`, e aponta
para `P2 = (300, 150)`:

```
dx = 300 − 320.710678 = −20.710678
dy = 150 −  70.710678 =  79.289322
r  = atan2(79.289322, −20.710678) = 104.638807°
```

Nova correção de ponta:

```
cos(104.638807) = −0.252725     sin(104.638807) = 0.967538
bx = 300 + (100 × (−0.252725) − (−20.710678)) = 295.438205
by = 150 + (100 ×   0.967538  −   79.289322 ) = 167.464500
```

**Osso b3.** Nasce em `(295.438205, 167.4645)` e aponta para `P3 = (300, 250)`:

```
dx = 300 − 295.438205 =  4.561795
dy = 250 − 167.464500 = 82.535500
r  = atan2(82.5355, 4.561795) = 86.836441°
```

| Osso | worldX | worldY | arotation |
|:---|---:|---:|---:|
| b1 | 250 | 0 | 45 |
| b2 | 320.710678 | 70.710678 | 104.638807 |
| b3 | 295.438205 | 167.4645 | 86.836441 |

Compare com C-240, mesmo caminho e mesma posição, só mudando `rotateMode`: lá
b2 fica em `(300, 50)` com 90°. Aqui a corrente "estufa" para fora da curva
porque cada elo tem 100 px de comprimento e o caminho só dá 100 px de arco
entre os pontos — que é exatamente o que o modo `chain` existe para mostrar.
