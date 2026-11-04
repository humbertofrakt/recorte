# C-310 — o aninhado em bloco, sem a marca

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (regra 3), 7.13, 12.4 (`drawList`) |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
poder.bone   slots, na ordem: bola_a · anel · meio · brilho · bola_b   (uma region em cada)
heroi        slots, na ordem: perna · tronco · aura · cabeca          (aura = skeleton poder.bone)
```

A `aura` está no MEIO da ordem do herói de propósito: "em bloco" e "em volta"
dão listas diferentes, e se vê que o lugar do slot deixou de valer.

## O que este caso prova

A frase da 7.11 — *"o filho é desenhado inteiro na posição do slot"* — está na
spec desde 17/09 e **nenhum caso a media**: o canal `drawOrder` só cita os slots
de fora. Este é o chão dos casos C-311 a C-319: sem o campo `around`, nada muda.

## A conta

A volta pelo herói: `perna`, `tronco`, depois o poder INTEIRO na ordem dele
(`bola_a · anel · meio · brilho · bola_b`), depois `cabeca`. **Oito peças.**

## O que um runtime errado daria

| Erro | Lista |
|:---|:---|
| não entra no filho | 3 peças: `perna · tronco · cabeca` |
| põe o filho no fim | as cinco do poder depois de `cabeca` |
