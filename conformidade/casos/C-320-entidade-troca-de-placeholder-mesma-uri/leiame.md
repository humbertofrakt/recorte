# C-320 — a troca de placeholder com a MESMA `uri`: o relógio do filho continua

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (o relógio do filho; `around` ligado e desligado por chave), Apêndice C 1 e 16 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, seção "O lote 2b", 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
poder.bone   ossos: root, orbe (filho do root, em 0, 0)
             slots: bola_a (no orbe) · meio · bola_b
             animação "andar", 2 s, em laço: orbe.x de 0 a 200, linear
             ou seja: orbe.x = 100 × tempo do filho
heroi        slots: perna · aura · cabeca, tudo no root em (0, 0)
             aura tem dois placeholders:
               poder        skeleton, around "meio", animation "andar"
               poder_bloco  skeleton, SEM around,    animation "andar"
             animação "troca", 1 s: slot/attachment de aura = poder em 0, poder_bloco em 0,75
```

Os dois placeholders apontam para `poder.bone`.

## O que este caso prova

Desligar a marca "Este boneco" no meio da animação (dois placeholders e a chave
`slot/attachment`) **não recomeça** a animação do poder. A corrida de chaves que
dá o zero do relógio recua enquanto a chave anterior mostrar um anexo `skeleton`
da **mesma `uri`** (Apêndice C, regra 1). Decisão do Diretor, 05/10/2026.

## A conta

`tempo do filho = (tempo do pai − início da corrida) × timeScale`, e `orbe.x = 100 × tempo do filho`.

| Amostra | Chave em vigor | Início da corrida | Tempo do filho | `aura/orbe.worldX` |
|:---:|:---|:---:|:---:|---:|
| 0,5 | `poder` (0) | 0 | 0,5 | **50** |
| 0,9 | `poder_bloco` (0,75) | **0**: a chave de 0 é da mesma `uri`, a corrida recua até ela | 0,9 | **90** |

A lista de desenho: em 0,5, em volta (`aura/bola_a · perna · cabeca · aura/bola_b`);
em 0,9, em bloco, com o meio (`perna · aura/bola_a · aura/meio · aura/bola_b · cabeca`).

## O que o runtime de antes dava

**15** em 0,9: a corrida era só de chaves com o **mesmo nome** de placeholder, o
zero pulava para 0,75, e `0,9 − 0,75 = 0,15`. O poder dava um salto para trás no
quadro da troca. Visto vermelho em 05/10/2026, antes do conserto.

## O que este caso NÃO prova

Que a **instância** é a mesma (a física do filho continuando): o relógio é conta,
não estado, e o dump não enxerga a diferença. Isso é provado por teste no
runtime (`runtime/testes/aninhado.test.ts`). E não prova a troca por **pele**.
