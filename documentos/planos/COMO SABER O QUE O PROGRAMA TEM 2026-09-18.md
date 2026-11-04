# Como saber o que o programa tem — proposta do Planejador — 18/09/2026

Escrito pelo `PLANEJADOR · dd3937`, a pedido do Humberto, em cima da pesquisa
`documentos/pesquisa/O QUE O CODIGO TEM E O MENU NAO 2026-09-18.md`.

**A pesquisa está certa no diagnóstico.** Há comando com teste verde que nenhum
menu chama. Discordo em um ponto do remédio, e o motivo é uma coisa que já está
no disco e que muda a conta.

---

## O que já existe, e quase ninguém sabe

**O programa já tem uma busca de comandos**: **Ajuda → Paleta de comandos**, ou
`Ctrl+Shift+P`. O comentário dela em `ui/shell.ts` diz, com todas as letras, que
ela existe para responder *"eu sei que existe, mas em qual menu está?"*.

Isso importa para a pergunta do Humberto de duas maneiras, e as duas são úteis:

| | |
|:---|:---|
| **A ferramenta de achar já está feita** | não é preciso inventar nada para "achar as coisas". A busca ignora acento (`fold`) e filtra por pedaço do nome |
| **E ela mesma é um exemplo do problema** | ela responde exatamente a dúvida dele, e ele não sabia que existia. Uma porta que ninguém encontra é uma porta que não conta |

**Então o buraco não é falta de ferramenta de busca. É outro, e mais fundo.**

---

## O buraco, dito em uma linha

> **A paleta lista AÇÕES REGISTRADAS. Um comando que nunca virou ação não chega
> nela — nem no menu, nem na tecla, nem no botão direito. Ele não existe para
> ninguém, e mesmo assim tem teste verde.**

É a regra 28 na casca: *"provei o comando" e "entreguei a função" são coisas
diferentes*. O teste prova que o comando funciona. Ele não prova que alguém
consegue chegar nele. E o `ui/action-audit.ts` não pega isso, porque ele parte
das **ações** — quem nunca virou ação passa por baixo.

Os seis achados da pesquisa são todos desse feitio: trocar a cadeia de uma IK,
gravar chave de alvo, apagar e renomear etiqueta, tirar a chave de troca de
corpo, importar imagens.

---

## A proposta, em três partes

Da mais barata para a mais cara. **As três são independentes**: a 1 já resolve o
que o Humberto perguntou, e pode ir sozinha.

### 1. Um vigia que parte do COMANDO, e não da ação

Um teste novo, irmão do `action-audit`, com a régua invertida:

> **Todo `Command` do documento é alcançável por alguma ação — ou está numa
> lista de exceções, com o motivo escrito ao lado.**

A lista de exceções é obrigatória e é o coração: `EXEMPT` já existe para as
ações, com `{ action, why }`. Aqui seria `{ command, why }`, e o `why` tem de
dizer **por quê** — *"peça interna do Colar"*, *"resto do formato antigo, a
apagar"*, *"porta prevista no degrau tal"*. Sem motivo escrito, o teste falha.

**O que isso compra:** o buraco de hoje não volta, e os seis de agora viram uma
escolha consciente — ou ganham porta, ou ganham linha com motivo. **Nenhum some
em silêncio.**

**Custo:** um lote. Cerca: `ui/action-audit.ts` (ou arquivo irmão) e o teste.

### 2. Uma folha que o Humberto lê

Uma página gerada do código — **nunca escrita à mão**, porque à mão ela
envelhece no dia seguinte e passa a mentir.

**Por TAREFA, e não por menu.** A pergunta dele nunca é *"o que tem no menu
Animação?"*; é *"como eu faço a arma trocar de mão?"*. Três colunas:

| Para fazer isto | Clique aqui | Provado |
|:---|:---|:---:|
| (a tarefa, na língua dele) | (o caminho: menu, tecla, botão direito, ou a paleta) | (sim/não) |

