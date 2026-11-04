# PLANO pesos — uma imagem em dois ossos · 12/09/2026

Planejador → executor. Um lote, **69**, só bolo. Espera uma decisão do Humberto (no fim).

## O que o Humberto disse, 12/09/2026

> "Não consigo usar peso de forma decente. Pega uma imagem e liga a dois ossos. O sistema não está completo."

> "Tem que olhar como o 1 Spriter, 2 Spine, 3 DragonBones fazem, e seguir o modelo. Você tem liberdade de me sugerir uma maneira melhor, mas primeiro tem que ver como eles fazem."

## Como os três fazem

Fonte: `documentos/pesquisa/` (nova pesquisa: DragonBones §6.5, Spine "todas as funções" §Weights; pesquisa antiga: 01 e 02, menu 01 e 02, manuais Spine).

| | Spriter Pro | Spine | DragonBones |
|:---|:---|:---|:---|
| Imagem em dois ossos | **não existe**: um sprite pertence a um osso só; sem malha real. O Spriter 2 tem "atratores" e a malha multi-osso, desligada na reforma | imagem → **Mesh** (virar malha) → Generate ou Trace | imagem → **malha** (grid) → "Open Edit" |
| Ligar ossos | — | painel **Weights**, botão **Bind**: abre o modo; **clica nos ossos** na cena ou na árvore; cada osso ganha uma **cor** e entra na lista; Bind de novo fecha | botão **Bind Bone**, depois **clica nos ossos**; cada osso ganha uma cor |
| Pesos sozinhos | — | botão **Auto** (olha a topologia) | botão direito no vazio, ou botão **auto weight**; somou osso depois, aperta de novo |
| Escolher o osso para pintar | — | **na lista do painel**, ou clicando o osso **na cena com a ferramenta Weights**; a malha **não sai** da seleção | na lista; a malha fica |
| Pintar | — | ferramenta Weights (G): modo **Direct** (arrasta num vértice, sobe e desce o peso daquele osso) e pincéis **Add · Remove · Replace**, com Strength, Size, Feather | ferramenta de peso: **pizza** por vértice nas cores dos ossos; escolhe osso, escolhe vértice, arrasta para cima ou para baixo |
| Ver o peso | — | pies · overlay · selected | pizza por vértice; um vértice escolhido mostra sliders por osso |
| Consertos | — | Smooth · Prune · Weld · Lock · Update bindings | — |

**O modelo é o do Spine e do DragonBones, iguais no essencial:** um botão **Ligar** no painel que abre um modo; enquanto está aberto, clicar num osso liga (ou tira); cada osso ligado tem uma cor; a malha nunca sai da seleção; o osso a pintar se escolhe na lista ou na cena.

**O que o Recorte fez diferente (v9.5):** o P segurado, gesto meu, que não existe em nenhum dos três, só com a ferramenta Selecionar, e escolher um osso derruba a malha. É por isso que "o sistema não está completo".

## O que foi conferido, no navegador (herói, desenho `forearm`, v11.5)

| Passo | Onde | Deu? |
|:---|:---|:---:|
| Escolher o desenho | Árvore | sim |
| Virar malha | aba Malha e pesos | sim, 4 vértices |
| Gerar automática | aba Malha e pesos | sim, 13 vértices, 20 triângulos |
| Ligar `arm` | osso escolhido, P segurado, clique na malha | sim, 100% |
| Ligar `forearm` | o mesmo gesto | sim, entra com 0% |
| Pesos automáticos | aba | sim: arm 12%, forearm 88% |
| Pintar | ferramenta Pesos (G), arrasto | sim: arm 12% → 75%, um passo de desfazer |

**A conta está inteira.** O que falta é o caminho.

## Os buracos

| # | Buraco | Onde no código |
|:---:|:---|:---|
| 1 | **Não há botão para ligar um osso à malha.** Só P segurado + clique na cena, e só com Selecionar na mão. A lista "Ossos que influenciam" tem o *tirar*, não tem o *ligar* | `panels/mesh-panel.ts`, `buildBoneSection` |
| 2 | **Escolher um osso derruba a malha.** Clique num osso, na Árvore ou na cena: a seleção vira só o osso, a aba fica em "Escolha um desenho" e a cena para de desenhar a malha | `panels/tree-rows.ts` `selectionForRow`; `viewport/picking.ts` `selectionFor` |
| 3 | Com a ferramenta Pesos na mão, o clique num osso na cena só pinta. Não escolhe o osso (no Spine, escolhe) | `viewport/tools/weights-tool.ts`, `onDown` |
| 4 | Os ossos ligados não têm cor. Só a escala azul–vermelho de um osso por vez; os dois mostram pizza por vértice | `weights-tool.ts`, `drawOverlay` |
| 5 | A aba diz *"Escolha a ferramenta Malha (M) ou Pesos (G)"* mesmo depois de apertar G. Só some na próxima mudança | `mesh-panel.ts` não ouve `onToolChange` de `tools/registry.ts` |
| 6 | O pincel nasce com raio 40. Numa peça de 44 px, uma pincelada cobre tudo | `weights-tool.ts`, `brush.radius` |
| 7 | No herói, girar `forearm` não mostra a dobra: a regra de IK manda no braço. Não é dos pesos; o teste tem de usar osso sem IK | — |

