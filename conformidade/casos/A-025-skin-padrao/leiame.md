# A-025 — skin padrão

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 7.1 |
| Esperado | conferido à mão |

## O que este caso prova

Com a skin `default` ativa, o placeholder `corpo` resolve para a arte base.
Par deste caso: **A-026**, o mesmo arquivo com a skin `armadura` ativa.

## O rig

Um slot `corpo`, placeholder `corpo`, em duas skins:

| Skin | Região | Tamanho |
|:---|:---|:---|
| default | base | 10 × 10 |
| armadura | armadura | 20 × 30 |

## Contas

O nome do placeholder é o mesmo nas duas skins. **Só a geometria denuncia a
skin ativa**, e é por isso que este caso mede vértices e não nomes.

```
10 × 10:  x0 = −5  x1 = 5   y0 = −5  y1 = 5
BL(−5,−5)  BR(5,−5)  TR(5,5)  TL(−5,5)
```
