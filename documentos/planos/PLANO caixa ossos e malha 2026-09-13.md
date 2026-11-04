# Plano — a caixa, os ossos e a malha — 13/09/2026

Onze pedidos do Humberto, de 13/09/2026, repartidos em **quatro chats** que
trabalham ao mesmo tempo. As notas de origem:
`PEDIDOS ferramentas e seleção 2026-09-13.md` e `PEDIDOS malha 2026-09-13.md`.

**A régua de tudo:** *"eu não quero fazer um Spine, eu quero um Spriter com as
ferramentas do Spine."* Tudo abre como no Spriter; a ferramenta do Spine entra
dentro desse fluxo. E, antes de cada gesto novo: olhar como Spriter, Spine e
DragonBones fazem.

## Os quatro chats

| Chat | Nome | Itens | Modelo |
|:---:|:---|:---|:---|
| 1 | A caixa | bolinha de girar · caixa gira com o desenho · 3 alças no osso | Opus 5 |
| 2 | As ferramentas | uma ferramenta só · mover vários sem bagunça | Sonnet 5 |
| 3 | Criar e parentesco | nada vira parente sozinho · filho vira pai do pai | Opus 5 |
| 4 | A malha | contorno afastado · modo criar vértice · painel em ícones · os nomes | Opus 5 |

Nenhum dos quatro toca no arquivo do outro. Onde eles se encostam está escrito
em cada seção, na linha **Não toque**.

---

## Chat 1 — A caixa

**Arquivos:** `editor/src/viewport/transform-box.ts` (dono), e o desenho dela em
`viewport/viewport-draw.ts`.
**Teste:** `editor/testes/cena.test.ts`.
**Não toque:** `tools/transform-tool.ts`, `tools/translate.ts`, `rotate.ts`,
`scale.ts` — são do chat 2.

| # | O que fazer |
|:---:|:---|
| 1.1 | **A caixa acompanha o objeto.** Hoje, com um desenho escolhido, a caixa usa os eixos da TELA (`transform-box.ts`, o ramo do `pickedAttachment`: `frame` é a identidade), então o desenho gira e a caixa fica reta. Passar a medir a caixa nos eixos do próprio desenho — ângulo do osso mais a rotação do anexo, que já está calculado ali ao lado, na variável `axis` |
| 1.2 | **A bolinha de girar vai para a metade de cima do osso**, do lado da ponta. Hoje é `pivô + eixo × 60px de tela`, e ela nasce colada no pivô vermelho. Medir pelo comprimento do osso, com um mínimo em pixels de tela para o osso curto não perder a bolinha |
| 1.3 | **Três alças no osso, não oito.** Com um osso escolhido ficam só `w`, `e` (meio dos lados) e `n` (meio de cima). Saem os quatro cantos e o `s`. Com desenho escolhido continuam os oito. `transformHit` não pode mais responder um nome que não está na tela |

Pergunta fechada pelo Humberto: as três que ficam são os dois lados e o de cima.

---

## Chat 2 — As ferramentas

**Arquivos:** `editor/src/viewport/tools/transform-tool.ts` (dono),
`translate.ts`, `rotate.ts`, `scale.ts`, `shear.ts`, `ui/toolbar-model.ts`.
**Teste:** `editor/testes/ferramentas.test.ts`, `cena-selecao.test.ts`.
**Não toque:** `transform-box.ts` (chat 1), `create-bone.ts` (chat 3).

| # | O que fazer |
|:---:|:---|
| 2.1 | **Mover vários não pode bagunçar.** Em `translate.ts`, cada osso escolhido recebe o deslocamento; com pai e filho na mesma seleção, o filho anda **duas vezes**. Mover só os ossos que não têm ancestral dentro da seleção. Vale para Girar e Escalar também — confira os três |
| 2.2 | **O Transformar é a primeira ferramenta da barra.** Hoje `TOOL_ORDER` põe `select` antes. Ele abre o programa (`START_TOOL`) mas não é o primeiro botão |
| 2.3 | **O Transformar junta as cinco.** Já faz mover, girar, escalar e selecionar. Falta o Inclinar: achar o gesto que o encaixa sem inventar alça nova — olhe Spriter, Spine e DragonBones antes, e escreva no fim deste arquivo, em "Desvios", o que eles fazem e o que você escolheu |
| 2.4 | Mover, Girar, Escalar e Inclinar **continuam na barra** para quem quer uma de cada vez. O que muda é que ninguém precisa delas |

