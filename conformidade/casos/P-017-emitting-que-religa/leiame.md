# P-017 — o `emitting` que RELIGA, e os índices que continuam

| Item | Valor |
|:---|:---|
| Nível | **P** (partículas; exige A) |
| Extensão | `BONE_particles` |
| Spec | §4.2 |
| Esperado | calculado por uma implementação de referência escrita só pela spec |
| Estado | **pendente.** Três fontes independentes têm de bater — esta, o runtime TypeScript e o Python — antes de sair desta pasta. Quem move é o Planejador |

## A decisão que este caso prende

Um trecho de taxa efetiva **zero** tem área zero e **não consome índice nenhum**
(§4.2). Quando o `emitting` reabre, a contagem **retoma de onde parou**.

**Sem ela:** um leitor que calcule `t_i = i / rate` para todo `i` e depois descarte
quem caiu com a torneira fechada acerta a lista **enquanto o `emitting` só
fechar** — e erra na primeira vez que ele reabrir.

**E o erro não é de contagem: é de IDENTIDADE.** A partícula que nasce em
`0.80` é o índice `10` pela spec e o `16` pela conta errada — e índice diferente
é `hash` diferente (§3.2), logo **vida, velocidade, ângulo e cor diferentes**.
A mesma partícula com dois nomes desenha duas coisas. Um caso que só contasse a
lista pegaria isto por acaso; por isso o contrafactual abaixo diz **os índices**.

## O emissor e a animação

`rate 20`, `startDelay 0`, `lifetime [3, 3]` (ninguém morre no caminho), e uma
timeline de `emitting` com **três** chaves:

```json
{ "time": 0,   "value": true  }
{ "time": 0.5, "value": false }
{ "time": 0.8, "value": true  }
```

## A conta

```
[0, 0.5)    taxa 20  ->  area 10  ->  indices 0..9, em 0.00 ... 0.45
[0.5, 0.8)  taxa  0  ->  area  0  ->  NENHUM indice consumido
[0.8, ...)  taxa 20  ->  E(0.8) = 10  ->  a de 0.80 e o indice 10
```

| Amostra | O que se vê |
|:---|:---|
| `t = 0.99` | **14** partículas, índices **0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13** |
| `t = 1.00` | **15** — a de índice **14** nasce **exatamente em `t`** |

## O contrafactual, e é aqui que o caso morde

Pela conta errada — `t_i = i / rate` para todo `i`, jogando fora quem cai com a
torneira fechada — sai isto:

| | Índices em `t = 0.99` | Em `t = 1.00` |
|:---|:---|:---|
| **Pela spec** | `0..9` e **`10, 11, 12, 13`** | mais o **`14`** |
| Pela conta errada | `0..9` e **`16, 17, 18, 19`** | mais o **`20`** |

**A CONTAGEM É A MESMA NAS DUAS** — 14 e 15 dos dois lados. Só os **nomes**
mudam. Um caso que conferisse o tamanho da lista passaria os dois, e um leitor
com essa conta desenharia partículas com vida, velocidade, ângulo e cor
diferentes sem nenhum número denunciá-lo.

É por isso que este caso mede **índice a índice**, e não o tamanho.

## A segunda amostra, e por que ela está aqui

Em `t = 1.00` a partícula de índice `14` nasce **no próprio instante da
amostra**. A §5 diz `t_i <= t < t_i + life_i`: ela **está viva**, com idade `0`.

Não é regra nova — o P-001 e o P-005 já a exercitam, com a de índice `10`
nascendo exatamente em `t = 0.5` —, mas aqui ela cai num número redondo, onde é
fácil um leitor arredondar para fora sem perceber. **Contar de cabeça erra
aqui**, e errou: a primeira estimativa deste caso foi 14, feita sem rodar, e o
próprio runtime que a fez a corrigiu para 15 depois de medir.

A amostra de `t = 0.99` fica junto, com **14**, para a fronteira ser visível em
vez de implícita: **um centésimo de segundo antes, a partícula de índice
`14` ainda não existe.**

**Os três números da integral**, que servem para conferir um gerador antes de
ele gravar qualquer coisa:

```
E(0.5) = 10      a torneira fecha
E(0.8) = 10      PARADA: o trecho fechado tem area zero
E(1.0) = 14      e o indice 14 nasce exatamente aqui
```

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| `t_i = i / rate` com descarte depois | os índices do segundo grupo pulam para `16..19`, e **toda a ficha deles muda** |
| trecho fechado consumindo índice | o mesmo pulo |
| exclui quem nasce exatamente em `t` | só a segunda amostra erra, e por uma partícula |

---

## Por que este caso existe

**Toda decisão da rodada de 18/09/2026 foi tomada num ponto que nenhum caso
anterior exercita.** Este nasceu do conserto da §4.2: enquanto o `emitting` só
fecha, a conta certa e a errada dão o mesmo — e **nenhum dos dezesseis casos
anteriores o faz reabrir.**

**Se os três resultados não baterem**, a spec ainda está calada ali: sobe ao
Planejador **antes** de qualquer conserto.

## Onde este caso mora

Entrou em `casos/` em 18/09/2026, no fecho do degrau 12: os **dois** runtimes passaram (TypeScript e Python, este último escrito só pela spec da extensão), e o confronto campo a campo não achou diferença. Antes disso morou em `casos-pendentes/` (§12.4).

O `esperado.json` teve **três** fontes independentes, e não duas: a implementação de referência que escreveu o caso, o runtime TypeScript e o Python.
