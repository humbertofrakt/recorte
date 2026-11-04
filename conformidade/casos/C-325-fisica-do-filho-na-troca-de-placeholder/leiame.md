# C-325 — a física do filho continua na troca de placeholder

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 ("Trocar de placeholder com a mesma `uri` não é ficar ativo": *a mesma instância, o mesmo relógio, a mesma animação, a mesma física*), 6.5 |
| Esperado | **digitado da conta abaixo** (rodada 34, 05/10/2026): a recorrência à mão nos três primeiros passos; o resto por uma implementação da §6.5 escrita só pelo pseudocódigo da spec, que reproduz o C-262 nas quatro amostras. Nenhum runtime foi consultado antes |

## O rig

```
cabelo.bone   root · fio (length 100); physics "vento" no fio: x 1, wind 1, strength 100, fps 60
              referenceScale 100; nenhuma animação
heroi         slot cab no root, dois placeholders: cabelo_a e cabelo_b, os dois uri "cabelo.bone"
              animação "troca", 1 s: slot/attachment de cab = cabelo_a em 0, cabelo_b em 0,11
```

Sonda: `physicsDt` do C-262, amostras nos passos 6 e 12. A troca cai no passo 7.

## A conta

A mesma recorrência do C-264 (`v += (100 − 100·x)/60 ; x += v/60`), sem
interrupção: a instância não muda.

| Amostra | Passo | `cab/fio.worldX` |
|:---:|:---:|:---:|
| 0,1 | 6 | **0,531095** |
| 0,2 | 12 | **1,494215** |

## O que um runtime errado daria

Um que crie instância nova na troca ancora a física no passo 7, e no passo 12 tem
cinco passos simulados: **0,390255**.

## O que o verde prova

O que o C-320 deixou escrito que não provava: *"Que a instância é a mesma (a física
do filho continuando)"*. O relógio é conta; a física é estado, e só uma física que
continua dá 1,494215.

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso passou de primeira nos dois runtimes.
