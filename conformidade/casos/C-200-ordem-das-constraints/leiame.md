# C-200 — ordem de aplicação das constraints

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 5.6, 6.1 |
| Esperado | conferido à mão |

## O que este caso prova

A ordem do array `constraints` **é** a ordem de aplicação (5.6). Duas
constraints que escrevem no mesmo osso dão resultados diferentes conforme a
ordem, e o runtime não pode reordenar.

## O rig

```
osso    em (0, 0)
alvoA   em (100, 0)
alvoB   em (0, 100)

constraints (nesta ordem):
  t1: transform, osso -> alvoA, mixX 1,   mixY 1
  t2: transform, osso -> alvoB, mixX 0.5, mixY 0.5
```

Só as mixes de posição estão ligadas; rotação, escala e shear estão em `0`.

## Contas (6.3, modo mundo absoluto)

```
depois de t1:
  worldX = 0 + (100 − 0) × 1 = 100
  worldY = 0 + (0   − 0) × 1 = 0

depois de t2:
  worldX = 100 + (0   − 100) × 0.5 = 50
  worldY = 0   + (100 −   0) × 0.5 = 50
```

**Na ordem inversa daria `(100, 0)`:**

```
t2 primeiro:  (0, 0)   -> (0, 50)
t1 depois:    (0, 50)  -> (100, 0)
```

Um runtime que ordena constraints por tipo, por nome ou por dependência cai
nesse `(100, 0)` e falha.
