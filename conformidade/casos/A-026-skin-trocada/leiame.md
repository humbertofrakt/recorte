# A-026 — troca de skin

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 7.1 |
| Esperado | conferido à mão |

## O que este caso prova

O mesmo arquivo de A-025, com a skin `armadura` ativa na sonda. O placeholder
`corpo` passa a resolver para a arte da armadura, e a geometria muda.

Um runtime que ignora skins devolve os vértices de A-025 e falha aqui.

## Contas

```
20 × 30:  x0 = −10  x1 = 10   y0 = −15  y1 = 15
BL(−10,−15)  BR(10,−15)  TR(10,15)  TL(−10,15)
```

O nome do attachment continua `corpo` nas duas skins: é o placeholder, não o
arquivo de imagem (7.1).
