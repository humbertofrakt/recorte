# B-104 — malha ligada (`linkedmesh`)

| Item | Valor |
|:---|:---|
| Nível | B |
| Spec | 7.5, 9.6 |
| Esperado | conferido à mão |

## O que este caso prova

A malha ligada empresta a geometria de outra malha e troca só a imagem (7.5).
Três coisas, que até esta fase nenhum caso da suíte media:

| Regra | Como aparece aqui |
|:---|:---|
| A malha ligada usa os vértices, os `uvs` e os triângulos do `parent`. | Os dois slots desenham o mesmo triângulo, e nenhum dos dois tem geometria própria no arquivo. |
| `inheritDeform: true` (o padrão): a timeline de `deform` que aponta para o **parent** também mexe na malha ligada. | Slot `herda`. |
| `inheritDeform: false`: a malha ligada **ignora** o deform do parent. | Slot `propria`. |

O caso nasceu porque o editor passou a criar malha ligada pelo botão **Ligar a
outra malha**. Um recurso que a ferramenta grava e a suíte não prova é um
recurso que um runtime de terceiro pode ler errado sem ninguém ver.

## O rig

Dois slots, cada um com o seu par (malha + malha ligada) no mesmo slot, como a
7.5 exige — o `parent` mora sempre no mesmo slot.

| Slot | Attachment ativo | `parent` | `inheritDeform` |
|:---|:---|:---|:---|
| `herda` | `copia_herda` | `forma_herda` | ausente (= `true`) |
| `propria` | `copia_propria` | `forma_propria` | `false` |

As duas malhas-pai têm a mesma geometria, sem pesos, no osso `root`, que está
na origem e sem rotação. Então **vértice de mundo = vértice do arquivo**:

```
v0 = (0, 0)     v1 = (100, 0)     v2 = (0, 100)
```

## A animação `puxar`

Duas timelines de `deform`, iguais, cada uma apontando para a **malha-pai** do
seu slot. Elas puxam só o vértice 0, em `x`, de `0` a `20`, entre `t = 0` e
`t = 1`, com curva linear.

## Contas

**Slot `herda`** — `inheritDeform: true`, então o deform do parent vale:

| t | v0 | v1 | v2 |
|:---|:---|:---|:---|
| 0 | (0, 0) | (100, 0) | (0, 100) |
| 0.5 | (10, 0) | (100, 0) | (0, 100) |
| 1 | (20, 0) | (100, 0) | (0, 100) |

O `10` de `t = 0.5` é a interpolação linear entre `0` e `20`.

**Slot `propria`** — `inheritDeform: false`, então o deform do parent **não**
vale, e esta malha não tem deform próprio. A geometria fica parada nos três
tempos:

| t | v0 | v1 | v2 |
|:---|:---|:---|:---|
| 0, 0.5, 1 | (0, 0) | (100, 0) | (0, 100) |

Este par é o coração do caso: as duas timelines são idênticas, as duas malhas
são idênticas, e a única diferença no arquivo é o `inheritDeform`.

## UV sem atlas

O caso não carrega atlas. Pela 12.4, os `uvs` de uma malha sem atlas são os do
arquivo, sem o mapeamento da 10.4:

```
uvs = [0, 0,  1, 0,  0, 1]
```

A malha ligada tem imagem própria (`path: "outra_imagem"`), e mesmo assim os
`uvs` são os do parent — é a 7.5: o que muda é a **imagem**, não a coordenada
dentro dela.

## Campos de slot

O canal `slots` deste caso traz os cinco campos da tabela da 12.4, inclusive
`darkColor: null` e `sequenceIndex: -1`. Foi por causa desses dois campos que
os dois runtimes do projeto divergiram em 10 casos sem nenhum deles falhar: o
harness só compara o que o esperado cita, então campo omitido nunca reprova.

## Conferido pelos dois caminhos

1. As contas acima, à mão, a partir da 7.5 e da 9.6.
2. Os **dois** runtimes do projeto, o de TypeScript e o de Python, escritos por
   caminhos independentes, que devolvem os mesmos números.
