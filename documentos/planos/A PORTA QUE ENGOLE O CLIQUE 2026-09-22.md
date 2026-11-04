# A porta que engole o clique — desenho da régua — 22/09/2026

Escrito pelo `EXECUTANDO · o vigia do comando sem porta`, a pedido do
`PLANEJADOR · dd3937`, depois de fechar a v20.9 e a v21.1.

---

# ONDE A LINHA PAROU — 22/09/2026, 01:05

**Leia isto primeiro.** O resto do arquivo é o caminho; esta seção é o lugar.

## De pé, e funcionando

| Régua | Onde | Pergunta | Versão |
|:---|:---|:---|:---:|
| 1 | `ui/action-audit.ts` | toda **ação registrada** tem porta? | lote 29 |
| 2 | `ui/command-audit.ts` | todo **comando** é construído pelo programa? | v20.9 |
| 3 | `ui/call-audit.ts` | a porta **funciona quando se aperta**? | v21.2 · medida na v21.5 |
| 4 | `testes/existir-nao-e-funcionar.test.ts` | quem **atende** o clique consegue trabalhar? | v21.6 · v21.7 · v22.0 |

As quatro nasceram vermelhas, com os casos conhecidos na cara, e cada uma tem a
prova de que **acusa** — inclusive contra um caso inventado que ninguém escreveu
ainda (regra 26).

## O que elas acharam, e que ninguém tinha achado

| O quê | Quem achou | Estado |
|:---|:---|:---|
| **A barra de espaço não avisa** com a linha do tempo fechada (`viewport.ts:1471`) | régua 3, na primeira passada | **entregue ao chat dos defeitos** |
| `removeTimeline` — o irmão singular do usado | régua 2 | exceção escrita |
| `attachmentRows`, `constraintRows` — código morto em `panels/tree-rows.ts` | régua 2 | **sem dono**, ver o fim deste arquivo |
| **Oito ações de arranque cujo corpo nunca rodava** | régua 4 | **consertado na v22.0** |
| `tocar-tras`, que ninguém exercita | régua 4 | nome e dono escritos; dono avisado |

## O que FALTA, em ordem

| # | O quê | Por quê nesta ordem |
|:---:|:---|:---|
| **1** | **As 69 ações de `casca`**: nenhuma tem exigência de efeito. Hoje só as de `arranque` a têm | é o mesmo buraco da v22.0, uma gaveta maior. Ordem do Planejador em 22/09: *oito exercitadas valem mais que 69 listadas* — e as oito já estão |
| **2** | **A quinta régua**: *a ação que tabela nenhuma descreve*. `mostrar-painel-*` é registrado e não está no `actions-table.ts` — e está certo que não esteja | hoje são cinco linhas inofensivas. O risco não é o número: é **o caminho estar aberto** |
| **3** | **`EXEMPT_CALLS` ainda está VAZIA.** Os 22 achados da régua 3 estão medidos e julgados neste arquivo, e nenhum virou linha de exceção | de propósito: não pré-absolver lugar que não foi olhado por um humano. O `shell.ts:610` (o menu da barra, que já nasce cinza) é o primeiro candidato |
| **4** | **A tecla que cala**, decidida e não feita: tecla na `KEY_TABLE` cuja ação não existe deve **avisar**; tecla fora da tabela segue calada | decisão do Planejador, 22/09. O conserto é em `ui/shell.ts`, `runShortcut` |

## O que não se mede assim, e nenhuma das cinco vai medir

| Não mede | Quem mede |
|:---|:---|
| se a frase dita é boa | a mão do Humberto |
| se o botão faz o que o nome dele diz | só alguém usando |
| se a porta **se acha** | *porta que ninguém encontra é porta que não conta* — e isso é a mão dele também |

## As réguas de convivência que a noite deixou

