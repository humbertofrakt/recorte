# B-121 — variáveis: `int` trunca em direção a zero

| Item | Valor |
|:---|:---|
| Nível | **B** (timeline `variable`) |
| Spec | 8.4, 9.9, 9.10 |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

Até 05/11/2026 a §12.4 dizia: *nenhum caso exercita `variable`*, e o canal
`variables` não era medido por caso nenhum.

| Variável | Tipo | Timeline | O que prende |
|:---|:---|:---|:---|
| `forca` | `float` | `0 → 1`, `linear` | interpola |
| `golpes` | `int` | `0 → 10`, `linear` | **trunca**: `7.9 → 7`, não `8` |
| `divida` | `int`, padrão `3` | `0 → −10`, `linear` | trunca **em direção a zero**: `−7.9 → −7`, não `−8` (8.4) |
| `fala` | `string`, padrão `"oi"` | `0.5 → "ai"`, `1 → "tchau"` | antes da primeira chave vale a **primeira chave** (9.10), não o padrão |
| `vivo` | `bool` | `0 → true`, `0.75 → false` | degrau |
| `parada` | `int`, padrão `7` | nenhuma | o padrão vale |

## A conta

| `t` | `forca` | `golpes` | `divida` | `fala` | `vivo` | `parada` |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| `0.25` | `0.25` | `2` | `−2` | `"ai"` | `true` | `7` |
| `0.79` | `0.79` | `7` | `−7` | `"ai"` | `false` | `7` |
| `1` | `1` | `10` | `−10` | `"tchau"` | `false` | `7` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| arredonda o `int` | `golpes` em `0.79` dá `8` |
| `floor` em vez de truncar | `divida` em `0.79` dá `−8` |
| usa o padrão antes da primeira chave | `fala` em `0.25` dá `"oi"` |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
