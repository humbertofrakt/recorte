# C-321 — a troca de placeholder com OUTRA `uri`: o relógio do filho zera

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

`poder_bloco` aponta para `outro.bone`, uma cópia igual de `poder.bone` com outro nome de arquivo.

## O que este caso prova

É o chão do C-320: o que continua o relógio é a **mesma `uri`**, e não "o mesmo
slot" nem "o mesmo conteúdo". Outra entidade começa em 0 na chave que a mostra
(7.11; Apêndice C, regra 16), como sempre foi.

## A conta

| Amostra | Chave em vigor | Início da corrida | Tempo do filho | `aura/orbe.worldX` |
|:---:|:---|:---:|:---:|---:|
| 0,5 | `poder` (0) | 0 | 0,5 | **50** |
| 0,9 | `poder_bloco` (0,75), outra `uri` | **0,75** | 0,15 | **15** |

## O que um runtime errado daria

**90** em 0,9: um que nunca zere na troca, ou que compare o conteúdo do arquivo
em vez do nome. Sem este caso, esse runtime passaria no C-320.

Este caso **já passava** antes do conserto do C-320 (era o comportamento de
sempre). Vermelho só com 90 no esperado, provado numa cópia fora da casa.
