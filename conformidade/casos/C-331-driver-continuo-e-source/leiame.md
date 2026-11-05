# C-331 — driver em modo contínuo, parâmetro com `source`, alvo `slot`

| Item | Valor |
|:---|:---|
| Nível | **C** (parâmetros e drivers) |
| Spec | 8.1 (`source`), 8.2 (modo contínuo, `aplicarAlvo`) |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

Três peças que nenhum caso exercitava:

| Peça | Regra |
|:---|:---|
| `puxa` com `source` (Smart Bone) | `min + (osso.applied.x − from)/(to − from)·(max − min)`, com **clamp** (sem `repeat`) |
| driver `segue`, modo **contínuo** | `t = timeFrom + (v − from)/(to − from)·(timeTo − timeFrom)`. `from`/`to` faltam: valem `min`/`max` do parâmetro. `timeTo` falta: vale a **duração** da animação-controle (`2`), e não `1` |
| driver `pinta`, alvo `slot/color` | um alvo que não é osso, com 4 componentes |

## A conta

A animação `puxar` leva `alavanca.x` de `0` a `150` em `1 s`. A `controle`
(nunca tocada, só lida pelo driver) leva `mao.rotation` de `0` a `120` em `2 s`.

| `t` | `alavanca.x` | `puxa` | `t` da controle | `mao` | `luz.color` |
|:---|:---:|:---:|:---:|:---:|:---|
| `0.25` | `37.5` | `0.375` | `0.75` | `45` | `[1, 0.625, 0.625, 1]` |
| `0.5` | `75` | `0.75` | `1.5` | `90` | `[1, 0.25, 0.25, 1]` |
| `0.9` | `135` | `1` (clamp) | `2` | `120` | `[1, 0, 0, 1]` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| `source` sem clamp | `puxa` em `0.9` dá `1.35` |
| `timeTo` padrão `1` em vez da duração | `mao` em `0.25` dá `22.5` |
| ignora alvo que não é osso | `luz.color` fica branca |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
