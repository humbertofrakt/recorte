# Referência — as portas da aba Regras — 28/09/2026

Escrito pelo chat C, `EXECUTANDO · as portas das regras`, às 23h48 (relógio da máquina).
Régua 1 da rodada final: **referência antes do código**.
Sem fonte achada: **"não achei"**. Nada aqui é suposto.

---

## Lote 1 — apagar e renomear etiqueta

| Programa | Tem etiqueta? | Onde se cria | Apagar e renomear | Fonte |
|:---|:---:|:---|:---|:---|
| **Spriter Pro** | **sim** (*Tags*) | janela **Edit MetaData**: duplo clique na linha *meta data*, caixa **Add Tag**, Enter. Duas colunas: *Active Tags* e *Available Tags* | **não achei.** O manual 1.4 só ensina criar e arrastar entre as colunas | manual local `spriter/Spriter Pro - manual oficial 1.4.pdf`, cap. 30 · prints `spriter/prints/30-tags_262.jpg`, `_263.jpg` · [manual online](http://www.brashmonkey.com/spriter_manual/) |
| **Spine** | não | — | o gesto geral do Spine para **qualquer** item nomeado: **F2**, **duplo clique** no nome, ou o botão *Rename* no canto de cima das Propriedades. Apagar: o botão *Delete* ao lado | [Spine — Tree](https://en.esotericsoftware.com/spine-tree) (*"the same three buttons in the upper right"*) |
| **DragonBones** | não | — | — | manual local `dragonbones/`, 34 páginas: não tem tag |

**Modelo que seguimos:** a lista do Spriter (a etiqueta mora numa lista, sem
ficha), com o **gesto do Spine** para renomear e apagar.

| Gesto | Onde fica aqui | De quem |
|:---|:---|:---|
| Renomear | **duplo clique no nome**, e um ícone de lápis na linha | Spine |
| Apagar | um ícone de lixeira na linha | Spine |
| Apagar etiqueta **usada** | janela que lista as animações que a usam, antes de apagar | nossa régua 21: apagar leva o nome de toda chave |

**Por que na linha, e não na barra:** a etiqueta não tem ficha e não entra em
`Selection` (decisão do degrau 12, Desvio 8 do lote 4). Botão na barra pediria
"escolha uma etiqueta primeiro", e não há como escolher.

---

## Lote 2 — trocar os ossos de uma IK já criada

| Programa | Como troca | Onde fica o botão | Fonte |
|:---|:---|:---|:---|
| **Spine** | **ícone de lápis** ao lado do campo: limpa e deixa escolher de novo, clicando na cena | **Propriedades** da regra: *Parent*, *Child* e *Target* na IK; *Bones* e *Target* na Transform | [IK constraints](https://en.esotericsoftware.com/spine-ik-constraints) · [Transform constraints](https://en.esotericsoftware.com/spine-transform-constraints) |
| **DragonBones** | **não achei** jeito de trocar. A IK nasce **do osso** (dois botões nas Propriedades do osso). As propriedades mostram *Bone* e *Target*, sem dizer se se trocam | Propriedades do osso | manual local `dragonbones/…pdf`, cap. 29, págs. 35–36 |
| **Spriter** | não tem IK de regra. Tem IK **de gesto** (arrastar a ponta), que não fica gravado | — | manual local, cap. 7–8 |

**Modelo que seguimos:** o **lápis do Spine**.

**Onde:** o Spine põe o lápis em **Propriedades**, e Propriedades é do chat B.
→ **Aviso ao Planejador antes** (ficha C). Enquanto espera: o lápis entra
**na linha da regra escolhida, na aba Regras**, e abre a mesma janela guiada
da criação, com os ossos de agora já marcados.

---

## Lote 3 — gravar a chave do alvo no valor de agora

| Programa | O gesto | Onde fica o botão | Fonte |
|:---|:---|:---|:---|
| **Live2D Cubism** | põe a barra do parâmetro onde quer e clica no **[+]** da janelinha ao lado: grava uma chave **naquele valor exato**. Também: *Add 2 keys* / *Add 3 keys* no alto da paleta | **paleta Parâmetros**, na linha do parâmetro | [Add/Delete Keys to/from parameters](https://docs.live2d.com/en/cubism-editor-manual/edit-parameters/) · [Parameter palette](https://docs.live2d.com/en/cubism-editor-manual/palametorpalatte) |
| **Spine 4.3** | o *Slider* segura uma animação; a barra *Frame* escolhe o quadro, e se chaveia como qualquer propriedade. O osso que manda se troca pelo lápis | Propriedades do slider | [Sliders](https://en.esotericsoftware.com/spine-sliders) |
| **DragonBones** | não tem parâmetro | — | manual local |
| **Spriter** | não tem parâmetro. Tem **variáveis** chaveadas na linha *meta data* | — | manual local, cap. 29 |

**Modelo que seguimos:** o **[+] do Live2D** — é o único que grava a chave
*no valor de agora*, que é exatamente o `KeyDriverTarget`. Mora **na linha do
parâmetro na aba Regras**, que já é a nossa paleta de parâmetros (degrau 12).

---

## Lote 4 — os doze botões viram `Novo ▾`

| Programa | Como agrupa o criar | Fonte |
|:---|:---|:---|
| **Spine** | um botão **New…** nas Propriedades do nó escolhido, com a lista do que cabe ali (*IK Constraint*, *Transform Constraint*, *Slider*, *Event*…) | [Tree](https://en.esotericsoftware.com/spine-tree) · [IK constraints](https://en.esotericsoftware.com/spine-ik-constraints) · [Sliders](https://en.esotericsoftware.com/spine-sliders) |
| **Spriter** | os ícones numa linha no alto do painel | print `spriter/prints/00-tela-do-humberto.png` |
| **Nossa Árvore** | **Novo ▾** desde o lote 19 | `editor/src/panels/tree.ts` |

**Modelo que seguimos:** o **Novo ▾ da nossa Árvore**, que já é o New… do
Spine na tira do Spriter. D9 do encargo: sim.

---

## Resumo — onde cada porta entra

| Lote | Função | Porta | Modelo |
|:---:|:---|:---|:---|
| 1 | `RenameTag` | duplo clique no nome + lápis na linha | Spine |
| 1 | `DeleteTag` | lixeira na linha | Spine |
| 2 | `SetRuleChain` | lápis na linha da regra escolhida (Propriedades: pedido ao Planejador) | Spine |
| 3 | `KeyDriverTarget` | [+] na linha do parâmetro | Live2D |
| 4 | — | `Novo ▾` na tira | nossa Árvore |
