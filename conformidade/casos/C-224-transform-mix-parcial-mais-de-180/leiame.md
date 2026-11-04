# C-224 — mistura parcial com diferença de mais de 180°

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 3.1, 6.1, 6.3 |
| Esperado | conferido à mão |

## O que este caso prova

Que a **redução de ângulo** de 6.1 (`normalize`) é aplicada **antes** de
multiplicar pelo `mix`, e não depois — nem nunca.

Este era um buraco de oráculo zero. As duas funções de normalização do runtime
inteiro (`normalizeAngle` e `normalizeRadians`) podiam ser trocadas pela
identidade e os 31 casos antigos passavam sem uma falha. Com este caso, trocar
`normalizeRadians` pela identidade dá **180 graus** de erro.

O motivo de nenhum caso antigo pegar: com `mix = 1`, girar por `+270°` e girar
por `−90°` dá exatamente a mesma matriz. A diferença só aparece quando o
resultado é **misturado pela metade**.

## O rig

```
root
alvo  parent root   x 100   y 0   rotation  170
osso  parent root   x  30   y 0   rotation −100

regra "tc": transform, mundo absoluto
            bones ["osso"]   target "alvo"
            mixRotation 0,5, todos os outros mix 0
```

Os dois ângulos são escolhidos para que a diferença passe de 180°:
`170 − (−100) = 270`.

## Contas — o giro que a regra pede (6.3, ramo `mixRotation`)

```
atan2(tc, ta) do alvo  =  170°
atan2(c,  a ) do osso  = −100°

diferença bruta                       = 170 − (−100) = 270°
normalize (6.1) leva a (−180°, 180°]  = 270 − 360    = −90°
vezes mixRotation 0,5                 = −45°

rotação final do osso = −100° + (−45°) = −145°
```

**Sem** a redução: `270 × 0,5 = +135°`, e o osso vai parar em `+35°`. Os dois
resultados ficam a 180° um do outro — meia volta, o erro mais visível que
existe numa animação.

## Contas — a matriz (5.2)

O osso é giro puro, escala 1, sem shear, então a matriz final é a de uma
rotação de −145°:

```
a = cos(−145°)      = −0,819152
c = sin(−145°)      = −0,573576
b = cos(−145°+90°)  = cos(−55°) =  0,573576
d = sin(−145°+90°)  = sin(−55°) = −0,819152
```

E o alvo, giro de 170°:

```
a = cos 170° = −0,984808     c = sin 170° =  0,173648
b = cos 260° = −0,173648     d = sin 260° = −0,984808
```

`mixX` e `mixY` são 0, então nenhum dos dois anda: `worldX` fica em 100 e 30.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| não reduz o ângulo antes do `mix` | `arotation` +35 em vez de −145: 180° |
| reduz para `[0, 360)` em vez de `(−180, 180]` | `arotation` +125: 90° |
| aplica o `mix` na matriz em vez de no ângulo | a matriz deixa de ser giro puro e o `ascaleX` sai de 1 |

O par deste caso é o **A-021**, que prende a mesma redução do lado do
`arotation` lido de volta.
