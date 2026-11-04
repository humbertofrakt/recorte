# A-031 — chaves de `deform` com `offset` diferente, e uma chave vazia

| Item | Valor |
|:---|:---|
| Nível | A |
| Spec | 9.6, 9.3, 7.4 |
| Esperado | conferido à mão |

## O que este caso prova

Duas regras da §9.6 que nenhum caso media, e que quebram em silêncio:

1. **Cada chave é expandida para o layout inteiro de 7.4 ANTES da
   interpolação**, cada uma com o **seu** `offset`. Interpolar os trechos
   crus alinha o índice 0 de uma chave com o índice 0 da outra, e o movimento
   vai parar em **vértices errados**.
2. **`value: []` é uma fileira de zeros**, não um valor "não interpolável". É
   o que a §9.6 quer dizer com *"`value: []` = sem deform"*.

## Por que este caso existe

Um runtime que trate a lista vazia como valor não numérico cai na regra da
§9.3 — *"Em valor não numérico, `stepped`"* — e a curva da chave vira
`stepped`. O deform então **segura o zero até a chave seguinte** e nunca
interpola: a malha fica parada a animação inteira, e nenhum caso reprova,
porque nenhum caso tinha uma chave de deform vazia.

**Medido no `heroi.bone`**, na animação `idle`: a malha `head/face` sai de uma
chave vazia para uma em `offset: 4`. Um runtime animava o rosto; o outro
deixava o rosto parado. Os dois passavam nos 41 casos de então.

## O rig

Uma malha `pano` de 4 vértices, num osso na origem, sem pesos e sem atlas.
Layout de 7.4: `2N = 8` números.

```
vertices  (-20,-20)  (20,-20)  (20,20)  (-20,20)
```

Timeline `deform` sobre `pano/pano`, três chaves:

| tempo | `offset` | `value` | expandido para o layout de 8 |
|:---:|:---:|:---|:---|
| 0,0 | 0 | `[]` | `0 0 0 0 0 0 0 0` |
| 1,0 | 4 | `[0, 10, 0, 10]` | `0 0 0 0 0 10 0 10` |
| 2,0 | 2 | `[5, 0]` | `0 0 5 0 0 0 0 0` |

Repare que as três têm `offset` diferente e tamanhos diferentes. É essa
mistura que o caso mede.

## Contas

Sem curva, a interpolação é linear em cada elemento.

**`t = 0,25`** — fator `0,25` entre a chave 0 e a chave 1,0:

```
delta = 0 + (0 0 0 0 0 10 0 10 − 0) × 0,25 = 0 0 0 0 0 2,5 0 2,5
mundo = (-20,-20)  (20,-20)  (20, 22,5)  (-20, 22,5)
```

**`t = 0,5`** — fator `0,5`: `delta = 0 0 0 0 0 5 0 5`, e os dois vértices de
cima sobem para `25`.

**`t = 1,0`** — a chave inteira: os dois vértices de cima em `30`.

**`t = 1,5`** — fator `0,5` entre a chave 1,0 e a chave 2,0, **elemento a
elemento nos arrays já expandidos**:

```
a = 0 0 0 0 0 10 0 10          (chave 1,0, offset 4)
b = 0 0 5 0 0  0 0  0          (chave 2,0, offset 2)
delta = a + (b − a) × 0,5 = 0 0 2,5 0 0 5 0 5
mundo = (-20,-20)  (22,5, -20)  (20, 25)  (-20, 25)
```

**`t = 2,0`** — a chave inteira: só o segundo vértice anda, para `x = 25`.

## O que falha aqui

| Erro no runtime | O que a suíte mostra |
|:---|:---|
| Interpolar os trechos crus e só depois expandir | em `t = 1,5`, o `5` cai no vértice errado |
| Tratar `value: []` como não interpolável (curva vira `stepped`) | `t = 0,25`, `0,5` e `1,5` congelados na chave anterior |
| Usar o `offset` da chave da esquerda para o resultado inteiro | `t = 1,5` deslocado de dois números |
| Ignorar a chave vazia e começar a animação na chave 1,0 | `t = 0,25` e `0,5` já no valor cheio |
