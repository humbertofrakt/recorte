# C-332 — driver que escreve em parâmetro, em variável e no `mix` de uma constraint

| Item | Valor |
|:---|:---|
| Nível | **C** (parâmetros e drivers) |
| Spec | 8.2 (alvos `parameter`, `variable`, `constraint`), 8.4 (`int` trunca), 6.3 (transform, modo mundo absoluto) |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

| Alvo do driver `dirige` (lê `a`) | Regra |
|:---|:---|
| `parameter b` | *"o driver escreve no valor corrente do outro parâmetro"* (8.2) |
| `variable n` (`int`) | *"Muda por timeline ou driver (só `float` e `int`). `int` recebe o valor truncado"* (8.4) |
| `variable f` (`float`) | idem, sem truncar |
| `constraint cola`, `mix` | *"pode ser uma constraint anterior ou posterior no array. Posterior é o caso útil"* (8.2) |

A `cola` é um `transform` em modo mundo absoluto, só com `mixX` (os outros mixes
em `0`), `mix: 0` no setup. O driver vem **antes** dela no array, então o `mix`
que ele escreve já vale no mesmo quadro.

## A conta

A animação leva `a` de `0` a `1` em `1 s`. `alvo` está em `x = 100`; `seguidor`
em `0`. Pela 6.3: `seguidor.worldX = 0 + (100 − 0)·(mix·mixX) = 100·a`.

| `t` | `a` | `b` | `n` | `f` | `seguidor.worldX` |
|:---|:---:|:---:|:---:|:---:|:---:|
| `0.25` | `0.25` | `2.5` | `2` | `0.25` | `25` |
| `0.79` | `0.79` | `7.9` | `7` | `0.79` | `79` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| arredonda o `int` escrito por driver | `n` em `0.79` dá `8` |
| driver não escreve em constraint | `seguidor` parado em `0` |
| usa o `mix` padrão (`1`) e não o do arquivo | `seguidor` em `100` |
| driver não escreve em parâmetro | `b` fica `0` |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
