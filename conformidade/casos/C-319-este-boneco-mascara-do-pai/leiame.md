# C-319 — a máscara de quem recebe não corta a peça marcada

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: clipping), 7.7 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
heroi        slots: recorte · perna · aura · cabeca
             recorte = clipping, end: "cabeca"; aura = poder.bone, around "meio"
poder.bone   slots: bola_a · anel · meio · brilho · bola_b
```

## O que este caso prova

A peça marcada está FORA da ordem de quem a recebe. A máscara do herói vai de
`recorte` a `cabeca`, e a `aura` está no meio desse trecho — mas não é cortada.

## A conta

| Peça | `clips` |
|:---|:---|
| `aura/bola_a`, `aura/anel` (atrás) | `[]` |
| `perna`, `cabeca` | `["recorte/recorte"]` |
| `aura/brilho`, `aura/bola_b` (na frente) | `[]` |

**Seis peças.**

## O que um runtime errado daria

Um que parta a lista mas guarde a máscara que valia no lugar do slot dá
`clips: ["recorte/recorte"]` nas quatro peças da aura. Sem a marca (em bloco),
esse seria o certo: a 7.7 corta o aninhado como um bloco.
