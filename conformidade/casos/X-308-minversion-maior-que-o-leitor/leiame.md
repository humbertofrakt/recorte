# X-308 — `minVersion` maior que o leitor: abre em melhor esforço

| Item | Valor |
|:---|:---|
| Nível | X |
| Spec | 2.4 (o terceiro ramo: "abrir em melhor esforço; avisar com destaque (o leitor NÃO DEVE recusar por causa de minor)"), 12.2 |
| Esperado | **digitado à mão**, da conta abaixo (rodada 34, 05/10/2026). Nenhum runtime foi consultado antes; a pose é a do X-303, conferida à mão lá |

## O que este caso prova

O arquivo diz `"version": "1.9"` e `"minVersion": "1.9"`: ele mesmo avisa que
precisa de um leitor 1.9. O leitor conhece 1.1. É o ramo de 2.4 que nenhum caso
olhava: o X-303 tem `minVersion 1.0` (o ramo "leitura parcial").

O leitor **abre** e posa. Recusar por `minor`, mesmo com `minVersion` acima, é
proibido.

**Por que 1.9, e não 1.2.** Com `1.2`, este caso muda de ramo no dia em que os
leitores chegarem à 1.2, e o nome passa a mentir (regra 28). `1.9` fica no ramo
certo por mais tempo.

## O rig e a conta

Os do X-303: `osso` filho do root em `(10, 20)`, região `corpo` 20 × 20,
`rotation` de 90 a 0 em 1 s.

| `t` | matriz | cantos BL BR TR TL |
|:---:|:---|:---|
| 0 | `a 0, b −1, c 1, d 0`, `arotation 90` | `(20,10) (20,30) (0,30) (0,10)` |
| 1 | identidade, `arotation 0` | `(0,10) (20,10) (20,30) (0,30)` |

## O que o verde NÃO prova

**O aviso "com destaque".** A sonda não tem canal de avisos: um leitor que abre
calado passa. Faltaria o canal `warnings` no dump (12.4).

## O que um runtime errado daria

Recusa: nenhuma amostra, o caso reprova.

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso passou de primeira nos dois runtimes.
