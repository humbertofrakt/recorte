# C-280 — a pele muda a ordem de desenho, e a timeline mede por cima dela

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 4.4 (`skin.drawOrder`, ordem base), 9.5, 5.1 |
| Esperado | conferido à mão (contas abaixo) |

## O que este caso prova

Uma skin pode deslocar a ordem de desenho enquanto está ativa (`skin.drawOrder`),
com a mesma conta da timeline `drawOrder`. O resultado é a **ordem base**. A
timeline `drawOrder` da animação mede os deslocamentos a partir da ordem base,
e a chave `[]` volta para ela — não para a ordem do array.

Três erros que reprovam aqui: ignorar `skin.drawOrder` (em `t = 0` sairia a
ordem do array); aplicar a timeline sobre a ordem do array em vez da base (em
`t = 0,5` o `braco` iria para o índice 1, não para o 0); e a chave `[]`
devolver a ordem do array em vez da base.

## O rig

| Slot | Índice no array |
|:---|---:|
| `corpo` | 0 |
| `capa` | 1 |
| `braco` | 2 |

Skin `vestida`: `drawOrder: [{ slot: capa, offset: +1 }]`. Animação `acenar`:
chave `[]` em 0 e `[{ slot: braco, offset: −1 }]` em 0,5. Sonda: `vestida`
ativa.

## Contas

```
ordem do array:        [corpo, capa, braco]

skin vestida, capa +1: posição da capa = 1 → 1 + 1 = 2
                       ordem[2] = capa;  buracos na ordem do array: corpo, braco
ordem base:            [corpo, braco, capa]

t = 0,   chave []:     ordem base            → [corpo, braco, capa]

t = 0,5, braco −1:     posição do braco NA BASE = 1 → 1 − 1 = 0
                       ordem[0] = braco;  buracos na ordem BASE: corpo, capa
                       → [braco, corpo, capa]
```

Sem a skin, a mesma chave daria `[corpo, braco, capa]` (braco de 2 para 1).
Com a timeline medida sobre a ordem do array em vez da base, daria
`[corpo, braco, capa]` também — o `braco` ficaria atrás do `corpo`, e o caso
reprova.
