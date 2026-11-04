# A-024 — troca de attachment na animação

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 9.5, 7.1 |
| Esperado | conferido à mão |

## O que este caso prova

A timeline `slot/attachment` é stepped e aceita `null`. A troca muda de fato a
geometria desenhada, não só o nome.

## O rig

Um slot `mao`, setup `aberta`. A skin `default` tem dois placeholders:

| Placeholder | Região |
|:---|:---|
| aberta | 20 × 20 |
| fechada | 40 × 10 |

Timeline: `t 0 → "aberta"`, `t 0.5 → "fechada"`, `t 1 → null`.

## Contas

Cantos locais de uma `region` sem atlas (7.3): metade da largura para cada lado,
metade da altura para cima e para baixo. O osso é o root (identidade), então os
cantos de mundo são os locais.

```
aberta  (20 × 20):  x0 = −10  x1 = 10   y0 = −10  y1 = 10
                    BL(−10,−10) BR(10,−10) TR(10,10) TL(−10,10)

fechada (40 × 10):  x0 = −20  x1 = 20   y0 = −5   y1 = 5
                    BL(−20,−5)  BR(20,−5)  TR(20,5)  TL(−20,5)
```

| t | 0 | 0.25 | 0.5 | 0.75 | 1 |
|:---|:---|:---|:---|:---|:---|
| attachment | aberta | aberta | fechada | fechada | null |

Em `t = 1` o slot está vazio: nada é desenhado e nenhum vértice existe.
