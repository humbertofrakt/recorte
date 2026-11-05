# P-030 — rampa com torneira: `rate` e `emitting` no mesmo emissor

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` 1.2 |
| Spec | §4.1, §4.2 (os trechos), §9.1 da spec principal (a identidade da timeline) |
| Esperado | conta à mão abaixo, **antes** de rodar runtime (raiz direta de `E(t) = i`) |

## O que este caso prende

Duas coisas que o P-002 sozinho não separa:

1. **Duas timelines no mesmo emissor.** `rate` e `emitting` do mesmo
   `fx/jato` são timelines **diferentes**: a identidade é
   `(type, target, property, skin, attachment)` (§9.1). Um leitor que deixe
   `property` de fora da identidade acha que são repetidas e joga uma fora.
2. **A torneira corta a rampa no meio.** O corte de `emitting` em `0.75` cai
   dentro do trecho `linear` de `rate`. O trecho novo começa com a taxa **de
   `0.75`** (`30`) e com a mesma inclinação (`40`).

## A conta

`rate` vai de `0` a `40` em `[0, 1]`, `linear`; `emitting` liga em `0`, fecha
em `0.5`, reabre em `0.75`.

| Trecho | `E(t)` | Nascimento do índice `i` |
|:---|:---|:---|
| `[0, 0.5)` | `20·t²` | `sqrt(i / 20)`, `i = 0..4` |
| `[0.5, 0.75)` | fechado: área 0, `E` fica em `5` | ninguém |
| `[0.75, 1)` | `5 + 20·(t² − 0.5625)` | `sqrt((i − 5)/20 + 0.5625)` |
| `[1, …)` | `13.75 + 40·(t − 1)` | `1 + (i − 13.75)/40` |

O índice `5`: `E` chega a `5` em `0.5`, com a torneira já fechada. Ele nasce
quando ela reabre, em `0.75` (a mesma regra do P-017: trecho fechado não consome
índice). `E(1) = 13.75`, **não inteiro**: o índice `14` nasce em `1.00625`.

| Instante | Vivas |
|:---|:---:|
| `0.6` | 5 (0 a 4) |
| `0.9` | 10 (0 a 9) |
| `1.2` | 22 (0 a 21) |

## O que falha aqui

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| identidade sem `property`: `rate` e `emitting` "repetidas" | 0 vivas (fica só `emitting`, e o anexo tem `rate: 0`) — **o runtime TypeScript dava isso até 05/11/2026** |
| reabre com a taxa de `0.5` (`20`) em vez da de `0.75` (`30`) | os índices 6 a 13 nascem tarde |
| integra a rampa por cima do trecho fechado | o índice 5 nasce em `0.5` e a lista de `0.6` tem 6 |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python. Antes do
conserto os dois runtimes davam **0** vivas nos três instantes (visto, regra 26).
