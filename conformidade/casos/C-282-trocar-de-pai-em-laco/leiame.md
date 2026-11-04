# C-282 — em laço, a mão volta ao pai do arquivo

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 9.4 (`parent`), 5.1 (setup devolve o pai), 9.11 (laço) |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

A animação em laço troca o pai em 0,5 s (chave `"pack"`) e tem uma chave
`null` em 0. Na segunda volta (`t = 1,25` → `0,25`) a `Pose` parte da setup
pose, que devolve o pai do arquivo, e a chave `null` o confirma: a mão está
no `torso` de novo, com `x = 50`. Um runtime que guarde o pai trocado de uma
volta para a outra reprova.

## O rig

O mesmo do C-281, sem animação no `pack`. `hand/parent`: `null` em 0,
`"pack"` em 0,5. `hand/x` 50 → 10, `hand/y` 0 → 20, stepped em 0,5.

## Contas

```
pack = (−30, 10), identidade, sempre

t = 0,75:  pai = pack; hand local (10, 20) → hand = (−20, 30)
t = 1,25:  t mod 1 = 0,25; setup devolve o pai torso; chave null confirma
           hand local (50, 0) → hand = (0, 150), a=0 b=−1 c=1 d=0
```
