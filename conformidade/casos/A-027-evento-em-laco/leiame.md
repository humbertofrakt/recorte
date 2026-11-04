# A-027 — disparo de evento em laço

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 8.6, 9.7 |
| Esperado | conferido à mão |

## O que este caso prova

Com `loop`, uma chave de evento dispara **uma vez por volta**. O payload da
chave sobrescreve o da definição, campo a campo; o que a chave não diz vem da
definição.

## O rig

Animação `andar`, `duration 1`, `loop true`.

| Definição | int | float | string | volume | balance |
|:---|---:|---:|:---|---:|---:|
| passo | 1 | 0.5 | esquerdo | 0.8 | 0 |
| pouso | 0 | 0 | (vazio) | 1 | 0 |

Chaves: `t 0.25 → passo` com `int: 2`; `t 0.75 → pouso`, sem sobrescrever nada.

## Contas

A sonda pede três amostras. O intervalo de cada uma é `(tempo da amostra
anterior, tempo desta]`, com `−∞` na primeira (8.6).

```
amostra 1: (−∞, 0.5]    passo em 0.25            -> passo (0.25)
amostra 2: (0.5, 1.5]   pouso em 0.75            -> pouso (0.75)
                        passo em 0.25 + 1 = 1.25 -> passo (1.25)
amostra 3: (1.5, 2.5]   pouso em 0.75 + 1 = 1.75 -> pouso (1.75)
                        passo em 0.25 + 2 = 2.25 -> passo (2.25)
```

Dentro de uma amostra a entrega é ordenada por tempo, e empate mantém a ordem
das chaves.

Payload efetivo de `passo`: `int 2` (da chave), `float 0.5`, `string
"esquerdo"`, `volume 0.8`, `balance 0` (todos da definição).
Payload de `pouso`: tudo da definição.