| Régua | De onde veio |
|:---|:---|
| **O nome numa lista de exceções não é uma porta — é a confissão de que não há uma** | a régua 2 medindo a própria tabela e dando **zero** |
| **Todo instrumento que se mede junto com o que mede dá um número errado** | a mesma, generalizada: na régua 2 dava verde; na 3, daria vermelho |
| **Eu li o texto que fala do código como se fosse o código** | a régua 3 acusando três comentários |
| **Chamar não é exercitar** | eu relatando *"22 de 37"* e o certo ser 17 |
| **Medição de rascunho roda de FORA da pasta que a casa mede** — *um arquivo que some é pior que um arquivo errado* | os meus `zz-*`, que mandaram outro chat caçar um defeito que já não estava lá. Virou a **regra 29** |
| **Uma régua que aparece como vermelho na tela de alguém sem aviso vira dedo apontado, e deixa de ser lida** | o `tocar-tras` |
| **O nome de um arquivo é a primeira coisa que engana** | `efeito.test.ts` ao lado de `efeitos.test.ts`, uma letra de diferença |

## Um aviso para quem for medir de novo

Os números deste arquivo têm **hora**, e a casa tinha quatro chats gravando. O
total de ações de arranque foi **37 → 38 → 40 → 43 em onze minutos**, sem
ninguém errar. Remeça antes de usar qualquer número daqui, e diga a hora.

---

**Desenho, não código.** Nada foi medido para escrever isto: o outro chat está
mexendo em `shell-actions.ts`, `register-actions.ts` e `panels/rules*` neste
minuto, e medir chão em movimento é o que a regra 24 proíbe. O que está aqui
saiu de **ler** o código, com a hora anotada.

| Lido | Hora do arquivo, em 22/09 |
|:---|:---:|
| `ui/actions.ts` | 11:25 de 21/09 |
| `ui/shell.ts` | 00:12 |
| `ui/menus.ts` | 00:08 |
| `ui/actions-table.ts` | **00:17 — do outro chat, em voo** |
| `ui/shell-actions.ts` | **00:15 — do outro chat, em voo** |

Os dois últimos mudam debaixo de mim. Nada neste desenho depende do conteúdo
deles, só da **forma**: a tabela tem `where` e `needsPanel`, e vai continuar a
ter.

---

## O buraco, em uma linha

> **Há caminhos que chamam uma ação, recebem "não existe" de volta, e não fazem
> nada com essa resposta. O dedo aperta, o programa devolve `false`, e ninguém
> olha.**

`runAction` é honesto: devolve `false` quando ninguém registrou a ação, e
`false` quando ela está desligada. O defeito não é dele. É de quem o chama e
**larga a resposta no chão**.

É a regra 21 pela terceira vez este mês: *onde o programa não entende, ele
avisa — não improvisa*. Aqui ele não improvisa. Ele **emudece**, que é pior:
quem clica não tem como saber se apertou errado, se o programa travou, ou se
aquilo nunca existiu.

---

## O que eu achei lendo, e é a parte que muda o plano

**O menu já está certo.** Eu tinha dito ao Planejador que a régua olharia
"item de menu que aponta para ação `needsPanel` e não fica cinza". **Estava
errado**, e é bom que estivesse: a casca já faz isso, em `ui/shell.ts`:

```
const enabled = hasChildren || (item.enabled && (state.exists ? state.enabled : false));
```

Ação que ninguém registrou ⇒ item cinza ⇒ e a dica diz *"Ainda não existe neste
lote"*. **O menu não engole clique nenhum.**

Então a régua não é sobre menus. É sobre **todo caminho que chama uma ação**, e
o menu é só o único que já está resolvido.

### Os seis caminhos, e como cada um se comporta hoje

