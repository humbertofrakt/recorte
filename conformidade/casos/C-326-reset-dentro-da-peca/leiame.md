# C-326 — a chave `reset` dentro da peça dispara

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 7.11 ("Física e constraints do filho rodam normalmente"; a camada 2 é a animação do filho), 9.8, 8.6, 6.5 |
| Esperado | **digitado da conta abaixo** (rodada 34, 05/10/2026): a recorrência à mão nos três primeiros passos; o resto por uma implementação da §6.5 escrita só pelo pseudocódigo da spec, que reproduz o C-262 nas quatro amostras. Nenhum runtime foi consultado antes |

## O rig

```
cabelo.bone   root · fio (length 100); physics "vento" no fio: x 1, wind 1, strength 100, fps 60
              animação "sopro", 1 s: constraint vento.reset, chave em 0,11
heroi         slot cab: placeholder "cabelo" = skeleton cabelo.bone, animation "sopro", loop false
              animação "fica", 1 s: slot/attachment de cab = cabelo em 0
```

O relógio do filho começa em 0 com o anexo (7.11) e anda com o do pai
(`timeScale 1`). A chave em 0,11 é cruzada no passo 7 (`0,1 < 0,11 <= 0,11667`).

## A conta

A recorrência do C-264. Até o passo 6, nada a separar. No passo 7 o `reset`
ancora; 8, 9 e 10 simulam.

| Amostra | Passo | `cab/fio.worldX` |
|:---:|:---:|:---:|
| 0,1 | 6 | **0,531095** |
| 0,16667 | 10 | **0,162830** (o `x` do passo 3) |

## O que um runtime errado daria

| Erro | 0,16667 |
|:---|:---:|
| não dispara o `reset` da animação do filho | **1,180874** |
| dispara depois do `physicsApply` (ver C-264) | 0,082562 |

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso derrubou o **TypeScript** e o **Python** (a chave `reset` da animação do filho não disparava: 1,180874); consertados os dois, e a §9.8 da spec ganhou a ordem (o `reset` antes do `physicsApply`, também no filho). O Godot ainda dá 1,180874 até copiar o Python.
