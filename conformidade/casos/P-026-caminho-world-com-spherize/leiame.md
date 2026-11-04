# P-026 — ao longo de um caminho, em `world`, com `spherizeDirection`

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` **1.1** |
| Spec | §9.4.2 (passo 7), §7.2, §9.3.1, §9.10, §14.1 |
| Esperado | **calculado à mão antes de rodar qualquer runtime** (rodada 16, lote 7, 05/10/2026) |

## A decisão que este caso prende

Duas regras que nenhum dos P-021 a P-025 olhava — todos em `local`, sem velocidade:

1. **O ponto do caminho entra no esqueleto UMA vez.** Ele volta ao referencial do
   emissor pela inversa de `M_emissor(t_i)` nos **dois** espaços; em `world` a
   §7.2 o leva de volta ao esqueleto, e ele cai **em cima do caminho**.
2. **`spherizeDirection` mede a direção a partir da origem do emissor**, no ponto
   já trazido ao referencial do emissor — e não no ponto do esqueleto.

O emissor está **girado 90°** e **deslocado**, e as partículas **andam** antes da
amostra: assim as duas leituras erradas mudam o número.

## O rig

```
root
emissor  parent root   x 100   rotation 90
trilha   osso root     "caminho": reta de (0,0) a (300,0), alças nos terços (velocidade uniforme)
fx       osso emissor  "jato": x 20, shape path, curve "trilha/caminho", space WORLD,
         spherizeDirection 1, direction 0, spread 0, speed [50,50], lifetime [2,2],
         rajada única em 0 s, 4 partículas, seed 42, looping false
```

`M_emissor = M_osso × T(20, 0)`: giro de 90° (`a 0, b −1, c 1, d 0`) e origem em
`(100, 20)` no esqueleto. A inversa: `x_l = y − 20`, `y_l = 100 − x`.

Avaliado em `t = 0,5`: idade `0,5`.

## A conta

```
X    = 300·u3                       // o ponto do caminho, no esqueleto: (X ; 0)
p0   = (x_l ; y_l) = (−20 ; 100 − X)            // no referencial do emissor
r    = hypot(−20, 100 − X)
v0   = 50·p0 / r                    // spherize 1: sai de atan2(p0), no emissor
em world (§7.2), pela M_emissor(t_i):
p    = (X ; 0)                      // o ponto volta para cima do caminho
v    = (−v0.y ; v0.x) = (−50·(100 − X)/r ; −1000/r)
dump = p + v·0,5
```

Por extenso, `j = 0`: `u3 = 0,10603183507919312`, `X = 31,809551`,
`p0 = (−20 ; 68,190449)`, `r = 71,062912`, `v = (−47,978930 ; −14,072038)`,
`dump = (31,809551 − 23,989465 ; −7,036019) = (7,820085 ; −7,036019)`.

| j | `u3` | X | `r` | **dump** | espiraliza no ponto do esqueleto | leva o ponto duas vezes |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 3 | 0,1838092803955078 | 55,142784 | 49,113845 | **(32,309500 ; −10,180429)** | (55,142784 ; 25) | (77,166716 ; 64,962355) |
| 2 | 0,9260824918746948 | 277,824748 | 178,945916 | **(302,668112 ; −2,794140)** | (277,824748 ; 25) | (124,843365 ; 295,030607) |
| 1 | 0,41712987422943115 | 125,138962 | 32,124250 | **(144,702814 ; −15,564566)** | (125,138962 ; 25) | (119,563852 ; 129,574396) |
| 0 | 0,10603183507919312 | 31,809551 | 71,062912 | **(7,820085 ; −7,036019)** | (31,809551 ; 25) | (76,010535 ; 44,773531) |

Ordem do dump: 3, 2, 1, 0. `birth 0`, `life 2`, `age 0,5`, `scale 1`.
`angle 90`: o `angle` sorteado é 0, mais a rotação de `M_emissor(t_i)` (§7.2, `world`).

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| em `world`, leva ao esqueleto o ponto que já estava lá (a §7.2 lida sem o passo 7) | a última coluna: o ponto sai de cima do caminho, para `(100 ; 20 + X)` |
| mede o `spherizeDirection` no ponto do esqueleto (`atan2(0, X) = 0`) | a penúltima: todas saem para `+Y` do esqueleto, `y = 25` |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, na rodada 16, lote 7, a pedido do Diretor
(`DIRETOR · 000da3`), depois que o chat do runtime Python achou as duas leituras
que a §9.4.2 deixava abertas. A conta à mão foi escrita **antes** de rodar
qualquer runtime. Entrou em `casos/` em 05/10/2026 com **três** fontes independentes:
a conta à mão, o runtime Python (que bateu com ela de primeira, às 18h25) e o
runtime TypeScript — que **falhou** às 18h25, com os dois erros da tabela acima
ao mesmo tempo (`x = 100`, `y = 20 + X + 25`), e passou depois do conserto, no
mesmo minuto. Os dois runtimes concordam nos 110 casos, campo a campo (18h26).
