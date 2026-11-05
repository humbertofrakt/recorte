# C-330 — parâmetro e driver: clamp, envolver, e o `add` que soma o desvio

| Item | Valor |
|:---|:---|
| Nível | **C** (parâmetros, drivers, timeline `parameter`) |
| Spec | 8.1, 8.2, 9.9 |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

Até 05/11/2026 a §12.4 dizia: *nenhum caso exercita `parameter` nem `driver`*,
e o canal `parameters` não era medido por caso nenhum.

| Peça | O que prende |
|:---|:---|
| `abre` (0..1), timeline `0 → 1` | o valor da timeline (8.1) |
| `teto` (0..1), timeline `0 → 2` | **clamp** em `[min, max]` (8.1, 9.9) |
| `volta` (0..360, `repeat`), timeline `350 → 390` | **envolve**: `360 → 0`, `380 → 20`. O resultado fica em `[min, max)`: 360 vira 0 |
| `quieto`, padrão `0.25`, sem timeline | o padrão vale |
| driver `dirige`, alvo `braco` (`replace`) | `rotation = 90·abre` |
| driver `dirige`, alvo `perna` (`add`), setup `10`, chaves `10 → 30` | `novo = cur + (val − setup)·mix` — **soma o desvio em relação ao setup**, como o pseudocódigo da 8.2 |

## A conta

```
braco: 90·abre
perna: cur = 10 (setup, sem timeline);  val = 10 + 20·abre;  novo = 10 + (val − 10) = 10 + 20·abre
```

| `t` | `abre` | `teto` | `volta` | `braco` | `perna` |
|:---|:---:|:---:|:---:|:---:|:---:|
| `0.25` | `0.25` | `0.5` | `0` | `22.5` | `15` |
| `0.75` | `0.75` | `1` | `20` | `67.5` | `25` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| `add` soma o valor cru (`cur + val`), lendo só a tabela da 8.2 | `perna` em `0.25` dá `25` — reprova por `10` |
| não envolve | `volta` em `0.25` dá `360` |
| não clampa | `teto` em `0.75` dá `1.5` |

A tabela do `DriverTarget` dizia *"`add` = soma o valor"*, e o pseudocódigo dizia
*"soma o desvio em relação ao setup"*. Com setup `0` as duas coincidem; aqui o
setup é `10` de propósito. A tabela ganhou as palavras do pseudocódigo.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
