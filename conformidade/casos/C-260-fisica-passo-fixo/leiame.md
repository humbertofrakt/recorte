# C-260 — física com passo fixo

| Item | Valor |
|:---|:---|
| Nível | C |
| Spec | 6.5 |
| Esperado | **gerado** pelo runtime de referência (ver abaixo) |

## Por que este esperado é gerado

A física da 6.5 é uma simulação: cinquenta passos de integração encadeados,
cada um dependendo do anterior, com amortecimento elevado a `60 × step`. Fazer
isso à mão não é conferir, é copiar a máquina errando mais. **Os números deste
`esperado.json` saíram do runtime de referência.**

O que este caso garante, então, é o que ele foi feito para garantir:
**determinismo**. Com o mesmo `dt` fixo e o mesmo `fps` da constraint, dois
runtimes têm que chegar ao mesmo lugar dentro de `1e-2` px (6.5). Não é o
oráculo da fórmula; é o contrato de que a fórmula é reprodutível.

Quando a 1.0 for congelada, este caso é um dos que a 12.4 manda conferir contra
o spine-runtimes em C++.

## O que dá para conferir à mão

**Amostra em `t = 0`.** É o primeiro quadro: `reset` está ligado, todos os
offsets são zero e a física não desloca nada. O osso `haste` tem que estar
exatamente onde o FK o coloca:

```
base  em (0, 100)         (x da animação em t=0 é 0)
haste filha de base, em (0, 0) local   ->   mundo (0, 100)
```

E é o que o esperado traz. Um runtime que aplica gravidade já no primeiro
quadro falha aqui.

**Sinal do atraso.** Nas amostras seguintes o `base` corre para a direita a
200 px/s e a gravidade puxa para baixo. A `haste` tem que ficar **atrás** e
**abaixo** do `base`:

| t | base.worldX | haste.worldX | haste.worldY |
|:---|---:|---:|---:|
| 0 | 0 | 0 | 100 |
| 0.1 | 20 | 12.63 | 94.69 |
| 0.3 | 60 | 59.45 | 80.21 |
| 0.5 | 100 | 110.90 | 93.69 |

Atrasa, cai, e depois passa da frente e sobe de volta: é uma mola. Um runtime
que devolva a haste sempre colada no `base` está com a física desligada.

## O rig

```
base   filho do root, em (0, 100), animado em x de 0 a 200 em 1 s
haste  filho de base, em (0, 0), length 50

physics: x 1, y 1, rotation 1, inertia 0.5, strength 100,
         damping 1, mass 1, gravity 10, limit 5000, fps 60
referenceScale do esqueleto: 100
```

## A sonda

`physicsDt: 0.01` — o relógio anda de 0.01 em 0.01 segundo desde `t = 0`, e as
amostras pedidas (`0, 0.1, 0.3, 0.5`) são todas múltiplos exatos do passo.
**Outro `dt` dá outra trajetória, e isso é esperado** (6.5). Um runtime que
amostrar direto em `t = 0.5` sem os 50 passos intermediários não bate.

Tolerância deste caso: `1e-2` px (3.6, linha da física).