---

## Chat 3 — Criar e parentesco

**Arquivos:** `editor/src/viewport/tools/create-bone.ts`, `doc/bones.ts`,
`doc/reparent.ts`, e a Árvore (`panels/tree-commands.ts`).
**Teste:** `editor/testes/arvore.test.ts`, `documento.test.ts`.
**Não toque:** `transform-box.ts` (chat 1), `translate.ts` e amigos (chat 2).

| # | O que fazer |
|:---:|:---|
| 3.1 | **Nada vira parente sozinho.** `newBoneParent` devolve *"o osso escolhido, ou o primeiro osso do arquivo"*. É esse "ou" que enfia o osso novo debaixo da raiz sem ninguém pedir. Sem osso escolhido, o osso novo nasce **solto** — só o primeiro osso do arquivo é raiz. Vale para o Ponto e a Caixa também: confira os três |
| 3.2 | **O filho pode virar pai do pai.** `canReparent` (`doc/bones.ts`) recusa quando o novo pai é descendente — seria ciclo, e recusar é o certo para o arquivo. O que falta é o gesto: nesse caso, **trocar os dois de lugar** — o pai vira filho, e a cadeia continua de pé. Um passo de desfazer só. Olhe como os três programas resolvem antes de escolher o gesto, e escreva em "Desvios" |
| 3.3 | Os dois já existentes continuam: trocar de pai guarda a pose de **mundo** (o filho não pula), e a estrutura é da Montagem — o editor volta sozinho e avisa |

---

## Chat 4 — A malha

**Arquivos:** `editor/src/mesh/*`, `viewport/tools/mesh-tool.ts`,
`panels/mesh-panel.ts`, `panels/mesh-panel.css`.
**Teste:** `editor/testes/malha.test.ts`.
**Não toque:** nada fora de malha. `mesh-tool.ts` é seu neste lote: os chats 1
e 2 não encostam nele.

| # | O que fazer |
|:---:|:---|
| 4.1 | **O contorno gerado fica afastado da arte.** `traceOutline` anda em cima do primeiro pixel opaco, e a malha come a borda do desenho. Um afastamento para fora, em pixels da imagem, ligado por padrão. Número visível para quem quiser mudar |
| 4.2 | **Modo de criar vértice.** Hoje só `Ctrl` + clique no vazio. Pôr o modo em que o clique simples cria o vértice — é como Spine e DragonBones fazem. Olhe os dois antes |
| 4.3 | **O painel deixa de ser uma parede de texto.** Regra da casa: botão nasce em **ícone**, com o nome na dica. As frases de ajuda soltas saem do meio do painel |
| 4.4 | **Os nomes.** "Ligar" faz três trabalhos diferentes no mesmo painel: ligar a outra malha, ligar vértices e ligar ossos aos pesos. Cada coisa com um nome só, e um nome que diga o que é. "Ligar vértices" é criar uma **aresta** entre dois vértices, que manda onde a malha dobra — o nome precisa contar isso |

A ordem importa: 4.4 (os nomes) antes de 4.3 (os ícones), senão a dica de cada
ícone nasce com o nome errado.

---

## As regras que valem para os quatro

| # | Regra |
|:---:|:---|
| 1 | Backup datado em `backup/` antes de escrever, com uma linha no `backup/INDICE.md` |
| 2 | Teste novo vai no arquivo da sua parte. **A contagem nunca cai** (hoje 2.666) |
| 3 | Fecho: `npx vitest run` · `npx tsc --noEmit -p editor/tsconfig.json` · `node ferramentas/conformidade.mjs` · `npm run roteiro` · `npm run medir` |
| 4 | Mexeu em CSS: `npm run medir -- --fotos <pasta>` antes e depois |
| 5 | Versão no fecho: `python ferramentas/versao.py N.N "o que mudou"`. O script recusa número repetido. **Um fecho de cada vez**; quem fechou avisa |
| 6 | Desviou do plano? Escreva na seção "Desvios", no fim deste arquivo. Nunca invente por cima |
| 7 | Nada de manual: `documentos/manual/` está pausado até o Humberto pedir |

## Desvios

### Chat 2 — As ferramentas (itens 2.1 a 2.4), 13/09/2026

**2.3 — por qual gesto o Inclinar entra no Transformar.**

