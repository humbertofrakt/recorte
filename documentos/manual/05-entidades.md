# 5. Entidades

Atualizado em 07/10/2026, na v36.5. **Quase tudo que em 15/09 "faltava" já
existe.** Cada seção diz o selo; a tabela do fim junta todos.

## O que você vai conseguir fazer no fim

1. Trazer uma peça animada pronta (a espada, o fogo, o pneu) para o projeto.
2. Pôr a peça no lugar de uma imagem, e ela herdar o lugar e as chaves.
3. Dirigir a peça pela **faixa** na linha do tempo.
4. Testar encaixes sem mexer no arquivo, e gravar só o que ficou bom.
5. Pôr o personagem **dentro** de outra peça ("Este boneco").

---

## O pedido dele

> *"quero um sistema de fazer uma animação base e poder usar ela em outros
> personagens, e animação aninhada: eu faço uma animação e depois troco a
> 'espada' do personagem por uma 'motosserra' animada."*

> *"Uma base pode virar uma entidade e uma entidade pode virar uma base."*

---

## As palavras

| Palavra | O que é |
|:---|:---|
| **Animação** | o que você está trabalhando agora |
| **Base** | o corpo montado. Cada base tem as animações dela ([capítulo 2](02-corpos-e-animacoes.md)) |
| **Entidade** | um projeto pronto, já animado, encaixado noutro |

**Base ou entidade depende de onde você está.**

| | **Base** | **Entidade** |
|:---|:---|:---|
| Quem anima | **você, na mão** | **ela mesma** — já vem animada |
| O que você faz | poses, chaves, malha, osso | escolhe **qual** animação dela toca, e ajusta a faixa |
| Na cena | é o personagem | ocupa o lugar de uma imagem, na ordem de desenho |

Todo corpo é um **adaptador de tomada**: tem um pino e tem tomadas. Não há
peça que só recebe e peça que só entra.

**A explosão** fecha o conceito: *"eu controlo ela, troco as animações da
explosão."* Ninguém a anima. Escolhe-se qual animação dela toca.

---

## Imagem primeiro, movimento depois

> *"Eu faria um helicóptero com uma imagem de hélice. Aí, separado, faria a
> animação da hélice e substituiria pela imagem."*

| Passo | Por quê |
|:---:|:---|
| O helicóptero nasce com uma **imagem** de hélice | você acerta o pivô, a ordem de desenho e anima o helicóptero |
| A hélice girando vira **entidade** própria | feita à parte, em laço |
| **Substitui a imagem pela entidade** | ela herda o lugar, o pivô, a ordem de desenho e as chaves da imagem |

**Se o helicóptero inclina, a hélice inclina junto.** Ela está no lugar da
imagem, e a imagem já sabia inclinar.

---

## Trazer uma entidade para o projeto

| Passo | Gesto |
|:---:|:---|
| 1 | **Entidades → Trazer entidade de fora…** e escolha o `.bone` |
| 2 | Ela entra na **Prateleira** da aba Entidades (Janela → Entidades), e na grade do botão direito |

A miniatura da prateleira é **parada**, na pose de montagem. Decisão do
Humberto, 15/09: uma fila de bonecos andando rouba o olho de quem anima.

Arquivo da entidade que sumiu do disco: o rodapé avisa *"A entidade
espada.bone não foi aberta; esse slot fica vazio"*, e o botão de avisos
mostra a conta.

---

## Pôr a entidade no boneco — três jeitos

### 1. No lugar de uma imagem: a grade

**Onde cabe uma imagem, cabe uma entidade.**

| Passo | Gesto |
|:---:|:---|
| 1 | Botão direito na imagem, na cena |
| 2 | A grade abre: as imagens primeiro, e depois o bloco **entidades** |
| 3 | Clique na entidade |

| A entidade… | Como é |
|:---|:---|
| herda | o lugar, a ordem de desenho e as chaves da imagem |
| o pivô dela | cai no pivô da imagem |
| tamanho | quem manda é a entidade |
| onde grava | **sempre na base**, mesmo com uma animação aberta. O rodapé diz *"(foi para a base)"* |

