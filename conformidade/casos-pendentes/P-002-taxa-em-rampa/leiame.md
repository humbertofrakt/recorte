# P-002 — taxa em rampa — a inversa estável

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §4.2 |
| Esperado | a conta está no leiame; **os números do dump ainda NÃO foram escritos** |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## ATENÇÃO — este caso é de 2ª FASE

A 1ª fase da extensão tem `rate` **fixo**: quem anima é `emitting`, em degraus
(§4.1). Este caso exercita o ramo `linear` da §4.2, que é 2ª fase.

Ele está escrito agora, e não depois, porque a conta dele **já está na spec** e
era isso que precisava ficar fechado: dois leitores que a adivinhem vão adivinhar
diferente, e foi assim que nasceram o C-299 e o C-300. A entrada e a conta estão
aqui; o `esperado.json` traz uma lista **vazia** de propósito, e é preenchido
quando a 2ª fase abrir. **Não mova este caso para `casos/` antes disso.**

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

## Por que a forma estável, e não a outra

A raiz de `s·τ² + 2·r0·τ − 2d = 0` também se escreve

```
τ = (−r0 + sqrt(r0² + 2·s·d)) / s
```

e essa forma **divide por `s`**. Com `s = 0` — um trecho de taxa constante, que
é o caso comum — ela é uma divisão por zero. E com `s` pequeno e `r0` grande ela
subtrai dois números quase iguais, e perde casas. A forma do numerador `2d`
não tem nenhum dos dois problemas e vale para `s = 0` sem ramo especial.

Um leitor que escolha a outra passa neste caso com `s = 40` e quebra no primeiro
arquivo de taxa constante. Por isso a spec **manda** a forma estável, em letras.

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

## Onde este caso mora — e por que ele VOLTOU para cá

**Este caso esteve em `casos/` por engano, em 18/09/2026, e foi devolvido no
mesmo dia.**

| Quando | O quê |
|:---|:---|
| 18/09/2026 | O Planejador moveu **os dezessete** de uma vez, ao ver que os dois runtimes passavam todos |
| 18/09/2026, poucas horas depois | **Devolvido**, porque ele passa sem exercitar nada |

**O motivo, e ele é o que importa.** O anexo tem `rate: 0`; a prova deste caso
está numa **timeline de `rate`**, que é o ramo `linear` da §4.2 e é **2ª fase**;
e o `esperado.json` traz uma lista **vazia**, escrita vazia de propósito. Então
um runtime de 1ª fase — que não implementa a timeline de `rate` — produz zero
partículas, bate com a lista vazia e **passa**.

**Passar não é provar.** Com este caso em `casos/`, um `P: 17/17` valia
dezesseis provas e um caso mudo — e o número dizia dezessete. É a terceira cara
da regra 21 do projeto: *a prova dizendo que está tudo bem quando não olhou.*

## O que tem de acontecer para ele voltar

**A 2ª fase da extensão.** Concretamente:

1. A §4.2 ganha o ramo `linear` da integral da taxa em **serviço** — hoje ele
   está escrito, mas nenhum runtime o implementa;
2. `rate` passa a ser animável (na 1ª fase é um número fixo no anexo, e quem
   anima é `emitting`);
3. o `esperado.json` deste caso é **preenchido** com as partículas que a conta
   do leiame acima dá — a começar pela partícula 7, em `τ = 0.591608`;
4. e só então os três resultados se confrontam, como em qualquer outro caso.

**Enquanto isso não acontecer, ele fica aqui.** Um caso que já foi promovido uma
vez por engano é candidato a ser promovido de novo pelo mesmo engano — quem o
mover de novo antes da 2ª fase estará repondo um número que mente.
