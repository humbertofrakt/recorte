# P-008 — arrastar para trás — o quadro não tem memória

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §1, §3.4 |
| Esperado | calculado pela spec; a 1ª e a 3ª amostras são **idênticas** |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## O que este caso prova

**O caso mais importante dos oito.** Ele é a régua inteira em três linhas:

```
avaliar em t = 0.9   →  guardar
avaliar em t = 0.3   →  voltar no tempo
avaliar em t = 0.9   →  TEM de dar exatamente o primeiro
```

Não "parecido dentro da tolerância": **igual**, campo por campo. A primeira e a
terceira amostras deste `esperado.json` são o mesmo texto, e é de propósito.

É este o buraco que nenhum dos três programas ocupa. Godot e Unity simulam para
frente: o `ParticleSystem.Simulate` do Unity *"fast-forwards"* o sistema, ou
seja, roda os passos de novo; a proposta do Godot para ter `seek` pedia
**gravar o estado** na primeira passada. Nos dois, arrastar o cursor para trás
não devolve o quadro que estava lá.

## O emissor

O mesmo do P-001 — `rate 20`, gravidade, arrasto, giro, escala, tudo ligado —
com `looping: true` e a animação `fluir` de `duration 1`. Quanto mais coisa
depende da idade, mais fácil seria um runtime com estado passar nos outros casos
e cair neste.

Em `t = 0.9` há **24** vivas; em `t = 0.3`, **24**.

## Por que a ordem 0.9 → 0.3 → 0.9, e não 0.3 → 0.9 → 0.3

Porque o erro que se caça aqui é **acumular**. Um runtime que simula para frente
chega a `0.9` numa passada, é mandado para `0.3` e faz uma de três coisas:
reinicia (e dá outro quadro), continua de onde estava (e dá outro quadro), ou
guarda um instantâneo (e dá o certo **só** nos instantes que guardou). Ir para
trás primeiro não separa os três; ir para a frente, voltar e voltar a ir separa.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| simula para frente | a 3ª amostra difere da 1ª |
| reinicia ao voltar | a 3ª vira a de `t = 0.6` desde o zero |
| guarda estado entre chamadas | difere, e **de um jeito diferente a cada rodada** |
| `dt` acumulado em float | difere na última casa, e a diferença cresce |

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
