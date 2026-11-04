# Pedidos do Humberto — a malha — 13/09/2026

Anotado da conversa, com a causa achada no código. **Ainda não é plano. Nada foi
feito.** Régua: *"um Spriter com as ferramentas do Spine"*.

## Os quatro

| # | O que ele disse | Onde está a causa |
|:---:|:---|:---|
| 1 | *"quando gerar a malha, deixe ela um pouco afastada, para não comer a imagem"* | `mesh/mesh-edit.ts`, `traceOutline` + `AutoMeshOptions`: o contorno é traçado **em cima** do primeiro pixel opaco, e não há opção nenhuma de afastar. Falta um afastamento (em pixels da imagem), ligado por padrão |
| 2 | *"não tem um modo de criar vértices na malha, como no Spine e no DragonBones"* | `viewport/tools/mesh-tool.ts`: dá para acrescentar vértice, mas só com **Ctrl + clique** no vazio. Não existe o modo em que o clique simples cria — que é como os dois programas fazem |
| 3 | *"o menu da malha está horroroso, cheio de texto, impossível de usar; parece uma Wikipedia"* | `panels/mesh-panel.ts`: botões com o nome inteiro e a tecla entre parênteses (`Ligar vértices (L)`, `Desligar aresta (K)`, `Apagar vértice (Delete)`, `Gerar automática`, `Traçar contorno`, `Pesos automáticos`, `Suavizar`, `Podar`, `Tirar pesos`…), mais frases de ajuda soltas no meio. Vale a regra da casa: **botão nasce em ícone, com o nome na dica** |
| 4 | *"não entendi o desligar vértice e ligar vértices"* | A palavra **"Ligar" faz três trabalhos diferentes** no mesmo painel: `Ligar a outra malha` (malha ligada, §7.5), `Ligar vértices (L)` / `Desligar aresta (K)` (arestas entre dois vértices) e o botão `Ligar` dos pesos (escolher os ossos que puxam a malha). Três coisas, um nome só |

## O que "ligar vértices" faz hoje

Escolher dois vértices e apertar `L` cria uma **aresta** entre eles: uma linha
que o triangulador é obrigado a respeitar. `K` tira essa linha. Serve para mandar
onde o dobra — sem ela, o programa decide sozinho.

O nome não conta isso. A conversa toda do painel precisa de outras palavras:
aresta, contorno, vértice, peso — cada uma com um nome só, e um nome que diga o
que é.

## A olhar antes (regra dele)

Como Spriter, Spine e DragonBones fazem: o afastamento do contorno gerado, o
modo de criar vértice, e o nome que eles dão à aresta forçada.
