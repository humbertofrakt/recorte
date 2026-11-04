# C-318 — a máscara do filho começa atrás e acaba na frente

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: clipping), 7.7 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
heroi        slots: perna · tronco · aura · cabeca          (aura: around "meio")
poder.bone   slots: mascara · anel · meio · brilho · bola_b
             mascara = clipping, end: "brilho", um quadrado de 100 × 100
```

## O que este caso prova

A máscara do filho é resolvida na volta **do filho**, antes de partir a lista.
Cada peça leva a sua máscara para o grupo em que cair.

## A conta (7.7, na ordem do poder)

| Slot | O que acontece |
|:---|:---|
| `mascara` | liga a máscara. Não é desenhada |
| `anel` | cortado |
| `meio` | a marca: não entra na lista. Não é o `end`, a máscara segue |
| `brilho` | cortado. É o `end`: a máscara desliga |
| `bola_b` | livre |

Atrás: `anel` (cortado). Na frente: `brilho` (cortado), `bola_b` (livre).
"Cortado" = `clips: ["aura/mascara/mascara"]`. As três peças do herói: `clips: []`.

## O que um runtime errado daria

Um que refaça a volta do clipping DEPOIS de partir perde a máscara do `brilho`
(a `mascara` ficou no outro grupo), ou a estende às peças do herói.

## O que este caso NÃO prova

A máscara cujo `end` é o próprio slot do meio. A 7.11 diz que ele conta na
volta como contaria sem a marca; não há caso.
