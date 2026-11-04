# P-005 — teto de vivas — as mais novas ficam

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §7.1 |
| Esperado | calculado pela spec; a lista das 5 é exata |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## O que este caso prova

Que o teto **não bloqueia o nascimento**: ele escolhe quem **desenhar**.

Unity e Godot bloqueiam — e isso é estado, porque quem nasce passa a depender de
quem estava vivo antes, e a função deixa de ser pura. Aqui a partícula nasce
sempre, e o desenho leva as `maxParticles` mais novas. É o espírito do "Ring
Buffer Mode" do Unity, feito sem guardar nada.

## O emissor

`rate 20`, `lifetime [1, 1]` fixa, `maxParticles 5`. Em `t = 0.55` há
**12** vivas (índices 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0) e o dump traz **5**.

## A ordem, e o desempate

```
ordenar por (t_i decrescente, fluxo crescente, índice decrescente)
desenhar as primeiras maxParticles
```

As cinco que ficam são as de índice **11, 10, 9, 8, 7** — as cinco mais novas. As
outras 7 continuam **vivas**; elas só não são desenhadas neste quadro.

## O preço, escrito

Com um teto baixo, uma partícula velha **some de repente** em vez de desaparecer
pela vida. É consequência da regra, não um defeito, e um leitor que corta
**DEVERIA** avisar uma vez. O editor diz quantas.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| bloqueia o nascimento ao lotar | as 5 erradas: sobram as mais **velhas** |
| corta antes de ordenar | 5 quaisquer |
| ordena por índice e não por `t_i` | passa aqui, quebra com rajada junto |

---

## Antes de qualquer caso

Um leitor que declara **P** tem de reproduzir os cinco números de referência da
§3.2 da extensão, exatos:

| Entrada | Saída |
|:---|:---|
| `pcg(0)` | `129708002` |
| `pcg(42)` | `1223963391` |
| `pcg(0xFFFFFFFF)` | `3861530882` |
| `acaso(42, 0, 7, 0)` | `0.4190843105316162` |
| `acaso(42, 0, −3, 0)` | `0.5181800723075867` |

Se algum deles não bater, **pare aqui**: nenhum caso de partícula vai passar, e
o defeito é o hash, não a conta.

## Onde este caso mora

Entrou em `casos/` em 18/09/2026, no fecho do degrau 12: os **dois** runtimes passaram (TypeScript e Python, este último escrito só pela spec da extensão), e o confronto campo a campo não achou diferença. Antes disso morou em `casos-pendentes/` (§12.4).

O `esperado.json` teve **três** fontes independentes, e não duas: a implementação de referência que escreveu o caso, o runtime TypeScript e o Python.
