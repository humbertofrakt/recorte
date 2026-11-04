# Encargos da rodada — degraus 5, 6 e 7 — 17/09/2026, noite

Escrito pelo **PLANEJADOR · animador-5e**, por ordem do Humberto, depois do
fecho do degrau 4b (v13.9). **A peça vive neste arquivo; a mensagem é só o
resumo.** Quem perder o contexto lê: `CLAUDE.md` · `documentos/QUEM E QUEM.md`
· `ESTADO.md` · este arquivo · o seu degrau no `ARQUITETO 4` · `editor/src/contract.ts`
inteiro · `documentos/PARTES.md` · `documentos/planos/DEGRAU 4b - o projeto de varios corpos 2026-09-17.md`
(a tabela de suposições dele diz o que sobrou para você).

**Linha de base:** v13.9 · suíte 2.995 (2.965 verdes, 29 pulados, 1 vermelho
pré-existente do manual, 15/09, que **não é seu**) · `tsc` limpo · conformidade
71/71 · roteiro 14/14 · medição 22/22 e 15/22.

## O caminho

```
Chat D5 / D6 / D7  →  PLANEJADOR (animador-5e)  →  Humberto
```

Dúvida sobe por `SendMessage` para `animador-5e`. **Nenhum chat abre painel de
pergunta** (regra 23): escreva a suposição no fim deste arquivo, na seção do
seu chat, e siga. Ao abrir: `ListAgents`, título da janela pela regra 22
(`EXECUTANDO · janela Animação`, `EXECUTANDO · linha do tempo`, `EXECUTANDO ·
cena, árvore e malha`), e a sua linha em `documentos/QUEM E QUEM.md`.

## Os três mexem em `editor/src` ao mesmo tempo: as cercas

| Regra | |
|:---|:---|
| **Cada um na sua parte** (`documentos/PARTES.md`). D5: `panels/animations*`, `panels/palette*` (a parte Imagens e pasta), `io/` só no que a tabela pede. D6: `panels/dopesheet*`, `panels/graph.ts`, `anim/timeline-tools.ts`, `anim/keying.ts`. D7: `viewport/`, `panels/tree*`, `panels/mesh*`, `viewport/tools/`, `commands/create-bone.ts`, `commands/reparent.ts`, `mesh-doc.ts` | fora da sua parte, só arquivo de passagem, e só **acrescentando** |
| **Arquivos de passagem:** `contract.ts`, `main.ts`, `ui/keys.ts`, `ui/actions-table.ts`, `ui/menus.ts` | acrescente a sua linha; nunca reescreva a de outro. Antes de gravar, releia o arquivo do disco (outro chat pode ter gravado há um minuto). `fronteiras.test.ts` e o teste de conflito de teclas julgam |
| **Testes:** durante o lote, só `npx vitest run editor/testes/<os arquivos da sua parte>`. A suíte inteira só no fecho. Vermelho na parte de outro: **não conserte**; mande mensagem ao PLANEJADOR | a contagem nunca cai; teste que prova o modo antigo é reescrito |
| **Portas fixas** (`npm run roteiro`, `npm run medir`): **um de cada vez**. Antes de rodar, mande "vou rodar o roteiro" ao PLANEJADOR e **espere o "pode"**. Quem roda sem pedir pode receber vermelho falso e dar vermelho falso ao vizinho | regra das portas do `QUEM E QUEM.md` |
| **Backup** antes de escrever: pasta inteira do lote, `backup/editor-src_2026-09-17_antes-do-degrau-N/`, linha no `backup/INDICE.md` | regra 1 |
| **Versão** por lote: `python ferramentas/versao.py N.N "..."`, próximo livre no `INDICE.md`; o script recusa repetido. `CHANGELOG.md` com subtítulo. No fecho, `python ferramentas/montar-programa.py` | regras 3, 14, 15 |
| **Onde o programa não entende, ele avisa** (regra 21). Botão sempre com nome na dica; botão novo nasce em ícone | regras 12, 21 e a memória do Humberto |
| Terminou: mensagem curta ao PLANEJADOR (versão, números, o que ficou de fora) e **pare** | regra 7 da rodada anterior |

## Modelos

Os três em **Opus** (o Planejador troca o modelo logo depois do clique).

---

## Chat D5 — A janela Animação (degrau 5)

**A ordem do Humberto, palavra por palavra:**

> Execute o degrau cinco, só ele. A janela Animação: a lista Corpos em cima, Animações do corpo embaixo; clicar no corpo sem animação abre a base. Salvar como base nova. Promover e rebaixar, entidade e corpo. O painel Entidades ao lado do Imagens, com miniatura parada. Reescreva os testes, a contagem não cai. Não toque no runtime. Pare e me mostre.