O que os três programas fazem, olhado antes de escolher
(`documentos/pesquisa/nova pesquisa/`):

| Programa | Tem Inclinar? | Como |
|:---|:---:|:---|
| Spriter | não | não existe inclinar nenhum no programa |
| Spine | sim | **ferramenta separada** — `Shear tool`, na lista de ferramentas, com alças próprias |
| DragonBones | não | não existe inclinar nenhum no programa |

Nenhum dos três resolve dentro de uma caixa só: dois não têm a ferramenta, e o
terceiro a põe do lado de fora. Então não havia modelo para copiar, e o pedido
era claro — **sem inventar alça nova**.

**O que escolhi:** `Alt` + arrastar o **meio de um lado** da caixa. É o gesto
de segurar uma tecla e puxar a aresta que todo editor de desenho tem há trinta
anos. Nenhuma alça nova, nenhuma alça a mais na tela, e quem nunca apertar o
`Alt` não vê diferença nenhuma.

Qual lado escreve qual campo é o **contrário** do Escalar, e tem de ser:

| Alça | Sem `Alt` | Com `Alt` |
|:---|:---|:---|
| meio de cima / de baixo (`n`, `s`) | escala Y | **inclina X** — o topo anda, a base fica |
| meio dos lados (`w`, `e`) | escala X | **inclina Y** |
| os quatro cantos | escala os dois | escala os dois: **canto não inclina** |

Duas portas fechadas de propósito: **canto nunca inclina** (canto não tem
direção única), e **sem osso escolhido o `Alt` não faz nada** — um anexo não
tem inclinação própria no formato (§7), e inventar uma criaria um campo que
nenhum leitor entende. Nos dois casos a alça escala, como sempre.

A tecla está escrita na dica do botão (`TOOL_NOTES.transform`), porque tecla
que ninguém vê precisa estar em algum lugar que se lê sem abrir o código.

**2.2 — precisei tocar num arquivo de passagem.** O `ui/keys.ts` guarda a
ordem das teclas das ferramentas (`TOOL_KEYS`), e o teste `teclas` compara essa
ordem com a da barra. Pôr o Transformar em primeiro na barra obriga a trocar
as duas primeiras linhas lá também. Foi só isso: duas linhas trocadas de lugar,
nenhuma tecla mudou de ferramenta. Cópia em
`backup/keys_2026-09-13_antes-do-transformar-primeiro.ts`.

**2.1 — o que ficou de fora, e por quê.** A mesma conta de "o filho anda duas
vezes" existe nas **setas do teclado** (`nudge`, em `viewport/tools/select.ts`):
ela também escreve o deslocamento em todo osso escolhido. O `select.ts` não é
da minha parte neste lote e ninguém o reservou, então **não mexi**. Fica
anotado aqui: é uma linha (trocar `selectedBones` por `draggedBones`), e quem
pegar o `select.ts` deve fazê-la.

**Onde a regra nova mora.** `topLevelBones(file, names)` e `draggedBones(doc)`
ficam em `viewport/tools/translate.ts` — o arquivo que o item 2.1 nomeia — e
`rotate.ts`, `scale.ts` e `shear.ts` os importam de lá. Tudo no mesmo degrau 3,
sem ciclo: o `translate.ts` não importa nenhum dos três.

**Testes.** 18 testes novos em `editor/testes/ferramentas.test.ts`, no bloco
`transformar (lote 47)`. A contagem foi de **2.666 para 2.684**.

### Chat 4 — A malha (itens 4.4, 4.3, 4.1 e 4.2), 13/09/2026

**4.2 — o modo Criar vértice: o que Spine e DragonBones fazem.** Procurei
documentação oficial dos três antes de escolher (busca na web; o repositório
não tem nota de pesquisa própria sobre isto). Não achei página que descreva o
gesto passo a passo, só confirmação de que os dois têm um modo de criar
vértice separado do de mover. Segui o pedido ao pé da letra: um botão liga o
modo (`Criar vértice`, ícone `plus`), e com ele aberto o clique simples no
vazio cria — o mesmo código do `Ctrl` + clique de sempre, que continua
valendo os dois jeitos. Esc fecha, como o modo Ligar (lote 69) já fazia.
Estado mora em `viewport/tools/mesh-tool.ts` (não em `mesh-panel-model.ts`):
é a ferramenta que decide o clique, a aba só acende o botão.

