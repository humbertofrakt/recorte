# A-022 — antes da primeira chave e depois da última

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 5.1, 9.10 |
| Esperado | conferido à mão |

## O que este caso prova

Duas regras que se confundem fácil:

1. **Antes da primeira chave vale a primeira chave**, não a setup pose (9.10).
2. **Propriedade sem timeline fica na setup pose** (5.1).

## O rig

| Osso | setup `x` | timeline |
|:---|---:|:---|
| com_chave | 7 | `x`: `t 0.5 → 100`, `t 1 → 200` |
| sem_chave | 42 | nenhuma |

## Contas

`com_chave` nunca vale 7 durante a animação: em `t = 0` e `t = 0.25` ela já
está na primeira chave, `100`. Em `t = 0.75` interpola: `100 + (200−100)×0.5 =
150`. Em `t = 2`, depois da última chave, segura `200`.

| t | 0 | 0.25 | 0.5 | 0.75 | 1 | 2 |
|:---|---:|---:|---:|---:|---:|---:|
| com_chave.x | 100 | 100 | 100 | 150 | 200 | 200 |
| sem_chave.x | 42 | 42 | 42 | 42 | 42 | 42 |

Um runtime que usa a setup pose antes da primeira chave devolve `7` nas três
primeiras amostras. Um runtime que zera o que não tem timeline devolve `0` em
`sem_chave`.
