# Quatro defeitos achados no uso — 19 e 21/09/2026

Achados pelo chat `EXECUTANDO · manual simples das funções`, às 06h de 19/09,
**conferindo o manual com o programa aberto** — não por teste. Medidos no editor
de desenvolvimento, herói aberto, casa vazia, com o estado limpo visto antes de
cada um (regra 26). **Nenhum código foi tocado.**

Detalhe em `documentos/MANUAL SIMPLES 2026-09-19.md`, quadro "Cuidado" e parte 19.

**Nenhum destes aparecia na suíte**, que estava em 3.801 com 1 vermelho
conhecido. É a regra 28 na prática: o verde era explicável e não provava isto.

---

## 1. Desfazer perde o osso — e o arquivo fica inválido

**O gesto:** criar osso (`B`) → `Ctrl+D` → desfazer duas vezes.

**O que acontece:** o osso criado **fica no arquivo**, com a pilha de desfazer
vazia. Refazer cria um **segundo osso de mesmo nome**, e o validador acusa
`parent cycle through bone`.

**A forma:** `CreateBone.revert` (`viewport/tools/create-bone.ts:79`) procura
`indexOf(this.def)` — **por referência**. O `revert` do Duplicar repõe
`beforeBones`, que são **cópias**, e a referência morre.

> **A forma do erro, e é o que mais importa aqui: `revert` por identidade de
> objeto.** Ela quebra sempre que um comando que "restaura a lista inteira" for
> desfeito depois dele. **Vale varrer todo comando com essa forma** — é a regra
> 27 valendo: pega-se a forma e procura-se na casa toda.

**Gravidade: a maior dos três.** Os outros dois atrapalham; este **deixa o
arquivo inválido**, e o usuário não tem como saber.

---

## 2. "Regra…" e "Pele" fecham a aba em vez de abri-la

**O gesto:** Esqueleto → Novo → **Regra…**, com a aba Regras **na frente**.

**O que acontece:** a aba fecha, e a janela Nova regra **não abre**. O mesmo com
Novo → **Pele**: cria a pele e fecha a aba Peles.

**A forma:** `runAction('painel-regras')` (`panels/rules.ts:125`) e
`runAction('painel-peles')` (`skins.ts:128`, `skins-actions.ts:158`) queriam
*"trazer à frente"* — mas `painel-*` **virou interruptor em 13/09**: aberto e à
frente = fecha. Com a aba atrás de outra, funciona.

**E há um terceiro estado, pior:** com a aba Regras **fechada**, o Regra… e os
quatro botões de Física **não fazem nada e não avisam** — ação de painel que não
existe. É a regra 21: nem desenho, nem aviso, nem nada.

---

## 3. Chavear tudo no meio de uma curva estraga a curva

**O gesto:** animação `walk`, `t = 0,3`, `Ctrl+K`.

**O que acontece:** o rodapé passa de "Nenhum aviso" a **"2 avisos"** —
`curve cx1 0.33 outside [0.25, 0.3], clamped`. A chave nova **parte o trecho** e
a curva **não é repartida** junto.

Desfazer limpa. O `K` sozinho, num osso sem curva ali, não acusou.

---

## A varredura da forma — feita, e a lista é curta

Pedida pelo Planejador e feita pelo mesmo chat, **só leitura**, em dez minutos.
Por `grep`: `indexOf(this.…)`, `!== this.`, `includes(this.`, e quem repõe lista.

| Onde | O quê |
|:---|:---|
| **Acha o seu pelo objeto** (a forma do defeito 1) | `create-bone.ts:80` (é o defeito 1), `:148`, `:190`, e `doc/drop-entity.ts:152` — este na lista de **slots** |
| **Repõe a lista com cópias** (mata a referência alheia) | `doc/duplicate.ts:255-264` (o par do defeito 1), `panels/draw-order-model.ts:328/337` (par **provável** do `drop-entity`: soltar entidade → mudar a ordem → desfazer 2×), `tree-commands.ts:51-54`, `skins-model.ts:315`, `pose-mode.ts:100` |
| **Repõe, mas com os mesmos objetos** — não é a forma | `doc/reparent.ts:186` e `:238` |

**Todo o resto que o `grep` trouxe compara por NOME** (`find(b => b.name === this.name)`) e está fora de perigo.

**O tamanho do conserto:** trocar **quatro** `indexOf(objeto)` por busca por
nome. O lado das cópias não precisa mudar se o outro mudar.

### O limite desta varredura, escrito pelo próprio autor

