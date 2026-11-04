# C-281 — a mão troca de pai no meio da animação

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 9.4 (`parent`), 5.6 (ordem de cálculo), 5.1 |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

A chave `parent` faz a `hand` sair do `torso` e pendurar no `pack` a partir
de 0,5 s. Os locais da mão (`x`, `y`) trocam na mesma chave e passam a ser
medidos **do pai novo**, sem conversão nenhuma — semântica do Spriter.

E a **ordem de cálculo**: o `pack` vem **depois** da `hand` no array e está
animado. Um runtime que continue percorrendo o array lê a matriz do `pack`
de antes de ela ser recalculada e erra a mão em `t = 0,75`. A §5.6 manda
refazer a ordem quando o pai muda.

## O rig

| Osso | Índice | Pai do arquivo | Local |
|:---|---:|:---|:---|
| `root` | 0 | — | identidade |
| `torso` | 1 | `root` | (0, 100), rotação 90 |
| `hand` | 2 | `torso` | (50, 0) |
| `pack` | 3 | `root` | (−30, 10) |

Animação `trocar`, 1 s: `hand/parent` = `null` em 0, `"pack"` em 0,5;
`hand/x` = 50 → 10 e `hand/y` = 0 → 20, stepped em 0,5; `pack/x` de −30 a 30,
linear, em 1 s.

## Contas

```
torso = T(0,100)·R(90)             a=0 b=−1 c=1 d=0, mundo (0, 100)

t = 0,25: pai da hand = torso (chave null)
  hand local (50, 0) → x' = 0·50 + (−1)·0 + 0 = 0;  y' = 1·50 + 0 + 100 = 150
  hand = (0, 150), a=0 b=−1 c=1 d=0
  pack.x = −30 + 60·0,25 = −15 → pack = (−15, 10), identidade

t = 0,75: pai da hand = pack; hand local (10, 20) medido do pack
  pack.x = −30 + 60·0,75 = 15 → pack = (15, 10)
  hand = pack × T(10, 20) = (25, 30), identidade
```

Se o runtime não refizer a ordem (pack calculado depois da hand), a mão sai
com o pack da amostra anterior ou da setup pose: (−20, 30) ou (−5, 30).