- A **coluna 2** sai das tabelas que já existem: `menus.ts`, `keys.ts`,
  `actions-table.ts`, `CONTEXT_ACTIONS`.
- A **coluna 3** sai do roteiro, que já abre o editor de verdade e clica.
- A **coluna 1** é a única que precisa de mão humana — e **é o trabalho**: dar
  nome de tarefa a cada ação, na língua dele.

**Custo:** um lote para o gerador, e uma passada de nomes que só o Humberto (ou
alguém com a voz dele) pode revisar.

### 3. A paleta deixa de ser um segredo

Se a busca já existe e ele não sabia, o conserto é de **tela**, não de código
novo: a paleta precisa aparecer onde a pessoa está perdida — a dica do menu
Ajuda dizendo o que ela faz, e a própria janela de Atalhos apontando para ela.

**Custo:** pequeno, e entra junto com qualquer lote de casca.

---

## Onde discordo da pesquisa, e por quê

| A pesquisa propõe | Eu proponho | Por quê |
|:---|:---|:---|
| A coluna "Função" vinda dos **planos** (o prometido) | A coluna vinda do **código** (o que existe), e o prometido-mas-não-feito numa lista **separada** | Misturar as duas faz a folha responder duas perguntas ao mesmo tempo e nenhuma direito. *"O que o programa faz"* e *"o que ainda falta"* são leituras diferentes, em momentos diferentes |
| "Feito" = tem linha na lista com clique provado | **Concordo inteiramente**, e acrescento: o vigia da parte 1 é o que torna isso **automático** em vez de depender de alguém lembrar | Régua que depende de disciplina humana apodrece; régua que é teste, não |

---

## O que nenhuma das duas propostas resolve, e fica escrito

| O quê | Por quê |
|:---|:---|
| **Botão que existe e não faz o que o nome diz** | Nenhum inventário pega isso. Só alguém usando |
| **Função alcançável só por gesto** (arrastar, segurar `P`) | Não tem linha em tabela nenhuma. A folha vai ter um buraco aqui, e é melhor escrevê-lo do que fingir que não há |
| **"Tem porta" não é "se acha"** | A parte 1 garante que existe caminho. Ela **não** garante que alguém o encontra. Essa medida é a mão do Humberto, e nenhum teste a substitui |

---

## A ordem que eu recomendo

1. **A parte 1**, sozinha, num lote. Ela para a hemorragia e é a única que impede o buraco de voltar.
2. **A parte 3**, de carona no próximo lote de casca.
3. **A parte 2** depois, quando houver fôlego para a passada de nomes — que é o trabalho de verdade dela.

**Nada disso abre sem a palavra do Humberto.**

---

## A armadilha do medidor — achada em 22/09, ao construir a parte 1

**Escrita aqui porque o próximo a cair nela é quem fizer a parte 2**, e essa
pessoa pode não estar viva quando isto acontecer.

O vigia da parte 1 nasceu **verde**: zero comandos sem porta. Verde perfeito e
falso.

**A causa:** a lista de exceções, o `EXEMPT_COMMANDS`, **escreve o nome de cada
dispensado** — e o arquivo dela mora em `editor/src`, dentro do que o vigia
varre. Cada nome dispensado aparecia citado, e passava por *"alguém constrói
este comando"*. O instrumento estava se medindo junto com o que mede.

> **O nome numa lista de exceções não é uma porta — é a confissão de que não há
> uma.** — do chat que escreveu o vigia

**O conserto foi de uma linha** (`O_PROPRIO_VIGIA`, tirando o arquivo da
varredura). O que não é de uma linha é a forma:

> **Todo instrumento que se mede junto com o que mede dá verde.**

### Por que isto atinge a parte 2 em cheio

A folha "o que o programa faz, por tarefa" tem a **coluna 1 escrita à mão**, e
ela vai **citar os mesmos nomes** que julga. Um gerador que varra o projeto
atrás de *"esta função é usada?"* vai achar a própria folha e dizer que sim.

