# P-003 — laço — a emenda não aparece

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas, módulo lateral; exige A) |
| Extensão | `BONE_particles` — `formato/extensions/BONE_particles.md` |
| Spec | §6 |
| Esperado | calculado pela spec; as duas amostras são iguais por construção |
| Estado | **pendente.** Entra em `casos/` quando os DOIS runtimes passarem, e quem move é o Planejador |

## O que este caso prova

Duas coisas de uma vez:

1. Em `t = 0.02`, logo depois do começo, **já há partículas** — as da volta
   anterior, deslocadas de `−D`. Sem isso o efeito "começa do nada" a cada
   volta, e a emenda aparece.
2. `t` e `t + D` dão **o mesmo quadro**. É a função pura sobrevivendo ao laço.

## O emissor

`rate 20`, `lifetime [1.2, 1.2]` fixa, `looping true`, animação `girar` com
`duration 1`. Sem gravidade e sem arrasto: o que se mede aqui é **quem existe**,
não a trajetória.

## Por que `E(D)` é inteiro aqui, e de propósito

`D = 1` e `rate = 20` dão `E(D) = 20`: uma volta traz os índices `0..19`, em
`t_i = 0, 0.05, …, 0.95`. A volta de trás é a mesma lista com `t_i − 1`, e a
emenda fica exata — o último nascimento de uma volta e o primeiro da seguinte
ficam a `0.05` um do outro, como todos os outros.

Com `E(D)` **não** inteiro sobra um pedaço de volta menor que uma vaga, e os
dois ficam mais perto. A spec da extensão escreve isso na §6; este caso não o
exercita, e o caso que o exercitar é outro.

## O que se vê em `t = 0.02`

Com vida `1.2` e janela até `t − 1.2 = −1.18`, ficam vivas as nascidas em
`−1.18 < t_i <= 0.02`: a de `t_i = 0` desta volta e as de `t_i = −0.05` para
trás, até `−1.15`, da volta anterior. São **24**.

**O acaso não inclui o número da volta.** A partícula de índice 3 da volta de
trás tem exatamente o mesmo `u`, a mesma vida e a mesma velocidade que a de
índice 3 desta volta; o que muda é o `t_i`, e portanto a idade. Se o acaso
incluísse a volta, `t` sozinho não bastaria para saber em que volta se está — e
a função deixaria de ser pura.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| só olha a volta atual | `t = 0.02` quase vazio; a emenda aparece |
| semeia com o número da volta | as duas amostras diferem |
| guarda estado entre voltas | `t + D` difere de `t` |

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
