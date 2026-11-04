# A-020 — curvas stepped, linear e bézier

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 9.3 |
| Esperado | conferido à mão |

## O que este caso prova

Os três tipos de curva na mesma animação, na mesma propriedade, nos mesmos
tempos. Três ossos irmãos, cada um com a sua curva, de `x = 0` a `x = 100`
entre `t = 0` e `t = 3`.

## As três timelines

| Osso | `curve` da primeira chave |
|:---|:---|
| linear | ausente (= `"linear"`) |
| stepped | `"stepped"` |
| bezier | `[1, 0, 2, 0]` |

## Contas

**linear** — reta: `v = 100 × t / 3`.

| t | 0 | 0.75 | 1.5 | 3 |
|:---|---:|---:|---:|---:|
| x | 0 | 25 | 50 | 100 |

**stepped** — segura o valor da chave até a próxima: `0` até `t < 3`, e `100`
em `t = 3` (última chave).

**bezier** — as alças de tempo são `cx1 = 1` e `cx2 = 2`, isto é, exatamente um
terço e dois terços do intervalo `[0, 3]`. Com esse par a coordenada de tempo
vira a própria fração:

```
x(s) = (1-s)³·0 + 3(1-s)²s·1 + 3(1-s)s²·2 + s³·3
     = 3s[(1-s)² + 2s(1-s) + s²] = 3s[(1-s) + s]² = 3s
```

Logo `s = t / 3`, sem resolver equação nenhuma. As alças de valor são
`cy1 = cy2 = 0`, então:

```
y(s) = (1-s)³·0 + 3(1-s)²s·0 + 3(1-s)s²·0 + s³·100 = 100 s³
```

| t | s | x |
|:---|---:|---:|
| 0 | 0 | 0 |
| 0.75 | 0.25 | 100 × 0.015625 = **1.5625** |
| 1.5 | 0.5 | 100 × 0.125 = **12.5** |
| 3 | 1 | 100 |

Escolher `cx` em um terço e dois terços é o truque que deixa o caso conferível
sem calculadora. Um runtime que aproxima a bézier por tabela curta erra os
`1.5625` bem antes da tolerância de `1e-3`.

**bezier-fora** — a alça que está **fora** do intervalo, e a correção de 9.3.

A quarta timeline tem `curve: [-2, 0, 2, 100]` no intervalo `[0, 3]`. O `cx1`
vale `−2`, antes do começo do segmento. A §9.3 chama isso de erro do gravador
e manda o **leitor corrigir**, nesta ordem:

```
cx1 = clamp(cx1, t0, t1)   = clamp(−2, 0, 3) = 0
cx2 = clamp(cx2, cx1, t1)  = clamp( 2, 0, 3) = 2
```

A ordem importa: o `cx2` é preso contra o `cx1` **já corrigido**, e não contra
o `t0` original. Sem isso a curva pode sair não monótona em `x`, e aí não
existe um `s` só para cada `t` — o solucionador devolve o que a sorte der.

Depois da correção as alças são `cx1 = 0`, `cy1 = 0`, `cx2 = 2`, `cy2 = 100`:

```
x(s) = (1-s)³·0 + 3(1-s)²s·0 + 3(1-s)s²·2 + s³·3 = 6s² − 3s³
y(s) = (1-s)³·0 + 3(1-s)²s·0 + 3(1-s)s²·100 + s³·100 = 300s² − 200s³
```

Em `s = 0,5`:

```
x = 6(0,25) − 3(0,125) = 1,5 − 0,375 = 1,125
y = 300(0,25) − 200(0,125) = 75 − 25 = 50
```

Ou seja: **em `t = 1,125` o valor é exatamente 50**. É por isso que a amostra
de `t = 1,125` existe — é o ponto em que o parâmetro da bézier é meio, e a
conta fecha à mão.

Um runtime que **não** corrija as alças usa `cx1 = −2`, e a curva de tempo
passa a ser `x(s) = −6(1−s)²s + 6(1−s)s² + 3s³`, que em `s = 0,5` vale `0,375`,
não `1,125`. Medido: o valor em `t = 1,125` sai perto de `30,7` em vez de `50`
— quase 20 de erro, contra uma tolerância de `1e-3`.