**Quem escrever a parte 2 começa por aqui:** o que o medidor lê **nunca** inclui
o que o medidor escreve. E a prova disso é a regra 26 — o medidor tem de nascer
**vermelho**, com os casos conhecidos na cara. Se nascer verde, ele está se
medindo.

---

# Desvios — escritos pelo executor, `EXECUTANDO · o vigia do comando sem porta`

Lotes 1 e 2, na noite de 21 para 22/09/2026. **Nada aqui é decisão minha
tomada por cima do plano**: é o que eu achei no caminho, e o que eu deixei de
fazer, com o motivo.

## 1. A dica de um item de menu LIGADO nunca chegava à tela

**Este é o achado do lote 2, e ele vale mais que o lote.**

A regra 12 da casa é *"botão sempre com nome na dica"*. Nós a cumpríamos **por
escrito e não na tela**: o `whyDisabled` da casca (`ui/shell.ts`) só usava a
`hint` quando o item estava **cinza**. Para um item vivo ele devolvia `null`, e
o `title` caía na linha de baixo, que escreve só o nome e a tecla.

| Dica | Escrita desde | Aparecia |
|:---|:---|:---|
| "Problemas do arquivo…" | degrau 11, lote 6 (18/09) | **nunca** |
| "Paleta de comandos" | este lote (22/09) | nunca, até o conserto |

**Nenhum teste pegaria.** A dica estava lá, no objeto, escrita certinho. O
campo existia, o valor estava certo, e nada daquilo chegava a ninguém.

**Eu a achei indo FOTOGRAFAR a dica nova e não a encontrando na tela.** É a
regra nova do Humberto, de 21/09, dando o primeiro resultado que ninguém
previu:

> **Lote sem foto não fecha — e a foto não serve só para ele ver. Serve para
> NÓS vermos.**

Conserto: quatro linhas em `ui/shell.ts`, e a tecla continua junto da dica.

## 2. "A porta que engole o clique" — régua nova, e ela NÃO entrou aqui

Um terceiro estado que nenhuma das réguas de hoje enxerga: **a ação que existe
às vezes.**

| Régua | Pergunta | O que escapa |
|:---|:---|:---|
| `hiddenFunctions` | toda ação registrada tem porta? | a que não está registrada agora não entra na lista |
| o vigia do comando | todo comando é construído? | ele é — pelo `mount()` de um painel que pode nunca montar |
| **nenhuma** | a porta **funciona quando se aperta**? | o menu chama, `runAction` devolve `false`, ninguém olha o retorno |

> Um item de menu que aponta para uma ação `needsPanel` e **não fica cinza**
> com o painel fechado é uma porta que engole o clique em silêncio.

É medível sem navegador, com as tabelas que já existem: o `actions-table.ts` já
traz `where: 'painel'` e `needsPanel`. Falta alguém **julgar**. Fica para um
lote próprio, autorizado pelo Planejador em 22/09, e nasce no molde do vigia:
**vermelha**, com os casos conhecidos na cara.

## 3. Os três programas, antes de mexer na tela

Regra do Humberto: todo gesto de tela se olha primeiro em Spriter, Spine e
DragonBones. **Só afirmo o que está escrito na pesquisa desta pasta.**

| Programa | O que a pesquisa CONFIRMA | O que ela NÃO confirma |
|:---|:---|:---|
| **Spriter** | `Find/Create Variable` — a busca fica **ao lado da coisa buscada**, com o botão de criar do lado | o menu Help não foi confirmado (`menu/01 Spriter Pro`, linha 31) |
| **Spine** | `Find and replace` e `Text search`, **dentro da árvore** — busca de nomes, não de comandos | o menu Help não aparece na pesquisa |
| **DragonBones** | `Refine Search` no painel de parâmetros (some com o que não interessa) e `Ctrl+F` buscar/substituir | o menu Help: *"não confirmado"* (`menu/03`, linha 34) |

