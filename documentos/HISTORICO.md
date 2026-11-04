# Histórico do projeto

O que estava no `ESTADO.md` abaixo do estado de hoje, até a v11.2 (11/09/2026).
Movido no lote A7 **sem mudar uma letra**; o `ESTADO.md` ficou só com o hoje.
Os lotes seguintes estão no `CHANGELOG.md` e no `backup/INDICE.md`.

---

# Onde o projeto estava — 10 e 11/09/2026 (lotes 59 a 68)

Pedido do Humberto: começar como o Spriter. Não existe "importar imagens":
abre-se uma **pasta**, as imagens ficam na aba Imagens por subpasta, arrastar
monta, a imagem se troca pela lista da mesma pasta, o pivô se repete para a
pasta, e o **atlas nasce ao salvar**, só com o que está em uso.

| Versão | Lote | O que entrou | Testes |
|:---:|:---|:---|:---:|
| v8.9 | 59 · abrir pasta | **Arquivo → Abrir pasta…** (e nas boas-vindas). A aba Imagens por **subpasta**, dobrável, ordem natural, **Recarregar**. Saiu **Importar → Imagens…** e a fila de 7.000 px. PNG solto vai para a aba, não para a cena | 2.409 → 2.432 |
| v9.0 | 60 · a lista da pasta | Arrastar da pasta para a cena (região provisória). **Lista da mesma subpasta** pelo campo Imagem, pela Ficha rápida e pelo **clique parado** no desenho escolhido; `Shift` = todas as peles; em Animando, chave. Botão direito no desenho. Um menu de botão direito só | 2.432 → 2.452 |
| v9.1 | 61 · pivô por pasta | **Repetir para a pasta** no Definir pivô…: mesmo pixel, ou mesma proporção; nada atravessa pastas. Pivô guardado para imagem fora da cena | 2.452 → 2.462 |
| v9.2 | 62 · salvar empacota | O **Salvar empacota** as imagens em uso, com pivô, e grava o atlas **ao lado do `.bone`, na pasta**. Reabrir a pasta **continua de onde parou**. Saiu Reempacotar atlas | 2.462 → 2.475 |
| v9.3 | 60 · acréscimo | **Primeiro a arte, depois os ossos**: a imagem solta nasce na raiz, livre. **Criar osso** com desenhos escolhidos os **pega sem mover**, num passo; `Ctrl` cria sem pegar | 2.475 → 2.481 |
| v9.4 | 60a · a raiz é invisível | A **raiz não se desenha nem se escolhe**: clicar num desenho solto escolhe só ele. **Transformar com vários desenhos**: a caixa deles, o pivô no centro; girar e escalar em volta do centro comum. Árvore sem `root`; campo Osso *nenhum (livre)* | 2.481 → 2.495 |
| v9.5 | 63 · o P liga o osso | Osso escolhido + **P** + clique numa **malha** liga o osso a ela (peso 1, ou 0 se ela já tem peso); de novo, tira. Botão **tirar** na lista. Pesos automáticos só com os ossos da lista | 2.495 → 2.505 |
| v9.6 | 63a · o P é um gesto só | **Um gesto**: um osso, segure P, clique. Saiu a janela "Virar filho de qual osso?". Prender só desenhos **em Animando fica em Animando**, sem mover. Árvore: desenho sobre osso troca o pai. Raiz fora das listas das regras. **Virar malha não foge**; os botões da malha ficam cinza em Animando | 2.505 → 2.529 |
| v9.7 | 60b · a grade de imagens | Com um desenho escolhido, **grade de miniaturas na cena**, embaixo dele, até 6 por linha; o clique troca pelo pivô. **Fonte: pasta ou objeto**. Exibição → Grade de imagens. O clique parado não abre mais a lista | 2.529 → 2.544 |
| v9.8 | 67 · o roteiro sozinho | **`npm run roteiro`**: os 14 passos do Roteiro dos 30 minutos num Chrome sem janela, com gestos de verdade; passou ou o que faltou, e fotos. Primeira rodada: **9 de 14** | 2.544 (sem mudança) |
| v9.9 | 68 · consertos do roteiro | O programa **abre vazio**, em Montagem. O **começo da animação se guarda sozinho** (chave em 0 com a montagem). **Espaço toca em toda parte**; Espaço + arrastar move a vista. Roteiro: **13 de 14** | 2.544 → 2.555 |
| v10.0 | 60c · botão direito e transparente | **Botão direito** no desenho abre a grade das imagens, com opções; clique esquerdo só escolhe; o pivô saiu do botão direito. **O clique passa pelo transparente** da imagem | 2.555 → 2.566 |
| v10.1 | 65 · painéis que cabem | Nenhum painel mais largo que a coluna, sem rolagem de lado; nome comprido corta, inteiro na dica. Malha e pesos começa por Forma; malha ligada no fim, dobrada. **22 de 22** medições cabem | 2.566 → 2.572 |
| v10.2 | 64 · árvore única | A Árvore é uma árvore só: o osso com os desenhos dele por baixo, depois os filhos. Miniatura da pele em edição; dobra por arquivo; busca que abre; arrastar para o vazio deixa solto; P + clique na linha. Roteiro **14 de 14** | 2.572 → 2.586 |
| v10.3 | 66 · ordem como o Spriter | Ctrl+↑ ↓ → ← na cena e na aba Ordem; em Animando a ordem vira chave (Gravar desligado recusa); a aba mostra a ordem do quadro, com ◆; Editar → Copiar a ordem na animação. Prova na cena **8 de 8**; roteiro **14 de 14** | 2.586 → 2.600 |

**O plano pasta do projeto está completo.** Plano e Desvios:
`documentos/planos/PLANO pasta do projeto 2026-09-10.md`. Conferido num Chrome
de verdade: abrir a pasta, montar, salvar, fechar, reabrir — o `.bone`, o
atlas e a página saem juntos, e o console fica limpo.

**A fila acabou.** Os lotes 49 a 52 (rodada 5) já tinham fechado antes deste
plano (v8.5 a v8.8, abaixo). Próximo, pelo plano pivô: a **rodada 6**, com as
anotações do Humberto usando o programa num personagem novo — agora começando
por Abrir pasta.

---

# Onde o projeto estava — 10/09/2026 (plano pivô, lotes 55 a 58: completo)

Decisão 19 do Humberto: pivô por imagem, e o rig é a fonte da verdade.
**A D5 da rodada 4 está feita.**

| Versão | Lote | O que entrou | Testes |
|:---:|:---|:---|:---:|
| v8.0 | 55 · pivô no formato | `pivotX/pivotY` na região do atlas (§10.3, Apêndice A 71). A pose não muda: provado no herói, três animações | 2.315 → 2.324 |
| v8.1 | conserto (outro chat) | Soltar imagem não apaga as peças; o programa começa na primeira animação | 2.324 → 2.336 |
| v8.2 | 56 · carimbar e trocar | **Carimbar pivôs** na aba Imagens. A troca de imagem **cai no lugar** pelo pivô, sem esticar. Soltar imagem num slot ou desenho da Árvore. **Duplicar no atlas**. Salvar grava o atlas carimbado. `heroi.atlas.json` carimbado | 2.336 → 2.364 |
| v8.3 | 57 · Animando livre | **Criar osso, Ponto e Caixa em Animando**. Imagem solta em Animando, com Gravar sozinho, **aparece só nesta animação**. Corrigido: apagar osso ou slot animado deixava linhas órfãs | 2.364 → 2.374 |
| v8.4 | 58 · pivô à mão | **Definir pivô…** (clique ou nove pontos), recolocando quem usa a imagem. **Copiar / Colar pivô**, em proporção | 2.374 → 2.382 |

**O plano pivô está completo.** Plano e Desvios:
`documentos/planos/PLANO pivô e Animando 2026-09-10.md`. Glacê anotado, não
feito: `PENDENCIAS`, itens 30 a 33.

**A rodada 5 também fechou**, logo depois:

| Versão | Lote | O que entrou | Testes |
|:---:|:---|:---|:---:|
| v8.5 | 49 · avisos com nome | O aviso diz `pele "default" › desenho "body"`, em português, com **Ir para** e o conserto (Trocar imagem…, Gravar o padrão). R11 feito | 2.382 → 2.390 |
| v8.6 | 50 · entre linhas | Na aba Ordem, o terço de cima e o de baixo da linha **inserem** entre duas linhas; o do meio faz o de sempre | 2.390 → 2.397 |
| v8.7 | 51 · PNG em `.zip` | A sequência de PNG sai num **`.zip` só**, sem o navegador pedir permissão | 2.397 → 2.402 |
| v8.8 | 52 · altura dos painéis | A alça entre os grupos: mínimo de 80 px, **dois cliques** voltam ao padrão, divisão **guardada no navegador** | 2.402 → 2.409 |

Próximo, pelo plano pivô ("Próximos passos"): a **rodada 6**, com as
anotações do Humberto usando o programa num personagem novo. Sem anotação,
a lista por valor do mesmo plano (PSD como pele, curvas de quicar…).
Desvios da rodada 5: `documentos/planos/PLANO rodada 5 - acabamento 2026-09-10.md`.

---

# Onde o projeto estava — 09/09/2026 (fim da rodada 3 da interface)

## A rodada 3: a cara do Spriter — v3.6 a v4.4

O Humberto pôs a tela do Spriter Pro ao lado da nossa e disse três coisas.
Nove lotes depois, as três estão fechadas.

| O que ele disse | O que ficou |
|:---|:---|
| *"Observe que não temos isso"*, apontando os quatro botões `Show Bones · Lock Bones · Show Sprites · Lock Sprites` | **Existem**, em texto, laranja quando ligados, com as teclas `7 8 9 0`, no fim da barra de ações (lote 17) |
| *"Nossos menus são muito bagunçados e não temos coisas básicas que o Spriter tem"* | Auditoria dos sete menus: **28 problemas achados e fechados**, e `auditMenus` hoje devolve lista vazia. As "coisas básicas" que faltavam chegaram: painel **Imagens**, aba **Ordem**, aba **Histórico**, réguas, ficha rápida (lotes 15 a 22) |
| *"O Spriter é limpo e claro. Usa as laterais, por isso a cena é muito mais espaçosa. A linha do tempo mostra só a linha principal"* | Duas colunas laterais, linha do tempo **fechada por padrão**, barra numa linha só. **A cena passou de 43% para 70% da altura** da janela, e tem 63% da largura |

**A meta da rodada era cena ≥ 70% da altura. Bateu.** Medido no Chrome
headless, 1440×900, `heroi.bone`, console limpo:

| Faixa | px | Fração |
|:---|---:|---:|
| Menu | 44 | 5% |
| Barra de ações | 48 | 5% |
| **Cena, nos dois modos** | **623 × 904** | **69% da altura · 63% da largura** |
| Faixa de baixo, fechada | 121 | 13% |
| Rodapé | 54 | 6% |