| Caminho | Onde | O que faz com o `false` | Julgamento |
|:---|:---|:---|:---|
| **Menu da barra** | `ui/shell.ts` | nem chega a chamar: fica **cinza**, e a dica diz por quê | **certo** |
| **Paleta de comandos** | `ui/shell-file.ts` | `hasAction` antes, e diz *"Esse comando ainda não existe"* | **certo** |
| **Janela de Atalhos** | `ui/keys-dialog.ts` | `hasAction` antes, e diz onde a paleta está | **certo** (v21.1) |
| **Tecla** | `ui/shell.ts`, `runShortcut` | olha o `false` e **deixa a tecla livre** — mas cala | **meio** |
| **Menu flutuante** (botão direito) | `panels/tree.ts`, e outros | chama e **larga o `false`** | **ENGOLE** |
| **Botão de ícone do painel** | `panels/draw-order.ts`, `panels/dopesheet-player.ts`, `panels/tree.ts` | chama e **larga o `false`** | **ENGOLE** |

**A tecla merece parágrafo próprio.** Ela não mente: devolve `false` e a tecla
segue livre, que é o desenho certo para não roubar tecla de ninguém. Mas quem
apertou não recebe nada. *"Apertei `Ctrl+K` e não aconteceu nada"* é uma frase
que o Humberto já disse, e ela tem duas causas possíveis — a aba fechada e o
defeito de verdade —, e hoje as duas são **idênticas na tela**.

### A tecla, decidida pelo Planejador em 22/09

| A tecla | O programa |
|:---|:---|
| **está na `KEY_TABLE`** e a ação não existe agora | **AVISA**, e o aviso diz *por que* e *o que fazer*: "a aba Regras está fechada; abra-a para usar isto" |
| **não está na tabela** | segue livre e **calada**, como hoje |

O motivo de não avisar a segunda: gente aperta tecla por engano o tempo todo, e
um programa que reclama de cada tecla solta vira ruído — **e ruído ensina a
ignorar aviso**, que é o contrário do que a regra 21 quer.

A diferença que importa é **o programa SABER que aquela tecla faz alguma coisa**
e mesmo assim não fazer nada. Aí o silêncio é mentira.

Com isto, *"apertei e não aconteceu nada"* deixa de ter duas causas idênticas na
tela: uma passa a se explicar, e a outra continua sendo defeito — agora
distinguível.

---

## A régua, dita para quem for escrevê-la

> **Todo caminho que chama `runAction` ou fica cinza sozinho, ou olha o `false`
> que ela devolve — e diz alguma coisa. Nenhum caminho aperta e cala.**

### As duas formas que a régua reconhece, e a terceira que ela não vê

| Forma | Como se reconhece no código | A régua vê? |
|:---|:---|:---:|
| **Pergunta antes** | `if (!hasAction(id))` — e o ramo **diz** alguma coisa | sim |
| **Olha depois** | `if (!runAction(id))` — e o ramo **diz** alguma coisa | sim |
| **Cinza antes** | o botão nasce `disabled` a partir de `actionState(id)` | **não** — vai para a lista de exceções |

"Diz alguma coisa" é o que separa esta régua de uma régua de estilo: um
`runAction` dentro de um `if` que não escreve no rodapé nem na janela continua
engolindo o clique, só que com mais linhas. Por isso há **dois** tipos de
acusação, e não um:

| Acusação | O que houve |
|:---|:---|
| **engole o clique** | chamou e largou o `false`. O dedo aperta e o programa cala |
| **olha e cala** | olhou o `false` e não disse nada. Melhor, e ainda mudo |

### O que ela NÃO julga

| Não julga | Por quê |
|:---|:---|
| se a frase dita é boa | isso é a mão do Humberto, e nenhum teste a substitui |
| se a ação faz o que o nome dela diz | nenhum inventário pega isso. Só alguém usando |
| gesto sem ação nenhuma (arrastar, segurar `P`) | não passa por `runAction`; é do `hiddenFunctions` |
| **o botão que já nasce CINZA** | ser cinza é propriedade de um **widget**, não da linha que chama. Uma régua de texto não vê widget desligado, e fingir que vê seria o palpite que a regra 21 proíbe |

**A forma "cinza antes" vai para a lista de exceções, com o motivo escrito** — o
menu da barra é a única do programa que a usa, e é uma linha. Escrever isso como
exceção é mais honesto do que um `if` que adivinha pelo texto e acerta quase
sempre: *quase sempre* é como se certifica um buraco.

