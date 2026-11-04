# C-261 — o primeiro quadro da física não simula nada

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.5, 12.4 |
| Esperado | conferido à mão |

## O que este caso prova

Que a **primeira** amostra do pose dump é a **primeira** `updatePose` do
esqueleto, e que essa primeira chamada só **ancora** o osso: ela não move nada.

A §6.5 diz, na tabela do estado por instância: *"Valor inicial: tudo `0`,
`reset = true`, `lastTime = now` do primeiro `updatePose`."* No pseudocódigo,
o ramo do `reset` faz três coisas e mais nada:

```
if reset:
  reset = false;  ux = bx; uy = by;  remaining = 0
```

Nenhum offset é escrito. Depois dele, `rotateOffset` ainda vale `0`, então o
bloco que aplica o resultado gira a matriz por `0` grau. **O osso do primeiro
quadro está exatamente na pose da animação, sem física.**

## Por que este caso existe

Um runtime que aquece o esqueleto no **construtor** — uma chamada de
`updateWorldTransform` para as matrizes de mundo já nascerem válidas — gasta
esse quadro de reset antes de o executor da suíte pedir qualquer coisa. A
primeira amostra que ele entrega já é a **segunda** `updatePose`, e ela carrega
o termo de inércia:

```
r = atan2(dy + ty, dx + tx) - ca - rotateOffset * mr
rotateOffset += (r - ceil(r / 2π - 0.5) * 2π) * i
```

Com `tx = ty = dx = dy = 0`, `atan2(0, 0)` vale `0` e sobra `r = -ca`: um
offset do tamanho do próprio ângulo do osso, multiplicado pela inércia.

**Medido no `heroi.bone`**, antes deste caso existir: o osso `hair`, cuja pose
de repouso é `160°`, saía a **161,05°** no runtime que aquecia no construtor e
a **160°** no que não aquecia. Os dois passavam nos 41 casos de então. A
diferença cresceu quadro a quadro e chegou a 77 campos divergentes no arquivo
inteiro, sem um único caso da suíte reprovar ninguém.

Um construtor é **invisível** para o executor da suíte: ele manda a pasta do
caso e a sonda, e lê o dump. Por isso a regra tem de estar no dump, e não na
prosa: quem simula no construtor nunca vai concordar com quem não simula.

## O rig

```
root                                   (identidade)
haste  parent root   length 100   rotation 60      <- SETUP POSE

regra "balanco": physics, bone haste
                 rotation 1, inertia 0.5, strength 100, damping 1,
                 mass 1, gravity 10, fps 60

animação "parado": haste.rotation = 20 do começo ao fim
```

**A setup pose e a animação discordam de propósito: 60° contra 20°.** Essa
diferença de 40° é o que faz o caso morder.

Um runtime que aqueça no construtor ancora a física na setup pose, a **60°**.
Quando o executor pede a primeira amostra, a animação já pôs o osso a **20°**,
e o osso "andou" 40° entre a ancoragem e a leitura. O termo de inércia lê esse
movimento e escreve um offset. Sem o aquecimento, a ancoragem acontece na
própria amostra `t = 0`, já com o osso a 20°, e não há movimento nenhum para
a inércia ler.

Um rig em que a setup pose e a animação concordam **não pega o erro**: com o
osso parado, `dx`, `dy` valem zero, `atan2(ty, tx)` devolve o próprio ângulo do
osso, e o termo de inércia dá zero nos dois runtimes. Foi assim que a primeira
versão deste caso passou nos dois lados e não provou nada.

## Contas

Passo de simulação: `step = 1/60`. A sonda anda de `1/60` em `1/60`.

**Amostra `t = 0` — a primeira `updatePose`.**

```
delta = max(0 - lastTime, 0) = 0          (lastTime começa no próprio now)
remaining += 0                            -> 0
reset é true:  reset = false; ux = bx; uy = by; remaining = 0
rotateOffset  = 0        (nada foi escrito)
o = rotateOffset * mix = 0
si = sin 0 = 0    co = cos 0 = 1          -> a matriz não gira
```

Resultado: `arotation = 20`, o valor que a animação pediu, e a matriz é a de um
osso a 20°:

```
a = cos 20°  =  0,939693     c = sin 20°  =  0,342020
b = cos 110° = −0,342020     d = sin 110° =  0,939693
```

**Amostra `t = 1/60` — a segunda.** Agora `reset` já é falso, `remaining`
recebe `1/60`, que é exatamente um passo, e a simulação roda uma vez, sob
gravidade: `arotation = 19,850443`.

**Amostra `t = 0,05` — a quarta.** Três passos simulados:
`arotation = 19,122619`.

**Medido com o aquecimento no construtor:** a amostra `t = 1/60` sai com
`b = −0,633685` em vez de `−0,339566` — uma diferença de `0,294`, contra a
tolerância de `1e-4` da matriz. O caso reprova por quase 3.000 vezes a
tolerância.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| Aquecer a física no construtor | a matriz de `t = 1/60` erra por 0,294 |
| Escrever offset no ramo do `reset` | `arotation` fora de 20 já na amostra `t = 0` |
| Não zerar `remaining` no `reset` | a segunda amostra roda mais de um passo |
| Somar o termo de inércia antes do primeiro passo | erro do tamanho do ângulo do osso vezes `inertia` |