| Versão | Lote | O que entrou | Testes |
|:---:|:---|:---|:---:|
| v3.6 | 14 · linha limpa | A faixa de baixo nasce **fechada**: tocador, régua, Resumo. Botão **Detalhes** abre o resto | 1.732 → 1.749 |
| v3.7 | 15 · tocador | Barra de velocidade com número, tempo **e duração** para digitar, **Chavear · Chavear tudo** em texto. A faixa passou a atravessar a janela | 1.749 → 1.764 |
| v3.8 | 16 · duas colunas | Cena no meio, uma coluna de cada lado. Aba **Ordem**, com miniatura de 40px. Largura arrastável | 1.764 → 1.786 |
| v3.9 | 17 · barra de ações | Uma barra só, na largura da janela: arquivo · editar · ferramentas · eixos · **ver e travar**. **44px**, e a cena chegou a 70% | 1.786 → 1.803 |
| v4.0 | 18 · tema escuro | Escuro por padrão, claro em **Exibir → Tema**. 24 cores nos dois temas, todas passando em 4,5 de contraste | 1.803 → 1.818 |
| v4.1 | 19 · painéis limpos | Cabeçalho da Árvore numa linha (**＋ Novo ▾**), Animações em ícones, painel **Histórico**, sete menus auditados | 1.818 → 1.834 |
| v4.2 | 20 · Imagens | Painel **Imagens**: o atlas em grade, quantos slots usam cada desenho, busca sem acento, **arrastar para a cena cria o slot** | 1.834 → 1.852 |
| v4.3 | 21 · réguas | Réguas com números, na mesma escala da grade, com a linha do ponteiro | 1.852 → 1.863 |
| v4.4 | 22 · ficha rápida | X · Y · escala · **ângulo com disco** · **alfa com barra**, no alto de Propriedades | 1.863 → 1.881 |
| v4.6 | 23 · modo e ícones | **Interruptor `Montagem \| Animando`** na barra, laranja em Animando, `Ctrl+Tab`, e a linha do tempo acompanhando o modo. Os sete botões em bloco viraram ícones: **889px → 378px** | 1.881 → 1.888 |
| v4.7 | 24 · anotações 3, 4, 6 e 7 | **A faixa de baixo não abre mais sozinha** — nem na partida, nem ao trocar de modo, nem ao escolher animação. Tocando, **trocar de animação segue tocando** a nova. Agulha **grossa e vermelha** com o tempo e o quadro escritos nela (`0,02 s · q 1`); campo de tempo **laranja** em cima de chave. A dica do **⋯ Mais** lista o que tem dentro | 1.888 → 1.901 |
| v4.8 | 25 · anotações 5, 8, 9, 11 e 14 | Aba **Ordem de ponta-cabeça** (o de cima fica na FRENTE), **só desenho** entra nela, e **pastas** que se movem inteiras num passo de desfazer. A **Prévia** voltou para a coluna da direita. O tocador **repete sempre**; o `loop` do arquivo continua sendo o do jogo | 1.901 → 1.923 |
| v4.9 | 26 · anotações 10 e 16 | **Inclinar ganhou ícone** (paralelogramo, nunca a letra Z) e foi para **depois de Escalar**; Escalar virou o **L com seta nas duas pontas** que ele desenhou; a ordem da barra passou a ser escrita, e não a ordem dos `import`. Sem osso, o rodapé diz o que fazer. **Corrigido: o clique na lista de animações enquanto toca** — a lista se refazia a cada quadro e o botão morria debaixo do dedo | 1.923 → 1.945 |
| v5.0 | 27 · anotação 12 | **Aba Peles**, na coluna da direita: olho (Mostrar), lápis (Editar aqui, em laranja), nome com duplo clique para renomear, e quantos slots cada pele veste. Nova · Duplicar · Apagar em ícone. A seção saiu da Árvore e as caixas saíram do Exibição — a pele tem **um lugar só**. Os desenhos ficaram na Árvore, na seção Desenhos | 1.945 → 1.961 |
| v5.1 | 28 · anotação 13 | **Aba Regras**, com ícone por tipo, olho que desliga guardando a força, a cadeia e o alvo escritos, e a força em barra. **Nova regra virou uma janela que pergunta** — "que ossos dobram?", "que osso eles perseguem?" — e **não fecha errada**. Propriedades ganhou **Ossos da cadeia**. Posar passou a dizer que **não cria regra** | 1.961 → 1.987 |
| v5.4 | 30b · o fluxo e o "tudo" | **Capítulo 0, o fluxo de trabalho padrão**: dez passos, um print em cada, da arte solta ao arquivo do jogo, e a tabela "quando voltar um passo". **Os sete menus item por item**, um print por menu. **Gestos em duas fotos**, antes e depois, com arrasto de verdade no canvas. 41 imagens. Teste novo: **função do programa está citada no manual** — menus, teclas, ferramentas, painéis e ações, com `EXEMPT_MANUAL` de no máximo dez linhas, motivo por linha | 2.018 → 2.027 |
| v5.3 | 30 · o manual | **O manual reescrito do zero**, oito capítulos na ordem em que se usa o programa, com **Peles** e **Vindo do Spriter** novos, e 25 imagens novas tiradas na mesma sessão (1440×900, escuro). Nasceu `fotos-manual.mjs`. Dois defeitos achados ao fotografar: as cinco ferramentas de estrutura **não sumiam em Animando** (`hidden` perdia para `display: inline-flex`) e **"Exibir → Réguas" estava cinza desde o lote 21** | 2.003 → 2.018 |
| v5.5 | 30c · o manual em PDF | **`npm run manual-pdf`**: o manual inteiro num PDF, com as imagens embutidas e os links internos vivos. Sem renderizador próprio — ele pede a página ao mesmo código do **Ajuda → Manual** e manda imprimir | 2.027 → 2.027 |
| v5.6 | 31 · anotação 17 | **O pai pega os filhos, como o `B` do Spriter.** Com **um** osso escolhido, segurar `P` entra no gesto: cada clique pendura um osso ou desenho nele, clicar de novo solta, soltar a tecla termina. Com dois ou mais, `P` continua sendo o gesto de antes. Uma tecla, dois gestos, e quem decide é a seleção quando a tecla desce (`parentGesture`). Cursor próprio, rodapé com o nome do pai, e **um passo de desfazer por clique**, com o nome do filho | 2.027 → 2.043 |
| v5.7 | 32 · anotação 18 | **Miniatura para todo tipo de desenho.** A sequência mostra o quadro de repouso com um cantinho dizendo quantos quadros; o **esqueleto filho** é desenhado pelo runtime na pose de repouso; ponto, caixa, caminho e máscara mostram o **ícone do tipo**, com o nome na dica. Dois ícones novos. Vale na aba Ordem e na Árvore. A conferência sem cabeça passou a exigir **nenhuma linha sem imagem nem ícone** | 2.043 → 2.053 |
| v5.8 | 33 · anotações 20, 21, 22 | **O básico que faltava, três consertos.** A **tecla obedece ao modo**: `N` em Animando não cria mais osso, e o rodapé diz de que modo ela é. O **texto quebrado** da janela Exportar imagem foi consertado, com um teste que varre todo `.ts` e recusa o rastro de UTF-8 lido como Latin-1. E **nenhum item de menu fica cinza para sempre**: dos dez que prometiam lotes já passados, **nove viraram função** — Abrir recente, Sair, Selecionar tudo, Buscar na Árvore, Imagem no slot, Tocar para trás, Chave anterior/seguinte do escolhido, Selecionar todas as chaves — e o décimo saiu do menu, com o motivo escrito em `MOVED_OUT` | 2.053 → 2.071 |
| v5.9 | 34 · anotação 19 | **Trocar de pai não move mais nada.** A pose de **mundo** é guardada (`L' = P'⁻¹ · W`, a conta do Compensar): o osso e o desenho ficam onde estavam, e o que muda são os números medidos a partir do novo pai. Os **quatro** caminhos — a tecla `P`, o menu, o arrasto na Árvore e o campo Osso das Propriedades — viraram **um comando só**, `Reparent`. Com animação aberta, volta para a Montagem antes e diz que voltou | 2.071 → 2.082 |
| v6.0 | 35 · anotação 25 | **A aba Ordem ganhou botões.** Seis, em ícone com o nome na dica: frente · trás · **frente de tudo** · **fundo de tudo** · nova pasta · tirar da pasta. Cinzas sem escolha, e peça de pasta leva o pedaço vizinho da pasta junto. As seis também no menu Esqueleto, com a mesma tecla. Antes disso a aba tinha **zero botões**: só arrasto e uma tecla escrita na dica da linha | 2.082 → 2.090 |
| v6.1 | 36 · anotações 23, 24 | **Chegar no programa.** Soltar arquivo na janela abre ou importa, com uma faixa dizendo o que vai acontecer; vários esqueletos de uma vez, o programa pergunta qual. O **documento vazio** mostra três botões: Importar PSD · Abrir o herói · Começar vazio. Nasceu **`formato/exemplos/heroi.psd`**, gerado do herói por `montar-psd.mjs` — o inverso do importador —, e o `conferir-arte.mjs`, que mede a volta: **0 px** de diferença nas 19 peças | 2.090 → 2.103 |
| v6.2 | 37 · anotação 26 | **Duplicar** (`Ctrl+D`). Um osso vem com o **membro inteiro** — filhos e desenhos —, com nomes `_2`, `_3`, nascendo 20 px à direita e já escolhido. As regras ficam de fora, e a tela diz quais. Botão na Árvore, ao lado de Apagar, e Editar → Duplicar. **Fecha a lista "O básico que falta"** | 2.103 → 2.116 |
| v6.3 | 38 · anotação 27 | **Escondido é escondido, de uma vez.** `[hidden] { display: none !important }` no topo do `shell.css`, os nove consertos locais apagados, e um teste que varre todo `.css` recusando `display` de autor num `[hidden]` — mais outro que exige a regra no `programa/` montado. A família tinha voltado **cinco vezes** (lotes 14, 16, 19, 30, 37) | 2.116 → 2.120 |
| v6.4 | 39 · rodada 4 | **Peles na tela.** "Só com a pele" também no osso; com ela marcada, **Peles que ativam** — uma caixa por pele — escreve `skin.bones` e `skin.constraints`, que antes só se escreviam à mão. Marcar com pele no lápis já põe nela; desmarcar tira de todas. **Trocar a imagem em todas as peles…**, no botão direito da Árvore e no menu Esqueleto, pelo painel Imagens | 2.120 → 2.139 |
| v6.5 | 40 · rodada 4 | **Ponto e caixa dentro de um slot que já existe.** Esqueleto → Novo → **Ponto neste slot** e **Caixa neste slot**: o anexo nasce no slot, na pele do lápis, com a bolinha ○, e troca por chave e por pele como o formato sempre deixou. Slot escolhido **sem osso** → dentro dele; com o osso junto, o de sempre. Provado no dump do runtime: aparece no tempo da chave, não antes | 2.139 → 2.156 |
| v6.6 | 41 · rodada 4 | **Exportar sem meia exportação.** Janela Exportar imagem com **De**, **Até** e **Todas as animações** (um arquivo por animação), recusando por escrito o trecho errado. Exportar por pele com **Pacote .bonez com o atlas**: um arquivo, atlas só com as regiões usadas. `npm run fatiar` **lê e grava `.bonez`** | 2.156 → 2.167 |
| v6.7 | 42 · rodada 4 | **O conforto do Spriter.** `Ctrl` + arrastar em cima do escolhido **clona** e arrasta o clone, num passo de desfazer. **Guias** puxadas da régua, com ímã de 6 px no Mover, e Exibir → Guias · Travar guias · Limpar guias — só em `RECORTE_editor_state`. **Editar → Escolher → Os filhos (`]`) e Os pais (`[`)**. **Fecha a rodada 4** | 2.167 → 2.183 |
| v5.2 | 29 · anotação 15 | **As funções escondidas ganharam porta.** Trecho de laço e marcas em botão na régua e em menu; `Ctrl` e `Alt` do Criar osso no rodapé; "Virar filho de…" abre lista; âncora virou **posição no osso**, no botão direito da Árvore; **Curva da chave** saiu do cinza; a aba **Malha e pesos** não some mais; "Novo → Regra" abre a janela guiada. Nasceu `hiddenFunctions`, e ela exige **lista vazia** | 1.987 → 2.003 |