**Leia:** `ARQUITETO 4` D5 (5.1 a 5.5); `ARQUITETO 3` §1.2, §1.4, §2.2 (M1, M5, M8, M9, M12), §4.2 (E1–E3, E15, E16); `programa-novo/02`; `DEGRAU 4b` suposições 4 e 5 (as listas existem no projeto; a **janela** é sua); spec §2.9, §5.1.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 5.1 | Lista **Corpos** em cima; **Animações do corpo** embaixo. Clicar no corpo sem animação abre a **base** (`doc.animation === null`, o corpo em foco troca) | `panels/animations.ts`, `animations-model.ts`; o projeto e `RECORTE_projeto` do 4b |
| 5.2 | **Salvar como base nova** (M9): corpo novo = cópia do corpo com a pose de `t` gravada como setup (ossos, slots, `attachment` ativo, deform assado em `vertices`); entra em Corpos com o nome pedido; a animação de origem não muda | comando novo em `*-actions.ts` da parte |
| 5.3 | **Promover / rebaixar** entidade ↔ corpo (E2, E3): move de lista; nada muda no dado; abrir a entidade mostra as bases e animações dela | `projeto.ts` do 4b (só acrescentando) |
| 5.4 | Painel **Entidades** ao lado do Imagens (E15), miniatura **parada** (E16): de onde se arrasta para a cena (o soltar em osso é do D7, 7.2; aqui só o painel e o arrasto que sai dele) | `panels/palette*` |
| 5.5 | Testes em `animando`, `previa`, `pasta-do-projeto` | `editor/testes/` |

**Pronto quando:** um projeto de dois corpos mostra os dois em Corpos e as animações de cada um embaixo; clicar no corpo abre a base dele; Salvar como base nova cria o terceiro corpo com a pose de `t`; a entidade promovida aparece em Corpos e o corpo rebaixado em Entidades; o painel Entidades lista as entidades do projeto com miniatura parada; testes da parte sem queda; `tsc` limpo. Versão fechada, mensagem, e para.

---

## Chat D6 — A linha do tempo (degrau 6)

**A ordem do Humberto, palavra por palavra:**

> Execute o degrau seis, só ele. Linha do tempo: Ctrl mais clique soma, Ctrl mais arrastar clona, o Shift sai da seleção; arrastar uma chave move só ela, e confira no Spriter antes; a linha da virada na folha; a faixa da entidade, com o botão direito listando as animações do filho; as linhas slot barra bone e weights; a chave de sequência como opção. Reescreva os testes, a contagem não cai. Não toque no runtime. Pare e me mostre.

**Leia:** `ARQUITETO 4` D6 (6.1 a 6.7); `ARQUITETO 3` §4.2 (E12b, E13, E14), §6, §7, §14 (linha do tempo); `programa-novo/05` (G2, G3, G11, G12); spec §7.11 (a faixa: chave `attachment`, `nested/animation`, `nested/timeScale`), §9.5 (`slot/bone` + `transform`), §9.6 (`weights`), §9.13 (`body`), Apêndice C 1 (o relógio do filho começa na chave); o manual do Spriter, cap. 11, **só para conferir o arrastar de chave** e escrever o achado nos Desvios.

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 6.1 | **Ctrl + clique** soma à seleção; **Ctrl + arrastar** clona; Shift sai da seleção (G2, como o Photoshop) | `dopesheet-pointer.ts:61-67` |
| 6.2 | Arrastar uma chave **move só ela** (G11). **Conferir no Spriter antes** e escrever nos Desvios o que ele faz | `dopesheet-pointer.ts` |
| 6.3 | A **linha da virada**: os losangos da timeline `body`, com o nome do corpo na célula (o comando Colar corpo aqui já existe, do 4b) | folha |
| 6.4 | A **faixa da entidade** (E13, E14): uma linha por slot com anexo `skeleton`; a faixa começa na chave `attachment` que o mostra, estica pelo `nested/timeScale`, mostra o nome da animação; **botão direito** lista as animações do filho e grava `nested/animation` (E12b) | `keying.ts` já tem `nested` como alvo |
| 6.5 | Linha **`slot/bone`** (célula em degrau com o nome do osso) e linha **`weights`** | `keying.ts targetInfo` |
| 6.6 | **Chave de sequência** como opção (G12): "Sequência…" no botão direito do desenho grava a chave `sequence` | `keying.ts` já tem o alvo |
| 6.7 | Testes em `linha-do-tempo`, `chaves`, `tocador`, `eixos-e-chaves` | `editor/testes/` |

