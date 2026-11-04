# C-264 — a chave `reset` em 0 dispara no primeiro quadro

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 9.8 (`reset`: "mesma regra de 8.6"), 8.6 ("Primeiro quadro: `prev = −∞`. Assim chave em `0` dispara ao começar"), 6.5, 12.4 |
| Esperado | **digitado da conta abaixo** (rodada 34, 05/10/2026): a recorrência à mão nos três primeiros passos; o resto por uma implementação da §6.5 escrita só pelo pseudocódigo da spec, que reproduz o C-262 nas quatro amostras. Nenhum runtime foi consultado antes |

## O rig

```
root
fio     parent root   length 100            (parado: só a física o move)
regra "vento": physics, bone fio, x 1, wind 1, strength 100, damping 1, mass 1, fps 60
skeleton.referenceScale 100

animação "sopro": 0,21 s, loop
  constraint vento.reset   chave em 0
```

Sonda: `loop`, `physicsDt` = o mesmo número do C-262, amostras nos passos 3, 12 e 16.

## A regra

A 8.6 diz que a chave em 0 dispara no **primeiro** quadro (`prev = −∞`), e a 9.8
põe o `reset` na mesma regra. O primeiro `updatePose` já começa com `reset = true`
(6.5): disparar ali **não muda nada**. A chave em 0 só aparece na volta seguinte:
em laço, ela é `0 + 1·0,21`, cruzada no passo 13 (`0,2 < 0,21 <= 0,21667`).

O `reset` roda **antes** do `physicsApply` do mesmo passo: o passo do `reset`
ancora, e o seguinte já simula. É o que o número do C-262 exige (ver "Onde a spec
é fraca").

## A conta

Vento em `+X`, osso parado: `w = wind·referenceScale = 100`, `e = 100`,
`m = step = 1/60`, `d = 1`. Cada passo depois da âncora:

```
v += (100 − 100·x) / 60 ;  x += v / 60
```

| Passo | v | x = `fio.worldX` |
|:---:|:---:|:---:|
| 0 | 0 | 0 (âncora) |
| 1 | 1,666667 | 0,027778 |
| 2 | 3,287037 | 0,082562 |
| 3 | 4,816100 | **0,162830** |
| 12 | | **1,494215** |
| 16 (sem reset) | | 1,928747 |

| Amostra | Passo | Esperado | Por quê |
|:---:|:---:|:---:|:---|
| 0,05 | 3 | **0,162830** | o `reset` em 0 não atrasou nada |
| 0,2 | 12 | **1,494215** | idem |
| 0,26667 | 16 | **0,162830** | reset no passo 13, âncora; 14, 15, 16 simulam: o mesmo `x` do passo 3 |

`worldY = 0` nas três.

## O que um runtime errado daria

| Erro | 0,05 | 0,2 | 0,26667 |
|:---|:---:|:---:|:---|
| dispara a chave em 0 no primeiro **passo** (1/60), ou depois do `physicsApply` | 0,082562 | 1,342299 | 0,082562 |
| não dispara a chave em 0 na volta do laço | 0,162830 | 1,494215 | 1,928747 |

## O que o verde prova, e o que não prova

Prova que a chave em 0 não atrasa a física de um passo (os 0,15 px do passo 12).
**Não** separa "dispara em `t = 0`" de "não dispara no começo": os dois dão o
mesmo número, porque o primeiro `updatePose` já é um `reset`.

## Onde a spec é fraca aqui

A spec não diz se o `physicsReset` de uma chave roda **antes** ou **depois** do
`physicsApply` do mesmo quadro. A 9.10 pula a timeline `reset` e não diz onde ela
entra. Quem decide hoje é o **número** do C-262. E o `leiame` do C-262 descreve a
ordem contrária ("o primeiro [passo depois do reset] é o quadro de ancoragem"),
enquanto o número dele (`59,53258`, três passos simulados) só sai com o `reset`
antes. Rodar depois dá `59,763287`.

## Onde este caso mora

Entrou em `casos/` em 05/10/2026, no fecho da v28.8, com **três** fontes independentes que deram o mesmo número: a conta à mão (rodada 34, escrita pela spec antes de rodar qualquer leitor), o runtime TypeScript e o runtime Python — os dois concordam campo a campo. O caso passou de primeira nos dois runtimes.
