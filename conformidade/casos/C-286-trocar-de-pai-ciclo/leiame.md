# C-286 — o ciclo é ignorado com aviso

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 9.4 (`parent`, L2 `PARENT_CYCLE`) |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

Em 0,5 s a chave manda o `torso` virar filho da `hand` — que é filha do
`torso`. É um ciclo. A regra: a chave é **ignorada**, aviso uma vez, L2, e o
pai continua o de antes. O arquivo abre e a pose em 0,75 s é a setup pose.
Um runtime que aceite o ciclo entra em laço infinito ou lê matriz nenhuma;
um que recuse o arquivo reprova também.

## O rig

O mesmo do C-281. `torso/parent`: `null` em 0, `"hand"` em 0,5.

## Contas

```
torso = T(0,100)·R(90) → (0, 100), a=0 b=−1 c=1 d=0   (o pai continua root)
hand  = torso × T(50, 0) → (0, 150), mesma rotação
```
