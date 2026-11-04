# B-106 — quem entra em cada canal de geometria do dump

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 12.4, 7.3, 7.4 |
| Esperado | conferido à mão |

## O que este caso prova

Quatro regras da §12.4 que estavam na cabeça de quem escreveu o primeiro
runtime, e em lugar nenhum:

1. O canal **`vertices`** leva `region`, `mesh`, `linkedmesh`, **`clipping`** e
   **`path`**. A §7.4 dá vértices de mundo aos quatro tipos com vértices, e a
   §7.3 dá os quatro cantos a uma `region`.
2. **`boundingbox` NÃO entra em `vertices`**: ele tem o canal
   **`boundingBoxes`** só dele. Sair nos dois contaria a mesma caixa duas
   vezes.
3. O canal **`points`** é um **objeto** por ponto, com os campos `x`, `y` e
   `rotation` — não uma lista de três números.
4. Os canais de geometria **não olham `visible`**. Um slot invisível continua
   entrando. A visibilidade já é medida no canal `slots`; tirar a geometria
   junto esconde os dois erros de uma vez.

## Por que este caso existe

Nada disso estava escrito. Dois runtimes escolheram diferente, e a suíte não
enxergou:

| O que | Runtime A | Runtime B |
|:---|:---|:---|
| `clipping` e `path` em `vertices` | entravam | **não entravam** |
| `points` | `{"x": …, "y": …, "rotation": …}` | `[x, y, rotation]` |
| slot invisível | entrava | **não entrava** |

**Medido no `heroi.bone`:** 40 campos divergentes, e nenhum caso reprovava
ninguém. O canal `points` é o pior dos três, porque os dois lados dizem o
**mesmo número** e mesmo assim não dá para comparar: um harness que case
`points.marca.x` com `points.marca[0]` não existe.

E a omissão é a mais silenciosa das falhas: o executor compara só o que o
`esperado.json` cita, então **um canal que ninguém escreve nunca reprova**. É
o mesmo buraco que a §12.4 já fechou para os campos de `slots` com a frase
"presença de campo é normativa".

O `clipping` decide **o que aparece na tela** e o `path` decide **onde uma
regra de caminho põe os ossos**. Um runtime que erre a forma dos dois desenha
o personagem errado e passa no nível B inteiro.

## O rig

Um osso em `(10, 20)` girado `30°`, e seis slots pendurados nele — um de cada
tipo que tem geometria, mais um invisível:

```
corpo      mesh         quadrado de 40, quatro vértices
caixa      boundingbox  quadrado de 10
mascara    clipping     quadrado de 60, end "trilho"
trilho     path         seis números de âncora, aberto
marca      point        x 7, y 3, rotation 15
escondido  mesh         quadrado de 10, no slot com "visible": false
```

Nada se move: uma amostra só, em `t = 0`, na setup pose. O caso não é sobre
números difíceis; é sobre **quem aparece em qual canal**.

## Contas — o ponto, que é o mais curto de conferir à mão

Matriz do osso a 30°, na origem `(10, 20)`:

```
a = cos 30° = 0,866025     b = −sin 30° = −0,5
c = sin 30° = 0,5          d =  cos 30° =  0,866025
```

Ponto local `(7, 3)`:

```
x = 10 + 7 × 0,866025 − 3 × 0,5      = 10 + 6,062178 − 1,5 = 14,562178
y = 20 + 7 × 0,5      + 3 × 0,866025 = 20 + 3,5 + 2,598076 = 26,098076
rotation = 30 + 15 = 45
```

O dump traz exatamente esses três números, **nomeados**.

## O mapa dos canais, que é o que o caso prende

| chave | canal |
|:---|:---|
| `corpo/corpo` | `vertices` **e** `uvs` |
| `mascara/mascara` | `vertices` |
| `trilho/trilho` | `vertices` |
| `escondido/escondido` | `vertices` **e** `uvs` (mesmo com o slot invisível) |
| `caixa/caixa` | `boundingBoxes`, e **só** ele |
| `marca/marca` | `points`, como objeto |

`mascara` e `trilho` **não** entram em `uvs`: um clipping e um path não têm
textura.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| Deixar `clipping` e `path` fora de `vertices` | duas chaves faltando |
| Pôr `boundingbox` também em `vertices` | uma chave a mais |
| Escrever `points` como lista de três números | `points.marca/marca` incomparável |
| Pular slot invisível | `escondido/escondido` faltando em dois canais |
| Pôr `uvs` num clipping ou num path | duas chaves a mais em `uvs` |
