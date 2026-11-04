# A-011 — shear no cálculo da matriz de mundo

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 5.4 |
| Esperado | conferido à mão |

## O que este caso prova

`shearX` e `shearY` entram na matriz por caminhos diferentes: `shearX` soma na
rotação do eixo X, `shearY` soma na rotação do eixo Y. Um runtime que troca os
dois, ou que troca o sinal, falha aqui.

## O rig

Um osso, filho do root: `x 5`, `y 7`, `rotation 20`, `scaleX 1.5`, `scaleY 2`,
`shearX 45`, `shearY 30`.

## Contas (5.4, ramo do pai identidade)

```
rotY = 20 + 90 + 30 = 140

la = cos(20 + 45) * 1.5 = cos(65) * 1.5 =  0.42261826 * 1.5 =  0.63392739
lb = cos(140)     * 2   =               = -0.76604444 * 2   = -1.53208889
lc = sin(20 + 45) * 1.5 = sin(65) * 1.5 =  0.90630779 * 1.5 =  1.35946169
ld = sin(140)     * 2   =               =  0.64278761 * 2   =  1.28557522
```

O pai é a identidade, então `a b c d = la lb lc ld` e `worldX worldY = 5 7`.

A pose aplicada é cópia da local (não há constraint): `ashearX 45`, `ashearY 30`.