## Lote 69 — pesos como no Spine e no DragonBones

| # | Gesto | Faz |
|:---:|:---|:---|
| a | Aba Malha e pesos, lista **Ossos que influenciam**: botão **Ligar** (ícone de corrente, nome na dica), que **abre e fecha um modo**, como o Bind | com o modo aberto, o rodapé diz *"Clique nos ossos que puxam esta malha. Ligar de novo termina."* Clique num osso, **na cena ou na Árvore**, liga (`bindBone`); clique num osso já na lista tira (`unbindBone`). O mesmo `toggleMeshBone` do lote 63. Esc ou o botão fecham. Cinza em Animando |
| b | Cada osso ligado ganha uma **cor** | a cor do osso (`bones[].color`); sem cor, uma da paleta fixa pelo índice. A lista mostra a bolinha da cor |
| c | Na cena, com **Pesos (G)** na mão | cada vértice vira uma **pizza** nas cores dos ossos (Spine e DragonBones). Escolhido um osso, a fatia dele fica em destaque; a escala azul–vermelho sai |
| d | Com **Malha (M) ou Pesos (G)** na mão, clique num osso na **Árvore** | troca só o osso; **o desenho fica**. A aba continua na malha; o osso clicado vira o pintado |
| e | Com **Pesos (G)** na mão, clique num **osso na cena**, fora da malha | escolhe o osso para pintar; o desenho fica. Clique na malha continua pintando |
| f | A aba ouve a troca de ferramenta | a linha *"Escolha a ferramenta…"* some na hora |
| g | Raio do pincel | ao escolher uma malha, se o raio ainda é o de fábrica, vira **um quarto do maior lado** da malha (mínimo 4) |
| h | O P segurado numa malha | **sai**: volta a ser só o prender filhos do lote 31. Nenhum dos três liga osso com tecla segurada |
| i | **A aba Malha e pesos arrumada** (pedido dele: "arrumar esse menu também") | a ordem da view Weights do Spine: Desenho escolhido · Forma · **Ossos** (Ligar, lista com a bolinha da cor, %, Travar, tirar) · Pesos · Pincel · Avançado. Uma frase por seção quando falta algo, e nunca mais larga que a coluna (medir antes e depois) |

Módulo puro: `panels/mesh-panel-model.ts` ganha `bindMode` (aberto ou fechado, e o que um clique num osso faz), `boneColor(file, index)` e `initialRadius(geometry)`; `mesh/weights.ts` ganha `pieOf(table, vertex)` (fatias em ordem de osso). Em `tree-rows.ts`, `selectionForRow(row, keep?)`: com `keep`, o osso entra e os desenhos ficam. Quem passa o `keep` é `panels/tree.ts`, olhando `getActiveToolId()`.

| Teste | Esperado |
|:---|:---|
| modo Ligar aberto, clique em `hair` (fora da lista) | `hair` entra com 0; um passo de desfazer; o mesmo `SetProperty` do lote 63 |
| modo Ligar aberto, clique em `arm` (na lista) | `arm` sai; o peso vai para os outros |
| modo Ligar aberto, Esc | fecha; a seleção não muda |
| `boneColor` num osso sem cor | a cor da paleta pelo índice, sempre a mesma |
| `pieOf` em `arm 0,25 · forearm 0,75` | duas fatias, 0,25 e 0,75, em ordem de índice |
| `selectionForRow(osso, keep)` com desenho escolhido | `bones: [osso]`, `attachments` iguais aos de antes |
| `selectionForRow(osso)` sem `keep` | como hoje: só o osso |
| Pesos na mão, clique num osso na cena | seleção: o osso + o desenho de antes; nenhum comando rodou |
| `initialRadius` numa malha 44 × 22 | 11 |
| aba com Pesos na mão | sem a linha *"Escolha a ferramenta"* |
| teste do P numa malha (lote 63) | vira o de sempre: prender o slot |
| contagem | 2.636 + os de cima; `tsc` limpo; roteiro 14 de 14; medir 22 de 22 |