**Pronto quando:** as três teclas fazem o que a tabela diz; a chave arrastada move só ela (ou o que o Spriter faz, escrito); a animação `transformar` de um projeto de dois corpos mostra a linha da virada com o nome do lobisomem; uma entidade solta em `t` mostra a faixa começando em `t`, e o botão direito troca a animação dela; as linhas `slot/bone` e `weights` aparecem quando há chave; testes da parte sem queda; `tsc` limpo. Versão fechada, mensagem, e para.

---

## Chat D7 — Cena · Árvore · Malha e pivô (degrau 7)

**A ordem do Humberto, palavra por palavra:**

> Execute o degrau sete, só ele. Cena, Árvore, Malha e pivô: B cria osso, Y posa, N livre; pendurar cria tomada; o desenho troca de osso por chave, com transform, no Virar filho, e o gesto é um passo de desfazer só; a ferramenta Malha pega caixa, máscara e caminho; botão direito com uma porta no menu; Chavear pesos na aba Malha e pesos; a forma e os pesos vão para a base do corpo do instante, e teste ao vivo gerar malha no meio. Reescreva os testes, a contagem não cai. Não toque no runtime. Pare e me mostre.

**Leia:** `ARQUITETO 4` D7 (7.1 a 7.8); `ARQUITETO 3` §2.2 (M7), §4.2 (E9), §6 (o desenho troca de osso), §7 (Chavear pesos); `programa-novo/05` (G1), `03`; spec §9.5 (`slot/bone` + `transform`: **T depois R**, C-295), §9.6 (`weights`, só por Chavear pesos, A5), §7.11; `DEGRAU 4b` suposição 9 (a chave de pai com a virada é sua) e o desvio 1 do Chat C da rodada anterior (`ENCARGOS degraus 2 3 4a`, seção Chat C: **dois passos de desfazer** que têm de virar um).

| # | Tarefa | Onde hoje |
|:---:|:---|:---|
| 7.1 | **B cria osso, Y posa, N livre** (G1); o `Alt` de redesenhar osso e de inclinar continua | `ui/keys.ts:127-128` (só acrescentando); o teste de conflito julga |
| 7.2 | **Pendurar cria tomada** (E9): soltar uma entidade num osso cria slot + anexo `skeleton`, como soltar imagem (lote 57), com chave `attachment` em `t` e `null` em 0 quando a animação está aberta. A raiz do filho cai no **pivô** da imagem (E7): `x, y` do anexo | `viewport.ts onDrop`, `palette-model.ts DropImageAsSlot` |
| 7.3 | **O desenho troca de osso por chave** (F8): `runReparent` caminho 2, com desenho na seleção e animação aberta, grava `slot/bone` com `transform` (a posição do anexo medida do osso novo, para não saltar); `drawingsLeftOut` sai; **um passo de desfazer** | `reparent.ts:739-800` |
| 7.4 | **A ferramenta Malha pega caixa, máscara e caminho** (A3) | `mesh-tool.ts`, `properties-model.ts:798, 828` |
| 7.5 | **Botão direito com uma porta no menu** (A7) | `viewport.ts:1132-1146` |
| 7.6 | **Chavear pesos** na aba Malha e pesos (F9): botão em ícone com nome na dica; grava a chave `weights` com todos os pesos do `binding`, soma 1; pintar continua indo para a base (A5) | `mesh-panel.ts`, `mesh-doc.ts` |
| 7.7 | M7 na malha: a forma e os pesos vão para a base do **corpo do instante**; **testar ao vivo** "gerar malha no meio" da animação, e o que acontece com uma chave `deform` antiga (o desvio 3 do Chat C: escreva o que viu) | `mesh-doc.ts` |
| 7.8 | Testes em `cena`, `cena-selecao`, `ferramentas`, `arvore`, `malha` | `editor/testes/` |

**Pronto quando:** `B` cria osso em qualquer estado, `Y` posa, `N` fica livre; soltar uma entidade num osso cria a tomada e a faixa aparece na linha do tempo (a faixa é do D6; aqui basta a chave `attachment` gravada); com animação aberta, Virar filho com um desenho grava `slot/bone` com `transform` e o desenho **não salta**, num desfazer só; Chavear pesos grava a chave e a barra diz; gerar malha no meio vai para a base do corpo do instante e a barra diz para qual; testes da parte sem queda; `tsc` limpo. Versão fechada, mensagem, e para.

---

## Desvios e suposições (cada chat escreve na sua)

### Chat D5

