# C-231 — coluna zerada e a guarda do `atan2(0, 0)`

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 3.6, 5.2, 5.5 |
| Esperado | conferido à mão |

## O que este caso prova

Que `atan2(0, 0)` devolve **0**, como 3.6 manda, mesmo quando um dos dois
argumentos é **zero negativo**.

A guarda existe por um motivo concreto e escrito na spec: em JavaScript e em
C++, `atan2(0, −0)` devolve **π**, não zero. Um zero negativo aparece sozinho
sempre que um cosseno negativo multiplica uma escala zero — `cos(180°) × 0 =
−0` — e é exatamente o que acontece com um osso escondido por `scale 0`, que é
como se esconde uma peça de roupa sem apagá-la.

Sem este caso, apagar a guarda passava nos 31 casos antigos. O A-028 tem o caso
degenerado da escala zero, mas nenhum osso dele passa por regra nenhuma, e
`appliedFromWorld` — a única função que chama `atan2` no nível A — só roda sob
regra.

## O rig

```
root
alvo    parent root   x 50   y 0
zerado  parent root   x 4    y 6   rotation 90   scaleX 0   scaleY 0
                      inheritRotation false, inheritScale false,
                      inheritReflection false          (modo onlyTranslation)

regra "tc": transform, mundo absoluto
            bones ["zerado"]   target "alvo"
            mixScaleX 1, todos os outros mix 0
```

Três escolhas fazem o caso funcionar, e nenhuma é enfeite:

1. **`scaleX 0` e `scaleY 0`** zeram as duas colunas da matriz. `ascaleX` cai
   abaixo do limiar de 5.5 e a decomposição vai para o ramo degenerado, onde
   `arotation = 90° − atan2(d, b)`.
2. **`rotation 90` com o modo `onlyTranslation`.** O `b` do osso vale
   `cos(90° + 90°) × 0 = cos(180°) × 0 = −0`. O modo `onlyTranslation` copia a
   matriz local direto (`this.b = lb`), sem multiplicar pela do pai — e é essa
   multiplicação que apagaria o sinal, porque `−0 + 0 = +0`.
3. **`mixScaleX 1` com escala já zerada.** A regra não muda um número sequer
   (o código pula quando `√(a² + c²) = 0`), mas roda `appliedFromWorld` na
   saída. É a maneira mais barata de levar o osso até a função sob teste sem
   embaralhar a conta com o resultado da regra.

## Contas (5.2, 5.5)

```
matriz local, modo onlyTranslation:

  a = cos(90° + 0°) × 0 = +0        c = sin(90°)  × 0 = +0
  b = cos(180°)     × 0 = −0        d = sin(180°) × 0 = +0
                          ^^^^ aqui

appliedFromWorld, ramo degenerado (ascaleX = √(0² + 0²) = 0):

  ascaleY   = √(b² + d²)          = 0
  ashearY   = 0
  arotation = 90° − atan2(d, b)
            = 90° − atan2(+0, −0)
            = 90° − 0°              (guarda de 3.6)
            = 90°
```

Sem a guarda, `atan2(+0, −0) = 180°` e `arotation = −90°`. São 180 graus de
diferença — meia volta — num osso que o animador escondeu, e que volta a
aparecer torto na hora em que a escala for animada de volta para 1.

O `esperado.json` guarda `b: 0` porque o dump reduz a 6 casas e `−0` e `+0`
são o mesmo número escrito. O sinal não aparece na matriz: aparece no
`arotation`, e é por isso que o caso mede os treze campos.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `atan2` sem a guarda de 3.6 | `arotation` −90 em vez de 90: 180° |
| ramo degenerado ausente (divide por `ascaleX` = 0) | `ascaleY` e `arotation` viram `NaN`, que 5.5 manda virar 0 |
| `onlyTranslation` herdando a matriz do pai | o `−0` some e o caso passa por acidente |
