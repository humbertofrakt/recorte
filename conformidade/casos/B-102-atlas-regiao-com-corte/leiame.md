# B-102 — região de atlas com corte

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 7.3, 10.3 |
| Esperado | conferido à mão |

## O que este caso prova

Quando o attachment não traz `width`/`height`, o tamanho vem do atlas, e os
cantos saem do **tamanho original** da imagem, não do recorte. O `offsetX` e o
`offsetY` da região posicionam o recorte dentro do original.

Este é o único caso da suíte com atlas: `entrada.atlas.json` ao lado do
`entrada.bone`.

## O rig

```
região "recorte":  width 60   height 40
                   offsetX 10 offsetY 5
                   originalWidth 100   originalHeight 80
attachment:        { "type": "region", "path": "recorte" }   (sem width/height)
```

## Contas (7.3)

```
originalW = 100   originalH = 80   (W = originalW, H = originalH -> kx = ky = 1)

x0 = −100/2 + 10 = −40      x1 = x0 + 60 = 20
y0 =  −80/2 +  5 = −35      y1 = y0 + 40 =  5

BL(−40, −35)   BR(20, −35)   TR(20, 5)   TL(−40, 5)
```

O osso é o root (identidade), então esses são os cantos de mundo.

Um runtime que usa o tamanho do recorte (60 × 40) e ignora os offsets devolve
`(−30, −20) … (30, 20)`: erro de 10 a 15 px.