> O `grep` só acha a forma **escrita daqueles jeitos**. Há 78 `revert(` em 28
> arquivos, e eles **não** foram lidos um a um — isso custa cerca de uma hora.

**E há uma saída melhor do que ler os 78** — proposta do Planejador, pela lição
do degrau 12 (*prender a propriedade, não o lugar*):

> **Um teste de propriedade sobre a pilha de desfazer.** Para cada par de
> comandos: aplicar A, aplicar B, desfazer duas vezes, e exigir que o documento
> volte **byte a byte** ao estado inicial. Isso pega a forma **sem ler arquivo
> nenhum**, pega as que o `grep` não sabe escrever, e pega as que ainda não
> existem — inclusive as que alguém escrever no ano que vem.

Ler os 78 acha o que há hoje. O teste acha o que houver sempre. **O segundo é
mais barato e vale mais.**

---

---

## 4. A pele liga, diz "ligada", e nada muda — achado em 21/09

**Achado pelo `PLANEJADOR · dd3937`, abrindo o programa a pedido do Humberto**,
que disse não ver na tela o que estava sendo feito. Fotos em
`backup/fotos-peles-dota/`.

**O gesto:** aba Peles → arrastar a pele `armadura` da coluna **Feitas** para a
coluna **Ativas** (o cabeçalho manda: *"Arraste para Ativas para ligar"*).

**O que acontece:** o rodapé diz **"Pele 'armadura' ligada. Arquivo salvo."** e
**o personagem não muda nada.** Foto 2 igual à foto 1.

**A causa, e ela está certa por dentro:** `stackDrop` põe a pele **na posição em
que a mão soltou** (`panels/skins-model.ts:148`). Soltando no espaço vazio, ela
cai **embaixo** — e embaixo a `default`, com 23 desenhos, cobre os 3 da
armadura. A regra §4.4 (*a de cima vence*) está sendo obedecida à risca.

**Arrastando de novo, dentro da coluna, para cima da `default`: funciona** — e
troca o tronco, o cabelo e o rosto (foto 3).

### E há um segundo caminho, que funciona à primeira e ninguém acha

O painel **Exibição** tem uma caixa **"Mostrar"** por pele que chama
`stackAddOnTop` (`panels/view-panel.ts:540`) — **liga no topo, sempre funciona**.
O comentário da própria função diz: *"o que 'ligar' faz sem dizer onde"*.

> **Dois caminhos para a mesma coisa: o que se acha está errado, e o que
> funciona está escondido no painel de outra tarefa.**

### O conserto, e é pequeno

| # | O quê |
|:---:|:---|
| 1 | **Arrastar para a coluna Ativas passa a pôr NO TOPO.** A função já existe e já é usada pelo outro painel: `stackAddOnTop` |
| 2 | Soltar numa posição **escolhida** dentro da coluna continua valendo (é o gesto de reordenar, e é útil) |
| 3 | **Se a pele cair onde nenhum desenho dela aparece, o rodapé DIZ ISSO** em vez de dizer "ligada". É a regra 21: hoje ele afirma um efeito que não houve |

**Por que este é o mais importante dos quatro, apesar de não corromper nada:**
é o fluxo que o Humberto mais quer — montar o personagem e trocar peças, como
no Dota. Quem arrasta, lê "ligada" e não vê nada **conclui que peles não
funcionam** e para de tentar. Os outros três atrapalham quem já está dentro;
este manda a pessoa embora na porta.

## O que NÃO foi testado, e não é relato de defeito

Tocar, Prévia e a grade de trocar imagem — a janela estava escondida, e sem
`requestAnimationFrame` eles não correm. **Fica escrito que não foram vistos**,
em vez de passarem por verdes.

---

## O que isto prova sobre as provas

A suíte tinha **3.801 testes verdes** e o roteiro **14 de 14** quando estes três
foram achados. Nenhum deles é obscuro: são o segundo gesto que qualquer pessoa
faz. O que os achou foi **alguém abrindo o programa e usando**.

É a frase do fecho do degrau 12, agora com exemplo: *você só testa o que já lhe
ocorreu olhar* — e ninguém tinha pensado em desfazer duas vezes seguidas.

---

## O que já foi consertado — pelo `EXECUTANDO · os quatro defeitos do uso`

