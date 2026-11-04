# P-020 — `space: "world"`, osso andando, emissor com `x` e `rotation`

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §9.10 (rodada 15, 04/10/2026), §7.2, §14.1 |
| Esperado | **calculado à mão antes do código**, e conferido à mão pelo Diretor (`DIRETOR · ed2cab`) antes do "pode" |
| Estado | **em `casos/`** desde 04/10/2026 |

O resto do emissor é o mais quieto possível, para a conta caber numa linha:
`rate 10`, `lifetime [2, 2]`, `speed 100`, `direction 0`, `spread 0`, `point`,
`looping false`. Em `t = 0,3` há **4** vivas, nascidas em `0`, `0,1`, `0,2` e
`0,3` (índices 0 a 3), todas com `life 2`.

## A decisão que este caso prende

Em `world` a partícula usa `M_emissor(t_i)`, a do **instante em que nasceu**, e
não a de agora — e o `x` e o `rotation` do emissor entram nessa matriz. Pedido
do Diretor (exigência *a* do "pode").

## O rig

```
root
emissor   parent root   x animado: 0 em t = 0, 100 em t = 1 (linear)
jato      x 10   rotation 90   space world
animação  "anda", duração 1
```

## A conta

```
osso em t_i:    x = 100·t_i
M_emissor(t_i) = T(100·t_i, 0) × T(10, 0) · R(90)
p0 = (0, 0)   → (100·t_i + 10, 0)
v0 = (100, 0) → R(90) → (0, 100)
em t:           (100·t_i + 10, 100·(t − t_i))
ângulo:         0 + rotação de M_emissor(t_i) = 90
```

| índice | nasceu | x | y |
|:---:|:---:|:---:|:---:|
| 3 | 0,3 | 40 | 0 |
| 2 | 0,2 | 30 | 10 |
| 1 | 0,1 | 20 | 20 |
| 0 | 0 | 10 | 30 |

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| usa a matriz de AGORA (`t = 0,3`) | todos com `x = 40` |
| ignora o `x` do emissor | `x` 10 a menos em todos |
| ignora o `rotation` | as partículas andam em `x`, e não em `y` |

## Onde este caso mora

Entrou em `casos/` em 04/10/2026, na rodada 15, quando **três** fontes independentes deram o mesmo número: a conta à mão (escrita antes do código, e refeita à mão pelo `DIRETOR · ed2cab`), o runtime TypeScript e o runtime Python, este escrito só pela §9.10 da extensão. Os dois runtimes bateram de primeira; nenhuma frase da spec precisou de conserto.

Antes, o caso foi visto **falhando** no leitor de antes da §9.10 (o mesmo arquivo sem `x`, `y` e `rotation`): é o teste da regra 26 em `ferramentas/testes/particulas.test.ts`.
