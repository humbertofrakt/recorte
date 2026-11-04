# SEQUENCIA — malha e pesos — 28/09/2026

Escrito pelo chat L, `USO · malha e pesos`. Não escreve código, não conserta.
Reporta ao `PLANEJADOR · 9f75b5`.

**A tarefa:** transformar uma imagem em malha · contorno · vértice e aresta ·
ligar ossos · pesos automáticos · pincel de pesos · dobrar o osso · arrastar
vértice na animação.

---

# PARTE 1 — A REFERÊNCIA

## Como ler esta parte

| Marca | Quer dizer |
|:---|:---|
| **LIDO** | li a página oficial inteira, agora |
| **TRECHO** | só vi o resumo do buscador. A página não abriu |
| **não achei** | procurei e não achei. Não inventei |

## Fontes

| # | Programa | Fonte | Estado |
|:---:|:---|:---|:---:|
| 1 | Spine | [Mesh attachments](https://eu.esotericsoftware.com/spine-meshes.md) (Esoteric Software, guia do usuário) | **LIDO** |
| 2 | Spine | [Weights view](http://esotericsoftware.com/spine-weights) (guia do usuário) | **LIDO** |
| 3 | Spine | [Mesh weight workflows](https://eu.esotericsoftware.com/blog/Mesh-weight-workflows) (blog oficial) | **LIDO** |
| 4 | DragonBones | [Skin Weights](https://docs.egret.com/dragonbones/en/docs/dbPro/advancedFeatures/skinWeights) (docs oficiais, Egret) | **TRECHO** — o site recusou a conexão 3 vezes, e o navegador do app também |
| 5 | DragonBones | [Grid](https://docs.egret.com/dragonbones/en/docs/dbPro/advancedFeatures/grid) (docs oficiais) | **TRECHO** — mesmo motivo |
| 6 | DragonBones | [Tutorial 4 – Editing Mesh Weights](https://steemit.com/art/@poedil88/dragonbones-pro-5-1-tutorial-4-editing-mesh-weights) (vídeo de terceiro) | só o título: *"ensina a editar os pesos da malha em relação aos ossos"*. Os passos estão no vídeo, que não pude ver |
| 7 | Spriter | [Steam, Spriter Pro, "deformação"](https://steamcommunity.com/app/332360/discussions/0/1735462352481787011) (usuário experiente, não a fabricante) | **LIDO** |

---

## SPINE — a fila (fontes 1, 2, 3, LIDAS)

| Passo | O que a pessoa faz | Onde fica |
|:---:|:---|:---|
| 1 | Cria a imagem como região e marca **Mesh**. Vira malha de 4 vértices, um em cada canto | caixa `Mesh` nas propriedades da árvore |
| 2 | Entra no modo de edição | botão **Edit Mesh** nas propriedades da árvore. Sai com `Espaço`, `Esc` ou o mesmo botão |
| 3a | Define o contorno **na mão** | botão **New**: clica os pontos do contorno; fecha clicando no primeiro |
| 3b | Ou **traça sozinho** o contorno | botão **Trace** (com *Detail, Concavity, Refinement, Alpha threshold, Padding*) |
| 3c | Ou **gera vértices** onde ajudam a dobrar | botão **Generate** (pode apertar de novo; os que existem ficam parados) |
| 4 | Ajusta vértices | ferramenta **Modify** (arrasta) · **Create** (clica cria vértice, arrasta cria aresta) · **Delete** (clica ou faz caixa). Troca com **botão direito** |
| 5 | Vê a triangulação | caixas **Triangles**, **Dim**, **Isolate**, **Deformed** |
| 6 | Volta ao começo | botão **Reset** (4 cantos; apaga pesos e chaves de deformação) |
| 7 | **Liga os ossos** à malha | no painel **Weights**: **Bind**, e clica cada osso (ou escolhe os ossos e clica a malha) |
| 8 | Os pesos saem sozinhos | botão **Auto** (leva em conta a topologia da malha, não só a distância) |
| 9 | **Vê** os pesos | ferramenta **Weights**: lista de ossos com cor · **Pies** (pizza por vértice) · **Overlay** (cor sobre a malha) · **Selected** |
| 10 | Pinta os pesos | **Direct** (arrasta cima/baixo, ou controle **Weight**) · pincel **Add / Remove / Replace**, com **Strength, Size, Feather** |
| 11 | **Arrastar um vértice na animação** — feito na **v23.1** (todos os outros passos foram na v22.8). Abri a animação `idle`, pus o tempo em 0,53 s, escolhi a ferramenta Malha (ícone da barra), **cliquei o vértice** (fica laranja) e **arrastei** | **em parte**: a ferramenta é o mesmo ícone da malha, mas nada diz que precisa **escolher o vértice antes de arrastar**. Um primeiro arrasto sem escolher não moveu nada | **sim**: o vértice andou e **nasceu um losango novo em 0,53 s** na linha "Resumo" da linha do tempo; o campo do tempo ficou laranja | **não**: o rodapé continua "Animação: idle — Mexer grava chave." (a etiqueta de sempre). Não diz "chave de deformação criada". Só vi o losango no "Resumo": **não vi a linha própria da deformação** | **não**: nada diz "agora toque a animação" | v231_01 a v231_04 |
| 12 | **Testa dobrando o osso** | move o osso no modo Setup e desfaz · ou no modo Animar com auto-chave desligada |
| 13 | Arruma se mexeu o osso depois de ligar | **Update Bindings** |
| 14 | **Arrasta vértice na animação** | no modo Animar, move o vértice com qualquer ferramenta de transformação: nasce uma **Deform key**. Só guarda posição; entre duas chaves o vértice anda em reta |

**A ordem que o Spine recomenda** (fonte 3): ligar em Setup · testar dobrando em
animação · começar pelos extremos (100% nas pontas) · agrupar · **Smooth** ·
**Prune** · ajustar a ordem dos triângulos · **Update Bindings** se preciso. E
diz: *prefira pesos a chaves de deformação*.

---

## DRAGONBONES — a fila (fontes 4 e 5, só TRECHO)

Não li a página. O que o buscador mostrou dela:

| Passo | O que diz | Certeza |
|:---:|:---|:---:|
| 1 | Seleciona a malha e marca **"Open Edit"** no painel de propriedades (atalho **D**) | TRECHO |
| 2 | Gera o contorno sozinho pela borda da imagem, com **densidade de 1 a 5** | TRECHO |
| 3 | Ferramenta **add** para pôr vértices; arrasta para fazer fios (arestas) à mão | TRECHO |
| 4 | Com a edição aberta, clica **"Bind Bone"** e depois clica cada osso | TRECHO |
| 5 | Ajusta o peso de cada osso por **controle deslizante** | TRECHO |
| 6 | Ferramenta **Weight** na barra: ao escolher a malha, vê o peso de cada osso em cada ponto | TRECHO |
| 7 | Osso ligado **depois** não recebe peso sozinho; botão **"auto weight"** recalcula | TRECHO |
| — | Dobrar o osso para testar · arrastar vértice na animação | **não achei** |

Os nomes exatos e a ordem dos botões do DragonBones **precisam de conferência**
quando a página abrir.

---

## SPRITER — o que tem (fonte 7)

| Ponto | O que diz | Certeza |
|:---|:---|:---:|
| Malha e deformação | **"não é oficialmente suportada"**. Ficou como prova de conceito, ideia de recurso Pro | LIDO (um usuário experiente, não a fabricante) |
| Como se liga | mudar *"Drag new item as"* de *sprites* para **skins** | LIDO |
| Os players (Unity, Construct…) | não tocam a deformação | LIDO |
| Fila de passos: contorno, vértice, pesos, pincel | **não achei** |  |

**Conclusão:** o Spriter não serve de modelo para malha e pesos. Aqui o modelo é o
**Spine**. Regra da casa: fluxo do Spriter, ferramentas do Spine encaixadas nele.

---

## A FILA-MODELO que uso na Parte 2

Ordem do Spine, com os nomes que vou procurar no nosso programa:

| # | Passo | Ferramenta esperada |
|:---:|:---|:---|
| 1 | Escolher a imagem e **virar malha** | caixa/botão "malha" |
| 2 | Entrar na edição da malha | botão de editar |
| 3 | **Contorno**: à mão ou traçado sozinho | New · Trace |
| 4 | **Vértices**: gerar, criar, mover, apagar | Generate · Create · Modify · Delete |
| 5 | **Arestas**: criar e apagar | Create (arrasta) · Delete |
| 6 | **Ligar ossos** à malha | Bind |
| 7 | **Pesos automáticos** | Auto |
| 8 | **Ver** os pesos | Pies · Overlay · lista de ossos |
| 9 | **Pintar** os pesos | pincel Add / Remove / Replace |
| 10 | **Dobrar o osso** e ver a imagem deformar | mover o osso |
| 11 | **Arrastar um vértice na animação** e ver a chave nascer | Deform key |
| 12 | Desfazer | — |

---

# PARTE 2 — A SEQUÊNCIA NO NOSSO

## Como foi feito

| Item | O quê |
|:---|:---|
| Quem | chat L, como usuário. Sem olhar o código para achar botão |
| Programa | o **montado**, `programa/servidor.mjs`, porta **5312** (ordem do Planejador: o de desenvolvimento recarrega quando os outros chats gravam). **Versão: v22.8, de 22/09** — a que estava em `programa/` em 29/09, 00h |
| Tela | navegador do app, emulando **1280×720** |
| Fotos | `backup/fotos-rodada-final/uso-malha/`, todas da porta 5312. Nome = número do passo + o que mostra |
| Boneco | o herói de exemplo. Desenho usado: **body** (o torso) |
| Data | 28/09 à noite, e 29/09 depois da meia-noite |

**As quatro perguntas**, em cada passo: **(1)** achei a ferramenta sem procurar?
**(2)** o que criei apareceu na tela? **(3)** o programa disse o que aconteceu?
**(4)** ficou óbvio qual é o passo seguinte?

## Os passos, um por um

| # | Passo | (1) Achei? | (2) Apareceu? | (3) Avisou? | (4) Próximo óbvio? | Foto |
|:---:|:---|:---:|:---:|:---:|:---:|:---:|
| 0 | Abrir o herói | **sim** — cartão "Abrir o herói" na tela de boas-vindas | sim | sim: rodapé "Abriu a base" | **não**: fica um boneco pequeno no alto da cena. Nada diz "escolha um desenho" | 00, 01 |
| 1a | Achar onde se faz malha | **sim, por sorte** — a aba **Malha e pesos** está no grupo de baixo à direita, entre Histórico e Regras. Não está no menu | — | sim: a aba diz "Escolha um desenho na árvore ou na tela" | sim | 02 |
| 1b | Escolher o desenho `body` | sim (árvore) | sim, aparecem os quadradinhos do desenho | não | **sim**: aparece **Forma → Virar malha** | 03 |
| 1c | **Virar malha** | **sim** — botão com nome | **em parte**: vira um retângulo de 4 pontos sobre o torso, quase invisível com a cena pequena. Precisei apertar **Ajustar** e rolar o mouse para ver | **em parte**: o rodapé diz "Ligou a ferramenta Malha (M), para mexer na cena". Não diz que **a malha foi criada** nem quantos pontos tem | **em parte**: o painel passa a mostrar Afastamento, Gerar automática, Traçar contorno. Mas o painel tem 4 linhas de altura: o resto está **abaixo, escondido, é preciso rolar** | 04, 05 |
| 2 | **Traçar contorno** | sim (botão com nome, dentro de Forma) | **sim**: pontos aparecem em volta do torso | **fraco**: o rodapé diz só "Traçar contorno." — o nome do botão, não o resultado. E ele **só apareceu depois**: a primeira foto tirada logo após o clique ainda mostrava o aviso velho | não: nada diz que agora dá para "Gerar automática" | 06, 07 |
| 3 | **Gerar automática** | sim | **sim**: enche o torso de pontos | **fraco**: "Gerar malha." — nome, sem número | não | 08 |
| 4a | **Criar vértice** | sim | **sim**, mas só se vê com a cena bem ampliada | **sim, bom**: o rodapé diz "Clique na malha para criar vértices. Criar vértice de novo termina." Depois do clique: "Novo vértice." | sim | 09, 10, 11 |
| 4b | **Escolher um vértice** | **não se acha**: nada diz que é só clicar no ponto | sim (fica laranja) | não | **sim**: "Apagar vértice" acende | 13 |
| 4c | **Escolher dois vértices** | **não se acha**: só descobri que é **Shift+clique** porque já conhecia do Spine. Nenhuma dica na tela | sim (dois laranjas) | não | **sim**: "Criar aresta" acende | 14 |
| 5a | **Criar aresta** | sim, mas **apagado** enquanto não há dois vértices, **sem dizer por quê**. Cliquei apagado: nada aconteceu, **nenhum aviso** | a aresta **não se distingue** das do desenho automático. Não sei se a criei | **sim**: rodapé "Criar aresta." E o botão **vira "Apagar aresta"** | sim | 12, 15 |
| 5b | **Apagar vértice** | sim | **sim**: os dois pontos sumiram | sim: o rodapé volta a "Arquivo não salvo." (o texto da ação passou depressa) | não | 16 |

| 6a | **Ligar ossos** (botão) | **em parte**: está no meio do painel, **abaixo da dobra**. Só o vi rolando. O nome ("Ligar ossos") é claro | sim: o botão fica azul e abre um quadro azul | **sim, ótimo**: quadro no painel **e** rodapé: "Clique nos ossos que puxam esta malha. Ligar ossos de novo termina." | sim | 17, 18 |
| 6b | Clicar no osso `torso` | sim (o aviso diz "clique nos ossos"; cliquei na **Árvore** e funcionou) | sim: aparece uma linha na lista de ossos, com cor e 100% | **sim, ótimo**: `"torso" entrou na malha "body", com peso 1 em todos os pontos.` | sim | 19 |
| 6c | Clicar no osso `arm` | sim | sim (linha nova) | **sim, ótimo**: `"arm" entrou na malha "body" com peso 0: pinte, ou use Pesos automáticos.` **Diz o passo seguinte** | **sim** | 20 |
| 6d | Fechar o modo de ligar | sim (o mesmo botão) | — | sim: "Modo de ligar ossos fechado." | **em parte**: os botões de Pesos ficam abaixo, e é preciso rolar | 21 |
| 7 | **Pesos automáticos** | sim (botão com nome, em "Pesos") | **não**: a cena **não muda**. Nenhuma cor, nenhuma pizza, nada mostra os pesos | **em parte**: o rodapé diz só "Pesos automáticos." — o resultado ("36 vértices") está num quadro **fora da tela, no fim do painel**, só aparece se eu rolar | **não**: nada diz "agora dobre o osso" nem "agora pinte" | 22, 23 |
| 8a | **Ver** os pesos, no painel | **não se acha**: nada no painel diz "para ver os pesos, ligue o pincel" | os números **62% / 38%** estão na lista de ossos: nome **cortado** ("tor…"), e **longe da cena** (abaixo da dobra) | não | não | 26, 27, hd13 |
| 8b | **Ver** os pesos, na cena — ícone de **pincel na barra de cima** | **não se acha**: o pincel é um **ícone da barra**, sem nome, sem tecla à vista. Achei porque clicava nos ícones, um por um | **sim, bom**: cada ponto ganha a **cor do osso** que mais o puxa (verde = torso, roxo = arm), e uma "pizza" com a parte de cada osso | **não**: o rodapé não muda. **Não há legenda na cena**: quem é verde? só se sabe olhando a lista lá embaixo, à direita | não | 30, hd12 |
| 9a | **Achar o pincel** no painel | **não se acha**: o painel tem um grupo **"Pincel ▸" recolhido** (Somar · Subtrair · Substituir · Suavizar · Raio · Força), mas **abrir o grupo não liga o pincel**. Só o ícone da barra liga. O painel **não diz isso** | — | — | **não**: ficou sem saber "como pinto". Arrastei na cena com a ferramenta Malha e nada foi pintado | 24, 25, 28, 29 |
| 9b | **Pintar** (ícone da barra ligado + osso escolhido na lista + arrastar) | **não se acha** que o osso a pintar é o que **escolho pelo nome na lista** (clicar no nome escolhe o osso). Nenhuma dica | **sim**: os pontos mudaram de cor; **arm subiu de 38% para 57%**, torso caiu de 62% para 43%. Círculo azul do pincel na cena | **não**: o rodapé **não diz nada** ao pintar. Só os números mudam | sim | hd14, hd15 |
| 10a | **Dobrar o osso**: ferramenta Girar, osso `torso` escolhido, arrastar o anel azul | sim (ícone da barra; anel azul aparece sozinho) | **sim, ótimo**: o torso girou e **o desenho `body` deformou** — a camisa entortou, puxada pelos dois ossos | **não avisou que foi na BASE**: o rodapé só mostra a etiqueta "Base: heroi — Mexer grava na base". Sem mensagem do gesto. O arquivo ficou "não salvo" | **em parte**: dá para desfazer (botão da barra), mas nada diz "isto era um teste, desfaça" | hd18, hd19 |
| 10b | Dobrar o osso `arm` (o que tem o ícone de telefone, IK) | sim | **não**: arrastar o anel do `arm` **não fez nada** | **não**: **nenhuma mensagem** dizendo que o osso é comandado por IK e por isso não gira | não | hd16, hd17 |
| 10c | **Desfazer** o giro (botão da barra) | sim | sim, voltou | **sim, ótimo**: "Desfeito: Girar osso." | sim | hd20 |

| 11 | **Arrastar um vértice na animação** e ver a chave nascer | — | — | — | — | **FALTA FAZER** (o Planejador mandou parar servidor e foto às 00h; retomo em "casa livre") |

## Fotos

Duas séries em `backup/fotos-rodada-final/uso-malha/`:

| Série | De onde | Tela |
|:---|:---|:---|
| `00` a `30` | painel de navegador do app, programa montado, porta 5312 | 800×450 (reduzida) |
| `hd01` a `hd20` | Chrome sem janela dirigido por script, **o mesmo programa montado v22.8**, mesma porta 5312 | 1280×720 cheios |

Trocei de série porque o painel do app ficou oculto e parou de desenhar. Nada
foi salvo, exportado nem aberto por janela do Windows: todos os passos foram
cliques dentro da página.

## O que a fila mostrou, em uma tabela

| Passo | Panela (achei?) | Arroz (apareceu?) | Água (avisou?) | Ordem (próximo óbvio?) |
|:---|:---:|:---:|:---:|:---:|
| Virar malha | sim | em parte (quadro de 4 pontos, cena pequena) | fraco | em parte |
| Contorno · Gerar | sim | sim | fraco (só o nome do botão) | não |
| Criar vértice | sim | sim | **sim, bom** | sim |
| Escolher 1 e 2 vértices | **não se acha** (Shift+clique) | sim | não | sim |
| Criar aresta | sim (apagado sem dizer por quê) | **não se distingue** | sim | sim |
| Apagar vértice | sim | sim | fraco | não |
| Ligar ossos | em parte (abaixo da dobra) | sim | **sim, ótimo** | **sim** |
| Pesos automáticos | sim | **não** (a cena não muda) | fraco (resultado escondido) | **não** |
| Ver os pesos | **não se acha** (ícone da barra) | sim, só com o pincel ligado | não | não |
| Pintar (pincel) | **não se acha** | sim (cor e %) | **não** | sim |
| Dobrar o osso | sim | **sim, ótimo** (a malha deforma) | não avisa que é na base | em parte |
| Desfazer | sim | sim | **sim, ótimo** | sim |
| Arrastar vértice na animação | — | — | — | falta fazer |

**A frase do Humberto, para esta tarefa:** a panela existe (Virar malha, Ligar ossos,
Pesos automáticos), mas o **pincel** e a **vista dos pesos** estão escondidos; o arroz
(os pesos) **só aparece se souber ligar o pincel**; e a água (o aviso) é ótima em
dois passos e some no resto. **Os defeitos estão em
`documentos/planos/DEFEITOS achados no uso 2026-09-28.md`, itens L1 a L16.**

