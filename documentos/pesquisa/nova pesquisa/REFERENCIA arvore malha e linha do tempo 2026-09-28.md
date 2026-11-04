# Referência — árvore, malha e linha do tempo — 28/09/2026

Chat D da rodada final (`EXECUTANDO · árvore, malha e linha do tempo`).
Pesquisado na internet em 28/09/2026, entre 23h45 e 00h10, **antes** de
qualquer linha de código. Régua 1 do encargo.

**Onde não achei, está escrito "não achei".** Nada aqui é palpite sobre o
que um programa faz.

## As fontes

| # | Programa | Página | Link |
|:---:|:---|:---|:---|
| S1 | Spine | Tree view | https://esotericsoftware.com/spine-tree |
| S2 | Spine | Events | https://esotericsoftware.com/spine-events |
| S3 | Spine | Dopesheet | https://esotericsoftware.com/spine-dopesheet |
| S4 | Spine | Keys | https://esotericsoftware.com/spine-keys |
| S5 | Spine | Paths | https://esotericsoftware.com/spine-paths |
| S6 | Spine | Meshes | https://esotericsoftware.com/spine-meshes |
| S7 | Spine | Weights | https://esotericsoftware.com/spine-weights |
| R1 | Spriter | Adding Event Triggers | https://www.brashmonkey.com/spriter_manual/adding%20event%20triggers%20to%20an%20animation.htm |
| R2 | Spriter | Adding Variables | https://www.brashmonkey.com/spriter_manual/adding%20variables%20to%20an%20animation.htm |
| R3 | Spriter | Advanced Timeline Editing | https://www.brashmonkey.com/spriter_manual/advanced%20timeline%20editing.htm |
| R4 | Spriter | Mouse and Keyboard Controls | https://www.brashmonkey.com/spriter_manual/mouse%20and%20keyboard%20controls.htm |
| R5 | Spriter | Character Maps | https://www.brashmonkey.com/spriter_manual/what%20are%20character%20maps.htm e `activating%20and%20stacking%20character%20maps.htm` |
| D1 | DragonBones | manual do DragonBones Pro, `docs.egret.com/dragonbones/en/docs/dbPro/` | **o site está fora do ar** (hoje recusou conexão de novo). Uso a leitura da casa, feita pela cópia do Internet Archive em 08/09: `documentos/pesquisa/nova pesquisa/dragonbones/DragonBones - todas as funcoes 2026-09-08.md`, com o PDF ao lado |

---

## Lote 1 — Evento e Parâmetro na Árvore

| Programa | O que faz | Onde fica o botão | Fonte |
|:---|:---|:---|:---|
| **Spine** | Os eventos **moram na árvore**, num nó próprio `Events`, fora da hierarquia dos ossos. Podem ir para pastas | Selecionar o nó `Events` e `New...` → `Event`. Duplo clique no nó `Events` também cria | S1, S2 |
| **Spine** | Na linha do tempo, a fila dos eventos fica **embaixo** de tudo, porque não é de osso nenhum | — | S3 |
| **Spriter** | O evento **não** vai para a hierarquia de objetos: nasce como uma linha **na linha do tempo** | Botão direito na coluna dos nomes da linha do tempo → *"append event at time"* | R1 |
| **Spriter** | A variável mora numa linha "meta data", no fim da linha do tempo | Na própria linha do tempo | R2 |
| **DragonBones** | Evento é uma **camada vermelha** da linha do tempo, e uma "ação" no quadro de um osso. A árvore da cena mostra só ossos e slots | Na linha do tempo e em Propriedades do quadro | D1 (§3.4, §3.6, §3.10) |
| Parâmetro (número com nome e faixa) | **não achei** nos três. O mais perto é o "slider" do Spine, e não li página dele nesta rodada | — | — |

**Qual modelo seguimos: o do Spine.** Um grupo próprio no **fim** da Árvore,
fora da hierarquia dos ossos, como o nó `Events` dele.

**Por quê:**

| Motivo | |
|:---|:---|
| O Spriter não serve aqui | nele o evento só existe dentro da linha do tempo; o nosso já nasce pelo `Novo ▾` **da Árvore**, e é ali que o Humberto o procura |
| O Spine faz exatamente isto | o evento é coisa do esqueleto, não de um osso: fica num nó à parte, embaixo |
| Fica no fim | o que se olha o dia inteiro (ossos e desenhos) continua em cima, igual |
| O parâmetro vai junto | é o mesmo caso: número do esqueleto, sem osso. Nenhum dos três mostra, então segue o irmão |

