# C-315 — níveis: o herói, com o poder em volta, entra em bloco no mundo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: um nível só) |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
mundo        slots, na ordem: chao · heroi · ceu        (heroi = skeleton heroi.bone)
heroi.bone   slots: perna · tronco · aura · cabeca      (aura = poder.bone, around: "meio")
poder.bone   slots: bola_a · anel · meio · brilho · bola_b
```

A lista do herói sozinho é a do C-311:
`aura/bola_a · aura/anel · perna · tronco · cabeca · aura/brilho · aura/bola_b`.

No mundo, o anexo `heroi` **não** tem `around`.

## O que este caso prova

"Este boneco" é quem recebe a peça, e só ele. O poder fica em volta do herói;
o herói inteiro, com o poder, ocupa o lugar do slot dele no mundo.

## A conta

`chao`, depois a lista inteira do herói com o prefixo `heroi/`, depois `ceu`.
**Nove peças.**

## O que um runtime errado daria

Um que leve o "atrás" do poder até o fundo de TUDO põe `heroi/aura/bola_a` e
`heroi/aura/anel` antes de `chao`, e as duas da frente depois de `ceu`.