**Onze defeitos foram achados no caminho, e todos eram de antes do lote que
os achou:**

| # | O defeito | Achado no |
|:---:|:---|:---|
| 1 | O menu **⋯ Mais** nunca esteve escondido: `hidden` perdia para `display: flex`, e a caixa ficava desenhada em cima da cena, recebendo clique | lote 14 |
| 2 | O mesmo, geral: **`hidden` não escondia painel nenhum** que declarasse o próprio `display` — são os três "vazamentos entre abas" da tela do Humberto | lote 16 |
| 3 | A tabela **"Mostrar na tela"** do painel Exibição **nunca teve CSS**: os campos saíam em fila e o cabeçalho lia-se "VerTravarNomeOssos" | lote 16 |
| 4 | Os quatro botões de ver e travar acendiam **transparentes** no tema escuro (uma variável CSS definida por si mesma) | lote 18 |
| 5 | Um anexo **`null`** — como o formato diz "esta pele esconde este slot" — derrubava a montagem inteira dos painéis, **sem erro visível na tela** | lote 20 |
| 6 | **Quatro itens de menu cinzas** que nunca tinham sido ligados passaram a funcionar: Mudar duração…, Subir e Descer na ordem de desenho | lotes 15 e 16 |
| 7 | **Três painéis liam o tema errado**: Ordem, Histórico e Imagens montavam o host sem a classe `painel`, e toda cor caía no valor de reserva, que é a do tema claro. Miniatura branca e texto cinza-escuro em cima do escuro, desde que o escuro virou o padrão | lote 25 |
| 8 | **O clique na lista de animações não chegava enquanto tocava.** O painel escuta `time` e refazia a lista a cada aviso; tocando, o botão em que o dedo descia já não existia quando ele subia, e o navegador não dispara `click` entre dois elementos. Parecia o tocador travado, e era a lista fugindo da mão | lote 26 |
| 9 | **Pela tela não dava para montar uma IK de dois ossos** — a do próprio exemplo do herói. Criar gravava um osso só, o alvo era escolhido sem perguntar, e Propriedades não tinha o campo da cadeia para consertar depois. Regra com nome de osso errado sumia da cena sem uma palavra | lote 28 |
| 10 | **Dez funções existiam só em gesto**, sem ação nenhuma registrada: `Alt` + clique na régua, `M` na faixa, botão direito no losango, `Ctrl` + arrastar no Criar osso. Não faltavam num menu — não havia o que pôr num menu, porque não havia função | lote 29 |
| 11 | **Os quatro itens de Interpolação estavam cinzas desde o lote 12**, esperando um lote que já tinha passado. O botão direito no losango fazia isso desde então, e ninguém ligou o menu | lote 29 |

**Em Animando a cena era 39%**, porque a faixa de baixo abria junto com o modo.
O lote 24 tirou isso: agora ela é **69% nos dois modos**, e a faixa só abre por
gesto do Humberto — o botão Detalhes, a alça, ou o menu Janela. É a **regra 12**
do plano, nas palavras dele: *"se ela está fechada, não devia abrir do nada"*.

Os **desvios de cada lote** — dez tabelas — estão no fim do
`documentos/planos/PLANO rodada 3 - a cara do Spriter 2026-09-09.md`.

**Nada do formato foi tocado nesta rodada.** Conformidade: 46 de 46, nos dois
runtimes, em todos os nove lotes.

---

# Onde o projeto estava — 08/09/2026 (fim da fase 8)

## O placar

**48 de 55 requisitos [M] feitos. 3 parciais. 4 em aberto.**

**2.120 testes passando. 46 casos de conformidade, 46 aprovados —**
**nos DOIS runtimes, e os dois concordam campo a campo.**
**3.459 linhas de especificação do formato.**

O número em cima vale mais que as tabelas embaixo. A tabela antiga listava duas
coisas faltando; faltavam dezessete. Um prazo decidido em cima de "faltam duas
coisas" é um prazo errado.

**Nenhum dos quatro que sobram pode ser feito nesta máquina.** Dois esperam uma
decisão sua e dois esperam software que não está instalado aqui. A separação
está na seção "Requisitos [M] em aberto", e é ela que você precisa para
decidir o que vem depois.

### O que os lotes F do formato fizeram (10/09/2026, v6.8, v7.0, v7.2, v7.5)

Decisões do Humberto de 10/09/2026, plano da rodada 4, seção 7. Feitos pelo
chat do formato, em paralelo com o executor (lotes 39 a 45 no editor). **A
partir de agora, por ordem do Humberto, quem executa é o chat executor.**

| Lote | Versão | O que entrou | Prova |
|:---|:---:|:---|:---|
| F4 | v6.8 | §4.6: a **primeira animação da lista é a padrão**. Zero campo. | Apêndice A 67 |
| F1 | v7.0 | **`skin.drawOrder`** e a **ordem base** (§4.4, §5.1, §9.5): a pele desloca a ordem de desenho enquanto está ativa; a timeline mede a partir da base. Schema, dois runtimes. | C-280, 47/47, 4 testes |
| F2 | v7.2 | **Trocar de pai no meio da animação** (§9.4 `parent`, §5.6 ordem refeita, L2 `PARENT_CYCLE`), semântica do Spriter. Schema, dois runtimes, `AnimationState`, driver, importador do Spriter (`--assar` mantém o antigo). Apêndice B 7 reaberta e fechada. | C-281, C-282, C-286, **50/50**, 3 testes |
| F3 | v7.5 | **As três heranças que eram reservadas ganharam fórmula** (§5.3, §5.4, §5.5, IK de 1 osso): `noRotation`, `noReflection`, `onlyReflection`, na linha das cinco do Spine (opção (a) do planejador; a decomposição `R·F·S` foi medida e reprovada). A virada do esqueleto inteiro não conta (`flip`). Dois runtimes; o loader parou de avisar. Apêndice A 70; Apêndice B 1 fechada. Feito pelo executor. | C-283, C-284, C-285, **53/53**, 9 testes |

**Suíte: 53 casos** (A 13, B 7, C 26, X 5, BIN 1, ZIP 1), os dois runtimes
concordando campo a campo. **2.273 testes.** Os 10 casos do socket
continuam em `casos-pendentes/`, por ordem dele.

### O que o lote socket fez (09/09/2026, v3.1 a v3.5)

Vem do recorte de decisões do Humberto de 09/09/2026: simplicidade do Spriter,
estrutura do Spine, e três coisas que nenhum dos dois tem. **Só formato**:
spec, schema, exemplos e casos. Runtime e editor são o lote seguinte.

| O que entrou | Onde | Um exemplo |
|:---|:---|:---|
| **Encaixe por nome (socket)** | §7.9 `point.socket`; §7.11 `skeleton.socket`, `childSocket` | o personagem publica `mao_direita`, a arma publica `empunhadura`, e qualquer arma serve em qualquer personagem |
| **Dois canais do filho** | §7.11 `inheritAnimation`, `baseAnimation`; pose em duas camadas | o pai toca `recarregar` e a arma toca o dela; a motosserra gira sempre |
| **Contrato de rig** | §4.8 `rig { name, bones, slots, sockets }` | cem mechas, um conjunto de animações, e o arquivo diz quais ossos exige |
| **Animação e skin de fora** | §2.8 `assets.animations[]`, `assets.skins[]` | uma pele carregada no jogo, sem estar no projeto, encaixando pelo nome dos slots |

| Versão | Entrega | Prova |
|:---:|:---|:---|
| v3.1 | spec: as quatro seções, códigos L2 novos, Apêndice A 62–66, Apêndice B 10–12 | só texto |
| v3.2 | schema: `rig`, 2 arrays em `assets`, 1 campo em `point`, 4 em `skeleton`; validador da web recompilado | 1.732 testes |
| v3.3 | exemplos: `heroi` publica o socket, `espada` publica o dela e ganha `attack`, trio `mecha*` | **8 exemplos válidos** |
| v3.4 | **10 casos de conformidade completos** (C-270 a C-279) em `conformidade/casos-pendentes/`, com o esperado conferido à mão; §12.4 ganha a regra do prefixo `<slot>/` no dump | 46/46 intocado |
| v3.5 | exemplo do capacete: a cabeça do mecha vira um esqueleto animado que vem de fora, pela pele de inverno; §7.11 diz com todas as letras que vale para qualquer slot | 9 exemplos válidos |

**O que o lote seguinte tem que fazer, e em que ordem:** (1) o runtime de
referência e o de Python passam a gravar o filho nos canais do dump com o
prefixo `<slot>/`, e o C-270 sai de `casos-pendentes/`; (2) socket no loader e
no `Skeleton`, C-271 e C-272; (3) os dois canais, C-273, C-274, C-278; (4)
loader de `assets.animations` e `assets.skins`, C-275 a C-279; (5) só então o
`heroi.bone` passa a pendurar a espada por socket, e o editor ganha **Novo →
Esqueleto** no slot e o campo Socket no painel do ponto.

### O que a fase 8 fez

A fase 8 fechou os dois últimos [M] que dava para fazer aqui — **E3**
(exportar por pele, por animação e por pasta) e **C1** (manual em inglês) — e
fez uma coisa que não estava no plano e vale mais que as duas.

**O confronto dos dois runtimes foi apontado para fora da suíte, no
`heroi.bone` inteiro. Eles divergiam em 135 campos.** A suíte não via nada
disso: 41 de 41 nos dois, e 41 de 41 concordando. Um arquivo de verdade tem
combinações que nenhum caso pequeno tem.

Foram **cinco defeitos**, e nenhum era pequeno:

| # | Onde | O que estava errado |
|:---:|:---|:---|
| 1 | Runtime TypeScript | O construtor do `Skeleton` aquecia as matrizes de mundo e **gastava o quadro de reset da física**. O primeiro quadro já saía com um offset de inércia. |
| 2 | Executor da suíte | A janela da chave `reset` usava o tempo da **amostra** anterior, e não o do **passo** anterior. Com `physicsDt`, o `reset` redisparava a cada passo e a física **congelava na pose de repouso**. |
| 3 | Runtime Python | Chave de `deform` com `value: []` virava valor "não numérico", a curva virava `stepped`, e **a malha nunca saía do lugar**. |
| 4 | Runtime Python | Os UV de uma `sequence` respondiam ao quadro da setup pose. Com o `path` sendo um prefixo (`"hand_"`), **não achava região nenhuma** e devolvia UV literais: geometria certa, textura errada. |
| 5 | Runtime Python | O canal `vertices` do dump deixava `clipping` e `path` de fora, e o canal `points` saía como lista em vez de objeto — **incomparável** com o outro runtime. |

Os cinco foram corrigidos e **presos por cinco casos de conformidade novos**
(A-031, B-105, B-106, C-261, C-262). Cada um foi conferido quebrando a
correção de novo: sem ela, o caso reprova. Seis entradas novas no Apêndice A
da spec (56 a 61), todas em texto normativo.

Hoje os dois runtimes concordam **campo a campo no `heroi.bone` inteiro**, nas
três animações, nas três peles, com e sem laço: 18 combinações, zero
divergências.

O Recorte anima desenhos 2D por ossos. O formato `.bone` é aberto. A meta é ele
virar padrão, como o PDF e o glTF.

---

## O que já funciona

