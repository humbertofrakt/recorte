# X-301 — propriedade e valor desconhecidos caem no fallback

| Item | Valor |
|:---|:---|
| Nível | X |
| Spec | 2.5, 12.2 |
| Esperado | conferido à mão |

## O que este caso prova

Casos X são **obrigatórios em todo nível** (12.4): compatibilidade não é
opcional. Este arquivo está cheio de coisa que a 1.0 não conhece, e mesmo assim
tem que abrir e dar a pose certa.

## O que há de desconhecido no arquivo

| Onde | O quê | Fallback (2.5) |
|:---|:---|:---|
| raiz | chave `acmeProjeto` | ignorada |
| `skeleton` | `brilhoGlobal: 7` | ignorada |
| osso | `gingado: 3`, `modoSecreto: "muito"` | ignoradas |
| slot | `brilho: true` | ignorada |
| slot | `blend: "acme_glow"` | enum desconhecido → `"normal"` |
| attachment | `aura: 5` | ignorada |
| chave | `curve: "elastic"` | string desconhecida → `"linear"` |
| timeline | `type: "acme_brilho"` | timeline inteira ignorada |

## Contas

O que sobra é uma timeline linear de `x`, de 0 a 100 em 1 segundo, num osso que
está em `(10, 20)` na setup pose. A timeline escreve `x` por cima; `y` fica em
`20` porque não tem timeline (5.1).

| t | 0 | 0.5 | 1 |
|:---|---:|---:|---:|
| x | 0 | 50 | 100 |
| y | 20 | 20 | 20 |

O `50` em `t = 0.5` é a prova de que `"elastic"` virou `"linear"`. Um runtime
que recusasse a curva desconhecida, ou que parasse no `0`, falharia aqui.

Os vértices da região 20 × 20 no root continuam em
`(−10,−10) (10,−10) (10,10) (−10,10)`: o `aura: 5` não muda nada.