**4.1 — o afastamento: dilatar a máscara, não deslocar o vértice.** Cheguei a
cogitar empurrar cada vértice do contorno para fora, ao longo da normal
(a conta de "offset" de todo programa de vetor) — mas um canto côncavo fechado
faz esse tipo de conta se cruzar sozinho. Optei por **inchar a máscara opaca**
`outset` pixels antes de traçar (dilatação separável, em linhas e depois em
colunas — quadrada, não um círculo perfeito, mas barata e sem risco de cruzar
em canto nenhum, porque o traçado continua andando em cima de raster, nunca
deslocando ponto). Padrão: **2px**, ligado; o campo "Afastamento do contorno"
na seção Forma deixa o número visível e mudável, de 0 a 30.

**4.4 — achei uma quarta colisão de nome, fora do pedido.** "Suavizar" também
era o nome do MODO do pincel (Somar/Subtrair/Substituir/Suavizar, em Pesos →
Pincel) *e* do botão que suaviza a malha inteira de uma vez (Pesos →
Suavizar). Os dois ficam lado a lado na mesma aba. Segui a régua do item —
"cada coisa com um nome só" — e troquei o botão de suavizar tudo para
**"Suavizar tudo"**; o modo do pincel continua "Suavizar", que é o nome que
Spine e DragonBones já usam para o modo de pintura.

**Arquivos de passagem, só acrescentando.** `ui/icons.ts` ganhou sete ícones
novos (`mesh-borrow`, `auto-mesh`, `trace-outline`, `auto-weights`, `smooth`,
`edge-add`, `edge-remove`) — nada tirado, nada de outro dono mudou.
`panels/mesh-panel-model.ts` (a "ordem da aba", não citada no plano, mas é o
par de `mesh-panel.ts`) ganhou "ossos" na frase do modo Ligar (`BIND_NOTICE`),
para casar com o botão renomeado.

**Toquei um teste de outro chat, avisado e autorizado.** O item 4.3 trocou
botões de palavra por `iconButton`, e isso quebrou um teste de
`editor/testes/arvore.test.ts` (do chat 3) que lia o texto fonte de
`mesh-panel.ts` procurando `blockInAnimation(button(...`. A causa era minha;
o planejador autorizou o conserto pontual, só daquele `it`, sem mexer em mais
nada do arquivo.

**Testes.** 13 testes novos em `editor/testes/malha.test.ts`: 5 do afastamento
(4.1) e 6 do modo Criar vértice (4.2, mais a frase do rodapé). A contagem foi
de **2.666 para 2.679**, mais o que os outros chats já somaram.

### Chat 4 — A malha, rodada 2 (o salto do desenho, a aba liga a ferramenta, o painel de novo), 13/09/2026

O Humberto testou a v12.1. Três coisas, na ordem em que ele mandou:

**O salto — a causa certa, achada com números.** Minha primeira ideia
("alinhar o centro da silhueta nova com o centro da malha antiga") estava
ERRADA — o planejador me travou antes de escrever, com uma conta manual que
provava o sinal trocado. A causa de verdade: `autoMesh` media o tamanho do
canvas por um metadado (`def.width`/`image.width`÷escala do atlas), que quase
nunca bate com a CAIXA que a malha já ocupa na tela — a arte quase nunca enche
o canvas até a borda. `autoMeshOptionsFromBox` (`mesh/mesh-edit.ts`) resolve
sem metadado nenhum: o canvas inteiro cai na caixa atual. Testado vértice a
vértice (não só o centro, que dava o mesmo número certo ou errado com arte
simétrica) e conferido na tela.

**"Parou de funcionar" era meu erro, de outro tipo.** Ao escrever o primeiro
conserto, deixei uma variável com o nome trocado (`canvasWidth` virou
`posicao.width` no meio da edição) e esqueci de importar `autoMeshOptionsFromBox`
— o arquivo não compilava, e por isso os botões não faziam nada. Não tinha
nada a ver com o modo Criar vértice, a hipótese do Humberto; confirmei os dois
juntos na tela depois do conserto.

**A aba liga a ferramenta Malha — item novo, fora dos quatro originais.**
Pedido dele, direto: *"quando está mexendo com as malhas, podia ligar a
ferramenta Malha."* Como o Spine e o DragonBones: a porta é uma só. Liga só
numa TROCA de malha, em Montagem, e só se a ferramenta de agora não é Malha
nem Pesos — nunca tira quem já está pintando peso, nunca troca de novo na
mesma malha. `shouldAutoPickMeshTool`, puro, em `mesh-panel-model.ts`.

