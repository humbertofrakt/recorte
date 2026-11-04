# P-025 — ao longo de um caminho: fechado inclui a curva que volta

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` **1.1** |
| Spec | §9.4.2; a definição do caminho fechado na §6.4 da spec |
| Esperado | **calculado à mão antes do código** (rodada 16, lote 7) |

## A decisão que este caso prende

Caminho **fechado**: `K` curvas, e a última liga a âncora `K−1` à âncora 0, com a
alça de saída de `K−1` e a de chegada de 0. O `total` **inclui** essa curva, e uma
partícula pode nascer nela.

## O rig

```
root
trilha   osso root   "caminho": FECHADO, lengths [300, 724.264069, 1024.264069]
         A0 = (0,0)     chegada (0,100)    saída (100,0)
         A1 = (300,0)   chegada (200,0)    saída (200,100)
         A2 = (0,300)   chegada (100,200)  saída (0,200)
fx       osso root   "jato": o mesmo do P-021 (rajada de 4 em 0 s, seed 42), t = 0,5
```

Alças nos terços: as três curvas são **retas de velocidade uniforme**, e a poligonal
cai em cima delas. Este caso olha **só** a curva que volta; a poligonal é o P-024.

## A conta

| curva | de → para | comprimento | acumulado |
|:---:|:---|:---:|:---:|
| 0 | A0 → A1 | 300 | 300 |
| 1 | A1 → A2 | 424,264069 | 724,264069 |
| 2 (a que volta) | A2 → A0 | 300 | **1024,264069** |

| j | `u3` | `s = u3 · 1024,264069` | curva | **dump** | sem a curva que volta (`total 724,264069`) |
|:---:|:---|:---:|:---:|:---:|:---:|
| 0 | 0,10603183507919312 | 108,604599 | 0 | **(108,604599 ; 0)** | (76,795048 ; 0) |
| 1 | 0,41712987422943115 | 427,247 | 1 | **(210,019854 ; 89,980146)** | (298,506463 ; 1,493537) |
| 2 | 0,9260824918746948 | 948,552 | **2** | **(0 ; 75,711048)** | (37,855524 ; 262,144476) |
| 3 | 0,1838092803955078 | 188,269241 | 0 | **(188,269241 ; 0)** | (133,126457 ; 0) |

`j = 2` cai na curva que volta: `948,552 − 724,264 = 224,289` a partir de `A2`,
descendo: `y = 300 − 224,289 = 75,711`.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| ignora `closed` (só `K − 1` curvas) | a última coluna: as quatro erradas |
| fecha com uma reta de `A2` a `A0`, sem as alças | **este caso não pega**: com as alças nos terços a reta e a curva coincidem |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, na rodada 16, lote 7, por ordem da ficha do Diretor (`DIRETOR · 000da3`), com **três** fontes independentes que deram o mesmo número: a conta à mão (escrita antes do código), o runtime TypeScript e o runtime Python — este escrito só pela §9.4.2 e por estes `leiame`, sem abrir o TypeScript. O confronto fechou às 18h21 de 05/10/2026: os dois runtimes concordam campo a campo.

Antes do código, o caso foi visto **falhando** no leitor de antes da 1.1: 0 partículas, às 17h55 de 05/10/2026.