Escolher a linha abre a ficha em Propriedades — o que o parâmetro já faz pela
seleção (`selection.parameters`). O evento **não tem** seleção no contrato;
ver a decisão no plano do lote.

---

## Lote 2 — tirar a chave de virada de corpo

A chave de virada de corpo (spec 9.13) é nossa. O parente mais próximo nos
três é trocar a roupa inteira do boneco.

| Programa | Trocar o boneco por chave? | Como se apaga uma chave | Fonte |
|:---|:---|:---|:---|
| **Spine** | não achei chave de troca de esqueleto | tecla `Delete` na chave escolhida · o botão Delete da barra da linha do tempo · **duplo clique** na chave | S3, S4 |
| **Spriter** | o "character map" troca imagens; o manual diz que o **jogo** faz a troca em tempo real. Chave de troca: **não achei** | *"delete them via the delete key after selecting them"* | R3, R4, R5 |
| **DragonBones** | não achei | `Delete` ou `Backspace`: *"apagar osso, slot, imagem ou chave"*. E o botão "apagar quadro" da barra | D1 (§3.10, §7) |

**Qual modelo seguimos: os três ao mesmo tempo, porque os três concordam.**
Escolher a chave e apertar `Delete`. Mais o item no botão direito, que o
encargo pede e que a nossa linha do tempo já usa para as outras chaves.

---

## Lote 3 — o caminho ganha e perde ponto pela cena

| Programa | Como se soma ponto | Como se tira | Onde fica o botão | Fonte |
|:---|:---|:---|:---|:---|
| **Spine** | ferramenta **Create**: clicar **entre** dois nós soma um nó ali | **duplo clique** no ponto; ou a ferramenta **Delete** (botão direito troca Create ↔ Delete) | botão `Edit Path` em Propriedades abre o modo de edição; sai com o mesmo botão, `Esc` ou espaço | S5 |
| **Spine** | arrastar move; `Ctrl` + arrasto escolhe vários; `Shift` na alça trava o ângulo | — | — | S5 |
| **DragonBones** | não tem caminho. Na malha: ferramentas **Add (W)** e **Delete (E)** | Delete (E) | barra do editor de malha | D1 (§6.4) |
| **Spriter** | **não achei** caminho | — | — | — |

**Qual modelo seguimos: o do Spine**, dentro da nossa ferramenta Malha, que já
edita o caminho (bloco 7 da auditoria). Clique no traço entre dois nós soma;
duplo clique no nó tira. É o gesto que a malha já tem para vértice, então não
há tecla nova para aprender.

---

## Lote 4 — a aba Malha e pesos cabe

| Programa | Como o painel é | Fonte |
|:---|:---|:---|
| **Spine** | malha: um **diálogo de modo de edição** que abre pelo botão `Edit Mesh` de Propriedades, com Modify/Create/Delete, New, Reset, Generate, Trace | S6 |
| **Spine** | pesos: uma **vista própria** (Weights), com a lista de ossos, Bind, Auto, Smooth, Prune, Weld, Swap, Lock, e os pincéis Add/Remove/Replace com força, tamanho, pena | S7 |
| **Spine** | se a vista rola ou dobra: **não achei** na página | S6, S7 |
| **DragonBones** | a malha é uma barra de ferramentas (Edit, Add, Delete, Edge, Reset); os pesos, um quadro "Open Edit" em Propriedades | D1 (§6.4, §6.5) |
| **Spriter** | **não tem** malha nem peso — não achei nada | — |

**Qual modelo seguimos: o nosso próprio, já decidido (D5)** — a aba rola, com
os grupos dobráveis. O Spine **separa** malha e pesos em duas janelas, e é
isso que justifica os grupos: cada grupo nosso é uma "janela" do Spine que
se dobra.

**As duas proibições do Humberto valem acima da referência:**

| Pedido | Data |
|:---|:---|
| não esconder Ossos nem Pesos para ganhar número | 14/09 |
| não encurtar o nome dos botões ("ícone sozinho não se lê") | 13/09 |

Então: Ossos e Pesos **nascem abertos**; dobrar é escolha de quem usa.