**Trocar todas as iguais (N)**: na grade, o botão aparece quando várias peças
mostram a mesma imagem (as quatro rodas). Nasce **desligado**. Ligado, o
clique troca as N de uma vez, num passo de desfazer.

**Tirar a entidade**: botão direito na entidade → **Tirar a entidade**, ou
**Entidades → Tirar a entidade**. Sai a entidade, e a imagem de antes volta.
Fica cinza quando a entidade não substituiu imagem nenhuma: aí é **Apagar**.

### 2. Arrastar da Prateleira para a cena

Arraste a entidade da aba Entidades até a cena. Ela fica presa ao osso em que
cair.

| Onde você está | Vale |
|:---|:---|
| na **base** | em todas as animações |
| numa **animação** | só nela, da agulha em diante. O rodapé diz *"A base e as outras animações ficam sem ela"* |

Ela nasce tocando a **primeira animação** dela. Sem animação, fica parada, e o
rodapé diz.

O mesmo, pelo menu: **Entidades → Pôr entidade na cena…** (presa ao osso
escolhido; sem osso, na raiz).

### 3. Em teste, pela aba Entidades

Ver [A aba Entidades](#a-aba-entidades-montagem-e-prateleira), mais abaixo.

| Função | Selo | Gesto |
|:---|:---:|:---|
| A grade listando entidades junto das imagens | existe | botão direito na imagem, na cena |
| A entidade herda lugar, ordem e chaves | existe | a grade |
| Trocar todas as iguais | existe | botão na grade |
| Tirar a entidade, a imagem de antes volta | existe | botão direito · Entidades → Tirar a entidade |
| Arrastar para a cena | existe | aba Entidades → cena |
| Pôr pelo menu | existe | Entidades → Pôr entidade na cena… |
| Trocar pela grade numa animação valer **só dali em diante** (decisão de 04/10) | existe diferente | a grade grava na base. O arrasto para a cena é que vale só na animação |

---

## A faixa na linha do tempo

A entidade já chega animada. Na linha do tempo ela é uma **faixa**, com o nome
da animação que toca escrito nela.

| Gesto | Efeito |
|:---|:---|
| arrastar a faixa | muda quando ela começa |
| puxar a **ponta** para fora | toca mais devagar |
| puxar a ponta para dentro | toca mais rápido |
| botão direito na faixa | escolhe qual animação toca, e o **Em laço** |

| Em laço | Sem laço |
|:---|:---|
| roda sozinha, sem fim. Traços finos marcam cada volta | toca uma volta e para no último quadro. O resto da faixa fica apagado |

Os mesmos, pelo menu, com a entidade escolhida:

| Item | Faz |
|:---|:---|
| **Entidades → Escolher a animação dela…** | qual animação toca, da agulha em diante |
| **Entidades → Em laço** | liga e desliga o laço |

**Quem dá as ordens:**

| Você… | Quer dizer |
|:---|:---|
| escolheu a animação da entidade | quem recebe manda nela (a motosserra) |
| escolheu **livre — o jogo escolhe** | ninguém manda: o jogo escolhe (o personagem no poder rosa) |

Ordem para uma animação que a peça não tem: ela fica parada, e o editor
avisa.

| Função | Selo | Gesto |
|:---|:---:|:---|
| A faixa, com o nome da animação | existe | linha do tempo |
| Arrastar a faixa (quando começa) | existe | arrastar |
| Puxar a ponta (velocidade) | existe | arrastar a ponta |
| Escolher a animação | existe | botão direito na faixa · Entidades → Escolher a animação dela… |
| Em laço / sem laço | existe | botão direito na faixa · Entidades → Em laço |
| O canal de fundo `baseAnimation` (roda por baixo de tudo) | falta | o editor lê, mas não há porta para escolher |

---

## Mexer na entidade por dentro

| Passo | Gesto |
|:---:|:---|
| 1 | **Janela → Animações.** Embaixo das suas animações aparecem as entidades, cada uma com as animações dela, recuadas |
| 2 | Clique numa animação da entidade |
| 3 | Você anima a entidade por dentro. O boneco fica à vista, parado, em volta |
| 4 | Para voltar: clique numa animação do boneco (ele aparece na lista com a marca **base**) |
| 5 | **Arquivo → Salvar a entidade editada…**: **Novo** (cópia neste projeto) ou **Por cima** (no arquivo de origem) |

### Promover e rebaixar

| Gesto | O que acontece |
|:---|:---|
| **Entidades → Promover a base** · botão direito na entidade da Prateleira | a entidade vai para a lista **Bases**, com as animações dela |
| **Entidades → Rebaixar a entidade** · botão na tira Bases | a base volta a ser entidade. A base em foco não se rebaixa |

**É o mesmo arquivo o tempo todo — muda o papel, não a matéria.**

### Marcar uma imagem como slot

Uma imagem vira uma **base** do projeto, com nome e animações próprias.

| Passo | Gesto |
|:---:|:---|
| 1 | Botão direito na imagem, na cena → **Marcar como slot…** (ou **Entidades → Marcar como slot…**) |
| 2 | Dê o nome. *"Nasce nome.bone, na lista de bases"* |
| 3 | Nada muda no desenho. O nome aparece em Animações, na Árvore e na Ordem |
| 4 | Clique no nome dela em Animações: você a monta por dentro, com o boneco à vista |

Desfazer: **Entidades → Desmarcar o slot**, ou o mesmo item no botão direito.
Só imagem vira slot: caixa, ponto e caminho ficam com o item cinza, e a dica
diz por quê.

| Função | Selo | Gesto |
|:---|:---:|:---|
| As entidades na janela Animações, com as animações delas | existe | Janela → Animações |
| Animar por dentro, com o boneco à vista | existe | clique numa animação da entidade |
| Salvar a entidade editada: Novo ou Por cima | existe | Arquivo → Salvar a entidade editada… |
| Promover a base | existe | Entidades → Promover a base |
| Rebaixar a entidade | existe | Entidades → Rebaixar a entidade |
| Marcar e desmarcar slot | existe | botão direito na imagem · menu Entidades |

---

## "Este boneco": a tomada ao contrário

O poder rosa foi feito para **receber** o personagem. Mas você está animando o
personagem, e quer pôr o poder nele.

| Passo | Gesto |
|:---:|:---|
| 1 | Ponha o poder no personagem (arrastar da Prateleira) |
| 2 | Botão direito na imagem do **meio** do poder |
| 3 | O **primeiro item** da grade é **Este boneco** |

| O que o programa faz |
|:---|
| A imagem do meio **não é desenhada**. Só marca o meio |
| O que está atrás dela vai para **trás do personagem inteiro** |
| O que está na frente vai para **a frente** |

O rodapé conta: *"poder5 em volta de heroi: 2 atrás, 2 na frente"*. A aba
Ordem mostra duas linhas, *na frente (N)* e *atrás (N)*. Com o poder
escolhido, a cena mostra uma caixa laranja tracejada no meio.

**Pelo menu:** **Entidades → Este boneco…** abre a lista das imagens, cada uma
com a conta de quantas ficam atrás e na frente.

**Desfazer:** botão direito de novo → **Tirar o Este boneco** · **Entidades →
Tirar o Este boneco** · `Ctrl+Z`.

| Onde | Vale |
|:---|:---|
| na base | em todas as animações |
| numa animação | só nela, da agulha em diante |

| Função | Selo | Gesto |
|:---|:---:|:---|
| Este boneco, primeiro item da grade | existe | botão direito na imagem do meio |
| Escolher o meio pela lista | existe | Entidades → Este boneco… |
| Tirar | existe | botão direito · Entidades → Tirar o Este boneco · `Ctrl+Z` |

---

## A aba Entidades: Montagem e Prateleira

**Janela → Entidades.** Caixa dentro de caixa: quem está dentro de quem se lê
de cima para baixo. **Sem fio.**

| Parte | O que é |
|:---|:---|
| **A barra** | **Na cena** e **Pôr no projeto** (ícone e palavra) |
| **Montagem** | a árvore de cartões. O cartão dentro de uma linha está no slot daquela linha |
| **Prateleira** | todas as entidades do projeto, em miniatura. *Arraste para um slot* |

**As palavras no canto do cartão:**

| Palavra | Quer dizer |
|:---|:---|
| **aqui** | o projeto aberto. É ele que você anima |
| **projeto** | a peça está gravada no arquivo. Borda cheia |
| **teste** | a peça está só testando. Borda **tracejada** e cor de aviso |
| **em volta** | o de fora, com o projeto dentro dele |

**O que é teste:** vale na tela e na Prévia, **não vai para o `.bone`**. Fica
guardado no `manifest.json` do projeto, que o jogo ignora. Volta ao reabrir.

### Os gestos

| Para | Gesto | Pelo menu |
|:---|:---|:---|
| **Ligar em teste** (a motosserra na mão) | arrastar da Prateleira até a linha do slot | Entidades → Pôr em teste neste slot… |
| **Desligar** | arrastar o cartão de teste de volta para a Prateleira · botão direito no cartão → Desligar | Entidades → Desligar o teste deste slot |
| **Trocar a peça** | soltar outra em cima dela | — |
| **Ligar para cima** (o boneco no piloto do mecha) | arrastar o cartão **aqui** até o mecha, na Prateleira. Uma janela pergunta o slot | Entidades → Pôr o projeto dentro de… |
| **Tirar o de fora** | botão direito no cartão de fora → Tirar de volta | Entidades → Tirar de volta |
| **Ver o teste na cena** | botão **Na cena** | — |
| **Gravar no arquivo** | botão **Pôr no projeto** · botão direito no cartão → Pôr no projeto | Entidades → Pôr no projeto… |
| **O que a peça toca** | **anima ▾** no cartão: parada, a de quem recebe, uma dela, ou **livre** | Entidades → O que a peça de teste toca… |
| **Skins da peça, em teste** | **skins ▾** no cartão de teste | Entidades → Skins da peça de teste… |
| **As quatro rodas** | **Trocar todas as iguais (N)** no cartão de teste | Entidades → Teste em todas as iguais |
| **Ver as outras imagens** | linha **+ N outras imagens** | — |
| **Dobrar um cartão** | ▸ / ▾ no cartão (tela baixa) | — |

**Pôr no projeto** grava **na base**: vale em todas as animações. `Ctrl+Z`
volta a ligação a teste. Para cima, o de fora entra no boneco com **Este
boneco**.

**Os casos difíceis:**

| Caso | O que o programa faz |
|:---|:---|
| Ciclo (o mecha dentro do boneco, com o boneco dentro do mecha) | recusa no arrasto. O cartão diz *"… já está acima"* |
| Fundo demais | recusa: *"… fundo demais"* |
| Entidade que sumiu do disco | o cartão fica, com **?** e a linha **falta o arquivo** |
| Muitos níveis em volta, tela baixa | os de fora viram uma **trilha** no topo. Clique num nome para abrir aquele nível |
| A mesma entidade duas vezes | duas cópias, separadas |

| Função | Selo | Gesto |
|:---|:---:|:---|
| A aba Entidades com Montagem e Prateleira | existe | Janela → Entidades |
| Ligar e desligar em teste | existe | arrastar · menu Entidades |
| Ligar para cima | existe | arrastar o cartão aqui · Entidades → Pôr o projeto dentro de… |
| Na cena | existe | botão Na cena |
| Pôr no projeto | existe | botão · Entidades → Pôr no projeto… |
| anima ▾, livre, skins ▾, iguais | existe | no cartão · menu Entidades |
| Ciclo e fundo recusados | existe | no arrasto |
| A Prévia mostrar o de fora **em volta** (o mecha) | falta | a Prévia mostra só as peças de teste **no** boneco (Desvios do plano `22`, lote 4) |
| Pôr no projeto **numa animação**, da agulha em diante | existe diferente | vai sempre para a base |

---

## A lista Animações ganhando entradas de fora

Um `.bone` só de animações, com um bloco `rig` dizendo quais ossos exige.
Aplicado num personagem que tem esses ossos, a animação entra como se fosse
dele.

| Para | Gesto |
|:---|:---|
| levar animações para outra base | **Arquivo → Exportar → Animações, para outra base…** · botão direito na animação → Exportar animação… |
| trazer animações de outra base | **Arquivo → Importar → Animações, de outra base…** A lista do que falta aparece antes |
| as prontas (parado, andar, correr, pular) | **Animação → Animações → Biblioteca de animações…** · ícone pasta da tira Animações |

Os arquivos citados aparecem na janela Animações, na seção **De fora**.

| Função | Selo | Gesto |
|:---|:---:|:---|
| Exportar animação com `rig` | existe | Arquivo → Exportar → Animações, para outra base… |
| Importar animação de fora | existe | Arquivo → Importar → Animações, de outra base… |
| Biblioteca de animações | existe | Animação → Animações → Biblioteca de animações… |

---

## Os exemplos que provam o formato

Na pasta `formato/exemplos/`, citados na especificação.

| Arquivo | O que prova |
|:---|:---|
| `exemplos/mecha.bone` | pendura a espada; puxa animação e skin de outro arquivo |
| `exemplos/espada.bone` | o filho aninhado, com as animações `idle`, `brilho`, `attack` |
| `exemplos/mecha-pele-inverno.bone` | skin externa que troca a cabeça por um esqueleto animado |
| `exemplos/capacete.bone` | um capacete com esqueleto e animações próprias |

`npm run conformidade`: **120 de 120** casos passam (07/10).

---

## O selo — o que este capítulo confirma

| Função | Selo | Gesto ou onde |
|:---|:---:|:---|
| Trazer entidade de fora | existe | Entidades → Trazer entidade de fora… |
| A grade listando entidades | existe | botão direito na imagem, na cena |
| A entidade segue a imagem (herda lugar, ordem, chaves) | existe | a grade |
| Trocar todas as iguais | existe | botão na grade |
| Tirar a entidade | existe | Entidades → Tirar a entidade |
| Arrastar para a cena / Pôr entidade na cena | existe | aba Entidades · Entidades → Pôr entidade na cena… |
| A grade numa animação valer só dali em diante | existe diferente | grava na base |
| A faixa: arrastar, ponta, botão direito | existe | linha do tempo |
| Em laço | existe | Entidades → Em laço |
| Livre — o jogo escolhe | existe | anima ▾ no cartão |
| `baseAnimation` | falta | sem porta |
| As entidades na janela Animações | existe | Janela → Animações |
| Animar a entidade por dentro | existe | clique numa animação dela |
| Salvar a entidade editada | existe | Arquivo → Salvar a entidade editada… |
| Promover a base / Rebaixar | existe | menu Entidades |
| Marcar como slot / Desmarcar | existe | botão direito · menu Entidades |
| Este boneco | existe | botão direito na imagem do meio · Entidades → Este boneco… |
| A aba Entidades: teste e projeto | existe | Janela → Entidades |
| Ligar para cima | existe | Entidades → Pôr o projeto dentro de… |
| A Prévia com o de fora em volta | falta | só as peças no boneco |
| Na virada, a entidade segue o slot de mesmo nome; sem ele, avisa `NESTED_GONE` | existe | `runtime/src/actor.ts:183-193`; vai para os avisos do rodapé por `doc/document.ts:395-398`. Lido no código, não visto na tela |
| Animações de fora, com `rig` | existe | Arquivo → Exportar / Importar → Animações… |
| O formato e o runtime | existe | spec §2.9, §7.11, §9.9, §9.13; conformidade 120/120 |

---

Próximo: [6. Malha e pesos](06-malha-e-pesos.md)
