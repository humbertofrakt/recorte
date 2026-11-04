# P-028 — ao longo de um caminho com pesos

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A e **B**: "caminho com pesos exige nível B", §9.4.2) |
| Extensão | `BONE_particles` **1.1** |
| Spec | §9.4.2 (passo 1: "a mesma régua da malha"), spec §7.4 (`binding`, vértices de mundo), §7.8 |
| Esperado | **digitado à mão**, da conta abaixo (rodada 34, 05/10/2026). Nenhum runtime foi consultado antes; o hash conferido nos cinco números da §3.2 |

## O rig

```
root · ancora (parent root) · ponta (parent root)        todos em (0,0) na setup
trilha  osso root  "caminho": path, K = 2, COM binding:
          âncora 0 (in, ponto, out): (0,0) (0,0) (100,0)   — só no osso ancora, peso 1
          âncora 1 (in, ponto, out): (200,0) (300,0) (300,0) — ancora 0,5 + ponta 0,5,
                                      a mesma posição nos dois ossos
fx      osso root  "jato": shape path, curve "trilha/caminho", space local, speed 0,
          rajada única em 0 s, 4 partículas, seed 42, looping false
animação "estica", 1 s: ponta.x de 60 (em 0) a 0 (em 1), linear
```

Amostra em `t = 0,5`, com a animação: nascimento em `t_i = 0`.

## A conta

Em `t_i = 0`, `ponta.x = 60`. Os pontos da âncora 1 (7.4, soma pesada):

```
in    = 0,5·(200,0) + 0,5·(260,0) = (230, 0)
ponto = 0,5·(300,0) + 0,5·(360,0) = (330, 0)
out   = (330, 0)
```

A curva: `A = (0,0)`, `H1 = (100,0)`, `H2 = (230,0)`, `C = (330,0)`. Todos em `y = 0`
e `x(t)` crescente (`x'(t) = 3[(1−t)²·100 + 2(1−t)t·130 + t²·100] > 0`): a poligonal
de 10 segmentos anda sobre o eixo X, de 0 a 330, sem voltar. `total = 330` exato, e
o ponto a `s` do começo é `(s, 0)`.

```
p0 = (330·u3 ; 0)        speed 0, emissor na origem: o dump é p0
```

| j | `u3` | **x** | sem pesos (só o 1º osso) ou na setup | lido em `t` (0,5) | pesos somados sem peso |
|:---:|:---|:---:|:---:|:---:|:---:|
| 3 | 0,1838092803955078 | **60,657063** | 55,142784 | 57,899923 | 121,314125 |
| 2 | 0,9260824918746948 | **305,607222** | 277,824748 | 291,715985 | 611,214445 |
| 1 | 0,41712987422943115 | **137,652858** | 125,138962 | 131,395910 | 275,305717 |
| 0 | 0,10603183507919312 | **34,990506** | 31,809551 | 33,400028 | 69,981011 |

`y = 0`, `angle 0`, `scale 1`, `birth 0`, `life 2`, `age 0,5`. Ordem 3, 2, 1, 0.

## O que o verde prova

Que o caminho com `binding` é lido pela soma pesada da 7.4, com os ossos em `t_i`.

## O que um runtime errado daria

As três últimas colunas. E um leitor sem nível B **não desenha o emissor e avisa**
(§9.4.2): a lista sai vazia, e o caso reprova.

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso passou de primeira nos dois runtimes.
