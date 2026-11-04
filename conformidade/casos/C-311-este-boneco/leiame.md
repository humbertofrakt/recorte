# C-311 — "Este boneco": o poder em volta do herói

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`), 7.13 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
poder.bone   slots, na ordem: bola_a · anel · meio · brilho · bola_b   (uma region em cada)
heroi        slots, na ordem: perna · tronco · aura · cabeca          (aura = skeleton poder.bone)
```

A `aura` está no MEIO da ordem do herói de propósito: "em bloco" e "em volta"
dão listas diferentes, e se vê que o lugar do slot deixou de valer.

O anexo da `aura` traz `"around": "meio"`.

## O que este caso prova

As três linhas do Humberto: a imagem do meio não é desenhada; o que está atrás
dela vai para trás do herói INTEIRO; o que está na frente, para a frente do
herói INTEIRO.

## A conta

Na ordem do poder, `meio` é o índice 2. Antes: `bola_a`, `anel`. Depois:
`brilho`, `bola_b`.

```
atras  = aura/bola_a · aura/anel
meio   = perna · tronco · cabeca          (a aura não ocupa mais o lugar dela)
frente = aura/brilho · aura/bola_b
```

**Sete peças; `aura/meio/meio` não está.** O canal `drawOrder` continua
`perna, tronco, aura, cabeca`: o slot não saiu da ordem do herói, só o desenho.

## O que um runtime errado daria

| Erro | Lista |
|:---|:---|
| ignora o campo (leitor 1.0) | a do C-310: em bloco, com `aura/meio` |
| parte, mas no lugar do slot | `perna · tronco · aura/bola_a · aura/anel · aura/brilho · aura/bola_b · cabeca` |
| parte, e desenha o meio | oito peças |
