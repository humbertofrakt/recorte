# C-221 — transform, mundo, relativo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.3 |
| Esperado | conferido à mão |

## O que este caso prova

Modo `local: false, relative: true`. Relativo **soma** o valor do alvo em vez de
ir até ele. O osso começa com `rotation 45` justamente para que o resultado,
`75`, mostre a soma `45 + 30`.
## O rig (o mesmo nos quatro casos C-220 a C-223)

```
alvo   filho do root:  x 100, y 50, rotation 30, scaleX 2, scaleY 2
osso   filho do root:  x 10,  y 20, rotation ROT
```

Matriz de mundo do alvo (5.4, pai identidade):

```
rotY = 30 + 90 = 120
ta = cos(30) × 2 =  1.7320508      tb = cos(120) × 2 = −1
tc = sin(30) × 2 =  1              td = sin(120) × 2 =  1.7320508
worldX = 100      worldY = 50

sqrt(ta² + tc²) = 2      sqrt(tb² + td²) = 2      det = 4  (positivo: reflect = +1)
```

`osso` começa com `rotation 45`: matriz de rotação 45° em `(10, 20)`.
Todas as mixes em `1`.

## Contas (6.3, modo mundo relativo)

```
rotação
  r = atan2(tc, ta) = 30°       (soma, não aproxima)
  a matriz do osso gira 30°:  45 + 30 = 75
  cos75 = 0.25881905    sin75 = 0.96592583

posição
  (wx, wy) = localToWorld(alvo, 0, 0) = (100, 50)
  worldX = 10 + 100 × 1 = 110
  worldY = 20 +  50 × 1 =  70

escala X
  s = (sqrt(ta² + tc²) − 1 + 0) × 1 + 1 = (2 − 1) + 1 = 2
escala Y
  s = (sqrt(tb² + td²) − 1 + 0) × 1 + 1 = 2

  a = 0.25881905 × 2 = 0.51763809     b = −0.96592583 × 2 = −1.93185165
  c = 0.96592583 × 2 = 1.93185165     d =  0.25881905 × 2 =  0.51763809

shear Y
  r = atan2(td, tb) − atan2(tc, ta) = 120° − 30° = 90°
  r = atan2(d, b) + (90° − 90° + 0) × 1 = atan2(d, b)      (não muda nada)
```

O shear do alvo é 90° puro (escala uniforme, sem shear), então o passo de shear
não mexe na matriz. É o resultado certo: um alvo sem shear não injeta shear.

Pose aplicada: `ax 110`, `ay 70`, `arotation 75`, `ascaleX 2`, `ascaleY 2`,
`ashearY 0`.

**Comparado com o absoluto (C-220):** ali o osso vai para a posição do alvo
`(100, 50)`; aqui ele **soma** e vai para `(110, 70)`.
