# P-004 — pré-aquecimento — o índice negativo

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §3.2, §6 |
| Esperado | calculado pela spec; o \`u\` do índice −3 é um dos cinco números de referência |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## O que este caso prova

Que `prewarm` faz o emissor começar **já cheio**, e que o hash aceita **índice
negativo** — pelo complemento de dois em 32 bits, e não pelo módulo.

Sem isso, um efeito com `looping: false` (uma explosão, uma fumaça que apaga)
nasce vazio e leva um segundo para ficar bonito. O `preprocess` do Godot faz a
mesma coisa; aqui ela sai de graça, porque nascer em tempo negativo é só um
índice negativo.

## O emissor

`rate 20`, `lifetime [1.5, 1.5]`, `looping false`, `prewarm 1`.

Nascimentos em `[−1, 0.1]`, ou seja `i` de `−20` a `2`. Vivas em `t = 0.1`:
as de `t_i > 0.1 − 1.5 = −1.4`, que são **todas**. São **23**.

## O índice −3

```
t_i  = −3 / 20 = −0.15
u0   = acaso(42, 0, −3, 0) = 0.5181800723075867
vida = 1.5 (fixa)
idade em t = 0.1: a = 0.25
```

Esse `u0` é **um dos cinco números de referência** da §3.2 da extensão, e existe
por este motivo: é o que prova que `−3` entra no hash como `0xFFFFFFFD`, e não
como `3`.

```
acaso(42, 0, −3, 0) = 0.5181800723075867
acaso(42, 0,  3, 0) = 0.350787878036499
```

Um leitor que tome o módulo do índice dá o segundo número, e a volta anterior
vira uma cópia da atual.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `prewarm` ignorado | só as de `t_i >= 0`; lista curta demais |
| índice negativo pelo módulo | os `u` erram do `−1` para trás |
| `prewarm` contado em quadros e não em segundos | lista de tamanho errado |

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
