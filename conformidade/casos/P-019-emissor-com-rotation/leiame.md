# P-019 — emissor com `rotation`

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

Três de uma vez, e cada erro dá um número diferente:

1. `rotation` gira o **jato**: `direction 0` com `rotation 90` sai para cima;
2. em `space: "local"` a **gravidade** fica no referencial do **emissor** e gira junto (§9.10);
3. a ordem é `M_osso × R(rotation)`, e **não** `R × M_osso`: o osso tem `scaleX 2`, `scaleY 1`.

## O rig

```
root
emissor   parent root   scaleX 2   scaleY 1
jato      rotation 90   gravity [0, −100]   space local
```

## A conta

```
no emissor:   p(a) = v0·a + ½·g·a² = (100·a, −50·a²)
M_osso·R(90) = (a 2·0 = 0, b 2·(−1) = −2, c 1·1 = 1, d 1·0 = 0)
no mundo:     (0·X − 2·Y, 1·X + 0·Y) = (100·a², 100·a)
ângulo:       atan2(c, a) = atan2(1, 0) = 90
escala:       hypot(a, c) = hypot(0, 1) = 1
```

| índice | idade | x | y |
|:---:|:---:|:---:|:---:|
| 3 | 0 | 0 | 0 |
| 2 | 0,1 | 1 | 10 |
| 1 | 0,2 | 4 | 20 |
| 0 | 0,3 | 9 | 30 |

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| ignora `rotation` | `(200·a, −50·a²)`: o jato vai para a direita |
| `R × M_osso` (a ordem errada) | `(50·a², 200·a)` e escala `2` |
| gravidade no referencial do osso | `(200·a, 100·a − 50·a²)`… outra curva |

## Onde este caso mora

Entrou em `casos/` em 04/10/2026, na rodada 15, quando **três** fontes independentes deram o mesmo número: a conta à mão (escrita antes do código, e refeita à mão pelo `DIRETOR · ed2cab`), o runtime TypeScript e o runtime Python, este escrito só pela §9.10 da extensão. Os dois runtimes bateram de primeira; nenhuma frase da spec precisou de conserto.

Antes, o caso foi visto **falhando** no leitor de antes da §9.10 (o mesmo arquivo sem `x`, `y` e `rotation`): é o teste da regra 26 em `ferramentas/testes/particulas.test.ts`.
