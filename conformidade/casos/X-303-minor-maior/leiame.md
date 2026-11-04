# X-303 — arquivo de minor maior lido por leitor menor

| Item | Valor |
|:---|:---|
| Nível | X |
| Spec | 2.4, 12.2 |
| Esperado | conferido à mão |

## O que este caso prova

O arquivo diz `"version": "1.7"`. O leitor é 1.0. Ele **DEVE** abrir assim
mesmo: a regra 1 da 12.2 proíbe recusar por `minor`, e proíbe recusar por
`minVersion`. Só o `major` pode ser motivo de recusa.

O `minVersion` gravado é `1.0`, ou seja, o arquivo avisa que nada dentro dele
exige mais do que a 1.0. O leitor pode confiar e abrir inteiro.

## O rig

```
osso   filho do root, em (10, 20), rotation 90
slot   corpo, no osso, região 20 × 20, blend "subtract"
timeline: rotation de 90 a 0 em 1 segundo
```

## Contas

**Em `t = 0`** (rotação 90°):

```
rotY = 90 + 90 = 180
a = cos(90)  = 0     b = cos(180) = −1
c = sin(90)  = 1     d = sin(180) =  0
worldX = 10   worldY = 20
```

Cantos locais da região 20 × 20: `(−10,−10) (10,−10) (10,10) (−10,10)`.
Levando ao mundo com `wx = a·lx + b·ly + 10` e `wy = c·lx + d·ly + 20`:

```
BL: (0·(−10) − 1·(−10) + 10,  1·(−10) + 0·(−10) + 20) = (20, 10)
BR: (0·( 10) − 1·(−10) + 10,  1·( 10) + 0·(−10) + 20) = (20, 30)
TR: (0·( 10) − 1·( 10) + 10,  1·( 10) + 0·( 10) + 20) = ( 0, 30)
TL: (0·(−10) − 1·( 10) + 10,  1·(−10) + 0·( 10) + 20) = ( 0, 10)
```

**Em `t = 1`** (rotação 0°): matriz identidade, cantos
`(0,10) (20,10) (20,30) (0,30)`.

Um leitor que recusa o arquivo por causa do `1.7` não produz amostra nenhuma e
falha. Um que abre mas ignora as animações "por precaução" erra `t = 1`.
