# X-307 — `around` com um slot que o filho não tem

| Item | Valor |
|:---|:---|
| Nível | X |
| Spec | 7.11 (`around`), 2.5 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
poder.bone   slots, na ordem: bola_a · anel · meio · brilho · bola_b   (uma region em cada)
heroi        slots, na ordem: perna · tronco · aura · cabeca          (aura = skeleton poder.bone)
```

A `aura` está no MEIO da ordem do herói de propósito: "em bloco" e "em volta"
dão listas diferentes, e se vê que o lugar do slot deixou de valer.

O anexo da `aura` traz `"around": "nao_existe"`.

## O que este caso prova

Onde o leitor não entende, ele não improvisa (2.5): o filho é desenhado **em
bloco**, na posição do slot, como sem o campo. E avisa uma vez (o aviso não é
medido pelo dump).

## A conta

A mesma lista do C-310: oito peças, com `aura/meio/meio`.

## O que um runtime errado daria

| Palpite silencioso | Lista |
|:---|:---|
| "sem meio, tudo atrás" | as cinco do poder antes de `perna` |
| "sem meio, tudo na frente" | as cinco do poder depois de `cabeca` |
| "sem meio, não desenha" | `perna · tronco · cabeca` |
