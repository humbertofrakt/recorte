# Referência — os defeitos do lote 1 (chat A) — 28/09/2026

Escrito pelo `EXECUTANDO · finalizar o programa` (chat A), às 23h55.
Referência **curta**, combinada com o `PLANEJADOR · 9f75b5`: o lote 1 é conserto
de silêncio, não função nova.

---

## Item 3 — renomear uma pasta para o nome de outra

**A pergunta:** o que os outros programas fazem quando o nome novo já existe?

| Programa | O que achei | Fonte |
|:---|:---|:---|
| **Spine** | Pasta na ordem de desenho era **pedido de usuário**, no fórum, não função pronta. Não achei o que ele faz com nome repetido de pasta | [fórum, 17172](https://ru.esotericsoftware.com/forum/d/17172-suggestion-draw-order-groups-folders-for-independent-keys) |
| **Spine** | Renomear em lote **já estragou a ordem de desenho** de usuários. É defeito relatado, não modelo a seguir | [fórum, 12518](https://ko.esotericsoftware.com/forum/d/12518) |
| **Spriter** | **Não achei.** A busca só trouxe o básico: renomear é duplo clique no nome | [Getting Started](https://www.scribd.com/document/419662292/Getting-Started) |
| **DragonBones** | **Não achei** | — |

**Não há modelo para seguir.** Nenhum dos três mostra, em fonte que eu tenha
achado, o que faz quando duas pastas ficam com o mesmo nome.

**O que seguimos, então:** o modelo **da própria casa**. A janela "Pôr numa
pasta…" já diz, **antes**, quantas peças vão mudar de lugar. Renomear passa a
fazer igual.

| Quando | O que o programa diz |
|:---|:---|
| Antes, na janela | *"Já existe a pasta atras, com 6 peças. As 3 peças de perna entram nela: as duas viram uma só."* |
| Antes, se não são vizinhas | *"…a pasta vai aparecer em 2 pedaços, com o botão Juntar."* |
| Depois, no rodapé | *"Pasta perna entrou em atras: agora são 9 peças, em 2 pedaços"* |

**Por que avisar e não proibir:** fundir duas pastas é um gesto útil. O defeito
era fazer isso calado.

---

## Item 4 — a tecla que cala

**Sem pesquisa, e de propósito.** A decisão já estava tomada em 22/09/2026, pelo
`PLANEJADOR · dd3937`. Está em
`documentos/planos/A PORTA QUE ENGOLE O CLIQUE 2026-09-22.md`, seção
"O que FALTA, em ordem", item 4:

> tecla na `KEY_TABLE` cuja ação não existe deve **avisar**; tecla fora da
> tabela segue calada.

Foi feita como está escrita. A frase do rodapé:

| Caso | A frase |
|:---|:---|
| A função é de um painel fechado | *Ctrl+F: “Buscar na Árvore…” está com o painel fechado. Abra pelo menu Janela* |
| O programa não sabe o motivo | *Ctrl+K: “Chavear tudo” não está disponível agora* |

O motivo só é dito quando é **sabido** (regra 21).

---

## Itens 1 e 2 — sem referência

| Item | Por quê |
|:---|:---|
| Os 4 erros soltos da suíte | é defeito de teste, não de programa. Não há o que olhar nos outros |
| Inclinar compensa | a referência é a casa: Mover, Girar e Escalar já compensavam. Inclinar passou a fazer igual |

---

## O achado que não estava no plano — um arrasto, dezenas de `Ctrl+Z`

**Não pesquisei antes de consertar**, e digo: achei medindo o item 2, e o
conserto saiu na mesma volta. A pesquisa abaixo é de **depois**.

| Programa | O que achei | Fonte |
|:---|:---|:---|
| Spine, Spriter, DragonBones | **Não achei** fonte que descreva como juntam os passos de um arrasto | — |

O que é sabido sem fonte, e por isso **não afirmo de programa nenhum**: em
editor de desenho, um arrasto costuma ser um passo de desfazer. Era o que a
casa já prometia — o comentário de `compensate.ts` dizia *"the whole drag stays
one step of undo"* — e não cumpria.