**O painel: nome de volta, mesma régua de antes.** "Ícone sozinho não se lê"
virou a exceção documentada em `mesh-panel.css`
(`.malha-botoes .painel-botao-nome { display: inline }`), só nesta aba. Os
nomes ficaram com até duas palavras, e a tecla ("L", "K", "Delete") saiu do
nome para a dica. Os quatro textos que ele circulou saíram do corpo do
painel; a explicação de cada um continua achável, na dica.

**Não fechei a conta da altura — e digo por quê, com número.** Depois dos
quatro cortes e do nome de volta, `npm run medir` (a medição de altura nova,
do chat 2) ainda mostra "Malha e pesos" rolando: **1121 px** de sobra em
1440×900, com a malha `face` do herói escolhida. Um corte de padding ajudou
pouco (1153 → 1121). Reparei que TRÊS painéis que não são meus — Propriedades,
Exibição, Prévia — também rolam, com folgas de 130 a 580 px: parece um teto de
altura que a casca dá pra qualquer painel, não um problema só de texto demais
no meu. O corte que fecharia a conta — dobrar mais seções, como "Avançado" já
é — muda `meshPanelSections()`, que `editor/testes/paineis.test.ts` (de outro
chat) trava num formato exato (`filter(s => s.collapsed)` só com `'ligada'`).
Não mudei essa forma sem combinar; fica para o planejador decidir se abre essa
porta ou se o teto de altura é conserto de outro lote, da casca.

**Toquei dois testes de outros chats, pela mesma causa de sempre.** O corte de
texto (item 4.3/4.4 da rodada 1) tirou duas frases do corpo do painel que
`paineis.test.ts` e `menus.test.ts` liam do texto fonte. Consertei só as duas
linhas, sem mexer em mais nada dos arquivos — a mesma regra que valeu para o
`arvore.test.ts` da rodada 1.

**Testes.** 9 novos em `malha.test.ts`: 4 do bug do salto (`autoMeshOptionsFromBox`,
vértice a vértice, com arte fora do centro) e 5 da aba ligando a ferramenta.
Suíte inteira: **2697 passam**, 29 pulados, 0 vermelho. `tsc` limpo.

### Chat 4 — A malha, rodada 3: fechar "caber na altura" (v12.3), 13/09/2026

O planejador liberou a porta que tinha fechado (dobrar mais seções): o
cruzamento com o chat 1 em `paineis.test.ts` acabou, e a prova de altura foi
consertada para medir o painel CHEIO, não vazio. Números novos: 961 px de
sobra em 1440×900, 1083 em 1280×720.

**O que dobrei.** Só "Pincel" — raio, força e modo do pincel são ajuste fino
de verdade, e ele sozinho pesava 270 px. Abre sozinho quando a ferramenta
Pesos entra na mão (é a hora em que o raio importa) e, do primeiro clique do
Humberto em diante, fica do jeito que ele decidiu — nunca mais abre nem fecha
sozinho. "Ossos que influenciam" e "Pesos" **continuam abertos**: é "os
pesos" que o planejador mandou manter.

**Dois cortes que não eram dobrar seção.** "Criar aresta" e "Apagar aresta"
eram dois botões — quatro numa fileira de coluna estreita, e a medição
(`--detalhe`) mostrava cada um na sua própria linha. Viraram UM: o par de
vértices escolhido já tem aresta entre eles ou não tem, então o botão já sabe
qual das duas coisas fazer, e troca de ícone e nome sozinho — `L` e `K`
continuam dois gestos, ninguém perde tecla. E o recado "Ligou a ferramenta
Malha (M)…", da rodada 2, morava preso na `.malha-recado` da própria aba — um
aviso de uma vez custando 61 px para sempre. Foi para `doc.notice`, a barra de
baixo, que é para isso que ela existe.