Escritas pelo executor `EXECUTANDO · janela Animação`, no fecho do degrau 5
(v14.3 e v14.4).

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | **O foco troca o CONTEÚDO do documento, não o objeto.** Os dois `Doc` trocam de arquivo, atlas, ator, agulha e caminho; quem ouve, a pilha e o projeto ficam (`Doc.trocarCorpoCom`, `Projeto.trocarFoco`) | A cena, os painéis e a casca seguram UM objeto `Doc` desde o arranque (`main.ts`). Trocar o objeto seria remontar o programa inteiro, e isso não cabia nesta tabela |
| 2 | **A pilha passou a anotar o uri, e não só o objeto** (`UndoStack.ownerUris`, `resolveByUri`) | Consequência exata do desvio 1, e ela **tinha** de ser tratada: o passo dado no homem, desfeito depois de trocar para o lobisomem, procuraria os ossos do homem dentro do lobisomem — e um `revert` que não acha o que removeu não avisa nada, só não desfaz. Fora da minha parte, mas só acrescentando: `push` ganhou um terceiro argumento opcional, e sem projeto nada disso é escrito |
| 3 | **Salvar como base nova não é passo de desfazer** | Um corpo novo é um arquivo a mais no projeto, como Abrir — não uma mexida num arquivo. O `Command` do contrato muda `doc.file`; pôr e tirar corpo do projeto não é isso. O rodapé diz o que fez, e quem se arrependeu rebaixa o corpo a entidade sem perder nada (regra 21) |
| 4 | **A base nova leva as animações do corpo de origem** | O pedido é *"cópia do corpo"*. Apagá-las seria decidir por quem clicou, e é a decisão irreversível das duas: elas passam a herdar a base nova (M3), e o rodapé diz quantas vieram. **Se o Humberto quiser o contrário, é uma linha** |
| 5 | **O que é assado na base nova:** ossos (as sete propriedades locais), `attachment` do slot, `color` do slot, e o `deform` somado em `vertices` (malha solta) ou em `binding.positions` (malha com pesos) | A tabela 5.2 cita *"ossos, slots, attachment ativo, deform assado em vertices"*. A cor do slot entrou junto porque ela é pose e sai da mesma leitura. **Não** são assados: `drawOrder` (a ordem é do arquivo, e a chave é da animação), `weights` (9.6, do D7) e `parent` (9.4) — os três mudariam o formato do corpo, não a pose dele |
| 6 | **Uma entidade que veio montada dentro de outro `.bone` não é promovida** | Ela é uma `SkeletonData` montada, não um `.bone` que se possa abrir e editar. O painel tenta ler o arquivo da raiz da pasta do projeto; sem pasta, ou sem o arquivo lá, ele **recusa com a frase**, em vez de pôr em Corpos um corpo que não abre (regra 21). Resolver o uri por `assets.skeletonsBase` continua sendo do D10, como o 4b já dizia (desvio 1 dele) |
| 7 | **Rebaixar guarda o `Doc` inteiro** (`Projeto.guardados`), e promover de volta é instantâneo | *"Move de lista; nada muda no dado"*. Fechar o arquivo perderia o que não foi salvo. Enquanto ele está rebaixado, uma chave `body` que o cite avisa `BODY_MISSING` — o que é a verdade: ele deixou de ser corpo |
| 8 | **O corpo em foco não se rebaixa, nem o único corpo do projeto** | Rebaixar o foco deixaria a cena sem corpo. A barra diz *"abra outro corpo antes"*, em vez de não fazer nada |
| 9 | **Clicar num corpo sempre abre a BASE**, mesmo no corpo que já está em foco | É o que o clique promete, palavra por palavra. O corpo que sai guarda a animação e o segundo em que estava; ao voltar, a base abre e a agulha vai a zero. Quem quer a animação de volta clica nela, que é a lista de baixo |
| 10 | **A tira de seção não gruda no topo** | Lote 48, prova `acabamento`: cabeçalho fixo tapa a primeira linha do painel. A primeira versão desta tira usava `sticky` e o vermelho apareceu na hora |
| 11 | **Promover a corpo mora no botão direito da linha**, sem botão na tira | É a mesma convenção da aba Imagens, onde Duplicar no atlas e Definir pivô já moram no botão direito. Não há seleção nessa grade, e um botão de tira precisaria de uma |
| 12 | **O arrasto da entidade tem tipo próprio** (`text/x-recorte-entidade`) | Quem recebe precisa saber no `dragover` se o que vem é imagem ou corpo inteiro; descobrir só no `drop` deixa o cursor mentindo o caminho todo. **O soltar é do D7 (7.2)**: daqui sai só o arrasto |
| 13 | **`editor/testes/acoes.test.ts` teve o número subido de 181 para 182** | O painel Entidades entra no menu Janela, e todo painel do menu é uma ação da casca. O vermelho foi meu, não de outro chat; a linha do porquê está no arquivo, ao lado das outras |