---

## Como ela nasce vermelha — e o que fazer se nascer verde

**A regra 26 é o coração deste desenho, e aqui ela tem um perigo novo.**

Os casos conhecidos de hoje são as ações da aba Regras, chamadas pelo menu
flutuante da Árvore (`panels/tree.ts`, `linha('Regra…', …)`). **O outro chat
está consertando exatamente isso agora**: as ações vão passar a ser registradas
no arranque, e aí elas **existem sempre**.

> **Uma régua que nasce verde porque o defeito acabou de ser consertado é uma
> régua que ninguém viu funcionar.**

Então a ordem é esta, e não outra:

| Passo | O quê |
|:---:|:---|
| 1 | **Antes de consertar nada**, rodar a régua contra o código e **anotar a lista** que ela acusa, com nome e linha |
| 2 | Se a lista estiver vazia porque o conserto já passou, **não aceitar o verde** |
| 3 | Provar com **código de mentira**: quatro arquivos falsos, um por forma — pergunta, olha-e-diz, olha-e-cala, larga — e exigir que ela acuse **só os dois últimos**, cada um com o seu tipo |
| 4 | Provar que ela acusa o **próximo**: um caminho novo, inventado no teste, que ninguém escreveu ainda |

O passo 3 é o mesmo desenho que pegou *"herdar não é construir"* no vigia do
comando: o código de mentira achou um buraco que o código de verdade não
mostrava.

### E a armadilha que já nos pegou uma vez

**A régua não pode se medir junto com o que mede.** O arquivo dela vai citar,
por escrito, os nomes dos caminhos que ela julga — e se ele estiver dentro da
varredura, cada citação vira uma menção e tudo fica verde. Aconteceu em 22/09
com o `EXEMPT_COMMANDS`, e o conserto foi uma linha (`O_PROPRIO_VIGIA`).

> **Todo instrumento que se mede junto com o que mede dá verde.**

---

## Onde ela mora, e o que ela toca

| Arquivo | O quê |
|:---|:---|
| `editor/src/ui/call-audit.ts` (novo) | a régua e a lista de exceções, `{ where, why }`. Sem `node:fs`, sem tela — o mesmo molde do `command-audit.ts` |
| `editor/testes/menus.test.ts` | os testes, ao lado dos outros dois vigias |
| `ferramentas/provas/comando-sem-porta.ts` | **talvez** uma seção nova no relatório: a folha do Humberto passaria a ter as três perguntas juntas |

**Cerca:** nenhum arquivo de `panels/` nem de `viewport/` precisa ser tocado
para ESCREVER a régua. Consertar o que ela acusar é outro lote, e a cerca dele
depende do que ela achar.

---

## Por que isto vale um lote

As três réguas juntas fecham a pergunta do Humberto, e nenhuma sozinha a fecha:

| Régua | Pergunta | Desde |
|:---|:---|:---:|
| `hiddenFunctions` | toda **ação registrada** tem porta? | lote 29 |
| `commandsWithoutDoor` | todo **comando** é construído pelo programa? | v20.9 |
| **esta** | a porta **funciona quando se aperta**? | — |
| *"existir não é funcionar"* | quem **atende** o clique consegue trabalhar? | por escrever |

A primeira acha a função sem botão. A segunda acha a função que nunca virou
ação. **A terceira acha o botão que existe, parece vivo, e não faz nada** — que
é a única das três que a pessoa sentada na frente do programa consegue notar
sozinha, e a última que descobriríamos. **A quarta está na seção de baixo**, e
não é minha: veio de quem estava com o defeito na mão.

---

# A MEDIÇÃO — 22/09/2026, 00:40

**Anotada antes de qualquer conserto**, como o Planejador mandou. Nada foi
consertado ainda; nada em `viewport/` nem em `panels/` foi tocado.

