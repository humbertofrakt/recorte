# P-018 — emissor com `x` e `y`

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

`x` e `y` estão no **espaço do osso**, e não no do esqueleto. Para separar as
duas leituras o osso está **girado 90°**.

## O rig

```
root
emissor   parent root   x 100   rotation 90
jato      x 30   y 10   rotation 0   space local
```

## A conta

```
M_osso    = (a 0, b −1, c 1, d 0, tx 100, ty 0)        // girado 90°
no emissor: p(a) = (100·a, 0)
no osso:    T(30, 10) → (30 + 100·a, 10)
no mundo:   (0·X − 1·Y + 100, 1·X + 0·Y) = (90, 30 + 100·a)
```

| índice | idade | x | y |
|:---:|:---:|:---:|:---:|
| 3 | 0 | 90 | 30 |
| 2 | 0,1 | 90 | 40 |
| 1 | 0,2 | 90 | 50 |
| 0 | 0,3 | 90 | 60 |

Ângulo `90` (a rotação de `M_emissor`), escala `1`.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| ignora `x`, `y` | `(100, 100·a)`: x 100 em vez de 90 |
| soma `x`, `y` no espaço do esqueleto | `(130, 10 + 100·a)` |

## Onde este caso mora

Entrou em `casos/` em 04/10/2026, na rodada 15, quando **três** fontes independentes deram o mesmo número: a conta à mão (escrita antes do código, e refeita à mão pelo `DIRETOR · ed2cab`), o runtime TypeScript e o runtime Python, este escrito só pela §9.10 da extensão. Os dois runtimes bateram de primeira; nenhuma frase da spec precisou de conserto.

Antes, o caso foi visto **falhando** no leitor de antes da §9.10 (o mesmo arquivo sem `x`, `y` e `rotation`): é o teste da regra 26 em `ferramentas/testes/particulas.test.ts`.