**O achado que muda o problema.** Rodei `--detalhe "Malha e pesos×"` (novo na
prova, do chat 2) e medi cada seção: Desenho 73 px, Forma 346 px, Ossos 191,
Pesos 239, Pincel e Avançado 41 cada, fechados. O espaço que a casca dá
("cabe") varia entre as medições — vi 193, 315 e uma vez 94 px — mas mesmo na
leitura mais generosa (315), **só Desenho + Forma, as duas seções que têm que
ficar abertas, já somam 419 px: mais do que o espaço inteiro.** Não é mais
"texto demais no meu painel" — é a casca dando pouco espaço para qualquer
coisa que precise ficar visível. Fechar de vez pede aumentar o "cabe", que não
é arquivo meu.

Conferido na tela, 1440×900 de verdade: a aba mostra Desenho, Forma (com os
botões com nome, legíveis) e, rolando, Ossos e Pesos abertos; Pincel e
Avançado fechados com o título à vista. Não virou uma lista de seções
fechadas.

**Testes.** Sem teste novo — os dois cortes mexem em DOM (sem jsdom no
projeto) e a lógica que sobrou pura (`hasEdge`, `shouldAutoPickMeshTool`) já
tinha teste. Ajustei a lista de seções dobradas em `paineis.test.ts`
(autorizado: a porta foi liberada nesta rodada). Suíte inteira: **2.744
passam**, 29 pulados, 0 vermelho. `tsc` limpo.

### Chat 3 — Criar e parentesco (itens 3.1 e 3.2), 13/09/2026

**3.1 — o que o "ou" era de verdade.** O plano diz para tirar o `?? primeiro
osso do arquivo` de `newBoneParent`. Tirar não dava: o formato pede
**exatamente um osso sem pai** (§4.2), e o runtime avisa e pendura o segundo
órfão na raiz sozinho (`loader.ts`). "Solto", no Recorte, é o osso pendurado
na **raiz invisível** desde o lote 60a — o nível de cima da Árvore. Então o
`ou` continua ali, e ele é o certo: sem nada escolhido, o osso novo nasce na
raiz, que é o mundo.

O enganchar que o Humberto via vinha de outro lugar, e ele mesmo apontou
durante o lote: *"por que uma imagem escolhe um osso? o que um novo osso tem a
ver com isso?"* Clicar num desenho na cena põe **o osso dele** na seleção junto
com o slot e o anexo (`selectionFor`, picking.ts) — e o osso novo entrava
debaixo desse osso, que a pessoa nunca escolheu. Agora, com anexo na seleção, o
osso que veio de carona não conta. Vale igual para o Ponto e a Caixa
(`shapeTarget`). Os desenhos continuam sendo **pegos** pelo osso novo: pegar é
outro gesto (`CreateBoneAndGrab`), e esse ele quer.

Também fechado por ele: **osso atrás de osso continua fazendo cadeia**. O
programa deixa o osso novo escolhido, e o próximo nasce filho dele — braço,
antebraço, mão. É o gesto do Spriter e do Spine, e não é o que o incomodava.

**3.2 — o que os três programas fazem.** Nenhum dos três tem um "trocar de
lugar": Spriter, Spine e DragonBones simplesmente **não deixam** soltar o pai
dentro do filho — o arrasto é recusado, sem gesto nenhum no lugar. Não havia
modelo para copiar, então o gesto é o do pedido dele, como o plano escreveu:
os dois **trocam de lugar** (`SwapBones`, em `doc/reparent.ts`).

Em dois passos, com um passo só de desfazer: o novo pai **sobe** para o lugar
que o outro ocupava, e o antigo pai **desce** e vira filho dele. Numa cadeia
`raiz → A → C → B`, trocar `A` com `B` dá `raiz → B → A → C`: os dois trocam de
posto e ninguém fica órfão. Cada passo é o `Reparent` de sempre, então a pose de
**mundo** de todos fica onde estava.

Só com **um osso** e nenhum desenho na seleção. Com dois ou mais, quem não pode
continua ficando de fora com o recado de sempre: trocar dois de lugar é um
gesto de um para um, e com cinco escolhidos seria adivinhar qual troca com qual.

**Pendente, e não é meu.** A tecla `P` ainda recusa o gesto antes de chegar na
porta única: `viewport/parent-gesture.ts` pergunta ao `canReparent` e para ali.
Só o arrasto da Árvore troca de lugar hoje. Não mexi porque o "soltar" do `P`
(clicar de novo para desfazer aquele clique) guarda o pai de antes de **um**
osso, e uma troca mexe em dois — arrumar isso é desenhar o gesto do `P` de
novo. Vai junto com o pedido novo do Humberto de 13/09, já anotado para o
próximo lote: *"quando seleciono um osso e aperto P, os ossos deviam mostrar
quem é filho dele — o Spriter faz isso com cor e opacidade leve"*.

