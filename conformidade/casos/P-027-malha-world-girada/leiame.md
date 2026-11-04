# P-027 — malha em `world`, com o emissor girado e deslocado

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A e **B**) |
| Extensão | `BONE_particles` |
| Spec | §9.4.2 passo 7 (que vale para a malha: §9.10, linha `shape: "mesh"`), §7.2, §9.4.1 (`triangle`), §9.3.1, §9.10 |
| Esperado | **digitado à mão**, da conta abaixo (rodada 34, 05/10/2026). Nenhum runtime foi consultado antes; o hash conferido nos cinco números da §3.2 |

## A decisão que este caso prende

O P-026 prende as duas regras no **caminho**. A malha tem as mesmas duas, e nenhum
caso olhava:

1. o ponto da malha nasce no esqueleto, **volta uma vez** ao referencial do emissor
   (inversa de `M_emissor(t_i)`), e em `world` a §7.2 o leva de volta: cai **em cima
   da malha**;
2. `spherizeDirection` mede `atan2(p0)` nesse ponto, a partir da **origem do emissor**.

## O rig

```
root
emissor  parent root   x 100   rotation 90
fx       osso emissor  "jato": x 20, shape mesh, mesh "pele", meshMode triangle, space WORLD,
                       spherizeDirection 1, direction 0, spread 0, speed [50,50], lifetime [2,2],
                       rajada única em 0 s, 4 partículas, seed 42, looping false
         "pele": malha sem pesos no mesmo slot, vértices (40,−30) (80,−30) (80,30) (40,30),
                 triângulos [0,1,2] e [0,2,3] (áreas iguais, 1200)
```

`M_osso`: `(x, y) → (100 − y, x)`. `M_emissor = M_osso × T(20, 0)`. A inversa de
`M_emissor` leva o ponto do esqueleto `W` a `p0 = (W.y − 20 ; 100 − W.x)`, que é o
ponto da malha menos `(20, 0)`.

Amostra em `t = 0,5`: idade `0,5`.

## A conta

```
tri  = u12 < 0,5 ? [0,1,2] : [0,2,3]             // áreas iguais
s,w  = u3, u4 ; se s + w > 1: s = 1 − s, w = 1 − w
p    = A + s·(B − A) + w·(C − A)                 // na malha, referencial do osso
W    = M_osso(p)                                  // no esqueleto
p0   = p − (20, 0)                                // no referencial do emissor
v0   = 50·p0 / |p0|                               // spherize 1
world: ponto = W ; velocidade = R90(v0) = (−v0.y ; v0.x)
dump = W + velocidade·0,5
```

Por extenso, `j = 0`: `u3 = 0,10603183507919312`, `u4 = 0,5949632525444031`,
`u12 = 0,9744036197662354` → triângulo `[0,2,3]`, sem dobrar.
`p = (40 + 0,106032·40 ; −30 + 0,106032·60 + 0,594963·60) = (44,241273 ; 12,059705)`.
`W = (87,940295 ; 44,241273)`. `p0 = (24,241273 ; 12,059705)`, `|p0| = 27,075373`.
`v0 = (44,766278 ; 22,270617)`, velocidade `(−22,270617 ; 44,766278)`.
`dump = (87,940295 − 11,135309 ; 44,241273 + 22,383139) = (76,804986 ; 66,624412)`.

| j | `u3` | `u4` | `u12` | tri | p (malha) | W | **dump** | leva duas vezes | spherize no ponto do esqueleto |
|:---:|:---|:---|:---|:---:|:---:|:---:|:---:|:---:|:---:|
| 3 | 0,1838092803955078 | 0,700260579586029 | 0,43470340967178345 | 0 | (75,362794 ; 12,015635) | (87,984365 ; 75,362794) | **(82,681949 ; 99,794012)** | (8,373938 ; 126,971364) | (71,721098 ; 94,349793) |
| 2 | 0,9260824918746948 | 0,29152780771255493 | 0,7843997478485107 | 1, dobra | (42,956700 ; 16,943382) | (83,056618 ; 42,956700) | **(68,210792 ; 63,071408)** | (45,558490 ; 125,262454) | (71,571808 ; 65,162536) |
| 1 | 0,41712987422943115 | 0,6136897206306458 | 0,8688716292381287 | 1, dobra | (63,314805 ; 28,150824) | (71,849176 ; 63,314805) | **(58,225759 ; 84,276735)** | (20,156624 ; 110,605677) | (55,320605 ; 82,071306) |
| 0 | 0,10603183507919312 | 0,5949632525444031 | 0,9744036197662354 | 1 | (44,241273 ; 12,059705) | (87,940295 ; 44,241273) | **(76,804986 ; 66,624412)** | (44,523337 ; 130,273365) | (76,704905 ; 66,574344) |

Ordem do dump: 3, 2, 1, 0. `birth 0`, `life 2`, `age 0,5`, `scale 1`, `angle 90`
(o sorteado é 0, mais a rotação de `M_emissor(t_i)`).

## O que um runtime errado daria

| Erro | Coluna |
|:---|:---|
| em `world`, leva ao esqueleto o ponto que já estava lá (sem o passo 7) | "leva duas vezes": `M_emissor(W)` e o leque medido em `W` |
| mede o `spherizeDirection` no ponto do esqueleto | a última |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso derrubou o **Python**; o TypeScript já tinha sido consertado no mesmo dia (v28.4, o P-026).