| Defeito | Versão | Fotos |
|:---:|:---|:---|
| **4** — a pele | **v20.8**, 21/09/2026 | `backup/fotos-defeitos/lote-1_antes.png` e `_depois.png` |
| **1** — desfazer perde o osso | **v21.0**, 22/09/2026 | `backup/fotos-defeitos/lote-2_antes.png` e `_depois.png` |
| **2** — a aba que fecha | **v21.3**, 22/09/2026 | `backup/fotos-defeitos/lote-3_antes.png` e `_depois.png` |
| **3** — a curva | **v21.4**, 22/09/2026 | `backup/fotos-defeitos/lote-4_antes.png` e `_depois.png` |

**OS QUATRO ESTÃO FECHADOS.**

**Defeito 4, o que ficou:** soltar na **coluna** Ativas põe **no topo**; soltar
numa **linha** ou na faixa "embaixo de todas" continua ordenando; e o rodapé
diz quando nada da pele aparece, com o nome de quem a cobre e o que fazer. A
decisão saiu do `addEventListener` e foi para `skins-model.ts`
(`dropOnColumn`, `dropAt`, `skinShowing`, `skinOnNotice`) — era por morar num
ouvinte de evento que o defeito atravessou 3.801 verdes.

**Um acerto de leitura minha, escrito pela FORMA (regra 27):** *contei o efeito
de uma pele só pelos desenhos que ela põe, e esqueci os que ela TIRA.* A
`armadura` do herói tem `hair: null` — o elmo tapando o cabelo — e a
`armadura_capa` **só** tem isso. A primeira versão da conta teria dito "nada
dela aparece" de uma pele que muda a cena. **Esconder também é um efeito**, e a
forma do erro é *contar só o que se acrescenta.* Vale procurar essa forma em
qualquer lugar que resuma "o que esta camada faz".

---

### Defeito 1: a varredura de 19/09 está SUPERADA, e em dois pontos

**Leia isto antes daquela tabela.** Ela achou quatro lugares; eram **oito**. E a
receita que ela deu conserta metade do problema.

#### A forma, escrita de novo — e esta substitui a de 19/09

> **Guardei uma CHAVE que o próprio programa pode reescrever.**

Não importa se a chave é uma **referência de objeto** ou um **nome lido do
objeto vivo**: importa se ela é **imutável desde que foi guardada**. As duas
quebram, por caminhos diferentes — e é por isso que a varredura não viu a
segunda:

| A chave | Quem a mata |
|:---|:---|
| a referência (`indexOf(this.def)`) | um comando que repõe a lista com **cópias**: todo `SnapshotCommand` faz isso |
| o nome lido do objeto (`this.def.name`) | o `renameEverywhere`, que troca o nome **por dentro do objeto** |

A receita de 19/09 — *"trocar `indexOf(objeto)` por busca por nome"* — conserta
o par que o defeito mostrou e **deixa o par `criar osso → renomear osso` de
pé**. Quem a aplicar daqui a um mês vai achar que varreu. **O conserto é copiar
o nome para um `string` no CONSTRUTOR e nunca mais lê-lo do objeto vivo.**

#### Os quatro lugares que faltavam, e o pior deles

| Onde | Como escapou |
|:---|:---|
| `panels/tree-commands.ts:81` (`AddBone` da Árvore) | a tabela listou `tree-commands.ts:51-54` do lado das **cópias** e **não olhou o `revert` logo abaixo** |
| `panels/tree-commands.ts:106` (`AddSlot`) | idem |
| `panels/tree-commands.ts:198` (`AddSlotWithAttachment`) | idem |
| `panels/palette-model.ts:337` (`DropImageAsSlot`) | o `grep` não o trouxe |
| **`doc/reparent.ts`** | **foi ABSOLVIDO**: a tabela o pôs em *"repõe, mas com os mesmos objetos — não é a forma"* |

> **Uma lista que esquece deixa buraco; uma lista que ABSOLVE faz quem vem
> depois não olhar.** O Planejador leu aquela tabela e confiou nela duas vezes
> no mesmo dia. E a metade que dói: **uma varredura que olha só a metade da
> forma dá a sensação de ter varrido.**

#### E isto fecha a discussão sobre ler os 78 `revert(` à mão

Não valeria. Ler acha o que há **hoje**, e custa uma hora. O que achou os dois
lugares que nenhuma busca de texto acharia foi o **teste de PAR** — a
propriedade, não o lugar. Ele nasceu com **19 pares vermelhos** e fechou com
**0**; a suíte já provava, desde sempre, que cada comando sozinho volta byte a
byte, e os oito defeitos passaram por baixo disso.

---

## Desvios