**Ressalva de honestidade, e ela vale para o número.** O `ListAgents` das 00:39
mostra `PLANEJADOR · dd3937` e `EXECUTANDO · os quatro defeitos do uso` como
**`busy`**, e não ociosos. A medição é de um chão que pode ainda estar se
mexendo, e o número vale para as **00:40** (regra 25).

## O que a régua achou de si mesma, primeiro

A primeira passada acusou **25**, e **três eram inocentes**:

| Acusado | O que era |
|:---|:---|
| `ui/actions.ts:7` | o texto que **explica** o registro: *"o menu só pede `runAction('chavear')`"* |
| `ui/keys-dialog.ts:20` | o cabeçalho que explica o botão da paleta |
| `ui/actions.ts:67` | a **declaração** do próprio `runAction` |

> **Eu li o texto que fala do código como se fosse o código.**

É o terceiro erro da mesma família num dia — instrumento que mede o que não
devia. Conserto: `stripComments`, que troca comentário por espaços do mesmo
tamanho (as linhas continuam valendo) e pula texto entre aspas inteiro, senão
uma `//` dentro de um endereço comeria o resto do arquivo. Dois testes novos
trancam os dois.

**Restaram 22.**

## Os 22, cruzados com a tabela das ações

A régua diz **onde o clique cai**. Quem diz **se a queda pode acontecer** é o
`actions-table.ts`: uma ação `casca` ou `arranque` existe sempre; uma `painel`
pode não existir.

### O que importa: UM caso, e ele é um gesto de todo dia

| Onde | Ação | Por que é real |
|:---|:---|:---|
| `viewport/viewport.ts:1471` | **`tocar`** — `where: 'painel'` | **a barra de espaço.** Apertar e soltar sem arrastar toca ou pausa. Com a aba da linha do tempo fechada, a ação não existe, `runAction` devolve `false`, e **o espaço não faz nada e não diz nada** |

**É o único dos 22 com id escrito que pertence a um painel** — ou seja, o único
que a tabela prova que pode sumir. E é um gesto que o Humberto usa o tempo todo.

**Fora de tudo o que sabíamos.** Não estava na pesquisa de 18/09, não estava nos
quatro defeitos de 19/09, e não estava no meu desenho de ontem: eu tinha
apontado o menu flutuante e os botões de ícone, e o que apareceu foi **a
tecla**.

### Os que existem sempre — candidatos a exceção, não a conserto

| Onde | Ação | Registro |
|:---|:---|:---|
| `panels/tree.ts:318` | `nova-regra-guiada` | `arranque` |
| `panels/tree.ts:321` | `nova-pele` | `arranque` |
| `panels/tree.ts:345` | `duplicar` | `arranque`, **cinza "sem nada escolhido que se duplique"** |
| `panels/palette.ts:207` | `abrir-pasta` | `casca` |
| `panels/dopesheet-player.ts:131` | `detalhes-faixa` | `casca` |

As duas primeiras eram o defeito 2, e o conserto do outro chat as resolveu: elas
agora existem sempre. **O `duplicar` merece um olho**: ele existe sempre, mas
fica desligado sem seleção — e aí `runAction` devolve `false` do mesmo jeito. Se
o botão de ícone não estiver cinza junto, o clique é engolido.

### Os cinco novos, escritos hoje, e um buraco de tabela

| Onde | Ação |
|:---|:---|
| `panels/rules-actions.ts:38` · `panels/skins-actions.ts:158` · `panels/skins.ts:129` · `panels/dopesheet.ts:442` e `:1252` | `mostrar-painel-*` |

Nasceram no conserto de hoje. São registrados na casca, junto do `painel-*`, e
por isso **existem sempre** — inofensivos na prática.

**Mas a minha régua não consegue prová-lo**, e isso é um achado próprio:
`mostrar-painel-*` **não está no `actions-table.ts`** (e está certo que não
esteja: a tabela é das ações de menu). Então há **ações registradas que tabela
nenhuma descreve**, e nenhuma régua sabe julgar a disponibilidade delas.

### Os dez com o id numa variável

