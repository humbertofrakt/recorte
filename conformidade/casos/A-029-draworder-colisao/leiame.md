# A-029 — draw order com colisão e com índice fora de faixa

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 9.5 |
| Esperado | conferido à mão |

## O que este caso prova

Duas regras da 9.5 que o A-023 não toca:

| Regra | Onde aparece |
|:---|:---|
| Duas entradas no mesmo índice: a **última** vence, e a que perdeu é **descitada** — volta para a fila do passo 2. | chave em `t = 0` |
| `i + offset` fora de `0..n−1` é **clampado**, e não ignorado. | chave em `t = 1` |

A palavra "descitada" é o ponto. Sem ela, o passo 2 pula o slot que perdeu a
colisão — ele "já foi citado" — e sobra um buraco na ordem: o runtime desenha
um slot a menos. Foi escrita na 9.5 depois do confronto entre os dois runtimes.

## O rig

Três slots, na ordem de setup: `corpo` `braco` `mao`. Nenhum attachment: o que
se mede é só a ordem.

## Chave em `t = 0`: `[{ braco, −1 }, { mao, −2 }]`

```
braco é o índice 1 de setup;  1 + (−1) = 0   ->   ordem[0] = 1
mao   é o índice 2 de setup;  2 + (−2) = 0   ->   COLISÃO no índice 0

a última do array vence:  ordem[0] = 2 (mao)
braco é DESCITADO
citados = {2}

preenchimento (j anda pelos não citados, na ordem do array: 0 corpo, 1 braco)
  i = 1 -> ordem[1] = 0   (corpo)
  i = 2 -> ordem[2] = 1   (braco)

ordem = [2, 0, 1]   ->   mao  corpo  braco
```

Em `t = 0.5` a ordem é a mesma: a timeline de `drawOrder` é sempre stepped.

## Chave em `t = 1`: `[{ corpo, +9 }, { mao, −7 }]`

```
n = 3, então os índices válidos são 0, 1 e 2.

corpo: 0 + 9  =  9  ->  clampa para 2   ->   ordem[2] = 0
mao:   2 − 7  = −5  ->  clampa para 0   ->   ordem[0] = 2
sem colisão
citados = {0, 2}

preenchimento (não citado: 1 braco)
  i = 1 -> ordem[1] = 1

ordem = [2, 1, 0]   ->   mao  braco  corpo
```

## Conferido pelos dois caminhos

1. A conta acima, escrita à mão a partir do pseudocódigo da 9.5.
2. Os **dois** runtimes do projeto, o de TypeScript e o de Python, que foram
   escritos por caminhos independentes e devolvem os mesmos três resultados.