**Pronto quando:** imagem → Virar malha → Gerar automática → **Ligar** → clica nos dois ossos → Pesos automáticos, e a malha nunca sai da tela no meio. Igual ao Spine.

## Sugestão minha, depois do modelo

Só uma, pequena: **Pesos automáticos rodar sozinho ao fechar o modo Ligar**, se a malha estava sem peso. Poupa um clique no caminho de todo dia. Spine e DragonBones não fazem. O Humberto decide.

## Decisão do Humberto

| # | Pergunta |
|:---:|:---|
| 1 | Fechar o modo Ligar já roda Pesos automáticos (sugestão), ou fica só o botão, como nos dois? |

## Ordem de trabalho

Backup antes; INDICE; contagem não cai; `tsc`; `conformidade.mjs`; CHANGELOG; `versao.py`. Manual pausado: as frases vão para as dicas. Três linhas ao Humberto.

## Desvios

Escritos pelo executor ao fechar a **v11.6**, 12/09/2026. Os itens a a i foram
todos feitos; o que segue é onde o código pediu coisa diferente do plano.

| # | O plano dizia | O que foi feito, e por quê |
|:---:|:---|:---|
| 1 | item i: a seção se chamaria **Ossos** | ficou **Ossos que influenciam**, o nome de sempre. O manual (`documentos/manual/06-malha-e-pesos.md`) chama assim, e o manual está pausado: trocar o nome deixaria o manual mentindo. A ordem das seções é a do plano |
| 2 | teste *"aba com Pesos na mão: sem a linha Escolha a ferramenta"* | não há jsdom (regra 8). A decisão saiu do painel e virou função pura, `toolHintNeeded(toolId)`, em `mesh-panel-model.ts` — é ela que o teste prova. A aba chama essa função e ouve `onActiveToolChange` |
| 3 | `pieOf(table, vertex)` | as fatias de peso **0 não entram**: fatia de tamanho zero não se vê, e o osso recém-ligado apareceria como cor nenhuma. A lista da aba continua mostrando ele, com 0% |
| 4 | item e: o clique num osso na cena | vale com **Pesos (G)**, como no plano. Com Malha (M), só pela Árvore (item d): a ferramenta Malha usa o clique na cena para escolher vértice, e roubar esse clique quebraria a edição de forma |
| 5 | `initialRadius(geometry)` no `mesh-panel-model.ts` | está lá, puro. Mas o *"se o raio ainda é o de fábrica"* mora no pincel, que é quem sabe se o Humberto já escolheu um: `suggestRadius` e `forgetRadiusChoice`, em `weights-tool.ts`. A aba oferece; o pincel decide se aceita |
| 6 | item h: o P na malha sai | saiu também o contador `meshes` de `ChildGrab` (`viewport/parent-gesture.ts`) e a exceção que ele abria no recado do fim do gesto: sem o gesto, não havia mais o que contar |
| 7 | — | **prova nova**, fora do plano: `ferramentas/provas/pesos-dois-ossos.mjs`, `npm run pesos`. O *"Pronto quando"* do plano é um caminho inteiro no navegador, e nenhuma prova de então passava por ele. São 13 passos, num Chrome headless com servidor próprio (porta 5192), com clique e tecla de verdade. 13 de 13, console limpo |

### Conserto, 12/09/2026 — o desvio 4 estava errado

O Humberto testou a v11.6 na hora e achou o buraco: *"vi onde estava a
corrente; quando clica nela e no osso, não funciona"*.

O desvio 4 dizia que o clique no osso na cena valeria **só com Pesos (G)**. Foi
erro meu de leitura: o item **a** do plano diz *"clique num osso, na cena ou na
Árvore"*, sem falar em ferramenta, e no Spine e no DragonBones o Bind é um
**modo** — enquanto está aberto, o clique no osso liga, com o que estiver na
mão. Pior: o programa abre com o **Transformar**, então o caminho que o plano
descreve não funcionava para ninguém que não trocasse de ferramenta antes.

Consertado na **v11.7**: quem atende o clique é a cena (`bindModeSceneClick`),
antes da ferramenta. Clique fora de osso nenhum não faz nada, para o modo não
derrubar a malha. O desvio 4 vale só para o item **e** — escolher o osso a
pintar clicando nele na cena continua sendo da ferramenta Pesos.

A prova `npm run pesos` passou a rodar o caminho **como ele é de verdade**: a
ferramenta de abertura na mão, sem trocar nada, um osso pela cena e o outro
pela Árvore. 14 de 14.

**A sugestão do planejador** — Pesos automáticos rodar sozinho ao fechar o modo
Ligar — **não** foi feita: a decisão do Humberto, escrita no recado, é *"fica só
o botão, como nos dois"*.