| 14 | **O painel novo precisou de uma linha no `RIGHT_GROUPS` do `ui/layout-model.ts`** | Achado pela medição, e era defeito de verdade: ela contou **11 abas onde deviam ser 12**. A arrumação de fábrica não é a do `panel-groups.ts` — é o `RIGHT_GROUPS`, e o `columnFrom` só deixa passar o id escrito lá. Sem essa linha o painel existia no menu Janela e **não nascia na coluna**: uma porta prometida e não entregue, e a prova nem o media. É a regra 21 pela terceira cara, a que engana a nós. **Para a próxima rodada: painel novo precisa dessa linha.** Três testes que fixavam o conteúdo exato daquele grupo passaram a dizer a verdade nova |
| 15 | **O `versao.py` deixou a v14.4 existir duas vezes** | Ele só recusa repetido quando o NOME do arquivo bate, e o nome leva a data: `recorte v14.4 2026-09-17.zip` (D6) e `recorte v14.4 2026-09-18.zip` (meu). Passou da meia-noite e o número escapou pela porta da data. Apaguei o meu, tirei a linha do `INDICE.md` e regravei como **v14.5**. Avisado ao PLANEJADOR; não mexi no script, que não é minha parte |

**Vermelho que não é meu, avisado ao PLANEJADOR:** `arquivo.test.ts` e
`animando.test.ts`, *"N escolhe Criar osso"* — a tarefa 7.1 do D7 (B cria osso,
N livre). **Os dois já estavam verdes no meu fecho:** o D7 os reescreveu
enquanto eu trabalhava. O roteiro passou pela mesma coisa: deu 11 de 14 na
primeira volta (passos 5, 10 e 11, o `roteiro-30.mjs:530`) e **14 de 14** na
segunda, depois de o D7 consertar o roteiro. O vermelho do manual (15/09)
continua onde estava, e é o único.

**Números do fecho:** suíte inteira **3.119** (3.089 verdes, 29 pulados, 1
vermelho antigo do manual) · `npx tsc --noEmit -p editor/tsconfig.json` limpo ·
conformidade **71 de 71** (nada no runtime foi tocado) · `npm run roteiro`
**14 de 14** · `npm run medir` **24 de 24** de lado e **17 de 24** de altura
(duas medições novas, e as duas cabem) · `programa/` montado.

**Ficou de fora:** nada da tabela 5.1 a 5.5.

### Chat D6

#### 1. O que o Spriter faz ao arrastar uma chave — conferido antes de mexer (6.2)

Fonte, duas, e as duas de dentro da casa (a regra 9 do projeto: não perguntar
ao Humberto o que o arquivo já responde):

| Onde | O que diz |
|:---|:---|
| `documentos/pesquisa/nova pesquisa/spriter/Spriter - todas as funcoes 2026-09-08.md`, cap. 11 *Editing Timing* | *"arrastar quadro-chave; **Ctrl para pegar vários**"* |
| `documentos/planos/O QUE O SPRITER TEM E NOS FALTA 2026-09-14.md`, linha 84 | *"Ctrl + clique pega vários quadros-chave **para arrastar juntos**"*, e anota que o Recorte usava Shift |

**O Spriter não empurra as chaves seguintes.** Arrastar move a chave arrastada;
com `Ctrl` se pegam várias, e as várias **andam juntas**. Não há modo `ripple`
em lugar nenhum do manual.

**O Recorte também não empurra**, e não empurra desde sempre: a `rippleMove` de
`anim/keying.ts` só tem porta por comando (**Animação → Empurrar as chaves…**,
v13.1), nunca pelo arrasto. O medo que gerou o G11 — *"nada de empurrar as
seguintes"* — **já estava atendido antes deste degrau**.

**Decisão, e é seguir o Spriter:** arrastar move as chaves **escolhidas**, que
são uma só quando uma só está escolhida. Não se acrescenta ripple no arrasto, e
o teste novo `arrastar nunca empurra as chaves seguintes` fecha essa porta para
quem vier depois. O que muda de verdade neste degrau é **qual tecla escolhe** —
6.1 —, e aí o Spriter e o Humberto dizem a mesma coisa: `Ctrl`.

Para o gesto deixar de ser adivinhação (regra 21), a dica do losango passa a
dizer o que o arrasto leva: *"Arrastar move as escolhidas"*.

#### 2. Suposições escritas, sem travar o lote

