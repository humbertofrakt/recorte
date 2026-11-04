# B-110 — sequência nos sete modos

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 7.10, 9.6 |
| Esperado | conferido à mão |

## O que este caso prova

Os sete modos de `sequence` na mesma sequência de 4 frames, no mesmo passo, e o
oitavo slot sem timeline mostrando `sequence.setup`.

## O rig

Oito slots, todos com a mesma `region` de `count 4`, `setup 2`.
Cada um recebe uma timeline `sequence` com `index 1`, `delay 0.1`, começando em
`t = 0`. O slot `sem_timeline` não recebe nenhuma.

## Contas (9.6)

```
k = floor((t − 0) / 0.1 + 0.00001)     ->   k = 0, 1, 2, 3, 4, 5, 6
n = 4        index = 1        p = 2n − 2 = 6
```

| modo | fórmula | k=0 | 1 | 2 | 3 | 4 | 5 | 6 |
|:---|:---|---:|---:|---:|---:|---:|---:|---:|
| hold | `index` | 1 | 1 | 1 | 1 | 1 | 1 | 1 |
| once | `min(1+k, 3)` | 1 | 2 | 3 | 3 | 3 | 3 | 3 |
| loop | `(1+k) mod 4` | 1 | 2 | 3 | 0 | 1 | 2 | 3 |
| pingpong | `f=(1+k) mod 6`; `f>=4 -> 6−f` | 1 | 2 | 3 | 2 | 1 | 0 | 1 |
| onceReverse | `max(3−(1+k), 0)` | 2 | 1 | 0 | 0 | 0 | 0 | 0 |
| loopReverse | `3 − ((1+k) mod 4)` | 2 | 1 | 0 | 3 | 2 | 1 | 0 |
| pingpongReverse | `f=(1+k+3) mod 6`; `f>=4 -> 6−f` | 2 | 1 | 0 | 1 | 2 | 3 | 2 |
| sem_timeline | `sequence.setup` | 2 | 2 | 2 | 2 | 2 | 2 | 2 |

Os tempos amostrados são `0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6`, um por coluna.

O `+ 0.00001` da fórmula existe por causa do ponto flutuante: `0.3 / 0.1` dá
`2.9999999999999996` em float 64, e sem o empurrãozinho o frame atrasaria um
passo. Um runtime que esquece essa constante falha na coluna `k=3`.