`dopesheet-player.ts` (194, 625, 720) · `draw-order.ts:211` · `tree.ts:586` ·
`shell-file.ts:785` · `shell.ts:610` · `viewport-toolbar.ts:132` ·
`viewport.ts:622` e `:1101`

A régua vê a queda e **não sabe de que ação se trata** — o id vem de uma lista.
Cada um precisa de um par de olhos. **O `shell.ts:610` é o menu da barra**, e é
o primeiro a entrar em `EXEMPT_CALLS`: o botão dele já nasceu cinza.

### O único `olha-e-cala`

`ui/shell.ts:2958`, o `runShortcut`: olha o `false` e deixa a tecla livre, sem
dizer nada. **É exatamente o caso que o Planejador decidiu** na seção da tecla,
e o conserto dele já está escrito ali.

## O que eu concluo, e o que não é meu decidir

**A régua vale um lote de conserto** — mas pequeno, e não pelo tamanho da lista:
pelo `tocar`. Um caso real, num gesto de todo dia, que quatro varreduras não
acharam. O resto são exceções a escrever e dez linhas a olhar.

Se o Humberto ou o Planejador acharem que a fila é outra, a lista fica aqui
escrita, com hora, e não se perde.

---

## A QUARTA RÉGUA — "existir não é funcionar"

**Achada pelo `EXECUTANDO · os quatro defeitos do uso`, em 22/09, com o defeito
na mão.** O crédito é dele, e a forma, dita por ele, é esta:

> **Dei porta à ação e deixei o corpo dela dependendo da tela.**

Depois de fazer as nove ações da aba Regras existirem **no arranque**, elas
ainda voltavam **mudas na primeira linha**:

```
const doc = this.doc;
if (doc === null) return;
```

Sem o painel montado não há `this.doc`. **A ação existia, rodava, e não fazia
nada.**

### Por que esta régua NÃO cobre isso, e não é só uma questão de esticá-la

São **dois silêncios diferentes, no mesmo caminho**:

| Régua | Pergunta | Onde o silêncio mora |
|:---|:---|:---|
| **esta** | o clique é engolido por **quem chama**? | `runAction` devolve `false` e ninguém olha |
| **a quarta** | quem **atende** o clique consegue trabalhar? | a ação roda até o fim e não faz nada |

Para a minha régua, uma ação registrada que roda **passou**: `runAction`
devolveu `true`, o caminho foi honesto. O buraco está depois, dentro do corpo —
e nenhum exame da linha de chamada alcança lá.

### O que torna a quarta difícil, e o fio que eu deixo

**Um `return` mudo é idêntico a um `return` legítimo.** `if (doc === null)
return;` é o guarda certo em cem lugares do programa. Uma régua que acusasse
todo `return` cedo seria ruído puro — e **ruído ensina a ignorar aviso**, que é
a mesma armadilha que decidiu a tecla nesta página.

**Mas há uma dobra onde o defeito se denuncia sozinho, e ela já está escrita no
disco:**

> O `actions-table.ts` **promete** `where: 'arranque'` — *"esta ação existe com
> qualquer aba fechada, e num teste sem navegador"*. O corpo que lê `this.doc`
> de um painel **desmente a promessa**.

Isso é medível sem navegador e sem adivinhar, porque **não se julga o `return`
— julga-se a promessa contra o corpo**. A tabela é a afirmação; o corpo é o
fato. Onde os dois discordam, um dos dois está errado, e alguém tem de olhar.

E há a prova que a casa já sabe fazer, e que é a melhor das duas: **rodar a ação
com o registro montado e nenhum painel**, e exigir que o documento mude — ou que
o rodapé diga por que não mudou. O `acoes.test.ts` já roda as de arranque sem
painel nenhum; o que falta é ele **exigir efeito**, e não só que a ação exista.

### O terreno já coberto, medido às 00:48 — não cobrir duas vezes

O `EXECUTANDO · os quatro defeitos do uso` implementou **metade dela** dentro do
lote dele, em `editor/testes/acoes.test.ts`:

