# C-313 — a ordem de quem recebe muda por chave, e a marca desliga por chave

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 (`around`), 9.5 |
| Esperado | **digitado à mão**, da conta abaixo (plano `12 ESTE BONECO`, 05/10/2026). Nenhum runtime foi consultado |

## O rig

```
poder.bone   slots, na ordem: bola_a · anel · meio · brilho · bola_b   (uma region em cada)
heroi        slots, na ordem: perna · tronco · aura · cabeca          (aura = skeleton poder.bone)
```

A `aura` está no MEIO da ordem do herói de propósito: "em bloco" e "em volta"
dão listas diferentes, e se vê que o lugar do slot deixou de valer.

O slot `aura` tem dois placeholders da mesma `uri`: `poder` (com `around`) e
`poder_bloco` (sem). O herói toca `troca` (1 s). O poder está parado.

## O que este caso prova

1. Uma chave `drawOrder` do herói muda o herói por dentro e **não** move a peça
   marcada: ela está fora dele.
2. A marca liga e desliga pela chave `slot/attachment`, sem timeline nova. Sem a
   marca, a peça volta ao lugar do slot **na ordem do instante**, e o meio volta
   a ser desenhado.

## A conta

Base do herói: `perna`(0) · `tronco`(1) · `aura`(2) · `cabeca`(3).
Chave em 0,5, `cabeca −3`: vai para 3 − 3 = 0; os outros enchem 1, 2 e 3:
`cabeca · perna · tronco · aura`.

| Amostra | Ordem do herói | Placeholder | Lista |
|:---:|:---|:---|:---|
| 0,25 | a base | `poder` (marcado) | a do C-311 |
| 0,6 | `cabeca · perna · tronco · aura` | `poder` (marcado) | atrás · `cabeca · perna · tronco` · frente |
| 0,9 | a mesma | `poder_bloco` | `cabeca · perna · tronco` · o poder inteiro, com `meio` (8 peças) |

## O que um runtime errado daria

Em 0,9, um que guarde a marca "ligada" depois da troca de placeholder dá a
lista de 0,6. Um que devolva a peça ao lugar do slot **no arquivo** (índice 2)
põe o poder entre `perna` e `tronco`.

## O que este caso NÃO prova

Se o relógio do filho continua ou zera na troca de placeholder com a mesma
`uri`: o poder está parado de propósito.
