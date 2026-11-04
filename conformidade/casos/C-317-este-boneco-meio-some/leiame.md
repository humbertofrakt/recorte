# C-317 — a imagem do meio some, e a marca continua

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: a marca é o slot) |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
poder.bone   slots, na ordem: bola_a · anel · meio · brilho · bola_b   (uma region em cada)
heroi        slots, na ordem: perna · tronco · aura · cabeca          (aura = skeleton poder.bone)
```

A `aura` está no MEIO da ordem do herói de propósito: "em bloco" e "em volta"
dão listas diferentes, e se vê que o lugar do slot deixou de valer.

O poder toca `some` (1 s): em 0,5 a chave `slot/attachment` esvazia o slot `meio`.

## O que este caso prova

A marca é o **slot**, não a imagem. Vazio, o slot continua no índice 2 da ordem
do poder, e o corte continua ali.

## A conta

Em 0,25 e em 0,75 a ordem do poder é a base. Antes de `meio`: `bola_a · anel`.
Depois: `brilho · bola_b`. **A mesma lista do C-311 nas duas amostras.**

## O que um runtime errado daria

Um que procure o meio entre as peças **desenháveis** não o acha em 0,75: cai
para o bloco (`perna · tronco · aura/bola_a · aura/anel · aura/brilho · aura/bola_b · cabeca`),
ou põe tudo de um lado só.

## O que este caso NÃO prova

`visible: false` e a troca por pele. A regra é a mesma (7.11), mas só o anexo
`null` é medido aqui.
