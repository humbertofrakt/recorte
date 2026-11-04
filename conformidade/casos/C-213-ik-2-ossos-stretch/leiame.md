# C-213 — IK de 2 ossos com stretch

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.2 |
| Esperado | conferido à mão |

## O que este caso prova

`ik2` com alvo **fora** de alcance e `stretch: true`: a cadeia estica esticando
`scaleX` do **primeiro** osso, e a ponta do segundo alcança o alvo.

## O rig

```
P   em (0, 0), length 100
C   filho de P, em (100, 0), length 100
alvo em (150, 150)     distância = 212.132034, alcance = 200
ik  stretch true
```

## Contas (6.2, ramo `cos > 1`)

```
ttx = 150   tty = 150   dd = 45000
cos = (45000 − 10000 − 10000) / 20000 = 1.25   ->   maior que 1

cos = 1;  a2 = 0        (cadeia esticada em linha reta)

stretch:
  k = (sqrt(45000) / (100 + 100) − 1) × mix + 1
    = (212.132034 / 200 − 1) × 1 + 1 = 1.06066017
  scaleX de P = 1 × 1.06066017 = 1.06066017      (uniform false: scaleY = 1)

a  = l1 + l2 × 1 = 200
b  = l2 × sin(0) = 0
a1 = atan2(150×200 − 0, 150×200 + 0) = atan2(30000, 30000) = 45°

P.rotation = 45      C.rotation = 0
```

Matriz de P:

```
a = cos(45) × 1.06066017 = 0.75         b = cos(135) × 1 = −0.707107
c = sin(45) × 1.06066017 = 0.75         d = sin(135) × 1 =  0.707107
```

C herda a matriz de P sem girar (rotação 0), e nasce em
`(0.75 × 100, 0.75 × 100) = (75, 75)`.

Conferência da ponta de C: `(0.75 × 100 + 75, 0.75 × 100 + 75) = (150, 150)` —
em cima do alvo.

Repare: quem estica é **P**. C herda a escala pela matriz, e a spec não mexe em
`C.scaleX`. Um runtime que estica os dois manda a ponta para longe.
