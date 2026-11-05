# X-313 — modos de `path` desconhecidos caem no padrão

| Item | Valor |
|:---|:---|
| Nível | **X** (compatibilidade). Usa a constraint `path` (nível C) |
| Spec | 2.5 (*"`path` `positionMode`, `spacingMode`, `rotateMode` — Modo desconhecido — Usa o padrão da propriedade"*), 6.4 |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

O caminho e os ossos são os do **C-241** (o L de 300 + 300 px, três ossos
irmãos). Três trocas:

| Campo | No arquivo | O leitor usa |
|:---|:---|:---|
| `positionMode` | `"acme_curvatura"` | `"percent"` (o padrão) |
| `rotateMode` | `"acme_giro"` | `"tangent"` (o padrão) |
| `position` | `0.1` | — (no C-241 era `0`, e com `0` o `percent` e o `fixed` coincidem) |

`spacingMode` continua `"percent"`, escrito. **O fallback de `spacingMode`
não é medido aqui** (o padrão é `"length"`, e nenhum dos casos C-240 a C-242 o
usa).

## A conta (6.4)

```
pos    = 0.1 × 600 = 60         (percent)
spaces = 0.3 × 600 = 180
q = 60   -> curva 0, arco  60  -> (60, 0)     tangente 0°
q = 240  -> curva 0, arco 240  -> (240, 0)    tangente 0°
q = 420  -> curva 1, arco 120  -> (300, 120)  tangente 90°
```

| Osso | worldX | worldY | arotation |
|:---|---:|---:|---:|
| b1 | 60 | 0 | 0 |
| b2 | 240 | 0 | 0 |
| b3 | 300 | 120 | 90 |

## O que falha aqui (visto em 05/11/2026, numa cópia da entrada)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| `positionMode` desconhecido vira `fixed` | os ossos andam só `0.1` px — reprova por `59.9` |
| `rotateMode` desconhecido vira `chain` | reprova por `80` |
| `rotateMode` desconhecido vira `chainScale` | reprova por `63.4` |

## O que este verde NÃO prova (regra 28)

O fallback de `spacingMode`, e o aviso.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