**Nenhum dos três tem paleta de comandos confirmada na nossa pesquisa.** O que
os três fazem igual, e é o que eu segui: **a busca mora ao lado de quem está
perdido**, e não só num item de menu. Foi daí que saiu o botão na janela de
Atalhos, em vez de só a dica.

**Não afirmo** que eles não tenham paleta — afirmo que a nossa pesquisa não diz.
Quem quiser fechar isso abre os três programas.

## 4. O que eu NÃO fiz, e por quê

| Não fiz | Por quê |
|:---|:---|
| **Renomear "Paleta de comandos"** para "Procurar um comando…" | é o nome que mais atrapalha quem está perdido — palavra de programador. Mas o rótulo está na lista do manual (`ajuda.test.ts`), e o manual **não se toca sem o Humberto pedir**. Proposta, não desvio |
| **Fazer a busca achar pela DICA** | a dica é onde moram as palavras da língua dele, e pô-la no `haystack` do `filterCommands` é uma expressão. Mas o encargo diz *"sem código novo de busca"*, e isso muda o que a busca acha. Proposta |
| **Mudar a ordem do menu Ajuda** | pôr a Paleta no topo é ganho real de achabilidade, e é gosto — gosto é dele. E mexeria num teste que hoje tem um vermelho alheio dentro |
| **Dar porta aos seis comandos do lote 1** | o encargo proíbe inventar porta. Todos saíram como exceção com o motivo `porta ainda não decidida` |

## 5. A foto do "antes" do lote 2 não existe, e a razão fica escrita

O `--programa` do `foto-da-tela.mjs` existe para fotografar a **versão fechada
anterior**. Às **00:10 de 22/09** o `programa/` foi remontado por outro chat, e
o build passou a ter o meu botão dentro: o "antes" deixou de ser anterior.

Não troquei arquivo debaixo da suíte do outro chat para recuperá-lo — seria
fazer o vermelho dele por um motivo que ele não teria como achar (regra 24).

**Régua que fica:** *quem remonta o `programa/` tira de todo mundo a foto do
"antes".*

O par entregue é honesto e responde a pergunta dele: a janela de Atalhos **com**
o botão, e a paleta que o botão abre, com `pele` digitado e sete comandos na
lista. Em `backup/fotos-paleta/`.


---

# Desvios da PARTE 2 — escritos pelo executor, `EXECUTANDO · a folha por tarefa`

Um lote, na madrugada de 22/09/2026, v22.1. **Nada aqui é decisão minha tomada
por cima do plano**: é o que eu achei no caminho, e o que deixei de fazer.

## 1. A armadilha me pegou noutra forma — e a que estava escrita não cobria

A seção acima manda o próximo começar por *"o que o medidor lê nunca inclui o
que o medidor escreve"*. Comecei por ali: `AS_PROVAS` é uma lista de **nomes de
arquivo**, nunca uma pasta, porque o `roteiro-30.mjs` é vizinho de porta do meu
gerador. Está certo, e um teste julga.

**E a armadilha entrou por outro lado**, que aquele aviso não cobria:

> **Eu tomei "a tecla foi apertada" por "a ação rodou".**

A coluna Provado nasceu com dez verdes. **Três eram falsos**, e os três só
apareceram porque a pergunta foi *"o que este verde PROVA?"*, e não *"por que
este verde é explicável?"*:

| O verde | O que ele provava de verdade |
|:---|:---|
| `novo` | **nada**: o `runAction('novo')` estava dentro de um **comentário** do roteiro |
| `desmarcar` | que o roteiro aperta `Esc` — mas quem come o `Esc` é a ferramenta na mão, e isso não está em tabela nenhuma |
| `virar-filho` | que o roteiro segura `P` — que é o **gesto** `pegar-filhos`, não a ação do menu que declara a mesma tecla |

O primeiro é a armadilha da parte 1 em miniatura: **o medidor leu o que alguém
escreveu SOBRE a prova, e não a prova.** Os outros dois são a forma nova.