| Parte | Estado hoje |
|:---|:---|
| **Pasta do projeto** | Plano pasta do projeto, lotes 59 a 62 (v8.9 a v9.2). **Arquivo → Abrir pasta…**: as imagens na aba Imagens, por subpasta, com Recarregar. Arrastar para a cena, trocar pela lista da mesma subpasta (campo Imagem, Ficha rápida, clique parado no desenho), pivô repetido para a pasta. O **Salvar empacota** só as imagens em uso, com pivô, ao lado do `.bone`; reabrir a pasta continua de onde parou. Nenhum campo novo no formato. |
| Formato e especificação | Rascunho escrito, 3.459 linhas, com JSON Schema. Três embalagens: `.bone` (texto), `.boneb` (binário) e `.bonez` (pacote). |
| Licença | `LICENSE` (Apache 2.0, com a outorga de patente da cláusula 3), `formato/LICENSE` (CC BY 4.0) e `NOTICE`. Cabeçalho SPDX em todo `.ts` e `.mjs` de `runtime/` e `ferramentas/`. |
| Validador | `npm run validar` confere esqueleto, atlas e manifesto contra o esquema. Os 5 exemplos passam sem erro — os três tipos anunciados têm exemplo. |
| Runtime | Lê as três embalagens. Ossos, slots, peles, 8 tipos de anexo, ordem de desenho, cores. |
| As cinco regras (constraints) | IK, transformar, caminho, física e comando. Todas implementadas e cobertas por testes. |
| Animação | Chaves, curvas Bezier, laço, eventos, tags, variáveis, deform e sequências. |
| Renderizador | Desenha em Canvas no navegador. `render-png.mjs` grava um PNG do quadro, sem navegador. |
| Esqueleto aninhado | Um `.bone` dentro de outro (§7.11). A espada do herói é um esqueleto próprio, e é desenhada no editor, no runtime e no PNG. |
| Editor — montagem | Árvore de ossos e slots, propriedades, criar osso, slot, **regra, evento, pele e parâmetro**, mover, girar, escalar. **Retângulo de seleção** (`Shift` soma, `Ctrl` tira), **travar** ossos e desenhos (botões acima da cena, teclas `7 8 9 0`, cadeado por item na Árvore) e **virar filho com `P`**, para ossos e desenhos de uma vez — com **um** osso escolhido, segurar `P` faz o pai pegar os filhos, um por clique, como o `B` do Spriter; com dois ou mais, `P` espera o clique no pai. |
| Editor — animação | Linha do tempo com chaves (mover, copiar, colar, esticar, encolher, espelhar), editor de curvas, dois modos (Montagem e Animando), tocador com laço e velocidade. |
| Editor — malha e pesos | Criar malha, mover vértice, ligar e desligar aresta, apagar vértice, traçar silhueta, pintar peso por osso. |
| Editor — casca de cebola | Quadros vizinhos em transparência, para conferir o movimento. |
| Editor — posar | Ferramenta Posar, com IK, para pôr o personagem numa pose de uma vez. |
| Editor — não perder trabalho | Aviso ao fechar a aba com arquivo sujo, e rascunho automático com recuperação na abertura. |
| Camadas e mistura (runtime) | `AnimationState` com faixas numeradas, laço, velocidade, alpha, fila com atraso e ouvintes; `AnimationStateData` com a tabela de mistura por par, que consome o `animation.defaultMix` da §4.6 — campo do formato que ninguém lia; `applyAnimationMixed`, o `applyAnimation` da §9.10 com alpha, os quatro modos (`setup`, `first`, `replace`, `add`) e máscara de ossos. A máscara mora na faixa, nunca no arquivo: **nenhum campo novo entrou no formato**. |
| Prévia da mistura (editor) | Painel **Prévia**: até 4 camadas (animação, repetir, velocidade, quanto aparece, mistura em segundos, lista de ossos com caixas), tocando num segundo esqueleto numa telinha própria, com o relógio de cada camada escrito. "Copiar para a linha do tempo" grava a mistura como animação nova a 30 chaves por segundo, com a lista do que se perde na tela, ao lado do botão. |
| Eixos e compensação | Barra do viewport com **Eixos: Local · Pai · Mundo** e três caixas de **Compensar** (não mexer nos filhos, nos desenhos, nas caixas). A conta é `F = B'⁻¹·B`: um `F` por osso responde às três caixas de uma vez, e a matriz de mundo do filho volta idêntica até a 8ª casa. |
| Linha do tempo em bloco | Segunda barra: **Fator** + **Esticar seleção**, **Espelhar no tempo**, **Fechar ciclo** (copia a primeira chave para o fim e casa as tangentes, `P2 = P3 − T`) e **Espelhar esquerda e direita** com o campo **Pares de nome**, que mostra os pares achados antes de trocar nada. |
| Marcação do osso | **Cor do osso** e **Ícone** (12 opções, cada uma com a palavra ao lado) no painel Propriedades. Os dois já existiam no formato (§4.2): nada foi inventado em `extras`. A tela desenha o osso na cor dele. |
| Importadores | Spine, DragonBones e Spriter. O programa de origem é descoberto pelo conteúdo, não pela extensão. |
| Importar PSD e PSB | `ferramentas/src/importar/psd.ts`, 854 linhas de TypeScript puro, sem dependência: cabeçalho, tabela de camadas, nome Unicode (`luni`), grupos (`lsct`) virando pasta, e pixels nas compressões 0 (cru), 1 (RLE) e 2/3 (ZIP). Cada camada vira um slot **na posição em que estava na tela do Photoshop**. Pelo menu (**Arquivo → Importar PSD…**, um passo de desfazer) e pela linha de comando (`npm run importar-psd`). **Ossos desenhados no PSD** (lote 45, v7.3): a camada `ossos` vira esqueleto, por **Importar → PSD com ossos…** e `--ossos`; `ferramentas/src/importar/psd-bones.ts`. No herói, 16 de 18 pais voltam certos (cabelo e alvo do IK não). |
| Empacotador de atlas | Um monte de PNG vira uma página de atlas, com relatório de aproveitamento. |
| Binário e pacote | `.boneb` cerca de **38%** menor que o `.bone` compacto (medido no `heroi.bone`: 28.467 → 17.804 bytes). `.bonez` traz esqueleto, atlas, imagens e os esqueletos aninhados num arquivo só. |
| Exportar glTF | `npm run exportar` na linha de comando e **Arquivo → Exportar glTF…** no editor. Sai `.glb` ou `.gltf`, e o que não cabe em glTF vira uma lista de avisos em português. |
| Conformidade | 46 casos (A 13, B 7, C 19, X 5, BIN 1, ZIP 1). Adaptador de referência que roda. Registro público com o cabeçalho pronto. Qualquer runtime de terceiro roda a suíte com `--adaptador`. |
| **Segundo runtime, em Python** | `runtime-python/`, só biblioteca padrão, escrito a partir do **texto da spec**, sem abrir `runtime/src/`. Passa nos 46 casos, pelos dois caminhos: o `conformidade.py` dele e o executor oficial em Node com `--adaptador`. 128 testes próprios. |
| **Confronto dos dois runtimes** | `ferramentas/comparar-runtimes.mjs` roda os dois no mesmo caso e compara os **dois dumps inteiros**, campo por campo — não só contra o esperado. **46 de 46 concordam.** O relatório é `conformidade/dois-runtimes.md`. |
| **Fatiar o arquivo** | `npm run fatiar` corta por **pele**, por **animação** ou por **pasta de slot**, e só sai o que não move nada: osso só sai quando ninguém que sobrou lê ele. O atlas é reempacotado com as regiões que sobraram. Medido no herói: por pasta `capa`, tudo 50,6% menor; por animação, esqueleto 39% menor. |
| **Manual em inglês** | `documentos/manual/en/`, os oito capítulos mais o índice, com as mesmas imagens. Cada rótulo do editor sai em inglês com o rótulo português entre parênteses, porque a interface ainda é só em português. O guia de conformidade também: `conformidade/how-to-prove-conformance.md`. |
| Exportar imagem | `npm run exportar-imagem` e **Arquivo → Exportar imagem…** no editor. Sai PNG de um quadro, **sequência de PNG**, **folha de sprites** com JSON de índice e **GIF animado** (paleta por median cut, LZW próprio, laço NETSCAPE). Um rasterizador só, o mesmo do `render-png.mjs`. **Vídeo WebM** só pelo editor, gravado pelo `MediaRecorder` do navegador, no relógio (lote 43, v6.9). **MP4 não sai**: o comando do ffmpeg aparece na tela. |
| Validador na web | `site/validador/`, estático, sem servidor e sem rede. Aceita `.bone`, `.boneb`, `.bonez` e `.atlas.json`, decidindo pelos bytes. Veredito, problemas com linha e ponteiro JSON, ficha do conteúdo, oito contas, recursos usados e o esqueleto desenhado, com botão de tocar. 30 testes provam que ele e a linha de comando dizem a mesma coisa. |
| Manual | **Reescrito no lote 30.** O capítulo **0, o fluxo de trabalho padrão** — dez passos, um print em cada —, mais oito capítulos na ordem em que se usa o programa — abrir · montar · peles · animar · regras · malha · exportar · **vindo do Spriter** —, nas duas línguas. Cada um abre com "o que você vai conseguir fazer no fim" e fecha com "o que ainda não funciona". **43 imagens**, todas do editor rodando em 1440×900, tema escuro, tiradas num comando por `documentos/notas-de-desenvolvimento/fotos-manual.mjs` — inclusive os sete menus inteiros e seis fotos de gesto, antes e depois. Abre pelo menu **Ajuda → Manual** (`F1`), e sai em **PDF de 126 páginas** com `npm run manual-pdf` — gerado da mesma página que o menu monta, nunca de uma segunda cópia do texto. Dois testes fecham a conta nos dois sentidos: **todo rótulo citado existe no editor**, e **toda função do editor está citada no manual** — menus, teclas, ferramentas, painéis e ações. |

### Conferido no navegador, clicando, em 1440×900

Testes automáticos não abrem o editor. Isto foi feito com o mouse, em
`http://localhost:5173`, no fim da fase 6.

| O que foi feito | Resultado |
|:---|:---|
| Montar duas camadas na Prévia: `walk` na 0, `attack` na 1 só em `arm`, `forearm` e `hand_target` | Os dois relógios andam (`1,00 s de 1,00 s` e `0,40 s de 0,60 s`) e a telinha desenha. `editor/tela-camadas.png` é essa tela. |
| Importar um PSD de 4 camadas com grupo, acento e opacidade | 4 slots, nas posições exatas da conta (`corpo` em (0, −5), `cabeça` em (0, 76), `braço_e` em (−50, −5), `braço_d` em (50, −5)), grupo virando pasta `bracos`, e **Reempacotar atlas** acende. `Ctrl+Z` devolve os 23 slots e o atlas do herói. |
| Ligar **Não mexer nos filhos** e arrastar o `torso` 163 px | `head`, `arm`, `forearm`, `leg`, `shin`, `foot`, `hand_target` e os de trás ficam parados até a 4ª casa. Só `cape1`, `cape2` (regra de caminho) e `hair` (física) andam — a regra roda depois e reescreve. |
| Esticar seleção por 2, espelhar no tempo, espelhar esquerda e direita | Tempos `0 / 0,1 / 0,2 / 0,35 / 0,6` viram `0 / 0,2 / 0,4 / 0,7 / 1,2`; os valores viram do avesso; a regra `/_b` acha `arm ↔ arm_b` e `leg ↔ leg_b` e a janela troca 4 linhas. |
| Fechar ciclo no `walk` | *23 linhas fechadas, 17 com as tangentes casadas*. Conferido na conta: a velocidade que chega no fim da linha `leg.rotation` é 84°/s, a mesma que sai do começo. |
| Trocar a cor de um osso | `hips` pintado de magenta: 0 → 254 pixels dessa cor na tela. |
| Console | Nenhum erro. |

### Conferido de novo no fim da fase 7

