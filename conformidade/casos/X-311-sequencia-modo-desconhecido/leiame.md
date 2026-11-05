# X-311 — `sequence.mode` desconhecido vira `hold`

| Item | Valor |
|:---|:---|
| Nível | **X** (compatibilidade). Usa `sequence` (nível B) |
| Spec | 2.5 (*"`sequence.mode` — Modo desconhecido — Usa `"hold"`"*), 9.6 |
| Esperado | conta à mão, pela regra do B-110, **antes** de rodar runtime |

## O que este caso prende

Dois slots com a mesma sequência de 4 quadros, `index 1`, `delay 0.1`:

| Slot | `mode` | `sequenceIndex` em `0`, `0.1`, `0.2`, `0.3` |
|:---|:---|:---|
| `estranho` | `"acme_vaivem"` | `1, 1, 1, 1` — `hold`: fica no `index` |
| `loop` | `"loop"` | `1, 2, 3, 0` — o controle, a mesma conta do B-110 |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| modo desconhecido vira `loop` | `estranho` anda `1, 2, 3, 0` — reprova por `2` |

## O que este verde NÃO prova (regra 28)

O aviso (a sonda não tem canal de avisos).

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
