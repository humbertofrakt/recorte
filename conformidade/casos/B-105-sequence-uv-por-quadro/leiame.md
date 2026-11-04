# B-105 — os UV de uma `sequence` mudam de quadro em quadro

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 7.10, 10.4, 9.6, 12.4 |
| Esperado | conferido à mão |

## O que este caso prova

Que o canal `uvs` de um attachment com `sequence` responde ao **quadro ativo**,
e não ao quadro da setup pose.

A §7.10 diz: *"Só a imagem troca; vértices, pesos e UVs ficam."* O que fica é o
array `uvs` **gravado no arquivo**. O que muda é o mapeamento da §10.4: cada
quadro mora num **retângulo diferente da página**, então os UV de página são
outros a cada troca. Se não fossem, uma sequência desenharia o mesmo desenho
nos quatro quadros, e não serviria para nada.

## Por que este caso existe

O nome da região de um quadro é `frames[i]`, ou `path` mais o número (§7.10).
Num arquivo real o `path` costuma ser só um **prefixo** — `"piscar_"`,
`"hand_"` — e **não existe região nenhuma com esse nome**.

Um runtime que resolva a região **uma vez, pelo `path`**, ao carregar, não acha
nada, cai na regra do "sem atlas" da §12.4 e devolve os UV **literais**
`(0,1) (1,1) (1,0) (0,0)`. A geometria continua certa, o dump continua
completo, a suíte continua verde — e o personagem aparece com a textura
errada, ou com a página inteira esticada no lugar do olho.

**Medido no `heroi.bone`**: o slot `hand` tem `path: "hand_"` e
`frames: ["hand_01", "hand_02", "hand_03"]`. Um runtime devolvia os UV da
página; o outro devolvia `0` e `1`. Os dois passavam nos 41 casos de então,
porque nenhum caso juntava `sequence` com atlas.

## O rig

Página de `128 × 128`. Quatro regiões de `32 × 32`, uma em cada canto do
quadrante de cima e à esquerda:

| região | x | y |
|:---|:---:|:---:|
| `piscar_01` | 0 | 0 |
| `piscar_02` | 32 | 0 |
| `piscar_03` | 0 | 32 |
| `piscar_04` | 32 | 32 |

Um slot `olho` com um attachment `region` de `path: "piscar_"` e
`sequence: { count: 4, start: 1, digits: 2, setup: 0 }`. **Não existe região
chamada `piscar_`**: é de propósito.

A animação `pisca` tem uma timeline `sequence` em modo `loop`, com
`delay: 0,1`, então o quadro anda de um em um a cada décimo de segundo.

## Contas

Nome do quadro `i` (§7.10): `path + formatar(start + i, digits)`.

```
i = 0 -> "piscar_01"      i = 1 -> "piscar_02"
i = 2 -> "piscar_03"      i = 3 -> "piscar_04"
```

Quadro no tempo `t` (§9.6, modo `loop`, `t0 = 0`, `delay = 0,1`, `n = 4`):

```
k = floor((t - 0) / 0,1 + 0,00001)
frame = (index + k) mod 4  =  k mod 4
```

`t = 0` → 0 · `t = 0,1` → 1 · `t = 0,2` → 2 · `t = 0,3` → 3.

UV de página (§10.4), com a página de 128 e regiões de 32:

```
u = x / 128        u da borda direita = (x + 32) / 128
v = y / 128        v da borda de baixo = (y + 32) / 128
```

| quadro | região | u | v |
|:---:|:---|:---|:---|
| 0 | `piscar_01` | 0 … 0,25 | 0 … 0,25 |
| 1 | `piscar_02` | 0,25 … 0,5 | 0 … 0,25 |
| 2 | `piscar_03` | 0 … 0,25 | 0,25 … 0,5 |
| 3 | `piscar_04` | 0,25 … 0,5 | 0,25 … 0,5 |

Os oito números saem na ordem de cantos da §12.4 — BL, BR, TR, TL.

**Os quatro quadros dão quatro retângulos diferentes.** É isso que o caso
prende. O canal `slots` vai junto: `sequenceIndex` tem de bater com o quadro
que os UV mostram.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| Resolver a região só pelo `path` ao carregar | os quatro tempos com UV `0` e `1` (literais) |
| Resolver só o quadro da setup pose | os quatro tempos com o UV do quadro 0 |
| Contar o quadro sem o `+ 0,00001` da §9.6 | quadro atrasado nos tempos exatos |
| Deixar `sequenceIndex` parado no `setup` | o canal `slots` reprova junto |