Conserto: a tecla deixou de contar como prova e passou a sair como `~` — uma
quase-prova com o nome dela, medida e nunca chamada de prova. De dez verdes
sobraram **seis**, e os seis são verdade.

**A régua que fica, para quem fizer a parte 3 ou qualquer medidor:** *toda
medida que passa por um intermediário decidido em tempo de execução — a tecla, o
foco, a ferramenta na mão, o painel montado — não é prova daquilo que está do
outro lado dele. É prova do lado de cá.*

## 2. O teste NÃO nasceu vermelho, e o motivo importa

O encargo diz: *"a prova disso é ele nascer VERMELHO, com os casos conhecidos na
cara. Se nascer verde, ele está se medindo."* O meu fecha **verde**, e não é
porque ele se mede.

O que nasceu vermelho foi a **folha**: 196 de 209 ações sem nome de tarefa, com
os nomes impressos. Ficou verde quando eu escrevi os 200 nomes, que é o trabalho
que o plano diz ser *"o trabalho de verdade"* desta parte.

Como isso não vira desculpa, quebrei cada guarda de propósito e conferi que o
vermelho sai **no caso certo** — cinco experiências, cinco vermelhos, arquivo
devolvido ao original e conferido. A tabela está no `CHANGELOG`, na v22.1. O
script das experiências não ficou na pasta: a cópia de segurança da régua está
em `backup/tarefas_2026-09-22_antes-das-provas-de-vermelho.ts`, listada no
`INDICE.md`.

**E houve um sexto vermelho que não foi de propósito**, e é o que eu mostraria a
quem duvidar da folha: o caso *"toda tarefa começa por verbo, e não pelo nome do
menu"* pegou **quatro nomes meus** — *"Escolher tudo"*, *"Desescolher tudo"*,
*"Destravar tudo"*, *"Afastar-se"*. Eram o rótulo do menu com um verbo na
frente. Reescritos.

## 3. Uma correção ao plano: a Paleta não lista ações registradas

O plano diz, na linha do buraco: *"A paleta lista AÇÕES REGISTRADAS."* Ela não.
O `filterCommands` de `ui/palette.ts` percorre os **menus**.

A conclusão do plano **não muda** — um comando que nunca virou ação não chega à
paleta —, mas o limite é mais estreito do que está escrito: uma ação que só
tivesse botão na barra ou no botão direito **também** não apareceria nela. E a
Paleta é justamente o que se abre quando não se sabe onde a coisa está.

Hoje não há nenhuma nesse caso: as 200 têm item de menu. A folha tem a seção
pronta, e ela imprime sozinha no dia em que houver.

## 4. Catorze ações estavam desaparecendo da folha em silêncio

Os itens que só abrem submenu (`Novo`, `Exportar`, `Tema`, `Física`…) são
dispensados por uma régua automática, com o motivo escrito no código. **E o
relatório imprimia só a lista escrita à mão**, que está vazia: as catorze não
apareciam em lugar nenhum da folha. Quem lesse concluiria que a folha cobre 200
de 200.

Conserto de uma linha, e a forma: **um relatório que imprime a lista das
exceções em vez das linhas dispensadas esconde tudo o que uma régua automática
dispensa.** *Nada some sem estar listado* vale para dentro do gerador também.

## 5. Malha e pesos não tem uma linha, e a folha diz isso

Nada de malha nem de pesos tem item de menu, tecla em tabela ou botão na barra:
é tudo botão dentro do painel. A folha **anuncia o assunto que ficou de fora**, e
o teste exige que a lista dos assuntos vazios seja exatamente essa, por escrito
— assim o dia em que um segundo assunto cair fora, alguém fica sabendo.

Não é defeito do programa: é o limite da folha, e ele agora tem nome.

## 6. O que eu NÃO fiz, e por quê