| O que foi feito | Resultado |
|:---|:---|
| GIF do `walk` a 20 quadros por segundo | `GIF89a`, 156×242, **20 blocos de controle gráfico** (20 quadros), atraso de 5 centésimos por quadro (= 20 fps), bloco `NETSCAPE2.0` com laço infinito, terminador `0x3B`. 146 kB. |
| Um quadro da sequência de PNG, olhado | O herói inteiro, de perfil, no meio da passada: cabelo, mochila, cinto e espada no lugar. |
| Folha de sprites, 5 colunas, 10 quadros | Grade 5×2, quadros de 154×242, e o `folha.json` com `x`, `y`, largura, altura e **tempo** de cada quadro. Olhada: o ciclo de caminhada anda de quadro em quadro. |
| Validador na web, arquivo bom arrastado (evento `drop` de verdade) | **Arquivo válido — nenhum erro, nenhum aviso.** Ficha completa (18 ossos, 23 slots, 3 peles, 28 desenhos, 5 regras, 3 animações, 70 trilhas, 197 chaves), lista de recursos, e o **herói desenhado com as imagens**, com as três animações e botão de tocar. `site/tela-validador.png`. |
| Validador na web, arquivo quebrado arrastado | **Arquivo inválido — 6 erros, 1 aviso**, cada um com linha, ponteiro JSON e seção da spec. O quadro do desenho fica vazio e **explica por quê**. Os mesmos 6 erros que a linha de comando dá. `site/tela-validador-erros.png`. |
| Editor: tocar o `walk` | O relógio andou de `0` a `0,034 s` sozinho; 316.800 pixels desenhados na tela. |
| Editor: menu Arquivo | **Exportar imagem…** está lá, entre "Exportar glTF…" e "Importar de outro programa…". |
| Editor: console | **Limpo.** O 404 do `favicon.ico` acabou nesta fase: o ícone existe e as três páginas apontam para ele. `editor/tela-final.png`. |

### Conferido de novo no fim da fase 8

| O que foi feito | Resultado |
|:---|:---|
| Editor aberto em 1440×900, herói carregado | 18 ossos na árvore, `heroi.bone` no título, **Arquivo salvo.**, **Nenhum aviso**. |
| Tocar o `walk` | O relógio andou sozinho e **deu a volta**: `0,35 → 0,73 → 0,10 → 0,47 → 0,85 → 0,23 s`, seis leituras em dois segundos, numa animação de 1,00 s. Seis quadros **diferentes** desenhados na tela (medido por soma dos pixels, não por olho). 316.800 pixels desenhados. |
| Editor: console | **Vazio.** Nenhum erro, nenhum aviso, nenhuma exceção — só as duas linhas de conexão do Vite. `editor/tela-final.png` é essa tela, com o `walk` no quadro 10. |
| Página inicial e validador da web | `http://localhost:5174/site/index.html` e `/site/validador/` respondem **200**. |
| Visualizador por servidor | `python -m http.server` na raiz: `/ferramentas/visualizador/` responde **200**, e o `.bone` de exemplo também. |

### Conferido de novo no lote 0 da interface (08/09/2026)

O lote 0 vem da pesquisa de menus (`documentos/pesquisa/menu/`, arquivos 00
a 07): retângulo de seleção, travar ossos e desenhos, virar filho com `P`.
Conferido no editor servido pelo Vite, com eventos de ponteiro e de teclado
disparados no canvas, e o resultado lido do documento.

| O que foi feito | Resultado |
|:---|:---|
| Arrastar um retângulo sobre o herói inteiro | **17 ossos e 19 desenhos** escolhidos de uma vez. |
| Ligar **Travar: Ossos** e arrastar o mesmo retângulo | `aria-pressed="true"`; **0 ossos, 19 desenhos**. Desligado, volta. |
| Cadeado do `hips` na Árvore, e o retângulo de novo | `lockedBones: ["hips"]` gravado em `RECORTE_editor_state.view`; o `hips` fica fora e o `torso` entra. |
| Tecla `0` com a cena em foco, uma vez e outra | `lockDrawings` vai a `true` e volta a `false`. Antes da correção, apertada uma vez, ficava em `false`: a cena e a janela tratavam a mesma tecla. |
| Escolher `cape2` e o slot `weapon`, `P`, clique na cabeça | `cape2.parent = head`, `weapon.bone = head`, **um** passo de desfazer chamado "Virar filho de head", os ossos reordenados com pai antes de filho. `Ctrl+Z` devolve `cape1` e `forearm`. |
| `P` e depois `Esc` | Barra diz "Virar filho cancelado"; o clique seguinte só escolhe. |
| Escolher `root`, `P`, clique na cabeça | Barra diz "root não pode virar filho de head". Nada muda. |
| Testes | **573 passando** no editor: 550 de antes, 23 novos em `lote0-selecao-e-trava.test.ts`. |
| Console | Nenhum erro. |

### Conferido de novo na rodada 1 da interface (08/09/2026)

Cinco lotes, de **v1.6** a **v2.0**, na ordem do
`documentos/planos/PLANO rodada 1 - lotes 1 a 3 2026-09-08.md`. Cada um fechou
com a mesma bateria: `vitest`, `tsc`, `conformidade.mjs`, o Chrome headless do
`conferir-editor.mjs`, e `versao.py`. **A contagem de testes nunca caiu.**

Ponto de partida: v1.5, 1.370 testes, 46/46. Fim: **v2.0, 1.482 testes, 46/46**.

| Versão | Lote | O que o Humberto vê | Testes |
|:---:|:---|:---|:---:|
| v1.6 | **menus** | A barra passa de 3 para 7 menus. Submenus, marca de ligado, item cinza com a dica do lote. 44 atalhos gerados dos próprios menus. Ajuda → Atalhos (`Shift+F1`) e Sobre. Botão direito na cena volta à ferramenta anterior. | 1.370 → 1.401 |
| v1.7 | 1 · zoom | O zoom sai da barra de cima e vai para o canto da cena: `−` · campo `100%` · `+` · `Ajustar`. `Ctrl+0` tamanho real, `F` enquadra a seleção. | 1.401 → 1.421 |
| v1.8 | 2 · tocador | O tocador vira a primeira linha da linha do tempo: 13 controles, só o símbolo. `Espaço` toca fora da cena. **Repetir passa a ser gravado no arquivo.** | 1.421 → 1.446 |
| v1.9 | 3a · desenho e semáforo | O campo "Anexo" vira lista, e cada anexo da Árvore ganha bolinha `●`/`○`. Chavear fica verde, vermelho ou cinza, com a dica mudando junto. | 1.446 → 1.464 |
| v2.0 | 3b · Resumo | A folha ganha a linha Resumo: um losango por tempo com chave, branco quando junta tipos. Clicar escolhe tudo daquele tempo; arrastar move tudo num passo só. | 1.464 → 1.482 |

**O que foi provado na tela**, no Chrome headless a 61 quadros por segundo e no
navegador da automação para o que não depende de quadro:

| O que foi feito | Resultado |
|:---|:---|
| Abrir os 7 menus, item por item | Nomes, teclas e marcas conferem com `PROJETO DO MENU`. Item cinza traz a dica do lote ("Vem no lote 4"). Submenu abre pelo lado. |
| Ajuda → Atalhos | Tabela de **44 linhas**, gerada dos menus. `Shift+F1` abre. |
| Botão direito na cena, duas vezes | Girar → Mover → direito → **Girar** → direito → **Mover**. Barra de baixo diz para onde foi. |
| Campo do zoom: `200`, `abc`, `12,5` | `200%`; `abc` recusado por escrito e o campo volta ao que era; `12,5` vira 13% na tela e 0,125 na câmera. `Ctrl+0`, `Ctrl+=`, `Ctrl+−` conferem. |
| `F` com o `hips` escolhido | A câmera enquadra o osso (6400%, que é o limite: o `hips` tem 10 unidades). `Ctrl+0` volta. |
| `Espaço` com o foco na Árvore, e na cena | Na Árvore **toca e pausa**; na cena **arrasta a vista** e não toca. Uma tecla, dois donos, e nunca os dois. |
| `L` na janela | "Repetir desligado em walk" na barra de baixo, botão apaga, e o campo `loop` muda no arquivo. |
| Tocar o `walk` | Botão vira `❚❚` com `aria-pressed="true"`; seis quadros **diferentes**; o relógio **dá a volta** (`0,70 → 0,07`), que é o `loop` do arquivo sendo obedecido. |
| Bolinha de um anexo na Árvore | Clicar em `○ hand_fist` põe "hand agora mostra hand_fist" na barra e acende a bolinha; a de `hand_open` apaga. |
| Semáforo do Chavear | Montagem: **cinza**. `walk` sem seleção: **cinza**. `hips` no tempo 0: **vermelho**. Em 0,333 s: **verde**. Depois de chavear: **vermelho**. A dica muda junto com a cor nos três casos. |
| Linha Resumo do `walk` | **8 losangos**, 5 deles brancos. Clicar no de 0,25 s escolhe as **13** chaves daquele tempo — a de evento inclusive. |
| Arrastar o losango de 0,20 s para 0,30 s | Todas as chaves daquele tempo vão juntas, **um** passo chamado "Mover chaves", e `Ctrl+Z` devolve os oito tempos exatos. |
| Console do editor | **Limpo** nos cinco lotes. Só as duas linhas do Vite e o aviso de `willReadFrequently` do Canvas2D, que é da própria medição. |

**A barra de cima não perdeu uma linha**, e o plano previa que perdesse. Medido
em 1440×900: **três linhas com e sem** os três botões de zoom, porque eles
dividiam a última linha com "Travar". Encurtou a linha, não apagou. Ganhar a
linha é o item 15, lotes 4 e 5. Está escrito assim no CHANGELOG e nos Desvios,
para ninguém contar essa vitória duas vezes.

Os **desvios de cada lote** — 26 ao todo, nenhum bloqueante — estão no fim do
próprio plano, seção "Desvios", com o que o plano dizia, o que o código pedia e
o que ficou.

**Uma nota de método, para a próxima vez.** O painel de navegador da automação
**não compõe quadros**: medido, `requestAnimationFrame` roda **zero** vezes por
segundo lá, mesmo com a aba visível. Nele o tocador do editor parece travado, o
relógio congela e a foto da tela falha por tempo. Não é bug do editor. A
conferência acima foi feita num **Chrome headless dirigido por CDP**, que roda
a **61 quadros por segundo**. O script está em
`documentos/notas-de-desenvolvimento/`; quem for repetir, use esse caminho.

---

### Conferido de novo na rodada 2 da interface (08/09/2026)

Dez lotes, de **v2.1** a **v3.0**, na ordem do
`documentos/planos/PLANO rodada 2 - funcional e possibilidades 2026-09-08.md`.
Cada um fechou com testes, manual nas duas línguas e uma versão guardada em
`backup/versoes/`.

