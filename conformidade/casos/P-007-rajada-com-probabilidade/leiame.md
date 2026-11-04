# P-007 — rajada com probabilidade — quem nasce é decidido pelo hash

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §4.3 |
| Esperado | calculado pela spec; a lista de quem nasce é exata |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## O que este caso prova

Que `probability` é sorteio **por partícula**, pelo canal 11, e no **fluxo da
rajada** — não no fluxo contínuo. Nada de `Math.random`: quem nasce é sempre o
mesmo, e arrastar o cursor para trás traz os mesmos.

## O emissor

`rate 0` (nenhum nascimento contínuo), e uma rajada:

```json
"bursts": [{ "time": 0.1, "count": 10, "cycles": 1, "interval": 1, "probability": 0.5 }]
```

A rajada é a de número `b = 0`, então o fluxo dela é `1 + 0 = 1`. Os dez
candidatos são os índices `c·count + j = 0..9`.

## O sorteio, um por um

`nasce se acaso(42, 1, i, 11) < 0.5`:

| índice | `u` (canal 11) | resultado |
|:---:|:---|:---|
| 0 | `0.593369` | não |
| 1 | `0.272822` | **nasce** |
| 2 | `0.563979` | não |
| 3 | `0.207354` | **nasce** |
| 4 | `0.748140` | não |
| 5 | `0.307950` | **nasce** |
| 6 | `0.128575` | **nasce** |
| 7 | `0.226187` | **nasce** |
| 8 | `0.092154` | **nasce** |
| 9 | `0.917504` | não |

**Nascem 6 de 10**, os índices 1, 3, 5, 6, 7, 8. Não são cinco, e é
esse o ponto: meia probabilidade não quer dizer metade exata. Um leitor que
"arredonde" para cinco falha.

Todos nascem em `t_i = 0.1`, e em `t = 0.5` todos têm idade `0.4`.

## O empate na ordem

As dez teriam o **mesmo `t_i`**. É aqui que o desempate da §7.1 aparece:
`(t_i decrescente, fluxo crescente, índice decrescente)`. Com `t_i` igual e
fluxo igual, manda o **índice decrescente** — a lista sai 8, 7, 6, 5, 3, 1.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| sorteia com gerador sem semente | outra lista a cada rodada |
| usa o fluxo 0 para a rajada | outra lista, sempre a mesma |
| sorteia por ciclo e não por partícula | 0 ou 10, nunca 6 |
| usa outro canal | outra lista |
| não desempata por índice | os mesmos, fora de ordem |

---

## Antes de qualquer caso

Um leitor que declara **P** tem de reproduzir os cinco números de referência da
§3.2 da extensão, exatos:

| Entrada | Saída |
|:---|:---|
| `pcg(0)` | `129708002` |
| `pcg(42)` | `1223963391` |
| `pcg(0xFFFFFFFF)` | `3861530882` |
| `acaso(42, 0, 7, 0)` | `0.4190843105316162` |
| `acaso(42, 0, −3, 0)` | `0.5181800723075867` |

Se algum deles não bater, **pare aqui**: nenhum caso de partícula vai passar, e
o defeito é o hash, não a conta.

## Onde este caso mora

Entrou em `casos/` em 18/09/2026, no fecho do degrau 12: os **dois** runtimes passaram (TypeScript e Python, este último escrito só pela spec da extensão), e o confronto campo a campo não achou diferença. Antes disso morou em `casos-pendentes/` (§12.4).

O `esperado.json` teve **três** fontes independentes, e não duas: a implementação de referência que escreveu o caso, o runtime TypeScript e o Python.
