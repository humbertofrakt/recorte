# C-262 — a chave `reset` da física dispara uma vez por passo, não uma por amostra

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.5, 9.8, 12.4 |
| Esperado | conferido à mão nos quadros que importam |

## O que este caso prova

Que a janela em que a chave `reset` da §9.8 é medida vai de uma **`updatePose`**
à seguinte — e **não** de uma amostra do dump à seguinte.

Com `physicsDt` na sonda, a §12.4 manda o runtime andar o relógio de
`physicsDt` em `physicsDt` chamando `updatePose` em cada passo. Entre duas
amostras cabem muitos passos. A regra de cruzamento da 8.6 é
`anterior < tempo <= agora`, e o `anterior` que vale aqui é o do **passo
anterior**.

## Por que este caso existe

Um runtime que guarde só o tempo da última **amostra** e o use como `anterior`
em todos os passos intermediários redispara o `reset` a cada passo depois do
cruzamento. E `physicsReset` zera tudo:

```
function physicsReset(c):
  reset = true; remaining = 0; lastTime = now
  xOffset = xVelocity = yOffset = yVelocity = 0
  rotateOffset = rotateVelocity = scaleOffset = scaleVelocity = 0
```

Redisparar a cada passo prende a física **parada na pose de repouso para
sempre**: cada passo apaga o que o anterior acumulou.

**Medido no `heroi.bone`**, na animação `attack`, que tem uma chave `reset` no
tempo 0 e dura 0,6 s: em laço, o osso `hair` saía **exatamente** na pose de
repouso (160°) num runtime e a **161,93°** no outro. Os dois passavam nos 41
casos de então, porque nenhum caso tinha `reset` junto com `physicsDt`.

## O rig

```
root                                   (identidade)
haste  parent root   length 100   rotation 60

regra "balanco": physics, bone haste, rotation 1, gravity 10, fps 60

animação "gira": 0,2 s, loop
  bone haste.rotation   60 -> 60         (a física é a única coisa que move)
  constraint balanco.reset   chave em 0,1 s
```

## Contas

Passo da sonda: `1/60 s`. A animação dura `0,2 s` e a sonda pede `loop`.

A chave de `reset` está em `0,1 s`. Em laço, ela é cruzada em
`0,1`, `0,3`, `0,5`, … — ou seja, `0,1 + n × 0,2`.

**Os tempos pedidos são escolhidos a dedo:** `0,0833…`, `0,15`, `0,25` e
`0,35`. Repare que **não há amostra em cima do cruzamento**. É de propósito.

Se a suíte amostrasse em `0,1`, o tempo da amostra anterior e o tempo do passo
anterior seriam quase o mesmo, e os dois runtimes dariam a mesma resposta —
o erro ficaria escondido. Pondo a amostra em `0,15`, o cruzamento cai **no meio
do vão** entre duas amostras, e os três passos que vêm depois dele (`0,1166…`,
`0,1333…`, `0,15`) são justamente onde um `anterior` desatualizado redispara.

| amostra | anterior (amostra) | anterior (passo) | cruzamento em `0,1` cai em… |
|:---:|:---:|:---:|:---|
| `0,15` | `0,0833…` | o passo anterior | a janela **da amostra** ainda contém `0,1` nos três passos |

**Amostra `t = 0,0833…`.** Antes do cruzamento. A física vem acumulando desde
o começo: `arotation = 58,875597`.

**Amostra `t = 0,15`.** O `reset` disparou **uma vez**, no passo `0,1`, **antes**
do `physicsApply` daquele passo (§9.8): o passo `0,1` já é o quadro de ancoragem
do C-261, que não simula, e os três que vêm depois (`0,1166…`, `0,1333…`,
`0,15`) simulam. *(Corrigido na rodada 35, 05/10/2026: este parágrafo dizia que
o primeiro dos três era a ancoragem — a ordem contrária. O número sempre foi o
desta conta; o texto é que estava errado.)* `arotation = 59,53258` — o mesmo número da
amostra `t = 0,05` do C-261, o que confirma a conta pelos dois lados.

**Amostra `t = 0,25`.** Longe do cruzamento seguinte: `arotation = 57,03997`.

**Amostra `t = 0,35`.** Mesma história de `0,15`, uma volta depois:
`arotation = 59,53258`.

**Medido com o `anterior` da amostra no lugar do `anterior` do passo:** a
amostra `t = 0,25` sai com `b = −0,85233` em vez de `−0,83905`, uma diferença
de `0,0133` contra a tolerância de `1e-4`. As amostras `0,15` e `0,35`
congelam na pose de repouso.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| Usar o tempo da última **amostra** como `anterior` nos passos | `t = 0,15` e `t = 0,35` congelados em 60° |
| Não disparar o `reset` em laço (só na primeira volta) | `t = 0,35` acumulado demais |
| Disparar o `reset` no quadro errado | as três amostras deslocadas de um passo |
