# X-312 — região de atlas com `rotation` fora de 0 e 90 vira `0`

| Item | Valor |
|:---|:---|
| Nível | **X** (compatibilidade). Atlas é nível A |
| Spec | 2.5 (*"`atlas.region.rotation` — Valor fora de `0` e `90` — Usa `0`"*), 10.3, 10.4 |
| Esperado | **o mesmo do B-102**, byte a byte |

## O que este caso prende

A entrada e o atlas são os do **B-102** (região com corte, sem giro), com uma
troca só: a região ganhou `"rotation": 45`. Pela §2.5 o leitor usa `0` — então
o desenho é o do B-102, e as contas estão no `leiame` dele.

## O que falha aqui (visto em 05/11/2026, numa cópia)

| Erro no leitor | O que a suíte mostra |
|:---|:---|
| trata qualquer giro diferente de 0 como 90 | as `uvs` saem giradas — reprova por `0.47` |

Um leitor que tentasse girar a região em 45° também reprova: a fórmula da §10.4
só existe para 0 e 90.

## O que este verde NÃO prova (regra 28)

O aviso. E a entrada **não passa no validador** (`rotation` tem `enum` 0/90 no
schema): é de propósito, como os outros casos X.

## Onde este caso mora

**Entrou em `casos/` em 05/11/2026.** O esperado é o do B-102, conferido à mão
lá; os dois runtimes passam.
