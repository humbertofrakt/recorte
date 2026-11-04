# X-302 — tipo de attachment e de constraint desconhecidos

| Item | Valor |
|:---|:---|
| Nível | X |
| Spec | 2.5, 7.2, 12.2 |
| Esperado | conferido à mão |

## O que este caso prova

Tipo desconhecido não derruba o arquivo: **o objeto some, o resto abre**.

| Onde | O quê | Fallback |
|:---|:---|:---|
| skin | attachment `type: "acme_hologram"` | slot fica vazio (7.2) |
| constraints | `type: "acme_magnet"` | constraint ignorada (2.5) |

## Contas

O slot `estranho` pede o placeholder `holograma`, que existe na skin mas é de um
tipo que o leitor não conhece. Resultado: `attachment: null`. O slot continua na
ordem de desenho — ele existe, só não desenha nada.

O slot `conhecido` não é afetado: região 20 × 20 no root, cantos
`(−10,−10) (10,−10) (10,10) (−10,10)`.

A constraint desconhecida aponta para `alvo` em `(300, 300)`. Se o leitor
inventasse um comportamento, o osso sairia do lugar. Como ela é ignorada, o osso
fica exatamente na sua pose de FK:

```
osso: worldX 10   worldY 20   arotation 0   ascaleX 1   ascaleY 1
```

Um leitor de nível A ou B ignora **todas** as constraints (regra 6 da 6.1) e
passa neste caso pelo mesmo motivo.
