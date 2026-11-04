# C-314 — duas peças marcadas no mesmo boneco: a cebola

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`: dois filhos) |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
heroi        slots, na ordem: escudo · perna · aura · cabeca
escudo.bone  slots: fundo · centro · frente      (around: "centro")
poder.bone   slots: bola_a · anel · meio · brilho · bola_b   (around: "meio")
```

## O que este caso prova

**A cebola** (decisão do Diretor, 05/10/2026; vai ao Humberto como pergunta, com
a cebola de sugestão). A peça de slot mais alto na ordem de quem recebe ABRAÇA
a de slot mais baixo: fica mais na frente na metade da frente, e **mais atrás**
na metade de trás.

## A conta

A volta pelo herói, slot a slot. O "atrás" de cada peça marcada entra no
INÍCIO do grupo de trás; a "frente", no FIM do grupo da frente.

| Slot | atras | meio | frente |
|:---|:---|:---|:---|
| `escudo` | `escudo/fundo` | | `escudo/frente` |
| `perna` | | `perna` | |
| `aura` | `aura/bola_a · aura/anel` · `escudo/fundo` | | `escudo/frente` · `aura/brilho · aura/bola_b` |
| `cabeca` | | `perna · cabeca` | |

Lista: `aura/bola_a · aura/anel · escudo/fundo · perna · cabeca · escudo/frente · aura/brilho · aura/bola_b`. **Oito peças.** A aura (slot 2) fica por fora do escudo (slot 0), dos dois lados.

## A outra leitura, que este caso reprova

"A ordem dos slots decide nas duas metades" (o atrás no FIM do grupo):

`escudo/fundo · aura/bola_a · aura/anel · perna · cabeca · escudo/frente · aura/brilho · aura/bola_b`

Só as três primeiras posições mudam. Era a proposta do plano; o Diretor trocou.
