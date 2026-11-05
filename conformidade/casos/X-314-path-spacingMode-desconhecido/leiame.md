# X-314 — `spacingMode` desconhecido cai em `length`

| Item | Valor |
|:---|:---|
| Nível | **X** (compatibilidade). Usa a constraint `path` (nível C) |
| Spec | 2.5 (modo de `path` desconhecido → o padrão da propriedade), 6.4 (`spacingMode`, padrão `"length"`) |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

O caminho e os ossos são os do **C-240** (`positionMode "fixed"`, `position 250`),
com duas trocas: `spacingMode: "acme_elastico"` e `spacing: 20`. É a linha que o
X-313 deixou de fora.

## A conta (6.4)

`length`: `spaces = (setupLength + spacing) × worldLen / setupLength = (100 + 20) × 1 = 120`.

```
q = 250  -> curva 0, arco 250  -> (250, 0)    0°
q = 370  -> curva 1, arco  70  -> (300, 70)   90°
q = 490  -> curva 1, arco 190  -> (300, 190)  90°
```

## O que falha aqui (visto em 05/11/2026, numa cópia da entrada)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| cai em `fixed` (20 px) | reprova por `190` |
| cai em `proportional` | reprova por `190` |
| cai em `percent` | os ossos vão para fora do caminho |

## O que este verde NÃO prova (regra 28)

O aviso.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