### Chat 1 — A caixa (itens 1.1 a 1.3, mais o conserto do pivô), 13/09/2026

**1.1 e 1.2, direto do pedido.** A caixa passou a medir nos eixos do que está
escolhido (ângulo do osso mais a rotação do anexo — `frame` deixou de ser a
identidade com um desenho só); a bolinha de girar passou a medir pelo
comprimento do osso (3/4 dele, perto da ponta), com um mínimo de 30px de tela
para o osso curto não perder a bolinha.

**1.3 — a tabela do PEDIDOS descrevia a TELA, não os nomes da conta.** A
tabela de `PEDIDOS ferramentas e seleção 2026-09-13.md` diz: `w`,`e` (lados)
ficam a espessura; `n` (cima) fica o comprimento, pela ponta; `s` sai. Copiei
esses nomes ao pé da letra para `BONE_SCALE_HANDLES = ['w', 'e', 'n']` — e
errei: na conta de `transform-box.ts`, o handle `w` **é sempre o mesmo ponto
que o pivô** (a base do osso, centro da espessura — `mid(nw, sw)` dá sempre
`(0, 0)` no frame do osso, não importa a largura). Quem é o handle da ponta é
o `e`; quem são os dois da espessura são `n` e `s`. O Humberto testou a v12.1
e mandou foto: um quadradinho em cima do pivô vermelho. A geometria bateu com
a foto — não era "largura mínima", era o nome errado na lista.

**Conserto:** `BONE_SCALE_HANDLES = ['n', 's', 'e']`. Verificado na tela (osso
`shin` do herói, fino): pivô limpo, duas alças nos lados, uma na ponta, nada
sobreposto. Se algum dia alguém for arrumar isso de novo lendo só a tabela do
PEDIDOS (que descreve o que se VÊ, não os nomes internos): a régua é a
geometria em `transform-box.ts`, não a tabela.

**Toquei um teste de outro chat, avisado e autorizado.** O chat 2 escreveu,
em cima do meu primeiro `['w','e','n']` (errado), um teste em
`editor/testes/ferramentas.test.ts` (linha 763) travando esse valor. Depois do
conserto ele ficou vermelho. O planejador autorizou o ajuste pontual — só
aquele `toEqual`, nada mais no arquivo.

**`viewport-draw.ts` não tem nada da caixa.** Quem desenha o retângulo, os
quadradinhos e a bolinha é `transform-tool.ts` (`drawOverlay`), não
`viewport-draw.ts` — o plano original apontou o arquivo errado. O chat 2 já
tinha atualizado esse desenho para seguir `box.visibleHandles` (a lista nova
que `transform-box.ts` expõe) antes de eu chegar nesta parte; não precisei
mexer lá.

**Testes.** 3 testes novos em `editor/testes/cena.test.ts`, no bloco `a caixa
do Transformar (item 1, 13/09/2026)`.

### Chat 1 — os painéis Propriedades e Exibição na altura, 13/09/2026

Lote à parte, fora dos itens 1.1-1.3: o Humberto testou a v12.1 e mandou a
prova nova do chat 2 (`npm run medir`, a medição de ALTURA). Propriedades e
Exibição rolavam 591/495px e 653/757px (1440×900 / 1280×720) — texto fixo que
não cabe, não uma lista que cresce com o arquivo.

**A ordem do pedido: cortar texto → juntar numa linha → apertar o CSS.**

1. **Cortar.** O grupo **Travar** (Exibição) saiu inteiro: "Travar ossos" e
   "Travar desenhos" já são a MESMA caixa da coluna "Travar" da tabela
   "Mostrar na tela", ali em cima — duas caixas para a mesma pergunta. A tecla
   (8, 0) que ele carregava virou dica da caixa que já existe; o atalho
   continua documentado no menu Esqueleto (`ui/menus.ts`), como sempre foi.
   As frases de "como se usa" (guia, travar) viraram `title` — só aparecem
   para quem passa o mouse, não uma linha que fica sempre, com arquivo nenhum
   aberto.
