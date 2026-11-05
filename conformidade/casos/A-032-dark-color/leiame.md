# A-032 — dark color: liga, interpola, e o trecho que toca `null` é degrau

| Item | Valor |
|:---|:---|
| Nível | **A** (timeline `slot`) |
| Spec | 4.3 (`darkColor` do slot), 7.12, 9.5 |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

Até 05/11/2026 a §12.4 dizia, em letras: *nenhum caso exercita `darkColor`*.

| Slot | Setup | Timeline | O que prende |
|:---|:---|:---|:---|
| `liga` | sem `darkColor` | `[0,0,0]` → `[1, 0.5, 0]`, `linear` | *"Se o slot não tem `darkColor` no setup, a timeline liga o tint black"* (9.5) |
| `corta` | `[0.2, 0.2, 0.2]` | `[1,1,1]` → `null` → `[0,0,0]` | *"Trecho que sai de ou chega em `null` é stepped"* (9.5) |
| `parado` | `[0.1, 0.3, 0.5]` | nenhuma | o setup vale |
| `nada` | sem | nenhuma | o dump diz `null`, e **não** `[0,0,0]` (12.4: "`null` quando o slot não tem dark color") |

## A conta

`liga`: `[t, 0.5·t, 0]`.

`corta`: o trecho `[0, 0.5)` **chega** em `null`: degrau, vale `[1,1,1]` até
`0.5`. O trecho `[0.5, 1)` **sai** de `null`: degrau, vale `null` até `1`.

| `t` | `liga` | `corta` |
|:---|:---|:---|
| `0.25` | `[0.25, 0.125, 0]` | `[1, 1, 1]` |
| `0.5` | `[0.5, 0.25, 0]` | `null` |
| `0.75` | `[0.75, 0.375, 0]` | `null` |
| `1` | `[1, 0.5, 0]` | `[0, 0, 0]` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| interpola até `null` como se fosse `[0,0,0]` | `corta` em `0.25` dá `[0.5, 0.5, 0.5]` — reprova por `0.5` |
| escreve `[0,0,0]` no lugar de "sem dark color" | `nada` reprova |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
