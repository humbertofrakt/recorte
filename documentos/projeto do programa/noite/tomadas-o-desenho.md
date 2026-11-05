# Tomadas — o desenho

05/11/2026, 00:55 UTC. Executor das entidades (`recorte-54`), ramo `obra/entidades`.
Pedido do Humberto, pelo Diretor (21h15): *"isso é como TOMADAS que vão se
encaixando. Isso deveria ser claro."*

## Em cinco linhas

| # | |
|:---:|:---|
| 1 | **Tomada** = um lugar num osso onde uma peça entra. Ela aparece **na cena**, um ícone no osso, sem procurar |
| 2 | **Peça encaixada** = outro projeto (`.bone`) dentro da tomada. A espada na mão. O herói na cabine do mecha |
| 3 | **Um gesto só, nos dois sentidos.** Segurar a motosserra e entrar no mecha são a MESMA coisa: uma tomada recebe um projeto. Muda só qual projeto está aberto |
| 4 | **Três portas para o mesmo gesto:** botão direito no osso (cena ou Árvore), a aba **Tomadas**, o menu **Tomadas** |
| 5 | **O formato não muda** (regra 7). Tomada vazia = slot sem imagem nenhuma. Peça = anexo `skeleton` (7.11). Só a tela muda |

## O que os outros fazem

| Programa | Como liga uma peça a outra | O que copiamos |
|:---|:---|:---|
| **Spine** | o slot recebe um anexo; para esqueleto dentro de esqueleto, só por código (`SpineSlotNode` no Godot, "bone follower") | o slot é o lugar; a tela tem de mostrar que ele existe |
| **Spriter** | sub-entidade como objeto da linha do tempo; *character maps* trocam a peça e valem na hora | trocar a peça vale na hora, e se desfaz |
| **Unity** | *sockets* (um Transform filho do osso) e *prefab* dentro de *prefab*: arrasta para a hierarquia | o socket é um objeto que se vê na hierarquia e na cena; arrastar o arquivo para ele |
| **Unreal** | *sockets* no esqueleto, com nome (`hand_r`), e "Attach to socket" no botão direito | **o nome da tomada é o lugar do corpo** (mão direita, costas, cabine) e o menu do botão direito diz o verbo |

## As palavras

| Na tela | No arquivo (só na dica, depois) |
|:---|:---|
| **Tomada** | slot |
| **Peça encaixada** | entidade · anexo `skeleton` |
| **Encaixar um projeto…** | criar o anexo `skeleton` no slot |
| **Pôr uma tomada aqui** | criar um slot vazio no osso |
| **Tirar a peça** | tirar o anexo |
| **Mexe junto com a animação de quem segura** | `inheritAnimation` |
| **Animação própria, sempre ligada** | `baseAnimation` |
| **Na frente / atrás de quem segura** | `around` |
| **Segura** / **está em** | a peça dentro / o projeto dentro de outro |

## As telas

**Na cena** — o osso com tomada leva um ícone de tomada (dois pinos) na ponta.
Cheio quando tem peça; vazado quando está vazia. A dica diz o nome e o verbo.

```
        ╭───╮
   ─────┤ ⊡ │  mão_d · tomada · segura: espada
        ╰───╯       (clique: o menu da tomada)
```

**O menu da tomada** (clique no ícone, ou botão direito no osso):

```
┌────────────────────────────────────────┐
│ Tomada mão_d                           │
│   Encaixar um projeto…                 │
│   Tirar a peça                         │
│ ────────────────────────────────────── │
│   Pôr uma tomada aqui                  │  (osso sem tomada)
└────────────────────────────────────────┘
```

**A aba Tomadas** (era Entidades): a árvore de encaixes, de fora para dentro.

```
TOMADAS
[Na cena] [Pôr no projeto]
ENCAIXES
 mecha
   cabine  →  heroi  (AQUI)
                mão_d  →  espada
PEÇAS (arraste para uma tomada)
[espada] [motosserra] [heroi]
```

## Os três caminhos — um gesto só

| Porta | Gesto |
|:---|:---|
| Cena | botão direito no osso → **Encaixar um projeto…** · clique no ícone da tomada |
| Árvore | botão direito no osso → **Encaixar um projeto…** |
| Menu e aba | **Tomadas → Encaixar um projeto…** (no osso escolhido) · arrastar a peça da aba **Tomadas** até a cena |

Encaixar num osso **sem** tomada cria a tomada e encaixa, num passo de desfazer.

## As duas direções

| Quero | Gesto |
|:---|:---|
| O herói **segura** a espada | abra o herói, encaixe `espada.bone` na tomada da mão |
| O herói **entra no** mecha | abra o mecha, encaixe `heroi.bone` na tomada da cabine |

A cadeia mecha › herói › espada aparece na aba **Tomadas**, em árvore, porque
o herói traz a espada dele junto: o arquivo do herói já a cita.

## Decisões tomadas no lugar do Humberto

| Decisão | Por quê |
|:---|:---|
| Tomada vazia = slot sem imagem em nenhuma skin | um slot assim não serve para mais nada; não precisa de campo novo (regra 7) |
| Encaixar já liga **Mexe junto com a animação de quem segura** | é o que a espada de exemplo faz, e o que se espera: o herói ataca, a espada ataca. Desliga no cartão |
| A peça nasce na origem da tomada, deitada no eixo do osso | como o *socket* do Unreal; o resto se acerta na ficha |
| Os nomes de antes ficam na dica | quem leu o manual de outubro ainda acha |

## O que fica de fora nesta noite

| O quê | Por quê |
|:---|:---|
| arrastar um `.bone` do disco para a tomada | o arrasto de arquivo de fora é da casca; fica para a próxima rodada. A aba e o botão direito cobrem |
