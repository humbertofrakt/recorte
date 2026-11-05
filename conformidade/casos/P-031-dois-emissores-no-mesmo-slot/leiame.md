# P-031 — dois emissores no mesmo slot, cada um com a sua torneira

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` (1ª fase: só `emitting`) |
| Spec | §9.1 da spec principal (a identidade da timeline); §9 da extensão |
| Esperado | conta à mão abaixo, **antes** de rodar runtime |

## O que este caso prende

A identidade de uma timeline é `(type, target, property, skin, attachment)`
(§9.1 da spec). Uma timeline `BONE_particle` tem os cinco. Dois emissores no
mesmo slot — `jato` e `jato2`, dois placeholders — com uma timeline de
`emitting` **cada um** são duas timelines, e não uma repetida.

Um leitor que deixe `attachment` de fora da identidade acha que a segunda
repete a primeira, fica com **a última** (a regra da repetida) e a torneira do
`jato` some: ele continua soltando partícula depois de `0.5`.

## A conta

`jato`: `rate 10`, `lifetime [2, 2]`, `emitting` liga em `0` e fecha em `0.5`.
`jato2`: `rate 10`, sempre aberto; a timeline dele vem **depois** no arquivo.
O slot mostra o `jato`.

```
t_i = i / 10, para i = 0..4       // E(0.5) = 5: o índice 5 cai com a torneira fechada
em t = 0.8:  5 vivas, idades 0.8, 0.7, 0.6, 0.5, 0.4;  y = 100·idade
```

## O que falha aqui

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| identidade sem `attachment`: a timeline do `jato2` "repete" a do `jato` | **9 vivas** (0 a 8): a torneira do `jato` sumiu. **O runtime TypeScript dava isso até 05/11/2026** — é defeito da 1ª fase, não da 2ª |
| aplica a timeline do `jato2` ao `jato` | idem |

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima, o runtime TypeScript e o runtime Python. O TypeScript
antigo dava 9 vivas (visto, regra 26); o Python já acertava.