| Quando | O quê |
|:---|:---|
| 22/09/2026 | **Encostei em cinco arquivos fora da minha cerca**, com autorização escrita do `PLANEJADOR · dd3937` na mesma madrugada: `panels/tree-commands.ts`, `panels/palette-model.ts`, `doc/reparent.ts`, e o teste `editor/testes/documento.test.ts`. Motivo dele, nas palavras dele: *um teste que nasce com um caso pulado permanente, apontando defeito de outro dono que ninguém marcou para consertar, é dívida com carimbo de qualidade*. Condição dele, cumprida: **cada lugar foi visto vermelho pelo nome do par antes de ser encostado** |
| 22/09/2026 | **Onde mora o teste de propriedade:** `editor/testes/documento.test.ts`. Ele atravessa partes (os comandos vêm da Árvore, da Ordem, da cena, das Peles), mas a **pilha de desfazer é do documento**, e o cabeçalho daquele arquivo já afirma a propriedade da ida e volta byte a byte. O de par é a mesma propriedade, com dois passos |
| 22/09/2026 | **Dois nomes que NÃO toquei**, avisados pelo Planejador porque estão na lista de exceções do chat `O vigia do comando sem porta`: `removeTimeline` (`anim/keying.ts:918`), o irmão singular do `removeTimelines` que é o usado; e `attachmentRows` (`panels/tree-rows.ts:232`), código morto. **Candidatos a limpeza, mas não num lote de conserto** — e apagá-los deixaria o teste do vigia vermelho, cujo conserto é no arquivo dele |

---

### Defeito 2: os três estados, medidos na tela — e um quarto lugar

Os três estados do relato de 19/09 **reproduziram exatamente**, medidos com o
gesto disparado na página:

| A aba Regras | Antes | Agora |
|:---|:---|:---|
| à frente | a aba FECHAVA, e a janela não abria | a aba fica, e a janela abre |
| atrás de outra | funcionava | funciona |
| **fechada** | a ação **não existia**; `runAction` devolvia `false` | a aba volta à frente, e a janela abre |

**Um terceiro lugar, que ninguém tinha visto, e quem o achou foi o guarda:**
`panels/dopesheet.ts`, linhas 438 e 1247 — o item *"Curva…"* e a ação
`interp-curva` **fechavam o painel Curvas** de quem tinha pedido para vê-lo.
Mesma forma, outra aba.

#### O rótulo já dizia, e ninguém leu assim

> O `acoes.test.ts` exigia, por escrito: *"nenhum painel registra uma ação de
> arranque ao montar; cada uma está escrita num `*-actions.ts`"*. A tabela
> chamava as nove de **"ação de painel"**, e o rótulo **estava certo: era o
> defeito escrito na tabela.**

É parente do que este mesmo dia já mostrou duas vezes: a informação estava
escrita e ao alcance, e ninguém a leu **antes** de agir.

#### Existir não é funcionar

Feita a ação existir, ela ainda **voltava muda na primeira linha** —
`const doc = this.doc; if (doc === null) return;` —, e sem painel montado não
há `this.doc`. O teste pegou: a ação existia, rodava, devolvia `true`, e a
variável não nascia.

> **A forma: dei porta à ação e deixei o corpo dela dependendo da tela.** Um
> teste que só pergunta *"a ação existe?"* teria ficado verde.

**E o teste passou a exigir EFEITO:** toda ação de arranque, sem painel nenhum,
ou muda o arquivo, ou **diz por que não**. Não se julga o `return`, que um
comando legítimo também usa: julga-se a **promessa contra o fato** — a tabela
afirma `where: 'arranque'`, que quer dizer *"vale com qualquer aba fechada"*, e
um corpo que só trabalha com o painel na tela desmente o que a tabela afirma.
As que terminam numa janela ficam **escritas** numa lista com o motivo, para
ninguém confundir *"não dá para medir aqui"* com *"passou"*.

---

### Defeito 3: o teste prende o MOVIMENTO, não o aviso

O aviso é o sintoma; **a curva redesenhada é o estrago.** O conserto é De
Casteljau: partir a Bézier no parâmetro `s` dá duas Béziers cujo desenho,
somado, é o de antes — exato. O `s` vem do **mesmo** `solveBezierParameter` do
runtime, ou a chave nova cairia num ponto que a Prévia e o jogo não desenham.

O teste amostra a animação em 201 pontos, de ponta a ponta. Contra o código de
antes ele acusa `t = 0.255: 86.0138 contra 86.0051` — quase nove milésimos num
movimento que ninguém mandou mudar.

