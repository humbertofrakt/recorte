# A-028 — escala zero não vira NaN

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 5.4, 5.5 |
| Esperado | conferido à mão |

## O que este caso prova

Escala `0` é válida e não pode virar `NaN` nem `Infinity` em lugar nenhum
(5.5). A cadeia continua a se mover: a **translação** usa a matriz completa do
pai, e ela sobrevive mesmo com a parte linear achatada.

## O rig

| Osso | Pai | x | y | scaleX | scaleY |
|:---|:---|---:|---:|---:|---:|
| pai | root | 10 | 20 | 0 | 1 |
| filho | pai | 5 | 3 | 1 | 1 |
| neto | filho | 7 | 2 | 1 | 1 |
| nulo | root | 1 | 2 | 0 | 0 |

## Contas

```
pai:   la = cos(0)*0 = 0    lb = cos(90)*1 = 0
       lc = sin(0)*0 = 0    ld = sin(90)*1 = 1
       -> a=0 b=0 c=0 d=1   worldX=10  worldY=20     (det = 0)

filho: worldX = 0*5 + 0*3 + 10 = 10
       worldY = 0*5 + 1*3 + 20 = 23
       a = 0*1 + 0*0 = 0    b = 0*0 + 0*1 = 0
       c = 0*1 + 1*0 = 0    d = 0*0 + 1*1 = 1

neto:  worldX = 0*7 + 0*2 + 10 = 10
       worldY = 0*7 + 1*2 + 23 = 25
       a=0 b=0 c=0 d=1

nulo:  la = lb = lc = ld = 0   ->   a=b=c=d=0
       worldX = 1   worldY = 2
```

Repare em `neto`: o X do mundo trava em 10, mas o Y continua somando. É o
comportamento certo de uma coluna achatada, não um bug.
