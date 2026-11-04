# P-024 — ao longo de um caminho: a poligonal de 10 segmentos

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` **1.1** |
| Spec | §9.4.2; a régua de comprimento da §6.4 da spec |
| Esperado | **calculado à mão antes do código** (rodada 16, lote 7) |

## A decisão que este caso prende

Os P-021 a P-023 são **retas**: neles a poligonal, o comprimento exato e qualquer
número de segmentos dão o mesmo ponto. Este é uma **curva de verdade**, e prende a
regra: **10 segmentos por curva** (`t = 0, 0,1 … 1`), e **interpolação reta dentro
do segmento**.

## O rig

```
root
trilha   osso root   "caminho": aberto, lengths [473.761373]
         A0 = (0,0), saída (0,200)     A1 = (300,0), chegada (300,200)
fx       osso root   "jato": o mesmo do P-021 (rajada de 4 em 0 s, seed 42), t = 0,5
```

## A conta

Os 11 pontos `B(t)` (as alças fora da reta fazem um arco para cima):
`x(t) = 900t² − 600t³`, `y(t) = 600t − 600t²`.

| t | 0 | 0,1 | 0,2 | 0,3 | 0,4 | 0,5 | 0,6 | 0,7 | 0,8 | 0,9 | 1 |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| x | 0 | 8,4 | 31,2 | 64,8 | 105,6 | 150 | 194,4 | 235,2 | 268,8 | 291,6 | 300 |
| y | 0 | 54 | 96 | 126 | 144 | 150 | 144 | 126 | 96 | 54 | 0 |

Os 10 comprimentos (a curva é simétrica):

| segmento | 0 e 9 | 1 e 8 | 2 e 7 | 3 e 6 | 4 e 5 |
|:---|:---:|:---:|:---:|:---:|:---:|
| L | 54,649428 | 47,789539 | 45,043979 | 44,594170 | 44,803571 |

**`total = 473,761373`.**

O `p0` de duas partículas, por extenso:

```
j = 0: u3 = 0,10603183507919312
       s  = u3 · 473,761373 = 50,233        → segmento 0 (de 0 a 54,649)
       f  = 50,233 / 54,649428 = 0,919193
       p0 = (8,4·f ; 54·f) = (7,721285 ; 49,636833)

j = 2: u3 = 0,9260824918746948
       s  = 438,742                         → segmento 9 (de 419,112 a 473,761)
       f  = (438,742 − 419,112) / 54,649428 = 0,359199
       p0 = (291,6 + 8,4·f ; 54 − 54·f) = (294,617294 ; 34,603108)
```

| j | `u3` | **dump** (10 segmentos) | comprimento exato | 100 segmentos | `t = u3` |
|:---:|:---|:---:|:---:|:---:|:---:|
| 0 | 0,10603183507919312 | **(7,721285 ; 49,636833)** | (7,041336 ; 49,764933) | (7,050675 ; 49,762103) | (9,403221 ; 56,873451) |
| 1 | 0,41712987422943115 | **(111,092979 ; 144,742294)** | (110,938249 ; 145,384872) | (110,941201 ; 145,374307) | (113,049908 ; 145,879525) |
| 2 | 0,9260824918746948 | **(294,617294 ; 34,603108)** | (296,671932 ; 34,951108) | (296,657404 ; 34,948119) | (295,324904 ; 41,072226) |
| 3 | 0,1838092803955078 | **(23,873191 ; 82,503246)** | (22,250856 ; 83,379126) | (22,266431 ; 83,369980) | (26,681175 ; 90,014057) |

O comprimento exato da curva é `475,747299` (os 10 segmentos dão `473,761373`).
Medindo o exato, o leitor erra de **0,13 a 2,05 px** numa coordenada — muito acima
da tolerância `1e-3`. O de 100 segmentos também (de 0,13 a 2,04 px).

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| comprimento exato, ou outro número de segmentos | colunas "exato" e "100 segmentos" |
| acha o segmento certo e devolve `B(t)` interpolado em `t`, em vez da corda | ponto fora da corda, perto da coluna "exato" |
| `t = u3` | a última coluna |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, na rodada 16, lote 7, por ordem da ficha do Diretor (`DIRETOR · 000da3`), com **três** fontes independentes que deram o mesmo número: a conta à mão (escrita antes do código), o runtime TypeScript e o runtime Python — este escrito só pela §9.4.2 e por estes `leiame`, sem abrir o TypeScript. O confronto fechou às 18h21 de 05/10/2026: os dois runtimes concordam campo a campo.

Antes do código, o caso foi visto **falhando** no leitor de antes da 1.1: 0 partículas, às 17h55 de 05/10/2026.