| Versão | Lote | O que entrou | Testes |
|:---|:---|:---|:---|
| v2.1 | **a cena maior** | A barra da cena passa de 3 linhas para 1; Compensar vai para Propriedades; a faixa de baixo encolhe. | 1.482 → 1.503 |
| v2.2 | **Ponto e Caixa** | Ferramentas Ponto (`O`) e Caixa (`X`), com criação por clique e arrasto. | 1.503 → 1.518 |
| v2.3 | **máscara e mover o desenho** | Máscara (`clipping`) desenhada e editável; arrastar o desenho sem osso escolhido. | 1.518 → 1.537 |
| v2.4 | **ver e travar um a um** | Esconder, só este, travar o escolhido, travar o resto, ver só o resultado, nome ao passar o mouse. | 1.537 → 1.560 |
| v2.5 | **montar mais rápido** | Voltar à pose de repouso, inverter a seleção, virar filho de, substituir nomes, miniaturas. | 1.560 → 1.588 |
| v2.6 | **laço e marcas** | Marcas na régua, trecho de laço, modo de fim, filtro "só o escolhido". | 1.588 → 1.619 |
| v2.7 | **chaves em bloco** | Copiar a pose inteira, colar em todas as chaves, apagar linhas, limpar a animação, ripple, cortar, chavear tudo. | 1.619 → 1.637 |
| v2.8 | **arquivo e ajuda** | Paleta de comandos (`Ctrl+Shift+P`), barra por modo, repetir exportação, reabrir o fechado, configurações do projeto, prévia em tela cheia, imagem de referência. | 1.637 → 1.671 |
| v2.9 | **abas e Tab** | A coluna vira dois grupos de abas; `Tab` esconde os painéis; Exibição em três colunas; cebola na régua; Prévia na faixa de baixo. | 1.671 → 1.700 |
| v3.0 | **inclinar e curvas** | Ferramenta Inclinar (`Z`), interpolação pelo botão direito, duração perguntando, esticar pela ponta, `Shift` nas setas, copiar/colar âncora. | 1.700 → 1.732 |

**O item 15 — "a cena com pelo menos 60% da janela" — fechou no lote 12, e não
no 4.** O lote 4 chegou a 55% e isso ficou escrito como NÃO alcançado, em três
lugares. O que faltava não era apertar mais a linha do tempo: era poder tirar
tudo da frente. Com o `Tab` do item 19, **medido no mesmo Chrome headless: 55%
→ 82% da altura da janela, e de volta a 55%.**

| O que foi conferido | Resultado |
|:---|:---|
| Testes | **1.732 passando**, 55 arquivos. Nenhum teste foi apagado em dez lotes. |
| Tipos | `tsc --noEmit` limpo. |
| Conformidade | **46 de 46**, nos dois runtimes. Nada do editor tocou no formato. |
| Editor de pé | Chrome headless, 1440×900: **61 quadros por segundo**, entra em Animando, toca `walk`, seis quadros distintos desenhados. |
| Cena | 55% da janela com tudo à vista, **82% com `Tab`**. Barra da cena em **uma linha**. |
| Console | **Limpo** nos dez lotes. Só as duas linhas do Vite e o aviso de `willReadFrequently` do Canvas2D, que é da própria medição. |

Os **desvios de cada lote** — 7 tabelas, uma por lote, do 4 ao 13 — estão no fim
do próprio plano, seção por seção, com o que o plano dizia, o que o código pediu
e o que ficou. Nenhum é bloqueante, e três deles são o mesmo tipo de coisa: o
plano pedia um campo que o formato `.bone` não tem, e o código escolheu o que o
formato tem em vez de inventar um campo que nenhum leitor entenderia.

---

## Requisitos [M] em aberto — 4, mais 3 parciais

> **Decisão do Humberto, 09/09/2026: "primeiro vamos finalizar o programa."**
> Repositório, canal, licença e vídeo **não são pergunta agora**. Vídeo (E5) não
> foi pedido por ele: veio da pesquisa dos 12 programas. O foco é animação para
> jogos; o editor ainda não tem o básico. Nenhum chat deve perguntar estas quatro
> de novo até ele dizer que o programa está pronto. Runtime do socket e backup
> automático esperam pelo mesmo motivo.

Cada linha é um requisito **obrigatório** do `documentos/MANUAL DE REQUISITOS 2026-09-06.md`. Nenhuma é
acabamento de editor: são partes do produto que não existem.

**A separação abaixo é o que importa.** Nenhum dos sete pode ser fechado nesta
máquina, e os motivos são de três tipos diferentes. Misturar os três é o que
faz um prazo nascer errado.

---

### A. Espera uma DECISÃO SUA — 4

Nada aqui é trabalho de código travado por falta de tempo. São escolhas que só
você pode fazer, e **cada uma é barata de decidir e cara de desfazer**.

| # | Requisito | A decisão, em uma frase | O que acontece depois |
|:---|:---|:---|:---|
| C4 | Repositório público, com changelog e issues | **Onde ele mora, e sob que nome.** | **É o buraco mais sério do projeto.** `CHANGELOG.md`, `CONTRIBUTING.md` e o registro de conformidade já estão escritos e esperando. Sem o repositório, a governança da §12.8 — comitê, issue pública, sucessão em 24 meses — não tem endereço, e o formato tem um único ponto de falha: você. Foi assim que o DragonBones morreu. Cinco documentos mandam "abra uma issue" e nenhum diz onde. |
| C3 | Fórum ou canal oficial | **Qual canal** (Discord, Matrix, GitHub Discussions). | Depois de C4, é uma tarde. Sem C4 não faz sentido: um canal sem repositório não tem sobre o que conversar. |
| L2 | Runtimes em código aberto, **MIT** | **MIT ou Apache 2.0?** | Está gravado **Apache 2.0**, que dá tudo o que a MIT dá **mais** a outorga de patente da cláusula 3 — é ela que faz o jurídico de um estúdio aprovar o uso. O requisito T2 aceita "MIT ou Apache"; o L2 diz MIT com todas as letras. Se confirmar Apache, o requisito fecha com uma linha no manual de requisitos. Se pedir MIT, é troca de cabeçalho em todo `.ts`, `.mjs` e `.py`, mais o `LICENSE` e o `NOTICE`. |
| E5 | Sprite sheet, sequência PNG, GIF, **vídeo** | **Fechado, 10/09/2026.** O Humberto respondeu: WebM sim, MP4 não. Sai folha, sequência de PNG, GIF e **WebM** (lote 43, v6.9, só pelo editor). O texto abaixo é o de antes da resposta. **"Vídeo" quer dizer MP4 de verdade?** | Três dos quatro já saem: folha de sprites com JSON de índice, sequência de PNG e GIF animado, na linha de comando e no editor. **MP4 e AVI não saem e não vão sair sem dependência** — não cabe um codificador de vídeo escrito à mão, e a regra do projeto é zero dependência. O comando do ffmpeg já sai pronto na tela. Se aceitar GIF + sequência, **fecha hoje**. Se exigir MP4, fica parcial para sempre, ou a regra da dependência muda. |

**A decisão mais barata e mais irreversível da lista não está nesta tabela: é o
nome do domínio.** Hoje `recorte.dev` é provisório e aparece dentro de **todo
arquivo gravado**, no `$id` do schema. Se um terceiro registrar esse domínio
depois, o identificador do formato passa a apontar para um host alheio, e
trocá-lo já é mudança de identidade. Está no item 5 do Apêndice B, e vale
resolver antes de qualquer arquivo circular.

Além dessas quatro, o **Apêndice B da especificação tem 15 decisões abertas**,
oito delas travando a 1.0. Estão listadas mais abaixo, em "Decisões em aberto".

---

### B. Espera SOFTWARE QUE NÃO ESTÁ NESTA MÁQUINA — 2

Não é falta de tempo nem de decisão: **as ferramentas não estão instaladas
aqui.** Conferido na linha de comando hoje.

