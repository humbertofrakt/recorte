# Os próximos passos — 21/09/2026

Escrito pelo `PLANEJADOR · dd3937`, a pedido do Humberto. **Nada abre sem a
palavra dele.**

**Onde estamos:** o degrau 12 fechou na **v20.7** em 18/09 — partículas nos dois
runtimes, a biblioteca de animações, as quatro portas do formato. Suíte 3.801
com 1 vermelho conhecido (o do manual), conformidade 87 de 87 nos dois runtimes,
roteiro 14 de 14. **Nada de código foi tocado desde então**: 19, 20 e 21/09 não
têm versão nova.

---

## O que está na mesa, e nada foi começado

| # | O quê | De onde veio |
|:---:|:---|:---|
| A | **Três defeitos**, um deles deixando o arquivo **inválido** | achados **usando** o programa, 19/09 |
| B | **As partículas não têm tela** — o motor está pronto, o carro não tem volante | o degrau 12 parou antes da parte `P4` |
| C | **Achar as coisas**: comando pronto que nenhum menu chama | pesquisa de 18/09, pedido dele |
| D | Os pequenos do D12 (grade em perspectiva, trajeto, flash e pulso, tremor, curvas) | `ARQUITETO 4`, itens 4 a 6 |
| E | **O manual** (D13) | **só com a palavra dele** — regra 11 |

---

## A ordem que eu recomendo, e por quê

### 1º — Os três defeitos. Antes de qualquer coisa nova.

**A razão é a régua dele:** *programa quebrado e mudando; bolo antes do glacê.*
E há uma razão mais forte no defeito 1.

| Defeito | O gesto | O estrago |
|:---:|:---|:---|
| **1** | criar osso → `Ctrl+D` → desfazer 2× | **o arquivo fica inválido** (`parent cycle`), e quem usa não tem como saber |
| **2** | Esqueleto → Novo → Regra… (ou Pele) | **fecha a aba** em vez de abrir a janela. Com a aba fechada, não faz nada **e não avisa** |
| **3** | `Ctrl+K` no meio de uma curva | a curva quebra — 2 avisos no rodapé |

Nenhum é obscuro: são o **segundo gesto** que qualquer pessoa faz. A suíte tinha
3.801 verdes quando eles apareceram.

**O que entra no mesmo lote, e é o que impede a volta:**

> **Um teste de propriedade sobre a pilha de desfazer.** Para cada par de
> comandos: faz A, faz B, desfaz duas vezes, e exige que o arquivo volte **igual
> ao que era**.

A varredura de 19/09 achou **quatro** lugares com a forma do defeito 1, e o
conserto de cada um é trocar "acha pelo objeto" por "acha pelo nome" — pequeno.
Mas a varredura foi por busca de texto, e há 78 pontos de desfazer no programa:
**o teste pega os que a busca não sabe escrever, e os que alguém escrever no ano
que vem.** Ler os 78 à mão custa uma hora e acha só o de hoje.

**Cerca:** `viewport/tools/create-bone.ts`, `doc/drop-entity.ts`,
`panels/rules.ts`, `panels/skins*.ts`, `anim/keying.ts`, e o teste novo.
**Tamanho:** um lote, talvez dois.

### 2º — As partículas na tela (a parte `P4`)

É o que ele quer **ver**, e é a única coisa do degrau 12 que ele ainda não viu
mexer. O motor está construído e testado por 16 casos em dois runtimes
independentes; falta o volante: criar o emissor, ajustá-lo, e vê-lo na cena.

**Por que depois dos defeitos, e não antes:** o emissor atravessa **quatro
partes** do programa (criar, Árvore, cena, Propriedades). Um chat mexendo nisso
enquanto outro conserta a pilha de desfazer cruza em `viewport/` e em
`properties-model.ts` — e foi assim que nasceram os sete vermelhos de cerca da
rodada 5/6/7.

**Cerca:** o emissor é um anexo de slot, como um `region`. Os lugares estão
levantados e escritos no encargo do degrau 12, seção `P4`.
**Tamanho:** dois a três lotes, com **foto por lote** — como no degrau 11, que
foi o degrau que ele pediu para ver.

### 3º — Achar as coisas (as partes baratas)

Duas das três partes da proposta de 18/09 são pequenas e cabem de carona:

| Parte | O quê | Custo |
|:---|:---|:---|
| **O vigia** | todo comando tem porta, **ou** tem linha com o motivo escrito. Hoje o vigia parte das ações, e comando que nunca virou ação passa por baixo | um lote |
| **A paleta visível** | a busca de comandos **já existe** (Ajuda → Paleta, `Ctrl+Shift+P`) e ele não sabia. Conserto de tela: a dica dizendo o que ela faz, e a janela de Atalhos apontando para ela | pequeno |

A terceira parte — a folha "o que o programa faz, por tarefa" — é a mais cara,
porque o trabalho dela é **dar nome de tarefa a cada ação na língua dele**. Fica
para quando as duas de cima estiverem de pé.

### Depois: os pequenos do D12, e o manual quando ele pedir

Grade em perspectiva, trajeto do movimento, flash e pulso, tremor com semente,
curvas. **Duas decisões dele estão abertas na grade** (se o tipo vai com o
boneco ou fica na máquina; se o `Shift` trava nas diagonais).

---

## Como eu abriria, se ele mandar

| Rodada | Chats | Cerca — não se cruzam |
|:---:|:---|:---|
| **1** | os **três defeitos** + o teste da pilha · o **vigia** e a **paleta visível** | `viewport/`+`panels/rules*`+`skins*`+`keying` · `ui/action-audit`+`ui/menus` |
| **2** | as **partículas na tela**, um chat só, com foto por lote | atravessa quatro partes: vai sozinho no editor |

Dois chats na rodada 1, um na rodada 2. **Todos em Opus.**

---

## As três coisas que esperam a palavra dele, e são de uma linha

| # | A pergunta |
|:---:|:---|
| 1 | As teclas de painel (linha do tempo, Ordem, Árvore) entram na janela Ajuda → Atalhos? **Pô-las lá dobra a lista** |
| 2 | A palavra **"Etiqueta"** está boa? ("Marca" já era o marcador da linha do tempo) |
| 3 | A barra da aba Regras tem **doze botões** numa tira. Cabe — mas doze não se lê de relance. A Árvore resolveu caso igual com um `Novo ▾` |

---

## Dívida escrita, que ninguém começou

| O quê | Por quê fica escrito |
|:---|:---|
| **Varrer os testes verdes pela regra 28** | *"o que este verde prova?"* é fácil num caso (o nome está no relatório) e difícil num teste: **o nome de um teste só aparece quando ele falha.** São milhares de verdes, nenhum relido |
| A prova de medição não **abre** a ficha do evento | ela nasce fechada, e a prova não a abre. Quem trabalha com som passa o dia com ela aberta |
| O `P-002` está em `casos-pendentes/` | passa sem exercitar o que o nome dele diz. Sobe quando a 2ª fase das partículas abrir |
| As regras do `CLAUDE.md` estão fora de ordem | a 28 vem antes da 27. Cosmético, mas é o tipo de coisa que faz alguém citar a regra errada |
