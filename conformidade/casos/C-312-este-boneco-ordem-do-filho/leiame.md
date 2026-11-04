# C-312 — a ordem do filho muda por chave

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: a ordem do instante), 9.5 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
poder.bone   slots, na ordem: bola_a · anel · meio · brilho · bola_b   (uma region em cada)
heroi        slots, na ordem: perna · tronco · aura · cabeca          (aura = skeleton poder.bone)
```

A `aura` está no MEIO da ordem do herói de propósito: "em bloco" e "em volta"
dão listas diferentes, e se vê que o lugar do slot deixou de valer.

O poder toca `orbita` (1 s, em laço) pelo campo `animation` do anexo. O herói
não toca nada: o relógio do poder é o da sonda.

## O que este caso prova

O corte é pela ordem do poder **no instante**. Uma bolinha passa de trás para a
frente do herói por uma chave `drawOrder` do próprio poder (o exemplo do
Humberto: *"bolinhas pela frente e por trás"*). E a própria marca muda de lugar.

## A conta (9.5)

Base do poder: `bola_a`(0) · `anel`(1) · `meio`(2) · `brilho`(3) · `bola_b`(4).

| Chave | Conta | Ordem do poder |
|:---|:---|:---|
| 0: `[]` | a base | `bola_a · anel · meio · brilho · bola_b` |
| 0,5: `bola_a +3` | vai para 0 + 3 = 3; os outros enchem 0, 1, 2 e 4 | `anel · meio · brilho · bola_a · bola_b` |
| 0,8: `meio −2` | vai para 2 − 2 = 0; os outros enchem 1 a 4 | `meio · bola_a · anel · brilho · bola_b` |

| Amostra | Atrás | Na frente |
|:---:|:---|:---|
| 0,25 | `bola_a · anel` | `brilho · bola_b` |
| 0,6 | `anel` | `brilho · bola_a · bola_b` |
| 0,9 | nada | `bola_a · anel · brilho · bola_b` |

No meio, sempre: `perna · tronco · cabeca`.

## O que um runtime errado daria

Um que corte pela ordem **do arquivo** do poder dá a lista de 0,25 nas três
amostras: passa na primeira e erra as outras duas.