| # | Onde | A suposição | Por quê |
|:---:|:---|:---|:---|
| 1 | 6.1, `Ctrl` + clique numa chave **que já está** escolhida | **soma** quer dizer soma, não alterna: ela continua escolhida | A ordem do Humberto diz *"Ctrl mais clique soma"*, e quem tira é o `Shift`. Alternar daria duas teclas para o mesmo gesto e nenhuma para tirar |
| 2 | 6.1, `Shift` + clique | tira da seleção e **não** começa arrasto | Tirar não é pegar. Um arrasto que começa tirando moveria justamente o que se acabou de soltar |
| 3 | 6.1, o retângulo de laço em faixa vazia | a mesma regra: `Ctrl` soma ao que havia, `Shift` tira, sem tecla troca | O laço é o mesmo gesto de escolher, em atacado |
| 4 | 6.3, o nome do corpo na célula | o `value` da chave `body` é um uri (`lobisomem.bone`); a célula escreve **o nome do arquivo sem pasta e sem extensão**, e a dica mostra o uri inteiro | O nome bonito (`skeleton.name`) mora no `Doc` do outro corpo, e a folha é um módulo puro. Uri inteiro na célula não cabe; uri escondido seria a folha calando o que ela sabe |
| 5 | 6.4, a animação que a faixa mostra | a precedência de 7.11 **até a fonte 3**: chave `nested/animation`, depois `attachment.animation`, depois *(setup)*. `inheritAnimation` (fonte 2) fica de fora da tela, e a faixa escreve *"pelo pai"* quando ele está ligado | A fonte 2 depende de qual animação o **pai** está tocando, que não é um dado da faixa. Escrever um nome que pode não ser o que toca seria improvisar (regra 21) |
| 6 | 6.4, quando a faixa acaba | na primeira chave `slot/attachment` que deixa de mostrar aquele anexo, ou no fim da animação | Apêndice C 16: a instância some quando o slot deixa de mostrar a entidade |
| 7 | 6.4, o botão direito | lista as animações do filho lidas de `doc.skeletons` (as entidades aninhadas que o documento abriu), mais **(nenhuma)** = `nested/animation` com `null`. Filho que o editor não abriu: a lista diz que não o encontrou, e não oferece nada | Regra 21. Um menu vazio e mudo faria pensar que a entidade não tem animação |
| 8 | 6.6, a porta da chave de sequência | **botão direito no nome da linha Desenho** do slot, item *"Sequência…"*. Só aparece quando o anexo ativo tem `sequence` (7.10); sem ele, o item diz por que está cinza | O encargo diz *"no botão direito do desenho"*; na linha do tempo, o desenho é a linha `slot/attachment`. O botão direito na cena é do Chat D7 |
| 9 | 6.5, `weights` | `normalizeTarget` e `createTimeline` passam a tratar `weights` como `deform`: endereço de três partes (`slot`, `skin`, `attachment`), `skin` padrão `default` | Spec 9.6: *"o mesmo endereço de três partes do `deform`"`. Nenhuma timeline `weights` existe hoje no editor, então nada antigo muda de endereço |
| 10 | 6.3 e 6.5, as células em degrau | ganham célula com texto as linhas `body`, `slot/bone` e `nested/animation`. A linha **Desenho** (`slot/attachment`) fica como está, em losangos | O encargo cita as três primeiras. Mexer na linha Desenho é mexer no que o Chat D7 está gravando com a chave `attachment` |

#### 3. O que ficou de fora, e por quê — fecho, 17/09/2026, 19:10

O degrau 6 saiu inteiro: 6.1 a 6.7, nada adiado. O que segue é o que **não**
entrou de propósito, e o vermelho que é de outro chat.

| O quê | Por quê |
|:---|:---|
| A linha **Desenho** (`slot/attachment`) continua em losangos, sem célula com nome | O Chat D7 está gravando a chave `attachment` nesse mesmo caminho (7.2 e 7.3). A célula ali é meia hora de trabalho e uma briga de arquivo; fica para quem tomar a linha Desenho depois |
| `nested/time` (9.9) não aparece na faixa | A faixa mostra **qual** animação e **quão rápido** (E13). `nested/time` é scrub — dirigir o tempo do filho quadro a quadro —, e desenhá-lo é uma curva, não uma faixa: é do painel Curvas, não da folha |
| `baseAnimation` (o fundo em laço de 7.11) não aparece na faixa | Ela roda **sempre**, por baixo de tudo, e não tem começo nem fim dentro desta animação. Uma faixa de ponta a ponta em toda entidade que tivesse fundo só encheria a folha |
| O gesto de **arrastar a faixa** (mover a `origin`) e de **esticá-la** (o `timeScale` pelo punho) | O encargo pede a faixa e o botão direito (E13, E14, E12b); arrastar a origem é mexer na chave `attachment`, que é do D7 nesta rodada. A porta existe: a chave se move pelo losango da linha Desenho, como qualquer outra |

**O vermelho que não é meu, e que ficou:** `npm run roteiro` deu **11 de 14**.
Os passos 5, 10 e 11 caem porque o roteiro aperta **`N`** para criar osso
(`ferramentas/provas/roteiro-30.mjs:530`) e a tecla virou **`B`** na tarefa 7.1
do Chat D7 (`editor/src/ui/keys.ts:130-131`, gravado às 18:38). O 5 falha
sozinho; o 10 e o 11 caem em cascata, porque sem osso não há tronco para girar.
**É uma linha no roteiro, e ela é do D7**, que trocou a tecla. Avisado ao
PLANEJADOR. O mesmo vale por dois testes: `arquivo.test.ts` (*"N escolhe Criar
osso"*) e `chaves.test.ts:1023` (*"seleção mista"*, que a tarefa 7.3 mudou de
propósito).

**Medição igual à linha de base:** 22 de 22 de lado, 15 de 22 de altura. A
célula em degrau e a faixa vivem **dentro** da faixa de chaves, que já existia:
nenhuma das duas acrescenta altura a painel nenhum.

### Chat D7

Escrito pelo Chat D7 (`EXECUTANDO · cena, árvore e malha`), 17 e 18/09/2026.
Dois lotes: **v14.1** (7.1, 7.4, 7.5) e **v14.2** (7.2, 7.3, 7.6, 7.7).

**Desvios do encargo e suposições**

| # | Desvio ou suposição | Por quê |
|:---:|:---|:---|
| 1 | A tabela do encargo manda `ui/keys.ts` "só acrescentando", mas a 7.1 **troca duas linhas** dela (`tool('b','pose')` e `tool('n','create-bone')`). Troquei as duas, e mais a tecla que cada ferramenta declara | Não há como o `N` ficar livre acrescentando. As duas linhas são de ferramenta, e nenhum dos outros dois chats mexe em ferramenta; o teste de conflito e o `teclas` julgam, e passaram |
| 2 | A numeração dos desvios do Chat C no encargo está **deslocada em dois**: o "dois passos de desfazer que têm de virar um" é o desvio **4** (não o 1), e a chave `deform` velha é o desvio **5** (não o 3) | Conferido no `ENCARGOS degraus 2 3 4a`, seção Chat C. Fechei os dois pelo conteúdo, não pelo número |
| 3 | **Caminho: arrasta, mas não ganha nem perde âncora.** Os pontos vêm de três em três (entra, âncora, sai) e o `lengths` teria de ser refeito com a curva nova. Arrastar vale, e refaz o `lengths` sozinho; criar e apagar **dizem a frase** e não fazem | Regra 21. Criar âncora é gesto próprio, com alça de Bézier, e não estava na tabela 7. `PATH_VERTEX_NOTICE` é a porta que falta, escrita |
| 4 | **Caixa em retângulo e em elipse ficam de fora da Malha**, com frase: elas não têm cantos, têm centro e tamanho (§7.6), e quem os edita é a ficha | Deixar a Malha "pegar" uma elipse seria prometer um arrasto que não existe |
| 5 | **Gerar automática e Traçar contorno não aparecem** para caixa, máscara e caminho | Os três não têm imagem para traçar. O botão sumir é mais honesto que o botão recusar |
| 6 | O `deform` velho **não é impedido nem convertido**: a mudança de forma acontece, e o rodapé conta quantas chaves, de quais animações, e o que vai acontecer com elas | Impedir tiraria a liberdade que o Humberto pediu; converter seria o editor adivinhar em qual vértice cada número velho queria cair. Desvio 5 do Chat C |
| 7 | A 7.3 vale também **só com desenho na seleção** (caminho 2b), e não apenas junto com osso | *"o desenho troca de osso por chave"* não muda de sentido porque não há osso escolhido. Sem isso, o mesmo gesto gravaria na base num caso e chave no outro |
| 8 | O `transform` é medido do `boneMatrix` do slot, e não do osso cru | Quando o slot já está sob uma chave `slot/bone`, o desenho está onde o `transform` daquela chave o pôs. Medir do osso cru faria a segunda troca saltar |
| 9 | O `transform` de §9.5 **não tem inclinação**. Com ossos de inclinações diferentes, o desenho entorta um pouco, e o rodapé diz | Mesmo limite do `Reparent` de sempre, que já dizia o mesmo para escalas diferentes |
| 10 | **Duas asserções em arquivo de outro chat** foram reescritas, a pedido do PLANEJADOR: a tecla do Criar osso em `animando.test.ts` (D5) e o *"seleção mista"* de `chaves.test.ts` (D6) | As duas provavam o modo antigo e caíram com a 7.1 e a 7.3. Só elas, relendo o arquivo do disco antes de gravar |
| 11 | A contagem de ações em `acoes.test.ts` subiu de 179 para **181** | As duas portas do botão direito (7.5). É número de ação de menu, não de teste |
| 12 | O **arrasto** da entidade (7.2) foi provado por teste, não na tela | O painel Entidades, de onde ela sai, é do D5 (5.4). O alvo do arrasto e o comando são meus e estão prontos: quando o painel existir, `ENTITY_DRAG_TYPE` é o único combinado entre os dois |
| 13 | `panels/properties-model.ts` teve **duas frases** trocadas (as dos cantos da caixa e da máscara) | A tabela 7.4 cita esse arquivo nessas duas linhas. A frase mandava para uma porta fechada; agora a porta existe, e a dica diz a tecla |
| 14 | `ui/icons.ts` ganhou o ícone `key-weights` | Regra 12 e a memória do Humberto: botão novo nasce em ícone. Nenhum outro chat mexe em ícone nesta rodada |

**O teste ao vivo de "gerar malha no meio" (7.7)**

No herói, com a animação `walk` aberta em 0,50 s, escolhido o desenho `face`
(uma malha), **Gerar automática** respondeu:

> Malha nova: 35 vértices, 56 triângulos (foi para a base). Atenção: 3 chaves
> de deformação de "idle" foram gravadas na forma de antes e agora caem em
> outros vértices.

O que se viu, ponto a ponto:

| O quê | O que aconteceu |
|:---|:---|
| Onde a forma foi parar | Na **base**, não na animação aberta, e o rodapé diz. Com a virada de corpo, diz de qual corpo (`wentToBase`, degrau 4b) |
| A chave `deform` antiga | **Continua lá, com os números de antes.** §9.6 manda o leitor expandir para o tamanho novo e completar com zeros: o arquivo não quebra, mas os números caem em outros vértices, e a malha se mexe na parte errada do desenho |
| O que o programa faz com isso | **Conta.** Quantas chaves, de qual animação, e o que vai acontecer. Não impede e não converte |

Também conferido na tela: a barra diz **Criar osso (B)** e **Posar (Y)**; a aba
Malha e pesos abre a caixa `hitbox` (4 cantos), a máscara `mask` (4) e o
caminho `cape_path` (9 pontos), sem os botões de traçar pela imagem; e os dois
itens novos aparecem em **Exibir → Ferramenta de antes** e em **Esqueleto →
Opções do desenho…**.

---

## Fecho da rodada — 18/09/2026, madrugada, pelo PLANEJADOR

| Chat | Versões | Números do fecho dele |
|:---|:---:|:---|
| D6, linha do tempo | v14.0, v14.2, v14.4 | suíte 3.118; medição igual; roteiro 11/14 na hora (o N→B do D7, consertado em seguida) |
| D5, janela Animação | v14.3, v14.5 | roteiro 14/14; medição 24/24 e 17/24 (achou o painel que não nascia na coluna); suíte 3.119 |
| D7, cena, árvore e malha | v14.1, v14.6 | roteiro 14/14; medição 24/24 e 17/24; suíte 3.119; `programa/` montado |
| Planejador | v14.7 | conferido de novo com os três parados: suíte 3.119 (1 vermelho, o do manual), `tsc` limpo, 71/71, roteiro 14/14, medição 24/24 e 17/24 |

**Regras novas para as próximas rodadas** (aprendidas aqui):

| # | Regra | De onde veio |
|:---:|:---|:---|
| 1 | **Painel novo precisa de uma linha em `layout-model.ts` (`RIGHT_GROUPS`)**, senão a prova de medição não o mede e ele não nasce na coluna | D5, pela medição que contou 11 onde deviam ser 12 |
| 2 | **O número da versão é recusado em qualquer data**: `versao.py` corrigido depois de a v14.4 nascer duas vezes na virada da meia-noite | D5 |
| 3 | Uma asserção que prova comportamento de outro chat, mesmo num arquivo de teste seu, **é do outro chat**: ele reescreve só ela, relendo o arquivo antes | os quatro avisos de cerca desta rodada |
| 4 | A fila das portas funciona, mas a mensagem ao Planejador pode ficar presa na fila da janela que a mandou: quem espera o "pode" e não recebe em minutos manda de novo pelo canal por onde falou | D5, que esperou três "pode" |

**Próximo:** D8 ∥ D9 ∥ D10, só com a palavra do Humberto.
