# Encargo — degrau 11, a casca — 18/09/2026

Escrito pelo **PLANEJADOR · animador-5e**, por ordem do Humberto (*"continue
até terminar"*), depois do fecho da rodada 8/9/10 (v15.8, documentos na v15.9).
**A peça vive neste arquivo.** Quem perder o contexto lê: `CLAUDE.md` ·
`documentos/QUEM E QUEM.md` · `ESTADO.md` · este arquivo · `ARQUITETO 4` (D11) ·
`editor/src/contract.ts` inteiro · `documentos/PARTES.md` · os fechos de
`ENCARGOS degraus 5 6 7` e `ENCARGOS degraus 8 9 10` (as regras aprendidas).

**Linha de base:** v15.9 · suíte 3.278 (3.248 verdes, 29 pulados, 1 vermelho
pré-existente do manual, 15/09, que **não é seu**) · `tsc` limpo · conformidade
71/71 · roteiro 14/14 · medição 26/26 de lado e 19/26 de altura.

## Um chat só, e o Humberto quer VER

A casca é de todo mundo (`shell.ts`, `menus.ts`, `keys.ts`, `layout-model.ts`,
`contract.ts`): não se divide. E este é o degrau que o Humberto pediu para
fazer **vendo** (`AVALIACAO DO DIRETOR` §6; M4). Ele mandou seguir sem parar,
então a regra é esta:

| Regra | |
|:---|:---|
| **Um lote por mudança que ele vê**, na ordem da tabela abaixo. Cada lote fecha **uma versão** | para ele poder dizer *"volta pra 16.2"* e perder só aquilo |
| **Uma foto da tela por lote**, antes e depois, em `backup/fotos-degrau-11/lote-N_antes.png` e `_depois.png`, com linha no `backup/INDICE.md` | é como ele vê sem estar na frente. Use o navegador de prévia (`preview_start` com `editor`) |
| **Nada some sem porta.** O que sai da barra continua alcançável por menu, tecla ou dica; o rodapé diz onde se está | M4, regra 21 |
| **Olhar os três programas antes** (Spriter, Spine, DragonBones) em cada gesto novo de casca, e escrever nos Desvios o que cada um faz | memória do Humberto |
| Botão novo nasce em **ícone**, com o nome na dica. Painel novo precisa da linha em `layout-model.ts`. Campo novo no `RECORTE_editor_state` precisa da linha no `ESTADO_PERMITIDO` do `roteiro-30.mjs`. Ação de menu é **um id**. Tecla nova é uma linha em `ui/keys.ts` | regras aprendidas nas duas rodadas anteriores |
| Você está **sozinho** no editor: pode rodar `npm run roteiro` e `npm run medir` quando quiser, sem pedir porta | não há outro chat gravando |
| Backup da pasta inteira antes do primeiro escrito (`backup/editor-src_2026-09-18_antes-do-degrau-11/`). Versão por lote (`versao.py`, próximo livre), subtítulo no `CHANGELOG.md` acima do mais novo, `montar-programa.py` no fim de cada lote visível | regras 1, 3, 14, 15 |
| **Não toque** em `runtime/`, `runtime-python/`, `formato/`, `site/`, `documentos/manual/` | |
| Dúvida: `SendMessage` a `PLANEJADOR · animador-5e`. **Nunca** painel de pergunta. Enquanto espera, escreva a suposição nos Desvios e siga | regra 23 |

## A ordem do Humberto, na voz dele

> Execute o degrau onze, só ele. A casca: o interruptor sai da barra e o Ctrl Tab sai, o rodapé diz Base, homem, ou Animação, andar; o sistema de trocar as teclas, com a tabela de troca na máquina, a Ajuda mostrando as trocadas e o conflito avisando; colar o painel na quina; arranjos com nome no menu Janela, com os arranjos Pivô e Visualização de fábrica; a tela cheia da Visualização com a lista de animações e as peles dentro, Esc volta; a Janela de Problemas, com consertar onde há conserto; o rascunho que falha avisa, e a janela de recuperar tem os dois botões escritos e Cancelar não apaga; a medição mede o painel cheio. Um lote por mudança, uma versão por lote, uma foto por lote. Reescreva os testes, a contagem não cai. Não toque no runtime. Pare e me mostre.

## As tarefas

| Lote | # | Tarefa | Onde hoje |
|:---:|:---:|:---|:---|
| 1 | 11.1 | **O interruptor sai da barra**; `Ctrl+Tab` sai; o rodapé diz *"Base: homem"* ou *"Animação: andar"*. `EditorMode` sai do contrato; `doc.animation === null` continua sendo a base aberta. O que o interruptor fazia (abrir a base, abrir a animação) já tem porta na janela Animação (D5): confira e diga na dica | `action-bar-model.ts MODE_ITEM`, `viewport-toolbar.ts`, `shell.ts:2213`, `keys.ts`, `contract.ts EditorMode` |
| 2 | 11.2 | **Sistema de trocar as teclas** (G7): tabela de troca **na máquina** (não no `.bone`); `keys.ts` lê dela; Ajuda → Atalhos mostra as trocadas; conflito avisa e não troca em silêncio | `keys.ts`, `menus.ts:872` |
| 3 | 11.3 | **Colar na quina** (C1): o painel arrastado cola nos cantos da cena | `panel-groups.ts`, `shell.ts` |
| 4 | 11.4 | **Arranjos com nome** no menu Janela (C6): guardar, aplicar, apagar; os arranjos **Pivô** e **Visualização** de fábrica | `menus.ts`, `layout-model.ts` |
| 5 | 11.5 | **Tela cheia da Visualização** (C5) com a lista de animações e as peles (a pilha) dentro; `Esc` volta | `preview.ts toggleFullscreen` |
| 6 | 11.6 | **Janela de Problemas** (regra 21 com tela): a barra de avisos abre uma lista; onde há conserto, o botão **consertar** | `warning-model.ts`, `shell.ts` |
| 7 | 11.7 | **A1**: rascunho que falha ao gravar **avisa**; **A2**: a janela de recuperar tem os dois botões escritos e **Cancelar não apaga** | `shell-drop.ts:243`, `main.ts:160` |
| 8 | 11.8 | **A10**: `npm run medir` mede o painel **cheio** (com conteúdo de verdade, não vazio); medir de novo todos os painéis, inclusive Entidades, Pivôs e Peles; o número honesto pode cair, e isso se escreve | `ferramentas/provas/medir-paineis.mjs` |
| — | 11.9 | Testes em `menus`, `teclas`, `acoes`, `colunas-e-barra`, `fronteiras`, e os do roteiro (passos que dependiam do interruptor) | `editor/testes/`, `roteiro-30.mjs` |

## Pronto quando

A barra não tem mais o interruptor e nada ficou sem porta; o rodapé diz onde se
está; trocar uma tecla vale na hora, sobrevive a reabrir o programa e o
conflito avisa; um painel cola na quina; um arranjo com nome se guarda e se
aplica, e Pivô e Visualização existem de fábrica; a tela cheia da Visualização
toca qualquer animação com qualquer pilha e `Esc` volta; a Janela de Problemas
lista os avisos e conserta o que tem conserto; Cancelar na janela de recuperar
não apaga o rascunho; a medição mede painel cheio e o número novo está
escrito, mesmo que seja pior. Suíte sem queda, `tsc` limpo, roteiro 14/14
(reescrito onde dependia do interruptor), `programa/` montado, oito pares de
fotos em `backup/fotos-degrau-11/`. Mensagem curta ao PLANEJADOR com as
versões e os números, e **pare**.

## Desvios e suposições

Pelo executor `EXECUTANDO · a casca`, 18/09/2026. Uma tabela por lote.

### Lote 1 — o interruptor sai (v16.0)

**Os três programas, antes de decidir:**

| Programa | Como diz "onde estou" |
|:---|:---|
| Spine | letreiro `SETUP` / `ANIMATE` no canto da cena, que é botão. É o que o Recorte copiou em 09/09 |
| DragonBones | dois botões no topo, *Armature* e *Animation*, e a linha do tempo some em Armature |
| Spriter | **não tem modo.** A animação aberta é sempre o estado; o nome dela fica escrito na paleta e na barra de título |

Seguimos o Spriter (memória *Spriter primeiro*): sem modo, com o nome escrito. O rodapé é o nosso "título da paleta".

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | O id `alternar-modo` **saiu**; entrou `abrir-a-base` (Animação → Abrir a base), cinza com a base já aberta | Um item "Base ⇄ Animação" seria o interruptor de volta, escondido no menu. A ida (abrir animação) já tem porta: o clique no nome, na janela Animação |
| 2 | O nome do corpo no rodapé é o `skeleton.name`; sem ele, o nome do arquivo **sem `.bone`** | *"Base: homem"*, e não *"Base: homem.bone"* |
| 3 | Com a virada de corpo, o rodapé acrescenta *"Neste instante o corpo é lobisomem"* | M7: a mexida estrutural vai para a base do corpo do instante; o rodapé é onde se lê isso |
| 4 | *"Voltou à montagem"* virou *"Abriu a base"* (`doc/document.ts`, rótulo da mudança) | A palavra Montagem saiu da tela |
| 5 | As cores do rodapé ficaram (calmo na base, laranja na animação). As classes CSS `status-mode-montagem/animando` mantêm o nome | Só a cor; renomear classe não muda nada que ele veja |
| 6 | `ferramentas/provas/fotos-manual.mjs` ainda procura `.viewport-modo-montagem` | É do manual (D13), pausado. **Fica para o D13** |
| 7 | Script novo `ferramentas/provas/foto-da-tela.mjs` (portas 5193 e 9337) | O navegador de prévia não grava PNG em disco; o encargo pede arquivo em `backup/fotos-degrau-11/`. Mesmo molde do `medir-paineis.mjs` |

### Lote 2 — trocar as teclas (v16.1)

**Os três programas** (de memória dos manuais; não abri nenhum dos três):

| Programa | Como troca tecla |
|:---|:---|
| Spine | Settings → Hotkeys abre um **arquivo de texto** (`hotkeys.txt`); edita-se à mão e reinicia. Sem aviso de conflito |
| DragonBones | não troca: a lista é fixa |
| Spriter | lista fixa na ajuda; a versão Pro não tem editor de teclas que eu conheça |

Nenhum dos três é modelo para o que ele pediu (*"a Ajuda mostrando as trocadas e o conflito avisando"*). Segui o pedido à letra: a janela é a própria Ajuda → Atalhos, que ele já conhece.

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | O conflito **recusa** a troca, não oferece "trocar mesmo assim" | *"o conflito avisando"* + regra 21: nunca em silêncio. Para pegar uma tecla ocupada, troca-se a de lá primeiro. Se ele quiser o "tomar a tecla", é um botão a mais |
| 2 | Conflito = mesma tecla, outra ação, **no mesmo lugar ou em toda parte** (ignora o `when`) | A tabela de fábrica deixa `M` ser Malha e marca porque alguém pensou nas duas; a troca à mão não teve esse alguém |
| 3 | **Teclas fixas**: Espaço, setas de andar, 7 8 9 0, P de segurar, Ctrl+Shift+Z, Tocar. Aparecem com a palavra "fixa" | O programa as lê direto do evento, fora da tabela. Deixar trocar seria uma troca que não vale. Passá-las pela tabela é trabalho da cena, não da casca: **ficou de fora** |
| 4 | As teclas de **dentro de janela** (Enter, Esc, setas de `dialog.ts` etc.) continuam fora da tabela | Já era decisão escrita no cabeçalho de `keys.ts` |
| 5 | Só as linhas que aparecem na Ajuda (as que têm `help`) têm lápis: menus, ferramentas e a ordem na cena. As da linha do tempo, Ordem e Árvore **trocam pelo modelo** (testado), mas ainda não têm linha na janela | Elas nunca apareceram na Ajuda; pô-las lá é decisão de conteúdo (a lista dobra de tamanho). **Pergunta para o Humberto** |
| 6 | Chave do navegador: `RECORTE_teclas`. Não é campo do `RECORTE_editor_state`, então não precisa de linha no `ESTADO_PERMITIDO` | Mora na máquina, como `RECORTE_prefs` |
| 7 | A letra que a ferramenta declara (`tool.shortcut`) continua sendo a de fábrica; `toolOfKey` passou a ler a tabela viva | O teste `teclas` já garante que as duas dizem a mesma coisa |

### Lote 3 — colar na quina (v16.2)

**Os três programas e o Photoshop** (de memória; não abri nenhum):

| Programa | Como encaixa painel |
|:---|:---|
| Photoshop | o modelo que ele citou: arrastar a janela até a borda ou quina pinta uma **faixa azul**, e soltar encaixa |
| Spine | as *views* flutuam e encaixam nas bordas de outra view, com destaque antes de soltar |
| DragonBones | painéis fixos; não descola |
| Spriter | paletas que descolam e encaixam nas laterais da janela (Qt), com a área destacada antes de soltar |

Todos os que encaixam **mostram antes de soltar**. É o item 2 do pedido de 13/09, e é o que entrou.

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | "Quina" = as quatro quinas **e as quatro bordas** da **cena** (a caixa do meio), e não da janela do programa | O encargo diz *"cola nos cantos da cena"*; o pedido de 13/09 diz *"encostado numa borda ou quina"*. A camada dos flutuantes cobre também as colunas, então a conta é feita contra a caixa da cena |
| 2 | Colar **só encosta**; o tamanho do painel não muda | *"a janela se adapta"* eu li como "vai para o lugar certo e fica lá quando a tela muda". Esticar o painel até a altura toda da cena seria virar uma terceira coluna — e isso já existe: soltar na tira de abas |
| 3 | A zona é de **24 px**, medida da **borda do painel** | Com o ponteiro como régua, a quina de baixo nunca seria alcançada (a barra de título fica em cima) |
| 4 | A quina é guardada no flutuante (`snap`), junto da arrumação, **na máquina** | Arranjo nunca vai para o `.bone` (régua dos painéis). Não é campo do `RECORTE_editor_state` |
| 5 | **Não criei grupo novo na coluna** ao soltar na borda (o "cria grupo" do `06 casca e paineis`, C1) | A coluna tem dois grupos fixos por lado desde o lote 16 (`ColumnState.groups` é indexado por dois); criar um terceiro mexe em `groupShares`, na alça e na medição. **Ficou de fora**, escrito aqui. Hoje: soltar na tira cola no grupo; soltar na quina cola flutuando |
| 6 | O painel colado cobre o que estiver naquela quina da cena (o controle de zoom, embaixo à direita) | Já era assim com qualquer flutuante; o zoom continua no menu Exibir e na roda do mouse. Se incomodar, a saída é o zoom fugir do painel |

### Lote 4 — arranjos com nome (v16.3)

**Os três programas:**

| Programa | Arranjos de tela |
|:---|:---|
| Spine | **Views → Save view / Load view**, com nome; e os *skeleton view presets*. É o modelo mais perto do pedido |
| DragonBones | não guarda arranjo |
| Spriter | guarda a última tela, sem nome |

Seguimos o Spine no gesto (guardar com nome) e o pedido do Humberto no conteúdo (os dois de fábrica).

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | Os dois de fábrica são **receita** (lista de painéis por grupo), e os guardados são **fotografia** da tela | Receita sobrevive a painel novo; a fotografia é o que a pessoa arrumou, e ela quer aquilo de volta igual |
| 2 | O que o arranjo não cita fica **fechado**, e não sumido | Nada some sem porta: o menu Janela traz de volta |
| 3 | Os dois de fábrica **não mexem na faixa de baixo** neste lote (`dock: false` nos dois; hoje o Visualização não a fecha) — a tela cheia da Visualização é o lote 5 | Um arranjo que fecha a linha do tempo sem avisar assustaria; o lugar de "só olhar" é a tela cheia |
| 4 | Teto de **12** arranjos guardados | Mais que isso não é lista, é gaveta. Avisa em vez de engolir |
| 5 | Um arranjo guardado ganha o id do nome (`arranjo-pintar-pesos`), registrado pela casca quando a lista muda | Ação de menu é um id (regra 17). Os de fábrica têm id fixo e estão na tabela de ações; os guardados não podem estar, porque nascem depois |
| 6 | **Dois consertos fora do pedido**: o menu que rola e o submenu que flutua | Com os arranjos, o menu Janela passou a ter 20 linhas e os últimos itens ficavam fora da tela de 900 px; e uma lista que rola recorta o submenu. Os dois eram porta prometida e não entregue — o mesmo defeito da regra 21 |

### Lote 5 — a tela cheia da Visualização (v16.4)

**Os três programas:**

| Programa | Tela cheia de prévia |
|:---|:---|
| Spine | a *preview view* pode ficar em tela cheia com a lista de animações ao lado; o Spine tem ainda a janela de *playback* separada |
| DragonBones | tem um botão de tela cheia no palco, sem listas |
| Spriter | não tem tela cheia de prévia |

Seguimos o Spine: tela cheia com as listas junto. As peles entram porque foi pedido explícito (Q37).

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | Pôr e tirar pele na tela cheia **não mexe no arquivo**: é uma pilha de teste, e ao sair a Prévia volta a seguir a do documento | *"pôr e tirar peles para testar"*. Testar não pode sujar o personagem — e uma pilha que voltasse diferente sem aviso seria pior |
| 2 | A animação escolhida toca na **camada 0** | É a camada de baixo, a que se olha. As outras três continuam onde estão, para quem já as tinha montado |
| 3 | A lista de peles é a do **corpo do documento**, de cima para baixo (a de cima vence, §4.4) | O mesmo desenho do painel Peles |
| 4 | A tela cheia é a do **navegador** (`requestFullscreen`), como já era | Ela só vale com gesto de quem usa: por isso a foto desta prova clica no botão com o mouse de verdade |
| 5 | O botão continua dizendo **Tela cheia** e a tecla continua **F11** dentro do painel | Nada mudou de porta; o que mudou foi o que vai junto |

### Lote 6 — a Janela de Problemas (v16.5)

**Os três programas** (mais o Spine 4.3, que foi a fonte do pedido):

| Programa | Lista de problemas |
|:---|:---|
| Spine 4.3 | **Problems view**: lista os problemas do esqueleto, com "ir para" e alguns consertos automáticos. É o modelo, e está escrito em `O QUE AINDA NAO TEMOS` A.2 |
| DragonBones | avisos no console do navegador; nada na tela |
| Spriter | uma caixa de erro por vez, ao abrir o arquivo |

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | Os "problemas" são os **avisos da leitura do arquivo** (`doc.warnings`), que é o que já existia | O encargo diz "a barra de avisos abre uma lista". Problemas de outra natureza (osso sem imagem, animação vazia) seriam uma varredura nova, e nem o Spine os junta na mesma lista. **Ficou de fora**, com o motivo |
| 2 | A tira do rodapé **continua**: ela é o sinal | Um sinal que some junto com a janela deixaria o problema invisível até alguém abrir o menu |
| 3 | Os botões viraram **palavra** (o encargo pede "o botão consertar"), ao contrário da barra da cena, onde a regra é ícone com dica | Numa janela não há falta de espaço, e o nome do conserto é justamente o que precisa ser lido antes de clicar |
| 4 | A janela fecha ao consertar e ao Ir para | As duas coisas levam a atenção para outro lugar; deixar a janela por cima do painel que ela acabou de abrir seria atrapalhar |

### Lote 7 — o rascunho e a janela de recuperar (v16.6)

**Os três programas:**

| Programa | Recuperação de trabalho |
|:---|:---|
| Spine | salva `.spine` de recuperação e, ao abrir, pergunta numa janela PRÓPRIA, com os botões escritos |
| DragonBones | recuperação automática, com aviso |
| Spriter | pergunta ao abrir, com botões escritos |

Nenhum dos três usa o `confirm` do navegador (nenhum roda em navegador), e nenhum deles apaga o trabalho no botão de cancelar.

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | **Três** caminhos, e não dois | Com "Cancelar não apaga", sem um "Apagar" escrito o rascunho ficaria para sempre e a pergunta voltaria toda abertura. O terceiro botão é a saída, dita por extenso |
| 2 | Fechar a janela (Esc, clique fora) é **"agora não"** | É o campo `cancelId` da `askChoice`, escrito para o erro do A2 não voltar por outro caminho |
| 3 | O aviso do A1 sai **uma vez** por falha, não a cada gravação | Recado repetido vira ruído. `draftWarned` volta a `false` assim que uma gravação dá certo |
| 4 | O rascunho **quebrado** não é apagado sozinho (era) | Apagar sem pedir é a mesma falha do A2, com outra roupa |
| 5 | O roteiro (passo 14) foi reescrito e **agora prova o A2** | Ele já recusava a janela nativa; agora escolhe "Agora não" na janela nossa e confere que o rascunho continua guardado |
| 6 | A foto do "antes" **não mostra** a janela velha | Ela era do navegador, e o Chrome sem tela não desenha janela nativa. A prova passou a imprimir o texto dela — que é onde se lê o defeito com todas as letras |

### Lote 8 — a medição mede painel cheio (v16.7)

Sem "os três programas" aqui: é prova nossa, não gesto de tela.

| # | Suposição ou desvio | Por quê |
|:---:|:---|:---|
| 1 | A pasta entra pela **Trocar pasta de origem**, e não por *Abrir pasta…* | *Abrir pasta…* abre um projeto novo e leva o herói junto: Árvore, Ordem e Animações ficariam vazias. Uma prova não pode esvaziar um painel para encher outro |
| 2 | A frase só conta como painel vazio quando há **menos de 160 px** de conteúdo | A aba Imagens diz "Nenhuma pasta aberta" na linha da pasta e mostra a grade cheia embaixo: ali a frase é recado |
| 3 | Painel vazio conta como **medição não feita** (soma nos dois números) | Um verde de painel vazio é pior que um vermelho: ele diz que está tudo bem |
| 4 | **Um engano achado no caminho:** o detector lia o primeiro `.painel-corpo` da coluna e dizia *"Imagens mostra Nenhuma entidade"* — o texto do vizinho, debaixo do nome errado. É o mesmo engano que o `detalhar` já tinha tido | Agora ele lê o `.panel-body` daquela aba |
| 5 | Os números **pioraram** e estão escritos: Propriedades 68 → 265 px (1440) e 190 → 387 px (1280); Malha e pesos 445 → 567 px (1440) e 567 → 689 px (1280) | É o painel medido com o que o Humberto de fato vê. A conta de "quantas cabem" ficou em 19 de 26 por coincidência: as medições que eram falso verde passaram a ser de verdade **e cabem** |