#### Um verde explicável, na própria anotação de 19/09 (regra 28)

> *"O `K` sozinho, num osso sem curva ali, não acusou."*

Medido de novo: **continua verdade, e continua verdade pelo motivo errado.** O
`K` sozinho não era seguro — ele estava sendo usado num osso cuja linha não
tinha curva nenhuma naquele trecho. Com o `hips`, que tem, o `K` sozinho
acusava igual. A frase passou **por outro motivo que não o do nome dela**, e
quem a lesse concluiria que a tecla era inocente. É a regra 28 dentro de um
relato de defeito, e não de um caso de conformidade.

---

## O que ficou SABIDO e não consertado — leia antes de confiar no relato acima

Escrito em 22/09/2026 pelo `EXECUTANDO · os quatro defeitos do uso`, a pedido
do Planejador, depois de fechar os quatro.

**Os quatro defeitos foram consertados. Três frases do relato, não.** Elas
continuam escritas acima porque apagar relato é pior do que corrigi-lo — mas
**cada uma engana quem a ler**, e as três enganam do mesmo jeito: são verdade
pelo motivo errado, ou dizem o nome errado de uma coisa certa. É a regra 28
fora de um caso de conformidade: *o nome mente, e o nome é o que se lê.*

### 1. *"O `K` sozinho, num osso sem curva ali, não acusou"* — defeito 3

**Verdade, e verdade pelo motivo errado.** O `K` sozinho nunca foi seguro: ele
estava sendo usado num osso cuja linha **não tinha curva naquele trecho**, e aí
não há o que estragar. Medido com o `hips`, que tem curva em 0,25: **o `K`
sozinho acusava igual**, antes do conserto.

Quem lesse aquela frase concluiria que a tecla era inocente e que só o `Ctrl+K`
precisava de conserto. Ela está detalhada mais acima.

### 2. *"Troca o tronco, o cabelo e o rosto"* — defeito 4, a pele

**Errado em dois dos três.** Conferido no `formato/exemplos/heroi.bone`:

| O lugar | O que a `armadura` realmente faz |
|:---|:---|
| `body` | `path` vai de `body` para `armadura/body` — **troca mesmo** ✓ |
| `hair` | `hair: null` — **TIRA o cabelo**, não troca. É o elmo tapando |
| `head` | um `linkedmesh` apontando para **a mesma imagem `face`** da `default`. O rosto **não muda de aparência**: a entrada existe para o rosto continuar funcionando com a pele ligada — é encanamento, não troca |

A foto 3 mostra o herói **sem o cabelo**, e não com outro cabelo.

**Por que isto importa mais do que parece:** foi lendo essa frase que eu contei
o efeito de uma pele só pelos desenhos que ela PÕE — e a conta teria dito
*"nada dela aparece"* da `armadura_capa`, que só tem `hair: null`. **Esconder
também é um efeito**, e a frase do relato empurrava para o erro oposto.

### 3. *"O validador acusa `parent cycle through bone`"* — defeito 1

**Não reproduz.** Medido contra o código de **antes** do conserto, com o gesto
exato do relato (criar osso filho de `hips` → `Ctrl+D` → desfazer 2× →
refazer), com **um** e com **dois** refazeres. A mensagem é sempre:

    /bones/19/name: duplicate bone name "osso"

Nunca `parent cycle through bone`. Pode ser que aquela mensagem apareça com
outro osso ou outro pai — **não foi medido**, e por isso não se afirma nada
sobre ela. O que se afirma é que **quem procurasse `parent cycle` para
reproduzir não acharia**, e poderia concluir que o defeito não existia.

### O que continua SEM MEDIÇÃO, e não virou verde

- **Tocar, Prévia e a grade de trocar imagem** — o relato de 19/09 já os
  deixava de fora, e eu também não os vi. Continuam sem medição.
- **Um guarda que falta, e o comportamento está CERTO hoje:** o conserto do
  defeito 3 **escreve na chave de trás** (reparte a curva dela). Conferi à mão,
  no programa aberto, que desfazer devolve o arquivo idêntico — só o carimbo
  `modified` muda, como em qualquer edição. **Mas isso não está preso por
  teste.** O teste de par da pilha de desfazer (`documento.test.ts`) não tem
  um gesto de *chavear no meio de um trecho com curva*; com ele, um comando
  futuro que esqueça de guardar a chave de trás cairia vermelho sozinho. É
  acréscimo de um gesto na lista, e fica para a próxima rodada — **está aqui
  escrito para não se perder.**
