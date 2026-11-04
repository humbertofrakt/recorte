# C-316 — níveis: o herói, com o poder em volta, posto em volta do mundo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: corta-se a lista inteira do filho) |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
mundo        slots, na ordem: chao · heroi · ceu        (heroi = skeleton heroi.bone)
heroi.bone   slots: perna · tronco · aura · cabeca      (aura = poder.bone, around: "meio")
poder.bone   slots: bola_a · anel · meio · brilho · bola_b
```

A lista do herói sozinho é a do C-311:
`aura/bola_a · aura/anel · perna · tronco · cabeca · aura/brilho · aura/bola_b`.

No mundo, o anexo `heroi` tem `"around": "tronco"`.

## O que este caso prova

Corta-se a lista **inteira** do filho no slot do meio dele. O "atrás" que o
filho já tinha vai junto para trás; o "na frente", para a frente.

## A conta

A lista do herói, com o lugar do `tronco` marcado:

```
aura/bola_a · aura/anel · perna · [tronco] · cabeca · aura/brilho · aura/bola_b
```

| Grupo do mundo | Peças |
|:---|:---|
| atras | `heroi/aura/bola_a · heroi/aura/anel · heroi/perna` |
| meio | `chao · ceu` |
| frente | `heroi/cabeca · heroi/aura/brilho · heroi/aura/bola_b` |

**Oito peças; `heroi/tronco/tronco` não está.** Com a cebola a lista é a mesma:
há uma marca só por nível.

## O que um runtime errado daria

Um que corte só os slots comuns do herói e esqueça os grupos dele perde as
quatro peças do poder, ou as deixa no meio.
