# C-263 — física: o amortecimento, com a conta à mão

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.5 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O que este caso prova

Os outros casos de física usam `damping: 1`: a linha `velocidade *= d` nunca
era provada (achado do Diretor, 05/10/2026). Aqui `damping` é 0,5, e o esperado
é **calculado à mão**, não gerado: a mola está desligada (`strength: 0`), o osso
não se move, e só o vento empurra em X.

## O rig

```
haste  filha do root, em (0, 100), length 50. Nada se move.
physics: x 1 (y, rotation, scaleX, shearX = 0), strength 0, damping 0.5,
         mass 1, wind 36, gravity 0, fps 60, inertia 0.5, limit 5000
referenceScale do esqueleto: 100
```

## A conta (6.5, o trecho de X)

```
step = 1/60          d = 0,5 ^ (60 × 1/60) = 0,5
m = (1/mass) × step = 1/60
w = wind × referenceScale = 3600          e = strength = 0

a cada passo:   v += (w − desloc × e) × m  =  v + 60
                desloc += v × step
                v *= d
```

| Passo | `v` depois de somar | `desloc` | `v` depois do freio | sem freio, `desloc` seria |
|:---:|---:|---:|---:|---:|
| 1 | 60 | 1 | 30 | 1 |
| 2 | 90 | **2,5** | 45 | 3 |
| 3 | 105 | 4,25 | 52,5 | 6 |
| 4 | 112,5 | **6,125** | 56,25 | 10 |

**Quantos passos em cada amostra.** O relógio anda de 0,01 em 0,01 s. O primeiro
quadro (`t = 0`) só liga a física (`reset`) e zera `remaining`. Depois, um passo
cada vez que o tempo acumulado alcança 1/60 s (0,01667):

| t | acumulado antes | passos | sobra |
|:---:|---:|:---:|---:|
| 0,01 | 0,01 | 0 | 0,01 |
| 0,02 | 0,02 | 1 | 0,00333 |
| 0,03 | 0,01333 | 0 | 0,01333 |
| 0,04 | 0,02333 | 1 | 0,00667 |

Em 0,04 s: **2 passos**, `worldX = 0 + 2,5`. Em 0,05 o acumulado encosta em
1/60 exato, e o arredondamento decide se o terceiro passo cai em 0,05 ou em
0,06; pelos dois caminhos, em 0,07 já foram **4 passos**: `worldX = 6,125`.
Por isso as amostras fogem de 0,05 e de 0,10.

`worldY` fica em 100: `y` da regra é 0.

## O que um runtime errado daria

| Erro | 0,04 | 0,07 |
|:---|---:|---:|
| não freia (`d = 1`) | 3 | 10 |
| freia antes de somar ao deslocamento | 1,25 | 3,0625 |
| física desligada | 0 | 0 |

Tolerância: `1e-2` px (3.6, linha da física).