| Ferramenta | Estado nesta máquina |
|:---|:---|
| `gcc`, `g++`, `clang`, `cl` (compilador C/C++) | **não existe** |
| `cmake` | **não existe** |
| `dotnet`, `mono` (C#) | **não existe** |
| Unity | **não instalado** |
| Godot | **não instalado** |
| Unreal | **não instalado** |
| Node 24 e Python 3.12 | instalados — é com eles que tudo o que existe foi feito |

| # | Requisito | O que falta, e o que já está pronto para quem for fazer |
|:---|:---|:---|
| T1 | Runtime de referência em **C** ou **C++** | Não existe. **Mas mudou de tamanho:** o formato já tem dois runtimes independentes que concordam campo a campo, então quem escrever o de C/C++ tem uma spec conferida por duas implementações, 46 casos de conformidade e um adaptador de referência para copiar. É o runtime que uma engine embute. |
| T3 | Runtimes **Unity, Godot, Unreal, C#, C++** | Nenhum dos cinco. O runtime **Web (JS/TS)**, que o mesmo requisito também pede, **está feito**. Os cinco que faltam dependem de T1: o caminho normal é o runtime em C com wrappers gerados, que é como o Spine 4.3 faz. |

---

### C. Só trabalho que não coube — 1 parcial

| # | Requisito | O que já tem, e o que falta |
|:---|:---|:---|
| P2 | IK de 1, 2 e **N** ossos (Limb, CCD, FABRIK) | 1 e 2 ossos estão fechados e cobertos por casos de conformidade. **CCD e FABRIK para N ossos não existem.** É meio trabalho e meia decisão: o item 4 do Apêndice B ainda não escolheu qual dos dois é normativo, nem com que critério de parada. Implementar antes da decisão grava uma escolha que ninguém conferiu — e mudar depois quebra todo arquivo já gravado, porque a pose muda de número. **Decida o algoritmo primeiro; a implementação depois é trabalho de uma fase.** |

---

### D. Trabalho que não coube — nenhum é requisito [M]

Nada aqui trava um requisito obrigatório. Está listado porque some da vista se
não for escrito, e porque duas destas linhas são o que mais rende por hora.

| O que | Por que vale, e o tamanho |
|:---|:---|
| **Runtime do lote socket: prefixo `<slot>/` no dump, socket, dois canais, animações e skins externas** | **Dez casos de conformidade já estão escritos e conferidos** em `conformidade/casos-pendentes/`, esperando o runtime. Ordem no fim da seção "O que o lote socket fez". Uma fase, nos dois runtimes. |
| **Confronto dos dois runtimes contra uma PASTA de arquivos reais** | **É a linha que mais rende de todas.** Os cinco defeitos da fase 8 saíram daqui, e não da suíte. Hoje `comparar-runtimes.mjs` só varre `conformidade/casos`. Falta uma opção que aponte para uma pasta qualquer e uma sonda padrão. Meio dia. |
| Fechar a lista de cobertura da suíte | `tag`, `variable`, `parameter`, `driver`, esqueleto aninhado, `darkColor` e `blend` continuam sem caso. A §12.4 exige isso **antes de congelar a 1.0**. Uma fase. |
| ~~Imagens nos capítulos 2, 5, 7 e 8 do manual~~ | **Feito no lote 30.** Os oito capítulos têm imagem, nas duas línguas, e um teste reprova imagem citada que não exista. |
| Interface do editor em inglês | O manual em inglês existe; a interface não. Por isso todo botão no manual em inglês vem com o rótulo português entre parênteses. Não é requisito [M]. |
| ~~Fatiar `.bonez` direto~~ | **Feito no lote 41 (v6.6).** `fatiar.mjs` lê `.bonez` e, com pacote na entrada, grava pacote na saída. |
| ~~Exportar o atlas fatiado pelo editor~~ | **Feito no lote 41 (v6.6).** Exportar por pele ganhou **Pacote .bonez com o atlas**: um arquivo só, com o `.bone` fatiado, o atlas com as regiões usadas e as páginas reempacotadas. |
| Acabamento do editor | A lista inteira está mais abaixo, em "Acabamento do editor". Nenhum item é requisito [M]. |

---

## Acabamento do editor

Nada aqui é requisito. São detalhes que gastam paciência.

| O que | Onde |
|:---|:---|
| Arrastar slot para o meio de duas linhas | Hoje só troca de lugar com outra linha. |
| ~~Exportar imagem com intervalo, ou "todas as animações", pela janela do editor~~ | **Feito no lote 41 (v6.6):** De, Até e **Todas as animações** na janela. |
| Sequência de PNG no editor sem o navegador pedir permissão | Ela baixa um arquivo por quadro. GIF e folha saem em 1 e 2 arquivos, e não pedem nada. |
| Arrastar a altura de cada painel da direita | Dá para dobrar o painel, não para medir. Enquanto isso, Malha, Exibição e Prévia nascem dobrados (`CLOSED_PANELS`, em `ui/shell.ts`), para a Árvore e as Propriedades terem altura de trabalho. |
| Editar o UV separado da posição | O `keepUv` existe no código, sem botão. |
| Traçado de silhueta com buraco | Um buraco no desenho fica dentro da malha. |
| Zoom e deslocamento no painel Curvas | Ele mostra sempre a animação inteira. |
| ~~Esticar arrastando a **borda** da seleção~~ | **Já existe**, e esta linha estava velha: escolha duas chaves ou mais e a linha Resumo mostra uma alça em cada ponta, com a dica *"Puxe para esticar, com o fim parado"*. É o `renderEdgeHandles` do `dopesheet.ts`. Achado ao reescrever o manual, lote 30. |
| Mudar a forma da malha sem recarregar o arquivo | As chaves já não recarregam; mover vértice em montagem ainda sim. |
| Compensar um osso que uma regra manda | Um osso sob regra de caminho ou de física tem a posição decidida depois, pela regra, e volta a se mexer. A compensação segura o resto do corpo. |
| Compensar um filho com herança fora do normal | Com `inheritRotation`, `inheritScale` ou `inheritReflection` desligado, o osso é **deixado como está** de propósito: a volta da §5.4 não vale para os outros quatro modos, e mais vale parado do que movido errado. |
| Compensar `region` e `point` sob escala desigual | Sai aproximado: a conta pede um cisalhamento e o formato não tem campo de cisalhamento para anexo. Vértices (malha, caixa, recorte) e ossos filhos são exatos sempre. |
| Espelhar esquerda e direita também em slot, `deform` e sequência | Hoje troca só linhas de **osso**: o nome do anexo do lado esquerdo não existe no slot direito, e trocar só o alvo apontaria para o vazio. |
| Copiar a mistura da Prévia com tudo dentro | "Copiar para a linha do tempo" grava só os ossos (sete propriedades). Evento, ordem de desenho, cor de slot, `deform`, sequência, parâmetro, morph, variável e tag ficam de fora — e a lista está escrita na tela, ao lado do botão. |
| Encadear três animações numa camada da Prévia | Trocar a animação no meio de uma transição descarta a de saída, em vez de encadear. |
| Máscara de camada do PSD | O desenho vem inteiro, com um aviso por camada. Camada de texto, de ajuste e de forma vetorial só entram como pixels quando o PSD os traz rasterizados. 1 e 32 bits por canal não são lidos (8 e 16 sim; 16 vira 8). |
| Barra de ferramentas que rola de lado em vez de quebrar em duas linhas | Foi tentado e desfeito: com `flex-wrap`, cortar a segunda linha é pior que a linha extra. O ganho de altura veio da medição da barra em `setDockHeight`, que é o que importava. |
| Curvas de quicar e de oscilar de verdade | "Passa do alvo" e "Recua e passa" são de um segmento só. Quicar (*bounce*) e elástico de verdade precisam de vários segmentos, e são trabalho de um gerador de chaves. |
| Traduzir o ponteiro JSON dos avisos para nomes, e dar botão "Corrigir" | **Feito**, lote 49, v8.5: o aviso diz `pele "default" › desenho "body"`, em português, com **Ir para** e o conserto. Antes dizia `/skins/0/attachments/body`. |
| ~~Fazer a caixa "Arte em pixel" desligar o filtro na tela~~ | **Feito no lote 48 (v7.9):** cena, Prévia, miniaturas e exportação sem filtro com `pixelArt`. |
| ~~Campos numéricos com setas~~ | **Feito no lote 48 (v7.9):** `↑` `↓`, `Shift` ×10, `Alt` ×0,1. O arrasto de lado já existia no campo; sobre o **rótulo** ainda não. |
| Vídeos curtos por ferramenta | Requisito C5 [I]. Os capítulos 1 a 6 servem de roteiro. |
| ~~Cabeçalho de painel tapando a primeira linha do painel de cima~~ | **Conferido no lote 48:** não existe mais desde as abas do item 19. Nenhum `sticky` na coluna, e os botões respondem no topo e no fim do rolo. Dois testes prendem. |

---

## O segundo runtime, e o confronto entre os dois

**Este é o resultado da fase 7, e é o que muda a natureza do projeto.**

Até aqui, a especificação tinha **uma** implementação. Uma suíte de
conformidade que só rodou contra o runtime que a gerou prova que o runtime
concorda consigo mesmo — e mais nada.

Agora são dois.

| | Runtime de referência | Segundo runtime |
|:---|:---|:---|
| Linguagem | TypeScript | Python 3.12 |
| Onde | `runtime/src/` | `runtime-python/recorte/` |
| Dependências | nenhuma | nenhuma |
| Escrito a partir de | a spec **e** o porte do Spine 4.2 | **só o texto da spec**, sem abrir `runtime/src/` |
| Casos de conformidade | 46 de 46 | 46 de 46 |

O placar honesto do experimento: **36 dos 39 casos daquele momento passaram na
primeira rodada, lendo só a spec.** Um falhou por erro de digitação do autor.
Dois falharam por buracos reais no texto.

### O que o confronto achou

`ferramentas/comparar-runtimes.mjs` roda os dois no mesmo caso e compara os
**dois dumps inteiros**, e não só o que o `esperado.json` cita. Isso importa:
um campo que um runtime escreve e o outro omite **nunca reprova ninguém**.

Na primeira rodada, **10 dos 39 casos divergiam** — e os dois passavam em 39
de 39.

| Divergência | Veredito |
|:---|:---|
| `darkColor` e `sequenceIndex` omitidos no dump de slot (10 casos) | Ambiguidade da spec: a §12.4 não listava os campos nem dizia que presença é obrigatória. |
| Solver de Bézier: parada medida em `x` e não em `s` — **8,5e-5**, contra tolerância de **1e-4** | **Erro da spec.** Os dois obedeciam ao texto e chegaram a 85% do limite de reprovação. |
| `uvs` de uma malha ligada não saíam do dump de referência | Erro do runtime TypeScript. |
| `uvs` sem atlas: literais ou nada | Ambiguidade da spec. |
| Base dentro do `.bonez`: o TypeScript tentava a raiz do ZIP como segunda chance | Erro do runtime TypeScript. Um leitor com segunda chance abre pacote que outro recusa. |
| Colisão de `drawOrder`: a palavra "descitado" faltava | Ambiguidade da spec. Sem ela, um runtime desenha um slot a menos. |

**Hoje: 46 de 46 concordam campo a campo — e, desde a fase 8, também no
`heroi.bone` INTEIRO, que é maior que qualquer caso.**

### O que entrou na especificação por causa disso

**Treze entradas no Apêndice A, com origem "dois runtimes"** (43 a 55), em onze
seções: §2.8, §5.1, §5.6, §6.4, §6.5, §7.3, §7.5, §9.3, §9.5, §9.6, §12.2 e
§12.4. Duas delas são graves — a §5.6 estava **errada** ao pé da letra (o C-230
reprova por 0,116, com tolerância de 0,0001) e a §5.1 não separava valor
animável de estado de simulação (o C-260 reprova).

O relatório inteiro, com a tabela dos dois lado a lado e o veredito de cada
divergência, está em **`conformidade/dois-runtimes.md`**. O que faltou no texto
da spec, escrito por quem implementou de fora, está em
`documentos/notas-de-desenvolvimento/SPEC-INSUFICIENTE.md`.

### O que este confronto NÃO prova

| O que | Por quê |
|:---|:---|
| Independência de verdade em 5.4, 5.5 e 6.2–6.5 | O de TypeScript é porte do Spine 4.2; o de Python copiou o pseudocódigo da spec, que veio do mesmo lugar. Dois portes da mesma fonte concordarem não diz que a fonte está certa. A conferência contra o `spine-runtimes` em C++ continua aberta (decisão 6). |
| Que o segundo runtime cobre tudo | Ele **lê**; ele não grava. Fora dele: esqueleto aninhado, recorte de triângulos, desenho, gravação, validador, mistura por faixas e extensões `BONE_*`. |
| Que a suíte está fechada | Foram seis divergências em dois runtimes. Um terceiro acharia mais, enquanto a suíte não medir tudo o que a spec promete. |

---

## O que a suíte de conformidade ainda NÃO cobre

Isto está escrito na §12.4 e é repetido aqui porque **um número de casos não é
uma promessa de cobertura**, e a diferença entre as duas coisas é a diferença
entre um padrão e uma propaganda.

**Saíram da lista na fase 8** — `boundingbox`, `clipping`, `point` e
`sequence` com atlas. O caso **B-106** põe os quatro tipos de geometria em
cena de uma vez e prende **quem entra em qual canal** do dump; o **B-105**
prende os UV de uma sequência quadro a quadro. Com eles, três dos cinco canais
que ninguém media — `points`, `boundingBoxes` e o `vertices` de `clipping` e
`path` — passaram a ser medidos.

**Também saiu:** `deform` com chaves de `offset` diferente e chave vazia, no
caso **A-031**; e o primeiro quadro da física mais a chave `reset` em laço, nos
casos **C-261** e **C-262**.

Continuam sem caso nenhum: `tag`, `variable`, `parameter`, `driver`,
attachment do tipo `skeleton` (aninhado), `darkColor` e `blend`. Dois canais da
sonda — `tags` e `variables` — não são medidos por caso nenhum, e `parameters`
só de raspão. A família `R-` (renderização) e o caso `X-306` (arquivo da
`minor` anterior) estão previstos e não existem.

**`linkedmesh` saiu da lista na fase 7:** o caso **B-104** prova a geometria
emprestada e os dois valores de `inheritDeform`. Ele nasceu porque o editor
passou a criar malha ligada, e um recurso que a ferramenta grava e a suíte não
prova é um recurso que um runtime de terceiro pode ler errado sem ninguém ver.

**A lição da fase 8 vale mais que os casos que ela fechou.** Os cinco defeitos
não foram achados por caso nenhum: foram achados apontando o confronto dos dois
runtimes para o `heroi.bone` **inteiro**. Um arquivo de verdade tem combinações
que nenhum caso pequeno tem — física junto com laço, sequência junto com atlas,
deform junto com driver. **Rodar o confronto contra arquivos reais deveria
virar rotina, ao lado da suíte.** A ferramenta já faz isso; falta um comando
que aponte para uma pasta de arquivos em vez de para `conformidade/casos`.

Consequência: um runtime pode passar em 46 de 46 e se declarar "nível C" sem
ter implementado nada do que sobrou na lista. **Fechar essa lista é
pré-requisito para congelar a 1.0.**

Casos que faltam, além desses, e que valem por si:

| Caso | O que prenderia |
|:---|:---|
| `.bonez` com o `main` numa **subpasta** | É o único jeito de separar "pasta do `main`" de "raiz do ZIP" (§2.8). O ZIP-501 tem o `main` na raiz, então as duas leituras dão o mesmo resultado — e os dois runtimes do projeto de fato divergiam aqui, sem nenhum caso pegar. |
| C-232, C-233 | O mesmo rig de shear do C-230 sob regra de **caminho** e sob **física** — as outras duas que chamam `appliedFromWorld`. |
| Variante de C-212 com `softness != 0` | Nenhum caso tem `softness` diferente de zero; dobrar o fator de escala dele passa na suíte inteira. |
| Variante de C-220 com `offsetShearY != 0` e alvo de determinante negativo | Nenhum caso tem `offsetShearY`; inverter o sinal do `reflect` passa na suíte inteira. |
| Caminho com escala de mundo != 1 nos três `spacingMode` | A tabela e o pseudocódigo da §6.4 divergem (dúvidas 19 e 20). |
| `deform` sobre `boundingbox`, medindo `boundingBoxes` | §7.6 e §9.6 se contradizem (dúvida 4). |
| Física com `mix` indo a 0 e voltando | A §5.6 manda pular a regra quando `mix == 0`, e para a física isso não avança o relógio: quando o `mix` volta, o delta acumulado dá um salto. |

---

## Decisões em aberto — precisam de você, não de código

Vêm do Apêndice B da especificação e das dúvidas anotadas em
`documentos/notas-de-desenvolvimento/DUVIDAS-SPEC.md`.

| # | A decidir | Trava a 1.0? |
|:---:|:---|:---:|
| 1 | Fórmulas exatas das três combinações reservadas de herança (§5.3). Você disse sim em 10/09 (lote F3), mas a decomposição proposta pelo planejador **não reproduz os cinco modos do Spine** (medido, Desvios → F3 do plano da rodada 4). Há uma proposta alternativa lá, na linha das fórmulas do Spine. Espera o planejador escolher. | Sim |
| 2 | Se a grade de parâmetros multilinear (`BONE_param_grid`) entra no núcleo, por causa do Live2D. | Sim |
| 3 | Pseudocódigo próprio do pêndulo (`BONE_pendulum`), sem depender do Cubism. | Sim |
| 4 | Algoritmos completos de CCD e FABRIK para a cadeia de IK. | Sim |
| 5 | **Nome definitivo: o dono escolheu BONE BANANA** (dito em 08/09/2026). A troca fica para a próxima fase, a pedido dele. Falta decidir o **domínio**, que aparece dentro de todo arquivo, no `$id` do schema — hoje `recorte.dev`, provisório. **É a decisão mais barata e mais irreversível da lista: registre o domínio antes de qualquer arquivo circular.** Se um terceiro registrar o domínio depois, o identificador do formato passa a apontar para um host alheio, e trocá-lo já é mudança de identidade — nem o glTF quis pagar esse preço. Ver a seção "A troca de nome" abaixo. | Domínio, sim |
| 6b | **`appliedFromWorld` da §5.5 não fecha o ciclo quando há cisalhamento — medido, e ainda não decidido.** A ida da §5.4 põe `scaleY` como o **comprimento** da segunda coluna; a volta da §5.5 devolve `det / scaleX`, que é o comprimento da **projeção perpendicular** — mais curto pelo fator `cos(shearY)`. Com `shearX = 20°` a diferença medida foi de ~6%. Toda regra que chama `appliedFromWorld` (transformar, caminho, física) acumula esse erro num osso com cisalhamento. A volta exata existe e está escrita, com `ψ = atan2(Rd, Rb)`: `scaleY = ±|(Rb, Rd)|` e `shearY = ψ − rotation ∓ 90`. **Por que não foi trocado:** `runtime/src/skeleton.ts` é um porte palavra por palavra do `updateAppliedTransform` do Spine, e trocar a fórmula muda casos de conformidade e afasta o runtime da referência que a §12.4 manda conferir. É decisão sua, e é a mesma conversa do item 6 e da dúvida 10. Enquanto isso, `editor/src/viewport/tools/compensate.ts` tem a sua própria `localFromWorld`, exata, com o comentário explicando por que ela não é a §5.5. Reproduz-se em `editor/testes/eixos-e-chaves.test.ts`, caso "localFromWorld desfaz a passada 5.4". | Sim |
| 6 | Conferir as fórmulas portadas contra o runtime de referência em C++ (`spine-runtimes`), nos recursos de 5.4, 5.5, 6.2–6.5 e 9.3. A §12.4 já exige isso antes de congelar. Duas coisas dependem dela: o **sinal do `shearY` na raiz** (§5.5, dúvida 10 — hoje a raiz usa a convenção oposta à do ramo com pai, e mundo→aplicada→mundo não fecha) e a **fórmula da física** (o C-260 prova determinismo, não fórmula: é o único caso cujo esperado saiu do próprio runtime). | Sim |
| 7 | Timeline de troca de pai animável (Spriter). **Reaberta e fechada por você em 10/09/2026**: entrou na §9.4 como `parent`, lote F2, v7.2. | Não, fechado |
| 8 | Confirmar os limiares do layout binário (64 chaves, 64 influências) e o alinhamento das posições. | Sim |
| 9 | Confirmar os nomes exatos dos campos 4.3 do Spine para transform e slider. | Sim |
| 10 | **Gravar `"version": "0.9"` enquanto o rascunho estiver aberto.** Todo arquivo que o editor grava hoje se declara `1.0`, mas a spec que define a 1.0 é um rascunho com oito decisões abertas que mexem em **números**. Se qualquer uma fechar diferente do runtime de hoje, todo arquivo já gravado como 1.0 vira não conforme — e a §2.4 proíbe mudar significado dentro de um major. Isso quebraria F5 e F8 no primeiro dia, que é o erro nº 4 da lista "O que NÃO fazer". O glTF passou por 0.8 e 1.0 antes de congelar a 2.0 justamente por isso. **Adiado nesta rodada: mexe em todo exemplo, no schema, no editor e em dezenas de testes, e é uma decisão sua, não minha.** | Sim |
| 11 | **Licença dos runtimes: Apache 2.0 ou MIT?** O requisito L2 diz MIT; o T2 aceita "MIT ou Apache". Está gravado Apache 2.0, pela outorga de patente da cláusula 3, que é o que um jurídico de estúdio procura. Confirme ou troque. | Não |
| 12 | Baixar o texto legal completo da CC BY 4.0 e gravá-lo em `formato/LICENSE-CC-BY-4.0.txt`. Hoje `formato/LICENSE` incorpora a licença **por referência à URL canônica**, que é a forma que a própria Creative Commons recomenda e é válida — mas um arquivo local é o que um jurídico prefere ler sem internet. | Não |
| 13 | As 32 dúvidas do `DUVIDAS-SPEC.md`. As de número **1**, **2** e **22** foram fechadas em 08/09/2026 e estão escritas na spec, com caso de conformidade. As outras têm uma resposta escolhida e testada; falta você confirmar ou trocar. | Em parte |
| 14 | **O requisito E5 fecha com GIF + sequência de PNG, ou exige MP4?** Sem dependência não cabe um codificador de vídeo. Se exigir MP4 de verdade, o E5 fica parcial para sempre. **Respondida em 10/09/2026: WebM sim, MP4 nunca. Lote 43.** | Não |
| 15 | **As treze correções da fase 7 no Apêndice A (43 a 55).** Elas não são escolhas de gosto: cada uma saiu de uma divergência medida entre os dois runtimes, e onze delas mudam **texto normativo**. Vale ler o `conformidade/dois-runtimes.md` de ponta a ponta e confirmar. | Sim |
| 16 | **A mistura em duas camadas do filho aninhado (§7.11) fica normativa na 1.0?** É a única mistura obrigatória da spec; a por tracks continua livre. O C-274 prende a resposta de hoje. Apêndice B, 10. | Sim |
| 17 | **`assets.skins` ou `skin.uri`?** Escolhida a lista, simétrica com `atlases` e `animations`. Reabrir só se aparecer o caso de renomear uma skin ao importar. Apêndice B, 11. | Não |
| 18 | **Arquivo externo não encadeia (`EXTERNAL_CHAIN`, L1).** Proíbe biblioteca que puxa biblioteca. Simples e seguro; reabrir custa um contador de profundidade e um caso. Apêndice B, 12. | Não |
| 19 | **Pivô por imagem: decidido em 10/09/2026.** `pivotX/pivotY` por região do atlas (§10.3), em px da imagem original, como `offsetX/offsetY`. O rig é a fonte da verdade: o editor calcula o pivô do personagem montado e carimba o atlas. Um pivô por imagem; quem quiser dois, duplica no atlas. O `.bone` e a conta de pose não mudam. Fecha a D5 da rodada 4. Plano: `documentos/planos/PLANO pivô e Animando 2026-09-10.md`, lotes 55 a 58. | Não, fechado |

---

## Comandos do dia a dia

| Comando | O que faz |
|:---|:---|
| `npm run editor` | Abre o editor no navegador, em `http://localhost:5173`. |
| `programa\Abrir o editor.bat` | Abre o editor **pronto, montado**, sem Vite, em `http://localhost:5180`. Pasta `programa/`. Para montar de novo: `python ferramentas/montar-programa.py`. |
| `npm run site` | Abre a página inicial e o validador da web, em `http://localhost:5174/site/`. |
| `npm test` | Roda os 1.347 testes. |
| `npm run importar-psd -- personagem.psd saida` | Lê um PSD ou PSB em camadas e grava `saida.bone`, `saida.atlas.json` e `saida.png`. |
| `npm run conformidade` | Roda os 46 casos, no runtime de referência. |
| `npm run conformidade:python` | Roda os mesmos 46 casos no **segundo runtime**, o de Python. |
| `npm run conformidade:dois` | Põe os dois runtimes frente a frente e compara os dumps **campo por campo**. |
| `npm run conformidade -- --json` | O relatório em JSON, com o **nível alcançado** e as categorias sem caso. |
| `npm run validar -- --todos` | Confere os 5 arquivos de exemplo. |
| `npm run exportar -- formato/exemplos/heroi.bone saida.glb` | Exporta para glTF. |
| `npm run exportar-imagem -- formato/exemplos/heroi.bone walk saida --formato gif --fps 20` | Grava GIF, folha de sprites ou sequência de PNG. |
| `npm run fatiar -- formato/exemplos/heroi.bone saida --pasta capa` | Corta o arquivo por pele, por animação ou por pasta de slot. |

O portão completo, que toda mudança tem que passar, está em `CONTRIBUTING.md`.

Cada comando desta tabela foi **executado** no fechamento da fase 8, exatamente
como está escrito. O mapa das ferramentas, com todas as opções, está em
`ferramentas/README.md`.

---

## A troca de nome — para a próxima fase

O dono escolheu **BONE BANANA** em 08/09/2026. Nada foi trocado ainda, a pedido
dele. Este é o mapa de onde o nome antigo está, para a troca ser um lote só.

| Onde | Arquivos que citam "Recorte" |
|:---|---:|
| `ferramentas/` | 35 |
| `runtime-python/` | 31 |
| `editor/` | 22 |
| `documentos/` | 13 |
| `conformidade/` | 9 |
| `formato/` | 8 |
| `site/` | 8 |
| `runtime/` | 4 |
| **Total, sem contar o backup** | **75** |

### O que é troca de texto e o que é decisão

| Item | O que fazer |
|:---|:---|
| Título, rótulos e prosa | Troca direta de texto. É a maior parte dos 75. |
| `generator` gravado nos arquivos | Troca direta. Aparece em todo `.bone` que o editor grava. |
| Nome do pacote em `package.json` | Troca direta. |
| Atalho `Abrir Recorte.bat` | Renomear o arquivo também. |
| **Extensões `.bone`, `.boneb`, `.bonez`** | **Não mexer.** O nome do formato já era "bone"; o nome novo confirma isso. |
| **`$id` do schema (`recorte.dev`)** | **Decisão pendente, em 5 lugares.** Só trocar depois de escolher e registrar o domínio. Trocar duas vezes é pior do que trocar tarde. |

### A ordem certa

1. Escolher e **registrar o domínio** antes de qualquer coisa.
2. Trocar o `$id` do schema e revalidar os exemplos.
3. Trocar o resto do texto, em lote.
4. Rodar tudo de novo: testes, conformidade nos dois runtimes, validador.
