# P-002 — taxa em rampa — a inversa estável

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §4.2 (o ramo `linear`, 2ª fase) |
| Esperado | **preenchido em 05/11/2026** por uma conta à parte (abaixo), antes de rodar runtime |
| Estado | **em `casos/`** desde 05/11/2026: as três fontes batem |

## A 2ª fase abriu — só para `rate`

Em 05/11/2026 a timeline de `rate` passou a valer nos dois runtimes: é o ramo
`linear` da §4.2, a taxa animada por integral. **Só `rate`.** O resto da 2ª
fase (sub-emissor, rastro, ruído, "manter a semente") continua fora.

## O que este caso prova

Que a inversa da integral da taxa usa a **forma estável**, e não a fórmula de
Bhaskara direta.

## A conta

`rate` vai de `0` a `40` entre `t = 0` e `t = 1`, `linear`. Então
`s = (40 − 0) / (1 − 0) = 40`, `r0 = 0`, e

```
E(t) = ∫ rate = 20·t²
```

A partícula 7 nasce quando `E(t) = 7`:

```
τ = 2d / (r0 + sqrt(r0² + 2·s·d))        com d = 7 − 0 = 7
  = 14 / (0 + sqrt(0 + 2·40·7))
  = 14 / sqrt(560)
  = 0.591608
```

Conferindo por `E(t) = 20·t²`: `sqrt(7/20) = 0.591608`. Bate.

## O que o `esperado.json` traz — e de onde saiu

Três instantes. **A conta não usa a fórmula da spec:** ela inverte a própria
`E`, pela raiz direta, e por isso não copia o runtime (regra 26).

```
em [0, 1]:   E(t) = 20·t²             →  t_i = sqrt(i / 20)
depois de 1: E(t) = 20 + 40·(t − 1)   →  t_i = 1 + (i − 20) / 40
vida 2, velocidade (0, 100), sem gravidade:  x = 0,  y = 100·idade
```

| Instante | Vivas | O que o instante prende |
|:---|:---:|:---|
| `0.6` | 8 (0 a 7) | a partícula 7 em `0.591608`, idade `0.008392` |
| `1` | 21 (0 a 20) | a 20 nasce **na fronteira**, `t_i = 1`, idade 0 |
| `1.31` | 33 (0 a 32) | os índices 20 a 32 caem no trecho **depois** da rampa, onde `s = 0` |

O índice 0 nasce em `t = 0` com a taxa em `0`: ali a forma estável é `0 / 0`, e
a partícula nasce **na fronteira**, onde `E` a alcança. A spec ganhou essa linha.

## Por que a forma estável, e não a outra

A raiz de `s·τ² + 2·r0·τ − 2d = 0` também se escreve

```
τ = (−r0 + sqrt(r0² + 2·s·d)) / s
```

e essa forma **divide por `s`**. Com `s = 0` — um trecho de taxa constante, que
é o caso comum — ela é uma divisão por zero. E com `s` pequeno e `r0` grande ela
subtrai dois números quase iguais, e perde casas. A forma do numerador `2d`
não tem nenhum dos dois problemas e vale para `s = 0` sem ramo especial.

Um leitor que escolha a outra quebra no primeiro trecho de taxa constante. **Este
caso tem um:** depois da chave de `t = 1` a taxa fica em `40` e `s = 0`. Provado
em 05/11/2026, trocando a fórmula do runtime TypeScript pela outra numa cópia:
o P-002 reprova em `t = 1` e `t = 1.31` (22 e 34 vivas em vez de 21 e 33), e
outros dezessete casos P caem junto.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `τ = (−r0 + sqrt(…)) / s` | passa aqui, quebra com `s = 0` |
| integra a taxa quadro a quadro | `t_i` depende do ritmo de quadro |
| usa a taxa do instante em vez da integral | nascimentos regulares demais |

---

## Antes de qualquer caso

Um leitor que declara **P** tem de reproduzir os cinco números de referência da
§3.2 da extensão, exatos:

| Entrada | Saída |
|:---|:---|
| `pcg(0)` | `129708002` |
| `pcg(42)` | `1223963391` |
| `pcg(0xFFFFFFFF)` | `3861530882` |
| `acaso(42, 0, 7, 0)` | `0.4190843105316162` |
| `acaso(42, 0, −3, 0)` | `0.5181800723075867` |

Se algum deles não bater, **pare aqui**: nenhum caso de partícula vai passar, e
o defeito é o hash, não a conta.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026**, com as **três** fontes independentes
batendo: a conta acima (escrita antes de rodar runtime), o runtime TypeScript e
o runtime Python. Antes do conserto, os dois runtimes davam **zero** partículas
nos três instantes — o defeito existia, e foi visto (regra 26).

| Quando | O quê |
|:---|:---|
| 18/09/2026 | Escrito com a lista **vazia** de propósito. O Planejador o moveu para `casos/` junto com os outros dezesseis |
| 18/09/2026, poucas horas depois | **Devolvido** para `casos-pendentes/`: passava sem exercitar nada |
| 05/11/2026 | A 2ª fase de `rate` em serviço, o esperado preenchido, os dois runtimes passando. **Entrou** |

**Por que ele tinha voltado, e por que isso não vale mais.** O anexo tem `rate: 0`
e a prova está numa **timeline de `rate`**. Com a lista vazia, um runtime de 1ª
fase produzia zero partículas e **passava**. Agora a lista tem 8, 21 e 33
partículas: **um runtime sem a rampa reprova**, com o número.