> *toda ação de arranque, sem painel nenhum, ou muda o arquivo ou diz por que
> não.*

**É um bom teste**, e julga a promessa contra o fato, que é o caminho certo. Ele
ainda escreve `ESPERAM_JANELA` — as que terminam numa janela e que um teste sem
navegador não vê —, em vez de deixá-las passar caladas. Isso é a regra 21
aplicada ao próprio teste.

**Mas ele exercita menos do que o nome dele promete, e isto é medida, não
palpite:**

| Medida, às 00:48 | Número |
|:---|:---:|
| Ações de `arranque` | **37** |
| Que **rodaram** com nada escolhido | **22** |
| Que saíram **cinzas** e o teste pulou (`continue`) | **15** |
| Dessas 15, exercitadas à mão em outro teste do mesmo arquivo | 7 |
| **Nunca exercitadas em lugar nenhum** | **8** |

As oito: `novo-ponto-no-slot` · `novo-caixa-no-slot` · `limpar-slots-vazios` ·
`descer-ordem` · `frente-de-tudo` · `tirar-da-pasta` · `copiar-ordem-animacao` ·
`copiar-pose-escolhido`.

**A forma disto, e ela é a regra 28:** `if (!runAction(id)) continue;` trata o
cinza como resposta — e **está certo**, cinza é resposta. Só que uma ação que
está cinza em **todo** estado que o teste sabe montar nunca tem o corpo
exercitado, e mesmo assim o verde entra num relatório com o nome *"toda ação de
arranque"*. **O nome promete 37; o que roda são 22.**

### O que falta, então, e é o desenho da quarta

| Falta | Por quê |
|:---|:---:|
| **as 8 que nunca rodam** | dar-lhes o estado de que precisam (uma seleção, uma animação aberta) e então exigir efeito. É onde um corpo preso ao painel se esconderia hoje |
| **dizer quantas rodaram** | o teste devia **afirmar o número** que exercitou, e não só passar. Um número escrito cai quando alguém o muda sem querer; um `continue` silencioso, não |
| **as 69 de `casca`** | não têm exigência de efeito nenhuma. A tabela: `casca=69`, `painel=92`, `arranque=37`, `submenu=11` |

**As de `painel` ficam de fora, e é o desenho certo**: elas existem por causa do
painel, e exigir que trabalhem sem ele seria exigir o contrário do que a tabela
promete.

### A ordem, quando alguém a escrever

1. **Antes de consertar**, rodar e anotar a lista, como nesta.
2. Não aceitar verde: os casos conhecidos estão sendo consertados **agora**.
3. Código de mentira, com a diferença numa pinça — a mesma ação, com e sem o
   corpo que depende da tela.
4. Não medir a própria tabela junto com o código que ela julga.

---

## A QUINTA — "a ação que tabela nenhuma descreve"

**Não é para agora**, e fica escrita para não se perder. Achada de lado na
medição das 00:40.

`mostrar-painel-*` é **registrado** e **não está no `actions-table.ts`** — e
está certo que não esteja: a tabela é das ações que têm item de menu, e essa não
tem. Mas então:

> **Há ações registradas que tabela nenhuma descreve, e nenhuma régua sabe
> julgar a disponibilidade delas.**

Toda régua deste documento pergunta *"a tabela promete X; o código faz X?"*. Uma
ação fora da tabela não promete nada — e por isso não pode ser desmentida. Ela
é invisível para as quatro.

Hoje são cinco linhas, todas registradas na casca e portanto inofensivas. O
risco não é o número: é **o caminho estar aberto**. Nada impede a próxima ação
interna de nascer dentro de um `mount()` e ninguém notar, porque não há onde
notar.

---

## Uma coisa que fica escrita e não é desta régua

`panels/tree-rows.ts` tem duas funções mortas (`attachmentRows`,
`constraintRows`): ninguém as chama. Achadas pelo vigia do comando em 22/09,
não apagadas porque o arquivo não era cerca minha. Continua sem dono.
