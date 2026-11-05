# X-310 — fallbacks de driver e de parâmetro (§2.5)

| Item | Valor |
|:---|:---|
| Nível | **X** (compatibilidade). Usa drivers (nível C); um leitor A ou B ignora drivers e **não** passa aqui — este caso é para quem declara C |
| Spec | 2.5 (a tabela de fallbacks), 8.1, 8.2 |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

Cinco linhas da tabela da §2.5 que nenhum caso media:

| Onde | No arquivo | O leitor faz |
|:---|:---|:---|
| `driverTarget.type` | `"acme_luz"` | ignora **o alvo** — e só ele: o outro alvo do mesmo driver continua |
| `driverTarget.mode` | `"acme_multiplica"` | usa `"replace"` |
| `driver.mode` (contínuo) | `"acme_mistura"` | usa `"replace"` |
| `parameter.source.property` | `"brilho"` | ignora o `source`; o parâmetro vale o `default` (`0.3`) |
| `timeline.property` | osso `tres`, `"gingado"` | ignora a timeline |

## A conta

A animação `mover` leva `p` de `0` a `1` e segura `um` e `dois` em `30°` — de
propósito: com o osso no setup (`10°`), `replace` e `add` dão o mesmo número, e
o caso não separaria os dois.

```
um   (alvo, replace):        val = 80·p                → 80·p
dois (contínuo, replace):    t = p;  val = 80·t        → 80·p
add, se fosse:               30 + (80·p − 10) = 20 + 80·p
tres: setup, rotação 10
```

| `t` | `p` | `fonte` | `um` | `dois` | `tres` |
|:---|:---:|:---:|:---:|:---:|:---:|
| `0.25` | `0.25` | `0.3` | `20` | `20` | `10` |
| `0.75` | `0.75` | `0.3` | `60` | `60` | `10` |

## O que falha aqui (visto em 05/11/2026, numa cópia do esperado; 5 de 5)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| modo desconhecido vira `add` (no alvo ou no driver) | `40` em vez de `20` |
| alvo desconhecido derruba o driver inteiro | `um` fica em `30` |
| `source` desconhecido zera o parâmetro (`min`) | `fonte` dá `0` |
| `source` desconhecido "chuta" uma propriedade conhecida | `fonte` dá `0.5` |

## O que este verde NÃO prova (regra 28)

O **aviso** de cada fallback (a sonda não tem canal de avisos), e que o alvo
`acme_luz` não escreveu nada em lugar nenhum — o comparador só olha o que o
esperado cita (12.4).

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python.
