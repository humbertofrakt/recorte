# B-103 — região de atlas girada 90°

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 7.3, 10.3, 10.4 |
| Esperado | conferido à mão |

## O que este caso prova

Que o `rotation: 90` da região é aplicado **ao mapear os UVs para a página**, e
não à geometria: os quatro cantos do desenho continuam onde 7.3 manda, e o que
gira é de onde a textura vem.

Este caso mede **`uvs`**, o canal que a suíte não tinha. Sem ele, dois runtimes
passavam o nível B inteiro e desenhavam texturas completamente diferentes — a
troca dos UVs do recorte pelos UVs literais de 7.3 (`(0,1) (1,1) (1,0) (0,0)`)
passava nos 31 casos antigos, B-102 incluído.

Ele também fecha, com número, o sentido de giro de 10.4: horário, na convenção
da spec. Um runtime que use a convenção anti-horária do Spine sem converter
troca os eixos e falha aqui.

## O rig

```
página:            256 × 256
região "girada":   x 4   y 6   width 40   height 60   rotation 90
                   offsetX 8   offsetY 12
                   originalWidth 80   originalHeight 100
attachment:        { "type": "region", "path": "girada" }   (sem width/height)
```

`width` e `height` são do recorte **sem girar**. Na página o retângulo ocupa
`height` na horizontal (60 px, de x=4 a x=64) e `width` na vertical (40 px, de
y=6 a y=46).

## Contas — geometria (7.3)

```
W = originalW = 80   H = originalH = 100   (kx = ky = 1)

x0 = −80/2 +  8 = −32      x1 = x0 + 40 =  8
y0 = −100/2 + 12 = −38     y1 = y0 + 60 = 22

BL(−32, −38)   BR(8, −38)   TR(8, 22)   TL(−32, 22)
```

O osso é o root (identidade), então esses são os cantos de mundo. Repare que a
geometria é a MESMA de uma região não girada com os mesmos números: o giro não
aparece aqui, só nos UVs. É por isso que um caso que mede só `vertices` não vê
diferença nenhuma entre girado e não girado.

## Contas — UVs do recorte na imagem original (7.3)

```
u0 = offsetX / OW           =  8 /  80 = 0,1
u1 = (offsetX + w) / OW     = 48 /  80 = 0,6
v1 = 1 − offsetY / OH       = 1 − 12/100 = 0,88     (base do recorte)
v0 = 1 − (offsetY + h) / OH = 1 − 72/100 = 0,28     (topo do recorte)
```

## Contas — mapa para a página (10.4)

```
px = u·OW − offsetX
py = v·OH − (OH − offsetY − height) = v·100 − 28

rotation 90:   U = (x + height − py) / pageW = (4 + 60 − py) / 256
               V = (y + px)          / pageH = (6 + px)      / 256
```

| Canto | u, v | px | py | U | V |
|:---|:---|---:|---:|---:|---:|
| BL | 0,10 · 0,88 |  0 | 60 | 4/256 = 0,015625 | 6/256 = 0,0234375 |
| BR | 0,60 · 0,88 | 40 | 60 | 4/256 = 0,015625 | 46/256 = 0,1796875 |
| TR | 0,60 · 0,28 | 40 |  0 | 64/256 = 0,25 | 46/256 = 0,1796875 |
| TL | 0,10 · 0,28 |  0 |  0 | 64/256 = 0,25 | 6/256 = 0,0234375 |

O `esperado.json` guarda esses números já com as 6 casas decimais que 3.6 manda
o gravador usar: `0,0234375` vira `0,023438` e `0,1796875` vira `0,179688`.

Um runtime que não gire devolve U de 0,015625 a 0,171875 e V fixo: erro visível
de textura, com a geometria certa.