2. **Juntar numa linha.** Largura+Altura, X+Y, Escala X+Escala Y — pares que
   já são uma ideia só — passaram a dividir uma linha (`properties.ts`,
   `renderPairedRow`/`renderQuickPair`). Um grupo de UM campo só (o mais
   comum: "Cor") deixou de ganhar moldura própria: ele entra como mais uma
   linha do grupo anterior, porque o rótulo do campo já diz "Cor" — nada se
   perde. "A cena" e "Guias" da Exibição viraram uma grade de duas colunas
   (`.exibicao-pares`), do jeito que "Mostrar na tela" já fazia com três.
3. **Apertar o CSS.** Preenchimento do `<fieldset>`, o `<legend>`, a margem
   de cada linha, a altura mínima de campo e caixa — tudo revisado em
   `properties.css`, `quick-sheet.css` e `view-panel.css`.

**Resultado, `npm run medir` (o mesmo mesh `face`, a prova do Humberto):**

| Aba | 1440×900, antes → depois | 1280×720, antes → depois |
|:---|---:|---:|
| Propriedades | 591 → 205 px | 495 → 339 px |
| Exibição | 653 → 132 px | 757 → 236 px |

**Não fechei em zero.** As duas continuam "ROLA" na prova, não "cabe" — o
corte foi grande (a Exibição perdeu quatro quintos do que sobrava em
1440×900), mas não bastou. Achei um porém que vale registrar: o mesmo `.bone`
e a mesma seleção (`slots:['head'], attachments:[{head,face}]`) mostram a
Ficha rápida numa medição e não na outra — parece que a FERRAMENTA ativa
(que decide se "Compensar" aparece) não é a mesma nas duas aberturas do
`medir`, e isso já acontecia antes deste lote (conferi no log de antes de eu
mexer). Não é bug meu, e não é `properties.ts`: é ferramenta ativa, que mora
em `viewport/tools/registry.ts`, fora da minha parte. Deixo escrito para quem
for atrás: pode valer a pena o `medir` fixar a ferramenta antes de medir, para
as duas aberturas testarem o mesmo painel.

**O que falta não é texto — é espaço, e a conta veio da alça, não de um
`<details>`.** Antes de propor dobrar seção, o planejador pediu para medir se
havia um teto de verdade na casca. Medi a cadeia inteira (janela → `.shell` →
`.shell-body` → `.shell-middle` → `.panel-column` → `.panel-group` →
`.painel-corpo`) num Vite isolado (porta 5199, sem a confusão do 5173
compartilhado): a janela desce inteira e proporcional até o grupo — não há
altura fixa nem `min-height` que ignore a janela em nenhum degrau.

O que limita é a **alça de divisão** entre os dois grupos empilhados de cada
coluna (recurso que já existe, arrastável — `ui/panel-groups.ts`,
`DEFAULT_SPLIT = 0.58`, `SPLIT_MAX = 0.85`). Testei levando a alça ao limite
de fábrica, SEM cortar mais nada:

| Janela | Propriedades com a alça em 0,85 |
|:---|:---|
| 1440×900 | **zera sozinho** (205 → 0 px) |
| 1280×720 | ainda sobram 166 px — a janela é curta demais para os dois grupos, mesmo no limite |

Ou seja: não é a casca ignorando a janela (ela responde certinho), e não é
texto demais (meu corte já valia 205px e não bastou) — é a **divisão de
fábrica** que não dá espaço para painéis pesados quando os dois grupos da
coluna têm conteúdo. O chat 2 mediu o mesmo defeito na Prévia (213px
recebidos, 405px precisos com tudo dobrado) e o Humberto descreveu o MESMO
problema com as próprias palavras, sem ver número nenhum: *"aposto que tem
muito espaço mal otimizado (...) podia ter botões para recolher quando não
estivesse usando"*. O lote da coluna — recolher cada grupo e o grupo ativo
ganhar a altura que sobra — foi para o chat 2, que está com a prova e as
fotos na mão. Não mexi em `ui/panel-groups.ts` nem em `ui/shell.css`: são
dele agora.

**Toquei em `transform-tool.ts`? Não.** O aviso do planejador autorizava, se
precisasse — não precisou: o desenho da caixa já usa `visibleHandles` desde
o lote anterior.

**Testes.** Nenhum teste novo: são mudanças de layout e CSS, cobertas pela
prova de altura (`npm run medir`), não pela suíte. `paineis.test.ts` e
`exibicao.test.ts` continuam verdes, sem precisar de ajuste — nenhum dos dois
testava a forma do DOM destes dois painéis.
