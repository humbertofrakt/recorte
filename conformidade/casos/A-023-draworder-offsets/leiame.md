# A-023 — draw order com offsets

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 9.5 |
| Esperado | conferido à mão |

## O que este caso prova

O algoritmo de duas etapas da 9.5: primeiro coloca os slots citados no índice
`i + offset`, depois preenche os buracos com quem não foi citado, na ordem de
setup. A timeline é sempre stepped.

## O rig

Quatro slots, na ordem de setup: `s0 s1 s2 s3`.

## Chave em `t = 0`: `[{ s3, −3 }]`

```
s3 é o índice 3 de setup;  3 + (−3) = 0   ->   ordem[0] = 3
citados = {3}

preenchimento (j anda pelos não citados: 0, 1, 2)
  i = 1 -> ordem[1] = 0
  i = 2 -> ordem[2] = 1
  i = 3 -> ordem[3] = 2

ordem = [3, 0, 1, 2]   ->   s3  s0  s1  s2
```

Em `t = 0.5` a ordem é a mesma: a chave é stepped.

## Chave em `t = 1`: `[{ s0, +2 }, { s2, −1 }]`

```
s0: 0 + 2 = 2   ->   ordem[2] = 0
s2: 2 − 1 = 1   ->   ordem[1] = 2
citados = {0, 2}

preenchimento (não citados: 1, 3)
  i = 0 -> ordem[0] = 1
  i = 3 -> ordem[3] = 3

ordem = [1, 2, 0, 3]   ->   s1  s2  s0  s3
```