| Não fiz | Por quê |
|:---|:---|
| **Tocar em `editor/src`** | nem uma linha. Havia três chats lá. Os dados que faltavam, eu li das tabelas que já existem |
| **Dar porta às tarefas sem porta** | não há nenhuma hoje, e se houvesse, inventar porta é a decisão do Humberto (parte 1) |
| **Pôr a folha no `README` ou no `ESTADO`** | não é minha cerca. Proposta ao Planejador: a folha merece uma linha na tabela "leia nesta ordem" do `CLAUDE.md`, porque é o papel que responde *"o que o programa faz"* |
| **Fazer a Paleta buscar pela DICA** | é mexer em `editor/src`. Mas é a proposta que eu levo com mais convicção: as **dicas dos menus** já estão escritas na língua dele, e a busca não as lê. Metade da folha sairia de graça dentro do programa |
| **Fechar a medição com a casa vazia** | havia quatro chats trabalhando. Os números que eu relato têm hora, e quem fechar remede (regras 24 e 25) |

## 7. O chão se moveu debaixo de mim três vezes, e isto é o registro

A contagem de ações do programa mudou **enquanto eu media**: 209 às 00:51, 210
às 00:54, 214 às 01:00. Não foi erro de ninguém — eram os chats das partículas e
dos efeitos entregando `novo-emissor`, `efeito-flash`, `efeito-pulso` e
`efeito-tremor`.

**A folha aguentou porque ela lê o código na hora**, e os quatro nomes novos
apareceram como *"falta nomear"*, com o nome na cara, em vez de sumirem. É
exatamente para isso que ela não é escrita à mão.

O que eu levo: **um medidor que lê o vivo não precisa que a casa pare; um
relatório escrito à mão, sim.** E o número de fecho continua precisando (regra
24) — por isso os meus têm hora.

---

## CORREÇÃO ao que este plano afirma, e ela está no corpo do texto — 22/09, 01:12

**Este plano diz, na seção "O buraco, dito em uma linha":**

> *"A paleta lista AÇÕES REGISTRADAS."*

**Está errado.** Ela percorre os **MENUS** — `filterCommands` recebe
`allMenus(...)` e anda pelas entradas, nunca pelo registro de ações. Medido no
`ui/palette.ts` pelo chat da folha por tarefa; o erro é do Planejador, e fica
escrito aqui porque é aqui que alguém vai lê-lo.

**A conclusão do plano não muda** — um comando que nunca virou ação também não
tem item de menu, então continua fora da paleta. Mas **o limite é mais estreito
do que o texto diz**, e o estreitamento importa:

> Uma ação que tenha **só botão na barra ou no botão direito**, e nenhum item de
> menu, **também não aparece na paleta**.

Hoje não há nenhuma — o `hiddenFunctions` exige porta, e as quatro do
`CONTEXT_ACTIONS` têm menu. Se um dia houver, é um buraco na **única ferramenta
de achar que o programa tem**, e ninguém notaria: a paleta continuaria
respondendo, só que sem aquela linha.

**Quem for mexer nisso:** a régua já existe e é de uma linha — cruzar
`registeredActions()` com os ids que `filterCommands('')` devolve. Fica como
candidata, não como lote aberto.

## A parte 2 ficou metade mais barata — 22/09, 01:12

A coluna 1 da folha *"por tarefa, na língua dele"* é o trabalho caro deste
plano: dar nome de tarefa a cada ação. **Metade dela já estava escrita e
ninguém a lia** — são as **55 dicas** dos menus, todas em português de quem usa.

Desde a v22.4 a **paleta busca nelas**. Quem digita `descendentes` acha
*"Os filhos"*; quem digita `zipa` acha *"Salvar como pacote"*. Nenhuma lista
nova, nenhum cadastro: a dica já estava lá.

**E ela aparece na linha da paleta**, ao lado do nome do menu — senão o comando
surgiria sem explicação, que é a regra 21 pelo avesso: não é o programa
adivinhando, é ele acertando e **não contando por quê**.

Foto: `backup/fotos-paleta/3-a-paleta-acha-pela-dica.png`.
